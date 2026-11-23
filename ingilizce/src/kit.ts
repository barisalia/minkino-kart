/**
 * Arayüz takımı: karakterler (Ceren, Polly, Kino), kelime resmi ve bandı, düğmeler, kutlama, ipucu eli.
 * Karakter ve nesne çizimleri Astra'nındır (assets/ingilizce, assets/alfabe); burada yalnız yerleştirilir ve oynatılır.
 * Kartlar, bantlar, düğme zeminleri ve ilerleme noktaları kodla çizilir (KULLANICI-KURALLARI · 16 Kasım 2026).
 */
import { h, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import type { Kelime } from './icerik';
import type { Kim } from './ses';
import { efektCal, tik } from './ses';
import { cerenKonusma, kareler, kelimeKareleri, kelimeResmiAdresi, resim, sesAdresi } from './varlik';

const azHareket = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));
const rastgele = (a: number, b: number) => a + Math.random() * (b - a);

/** Uygulamanın kök öğesi (üst katman parçaları buraya eklenir) */
export const kok = (): HTMLElement => document.querySelector<HTMLElement>('.ing')!;

// ---------------------------------------------------------------- karakterler

const HAREKET_SETLERI: Record<Kim, string[]> = {
  ceren: ['selam', 'alkis', 'dinle'],
  polly: ['selam', 'sevin', 'saskin', 'durbun', 'dinle', 'posta', 'sarki'],
  kino: ['kart', 'sevin', 'hata'],
};

function konusmaKareleri(kim: Kim): string[] {
  if (kim === 'ceren') return cerenKonusma();
  if (kim === 'polly') return kareler('kisi/polly-konus');
  return kareler('kisi/kino');
}

/**
 * Karakter: konuşma kareleri üst üste durur, ses çalarken ağız karesi değişir (ses.ts → agizAyarla).
 * Çizimi gelmiş hareket setleri (el sallama, sevinme …) de aynı kutuda gizli bekler.
 */
export function kisi(kim: Kim, sinif = ''): HTMLElement {
  const konus = konusmaKareleri(kim);
  const el = h('span.ing-kisi', { 'data-kim': kim, 'data-agiz': '0', 'data-agiz-sayisi': konus.length || 1, role: 'img', 'aria-label': kim === 'ceren' ? 'Ceren Öğretmen' : kim === 'polly' ? 'Polly' : 'Kino' });
  el.classList.add(`ing-${kim}`);
  if (sinif) el.classList.add(...sinif.split(' ').filter(Boolean));
  konus.forEach((src, i) => el.append(h('img', { src, alt: '', draggable: 'false', 'data-kare': `konus-${i}`, hidden: i > 0 })));
  for (const set of HAREKET_SETLERI[kim]) {
    kareler(`kisi/${kim}-${set}`).forEach((src, i) => el.append(h('img', { src, alt: '', draggable: 'false', 'data-kare': `${set}-${i}`, hidden: true })));
  }
  if (kim === 'ceren') {
    const kapali = resim('kisi/ceren-goz-kapali');
    if (kapali) { el.append(h('img', { src: kapali, alt: '', draggable: 'false', 'data-kare': 'goz', hidden: true })); gozKirp(el); }
  }
  return el;
}

/** Sakin duruşta arada bir göz kırpma (çizimi geldiyse) */
function gozKirp(el: HTMLElement) {
  if (azHareket() || TEST_MODU) return;
  const kur = () => window.setTimeout(() => {
    if (!el.isConnected) return;
    const goz = el.querySelector<HTMLImageElement>('img[data-kare="goz"]');
    const dinlenme = el.querySelector<HTMLImageElement>('img[data-kare="konus-0"]');
    if (goz && dinlenme && !dinlenme.hidden && !el.dataset.hareket) {
      goz.hidden = false; dinlenme.hidden = true;
      window.setTimeout(() => { if (!el.dataset.hareket && el.dataset.agiz === '0') dinlenme.hidden = false; goz.hidden = true; }, 130);
    }
    kur();
  }, rastgele(2600, 5200));
  // karakter sayfaya eklendikten sonra başlasın
  window.setTimeout(kur, 0);
}

