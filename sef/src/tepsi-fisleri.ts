import type {SiparisMisafiri} from './restoran-karakterleri';
import {dekorlar, type DekorId} from './dekor-verisi';
import {alinanCeyrekler} from './pizza-kesimi';
import {tatliSiparisPuani} from './tatli-siparisi';
import {sutlacHazirlamaPuani,sutlacDeseniOku,sutlacPorsiyonunuOku,type SutlacDeseni,type SutlacPorsiyonu} from './sutlac-tarifi';
import {menemenOku,menemenPuani,type Menemen} from './menemen-tarifi';
import {durumOku,durumPuani,type Durum} from './durum-tarifi';
import {tavukCiftiniOku,tavaKaydiniOku,type TavukCifti,type TavaKaydi} from './tavuk-porsiyonu';
import {kekPorsiyonunuOku,kekFisiniOku,type KekFisi,type KekPorsiyonu} from './minik-kek';
import {omletiOku,omletPuani,type Omlet} from './omlet-tarifi';
import restoranReplikleri from './restoran-replikleri.json';
import {kurabiyeTepsisiniOku,type KurabiyeTepsisi} from './kurabiye-tepsisi';
import {tartIsteginiOku,tartDiziliminiOku,type TartDilimi,type TartIstegi} from './tart-tarifi';
import { pestoFisi,kirmiziFis,misirliFis,bolusmeFisi,type PizzaFisi } from './pizza-tabagi';
import type {ArabaYolu} from './arabali-servis';
import {kumpirFisleri,kumpirFisiniOku,kumpirOku,kumpirPuani,type KumpirFisi,type KumpirTaslak} from './kumpir-tarifi';
import {mantiOku,mantiPuan,type Manti} from './manti-tarifi';
import {citirSalata} from './tarif';
import {simitFisi,simitOku,simitPuani,type SimitTaslak} from './simit-tarifi';
import {tostKalitesi,tostFisi,tostKaydiniOku,type TostTaslak} from './tost-tarifi';
import type {PiknikKaydi} from './piknik';
import type { ServisKaydi } from './kayit';
import type { Yemek, Yildiz } from './yemekler';
import {tatliMi,tatliCarpan,tatliKademeler,type Cuzdan,type TatliCesidi} from './tatli-ekonomi';
import type {TatliTaslagi} from './tatli-atolyesi';
import {susBul} from './susleme-katalog';
import {bosUstalik,ustaligiOku,gunOdulleriniAc,type Ustalik} from './ustalik-kaydi';
import {bosPastane,pastaneyiOku,type Pastane} from './pastane-kaydi';
import {yeniGun,gunuOku,type RestoranGunu} from './restoran-takvimi';
import {kurabiyeSekliniOku,type KurabiyeSekli,tabakRengi,dondurmaTadiniOku,type DondurmaTadi,type TabakRengi} from './tatli-ekonomi';
import {ciftEkle,smoothieOku,smoothiePuani,type BardakIstegi,type MeyveCifti,type SmoothieKaydi} from './smoothie/tarif';

