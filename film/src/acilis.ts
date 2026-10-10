/**
 * Çizgi Filmler ortak açılışı v3 (her filmden önce, ~10 sn): masal sahnesi (Recraft katmanları, assets/film/acilis/).
 * Akış film-acilis jeneriğinin (7,9 sn) vuruşlarına oturur:
 *   0,0 zemin yaklaşarak belirir, bulutlar süzülür · 0,8 perdeler açılır · 1,8 Mino / 2,2 Kino zıplayarak çıkar, 2,8 el sallar
 *   4,6 logo tepeden düşer, 5,05 vuruşunda yere oturur (esneyip yaylanır), 5,55 parıltı süzülür, yıldızlar sırayla parlar
 *   6,3 kurdele açılır, 6,55 vuruşunda film adı belirir · 7,55 ikisi sevinir · 9,5 yumuşak sönme (iris) → film
 * - Ekranın her yerine dokununca atlanır (ilk 0,5 sn hariç: filmi açtıran dokunuş açılışı geçmesin).
 * - Uzun açılış günde bir kez; aynı gün yeniden izlenince kısa açılış (aynı resimler, ~4 sn). İkisi de atlanır.
 * - Az hareket (prefers-reduced-motion): zıplama / düşme yok, yumuşak belirme.
 * Yalnız transform / opacity animasyonları (CSS); zamanlama film hızıyla (test modunda hızlı).
 */
import './acilis.css';
import ZEMIN from '../../assets/film/acilis/zemin.webp';
import ZEMIN_DIK from '../../assets/film/acilis/zemin-dik.webp';
import PERDE from '../../assets/film/acilis/perde.webp';
import KURDELE from '../../assets/film/acilis/kurdele.webp';
import BULUT from '../../assets/film/acilis/bulut.webp';
import Y1 from '../../assets/film/acilis/yildiz-1.webp';
import Y2 from '../../assets/film/acilis/yildiz-2.webp';
import Y3 from '../../assets/film/acilis/yildiz-3.webp';
import Y4 from '../../assets/film/acilis/yildiz-4.webp';
import Y5 from '../../assets/film/acilis/yildiz-5.webp';
import Y6 from '../../assets/film/acilis/yildiz-6.webp';
import { Karakter } from '../../src/karakter/karakter';
import { Mino } from '../../src/mino/mino';
import { h } from '../../src/ui/dom';
import { minkinoLogo } from '../../src/ui/logo';
import { FILM_EFEKT } from './efekt';
import { filmMuzik } from './muzik';

/** Uzun açılışın ve kısa açılışın süresi (sn, sönme dahil) */
export const ACILIS_UZUN = 10.2;
export const ACILIS_KISA = 4;
const ANAHTAR = 'minkino-film-acilis-v1';

