/** Sesli Maceralar ekranları: açılış (bölüm seçimi), büyükler (mikrofon izni), bölüm */
import M from '../../content/macera.json';
import { efekt, KINO_SESI, konus } from '../../src/audio/ses';
import { karakterCumleleri, normal } from '../../src/audio/cumleler';
import { durum } from '../../src/engine/ilerleme';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { kulak } from '../../orman/src/kulak';
import { dogumGunu, dokunma, type BolumArayuz } from './dogumgunu';
import { adres, resim } from './gorsel';
import BN from '../../content/macera-banyo.json';
import { banyoBolumu } from './banyo';
import { banyoAdres } from './banyo-gorsel';
import { MINO_SVG } from '../../src/mino/mino-svg';
import { KINO_ISKELET } from './banyo-karakter';
import E from '../../content/macera-ege.json';
import { egeUyuyor } from './ege';
import { Ege } from './ege-bebek';

/** Oynanacak bölüm (açılışta seçilir; test/önizlemede ?bolum=banyo | ?bolum=ege) */
type BolumAdi = 'dogumgunu' | 'banyo' | 'ege';
const BOLUM_PARAM = new URLSearchParams(location.search).get('bolum');
let secilenBolum: BolumAdi = BOLUM_PARAM === 'banyo' || BOLUM_PARAM === 'ege' ? BOLUM_PARAM : 'dogumgunu';
const KINO_RESIM = import.meta.glob<string>('../../assets/karakter-iskelet/*.svg', { eager: true, query: '?url', import: 'default' });

const IZIN_ANAHTAR = 'minkino-macera-izin';
const izinVar = () => {
  try {
    return localStorage.getItem(IZIN_ANAHTAR) === '1';
  } catch {
    return false;
  }
};

const KULAK_SVG =
  '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 20a11 11 0 0 1 22 0c0 8-7 8-7 15a6 6 0 0 1-11 3"/><path d="M19 21a5 5 0 0 1 10 0c0 3-3 4-3 7"/></svg>';

// ---------------------------------------------------------------- Açılış
export function acilisEkrani(app: Uygulama): Ekran {
  const oyna = h('button.dugme.mc-oyna', { type: 'button' }, svg(IKON.oyna), 'Oyna');
  const kart = h(
    'button.mc-bolum-kart',
    { type: 'button', 'aria-label': M.bolumler.dogumgunu },
    h('span.mc-bolum-resim', { style: `--resim:url("${adres('parti-sahne/oda')}")` }, resim('parti/pasta', 'mc-bk-pasta'), resim('parti/ada', 'mc-bk-ada'), resim('orman-esya/balon', 'mc-bk-balon')),
    h('b', {}, M.bolumler.dogumgunu),
  );
  const basla = (bolum: BolumAdi = 'dogumgunu') => {
    secilenBolum = bolum;
    efekt.secim();
    if (!durum.i.yas) app.git('yas', { sonra: 'izin' });
    else if (kulak.acik || kulak.durum === 'yok' || TEST_MODU) app.git('bolum');
    else app.git('izin');
  };
  oyna.addEventListener('click', () => basla());
  kart.addEventListener('click', () => basla());
  // Mino Banyo Yapmıyor! (küçük kart: banyoda Mino ile Kino)
  const kinoUrl = KINO_RESIM[`../../assets/karakter-iskelet/${KINO_ISKELET}.svg`] ?? '';
  const banyoKart = h(
    'button.bn-bolum-kart',
    { type: 'button', 'aria-label': BN.baslik },
    h(
      'span.bn-bk-resim',
      { style: `--resim:url("${banyoAdres('arkaplan')}")` },
      h('span.bn-bk-mino', { html: MINO_SVG }),
      kinoUrl ? h('img.bn-bk-kino', { src: kinoUrl, alt: '', draggable: 'false' }) : null,
      banyoAdres('kuvet-on') ? h('img.bn-bk-kuvet', { src: banyoAdres('kuvet-on'), alt: '', draggable: 'false' }) : null,
    ),
    h('b', {}, BN.baslik),
  );
  banyoKart.addEventListener('click', () => {
    basla('banyo');
  });
  // Bölüm 2: Şşş, Ege Uyuyor! (küçük kart: uyuyan Ege)
  const egeResim = new Ege();
  egeResim.ifade('uyuyor');
  egeResim.durum('uyku');
  const egeKart = h('button.eg-bolum-kart', { type: 'button', 'aria-label': E.baslik }, h('span.eg-bk-resim', { style: `--resim:url("${adres('parti-sahne/oda')}")` }, egeResim.el), h('span.eg-bk-yazi', {}, h('small', {}, 'Bölüm 2'), h('b', {}, E.baslik)));
  egeKart.addEventListener('click', () => basla('ege'));
  const baslik = h('div.mc-logo', { role: 'img', 'aria-label': M.baslik }, ...M.baslik.split(' ').map((k, i) => h(`span.k${i}`, {}, k)));
  return {
    el: h('div.mc-acilis', { style: `--resim:url("${adres('parti-sahne/oda')}")` }, h('div.mc-acilis-arka'), h('div.ust-cubuk.mc-sag-ust', {}, h('div'), sesDugmesi()), h('div.mc-acilis-ic', {}, baslik, kart, egeKart, banyoKart, oyna)),
    kapat() {
      egeResim.kapat();
    },
  };
}

