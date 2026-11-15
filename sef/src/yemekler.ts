import type { ServisKaydi } from './kayit';
import {krepMeyveAdlari,type KrepMeyvesi,type KrepPorsiyonu,krepPorsiyonunuOku} from './krep-fisi';

export const yeniTarifler = ['makarna','krep','mucver','sis'] as const;
export type YeniTarif = typeof yeniTarifler[number];
export const adlar = {
  corba:'Sebze Çorbası', salata:'Bahçe Salatası', pizza:'Mini Pizza',
  makarna:'Fiyonk Makarna', krep:'Meyveli Krep', mucver:'Fırın Mücver', sis:'Renkli Şişler',
} as const;
export type Yemek = keyof typeof adlar;
export function yeniTarifMi(id: unknown): id is YeniTarif {
  return yeniTarifler.some(x => x===id);
}
import {izgaraYuzleri,type IzgaraPismesi} from './sis-pisme';
export type MakarnaSosu='yesil'|'kirmizi'|'sari';
export interface MakarnaPorsiyonu {
  renk:'altin'|'ispanak'|'pancar';
  kivamlar:('sert'|'tam'|'yumusan')[];
  sus:{id:'domates'|'peynir'|'feslegen';x:number;y:number};
}
export function makarnaPorsiyonunuOku(p?:MakarnaPorsiyonu):MakarnaPorsiyonu|undefined{
  if(!p||!['altin','ispanak','pancar'].includes(p.renk)||!Array.isArray(p.kivamlar)||p.kivamlar.length!==3||
    !p.kivamlar.every(k=>['sert','tam','yumusan'].includes(k))||!p.sus||!['domates','peynir','feslegen'].includes(p.sus.id)||
    !Number.isFinite(p.sus.x)||p.sus.x<0||p.sus.x>1||!Number.isFinite(p.sus.y)||p.sus.y<0||p.sus.y>1)return;
  return {renk:p.renk,kivamlar:[...p.kivamlar],sus:{...p.sus}};
}
export interface MakarnaFisi { istenenSosAdedi?:1|3; soslanan?:number; porsiyon?:MakarnaPorsiyonu; istenenSos:MakarnaSosu; sos:MakarnaSosu; pestoMaskesi?:number }
export const makarnaSosuMu=(deger:unknown):deger is MakarnaSosu=>deger==='yesil'||deger==='kirmizi'||deger==='sari';
export const sisSebzeleri={biber:'Biber',kabak:'Kabak',mantar:'Mantar',misir:'Mısır',patlican:'Patlıcan',ananas:'Ananas'} as const;
export type SisSebzesi=keyof typeof sisSebzeleri;
export const sisFisleri:readonly (readonly SisSebzesi[])[]=[
  ['biber','kabak','mantar','misir'],['ananas','biber','kabak','ananas'],
  ['patlican','mantar','misir','biber'],['kabak','misir','ananas','patlican'],
];
export const sisSoslari=['feslegen','yogurt','domates','feslegen'] as const;
export const mucverGarniturleri=['yogurt','dereotu','limon'] as const;
export type AtolyeTercihi=
  |{tarifId:'sis';yuzler?:IzgaraPismesi;tur:number;tabak?:'tabak'|'tabak-sari'|'tabak-nane';lokmalar:SisSebzesi[];sos:typeof sisSoslari[number]}
  |{tarifId:'mucver';tur:number;garnitur:typeof mucverGarniturleri[number];kizarma:number;sikma?:number}
  |{tarifId:'krep';tur:number;meyveler:KrepMeyvesi[];porsiyon?:KrepPorsiyonu};
export function tercihOku(k:AtolyeTercihi|undefined,id:YeniTarif):AtolyeTercihi|undefined{
  if(!k||typeof k!=='object'||k.tarifId!==id||!Number.isInteger(k.tur)||k.tur<0)return;
  if(k.tarifId==='sis'&&k.tur<sisFisleri.length&&Array.isArray(k.lokmalar)&&k.lokmalar.length>=1&&k.lokmalar.length<=4&&k.lokmalar.every(s=>Object.hasOwn(sisSebzeleri,s))&&sisSoslari.includes(k.sos))return {...k,yuzler:izgaraYuzleri(k.yuzler),tabak:k.tabak==='tabak-sari'||k.tabak==='tabak-nane'||k.tabak==='tabak'?k.tabak:undefined};
  if(k.tarifId==='mucver'&&k.tur<6&&mucverGarniturleri.includes(k.garnitur)&&Number.isInteger(k.kizarma)&&k.kizarma>=0&&k.kizarma<=2)return k;
  if(k.tarifId==='krep'&&k.tur<3&&Array.isArray(k.meyveler)&&k.meyveler.length===3&&k.meyveler.every(s=>typeof s==='string'&&Object.hasOwn(krepMeyveAdlari,s)))return {...k,porsiyon:krepPorsiyonunuOku(k.porsiyon)};
}
export interface AtolyeAyar {
  masa?: string;
  oncekiServis?: number;
  tekrarMakarnaSosu?:MakarnaSosu;
  tekrarTercihi?:AtolyeTercihi;
  cikis: () => void;
  sesli: () => boolean;
  sesDegistir: () => void;
  soyle: (s:string) => void;
  teslim: (resim:string, puan?:Yildiz, istekPuani?:Yildiz, pisirmePuani?:Yildiz, makarna?:MakarnaFisi, tercih?:AtolyeTercihi) => void;
}
export type Yildiz = 1|2|3;
export interface DefterFotografi {
  tarifId: YeniTarif;
  resim: string;
  puan?: Yildiz;
  istekPuani?: Yildiz;
  pisirmePuani?: Yildiz;
  makarna?: MakarnaFisi;
  tercih?: AtolyeTercihi;
}
export function fotografMi(k: ServisKaydi): k is DefterFotografi {
  return yeniTarifMi(k.tarifId);
}
const fotograflar = import.meta.glob<string>([
  '../../assets/sef/krep/*{li,lu}.webp',
  '../../assets/sef/makarna/*-tabak.webp',
],{query:'?url',import:'default'});
const kapaklar = import.meta.glob<string>('../../assets/sef/{krep/krep,makarna/makarna,mucver/mucver,sis/sis}.webp',{eager:true,query:'?url',import:'default'});
export function kapak(id: YeniTarif) { return kapaklar['../../assets/sef/'+id+'/'+id+'.webp']; }
export function fotografGecerli(id: YeniTarif, url: unknown): url is string {
  if(typeof url!=='string' || url.length>780000) return false;
  if(/^data:image\/(webp|png|jpeg);base64,[a-zA-Z0-9+/=]+$/.test(url)) return true;
  return url===id+'/'+id || url.startsWith(id+'/') && Object.hasOwn(fotograflar,'../../assets/sef/'+url+'.webp');
}
export async function fotografAc(k: DefterFotografi) {
  if(k.resim.startsWith('data:')) return k.resim;
  const yukle=fotograflar['../../assets/sef/'+k.resim+'.webp'];
  return yukle ? await yukle().catch(()=>kapak(k.tarifId)) : kapak(k.tarifId);
}
