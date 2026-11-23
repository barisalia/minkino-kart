import { describe, expect, it } from 'vitest';
import { Tezgah, bilesenleri, karisim, karisimAdlar, tur, tuttu } from '../../deney/src/volkan/karisim';

// Deneyler · Köpüren Renk Volkanı (Paket Deney-Y3): renk karışımı ve sirke-karbonat tepkimesinin kuralları.
describe('renk karışımı', () => {
  it('ana renkler kendisi; ikisi ara renk; üçü kahverengi', () => {
    expect(karisim([])).toBeNull();
    expect(karisim(['mavi'])).toBe('mavi');
    expect(karisim(['mavi', 'mavi'])).toBe('mavi');
    expect(karisim(['kirmizi', 'mavi'])).toBe('mor');
    expect(karisim(['sari', 'mavi'])).toBe('yesil');
    expect(karisim(['kirmizi', 'sari'])).toBe('turuncu');
    expect(karisim(['mavi', 'kirmizi', 'kirmizi'])).toBe('mor');
    expect(karisim(['kirmizi', 'sari', 'mavi'])).toBe('kahve');
  });
  it('karışımların birleşimi ana renk bileşenleri üzerinden', () => {
    expect(karisimAdlar(['mor', 'sari'])).toBe('kahve');
    expect(karisimAdlar(['kirmizi', 'mavi'])).toBe('mor');
    expect(bilesenleri('yesil')).toEqual(['sari', 'mavi']);
  });
});

describe('tepkime', () => {
  it('kolba en çok üç ölçek alır; boş kolba boşaltılamaz', () => {
    const t = new Tezgah();
    expect(t.kolbayiBosalt()).toEqual({ tur: 'bos' });
    expect(t.dok('kirmizi')).toEqual({ tur: 'doldu', renk: 'kirmizi', miktar: 1 });
    expect(t.dok('mavi')).toEqual({ tur: 'doldu', renk: 'mor', miktar: 2 });
    expect(t.dok('mavi')).toEqual({ tur: 'doldu', renk: 'mor', miktar: 3 });
    expect(t.dok('sari')).toEqual({ tur: 'dolu' });
    // 2–3 yaşta bir dokunuş iki ölçek; kolba üçte durur.
    const m = new Tezgah();
    expect(m.dok('mavi', 2)).toEqual({ tur: 'doldu', renk: 'mavi', miktar: 2 });
    expect(m.dok('sari', 2)).toEqual({ tur: 'doldu', renk: 'yesil', miktar: 3 });
  });
  it('karbonat volkandayken sirke dökülürse köpürür; köpük sirke miktarıyla büyür; sonra volkan temiz', () => {
    const t = new Tezgah();
    expect(t.kasik()).toEqual({ tur: 'kondu' });
    expect(t.kasik()).toEqual({ tur: 'zaten' });
    t.dok('kirmizi'); t.dok('mavi');
    expect(t.kolbayiBosalt()).toEqual({ tur: 'patlama', p: { renk: 'mor', boy: 2 } });
    expect(t.krater).toEqual({ karbonat: false, sivi: null, miktar: 0 });
    expect(t.kolba).toEqual([]);
  });
  it('sıra fark etmez: sirke volkanda beklerken karbonat konunca köpürür', () => {
    const t = new Tezgah();
    t.dok('sari');
    expect(t.kolbayiBosalt()).toEqual({ tur: 'bekliyor' });
    t.dok('mavi');
    expect(t.kolbayiBosalt()).toEqual({ tur: 'bekliyor' });
    expect(t.krater).toEqual({ karbonat: false, sivi: 'yesil', miktar: 2 });
    expect(t.kasik()).toEqual({ tur: 'patlama', p: { renk: 'yesil', boy: 2 } });
  });
  it('üç ölçek kocaman köpük', () => {
    const t = new Tezgah();
    t.kasik(); t.dok('kirmizi'); t.dok('kirmizi'); t.dok('sari');
    expect(t.kolbayiBosalt()).toEqual({ tur: 'patlama', p: { renk: 'turuncu', boy: 3 } });
  });
});

