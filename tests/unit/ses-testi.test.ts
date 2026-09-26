import { describe, expect, it } from 'vitest';
import {
  AlkisSayaci, egri, hayvanSesi, hecele, OrtamOlcer, ozellikCikar, perdeBul, PerdeIzci, ritimKalibi, SesSekli, SessizlikSayaci, UflemeBulucu,
  type Ayar, type Ozellik, type SesParcasi,
} from '../../ses-testi/src/analiz';

const SR = 48000;
const KARE = 1024;

function rastgele(tohum: number) {
  let s = tohum >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
}

/** Sinyal parçaları */
const sessizlik = (sn: number, tohum = 1) => {
  const r = rastgele(tohum);
  return Float32Array.from({ length: Math.round(sn * SR) }, () => r() * 0.0005);
};
/** Ses benzeri ton (harmonikli); f bir fonksiyon olabilir (kayan perde) */
function ton(sn: number, f: number | ((t: number) => number), genlik = 0.2) {
  const n = Math.round(sn * SR);
  const out = new Float32Array(n);
  let faz = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fr = typeof f === 'number' ? f : f(t / sn);
    faz += (2 * Math.PI * fr) / SR;
    const zarf = Math.min(1, i / 480, (n - i) / 480);
    out[i] = zarf * genlik * (Math.sin(faz) + 0.5 * Math.sin(2 * faz) + 0.3 * Math.sin(3 * faz));
  }
  return out;
}
/** Üfleme: kalın ağırlıklı gürültü */
function ufleme(sn: number, genlik = 0.25, tohum = 7) {
  const r = rastgele(tohum);
  const n = Math.round(sn * SR);
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) {
    y = y * 0.97 + r() * 0.3;
    const zarf = Math.min(1, i / 2400, (n - i) / 2400);
    out[i] = zarf * genlik * y;
  }
  return out;
}
/** Ünlü ("aaa"): zengin harmonik dizisi, formantlar ~700 ve ~1200 Hz; oda gürültüsü eklenebilir */
function unlu(sn: number, f = 150, genlik = 0.2, gurultu = 0) {
  const n = Math.round(sn * SR);
  const out = new Float32Array(n);
  const r = rastgele(11);
  for (let k = 1; k * f < 5000; k++) {
    const fr = k * f;
    const a = Math.exp(-((fr - 700) ** 2) / (2 * 200 ** 2)) + 0.6 * Math.exp(-((fr - 1200) ** 2) / (2 * 250 ** 2)) + 0.3 / k;
    for (let i = 0; i < n; i++) out[i] += genlik * a * Math.sin((2 * Math.PI * fr * i) / SR + k);
  }
  if (gurultu) for (let i = 0; i < n; i++) out[i] += r() * gurultu;
  return out;
}
/** Oyun müziği gibi: değişen notalar + bas (sinüs/üçgen karışımı) */
function muzik(sn: number, genlik = 0.15) {
  const n = Math.round(sn * SR);
  const notalar = [262, 330, 392, 523];
  return Float32Array.from({ length: n }, (_, i) => {
    const t = i / SR;
    const nt = notalar[Math.floor(t * 4) % 4];
    return genlik * (Math.sin(2 * Math.PI * nt * t) + 0.4 * Math.sin(2 * Math.PI * 131 * t) + 0.2 * Math.sin(4 * Math.PI * nt * t));
  });
}
/** İki sinyali üst üste koyar */
const karistir = (a: Float32Array, b: Float32Array) => a.map((v, i) => v + (b[i] ?? 0));
/** Alkış: çok kısa, hızla sönen gürültü patlaması */
function alkis(tohum = 3) {
  const r = rastgele(tohum);
  const n = Math.round(0.06 * SR);
  return Float32Array.from({ length: n }, (_, i) => r() * 0.7 * Math.exp(-i / (0.012 * SR)));
}
function birlestir(...p: Float32Array[]) {
  const n = p.reduce((a, b) => a + b.length, 0);
  const out = new Float32Array(n);
  let k = 0;
  for (const x of p) {
    out.set(x, k);
    k += x.length;
  }
  return out;
}
/** Sinyali kare kare işler (son 2048 örnek penceresiyle) */
function isle(sinyal: Float32Array, fn: (o: Ozellik, t: number) => void) {
  const tampon = new Float32Array(2048);
  for (let i = 0; i + KARE <= sinyal.length; i += KARE) {
    tampon.copyWithin(0, KARE);
    tampon.set(sinyal.subarray(i, i + KARE), 2048 - KARE);
    fn(ozellikCikar(tampon, SR), i / SR);
  }
}
function ayarla(sinyal: Float32Array): Ayar {
  const o = new OrtamOlcer();
  isle(sinyal, (x) => o.ekle(x));
  return { taban: o.taban, duyarlilik: 0, kare: KARE / SR };
}

