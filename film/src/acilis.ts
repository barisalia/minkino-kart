/**
 * Çizgi Filmler ortak açılışı (her filmden önce, ~10 sn): Mino ve Kino hoplayarak gelir, asıl MINKINO logosu
 * parıltıyla belirir, konfeti patlar, sonra filmin başlık kartı. Müzik: film-acilis jeneriği (7,9 sn).
 * - Ekranın her yerine dokununca atlanır (ilk 0,5 sn hariç: filmi açtıran dokunuş açılışı geçmesin).
 * - Uzun açılış günde bir kez; aynı gün yeniden izlenince kısa açılış (logo + başlık, ~4,6 sn). İkisi de atlanır.
 * - Az hareket (prefers-reduced-motion): hop / konfeti yok, yumuşak belirme.
 * Yalnız transform / opacity animasyonları (CSS); zamanlama film hızıyla (test modunda hızlı).
 */
import './acilis.css';
import { Karakter } from '../../src/karakter/karakter';
import { Mino } from '../../src/mino/mino';
import { h } from '../../src/ui/dom';
import { minkinoLogo } from '../../src/ui/logo';
import { FILM_EFEKT } from './efekt';
import { filmMuzik } from './muzik';

/** Uzun açılışın ve kısa açılışın süresi (sn, sönme dahil) */
export const ACILIS_UZUN = 10.2;
export const ACILIS_KISA = 4.6;
const ANAHTAR = 'minkino-film-acilis-v1';

const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const RENKLER = ['#ff5d8f', '#ffc72c', '#5dbe3f', '#3e9df2', '#9b5ce0', '#ff8a2b', '#17afa2'];

const bugun = () => new Date().toISOString().slice(0, 10);
/** Bugün uzun açılış izlendi mi (localStorage yoksa: hayır) */
function bugunIzlendi(): boolean {
  try {
    return localStorage.getItem(ANAHTAR) === bugun();
  } catch {
    return false;
  }
}
function izlendiYaz() {
  try {
    localStorage.setItem(ANAHTAR, bugun());
  } catch {
    /* gizli sekme: her seferinde uzun açılış */
  }
}

/** Konfeti: tepeden saçılan renkli kâğıtlar (her parçanın yolu CSS değişkenleriyle) */
function konfeti(adet: number, tohum: number) {
  return h(
    'div.fl-in-konfeti',
    { 'aria-hidden': 'true' },
    ...Array.from({ length: adet }, (_, i) => {
      const r = (k: number) => ((Math.sin((i + 1) * 12.9898 * k + tohum * 78.233) * 43758.5453) % 1 + 1) % 1;
      return h('i', {
        style:
          `--x:${(r(1) * 100).toFixed(1)}%;--dx:${((r(2) - 0.5) * 30).toFixed(1)}vw;--d:${(r(3) * 0.6).toFixed(2)}s;` +
          `--s:${(2.2 + r(4) * 1.6).toFixed(2)}s;--don:${Math.round((r(5) - 0.5) * 1440)}deg;--r:${RENKLER[i % RENKLER.length]};` +
          `--en:${(0.9 + r(6) * 0.9).toFixed(2)}`,
      });
    }),
  );
}

export interface Acilis {
  el: HTMLElement;
  /** bu açılışın süresi (sn; uzun ya da kısa) */
  readonly sure: number;
  atla(): void;
  kapat(): void;
}

/**
 * Açılışı kurar ve başlatır. hiz: film hızı (test modunda 12). muzik: jenerik çalsın mı. bitti: film başlasın.
 * zorlaUzun: her zaman uzun açılış (MP4 kaydı).
 */
