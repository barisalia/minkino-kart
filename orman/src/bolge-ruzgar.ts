/** Rüzgar Tepesi: üfleme. 3 yaş söndür/dağıt/şişir · 4 yaş yavaş üfle · 5 yaş süre · 6 yaş kısa-uzun planı */
import O from '../../content/orman.json';
import { h } from '../../src/ui/dom';
import type { Yas } from '../../src/engine/types';
import { Ufleme, type GorevFabrika } from './gorev';
import { parilti, resim } from './gorsel';
import { adim, hmm } from './sesler';

const R = O.ruzgar;

/** Gölet (tekne görevleri): parlak su, üstünde hafif dalgacıklar */
const golet = () => h('div.or-golet', {}, resim('orman-esya/golet', '', 'Gölet'), h('i.or-halka'), h('i.or-halka.iki'));

/** Kıvrılan dalga (yelkenli görevindeki kısa/uzun işaretleri) */
const DALGA =
  '<svg viewBox="0 0 120 70" aria-hidden="true"><defs><linearGradient id="or-dalga-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff0ff"/><stop offset="1" stop-color="#3e9df2"/></linearGradient></defs>' +
  '<path d="M6 64 C14 34 34 10 62 8 C86 6 104 20 106 38 C94 26 76 26 70 38 C66 46 72 54 82 52 C70 62 48 66 6 64 Z" fill="url(#or-dalga-r)" stroke="#5a3617" stroke-width="5" stroke-linejoin="round"/>' +
  '<path d="M30 40 C40 24 56 18 70 18" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/></svg>';

/** Mum: yarım saniye üflenince söner */
const mum: GorevFabrika = (b, bitti) => {
  const u = new Ufleme(b.ayar);
  const alev = h('div.or-alev', {}, resim('orman-esya/alev'));
  const el = h('div.or-mum', {}, alev, resim('orman-esya/mum', 'or-mum-resim', 'Mum'), h('i.or-duman'), h('i.or-duman.iki'));
  b.sahne.append(el);
  let sondu = false;
  return {
    yonerge: R.mum,
    kare: (o) => u.kare(o),
    bas: () => u.bas(),
    birak: () => u.birak(),
    tik(dt) {
      u.tik(dt);
      alev.style.setProperty('--g', String(u.guc));
      if (!sondu && u.aktif && u.sure > 0.35) {
        sondu = true;
        el.classList.add('sondu');
        parilti(b.sahne, 0.5, 0.35);
        setTimeout(bitti, 900);
      }
    },
  };
};

/** Karahindiba: üfledikçe tohumlar uçar */
const karahindiba: GorevFabrika = (b, bitti) => {
  const u = new Ufleme(b.ayar);
  const N = 16;
  const puf = resim('orman-esya/karahindiba', 'or-kh-puf', 'Karahindiba');
  const el = h('div.or-karahindiba', {}, resim('orman-esya/karahindiba-sap', 'or-kh-sap'), puf);
  b.sahne.append(el);
  let biriken = 0;
  let ucan = 0;
  /** bir tohum kopar, rüzgarla savrulup süzülür */
  const tohumUcur = () => {
    const t = resim('orman-esya/tohum', 'or-tohum');
    const aci = -20 - Math.random() * 50;
    t.style.setProperty('--ux', `${140 + Math.random() * 220}px`);
    t.style.setProperty('--uy', `${-60 - Math.random() * 220}px`);
    t.style.setProperty('--d', `${aci}deg`);
    t.style.setProperty('--x0', `${-30 + Math.random() * 60}px`);
    t.style.setProperty('--y0', `${-20 + Math.random() * 40}px`);
    el.append(t);
    setTimeout(() => t.remove(), 2600);
  };
  return {
    yonerge: R.karahindiba,
    kare: (o) => u.kare(o),
    bas: () => u.bas(),
    birak: () => u.birak(),
    tik(dt) {
      u.tik(dt);
      if (!u.aktif || ucan >= N) return;
      biriken += dt * (0.6 + u.guc);
      const hedef = Math.min(N, Math.floor(biriken / 0.09));
      while (ucan < hedef) {
        tohumUcur();
        ucan++;
        puf.style.opacity = String(Math.max(0, 1 - ucan / N));
        if (ucan === N) setTimeout(bitti, 1400);
      }
    },
  };
};

