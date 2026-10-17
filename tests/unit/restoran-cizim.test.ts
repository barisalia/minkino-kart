/**
 * İstasyon çizimi → ekran dönüşümü (restoran/src/istasyon/cizim.ts): Doğra tahtası, Tava'nın ocak gözü ve Tabakla
 * tabağı çizimdeki yerine oturur. Arka plan cover + dikey odak (istasyon.ts background-position ile aynı), dikeyde
 * çizim 90° saat yönünde döner.
 */
import { describe, expect, it } from 'vitest';
import { CIZIM_ORAN, CIZIM_YER, cizimEkrani, ODAK_Y } from '../../restoran/src/istasyon/cizim';

describe('restoran istasyon çizimi yerleri', () => {
  it('yatay 844×390: cover eni ekran eni, dikey kırpma odağa göre', () => {
    const c = cizimEkrani('tezgah', 844, 390);
    const ch = 844 / CIZIM_ORAN;
    const oy = (390 - ch) * ODAK_Y.tezgah!;
    const k = c.kutu(CIZIM_YER.tahta);
    expect(k.x).toBeCloseTo(844 * CIZIM_YER.tahta.u0, 5);
    expect(k.y).toBeCloseTo(oy + ch * CIZIM_YER.tahta.v0, 5);
    expect(k.w).toBeCloseTo(844 * (CIZIM_YER.tahta.u1 - CIZIM_YER.tahta.u0), 5);
    // tahta ekranın içinde, raf şeridinin (~94 px) hemen altından başlar
    expect(k.y).toBeGreaterThan(80);
    expect(k.y + k.h).toBeLessThan(390);
  });

  it('667×375 (çizimle aynı oranda): kırpma yok, yükseklik dolar', () => {
    const c = cizimEkrani('servis', 667, 375);
    const m = c.nokta(0.5, 0.5);
    expect(m.x).toBeCloseTo(333.5, 0);
    expect(m.y).toBeCloseTo(187.5, 0);
    expect(c.boy(1)).toBeCloseTo(375 * CIZIM_ORAN, 5);
  });

  it('dikey 390×844: çizim döner; çizimin solu ekranın üstüne, üstü ekranın sağına gelir', () => {
    const c = cizimEkrani('ocak', 390, 844);
    expect(c.donuk).toBe(true);
    const sol = c.nokta(CIZIM_YER.ocakSol.u, CIZIM_YER.ocakSol.v);
    const sag = c.nokta(CIZIM_YER.ocakSag.u, CIZIM_YER.ocakSag.v);
    expect(sol.y).toBeLessThan(sag.y);
    expect(Math.abs(sol.x - sag.x)).toBeLessThan(2);
    const ust = c.nokta(0.5, 0);
    const alt = c.nokta(0.5, 1);
    expect(ust.x).toBeGreaterThan(alt.x);
    // döndürülmüş kutu: tahta dik durur
    const k = cizimEkrani('tezgah', 390, 844).kutu(CIZIM_YER.tahta);
    expect(k.h).toBeGreaterThan(k.w);
  });
});
