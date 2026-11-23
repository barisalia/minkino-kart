// Türkçe · cila katmanı (yönetici, 22 Kasım gecesi: Top Parkuru'nun his cilası Türkçe'nin açık adımlarına).
// Yalnız kod ve ses; yeni çizim yok. Bütün adımlara tek yerden uygulanır (adımların akışı değişmez):
//  · Parmak değdiği an (0 ms): düğme hafifçe göçüp yaylanır.
//  · Dokunuşun kendi sesi yoksa yumuşak bir "pıt" (çocuk her dokunuşta karşılık duyar).
//  · Doğru sesi çaldığında (birleş, parıltı, mıknatıs): dokunulan yerden altın yıldızlar saçılır, Ceren sevinçle zıplar.
//  · Yanlışta (eski "geri" sesi): ceza tonu yerine yumuşak, komik "boyoyoy"; öğe "boing" diye sallanır, Ceren başını yana eğer.
// Sesler WebAudio'yla o an üretilir (dosya yok, gecikme yok). Hareketler yalnız transform ve opaklık, alttaki dönüşüme eklenir
// (composite: add): öğenin kendi konumu ve CSS hareketleri bozulmaz. Az hareket ayarında yalnız sesler kalır.
import { efektCikisi, sesMotorunuAc } from '../../src/audio/motor';
import { arayuzuKur } from './a2-kareler';
import { cerenTepkisi } from './ceren-tepki';
import './kalite.css';

const azHareket = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** [gecikme, başlangıç Hz, bitiş Hz, süre, şiddet, dalga, titreşim Hz, titreşim derinliği Hz] */
type Nota = [number, number, number, number, number, OscillatorType, number?, number?];
function cal(notalar: Nota[]) {
  const ctx = sesMotorunuAc(), cikis = efektCikisi();
  if (!ctx || !cikis) return;
  for (const [gecikme, frekans, bitis, sure, siddet, tip, titresim, derinlik] of notalar) {
    const ton = ctx.createOscillator(), seviye = ctx.createGain(), bas = ctx.currentTime + gecikme;
    ton.type = tip;
    ton.frequency.setValueAtTime(frekans, bas);
    ton.frequency.exponentialRampToValueAtTime(bitis, bas + sure);
    seviye.gain.setValueAtTime(0.0001, bas);
    seviye.gain.exponentialRampToValueAtTime(siddet, bas + 0.008);
    seviye.gain.exponentialRampToValueAtTime(0.0001, bas + sure);
    let lfo: OscillatorNode | undefined, lfoKazanc: GainNode | undefined;
    if (titresim && derinlik) {
      lfo = ctx.createOscillator();
      lfoKazanc = ctx.createGain();
      lfo.frequency.value = titresim;
      lfoKazanc.gain.value = derinlik;
      lfo.connect(lfoKazanc).connect(ton.frequency);
      lfo.start(bas);
      lfo.stop(bas + sure);
    }
    ton.connect(seviye).connect(cikis);
    ton.onended = () => { ton.disconnect(); seviye.disconnect(); lfo?.disconnect(); lfoKazanc?.disconnect(); };
    ton.start(bas);
    ton.stop(bas + sure);
  }
}

/** Dokunma: kısa, yumuşak, yukarı kalkan "pıt" (her dokunuşta tekrar edilebilecek kadar hafif). */
export const dokunmaSesi = () => cal([[0, 540, 820, 0.06, 0.05, 'sine'], [0, 1600, 1150, 0.022, 0.012, 'triangle']]);
/** Yanlış: yumuşak, komik "boyoyoy" (iner ve titrer); başında küçük bir "pıt". Kızmaz, güldürür. */
export const komikSes = () => cal([
  [0, 980, 620, 0.035, 0.02, 'triangle'],
  [0.02, 560, 240, 0.42, 0.085, 'sine', 15, 38],
  [0.02, 1120, 480, 0.25, 0.012, 'sine', 15, 70],
]);

const htmlMi = (el: Element | undefined): el is HTMLElement => !!el && el instanceof HTMLElement;

