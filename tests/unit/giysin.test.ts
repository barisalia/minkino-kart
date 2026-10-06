import { describe, expect, it } from 'vitest';
import G from '../../content/giysin.json';
import { erisimTuru } from '../../src/engine/erisim';
import { tumCumleler, karakterCumleleri } from '../../src/audio/cumleler';
import { BOLGE_MERKEZ, birak, eksikler, GIYSILER, PARCA_YERI, siradaki, type GiysiId } from '../../giysin/src/model';

const set = (...ids: GiysiId[]) => new Set<GiysiId>(ids);
const merkez = (id: GiysiId) => BOLGE_MERKEZ[GIYSILER.find((g) => g.id === id)!.bolge][0];

describe('Kino Ne Giysin? mantık', () => {
  it('her giysi kendi bölgesine bırakılınca oturur (kış için uygun olanlar)', () => {
    for (const id of ['corap', 'bot', 'mont', 'bere', 'eldiven', 'atki'] as GiysiId[]) {
      const [x, y] = merkez(id);
      expect(birak(set(), id, x, y), id).toEqual({ tur: 'yerles' });
    }
  });
  it('yanlış yer: bere ayağa → "Bu kafaya mı?" (yanlisYer), Kino dışı → ıska', () => {
    expect(birak(set(), 'bere', ...merkez('bot'))).toEqual({ tur: 'yanlisYer', bolge: 'ayak' });
    expect(birak(set(), 'eldiven', ...merkez('bere')).tur).toBe('yanlisYer');
    expect(birak(set(), 'bere', 50, 50)).toEqual({ tur: 'iska' });
  });
  it('şort ve güneş gözlüğü kışa uymaz', () => {
    expect(birak(set(), 'sort', ...merkez('sort'))).toEqual({ tur: 'kisinDegil' });
    expect(birak(set(), 'gozluk', ...merkez('gozluk'))).toEqual({ tur: 'kisinDegil' });
  });
  it('sıra: botun üstüne çorap → önce çorap (ikisi de geri); atkı / eldiven varken mont → önce mont / eldiven en son', () => {
    expect(birak(set('bot'), 'corap', ...merkez('corap'))).toEqual({ tur: 'sira', kural: 'once_corap', geri: ['corap', 'bot'] });
    expect(birak(set('atki'), 'mont', ...merkez('mont'))).toEqual({ tur: 'sira', kural: 'once_mont', geri: ['atki'] });
    expect(birak(set('eldiven'), 'mont', ...merkez('mont'))).toEqual({ tur: 'sira', kural: 'eldiven_son', geri: ['eldiven'] });
    expect(birak(set('corap'), 'bot', ...merkez('bot'))).toEqual({ tur: 'yerles' });
  });
  it('eksikler ve ipucu sırası: çorap → bot → mont → bere → eldiven; atkı serbest', () => {
    expect(eksikler(set())).toEqual(['corap', 'bot', 'mont', 'eldiven', 'bere']);
    expect(siradaki(set('corap'))).toBe('bot');
    expect(eksikler(set('corap', 'bot', 'mont', 'bere', 'eldiven'))).toEqual([]);
    expect(siradaki(set('corap', 'bot', 'mont', 'bere', 'eldiven'))).toBeNull();
  });
  it('her giysi parçasının iskelet tuvalinde yeri var', () => {
    for (const g of GIYSILER) for (const p of g.parcalar) {
      const [x, y, w, h] = PARCA_YERI[p];
      expect(x >= 0 && y >= 0 && x + w <= 2048 && y + h <= 2048, p).toBe(true);
    }
  });
});

describe('Kino Ne Giysin? metinler', () => {
  it('Kino en çok 3 kelime söyler; "öğüt" kelimesi yok', () => {
    for (const t of Object.values(G.kino)) expect(t.split(/\s+/).length, t).toBeLessThanOrEqual(3);
    expect(JSON.stringify(G).toLocaleLowerCase('tr')).not.toContain('öğüt');
  });
  it('Mino ve giysi adları seslendirme listesinde; Kino kendi sesiyle', () => {
    const hepsi = new Set(tumCumleler());
    for (const t of [...Object.values(G.mino), ...Object.values(G.giysi)]) expect(hepsi.has(t), t).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const t of Object.values(G.kino)) expect(kino.has(t), t).toBe(true);
  });
  it('erişim: ilk mevsim (kış) ücretsiz, diğerleri abonelikle; menü kartı açık', () => {
    expect(erisimTuru('giysin/kis')).toBe('ucretsiz');
    expect(erisimTuru('giysin/yaz')).toBe('abonelik');
    expect(erisimTuru('giysin')).toBe('ucretsiz');
  });
});
