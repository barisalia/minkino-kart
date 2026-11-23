// Deneyler · Bağla ve Çalıştır (Mucit Panosu, Paket Deney-Y2; yönetici 22 Kasım akşamı, Barış: "birbirine bağlardık").
// İki kısa tur: su (boşluklara boru tak, vanayı aç: su kare kare akar, çark döner) ve ışık (kabloyu bağla, şalteri indir:
// ampul yanar, pervane döner). Eksik ya da ters parça ceza değil: su açık uçtan fışkırır, Kino ıslanır; ışık yanmaz.
// Kurallar devre.ts'te (DOM'suz). Çizimler (Astra, assets/deney/pano/) tamam değilse sayfa açılmaz; test kipinde çizimsiz görünüm.
import { sesiAc } from '../../../src/audio/ses';
import { efektCikisi, konusmaCikisi, sesMotorunuAc } from '../../../src/audio/motor';
import { menuYasiOku } from '../../../src/engine/menu-yas';
import { geriDinle } from '../../../src/kabuk/yon';
import { anaMenuyeDon } from '../../../src/uygulama';
import sozler from './sozler.json';
import {
  akis, anahtar, bosMu, duzen, komsu, panodakiler, sonrakiAci, tepsi, uclar,
  type AkisSonucu, type Duzen, type Kare, type Parca, type Tur, type Yas, type Yon,
} from './devre';
import {
  AMPUL, CARK, CEREN_KUTU, DEPO, FON, IZGARA, KINO_KUTU, PERVANE_GOVDE, PERVANE_KANAT, PIL, SALTER, TEPSI, VANA,
  hangiKare, kareKutusu, kareOrtasi, type Kutu,
} from './geometri';
import '../parkur/stil.css';
import './stil.css';

const ARAMA = new URLSearchParams(location.search);
const TEST = ARAMA.has('test');
const resimler = import.meta.glob<string>('../../../assets/deney/pano/*.webp', { eager: true, query: '?url', import: 'default' });
const sesDosyalari = import.meta.glob<string>(['../../../assets/deney/pano/ses/*.mp3', '../../../assets/deney/parkur/ses/efekt-{tik,konfeti,puf,pit}.mp3'], { eager: true, query: '?url', import: 'default' });
const dugmeResimleri = import.meta.glob<string>('../../../assets/hazirlik/dugmeler/{ev,dinle,tekrar}.webp', { eager: true, query: '?url', import: 'default' });
export const CIZIMLER = [
  'pano-fon', 'yuva-kare', 'boru-duz', 'boru-duz-dolu', 'boru-dirsek', 'boru-dirsek-dolu', 'depo', 'vana', 'su-carki', 'su-fiskirma',
  'pil', 'salter-kapali', 'salter-acik', 'kablo-duz', 'kablo-dirsek', 'ampul-sonuk', 'ampul-yanik', 'pervane-govde', 'pervane-kanat',
  'kino-pano-bekle', 'kino-pano-islak', 'kino-pano-sevin', 'ceren-pano-bekle', 'ceren-pano-alkis',
] as const;
type Cizim = (typeof CIZIMLER)[number];
const cizim = (ad: Cizim) => resimler['../../../assets/deney/pano/' + ad + '.webp'] as string | undefined;
const HAZIR = CIZIMLER.every((ad) => !!cizim(ad));
if (!HAZIR && !TEST) anaMenuyeDon();

const yasOku = (): Yas => { const a = ARAMA.get('yas'); const y = a ? Number(a) : menuYasiOku() ?? 4; return y <= 3 ? 'minik' : y === 4 ? 'dort' : 'bes'; };
const YAS = yasOku();

