// Minik Doktor · Minkino Kliniği · ilk örnek "Zıpzıp'ın Dizi" (ekip/senaryo/MINIK-DOKTOR-ORNEK.md).
// Çocuk doktor, Kino yardımcı. Zıpzıp korkuyla gelir; her adımda biraz rahatlar (korkulu → gülümseyen → zıplayan).
// 5+: stetoskop → dize dokun (yakın plan) → büyüteç → cımbız → ıslak pamuk → yara bandı → (geri açılır) → yıldız → damga.
// 4: büyüteç, cımbız ve damga yok. 2–3: pamuk ve damga da yok; tepside yalnız sıradaki alet.
// Kan, iğne, ceza, süre yok. Ekranda ok ve yazı yok; yol gösteren Kino'nun sesi ve hafifçe sallanan alet.
import './stil.css';
import { menuYasiOku } from '../../src/engine/menu-yas';
import { TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { anaMenuyeDon } from '../../src/uygulama';
import { efekt, konus, sesleriYukle } from './ses';
import { elKatmaniKur, merkez, suz, tutmaBaslat, uzaklik, type Nokta, type Tutma, type TutmaOlaylari } from './tutma';
import { cizimAdresi, cizimleriYukle, eksikCizimler, enUzakNokta, img, opakKutu, oyunAcilir, resim, type Cizim, type Leke } from './varliklar';
import {
  ALET, BANTLAR, BUYUTEC_CAM, GIRIS_POZU, KARNE, KINO_BOY, KINO_TABAN, POZ, SAHNE, YER, ZIPZIP_BOY,
  type AletAdi, type BantAdi, type KinoPozu, type ZipzipPozu,
} from './yerlesim';

type Yas = '2-3' | '4' | '5+';
type Adim = 'giris' | 'kalp' | 'diz' | 'buyutec' | 'cimbiz' | 'pamuk' | 'bant' | 'yildiz' | 'damga' | 'kapanis';
function yasOku(): Yas {
  const p = new URLSearchParams(location.search).get('yas');
  if (p === '2-3' || p === '4' || p === '5+') return p;
  const y = menuYasiOku();
  if (y === 2 || y === 3) return '2-3';
  return y === 4 ? '4' : '5+';
}
const yas = yasOku();
const AKIS: Record<Yas, Adim[]> = {
  '5+': ['kalp', 'diz', 'buyutec', 'cimbiz', 'pamuk', 'bant', 'yildiz', 'damga'],
  '4': ['kalp', 'diz', 'pamuk', 'bant', 'yildiz'],
  '2-3': ['kalp', 'diz', 'bant', 'yildiz'],
};
const akis = AKIS[yas];
const ADIM_ALETI: Partial<Record<Adim, AletAdi>> = { kalp: 'stetoskop', buyutec: 'buyutec', cimbiz: 'cimbiz', pamuk: 'pamuk', bant: 'bant', yildiz: 'yildiz', damga: 'damga' };
const YONERGE: Partial<Record<Adim, string>> = { kalp: 'k-kalp', diz: 'k-diz', buyutec: 'k-buyutec', cimbiz: 'k-cimbiz', pamuk: 'k-pamuk', bant: 'k-bant', yildiz: 'k-yildiz', damga: 'k-damga' };
const kucuk = yas === '2-3';

const z = (ms: number) => (TEST_MODU ? Math.min(ms, 30) : ms);
const bekle = (ms: number) => new Promise<void>(r => setTimeout(r, z(ms)));
const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sure = (ms: number) => (TEST_MODU || sakin ? Math.min(ms, 40) : ms);

const kok = document.getElementById('doktor')!;
kok.dataset.yas = yas;
const div = (sinif: string) => { const d = document.createElement('div'); d.className = sinif; return d; };
const dugme = (sinif: string, etiket: string) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = sinif; b.setAttribute('aria-label', etiket);
  return b;
};

const geri = dugme('dk-geri', 'Geri');
geri.innerHTML = IKON.geri;
geri.addEventListener('click', () => anaMenuyeDon());

if (!oyunAcilir) {
  kok.dataset.durum = 'eksik';
  kok.append(geri);
  console.warn('Minik Doktor: çizim eksik, oyun açılmaz:', eksikCizimler.join(', '));
} else {
  kok.dataset.durum = 'yukleniyor';
  const sesler = [...Object.values(YONERGE), 'k-merhaba', 'k-kalp-tut', 'k-ipucu-kalp', 'k-ipucu-diz', 'k-ipucu-sira', 'k-bant-sur', 'k-son',
    'z-giris', 'z-davul', 'z-yaprak', 'z-acimadi', 'z-serin', 'z-yasasin', 'z-cesur', ...BANTLAR.map(b => 'z-' + b),
    'e-gum', 'e-pit', 'e-surt', 'e-bant', 'e-damga', 'e-zipla', 'e-buldu', 'yildiz'].filter((s): s is string => !!s);
  void Promise.all([cizimleriYukle(), sesleriYukle(sesler)]).then(() => kur());
}

// ————————————————————————————————————————————————————————————————— sahne
let S = 1;
let sahneSol = 0, sahneUst = 0;
const sahne = div('dk-sahne');
const kamera = div('dk-kamera');
const fon = img('fon-muayene', 'dk-fon');
const kino = div('dk-kino');
const kinoIc = div('dk-kino-ic');
const kinoResim = img('kino-merhaba');
const zipzip = div('dk-zipzip');
const zipzipIc = div('dk-zipzip-ic');
const pozResim = img(GIRIS_POZU, 'dk-poz');
const kucukBant = img('bant-yildiz', 'dk-kucuk-bant');
const kucukYildiz = img('yildiz-cikartma', 'dk-kucuk-yildiz');
const dizHedef = dugme('dk-diz-hedef', "Zıpzıp'ın dizi");
const yakin = div('dk-yakin');
const yakinIc = div('dk-yakin-ic');
const camurTuval = document.createElement('canvas');
const yaprak = img('diz-yaprak', 'dk-katman dk-yaprak');
const bantYeri = div('dk-bant-yeri');
const karne = div('dk-karne');
const karneIz = div('dk-iz');
const nabiz = div('dk-nabiz');
const tepsi = div('dk-tepsi');
const secim = div('dk-secim');
const tekrar = dugme('dk-tekrar', 'Yeniden oyna');
tekrar.innerHTML = IKON.tekrar;
tekrar.addEventListener('click', () => location.reload());

