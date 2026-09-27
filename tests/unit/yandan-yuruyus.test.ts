/**
 * Ortak yandan yürüyüş (src/karakter/yandan.ts): Adobe'nin yan görünüş iskeletleri (assets/karakter-iskelet/*-profil)
 * Mino'nunkiyle aynı döngüyle yürür. Tarayıcıdaki ölçümün aynısı (patiKoseleri) burada sharp ile çözülen bacak
 * resimlerinden yapılır; köpek (ve sonra gelecek tavşan, ördek …) için Mino'nun kuralları denetlenir.
 */
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { MINO_YURUYUS, patiDunya, patiKoseleri, PATI_OLCUM, yuruyusGeometrisi, yuruyusPozu, type BacakAdi, type YuruyusGeometri } from '../../src/mino/yuruyus';
import { YANDAN_OLCULER } from '../../src/karakter/yandan-olcu';

// dosyalar vite ile ham metin olarak (vitest vite üstünde çalışır)
const SVG = import.meta.glob<string>(['../../assets/karakter-iskelet/*-profil.svg', '../../ekip/mino/mino-profil.svg'], { eager: true, query: '?raw', import: 'default' });
const JSONLAR = import.meta.glob<string>('../../assets/karakter-iskelet/*-profil.json', { eager: true, query: '?raw', import: 'default' });
const K = '../../assets/karakter-iskelet/';
const profiller = Object.keys(JSONLAR)
  .map((f) => f.slice(K.length).replace('-profil.json', ''))
  .filter((ad) => SVG[`${K}${ad}-profil.svg`]);
const oku = (ad: string) => JSON.parse(JSONLAR[`${K}${ad}-profil.json`].replace(/^﻿/, ''));

async function bacakNoktalari(svg: string, id: string): Promise<[number, number][]> {
  const bas = svg.indexOf(`<g id="${id}"`);
  const m = svg.slice(bas, svg.indexOf('</g>', bas)).match(/<image x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*base64,([^"]+)"/);
  if (!m) throw new Error(`resim yok: ${id}`);
  const [x, y, w, h] = m.slice(1, 5).map(Number);
  const { data, info } = await sharp(Uint8Array.from(atob(m[5]), (c) => c.charCodeAt(0))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const kx = w / info.width;
  const ky = h / info.height;
  const n: [number, number][] = [];
  for (let j = 0; j < info.height; j++) {
    let sol = -1;
    let sag = -1;
    for (let i = 0; i < info.width; i++)
      if (data[(j * info.width + i) * 4 + 3] >= PATI_OLCUM.ESIK) {
        if (sol < 0) sol = i;
        sag = i;
      }
    if (sol < 0) continue;
    for (const [i, dj] of [[sol, 0], [sol, 1], [sag + 1, 0], [sag + 1, 1]]) n.push([x + i * kx, y + (j + dj) * ky]);
  }
  return n;
}

async function geometri(ad: string): Promise<YuruyusGeometri> {
  const svg = SVG[`${K}${ad}-profil.svg`];
  const bilgi = oku(ad);
  const d = bilgi.donme;
  const pati = {} as Record<BacakAdi, [number, number][]>;
  for (const b of ['bacak-on', 'bacak-arka'] as const) {
    const n = await bacakNoktalari(svg, b);
    const alt = Math.max(...n.map((q) => q[1]));
    pati[b] = patiKoseleri(n, d[b][1], PATI_OLCUM.ALT_PAY * (alt - d[b][1]));
  }
  const zemin = Math.max(pati['bacak-on'][0][1], pati['bacak-arka'][0][1]);
  return yuruyusGeometrisi({ donme: { 'bacak-on': d['bacak-on'], 'bacak-arka': d['bacak-arka'], govde: d.govde }, zemin, pati, olcu: YANDAN_OLCULER[ad] });
}

const fazlar = Array.from({ length: 200 }, (_, i) => i / 200);

describe('Ortak yandan yürüyüş', () => {
  it('en az bir yan görünüş iskeleti var (köpek) ve standart katmanları taşıyor', () => {
    expect(profiller).toContain('kopek');
    for (const ad of profiller) {
      const b = oku(ad);
      for (const k of ['bacak-on', 'bacak-arka', 'govde', 'kafa']) expect(b.sira, `${ad}: ${k}`).toContain(k);
      for (const k of ['bacak-on', 'bacak-arka', 'govde']) expect(b.donme[k], `${ad}: ${k} dönme`).toHaveLength(2);
    }
  });

  it('Mino ölçümü: aynı yöntem Mino’nun elle konmuş pati zarfıyla aynı adım yolunu verir', async () => {
    const svg = SVG['../../ekip/mino/mino-profil.svg'];
    const n = await bacakNoktalari(svg, 'bacak-on');
    const k = patiKoseleri(n, MINO_YURUYUS.donme['bacak-on'][1], PATI_OLCUM.ALT_PAY * (Math.max(...n.map((q) => q[1])) - MINO_YURUYUS.donme['bacak-on'][1]));
    expect(k[0][1]).toBeCloseTo(MINO_YURUYUS.zemin, -1);
  });

  for (const ad of profiller) {
    describe(ad, () => {
      it('adım yolu makul (bacak boyuna göre), açılar ±25 içinde', async () => {
        const g = await geometri(ad);
        const boy = g.zemin - g.donme['bacak-on'][1];
        expect(g.adimYolu).toBeGreaterThan(0.5 * boy);
        expect(g.adimYolu).toBeLessThan(1.2 * boy);
        for (const f of fazlar) {
          const z = yuruyusPozu(f, 1, 0.3, g);
          expect(Math.abs(z.bacakOn)).toBeLessThanOrEqual(25);
          expect(Math.abs(z.bacakArka)).toBeLessThanOrEqual(25);
          expect(Math.abs(z.kuyruk)).toBeLessThanOrEqual(g.olcu.KUYRUK + 1e-9);
        }
      });

      it('her karede bir pati tam yerde, hiçbiri gömülmüyor; dururken dinlenme duruşu', async () => {
        const g = await geometri(ad);
        for (const guc of [1, 0.5, 0])
          for (const f of fazlar) {
            const z = yuruyusPozu(f, guc, 0.7, g);
            const on = patiDunya('bacak-on', z, g).yer;
            const arka = patiDunya('bacak-arka', z, g).yer;
            expect(Math.min(on, arka)).toBeCloseTo(0, 3);
            expect(on).toBeGreaterThan(-1e-3);
            expect(arka).toBeGreaterThan(-1e-3);
          }
        const z = yuruyusPozu(0.3, 0, 0, g);
        expect(Math.abs(z.bob)).toBeLessThan(3);
      });

      it('basan pati kaymıyor: gövde döngü yolunu sabit hızla alırken patinin taban noktası yerinde', async () => {
        const g = await geometri(ad);
        for (const [b, bas] of [['bacak-on', 0], ['bacak-arka', 0.5]] as const) {
          const xs: number[] = [];
          for (let i = 0; i <= 50; i++) {
            const f = bas + (i / 50) * 0.5;
            xs.push(patiDunya(b, yuruyusPozu(f, 1, 0, g), g).tabanX + (f - bas) * g.donguYolu);
          }
          expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(0.05 * g.donguYolu);
        }
      });
    });
  }
});
