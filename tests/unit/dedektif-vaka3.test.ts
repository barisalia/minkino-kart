/** Dedektif Mino · Vaka 3 "Kaybolan Yıldız Kurabiyeler": mantık (dedektif/src/mantik3.ts), görsel haritası, cümleler, gizlilik */
import { describe, expect, it } from 'vitest';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import { ERISIM, erisimTuru, kilitliMi } from '../../src/engine/erisim';
import { Dosya, kameraHesap, kartSirasi, Soru, dedektifCumleleri, dedektifKinoCumleleri } from '../../dedektif/src/mantik';
import {
  ADIMLAR3,
  B3,
  BOS_YERLER,
  F3,
  FINAL_KURABIYELER,
  FINDIK_YERI,
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
  TEPSI3,
  OTOBUS,
  KOVUK_ICI,
  SAHNE3_DIKEY,
  DIKEY_SAHNELER3,
  sahne3Yerlesim,
} from '../../dedektif/src/mantik3';
import { ODA_ORAN } from '../../dedektif/src/mantik';
import { B_LISTESI, DIKEY3_HAZIR, E_LISTESI, eksikler3, tanimli, YER_TUTUCU } from '../../dedektif/src/resimler3';
import { kayit, sifirla, vakaCozuldu } from '../../dedektif/src/kayit';
import { dudakBicimi } from '../../dedektif/src/dunya3';
import D from '../../content/dedektif.json';

const rnd = (t: number) => () => {
  t = (t * 1664525 + 1013904223) >>> 0;
  return t / 4294967296;
};

