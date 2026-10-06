/**
 * Ortak yumuşak geçişler (bütün oyunlar).
 *
 * Sayfalar arası: giden sayfa krem bir perdeyle (~300 ms) kararır, ses ~0.2 sn'de kısılır, sonra adres değişir.
 * Gelen sayfanın HTML'inde aynı krem perde (#gecis-perde) hazır durur; ilk ekran çizilince yumuşakça açılır.
 * Böylece menü ↔ oyun arasında beyaz parlama ya da bir anda kopma olmaz.
 * Yalnız opacity değişir; perde dokunmayı tutmaz. "Az hareket" tercihinde süreler kısalır.
 */
import { sus } from '../audio/konusma';
import { anaSesiKis, seviyeleriUygula } from '../audio/motor';
import { sayfaYonunuHazirla } from '../kabuk/yon';
import { sure, TEST_MODU } from './dom';

export const KREM = '#fff4dd';
const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Perdenin kararma / açılma süresi (ms). */
export const PERDE_MS = AZ_HAREKET ? 120 : 300;

const PERDE_ID = 'gecis-perde';
let cikiliyor = false;

function perdeKur(): HTMLElement {
  let p = document.getElementById(PERDE_ID);
  if (!p) {
    p = document.createElement('div');
    p.id = PERDE_ID;
    p.setAttribute('aria-hidden', 'true');
    p.style.opacity = '0';
    document.body.append(p);
  }
  Object.assign(p.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '9999',
    background: KREM,
    pointerEvents: 'none',
    animation: 'none',
    visibility: 'visible',
    transition: `opacity ${PERDE_MS}ms ease-in-out`,
  });
  p.classList.remove('gitti');
  return p;
}

/** Gelen sayfa: ilk ekran çizildikten sonra krem perde yumuşakça açılır (perde yoksa bir şey yapmaz). */
export function sayfaAcildi(ekran?: HTMLElement) {
  const p = document.getElementById(PERDE_ID);
  if (!p) return;
  if (TEST_MODU) {
    p.remove();
    return;
  }
  // perde, ilk ekranın resimleri (img ve CSS arka planları) yüklenince açılır: sahne perdenin ardında
  // sonradan bir anda belirmesin. En çok ~1.2 sn beklenir.
  void Promise.race([resimleriBekle(ekran), new Promise((r) => setTimeout(r, 1200))]).then(() => perdeyiAc(p));
}

async function resimleriBekle(ekran?: HTMLElement) {
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  if (!ekran) return;
  const adresler = new Set<string>();
  for (const el of [ekran, ...ekran.querySelectorAll<HTMLElement>('*')]) {
    if (el instanceof HTMLImageElement && el.src) adresler.add(el.currentSrc || el.src);
    for (const parca of [getComputedStyle(el).backgroundImage, getComputedStyle(el, '::before').backgroundImage, getComputedStyle(el, '::after').backgroundImage])
      for (const m of parca.matchAll(/url\(["']?([^"')]+)["']?\)/g)) if (!m[1].startsWith('data:')) adresler.add(m[1]);
  }
  await Promise.all(
    [...adresler].map((a) => {
      const i = new Image();
      i.src = a;
      return i.decode().catch(() => undefined);
    }),
  );
}

function perdeyiAc(p: HTMLElement) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      p.style.transition = `opacity ${PERDE_MS}ms ease-out`;
      p.style.animation = 'none';
      p.style.opacity = '0';
      window.setTimeout(() => p.remove(), PERDE_MS + 80);
    }),
  );
}

/**
 * Giden sayfa: krem perde iner, konuşma ve müzik yumuşakça kısılır, sonra `git` çağrılır (location.assign/replace,
 * history.back). Aynı anda ikinci çıkış yok sayılır.
 * `hedef` (gidilecek adres) verilirse uygulamada o sayfanın ekran yönü perde inerken ayarlanır (src/kabuk/yon.ts):
 * telefonda yatay oyuna giderken ekran perdenin ardında döner, oyun dikey açılıp sonra dönmez; menüye dönünce kilit kalkar.
 */
export function sayfadanCik(git: () => void, hedef?: string) {
  if (cikiliyor) return;
  cikiliyor = true;
  sus();
  anaSesiKis();
  const yon = hedef ? sayfaYonunuHazirla(hedef) : Promise.resolve();
  if (TEST_MODU) {
    git();
    return;
  }
  const p = perdeKur();
  void p.offsetWidth; // başlangıç opaklığı çizilsin, geçiş çalışsın
  p.style.opacity = '1';
  window.setTimeout(() => void yon.then(git), sure(PERDE_MS));
}

// Önbellekten geri açılan sayfa (geri tuşu / history.back): inik kalan perde açılır, ses geri gelir
if (typeof window !== 'undefined')
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    cikiliyor = false;
    seviyeleriUygula();
    const p = document.getElementById(PERDE_ID);
    if (p) {
      p.style.opacity = '0';
      window.setTimeout(() => p.remove(), PERDE_MS + 80);
    }
  });