/**
 * Karaktere bir hareket yaptırır (el sallama, sevinme, şaşırma …). Çizilmiş kareler varsa saniyede 8 pozla oynar;
 * yoksa aynı anlamı taşıyan küçük bir gövde hareketi yapılır. Bittikten sonra dinlenme karesine döner.
 */
export function hareket(kim: Kim, set: string, tur = 1): Promise<void> {
  const hedefler = [...document.querySelectorAll<HTMLElement>(`.ing-kisi[data-kim="${kim}"]`)];
  if (!hedefler.length || azHareket()) return Promise.resolve();
  return Promise.all(hedefler.map((el) => tekHareket(el, set, tur))).then(() => undefined);
}

async function tekHareket(el: HTMLElement, set: string, tur: number): Promise<void> {
  const cerceveler = [...el.querySelectorAll<HTMLImageElement>(`img[data-kare^="${set}-"]`)];
  if (!cerceveler.length) {
    el.classList.remove('ing-h-zipla'); void el.offsetWidth; el.classList.add('ing-h-zipla');
    await bekle(620);
    el.classList.remove('ing-h-zipla');
    return;
  }
  const no = String(Date.now() + Math.random());
  el.dataset.hareket = no;
  const hepsi = [...el.querySelectorAll<HTMLImageElement>('img')];
  for (let t = 0; t < tur; t++) {
    for (const c of cerceveler) {
      if (el.dataset.hareket !== no || !el.isConnected) return;
      hepsi.forEach((img) => { img.hidden = img !== c; });
      await bekle(125);
    }
  }
  if (el.dataset.hareket !== no) return;
  delete el.dataset.hareket;
  el.dataset.agiz = '0';
  hepsi.forEach((img) => { img.hidden = img.dataset.kare !== 'konus-0'; });
}

// ---------------------------------------------------------------- kelime resmi ve bandı

/**
 * Kelimenin resmi. Zıplama kareleri çizilmiş kelimelerde (çiftlik hayvanları) ilk kare gösterilir ki zıplarken
 * çizim yer değiştirmesin. Çizimi gelmemiş kelime taslak görünümünde yer tutucuyla durur.
 */
export function kelimeResmi(w: Kelime, sinif = ''): HTMLElement {
  const el = h('span.ing-resim', { 'data-kelime': w.id });
  if (sinif) el.classList.add(...sinif.split(' ').filter(Boolean));
  const zip = kelimeKareleri(w);
  const adres = zip[0] ?? kelimeResmiAdresi(w);
  if (adres) el.append(h('img', { src: adres, alt: '', draggable: 'false' }));
  else el.append(h('span.ing-yer-tutucu', {}, w.tr));
  return el;
}

/** Çıkartma ve albüm için kelimenin duran resmi (kadrajı dolduran çizim) */
export function cikartmaResmi(w: Kelime, sinif = ''): HTMLElement {
  const el = h('span.ing-resim', { 'data-kelime': w.id });
  if (sinif) el.classList.add(...sinif.split(' ').filter(Boolean));
  const adres = kelimeResmiAdresi(w);
  if (adres) el.append(h('img', { src: adres, alt: '', draggable: 'false' }));
  else el.append(h('span.ing-yer-tutucu', {}, w.tr));
  return el;
}

/** Resmi bir kez zıplatır: çizilmiş kareler varsa onlarla, yoksa yaylanma hareketiyle */
export async function ziplat(el: HTMLElement | null, w?: Kelime): Promise<void> {
  if (!el?.isConnected) return;
  const img = el.querySelector<HTMLImageElement>('img');
  const zip = w ? kelimeKareleri(w) : [];
  el.classList.remove('ing-zipla'); void el.offsetWidth; el.classList.add('ing-zipla');
  if (img && zip.length === 4 && !azHareket()) {
    for (const k of [zip[1], zip[2], zip[3], zip[0]]) {
      if (!el.isConnected) return;
      img.src = k;
      await bekle(120);
    }
  } else await bekle(480);
  el.classList.remove('ing-zipla');
}

