import dersler from './harfler.json';
import { kartlar, baskaOrnekler } from './harf-kutusu-kartlari';
import { ekKutuKartlari } from './kutu-ek-resimler';
import deve from '../../assets/alfabe/hayvan-cagirma/68.webp';
import domates from '../../assets/meyveler/domates.webp';
import dondurma from '../../assets/renkler/dondurma.webp';
import type { AtolyeYasi } from './yas-grubu';

export type Ders = typeof dersler[number];
export type Lokma = { id: string; ad: string; ses: string; resim?: string; harf?: string };
export type Tabak = { kartlar: Lokma[]; hedefler: string[]; siraIle: boolean; etiket: string; soru: string; sesler: string[] };
const kucult = (s:string) => s.toLocaleLowerCase('tr');
const buyut = (s:string) => s.toLocaleUpperCase('tr');

function karistir<T>(liste:T[], rastgele:()=>number) {
  const s = [...liste];
  for(let i=s.length-1;i>0;i--) {const j=Math.floor(rastgele()*(i+1)); [s[i],s[j]]=[s[j],s[i]];}
  return s;
}

export function resimTabaklari(ders:Ders,yas:AtolyeYasi,rastgele=Math.random):Tabak[] {
  const havuz:Lokma[]=[...kartlar,...baskaOrnekler,...ekKutuKartlari].map(k=>({id:k.id,ad:k.ad,resim:k.gorsel,ses:'lokma-'+k.ses}));
  havuz.push({id:'deve',ad:'Deve',resim:deve,ses:'obur-kart-deve'},
    {id:'domates',ad:'Domates',resim:domates,ses:'pano-ad-domates'},
    {id:'dondurma',ad:'Dondurma',resim:dondurma,ses:'obur-kart-dondurma'});
  const uyar=(ad:string,harf:string)=>harf==='Ğ'?kucult(ad).includes('ğ'):buyut(ad).startsWith(harf);
  const ilk=havuz.find(k=>k.id===ders.id)!;
  const sayi=yas==='2-3'?4:5;
  const hedefler=[ilk,...karistir(havuz.filter(k=>k.id!==ilk.id&&uyar(k.ad,ders.upper)),rastgele)].slice(0,sayi);
  // Az örnekli harflerde eksik sorular, adı seslendirilen başka resimleri bulma turudur.
  const diger=karistir(havuz.filter(k=>!uyar(k.ad,ders.upper)),rastgele);
  hedefler.push(...diger.slice(0,sayi-hedefler.length));
  return hedefler.map((hedef,i)=>{
    const isimle=!uyar(hedef.ad,ders.upper)||(yas==='2-3'&&i===0);
    const secenek=karistir(havuz.filter(k=>k.id!==hedef.id&&(isimle||!uyar(k.ad,ders.upper))),rastgele).slice(0,yas==='2-3'?1:yas==='4'?2:3);
    return {kartlar:karistir([hedef,...secenek],rastgele),hedefler:[hedef.id],siraIle:false,etiket:isimle?'':ders.upper,
      soru:isimle?hedef.ad+' resmini bul.':ders.upper==='Ğ'?'Adında ğ olan resmi bul.':ders.upper+' ile başlayan resmi bul.',
      sesler:isimle?['obur-kucuk',hedef.ses]:[ders.upper==='Ğ'?'obur-g':ders.upper==='D'?'obur-d-ara':'obur-bul-'+ders.id]};
  });
}
