import { describe, expect, it } from 'vitest';
import { ERISIM, erisimTuru, kilitliMi } from '../../src/engine/erisim';
import { aynaDepo, aynala, geriYukle, type KaliciDepo } from '../../src/kabuk/kalici';
import { ayaBol, denemeGunu } from '../../src/abonelik/satin';
import { KAPI_BASAMAK, KAPI_HAK, kapiBeklemesi, kapiSorusu, sayiYazi } from '../../src/ui/ebeveyn-kapisi';
import { geriKarari, menuSayfasiMi } from '../../src/kabuk/yon';
import { menuOyunlari, OYUNLAR } from '../../uygulama/src/oyunlar';
import { katalog } from '../../film/src/katalog';

describe('erişim tablosu', () => {
  const ac = { etkin: true, premium: false };
  it('Barış\'ın varsayılanı: Kartlar, Mino\'nun Karpuzu ve Elektrikler Kesildi! ücretsiz, gerisi abonelikle', () => {
    expect(kilitliMi('kartlar', ac)).toBe(false);
    expect(kilitliMi('film/mino-karpuz', ac)).toBe(false);
    expect(kilitliMi('macera/elektrik', ac)).toBe(false);
    for (const id of ['pazar', 'canlan', 'pasta', 'dedektif', 'film/kino-oyuncak', 'macera/dogumgunu', 'macera/ege', 'macera/banyo', 'macera/salincak'])
      expect(kilitliMi(id, ac), id).toBe(true);
  });
  it('bölümlü oyunların menü kartı açık (içinde ücretsiz bölüm var); bilinmeyen içerik abonelikle', () => {
    expect(erisimTuru('macera')).toBe('ucretsiz');
    expect(erisimTuru('film')).toBe('ucretsiz');
    expect(erisimTuru('film/yeni-bir-film')).toBe('abonelik');
    expect(erisimTuru('yeni-oyun')).toBe('abonelik');
  });
  it('web sitesinde (kilitler etkin değil) ve abonelikte her şey açık', () => {
    for (const id of [...Object.keys(ERISIM), 'macera/ege', 'film/kino-lutfen']) {
      expect(kilitliMi(id, { etkin: false, premium: false })).toBe(false);
      expect(kilitliMi(id, { etkin: true, premium: true })).toBe(false);
    }
  });
  it('ücretsiz film gerçekten katalogda var', () => {
    expect(katalog().map((f) => f.ad)).toContain('mino-karpuz');
  });
  it('menüdeki her oyun tabloda', () => {
    for (const k of OYUNLAR) expect(['ucretsiz', 'abonelik']).toContain(erisimTuru(k.id));
  });
});

describe('uygulama menüsü', () => {
  it('web ve uygulama: aynı 8 kart (Dedektif Mino eklendi), sıra korunur, Pasta geniş ve sonda', () => {
    for (const u of [menuOyunlari(false), menuOyunlari(true)]) {
      expect(u.map((k) => k.id)).toEqual(['kartlar', 'pazar', 'canlan', 'macera', 'film', 'okul', 'dedektif', 'pasta']);
      expect(u.filter((k) => k.genis).map((k) => k.id)).toEqual(['pasta']);
      // ızgara boşluksuz: 8 kart (çift) → 2 sütunda 2 × 4, 4 sütunda 4 × 2 (geniş kart bir hücre);
      // 3 sütunda geniş kart iki hücre: 7 normal + 2 = 9 → 3 × 3
      const normal = u.filter((k) => !k.genis).length;
      expect(normal).toBe(7);
      expect(u.length % 2).toBe(0);
      expect(u.length % 4).toBe(0);
      expect((normal + 2) % 3).toBe(0);
    }
  });
});

describe('ebeveyn kapısı', () => {
  it('sayıları yazıyla söyler', () => {
    expect(sayiYazi(7)).toBe('yedi');
    expect(sayiYazi(10)).toBe('on');
    expect(sayiYazi(14)).toBe('on dört');
    expect(sayiYazi(39)).toBe('otuz dokuz');
    expect(sayiYazi(48)).toBe('kırk sekiz');
  });
  it('iki basamaklı + tek basamaklı, soru yazıyla (rakam yok)', () => {
    for (let i = 0; i < 200; i++) {
      const s = kapiSorusu();
      expect(s.a).toBeGreaterThanOrEqual(11);
      expect(s.a).toBeLessThanOrEqual(39);
      expect(s.b).toBeGreaterThanOrEqual(3);
      expect(s.b).toBeLessThanOrEqual(9);
      expect(s.yazi).not.toMatch(/\d/);
      expect(s.yazi).toMatch(/ artı .* kaç eder\?$/);
    }
    expect(kapiSorusu(() => 0).yazi).toBe('On bir artı üç kaç eder?');
  });
  it('cevap hep iki basamaklı (iki kutucuk yeter)', () => {
    for (let i = 0; i < 200; i++) {
      const s = kapiSorusu();
      expect(String(s.a + s.b)).toHaveLength(KAPI_BASAMAK);
    }
  });
  it('rastgele tuşa basan geçemesin: her 3 yanlışta giderek uzayan bekleme', () => {
    expect(KAPI_HAK).toBe(3);
    expect([0, 1, 2].map(kapiBeklemesi)).toEqual([0, 0, 0]);
    expect(kapiBeklemesi(3)).toBe(20_000);
    expect(kapiBeklemesi(4)).toBe(0);
    expect(kapiBeklemesi(6)).toBe(40_000);
    expect(kapiBeklemesi(9)).toBe(60_000);
    expect(kapiBeklemesi(30)).toBe(60_000);
  });
});

