/** Ek modlar: Nefes Balonu (sakinleşme), Papağan (sesini ince sesle tekrar eder), Birlikte (büyük-çocuk ritim) */
import O from '../../content/orman.json';
import { efekt, konus } from '../../src/audio/ses';
import { baglam, efektCikisi } from '../../src/audio/motor';
import { bekle, h, sure } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { ritimAyniMi } from '../../ses-testi/src/analiz';
import { Alkis, sesVar, Ufleme } from './gorev';
import { adres, parilti, resim } from './gorsel';
import { kulak } from './kulak';
import { adim, basari, davul, hmm } from './sesler';

function iskelet(app: Uygulama, sinif: string, baslik: string, arka: string, ...icerik: HTMLElement[]): { el: HTMLElement; yazi: HTMLElement } {
  const yazi = h('span', {}, baslik);
  const el = h(
    `div.or-ekstra.${sinif}`,
    { style: `--resim:url("${adres(arka)}")` },
    h('div.or-arka'),
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Haritaya dön', () => app.git('harita')), h('div.orta', {}, h('div.baslik-balon', {}, yazi)), h('div', { style: 'width:72px' })),
    ...icerik,
  );
  return { el, yazi };
}

function dongu(fn: (dt: number) => void): () => void {
  let onceki = performance.now();
  let id = requestAnimationFrame(function d(t) {
    fn(Math.min(0.1, (t - onceki) / 1000));
    onceki = t;
    id = requestAnimationFrame(d);
  });
  return () => cancelAnimationFrame(id);
}

// ---------------------------------------------------------------- Nefes Balonu
/** 5 yavaş nefes: çiçeği kokla (nefes al), mumu üfle (nefes ver). Her nefeste balon biraz yükselir. */
export function nefesEkrani(app: Uygulama): Ekran {
  const u = new Ufleme(kulak.ayar, 0.5);
  const balon = h('div.or-nefes-balon', {}, h('div.or-balon-govde', { style: '--r:#FF7EB6' }), h('div.or-balon-ip'));
  const cicek = h('div.or-nefes-cicek', {}, h('div.or-cicek-ciz', {}, ...Array.from({ length: 6 }, (_, i) => h('i', { style: `--a:${i * 60}deg` })), h('b')));
  const halka = h('div.or-nefes-halka', {}, h('span', {}));
  const mum = h('div.or-mum.kucuk', {}, h('div.or-alev'), h('div.or-mum-govde'));
  const noktalar = h('div.or-adimlar.bes', {}, ...Array.from({ length: 5 }, () => h('i')));
  const sahne = h('div.or-nefes', {}, balon, halka, h('div.or-nefes-ikili', {}, cicek, mum), noktalar);
  const { el, yazi } = iskelet(app, 'nefes-ekran', 'Nefes Balonu', 'orman/ruzgar', sahne);
  let evre: 'kokla' | 'ufle' | 'bitti' = 'kokla';
  let n = 0;
  let kapandi = false;
  let ufledi = 0;
  const alev = mum.querySelector<HTMLElement>('.or-alev')!;
  const durdur = dongu((dt) => {
    u.tik(dt);
    alev.style.setProperty('--g', String(u.guc));
    if (evre === 'ufle' && u.aktif) ufledi += dt;
  });
  const bekleUfleme = () =>
    new Promise<void>((coz) => {
      ufledi = 0;
      const kontrol = setInterval(() => {
        if (kapandi || ufledi >= 0.8) {
          clearInterval(kontrol);
          coz();
        }
      }, 60);
    });
  sahne.addEventListener('pointerdown', () => evre === 'ufle' && u.bas());
  sahne.addEventListener('pointerup', () => u.birak());
  sahne.addEventListener('pointercancel', () => u.birak());
  void (async () => {
    await konus(O.nefes.giris);
    for (n = 0; n < 5 && !kapandi; n++) {
      evre = 'kokla';
      sahne.dataset.evre = 'kokla';
      yazi.textContent = 'Çiçeği kokla…';
      if (n === 0) await konus(O.nefes.kokla);
      halka.classList.remove('ver');
      halka.classList.add('al');
      await bekle(sure(3000));
      if (kapandi) return;
      evre = 'ufle';
      sahne.dataset.evre = 'ufle';
      yazi.textContent = 'Mumu üfle…';
      if (n === 0) await konus(O.nefes.ufle);
      halka.classList.remove('al');
      halka.classList.add('ver');
      kulak.dinle((o) => u.kare(o));
      await bekleUfleme();
      kulak.dinle(null);
      u.birak();
      if (kapandi) return;
      noktalar.children[n]?.classList.add('dolu');
      balon.style.setProperty('--y', String((n + 1) / 5));
      adim(n * 2);
      await bekle(sure(1200));
    }
    evre = 'bitti';
    delete sahne.dataset.evre;
    balon.classList.add('ucuyor');
    yazi.textContent = 'Çok sakinsin!';
    basari();
    parilti(sahne, 0.5, 0.2, 12);
    await konus(O.nefes.bitti);
  })();
  return {
    el,
    kapat() {
      kapandi = true;
      kulak.dinle(null);
      durdur();
    },
  };
}

