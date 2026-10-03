/**
 * Kelime Köprüsü 5 · Hangi grup? (kategoriler). Resimler karışık; çocuk her birini yerine sürükler: meyveler sepete
 * düşer, hayvanlar çayıra hoplar, taşıtlar yola girip "vın" diye park eder (yerin üstünde o grubun simgesi; yere
 * dokununca grubun adı söylenir). Yanlış yerde resim yumuşakça geri seker, Kino güler ("Bu yolda gitmez ki!"), Mino
 * grubunu söyler ("Bu bir hayvan!"); 2 yanlıştan sonra doğru yer parlar. Sürükleme: surukle.ts (Pazar'ın kodu).
 * Çayır ve yol: Gemini'nin ağıl ve garaj görselleri gelene kadar sahne/cayir ve sahne/yol.
 * Kino (başta): balığı yola koyar: "Balık yüzer, taşıt olur!" Mino: "Balık bir hayvan Kino!"
 */
import K from '../../../content/okul-kelime.json';
import { h } from '../../../src/ui/dom';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { Ipucu, type Sahne } from '../sahne';
import { ses } from '../sesler';
import { geriGonder, hedefliSurukle } from '../surukle';
import { grubaUyar, grupResimleri, kelime, kelimeSozu, KATEGORI_SIMGE, KATEGORILER, KINO_GRUP, type Kategori } from './model';
import { KA, KK, KM, simge } from './ortak';
import { gorselEl, hazir, kelimeEl } from './resim';
import { kses } from './ses';

const KL = K.kelimeler as Record<string, string>;

interface Yer {
  el: HTMLElement;
  ic: HTMLElement;
}

/** Grubun yeri: meyveye sepet, hayvana çayır (ağıl), taşıta yol (garaj) */
function yerYap(k: Kategori): Yer {
  const ic = h('div.ok-k-yer-ic');
  const zemin =
    k === 'meyve'
      ? gorselEl(hazir('okul/kelime/meyve-sepeti-bos') ? 'okul/kelime/meyve-sepeti-bos' : 'pazar/sepet', 'ok-k-yer-resim')
      : hazir(`okul/kelime/${k === 'hayvan' ? 'agil' : 'garaj'}`)
        ? gorselEl(`okul/kelime/${k === 'hayvan' ? 'agil' : 'garaj'}`, 'ok-k-yer-resim')
        : h('span.ok-k-yer-pencere', {}, gorselEl(k === 'hayvan' ? 'sahne/cayir' : 'sahne/yol'));
  const el = h('div.ok-k-grup-yer', { 'data-kategori': k, 'data-cizim': zemin.classList.contains('ok-k-yer-pencere') ? 'pencere' : 'resim', role: 'button', 'aria-label': KL[k] }, zemin, ic, h('span.ok-k-etiket', {}, kelimeEl(KATEGORI_SIMGE[k])));
  return { el, ic };
}

/** Resim yerine varır: meyve düşer, hayvan hoplar, taşıt yoldan girer */
async function var_(s: Sahne, yer: Yer, k: Kategori, id: string, bas: [number, number]) {
  const mini = kelimeEl(id, 'ok-k-mini');
  mini.style.setProperty('--k', String(yer.ic.children.length));
  if (k === 'tasit') {
    yer.ic.append(mini);
    mini.classList.add('ok-k-gir');
    kses.vin();
    return;
  }
  const [x1, y1] = s.efekt.merkez(yer.el, 0.5, k === 'meyve' ? 0.4 : 0.55);
  await s.efekt.ucur(kelimeEl(id, 'ok-k-ucan-oge'), bas, [x1, y1], { ms: k === 'hayvan' ? 520 : 380, kavis: k === 'hayvan' ? -150 : -40, boy1: 0.55 });
  yer.ic.append(mini);
  mini.classList.add(k === 'hayvan' ? 'ok-k-hopla' : 'ok-k-dus');
  if (k === 'hayvan') kses.hop(yer.ic.children.length);
  else ses.dus();
}

