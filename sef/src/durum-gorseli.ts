import {h} from '../../src/ui/dom';
import {dilimIcleri,durumIstegi,type Kat,type Durum,type DurumIci} from './durum-tarifi';
import './durum.css';

const resimler=import.meta.glob<string>(['../../assets/sef/durum/*.webp','../../assets/sef/nesneler/{domates-dilim,domates-kesit,marul-parca,salatalik-dilim,salatalik-kesit,dograma-bicagi}.webp','../../assets/sef/tost/kasar.webp','../../assets/sef/firin/zeytin.webp'],{eager:true,query:'?url',import:'default'});
export const durumSrc=(yol:string)=>resimler['../../assets/sef/'+yol+'.webp'];
export const durumResmi=(yol:string,sinif='')=>h('img',{src:durumSrc(yol),alt:'',class:sinif,draggable:false});
const icYollari:Record<DurumIci,string>={domates:'nesneler/domates-dilim',marul:'nesneler/marul-parca',salatalik:'nesneler/salatalik-dilim',peynir:'tost/kasar',zeytin:'firin/zeytin'};
export function durumIc(tur:DurumIci){const im=durumResmi(icYollari[tur],'dr-ic');im.dataset.tur=tur;return im;}
export function diziliKat(k:Kat){
  const im=durumIc(k.tur);im.classList.add('dr-dizili');
  im.style.left=k.x+'%';im.style.top=k.y+'%';im.style.rotate=(k.x*1.3+k.y)%50-25+'deg';return im;
}
export function durumDilimi(t:Durum,i:number){
  const kesit=h('span.dr-kesit',{'data-dilim':i},durumResmi('durum/dilim-sarmal','dr-hamur'));
  const katlar=dilimIcleri(t,i).sort((a,b)=>a.y-b.y);
  if(!katlar.length)return kesit;
  // From the open end, each leaf or slice shows its narrow edge inside the spiral.
  const ic=h('span.dr-kesit-yuvasi');
  for(const [j,k] of katlar.entries()){
    const dolgu=h('span.dr-kesit-kati',{'data-tur':k.tur});
    const resim=k.tur==='domates'||k.tur==='salatalik'?durumResmi('nesneler/'+k.tur+'-kesit'):durumIc(k.tur);
    const dikey=katlar.length===1?50:23+54*j/(katlar.length-1);
    dolgu.style.left=48+(k.x-50)*.1+'%';
    dolgu.style.top=dikey+'%';
    dolgu.style.rotate=((j%2===0?-1:1)*(9+(k.y%12)))+'deg';
    dolgu.append(resim);ic.append(dolgu);
  }
  kesit.append(ic);
  return kesit;
}
export function durumTabagi(t:Durum){
  return h('span.dr-tabak',{},durumResmi('durum/servis-tabagi','dr-porselen'),...[0,1,2].map(i=>durumDilimi(t,i)));
}
export function durumOrnegi(id:string){
  const hedef=durumIstegi(id);
  return durumTabagi({evre:'sun',sarma:1,kesimler:[34,66],katlar:hedef.flatMap((tur,j)=>[0,1,2].map(i=>({tur,x:24+26*i,y:36+j*14})))});
}