// ---------------------------------------------------------------- Papağan
/**
 * Çocuk konuşur, papağan ince sesle tekrar eder. Ses YALNIZCA bellekte tutulur,
 * çalındıktan hemen sonra silinir; hiçbir yere kaydedilmez ya da gönderilmez.
 */
export function papaganEkrani(app: Uygulama): Ekran {
  const papagan = h('div.or-papagan', {}, resim('orman-karakter/papagan', '', 'Papağan'));
  const dalga = h('div.or-papagan-dalga', {}, ...Array.from({ length: 5 }, () => h('i')));
  const sahne = h('div.or-papagan-sahne', {}, dalga, papagan);
  const { el, yazi } = iskelet(app, 'papagan-ekran', 'Papağan', 'orman/kus', sahne);
  const on: Float32Array[] = [];
  let kayit: Float32Array[] | null = null;
  let sessiz = 0;
  let uzunluk = 0;
  let caliyor = false;
  const bitir = () => {
    const parcalar = kayit;
    kayit = null;
    papagan.classList.remove('dinliyor');
    if (!parcalar || uzunluk < 0.3) return;
    const c = baglam();
    const cikis = efektCikisi();
    if (!c || !cikis) return;
    const n = parcalar.reduce((t, p) => t + p.length, 0);
    const tampon = c.createBuffer(1, n, c.sampleRate);
    const d = tampon.getChannelData(0);
    let i = 0;
    let tepe = 0.01;
    for (const p of parcalar) {
      d.set(p, i);
      i += p.length;
    }
    for (let k = 0; k < n; k++) tepe = Math.max(tepe, Math.abs(d[k]));
    const g = c.createGain();
    g.gain.value = Math.min(6, 0.7 / tepe);
    const s = c.createBufferSource();
    s.buffer = tampon;
    s.playbackRate.value = 1.45;
    s.connect(g).connect(cikis);
    caliyor = true;
    papagan.classList.add('konusuyor');
    kulak.sustur((n / c.sampleRate / 1.45) * 1000 + 500);
    s.onended = () => {
      caliyor = false;
      papagan.classList.remove('konusuyor');
      // bellekteki ses silinir
      d.fill(0);
    };
    s.start();
  };
  kulak.hamDinleyici = (g) => {
    if (!kulak.dinliyor || caliyor) return;
    const k = new Float32Array(g);
    if (kayit) kayit.push(k);
    else {
      on.push(k);
      if (on.length > 12) on.shift();
    }
  };
  kulak.dinle((o) => {
    if (caliyor) return;
    const ses = sesVar(o, kulak.ayar, 12);
    dalga.style.setProperty('--s', String(kulak.seviye));
    if (ses && !kayit) {
      kayit = on.splice(0);
      uzunluk = 0;
      papagan.classList.add('dinliyor');
    }
    if (!kayit) return;
    uzunluk += kulak.ayar.kare;
    sessiz = ses ? 0 : sessiz + kulak.ayar.kare;
    if (sessiz > 0.45 || uzunluk > 5) bitir();
  });
  papagan.addEventListener('click', () => {
    if (!kulak.acik) {
      efekt.secim();
      papagan.classList.add('konusuyor');
      setTimeout(() => papagan.classList.remove('konusuyor'), 600);
    }
  });
  void konus(O.papagan.giris).then(() => (yazi.textContent = kulak.acik ? 'Bir şey söyle!' : 'Mikrofon kapalı'));
  return {
    el,
    kapat() {
      kulak.dinle(null);
      kulak.hamDinleyici = null;
      kayit = null;
      on.length = 0;
    },
  };
}