export type Parca = Yemek | 'menemen' | 'durum' | 'omlet' | 'tavuk' | 'icecek' | 'tost' | 'simit' | 'kumpir' | 'manti' | TatliCesidi;
export type Meyve = 'portakal'|'limon'|'kan-portakali';
export const meyveAdi:Record<Meyve,string>={portakal:'Portakal',limon:'Limon','kan-portakali':'Kan portakalı'};
export function icecekUyumu(istenen:Meyve,secilen:Meyve,doluluk:2|3):Yildiz {
  return istenen===secilen ? doluluk : doluluk===3 ? 2 : 1;
}
interface Menu { tatliFisi?:Pick<Masa,'kekFisi'|'tartIstegi'|'sutlacIstegi'>; id:string; misafir:SiparisMisafiri; parcalar:readonly Parca[]; cumle:string; renk:string; icecekIstegi?:Meyve; smoothie?:MeyveCifti; bardakIstegi?:BardakIstegi; pizzaFisi?:PizzaFisi }
export const menuler:readonly Menu[]=[
  {id:'seftali-makarna',misafir:'seftali',parcalar:['makarna'],cumle:'Şeftali Patisi fiyonk makarna istiyor.',renk:'#ffdcc1'},
  {id:'tavsan-salata',misafir:'tavsan',parcalar:['salata'],cumle:'Kino’nun tavşan arkadaşı bahçe salatası istiyor.',renk:'#c9ead8'},
  {id:'zipzip-makarna',misafir:'zipzip',parcalar:['makarna'],cumle:'Zıpzıp fiyonk makarna istiyor.',renk:'#abe4d2'},
  {id:'bulut-krep',misafir:'bulut',parcalar:['krep'],cumle:'Bulut meyveli krep istiyor.',renk:'#e4d3ff'},
  {id:'fiyonk-tavuk',misafir:'salata',parcalar:['makarna','tavuk'],cumle:'Mino, fiyonk makarna ve tavuk istiyor.',renk:'#ffddad'},
  {id:'fiyonk-sis',misafir:'pizza',parcalar:['makarna','sis'],cumle:'Dede Hasan, makarnasının yanında renkli şişler istiyor.',renk:'#bde8dc'},
  {id:'corba-sofrasi',misafir:'corba',parcalar:['corba','mucver','icecek'],cumle:'Lokum, çorba, mücver ve limon suyu istiyor.',renk:'#ffced0',icecekIstegi:'limon'},
  {id:'pizza-molasi',misafir:'corba',parcalar:['pizza','icecek'],cumle:'Lokum, mini pizza ve portakal suyu istiyor.',renk:'#ffddad',icecekIstegi:'portakal'},
  {id:'misirli-pizza',misafir:'corba',parcalar:['pizza'],cumle:'Pizzam mısırlı, peynirli ve domatesli olsun. Zeytin istemiyorum.',renk:'#ffe4a6',pizzaFisi:misirliFis},
  {id:'pesto-pizzasi',misafir:'pizza',parcalar:['pizza'],cumle:'Bugün yeşil soslu pizza istiyorum. Üstüne peynir, domates ve siyah zeytin koyar mısın?',renk:'#c6eab5',pizzaFisi:pestoFisi},
  {id:'kirmizi-pizza',misafir:'salata',parcalar:['pizza'],cumle:'Domates soslu pizzayı çok severim. Benimkine mantar ve mısır koyar mısın?',renk:'#ffccbd',pizzaFisi:kirmiziFis},
  {id:'paylasilan-pizza',misafir:'salata',parcalar:['pizza','icecek'],cumle:'Pizzayı paylaşacağız! Solu mantarlı ve biberli, sağı mısırlı ve peynirli olsun. Yanına da limon suyu, lütfen.',renk:'#bce8d1',icecekIstegi:'limon',pizzaFisi:bolusmeFisi},
  {id:'bahce-tabagi',misafir:'pizza',parcalar:['salata','tavuk'],cumle:'Dede Hasan, salatasının yanında tavuk istiyor.',renk:'#bde8dc'},
  {id:'kahvalti',misafir:'salata',parcalar:['krep','icecek'],cumle:'Mino, meyveli krep ve kan portakalı suyu istiyor.',renk:'#ffced0',icecekIstegi:'kan-portakali'},
  {id:'meyveli-mola',misafir:'corba',parcalar:['icecek'],cumle:'Pembe bir içecek istiyorum.',renk:'#f7c9a8',smoothie:['cilek','sut']},
  {id:'mor-mola',misafir:'salata',parcalar:['icecek'],cumle:'Koyu mor bir içecek isterim.',renk:'#ddd0ed',smoothie:['cilek','yabanmersini']},
  {id:'turuncu-mola',misafir:'corba',parcalar:['icecek'],cumle:'Bugün turuncu bir içecek istiyorum.',renk:'#ffdaae',smoothie:['cilek','muz']},
  {id:'peynirli-tost',misafir:'salata',parcalar:['tost'],cumle:'İçine kaşar peyniri ve domates koyar mısın? Tostum altın renginde olsun.',renk:'#ffdfad'},
  {id:'yesil-tost',misafir:'corba',parcalar:['tost'],cumle:'Tostumun içinde kaşar peyniri ve biber olsun. Biraz da çıtır olsun!',renk:'#c1e7bc'},
  {id:'bahce-tostu',misafir:'pizza',parcalar:['tost'],cumle:'Bana mantarlı, peynirli ve zeytinli bir tost, lütfen. Güzelce kızarsın.',renk:'#e8d5ae'},
  {id:'misirli-kumpir',misafir:'corba',parcalar:['kumpir'],cumle:'Patatesimi çatalla ezer misin? İçine mısır ve turşu istiyorum.',renk:'#ffe3a7'},
  {id:'kumpir-kasar-bezelye',misafir:'corba',parcalar:['kumpir'],cumle:'Patatesimin üstüne kaşar ve bezelye koyar mısın?',renk:'#ffe3a7'},
  {id:'kumpir-koz-zeytin',misafir:'corba',parcalar:['kumpir'],cumle:'Bugün köz biberli, zeytinli bir kumpir istiyorum.',renk:'#ffe3a7'},
  {id:'kumpir-uc-renk',misafir:'corba',parcalar:['kumpir'],cumle:'Üç renkli kumpir isterim! Kaşar, bezelye ve köz biber olsun.',renk:'#ffe3a7'},
  {id:'kumpir-portakal',misafir:'corba',parcalar:['kumpir','icecek'],cumle:'Mısırlı, turşulu bir kumpir istiyorum. Yanına da bir bardak portakal suyu koyar mısın?',renk:'#ffddb7',icecekIstegi:'portakal'},
  {id:'susamli-simit',misafir:'pizza',parcalar:['simit'],cumle:'Bana susamlı bir simit yapar mısın? Altın gibi kızarsın.',renk:'#ffdb9d'},
  {id:'hashasli-simit',misafir:'salata',parcalar:['simit'],cumle:'Bugün haşhaşlı simit istiyorum. Altın renginde pişsin!',renk:'#c7dae9'},
  {id:'kurabiye',misafir:'salata',parcalar:['kurabiye'],cumle:restoranReplikleri.kurabiye,renk:'#ffe9ae'},
  {id:'dondurma',misafir:'corba',parcalar:['dondurma'],cumle:'Bugün çilekli dondurma istiyorum!',renk:'#ffcfd9'},
  {id:'minik-kek',misafir:'pizza',parcalar:['minik-kek'],cumle:restoranReplikleri['minik-kek'],renk:'#e2d6fc'},
  {id:'meyveli-tart',misafir:'pizza',parcalar:['meyveli-tart'],cumle:'Kremalı bir tart alabilir miyim? Üstünde çilek ve kivi olsun.',renk:'#cef0ce'},
  {id:'sutlac',misafir:'salata',parcalar:['sutlac'],cumle:restoranReplikleri.sutlac,renk:'#f6d9c7'},
  {id:'peynir-manti',misafir:'pizza',parcalar:['manti'],cumle:'Üç tane peynirli mantı alabilir miyim? Üzerlerine de yoğurt isterim.',renk:'#fff0bc'},
  {id:'havuc-manti',misafir:'salata',parcalar:['manti'],cumle:'Mantımın içine havuç koyar mısın? Üstüne de domates sosu isterim.',renk:'#ffdbc0'},
  {id:'makarna-kurabiye',misafir:'salata',parcalar:['makarna','kurabiye'],cumle:restoranReplikleri['makarna-kurabiye'],renk:'#ffe0aa'},
  {id:'baba-pizza-kek',misafir:'baba',parcalar:['pizza','minik-kek'],tatliFisi:{kekFisi:'orman'},pizzaFisi:{malzemeler:['domates','peynir','zeytin'],yarilar:{sol:['domates','peynir'],sag:['zeytin']}},cumle:restoranReplikleri['baba-pizza-kek'],renk:'#edd9b3'},
  {id:'babaanne-simit-tart',misafir:'babaanne',parcalar:['simit','meyveli-tart'],tatliFisi:{tartIstegi:'mor'},cumle:restoranReplikleri['babaanne-simit-tart'],renk:'#decff0'},
  {id:'dede-manti-sutlac',misafir:'pizza',parcalar:['manti','sutlac'],tatliFisi:{sutlacIstegi:'kalp'},cumle:restoranReplikleri['dede-manti-sutlac'],renk:'#f2d4a6'},
  {id:'pizza-dondurma',misafir:'corba',parcalar:['pizza','dondurma'],cumle:'Bana küçük bir pizza yapar mısın? Tatlı olarak da çilekli dondurma isterim!',renk:'#ffd5d9'},
  {id:'simit-pembe',misafir:'corba',parcalar:['simit','icecek'],cumle:'Susamlı bir simit ve pembe bir içecek isterim.',renk:'#ffddad',smoothie:['cilek','sut']},
  {id:'tost-mor',misafir:'salata',parcalar:['tost','icecek'],cumle:'Domatesli, peynirli bir tost ve koyu mor bir içecek isterim.',renk:'#ddd0ed',smoothie:['cilek','yabanmersini']},
  {id:'makarna-yesil',misafir:'pizza',parcalar:['makarna','icecek'],cumle:'Bana fiyonk makarna yapar mısın? Yanına da açık yeşil bir içecek isterim.',renk:'#cdeac1',smoothie:['muz','yabanmersini']},
  {id:'pizza-seftali',misafir:'corba',parcalar:['pizza','icecek'],cumle:'Mini pizzamın yanında turuncu bir içecek isterim.',renk:'#ffe1b1',smoothie:['cilek','muz']},
  {id:'simit-leylak',misafir:'salata',parcalar:['simit','icecek'],cumle:'Susamlı bir simit ve açık mavi bir içecek istiyorum.',renk:'#e2d6fc',smoothie:['yabanmersini','sut']},
  {id:'tavuk-ahududu',misafir:'pizza',parcalar:['tavuk','icecek'],cumle:'Tavuğumun yanında kırmızı bir içecek isterim.',renk:'#ffced0',smoothie:['cilek','cilek']},
  {id:'iki-renk-simit',misafir:'pizza',parcalar:['simit'],cumle:'Simidimin bir yarısı susamlı, diğer yarısı haşhaşlı olsun. Altın renginde kızarsın!',renk:'#ffdcab'},
  {id:'sade-simit',misafir:'corba',parcalar:['simit','icecek'],cumle:'Simidimi sade istiyorum. Yanına yarım bardak pembe içecek alabilir miyim? Meyve parçalarını seviyorum.',renk:'#ffd3ad',smoothie:['cilek','sut'],bardakIstegi:{yarim:true,kivam:'taneli'}},
  {id:'cift-kasar',misafir:'salata',parcalar:['tost'],cumle:'Tostuma iki dilim kaşar ve bir dilim domates koyar mısın? Ekmeği çıtır olsun!',renk:'#ffe3ac'},
  {id:'cift-domates',misafir:'pizza',parcalar:['tost','icecek'],cumle:'Tostuma iki dilim domates, bir dilim kaşar istiyorum. Ekmeği altın renginde olsun. Yanına da yarım bardak, pürüzsüz, açık yeşil bir içecek lütfen.',renk:'#c8ebbc',smoothie:['muz','yabanmersini'],bardakIstegi:{yarim:true,kivam:'puruzsuz'}},
  {id:'kino-tost-molasi',misafir:'kino',parcalar:['tost','icecek'],cumle:'Kino, kaşarlı biberli çıtır tost ve portakal suyu istiyor.',renk:'#fbd8a6',icecekIstegi:'portakal'},
  {id:'anne-kahvaltisi',misafir:'anne',parcalar:['simit','icecek'],cumle:'Anne, yarısı susamlı yarısı haşhaşlı simit ve limon suyu istiyor.',renk:'#d7eecf',icecekIstegi:'limon'},
  {id:'aile-kahvaltisi',misafir:'kino',parcalar:['omlet','icecek'],icecekIstegi:'limon',cumle:'Kino peynirli, domatesli omlet istiyor. Anne bir bardak limon suyu istiyor.',renk:'#c9e9d7'},
  {id:'kino-omleti',misafir:'kino',parcalar:['omlet'],cumle:'Kino, peynirli ve domatesli, altın renginde omlet istiyor.',renk:'#ffe29c'},
  {id:'biberli-menemen',misafir:'salata',parcalar:['menemen'],cumle:'Domates ve yeşil biberli menemen alabilir miyim? Yumurtam pişmiş olsun.',renk:'#f6db99'},
  {id:'sade-menemen',misafir:'pizza',parcalar:['menemen'],cumle:'Ben menemenimi sadece domatesli ve biraz sulu seviyorum. Benim için yapar mısın?',renk:'#f3d7a9'},
  {id:'bahce-durumu',misafir:'salata',parcalar:['durum'],cumle:'Marul, domates ve kaşarlı bir dürüm alabilir miyim?',renk:'#d2e9ac'},
  {id:'zeytinli-durum',misafir:'pizza',parcalar:['durum'],cumle:'Kaşar, salatalık ve siyah zeytinli bir dürüm alabilir miyim?',renk:'#f4dca6'},
  {id:'babaanne-simidi',misafir:'babaanne',parcalar:['simit'],cumle:'Babaanne Nazlı haşhaşlı, altın renginde bir simit istiyor.',renk:'#e3cdee'},
  {id:'baba-ogle-pizzasi',misafir:'baba',parcalar:['pizza'],cumle:'Baba Murat, sol yarısı domatesli ve peynirli, sağ yarısı zeytinli pizza istiyor.',renk:'#ffe2b8',pizzaFisi:{malzemeler:['domates','peynir','zeytin'],yarilar:{sol:['domates','peynir'],sag:['zeytin']}}},
  {id:'anne-omleti',misafir:'anne',parcalar:['omlet'],cumle:'Anne, biber ve mantarlı yumuşak bir omlet istiyor.',renk:'#d7ebb7'},
];
export function menuTatlisi(m:Menu){return m.parcalar.find(tatliMi);}
export function menuAcik(m:Menu,seviye:number){
  const tatli=menuTatlisi(m);
  return !tatli||tatliKademeler.findIndex(k=>k.simge===tatli)<=seviye;
}
// Shelf recipes have their own tickets so a practice dish cannot overwrite a waiting table.
const rafMusterileri:Record<Yemek,Menu['misafir']>={corba:'corba',salata:'salata',pizza:'pizza',makarna:'zipzip',krep:'bulut',mucver:'anne',sis:'baba'};
export const rafMenuleri=Object.entries(rafMusterileri).map(([id,misafir]):Menu=>({
  id:'raf-'+id,misafir,parcalar:[id as Yemek],cumle:'',renk:'#a8e5e0'
}));
export const menuBul=(id:string)=>menuler.find(m=>m.id===id)??rafMenuleri.find(m=>m.id===id);
export const yanMi=(id:Parca):id is 'tavuk'|'icecek'=>id==='tavuk'||id==='icecek';
export type Yan = 'tavuk'|'icecek';
type YanTezgah = {tavaKaydi?:TavaKaydi;tavukParcalari?:TavukCifti;adim:Record<Yan,number>; tavukPuani:Yildiz; icecekPuani:Yildiz; icecekMeyvesi:Meyve; icecekMiktari:2|3;smoothie?:SmoothieKaydi};
export type Masa=YanTezgah & {servisKoltugu?:number;beklemeSn?:number;servisHatali?:boolean;teslimAlan?:Menu['misafir'];pizzaCeyrekleri?:number[];sutlacIstegi?:SutlacDeseni;sutlacServisi?:SutlacPorsiyonu;siraliMasada?:boolean;sunumSirasi?:0|1;aileServisi?:('omlet'|'icecek')[];aileMasada?:boolean;tadilan?:Partial<Record<Parca,number>>;menemenTaslagi?:Menemen;menemenServisi?:Menemen;menemenPuan?:Yildiz;durumTaslagi?:Durum;durumServisi?:Durum;durumPuan?:Yildiz;omletTaslagi?:Omlet;omletServisi?:Omlet;omletPuan?:Yildiz;arabada?:boolean;araba?:ArabaYolu;mantiTaslagi?:Manti;mantiServisi?:Manti;mantiPuani?:Yildiz;kumpirFisi?:KumpirFisi;kumpirTaslagi?:KumpirTaslak;kumpirServisi?:KumpirTaslak;kumpirPuan?:Yildiz;simitTaslagi?:SimitTaslak;simitServisi?:SimitTaslak;simitPuan?:Yildiz;smoothieBuzIstegi?:boolean;tostTaslagi?:TostTaslak;tostServisi?:TostTaslak;tostPuani?:Yildiz;piknik?:PiknikKaydi;piknikte?:boolean;tabaklar:Partial<Record<Parca,ServisKaydi|true>>; tekrar?:Partial<Record<Yan,YanTezgah>>; sunuldu:boolean;tatliPuani?:Yildiz;hazirlamaPuani?:Yildiz;tatliTabagi?:TabakRengi;tatliSusu?:string;tartIstegi?:TartIstegi;tartDilimleri?:TartDilimi[];kurabiyeIstegi?:KurabiyeSekli;kekFisi?:KekFisi;kekServisi?:KekPorsiyonu;kurabiyeSekli?:KurabiyeSekli;kurabiyeTepsisi?:KurabiyeTepsisi;dondurmaTadi?:DondurmaTadi;dondurmaIstegi?:DondurmaTadi;susIstegi?:string;tatliFazlaPisti?:boolean;tatliTaslagi?:TatliTaslagi;odenen?:number;sonKazanc?:number};
const bosYan=():YanTezgah=>({adim:{tavuk:0,icecek:0},tavukPuani:3,icecekPuani:3,icecekMeyvesi:'portakal',icecekMiktari:3});
export function yanHazirlaniyor(m:YanTezgah,p:Yan){
  return m.adim[p]>0||(p==='icecek'&&(!!m.smoothie?.meyveler.length||!!m.smoothie?.denemeler?.length));
}
/** Yeni porsiyon tabağa gelene kadar önceki servis ve puanı korunur. */
export function yanTezgahiAc(m:Masa,p:Yan) {
  if(!m.tabaklar[p])return m;
  m.tekrar??={};
  const onceki=m.tekrar[p];
  if(onceki)return onceki;
  const yeni=bosYan();
  if(p==='icecek'&&m.smoothie?.denemeler?.length){
    yeni.smoothie=smoothieOku({denemeler:m.smoothie.denemeler});
  }
  m.tekrar[p]=yeni;return yeni;
}
export function yanTabagiKoy(m:Masa,p:Yan) {
  const yeni=m.tekrar?.[p];
  if(yeni){
    m.adim[p]=yeni.adim[p];
    if(p==='tavuk'){m.tavukPuani=yeni.tavukPuani;m.tavukParcalari=yeni.tavukParcalari;delete m.tavaKaydi;}
    else{m.icecekMeyvesi=yeni.icecekMeyvesi;m.icecekMiktari=yeni.icecekMiktari;m.icecekPuani=yeni.icecekPuani;m.smoothie=yeni.smoothie;}
    delete m.tekrar![p];
  }
  m.tabaklar[p]=true;
}
export function tabakPuani(masa:Masa, parca:Parca):0|Yildiz {
  const tabak=masa.tabaklar[parca];
  if(!tabak)return 0;
  if(parca==='menemen')return masa.menemenPuan??1;
  if(parca==='durum')return masa.durumPuan??1;
  if(parca==='omlet')return masa.omletPuan??1;
  if(parca==='manti')return masa.mantiPuani??1;
  if(parca==='kumpir')return masa.kumpirPuan??1;
  if(parca==='simit')return masa.simitPuan??1;
  if(parca==='tost')return masa.tostPuani??1;
  if(tatliMi(parca))return masa.tatliPuani??1;
  if(parca==='tavuk')return masa.tavukPuani;
  if(parca==='icecek')return masa.icecekPuani;
  if(tabak===true)return 3;
  if(tabak.tarifId==='pizza')return tabak.puan??tabak.pisirme??3;
  return tabak.puan??3;
}

