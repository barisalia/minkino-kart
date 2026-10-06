/**
 * Kino'nun tepkileri (senaryo bölüm 2, oyunun kalbi): her biri 1-1,5 sn, akıcı, tekrar izlemesi keyifli.
 * Uymayan giysi: titrer (buz sarkıtı), buğulanır, terler (kulaklar kızarır, ısı dalgası; botta ayaklardan buhar),
 * çamura batar (vıcık vıcık), ıslanır (başında yağmur bulutu, kulaklar sarkar, sonra köpek gibi silkinir),
 * gözlüğe damla dolar. Uyan giysi: sıcacık sarılma, keyif, çizmeyle pat pat, güneş gözlüğüyle havalı poz.
 * Efektler Kino'nun ek katmanında (yüzde konum: 2048'lik iskelet tuvalinin oranı); yalnız transform / opacity.
 */
import { efekt } from '../../src/audio/efekt';
import { h } from '../../src/ui/dom';
import G from '../../content/giysin.json';
import { bekle, ms, oynat } from './anim';
import type { GiyinikKino } from './giyinik';
import type { GiysiId, IyiTepki, Tepki } from './model';
import { resim } from './resimler';

const K = G.kino;

export interface TepkiBaglami {
  kino: GiyinikKino;
  /** Kino'nun kutusu (esneme, zıplama: alt-orta eksen) */
  kutu: HTMLElement;
  /** Kino'nun üstündeki efekt katmanı (kutunun içinde, kutu kadar) */
  ekler: HTMLElement;
  kinoDe: (t: string) => Promise<void>;
}

/** tuval (2048) noktası → ek katmanında yüzde */
const yuzde = (x: number, y: number) => `left:${((x / 2048) * 100).toFixed(2)}%;top:${((y / 2048) * 100).toFixed(2)}%`;
const rastgele = (a: number, b: number) => a + Math.random() * (b - a);

export const zipla = (e: HTMLElement, yuk = 1, sure = 620) =>
  oynat(e, [
    { transform: 'none' },
    { transform: `translateY(0) scale(${1 + 0.06 * yuk}, ${1 - 0.08 * yuk})`, offset: 0.18 },
    { transform: `translateY(${-14 * yuk}%) scale(${1 - 0.05 * yuk}, ${1 + 0.07 * yuk})`, offset: 0.48 },
    { transform: `translateY(0) scale(${1 + 0.07 * yuk}, ${1 - 0.07 * yuk})`, offset: 0.78 },
    { transform: 'none' },
  ], sure, { easing: 'linear' });

export const sendele = (e: HTMLElement) =>
  oynat(e, [
    { transform: 'none' },
    { transform: 'rotate(-7deg) translateX(-3%)', offset: 0.25 },
    { transform: 'rotate(6deg) translateX(3%)', offset: 0.55 },
    { transform: 'rotate(-3deg)', offset: 0.8 },
    { transform: 'none' },
  ], 900, { easing: 'ease-in-out' });

/** Uçuşan küçük kalpler (keyif) */
export function kalpler(ekler: HTMLElement, adet = 5) {
  for (let i = 0; i < adet; i++) {
    const k = h('i.gy-kalp', { style: `left:${30 + Math.random() * 40}%;top:${30 + Math.random() * 20}%` });
    ekler.append(k);
    void oynat(k, [{ transform: 'translateY(0) scale(0.3)', opacity: 0 }, { transform: 'translateY(-40%) scale(1)', opacity: 1, offset: 0.3 }, { transform: `translate(${(Math.random() - 0.5) * 80}px, -260%) scale(0.8)`, opacity: 0 }], 1300, { delay: ms(i * 120), easing: 'ease-out' }).then(() => k.remove());
  }
}