function olcekle() {
  const W = innerWidth, H = innerHeight;
  S = Math.max(W / SAHNE.g, H / SAHNE.y);
  sahneSol = (W - SAHNE.g * S) / 2;
  sahneUst = (H - SAHNE.y * S) / 2;
  sahne.style.transform = 'translate(' + sahneSol + 'px,' + sahneUst + 'px) scale(' + S + ')';
  const hucre = Math.round(Math.max(64, Math.min(112, Math.min(H * 0.12, W * 0.085))));
  kok.style.setProperty('--hucre', hucre + 'px');
  kok.style.setProperty('--s', String(S));
  tepsiCercevesi(hucre);
  if (!secim.hidden) secimYeri();
}
/** ekran pikseli → sahne birimi */
const sahneye = (p: Nokta): Nokta => ({ x: (p.x - sahneSol) / S, y: (p.y - sahneUst) / S });

// ————————————————————————————————————————————————————————————————— karakterler
let poz: ZipzipPozu = GIRIS_POZU;
let zYer = { ...YER.giris };
let yildizKonumu: Nokta | null = null; // göğsün ortasına göre (sahne birimi)
let secilenBant: BantAdi | null = null;
const zOlcek = () => ZIPZIP_BOY / resim('zipzip-korkulu').naturalHeight;
function oranaKoy(el: HTMLElement, x: number, y: number) {
  el.style.left = x * 100 + '%';
  el.style.top = y * 100 + '%';
}
function pozKoy(p: ZipzipPozu, yer = zYer, canli = true) {
  const degisti = p !== poz;
  poz = p; zYer = { ...yer };
  const r = resim(p), k = zOlcek();
  const g = r.naturalWidth * k, y = r.naturalHeight * k;
  const n = POZ[p];
  Object.assign(zipzip.style, { left: yer.x - n.taban[0] * g + 'px', top: yer.y - n.taban[1] * y + 'px', width: g + 'px', height: y + 'px' });
  pozResim.src = cizimAdresi(p);
  if (n.diz) { dizHedef.hidden = false; oranaKoy(dizHedef, n.diz[0], n.diz[1]); } else dizHedef.hidden = true;
  if (secilenBant && n.bant) {
    kucukBant.src = cizimAdresi(secilenBant);
    kucukBant.hidden = false;
    oranaKoy(kucukBant, n.bant[0], n.bant[1]);
    kucukBant.style.width = n.bant[2] * 100 + '%';
    kucukBant.style.transform = 'translate(-50%,-50%) rotate(' + n.bant[3] + 'deg)';
  } else kucukBant.hidden = true;
  if (yildizKonumu) {
    kucukYildiz.hidden = false;
    kucukYildiz.style.left = n.gogus[0] * g + yildizKonumu.x + 'px';
    kucukYildiz.style.top = n.gogus[1] * y + yildizKonumu.y + 'px';
  } else kucukYildiz.hidden = true;
  if (degisti && canli && !sakin) zipzipIc.animate([{ transform: 'scale(.96,1.03)' }, { transform: 'scale(1)' }], { duration: 180, easing: 'ease-out' });
}
function kinoPoz(p: KinoPozu) {
  const r = resim(p), k = KINO_BOY / resim('kino-merhaba').naturalHeight;
  const g = r.naturalWidth * k, y = r.naturalHeight * k;
  const t = KINO_TABAN[p];
  Object.assign(kino.style, { left: YER.kino.x - t[0] * g + 'px', top: YER.kino.y - t[1] * y + 'px', width: g + 'px', height: y + 'px' });
  kinoResim.src = cizimAdresi(p);
}
/** Pozdaki bir noktanın (oran) ekrandaki yeri: kamera dönüşümü dahil. */
function pozNoktasi(o: [number, number]): Nokta {
  const r = zipzip.getBoundingClientRect();
  return { x: r.left + o[0] * r.width, y: r.top + o[1] * r.height };
}
async function zipzipKonus(ad: string) {
  zipzip.classList.add('dk-konusan');
  await konus(ad);
  zipzip.classList.remove('dk-konusan');
}
let kinoSirasi = 0;
async function kinoKonus(ad: string, p: KinoPozu = 'kino-gosteriyor') {
  const ben = ++kinoSirasi;
  kinoPoz(p);
  kino.classList.add('dk-konusan');
  await konus(ad);
  if (ben === kinoSirasi) kino.classList.remove('dk-konusan');
}
/** Zıpzıp yerinden başka bir yere seker (sahne birimi); sayi: sıçrama sayısı. */
async function sek(hedef: Nokta, sayi: number, yukseklik: number, toplam: number) {
  const bas = { ...zYer };
  const kare: Keyframe[] = [];
  const N = sayi * 8;
  for (let i = 0; i <= N; i++) {
    const t = i / N, f = (t * sayi) % 1;
    const dx = (hedef.x - bas.x) * t, dy = (hedef.y - bas.y) * t;
    const h = i === N ? 0 : -Math.sin(Math.PI * f) * yukseklik;
    kare.push({ transform: 'translate(' + dx + 'px,' + (dy + h) + 'px)', offset: t });
  }
  const a = zipzip.animate(kare, { duration: sure(toplam), easing: 'linear', fill: 'forwards' });
  await a.finished.catch(() => undefined);
  pozKoy(poz, hedef, false);
  a.cancel();
}
async function zipla(yukseklik = 90) {
  const once = poz;
  pozKoy('zipzip-zipla');
  efekt('e-zipla', 0.8);
  const a = zipzipIc.animate([
    { transform: 'translateY(0) scale(1.04,.94)' }, { transform: 'translateY(' + -yukseklik + 'px) scale(.97,1.04)', offset: 0.45 },
    { transform: 'translateY(0) scale(1.05,.93)', offset: 0.85 }, { transform: 'translateY(0) scale(1)' },
  ], { duration: sure(620), easing: 'ease-in-out' });
  await a.finished.catch(() => undefined);
  return once;
}

