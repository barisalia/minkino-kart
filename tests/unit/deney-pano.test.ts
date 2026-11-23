import { describe, expect, it } from 'vitest';
import { akis, anahtar, bosMu, duzen, panodakiler, sonrakiAci, tepsi, uclar, type Parca, type Tur, type Yas } from '../../deney/src/pano/devre';

// Deneyler · Bağla ve Çalıştır (Mucit Panosu, Paket Deney-Y2): boru ve kablo akışı.
const doldur = (tur: Tur, yas: Yas, degis: (p: Parca, n: number) => Parca = (p) => p) => {
  const d = duzen(tur, yas);
  const yerlesen = new Map<string, Parca>(d.bosluk.map((b, n) => [anahtar(b), degis({ tur: b.tur, aci: b.aci }, n)]));
  return { d, yerlesen };
};

describe('Mucit Panosu · parçaların uçları', () => {
  it('düz batı–doğu, dirsek batı–güney; saat yönünde döner', () => {
    expect(uclar({ tur: 'duz', aci: 0 })).toEqual(['B', 'D']);
    expect(uclar({ tur: 'duz', aci: 90 })).toEqual(['K', 'G']);
    expect(uclar({ tur: 'dirsek', aci: 0 })).toEqual(['B', 'G']);
    expect(uclar({ tur: 'dirsek', aci: 90 })).toEqual(['K', 'B']);
    expect(uclar({ tur: 'dirsek', aci: 180 })).toEqual(['D', 'K']);
    expect(sonrakiAci(270)).toBe(0);
  });
});

for (const tur of ['su', 'isik'] as const) {
  describe('Mucit Panosu · ' + (tur === 'su' ? 'su turu' : 'ışık turu'), () => {
    for (const yas of ['minik', 'dort', 'bes'] as const) {
      it(yas + ': boşluklar doğru doldurulunca akış hedefe ulaşır; boşluk sayısı yaşla artar', () => {
        const { d, yerlesen } = doldur(tur, yas);
        expect(d.bosluk.length).toBe({ minik: 1, dort: 2, bes: 3 }[yas]);
        expect(tepsi(d).length).toBe(d.bosluk.length);
        const r = akis(d, panodakiler(d, yerlesen));
        expect(r.ulasti).toBe(true);
        expect(r.sizinti).toBeNull();
      });
      it(yas + ': bir boşluk eksikken akış o boşluğa bakan uçtan sızar', () => {
        const { d } = doldur(tur, yas);
        const r = akis(d, panodakiler(d, new Map()));
        expect(r.ulasti).toBe(false);
        expect(r.sizinti).not.toBeNull();
        // Sızıntının baktığı kare ilk boşluk.
        const ilk = d.bosluk[0];
        const s = r.sizinti!;
        const bakilan = { i: s.i + (s.yon === 'D' ? 1 : s.yon === 'B' ? -1 : 0), j: s.j + (s.yon === 'G' ? 1 : s.yon === 'K' ? -1 : 0) };
        expect(bakilan).toEqual({ i: ilk.i, j: ilk.j });
      });
    }
    it('ters dönük dirsek akışı durdurur (5+); doğru açıya çevrilince akar', () => {
      const { d, yerlesen } = doldur(tur, 'bes', (p) => (p.tur === 'dirsek' ? { tur: 'dirsek', aci: 0 } : p));
      const dirsekVar = d.bosluk.some((b) => b.tur === 'dirsek' && b.aci !== 0);
      if (!dirsekVar) return;
      expect(akis(d, panodakiler(d, yerlesen)).ulasti).toBe(false);
    });
  });
}

describe('Mucit Panosu · şalter ve yuvalar', () => {
  it('şalter kalkıkken (kapalı) devre tam olsa bile ampul yanmaz; sızıntı da sayılmaz', () => {
    const { d, yerlesen } = doldur('isik', 'dort');
    const r = akis(d, panodakiler(d, yerlesen), false);
    expect(r.ulasti).toBe(false);
    expect(r.sizinti).toBeNull();
  });
  it('yalnız boşluk karelerine ve bir kez parça konur', () => {
    const d = duzen('su', 'dort');
    const b = d.bosluk[0];
    expect(bosMu(d, b, new Map())).toBe(true);
    expect(bosMu(d, b, new Map([[anahtar(b), { tur: 'duz', aci: 0 }]]))).toBe(false);
    expect(bosMu(d, { i: 0, j: 0 }, new Map())).toBe(false);
  });
});