// ----- Sahne ve kamera (Top Parkuru'yla aynı: dünya ekrandan büyük çizilir, fonun dışına taşmaz) -----
const kok = document.querySelector<HTMLElement>('#sahne')!;
kok.dataset.yas = YAS;
if (!HAZIR) kok.classList.add('pk-cizimsiz');
const fon = cizim('pano-fon');
kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
const KADRAJ = { w: 1480, h: 780, x0: 96, y0: 125, y1: 905 };
const kamera = { x: 0, y: 0, z: 1 };
function kameraOlc() {
  const W = innerWidth, H = innerHeight;
  kamera.z = Math.max(Math.max(W / FON.w, H / FON.h), Math.min(W / KADRAJ.w, H / KADRAJ.h));
  const gw = W / kamera.z, gh = H / kamera.z;
  kamera.x = Math.max(0, Math.min(FON.w - gw, KADRAJ.x0 + KADRAJ.w / 2 - gw / 2));
  kamera.y = Math.max(0, Math.min(FON.h - gh, (KADRAJ.y0 + KADRAJ.y1) / 2 - gh / 2));
  kok.style.width = FON.w * kamera.z + 'px';
  kok.style.height = FON.h * kamera.z + 'px';
  kok.style.translate = -kamera.x * kamera.z + 'px ' + -kamera.y * kamera.z + 'px';
}
addEventListener('resize', kameraOlc);
kameraOlc();

const yuzde = (k: Kutu, el: HTMLElement) => {
  el.style.left = (k.x / FON.w) * 100 + '%';
  el.style.top = (k.y / FON.h) * 100 + '%';
  el.style.width = (k.w / FON.w) * 100 + '%';
  el.style.height = (k.h / FON.h) * 100 + '%';
};
function resim(ad: Cizim | null, sinif: string, kutu: Kutu, ust: HTMLElement = kok) {
  const el = document.createElement('div');
  el.className = 'pk-oge ' + sinif;
  if (ad) {
    const url = cizim(ad);
    if (url) el.innerHTML = '<img src="' + url + '" alt="" draggable="false">';
    else el.dataset.ad = ad;
  }
  yuzde(kutu, el);
  ust.append(el);
  return el;
}
function resmiDegistir(el: HTMLElement, ad: Cizim) {
  const url = cizim(ad);
  const img = el.querySelector('img');
  if (url && img) img.src = url;
  else el.dataset.ad = ad;
}

// Karakterler
type KinoPoz = 'kino-pano-bekle' | 'kino-pano-islak' | 'kino-pano-sevin';
type CerenPoz = 'ceren-pano-bekle' | 'ceren-pano-alkis';
const kino = resim('kino-pano-bekle', 'pk-kino pn-kino', KINO_KUTU);
const ceren = resim('ceren-pano-bekle', 'pk-ceren pn-ceren', CEREN_KUTU);
const kinoPoz = (p: KinoPoz) => { kino.dataset.poz = p; resmiDegistir(kino, p); };
const cerenPoz = (p: CerenPoz) => { ceren.dataset.poz = p; resmiDegistir(ceren, p); };
kinoPoz('kino-pano-bekle');
cerenPoz('ceren-pano-bekle');
/** Anında tepki: karakter masaya oturan küçük bir nabızla canlanır (../parkur/stil.css .tepki). */
function tepki(el: HTMLElement) { el.classList.remove('tepki'); void el.offsetWidth; el.classList.add('tepki'); }
function karakterDokun(el: HTMLElement, sevinc: () => void, bekle: () => void) {
  el.style.pointerEvents = 'auto';
  el.addEventListener('pointerdown', () => {
    if (durum === 'akiyor') return;
    sesiAc();
    void sesleriYukle();
    efekt('pit', 0.6);
    tepki(el);
    if (durum === 'basari') return;
    sevinc();
    setTimeout(() => { if (durum !== 'basari' && durum !== 'akiyor') bekle(); }, 700);
  });
}
karakterDokun(kino, () => kinoPoz('kino-pano-sevin'), () => { if (kino.dataset.poz === 'kino-pano-sevin') kinoPoz('kino-pano-bekle'); });
karakterDokun(ceren, () => cerenPoz('ceren-pano-alkis'), () => { if (ceren.dataset.poz === 'ceren-pano-alkis') cerenPoz('ceren-pano-bekle'); });