export function tadimSonucu(masa:Masa, istenen:readonly Parca[]) {
  const tabaklar=istenen.map(parca=>({parca,puan:tabakPuani(masa,parca)}));
  const toplam=tabaklar.reduce((t,tabak)=>t+tabak.puan,0);
  const gecikme=(masa.beklemeSn??0)>=300&&toplam>1?1:0;
  const tamPuan=istenen.length*3;
  const ortalama=(toplam-gecikme)/istenen.length;
  const yildiz:Yildiz=toplam-gecikme===tamPuan?3:ortalama>=2?2:1;
  return {tabaklar,toplam:masa.servisHatali?1:toplam-gecikme,tamPuan,yildiz:masa.servisHatali?1 as const:yildiz};
}
export type SofraAni = {menuId:string;gun:number;sira:number;masa:Masa};
export async function sofraKopyasi(masa:Masa){
  // Most plates use only coordinates or asset keys. Old cooking stations flatten
  // custom food into an image; preserve that exact food as a small thumbnail.
  const servis:Masa={...bosMasa(),sunuldu:true,tabaklar:structuredClone(masa.tabaklar)};
  await Promise.all(Object.values(servis.tabaklar).map(async tabak=>{
    if(!tabak||tabak===true||!('resim' in tabak)||!tabak.resim.startsWith('data:'))return;
    const resim=new Image();resim.src=tabak.resim;
    try{
      await resim.decode();
      const tuval=document.createElement('canvas');
      for(const boy of [160,112,80]){
        const oran=boy/Math.max(resim.naturalWidth,resim.naturalHeight);
        tuval.width=Math.max(1,Math.round(oran*resim.naturalWidth));tuval.height=Math.max(1,Math.round(oran*resim.naturalHeight));
        tuval.getContext('2d')!.drawImage(resim,0,0,tuval.width,tuval.height);
        const kucuk=tuval.toDataURL('image/webp',.8);
        if(kucuk.length<=18000){tabak.resim=kucuk;return;}
      }
    }catch{/* An unreadable historical picture still has a recipe cover. */}
    tabak.resim=tabak.tarifId+'/'+tabak.tarifId;
  }));
  const aktar=['beklemeSn','teslimAlan','servisHatali','sutlacServisi','sutlacIstegi','menemenServisi','menemenPuan','durumServisi','durumPuan','omletServisi','omletPuan','kumpirFisi','kumpirServisi','kumpirPuan','mantiServisi','mantiPuani','simitServisi','simitPuan','tostServisi','tostPuani','tatliPuani','hazirlamaPuani','tatliTabagi','tartIstegi','tartDilimleri','kurabiyeSekli','kurabiyeTepsisi','kekServisi','kekFisi','kurabiyeIstegi','dondurmaIstegi','dondurmaTadi','tatliSusu','susIstegi','tatliFazlaPisti','icecekMeyvesi','icecekMiktari','icecekPuani','tavukPuani','tavukParcalari','smoothie','smoothieBuzIstegi','piknik'] as const;
  for(const ad of aktar)if(masa[ad]!==undefined)Object.assign(servis,{[ad]:structuredClone(masa[ad])});
  return servis;
}
export function sofrayiHatirla(t:Tepsiler,menuId:string,servis:Masa,sira:number){
  const mevcut=t.anilar.find(a=>a.sira===sira&&a.gun===t.gun.no&&a.menuId===menuId);
  if(mevcut){mevcut.masa=servis;return;}
  t.anilar=[...t.anilar.slice(-2),{menuId,gun:t.gun.no,sira,masa:servis}];
}
export interface Tepsiler extends Cuzdan { dekorlar?:DekorId[]; yanMasadan?:boolean;servisSalonu?:boolean; konukSirasi?:number; itibar?:number; salonGelisSn?:number; salonBekleme?:Record<string,number>; salonKoltuklari?:(string|null)[]; spesiyal?:SofraAni; spesiyalGunu?:number; renkDefteri:MeyveCifti[]; anilar:SofraAni[]; ekran:'kapali'|'fisler'|'masa'; secili:string; oynanan?:Parca; masalar:Record<string,Masa>; rekorlar:Record<string,number>; restoran?:{sira:number;menuId?:string;sonYemek?:string;spesiyal?:boolean;sayildi?:boolean;yeniPul?:number;evre:'gelis'|'siparis'|'mutfak'}; restoranda?:boolean;gun:RestoranGunu;ustalik:Ustalik;pastane:Pastane }
// Aynı müşteri art arda gelmesin; ikinci ziyaretinde başka bir şey istesin.
const ziyaretler=['corba-sofrasi','fiyonk-tavuk','fiyonk-sis','simit-pembe','cift-kasar','bahce-tabagi','kino-tost-molasi','aile-kahvaltisi','anne-kahvaltisi','baba-ogle-pizzasi','sade-simit','tost-mor','misirli-pizza','cift-domates','pizza-molasi','kahvalti','bahce-tostu','peynirli-tost','pesto-pizzasi','yesil-tost','susamli-simit','hashasli-simit','iki-renk-simit','misirli-kumpir','paylasilan-pizza','peynir-manti','havuc-manti','kumpir-portakal','kirmizi-pizza','makarna-yesil','kumpir-kasar-bezelye','simit-leylak','pizza-seftali','kumpir-koz-zeytin','tavuk-ahududu','turuncu-mola','anne-omleti','kino-omleti','kumpir-uc-renk','babaanne-simidi'];
const ilkMasalar=['corba-sofrasi','fiyonk-tavuk','fiyonk-sis','aile-kahvaltisi','baba-ogle-pizzasi','anne-omleti','misirli-kumpir','bahce-tabagi','kino-tost-molasi','bahce-durumu','paylasilan-pizza','peynir-manti','babaanne-simidi'];
const ziyaretSirasi=[...ilkMasalar,'biberli-menemen',...ziyaretler.filter(id=>!ilkMasalar.includes(id)&&id!=='turuncu-mola'),'zeytinli-durum','sade-menemen'];
export function restoranMenusu(sira:number){return menuBul(ziyaretler[sira%ziyaretler.length])!;}
export function aktifMenu(t:Tepsiler){return menuBul(t.restoran?.menuId??'')??restoranMenusu(t.restoran?.sira??0);}
export function panoyaUygun(ani:SofraAni){
  const menu=menuBul(ani.menuId);
  return !!menu&&ani.masa.sunuldu&&menu.parcalar.every(p=>ani.masa.tabaklar[p])&&tadimSonucu(ani.masa,menu.parcalar).yildiz>=2;
}
export function salondaOturan(t:Tepsiler,misafir:SiparisMisafiri){
  return t.salonKoltuklari?.some(id=>id&&menuBul(id)?.misafir===misafir)??false;
}
export function spesiyalMenusu(t:Tepsiler,siradaki:Menu){
  const ani=t.spesiyal;
  if(!ani||t.gun.no===1&&t.gun.ziyaret<2)return;
  const menu=menuBul(ani.menuId),mevcut=aktifMenu(t);
  if(!menu||!menuAcik(menu,t.tatliSeviye)||menu.misafir===mevcut.misafir||menu.id===mevcut.id)return;
  if(salondaOturan(t,menu.misafir))return;
  if(t.spesiyalGunu===t.gun.no||t.anilar.some(a=>a.gun===t.gun.no&&a.menuId===menu.id))return;
  // Keep the restaurant's savoury/dessert rhythm and the first visit for each new recipe.
  if(!!menuTatlisi(menu)!==!!menuTatlisi(siradaki))return;
  if(tatliMi(siradaki.id)&&!t.rekorlar[siradaki.id]&&siradaki.id!==menu.id)return;
  return menu;
}
export function siradakiSpesiyal(t:Tepsiler){
  return spesiyalMenusu(t,normalMenu(t));
}
export function sonrakiMenu(t:Tepsiler){
  const normal=normalMenu(t);
  return spesiyalMenusu(t,normal)??normal;
}
function normalMenu(t:Tepsiler){
  const sira=t.restoran?.sira??0;
  const mevcut=aktifMenu(t);
  // An explicit old menu keeps its identity. Legacy saves with only a visit index
  // still use the original route through restoranMenusu.
  const onceki=ziyaretSirasi.indexOf(t.restoran?.sonYemek??mevcut.id);
  const siradaki=(onceki<0?sira:onceki)+1;
  const siradakiMenuler=ziyaretSirasi.map((_,i)=>menuBul(ziyaretSirasi[(siradaki+i)%ziyaretSirasi.length])!);
  const ana=siradakiMenuler.find(m=>!salondaOturan(t,m.misafir))??siradakiMenuler[0];
  if(t.tatliSeviye<1||menuTatlisi(mevcut)||(t.gun.no===1&&sira<2))return ana;
  const gun=t.gun.no+Number(t.gun.kapandi);
  if(t.anilar.some(ani=>ani.gun===gun&&menuTatlisi(menuBul(ani.menuId)!)))return ana;
  const acik=menuler.filter(m=>tatliMi(m.id)&&menuAcik(m,t.tatliSeviye)&&!salondaOturan(t,m.misafir));
  const yeni=acik.slice().reverse().find(m=>!t.rekorlar[m.id]&&!t.masalar[m.id]?.sunuldu);
  if(yeni)return yeni;
  // Offer a familiar dessert with lunch once per day, after two savoury visits.
  if((sira+1)%3!==0)return ana;
  const birlikte=menuler.filter(m=>m.parcalar.length>1&&menuTatlisi(m)&&menuAcik(m,t.tatliSeviye)&&!salondaOturan(t,m.misafir));
  const ilk=birlikte.filter(m=>!t.rekorlar[m.id]);
  const aday=ilk.length?ilk:birlikte;
  if(!aday.length)return ana;
  // A stocked dessert belongs after a meal too. Rotate the menu even when
  // yesterday's type is still in the display case.
  const dizi=aday.slice(Math.floor(sira/3)%aday.length).concat(aday.slice(0,Math.floor(sira/3)%aday.length));
  const farkli=dizi.filter(m=>m.misafir!==mevcut.misafir);
  const sirali=farkli.length?farkli:dizi;
  if(ilk.length)return ilk[0];
  const onceTatli=[...t.anilar].reverse().map(a=>menuTatlisi(menuBul(a.menuId)!)).find(Boolean);
  return sirali.find(m=>{const p=menuTatlisi(m)!;return p!==onceTatli&&t.pastane.vitrin[p]?.length;})??sirali[0];
}
export function servisKazanci(m:Masa,parcalar:readonly Parca[]){
  if(m.servisHatali)return 1;
  const bonus=m.susIstegi&&m.susIstegi===m.tatliSusu&&parcalar.some(p=>tatliMi(p)&&m.tabaklar[p])?1:0;
  const salata=m.tabaklar.salata;
  const taze=parcalar.includes('salata')&&salata&&salata!==true&&salata.tarifId==='salata'&&citirSalata(salata.salata)?1:0;
  const bedel=taze+bonus+parcalar.reduce((n,p)=>n+tabakPuani(m,p)*(tatliMi(p)?tatliCarpan[p]:1),0);
  return (m.beklemeSn??0)>=300&&bedel>1?bedel-1:bedel;
}
export const bosMasa=():Masa=>({...bosYan(),tabaklar:{},sunuldu:false});
export const bosTepsiler=():Tepsiler=>({renkDefteri:[],anilar:[],ekran:'kapali',secili:'',masalar:{},rekorlar:{},jeton:0,tatliSeviye:-1,gun:yeniGun(),ustalik:bosUstalik(),pastane:bosPastane()});
export function tepsileriOku(k:Partial<Tepsiler>|undefined,oku:(s:ServisKaydi)=>ServisKaydi|undefined) {
  const t=bosTepsiler(); if(!k||typeof k!=='object')return t;
  if(Number.isSafeInteger(k.jeton)&&k.jeton!>=0)t.jeton=k.jeton!;
  if(Number.isInteger(k.tatliSeviye)&&k.tatliSeviye!>=-1&&k.tatliSeviye!<tatliKademeler.length)t.tatliSeviye=k.tatliSeviye!;
  if(Array.isArray(k.dekorlar))t.dekorlar=dekorlar.filter(d=>k.dekorlar!.includes(d.id)).map(d=>d.id);
  if(k.yanMasadan===true){t.yanMasadan=true;t.servisSalonu=k.servisSalonu===true;}
  if(Array.isArray(k.salonKoltuklari)){
    const gorulen=new Set<string>();
    t.salonKoltuklari=Array.from({length:6},(_,i)=>{
      const id=k.salonKoltuklari?.[i];if(!id||!menuBul(id)||gorulen.has(id))return null;
      gorulen.add(id);return id;
    });
  }
  if(Number.isSafeInteger(k.konukSirasi)&&k.konukSirasi!>=0)t.konukSirasi=k.konukSirasi;
  t.itibar=Number.isFinite(k.itibar)?Math.max(0,Math.min(100,Math.round(k.itibar!))):50;
  t.salonGelisSn=Number.isFinite(k.salonGelisSn)?Math.max(0,Math.min(30,k.salonGelisSn!)):0;
  t.salonBekleme={};
  for(const id of t.salonKoltuklari??[]){
    if(id)t.salonBekleme[id]=Math.max(0,Math.min(120,Number(k.salonBekleme?.[id])||0));
  }
  t.gun=gunuOku(k.gun);
  t.ustalik=ustaligiOku(k.ustalik);
  // A family's existing closed day is sufficient evidence for the first keepsake.
  // Unrecorded historic meals are not counted towards the two skill-based rewards.
  if(!k.ustalik&&(t.gun.no>1||t.gun.kapandi))gunOdulleriniAc(t.ustalik,t.gun.kapandi?t.gun.no:t.gun.no-1);
  t.pastane=pastaneyiOku(k.pastane,menuler.filter(m=>menuAcik(m,t.tatliSeviye)).map(m=>m.id));
  for(const m of [...menuler,...rafMenuleri]){
    if(!menuAcik(m,t.tatliSeviye))continue;
    const eski=k.masalar?.[m.id];if(!eski||typeof eski!=='object')continue;
    const masa=bosMasa(); t.masalar[m.id]=masa;
    if(m.parcalar.includes('sutlac'))masa.sutlacIstegi=sutlacDeseniOku(eski.sutlacIstegi??m.tatliFisi?.sutlacIstegi);
    if(m.parcalar.includes('meyveli-tart'))masa.tartIstegi=tartIsteginiOku(eski.tartIstegi??m.tatliFisi?.tartIstegi);
    if(m.parcalar.includes('minik-kek'))masa.kekFisi=kekFisiniOku(eski.kekFisi??m.tatliFisi?.kekFisi);
    if(m.parcalar.includes('kurabiye'))masa.kurabiyeIstegi=kurabiyeSekliniOku(eski.kurabiyeIstegi);
    if(m.parcalar.includes('dondurma'))masa.dondurmaIstegi=dondurmaTadiniOku(eski.dondurmaIstegi);
    if(m.smoothie&&eski.smoothie)masa.smoothie=smoothieOku(eski.smoothie);
    if(m.smoothie&&typeof eski.smoothieBuzIstegi==='boolean')masa.smoothieBuzIstegi=eski.smoothieBuzIstegi;
    masa.tavaKaydi=tavaKaydiniOku(eski.tavaKaydi);masa.tavukParcalari=tavukCiftiniOku(eski.tavukParcalari);
    if(eski.tavukPuani===1||eski.tavukPuani===2)masa.tavukPuani=eski.tavukPuani;
    if(eski.icecekPuani===1||eski.icecekPuani===2)masa.icecekPuani=eski.icecekPuani;
    if(eski.icecekMeyvesi && Object.hasOwn(meyveAdi,eski.icecekMeyvesi))masa.icecekMeyvesi=eski.icecekMeyvesi;
    if(eski.icecekMiktari===2 || (eski.icecekMiktari===undefined && eski.icecekPuani===2))masa.icecekMiktari=2;
    for(const p of m.parcalar){
      const tabak=eski.tabaklar?.[p];
      const lokma=eski.tadilan?.[p];
      if(tabak&&Number.isInteger(lokma)&&lokma!>0)(masa.tadilan??={})[p]=Math.min(p==='pizza'?(tabak!==true&&tabak.tarifId==='pizza'&&tabak.kesim?.kesikler?.length===2?4:5):p==='sis'?4:3,lokma!);
      if(p==='pizza'&&tabak&&tabak!==true&&tabak.tarifId==='pizza'&&tabak.kesim?.kesikler?.length===2&&masa.tadilan?.pizza)
        masa.pizzaCeyrekleri=alinanCeyrekler(eski.pizzaCeyrekleri,masa.tadilan.pizza);
      if(p==='menemen'){
        if(!eski.sunuldu)masa.menemenTaslagi=menemenOku(eski.menemenTaslagi);
        const sunum=menemenOku(eski.menemenServisi);
        if(tabak===true&&sunum?.evre==='sun'){masa.tabaklar.menemen=true;masa.menemenServisi=sunum;masa.menemenPuan=menemenPuani(sunum,m.id);}
        continue;
      }
      if(p==='durum'){
        if(!eski.sunuldu)masa.durumTaslagi=durumOku(eski.durumTaslagi);
        const rulo=durumOku(eski.durumServisi);
        if(tabak===true&&rulo?.evre==='sun'){masa.tabaklar.durum=true;masa.durumServisi=rulo;masa.durumPuan=durumPuani(rulo,m.id);}
        continue;
      }
      if(p==='omlet'){
        if(!eski.sunuldu)masa.omletTaslagi=omletiOku(eski.omletTaslagi);
        const omlet=omletiOku(eski.omletServisi);
        if(tabak===true&&omlet?.evre==='sun'){masa.tabaklar.omlet=true;masa.omletServisi=omlet;masa.omletPuan=omletPuani(omlet,m.id);}
        continue;
      }
      if(p==='manti'){
        if(!eski.sunuldu)masa.mantiTaslagi=mantiOku(eski.mantiTaslagi);
        const manti=mantiOku(eski.mantiServisi);
        if(tabak===true&&manti?.evre==='sun'){masa.tabaklar.manti=true;masa.mantiServisi=manti;masa.mantiPuani=mantiPuan(manti,m.id);}
        continue;
      }
      if(p==='kumpir'){
        masa.kumpirFisi=kumpirFisiniOku(eski.kumpirFisi??m.id);
        if(!eski.sunuldu)masa.kumpirTaslagi=kumpirOku(eski.kumpirTaslagi);
        const kumpir=kumpirOku(eski.kumpirServisi);
        if(tabak===true&&kumpir?.evre==='koy'&&kumpir.katlar.length){
          masa.kumpirServisi=kumpir;masa.tabaklar.kumpir=true;masa.kumpirPuan=kumpirPuani(kumpir,kumpirFisleri[masa.kumpirFisi]);
        }continue;
      }
      if(p==='simit'){
        if(!eski.sunuldu)masa.simitTaslagi=simitOku(eski.simitTaslagi);
        const simit=simitOku(eski.simitServisi);
        if(tabak===true&&simit?.evre==='sun'&&simit.kaplama){
          masa.simitServisi=simit;masa.tabaklar.simit=true;masa.simitPuan=simitPuani(simit,simitFisi(m.id));
        }
        continue;
      }
      if(p==='tost'){
        if(!eski.sunuldu)masa.tostTaslagi=tostKaydiniOku(eski.tostTaslagi);
        const tost=tostKaydiniOku(eski.tostServisi);
        if(tabak===true&&tost?.evre==='sun'&&tost.katlar.length){
          masa.tostServisi=tost;masa.tabaklar.tost=true;masa.tostPuani=tostKalitesi(tost,tostFisi(m.id));
        }
        continue;
      }
      if(yanMi(p)){
        const n=eski.adim?.[p];masa.adim[p]=typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(6,Math.floor(n))):0;
        if(tabak===true){
          if(m.smoothie&&p==='icecek'){
            if(masa.smoothie?.evre!=='servis')continue;
            masa.icecekPuani=smoothiePuani(masa.smoothie,m.smoothie,masa.smoothieBuzIstegi,m.bardakIstegi);
          }
          masa.tabaklar[p]=true;
          const yeni=eski.tekrar?.[p];
          if(yeni&&typeof yeni==='object'&&!eski.sunuldu){
            const taslak=yanTezgahiAc(masa,p);
            const adim=yeni.adim?.[p];taslak.adim[p]=Number.isFinite(adim)?Math.max(0,Math.min(6,Math.floor(adim))):0;
            taslak.tavaKaydi=tavaKaydiniOku(yeni.tavaKaydi);taslak.tavukParcalari=tavukCiftiniOku(yeni.tavukParcalari);
            if(yeni.tavukPuani===1||yeni.tavukPuani===2)taslak.tavukPuani=yeni.tavukPuani;
            if(yeni.icecekMeyvesi&&Object.hasOwn(meyveAdi,yeni.icecekMeyvesi))taslak.icecekMeyvesi=yeni.icecekMeyvesi;
            if(yeni.icecekMiktari===2)taslak.icecekMiktari=2;
            taslak.icecekPuani=icecekUyumu(m.icecekIstegi??'portakal',taslak.icecekMeyvesi,taslak.icecekMiktari);
            if(m.smoothie&&p==='icecek'&&yeni.smoothie)taslak.smoothie=smoothieOku(yeni.smoothie);
          }
        }
      } else if(tatliMi(p)&&tabak===true&&[1,2,3].includes(eski.tatliPuani??0)){
        if(eski.hazirlamaPuani===1||eski.hazirlamaPuani===2||eski.hazirlamaPuani===3)masa.hazirlamaPuani=eski.hazirlamaPuani;
        masa.tatliPuani=eski.tatliPuani;
        if(p==='sutlac'){
          const sutlac=sutlacPorsiyonunuOku(eski.sutlacServisi);
          if(!sutlac)continue;
          masa.sutlacServisi=sutlac;masa.hazirlamaPuani=sutlacHazirlamaPuani(sutlac);
          masa.tatliPuani=tatliSiparisPuani(p,{sutlac,puan:masa.hazirlamaPuani},masa);
        }
        masa.tabaklar[p]=true;if(p==='minik-kek'&&eski.kekServisi)masa.kekServisi=kekPorsiyonunuOku(eski.kekServisi);if(p==='meyveli-tart')masa.tartDilimleri=tartDiziliminiOku(eski.tartDilimleri);if(p==='kurabiye'){masa.kurabiyeSekli=kurabiyeSekliniOku(eski.kurabiyeSekli);if(eski.kurabiyeTepsisi)masa.kurabiyeTepsisi=kurabiyeTepsisiniOku(eski.kurabiyeTepsisi,3);}if(p==='dondurma')masa.dondurmaTadi=dondurmaTadiniOku(eski.dondurmaTadi);masa.tatliTabagi=tabakRengi(eski.tatliTabagi);masa.tatliSusu=susBul(eski.tatliSusu)?.id;masa.tatliFazlaPisti=eski.tatliFazlaPisti===true;
      } else if(tabak&&typeof tabak==='object'&&tabak.tarifId===p){
        const res=oku(tabak);if(res)masa.tabaklar[p]=res;
      }
    }
    if(Number.isFinite(eski.beklemeSn))masa.beklemeSn=Math.max(0,Math.min(300,Math.floor(eski.beklemeSn!)));
    if(Number.isInteger(eski.servisKoltugu)&&eski.servisKoltugu!>=0&&eski.servisKoltugu!<6)masa.servisKoltugu=eski.servisKoltugu;
    masa.sunuldu=eski.sunuldu===true&&m.parcalar.some(p=>!!masa.tabaklar[p]);
    if(masa.sunuldu&&eski.servisHatali===true){
      masa.servisHatali=true;
      if(eski.teslimAlan&&menuler.some(menu=>menu.misafir===eski.teslimAlan))masa.teslimAlan=eski.teslimAlan;
    }
    if(!masa.sunuldu&&m.parcalar.length===2&&tatliMi(m.parcalar[1])&&m.parcalar.every(p=>masa.tabaklar[p])){
      masa.siraliMasada=eski.siraliMasada===true;masa.sunumSirasi=eski.sunumSirasi===1?1:0;
    }
    if(m.id==='aile-kahvaltisi'&&!masa.sunuldu&&Array.isArray(eski.aileServisi)){
      masa.aileServisi=[...new Set(eski.aileServisi.filter(p=>(p==='icecek'||p==='omlet')&&masa.tabaklar[p]))];
      masa.aileMasada=eski.aileMasada===true&&m.parcalar.some(p=>masa.tabaklar[p]);
    }
    if(!masa.sunuldu&&eski.araba&&m.parcalar.every(p=>masa.tabaklar[p])){
      const x=eski.araba.x;
      masa.araba={x:Number.isFinite(x)?Math.max(13,Math.min(86,x)):14,yuklu:eski.araba.yuklu===true};
      masa.arabada=eski.arabada===true;
    }
    if(m.id==='bahce-tabagi'&&Array.isArray(eski.piknik?.esya)){
      const uygun=new Set<string>(['pecete',...m.parcalar.filter(p=>masa.tabaklar[p])]);
      masa.piknik={esya:[...new Set(eski.piknik.esya.filter(e=>uygun.has(e)))]};
      masa.piknikte=!masa.sunuldu&&eski.piknikte===true;
    }
    if(menuTatlisi(m)&&!masa.sunuldu&&eski.tatliTaslagi&&typeof eski.tatliTaslagi==='object')masa.tatliTaslagi=eski.tatliTaslagi;
    if(menuTatlisi(m)&&!m.parcalar.includes('sutlac'))masa.susIstegi=susBul(eski.susIstegi)?.id;
    const tavan=(masa.susIstegi?1:0)+(m.parcalar.includes('salata')?1:0)+m.parcalar.reduce((n,p)=>n+3*(tatliMi(p)?tatliCarpan[p]:1),0);
    if(Number.isInteger(eski.odenen))masa.odenen=Math.max(0,Math.min(tavan,eski.odenen!));
    else if(masa.sunuldu)masa.odenen=servisKazanci(masa,m.parcalar);
    if(Number.isInteger(eski.sonKazanc))masa.sonKazanc=Math.max(0,Math.min(masa.odenen??0,eski.sonKazanc!));
    const eskiRekor=k.rekorlar?.[m.id];
    if(typeof eskiRekor==='number'&&Number.isInteger(eskiRekor)&&eskiRekor>=1&&eskiRekor<=m.parcalar.length*3)t.rekorlar[m.id]=eskiRekor;
    if(masa.sunuldu)t.rekorlar[m.id]=Math.max(t.rekorlar[m.id]??0,tadimSonucu(masa,m.parcalar).toplam);
  }
  const sec=menuBul(k.secili??'');
  if(sec&&t.masalar[sec.id]){t.secili=sec.id;if(k.oynanan&&sec.parcalar.includes(k.oynanan))t.oynanan=k.oynanan;}
  t.ekran=k.ekran==='fisler'?'fisler':k.ekran==='masa'&&t.secili?'masa':'kapali';
  const r=k.restoran;
  if(r&&Number.isSafeInteger(r.sira)&&r.sira>=0&&['gelis','siparis','mutfak'].includes(r.evre)){
    const m=menuBul(r.menuId??'')??restoranMenusu(r.sira);
    const tatli=menuTatlisi(m);
    const yeniPul=tatli&&r.sayildi===true&&Number.isInteger(r.yeniPul)&&r.yeniPul!>0&&r.yeniPul===(t.pastane.pullar[tatli]??0)?r.yeniPul:undefined;
    if(t.masalar[m.id])t.restoran={sira:r.sira,menuId:m.id,evre:r.evre,yeniPul,...(r.spesiyal===true?{spesiyal:true}:{}),sayildi:r.sayildi===true,sonYemek:ziyaretSirasi.includes(r.sonYemek??'')?r.sonYemek:!tatli?m.id:undefined};
  }
  function aniyiOku(ani:SofraAni|undefined){
    if(!ani||!menuBul(ani.menuId)||!ani.masa||!Number.isSafeInteger(ani.gun)||ani.gun<1||!Number.isSafeInteger(ani.sira)||ani.sira<0)return;
    const masa=tepsileriOku({tatliSeviye:tatliKademeler.length-1,masalar:{[ani.menuId]:ani.masa}},oku).masalar[ani.menuId];
    if(masa?.sunuldu)return {gun:ani.gun,sira:ani.sira,menuId:ani.menuId,masa};
  }
  if(Array.isArray(k.anilar))for(const eski of k.anilar.slice(-3)){
    const ani=aniyiOku(eski);
    if(ani&&!t.anilar.some(a=>a.gun===ani.gun&&a.sira===ani.sira))t.anilar.push(ani);
  }
  const pano=aniyiOku(k.spesiyal);
  if(pano&&panoyaUygun(pano)&&menuAcik(menuBul(pano.menuId)!,t.tatliSeviye))t.spesiyal=pano;
  if(Number.isSafeInteger(k.spesiyalGunu)&&k.spesiyalGunu!>0&&k.spesiyalGunu!<=t.gun.no)t.spesiyalGunu=k.spesiyalGunu;
  t.renkDefteri=smoothieOku({denemeler:k.renkDefteri}).denemeler??[];
  for(const masa of [...Object.values(t.masalar),...t.anilar.map(ani=>ani.masa)]){
    for(const bardak of [masa.smoothie,masa.tekrar?.icecek?.smoothie]){
      for(const cift of bardak?.denemeler??[])ciftEkle(t.renkDefteri,cift);
      if(bardak&&(bardak.evre==='dok'||bardak.evre==='servis'))ciftEkle(t.renkDefteri,bardak.meyveler);
    }
  }
  t.restoranda=!!t.restoran&&k.restoranda===true&&aktifMenu(t).id===t.secili;
  return t;
}
