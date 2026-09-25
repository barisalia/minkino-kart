/**
 * Uyuyan Dev: sessizlik ve kendini tutma.
 * 3 yaş fısıltıyla tavşan çıkar, bağırınca saklanır · 4 yaş dev uyurken sessizce geç ·
 * 5 yaş ses heykeli (davul çalınca ses, durunca sus) · 6 yaş kural tersine (yeşilde sus, kırmızıda konuş).
 */
import O from '../../content/orman.json';
import { h } from '../../src/ui/dom';
import type { Yas } from '../../src/engine/types';
import type { Ozellik } from '../../ses-testi/src/analiz';
import type { Baglam, GorevFabrika } from './gorev';
import { parilti, resim, zzz } from './gorsel';
import { adim, davul, hmm, nota } from './sesler';

const V = O.dev;

/** Bölgenin ev sahibi zaten uyuyan dev: görev onu kullanır (yoksa kendi devini çizer) */
function devEl(b: Baglam): HTMLElement {
  const ev = b.sahne.parentElement?.querySelector<HTMLElement>('.or-ev');
  if (ev) return ev;
  const d = h('div.or-dev', {}, resim('orman-karakter/dev', '', 'Uyuyan dev'), zzz());
  b.sahne.append(d);
  return d;
}

/** Sesin yüksekliği tabana göre (dB) */
const ust = (o: Ozellik, b: Baglam) => o.db - b.ayar.taban + b.ayar.duyarlilik;

/** 3 yaş: yumuşak sesle (fısıltı, alçak ses) tavşan yuvadan çıkar; yüksek seste saklanır */
function tavsan(sure: number): GorevFabrika {
  return (b, bitti) => {
    const tv = h('div.or-tavsan', {}, resim('hayvanlar/tavsan', '', 'Tavşan'));
    const yuva = h('div.or-yuva', {}, tv, h('i.or-yuva-on'));
    const halka = h('div.or-sure-halka');
    devEl(b);
    b.sahne.append(yuva, halka);
    let cikma = 0;
    let disarida = 0;
    let yumusak = false;
    let yuksek = false;
    let dokunma = false;
    let sonUyari = 0;
    let bitmis = false;
    return {
      yonerge: V.tavsan,
      kare(o) {
        if (dokunma) return;
        const u = ust(o, b);
        yumusak = u > 6 && u < 26;
        yuksek = u >= 30;
      },
      bas() {
        dokunma = yumusak = true;
        yuksek = false;
      },
      birak() {
        dokunma = yumusak = false;
      },
      tik(dt) {
        if (bitmis) return;
        if (yuksek) {
          if (cikma > 0.3 && performance.now() - sonUyari > 5000) {
            sonUyari = performance.now();
            void b.soyle(V.saklandi);
          }
          cikma = Math.max(0, cikma - dt * 4);
        } else if (yumusak) cikma = Math.min(1, cikma + dt * 1.6);
        else cikma = Math.max(0, cikma - dt * 0.25);
        if (cikma > 0.8) disarida += dt;
        tv.style.setProperty('--c', String(cikma));
        halka.style.setProperty('--p', String(Math.min(1, disarida / sure)));
        if (disarida >= sure) {
          bitmis = true;
          tv.classList.add('mutlu');
          parilti(b.sahne, 0.3, 0.6);
          setTimeout(bitti, 1100);
        }
      },
    };
  };
}

/** 4 yaş: dev uyurken sessizce geç. Ses olunca durulur ve dev kıpırdar. */
function gec(sure: number): GorevFabrika {
  return (b, bitti) => {
    const dev = devEl(b);
    const yolcu = h('div.or-yolcu', {}, resim('hayvanlar/tavsan', '', 'Tavşan'));
    b.sahne.append(h('div.or-patika'), yolcu);
    let x = 0;
    let gurultu = 0;
    let sessiz = false;
    let dokunma = false;
    let sonUyari = 0;
    let bitmis = false;
    return {
      yonerge: V.gec,
      kare(o) {
        if (dokunma) return;
        const u = ust(o, b);
        if (u > 12) gurultu += b.ayar.kare;
        else gurultu = Math.max(0, gurultu - b.ayar.kare * 2);
        sessiz = u < 9;
        if (gurultu > 0.15) {
          sessiz = false;
          dev.classList.remove('kipir');
          void dev.offsetWidth;
          dev.classList.add('kipir');
          gurultu = 0;
          if (performance.now() - sonUyari > 5000 && x > 0.05) {
            sonUyari = performance.now();
            hmm();
            void b.soyle(V.kipirdadi);
          }
        }
      },
      bas() {
        dokunma = sessiz = true;
      },
      birak() {
        dokunma = sessiz = false;
      },
      tik(dt) {
        if (bitmis) return;
        if (sessiz) x = Math.min(1, x + dt / sure);
        yolcu.classList.toggle('yuruyor', sessiz);
        yolcu.style.setProperty('--x', String(x));
        if (x >= 1) {
          bitmis = true;
          parilti(b.sahne, 0.88, 0.72);
          adim(8);
          setTimeout(bitti, 1000);
        }
      },
    };
  };
}