/** Parıltı yıldızları (bir noktanın çevresinde) */
export function parilti(ekler: HTMLElement, x: number, y: number, adet = 4) {
  efekt.tink();
  for (let i = 0; i < adet; i++) {
    const a = (i / adet) * Math.PI * 2 + Math.random();
    const s = h('i.gy-yildiz', { style: yuzde(x, y) });
    ekler.append(s);
    void oynat(s, [{ transform: 'translate(-50%,-50%) scale(0) rotate(0deg)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * 60}px), calc(-50% + ${Math.sin(a) * 60}px)) scale(1) rotate(90deg)`, opacity: 1, offset: 0.6 }, { transform: `translate(calc(-50% + ${Math.cos(a) * 80}px), calc(-50% + ${Math.sin(a) * 80}px)) scale(0.2) rotate(160deg)`, opacity: 0 }], 700, { delay: ms(i * 60), easing: 'ease-out' }).then(() => s.remove());
  }
}

/** Damlalar (ter, su, çamur): bir noktadan yay çizerek savrulur ve düşer */
function damlalar(ekler: HTMLElement, sinif: string, x: number, y: number, adet: number, yay = 90, sure = 800, gecikme = 0) {
  for (let i = 0; i < adet; i++) {
    const d = h(`i.${sinif}`, { style: yuzde(x + rastgele(-60, 60), y + rastgele(-30, 30)) });
    ekler.append(d);
    const dx = rastgele(-yay, yay), up = rastgele(20, 70);
    void oynat(d, [
      { transform: 'translate(-50%,-50%) scale(0.3)', opacity: 0 },
      { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% - ${up}px)) scale(1)`, opacity: 1, offset: 0.35 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${up * 1.6}px)) scale(0.8)`, opacity: 0 },
    ], sure, { delay: ms(gecikme + i * 70), easing: 'cubic-bezier(.3,.6,.6,1)' }).then(() => d.remove());
  }
}

// ------------------------------------------------------------ uymayan giysiler

/** Terler: kızaran kulaklar ve yanaklar, ter damlaları, başın üstünde ısı dalgası (botta: ayaklardan buhar) */
async function sicak(b: TepkiBaglami, id: GiysiId) {
  const { kino, kutu, ekler } = b;
  kino.k.ifade('sicak', 2200);
  const kizar = [h('i.gy-kizar', { style: yuzde(400, 900) }), h('i.gy-kizar', { style: yuzde(1600, 880) }), h('i.gy-kizar.yanak', { style: yuzde(660, 980) }), h('i.gy-kizar.yanak', { style: yuzde(1320, 960) })];
  ekler.append(...kizar);
  for (const k of kizar) void oynat(k, [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], 2100, { fill: 'forwards' }).then(() => k.remove());
  // ısı dalgaları: başın üstünde (bot giyildiyse ayaklardan) kıvrılarak yükselen üç çizgi
  const ayak = id === 'bot';
  for (let i = 0; i < 3; i++) {
    const d = h(`i.gy-isi${ayak ? '.buhar' : ''}`, { style: yuzde((ayak ? 830 : 760) + i * (ayak ? 200 : 230), ayak ? 1700 : 120), html: '<svg viewBox="0 0 20 60" aria-hidden="true"><path d="M10 58 C2 48 18 40 10 30 C2 20 18 12 10 2" fill="none" stroke-width="4" stroke-linecap="round"/></svg>' });
    ekler.append(d);
    void oynat(d, [{ transform: 'translate(-50%,0) scaleY(0.4)', opacity: 0 }, { transform: 'translate(-50%,-25%) scaleY(1)', opacity: 0.95, offset: 0.4 }, { transform: 'translate(-50%,-70%) scaleY(1.1)', opacity: 0 }], 1100, { delay: ms(i * 180), iterations: 2, easing: 'ease-out' }).then(() => d.remove());
  }
  // ter damlaları alnından savrulur; dil sarkar, hızlı hızlı soluk alır (kutu kısa kısa şişip iner)
  damlalar(ekler, 'gy-ter', 975, 420, 4, 110, 800, 200);
  damlalar(ekler, 'gy-ter', 975, 460, 3, 120, 800, 900);
  const nefes: Keyframe[] = [];
  for (let i = 0; i <= 8; i++) nefes.push({ transform: i % 2 ? 'scale(1.02, 0.975)' : 'scale(0.99, 1.01)' });
  nefes[0] = nefes[8] = { transform: 'none' };
  void oynat(kutu, nefes, 1600, { easing: 'ease-in-out' });
  void b.kinoDe(K.sicak);
  await bekle(1900);
}

/** Çamura batar: ayaklarının altında çamur birikintisi, adım attıkça vıcık vıcık, çamur sıçrar */
async function camur(b: TepkiBaglami) {
  const { kino, kutu, ekler } = b;
  const gol = h('img.gy-camur', { src: resim('esya-camur'), alt: '', draggable: 'false' });
  // birikinti Kino'nun ayaklarının altında (Kino'nun arkasında çizilir)
  kutu.insertBefore(gol, kino.el);
  await oynat(gol, [{ transform: 'translate(-50%,-50%) scale(0.2, 0.1)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.08, 1.1)', opacity: 1, offset: 0.7 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], 360, { fill: 'forwards', easing: 'ease-out' });
  kino.k.ifade('saskin', 2000);
  // yerinde iki adım: her adımda biraz batar, çamur sıçrar
  for (let i = 0; i < 3; i++) {
    efekt.vicik();
    damlalar(ekler, 'gy-camur-damla', i % 2 ? 1180 : 880, 1880, 4, 80, 650);
    void oynat(kutu, [{ transform: `translateY(${i * 1.2}%) rotate(0deg)` }, { transform: `translateY(${i * 1.2 - 3}%) rotate(${i % 2 ? 3 : -3}deg)`, offset: 0.4 }, { transform: `translateY(${(i + 1) * 1.2}%) rotate(0deg)` }], 420, { fill: 'forwards', easing: 'ease-in-out' });
    if (i === 0) void b.kinoDe(K.vicik);
    await bekle(430);
  }
  kino.k.ifade('uzgun', 900);
  await bekle(300);
  void oynat(kutu, [{ transform: 'translateY(3.6%)' }, { transform: 'translateY(-6%) scale(0.97, 1.04)', offset: 0.5 }, { transform: 'none' }], 420, { easing: 'ease-out' });
  await oynat(gol, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(0.6, 0.3)', opacity: 0 }], 380, { fill: 'forwards' });
  gol.remove();
}

/** Islanır: başının üstünde yağmur bulutu, damlalar, kulaklar sarkar; sonra köpek gibi silkinir */
async function islak(b: TepkiBaglami, id: GiysiId) {
  const { kino, kutu, ekler } = b;
  const bulut = h('img.gy-bulut', { src: resim('esya-bulut'), alt: '', draggable: 'false' });
  const yagmur = h('div.gy-bulut-yagmur');
  for (let i = 0; i < 9; i++) yagmur.append(h('i', { style: `left:${8 + i * 10.5}%;--gec:-${(Math.random() * 0.5).toFixed(2)}s;--sure:${(0.42 + Math.random() * 0.15).toFixed(2)}s` }));
  ekler.append(yagmur, bulut);
  await oynat(bulut, [{ transform: 'translate(-50%,-60%) scale(0.3)', opacity: 0 }, { transform: 'translate(-50%,0) scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'translate(-50%,0) scale(1)', opacity: 1 }], 420, { fill: 'forwards', easing: 'ease-out' });
  yagmur.classList.add('acik');
  efekt.sicrama();
  kino.k.ifade('uzgun', 2400);
  // kulaklar sarkar (ağırlık yavaşça artar), şapkanın kenarı ıslanıp düşer
  const t0 = performance.now();
  const sark = () => {
    const u = Math.min(1, (performance.now() - t0) / ms(500));
    kino.islak = u;
    if (u < 1) requestAnimationFrame(sark);
  };
  sark();
  if (id === 'sapka') void kino.parcaOynat('sapka', [{ transform: 'none' }, { transform: 'translateY(3%) scale(1.04, 0.86)' }], { duration: ms(700), fill: 'forwards', easing: 'ease-in' });
  void oynat(kutu, [{ transform: 'none' }, { transform: 'scale(0.97, 0.95)' }], 600, { fill: 'forwards' });
  void b.kinoDe(K.islandim);
  for (let i = 0; i < 4; i++) damlalar(ekler, 'gy-su-damla', i % 2 ? 1500 : 450, 1150, 1, 20, 600, 300 + i * 220);
  await bekle(1300);
  yagmur.classList.remove('acik');
  void oynat(bulut, [{ transform: 'translate(-50%,0) scale(1)', opacity: 1 }, { transform: 'translate(-50%,-40%) scale(0.7)', opacity: 0 }], 360, { fill: 'forwards' }).then(() => {
    bulut.remove();
    yagmur.remove();
  });
  // silkinme: hazırlık (çömelir), baştan kuyruğa sallanır, su damlaları her yöne
  await oynat(kutu, [{ transform: 'scale(0.97, 0.95)' }, { transform: 'scale(1.04, 0.9)' }], 200, { fill: 'forwards', easing: 'ease-in' });
  kino.islak = 0;
  kino.silkin = 1;
  kino.k.ifade('keyif', 900);
  efekt.sicrama();
  const sallan: Keyframe[] = [];
  for (let i = 0; i <= 10; i++) sallan.push({ transform: i === 0 ? 'scale(1.04, 0.9)' : i === 10 ? 'none' : `rotate(${i % 2 ? 5 : -5}deg) scale(1, 1.01)` });
  void oynat(kutu, sallan, 720, { easing: 'linear' });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const d = h('i.gy-su-damla', { style: yuzde(1024 + Math.cos(a) * 380, 1050 + Math.sin(a) * 500) });
    ekler.append(d);
    void oynat(d, [{ transform: 'translate(-50%,-50%) scale(0.4)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * 110}px), calc(-50% + ${Math.sin(a) * 90 + 30}px)) scale(1)`, opacity: 0 }], 650, { delay: ms((i % 4) * 60), easing: 'ease-out' }).then(() => d.remove());
  }
  if (id === 'sapka') void kino.parcaOynat('sapka', [{ transform: 'translateY(3%) scale(1.04, 0.86)' }, { transform: 'none' }], { duration: ms(300), fill: 'forwards' });
  await bekle(720);
  kino.silkin = 0;
}

/** Gözlük: kışın buğulanır, yağmurda damla dolar: önce havalı poz, sonra göremiyorum */
async function goremiyor(b: TepkiBaglami, sinif: 'bugulu' | 'damlali') {
  const { kino, kutu, ekler } = b;
  kino.k.ifade('keyif', 900);
  void oynat(kutu, [{ transform: 'none' }, { transform: 'rotate(-5deg) translateX(-2%)', offset: 0.4 }, { transform: 'rotate(-5deg) translateX(-2%)', offset: 0.75 }, { transform: 'none' }], 1100);
  await bekle(1000);
  ekler.classList.add(sinif);
  if (sinif === 'damlali') efekt.sicrama();
  kino.k.ifade('saskin', 1400);
  void sendele(kutu);
  void b.kinoDe(K.goremiyorum);
  await bekle(1600);
  ekler.classList.remove(sinif);
}

/** Titrer: buz sarkıtı, mavi yanaklar, takırdayan dişler (kış) */
async function usu(b: TepkiBaglami) {
  const { kino, kutu, ekler } = b;
  const buz = ekler.querySelector<HTMLElement>('.gy-buz');
  const yanaklar = [...ekler.querySelectorAll<HTMLElement>('.gy-yanak')];
  kino.k.ifade('titreme', 2200);
  kino.titreme = 1;
  for (const y of yanaklar) void oynat(y, [{ opacity: 0 }, { opacity: 0.85 }], 300, { fill: 'forwards' });
  void oynat(buz, [
    { transform: 'scale(0.2, 0)', opacity: 0 },
    { transform: 'scale(1.15, 1.2)', opacity: 1, offset: 0.6 },
    { transform: 'scale(0.95, 0.94)', offset: 0.8 },
    { transform: 'scale(1)', opacity: 1 },
  ], 700, { delay: ms(250), fill: 'forwards', easing: 'ease-out' });
  void oynat(kutu, [{ transform: 'scale(1)' }, { transform: 'scale(0.95, 0.93)' }, { transform: 'scale(0.95, 0.93)' }, { transform: 'scale(1)' }], 2200, { easing: 'ease-in-out' });
  efekt.dagit();
  void b.kinoDe(K.brrr);
  await bekle(1500);
  kino.titreme = 0;
  // buz damla gibi düşer, yanaklar söner
  void oynat(buz, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'translateY(30%) scale(0.9)', opacity: 1, offset: 0.3 }, { transform: 'translateY(160%) scale(0.6)', opacity: 0 }], 520, { fill: 'forwards', easing: 'cubic-bezier(.5,0,.9,.5)' });
  for (const y of yanaklar) void oynat(y, [{ opacity: 0.85 }, { opacity: 0 }], 500, { fill: 'forwards' });
}

export function uymazTepki(b: TepkiBaglami, tepki: Tepki, id: GiysiId): Promise<void> {
  switch (tepki) {
    case 'usu':
      return usu(b);
    case 'bugu':
      return goremiyor(b, 'bugulu');
    case 'damla':
      return goremiyor(b, 'damlali');
    case 'sicak':
      return sicak(b, id);
    case 'camur':
      return camur(b);
    case 'islak':
      return islak(b, id);
  }
}

// ------------------------------------------------------------ uyan giysiler

/** Sıcacık: Kino kendini sarar (büzülüp şişer), gözler keyifle kapanır */
async function sicacik(b: TepkiBaglami) {
  b.kino.k.ifade('keyif', 1800);
  void oynat(b.kutu, [
    { transform: 'none' },
    { transform: 'scale(0.94, 0.95) rotate(-2deg)', offset: 0.3 },
    { transform: 'scale(1.04, 1.03) rotate(2deg)', offset: 0.65 },
    { transform: 'none' },
  ], 1400, { easing: 'ease-in-out' });
  kalpler(b.ekler);
  void b.kinoDe(K.sicacik);
  await bekle(1300);
}

/** Çizmeyle yerinde iki zıplama: pat pat, ayaklarında minik su sıçraması */
async function pat(b: TepkiBaglami) {
  b.kino.k.ifade('heyecan', 1600);
  void b.kinoDe(K.pat);
  for (let i = 0; i < 2; i++) {
    await zipla(b.kutu, 0.75, 480);
    efekt.sicrama();
    const s = h('img.gy-sicrama', { src: resim('esya-sicrama'), alt: '', draggable: 'false', style: yuzde(i ? 1180 : 880, 1880) });
    b.ekler.append(s);
    void oynat(s, [{ transform: 'translate(-50%,-80%) scale(0.2, 0.1)', opacity: 1 }, { transform: 'translate(-50%,-80%) scale(1, 1)', opacity: 1, offset: 0.5 }, { transform: 'translate(-50%,-70%) scale(1.15, 0.9)', opacity: 0 }], 520, { easing: 'ease-out' }).then(() => s.remove());
  }
}

/** Güneş gözlüğü (yaz): gözlüğü burnuna kaydırıp poz verir, "cool" göz kırpması, parıltı */
async function cool(b: TepkiBaglami) {
  const { kino, kutu, ekler } = b;
  void oynat(kutu, [{ transform: 'none' }, { transform: 'rotate(-6deg) translateX(-2%)', offset: 0.3 }, { transform: 'rotate(-6deg) translateX(-2%)', offset: 0.8 }, { transform: 'none' }], 1500, { easing: 'cubic-bezier(.3,.7,.3,1)' });
  await kino.parcaOynat('gozluk', [{ transform: 'none' }, { transform: 'translateY(7%)' }], { duration: ms(260), fill: 'forwards', easing: 'ease-out' });
  kino.k.ifade('keyif', 600);
  parilti(ekler, 1260, 640, 5);
  void b.kinoDe(K.havali);
  await bekle(650);
  await kino.parcaOynat('gozluk', [{ transform: 'translateY(7%)' }, { transform: 'translateY(-2%)', offset: 0.7 }, { transform: 'none' }], { duration: ms(300), fill: 'forwards', easing: 'ease-out' });
  kino.k.ifade('heyecan', 700);
  await bekle(400);
}

async function keyif(b: TepkiBaglami) {
  b.kino.k.ifade('keyif', 1300);
  void oynat(b.kutu, [{ transform: 'none' }, { transform: 'rotate(-3deg) scale(1.02, 0.98)', offset: 0.35 }, { transform: 'rotate(3deg) scale(0.99, 1.02)', offset: 0.7 }, { transform: 'none' }], 1100, { easing: 'ease-in-out' });
  kalpler(b.ekler, 4);
  await bekle(1000);
}

export async function iyiTepki(b: TepkiBaglami, t: IyiTepki | undefined) {
  switch (t) {
    case 'sicacik':
      return sicacik(b);
    case 'pat':
      return pat(b);
    case 'cool':
      return cool(b);
    case 'keyif':
      return keyif(b);
    default:
      b.kino.k.ifade('heyecan', 900);
      void zipla(b.kutu, 0.6);
      await bekle(650);
  }
}