// ————————————————————————————————————————————————————————————————— yakın plan (diz)
let cizik: Leke, camur: Leke, yaprakKutu: Leke;
let sap: Nokta;
let camurBaslangic = 0;
function yakinKur() {
  cizik = opakKutu('diz-cizik');
  camur = opakKutu('diz-camur');
  yaprakKutu = opakKutu('diz-yaprak');
  sap = enUzakNokta('diz-yaprak', cizik.x, cizik.y);
  camurTuval.width = 1024; camurTuval.height = 576;
  camurTuval.className = 'dk-katman dk-camur';
  const c = camurTuval.getContext('2d', { willReadFrequently: true })!;
  c.drawImage(resim('diz-camur'), 0, 0, 1024, 576);
  camurBaslangic = camurSay();
  yakinIc.append(img('diz-temiz', 'dk-katman'), img('diz-cizik', 'dk-katman dk-cizik'));
  if (akis.includes('pamuk')) yakinIc.append(camurTuval);
  if (akis.includes('cimbiz')) { yakinIc.append(yaprak); yaprak.style.transformOrigin = yaprakKutu.x * 100 + '% ' + yaprakKutu.y * 100 + '%'; }
  yakinIc.append(bantYeri);
  oranaKoy(bantYeri, cizik.x, cizik.y);
}
/** yakın plan tuvalindeki oran → ekran pikseli */
function yakinNokta(x: number, y: number): Nokta {
  const r = yakinIc.getBoundingClientRect();
  return { x: r.left + x * r.width, y: r.top + y * r.height };
}
function camurSay(): number {
  const c = camurTuval.getContext('2d', { willReadFrequently: true })!;
  const v = c.getImageData(0, 0, camurTuval.width, camurTuval.height).data;
  let n = 0;
  for (let j = 0; j < camurTuval.height; j += 4) for (let i = 0; i < camurTuval.width; i += 4) if (v[(j * camurTuval.width + i) * 4 + 3] > 40) n++;
  return n;
}

const YAKLASMA = 2.6;
let kameraSon = '';
async function yaklas() {
  const d = merkez(dizHedef);
  const k = sahneye(d);
  const c = { x: cizik.x * SAHNE.g, y: cizik.y * SAHNE.y };
  kameraSon = 'translate(' + (c.x - k.x * YAKLASMA) + 'px,' + (c.y - k.y * YAKLASMA) + 'px) scale(' + YAKLASMA + ')';
  const a0 = 0.22;
  const yakinBas = 'translate(' + (k.x - c.x * a0) + 'px,' + (k.y - c.y * a0) + 'px) scale(' + a0 + ')';
  const t = sure(950), e = 'cubic-bezier(.5,0,.2,1)';
  yakin.hidden = false;
  kamera.animate([{ transform: 'none', filter: 'blur(0) brightness(1)' }, { transform: kameraSon, filter: 'blur(5px) brightness(.93)' }], { duration: t, easing: e, fill: 'forwards' });
  yakinIc.animate([{ transform: yakinBas }, { transform: 'none' }], { duration: t, easing: e, fill: 'forwards' });
  const a = yakin.animate([{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], { duration: t, easing: 'ease-out', fill: 'forwards' });
  await a.finished.catch(() => undefined);
  kok.dataset.plan = 'yakin';
}
async function uzaklas() {
  const t = sure(900), e = 'cubic-bezier(.5,0,.2,1)';
  const d = kameraSon;
  // dizin odadaki yeri kameranın son hâlinden bağımsızdır: aynı başlangıç noktasını kullanırız
  const kr = dizinOdaYeri;
  const c = { x: cizik.x * SAHNE.g, y: cizik.y * SAHNE.y };
  const a0 = 0.22;
  const yakinBas = 'translate(' + (kr.x - c.x * a0) + 'px,' + (kr.y - c.y * a0) + 'px) scale(' + a0 + ')';
  kamera.getAnimations().forEach(a => a.cancel());
  yakinIc.getAnimations().forEach(a => a.cancel());
  yakin.getAnimations().forEach(a => a.cancel());
  kamera.animate([{ transform: d, filter: 'blur(5px) brightness(.93)' }, { transform: 'none', filter: 'blur(0) brightness(1)' }], { duration: t, easing: e });
  yakinIc.animate([{ transform: 'none' }, { transform: yakinBas }], { duration: t, easing: e, fill: 'forwards' });
  const a = yakin.animate([{ opacity: 1 }, { opacity: 0, offset: 0.7 }, { opacity: 0 }], { duration: t, easing: 'ease-in', fill: 'forwards' });
  await a.finished.catch(() => undefined);
  yakin.hidden = true;
  yakin.getAnimations().forEach(x => x.cancel());
  yakinIc.getAnimations().forEach(x => x.cancel());
  kok.dataset.plan = 'oda';
}
let dizinOdaYeri: Nokta = { x: 0, y: 0 };

// ————————————————————————————————————————————————————————————————— tepsi
const aletDugmeleri = new Map<AletAdi, HTMLButtonElement>();
const kullanildi = new Set<AletAdi>();
function tepsiKur() {
  const sirali: AletAdi[] = akis.map(a => ADIM_ALETI[a]).filter((a): a is AletAdi => !!a);
  for (const ad of sirali) {
    const b = dugme('dk-alet', ALET[ad].etiket);
    b.dataset.alet = ad;
    b.append(img(ALET[ad].ad, ALET[ad].ayna ? 'dk-ayna' : ''));
    b.addEventListener('pointerdown', e => aletBasildi(ad, b, e));
    b.addEventListener('click', e => { if (e.detail === 0) aletBasildi(ad, b); });
    aletDugmeleri.set(ad, b);
    tepsi.append(b);
  }
}
function tepsiCercevesi(hucre: number) {
  const r = resim('alet-tepsisi');
  if (!r.naturalWidth) return;
  const dilim = Math.round(r.naturalHeight * 0.3);
  tepsi.style.borderImage = 'url("' + cizimAdresi('alet-tepsisi') + '") ' + dilim + ' fill / ' + Math.round(hucre * 0.34) + 'px stretch';
}
function tepsiGuncelle() {
  const simdiki = ADIM_ALETI[adim];
  let gorunen = 0;
  for (const [ad, b] of aletDugmeleri) {
    const goster = !kullanildi.has(ad) && (!kucuk || ad === simdiki) && adim !== 'giris' && adim !== 'kapanis';
    if (goster) gorunen++;
    if (goster && b.hidden) { b.hidden = false; if (!sakin) b.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.2,.8,.3,1.3)' }); }
    if (!goster && !b.hidden) b.hidden = true;
  }
  tepsi.hidden = gorunen === 0;
  tepsi.dataset.sutun = gorunen > 3 ? '2' : '1';
}
function aletBitti(ad: AletAdi) {
  kullanildi.add(ad);
  tepsiGuncelle();
}

// ————————————————————————————————————————————————————————————————— adımlar, ipuçları
let adim: Adim = 'giris';
let mesgul = true;
let tutulan: Tutma | null = null;
let yanlis = 0;
let bosSayac: number | undefined, tekrarSayac: number | undefined;
function sayaclariKur() {
  clearTimeout(bosSayac); clearTimeout(tekrarSayac);
  if (adim === 'giris' || adim === 'kapanis') return;
  bosSayac = window.setTimeout(salla, z(6000));
  tekrarSayac = window.setTimeout(() => { const y = YONERGE[adim]; if (y && !tutulan && !mesgul) void kinoKonus(y); }, z(15000));
}
function salla() {
  if (mesgul) return;
  let hedef: HTMLElement | undefined;
  if (adim === 'diz') { hedef = zipzipIc; dizHedef.classList.add('dk-isaret'); setTimeout(() => dizHedef.classList.remove('dk-isaret'), 1800); }
  else if (adim === 'bant' && bantEl) hedef = bantEl;
  else if (adim === 'bant' || adim === 'yildiz') hedef = secim;
  else { const a = ADIM_ALETI[adim]; hedef = a ? aletDugmeleri.get(a) : undefined; }
  if (!hedef) return;
  hedef.classList.remove('dk-salla');
  void hedef.offsetWidth;
  hedef.classList.add('dk-salla');
  setTimeout(() => hedef!.classList.remove('dk-salla'), 1900);
}
function yanlisAlet(b: HTMLElement) {
  if (!sakin) b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-7px) rotate(-4deg)' }, { transform: 'translateX(6px) rotate(3deg)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 340 });
  yanlis++;
  void kinoKonus(adim === 'kalp' ? 'k-ipucu-kalp' : adim === 'diz' ? 'k-ipucu-diz' : 'k-ipucu-sira');
  if (yanlis >= 2) setTimeout(salla, z(900));
}
function adimaGec(a: Adim) {
  adim = a;
  kok.dataset.adim = a;
  yanlis = 0;
  mesgul = false;
  tepsiGuncelle();
  sayaclariKur();
  const y = YONERGE[a];
  if (y) void kinoKonus(y);
  dizHedef.disabled = a !== 'diz';
  if (a === 'bant') bantSeciminiAc();
  if (a === 'yildiz') yildizSeciminiAc();
  if (a === 'damga') void karneAc();
}
function sonraki(): Adim {
  const i = akis.indexOf(adim);
  return akis[i + 1] ?? 'kapanis';
}
kok.addEventListener('pointerdown', () => sayaclariKur(), { capture: true });

