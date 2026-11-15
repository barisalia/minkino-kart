import { izleriOku, type Iz } from './defter';
import {kresSahneleri,kresOku,bugun,yeniKres,yeniOkulGunu,type KresKaydi} from './kres-kaydi';
import { etkinlikler, yaziBaslangici, atolyeBaslangici, defterBaslangici, panoBaslangici, bosDers, dersiOku, type DersDefteri } from './ders-programi';
export type Renk = 'yesil' | 'sari';
export const icler = ['marul','domates','peynir'] as const;
export type Ic = typeof icler[number];
export type Meyve = 'elma' | 'armut';
const sahneler = ['basla','oda','mutfak','kutu','matara','canta','aski','sofra','tat','topla','kutuyu-kaldir','son','ders','cizgi','yuvarlak','resim','etkinlik','ders-zili','ek','muzik','kolye','toplan','veda',...kresSahneleri] as const;
export interface Sabah {
  kres:KresKaydi;
  ders:DersDefteri;
  izler: Iz[]; boya:number;
  sahne: typeof sahneler[number]; renk?:Renk; ic:Ic[]; meyve?:Meyve;
  paket:boolean; asili:boolean; acik:boolean; serviste:boolean; meyveTabakta:boolean;
  su: number; bardak: number; kutuCantada: boolean; mataraCepte: boolean; cantaKapali:boolean; peceteSerili:boolean;
  meyveIsirildi: boolean; yudumAldi: boolean; kalanPaketlendi: boolean;
  // Okul günü: arkadaşlara verilen meyveler, saksının büyümesi, bando, kolye, toplanan eşyalar.
  pay:number[]; ekim:number; saksiCamda:boolean; calinan:number; sonCalgi:number; vurus:number; kolye:number[]; kolyeKimde?:'mino'|'zipzip'; toplanan:number[];
}
export const yeni = ():Sabah => ({
  kres:yeniKres(),
  izler:[],boya:0,ders:bosDers(),
  sahne:'basla',ic:[],paket:false,asili:false,acik:false,serviste:false,meyveTabakta:false,
  su:0,bardak:0,kutuCantada:false,mataraCepte:false,cantaKapali:false,peceteSerili:false,
  meyveIsirildi:false,yudumAldi:false,kalanPaketlendi:false,
  pay:[0,0],ekim:0,saksiCamda:false,calinan:0,sonCalgi:-1,vurus:0,kolye:[],toplanan:[],
});
const giris=new URLSearchParams(location.search).get('ders');
export function ertesiSabah(once:Sabah):Sabah{
  const sabah=yeni();
  sabah.kres=yeniOkulGunu(once.kres);
  // Defter ve etiket rafı çocuğun kendi el yazısını okul günleri arasında da tutar.
  sabah.ders.sergi=once.ders.sergi;
  sabah.ders.harf=once.ders.harf;
  sabah.ders.resim=once.ders.resim;
  sabah.ders.izler=once.ders.izler;
  sabah.ders.pano=once.ders.pano;
  return sabah;
}
export const atolyeKisayolu=giris==='atolye';
export const defterKisayolu=giris==='defter'||giris==='perde';
const panoKisayolu=giris==='pano';
const bandoKisayolu=giris==='bando';
export const ilkTur=bandoKisayolu?etkinlikler.findIndex(e=>e.tur==='ritim'):giris==='yazi'?yaziBaslangici:panoKisayolu?panoBaslangici:defterKisayolu?defterBaslangici:atolyeKisayolu?atolyeBaslangici:0;
export const dersKisayolu=bandoKisayolu||giris==='yazi'||giris==='1'||giris==='sinif'||atolyeKisayolu||defterKisayolu||panoKisayolu;
const oyunOdasi=giris==='oyun-odasi';
const odaOnizle=giris==='kres'||giris==='gosteri'||oyunOdasi;
const anahtar=oyunOdasi?'minkino-hazirlik-oyun-odasi-v1':giris==='gosteri'?'minkino-hazirlik-gosteri-v1':odaOnizle?'minkino-hazirlik-kres-v1':bandoKisayolu?'minkino-hazirlik-bando-v1':giris==='yazi'?'minkino-hazirlik-yazi-v1':panoKisayolu?'minkino-hazirlik-pano-v1':defterKisayolu?'minkino-hazirlik-defter-v1':atolyeKisayolu?'minkino-hazirlik-atolye-v1':giris==='sinif'?'minkino-hazirlik-etkinlik-v1':dersKisayolu?'minkino-hazirlik-ders-v1':'minkino-hazirlik-sabah-v1';
const baslangic=():Sabah=>dersKisayolu||odaOnizle?{...yeni(),sahne:oyunOdasi?'oyun-odasi':giris==='gosteri'?'gosteri':odaOnizle?'anasinifi':bandoKisayolu?'etkinlik':giris==='1'?'ders':'ders-zili',ders:{...bosDers(),tur:ilkTur,...(bandoKisayolu?{ikinciRitim:true,sira:4,onay:true}:{})},renk:'yesil',ic:['marul'],paket:true,meyve:'elma',asili:odaOnizle}:yeni();
const tam=(v:unknown,ust:number)=>Number.isInteger(v)?Math.max(0,Math.min(ust,v as number)):0;
const sayilar=(v:unknown,adet:number,ust:number)=>Array.isArray(v)?v.filter(i=>Number.isInteger(i)&&i>=0&&i<=ust).slice(0,adet) as number[]:[];
export function oku():Sabah {
  try { const a=JSON.parse(localStorage.getItem(anahtar) || 'null');
    if(a?.sahne==='tren')a.sahne='oyun-odasi';
    if(!a || !sahneler.includes(a.sahne) || !Array.isArray(a.ic) || a.ic.some((i:Ic)=>!icler.includes(i)) || new Set(a.ic).size!==a.ic.length) return baslangic();
    const n=sahneler.indexOf(a.sahne);
    if((n>1 && !['yesil','sari'].includes(a.renk)) || (n>2 && !a.ic.length) || (n>3 && (!a.paket || !['elma','armut'].includes(a.meyve)))) return baslangic();
    const okulda = n >= sahneler.indexOf('aski');
    const eskiSofra = a.peceteSerili === undefined && (a.acik || a.sahne === 'son');
    const miktar = (v: unknown, yoksa: number) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0,Math.min(1,v)) : yoksa;
    const kres=kresOku(a.kres);
    if(!Array.isArray(a.kres?.tabaklar)){
      const eski=sayilar(a.pay,2,3);
      kres.tabaklar=[0,1].map(i=>Array.from({length:eski[i]||0},()=>i===0?0:2));
      kres.servis=[(eski[0]||0)>=2,(eski[1]||0)>=3];
    }
    if(!a.kres){
      if(kres.servis.every(Boolean))kres.biten.push('paylas');
      if(a.calinan>=3)kres.biten.push('muzik');
      if(a.kolyeKimde&&Array.isArray(a.kolye)){kres.hediye=a.kolyeKimde;kres.kolyeHatira=sayilar(a.kolye,6,5);kres.biten.push('kolye')}
      if(a.saksiCamda){const gecmis=new Date();gecmis.setDate(gecmis.getDate()-3);kres.tohum=true;kres.ekimTarihi=bugun(gecmis);kres.biten.push('bahce')}
    }
    return {...yeni(),...a,kres,
      ders:dersiOku(a.ders),
      izler:izleriOku(a.izler),boya:[0,1,2].includes(a.boya)?a.boya:0,
      su:miktar(a.su,n >= sahneler.indexOf('canta') ? 1 : 0),
      bardak:miktar(a.bardak,a.sahne === 'son' ? 1 : 0),
      kutuCantada: a.kutuCantada ?? okulda, mataraCepte: a.mataraCepte ?? okulda,
      cantaKapali: a.cantaKapali ?? okulda, peceteSerili:a.peceteSerili ?? !!eskiSofra,
      pay:sayilar(a.pay,2,3).concat([0,0]).slice(0,2),ekim:tam(a.ekim,3),saksiCamda:a.saksiCamda===true,calinan:tam(a.calinan,99),sonCalgi:-1,vurus:0,
      kolye:sayilar(a.kolye,6,5),kolyeKimde:a.kolyeKimde==='mino'||a.kolyeKimde==='zipzip'?a.kolyeKimde:undefined,toplanan:[...new Set(sayilar(a.toplanan,9,8))],
    };
  } catch {return baslangic()}
}
export function sakla(s:Sabah){try{localStorage.setItem(anahtar,JSON.stringify(s))}catch{/* Oyun kayıt olmadan da sürer. */}}