// Düğmeler (ekrana sabit, alt köşelerde)
const dugme = (ad: 'ev' | 'dinle') => '<img src="' + dugmeResimleri['../../../assets/hazirlik/dugmeler/' + ad + '.webp'] + '" alt="" draggable="false">';
const ev = document.createElement('button');
ev.className = 'pk-nav pk-ev';
ev.setAttribute('aria-label', 'Ana menü');
ev.innerHTML = dugme('ev');
const dinle = document.createElement('button');
dinle.className = 'pk-nav pk-dinle';
dinle.setAttribute('aria-label', 'Tekrar dinle');
dinle.innerHTML = dugme('dinle');
const tekrar = document.createElement('button');
tekrar.className = 'pk-nav pn-tekrar';
tekrar.setAttribute('aria-label', 'Bir daha oyna');
tekrar.innerHTML = '<img src="' + dugmeResimleri['../../../assets/hazirlik/dugmeler/tekrar.webp'] + '" alt="" draggable="false">';
tekrar.hidden = true;
document.body.append(ev, dinle, tekrar);

// ----- Ses (Top Parkuru'yla aynı düzen: efektler ve sıralı konuşma) -----
const tamponlar = new Map<string, AudioBuffer>();
let yukleme: Promise<void> | null = null;
function sesleriYukle() {
  const ctx = sesMotorunuAc();
  if (!ctx || yukleme) return yukleme;
  yukleme = Promise.all(Object.entries(sesDosyalari).map(async ([yol, url]) => {
    const ad = yol.split('/').pop()!.replace('.mp3', '');
    try { tamponlar.set(ad, await ctx.decodeAudioData(await (await fetch(url)).arrayBuffer())); } catch { /* sessiz sürer */ }
  })).then(() => undefined);
  return yukleme;
}
/**
 * Efektlerin düzeyi: pervane döngüsü (-11 LUFS) sözler kadar yüksekti, şalter (-27) ve vana (-23) duyulmuyordu. Olaylar
 * sözün 2–4 dB altında; döngüler sözün altında kalır (Ceren ve Kino konuşurken çark ve pervane döner). Çağıranın kazancıyla çarpılır.
 */
const DUZEY: Record<string, number> = { salter: 2.2, vana: 1.6, ampul: 0.8, bzz: 0.6, konfeti: 0.45, puf: 1.4, pervane: 0.36, su: 0.8 };
const sesKaydi: { ad: string; t: number; kazanc: number }[] = [];
function efekt(ad: string, kazanc = 1) {
  kazanc *= DUZEY[ad] ?? 1;
  const ctx = sesMotorunuAc(), cikis = efektCikisi(), b = tamponlar.get('efekt-' + ad);
  if (TEST) sesKaydi.push({ ad: 'efekt-' + ad, t: performance.now(), kazanc });
  if (!ctx || !cikis || !b) return;
  const k = ctx.createBufferSource(), g = ctx.createGain();
  k.buffer = b;
  g.gain.value = kazanc;
  k.connect(g).connect(cikis);
  k.start();
}
const donguler = new Map<string, { k: AudioBufferSourceNode; g: GainNode }>();
/** Döngü sesi (su, çark, pervane): açılır ya da kısılır. */
function dongu(ad: string, acik: boolean) {
  if (TEST) sesKaydi.push({ ad: (acik ? 'dongu-bas-' : 'dongu-bit-') + ad, t: performance.now(), kazanc: 1 });
  const ctx = sesMotorunuAc(), cikis = efektCikisi(), b = tamponlar.get('efekt-' + ad);
  if (!ctx || !cikis || !b) return;
  let d = donguler.get(ad);
  if (!d && acik) {
    const k = ctx.createBufferSource(), g = ctx.createGain();
    k.buffer = b; k.loop = true; g.gain.value = 0;
    k.connect(g).connect(cikis); k.start();
    d = { k, g };
    donguler.set(ad, d);
  }
  d?.g.gain.setTargetAtTime(acik ? 0.7 * (DUZEY[ad] ?? 1) : 0, ctx.currentTime, 0.08);
}
let konusan: AudioBufferSourceNode | null = null;
let sonSoz = '';
let sozBitti: (() => void) | null = null;
const kuyruk: (() => void)[] = [];
function soyle(ad: keyof typeof sozler, sonra?: () => void) {
  if (ad === sonSoz) { sonra?.(); return; }
  sonSoz = ad;
  const ctx = sesMotorunuAc(), cikis = konusmaCikisi(), b = tamponlar.get(ad);
  if (TEST) sesKaydi.push({ ad, t: performance.now(), kazanc: 1 });
  try { konusan?.stop(); } catch { /* bitmiş */ }
  sozBitti = null;
  kok.dataset.soz = ad;
  if (!ctx || !cikis || !b) { if (sonra) setTimeout(sonra, 1200); return; }
  const k = ctx.createBufferSource();
  k.buffer = b;
  k.connect(cikis);
  konusan = k;
  sozBitti = sonra ?? null;
  k.onended = () => {
    if (konusan !== k) return;
    konusan = null;
    const f = sozBitti; sozBitti = null; f?.();
    if (!konusan && kuyruk.length) kuyruk.shift()!();
  };
  k.start();
}
const sirayla = (ad: keyof typeof sozler, sonra?: () => void) => { if (konusan) kuyruk.push(() => soyle(ad, sonra)); else soyle(ad, sonra); };

