/**
 * Kino ve Ailesi bölümünü uygulamanın içinde canlı motorla oynatır (mp4 yok: paket küçük, çevrimdışı). YouTube
 * kaydıyla aynı bölüm dosyası, aynı kurulum (kurulum.ts) ve aynı ses karışımı (karisim.ts → karisimKur); seslendirme
 * uygulama için sıkıştırılmış kopyadan (assets/film-seri2/ses, mono 64 kbps; scripts/film/seri2-ses-uygulama.mjs),
 * düzey YouTube kaydının loudnorm ölçümüyle (content/film2/<bolum>-duzey.json varsa).
 *
 * Çizgi Filmler'in (film/src/ekranlar.ts) deseni: 16:9 kadraj; telefonda ekran yatay kilitlenir, web sitesinde dikey
 * tutulursa kadraj ortada ve altında "telefonu çevir" simgesi; uygulama arka plana geçince duraklar. Düğmeler:
 * Çizgi Filmler'e dön, duraklat/devam, altyazı aç/kapat. İlerleme cihazda (localStorage minkino-film2-v1).
 * Menüde yok (katalog.ts → SERI2_MENUDE); deneme: /film/?seri2=bolum-01
 */
import { sesiAc } from '../../../src/audio/ses';
import { baglam } from '../../../src/audio/motor';
import { uygulamaPlatformu } from '../../../src/kabuk/ortam';
import { arkaPlanDinle, yonIste } from '../../../src/kabuk/yon';
import { h, svg } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../../src/uygulama';
import { CEVIR } from '../ekranlar';
import { bolumParcalari, type Seri } from './bicim';
import { karisimKur } from './karisim';
import { seri2Bolum } from './katalog';
import { kur, Surucu, type Kurulum } from './kurulum';
import './film2.css';
import seriJson from '../../../content/film2/seri.json';

const seri = seriJson as unknown as Seri;
const SES: Record<string, string> = import.meta.glob<string>('../../../assets/film-seri2/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const DUZEY: Record<string, { kazancDb: number }> = import.meta.glob('../../../content/film2/*-duzey.json', { eager: true, import: 'default' });
const sesAdresi = (kimlik: string) => SES[`../../../assets/film-seri2/ses/${kimlik}.mp3`] ?? null;

const DURAKLAT = '<svg viewBox="0 0 48 48"><rect x="12" y="10" width="8" height="28" rx="3" fill="currentColor"/><rect x="28" y="10" width="8" height="28" rx="3" fill="currentColor"/></svg>';
const ALTYAZI = '<svg viewBox="0 0 48 48"><rect x="6" y="11" width="36" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M13 23h8M25 23h10M13 30h14M31 30h4" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';

// ---------------------------------------------------------------- ilerleme (yalnız cihazda)
export const ILERLEME_ANAHTARI = 'minkino-film2-v1';
interface Ilerleme {
  /** kaldığı an (sn) */
  t: number;
  bitti: boolean;
  /** son izleme (ms) */
  zaman: number;
}
export function ilerlemeOku(): Record<string, Ilerleme> {
  try {
    return JSON.parse(localStorage.getItem(ILERLEME_ANAHTARI) ?? '{}') as Record<string, Ilerleme>;
  } catch {
    return {};
  }
}
function ilerlemeYaz(bolum: string, i: Partial<Ilerleme>) {
  try {
    const hepsi = ilerlemeOku();
    hepsi[bolum] = { ...{ t: 0, bitti: false }, ...hepsi[bolum], ...i, zaman: Date.now() };
    localStorage.setItem(ILERLEME_ANAHTARI, JSON.stringify(hepsi));
  } catch {
    /* gizli sekme: ilerleme tutulmaz, bölüm oynar */
  }
}
const ALTYAZI_ANAHTARI = 'minkino-film2-altyazi-v1';

