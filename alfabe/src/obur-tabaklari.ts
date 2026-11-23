import dersler from './harfler.json';
import { kartlar, baskaOrnekler } from './harf-kutusu-kartlari';
import { ekKutuKartlari } from './kutu-ek-resimler';
import { oburResimleri } from './obur-resimleri';
import { aileler, aileResmi } from './hayvan-aileleri';
import deve from '../../assets/alfabe/hayvan-cagirma/68.webp';
import domates from '../../assets/meyveler/domates.webp';
import dondurma from '../../assets/renkler/dondurma.webp';

export type Ders = typeof dersler[number];
export type Lokma = { id: string; ad: string; ses: string; resim?: string; harf?: string };
export type Tabak = { kartlar: Lokma[]; hedefler: string[]; siraIle: boolean; etiket: string; soru: string; sesler: string[] };
const kucult = (s:string) => s.toLocaleLowerCase('tr');
const buyut = (s:string) => s.toLocaleUpperCase('tr');
// Üçü de doğru bir adlandırma olur: jet bir uçak, vapur bir gemi, uskumru bir balıktır.
const karisabilenResimler: Record<string,string> = { Jet:'Uçak', Vapur:'Gemi', Uskumru:'Balık', Öküz:'İnek' };

function karistir<T>(liste:T[], rastgele:()=>number) {
  const s = [...liste];
  for(let i=s.length-1;i>0;i--) {const j=Math.floor(rastgele()*(i+1)); [s[i],s[j]]=[s[j],s[i]];}
  return s;
}

export function resimTabaklari(ders:Ders,rastgele=Math.random):Tabak[] {
  const havuz:Lokma[]=[...kartlar,...baskaOrnekler,...ekKutuKartlari].map(k=>({id:k.id,ad:k.ad,resim:k.gorsel,ses:'lokma-'+k.ses}));
  havuz.push({id:'deve',ad:'Deve',resim:deve,ses:'obur-kart-deve'},
    {id:'domates',ad:'Domates',resim:domates,ses:'pano-ad-domates'},
    {id:'dondurma',ad:'Dondurma',resim:dondurma,ses:'obur-kart-dondurma'});
  havuz.push(...oburResimleri);
  for (const [harf,[ad]] of Object.entries(aileler)) {
    if (havuz.some(k=>k.ad===ad)) continue;
    havuz.push({id:'hayvan-'+harf,ad,resim:aileResmi(harf,false),ses:'aile-'+harf.codePointAt(0)+'-2'});
  }
  const uyar=(ad:string,harf:string)=>harf==='Ğ'?kucult(ad).includes('ğ'):buyut(ad).startsWith(harf);
  const ilk=havuz.find(k=>k.id===ders.id)!;
  // Obur yalnız 2–3 yaşın dersinde çıkar (çift numaralı harfler; 4 ve 5+ derste Resimde Bul): 3 tabak yeter
  // (18 Kasım, "tekrarcı, uzun"). Her tabakta istenen resim ve bir yanlış; Ceren resmin adını söyler.
  // 19 Kasım temizlik: kısa düzenden sonra hiç açılmayan 4/5+ dalı (5 tabak, "… ile başlayan resmi bul") kaldırıldı.
  const hedefler=[ilk,...karistir(havuz.filter(k=>k.id!==ilk.id&&uyar(k.ad,ders.upper)),rastgele)].slice(0,3);
  const yanlislar=havuz.slice(0,kartlar.length).filter(k=>!uyar(k.ad,ders.upper));
  return hedefler.map(hedef=>{
    const secenek=karistir(yanlislar.filter(k=>k.ad!==karisabilenResimler[hedef.ad]),rastgele).slice(0,1);
    return {kartlar:karistir([hedef,...secenek],rastgele),hedefler:[hedef.id],siraIle:false,etiket:ders.upper,
      soru:hedef.ad+' resmini bul.',sesler:['obur-kucuk',hedef.ses]};
  });
}
