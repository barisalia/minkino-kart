import { expect, it } from 'vitest';
import dersler from '../../alfabe/src/harfler.json';
import sesler from '../../alfabe/ses-metinleri.json';
import { kutuTurlari } from '../../alfabe/src/harf-kutusu-kartlari';

it.each(dersler)('$upper kutusunda iki ayrı lokmanın her birinde tek doğru resim vardır', ders => {
  const turlar = kutuTurlari(ders);
  expect(turlar).toHaveLength(2);
  expect(turlar[0].hedef.ad).toBe(ders.example);
  expect(turlar[1].hedef.ad).not.toBe(ders.example);
  for (const {hedef, secenekler} of turlar) {
    expect(new Set(secenekler.map(k => k.id)).size).toBe(3);
    const uyanlar = secenekler.filter(k => {
      const ad = k.ad.toLocaleLowerCase('tr');
      return ders.lower === 'ğ' ? ad.includes('ğ') : ad.startsWith(ders.lower);
    });
    expect(uyanlar).toEqual([hedef]);
    for (const kart of secenekler) {
      expect(kart.gorsel).toBeTruthy();
      expect(sesler).toHaveProperty(kart.ses);
    }
  }
});