export function seri2Ekrani(app: Uygulama, p?: { bolum?: string; oynat?: boolean }): Ekran {
  const q = new URLSearchParams(location.search);
  const ad = p?.bolum ?? q.get('seri2') ?? 'bolum-01';
  const bolum = seri2Bolum(ad);
  if (!bolum) throw new Error(`Bölüm yok: ${ad}`);
  const tuval = h('canvas.f2-tuval', { 'aria-label': `${seri.dizi}: ${bolum.baslik}` }) as HTMLCanvasElement;
  const sahneKap = h('div.fl-sahne-kap', {}, tuval);
  const cevir = uygulamaPlatformu() ? null : h('div.fl-cevir', { 'aria-hidden': 'true', html: CEVIR });

  let k: Kurulum | null = null;
  let s: Surucu | null = null;
  let oynuyor = false;
  let kapandi = false;
  let dongu = 0;
  let durdur: (() => void) | null = null;
  let sifir = 0, basT = 0;
  let sonKayit = 0;
  let altyazi = (() => {
    try {
      return localStorage.getItem(ALTYAZI_ANAHTARI) !== '0';
    } catch {
      return true;
    }
  })();

  // ---- düğmeler
  const duraklatDugme = yuvarlakDugme(DURAKLAT, 'Duraklat', () => (oynuyor ? duraklat() : void devam()), 'kucuk');
  duraklatDugme.hidden = true;
  const altyaziDugme = yuvarlakDugme(ALTYAZI, 'Altyazı', () => {
    altyazi = !altyazi;
    try {
      localStorage.setItem(ALTYAZI_ANAHTARI, altyazi ? '1' : '0');
    } catch {
      /* yok */
    }
    altyaziGoster();
  }, 'kucuk');
  const altyaziGoster = () => {
    altyaziDugme.classList.toggle('f2-kapali', !altyazi);
    altyaziDugme.setAttribute('aria-pressed', String(altyazi));
    if (k) {
      k.oynatici.altyaziGoster = altyazi;
      if (!oynuyor) s?.ciz();
    }
  };
  const cik = () => app.git('katalog', { sec: `seri2-${ad}` });
  const ust = h('div.ust-cubuk.fl-ust', {}, yuvarlakDugme(IKON.geri, 'Çizgi Filmler', cik, 'kucuk'), h('div.ust-grup', {}, altyaziDugme, duraklatDugme));

  // ---- kapak (Oynat; kaldığı yer varsa Baştan da)
  const kayit = ilerlemeOku()[ad];
  const devamT = kayit && !kayit.bitti && kayit.t > 8 ? Math.max(0, kayit.t - 3) : 0;
  const oynatDugme = h('button.dugme.fl-oynat', { type: 'button', disabled: true }, svg(IKON.oyna), devamT ? 'Devam et' : 'Oynat') as HTMLButtonElement;
  const bastanDugme = h('button.dugme.f2-bastan', { type: 'button', style: '--r:var(--mavi)', hidden: !devamT }, svg(IKON.tekrar), 'Baştan') as HTMLButtonElement;
  const kapak = h('div.fl-kapak', {}, h('h1.fl-baslik', {}, h('small.f2-dizi', {}, seri.dizi), bolum.baslik), h('div.f2-kapak-dugmeler', {}, oynatDugme, bastanDugme));
  const el = h('div.fl-ekran.f2-ekran', { 'data-durum': 'yukleniyor' }, sahneKap, cevir, kapak, ust);

  // ---- oynatma
  const sesBaslat = async () => {
    durdur?.();
    durdur = null;
    const c = baglam();
    if (!c || !k || !s) return;
    if (c.state !== 'running') await c.resume().catch(() => undefined);
    basT = s.T;
    sifir = c.currentTime + 0.15;
    durdur = await karisimKur(c, k.plan, c.destination, basT, sifir);
  };
  const kare = () => {
    if (!oynuyor || !k || !s) return;
    const c = baglam();
    const T = c && durdur ? basT + Math.max(0, c.currentTime - sifir) : s.T + 1 / 60;
    if (T >= k.toplam) return bitir();
    if (T > s.T) s.ilerle(T);
    s.ciz();
    if (T - sonKayit > 5) {
      sonKayit = T;
      ilerlemeYaz(ad, { t: T });
    }
    dongu = requestAnimationFrame(kare);
  };
  const duraklat = () => {
    if (!oynuyor) return;
    oynuyor = false;
    cancelAnimationFrame(dongu);
    durdur?.();
    durdur = null;
    if (s) ilerlemeYaz(ad, { t: s.T });
    duraklatDugme.querySelector('.ikon')!.innerHTML = IKON.oyna;
    duraklatDugme.setAttribute('aria-label', 'Devam');
    el.dataset.durum = 'durdu';
  };
  const devam = async () => {
    if (oynuyor || !k || kapandi) return;
    oynuyor = true;
    duraklatDugme.hidden = false;
    duraklatDugme.querySelector('.ikon')!.innerHTML = DURAKLAT;
    duraklatDugme.setAttribute('aria-label', 'Duraklat');
    el.dataset.durum = 'oynuyor';
    await sesBaslat();
    if (!oynuyor) {
      durdur?.();
      return;
    }
    dongu = requestAnimationFrame(kare);
  };
  const bitir = () => {
    oynuyor = false;
    durdur?.();
    durdur = null;
    ilerlemeYaz(ad, { t: 0, bitti: true });
    duraklatDugme.hidden = true;
    el.dataset.durum = 'bitti';
    const tekrar = h('button.dugme', { type: 'button', style: '--r:var(--yesil)' }, svg(IKON.tekrar), 'Tekrar izle');
    tekrar.addEventListener('click', () => {
      son.remove();
      s?.git(0, 1 / 30, true);
      void devam();
    });
    const liste = h('button.dugme', { type: 'button', style: '--r:var(--mavi)' }, svg(IKON.izgara), 'Çizgi Filmler');
    liste.addEventListener('click', cik);
    const son = h('div.fl-ogut', {}, h('p', {}, bolum.baslik), h('div.fl-ogut-dugmeler', {}, tekrar, liste));
    el.append(son);
  };
  const basla = (T: number) => {
    sesiAc();
    kapak.classList.add('gizli');
    s?.git(T, 1 / 30, true);
    void devam();
  };
  oynatDugme.addEventListener('click', () => basla(devamT));
  bastanDugme.addEventListener('click', () => basla(0));

  // ---- boyut: kadraj kutusuna göre (telefon 844×390 yatayda tam ekran)
  const boyutla = () => {
    if (!k) return;
    const r = sahneKap.getBoundingClientRect();
    if (r.width < 10) return;
    k.oynatici.boyutla(r.width, r.height, Math.min(2, window.devicePixelRatio || 1));
    s?.ciz();
  };
  const gozcu = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(boyutla) : null;
  gozcu?.observe(sahneKap);

  yonIste('yatay');
  const arkaPlanBirak = arkaPlanDinle((arkada) => {
    if (arkada) duraklat();
  });

  // ---- kurulum (görseller ve sesler yüklenirken kapak görünür)
  void (async () => {
    for (const w of [600, 700]) await document.fonts.load(`${w} 40px Fredoka`).catch(() => undefined);
    const kazanc = DUZEY[`../../../content/film2/${ad}-duzey.json`]?.kazancDb;
    k = await kur({ seri, bolum: bolum.kimlik.replace('bolum-', 'b'), sahneler: bolumParcalari(seri, bolum), tuval, sesAdresi, kazancDb: kazanc });
    if (kapandi) return;
    s = new Surucu(k);
    altyaziGoster();
    boyutla();
    s.git(devamT, 1 / 30, true);
    s.ciz();
    oynatDugme.disabled = false;
    el.dataset.durum = 'kapak';
    if (p?.oynat) basla(devamT);
  })();

  window.seri2 = { saat: () => s?.T ?? 0, sure: () => k?.toplam ?? 0, durum: () => el.dataset.durum ?? '' };

  return {
    el,
    kapat() {
      kapandi = true;
      if (oynuyor && s) ilerlemeYaz(ad, { t: s.T });
      oynuyor = false;
      cancelAnimationFrame(dongu);
      durdur?.();
      gozcu?.disconnect();
      yonIste('serbest');
      arkaPlanBirak();
    },
  };
}

declare global {
  interface Window {
    seri2?: { saat: () => number; sure: () => number; durum: () => string };
  }
}
