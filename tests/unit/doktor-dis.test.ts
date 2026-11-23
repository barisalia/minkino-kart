import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AC_MS, ADIM_SINIRI, AGIZ, AGIZ_DUGMESI, KAPANIS, TUP_DUGMESI, ALETLER, ALET_SIRASI, ASAMALAR, DIS, DIS_DOSYALAR, DOK_MS, INCELE_MS, KIKIR_MS, MACUN_SOZLERI, MACUN_TAMAM, MASA, OPAK, ORTAK_DOSYALAR, ORTAK_EFEKTLER, SOZLER, TUVAL, ZORLUK,
  agizdaMi, asamaAleti, basPozu, bolmeBul, bolmeler, dislerGorunur, dokmeAdimi, fenerAdimi, fircaAdimi, fircaBitti, macunAdimi, macunBaslangici, macunOrani, sonrakiAsama, temizBolme, yanakBul,
} from '../../doktor/src/dis/veri';
import { DOK_ALET_BOYU, EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, HUB, SAHNE, SERIT_YUVALARI, VAKA_DOSYALAR, YAKIN, sahneOlcegi, type Nokta } from '../../doktor/src/vaka/veri';

// Minik Doktor · ikinci vaka "Mino'nun Kurabiyeli Dişleri". Çizim adları ve ölçüleri Astra'ya yazılan Paket Doktor-Y2
// brief'iyle karşılaştırılır; mekaniklerin saf hesabı sınanır.

const tum = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
const bas = tum.indexOf('Paket Doktor-Y2 · "Mino\'nun Kurabiyeli Dişleri"');
const brief = tum.slice(bas, tum.indexOf('\n## ', bas + 10) > 0 ? tum.indexOf('\n## ', bas + 10) : undefined);

describe('Paket Doktor-Y2: çizim adları ve ölçüler brief\'le birebir', () => {
  it('26 çizim, hepsi bir kez; her ad brief\'te geçer', () => {
    expect(bas).toBeGreaterThan(0);
    expect(DIS_DOSYALAR).toHaveLength(26);
    expect(new Set(DIS_DOSYALAR).size).toBe(26);
    for (const ad of DIS_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...DIS_DOSYALAR].sort());
    expect(brief).toContain('27 çizim');
    expect(OPAK).toEqual(['agiz-fon']);
  });
  it('Dikenli Pati\'den aynen kullanılan çizimler o pakette var; iki paketin adları çakışmaz', () => {
    for (const ad of ORTAK_DOSYALAR) { expect(VAKA_DOSYALAR, ad).toContain(ad); expect(brief, ad).toContain('`' + ad + '`'); }
    for (const ad of DIS_DOSYALAR) expect(VAKA_DOSYALAR, ad).not.toContain(ad);
  });
  it('tuval boyutları ve yerleşim sayıları brief\'te yazanlarla aynı', () => {
    for (const boyut of ['2048 × 1152', '1000 × 940', '600 × 600', '300 × 600', '220 × 70', '200 × 400']) expect(brief).toContain(boyut);
    expect(TUVAL[DIS.firca]).toEqual([600, 600]); expect(TUVAL[DIS.macunlar[0]]).toEqual([300, 600]); expect(TUVAL[DIS.seritler[0]]).toEqual([220, 70]); expect(TUVAL[DIS.su]).toEqual([200, 400]);
    expect(brief).toContain('merkezi (860, 700)');
    expect(AGIZ.merkez).toEqual({ x: 860, y: 700 });
    expect(brief).toContain('x 610…1110, y 585…690');
    expect(AGIZ.ustDis).toEqual({ sol: 610, ust: 585, g: 500, y: 105 });
    expect(brief).toContain('x 630…1090, y 765…850');
    expect(AGIZ.altDis).toEqual({ sol: 630, ust: 765, g: 460, y: 85 });
    expect(brief).toContain('(500, 640) ve (1220, 640)');
    expect(AGIZ.yanaklar).toEqual([{ x: 500, y: 640 }, { x: 1220, y: 640 }]);
    // fırçanın kılları: çizimde x 60…260, y 230; havludaki yerinde sahne pikseli
    expect(brief).toContain('x 60…260, y 230');
    expect(AGIZ.killar).toEqual({ sol: AGIZ.fircaYeri.sol + 60, sag: AGIZ.fircaYeri.sol + 260, y: AGIZ.fircaYeri.ust + 230 });
    // masadaki Mino: baş ve ağız
    expect(brief).toContain('baş merkezi (575, 300), ağız (575, 372)');
    expect(MASA.agiz).toEqual({ x: HUB.zipzip.sol + 575, y: HUB.zipzip.ust + 372 });
  });
  it('aletlerin ucu çizimdeki noktada: fener (300, 60), tüpün ağzı (150, 580), bardağın kenarı y 150, kılların ortası', () => {
    expect(brief).toContain('(300, 60)'); expect(ALETLER.fener.uc).toEqual([0.5, 60 / 600]);
    expect(brief).toContain('(150, 580)'); expect(ALETLER.macun.uc).toEqual([0.5, 580 / 600]);
    expect(brief).toContain('ağız kenarı y 150'); expect(ALETLER.bardak.uc).toEqual([0.5, 150 / 600]);
    expect(ALETLER.firca.uc[0] * 600).toBeGreaterThan(60); expect(ALETLER.firca.uc[0] * 600).toBeLessThan(260);
    expect(ALET_SIRASI).toEqual(['fener', 'macun', 'firca', 'bardak']);
    // Dikenli Pati'nin aletlerinden hiçbiri yok
    for (const ad of DIS_DOSYALAR) expect(ad).not.toMatch(/buyutec|sprey|cimbiz|sargi|bant-/);
  });
});

