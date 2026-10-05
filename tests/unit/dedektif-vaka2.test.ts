/** Dedektif Mino · Vaka 2 "Kino'nun Kayıp Atkısı": mantık (dedektif/src/mantik2.ts), görseller, cümleler, kayıt */
import { describe, expect, it } from 'vitest';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import { Dosya, kameraHesap, Soru, dedektifCumleleri, dedektifKinoCumleleri, kartSirasi } from '../../dedektif/src/mantik';
import {
  ADIMLAR2,
  AYAK_BOYU,
  CALILAR,
  CATLAMA,
  halka2,
  halka2Adimi,
  HALKALAR2,
  IP,
  K2,
  KADRAJ2,
  KARTLAR2,
  M2,
  O2,
  G2,
  OLAYLAR,
  olaySirasi,
  RenkIzi,
  ROMAN2,
  SesSorusu,
  Siralama,
  uyum,
  YOL_PARCALARI,
  kirmizilar,
} from '../../dedektif/src/mantik2';
import { resim, VAKA2_RESIMLERI, YUVA } from '../../dedektif/src/resimler';
import { POZ_OLCU, POZLAR } from '../../dedektif/src/poz';
import { kayit, sifirla, vakaCozuldu } from '../../dedektif/src/kayit';
import { caliKirpimi } from '../../dedektif/src/dunya2';

const rnd = (t: number) => () => {
  t = (t * 1664525 + 1013904223) >>> 0;
  return t / 4294967296;
};

describe('Vaka 2: halkalar ve kartlar', () => {
  it('beş halka sırayla: ne oldu / kimin izi / hangi iz / ses / sıralama; final ve roman', () => {
    expect(HALKALAR2.map((h) => h.id)).toEqual(['ne', 'kim', 'renk', 'ses', 'sira']);
    expect(ADIMLAR2).toEqual(['giris', 'ne', 'kim', 'renk', 'ses', 'sira', 'final', 'roman']);
    expect(halka2Adimi('renk')).toBe('renk');
    expect(halka2Adimi('final')).toBeNull();
  });
  it('kartlı halkalarda 3 kart, doğrusu içinde; Kino hep yanlış bir kartı gösterir; yanlışlar kendini anlatır', () => {
    for (const id of ['ne', 'kim'] as const) {
      const h = halka2(id);
      expect(h.kartlar).toHaveLength(3);
      expect(h.kartlar).toContain(h.dogru);
      expect(h.kinoKart).not.toBe(h.dogru);
      expect(h.kartlar).toContain(h.kinoKart);
      for (const k of h.kartlar) if (k !== h.dogru) expect(KARTLAR2[k].tepki, k).toBeTruthy();
      expect(h.ipuclari.length).toBeGreaterThan(0);
    }
    expect(halka2('ne').dogru).toBe('ruzgar');
    expect(halka2('kim').dogru).toBe('ordek-izi');
    expect(halka2('ses').dogru).toBe('ordek');
    // Halka 2: ördek izi ve yanındaki kırmızı iplik (ikisi de bulunmalı)
    expect(halka2('kim').ipuclari.map((i) => i.id)).toEqual(['ordek-izi', 'iplik']);
  });
  it('kart sorusu motoru Vaka 2 kartlarıyla da çalışır (2 yanlıştan sonra doğru parlar, kilitlenmez)', () => {
    const s = new Soru(halka2('kim'));
    expect(s.sec('kopek-izi')).toEqual({ dogru: false, parla: false, yanlis: 1 });
    expect(s.sec('tavsan-izi').parla).toBe(true);
    expect(s.acik).toEqual(['ordek-izi']);
    expect(s.sec('ordek-izi').dogru).toBe(true);
    for (let t = 1; t < 30; t++) expect(kartSirasi(halka2('ne'), rnd(t))[1]).not.toBe('makas');
  });
  it('ayak boyu: ördek ayağı ize tam uyar, köpek patisi taşar, tavşan ayağı aşar; Kino\'nun patisi yüzer', () => {
    expect(uyum(AYAK_BOYU['ordek-izi'])).toBe('tam');
    expect(uyum(AYAK_BOYU['kopek-izi'])).toBe('tasar');
    expect(uyum(AYAK_BOYU['tavsan-izi'])).toBe('tasar');
    expect(AYAK_BOYU['tavsan-izi']).toBeGreaterThan(AYAK_BOYU['kopek-izi']);
    expect(uyum(0.45)).toBe('yuzer');
  });
});

