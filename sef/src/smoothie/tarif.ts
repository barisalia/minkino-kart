import type {Yildiz} from '../yemekler';

export const meyveler = ['cilek','muz','kivi','yabanmersini','portakal','seftali','sut','uzum'] as const;
export const tezgahRenkleri=['cilek','muz','yabanmersini','sut'] as const;
export type Meyve = typeof meyveler[number];
export type MeyveCifti = readonly [Meyve,Meyve];
export const meyveAdi:Record<Meyve,string> = {
  cilek:'Çilek',muz:'Muz',kivi:'Kivi',yabanmersini:'Yaban mersini',portakal:'Portakal',seftali:'Şeftali',sut:'Süt',uzum:'Mor üzüm'
};
export type SmoothieEvre = 'meyve'|'kapak'|'karistir'|'dok'|'servis';
export interface SmoothieNumunesi {meyveler:MeyveCifti;karisim:number}
export interface SmoothieKaydi {
  meyveler:Meyve[];
  evre:SmoothieEvre;
  karisim:number;
  bardak:number;
  buzlu?:boolean;
  denemeler?:MeyveCifti[];
  numuneler?:SmoothieNumunesi[];
}
export const bosSmoothie=():SmoothieKaydi=>({meyveler:[],evre:'meyve',karisim:0,bardak:0});
export const servisCizgisi=80;
export interface BardakIstegi {yarim?:boolean;kivam?:'taneli'|'puruzsuz'}
export function bardakUyuyor(doluluk:number,istek?:BardakIstegi){
  return istek?.yarim ? doluluk>=40&&doluluk<=65 : doluluk>=servisCizgisi;
}
export function taneli(karisim:number){return karisim<80;}
export function icecekKivamiUyuyor(karisim:number,istek?:BardakIstegi){
  return !istek?.kivam||(istek.kivam==='taneli')===taneli(karisim);
}
const yuzde=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)?Math.round(Math.max(0,Math.min(100,x))):0;
export function smoothieOku(veri:Partial<SmoothieKaydi>|undefined){
  const sonuc=bosSmoothie();
  if(!veri)return sonuc;
  if(Array.isArray(veri.meyveler))sonuc.meyveler=veri.meyveler.filter(m=>meyveler.includes(m)).slice(0,2);
  if(Array.isArray(veri.denemeler)){
    for(const cift of veri.denemeler){
      if(Array.isArray(cift)&&cift.length===2&&cift.every(m=>meyveler.includes(m)))denemeyiSakla(sonuc,cift);
    }
  }
  if(Array.isArray(veri.numuneler)){
    for(const n of veri.numuneler){
      if(!n||!Array.isArray(n.meyveler))continue;
      numuneAyir(sonuc,n.meyveler,yuzde(n.karisim));
    }
  }
  if(sonuc.meyveler.length<2)return sonuc;
  sonuc.evre='kapak';
  if(!['karistir','dok','servis'].includes(veri.evre??''))return sonuc;
  sonuc.karisim=yuzde(veri.karisim);
  const dokmeyeGecti=veri.evre!=='karistir'&&sonuc.karisim>=45;
  sonuc.evre=dokmeyeGecti||sonuc.karisim===100?'dok':'karistir';
  if(sonuc.evre==='dok'){
    sonuc.bardak=yuzde(veri.bardak);
    if(veri.evre==='servis'&&sonuc.bardak>=35)sonuc.evre='servis';
    if(sonuc.evre==='servis'&&typeof veri.buzlu==='boolean')sonuc.buzlu=veri.buzlu;
  }
  return sonuc;
}
// Recipes are unordered pairs; two slices of the same fruit keep its signature colour.
const renkler = {
  kirmizi: {ad:'Çilek kırmızısı',ses:'renk-kirmizi',renk:'#e34949'},
  sari: {ad:'Muz sarısı',ses:'renk-sari',renk:'#ffdd43'},
  kivi: {ad:'Kivi yeşili',ses:'renk-kivi',renk:'#4b9c51'},
  mavi: {ad:'Mavi',ses:'renk-mavi',renk:'#3679dc'},
  turuncu: {ad:'Turuncu',ses:'renk-turuncu',renk:'#ff962e'},
  seftali: {ad:'Şeftali',ses:'renk-seftali',renk:'#ffb98d'},
  beyaz: {ad:'Beyaz',ses:'renk-beyaz',renk:'#fffefa'},
  mor: {ad:'Koyu mor',ses:'renk-mor',renk:'#7846a2'},
  kahve: {ad:'Kahverengi',ses:'renk-kahve',renk:'#926140'},
  mercan: {ad:'Mercan',ses:'renk-mercan',renk:'#ef795e'},
  pembe: {ad:'Pembe',ses:'renk-pembe',renk:'#ff99b4'},
  ahududu: {ad:'Ahududu',ses:'renk-ahududu',renk:'#be376d'},
  yesil: {ad:'Açık yeşil',ses:'renk-yesil',renk:'#93cd68'},
  krem: {ad:'Krem',ses:'renk-krem',renk:'#fff0ad'},
  zeytin: {ad:'Zeytin yeşili',ses:'renk-zeytin',renk:'#8a9845'},
  turkuaz: {ad:'Turkuaz',ses:'renk-turkuaz',renk:'#39aea6'},
  acikmavi: {ad:'Açık mavi',ses:'renk-acikmavi',renk:'#95cbf3'},
  leylak: {ad:'Leylak',ses:'renk-leylak',renk:'#c9a3e0'},
  lacivert: {ad:'Lacivert',ses:'renk-lacivert',renk:'#49427f'},
} as const;
const tarifler: {cift:MeyveCifti;ad:string;ses:string;renk:string}[] = [
  {cift:['cilek','cilek'],...renkler.kirmizi},
  {cift:['cilek','muz'],...renkler.turuncu},
  {cift:['cilek','kivi'],...renkler.kahve},
  {cift:['cilek','yabanmersini'],...renkler.mor},
  {cift:['cilek','portakal'],...renkler.mercan},
  {cift:['cilek','seftali'],...renkler.mercan},
  {cift:['cilek','sut'],...renkler.pembe},
  {cift:['cilek','uzum'],...renkler.ahududu},
  {cift:['muz','muz'],...renkler.sari},
  {cift:['muz','kivi'],...renkler.yesil},
  {cift:['muz','yabanmersini'],...renkler.yesil},
  {cift:['muz','portakal'],...renkler.turuncu},
  {cift:['muz','seftali'],...renkler.seftali},
  {cift:['muz','sut'],...renkler.krem},
  {cift:['muz','uzum'],...renkler.kahve},
  {cift:['kivi','kivi'],...renkler.kivi},
  {cift:['kivi','yabanmersini'],...renkler.turkuaz},
  {cift:['kivi','portakal'],...renkler.zeytin},
  {cift:['kivi','seftali'],...renkler.zeytin},
  {cift:['kivi','sut'],...renkler.yesil},
  {cift:['kivi','uzum'],...renkler.kahve},
  {cift:['yabanmersini','yabanmersini'],...renkler.mavi},
  {cift:['yabanmersini','portakal'],...renkler.kahve},
  {cift:['yabanmersini','seftali'],...renkler.kahve},
  {cift:['yabanmersini','sut'],...renkler.acikmavi},
  {cift:['yabanmersini','uzum'],...renkler.lacivert},
  {cift:['portakal','portakal'],...renkler.turuncu},
  {cift:['portakal','seftali'],...renkler.turuncu},
  {cift:['portakal','sut'],...renkler.seftali},
  {cift:['portakal','uzum'],...renkler.kahve},
  {cift:['seftali','seftali'],...renkler.seftali},
  {cift:['seftali','sut'],...renkler.seftali},
  {cift:['seftali','uzum'],...renkler.mercan},
  {cift:['sut','sut'],...renkler.beyaz},
  {cift:['sut','uzum'],...renkler.leylak},
  {cift:['uzum','uzum'],...renkler.mor},
];
function karisimTarifi(secim:readonly Meyve[]){
  if(secim.length!==2)return;
  const [a,b]=secim;
  return tarifler.find(({cift})=>(cift[0]===a&&cift[1]===b)||(cift[0]===b&&cift[1]===a));
}
// Two batches of the same fruits can have different textures. On the shelf
// they occupy separate glasses. The permanent recipe book still stores one pair.
export function ayniNumune(a:SmoothieNumunesi,b:SmoothieNumunesi){
  return karisimTarifi(a.meyveler)===karisimTarifi(b.meyveler)&&taneli(a.karisim)===taneli(b.karisim);
}
export function numuneAyir(s:SmoothieKaydi,meyve:readonly Meyve[],karisim:number){
  if(!karisimTarifi(meyve)||karisim<45)return;
  const n:SmoothieNumunesi={meyveler:[meyve[0],meyve[1]],karisim:yuzde(karisim)};
  s.numuneler=[...(s.numuneler??[]).filter(eski=>!ayniNumune(eski,n)),n].slice(-2);
}
export function numuneyiSec(s:SmoothieKaydi,n:SmoothieNumunesi){
  if(!s.numuneler?.some(eski=>ayniNumune(eski,n)))return false;
  if(s.evre!=='dok'&&s.evre!=='servis'&&!(s.evre==='meyve'&&s.meyveler.length===0))return false;
  s.numuneler=s.numuneler.filter(eski=>!ayniNumune(eski,n));
  numuneAyir(s,s.meyveler,s.karisim);
  s.meyveler=[...n.meyveler];s.karisim=n.karisim;s.bardak=0;s.evre='dok';
  delete s.buzlu;
  return true;
}
export function smoothieRengi(secim:readonly Meyve[]){return karisimTarifi(secim)?.renk??'#fff2d3';}
export function renkAdi(secim:readonly Meyve[]){return karisimTarifi(secim)?.ad??'';}
export function renkSesi(secim:readonly Meyve[]){return karisimTarifi(secim)?.ses;}
export function ciftEkle(gecmis:MeyveCifti[],secim:readonly Meyve[]){
  const tarif=karisimTarifi(secim);
  if(!tarif)return;
  if(!gecmis.some(c=>karisimTarifi(c)===tarif))gecmis.push([...tarif.cift]);
}
export function denemeyiSakla(s:SmoothieKaydi,secim:readonly Meyve[]){
  ciftEkle(s.denemeler??=[],secim);
}
export function smoothiePuani(s:SmoothieKaydi,istek:MeyveCifti,buzIstegi?:boolean,bardakIstegi?:BardakIstegi):Yildiz{
  const hedef=karisimTarifi(istek),sonuc=karisimTarifi(s.meyveler);
  // Compare the visible colours, never the hidden ingredients of a sample glass.
  const uzaklik=hedef&&sonuc?Math.hypot(...[1,3,5].map(i=>parseInt(hedef.renk.slice(i,i+2),16)-parseInt(sonuc.renk.slice(i,i+2),16))):Infinity;
  const dogru=sonuc&&hedef&&sonuc.ses===hedef.ses?2:uzaklik<120?1:0;
  const buzFarki=buzIstegi!==undefined&&!!s.buzlu!==buzIstegi?1:0;
  return Math.max(1,1+dogru-(bardakUyuyor(s.bardak,bardakIstegi)?0:1)-(icecekKivamiUyuyor(s.karisim,bardakIstegi)?0:1)-buzFarki) as Yildiz;
}
