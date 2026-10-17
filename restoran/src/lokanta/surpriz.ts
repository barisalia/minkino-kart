/**
 * Gizli sürprizler (ekip/senaryo/RESTORAN.md §9): her biri tek dokunuşla, hiçbiri ipucuyla gösterilmez. Lokanta
 * yalnız bağlamı verir (surprizKur); sürprizler kendi öğelerini kurar, lokantanın akışını bozmaz, ceza yok.
 *
 *  1. Soğan gözyaşı ............ Doğra mini oyununda (Kino'nun mendili, Mino sümkürür)
 *  2. Lokum'un patisi .......... istasyonda 8 sn dokunulmazsa alt kenardan pati uzanır, salatalık dilimi çalar;
 *                                patiye dokunursan Lokum kıkırdayıp geri koyar, dokunmazsan çatır çatır yer
 *  3. Kapı zili ................ zile dokun: oturanlar kapıya bakar, kimse yok, Kino omuz silker
 *  4. Masa örtüsü numarası ..... boş masaya iki kez dokun: Kino örtüyü sihirbaz gibi çeker, tabaklar yerinde, "ta-da!"
 *  5. Tuzluk ................... tuzluğa beş kez dokun: yakındaki müşteri hapşırır
 *  6. Pankek şapka ............. tavana yapışan pankek (Tava) lokantadaysan Kino'nun başına şapka olur
 *  7. Kino'nun patatesi ........ servis yolunda %20 olasılıkla tabaktan bir patates alır; dokunursan utanıp geri koyar
 *  8. Babaanne'nin fotoğrafı ... duvardaki fotoğrafa dokun: göz kırpar
 *  9. Gramofon (süs) ........... müzik çalar, oturan herkes sandalyesinde sallanır
 * 10. Akvaryum (süs) ........... balık parmağı izler
 * 11. Pencereden Fındık ........ kapının camından bakar; dokununca havlar, sıradaki müşteri Nehir abla olur
 * 12. Portakal kabuğu tacı ..... Soy mini oyununda (5-6, tek parça spiral kabuk Lokum'un başına)
 * Ayrıca: Mangal dumanında Kino'nun yüzü is olur, öyle servis eder (mini oyun 'kino-isli' haberi).
 *
 * Görseller: Babaanne'nin fotoğrafı `sus/babaanne-foto` (Gemini sus-1), yoksa kukla kitinin başı çerçevede; Fındık
 * Pati'nin çizimleri; gramofon ve balık sade yer tutucu (CSS; BİTMİŞ ÇİZİM DEĞİL).
 */
import { ses as patiSes } from '../../../pati/src/sesler';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import metin from '../../../content/restoran/surpriz.json';
import type { Urun } from '../mini/arayuz';
import { bakanKur } from '../mini/yika/ortak';
import { kafaEl, nota, p6Ses } from '../mini/yogur/ortak';
import type { Musteri, PlanMusteri } from '../model';
import type { Yer, Yon } from '../olcek';
import { salonSes, sesler } from '../sesler';
import { varlik } from '../varliklar';
import type { Kisi } from './kisi';
import './surpriz.css';

const M = metin.mino;
const K = metin.kino;
const Q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 30) : ms));

const FINDIK = import.meta.glob<string>('../../../assets/pati/findik-{bos,sevinc,yiyor}.webp', { eager: true, query: '?url', import: 'default' });
const findikResmi = (poz: 'bos' | 'sevinc' | 'yiyor') => FINDIK[`../../../assets/pati/findik-${poz}.webp`] ?? null;

/** Gramofon yer tutucu çizimi (süs; Gemini sus-1 'gramofon' gelince resmi): kutu, plak, boru, huni */
export function gramofonCizim(): HTMLElement {
  return h('span.rs-sp-gramofon-ciz', {}, h('i.rs-sp-gr-kutu'), h('i.rs-sp-gr-plak'), h('i.rs-sp-gr-boru'), h('i.rs-sp-gr-huni'));
}

/** Tabakta patates var mı (Kino'nun patatesi §9.7) */
export const patatesVar = (u: Urun) => u.yemek === 'patates' || (u.ozellik.malzemeler.patates?.adet ?? 0) > 0;

