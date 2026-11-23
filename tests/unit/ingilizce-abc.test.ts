import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { ABC, abcPlani, abcSesleri, abcSesMetinleri, sesKaydi, sozKaydi, trenEksikTurlari, trenSesleri } from '../../ingilizce/src/ekranlar/abc-veri';

// Polly's ABC: 26 harf, her harfin sözcüğü o harfle başlar (X: içinde), insan figürü yok, plan ve kayıtlar.
const tohum = (n: number) => { let x = n * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const INSAN = ['queen', 'king', 'boy', 'girl', 'man', 'woman', 'baby', 'mom', 'dad', 'teacher', 'friend', 'sister', 'grandma', 'grandpa'];

describe("Polly's ABC · veri", () => {
  it('26 harf a…z, her sözcük harfiyle başlar (X: fox içinde); insan yok, çilek yok', () => {
    expect(ABC.map((x) => x.id).join('')).toBe('abcdefghijklmnopqrstuvwxyz');
    for (const x of ABC) {
      if (x.sonda) expect(x.soz.includes(x.id), x.id).toBe(true); else expect(x.soz.startsWith(x.id), x.id).toBe(true);
      expect(INSAN).not.toContain(x.soz);
      expect(x.soz).not.toBe('strawberry');
    }
  });
  it('var olan kelime resimleri diskte; yeni resimler Paket 27 adlarıyla', () => {
    for (const x of ABC) if (x.resim.startsWith('kelime/')) expect(existsSync('assets/ingilizce/' + x.resim + '.webp'), x.resim).toBe(true);
    expect(ABC.filter((x) => x.resim.startsWith('abc/')).map((x) => x.resim)).toEqual(['abc/igloo', 'abc/quilt', 'abc/umbrella', 'abc/van', 'abc/yo-yo']);
  });
});

describe("Polly's ABC · plan", () => {
  it('2–3 yaş yalnız tanıtım; 4 yaş + üç resimden bul; 5+ + büyük-küçük eşleştir (benzer harf çeldirici)', () => {
    for (let n = 0; n < 100; n++) {
      const bas = n % 26;
      expect(abcPlani('2-3', bas, 3, tohum(n)).every((t) => !t.bul && !t.eslestir)).toBe(true);
      for (const t of abcPlani('4', bas, 3, tohum(n))) { expect(t.bul).toHaveLength(3); expect(t.bul).toContain(t.harf); expect(new Set(t.bul).size).toBe(3); expect(t.eslestir).toBeUndefined(); }
      for (const t of abcPlani('5+', bas, 3, tohum(n))) { expect(t.eslestir).toHaveLength(3); expect(t.eslestir).toContain(t.harf); expect(new Set(t.eslestir).size).toBe(3); }
    }
    expect(abcPlani('5+', 1, 1, tohum(1))[0].eslestir).toContain('d'); // b'nin çeldiricisi d
    expect(abcPlani('4', 25, 3).map((t) => t.harf)).toEqual(['z', 'a', 'b']); // sona gelince başa döner
  });
  it('her kayıt ayrı ve diskte: harf adı, sesi, cümlesi, sözcüğü, yönergeler', () => {
    for (const s of abcSesMetinleri()) expect(existsSync('assets/ingilizce/ses/' + s.id + '.mp3'), s.id).toBe(true);
    for (const x of ABC) for (const id of [sesKaydi(x), sozKaydi(x)]) expect(existsSync('assets/ingilizce/ses/' + id + '.mp3'), id).toBe(true);
    for (const yas of ['2-3', '4', '5+'] as const) for (const id of abcSesleri(abcPlani(yas, 0, 26))) expect(existsSync('assets/ingilizce/ses/' + id + '.mp3'), id).toBe(true);
  });
});

describe('Alphabet Train', () => {
  it('eksik vagon: beş ardışık harf, eksik uçlarda değil, üç seçenek (biri doğru, ikisi dizide yok)', () => {
    for (let n = 0; n < 100; n++) {
      for (const t of trenEksikTurlari(3, tohum(n))) {
        const i = ABC.findIndex((x) => x.id === t.dizi[0]);
        expect(t.dizi).toEqual(ABC.slice(i, i + 5).map((x) => x.id));
        expect(t.dizi.indexOf(t.eksik)).toBeGreaterThan(0);
        expect(t.dizi.indexOf(t.eksik)).toBeLessThan(4);
        expect(t.secenekler).toContain(t.eksik);
        expect(t.secenekler.filter((x) => t.dizi.includes(x))).toEqual([t.eksik]);
      }
    }
  });
  it('trenin bütün kayıtları diskte', () => {
    for (const id of trenSesleri()) expect(existsSync('assets/ingilizce/ses/' + id + '.mp3'), id).toBe(true);
  });
});
