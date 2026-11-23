import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

// Harf Atölyesi sözcük havuzu (YOL-HARITASI madde 6, Astra H6): liste ve Ceren kayıtları.
interface Hece { hece: string; ses: string; kayit: string }
interface Sozcuk { sozcuk: string; harf: string; resim: string; enKucukYas: string; ses: string; kayit: string; heceler: Hece[] }
const tum = JSON.parse(readFileSync('ekip/alfabe/sozcuk-havuzu.json', 'utf8')).sozcukler as (Sozcuk & { paket?: string })[];
// H6 (57 sözcük) ve sonradan gelen paketler (paket alanı; Harf-H8: E, İ, U, Ü'yü 5 resimli sözcüğe çıkaran 7 sözcük).
const havuz = tum.filter((s) => !s.paket);
const h8 = tum.filter((s) => s.paket === 'Harf-H8');
const H6 = 'ari ayva balon bardak ceket cuzdan cicek corap dinozor duduk ekmek eldiven fare firca gozluk gitar agac yagmur horoz hamak irmak istakoz inci incir jip jaguar kalem kus leylek lolipop maymun mum nota nilufer okul orkide orumcek odul pasta papagan robot roket simit salyangoz seker sise tavsan tencere ugur-bocegi ukulele utu valiz visne yumurta yildiz zebra zeytin'.split(' ');
const kayit = (id: string) => existsSync('assets/alfabe/ses/' + id + '.mp3');

describe('Harf Atölyesi sözcük havuzu', () => {
  it('57 sözcük, resim adları Astra H6 brief\'iyle birebir; çilek yok', () => {
    expect(havuz.map((s) => s.resim)).toEqual(H6.map((a) => 'assets/alfabe/kelime/' + a + '.webp'));
    expect(havuz.some((s) => /çilek/i.test(s.sozcuk))).toBe(false);
  });
  it('29 harfin her birine sözcük; Ü dışında her harfe iki', () => {
    const say = new Map<string, number>();
    for (const s of havuz) say.set(s.harf, (say.get(s.harf) ?? 0) + 1);
    expect(say.size).toBe(29);
    for (const [harf, n] of say) expect(n, harf).toBe(harf === 'Ü' ? 1 : 2);
  });
  it('Harf-H8: 7 sözcük (erik, etek, iplik, iskele, uskumru, uydu, üniforma)', () => {
    expect(h8.map((s) => s.sozcuk)).toEqual(['erik', 'etek', 'iplik', 'iskele', 'uskumru', 'uydu', 'üniforma']);
  });
  it('heceler sözcüğü kurar; yaş 2-3, 4 ya da 5+', () => {
    for (const s of tum) {
      expect(s.heceler.map((h) => h.hece).join(''), s.sozcuk).toBe(s.sozcuk.replace(/\s/g, ''));
      expect(['2-3', '4', '5+']).toContain(s.enKucukYas);
    }
  });
  it('her sözcüğün ve her hecenin Ceren kaydı diskte', () => {
    for (const s of tum) {
      expect(kayit(s.ses), s.ses).toBe(true);
      for (const h of s.heceler) expect(kayit(h.ses), h.ses).toBe(true);
    }
  });
});