etkinlikKaydet({
  id: 'kelime-grup',
  bolge: 'kelime',
  ad: KA.etkinlikler['kelime-grup'],
  simge: () => simge(['pazar/sepet', 'ok-ks-sepet'], ['meyveler/elma', 'ok-ks-elma'], ['tasitlar/araba', 'ok-ks-araba']),
  async oyna(s) {
    const resimler = grupResimleri(s.yas, s.rnd);
    s.turlar(1);
    s.tur(0);
    const yerler = new Map<Kategori, Yer>();
    for (const k of KATEGORILER) {
      const y = yerYap(k);
      y.el.addEventListener('click', () => {
        oynat(y.el, 'ok-parla');
        void s.soyle(`${KL[k]}!`);
      });
      yerler.set(k, y);
    }
    const yigin = h('div.ok-k-yigin', { 'data-n': String(resimler.length) });
    const ogeler = resimler.map((id, i) => {
      const b = h('button.ok-k-oge.ok-k-gel', { type: 'button', 'data-kelime': id, 'data-kategori': kelime(id).kategori ?? '', style: `--i:${i}`, 'aria-label': kelime(id).ad }, kelimeEl(id));
      yigin.append(h('div.ok-k-oge-yuva', {}, b));
      return b;
    });
    s.alan.replaceChildren(h('div.ok-k-grup', {}, yigin));
    s.secim.replaceChildren(h('div.ok-k-sepetler', {}, ...[...yerler.values()].map((x) => x.el)));
    await s.soyle(KM.grup.giris);

    // Kino balığı yola koyar
    const balik = ogeler.find((o) => o.dataset.kelime === KINO_GRUP);
    const yol = yerler.get('tasit')!;
    if (balik) {
      await s.kinoHata({
        kino: KK.grup,
        once: async () => {
          balik.classList.add('ok-k-gitti');
          await s.efekt.ucur(kelimeEl(KINO_GRUP, 'ok-k-ucan-oge'), s.efekt.merkez(balik), s.efekt.merkez(yol.el, 0.5, 0.5), { ms: 600, kavis: -80, boy1: 0.55 });
          const mini = kelimeEl(KINO_GRUP, 'ok-k-mini');
          yol.ic.append(mini);
          mini.classList.add('ok-k-cirpin');
          kses.boing();
          oynat(yol.el, 'ok-yapis');
        },
        mino: KM.grup.yakala,
        sonra: async () => {
          // balık yoldan zıplar, yerine döner
          yol.ic.querySelector('.ok-k-mini')?.remove();
          kses.boing();
          await s.efekt.ucur(kelimeEl(KINO_GRUP, 'ok-k-ucan-oge'), s.efekt.merkez(yol.el, 0.5, 0.5), s.efekt.merkez(balik), { ms: 520, kavis: -90, boy0: 0.55 });
          balik.classList.remove('ok-k-gitti');
          oynat(balik, 'ok-zipla');
        },
        kinoSon: KK.grup_son,
      });
    }
    s.adim('surukle');

    let kalan = ogeler.length;
    let mesgul = false;
    await new Promise<void>((coz) => {
      for (const o of ogeler) {
        const kat = o.dataset.kategori as Kategori;
        const ipucu = new Ipucu(() => [yerler.get(kat)?.el]);
        const kapat = hedefliSurukle({
          el: o,
          hedefler: () => [...yerler.values()].map((x) => x.el),
          aktif: () => !mesgul && !s.kapandi() && !o.dataset.yerlesti,
          birak: async (hedef) => {
            if (!hedef) return geriGonder(o);
            const yk = hedef.dataset.kategori as Kategori;
            if (!grubaUyar(o.dataset.kelime ?? '', yk)) {
              // komik: resim geri seker, Kino güler
              geriGonder(o);
              mesgul = true;
              kses.boing();
              oynat(hedef, 'ok-hmm');
              ipucu.yanlis();
              s.kinoOynat('sevin', 700);
              s.kinoIfade('heyecan', 1200);
              await s.soyle(KK.grup_yanlis[yk], 'kino');
              await s.soyle(KM.grup[kat]);
              mesgul = false;
              return;
            }
            // yerine varır
            o.dataset.yerlesti = '1';
            ipucu.sifirla();
            const bas = s.efekt.merkez(o);
            o.style.transition = 'none';
            o.style.transform = '';
            o.classList.add('ok-k-gitti');
            const y = yerler.get(yk)!;
            kalan--;
            const son = !kalan;
            void s.soyle(kelimeSozu(o.dataset.kelime ?? ''));
            await var_(s, y, yk, o.dataset.kelime ?? '', bas);
            ses.tik();
            oynat(y.el, 'ok-yapis');
            const [x, yy] = s.efekt.merkez(y.el);
            s.efekt.parilti(x, yy, 6);
            if (son) coz();
          },
        });
        s.kapaninca(kapat);
      }
    });
    s.tur(1);
    await s.bekle(400);
    s.konfeti(0.5, 0.6, 50);
    await s.ovgu();
    await s.soyle(KM.grup.bitti);
  },
});
