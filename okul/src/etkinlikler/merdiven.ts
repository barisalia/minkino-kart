/**
 * Etkinlik 6 · Sayı merdiveni (sıralama, eksik sayı). Ağaca çıkan merdivenin basamaklarında rakamlar var; Kino
 * basamakları karışık dizer, tırmanırken "Dört, iki, beş? Ayy!" diye karışıp yapraklara düşer, rakamlar dökülür.
 * Çocuk düşen rakamları doğru basamağa sürükler; merdiven tamamlanınca Kino sayarak tırmanıp tepedeki elmayı alır.
 * 3-4 yaş 1-5 (1 eksik), 5-6 yaş 1-10 (2-3 eksik).
 */
import O from '../../../content/okul.json';
import { h } from '../../../src/ui/dom';
import { gorsel } from '../cizim';
import { oynat, tasi } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { Ipucu, rakamKarti, RAKAM_RENK, type Sahne } from '../sahne';
import { basamakUyar, merdivenTurlari, type MerdivenTuru } from '../sayi';
import { ses } from '../sesler';
import { geriGonder, hedefliSurukle } from '../surukle';

const M = O.mino.merdiven;

const plaka = (n: number) => h('span.ok-plaka', { style: `--r:${RAKAM_RENK[n % RAKAM_RENK.length]}` }, String(n));

async function tur(s: Sahne, t: MerdivenTuru, ilk: boolean) {
  const basamaklar = Array.from({ length: t.n }, (_, i) => {
    const k = i + 1;
    return h('div.ok-basamak', { 'data-basamak': String(k), style: `--k:${k}` }, t.eksik.includes(k) ? null : plaka(k));
  });
  const elma = h('img.ok-merdiven-elma', { src: gorsel('meyveler/elma'), alt: '', draggable: 'false' });
  const merdiven = h('div.ok-merdiven', { style: `--n:${t.n}` }, h('i.ok-ray-sol'), h('i.ok-ray-sag'), ...basamaklar, elma);
  s.alan.replaceChildren(h('div.ok-e6', {}, merdiven));
  const yapraklar = h('div.ok-yapraklar');
  s.secim.replaceChildren(yapraklar);

  if (ilk) {
    // Kino karışık dizmiş: eksik rakamlar yanlış yerde, yamuk; tırmanırken karışıp düşer
    const karisik = [...t.eksik].reverse();
    const kinoRakamlari = t.eksik.map((k, i) => {
      const p = plaka(karisik[i]);
      p.classList.add('ok-yamuk');
      basamaklar[k - 1].append(p);
      return p;
    });
    await s.soyle(M.giris);
    const orta = basamaklar[Math.floor(t.n / 2)];
    const [x, y] = s.efekt.merkez(orta, 0.5, 1);
    await s.kinoGit(x, y, 800);
    await s.kinoHata({
      kino: O.kino.karisik,
      poz: 'kalk',
      sonra: async () => {
        // yumuşakça yapraklara düşer; rakamlar dökülür
        ses.pof();
        kinoRakamlari.forEach((p) => p.classList.add('ok-dokul'));
        await s.kinoDon(500);
        s.kinoIfade('saskin', 1000);
        kinoRakamlari.forEach((p) => p.remove());
      },
    });
    await s.soyle(M.sirayla);
  }
  const dusenler = s.karistir(t.eksik).map((n) => {
    const b = rakamKarti(n, 'ok-dusen');
    yapraklar.append(b);
    oynat(b, 'ok-dus-gel');
    return b;
  });
  await s.soyle(M.yerlestir);
  s.adim('surukle');

  let kalan = dusenler.length;
  let mesgul = false;
  await new Promise<void>((coz) => {
    for (const b of dusenler) {
      const n = Number(b.dataset.sayi);
      const ipucu = new Ipucu(() => [b, basamaklar[n - 1]]);
      const kapat = hedefliSurukle({
        el: b,
        hedefler: () => basamaklar.filter((x) => !x.querySelector('.ok-plaka, .ok-rakam')),
        aktif: () => !mesgul && !b.dataset.yerinde && !s.kapandi(),
        birak: async (yer) => {
          if (!yer) return geriGonder(b);
          const k = Number(yer.dataset.basamak);
          if (basamakUyar(n, k)) {
            b.dataset.yerinde = '1';
            ipucu.sifirla();
            tasi(b, yer);
            b.style.transform = '';
            ses.tik();
            oynat(yer, 'ok-yapis');
            void s.say(n);
            kalan--;
            if (kalan === 0) coz();
            return;
          }
          mesgul = true;
          geriGonder(b);
          s.nazik(yer);
          ipucu.yanlis();
          // Mino 1'den o basamağa kadar sayar: burası kaçıncı basamak?
          await s.sayarak(k, (i) => oynat(basamaklar[i - 1], 'ok-parla'));
          mesgul = false;
        },
      });
      s.kapaninca(kapat);
    }
  });
  await s.bekle(300);
  await s.soyle(M.hazir);
  // Kino sayarak tırmanır, elmayı alır
  const tepe = basamaklar[t.n - 1];
  const [tx, ty] = s.efekt.merkez(tepe, 0.5, 1);
  void s.kinoGit(tx, ty, 1400);
  await s.sayarak(t.n, (i) => oynat(basamaklar[i - 1], 'ok-parla'));
  elma.classList.add('ok-alindi');
  await s.kinoHata({ kino: O.kino.elma, poz: 'kalk' });
  await s.kinoDon();
  await s.ovgu(merdiven);
  s.secim.replaceChildren();
}

etkinlikKaydet({
  id: 'merdiven',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler.merdiven,
  async oyna(s) {
    const turlar = merdivenTurlari(s.yas, s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
