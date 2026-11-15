import {sayfalar,type ResimSayfasi} from './boyama-sayfalari';
import {mutfagiOku,yeniMutfak,type MeyveMutfagi} from './meyve-tarifi';
import {kupaKazandi,gosteriOku,yeniGosteri,sahneAnisiniOku,type SahneAnisi,type Gosteri,type GosteriSonucu} from './gosteri-kaydi';
import {ilkGolet,goletiOku,type GoletKaydi} from './golet-kaydi';
export const koseler=['blok','boyahane','su-masasi','kagit','bahce','paylas','muzik','kolye','pano','harf','beslenme','lavabo','oyku','cember','beste','serbest-resim','cicekci','meyve-mutfagi','gosteri'] as const;
export type Kose=typeof koseler[number];
export type Boya='sari'|'mavi'|'kirmizi';
export type BoyaIzi=[number,number][];
export type Karisim='yesil'|'mor'|'turuncu';
export type SuNesnesi='tas'|'yaprak'|'kup'|'kayik';
export const suNesneleri:SuNesnesi[]=['tas','yaprak','kup','kayik'];
export const renkler:Boya[]=['sari','mavi','kirmizi'];
export const kresSahneleri=['okul-kapisi','anasinifi','oyun-odasi','golet','yelken-parkuru','blok','boyahane','kendi-resmim','su-masasi','kagit','bahce','paylas','meyve-mutfagi','gosteri','cicekci','lavabo','oyku','cember','toplan','ev-yolu','veda'] as const;
export type KresSahnesi=typeof kresSahneleri[number];