// ---------------------------------------------------------------- Birlikte (büyük ve çocuk ritim)
export function birlikteEkrani(app: Uygulama): Ekran {
  const a = new Alkis(kulak.ayar, 1.6);
  const buyuk = h('div.or-oyuncu', { 'data-kim': 'buyuk' }, h('b', {}, 'Büyük'));
  const cocuk = h('div.or-oyuncu', { 'data-kim': 'cocuk' }, h('b', {}, 'Çocuk'));
  const hedefSira = h('div.or-ritim.hedef');
  const cocukSira = h('div.or-ritim.cocuk');
  const yildizlar = h('div.or-yildizlar');
  const sahne = h('div.or-birlikte', {}, h('div.or-oyuncular', {}, buyuk, cocuk), hedefSira, cocukSira, yildizlar, h('p.or-kucuk', {}, 'Alkışlayın ya da ekrana vurun.'));
  const { el, yazi } = iskelet(app, 'birlikte-ekran', 'Birlikte çal', 'orman/davul', sahne);
  let once: 'buyuk' | 'cocuk' = 'buyuk';
  let adimNo: 0 | 1 = 0;
  let hedef: number[] = [];
  const siraYaz = (kutu: HTMLElement, s: number[]) => {
    const ilk = s[0];
    const son = s[s.length - 1] - ilk || 1;
    kutu.replaceChildren(...s.map((t) => h('i', { style: `--x:${(t - ilk) / son}` })));
  };
  const kimde = () => (adimNo === 0 ? once : once === 'buyuk' ? 'cocuk' : 'buyuk');
  const goster = () => {
    buyuk.classList.toggle('sirada', kimde() === 'buyuk');
    cocuk.classList.toggle('sirada', kimde() === 'cocuk');
    yazi.textContent = kimde() === 'buyuk' ? (adimNo === 0 ? 'Büyük çalsın' : 'Büyük tekrarlasın') : adimNo === 0 ? 'Çocuk çalsın' : 'Çocuk tekrarlasın';
  };
  a.onAlkis = () => {
    davul(kimde() === 'buyuk', 0.3);
    (adimNo === 0 ? hedefSira : cocukSira).append(h('i.canli'));
  };
  a.onSeri = async (s) => {
    if (adimNo === 0) {
      if (s.length < 2) {
        hedefSira.replaceChildren();
        return;
      }
      hedef = s;
      siraYaz(hedefSira, s);
      adimNo = 1;
      goster();
      void konus(once === 'buyuk' ? O.birlikte.sen : O.birlikte.degis);
      return;
    }
    siraYaz(cocukSira, s);
    if (ritimAyniMi(hedef, s)) {
      basari();
      yildizlar.append(h('i'));
      const r = yildizlar.getBoundingClientRect();
      konfetiPatlat(app.kok, r.left + r.width / 2, r.top, 50);
      await bekle(sure(1400));
      once = once === 'buyuk' ? 'cocuk' : 'buyuk';
      adimNo = 0;
      hedefSira.replaceChildren();
      cocukSira.replaceChildren();
      goster();
      void konus(O.birlikte.degis);
    } else {
      hmm();
      await bekle(sure(1200));
      cocukSira.replaceChildren();
    }
  };
  kulak.dinle((o) => a.kare(o));
  sahne.addEventListener('pointerdown', () => a.dokun());
  const durdur = dongu(() => a.tik());
  goster();
  void konus(O.birlikte.buyuk);
  return {
    el,
    kapat() {
      kulak.dinle(null);
      durdur();
    },
  };
}
