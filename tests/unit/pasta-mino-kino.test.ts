/**
 * Mino ile Kino'nun Pasta Otobüsü (ekip/senaryo/mino-kino-pasta.md): ad her yerde yeni, Kino'nun yeni cümleleri
 * Kino sesiyle seslendirilir, Kino'nun kayma payı hiçbir engele binmez, akşam beşli sayım kulelerle aynı.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import P from '../../content/pasta.json';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import { bosluk } from '../../pasta/src/kino-is';
import { pastaKinoCumleleri, sayim } from '../../pasta/src/model';
import { OYUNLAR } from '../../uygulama/src/oyunlar';

const AD = "Mino ile Kino'nun Pasta Otobüsü";

describe('Mino ile Kino: ad', () => {
  it('oyunun başlığı, menü kartı, sayfa başlığı ve mağaza metni yeni ad', () => {
    expect(`${P.arayuz.baslik_ust} ${P.arayuz.baslik_alt}`).toBe(AD);
    // menü kartı: kısa ad altta ("Pasta Otobüsü"), baş kısmı resmin üstünde tabela; erişilebilir ad tam ad
    const kart = OYUNLAR.find((o) => o.id === 'pasta')!;
    expect(`${kart.ust} ${kart.ad}`).toBe(AD);
    expect(readFileSync('pasta/index.html', 'utf8')).toContain(`<title>${AD}</title>`);
    const magaza = readFileSync('ekip/uygulama/MAGAZA-METINLERI.md', 'utf8');
    expect(magaza).toContain(`**${AD}:**`);
    expect(magaza).toContain("**Mino & Kino's Bakery Bus:**");
    expect(magaza).not.toMatch(/Mino'nun Pasta Otobüsü|\*\*Mino's Bakery Bus/);
    expect(readFileSync('src/abonelik/ekran.ts', 'utf8')).toContain(AD);
  });
});

describe('Mino ile Kino: seslendirme', () => {
  it('Kino: Hoş geldin! · Buyurun! · Çak! Kino sesiyle; Mino başlığı söyler (kısa)', () => {
    for (const s of [P.kino.hosgeldin, P.kino.buyurun, P.kino.cak]) {
      expect(pastaKinoCumleleri()).toContain(s);
      expect(karakterCumleleri().kino).toContain(normal(s));
    }
    expect(P.mino.baslik_soyle).toBe(`${AD}!`);
    expect(tumCumleler()).toContain(P.mino.baslik_soyle);
    expect(P.mino.baslik_soyle.length).toBeLessThanOrEqual(40);
    // beşer sayma kayıtları zaten var
    expect(P.parca.besli.slice(0, 3)).toEqual(['Beş!', 'On!', 'On beş!']);
  });
});

describe('Mino ile Kino: akşam beşli kuleler', () => {
  it('beşer sayılan her adım bir kule (5 jeton), artan son kulede', () => {
    for (const n of [11, 12, 15, 16, 20, 23]) {
      const { adim } = sayim(n);
      const kuleler = Array.from({ length: Math.ceil(n / 5) }, (_, i) => Math.min(5, n - i * 5));
      expect(adim.slice(0, kuleler.length)).toEqual(kuleler.slice(0, adim.length));
      expect(adim.reduce((a, b) => a + b, 0)).toBe(n);
    }
  });
});

describe('Kino yerinden ancak boş yere kadar kayar', () => {
  const kutu = (left: number, top: number, w: number, h: number) => ({ left, top, right: left + w, bottom: top + h });
  const ekran = { left: 0, right: 800 };
  const kino = kutu(200, 170, 90, 90);
  it('sağdaki istasyona binmez (4 px pay)', () => {
    expect(bosluk(kino, 1, [kutu(330, 180, 70, 70)], ekran)).toBe(36);
  });
  it('soldaki fırına binmez', () => {
    expect(bosluk(kino, -1, [kutu(16, 80, 170, 300)], ekran)).toBe(10);
  });
  it('dikeyde örtüşmeyen eşya engel değil; ekran kenarı sınır', () => {
    expect(bosluk(kino, 1, [kutu(330, 300, 70, 70)], ekran)).toBe(800 - 290 - 4);
  });
  it('ayaklarının sıyırdığı (dikeyde %25ten az örtüşen) eşya yolu kesmez', () => {
    expect(bosluk(kino, 1, [kutu(190, 250, 120, 80), kutu(330, 180, 70, 70)], ekran)).toBe(36);
  });
  it('zaten bir engelin içindeyse hiç kaymaz', () => {
    expect(bosluk(kino, 1, [kutu(250, 200, 70, 70)], ekran)).toBe(0);
  });
});
