/**
 * Etkinlik 7 · Kaç alkış? (sayıyı sese çevirme). Mino rakam kartı gösterir: "Dört kere alkışla!" Her alkışta (ya da
 * davula dokununca) bir kuş havalanır, bir nokta yanar; sayı tamamlanınca kuşlar dans eder. Fazla alkışta fazladan
 * kuş "hı?" diye geri konar: "Bir fazla oldu!" (ceza yok). Kino durmadan alkışlar: "Kino, sayarak!"
 *
 * Alkış: mevcut algılayıcı (orman/src/gorev.ts → Alkis, ses-testi eşikleri; DEĞİŞTİRİLMEZ, ekip/SES-SISTEMI.md).
 * Mikrofon yalnız çocuk mikrofon düğmesine basınca açılır; davul her zaman çalışır (dokunma karşılığı).
 */
import O from '../../../content/okul.json';
import { Alkis } from '../../../orman/src/gorev';
import { kulak } from '../../../orman/src/kulak';
import { h, svg, TEST_MODU } from '../../../src/ui/dom';
import { gorsel, kus } from '../cizim';
import { Dallar, kusBoyu } from '../dal';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { rakamKarti, type Sahne } from '../sahne';
import { alkisDurumu, alkisTurlari, kalipDoldur } from '../sayi';
import { ses } from '../sesler';

const M = O.mino.alkis;
/** seri bitti sayılan sessizlik (alkış dizisinin sonu) */
const BITIS_MS = 1500;
const MIKROFON = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><rect x="17" y="6" width="14" height="24" rx="7" fill="currentColor"/><path d="M10 22a14 14 0 0 0 28 0M24 36v6M17 42h14"/></svg>';

async function tur(s: Sahne, hedef: number, ilk: boolean, mik: { acik: () => boolean }) {
  const kart = rakamKarti(hedef, 'ok-e7-kart');
  kart.disabled = true;
  const noktalar = Array.from({ length: hedef }, () => h('i'));
  const kuslar = Array.from({ length: hedef + 2 }, (_, i) => h('span.ok-kus', { style: `--i:${i}`, html: kus(i) }));
  const dallar = new Dallar('ok-e7-dal');
  const e7 = h('div.ok-e7', {}, h('div.ok-e7-ust', {}, kart, h('div.ok-e7-noktalar', {}, ...noktalar)), dallar.el);
  s.alan.replaceChildren(e7);
  // kuşlar dala konar (dal düzeni kuş sayısına ve ekran enine göre; ekran yerleşince ölçülür)
  await s.bekle(30);
  dallar.duzenle(kuslar.length, e7.getBoundingClientRect().width || 360, kusBoyu(e7));
  kuslar.forEach((k, i) => dallar.tunek(i).append(k));

  if (ilk) {
    await s.soyle(M.giris);
    await s.kinoHata({
      kino: O.kino.alkis,
      poz: 'kalk',
      once: async () => {
        s.kinoOynat('dans', 1800);
        for (let i = 0; i < 8; i++) {
          kulak.sustur(400);
          ses.alkis();
          oynat(kuslar[i % kuslar.length], 'ok-irkil');
          await s.bekle(170);
        }
      },
      mino: M.kino_dur,
    });
    await s.soyle(M.davul);
  }
  await s.soyle(kalipDoldur(O.kalip.alkis, hedef));
  s.adim('alkis');
  s.el.dataset.hedef = String(hedef);
  s.el.dataset.alkis = '0';

  let sayi = 0;
  let zaman = 0;
  let bitti = false;
  await new Promise<void>((coz) => {
    const degerlendir = async () => {
      const d = alkisDurumu(hedef, sayi);
      if (d === 'eksik' || bitti) return;
      bitti = true;
      dinleyici.vur = null;
      if (d === 'fazla') {
        await s.soyle(M.fazla);
        kuslar.slice(hedef).forEach((k) => k.classList.remove('ok-havada', 'ok-geri-kon'));
      }
      kuslar.slice(0, hedef).forEach((k, i) => k.style.setProperty('--j', String(i)));
      kuslar.slice(0, hedef).forEach((k) => k.classList.add('ok-dans'));
      s.mino.tepki('dans', 1.6);
      s.kinoOynat('dans', 1600);
      await s.soyle(M.dans);
      await s.ovgu(kart);
      coz();
    };
    const vur = () => {
      if (bitti || s.kapandi()) return;
      sayi++;
      s.el.dataset.alkis = String(sayi);
      const k = kuslar[sayi - 1];
      if (sayi <= hedef) {
        noktalar[sayi - 1].classList.add('yandi');
        k?.classList.add('ok-havada');
        if (!mik.acik()) {
          ses.cik(sayi);
          void s.say(sayi);
        }
      } else if (k) {
        // fazladan kuş havalanır, "hı?" deyip geri konar
        k.classList.add('ok-havada', 'ok-geri-kon');
      }
      clearTimeout(zaman);
      zaman = window.setTimeout(() => void degerlendir(), TEST_MODU ? 120 : BITIS_MS);
    };
    dinleyici.vur = vur;
  });
  clearTimeout(zaman);
}

/** Davul ve mikrofon tek yere bağlanır: o anki turun vur'u */
const dinleyici: { vur: (() => void) | null } = { vur: null };

etkinlikKaydet({
  id: 'kac-alkis',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler['kac-alkis'],
  async oyna(s) {
    // davul (dokunma karşılığı) ve mikrofon düğmesi (isteğe bağlı)
    const davul = h('button.ok-davul', { type: 'button', 'aria-label': 'Davul' }, h('img', { src: gorsel('orman-esya/davul'), alt: '', draggable: 'false' }));
    davul.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      kulak.sustur(250);
      ses.davul();
      oynat(davul, 'ok-vur');
      dinleyici.vur?.();
    });
    const mikDugme = h('button.yuvarlak.ok-mik', { type: 'button', 'aria-label': O.arayuz.mikrofon }, svg(MIKROFON));
    let mikAcik = false;
    const alkis = new Alkis(kulak.ayar);
    alkis.onAlkis = () => dinleyici.vur?.();
    mikDugme.addEventListener('click', async () => {
      if (mikAcik) {
        mikAcik = false;
        kulak.dinle(null);
        mikDugme.classList.remove('acik');
        return;
      }
      if (TEST_MODU || !(await kulak.ac())) {
        mikDugme.hidden = true;
        return;
      }
      mikAcik = true;
      mikDugme.classList.add('acik');
      kulak.dinle((o) => alkis.kare(o));
    });
    if (!navigator.mediaDevices?.getUserMedia) mikDugme.hidden = true;
    s.kapaninca(() => {
      dinleyici.vur = null;
      kulak.dinle(null);
      kulak.kapat();
    });

    const turlar = alkisTurlari(s.yas, s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      s.secim.replaceChildren(h('div.ok-e7-alt', {}, davul, mikDugme));
      await tur(s, turlar[i], i === 0, { acik: () => mikAcik });
    }
    s.tur(turlar.length);
    s.secim.replaceChildren();
  },
});