/**
 * Çizilmiş zıplama kareleri (kelime/<ad>-z0…z3; Astra Paket 38: bütün hayvanlar). Duran resmin (çıkartma resmi) üstünde bir
 * kez oynar: toplanma, havada, iniş; bitince resim eski hâline döner. Kareler duran resimle aynı tuvalde çizilmişse oynar
 * (eski altı hayvanın küçük tuvalli kareleri resmi kaydırırdı; onlar yeniden çizilene dek atlanır). Öğenin kendi CSS
 * hareketine (yukarı sıçrama) dokunmaz: ikisi birlikte çalışır.
 */
const kareUygun = new Map<string, boolean>();
const kareOran = new Map<string, number>();
/** Kareleri önceden indirir ve tuval oranlarını ölçer (ilk zıplamada takılma olmasın) */
export function kareleriHazirla(kelimeler: readonly Kelime[]) {
  for (const w of kelimeler) {
    for (const adres of [kelimeResmiAdresi(w), ...kelimeKareleri(w)]) {
      if (!adres || kareOran.has(adres)) continue;
      kareOran.set(adres, 0);
      const i = new Image();
      i.decoding = 'async';
      i.onload = () => kareOran.set(adres, i.naturalWidth / Math.max(1, i.naturalHeight));
      i.src = adres;
    }
  }
}
function kareleriUygunMu(w: Kelime): boolean {
  const onceki = kareUygun.get(w.id);
  if (onceki !== undefined) return onceki;
  const zip = kelimeKareleri(w), duran = kelimeResmiAdresi(w);
  if (zip.length !== 4 || !duran) { kareUygun.set(w.id, false); return false; }
  const oranlar = [duran, ...zip].map((a) => kareOran.get(a) ?? 0);
  // ölçüler henüz gelmediyse bu sefer oynama (sonraki dokunuşta yeniden bakılır)
  if (oranlar.some((o) => !o)) { kareleriHazirla([w]); return false; }
  const uygun = oranlar.every((o) => Math.abs(o - oranlar[0]) < 0.01);
  kareUygun.set(w.id, uygun);
  return uygun;
}
/**
 * Hayvanın kendi sesi (assets/ingilizce/ses/efekt/<ad>.mp3; 23 Kasım 2026'dan beri yüz hayvanın hepsinde): dosyası varsa kimliği.
 * Ses çıkarmayan hayvanlarda (balık, kelebek, salyangoz…) çizgi film hareket sesidir.
 */
export const hayvanSesi = (w: Kelime): string | null => (sesAdresi(`efekt/${w.id}`) ? `efekt/${w.id}` : null);
/** Hayvan sesi ve ardından adı: dokunulan hayvan önce kendi sesini çıkarır (kısa), sonra Polly adını söyler */
export async function sesVeAd(w: Kelime, soyle: (...idler: string[]) => Promise<boolean>, ...sonra: string[]): Promise<boolean> {
  const e = hayvanSesi(w);
  if (e) await Promise.race([efektCal(e), bekle(1100)]);
  return soyle(...sonra);
}

export async function kareZipla(el: HTMLElement | null, w: Kelime | undefined): Promise<void> {
  const img = el?.querySelector<HTMLImageElement>('img');
  if (!img || !w || azHareket() || !kareleriUygunMu(w)) return;
  const zip = kelimeKareleri(w);
  const duran = img.dataset.duran ?? img.src;
  img.dataset.duran = duran;
  const no = String(Number(img.dataset.zipNo ?? 0) + 1);
  img.dataset.zipNo = no;
  for (const k of [zip[1], zip[2], zip[3]]) {
    if (!img.isConnected || img.dataset.zipNo !== no) return;
    img.src = k;
    await bekle(120);
  }
  if (img.isConnected && img.dataset.zipNo === no) img.src = duran;
}

