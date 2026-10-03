/**
 * Asıl MINKINO logosu (Barış'ın verdiği el çizimi büyük harfler: MIN pembe, KINO yeşil).
 * - 'sade': temiz, şeffaf; açık / krem zeminde.
 * - 'kenarli': kalın beyaz kenar + yumuşak gölge; resimli ya da renkli zeminde.
 * Kaynak PNG'ler assets/uygulama/logo-minkino-asil*.png; WebP'leri scripts/uygulama/logo-web.cjs üretir.
 * Görsel hiçbir zaman esnemez: genişlik ya da yükseklik CSS'te verilir, öteki kendi oranından gelir.
 */
import SADE from '../../assets/uygulama/logo-minkino-asil.webp';
import KENARLI from '../../assets/uygulama/logo-minkino-asil-kenarli.webp';
import { h } from './dom';

export type LogoTuru = 'sade' | 'kenarli';

const LOGO: Record<LogoTuru, { src: string; en: number; boy: number }> = {
  sade: { src: SADE, en: 1400, boy: 276 },
  kenarli: { src: KENARLI, en: 1400, boy: 292 },
};

/** <img class="mk-logo …"> ; alt "Minkino" (süs olarak kullanılacaksa alt='' verin) */
export function minkinoLogo(tur: LogoTuru = 'sade', sinif = '', alt = 'Minkino'): HTMLImageElement {
  const l = LOGO[tur];
  return h(`img.mk-logo.mk-logo-${tur}${sinif ? '.' + sinif.split(' ').join('.') : ''}`, {
    src: l.src,
    alt,
    width: l.en,
    height: l.boy,
    draggable: 'false',
    decoding: 'async',
    style: `aspect-ratio:${l.en}/${l.boy};object-fit:contain`,
  });
}