export interface SurprizMasa {
  el: HTMLElement;
  i: number;
  yer: Yer;
  oturan: { kisi: Kisi; m: Musteri; durum: string } | null;
  kirli: HTMLElement | null;
}

export interface SurprizBaglam {
  el: HTMLElement;
  katman: HTMLElement;
  kapi: HTMLElement;
  kino: Kisi;
  susKatman: HTMLElement;
  masalar: () => SurprizMasa[];
  yon: () => Yon;
  /** u: boy birimi (css px) */
  u: () => number;
  kinoIs: (f: () => Promise<void>) => Promise<void>;
  kinoYuru: (x: number, y: number) => Promise<void>;
  kinoYerine: () => Promise<void>;
  masaYani: (m: SurprizMasa) => Yer;
  kinoSoyle: (metin: string) => Promise<void>;
  minoSoyle: (metin: string) => Promise<void>;
  /** kapıda biri var mı */
  kapida: () => boolean;
  /** gün açık mı (müşteriler geliyor) */
  acik: () => boolean;
  /** sıradaki müşteri olarak araya al (Fındık → Nehir) */
  araya: (p: PlanMusteri) => boolean;
  menu: () => string[];
  /** açık istasyon ekranı (Lokum'un patisi) */
  istasyon: () => HTMLElement | null;
  kapandi: () => boolean;
}

export interface Surprizler {
  /** mini oyundan / tavadan gelen haber: 'kino-isli', 'kino-sapka' */
  bildir(ad: string): void;
  /** Kino servis yolunda: tabakta patates varsa %20 bir tane alır (dokunulursa geri koyar) */
  patates(u: Urun): Promise<void>;
  /** kapı zili; kapıda müşteri varsa false (lokanta kendi işini yapar) */
  kapiZili(): boolean;
  /** yön / ölçü değişince */
  yerlestir(): void;
  /** tetiklenenler (e2e) */
  readonly gunluk: string[];
  kapat(): void;
}

