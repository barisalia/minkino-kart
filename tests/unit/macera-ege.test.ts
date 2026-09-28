import { describe, expect, it } from 'vitest';
import E from '../../content/macera-ege.json';
import { normal, tumCumleler } from '../../src/audio/cumleler';
import type { Ayar, Ozellik } from '../../ses-testi/src/analiz';
import analizKaynak from '../../ses-testi/src/analiz.ts?raw';
import egeKaynak from '../../macera/src/ege.ts?raw';
import NINNI from '../../assets/muzik/ninni.json';
import { CEE_TURLARI, EGE_RITIM, egeAyar, gulme, kabulMu, kucukMu, ninni, NINNI_DIZE, NINNI_REF_MIDI, ninniSonuMs, Salinim, SERBEST_KUKLA } from '../../macera/src/ege-mantik';
import { SesSeviyesi, sesDurumu, soyleyisSonucu, YUKSEK_UST, type Soyleyis } from '../../macera/src/ege-seviye';
import { ritimAyniMi } from '../../ses-testi/src/analiz';

const AYAR: Ayar = { taban: -60, duyarlilik: 0, kare: 1024 / 48000 };
/** Yapay kare: taban üstü dB, perde (Hz ya da null), spektral merkez */
const kare = (ust: number, perde: number | null, merkez = 800): Ozellik => ({ db: AYAR.taban + ust, duzluk: 0.1, kalinOran: 0.2, merkez, perde, perdeGuven: perde ? 0.9 : 0, altDb: [] });
const besle = (s: SesSeviyesi, o: Ozellik, sn: number) => {
  for (let t = 0; t < sn; t += AYAR.kare) s.kare(o);
};

describe('Ege Uyuyor: yaş ayarları (yalnız senaryonun dediği yerlerde)', () => {
  it('3-4 ve 5-6 yaş', () => {
    expect(kucukMu(4)).toBe(true);
    expect(kucukMu(5)).toBe(false);
    const k = egeAyar(3);
    const b = egeAyar(6);
    expect([k.kasik, b.kasik]).toEqual([3, 4]);
    expect([k.yavasUfle, b.yavasUfle]).toEqual([false, true]);
    expect([k.ritim, b.ritim]).toEqual([false, true]);
    expect([k.yumusak, b.yumusak]).toEqual([false, true]);
    expect([k.dize, b.dize]).toEqual([2, 3]);
    expect([k.sessiz, b.sessiz]).toEqual([3.5, 5]);
    expect(k.tik).toBe(3);
  });
  it('kuklalar ve cee-ee her yaşta aynı', () => {
    expect(SERBEST_KUKLA).toBe(4);
    expect(CEE_TURLARI).toEqual(['ada', 'can', 'elif', 'mino', 'hepsi']);
  });
  it('kolaylık: her yaşta 3. denemede kabul (kilitlenme yok)', () => {
    expect(kabulMu(3, 1)).toBe(false);
    expect(kabulMu(3, 2)).toBe(true);
    expect(kabulMu(6, 1)).toBe(false);
    expect(kabulMu(6, 2)).toBe(true);
  });
});

describe('Ege Uyuyor: çıngırak ritmi, kuklalar, ninni, beşik', () => {
  it("Ege'nin ritmi (tık-tık … tıık) tempodan bağımsız taklit edilir", () => {
    expect(ritimAyniMi(EGE_RITIM, [10, 10.5, 11.6])).toBe(true);
    expect(ritimAyniMi(EGE_RITIM, [10, 10.7, 11.4])).toBe(false);
    expect(ritimAyniMi(EGE_RITIM, [10, 10.3])).toBe(false);
  });
  it('gülme her konuşmada büyür; çok ince seste kahkaha', () => {
    expect(gulme(1, 3)).toBe('kikir');
    expect(gulme(1, 9)).toBe('kahkaha');
    expect(gulme(4, 3)).toBe('kahkaha');
  });
  it('ninni: tablo kaydın JSON dosyasından kurulur (notalar, vuruşlar, heceler, zamanlar; tahminiler dahil)', () => {
    const H = NINNI.heceler;
    const n4 = ninni(4);
    expect(n4.length).toBe(H.length);
    n4.forEach((n, i) => {
      expect(n.hece).toBe(H[i].hece);
      expect(n.midi).toBe(H[i].midi);
      expect(n.vurus).toBe(H[i].vurus);
      expect(n.satir).toBe(H[i].satir);
      expect(n.basMs).toBe(H[i].basla_ms);
      expect(n.sureMs).toBeGreaterThan(0);
    });
    expect(H.some((x) => x.tahmini)).toBe(true);
    expect(NINNI_REF_MIDI).toBe(H[0].midi);
    expect(NINNI_DIZE).toBe(4);
    expect(ninniSonuMs(2)).toBeLessThan(ninniSonuMs(4));
  });
  it('ninni: hece sayısı yeni sözlerle eşleşir, dize sayısı yaşa göre', () => {
    const SOZLER = ['Dandini dandini Ege', 'Yumdu gözünü bebek', 'Ay geldi, yıldız geldi', 'Uyu da büyü Ege'];
    const kucuk = (t: string) => t.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü]/g, '');
    SOZLER.forEach((soz, satir) => {
      const dize = ninni(4).filter((n) => n.satir === satir);
      expect(kucuk(dize.map((n) => n.hece).join(''))).toBe(kucuk(soz));
      // Türkçede hece sayısı = ünlü sayısı
      expect(dize.length).toBe((kucuk(soz).match(/[aeıioöuü]/g) ?? []).length);
    });
    expect(new Set(ninni(2).map((n) => n.satir)).size).toBe(egeAyar(3).dize);
    expect(new Set(ninni(egeAyar(6).dize).map((n) => n.satir)).size).toBe(3);
    expect(ninni(1).map((n) => n.hece).join('')).toBe('DandinidandiniEge');
  });
  it('beşik sallama: her yön değişimi bir salınım; titreme sayılmaz', () => {
    const s = new Salinim(20);
    expect(s.hareket(30)).toBe(false);
    expect(s.hareket(-30)).toBe(true);
    expect(s.hareket(-5)).toBe(false);
    expect(s.hareket(5)).toBe(true);
    // küçük titreme: yön değişse de yol kısa
    expect(s.hareket(-3)).toBe(false);
    expect(s.hareket(3)).toBe(false);
    expect(s.sayi).toBe(2);
  });
});