/** Kelime bandı: büyük İngilizce (harfler ayrı ayrı, söylenirken sırayla yanar) + küçük Türkçe */
export function kelimeBandi(w: Kelime, sinif = ''): HTMLElement {
  const en = h('strong', { lang: 'en-US' });
  for (const harf of w.en) en.append(harf === ' ' ? h('span.ing-bosluk', {}, ' ') : h('span', {}, harf));
  const el = h('div.ing-bant', { 'data-kelime': w.id }, en, h('small', { lang: 'tr' }, w.tr));
  if (sinif) el.classList.add(...sinif.split(' ').filter(Boolean));
  return el;
}

/** Bandın harflerini süre boyunca soldan sağa yakar (kelime söylenirken) */
export function harfleriYak(bant: HTMLElement | null, sureMs: number) {
  if (!bant) return;
  const harfler = [...bant.querySelectorAll<HTMLElement>('strong > span:not(.ing-bosluk)')];
  harfler.forEach((s) => s.classList.remove('ing-yandi'));
  const adim = (TEST_MODU ? 5 : sureMs) / Math.max(1, harfler.length);
  harfler.forEach((s, i) => window.setTimeout(() => { if (s.isConnected) s.classList.add('ing-yandi'); }, i * adim));
}

// ---------------------------------------------------------------- düğmeler

/** Yuvarlak simge düğmesi (zemin kodla, simge ortak Minkino simgesi) */
export function simgeDugme(simge: keyof typeof IKON, etiket: string, tikla: () => void, sinif = ''): HTMLButtonElement {
  const b = h('button.ing-simge', { type: 'button', 'aria-label': etiket, html: IKON[simge] });
  if (sinif) b.classList.add(...sinif.split(' ').filter(Boolean));
  b.addEventListener('click', () => { tik.dokun(); tikla(); });
  return b;
}

/** Resimli düğme: içine çizim ve / veya yazı girer */
export function dugme(sinif: string, etiket: string, tikla: () => void, ...icerik: (Node | string | null | undefined)[]): HTMLButtonElement {
  const b = h('button', { type: 'button', 'aria-label': etiket });
  b.className = sinif;
  for (const c of icerik) if (c) b.append(c);
  b.addEventListener('click', tikla);
  return b;
}

export const cizim = (yol: string, sinif = ''): HTMLImageElement | null => {
  const adres = resim(yol);
  if (!adres) return null;
  const img = h('img', { src: adres, alt: '', draggable: 'false' });
  if (sinif) img.className = sinif;
  return img;
};

/** Adım ilerleme noktaları */
export function noktalar(toplam: number, dolu: number): HTMLElement {
  const el = h('span.ing-noktalar', { 'aria-label': `${dolu + 1}. adım, toplam ${toplam}` });
  for (let i = 0; i < toplam; i++) el.append(h(i < dolu ? 'i.ing-dolu' : i === dolu ? 'i.ing-simdi' : 'i'));
  return el;
}

/** Yıldız sırası (kazanılanlar dolu) */
export function yildizlar(kazanilan: number, toplam = 3, sinif = ''): HTMLElement {
  const el = h('span.ing-yildizlar', { 'aria-label': `${kazanilan} yıldız` });
  if (sinif) el.classList.add(...sinif.split(' ').filter(Boolean));
  const adres = resim('ui/yildiz');
  for (let i = 0; i < toplam; i++) {
    const y = adres ? h('img', { src: adres, alt: '', draggable: 'false' }) : h('span', { html: IKON.yildiz });
    y.classList.add(i < kazanilan ? 'ing-dolu' : 'ing-bos');
    (y as HTMLElement).style.setProperty('--n', String(i));
    el.append(y);
  }
  return el;
}

// ---------------------------------------------------------------- kutlama, uçuş, ipucu

function ustParca(src: string, sinif: string): HTMLImageElement {
  const img = h('img', { src, alt: '', 'aria-hidden': 'true', draggable: 'false' });
  img.className = sinif;
  kok().append(img);
  return img;
}

