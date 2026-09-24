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
export function sigdir(W: number, H: number, n: number, oran = 1.12, bosluk = 14, enBuyuk = 260): { kolon: number; kw: number } {
  let en = { kolon: 1, kw: 0 };
  for (let kolon = 1; kolon <= n; kolon++) {
    const satir = Math.ceil(n / kolon);
    const kwW = (W - bosluk * (kolon - 1)) / kolon;
    const kwH = (H - bosluk * (satir - 1)) / satir / oran;
    const kw = Math.min(kwW, kwH, enBuyuk);
    if (kw > en.kw + 0.5) en = { kolon, kw };
  }
  en.kw = Math.max(40, Math.floor(en.kw));
  return en;
}

/** Izgara elemanını kutusuna sığdırır ve boyut değişince yeniden hesaplar. */
export function izgaraSigdir(kutu: HTMLElement, izgara: HTMLElement, n: number, sec: { oran?: number; bosluk?: number; enBuyuk?: number; ekW?: number } = {}) {
  const hesapla = () => {
    const W = kutu.clientWidth - (sec.ekW ?? 0);
    const H = kutu.clientHeight - 14; // kart altı gölge payı
    if (W <= 0 || H <= 0) return;
    const bosluk = sec.bosluk ?? Math.round(Math.min(22, Math.max(10, W * 0.035)));
    const { kolon, kw } = sigdir(W, H, n, sec.oran ?? 1.12, bosluk, sec.enBuyuk ?? 260);
    izgara.style.setProperty('--kolon', String(kolon));
    izgara.style.setProperty('--kw', `${kw}px`);
    izgara.style.setProperty('--bosluk', `${bosluk}px`);
  };
  hesapla();
  const ro = new ResizeObserver(hesapla);
  ro.observe(kutu);
  return () => ro.disconnect();
}
