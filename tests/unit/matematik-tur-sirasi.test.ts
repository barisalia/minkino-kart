import { describe, expect, it } from 'vitest';
import { ESKI_SON, SIRALAR, adimiTasi, turTuru, yolSonu, type Kose, type Yol } from '../../matematik/src/tur-sirasi';

const YOLLAR: Yol[] = ['minik', 'dort', 'bes'];
const KOSELER: Kose[] = ['sayi', 'sekil', 'olcu', 'fener'];

describe('Matematik tur sırası: aynı iş iki kez olmasın, gereksiz uzamasın', () => {
  for (const yol of YOLLAR)
    for (const k of KOSELER) {
      const sira = SIRALAR[yol][k];
      const turler = sira.map((n, i) => turTuru(k, n, i, sira.length));
      it(yol + ' · ' + k + ': 6–10 tur, her tür en çok iki kez, arka arkaya hiç', () => {
        expect(sira.length).toBeGreaterThanOrEqual(6);
        expect(sira.length).toBeLessThanOrEqual(10);
        expect(sira.length).toBeLessThan(ESKI_SON);
        // 0–15 eski tur numaraları; Sayı masasında 16–17 Hızlı Gözler.
        for (const n of sira) expect(Number.isInteger(n) && n >= 0 && (n < ESKI_SON || (k === 'sayi' && (n === 16 || n === 17)))).toBe(true);
        const sayim = new Map<string, number>();
        for (const t of turler.flatMap((t) => t.split('+'))) sayim.set(t, (sayim.get(t) ?? 0) + 1);
        for (const [t, adet] of sayim) expect(adet, t).toBeLessThanOrEqual(2);
        for (let i = 1; i < turler.length; i++) {
          const ortak = turler[i].split('+').filter((t) => turler[i - 1].split('+').includes(t));
          expect(ortak, i + '. tur').toEqual([]);
        }
      });
    }

  it('Şekil evi Ay gezginiyle biter, Fener tiyatrosu örüntüyle başlar; 2–3 yaşta rakam yazma ve "en az" yok', () => {
    for (const yol of YOLLAR) {
      const sekil = SIRALAR[yol].sekil;
      expect(turTuru('sekil', sekil.at(-1)!, sekil.length - 1, sekil.length)).toBe('gezgin');
      expect(turTuru('fener', SIRALAR[yol].fener[0], 0)).toBe('oruntu');
      // Yeniden oynayışta ilk tur gene örüntüdür (oyna: ilk oyun yalnız ilk seferde).
      expect(turTuru('fener', SIRALAR[yol].fener[0])).toBe('oruntu');
    }
    // 5+ Sayı masası Ceren'in 1–10 dersinden sonra gelir: beş boncukla başlar, 10 − 4 ile biter.
    expect(SIRALAR.bes.sayi[0]).toBe(6);
    expect(SIRALAR.bes.sayi.at(-1)).toBe(15);
    // 2–3 yaşta rakam yazma (eşle) ve "en az" yok.
    expect(SIRALAR.minik.sayi.map((n) => turTuru('sayi', n))).not.toContain('esle');
    expect(SIRALAR.minik.olcu.filter((n) => [6, 15].includes(n))).toEqual([]);
  });

  it('Eski 16 turluk kayıt oranıyla taşınır; sona ulaşmış ya da sınırı aşan kayıt hatıraya geçer', () => {
    expect(adimiTasi(0, false, ESKI_SON, 9)).toEqual({ adim: 0, hatira: false });
    expect(adimiTasi(8, false, ESKI_SON, 9)).toEqual({ adim: 4, hatira: false });
    expect(adimiTasi(15, false, ESKI_SON, 6)).toEqual({ adim: 5, hatira: false });
    expect(adimiTasi(16, false, ESKI_SON, 6)).toEqual({ adim: 6, hatira: true });
    expect(adimiTasi(16, true, ESKI_SON, 10)).toEqual({ adim: 10, hatira: true });
    // Hatırası olan ve yeniden oynayan çocuğun hatırası korunur.
    expect(adimiTasi(3, true, ESKI_SON, 8)).toEqual({ adim: 1, hatira: true });
    // Yeni sırada sınırı aşan kayıt (sıra kısalırsa): hatıraya.
    expect(adimiTasi(9, false, 9, 6)).toEqual({ adim: 6, hatira: true });
    for (const yol of YOLLAR)
      for (const k of KOSELER)
        for (let a = 0; a < ESKI_SON; a++) {
          const y = adimiTasi(a, false, ESKI_SON, yolSonu(yol, k));
          expect(y.adim).toBeLessThan(yolSonu(yol, k));
        }
  });
});
