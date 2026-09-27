import { bekle, sure, TEST_MODU } from './dom';

export function merkez(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
}

/** Bir sınıfı ekleyip animasyon bitince kaldırır. */
export async function sinifOynat(el: HTMLElement, sinif: string, ms = 600) {
  el.classList.remove(sinif);
  void el.offsetWidth;
  el.classList.add(sinif);
  await bekle(sure(ms));
  el.classList.remove(sinif);
}

/**
 * `klon` elemanını `kaynak` konumundan `hedef` elemanın merkezine kavisli bir yolla uçurur.
 * `sonOlcek`: hedefe varınca boyut oranı.
 */
export async function ucur(kok: HTMLElement, klon: HTMLElement, kaynak: Element, hedef: Element, sonOlcek = 0.25, ms = 750) {
  const a = kaynak.getBoundingClientRect();
  const b = merkez(hedef);
  klon.classList.add('ucan-kart');
  Object.assign(klon.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px` });
  klon.style.setProperty('--kw', `${a.width}px`);
  kok.append(klon);
  if (TEST_MODU) {
    klon.remove();
    return;
  }
  const dx = b.x - (a.left + a.width / 2);
  const dy = b.y - (a.top + a.height / 2);
  const yukari = Math.min(-80, dy * 0.3 - 120);
  const anim = klon.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0deg)', offset: 0 },
      { transform: `translate(${dx * 0.35}px, ${yukari}px) scale(${(1 + sonOlcek) * 0.62}) rotate(-12deg)`, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${sonOlcek}) rotate(8deg)`, offset: 1 },
    ],
    { duration: ms, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' },
  );
  await anim.finished.catch(() => undefined);
  klon.remove();
}

/** Elemanı başlangıç konumuna geri yumuşakça kaydırır. */
export async function geriKaydir(el: HTMLElement, dx: number, dy: number, ms = 350) {
  if (TEST_MODU) return;
  await el
    .animate([{ transform: `translate(${dx}px, ${dy}px) scale(1.05)` }, { transform: 'translate(0,0) scale(1)' }], {
      duration: ms,
      easing: 'cubic-bezier(.3,1.4,.5,1)',
    })
    .finished.catch(() => undefined);
}

/**
 * n adet kartı (oran: yükseklik/genişlik) kutuya en büyük boyutla sığdıracak sütun sayısı ve kart genişliği.
 */
export function sigdir(W: number, H: number, n: number, oran = 1.12, bosluk = 14, enBuyuk = 260, izinli?: number[]): { kolon: number; kw: number } {
  let en = { kolon: 1, kw: 0 };
  for (let kolon = 1; kolon <= n; kolon++) {
    if (izinli && !izinli.includes(kolon)) continue;
    const satir = Math.ceil(n / kolon);
    const kwW = (W - bosluk * (kolon - 1)) / kolon;
    const kwH = (H - bosluk * (satir - 1)) / satir / oran;
    const kw = Math.min(kwW, kwH, enBuyuk);
    if (kw > en.kw + 0.5) en = { kolon, kw };
  }
  en.kw = Math.max(40, Math.floor(en.kw));
  return en;
}

// ---------------------------------------------------------------- Kartlar cilası (yalnız transform / opacity)

/** Kullanıcı az hareket istiyor mu (işletim sistemi ayarı). */
export function azHareket(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Tam animasyon oynatılabilir mi (test modunda ve az harekette hayır). */
const tamHareket = () => !TEST_MODU && !azHareket();

type Nokta = { x: number; y: number };
const yumusak = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t); // sinüs gir-çık
const cikis = (t: number) => 1 - Math.pow(1 - t, 3); // hızlı başla, yavaş kon

