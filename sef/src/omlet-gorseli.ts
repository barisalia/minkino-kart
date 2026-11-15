import {h} from '../../src/ui/dom';
import {omletAdlari,omletIstegi,omletKivami,type Omlet,type OmletKivami,type OmletParcasi,type OmletIci} from './omlet-tarifi';
import './omlet.css';

const cizimler=import.meta.glob<string>(['../../assets/sef/omlet/*.webp','../../assets/sef/makarna/domates-garnitur.webp','../../assets/sef/firin/{peynir,biber,mantar,zeytin}.webp','../../assets/sef/krep/{tava,tabak,karisim-kasesi,karisim-son,yumurta,yumurta-kirik,yumurta-kasede,cirpici,tezgah,spatula}.webp','../../assets/sef/tepsi/tavuk/ocak.webp'],{eager:true,query:'?url',import:'default'});
export const omletResmi=(yol:string,sinif='')=>h('img',{src:cizimler['../../assets/sef/'+yol+'.webp'],alt:'',class:sinif,draggable:false});
const icResimleri=import.meta.glob<string>('../../assets/sef/ikon-atolyesi/ic/*.webp',{eager:true,query:'?url',import:'default'});
export const omletIcResmi=(tur:OmletIci)=>h('img',{src:icResimleri['../../assets/sef/ikon-atolyesi/ic/'+tur+'.webp'],alt:'',draggable:false});
export function omletGoruntusu(icler:OmletParcasi[],katli:boolean,kivam:OmletKivami='altin'){
  const yer=h('span.om-yemek',{'data-katli':String(katli),'data-kivam':kivam});
  const zemin=omletResmi('omlet/'+(katli?kivam==='altin'?'katli':kivam:'acik'),'om-yuzey');
  yer.append(zemin);
  for(const [i,ic] of icler.entries()){
    const resim=omletIcResmi(ic.tur);resim.className='om-ic';resim.dataset.tur=ic.tur;resim.alt=omletAdlari[ic.tur];
    // After folding, project the same fillings onto the visible curved seam.
    const x=katli?17+ic.y*.65:ic.x;
    const y=katli?48+30*Math.sin(Math.PI*x/100):ic.y;
    resim.style.left=x+'%';resim.style.top=y+'%';resim.style.setProperty('--yon',(i%3-1)*15+'deg');yer.append(resim);
  }
  return yer;
}
export function omletTabagi(t:Pick<Omlet,'sure'|'icler'>){
  return h('span.om-tabak',{},omletResmi('krep/tabak','om-tabak-resmi'),omletGoruntusu(t.icler,true,omletKivami(t.sure)));
}
export function omletOrnegi(id:string){
  const istek=omletIstegi(id);
  return omletTabagi({sure:istek.kivam==='altin'?6000:2600,icler:istek.icler.map((tur,i)=>({tur,x:30,y:32+36*i}))});
}
