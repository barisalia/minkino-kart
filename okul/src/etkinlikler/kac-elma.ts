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

/**
 * Ağacın tacı (assets/okul/agac.webp, 768 × 560 tuvalde, yüzde): elips. Elmaların merkezleri tacın içindeki küçültülmüş
 * elipse konur (elma yarıçapı kadar içeride), böylece elmanın tamamı tacın yeşilinin üstünde durur.
 */
const TAC = { x: 50, y: 33, rx: 30, ry: 24.5 };

/** Elmaların ağaçtaki yerleri (yüzde) ve boyu (px): taç elipsi satırlara bölünür, elma en büyük olacak şekilde */
export function elmaYerleri(n: number, W: number, H: number): { yer: [number, number][]; boy: number } {
  const cx = (TAC.x / 100) * W;
  const cy = (TAC.y / 100) * H;
  const rx = (TAC.rx / 100) * W;
  const ry = (TAC.ry / 100) * H;
  const dene = (r: number) => {
    // elma boyu s ile elipsin içi birbirine bağlı: birkaç adımda oturur
    let s = Math.min((2 * rx) / Math.ceil(n / r), (2 * ry) / r);
    let satirlar: { y: number; w: number; c: number }[] = [];
    for (let k = 0; k < 4; k++) {
      const ax = Math.max(4, rx - s * 0.42);
      const ay = Math.max(4, ry - s * 0.42);
      satirlar = Array.from({ length: r }, (_, i) => {
        const y = cy - ay + ((i + 0.5) * 2 * ay) / r;
        const t = (y - cy) / ay;
        return { y, w: 2 * ax * Math.sqrt(Math.max(0, 1 - t * t)), c: 0 };
      });
      // her elma, eklenince aralığı en geniş kalan satıra (önce boş satırlar)
      for (let e = 0; e < n; e++) {
        let en = satirlar[0];
        for (const st of satirlar) if (st.w / Math.max(st.c, 0.01) > en.w / Math.max(en.c, 0.01)) en = st;
        en.c++;
      }
      const aralik = Math.min(...satirlar.map((st) => (st.c > 1 ? st.w / (st.c - 1) : Infinity)));
      s = Math.min(aralik, (2 * ay) / r, rx, ry) * 0.94;
    }
    return { s, satirlar };
  };
  let en = dene(1);
  for (let r = 2; r <= 4; r++) {
    const d = dene(r);
    if (d.s > en.s) en = d;
  }
  const yer: [number, number][] = [];
  en.satirlar.forEach((st, i) => {
    for (let j = 0; j < st.c; j++) {
      const x = st.c > 1 ? cx - st.w / 2 + (st.w * j) / (st.c - 1) : cx + (i % 2 ? 0.12 : -0.12) * en.s;
      yer.push([(x / W) * 100, (st.y / H) * 100]);
    }
  });
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