describe('yaşa göre tur', () => {
  it('2–3 yaş serbest, karbonat hazır; 4 yaş iki ara renk; 5+ ikincisi kocaman; bir dahada hedefler değişir', () => {
    expect(tur('minik')).toEqual({ hedefler: [null, null, null], karbonatHazir: true });
    expect(tur('dort')).toEqual({ hedefler: [{ renk: 'mor' }, { renk: 'yesil' }], karbonatHazir: false });
    expect(tur('dort', 1).hedefler).toEqual([{ renk: 'yesil' }, { renk: 'turuncu' }]);
    expect(tur('bes')).toEqual({ hedefler: [{ renk: 'yesil' }, { renk: 'mor', boy: 3 }], karbonatHazir: false });
  });
  it('hedef: renk tutmalı; kocaman hedefte üç ölçek', () => {
    expect(tuttu(null, { renk: 'kahve', boy: 1 })).toBe(true);
    expect(tuttu({ renk: 'mor' }, { renk: 'mor', boy: 1 })).toBe(true);
    expect(tuttu({ renk: 'mor' }, { renk: 'mavi', boy: 2 })).toBe(false);
    expect(tuttu({ renk: 'mor', boy: 3 }, { renk: 'mor', boy: 2 })).toBe(false);
    expect(tuttu({ renk: 'mor', boy: 3 }, { renk: 'mor', boy: 3 })).toBe(true);
  });
});

import { CEKMECEDE, Senaryo, birikintiSayisi } from '../../deney/src/volkan/senaryo';
describe('senaryo (altı aşama)', () => {
  it('hazırlık sırayla: önce önlük, sonra gözlük, sonra örtü; sıra dışı "önce önlük"', () => {
    const s = new Senaryo('dort');
    expect(s.hazirla('gozluk')).toEqual({ tur: 'once', gereken: 'onluk' });
    expect(s.hazirla('onluk')).toEqual({ tur: 'oldu', adim: 'onluk', bitti: false });
    expect(s.hazirla('onluk')).toEqual({ tur: 'zaten' });
    expect(s.hazirla('ortu')).toEqual({ tur: 'once', gereken: 'gozluk' });
    s.hazirla('gozluk');
    expect(s.hazirla('ortu')).toEqual({ tur: 'oldu', adim: 'ortu', bitti: true });
    expect(s.asama).toBe('malzeme');
  });
  it('malzemeler: 2–3 yaşta iki, büyüklerde dört; hepsi konunca deney', () => {
    expect(CEKMECEDE.minik).toEqual(['volkan', 'sepet']);
    const s = new Senaryo('minik');
    for (const a of ['onluk', 'gozluk', 'ortu'] as const) s.hazirla(a);
    expect(s.asama).toBe('malzeme');
    expect(s.koy('volkan')).toBe(true);
    expect(s.koy('volkan')).toBe(false);
    expect(s.koy('sepet')).toBe(true);
    expect(s.asama).toBe('deney');
  });
  it('turlar: 1. tur hedef tutunca seçim; "kocaman" ikinci rengi üç ölçekle ister; 2. tur tutunca temizlik, sonra ödül', () => {
    const s = new Senaryo('dort');
    for (const a of ['onluk', 'gozluk', 'ortu'] as const) s.hazirla(a);
    for (const m of ['volkan', 'kolba', 'kavanoz', 'sepet'] as const) s.koy(m);
    expect(s.hedef()).toEqual({ renk: 'mor' });
    expect(s.kopurdu(false)).toBe(false);
    expect(s.kopurdu(true)).toBe(true);
    expect(s.asama).toBe('secim');
    s.sec('dev');
    expect(s.hedef()).toEqual({ renk: 'yesil', boy: 3 });
    s.kopurdu(true);
    expect(s.asama).toBe('temizlik');
    expect(s.birikinti).toHaveLength(birikintiSayisi('dort', true));
    for (let k = 0; k < 3; k++) for (let i = 0; i < s.birikinti.length; i++) s.sil(i);
    expect(s.asama).toBe('odul');
    s.odulAlindi();
    expect(s.asama).toBe('bitti');
  });
  it('"başka renk" seçilince ikinci hedef; 2–3 yaşta kocaman volkan serbest', () => {
    const s = new Senaryo('bes');
    for (const a of ['onluk', 'gozluk', 'ortu'] as const) s.hazirla(a);
    for (const m of ['volkan', 'kolba', 'kavanoz', 'sepet'] as const) s.koy(m);
    s.kopurdu(true);
    s.sec('renk');
    expect(s.hedef()).toEqual({ renk: 'mor', boy: 3 });
    const m = new Senaryo('minik');
    m.tur = 2; m.secim = 'dev';
    expect(m.hedef()).toBeNull();
  });
});
