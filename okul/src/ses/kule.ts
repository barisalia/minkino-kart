/**
 * Ses Kulesi ekranı (Ünite 1'in "bölge" ekranı): kule (assets/okul/kule.webp) ortada, harf odaları kulenin iki
 * yanında aşağıdan yukarı kıvrılan merdivenin basamaklarında: A N E T İ L (Maarif 1. sınıf ses sırası). Oda bir
 * öncekisi bitince açılır; sıradaki parlar, Mino ile Kino kapının önünde. Sonraki ses grupları "yakında".
 * Erişim: oda girişinde erisimVarMi('okul/ses-x') (A odası ücretsiz, gerisi abonelik; src/engine/erisim.ts).
 */
import { efekt, konus } from '../../../src/audio/ses';
import { erisimVarMi } from '../../../src/abonelik/kilit';
import type { Karakter } from '../../../src/karakter/karakter';
import type { Mino } from '../../../src/mino/mino';
import { h, sure, svg, TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../../src/uygulama';
import O from '../../../content/okul.json';
import { gorsel, rozet } from '../cizim';
import { AZ_HAREKET, Efekt, oynat } from '../efekt';
import { ses } from '../sesler';
import { bolge } from '../etkinlik';
import { kayit } from '../kayit';
import { HARFLER, odaAcik, odaId, SES_ICERIK as S } from './harfler';
import { odaAdimi } from './oda-kayit';
import { harfStil } from './odalar';
import { pozAdres } from './resim';

export interface KuleBaglam {
  ikili: () => { el: HTMLElement; mino: Mino; kino: Karakter; kapat: () => void };
  parkKatmanlari: (orta?: string | null) => HTMLElement;
  albumDugmesi: () => HTMLElement;
}

/** Odaların kuledeki yeri: sol/sağ (merdiven kıvrılır) ve yükseklik (kulenin boyuna oranla, aşağıdan) */
export const ODA_YERI: [-1 | 1, number][] = [
  [-1, 0.13],
  [1, 0.27],
  [-1, 0.41],
  [1, 0.55],
  [-1, 0.69],
  [1, 0.83],
];

/** Kuleye son bakıldığında bitmiş odalar: yeni biten oda kule açılınca ışıl ışıl yanar, sıradaki odanın kilidi uçar */
let gorulen: Set<string> | null = null;

export function kuleEkrani(app: Uygulama, b: KuleBaglam): Ekran {
  const bolgeB = bolge('ses')!;
  const ikiz = b.ikili();
  const biten = kayit.biten;
  const oneriI = HARFLER.findIndex((hf, i) => odaAcik(i, biten) && !biten.includes(odaId(hf)));
  const kapanis: (() => void)[] = [];
  const yeniBiten = gorulen ? HARFLER.map(odaId).filter((id) => biten.includes(id) && !gorulen!.has(id)) : [];
  gorulen = new Set(biten);
  const odalar = HARFLER.map((hf, i) => {
    const id = odaId(hf);
    const acik = odaAcik(i, biten);
    const bitti = biten.includes(id);
    const yarim = !bitti && odaAdimi(id) > 0;
    const durum = bitti ? 'bitti' : !acik ? 'kilitli' : i === oneriI ? 'oneri' : 'acik';
    const [yan, yuk] = ODA_YERI[i];
    const resim = bitti ? pozAdres(hf.kahraman) : '';
    const d = h(
      'button.ok-oda',
      { type: 'button', 'data-oda': id, 'data-durum': durum, style: `${harfStil(hf)};--yan:${yan};--yuk:${yuk};--i:${i}`, 'aria-label': S.arayuz.oda.replace('{Harf}', hf.buyuk) },
      h('span.ok-oda-harf', { 'aria-hidden': 'true' }, h('b', {}, hf.buyuk), h('i', {}, hf.kucuk)),
      resim ? h('img.ok-oda-resim', { src: resim, alt: '', draggable: 'false' }) : null,
      bitti ? h('i.ok-durak-tamam', { html: IKON.onay }) : null,
      durum === 'kilitli' ? h('i.ok-oda-kilit', { html: IKON.kilit }) : null,
      yarim ? h('i.ok-oda-yarim', { 'aria-hidden': 'true' }) : null,
    );
    d.addEventListener('click', () => {
      if (durum === 'kilitli') {
        efekt.kilitli();
        oynat(d, 'ok-hmm');
        if (!AZ_HAREKET) ikiz.mino.tepki('kararsiz', 1.2);
        void konus(S.mino.kilitli);
        oynat(odalar[oneriI], 'ok-ses-zipla');
        return;
      }
      if (!erisimVarMi(`okul/${id}`, app.kok)) return;
      efekt.secim();
      app.git('etkinlik', { id });
    });
    return d;
  });
  const yakinda = h('button.ok-kule-yakinda', { type: 'button', 'aria-label': O.arayuz.yakinda }, svg(IKON.kilit), h('span', {}, S.sonraki_gruplar[0].split(' ').slice(0, 3).join(' '), '…'));
  yakinda.addEventListener('click', () => {
    efekt.kilitli();
    oynat(yakinda, 'ok-hmm');
    void konus(O.mino.yakinda);
  });
  const yol = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  yol.setAttribute('class', 'ok-kule-yol');
  yol.setAttribute('aria-hidden', 'true');
  const kule = h(
    'div.ok-kule',
    {},
    // merdiven kulenin arkasından dolanır (resmin altında)
    yol,
    h('img.ok-kule-resim', { src: gorsel('okul/kule'), alt: '', draggable: 'false' }),
    ...odalar,
    yakinda,
    h('div.ok-kule-ikili', {}, ikiz.el),
  );
  const rozetEl = kayit.rozet.includes('ses') ? h('div.ok-bahce-rozet.ok-kule-rozet', { html: rozet('ses'), 'aria-label': bolgeB.rozet }) : null;
  const el = h(
    'div.ok-kule-ekran',
    { 'data-bolge': 'ses', style: `--r:${bolgeB.renk}` },
    b.parkKatmanlari(null),
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Harita', () => app.git('acilis'), 'kucuk'), h('div.orta', {}, h('h1.ok-baslik', {}, bolgeB.ad)), h('div.ust-grup', {}, b.albumDugmesi(), sesDugmesi())),
    h('div.ok-kule-kap', {}, kule, rozetEl),
  );
  // efekt katmanı (parıltı) ekranın kökünde
  const efektK = new Efekt(el);
  el.append(efektK.el);

  // merdiven: odaları sırayla bağlayan noktalı yol (yerleşim ölçülerek çizilir)
  const ciz = () => {
    const W = kule.clientWidth;
    const H = kule.clientHeight;
    if (!W || !H) return;
    yol.setAttribute('viewBox', `0 0 ${W} ${H}`);
    // odaların merkezi (kayma: translate -50% 50% → merkez offsetLeft, offsetTop + boy)
    const m = odalar.map((d) => [d.offsetLeft, d.offsetTop + d.offsetHeight] as const);
    let p = `M${W / 2} ${H - 4}`;
    m.forEach(([x, y], i) => {
      const [x0, y0] = i ? m[i - 1] : [W / 2, H - 4];
      p += ` Q${((x0 + x) / 2).toFixed(1)} ${(Math.max(y0, y) + 10).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    const tamam = Math.max(0, HARFLER.findIndex((hf) => !biten.includes(odaId(hf))));
    yol.innerHTML = `<path class="ok-kule-yol-dis" d="${p}"/><path class="ok-kule-yol-ic" d="${p}"/>`;
    yol.dataset.tamam = String(tamam);
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => ciz()) : null;
  ro?.observe(kule);
  kapanis.push(() => ro?.disconnect());
  const zamanlar = [
    window.setTimeout(ciz, 30),
    ...yeniBiten.flatMap((id, n) => {
      const i = HARFLER.findIndex((hf) => odaId(hf) === id);
      const d = odalar[i];
      const sonraki = odalar[i + 1];
      return [
        window.setTimeout(() => {
          // oda yanar: altın ışık, parıltı
          oynat(d, 'ok-oda-yandi');
          ses.sihir();
          const [x, y] = efektK.merkez(d);
          efektK.parilti(x, y, 12, 1.2);
        }, sure(700 + n * 1200)),
        window.setTimeout(() => {
          if (!sonraki || sonraki.dataset.durum === 'kilitli') return;
          // sıradakinin kilidi uçup gider
          const kilit = h('i.ok-oda-kilit.ok-oda-kilit-ucan', { html: IKON.kilit });
          sonraki.append(kilit);
          kilit.addEventListener('animationend', () => kilit.remove());
          oynat(sonraki, 'ok-oda-acildi');
          ses.pit(5);
        }, sure(1500 + n * 1200)),
      ];
    }),
    window.setTimeout(() => {
      if (!AZ_HAREKET) ikiz.mino.tepki('selam');
      void konus([biten.some((x) => x.startsWith('ses-')) ? '' : S.mino.kule, S.mino.kule_soru]);
    }, TEST_MODU ? 10 : 450),
  ];
  return {
    el,
    kapat() {
      zamanlar.forEach(clearTimeout);
      kapanis.forEach((f) => f());
      ikiz.kapat();
    },
  };
}
