import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { bitisSayisi, bolgeBul, bolgele, bolgePikselleri, boya, buyukBolgeler } from '../../alfabe/src/kova';
import { BOYAMA_RESIMLERI, yeniTurMu } from '../../alfabe/src/ikinci-tur-kurali';

// 2–3 yaş ikinci boyama resmi (kova.ts, ikinci-tur-kurali.ts) ve Resimde Bul ikinci set verisi.
const kayit = (id: string) => existsSync('assets/alfabe/ses/' + id + '.mp3');

/** 40×40 beyaz resim: 2 px siyah çerçeve ve ortada dikey çizgi → içeride iki bölge, dışarıda yok. */
function ornek() {
  const w = 40, h = 40, l = new Uint8Array(w * h).fill(255);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (x < 2 || y < 2 || x >= w - 2 || y >= h - 2 || (x >= 19 && x <= 20)) l[y * w + x] = 0;
  }
  return { w, h, l };
}

describe('kova', () => {
  it('kontur bölgeleri ayırır; dokunulan bölge bulunur, kontura dokunuşta en yakın bölge seçilir', () => {
    const { w, h, l } = ornek();
    const b = bolgele(l, w, h);
    expect(b.alan.length - 1).toBe(2);
    const sol = bolgeBul(b, w, h, 8, 20), sag = bolgeBul(b, w, h, 30, 20);
    expect(sol).not.toBe(sag);
    expect(bolgeBul(b, w, h, 19.4, 20, 3)).toBe(sol);
    expect(bolgeBul(b, w, h, 0, 0, 1)).toBe(0);
  });
  it('boya bölgeden taşmaz; kontur siyah kalır, beyaz renge döner (çarpma)', () => {
    const { w, h, l } = ornek();
    const b = bolgele(l, w, h);
    const asil = new Uint8ClampedArray(w * h * 4);
    l.forEach((v, i) => { asil[i * 4] = asil[i * 4 + 1] = asil[i * 4 + 2] = v; asil[i * 4 + 3] = 255; });
    const cikti = new Uint8ClampedArray(asil);
    const sol = bolgeBul(b, w, h, 8, 20);
    const { p, d } = bolgePikselleri(b, w, h, sol, 8, 20);
    expect([...d].every((v, i) => i === 0 || v >= d[i - 1])).toBe(true);
    boya(cikti, asil, p, 0, p.length, [232, 71, 61]);
    const px = (x: number, y: number) => [...cikti.slice((y * w + x) * 4, (y * w + x) * 4 + 3)];
    expect(px(8, 20)).toEqual([232, 71, 61]);
    expect(px(30, 20)).toEqual([255, 255, 255]);
    expect(px(19, 20)).toEqual([0, 0, 0]);
  });
  it('büyük bölge kenara değmeyen ve yeterince geniş olandır; bitiş için çoğu boyanmalı', () => {
    const { w, h, l } = ornek();
    const b = bolgele(l, w, h);
    expect(buyukBolgeler(b, w * h, 0.1)).toHaveLength(2);
    expect(bitisSayisi(2)).toBe(2);
    expect(bitisSayisi(5)).toBe(3);
    expect(bitisSayisi(12)).toBe(8);
  });
});

describe('ikinci içerik', () => {
  it('sırayla döner: ilk açılış ilk içerik, ikincisi yeni, üçüncüsü yine ilk', () => {
    expect([0, 1, 2, 3].map(yeniTurMu)).toEqual([false, true, false, true]);
  });
  it('29 harfin her birine boyama resmi: Ceren kaydı var, sözcük o harfle başlar (Ğ içinde geçer)', () => {
    const harfler = JSON.parse(readFileSync('alfabe/src/harfler.json', 'utf8')) as { id: string; upper: string; example: string }[];
    expect(Object.keys(BOYAMA_RESIMLERI).sort()).toEqual(harfler.map(h => h.id).sort());
    for (const h of harfler) {
      const [dosya, ad, ses] = BOYAMA_RESIMLERI[h.id];
      expect(kayit(ses), ses).toBe(true);
      expect(existsSync('assets/alfabe/kelime/' + dosya + '.webp'), dosya).toBe(true);
      const kucuk = ad.toLocaleLowerCase('tr'), harf = h.upper.toLocaleLowerCase('tr');
      expect(h.upper === 'Ğ' ? kucuk.includes('ğ') : kucuk.startsWith(harf), ad).toBe(true);
      expect(kucuk).not.toBe(h.example.toLocaleLowerCase('tr'));
    }
    expect(kayit('boyama-resim-giris') && kayit('boyama-resim-bitti')).toBe(true);
  });
  it('Resimde Bul ikinci set: 1. ses grubunun 24 Ceren kaydı hazır; veri biçimi dört bölge', () => {
    for (const id of ['01', '17', '06', '24', '12', '15']) for (const i of [0, 1, 2, 3]) expect(kayit('bul2-' + id + '-' + i), id + '-' + i).toBe(true);
    const veri = JSON.parse(readFileSync('alfabe/src/resimde-bul-2.json', 'utf8')) as Record<string, { items: { name: string; points: string }[] }>;
    for (const [id, s] of Object.entries(veri)) {
      expect(s.items, id).toHaveLength(4);
      for (const n of s.items) expect(n.points.trim().split(/\s+/).length, id + ' ' + n.name).toBeGreaterThanOrEqual(3);
      expect(existsSync('assets/alfabe/resimde-bul-2/' + id + '.webp'), id).toBe(true);
    }
  });
});
