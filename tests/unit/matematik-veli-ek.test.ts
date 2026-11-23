import { describe, expect, it } from 'vitest';
import { ekAcik } from '../../matematik/src/ek-turlar';
import { etkinSira, SIRALAR } from '../../matematik/src/tur-sirasi';
import { veliOzeti } from '../../matematik/src/veli-ozet';

// Ek turlar açıkken (Astra'nın çizimleri ve Ceren'in sözleri yerinde; uygulamadaki durum) veli özeti uzun sırayı sayar.
const depo = (kayitlar: Record<string, unknown> = {}) => (anahtar: string) => (anahtar in kayitlar ? JSON.stringify(kayitlar[anahtar]) : null);

describe('Matematik veli sayfası · ek turlu sıra', () => {
  it('oyuncakların tur sayısı uzun sıradan (açık ek turlar; çizimi gelmeyen sayılmaz)', () => {
    const o = veliOzeti({ yas: 5, oku: depo() });
    const acik = (['sayi', 'sekil', 'olcu', 'fener'] as const).map((k) => etkinSira('bes', k, ekAcik).length);
    expect(o.oyuncaklar.map((t) => t.toplam)).toEqual(acik);
    expect(o.turlar.toplam).toBe(acik.reduce((a, b) => a + b, 0));
    // Sayı masası en az 17 (Roket'in çizimleri gelince 18).
    expect(acik[0]).toBeGreaterThanOrEqual(17);
  });

  it('eski (sürüm 2) kayıtla bitirmiş çocuk: hatırası kalır, yeni turlarda görünür; yarım kalan aynı yerden', () => {
    const o = veliOzeti({ yas: 5, oku: depo({
      'minkino-matematik-1-sekil': { adim: SIRALAR.bes.sekil.length, yer: 0, secimler: [], hatira: true, surum: 2 },
      'minkino-matematik-1-fener': { adim: 3, yer: 0, secimler: [], hatira: false, surum: 2 },
    }) });
    const sekil = o.oyuncaklar.find((t) => t.id === 'sekil')!;
    // Toplam açık ek turlara göre (Kelebeğin Kanadı 22 Kasım'da açıldı; M33–M37 çizimleri gelince uzar).
    const sekilBoyu = etkinSira('bes', 'sekil', ekAcik).length;
    expect(sekilBoyu).toBeGreaterThanOrEqual(13);
    expect(sekil).toMatchObject({ hatira: true, bitti: true, tamam: 9, toplam: sekilBoyu, yazi: 'Bitirdi · yeni turlar (9/' + sekilBoyu + ')' });
    const fener = etkinSira('bes', 'fener', ekAcik).length;
    expect(o.oyuncaklar.find((t) => t.id === 'fener')).toMatchObject({ tamam: 3, toplam: fener, yazi: '3 / ' + fener + ' tur' });
  });
});
