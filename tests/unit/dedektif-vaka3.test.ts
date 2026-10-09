/** Dedektif Mino · Vaka 3 "Kaybolan Yıldız Kurabiyeler": mantık (dedektif/src/mantik3.ts), görsel haritası, cümleler, gizlilik */
import { describe, expect, it } from 'vitest';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import { erisimTuru } from '../../src/engine/erisim';
import { Dosya, kameraHesap, kartSirasi, Soru, dedektifCumleleri, dedektifKinoCumleleri } from '../../dedektif/src/mantik';
import {
  ADIMLAR3,
  B3,
  BOS_YERLER,
  F3,
  halka3,
  halka3Adimi,
  HALKALAR3,
  K3,
  KADRAJ3,
  KALAN,
  KARTLAR3,
  KOVUKLAR,
  KovukArama,
  kurabiyeDene,
  kartKurabiyeSayisi,
  M3,
  ROMAN3,
  Sayma,
  SEKER_IZI,
  SekerIzi,
  VAKA3_YAYINDA,
  vaka3Gorunur,
  VERILECEK,
  TEPSI_YERLERI,
} from '../../dedektif/src/mantik3';
import { B_LISTESI, DIKEY3_HAZIR, E_LISTESI, eksikler3, tanimli, YER_TUTUCU } from '../../dedektif/src/resimler3';
import { kayit, sifirla, vakaCozuldu } from '../../dedektif/src/kayit';
import { dudakBicimi } from '../../dedektif/src/dunya3';
import D from '../../content/dedektif.json';

const rnd = (t: number) => () => {
  t = (t * 1664525 + 1013904223) >>> 0;
  return t / 4294967296;
};

describe('Vaka 3: gizli bayrak ve erişim', () => {
  it('oyunda henüz seçilemez; ?vaka=3, ?vaka3=1 ya da test kısayoluyla görünür', () => {
    expect(VAKA3_YAYINDA).toBe(false);
    expect(vaka3Gorunur('')).toBe(false);
    expect(vaka3Gorunur('?test=1&cozuldu=2')).toBe(false);
    expect(vaka3Gorunur('?vaka=3')).toBe(true);
    expect(vaka3Gorunur('?vaka3=1')).toBe(true);
    expect(vaka3Gorunur('?test=1&ekran=vaka3&adim=kim')).toBe(true);
  });
  it('abonelikle (Vaka 2 gibi): dedektif/vaka3 abonelik', () => {
    expect(erisimTuru('dedektif/vaka3')).toBe('abonelik');
    expect(erisimTuru('dedektif/vaka2')).toBe('abonelik');
    expect(erisimTuru('dedektif')).toBe('abonelik');
  });
  it('kayıt: Vaka 3 dosyaya üçüncü vaka olarak girer', () => {
    sifirla();
    for (const v of ['vaka1', 'vaka2', 'vaka3']) vakaCozuldu(v);
    expect(kayit.cozulen).toEqual(['vaka1', 'vaka2', 'vaka3']);
    sifirla();
  });
});

describe('Vaka 3: halkalar ve kartlar', () => {
  it('beş halka (say, çıkış, yol, kim, neden); kovuk araması ve final arada', () => {
    expect(HALKALAR3.map((h) => h.id)).toEqual(['sayi', 'cikis', 'yol', 'kim', 'neden']);
    expect(ADIMLAR3).toEqual(['giris', 'sayi', 'cikis', 'yol', 'kim', 'kovuk', 'neden', 'final', 'roman']);
    expect(halka3Adimi('kovuk')).toBeNull();
    expect(halka3Adimi('yol')).toBe('yol');
  });
  it('her halkada 3 kart, doğrusu içinde; Kino yanlış bir kartı gösterir; yanlışların kendi sahnesi var', () => {
    for (const h of HALKALAR3) {
      expect(h.kartlar, h.id).toHaveLength(3);
      expect(h.kartlar).toContain(h.dogru);
      expect(h.kinoKart).not.toBe(h.dogru);
      expect(h.kartlar).toContain(h.kinoKart);
      for (const k of h.kartlar) {
        expect(KARTLAR3[k], k).toBeTruthy();
        if (k !== h.dogru) expect(KARTLAR3[k].tepki, k).toBeTruthy();
      }
      expect(h.ipuclari.length, h.id).toBeGreaterThan(0);
    }
    expect(halka3('sayi').dogru).toBe('kurabiye-4');
    expect(halka3('cikis').dogru).toBe('pencere');
    expect(halka3('yol').dogru).toBe('yildiz-seker');
    expect(halka3('kim').dogru).toBe('sincap');
    expect(halka3('neden').dogru).toBe('kiler');
  });
  it('cevabı ele vermez: soru cümlesi doğru kartın adını söylemez; doğru kart ipucunun kopyası değil', () => {
    const adlar: Record<string, string[]> = { 'kurabiye-4': ['dört'], pencere: ['pencere'], 'yildiz-seker': ['yıldız', 'şeker'], sincap: ['sincap'], kiler: ['kış', 'kiler'] };
    for (const h of HALKALAR3) {
      for (const a of adlar[h.dogru!]) expect(h.soru.toLocaleLowerCase('tr'), h.id).not.toContain(a);
      const resim = KARTLAR3[h.dogru!].resim;
      // (yol: kart yıldız şekerin kendisi, ipucu da; ama soru kurabiyenin fotoğrafına bakarak sorulur)
      if (h.id !== 'yol') for (const t of h.ipuclari) expect(t.foto ?? t.resim, h.id).not.toBe(resim);
      else expect(h.foto).toBe('v3/foto-kurabiye');
    }
    // bir önceki "demek ki" sıradakinin cevabını söylemez
    for (let i = 1; i < HALKALAR3.length; i++) for (const a of adlar[HALKALAR3[i].dogru!]) expect(HALKALAR3[i - 1].demekKi.toLocaleLowerCase('tr')).not.toContain(a);
  });
  it('kart sorusu motoru Vaka 3 kartlarıyla da çalışır (2 yanlışta doğru parlar); Kino kenarda', () => {
    const s = new Soru(halka3('kim'));
    expect(s.sec('kus')).toEqual({ dogru: false, parla: false, yanlis: 1 });
    expect(s.sec('kirpi').parla).toBe(true);
    expect(s.sec('sincap').dogru).toBe(true);
    for (let t = 1; t < 30; t++) expect(kartSirasi(halka3('sayi'), rnd(t))[1]).not.toBe('kurabiye-6');
    // "Sen havuç sevmezsin ki." Kino'nun havuç tahmininden sonra
    expect(halka3('yol').kinoCevap).toBe(M3.havuc_sevmez);
  });
});

