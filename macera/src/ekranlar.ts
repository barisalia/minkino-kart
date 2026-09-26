/** Sesli Maceralar ekranları: açılış (bölüm seçimi), büyükler (mikrofon izni), bölüm */
import M from '../../content/macera.json';
import { efekt, konus } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { kulak } from '../../orman/src/kulak';
import { dogumGunu, dokunma, type BolumArayuz } from './dogumgunu';
import { adres, resim } from './gorsel';

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
  const basla = () => {
    efekt.secim();
    if (!durum.i.yas) app.git('yas', { sonra: 'izin' });
    else if (kulak.acik || kulak.durum === 'yok' || TEST_MODU) app.git('bolum');
    else app.git('izin');
  };
  oyna.addEventListener('click', basla);
  kart.addEventListener('click', basla);
  const baslik = h('div.mc-logo', { role: 'img', 'aria-label': M.baslik }, ...M.baslik.split(' ').map((k, i) => h(`span.k${i}`, {}, k)));
  return {
    el: h('div.mc-acilis', { style: `--resim:url("${adres('parti-sahne/oda')}")` }, h('div.mc-acilis-arka'), h('div.ust-cubuk.mc-sag-ust', {}, h('div'), sesDugmesi()), h('div.mc-acilis-ic', {}, baslik, kart, oyna)),
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
  const yazi = h('span.mc-yazi');
  let sonYazi = '';
  const balon = h('div.baslik-balon.mc-altyazi', {}, yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', () => void konus(sonYazi, { ton: 1.12 }), 'kucuk'), yazi);
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
    dokunma?.bas();
  });
  const birak = () => {
    if (!basili) return;
    basili = false;
    dokunma?.birak();
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
    await dogumGunu(sahneKok, ui);
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
