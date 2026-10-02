/**
 * Etkinlik 5 · Bir fazla, bir eksik (+1 / −1). Oyuncak trenin vagonlarında hayvanlar oturuyor. "Trende üç vagon var.
 * Bir fazlası kaç?" Çocuk depodaki vagonu trene sürükleyip ekler, vagonlar yeniden sayılır: "Dört!" Eksik turunda son
 * vagonu ayırıp depoya götürür. Kino raylara biner: "Ben de vagonum!" Mino: "Kino vagon değil!"
 * 3-4 yaş yalnız "bir fazla" (1-5), 5-6 yaş ikisi.
 */
import O from '../../../content/okul.json';
import { h, TEST_MODU } from '../../../src/ui/dom';
import { gorsel, ISTASYON, LOKOMOTIF, vagon, YOLCULAR } from '../cizim';
import { oynat, tasi } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { Ipucu, type Sahne } from '../sahne';
import { kalipDoldur, trenSonucu, trenTurlari, type TrenTuru } from '../sayi';
import { ses } from '../sesler';
import { geriGonder, hedefliSurukle } from '../surukle';

const M = O.mino.bir_fazla;

function vagonEl(i: number): HTMLElement {
  return h(
    'div.ok-vagon',
    { 'data-i': String(i), style: `--i:${i}` },
    h('span.ok-vagon-yolcu', {}, h('img', { src: gorsel(`hayvanlar/${YOLCULAR[i % YOLCULAR.length]}`), alt: '', draggable: 'false' })),
    h('span.ok-vagon-resim', { html: vagon(i) }),
    h('b.ok-rozet-sayi'),
  );
}

async function tur(s: Sahne, t: TrenTuru, ilk: boolean) {
  const sonuc = trenSonucu(t);
  const vagonlar = Array.from({ length: t.bas }, (_, i) => vagonEl(i));
  const yuva = h('div.ok-tren-yuva', { 'aria-hidden': 'true' });
  const tren = h('div.ok-tren', {}, h('div.ok-lokomotif', { html: LOKOMOTIF() }), ...vagonlar);
  if (t.tur === 'fazla') tren.append(yuva);
  const depo = h('div.ok-depo', {}, h('span.ok-depo-resim', { html: ISTASYON() }));
  const ekVagon = t.tur === 'fazla' ? vagonEl(t.bas) : null;
  if (ekVagon) {
    ekVagon.classList.add('ok-depo-vagon');
    depo.append(ekVagon);
  }
  const ray = h('div.ok-ray', {}, tren);
  const kok = h('div.ok-e5', { style: `--n:${Math.max(t.bas, sonuc)}` }, ray, depo);
  s.alan.replaceChildren(kok);

  const vagonlariSay = async (n: number) => {
    const el = [...tren.querySelectorAll<HTMLElement>('.ok-vagon')];
    el.forEach((v) => {
      const b = v.querySelector('b');
      if (b) b.textContent = '';
    });
    await s.sayarak(n, (i) => {
      const v = el[i - 1];
      oynat(v, 'ok-zipla');
      const b = v?.querySelector('b');
      if (b) b.textContent = String(i);
    });
  };

  if (ilk) await s.soyle(M.giris);
  await vagonlariSay(t.bas);
  await s.soyle(kalipDoldur(O.kalip.vagon, t.bas));
  if (ilk) {
    // Kino raylara biner
    const [x, y] = s.efekt.merkez(t.tur === 'fazla' ? yuva : tren, t.tur === 'fazla' ? 0.5 : 1, 1);
    await s.kinoGit(x + (t.tur === 'fazla' ? 0 : 30), y);
    await s.kinoHata({ kino: O.kino.vagon, poz: 'kalk', mino: M.kino_in });
    await s.kinoDon();
  }
  await s.soyle(t.tur === 'fazla' ? M.fazla : M.eksik);
  s.adim('surukle');

  let mesgul = false;
  await new Promise<void>((coz) => {
    const surukle = t.tur === 'fazla' ? ekVagon! : vagonlar[vagonlar.length - 1];
    const hedef = t.tur === 'fazla' ? yuva : depo;
    surukle.dataset.surukle = '1';
    hedef.dataset.hedef = '1';
    if (TEST_MODU) kok.dataset.sonuc = String(sonuc);
    const ipucu = new Ipucu(() => [surukle, hedef]);
    const kapat = hedefliSurukle({
      el: surukle,
      hedefler: () => [hedef],
      aktif: () => !mesgul && !s.kapandi(),
      birak: async (yer) => {
        if (!yer) {
          geriGonder(surukle);
          s.nazik(surukle);
          ipucu.yanlis();
          return;
        }
        mesgul = true;
        ipucu.sifirla();
        delete surukle.dataset.surukle;
        if (t.tur === 'fazla') {
          surukle.classList.remove('ok-depo-vagon');
          tasi(surukle, tren);
          yuva.remove();
        } else {
          surukle.querySelector('b')!.textContent = '';
          tasi(surukle, depo);
        }
        surukle.style.transform = '';
        ses.tik();
        await s.bekle(400);
        await vagonlariSay(sonuc);
        await s.say(sonuc);
        ses.duduk();
        tren.classList.add('ok-gidiyor');
        await s.ovgu(tren);
        coz();
      },
    });
    s.kapaninca(kapat);
  });
}

etkinlikKaydet({
  id: 'bir-fazla',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler['bir-fazla'],
  async oyna(s) {
    const turlar = trenTurlari(s.yas, s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
