import { describe, expect, it } from 'vitest';
import BANYO_JSON from '../../assets/muzik/banyo.json';
import PAZAR_JSON from '../../assets/muzik/pazar.json';
import { BANYO_SARKI, BANYO_SOZ } from '../../macera/src/banyo-mantik';
import { PAZAR_SARKI, PAZAR_SOZ, SAYILAN, sayimPlani } from '../../pazar/src/sarki-plan';
import { hecele } from '../../ses-testi/src/analiz';
import { DUCK_ORAN, fonSeviyesi } from '../../src/audio/dosya-muzik';
import { hangiHece, hangiVurus, heceAnahtar, kelimeBaslari, sarkiTablosu, vurusaYakin, type SarkiJson, type SarkiTablosu } from '../../src/audio/sarki-kayit';

/** Sözlerin satır satır heceleri (Türkçe heceleme) */
const sozHeceleri = (soz: string[]) => soz.map((s) => s.split(/\s+/).flatMap((k) => hecele(k)));

const SARKILAR: [string, SarkiTablosu, string[], SarkiJson][] = [
  ['banyo', BANYO_SARKI, BANYO_SOZ, BANYO_JSON as SarkiJson],
  ['pazar', PAZAR_SARKI, PAZAR_SOZ, PAZAR_JSON as SarkiJson],
];

describe.each(SARKILAR)('şarkı tablosu: %s', (_ad, T, soz, json) => {
  it('JSON’daki bütün heceler ve vuruşlar tabloda, zamana göre sıralı', () => {
    expect(T.heceler).toHaveLength(json.heceler.length);
    expect(T.vuruslar).toHaveLength(json.vuruslar_ms.length);
    for (let i = 1; i < T.heceler.length; i++) expect(T.heceler[i].basMs).toBeGreaterThanOrEqual(T.heceler[i - 1].basMs);
    for (let i = 1; i < T.vuruslar.length; i++) expect(T.vuruslar[i]).toBeGreaterThan(T.vuruslar[i - 1]);
    expect(T.basMs).toBe(json.heceler[0].basla_ms);
    expect(T.sonMs).toBe(Math.max(...json.heceler.map((x) => x.bitir_ms)));
    expect(T.vurusMs).toBeCloseTo(60000 / json.bpm, 5);
    for (const x of T.heceler) expect(x.sureMs).toBeGreaterThanOrEqual(120);
  });

  it('kayıt tek geçiş: ilk hece ~1000 ms’de', () => {
    expect(T.basMs).toBeGreaterThanOrEqual(900);
    expect(T.basMs).toBeLessThanOrEqual(1100);
  });

  it('4 satır; her satırın hece sayısı sözlerle eşleşiyor', () => {
    const H = sozHeceleri(soz);
    expect(T.satirlar).toHaveLength(soz.length);
    T.satirlar.forEach((s, i) => expect(s.length, `satır ${i + 1}: ${soz[i]}`).toBe(H[i].length));
    expect(T.heceler).toHaveLength(H.flat().length);
  });

  it('hecelerin yazımı sözlerin hecelemesiyle aynı', () => {
    const H = sozHeceleri(soz);
    T.satirlar.forEach((s, i) => expect(s.map((x) => heceAnahtar(x.hece))).toEqual(H[i].map(heceAnahtar)));
  });

  it('kelime başları: sözün kelime sayısı kadar', () => {
    const kelime = soz.join(' ').split(/\s+/).length;
    const b = kelimeBaslari(soz);
    expect(b.size).toBe(kelime);
    expect(b.has(0)).toBe(true);
    expect(Math.max(...b)).toBeLessThan(T.heceler.length);
  });

  it('zaman → hece / vuruş', () => {
    expect(hangiHece(T, 0)).toBe(-1);
    expect(hangiHece(T, T.heceler[0].basMs)).toBe(0);
    expect(hangiHece(T, T.heceler[5].basMs + 1)).toBe(5);
    expect(hangiHece(T, 1e9)).toBe(T.heceler.length - 1);
    expect(hangiVurus(T.vuruslar, T.vuruslar[0] - 1)).toBe(-1);
    expect(hangiVurus(T.vuruslar, T.vuruslar[3])).toBe(3);
  });

  it('alkış: vuruşa yakın dokunuş sayılır, uzak olan sayılmaz (yumuşak tolerans)', () => {
    const v = T.vuruslar[4];
    expect(vurusaYakin(T.vuruslar, v + 150)).toEqual({ sira: 4, fark: 150 });
    expect(vurusaYakin(T.vuruslar, v - 200)?.sira).toBe(4);
    // iki vuruşun tam ortası: tolerans dışında
    const orta = (T.vuruslar[4] + T.vuruslar[5]) / 2;
    expect(vurusaYakin(T.vuruslar, orta)).toBeNull();
    expect(vurusaYakin(T.vuruslar, orta, 400)).not.toBeNull();
  });
});

