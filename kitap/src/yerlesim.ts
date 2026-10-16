/**
 * Kitabın ekrandaki ölçüleri (saf; birim testi tests/unit/kitap.test.ts).
 *
 * Telefon önce: yatayda (844×390, 667×375) açık iki sayfa (solda resim, sağda yazı), dikeyde (390×844) tek sayfa
 * (üstte resim, altta yazı). Sayfa resmi kare (Gemini 2K: 2048×2048) ve sayfa kutusunu kaplar; netlik kuralı:
 * resim kutusunun uzun kenarı × 3 (DPR) ≤ 2048 → en çok 682 px.
 */
export const RESIM_KAYNAK = 2048;
export const NETLIK_DPR = 3;
export const RESIM_EN_BUYUK = Math.floor(RESIM_KAYNAK / NETLIK_DPR);

export interface KitapOlcu {
  yatay: boolean;
  /** Bir sayfanın eni / boyu (CSS px) */
  pw: number;
  ph: number;
  /** Dikeyde sayfanın üstündeki resim alanının boyu (yatayda = ph) */
  resimH: number;
  /** Kitabın (açık hâlinin) ekrandaki sol üst köşesi */
  x: number;
  y: number;
}

/** Yanlarda düğmeler için pay (yatay), üstte düğme çubuğu (dikey) */
const YAN = 62;
const UST = 64;
const KENAR = 10;

export function kitapOlcusu(w: number, h: number): KitapOlcu {
  const yatay = w > h * 1.08;
  if (yatay) {
    const H = h - 2 * KENAR;
    let pw = Math.min((w - 2 * YAN) / 2, H * 1.08, RESIM_EN_BUYUK);
    // dar sayfa resmi yanlardan çok kırpar: en/boy ≥ 0.76 (resmin ortadaki %70'i hep görünür)
    let ph = Math.min(H, pw / 0.76, RESIM_EN_BUYUK);
    pw = Math.floor(pw);
    ph = Math.floor(ph);
    return { yatay, pw, ph, resimH: ph, x: Math.round((w - 2 * pw) / 2), y: Math.round((h - ph) / 2) };
  }
  const pw = Math.floor(Math.min(w - 2 * 12, (h - UST - 14) * 0.72));
  const ph = Math.floor(Math.min(h - UST - 14, pw * 2.2));
  // resim alanı: en/boy 0.95..1.12 arası (kare resimden üst-alt az kırpılır), netlik sınırı içinde
  const resimH = Math.floor(Math.min(RESIM_EN_BUYUK, Math.max(pw / 1.12, Math.min(pw / 0.95, ph * 0.5))));
  return { yatay, pw, ph, resimH, x: Math.round((w - pw) / 2), y: UST };
}

/** Sayfa sırası: 0 kapak, 1..14 sayfalar, 15 son (ebeveyn sayfası) */
export const SON_SAYFA = 15;