const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** logonun çevresindeki yıldızlar: resim, konum (logo kutusuna göre %), boy (logo eninin %'si), gecikme (sn) */
const YILDIZLAR: [string, number, number, number, number][] = [
  [Y1, -4, 8, 9, 0],
  [Y4, 103, 2, 7, 0.25],
  [Y5, 18, -38, 4.5, 0.5],
  [Y2, 96, 92, 8, 0.12],
  [Y6, 78, -34, 4, 0.7],
  [Y3, 2, 98, 6, 0.4],
  [Y5, 50, -52, 3.5, 0.9],
  [Y6, -12, 58, 3.5, 1.05],
];

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

/** Açılış resimlerini önceden indirip çözer (kapak ekranı açılınca bir kez) */
let onYuklendi = false;
export function acilisOnYukle() {
  if (onYuklendi || typeof Image === 'undefined') return;
  onYuklendi = true;
  const dik = typeof matchMedia !== 'undefined' && matchMedia('(orientation: portrait)').matches;
  for (const src of [dik ? ZEMIN_DIK : ZEMIN, PERDE, KURDELE, BULUT, Y1, Y2, Y3, Y4, Y5, Y6]) {
    const r = new Image();
    r.src = src;
    void r.decode().catch(() => undefined);
  }
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
  let hazir = false;
  const sonra = (sn: number, is: () => void) => void zamanlar.push(window.setTimeout(is, (sn * 1000) / o.hiz));
  const efekt = (ad: string) => FILM_EFEKT[ad]?.();
  const res = (src: string, sinif: string) => h(`img.${sinif}`, { src, alt: '', draggable: 'false', decoding: 'async' });

  const mino = new Mino();
  const kino = new Karakter('kino', h('div'));
  const minoKap = h('div.fl-in-mino', {}, h('div.fl-in-zip', {}, h('div.fl-in-yay', {}, mino.el)));
  const kinoKap = h(
    'div.fl-in-kino',
    { 'data-karakter-kap': 'kino' },
    h('div.fl-in-zip', {}, h('div.fl-in-yay', {}, h('div.fl-in-kino-ic', {}, kino.el))),
  );
  const logoResim = minkinoLogo('kenarli', 'fl-acilis-logo');
  const logo = h(
    'div.fl-in-logo',
    {},
    h('div.fl-in-logo-dus', {}, h('div.fl-in-logo-yay', {}, logoResim, h('i.fl-in-parilti', { style: `--maske:url("${logoResim.src}")` }))),
    h(
      'div.fl-in-yildizlar',
      { 'aria-hidden': 'true' },
      ...YILDIZLAR.map(([src, x, y, boy, d]) => h('i', { style: `left:${x}%;top:${y}%;width:${boy}%;--d:${d}s` }, res(src, 'fl-in-yildiz'))),
    ),
  );
  const kart = h(
    'div.fl-in-kart',
    {},
    h(
      'div.fl-in-kurdele',
      {},
      res(KURDELE, 'fl-in-kurdele-resim'),
      h('h2.fl-acilis-baslik', {}, baslik),
      h('p.fl-acilis-alt', {}, h('span.fl-in-film', {}, 'Çizgi Film')),
    ),
  );
  const bulut = (sinif: string) => h(`div.fl-in-bulut.${sinif}`, { 'aria-hidden': 'true' }, res(BULUT, 'fl-in-bulut-resim'));
  const el = h(
    'div.fl-acilis.fl-in',
    {
      'data-adim': '0',
      'data-tur': uzun ? 'uzun' : 'kisa',
      'aria-label': `${baslik}. Geçmek için dokun.`,
      role: 'button',
      tabindex: '0',
      ...(AZ_HAREKET ? { 'data-az': '1' } : {}),
    },
    h('div.fl-in-zemin', { 'aria-hidden': 'true' }, res(ZEMIN, 'fl-in-zemin-yatay'), res(ZEMIN_DIK, 'fl-in-zemin-dik')),
    h('i.fl-acilis-isik'),
    bulut('b1'),
    bulut('b2'),
    bulut('b3'),
    h('div.fl-in-orta', {}, logo, kart),
    minoKap,
    kinoKap,
    h('div.fl-in-perde.sol', { 'aria-hidden': 'true' }, res(PERDE, 'fl-in-perde-resim')),
    h('div.fl-in-perde.sag', { 'aria-hidden': 'true' }, res(PERDE, 'fl-in-perde-resim')),
    h('i.fl-in-iris', { 'aria-hidden': 'true' }),
  );
  el.style.setProperty('--hiz', String(o.hiz));
  // kapalı perde: iki kanat ekranın yarısını örtecek kadar enine açılır (kanat eni = 0,52 × ekran boyu)
  // tablette ekran yatay döner (yonIste) açılış kurulduktan sonra: kanatlar yeni boyuta göre yeniden açılır, aralık kalmaz
  const perdeAyarla = () => {
    const kapali = !el.dataset.adim || el.dataset.adim === '0' || el.dataset.adim === '1';
    const kanatlar = kapali ? [...el.querySelectorAll<HTMLElement>('.fl-in-perde')] : [];
    // kapalı perde kayarak büyümesin (arada sahne görünürdü): yeni enine anında geçer
    kanatlar.forEach((k) => (k.style.transition = 'none'));
    el.style.setProperty('--pk', Math.max(1.3, (innerWidth / 2 / (innerHeight * 0.52)) * 1.35).toFixed(3));
    if (kanatlar.length) void el.offsetWidth;
    kanatlar.forEach((k) => (k.style.transition = ''));
  };
  perdeAyarla();
  window.addEventListener('resize', perdeAyarla);
  const perdeBirak = () => window.removeEventListener('resize', perdeAyarla);
  const adim = (n: number) => (el.dataset.adim = String(n));

  let bitti = false;
  const bitir = (sonme: number) => {
    if (bitti) return;
    bitti = true;
    zamanlar.forEach(clearTimeout);
    el.classList.add('bitti');
    // önce iris kapanır (yarı süre), sonra her şey filme karışarak söner
    const yari = (sonme * 0.5) / o.hiz;
    el.style.setProperty('--sonme', `${yari.toFixed(3)}s`);
    el.style.transition = `opacity ${yari.toFixed(3)}s ease-in ${yari.toFixed(3)}s`;
    o.bitti();
    // söndükten sonra kalkar: sönme bitmeden (film ilk sahnesini kurarken kareler gecikince) kaldırılırsa krem halka ve
    // logo izi tek karede kaybolurdu. Geçiş bitince kalkar; olmazsa biraz sonra (yedek zamanlayıcı)
    let kalkti = false;
    const kaldir = () => {
      if (kalkti) return;
      kalkti = true;
      el.remove();
      perdeBirak();
      mino.kapat();
      kino.kapat();
    };
    el.addEventListener('transitionend', (e) => {
      if (e.target === el && e.propertyName === 'opacity') kaldir();
    });
    window.setTimeout(kaldir, (sonme * 1000) / o.hiz + 1200);
  };
  const selam = () => {
    if (!AZ_HAREKET) mino.tepki('selam');
    void kino.oynat('sevin', 1500);
  };
  const sevin = () => {
    if (!AZ_HAREKET) mino.tepki('zipla');
    void kino.oynat('dans', 1800);
    if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 1800);
  };

  // büyük resimler çözülmeden akış başlamasın (ilk açılışta boş sahne görünmesin); en çok 1,5 sn beklenir
  const cozulecek = [...el.querySelectorAll<HTMLImageElement>('.fl-in-zemin img, .fl-in-perde-resim, .fl-acilis-logo')];
  let basladi = false;
  const basla = () => {
    if (basladi || bitti) return;
    basladi = true;
    akis();
  };
  void Promise.all(cozulecek.map((r) => r.decode().catch(() => undefined))).then(basla);
  window.setTimeout(basla, 1500 / o.hiz);

  const akis = () => {
    if (o.muzik) filmMuzik.dosyaCal({ ad: 'film-acilis', ses: 0.85, gec: 0.05 });
    // adım: 0 kapalı perde · 1 zemin · 2 perde açık · 3 Mino · 4 Kino · 5 logo · 6 kurdele + başlık · 7 sevinç
    if (uzun) {
      sonra(0.05, () => adim(1));
      sonra(0.8, () => {
        adim(2);
        efekt('fiu');
      });
      // zıplama inişi (animasyonun %64'ü) vuruşa düşer: Mino 1,8, Kino 2,2
      sonra(1.29, () => adim(3));
      sonra(1.8, () => efekt('boing'));
      sonra(1.69, () => adim(4));
      sonra(2.2, () => efekt('boing'));
      sonra(2.8, selam);
      sonra(4.6, () => adim(5));
      sonra(5.05, () => efekt('parilti'));
      sonra(6.3, () => adim(6));
      sonra(7.55, () => {
        adim(7);
        sevin();
      });
      sonra(ACILIS_UZUN - 0.7, () => bitir(0.7));
    } else {
      // kısa açılış: aynı sahne, hızlı akış (perde açık başlar)
      el.dataset.tur = 'kisa';
      sonra(0.05, () => adim(2));
      sonra(0.15, () => adim(4));
      sonra(0.65, () => efekt('boing'));
      sonra(0.4, () => adim(5));
      sonra(0.9, () => efekt('parilti'));
      sonra(1.1, () => adim(6));
      sonra(1.5, selam);
      // jenerik kısa açılışta erkenden söner
      sonra(ACILIS_KISA - 1.2, () => o.muzik && filmMuzik.dosyaSon(1.1));
      sonra(ACILIS_KISA - 0.6, () => bitir(0.6));
    }
    // dokununca atlanır (karta dokunup açtıran ilk dokunuş sayılmasın: kısa bir bekleme)
    sonra(0.5, () => (hazir = true));
  };

  const atla = () => {
    if (bitti) return;
    if (o.muzik) filmMuzik.dosyaSon(0.5);
    bitir(0.45);
  };
  // dokununca atlanır (karta dokunup açtıran ilk dokunuş sayılmasın: kısa bir bekleme)
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
      perdeBirak();
      mino.kapat();
      kino.kapat();
    },
  };
}
