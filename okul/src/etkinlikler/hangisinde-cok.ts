/**
 * Etkinlik 4 · Hangisinde çok? (az-çok-eşit). İki tabakta kurabiye; tabağa dokunulur (eşitse "Eşit!" düğmesi).
 * Doğruysa kurabiyeler iki sıraya dizilip bire bir eşleşir, fazla olanlar parlar. Büyük tabakta hep az kurabiye var
 * (boyut ile miktar karışmasın). Kino hep büyük tabağı ister: "Tabak büyük ama kurabiye az!"
 */
import O from '../../../content/okul.json';
import { h, TEST_MODU } from '../../../src/ui/dom';
import { kurabiye, tabak } from '../cizim';
import { oynat, tasi } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { Ipucu, type Sahne } from '../sahne';
import { dogruTaraf, tabakTurlari, type TabakTuru } from '../sayi';
import { ses } from '../sesler';

const M = O.mino.hangisinde_cok;

/**
 * Kurabiyelerin tabaktaki yerleri (tabak kutusunun yüzdesi; tabak üstten yuvarlak). Kurabiyeler tabağın iç dairesine
 * halka (+ ortada bir-iki) dizilir; hepsi tabağın içinde, birbirine değmeden sayılabilir. c: kurabiye çapı (%).
 */
export function kurabiyeYerleri(n: number): { x: number; y: number; c: number }[] {
  // iç daire yarıçapı (kutunun %'si): tabak kenarı %45'te, kurabiyeler kenarın biraz içinde
  const P = 39;
  // [halkadaki adet, ortadaki adet, kurabiye yarıçapı (iç daireye oranla)]
  const plan: Record<number, [number, number, number]> = {
    1: [0, 1, 0.42],
    2: [2, 0, 0.42],
    3: [3, 0, 0.44],
    4: [4, 0, 0.4],
    5: [5, 0, 0.36],
    6: [5, 1, 0.33],
    7: [6, 1, 0.32],
    8: [7, 1, 0.29],
    9: [8, 1, 0.27],
    10: [8, 2, 0.25],
  };
  const [halka, orta, r] = plan[Math.max(1, Math.min(10, n))] ?? [n, 0, 0.25];
  const R = 1 - r;
  const yer: { x: number; y: number; c: number }[] = [];
  const c = 2 * r * P;
  if (orta === 1) yer.push({ x: 50, y: 50, c });
  if (orta === 2) yer.push({ x: 50 - r * P, y: 50, c }, { x: 50 + r * P, y: 50, c });
  const kay = halka === 8 && orta === 2 ? Math.PI / 8 : halka === 2 ? 0 : -Math.PI / 2;
  for (let i = 0; i < halka; i++) {
    const a = kay + (i / halka) * Math.PI * 2;
    yer.push({ x: 50 + Math.cos(a) * R * P, y: 50 + Math.sin(a) * R * P, c });
  }
  return yer;
}

function tabakEl(taraf: 'sol' | 'sag', adet: number, buyuk: boolean): HTMLButtonElement {
  const yerler = kurabiyeYerleri(adet);
  const kurabiyeler = Array.from({ length: adet }, (_, i) => {
    const y = yerler[i];
    return h('i.ok-kurabiye', { style: `--k:${i};--d:${((i * 47) % 20) - 10}deg;--x:${y.x.toFixed(2)}%;--y:${y.y.toFixed(2)}%;--c:${y.c.toFixed(2)}%`, html: kurabiye() });
  });
  return h(
    `button.ok-tabak${buyuk ? '.ok-buyuk' : ''}`,
    { type: 'button', 'data-taraf': taraf, 'data-adet': String(adet), 'aria-label': buyuk ? 'Büyük tabak' : 'Küçük tabak' },
    h('span.ok-tabak-resim', { html: tabak() }),
    h('span.ok-tabak-ic', { 'data-n': String(adet) }, ...kurabiyeler),
  );
}

async function tur(s: Sahne, t: TabakTuru, ilk: boolean) {
  const sol = tabakEl('sol', t.sol, t.buyuk === 'sol');
  const sag = tabakEl('sag', t.sag, t.buyuk === 'sag');
  const eslesme = h('div.ok-e4-eslesme');
  s.alan.replaceChildren(h('div.ok-e4', {}, h('div.ok-e4-tabaklar', {}, sol, sag), eslesme));
  const esit = h('button.dugme.ok-esit', { type: 'button', 'data-taraf': 'esit' }, O.arayuz.esit);
  s.secim.replaceChildren(esit);
  const dogru = dogruTaraf(t);
  const dogruEl = dogru === 'sol' ? sol : dogru === 'sag' ? sag : esit;
  if (TEST_MODU) dogruEl.dataset.dogru = '1';
  const buyukEl = t.buyuk === 'sol' ? sol : sag;

  if (ilk) {
    const [x, y] = s.efekt.merkez(buyukEl);
    await s.kinoHata({
      kino: O.kino.buyuk,
      once: () => {
        oynat(buyukEl, 'ok-zipla');
        s.efekt.parilti(x, y, 5, 0.6);
      },
    });
  }
  await s.soyle(t.soru === 'cok' ? M.cok : t.soru === 'az' ? M.az : M.esit);
  s.adim('sec');

  const ipucu = new Ipucu(() => [dogruEl]);
  let mesgul = false;
  await new Promise<void>((coz) => {
    for (const b of [sol, sag, esit]) {
      b.addEventListener('click', async () => {
        if (mesgul || s.kapandi()) return;
        mesgul = true;
        if (b === dogruEl) {
          ipucu.sifirla();
          ses.tik();
          b.classList.add('ok-dogru');
          // bire bir eşleme: iki sıra, fazlalar parlar
          const ust = h('div.ok-e4-sira');
          const alt = h('div.ok-e4-sira');
          eslesme.replaceChildren(ust, alt);
          eslesme.classList.add('acik');
          const a = [...sol.querySelectorAll<HTMLElement>('.ok-kurabiye')];
          const c = [...sag.querySelectorAll<HTMLElement>('.ok-kurabiye')];
          const n = Math.max(a.length, c.length);
          eslesme.style.setProperty('--n', String(n));
          a.forEach((k) => tasi(k, ust));
          c.forEach((k) => tasi(k, alt));
          await s.bekle(450);
          const enAz = Math.min(a.length, c.length);
          [...a.slice(enAz), ...c.slice(enAz)].forEach((k) => k.classList.add('ok-fazla'));
          await s.soyle(dogru === 'esit' ? M.dogru_esit : t.soru === 'az' ? M.dogru_az : M.dogru_cok);
          await s.ovgu(b);
          coz();
          return;
        }
        s.nazik(b);
        ipucu.yanlis();
        await s.soyle(O.mino.sayalim);
        if (b !== esit) {
          const el = [...b.querySelectorAll('.ok-kurabiye')];
          await s.sayarak(el.length, (i) => oynat(el[i - 1], 'ok-zipla'));
        }
        mesgul = false;
      });
    }
  });
  s.secim.replaceChildren();
  if (ilk && t.soru === 'cok') await s.kinoHata({ kino: O.kino.az, poz: 'dusun' });
}

etkinlikKaydet({
  id: 'hangisinde-cok',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler['hangisinde-cok'],
  async oyna(s) {
    const turlar = tabakTurlari(s.yas, s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