// ----- Tur -----
type Durum = 'kur' | 'akiyor' | 'kacti' | 'basari' | 'bitti';
let durum: Durum = 'kur';
let d: Duzen = duzen('su', YAS);
const yerlesen = new Map<string, Parca>();
const parcaEl = new Map<string, HTMLElement>();
let tepsiEl: { el: HTMLElement; p: Parca; yer: number; yerlesti: boolean }[] = [];
let turEl: HTMLElement[] = [];
let kacmaSayisi = 0;
const durumYaz = (x: Durum) => { durum = x; kok.dataset.durum = x; };
const parcaCizimi = (tur: Tur, p: Parca, dolu = false): Cizim =>
  tur === 'su' ? ((p.tur === 'duz' ? 'boru-duz' : 'boru-dirsek') + (dolu ? '-dolu' : '')) as Cizim : p.tur === 'duz' ? 'kablo-duz' : 'kablo-dirsek';

let vanaEl: HTMLElement | null = null, carkEl: HTMLElement | null = null, salterEl: HTMLElement | null = null, ampulEl: HTMLElement | null = null;
let kanatEl: HTMLElement | null = null, fiskirmaEl: HTMLElement | null = null;
let vanaTutamak: HTMLButtonElement | null = null, salterTutamak: HTMLButtonElement | null = null;

function parcaKoy(k: Kare, p: Parca, sabit: boolean) {
  const el = resim(parcaCizimi(d.tur, p), 'pn-parca' + (sabit ? ' sabit' : ' takili'), kareKutusu(k));
  el.style.rotate = p.aci + 'deg';
  el.dataset.kare = anahtar(k);
  parcaEl.set(anahtar(k), el);
  turEl.push(el);
  if (!sabit) {
    // Takılan dirseğe dokununca 90° döner (düz boruya dokunmak da çevirir: yatay ↔ dikey). Görünen açı hep artar.
    let gorunen: number = p.aci;
    el.addEventListener('pointerdown', (e) => {
      if (durum !== 'kur' && durum !== 'kacti') return;
      e.preventDefault();
      const yeni = { tur: p.tur, aci: sonrakiAci(yerlesen.get(anahtar(k))!.aci) };
      yerlesen.set(anahtar(k), yeni);
      gorunen += 90;
      el.style.rotate = gorunen + 'deg';
      efekt('tik', 0.8);
    });
  }
  return el;
}

