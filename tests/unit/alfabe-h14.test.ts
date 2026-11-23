import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { h14Acik, OLTA_CIZIMLERI, SES_KUTUSU_CIZIMLERI } from '../../alfabe/src/h14-cizimler';

// Paket Harf-H14 (alfabe/src/h14-cizimler.ts): yeni görünüş yalnız çizimlerin hepsi gelince açılır.
describe('Paket Harf-H14 açılış kuralı', () => {
  it('gerçek uygulamada: bir çizim bile eksikse eski akış', () => {
    expect(h14Acik({ eksik: 1, testModu: false, istek: null })).toBe(false);
    expect(h14Acik({ eksik: 0, testModu: false, istek: null })).toBe(true);
    // test dışında ?h14 isteği bir şey değiştirmez
    expect(h14Acik({ eksik: 3, testModu: false, istek: '1' })).toBe(false);
  });
  it('test kipinde ?h14=1 açar, ?h14=0 kapatır', () => {
    expect(h14Acik({ eksik: 5, testModu: true, istek: '1' })).toBe(true);
    expect(h14Acik({ eksik: 0, testModu: true, istek: '0' })).toBe(false);
    expect(h14Acik({ eksik: 5, testModu: true, istek: null })).toBe(false);
  });
  it('çizim listeleri brief’le aynı: Ses Kutusu 5, Olta 7, adlar tekil', () => {
    expect(SES_KUTUSU_CIZIMLERI).toHaveLength(5);
    expect(OLTA_CIZIMLERI).toHaveLength(7);
    expect(new Set([...SES_KUTUSU_CIZIMLERI, ...OLTA_CIZIMLERI]).size).toBe(12);
    const brief = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
    const bolum = brief.slice(brief.indexOf('Paket Harf-H14'));
    for (const ad of SES_KUTUSU_CIZIMLERI) expect(bolum, ad).toContain('`' + ad + '.webp`');
    for (const ad of OLTA_CIZIMLERI) expect(bolum, ad).toContain(ad + '.webp');
  });
  it('yeni Ceren kayıtları var ve metinleri yazılı', () => {
    const metinler = JSON.parse(readFileSync('alfabe/ses-metinleri.json', 'utf8'));
    for (const id of ['soyle-kutu-dokun', 'olta-yonerge']) {
      expect(existsSync('assets/alfabe/ses/' + id + '.mp3'), id).toBe(true);
      expect(metinler[id], id).toBeTruthy();
    }
  });
});
