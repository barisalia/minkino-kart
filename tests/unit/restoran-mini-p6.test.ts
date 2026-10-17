/**
 * Restoran P6 mini oyunlarının saf mantığı: Yoğur ve Yuvarla, Mangal, Bulaşık (+ v1.1: Meyve Şiş, Sar, Sütlaç).
 */
import { describe, expect, it } from 'vitest';
import * as Y from '../../restoran/src/mini/yogur/mantik';
import * as G from '../../restoran/src/mini/mangal/mantik';
import * as B from '../../restoran/src/mini/bulasik/mantik';
import * as S from '../../restoran/src/mini/sis/mantik';
import * as R from '../../restoran/src/mini/sar/mantik';
import * as L from '../../restoran/src/mini/sutlac/mantik';
import { tepkiHesapla, MUSTERILER, yemekTani, istekKabul } from '../../restoran/src/model';

describe('Yoğur ve Yuvarla', () => {
  it('3-4 üç, 5-6 beş sıkıştırmada harç karışır; yeni malzeme yeniden karıştırma ister', () => {
    const d = Y.bosDurum();
    expect([Y.sik(d, 'kucuk'), Y.sik(d, 'kucuk'), Y.sik(d, 'kucuk')].map((x) => x.karisti)).toEqual([false, false, true]);
    Y.malzemeEkle(d, 'sogan');
    expect(d.karisim).toBeLessThan(1);
    expect(d.eklenen.sogan).toBe(1);
    const e = Y.bosDurum();
    for (let i = 0; i < 4; i++) Y.sik(e, 'buyuk');
    expect(e.karisim).toBeLessThan(1);
    expect(Y.sik(e, 'buyuk').karisti).toBe(true);
  });
  it('ne kadar tutarsan o kadar büyük avuç; kalan harcı aşmaz', () => {
    expect(Y.koparBoyu(0, 6)).toBeCloseTo(0.6, 1);
    expect(Y.koparBoyu(3000, 6)).toBe(Y.BOY_EN_COK);
    expect(Y.koparBoyu(3000, 1)).toBe(1);
    expect(Y.boyAdi(0.6)).toBe('kucuk');
    expect(Y.boyAdi(2.1)).toBe('kocaman');
  });
  it('yuvarla: 3-4 üç çeyrek tur, 5-6 tam tur; bastır: yassı → ince → krep (son durak)', () => {
    const d = Y.bosDurum();
    const t = Y.kopar(d, 1)!;
    expect(Y.yuvarla(t, Math.PI, 'kucuk')).toBe(false);
    expect(Y.yuvarla(t, Math.PI * 0.6, 'kucuk')).toBe(true);
    expect(t.sekil).toBe('top');
    expect([Y.bastir(t), Y.bastir(t), Y.bastir(t), Y.bastir(t)]).toEqual(['yassi', 'ince', 'krep', 'krep']);
    const u = Y.kopar(d, 1)!;
    expect(Y.yuvarla(u, Math.PI * 1.6, 'buyuk')).toBe(false);
  });
  it('aynı boy (5-6), porsiyon ve ürün özelliği; doğal son', () => {
    const d = Y.bosDurum();
    for (let i = 0; i < 3; i++) Y.bastir(Y.kopar(d, 1)!);
    expect(Y.ayniBoy(d.topaklar)).toBe(true);
    expect(Y.porsiyonBul(d.topaklar)).toBe('normal');
    Y.bastir(Y.kopar(d, 2.2)!);
    expect(Y.ayniBoy(d.topaklar)).toBe(false);
    expect(Y.porsiyonBul(d.topaklar)).toBe('kocaman');
    expect(Y.dogalSon(d, 'kucuk')).toBe(true);
    Y.malzemeEkle(d, 'tuz');
    const o = Y.kofteOzelligi(d);
    expect(o.malzemeler.kofte?.adet).toBe(4);
    expect(o.tuz).toBe(1);
  });
});

