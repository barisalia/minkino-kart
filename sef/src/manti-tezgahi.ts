import metin from './manti-replikleri.json';
import {pisirmeSaati} from './pisirme-saati';
import {h} from '../../src/ui/dom';
import {ikon,dugme,resim} from './gorsel';
import {jest,icinde} from './hareket';
import {efekt} from '../../src/audio/efekt';
import {lokmaninSosu,mantiSosunuSec,mantiyiSosla,mantiIsimleri,mantiIstegi,mantiKivami,mantiOku,yeniManti,type Manti,type MantiSosu} from './manti-tarifi';
import './manti.css';

const dosyalar=import.meta.glob<string>('../../assets/sef/manti/*.webp',{eager:true,import:'default',query:'?url'});
export const mantiResmi=(id:string,stil='')=>h('img',{src:dosyalar['../../assets/sef/manti/'+(id==='havuc'?'ici':id)+'.webp'],class:stil,alt:'',draggable:false});
const katlar=['hamur','kat-bir','kat-iki','kat-uc','kapali'];
const yerler=[[30,42],[68,42],[51,70]];
const suzgecYerleri=[[36,33],[64,35],[50,52]];
const suzgecResmi=new URL('../../assets/sef/makarna/suzgec.webp',import.meta.url).href;
const koseler=[[.12,.12],[.88,.12],[.88,.88],[.12,.88]];
export function mantiSunumu(t:Pick<Manti,'sos'|'soslar'|'tabakta'|'lokmaSoslari'>){
  const tabak=h('span.manti-sunum',{},mantiResmi('tabak','manti-tabak'));
  for(const i of t.tabakta){
    const lokma=h('span.manti-lokma',{'data-no':i,style:'left:'+yerler[i][0]+'%;top:'+yerler[i][1]+'%'},mantiResmi('kapali'));
    const sos=lokmaninSosu(t,i);
    if(sos){lokma.dataset.sos=sos;lokma.append(mantiResmi(sos,'manti-ust-sos'));}
    tabak.append(lokma);
  }
  return tabak;
}
export function mantiOrnegi(id:string){return mantiSunumu({...mantiIstegi(id),tabakta:[0,1,2],soslar:[0,1,2]});}
interface Ayar{taslak?:Manti;kaydet:(t:Manti)=>void;teslim:(t:Manti)=>void;geri:()=>void;sesli:()=>boolean;soyle:(s:string)=>void}
export function mantiTezgahi(id:string,a:Ayar){
  const hedef=mantiIstegi(id),t=mantiOku(a.taslak)??yeniManti();
  const sahne=h('section.manti-tezgahi',{'aria-label':'Mantı sofrası'});
  const saat=pisirmeSaati();
  let teslimEdildi=false;
  const kaydet=()=>a.kaydet(t);
  const ses=()=>{if(a.sesli())efekt.yapis();};
  const dur=saat.dur;
  const geri=dugme('Sipariş tepsisine dön','manti-geri',ikon('geri'));geri.onclick=()=>{dur();kaydet();a.geri();};
  const fis=h('div.manti-fis',{role:'img','aria-label':mantiIsimleri[hedef.ic]+' ve '+mantiIsimleri[hedef.sos]},mantiOrnegi(id),mantiResmi(hedef.ic),mantiResmi(hedef.sos));
  const alan=h('div.manti-alan'),alet=h('div.manti-alet');
  const rehber=dugme('Bu adımı dinle','manti-ses',ikon('hoparlor'));rehber.hidden=!a.sesli();
  rehber.onclick=()=>a.soyle(metin[t.evre]);
  sahne.append(geri,fis,rehber,alan,alet);
  const yenile=()=>{kaydet();ses();ciz();};
  function devret(b:HTMLButtonElement,hedef:HTMLElement,yap:()=>void,kat?:HTMLElement){
    let hareketli:HTMLElement|undefined;
    function sil(){hareketli?.remove();hareketli=undefined;delete b.dataset.elde;delete hedef.dataset.yakin;}
    jest(b,{tasi:(p,ilk)=>{
      if(Math.hypot(p.x-ilk.x,p.y-ilk.y)<4)return;
      if(!hareketli){const r=b.getBoundingClientRect();hareketli=(kat??b.firstElementChild)!.cloneNode(true) as HTMLElement;
        Object.assign(hareketli.style,{position:'absolute',left:'0',top:'0',width:r.width+'px',height:r.height+'px',pointerEvents:'none',zIndex:'40',objectFit:'contain',margin:'0'});sahne.append(hareketli);b.dataset.elde='true';}
      const r=sahne.getBoundingClientRect();
      hareketli.style.transform='translate(calc('+(p.x-r.left)+'px - 50%),calc('+(p.y-r.top)+'px - 50%))';
      hedef.toggleAttribute('data-yakin',icinde(hedef,p,4));
    },birak:(p,_ilk,tik)=>{sil();if(tik||icinde(hedef,p,4))yap();},iptal:sil,klavye:yap});
  }
  function ciz(){
    dur();alan.replaceChildren();alet.replaceChildren();sahne.dataset.evre=t.evre;
    if(t.evre==='doldur'||t.evre==='katla'){
      const tahta=h('div.manti-tahta',{},mantiResmi('un','manti-zemin'));alan.append(tahta);
      for(const [i,kat] of t.kat.entries()){
        const b=dugme((i+1)+'. mantının köşesini katla','manti-hamur',mantiResmi(katlar[kat]));
        b.dataset.no=String(i);b.dataset.kat=String(kat);b.disabled=!t.ic||kat===4;
        if(t.ic&&kat<3)b.append(mantiResmi(t.ic,'manti-ic'));
        if(t.ic&&kat<4){
          const [x,y]=koseler[kat],ipucu=h('i.manti-kose',{style:'left:'+x*100+'%;top:'+y*100+'%'},ikon('ileri'));b.append(ipucu);
          const katla=()=>{if(t.kat[i]!==kat)return;t.kat[i]++;if(t.kat.every(n=>n===4))t.evre='hasla';yenile();};
          jest(b,{tasi:(p,ilk)=>{if(Math.hypot(p.x-ilk.x,p.y-ilk.y)>5)b.dataset.tutuldu='true';},
            birak:(p,ilk,tik)=>{delete b.dataset.tutuldu;const r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
              if(tik||Math.hypot(ilk.x-r.left-r.width*x,ilk.y-r.top-r.height*y)<r.width*.40&&Math.hypot(p.x-cx,p.y-cy)<r.width*.39)katla();},iptal:()=>delete b.dataset.tutuldu,klavye:katla});
        }
        tahta.append(b);
      }
      if(!t.ic)for(const ic of ['peynir','havuc'] as const){const b=dugme(mantiIsimleri[ic]+' içi seç','manti-arac',mantiResmi(ic));
        devret(b,tahta,()=>{t.ic=ic;t.evre='katla';yenile();});alet.append(b);}
    }else if(t.evre==='hasla'){
      const pot=h('div.manti-tencere',{},mantiResmi('tencere','manti-zemin'));alan.append(pot);
      for(const i of [0,1,2]){
        if(t.tencerede.includes(i)){const parca=mantiResmi('kapali','manti-suda');parca.style.left=yerler[i][0]+'%';parca.style.top=yerler[i][1]+'%';pot.append(parca);}
        else{const b=dugme((i+1)+'. mantıyı suya bırak','manti-arac',mantiResmi('kapali'));devret(b,pot,()=>{t.tencerede.push(i);yenile();});alet.append(b);}
      }
      if(t.tencerede.length===3){
        const gosterge=h('div.manti-saat',{'role':'meter','aria-label':'Haşlama süresi','aria-valuemin':0,'aria-valuemax':11},h('i'));
        const ibre=h('b');gosterge.append(ibre);alan.append(gosterge);
        const b=dugme('Mantıyı süz','manti-arac',ikon('sepet'));
        b.onclick=()=>{dur();t.evre='tabak';yenile();};alet.append(b);
        let sonKayit=t.sure;
        saat.baslat(gecen=>{
          t.sure=Math.min(11000,t.sure+gecen);
          ibre.style.left=t.sure/110+'%';gosterge.setAttribute('aria-valuenow',String(Math.floor(t.sure/1000)));
          pot.dataset.kivam=mantiKivami(t.sure);
          if(t.sure-sonKayit>=500||t.sure===11000){kaydet();sonKayit=t.sure;}
          return t.sure<11000;
        },kaydet);
      }
    }else if(t.evre==='tabak'){
      const tabak=mantiSunumu(t);
      const suzgec=h('div.manti-suzgec',{'aria-label':'Süzgeçteki mantılar'},h('img.manti-zemin',{src:suzgecResmi,alt:'',draggable:false}));
      const tezgah=h('div.manti-aktarim',{},suzgec,tabak);
      alan.append(tezgah);
      for(const i of t.tencerede.filter(n=>!t.tabakta.includes(n))){
        const b=dugme((i+1)+'. mantıyı tabağa al','manti-suzulmus',mantiResmi('kapali'));
        b.style.left=suzgecYerleri[i][0]+'%';b.style.top=suzgecYerleri[i][1]+'%';
        devret(b,tabak,()=>{t.tabakta.push(i);if(t.tabakta.length===3)t.evre='sos';yenile();});
        suzgec.append(b);
      }
    }else{
      const tabak=mantiSunumu(t);alan.append(tabak);
      if(t.evre==='sos'){
        for(const sos of ['yogurt','domates'] as MantiSosu[]){
          const b=dugme(mantiIsimleri[sos]+' seç','manti-arac',mantiResmi(sos));b.setAttribute('aria-pressed',String(t.sos===sos));
          let kasik:HTMLElement|undefined;
          const sec=()=>{if(t.sos!==sos){mantiSosunuSec(t,sos);yenile();}};
          const hedef=(p:{x:number;y:number})=>Array.from(tabak.querySelectorAll<HTMLElement>('.manti-lokma')).find(el=>icinde(el,p,4));
          const sil=()=>{kasik?.remove();kasik=undefined;tabak.querySelector('[data-yakin]')?.removeAttribute('data-yakin');};
          jest(b,{tasi:(p,ilk)=>{
            if(Math.hypot(p.x-ilk.x,p.y-ilk.y)<6)return;
            if(!kasik){kasik=h('span.manti-gezici-kasik',{},resim('kasik'),mantiResmi(sos));sahne.append(kasik);}
            const r=sahne.getBoundingClientRect();kasik.style.left=p.x-r.left+'px';kasik.style.top=p.y-r.top+'px';
            tabak.querySelector('[data-yakin]')?.removeAttribute('data-yakin');
            hedef(p)?.setAttribute('data-yakin','true');
          },birak:(p,_,tik)=>{
            const lokma=hedef(p);sil();
            if(tik){sec();return;}
            if(lokma){mantiyiSosla(t,Number(lokma.dataset.no),sos);yenile();}
          },iptal:sil,klavye:sec});alet.append(b);
        }
        if(t.sos)for(const p of tabak.querySelectorAll<HTMLElement>('.manti-lokma')){
          const i=Number(p.dataset.no);if(lokmaninSosu(t,i)===t.sos)continue;
          const b=dugme((i+1)+'. mantıya sos koy','manti-sos-hedef',ikon('asagi'));
          b.onclick=()=>{mantiyiSosla(t,i,t.sos!);yenile();};p.append(b);
        }
        if(t.soslar.length){const b=dugme('Mantıyı bitir','manti-arac manti-onay',ikon('onay'));b.onclick=()=>{t.evre='sun';yenile();};alet.append(b);}
      }else{
        const b=dugme('Mantıyı tepsiye koy','manti-arac manti-onay',ikon('servis'));b.onclick=()=>{if(teslimEdildi)return;teslimEdildi=true;a.teslim(t);};alet.append(b);
      }
    }
  }
  ciz();return {sahne,temizle:saat.temizle};
}
