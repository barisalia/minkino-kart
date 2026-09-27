import { describe, expect, it } from 'vitest';
import {
  AGIZ_SEKILLERI,
  agizKatmaniSec,
  diziSekli,
  diziSuresi,
  DUDAK,
  DudakIzleyici,
  hamSekil,
  metinRitmi,
  olcumHesapla,
  ritimSekli,
  sekilDizisi,
  zarfCikar,
  type AgizSekli,
  type Olcum,
} from '../../src/audio/dudak-mantik';

const HZ = 48000;
/** f Hz, genlik a, sure ms'lik sinüs */
const sinus = (f: number, a: number, ms: number) => Float32Array.from({ length: Math.round((HZ * ms) / 1000) }, (_, i) => a * Math.sin((2 * Math.PI * f * i) / HZ));
const sessizlik = (ms: number) => new Float32Array(Math.round((HZ * ms) / 1000));
const birlestir = (...p: Float32Array[]) => {
  const c = new Float32Array(p.reduce((t, x) => t + x.length, 0));
  let o = 0;
  for (const x of p) (c.set(x, o), (o += x.length));
  return c;
};
/** Şeklin değiştiği yerler: [ms, şekil] */
const gecisler = (d: AgizSekli[], adim = 10) => d.flatMap((s, i) => (i === 0 || s !== d[i - 1] ? [[i * adim, s] as const] : []));

describe('dudak senkronu: ölçüm', () => {
  it('sinüsün RMS’i ve etkin frekansı (parlaklık) doğru ölçülür', () => {
    for (const f of [300, 1000, 5000]) {
      const o = olcumHesapla(sinus(f, 0.5, 50), HZ);
      expect(o.rms).toBeCloseTo(0.5 / Math.SQRT2, 2);
      expect(o.frekans).toBeGreaterThan(f * 0.95);
      expect(o.frekans).toBeLessThan(f * 1.05);
    }
    expect(olcumHesapla(sessizlik(20), HZ)).toEqual({ rms: 0, frekans: 0 });
  });

  it('zarf: 10 ms adımla, sesin başladığı yer belli', () => {
    const z = zarfCikar(birlestir(sessizlik(200), sinus(800, 0.4, 300)), HZ, 10);
    expect(z.length).toBe(50);
    expect(z[5].rms).toBe(0);
    expect(z[30].rms).toBeGreaterThan(0.25);
  });
});

describe('dudak senkronu: şekil seçimi (eşikler)', () => {
  const tepe = 0.4;
  it('sessizlik kapalı: mutlak eşik ve tepeye göre', () => {
    expect(hamSekil(DUDAK.sessiz * 0.9, 800, tepe)).toBe('kapali');
    expect(hamSekil(tepe * DUDAK.goreceSessiz * 0.9, 800, tepe)).toBe('kapali');
  });
  it('yükseklik: kısık az, güçlü orta', () => {
    expect(hamSekil(tepe * 0.3, 900, tepe)).toBe('az');
    expect(hamSekil(tepe * 0.8, 900, tepe)).toBe('orta');
  });
  it('parlaklık: s / i dişler, o / u yuvarlak (kısık uğultu az kalır)', () => {
    expect(hamSekil(tepe * 0.3, 6000, tepe)).toBe('dis');
    expect(hamSekil(tepe * 0.8, 2000, tepe)).toBe('dis');
    expect(hamSekil(tepe * 0.8, 350, tepe)).toBe('yuvarlak');
    expect(hamSekil(tepe * 0.2, 350, tepe)).toBe('az');
  });
});

