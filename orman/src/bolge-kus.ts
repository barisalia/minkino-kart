/** Kuş Ağacı: ince ve kalın ses. 3 yaş ses çıkar kuş uçsun · 4 yaş ince/kalın · 5 yaş yıldız yolu · 6 yaş melodi */
import O from '../../content/orman.json';
import { h } from '../../src/ui/dom';
import type { Yas } from '../../src/engine/types';
import { PerdeIzci, SesSekli, yarimTon, type Ozellik } from '../../ses-testi/src/analiz';
import { Perde, sesVar, type Gorev, type GorevFabrika } from './gorev';
import { parilti, resim } from './gorsel';
import { adim, hayvanCal, hmm, nota } from './sesler';

const K = O.kus;

function kusEl(): HTMLElement {
  return h('div.or-kus', {}, resim('hayvanlar/kus', '', 'Kuş'));
}

/** Önce çocuğun normal sesini dinler (perde referansı), sonra asıl görevi başlatır. */
function referansli(ic: GorevFabrika): GorevFabrika {
  return (b, bitti) => {
    if (b.referans) return ic(b, bitti);
    const p = new PerdeIzci(b.ayar);
    const halka = h('div.or-ref', {}, h('b', {}, 'aaa'));
    b.sahne.append(halka);
    let sesli = 0;
    let asil: Gorev | null = null;
    const gec = (ref: number | null) => {
      b.referans = ref ?? 260;
      halka.remove();
      asil = ic(b, bitti);
      b.yaz(asil.yazi ?? asil.yonerge);
      void b.soyle(asil.yonerge).then(() => asil?.basla?.());
    };
    return {
      yonerge: K.referans,
      kare(o) {
        if (asil) return asil.kare?.(o);
        p.referansEkle(o);
        if (o.perde !== null && sesVar(o, b.ayar, 10)) {
          sesli += b.ayar.kare;
          halka.style.setProperty('--p', String(Math.min(1, sesli / 1.2)));
          if (sesli >= 1.2) gec(p.referansBitir());
        }
      },
      tik: (dt) => asil?.tik?.(dt),
      bas: (n) => (asil ? asil.bas?.(n) : gec(null)),
      kaydir: (n) => asil?.kaydir?.(n),
      birak: (n) => asil?.birak?.(n),
      kapat: () => asil?.kapat?.(),
    };
  };
}

/** 3 yaş: ses çıkardıkça kuş yükselir, susunca yavaşça iner */
const uc: GorevFabrika = (b, bitti) => {
  const hedefY = [0.3, 0.2, 0.25][b.tur % 3];
  const kus = kusEl();
  const hedef = h('div.or-hedef-yildiz', { style: `--y:${hedefY}` });
  b.sahne.append(hedef, kus);
  let y = 0.8;
  let ses = false;
  let dokunma = false;
  let bitmis = false;
  return {
    yonerge: K.uc,
    kare(o) {
      if (!dokunma) ses = sesVar(o, b.ayar);
    },
    bas() {
      dokunma = ses = true;
    },
    birak() {
      dokunma = ses = false;
    },
    tik(dt) {
      if (bitmis) return;
      y = ses ? y - dt * 0.2 : Math.min(0.8, y + dt * 0.05);
      kus.classList.toggle('ucuyor', ses);
      kus.style.setProperty('--x', '0.5');
      kus.style.setProperty('--y', String(y));
      if (y <= hedefY + 0.03) {
        bitmis = true;
        hedef.classList.add('alindi');
        hayvanCal('kus');
        parilti(b.sahne, 0.5, hedefY);
        setTimeout(bitti, 1200);
      }
    },
  };
};

/** Canlı perde göstergesi (yukarı ince, aşağı kalın) */
function gosterge(): { el: HTMLElement; ayarla(fark: number | null): void } {
  const imlec = h('i.or-perde-imlec');
  const el = h('div.or-perde', {}, h('span.ust', {}, 'ince'), imlec, h('span.alt', {}, 'kalın'));
  return {
    el,
    ayarla(fark) {
      imlec.classList.toggle('bos', fark === null);
      if (fark !== null) imlec.style.setProperty('--y', String(0.5 - Math.max(-10, Math.min(10, fark)) / 22));
    },
  };
}

