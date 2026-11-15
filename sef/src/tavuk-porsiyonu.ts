import {h} from '../../src/ui/dom';
export type TavukRengi=1|2|3;
export type TavukCifti=[TavukRengi,TavukRengi];
export interface TavaKaydi {ilk:0|1;ikinci:0|1;son:0|1;ekSure:number;ates:boolean;puan:TavukRengi;tabağa?:TavukRengi}
export function tavukRengiMi(v:unknown):v is TavukRengi{return v===1||v===2||v===3;}
export function tavukCiftiniOku(v?:TavukCifti):TavukCifti|undefined{
  if(Array.isArray(v)&&v.length===2&&v.every(tavukRengiMi))return [v[0],v[1]];
}
export function tavaKaydiniOku(v?:TavaKaydi):TavaKaydi|undefined{
  if(!v||![v.ilk,v.ikinci,v.son].every(k=>k===0||k===1)||!Number.isFinite(v.ekSure)||!tavukRengiMi(v.puan))return;
  return {ilk:v.ilk,ikinci:v.ikinci,son:v.son,ekSure:Math.min(21000,Math.max(0,v.ekSure)),puan:v.puan,ates:v.ates===true,tabağa:tavukRengiMi(v.tabağa)?v.tabağa:undefined};
}
const cizimler=import.meta.glob<string>('../../assets/sef/tepsi/tavuk/{tabak,pisti,fazla,yanik}.webp',{eager:true,query:'?url',import:'default'});
export function tavukParcasi(k:TavukRengi){return cizimler['../../assets/sef/tepsi/tavuk/'+({1:'yanik',2:'fazla',3:'pisti'}[k])+'.webp'];}
export function tavukPorsiyonu(parcalar:TavukCifti){
  const tabak=h('span.tv-servis-tabagi',{role:'img','aria-label':'Pişirdiğin iki fileto'},h('img.tv-porsiyon-zemini',{alt:'',src:cizimler['../../assets/sef/tepsi/tavuk/tabak.webp'],draggable:false}));
  for(const k of parcalar)tabak.append(h('img.tv-porsiyon-fileto',{src:tavukParcasi(k),alt:({1:'Yanmış',2:'Fazla kızarmış',3:'Kızarmış'}[k])+' fileto','data-pisme':k,draggable:false}));
  return tabak;
}
