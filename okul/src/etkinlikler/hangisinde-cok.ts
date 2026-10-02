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

function tabakEl(taraf: 'sol' | 'sag', adet: number, buyuk: boolean): HTMLButtonElement {
  const kurabiyeler = Array.from({ length: adet }, (_, i) => h('i.ok-kurabiye', { style: `--k:${i};--d:${((i * 47) % 20) - 10}deg`, html: kurabiye() }));
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