describe('Mangal', () => {
  it('alttaki yüz pişer, iz alır; hiçbir şey kömür olmaz', () => {
    const p = G.yeniParca('kofte');
    const r = G.pisir(p, 5, 0.35, 'buyuk');
    expect(r.iz).toBe(true);
    expect(p.iz[0]).toBe(1);
    G.pisir(p, 999, 1, 'buyuk');
    expect(p.yuz[0]).toBe(G.PISME_EN_COK);
    expect(G.pismeAdi(p.yuz[0])).toBe('citir');
  });
  it('çevrilmeyen köfte en çok "az"; 3-4 bir çevirmede iki yüz, 5-6 iki yüz ayrı', () => {
    const a = G.yeniParca('kofte');
    G.pisir(a, 20, 0.35, 'kucuk');
    expect(G.parcaPisme(a, 'kucuk')).toBe('az');
    G.cevir(a);
    G.pisir(a, 0.1, 0.35, 'kucuk');
    expect(['altin', 'citir']).toContain(G.parcaPisme(a, 'kucuk'));
    const b = G.yeniParca('kofte');
    G.pisir(b, 20, 0.35, 'buyuk');
    G.cevir(b);
    G.pisir(b, 0.1, 0.35, 'buyuk');
    expect(['cig', 'az']).toContain(G.parcaPisme(b, 'buyuk'));
    G.pisir(b, 20, 0.35, 'buyuk');
    expect(G.hazir([b], 'buyuk')).toBe(true);
  });
  it('5-6: yer değiştirince aynı yüze ikinci iz çapraz gelir', () => {
    const p = G.yeniParca('kofte');
    G.pisir(p, 6, 0.35, 'buyuk');
    G.tasi(p);
    const r = G.pisir(p, 4, 0.35, 'buyuk');
    expect(r.capraz).toBe(true);
    expect(p.iz[p.alt]).toBe(2);
  });
  it('yelpaze: ateş artar ve söner; tepedeyken çok yelpaze duman bulutu', () => {
    let ates = G.ATES_TABAN;
    const d: number[] = [];
    let duman = false;
    for (let i = 0; i < 12; i++) {
      const s = G.yelpazele(ates, d, 1000 + i * 100);
      ates = s.ates;
      duman ||= s.duman;
      d.push(1000 + i * 100);
    }
    expect(ates).toBe(1);
    expect(duman).toBe(true);
    expect(G.atesSon(1, 100)).toBe(G.ATES_TABAN);
  });
});

describe('Bulaşık', () => {
  it('yemeğe göre lekeler; 5-6 kenarda gizli leke; ovunca söner, durulanınca temiz', () => {
    const k = B.kirliTabak('corba', 'kucuk', 3);
    expect(k.lekeler.length).toBeGreaterThanOrEqual(2);
    expect(k.lekeler.some((l) => l.gizli)).toBe(false);
    const b = B.kirliTabak('kofte', 'buyuk', 3);
    expect(b.lekeler.some((l) => l.gizli)).toBe(true);
    for (const l of k.lekeler) B.ov(k, l.u, l.v, B.OVMA_YOLU.kucuk + 0.1, 'kucuk');
    expect(k.durum).toBe('kopuklu');
    expect(B.durula(k)).toBe('temiz');
    k.durum = 'rafta';
    expect(B.bitti([k])).toBe(true);
  });
  it('kirliyken durulamak lekeyi bitirmez; dördüncü deterjan köpük dağı', () => {
    const k = B.kirliTabak('salata', 'buyuk', 9);
    expect(B.durula(k)).toBe('hala-kirli');
    expect(k.lekeler.every((l) => l.kir >= 0.35)).toBe(true);
    expect([B.deterjanSik(k), B.deterjanSik(k), B.deterjanSik(k), B.deterjanSik(k)].map((x) => x.dag)).toEqual([false, false, false, true]);
    expect(B.enKirli(k)?.gizli).toBeFalsy();
  });
});

