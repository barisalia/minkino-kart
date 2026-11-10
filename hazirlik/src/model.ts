import { izleriOku, type Iz } from './defter';
import { atolyeBaslangici, defterBaslangici, panoBaslangici, bosDers, dersiOku, type DersDefteri } from './ders-programi';
export type Renk = 'yesil' | 'sari';
export const icler = ['marul','domates','peynir'] as const;
export type Ic = typeof icler[number];
export type Meyve = 'elma' | 'armut';
const sahneler = ['basla','oda','mutfak','kutu','matara','canta','aski','sofra','tat','topla','kutuyu-kaldir','son','ders','cizgi','yuvarlak','resim','etkinlik','ders-zili'] as const;
export interface Sabah {
  ders:DersDefteri;
  izler: Iz[]; boya:number;
  sahne: typeof sahneler[number]; renk?:Renk; ic:Ic[]; meyve?:Meyve;
  paket:boolean; asili:boolean; acik:boolean; serviste:boolean; meyveTabakta:boolean;
  su: number; bardak: number; kutuCantada: boolean; mataraCepte: boolean; cantaKapali:boolean; peceteSerili:boolean;
  meyveIsirildi: boolean; yudumAldi: boolean; kalanPaketlendi: boolean;
}
export const yeni = ():Sabah => ({
  izler:[],boya:0,ders:bosDers(),
  sahne:'basla',ic:[],paket:false,asili:false,acik:false,serviste:false,meyveTabakta:false,
  su:0,bardak:0,kutuCantada:false,mataraCepte:false,cantaKapali:false,peceteSerili:false,
  meyveIsirildi:false,yudumAldi:false,kalanPaketlendi:false,
});
const giris=new URLSearchParams(location.search).get('ders');
export const atolyeKisayolu=giris==='atolye';
export const defterKisayolu=giris==='defter'||giris==='perde';
const panoKisayolu=giris==='pano';
export const ilkTur=panoKisayolu?panoBaslangici:defterKisayolu?defterBaslangici:atolyeKisayolu?atolyeBaslangici:0;
export const dersKisayolu=giris==='1'||giris==='sinif'||atolyeKisayolu||defterKisayolu||panoKisayolu;
const anahtar=panoKisayolu?'minkino-hazirlik-pano-v1':defterKisayolu?'minkino-hazirlik-defter-v1':atolyeKisayolu?'minkino-hazirlik-atolye-v1':giris==='sinif'?'minkino-hazirlik-etkinlik-v1':dersKisayolu?'minkino-hazirlik-ders-v1':'minkino-hazirlik-sabah-v1';
const baslangic=():Sabah=>dersKisayolu?{...yeni(),sahne:giris==='1'?'ders':'ders-zili',ders:{...bosDers(),tur:ilkTur},renk:'yesil',ic:['marul'],paket:true,meyve:'elma'}:yeni();
export function oku():Sabah {
  try { const a=JSON.parse(localStorage.getItem(anahtar) || 'null');
    if(!a || !sahneler.includes(a.sahne) || !Array.isArray(a.ic) || a.ic.some((i:Ic)=>!icler.includes(i)) || new Set(a.ic).size!==a.ic.length) return baslangic();
    const n=sahneler.indexOf(a.sahne);
    if((n>1 && !['yesil','sari'].includes(a.renk)) || (n>2 && !a.ic.length) || (n>3 && (!a.paket || !['elma','armut'].includes(a.meyve)))) return baslangic();
    const okulda = n >= sahneler.indexOf('aski');
    const eskiSofra = a.peceteSerili === undefined && (a.acik || a.sahne === 'son');
    const miktar = (v: unknown, yoksa: number) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0,Math.min(1,v)) : yoksa;
    return {...yeni(),...a,
      ders:dersiOku(a.ders),
      izler:izleriOku(a.izler),boya:[0,1,2].includes(a.boya)?a.boya:0,
      su:miktar(a.su,n >= sahneler.indexOf('canta') ? 1 : 0),
      bardak:miktar(a.bardak,a.sahne === 'son' ? 1 : 0),
      kutuCantada: a.kutuCantada ?? okulda, mataraCepte: a.mataraCepte ?? okulda,
      cantaKapali: a.cantaKapali ?? okulda, peceteSerili:a.peceteSerili ?? !!eskiSofra,
    };
  } catch {return baslangic()}
}
export function sakla(s:Sabah){try{localStorage.setItem(anahtar,JSON.stringify(s))}catch{/* Oyun kayıt olmadan da sürer. */}}
