/**
 * Sahne ekranı (23 Kasım 2026; Barış: "ChatGPT'nin bekleme odası gibi güzel UI'lar; Astra yapsın, sen üzerine kodla kur").
 * Ana ekran, ada haritası, oyun parkı ve ders sahnesi düz paneller yerine tek bir resimli sahnedir: oda fonu (Astra)
 * ekranı kaplar; sahnenin içindeki nesneler (kapılar, bölümler, karakterler) ayrı çizilmiş saydam parçalardır.
 * Dokunulacak nesne sahnenin bir parçasıdır: dokununca yaylanır, kareleriyle canlanır, sonra açılır.
 *
 * Ölçü: nesneler Astra'nın ekran örneğinin pikselinde (2048 × 1152, "bant"). Bant her ekranda **tamamen** görünür
 * (iPad 4:3'te ene, yatay telefonda boya sığar); bandın dışında kalan boşluğu fon doldurur: fon 2560 × 1600'dür ve bant
 * onun ortasındadır (sol üst köşesi x 256, y 224). Böylece hiçbir nesne kırpılmaz, ekranda boş şerit kalmaz.
 *
 * Karakterler: kareleri sırayla gösterilen pozlardır. `konus` kareleri verilirse karakter `.ing-kisi` olur ve ağzı
 * konuşma kaydını izler (ses.ts → agizAyarla). Göz kırpma karesi ara ara görünür. Çizim kodla esnetilmez.
 */
import { h, TEST_MODU } from '../../src/ui/dom';
import type { Kim } from './ses';
import { tik } from './ses';
import { resim, TASLAK } from './varlik';

export const BANT = { en: 2048, boy: 1152 } as const;
export const FON = { en: 2560, boy: 1600, x: 256, y: 224 } as const;

export type Kutu = readonly [x: number, y: number, en: number, boy: number];

export interface SahneNesnesi {
  id: string;
  /** kareler (assets/ingilizce/<yol>.webp); ilki duruş */
  kareler: readonly string[];
  kutu: Kutu;
  /** gözü kapalı kare (ara ara görünür) */
  kirp?: string;
  /** konuşan karakter: kareler 0 kapalı, 1–2 açık ağız; ağız konuşma kaydını izler */
  kim?: Kim;
  /** erişilebilir ad; `tikla` verilirse nesne düğmedir */
  ad?: string;
  tikla?: () => void;
  /** boşta küçük canlılık */
  canlilik?: 'nefes' | 'sallan' | 'suzul';
  /** dokununca oynayacak kareler [kare no, ms] (açılmadan önce) */
  dokunus?: readonly (readonly [number, number])[];
}

export interface Nesne {
  el: HTMLElement;
  kare(i: number): void;
  oyna(adimlar: readonly (readonly [number, number])[]): Promise<boolean>;
}

export interface Sahne {
  kok: HTMLElement;
  bant: HTMLElement;
  nesne(id: string): Nesne | undefined;
  /** fonun ve bütün karelerin çizimi var mı (yoksa eski ekran gösterilir; taslakta yer tutucuyla kurulur) */
  hazir: boolean;
  birak(): void;
}

const yuzde = (k: Kutu) => ({ left: `${(k[0] / BANT.en) * 100}%`, top: `${(k[1] / BANT.boy) * 100}%`, width: `${(k[2] / BANT.en) * 100}%`, height: `${(k[3] / BANT.boy) * 100}%` });
const SAHNE_DENEME = typeof location !== 'undefined' && new URLSearchParams(location.search).has('sahne');
const azHareket = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Sahnede kullanılacak bütün çizimler var mı (fon + kareler) */
export function sahneCizimleriVar(fon: string, nesneler: readonly SahneNesnesi[]): boolean {
  return [fon, ...nesneler.flatMap((n) => [...n.kareler, ...(n.kirp ? [n.kirp] : [])])].every((y) => !!resim(y));
}

