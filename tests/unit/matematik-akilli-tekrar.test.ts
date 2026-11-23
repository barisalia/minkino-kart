import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/sozler.json';
import { EN_COK_ONE, OGRENILDI, dogruYaz, oneAl, yanlisYaz, zorKonuListesi, zorlananSayilar, type Defter } from '../../matematik/src/akilli-tekrar';
import { enBuyuk, hizliAdetler, hizliSorular } from '../../matematik/src/hizli-gozler';

describe('Matematik · akıllı tekrar', () => {
  it('yanlış yazılır, en son takıldığı sayı önce gelir; yanlıştan sonra iki doğruyla defterden düşer', () => {
    let d: Defter = {};
    d = yanlisYaz(d, 4);
    d = yanlisYaz(d, 2);
    d = yanlisYaz(d, 4);
    expect(zorlananSayilar(d)).toEqual([4, 2]);
    expect(d[4].y).toBe(2);
    d = dogruYaz(d, 2);
    expect(zorlananSayilar(d)).toEqual([4, 2]);
    for (let i = 1; i < OGRENILDI; i++) d = dogruYaz(d, 2);
    expect(zorlananSayilar(d)).toEqual([4]);
    // Doğrudan sonra yeniden yanlış: doğrular sıfırlanır.
    d = dogruYaz(d, 4);
    d = yanlisYaz(d, 4);
    expect(d[4].d).toBe(0);
    // Defterde olmayan sayının doğrusu bir şey değiştirmez.
    expect(dogruYaz(d, 9)).toBe(d);
  });

  it('öne alma: ısınma sorusu önde kalır, zor sayılar hemen ardından; uzunluk aynı, aynı sayı iki kez yok', () => {
    expect(oneAl([3, 5, 2, 4], [], 5)).toEqual([3, 5, 2, 4]);
    expect(oneAl([3, 5, 2, 4], [1], 5)).toEqual([3, 1, 5, 2]);
    expect(oneAl([3, 5, 2, 4], [2, 1, 4], 5)).toEqual([3, 2, 1, 5]);
    // Turda zaten olan zor sayı yalnız öne taşınır.
    expect(oneAl([3, 5, 2, 4], [4], 5)).toEqual([3, 4, 5, 2]);
    // Yaşın aralığı dışındaki sayı (2–3 yaşta 7) öne alınmaz.
    expect(oneAl([2, 1, 3], [7], 3)).toEqual([2, 1, 3]);
    expect(oneAl([2, 1, 3], [1, 3], 3)).toEqual([2, 1, 3]);
    for (const yol of ['minik', 'dort', 'bes'] as const)
      for (const n of [16, 17])
        for (let z = 1; z <= enBuyuk(yol); z++) {
          const kendi = hizliAdetler(yol, n);
          const plan = oneAl(kendi, [z, (z % enBuyuk(yol)) + 1], enBuyuk(yol));
          expect(plan).toHaveLength(kendi.length);
          expect(new Set(plan).size).toBe(plan.length);
          expect(plan.slice(0, 1 + EN_COK_ONE)).toContain(z);
          for (let i = 1; i < plan.length; i++) expect(plan[i]).not.toBe(plan[i - 1]);
          // Sorular plana göre kurulur; seçeneklerde doğru cevap var.
          const sorular = hizliSorular(yol, n, 0, plan);
          expect(sorular.map((s) => s.adet)).toEqual(plan);
          for (const s of sorular) expect(s.secenek).toContain(s.adet);
        }
  });

  it('Ceren’in karşılama sözü kayıtlı', () => {
    const i = (sozler as string[]).indexOf('Bu sayıyla bir daha oynayalım!');
    expect(i).toBe(119);
    expect(existsSync('assets/matematik/ses/ses-119.mp3')).toBe(true);
  });

  it('konu defteri (Şekiller, Örüntü, Ölçü, sınıflama): "alan:konu" anahtarı, en son takılan önce, iki doğruyla düşer', () => {
    let d: Defter = {};
    d = yanlisYaz(d, 'sekil:dikdortgen');
    d = yanlisYaz(d, 'olcu:uzun-kisa');
    d = yanlisYaz(d, 'siniflama:boy');
    expect(zorKonuListesi(d)).toEqual([
      { alan: 'siniflama', konu: 'boy' }, { alan: 'olcu', konu: 'uzun-kisa' }, { alan: 'sekil', konu: 'dikdortgen' },
    ]);
    for (let i = 0; i < OGRENILDI; i++) d = dogruYaz(d, 'olcu:uzun-kisa');
    expect(zorKonuListesi(d).map((z) => z.konu)).toEqual(['boy', 'dikdortgen']);
    // Hiç zorlanmadığı konudaki doğru defteri değiştirmez.
    expect(dogruYaz(d, 'oruntu:ses')).toBe(d);
  });
});
