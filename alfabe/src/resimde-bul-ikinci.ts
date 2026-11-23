// Resimde Bul ikinci sahne seti (Astra Paket Harf-H12, assets/alfabe/resimde-bul-2/<harf>.webp; önce 1. ses grubu).
// Dokunma bölgeleri sahne gelince ölçülüp resimde-bul-2.json'a yazılır: { "01": { "items": [aranan, aranan, çeldirici, çeldirici] } }.
// Ceren kayıtları bul2-<harf>-<sıra> (ilk setteki bul-yeni-<harf>-<sıra> kalıbıyla). Sahne ve bölgeler gelene dek ilk set oynar.
import { TEST_MODU } from '../../src/ui/dom';
import veri from './resimde-bul-2.json';

export type BulNesnesi = { name: string; points: string; ustte?: boolean };
export type IkinciSahne = { items: BulNesnesi[]; url: string };
const sahneler = import.meta.glob<string>('../../assets/alfabe/resimde-bul-2/*.webp', { eager: true, query: '?url', import: 'default' });

/** Harfin ikinci sahnesi (resim ve dört bölge hazırsa). Test kipinde window.__bul2 ile denenebilir. */
export function ikinciSahne(harf: string): IkinciSahne | undefined {
  const deneme = TEST_MODU ? (window as { __bul2?: Record<string, IkinciSahne> }).__bul2?.[harf] : undefined;
  if (deneme) return deneme;
  const d = (veri as Record<string, { items?: BulNesnesi[] }>)[harf];
  const url = sahneler['../../assets/alfabe/resimde-bul-2/' + harf + '.webp'];
  return d?.items?.length === 4 && url ? { items: d.items, url } : undefined;
}

/** Bitmap sahneyi Resimde Bul'un SVG sahne yoluna sarar (resimde-bul-hareket.ts aynı biçimde okur). */
export const sahneSvg = (url: string) => '<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941">' +
  '<image href="' + url.replace(/"/g, '&quot;') + '" width="1672" height="941" preserveAspectRatio="none"/></svg>';
