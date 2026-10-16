/**
 * Mini oyun kataloğu: her klasörün index.ts'i (`export const oyun: MiniOyun`) kendiliğinden bulunur.
 * Yeni mini oyun için bu dosyaya dokunmak GEREKMEZ (paralel kodcular aynı dosyaya yazmasın).
 * `deneme` P1'in sade deneme oyunudur: gerçek mini oyunu henüz olmayan istasyonda onun yerine açılır.
 */
import type { Istasyon, MiniOyun } from './arayuz';

const MODULLER = import.meta.glob<{ oyun?: MiniOyun }>('./*/index.ts', { eager: true });

export const MINI_OYUNLAR: Record<string, MiniOyun> = Object.fromEntries(
  Object.entries(MODULLER)
    .map(([yol, m]) => [/\.\/([^/]+)\/index\.ts$/.exec(yol)?.[1] ?? '', m.oyun] as const)
    .filter((x): x is readonly [string, MiniOyun] => !!x[0] && !!x[1]),
);

export const oyunBul = (ad: string): MiniOyun | undefined => MINI_OYUNLAR[ad];

/**
 * Aynı istasyonu paylaşan oyunlarda önce gelenler (ocak: tava, kızart, kazan; tezgâh: doğra, soy). import.meta.glob
 * adları alfabeyle sıralar ("kizart" < "tava"); lokanta seçim düğmesi (MiniOyun.simge) gelene kadar Gün 1'in oyunu önde.
 */
const ONCE = ['dogra', 'tava', 'tabakla'];
const sira = (o: MiniOyun) => (ONCE.includes(o.ad) ? ONCE.indexOf(o.ad) : ONCE.length);

/** Bir istasyonun gerçek (deneme dışı) mini oyunları (Gün 1'in oyunu önce) */
export const istasyonOyunlari = (ist: Istasyon): MiniOyun[] =>
  Object.values(MINI_OYUNLAR)
    .filter((o) => o.istasyon === ist && o.ad !== 'deneme')
    .sort((a, b) => sira(a) - sira(b));
