import { describe, expect, it } from 'vitest';
import { eksikler, kurabiyeAdlari, resim, surumTablosu, yuva } from '../../pasta/src/resimler';

describe('Pasta Otobüsü görsel yuvaları', () => {
  it('en yüksek sürüm seçilir; sürümsüz ad da olur', () => {
    const t = surumTablosu({ '../../assets/pasta/firin-1.webp': 'a', '../../assets/pasta/firin-2.webp': 'b', '../../assets/pasta/kurabiye-kalp-cig.webp': 'c' });
    expect(t.get('firin')).toBe('b');
    expect(t.get('kurabiye-kalp-cig')).toBe('c');
  });
  it('adaylardan ilk bulunan; hiçbiri yoksa null (kod çizimi kalır)', () => {
    const t = surumTablosu({ '../../assets/pasta/kasa-pembe-1.webp': 'k' });
    expect(resim(['kasa', 'kasa-pembe'], t)).toBe('k');
    expect(resim(['kumbara'], t)).toBeNull();
    expect(eksikler(['kalp'], ['pembe'], ['cilek'], t)).toContain('kurabiye-kalp-krema-pembe');
  });
  it('kurabiye adları: hamur topu, hâller, kremalı', () => {
    expect(kurabiyeAdlari('yildiz', 'krema', 'mavi')[0]).toBe('kurabiye-yildiz-krema-mavi');
    expect(kurabiyeAdlari('kalp', 'hamur-topu')[0]).toBe('kurabiye-kalp-hamur-topu');
  });
  it('gelen görseller bağlı: arka plan, tezgâh, fırın', () => {
    expect(yuva('arka')).toBeTruthy();
    expect(yuva('tezgahOn')).toBeTruthy();
    expect(yuva('firin')).toBeTruthy();
  });
});
