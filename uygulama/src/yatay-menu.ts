import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { minkinoLogo } from '../../src/ui/logo';
import { konus } from '../../src/audio/ses';
import { ebeveynKapisiAc } from '../../src/ui/ebeveyn-kapisi';
import { sayfadanCik } from '../../src/ui/gecis';
import { sayfaAdresi } from '../../src/kabuk/sayfa';
import { uygulamaPlatformu } from '../../src/kabuk/ortam';
import { geriDinle } from '../../src/kabuk/yon';
import { kilitleriKur, erisimVarMi } from '../../src/abonelik/kilit';
import { menuYasiOku, menuYasiniSec } from '../../src/engine/menu-yas';
import { YASLAR, type Yas } from '../../src/engine/types';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { menuOyunlari } from './oyunlar';
import { KITAPLAR } from '../../kitap/src/kitaplar';
import { kartResmi } from './ekranlar';
import { VIDEOLAR } from '../../src/video/videolar';
import './yatay-menu.css';

import etkinlikSimge from '../../assets/uygulama/kategoriler/etkinlik-ikon.webp';
import kitapSimge from '../../assets/uygulama/kategoriler/kitap-ikon.webp';
import oyunSimge from '../../assets/uygulama/kategoriler/oyun-ikon.webp';
import filmSimge from '../../assets/uygulama/kategoriler/film-ikon.webp';

const bolumler = [
  { id: 'etkinlik', ad: 'Etkinlikler', renk: '#9560e5', simge: etkinlikSimge },
  { id: 'kitap', ad: 'Kitaplar', renk: '#f45e53', simge: kitapSimge },
  { id: 'oyun', ad: 'Oyunlar', renk: '#ffd044', simge: oyunSimge },
  { id: 'film', ad: 'Çizgi Filmler', renk: '#3cbe92', simge: filmSimge },
] as const;
type Bolum = typeof bolumler[number];
const resimler = import.meta.glob<string>('../../assets/{kitap/okul,canlan,pazar,dedektif,giysin,kino-otobus,hayvanlar,sahne}/*.webp', { eager: true, query: '?url', import: 'default' });
const oyunKapaklari = import.meta.glob<string>('../../assets/uygulama/oyun-kapaklari/*.webp', { eager: true, query: '?url', import: 'default' });
const kitapKapaklari = import.meta.glob<string>('../../assets/kitap/*/kapak.webp', { eager: true, query: '?url', import: 'default' });
const resim = (ad: string) => resimler[`../../assets/${ad}.webp`] ?? '';
/** Yaş kartlarının renkleri (kategori renkleriyle aynı aile) */
const YAS_RENK: Record<Yas, string> = { 3: '#9560e5', 4: '#f45e53', 5: '#ffb627', 6: '#3cbe92' };

/**
 * Yaş seçimi: tam ekran, menüyle aynı stilde dört büyük kart. Yazı okunmaz: kocaman rakam ve o kadar yıldız
 * (çocuk sayar); açılınca "Kaç yaşındasın?" söylenir, seçince "<yaş> yaş! Harika!" (ikisinin de kaydı var).
 * İlk açılışta (yaş hiç seçilmemişse) kendiliğinden, sonra üstteki yaş düğmesiyle açılır.
 */