// ---------------------------------------------------------------- Büyükler: mikrofon izni
export function izinEkrani(app: Uygulama): Ekran {
  const durumYazi = h('p.mc-izin-durum');
  const ac = h('button.dugme', { type: 'button' }, svg(KULAK_SVG), 'Mikrofonu aç');
  const dokun = h('button.ince-dugme', { type: 'button' }, 'Mikrofonsuz oyna (dokunarak)');
  ac.addEventListener('click', async () => {
    ac.setAttribute('disabled', '');
    durumYazi.textContent = 'Bir saniye sessiz olalım: ortamın sesini ölçüyorum…';
    if (await kulak.ac()) {
      try {
        localStorage.setItem(IZIN_ANAHTAR, '1');
      } catch {
        /* gizli sekme */
      }
      app.git('bolum');
    } else {
      durumYazi.textContent = 'Mikrofon açılamadı. Tarayıcı ayarlarından izin verebilir ya da parmakla oynayabilirsiniz.';
      ac.removeAttribute('disabled');
    }
  });
  dokun.addEventListener('click', () => {
    kulak.mikrofonsuz();
    app.git('bolum');
  });
  return {
    el: h(
      'div.mc-izin',
      {},
      h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.git('acilis')), h('div'), h('div')),
      h(
        'div.mc-izin-kart',
        {},
        h('h2', {}, 'Büyükler için'),
        h('p', {}, 'Bu oyun nefesle, sesle ve alkışla oynanır. Bunun için mikrofon gerekir.'),
        h('ul', {}, h('li', {}, 'Ses kaydedilmez, telefondan dışarı çıkmaz; her an işlenip silinir.'), h('li', {}, 'Kelimeler değil, sesin şekli dinlenir: üfleme, alkış, ince-kalın ses, sessizlik.'), h('li', {}, 'Her adım parmakla da oynanabilir.')),
        ac,
        durumYazi,
        dokun,
      ),
    ),
  };
}