describe('dudak senkronu: izleyici (en kısa süre, sessizlik)', () => {
  it('bir şekil en az 70 ms kalır: her 40 ms değişen ses (a / u) titretmez', () => {
    const iz = new DudakIzleyici();
    const cikti: AgizSekli[] = [];
    for (let ms = 0; ms < 2000; ms += 10) {
      const a = Math.floor(ms / 40) % 2 === 0;
      const o: Olcum = a ? { rms: 0.4, frekans: 1000 } : { rms: 0.4, frekans: 250 };
      cikti.push(iz.adim(o, ms));
    }
    const g = gecisler(cikti);
    expect(g.length).toBeGreaterThan(3);
    for (let i = 1; i < g.length; i++) expect(g[i][0] - g[i - 1][0]).toBeGreaterThanOrEqual(DUDAK.enAzMs);
  });

  it('dinlenirken gülümser; konuşunca açılır; kısa boşlukta kapanır; uzun sessizlikte gülümsemeye döner', () => {
    const iz = new DudakIzleyici();
    expect(iz.adim(null, 0)).toBe('gulumse');
    expect(iz.adim(null, 500)).toBe('gulumse');
    let s: AgizSekli = 'gulumse';
    for (let ms = 510; ms <= 800; ms += 10) s = iz.adim({ rms: 0.4, frekans: 900 }, ms);
    expect(s).toBe('orta');
    // 120 ms boşluk: kapanır (gülümsemeye dönmez)
    const bosluk: AgizSekli[] = [];
    for (let ms = 810; ms <= 930; ms += 10) bosluk.push(iz.adim({ rms: 0, frekans: 0 }, ms));
    expect(bosluk.at(-1)).toBe('kapali');
    expect(bosluk).not.toContain('gulumse');
    // uzun sessizlik: kapalı, sonra gülümseme
    for (let ms = 940; ms <= 1500; ms += 10) s = iz.adim(null, ms);
    expect(s).toBe('gulumse');
  });

  it('dosya zarfından dizi: sessiz → a (orta) → u (yuvarlak) → s (dis) → sessiz (gülümseme)', () => {
    const ses = birlestir(sessizlik(300), sinus(1000, 0.45, 300), sinus(300, 0.45, 300), sinus(6000, 0.2, 200), sessizlik(600));
    const d = sekilDizisi(zarfCikar(ses, HZ, 10), 10);
    const at = (ms: number) => d[Math.round(ms / 10)];
    expect(at(100)).toBe('gulumse');
    expect(at(500)).toBe('orta');
    expect(at(800)).toBe('yuvarlak');
    expect(at(1020)).toBe('dis');
    expect(d.at(-1)).toBe('gulumse');
    for (const [, s] of gecisler(d)) expect(AGIZ_SEKILLERI).toContain(s);
    const g = gecisler(d);
    for (let i = 1; i < g.length; i++) expect(g[i][0] - g[i - 1][0]).toBeGreaterThanOrEqual(DUDAK.enAzMs);
  });

  it('kısık ve yüksek kayıt aynı açılır (yükseklik konuşmanın tepesine göre)', () => {
    for (const a of [0.15, 0.9]) {
      const d = sekilDizisi(zarfCikar(birlestir(sessizlik(100), sinus(900, a, 3000)), HZ, 10), 10);
      expect(d.at(-1)).toBe('orta');
    }
  });

  it('hazır dizi: çalma hızıyla zamana göre şekil, bitince null', () => {
    const dizi = { sekiller: ['az', 'orta', 'orta', 'kapali'] as AgizSekli[], adimMs: 100, hiz: 2 };
    expect(diziSuresi(dizi)).toBeCloseTo(0.2);
    expect(diziSekli(dizi, 0)).toBe('az');
    expect(diziSekli(dizi, 60)).toBe('orta');
    expect(diziSekli(dizi, 160)).toBe('kapali');
    expect(diziSekli(dizi, 200)).toBeNull();
  });
});

describe('dudak senkronu: cihaz sesi ritmi', () => {
  it('ünlülere göre şekil, aralarda kapanış; her parça en az 70 ms', () => {
    const r = metinRitmi('Kocaman karpuz!');
    const sekiller = new Set(r.map((p) => p[0]));
    expect(sekiller).toContain('yuvarlak');
    expect(sekiller).toContain('orta');
    expect(sekiller).toContain('kapali');
    for (const [, ms] of r) expect(ms).toBeGreaterThanOrEqual(DUDAK.enAzMs - 10);
    expect(r.filter((p) => p[0] !== 'kapali').length).toBe(5); // ko-ca-man kar-puz
  });
  it('zamana göre ilerler ve baştan döner; metin yoksa da oynar', () => {
    expect(ritimSekli('Hav!', 10)).toBe('orta');
    expect(ritimSekli('Hav!', 150)).toBe('kapali');
    const top = metinRitmi('Hav!').reduce((t, p) => t + p[1], 0);
    expect(ritimSekli('Hav!', top + 10)).toBe('orta');
    expect(new Set(metinRitmi('').map((p) => p[0])).size).toBeGreaterThan(2);
  });
});

describe('dudak senkronu: iskelet katmanı', () => {
  const bugunKino = new Set(['agiz', 'agiz-acik', 'agiz-kapali', 'dil']);
  const adobe = new Set([...bugunKino, ...AGIZ_SEKILLERI.map((s) => `agiz-${s}`)]);
  it('Adobe katmanları varsa doğrudan onlar', () => {
    for (const s of AGIZ_SEKILLERI) expect(agizKatmaniSec(s, (id) => adobe.has(id))).toEqual({ id: `agiz-${s}`, sx: 1, sy: 1 });
  });
  it('bugün: açık ağız ölçeklenir, kapalı ağız katmanı, gülümsemede kendi ağzı', () => {
    const sec = (s: AgizSekli) => agizKatmaniSec(s, (id) => bugunKino.has(id));
    expect(sec('kapali')?.id).toBe('agiz-kapali');
    expect(sec('gulumse')).toBeNull();
    for (const s of ['az', 'orta', 'yuvarlak', 'dis'] as const) expect(sec(s)?.id).toBe('agiz-acik');
    expect(sec('orta')!.sy).toBeGreaterThan(sec('az')!.sy);
    expect(sec('dis')!.sx).toBeGreaterThan(sec('yuvarlak')!.sx);
  });
  it('açık ağzı olmayan iskelette katman yok (kendi ağzı / gaga kalır)', () => {
    for (const s of AGIZ_SEKILLERI) expect(agizKatmaniSec(s, (id) => id === 'agiz')).toBeNull();
  });
});