describe('Vaka 2: yeni mekanikler', () => {
  it('renk izi: yalnız kırmızılar sayılır, notalar sırayla; mavi Ada\'yı gösterir; yaprak bir şey yapmaz; kilitlenmez', () => {
    const iz = new RenkIzi(YOL_PARCALARI);
    expect(iz.kirmiziSayisi).toBe(kirmizilar().length);
    expect(kirmizilar().length).toBeGreaterThanOrEqual(5);
    const mavi = YOL_PARCALARI.findIndex((p) => p.tur === 'mavi');
    const yaprak = YOL_PARCALARI.findIndex((p) => p.tur === 'yaprak');
    expect(iz.dokun(mavi)).toEqual({ tur: 'mavi', sira: -1, bitti: false });
    expect(iz.dokun(yaprak).tur).toBe('yaprak');
    expect(iz.alinan.size).toBe(0);
    // sıradaki: en soldaki alınmamış kırmızı
    const kirmiziIdx = YOL_PARCALARI.map((p, i) => [p, i] as const).filter(([p]) => p.tur === 'kirmizi');
    const enSol = kirmiziIdx.reduce((a, b) => (b[0].x < a[0].x ? b : a))[1];
    expect(iz.siradaki).toBe(enSol);
    let son = { tur: 'kirmizi', sira: -1, bitti: false } as ReturnType<RenkIzi['dokun']>;
    for (const [, i] of kirmiziIdx) son = iz.dokun(i);
    expect(son.bitti).toBe(true);
    expect(son.sira).toBe(kirmiziIdx.length - 1);
    expect(iz.siradaki).toBeNull();
    // aynı kırmızıya iki kez dokunmak sayılmaz
    const iz2 = new RenkIzi(YOL_PARCALARI);
    iz2.dokun(kirmiziIdx[0][1]);
    iz2.dokun(kirmiziIdx[0][1]);
    expect(iz2.alinan.size).toBe(1);
  });
  it('kırmızı ve mavi parçalar üst üste binmez (dokunma alanları ayrı), yol üstünde', () => {
    for (const [i, a] of YOL_PARCALARI.entries())
      for (const b of YOL_PARCALARI.slice(i + 1)) {
        const dx = Math.abs(a.x - b.x) * (4096 / 2286);
        const dy = Math.abs(a.y - b.y);
        expect(dx > 0.06 || dy > 0.045, `${a.tur}@${a.x} ↔ ${b.tur}@${b.x}`).toBe(true);
      }
    for (const p of YOL_PARCALARI) expect(p.y).toBeGreaterThan(0.7);
  });
  it('ses ipucu: üç çalı dinlenir; ördek kartı ördeğin çalısına; kurbağa / arı kendi çalısına uçar; 2 yanlışta doğru çalı yüksek çalar', () => {
    const s = new SesSorusu(CALILAR);
    expect(CALILAR.map((c) => c.ses)).toEqual(['kurbaga', 'ari', 'ordek']);
    expect(s.hepsiDinlendi).toBe(false);
    expect(s.siradaki).toBe(0);
    s.dinle(0);
    s.dinle(2);
    expect(s.siradaki).toBe(1);
    s.dinle(1);
    expect(s.hepsiDinlendi).toBe(true);
    expect(s.birak('kurbaga', 2)).toEqual({ dogru: false, kendiCalisi: 0, yanlis: 1, parla: false });
    expect(s.birak('ordek', 1)).toEqual({ dogru: false, kendiCalisi: null, yanlis: 2, parla: true });
    expect(s.birak('ordek', 2).dogru).toBe(true);
    expect(s.cozuldu).toBe(true);
  });
  it('sıralama: her kareye yalnız kendi olayı oturur; yanlış seker; dokununca ilk boş kare denenir; ekranda hiçbir kart kendi karesinin altında değil', () => {
    const s = new Siralama();
    expect(s.siradaki).toBe(0);
    expect(s.koy(2, 0)).toEqual({ dogru: false, bitti: false });
    expect(s.yanlis).toBe(1);
    expect(s.koy(2, 2).dogru).toBe(true);
    expect(s.koy(0, 0).dogru).toBe(true);
    expect(s.siradaki).toBe(1);
    expect(s.koy(1, 1)).toEqual({ dogru: true, bitti: true });
    // dolu kareye ikinci kart oturmaz
    expect(s.koy(0, 0).dogru).toBe(false);
    for (let t = 1; t < 20; t++) {
      const d = olaySirasi(rnd(t));
      expect([...d].sort()).toEqual([0, 1, 2]);
      d.forEach((olay, yer) => expect(olay).not.toBe(yer));
    }
    expect(OLAYLAR.map((o) => o.resim)).toEqual(ROMAN2.slice(0, 3).map((r) => r.resim));
  });
  it('final: üç dokunuşta çatlar; roman 4 kare (çocuğun dizdiği 3 + kuluçka)', () => {
    expect(CATLAMA).toBe(3);
    expect(ROMAN2.map((r) => r.sira)).toEqual([1, 2, 3, 4]);
  });
  it('dosya: beş göz; test kısayolu öncekileri çözülmüş sayar', () => {
    const d = Dosya.adimdan('ses', ADIMLAR2, HALKALAR2);
    expect(d.gozler.map((g) => g.demek)).toEqual([true, true, true, false, false]);
    expect(d.ipuclariTamam('kim')).toBe(true);
    expect(Dosya.adimdan('final', ADIMLAR2, HALKALAR2).tamam).toBe(true);
  });
  it('çalı kırpımı: kapalı çokgen, kutunun içinde; yarımlar ortadan ayrılır', () => {
    for (const y of [undefined, 'sol', 'sag'] as const) {
      const n = caliKirpimi(y)
        .split(', ')
        .map((p) => p.split(' ').map((v) => parseFloat(v)));
      expect(n.length).toBeGreaterThan(10);
      for (const [x, yy] of n) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(100);
        expect(yy).toBeGreaterThanOrEqual(0);
        expect(yy).toBeLessThanOrEqual(100);
      }
      if (y === 'sol') expect(Math.max(...n.map(([x]) => x))).toBeLessThan(56);
      if (y === 'sag') expect(Math.min(...n.map(([x]) => x))).toBeGreaterThan(44);
    }
  });
});

