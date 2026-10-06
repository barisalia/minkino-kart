import { beforeEach, describe, expect, it, vi } from 'vitest';

// Film dosya müziği (film/src/muzik.ts): sessize alma, duraklatma ve geç yüklenen dosya.
// Web Audio yok: küçük sahte bağlam; ses motoru ve ayarlar sahte modüllerle verilir.

class Param {
  value = 1;
  hedef = 1;
  setTargetAtTime(v: number) {
    this.hedef = v;
  }
  setValueAtTime(v: number) {
    this.value = v;
  }
  linearRampToValueAtTime(v: number) {
    this.hedef = v;
  }
  exponentialRampToValueAtTime(v: number) {
    this.hedef = v;
  }
  cancelScheduledValues() {}
}
class Dugum {
  gain = new Param();
  connect<T>(n: T) {
    return n;
  }
  disconnect() {}
}
class Kaynak extends Dugum {
  buffer: unknown = null;
  loop = false;
  basla: { t: number; ofs: number } | null = null;
  durdu: number | null = null;
  onended: (() => void) | null = null;
  start(t: number, ofs = 0) {
    this.basla = { t, ofs };
  }
  stop(t: number) {
    this.durdu = t;
  }
}
class Baglam {
  currentTime = 0;
  state = 'running';
  kaynaklar: Kaynak[] = [];
  suspend = vi.fn(async () => {
    this.state = 'suspended';
  });
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  createGain() {
    return new Dugum();
  }
  createBufferSource() {
    const k = new Kaynak();
    this.kaynaklar.push(k);
    return k;
  }
  decodeAudioData = async () => ({ duration: 10 });
  // sentez müziği (devamda zamanlayıcı ilk notaları kurar)
  sampleRate = 8000;
  createBuffer(_k: number, n: number) {
    return { getChannelData: () => new Float32Array(n) };
  }
  createBiquadFilter() {
    return Object.assign(new Dugum(), { type: '', frequency: new Param() });
  }
  createOscillator() {
    return Object.assign(new Kaynak(), { type: '', frequency: new Param() });
  }
}

const ortam = vi.hoisted(() => ({
  c: null as unknown,
  ana: null as unknown,
  ayarlar: { muzik: true, efekt: true, konusma: true },
}));
vi.mock('../../src/audio/motor', () => ({ baglam: () => ortam.c, muzikCikisi: () => ortam.ana }));
vi.mock('../../src/audio/muzik', () => ({ muzikDurdur: () => undefined }));
vi.mock('../../src/engine/ilerleme', () => ({ durum: { i: { ayarlar: ortam.ayarlar } } }));

