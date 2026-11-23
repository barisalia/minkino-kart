import { describe, expect, it } from 'vitest';
import sozler from '../../deney/src/sozler.json';
import {
  DEFTER_YERLERI, DENEYLER, DENEY_CIZIMLERI, DENEY_SESLERI, EVDE_DENE, GEREKLI_CIZIMLER, GEREKLI_SESLER, KARISIM, KARISIM_RENKLERI, NESNELER, YUZER,
  byAkisi, deneyBitti, gelisNesneleri, kaydiCoz, karistir, renkPlani, sonucSozu, sorSozu, yasKumesi,
} from '../../deney/src/deney-mantik';
import { DENEY_KARTI, DENEY_MENUDE } from '../../deney/src/bayrak';
import { eksikSesler } from '../../deney/src/hazir';

const metin = sozler as Record<string, string>;

describe('Deneyler · bilim doğru', () => {
  it('suda ne olduğu gerçek deneyle aynı', () => {
    const yuzenler = Object.keys(YUZER).filter((n) => YUZER[n as keyof typeof YUZER]).sort();
    expect(yuzenler).toEqual(['elma', 'oyuncak-ordek', 'plastik-top', 'portakal-kabuklu', 'tahta-kasik', 'yaprak']);
    expect(YUZER.tas || YUZER.anahtar || YUZER['madeni-para'] || YUZER['portakal-soyulmus']).toBe(false);
  });
  it('"ağır olan batar" denmez; 5+ cümlesi suya göre ağırlığı anlatır', () => {
    for (const [id, s] of Object.entries(metin)) {
      expect(s.toLocaleLowerCase('tr'), id).not.toMatch(/ağır olan batar|ağır olduğu için|hafif olduğu için/);
    }
    expect(metin['by-agir']).toBe('Bir şey, kendi büyüklüğündeki sudan ağırsa batar, hafifse yüzer.');
  });
  it('sonuç cümlesi gözlemi söyler ve nesnenin sonucuyla aynı', () => {
    for (const n of [...NESNELER, 'portakal-kabuklu', 'portakal-soyulmus'] as const) {
      const s = metin[sonucSozu(n)];
      expect(s, n).toMatch(YUZER[n] ? /yüzdü/ : /battı/);
      expect(metin[sorSozu(n)], n).toMatch(/batar mı, yüzer mi\?$/);
    }
  });
  it('karışımlar: sarı + mavi = yeşil, kırmızı + sarı = turuncu, kırmızı + mavi = mor; sıra fark etmez', () => {
    expect(karistir('sari', 'mavi')).toBe('yesil');
    expect(karistir('mavi', 'sari')).toBe('yesil');
    expect(karistir('kirmizi', 'sari')).toBe('turuncu');
    expect(karistir('sari', 'kirmizi')).toBe('turuncu');
    expect(karistir('kirmizi', 'mavi')).toBe('mor');
    expect(karistir('mavi', 'kirmizi')).toBe('mor');
    expect(karistir('sari', 'sari')).toBeNull();
    for (const r of KARISIM_RENKLERI) expect(karistir(...KARISIM[r])).toBe(r);
  });
});