/** Basılma: öğe parmağın altında kısa bir an içe göçüp yaylanır (0,22 sn). */
export function dokunmaCanlan(el: Element) {
  if (azHareket() || !htmlMi(el)) return;
  el.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(0.92)', offset: 0.35 }, { transform: 'scale(1.04)', offset: 0.7 }, { transform: 'scale(1)' }],
    { duration: 220, easing: 'ease-out', composite: 'add' },
  );
}
/** Yanlış: öğe "boing" diye ezilip iki yana sallanır (0,48 sn). */
export function komikSalla(el: Element) {
  if (azHareket() || !htmlMi(el)) return;
  el.animate(
    [
      { transform: 'rotate(0deg) scale(1, 1)' },
      { transform: 'rotate(-5deg) scale(1.05, 0.93)', offset: 0.2 },
      { transform: 'rotate(4deg) scale(0.97, 1.03)', offset: 0.45 },
      { transform: 'rotate(-2deg) scale(1, 1)', offset: 0.7 },
      { transform: 'rotate(0deg) scale(1, 1)' },
    ],
    { duration: 480, easing: 'ease-out', composite: 'add' },
  );
}

let stilKondu = false;
function stilKoy() {
  if (stilKondu || typeof document === 'undefined') return;
  stilKondu = true;
  const s = document.createElement('style');
  s.textContent =
    '.alf-cila-parilti{position:fixed;z-index:2147483000;pointer-events:none;font-style:normal;line-height:1;' +
    'font-size:clamp(16px,2.4vmin,30px);color:#ffd24a;text-shadow:0 0 .35em #fff3a0,0 .06em 0 #c4861a;will-change:transform,opacity}' +
    '.alf-cila-parilti.nokta{width:.55em;height:.55em;border-radius:50%;background:#fffbe0;box-shadow:0 0 .5em .12em #ffe27a}' +
    '.alf-cila-toz{position:fixed;z-index:2147483000;pointer-events:none;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0,#f4f1ea 55%,#d9d3c6 100%);box-shadow:0 1px 0 rgba(90,80,60,.25);will-change:transform,opacity}';
  document.head.append(s);
}

/** Doğru: öğenin ortasından dışa saçılan küçük altın yıldız ve pırıltılar (0,6 sn; ekranda iz bırakmaz). */
export function parilti(el: Element, adet = 7) {
  if (azHareket() || !el.isConnected) return;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  // Tanecikler öğenin boyuna göre açılır (küçük karoda dar, büyük kartta geniş).
  pariltiNokta(r.left + r.width / 2, r.top + r.height / 2, adet, Math.min(120, Math.max(46, Math.max(r.width, r.height) * 0.62)));
}
/** Ekranın bir noktasından saçılan pırıltılar (boş dokunuşta küçük, doğruda geniş). */
export function pariltiNokta(x: number, y: number, adet: number, yaricap: number) {
  if (azHareket() || typeof document === 'undefined') return;
  stilKoy();
  const bas = Math.random() * Math.PI * 2;
  for (let i = 0; i < adet; i++) {
    const p = document.createElement('i');
    p.className = 'alf-cila-parilti' + (i % 3 === 2 ? ' nokta' : '');
    p.setAttribute('aria-hidden', 'true');
    p.textContent = i % 3 === 2 ? '' : '★';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.append(p);
    const a = bas + (i / adet) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const d = yaricap * (0.75 + Math.random() * 0.35);
    const dx = Math.cos(a) * d, dy = Math.sin(a) * d;
    const anim = p.animate(
      [
        { transform: 'translate(-50%, -50%) translate(0, 0) scale(0.3) rotate(0deg)', opacity: 1 },
        { transform: 'translate(-50%, -50%) translate(' + dx * 0.7 + 'px, ' + dy * 0.7 + 'px) scale(1.1) rotate(40deg)', opacity: 1, offset: 0.55 },
        { transform: 'translate(-50%, -50%) translate(' + dx + 'px, ' + dy + 'px) scale(0.5) rotate(70deg)', opacity: 0 },
      ],
      { duration: 560 + Math.random() * 120, easing: 'cubic-bezier(.2,.7,.3,1)' },
    );
    anim.onfinish = anim.oncancel = () => p.remove();
  }
}

