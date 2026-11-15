import {h} from '../../src/ui/dom';
import {resim} from './gorsel';
import replik from './sebze-tercihleri.json';
import type {KesimBoyu} from './tarif';
export {replik as sebzeReplik};
export const dilimIstegi=(boy:2|6)=>replik[boy===2?'salata-iri':'salata-kucuk'];
export const dilimYorumu=(boy:2|6)=>replik[boy===2?'salata-iri-tadim':'salata-kucuk-tadim'];
export const dilimBoyAdi=(boy:KesimBoyu)=>({2:'İri',4:'Lokmalık',6:'Küçük'}[boy]+' salatalık dilimleri');
export function salatalikOrnegi(boy:KesimBoyu){
  const ornek=h('span.dilim-boy-ornegi',{role:'img','aria-label':dilimBoyAdi(boy),'data-boy':boy});
  for(let i=0;i<boy/2;i++)ornek.append(resim('salatalik-dilim'));
  return ornek;
}