describe('yerleşim: her şey sahnede ve birbirine girmiyor', () => {
  it('dişler açık ağzın içinde; yanaklar dişlerin dışında; fırça havlusu başın sağında', () => {
    for (const d of [AGIZ.ustDis, AGIZ.altDis]) {
      expect(agizdaMi({ x: d.sol + d.g / 2, y: d.ust + d.y / 2 })).toBe(true);
      expect(d.ust + d.y).toBeLessThan(AGIZ.serit.ust - 80);
    }
    expect(AGIZ.ustDis.ust + AGIZ.ustDis.y).toBeLessThan(AGIZ.altDis.ust);
    for (const y of AGIZ.yanaklar) { expect(agizdaMi(y)).toBe(false); expect(yanakBul(y)).toBeGreaterThanOrEqual(0); }
    expect(yanakBul(AGIZ.merkez)).toBe(-1);
    expect(AGIZ.fircaYeri.sol).toBeGreaterThan(1400);                              // brief: baş x 320…1400
    expect(AGIZ.fircaYeri.sol + AGIZ.fircaYeri.g).toBeLessThanOrEqual(SAHNE.g);
    expect(agizdaMi({ x: AGIZ.killar.sol, y: AGIZ.killar.y })).toBe(false);        // macun sıkılırken fener/bardak koşulu tetiklenmez
  });
  it('akış sırayla; yakın plandaki dört aşamanın kendi aleti var', () => {
    expect(ASAMALAR).toEqual(['giris', 'canta', 'fener', 'macun', 'firca', 'bardak', 'calkala', 'kutlama', 'son']);
    expect(sonrakiAsama('firca')).toBe('bardak'); expect(sonrakiAsama('son')).toBe('son');
    expect(ASAMALAR.map(asamaAleti).filter(Boolean)).toEqual(['fener', 'macun', 'firca', 'bardak']);
  });
  it('küçük yaşta daha az bölme, daha az sürtme, daha az dokunuş', () => {
    expect(ZORLUK['2-3'].sutun).toBeLessThan(ZORLUK['5+'].sutun);
    expect(ZORLUK['2-3'].surtme).toBeLessThan(ZORLUK['5+'].surtme);
    expect(ZORLUK['2-3'].calkala).toBeLessThanOrEqual(ZORLUK['4'].calkala);
    for (const z of Object.values(ZORLUK)) expect(bolmeler(z.sutun)).toHaveLength(z.sutun * 2);
  });
  it('sözlerde emir yok; her tadın kendi sözü var; ortak efektlerin kaydı duruyor', () => {
    for (const metin of Object.values(SOZLER)) expect(metin).not.toMatch(/(?<!\p{L})(dokun|bas|tut|sür|sürükle|çek|seç|yap|fırçala|sık)(?!\p{L})/iu);   // Türkçe harfte sözcük sınırı
    expect(MACUN_SOZLERI).toHaveLength(DIS.macunlar.length);
    for (const ad of ORTAK_EFEKTLER) expect(existsSync(`assets/doktor/vaka/ses/${ad}.mp3`), ad).toBe(true);
  });
});