describe('Uyuyan Orman: ses analizi', () => {
  it('perde bulma: 110, 220, 300, 520 Hz (%2 içinde)', () => {
    for (const f of [110, 220, 300, 520]) {
      const [p, g] = perdeBul(ton(0.05, f).subarray(0, 2048), SR);
      expect(p, `${f}`).not.toBeNull();
      expect(Math.abs(p! - f) / f, `${f} → ${p}`).toBeLessThan(0.02);
      expect(g).toBeGreaterThan(0.6);
    }
  });

  it('gürültüde perde yok', () => {
    expect(perdeBul(ufleme(0.05).subarray(0, 2048), SR)[0]).toBeNull();
  });

  it('ortam sesi ölçülür', () => {
    const a = ayarla(sessizlik(1));
    expect(a.taban).toBeLessThan(-60);
  });

  it('üfleme algılanır, süresi ölçülür; konuşma üfleme sayılmaz', () => {
    const a = ayarla(sessizlik(1));
    const u = new UflemeBulucu(a);
    const sureler: number[] = [];
    isle(birlestir(sessizlik(0.5), ufleme(1.5), sessizlik(0.6), ton(1, 250), sessizlik(0.6)), (o) => {
      const s = u.kare(o);
      if (s.bitti) sureler.push(s.bitti);
    });
    expect(sureler).toHaveLength(1);
    expect(sureler[0]).toBeGreaterThan(1.2);
    expect(sureler[0]).toBeLessThan(1.7);
  });

  describe('kolay üfleme (Sesli Maceralar): yüksek ses tek başına yetmez', () => {
    /** Sinyal boyunca üfleme sayılan toplam süre (sn) */
    const uflemeSuresi = (sinyal: Float32Array) => {
      const a = ayarla(sessizlik(1));
      const u = new UflemeBulucu(a, true);
      let toplam = 0;
      isle(birlestir(sessizlik(0.3), sinyal, sessizlik(0.5)), (o) => {
        const r = u.kare(o);
        if (r.bitti) toplam += r.bitti;
      });
      return toplam;
    };

    it('(a) konuşma / ünlü (perdeli, harmonik) üfleme sayılmaz, yüksek sesle de', () => {
      expect(uflemeSuresi(unlu(1.5, 150, 0.2))).toBe(0);
      expect(uflemeSuresi(unlu(1.5, 250, 0.3))).toBe(0);
      expect(uflemeSuresi(unlu(1.5, 150, 0.2, 0.05)), 'oda gürültüsüyle').toBe(0);
      expect(uflemeSuresi(ton(1.5, 120, 0.3)), 'kalın ses').toBe(0);
      expect(uflemeSuresi(karistir(ton(1.5, 120, 0.2), ufleme(1.5, 0.05))), 'nefesli konuşma').toBe(0);
    });

    it('(b) müzik (oyunun kendi müziği, TV) üfleme sayılmaz', () => {
      expect(uflemeSuresi(muzik(2))).toBe(0);
      expect(uflemeSuresi(muzik(2, 0.3))).toBe(0);
      expect(uflemeSuresi(karistir(muzik(2), ufleme(2, 0.05))), 'müzik + hafif gürültü').toBe(0);
    });

    it('(c) gürültü benzeri üfleme ve sesli "fuuu" sayılır', () => {
      expect(uflemeSuresi(ufleme(1.5))).toBeGreaterThan(1.2);
      expect(uflemeSuresi(ufleme(1.5, 0.08)), 'hafif üfleme').toBeGreaterThan(1.2);
      expect(uflemeSuresi(karistir(ufleme(1.5, 0.25), ton(1.5, 200, 0.15))), '"fuuu" (zayıf perde)').toBeGreaterThan(1.2);
      expect(uflemeSuresi(karistir(ufleme(1.5, 0.25), ton(1.5, 200, 0.25))), '"fuuu" (perde yer yer bulunur)').toBeGreaterThan(0.8);
    });
  });

  it('ince / kalın: çocuğun kendi sesine göre', () => {
    const a = ayarla(sessizlik(1));
    const p = new PerdeIzci(a);
    isle(ton(1, 280), (o) => p.referansEkle(o));
    expect(p.referansBitir()).toBeGreaterThan(270);
    const siniflar: string[] = [];
    isle(birlestir(ton(0.6, 450), sessizlik(0.3), ton(0.6, 180)), (o) => {
      const s = p.kare(o);
      if (s.sinif) siniflar.push(s.sinif);
    });
    expect(siniflar.filter((s) => s === 'ince').length).toBeGreaterThan(10);
    expect(siniflar.filter((s) => s === 'kalin').length).toBeGreaterThan(10);
  });

  it('alkış sayma: 3 alkış = 3; konuşma alkış sayılmaz', () => {
    const a = ayarla(sessizlik(1));
    const s = new AlkisSayaci(a);
    const seriler: number[][] = [];
    isle(birlestir(sessizlik(0.4), alkis(1), sessizlik(0.35), alkis(2), sessizlik(0.35), alkis(3), sessizlik(2), ton(0.8, 250), sessizlik(2)), (o) => {
      const r = s.kare(o);
      if (r.seriBitti) seriler.push(r.seriBitti);
    });
    expect(seriler).toHaveLength(1);
    expect(seriler[0]).toHaveLength(3);
  });

  it('ritim kalıbı tempodan bağımsız: uzun-kısa-kısa', () => {
    expect(ritimKalibi([0, 0.8, 1.2, 1.6])).toEqual(['uzun', 'kisa', 'kisa']);
    expect(ritimKalibi([0, 1.6, 2.4, 3.2])).toEqual(['uzun', 'kisa', 'kisa']);
    const a = ayarla(sessizlik(1));
    const s = new AlkisSayaci(a);
    let seri: number[] = [];
    isle(birlestir(sessizlik(0.3), alkis(1), sessizlik(0.74), alkis(2), sessizlik(0.34), alkis(3), sessizlik(0.34), alkis(4), sessizlik(2)), (o) => {
      const r = s.kare(o);
      if (r.seriBitti) seri = r.seriBitti;
    });
    expect(ritimKalibi(seri)).toEqual(['uzun', 'kisa', 'kisa']);
  });

  it('ses şekli: iki kısa = köpek, bir uzun kalın = inek, yükselip alçalan = kedi', () => {
    const a = ayarla(sessizlik(1));
    const dene = (sinyal: Float32Array) => {
      const s = new SesSekli(a);
      let dizi: SesParcasi[] = [];
      isle(birlestir(sessizlik(0.3), sinyal, sessizlik(1.3)), (o) => {
        const r = s.kare(o);
        if (r.dizi) dizi = r.dizi;
      });
      return hayvanSesi(dizi, 300);
    };
    expect(dene(birlestir(ton(0.22, 350), sessizlik(0.25), ton(0.22, 350))).hayvan).toBe('kopek');
    expect(dene(ton(1.0, 170)).hayvan).toBe('inek');
    expect(dene(ton(0.9, (u) => 320 + 260 * Math.sin(Math.PI * u))).hayvan).toBe('kedi');
  });

  it('perde eğrisi', () => {
    expect(egri([300, 320, 360, 400, 450])).toBe('yukselen');
    expect(egri([450, 400, 360, 320, 300])).toBe('alcalan');
    expect(egri([300, 380, 480, 470, 380, 300])).toBe('yukselip-alcalan');
    expect(egri([300, 302, 299, 301, 300])).toBe('duz');
  });

  it('sessizlik sayacı: sessizlikte sayar, ses gelince sıfırlanır', () => {
    const a = ayarla(sessizlik(1));
    const s = new SessizlikSayaci(a);
    let enCok = 0;
    let bozuldu = false;
    isle(birlestir(sessizlik(3, 5), ton(0.5, 250), sessizlik(5.2, 6)), (o) => {
      const r = s.kare(o);
      enCok = Math.max(enCok, r.gecen);
      if (r.bozuldu) bozuldu = true;
    });
    expect(bozuldu).toBe(true);
    expect(s.gecen).toBeGreaterThan(4.8);
    expect(enCok).toBeGreaterThan(4.8);
  });

  it('Türkçe heceleme', () => {
    expect(hecele('Barış')).toEqual(['ba', 'rış']);
    expect(hecele('kelebek')).toEqual(['ke', 'le', 'bek']);
    expect(hecele('kedi')).toEqual(['ke', 'di']);
    expect(hecele('top')).toEqual(['top']);
    expect(hecele('elma')).toEqual(['el', 'ma']);
    expect(hecele('Ankara')).toEqual(['an', 'ka', 'ra']);
    expect(hecele('Türkçe')).toEqual(['türk', 'çe']);
    expect(hecele('saat')).toEqual(['sa', 'at']);
    expect(hecele('Zeynep')).toEqual(['zey', 'nep']);
    expect(hecele('Elif')).toEqual(['e', 'lif']);
  });
});
