/**
 * Küçük animasyon yardımcıları (Web Animations API). Yalnız transform / opacity; dokunmayı tutmaz.
 * Döndürme yok (Barış: parça döndürme yok): poz değişimi, öteleme ve ezilme-esneme (squash-stretch).
 * Test modunda süreler kısalır; "az hareket" tercihinde de kısa ve sade.
 */
import { TEST_MODU } from '../../src/ui/dom';

export const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ms = (n: number) => (TEST_MODU ? Math.min(n, 20) : AZ ? Math.min(n, 300) : n);
export const bekle = (n: number) => new Promise<void>((r) => setTimeout(r, ms(n)));

/** Yaylı çıkış (abartı + geri oturma) */
export const YAY = 'cubic-bezier(.34,1.56,.64,1)';
export const YUMUSAK = 'cubic-bezier(.45,0,.2,1)';

export function oynat(el: Element | null | undefined, kare: Keyframe[], sure: number, sec: KeyframeAnimationOptions = {}): Promise<void> {
  if (!el) return Promise.resolve();
  const a = el.animate(kare, { duration: ms(sure), easing: YUMUSAK, ...sec });
  return a.finished.then(
    () => undefined,
    () => undefined,
  );
}

export interface Nokta {
  x: number;
  y: number;
}

/**
 * Ekran noktasından ekran noktasına yay çizerek uçuş (sabit katmanda; öğe left/top 0, translate ile). s0 → s1 ölçek;
 * uçarken hafif esner (hıza göre sx/sy), konarken ezilir. Döndürme yok.
 */
export function kavis(el: HTMLElement, a: Nokta, b: Nokta, sure: number, sec: { tepe?: number; s0?: number; s1?: number; ezil?: boolean } = {}): Promise<void> {
  const tepe = sec.tepe ?? -Math.max(70, Math.abs(b.x - a.x) * 0.3);
  const kare: Keyframe[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = a.x + (b.x - a.x) * u;
    const y = a.y + (b.y - a.y) * u + tepe * 4 * u * (1 - u);
    const s = (sec.s0 ?? 1) + ((sec.s1 ?? 1) - (sec.s0 ?? 1)) * u;
    // havada uzar (ortada en çok), sonra yerine otururken toparlanır
    const es = Math.sin(u * Math.PI) * 0.08;
    kare.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${(s * (1 - es)).toFixed(3)}, ${(s * (1 + es)).toFixed(3)})` });
  }
  return oynat(el, kare, sure, { easing: 'cubic-bezier(.35,0,.35,1)', fill: 'forwards' });
}

/** Ezilip esneyerek zıplama (taban pivotlu; öğenin transform-origin'i 50% 100% olmalı) */
export function hopla(el: Element | null | undefined, guc = 1, sure = 520): Promise<void> {
  const y = -18 * guc;
  return oynat(
    el,
    [
      { transform: 'translateY(0) scale(1, 1)' },
      { transform: `translateY(0) scale(${1 + 0.1 * guc}, ${1 - 0.12 * guc})`, offset: 0.18 },
      { transform: `translateY(${y}px) scale(${1 - 0.06 * guc}, ${1 + 0.1 * guc})`, offset: 0.45 },
      { transform: `translateY(0) scale(${1 + 0.08 * guc}, ${1 - 0.08 * guc})`, offset: 0.78 },
      { transform: 'translateY(0) scale(1, 1)' },
    ],
    sure,
  );
}

/** Yerinde sallanma (yalnız yatay öteleme; ipucu: "bana bak") */
export function salla(el: Element | null | undefined, sure = 700): Promise<void> {
  return oynat(
    el,
    [
      { transform: 'translateX(0) scale(1)' },
      { transform: 'translateX(-5px) scale(1.04, 0.97)', offset: 0.2 },
      { transform: 'translateX(5px) scale(0.98, 1.03)', offset: 0.45 },
      { transform: 'translateX(-3px) scale(1.02, 0.99)', offset: 0.7 },
      { transform: 'translateX(0) scale(1)' },
    ],
    sure,
  );
}

/** Ezilip yaylanarak dikilme (çiçek): yalnız scaleY 0.6 → 1.08 → 1, kaynak boyunun üstüne çıkmaz (öğe kaynak boyunun altında çizilir) */
export function dikil(el: Element | null | undefined, sure = 700): Promise<void> {
  return oynat(
    el,
    [
      { transform: 'scale(1.06, 0.6)' },
      { transform: 'scale(0.96, 1.08)', offset: 0.55 },
      { transform: 'scale(1.02, 0.97)', offset: 0.8 },
      { transform: 'scale(1, 1)' },
    ],
    sure,
    { easing: 'cubic-bezier(.3,.6,.4,1)' },
  );
}

/** Sonsuz döngü animasyonu (nefes, sallanma): durdurmak için dönen animasyonu cancel() */
export function dongu(el: Element, kare: Keyframe[], sure: number, gecikme = 0): Animation | null {
  if (AZ || TEST_MODU) return null;
  return el.animate(kare, { duration: sure, iterations: Infinity, easing: 'ease-in-out', delay: gecikme });
}

/** Öğenin ekrandaki merkezi */
export function merkez(el: Element): Nokta {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
