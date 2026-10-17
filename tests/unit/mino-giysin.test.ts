import { describe, expect, it } from 'vitest';
import M from '../../content/mino-giysin.json';
import { normal, tumCumleler, karakterCumleleri } from '../../src/audio/cumleler';
import {
  ALETLER,
  ayniSayac,
  cikar,
  cozumAletleri,
  DERTLER,
  digerCozum,
  hizliUc,
  ipucuSureleri,
  karistirmaTamam,
  kostumEtkisi,
  kostumRolu,
  PARCALAR,
  partiAcik,
  ROLLER,
  sapkaNereye,
  SONUC,
  susVar,
  tamYildizEkle,
  takimAdi,
  uygunRoller,
  tekrarSayisi,
  yasGrubu,
  yerDegistir,
  yildizEkle,
  yildizlar,
  YERLER,
} from '../../mino-giysin/src/model';

const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);

describe('Mino Ne Giysin? · sonuç tablosu', () => {
  it('12 parça: 4 rol × 3 yer, kimlikler tekil', () => {
    expect(PARCALAR).toHaveLength(12);
    expect(new Set(PARCALAR.map((p) => p.id)).size).toBe(12);
    for (const y of YERLER) expect(PARCALAR.filter((p) => p.yer === y).map((p) => p.rol)).toEqual([...ROLLER]);
  });
  it('16 sonuç: her dertte tam 2 çözüm, 2 komik başarısızlık', () => {
    let cozum = 0;
    let komik = 0;
    for (const d of DERTLER) {
      expect(Object.keys(SONUC[d]).sort()).toEqual([...ALETLER].sort());
      expect(cozumAletleri(d)).toHaveLength(2);
      for (const a of ALETLER) (SONUC[d][a].tur === 'cozum' ? cozum++ : komik++);
    }
    expect([cozum, komik]).toEqual([8, 8]);
  });
  it('senaryodaki çözümler', () => {
    expect(cozumAletleri('pamuk').sort()).toEqual(['kasik', 'merdiven']);
    expect(cozumAletleri('kino').sort()).toEqual(['kasik', 'stetoskop']);
    expect(cozumAletleri('ege').sort()).toEqual(['kasik', 'merdiven']);
    expect(cozumAletleri('ada').sort()).toEqual(['kasik', 'sulama']);
    expect(digerCozum('kino', 'stetoskop')).toBe('kasik');
  });
  it('yaş farkı: tekrar sayısı ve ipucu süreleri', () => {
    expect(yasGrubu(3)).toBe('34');
    expect(yasGrubu(6)).toBe('56');
    expect(yasGrubu(null)).toBe('34');
    expect(tekrarSayisi('pamuk', 'merdiven', '34')).toBe(1);
    expect(tekrarSayisi('pamuk', 'merdiven', '56')).toBe(3);
    expect(tekrarSayisi('pamuk', 'kasik', '34')).toBe(3);
    expect(tekrarSayisi('ada', 'sulama', '34')).toBe(2);
    expect(tekrarSayisi('ada', 'sulama', '56')).toBe(3);
    // ilk parlama (alet sallanır): 3-4'te 35 sn, 5-6'da 40 sn'den önce değil
    expect(ipucuSureleri('34')[2]).toBeGreaterThanOrEqual(35);
    expect(ipucuSureleri('56')[2]).toBeGreaterThanOrEqual(40);
  });
});