/** Kübik Bézier üzerinde nokta. */
function bezier(p0: Nokta, p1: Nokta, p2: Nokta, p3: Nokta, t: number): Nokta {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

const IZ_RENK = ['#FFC72C', '#FFFFFF', '#FF7EB6', '#8FD3FF', '#FFE27A'];

/** Ekranda bir noktada küçük yıldız parıltısı (uçuş izi, patlama). */
function yildizcik(kok: HTMLElement, x: number, y: number, gecikme: number, sec: { boy?: number; dx?: number; dy?: number; renk?: string; ms?: number } = {}) {
  const boy = sec.boy ?? 14 + Math.random() * 10;
  const el = document.createElement('i');
  el.className = 'iz-yildiz';
  el.style.cssText = `left:${x}px;top:${y}px;width:${boy}px;height:${boy}px;margin:${-boy / 2}px 0 0 ${-boy / 2}px;color:${sec.renk ?? IZ_RENK[Math.floor(Math.random() * IZ_RENK.length)]}`;
  kok.append(el);
  const dx = sec.dx ?? (Math.random() - 0.5) * 18;
  const dy = sec.dy ?? 10 + Math.random() * 14;
  const don = (Math.random() - 0.5) * 160;
  const a = el.animate(
    [
      { transform: 'translate(0,0) scale(0) rotate(0deg)', opacity: 0 },
      { transform: `translate(${dx * 0.3}px,${dy * 0.2}px) scale(1.15) rotate(${don * 0.4}deg)`, opacity: 1, offset: 0.25 },
      { transform: `translate(${dx}px,${dy}px) scale(0) rotate(${don}deg)`, opacity: 0 },
    ],
    { duration: sec.ms ?? 620, delay: gecikme, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' },
  );
  a.finished.then(() => el.remove(), () => el.remove());
}

/** (x, y) çevresine dağılan yıldız parıltısı (doğru kart, eşleşme, albüme yapışma). */
export function parlat(kok: HTMLElement, x: number, y: number, adet = 10, yaricap = 70) {
  if (!tamHareket()) return;
  for (let i = 0; i < adet; i++) {
    const a = (Math.PI * 2 * i) / adet + Math.random() * 0.5;
    const r = yaricap * (0.7 + Math.random() * 0.5);
    yildizcik(kok, x, y, Math.random() * 60, { dx: Math.cos(a) * r, dy: Math.sin(a) * r, boy: 12 + Math.random() * 12, ms: 560 + Math.random() * 200 });
  }
}

/**
 * Kartı `kaynak`tan `hedef`e kavisli bir yolla uçurur: önce hafifçe geri-yukarı kalkar (hazırlık), dönerek süzülür,
 * hedefin biraz üstünden içine iner. `iz`: arkasında yıldız parıltısı bırakır.
 */
export async function ucurKavis(kok: HTMLElement, klon: HTMLElement, kaynak: Element, hedef: Element, sec: { sonOlcek?: number; ms?: number; iz?: boolean; gecikme?: number } = {}) {
  const a = kaynak.getBoundingClientRect();
  const b = merkez(hedef);
  const ms = sec.ms ?? 900;
  const son = sec.sonOlcek ?? 0.3;
  klon.classList.add('ucan-kart');
  Object.assign(klon.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px` });
  klon.style.setProperty('--kw', `${a.width}px`);
  if (TEST_MODU) return;
  kok.append(klon);
  if (azHareket()) {
    await klon.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, delay: sec.gecikme ?? 0, fill: 'both' }).finished.catch(() => undefined);
    klon.remove();
    return;
  }
  const s = { x: a.left + a.width / 2, y: a.top + a.height / 2 };
  const e = { x: b.x - s.x, y: b.y - s.y };
  const uzak = Math.hypot(e.x, e.y);
  const yon = e.x >= 0 ? 1 : -1;
  const p0 = { x: 0, y: 0 };
  const p1 = { x: -yon * Math.min(90, uzak * 0.18), y: -Math.min(160, 60 + uzak * 0.2) };
  const p2 = { x: e.x * 0.75, y: e.y - Math.min(140, 50 + uzak * 0.18) };
  const N = 30;
  const kareler: Keyframe[] = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const u = yumusak(t);
    const p = bezier(p0, p1, p2, e, u);
    // büyüklük: kalkışta öne gelir (1.15), yolda küçülür
    const olcek = t < 0.15 ? 1 + 0.15 * Math.sin((t / 0.15) * (Math.PI / 2)) : 1.15 + (son - 1.15) * yumusak((t - 0.15) / 0.85);
    // dönüş: hazırlıkta ters yöne, sonra bir tam tur ve hafif sallanarak konar
    const don = t < 0.15 ? -10 * yon * (t / 0.15) : -10 * yon + (370 * yon) * yumusak((t - 0.15) / 0.85);
    kareler.push({ transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${don.toFixed(1)}deg) scale(${olcek.toFixed(3)})`, offset: t });
  }
  const gecikme = sec.gecikme ?? 0;
  const anim = klon.animate(kareler, { duration: ms, delay: gecikme, easing: 'linear', fill: 'both' });
  if (sec.iz) {
    for (let k = 1; k <= 12; k++) {
      const t = 0.12 + (k / 12) * 0.8;
      const p = bezier(p0, p1, p2, e, yumusak(t));
      yildizcik(kok, s.x + p.x + (Math.random() - 0.5) * a.width * 0.3, s.y + p.y + (Math.random() - 0.5) * a.width * 0.3, gecikme + t * ms, {});
    }
  }
  await anim.finished.catch(() => undefined);
  klon.remove();
}

