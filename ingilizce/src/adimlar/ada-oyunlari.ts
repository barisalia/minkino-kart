/**
 * 13–24. adalara özel oyunlar: ders ekranının tek kapısı. Adım `{ tip: 'adaoyunu', oyun, yedek }` (plan.ts); oyunun
 * çizimi ya da sesi eksikse ders `yedek` adımı oynar (taslak ve test kipinde yer tutucuyla açılır).
 */
import { TEST_MODU } from '../../../src/ui/dom';
import { resim, sesAdresi, TASLAK } from '../varlik';
import { adaOyunuCizimleri, adaOyunuSesleri, type AdaOyunu } from './ada-oyunlari-veri';
import { havaPenceresiKur } from './hava-penceresi';
import { kinoGunuKur } from './kino-gunu';
import { kinoNeredeKur } from './kino-nerede';
import { kinoYardimKur } from './kino-yardim';
import { lokumPiknikKur } from './lokum-piknik';
import { dogaGeceKur } from './doga-gece';
import { kapOyunuKur } from './kap-oyunlari';
import { parkOyunKur } from './park-oyun';
import { sayiBalonKur } from './sayi-balon';
import { sekilBoyKur } from './sekil-boy';
import { vucutDokunKur } from './vucut-dokun';
import { renkliKinoKur } from './renkli-kino';
import { bilmeceKur } from './bilmece';
import { farkliOlanKur } from './farkli-olan';
import type { AdimKurucu } from './ortak';
import './ada-oyunlari.css';

export { adaOyunuPlani, adaOyunuSesleri, adaOyunuSoruSayisi, type AdaOyunu } from './ada-oyunlari-veri';
export { renkliPlani } from './ada-oyunlari-veri2';

/** Oyunun bütün çizimleri ve kayıtları diskte mi (taslak ve test kipinde her zaman) */
export function adaOyunuHazir(o: AdaOyunu): boolean {
  if (TASLAK || TEST_MODU) return true;
  return adaOyunuCizimleri(o).every((yol) => !!resim(yol)) && adaOyunuSesleri(o).every((id) => !!sesAdresi(id));
}

export const adaOyunuKur: AdimKurucu<'adaoyunu'> = (b, a) => {
  const o = a.oyun;
  switch (o.ad) {
    case 'nerede': return kinoNeredeKur(b, o);
    case 'yardim': return kinoYardimKur(b, o);
    case 'pencere': return havaPenceresiKur(b, o);
    case 'gun': return kinoGunuKur(b, o);
    case 'piknik': return lokumPiknikKur(b, o);
    case 'salata': case 'canta': return kapOyunuKur(b, o);
    case 'gece': return dogaGeceKur(b, o);
    case 'boy': return sekilBoyKur(b, o);
    case 'oyun': return parkOyunKur(b, o);
    case 'dokun': return vucutDokunKur(b, o);
    case 'say10': return sayiBalonKur(b, o);
    case 'renkli': return renkliKinoKur(b, o);
    case 'bilmece': return bilmeceKur(b, o);
    case 'farkli': return farkliOlanKur(b, o);
  }
};