export type CemberKisi='ceren'|'mino'|'zipzip'|'kino';
export interface BuketKaydi {tur:number;cicekler:number[];asama:'topla'|'say'|'ver'|'hediye';teslim:number;sonBuket?:number[]}
export const buketAdedi=(tur:number)=>[2,3,4,5][tur];
export interface KresKaydi {
  damga:number|null;parkur:{rota:number;adim:number;x:number;y:number};
  golet:GoletKaydi;
  buket:BuketKaydi;
  meyveMutfagi:MeyveMutfagi;
  gosteri:Gosteri;eveYol:number;evKarsilama:'kapi'|'ani'|'goster'|'pano'|'kapanis'|'sarilma';evHareketi:0|1|null;
  evAlbumu:{gun:number;dal:'sarki'|'dans';puan:number;siir?:true;ani?:SahneAnisi}[];evKupasi:boolean;bugununKupasi:SahneAnisi|null;
  beste:Beste; serbestResim:{hamleler:Hamle[];arac:Arac;renk:number;sayfa:ResimSayfasi;taslaklar:Partial<Record<ResimSayfasi,Hamle[]>>};
  anlatilan:Kose|null; duzenPlani:string[]; duzenBitti:string[];
  konusanlar:Exclude<CemberKisi,'ceren'>[];
  limanKitabi:boolean;limanSayfa:number;limanSon:'fener'|'koy'|null;kolyeAyna:boolean;kolyeAlbumu:{kim:'mino'|'zipzip';boncuklar:number[]}[];
  oykuSayfa:number; oykuIzlendi:boolean; oykuDizi:number[];
  gun:number; biten:Kose[]; oncekiGun:{gun:number;biten:Kose[];sonGosterisi?:GosteriSonucu;kupaKazandi?:boolean}|null;
  tabaklar:number[][]; servis:boolean[]; elYikama:number; ovma:number;
  tekneParcalari:number[]; tekneKuruluyor:boolean;
  kalip:number[]; araba:number[]; arabaSuruldu:boolean; arabaRafta:boolean;
  arabaRengi:number; surusKonumu:number; kopruIndi:boolean;
  boyalar:Boya[]; donus:number; baskilar:Karisim[]; boyandi:boolean; fircaElde:boolean; izler:BoyaIzi[]; boyaliResimler:Partial<Record<Karisim,BoyaIzi[]>>;
  deneyGozlemleri:Partial<Record<SuNesnesi,'ust'|'dip'|'serbest'>>;
  kat:number; gemiVar:boolean; gemiRengi:number; gemiKonum:number; gemiTahmin:'ust'|'dip'|null; tahminNesnesi:SuNesnesi|null; sonDeney:{nesne:SuNesnesi;tahmin:'ust'|'dip'}|null; suda:SuNesnesi[]; dalga:boolean;
  tohum:boolean; ekimTarihi:string; sulamaTarihi:string;
  kolyeHatira:number[]; hediye?:'mino'|'zipzip';
}
export const yeniKres=():KresKaydi=>({
  damga:null,parkur:{rota:0,adim:0,x:15,y:73},golet:ilkGolet(),buket:{tur:0,cicekler:[],asama:'topla',teslim:0},meyveMutfagi:yeniMutfak(),gosteri:yeniGosteri(),eveYol:0,evKarsilama:'kapi',evHareketi:null,evAlbumu:[],evKupasi:false,bugununKupasi:null,
  beste:{vuruslar:[],tempo:1},serbestResim:{hamleler:[],arac:'firca',renk:0,sayfa:'bos',taslaklar:{}},
  arabaRengi:0,surusKonumu:0,kopruIndi:false,
  anlatilan:null,duzenPlani:[],duzenBitti:[],konusanlar:[],limanKitabi:false,limanSayfa:0,limanSon:null,kolyeAyna:false,kolyeAlbumu:[],oykuSayfa:0,oykuIzlendi:false,oykuDizi:[],gun:1,biten:[],oncekiGun:null,tabaklar:[[],[]],servis:[false,false],elYikama:0,ovma:0,tekneParcalari:[],tekneKuruluyor:false,kalip:[],araba:[],arabaSuruldu:false,arabaRafta:false,
  boyalar:[],donus:0,baskilar:[],boyandi:false,fircaElde:false,izler:[],boyaliResimler:{},deneyGozlemleri:{},kat:0,gemiVar:false,gemiRengi:0,gemiKonum:65,gemiTahmin:null,tahminNesnesi:null,sonDeney:null,suda:[],dalga:false,
  tohum:false,ekimTarihi:'',sulamaTarihi:'',kolyeHatira:[],
});
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isInteger(v)?Math.max(0,Math.min(max,v)):0;
function sirala<T>(v:unknown,izin:readonly T[]):T[]{
  return Array.isArray(v)?[...new Set(v.filter(i=>izin.includes(i)))]:[];
}
export function kresOku(a?:Partial<KresKaydi>):KresKaydi {
  const k=yeniKres();
  if(!a)return k;
  k.tekneParcalari=sirala(a.tekneParcalari,[0,1,2]);k.tekneKuruluyor=a.tekneKuruluyor===true;
  k.damga=[0,1,2].includes(a.damga!)?a.damga!:null;
  if(a.parkur){k.parkur={rota:int(a.parkur.rota,5),adim:int(a.parkur.adim,4),x:Math.max(8,int(a.parkur.x,92)),y:Math.max(15,int(a.parkur.y,86))}}
  k.golet=goletiOku(a.golet);
  if(a.buket){
    const b=a.buket;k.buket.tur=int(b.tur,3);k.buket.teslim=int(b.teslim,999);
    if(Array.isArray(b.cicekler))k.buket.cicekler=b.cicekler.filter(i=>Number.isInteger(i)&&i>=0&&i<6).slice(0,6);
    if(Array.isArray(b.sonBuket))k.buket.sonBuket=b.sonBuket.filter(i=>Number.isInteger(i)&&i>=0&&i<6).slice(0,5);
    if(k.buket.cicekler.length===buketAdedi(k.buket.tur)&&['say','ver','hediye'].includes(b.asama))k.buket.asama=b.asama;
  }
  k.beste=besteyiOku(a.beste);k.meyveMutfagi=mutfagiOku(a.meyveMutfagi);
  k.gosteri=gosteriOku(a.gosteri);
  const kupa=sahneAnisiniOku(a.bugununKupasi);
  k.bugununKupasi=kupaKazandi(kupa)?kupa:kupaKazandi(k.gosteri.sonAni)?k.gosteri.sonAni:null;
  k.eveYol=typeof a.eveYol==='number'&&Number.isFinite(a.eveYol)?Math.max(0,Math.min(1,a.eveYol)):0;
  if(Array.isArray(a.evAlbumu)){
    const gunler=new Set<number>();
    k.evAlbumu=a.evAlbumu.filter(h=>{
      if(!h||!Number.isInteger(h.gun)||h.gun<1||gunler.has(h.gun)||!['sarki','dans'].includes(h.dal)||!Number.isInteger(h.puan)||h.puan<0||h.puan>10)return false;
      gunler.add(h.gun);if(kupaKazandi(h))k.evKupasi=true;return true;
    }).sort((a,b)=>a.gun-b.gun).slice(-3).map(({gun,dal,puan,ani,siir})=>{
      const a=sahneAnisiniOku(ani),hatira=a&&a.dal===dal&&a.puan===puan?a:null;
      return {gun,dal,puan,...(dal==='sarki'&&(siir===true||hatira?.siir)?{siir:true as const}:{}),...(hatira?{ani:hatira}:{})};
    });
  }
  k.evKupasi=k.evKupasi||a.evKupasi===true;
  if(a.evKarsilama==='ani'||a.evKarsilama==='pano'||a.evKarsilama==='kapanis'||a.evKarsilama==='sarilma'||a.evKarsilama==='goster'&&k.gosteri.sonuc)k.evKarsilama=a.evKarsilama;
  k.evHareketi=a.evHareketi===0||a.evHareketi===1?a.evHareketi:null;
  if(a.serbestResim){
    const secili=a.serbestResim;
    const {hamleler,arac,renk}=panoyuOku({hamleler:secili.hamleler,arac:secili.arac,renk:secili.renk});
    const sayfa=sayfalar.includes(a.serbestResim.sayfa)?a.serbestResim.sayfa:'bos';
    k.serbestResim={hamleler,arac,renk,sayfa,taslaklar:{}};
    for(const ad of sayfalar){
      const eski=a.serbestResim.taslaklar?.[ad];
      if(ad!==sayfa&&Array.isArray(eski))k.serbestResim.taslaklar[ad]=panoyuOku({hamleler:eski}).hamleler;
    }
  }
  const tarih=(s:unknown)=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))?s:'';
  k.gun=Math.max(1,int(a.gun,10000));k.biten=sirala(a.biten,koseler);k.kalip=sirala(a.kalip,[0,1,2]);k.araba=sirala(a.araba,[0,1,2,3]);
  if(a.oncekiGun&&typeof a.oncekiGun==='object'&&a.oncekiGun.gun<k.gun){
    k.oncekiGun={gun:Math.max(1,int(a.oncekiGun.gun,9999)),biten:sirala(a.oncekiGun.biten,koseler)};
    const h=a.oncekiGun.sonGosterisi;
    if(k.oncekiGun.biten.includes('gosteri')&&h&&['sarki','dans'].includes(h.dal)&&Number.isInteger(h.puan)&&h.puan>=0&&h.puan<=10){
      k.oncekiGun.sonGosterisi={dal:h.dal,puan:h.puan,...(h.dal==='sarki'&&h.siir===true?{siir:true as const}:{})};
      k.oncekiGun.kupaKazandi=kupaKazandi(h)||a.oncekiGun.kupaKazandi===true;
    }
  }
  k.konusanlar=sirala(a.konusanlar,['mino','zipzip','kino'] as const).filter((kim,i,dizi)=>kim!=='kino'||i===2&&dizi.length===3);
  k.anlatilan=a.anlatilan&&k.biten.includes(a.anlatilan)?a.anlatilan:null;
  const duzenEsyalari=['bardak','pecete','firca','boya','kabuk','boncuk','kalem','kagit','kare','gunes','ucgen','suluk','tohum','tas','yaprak','marakas','davul','oyku','masal'];
  k.duzenPlani=sirala(a.duzenPlani,duzenEsyalari).slice(0,6);k.duzenBitti=sirala(a.duzenBitti,k.duzenPlani);
  k.limanKitabi=a.limanKitabi===true;k.limanSon=a.limanSon==='fener'||a.limanSon==='koy'?a.limanSon:null;
  k.limanSayfa=Math.min(int(a.limanSayfa,3),k.limanSon?3:2);k.kolyeAyna=a.kolyeAyna===true;
  if(Array.isArray(a.kolyeAlbumu))k.kolyeAlbumu=a.kolyeAlbumu.filter(h=>h&&(h.kim==='mino'||h.kim==='zipzip')&&Array.isArray(h.boncuklar)&&h.boncuklar.length===6&&h.boncuklar.every((n:number)=>Number.isInteger(n)&&n>=0&&n<6)).slice(-8);
  k.oykuSayfa=int(a.oykuSayfa,3);k.oykuIzlendi=a.oykuIzlendi===true;
  k.oykuDizi=sirala(a.oykuDizi,[0,1,2]).filter((n,i)=>n===i);
  k.tabaklar=[0,1].map(i=>{const tabak=a.tabaklar?.[i];return Array.isArray(tabak)?tabak.filter(n=>Number.isInteger(n)&&n>=0&&n<=4).slice(0,5):[]});
  k.servis=[0,1].map(i=>a.servis?.[i]===true);
  k.elYikama=int(a.elYikama,6);k.ovma=int(a.ovma,8);
  k.arabaSuruldu=a.arabaSuruldu===true&&k.araba.length===4;k.arabaRafta=a.arabaRafta===true;
  k.arabaRengi=int(a.arabaRengi,2);
  k.kopruIndi=k.arabaSuruldu||(k.araba.length===4&&a.kopruIndi===true);
  k.surusKonumu=k.arabaSuruldu?1000:k.araba.length===4?int(a.surusKonumu,k.kopruIndi?999:kopruDuragi):0;
  k.boyalar=sirala(a.boyalar,renkler).slice(0,2);k.donus=k.boyalar.length===2?int(a.donus,12):0;
  k.baskilar=sirala(a.baskilar,['mor','turuncu','yesil'] as const);k.boyandi=a.boyandi===true&&k.donus===12;
  function boyayiOku(a:unknown):BoyaIzi[]{
    if(!Array.isArray(a))return [];
    return a.slice(0,80).filter(Array.isArray).map(c=>c.slice(0,180).filter(p=>Array.isArray(p)&&p.length===2&&p.every((n:number)=>Number.isFinite(n)&&n>=0&&n<=120)) as BoyaIzi).filter(c=>c.length);
  }
  k.fircaElde=a.fircaElde===true&&k.donus===12;k.izler=boyayiOku(a.izler);
  for(const renk of k.baskilar)if(a.boyaliResimler?.[renk])k.boyaliResimler[renk]=boyayiOku(a.boyaliResimler[renk]);
  k.gemiRengi=int(a.gemiRengi,2);k.gemiKonum=typeof a.gemiKonum==='number'&&Number.isFinite(a.gemiKonum)?Math.min(80,Math.max(23,a.gemiKonum)):65;
  k.kat=int(a.kat,3);k.gemiVar=a.gemiVar===true||k.kat===3;k.suda=sirala(a.suda,suNesneleri).filter(n=>n!=='kayik'||k.gemiVar);k.dalga=a.dalga===true;
  k.gemiTahmin=a.gemiTahmin==='ust'||a.gemiTahmin==='dip'?a.gemiTahmin:null;
  k.tahminNesnesi=a.tahminNesnesi&&suNesneleri.includes(a.tahminNesnesi)?a.tahminNesnesi:null;
  for(const n of suNesneleri){
    const deger=a.deneyGozlemleri?.[n];
    if(deger==='ust'||deger==='dip'||deger==='serbest')k.deneyGozlemleri[n]=deger;
  }
  k.sonDeney=a.sonDeney&&suNesneleri.includes(a.sonDeney.nesne)&&['ust','dip'].includes(a.sonDeney.tahmin)?{...a.sonDeney}:null;
  k.tohum=a.tohum===true;k.ekimTarihi=tarih(a.ekimTarihi);k.sulamaTarihi=tarih(a.sulamaTarihi);
  k.kolyeHatira=Array.isArray(a.kolyeHatira)?a.kolyeHatira.filter(n=>Number.isInteger(n)&&n>=0&&n<6).slice(0,6):[];
  k.hediye=a.hediye==='mino'||a.hediye==='zipzip'?a.hediye:undefined;
  return k;
}
export function yeniOkulGunu(eski:KresKaydi):KresKaydi{
  const {arabaRafta,arabaRengi,baskilar,boyaliResimler,gemiVar,gemiRengi,tohum,ekimTarihi,sulamaTarihi,kolyeHatira,hediye}=eski;
  const gosteri=yeniGosteri();
  if((eski.gun+1)%2===0)gosteri.program='konser-yanki';
  const son=eski.gosteri.sonuc,kupa=!!eski.bugununKupasi||kupaKazandi(son);
  return {...yeniKres(),damga:eski.damga,parkur:{...eski.parkur},deneyGozlemleri:{...eski.deneyGozlemleri},kolyeAlbumu:[...eski.kolyeAlbumu],tekneParcalari:[...eski.tekneParcalari],gosteri,evAlbumu:[...eski.evAlbumu],evKupasi:eski.evKupasi||kupa,beste:eski.beste,serbestResim:eski.serbestResim,gun:eski.gun+1,oncekiGun:{gun:eski.gun,biten:[...eski.biten],...(son&&eski.biten.includes('gosteri')?{sonGosterisi:{...son},kupaKazandi:kupa}:{})},arabaRafta,arabaRengi,baskilar,boyaliResimler,gemiVar,gemiRengi,tohum,ekimTarihi,sulamaTarihi,kolyeHatira,hediye};
}
export const kopruDuragi=330;
export function tamamla(k:KresKaydi,kose:Kose){if(!k.biten.includes(kose))k.biten.push(kose)}
export function bugun(t=new Date()){return [t.getFullYear(),String(t.getMonth()+1).padStart(2,'0'),String(t.getDate()).padStart(2,'0')].join('-')}
export function bitkiYasi(k:KresKaydi){
  if(!k.ekimTarihi)return -1;
  return Math.min(3,Math.max(0,Math.floor((Date.parse(bugun())-Date.parse(k.ekimTarihi))/86400000)));
}
export function karisim(b:Boya[]):Karisim{
  if(!b.includes('kirmizi'))return 'yesil';
  return b.includes('sari')?'turuncu':'mor';
}
import {panoyuOku,type Hamle,type Arac} from './pano-resmi';
export interface Beste { vuruslar:number[];tempo:number; plak?:{saz:number;an:number}[] }
function besteyiOku(a?:Partial<Beste>):Beste{
  const plak=Array.isArray(a?.plak)?a.plak.filter(p=>p&&Number.isInteger(p.saz)&&p.saz>=0&&p.saz<6&&Number.isFinite(p.an)&&p.an>=0&&p.an<8000).slice(0,64).sort((a,b)=>a.an-b.an):[];
  return {...(plak.length?{plak}:{}),vuruslar:Array.isArray(a?.vuruslar)?a.vuruslar.filter(n=>Number.isInteger(n)&&n>=-1&&n<=5).slice(0,8):[],
    tempo:a?.tempo===0||a?.tempo===2?a.tempo:1};
}