/** Doğru cevapta: verilen öğenin (ya da noktanın) çevresine yıldız saçılır */
export function kutla(hedef?: Element | { x: number; y: number } | null) {
  tik.dogru();
  // doğru cevaba anında karakter tepkisi (Barış'ın "tak tak" kuralı, 22 Kasım): Polly her seferinde sevinir; adımın
  // kendi hareket çağrısı varsa o bunun yerine geçer (hareket() yenisini oynatır)
  void hareket('polly', 'sevin');
  const yildiz = resim('ui/yildiz');
  const zemin = kok();
  if (!yildiz || !zemin || azHareket()) return;
  const s = zemin.getBoundingClientRect();
  let x = s.width / 2, y = s.height / 2;
  if (hedef instanceof Element) { const r = hedef.getBoundingClientRect(); x = r.left + r.width / 2 - s.left; y = r.top + r.height / 2 - s.top; }
  else if (hedef) { x = hedef.x; y = hedef.y; }
  const adet = 10;
  for (let i = 0; i < adet; i++) {
    const p = ustParca(yildiz, 'ing-parca');
    const boy = s.width * rastgele(0.022, 0.04), aci = (i / adet) * Math.PI * 2 + rastgele(-0.3, 0.3), uzak = s.width * rastgele(0.06, 0.13);
    const dx = Math.cos(aci) * uzak, dy = Math.sin(aci) * uzak - s.height * 0.03;
    p.style.cssText = `left:${x}px;top:${y}px;width:${boy}px;height:${boy}px`;
    p.animate([
      { transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1.1) rotate(${rastgele(-140, 140)}deg)`, opacity: 1, offset: 0.6 },
      { transform: `translate(calc(-50% + ${dx * 1.1}px),calc(-50% + ${dy * 1.1 + s.height * 0.05}px)) scale(.5) rotate(${rastgele(-220, 220)}deg)`, opacity: 0 },
    ], { duration: rastgele(700, 1000), easing: 'cubic-bezier(.15,.8,.3,1)' }).onfinish = () => p.remove();
  }
}

/** Ders ve ünite sonunda: yukarıdan yıldız yağar */
export function yildizYagmuru() {
  tik.konfeti();
  const yildiz = resim('ui/yildiz');
  const zemin = kok();
  if (!yildiz || !zemin || azHareket() || TEST_MODU) return;
  const s = zemin.getBoundingClientRect();
  for (let i = 0; i < 26; i++) {
    const p = ustParca(yildiz, 'ing-parca');
    const boy = s.width * rastgele(0.025, 0.05);
    p.style.cssText = `left:${rastgele(3, 97)}%;top:0;width:${boy}px;height:${boy}px`;
    p.animate([
      { transform: 'translate(-50%,-120%) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${rastgele(-60, 60)}px),${s.height * 0.86}px) rotate(${rastgele(-360, 360)}deg)`, opacity: 1, offset: 0.85 },
      { transform: `translate(-50%,${s.height * 1.05}px) rotate(${rastgele(-400, 400)}deg)`, opacity: 0 },
    ], { duration: rastgele(1500, 2500), delay: rastgele(0, 800), easing: 'cubic-bezier(.3,.1,.7,1)', fill: 'backwards' }).onfinish = () => p.remove();
  }
}

