/**
 * Küçük animasyon yardımcıları (Web Animations API). Yalnız transform / opacity; dokunmayı tutmaz.
 * Test modunda süreler kısalır; "az hareket" tercihinde de kısa ve sade.
 */
import { TEST_MODU } from '../../src/ui/dom';

export const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ms = (n: number) => (TEST_MODU ? Math.min(n, 20) : AZ ? Math.min(n, 300) : n);
export const bekle = (n: number) => new Promise<void>((r) => setTimeout(r, ms(n)));

/** Yaylı çıkış (abartı + geri oturma) */
export const YAY = 'cubic-bezier(.34,1.56,.64,1)';
export const YUMUSAK = 'cubic-bezier(.45,0,.2,1)';
export const HIZLAN = 'cubic-bezier(.5,0,.9,.4)';

export function oynat(el: Element | null | undefined, kare: Keyframe[], sure: number, sec: KeyframeAnimationOptions = {}): Promise<void> {
  if (!el) return Promise.resolve();
  const a = el.animate(kare, { duration: ms(sure), easing: YUMUSAK, ...sec });
  return a.finished.then(
    () => undefined,
    () => undefined,
  );
}

/** Ekran noktasından ekran noktasına kavisli uçuş (sabit katmanda, transform ile) */
export function kavis(el: HTMLElement, a: { x: number; y: number }, b: { x: number; y: number }, sure: number, sec: { tepe?: number; s0?: number; s1?: number; don?: number } = {}): Promise<void> {
  const tepe = sec.tepe ?? -Math.max(60, Math.abs(b.x - a.x) * 0.25);
  const kare: Keyframe[] = [];
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = a.x + (b.x - a.x) * u;
    const y = a.y + (b.y - a.y) * u + tepe * 4 * u * (1 - u);
    const s = (sec.s0 ?? 1) + ((sec.s1 ?? 1) - (sec.s0 ?? 1)) * u;
    kare.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${(sec.don ?? 0) * u}deg) scale(${s})` });
  }
  return oynat(el, kare, sure, { easing: 'cubic-bezier(.4,0,.3,1)', fill: 'forwards' });
}