export function surprizKur(b: SurprizBaglam): Surprizler {
  const gunluk: string[] = [];
  let kapandi = false;
  const zamanlar: number[] = [];
  const zaman = (f: () => void, ms: number) => zamanlar.push(window.setTimeout(f, TEST_MODU ? Math.min(ms, 40) : ms));
  const tetik = (ad: string) => {
    gunluk.push(ad);
    b.el.dataset.surpriz = ad;
  };
  const pct = (v: number) => `${v}%`;

  // ---------------------------------------------------------------- küçük efekt: bir kişinin başının üstünde
  const ustEfekt = (k: Kisi, tur: string, adet = 3) => {
    const e = h('div.rs-sp-efekt', { 'data-efekt': tur }, ...Array.from({ length: adet }, (_, i) => h('i', { style: `--i:${i}` })));
    k.el.append(e);
    window.setTimeout(() => e.remove(), TEST_MODU ? 60 : 1700);
  };
  const oturanlar = () => b.masalar().filter((m) => m.oturan && m.oturan.durum !== 'yuruyor' && m.oturan.durum !== 'gidiyor');

  // ---------------------------------------------------------------- 3. kapı zili
  function kapiZili(): boolean {
    if (b.kapida()) return false;
    salonSes.kapi();
    b.kapi.classList.add('rs-acik');
    zaman(() => b.kapi.classList.remove('rs-acik'), 700);
    for (const m of oturanlar()) {
      m.oturan!.kisi.ifade('saskin', 1100);
      void m.oturan!.kisi.oynat('bak', 700);
      ustEfekt(m.oturan!.kisi, 'soru', 1);
    }
    void b.kinoIs(async () => {
      b.kino.ifade('saskin', 900);
      await b.kino.oynat('bak', 500);
      // omuz silker: iki kez yukarı-aşağı (bütün gövde)
      b.kino.el.classList.add('rs-omuz');
      ustEfekt(b.kino, 'soru', 1);
      await b.kinoSoyle(K.kimse);
      b.kino.el.classList.remove('rs-omuz');
    });
    tetik('kapi');
    return true;
  }

  // ---------------------------------------------------------------- 4. masa örtüsü numarası (boş masaya iki dokunuş)
  let sonMasa: { el: HTMLElement; t: number } | null = null;
  let ortuSurerken = false;
  const masaDokun = (e: PointerEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('.rs-masa');
    if (!el || (e.target as HTMLElement).closest('.rs-hesap, .rs-sp-tuzluk')) return;
    const m = b.masalar().find((x) => x.el === el);
    if (!m || m.oturan || m.kirli || b.kapida() || ortuSurerken) {
      sonMasa = null;
      return;
    }
    const t = performance.now();
    if (sonMasa && sonMasa.el === el && t - sonMasa.t < 450) {
      sonMasa = null;
      void ortuNumarasi(m);
    } else sonMasa = { el, t };
  };
  b.katman.addEventListener('pointerdown', masaDokun, { capture: true });
  async function ortuNumarasi(m: SurprizMasa) {
    ortuSurerken = true;
    tetik('ortu');
    await b.kinoIs(async () => {
      const yan = b.masaYani(m);
      await b.kinoYuru(yan.x, yan.y);
      if (kapandi) return;
      const ortu = m.el.dataset.ortu ?? '';
      // tabaklar ve bardak masaya, örtü (yoksa beyaz) üstünde
      const tabaklar = h('div.rs-sp-ortu-tabaklar', {}, h('i.rs-sp-tabakcik'), h('i.rs-sp-bardak'), h('i.rs-sp-tabakcik'));
      const bez = h('div.rs-sp-bez', { 'data-ortu': ortu || 'beyaz' });
      m.el.append(bez, tabaklar);
      m.el.dataset.ortu = '';
      b.kino.poz('koy');
      sesler.cal('pof', { guc: 0.5 });
      await bekle(700);
      // sihirbaz gibi: hızla çeker
      b.kino.el.classList.add('rs-ceker');
      salonSes.vuu();
      try {
        await bez.animate([{ transform: 'none' }, { transform: 'translateX(18%) scale(1.04,0.96)', offset: 0.25 }, { transform: 'translateX(170%) scale(0.6,1.1)', opacity: 0 }], { duration: sure(380), easing: 'cubic-bezier(.6,0,.9,.5)', fill: 'forwards' }).finished;
      } catch {
        /* yok say */
      }
      bez.remove();
      // tabaklar yerinde: hafifçe titreşir
      try {
        tabaklar.animate([{ transform: 'translateX(-2px)' }, { transform: 'translateX(2px)' }, { transform: 'none' }], { duration: sure(240) });
      } catch {
        /* yok say */
      }
      b.kino.el.classList.remove('rs-ceker');
      // "ta-da!"
      [72, 76, 79, 84].forEach((n, i) => nota(n, i * 0.08, i === 3 ? 0.4 : 0.12, 'triangle', 0.12));
      b.kino.ifade('mutlu', 1200);
      void b.kino.oynat('sevin', 800);
      ustEfekt(b.kino, 'yildiz', 3);
      await b.kinoSoyle(K.tada);
      await bekle(900);
      tabaklar.remove();
      m.el.dataset.ortu = ortu;
      sesler.cal('pof', { guc: 0.4 });
      b.kino.poz('giris');
      await b.kinoYerine();
    });
    ortuSurerken = false;
  }

  // ---------------------------------------------------------------- 5. tuzluk (her masada; beş dokunuş → hapşu)
  const tuzluklar = new Map<HTMLElement, { el: HTMLElement; say: number; t: number }>();
  function tuzlukKur() {
    for (const m of b.masalar()) {
      if (tuzluklar.has(m.el)) continue;
      const el = h('button.rs-sp-tuzluk', { type: 'button', 'aria-label': 'Tuzluk' }, h('i.rs-sp-tuzluk-govde'), h('i.rs-sp-tuzluk-kapak'));
      m.el.append(el);
      const t = { el, say: 0, t: 0 };
      tuzluklar.set(m.el, t);
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const s = performance.now();
        if (s - t.t > 2500) t.say = 0;
        t.t = s;
        t.say++;
        el.classList.remove('rs-salla');
        void el.offsetWidth;
        el.classList.add('rs-salla');
        sesler.cal('citir', { guc: 0.25, perde: 1.8 });
        const tane = h('i.rs-sp-tuz-tane');
        el.append(tane);
        window.setTimeout(() => tane.remove(), TEST_MODU ? 40 : 600);
        if (t.say >= 5) {
          t.say = 0;
          hapsirt(m);
        }
      });
      el.addEventListener('click', (e) => e.stopPropagation());
    }
  }
  function hapsirt(m: SurprizMasa) {
    // yakındaki müşteri: bu masada oturan, yoksa en yakın oturan; kimse yoksa Kino
    const yakin = m.oturan ? m : oturanlar().sort((a, c) => Math.abs(a.yer.x - m.yer.x) - Math.abs(c.yer.x - m.yer.x))[0];
    const k = yakin?.oturan?.kisi ?? b.kino;
    tetik('tuzluk');
    k.ifade('saskin', 500);
    void (async () => {
      await bekle(380);
      p6Ses.oksur();
      nota(70, 0, 0.12, 'sine', 0.07, 3);
      sesler.cal('pof', { guc: 0.7, perde: 1.6 });
      k.ifade('eksi', 700);
      await k.oynat('titre', 420);
      ustEfekt(k, 'hapsir', 3);
      k.ifade('keyif', 900);
      if (k === b.kino) void b.kinoSoyle(K.hapsu);
    })();
  }

  // ---------------------------------------------------------------- 6. pankek şapka, mangal isi (Kino'nun hâli gün boyu)
  function bildir(ad: string) {
    if (kapandi) return;
    if (ad === 'kino-sapka' && !b.kino.el.querySelector('.rs-sp-sapka')) {
      const s = h('i.rs-sp-sapka', {}, h('b'));
      s.style.top = `${(b.kino.olcu.tepe * 100 - 4).toFixed(1)}%`;
      b.kino.el.append(s);
      try {
        s.animate([{ transform: 'translate(-50%,-260%) scale(0.9)' }, { transform: 'translate(-50%,0) scale(1.15,0.8)', offset: 0.85 }, { transform: 'translate(-50%,0)' }], { duration: sure(520), easing: 'cubic-bezier(.5,0,.8,.6)' });
      } catch {
        /* yok say */
      }
      sesler.cal('pof');
      tetik('sapka');
      void b.kinoIs(async () => {
        b.kino.ifade('saskin', 600);
        await b.kino.oynat('hop', 420);
        b.kino.ifade('mutlu', 1200);
        await b.kinoSoyle(K.sapka);
      });
    } else if (ad === 'kino-isli' && !b.kino.el.querySelector('.rs-sp-is')) {
      const o = b.kino.olcu;
      const is = h('i.rs-sp-is', {}, ...Array.from({ length: 6 }, (_, i) => h('b', { style: `--i:${i}` })));
      is.style.top = `${((o.tepe + (o.taban - o.tepe) * 0.13) * 100).toFixed(1)}%`;
      b.kino.el.append(is);
      tetik('isli');
      zaman(() => void b.minoSoyle(M.isli), 600);
    }
  }

  // ---------------------------------------------------------------- 7. Kino'nun patatesi
  async function patates(u: Urun): Promise<void> {
    if (!patatesVar(u) || kapandi) return;
    const zorla = (TEST_MODU || Q.has('onizleme')) && Q.get('patates') === '1';
    if (!zorla && Math.random() >= 0.2) return;
    tetik('patates');
    const cubuk = h('i.rs-sp-patates');
    const o = b.kino.olcu;
    cubuk.style.top = `${((o.tepe + (o.taban - o.tepe) * 0.27) * 100).toFixed(1)}%`;
    b.kino.el.append(cubuk);
    b.kino.poz('patates');
    b.kino.el.classList.add('rs-calar');
    sesler.cal('hop', { guc: 0.4, perde: 1.3 });
    let dokundu = false;
    const dokun = (e: Event) => {
      e.stopPropagation();
      dokundu = true;
    };
    b.kino.el.addEventListener('pointerdown', dokun);
    const bas = performance.now();
    while (!dokundu && performance.now() - bas < (TEST_MODU ? 900 : 2300) && !kapandi) await new Promise((r) => setTimeout(r, 50));
    b.kino.el.removeEventListener('pointerdown', dokun);
    b.kino.el.classList.remove('rs-calar');
    if (dokundu) {
      // utanır, geri koyar
      tetik('patatesGeri');
      b.kino.el.classList.add('rs-kizardi');
      b.kino.ifade('saskin', 500);
      try {
        await cubuk.animate([{ transform: 'none' }, { transform: 'translate(-120%, 60%) scale(0.8)', opacity: 0.2 }], { duration: sure(360), fill: 'forwards' }).finished;
      } catch {
        /* yok say */
      }
      cubuk.remove();
      await b.kinoSoyle(K.pardon);
      b.kino.el.classList.remove('rs-kizardi');
    } else {
      // çatır çatır yer
      tetik('patatesYedi');
      for (let i = 0; i < 3; i++) sesler.cal('kitir', { guc: 0.5, perde: 1.1 + i * 0.05 });
      cubuk.classList.add('rs-yendi');
      b.kino.ifade('keyif', 700);
      await bekle(500);
      cubuk.remove();
    }
    b.kino.poz('tepsi');
  }

  // ---------------------------------------------------------------- 8. Babaanne'nin duvardaki fotoğrafı
  const foto = h('button.rs-sp-foto', { type: 'button', 'aria-label': 'Babaanne' });
  const fotoResim = varlik('sus/babaanne-foto');
  let fotoKafa: ReturnType<typeof kafaEl> | null = null;
  if (fotoResim) foto.append(h('img.rs-sp-foto-resim', { src: fotoResim, alt: '', draggable: 'false' }));
  else {
    fotoKafa = kafaEl('babaanne');
    foto.append(h('i.rs-sp-foto-cerceve', {}, h('i.rs-sp-foto-ic', {}, fotoKafa.el)));
  }
  b.katman.append(foto);
  foto.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    tetik('foto');
    sesler.cal('ting', { perde: 1.3, guc: 0.6 });
    foto.classList.remove('rs-kirp');
    void foto.offsetWidth;
    foto.classList.add('rs-kirp');
    if (fotoKafa) {
      fotoKafa.yuz('kapali', 'kahkaha');
      window.setTimeout(() => fotoKafa?.yuz('acik', 'gulumse'), TEST_MODU ? 60 : 420);
    }
    const kalp = h('i.rs-sp-foto-kalp');
    foto.append(kalp);
    window.setTimeout(() => kalp.remove(), TEST_MODU ? 60 : 1200);
  });
  const FOTO_YER: Record<Yon, { x: number; y: number; w: number; h: number }> = {
    yatay: { x: 89.5, y: 11, w: 7, h: 13 },
    dikey: { x: 74, y: 10.5, w: 12.5, h: 6.8 },
  };

  // ---------------------------------------------------------------- 9-10. gramofon ve akvaryum (süs; alınınca)
  let calarken = false;
  function gramofonCal(el: HTMLElement) {
    if (calarken) return;
    calarken = true;
    tetik('gramofon');
    el.classList.add('rs-caliyor');
    // pentatonik küçük vals (4 sn)
    const ezgi = [67, 71, 74, 71, 72, 76, 79, 76, 74, 71, 67, 71, 72, 74, 76, 79];
    ezgi.forEach((n, i) => nota(n, i * 0.25, 0.24, 'triangle', 0.07));
    [43, 47, 48, 50].forEach((n, i) => nota(n, i * 1, 0.5, 'sine', 0.06));
    const kisiler = [...oturanlar().map((m) => m.oturan!.kisi), b.kino];
    for (const k of kisiler) k.el.classList.add('rs-sallan');
    const notalar = window.setInterval(() => {
      const n = h('i.rs-sp-nota');
      el.append(n);
      window.setTimeout(() => n.remove(), 1600);
    }, TEST_MODU ? 200 : 450);
    zaman(() => {
      clearInterval(notalar);
      el.classList.remove('rs-caliyor');
      for (const k of kisiler) k.el.classList.remove('rs-sallan');
      calarken = false;
    }, 4200);
  }
  interface Balik {
    el: HTMLElement;
    x: number;
    y: number;
    hx: number;
    hy: number;
    yon: number;
  }
  let balik: Balik | null = null;
  let balikRaf = 0;
  let balikIzledi = false;
  function balikDongu() {
    if (!balik || kapandi) return;
    const bl = balik;
    const dx = bl.hx - bl.x;
    const dy = bl.hy - bl.y;
    bl.x += dx * 0.08;
    bl.y += dy * 0.08;
    if (Math.abs(dx) > 1) {
      const yon = dx > 0 ? 1 : -1;
      if (yon !== bl.yon) {
        bl.yon = yon;
        bl.el.dataset.yon = yon > 0 ? 'sag' : 'sol';
      }
    }
    bl.el.style.left = `${bl.x}%`;
    bl.el.style.top = `${bl.y}%`;
    balikRaf = requestAnimationFrame(balikDongu);
  }
  function suslerSus() {
    for (const s of b.susKatman.querySelectorAll<HTMLElement>('.rs-sus[data-sus="gramofon"]')) {
      if (s.dataset.sp) continue;
      s.dataset.sp = '1';
      if (s.classList.contains('rs-sus-yok')) {
        s.classList.add('rs-sp-gramofon');
        s.append(gramofonCizim());
      }
      s.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        gramofonCal(s);
      });
    }
    for (const s of b.susKatman.querySelectorAll<HTMLElement>('.rs-sus[data-sus="akvaryum"]')) {
      if (s.dataset.sp) continue;
      s.dataset.sp = '1';
      s.classList.add('rs-sp-akvaryum');
      const el = h('i.rs-sp-balik', { 'data-yon': 'sag' }, h('b'));
      const kabarcik = h('i.rs-sp-akv-kabarcik');
      s.append(el, kabarcik);
      balik = { el, x: 45, y: 46, hx: 45, hy: 46, yon: 1 };
      // boşta yavaşça gezinir
      const gez = window.setInterval(() => {
        if (!balik || balikTutuluyor) return;
        balik.hx = 25 + Math.random() * 50;
        balik.hy = 34 + Math.random() * 24;
      }, TEST_MODU ? 400 : 2600);
      zamanlar.push(gez);
      let balikTutuluyor = false;
      const izle = (e: PointerEvent) => {
        if (!balik) return;
        const r = s.getBoundingClientRect();
        balik.hx = Math.max(16, Math.min(84, ((e.clientX - r.left) / r.width) * 100));
        balik.hy = Math.max(30, Math.min(64, ((e.clientY - r.top) / r.height) * 100));
      };
      s.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        balikTutuluyor = true;
        try {
          s.setPointerCapture(e.pointerId);
        } catch {
          /* yok say */
        }
        izle(e);
        patiSes.blup(0);
        if (!balikIzledi) {
          balikIzledi = true;
          tetik('akvaryum');
        }
      });
      s.addEventListener('pointermove', (e) => {
        if (balikTutuluyor) izle(e);
      });
      const birak = () => {
        if (balikTutuluyor) patiSes.blup(2);
        balikTutuluyor = false;
      };
      s.addEventListener('pointerup', birak);
      s.addEventListener('pointercancel', birak);
      cancelAnimationFrame(balikRaf);
      balikRaf = requestAnimationFrame(balikDongu);
    }
  }

  // ---------------------------------------------------------------- 11. pencereden (kapının camından) Fındık → Nehir abla
  const findikResim = findikResmi('bos');
  const findik = h('button.rs-sp-findik', { type: 'button', 'aria-label': 'Fındık' }, findikResim ? h('img', { src: findikResim, alt: '', draggable: 'false' }) : h('i.rs-sp-findik-yt'));
  b.kapi.append(findik);
  let findikGoruldu = false;
  let nehirGeldi = false;
  let findikZaman = performance.now() + (Q.get('findik') === '1' ? 300 : TEST_MODU ? 4000 : 25000);
  function findikGoster(v: boolean) {
    findik.classList.toggle('rs-gorunur', v);
  }
  findik.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (!findik.classList.contains('rs-gorunur') || nehirGeldi) return;
    patiSes.hav(2);
    const img = findik.querySelector('img');
    const sevinc = findikResmi('sevinc');
    if (img && sevinc) img.src = sevinc;
    findik.classList.add('rs-havla');
    tetik('findik');
    const istek = b.menu().includes('limonata') ? { tur: 'resimli' as const, tarif: 'limonata' } : { tur: 'surpriz' as const };
    if (b.araya({ musteri: 'nehir', istek })) {
      nehirGeldi = true;
      zaman(() => void b.minoSoyle(M.nehir), 500);
    }
    zaman(() => {
      findikGoster(false);
      findik.classList.remove('rs-havla');
      if (img && findikResim) img.src = findikResim;
    }, 1400);
  });
  // Nehir'in masasının yanında Fındık yerde oturur (kendi kabıyla)
  let yerdeFindik: { el: HTMLElement; masa: HTMLElement } | null = null;
  function nehirYanında() {
    const m = b.masalar().find((x) => x.oturan?.m.id === 'nehir' && x.oturan.durum !== 'yuruyor');
    if (m && !yerdeFindik) {
      const u = findikResmi('bos');
      const el = h('div.rs-sp-yer-findik', {}, u ? h('img', { src: u, alt: '', draggable: 'false' }) : h('i.rs-sp-findik-yt'), h('i.rs-sp-mama-kabi'));
      m.el.append(el);
      yerdeFindik = { el, masa: m.el };
      patiSes.hav(1);
    } else if (m && yerdeFindik && m.oturan?.durum === 'yiyor') {
      const img = yerdeFindik.el.querySelector('img');
      const y = findikResmi('yiyor');
      if (img && y && !img.src.endsWith(y)) img.src = y;
    } else if (!m && yerdeFindik) {
      yerdeFindik.el.remove();
      yerdeFindik = null;
    }
  }

  // ---------------------------------------------------------------- 2. Lokum'un patisi (istasyonda 8 sn dokunulmazsa)
  let sonDokunus = performance.now();
  let patiIstasyon: HTMLElement | null = null;
  let patiSurerken = false;
  const dokunusYaz = () => (sonDokunus = performance.now());
  b.el.addEventListener('pointerdown', dokunusYaz, { capture: true });
  const PATI_MS = Q.has('pati') ? 1200 : TEST_MODU ? 2500 : 8000;
  async function lokumPati(ist: HTMLElement) {
    const adaylar = [...ist.querySelectorAll<HTMLElement>('.rs-p2-parca[data-malzeme="salatalik"]:not([data-gorunum="kirpik"]):not([data-calindi])')].filter((e) => e.getBoundingClientRect().width > 4);
    const dilim = adaylar[Math.floor(Math.random() * adaylar.length)];
    if (!dilim) return;
    patiSurerken = true;
    tetik('pati');
    const ir = ist.getBoundingClientRect();
    const dr = dilim.getBoundingClientRect();
    const hx = dr.left - ir.left + dr.width / 2;
    const hy = dr.top - ir.top + dr.height / 2;
    const pati = h('button.rs-sp-pati', { type: 'button', 'aria-label': 'Pati' }, h('i.rs-sp-pati-kol'), h('i.rs-sp-pati-el', {}, h('b'), h('b'), h('b'), h('b')));
    const pw = Math.max(70, Math.min(110, ir.height * 0.2));
    const boy = ir.height - hy + pw * 0.4;
    pati.style.cssText = `left:${hx - pw / 2}px;width:${pw}px;height:${boy}px`;
    ist.append(pati);
    let dokundu = false;
    pati.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      dokundu = true;
    });
    // pati alttan uzanır
    try {
      await pati.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(-4%) scale(1.03,0.97)', offset: 0.8 }, { transform: 'none' }], { duration: TEST_MODU ? 40 : 700, easing: 'cubic-bezier(.3,.7,.4,1)' }).finished;
    } catch {
      /* yok say */
    }
    if (!ist.isConnected || kapandi) return;
    // dilimi kapar: kopyası patinin elinde, aslı gizlenir
    const kopya = dilim.cloneNode(true) as HTMLElement;
    kopya.classList.add('rs-sp-pati-dilim');
    kopya.style.cssText = `width:${dr.width}px;height:${dr.height}px`;
    pati.querySelector('.rs-sp-pati-el')!.append(kopya);
    dilim.style.visibility = 'hidden';
    dilim.dataset.calindi = '1';
    sesler.cal('hop', { guc: 0.4, perde: 1.4 });
    await bekle(260);
    // geri çekilir (dokunmak için zaman var)
    const cekil = pati.animate([{ transform: 'none' }, { transform: 'translateY(55%)' }], { duration: TEST_MODU ? 400 : 1800, easing: 'ease-in', fill: 'forwards' });
    const bas = performance.now();
    while (!dokundu && performance.now() - bas < (TEST_MODU ? 400 : 1800) && ist.isConnected) await new Promise((r) => setTimeout(r, 40));
    cekil.pause();
    if (!ist.isConnected || kapandi) return;
    if (dokundu) {
      // Lokum kıkırdar, dilimi geri koyar
      tetik('patiGeri');
      const lokum = bakanKur(ist, 'lokum');
      void lokum.gel('alt', Math.min(ir.width - 90, Math.max(90, hx + pw)), Math.min(ir.height * 0.36, 170)).then(() => {
        lokum.yuz('mutlu', 'kahkaha');
        p6Ses.kikir();
      });
      try {
        await pati.animate([{ transform: getComputedStyle(pati).transform === 'none' ? 'none' : getComputedStyle(pati).transform }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 300, fill: 'forwards' }).finished;
      } catch {
        /* yok say */
      }
      dilim.style.visibility = '';
      delete dilim.dataset.calindi;
      kopya.remove();
      sesler.cal('pof', { guc: 0.4 });
      await bekle(900);
      try {
        await pati.animate([{ transform: 'none' }, { transform: 'translateY(105%)' }], { duration: TEST_MODU ? 30 : 420, fill: 'forwards' }).finished;
      } catch {
        /* yok say */
      }
      await lokum.git();
      lokum.sil();
    } else {
      // çatır çatır yer
      tetik('patiYedi');
      try {
        await pati.animate([{ transform: 'translateY(55%)' }, { transform: 'translateY(105%)' }], { duration: TEST_MODU ? 30 : 360, fill: 'forwards' }).finished;
      } catch {
        /* yok say */
      }
      for (let i = 0; i < 3; i++) window.setTimeout(() => sesler.cal('kirt', { guc: 0.5, perde: 0.9 + i * 0.1 }), TEST_MODU ? 0 : i * 170);
      kopya.remove();
    }
    pati.remove();
    patiSurerken = false;
    sonDokunus = performance.now();
  }

  // ---------------------------------------------------------------- yerleşim ve döngü
  function yerlestir() {
    const y = b.yon();
    const f = FOTO_YER[y];
    Object.assign(foto.style, { left: pct(f.x), top: pct(f.y), width: pct(f.w), height: pct(f.h) });
    tuzlukKur();
    suslerSus();
  }
  const dongu = window.setInterval(() => {
    if (kapandi) return;
    tuzlukKur();
    suslerSus();
    nehirYanında();
    // Fındık: gün açıkken arada camdan bakar (Nehir bugün gelmediyse)
    const t = performance.now();
    if (b.acik() && !nehirGeldi && t > findikZaman && !b.istasyon()) {
      findikGoster(true);
      if (!findikGoruldu) findikGoruldu = true;
      findikZaman = t + (TEST_MODU ? 60000 : 60000);
      // camda kalma süresi gerçek zamanlı (test modunda da kısalmaz: e2e dokunabilsin)
      zamanlar.push(
        window.setTimeout(() => {
          if (!nehirGeldi) findikGoster(false);
        }, TEST_MODU || Q.get('findik') === '1' ? 60000 : 9000),
      );
    }
    // Lokum'un patisi: istasyonda dokunulmadan 8 sn (salatalık dilimi tahtadaysa); her istasyon ziyaretinde bir kez
    const ist = b.istasyon();
    if (ist !== patiIstasyon) {
      patiIstasyon = ist;
      sonDokunus = t;
    }
    if (ist && !patiSurerken && !ist.dataset.patiOldu && t - sonDokunus > PATI_MS && ist.querySelector('.rs-p2-parca[data-malzeme="salatalik"]:not([data-gorunum="kirpik"])')) {
      ist.dataset.patiOldu = '1';
      void lokumPati(ist).catch(() => (patiSurerken = false));
    }
  }, 250);

  return {
    bildir,
    patates,
    kapiZili,
    yerlestir,
    gunluk,
    kapat() {
      kapandi = true;
      clearInterval(dongu);
      cancelAnimationFrame(balikRaf);
      zamanlar.forEach((z) => {
        clearTimeout(z);
        clearInterval(z);
      });
      b.katman.removeEventListener('pointerdown', masaDokun, { capture: true });
      b.el.removeEventListener('pointerdown', dokunusYaz, { capture: true });
    },
  };
}
