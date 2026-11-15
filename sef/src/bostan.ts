import {h} from '../../src/ui/dom';
import {dugme,ikon,resim} from './gorsel';
import {jest,icinde} from './hareket';
import {efekt} from '../../src/audio/efekt';
import type {MalzemeId,Siparis} from './tarif';
import './bostan.css';

const kaynak=import.meta.glob<string>('../../assets/sef/bahce/*.webp',{eager:true,import:'default',query:'?url'});
const cizim=(ad:string,sinif='')=>h('img',{class:sinif,src:kaynak['../../assets/sef/bahce/'+ad+'.webp'],alt:'',draggable:false});
const isim={havuc:'Havuç',marul:'Marul',domates:'Domates',salatalik:'Salatalık',patates:'Patates'};
type Urun=keyof typeof isim;
export function bahceGirisi(ac:()=>void){
  const b=dugme('Mutfak bahçesinden sebze topla','bostan-girisi',cizim('havuc'),ikon('ileri'));b.onclick=ac;return b;
}
export function bostan(s:Siparis,yan:number,sayfa:(n:number)=>void,al:(id:Urun)=>void,geri:()=>void,tahta:()=>void,sesli:()=>boolean,sula:(id:Urun)=>void){
  const alan=h('section.bostan',{'aria-label':'Mutfak bahçesi'});
  const don=dugme('Buzdolabına dön','bostan-geri',ikon('geri'));don.onclick=geri;
  const kasa=h('div.bostan-sepet',{role:'group','aria-label':'Mutfak sepeti'},cizim('sepet','bostan-kasa'));
  const urunler=h('div.bostan-sepet-ici');
  for(const id of s.alinan)urunler.append(resim(id));
  kasa.append(urunler);alan.append(don,kasa);
  if(yan===0)alan.append(cizim('dal','bostan-dal'));
  const degistir=dugme(yan===0?'Yan sebze sırasına git':'İlk sebze sırasına dön','bostan-yan',ikon(yan===0?'ileri':'geri'));
  degistir.onclick=()=>sayfa(yan===0?1:0);alan.append(degistir);
  const sira:Urun[]=yan===0?['domates','havuc','marul']:['salatalik','patates'];
  for(const id of sira.filter(id=>s.bahceden?.includes(id))){
    const n=dugme(isim[id]+' fidesini sula','bostan-fidan',cizim('fidan'));n.dataset.yer=id;
    if(s.sulanan?.includes(id)){n.disabled=true;n.dataset.sulandi='true';}
    else{
      n.append(cizim('suluk','bostan-suluk'));
      jest(n,{birak:()=>sula(id),klavye:()=>sula(id)});
    }
    alan.append(n);
  }
  let elde:Urun|undefined;
  let hareketli:HTMLImageElement|undefined;
  let cevap:HTMLButtonElement|undefined;
  const dolu=s.alinan.length>=3;
  const tarifAlindi=(id:MalzemeId)=>s.alinan.includes(id);
  function topla(id:Urun){
    if(dolu||tarifAlindi(id))return;
    if(sesli())efekt.yapis();
    al(id);
  }
  function iptal(){
    hareketli?.remove();hareketli=undefined;
    cevap?.removeAttribute('data-tutuldu');cevap=undefined;kasa.removeAttribute('data-hedef');alan.removeAttribute('data-elde');elde=undefined;
  }
  for(const id of sira){
    const urun=id==='domates'?resim(id):cizim(id);
    const b=dugme(isim[id]+' topla','bostan-urun',urun);
    b.dataset.urun=id;
    if(tarifAlindi(id)){b.hidden=true;}else if(dolu){b.disabled=true;}
    function sec(){
      iptal();elde=id;cevap=b;b.dataset.tutuldu='true';alan.dataset.elde=id;
      kasa.dataset.hedef='true';aktar.hidden=false;aktar.focus({preventScroll:true});
    }
    jest(b,{
      basla:()=>{iptal();cevap=b;},
      tasi:(p,ilk)=>{
        if(Math.hypot(p.x-ilk.x,p.y-ilk.y)<5&&!hareketli)return;
        if(!hareketli){
          const r=b.getBoundingClientRect();hareketli=id==='salatalik'||id==='patates'?resim(id):urun.cloneNode(true) as HTMLImageElement;
          hareketli.className='bostan-elde';hareketli.style.width=r.width+'px';hareketli.style.height=r.height+'px';alan.append(hareketli);b.dataset.tutuldu='true';
        }
        const r=alan.getBoundingClientRect();hareketli.style.left=(p.x-r.left)+'px';hareketli.style.top=(p.y-r.top)+'px';
        kasa.dataset.hedef=String(icinde(kasa,p,9));
      },
      birak:(p,_ilk,tik)=>{if(tik){sec();return;}const hedef=icinde(kasa,p,10);iptal();if(hedef)topla(id);},
      iptal,klavye:sec
    });
    alan.append(b);
  }
  const aktar=dugme('Seçtiğin sebzeyi sepete koy','bostan-aktar',ikon('asagi'));
  aktar.hidden=true;aktar.onclick=()=>{if(elde)topla(elde);};kasa.append(aktar);
  if(s.alinan.length){
    const ileri=dugme('Bahçeden doğrama tahtasına git','bostan-ileri',ikon('tahta'),ikon('ileri'));ileri.onclick=tahta;alan.append(ileri);
  }
  return alan;
}
