import { izleriOku, type Iz } from './defter';
import { bosPano,panoyuOku,type PanoKaydi } from './pano-resmi';

interface Etkinlik {
  set:string; tur:'say'|'sekil'|'sira'|'buyume'|'ritim'|'defter'|'pano'|'album'; adlar:string[];
  adet?:number; dizi?:number[]; bosluklar?:number[];
}
export const etkinlikler:Etkinlik[]=[
  {set:'meyve',tur:'say',adet:2,adlar:['Armut','Elma','Çilek','Erik','Portakal','Limon']},
  {set:'yuvarlak',tur:'sekil',adlar:['Saat','Düğme','Tekerlek','Hediye kutusu','Bayrak','Kitap']},
  {set:'bahce',tur:'sira',dizi:[0,1],bosluklar:[4,5],adlar:['Lale','Papatya','Çiğdem','Ayçiçeği','Gelincik','Unutmabeni']},
  {set:'muzik',tur:'say',adet:3,adlar:['Davul','Marakas','Tef','Çan','Ksilofon','Flüt']},
  {set:'ucgen',tur:'sekil',adlar:['Peynir dilimi','Çelik üçgen','Gönye','Para','Yastık','Ayna']},
  {set:'deniz',tur:'sira',dizi:[0,1,2],bosluklar:[4,6,8],adlar:['Deniz tarağı','Denizyıldızı','Burgulu kabuk','Denizatı','Balık','Yengeç']},
  {set:'kalemlik',tur:'say',adet:4,adlar:['Pastel boya','Fırça','Makas','Yapıştırıcı','Silgi','Kalemtıraş']},
  {set:'kare',tur:'sekil',adlar:['Yıldızlı kare kart','Peçete','Çerçeve','Tabak','Sandviç','Zarf']},
  {set:'orman',tur:'sira',dizi:[0,0,1],bosluklar:[3,5,7],adlar:['Meşe yaprağı','Palamut','Akçaağaç yaprağı','Kozalak','Mantar','Kestane']},
  {set:'tohum',tur:'buyume',dizi:[0,1,3,2],adlar:['Topraktaki tohum','İki yapraklı filiz','Açmış ayçiçeği','Kapalı tomurcuk']},
  {set:'ritim',tur:'ritim',dizi:[0,1,3],adlar:['Davul','Marakas','Tef','Çan']},
  {set:'harf',tur:'defter',adlar:[]},
  {set:'resim',tur:'defter',adlar:[]},
  {set:'album',tur:'album',adlar:[]},
  {set:'pano',tur:'pano',adlar:[]},
];
export const atolyeBaslangici=etkinlikler.findIndex(e=>e.set==='tohum');
export const defterBaslangici=etkinlikler.findIndex(e=>e.tur==='defter');
export const panoBaslangici=etkinlikler.findIndex(e=>e.tur==='pano');
export interface DersDefteri { tur:number; secim:number|null; isaret:number[]; sira:number; ikinciRitim:boolean; onay:boolean; izler:Iz[]; saydiklarim:number[]; harf:Iz[]; resim:Iz[]; pano:PanoKaydi }
export const bosDers=():DersDefteri=>({tur:0,secim:null,isaret:[],sira:0,ikinciRitim:false,onay:false,izler:[],saydiklarim:[],harf:[],resim:[],pano:bosPano()});
export function cevapSirasi(tur:Etkinlik,d:DersDefteri){
  const dizi=tur.dizi!;
  if(tur.bosluklar)return tur.bosluklar.map(i=>dizi[i%dizi.length]);
  if(tur.tur==='ritim'&&d.ikinciRitim)return [1,0,0,3];
  return dizi;
}
export function dersiOku(a?:Partial<DersDefteri>|null):DersDefteri {
  const d=bosDers();
  if(!a || !Number.isInteger(a.tur) || a.tur!<0 || a.tur!>etkinlikler.length)return d;
  d.tur=a.tur!;d.izler=izleriOku(a.izler).filter(i=>i.asama==='ucgen'||i.asama==='kare');
  if(Array.isArray(a.saydiklarim))d.saydiklarim=a.saydiklarim.slice(0,3).filter(i=>Number.isInteger(i)&&i>=0&&i<6);
  d.harf=izleriOku(a.harf).filter(i=>i.asama==='harf');
  d.resim=izleriOku(a.resim).filter(i=>i.asama==='resim');
  d.pano=panoyuOku(a.pano);
  if(d.tur>defterBaslangici&&d.tur<panoBaslangici&&!d.harf.length)d.tur=defterBaslangici;
  const tur=etkinlikler[d.tur];if(!tur)return d;
  if(tur.tur==='say' && Number.isInteger(a.secim) && a.secim!>=0 && a.secim!<6)d.secim=a.secim!;
  const sinir=tur.tur==='say'&&d.secim!==null?tur.adet!:tur.tur==='sekil'?3:0;
  if(Array.isArray(a.isaret))d.isaret=[...new Set(a.isaret.filter(i=>Number.isInteger(i)&&i>=0&&i<sinir))];
  d.ikinciRitim=tur.tur==='ritim'&&(a.ikinciRitim===true||(a.ikinciRitim===undefined&&a.onay===true));
  const uzunluk=tur.dizi?cevapSirasi(tur,d).length:0;
  if(tur.dizi && Number.isInteger(a.sira))d.sira=Math.max(0,Math.min(uzunluk,a.sira!));
  if(a.ikinciRitim===undefined&&a.onay&&a.sira===3&&(tur.tur==='ritim'||tur.tur==='buyume'))d.sira=uzunluk;
  d.onay=a.onay===true && (tur.dizi?d.sira===uzunluk:tur.tur==='say'?d.secim!==null:d.isaret.length===sinir && sinir>0);
  return d;
}
export function sonra(d:DersDefteri){
  const saydiklarim=d.saydiklarim.slice();
  if(etkinlikler[d.tur]?.tur==='say' && d.secim!==null)saydiklarim[Math.floor(d.tur/3)]=d.secim;
  Object.assign(d,bosDers(),{tur:d.tur+1,izler:d.izler,saydiklarim,harf:d.harf,resim:d.resim,pano:d.pano});
}
