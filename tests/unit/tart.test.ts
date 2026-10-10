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

  it('turda 5 müşteri: ikinci ve dördüncüde domates ve bir çürük; ötekiler elma / portakal / patates', () => {
    const m = turMeyveleri(tohum(3));
    expect(m).toHaveLength(5);
    expect(m[1]).toBe('domates');
    expect(m[3]).toBe('domates');
    expect(new Set([m[0], m[2], m[4]])).toEqual(new Set(['elma', 'portakal', 'patates']));
    for (let i = 0; i < 5; i++) {
      const ist = tartIstekUret(4, i, tohum(i), m[i]);
      expect(ist.kasa.filter((k) => k.curuk)).toHaveLength(curukluMu(i) ? 1 : 0);
    }
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