// ---------------------------------------------------------------- Bölüm
export function bolumEkrani(app: Uygulama): Ekran {
  const bolum = secilenBolum;
  const yazi = h('span.mc-yazi');
  let sonYazi = '';
  // Tekrar dinle: Kino'nun cümlesi Kino'nun sesiyle (kendi sesi ya da kalın ton), diğerleri Mino tonuyla
  const kinoCumleleri = new Set(karakterCumleleri().kino);
  const tekrarDinle = () => void konus(sonYazi, kinoCumleleri.has(normal(sonYazi)) ? KINO_SESI : { ton: 1.12 });
  const balon = h('div.baslik-balon.mc-altyazi', {}, yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', tekrarDinle, 'kucuk'), yazi);
  const noktalar = h('div.mc-ilerleme');
  const ipucu = h('div.mc-ipucu');
  const kulakEl = h('div.mc-kulak', {}, h('i.mc-kulak-halka'), svg(KULAK_SVG));
  const dugmeYeri = h('div.mc-dugme-yeri');
  const sahneKok = h('div.mc-sahne-kok');
  const el = h(
    'div.mc-bolum',
    {},
    sahneKok,
    h('div.ust-cubuk.mc-ust', {}, yuvarlakDugme(IKON.geri, 'Çık', () => app.git('acilis')), h('div.orta', {}, balon), noktalar),
    h('div.mc-alt', {}, kulakEl, ipucu),
    dugmeYeri,
  );
  let kapandi = false;
  let dugmeCoz: (() => void) | null = null;
  const ui: BolumArayuz = {
    yazi(t) {
      sonYazi = t;
      yazi.textContent = t;
      balon.classList.remove('yeni');
      void balon.offsetWidth;
      balon.classList.add('yeni');
    },
    ipucu(t) {
      ipucu.textContent = t ?? '';
      ipucu.classList.toggle('acik', !!t);
    },
    dugme(etiket) {
      return new Promise<void>((coz) => {
        const b = h('button.dugme.mc-buyuk-dugme', { type: 'button' }, etiket);
        b.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          coz();
        });
        dugmeCoz = coz;
        dugmeYeri.replaceChildren(b);
      });
    },
    dugmeKaldir() {
      dugmeYeri.replaceChildren();
      dugmeCoz = null;
    },
    ilerleme(n, toplam) {
      noktalar.replaceChildren(...Array.from({ length: toplam }, (_, i) => h(`i${i < n ? '.dolu' : ''}`)));
      noktalar.classList.toggle('acik', n < toplam);
    },
    kapandiMi: () => kapandi,
  };
  // dokunma: her adımın parmak karşılığı
  const hedefDugme = (e: Event) => !!(e.target as Element).closest?.('button');
  let basili = false;
  el.addEventListener('pointerdown', (e) => {
    if (hedefDugme(e)) return;
    basili = true;
    if (bolum === 'dogumgunu') dokunma?.bas();
  });
  const birak = () => {
    if (!basili) return;
    basili = false;
    if (bolum === 'dogumgunu') dokunma?.birak();
  };
  el.addEventListener('pointerup', birak);
  el.addEventListener('pointercancel', birak);
  // kulak göstergesi
  let raf = requestAnimationFrame(function d() {
    const durumK = kulak.acik ? (kulak.dinliyor ? 'dinliyor' : 'bekliyor') : 'yok';
    kulakEl.dataset.durum = durumK;
    kulakEl.style.setProperty('--s', String(kulak.dinliyor ? 1 + kulak.seviye * 0.9 : 1));
    raf = requestAnimationFrame(d);
  });

  void (async () => {
    if (!kulak.acik && izinVar() && kulak.durum !== 'yok' && !TEST_MODU) {
      ui.ipucu('Bir saniye sessiz olalım…');
      await kulak.ac();
      ui.ipucu(null);
    }
    await (bolum === 'ege' ? egeUyuyor : bolum === 'banyo' ? banyoBolumu : dogumGunu)(sahneKok, ui);
    if (kapandi) return;
    const tekrar = h('button.dugme', { type: 'button', style: '--r:var(--sari)' }, svg(IKON.tekrar), 'Bir daha');
    const cik = h('button.dugme', { type: 'button', style: '--r:var(--yesil)' }, svg(IKON.ev), 'Ana sayfa');
    tekrar.addEventListener('click', () => app.git('bolum'));
    cik.addEventListener('click', () => app.git('acilis'));
    dugmeYeri.replaceChildren(h('div.mc-son', {}, tekrar, cik));
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      dugmeCoz?.();
      cancelAnimationFrame(raf);
      kulak.dinle(null);
    },
  };
}