describe('mekanikler', () => {
  it('fener: ağza tutulunca Mino ağzını açar; çekilince birikim azalır ama açık ağız kapanmaz', () => {
    let f = 0;
    for (let t = 0; t < AC_MS - 32; t += 16) f = fenerAdimi(f, true, 16);
    expect(f).toBeLessThan(AC_MS);
    const once = f;
    f = fenerAdimi(f, false, 100);
    expect(f).toBeLessThan(once);                                                  // açılmadan çekildi: geri gider
    for (let t = 0; t < AC_MS; t += 16) f = fenerAdimi(f, true, 16);
    expect(f).toBeGreaterThanOrEqual(AC_MS);
    const acik = f;
    expect(fenerAdimi(f, false, 500)).toBe(acik);                                  // açıldıktan sonra geri gitmez
    for (let t = 0; t < INCELE_MS + 200; t += 16) f = fenerAdimi(f, true, 16);
    expect(f).toBe(AC_MS + INCELE_MS);
  });
  it('macun: tüpün ucu kılların üstünde gezdikçe şerit uzar; uzakta ya da yanında tutmak uzatmaz', () => {
    const k = AGIZ.killar;
    let d = macunBaslangici();
    expect(macunOrani(d)).toBe(0);
    d = macunAdimi(d, { x: k.sol + 10, y: k.y - 300 });                            // çok yukarıda
    expect(macunOrani(d)).toBe(0);
    d = macunAdimi(d, { x: k.sol - 200, y: k.y });                                 // kılların solunda, uzakta
    expect(macunOrani(d)).toBe(0);
    d = macunAdimi(d, { x: k.sol + 20, y: k.y - 30 });
    expect(macunOrani(d)).toBe(0);                                                  // tek nokta: şerit daha yok
    d = macunAdimi(d, { x: (k.sol + k.sag) / 2, y: k.y - 20 });
    expect(macunOrani(d)).toBeGreaterThan(0.35); expect(macunOrani(d)).toBeLessThan(MACUN_TAMAM);
    d = macunAdimi(d, { x: k.sag + 30, y: k.y - 10 });                             // uç biraz taşsa da şerit kıllarda biter
    expect(d.sag).toBe(k.sag);
    expect(macunOrani(d)).toBeGreaterThanOrEqual(MACUN_TAMAM);
    // sağdan sola sürmek de olur
    let e = macunBaslangici();
    for (let x = k.sag; x >= k.sol; x -= 25) e = macunAdimi(e, { x, y: k.y });
    expect(macunOrani(e)).toBe(1);
  });
  it('fırça: ileri geri sürttükçe altındaki bölme temizlenir; yerinde durmak ya da dişin dışında gezmek temizlemez', () => {
    const z = ZORLUK['4'], b = bolmeler(z.sutun);
    let yol = b.map(() => 0);
    const orta = (i: number): Nokta => ({ x: b[i].sol + b[i].g / 2, y: b[i].ust + b[i].y / 2 });
    // yerinde durmak
    let once: Nokta | null = null;
    for (let k = 0; k < 30; k++) { const r = fircaAdimi(yol, b, once, orta(0)); yol = r.yol; once = orta(0); }
    expect(temizBolme(yol, z.surtme)).toBe(0);
    // dişlerin dışında gezmek
    expect(bolmeBul(b, { x: 200, y: 300 })).toBe(-1);
    expect(fircaAdimi(yol, b, { x: 200, y: 300 }, { x: 260, y: 300 }).yol).toEqual(yol);
    // ilk bölmede ileri geri: 4 gidiş geliş (her biri 40 px)
    once = null;
    for (let k = 0; k < 9; k++) { const p = { x: orta(0).x + (k % 2 ? 20 : -20), y: orta(0).y }; const r = fircaAdimi(yol, b, once, p); yol = r.yol; once = p; expect(r.bolme).toBe(0); }
    expect(yol[0]).toBe(320);
    expect(temizBolme(yol, z.surtme)).toBe(1);
    // parmak sıçrarsa (tek karede 600 px) bölme bir anda dolmaz
    const sicrama = fircaAdimi(b.map(() => 0), b, { x: orta(1).x - 600, y: orta(1).y }, orta(1));
    expect(sicrama.yol[1]).toBe(ADIM_SINIRI);
    // bütün bölmeler: biri eksik kalsa da biter, ikisi eksikse bitmez
    const dolu = b.map(() => z.surtme);
    expect(fircaBitti(dolu, z.surtme)).toBe(true);
    expect(fircaBitti(dolu.map((v, i) => (i === 3 ? 0 : v)), z.surtme)).toBe(true);
    expect(fircaBitti(dolu.map((v, i) => (i === 3 || i === 5 ? 0 : v)), z.surtme)).toBe(false);
  });
  it('bardak: ağza tutulunca su dökülür; çekilince birikim geri gider', () => {
    let d = 0;
    for (let t = 0; t < DOK_MS - 100; t += 16) d = dokmeAdimi(d, true, 16);
    expect(d).toBeLessThan(DOK_MS);
    expect(dokmeAdimi(d, false, 100)).toBeLessThan(d);
    for (let t = 0; t < 200; t += 16) d = dokmeAdimi(d, true, 16);
    expect(d).toBe(DOK_MS);
  });
  it('baş pozu: fenerde açılır, fırçada kıkırdar, su gelince yanaklar şişer, sonunda güler; dişler yalnız ağız açıkken', () => {
    const d = { asama: 'fener' as const, agizAcik: false, suAgizda: false, kikirKalan: 0 };
    expect(basPozu(d)).toBe('kapali');
    expect(basPozu({ ...d, agizAcik: true })).toBe('acik');
    expect(basPozu({ ...d, asama: 'macun', agizAcik: true })).toBe('kapali');      // macun seçilirken ağız dinlenir
    expect(basPozu({ ...d, asama: 'firca' })).toBe('acik');
    expect(basPozu({ ...d, asama: 'firca', kikirKalan: KIKIR_MS })).toBe('acikKikir');
    expect(basPozu({ ...d, asama: 'bardak' })).toBe('acik');
    expect(basPozu({ ...d, asama: 'bardak', suAgizda: true })).toBe('sisik');
    expect(basPozu({ ...d, asama: 'calkala' })).toBe('sisik');
    for (const asama of ['kutlama', 'son'] as const) expect(basPozu({ ...d, asama })).toBe('gulen');
    expect((['kapali', 'acik', 'acikKikir', 'sisik', 'gulen'] as const).filter(dislerGorunur)).toEqual(['acik', 'acikKikir']);
  });
});