describe('pazar şarkısı: sayılan meyveler', () => {
  const plan = sayimPlani(PAZAR_SARKI);
  it('1 elma, 2 armut, 3 çilek, 4 üzüm; sayı ve ad heceleri kayıtta bulunuyor, sırayla', () => {
    expect(plan.map((p) => [p.meyve, p.adet])).toEqual([
      ['elma', 1],
      ['armut', 2],
      ['cilek', 3],
      ['uzum', 4],
    ]);
    let once = -1;
    for (const p of plan) {
      expect(p.sayiHece).toBeGreaterThan(once);
      expect(p.adHece).toBeGreaterThan(p.sayiHece);
      once = p.adHece;
      expect(p.sureMs).toBeGreaterThanOrEqual(200);
    }
    expect(SAYILAN).toHaveLength(4);
  });
  it('meyve adları kayıtta doğru hecede ("el-ma", "ar-mut", "çi-lek", "ü-züm")', () => {
    const ad = (i: number) => PAZAR_SARKI.heceler.slice(plan[i].adHece, plan[i].adHece + 2).map((x) => heceAnahtar(x.hece)).join('');
    expect([0, 1, 2, 3].map(ad)).toEqual(['elma', 'armut', 'çilek', 'üzüm']);
  });
});

describe('tablo kurulumu (örnek JSON)', () => {
  it('sıralar, satır grupları, süreler', () => {
    const T = sarkiTablosu({
      bpm: 120,
      baslangic_ms: 1000,
      heceler: [
        { hece: 'b', satir: 0, basla_ms: 1500, bitir_ms: 1700, midi: 62, vurus: 0.5 },
        { hece: 'a', satir: 0, basla_ms: 1000, bitir_ms: 1400, midi: 60, vurus: 1 },
        { hece: 'c', satir: 1, basla_ms: 2000, bitir_ms: 2050, midi: 64, vurus: 0.5, tahmini: true },
      ],
      vuruslar_ms: [1500, 1000, 2000],
    });
    expect(T.heceler.map((x) => x.hece)).toEqual(['a', 'b', 'c']);
    expect(T.satirlar.map((s) => s.length)).toEqual([2, 1]);
    expect(T.heceler[0].sureMs).toBe(500); // sonraki heceye kadar
    expect(T.heceler[1].sureMs).toBe(200); // satır sonu: kendi bitişi
    expect(T.heceler[2].sureMs).toBe(120); // en az 120
    expect(T.heceler[2].tahmini).toBe(true);
    expect(T.vuruslar).toEqual([1000, 1500, 2000]);
    expect(T.vurusMs).toBe(500);
    expect(T.sonMs).toBe(2050);
  });
});

describe('fon müziği (menü, Ege): kısık, konuşurken düşer, sessize almaya uyar', () => {
  it('ducking ve sessize alma', () => {
    const acik = { muzik: true, seviye: 1 };
    expect(fonSeviyesi(acik, false, 0.3)).toBeCloseTo(0.3);
    expect(fonSeviyesi(acik, true, 0.3)).toBeCloseTo(0.3 * DUCK_ORAN);
    expect(fonSeviyesi({ muzik: false, seviye: 1 }, false, 0.3)).toBe(0);
    expect(fonSeviyesi({ muzik: true, seviye: 0.5 }, false, 0.4)).toBeCloseTo(0.2);
  });
});
