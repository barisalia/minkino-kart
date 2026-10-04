import { existsSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import SL from '../../content/macera-salincak.json';
import KAYIT from '../../assets/muzik/salincak.json';
import { sarkiTablosu } from '../../src/audio/sarki-kayit';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import {
  canYuzu,
  dizeBaslari,
  egeItisi,
  EN_BUYUK_ACI,
  hopArtisi,
  itisPenceresi,
  kabulMu,
  kaydirakIlerle,
  minoItisi,
  OMEGA,
  parmakItisi,
  ritimTurlari,
  salincakAyar,
  SalinimSayaci,
  Sarkac,
  sayiSoyle,
  SUS_SURTUNME,
  surukleIlerle,
  yankiSonuc,
} from '../../macera/src/salincak-mantik';
import { CERCEVE, cimenKaynakEni, cimenYeri, kaymaNoktasi, KAYMA_YOLU, KUME_AYRI_ORAN, KUME_ORAN, PARK, PARK_ORAN, PARK_RESIM, parkV } from '../../macera/src/salincak-cizim';

describe('Salıncak Kimin: yaş ayarı (yalnız senaryonun dediği sahnelerde)', () => {
  it('3-4 yaş: 5 sallanış, zamanlama serbest, 2 dize; 5-6 yaş: 10 sallanış, halka penceresi, 4 dize', () => {
    for (const y of [3, 4]) expect(salincakAyar(y)).toMatchObject({ sayi: 5, hopPencere: false, dize: 2, darBant: false });
    for (const y of [5, 6]) expect(salincakAyar(y)).toMatchObject({ sayi: 10, hopPencere: true, dize: 4, darBant: true });
    // her yaşta aynı olanlar
    expect(salincakAyar(3).kayis).toBe(salincakAyar(6).kayis);
    expect(salincakAyar(3).fisiltiItis).toBe(salincakAyar(6).fisiltiItis);
  });
  it('her yaşta 3. denemede kabul', () => {
    expect(kabulMu(0)).toBe(false);
    expect(kabulMu(1)).toBe(false);
    expect(kabulMu(2)).toBe(true);
  });
});

describe('Sarkaç fiziği', () => {
  it('itilmeyen salıncak sürtünmeyle yavaşlar, uçlardan geçer', () => {
    const s = new Sarkac();
    s.genlikYap(0.4);
    let uc = 0;
    s.onUc = () => uc++;
    for (let i = 0; i < 60 * 4; i++) s.tik(1 / 60);
    expect(s.genlik).toBeLessThan(0.4);
    expect(s.genlik).toBeGreaterThan(0.1);
    // ~2.1 sn'lik periyot: 4 sn'de en az 3 uç
    expect(uc).toBeGreaterThanOrEqual(3);
    expect((2 * Math.PI) / OMEGA).toBeGreaterThan(1.8);
  });
  it('itişler genliği artırır ama sınırı geçmez; dört "Hop!" en yükseğe çıkarır', () => {
    const s = new Sarkac();
    for (let i = 0; i < 4; i++) {
      s.it(hopArtisi(4));
      for (let k = 0; k < 20; k++) s.tik(1 / 60);
    }
    expect(s.genlik).toBeGreaterThan(EN_BUYUK_ACI * 0.85);
    for (let i = 0; i < 10; i++) s.it(0.3);
    expect(s.genlik).toBeLessThanOrEqual(EN_BUYUK_ACI + 1e-9);
  });
  it('susunca (2 kat sürtünme) salıncak daha çabuk durur', () => {
    const a = new Sarkac();
    const b = new Sarkac();
    a.genlikYap(0.35);
    b.genlikYap(0.35);
    for (let i = 0; i < 60 * 5; i++) {
      a.tik(1 / 60);
      b.tik(1 / 60, SUS_SURTUNME);
    }
    expect(b.genlik).toBeLessThan(a.genlik * 0.8);
  });
  it('5-6 yaş itiş penceresi: yalnız sağ uca yakınken açık (duran salıncakta her zaman)', () => {
    const s = new Sarkac();
    expect(itisPenceresi(s)).toBe(true);
    s.genlikYap(0.3);
    // sağ uçta başlar: açık
    expect(itisPenceresi(s)).toBe(true);
    // çeyrek periyot sonra (dipte): kapalı
    for (let i = 0; i < 32; i++) s.tik(1 / 60);
    expect(itisPenceresi(s)).toBe(false);
    // yarım periyot sonra (sol uç): kapalı
    for (let i = 0; i < 31; i++) s.tik(1 / 60);
    expect(itisPenceresi(s)).toBe(false);
  });
});

describe('Sayma, kaydırak, yumuşak itiş', () => {
  it('alkış ancak salıncak bir salınımı tamamlayınca sayılır', () => {
    const c = new SalinimSayaci();
    expect(c.alkis()).toBe(true);
    expect(c.alkis()).toBe(false);
    c.uc();
    expect(c.alkis()).toBe(true);
    expect(c.sayi).toBe(2);
    expect(sayiSoyle(1)).toBe('Bir!');
    expect(sayiSoyle(10)).toBe('On!');
  });
  it("Can'ın yüzü her sayıda açılır", () => {
    expect(canYuzu(0, 10)).toBe(1);
    expect(canYuzu(5, 10)).toBeCloseTo(0.5);
    expect(canYuzu(10, 10)).toBe(0);
  });
  it('kaydırak: ses varken ilerler, kesilince durur; parmakla yalnız ileri', () => {
    expect(kaydirakIlerle(0.2, 0.5, false)).toBe(0.2);
    expect(kaydirakIlerle(0.2, 0.5, true)).toBeGreaterThan(0.2);
    expect(kaydirakIlerle(0.95, 1, true)).toBe(1);
    expect(surukleIlerle(0.5, 0.3)).toBe(0.5);
    expect(surukleIlerle(0.1, 0.8)).toBeCloseTo(0.45);
    expect(surukleIlerle(0.7, 0.93)).toBe(1);
  });
  it('Mino: 3-4 yaşta yalnız bağırma sert; 5-6 yaşta konuşmanın üstü de sert', () => {
    expect(minoItisi('yuksek', 0, false)).toBe('yumusak');
    expect(minoItisi('yuksek', 0.3, false)).toBe('sert');
    expect(minoItisi('yuksek', 0, true)).toBe('sert');
    expect(minoItisi('kisik', 0, true)).toBe('yumusak');
    expect(egeItisi('fisilti')).toBe('yumusak');
    expect(egeItisi('yuksek')).toBe('sert');
  });
  it('parmak: dokunuş ve kısa kaydırma yumuşak, uzun hızlı kaydırma sert', () => {
    expect(parmakItisi(0, 0.1)).toBe('yumusak');
    expect(parmakItisi(0.8, 0.3)).toBe('yumusak');
    expect(parmakItisi(2.5, 0.2)).toBe('sert');
    expect(parmakItisi(2.5, 2)).toBe('yumusak');
  });
});

describe('Tekerleme: ritim kayıttan çıkar (assets/muzik/salincak.json)', () => {
  const tablo = sarkiTablosu(KAYIT);
  it('dört dize, sözlerle aynı sayıda', () => {
    expect(dizeBaslari(tablo)).toHaveLength(4);
    expect(SL.sarki).toHaveLength(4);
  });
  it('her dizede iki vurgulu vuruş, dizenin içinde ve sırayla', () => {
    for (const dize of [2, 4]) {
      const t = ritimTurlari(tablo, dize);
      expect(t).toHaveLength(dize);
      for (const tur of t) {
        expect(tur.vuruslar).toHaveLength(2);
        expect(tur.vuruslar[0]).toBeGreaterThanOrEqual(tur.basMs);
        expect(tur.vuruslar[1]).toBeLessThanOrEqual(tur.bitMs);
        expect(tur.ara).toBeGreaterThan(400);
        // vuruşlar kayıttaki vuruş listesinden
        for (const v of tur.vuruslar) expect(KAYIT.vuruslar_ms).toContain(v);
      }
    }
  });
  it('yankı: sayı ±1 hoş görülür, 5-6 yaşta kopuk alkış sayılmaz', () => {
    expect(yankiSonuc([0, 1000], 2, 1170, true)).toBe('dogru');
    expect(yankiSonuc([0, 800, 1500], 2, 1170, true)).toBe('dogru');
    expect(yankiSonuc([0], 2, 1170, false)).toBe('az');
    expect(yankiSonuc([0, 300, 600, 900], 2, 1170, false)).toBe('cok');
    expect(yankiSonuc([0, 5000], 2, 1170, true)).toBe('az');
    expect(yankiSonuc([0, 5000], 2, 1170, false)).toBe('dogru');
  });
});

describe('Çizim ölçüleri', () => {
  it('kayma yolu tepeden başlar, alçalır ve düz çıkışla biter', () => {
    const bas = kaymaNoktasi(0);
    const son = kaymaNoktasi(1);
    expect(bas.x).toBeCloseTo(KAYMA_YOLU.p0[0]);
    expect(son.x).toBeCloseTo(KAYMA_YOLU.son[0]);
    expect(son.y).toBeGreaterThan(bas.y);
    let once = -Infinity;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const p = kaymaNoktasi(Math.min(1, t));
      expect(p.y).toBeGreaterThanOrEqual(once - 0.5);
      once = p.y;
    }
  });
  it('park arka planı: ufuk salıncak barının üstünde, zemin resmin kendi çimeni, çizili bank ve tahterevalli örtülü', async () => {
    const bar = 52 + CERCEVE.bar;
    // ufuk (uzak tepeler) barın epey üstünde: gök ve tepeler görünür
    expect(parkV(PARK.uzak, PARK_RESIM.ufuk)).toBeGreaterThan(bar + 15);
    // ön çimenin kenarı eşyaların (çerçeve ayakları v 52) arkasında, ağaçların dibi çimenin arkasında
    expect(PARK.cimenUst).toBeGreaterThan(52);
    expect(parkV(PARK.orta, PARK_RESIM.agacDibi)).toBeLessThan(PARK.cimenUst + 2);
    // tahterevalli çimenin arkasında kalır; bank kenar çalılarının boyunu aşmaz
    expect(parkV(PARK.orta, PARK_RESIM.tahterevalliUst)).toBeLessThanOrEqual(PARK.cimenUst + 1);
    expect(parkV(PARK.orta, PARK_RESIM.bankUst)).toBeLessThan(PARK.cimenUst + 30);
    // ön çimen şeridi dünyanın altından başlar, üst kenarı cimenUst'te
    const c = cimenYeri(20);
    expect(c.alt).toBe(-20);
    expect(c.alt + (c.boy * (1 - PARK_RESIM.cimenKenar)) / (1 - PARK_RESIM.cimenKaynak.y0)).toBeCloseTo(PARK.cimenUst);
    // şerit esnemez: kaynak bölgesinin oranı (resim pikseliyle) şeridin oranına eşit; köşe öbeklerine (x < 0.2) taşmaz
    const en = cimenKaynakEni(400, c.boy);
    expect((en * PARK_ORAN) / (1 - PARK_RESIM.cimenKaynak.y0)).toBeCloseTo(400 / c.boy, 6);
    expect(0.5 - en / 2).toBeGreaterThan(0.2);
    // köşe öbekleri de esnemez (kesilen bölge KUME_ORAN oranında)
    expect(KUME_ORAN).toBeCloseTo((PARK_RESIM.kume.w * PARK_ORAN) / (1 - PARK_RESIM.kume.y0), 6);
    // ayrı çizilmiş öbekler (varsa) kendi tuvalinin oranında durur
    for (const yan of ['sol', 'sag']) {
      const yol = `assets/film/park/kume-${yan}.webp`;
      if (!existsSync(yol)) continue;
      const m = await sharp(yol).metadata();
      expect(KUME_AYRI_ORAN).toBeCloseTo(m.width! / m.height!, 3);
    }
  });
});

