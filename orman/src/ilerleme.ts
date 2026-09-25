/** Uyuyan Orman ilerlemesi (bu cihazda). Yaş, kart oyunuyla ortak kayıttan gelir. */
const ANAHTAR = 'minkino-orman-v1';

interface Kayit {
  /** uyanan bölgeler */
  uyanan: string[];
  /** çocuğun adı (Hece Mağarası; büyük yazar) */
  isim: string;
  /** mikrofon izni bir kez verildi mi (veli ekranı yeniden gösterilmez) */
  izin: boolean;
  /** şenlik açılışı kutlandı mı */
  senlik: boolean;
}

function yukle(): Kayit {
  const v: Kayit = { uyanan: [], isim: '', izin: false, senlik: false };
  try {
    const ham = globalThis.localStorage?.getItem(ANAHTAR);
    if (ham) {
      const k = JSON.parse(ham) as Partial<Kayit>;
      return { ...v, ...k, uyanan: Array.isArray(k.uyanan) ? k.uyanan : [] };
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

/** Bölgeyi uyandırır; ilk kez uyandıysa true */
export function uyandir(id: string): boolean {
  if (kayit.uyanan.includes(id)) return false;
  kayit.uyanan.push(id);
  kaydet();
  return true;
}