export function sahneKur(sinif: string, fon: string, nesneler: readonly SahneNesnesi[]): Sahne {
  const zamanlar = new Set<number>();
  let acik = true;
  const sonra = (fn: () => void, ms: number) => { const z = window.setTimeout(() => { zamanlar.delete(z); if (acik) fn(); }, ms); zamanlar.add(z); };
  const bekle = (ms: number) => new Promise<void>((r) => sonra(r, TEST_MODU ? Math.min(ms, 15) : ms));

  const fonEl = h('div.ing-sh-fon');
  const fonAdresi = resim(fon);
  if (fonAdresi) fonEl.style.backgroundImage = `url("${fonAdresi}")`; else fonEl.classList.add('ing-sh-fonsuz');
  const bant = h('div.ing-sh-bant', {}, fonEl);
  const kok = h(`section.ing-sh.${sinif}`, {}, bant);
  const elemanlar = new Map<string, Nesne>();

  for (const n of nesneler) {
    const ic = h('span.ing-sh-ic');
    if (n.canlilik) ic.classList.add(`ing-sh-${n.canlilik}`);
    ic.style.setProperty('--gecikme', `${-((n.kutu[0] * 7 + n.kutu[1] * 3) % 2400)}ms`);
    const kareler = n.kareler.map((yol, i) => {
      const adres = resim(yol);
      const img = adres ? h('img.ing-sh-resim', { src: adres, alt: '', draggable: 'false' }) : h('span.ing-sh-yok', {}, yol.split('/').pop() ?? '');
      if (n.kim && i < 3) img.dataset.kare = `konus-${i}`;
      img.hidden = i > 0;
      ic.append(img);
      return img;
    });
    let kirpEl: HTMLElement | null = null;
    if (n.kirp && resim(n.kirp)) { kirpEl = h('img.ing-sh-resim', { src: resim(n.kirp)!, alt: '', draggable: 'false' }); kirpEl.hidden = true; ic.append(kirpEl); }
    if (n.kim) {
      // ağzı konuşmayı izler: ses.ts bu öğedeki konus-N karelerini açıp kapatır
      ic.classList.add('ing-kisi', 'ing-sh-kisi');
      ic.dataset.kim = n.kim;
      ic.dataset.agiz = '0';
      ic.dataset.agizSayisi = String(Math.min(3, kareler.length));
    }
    const el = n.tikla
      ? h('button.ing-sh-nesne.ing-sh-dugme', { type: 'button', 'aria-label': n.ad ?? n.id, 'data-nesne': n.id }, ic)
      : h('span.ing-sh-nesne', { 'aria-hidden': 'true', 'data-nesne': n.id }, ic);
    Object.assign(el.style, yuzde(n.kutu));

    let simdi = 0, oyunNo = 0;
    const kare = (i: number) => { simdi = i; kareler.forEach((k, j) => { k.hidden = j !== i; }); if (kirpEl) kirpEl.hidden = true; };
    const oyna = async (adimlar: readonly (readonly [number, number])[]) => {
      const no = ++oyunNo;
      for (const [i, ms] of adimlar) {
        if (no !== oyunNo || !acik) return false;
        kare(i);
        await bekle(ms);
      }
      return no === oyunNo;
    };
    // göz kırpma: duruş karesindeyken ve konuşmuyorken
    if (kirpEl && !TEST_MODU && !azHareket()) {
      const kirp = () => {
        if (simdi === 0 && ic.dataset.agiz !== '1' && ic.dataset.agiz !== '2' && kareler[0] && !kareler[0].hidden) {
          kareler[0].hidden = true; kirpEl!.hidden = false;
          sonra(() => { if (simdi === 0) { kirpEl!.hidden = true; kareler[0].hidden = false; } }, 130);
        }
        sonra(kirp, 2200 + Math.random() * 3200);
      };
      sonra(kirp, 800 + Math.random() * 2400);
    }
    if (n.tikla) {
      const tikla = n.tikla, dokunus = n.dokunus;
      el.addEventListener('click', async () => {
        tik.sec();
        el.classList.remove('ing-sh-basildi'); void el.offsetWidth; el.classList.add('ing-sh-basildi');
        // dokunuşa anında karşılık: kareler oynar (sandık açılır, minder çöker), sonra bölüm açılır
        if (dokunus?.length) { await oyna(dokunus); } else await bekle(220);
        if (acik) tikla();
      });
    }
    bant.append(el);
    elemanlar.set(n.id, { el, kare, oyna });
  }

  return {
    kok, bant,
    nesne: (id) => elemanlar.get(id),
    // taslakta yalnız ?sahne ile yer tutucuyla açılır (öbür taslak denemeleri eski ekranı görsün)
    hazir: (TASLAK && SAHNE_DENEME) || sahneCizimleriVar(fon, nesneler),
    birak() { acik = false; zamanlar.forEach((z) => clearTimeout(z)); zamanlar.clear(); },
  };
}
