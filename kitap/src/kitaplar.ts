/**
 * Kitaplık rafı: ilk iki kitap hazır (ikincinin çizimleri gelene kadar sayfalar yer tutucu); öbür 8 fikir (ekip/senaryo/KITAP-MINO-KINO.md §1) "yakında" sırtı olarak durur.
 */
import okul from '../../content/kitap-okul.json';
import doktor from '../../content/kitap-doktor.json';
import kurabiye from '../../content/kitap-kurabiye.json';
import alisveris from '../../content/kitap-alisveris.json';
import ustkat from '../../content/kitap-ustkat.json';
import ucurtma from '../../content/kitap-ucurtma.json';
import kumkale from '../../content/kitap-kumkale.json';
import cadir from '../../content/kitap-cadir.json';
import type { RafKitabi } from './kitap';
import { OKUL_CANLI } from './okul-canli';
import type { KitapIcerik } from './tipler';

export const KITAPLAR: RafKitabi[] = [
  { id: 'ucurtma', baslik: ucurtma.baslik, renk: '#398B98', icerik: ucurtma as KitapIcerik },
  { id: 'ustkat', baslik: ustkat.baslik, renk: '#46877D', icerik: ustkat as KitapIcerik },
  { id: 'kumkale', baslik: kumkale.baslik, renk: '#368D99', icerik: kumkale as KitapIcerik },
  { id: 'cadir', baslik: cadir.baslik, renk: '#4F83A4', icerik: cadir as KitapIcerik },
  { id: 'alisveris', baslik: alisveris.baslik, renk: '#407C70', icerik: alisveris as KitapIcerik },
  { id: 'kurabiye', baslik: kurabiye.baslik, renk: '#B56836', icerik: kurabiye as KitapIcerik },
  { id: 'doktor', baslik: doktor.baslik, renk: '#58B9A5', icerik: doktor as KitapIcerik },
  { id: 'okul', baslik: 'Kino Okula Başlıyor', renk: '#E2683C', icerik: okul as KitapIcerik, canli: OKUL_CANLI, gizli: true },
  // Barış 2026-11-09 yayın: çizimleri gelene kadar "yakında" (metni content/kitap-kuzu-kulak.json; yer tutucu yayına çıkmaz)
  { id: 'kuzu-kulak', baslik: "Kuzu'nun Kulağı", renk: '#7FB3D5' },
  { id: 'dizim', baslik: 'Dizim Kanadı', renk: '#F2A541' },
  { id: 'hasta', baslik: 'Kino Hasta', renk: '#9B8BD6' },
  { id: 'havuz', baslik: 'Mino Havuza Girmiyor', renk: '#4FB9A8' },
  { id: 'karanlik', baslik: 'Karanlıkta Kim Var?', renk: '#4C5C8A' },
  { id: 'kus', baslik: 'Küs müyüz?', renk: '#E57373' },
  { id: 'bebek', baslik: 'Ben de Bebeğim!', renk: '#F48FB1' },
  { id: 'piknik', baslik: 'Piknik Yarına Kaldı', renk: '#8BC34A' },
  { id: 'market', baslik: 'Markette Kayboldum', renk: '#FFB74D' },
];
