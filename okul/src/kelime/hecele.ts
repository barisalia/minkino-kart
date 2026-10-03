/**
 * Kelime Köprüsü 2 · Alkışla hecele (hece sayma). Resimli kelimenin (karpuz) altında bir dere ve kelimenin hecesi
 * kadar basamak taşı. Mino heceleyerek söyler ("Kar!", "Puz!"), her hecede bir taş parlar. Sonra çocuk davulu çalar:
 * her vuruşta bir taş yanar, hecesi söylenir ve Kino o taşa zıplar. Tam sayıda durunca Kino karşı kıyıya atlar:
 * övgü ve sayı ("İki!"). Fazla vurunca Kino son taştan suya düşer, şap! (ceza yok, komik): "Bir fazla oldu!" ve
 * yeniden. Eksikte bekleyince "Biraz daha vur!". Yalnız dokunma; mikrofon yok.
 * Hece bölme: ses-testi'nin Türkçe hecele()'si. Kino (ilk kelime): karpuza beş kere vurur, iki taştan sonra suya
 * düşer; Mino: "Dur Kino, beni dinle!" "Kar! Puz! İki!"
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import type { Sahne } from '../sahne';
import { sayiSozu } from '../sayi';
import { ses } from '../sesler';
import { heceDurumu, heceler, heceSozu, heceTurlari, kelime, kelimeSozu, KINO_HECE } from './model';
import { KA, KK, KM, sicrat, simge } from './ortak';
import { hazir, kelimeEl, kelimeGorsel } from './resim';
import { kses } from './ses';

/** Vuruş dizisinin sonu sayılan sessizlik */
const TAM_MS = 900;
const EKSIK_MS = 2600;
/** Davul: Gemini'nin davulu (yoksa Orman'ınki) */
const DAVUL = () => (hazir('okul/kelime/davul') ? 'okul/kelime/davul' : 'orman-esya/davul');

/** Davul tek yere bağlanır: o anki kelimenin vur'u */
const dinleyici: { vur: (() => void) | null } = { vur: null };

/** Mino heceleyerek söyler; her hecede taşı parlar */
async function heceleSoyle(s: Sahne, hs: string[], taslar: HTMLElement[]) {
  for (let i = 0; i < hs.length; i++) {
    if (s.kapandi()) return;
    const t = taslar[i];
    t.classList.add('ok-k-parla');
    oynat(t, 'ok-zipla');
    kses.davul(i);
    await Promise.all([s.soyle(heceSozu(hs[i])), s.bekle(450)]);
    t.classList.remove('ok-k-parla');
  }
}

