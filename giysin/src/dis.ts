/**
 * Dış sahne (Kış · Kardan adam): Kino kar topunu yuvarlar, top büyür; iki top daha üstüne zıplar, yüz, kollar,
 * atkı gelir; havuç burnu Kino takar, kardan adam göz kırpar. Mino fotoğraf makinesiyle gelir: "Gülümse!",
 * beyaz flaş, polaroid kayar ve albüme uçar. Yalnız transform / opacity; ~8 sn.
 */
import { efekt } from '../../src/audio/efekt';
import { konus, KINO_SESI } from '../../src/audio/konusma';
import { Mino } from '../../src/mino/mino';
import { h, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import G from '../../content/giysin.json';
import { bekle, kavis, ms, oynat } from './anim';
import { kardanAdam, polaroid } from './foto';
import { GiyinikKino } from './giyinik';
import { fotoEkle } from './kayit';
import type { GiysiId } from './model';
import { resim } from './resimler';

export function disariEkrani(app: Uygulama, param?: { giyili?: GiysiId[] }): Ekran {
  const giyili: GiysiId[] = param?.giyili?.length ? param.giyili : ['corap', 'bot', 'mont', 'bere', 'eldiven'];
  const zemin = h('img.gy-dis-zemin', { src: resim('dis-kis-yatay'), alt: '', draggable: 'false' });
  const kar = h('div.gy-kar.yakin.dis', { 'aria-hidden': 'true' });
  for (let i = 0; i < 28; i++) {
    const b = 6 + Math.random() * 12;
    kar.append(h('i', { style: `left:${(Math.random() * 100).toFixed(1)}%;width:${b.toFixed(0)}px;--b:${b.toFixed(0)}px;--sure:${(6 + Math.random() * 5).toFixed(1)}s;--gec:-${(Math.random() * 10).toFixed(1)}s;--salin:${(14 + Math.random() * 30).toFixed(0)}px` }));
  }
  const kino = new GiyinikKino();
  for (const g of giyili) kino.giy(g, true);
  const kinoYer = h('div.gy-dis-kino', {}, kino.el);
  const ka = kardanAdam();
  const top = h('img.gy-yuvarlanan', { src: resim('kardan-buyuk'), alt: '', draggable: 'false' });
  const kardanYer = h('div.gy-dis-kardan', {}, ka.el, top);
  const mino = new Mino();
  const kamera = h('img.gy-kamera', { src: resim('kamera'), alt: '', draggable: 'false' });
  const minoYer = h('div.gy-dis-mino', {}, mino.el, kamera);
  const flas = h('div.gy-beyaz.acik');
  const cikis = app.secenekler.cikis;
  const geri = cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : h('div', { style: 'width:56px' });
  const albumD = yuvarlakDugme(IKON.album, G.yazi.album, () => app.git('album'), 'kucuk gy-album-dugme');
  const son = h('div.gy-son');
  const sahne = h('div.gy-dis-sahne', {}, zemin, kardanYer, kinoYer, minoYer, kar);
  const el = h('div.gy-ekran.gy-dis', {}, sahne, h('div.gy-ust', {}, geri, albumD), son, flas);
  let kapandi = false;

  let W = 0, H = 0, dikey = false;
  function yerlesim() {
    W = el.clientWidth || innerWidth;
    H = el.clientHeight || innerHeight;
    dikey = H > W * 1.1;
    zemin.src = resim(dikey ? 'dis-kis-dikey' : 'dis-kis-yatay');
    const u = dikey ? W : Math.min(H, W * 0.56);
    const yer = H * (dikey ? 0.82 : 0.9);
    const kutu = (e: HTMLElement, x: number, y: number, w: number, hh: number) => Object.assign(e.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${hh}px` });
    const ks = u * (dikey ? 0.62 : 0.74);
    kutu(kinoYer, W * (dikey ? 0.27 : 0.25) - ks / 2, yer - ks * 0.93, ks, ks);
    const kw = u * (dikey ? 0.4 : 0.36);
    kutu(kardanYer, W * (dikey ? 0.68 : 0.585) - kw / 2, yer - kw * 1.9 + kw * 0.04, kw, kw * 1.9);
    const mw = u * (dikey ? 0.48 : 0.5);
    kutu(minoYer, W * (dikey ? 0.74 : 0.84) - mw / 2, yer - mw * 1.0 + (dikey ? mw * 0.75 : 0), mw, mw);
    if (dikey) minoYer.style.top = `${H * 0.52}px`;
  }
  const ro = new ResizeObserver(yerlesim);
  ro.observe(el);

  const kinoDe = (t: string) => konus(t, KINO_SESI);
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

  async function oyna() {
    yerlesim();
    for (const e of [ka.govde, ka.orta, ka.bas, ka.havuc, ka.dalSol, ka.dalSag, ka.atki]) e.style.opacity = '0';
    ka.yuz.style.opacity = '0';
    minoYer.style.opacity = '0';
    // beyaz ışıktan açılır
    void oynat(flas, [{ opacity: 1 }, { opacity: 0 }], 700, { fill: 'forwards' });
    void oynat(sahne, [{ transform: 'scale(1.08)' }, { transform: 'none' }], 1400, { easing: 'cubic-bezier(.2,.7,.2,1)' });
    // Kino soldan girer
    void kino.k.oynat('yuru', 1000);
    await oynat(kinoYer, [{ transform: 'translateX(-90%)' }, { transform: 'translateX(-40%) translateY(-6%)', offset: 0.5 }, { transform: 'none' }], 1000, { easing: 'cubic-bezier(.3,.6,.4,1)' });
    // kar topu Kino'nun önünde belirir, yuvarlanarak büyür; Kino iterek peşinden gider
    const kr = kinoYer.getBoundingClientRect(), sr = kardanYer.getBoundingClientRect();
    const yol = kr.left + kr.width * 0.66 - sr.left; // topun başlangıcı (kardan adam kutusuna göre px)
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
    // Mino fotoğraf makinesiyle gelir
    minoYer.style.opacity = '1';
    await oynat(minoYer, [{ transform: 'translateX(120%)' }, { transform: 'translateX(-6%)', offset: 0.75 }, { transform: 'none' }], 800, { easing: 'cubic-bezier(.3,.7,.3,1)' });
    mino.tepki('selam');
    await konus(G.mino.gulumse);
    kino.k.ifade('heyecan', 2500);
    void oynat(kamera, [{ transform: 'none' }, { transform: 'scale(1.15, 0.88)', offset: 0.4 }, { transform: 'none' }], 260);
    efekt.dagit();
    // beyaz flaş: ekran donar
    await oynat(flas, [{ opacity: 0 }, { opacity: 0.95, offset: 0.15 }, { opacity: 0 }], 700, { fill: 'forwards' });
    await fotograf();
  }

  async function fotograf() {
    const p = polaroid(giyili);
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
    fotoEkle('kis');
    efekt.yapis();
    void oynat(albumD, [{ transform: 'scale(1)' }, { transform: 'scale(1.35, 0.8)', offset: 0.3 }, { transform: 'scale(0.9, 1.15)', offset: 0.6 }, { transform: 'none' }], 520, { easing: 'ease-out' });
    efekt.konfeti();
    mino.tepki('sevinc');
    await bekle(700);
    if (kapandi) return;
    // son: yeniden oyna ve albüm
    const tekrar = h('button.gy-son-dugme', { type: 'button', 'aria-label': G.yazi.tekrar }, h('span.gy-son-ikon', { html: IKON.oyna }), h('span', {}, G.yazi.tekrar));
    tekrar.addEventListener('click', () => {
      efekt.dokunma();
      app.git('oda');
    });
    son.append(tekrar);
    son.classList.add('acik');
    void oynat(tekrar, [{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], 480, { easing: 'ease-out', fill: 'backwards' });
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
      mino.kapat();
    },
  };
}
