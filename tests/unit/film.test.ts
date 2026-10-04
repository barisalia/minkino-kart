import { describe, expect, it } from 'vitest';
import elma from '../../content/film/kino-elma-kulesi.json';
import kaydirak from '../../content/film/kino-kaydirak.json';
import karpuz from '../../content/film/mino-karpuz.json';
import sepet from '../../content/film/mino-sepet.json';
import lutfen from '../../content/film/kino-lutfen.json';
import oyuncak from '../../content/film/kino-oyuncak.json';
import ayiIskelet from '../../assets/karakter-iskelet/ayi.json';
import lutfenSarki from '../../assets/muzik/lutfen.json';
import { sozleEsle } from '../../src/audio/sarki-kayit';
const SARKI_DOSYALARI = Object.keys(import.meta.glob('../../assets/muzik/*-sozlu.mp3', { eager: true, query: '?url', import: 'default' }));
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
  it('v2: 90 sn civarı; sorun, duygu, dönüm noktası; sonda "Ne öğrendik?", bekleme ve öğüt Mino’dan', () => {
    const toplam = sahneler.reduce((t, s) => t + s.sure, 0);
    expect(toplam).toBeGreaterThanOrEqual(85);
    expect(toplam).toBeLessThanOrEqual(120);
    for (const c of ['Hiç kimseye vermem!', 'Bu karpuzu çok seviyorum.', 'Ama köpek çok aç.', 'Paylaşınca çok mutlu oldum.']) expect(cumleler, c).toContain(c);
    expect(cumleler.filter((c) => c.includes('?'))).toEqual(['Vak! Bize de var mı?', 'Ne öğrendik?']);
    const son = (sahneler.at(-1)!.olaylar as (Olay & { sure?: number })[]).filter((o) => o.yap === 'soyle').sort((a, b) => a.t - b.t);
    const soru = son.find((o) => o.metin === 'Ne öğrendik?')!;
    expect(son.at(-1)!.metin).toBe('Paylaşmak güzeldir.');
    expect(son.at(-1)!.t - (soru.t + Number(soru.sure))).toBeGreaterThanOrEqual(2);
    // hiçbir şey birden belirmez: göster / gizle en az 0,25 sn (aynı yerde yer değiştiren karpuz parçaları hariç)
    for (const s of sahneler)
      for (const o of s.olaylar as (Olay & { sure?: number })[])
        if ((o.yap === 'goster' || o.yap === 'gizle') && !/^(karpuz|yarim\d|d\d)$/.test(o.kim)) expect(Number(o.sure), `${s.ad} ${o.kim}`).toBeGreaterThanOrEqual(0.25);
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
    // v2: Mino'nun duyguları (üzüldüm, yalnızken üzgündüm), neden (ayağı takıldı), birlikte kolaylaşır
    expect(sSoz('kino')).toEqual(['Ben yardım ederim!', 'Hep birlikte!', 'Buldum!', 'Sepet yine dolu!', 'Rica ederim!', 'Arkadaşlar yardımlaşır!']);
    expect(sSoz('mino')).toEqual([
      'Anneme elma götürüyorum.',
      'Sepetim elma dolu!',
      'Eyvah! Elmalarım!',
      'Ay! Ayağım takıldı.',
      'Hepsi dağıldı.',
      'Tek başıma toplayamam.',
      'Çok üzüldüm.',
      'Sağ ol, Kino!',
      'Birlikte çok kolay!',
      'Bir elma eksik.',
      'En güzel elmam kayboldu.',
      'Orada, bankın altında!',
      'Teşekkür ederim!',
      'Yalnızken çok üzgündüm.',
      'Sizinle her şey kolaylaştı.',
      SEPET_OGUT,
    ]);
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
  it('v2: 5 sahne, 85-120 sn; olaylar sahne içinde; kimi, hedefi, ağzı, taşınan eşyası sahnede', () => {
    expect(sSahneler.length).toBe(5);
    const toplam = sSahneler.reduce((t, s) => t + s.sure, 0);
    expect(toplam).toBeGreaterThanOrEqual(85);
    expect(toplam).toBeLessThanOrEqual(120);
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

// ---------------------------------------------------------------- Kino ve Sihirli Söz
interface LutfenOlay extends Olay { hedef?: string; agiz?: string; esya?: string; parca?: string; [k: string]: unknown }
interface LutfenSahne { ad: string; sure: number; arka: string; olaylar: LutfenOlay[]; oyuncular: Record<string, { tip: string; yan?: boolean; durus?: Record<string, number>; tasi?: { ad: string; parca: string }[] }>; esyalar?: Record<string, { tip: string; gizli?: boolean }> }
const lSahneler = lutfen.sahneler.filter((s) => 'olaylar' in s) as unknown as LutfenSahne[];
const lSoz = (kim?: string) => lSahneler.flatMap((s) => s.olaylar.filter((o) => o.yap === 'soyle' && (!kim || o.kim === kim)).map((o) => o.metin as string));
const LUTFEN_OGUT = 'Lütfen demek sihirli bir sözdür.';

describe('film: Kino ve Sihirli Söz', () => {
  it('cümleler ve öğüt (Mino anlatıcı, Kino kendi sesiyle, satıcı ayı tek cümle); soru yok', () => {
    expect(lutfen.seslendir).toBe(true);
    // v2: Kino'nun duyguları (kızdı, istiyordum, utanıyorum), Mino nedenini söyler, ayı kibar sözle sevinir
    expect(lSoz('kino')).toEqual(['Elma! Kocaman elma!', 'Ver!', 'Ver! Ver!', 'Ayı bana kızdı.', 'Ben elma istiyordum.', 'Sihirli bir söz…', 'Biraz utanıyorum.', 'Lütfen…', 'Lütfen işe yaradı!', 'Teşekkürler!']);
    expect(lSoz('mino')).toEqual(["Bugün Kino'yla pazardayız!", 'Ayı amca elma satıyor.', 'Ver deyince ayı üzüldü.', 'Sihirli sözü söyle: Lütfen!', 'Lütfen deyince herkes sevinir.', LUTFEN_OGUT]);
    expect(lSoz('ayi')).toEqual(['Buyur! Bir de çilek!', 'Kibar sözler beni çok sevindirir.', 'Rica ederim, tatlı Kino!']);
    expect(lutfen.sahneler.find((s) => 'ogut' in s)).toEqual({ ogut: LUTFEN_OGUT });
    for (const c of [...lSoz(), LUTFEN_OGUT]) expect(c, c).not.toContain('?');
  });
  it('bütün cümleler seslendirme listesinde; Kino cümleleri Kino sesinde, Mino ve ayının cümleleri değil', () => {
    const liste = new Set(tumCumleler());
    for (const c of [...lSoz(), LUTFEN_OGUT]) expect(liste.has(c), c).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const c of lSoz('kino')) expect(kino.has(c), c).toBe(true);
    for (const c of [...lSoz('mino'), ...lSoz('ayi'), LUTFEN_OGUT]) expect(kino.has(c), c).toBe(false);
  });
  it('cümleler kısa: Mino ≤ 5, Kino ≤ 3, ayı ≤ 6 kelime', () => {
    for (const c of lSoz('mino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(5);
    for (const c of lSoz('kino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(3);
    for (const c of lSoz('ayi')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(6);
  });
  it('v2: 5 sahne, 85-120 sn, pazarda; olaylar sahne içinde; kimi, hedefi, taşınan eşyası sahnede', () => {
    expect(lSahneler.length).toBe(5);
    const toplam = lSahneler.reduce((t, s) => t + s.sure, 0);
    expect(toplam).toBeGreaterThanOrEqual(85);
    expect(toplam).toBeLessThanOrEqual(120);
    expect(lutfen.malzeme).toBe('mino-karpuz');
    for (const s of lSahneler) {
      expect(s.arka).toBe('pazar');
      const oyuncular = Object.keys(s.oyuncular);
      const esyalar = Object.keys(s.esyalar ?? {});
      const varlar = new Set(['kamera', 'efekt', 'muzik', 'sarki', 'parilti', 'toz', ...oyuncular, ...esyalar]);
      for (const o of s.olaylar) {
        expect(o.t, `${s.ad} ${o.kim}`).toBeLessThanOrEqual(s.sure);
        expect(varlar.has(o.kim), `${s.ad}: ${o.kim}`).toBe(true);
        if (o.yap === 'yerine') expect(oyuncular, `${s.ad}: yerine ${o.hedef}`).toContain(o.hedef);
        if (o.yap === 'al' || o.yap === 'birak') expect(esyalar, `${s.ad}: ${o.yap} ${o.esya}`).toContain(o.esya);
      }
      for (const o of Object.values(s.oyuncular)) for (const t of o.tasi ?? []) expect(esyalar, `${s.ad}: tasi ${t.ad}`).toContain(t.ad);
      // tezgâh, elma ve çilek kasaları her sahnede
      expect(esyalar).toEqual(expect.arrayContaining(['tezgah', 'kasa1', 'kasa2', 'elma', 'cilek']));
    }
  });
  it('satıcı ayı: kaş çatar ve surat asar, sonra kaşları kalkar ve tatlı gülümser; dudak senkronlu konuşur', () => {
    const durus = lSahneler.flatMap((s) => [...s.olaylar.filter((o) => o.kim === 'ayi' && o.yap === 'durus'), ...(s.oyuncular.ayi?.durus ? [s.oyuncular.ayi.durus] : [])]) as Record<string, unknown>[];
    expect(durus.some((d) => Number(d.kas) >= 1 && d.surat === 1), 'kaş çatma').toBe(true);
    expect(durus.some((d) => Number(d.kas) < 0), 'kalkık kaş').toBe(true);
    expect(durus.some((d) => d.tatli === 1), 'tatlı gülümseme').toBe(true);
    // iskelette tek kaş katmanı ve dudak senkronu ağızları var
    expect(ayiIskelet.sira).toContain('kas');
    for (const a of ['agiz-kapali', 'agiz-az', 'agiz-orta', 'agiz-yuvarlak', 'agiz-dis', 'agiz-gulumse']) expect(ayiIskelet.gizli, a).toContain(a);
  });
  it('ayı elmayı Kino’nun patisine, çileği başına verir; ikisi de sonraki sahnede Kino’da takılı', () => {
    const al = lSahneler.flatMap((s) => s.olaylar.filter((o) => o.yap === 'al'));
    expect(al.some((o) => o.kim === 'kino' && o.esya === 'elma' && o.parca === 'kol-sag')).toBe(true);
    expect(al.some((o) => o.kim === 'kino' && o.esya === 'cilek' && o.parca === 'kafa')).toBe(true);
    const son = lSahneler[4].oyuncular.kino.tasi ?? [];
    expect(son.map((t) => `${t.ad}:${t.parca}`)).toEqual(['elma:govde', 'cilek:kafa']);
    expect(lSahneler[4].esyalar?.cilek.gizli).toBe(true);
    // Kino yandan koşarak gelir, önüne döner
    expect(lSahneler[0].olaylar.some((o) => o.kim === 'kinoy' && o.stil === 'kos')).toBe(true);
    expect(lSahneler[0].olaylar.some((o) => o.kim === 'kinoy' && o.yap === 'yerine' && o.hedef === 'kino')).toBe(true);
  });
  it('efektler tanımlı; müzik dosyaları var; sentez müzik kapalı', () => {
    for (const s of lSahneler)
      for (const o of s.olaylar) {
        if (o.kim === 'efekt') expect(Object.keys(FILM_EFEKT), o.yap).toContain(o.yap);
        if (o.kim === 'muzik' && o.yap === 'dosya') expect(existsSync(`assets/muzik/${o.ad}.mp3`), String(o.ad)).toBe(true);
      }
    const kullanilan = new Set(lSahneler.flatMap((s) => s.olaylar.filter((o) => o.kim === 'muzik' && o.yap === 'dosya').map((o) => o.ad)));
    for (const ad of ['film-fon-pazar', 'film-surpriz', 'film-uzgun', 'film-merak', 'film-kutlama']) expect(kullanilan.has(ad), ad).toBe(true);
    expect((lutfen as { sentez?: boolean }).sentez).toBe(false);
  });
  it('finalde "Lütfen ve Teşekkürler" şarkısı: kayıt ve hece tablosu var; sözler kayıttaki hecelerle birebir; öğütten sonra, film içinde biter', () => {
    const son = lSahneler[4];
    const sarki = son.olaylar.find((o) => o.kim === 'sarki' && o.yap === 'basla') as LutfenOlay & { soz: string[] };
    expect(sarki.ad).toBe('lutfen');
    expect(SARKI_DOSYALARI.some((k) => k.endsWith('/lutfen-sozlu.mp3'))).toBe(true);
    // sözler (yazım) kayıttaki hecelere harf harf oturur; dört satır
    expect(sarki.soz).toEqual(['Lütfen demek çok güzel', 'Teşekkür etmek çok güzel', 'Her arkadaş sevgiyle', 'Güller açar el ele']);
    const yazim = sozleEsle(sarki.soz, lutfenSarki.heceler.map((x) => x.hece));
    for (const [i, satir] of sarki.soz.entries())
      expect(yazim.filter((y) => y.satir === i).map((y) => y.yazi).join(''), satir).toBe(satir.replace(/\s/g, ''));
    // Mino öğüdü şarkının girişinde söyler (sözler başlamadan biter); şarkı sahne bitmeden sona erer
    const ogut = son.olaylar.find((o) => o.yap === 'soyle' && o.metin === LUTFEN_OGUT) as LutfenOlay & { sure: number };
    const sozBasi = sarki.t + lutfenSarki.baslangic_ms / 1000;
    expect(ogut.t + ogut.sure).toBeLessThanOrEqual(sozBasi);
    expect(sarki.t + Math.max(...lutfenSarki.heceler.map((x) => x.bitir_ms)) / 1000).toBeLessThan(son.sure);
  });
});

// ---------------------------------------------------------------- Kino ve Oyuncak Sepeti
interface OyuncakOlay extends Olay { hedef?: string; esya?: string; parca?: string; [k: string]: unknown }
interface OyuncakSahne { ad: string; sure: number; arka: string; olaylar: OyuncakOlay[]; oyuncular: Record<string, { tip: string; yan?: boolean }>; esyalar?: Record<string, { tip: string; z?: number }> }
const oSahneler = oyuncak.sahneler.filter((s) => 'olaylar' in s) as unknown as OyuncakSahne[];
const oSoz = (kim?: string) => oSahneler.flatMap((s) => s.olaylar.filter((o) => o.yap === 'soyle' && (!kim || o.kim === kim)).map((o) => o.metin as string));
const OYUNCAK_OGUT = 'Oyundan sonra toplarız.';

describe('film: Kino ve Oyuncak Sepeti', () => {
  it('cümleler ve öğüt (Mino anlatıcı, Kino kendi sesiyle en çok 3 kelime); v2: duygular ve sonda tek soru "Ne öğrendik?"', () => {
    expect(oyuncak.seslendir).toBe(true);
    expect(oSoz('kino')).toEqual(['Yaşasın!', 'Üzgünüm, Mino.', 'Ama toplamak sıkıcı.', 'Gol!', 'Bir gol daha!', 'Tertemiz!', 'Hem de gol!']);
    expect(oSoz('mino')).toEqual([
      'Kino bugün çok oynadı!',
      'Her yer oyuncak dolu!',
      'Ah! Küpe bastım.',
      'Canım biraz acıdı.',
      'Yerdeki oyuncak ayağa takılır.',
      'Hadi, toplayalım!',
      'Süper fikir, Kino!',
      'Her şey yerli yerinde!',
      'Toplamak da eğlenceliymiş!',
      'Ne öğrendik?',
      OYUNCAK_OGUT,
    ]);
    expect(oyuncak.sahneler.find((s) => 'ogut' in s)).toEqual({ ogut: OYUNCAK_OGUT });
    // tek soru: sonda Mino çocuğa sorar, en az 3 sn bekler, cevabı (öğüt) kendisi söyler; film öğütle biter
    expect(oSoz().filter((c) => c.includes('?'))).toEqual(['Ne öğrendik?']);
    const son = oSahneler[4].olaylar.filter((o) => o.yap === 'soyle').sort((a, b) => a.t - b.t);
    const soru = son.find((o) => o.metin === 'Ne öğrendik?')!;
    const cevap = son.at(-1)!;
    expect(cevap.metin).toBe(OYUNCAK_OGUT);
    expect(cevap.t - (soru.t + Number(soru.sure))).toBeGreaterThanOrEqual(3);
    for (const c of oSoz('kino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(3);
    for (const c of oSoz('mino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(5);
  });
  it('bütün cümleler seslendirme listesinde; Kino cümleleri Kino sesinde', () => {
    const liste = new Set(tumCumleler());
    for (const c of oSoz()) expect(liste.has(c), c).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const c of oSoz('kino')) expect(kino.has(c), c).toBe(true);
    for (const c of oSoz('mino')) expect(kino.has(c), c).toBe(false);
  });
  it('5 sahne, v2: 90-120 sn, ev setinde; olaylar sahne içinde, kimi sahnede', () => {
    expect(oSahneler.length).toBe(5);
    const toplam = oSahneler.reduce((t, s) => t + s.sure, 0);
    expect(toplam).toBeGreaterThanOrEqual(88);
    expect(toplam).toBeLessThanOrEqual(120);
    expect(oyuncak.malzeme).toBe('ev');
    for (const s of oSahneler) {
      expect(s.arka).toBe('ev');
      const oyuncular = Object.keys(s.oyuncular);
      const esyalar = Object.keys(s.esyalar ?? {});
      const varlar = new Set(['kamera', 'efekt', 'muzik', 'parilti', 'toz', ...oyuncular, ...esyalar]);
      for (const o of s.olaylar) {
        expect(o.t, `${s.ad} ${o.kim}`).toBeLessThanOrEqual(s.sure);
        expect(varlar.has(o.kim), `${s.ad}: ${o.kim}`).toBe(true);
        if (o.yap === 'yerine') expect(oyuncular, `${s.ad}: yerine ${o.hedef}`).toContain(o.hedef);
        if (o.yap === 'al' || o.yap === 'birak') expect(esyalar, `${s.ad}: ${o.yap} ${o.esya}`).toContain(o.esya);
      }
      // sepet + küp kümesinin kopyası her sahnede (kanepedekilerin önünde kalır)
      expect(s.esyalar?.kume?.tip).toBe('on-kume');
    }
  });
  it('Mino küpe basıp kayar; top ve üç küp sepete girer (ağız çizgisinde kırpılır); Mino pozları ve Kino yan koşusu', () => {
    const hepsi = oSahneler.flatMap((s) => s.olaylar);
    expect(oSahneler[1].olaylar.some((o) => o.kim === 'mino' && o.yap === 'durus' && o.otur === 1)).toBe(true);
    expect(oSahneler[1].olaylar.some((o) => o.kim === 'efekt' && o.yap === 'vin')).toBe(true);
    for (const e of ['top', 'k1', 'k2', 'k3']) expect(hepsi.some((o) => o.kim === e && o.yap === 'kirp'), e).toBe(true);
    for (const k of ['k1', 'k2', 'k3']) expect(oSahneler[0].esyalar?.[k].tip.startsWith('kup-'), k).toBe(true);
    const mino = hepsi.filter((o) => o.kim === 'mino' && o.yap === 'durus');
    expect(mino.some((o) => Number(o.yukSag) >= 30 || Number(o.yukSol) >= 30), 'kalkık kol / işaret').toBe(true);
    expect(mino.some((o) => o.saril === 1), 'sarılma').toBe(true);
    expect(hepsi.some((o) => o.kim === 'kinoy' && o.stil === 'kos')).toBe(true);
    // finalde ikisi kanepede oturur; küme o an öne geçer
    const son = oSahneler[4].olaylar;
    expect(son.some((o) => o.kim === 'kume' && o.yap === 'z' && Number(o.z) > 20)).toBe(true);
    expect(son.some((o) => o.kim === 'kino' && o.yap === 'durus' && o.otur === 1)).toBe(true);
    expect(son.some((o) => o.kim === 'mino' && o.yap === 'durus' && o.otur === 1)).toBe(true);
  });
  it('efektler tanımlı; müzik dosyaları var; sentez müzik kapalı', () => {
    for (const s of oSahneler)
      for (const o of s.olaylar) {
        if (o.kim === 'efekt') expect(Object.keys(FILM_EFEKT), o.yap).toContain(o.yap);
        if (o.kim === 'muzik' && o.yap === 'dosya') expect(existsSync(`assets/muzik/${o.ad}.mp3`), String(o.ad)).toBe(true);
      }
    expect((oyuncak as { sentez?: boolean }).sentez).toBe(false);
  });
});
