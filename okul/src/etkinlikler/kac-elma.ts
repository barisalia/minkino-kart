/**
 * Etkinlik 1 · Kaç elma? (birebir eşleme ile sayma). Ağaçtaki her elmaya dokunulur: elma zıplar, sepete düşer,
 * üstünde sayısı belirir, Mino sayıyı söyler. Aynı elma iki kez sayılamaz (artık sepette). Sonunda 3 karttan biri.
 * Kino (ilk tur): aynı elmayı iki kez gösterip sayar: "Bir, iki, üç… aaa, beş!"
 */
import O from '../../../content/okul.json';
import { h } from '../../../src/ui/dom';
import { AGAC, gorsel } from '../cizim';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import type { Sahne } from '../sahne';
import { elmaTurlari, secenekler } from '../sayi';
import { ses } from '../sesler';

const M = O.mino.kac_elma;

/** Elmaların ağaçtaki yerleri: tepe (x %8-92, y %6-64) satırlara bölünür, elma en büyük olacak şekilde */
export function elmaYerleri(n: number, W: number, H: number): { yer: [number, number][]; boy: number } {
  const tw = W * 0.84;
  const th = H * 0.56;
  let en = { r: 1, s: 0 };
  for (let r = 1; r <= 4; r++) {
    const c = Math.ceil(n / r);
    const s = Math.min(tw / c, th / r) * 0.92;
    if (s > en.s) en = { r, s };
  }
  const yer: [number, number][] = [];
  const c = Math.ceil(n / en.r);
  for (let i = 0; i < n; i++) {
    const satir = Math.floor(i / c);
    const sutun = i % c;
    const bu = satir === en.r - 1 ? n - satir * c : c;
    const x = 8 + ((sutun + 0.5) / bu) * 84 + (satir % 2 ? 2 : -2);
    const y = 6 + ((satir + 0.5) / en.r) * 56;
    yer.push([x, y]);
  }
  return { yer, boy: Math.min(en.s, 100) };
}

async function tur(s: Sahne, n: number, kinoTuru: boolean) {
  const agac = h('div.ok-agac', { html: AGAC() });
  const sepetIc = h('div.ok-sepet-ic');
  const sepet = h('div.ok-sepet', {}, h('img.ok-sepet-resim', { src: gorsel('pazar/sepet'), alt: '', draggable: 'false' }), sepetIc, h('img.ok-sepet-resim.ok-sepet-on', { src: gorsel('pazar/sepet'), alt: '', draggable: 'false' }));
  const bahce = h('div.ok-e1', {}, agac, sepet);
  s.alan.replaceChildren(bahce);
  await s.bekle(30);
  const r = agac.getBoundingClientRect();
  const { yer, boy } = elmaYerleri(n, r.width || 300, r.height || 320);
  agac.style.setProperty('--eb', `${Math.max(48, boy).toFixed(0)}px`);
  const elmalar = yer.map(([x, y], i) =>
    h('button.ok-elma', { type: 'button', 'data-elma': String(i), 'aria-label': 'Elma', style: `left:${x}%;top:${y}%;--i:${i}` }, h('img', { src: gorsel('meyveler/elma'), alt: '', draggable: 'false' }), h('b.ok-rozet-sayi')),
  );
  agac.append(...elmalar);

  // Kino'nun hatası: aynı elmayı iki kez gösterir
  if (kinoTuru) {
    await s.soyle(M.giris);
    const goster = (i: number, yazi: string, yanlis = false) => {
      const b = elmalar[i]?.querySelector('b');
      if (!b) return;
      b.textContent = yazi;
      b.classList.toggle('ok-yanlis-sayi', yanlis);
      oynat(elmalar[i], 'ok-zipla');
    };
    await s.kinoHata({
      kino: O.kino.kac_elma_hata,
      once: async () => {
        const sira = [0, 1, Math.min(2, n - 1), 1];
        const yazi = ['1', '2', '3', '5'];
        for (let k = 0; k < sira.length; k++) {
          goster(sira[k], yazi[k], k === 3);
          await s.bekle(420);
        }
      },
      mino: M.yakala,
      sonra: async () => {
        oynat(elmalar[1], 'ok-hmm');
        await s.bekle(500);
        for (const e of elmalar) {
          const b = e.querySelector('b');
          if (b) {
            b.textContent = '';
            b.classList.remove('ok-yanlis-sayi');
          }
        }
      },
    });
  }

  // çocuk sayar
  await s.soyle(M.soru);
  s.adim('say');
  let sayi = 0;
  await new Promise<void>((coz) => {
    for (const e of elmalar) {
      e.addEventListener('click', async () => {
        if (e.dataset.sayildi || s.kapandi()) return;
        e.dataset.sayildi = '1';
        sayi++;
        const k = sayi;
        ses.pit(k - 1);
        void s.say(k);
        oynat(e, 'ok-zipla');
        // elma sepete düşer, üstünde sayısı
        const bas = s.efekt.merkez(e);
        const yeni = h('span.ok-sepet-elma', { style: `--i:${k - 1}` }, h('img', { src: gorsel('meyveler/elma'), alt: '', draggable: 'false' }), h('b', {}, String(k)));
        yeni.style.visibility = 'hidden';
        sepetIc.append(yeni);
        e.classList.add('ok-gitti');
        const hedef = s.efekt.merkez(yeni);
        const resim = h('img.ok-ucan-elma', { src: gorsel('meyveler/elma'), alt: '' });
        resim.style.width = `${e.getBoundingClientRect().width}px`;
        await s.efekt.ucur(resim, bas, hedef, { ms: 520, kavis: -70, boy1: yeni.getBoundingClientRect().width / Math.max(1, e.getBoundingClientRect().width) });
        yeni.style.visibility = '';
        ses.dus();
        oynat(yeni, 'ok-yapis');
        if (sayi === n) coz();
      });
    }
  });
  await s.bekle(300);
  await s.soyle(M.kac);
  await s.kartSec(secenekler(n, s.enBuyuk, s.rnd), n, {
    yanlis: async () => {
      await s.soyle(O.mino.sayalim);
      const sepettekiler = [...sepetIc.children];
      await s.sayarak(n, (i) => oynat(sepettekiler[i - 1], 'ok-zipla'));
    },
  });
  if (kinoTuru) {
    // Kino bir elmayı kafasına koyar: "Bunu unutmayayım."
    s.kinoYer.querySelector('.ok-kino-hareket')?.append(h('img.ok-kino-elma', { src: gorsel('meyveler/elma'), alt: '' }));
    await s.kinoHata({ kino: O.kino.kac_elma_son, poz: 'dusun' });
  }
}

etkinlikKaydet({
  id: 'kac-elma',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler['kac-elma'],
  ucretsiz: true,
  async oyna(s) {
    const turlar = elmaTurlari(s.yas, s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