describe('Deneyler · yaş ve derinlik', () => {
  it('yaş kümeleri: 2–3 minik, 4 dört, 5+ beş', () => {
    expect([2, 3, 4, 5, 6].map(yasKumesi)).toEqual(['minik', 'minik', 'dort', 'bes', 'bes']);
    expect(byAkisi('minik')).toEqual({ tahmin: false, ayir: false, surpriz: false });
    expect(byAkisi('dort')).toEqual({ tahmin: true, ayir: false, surpriz: false });
    expect(byAkisi('bes')).toEqual({ tahmin: true, ayir: true, surpriz: true });
  });
  it('2–3 yaşta üç, büyüklerde beş nesne; her takımda batan da yüzen de var, ilk ikisi ayrı sonuçlu', () => {
    for (const k of ['minik', 'dort', 'bes'] as const) {
      for (let g = 0; g < 8; g++) {
        const t = gelisNesneleri(k, g);
        expect(t.length).toBe(k === 'minik' ? 3 : 5);
        expect(new Set(t).size).toBe(t.length);
        expect(t.some((n) => YUZER[n]) && t.some((n) => !YUZER[n])).toBe(true);
        expect(YUZER[t[0]]).not.toBe(YUZER[t[1]]);
      }
    }
  });
  it('aynı takım art arda iki gelişte gelmez; ilk üç geliş üç ayrı takım', () => {
    for (const k of ['minik', 'dort'] as const) {
      const takimlar = Array.from({ length: 9 }, (_, g) => gelisNesneleri(k, g).join(','));
      for (let g = 1; g < takimlar.length; g++) expect(takimlar[g], k + ' ' + g).not.toBe(takimlar[g - 1]);
      expect(new Set(takimlar.slice(0, 3)).size).toBe(3);
    }
  });
  it('renkler: 2–3 yaşta iki rehberli karışım; 4 yaş üç karışım ve bir görev; 5+ iki görev; her gelişte başka sıra', () => {
    expect(renkPlani('minik', 0)).toEqual({ karisimlar: ['yesil', 'turuncu'], tahmin: false, gorevler: [] });
    expect(renkPlani('dort', 0)).toEqual({ karisimlar: ['yesil', 'turuncu', 'mor'], tahmin: true, gorevler: ['yesil'] });
    expect(renkPlani('bes', 0).gorevler).toEqual(['yesil', 'mor']);
    for (const k of ['minik', 'dort', 'bes'] as const) {
      for (let g = 1; g < 8; g++) {
        const once = renkPlani(k, g - 1), simdi = renkPlani(k, g);
        expect(simdi.karisimlar.join(), k + ' ' + g).not.toBe(once.karisimlar.join());
        if (simdi.gorevler.length) expect(simdi.gorevler.join()).not.toBe(once.gorevler.join());
        expect(new Set(simdi.gorevler).size).toBe(simdi.gorevler.length);
      }
    }
  });
});

describe('Deneyler · kayıt, defter, kapı', () => {
  it('kayıt bozuksa boş; bitince geliş artar, çıkartma bir kez girer', () => {
    expect(kaydiCoz(null)).toEqual({ gelis: {}, cikartma: [] });
    expect(kaydiCoz('{bozuk')).toEqual({ gelis: {}, cikartma: [] });
    expect(kaydiCoz(JSON.stringify({ gelis: { renkler: 2, 'batar-yuzer': -1, yok: 3 }, cikartma: ['renkler', 'yok'] }))).toEqual({ gelis: { renkler: 2 }, cikartma: ['renkler'] });
    let k = deneyBitti(kaydiCoz(null), 'renkler');
    k = deneyBitti(k, 'batar-yuzer');
    k = deneyBitti(k, 'renkler');
    expect(k).toEqual({ gelis: { renkler: 2, 'batar-yuzer': 1 }, cikartma: ['batar-yuzer', 'renkler'] });
  });
  it('defterde sekiz çıkartma yeri; her deneyin yeri ve "Evde dene" kartı var', () => {
    expect(DEFTER_YERLERI).toHaveLength(8);
    expect(DENEYLER.length).toBeLessThanOrEqual(8);
    for (const id of DENEYLER) {
      expect(DENEY_CIZIMLERI[id]).toContain('cikartma-' + id);
      expect(EVDE_DENE[id].adimlar.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('her ses kimliğinin metni var, her metin kullanılıyor; cümleler kısa', () => {
    expect(new Set(GEREKLI_SESLER).size).toBe(GEREKLI_SESLER.length);
    expect(Object.keys(metin).sort()).toEqual([...GEREKLI_SESLER].sort());
    for (const id of GEREKLI_SESLER) expect(metin[id].length, id).toBeLessThanOrEqual(90);
    for (const id of DENEYLER) expect(DENEY_SESLERI[id].every((s) => metin[s])).toBe(true);
  });
  it('çilek yok, insan yok: ne çizim adında ne sözde', () => {
    const hepsi = [...GEREKLI_CIZIMLER, ...DENEYLER.flatMap((id) => DENEY_CIZIMLERI[id]), ...Object.values(metin), ...DENEYLER.flatMap((id) => [EVDE_DENE[id].baslik, ...EVDE_DENE[id].adimlar])].join(' ').toLocaleLowerCase('tr');
    expect(hepsi).not.toMatch(/çilek|cilek/);
  });
  it("Ceren'in bütün kayıtları yerinde (assets/deney/ses; Scribe ile denetlendi, 22 Kasım)", () => {
    expect(eksikSesler()).toEqual([]);
  });
  it('menü bayrağı açık (Barış 23 Kasım: "kilitli bir şekilde açın"); kart kimliği "deney"', () => {
    expect(DENEY_MENUDE).toBe(true);
    expect(DENEY_KARTI).toEqual({ id: 'deney', adres: 'deney/index.html', kapak: 'assets/uygulama/oyun-kapaklari/deney.webp' });
  });
});
