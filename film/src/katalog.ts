/**
 * Çizgi Filmler seçme ekranı (/film/ açılışı): sinema havası (perde, ışıklı tabela, patlamış mısır), her film için
 * büyük kapak kartı (filmin kendi karesi: assets/film/kapak/<ad>.webp), adı, öğüt rozeti, süresi ve oynat düğmesi.
 * Mino ve Kino tabelanın iki yanında bekler, dokununca tepki verir. Karta dokununca film açılış kartıyla başlar.
 */
import { efekt } from '../../src/audio/ses';
import { Karakter, type HareketAdi } from '../../src/karakter/karakter';
import { Mino, type Tepki } from '../../src/mino/mino';
import { h, sure, svg } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import type { FilmDosya } from './motor';

const FILMLER = import.meta.glob<FilmDosya>('../../content/film/*.json', { eager: true, import: 'default' });
const KAPAKLAR = import.meta.glob<string>('../../assets/film/kapak/*.webp', { eager: true, query: '?url', import: 'default' });

/** Filmlerin ekrandaki sırası (en yeni üstte), öğüt rozeti ve kart rengi. Listede olmayan yeni film sona eklenir. */
const SIRA: { ad: string; ogut: string; renk: string; yeni?: boolean }[] = [
  { ad: 'mino-sepet', ogut: 'Yardım etmek', renk: '#FF8A2B', yeni: true },
  { ad: 'kino-kaydirak', ogut: 'Sıra beklemek', renk: '#3E9DF2' },
  { ad: 'kino-elma-kulesi', ogut: 'Özür dilemek', renk: '#5DBE3F' },
  { ad: 'mino-karpuz', ogut: 'Paylaşmak', renk: '#F0413F' },
];

export interface KatalogFilm {
  ad: string;
  baslik: string;
  ogut: string;
  renk: string;
  yeni: boolean;
  /** Dakika (en az 1) */
  dakika: number;
  kapak: string;
}

/** Filmin süresi: açılış jeneriği hariç sahneler + geçişler (sn) */
function filmSuresi(f: FilmDosya): number {
  const sahneler = (f.sahneler as { sure?: number; gecis?: string }[]).filter((s) => s.sure);
  return sahneler.reduce((t, s, i) => t + (s.sure ?? 0) + (sahneler[i + 1]?.gecis === 'kes' ? 0 : 0.7), 0);
}

export function katalog(): KatalogFilm[] {
  const hepsi = Object.entries(FILMLER).map(([yol, f]) => ({ ad: yol.replace(/^.*\/([^/]+)\.json$/, '$1'), f }));
  // listede olmayanlar sonda, adlarına göre
  const sira = (ad: string) => {
    const i = SIRA.findIndex((s) => s.ad === ad);
    return i < 0 ? SIRA.length : i;
  };
  return hepsi
    .sort((a, b) => sira(a.ad) - sira(b.ad) || a.ad.localeCompare(b.ad))
    .map(({ ad, f }) => {
      const s = SIRA.find((x) => x.ad === ad);
      const ogretir = String((f as { ogretir?: string }).ogretir ?? '');
      return {
        ad,
        baslik: f.baslik,
        ogut: s?.ogut ?? ogretir.charAt(0).toLocaleUpperCase('tr') + ogretir.slice(1),
        renk: s?.renk ?? '#9B5CE0',
        yeni: !!s?.yeni,
        dakika: Math.max(1, Math.round(filmSuresi(f) / 60)),
        kapak: KAPAKLAR[`../../assets/film/kapak/${ad}.webp`] ?? '',
      };
    });
}

