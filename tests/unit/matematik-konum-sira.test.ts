// Matematik · Lokum'la Saklambaç (konum) ve Kaydırak Sırası (sıra sayıları): konum-sira.ts kuralları.
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/sozler.json';
import {
  BIRAKMA, DOSTLAR, ILISKILER, KAYDIRAK_CIZIMLERI, KAYDIRAK_SOZ, KONAK, KOYMA, LOKUM_CIKTI, LOKUM_SAKLI, OYUNCAK_BASI, SAKLAMBAC_CIZIMLERI,
  SAKLAMBAC_SOZ, SAKLANMA_YERI, SIRA_X, YER_KUTUSU, YERLER, birakmaIliskisi, cevapSirasi, dokunulanYer, duzSozler, iliskiNo, kaydirakTuru,
  saklambacTuru, siraIlerle, siraKartlari, soruDizisi, soruSozu, type Kutu,
} from '../../matematik/src/konum-sira';
import { EK, EK_TURLAR } from '../../matematik/src/tur-sirasi';
import { YENI_CIZIMLER, YENI_KOSE, YENI_SOZ } from '../../matematik/src/yeni-turlar';
import { BECERI_TURLERI } from '../../matematik/src/veli-ozet';

const YOLLAR = ['minik', 'dort', 'bes'] as const;
const merkez = (b: Kutu) => [b.x + b.w / 2, b.y + b.h / 2] as const;
const kesisir = (a: Kutu, b: Kutu) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe('Matematik · Lokum\'la Saklambaç', () => {
  it('her yaşta iki bulma ve 2–3 yaşta bir, büyüklerde iki koyma; bulmalar ayrı yerde, koymalar ayrı eşyayla', () => {
    for (const yol of YOLLAR)
      for (let t = 0; t < 8; t++) {
        const s = saklambacTuru(yol, t);
        expect(s.bul).toHaveLength(2);
        expect(new Set(s.bul.map((r) => SAKLANMA_YERI[r])).size).toBe(2);
        expect(s.koy).toHaveLength(yol === 'minik' ? 1 : 2);
        expect(new Set(s.koy.map((r) => KOYMA[r].oyuncak)).size).toBe(s.koy.length);
      }
  });

  it('2–3 yaşta yalnız içinde, altında, arkasında ve üstünde; 4 ve 5+ yaşta önünde, yanında, arasında da var', () => {
    const kullanilan = (yol: (typeof YOLLAR)[number]) => new Set(Array.from({ length: 6 }, (_, t) => saklambacTuru(yol, t)).flatMap((s) => [...s.bul, ...s.koy]));
    expect([...kullanilan('minik')].sort()).toEqual(['altinda', 'arkasinda', 'icinde', 'ustunde']);
    for (const yol of ['dort', 'bes'] as const) for (const r of ['onunde', 'yaninda', 'arasinda']) expect(kullanilan(yol).has(r as never), yol + ' ' + r).toBe(true);
    // 5+ zor basamakta karşıt çift: masanın altı ve masanın üstü aynı turda.
    expect(saklambacTuru('bes', 2).koy).toEqual(['altinda', 'ustunde']);
  });

  it('konu defterindeki zor konum öne alınır (zor basamakta)', () => {
    // 5+ 3. geliş "arkasında, içinde"; defterde "arasında" varsa onu içeren takım gelir.
    expect(saklambacTuru('bes', 2).bul).not.toContain('arasinda');
    expect(saklambacTuru('bes', 2, [iliskiNo('arasinda')]).bul).toContain('arasinda');
    expect(ILISKILER.map(iliskiNo)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('bırakma alanları birbirine değmez; her konağın ortası kendi alanında, eşyanın başlangıcı hiçbir alanda değil', () => {
    for (const a of ILISKILER) for (const b of ILISKILER) if (a < b) expect(kesisir(BIRAKMA[a], BIRAKMA[b]), a + ' ' + b).toBe(false);
    for (const r of ILISKILER) expect(birakmaIliskisi(...merkez(KONAK[r])), r).toBe(r);
    for (const o of ['top', 'ayicik'] as const) expect(birakmaIliskisi(...merkez(OYUNCAK_BASI[o])), o).toBeUndefined();
    // Her yerin dokunma kutusu ayrı; yerin ortası kendisini verir.
    for (const y of YERLER) expect(dokunulanYer(...merkez(YER_KUTUSU[y]))).toBe(y);
  });

  it('Lokum saklıyken yerin çiziminin ya da kırpmanın ardında, çıkınca yerinden görünür', () => {
    // Sandık ve minderler: saklıyken kırpma alanının altında (hiç görünmez), çıkınca tepesi yerin üst kenarının üstünde.
    for (const y of ['sandik', 'minder'] as const) {
      expect(LOKUM_SAKLI[y].y).toBeGreaterThanOrEqual(YER_KUTUSU[y].y + YER_KUTUSU[y].h);
      expect(LOKUM_CIKTI[y].y).toBeLessThan(YER_KUTUSU[y].y);
    }
    // Masa ve berjer: saklıyken tamamen yerin kutusunda; çıkınca yanından taşar.
    for (const y of ['masa', 'koltuk'] as const) {
      const s = LOKUM_SAKLI[y], k = YER_KUTUSU[y];
      expect(s.x >= k.x && s.x + s.w <= k.x + k.w && s.y >= k.y && s.y + s.h <= k.y + k.h, y).toBe(true);
      expect(LOKUM_CIKTI[y].x === s.x, y).toBe(false);
    }
  });

  it('sözler: bulma, bulundu, koy ve kondu sözleri konumla aynı; "Sobe!" ile bulunur', () => {
    for (const r of ['icinde', 'altinda', 'arkasinda', 'arasinda'] as const) {
      expect(sozler[SAKLAMBAC_SOZ.bul[r]]).toMatch(/^Lokum .+! Onu bul\.$/);
      expect(sozler[SAKLAMBAC_SOZ.buldun[r]]).toMatch(/^Sobe! Lokum .+(ymiş|ymış)\.$/);
    }
    const ek: Record<string, string> = { icinde: 'içine', ustunde: 'üstüne', altinda: 'altına', arkasinda: 'arkasına', onunde: 'önüne', yaninda: 'yanına', arasinda: 'arasına' };
    for (const r of ILISKILER) {
      expect(sozler[SAKLAMBAC_SOZ.koy[r]], r).toContain(ek[r] + ' koy.');
      expect(sozler[SAKLAMBAC_SOZ.koy[r]], r).toMatch(KOYMA[r].oyuncak === 'top' ? /^Topu / : /^Ayıcığı /);
      expect(sozler[SAKLAMBAC_SOZ.kondu[r]], r).toMatch(KOYMA[r].oyuncak === 'top' ? /^Evet! Top / : /^Evet! Ayıcık /);
    }
    expect([SAKLAMBAC_SOZ.bir, SAKLAMBAC_SOZ.iki, SAKLAMBAC_SOZ.uc].map((i) => sozler[i])).toEqual(['Bir.', 'İki.', 'Üç.']);
  });
});

describe('Matematik · Kaydırak Sırası', () => {
  it('yaşa göre arkadaş sayısı: 3, 4, 5; sorular sıranın içinde; 2–3 yaşta "kaçıncı" yok', () => {
    for (const yol of YOLLAR)
      for (let t = 0; t < 8; t++) {
        const k = kaydirakTuru(yol, t), n = yol === 'minik' ? 3 : yol === 'dort' ? 4 : 5;
        expect(k.dizi).toHaveLength(n);
        expect(new Set(k.dizi).size).toBe(n);
        k.sorular.forEach((q, i) => {
          const d = soruDizisi(k, i), c = cevapSirasi(d, q);
          expect(c).toBeGreaterThanOrEqual(1);
          expect(c).toBeLessThanOrEqual(n);
          expect(sozler[soruSozu(d, q)], yol + ' ' + t + ' ' + i).toBeTruthy();
          if (yol !== 'bes') expect(q.tur).not.toBe('kacinci');
        });
        expect(k.sorular).toHaveLength(yol === 'minik' ? 2 : 3);
      }
    expect(kaydirakTuru('bes', 0).sorular.some((q) => q.tur === 'kacinci')).toBe(true);
  });

  it('birinci kayınca sıranın sonuna geçer; herkes bir öne ilerler', () => {
    expect(siraIlerle(['kino', 'lokum', 'mino'])).toEqual(['lokum', 'mino', 'kino']);
    const k = kaydirakTuru('bes', 0);
    expect(soruDizisi(k, 1)).toEqual(['lokum', 'mino', 'zipzip', 'bulut', 'kino']);
    // "Kaçıncı?" sorusu o anki dizide sorulan sıradaki arkadaşı adıyla sorar: 2. soruda 4. sırada Bulut.
    expect(sozler[soruSozu(soruDizisi(k, 1), k.sorular[1])]).toBe('Bulut kaçıncı sırada?');
    expect(siraKartlari(5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('art arda iki soru aynı cevabı istemez (sıra ilerlese de)', () => {
    for (const yol of YOLLAR)
      for (let t = 0; t < 6; t++) {
        const k = kaydirakTuru(yol, t), c = k.sorular.map((q, i) => cevapSirasi(soruDizisi(k, i), q) + ':' + q.tur);
        for (let i = 1; i < c.length; i++) expect(c[i], yol + ' ' + t).not.toBe(c[i - 1]);
      }
  });

  it('sıra yerleri fona sığar, arkadaşlar arası gövde eninden geniş', () => {
    for (let i = 1; i < SIRA_X.length; i++) expect(SIRA_X[i] - SIRA_X[i - 1]).toBeGreaterThan(170);
    expect(SIRA_X.at(-1)! + 160).toBeLessThanOrEqual(1672);
    for (const n of [1, 2, 3, 4, 5]) expect(sozler[KAYDIRAK_SOZ.sira[n]]).toMatch(/^(Birinci|İkinci|Üçüncü|Dördüncü|Beşinci)\.$/);
    for (const d of DOSTLAR) expect(sozler[KAYDIRAK_SOZ.kac[d]]).toMatch(/ kaçıncı sırada\?$/);
  });
});

describe('Matematik · iki yeni turun bağlantısı', () => {
  it('ek tur kodları, yaş sıraları, oyuncaklar ve beceriler', () => {
    expect([EK.saklambac, EK.kaydirak]).toEqual([122, 123]);
    for (const yol of YOLLAR) {
      expect(EK_TURLAR[yol].sekil).toContain(EK.saklambac);
      expect(EK_TURLAR[yol].fener).toContain(EK.kaydirak);
    }
    expect(YENI_KOSE.saklambac).toBe('sekil');
    expect(YENI_KOSE.kaydirak).toBe('fener');
    expect(BECERI_TURLERI.sekil.sekil).toContain('saklambac');
    expect(BECERI_TURLERI.sayma.fener).toContain('kaydirak');
  });

  it('çizim listeleri (sayfa başına en çok 8) ve 53 Ceren kaydı yerinde', () => {
    expect(YENI_CIZIMLER.saklambac).toEqual(SAKLAMBAC_CIZIMLERI);
    expect(YENI_CIZIMLER.kaydirak).toEqual(KAYDIRAK_CIZIMLERI);
    expect(SAKLAMBAC_CIZIMLERI).toHaveLength(12);
    expect(KAYDIRAK_CIZIMLERI).toHaveLength(11);
    const nolar = [...Object.values(YENI_SOZ.saklambac), ...Object.values(YENI_SOZ.kaydirak)] as number[];
    expect(Object.values(duzSozler(SAKLAMBAC_SOZ))).toEqual(Object.values(YENI_SOZ.saklambac));
    for (let i = 266; i <= 318; i++) expect(nolar, String(i)).toContain(i);
    for (const i of nolar) {
      expect(sozler[i], String(i)).toBeTruthy();
      expect(existsSync('assets/matematik/ses/ses-' + i + '.mp3'), 'ses-' + i).toBe(true);
    }
    expect(sozler.length).toBeGreaterThanOrEqual(319);
  });
});
