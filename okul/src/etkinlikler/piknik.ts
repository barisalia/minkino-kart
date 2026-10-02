/**
 * Etkinlik 10 · Piknik! (bölüm sonu; hepsini birlikte kullanma). Piknik örtüsü serilir, misafirler gelir (tavşan, ayı,
 * ördek; 5-6 yaşta maymun da). Karışık görevler: kaç misafir var (say), herkese bir tabak (birebir eşleme), herkese
 * iki elma (5-6 yaş), kim çok kurabiye aldı (az-çok). Final: hep birlikte piknik; Kino elmayı ağzına atar: "Bir! Mmm…"
 */
import O from '../../../content/okul.json';
import { h, TEST_MODU } from '../../../src/ui/dom';
import { gorsel, kurabiye, ORTU, tabak } from '../cizim';
import { oynat, tasi } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { Ipucu, type Oyuncu } from '../sahne';
import { elmaSigar, piknikPlani, secenekler } from '../sayi';
import { ses } from '../sesler';
import { geriGonder, hedefliSurukle } from '../surukle';

const M = O.mino.piknik;
const KEMIK =
  '<svg viewBox="0 0 80 40"><path d="M18 8a9 9 0 0 1 16 4h12a9 9 0 1 1 16 6a9 9 0 1 1-16 6H34a9 9 0 1 1-16-6a9 9 0 0 1 0-10z" fill="#FFF4DD" stroke="#6b3a1f" stroke-width="3" stroke-linejoin="round"/></svg>';
const tabakEl = () => h('span.ok-p-tabak', { html: tabak() }, h('span.ok-p-tabak-ic'));

/**
 * i. misafirin örtüdeki yeri (örtü kutusunun yüzdesi). Örtü (assets/okul/piknik-ortusu.webp, kırpılmış) yandan
 * bakılan bir dörtgen: sol köşe (1, 47), üst (48, 2), sağ (100, 29), alt (60, 99). Yerler uzun eksen boyunca,
 * örtünün eğimiyle hafifçe yükselir; hepsi örtünün içinde.
 */
export function ortuYeri(i: number, n: number): [number, number] {
  const x = 14 + ((i + 0.5) / n) * 72;
  return [x, 50 - 0.2 * (x - 50)];
}

