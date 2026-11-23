/**
 * Ses çalar: Polly (İngilizce), Ceren Öğretmen ve Kino (Türkçe) konuşmaları sırayla çalınır; konuşanın ağzı
 * kaydı izler (ağız dizisi ses üretilirken hesaplanır: ingilizce/src/ses-agiz.json, 60 ms adım).
 * Yeni konuşma öncekini keser. Hayvan sesleri ayrı kanaldan çalar. Arayüz sesleri ortak Minkino efektleridir.
 */
import { efekt } from '../../src/audio/efekt';
import { durum } from '../../src/engine/ilerleme';
import { TEST_MODU } from '../../src/ui/dom';
import agizHam from './ses-agiz.json';
import { sesAdresi, TASLAK } from './varlik';

export type Kim = 'polly' | 'ceren' | 'kino';
const AGIZ = agizHam as Record<string, string>;
const AGIZ_ADIM_MS = 60;

/** Kaydın kimliğinden konuşan: en/… Polly, tr/kino-… Kino, diğer Türkçeler Ceren */
export function kimden(id: string): Kim | null {
  // oturan karakterlerin sohbeti (en/sh-mino-…): ağız karesi yok, Polly'nin ağzı oynamasın
  if (/^en\/sh-(mino|zipzip|lokum)-/.test(id)) return null;
  // Kino'nun İngilizce sözleri (göl masalı: en/k-…) Kino'nundur; öbür İngilizce kayıtlar Polly'nin
  if (id.startsWith('en/k-')) return 'kino';
  if (id.startsWith('en/')) return 'polly';
  return id.startsWith('tr/kino-') ? 'kino' : 'ceren';
}

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function seviye(kanal: 'konusma' | 'efekt'): number {
  const a = durum.i.ayarlar;
  if (!a[kanal]) return 0;
  return Number.isFinite(a.seviye) ? Math.max(0, Math.min(1, a.seviye)) : 0.9;
}

/** Konuşanın ekrandaki bütün çizimlerinde ağız karesini değiştirir (0 kapalı … 3 en açık) */
export function agizAyarla(kim: Kim, poz: number) {
  for (const el of document.querySelectorAll<HTMLElement>(`.ing-kisi[data-kim="${kim}"]`)) {
    if (el.dataset.hareket) continue; // el sallama gibi bir hareket oynarken ağız karesi karışmaz
    const kare = Math.min(poz, Number(el.dataset.agizSayisi ?? 4) - 1);
    if (el.dataset.agiz === String(kare)) continue;
    el.dataset.agiz = String(kare);
    for (const img of el.querySelectorAll<HTMLImageElement>('img[data-kare^="konus-"]')) img.hidden = img.dataset.kare !== `konus-${kare}`;
  }
  document.documentElement.dataset.konusan = poz ? kim : '';
}

let calar: HTMLAudioElement | undefined, efektCalar: HTMLAudioElement | undefined;
let nesil = 0, efektNesli = 0;
let etkinBitir: ((tam: boolean) => void) | undefined;
let efektBitir: (() => void) | undefined;
let kilitAcik = false;
const uyarilan = new Set<string>();

function calarAl(): HTMLAudioElement {
  if (!calar) { calar = new Audio(); calar.preload = 'auto'; calar.setAttribute('playsinline', ''); }
  return calar;
}
function efektCalarAl(): HTMLAudioElement {
  if (!efektCalar) { efektCalar = new Audio(); efektCalar.preload = 'auto'; efektCalar.setAttribute('playsinline', ''); }
  return efektCalar;
}

// kısa sessiz WAV: tarayıcı ilk dokunuşta çalmaya izin versin diye
const SESSIZ = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

/** Çocuğun ilk dokunuşunda çağrılır: iki ses kanalı da o dokunuşla açılır (iOS ilk dokunuştan önce ses çalmaz) */
export function sesKilidiAc() {
  if (kilitAcik) return;
  kilitAcik = true;
  for (const c of [calarAl(), efektCalarAl()]) {
    c.muted = true; c.src = SESSIZ;
    void c.play().then(() => { c.pause(); c.muted = false; }).catch(() => { c.muted = false; });
  }
}
export const sesAcikMi = () => kilitAcik;
/** Şu an bir konuşma kaydı çalıyor mu */
export const konusuyorMu = () => !!etkinBitir;