describe('Ege Uyuyor: kısık ses ve fısıltı (mevcut seviye ölçümünü saran yeni sınıf)', () => {
  it('kare durumu: sessiz, fısıltı, kısık, yüksek', () => {
    expect(sesDurumu(kare(3, null), AYAR)).toBe('sessiz');
    expect(sesDurumu(kare(18, null, 3000), AYAR)).toBe('fisilti');
    expect(sesDurumu(kare(20, 250), AYAR)).toBe('kisik');
    expect(sesDurumu(kare(YUKSEK_UST + 2, 250), AYAR)).toBe('yuksek');
    expect(sesDurumu(kare(40, 250), AYAR)).toBe('yuksek');
  });
  it('söyleyiş sonucu: fısıltı çoğunluktaysa fısıltı; bağırma kısa da olsa baskın', () => {
    expect(soyleyisSonucu(0.8, 0.2, 0)).toBe('fisilti');
    expect(soyleyisSonucu(0.2, 0.9, 0)).toBe('kisik');
    expect(soyleyisSonucu(0.6, 0.2, 0.3)).toBe('yuksek');
  });
  it('söyleyiş parçası: ses başlar, 0.6 sn susunca biter', () => {
    const s = new SesSeviyesi(AYAR);
    const olan: Soyleyis[] = [];
    s.onSoyleyis = (x) => olan.push(x);
    besle(s, kare(2, null), 0.5);
    besle(s, kare(18, null, 3200), 1);
    expect(olan).toHaveLength(0);
    besle(s, kare(2, null), 0.8);
    expect(olan).toHaveLength(1);
    expect(olan[0].sonuc).toBe('fisilti');
    besle(s, kare(34, 240), 0.8);
    besle(s, kare(2, null), 0.8);
    expect(olan[1].sonuc).toBe('yuksek');
  });
  it('kısa çıtırtı (tek kare) anlık durumu değiştirmez; sürekli yüksek ses süresi birikir', () => {
    const s = new SesSeviyesi(AYAR);
    besle(s, kare(20, 250), 0.3);
    s.kare(kare(40, 250));
    expect(s.durum).toBe('kisik');
    besle(s, kare(40, 250), 0.5);
    expect(s.durum).toBe('yuksek');
    expect(s.yuksekSure).toBeGreaterThan(0.4);
  });
  it('kilitli eşiklere dokunulmadı; bölüm katı üflemeyi kullanır', () => {
    expect(analizKaynak).toContain('if (ust < 8) return \'sessiz\';');
    expect(analizKaynak).toContain('if (ust > 36) return \'bagirma\';');
    expect(analizKaynak).toContain("if (o.perde === null && o.merkez > 1500 && ust < 26) return 'fisilti';");
    expect(egeKaynak).toContain('new Ufleme(kulak.ayar, 0.5)');
    expect(egeKaynak).not.toMatch(/new Ufleme\([^)]*,\s*true\)/);
  });
});

describe('Ege Uyuyor: cümleler', () => {
  const hepsi = new Set(tumCumleler());
  it('Mino ve anne cümleleri seslendirme listesinde; balon, ipucu, başlık değil', () => {
    for (const t of [...Object.values(E.mino), ...Object.values(E.anne)]) expect(hepsi.has(normal(t))).toBe(true);
    expect(hepsi.has(normal(E.balon.anne_uykuda))).toBe(false);
    expect(hepsi.has(normal(E.ipucu.battaniye))).toBe(false);
    expect(hepsi.has(normal(E.kart))).toBe(false);
  });
  it('cümleler kısa (en çok 8 kelime, 48 harf)', () => {
    for (const t of [...Object.values(E.mino), ...Object.values(E.anne)]) {
      expect(t.split(/\s+/).length).toBeLessThanOrEqual(8);
      expect(t.length).toBeLessThanOrEqual(48);
    }
  });
});
