import dersler from './harfler.json';
import { resim } from './resimler';
import { kelimeResmi } from './kelime-resmi';
import { ekKutuKartlari } from './kutu-ek-resimler';

type Ders = typeof dersler[number];
export type KutuKarti = { id: string; ad: string; gorsel: string; ses: string };

function dersKarti(ders: Ders): KutuKarti {
  return { id: ders.id, ad: ders.example, gorsel: resim(ders.id), ses: ders.id + '-label' };
}

export const kartlar = dersler.map(dersKarti);
const kelimeler = ['at', 'bal', 'masa', 'pil', 'su', 'zil'];
export const baskaOrnekler: KutuKarti[] = kelimeler.map(k => ({
  id: k, ad: k[0].toLocaleUpperCase('tr') + k.slice(1), gorsel: kelimeResmi(k)!, ses: 'kutu-ad-' + k
}));

// Her turda bir doğru resim olsun. Ğ, Türkçede kelimenin içinde aranır.
function eslesir(ad: string, ders: Ders) {
  const kelime = ad.toLocaleLowerCase('tr');
  return ders.lower === 'ğ' ? kelime.includes('ğ') : kelime.startsWith(ders.lower);
}

const ortamlar = [
  ['01','03','04','06','10','11','15','16','17','26'],
  ['02','07','12','14','19','20','29'],
  ['02','08','09','18','19','24','25','28'],
  ['05','13','21','22','23','27'],
  ['03','04','09','11','12','14','17','19'],
  ['05','13','18','21','22','24','25'],
];

function karistir<T>(liste: T[], rastgele:()=>number) {
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

export function kutuTurlari(ders: Ders, secenekSayisi=3, rastgele=Math.random) {
  const ilk = dersKarti(ders);
  const ikinci = [...baskaOrnekler, ...ekKutuKartlari, ...kartlar].find(k =>
    k.id !== ilk.id && (k.id !== 'yogurt' || ders.lower === 'ğ') && eslesir(k.ad, ders));
  const hedefler = ikinci ? [ilk, ikinci] : [ilk];
  const uygun = kartlar.filter(k => !eslesir(k.ad, ders));
  const ortam = karistir(ortamlar.filter(grup => grup.includes(ders.id)), rastgele)[0] ?? [];
  const yakindakiler = karistir(uygun.filter(k => ortam.includes(k.id)), rastgele);
  const digerleri = karistir(uygun.filter(k => !ortam.includes(k.id)), rastgele);
  const yanlislar = [...yakindakiler, ...digerleri];
  return hedefler.map((hedef, i) => ({
    hedef, secenekler: karistir([hedef, ...yanlislar.slice(i * 2, i * 2 + secenekSayisi-1)], rastgele)
  }));
}