export function acilisKur(baslik: string, o: { hiz: number; muzik: boolean; zorlaUzun?: boolean; bitti: () => void }): Acilis {
  const uzun = o.zorlaUzun || !bugunIzlendi();
  if (uzun) izlendiYaz();
  const zamanlar: number[] = [];
  const sonra = (sn: number, is: () => void) => void zamanlar.push(window.setTimeout(is, (sn * 1000) / o.hiz));
  const efekt = (ad: string) => FILM_EFEKT[ad]?.();

  const mino = new Mino();
  const kino = new Karakter('kino', h('div'));
  const minoKap = h('div.fl-in-mino', {}, h('div.fl-in-zip', {}, mino.el));
  const kinoKap = h('div.fl-in-kino', { 'data-karakter-kap': 'kino' }, h('div.fl-in-zip', {}, h('div.fl-in-kino-ic', {}, kino.el)));
  const yildizlar = h(
    'div.fl-in-yildizlar',
    { 'aria-hidden': 'true' },
    ...Array.from({ length: 9 }, (_, i) => h('i', { style: `--i:${i};--a:${i * 40}deg` })),
  );
  const logo = h('div.fl-in-logo', {}, minkinoLogo('kenarli', 'fl-acilis-logo'), yildizlar);
  const kart = h(
    'div.fl-in-kart',
    {},
    h('h2.fl-acilis-baslik', {}, baslik),
    h('p.fl-acilis-alt', {}, h('span.fl-in-film', {}, 'Çizgi Film')),
  );
  const el = h(
    'div.fl-acilis.fl-in',
    { 'data-adim': '0', 'data-tur': uzun ? 'uzun' : 'kisa', 'aria-label': `${baslik}. Geçmek için dokun.`, role: 'button', tabindex: '0', ...(AZ_HAREKET ? { 'data-az': '1' } : {}) },
    h('i.fl-acilis-isik'),
    h('div.fl-in-orta', {}, logo, kart),
    minoKap,
    kinoKap,
  );
  el.style.setProperty('--hiz', String(o.hiz));
  const adim = (n: number) => (el.dataset.adim = String(n));

  let bitti = false;
  const bitir = (sonme: number) => {
    if (bitti) return;
    bitti = true;
    zamanlar.forEach(clearTimeout);
    el.classList.add('bitti');
    el.style.transitionDuration = `${(sonme / o.hiz).toFixed(2)}s`;
    o.bitti();
    window.setTimeout(() => {
      el.remove();
      mino.kapat();
      kino.kapat();
    }, (sonme * 1000) / o.hiz + 80);
  };

  if (o.muzik) filmMuzik.dosyaCal({ ad: 'film-acilis', ses: 0.85, gec: 0.05 });
  if (uzun) {
    // 1: Mino soldan, Kino sağdan hoplayarak gelir
    sonra(0.25, () => adim(1));
    sonra(1.35, () => efekt('boing'));
    sonra(1.75, () => efekt('boing'));
    sonra(1.9, () => {
      if (!AZ_HAREKET) mino.tepki('selam');
      void kino.oynat('sevin', 1300);
    });
    // 2: logo zıplayarak belirir, yıldızlar parlar
    sonra(2.6, () => {
      adim(2);
      efekt('parilti');
    });
    // 3: konfeti, ikisi sevinir
    sonra(3.7, () => {
      adim(3);
      el.append(konfeti(42, 1));
      efekt('final');
      if (!AZ_HAREKET) mino.tepki('zipla');
      void kino.oynat('dans', 1800);
      if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 1800);
    });
    // 4: başlık kartı (logo yukarı, başlık gelir); Mino başlığa bakar, ikisi dans eder
    sonra(5.7, () => {
      adim(4);
      efekt('hop');
      mino.bak(1);
    });
    sonra(6.5, () => {
      el.append(konfeti(24, 2));
      if (!AZ_HAREKET) mino.tepki('dans');
      void kino.oynat('sevin', 1200);
    });
    sonra(7.8, () => mino.bak(0));
    sonra(ACILIS_UZUN - 0.7, () => bitir(0.7));
  } else {
    // kısa açılış: ikisi yanlarda, logo ve başlık birlikte
    adim(5);
    sonra(0.3, () => efekt('parilti'));
    sonra(0.9, () => {
      el.append(konfeti(26, 3));
      if (!AZ_HAREKET) mino.tepki('selam');
      void kino.oynat('sevin', 1200);
    });
    // jenerik kısa açılışta erkenden söner
    sonra(ACILIS_KISA - 1.2, () => o.muzik && filmMuzik.dosyaSon(1.1));
    sonra(ACILIS_KISA - 0.6, () => bitir(0.6));
  }

  const atla = () => {
    if (bitti) return;
    if (o.muzik) filmMuzik.dosyaSon(0.5);
    bitir(0.45);
  };
  // dokununca atlanır (karta dokunup açtıran ilk dokunuş sayılmasın: kısa bir bekleme)
  let hazir = false;
  sonra(0.5, () => (hazir = true));
  el.addEventListener('pointerdown', () => hazir && atla());
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') atla();
  });

  return {
    el,
    sure: uzun ? ACILIS_UZUN : ACILIS_KISA,
    atla,
    kapat() {
      zamanlar.forEach(clearTimeout);
      bitti = true;
      mino.kapat();
      kino.kapat();
    },
  };
}
