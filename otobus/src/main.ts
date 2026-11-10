/**
 * Kino ile Mino'nun Otobüsü: iki otobüs oyunu tek oyunun aşamaları (Barış 2026-11-07).
 * Bu sayfa aşama seçimi: 1 Dondurma (kino-otobus/) ve 2 Pasta (pasta/). Aşamadan geri basınca buraya dönülür
 * (kino-otobus/src/main.ts, pasta/src/main.ts → sayfayaDon('../otobus/')); buradan geri ana menüye.
 * Yeni konuşma metni yok (kredi harcamaz); kartlar resimli, yazı yalnız kısa ad.
 */
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import './otobus.css';
import { kilitleriKur, erisimVarMi } from '../../src/abonelik/kilit';
import { efekt } from '../../src/audio/ses';
import { sayfaAdresi } from '../../src/kabuk/sayfa';
import { geriDinle } from '../../src/kabuk/yon';
import { h } from '../../src/ui/dom';
import { sayfaAcildi, sayfadanCik } from '../../src/ui/gecis';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import { anaMenuyeDon } from '../../src/uygulama';
import { OTOBUS } from '../../pasta/src/cizim';
import dondurmaKapak from '../../assets/kino-otobus/kapak.webp';
import park from '../../assets/film/park/arka-uzak.webp';

export interface Asama {
  id: string;
  /** erişim kimliği (src/engine/erisim.ts) */
  erisim: string;
  no: number;
  ad: string;
  adres: string;
  renk: string;
}

export const ASAMALAR: Asama[] = [
  { id: 'dondurma', erisim: 'kino-otobus', no: 1, ad: 'Dondurma', adres: '../kino-otobus/', renk: '#5FB4DC' },
  { id: 'pasta', erisim: 'pasta', no: 2, ad: 'Pasta', adres: '../pasta/', renk: '#FF6FA8' },
];

const kok = document.getElementById('otobus');
if (kok) {
  kok.className = 'mk-kok ob-kok';
  kok.style.setProperty('--park', `url("${park}")`);
  const git = (adres: string) => sayfadanCik(() => location.assign(sayfaAdresi(adres)), adres);

  const kartlar = ASAMALAR.map((a) => {
    const resim =
      a.id === 'dondurma'
        ? h('img.ob-resim', { src: dondurmaKapak, alt: '', draggable: 'false' })
        : h('span.ob-resim.ob-pasta', {}, h('span.ob-otobus', { html: OTOBUS }));
    const kart = h(
      'button.ob-kart',
      { type: 'button', 'aria-label': `${a.no}. aşama: ${a.ad}`, 'data-asama': a.id, style: `--renk:${a.renk}` },
      h('span.ob-cerceve', {}, resim, h('span.ob-no', { 'aria-hidden': 'true' }, String(a.no))),
      h('span.ob-ad', {}, a.ad),
    );
    kart.addEventListener('click', () => {
      efekt.dokunma();
      if (erisimVarMi(a.erisim, kok)) git(a.adres);
    });
    return [kart, a.erisim, kart.querySelector<HTMLElement>('.ob-cerceve')!] as [HTMLElement, string, HTMLElement];
  });

  kok.append(
    h('div.ob-ust', {}, yuvarlakDugme(IKON.geri, 'Ana menü', anaMenuyeDon, 'ob-geri')),
    h('div.ob-izgara', {}, ...kartlar.map(([k]) => k)),
  );
  kilitleriKur(kartlar);
  // Android geri tuşu: ana menüye
  geriDinle(() => {
    anaMenuyeDon();
    return true;
  });
  sayfaAcildi(kok);
}
