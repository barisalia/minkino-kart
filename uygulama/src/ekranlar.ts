/** Minkino ana menüsü: Mino karşılar, altında oyun kartları; büyükler için ebeveyn kapısı (basılı tut) */
import { efekt } from '../../src/audio/ses';
import { Mino, type Tepki } from '../../src/mino/mino';
import { h, sure, svg } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { OYUNLAR, type OyunKarti } from './oyunlar';

// Yalnız kartların kullandığı klasörler (bütün assets/ pakete adres olarak girmesin)
const CIZIMLER = import.meta.glob<string>(
  ['../../assets/{hayvanlar,tasitlar,meyveler,pazar,sahne,canlan,sanatci,parti,parti-sahne,orman-esya}/*.webp'],
  { eager: true, query: '?url', import: 'default' },
);
const adres = (yol: string) => CIZIMLER[`../../assets/${yol}.webp`] ?? '';

const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOGO_RENK = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'];
/** Ebeveyn kapısının açılması için basılı tutma süresi */
export const KAPI_SURE = 1500;

function logo(): HTMLElement {
  const yazi = h('div.logo-yazi', { role: 'img', 'aria-label': 'Minkino' });
  [...'minkino'].forEach((c, i) => yazi.append(h('span', { style: `color:${LOGO_RENK[i]};--i:${i};--yon:${i % 2 ? 1 : -1}`, 'aria-hidden': 'true' }, c)));
  return h('div.ug-logo', {}, yazi);
}

/** Kartın resmi: oyunun kendi çizimlerinden küçük bir sahne */
function kartResmi(k: OyunKarti): HTMLElement {
  const zemin = k.zemin ? adres(k.zemin) : '';
  const kap = h('span.ug-kart-resim', { style: zemin ? `--zemin:url("${zemin}")` : undefined });
  for (const c of k.katmanlar) {
    const sinif = c.sinif.split(' ').join('.');
    if (c.ikon) {
      kap.append(svg(IKON[c.ikon], `ug-k ug-rozet ${c.sinif}`));
      continue;
    }
    const url = c.gorsel ? adres(c.gorsel) : '';
    if (!url) continue;
    const img = h('img', { src: url, alt: '', draggable: 'false', decoding: 'async' });
    kap.append(c.cerceve ? h(`span.ug-k.${sinif}.ug-cerceve`, {}, img) : h(`span.ug-k.${sinif}`, {}, img));
  }
  return kap;
}

/**
 * Basılı tutunca `ac` çalışır; erken bırakılırsa `kisa`. Tutarken `dolduruyor` sınıfı eklenir
 * (CSS'te `--kapi-sure` boyunca dolan daire; yalnız transform).
 */
export function basiliTut(el: HTMLElement, ms: number, ac: () => void, kisa?: () => void): () => void {
  let zaman = 0;
  el.style.setProperty('--kapi-sure', `${ms}ms`);
  const birak = (erken: boolean) => {
    if (!zaman) return;
    clearTimeout(zaman);
    zaman = 0;
    el.classList.remove('dolduruyor');
    if (erken && kisa) kisa();
  };
  el.addEventListener('pointerdown', (e) => {
    if (e.button > 0 || zaman) return;
    el.classList.add('dolduruyor');
    zaman = window.setTimeout(() => {
      zaman = 0;
      el.classList.remove('dolduruyor');
      ac();
    }, ms);
  });
  el.addEventListener('pointerup', () => birak(true));
  el.addEventListener('pointercancel', () => birak(false));
  el.addEventListener('pointerleave', () => birak(false));
  // Klavye: Enter/Boşluk basılı tutma yerine doğrudan açar (büyükler için)
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      ac();
    }
  });
  return () => birak(false);
}

