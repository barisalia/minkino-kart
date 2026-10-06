import { describe, expect, it } from 'vitest';
import G from '../../content/giysin.json';
import { erisimTuru } from '../../src/engine/erisim';
import { tumCumleler, karakterCumleleri } from '../../src/audio/cumleler';
import { ARKA_PARCA, BOLGE_MERKEZ, birak, eksikler, GIYSILER, MEVSIMLER, PARCA_YERI, siradaki, sonrakiMevsim, TURLAR, type GiysiId } from '../../giysin/src/model';

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
    expect(birak(set(), 'sepet', ...merkez('bere'), TURLAR.ilkbahar)).toEqual({ tur: 'yanlisYer', bolge: 'bas' });
  });
  it('şort ve güneş gözlüğü kışa uymaz (titreme, buğu)', () => {
    expect(birak(set(), 'sort', ...merkez('sort'))).toEqual({ tur: 'uymaz', tepki: 'usu' });
    expect(birak(set(), 'gozluk', ...merkez('gozluk'))).toEqual({ tur: 'uymaz', tepki: 'bugu' });
  });
  it('sıra: botun üstüne çorap → önce çorap (ikisi de geri); atkı / eldiven varken mont → önce mont / eldiven en son', () => {
    expect(birak(set('bot'), 'corap', ...merkez('corap'))).toEqual({ tur: 'sira', kural: 'once_corap', geri: ['corap', 'bot'] });
    expect(birak(set('atki'), 'mont', ...merkez('mont'))).toEqual({ tur: 'sira', kural: 'once_mont', geri: ['atki'] });
    expect(birak(set('eldiven'), 'mont', ...merkez('mont'))).toEqual({ tur: 'sira', kural: 'eldiven_son', geri: ['eldiven'] });
    expect(birak(set('corap'), 'bot', ...merkez('bot'))).toEqual({ tur: 'yerles' });
  });
  it('kış: eksikler ve ipucu sırası çorap → bot → mont → bere → eldiven; atkı serbest', () => {
    expect(eksikler(set())).toEqual(['corap', 'bot', 'mont', 'bere', 'eldiven']);
    expect(siradaki(set('corap'))).toBe('bot');
    expect(eksikler(set('corap', 'bot', 'mont', 'bere', 'eldiven'))).toEqual([]);
    expect(siradaki(set('corap', 'bot', 'mont', 'bere', 'eldiven'))).toBeNull();
  });
  it('ilkbahar: mont ve bere sıcak, sandalet çamur; çizmeden önce çorap; sepet patiye', () => {
    const t = TURLAR.ilkbahar;
    expect(birak(set(), 'mont', ...merkez('mont'), t)).toEqual({ tur: 'uymaz', tepki: 'sicak' });
    expect(birak(set(), 'bere', ...merkez('bere'), t)).toEqual({ tur: 'uymaz', tepki: 'sicak' });
    expect(birak(set(), 'sandalet', ...merkez('sandalet'), t)).toEqual({ tur: 'uymaz', tepki: 'camur' });
    expect(birak(set('cizme'), 'corap', ...merkez('corap'), t)).toEqual({ tur: 'sira', kural: 'once_corap', geri: ['corap', 'cizme'] });
    expect(birak(set(), 'sepet', 1290, 1510, t)).toEqual({ tur: 'yerles' });
    expect(birak(set(), 'sapka', ...merkez('sapka'), t)).toEqual({ tur: 'yerles' });
    expect(eksikler(set('corap', 'cizme'), t)).toEqual(['hirka', 'sepet']);
    expect(t.gorev).toBeNull();
  });
  it('yaz: bere, mont, bot sıcak; mayo, şapka, gözlük, kova gerekli; sandalet serbest; görev güneş kremi', () => {
    const t = TURLAR.yaz;
    for (const id of ['bere', 'mont', 'bot'] as GiysiId[]) expect(birak(set(), id, ...merkez(id), t), id).toEqual({ tur: 'uymaz', tepki: 'sicak' });
    for (const id of ['mayo', 'sapka', 'gozluk', 'sandalet'] as GiysiId[]) expect(birak(set(), id, ...merkez(id), t), id).toEqual({ tur: 'yerles' });
    expect(t.iyi.gozluk).toBe('cool');
    expect(eksikler(set('mayo', 'sapka', 'gozluk', 'kova', 'sandalet'), t)).toEqual([]);
    expect(t.gorev).toBe('krem');
  });
  it('sonbahar: hırka ve şapka ıslanır, sandalet çamur, gözlüğe damla; yağmurluk, çizme, şemsiye; görev şemsiye', () => {
    const t = TURLAR.sonbahar;
    expect(birak(set(), 'hirka', ...merkez('hirka'), t)).toEqual({ tur: 'uymaz', tepki: 'islak' });
    expect(birak(set(), 'sapka', ...merkez('sapka'), t)).toEqual({ tur: 'uymaz', tepki: 'islak' });
    expect(birak(set(), 'sandalet', ...merkez('sandalet'), t)).toEqual({ tur: 'uymaz', tepki: 'camur' });
    expect(birak(set(), 'gozluk', ...merkez('gozluk'), t)).toEqual({ tur: 'uymaz', tepki: 'damla' });
    expect(siradaki(set(), t)).toBe('corap');
    expect(siradaki(set('corap', 'cizme'), t)).toBe('yagmurluk');
    expect(t.gorev).toBe('semsiye');
  });
  it('her turda 8 giysi; gerekli ve serbestler dolapta, uymayanlar gerekli değil', () => {
    for (const m of MEVSIMLER) {
      const t = TURLAR[m];
      expect(t.dizi.length, m).toBe(8);
      expect(new Set(t.dizi).size, m).toBe(8);
      for (const g of [...t.gerekli, ...t.serbest]) expect(t.dizi, `${m} ${g}`).toContain(g);
      for (const g of Object.keys(t.uymaz) as GiysiId[]) {
        expect(t.dizi, `${m} ${g}`).toContain(g);
        expect(t.gerekli, `${m} ${g}`).not.toContain(g);
      }
    }
    expect(sonrakiMevsim('kis')).toBe('ilkbahar');
    expect(sonrakiMevsim('sonbahar')).toBeNull();
  });
  it('her giysi parçasının iskelet tuvalinde yeri var (açık şemsiyenin kubbesi başın üstüne taşar)', () => {
    for (const g of GIYSILER) for (const p of g.parcalar) {
      const yer = PARCA_YERI[p];
      expect(yer, p).toBeTruthy();
      const [x, y, w, h] = yer;
      if (ARKA_PARCA.has(p)) expect(y + h <= 2048 && x >= 0, p).toBe(true);
      else expect(x >= 0 && y >= 0 && x + w <= 2048 && y + h <= 2048, p).toBe(true);
    }
  });
});

