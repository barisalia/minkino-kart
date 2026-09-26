/** Mino'nun Pazarı ilerlemesi (bu cihazda). Yaş, kart oyunuyla ortak kayıttan gelir. */
const ANAHTAR = 'minkino-pazar-v1';

interface Kayit {
  /** toplam kazanılan yıldız (her mutlu müşteri bir yıldız) */
  yildiz: number;
  /** kaç pazar şenliği yapıldı */
  senlik: number;
}

function yukle(): Kayit {
  const v: Kayit = { yildiz: 0, senlik: 0 };
  try {
    const ham = globalThis.localStorage?.getItem(ANAHTAR);
    if (ham) {
      const k = JSON.parse(ham) as Partial<Kayit>;
      return { yildiz: Number(k.yildiz) || 0, senlik: Number(k.senlik) || 0 };
    }
  } catch {
    /* bozuk kayıt: sıfırdan */
  }
  return v;
}

export const kayit = yukle();

export function kaydet() {
  try {
    globalThis.localStorage?.setItem(ANAHTAR, JSON.stringify(kayit));
  } catch {
    /* gizli sekme vb. */
  }
}