function turuKur(tur: Tur) {
  for (const el of turEl) el.remove();
  turEl = [];
  parcaEl.clear();
  yerlesen.clear();
  tepsiEl = [];
  kacmaSayisi = 0;
  d = duzen(tur, YAS);
  kok.dataset.tur = tur;
  if (tur === 'su') {
    turEl.push(resim('depo', 'pn-depo', DEPO));
    vanaEl = resim('vana', 'pn-vana', VANA);
    carkEl = resim('su-carki', 'pn-cark', CARK);
    fiskirmaEl = resim('su-fiskirma', 'pn-fiskirma', { x: 0, y: 0, w: 160, h: 160 });
    turEl.push(vanaEl, carkEl, fiskirmaEl);
    vanaTutamak = document.createElement('button');
    vanaTutamak.className = 'pn-tutamak';
    vanaTutamak.setAttribute('aria-label', 'Kırmızı vanayı aç');
    yuzde({ x: VANA.x - 20, y: VANA.y - 20, w: VANA.w + 40, h: VANA.h + 40 }, vanaTutamak);
    vanaTutamak.addEventListener('click', vanaAc);
    kok.append(vanaTutamak);
    turEl.push(vanaTutamak);
  } else {
    turEl.push(resim('pil', 'pn-pil', PIL));
    salterEl = resim('salter-kapali', 'pn-salter', SALTER);
    ampulEl = resim('ampul-sonuk', 'pn-ampul', AMPUL);
    turEl.push(resim('pervane-govde', 'pn-pervane-govde', PERVANE_GOVDE));
    kanatEl = resim('pervane-kanat', 'pn-kanat', PERVANE_KANAT);
    turEl.push(salterEl, ampulEl, kanatEl);
    salterTutamak = document.createElement('button');
    salterTutamak.className = 'pn-tutamak';
    salterTutamak.setAttribute('aria-label', 'Yeşil şalteri indir');
    yuzde({ x: SALTER.x - 10, y: SALTER.y - 30, w: SALTER.w + 20, h: SALTER.h + 40 }, salterTutamak);
    salterTutamak.addEventListener('click', salterIndir);
    kok.append(salterTutamak);
    turEl.push(salterTutamak);
  }
  for (const s of d.sabit) if (!(d.salter && s.i === d.salter.i && s.j === d.salter.j)) parcaKoy(s, s, true);
  for (const b of d.bosluk) {
    const y = resim('yuva-kare', 'pk-yuva nabiz pn-yuva', kareKutusu(b));
    y.dataset.kare = anahtar(b);
    turEl.push(y);
  }
  tepsi(d).forEach((p, n) => {
    const el = resim(parcaCizimi(tur, p), 'pn-parca pn-tepside', tepsiKutusu(n));
    turEl.push(el);
    const t = { el, p, yer: n, yerlesti: false };
    tepsiEl.push(t);
    surukleBagla(t);
  });
  durumYaz('kur');
  kinoPoz('kino-pano-bekle');
  cerenPoz('ceren-pano-bekle');
}
function tepsiKutusu(n: number): Kutu {
  const b = TEPSI.bolmeler[n], s = 0.72;
  return { x: b.x - (IZGARA.kare * s) / 2, y: b.y - (IZGARA.kare * s) / 2, w: IZGARA.kare * s, h: IZGARA.kare * s };
}

