/**
 * Kino'nun odası: istek → perde → pencere (hava, mevsim ağacı) → dolap → giyinme (tepkiler) → ayna → kapı.
 *
 * Dünya (oda) ekrandan geniştir: kapı solda, ekran dışında bekler; Kino hazır olunca kamera kapıya kayar.
 * Yerleşim JS'te (ekran boyuna göre px): yatay telefon, dikey telefon ve tablet aynı mantıkla.
 * Bütün hareketler transform / opacity; dokunma hiçbir animasyonda kilitlenmez (sürükleme her an çalışır).
 */
import { efekt } from '../../src/audio/efekt';
import { konus, KINO_SESI } from '../../src/audio/konusma';
import { h, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import G from '../../content/giysin.json';
import { AZ, bekle, kavis, ms, oynat, YAY, YUMUSAK } from './anim';
import { GiyinikKino } from './giyinik';
import { BOLGE_MERKEZ, birak, bolgeUzakligi, eksikler, giysi, GIYSILER, MIKNATIS, siradaki, type GiysiId } from './model';
import { onYukle, resim } from './resimler';

const M = G.mino;
const K = G.kino;
const kinoSoyle = (t: string) => konus(t, KINO_SESI);

type Adim = 'giris' | 'perde' | 'dolap' | 'giyin' | 'ayna' | 'kapi' | 'cikis';

/** Kar taneleri (kodla: yumuşak beyaz daireler; transform ile düşer, döner) */
function karKatmani(adet: number, sinif: string): HTMLElement {
  const k = h(`div.gy-kar.${sinif}`, { 'aria-hidden': 'true' });
  for (let i = 0; i < adet; i++) {
    const boy = sinif === 'yakin' ? 10 + Math.random() * 10 : 5 + Math.random() * 6;
    const t = h('i', {
      style: `left:${(Math.random() * 100).toFixed(1)}%;width:${boy.toFixed(0)}px;--b:${boy.toFixed(0)}px;--sure:${(sinif === 'yakin' ? 5 + Math.random() * 3 : 8 + Math.random() * 5).toFixed(1)}s;--gec:-${(Math.random() * 12).toFixed(1)}s;--salin:${(10 + Math.random() * 26).toFixed(0)}px`,
    });
    k.append(t);
  }
  return k;
}

/** Perde kanadı: 7 dikey şerit (kumaş dalgası her şeride ayrı gecikmeyle) */
function perdeKanadi(yan: 'sol' | 'sag'): { el: HTMLElement; seritler: HTMLElement[] } {
  const N = 7;
  const seritler: HTMLElement[] = [];
  const el = h(`div.gy-perde.gy-perde-${yan}`);
  for (let i = 0; i < N; i++) {
    const s = h('div.gy-serit', {
      style: `left:${((i * 100) / N).toFixed(3)}%;width:${(100 / N + 0.6).toFixed(3)}%;background-image:url("${resim('perde')}");background-size:${N * 100}% 100%;background-position:${((i * 100) / (N - 1)).toFixed(3)}% 0`,
    });
    seritler.push(s);
    el.append(s);
  }
  return { el, seritler };
}

export function odaEkrani(app: Uygulama): Ekran {
  onYukle(['dis-kis-yatay', 'dis-kis-dikey', 'dolap-acik', 'kardan-buyuk', 'kardan-orta', 'ayna']);
  const kapatilacak: (() => void)[] = [];
  const zaman: number[] = [];
  const sonra = (n: number, f: () => void) => zaman.push(window.setTimeout(f, ms(n)));
  let adim: Adim = 'giris';
  let bitti = false;

  // ------------------------------------------------------------ öğeler
  const oda = h('img.gy-oda', { src: resim('oda-yatay'), alt: '', draggable: 'false' });
  // pencere manzarası üç katman (Gemini): arkada gök ve tepeler, ortada çit ve çalılar, önde mevsim ağacı
  const manzara = h('img.gy-manzara.arka', { src: resim('pencere-kis-arka'), alt: '', draggable: 'false' });
  const orta = h('img.gy-manzara.orta', { src: resim('pencere-kis-orta'), alt: '', draggable: 'false' });
  const agac = h('img.gy-manzara.gy-agac', { src: resim('pencere-kis-on'), alt: 'Kış ağacı', draggable: 'false' });
  const karUzak = karKatmani(26, 'uzak');
  const karYakin = karKatmani(14, 'yakin');
  const bugu = h('div.gy-bugu');
  const camIc = h('div.gy-cam-ic', {}, h('div.gy-katman.gy-k-gok', {}, manzara), karUzak, h('div.gy-katman.gy-k-orta', {}, orta), h('div.gy-katman.gy-k-agac', {}, agac), karYakin, bugu);
  const cam = h('div.gy-cam', {}, camIc);
  const perdeSol = perdeKanadi('sol');
  const perdeSag = perdeKanadi('sag');
  const perdeler = h('div.gy-perdeler', {}, perdeSol.el, perdeSag.el);
  const pencere = h('div.gy-pencere', {}, cam, h('img.gy-pencere-cerceve', { src: resim('pencere'), alt: '', draggable: 'false' }), perdeler, h('div.gy-isaret.gy-isaret-perde'));

  const kapiKanat = h('img.gy-kapi-kanat', { src: resim('kapi-kanat'), alt: '', draggable: 'false' });
  const kapiIsik = h('div.gy-kapi-isik');
  const kapi = h('button.gy-kapi', { type: 'button', 'aria-label': 'Kapı' }, kapiIsik, h('div.gy-kapi-mentese', {}, kapiKanat), h('img.gy-kapi-cerceve', { src: resim('kapi-cerceve'), alt: '', draggable: 'false' }), h('div.gy-isaret.gy-isaret-kapi'));

  const kapakSol = h('img.gy-kapak.gy-kapak-sol', { src: resim('dolap-kapak-sol'), alt: '', draggable: 'false' });
  const kapakSag = h('img.gy-kapak.gy-kapak-sag', { src: resim('dolap-kapak-sag'), alt: '', draggable: 'false' });
  const dolapAcik = h('img.gy-dolap-acik', { src: resim('dolap-acik'), alt: '', draggable: 'false' });
  const dolapKapali = h('img.gy-dolap-kapali', { src: resim('dolap-kapali'), alt: '', draggable: 'false' });
  const raf = h('div.gy-raf');
  // açılırken kapakların arkasında iç (yana açılmış kapaklar yok); kapaklar dönünce tam açık resim
  const dolapIc = h('img.gy-dolap-ic', { src: resim('dolap-ic'), alt: '', draggable: 'false' });
  const dolap = h('div.gy-dolap', { role: 'button', 'aria-label': 'Dolap' }, dolapIc, dolapAcik, dolapKapali, h('div.gy-kapak-yer.sol', {}, kapakSol), h('div.gy-kapak-yer.sag', {}, kapakSag), h('div.gy-isaret.gy-isaret-dolap'));

  const kino = new GiyinikKino();
  const parilti = h('div.gy-miknatis');
  const buz = h('img.gy-buz', { src: resim('buz'), alt: '', draggable: 'false' });
  const yanakSol = h('i.gy-yanak.sol');
  const yanakSag = h('i.gy-yanak.sag');
  const ekler = h('div.gy-kino-ekler', {}, parilti, yanakSol, yanakSag, buz);
  // titreyen Kino pozu (Gemini, iskelete hizalı): giyinmeden pencereye bakınca bir an iskeletin yerine geçer
  const titremePoz = h('img.gy-poz', { src: resim('kino-titreme'), alt: '', draggable: 'false' });
  const kinoKutu = h('div.gy-kino-kutu', {}, kino.el, titremePoz, ekler);
  const kinoYer = h('div.gy-kino-yer', {}, kinoKutu);

  // düşünce balonu: istek resimle (kardan adam)
  const balon = h(
    'div.gy-balon',
    { 'aria-hidden': 'true' },
    h('i.gy-balon-k1'),
    h('i.gy-balon-k2'),
    h('div.gy-balon-ic', {}, h('img.b1', { src: resim('kardan-buyuk'), alt: '' }), h('img.b2', { src: resim('kardan-orta'), alt: '' }), h('img.b3', { src: resim('kardan-kucuk'), alt: '' }), h('img.b4', { src: resim('kardan-havuc'), alt: '' })),
  );

  // ayna anı: ayna aşağıdan kayar, içinde Kino'nun yansıması
  const yansima = new GiyinikKino();
  // yansıma çerçevenin camının üstünde (camın oval kırpımıyla), yarı saydam: camın mavisi ve parıltısı görünür
  const ayna = h('div.gy-ayna', { 'aria-hidden': 'true' }, h('img.gy-ayna-cerceve', { src: resim('ayna'), alt: '' }), h('div.gy-ayna-cam', {}, h('div.gy-yansima', {}, yansima.el), h('i.gy-ayna-parilti')));

  const dunya = h('div.gy-dunya', {}, oda, kapi, pencere, dolap, kinoYer, ayna);
  const surukleKat = h('div.gy-surukle-kat');
  const flas = h('div.gy-beyaz');
  const cikis = app.secenekler.cikis;
  const geri = cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : h('div', { style: 'width:56px' });
  const albumD = yuvarlakDugme(IKON.album, G.yazi.album, () => app.git('album'), 'kucuk gy-album-dugme');
  const el = h('div.gy-ekran', {}, dunya, balon, h('div.gy-ust', {}, geri, albumD), surukleKat, flas);
  el.dataset.adim = adim;
  const adimaGec = (a: Adim) => {
    adim = a;
    el.dataset.adim = a;
  };

  // ------------------------------------------------------------ yerleşim (px)
  let W = 0, H = 0, dikey = false, kapiPay = 0, kinoS = 0;
  function yerlesim() {
    W = el.clientWidth || innerWidth;
    H = el.clientHeight || innerHeight;
    dikey = H > W * 1.1;
    oda.src = resim(dikey ? 'oda-dikey' : 'oda-yatay');
    const u = dikey ? W : Math.min(H, W * 0.5);
    const kh = dikey ? H * 0.46 : H * 0.8;
    // kapı bu payın içinde (açılışta ekranın dışında; kamera kayınca görünür)
    kapiPay = Math.max(dikey ? W * 0.62 : W * 0.36, kh * 0.5 + W * 0.16);
    const DW = W + kapiPay;
    Object.assign(dunya.style, { width: `${DW}px`, height: `${H}px` });
    const kutu = (e: HTMLElement, x: number, y: number, w: number, hh: number) => Object.assign(e.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${hh}px` });
    // oda resmi dünyayı kaplar (yatayda tam en, dikeyde tam boy)
    const or = dikey ? 1080 / 1920 : 1920 / 1072;
    const ow = Math.max(DW, H * or), oh = ow / or;
    kutu(oda, (DW - ow) / 2, Math.min(0, H - oh), ow, oh);
    const zemin = H * (dikey ? 0.84 : 0.9);
    // kapı (dünyanın solunda)
    kutu(kapi, (kapiPay - kh * 0.5) * 0.45, zemin - kh, kh * 0.5, kh);
    if (dikey) {
      // dikey: üstte pencere, solda Kino, sağda dolap (giysiler iki sütun)
      const pw = W * 0.5;
      kutu(pencere, kapiPay + W * 0.06, H * 0.09, pw, pw / 0.778);
      kinoS = Math.min(W * 0.66, H * 0.34);
      kutu(kinoYer, kapiPay + W * 0.27 - kinoS / 2, zemin - kinoS * 0.93, kinoS, kinoS);
      const dw = Math.min(W * 0.88, H * 0.5);
      kutu(dolap, kapiPay + W * 0.98 - dw * 0.83, zemin + H * 0.09 - dw, dw, dw);
    } else {
      const ph = u * 0.7;
      kutu(pencere, kapiPay + W * 0.025, H * 0.07, ph * 0.778, ph);
      kinoS = u * 0.86;
      kutu(kinoYer, kapiPay + W * 0.47 - kinoS / 2, zemin - kinoS * 0.93, kinoS, kinoS);
      const dh = u * 0.96;
      kutu(dolap, kapiPay + W - dh * 0.86, H - dh - H * 0.01, dh, dh);
    }
    const kr = kinoYer.getBoundingClientRect();
    void kr;
    // ayna: Kino'nun yanında, aşağıdan kayıp gelir
    const ah = kinoS * 1.05;
    kutu(ayna, parseFloat(kinoYer.style.left) + (dikey ? kinoS * 0.62 : kinoS * 0.86), zemin - ah * 0.98, ah * 0.5, ah);
    dunyaKonum(false);
    rafYerlesim();
  }
  let kameraKapida = false;
  function dunyaKonum(anim: boolean) {
    const x = kameraKapida ? 0 : -kapiPay;
    if (anim) void oynat(dunya, [{ transform: getComputedStyle(dunya).transform }, { transform: `translateX(${x}px)` }], 1300, { easing: YUMUSAK, fill: 'forwards' }).then(() => (dunya.style.transform = `translateX(${x}px)`));
    else dunya.style.transform = `translateX(${x}px)`;
  }

  // ------------------------------------------------------------ dolaptaki giysiler
  // dizilim: üstte askıdakiler (sallanır), ortada raf, altta ayakkabılar
  const DIZI: GiysiId[] = ['mont', 'atki', 'sort', 'bere', 'gozluk', 'eldiven', 'corap', 'bot'];
  const ikonlar = new Map<GiysiId, HTMLElement>();
  for (const id of DIZI) {
    const askida = ['mont', 'atki', 'sort'].includes(id);
    const b = h(`button.gy-giysi${askida ? '.askida' : ''}`, { type: 'button', 'aria-label': G.giysi[id], 'data-giysi': id }, h('img', { src: resim(`ikon/${id}`), alt: '', draggable: 'false' }));
    ikonlar.set(id, b);
    raf.append(b);
  }
  el.append(raf);
  function rafYerlesim() {
    const r = { x: parseFloat(dolap.style.left) - (kameraKapida ? 0 : kapiPay), y: parseFloat(dolap.style.top), w: parseFloat(dolap.style.width), h: parseFloat(dolap.style.height) };
    // giysiler dolabın iç alanından biraz taşar: büyük, net (4-5 yaş parmağı)
    if (dikey) {
      // dikey telefon: sağ yarıda iki sütun × dört sıra (dolabın önünde ve üstünde), iri
      const sx = r.x + r.w * 0.14, sw = r.w * 0.72, sy = r.y + r.h * 0.04, sh = r.h * 0.92;
      const boy = Math.min(sw / 2.15, sh / 4.2, 130);
      DIZI.forEach((id, i) => {
        const x = sx + (sw * ((i % 2) + 0.5)) / 2;
        const y = sy + (sh * (Math.floor(i / 2) + 0.5)) / 4;
        Object.assign(ikonlar.get(id)!.style, { left: `${x - boy / 2}px`, top: `${y - boy / 2}px`, width: `${boy}px`, height: `${boy}px` });
      });
      return;
    }
    const ix = r.x + r.w * 0.1, iw = r.w * 0.8;
    const iy = r.y + r.h * 0.1, ih = r.h * 0.8;
    const boy = Math.min(iw / 2.75, ih / 3.05, 150);
    DIZI.forEach((id, i) => {
      const sira = i < 3 ? 0 : i < 6 ? 1 : 2;
      const kolon = i < 3 ? i : i < 6 ? i - 3 : i - 6;
      const adet = sira === 2 ? 2 : 3;
      const x = ix + (iw * (kolon + 0.5)) / adet;
      const y = iy + (ih * (sira + 0.5)) / 3;
      Object.assign(ikonlar.get(id)!.style, { left: `${x - boy / 2}px`, top: `${y - boy / 2}px`, width: `${boy}px`, height: `${boy}px` });
    });
  }

  // ------------------------------------------------------------ konuşma ve tepki
  let konusma = Promise.resolve();
  const mino = (t: string) => (konusma = konus(t));
  const kinoDe = (t: string) => (konusma = kinoSoyle(t));
  /** Kino'nun kutusu: esneme / zıplama (alt-orta eksen) */
  const zipla = (yuk = 1) =>
    oynat(kinoKutu, [
      { transform: 'none' },
      { transform: `translateY(0) scale(${1 + 0.06 * yuk}, ${1 - 0.08 * yuk})`, offset: 0.18 },
      { transform: `translateY(${-14 * yuk}%) scale(${1 - 0.05 * yuk}, ${1 + 0.07 * yuk})`, offset: 0.48 },
      { transform: `translateY(0) scale(${1 + 0.07 * yuk}, ${1 - 0.07 * yuk})`, offset: 0.78 },
      { transform: 'none' },
    ], 620, { easing: 'linear' });
  const sendele = () =>
    oynat(kinoKutu, [
      { transform: 'none' },
      { transform: 'rotate(-7deg) translateX(-3%)', offset: 0.25 },
      { transform: 'rotate(6deg) translateX(3%)', offset: 0.55 },
      { transform: 'rotate(-3deg)', offset: 0.8 },
      { transform: 'none' },
    ], 900, { easing: 'ease-in-out' });

  /** Kino titrer: buz sarkıtı, mavi yanaklar, takırdayan dişler */
  async function usu() {
    kino.k.ifade('titreme', 2200);
    kino.titreme = 1;
    void oynat(yanakSol, [{ opacity: 0 }, { opacity: 0.85 }], 300, { fill: 'forwards' });
    void oynat(yanakSag, [{ opacity: 0 }, { opacity: 0.85 }], 300, { fill: 'forwards' });
    void oynat(buz, [
      { transform: 'scale(0.2, 0)', opacity: 0 },
      { transform: 'scale(1.15, 1.2)', opacity: 1, offset: 0.6 },
      { transform: 'scale(0.95, 0.94)', offset: 0.8 },
      { transform: 'scale(1)', opacity: 1 },
    ], 700, { delay: ms(250), fill: 'forwards', easing: 'ease-out' });
    void oynat(kinoKutu, [{ transform: 'scale(1)' }, { transform: 'scale(0.95, 0.93)' }, { transform: 'scale(0.95, 0.93)' }, { transform: 'scale(1)' }], 2200, { easing: 'ease-in-out' });
    efekt.dagit();
    void kinoDe(K.brrr);
    await bekle(1500);
    kino.titreme = 0;
    // buz damla gibi düşer, yanaklar söner
    void oynat(buz, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'translateY(30%) scale(0.9)', opacity: 1, offset: 0.3 }, { transform: 'translateY(160%) scale(0.6)', opacity: 0 }], 520, { fill: 'forwards', easing: 'cubic-bezier(.5,0,.9,.5)' });
    void oynat(yanakSol, [{ opacity: 0.85 }, { opacity: 0 }], 500, { fill: 'forwards' });
    void oynat(yanakSag, [{ opacity: 0.85 }, { opacity: 0 }], 500, { fill: 'forwards' });
  }

  /** Sıcacık: Kino kendini sarar (büzülüp şişer), gözler keyifle kapanır */
  async function sicacik() {
    kino.k.ifade('keyif', 1800);
    void oynat(kinoKutu, [
      { transform: 'none' },
      { transform: 'scale(0.94, 0.95) rotate(-2deg)', offset: 0.3 },
      { transform: 'scale(1.04, 1.03) rotate(2deg)', offset: 0.65 },
      { transform: 'none' },
    ], 1400, { easing: 'ease-in-out' });
    kalpler();
    void kinoDe(K.sicacik);
    await bekle(1300);
  }
  function kalpler() {
    for (let i = 0; i < 5; i++) {
      const k = h('i.gy-kalp', { style: `left:${30 + Math.random() * 40}%;top:${30 + Math.random() * 20}%` });
      ekler.append(k);
      void oynat(k, [{ transform: 'translateY(0) scale(0.3)', opacity: 0 }, { transform: 'translateY(-40%) scale(1)', opacity: 1, offset: 0.3 }, { transform: `translate(${(Math.random() - 0.5) * 80}px, -260%) scale(0.8)`, opacity: 0 }], 1300, { delay: ms(i * 120), easing: 'ease-out' }).then(() => k.remove());
    }
  }

  // ------------------------------------------------------------ sürükleme
  let tasinan: { id: GiysiId; el: HTMLElement; kaynak: HTMLElement; dx: number; dy: number; x: number; y: number; t0: number; x0: number; y0: number } | null = null;
  let mesgul = false;
  let sonHareket = performance.now();
  let ipucuId: GiysiId | null = null;

  /** ekran noktası → Kino tuvali (2048) */
  function tuvalde(x: number, y: number) {
    const r = kino.el.getBoundingClientRect();
    return { x: ((x - r.left) / r.width) * 2048, y: ((y - r.top) / r.height) * 2048 };
  }
  function ekranda(tx: number, ty: number) {
    const r = kino.el.getBoundingClientRect();
    return { x: r.left + (tx / 2048) * r.width, y: r.top + (ty / 2048) * r.height };
  }
  function miknatisGoster(id: GiysiId | null, x = 0, y = 0) {
    if (!id) {
      parilti.classList.remove('acik');
      return;
    }
    const g = giysi(id);
    const t = tuvalde(x, y);
    if (bolgeUzakligi(g.bolge, t.x, t.y) <= MIKNATIS) {
      const m = BOLGE_MERKEZ[g.bolge].reduce((a, b) => (Math.hypot(a[0] - t.x, a[1] - t.y) < Math.hypot(b[0] - t.x, b[1] - t.y) ? a : b));
      parilti.style.left = `${(m[0] / 2048) * 100}%`;
      parilti.style.top = `${(m[1] / 2048) * 100}%`;
      parilti.classList.add('acik');
    } else parilti.classList.remove('acik');
  }

  function surukleBasla(id: GiysiId, e: PointerEvent) {
    // tepki oynarken de yeni giysi sürüklenebilir (dokunma hiç kilitlenmez)
    if (adim !== 'giyin' || tasinan) return;
    const kaynak = ikonlar.get(id)!;
    const r = kaynak.getBoundingClientRect();
    const kopya = h('div.gy-tasinan', { style: `width:${r.width}px;height:${r.height}px` }, h('img', { src: resim(`ikon/${id}`), alt: '', draggable: 'false' }));
    surukleKat.append(kopya);
    tasinan = { id, el: kopya, kaynak, dx: e.clientX - (r.left + r.width / 2), dy: e.clientY - (r.top + r.height / 2), x: e.clientX, y: e.clientY, t0: performance.now(), x0: e.clientX, y0: e.clientY };
    kaynak.classList.add('bos');
    kaynak.classList.remove('ipucu');
    efekt.secim();
    tasi(e.clientX, e.clientY, true);
    sonHareket = performance.now();
  }
  function tasi(x: number, y: number, ilk = false) {
    if (!tasinan) return;
    tasinan.x = x;
    tasinan.y = y;
    // parmağın biraz üstünde dursun (parmak giysiyi örtmesin)
    const cx = x - tasinan.dx * 0.4, cy = y - tasinan.dy * 0.4 - (ilk ? 0 : 18);
    tasinan.el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${ilk ? 1.05 : 1.22}) rotate(${Math.max(-12, Math.min(12, (x - tasinan.x0) * 0.04))}deg)`;
    miknatisGoster(tasinan.id, cx, cy);
  }
  async function birakIslem() {
    const t = tasinan;
    if (!t) return;
    tasinan = null;
    miknatisGoster(null);
    sonHareket = performance.now();
    const cx = t.x - t.dx * 0.4, cy = t.y - t.dy * 0.4 - 18;
    // dokunup bırakmak (sürüklemeden): adını söyler; ipucundaysa kendiliğinden uçar
    if (performance.now() - t.t0 < 300 && Math.hypot(t.x - t.x0, t.y - t.y0) < 12) {
      if (ipucuId === t.id) {
        const m = BOLGE_MERKEZ[giysi(t.id).bolge][0];
        const hedef = ekranda(m[0], m[1]);
        await kavis(t.el, { x: cx, y: cy }, hedef, 520, { s0: 1, s1: 0.9 });
        await sonuc(t, hedef.x, hedef.y);
        return;
      }
      void konus(G.giysi[t.id]);
      await geriGonder(t.el, t.kaynak, { x: cx, y: cy });
      return;
    }
    await sonuc(t, cx, cy);
  }

  async function geriGonder(kopya: HTMLElement, kaynak: HTMLElement, a: { x: number; y: number }) {
    const r = kaynak.getBoundingClientRect();
    efekt.ucus();
    await kavis(kopya, a, { x: r.left + r.width / 2, y: r.top + r.height / 2 }, 560, { s0: 1.2, s1: 1, tepe: -50 });
    kopya.remove();
    kaynak.classList.remove('bos');
    void oynat(kaynak, [{ transform: 'scale(0.86, 1.12)' }, { transform: 'scale(1.08, 0.92)', offset: 0.5 }, { transform: 'none' }], 360, { easing: 'ease-out' });
  }
  /** Kino'nun üstündeki bir giysi dolaba uçar (çizim söner, kopyası dolaba süzülür) */
  async function kinodanDolaba(id: GiysiId) {
    const m = BOLGE_MERKEZ[giysi(id).bolge][0];
    const a = ekranda(m[0], m[1]);
    kino.giy(id, false);
    yansima.giy(id, false);
    const kaynak = ikonlar.get(id)!;
    const r = kaynak.getBoundingClientRect();
    const kopya = h('div.gy-tasinan', { style: `width:${r.width}px;height:${r.height}px` }, h('img', { src: resim(`ikon/${id}`), alt: '', draggable: 'false' }));
    surukleKat.append(kopya);
    kaynak.classList.add('bos');
    await geriGonder(kopya, kaynak, a);
  }

  async function sonuc(t: { id: GiysiId; el: HTMLElement; kaynak: HTMLElement }, x: number, y: number) {
    const tv = tuvalde(x, y);
    const s = birak(kino.giyilenler, t.id, tv.x, tv.y);
    if (s.tur === 'iska') {
      await geriGonder(t.el, t.kaynak, { x, y });
      return;
    }
    mesgul = true;
    try {
      if (s.tur === 'yanlisYer') {
        // Kino giymeye çalışır, sendeler, şaşırır; giysi dolaba süzülür
        const m = BOLGE_MERKEZ[s.bolge][0];
        const hedef = ekranda(m[0], m[1]);
        await kavis(t.el, { x, y }, hedef, 260, { s0: 1.2, s1: 0.8, tepe: -20 });
        kino.k.ifade('saskin', 1500);
        void sendele();
        void kinoDe(K[giysi(t.id).soru]);
        await bekle(900);
        await geriGonder(t.el, t.kaynak, hedef);
        return;
      }
      // giysi yerine "pıt" diye oturur
      const m = BOLGE_MERKEZ[giysi(t.id).bolge][0];
      const hedef = ekranda(m[0], m[1]);
      await oynat(t.el, [{ transform: t.el.style.transform, opacity: 1 }, { transform: `translate(${hedef.x}px, ${hedef.y}px) translate(-50%, -50%) scale(0.7)`, opacity: 0 }], 180, { easing: 'cubic-bezier(.5,0,.8,.5)', fill: 'forwards' });
      t.el.remove();
      efekt.yapis();
      if (s.tur === 'sira') {
        // sıra şakası
        if (s.kural === 'once_corap') {
          // çorap botun üstüne geçer (kocaman, komik), Kino ayağına bakar; çorap düşer, bot da çıkar
          kino.giy('corap', true, true);
          kino.sira(['bot', 'corap']);
          kino.parcaDonusum('corap', 'translate(-2%, -1%) scale(1.22, 1.5)', 260);
          kino.k.ifade('saskin', 1800);
          void zipla(0.5);
          await bekle(1300);
          await kino.dusur('corap');
          kino.parcaDonusum('corap', null, 10);
          kino.sira(null);
          void mino(M.once_corap);
          await kinodanDolaba('bot');
          t.kaynak.classList.remove('bos');
          parlat('corap');
        } else {
          // mont atkının / eldivenin üstüne geçer: atkı içeride kaybolur, eldiven kolda
          kino.giy('mont', true, true);
          yansima.giy('mont', true);
          kino.sira(['corap', 'bot', 'atki', 'eldiven', 'mont', 'bere', 'gozluk']);
          kino.k.ifade('saskin', 1800);
          if (s.geri.includes('eldiven')) {
            void sendele();
            void kinoDe(K.ellerim);
            await bekle(1100);
          } else await bekle(900);
          await bekle(500);
          kino.sira(null);
          for (const g of s.geri) await kinodanDolaba(g);
          void mino(s.kural === 'once_mont' ? M.once_mont : M.eldiven_son);
          parlat(s.geri[0]);
        }
        return;
      }
      kino.giy(t.id, true, true);
      yansima.giy(t.id, true);
      void oynat(kinoKutu, [{ transform: 'none' }, { transform: 'scale(1.03, 0.96)', offset: 0.35 }, { transform: 'scale(0.99, 1.02)', offset: 0.7 }, { transform: 'none' }], 300, { easing: 'ease-out' });
      if (s.tur === 'kisinDegil') {
        if (t.id === 'sort') await usu();
        else {
          // güneş gözlüğü: önce havalı poz, sonra buğulanır: göremiyorum
          kino.k.ifade('keyif', 900);
          void oynat(kinoKutu, [{ transform: 'none' }, { transform: 'rotate(-5deg) translateX(-2%)', offset: 0.4 }, { transform: 'rotate(-5deg) translateX(-2%)', offset: 0.75 }, { transform: 'none' }], 1100);
          await bekle(1000);
          ekler.classList.add('bugulu');
          kino.k.ifade('saskin', 1400);
          void sendele();
          void kinoDe(K.goremiyorum);
          await bekle(1100);
          await bekle(500);
          ekler.classList.remove('bugulu');
        }
        void mino(M.kisin_degil);
        await kinodanDolaba(t.id);
        return;
      }
      // doğru giysi: sevimli tepki
      if (t.id === 'mont') await sicacik();
      else {
        kino.k.ifade('heyecan', 900);
        void zipla(0.6);
        await bekle(650);
      }
      if (!eksikler(kino.giyilenler).length) {
        await bekle(250);
        await aynaAni();
      }
    } finally {
      mesgul = false;
      sonHareket = performance.now();
    }
  }

  function parlat(id: GiysiId) {
    const b = ikonlar.get(id);
    if (!b) return;
    b.classList.remove('ipucu');
    void b.offsetWidth;
    b.classList.add('ipucu');
    ipucuId = id;
  }

  const ikonBasla = (e: PointerEvent) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.gy-giysi');
    if (!b || b.classList.contains('bos')) return;
    e.preventDefault();
    surukleBasla(b.dataset.giysi as GiysiId, e);
  };
  raf.addEventListener('pointerdown', ikonBasla);
  const hareket = (e: PointerEvent) => tasi(e.clientX, e.clientY);
  const birakildi = () => void birakIslem();
  window.addEventListener('pointermove', hareket);
  window.addEventListener('pointerup', birakildi);
  window.addEventListener('pointercancel', birakildi);
  kapatilacak.push(() => {
    window.removeEventListener('pointermove', hareket);
    window.removeEventListener('pointerup', birakildi);
    window.removeEventListener('pointercancel', birakildi);
  });
  // ipucu: 8 sn hareket yoksa sıradaki giysi parlar (dokununca kendiliğinden uçar)
  const ipucuSayac = window.setInterval(() => {
    if (adim !== 'giyin' || mesgul || tasinan) return;
    if (performance.now() - sonHareket > 8000) {
      const id = siradaki(kino.giyilenler);
      if (id) parlat(id);
      sonHareket = performance.now();
    }
  }, 500);
  kapatilacak.push(() => clearInterval(ipucuSayac));

  // ------------------------------------------------------------ adımlar
  async function giris() {
    // Kino sağdan zıplaya zıplaya gelir (kulaklar uçuşur), düşünce balonu açılır
    kinoYer.style.opacity = '1';
    void kino.k.oynat('yuru', 1500);
    await oynat(kinoYer, [
      { transform: 'translateX(70%) translateY(0)' },
      { transform: 'translateX(46%) translateY(-9%)', offset: 0.25 },
      { transform: 'translateX(24%) translateY(0)', offset: 0.5 },
      { transform: 'translateX(8%) translateY(-6%)', offset: 0.75 },
      { transform: 'translateX(-2%) translateY(0)', offset: 0.92 },
      { transform: 'none' },
    ], 1500, { easing: 'linear' });
    void zipla(0.8);
    kino.k.ifade('heyecan', 2200);
    balonKonum();
    balon.classList.add('acik');
    void oynat(balon, [{ transform: 'scale(0.2)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], 480, { easing: 'ease-out', fill: 'forwards' });
    await kinoDe(K.istek);
    await bekle(700);
    void oynat(balon, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.6)', opacity: 0 }], 300, { fill: 'forwards' });
    adimaGec('perde');
    pencere.classList.add('isaretli');
    void mino(M.perde);
  }
  function balonKonum() {
    const r = kinoYer.getBoundingClientRect();
    const bw = Math.min(r.width * 0.62, 230);
    Object.assign(balon.style, { width: `${bw}px`, height: `${bw * 0.78}px`, left: `${Math.min(W - bw - 8, r.left + r.width * (dikey ? 0.55 : 0.7))}px`, top: `${Math.max(56, r.top - bw * 0.15)}px` });
  }

  let perdeAcik = false;
  async function perdeAc() {
    if (adim !== 'perde' || perdeAcik) return;
    perdeAcik = true;
    pencere.classList.remove('isaretli');
    efekt.cevir();
    // kumaş dalgası: her şerit kendi gecikmesiyle kenara toplanır (hazırlık: önce hafif içe), uç geriden gelir
    // sol kanat sola, sağ kanat sağa toplanır: her şerit kenara doğru kayar ve daralır (kıvrım sıklaşır);
    // ortadaki (elle çekilen) uç önce yola çıkar, kenardakiler geriden gelir; sonda hafif geri sekme
    const dalga = (seritler: HTMLElement[], yon: 1 | -1) => {
      const N = seritler.length;
      const SIK = 0.36;
      return Promise.all(
        seritler.map((s, i) => {
          const uzaklik = yon === -1 ? i : N - 1 - i; // kenardan uzaklık (şerit sayısı)
          const git = yon * uzaklik * (1 - SIK) * 100; // şerit eninin yüzdesi
          return oynat(s, [
            { transform: 'translateX(0%) scaleX(1) skewY(0deg)' },
            { transform: `translateX(${-yon * 3}%) scaleX(1.03) skewY(${-yon * 1.2}deg)`, offset: 0.1 },
            { transform: `translateX(${git * 0.8}%) scaleX(${(1 + SIK) / 2}) skewY(${yon * 2.6}deg)`, offset: 0.55 },
            { transform: `translateX(${git * 1.05}%) scaleX(${SIK * 0.92}) skewY(${-yon * 1.4}deg)`, offset: 0.8 },
            { transform: `translateX(${git}%) scaleX(${SIK}) skewY(0deg)` },
          ], 1450, { delay: ms((N - 1 - uzaklik) * 38), easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' });
        }),
      );
    };
    // hava katman katman: gök önce, ağaç sonra (parallax), kar yağmaya başlar
    pencere.classList.add('acildi');
    void oynat(camIc.querySelector('.gy-k-gok'), [{ transform: 'translateX(-6%) scale(1.12)' }, { transform: 'none' }], 1700, { easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    void oynat(camIc.querySelector('.gy-k-orta'), [{ transform: 'translateX(-10%) scale(1.13)' }, { transform: 'none' }], 1700, { easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    void oynat(camIc.querySelector('.gy-k-agac'), [{ transform: 'translateX(-16%) scale(1.15)', opacity: 0.6 }, { transform: 'none', opacity: 1 }], 1700, { easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    await Promise.all([dalga(perdeSol.seritler, -1), dalga(perdeSag.seritler, 1)]);
    // perde topuzları hafifçe sallanır (takip)
    void oynat(perdeSol.el, [{ transform: 'none' }, { transform: 'rotate(1.2deg)' }, { transform: 'rotate(-0.6deg)' }, { transform: 'none' }], 900, { easing: 'ease-in-out' });
    void oynat(perdeSag.el, [{ transform: 'none' }, { transform: 'rotate(-1.2deg)' }, { transform: 'rotate(0.6deg)' }, { transform: 'none' }], 900, { easing: 'ease-in-out' });
    void mino(M.kis);
    await bekle(1500);
    // Kino pencereye bakar, üşür: titreme pozu bir an iskeletin yerine geçer (buz sarkıtlı, kendini sarmış)
    void oynat(titremePoz, [{ opacity: 0 }, { opacity: 1 }], 140, { fill: 'forwards' });
    void oynat(kino.el, [{ opacity: 1 }, { opacity: 0 }], 140, { fill: 'forwards' });
    const titre: Keyframe[] = [];
    for (let i = 0; i <= 16; i++) titre.push({ transform: i === 0 || i === 16 ? 'none' : `translateX(${i % 2 ? 1.2 : -1.2}%) rotate(${i % 2 ? 0.8 : -0.8}deg) scale(0.97, 0.95)` });
    void oynat(titremePoz, titre, 1300, { easing: 'linear', composite: 'add' });
    void kinoDe(K.brrr);
    await bekle(1300);
    void oynat(titremePoz, [{ opacity: 1 }, { opacity: 0 }], 200, { fill: 'forwards' });
    void oynat(kino.el, [{ opacity: 0 }, { opacity: 1 }], 200, { fill: 'forwards' });
    kino.k.ifade('saskin', 800);
    adimaGec('dolap');
    dolap.classList.add('isaretli');
    void mino(M.dolap);
  }
  async function agacaDokun() {
    if (!perdeAcik) return;
    efekt.dokunma();
    void oynat(agac, [{ transform: 'none' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(-1deg)' }, { transform: 'none' }], 700, { easing: 'ease-in-out' });
    for (let i = 0; i < 6; i++) {
      const p = h('i.gy-kar-puf', { style: `left:${20 + Math.random() * 60}%;top:${10 + Math.random() * 40}%` });
      camIc.append(p);
      void oynat(p, [{ transform: 'translateY(0) scale(0.6)', opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 40}px, 90px) scale(1)`, opacity: 0 }], 900, { delay: ms(i * 60) }).then(() => p.remove());
    }
    void mino(M.kis);
  }

  let dolapAcikMi = false;
  async function dolapAc() {
    if (adim !== 'dolap' || dolapAcikMi) return;
    dolapAcikMi = true;
    dolap.classList.remove('isaretli');
    efekt.cevir();
    // kapaklar: hazırlık (içe basılır), yayla açılır, sonra sallanıp oturur
    // kapakların ardında iç görünür; kapaklar dönüp yana açılınca tam açık resim (yana açılmış kapaklar) belirir
    dolapIc.style.opacity = '1';
    dolapKapali.style.opacity = '0';
    const kapak = (e: HTMLElement, yon: 1 | -1) =>
      oynat(e, [
        { transform: 'perspective(1100px) rotateY(0deg)', opacity: 1 },
        { transform: `perspective(1100px) rotateY(${yon * 7}deg)`, opacity: 1, offset: 0.14 },
        { transform: `perspective(1100px) rotateY(${-yon * 80}deg)`, opacity: 1, offset: 0.62 },
        { transform: `perspective(1100px) rotateY(${-yon * 96}deg)`, opacity: 0 },
      ], 720, { easing: 'cubic-bezier(.4,.05,.4,1)', fill: 'forwards' });
    void kapak(kapakSol, -1);
    void oynat(dolapAcik, [{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], 720, { fill: 'forwards' });
    await kapak(kapakSag, 1);
    dolapAcik.style.opacity = '1';
    // kapaklar menteşede yaylanıp oturur (takip)
    void oynat(dolapAcik, [{ transform: 'scaleX(1.035)' }, { transform: 'scaleX(0.99)' }, { transform: 'none' }], 420, { easing: 'ease-out' });
    // giysiler sırayla yaylanarak çıkar (askıdakiler sallanır)
    raf.classList.add('acik');
    DIZI.forEach((id, i) => {
      const b = ikonlar.get(id)!;
      void oynat(b, [{ transform: 'translateY(30%) scale(0.2)', opacity: 0 }, { transform: 'translateY(-6%) scale(1.12)', opacity: 1, offset: 0.65 }, { transform: 'none', opacity: 1 }], 520, { delay: ms(i * 70), easing: 'ease-out', fill: 'backwards' });
    });
    adimaGec('giyin');
    sonHareket = performance.now();
    await bekle(600);
    void mino(M.surukle);
  }

  async function aynaAni() {
    adimaGec('ayna');
    raf.classList.add('bitti', 'gizli');
    // ayna aşağıdan kayar (hazırlık + abartı), Kino iki yöne döner, poz verir, ayna parlar
    ayna.style.opacity = '1';
    await oynat(ayna, [{ transform: 'translateY(110%)' }, { transform: 'translateY(-6%)', offset: 0.7 }, { transform: 'none' }], 650, { easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
    const don = (e: HTMLElement) =>
      oynat(e, [
        { transform: 'scaleX(1)' },
        { transform: 'scaleX(-1) translateY(-4%)', offset: 0.25 },
        { transform: 'scaleX(-1)', offset: 0.42 },
        { transform: 'scaleX(1) translateY(-4%)', offset: 0.67 },
        { transform: 'scaleX(1) scaleY(0.96)', offset: 0.85 },
        { transform: 'scaleX(1)' },
      ], 1600, { easing: 'ease-in-out' });
    kino.kuyrukPervane = 1;
    yansima.kuyrukPervane = 1;
    kino.k.ifade('heyecan', 2400);
    yansima.k.ifade('heyecan', 2400);
    void don(kino.el);
    void don(yansima.el);
    void oynat(ayna.querySelector('.gy-ayna-parilti'), [{ transform: 'translateX(-160%) rotate(20deg)', opacity: 0 }, { transform: 'translateX(-60%) rotate(20deg)', opacity: 1, offset: 0.3 }, { transform: 'translateX(160%) rotate(20deg)', opacity: 0 }], 1100, { delay: ms(700) });
    await kinoDe(K.yakisti);
    await bekle(900);
    kino.kuyrukPervane = 0;
    yansima.kuyrukPervane = 0;
    await mino(M.hazir);
    void oynat(ayna, [{ transform: 'none' }, { transform: 'translateY(110%)' }], 500, { easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards' });
    // kamera kapıya kayar; Kino kapının önüne zıplaya zıplaya gider
    adimaGec('kapi');
    kameraKapida = true;
    raf.classList.add('gizli');
    dunyaKonum(true);
    const kapiX = parseFloat(kapi.style.left) + parseFloat(kapi.style.width) * 1.25;
    const kinoX = parseFloat(kinoYer.style.left);
    const hedef = kapiX - kinoX;
    void kino.k.oynat('yuru', 1300);
    await oynat(kinoYer, [{ transform: 'none' }, { transform: `translateX(${hedef * 0.5}px) translateY(-6%)`, offset: 0.4 }, { transform: `translateX(${hedef}px)` }], 1300, { easing: YUMUSAK, fill: 'forwards' });
    kapi.classList.add('isaretli');
    void mino(M.kapi);
  }

  async function kapiAc() {
    if (adim !== 'kapi') return;
    adimaGec('cikis');
    kapi.classList.remove('isaretli');
    efekt.cevir();
    // kapı açılır, ışık içeri dolar, kamera kapıdan süzülür, beyaz ışıkta dış sahne
    void oynat(kapiKanat, [
      { transform: 'perspective(800px) rotateY(0deg)' },
      { transform: 'perspective(800px) rotateY(5deg)', offset: 0.15 },
      { transform: 'perspective(800px) rotateY(-100deg)', offset: 0.75 },
      { transform: 'perspective(800px) rotateY(-92deg)' },
    ], 900, { easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' });
    void oynat(kapiIsik, [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1)' }], 700, { delay: ms(200), fill: 'forwards' });
    kino.k.ifade('heyecan', 1500);
    void kinoDe(K.oley);
    const k = kapi.getBoundingClientRect();
    const d = dunya.getBoundingClientRect();
    const ox = k.left + k.width / 2 - d.left, oy = k.top + k.height * 0.55 - d.top;
    await bekle(500);
    void oynat(kinoYer, [{ transform: getComputedStyle(kinoYer).transform }, { transform: `translateX(${parseFloat(kapi.style.left) - parseFloat(kinoYer.style.left) + parseFloat(kapi.style.width) * 0.5 - kinoS * 0.5}px) translateY(-4%) scale(0.72)`, opacity: 0.0 }], 800, { easing: 'ease-in', fill: 'forwards' });
    void oynat(dunya, [{ transform: 'translateX(0) scale(1)', transformOrigin: `${ox}px ${oy}px` }, { transform: 'translateX(0) scale(2.6)', transformOrigin: `${ox}px ${oy}px` }], 1000, { delay: ms(300), easing: 'cubic-bezier(.6,0,.9,.5)', fill: 'forwards' });
    await oynat(flas, [{ opacity: 0 }, { opacity: 1 }], 600, { delay: ms(700), fill: 'forwards' });
    bitti = true;
    app.git('disari', { giyili: [...kino.giyilenler] });
  }

  pencere.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.gy-agac') && perdeAcik) void agacaDokun();
    else void perdeAc();
  });
  // perdeyi yana sürüklemek de açar
  let perdeX = -1;
  perdeler.addEventListener('pointerdown', (e) => (perdeX = e.clientX));
  perdeler.addEventListener('pointermove', (e) => {
    if (perdeX >= 0 && Math.abs(e.clientX - perdeX) > 24) {
      perdeX = -1;
      void perdeAc();
    }
  });
  dolap.addEventListener('click', () => void dolapAc());
  kapi.addEventListener('click', () => void kapiAc());
  kinoKutu.addEventListener('pointerdown', () => {
    if (mesgul || tasinan || adim === 'giris') return;
    efekt.dokunma();
    kino.k.ifade('heyecan', 700);
    void zipla(0.5);
  });

  // ------------------------------------------------------------ başlat
  const boyut = () => {
    yerlesim();
    if (balon.classList.contains('acik')) balonKonum();
  };
  const ro = new ResizeObserver(boyut);
  ro.observe(el);
  kapatilacak.push(() => ro.disconnect());
  requestAnimationFrame(() => {
    yerlesim();
    kinoYer.style.opacity = '0';
    const q = new URLSearchParams(location.search);
    const atla = q.get('adim');
    if ((TEST_MODU || q.has('onizleme')) && atla) {
      // test / gösterim kısayolları: &adim=perde | dolap | giyin | kapi
      kinoYer.style.opacity = '1';
      if (atla !== 'perde') {
        perdeAcik = true;
        pencere.classList.add('acildi', 'perde-acik');
      }
      if (atla === 'giyin' || atla === 'kapi') {
        dolapAcikMi = true;
        dolapAcik.style.opacity = '1';
        dolapKapali.style.opacity = '0';
        kapakSol.style.opacity = '0';
        kapakSag.style.opacity = '0';
        raf.classList.add('acik');
      }
      if (atla === 'kapi') {
        for (const g of GIYSILER)
          if (g.kis === 'gerekli') {
            kino.giy(g.id, true);
            yansima.giy(g.id, true);
          }
        void aynaAni();
        return;
      }
      adimaGec(atla as Adim);
      return;
    }
    void giris();
  });
  void AZ;
  void YAY;

  return {
    el,
    kapat: () => {
      for (const z of zaman) clearTimeout(z);
      for (const f of kapatilacak) f();
      kino.kapat();
      yansima.kapat();
      void bitti;
      void sonra;
    },
  };
}
