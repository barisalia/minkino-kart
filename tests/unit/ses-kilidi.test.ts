/**
 * SES KİLİDİ (Barış onaylı, 2026-09-26, commit eddd6aa sonrası):
 * Sesli Maceralar'daki üfleme algılaması bu hâliyle KUSURSUZ kabul edildi. Konuşma, "çıt" gibi kısa sesler,
 * TV/müzik balonu şişirmemeli. Bu test kırmızıysa biri algılamayı değiştirmiştir: GERİ ALIN.
 * Değiştirmek gerekiyorsa önce Barış'a sorun; onay alınırsa bu testi de bilerek güncelleyin (ekip/SES-SISTEMI.md).
 */
import { describe, expect, it } from 'vitest';
import { UflemeBulucu, ozellikCikar, type Ayar } from '../../ses-testi/src/analiz';
import analizKaynak from '../../ses-testi/src/analiz.ts?raw';
import bolumKaynak from '../../macera/src/dogumgunu.ts?raw';

const SR = 48000;
const KARE = 1024;

function rastgele(tohum: number) {
  let s = tohum >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
}
const gurultu = (sn: number, genlik: number, tohum = 1) => {
  const r = rastgele(tohum);
  return Float32Array.from({ length: Math.round(sn * SR) }, () => r() * genlik);
};
const nefes = (sn: number, genlik = 0.25) => {
  const r = rastgele(7);
  let y = 0;
  return Float32Array.from({ length: Math.round(sn * SR) }, () => (y = y * 0.97 + r() * 0.3) * genlik);
};
const ton = (sn: number, f: number, genlik = 0.3) => {
  let faz = 0;
  return Float32Array.from({ length: Math.round(sn * SR) }, () => {
    faz += (2 * Math.PI * f) / SR;
    return genlik * (Math.sin(faz) + 0.5 * Math.sin(2 * faz) + 0.3 * Math.sin(3 * faz));
  });
};
const birlestir = (...p: Float32Array[]) => {
  const out = new Float32Array(p.reduce((a, b) => a + b.length, 0));
  let i = 0;
  for (const x of p) (out.set(x, i), (i += x.length));
  return out;
};
function basladiSayisi(sinyal: Float32Array) {
  const a: Ayar = { taban: -62, duyarlilik: 0, kare: KARE / SR };
  const u = new UflemeBulucu(a);
  let n = 0;
  for (let i = 0; i + KARE <= sinyal.length; i += KARE) if (u.kare(ozellikCikar(sinyal.subarray(i, i + KARE), SR)).basladi) n++;
  return n;
}

describe('SES KİLİDİ: üfleme algılaması (Barış onaylı, değiştirmeyin)', () => {
  it('konuşma / şarkı sesi üfleme sayılmaz', () => {
    expect(basladiSayisi(birlestir(gurultu(0.5, 0.0005), ton(1, 220), ton(1, 320), gurultu(0.5, 0.0005)))).toBe(0);
  });
  it('kısa tıkırtı ("çıt") üfleme sayılmaz', () => {
    expect(basladiSayisi(birlestir(gurultu(0.5, 0.0005), gurultu(0.04, 0.6, 3), gurultu(0.8, 0.0005)))).toBe(0);
  });
  it('gerçek nefes üflemesi sayılır', () => {
    expect(basladiSayisi(birlestir(gurultu(0.5, 0.0005), nefes(1.2), gurultu(0.6, 0.0005)))).toBe(1);
  });
  it('eşikler ve Ada bölümündeki kullanım ilk (onaylı) hâlinde', () => {
    const analiz = analizKaynak;
    expect(analiz).toContain('const esik = this.a.taban + 14 - this.a.duyarlilik;');
    expect(analiz).toContain("o.db > esik && o.perde === null && (o.kalinOran > 0.28 || o.db > esik + 16) && o.duzluk > 0.025");
    expect(analiz).toContain('if (!this.aktif && this.art >= 4)');
    const bolum = bolumKaynak;
    expect(bolum).toContain('new Ufleme(kulak.ayar, 0.5)');
    expect(bolum).toContain('new Ufleme(kulak.ayar, 0.8)');
    expect(bolum).not.toMatch(/new Ufleme\([^)]*,\s*true\)/);
  });
});