describe('teslim çıtası: kısa kapanış, iri dokunma hedefleri, yakın planda Kino', () => {
  it('kapanış kısa: son çalkalamadan en çok 2 sn sonra "yeniden oyna" hazır', () => {
    expect(KAPANIS.parlama + KAPANIS.kamera + KAPANIS.sevinc).toBeLessThanOrEqual(2000);
  });
  it('dokunma hedefleri en küçük yatay telefonda da 64 pikselden küçük değil; tüp kutuları çakışmaz', () => {
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    for (const kenar of [DOK_ALET_BOYU, ...TUP_DUGMESI, ...AGIZ_DUGMESI, AGIZ.yanakYaricapi * 1.7, AGIZ.fircaYeri.g]) expect(kenar * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(SERIT_YUVALARI[2][0] - SERIT_YUVALARI[1][0]).toBeGreaterThanOrEqual(TUP_DUGMESI[0]);
  });
  it('yakın planda Kino sağ altta: şeridin sağında, fırçanın (havlunun) altında', () => {
    const k = YAKIN.kino;
    expect(AGIZ.serit.sol + AGIZ.serit.g).toBeLessThanOrEqual(k.sol + (k.g * 90) / 640);                  // kulağın sol ucu şeridin sağında
    expect(k.ust + (k.y * 20) / 620).toBeGreaterThanOrEqual(AGIZ.killar.y + 150);                          // başın tepesi fırçanın altında
    expect(k.sol + k.g * 0.5).toBeGreaterThan(AGIZ.merkez.x + AGIZ.yariEn + 200);                          // Mino'nun ağzını kapatmaz
  });
});