/** Tepsideki parça: sürüklenip bir boşluğa bırakılır ya da dokununca ilk boşluğa uçar. */
function surukleBagla(t: { el: HTMLElement; p: Parca; yer: number; yerlesti: boolean }) {
  const el = t.el;
  el.style.pointerEvents = 'auto';
  el.addEventListener('pointerdown', (e) => {
    if (t.yerlesti || durum === 'akiyor' || durum === 'basari' || durum === 'bitti') return;
    e.preventDefault();
    sesiAc();
    void sesleriYukle();
    el.setPointerCapture(e.pointerId);
    const bas = { x: e.clientX, y: e.clientY };
    el.classList.add('pk-tutulan');
    const tasi = (ev: PointerEvent) => {
      const r = kok.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * FON.w, y = ((ev.clientY - r.top) / r.height) * FON.h;
      yuzde({ x: x - IZGARA.kare / 2, y: y - IZGARA.kare / 2, w: IZGARA.kare, h: IZGARA.kare }, el);
      return { x, y };
    };
    const birak = (ev: PointerEvent) => {
      el.removeEventListener('pointermove', tasi);
      el.removeEventListener('pointerup', birak);
      el.removeEventListener('pointercancel', birak);
      el.classList.remove('pk-tutulan');
      let hedef: Kare | null = null;
      if (Math.hypot(ev.clientX - bas.x, ev.clientY - bas.y) < 14) hedef = d.bosluk.find((b) => bosMu(d, b, yerlesen)) ?? null;
      else { const { x, y } = tasi(ev); const k = hangiKare(x, y); if (k && bosMu(d, k, yerlesen)) hedef = k; }
      if (!hedef) {
        el.classList.add('pn-geri');
        yuzde(tepsiKutusu(t.yer), el);
        setTimeout(() => el.classList.remove('pn-geri'), 360);
        // Panonun üstüne bırakıldıysa (boşluk değil): komik "püf".
        if (Math.hypot(ev.clientX - bas.x, ev.clientY - bas.y) >= 14) { efekt('puf'); tepki(kino); }
        return;
      }
      yerlestir(t, hedef);
    };
    el.addEventListener('pointermove', tasi);
    el.addEventListener('pointerup', birak);
    el.addEventListener('pointercancel', birak);
  });
}
function yerlestir(t: { el: HTMLElement; p: Parca; yer: number; yerlesti: boolean }, k: Kare) {
  t.yerlesti = true;
  t.el.remove();
  yerlesen.set(anahtar(k), { ...t.p });
  parcaKoy(k, t.p, false).classList.add('pk-oturdu');
  kok.querySelector<HTMLElement>('.pn-yuva[data-kare="' + anahtar(k) + '"]')?.classList.add('dolu');
  efekt('tik');
}

