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

import { resimTabaklari } from '../../alfabe/src/obur-tabaklari';
import { existsSync } from 'node:fs';

// Obur yalnız 2–3 yaşın dersinde çıkar (19 Kasım: 4/5+ dalı kaldırıldı).
it('2–3 yaşta Obur üç tabakta her soruda yeni bir resmi ister',()=>{
  for(const ders of dersler){
    const sorular=resimTabaklari(ders,()=>.42);
    expect(sorular.length).toBe(3);
    const dogrular=sorular.map(s=>s.kartlar.find(k=>k.id===s.hedefler[0])!);
    expect(new Set(dogrular.map(k=>k.ad)).size).toBe(sorular.length);
    for(const s of sorular){
      const dogru=s.kartlar.find(k=>k.id===s.hedefler[0])!;
      expect(s.etiket).toBe(ders.upper);
      expect(dogru.resim, dogru.ad).toBeTruthy();
      const h=ders.lower;
      expect(s.kartlar.filter(k=>h==='ğ'?k.ad.toLocaleLowerCase('tr').includes(h):k.ad.toLocaleLowerCase('tr').startsWith(h))).toEqual([dogru]);
      for(const id of [...s.sesler,...s.kartlar.map(k=>k.ses)])expect(existsSync('assets/alfabe/ses/'+id+'.mp3'),id).toBe(true);
    }
  }
});
