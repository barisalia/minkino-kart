/**
 * Çiftlik Korosu: kelimeyi değil sesin ŞEKLİNİ tanır.
 * "Hav hav" = iki-üç kısa ses · "Mööö" = bir uzun ses · "Miyav" = yükselip alçalan ses.
 * 3-4 yaş: tek hayvan · 5 yaş: iki hayvan sırayla · 6 yaş: üç hayvan, kartlar kapanır (hafıza).
 */
import O from '../../content/orman.json';
import { h } from '../../src/ui/dom';
import type { Yas } from '../../src/engine/types';
import { egri, SesSekli, type SesParcasi } from '../../ses-testi/src/analiz';
import type { GorevFabrika } from './gorev';
import { parilti, resim, zzz } from './gorsel';
import { adim, hayvanCal, hmm } from './sesler';

const C = O.ciftlik;
export type CiftlikHayvani = 'inek' | 'kopek' | 'kedi';
const HAYVANLAR: CiftlikHayvani[] = ['inek', 'kopek', 'kedi'];
const SES: Record<CiftlikHayvani, string> = { inek: 'Mööö', kopek: 'Hav hav', kedi: 'Miyav' };
const YONERGE: Record<CiftlikHayvani, string> = { inek: C.inek, kopek: C.kopek, kedi: C.kedi };

/** Bir ses dizisindeki hayvan seslerini sırayla çıkarır (araya kısa bir boşluk konmasa da ayırır). */
export function dizidenHayvanlar(dizi: SesParcasi[]): CiftlikHayvani[] {
  const sonuc: CiftlikHayvani[] = [];
  let kisalar: SesParcasi[] = [];
  const kisaBitir = () => {
    if (kisalar.length >= 2) sonuc.push('kopek');
    kisalar = [];
  };
  for (const p of dizi) {
    if (p.sure < 0.45) {
      const onceki = kisalar[kisalar.length - 1];
      if (onceki && p.bas - (onceki.bas + onceki.sure) > 0.55) kisaBitir();
      kisalar.push(p);
      if (kisalar.length === 3) kisaBitir();
      continue;
    }
    kisaBitir();
    const e = egri(p.perdeler);
    sonuc.push(e === 'yukselip-alcalan' || e === 'yukselen' ? 'kedi' : 'inek');
  }
  kisaBitir();
  return sonuc;
}

function hayvanKarti(ad: CiftlikHayvani): HTMLElement {
  return h(`div.or-ciftlik-hayvan.uyuyor`, { 'data-hayvan': ad }, resim(`hayvanlar/${ad}`, '', ad), zzz(), h('span.or-balon-yazi', {}, SES[ad]));
}

/** Tek hayvan (3-4 yaş). Önceki turlarda uyananlar koroda uyanık durur. */
function tekHayvan(hedef: CiftlikHayvani): GorevFabrika {
  return (b, bitti) => {
    const s = new SesSekli(b.ayar);
    const kartlar = HAYVANLAR.map((a) => hayvanKarti(a));
    b.sahne.append(h('div.or-koro', {}, ...kartlar));
    kartlar.forEach((k, i) => i < HAYVANLAR.indexOf(hedef) && k.classList.replace('uyuyor', 'uyandi'));
    const kart = kartlar[HAYVANLAR.indexOf(hedef)];
    kart.classList.add('hedef');
    let hata = 0;
    let bitmis = false;
    const kazan = () => {
      if (bitmis) return;
      bitmis = true;
      kart.classList.remove('hedef', 'uyuyor');
      kart.classList.add('uyandi');
      hayvanCal(hedef);
      parilti(b.sahne, (HAYVANLAR.indexOf(hedef) + 0.5) / 3, 0.62);
      setTimeout(bitti, 1500);
    };
    kart.addEventListener('pointerdown', kazan);
    return {
      yonerge: YONERGE[hedef],
      yazi: `${SES[hedef]}!`,
      kare(o) {
        if (bitmis) return;
        const r = s.kare(o);
        kart.classList.toggle('dinliyor', r.sesVar);
        if (!r.dizi) return;
        const bulunan = dizidenHayvanlar(r.dizi);
        // 3 yaş: her ses kabul (sesinin duyulması yeter); 4 yaş: şekil tutmalı, 2 denemeden sonra yardım
        if (b.yas <= 3 || bulunan.includes(hedef) || hata >= 2) kazan();
        else {
          hata++;
          hmm();
          kart.classList.remove('salla');
          void kart.offsetWidth;
          kart.classList.add('salla');
        }
      },
    };
  };
}

/** Sıralı hayvanlar (5-6 yaş). gizli: kartlar önce görünür, sonra kapanır. */
function sirali(dizi: CiftlikHayvani[], gizli: boolean): GorevFabrika {
  return (b, bitti) => {
    const s = new SesSekli(b.ayar);
    const kartlar = dizi.map((a) => h('div.or-sira-kart', { 'data-hayvan': a }, resim(`hayvanlar/${a}`, '', a), h('span.or-kapak', {}, '?')));
    const koro = HAYVANLAR.map((a) => hayvanKarti(a));
    b.sahne.append(h('div.or-sira', {}, ...kartlar), h('div.or-koro', {}, ...koro));
    let i = 0;
    let hata = 0;
    let bitmis = false;
    kartlar[0].classList.add('siradaki');
    const ilerle = () => {
      const a = dizi[i];
      kartlar[i].classList.remove('siradaki', 'kapali');
      kartlar[i].classList.add('tamam');
      const k = koro[HAYVANLAR.indexOf(a)];
      k.classList.remove('uyuyor');
      k.classList.add('uyandi', 'soyluyor');
      setTimeout(() => k.classList.remove('soyluyor'), 900);
      hayvanCal(a, 1300);
      adim(i * 2 + 2);
      i++;
      hata = 0;
      if (i === dizi.length) {
        bitmis = true;
        parilti(b.sahne, 0.5, 0.3);
        setTimeout(bitti, 1500);
      } else kartlar[i].classList.add('siradaki');
    };
    kartlar.forEach((k, n) => k.addEventListener('pointerdown', () => n === i && !bitmis && ilerle()));
    return {
      yonerge: gizli ? C.hatirla : C.sira,
      yazi: dizi.map((a) => SES[a]).join(' · '),
      basla() {
        if (gizli) setTimeout(() => kartlar.forEach((k, n) => n >= i && k.classList.add('kapali')), 2500);
      },
      kare(o) {
        if (bitmis) return;
        const r = s.kare(o);
        if (!r.dizi) return;
        const bulunan = dizidenHayvanlar(r.dizi);
        if (!bulunan.length) return;
        for (const a of bulunan) {
          if (bitmis) break;
          if (a === dizi[i] || hata >= 3) ilerle();
          else {
            hata++;
            hmm();
            break;
          }
        }
      },
    };
  };
}

export function ciftlikGorevleri(yas: Yas): GorevFabrika[] {
  if (yas <= 4) return HAYVANLAR.map(tekHayvan);
  if (yas === 5) return [sirali(['inek', 'kopek'], false), sirali(['kedi', 'inek'], false), sirali(['kopek', 'kedi'], false)];
  return [sirali(['inek', 'kopek'], false), sirali(['inek', 'kopek', 'kedi'], true), sirali(['kedi', 'kopek', 'kopek'], true)];
}