describe('Mino Ne Giysin? · kostüm', () => {
  it('yer değiştirme: aynı yere ikinci parça eskisini fırlatır', () => {
    let g = yerDegistir({}, 'bas-doktor');
    expect(g.eski).toBeNull();
    g = yerDegistir(g.giyili, 'bas-asci');
    expect(g.eski).toBe('bas-doktor');
    expect(g.giyili.bas).toBe('bas-asci');
    const ayni = yerDegistir(g.giyili, 'bas-asci');
    expect(ayni.eski).toBeNull();
    expect(cikar(g.giyili, 'bas-asci').bas).toBeUndefined();
  });
  it('takım adı: tam / karışık / eksik', () => {
    expect(takimAdi({ bas: 'bas-itfaiye', ust: 'ust-itfaiye', alet: 'alet-itfaiye' })).toBe('tam:itfaiye');
    expect(takimAdi({ bas: 'bas-itfaiye', ust: 'ust-asci', alet: 'alet-itfaiye' })).toBe('karisik');
    expect(takimAdi({ bas: 'bas-itfaiye' })).toBe('eksik');
  });
  it('tam takım süsü yalnız o rolün çözümünde', () => {
    const itf = { bas: 'bas-itfaiye', ust: 'ust-itfaiye', alet: 'alet-itfaiye' } as const;
    expect(susVar(itf, 'pamuk', 'merdiven')).toBe(true);
    expect(susVar(itf, 'kino', 'merdiven')).toBe(false);
    expect(susVar({ ...itf, ust: 'ust-asci' }, 'pamuk', 'merdiven')).toBe(false);
  });
  it('kostüm etkisi (§4a): uygun kostüm + doğru alet tam, yanlış kostüm ek an, uygun kostüm + yanlış alet şaka', () => {
    expect(kostumRolu({ bas: 'bas-itfaiye', ust: 'ust-itfaiye' })).toBe('itfaiye');
    expect(kostumRolu({ bas: 'bas-itfaiye' })).toBeNull();
    expect(kostumRolu({ bas: 'bas-itfaiye', ust: 'ust-asci' })).toBeNull();
    expect(uygunRoller('pamuk').sort()).toEqual(['asci', 'itfaiye']);
    expect(uygunRoller('kino').sort()).toEqual(['asci', 'doktor']);
    expect(uygunRoller('ada').sort()).toEqual(['asci', 'bahce']);
    const itf = { bas: 'bas-itfaiye', ust: 'ust-itfaiye' } as const;
    expect(kostumEtkisi(itf, 'pamuk', 'merdiven')).toBe('tam');
    expect(kostumEtkisi(itf, 'pamuk', 'kasik')).toBe('ek');
    expect(kostumEtkisi({ bas: 'bas-asci' }, 'pamuk', 'merdiven')).toBe('ek');
    expect(kostumEtkisi({}, 'ege', 'merdiven')).toBe('ek');
    expect(kostumEtkisi(itf, 'pamuk', 'sulama')).toBe('saka');
    expect(kostumEtkisi(itf, 'kino', 'sulama')).toBe('yok');
    expect(kostumEtkisi({ bas: 'bas-doktor', ust: 'ust-asci' }, 'kino', 'merdiven')).toBe('yok');
    // her dertte her rolün kostümüyle 4 aletin sonucu: çözümler tam/ek, başarısızlıklar şaka/yok; şaka yalnız uygun rolde
    for (const d of DERTLER)
      for (const r of ROLLER)
        for (const a of ALETLER) {
          const e = kostumEtkisi({ bas: `bas-${r}`, ust: `ust-${r}` }, d, a);
          if (SONUC[d][a].tur === 'cozum') expect(['tam', 'ek']).toContain(e);
          else expect(e).toBe(uygunRoller(d).includes(r) ? 'saka' : 'yok');
        }
  });
  it('uçan şapka %25: arkadaş varsa kafasına, yoksa dolaba', () => {
    expect(sapkaNereye([], 0.1)).toBe('dolap');
    expect(sapkaNereye(['kino'], 0.1)).toBe('kino');
    expect(sapkaNereye(['kino', 'ada'], 0.2)).toBe('ada');
    expect(sapkaNereye(['kino'], 0.5)).toBe('dolap');
  });
  it('üst üste aynı parça sayacı, hızlı üç dokunuş, karıştırma', () => {
    let s = ayniSayac({ id: null, kez: 0 }, 'bas-asci');
    for (let i = 0; i < 4; i++) s = ayniSayac(s, 'bas-asci');
    expect(s.kez).toBe(5);
    expect(ayniSayac(s, 'bas-doktor').kez).toBe(1);
    expect(hizliUc([0, 300, 700])).toBe(true);
    expect(hizliUc([0, 600, 1300])).toBe(false);
    expect(karistirmaTamam(Math.PI * 1.5)).toBe(true);
    expect(karistirmaTamam(Math.PI)).toBe(false);
  });
});

describe('Mino Ne Giysin? · yıldızlar ve oturum', () => {
  it('8 yıldız, yalnız çözümler dolar, tekrar dolmaz', () => {
    const k = { yildiz: [] as string[] };
    expect(yildizlar(k)).toHaveLength(8);
    expect(yildizEkle(k, 'pamuk', 'sulama')).toBe(false);
    expect(yildizEkle(k, 'pamuk', 'merdiven')).toBe(true);
    expect(yildizEkle(k, 'pamuk', 'merdiven')).toBe(false);
    expect(yildizlar(k).filter((y) => y.dolu)).toHaveLength(1);
  });
  it('uygun kostümle bulunan çözümün yıldızı parlar', () => {
    const k = { yildiz: ['pamuk:merdiven'], tam: [] as string[] };
    expect(tamYildizEkle(k, 'pamuk', 'sulama')).toBe(false);
    expect(tamYildizEkle(k, 'pamuk', 'merdiven')).toBe(true);
    expect(tamYildizEkle(k, 'pamuk', 'merdiven')).toBe(false);
    expect(yildizlar(k).filter((y) => y.tam).map((y) => `${y.dert}:${y.alet}`)).toEqual(['pamuk:merdiven']);
  });
  it('parti açık dertler çözülünce açılır', () => {
    expect(partiAcik(['pamuk', 'kino'], ['pamuk', 'kino'])).toBe(true);
    expect(partiAcik(['pamuk'], ['pamuk', 'kino', 'ege', 'ada'])).toBe(false);
    expect(partiAcik([], [])).toBe(false);
  });
});

describe('Mino Ne Giysin? · cümleler', () => {
  const sesli = [...topla(M.mino), ...topla(M.hazir), ...topla(M.kino)];
  it('anlatım "dokun / sürükle / ver" demez (Barış: şunu tıkla yok)', () => {
    for (const t of [...sesli, ...topla(M.ege)]) {
      const kelimeler = t
        .replace(/\[[^\]]*\]/g, '')
        .toLocaleLowerCase('tr')
        .split(/[^a-zçğıöşü]+/);
      for (const k of kelimeler) {
        expect(k.startsWith('dokun') || k.startsWith('sürükle') || k === 'ver' || k.startsWith('verir') || k.startsWith('tıkla'), `${t}`).toBe(false);
      }
    }
  });
  it('kısa: etiketsiz ≤ 30 karakter', () => {
    for (const t of sesli) expect(t.replace(/\[[^\]]*\]\s*/g, '').length, t).toBeLessThanOrEqual(30);
  });
  it('seslendirme listesinde (Kino kendi sesiyle)', () => {
    const hepsi = new Set(tumCumleler());
    for (const t of sesli) expect(hepsi.has(normal(t)), t).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const t of topla(M.kino)) expect(kino.has(normal(t)), t).toBe(true);
  });
});