/** 4 yaş: ince sesle kuş uçar, kalın sesle ayı uyanır */
function inceKalin(sira: ('ince' | 'kalin')[]): GorevFabrika {
  return (b, bitti) => {
    const p = new Perde(b.ayar, b.referans);
    const kus = kusEl();
    const ayi = h('div.or-ayi.uyuyor', {}, resim('hayvanlar/ayi', '', 'Ayı'));
    const g = gosterge();
    b.sahne.append(kus, ayi, g.el);
    kus.style.setProperty('--x', '0.3');
    kus.style.setProperty('--y', '0.3');
    let i = 0;
    let biriken = 0;
    const hedef = () => sira[i];
    const yonerge = (s: 'ince' | 'kalin') => (s === 'ince' ? K.ince : K.kalin);
    const vurgula = () => {
      kus.classList.toggle('hedef', hedef() === 'ince');
      ayi.classList.toggle('hedef', hedef() === 'kalin');
    };
    vurgula();
    return {
      yonerge: yonerge(sira[0]),
      kare: (o) => p.kare(o),
      bas: (n) => p.bas(n),
      kaydir: (n) => p.kaydir(n),
      birak: () => p.birak(),
      tik(dt) {
        g.ayarla(p.fark);
        if (i >= sira.length) return;
        const s = p.sinif;
        kus.classList.toggle('ucuyor', s === 'ince');
        ayi.classList.toggle('homur', s === 'kalin');
        if (s === hedef()) biriken += dt;
        else if (s === null) biriken = Math.max(0, biriken - dt * 0.3);
        if (biriken >= 0.7) {
          biriken = 0;
          if (hedef() === 'ince') {
            kus.classList.add('mutlu');
            hayvanCal('kus');
          } else {
            ayi.classList.remove('uyuyor');
            ayi.classList.add('uyandi');
            hayvanCal('ayi');
          }
          parilti(b.sahne, hedef() === 'ince' ? 0.3 : 0.7, hedef() === 'ince' ? 0.3 : 0.7);
          i++;
          if (i >= sira.length) setTimeout(bitti, 1300);
          else {
            vurgula();
            setTimeout(() => {
              b.yaz(yonerge(hedef()));
              void b.soyle(yonerge(hedef()));
            }, 1400);
          }
        }
      },
    };
  };
}

/** 5 yaş: kuşu sesiyle uçurur (ince yukarı, kalın aşağı), yıldızları toplar */
function yildizYolu(): GorevFabrika {
  return (b, bitti) => {
    const p = new Perde(b.ayar, b.referans);
    const kus = kusEl();
    const DIZILER = [[0.3, 0.68, 0.45], [0.7, 0.28, 0.55], [0.45, 0.25, 0.72]];
    const yler = DIZILER[b.tur % 3];
    const yildizlar = yler.map((y, i) => {
      const s = h('div.or-yildiz', { style: `--x:${0.3 + i * 0.25};--y:${y}` });
      b.sahne.append(s);
      return { el: s, x: 0.3 + i * 0.25, y, alindi: false };
    });
    const g = gosterge();
    b.sahne.append(kus, g.el);
    let x = 0.08;
    let y = 0.5;
    let toplanan = 0;
    return {
      yonerge: K.yildiz,
      kare: (o) => p.kare(o),
      bas: (n) => p.bas(n),
      kaydir: (n) => p.kaydir(n),
      birak: () => p.birak(),
      tik(dt) {
        g.ayarla(p.fark);
        const ses = p.fark !== null;
        if (ses) {
          x += dt * 0.11;
          const hedefY = Math.max(0.15, Math.min(0.85, 0.5 - p.fark! / 20));
          y += (hedefY - y) * Math.min(1, dt * 5);
          if (x > 0.95) x = 0.06;
        }
        kus.classList.toggle('ucuyor', ses);
        kus.style.setProperty('--x', String(x));
        kus.style.setProperty('--y', String(y));
        for (const s of yildizlar) {
          if (!s.alindi && Math.abs(s.x - x) < 0.07 && Math.abs(s.y - y) < 0.12) {
            s.alindi = true;
            s.el.classList.add('alindi');
            adim(toplanan * 2 + 2);
            parilti(b.sahne, s.x, s.y, 6);
            toplanan++;
            if (toplanan === yildizlar.length) {
              hayvanCal('kus');
              setTimeout(bitti, 1100);
            }
          }
        }
      },
    };
  };
}

