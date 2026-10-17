/**
 * Kitaplık rafı: ilk iki kitap hazır (ikincinin çizimleri gelene kadar sayfalar yer tutucu); öbür 8 fikir (ekip/senaryo/KITAP-MINO-KINO.md §1) "yakında" sırtı olarak durur.
 */
import kuzuKulak from '../../content/kitap-kuzu-kulak.json';
import okul from '../../content/kitap-okul.json';
import type { RafKitabi } from './kitap';
import { OKUL_CANLI } from './okul-canli';
import type { KitapIcerik } from './tipler';

export const KITAPLAR: RafKitabi[] = [
  { id: 'okul', baslik: 'Kino Okula Başlıyor', renk: '#E2683C', icerik: okul as KitapIcerik, canli: OKUL_CANLI },
  { id: 'kuzu-kulak', baslik: "Kuzu'nun Kulağı", renk: '#7FB3D5', icerik: kuzuKulak as KitapIcerik },
  { id: 'dizim', baslik: 'Dizim Kanadı', renk: '#F2A541' },
  { id: 'hasta', baslik: 'Kino Hasta', renk: '#9B8BD6' },
  { id: 'havuz', baslik: 'Mino Havuza Girmiyor', renk: '#4FB9A8' },
  { id: 'karanlik', baslik: 'Karanlıkta Kim Var?', renk: '#4C5C8A' },
  { id: 'kus', baslik: 'Küs müyüz?', renk: '#E57373' },
  { id: 'bebek', baslik: 'Ben de Bebeğim!', renk: '#F48FB1' },
  { id: 'piknik', baslik: 'Piknik Yarına Kaldı', renk: '#8BC34A' },
  { id: 'market', baslik: 'Markette Kayboldum', renk: '#FFB74D' },
];