describe('v1.1: Meyve Şiş, Sar, Sütlaç', () => {
  it('şiş: dolu şişte en dipteki fırlar; örüntü ve sırayla', () => {
    const s: S.Sis = { meyveler: [], bal: 0 };
    for (const m of ['cilek', 'muz', 'cilek', 'muz'] as S.Meyve[]) expect(S.tak(s, m, 'kucuk').firlayan).toBeNull();
    expect(S.sirayla(s.meyveler)).toBe(true);
    expect(S.tak(s, 'uzum', 'kucuk').firlayan).toBe('cilek');
    expect(S.oruntuTamam(['cilek', 'muz', 'cilek', 'muz', 'cilek'], ['cilek', 'muz', 'cilek', 'muz', 'cilek'])).toBe(true);
    expect(new Set(S.oruntuUret(3)).size).toBe(2);
    const o = S.sisOzelligi([{ meyveler: ['cilek', 'muz'], bal: 1 }]);
    expect(o.malzemeler.bal?.adet).toBe(1);
    expect(o.porsiyon).toBe('az');
  });
  it('sar: 3-4 iki, 5-6 dört kaydırma; çok peynir fışkırır; yağda kömür olmaz', () => {
    const a = R.yeniBorek();
    R.peynirKoy(a, 1);
    expect([R.ruloYap(a, 'kucuk').bitti, R.ruloYap(a, 'kucuk').bitti]).toEqual([false, true]);
    expect(R.suSur(a)).toBe(true);
    const b = R.yeniBorek();
    R.peynirKoy(b, 1.8);
    let f = false;
    for (let i = 0; i < 4; i++) f ||= R.ruloYap(b, 'buyuk').fiskirdi;
    expect(f).toBe(true);
    b.yagda = true;
    R.kizart(b, 999);
    expect(R.pismeAdi(b.p)).toBe('citir');
    expect(R.borekOzelligi([a, b]).malzemeler.peynir?.adet).toBe(2);
  });
  it('sütlaç: karışınca koyulaşır; 3-4 çizgide durur, 5-6 taşar; fırında üstü kızarır', () => {
    const t = L.bosTencere();
    t.sut = 1;
    t.pirinc = 1;
    expect(L.karistir(t, 2 * Math.PI * 55 * 3, 100, 'kucuk').koyulasti).toBe(true);
    const k = L.bosKase();
    for (let i = 0; i < 40; i++) L.doldur(k, t, 0.1, 'kucuk');
    expect(k.dolum).toBe(L.CIZGI);
    const t2 = { ...L.bosTencere(), sut: 1, pirinc: 1 };
    const k2 = L.bosKase();
    let tasti = false;
    for (let i = 0; i < 40; i++) tasti ||= L.doldur(k2, t2, 0.1, 'buyuk').tasti;
    expect(tasti).toBe(true);
    L.firinda(k, 5);
    expect(L.pismeAdi(k.p)).toBe('altin');
    L.firinda(k, 999);
    expect(L.pismeAdi(k.p)).toBe('citir');
    expect(L.sutlacOzelligi(t, [k, k2]).porsiyon).toBe('kocaman');
  });
});

describe('P6 tarifleri lokantada tanınır ve sevilir', () => {
  it('köfte Baba\'nın, sütlaç Bulut\'un sevdiği; şiş ve börek ipuçlarına uyar', () => {
    const kofte = { yemek: 'kofte', ozellik: { malzemeler: { kofte: { adet: 4 } }, pisme: 'altin' as const, porsiyon: 'kocaman' as const } };
    expect(yemekTani(kofte)).toBe('kofte');
    expect(tepkiHesapla(MUSTERILER.baba, { tur: 'resimli', tarif: 'kofte' }, kofte).tepki).toBe('bayildi');
    const sutlac = { yemek: 'sutlac', ozellik: { malzemeler: { sut: { adet: 1 } }, tatli: 1 } };
    expect(tepkiHesapla(MUSTERILER.bulut, { tur: 'surpriz' }, sutlac).tepki).toBe('bayildi');
    expect(istekKabul({ tur: 'ipuclu', ipucu: 'tatli' }, 'sis', { malzemeler: { cilek: { adet: 2 } } })).toBe(true);
    expect(istekKabul({ tur: 'ipuclu', ipucu: 'citir' }, 'borek', { malzemeler: { yufka: { adet: 2 } }, pisme: 'altin' })).toBe(true);
    // Nehir abla (Fındık'la gelir): soğanlı yemek komik ("Köpeklere soğan olmaz!")
    expect(tepkiHesapla(MUSTERILER.nehir, { tur: 'surpriz' }, { ozellik: { malzemeler: { sogan: { adet: 2 }, domates: { adet: 2 } } } }).neden).toBe('sevmez');
  });
});
