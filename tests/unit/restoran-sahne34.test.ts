/**
 * Tıkır Tıkır Lokanta · P8 3/4 sahne (ekip/senaryo/RESTORAN.md §7, §12 P8): ölçek (olc34), yerleşim tablosu
 * sınırları, yol grafiği (her hedefe yol var, kimse masanın / tezgâhın / çitin içinden geçmez), derinlik sırası,
 * HUD kuralları (kavanoz yalnız dolar), balon ikonlarının menü ve isteklerle eşleşmesi.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { birimYuzde, ENAZ_BOY34, MASA34, olc34, SAHNE34, YERLESIM34, type Yer, type Yon } from '../../restoran/src/olcek';
import { derinlik, gorur, grafikKur, kutudaMi, masaEngeli, masaYaniYeri, parcaKutuyuKeser, sandalyeYeri, yolBul } from '../../restoran/src/lokanta/sahne34';
import { gunNoktalari, hava, kalpEkle, KAVANOZ_KAPASITE, kavanozDoluluk, sandikYigini, tepkiKalbi } from '../../restoran/src/lokanta/hud';
import { KAPASITE, SIRA_EN_COK, YOL_BASI_EN_COK, yuvalar } from '../../restoran/src/lokanta/sira';
import { IPUCLARI, TARIFLER } from '../../restoran/src/model';
import { BOY } from '../../src/karakter/boy';

const YONLER: Yon[] = ['yatay', 'dikey'];
const EKRANLAR: [number, number][] = [
  [844, 390],
  [932, 430],
  [667, 375],
  [390, 844],
];

describe('olc34: sahne alanı = ekran − HUD, contain, boy birimi', () => {
  for (const [w, h] of EKRANLAR) {
    it(`${w}x${h}`, () => {
      const o = olc34(w, h);
      // HUD: yatayda sağda %15 (≥ 112), dikeyde altta 96
      if (o.yon === 'yatay') {
        expect(o.hud.w).toBeGreaterThanOrEqual(112);
        expect(o.hud.x + o.hud.w).toBe(w);
        expect(o.sahne.x + o.sahne.w).toBeLessThanOrEqual(o.hud.x + 0.01);
      } else {
        expect(o.hud.h).toBe(96);
        expect(o.sahne.y + o.sahne.h).toBeLessThanOrEqual(o.hud.y + 0.01);
      }
      // resim kırpılmaz (contain), ekranın içinde
      expect(o.sahne.x).toBeGreaterThanOrEqual(0);
      expect(o.sahne.y).toBeGreaterThanOrEqual(0);
      expect(o.sahne.w / o.sahne.h).toBeCloseTo(SAHNE34.oran[o.yon], 3);
      // boy birimi resme göre; en uzun (Baba) ≤ %26
      const birim = o.yon === 'yatay' ? o.u / o.sahne.h : o.u / o.sahne.w;
      expect(birim).toBeCloseTo(SAHNE34.birim[o.yon], 5);
      if (o.yon === 'yatay') expect((BOY.baba * o.u) / o.sahne.h).toBeLessThanOrEqual(0.26);
      // netlik: 2752 px resim DPR 3'te kaynağın üstüne çıkmaz
      expect(Math.max(o.sahne.w, o.sahne.h) * 3).toBeLessThanOrEqual(2752 * 1.001);
    });
  }
  it('küçük karakter en az 0,95 boy (Kino 0,74 → yüz okunur)', () => {
    expect(ENAZ_BOY34).toBeGreaterThan(BOY.kino);
    expect(ENAZ_BOY34).toBeLessThan(BOY.anne);
  });
});

describe('YERLESIM34 tablo sınırları', () => {
  for (const yon of YONLER) {
    const Y = YERLESIM34[yon];
    it(`${yon}: yerler sahnenin içinde, 4 masa + 2 bahçe, 3 sıra + 2 yolun başı`, () => {
      const ic = (p: Yer) => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100;
      expect(Y.masalar).toHaveLength(4);
      expect(Y.bahce.masalar).toHaveLength(2);
      expect(Y.sira).toHaveLength(SIRA_EN_COK);
      expect(Y.yolBasi).toHaveLength(YOL_BASI_EN_COK);
      for (const p of [...Y.masalar, ...Y.bahce.masalar, ...Y.sira, ...Y.yolBasi, Y.kino, Y.kapi, Y.mino, Y.babaanne, ...Object.values(Y.yol), ...Object.values(Y.sus)]) expect(ic(p), JSON.stringify(p)).toBe(true);
      expect(ic(Y.giris)).toBe(false);
      for (const k of [...Object.values(Y.istasyon), Y.kasa, Y.pencere, ...Y.alet, Y.bahce.mangal, Y.pano, Y.foto]) {
        expect(k.x).toBeGreaterThanOrEqual(0);
        expect(k.y).toBeGreaterThanOrEqual(0);
        expect(k.x + k.w).toBeLessThanOrEqual(100);
        expect(k.y + k.h).toBeLessThanOrEqual(100);
      }
    });
    it(`${yon}: masalar birbirine ve engellere binmez; sandalye ve masa yanı açıkta`, () => {
      const hepsi = [...Y.masalar, ...Y.bahce.masalar.map((m) => ({ ...m, w: MASA34.bahceW }))];
      const eng = hepsi.map((m) => masaEngeli(m, yon));
      for (let i = 0; i < eng.length; i++)
        for (let j = i + 1; j < eng.length; j++) {
          const a = eng[i];
          const b = eng[j];
          const ust = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
          expect(ust, `masa ${i}-${j}`).toBe(false);
        }
      const sabit = Y.engel;
      for (const m of hepsi) {
        for (const p of [sandalyeYeri(m, yon, 2, 0), sandalyeYeri(m, yon, 2, 1), masaYaniYeri(m, yon, [...sabit, ...eng])]) {
          for (const k of [...sabit, ...eng]) expect(kutudaMi(p, k), `${JSON.stringify(p)} engelde`).toBe(false);
        }
      }
    });
  }
});

describe('yol grafiği: her hedefe yol var, hiçbir adım engelden geçmez', () => {
  for (const yon of YONLER) {
    for (const bahce of [false, true]) {
      it(`${yon}${bahce ? ' bahçeli' : ''}`, () => {
        const Y = YERLESIM34[yon];
        const masalar = bahce ? [...Y.masalar, ...Y.bahce.masalar.map((m) => ({ ...m, w: MASA34.bahceW }))] : Y.masalar;
        const g = grafikKur(Y, yon, masalar, bahce);
        const hedefler: Yer[] = [
          Y.kino,
          ...Y.sira,
          ...Y.yolBasi,
          Y.giris,
          ...masalar.flatMap((m) => [sandalyeYeri(m, yon, 2, 0), sandalyeYeri(m, yon, 2, 1), masaYaniYeri(m, yon, g.engel)]),
        ];
        const baslar: Yer[] = [Y.giris, Y.kino, ...Y.sira];
        for (const a of baslar)
          for (const b of hedefler) {
            const yol = yolBul(g, a, b);
            expect(yol[yol.length - 1]).toEqual(b);
            let onceki = a;
            for (const p of yol) {
              for (const k of g.engel) expect(parcaKutuyuKeser(onceki, p, k), `${JSON.stringify(onceki)} → ${JSON.stringify(p)} engelden geçiyor`).toBe(false);
              onceki = p;
            }
          }
      });
    }
  }
  it('bahçe kapalıyken bahçeye yol yok (kapı kapalı), açıkken var', () => {
    const Y = YERLESIM34.yatay;
    const kapali = grafikKur(Y, 'yatay', Y.masalar, false);
    expect(gorur(Y.yol.sagUst, Y.yol.bahceGiris, kapali.engel)).toBe(false);
    const acik = grafikKur(Y, 'yatay', [...Y.masalar, ...Y.bahce.masalar.map((m) => ({ ...m, w: MASA34.bahceW }))], true);
    expect(gorur(Y.yol.sagUst, Y.yol.bahceGiris, acik.engel)).toBe(true);
  });
});

describe('derinlik', () => {
  it('aynı çizgide sandalye < oturan < masa < ayakta; aşağıdaki (önde) her zaman üstte', () => {
    expect(derinlik(60, 'sandalye')).toBeLessThan(derinlik(60, 'oturan'));
    expect(derinlik(60, 'oturan')).toBeLessThan(derinlik(60, 'masa'));
    expect(derinlik(60, 'masa')).toBeLessThan(derinlik(60.1, 'sandalye') + 4);
    // önden geçen (y büyük) masanın önünde, arkadan geçen arkasında
    expect(derinlik(65)).toBeGreaterThan(derinlik(60, 'masa'));
    expect(derinlik(55)).toBeLessThan(derinlik(60, 'sandalye'));
  });
  it('masa ölçüsü: oturanın kesik çizgisi masa üstünün altında', () => {
    expect(MASA34.kesik).toBeLessThan(MASA34.ustOrta);
    expect(MASA34.ustOrta).toBeLessThan(MASA34.h);
    expect(birimYuzde('yatay').y).toBeCloseTo(11, 5);
  });
});

describe('HUD kuralları', () => {
  it('kalp kavanozu yalnız dolar: komik tepki kalp düşürmez', () => {
    let n = 5;
    for (const t of ['komik', 'komik', 'mmm', 'komik', 'bayildi', 'komik']) {
      const yeni = kalpEkle(n, t);
      expect(yeni).toBeGreaterThanOrEqual(n);
      n = yeni;
    }
    expect(n).toBe(8);
    expect(tepkiKalbi('komik')).toBe(0);
    expect(tepkiKalbi('mmm')).toBe(1);
    expect(tepkiKalbi('bayildi')).toBe(2);
    expect(kavanozDoluluk(KAVANOZ_KAPASITE + 4)).toBe(1);
  });
  it('takvim, sandık', () => {
    expect(hava(1)).toBe('gunes');
    expect(['gunes', 'bulut', 'yagmur']).toContain(hava(17));
    expect(gunNoktalari(30)).toBe(10);
    expect(sandikYigini(0)).toBe(0);
    expect(sandikYigini(100)).toBe(14);
    expect(sandikYigini(5)).toBeGreaterThan(sandikYigini(1));
  });
  it('sıra: en çok 3 sırada + 2 yolun başında', () => {
    expect(KAPASITE).toBe(5);
    expect(yuvalar(7)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('balon ikonları (§7e): 12 yemek ve 6 ipucu, menü ve isteklerle eşleşir', () => {
  const isle = readFileSync('ekip/illustrator/restoran/restoran-isle.cjs', 'utf8');
  const adlar = (sayfa: string) => {
    const m = new RegExp(`'${sayfa}': \\{[^\\n]*adlar: \\[([^\\]]*)\\]`).exec(isle);
    return (m?.[1] ?? '').split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
  };
  it('balon-ikon-yemek = TARIFLER (12)', () => {
    const y = adlar('balon-ikon-yemek');
    expect(y).toHaveLength(12);
    expect(y.map((a) => a.replace(/^yemek-/, '')).sort()).toEqual(Object.keys(TARIFLER).sort());
  });
  it('balon-ikon-durum ipuçları = IPUCLARI (6), soru ve balon resimleri', () => {
    const d = adlar('balon-ikon-durum');
    expect(d).toHaveLength(16);
    expect(d.filter((a) => a.startsWith('ipucu-')).map((a) => a.replace(/^ipucu-/, '')).sort()).toEqual([...IPUCLARI].sort());
    for (const a of ['balon-sag', 'soru', 'kalp', 'hesap', 'unlem', 'zzz']) expect(d).toContain(a);
  });
  it('kesilen adlarda sürüm eki gibi okunacak rakam yok', () => {
    for (const s of ['masa-sandalye-34', 'sus-34', 'hud-panel', 'hud-parcalar', 'balon-ikon-yemek', 'balon-ikon-durum']) for (const a of adlar(s)) expect(a, s).not.toMatch(/-\d+$/);
  });
});

describe('varlık tablosu: rakamla biten kare adları (Kino on-1, sira-2) tam adlarıyla bulunur', () => {
  it('surumTablosu', async () => {
    const { surumTablosu } = await import('../../restoran/src/varliklar');
    const t = surumTablosu({ 'assets/restoran/kisi/kino/on-1.webp': 'a', 'assets/restoran/kisi/kino/on-2.webp': 'b', 'assets/restoran/sus/masa.webp': 'm', 'assets/restoran/sus/masa-2.webp': 'm2' });
    expect(t.get('kisi/kino/on-1')).toBe('a');
    expect(t.get('kisi/kino/on-2')).toBe('b');
    // sürüm eki: en yüksek sürüm
    expect(t.get('sus/masa')).toBe('m2');
  });
});
