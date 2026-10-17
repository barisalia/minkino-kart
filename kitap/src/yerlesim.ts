/**
 * Kitabın ekrandaki ölçüleri (saf; birim testi tests/unit/kitap.test.ts). Tasarım: ekip/kitap/TASARIM-ONERILERI.md
 * (seçilen öneri C: "resim kenardan kenara, yazı resmin altından akar").
 *
 * Telefon önce: yatayda (844×390, 667×375) açık iki sayfa; sol sayfanın üstünde resim kenardan kenara (çerçevesiz),
 * yazı resmin altından başlar ve sağ sayfada sürer. Dikeyde (390×844) tek sayfa: üstte resim kenardan kenara, altta
 * yazı. Sayfalar gerçek kitap oranında (yatayda ~1.3, dikeyde ~0.6), kitap masanın ortasında durur.
 *
 * Netlik kuralı (src/ui/netlik.ts): resim kaynak pikselinin üstüne büyütülmez: ekrandaki en × 3 (DPR) ≤ kaynak eni.
 * Resim kırpılmaz, oranıyla durur. 1376×768 çizim en çok 458×256 CSS px: telefonların hepsinde sayfa eni bunun
 * altında. Tablette sayfa daha geniş: resim sınırda durur, sayfanın üstünde eşit payla ortalanır. 1. kitabın çizimleri
 * 2752×1536 (Recraft netleştirme, kitap-isle.cjs; yerlesim.json → boy): tablette de kenardan kenara.
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
  /** Resim alanı (CSS px): kaynağın oranında, kaynak eni / 3'ü aşmaz, sayfa enini aşmaz */
  resimW: number;
  resimH: number;
  /** Resmin sayfanın üst ve yan kenarına payı (resim sayfadan darsa; telefonda 0 = kenardan kenara) */
  resimPay: number;
  /** Kitabın (açık hâlinin) ekrandaki sol üst köşesi */
  x: number;
  y: number;
}

/** Üstte düğmeler (geri, okuma modu) için şerit; kitap onun altında */
export const UST = 62;
const ALT = 14;
/** Yanlarda masa payı (cilt sayfadan 6 px taşar) */
const YAN = 16;
const CILT = 6;

/** Kaynağa göre resim alanının en büyük eni (CSS px) */
export const resimEnCok = (kaynak: [number, number] = VARSAYILAN_KAYNAK) => Math.floor(kaynak[0] / NETLIK_DPR);

export function kitapOlcusu(w: number, h: number, kaynak: [number, number] = VARSAYILAN_KAYNAK): KitapOlcu {
  const yatay = w > h * 1.08;
  const oran = kaynak[0] / kaynak[1];
  const enCok = resimEnCok(kaynak);
  const bosH = h - UST - ALT - CILT;
  let pw: number;
  let ph: number;
  if (yatay) {
    pw = Math.floor(Math.min((w - 2 * YAN - 2 * CILT) / 2, bosH * 1.32));
    ph = Math.floor(Math.min(bosH, pw * 0.92));
  } else {
    pw = Math.floor(Math.min(w - 2 * 14, bosH * 0.75));
    ph = Math.floor(Math.min(bosH, pw / 0.6));
  }
  const resimW = Math.floor(Math.min(pw, enCok));
  const resimPay = Math.floor((pw - resimW) / 2);
  const x = Math.round((w - (yatay ? 2 * pw : pw)) / 2);
  const y = Math.round(UST + (bosH - ph) / 2);
  return { yatay, pw, ph, resimW, resimH: Math.floor(resimW / oran), resimPay, x, y };
}

/** Sayfa sırası (1. kitap): 0 kapak, 1..14 sayfalar, 15 son (ebeveyn sayfası); kitap.ts kitaba göre hesaplar */
export const SON_SAYFA = 15;
