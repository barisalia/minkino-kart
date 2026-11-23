// Hece Köprüsü ve Posta Kutusu için ortak sözcük kaynağı (yönetici, 21 Kasım: "her oturumda başka üç sözcük gelsin").
// Resmi ve Ceren'in ad kaydı olan her sözcük birleşir: sözcük havuzu (Astra H6/H8), Pano sözcükleri (ders örnekleri ve
// eklenenler), Obur ve Harf Kutusu kartları. Aynı ad bir kez (önce havuzdaki, Astra'nın çizimi). Çizim gerekmez.
// Köprüye yalnız tek sözcüklü, en az iki heceli ve bütün hecelerinin kaydı olan sözcükler girer; hece kaydı ya Pano/havuz
// kaydıdır ya da açık hecede Hece Evleri kaydı (ev-n-a gibi). Kaydı olmayan hece sözcüğü dışarıda bırakır, tahmin edilmez.
import { cerenKaydiVar } from './konusma-dersi';
import { baskaOrnekler, kartlar } from './harf-kutusu-kartlari';
import { ekKutuKartlari } from './kutu-ek-resimler';
import { oburResimleri } from './obur-resimleri';
import { adSesi, heceler as panoHeceleri, panoAdi, panoResmi, parcaSesi } from './pano-sozcukleri';
import { acikHeceSesi, hecele } from './posta-kutusu-secim';
import { havuzSozcukleri, type HavuzSozcugu } from './sozcuk-havuzu';

type Ham = { id: string; ad: string; gorsel?: string; ses: string; heceler?: string[] };
const UNLU = /[aeıioöuü]/;
const kucuk = (s: string) => s.toLocaleLowerCase('tr');

/** Hecenin kaydı: Pano/havuz kaydı varsa o, yoksa açık hecede Hece Evleri kaydı; hiçbiri yoksa undefined. */
export function heceKaydi(h: string, kayitVar: (id: string) => boolean = cerenKaydiVar): string | undefined {
  const p = parcaSesi(h);
  if (kayitVar(p)) return p;
  if (h.length === 2 && !UNLU.test(h[0]) && UNLU.test(h[1])) { const e = acikHeceSesi(h[0], h[1]); if (kayitVar(e)) return e; }
  return undefined;
}

/** Bütün kaynaklar, aynı ad bir kez. Havuz sözcükleri kendi kimliğini korur (oyun kayıtlarındaki "görülen" listesi bozulmasın). */
export function resimliSozcukler(yas: '4' | '5+'): HavuzSozcugu[] {
  const havuz = havuzSozcukleri(yas);
  const ham: Ham[] = [
    ...Object.entries(panoHeceleri).map(([id, hc]) => ({ id, ad: panoAdi(id), gorsel: panoResmi(id), ses: adSesi(id), heceler: hc })),
    ...oburResimleri.map(o => ({ id: o.id, ad: o.ad, gorsel: o.resim, ses: o.ses })),
    ...kartlar, ...baskaOrnekler, ...ekKutuKartlari,
  ];
  const gorulen = new Set(havuz.map(s => kucuk(s.ad)));
  const ekler: HavuzSozcugu[] = [];
  for (const s of ham) {
    const ad = kucuk(s.ad);
    if (!s.gorsel || gorulen.has(ad) || !cerenKaydiVar(s.ses)) continue;
    gorulen.add(ad);
    const tek = !ad.includes(' ');
    const hc = s.heceler ?? (tek ? hecele(ad) : [ad]);
    const sesler = hc.map(h => heceKaydi(h));
    const pano = tek && hc.length >= 2 && sesler.every(Boolean);
    ekler.push({ id: ad, ad: s.ad[0].toLocaleUpperCase('tr') + s.ad.slice(1), harf: ad[0].toLocaleUpperCase('tr'), gorsel: s.gorsel, ses: s.ses,
      heceler: hc, heceSesleri: pano ? sesler as string[] : [], pano, ders: false });
  }
  return [...havuz, ...ekler];
}