/**
 * Ses heykeli (5 yaş: davul çalarken ses çıkar, durunca sus) ve yaprak (6 yaş: kırmızıda konuş, yeşilde sus).
 * 4 evre; en az 3'ü doğruysa geçilir.
 */
function heykel(yaprak: boolean): GorevFabrika {
  return (b, bitti) => {
    const isaret = yaprak ? h('div.or-yaprak') : h('div.or-davul.kucuk', {}, h('div.or-davul-govde'));
    const sonuclar = h('div.or-evreler', {}, ...Array.from({ length: 4 }, () => h('i')));
    const dev = devEl(b);
    b.sahne.append(isaret, sonuclar);
    type Evre = 'ses' | 'sus';
    const evreler: Evre[] = ['ses', 'sus', 'ses', 'sus'];
    let i = -1;
    let evreBas = 0;
    let sesSure = 0;
    let gurultu = 0;
    let bozuldu = false;
    let dogru = 0;
    let bitmis = false;
    let vurus = -1;
    let evreUzunlugu = 2.5;
    const baslaEvre = () => {
      i++;
      evreBas = performance.now();
      sesSure = 0;
      gurultu = 0;
      bozuldu = false;
      vurus = -1;
      evreUzunlugu = 2.2 + Math.random() * 1.2;
      const e = evreler[i];
      isaret.dataset.evre = e;
      if (yaprak) nota(e === 'ses' ? 67 : 72, 0.3, 0.12);
    };
    const bitirEvre = () => {
      const e = evreler[i];
      const iyi = e === 'ses' ? sesSure >= 0.25 : !bozuldu;
      if (iyi) dogru++;
      sonuclar.children[i]?.classList.add(iyi ? 'iyi' : 'kotu');
      if (iyi) adim(i * 2 + 2);
      if (i === evreler.length - 1) {
        delete isaret.dataset.evre;
        if (dogru >= 3) {
          bitmis = true;
          parilti(b.sahne, 0.5, 0.35);
          setTimeout(bitti, 900);
        } else {
          hmm();
          setTimeout(() => {
            i = -1;
            dogru = 0;
            [...sonuclar.children].forEach((c) => c.classList.remove('iyi', 'kotu'));
            baslaEvre();
          }, 1500);
        }
        return;
      }
      baslaEvre();
    };
    const sesGeldi = (sure: number) => {
      const e = evreler[i];
      const gecen = (performance.now() - evreBas) / 1000;
      if (e === 'ses' && gecen > 0.3) sesSure += sure;
      if (e === 'sus' && gecen > 0.8) {
        gurultu += sure;
        if (gurultu > 0.15 && !bozuldu) {
          bozuldu = true;
          dev.classList.remove('kipir');
          void dev.offsetWidth;
          dev.classList.add('kipir');
        }
      }
    };
    return {
      yonerge: yaprak ? V.yaprak : V.heykel,
      basla: () => baslaEvre(),
      kare(o) {
        if (i < 0 || i >= evreler.length || !isaret.dataset.evre) return;
        if (ust(o, b) > 12) sesGeldi(b.ayar.kare);
        else gurultu = Math.max(0, gurultu - b.ayar.kare);
      },
      bas() {
        if (i >= 0 && isaret.dataset.evre) sesGeldi(0.3);
      },
      tik() {
        if (bitmis || i < 0 || !isaret.dataset.evre) return;
        const gecen = (performance.now() - evreBas) / 1000;
        if (!yaprak && evreler[i] === 'ses' && Math.floor(gecen * 2) > vurus) {
          vurus = Math.floor(gecen * 2);
          davul(vurus % 2 === 0, 0.4);
          isaret.classList.remove('vur');
          void isaret.offsetWidth;
          isaret.classList.add('vur');
        }
        if (gecen >= evreUzunlugu) bitirEvre();
      },
    };
  };
}

export function devGorevleri(yas: Yas): GorevFabrika[] {
  if (yas <= 3) return [tavsan(2), tavsan(2.5), tavsan(3)];
  if (yas === 4) return [gec(4), gec(5), gec(6)];
  if (yas === 5) return [gec(5), heykel(false), heykel(false)];
  return [heykel(false), heykel(true), heykel(true)];
}
