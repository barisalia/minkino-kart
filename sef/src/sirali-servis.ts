import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {icinde,jest,type Nokta} from './hareket';
import {lokmaSun} from './restoran-tadim';
import type {Parca} from './tepsi-fisleri';
import './sirali-servis.css';

interface Sofra {
  sira: readonly Parca[];
  istenen:(p:Parca)=>HTMLElement;
  hazirlanan:(p:Parca)=>HTMLElement;
  adi:(p:Parca,hazir:boolean)=>string;
  puani:(p:Parca)=>number;
  kaydet:(evre:1)=>void;
  tadildi:(p:Parca,tabak:HTMLElement)=>void;
  hatali:()=>void;
  bitir:()=>void;
  geri:()=>void;
}
// Müşterinin düşünce balonunda istediği sıradaki tabak görünür. Çocuğun
// elindeki tabaklar kendi hazırladığı ve süslediği gerçek porsiyonlardır.
export function siraliServis(sahne:HTMLElement,ilk:0|1,sofra:Sofra){
  const alan=h('section.sirali-servis',{'aria-label':'Ana yemek ve tatlı servisi'});
  const balon=h('span.sirali-istek',{role:'img'});
  const tabakGozu=()=>h('i.sirali-porselen');
  const yer=dugme('Misafirin servis tabağı','sirali-yer',tabakGozu());
  const tepsi=h('div.sirali-tepsi');
  const don=dugme('Tepsiye geri dön','sirali-geri',ikon('geri'));
  let evre:number=ilk,oynuyor=false;
  let elde:HTMLButtonElement|null=null;
  const kartlar=new Map<Parca,HTMLButtonElement>();
  function hedefte(n:Nokta){
    const yuz=sahne.querySelector('.salon-figur:not(.salon-arkadas) .salon-yuzune-dokun');
    return icinde(yer,n,8)||!!(yuz&&icinde(yuz,n,6));
  }
  function geriKoy(){
    if(elde){elde.style.translate='';delete elde.dataset.elde;elde=null;}
    delete yer.dataset.birak;
  }
  function guncelle(){
    const p=sofra.sira[evre];
    alan.dataset.evre=String(evre);
    balon.replaceChildren(sofra.istenen(p));
    balon.setAttribute('aria-label','Şimdi '+sofra.adi(p,false));
    for(const [p,dugme] of kartlar)dugme.hidden=sofra.sira.indexOf(p)<evre;
  }
  function sun(p:Parca){
    if(oynuyor||!alan.isConnected)return;
    geriKoy();
    const yanlis=sofra.sira[evre]!==p;
    oynuyor=true;alan.dataset.sonuc=yanlis?'yanlis':'tadiyor';don.disabled=true;
    kartlar.get(p)!.hidden=true;
    yer.replaceChildren(sofra.hazirlanan(p));
    lokmaSun(sahne,yer,p,yanlis?1:sofra.puani(p),()=>{
      if(!alan.isConnected)return;
      sofra.tadildi(p,yer);
      if(yanlis){sofra.hatali();return;}
      evre++;
      if(evre===sofra.sira.length){sofra.bitir();return;}
      sofra.kaydet(1);yer.replaceChildren(tabakGozu());
      oynuyor=false;don.disabled=false;delete yer.dataset.tukendi;delete yer.dataset.lokmaAdedi;
      alan.dataset.sonuc='siradaki';guncelle();
    });
  }
  for(const p of [...sofra.sira].reverse()){
    const b=dugme(sofra.adi(p,true)+' sun','sirali-tabak',sofra.hazirlanan(p));
    b.dataset.yemek=p;tepsi.append(b);kartlar.set(p,b);
    jest(b,{tasi:(son,ilk)=>{
      if(oynuyor||(elde&&elde!==b))return;
      if(!elde&&Math.hypot(son.x-ilk.x,son.y-ilk.y)<5)return;
      elde=b;
      b.dataset.elde='true';b.style.translate=(son.x-ilk.x)+'px '+(son.y-ilk.y)+'px';
      yer.dataset.birak=hedefte(son)?'burada':'hazir';
    },birak:(son,_ilk,tik)=>{
      if(elde&&elde!==b)return;
      geriKoy();
      if(tik||hedefte(son))sun(p);
    },iptal:()=>{if(elde===b)geriKoy();},klavye:()=>sun(p)});
  }
  yer.onclick=()=>balon.animate([{scale:1},{scale:1.12},{scale:1}],{duration:280});
  don.onclick=()=>{if(!oynuyor)sofra.geri();};
  guncelle();alan.append(balon,yer,tepsi,don);sahne.append(alan);
}
