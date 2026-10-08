/**
 * Mağaza inceleme kodu: özet karşılaştırma ve erişim (kilit) geçersiz kılma.
 * Gerçek kod repoda yok: özet denetimi deneme bir değerle yapılır; gerçek kod yalnız INCELEME_KODU ortam
 * değişkeni verilirse denenir (yoksa o test atlanır).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INCELEME_OZETI, kodDogruMu, kodNormal, ozet } from '../../src/abonelik/inceleme';

// deneme değeri ve onun özeti (node:crypto ile ayrıca hesaplandı); gerçek kodla ilgisi yok
const DENEME = 'deneme-kodu-123';
const DENEME_OZETI = '82ff9fef8e32f3ef9788e3f1865c57266508b655e8fecbff08c93bf4728b7ebe';

describe('inceleme kodu: özet', () => {
  it('girdi normalleşir: boşluk atılır, büyük harf (yerelden bağımsız)', () => {
    expect(kodNormal('  abc-def-12 \n')).toBe('ABC-DEF-12');
    expect(kodNormal('iı')).toBe('II');
  });
  it('SHA-256 özeti doğru (bilinen değer)', async () => {
    expect(await ozet('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(await ozet(kodNormal(DENEME))).toBe(DENEME_OZETI);
  });
  it('doğru kod (küçük harf, boşluklu da) kabul; yanlış ya da boş red', async () => {
    expect(await kodDogruMu(DENEME, DENEME_OZETI)).toBe(true);
    expect(await kodDogruMu(`  ${DENEME.toUpperCase()}  `, DENEME_OZETI)).toBe(true);
    expect(await kodDogruMu('deneme-kodu-124', DENEME_OZETI)).toBe(false);
    expect(await kodDogruMu('', DENEME_OZETI)).toBe(false);
    expect(await kodDogruMu('   ', DENEME_OZETI)).toBe(false);
    // deneme değeri gerçek kodun yerine geçmez
    expect(await kodDogruMu(DENEME)).toBe(false);
  });
  it('repoda yalnız özet var (64 onaltılık)', () => {
    expect(INCELEME_OZETI).toMatch(/^[0-9a-f]{64}$/);
  });
  it.skipIf(!process.env.INCELEME_KODU)('gerçek kod (INCELEME_KODU ortam değişkeninden) kabul', async () => {
    expect(await kodDogruMu(process.env.INCELEME_KODU!)).toBe(true);
    expect(await kodDogruMu(` ${process.env.INCELEME_KODU!.toLowerCase()} `)).toBe(true);
  });
});

describe('inceleme kodu: erişim', () => {
  let depo: Map<string, string>;
  beforeEach(() => {
    depo = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => depo.get(k) ?? null,
      setItem: (k: string, v: string) => void depo.set(k, String(v)),
      removeItem: (k: string) => void depo.delete(k),
    });
    // uygulamada, satın alma anahtarı varken (kilitler etkin)
    vi.resetModules();
    vi.doMock('../../src/kabuk/ortam', () => ({ kilitlerEtkin: () => true }));
  });
  afterEach(() => {
    vi.doUnmock('../../src/kabuk/ortam');
    vi.unstubAllGlobals();
  });

  it('kod girilince abonelikli içerik açılır; mağaza "premium yok" dese de açık kalır', async () => {
    const e = await import('../../src/engine/erisim');
    expect(e.incelemeAcikMi()).toBe(false);
    expect(e.premiumMu()).toBe(false);
    expect(e.kilitli('pazar')).toBe(true);
    expect(e.kilitli('macera/ege')).toBe(true);
    expect(e.kilitli('kartlar')).toBe(false);

    e.incelemeAc();
    expect(depo.get(e.INCELEME_ANAHTARI)).toBe('1');
    expect(e.incelemeAcikMi()).toBe(true);
    expect(e.premiumMu()).toBe(true);
    for (const id of ['pazar', 'canlan', 'pasta', 'dedektif', 'giysin/yaz', 'film/kino-oyuncak', 'macera/ege']) expect(e.kilitli(id), id).toBe(false);

    // RevenueCat'ten "premium yok" gelir (durum tazeleme): inceleme kilidi açık kalır
    e.premiumAyarla(false);
    expect(e.kilitli('pazar')).toBe(false);
  });

  it('kayıtlı bayrak açılışta okunur; başka değer açmaz', async () => {
    depo.set('minkino-inceleme', '1');
    const e = await import('../../src/engine/erisim');
    expect(e.kilitli('pazar')).toBe(false);

    vi.resetModules();
    depo.set('minkino-inceleme', 'evet');
    const e2 = await import('../../src/engine/erisim');
    expect(e2.kilitli('pazar')).toBe(true);
  });
});