describe('Android geri tuşu', () => {
  it('pencere kapanır, oyundan menüye, yalnız menüde çıkış', () => {
    expect(geriKarari({ pencereAcik: true, sayfaIsledi: false, menude: true })).toBe('pencere');
    expect(geriKarari({ pencereAcik: false, sayfaIsledi: true, menude: true })).toBe('yok');
    expect(geriKarari({ pencereAcik: false, sayfaIsledi: false, menude: true })).toBe('cik');
    expect(geriKarari({ pencereAcik: false, sayfaIsledi: false, menude: false })).toBe('menu');
  });
  it('ana menü sayfası kökte, oyunlar klasörde', () => {
    expect(menuSayfasiMi('/')).toBe(true);
    expect(menuSayfasiMi('/index.html')).toBe(true);
    for (const y of ['/pasta/', '/kartlar/index.html', '/film/', '/okul/']) expect(menuSayfasiMi(y), y).toBe(false);
  });
});

describe('abonelik planları', () => {
  it('deneme süresi gün olarak', () => {
    expect(denemeGunu('DAY', 7)).toBe(7);
    expect(denemeGunu('WEEK', 1)).toBe(7);
    expect(denemeGunu('D', 3)).toBe(3);
    expect(denemeGunu(undefined, 7)).toBeNull();
    expect(denemeGunu('DAY', 0)).toBeNull();
  });
  it('yıllık fiyatın aylığı', () => {
    expect(ayaBol(499, 'TRY')).toMatch(/41,58/);
    expect(ayaBol(0, 'TRY')).toBeNull();
  });
});

describe('kalıcı kayıt aynası (Preferences)', () => {
  const sahte = () => {
    const yerel = new Map<string, string>();
    const kalici = new Map<string, string>();
    const y = { getItem: (k: string) => yerel.get(k) ?? null, setItem: (k: string, v: string) => void yerel.set(k, v), removeItem: (k: string) => void yerel.delete(k) };
    const p: KaliciDepo = {
      get: async (k) => kalici.get(k) ?? null,
      set: async (k, v) => void kalici.set(k, v),
      remove: async (k) => void kalici.delete(k),
      keys: async () => [...kalici.keys()],
    };
    return { yerel, kalici, y, p };
  };
  it('Minkino kayıtları iki yere yazılır, diğerleri yalnız yerele', async () => {
    const { yerel, kalici, y, p } = sahte();
    const d = aynaDepo(y, p);
    d.setItem('minkino-kartlar-v1', '{"a":1}');
    d.setItem('baska', 'x');
    await Promise.resolve();
    expect(yerel.get('minkino-kartlar-v1')).toBe('{"a":1}');
    expect(kalici.get('minkino-kartlar-v1')).toBe('{"a":1}');
    expect(kalici.has('baska')).toBe(false);
    d.removeItem('minkino-kartlar-v1');
    await Promise.resolve();
    expect(kalici.has('minkino-kartlar-v1')).toBe(false);
  });
  it('yerel silinmişse geri yükler; açılışta yerelde olanı ezmez', async () => {
    const { yerel, kalici, y, p } = sahte();
    kalici.set('minkino-pazar-v1', 'eski-kayit');
    kalici.set('minkino-pasta-v1', 'pasta');
    yerel.set('minkino-pasta-v1', 'yeni');
    // oyun açılışta varsayılan yazmış olsa bile (sayfa açılırken yoktu) kalıcıdaki kayıt geri gelir
    yerel.set('minkino-pazar-v1', 'varsayilan');
    const ilk = new Set(['minkino-pasta-v1']);
    expect(await geriYukle(y, p, (k) => ilk.has(k))).toBe(1);
    expect(yerel.get('minkino-pazar-v1')).toBe('eski-kayit');
    expect(yerel.get('minkino-pasta-v1')).toBe('yeni');
  });
  it('aynadan önceki kayıtlar da kalıcıya yazılır', async () => {
    const { yerel, kalici, y, p } = sahte();
    yerel.set('minkino-canlan-v1', 'c');
    yerel.set('baska', 'b');
    expect(await aynala([...yerel.keys()], y, p)).toBe(1);
    expect(kalici.get('minkino-canlan-v1')).toBe('c');
    expect(await aynala([...yerel.keys()], y, p)).toBe(0);
  });
});
