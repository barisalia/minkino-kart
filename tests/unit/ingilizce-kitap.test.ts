import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ACILIM, CEREN, DALGA, GOL_DEKORU, KABARCIK_SAYFASI, KINO, KITAP, ORDEK, POLLY, YARIK, acilmaDurumu, kanitCizimleri, kanitSesleri, yay,
} from '../../ingilizce/src/kitap/veri';

// Açılır kitap (22 Kasım 2026 gecesi): göl masalının 3 boyutlu kitabı; kanıt sayfası (Paket Masal-K2-A)
describe('açılır kitap · veri', () => {
  it('kanıt sayfası 41 çizimdir (40 + Polly’nin kapalı gagalı konuşma karesi), hepsi kitap/gol altında ve tekrarsız', () => {
    const l = kanitCizimleri();
    expect(l).toHaveLength(41);
    expect(new Set(l).size).toBe(41);
    for (const y of l) expect(y).toMatch(/^kitap\/gol\/[a-z0-9-]+$/);
  });

  it('diskteki her kitap çizimi listede (ad yanlışı olmasın); geri dönenler `geri-donen` klasöründe bekler', () => {
    const liste = new Set(kanitCizimleri());
    const diskte = existsSync('assets/ingilizce/kitap/gol') ? readdirSync('assets/ingilizce/kitap/gol').filter((f) => f.endsWith('.webp')).map((f) => `kitap/gol/${f.replace('.webp', '')}`) : [];
    expect(diskte.filter((y) => !liste.has(y))).toEqual([]);
  });

  it('kayıtların hepsi diskte', () => {
    const eksik = kanitSesleri().filter((id) => !existsSync(`assets/ingilizce/ses/${id}.mp3`));
    expect(eksik).toEqual([]);
  });

  it('oyuncuların ilk pozu ve göz kırpma pozları tanımlı', () => {
    for (const o of [KINO, ORDEK, POLLY, CEREN]) {
      expect(Object.keys(o.pozlar)).toContain(o.ilk);
      for (const ad of Object.keys(o.kirp ?? {})) expect(Object.keys(o.pozlar)).toContain(ad);
      expect(o.taban).toBeGreaterThan(0.5);
      expect(o.taban).toBeLessThanOrEqual(1);
    }
    // konuşan pozlar çok karelidir (ağız kaydı izler)
    expect(KINO.pozlar.sor).toHaveLength(3);
    expect(POLLY.pozlar.konus).toHaveLength(3);
    expect(CEREN.pozlar.dur).toHaveLength(2);
  });

  it('dik katmanlar arkadan öne dizilir ve açılımın içindedir', () => {
    const ys = GOL_DEKORU.dikler.map((d) => d.y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
    for (const d of GOL_DEKORU.dikler) {
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.x + d.en).toBeLessThanOrEqual(ACILIM.en);
      expect(d.y).toBeLessThanOrEqual(ACILIM.boy);
    }
    expect(ACILIM.x + ACILIM.en).toBeLessThanOrEqual(KITAP.en);
  });

  it('ördek orta katmanın önünde, dalganın arkasında, Kino ile üst üste gelmeden çıkar', () => {
    const orta = GOL_DEKORU.dikler.find((d) => d.id === 'orta')!;
    expect(YARIK.y).toBeGreaterThan(orta.y);
    expect(DALGA.y).toBeGreaterThan(YARIK.y);
    expect(ORDEK.x - ORDEK.en / 2).toBeGreaterThan(KINO.x + KINO.en / 4);
    // dalga ördeğin su üstündeki boyunun yarısından azını örter
    expect(DALGA.boy).toBeLessThan(ORDEK.en * ORDEK.oran * ORDEK.taban * 0.5);
  });

  it('cümleler kısa ve gerçek', () => {
    for (const c of [KABARCIK_SAYFASI.en, KABARCIK_SAYFASI.soru, KABARCIK_SAYFASI.cevap]) expect(c.split(' ').length).toBeLessThanOrEqual(6);
  });
});

describe('açılır kitap · açılma', () => {
  it('kapalıyken kapak kapalı ve katmanlar yatık; açıkken hepsi kalkmış', () => {
    expect(acilmaDurumu(0, 5)).toEqual({ kapak: 0, kalkis: [0, 0, 0, 0, 0] });
    expect(acilmaDurumu(1, 5)).toEqual({ kapak: 1, kalkis: [1, 1, 1, 1, 1] });
  });

  it('önce kapak döner, sonra katmanlar kalkar', () => {
    const yari = acilmaDurumu(0.55, 4);
    expect(yari.kapak).toBe(1);
    expect(yari.kalkis.every((k) => k === 0)).toBe(true);
    expect(acilmaDurumu(0.3, 4).kapak).toBeGreaterThan(0);
    expect(acilmaDurumu(0.3, 4).kapak).toBeLessThan(1);
  });

  it('katmanlar arkadan öne sırayla kalkar', () => {
    const d = acilmaDurumu(0.8, 5).kalkis;
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeLessThanOrEqual(d[i - 1]);
    expect(d[0]).toBeGreaterThan(d[d.length - 1]);
  });

  it('açılma arttıkça hiçbir şey geri gitmez; sınır dışı değerler kırpılır', () => {
    let once = acilmaDurumu(0, 5);
    for (let a = 0.02; a <= 1.0001; a += 0.02) {
      const s = acilmaDurumu(a, 5);
      expect(s.kapak).toBeGreaterThanOrEqual(once.kapak);
      s.kalkis.forEach((k, i) => expect(k).toBeGreaterThanOrEqual(once.kalkis[i]));
      once = s;
    }
    expect(acilmaDurumu(-3, 2)).toEqual(acilmaDurumu(0, 2));
    expect(acilmaDurumu(7, 2)).toEqual(acilmaDurumu(1, 2));
    expect(acilmaDurumu(1, 1).kalkis).toEqual([1]);
  });

  it('yaylanma 0’dan 1’e gider ve sonda hafif taşar', () => {
    expect(yay(0)).toBeCloseTo(0, 5);
    expect(yay(1)).toBeCloseTo(1, 5);
    expect(Math.max(...Array.from({ length: 50 }, (_, i) => yay(i / 49)))).toBeGreaterThan(1.02);
  });
});
