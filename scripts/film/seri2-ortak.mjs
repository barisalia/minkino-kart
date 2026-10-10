/**
 * Kino ve Ailesi (Seri 2) betiklerinin ortak okuması: bölüm dosyasının replikleri ve ses klasörleri.
 * Biçim: film/src/film2/bicim.ts (tarayıcı tarafı); burada yalnız replik listesi gerekir.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
/** Barış'ın ürettiği tam kalite sesler (YouTube) */
export const SES_KLASORU = path.join(KOK, 'ekip/ses/seri2-gelen');
/** uygulama için sıkıştırılmış kopyalar (mono) */
export const UYGULAMA_SES_KLASORU = path.join(KOK, 'assets/film-seri2/ses');

const oku = (p) => JSON.parse(fs.readFileSync(path.join(KOK, p), 'utf8'));
export const seriOku = () => oku('content/film2/seri.json');
export const bolumOku = (bolum) => oku(`content/film2/${bolum}.json`);
export const bolumler = () =>
  fs
    .readdirSync(path.join(KOK, 'content/film2'))
    .filter((f) => /^bolum-\d+\.json$/.test(f))
    .map((f) => f.replace(/\.json$/, ''));

/** bölümün bütün replikleri (açılış dahil), sırayla: { kimlik, kim, metin, etiket, sahne } */
export function replikler(bolum) {
  const s = seriOku(), b = bolumOku(bolum);
  const parcalar = [
    { kimlik: 'acilis', replikler: [...(s.acilis.replikler ?? []), ...(b.acilis?.replikler ?? [])] },
    ...b.sahneler,
    { kimlik: 'kapanis', replikler: s.kapanis.replikler ?? [] },
  ];
  return parcalar.flatMap((p) => (p.replikler ?? []).map((r) => ({ ...r, sahne: p.kimlik })));
}

export const sesDosyasi = (kimlik) => path.join(SES_KLASORU, `${kimlik}.mp3`);