/** Yanlışta komik "pof": noktadan yumuşak beyaz-gri toz taneleri kabarıp yukarı süzülür (0,7 sn; iz bırakmaz). */
export function tozNokta(x: number, y: number, adet = 7, yaricap = 40) {
  if (azHareket() || typeof document === 'undefined') return;
  stilKoy();
  for (let i = 0; i < adet; i++) {
    const p = document.createElement('i');
    p.className = 'alf-cila-toz';
    p.setAttribute('aria-hidden', 'true');
    p.style.left = x + 'px'; p.style.top = y + 'px';
    const boy = 10 + Math.random() * 14;
    p.style.width = p.style.height = boy + 'px';
    document.body.append(p);
    const a = (i / adet) * Math.PI * 2 + Math.random() * .6, d = yaricap * (.6 + Math.random() * .5);
    const anim = p.animate([
      { transform: 'translate(-50%, -50%) scale(.3)', opacity: .95 },
      { transform: 'translate(-50%, -50%) translate(' + Math.cos(a) * d + 'px, ' + (Math.sin(a) * d * .6 - 8) + 'px) scale(1.15)', opacity: .9, offset: .45 },
      { transform: 'translate(-50%, -50%) translate(' + Math.cos(a) * d * 1.2 + 'px, ' + (Math.sin(a) * d * .6 - 30) + 'px) scale(1.3)', opacity: 0 },
    ], { duration: 650 + Math.random() * 150, easing: 'ease-out' });
    anim.onfinish = anim.oncancel = () => p.remove();
  }
}
/** İki nokta arasında sırayla yanan pırıltı izi (ipucu: Ceren'den doğru harfe "sihirli toz"). */
export function pariltiIzi(x1: number, y1: number, x2: number, y2: number, adim = 7) {
  if (azHareket()) return;
  for (let k = 0; k <= adim; k++) {
    const t = k / adim, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t - Math.sin(t * Math.PI) * 60;
    setTimeout(() => pariltiNokta(x, y, k === adim ? 9 : 2, k === adim ? 56 : 16), k * 75);
  }
}

/** Ekranda görünen Ceren (konusma-dersi.ts → cerenYuzu: .alf-ceren); yoksa undefined. */
function gorunenCeren(): HTMLElement | undefined {
  if (typeof document === 'undefined') return undefined;
  for (const c of document.querySelectorAll<HTMLElement>('.alf-ceren')) {
    const r = c.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight) return c;
  }
  return undefined;
}
let sonCerenTepkisi = 0;
/** Ceren doğruda sevinçle zıplar (0,46 sn); art arda doğrularda en çok 0,6 sn'de bir. */
export function cerenSevinsin() {
  const c = gorunenCeren();
  if (!c || azHareket() || performance.now() - sonCerenTepkisi < 600) return;
  sonCerenTepkisi = performance.now();
  cerenTepkisi(c, 'sevinc', 1100);
  c.animate(
    [
      { transform: 'translateY(0) scale(1, 1)' },
      { transform: 'translateY(2%) scale(1.03, 0.97)', offset: 0.18 },
      { transform: 'translateY(-7%) scale(0.98, 1.03)', offset: 0.5 },
      { transform: 'translateY(0) scale(1.02, 0.98)', offset: 0.8 },
      { transform: 'translateY(0) scale(1, 1)' },
    ],
    { duration: 460, easing: 'ease-out', composite: 'add' },
  );
}
/** Boş dokunuşta Ceren kısa bir kıpırtıyla bakar (0,32 sn; yalnız kendine dönüşüm ekler). */
export function cerenKipirdasin() {
  const c = gorunenCeren();
  if (!c || azHareket() || performance.now() - sonCerenTepkisi < 600) return;
  sonCerenTepkisi = performance.now();
  cerenTepkisi(c, 'el-salla', 900);
  c.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3%)', offset: 0.45 }, { transform: 'translateY(0)' }], { duration: 320, easing: 'ease-out', composite: 'add' });
}
/** Ceren yanlışta kızmaz: başını yana eğip gülümser gibi sallanır (0,56 sn). */
export function cerenEgilsin() {
  const c = gorunenCeren();
  if (!c || azHareket() || performance.now() - sonCerenTepkisi < 600) return;
  sonCerenTepkisi = performance.now();
  cerenTepkisi(c, 'dusunme', 1000);
  c.animate(
    [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-4deg)', offset: 0.3 },
      { transform: 'rotate(3deg)', offset: 0.6 },
      { transform: 'rotate(0deg)' },
    ],
    { duration: 560, easing: 'ease-in-out', composite: 'add' },
  );
}