// ----- Çalıştır -----
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** Akışı kare kare gösterir (su turunda borular dolar). */
async function akisiGoster(s: AkisSonucu) {
  for (const k of s.yol) {
    const el = parcaEl.get(anahtar(k));
    const p = yerlesen.get(anahtar(k)) ?? d.sabit.find((x) => x.i === k.i && x.j === k.j);
    if (el && p && d.tur === 'su') resmiDegistir(el, parcaCizimi('su', p, true));
    el?.classList.add('akti');
    await bekle(170);
  }
}
function borulariBosalt() {
  for (const [a, el] of parcaEl) {
    const p = yerlesen.get(a) ?? d.sabit.find((x) => anahtar(x) === a);
    if (p && d.tur === 'su') resmiDegistir(el, parcaCizimi('su', p));
    el.classList.remove('akti');
  }
}
async function vanaAc() {
  if (durum !== 'kur' && durum !== 'kacti') return;
  sesiAc();
  durumYaz('akiyor');
  vanaEl?.classList.add('acik');
  await sesleriYukle();
  efekt('vana');
  dongu('su', true);
  const s = akis(d, panodakiler(d, yerlesen));
  await akisiGoster(s);
  if (s.ulasti) {
    durumYaz('basari');
    carkEl?.classList.add('doner');
    dongu('cark', true);
    efekt('konfeti', 0.7);
    kinoPoz('kino-pano-sevin');
    cerenPoz('ceren-pano-alkis');
    soyle('k-cark', () => { setTimeout(() => { dongu('su', false); dongu('cark', false); isikTurunaGec(); }, 400); });
    return;
  }
  await kacis(s);
  dongu('su', false);
  vanaEl?.classList.remove('acik');
  borulariBosalt();
  durumYaz('kacti');
}
/** Açık uçtan fışkırma (su) ya da yanmayan ampul (ışık): komik, cezasız; ipucu sözü. */
async function kacis(s: AkisSonucu) {
  kacmaSayisi++;
  const sonraki = s.sizinti ? komsu(s.sizinti, s.sizinti.yon) : null;
  const dirsekTers = !!sonraki && yerlesen.get(anahtar(sonraki))?.tur === 'dirsek';
  if (d.tur === 'su' && s.sizinti && fiskirmaEl) {
    const o = kareOrtasi(s.sizinti), yon: Yon = s.sizinti.yon;
    const dx = yon === 'D' ? 75 : yon === 'B' ? -75 : 0, dy = yon === 'G' ? 75 : yon === 'K' ? -75 : 0;
    yuzde({ x: o.x + dx, y: o.y + dy - 80, w: 160, h: 160 }, fiskirmaEl);
    fiskirmaEl.style.rotate = ({ D: 0, G: 90, B: 180, K: 270 } as const)[yon] + 'deg';
    fiskirmaEl.classList.add('acik');
    efekt('fiskir');
    kinoPoz('kino-pano-islak');
    soyle('k-islak', () => { if (kacmaSayisi === 1 || dirsekTers) soyle(dirsekTers ? 'c-cevir' : 'c-su-kacti'); });
    await bekle(1700);
    fiskirmaEl.classList.remove('acik');
    kinoPoz('kino-pano-bekle');
  } else {
    efekt('bzz');
    soyle(dirsekTers ? 'c-cevir' : 'c-isik-yok');
    await bekle(1100);
  }
}
function isikTurunaGec() {
  carkEl?.classList.remove('doner');
  vanaTutamak?.remove();
  turuKur('isik');
  sirayla('c-isik-giris');
}
async function salterIndir() {
  if (durum !== 'kur' && durum !== 'kacti') return;
  sesiAc();
  durumYaz('akiyor');
  if (salterEl) resmiDegistir(salterEl, 'salter-acik');
  await sesleriYukle();
  efekt('salter');
  const s = akis(d, panodakiler(d, yerlesen), true);
  await akisiGoster(s);
  if (s.ulasti) {
    durumYaz('basari');
    if (ampulEl) resmiDegistir(ampulEl, 'ampul-yanik');
    ampulEl?.classList.add('yanik');
    kanatEl?.classList.add('doner');
    efekt('ampul');
    dongu('pervane', true);
    kinoPoz('kino-pano-sevin');
    cerenPoz('ceren-pano-alkis');
    // Pervanenin sesi son sözden 1,5 sn sonra kısılır (kanat dönmeye devam eder).
    soyle('k-yandi', () => soyle('c-final', () => setTimeout(() => { if (durum === 'bitti') dongu('pervane', false); }, 1500)));
    setTimeout(() => {
      if (durum !== 'basari') return;
      durumYaz('bitti');
      tekrar.hidden = false;
      kinoPoz('kino-pano-bekle');
      cerenPoz('ceren-pano-bekle');
    }, 2000);
    return;
  }
  await kacis(s);
  if (salterEl) resmiDegistir(salterEl, 'salter-kapali');
  borulariBosalt();
  durumYaz('kacti');
}

