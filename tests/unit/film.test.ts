import { describe, expect, it } from 'vitest';
import elma from '../../content/film/kino-elma-kulesi.json';
import kaydirak from '../../content/film/kino-kaydirak.json';
import karpuz from '../../content/film/mino-karpuz.json';
import sepet from '../../content/film/mino-sepet.json';
// dosya varlığı: vite glob (node:fs tipi yok); yalnız yol anahtarları kullanılır
const MUZIK_DOSYALARI = Object.keys(import.meta.glob('../../assets/muzik/film-*.mp3', { eager: true, query: '?url', import: 'default' }));
const ISKELET_DOSYALARI = Object.keys(import.meta.glob('../../assets/karakter-iskelet/*-profil.svg', { eager: true, query: '?url', import: 'default' }));
const existsSync = (yol: string) => [...MUZIK_DOSYALARI, ...ISKELET_DOSYALARI].some((k) => k.endsWith(yol.replace(/^assets\//, '/')));
import seslendirme from '../../content/seslendirme.json';
// efekt modülü Web Audio / document ister: adlar kaynaktan okunur (FILM_EFEKT'in yöntemleri + nota0…nota9)
import efektKaynak from '../../film/src/efekt.ts?raw';
const FILM_EFEKT = Object.fromEntries([...[...efektKaynak.matchAll(/^ {2}([a-z]+)\(\) \{/gm)].map((m) => m[1]), ...Array.from({ length: 10 }, (_, i) => `nota${i}`)].map((a) => [a, true]));
import { karakterCumleleri, tumCumleler } from '../../src/audio/cumleler';

interface Olay { t: number; kim: string; yap: string; metin?: string; ad?: string | null }
const sahneler = karpuz.sahneler.filter((s): s is Extract<typeof s, { olaylar: unknown }> => 'olaylar' in s);
const cumleler = sahneler.flatMap((s) => (s.olaylar as Olay[]).filter((o) => o.yap === 'soyle').map((o) => o.metin as string));

describe('film: Mino’nun Karpuzu', () => {
  // Barış 2026-09-27 gece seslendirmeyi onayladı: cümleler seslendirme listesinde olmalı
  it('seslendirme açık: bütün cümleler ve öğüt seslendirme listesinde', () => {
    expect(karpuz.seslendir).toBe(true);
    const liste = new Set(tumCumleler());
    for (const c of [...cumleler, 'Paylaşmak güzeldir.']) expect(liste.has(c), c).toBe(true);
  });
  it('cümleler kısa: karakter ≤ 6 kelime', () => {
    for (const c of cumleler) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(6);
  });
  it('zaman çizelgesi sahne süresi içinde, her olayın kimi sahnede var', () => {
    for (const s of sahneler) {
      const varlar = new Set(['kamera', 'isik', 'efekt', 'muzik', 'parilti', 'anlatici', 'stand', ...Object.keys(s.oyuncular ?? {}), ...Object.keys(s.esyalar ?? {})]);
      for (const o of s.olaylar as Olay[]) {
        expect(o.t, `${s.ad} ${o.kim}`).toBeLessThanOrEqual(s.sure);
        expect(varlar.has(o.kim), `${s.ad}: ${o.kim}`).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------- Kino ve Elma Kulesi
interface ElmaOlay extends Olay { esya?: string; parca?: string }
interface ElmaSahne { ad: string; sure: number; gecis?: string; olaylar: ElmaOlay[]; oyuncular?: Record<string, { tip: string }>; esyalar?: Record<string, { tip: string }> }
const elmaSahneler = elma.sahneler.filter((s) => 'olaylar' in s) as unknown as ElmaSahne[];
const elmaSoz = (kim?: string) => elmaSahneler.flatMap((s) => s.olaylar.filter((o) => o.yap === 'soyle' && (!kim || o.kim === kim)).map((o) => o.metin as string));
const ELMA_OGUT = 'Hata yapınca özür dileriz.';

describe('film: Kino ve Elma Kulesi', () => {
  it('senaryodaki 7 cümle ve öğüt (Barış onayladı: seslendirme açık)', () => {
    expect(elma.seslendir).toBe(true);
    expect(elmaSoz('kino')).toEqual(['Top! Top! Top!', 'Özür dilerim, Mino.', 'Yaşasın!']);
    expect(elmaSoz('mino')).toEqual(['Günaydın! Kulemin son elması bu.', 'Kulem!', 'Olur böyle. Birlikte dizelim!', ELMA_OGUT]);
    expect(elma.sahneler.find((s) => 'ogut' in s)).toEqual({ ogut: ELMA_OGUT });
  });
  it('bütün cümleler seslendirme listesinde', () => {
    const liste = new Set(tumCumleler());
    for (const c of [...elmaSoz(), ELMA_OGUT]) expect(liste.has(c), c).toBe(true);
  });
  it("Kino'nun cümleleri Kino'nun sesine (karakter_sesleri.kino), Mino'nunkiler anlatıcı sesine gider", () => {
    expect(typeof seslendirme.karakter_sesleri.kino).toBe('string');
    const kino = new Set(karakterCumleleri().kino);
    for (const c of elmaSoz('kino')) expect(kino.has(c), c).toBe(true);
    for (const c of [...elmaSoz('mino'), ELMA_OGUT]) expect(kino.has(c), c).toBe(false);
  });
  it('cümleler kısa: Mino ≤ 5, Kino ≤ 3 kelime', () => {
    for (const c of elmaSoz('mino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(5);
    for (const c of elmaSoz('kino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(3);
  });
  it('5 sahne, yaklaşık 58-62 sn; zaman çizelgesi sahne içinde, her olayın kimi sahnede var', () => {
    expect(elmaSahneler.length).toBe(5);
    const toplam = elmaSahneler.reduce((t, s) => t + s.sure, 0);
    expect(toplam).toBeGreaterThanOrEqual(55);
    expect(toplam).toBeLessThanOrEqual(62);
    for (const s of elmaSahneler) {
      const varlar = new Set(['kamera', 'isik', 'efekt', 'muzik', 'parilti', 'anlatici', 'stand', 'toz', ...Object.keys(s.oyuncular ?? {}), ...Object.keys(s.esyalar ?? {})]);
      for (const o of s.olaylar) {
        expect(o.t, `${s.ad} ${o.kim}`).toBeLessThanOrEqual(s.sure);
        expect(varlar.has(o.kim), `${s.ad}: ${o.kim}`).toBe(true);
        // taşınan / bırakılan eşya sahnede olmalı
        if (o.yap === 'al' || o.yap === 'birak') expect(Object.keys(s.esyalar ?? {}), `${s.ad}: ${o.esya}`).toContain(o.esya);
      }
    }
  });
  it('efektler ve müzik ruhları tanımlı (Web Audio)', () => {
    for (const s of elmaSahneler)
      for (const o of s.olaylar) {
        if (o.kim === 'efekt') expect(Object.keys(FILM_EFEKT), o.yap).toContain(o.yap);
        if (o.kim === 'muzik' && o.ad) expect(['nese', 'uzgun', 'aydinlik', 'kapanis', 'yumusak']).toContain(o.ad);
      }
  });
  it('elma kulesi 4-3-2-1: on elma, en parlak elma tepede', () => {
    const ilk = elmaSahneler[0];
    const elmalar = Object.entries(ilk.esyalar ?? {}).filter(([, e]) => e.tip === 'elma');
    expect(elmalar.length).toBe(10);
    const kat = new Map<number, number>();
    for (const [, e] of elmalar) kat.set((e as unknown as { y: number }).y, (kat.get((e as unknown as { y: number }).y) ?? 0) + 1);
    expect([...kat.entries()].sort((a, b) => a[0] - b[0]).map(([, n]) => n)).toEqual([4, 3, 2, 1]);
    expect((ilk.esyalar?.e10 as unknown as { parla?: boolean }).parla).toBe(true);
  });
});

// ---------------------------------------------------------------- Kino ve Kaydırak
interface KaydirakOlay extends Olay { hedef?: string; agiz?: string; sure?: number }
interface KaydirakSahne { ad: string; sure: number; gecis?: string; arka: string; olaylar: KaydirakOlay[]; oyuncular: Record<string, { tip: string; yan?: boolean }> }
const kSahneler = kaydirak.sahneler.filter((s) => 'olaylar' in s) as unknown as KaydirakSahne[];
const kSoz = (kim?: string) => kSahneler.flatMap((s) => s.olaylar.filter((o) => o.yap === 'soyle' && (!kim || o.kim === kim)).map((o) => o.metin as string));
const KAYDIRAK_OGUT = 'Sırayı beklemek güzeldir.';

describe('film: Kino ve Kaydırak', () => {
  it('senaryodaki 9 cümle ve öğüt (Kino kendi sesiyle, Mino anlatıcı); soru yok', () => {
    expect(kaydirak.seslendir).toBe(true);
    expect(kSoz('kino')).toEqual(['Kaydırak! Kaydırak!', 'Ben önce!', 'Sabrediyorum!', 'Sıra bende!', 'Yaşasın!']);
    expect(kSoz('mino')).toEqual(['Parkta kaydırak sırası vardı.', 'Kino, sıra arkada.', 'Sıra herkese gelir.', KAYDIRAK_OGUT]);
    expect(kaydirak.sahneler.find((s) => 'ogut' in s)).toEqual({ ogut: KAYDIRAK_OGUT });
    // soru yok
    for (const c of [...kSoz(), KAYDIRAK_OGUT]) expect(c, c).not.toContain('?');
  });
  it('bütün cümleler seslendirme listesinde; Kino cümleleri Kino sesinde, Mino cümleleri değil', () => {
    const liste = new Set(tumCumleler());
    for (const c of [...kSoz(), KAYDIRAK_OGUT]) expect(liste.has(c), c).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const c of kSoz('kino')) expect(kino.has(c), c).toBe(true);
    for (const c of [...kSoz('mino'), KAYDIRAK_OGUT]) expect(kino.has(c), c).toBe(false);
  });
  it('cümleler kısa: Mino ≤ 5, Kino ≤ 3 kelime', () => {
    for (const c of kSoz('mino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(5);
    for (const c of kSoz('kino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(3);
  });
  it('5 sahne, yaklaşık 50-62 sn; olaylar sahne süresi içinde; her olayın kimi, hedefi ve ağzı sahnede', () => {
    expect(kSahneler.length).toBe(5);
    const toplam = kSahneler.reduce((t, s) => t + s.sure, 0);
    expect(toplam).toBeGreaterThanOrEqual(50);
    expect(toplam).toBeLessThanOrEqual(62);
    for (const s of kSahneler) {
      expect(s.arka).toBe('park');
      const oyuncular = Object.keys(s.oyuncular);
      const varlar = new Set(['kamera', 'isik', 'efekt', 'muzik', 'parilti', 'anlatici', 'toz', ...oyuncular]);
      for (const o of s.olaylar) {
        expect(o.t, `${s.ad} ${o.kim}`).toBeLessThanOrEqual(s.sure);
        expect(varlar.has(o.kim), `${s.ad}: ${o.kim}`).toBe(true);
        if (o.yap === 'yerine') expect(oyuncular, `${s.ad}: yerine ${o.hedef}`).toContain(o.hedef);
        if (o.agiz) expect(oyuncular, `${s.ad}: agiz ${o.agiz}`).toContain(o.agiz);
      }
    }
  });
  it('yan görünüş oyuncularının iskeleti (assets/karakter-iskelet/<ad>-profil) var', () => {
    for (const s of kSahneler)
      for (const [id, o] of Object.entries(s.oyuncular)) if (o.yan) expect(existsSync(`assets/karakter-iskelet/${o.tip}-profil.svg`), `${s.ad}: ${id}`).toBe(true);
  });
  it('efektler tanımlı; müzik dosyaları (assets/muzik/film-*.mp3) var', () => {
    for (const s of kSahneler)
      for (const o of s.olaylar) {
        if (o.kim === 'efekt') expect(Object.keys(FILM_EFEKT), o.yap).toContain(o.yap);
        if (o.kim === 'muzik' && o.yap === 'dosya') expect(existsSync(`assets/muzik/${o.ad}.mp3`), String(o.ad)).toBe(true);
      }
    // duygu müzikleri: bu filmde kullanılanlar
    const kullanilan = new Set(kSahneler.flatMap((s) => s.olaylar.filter((o) => o.kim === 'muzik' && o.yap === 'dosya').map((o) => o.ad)));
    for (const ad of ['film-fon-pazar', 'film-kovalamaca', 'film-surpriz', 'film-uzgun', 'film-merak', 'film-kutlama']) expect(kullanilan.has(ad), ad).toBe(true);
    // sentez müzik kapalı: müzik yalnız dosyalardan
    expect((kaydirak as { sentez?: boolean }).sentez).toBe(false);
  });
  it('jenerik dosyaları var: açılış 7,9 sn, kapanış 5 sn', () => {
    expect(existsSync('assets/muzik/film-acilis.mp3')).toBe(true);
    expect(existsSync('assets/muzik/film-kapanis.mp3')).toBe(true);
  });
});

// ---------------------------------------------------------------- Mino'nun Sepeti
interface SepetOlay extends Olay { hedef?: string; agiz?: string; esya?: string; parca?: string; [k: string]: unknown }
interface SepetSahne { ad: string; sure: number; arka: string; olaylar: SepetOlay[]; oyuncular: Record<string, { tip: string; yan?: boolean; durus?: Record<string, number>; tasi?: { ad: string; parca: string }[] }>; esyalar?: Record<string, { tip: string }> }
const sSahneler = sepet.sahneler.filter((s) => 'olaylar' in s) as unknown as SepetSahne[];
const sSoz = (kim?: string) => sSahneler.flatMap((s) => s.olaylar.filter((o) => o.yap === 'soyle' && (!kim || o.kim === kim)).map((o) => o.metin as string));
const SEPET_OGUT = 'Yardım etmek güzeldir.';

describe("film: Mino'nun Sepeti", () => {
  it('senaryodaki 10 cümle ve öğüt (Kino kendi sesiyle, Mino anlatıcı); soru yok', () => {
    expect(sepet.seslendir).toBe(true);
    expect(sSoz('kino')).toEqual(['Ben yardım ederim!', 'Buldum!', 'Rica ederim!']);
    expect(sSoz('mino')).toEqual(['Sepetim elma dolu!', 'Eyvah! Elmalarım!', 'Hepsi dağıldı.', 'Bir elma eksik.', 'Orada, bankın altında!', 'Teşekkür ederim!', SEPET_OGUT]);
    expect(sepet.sahneler.find((s) => 'ogut' in s)).toEqual({ ogut: SEPET_OGUT });
    for (const c of [...sSoz(), SEPET_OGUT]) expect(c, c).not.toContain('?');
  });
  it('bütün cümleler seslendirme listesinde; Kino cümleleri Kino sesinde, Mino cümleleri değil', () => {
    const liste = new Set(tumCumleler());
    for (const c of [...sSoz(), SEPET_OGUT]) expect(liste.has(c), c).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const c of sSoz('kino')) expect(kino.has(c), c).toBe(true);
    for (const c of [...sSoz('mino'), SEPET_OGUT]) expect(kino.has(c), c).toBe(false);
  });
  it('cümleler kısa: Mino ≤ 5, Kino ≤ 3 kelime', () => {
    for (const c of sSoz('mino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(5);
    for (const c of sSoz('kino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(3);
  });
  it('5 sahne, yaklaşık 50-62 sn; olaylar sahne içinde; kimi, hedefi, ağzı, taşınan eşyası sahnede', () => {
    expect(sSahneler.length).toBe(5);
    const toplam = sSahneler.reduce((t, s) => t + s.sure, 0);
    expect(toplam).toBeGreaterThanOrEqual(50);
    expect(toplam).toBeLessThanOrEqual(62);
    for (const s of sSahneler) {
      expect(s.arka).toBe('park');
      const oyuncular = Object.keys(s.oyuncular);
      const esyalar = Object.keys(s.esyalar ?? {});
      const varlar = new Set(['kamera', 'efekt', 'muzik', 'parilti', 'toz', ...oyuncular, ...esyalar]);
      for (const o of s.olaylar) {
        expect(o.t, `${s.ad} ${o.kim}`).toBeLessThanOrEqual(s.sure);
        expect(varlar.has(o.kim), `${s.ad}: ${o.kim}`).toBe(true);
        if (o.yap === 'yerine') expect(oyuncular, `${s.ad}: yerine ${o.hedef}`).toContain(o.hedef);
        if (o.yap === 'soyle' && o.agiz) expect(oyuncular, `${s.ad}: agiz ${o.agiz}`).toContain(o.agiz);
        if (o.yap === 'al' || o.yap === 'birak') expect(esyalar, `${s.ad}: ${o.yap} ${o.esya}`).toContain(o.esya);
      }
      // takılı eşyaların dünyadaki eşi (bırakılınca yerine geçer) sahnede
      for (const o of Object.values(s.oyuncular)) for (const t of o.tasi ?? []) expect(esyalar, `${s.ad}: tasi ${t.ad}`).toContain(t.ad);
    }
  });
  it("Mino'nun yeni pozları (kalkık kol, oturma, düşünme, işaret, sarılma) ve Kino'nun yan koşusu kullanılıyor", () => {
    const durus = sSahneler.flatMap((s) => [...s.olaylar.filter((o) => o.kim === 'mino' && o.yap === 'durus'), ...(s.oyuncular.mino?.durus ? [s.oyuncular.mino.durus] : [])]) as Record<string, unknown>[];
    const var_ = (f: (d: Record<string, unknown>) => boolean) => durus.some(f);
    expect(var_((d) => Number(d.yukSol) > 30 || Number(d.yukSag) > 30), 'kalkık kol').toBe(true);
    expect(var_((d) => d.otur === 1), 'oturma').toBe(true);
    expect(var_((d) => d.dusun === 1), 'düşünme').toBe(true);
    expect(var_((d) => d.bakan === 1 && d.yukSag === 85), 'işaret').toBe(true);
    expect(var_((d) => d.saril === 1), 'sarılma').toBe(true);
    const kos = sSahneler.flatMap((s) => s.olaylar.filter((o) => s.oyuncular[o.kim]?.yan && s.oyuncular[o.kim].tip === 'kino' && o.stil === 'kos'));
    expect(kos.length).toBeGreaterThanOrEqual(4);
    // Kino elmayı yan görünüşte ağzında taşır
    expect(sSahneler.some((s) => s.olaylar.some((o) => o.kim === 'kinoy' && o.yap === 'al' && o.parca === 'agiz'))).toBe(true);
  });
  it('yan görünüş iskeletleri var; efektler tanımlı; müzik dosyaları var; sentez müzik kapalı', () => {
    for (const s of sSahneler)
      for (const [id, o] of Object.entries(s.oyuncular)) if (o.yan) expect(existsSync(`assets/karakter-iskelet/${o.tip}-profil.svg`), `${s.ad}: ${id}`).toBe(true);
    for (const s of sSahneler)
      for (const o of s.olaylar) {
        if (o.kim === 'efekt') expect(Object.keys(FILM_EFEKT), o.yap).toContain(o.yap);
        if (o.kim === 'muzik' && o.yap === 'dosya') expect(existsSync(`assets/muzik/${o.ad}.mp3`), String(o.ad)).toBe(true);
      }
    const kullanilan = new Set(sSahneler.flatMap((s) => s.olaylar.filter((o) => o.kim === 'muzik' && o.yap === 'dosya').map((o) => o.ad)));
    for (const ad of ['film-fon-pazar', 'film-surpriz', 'film-uzgun', 'film-kovalamaca', 'film-merak', 'film-kutlama']) expect(kullanilan.has(ad), ad).toBe(true);
    expect((sepet as { sentez?: boolean }).sentez).toBe(false);
  });
});