/** Albüm düğmesi gibi bir hedefe "yapışma": ezilip esner, halka yayılır, yıldızlar saçılır. */
export function yapisEsne(el: HTMLElement, kok?: HTMLElement) {
  if (!tamHareket()) return;
  el.animate(
    [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.32, 0.72) translateY(4px)', offset: 0.16 },
      { transform: 'scale(0.84, 1.2) translateY(-6px)', offset: 0.38 },
      { transform: 'scale(1.09, 0.93)', offset: 0.6 },
      { transform: 'scale(0.97, 1.03)', offset: 0.8 },
      { transform: 'scale(1, 1)' },
    ],
    { duration: 680, easing: 'ease-out' },
  );
  if (!kok) return;
  const m = merkez(el);
  const halka = document.createElement('i');
  halka.className = 'yapis-halka';
  halka.style.cssText = `left:${m.x}px;top:${m.y}px;width:${m.w * 1.1}px;height:${m.w * 1.1}px;margin:${-m.w * 0.55}px 0 0 ${-m.w * 0.55}px`;
  kok.append(halka);
  halka
    .animate([{ transform: 'scale(.5)', opacity: 0.95 }, { transform: 'scale(1.9)', opacity: 0 }], { duration: 560, easing: 'cubic-bezier(.2,.7,.3,1)' })
    .finished.then(() => halka.remove(), () => halka.remove());
  parlat(kok, m.x, m.y, 8, m.w * 0.9);
}

/**
 * Kartları bir noktadan (deste / Mino'nun patisi) sırayla dağıtır: her kart yay çizerek uçar, havada arka yüzünden
 * dönüp önünü gösterir ve yerine hafifçe ezilerek konar. Kartlar zaten son yerlerinde olmalı (yerleşim bitmiş).
 */