describe('Vaka 3: sayma, iz, kovuk', () => {
  it('tepside 6 yer: 2 kurabiye, 4 boş; 6 kart fazla iki, 2 kart iki boş bırakır, 4 tam oturur', () => {
    expect(TEPSI_YERLERI).toHaveLength(6);
    expect(KALAN).toHaveLength(2);
    expect(BOS_YERLER).toHaveLength(4);
    expect(kurabiyeDene(kartKurabiyeSayisi('kurabiye-6'))).toEqual({ dolan: 4, bos: 0, fazla: 2 });
    expect(kurabiyeDene(kartKurabiyeSayisi('kurabiye-2'))).toEqual({ dolan: 2, bos: 2, fazla: 0 });
    expect(kurabiyeDene(kartKurabiyeSayisi('kurabiye-4'))).toEqual({ dolan: 4, bos: 0, fazla: 0 });
  });
  it('sayma: her yeni dokunuş sıradaki sayı; aynı yer iki kez sayılmaz', () => {
    const s = new Sayma(4);
    expect(s.dokun(2)).toBe(1);
    expect(s.dokun(2)).toBeNull();
    expect(s.siradaki).toBe(0);
    expect(s.dokun(0)).toBe(2);
    expect(s.dokun(1)).toBe(3);
    expect(s.dokun(3)).toBe(4);
    expect(s.bitti).toBe(true);
  });
  it('yıldız şeker izi: sırayla; atlanan şeker sayılmaz; ağaca doğru (soldan sağa), ekranın altına inmez', () => {
    const iz = new SekerIzi();
    expect(iz.dokun(2).alindi).toBe(false);
    for (let i = 0; i < SEKER_IZI.length; i++) expect(iz.dokun(i)).toMatchObject({ alindi: true, sira: i });
    expect(iz.bitti).toBe(true);
    for (let i = 1; i < SEKER_IZI.length; i++) expect(SEKER_IZI[i].x).toBeGreaterThan(SEKER_IZI[i - 1].x);
    for (const p of SEKER_IZI) expect(p.y + p.h / 2).toBeLessThan(0.955);
  });
  it('kovuk araması: kuyruğa iki dokunuş (ilki kaçar); üç kovuk üst üste, dudak çokgeni kutunun içinde', () => {
    const a = new KovukArama();
    expect(a.kuyruk()).toBe('kac');
    expect(a.bitti).toBe(false);
    expect(a.kuyruk()).toBe('cik');
    expect(a.bitti).toBe(true);
    expect(KOVUKLAR.ust.y).toBeLessThan(KOVUKLAR.orta.y);
    expect(KOVUKLAR.orta.y).toBeLessThan(KOVUKLAR.alt.y);
    for (const k of Object.values(KOVUKLAR)) {
      const n = dudakBicimi(k)
        .replace(/^polygon\(|\)$/g, '')
        .split(', ')
        .map((p) => p.split(' ').map((v) => parseFloat(v)));
      expect(n.length).toBeGreaterThan(20);
      for (const [x, y] of n) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(100);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(100);
      }
    }
  });
  it('final: Fındık\'a iki kurabiye; roman 4 kare; dosya beş göz', () => {
    expect(VERILECEK).toBe(2);
    expect(ROMAN3.map((r) => r.sira)).toEqual([1, 2, 3, 4]);
    const d = Dosya.adimdan('kim', ADIMLAR3, HALKALAR3);
    expect(d.gozler.map((g) => g.demek)).toEqual([true, true, true, false, false]);
    expect(Dosya.adimdan('final', ADIMLAR3, HALKALAR3).tamam).toBe(true);
  });
  it('sahneler (16:9) her kadrajda ekranı tamamen kaplar (telefon ve tablet)', () => {
    const dunya = { w: 1000 * (4096 / 2286), h: 1000 };
    for (const e of [
      { w: 844, h: 390 },
      { w: 932, h: 430 },
      { w: 667, h: 375 },
      { w: 1024, h: 768 },
      { w: 390, h: 844 },
    ])
      for (const kd of [...Object.values(KADRAJ3), ...HALKALAR3.map((h) => h.kadraj)]) {
        const k = kameraHesap(kd, dunya, e);
        expect(k.tx).toBeLessThanOrEqual(0.001);
        expect(k.ty).toBeLessThanOrEqual(0.001);
        expect(k.tx + dunya.w * k.s).toBeGreaterThanOrEqual(e.w - 0.001);
        expect(k.ty + dunya.h * k.s).toBeGreaterThanOrEqual(e.h - 0.001);
      }
  });
});

