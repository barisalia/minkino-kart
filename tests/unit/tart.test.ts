import { describe, expect, it } from 'vitest';
import P from '../../content/pazar.json';
import { tumCumleler } from '../../src/audio/cumleler';
import { ERISIM, erisimTuru } from '../../src/engine/erisim';
import type { Yas } from '../../src/engine/types';
import {
  AGIRLIK_ARALIGI,
  BOLGE,
  BOLGE_ACI,
  curukluMu,
  ibreAcisi,
  IBRE_EN,
  LEGEN_KAPASITE,
  tartCumleleri,
  tartDenetle,
  tartIstekUret,
  tartMusteriSayisi,
  TART_MEYVELER,
  turMeyveleri,
  toplam,
  type KasaMeyve,
  type TartIstek,
  yiginSatirlari,
} from '../../pazar/src/tart';

/** Tekrarlanabilir rastgele */
function tohum(n: number) {
  let s = n >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const YASLAR: Yas[] = [3, 4, 5, 6];
const saglamlar = (ist: TartIstek) => ist.kasa.filter((k) => !k.curuk);

describe('Tart Bakalım: ağırlıklar', () => {
  it('her meyve gerçekçi aralıkta ve hiçbiri yeşil bölgeden ağır değil (ibre yeşilin üstünden atlayamaz)', () => {
    for (const m of TART_MEYVELER) {
      const [a, b] = AGIRLIK_ARALIGI[m];
      expect(a).toBeGreaterThan(0.1);
      expect(b).toBeLessThan(0.26);
      for (const { bolge } of Object.values(BOLGE)) expect(b).toBeLessThanOrEqual(bolge[1] - bolge[0]);
    }
  });

  it('sırayla konan meyveler yeşilde mutlaka bir an durur (her müşteri için, en hafifinden en ağırına)', () => {
    for (let t = 1; t < 300; t++) {
      const rnd = tohum(t);
      const ist = tartIstekUret(t % 2 ? 5 : 6, t % 5, rnd);
      const [lo, hi] = ist.bolge!;
      // kasadaki sağlam meyveleri hangi sırayla koyarsa koysun
      const sira = saglamlar(ist).sort(() => rnd() - 0.5);
      let kg = 0;
      let yesil = false;
      for (const m of sira) {
        kg += m.agirlik;
        if (kg >= lo && kg <= hi) yesil = true;
        if (kg > hi) break;
      }
      expect(yesil).toBe(true);
    }
  });

  it('toplam gram yuvarlamalı', () => {
    expect(toplam([{ agirlik: 0.1 }, { agirlik: 0.2 }])).toBe(0.3);
  });
});

describe('Tart Bakalım: istekler', () => {
  it('3-4 yaş sayar, 5-6 yaş tartar; balon ve cümle doğru', () => {
    for (const y of YASLAR) {
      for (let i = 0; i < 5; i++) {
        const ist = tartIstekUret(y, i, tohum(i + y * 10));
        if (y <= 4) {
          expect(ist.mod).toBe('say');
          const [en, son] = y === 3 ? [2, 3] : [3, 5];
          expect(ist.adet).toBeGreaterThanOrEqual(en);
          expect(ist.adet).toBeLessThanOrEqual(son);
          // kasada istenenden fazla sağlam meyve var (fazlası da konabilsin)
          expect(saglamlar(ist).length).toBe(ist.adet! + 2);
          expect(ist.soz[0]).toMatch(/lütfen!$/);
        } else {
          expect(ist.mod).toBe('tart');
          expect(ist.bolge).toEqual(BOLGE[ist.miktar!].bolge);
          expect(ist.soz[0]).toMatch(ist.miktar === 'kilo' ? /^Bir kilo / : /^Yarım kilo /);
        }
      }
    }
    // 5 yaşta ilk müşteri yarım kilo (kolay başlangıç)
    expect(tartIstekUret(5, 0).miktar).toBe('yarim');
  });

  it('en çok 8 meyve: yığına ve leğene sığar (fizik ≤ 15 cisim)', () => {
    for (let t = 0; t < 200; t++) {
      const ist = tartIstekUret(YASLAR[t % 4], t % 5, tohum(t));
      expect(ist.kasa.length).toBeLessThanOrEqual(8);
      expect(ist.kasa.length).toBeLessThanOrEqual(LEGEN_KAPASITE);
    }
  });

  it('turda 2–3 yaşta 3, büyüklerde 4 müşteri: yalnız ikincide domates ve bir çürük; meyve yinelenmez', () => {
    expect(tartMusteriSayisi(3)).toBe(3);
    for (const y of [4, 5, 6] as const) expect(tartMusteriSayisi(y)).toBe(4);
    for (const n of [3, 4]) {
      for (let t = 0; t < 30; t++) {
        const m = turMeyveleri(tohum(t), n);
        expect(m).toHaveLength(n);
        expect(m[1]).toBe('domates');
        expect(new Set(m).size).toBe(n);
        for (const x of m) if (x !== 'domates') expect(['elma', 'portakal', 'patates']).toContain(x);
        for (let i = 0; i < n; i++) {
          const ist = tartIstekUret(4, i, tohum(i), m[i]);
          expect(ist.kasa.filter((k) => k.curuk)).toHaveLength(i === 1 ? 1 : 0);
          expect(curukluMu(i)).toBe(i === 1);
        }
      }
    }
  });

  it('çürüklü müşteri hep domates ister (çürük çizimi yalnız domatesin var: assets/pazar/domates-curuk)', () => {
    const gorseller = import.meta.glob('../../assets/pazar/*-curuk.webp');
    expect(Object.keys(gorseller)).toEqual(['../../assets/pazar/domates-curuk.webp']);
    for (const y of YASLAR) for (const m of TART_MEYVELER) {
      const ist = tartIstekUret(y, 0, tohum(y), m, true);
      expect(ist.meyve).toBe('domates');
      expect(ist.kasa.filter((k) => k.curuk).map((k) => k.meyve)).toEqual(['domates']);
    }
  });

  it('bir turda aynı istek en çok iki kez: tartmada yarım / bir kilo sırayla, saymada sayı art arda yinelenmez', () => {
    for (const y of YASLAR) {
      for (let t = 0; t < 60; t++) {
        const m = turMeyveleri(tohum(t), tartMusteriSayisi(y));
        const tur: TartIstek[] = [];
        for (let i = 0; i < m.length; i++) tur.push(tartIstekUret(y, i, tohum(t * 7 + i), m[i], undefined, tur[i - 1]));
        const sozler = tur.flatMap((x) => x.soz);
        for (const s of new Set(sozler)) expect(sozler.filter((x) => x === s).length, s).toBeLessThanOrEqual(1);
        if (y >= 5) {
          const kilo = tur.filter((x) => x.miktar === 'kilo').length;
          expect(kilo).toBe(2);
          tur.forEach((x, i) => i > 0 && expect(x.miktar).not.toBe(tur[i - 1].miktar));
        } else tur.forEach((x, i) => i > 0 && expect(x.adet).not.toBe(tur[i - 1].adet));
      }
    }
    // 5 yaşta ilk müşteri yarım kilo (kolay başlangıç), 6 yaşta bir kilo
    expect(tartIstekUret(5, 0).miktar).toBe('yarim');
    expect(tartIstekUret(6, 0).miktar).toBe('kilo');
  });
});

describe('Tart Bakalım: denetim', () => {
  const km = (agirlik: number, curuk = false): KasaMeyve => ({ meyve: 'domates', agirlik, curuk });

  it('sayma: tam / az / fazla', () => {
    const ist = tartIstekUret(4, 0, tohum(1), 'elma');
    const n = ist.adet!;
    expect(tartDenetle(ist, Array.from({ length: n }, () => km(0.18)))).toBe('tamam');
    expect(tartDenetle(ist, Array.from({ length: n - 1 }, () => km(0.18)))).toBe('az');
    expect(tartDenetle(ist, Array.from({ length: n + 1 }, () => km(0.18)))).toBe('fazla');
  });

  it('tartma: yeşilin altı az, içi tamam, üstü fazla (sınırlar dahil)', () => {
    const ist = tartIstekUret(6, 1, tohum(2), 'domates', false);
    const [lo, hi] = ist.bolge!;
    expect(tartDenetle(ist, [km(lo - 0.01)])).toBe('az');
    expect(tartDenetle(ist, [km(lo)])).toBe('tamam');
    expect(tartDenetle(ist, [km(hi)])).toBe('tamam');
    expect(tartDenetle(ist, [km(hi + 0.01)])).toBe('fazla');
  });

  it('çürük verilirse müşteri geri verir (sayı / ağırlık tutsa bile)', () => {
    const ist = tartIstekUret(6, 1, tohum(2), 'domates', true);
    expect(tartDenetle(ist, [km(0.5), km(0.5, true)])).toBe('curuk');
    const say = tartIstekUret(3, 1, tohum(2), 'domates', true);
    expect(tartDenetle(say, [...Array.from({ length: say.adet! }, () => km(0.15)), km(0.15, true)])).toBe('curuk');
  });
});

describe('Tart Bakalım: kadran', () => {
  const ist = tartIstekUret(6, 1, tohum(5), 'domates', false);
  it('boşken en solda, yeşil bölge tepede ±BOLGE_ACI, fazlası sağda; artan ağırlık hep sağa', () => {
    const [lo, hi] = ist.bolge!;
    expect(ibreAcisi(ist, 0)).toBe(-IBRE_EN);
    expect(ibreAcisi(ist, lo)).toBeCloseTo(-BOLGE_ACI);
    expect(ibreAcisi(ist, hi)).toBeCloseTo(BOLGE_ACI);
    expect(ibreAcisi(ist, (lo + hi) / 2)).toBeCloseTo(0);
    let once = -Infinity;
    for (let w = 0; w < 2; w += 0.05) {
      const a = ibreAcisi(ist, w);
      expect(a).toBeGreaterThanOrEqual(once);
      expect(a).toBeLessThanOrEqual(IBRE_EN + 6);
      once = a;
    }
  });
  it('saymada istenen kadar meyve ibreyi tepeye yakın getirir', () => {
    const say = tartIstekUret(4, 0, tohum(1), 'elma');
    const [a, b] = AGIRLIK_ARALIGI.elma;
    expect(Math.abs(ibreAcisi(say, say.adet! * ((a + b) / 2)))).toBeLessThan(15);
  });
});

describe('Tart Bakalım: yığın, ses, erişim', () => {
  it('yığın piramidi: alttan üste daralır, toplam doğru', () => {
    for (let n = 1; n <= 8; n++) {
      const s = yiginSatirlari(n);
      expect(s.reduce((a, b) => a + b, 0)).toBe(n);
      for (let i = 1; i < s.length; i++) expect(s[i]).toBeLessThan(s[i - 1]);
      expect(s[0]).toBeLessThanOrEqual(4);
    }
  });

  it('bütün cümleler seslendirme listesinde, kısa; "öğüt" kelimesi yok', () => {
    const hepsi = new Set(tumCumleler());
    for (const c of tartCumleleri()) {
      expect(hepsi.has(c)).toBe(true);
      expect(c.length).toBeLessThanOrEqual(30);
      expect(c.toLocaleLowerCase('tr')).not.toContain('öğüt');
    }
    expect(JSON.stringify(P.tart).toLocaleLowerCase('tr')).not.toContain('öğüt');
  });

  it('sayılar macera kayıtlarıyla aynı (yeni kredi yok)', () => {
    expect(P.tart.sayilar.slice(0, 3)).toEqual(['Bir!', 'İki!', 'Üç!']);
  });

  it('erişim: pazarın bir bölümü, abonelikle', () => {
    expect(ERISIM['pazar/tart']).toBe('abonelik');
    expect(erisimTuru('pazar/tart')).toBe('abonelik');
  });
});