describe('Kino Ne Giysin? metinler', () => {
  it('Kino en çok 3 kelime söyler; "öğüt" kelimesi yok', () => {
    for (const t of Object.values(G.kino)) expect(t.split(/\s+/).length, t).toBeLessThanOrEqual(3);
    expect(JSON.stringify(G).toLocaleLowerCase('tr')).not.toContain('öğüt');
  });
  it('her dolap giysisinin adı var', () => {
    for (const m of MEVSIMLER) for (const id of TURLAR[m].dizi) expect((G.giysi as Record<string, string>)[id], id).toBeTruthy();
    for (const m of MEVSIMLER) expect(G.mino[m], m).toBeTruthy();
  });
  it('Mino ve giysi adları seslendirme listesinde; Kino kendi sesiyle', () => {
    const hepsi = new Set(tumCumleler());
    for (const t of [...Object.values(G.mino), ...Object.values(G.giysi)]) expect(hepsi.has(t), t).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const t of Object.values(G.kino)) expect(kino.has(t), t).toBe(true);
  });
  it('erişim: ilk mevsim (kış) ücretsiz, diğerleri abonelikle; menü kartı açık', () => {
    expect(erisimTuru('giysin/kis')).toBe('ucretsiz');
    for (const m of ['ilkbahar', 'yaz', 'sonbahar']) expect(erisimTuru(`giysin/${m}`)).toBe('abonelik');
    expect(erisimTuru('giysin')).toBe('ucretsiz');
  });
});
