/**
 * Kino'nun Otobüsü V3: günün küçük yardımcıları.
 * - Lokum'un hazır kayıtları (Seri 2, assets/ses-seri2): müşteri sesleri üretilene dek (ONAY BEKLİYOR) yalnız Lokum
 *   kendi sesiyle konuşur ("Abi! Abi!", "Daha!", "Iii!").
 * - Kumbaranın çentikleri (kavanozun yan yüzünde üç çizgi; rakam yok).
 * - Sabahın özel tadı: iki ya da daha çok yeni tat açıldıysa Kino kapları dizer, çocuk bugünün özel tadını seçer.
 */
import K from '../../content/kino-otobus.json';
import { efekt, konus } from '../../src/audio/ses';
import { h, TEST_MODU } from '../../src/ui/dom';
import { salla } from './efekt';
import type { Tat } from './model';
import { gorsel, tatKabiAdi } from './varliklar';

const SERI2 = import.meta.glob<string>('../../assets/ses-seri2/{s1-lok1,s2-lok1,s2-lok2}.mp3', { eager: true, query: '?url', import: 'default' });
const LOKUM: Record<string, string> = { istek: 's1-lok1', bayildi: 's2-lok1', kikir: 's2-lok2' };
/** Lokum'un hazır kaydı (yoksa null): istek "Abi! Abi!", bayıldı "Daha!", kıkır "Iii!" */
export function lokumSesi(ad: string, ne: 'istek' | 'bayildi' | 'kikir'): string | null {
  if (ad !== 'lokum') return null;
  return SERI2[`../../assets/ses-seri2/${LOKUM[ne]}.mp3`] ?? null;
}

/** Kumbaranın üç çentiği (kavanozun içinin yüksekliğinin oranı, alttan) */
export const KUMBARA_CENTIK = [0.33, 0.66, 1] as const;

/**
 * Sabah: açılan tatların kapları yan yana; çocuk birini seçer (her kapta bir top; dokununca Mino tadın adını söyler,
 * kap zıplar ve seçilir). Tek tat varsa bu ekran yoktur.
 */
export function ozelSecimi(kok: HTMLElement, tatlar: readonly Tat[]): Promise<Tat> {
  return new Promise((coz) => {
    const perde = h('div.ko-ozel-secim', { role: 'dialog', 'aria-label': 'Bugünün tadı' });
    const raf = h('div.ko-ozel-raf');
    let secildi = false;
    for (const t of tatlar) {
      const b = h('button.ko-ozel-kap', { type: 'button', 'data-tat': t, 'aria-label': t, html: gorsel(tatKabiAdi(t)) });
      b.addEventListener('click', () => {
        if (secildi) return;
        secildi = true;
        efekt.secim();
        salla(b, 'ko-cok-zipla');
        b.classList.add('ko-secili');
        void konus((K.mino.odul.tat as Record<string, string>)[t]);
        window.setTimeout(
          () => {
            perde.remove();
            coz(t);
          },
          TEST_MODU ? 50 : 900,
        );
      });
      raf.append(b);
    }
    perde.append(raf);
    kok.append(perde);
    void konus(K.mino.odul.hangisi);
  });
}