async function tur(s: Sahne, id: string, ilk: boolean) {
  const hs = heceler(id);
  const n = hs.length;
  const tasImg = () => h('img', { src: kelimeGorsel('film/esya/tas'), alt: '', draggable: 'false' });
  const taslar = hs.map((hc, i) => h('span.ok-k-hece', { style: `--i:${i}`, 'data-hece': hc }, tasImg(), h('b', {}, hc)));
  // fazladan vuruşta Kino'nun düştüğü su (son taşın ötesi)
  const su = h('span.ok-k-hece-su', { 'aria-hidden': 'true' });
  const resim = h('div.ok-k-hece-resim', { 'aria-label': kelime(id).ad }, kelimeEl(id));
  const dere = h('div.ok-k-dere', {}, h('img.ok-k-dere-su', { src: kelimeGorsel('orman-esya/golet'), alt: '', draggable: 'false' }), h('div.ok-k-taslar', {}, ...taslar, su));
  s.alan.replaceChildren(h('div.ok-k-hecele', { 'data-n': String(n) }, resim, dere));
  s.el.dataset.hedef = String(n);
  s.el.dataset.vurus = '0';
  const isik = (k: number) => taslar.forEach((t, i) => t.classList.toggle('ok-k-yandi', i < k));

  // Kino'nun zıplamaları sırayla (hızlı vuruşta kuyruk)
  let zipla: Promise<void> = Promise.resolve();
  const tasaZipla = (el: HTMLElement) =>
    (zipla = zipla.then(async () => {
      if (s.kapandi()) return;
      const [x, y] = s.efekt.merkez(el, 0.5, 0.45);
      await s.kinoGit(x, y, 340);
      kses.boing();
      oynat(el, 'ok-k-bas');
    }));
  const suyaDus = () =>
    (zipla = zipla.then(async () => {
      if (s.kapandi()) return;
      const [x, y] = s.efekt.merkez(su, 0.5, 0.6);
      await s.kinoGit(x, y + 30, 380);
      kses.sicrama();
      sicrat(s.efekt, x, y, '#6cc4ff', 14, 1.2);
      s.kinoIfade('saskin', 1400);
      s.kinoOynat('huy', 900);
    }));

  if (ilk) await s.soyle(KM.hecele.giris);
  await s.soyle(kelimeSozu(id));
  if (id === KINO_HECE && ilk) {
    // Kino beş kere vurur: iki taştan sonra suya düşer
    await s.kinoHata({
      kino: KK.hecele,
      poz: 'kalk',
      once: async () => {
        for (let i = 0; i < 5; i++) {
          kses.davul(i);
          if (i < n) void tasaZipla(taslar[i]);
          else if (i === n) void suyaDus();
          await s.bekle(360);
        }
        await zipla;
      },
      mino: KM.hecele.dur,
      sonra: async () => {
        await s.kinoDon(450);
        await heceleSoyle(s, hs, taslar);
        await s.soyle(sayiSozu(n));
      },
      kinoSon: KK.hecele_son,
    });
  } else {
    await s.soyle(KM.hecele.dinle);
    await heceleSoyle(s, hs, taslar);
  }
  await s.soyle(KM.hecele.sen);
  s.adim('vur');

  let vurus = 0;
  let zaman = 0;
  let mesgul = false;
  let yanlis = 0;
  await new Promise<void>((coz) => {
    const degerlendir = async () => {
      const d = heceDurumu(n, vurus);
      mesgul = true;
      await zipla;
      if (d === 'tam') {
        dinleyici.vur = null;
        // karşı kıyıya atlar
        await s.kinoDon(450);
        kses.sicrama();
        taslar.forEach((t, i) => {
          t.style.setProperty('--j', String(i));
          t.classList.add('ok-k-dans');
        });
        await s.ovgu(resim);
        await s.soyle(sayiSozu(n));
        coz();
        return;
      }
      if (d === 'fazla') {
        yanlis++;
        await s.soyle(KK.hecele_islak, 'kino');
        await s.kinoDon(450);
        await s.soyle(KM.hecele.fazla);
        vurus = 0;
        s.el.dataset.vurus = '0';
        isik(0);
        // 2 yanlıştan sonra Mino yeniden heceler (ipucu)
        if (yanlis >= 2) await heceleSoyle(s, hs, taslar);
        await s.soyle(KM.hecele.sen);
      } else {
        await s.soyle(KM.hecele.eksik);
      }
      mesgul = false;
    };
    dinleyici.vur = () => {
      if (mesgul || s.kapandi()) return;
      vurus++;
      s.el.dataset.vurus = String(vurus);
      if (vurus <= n) {
        const t = taslar[vurus - 1];
        isik(vurus);
        void tasaZipla(t);
        void s.soyle(heceSozu(hs[vurus - 1]));
      } else if (vurus === n + 1) void suyaDus();
      clearTimeout(zaman);
      const ms = vurus < n ? EKSIK_MS : vurus === n ? TAM_MS : 600;
      zaman = window.setTimeout(() => void degerlendir(), TEST_MODU ? Math.min(ms, 150) : ms);
    };
  });
  clearTimeout(zaman);
  delete s.el.dataset.hedef;
}

etkinlikKaydet({
  id: 'kelime-hecele',
  bolge: 'kelime',
  ad: KA.etkinlikler['kelime-hecele'],
  simge: () => simge([DAVUL(), 'ok-ks-davul'], ['okul/kelime/kavun', 'ok-ks-karpuz']),
  async oyna(s) {
    let sira = 0;
    const davul = h('button.ok-davul.ok-k-davul', { type: 'button', 'aria-label': 'Davul' }, h('img', { src: kelimeGorsel(DAVUL()), alt: '', draggable: 'false' }));
    davul.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      kses.davul(sira++ % 4);
      oynat(davul, 'ok-vur');
      const [x, y] = s.efekt.merkez(davul, 0.5, 0.2);
      s.efekt.parilti(x, y, 5, 0.6);
      dinleyici.vur?.();
    });
    s.kapaninca(() => (dinleyici.vur = null));
    const turlar = heceTurlari(s.yas, s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      s.secim.replaceChildren(davul);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
    s.secim.replaceChildren();
    ses.sihir();
  },
});