/** Balon: toplam üfleme süresiyle şişer, dolunca uçar */
const balon: GorevFabrika = (b, bitti) => {
  const u = new Ufleme(b.ayar);
  const HEDEF = b.yas <= 3 ? 2.2 : 3;
  const ton = [0, 150, 60][b.tur % 3];
  const govde = h('div.or-balon-govde', { style: `--ton:${ton}deg` }, resim('orman-esya/balon', '', 'Balon'));
  const el = h('div.or-balon', {}, govde);
  b.sahne.append(el);
  let dolu = 0;
  let bitmis = false;
  return {
    yonerge: R.balon,
    kare: (o) => u.kare(o),
    bas: () => u.bas(),
    birak: () => u.birak(),
    tik(dt) {
      u.tik(dt);
      if (bitmis) return;
      if (u.aktif) dolu = Math.min(HEDEF, dolu + dt);
      el.style.setProperty('--s', String(0.35 + (dolu / HEDEF) * 0.65));
      govde.classList.toggle('sisiyor', u.aktif);
      if (dolu >= HEDEF) {
        bitmis = true;
        el.classList.add('uctu');
        parilti(b.sahne, 0.5, 0.4);
        setTimeout(bitti, 1100);
      }
    },
  };
};

/** Tekne: yavaş üfleyince ilerler; iskeleye yakınken sert üflenirse çarpıp geri kayar */
const tekne: GorevFabrika = (b, bitti) => {
  const u = new Ufleme(b.ayar, 0.45);
  const uzak = b.tur > 1;
  const gemi = h('div.or-tekne', {}, resim('orman-esya/yelkenli', '', 'Yelkenli'));
  const iskele = h('div.or-iskele', {}, resim('orman-esya/iskele', '', 'İskele'));
  b.sahne.append(golet(), iskele, gemi);
  let x = uzak ? 0.06 : 0.16;
  let sert = 0;
  let sonUyari = 0;
  let bitmis = false;
  return {
    yonerge: R.tekne,
    kare: (o) => u.kare(o),
    bas: () => u.bas(),
    birak: () => u.birak(),
    tik(dt) {
      u.tik(dt);
      if (bitmis) return;
      if (u.aktif) x += dt * (0.05 + u.guc * 0.22);
      sert = u.aktif && u.guc > 0.8 ? sert + dt : 0;
      if (x > 0.55 && sert > 0.25) {
        // çarptı: geri kay
        x = Math.max(0.3, x - 0.16);
        sert = 0;
        gemi.classList.remove('carpti');
        void gemi.offsetWidth;
        gemi.classList.add('carpti');
        hmm();
        if (performance.now() - sonUyari > 5000) {
          sonUyari = performance.now();
          void b.soyle(R.yavas);
        }
      }
      gemi.style.setProperty('--x', String(Math.min(x, 0.74)));
      gemi.style.setProperty('--egim', `${u.aktif ? -4 - u.guc * 8 : 0}deg`);
      if (x >= 0.74) {
        bitmis = true;
        gemi.classList.add('vardi');
        parilti(b.sahne, 0.78, 0.62);
        setTimeout(bitti, 900);
      }
    },
  };
};