function aletBasildi(ad: AletAdi, b: HTMLButtonElement, e?: PointerEvent) {
  if (tutulan?.birakti) tutulan = null;
  if (e) { if (e.button !== 0 || tutulan) return; e.preventDefault(); }
  if (mesgul) return;
  if (ADIM_ALETI[adim] !== ad) { yanlisAlet(b); return; }
  const t = ALET[ad];
  const tanim = { ad: t.ad, boyPx: t.boy * S, tut: t.tut, uc: t.uc, ayna: t.ayna };
  if (ad === 'stetoskop') kalpBaslat(b, tanim, e);
  else if (ad === 'buyutec') buyutecBaslat(b, tanim, e);
  else if (ad === 'cimbiz') cimbizBaslat(b, tanim, e);
  else if (ad === 'pamuk') pamukBaslat(b, tanim, e);
  else if (ad === 'damga') damgaBaslat(b, tanim, e);
}
type Tanim = Parameters<typeof tutmaBaslat>[1];
function tut(b: HTMLElement, tanim: Tanim, ol: TutmaOlaylari, e?: PointerEvent): Tutma {
  const t = tutmaBaslat(b, tanim, {
    tasi: ol.tasi,
    birak: (uc, p) => { const r = ol.birak?.(uc, p) ?? false; if (!r) tutulan = null; return r; },
  }, e);
  tutulan = t;
  return t;
}
async function birakVeBitir(t: Tutma, nasil: 'geri' | 'kaybol' | 'yerinde') {
  if (tutulan === t) tutulan = null;
  await t.bitir(nasil);
}

// ————————————————————————————————————————————————————————————————— 1. stetoskop: içerideki davul
function kalpBaslat(b: HTMLElement, tanim: Tanim, e?: PointerEvent) {
  let uc: Nokta | null = null;
  let sonVurus = 0, tutmaBas = 0, uyarildi = false, bitti = false;
  const HEDEF = kucuk ? 1200 : 2000;
  const R_KALP = (kucuk ? 95 : 62) * S, R_GOGUS = 300 * S;
  const dongu = (an: number) => {
    if (bitti || tutulan !== t || t.birakti) return;
    if (uc) {
      const k = pozNoktasi(POZ[poz].kalp);
      const d = uzaklik(uc, k);
      const y = Math.max(0, 1 - d / R_GOGUS);
      if (y > 0) {
        const aralik = 980 - 560 * y;
        if (an - sonVurus >= aralik) {
          sonVurus = an;
          efekt('e-gum', 0.3 + 0.9 * y, 0.94 + 0.12 * y);
          nabiz.animate([{ opacity: 0.12 + 0.5 * y * y }, { opacity: 0 }], { duration: 420, easing: 'ease-out' });
        }
      }
      if (d < R_KALP) {
        if (!tutmaBas) tutmaBas = an;
        if (an - tutmaBas >= z(HEDEF)) { bitti = true; void kalpBitti(t); return; }
      } else {
        if (tutmaBas && an - tutmaBas > 450 && !uyarildi) { uyarildi = true; void kinoKonus('k-kalp-tut'); }
        tutmaBas = 0;
      }
    }
    requestAnimationFrame(dongu);
  };
  const t = tut(b, tanim, { tasi: u => { uc = u; } }, e);
  uc = t.uc();
  requestAnimationFrame(dongu);
  if (!e) void suz(t, pozNoktasi(POZ[poz].kalp), 700, u => { uc = u; });
}
async function kalpBitti(t: Tutma) {
  mesgul = true;
  efekt('e-gum', 1.2, 1.05);
  zipzip.classList.remove('dk-titrek');
  void birakVeBitir(t, 'kaybol');
  aletBitti('stetoskop');
  pozKoy('zipzip-gulumseyen');
  zipzipIc.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-14px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: sure(700) });
  await zipzipKonus('z-davul');
  await bekle(250);
  pozKoy('zipzip-korkulu');
  adimaGec('diz');
}

// ————————————————————————————————————————————————————————————————— 2. dize dokun: yakın plan
dizHedef.addEventListener('click', () => { void dizeDokundu(); });
async function dizeDokundu() {
  if (adim !== 'diz' || mesgul) return;
  mesgul = true;
  clearTimeout(bosSayac); clearTimeout(tekrarSayac);
  dizinOdaYeri = sahneye(merkez(dizHedef));
  await yaklas();
  adimaGec(sonraki());
}