const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Kodla çizilmiş patlamış mısır kovası (kırmızı-beyaz çizgili, kabarık mısırlar) */
const MISIR =
  '<svg viewBox="0 0 64 72" aria-hidden="true"><g stroke="#5a3617" stroke-width="3" stroke-linejoin="round">' +
  '<circle cx="20" cy="22" r="9" fill="#fff6d8"/><circle cx="32" cy="15" r="10" fill="#fffaf0"/><circle cx="44" cy="22" r="9" fill="#fff6d8"/>' +
  '<circle cx="26" cy="26" r="8" fill="#fffaf0"/><circle cx="39" cy="27" r="8" fill="#ffe9a8"/>' +
  '<path d="M10 28h44l-6 40H16z" fill="#fff"/></g>' +
  '<path d="M18.5 30.5h7l-1.6 35h-4.6zM31 30.5h7l-.9 35h-5.2zM43.5 30.5h7l-4.6 35h-3.6z" fill="#f0413f"/>' +
  '<path d="M10 28h44l-6 40H16z" fill="none" stroke="#5a3617" stroke-width="3" stroke-linejoin="round"/>' +
  '<rect x="22" y="40" width="20" height="13" rx="6.5" fill="#ffc72c" stroke="#5a3617" stroke-width="2.5"/>' +
  '<path d="M28 46.5l2.6 2.4 4.6-5" fill="none" stroke="#5a3617" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Saat simgesi (süre etiketi) */
const SAAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12 7v5l3.2 2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/** Kalp (öğüt rozeti) */
const KALP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.6 3.3 4.4 6.7-1.7 4.7-9.2 9.3-9.2 9.3z" fill="currentColor"/></svg>';
/** Büyük oynat üçgeni */
const OYNAT = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 11.5c0-2 2.2-3.2 3.9-2.1l17.4 11.6c1.5 1 1.5 3.2 0 4.2L20.9 36.8c-1.7 1.1-3.9-.1-3.9-2.1z" fill="currentColor"/></svg>';