/** Rüzgar gülü: tam N saniye üfle (bırakınca değerlendirilir) */
function gul(saniye: number): GorevFabrika {
  return (b, bitti) => {
    const u = new Ufleme(b.ayar, 0.6);
    const kanat = h('div.or-gul-kanat', {}, resim('orman-esya/ruzgar-gulu', '', 'Rüzgar gülü'));
    const noktalar = Array.from({ length: saniye }, () => h('i'));
    const sayac = h('div.or-gul-sayac', {}, ...noktalar);
    b.sahne.append(h('div.or-gul', {}, kanat, h('div.or-gul-sap')), sayac);
    let aci = 0;
    let bitmis = false;
    let yakilan = 0;
    u.onBasla = () => {
      noktalar.forEach((n) => n.classList.remove('yandi', 'fazla'));
      yakilan = 0;
    };
    u.onBitti = (s) => {
      if (bitmis) return;
      if (s >= saniye - 0.45 && s <= saniye + 1.1) {
        bitmis = true;
        parilti(b.sahne, 0.5, 0.35);
        setTimeout(bitti, 700);
      } else if (s >= 0.4) {
        hmm();
        void b.soyle(s < saniye ? R.uzun : R.kisa);
      }
    };
    return {
      yonerge: saniye === 2 ? R.gul_2 : R.gul_3,
      kare: (o) => u.kare(o),
      bas: () => u.bas(),
      birak: () => u.birak(),
      tik(dt) {
        u.tik(dt);
        aci += dt * (u.aktif ? 300 + u.guc * 700 : 20);
        kanat.style.transform = `rotate(${aci}deg)`;
        if (!u.aktif) return;
        const tam = Math.floor(u.sure);
        while (yakilan < Math.min(saniye, tam)) {
          noktalar[yakilan].classList.add('yandi');
          adim(yakilan * 2);
          yakilan++;
        }
        if (u.sure > saniye + 1.1) noktalar.forEach((n) => n.classList.add('fazla'));
      },
    };
  };
}

/** Yelkenli: küçük dalga = kısa üfle, büyük dalga = uzun üfle */
function yelken(plan: ('k' | 'u')[]): GorevFabrika {
  return (b, bitti) => {
    const u = new Ufleme(b.ayar, 0.6);
    const gemi = h('div.or-tekne.yelkenli', {}, resim('orman-esya/yelkenli', '', 'Yelkenli'));
    const dalgalar = plan.map((p, i) => {
      const d = h(`div.or-engel.${p === 'k' ? 'kisa' : 'uzun'}`, { style: `--x:${0.2 + (i + 1) * (0.7 / (plan.length + 1))}` });
      d.innerHTML = DALGA;
      return d;
    });
    const cubuk = h('div.or-sure-cubuk', {}, h('i'));
    b.sahne.append(golet(), ...dalgalar, gemi, cubuk);
    let sira = 0;
    const konum = () => (sira === 0 ? 0.08 : 0.2 + sira * (0.7 / (plan.length + 1)) + 0.03);
    gemi.style.setProperty('--x', String(konum()));
    dalgalar[0].classList.add('siradaki');
    u.onBitti = (s) => {
      if (sira >= plan.length || s < 0.12) return;
      const tur = s < 1.0 ? 'k' : s >= 1.25 ? 'u' : null;
      if (tur === plan[sira]) {
        dalgalar[sira].classList.remove('siradaki');
        dalgalar[sira].classList.add('gecti');
        adim(sira * 2);
        sira++;
        gemi.style.setProperty('--x', String(konum()));
        if (sira === plan.length) {
          parilti(b.sahne, 0.85, 0.6);
          setTimeout(bitti, 900);
        } else dalgalar[sira].classList.add('siradaki');
      } else {
        hmm();
        gemi.classList.remove('carpti');
        void gemi.offsetWidth;
        gemi.classList.add('carpti');
      }
    };
    return {
      yonerge: R.yelken,
      kare: (o) => u.kare(o),
      bas: () => u.bas(),
      birak: () => u.birak(),
      tik(dt) {
        u.tik(dt);
        cubuk.style.setProperty('--p', String(u.aktif ? Math.min(1, u.sure / 1.8) : 0));
        cubuk.classList.toggle('uzun', u.aktif && u.sure >= 1.25);
        gemi.style.setProperty('--egim', `${u.aktif ? -6 : 0}deg`);
      },
    };
  };
}

export function ruzgarGorevleri(yas: Yas): GorevFabrika[] {
  if (yas <= 3) return [mum, karahindiba, balon];
  if (yas === 4) return [balon, tekne, tekne];
  if (yas === 5) return [mum, gul(2), gul(3)];
  return [gul(3), yelken(['k', 'u', 'k']), yelken(['u', 'k', 'k', 'u'])];
}