// ————————————————————————————————————————————————————————————————— 3. büyüteç: camın içi gerçekten büyütür
function buyutecBaslat(b: HTMLElement, tanim: Tanim, e?: PointerEvent) {
  let bulundu = false, yakinBas = 0;
  const t = tut(b, tanim, { tasi: () => guncelle() }, e);
  const mercek = div('dk-mercek');
  const mIc = div('dk-mercek-ic');
  mIc.append(img('diz-temiz'), img('diz-cizik'), img('diz-camur'), img('diz-yaprak'));
  mercek.append(mIc);
  const r = BUYUTEC_CAM.r * t.g;
  Object.assign(mercek.style, { left: BUYUTEC_CAM.x * t.g - r + 'px', top: BUYUTEC_CAM.y * t.y - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px' });
  t.el.firstElementChild!.append(mercek);
  const guncelle = () => {
    const P = t.uc();
    const R = yakinIc.getBoundingClientRect();
    const M = BUYUTEC_CAM.buyutme;
    Object.assign(mIc.style, { width: R.width * M + 'px', height: R.height * M + 'px', left: r - (P.x - R.left) * M + 'px', top: r - (P.y - R.top) * M + 'px' });
    if (bulundu) return;
    const Y = yakinNokta(yaprakKutu.x, yaprakKutu.y);
    if (uzaklik(P, Y) < r * 0.6) {
      if (!yakinBas) yakinBas = performance.now();
      else if (performance.now() - yakinBas > z(260)) { bulundu = true; void yaprakBulundu(t); }
    } else yakinBas = 0;
  };
  guncelle();
  // parmak yaprağın üstünde dursa da süre dolsun: alet eldeyken her karede bakılır
  const dongu = () => { if (bulundu || tutulan !== t || t.birakti) return; guncelle(); requestAnimationFrame(dongu); };
  requestAnimationFrame(dongu);
  if (!e) void suz(t, yakinNokta(yaprakKutu.x, yaprakKutu.y), 800, guncelle);
}
async function yaprakBulundu(t: Tutma) {
  mesgul = true;
  efekt('e-buldu', 1);
  yaprak.classList.add('dk-gorundu');
  if (!sakin) yaprak.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.15)', offset: 0.6 }, { opacity: 1, transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
  await bekle(350);
  void birakVeBitir(t, 'kaybol');
  aletBitti('buyutec');
  await zipzipKonus('z-yaprak');
  adimaGec('cimbiz');
}

// ————————————————————————————————————————————————————————————————— 4. cımbız: yaprak direnir, uzar, pıt diye çıkar
function cimbizBaslat(b: HTMLElement, tanim: Tanim, e?: PointerEvent) {
  let tutuyor: Nokta | null = null, cikti = false;
  const ESIK = 150 * S;
  const t = tut(b, tanim, {
    tasi: uc => adim2(uc),
    birak: () => { if (tutuyor && !cikti) geriYaylan(); return false; },
  }, e);
  const adim2 = (uc: Nokta) => {
    if (cikti) return;
    const Sp = yakinNokta(sap.x, sap.y);
    if (!tutuyor) {
      if (uzaklik(uc, Sp) < Math.max(44, 80 * S)) { tutuyor = { ...uc }; efekt('e-pit', 0.35, 1.4); }
      return;
    }
    const v = { x: uc.x - tutuyor.x, y: uc.y - tutuyor.y };
    const L = Math.hypot(v.x, v.y);
    if (L > ESIK) { cikti = true; void yaprakCikti(t, v); return; }
    const aci = Math.atan2(v.y, v.x) * 180 / Math.PI;
    const uza = 1 + Math.min(0.32, L / ESIK * 0.32);
    yaprak.style.transform = 'translate(' + v.x * 0.28 / S + 'px,' + v.y * 0.28 / S + 'px) rotate(' + aci + 'deg) scaleX(' + uza + ') scaleY(' + (1 / Math.sqrt(uza)) + ') rotate(' + -aci + 'deg)';
  };
  const geriYaylan = () => {
    const once = yaprak.style.transform;
    yaprak.style.transform = '';
    if (!sakin) yaprak.animate([{ transform: once }, { transform: 'scale(.96)', offset: 0.55 }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    tutuyor = null;
  };
  if (!e) {
    const Sp = yakinNokta(sap.x, sap.y);
    void suz(t, Sp, 700, adim2).then(async () => {
      await bekle(200);
      const uzak = { x: Sp.x + (sap.x - cizik.x > 0 ? 1 : -1) * 200 * S, y: Sp.y - 60 * S };
      await suz(t, uzak, 900, adim2);
    });
  }
}
async function yaprakCikti(t: Tutma, v: Nokta) {
  mesgul = true;
  efekt('e-pit', 1.1);
  const bx = v.x * 0.45 / S, by = v.y * 0.45 / S;
  const yon = v.x >= 0 ? 1 : -1;
  yaprak.style.transform = '';
  const a = yaprak.animate([
    { transform: 'translate(' + bx + 'px,' + by + 'px) rotate(0)', opacity: 1 },
    { transform: 'translate(' + (bx + yon * 60) + 'px,' + (by + 120) + 'px) rotate(' + yon * 28 + 'deg)', opacity: 1, offset: 0.3 },
    { transform: 'translate(' + (bx - yon * 30) + 'px,' + (by + 300) + 'px) rotate(' + -yon * 22 + 'deg)', opacity: 1, offset: 0.62 },
    { transform: 'translate(' + (bx + yon * 40) + 'px,' + (by + 560) + 'px) rotate(' + yon * 18 + 'deg)', opacity: 0 },
  ], { duration: sure(1500), easing: 'cubic-bezier(.4,.1,.6,1)', fill: 'forwards' });
  void a.finished.then(() => { yaprak.hidden = true; });
  await bekle(250);
  void birakVeBitir(t, 'kaybol');
  aletBitti('cimbiz');
  await zipzipKonus('z-acimadi');
  adimaGec('pamuk');
}

// ————————————————————————————————————————————————————————————————— 5. ıslak pamuk: çamur parmağın geçtiği yerden silinir
function pamukBaslat(b: HTMLElement, tanim: Tanim, e?: PointerEvent) {
  const c = camurTuval.getContext('2d', { willReadFrequently: true })!;
  let son: Nokta | null = null, sonSay = 0, sonSes = 0, bitti = false;
  const sil = (uc: Nokta) => {
    if (bitti) return;
    const R = camurTuval.getBoundingClientRect();
    const k = camurTuval.width / R.width;
    const p = { x: (uc.x - R.left) * k, y: (uc.y - R.top) * k };
    const yaricap = (kucuk ? 95 : 78) * S * k;
    c.globalCompositeOperation = 'destination-out';
    const bas = son ?? p;
    const L = uzaklik(bas, p), n = Math.max(1, Math.ceil(L / (yaricap / 3)));
    for (let i = 1; i <= n; i++) {
      const x = bas.x + (p.x - bas.x) * i / n, y = bas.y + (p.y - bas.y) * i / n;
      const g = c.createRadialGradient(x, y, yaricap * 0.55, x, y, yaricap);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, yaricap, 0, Math.PI * 2); c.fill();
    }
    son = p;
    const an = performance.now();
    if (L > 2 && an - sonSes > 210) { sonSes = an; efekt('e-surt', 0.7, 0.9 + Math.random() * 0.2); }
    if (an - sonSay > 110) {
      sonSay = an;
      const kalan = camurSay() / Math.max(1, camurBaslangic);
      kok.dataset.camur = String(Math.round(kalan * 100));
      if (kalan <= 0.1) { bitti = true; void camurBitti(t); }
    }
  };
  const t = tut(b, tanim, { tasi: uc => sil(uc), birak: () => { son = null; return false; } }, e);
  if (!e) {
    void (async () => {
      const sol = camur.sol, ust = camur.ust, gg = camur.g, yy = camur.y2;
      const satir = 6;
      for (let i = 0; i <= satir && !bitti; i++) {
        const y = ust + yy * (i / satir);
        await suz(t, yakinNokta(i % 2 ? sol + gg : sol, y), 260, sil);
        await suz(t, yakinNokta(i % 2 ? sol : sol + gg, y), 420, sil);
      }
    })();
  }
}
async function camurBitti(t: Tutma) {
  mesgul = true;
  camurTuval.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(420), fill: 'forwards' });
  void birakVeBitir(t, 'kaybol');
  aletBitti('pamuk');
  await zipzipKonus('z-serin');
  adimaGec('bant');
}

