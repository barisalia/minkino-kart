// Matematik · Kino Ailesinin Sofrası (aile-sofrasi.ts): büyüklüğe göre eşleme ve sıralama; 2–3 yaş önceliği.
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/sozler.json';
import {
  BEKLEME_Y, DOKUNMA, ESYA_TUVALI, KISI_BOYU, KISI_X, SOFRA_CIZIMLERI, SOFRA_SOZ, birakmaAlani, beklemeX, boylar, dogruSozu, sofraTuru,
  sofradakiler, takimSozu, uyar, yanlisSozu, type Boy, type Kisi,
} from '../../matematik/src/aile-sofrasi';
import { EK, EK_TURLAR } from '../../matematik/src/tur-sirasi';
import { YENI_CIZIMLER, YENI_KOSE, YENI_SOZ } from '../../matematik/src/yeni-turlar';
import { BECERI_TURLERI } from '../../matematik/src/veli-ozet';

const YOLLAR = ['minik', 'dort', 'bes'] as const;
const j = (x: unknown) => JSON.stringify(x);

describe('Matematik · Kino Ailesinin Sofrası', () => {
  it('her eşyada büyük > orta > küçük; büyük Baba\'nın, orta Anne\'nin, küçük Kino\'nun', () => {
    for (const e of ['kase', 'bardak', 'kasik'] as const) {
      const alan = (b: Boy) => ESYA_TUVALI[e][b].w * ESYA_TUVALI[e][b].h;
      expect(alan('buyuk')).toBeGreaterThan(alan('orta'));
      expect(alan('orta')).toBeGreaterThan(alan('kucuk'));
    }
    expect(KISI_BOYU).toEqual({ baba: 'buyuk', anne: 'orta', kino: 'kucuk' });
    expect(uyar('kucuk', 'kino')).toBe(true);
    expect(uyar('buyuk', 'kino')).toBe(false);
  });

  it('2–3 yaş: yalnız Baba ve Kino, iki boy, iki takım; 4 yaş üç boy iki takım; 5+ üç boy üç takım', () => {
    expect(sofradakiler('minik')).toEqual(['baba', 'kino']);
    expect(boylar('minik')).toEqual(['buyuk', 'kucuk']);
    for (const yol of YOLLAR)
      for (let t = 0; t < 6; t++) {
        const s = sofraTuru(yol, t);
        expect(s.takimlar).toHaveLength(yol === 'bes' ? 3 : 2);
        expect(new Set(s.takimlar).size).toBe(s.takimlar.length);
        for (const d of s.dizilisler) {
          expect([...d].sort()).toEqual([...boylar(yol)].sort());
          // Bekleyen sıra hiçbir zaman sofradakilerin sırası (büyükten küçüğe) değil: çocuk boya bakarak eşler.
          expect(j(d)).not.toBe(j(sofradakiler(yol).map((k) => KISI_BOYU[k])));
        }
        if (t > 0) expect(j(s)).not.toBe(j(sofraTuru(yol, t - 1)));
      }
  });

  it('sözler doğru kişiyi ve boyu söyler; yanlışın nedeni kişiye göre', () => {
    expect(sozler[dogruSozu('baba', 'minik')]).toBe("Baba'ya büyüğü!");
    expect(sozler[dogruSozu('kino', 'dort')]).toBe("Kino'ya en küçüğü!");
    expect(sozler[dogruSozu('anne', 'bes')]).toBe("Anne'ye ortancası!");
    const y = (b: Boy, k: Kisi) => sozler[SOFRA_SOZ.yanlis[yanlisSozu(b, k)]];
    expect(y('buyuk', 'kino')).toMatch(/Kino'ya çok büyük/);
    expect(y('orta', 'kino')).toMatch(/Kino'ya çok büyük/);
    expect(y('kucuk', 'baba')).toMatch(/Baba'ya çok küçük/);
    expect(y('buyuk', 'anne')).toMatch(/Anne'ye çok büyük/);
    expect(y('kucuk', 'anne')).toMatch(/Anne için çok küçük/);
    expect(sozler[takimSozu('kase', 'minik')]).toMatch(/büyük kâse büyüğe, küçük kâse küçüğe/);
    expect(sozler[takimSozu('kasik', 'bes')]).toMatch(/büyük, orta, küçük/);
    expect(sozler[SOFRA_SOZ.afiyet]).toBe('Afiyet olsun!');
  });

  it('kişilerin bırakma alanları birbirine değmez; bekleyen eşyaların ortası hiçbir alanda değil; dokunma kutusu ≥ 170', () => {
    for (const yol of YOLLAR) {
      const xs = Object.values(KISI_X[yol]) as number[];
      for (let i = 1; i < xs.length; i++) expect(birakmaAlani(xs[i - 1]).x + birakmaAlani(xs[i - 1]).w).toBeLessThanOrEqual(birakmaAlani(xs[i]).x);
      for (const bx of beklemeX(yol === 'minik' ? 2 : 3)) {
        const y = BEKLEME_Y - DOKUNMA / 2;
        for (const x of xs) { const a = birakmaAlani(x); expect(bx >= a.x && bx <= a.x + a.w && y >= a.y && y <= a.y + a.h).toBe(false); }
      }
    }
  });

  it('bağlantı: ek tur 124 her yaşta Ölçü\'nün sonunda; çizimler (sayfa başına ≤ 8) ve 17 Ceren kaydı yerinde', () => {
    expect(EK.sofra).toBe(124);
    for (const yol of YOLLAR) expect(EK_TURLAR[yol].olcu.at(-1)).toBe(EK.sofra);
    expect(YENI_KOSE.sofra).toBe('olcu');
    expect(BECERI_TURLERI.olcme.olcu).toContain('sofra');
    expect(YENI_CIZIMLER.sofra).toEqual(SOFRA_CIZIMLERI);
    expect(SOFRA_CIZIMLERI).toHaveLength(17);
    const nolar = Object.values(YENI_SOZ.sofra) as number[];
    for (let i = 319; i <= 335; i++) expect(nolar, String(i)).toContain(i);
    for (const i of nolar) { expect(sozler[i], String(i)).toBeTruthy(); expect(existsSync('assets/matematik/ses/ses-' + i + '.mp3'), 'ses-' + i).toBe(true); }
    expect(sozler.length).toBeGreaterThanOrEqual(336);
  });
});
