import { describe, expect, it } from 'vitest';
import { kameraHesabi } from '../../matematik/src/telefon-kamera';

// Matematik · telefon kamerası (Matematik denetimi 23 Kasım): içerik kutusu ekranı doldurur, hiç kırpılmaz, sahne ekranı örter.
const W = 844, H = 390;
const ekrandaki = (k: { x0: number; y0: number; x1: number; y1: number }) => {
  const h = kameraHesabi(k, W, H)!;
  const sh = (h.w * 9) / 16;
  return { l: h.x + k.x0 * h.w, r: h.x + k.x1 * h.w, t: h.y + k.y0 * sh, b: h.y + k.y1 * sh, h, sh };
};

describe('telefon kamerası', () => {
  it('sahneyi zaten dolduran içerikte kamera kapalı', () => {
    expect(kameraHesabi({ x0: 0, y0: 0, x1: 1, y1: 1 }, W, H)).toBeNull();
  });
  it('tezgâh gibi alt şeritteki içerik: büyür, ekranda kalır, ekranın %60\'ından fazlasını kaplar', () => {
    // Dört oyuncak ve altlarındaki ad etiketleri (sahnenin %2–98,5 × %37–90).
    const k = { x0: 0.02, y0: 0.37, x1: 0.985, y1: 0.9 };
    const e = ekrandaki(k);
    expect(e.l).toBeGreaterThanOrEqual(0);
    expect(e.r).toBeLessThanOrEqual(W);
    expect(e.t).toBeGreaterThanOrEqual(60);
    expect(e.b).toBeLessThanOrEqual(H);
    expect(((e.r - e.l) * (e.b - e.t)) / (W * H)).toBeGreaterThan(0.6);
  });
  it('içerik ekran genişliğinde dikey sığmıyorsa kamera yok; sığıyorsa en az ekran genişliği (boş bant olmaz)', () => {
    expect(kameraHesabi({ x0: 0.1, y0: 0.05, x1: 0.9, y1: 0.95 }, W, H)).toBeNull();
    const h = kameraHesabi({ x0: 0.2, y0: 0.15, x1: 0.8, y1: 0.85 }, W, H)!;
    expect(h.w).toBeGreaterThanOrEqual(W);
    expect(h.x).toBeLessThanOrEqual(0);
  });
  it('sahnenin boyunun %81\'ini tutan masa turu: kamera ekran genişliğine büyür, içerik kırpılmaz', () => {
    const e = ekrandaki({ x0: 0.17, y0: 0.12, x1: 0.98, y1: 0.93 });
    expect(e.h.w).toBe(W);
    expect(e.t).toBeGreaterThanOrEqual(0);
    expect(e.b).toBeLessThanOrEqual(H);
    expect(e.l).toBeGreaterThanOrEqual(0);
    expect(e.r).toBeLessThanOrEqual(W);
  });
  it('köşelere değmeyen dar ve uzun içerik: üst şerit ayrılmaz, ekranın bütün boyu kullanılır; köşe düğmelerine değmez', () => {
    const k = { x0: 0.4, y0: 0.2, x1: 0.8, y1: 0.8 };
    const e = ekrandaki(k);
    expect(e.b - e.t).toBeGreaterThan(H - 20);
    expect(e.t).toBeLessThan(60);
    expect(e.l).toBeGreaterThanOrEqual(84);
    expect(e.r).toBeLessThanOrEqual(W - 84);
  });
  it('kutu köşeye değse de parçalar değmiyorsa (sol altta tahta, sağda alçak karakter) şerit ayrılmaz', () => {
    const k = { x0: 0.39, y0: 0.36, x1: 0.96, y1: 0.98 };
    const parcalar = [{ x0: 0.39, y0: 0.44, x1: 0.61, y1: 0.81 }, { x0: 0.69, y0: 0.36, x1: 0.96, y1: 0.98 }];
    const kutuyla = kameraHesabi(k, W, H)!, parcayla = kameraHesabi(k, W, H, parcalar)!;
    expect(parcayla.w).toBeGreaterThanOrEqual(kutuyla.w);
    // Köşedeki parça şeridi yine ayırtır.
    const koseli = [...parcalar, { x0: 0.9, y0: 0.36, x1: 0.96, y1: 0.42 }];
    expect(kameraHesabi(k, W, H, koseli)!.w).toBeLessThanOrEqual(parcayla.w);
  });
  it('sahne her zaman ekranı örter (boş bant kalmaz) ve en çok 1,75 kat büyür', () => {
    for (const k of [{ x0: 0.4, y0: 0.4, x1: 0.6, y1: 0.6 }, { x0: 0, y0: 0.5, x1: 0.3, y1: 1 }, { x0: 0.7, y0: 0, x1: 1, y1: 0.4 }]) {
      const e = ekrandaki(k);
      expect(e.h.x).toBeLessThanOrEqual(0);
      expect(e.h.x + e.h.w).toBeGreaterThanOrEqual(W - 0.5);
      expect(e.h.y).toBeLessThanOrEqual(0);
      expect(e.h.y + e.sh).toBeGreaterThanOrEqual(H - 0.5);
      expect(e.h.w).toBeLessThanOrEqual(((H * 16) / 9) * 1.75 + 0.5);
    }
  });
});