// ————————————————————————————————————————————————————————————————— 6. yara bandı: seç, çiziğe koy, sürterek düzleştir
let secimSirasi = 0;
function secimAc(dugmeler: HTMLButtonElement[]) {
  secimSirasi++;
  secim.replaceChildren(...dugmeler);
  secim.hidden = false;
  secimYeri();
  const tr = tepsi.getBoundingClientRect();
  dugmeler.forEach((b, i) => {
    if (sakin) return;
    const br = b.getBoundingClientRect();
    const dx = tr.left + tr.width / 2 - (br.left + br.width / 2), dy = tr.top + tr.height / 2 - (br.top + br.height / 2);
    b.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.3)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 380, delay: i * 70, easing: 'cubic-bezier(.2,.8,.3,1.15)', fill: 'backwards' });
  });
}
/** Seçim sırası tepsinin hemen solunda durur (tepsi daraldıkça yaklaşır). */
function secimYeri() {
  const tr = tepsi.hidden ? null : tepsi.getBoundingClientRect();
  secim.style.right = (tr ? innerWidth - tr.left : 0) + Math.max(12, innerWidth * 0.015) + 'px';
}
function secimKapat() {
  const d = [...secim.children] as HTMLElement[];
  const ben = secimSirasi;
  if (sakin || !d.length) { secim.hidden = true; secim.replaceChildren(); return; }
  // kapanırken yeni bir seçim açıldıysa (bantlardan hemen sonra yıldızlar) ona dokunma
  void Promise.all(d.map(b => b.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.6)' }], { duration: sure(200), fill: 'forwards' }).finished))
    .catch(() => undefined).then(() => { if (ben === secimSirasi) { secim.hidden = true; secim.replaceChildren(); } });
}
const BANT_ETIKET: Record<BantAdi, string> = { 'bant-yildiz': 'Yıldızlı bant', 'bant-kalp': 'Kalpli bant', 'bant-gokkusagi': 'Gökkuşağı bant', 'bant-pati': 'Patili bant' };
const bantBoy = () => Math.max(ALET.bant.boy, cizik.g * SAHNE.g * 1.5);
function bantSeciminiAc() {
  aletBitti('bant');
  secim.dataset.tur = 'bant';
  const dugmeler = BANTLAR.map(ad => {
    const b = dugme('dk-secenek', BANT_ETIKET[ad]);
    b.dataset.bant = ad;
    const r = img(ad);
    r.style.width = bantBoy() * S * 0.72 + 'px';
    b.append(r);
    b.addEventListener('pointerdown', e => { if (e.button === 0 && !tutulan) { e.preventDefault(); bantTut(ad, b, e); } });
    b.addEventListener('click', e => { if (e.detail === 0) bantTut(ad, b); });
    return b;
  });
  secimAc(dugmeler);
}
function bantTut(ad: BantAdi, b: HTMLButtonElement, e?: PointerEvent) {
  if (mesgul || adim !== 'bant') return;
  const hedef = () => yakinNokta(cizik.x, cizik.y);
  const yakinMi = (uc: Nokta) => uzaklik(uc, hedef()) < (Math.max(cizik.g * SAHNE.g, cizik.y2 * SAHNE.y) / 2 + 110) * S;
  const t = tut(b, { ad, boyPx: bantBoy() * S, tut: [0.5, 0.5], uc: [0.5, 0.5], kaldir: Math.min(innerHeight * 0.05, 40) }, {
    birak: uc => { if (!yakinMi(uc)) return false; void bantKondu(ad, t); return true; },
  }, e);
  if (!e) void suz(t, hedef(), 700).then(() => bantKondu(ad, t));
}
let bantEl: HTMLButtonElement | null = null;
async function bantKondu(ad: BantAdi, t: Tutma) {
  mesgul = true;
  secilenBant = ad;
  const bas = t.uc();
  await birakVeBitir(t, 'yerinde');
  secimKapat();
  const b = dugme('dk-bant', 'Bandı düzelt');
  const r = img(ad);
  b.append(r);
  b.style.width = bantBoy() + 'px';
  b.style.setProperty('--kabar', '1');
  bantYeri.append(b);
  bantEl = b;
  const son = yakinNokta(cizik.x, cizik.y);
  if (!sakin) b.animate([{ translate: 'calc(-50% + ' + (bas.x - son.x) / S + 'px) calc(-50% + ' + (bas.y - son.y) / S + 'px)' }, { translate: '-50% -50%' }], { duration: 200, easing: 'ease-out' });
  efekt('e-pit', 0.6, 0.8);
  kok.dataset.adim = 'bant-sur';
  mesgul = false;
  sayaclariKur();
  void kinoKonus('k-bant-sur');
  bantSurtmeKur(b);
}
function bantSurtmeKur(b: HTMLButtonElement) {
  let yol = 0, son: Nokta | null = null, sonSes = 0, bitti = false, esikGecen = 0;
  const ESIK = (yas === '5+' ? 950 : yas === '4' ? 760 : 480);
  const ilerle = (p: Nokta) => {
    if (bitti) return;
    const r = b.getBoundingClientRect();
    const icinde = p.x > r.left - 30 && p.x < r.right + 30 && p.y > r.top - 30 && p.y < r.bottom + 30;
    if (son && icinde) yol += uzaklik(son, p) / S;
    son = p;
    const k = Math.max(0, 1 - yol / ESIK);
    b.style.setProperty('--kabar', k.toFixed(3));
    const an = performance.now();
    if (icinde && an - sonSes > 190) { sonSes = an; efekt('e-surt', 0.55, 1.1); }
    const asama = Math.floor((1 - k) * 3);
    if (asama > esikGecen && k > 0) { esikGecen = asama; efekt('e-pit', 0.5, 1.2 + asama * 0.1); }
    if (k <= 0) { bitti = true; void bantDuzledi(); }
  };
  let id: number | null = null;
  b.addEventListener('pointerdown', e => { if (id !== null || mesgul) return; id = e.pointerId; b.setPointerCapture(id); son = { x: e.clientX, y: e.clientY }; e.preventDefault(); });
  b.addEventListener('pointermove', e => { if (e.pointerId === id) ilerle({ x: e.clientX, y: e.clientY }); });
  const birak = (e: PointerEvent) => { if (e.pointerId === id) { id = null; son = null; } };
  b.addEventListener('pointerup', birak);
  b.addEventListener('pointercancel', birak);
  b.addEventListener('click', e => {
    if (e.detail !== 0 || bitti || mesgul) return;
    const r = b.getBoundingClientRect();
    void (async () => {
      for (let i = 0; i < 14 && !bitti; i++) {
        const x = r.left + r.width * (i % 2 ? 0.85 : 0.15), y = r.top + r.height / 2;
        if (i === 0) son = { x: r.left + r.width * 0.5, y };
        ilerle({ x, y });
        await bekle(60);
      }
    })();
  });
}
async function bantDuzledi() {
  mesgul = true;
  efekt('e-bant', 1);
  bantEl?.classList.add('dk-yapisti');
  await bekle(200);
  await zipzipKonus('z-' + secilenBant!);
  pozKoy('zipzip-gulumseyen', zYer, false);
  await uzaklas();
  adimaGec(sonraki());
}

// ————————————————————————————————————————————————————————————————— 7. yıldız çıkartması göğse
function yildizSeciminiAc() {
  aletBitti('yildiz');
  secim.dataset.tur = 'yildiz';
  const dugmeler = [0, 1, 2].map(i => {
    const b = dugme('dk-secenek dk-secenek-yildiz', 'Yıldız çıkartması');
    b.dataset.sira = String(i);
    b.append(img('yildiz-cikartma'));
    b.addEventListener('pointerdown', e => { if (e.button === 0 && !tutulan) { e.preventDefault(); yildizTut(b, e); } });
    b.addEventListener('click', e => { if (e.detail === 0) yildizTut(b); });
    return b;
  });
  secimAc(dugmeler);
}
const yildizBoy = () => ALET.yildiz.boy;
function yildizTut(b: HTMLButtonElement, e?: PointerEvent) {
  if (mesgul || adim !== 'yildiz') return;
  const gogus = () => pozNoktasi(POZ[poz].gogus);
  const t = tut(b, { ad: 'yildiz-cikartma', boyPx: Math.max(yildizBoy() * S * 1.25, 64), tut: [0.5, 0.5], uc: [0.5, 0.5] }, {
    birak: uc => {
      const g = gogus();
      if (uzaklik(uc, g) > 150 * S) return false;
      void yildizYapisti(t, uc);
      return true;
    },
  }, e);
  if (!e) void suz(t, gogus(), 700).then(() => yildizYapisti(t, gogus()));
}
async function yildizYapisti(t: Tutma, uc: Nokta) {
  mesgul = true;
  const g = pozNoktasi(POZ[poz].gogus);
  // göğüs ortasından en çok 60 birim kayabilir (çocuğun koyduğu yere yakın kalır)
  const kamS = zipzip.getBoundingClientRect().width / parseFloat(zipzip.style.width);
  const dx = (uc.x - g.x) / kamS, dy = (uc.y - g.y) / kamS;
  const L = Math.hypot(dx, dy), m = L > 60 ? 60 / L : 1;
  yildizKonumu = { x: dx * m, y: dy * m };
  await birakVeBitir(t, 'yerinde');
  secimKapat();
  kucukYildiz.style.width = yildizBoy() + 'px';
  pozKoy(poz, zYer, false);
  if (!sakin) kucukYildiz.animate([{ transform: 'translate(-50%,-50%) scale(1.6) rotate(-20deg)' }, { transform: 'translate(-50%,-50%) scale(.9) rotate(4deg)', offset: 0.6 }, { transform: 'translate(-50%,-50%) scale(1) rotate(0)' }], { duration: 420, easing: 'ease-out' });
  efekt('yildiz', 0.9);
  await bekle(300);
  kinoPoz('kino-sevinc');
  const once = await zipla(70);
  pozKoy(once === 'zipzip-zipla' ? 'zipzip-gulumseyen' : once);
  if (akis.includes('damga')) { kinoPoz('kino-gosteriyor'); adimaGec('damga'); } else void kapanis();
}

// ————————————————————————————————————————————————————————————————— 8. damga sağlık karnesine
async function karneAc() {
  karne.hidden = false;
  if (!sakin) await karne.animate([{ transform: 'translate(-50%,-50%) translateY(620px) rotate(-8deg)' }, { transform: 'translate(-50%,-50%) rotate(-2deg)' }], { duration: sure(520), easing: 'cubic-bezier(.2,.8,.3,1.1)' }).finished.catch(() => undefined);
}
const damgaYeri = (): Nokta => {
  const r = karne.getBoundingClientRect();
  return { x: r.left + KARNE.damgaYeri[0] * r.width, y: r.top + KARNE.damgaYeri[1] * r.height };
};
function damgaBaslat(b: HTMLElement, tanim: Tanim, e?: PointerEvent) {
  const t = tut(b, tanim, {
    birak: uc => {
      if (uzaklik(uc, damgaYeri()) > 120 * S) return false;
      void damgaBasildi(t);
      return true;
    },
  }, e);
  if (!e) void suz(t, damgaYeri(), 700).then(() => damgaBasildi(t));
}
async function damgaBasildi(t: Tutma) {
  mesgul = true;
  t.ucaKoy(damgaYeri());
  const ic = t.el.firstElementChild as HTMLElement;
  ic.style.transformOrigin = '50% 100%';
  await ic.animate([{ transform: 'none' }, { transform: 'translateY(10px) scale(1.02,.9)' }], { duration: sure(110), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
  efekt('e-damga', 1.2);
  karneIz.hidden = false;
  if (!sakin) karneIz.animate([{ opacity: 0, transform: 'translate(-50%,-50%) rotate(-12deg) scale(1.15)' }, { opacity: 0.88, transform: 'translate(-50%,-50%) rotate(-12deg) scale(1)' }], { duration: 160, fill: 'backwards' });
  await bekle(180);
  await ic.animate([{ transform: 'translateY(10px) scale(1.02,.9)' }, { transform: 'translateY(-26px)' }], { duration: sure(200), easing: 'ease-out', fill: 'forwards' }).finished.catch(() => undefined);
  void birakVeBitir(t, 'kaybol');
  aletBitti('damga');
  await bekle(900);
  if (!sakin) await karne.animate([{ transform: 'translate(-50%,-50%) rotate(-2deg)' }, { transform: 'translate(-50%,-50%) translateY(640px) rotate(6deg)' }], { duration: sure(480), easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' }).finished.catch(() => undefined);
  karne.hidden = true;
  void kapanis();
}

// ————————————————————————————————————————————————————————————————— kapanış: kapıya koşar, zıplar, "Bak, artık cesurum!"
async function kapanis() {
  adim = 'kapanis';
  kok.dataset.adim = 'kapanis';
  mesgul = true;
  clearTimeout(bosSayac); clearTimeout(tekrarSayac);
  tepsiGuncelle();
  kinoPoz('kino-sevinc');
  const zp = zipla(110);
  await bekle(200);
  await zipzipKonus('z-yasasin');
  await zp;
  pozKoy('zipzip-zipla', zYer, false);
  efekt('e-zipla', 0.6, 1.1);
  await sek(YER.kapi, 3, 70, 1500);
  await zipla(120);
  pozKoy('zipzip-ayakta-gosteriyor', YER.kapi);
  await bekle(150);
  await zipzipKonus('z-cesur');
  await kinoKonus('k-son', 'kino-sevinc');
  kok.dataset.adim = 'son';
  kok.dataset.durum = 'bitti';
  kok.append(tekrar);
  tekrar.hidden = false;
  if (!sakin) tekrar.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.3,1.3)' });
  // son kare: mini animasyon gibi döngü (bandını gösterir, arada bir zıplar; Kino alkışlar)
  kino.classList.add('dk-alkis');
  const dongu = async () => {
    while (kok.dataset.adim === 'son') {
      await bekle(2300);
      if (kok.dataset.adim !== 'son') return;
      await zipla(80);
      pozKoy('zipzip-ayakta-gosteriyor', YER.kapi);
      if (TEST_MODU) return;
    }
  };
  void dongu();
}

// ————————————————————————————————————————————————————————————————— kurulum
async function kur() {
  kinoIc.append(kinoResim);
  kino.append(kinoIc);
  zipzipIc.append(pozResim, kucukBant, kucukYildiz, dizHedef);
  zipzip.append(zipzipIc);
  kamera.append(fon, kino, zipzip);
  yakin.append(yakinIc);
  yakin.hidden = true;
  yakinKur();
  const karneResim = img('saglik-karnesi');
  karne.append(karneResim, karneIz);
  const kr = resim('saglik-karnesi');
  Object.assign(karne.style, { left: KARNE.x + 'px', top: KARNE.y + 'px', width: KARNE.g + 'px', height: KARNE.g * kr.naturalHeight / Math.max(1, kr.naturalWidth) + 'px' });
  oranaKoy(karneIz, KARNE.damgaYeri[0], KARNE.damgaYeri[1]);
  karneIz.style.width = KARNE.izBoy * 100 + '%';
  karneIz.style.setProperty('--iz', 'url("' + cizimAdresi('yildiz-cikartma') + '")');
  karneIz.hidden = true;
  karne.hidden = true;
  sahne.append(kamera, yakin, karne);
  tepsiKur();
  tepsi.hidden = true;
  secim.hidden = true;
  kok.append(sahne, nabiz, tepsi, secim, geri);
  elKatmaniKur(kok);
  olcekle();
  addEventListener('resize', olcekle);
  kinoPoz('kino-merhaba');
  pozKoy(GIRIS_POZU, YER.giris, false);
  dizHedef.disabled = true;
  kok.dataset.durum = 'hazir';
  kok.dataset.plan = 'oda';
  kok.dataset.adim = 'giris';
  await bekle(450);
  await giris();
}
async function giris() {
  kino.classList.add('dk-el-salla');
  const merhaba = kinoKonus('k-merhaba', 'kino-merhaba');
  await bekle(1100);
  await sek(YER.koltuk, 4, 34, 1700);
  pozKoy('zipzip-korkulu', YER.koltuk);
  zipzip.classList.add('dk-titrek');
  await merhaba;
  kino.classList.remove('dk-el-salla');
  await bekle(200);
  await zipzipKonus('z-giris');
  await bekle(250);
  adimaGec('kalp');
}

// Test ve video kaydı için okuma (oyunun işleyişini değiştirmez): ?test ya da ?kayit ile. Noktalar ekran pikseli.
if (TEST_MODU || new URLSearchParams(location.search).has('kayit')) {
  const nokta = (ad: string): Nokta | null => {
    if (ad === 'kalp' || ad === 'gogus') return pozNoktasi(POZ[poz][ad]);
    if (ad === 'diz') return merkez(dizHedef);
    if (ad === 'yaprak') return yakinNokta(yaprakKutu.x, yaprakKutu.y);
    if (ad === 'sap') return yakinNokta(sap.x, sap.y);
    if (ad === 'cizik') return yakinNokta(cizik.x, cizik.y);
    if (ad === 'camur-sol-ust') return yakinNokta(camur.sol, camur.ust);
    if (ad === 'camur-sag-alt') return yakinNokta(camur.sol + camur.g, camur.ust + camur.y2);
    if (ad === 'damga') return damgaYeri();
    return null;
  };
  (window as unknown as { __doktor: unknown }).__doktor = {
    yas, akis, adim: () => adim, nokta, uc: () => (tutulan && !tutulan.birakti ? tutulan.uc() : null), cizim: (ad: Cizim) => cizimAdresi(ad),
  };
}
