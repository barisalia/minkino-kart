// Harf ikinci kez oynanınca yeni içerik (yönetici, 20 Kasım): 2–3 yaşta boyamada harfin yerine resim (Harf-H11),
// Resimde Bul'da ikinci sahne seti (Harf-H12). Her harfte o adım her bitişte sayılır; tek sayıda yeni içerik gelir,
// çift sayıda ilk içerik: ikisi sırayla döner. Yeni içerik henüz gelmediyse ilk içerik oynanır (sayı yine artar).
// Test kipinde `?tur2=1` hep yeni içeriği açar.
import { TEST_MODU } from '../../src/ui/dom';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { yeniTurMu } from './ikinci-tur-kurali';

export type TurAdimi = 'boya' | 'bul';
const ANAHTAR = 'minkino-ikinci-tur-v1';
type Kayit = Record<TurAdimi, Record<string, number>>;

function oku(): Kayit {
  try {
    const k = JSON.parse(dersKaydiniOku(ANAHTAR) || 'null');
    if (k && typeof k.boya === 'object' && typeof k.bul === 'object') return k;
  } catch { /* bozuk kayıt: baştan */ }
  return { boya: {}, bul: {} };
}

/** Bu harfte bu adımda yeni içerik sırası mı? */
export function yeniIcerikSirasi(adim: TurAdimi, harf: string): boolean {
  if (TEST_MODU && new URLSearchParams(location.search).has('tur2')) return true;
  const n = oku()[adim][harf];
  return yeniTurMu(Number.isInteger(n) ? n : 0);
}

/** Adım bitti: sıradaki açılışta öbür içerik gelir. */
export function turBitti(adim: TurAdimi, harf: string) {
  const k = oku();
  k[adim][harf] = (k[adim][harf] ?? 0) + 1;
  try { dersKaydiniYaz(ANAHTAR, JSON.stringify(k)); } catch { /* kayıt yazılamasa da ders sürer */ }
}