// ---------------------------------------------------------------- Menü
export function menuEkrani(app: Uygulama): Ekran {
  const mino = new Mino();
  const tepki = (t: Tepki) => {
    if (!AZ_HAREKET) mino.tepki(t);
  };
  const zamanlar: number[] = [];
  // Mino el sallayarak karşılar
  zamanlar.push(window.setTimeout(() => tepki('evet'), sure(700)));
  const minoTepkileri: Tepki[] = ['gidik', 'mir', 'zipla', 'dans'];
  let sira = 0;
  mino.el.addEventListener('pointerdown', () => {
    efekt.dokunma();
    tepki(minoTepkileri[sira++ % minoTepkileri.length]);
  });

  let gidiyor = false;
  const kartlar = OYUNLAR.map((k, i) => {
    const govde = h('span.ug-kart-govde', {}, kartResmi(k), h('span.ug-kart-ad', {}, k.ad));
    const a = h('a.ug-kart', { href: k.adres, 'data-oyun': k.id, 'aria-label': k.ad, style: `--r:${k.renk};--i:${i}`, draggable: 'false' }, govde);
    a.addEventListener('pointerdown', () => a.classList.add('basili'));
    for (const olay of ['pointerup', 'pointercancel', 'pointerleave'] as const) a.addEventListener(olay, () => a.classList.remove('basili'));
    a.addEventListener('click', (e) => {
      // Karta dokununca kart zıplar, Mino sevinir, kısa bir an sonra oyuna geçilir.
      // Tek uygulamaya gömülünce burada sayfa değişmek yerine oyunun `oyunuBaslat(kok, { cikis })` girişi çağrılacak.
      e.preventDefault();
      if (gidiyor) return;
      gidiyor = true;
      efekt.secim();
      tepki('zipla');
      a.classList.remove('basili');
      a.classList.add('secildi');
      zamanlar.push(window.setTimeout(() => location.assign(a.href), sure(AZ_HAREKET ? 150 : 650)));
    });
    return h('li.ug-kart-yer', { style: `--i:${i}` }, a);
  });

  const kapi = h('button.ug-kapi', { type: 'button', 'aria-label': 'Ebeveyn köşesi (basılı tutun)' }, h('span.ug-kapi-halka', { 'aria-hidden': 'true' }), svg(IKON.ebeveyn));
  const ipucu = h('span.ug-kapi-ipucu', { role: 'status' }, 'Büyükler için: basılı tutun');
  let ipucuZaman = 0;
  const kapiBirak = basiliTut(
    kapi,
    sure(KAPI_SURE),
    () => {
      efekt.secim();
      app.git('ayarlar');
    },
    () => {
      ipucu.classList.add('gorunur');
      clearTimeout(ipucuZaman);
      ipucuZaman = window.setTimeout(() => ipucu.classList.remove('gorunur'), 2200);
    },
  );

  const el = h(
    'div.ug-menu',
    {},
    h('div.ug-gok', { 'aria-hidden': 'true' }, h('i.ug-bulut.ug-bulut-1'), h('i.ug-bulut.ug-bulut-2'), h('i.ug-bulut.ug-bulut-3')),
    h('div.ug-kose', {}, ipucu, kapi),
    h('header.ug-giris', {}, logo(), h('div.ug-mino-kap', {}, h('div.ug-mino', {}, mino.el))),
    h('nav.ug-oyunlar', { 'aria-label': 'Oyunlar' }, h('ul.ug-izgara', {}, ...kartlar)),
  );
  return {
    el,
    kapat() {
      zamanlar.forEach(clearTimeout);
      clearTimeout(ipucuZaman);
      kapiBirak();
      mino.kapat();
    },
  };
}

// ---------------------------------------------------------------- Ebeveyn köşesi (şimdilik boş)
export function ayarlarEkrani(app: Uygulama): Ekran {
  const geri = yuvarlakDugme(IKON.geri, 'Ana menü', () => app.git('menu'), 'kucuk');
  const el = h(
    'div.ug-ayarlar',
    {},
    h('div.ust-cubuk', {}, geri, h('h1', {}, 'Ebeveyn Köşesi'), h('div.ug-bosluk')),
    h('div.ug-ayarlar-ic', {}, h('div.ug-ayarlar-kutu', {}, svg(IKON.ebeveyn, 'ug-ayarlar-ikon'), h('p', {}, 'Ayarlar yakında burada olacak.'))),
  );
  return { el };
}