function tekParca(id: string, no: number): Promise<boolean> {
  const adres = sesAdresi(id);
  const kim = kimden(id);
  if (!adres) {
    if (!uyarilan.has(id)) { uyarilan.add(id); if (import.meta.env.DEV) console.warn(`[ingilizce] ses yok: ${id}`); }
    // taslakta akış sürsün: kayıt yokmuş gibi kısa bir bekleme
    return bekle(TEST_MODU ? 10 : TASLAK ? 600 : 0).then(() => no === nesil);
  }
  if (TEST_MODU) return bekle(15).then(() => no === nesil);
  return new Promise((coz) => {
    const c = calarAl();
    const dizi = AGIZ[id];
    let kare = 0, bekci = 0, bitti = false;
    const bitir = (tam: boolean) => {
      if (bitti) return;
      bitti = true;
      cancelAnimationFrame(kare); clearTimeout(bekci);
      c.onended = c.onerror = null;
      if (etkinBitir === bitir) etkinBitir = undefined;
      if (kim) agizAyarla(kim, 0);
      coz(tam && no === nesil);
    };
    const izle = () => {
      if (bitti) return;
      const ms = c.currentTime * 1000;
      const poz = dizi ? Number(dizi[Math.floor(ms / AGIZ_ADIM_MS)] ?? 0) : Math.floor(ms / 130) % 2 ? 2 : 1;
      if (kim) agizAyarla(kim, poz);
      kare = requestAnimationFrame(izle);
    };
    etkinBitir = bitir;
    c.onended = () => bitir(true);
    c.onerror = () => bitir(true);
    c.volume = seviye('konusma'); c.muted = c.volume === 0;
    c.src = adres;
    // çalar takılırsa akış kilitlenmesin
    const bekciKur = () => { clearTimeout(bekci); const once = c.currentTime; bekci = window.setTimeout(() => { if (c.currentTime > once) bekciKur(); else bitir(true); }, 4000); };
    bekciKur();
    c.play().then(izle).catch(() => bitir(true));
  });
}

/**
 * Kayıtları sırayla çalar. Söz kesilmeden bittiyse true döner; yeni bir `konus` ya da `sus` araya girdiyse false
 * (çağıran, false gelince akışı sürdürmez).
 */
export async function konus(...idler: string[]): Promise<boolean> {
  sus();
  const no = ++nesil;
  for (let i = 0; i < idler.length; i++) {
    if (!(await tekParca(idler[i], no))) return false;
    if (i < idler.length - 1) { await bekle(TEST_MODU ? 5 : 220); if (no !== nesil) return false; }
  }
  return no === nesil;
}

/** Bütün konuşmayı ve hayvan sesini keser */
export function sus() {
  nesil++;
  etkinBitir?.(false);
  calar?.pause();
  efektNesli++;
  efektBitir?.();
  efektCalar?.pause();
}

/** Dosyadan ses efekti (hayvan, taşıt): assets/ingilizce/ses/efekt/<ad>.mp3. Bitince çözülür. */
export function efektCal(id: string): Promise<void> {
  const adres = sesAdresi(id);
  if (!adres || TEST_MODU) return bekle(TEST_MODU ? 10 : 0);
  efektNesli++;
  efektBitir?.();
  return new Promise((coz) => {
    const c = efektCalarAl();
    let bekci = 0;
    const bitir = () => { clearTimeout(bekci); c.onended = c.onerror = null; if (efektBitir === bitir) efektBitir = undefined; coz(); };
    efektBitir = bitir;
    c.onended = bitir; c.onerror = bitir;
    c.volume = seviye('efekt') * 0.9; c.muted = c.volume === 0;
    c.src = adres;
    bekci = window.setTimeout(bitir, 5000);
    c.play().catch(bitir);
  });
}

/**
 * Dersin kayıtlarını önceden indirir. 21 Kasım 2026: bütün kayıtlar (Hayvanat Bahçesi'nde 250 kadar) aynı anda istenince
 * o an çalınacak söz sıranın sonunda kalıyor, 4 sn bekçisi de onu atlıyordu. Artık dersin akış sırasıyla, aynı anda en çok
 * dört kayıt indirilir; bir kez indirilen yeniden istenmez.
 */
const HAZIR_ES_ZAMANLI = 4;
const hazirlanan = new Set<string>();
const hazirSirasi: string[] = [];
let hazirlaniyor = 0;
function hazirlaSiradaki() {
  while (hazirlaniyor < HAZIR_ES_ZAMANLI && hazirSirasi.length) {
    const adres = hazirSirasi.shift()!;
    hazirlaniyor++;
    const a = new Audio();
    let bitti = false;
    const birak = () => { if (bitti) return; bitti = true; hazirlaniyor--; hazirlaSiradaki(); };
    a.addEventListener('canplaythrough', birak, { once: true });
    a.addEventListener('error', birak, { once: true });
    window.setTimeout(birak, 6000);
    a.preload = 'auto';
    a.src = adres;
  }
}
export function sesHazirla(idler: readonly string[]) {
  if (TEST_MODU) return;
  for (const id of idler) {
    const adres = sesAdresi(id);
    if (!adres || hazirlanan.has(adres)) continue;
    hazirlanan.add(adres);
    hazirSirasi.push(adres);
  }
  hazirlaSiradaki();
}

/** Arayüz sesleri (ortak Minkino efektleri; ses ayarı kapalıysa efektler kendiliğinden susar) */
export const tik = {
  dokun: () => efekt.dokunma(),
  sec: () => efekt.secim(),
  dogru: () => efekt.dogru(),
  yanlis: () => efekt.yanlis(),
  ucus: () => efekt.ucus(),
  yapis: () => efekt.yapis(),
  konfeti: (sade = false) => efekt.konfeti(sade),
  nota: (sira: number) => efekt.nota(sira),
  pop: () => efekt.baloncuk(),
  firt: () => efekt.firt(),
  sip: () => efekt.sip(),
};

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.hidden) sus(); });
  window.addEventListener('pagehide', sus);
}