function yasSor(kok: HTMLElement, secildi: () => void, kapatilabilir: boolean) {
  const secili = menuYasiOku();
  const katman = h('div.ym-yas-katman', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Kaç yaşındasın?' });
  const kapat = () => katman.remove();
  const kartlar = YASLAR.map((y) =>
    h(
      'button.ym-yas-kart',
      {
        type: 'button',
        'aria-label': `${y} yaş`,
        'aria-pressed': secili === y ? 'true' : 'false',
        style: `--renk:${YAS_RENK[y]}`,
        onclick: () => {
          menuYasiniSec(y);
          void konus(`${y} yaş! Harika!`);
          kapat();
          secildi();
        },
      },
      h('span.ym-yas-rakam', {}, String(y)),
      h('span.ym-yas-yildiz', { 'aria-hidden': 'true' }, ...Array.from({ length: y }, () => svg(IKON.yildiz))),
    ),
  );
  const ust = h(
    'div.ym-yas-ust',
    {},
    h('button.ym-yuvarlak', { type: 'button', 'aria-label': 'Kaç yaşındasın? Dinle', onclick: () => void konus('Kaç yaşındasın?') }, svg(IKON.hoparlor)),
    ...(kapatilabilir ? [h('button.ym-yuvarlak', { type: 'button', 'aria-label': 'Kapat', onclick: kapat }, svg(IKON.kapat))] : []),
  );
  katman.append(ust, h('div.ym-yas-kartlar', {}, ...kartlar));
  kok.append(katman);
  void konus('Kaç yaşındasın?');
  (katman.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ?? kartlar[0]).focus();
}

export function yatayMenuEkrani(app: Uygulama): Ekran {
  const el = h('div.ym-ekran');
  const kayitliYas = menuYasiOku();
  if (kayitliYas !== null) menuYasiniSec(kayitliYas);
  let bolum: Bolum | undefined = bolumler.find(b => b.id === sessionStorage.getItem('minkino-menu-bolum'));
  let birak = () => {};
  const git = (adres: string) => sayfadanCik(() => location.assign(sayfaAdresi(adres)), adres);
  const ses = (ad: string) => h('button.ym-ses', { type: 'button', 'aria-label': `${ad} adını dinle`, onclick: (e: Event) => { e.stopPropagation(); void konus(ad); } }, svg(IKON.hoparlor));
  const kategori = (b: Bolum, yan = false) => {
    const dugme = h('button.ym-kategori', { type: 'button', style: `--renk:${b.renk}`, 'aria-label': b.ad, 'aria-pressed': bolum?.id === b.id ? 'true' : 'false', onclick: () => { bolum = b; kur(); } }, h('span.ym-simge', {}, h('img', { src: b.simge, alt: '' })), h('span.ym-etiket', {}, b.ad));
    return h(`div.ym-kategori-kap${yan ? '.ym-yan-kart' : ''}`, {}, dugme, ...(!yan ? [ses(b.ad)] : []));
  };
  const kur = () => {
    birak();
    if (bolum) sessionStorage.setItem('minkino-menu-bolum', bolum.id);
    else sessionStorage.removeItem('minkino-menu-bolum');
    const geri = h('button.ym-yuvarlak', { type: 'button', 'aria-label': 'Ana menü', onclick: () => { bolum = undefined; kur(); } }, svg(IKON.geri));
    const seciliYas = menuYasiOku();
    // yaş düğmesi: yıldız ve rakam (yazı yok); dokununca büyük yaş seçimi
    const yas = h('button.ym-yas', { type: 'button', 'aria-label': 'Yaş aralığını seç' }, svg(IKON.yildiz), h('span', {}, seciliYas === null ? '?' : String(seciliYas)));
    yas.addEventListener('click', () => yasSor(el, kur, true));
    const ayar = h('button.ym-yuvarlak', { type: 'button', 'aria-label': 'Ebeveyn ayarları', onclick: async () => { if (await ebeveynKapisiAc(el)) app.git('ayarlar'); } }, svg(IKON.ebeveyn));
    const ust = h('header.ym-ust', {}, ...(bolum ? [geri] : []), minkinoLogo('kenarli'), h('h1', {}, bolum?.ad ?? ''), yas, ayar);
    el.replaceChildren(ust);
    if (!bolum) { el.append(h('div.ym-ana', {}, ...bolumler.map(b => kategori(b)))); return; }
    const secili = bolum;
    const panel = h('div.ym-panel', { 'aria-label': secili.ad });
    const kilitler: [HTMLElement, string, HTMLElement][] = [];
    const kart = (ad: string, url: string, kapak: string, id?: string, cizim?: HTMLElement) => {
      const dugme = h('button.ym-icerik', { type: 'button', 'aria-label': ad, 'data-oyun': id, onclick: () => { if (!id || erisimVarMi(id, el)) git(url); }, style: `--renk:${secili.renk}` }, cizim ?? (kapak ? h('img', { src: kapak, alt: '', loading: 'lazy' }) : h('img.ym-yedek', { src: secili.simge, alt: '' })), ...(id && oyunKapaklari[`../../assets/uygulama/oyun-kapaklari/${id}.webp`] ? [] : [h('span.ym-baslik', {}, ad)]));
      const kap = h('div.ym-icerik-kap', {}, dugme, ses(ad));
      if (id) { const rozet = h('span.ym-kilit'); kap.append(rozet); kilitler.push([dugme, id, rozet]); }
      panel.append(kap);
    };
    if (secili.id === 'film') {
      // Barış 2026-11-10: eski 6 canlı film kalktı; yalnız video çizgi filmler (src/video/videolar.ts)
      for (const v of VIDEOLAR) kart(v.baslik, `./izle/?video=${encodeURIComponent(v.id)}`, v.kapak, `izle/${v.id}`);
    } else if (secili.id === 'kitap') {
      for (const kitap of KITAPLAR) {
        if (!kitap.icerik || kitap.gizli) continue;
        const kapak = kitapKapaklari[`../../assets/kitap/${kitap.id}/kapak.webp`] || resim(`kitap/${kitap.id}/kapak-tam`);
        kart(kitap.baslik, `./kitap/?kitap=${encodeURIComponent(kitap.id)}&sayfa=1`, kapak);
      }
    } else {
      menuOyunlari(!!uygulamaPlatformu()).filter(k => secili.id === 'etkinlik' ? ['hazirlik', 'canlan', 'kartlar', 'macera'].includes(k.id) : !['hazirlik', 'canlan', 'kartlar', 'macera', 'film', 'kitap'].includes(k.id)).forEach(k => {
        const kapak = oyunKapaklari[`../../assets/uygulama/oyun-kapaklari/${k.id}.webp`];
        const ad = k.ust ? `${k.ust} ${k.ad}` : k.ad;
        kart(ad, k.adres, kapak, k.id, kapak ? undefined : kartResmi(k));
      });
    }
    el.append(h('div.ym-govde', {}, h('nav.ym-yan', { 'aria-label': 'Kategoriler' }, ...bolumler.map(b => kategori(b, true))), panel));
    birak = kilitleriKur(kilitler);
  };
  kur();
  // ilk açılış: yaş hiç seçilmemişse önce yaş sorulur (test modunda yalnız ?yassor=1 ile)
  if (menuYasiOku() === null && (!TEST_MODU || new URLSearchParams(location.search).has('yassor'))) yasSor(el, kur, false);
  const geriBirak = geriDinle(() => { if (!bolum) return false; bolum = undefined; kur(); return true; });
  return { el, kapat: () => { birak(); geriBirak(); } };
}



