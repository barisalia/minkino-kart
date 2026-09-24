type Attrs = Record<string, string | number | boolean | undefined | null | EventListener>;
type Child = Node | string | null | undefined | false;

/** Küçük DOM yardımcısı: h('div.sinif.diger', { onclick }, ...cocuklar) */
export function h<K extends keyof HTMLElementTagNameMap>(
  etiket: K | `${K}.${string}`,
  attrs: Attrs = {},
  ...cocuklar: Child[]
): HTMLElementTagNameMap[K] {
  const [ad, ...siniflar] = etiket.split('.');
  const el = document.createElement(ad as K);
  if (siniflar.length) el.className = siniflar.join(' ');
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'html') el.innerHTML = String(v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of cocuklar) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

/** SVG metninden eleman üretir. */
export function svg(kaynak: string, sinif = ''): HTMLElement {
  const s = document.createElement('span');
  s.className = `ikon ${sinif}`.trim();
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = kaynak;
  return s;
}

export const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function karistir<T>(dizi: T[], rnd: () => number = Math.random): T[] {
  const a = dizi.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Test modu: ?test=1 — animasyon ve konuşma beklemeleri kısalır. */
export const TEST_MODU = typeof location !== 'undefined' && new URLSearchParams(location.search).has('test');

/** Animasyon süresi (test modunda çok kısa). */
export const sure = (ms: number) => (TEST_MODU ? Math.min(ms, 30) : ms);

export function dokun(el: HTMLElement, fn: (e: PointerEvent) => void) {
  el.addEventListener('click', (e) => fn(e as PointerEvent));
}