/** 6 yaş: iki-üç notalık melodiyi dinler, aynısını söyler (yükseklik değil, iniş-çıkış kalıbı) */
function melodi(kalip: ('i' | 'k')[]): GorevFabrika {
  return (b, bitti) => {
    const s = new SesSekli(b.ayar);
    const IN = 72;
    const KA = 65;
    const ince = h('button.or-can.ince', { type: 'button', 'aria-label': 'İnce nota' });
    const kalin = h('button.or-can.kalin', { type: 'button', 'aria-label': 'Kalın nota' });
    const sonuc = h('div.or-melodi-sonuc');
    const dinle = h('button.or-dinle', { type: 'button', 'aria-label': 'Tekrar dinle' }, '♪');
    b.sahne.append(h('div.or-canlar', {}, ince, kalin), sonuc, dinle, kusEl());
    let caliyor = false;
    let bitmis = false;
    let dokunulan: ('i' | 'k')[] = [];
    const cal = async () => {
      caliyor = true;
      dokunulan = [];
      sonuc.replaceChildren();
      for (const n of kalip) {
        const c = n === 'i' ? ince : kalin;
        c.classList.add('caliyor');
        nota(n === 'i' ? IN : KA, 0.7);
        await new Promise((r) => setTimeout(r, 650));
        c.classList.remove('caliyor');
      }
      caliyor = false;
    };
    const kontrol = (cocuk: ('i' | 'k')[] | null) => {
      if (bitmis) return;
      if (cocuk && cocuk.length === kalip.length && cocuk.every((c, i) => c === kalip[i])) {
        bitmis = true;
        adim(6);
        parilti(b.sahne, 0.5, 0.4);
        hayvanCal('kus');
        setTimeout(bitti, 1300);
      } else {
        hmm();
        setTimeout(() => void cal(), 900);
      }
    };
    const tikla = (n: 'i' | 'k') => {
      if (caliyor || bitmis) return;
      nota(n === 'i' ? IN : KA, 0.5);
      dokunulan.push(n);
      sonuc.append(h(`i.${n === 'i' ? 'ince' : 'kalin'}`));
      if (dokunulan.length === kalip.length) {
        const d = dokunulan;
        dokunulan = [];
        kontrol(d);
      }
    };
    ince.addEventListener('pointerdown', () => tikla('i'));
    kalin.addEventListener('pointerdown', () => tikla('k'));
    dinle.addEventListener('click', () => !caliyor && void cal());
    return {
      yonerge: K.melodi,
      basla: () => void cal(),
      kare(o: Ozellik) {
        if (caliyor || bitmis) return;
        const r = s.kare(o);
        if (!r.dizi) return;
        const perdeler = r.dizi.map((p) => {
          const q = [...p.perdeler].sort((a, c) => a - c);
          return q.length >= 3 ? q[Math.floor(q.length / 2)] : null;
        });
        if (perdeler.some((p) => p === null)) return kontrol(null);
        // ilk nota referans; sonrakiler bir öncekine göre yukarı/aşağı/aynı
        const cocuk: ('i' | 'k')[] = [kalip[0]];
        for (let i = 1; i < perdeler.length; i++) {
          const d = yarimTon(perdeler[i]!, perdeler[i - 1]!);
          const onceki = cocuk[i - 1];
          cocuk.push(d > 1.5 ? 'i' : d < -1.5 ? 'k' : onceki);
        }
        sonuc.replaceChildren(...cocuk.map((c) => h(`i.${c === 'i' ? 'ince' : 'kalin'}`)));
        kontrol(cocuk);
      },
    };
  };
}

export function kusGorevleri(yas: Yas): GorevFabrika[] {
  if (yas <= 3) return [uc, uc, uc];
  if (yas === 4) return [referansli(inceKalin(['ince'])), inceKalin(['kalin']), inceKalin(['ince', 'kalin'])];
  if (yas === 5) return [referansli(inceKalin(['ince', 'kalin'])), yildizYolu(), yildizYolu()];
  return [referansli(yildizYolu()), melodi(['k', 'i']), melodi(['k', 'i', 'k'])];
}

