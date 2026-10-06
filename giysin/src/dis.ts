/**
 * Dış sahne: Kino dışarıda isteğini yapar (senaryo tablo 3), Mino fotoğraf makinesiyle gelir: "Gülümse!",
 * beyaz flaş, polaroid kayar ve albüme uçar. Dört mevsimin sahnesi:
 * - Kış · Kardan adam: kar topu yuvarlanıp büyür, toplar zıplayarak oturur, havuç burnu Kino takar, kardan adam göz kırpar.
 * - İlkbahar · Çiçek toplamak: çizmeyle çamurda pat pat, çiçekler sepete uçar, bir arı burnuna konar, Kino hapşırır.
 * - Yaz · Deniz: kovayı ters çevirip kumdan kale yapar, dalga gelip kaleyi götürür, Kino güler, yeniden yapar.
 * - Sonbahar · Su birikintisi: şemsiyesiyle birikintide şlap şlap zıplar; yağmurluk topu Mino sıçrayan sudan kaçar.
 * Yalnız transform / opacity; her sahne ~8 sn.
 */
import { efekt } from '../../src/audio/efekt';
import { konus, KINO_SESI } from '../../src/audio/konusma';
import { erisimVarMi } from '../../src/abonelik/kilit';
import { Mino } from '../../src/mino/mino';
import { h, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import G from '../../content/giysin.json';
import { bekle, kavis, ms, oynat } from './anim';
import { kardanAdam, polaroid, SEPET_CICEK } from './foto';
import { GiyinikKino } from './giyinik';
import { fotoEkle } from './kayit';
import { sonrakiMevsim, TURLAR, type GiysiId, type Mevsim } from './model';
import { taneKatmani } from './oda';
import { guvenliOlc, type Guvenli } from './guvenli';
import { onYukle, resim } from './resimler';

const kinoDe = (t: string) => konus(t, KINO_SESI);

export function disariEkrani(app: Uygulama, param?: { mevsim?: Mevsim; giyili?: GiysiId[] }): Ekran {
  const mevsim: Mevsim = param?.mevsim ?? 'kis';
  const tur = TURLAR[mevsim];
  const giyili: GiysiId[] = param?.giyili?.length ? param.giyili : tur.gerekli;
  onYukle(['polaroid', 'rozet-mevsim', `album-${mevsim}`]);
  const zemin = h('img.gy-dis-zemin', { src: resim(`dis-${mevsim}-yatay`), alt: '', draggable: 'false' });
  // hava: kar, taç yaprakları, güneş parıltısı, yağmur
  const hava = {
    kis: () => {
      const kar = h('div.gy-kar.yakin.dis.kar', { 'aria-hidden': 'true' });
      for (let i = 0; i < 28; i++) {
        const b = 6 + Math.random() * 12;
        kar.append(h('i', { style: `left:${(Math.random() * 100).toFixed(1)}%;width:${b.toFixed(0)}px;--b:${b.toFixed(0)}px;--sure:${(6 + Math.random() * 5).toFixed(1)}s;--gec:-${(Math.random() * 10).toFixed(1)}s;--salin:${(14 + Math.random() * 30).toFixed(0)}px` }));
      }
      return [kar];
    },
    ilkbahar: () => [taneKatmani(14, 'yakin.dis', 'cicek')],
    yaz: () => [taneKatmani(18, 'yakin.dis', 'gunes')],
    sonbahar: () => [h('div.gy-yagmur-gok.dis'), taneKatmani(46, 'uzak.dis', 'yagmur'), taneKatmani(22, 'yakin.dis', 'yagmur')],
  }[mevsim]();
  const kino = new GiyinikKino();
  for (const g of giyili) kino.giy(g, true);
  if (giyili.includes('semsiye')) kino.semsiyeAc(true, false);
  if (mevsim === 'ilkbahar') kino.ekParca('sepet-cicek', 'esya-cicek', SEPET_CICEK, 'sepet');
  const kinoKutu = h('div.gy-dis-kutu', {}, kino.el);
  const kinoYer = h('div.gy-dis-kino', {}, kinoKutu);
  // sahnenin eşyası (kardan adam, kale, birikinti, çamur): Kino'nun önünde / yanında
  const esyaYer = h('div.gy-dis-esya');
  const onPlan = h('div.gy-dis-on');
  // Mino: fotoğraf makinesiyle (sonbaharda yağmurluk topu hâlinde, uzakta bekler)
  const yagmurlukMino = mevsim === 'sonbahar';
  const mino = yagmurlukMino ? null : new Mino();
  const minoGorsel = mino ? mino.el : h('img.gy-mino-top', { src: resim('mino-yagmurluk'), alt: '', draggable: 'false' });
  const kamera = h('img.gy-kamera', { src: resim('kamera'), alt: '', draggable: 'false' });
  const minoKutu = h('div.gy-mino-kutu', {}, minoGorsel);
  const minoYer = h(`div.gy-dis-mino${yagmurlukMino ? '.top' : ''}`, {}, minoKutu, kamera);
  const flas = h('div.gy-beyaz.acik');
  const cikis = app.secenekler.cikis;
  const geri = cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : h('div', { style: 'width:56px' });
  const albumD = yuvarlakDugme(IKON.album, G.yazi.album, () => app.git('album'), 'kucuk gy-album-dugme');
  const son = h('div.gy-son');
  const sahne = h(`div.gy-dis-sahne.${mevsim}`, {}, zemin, esyaYer, kinoYer, minoYer, onPlan, ...hava);
  const el = h(`div.gy-ekran.gy-dis.${mevsim}`, {}, sahne, h('div.gy-ust', {}, geri, albumD), son, flas);
  el.dataset.mevsim = mevsim;
  let kapandi = false;

  let W = 0, H = 0, dikey = false, yer = 0, ks = 0;
  let g: Guvenli = { ust: 0, sag: 0, alt: 0, sol: 0 };
  /** güvenli alanın içinde yatay oran → px */
  const X = (f: number) => g.sol + (W - g.sol - g.sag) * f;
  const kutu = (e: HTMLElement, x: number, y: number, w: number, hh: number) => Object.assign(e.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${hh}px` });
  function yerlesim() {
    W = el.clientWidth || innerWidth;
    H = el.clientHeight || innerHeight;
    dikey = H > W * 1.1;
    // telefon önce: çentik ve ana ekran çubuğu payı; yatay konumlar güvenli alanın içinde (X)
    g = guvenliOlc(el);
    zemin.src = resim(dikey ? `dis-${mevsim}-dikey` : `dis-${mevsim}-yatay`);
    const u = dikey ? W : Math.min(H, (W - g.sol - g.sag) * 0.56);
    yer = Math.min(H * (dikey ? 0.82 : 0.9), H - g.alt - (dikey ? H * 0.08 : 4));
    ks = u * (dikey ? 0.62 : 0.74);
    kutu(kinoYer, X(dikey ? 0.27 : 0.25) - ks / 2, yer - ks * 0.93, ks, ks);
    const mw = u * (dikey ? 0.48 : 0.5);
    kutu(minoYer, X(dikey ? 0.74 : 0.84) - mw / 2, yer - mw * 1.0 + (dikey ? mw * 0.75 : 0), mw, mw);
    if (dikey) minoYer.style.top = `${H * 0.52}px`;
    // yağmurluk topu Mino uzakta bekler (dikeyde sokağın gerisinde, küçük)
    if (yagmurlukMino) {
      if (dikey) kutu(minoYer, X(0.8) - mw * 0.3, yer - mw * 0.72 - H * 0.17, mw * 0.6, mw * 0.72);
      else kutu(minoYer, X(0.86) - mw * 0.4, yer - mw * 0.95, mw * 0.8, mw * 0.95);
    }
    sahneYerlesim();
  }
  let sahneYerlesim = () => {};
  const ro = new ResizeObserver(yerlesim);
  ro.observe(el);

  const zipla = (e: HTMLElement, yuk = 1, sure = 600) =>
    oynat(e, [
      { transform: 'none' },
      { transform: `scale(${1 + 0.07 * yuk}, ${1 - 0.09 * yuk})`, offset: 0.18 },
      { transform: `translateY(${-16 * yuk}%) scale(${1 - 0.05 * yuk}, ${1 + 0.08 * yuk})`, offset: 0.5 },
      { transform: `scale(${1 + 0.07 * yuk}, ${1 - 0.07 * yuk})`, offset: 0.8 },
      { transform: 'none' },
    ], sure, { easing: 'linear' });
  /** iniş: yukarıdan gelen parça oturur, ezilip toparlanır */
  const kon = (e: HTMLElement, sure = 640) =>
    oynat(e, [
      { transform: 'translateY(-260%) scale(0.9, 1.1)', opacity: 0 },
      { transform: 'translateY(-260%) scale(0.9, 1.1)', opacity: 1, offset: 0.05 },
      { transform: 'translateY(0) scale(1.18, 0.8)', offset: 0.62 },
      { transform: 'translateY(-6%) scale(0.95, 1.05)', offset: 0.8 },
      { transform: 'none', opacity: 1 },
    ], sure, { easing: 'cubic-bezier(.5,0,.6,1)', fill: 'backwards' });
  /** Kino'nun yürüyerek x'e (px, kendi kutusuna göre) gitmesi */
  let kinoX = 0;
  async function yuru(x: number, sure: number, zip = 2) {
    void kino.k.oynat('yuru', sure);
    const kare: Keyframe[] = [];
    for (let i = 0; i <= zip * 2; i++) kare.push({ transform: `translateX(${kinoX + ((x - kinoX) * i) / (zip * 2)}px) translateY(${i % 2 ? -4 : 0}%)` });
    await oynat(kinoYer, kare, sure, { easing: 'linear', fill: 'forwards' });
    kinoX = x;
  }
  /** Kino'nun bir noktaya sıçraması (birikintiye, çamura) */
  async function sicra(x: number, sure = 560, yuk = 1) {
    await oynat(kinoKutu, [{ transform: 'none' }, { transform: 'scale(1.08, 0.88)' }], 160, { fill: 'forwards' });
    void oynat(kinoKutu, [{ transform: 'scale(1.08, 0.88)' }, { transform: 'scale(0.94, 1.08)', offset: 0.3 }, { transform: 'scale(0.98, 1.02)', offset: 0.8 }, { transform: 'scale(1.12, 0.86)' }], sure, { fill: 'forwards' });
    await oynat(kinoYer, [{ transform: `translateX(${kinoX}px)` }, { transform: `translateX(${(kinoX + x) / 2}px) translateY(${-26 * yuk}%)` }, { transform: `translateX(${x}px)` }], sure, { easing: 'cubic-bezier(.3,.1,.6,1)', fill: 'forwards' });
    kinoX = x;
    void oynat(kinoKutu, [{ transform: 'scale(1.12, 0.86)' }, { transform: 'scale(0.97, 1.04)', offset: 0.5 }, { transform: 'none' }], 300, { fill: 'forwards' });
  }
  /** Kutu içindeki bir tuval noktasının (2048) ekran yeri */
  const kinoNokta = (tx: number, ty: number) => {
    const r = kino.el.getBoundingClientRect();
    return { x: r.left + (tx / 2048) * r.width, y: r.top + (ty / 2048) * r.height };
  };
  /** Sahnede (el koordinatı) sıçrayan damlalar */
  function damla(sinif: string, x: number, y: number, adet: number, yay = 120) {
    for (let i = 0; i < adet; i++) {
      const d = h(`i.${sinif}`, { style: `left:${x}px;top:${y}px` });
      onPlan.append(d);
      const dx = (Math.random() - 0.5) * 2 * yay, up = 40 + Math.random() * 70;
      void oynat(d, [{ transform: 'translate(-50%,-50%) scale(0.4)', opacity: 1 }, { transform: `translate(calc(-50% + ${dx * 0.55}px), calc(-50% - ${up}px)) scale(1)`, opacity: 1, offset: 0.4 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${up * 0.4}px)) scale(0.8)`, opacity: 0 }], 750, { delay: ms(i * 25), easing: 'cubic-bezier(.3,.6,.6,1)' }).then(() => d.remove());
    }
  }
  /** Parıltı yıldızları (sahnede bir nokta çevresinde) */
  function yildizlar(x: number, y: number, r: number, adet = 6) {
    efekt.tink();
    for (let i = 0; i < adet; i++) {
      const a = (i / adet) * Math.PI * 2 + Math.random() * 0.5;
      const s = h('i.gy-yildiz', { style: `left:${x}px;top:${y}px` });
      onPlan.append(s);
      void oynat(s, [{ transform: 'translate(-50%,-50%) scale(0) rotate(0deg)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r * 0.7}px)) scale(1.2) rotate(90deg)`, opacity: 1, offset: 0.6 }, { transform: `translate(calc(-50% + ${Math.cos(a) * r * 1.2}px), calc(-50% + ${Math.sin(a) * r * 0.8}px)) scale(0.2) rotate(160deg)`, opacity: 0 }], 800, { delay: ms(i * 50), easing: 'ease-out' }).then(() => s.remove());
    }
  }
  const sahneNokta = (e: HTMLElement, fx = 0.5, fy = 0.5) => {
    const r = e.getBoundingClientRect(), s = sahne.getBoundingClientRect();
    return { x: r.left - s.left + r.width * fx, y: r.top - s.top + r.height * fy };
  };

  // ------------------------------------------------------------ mevsim sahneleri
  async function kis() {
    const ka = kardanAdam();
    const top = h('img.gy-yuvarlanan', { src: resim('kardan-buyuk'), alt: '', draggable: 'false' });
    const kardanYer = h('div.gy-dis-kardan', {}, ka.el, top);
    esyaYer.append(kardanYer);
    sahneYerlesim = () => {
      const u = dikey ? W : Math.min(H, W * 0.56);
      const kw = u * (dikey ? 0.4 : 0.36);
      kutu(kardanYer, X(dikey ? 0.68 : 0.585) - kw / 2, yer - kw * 1.9 + kw * 0.04, kw, kw * 1.9);
    };
    sahneYerlesim();
    for (const e of [ka.govde, ka.orta, ka.bas, ka.havuc, ka.dalSol, ka.dalSag, ka.atki]) e.style.opacity = '0';
    ka.yuz.style.opacity = '0';
    // Kino soldan girer
    void kino.k.oynat('yuru', 1000);
    await oynat(kinoYer, [{ transform: 'translateX(-90%)' }, { transform: 'translateX(-40%) translateY(-6%)', offset: 0.5 }, { transform: 'none' }], 1000, { easing: 'cubic-bezier(.3,.6,.4,1)' });
    // kar topu Kino'nun önünde belirir, yuvarlanarak büyür; Kino iterek peşinden gider
    const kr = kinoYer.getBoundingClientRect(), sr = kardanYer.getBoundingClientRect();
    const yol = kr.left + kr.width * 0.66 - sr.left;
    top.style.opacity = '1';
    void kino.k.oynat('yuru', 2000);
    efekt.dagit();
    const it = Math.max(0, sr.left - kr.left - kr.width * 0.62);
    void oynat(kinoYer, [{ transform: 'none' }, { transform: `translateX(${it * 0.25}px) translateY(-3%)`, offset: 0.25 }, { transform: `translateX(${it * 0.5}px)`, offset: 0.5 }, { transform: `translateX(${it * 0.75}px) translateY(-3%)`, offset: 0.75 }, { transform: `translateX(${it}px)` }], 2000, { easing: 'linear', fill: 'forwards' });
    await oynat(top, [
      { transform: `translateX(${yol}px) scale(0.22) rotate(0deg)` },
      { transform: `translateX(${yol * 0.45}px) scale(0.6) rotate(-300deg)`, offset: 0.55 },
      { transform: 'translateX(0) scale(1.04, 0.95) rotate(-560deg)', offset: 0.92 },
      { transform: 'translateX(0) scale(1) rotate(-560deg)' },
    ], 2000, { easing: 'cubic-bezier(.35,0,.4,1)', fill: 'forwards' });
    ka.govde.style.opacity = '1';
    top.style.opacity = '0';
    void oynat(ka.govde, [{ transform: 'scale(1.06, 0.92)' }, { transform: 'none' }], 300, { easing: 'ease-out' });
    efekt.yapis();
    // Kino geri adım atar, sevinir; orta top ve baş zıplayarak oturur
    void oynat(kinoYer, [{ transform: `translateX(${it}px)` }, { transform: `translateX(${it * 0.6}px)` }], 500, { fill: 'forwards', easing: 'ease-out' });
    kino.k.ifade('heyecan', 900);
    void zipla(kino.el, 0.5);
    ka.orta.style.opacity = '1';
    await kon(ka.orta);
    efekt.yapis();
    ka.bas.style.opacity = '1';
    await kon(ka.bas, 600);
    efekt.yapis();
    // yüz, kollar, atkı
    ka.yuz.style.opacity = '1';
    void oynat(ka.yuz, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.2)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], 380, { easing: 'ease-out' });
    for (const [d, a] of [[ka.dalSol, -1], [ka.dalSag, 1]] as const) {
      d.style.opacity = '1';
      void oynat(d, [{ transform: `rotate(${a * 70}deg) scale(0.4)`, opacity: 0 }, { transform: `rotate(${a * -10}deg) scale(1.05)`, opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], 520, { easing: 'ease-out', delay: ms(a > 0 ? 120 : 0) });
    }
    await bekle(400);
    ka.atki.style.opacity = '1';
    await kon(ka.atki, 520);
    // Kino zıplar, havucu burna takar
    void zipla(kino.el, 1, 700);
    await bekle(260);
    const kk = kino.el.getBoundingClientRect(), hr = ka.havuc.getBoundingClientRect();
    const uc = h('img.gy-ucan-havuc', { src: resim('kardan-havuc'), alt: '', style: `width:${hr.width}px` });
    el.append(uc);
    efekt.ucus();
    await kavis(uc, { x: kk.left + kk.width * 0.62, y: kk.top + kk.height * 0.55 }, { x: hr.left + hr.width / 2, y: hr.top + hr.height / 2 }, 650, { s0: 0.7, s1: 1, don: 360, tepe: -H * 0.18 });
    uc.remove();
    ka.havuc.style.opacity = '1';
    efekt.yapis();
    void oynat(ka.havuc, [{ transform: 'rotate(-14deg)' }, { transform: 'rotate(9deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'none' }], 600, { easing: 'ease-out' });
    void oynat(ka.bas, [{ transform: 'none' }, { transform: 'translateX(-3%) rotate(-4deg)' }, { transform: 'none' }], 500);
    await bekle(350);
    // kardan adam göz kırpar
    void oynat(ka.gozSag, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.12)', offset: 0.35 }, { transform: 'scaleY(0.12)', offset: 0.6 }, { transform: 'scaleY(1)' }], 520, { easing: 'ease-in-out' });
    void oynat(ka.bas, [{ transform: 'none' }, { transform: 'rotate(6deg)', offset: 0.4 }, { transform: 'rotate(6deg)', offset: 0.6 }, { transform: 'none' }], 700, { easing: 'ease-in-out' });
    await bekle(300);
    kino.k.ifade('heyecan', 1600);
    void zipla(kino.el, 1.2, 760);
    await kinoDe(G.kino.yasasin);
  }

  async function ilkbahar() {
    const camur = h('img.gy-dis-camur', { src: resim('esya-camur'), alt: '', draggable: 'false' });
    esyaYer.append(camur);
    sahneYerlesim = () => {
      const cw = ks * 0.75;
      kutu(camur, X(dikey ? 0.5 : 0.43) - cw / 2, yer - cw * 0.13, cw, cw * 0.236);
    };
    sahneYerlesim();
    // Kino soldan girer, çamura bakar, çizmeleriyle içine zıplar: pat pat, çamur sıçrar, keyif
    void oynat(kinoYer, [{ transform: 'translateX(-90%)' }], 1, { fill: 'forwards' });
    kinoX = -ks * 0.9;
    await yuru(0, 1000);
    kino.k.ifade('heyecan', 1200);
    const c = sahneNokta(camur);
    const kr = sahneNokta(kinoYer);
    const hedef = c.x - kr.x;
    await sicra(hedef, 620, 1.1);
    efekt.vicik();
    damla('gy-camur-damla', c.x, c.y, 10, ks * 0.4);
    void kinoDe(G.kino.pat);
    for (let i = 0; i < 2; i++) {
      await zipla(kinoKutu, 0.6, 420);
      efekt.vicik();
      damla('gy-camur-damla', c.x + (i ? 20 : -20), c.y, 6, ks * 0.3);
    }
    // çiçekler: Kino koklar, demet demet sepete uçar
    await yuru(hedef + ks * (dikey ? 0.25 : 0.55), 900);
    void kino.k.oynat('kokla', 1300);
    kino.k.ifade('keyif', 1500);
    for (let i = 0; i < 3; i++) {
      const s = kinoNokta(1330, 1560);
      const kr2 = kino.el.getBoundingClientRect();
      const cc = h('img.gy-ucan-cicek', { src: resim('esya-cicek'), alt: '', style: `width:${kr2.width * 0.12}px` });
      el.append(cc);
      efekt.ucus();
      await kavis(cc, { x: kr2.left + kr2.width * (0.75 + i * 0.12), y: kr2.top + kr2.height * 1.0 }, s, 520, { s0: 0.5, s1: 1, don: 30, tepe: -kr2.height * 0.35 });
      cc.remove();
      efekt.yapis();
      kino.ekGoster('sepet-cicek', true, 0.7 + i * 0.15);
      await bekle(120);
    }
    // arı gelir, vızıldar, burnuna konar
    const ari = h('img.gy-ari', { src: resim('esya-ari'), alt: '', draggable: 'false' });
    el.append(ari);
    const kr3 = kino.el.getBoundingClientRect();
    const aw = kr3.width * 0.12;
    ari.style.width = `${aw}px`;
    const burun = kinoNokta(915, 830);
    const yolu: Keyframe[] = [];
    const bx = W + aw, by = H * 0.18;
    for (let i = 0; i <= 14; i++) {
      const u = i / 14;
      const x = bx + (burun.x - bx) * u + Math.sin(u * Math.PI * 4) * 30 * (1 - u);
      const y = by + (burun.y - aw * 0.22 - by) * u + Math.cos(u * Math.PI * 5) * 40 * (1 - u);
      yolu.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${Math.sin(u * 20) * 10}deg)` });
    }
    efekt.vizilti(1.6);
    await oynat(ari, yolu, 1500, { easing: 'ease-out', fill: 'forwards' });
    kino.k.ifade('saskin', 1400);
    void oynat(ari, [{ transform: `translate(${burun.x}px, ${burun.y - aw * 0.22}px) translate(-50%,-50%) rotate(0deg)` }, { transform: `translate(${burun.x}px, ${burun.y - aw * 0.17}px) translate(-50%,-50%) rotate(-6deg)` }, { transform: `translate(${burun.x}px, ${burun.y - aw * 0.22}px) translate(-50%,-50%) rotate(4deg)` }], 300, { iterations: 3, fill: 'forwards' });
    void kino.k.oynat('kokla', 900);
    await bekle(900);
    // hazırlık: başını geriye atar, nefes alır … hapşu! arı fırıl fırıl uçar gider
    await oynat(kinoKutu, [{ transform: 'none' }, { transform: 'rotate(-7deg) scale(0.97, 1.06)' }], 420, { fill: 'forwards', easing: 'ease-in' });
    void kinoDe(G.kino.hapsu);
    kino.k.ifade('keyif', 900);
    void oynat(kinoKutu, [{ transform: 'rotate(-7deg) scale(0.97, 1.06)' }, { transform: 'rotate(6deg) scale(1.1, 0.88) translateX(3%)', offset: 0.2 }, { transform: 'rotate(-2deg) scale(0.98, 1.02)', offset: 0.6 }, { transform: 'none' }], 650, { fill: 'forwards' });
    for (let i = 0; i < 6; i++) {
      const p = h('i.gy-hapsu', { style: `left:${burun.x}px;top:${burun.y}px` });
      el.append(p);
      void oynat(p, [{ transform: 'translate(-50%,-50%) scale(0.3)', opacity: 0.9 }, { transform: `translate(calc(-50% + ${30 + Math.random() * 70}px), calc(-50% + ${(Math.random() - 0.5) * 60}px)) scale(1)`, opacity: 0 }], 600, { delay: ms(i * 30) }).then(() => p.remove());
    }
    const kac: Keyframe[] = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      kac.push({ transform: `translate(${burun.x + u * (W - burun.x + aw * 2) + Math.cos(u * 12) * 30 * (1 - u)}px, ${burun.y - aw * 0.22 - u * H * 0.5 + Math.sin(u * 12) * 30 * (1 - u)}px) translate(-50%,-50%) rotate(${u * 720}deg)` });
    }
    efekt.ucus();
    void oynat(ari, kac, 1100, { easing: 'ease-out', fill: 'forwards' }).then(() => ari.remove());
    await bekle(700);
    kino.k.ifade('heyecan', 1400);
    await zipla(kinoKutu, 1, 700);
    void kinoDe(G.kino.yasasin);
    await bekle(500);
  }

  async function yaz() {
    const kale = h('img.gy-kale', { src: resim('esya-kale'), alt: '', draggable: 'false' });
    const dalga = h('img.gy-dalga', { src: resim('esya-dalga'), alt: '', draggable: 'false' });
    const kova = h('img.gy-ucan-kova', { src: resim('esya-kova'), alt: '', draggable: 'false' });
    esyaYer.append(kale);
    onPlan.append(dalga);
    kale.style.opacity = '0';
    dalga.style.opacity = '0';
    sahneYerlesim = () => {
      const kw = ks * 0.58;
      kutu(kale, X(dikey ? 0.68 : 0.585) - kw / 2, yer - kw * 0.87 + ks * 0.02, kw, kw * 0.87);
      const dw = ks * 1.5;
      kutu(dalga, X(dikey ? 0.68 : 0.585) - dw * 0.2, yer - dw * 0.42, dw, dw * 0.45);
    };
    sahneYerlesim();
    void oynat(kinoYer, [{ transform: 'translateX(-90%)' }], 1, { fill: 'forwards' });
    kinoX = -ks * 0.9;
    await yuru(0, 1000);
    const kRect = sahneNokta(kale);
    const kr = sahneNokta(kinoYer);
    await yuru(Math.max(0, kRect.x - kr.x - ks * 0.62), 900);
    // kovayı ters çevirir: kova patiden kaleye uçar, ağzı aşağı oturur; Kino üstüne pat pat vurur
    const yap = async (hizli: boolean) => {
      const p = kinoNokta(1330, 1700);
      const kale0 = kale.getBoundingClientRect();
      const kw = kale0.width * 0.62;
      kova.style.width = `${kw}px`;
      el.append(kova);
      kino.giy('kova', false);
      efekt.ucus();
      await kavis(kova, p, { x: kale0.left + kale0.width / 2, y: kale0.top + kale0.height - kw * 0.62 }, hizli ? 380 : 560, { s0: 0.5, s1: 1, don: 180, tepe: -H * 0.12 });
      efekt.yapis();
      for (let i = 0; i < (hizli ? 1 : 2); i++) {
        await zipla(kinoKutu, 0.4, 380);
        efekt.dokunma();
      }
      // kova kalkar: altından kale çıkar (dalganın bıraktığı animasyonlar silinir)
      for (const a of kale.getAnimations()) a.cancel();
      kale.style.opacity = '1';
      efekt.yapis();
      void oynat(kale, [{ transform: 'scale(0.85, 0.55)' }, { transform: 'scale(1.06, 1.1)', offset: 0.55 }, { transform: 'scale(0.98, 0.97)', offset: 0.8 }, { transform: 'none' }], 520, { easing: 'ease-out' });
      await kavis(kova, { x: kale0.left + kale0.width / 2, y: kale0.top + kale0.height - kw * 0.62 }, p, hizli ? 380 : 520, { s0: 1, s1: 0.5, don: -180, tepe: -H * 0.14 });
      kova.remove();
      kino.giy('kova', true);
      const kc = sahneNokta(kale, 0.5, 0.15);
      yildizlar(kc.x, kc.y, kale.getBoundingClientRect().width * 0.5);
      kino.k.ifade('heyecan', 1300);
      await zipla(kinoKutu, 0.9, 640);
    };
    await yap(false);
    void kinoDe(G.kino.yasasin);
    await bekle(500);
    // dalga gelir: sağdan kabarır, kalenin üstüne kırılır, kale erir; dalga geri çekilir
    dalga.style.opacity = '1';
    efekt.dalga();
    await oynat(dalga, [{ transform: 'translateX(70%) scaleY(0.4)', opacity: 0 }, { transform: 'translateX(20%) scaleY(0.9)', opacity: 1, offset: 0.5 }, { transform: 'translateX(-28%) scaleY(1.05)', opacity: 1 }], 1100, { easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
    void oynat(kale, [{ transform: 'none', opacity: 1 }, { transform: 'scale(1.1, 0.4) translateY(30%)', opacity: 0.6, offset: 0.5 }, { transform: 'scale(1.2, 0.1) translateY(60%)', opacity: 0 }], 600, { fill: 'forwards' });
    kino.k.ifade('saskin', 1200);
    void oynat(kinoKutu, [{ transform: 'none' }, { transform: 'translateX(-4%) rotate(-5deg)', offset: 0.3 }, { transform: 'none' }], 700);
    damla('gy-su-damla', sahneNokta(kale).x, sahneNokta(kale).y, 10, ks * 0.4);
    await oynat(dalga, [{ transform: 'translateX(-28%) scaleY(1.05)', opacity: 1 }, { transform: 'translateX(60%) scaleY(0.5)', opacity: 0 }], 900, { easing: 'ease-in', fill: 'forwards' });
    kale.style.opacity = '0';
    // Kino güler: "Dalga geldi!", sonra yine yapar
    kino.k.ifade('heyecan', 1500);
    void zipla(kinoKutu, 0.7, 560);
    await kinoDe(G.kino.dalga);
    void kinoDe(G.kino.yine_yaparim);
    await yap(true);
  }

  async function sonbahar() {
    const gol = h('img.gy-dis-birikinti', { src: resim('esya-birikinti'), alt: '', draggable: 'false' });
    const sicrama = h('img.gy-dis-sicrama', { src: resim('esya-sicrama'), alt: '', draggable: 'false' });
    esyaYer.append(gol);
    onPlan.append(sicrama);
    sicrama.style.opacity = '0';
    sahneYerlesim = () => {
      const gw = ks * 1.05;
      kutu(gol, X(dikey ? 0.45 : 0.47) - gw / 2, yer - gw * 0.12, gw, gw * 0.236);
      const sw = ks * 0.8;
      kutu(sicrama, X(dikey ? 0.45 : 0.47) - sw / 2, yer - sw * 0.6, sw, sw * 0.71);
    };
    sahneYerlesim();
    void oynat(kinoYer, [{ transform: 'translateX(-90%)' }], 1, { fill: 'forwards' });
    kinoX = -ks * 0.9;
    await yuru(0, 1100);
    kino.k.ifade('heyecan', 1000);
    const g = sahneNokta(gol);
    const kr = sahneNokta(kinoYer);
    const merkez = g.x - kr.x;
    // üç zıplama: her inişte şlap! su sıçrar; üçüncüsü en büyüğü, sular Mino'ya kadar gider
    const adimlar = [merkez - ks * 0.12, merkez + ks * 0.1, merkez];
    for (let i = 0; i < 3; i++) {
      await sicra(adimlar[i], i === 2 ? 700 : 520, i === 2 ? 1.5 : 1);
      efekt.sicrama();
      const buyuk = i === 2;
      void oynat(sicrama, [{ transform: 'scale(0.2, 0.1)', opacity: 1 }, { transform: `scale(${buyuk ? 1.35 : 1}, ${buyuk ? 1.3 : 1})`, opacity: 1, offset: 0.45 }, { transform: `scale(${buyuk ? 1.5 : 1.15}, ${buyuk ? 1.1 : 0.85})`, opacity: 0 }], buyuk ? 700 : 520, { easing: 'ease-out' });
      damla('gy-su-damla', g.x, g.y, buyuk ? 16 : 8, ks * (buyuk ? 0.7 : 0.4));
      if (i === 0) void kinoDe(G.kino.pat);
      void oynat(gol, [{ transform: 'scale(1)' }, { transform: 'scale(1.06, 0.92)' }, { transform: 'none' }], 400);
      if (buyuk) {
        // su Mino'ya doğru: yağmurluk topu Mino hop diye geri kaçar, sallanır
        const m = sahneNokta(minoYer, 0.3, 0.6);
        for (let k = 0; k < 6; k++) {
          const d = h('i.gy-su-damla', { style: `left:${g.x}px;top:${g.y}px` });
          onPlan.append(d);
          void oynat(d, [{ transform: 'translate(-50%,-50%)', opacity: 1 }, { transform: `translate(calc(-50% + ${(m.x - g.x) * 0.5}px), calc(-50% - ${H * 0.18}px))`, opacity: 1, offset: 0.5 }, { transform: `translate(calc(-50% + ${(m.x - g.x) * (0.85 + k * 0.03)}px), calc(-50% + ${m.y - g.y}px))`, opacity: 0 }], 700, { delay: ms(k * 40) }).then(() => d.remove());
        }
        await bekle(350);
        efekt.ucus();
        await oynat(minoKutu, [{ transform: 'none' }, { transform: 'scale(1.1, 0.85)', offset: 0.15 }, { transform: 'translateX(22%) translateY(-18%) scale(0.95, 1.08)', offset: 0.55 }, { transform: 'translateX(32%) scale(1.08, 0.9)', offset: 0.85 }, { transform: 'translateX(32%)' }], 700, { fill: 'forwards' });
        void oynat(minoKutu, [{ transform: 'translateX(32%) rotate(0deg)' }, { transform: 'translateX(32%) rotate(-6deg)' }, { transform: 'translateX(32%) rotate(5deg)' }, { transform: 'translateX(32%) rotate(0deg)' }], 600, { fill: 'forwards' });
      }
      await bekle(buyuk ? 200 : 120);
    }
    kino.k.ifade('heyecan', 1600);
    await zipla(kinoKutu, 1, 700);
    await kinoDe(G.kino.yasasin);
  }

  async function oyna() {
    yerlesim();
    minoYer.style.opacity = yagmurlukMino ? '1' : '0';
    if (yagmurlukMino) kamera.style.opacity = '0';
    // beyaz ışıktan açılır
    void oynat(flas, [{ opacity: 1 }, { opacity: 0 }], 700, { fill: 'forwards' });
    void oynat(sahne, [{ transform: 'scale(1.08)' }, { transform: 'none' }], 1400, { easing: 'cubic-bezier(.2,.7,.2,1)' });
    if (mevsim === 'kis') await kis();
    else if (mevsim === 'ilkbahar') await ilkbahar();
    else if (mevsim === 'yaz') await yaz();
    else await sonbahar();
    if (kapandi) return;
    // Mino fotoğraf makinesiyle gelir (sonbaharda yağmurluk topu zaten orada; makine elinde belirir)
    if (mino) {
      minoYer.style.opacity = '1';
      await oynat(minoYer, [{ transform: 'translateX(120%)' }, { transform: 'translateX(-6%)', offset: 0.75 }, { transform: 'none' }], 800, { easing: 'cubic-bezier(.3,.7,.3,1)' });
      mino.tepki('selam');
    } else {
      kamera.style.opacity = '1';
      void oynat(kamera, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], 380);
    }
    await konus(G.mino.gulumse);
    kino.k.ifade('heyecan', 2500);
    void oynat(kamera, [{ transform: 'none' }, { transform: 'scale(1.15, 0.88)', offset: 0.4 }, { transform: 'none' }], 260);
    efekt.dagit();
    // beyaz flaş: ekran donar
    await oynat(flas, [{ opacity: 0 }, { opacity: 0.95, offset: 0.15 }, { opacity: 0 }], 700, { fill: 'forwards' });
    await fotograf();
  }

  async function fotograf() {
    const p = polaroid(mevsim, giyili);
    el.append(p);
    const kr = kamera.getBoundingClientRect();
    const pw = Math.min(W * (dikey ? 0.6 : 0.3), H * 0.52);
    p.style.width = `${pw}px`;
    // makineden kayarak çıkar, ortaya gelir, bekler, albüme uçar
    await kavis(p, { x: kr.left + kr.width / 2, y: kr.top + kr.height / 2 }, { x: W / 2, y: H * 0.47 }, 900, { s0: 0.15, s1: 1, don: -366, tepe: -H * 0.12 });
    await bekle(1300);
    const a = albumD.getBoundingClientRect();
    efekt.ucus();
    void konus(G.mino.albume);
    await kavis(p, { x: W / 2, y: H * 0.47 }, { x: a.left + a.width / 2, y: a.top + a.height / 2 }, 800, { s0: 1, s1: 0.12, don: 12, tepe: -60 });
    p.remove();
    const rozet = fotoEkle(mevsim, giyili);
    efekt.yapis();
    void oynat(albumD, [{ transform: 'scale(1)' }, { transform: 'scale(1.35, 0.8)', offset: 0.3 }, { transform: 'scale(0.9, 1.15)', offset: 0.6 }, { transform: 'none' }], 520, { easing: 'ease-out' });
    efekt.konfeti();
    mino?.tepki('sevinc');
    await bekle(700);
    if (kapandi) return;
    if (rozet) await rozetToreni();
    if (kapandi) return;
    sonDugmeleri();
  }

  /** Dört mevsim doldu: Mevsim Ustası rozeti ortada parlayarak belirir, konfeti, sonra albüme uçar */
  async function rozetToreni() {
    const r = h('div.gy-rozet-toren', {}, h('i.gy-rozet-isik'), h('img', { src: resim('rozet-mevsim'), alt: G.yazi.rozet, draggable: 'false' }), h('span', {}, G.yazi.rozet));
    el.append(r);
    el.dataset.rozet = '1';
    efekt.kilitAcildi();
    void oynat(r.querySelector('.gy-rozet-isik'), [{ transform: 'scale(0.3) rotate(0deg)', opacity: 0 }, { transform: 'scale(1) rotate(40deg)', opacity: 1, offset: 0.3 }, { transform: 'scale(1.1) rotate(160deg)', opacity: 0.8 }], 3000, { fill: 'forwards' });
    await oynat(r.querySelector('img'), [{ transform: 'scale(0) rotate(-30deg)', opacity: 0 }, { transform: 'scale(1.15) rotate(6deg)', opacity: 1, offset: 0.65 }, { transform: 'scale(1) rotate(0deg)', opacity: 1 }], 700, { easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
    void oynat(r.querySelector('span'), [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 400, { fill: 'forwards' });
    efekt.konfeti();
    kino.k.ifade('heyecan', 2500);
    void zipla(kinoKutu, 1, 700);
    mino?.tepki('dans', 2);
    await konus(G.mino.rozet);
    await bekle(1600);
    await oynat(r, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.5) translateY(-30%)' }], 500, { fill: 'forwards' });
    r.remove();
  }

  function sonDugmeleri() {
    // son: yeniden oyna, sonraki mevsim (abonelik kilidi), albüm
    const tekrar = h('button.gy-son-dugme', { type: 'button', 'aria-label': G.yazi.tekrar }, h('span.gy-son-ikon', { html: IKON.oyna }), h('span', {}, G.yazi.tekrar));
    tekrar.addEventListener('click', () => {
      efekt.dokunma();
      app.git('oda', { mevsim });
    });
    son.append(tekrar);
    const s = sonrakiMevsim(mevsim);
    if (s) {
      const ileri = h(`button.gy-son-dugme.sonraki.${s}`, { type: 'button', 'aria-label': G.yazi.sonraki, 'data-mevsim': s }, h('span.gy-son-agac', {}, h('img', { src: resim(`pencere-${s}-on`), alt: '' })), h('span', {}, G.yazi[s]));
      ileri.addEventListener('click', () => {
        efekt.dokunma();
        if (!erisimVarMi(`giysin/${s}`, app.kok)) return;
        app.git('gecis', { den: mevsim, ye: s });
      });
      son.append(ileri);
    }
    son.classList.add('acik');
    for (const [i, b] of [...son.children].entries()) void oynat(b, [{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], 480, { delay: ms(i * 120), easing: 'ease-out', fill: 'backwards' });
    void konus(G.mino.yine);
  }

  requestAnimationFrame(() => void oyna());
  void TEST_MODU;
  return {
    el,
    kapat: () => {
      kapandi = true;
      ro.disconnect();
      kino.kapat();
      mino?.kapat();
    },
  };
}