/** İpucu anı: Ceren gösterir ("isaret" pozu; Paket Harf-A1) ve hafifçe öne eğilir. */
export function cerenGostersin() {
  const c = gorunenCeren();
  if (!c || azHareket() || performance.now() - sonCerenTepkisi < 600) return;
  sonCerenTepkisi = performance.now();
  cerenTepkisi(c, 'isaret', 1300);
  c.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(4%) rotate(2deg)', offset: 0.4 }, { transform: 'translateX(0)' }],
    { duration: 620, easing: 'ease-in-out', composite: 'add' },
  );
}

/**
 * Oyun sonu kutlaması (Hece oyunlarının bitiş ekranı yalnız yazı ve iki düğmeydi): sahnenin üç yerinden sırayla pırıltı
 * patlar, Ceren alkışlar ("alkis" pozu; Paket Harf-A1) ve iki kez sıçrar. Kahramanın kendi sevinci oyunun kodunda.
 */
export function bitisKutla(alan: Element) {
  if (azHareket() || !alan.isConnected) return;
  const r = alan.getBoundingClientRect();
  if (!r.width) return;
  const yaricap = Math.min(150, Math.max(70, Math.min(r.width, r.height) * 0.32));
  [0, 380, 760].forEach((t, i) => setTimeout(() => {
    if (alan.isConnected) pariltiNokta(r.left + r.width * (0.28 + 0.22 * i), r.top + r.height * (i === 1 ? 0.3 : 0.42), 11, yaricap);
  }, t));
  const c = gorunenCeren();
  if (!c) return;
  sonCerenTepkisi = performance.now();
  cerenTepkisi(c, 'alkis', 1900);
  c.animate(
    [{ transform: 'translateY(0)' }, { transform: 'translateY(-9%)', offset: 0.22 }, { transform: 'translateY(0)', offset: 0.45 }, { transform: 'translateY(-6%)', offset: 0.68 }, { transform: 'translateY(0)' }],
    { duration: 900, easing: 'ease-out', composite: 'add' },
  );
}

/** Adımların ipucu sınıfları: biri eklenince Ceren ipucunu gösterir (her adıma tek yerden; adımların kodu değişmez). */
export const IPUCU_SINIFLARI = ['mik-ipucu', 'hk-ipucu', 'salla', 'rb-durt', 'hp-ornek', 'tr-siradaki', 'co-ipucu'];
export function ipucuEklendi(eski: string, yeni: string) {
  const once = new Set(eski.split(/\s+/));
  return yeni.split(/\s+/).some((s) => IPUCU_SINIFLARI.includes(s) && !once.has(s));
}

// ---------------------------------------------------------------- Dokunuş ve efekt sayacı
let efektSayaci = 0, sonDokunulan: Element | undefined, sonDokunma = -Infinity;
let bekleyen: { el: Element; efekt: number } | undefined;
/** Doğru sayılan vuruşlar (oyun-sesi.ts): bunlarda parıltı ve Ceren'in sevinci. */
const DOGRU = new Set(['birles', 'parilti', 'miknatis']);