etkinlikKaydet({
  id: 'piknik',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler.piknik,
  async oyna(s) {
    const plan = piknikPlani(s.yas, s.rnd);
    const adim = 3 + (plan.elma ? 1 : 0);
    s.turlar(adim);
    s.tur(0);
    const misafirler: Oyuncu[] = plan.misafirler.map((ad) => s.oyuncu(ad, ad === 'ayi' ? 0.95 : 1.15));
    // örtü yandan bakılan bir dörtgen: yerler örtünün uzun ekseni boyunca, misafirlerle aynı sırada (soldan sağa)
    const yerler = misafirler.map((m, i) => {
      const [x, y] = ortuYeri(i, misafirler.length);
      return h('div.ok-p-yer', { 'data-misafir': m.ad, style: `--i:${i};left:${x.toFixed(1)}%;top:${y.toFixed(1)}%` });
    });
    const sira = h('div.ok-p-misafirler', { style: `--n:${misafirler.length}` }, ...misafirler.map((m, i) => h('div.ok-p-misafir', { style: `--i:${i}` }, m.el)));
    const ortu = h('div.ok-p-ortu', { html: ORTU() }, h('div.ok-p-yerler', { style: `--n:${yerler.length}` }, ...yerler));
    const kok = h('div.ok-e10', {}, sira, ortu);
    s.alan.replaceChildren(kok);
    // dar ekranda misafirler sığsın (hepsi görünür): sıra alandan genişse küçülür
    await s.bekle(30);
    const en = s.alan.getBoundingClientRect().width;
    const sigdir = [...sira.children].reduce((t, c) => t + (c as HTMLElement).offsetWidth, 0);
    if (en && sigdir > en * 0.98) sira.style.setProperty('--p-uzak', ((0.9 * en * 0.98) / sigdir).toFixed(3));
    misafirler.forEach((m, i) => s.sonra(200 + i * 250, () => void m.k.oynat('var', 700)));
    await s.soyle(M.giris);

    // 1) Kaç misafir var? (dokunarak say)
    let sayac = 0;
    misafirler.forEach((m) => {
      const rozet = h('b.ok-rozet-sayi');
      m.el.append(rozet);
      m.el.addEventListener('click', () => {
        if (m.el.dataset.sayildi || s.el.dataset.adim !== 'kart') return;
        m.el.dataset.sayildi = '1';
        sayac++;
        rozet.textContent = String(sayac);
        ses.pit(sayac - 1);
        void m.k.oynat('sevin', 700);
        void s.say(sayac);
      });
    });
    await s.soyle(M.misafir);
    await s.kartSec(secenekler(misafirler.length, s.enBuyuk, s.rnd), misafirler.length, {
      yanlis: async () => {
        await s.soyle(O.mino.sayalim);
        await s.sayarak(misafirler.length, (i) => void misafirler[i - 1].k.oynat('sevin', 600));
      },
    });
    misafirler.forEach((m) => m.el.querySelector('.ok-rozet-sayi')?.remove());
    s.tur(1);

    // 2) Herkese bir tabak (birebir eşleme: fazladan tabak kalır)
    await s.soyle(M.tabak);
    s.adim('tabak');
    const tabaklar = Array.from({ length: plan.tabak }, (_, i) => {
      const b = h('button.ok-p-surukle.ok-p-tabak-dugme', { type: 'button', 'aria-label': 'Tabak', style: `--i:${i}` }, tabakEl());
      return b;
    });
    s.secim.replaceChildren(h('div.ok-p-yigin', {}, ...tabaklar));
    await new Promise<void>((coz) => {
      let kalan = yerler.length;
      for (const b of tabaklar) {
        const ipucu = new Ipucu(() => yerler.filter((y) => !y.dataset.tabak));
        const kapat = hedefliSurukle({
          el: b,
          hedefler: () => yerler,
          aktif: () => !b.dataset.konuldu && !s.kapandi(),
          birak: (yer) => {
            if (!yer) return geriGonder(b);
            if (yer.dataset.tabak) {
              geriGonder(b);
              s.nazik(yer);
              ipucu.yanlis();
              return;
            }
            b.dataset.konuldu = '1';
            yer.dataset.tabak = '1';
            tasi(b, yer);
            b.style.transform = '';
            ses.tik();
            const m = misafirler[yerler.indexOf(yer as HTMLDivElement)];
            void m?.k.oynat('sevin', 600);
            kalan--;
            if (kalan === 0) coz();
          },
        });
        s.kapaninca(kapat);
      }
    });
    await s.ovgu(ortu);
    s.secim.replaceChildren();
    s.tur(2);

    // 3) Herkese iki elma (5-6 yaş)
    if (plan.elma) {
      await s.soyle(M.elma);
      s.adim('elma');
      const elmalar = Array.from({ length: yerler.length * 2 + 2 }, (_, i) =>
        h('button.ok-p-surukle.ok-p-elma', { type: 'button', 'aria-label': 'Elma', style: `--i:${i}` }, h('img', { src: gorsel('meyveler/elma'), alt: '', draggable: 'false' })),
      );
      s.secim.replaceChildren(h('div.ok-p-yigin', {}, ...elmalar));
      const icinde = (yer: HTMLElement) => yer.querySelectorAll('.ok-p-elma').length;
      await new Promise<void>((coz) => {
        const ipucu = new Ipucu(() => yerler.filter((y) => elmaSigar(icinde(y))));
        for (const b of elmalar) {
          const kapat = hedefliSurukle({
            el: b,
            hedefler: () => yerler,
            aktif: () => !b.dataset.konuldu && !s.kapandi(),
            birak: (yer) => {
              if (!yer) return geriGonder(b);
              if (!elmaSigar(icinde(yer))) {
                geriGonder(b);
                s.nazik(yer);
                ipucu.yanlis();
                void s.soyle(O.mino.tekrar);
                return;
              }
              b.dataset.konuldu = '1';
              tasi(b, yer.querySelector('.ok-p-tabak-ic') ?? yer);
              b.style.transform = '';
              ses.dus();
              void s.say(icinde(yer));
              if (yerler.every((y) => icinde(y) >= 2)) coz();
            },
          });
          s.kapaninca(kapat);
        }
      });
      await s.ovgu(ortu);
      s.secim.replaceChildren();
      s.tur(3);
    }

    // 4) Kim çok kurabiye aldı? (Kino ile ayı)
    const ayiYer = yerler[plan.misafirler.indexOf('ayi')];
    const kinoTabak = h('button.ok-p-kim', { type: 'button', 'data-kim': 'kino', 'aria-label': 'Kino’nun tabağı' }, h('span.ok-tabak-resim', { html: tabak() }), h('span.ok-tabak-ic', {}, ...Array.from({ length: plan.kurabiye.kino }, (_, i) => h('i.ok-kurabiye', { style: `--k:${i}`, html: kurabiye() }))));
    const ayiTabak = h('button.ok-p-kim', { type: 'button', 'data-kim': 'ayi', 'aria-label': 'Ayının tabağı' }, h('img.ok-p-kim-yuz', { src: gorsel('hayvanlar/ayi'), alt: '' }), h('span.ok-tabak-resim', { html: tabak() }), h('span.ok-tabak-ic', {}, ...Array.from({ length: plan.kurabiye.ayi }, (_, i) => h('i.ok-kurabiye', { style: `--k:${i}`, html: kurabiye() }))));
    // Kino'nun tabağı: kemik işareti (Kino bir köpek yavrusu), tabak Kino'nun yanında
    const kinoYuz = h('span.ok-p-kim-kino', { 'aria-hidden': 'true', html: KEMIK });
    kinoTabak.prepend(kinoYuz);
    s.secim.replaceChildren(h('div.ok-p-kimler', {}, ayiTabak, kinoTabak));
    const [ax, ay] = s.efekt.merkez(ayiYer);
    s.efekt.parilti(ax, ay, 4, 0.5);
    const dogru = plan.kurabiye.kino > plan.kurabiye.ayi ? kinoTabak : ayiTabak;
    if (TEST_MODU) dogru.dataset.dogru = '1';
    await s.soyle(M.cok);
    s.adim('kim');
    await new Promise<void>((coz) => {
      const ipucu = new Ipucu(() => [dogru]);
      let mesgul = false;
      for (const b of [ayiTabak, kinoTabak]) {
        b.addEventListener('click', async () => {
          if (mesgul || s.kapandi()) return;
          mesgul = true;
          if (b === dogru) {
            b.classList.add('ok-dogru');
            ses.tik();
            await s.ovgu(b);
            coz();
            return;
          }
          s.nazik(b);
          ipucu.yanlis();
          await s.soyle(O.mino.sayalim);
          const el = [...b.querySelectorAll('.ok-kurabiye')];
          await s.sayarak(el.length, (i) => oynat(el[i - 1], 'ok-zipla'));
          mesgul = false;
        });
      }
    });
    s.secim.replaceChildren();
    s.tur(adim);

    // Final: hep birlikte piknik
    s.adim('final');
    await s.soyle(M.final);
    misafirler.forEach((m, i) => s.sonra(i * 120, () => void m.k.oynat('dans', 1600)));
    s.minoTepki('dans', 2);
    s.konfeti(0.5, 0.3, 90);
    // Kino elmayı ağzına atar
    const elma = h('img.ok-ucan-elma', { src: gorsel('meyveler/elma'), alt: '' });
    elma.style.width = '56px';
    const [x0, y0] = s.efekt.merkez(ortu, 0.8, 0.4);
    const [x1, y1] = s.efekt.merkez(s.kinoYer, 0.5, 0.45);
    await s.efekt.ucur(elma, [x0, y0], [x1, y1], { ms: 700, kavis: -140, boy1: 0.5, don: 360 });
    ses.ham();
    s.kinoOynat('ye', 1200);
    await s.kinoHata({ kino: O.kino.mmm, poz: null });
    await s.bekle(600);
  },
});