export function dagit(kartlar: HTMLElement[], kaynak: Nokta, sec: { bas?: number; aralik?: number; ms?: number; arkaDon?: boolean; ses?: (i: number) => void } = {}): Promise<void> {
  if (TEST_MODU || !kartlar.length) return Promise.resolve();
  if (azHareket()) {
    return Promise.all(kartlar.map((k, i) => k.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, delay: i * 40, fill: 'backwards' }).finished.catch(() => undefined))).then(() => undefined);
  }
  const bas = sec.bas ?? 0;
  const ms = sec.ms ?? 560;
  const aralik = sec.aralik ?? 90;
  const arkaDon = sec.arkaDon ?? true;
  const isler = kartlar.map((kart, i) => {
    const r = kart.getBoundingClientRect();
    const s = { x: kaynak.x - (r.left + r.width / 2), y: kaynak.y - (r.top + r.height / 2) };
    const uzak = Math.hypot(s.x, s.y);
    const tepe = Math.min(s.y, 0) - Math.min(120, 40 + uzak * 0.22);
    const p1 = { x: s.x * 0.8, y: tepe };
    const p2 = { x: s.x * 0.2, y: tepe * 0.6 };
    const yon = s.x > 0 ? 1 : -1;
    const N = 22;
    const kareler: Keyframe[] = [];
    // arka yüz yarım dönüşü: t = 0.38..0.74 arasında scaleX |cos|; kenara geldiğinde (0.56) yüz değişir
    const d0 = 0.38, d1 = 0.74;
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const u = cikis(Math.min(1, t / 0.86));
      const p = bezier(s, p1, p2, { x: 0, y: 0 }, u);
      let sx = 1;
      if (arkaDon && t > d0 && t < d1) sx = Math.max(0.02, Math.abs(Math.cos(Math.PI * ((t - d0) / (d1 - d0)))));
      let olcek = 0.3 + 0.7 * cikis(Math.min(1, t / 0.7));
      let sy = 1;
      // konma: hafif ezilme ve toparlanma
      if (t > 0.86) {
        const k2 = (t - 0.86) / 0.14;
        sy = 1 - 0.07 * Math.sin(k2 * Math.PI);
        sx *= 1 + 0.05 * Math.sin(k2 * Math.PI);
        olcek = 1;
      }
      const don = yon * 26 * (1 - cikis(Math.min(1, t / 0.86))) + (t > 0.86 ? -yon * 2.5 * Math.sin(((t - 0.86) / 0.14) * Math.PI) : 0);
      kareler.push({
        transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${don.toFixed(1)}deg) scale(${(olcek * sx).toFixed(3)}, ${(olcek * sy).toFixed(3)})`,
        opacity: t < 0.08 ? t / 0.08 : 1,
        offset: t,
      });
    }
    const gecikme = bas + i * aralik;
    const anim = kart.animate(kareler, { duration: ms, delay: gecikme, easing: 'linear', fill: 'backwards' });
    let arka: HTMLElement | null = null;
    if (arkaDon) {
      arka = document.createElement('div');
      arka.className = 'dagit-arka';
      arka.innerHTML = '<div class="kart-arka"><div class="arka-rozet"><span>m</span></div></div>';
      kart.append(arka);
      const orta = (d0 + d1) / 2;
      arka.animate([{ opacity: 1 }, { opacity: 1, offset: orta }, { opacity: 0, offset: orta + 0.001 }, { opacity: 0 }], { duration: ms, delay: gecikme, fill: 'both' });
    }
    if (sec.ses) window.setTimeout(() => sec.ses?.(i), gecikme);
    return anim.finished.catch(() => undefined).then(() => arka?.remove());
  });
  return Promise.all(isler).then(() => undefined);
}

/** Soru geçişi: kalan kartlar sırayla hafifçe düşüp kaybolur. */
export function topla(kartlar: HTMLElement[], ms = 300): Promise<void> {
  if (TEST_MODU || !kartlar.length) return Promise.resolve();
  if (azHareket()) return Promise.all(kartlar.map((k) => k.animate([{ opacity: 0 }], { duration: 180, fill: 'forwards' }).finished.catch(() => undefined))).then(() => undefined);
  return Promise.all(
    kartlar.map((k, i) =>
      k
        .animate([{ transform: `translateY(34px) rotate(${i % 2 ? 7 : -7}deg) scale(.72)`, opacity: 0 }], {
          duration: ms,
          delay: i * 40,
          easing: 'cubic-bezier(.5,0,.75,.4)',
          fill: 'forwards',
        })
        .finished.catch(() => undefined),
    ),
  ).then(() => undefined);
}

/** Yanlış kart: hafifçe kalkar, "yok yok" diye yumuşakça sallanır ve yerine geri oturur. */
export function yumusakSallan(el: HTMLElement): Promise<void> {
  if (TEST_MODU) return Promise.resolve();
  if (azHareket()) return el.animate([{ opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }], { duration: 400 }).finished.then(() => undefined, () => undefined);
  return el
    .animate(
      [
        { transform: 'none' },
        { transform: 'translateY(-12px) rotate(-7deg) scale(1.04)', offset: 0.14 },
        { transform: 'translateY(-10px) rotate(5.5deg) scale(1.04)', offset: 0.3 },
        { transform: 'translateY(-7px) rotate(-3.5deg) scale(1.02)', offset: 0.46 },
        { transform: 'translateY(-3px) rotate(2deg) scale(1.01)', offset: 0.62 },
        { transform: 'translateY(1px) rotate(-0.8deg) scale(.985, 1.01)', offset: 0.8 },
        { transform: 'none' },
      ],
      { duration: 640, easing: 'ease-out', composite: 'replace' },
    )
    .finished.then(() => undefined, () => undefined);
}

/** Tek bir kartı sahneye "koyar": yukarıdan hafifçe düşüp ezilerek oturur (gösterge kartları). */
export function koy(kartlar: HTMLElement[], gecikme = 0): void {
  if (TEST_MODU || azHareket()) return;
  kartlar.forEach((k, i) =>
    k.animate(
      [
        { transform: 'translateY(-26px) scale(.8) rotate(-4deg)', opacity: 0 },
        { transform: 'translateY(0) scale(1.04, .95) rotate(0deg)', opacity: 1, offset: 0.6 },
        { transform: 'scale(.99, 1.01)', offset: 0.82 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 460, delay: gecikme + i * 80, easing: 'cubic-bezier(.3,.8,.4,1)', fill: 'backwards' },
    ),
  );
}

/** Izgara elemanını kutusuna sığdırır ve boyut değişince yeniden hesaplar. */
export function izgaraSigdir(kutu: HTMLElement, izgara: HTMLElement, n: number, sec: { oran?: number; bosluk?: number; enBuyuk?: number; ekW?: number; kolonlar?: number[] } = {}) {
  const hesapla = () => {
    const W = kutu.clientWidth - (sec.ekW ?? 0);
    const H = kutu.clientHeight - 14; // kart altı gölge payı
    if (W <= 0 || H <= 0) return;
    const bosluk = sec.bosluk ?? Math.round(Math.min(22, Math.max(10, W * 0.035)));
    const { kolon, kw } = sigdir(W, H, n, sec.oran ?? 1.12, bosluk, sec.enBuyuk ?? 260, sec.kolonlar);
    izgara.style.setProperty('--kolon', String(kolon));
    izgara.style.setProperty('--kw', `${kw}px`);
    izgara.style.setProperty('--bosluk', `${bosluk}px`);
  };
  hesapla();
  const ro = new ResizeObserver(hesapla);
  ro.observe(kutu);
  return () => ro.disconnect();
}
