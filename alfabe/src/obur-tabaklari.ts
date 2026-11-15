import dersler from './harfler.json';
import { kutuTurlari } from './harf-kutusu-kartlari';
import type { AtolyeYasi } from './yas-grubu';

export type Ders = typeof dersler[number];
export type Lokma = { id: string; ad: string; ses: string; resim?: string; harf?: string };
export type Tabak = { kartlar: Lokma[]; hedefler: string[]; siraIle: boolean; etiket: string; soru: string; sesler: string[] };
export const unluler = [...'AEIİOÖUÜ'];
const unsuzler = [...'BLMSTKRN'];
const kucult = (s:string) => s.toLocaleLowerCase('tr');
const buyut = (s:string) => s.toLocaleUpperCase('tr');
export const harfSesi = (harf:string) => dersler.find(d => d.upper === buyut(harf))!.id+'-model';
export const unluKaydi = (harf:string) => 'lokma-unlu-'+harfOrnegi(harf).id;
export const harfOrnegi = (harf:string) => dersler.find(d => d.upper === buyut(harf))!;

function karistir<T>(liste:T[], rastgele:()=>number) {
  const s = [...liste];
  for(let i=s.length-1;i>0;i--) {const j=Math.floor(rastgele()*(i+1)); [s[i],s[j]]=[s[j],s[i]];}
  return s;
}

export function resimTabaklari(ders:Ders,yas:AtolyeYasi,rastgele=Math.random):Tabak[] {
  return kutuTurlari(ders,yas==='2-3'?2:yas==='4'?3:4,rastgele).map((tur,index)=>{
    const isimle = yas==='2-3' && index===0;
    const soru = isimle ? tur.hedef.ad+' resmini bul.' : ders.lower==='ğ' ? 'Adında ğ olan resmi bul.' : ders.upper+' ile başlayan resmi bul.';
    const sesler = isimle ? ['obur-kucuk','lokma-'+tur.hedef.ses] : [ders.lower==='ğ'?'obur-g':'obur-bul-'+ders.id];
    return {kartlar:tur.secenekler.map(k=>({id:k.id,ad:k.ad,ses:'lokma-'+k.ses,resim:k.gorsel})),hedefler:[tur.hedef.id],siraIle:false,etiket:ders.upper,soru,sesler};
  });
}

export function ogrenilecekUnluler(ders:Ders,yas:AtolyeYasi) {
  if(yas==='5+')return [...unluler];
  const grup=yas==='2-3'?2:4;
  const i=unluler.includes(ders.upper)?unluler.indexOf(ders.upper):Number(ders.id)-1;
  const bas=(Math.floor(i/grup)*grup)%8;
  return unluler.slice(bas,bas+grup);
}

export function harfTabaklari(ders:Ders,yas:AtolyeYasi,rastgele=Math.random):Tabak[] {
  const dersUnluleri=ogrenilecekUnluler(ders,yas);
  const deste=karistir(dersUnluleri,rastgele);
  const kart=(h:string):Lokma=>({id:h,harf:h,ad:h,ses:unluler.includes(buyut(h))?unluKaydi(h):harfSesi(h)});
  function tabak(hedefler:string[],digerleri:string[],siraIle:boolean,esle=false):Tabak {
    const etiket=esle?hedefler[0]:siraIle?hedefler.map(buyut).join(' '):'Ünlü';
    return {kartlar:karistir([...hedefler,...digerleri],rastgele).map(kart),hedefler,siraIle,etiket,
      soru:esle?'Göbekteki '+etiket+' harfini bul.':siraIle?'Büyük harflere bak. Küçüklerini sırayla ver.':'Tabaktaki bütün ünlü harfleri bul.',
      sesler:esle?['obur-esle',unluKaydi(etiket)]:[siraIle?'obur-kucuk-harf':'obur-sesli']};
  }
  const rakip=karistir(unsuzler,rastgele);
  if(yas==='2-3')return [
    tabak([deste[0]],[rakip[0]],false,true),
    tabak([deste[1]],[deste[0],rakip[1]],false,true),
    tabak([deste[0]],[rakip[2],rakip[3]],false)
  ];
  if(yas==='4')return [
    tabak([deste[0],deste[1]],[rakip[0],rakip[1]],false),
    tabak([deste[2],deste[3]],[rakip[2],rakip[3]],false),
    tabak(deste.slice(0,2).map(kucult),rakip.slice(0,2).map(kucult),false)
  ];
  return [
    tabak(deste.slice(0,3),rakip.slice(0,3),false),
    tabak(deste.slice(3,6).map(kucult),rakip.slice(3,6).map(kucult),false),
    tabak([deste[6],deste[7],deste[0]].map(kucult),[kucult(deste[1]),...rakip.slice(0,2).map(kucult)],true)
  ];
}
