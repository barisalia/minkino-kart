import {h} from '../../src/ui/dom';
import {kumpirAd,kumpirIstegi,type KumpirKat,type KumpirMal} from './kumpir-tarifi';
const cizimler=import.meta.glob<string>('../../assets/sef/kumpir/*.webp',{eager:true,query:'?url',import:'default'});
export const kumpirResmi=(id:string,sinif='')=>h('img',{src:cizimler['../../assets/sef/kumpir/'+id+'.webp'],class:sinif,alt:'',draggable:false});
export function kumpirSunumu(katlar:readonly KumpirKat[]){
  const y=h('span.kumpir-sunumu',{},kumpirResmi('ezilmis','kumpir-taban'));
  for(const k of katlar){
    const n=kumpirResmi(k.id,'kumpir-ic');n.style.left=k.x+'%';n.style.top=k.y+'%';n.dataset.malzeme=k.id;n.alt=kumpirAd[k.id];y.append(n);
  }
  return y;
}
export const kumpirOrnegi=(istek:readonly KumpirMal[]=kumpirIstegi)=>kumpirSunumu(istek.map((id,i)=>({id,x:istek.length===3?34+i*16:36+i*27,y:istek.length===3&&i===1?32:44})));
export function kumpirLokmasi(tabak:HTMLElement){
  const kalan=Array.from(tabak.querySelectorAll<HTMLImageElement>('.kumpir-ic:not([hidden])'));
  const ic=kalan.at(-1);
  if(ic)return {x:parseFloat(ic.style.left),y:parseFloat(ic.style.top),ic};
  return {x:Number(tabak.dataset.lokmaAdedi??0)===1?38:54,y:44,ic:undefined};
}
