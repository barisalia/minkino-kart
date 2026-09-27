/**
 * Hafıza kartı: arka yüzü (Minkino deseni) ve ön yüzü olan, scaleX ile dönen kart.
 * Gerçek 3B yerine yassılaşma + hafif kalkış + gölge: telefonda akıcı, iOS'ta arka yüz hatası yok.
 */
import type { KartGirdi } from '../engine/types';
import { h, TEST_MODU } from './dom';
import { azHareket } from './hareket';
import { kartArkasi, kartEl } from './kart';

export function hafizaKartiEl(g: KartGirdi, cift: string): HTMLButtonElement {
  return h(
    'button.hafiza-kart.hk',
    { type: 'button', 'data-cift': cift, 'aria-label': 'Kapalı kart' },
    h('div.hk-ic', {}, h('div.hk-arka', {}, kartArkasi()), h('div.hk-on', {}, kartEl(g)), h('i.hk-golge')),
  );
}

/** Kartı çevirir (acik: ön yüz görünsün). Dönüşün ortasında yüz değişir; bitince çözülür. */
export async function cevir(el: HTMLElement, acik: boolean, gecikme = 0): Promise<void> {
  if (el.classList.contains('acik') === acik) return;
  const ic = el.querySelector<HTMLElement>('.hk-ic');
  const golge = el.querySelector<HTMLElement>('.hk-golge');
  if (TEST_MODU || azHareket() || !ic) {
    el.classList.toggle('acik', acik);
    return;
  }
  const yon = acik ? 1 : -1;
  const kenar = `translateY(-10px) scale(0.02, 1.07) skewY(${6 * yon}deg)`;
  const ilk = ic.animate([{ transform: 'none' }, { transform: kenar }], { duration: 150, delay: gecikme, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'backwards' });
  golge?.animate([{ opacity: 0 }, { opacity: 0.45 }], { duration: 150, delay: gecikme, fill: 'backwards' });
  await ilk.finished.catch(() => undefined);
  el.classList.toggle('acik', acik);
  golge?.animate([{ opacity: 0.45 }, { opacity: 0 }], { duration: 240, easing: 'ease-out' });
  await ic
    .animate(
      [
        { transform: kenar },
        { transform: `translateY(-6px) scale(1.06, 1.02) skewY(${-1.5 * yon}deg)`, offset: 0.62 },
        { transform: 'none' },
      ],
      { duration: 260, easing: 'cubic-bezier(.2,.8,.3,1)' },
    )
    .finished.catch(() => undefined);
}

/** Eşleşen kartın küçük sevinç zıplaması. */
export function eslesmeZipla(el: HTMLElement, gecikme = 0) {
  if (TEST_MODU || azHareket()) return;
  el.querySelector<HTMLElement>('.hk-ic')?.animate(
    [
      { transform: 'none' },
      { transform: 'translateY(-14px) scale(1.12) rotate(-4deg)', offset: 0.35 },
      { transform: 'translateY(0) scale(.96, 1.04) rotate(2deg)', offset: 0.65 },
      { transform: 'none' },
    ],
    { duration: 520, delay: gecikme, easing: 'ease-out' },
  );
}

/** Eşleşmeyen iki kart: kapanmadan önce hafifçe "yok" der gibi sallanır. */
export function eslesmeyenSallan(el: HTMLElement): Promise<void> {
  if (TEST_MODU || azHareket()) return Promise.resolve();
  const ic = el.querySelector<HTMLElement>('.hk-ic');
  if (!ic) return Promise.resolve();
  return ic
    .animate(
      [
        { transform: 'none' },
        { transform: 'rotate(-5deg)', offset: 0.2 },
        { transform: 'rotate(4deg)', offset: 0.45 },
        { transform: 'rotate(-2deg)', offset: 0.7 },
        { transform: 'none' },
      ],
      { duration: 380, easing: 'ease-in-out' },
    )
    .finished.then(() => undefined, () => undefined);
}