describe('Vaka 2: kamera, görseller, cümleler', () => {
  it('bahçe (16:9) her kadrajda ekranı tamamen kaplar (4 ekran boyu)', () => {
    const dunya = { w: 1000 * (4096 / 2286), h: 1000 };
    for (const e of [
      { w: 844, h: 390 },
      { w: 932, h: 430 },
      { w: 390, h: 844 },
      { w: 1024, h: 768 },
    ])
      for (const kd of [...Object.values(KADRAJ2), ...HALKALAR2.map((h) => h.kadraj)]) {
        const k = kameraHesap(kd, dunya, e, undefined, 1, e.w < e.h ? 1.5 : 1);
        expect(k.tx).toBeLessThanOrEqual(0.001);
        expect(k.ty).toBeLessThanOrEqual(0.001);
        expect(k.tx + dunya.w * k.s).toBeGreaterThanOrEqual(e.w - 0.001);
        expect(k.ty + dunya.h * k.s).toBeGreaterThanOrEqual(e.h - 0.001);
      }
  });
  it('kullanılan her çizim assets/dedektif2 içinde var', () => {
    const adlar = [
      ...Object.values(KARTLAR2).map((k) => k.resim),
      ...HALKALAR2.flatMap((h) => [h.demekResim, ...h.ipuclari.map((t) => t.foto ?? t.resim)]),
      ...ROMAN2.map((r) => r.resim),
      'v2/bahce-ip',
      'v2/bahce-yol',
      'v2/bahce-golet',
      'v2/mandal',
      'v2/atki-asili',
      'v2/atki-yerde',
      'v2/yuva-yumurta',
      'v2/yavru-atki',
      'v2/yaprak',
      'v2/ip-mavi',
      'v2/iplik-kirmizi',
    ];
    for (const a of adlar) {
      expect(VAKA2_RESIMLERI, a).toContain(a.replace(/^v2\//, ''));
      expect(resim(a), a).toBeTruthy();
    }
    expect(resim('balon')).toBeTruthy();
    // Vaka 1'in roman kareleri Vaka 2'ninkilerle karışmaz
    expect(resim('roman-1')).not.toBe(resim('v2/roman-1'));
    expect(IP.mandallar).toHaveLength(2);
  });
  it('Vaka 2 pozları: yuvası, resmi, boyu (çizim %10dan fazla esnemez)', () => {
    for (const p of ['kino-uzgun', 'kino-sarilma', 'ordek-kulucka', 'ordek-atki'] as const) {
      expect(POZLAR).toContain(p);
      expect(YUVA[`poz-${p}`], p).toBeTruthy();
      expect(resim(`poz-${p}`), p).toBeTruthy();
      expect(POZ_OLCU[p].boy).toBeGreaterThan(0.6);
    }
  });
  it('bütün Vaka 2 cümleleri seslendirme listesinde (CI seslendirir), kısa; Kino\'nunkiler kendi sesiyle de', () => {
    const hepsi = new Set(tumCumleler());
    const anlatici = [...Object.values(M2), ...Object.values(O2), ...Object.values(G2)];
    for (const c of anlatici) {
      expect(hepsi.has(normal(c)), c).toBe(true);
      expect(dedektifCumleleri()).toContain(c);
      expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(8);
    }
    const kino = new Set(karakterCumleleri().kino);
    for (const c of Object.values(K2)) {
      expect(dedektifKinoCumleleri()).toContain(c);
      expect(kino.has(normal(c)), c).toBe(true);
      expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(8);
    }
  });
  it('kayıt: Vaka 2 dosyaya ikinci vaka olarak girer', () => {
    sifirla();
    vakaCozuldu('vaka1');
    vakaCozuldu('vaka2');
    expect(kayit.cozulen).toEqual(['vaka1', 'vaka2']);
    sifirla();
  });
});