describe('Vaka 3: görsel haritası (tek yer, bölüm B adları)', () => {
  it('bölüm B\'nin 28 dosyası ve E\'nin 5 dosyası haritada; çizimi olmayanın yer tutucusu var (dikeyler hariç)', () => {
    expect(B_LISTESI).toHaveLength(28);
    expect(E_LISTESI).toHaveLength(5);
    for (const ad of [...B_LISTESI, ...E_LISTESI]) {
      if (ad.endsWith('-dikey')) continue;
      expect(tanimli(ad), ad).toBe(true);
    }
    // dikey sahneler ipuçlarının yerleri ölçülünce açılır
    expect(DIKEY3_HAZIR).toBe(false);
    // henüz çizimi gelmeyenler listesi bölüm B / E adlarından oluşur
    for (const a of eksikler3()) expect([...B_LISTESI, ...E_LISTESI] as string[]).toContain(a);
  });
  it('kodda kullanılan her v3 görseli tanımlı (kartlar, ipuçları, fotoğraflar, demek ki, roman)', () => {
    const adlar = [
      ...Object.values(KARTLAR3).map((k) => k.resim),
      ...HALKALAR3.flatMap((h) => [h.demekResim, h.foto, h.ekFoto, ...h.ipuclari.map((t) => t.foto ?? t.resim)]),
      ...ROMAN3.map((r) => r.resim),
      'v3/otobus-ic',
      'v3/otobus-yani',
      'v3/agac',
      'v3/kiler-ic',
      'v3/kurabiye',
      'v3/tepsi',
      'v3/un-halka',
      'v3/ekmek',
      'v3/tabela',
      'v3/kapak',
      'v3/findik',
      'v3/findik-yanak',
      'v3/findik-utangac',
      'v3/findik-sarilma',
      'v3/findik-kuyruk',
      'v3/baykus',
      'v3/palamut',
      'v3/palamut-kurabiye',
      'v3/seker-tek',
      'v3/kirinti-tek',
      'v3/kalp',
      'v3/parti-sapka',
    ].filter((a): a is string => !!a);
    for (const a of adlar) {
      expect(a.startsWith('v3/'), a).toBe(true);
      expect(tanimli(a.slice(3)), a).toBe(true);
    }
    // yer tutucular yalnız bölüm B / E adlarıyla (bileşimler ayrı tabloda)
    for (const ad of Object.keys(YER_TUTUCU)) expect([...B_LISTESI, ...E_LISTESI] as string[], ad).toContain(ad);
  });
});

describe('Vaka 3: cümleler', () => {
  it('seslendirilecek cümleler listede (CI seslendirir), kısa; Kino kendi sesiyle; balon sözleri seslendirilmez', () => {
    const hepsi = new Set(tumCumleler());
    for (const c of [...Object.values(M3), ...Object.values(F3)]) {
      expect(hepsi.has(normal(c)), c).toBe(true);
      expect(dedektifCumleleri()).toContain(c);
      expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(8);
    }
    const kino = new Set(karakterCumleleri().kino);
    for (const c of Object.values(K3)) {
      expect(dedektifKinoCumleleri()).toContain(c);
      expect(kino.has(normal(c)), c).toBe(true);
      expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(8);
    }
    for (const c of Object.values(B3)) expect(dedektifCumleleri(), c).not.toContain(c);
  });
  it('"öğüt" sözcüğü geçmez; senaryonun cümleleri aynen', () => {
    expect(JSON.stringify(D.vaka3).toLocaleLowerCase('tr')).not.toMatch(/öğüt/);
    expect(F3.mmf).toBe('Mmf! Mmf mmf!');
    expect(F3.alabilir).toBe('Bir tane alabilir miyim?');
    expect(M3.hikaye).toBe('Fındık aldı, kilere sakladı, sonra sormayı öğrendi!');
  });
});