describe('Vaka 3: yayın bayrağı ve erişim', () => {
  it('bayrak açıksa her yerde (uygulamada da) görünür; kapalıysa yalnız web adresiyle (?vaka=3, ?vaka3=1, test kısayolu)', () => {
    if (VAKA3_YAYINDA) {
      for (const adres of ['', '?test=1&cozuldu=2', '?vaka=3']) {
        expect(vaka3Gorunur(adres), adres).toBe(true);
        expect(vaka3Gorunur(adres, true), `uygulama ${adres}`).toBe(true);
      }
    } else {
      expect(vaka3Gorunur('')).toBe(false);
      expect(vaka3Gorunur('?test=1&cozuldu=2')).toBe(false);
    }
    expect(vaka3Gorunur('?vaka=3')).toBe(true);
    expect(vaka3Gorunur('?vaka3=1')).toBe(true);
    expect(vaka3Gorunur('?test=1&ekran=vaka3&adim=kim')).toBe(true);
  });
  it('uygulama (mağaza) derlemesinde bayrak kapalıyken hiçbir adres parametresi açmaz', () => {
    expect(vaka3Gorunur('?vaka=3', true)).toBe(VAKA3_YAYINDA);
    expect(vaka3Gorunur('?vaka3=1', true)).toBe(VAKA3_YAYINDA);
    expect(vaka3Gorunur('?test=1&ekran=vaka3&adim=kim', true)).toBe(VAKA3_YAYINDA);
  });
  it('abonelikle (Vaka 2 gibi): dedektif/vaka3 tabloda abonelik; kilitler etkinken abone değilse kilitli', () => {
    expect(ERISIM['dedektif/vaka3']).toBe('abonelik');
    expect(erisimTuru('dedektif/vaka3')).toBe('abonelik');
    expect(erisimTuru('dedektif/vaka2')).toBe('abonelik');
    expect(erisimTuru('dedektif/vaka1')).toBe('abonelik');
    expect(erisimTuru('dedektif')).toBe('abonelik');
    expect(kilitliMi('dedektif/vaka3', { etkin: true, premium: false })).toBe(true);
    expect(kilitliMi('dedektif/vaka3', { etkin: true, premium: true })).toBe(false);
    // web sitesinde (kilitler etkin değil) açık
    expect(kilitliMi('dedektif/vaka3', { etkin: false, premium: false })).toBe(false);
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
  it('iki ipuçlu halkada ikinci ipucu da delilde: Halka 4 el izi + kızıl tüy (kuş tüyden söz eder, tüy kabarır)', () => {
    const kim = halka3('kim');
    const ilk = kim.foto ?? kim.ipuclari[0].foto ?? kim.ipuclari[0].resim;
    expect(ilk).toBe('v3/ipucu-el-izi');
    expect(kim.ekFoto).toBe('v3/ipucu-tuy');
    expect(kim.ipuclari.map((t) => t.foto ?? t.resim)).toContain(kim.ekFoto);
    expect(B3.kus_tuy.toLocaleLowerCase('tr')).toContain('tüy');
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
    // dört kurabiye soldan sağa, sağdaki de Fındık'ın önünde değil solunda (arkasında yarım kalmaz)
    const xs = FINAL_KURABIYELER.map(([x]) => x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect(FINDIK_YERI.x - xs[xs.length - 1]).toBeGreaterThanOrEqual(0.085);
    expect(ROMAN3.map((r) => r.sira)).toEqual([1, 2, 3, 4]);
    const d = Dosya.adimdan('kim', ADIMLAR3, HALKALAR3);
    expect(d.gozler.map((g) => g.demek)).toEqual([true, true, true, false, false]);
    expect(Dosya.adimdan('final', ADIMLAR3, HALKALAR3).tamam).toBe(true);
  });
  it('sahneler (16:9) her kadrajda ekranı tamamen kaplar (telefon ve tablet)', () => {
    const dunya = { w: 1000 * (2752 / 1536), h: 1000 };
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

describe('Vaka 3: dikey sahneler (9:16 çizimler)', () => {
  const icinde = (x: number, y: number) => x >= 0 && x <= 1 && y >= 0 && y <= 1;
  it('dikeye geçince oran, ipuçları, tepsi, iz, kovuklar ve final dikey çizimin; yataya dönünce eski değerler aynen', () => {
    const once = JSON.stringify({ h: HALKALAR3, k: KADRAJ3, t: TEPSI3, o: OTOBUS, s: SEKER_IZI, kv: KOVUKLAR, ky: KOVUK_ICI, f: FINDIK_YERI, fk: FINAL_KURABIYELER, oran: ODA_ORAN });
    for (const s of DIKEY_SAHNELER3) sahne3Yerlesim(s, true);
    try {
      for (const s of DIKEY_SAHNELER3) {
        expect(SAHNE3_DIKEY[s]).toBe(true);
        expect(ODA_ORAN[s]).toBeCloseTo(1536 / 2752, 5);
      }
      for (const t of HALKALAR3.filter((h) => h.oda !== 'kiler').flatMap((h) => h.ipuclari)) expect(icinde(t.x, t.y), t.id).toBe(true);
      // sağdaki (alt) kovuk dikeyde de en sağda; üç kovuk üst üste
      expect(KOVUKLAR.alt.x).toBeGreaterThan(KOVUKLAR.orta.x);
      expect(KOVUKLAR.ust.y).toBeLessThan(KOVUKLAR.orta.y);
      expect(KOVUKLAR.orta.y).toBeLessThan(KOVUKLAR.alt.y);
      // kuyruğun kökü alt ağzın karanlığında (ortasının altında), ağzın içinde
      const a = KOVUKLAR.alt;
      expect(KOVUK_ICI.kuyruk.y).toBeGreaterThan(a.y);
      expect(KOVUK_ICI.kuyruk.y).toBeLessThan(a.y + a.ry * 0.8);
      expect(Math.abs(KOVUK_ICI.kuyruk.x - a.x)).toBeLessThan(a.rx * 0.5);
      // iz soldan sağa, telefonda da ekranda (kamera tam en: kenarlardan ~%9 kırpılır)
      for (let i = 1; i < SEKER_IZI.length; i++) expect(SEKER_IZI[i].x).toBeGreaterThan(SEKER_IZI[i - 1].x);
      for (const p of SEKER_IZI) expect(p.x).toBeLessThan(0.89);
      // tepsinin altı yeri tepsinin kutusunda; final kurabiyeleri soldan sağa, Fındık'tan ayrı
      for (const [x, y] of TEPSI3.yerler) expect(x >= TEPSI3.kutu.x0 && x <= TEPSI3.kutu.x1 && y >= TEPSI3.kutu.y0 && y <= TEPSI3.kutu.y1).toBe(true);
      const xs = FINAL_KURABIYELER.map(([x]) => x);
      expect([...xs].sort((p, q) => p - q)).toEqual(xs);
      expect(FINDIK_YERI.x - xs[xs.length - 1]).toBeGreaterThanOrEqual(0.085);
    } finally {
      for (const s of DIKEY_SAHNELER3) sahne3Yerlesim(s, false);
    }
    expect(JSON.parse(JSON.stringify({ h: HALKALAR3, k: KADRAJ3, t: TEPSI3, o: OTOBUS, s: SEKER_IZI, kv: KOVUKLAR, ky: KOVUK_ICI, f: FINDIK_YERI, fk: FINAL_KURABIYELER, oran: ODA_ORAN }))).toEqual(JSON.parse(once));
  });
  it('yatayda da tepsinin yerleri kutusunda, kuyruğun kökü alt ağzın karanlığında', () => {
    for (const [x, y] of TEPSI3.yerler) expect(x >= TEPSI3.kutu.x0 && x <= TEPSI3.kutu.x1 && y >= TEPSI3.kutu.y0 && y <= TEPSI3.kutu.y1).toBe(true);
    const a = KOVUKLAR.alt;
    expect(KOVUK_ICI.kuyruk.y).toBeGreaterThan(a.y);
    expect(KOVUK_ICI.kuyruk.y).toBeLessThan(a.y + a.ry * 0.8);
    expect(Math.abs(KOVUK_ICI.kuyruk.x - a.x)).toBeLessThan(a.rx * 0.5);
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
    // dikey sahneler açık: yerleri ölçüldü (mantik3.ts → DIKEY3)
    expect(DIKEY3_HAZIR).toBe(true);
    // bölüm B'nin 28 ve E'nin 5 çizimi de geldi: yer tutucuyla duran dosya yok
    expect(eksikler3()).toEqual([]);
    // bölüm E'nin (roman kareleri, kapak) yer tutucusu kaldırıldı: yalnız Gemini çizimi
    for (const a of E_LISTESI) expect(a in YER_TUTUCU, a).toBe(false);
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
