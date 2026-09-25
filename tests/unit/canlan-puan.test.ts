import { describe, expect, it } from 'vitest';
import { canlanirMi, noktaDizisi, ornekle, puanla } from '../../canlan/src/puan';
import { RESIMLER, resim, type Nokta } from '../../canlan/src/resimler';

/** Tekrarlanabilir rastgele sayı */
function rastgele(tohum: number) {
  let s = tohum >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/**
 * Çocuk eli benzetimi: yavaş dalgalanan sapma (el titremesi) + küçük hızlı titreme.
 * `kay`: tüm çizimin kayması, `olcek`/`yer`: başka yere başka büyüklükte çizme.
 */
function cocukCizer(id: string, o: { titreme: number; kucukTitreme?: number; tohum?: number; olcek?: number; yer?: Nokta; atla?: string[]; enBoy?: number }) {
  const r = resim(id)!;
  const rnd = rastgele(o.tohum ?? 7);
  const s = o.olcek ?? 1;
  const [ox, oy] = o.yer ?? [0, 0];
  const eb = o.enBoy ?? 1;
  return r.cizgiler
    .filter((c) => !o.atla?.includes(c.parca))
    .map((c) => {
      const n = ornekle(c.n, 0.01);
      let fx = (rnd() - 0.5) * 2;
      let fy = (rnd() - 0.5) * 2;
      return n.map(([x, y]): Nokta => {
        fx = Math.max(-1, Math.min(1, fx + (rnd() - 0.5) * 0.35));
        fy = Math.max(-1, Math.min(1, fy + (rnd() - 0.5) * 0.35));
        const j = o.kucukTitreme ?? 0.006;
        return [
          (x - 0.5) * s * eb + 0.5 + ox + fx * o.titreme + (rnd() - 0.5) * 2 * j,
          (y - 0.5) * s + 0.5 + oy + fy * o.titreme + (rnd() - 0.5) * 2 * j,
        ];
      });
    });
}

/** Özensiz ama doğru çizim: her parça biraz büyük/küçük, kaymış, eğik; uçları eksik; el titrek. */
function ozensiz(id: string, tohum: number, olcek = 0.7, yer: Nokta = [0.05, 0.05], guc = 1) {
  const rnd = rastgele(tohum);
  return resim(id)!.cizgiler.map((c) => {
    const n = ornekle(c.n, 0.01);
    const cx = n.reduce((a, p) => a + p[0], 0) / n.length;
    const cy = n.reduce((a, p) => a + p[1], 0) / n.length;
    const ps = 1 + (rnd() - 0.5) * 0.45 * guc;
    const ox = (rnd() - 0.5) * 0.1 * guc;
    const oy = (rnd() - 0.5) * 0.1 * guc;
    const rot = (rnd() - 0.5) * 0.28 * guc;
    let fx = rnd() * 2 - 1;
    let fy = rnd() * 2 - 1;
    const bas = Math.floor(n.length * rnd() * 0.08);
    const son = n.length - Math.floor(n.length * rnd() * 0.08);
    return n.slice(bas, Math.max(bas + 2, son)).map(([x, y]): Nokta => {
      fx = Math.max(-1, Math.min(1, fx + (rnd() - 0.5) * 0.35));
      fy = Math.max(-1, Math.min(1, fy + (rnd() - 0.5) * 0.35));
      let dx = (x - cx) * ps;
      let dy = (y - cy) * ps;
      [dx, dy] = [dx * Math.cos(rot) - dy * Math.sin(rot), dx * Math.sin(rot) + dy * Math.cos(rot)];
      const X = cx + dx + ox + fx * 0.03;
      const Y = cy + dy + oy + fy * 0.03;
      return [(X - 0.5) * olcek + 0.5 + yer[0], (Y - 0.5) * olcek + 0.5 + yer[1]];
    });
  });
}

/** Gerçekçi karalama: dönerek ilerleyen kıvrımlar (+ birkaç düz çizgi). */
function karalama(tohum: number, uzunlukHedef = 6): Nokta[][] {
  const rnd = rastgele(tohum);
  let cx = 0.3 + rnd() * 0.4;
  let cy = 0.3 + rnd() * 0.4;
  let a = 0;
  const n: Nokta[] = [];
  let L = 0;
  while (L < uzunlukHedef) {
    const r = 0.05 + rnd() * 0.12;
    a += 0.35 + rnd() * 0.25;
    cx = Math.min(0.8, Math.max(0.2, cx + (rnd() - 0.5) * 0.06));
    cy = Math.min(0.8, Math.max(0.2, cy + (rnd() - 0.5) * 0.06));
    const q: Nokta = [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    if (n.length) L += Math.hypot(q[0] - n[n.length - 1][0], q[1] - n[n.length - 1][1]);
    n.push(q);
  }
  return [n];
}

describe('Çiz Canlansın: puanlama', () => {
  it('şablonun kendisi tam puan alır (her resim, her mod)', () => {
    for (const r of RESIMLER)
      for (const mod of ['iz', 'nokta', 'kopya', 'hafiza'] as const) {
        const p = puanla(r, r.cizgiler.map((c) => c.n), mod, 5);
        expect(p.yildiz, `${r.id} ${mod}`).toBe(3);
        expect(p.eksik, `${r.id} ${mod}`).toEqual([]);
      }
  });

  it('3 yaşın titrek eli, yolu takip edince en az 2 yıldız alır ve resim canlanır', () => {
    for (const r of RESIMLER)
      for (const tohum of [1, 2, 3]) {
        const p = puanla(r, cocukCizer(r.id, { titreme: 0.03, kucukTitreme: 0.01, tohum }), 'iz', 3);
        expect(p.yildiz, `${r.id} #${tohum} puan ${p.puan.toFixed(2)}`).toBeGreaterThanOrEqual(2);
        expect(canlanirMi(p.yildiz)).toBe(true);
      }
  });

  it('5 yaş başka yere, başka büyüklükte bakarak çizince hizalanır ve yüksek puan alır', () => {
    for (const r of RESIMLER) {
      const p = puanla(r, cocukCizer(r.id, { titreme: 0.02, olcek: 0.6, yer: [0.12, -0.1], tohum: 4 }), 'kopya', 5);
      expect(p.yildiz, `${r.id} puan ${p.puan.toFixed(2)}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('hafızadan, biraz basık çizim yine canlanır ama oran puanı düşer', () => {
    for (const r of RESIMLER) {
      const duz = puanla(r, cocukCizer(r.id, { titreme: 0.02, olcek: 0.8, tohum: 5 }), 'hafiza', 6);
      const basik = puanla(r, cocukCizer(r.id, { titreme: 0.02, olcek: 0.8, enBoy: 1.5, tohum: 5 }), 'hafiza', 6);
      expect(duz.yildiz, `${r.id} ${duz.puan.toFixed(2)}`).toBeGreaterThanOrEqual(2);
      expect(basik.oran, r.id).toBeLessThan(duz.oran);
    }
  });

  it('özensiz ama doğru çizimler (parçalar kaymış, eğik, farklı boy) yine canlanır', () => {
    for (const r of RESIMLER)
      for (const tohum of [1, 2, 3]) {
        const k = puanla(r, ozensiz(r.id, tohum), 'kopya', 5);
        expect(k.yildiz, `${r.id} kopya #${tohum} ${k.puan.toFixed(2)}`).toBeGreaterThanOrEqual(2);
        const hz = puanla(r, ozensiz(r.id, tohum + 10, 0.8, [0, 0], 1.3), 'hafiza', 6);
        expect(hz.yildiz, `${r.id} hafiza #${tohum} ${hz.puan.toFixed(2)}`).toBeGreaterThanOrEqual(2);
      }
  }, 30_000);

  it('karalama asla 3 yıldız alamaz, neredeyse hiç canlanmaz', () => {
    let toplam = 0;
    let canlanan = 0;
    for (const r of RESIMLER)
      for (const mod of ['iz', 'kopya'] as const)
        for (const tohum of [11, 12, 13]) {
          const p = puanla(r, karalama(tohum), mod, 3);
          expect(p.yildiz, `${r.id} ${mod} puan ${p.puan.toFixed(2)}`).toBeLessThanOrEqual(2);
          toplam++;
          if (canlanirMi(p.yildiz)) canlanan++;
        }
    // yalnızca kelebek gibi baştan sona kıvrım olan resimlerde, üstüne kıvrım karalanırsa
    expect(canlanan / toplam).toBeLessThan(0.05);
  }, 30_000);

  it('eksik parçayı bulur: kuyruksuz balık, tekerleksiz araba, çatısız ev', () => {
    expect(puanla(resim('balik')!, cocukCizer('balik', { titreme: 0.02, atla: ['kuyruk'] }), 'iz', 4).eksik).toEqual(['kuyruk']);
    expect(puanla(resim('araba')!, cocukCizer('araba', { titreme: 0.02, atla: ['teker2'] }), 'kopya', 5).eksik).toEqual(['teker2']);
    expect(puanla(resim('ev')!, cocukCizer('ev', { titreme: 0.02, atla: ['cati'] }), 'iz', 3).eksik).toEqual(['cati']);
    // göz gibi küçük parçalar eksik sayılmaz
    expect(puanla(resim('balik')!, cocukCizer('balik', { titreme: 0.02, atla: ['goz'] }), 'iz', 4).eksik).toEqual([]);
  });

  it('başka bir şekil çizmek (eve daire) canlandırmaz', () => {
    const daire = resim('top')!.cizgiler.map((c) => c.n);
    for (const id of ['ev', 'yildiz', 'araba', 'balik', 'cicek']) {
      const p = puanla(resim(id)!, daire, 'kopya', 5);
      expect(p.yildiz, `${id} ${p.puan.toFixed(2)}`).toBeLessThanOrEqual(1);
    }
  });

  it('boş ya da minicik çizim 0 yıldız', () => {
    expect(puanla(resim('top')!, [], 'iz', 3).yildiz).toBe(0);
    expect(puanla(resim('top')!, [[[0.5, 0.5], [0.51, 0.5]]], 'iz', 3).yildiz).toBe(0);
  });

  it('çocuğun çizgisi parçalara bölünür (tek çizgiyle çizilen balıkta kuyruk ayrı oynar)', () => {
    const r = resim('balik')!;
    // gövde + kuyruk tek hamlede
    const tek = [[...ornekle(r.cizgiler[0].n, 0.01), ...ornekle(r.cizgiler[1].n, 0.01)]];
    const p = puanla(r, tek, 'iz', 4);
    const adlar = new Set(p.parcalar.map((x) => x.parca));
    expect(adlar.has('govde')).toBe(true);
    expect(adlar.has('kuyruk')).toBe(true);
  });

  it('nokta birleştirme: köşeler nokta olur, küçük göz tek nokta', () => {
    const ev = resim('ev')!;
    const cati = noktaDizisi(ev.cizgiler[1]);
    expect(cati.length).toBeGreaterThanOrEqual(3);
    expect(cati.length).toBeLessThanOrEqual(8);
    expect(noktaDizisi(resim('balik')!.cizgiler[2])).toHaveLength(1);
    for (const r of RESIMLER) for (const c of r.cizgiler) expect(noktaDizisi(c).length, r.id).toBeLessThanOrEqual(10);
  });

  it('hızlı: en zor resimde hizalamalı puanlama 150 ms altında', () => {
    const r = resim('kedi')!;
    const c = cocukCizer('kedi', { titreme: 0.02, olcek: 0.7, tohum: 9 });
    const t = performance.now();
    puanla(r, c, 'hafiza', 6);
    expect(performance.now() - t).toBeLessThan(150);
  });
});