/** Açılış işareti (KALITE-KURALLARI 6: çocuk 1 sn içinde ne yapacağını görür). */
function davet() {
  const ilk = d.bosluk.find((b) => bosMu(d, b, yerlesen));
  if (!ilk) return;
  const y = kok.querySelector<HTMLElement>('.pn-yuva[data-kare="' + anahtar(ilk) + '"]');
  y?.classList.add('vurgu');
  setTimeout(() => y?.classList.remove('vurgu'), 1800);
  const p = tepsiEl.find((x) => !x.yerlesti);
  p?.el.classList.add('zipla');
  setTimeout(() => p?.el.classList.remove('zipla'), 1300);
  tepki(kino);
}
/** Pano baştan: su turu, parçalar tepside. */
function yenidenBasla() {
  tekrar.hidden = true;
  for (const ad of ['su', 'cark', 'pervane']) dongu(ad, false);
  kanatEl?.classList.remove('doner');
  ampulEl?.classList.remove('yanik');
  salterTutamak?.remove();
  turuKur('su');
  sonSoz = '';
  davet();
  soyle('c-su-giris');
}
// ----- Başlangıç -----
turuKur('su');
let basladi = false;
async function basla() {
  if (basladi) return;
  basladi = true;
  sesiAc();
  davet();
  await sesleriYukle();
  soyle('c-su-giris');
}
tekrar.onclick = () => { sesiAc(); efekt('tik'); yenidenBasla(); };
kok.addEventListener('pointerdown', () => { void basla(); }, { once: true, capture: true });
if (HAZIR) { const ctx = sesMotorunuAc(); if (ctx && ctx.state === 'running') void basla(); }
ev.onclick = () => { sesiAc(); anaMenuyeDon(); };
dinle.onclick = () => { sesiAc(); void sesleriYukle()?.then(() => { sonSoz = ''; soyle(durum === 'bitti' ? 'c-final' : d.tur === 'su' ? 'c-su-giris' : 'c-isik-giris'); }); };
geriDinle(() => false);

// Çizimsiz denetim görünümü (yalnız test kipi): ızgara, boşluklar, akış.
if (!HAZIR) {
  const c = document.createElement('canvas');
  c.className = 'pk-denetim';
  c.width = FON.w;
  c.height = FON.h;
  kok.append(c);
  const g = c.getContext('2d')!;
  const ciz = () => {
    g.clearRect(0, 0, FON.w, FON.h);
    g.strokeStyle = 'rgb(120 90 60 / .35)';
    for (let i = 0; i <= 7; i++) { g.beginPath(); g.moveTo(IZGARA.x + i * 150, IZGARA.y); g.lineTo(IZGARA.x + i * 150, IZGARA.y + 600); g.stroke(); }
    for (let j = 0; j <= 4; j++) { g.beginPath(); g.moveTo(IZGARA.x, IZGARA.y + j * 150); g.lineTo(IZGARA.x + 1050, IZGARA.y + j * 150); g.stroke(); }
    g.lineWidth = 16;
    for (const [a, el] of parcaEl) {
      const [i, j] = a.split(',').map(Number);
      const p = yerlesen.get(a) ?? d.sabit.find((x) => x.i === i && x.j === j)!;
      const o = kareOrtasi({ i, j });
      g.strokeStyle = el.classList.contains('akti') ? (d.tur === 'su' ? '#3a8ee8' : '#f2c230') : '#8a6a4a';
      for (const y of uclar(p)) {
        g.beginPath(); g.moveTo(o.x, o.y);
        g.lineTo(o.x + (y === 'D' ? 75 : y === 'B' ? -75 : 0), o.y + (y === 'G' ? 75 : y === 'K' ? -75 : 0)); g.stroke();
      }
    }
    g.lineWidth = 2;
    requestAnimationFrame(ciz);
  };
  requestAnimationFrame(ciz);
}

declare global { interface Window { __pano?: unknown } }
if (TEST) {
  window.__pano = {
    durum: () => durum, tur: () => d.tur, sesKaydi, basla, vanaAc, salterIndir, yenidenBasla,
    bosluklar: () => d.bosluk.map((b) => ({ ...b })),
    /** Tepsideki n. parçayı karesine koyar (test). */
    yerlestir: (n: number, i: number, j: number) => { const t = tepsiEl[n]; if (t && !t.yerlesti) yerlestir(t, { i, j }); },
    cevir: (i: number, j: number) => parcaEl.get(i + ',' + j)?.dispatchEvent(new PointerEvent('pointerdown')),
    aci: (i: number, j: number) => yerlesen.get(i + ',' + j)?.aci,
  };
}
