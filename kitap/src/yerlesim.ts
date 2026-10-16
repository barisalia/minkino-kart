/**
 * Kitabın ekrandaki ölçüleri (saf; birim testi tests/unit/kitap.test.ts).
 *
 * Telefon önce: yatayda (844×390, 667×375) açık iki sayfa (solda resim, sağda yazı), dikeyde (390×844) tek sayfa
 * (üstte resim, altta yazı).
 *
 * Netlik kuralı (src/ui/netlik.ts): resim kaynak pikselinin üstüne büyütülmez: ekrandaki en × 3 (DPR) ≤ kaynak eni.
 * Resim kırpılmaz, oranıyla sığar. İlk teslim 1376×768: resim alanı en çok 458×256 CSS px; telefonda yatayda sol
 * sayfaya (kenar payıyla) ve dikeyde tam ene sığar, ikisi de sınırın altında. Daha büyük çizim gelince
 * (yerlesim.json → boy) alan kendiliğinden büyür.
 */
import { NETLIK_DPR } from '../../src/ui/netlik';

/** Sayfa resminin kaynak boyu (Antigravity tam sayfa teslimi, 2026-10-17) */
export const VARSAYILAN_KAYNAK: [number, number] = [1376, 768];
export { NETLIK_DPR };

export interface KitapOlcu {
  yatay: boolean;
  /** Bir sayfanın eni / boyu (CSS px) */
  pw: number;
  ph: number;
  /** Resim alanı (CSS px): kaynağın oranında, kaynak eni / 3'ü aşmaz */
  resimW: number;
  resimH: number;
  /** Kitabın (açık hâlinin) ekrandaki sol üst köşesi */
  x: number;
  y: number;
}

/** Yanlarda düğmeler için pay (yatay), üstte düğme çubuğu (dikey) */
const YAN = 62;
const UST = 64;
const KENAR = 10;
/** Yatayda resim levhasının sayfa kenarına payı */
export const LEVHA_PAY = 12;

/** Kaynağa göre resim alanının en büyük eni (CSS px) */
export const resimEnCok = (kaynak: [number, number] = VARSAYILAN_KAYNAK) => Math.floor(kaynak[0] / NETLIK_DPR);

export function kitapOlcusu(w: number, h: number, kaynak: [number, number] = VARSAYILAN_KAYNAK): KitapOlcu {
  const yatay = w > h * 1.08;
  const oran = kaynak[0] / kaynak[1];
  const enCok = resimEnCok(kaynak);
  if (yatay) {
    const H = h - 2 * KENAR;
    const pw = Math.floor(Math.min((w - 2 * YAN) / 2, H * 1.08));
    const ph = Math.floor(Math.min(H, pw / 0.76));
    const resimW = Math.floor(Math.min(pw - 2 * LEVHA_PAY, enCok));
    return { yatay, pw, ph, resimW, resimH: Math.floor(resimW / oran), x: Math.round((w - 2 * pw) / 2), y: Math.round((h - ph) / 2) };
  }
  const pw = Math.floor(Math.min(w - 2 * 12, (h - UST - 14) * 0.72));
  const ph = Math.floor(Math.min(h - UST - 14, pw * 2.2));
  const resimW = Math.floor(Math.min(pw, enCok));
  return { yatay, pw, ph, resimW, resimH: Math.floor(resimW / oran), x: Math.round((w - pw) / 2), y: UST };
}

/** Sayfa sırası: 0 kapak, 1..14 sayfalar, 15 son (ebeveyn sayfası) */
export const SON_SAYFA = 15;
