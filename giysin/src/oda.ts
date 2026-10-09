/**
 * Kino'nun odası: istek → perde → pencere (hava, mevsim ağacı) → dolap → giyinme (tepkiler) → küçük görev → ayna → kapı.
 * Dört mevsim aynı oda; pencere manzarası, hava, dolaptaki giysiler, istek ve tepkiler mevsimin turundan (model.ts).
 *
 * Dünya (oda) ekrandan geniştir: kapı solda, ekran dışında bekler; Kino hazır olunca kamera kapıya kayar.
 * Yerleşim JS'te (ekran boyuna göre px): yatay telefon, dikey telefon ve tablet aynı mantıkla.
 * Bütün hareketler transform / opacity; dokunma hiçbir animasyonda kilitlenmez (sürükleme her an çalışır).
 */
import { efekt } from '../../src/audio/efekt';
import { kinoSoyle, minoSoyle } from './soz';
import { h, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import G from '../../content/giysin.json';
import { bekle, kavis, ms, oynat, YUMUSAK } from './anim';
import { GiyinikKino } from './giyinik';
import { BOLGE_MERKEZ, birak, bolgeUzakligi, eksikler, giysi, MIKNATIS, siradaki, TURLAR, type GiysiId, type Mevsim, type Tepki } from './model';
import { guvenliOlc, type Guvenli } from './guvenli';
import { onYukle, resim } from './resimler';
import { iyiTepki, kalpler, parilti, sendele, uymazTepki, zipla, type TepkiBaglami } from './tepkiler';

const M = G.mino;
const K = G.kino;

type Adim = 'giris' | 'perde' | 'dolap' | 'giyin' | 'gorev' | 'ayna' | 'kapi' | 'cikis';

/** dolap-acik-goz çizimindeki gözler (dolap kutusunun oranı): 2 sütun × 4 sıra; çekmece sıranın altında (ekip/giysin/dolap-goz.cjs) */
const DOLAP_SUTUN: [number, number][] = [[0.252, 0.486], [0.514, 0.748]];
const DOLAP_SIRA: [number, number][] = [[0.108, 0.245], [0.268, 0.4], [0.424, 0.555], [0.579, 0.705]];
/** gözlerin altı (en alt sıranın rafı): yatayda ekranın altına bu oran oturur, çekmece ekranın altından taşabilir */
const GOZ_ALT = 0.728;

/** Mevsimin istek cümlesi ve uymayan giysiye Mino'nun sözü */
const ISTEK: Record<Mevsim, string> = { kis: K.istek, ilkbahar: K.istek_ilkbahar, yaz: K.istek_yaz, sonbahar: K.istek_sonbahar };
const UYMAZ_SOZ: Record<Tepki, string> = { usu: M.kisin_degil, bugu: M.kisin_degil, sicak: M.sicak_gelir, camur: M.camur, islak: M.islanirsin, damla: M.yagmur };

/**
 * Pencere ve dış sahnenin havası: tanecikler (kodla, yumuşak şekiller; transform ile düşer, döner).
 * kar: iri yavaş taneler · cicek: pembe taç yaprakları süzülür · gunes: parıltı tozları · yagmur: çizgi damlalar · yaprak: sonbahar yaprakları
 */
export function taneKatmani(adet: number, sinif: string, tur: 'kar' | 'cicek' | 'gunes' | 'yagmur' | 'yaprak'): HTMLElement {
  const k = h(`div.gy-kar.${sinif}.${tur}`, { 'aria-hidden': 'true' });
  const yakin = sinif.includes('yakin');
  for (let i = 0; i < adet; i++) {
    const boy = tur === 'yagmur' ? (yakin ? 3 : 2) : yakin ? 10 + Math.random() * 10 : 5 + Math.random() * 6;
    const sure = tur === 'yagmur' ? (yakin ? 0.55 : 0.8) + Math.random() * 0.25 : tur === 'gunes' ? 3 + Math.random() * 3 : yakin ? 5 + Math.random() * 3 : 8 + Math.random() * 5;
    k.append(
      h('i', {
        style: `left:${(Math.random() * 100).toFixed(1)}%;width:${boy.toFixed(0)}px;--b:${boy.toFixed(0)}px;--sure:${sure.toFixed(2)}s;--gec:-${(Math.random() * 12).toFixed(1)}s;--salin:${(10 + Math.random() * 26).toFixed(0)}px;--don:${(Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360)}deg;--renk:${['#ffb3c8', '#ffd0dc', '#fff0f4'][i % 3]};--yaprak:${['#f08a24', '#e4572e', '#f4c430'][i % 3]};top:${tur === 'gunes' ? (Math.random() * 80).toFixed(0) + '%' : '0'}`,
      }),
    );
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

/** Düşünce balonunun içi: mevsimin isteği resimle */
function balonIci(m: Mevsim): HTMLElement[] {
  const im = (ad: string, sinif: string) => h(`img.${sinif}`, { src: resim(ad), alt: '' });
  if (m === 'kis') return [im('kardan-buyuk', 'b1'), im('kardan-orta', 'b2'), im('kardan-kucuk', 'b3'), im('kardan-havuc', 'b4')];
  if (m === 'ilkbahar') return [im('esya-sepet', 'c1'), im('esya-cicek', 'c2')];
  if (m === 'yaz') return [im('esya-kale', 'y1'), im('esya-kova', 'y2'), im('esya-kurek', 'y3')];
  return [im('esya-sicrama', 's1'), im('ikon/cizme', 's2')];
}

export function odaEkrani(app: Uygulama, param?: { mevsim?: Mevsim }): Ekran {
  const mevsim: Mevsim = param?.mevsim ?? 'kis';
  const tur = TURLAR[mevsim];
  onYukle([`dis-${mevsim}-yatay`, `dis-${mevsim}-dikey`, 'dolap-acik-goz', 'dolap-ic-goz', 'ayna', mevsim === 'sonbahar' ? 'kino-islak' : 'kino-titreme']);
  const kapatilacak: (() => void)[] = [];
  let adim: Adim = 'giris';

  // ------------------------------------------------------------ öğeler
  const oda = h('img.gy-oda', { src: resim('oda-yatay'), alt: '', draggable: 'false' });
  // pencere manzarası üç katman (Gemini): arkada gök ve tepeler, ortada çit ve çalılar, önde mevsim ağacı
  const manzara = h('img.gy-manzara.arka', { src: resim(`pencere-${mevsim}-arka`), alt: '', draggable: 'false' });
  const orta = h('img.gy-manzara.orta', { src: resim(`pencere-${mevsim}-orta`), alt: '', draggable: 'false' });
  const agac = h('img.gy-manzara.gy-agac', { src: resim(`pencere-${mevsim}-on`), alt: `${G.yazi[mevsim]} ağacı`, draggable: 'false' });
  const hava: HTMLElement[][] = {
    kis: [[taneKatmani(26, 'uzak', 'kar')], [taneKatmani(14, 'yakin', 'kar'), h('div.gy-bugu')]],
    ilkbahar: [[taneKatmani(10, 'uzak', 'cicek')], [taneKatmani(9, 'yakin', 'cicek'), h('div.gy-isik.bahar')]],
    yaz: [[h('div.gy-gunes-parlak')], [taneKatmani(14, 'yakin', 'gunes'), h('div.gy-isik')]],
    sonbahar: [[h('div.gy-yagmur-gok'), taneKatmani(34, 'uzak', 'yagmur')], [taneKatmani(5, 'yakin', 'yaprak'), taneKatmani(16, 'yakin', 'yagmur'), h('div.gy-cam-damla', {}, ...Array.from({ length: 7 }, (_, i) => h('i', { style: `left:${8 + i * 13 + Math.random() * 5}%;--gec:-${(Math.random() * 6).toFixed(1)}s;--sure:${(4 + Math.random() * 3).toFixed(1)}s;top:${(Math.random() * 30).toFixed(0)}%` })))]],
  }[mevsim];
  const camIc = h('div.gy-cam-ic', {}, h('div.gy-katman.gy-k-gok', {}, manzara), ...hava[0], h('div.gy-katman.gy-k-orta', {}, orta), h('div.gy-katman.gy-k-agac', {}, agac), ...hava[1]);
  const cam = h(`div.gy-cam.${mevsim}`, {}, camIc);
  const perdeSol = perdeKanadi('sol');
  const perdeSag = perdeKanadi('sag');
  const perdeler = h('div.gy-perdeler', {}, perdeSol.el, perdeSag.el);
  const pencere = h('div.gy-pencere', {}, cam, h('img.gy-pencere-cerceve', { src: resim('pencere'), alt: '', draggable: 'false' }), perdeler, h('div.gy-isaret.gy-isaret-perde'));

  const kapiKanat = h('img.gy-kapi-kanat', { src: resim('kapi-kanat'), alt: '', draggable: 'false' });
  const kapiIsik = h('div.gy-kapi-isik');
  const kapi = h('button.gy-kapi', { type: 'button', 'aria-label': 'Kapı' }, kapiIsik, h('div.gy-kapi-mentese', {}, kapiKanat), h('img.gy-kapi-cerceve', { src: resim('kapi-cerceve'), alt: '', draggable: 'false' }), h('div.gy-isaret.gy-isaret-kapi'));

  const kapakSol = h('img.gy-kapak.gy-kapak-sol', { src: resim('dolap-kapak-sol'), alt: '', draggable: 'false' });
  const kapakSag = h('img.gy-kapak.gy-kapak-sag', { src: resim('dolap-kapak-sag'), alt: '', draggable: 'false' });
  const dolapAcik = h('img.gy-dolap-acik', { src: resim('dolap-acik-goz'), alt: '', draggable: 'false' });
  const dolapKapali = h('img.gy-dolap-kapali', { src: resim('dolap-kapali'), alt: '', draggable: 'false' });
  const raf = h('div.gy-raf');
  // açılırken kapakların arkasında iç (yana açılmış kapaklar yok); kapaklar dönünce tam açık resim
  const dolapIc = h('img.gy-dolap-ic', { src: resim('dolap-ic-goz'), alt: '', draggable: 'false' });
  const dolap = h('div.gy-dolap', { role: 'button', 'aria-label': 'Dolap' }, dolapIc, dolapAcik, dolapKapali, h('div.gy-kapak-yer.sol', {}, kapakSol), h('div.gy-kapak-yer.sag', {}, kapakSag), h('div.gy-isaret.gy-isaret-dolap'));

  const kino = new GiyinikKino();
  const parlti = h('div.gy-miknatis');
  const buz = h('img.gy-buz', { src: resim('buz'), alt: '', draggable: 'false' });
  const ekler = h('div.gy-kino-ekler', {}, parlti, h('i.gy-yanak.sol'), h('i.gy-yanak.sag'), buz);
  // mevsimin pencere pozu (Gemini, iskelete hizalı): kışın titreyen, sonbaharda ıslak Kino bir an iskeletin yerine geçer
  const poz = mevsim === 'kis' || mevsim === 'sonbahar' ? h('img.gy-poz', { src: resim(mevsim === 'kis' ? 'kino-titreme' : 'kino-islak'), alt: '', draggable: 'false' }) : null;
  const kinoKutu = h('div.gy-kino-kutu', {}, kino.el, ...(poz ? [poz] : []), ekler);
  const kinoYer = h('div.gy-kino-yer', {}, kinoKutu);
  const tb: TepkiBaglami = { kino, kutu: kinoKutu, ekler, kinoDe: (t) => kinoDe(t) };

  // düşünce balonu: istek resimle
  const balon = h('div.gy-balon', { 'aria-hidden': 'true' }, h('i.gy-balon-k1'), h('i.gy-balon-k2'), h(`div.gy-balon-ic.${mevsim}`, {}, ...balonIci(mevsim)));

  // ayna anı: ayna aşağıdan kayar, içinde Kino'nun yansıması
  const yansima = new GiyinikKino();
  // yansıma çerçevenin camının üstünde (camın oval kırpımıyla), yarı saydam: camın mavisi ve parıltısı görünür
  const ayna = h('div.gy-ayna', { 'aria-hidden': 'true' }, h('img.gy-ayna-cerceve', { src: resim('ayna'), alt: '' }), h('div.gy-ayna-cam', {}, h('div.gy-yansima', {}, yansima.el), h('i.gy-ayna-parilti')));

  // küçük görev: güneş kremi tüpü (yaz)
  const krem = h('img.gy-krem', { src: resim('esya-krem'), alt: '', draggable: 'false' });

  const dunya = h('div.gy-dunya', {}, oda, kapi, pencere, dolap, kinoYer, ayna);
  const surukleKat = h('div.gy-surukle-kat');
  const flas = h('div.gy-beyaz');
  const cikis = app.secenekler.cikis;
  const geri = cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : h('div', { style: 'width:56px' });
  const albumD = yuvarlakDugme(IKON.album, G.yazi.album, () => app.git('album'), 'kucuk gy-album-dugme');
  const el = h(`div.gy-ekran.gy-oda-ekran.${mevsim}`, {}, dunya, balon, h('div.gy-ust', {}, geri, albumD), surukleKat, flas);
  el.dataset.adim = adim;
  el.dataset.mevsim = mevsim;
  const adimaGec = (a: Adim) => {
    adim = a;
    el.dataset.adim = a;
  };

  // ------------------------------------------------------------ yerleşim (px)
  let W = 0, H = 0, dikey = false, kapiPay = 0, kinoS = 0;
  let g: Guvenli = { ust: 0, sag: 0, alt: 0, sol: 0 };
  function yerlesim() {
    W = el.clientWidth || innerWidth;
    H = el.clientHeight || innerHeight;
    dikey = H > W * 1.1;
    // telefon önce: çentik, yuvarlak köşe ve ana ekran çubuğu payı (güvenli alan) hesaba katılır
    g = guvenliOlc(el);
    const Wg = W - g.sol - g.sag;
    oda.src = resim(dikey ? 'oda-dikey' : 'oda-yatay');
    const u = dikey ? W : Math.min(H - g.alt * 0.5, Wg * 0.5);
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
    const zemin = dikey ? Math.min(H * 0.84, H - g.alt - H * 0.07) : Math.min(H * 0.9, H - g.alt - 6);
    // kapı (dünyanın solunda)
    kutu(kapi, (kapiPay - kh * 0.5) * 0.45, zemin - kh, kh * 0.5, kh);
    if (dikey) {
      // dikey: üstte pencere (çentiğin ve geri düğmesinin altında), solda Kino, sağda dolap (giysiler iki sütun)
      const pw = W * 0.5;
      kutu(pencere, kapiPay + g.sol + W * 0.06, Math.max(H * 0.09, g.ust + 70), pw, pw / 0.778);
      kinoS = Math.min(W * 0.62, H * 0.34);
      kutu(kinoYer, kapiPay + g.sol + W * 0.25 - kinoS / 2, zemin - kinoS * 0.93, kinoS, kinoS);
      // dolabın gövdesi sağ kenarda: gözlerin sol sütunu Kino'nun kulağının altında kalmaz
      const dw = Math.min(W * 0.88, H * 0.5);
      kutu(dolap, kapiPay + W - g.sag - 4 - dw * 0.79, zemin + H * 0.09 - dw, dw, dw);
    } else {
      const ph = u * 0.7;
      const px = g.sol + Wg * 0.025;
      kutu(pencere, kapiPay + px, Math.max(H * 0.07, g.ust + 6), ph * 0.778, ph);
      // dolap iri: gözler ekranın yüksekliğini doldurur (taç üstte görünür, çekmece altta taşabilir);
      // gövdenin sağ kenarı çentik / yuvarlak köşe payının içinde
      const dh = Math.min((H - g.alt - 10) / (GOZ_ALT - 0.02), Wg * 0.62);
      // küçük yatay telefonda sağ sütundaki gözler ekranın kenarına dayanmasın: güvenli alan + 12 px pay
      const sagPay = H < 500 ? 12 : 4;
      const dx = W - g.sag - sagPay - dh * 0.79;
      // yer varsa (tablet) dolap ayakları yerde, bütünüyle görünür; yoksa (telefon) gözlerin altı ekranın altında
      const enAlt = H - g.alt - 6 - dh * GOZ_ALT, yerde = H * 0.99 - dh * 0.955;
      kutu(dolap, kapiPay + dx, yerde >= g.ust + 4 ? Math.min(yerde, enAlt) : enAlt, dh, dh);
      // Kino pencere ile dolabın gövdesi arasında ortada
      kinoS = u * 0.86;
      const kx = (px + ph * 0.778 + dx + dh * 0.21) / 2;
      kutu(kinoYer, kapiPay + kx - kinoS / 2, zemin - kinoS * 0.93, kinoS, kinoS);
    }
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
  // dolabın içi 2 sütun × 4 sıra göz (dolap-acik-goz): her giysi kendi gözünde, ortada, aynı kutuya sığdırılmış.
  // dizilim vücuda göre: üstte baş, ortada gövde, altta ayak (çocuk aradığını kolay bulur)
  const SIRA_BOLGE = ['bas', 'goz', 'boyun', 'govde', 'bacak', 'el', 'ayak'];
  const DIZI = [...tur.dizi].sort((a, b) => SIRA_BOLGE.indexOf(giysi(a).bolge) - SIRA_BOLGE.indexOf(giysi(b).bolge));
  const ikonlar = new Map<GiysiId, HTMLElement>();
  DIZI.forEach((id, i) => {
    const b = h('button.gy-giysi', { type: 'button', 'aria-label': G.giysi[id], 'data-giysi': id, style: `--gy-sira:${i}` }, h('img', { src: resim(`ikon/${id}`), alt: '', draggable: 'false' }));
    ikonlar.set(id, b);
    raf.append(b);
  });
  el.append(raf);
  function rafYerlesim() {
    const r = { x: parseFloat(dolap.style.left) - (kameraKapida ? 0 : kapiPay), y: parseFloat(dolap.style.top), w: parseFloat(dolap.style.width), h: parseFloat(dolap.style.height) };
    // her düğme gözün tamamı (büyük dokunma alanı); resim gözün içinde payla ortalanır (CSS)
    DIZI.forEach((id, i) => {
      const [x0, x1] = DOLAP_SUTUN[i % 2], [y0, y1] = DOLAP_SIRA[Math.floor(i / 2)];
      Object.assign(ikonlar.get(id)!.style, { left: `${r.x + r.w * x0}px`, top: `${r.y + r.h * y0}px`, width: `${r.w * (x1 - x0)}px`, height: `${r.h * (y1 - y0)}px` });
    });
  }

  // ------------------------------------------------------------ konuşma
  let konusma = Promise.resolve();
  const mino = (t: string) => (konusma = minoSoyle(t));
  const kinoDe = (t: string) => (konusma = kinoSoyle(t));
  void konusma;

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
  /** giysinin uçacağı yer: bölgenin en yakın merkezi (tutulan eşya hep sağ patiye) */
  function hedefNokta(id: GiysiId, tx?: number, ty?: number) {
    const g = giysi(id);
    const ms = BOLGE_MERKEZ[g.bolge];
    if (g.tutulan) return ms[1];
    if (tx === undefined || ty === undefined) return ms[0];
    return ms.reduce((a, b) => (Math.hypot(a[0] - tx, a[1] - ty!) < Math.hypot(b[0] - tx, b[1] - ty!) ? a : b));
  }
  function miknatisGoster(id: GiysiId | null, x = 0, y = 0) {
    if (!id) {
      parlti.classList.remove('acik');
      return;
    }
    const g = giysi(id);
    const t = tuvalde(x, y);
    if (bolgeUzakligi(g.bolge, t.x, t.y) <= MIKNATIS) {
      const m = hedefNokta(id, t.x, t.y);
      parlti.style.left = `${(m[0] / 2048) * 100}%`;
      parlti.style.top = `${(m[1] / 2048) * 100}%`;
      parlti.classList.add('acik');
    } else parlti.classList.remove('acik');
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
        const m = hedefNokta(t.id);
        const hedef = ekranda(m[0], m[1]);
        await kavis(t.el, { x: cx, y: cy }, hedef, 520, { s0: 1, s1: 0.9 });
        await sonuc(t, hedef.x, hedef.y);
        return;
      }
      void minoSoyle(G.giysi[t.id]);
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
    const m = hedefNokta(id);
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
    const s = birak(kino.giyilenler, t.id, tv.x, tv.y, tur);
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
        void sendele(kinoKutu);
        void kinoDe(K[giysi(t.id).soru]);
        await bekle(900);
        await geriGonder(t.el, t.kaynak, hedef);
        return;
      }
      // giysi yerine "pıt" diye oturur
      const m = hedefNokta(t.id, tv.x, tv.y);
      const hedef = ekranda(m[0], m[1]);
      await oynat(t.el, [{ transform: t.el.style.transform, opacity: 1 }, { transform: `translate(${hedef.x}px, ${hedef.y}px) translate(-50%, -50%) scale(0.7)`, opacity: 0 }], 180, { easing: 'cubic-bezier(.5,0,.8,.5)', fill: 'forwards' });
      t.el.remove();
      efekt.yapis();
      if (s.tur === 'sira') {
        // sıra şakası
        if (s.kural === 'once_corap') {
          // çorap ayakkabının üstüne geçer (kocaman, komik), Kino ayağına bakar; çorap düşer, ayakkabı da çıkar
          const ayakkabi = s.geri[1];
          kino.giy('corap', true, true);
          kino.sira([ayakkabi, 'corap']);
          kino.parcaDonusum('corap', 'translate(-2%, -1%) scale(1.22, 1.5)', 260);
          kino.k.ifade('saskin', 1800);
          void zipla(kinoKutu, 0.5);
          await bekle(1300);
          await kino.dusur('corap');
          kino.parcaDonusum('corap', null, 10);
          kino.sira(null);
          void mino(M.once_corap);
          await kinodanDolaba(ayakkabi);
          t.kaynak.classList.remove('bos');
          parlat('corap');
        } else {
          // mont atkının / eldivenin üstüne geçer: atkı içeride kaybolur, eldiven kolda
          kino.giy(t.id, true, true);
          yansima.giy(t.id, true);
          kino.sira(['corap', 'bot', 'atki', 'eldiven', t.id, 'bere', 'gozluk']);
          kino.k.ifade('saskin', 1800);
          if (s.geri.includes('eldiven')) {
            void sendele(kinoKutu);
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
      if (s.tur === 'uymaz') {
        await uymazTepki(tb, s.tepki, t.id);
        await bekle(200);
        void mino(UYMAZ_SOZ[s.tepki]);
        await kinodanDolaba(t.id);
        return;
      }
      // doğru giysi: sevimli tepki
      await iyiTepki(tb, tur.iyi[t.id]);
      if (!eksikler(kino.giyilenler, tur).length) {
        await bekle(250);
        if (tur.gorev) await gorev();
        else await aynaAni();
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
  const hareket = (e: PointerEvent) => {
    tasi(e.clientX, e.clientY);
    kremOvala(e);
  };
  const birakildi = () => {
    kremBasili = false;
    void birakIslem();
  };
  window.addEventListener('pointermove', hareket);
  window.addEventListener('pointerup', birakildi);
  window.addEventListener('pointercancel', birakildi);
  kapatilacak.push(() => {
    window.removeEventListener('pointermove', hareket);
    window.removeEventListener('pointerup', birakildi);
    window.removeEventListener('pointercancel', birakildi);
  });
  // ipucu: 8 sn hareket yoksa sıradaki giysi parlar (dokununca kendiliğinden uçar); görevde sıradaki nokta büyür
  const ipucuSayac = window.setInterval(() => {
    if (adim === 'gorev' && performance.now() - sonHareket > 6000) {
      gorevIpucu();
      sonHareket = performance.now();
      return;
    }
    if (adim !== 'giyin' || mesgul || tasinan) return;
    if (performance.now() - sonHareket > 8000) {
      const id = siradaki(kino.giyilenler, tur);
      if (id) parlat(id);
      sonHareket = performance.now();
    }
  }, 500);
  kapatilacak.push(() => clearInterval(ipucuSayac));

  // ------------------------------------------------------------ küçük görev
  /** güneş kremi: burun ve iki kulak (tuval noktaları); şemsiye: patideki kapalı şemsiye */
  const KREM_YERI: [number, number][] = [[915, 845], [420, 900], [1590, 880]];
  let kremNoktalari: { x: number; y: number; dolu: number; el: HTMLElement; leke: HTMLElement; bitti: boolean }[] = [];
  let kremBasili = false;
  let kremSon: { x: number; y: number } | null = null;
  let gorevBitti: (() => void) | null = null;

  async function gorev() {
    adimaGec('gorev');
    raf.classList.add('gizli');
    sonHareket = performance.now();
    if (tur.gorev === 'krem') {
      // tüp dolaptan Kino'nun yanına uçar; burun ve kulaklarda parlayan halkalar
      const kr = kinoYer.getBoundingClientRect();
      const d = dolap.getBoundingClientRect();
      krem.style.width = `${kinoS * 0.17}px`;
      surukleKat.append(krem);
      efekt.ucus();
      await kavis(krem, { x: d.left + d.width / 2, y: d.top + d.height * 0.5 }, { x: kr.left + kr.width * (dikey ? 0.95 : 0.92), y: kr.top + kr.height * 0.62 }, 700, { s0: 0.4, s1: 1, don: 360 });
      kremNoktalari = KREM_YERI.map(([x, y]) => {
        const leke = h('i.gy-krem-leke', { style: `left:${(x / 20.48).toFixed(2)}%;top:${(y / 20.48).toFixed(2)}%` });
        const halka = h('i.gy-krem-halka', { style: `left:${(x / 20.48).toFixed(2)}%;top:${(y / 20.48).toFixed(2)}%` });
        ekler.append(leke, halka);
        return { x, y, dolu: 0, el: halka, leke, bitti: false };
      });
      void mino(M.krem);
      await new Promise<void>((r) => (gorevBitti = r));
      kino.k.ifade('keyif', 1500);
      kalpler(ekler, 5);
      void kinoDe(K.mis);
      void oynat(krem, [{ opacity: 1 }, { opacity: 0 }], 400, { fill: 'forwards' }).then(() => krem.remove());
      await bekle(1300);
    } else {
      // şemsiye: patideki kapalı şemsiye parlar; dokununca "pof!" diye açılır
      kinoKutu.classList.add('gy-semsiye-isaret');
      void mino(M.semsiye_ac);
      await new Promise<void>((r) => (gorevBitti = r));
      kinoKutu.classList.remove('gy-semsiye-isaret');
      efekt.pof();
      kino.semsiyeAc(true);
      yansima.semsiyeAc(true, false);
      void kinoDe(K.pof);
      kino.k.ifade('heyecan', 1400);
      await zipla(kinoKutu, 0.7);
      parilti(ekler, 1000, 60, 5);
      await bekle(500);
    }
    await aynaAni();
  }
  function kremDokun(i: number, miktar: number) {
    const n = kremNoktalari[i];
    if (!n || n.bitti) return;
    n.dolu = Math.min(1, n.dolu + miktar);
    n.leke.style.opacity = String(0.25 + n.dolu * 0.75);
    n.leke.style.transform = `translate(-50%, -50%) scale(${0.5 + n.dolu * 0.6})`;
    if (Math.random() < 0.35) efekt.ovala();
    if (n.dolu >= 1) {
      n.bitti = true;
      n.el.remove();
      // krem yayılır, sonra emilip parlar
      void oynat(n.leke, [{ transform: 'translate(-50%,-50%) scale(1.1)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1.25)', opacity: 0.9, offset: 0.4 }, { transform: 'translate(-50%,-50%) scale(0.9)', opacity: 0 }], 900, { fill: 'forwards' });
      parilti(ekler, n.x, n.y, 4);
      kino.k.ifade('keyif', 600);
      if (kremNoktalari.every((k) => k.bitti)) {
        const f = gorevBitti;
        gorevBitti = null;
        setTimeout(() => f?.(), ms(500));
      }
    }
  }
  function kremOvala(e: PointerEvent) {
    if (adim !== 'gorev' || tur.gorev !== 'krem' || !kremBasili) return;
    const t = tuvalde(e.clientX, e.clientY);
    if (kremSon) {
      const yol = Math.hypot(t.x - kremSon.x, t.y - kremSon.y);
      kremNoktalari.forEach((n, i) => {
        if (Math.hypot(n.x - t.x, n.y - t.y) < 230) kremDokun(i, yol / 900);
      });
    }
    kremSon = t;
    sonHareket = performance.now();
  }
  function gorevIpucu() {
    if (tur.gorev === 'krem') {
      const n = kremNoktalari.find((k) => !k.bitti);
      if (n) void oynat(n.el, [{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.5)' }, { transform: 'translate(-50%,-50%) scale(1)' }], 700, { iterations: 2 });
      void mino(M.krem);
    } else void mino(M.semsiye_ac);
  }
  kinoKutu.addEventListener('pointerdown', (e) => {
    if (adim === 'gorev') {
      sonHareket = performance.now();
      if (tur.gorev === 'semsiye') {
        const f = gorevBitti;
        gorevBitti = null;
        f?.();
        return;
      }
      // dokunmak da sürer (3 yaş): dokunulan noktaya yakın olan dolar
      kremBasili = true;
      const t = tuvalde(e.clientX, e.clientY);
      kremSon = t;
      let en = -1, d = Infinity;
      kremNoktalari.forEach((n, i) => {
        const u = Math.hypot(n.x - t.x, n.y - t.y);
        if (!n.bitti && u < d) {
          d = u;
          en = i;
        }
      });
      if (en >= 0 && d < 420) kremDokun(en, 0.4);
      return;
    }
    if (mesgul || tasinan || adim === 'giris') return;
    efekt.dokunma();
    kino.k.ifade('heyecan', 700);
    void zipla(kinoKutu, 0.5);
  });

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
    void zipla(kinoKutu, 0.8);
    kino.k.ifade('heyecan', 2200);
    balonKonum();
    balon.classList.add('acik');
    void oynat(balon, [{ transform: 'scale(0.2)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], 480, { easing: 'ease-out', fill: 'forwards' });
    // balon en az 2,4 sn görünür (ses kısa ya da kapalı olsa da çocuk resmi görsün)
    await Promise.all([kinoDe(ISTEK[mevsim]), bekle(2400)]);
    await bekle(400);
    void oynat(balon, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.6)', opacity: 0 }], 300, { fill: 'forwards' });
    adimaGec('perde');
    pencere.classList.add('isaretli');
    void mino(M.perde);
  }
  function balonKonum() {
    const r = kinoYer.getBoundingClientRect();
    const bw = Math.min(r.width * 0.62, 230);
    Object.assign(balon.style, { width: `${bw}px`, height: `${bw * 0.78}px`, left: `${Math.min(W - g.sag - bw - 8, r.left + r.width * (dikey ? 0.55 : 0.7))}px`, top: `${Math.max(56 + g.ust, r.top - bw * 0.15)}px` });
  }

  let perdeAcik = false;
  async function perdeAc() {
    if (adim !== 'perde' || perdeAcik) return;
    perdeAcik = true;
    pencere.classList.remove('isaretli');
    efekt.cevir();
    // kumaş dalgası: sol kanat sola, sağ kanat sağa toplanır: her şerit kenara doğru kayar ve daralır (kıvrım sıklaşır);
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
    // hava katman katman: gök önce, ağaç sonra (parallax), hava başlar
    pencere.classList.add('acildi');
    void oynat(camIc.querySelector('.gy-k-gok'), [{ transform: 'translateX(-6%) scale(1.12)' }, { transform: 'none' }], 1700, { easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    void oynat(camIc.querySelector('.gy-k-orta'), [{ transform: 'translateX(-10%) scale(1.13)' }, { transform: 'none' }], 1700, { easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    void oynat(camIc.querySelector('.gy-k-agac'), [{ transform: 'translateX(-16%) scale(1.15)', opacity: 0.6 }, { transform: 'none', opacity: 1 }], 1700, { easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    await Promise.all([dalga(perdeSol.seritler, -1), dalga(perdeSag.seritler, 1)]);
    // perde topuzları hafifçe sallanır (takip)
    void oynat(perdeSol.el, [{ transform: 'none' }, { transform: 'rotate(1.2deg)' }, { transform: 'rotate(-0.6deg)' }, { transform: 'none' }], 900, { easing: 'ease-in-out' });
    void oynat(perdeSag.el, [{ transform: 'none' }, { transform: 'rotate(-1.2deg)' }, { transform: 'rotate(0.6deg)' }, { transform: 'none' }], 900, { easing: 'ease-in-out' });
    void mino(M[mevsim]);
    await bekle(1500);
    await pencereyeBakar();
    adimaGec('dolap');
    dolap.classList.add('isaretli');
    void mino(M.dolap);
  }

  /** Kino pencereye bakıp havayı hisseder: kışın üşür, ilkbaharda koklar, yazın terler, sonbaharda ıslanır */
  async function pencereyeBakar() {
    if (poz) {
      // Gemini pozu bir an iskeletin yerine geçer (titreyen ya da ıslak Kino)
      void oynat(poz, [{ opacity: 0 }, { opacity: 1 }], 140, { fill: 'forwards' });
      void oynat(kino.el, [{ opacity: 1 }, { opacity: 0 }], 140, { fill: 'forwards' });
      const titre: Keyframe[] = [];
      if (mevsim === 'kis') for (let i = 0; i <= 16; i++) titre.push({ transform: i === 0 || i === 16 ? 'none' : `translateX(${i % 2 ? 1.2 : -1.2}%) rotate(${i % 2 ? 0.8 : -0.8}deg) scale(0.97, 0.95)` });
      // ıslak: başını hafifçe sallar, burnunu çeker (yavaş, üzgün)
      else titre.push({ transform: 'none' }, { transform: 'rotate(-2deg) translateY(1%)', offset: 0.3 }, { transform: 'rotate(2deg)', offset: 0.6 }, { transform: 'none' });
      void oynat(poz, titre, mevsim === 'kis' ? 1300 : 1500, { easing: mevsim === 'kis' ? 'linear' : 'ease-in-out', composite: 'add' });
      if (mevsim === 'kis') void kinoDe(K.brrr);
      else {
        efekt.sicrama();
        void mino(M.yagmur);
      }
      await bekle(mevsim === 'kis' ? 1300 : 1700);
      void oynat(poz, [{ opacity: 1 }, { opacity: 0 }], 200, { fill: 'forwards' });
      void oynat(kino.el, [{ opacity: 0 }, { opacity: 1 }], 200, { fill: 'forwards' });
      kino.k.ifade('saskin', 800);
      return;
    }
    if (mevsim === 'ilkbahar') {
      // pencereden gelen çiçek kokusu: koklar, keyiflenir, taç yaprakları burnunun önünden geçer
      void kino.k.oynat('kokla', 1400);
      kino.k.ifade('keyif', 1600);
      kalpler(ekler, 3);
      void kinoDe(K.mis);
      await bekle(1500);
      return;
    }
    // yaz: güneş içeri vurur, Kino terler (dil dışarıda), elini yüzüne siper eder gibi geriye çekilir
    kino.k.ifade('sicak', 1700);
    void oynat(kinoKutu, [{ transform: 'none' }, { transform: 'scale(1.03, 0.96) rotate(-2deg)', offset: 0.3 }, { transform: 'scale(1.03, 0.96) rotate(-2deg)', offset: 0.7 }, { transform: 'none' }], 1500, { easing: 'ease-in-out' });
    for (let i = 0; i < 4; i++) {
      const d = h('i.gy-ter', { style: `left:${42 + (Math.random() - 0.5) * 10}%;top:${22 + Math.random() * 6}%` });
      ekler.append(d);
      void oynat(d, [{ transform: 'translate(-50%,-50%) scale(0.3)', opacity: 0 }, { transform: `translate(calc(-50% + ${(i % 2 ? 1 : -1) * 40}px), calc(-50% - 30px)) scale(1)`, opacity: 1, offset: 0.35 }, { transform: `translate(calc(-50% + ${(i % 2 ? 1 : -1) * 70}px), calc(-50% + 70px)) scale(0.8)`, opacity: 0 }], 800, { delay: ms(200 + i * 150) }).then(() => d.remove());
    }
    void kinoDe(K.sicak);
    await bekle(1500);
  }

  async function agacaDokun() {
    if (!perdeAcik) return;
    efekt.dokunma();
    void oynat(agac, [{ transform: 'none' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(-1deg)' }, { transform: 'none' }], 700, { easing: 'ease-in-out' });
    // ağaçtan mevsimin tanesi dökülür: kar, taç yaprağı, yaprak
    for (let i = 0; i < 7; i++) {
      const p = h(`i.gy-kar-puf.${mevsim}`, { style: `left:${55 + Math.random() * 35}%;top:${10 + Math.random() * 40}%` });
      camIc.append(p);
      void oynat(p, [{ transform: 'translateY(0) scale(0.6) rotate(0deg)', opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 50}px, 90px) scale(1) rotate(${(Math.random() - 0.5) * 360}deg)`, opacity: 0 }], 1000, { delay: ms(i * 60) }).then(() => p.remove());
    }
    void mino(M[mevsim]);
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
    app.git('disari', { mevsim, giyili: [...kino.giyilenler] });
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
      // test / gösterim kısayolları: &adim=perde | dolap | giyin | gorev | kapi
      kinoYer.style.opacity = '1';
      if (atla !== 'perde') {
        perdeAcik = true;
        pencere.classList.add('acildi', 'perde-acik');
      }
      if (atla === 'giyin' || atla === 'kapi' || atla === 'gorev') {
        dolapAcikMi = true;
        dolapAcik.style.opacity = '1';
        dolapKapali.style.opacity = '0';
        kapakSol.style.opacity = '0';
        kapakSag.style.opacity = '0';
        raf.classList.add('acik');
      }
      if (atla === 'kapi' || atla === 'gorev') {
        for (const g of tur.gerekli) {
          kino.giy(g, true);
          yansima.giy(g, true);
        }
        if (atla === 'gorev' && tur.gorev) {
          void gorev();
          return;
        }
        if (tur.gorev === 'semsiye') {
          kino.semsiyeAc(true, false);
          yansima.semsiyeAc(true, false);
        }
        void aynaAni();
        return;
      }
      adimaGec(atla as Adim);
      return;
    }
    void giris();
  });

  return {
    el,
    kapat: () => {
      for (const f of kapatilacak) f();
      kino.kapat();
      yansima.kapat();
    },
  };
}
