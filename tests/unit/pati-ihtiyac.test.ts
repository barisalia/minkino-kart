import { describe, expect, it } from 'vitest';
import P from '../../content/pati.json';
import { acilabilir, enCokAcik, gununAni, IhtiyacSaati, yardimAdimlari, type SaatHayvani } from '../../pati/src/ihtiyac';
import { hayvanBilgi, type IhtiyacAdi } from '../../pati/src/katalog';
import { normal, tumCumleler } from '../../src/audio/cumleler';

/** tekrarlanabilir rastgele */
const tohum = (n: number) => () => ((n = (n * 16807) % 2147483647) - 1) / 2147483646;
const hayvan = (id: string): SaatHayvani => ({ id, ihtiyac: null, sonDans: 0 });
const liste = (id: string) => hayvanBilgi(id).ihtiyaclar;

describe('Pati v2: ihtiyaç saati (PATI-V2 §7a)', () => {
  it('3-4: aç, susuz, sıkılmış, uykulu; kirli yalnız temizlik çekmecesiyle; hasta hiç', () => {
    const t = liste('findik');
    expect(acilabilir(t, { yas: 'kucuk', hayvanSayisi: 5 })).toEqual(['ac', 'susuz', 'sikildi', 'uykulu']);
    expect(acilabilir(t, { yas: 'kucuk', hayvanSayisi: 5, temizlik: true })).toContain('kirli');
    expect(acilabilir(t, { yas: 'kucuk', hayvanSayisi: 5, temizlik: true })).not.toContain('hasta');
  });

  it('5-6: kirli baştan, hasta 3 hayvandan sonra; balığın susuzu ve hastası yok', () => {
    expect(acilabilir(liste('tarcin'), { yas: 'buyuk', hayvanSayisi: 2 })).toEqual(['ac', 'susuz', 'kirli', 'sikildi', 'uykulu']);
    expect(acilabilir(liste('tarcin'), { yas: 'buyuk', hayvanSayisi: 3 })).toContain('hasta');
    expect(acilabilir(liste('piril'), { yas: 'buyuk', hayvanSayisi: 9 })).toEqual(['ac', 'kirli', 'sikildi', 'uykulu']);
  });

  it('yeni hayvanın ilk ihtiyacı 8-16 sn sonra; aynı anda en çok 2 (3-4) / 3 (5-6)', () => {
    for (const yas of ['kucuk', 'buyuk'] as const) {
      const s = new IhtiyacSaati(tohum(3));
      const h = ['findik', 'tarcin', 'pofuduk', 'fistik'].map(hayvan);
      expect(s.tik(0, h, { yas, hayvanSayisi: 4 }, liste)).toHaveLength(0);
      expect(s.tik(7_999, h, { yas, hayvanSayisi: 4 }, liste)).toHaveLength(0);
      s.tik(16_000, h, { yas, hayvanSayisi: 4 }, liste);
      expect(h.filter((x) => x.ihtiyac)).toHaveLength(enCokAcik(yas));
      // bekleyen hiçbir şey kötüleşmez: zaman geçse de açık sayısı aynı, hiçbiri kendiliğinden kapanmaz
      s.tik(600_000, h, { yas, hayvanSayisi: 4 }, liste);
      expect(h.filter((x) => x.ihtiyac)).toHaveLength(enCokAcik(yas));
    }
  });

  it('bir hayvanda tek ihtiyaç; kapanınca sıradaki 20-40 sn sonra ve aynısı art arda gelmez', () => {
    const s = new IhtiyacSaati(tohum(11));
    const f = hayvan('findik');
    s.tik(0, [f], { yas: 'kucuk', hayvanSayisi: 1 }, liste);
    s.tik(20_000, [f], { yas: 'kucuk', hayvanSayisi: 1 }, liste);
    const ilk = f.ihtiyac as IhtiyacAdi;
    expect(ilk).toBeTruthy();
    s.kapat(f, 30_000);
    expect(f.ihtiyac).toBeNull();
    expect(s.tik(49_999, [f], { yas: 'kucuk', hayvanSayisi: 1 }, liste)).toHaveLength(0);
    const [y] = s.tik(70_000, [f], { yas: 'kucuk', hayvanSayisi: 1 }, liste);
    expect(y.ihtiyac).not.toBe(ilk);
    expect(s.acilisZamani('findik')).toBe(70_000);
  });

  it('dans eden hayvan 30 sn dinlenir; akşam saat durur', () => {
    const s = new IhtiyacSaati(tohum(4));
    const f = { ...hayvan('findik'), sonDans: 100_000 };
    s.tik(0, [f], { yas: 'kucuk', hayvanSayisi: 1 }, liste, 100_000);
    expect(s.tik(120_000, [f], { yas: 'kucuk', hayvanSayisi: 1 }, liste, 120_000)).toHaveLength(0);
    expect(s.tik(131_000, [f], { yas: 'kucuk', hayvanSayisi: 1 }, liste, 131_000)).toHaveLength(1);
    s.kapat(f, 131_000);
    s.durdu = true;
    expect(s.tik(999_000, [f], { yas: 'kucuk', hayvanSayisi: 1 }, liste, 999_000)).toHaveLength(0);
  });

  it('dışarıdan açılan ihtiyaç (ders) ve kayıttan gelen ihtiyacın merdiveni baştan', () => {
    const s = new IhtiyacSaati(tohum(2));
    const t = hayvan('tarcin');
    s.ac(t, 'hasta', 5_000);
    expect(t.ihtiyac).toBe('hasta');
    expect(s.acilisZamani('tarcin')).toBe(5_000);
    const k = { ...hayvan('findik'), ihtiyac: 'ac' as IhtiyacAdi };
    s.tik(9_000, [k], { yas: 'kucuk', hayvanSayisi: 1 }, liste);
    expect(s.acilisZamani('findik')).toBe(9_000);
  });
});

describe('Pati v2: yardım merdiveni (PATI-V2 §8d)', () => {
  it('12 sn dolaylı, 25 sn 3-4 balon / 5-6 Nehir sözü, 40 sn kulp', () => {
    expect(yardimAdimlari(11_999, 'kucuk')).toEqual([]);
    expect(yardimAdimlari(12_000, 'kucuk')).toEqual(['dolayli']);
    expect(yardimAdimlari(25_000, 'kucuk')).toEqual(['dolayli', 'balon']);
    expect(yardimAdimlari(25_000, 'buyuk')).toEqual(['dolayli', 'soz']);
    expect(yardimAdimlari(40_000, 'buyuk')).toEqual(['dolayli', 'soz', 'kulp']);
  });

  it('günün fotoğrafı en çok tekrarlanan an', () => {
    expect(gununAni({})).toBeNull();
    expect(gununAni({ 'findik:yiyor': 2, 'tarcin:oyun': 3, 'pofuduk:uyku': 1 })).toBe('tarcin:oyun');
  });

  it('Nehir abla v1 cümleleri seslendirme listesinde ve kısa; v2 sözleri kısa ve talimat değil', () => {
    const hepsi = new Set(tumCumleler());
    const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);
    for (const c of topla(P.nehir)) {
      expect(hepsi.has(normal(c))).toBe(true);
      expect(c.length).toBeLessThanOrEqual(30);
    }
    for (const c of topla(P.v2.nehir)) {
      expect(c.length).toBeLessThanOrEqual(30);
      expect(c.toLocaleLowerCase('tr')).not.toMatch(/dokun|tıkla|sürükle|şunu/);
    }
  });
});