export function katalogEkrani(app: Uygulama, p?: { sec?: string }): Ekran {
  const zamanlar: number[] = [];
  const sonra = (ms: number, fn: () => void) => void zamanlar.push(window.setTimeout(fn, sure(ms)));

  // Mino (önden) ve Kino (ortak iskelet): tabelanın iki yanında
  const mino = new Mino();
  const kino = new Karakter('kino', h('div'));
  const minoTepki = (t: Tepki) => {
    if (!AZ_HAREKET) mino.tepki(t);
  };
  const kinoOynat = (ad: HareketAdi, ms: number) => {
    if (!AZ_HAREKET) void kino.oynat(ad, ms);
  };
  const kinoIfade = (ad: string, ms: number) => {
    if (kino.ifadeVar(ad)) kino.ifade(ad, ms);
  };
  const minoKap = h('div.fl-k-mino', { 'aria-hidden': 'true' }, mino.el);
  const kinoKap = h('div.fl-k-kino', { 'aria-hidden': 'true', 'data-karakter-kap': 'kino' }, h('div.fl-k-kino-ic', {}, kino.el));
  const minoTepkileri: Tepki[] = ['zipla', 'gidik', 'dans', 'mir'];
  let minoSira = 0;
  minoKap.addEventListener('pointerdown', () => {
    efekt.dokunma();
    minoTepki(minoTepkileri[minoSira++ % minoTepkileri.length]);
    kinoOynat('bak', 900);
    minoKap.dataset.tepki = '1';
  });
  const kinoTepkileri: [HareketAdi, string, number][] = [
    ['sevin', 'heyecan', 1300],
    ['dans', 'heyecan', 1500],
    ['huy', 'keyif', 1400],
    ['bak', 'saskin', 1000],
  ];
  let kinoSira = 0;
  kinoKap.addEventListener('pointerdown', () => {
    efekt.dokunma();
    const [hareket, ifade, ms] = kinoTepkileri[kinoSira++ % kinoTepkileri.length];
    kinoOynat(hareket, ms);
    kinoIfade(ifade, ms);
    kinoKap.dataset.tepki = hareket;
    mino.bak(1);
    sonra(ms, () => mino.bak(0));
  });
  // açılışta selamlaşma, sonra ara sıra küçük hareketler
  sonra(700, () => {
    minoTepki('selam');
    kinoOynat('sevin', 1100);
    kinoIfade('heyecan', 1100);
  });
  let bos = 0;
  const bosPlanla = () =>
    sonra(6000 + Math.random() * 3000, () => {
      if (bos++ % 2) {
        kinoOynat('huy', 1400);
        mino.bak(1);
        sonra(1500, () => mino.bak(0));
      } else {
        minoTepki('mir');
        kinoOynat('bak', 1000);
      }
      bosPlanla();
    });
  bosPlanla();

  // ---------------------------------------------------------------- kartlar
  let gidiyor = false;
  const filmler = katalog();
  const kartlar = filmler.map((f, i) => {
    const kapak = h(
      'span.fl-k-kapak',
      {},
      f.kapak ? h('img', { src: f.kapak, alt: '', draggable: 'false', decoding: 'async' }) : h('span.fl-k-kapak-bos'),
      h('span.fl-k-parilti', { 'aria-hidden': 'true' }),
      ...(f.yeni ? [h('span.fl-k-yeni', { 'aria-hidden': 'true' }, 'Yeni')] : []),
      h('span.fl-k-sure', { 'aria-hidden': 'true' }, svg(SAAT), `${f.dakika} dk`),
    );
    // büyük oynat düğmesi kapağın altında (resimdeki karakterlerin üstüne binmesin)
    const bilgi = h(
      'span.fl-k-bilgi',
      {},
      h('span.fl-k-metin', {}, h('span.fl-k-ad', {}, f.baslik), h('span.fl-k-ogut', {}, svg(KALP), f.ogut)),
      h('span.fl-k-oynat', { 'aria-hidden': 'true', html: OYNAT }),
    );
    const kart = h(
      'button.fl-film-kart',
      { type: 'button', 'data-film': f.ad, 'aria-label': `${f.baslik}: ${f.ogut}, ${f.dakika} dakika. Oynat`, style: `--r:${f.renk};--i:${i}` },
      kapak,
      bilgi,
    );
    if (p?.sec === f.ad) kart.classList.add('son-izlenen');
    kart.addEventListener('pointerdown', () => {
      kart.classList.add('basili');
      // Mino basılan karta bakar
      if (AZ_HAREKET) return;
      const k = kart.getBoundingClientRect();
      const m = mino.el.getBoundingClientRect();
      mino.bak(Math.max(-1, Math.min(1, (k.left + k.width / 2 - (m.left + m.width / 2)) / Math.max(160, innerWidth * 0.4))));
      sonra(1200, () => mino.bak(0));
    });
    for (const olay of ['pointerup', 'pointercancel', 'pointerleave'] as const) kart.addEventListener(olay, () => kart.classList.remove('basili'));
    kart.addEventListener('click', () => {
      if (gidiyor) return;
      gidiyor = true;
      efekt.secim();
      minoTepki('zipla');
      kinoOynat('sevin', 700);
      kart.classList.remove('basili');
      kart.classList.add('secildi');
      // adres o filmi gösterir (yenileyince aynı film); film açılış kartıyla hemen başlar
      const q = new URLSearchParams(location.search);
      q.set('film', f.ad);
      history.replaceState(null, '', `?${q}`);
      sonra(AZ_HAREKET ? 120 : 520, () => app.git('film', { ad: f.ad, oynat: true }));
    });
    return h('li.fl-k-yer', { style: `--i:${i}` }, kart);
  });

  const cikis = app.secenekler.cikis;
  const tabela = h('div.fl-k-tabela', {}, h('h1.fl-k-baslik', {}, 'Çizgi Filmler'), h('span.fl-k-misir', { 'aria-hidden': 'true', html: MISIR }));
  const ust = h(
    'header.fl-k-ust',
    {},
    h('div.fl-k-dugmeler', {}, cikis ? yuvarlakDugme(IKON.geri, 'Geri', () => cikis(), 'kucuk') : h('div'), sesDugmesi()),
    h('div.fl-k-sahne', {}, minoKap, tabela, kinoKap),
  );
  const liste = h('nav.fl-k-liste', { 'aria-label': 'Çizgi filmler' }, h('ul.fl-k-izgara', {}, ...kartlar));
  const el = h(
    'div.fl-katalog',
    {},
    h('div.fl-k-perde', { 'aria-hidden': 'true' }, h('i.fl-k-perde-sol'), h('i.fl-k-perde-sag'), h('i.fl-k-sacak')),
    h('div.fl-k-yildizlar', { 'aria-hidden': 'true' }, ...Array.from({ length: 7 }, (_, i) => h('i', { style: `--i:${i}` }))),
    ust,
    liste,
  );
  // son izlenen film görünsün (filmden geri dönünce)
  if (p?.sec) requestAnimationFrame(() => el.querySelector('.son-izlenen')?.scrollIntoView({ block: 'center' }));

  return {
    el,
    kapat() {
      zamanlar.forEach(clearTimeout);
      mino.kapat();
      kino.kapat();
    },
  };
}