/** İndirmeler elle bitirilir (yavaş bağlantı) */
let indirmeler: (() => void)[] = [];
const indir = async () => {
  const bekleyen = indirmeler;
  indirmeler = [];
  bekleyen.forEach((f) => f());
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

interface Ic {
  dosyalar: unknown[];
}
let c: Baglam;
let ana: Dugum;
let fm: typeof import('../../film/src/muzik');

beforeEach(async () => {
  vi.resetModules();
  c = new Baglam();
  ana = new Dugum();
  ortam.c = c;
  ortam.ana = ana;
  ortam.ayarlar.muzik = true;
  indirmeler = [];
  vi.stubGlobal('window', { setInterval: () => 1 });
  vi.stubGlobal('fetch', () => new Promise((r) => indirmeler.push(() => r({ arrayBuffer: async () => new ArrayBuffer(8) }))));
  fm = await import('../../film/src/muzik');
  // ilk içe aktarma (müzik dosyası listesi) yoğun test koşusunda yavaş olabilir
}, 60_000);

/** Dosya müziği kaynakları (sentez notaları sayılmaz) */
const dk = () => c.kaynaklar.filter((k) => (k.buffer as { duration?: number } | null)?.duration === 10);

/** Önceden çözülmüş tampon (hemen çalar) */
const hazirla = async (ad: string) => {
  const p = fm.dosyaTamponu(c as unknown as BaseAudioContext, ad);
  await indir();
  await p;
};

describe('film müziği: sessize alma (#18)', () => {
  it('müzik kapalıyken jenerik müzik kanalını açmaz', async () => {
    ortam.ayarlar.muzik = false;
    ana.gain.hedef = 0;
    await hazirla('film-acilis');
    fm.filmMuzik.dosyaCal({ ad: 'film-acilis' });
    expect(ana.gain.hedef).toBe(0);
  });
  it('müzik açıkken kanal tam açılır', async () => {
    ana.gain.hedef = 0.3;
    await hazirla('film-acilis');
    fm.filmMuzik.dosyaCal({ ad: 'film-acilis' });
    expect(ana.gain.hedef).toBe(1);
  });
});

describe('film müziği: duraklatma (#19)', () => {
  it('bağlam askıya alınmaz; dosya durur, devamda kaldığı yerden başlar', async () => {
    await hazirla('lutfen-sozlu');
    fm.filmMuzik.dosyaCal({ ad: 'lutfen-sozlu', ses: 0.7, gec: 0.2 });
    const ilk = dk()[0];
    expect(ilk.basla).toEqual({ t: 0.03, ofs: 0 });
    c.currentTime = 3.03;
    fm.filmMuzik.duraklat(true);
    expect(c.suspend).not.toHaveBeenCalled();
    expect(ilk.durdu).not.toBeNull();
    expect((fm.filmMuzik as unknown as Ic).dosyalar).toHaveLength(0);
    // dokunuş / arka plandan dönüş bağlamı sürdürür: duran film müziği yine çalmaz
    await c.resume();
    expect(dk()).toHaveLength(1);
    c.currentTime = 20;
    fm.filmMuzik.duraklat(false);
    expect(dk()).toHaveLength(2);
    expect(dk()[1].basla!.ofs).toBeCloseTo(3, 5);
    expect(c.resume).toHaveBeenCalledTimes(1);
  });
  it('arka plandayken (bağlam askıda) duraklatma hemen keser; ikinci duraklatma konumu silmez', async () => {
    await hazirla('film-merak');
    fm.filmMuzik.dosyaCal({ ad: 'film-merak', dongu: true });
    c.currentTime = 12.03;
    c.state = 'suspended';
    fm.filmMuzik.duraklat(true);
    expect(dk()[0].durdu).toBe(12.03);
    fm.filmMuzik.duraklat(true);
    c.state = 'running';
    fm.filmMuzik.duraklat(false);
    // döngülü parça: 12 sn → 10 sn'lik tamponda 2. saniye
    expect(dk()[1].basla!.ofs).toBeCloseTo(2, 5);
    expect(dk()[1].loop).toBe(true);
  });
  it('duraklatılmışken çıkılırsa (dur) devam ettirilecek müzik kalmaz', async () => {
    await hazirla('film-merak');
    fm.filmMuzik.dosyaCal({ ad: 'film-merak' });
    fm.filmMuzik.duraklat(true);
    fm.filmMuzik.dur(0.5);
    fm.filmMuzik.duraklat(false);
    expect(dk()).toHaveLength(1);
  });
});

describe('film müziği: geç yüklenen dosya (#20)', () => {
  it('yüklenirken söndürülen jenerik sonradan çalmaz', async () => {
    fm.filmMuzik.dosyaCal({ ad: 'film-acilis' });
    fm.filmMuzik.dosyaSon(0.5);
    await indir();
    expect(dk()).toHaveLength(0);
  });
  it('ekrandan çıkınca (dur) yüklenen müzik çalmaz', async () => {
    fm.filmMuzik.dosyaCal({ ad: 'film-acilis' });
    fm.filmMuzik.dur(0.5);
    await indir();
    expect(dk()).toHaveLength(0);
  });
  it('çapraz geçiş: yüklenmesi süren önceki parça yenisinin üstüne binmez', async () => {
    fm.filmMuzik.dosyaCal({ ad: 'film-fon-pazar', dongu: true });
    fm.filmMuzik.dosyaCal({ ad: 'film-kovalamaca' });
    await indir();
    expect(dk()).toHaveLength(1);
  });
  it('üstüne çalan parça öncekini iptal etmez', async () => {
    fm.filmMuzik.dosyaCal({ ad: 'film-fon-pazar', dongu: true });
    fm.filmMuzik.dosyaCal({ ad: 'film-surpriz', ustune: true });
    await indir();
    expect(dk()).toHaveLength(2);
  });
  it('film duraklatılmışken inen parça devamda baştan başlar', async () => {
    fm.filmMuzik.dosyaCal({ ad: 'film-merak' });
    fm.filmMuzik.duraklat(true);
    await indir();
    expect(dk()).toHaveLength(0);
    fm.filmMuzik.duraklat(false);
    expect(dk()).toHaveLength(1);
    expect(dk()[0].basla!.ofs).toBe(0);
  });
});
