/**
 * İpucu merdiveni (Barış'ın temel kuralı: gerçek seçim, deneme-yanılma; ipucu geç ve dolaylı).
 * Yanlış seçim cevabı ele vermez; ipucu yalnız zamanla, basamak basamak gelir:
 *   12 sn: karakter doğru şeye bakar (söz yok)
 *   25 sn: dolaylı söz (özellik, ipucu cümlesi; "şuna dokun" değil)
 *   35 sn: hafif parlama
 * Sonra arada bir (tekrar) soru yinelenir. Süreler adımın kurulduğu andan sayılır; çocuk o sırada dokunuyorsa ya
 * da biri konuşuyorsa basamak biraz ertelenir (sözü bölmesin).
 * Test modunda kapalıdır; `?test=1&merdiven=1` ile süreler 1/50'ye iner (e2e).
 */
import { TEST_MODU } from './dom';

export const MERDIVEN = { bak: 12_000, soz: 25_000, parla: 35_000, tekrar: 20_000 } as const;

export interface MerdivenAdimlari {
  bak?: () => void;
  soz?: () => void;
  parla?: () => void;
  /** parlamadan sonra her `MERDIVEN.tekrar` ms'de bir (ör. soruyu yeniden sor) */
  tekrar?: () => void;
}

export interface MerdivenSecenegi {
  /** true iken basamak ertelenir (ör. konuşma sürüyor) */
  mesgul?: () => boolean;
}

export interface Merdiven {
  /** Çocuk dokundu: o an gelen basamak birkaç saniye ertelenir (merdiven baştan başlamaz). */
  dokunuldu(): void;
  /** Kurulduğundan beri geçen süre (ms). */
  gecen(): number;
  /** Basamak geldi mi. */
  geldi(ad: 'bak' | 'soz' | 'parla'): boolean;
  dur(): void;
}

const testHizli = () => TEST_MODU && typeof location !== 'undefined' && new URLSearchParams(location.search).get('merdiven') === '1';

export function ipucuMerdiveni(adim: MerdivenAdimlari, secenek: MerdivenSecenegi = {}): Merdiven {
  const hizli = testHizli();
  const kapali = TEST_MODU && !hizli;
  const olcek = hizli ? 1 / 50 : 1;
  const bas = performance.now();
  let sonDokunus = -1e9;
  let durdu = kapali;
  const gelen = new Set<string>();
  const zamanlar: number[] = [];

  function kur(ad: 'bak' | 'soz' | 'parla' | 'tekrar', ms: number, f?: () => void) {
    if (!f || durdu) return;
    zamanlar.push(
      window.setTimeout(() => calistir(ad, f), ms * olcek),
    );
  }
  function calistir(ad: 'bak' | 'soz' | 'parla' | 'tekrar', f: () => void) {
    if (durdu) return;
    // dokunuş yeni geldiyse ya da biri konuşuyorsa biraz bekle
    const simdi = performance.now();
    if (!hizli && (simdi - sonDokunus < 3000 || secenek.mesgul?.())) {
      zamanlar.push(window.setTimeout(() => calistir(ad, f), 1500));
      return;
    }
    gelen.add(ad);
    f();
    if (ad === 'parla' || ad === 'tekrar') kur('tekrar', MERDIVEN.tekrar, adim.tekrar);
  }
  kur('bak', MERDIVEN.bak, adim.bak);
  kur('soz', MERDIVEN.soz, adim.soz);
  kur('parla', MERDIVEN.parla, adim.parla);

  return {
    dokunuldu() {
      sonDokunus = performance.now();
    },
    gecen: () => performance.now() - bas,
    geldi: (ad) => gelen.has(ad),
    dur() {
      durdu = true;
      zamanlar.forEach((t) => clearTimeout(t));
      zamanlar.length = 0;
    },
  };
}