describe('Cümleler', () => {
  const hepsi = new Set(tumCumleler());
  it('Mino ve Kino cümleleri seslendirme listesinde; balon, ipucu ve şarkı sözü değil', () => {
    for (const t of Object.values(SL.mino)) expect(hepsi.has(normal(t))).toBe(true);
    for (const t of Object.values(SL.kino)) expect(hepsi.has(normal(t))).toBe(true);
    for (const t of SL.sayilar) expect(hepsi.has(normal(t))).toBe(true);
    expect(hepsi.has(normal(SL.balon.bekledin))).toBe(false);
    expect(hepsi.has(normal(SL.ipucu.cevir))).toBe(false);
    expect(hepsi.has(normal(SL.sarki[0]))).toBe(false);
    const kino = new Set(karakterCumleleri().kino);
    for (const t of Object.values(SL.kino)) expect(kino.has(normal(t))).toBe(true);
  });
  it('kısa: Mino en çok 12 kelime, Kino en çok 6, ipucu en çok 4', () => {
    for (const t of Object.values(SL.mino)) expect(t.split(/\s+/).length).toBeLessThanOrEqual(12);
    for (const t of Object.values(SL.kino)) expect(t.split(/\s+/).length).toBeLessThanOrEqual(6);
    for (const t of Object.values(SL.ipucu)) expect(t.split(/\s+/).length).toBeLessThanOrEqual(4);
  });
});
