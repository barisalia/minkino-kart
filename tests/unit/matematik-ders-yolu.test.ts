import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DERSLER, GEREKLI_CIZIMLER, GEREKLI_SESLER, HATIRA, KOSE, hazirSesi, hepsiBitti, kutlanacak, yasDersleri, yolDurumu, yolKaydiCoz, type DersId,
} from '../../matematik/src/ders-yolu-mantik';

const kume = (...d: DersId[]) => (x: DersId) => d.includes(x);
const hepsi = () => true;

describe('Ders yolu · Minkino Bahçe Şenliği', () => {
  it('sıra Clements & Sarama’ya göre: Toplama, 11–20’den önce; 2–3 ve 4 yaşta ilk dört ders', () => {
    expect(DERSLER).toEqual(['sayilar', 'sekiller', 'olcu', 'oruntu', 'topla', 'onluk']);
    expect(yasDersleri(3)).toEqual(['sayilar', 'sekiller', 'olcu', 'oruntu']);
    expect(yasDersleri(4)).toHaveLength(4);
    expect(yasDersleri(5)).toEqual(DERSLER);
    expect(yasDersleri(6)).toEqual(DERSLER);
    // Kilit aynı kalır: her ders açtığı oyuncağın kilidinin arkasında.
    expect(KOSE).toEqual({ sayilar: 'sayi', sekiller: 'sekil', olcu: 'olcu', oruntu: 'fener', topla: 'sayi', onluk: 'sayi' });
  });

  it('yol durumu: ilk bitmemiş hazır ders sırada; sonrakiler bekler; hazır olmayan atlanır; biten bitti kalır', () => {
    expect(yolDurumu(DERSLER, kume(), hepsi)).toEqual({ sayilar: 'sirada', sekiller: 'bekliyor', olcu: 'bekliyor', oruntu: 'bekliyor', topla: 'bekliyor', onluk: 'bekliyor' });
    expect(yolDurumu(DERSLER, kume('sayilar', 'sekiller'), hepsi).olcu).toBe('sirada');
    // Ölçü dersinin çizimleri yok: yol onu atlar, Örüntü sırada.
    const d = yolDurumu(DERSLER, kume('sayilar', 'sekiller'), (x) => x !== 'olcu');
    expect(d.olcu).toBe('hazirlaniyor');
    expect(d.oruntu).toBe('sirada');
    // Sırasız biten (oyuncağından açılmış eski kayıt) yine bitti görünür.
    expect(yolDurumu(DERSLER, kume('oruntu'), hepsi)).toMatchObject({ sayilar: 'sirada', oruntu: 'bitti' });
    // Hiçbir yerde iki "sırada" yok.
    for (let m = 0; m < 64; m++) {
      const b = (x: DersId) => !!(m & (1 << DERSLER.indexOf(x)));
      expect(Object.values(yolDurumu(DERSLER, b, hepsi)).filter((s) => s === 'sirada').length).toBeLessThanOrEqual(1);
    }
    expect(hepsiBitti(yasDersleri(3), kume('sayilar', 'sekiller', 'olcu', 'oruntu'))).toBe(true);
  });

  it('kutlama: biten ama canlanışı gösterilmemiş dersler bir kez kutlanır', () => {
    const k = yolKaydiCoz(JSON.stringify({ tanitildi: true, kutlanan: ['sayilar', 'bilinmeyen'] }));
    expect(k.kutlanan).toEqual(['sayilar']);
    expect(kutlanacak(DERSLER, kume('sayilar', 'sekiller'), k)).toEqual(['sekiller']);
    expect(yolKaydiCoz('bozuk')).toEqual({ tanitildi: false, kutlanan: [] });
  });

  it('Astra M8 (yeniden): fon, altı parçanın iki hâli, pano ve tabela; Ceren’in sözleri kayıtlı; hatıralar derslerin kendi çizimleri', () => {
    expect(GEREKLI_CIZIMLER).toHaveLength(15);
    expect(new Set(GEREKLI_CIZIMLER).size).toBe(15);
    for (const id of GEREKLI_SESLER) expect(existsSync('assets/matematik/ders-yolu/ses/' + id + '.mp3'), id).toBe(true);
    for (const d of DERSLER) expect(GEREKLI_SESLER).toContain(hazirSesi(d));
    expect(existsSync('assets/' + HATIRA.sayilar + '.webp')).toBe(true);
    expect(existsSync('assets/' + HATIRA.sekiller + '.webp')).toBe(true);
  });
});