/** Bir resmi bir yerden başka bir öğenin üstüne uçurur (çıkartma albüme, kart Obur'a). Bitince çözülür. */
export function ucur(kaynak: Element, hedef: Element, o: { sure?: number; kucul?: number } = {}): Promise<void> {
  const zemin = kok();
  const img = kaynak.querySelector('img') ?? (kaynak instanceof HTMLImageElement ? kaynak : null);
  if (!zemin || !img || !hedef.isConnected || azHareket() || TEST_MODU) return Promise.resolve();
  const s = zemin.getBoundingClientRect(), a = kaynak.getBoundingClientRect(), b = hedef.getBoundingClientRect();
  const ucan = ustParca(img.src, 'ing-ucan');
  ucan.style.cssText = `left:${a.left - s.left}px;top:${a.top - s.top}px;width:${a.width}px;height:${a.height}px`;
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const olcek = o.kucul ?? Math.max(0.15, Math.min(1, b.width / Math.max(1, a.width)));
  tik.ucus();
  return new Promise((coz) => {
    ucan.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - s.height * 0.14}px) scale(${(1 + olcek) / 2 + 0.12})`, offset: 0.5 },
      { transform: `translate(${dx}px,${dy}px) scale(${olcek})` },
    ], { duration: o.sure ?? 700, easing: 'cubic-bezier(.4,0,.3,1)' }).onfinish = () => { ucan.remove(); coz(); };
  });
}

let ipucuZamani = 0, el: HTMLImageElement | null = null, hedefBul: (() => Element | null | undefined) | undefined;
function ipucuGoster() {
  ipucuKaldir();
  const hedef = hedefBul?.();
  const adres = resim('ui/el');
  const zemin = kok();
  if (!hedef?.isConnected || !adres || !zemin) return;
  if (document.documentElement.dataset.konusan) { ipucuZamani = window.setTimeout(ipucuGoster, 1500); return; }
  const s = zemin.getBoundingClientRect(), r = hedef.getBoundingClientRect();
  const gen = Math.min(s.width * 0.06, s.height * 0.11);
  el = ustParca(adres, 'ing-el');
  // parmak ucu çizimin üst-sol üçte birinde: hedefin ortasına gelsin
  el.style.cssText = `left:${r.left - s.left + r.width / 2 - gen * 0.38}px;top:${r.top - s.top + r.height * 0.55 - gen * 0.3}px;width:${gen}px`;
}
export function ipucuKaldir() { el?.remove(); el = null; }

/** Çocuk bir süre dokunmazsa ipucu eli sıradaki dokunulacak yeri gösterir. Her dokunuşta süre yeniden başlar. */
export function ipucuKur(bul: (() => Element | null | undefined) | undefined, ms = 6500) {
  hedefBul = bul;
  clearTimeout(ipucuZamani);
  ipucuKaldir();
  if (bul && !TEST_MODU) ipucuZamani = window.setTimeout(ipucuGoster, ms);
}
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', () => { if (hedefBul) ipucuKur(hedefBul); }, true);
}

/** Yanlış seçimde öğeyi hafifçe sallar (ceza değil, "bir daha bak") */
export function salla(elm: Element) {
  elm.classList.remove('ing-salla');
  void (elm as HTMLElement).offsetWidth;
  elm.classList.add('ing-salla');
  tik.yanlis();
  // yanlışa ceza yok, komik karşılık: kart jöle gibi esner ("boing"), Polly şaşkın bakar
  void hareket('polly', 'saskin');
}

/** Karakteri belli bir karede tutar (ör. Ceren dinlerken el kulakta). Çizimi yoksa yalnız sınıf eklenir. */
export function pozTut(kim: Kim, kare: string) {
  for (const elm of document.querySelectorAll<HTMLElement>(`.ing-kisi[data-kim="${kim}"]`)) {
    elm.classList.add(`ing-poz-${kare.replace(/-\d+$/, '')}`);
    const hedef = elm.querySelector<HTMLImageElement>(`img[data-kare="${kare}"]`);
    if (!hedef) continue;
    elm.dataset.hareket = 'tut';
    elm.querySelectorAll<HTMLImageElement>('img').forEach((img) => { img.hidden = img !== hedef; });
  }
}

export function pozBirak(kim: Kim) {
  for (const elm of document.querySelectorAll<HTMLElement>(`.ing-kisi[data-kim="${kim}"]`)) {
    for (const s of [...elm.classList]) if (s.startsWith('ing-poz-')) elm.classList.remove(s);
    if (elm.dataset.hareket !== 'tut') continue;
    delete elm.dataset.hareket;
    elm.dataset.agiz = '0';
    elm.querySelectorAll<HTMLImageElement>('img').forEach((img) => { img.hidden = img.dataset.kare !== 'konus-0'; });
  }
}