/**
 * oyun-sesi.ts her vuruştan önce çağırır. Doğruda dokunulan yerde parıltı ve Ceren'in sevinci; yanlışta (geri) komik ses ve
 * sallanma. true dönerse vuruşun kendi sesi çalınmaz (yanlışın eski ceza tonu yerine komik ses çaldı).
 */
export function cilaVurus(ad: string): boolean {
  efektSayaci++;
  const taze = performance.now() - sonDokunma < 900 && sonDokunulan?.isConnected ? sonDokunulan : undefined;
  if (ad === 'geri') {
    komikSes();
    if (taze) komikSalla(taze);
    cerenEgilsin();
    return true;
  }
  if (DOGRU.has(ad)) {
    if (taze) { const el = taze; requestAnimationFrame(() => parilti(el)); }
    if (ad !== 'miknatis') cerenSevinsin();
  }
  return false;
}

/** Dokunulabilir öğe: etkin düğme, role="button" ya da tabindex'li dokunma alanı (Resimde Bul'un nesneleri gibi). */
function dokunulan(hedef: EventTarget | null): Element | undefined {
  if (!(hedef instanceof Element)) return undefined;
  const el = hedef.closest('button, [role="button"], a[href]');
  if (!el || (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return undefined;
  return el;
}

/** Bir kez kurulur: bütün Türkçe sayfalarında dokunuşları dinler (adımların kendi işleyicilerinden önce ve sonra). */
export function cilaKur(kok: Document | HTMLElement = document) {
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver((kayitlar) => {
      for (const k of kayitlar) {
        const el = k.target as Element;
        if (el.getAttribute && ipucuEklendi(k.oldValue ?? '', el.getAttribute('class') ?? '')) { cerenGostersin(); return; }
      }
    }).observe(kok instanceof Document ? kok.documentElement : kok, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  }
  kok.addEventListener('pointerdown', (e) => {
    const pe = e as PointerEvent;
    if (!pe.isPrimary) return;
    const el = dokunulan(pe.target);
    sonDokunma = performance.now();
    sonDokunulan = el ?? (pe.target instanceof Element ? pe.target : undefined);
    if (!el) { bosDokunus(pe); return; }
    bekleyen = { el, efekt: efektSayaci };
    // Ekranı kaplayan büyük düğmeler (sahne, kart alanı) göçmez; yalnız parmak boyu öğeler.
    const r = el.getBoundingClientRect();
    if (r.width < innerWidth * 0.4 && r.height < innerHeight * 0.5) dokunmaCanlan(el);
  }, { capture: true });
  // İşleyiciler çalıştıktan sonra: dokunuş kendi sesini çalmadıysa yumuşak "pıt".
  kok.addEventListener('click', (e) => {
    const b = bekleyen;
    bekleyen = undefined;
    if (!b || !(e.target instanceof Node) || !b.el.contains(e.target)) return;
    if (efektSayaci === b.efekt) dokunmaSesi();
  });
}

/**
 * Boş yere dokunuş karşılıksız kalmaz (kalite denetimi 22 Kasım, kural 5): parmağın altında küçük bir parıltı, yumuşak
 * "pıt" ve Ceren'den kısa bir kıpırtı. Çizim yüzeyleri (yazma, boyama, Resimde Bul'un resmi: svg, canvas) ve kendi
 * karşılığı olan alanlar ([data-cila-yok]) hariç.
 */
function bosDokunus(e: PointerEvent) {
  const t = e.target instanceof Element ? e.target : undefined;
  if (!t || t.closest('svg, canvas, input, textarea, [data-cila-yok]')) return;
  pariltiNokta(e.clientX, e.clientY, 4, 34);
  dokunmaSesi();
  cerenKipirdasin();
}

let kuruldu = false;
/** oyun-sesi.ts yüklenince bir kez kurulur (Türkçe'nin her sayfası onu kullanır). */
export function cilaKendiliginden() {
  if (kuruldu || typeof document === 'undefined' || typeof window === 'undefined') return;
  kuruldu = true;
  cilaKur(document);
  arayuzuKur(); // Paket Harf-A2: gelen arayüz parçaları (a2-kareler.ts)
}
