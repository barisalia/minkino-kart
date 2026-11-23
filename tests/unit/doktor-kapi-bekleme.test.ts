import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import {
  BEKLEME_ADIMLAR, BEKLEME_DIZI, BEKLEME_DOSYALAR, BEKLEME_EFEKTLER, BEKLEME_KAMERA, BEKLEME_KAYIT_MS, BEKLEME_OLCEK, BEKLEME_REPLIKLER,
  BEKLEME_YERLESIM, ESYA_ADIMI, ESYA_CIZIMI, K2_BEKLEME, beklemeKatmanlari, type BeklemeOlayi,
} from '../../doktor/src/bekleme/veri';
import {
  KAPI_ADIMLAR, KAPI_DIZI, KAPI_DOSYALAR, KAPI_EFEKTLER, KAPI_KAMERA, KAPI_KAYIT_MS, KAPI_OLCEK, KAPI_REPLIKLER, KAPI_YERLESIM, K2_KAPI, SEK,
  kapiKatmanlari, type KapiOlayi,
} from '../../doktor/src/kapi/veri';
import { AkisMotoru, gorunumCizimleri, yuruKaymasi, yuruSuresi, yuruYolu, type Adim } from '../../doktor/src/motor/akis';
import { K1_DOSYALAR, kareSec, type Dizi } from '../../doktor/src/once-kuzu/diziler';

// Minik Doktor · 2. sahne (klinik kapısı) ve 3. sahne (bekleme odası): çizimler gelmeden doğrulanabilen her şey.
// Çizim adları Astra'ya yazılan Paket Doktor-K2 brief'iyle birebir olmalı.

const K2_DOSYALAR = [...KAPI_DOSYALAR, ...BEKLEME_DOSYALAR];

/** Brief'in K2 bölümündeki dosya adları (K1'e yapılan göndermeler hariç). */
function briefAdlari(): string[] | null {
  if (!existsSync('CLAUDE-ASTRA-MESAJLAR.md')) return null;
  const t = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
  const bas = t.indexOf('· Paket Doktor-K2 · klinik kapısı ve bekleme odası');
  if (bas < 0) return null;
  const son = t.indexOf('\n## ', bas);
  const bolum = t.slice(bas, son < 0 ? undefined : son);
  const adlar = new Set<string>();
  const kok = /^(zipzip-|kino-|kapi-|tabela-|fon-|bekleme-koltugu$|raf-)/;
  const k1 = new Set(K1_DOSYALAR);
  let onceki = '';
  for (const m of bolum.matchAll(/`([^`]+)`/g)) {
    const s = m[1].trim();
    const aralik = s.match(/^([a-z-]+-)(\d+) … (\d+)$/);
    if (aralik && kok.test(aralik[1])) { for (let i = +aralik[2]; i <= +aralik[3]; i++) adlar.add(aralik[1] + i); onceki = aralik[1]; continue; }
    const devam = s.match(/^-(\d+)$/);
    if (devam && onceki) { adlar.add(onceki + devam[1]); continue; }
    if (/[/.… ]/.test(s) || !kok.test(s) || k1.has(s)) continue;
    adlar.add(s);
    const sayili = s.match(/^([a-z-]+-)\d+$/);
    onceki = sayili ? sayili[1] : '';
  }
  return [...adlar].sort();
}

const kullanilan = (adimlar: readonly Adim<string>[], diziler: Record<string, Dizi>) =>
  adimlar.flatMap(a => Object.values(a.katman ?? {}).flatMap(g => gorunumCizimleri(g, n => diziler[n].kareler).map(k => ({ adim: a.ad, k }))));

describe('Klinik kapısı ve bekleme odası · çizim adları', () => {
  it('K2: 39 + 51 = 90 çizim, yinelenen yok, K1 ile çakışan yok', () => {
    expect(KAPI_DOSYALAR).toHaveLength(39);
    expect(BEKLEME_DOSYALAR).toHaveLength(51);
    expect(new Set(K2_DOSYALAR).size).toBe(90);
    expect(K2_DOSYALAR.filter(a => K1_DOSYALAR.includes(a))).toEqual([]);
  });
  it('adlar Astra brief’indeki adlarla birebir', () => {
    const brief = briefAdlari();
    if (!brief) return; // brief dosyası bu ortamda yoksa atlanır
    expect(brief).toEqual([...K2_DOSYALAR].sort());
  });
  it('dizilerin ve adımların kullandığı her çizim pakette var; ağız dizileri altışar', () => {
    for (const [dosyalar, diziler, adimlar] of [[KAPI_DOSYALAR, KAPI_DIZI, KAPI_ADIMLAR], [BEKLEME_DOSYALAR, BEKLEME_DIZI, BEKLEME_ADIMLAR]] as const) {
      const var_ = new Set(dosyalar);
      for (const [ad, d] of Object.entries(diziler as Record<string, Dizi>)) {
        expect(d.kareler.length, ad).toBe(d.sureler.length);
        d.kareler.forEach(k => expect(var_.has(k), ad + ' → ' + k).toBe(true));
      }
      kullanilan(adimlar as readonly Adim<string>[], diziler as Record<string, Dizi>).forEach(x => expect(var_.has(x.k), x.adim + ' → ' + x.k).toBe(true));
    }
    for (const d of [K2_KAPI.cekinAgiz, K2_KAPI.karsilaAgiz, K2_BEKLEME.ilisAgiz, K2_BEKLEME.sarilAgiz, K2_BEKLEME.kapidaAgiz]) {
      expect(d).toHaveLength(6);
      d.forEach((ad, i) => expect(ad.endsWith('-agiz-' + i)).toBe(true));
    }
  });
  it('her adımın katmanı sahnenin katmanlarından biri; konuşmanın ağız dizisi tanımlı katmanda', () => {
    const kapi = new Set(kapiKatmanlari().map(k => k.ad)), bekleme = new Set(beklemeKatmanlari().map(k => k.ad));
    for (const a of KAPI_ADIMLAR) Object.keys(a.katman ?? {}).forEach(k => expect(kapi.has(k), a.ad + ' ' + k).toBe(true));
    for (const a of BEKLEME_ADIMLAR) Object.keys(a.katman ?? {}).forEach(k => expect(bekleme.has(k), a.ad + ' ' + k).toBe(true));
    const agizlar = new Set(['zipzip-cekin', 'kino-karsila', 'zipzip-ilis', 'zipzip-saril', 'kino-kapida']);
    for (const a of [...KAPI_ADIMLAR, ...BEKLEME_ADIMLAR]) if (a.ses?.agiz) expect(agizlar.has(a.ses.agiz), a.ad).toBe(true);
  });
});

describe('Klinik kapısı · sekerek geliş', () => {
  const d = KAPI_DIZI['zipzip-sek'];
  const dongu = d.sureler.reduce((a: number, b: number) => a + b, 0);
  it('beş sekme, toplam 1500 px; adım sahnesi tam o kadar sürer', () => {
    expect(yuruSuresi(d, SEK)).toBe(dongu * 5);
    expect(yuruYolu(d, SEK, yuruSuresi(d, SEK))).toBe(1500);
    expect(KAPI_ADIMLAR.find(a => a.ad === 's2-sek')!.bitis).toEqual({ tur: 'sure', ms: dongu * 5 });
  });
  it('ayak yerdeyken katman kaymaz, yalnız havada ilerler; yol hiç geri gitmez', () => {
    let once = 0, onceKare = 0;
    for (let t = 0; t <= yuruSuresi(d, SEK); t += 5) {
      const y = yuruYolu(d, SEK, t);
      expect(y).toBeGreaterThanOrEqual(once - 1e-9);
      const kare = kareSec(d, t).indeks;
      // iki ölçüm de ayağın yerde olduğu pozdaysa yol değişmemiş olmalı
      if (!SEK.hava.includes(kare) && !SEK.hava.includes(onceKare)) expect(y - once, 't=' + t + ' kare=' + kare).toBeLessThan(1e-6);
      once = y; onceKare = kare;
    }
  });
  it('Zıpzıp sağdan, ekran dışından gelir ve kapının sağında durur', () => {
    const z = kapiKatmanlari().find(k => k.ad === 'zipzip')!;
    const basKayma = yuruKaymasi(d, SEK, 0) * KAPI_OLCEK;
    expect(basKayma).toBeCloseTo(600, 6);
    expect(z.kutu.sol + 650 * KAPI_OLCEK - 150 + basKayma).toBeGreaterThanOrEqual(1400 + 100); // gövdenin sol kenarı iPad görüşünün dışında
    expect(yuruKaymasi(d, SEK, yuruSuresi(d, SEK)) * KAPI_OLCEK).toBeCloseTo(0, 6);
    expect(KAPI_YERLESIM.zipzipX).toBeGreaterThan(KAPI_YERLESIM.bosluk.sol + KAPI_YERLESIM.bosluk.g);
  });
  it('her inişte ayak sesi', () => {
    const ef = KAPI_ADIMLAR.find(a => a.ad === 's2-sek')!.efekt!;
    expect(ef).toHaveLength(5);
    ef.forEach((e, i) => { expect(e.ad).toBe('e2-pat'); expect(kareSec(d, e.gecikme! + 1).indeks, 'iniş ' + i).toBe(6); });
  });
});

describe('Klinik kapısı · akış', () => {
  const kayit = (ad: string) => KAPI_KAYIT_MS[ad] ?? 0;
  it('tabela çevrilmeden hiçbir şey olmaz; sonra üç replik sırayla', () => {
    const akis = new AkisMotoru<Adim<KapiOlayi>, KapiOlayi>(KAPI_ADIMLAR, kayit);
    akis.ilerlet(60_000);
    expect(akis.adim?.ad).toBe('s2-tabela');
    const girilen = [akis.olay('tabela-cevrildi')!.ad];
    for (let i = 0; i < 4000 && !akis.bitti; i++) akis.ilerlet(16).forEach(a => girilen.push(a.ad));
    expect(akis.bitti).toBe(true);
    const calan = girilen.map(ad => KAPI_ADIMLAR.find(a => a.ad === ad)!.ses?.ad).filter((s): s is string => !!s);
    expect(calan).toEqual(KAPI_REPLIKLER.map(r => r.ad));
  });
  it('Kino kapı açılmadan görünmez; kapı açılırken eşikte', () => {
    expect(KAPI_ADIMLAR[0].katman!.kino).toEqual({ yok: true });
    const kapi = KAPI_ADIMLAR.find(a => a.ad === 's2-kapi')!;
    expect(kapi.katman!.kapi).toEqual({ dizi: 'kapi-ac' });
    expect(kapi.katman!.kino).toEqual({ poz: 'kino-karsila-0' });
    const sira = kapiKatmanlari().map(k => k.ad);
    expect(sira.indexOf('kino')).toBeLessThan(sira.indexOf('kapi')); // kanat Kino'nun önünde: kapalıyken Kino görünmez
  });
});

describe('Bekleme odası · akış ve dallar', () => {
  const kayit = (ad: string) => BEKLEME_KAYIT_MS[ad] ?? 0;
  const yeni = () => new AkisMotoru<Adim<BeklemeOlayi>, BeklemeOlayi>(BEKLEME_ADIMLAR, kayit);
  const rafaKadar = (akis: ReturnType<typeof yeni>) => { const g: string[] = []; for (let i = 0; i < 4000 && akis.adim?.ad !== 's3-raf'; i++) akis.ilerlet(16).forEach(a => g.push(a.ad)); return g; };

  it('Kuzu verilince sahne onunla sürer ve biter', () => {
    const akis = yeni();
    rafaKadar(akis);
    expect(akis.olay('esya-verildi', ESYA_ADIMI.kuzu)?.ad).toBe('s3-kuzu-al');
    const g: string[] = [];
    for (let i = 0; i < 4000 && !akis.bitti; i++) akis.ilerlet(16).forEach(a => g.push(a.ad));
    expect(g).toEqual(['s3-kuzu-soz', 's3-sira', 's3-davet']);
    expect(akis.bitti).toBe(true);
  });
  it('kitap ve top kısa tepkiden sonra rafa döner; Kuzu verilmeden sahne bitmez', () => {
    const akis = yeni();
    rafaKadar(akis);
    expect(akis.olay('esya-verildi', ESYA_ADIMI.kitap)?.ad).toBe('s3-kitap-al');
    expect(rafaKadar(akis)).toEqual(['s3-kitap-soz', 's3-kitap-birak', 's3-kitap-yan', 's3-raf']);
    expect(akis.olay('esya-verildi', ESYA_ADIMI.top)?.ad).toBe('s3-top-al');
    expect(rafaKadar(akis)).toEqual(['s3-top-birak', 's3-top-soz', 's3-raf']);
    akis.ilerlet(120_000);
    expect(akis.adim?.ad).toBe('s3-raf');
    expect(akis.bitti).toBe(false);
  });
  it('yanına koyulan kitap ve top yerinde kalır; kitap okurken ağız görünmez', () => {
    expect(BEKLEME_ADIMLAR.find(a => a.ad === 's3-kitap-yan')!.katman!.yanKitap).toEqual({ poz: ESYA_CIZIMI.kitap });
    expect(BEKLEME_ADIMLAR.find(a => a.ad === 's3-top-soz')!.katman!.yanTop).toEqual({ poz: ESYA_CIZIMI.top });
    expect(BEKLEME_ADIMLAR.find(a => a.ad === 's3-kitap-soz')!.ses!.agiz).toBeNull();
    expect(BEKLEME_ADIMLAR.find(a => a.ad === 's3-top-soz')!.ses!.agiz).toBe('zipzip-ilis');
    expect(BEKLEME_ADIMLAR.find(a => a.ad === 's3-kuzu-soz')!.ses!.agiz).toBe('zipzip-saril');
  });
  it('süreyle biten adım, içindeki kayıt bitmeden bitmez (sonraki replik onu kesmesin)', () => {
    for (const [adimlar, ms] of [[KAPI_ADIMLAR, KAPI_KAYIT_MS], [BEKLEME_ADIMLAR, BEKLEME_KAYIT_MS]] as const) {
      for (const a of adimlar) if (a.ses && a.bitis.tur === 'sure') expect(a.bitis.ms, a.ad).toBeGreaterThanOrEqual((a.ses.gecikme ?? 0) + ms[a.ses.ad]);
    }
  });
  it('Kino’nun konuştuğu adımlar geniş planda', () => {
    for (const a of BEKLEME_ADIMLAR) if (a.ses?.kim === 'kino') expect(a.plan, a.ad).toBe('genis');
  });
  it('her replik bir adımda; altı kaydın hepsi kullanılıyor', () => {
    const kullanilanSes = BEKLEME_ADIMLAR.map(a => a.ses?.ad).filter((s): s is string => !!s);
    expect([...kullanilanSes].sort()).toEqual(BEKLEME_REPLIKLER.map(r => r.ad).sort());
  });
});

describe('Klinik kapısı ve bekleme odası · ses, söz, yerleşim', () => {
  it('kayıtlar ve efektler diskte', () => {
    for (const ad of [...KAPI_REPLIKLER.map(r => r.ad), ...KAPI_EFEKTLER, ...BEKLEME_REPLIKLER.map(r => r.ad), ...BEKLEME_EFEKTLER]) {
      expect(existsSync('assets/doktor/zipzip-diz/ses/' + ad + '.mp3'), ad).toBe(true);
    }
  });
  it('Kino emir vermez: yasak sözcük yok', () => {
    const YASAK = ['dokun', 'tıkla', 'bas', 'sürükle', 'yanlış', 'hatalı', 'çabuk', 'süre', 'kaybettin', 'aferin'];
    for (const r of [...KAPI_REPLIKLER, ...BEKLEME_REPLIKLER].filter(x => x.kim === 'kino')) {
      const sozcukler = r.metin.toLocaleLowerCase('tr').split(/[^a-zçğıöşü]+/);
      for (const y of YASAK) expect(sozcukler.includes(y), r.ad + ': ' + y).toBe(false);
      for (const y of ['şimdi şunu', 'hızlı ol']) expect(r.metin.toLocaleLowerCase('tr').includes(y), r.ad + ': ' + y).toBe(false);
    }
  });
  it('Zıpzıp’ın oturduğu nokta koltuğun oturağıyla aynı', () => {
    const k = Object.fromEntries(beklemeKatmanlari().map(x => [x.ad, x.kutu]));
    const zip = { x: k.zipzip.sol + 650 * BEKLEME_OLCEK, y: k.zipzip.ust + 1140 * BEKLEME_OLCEK };
    const koltuk = { x: k.koltuk.sol + 700 * BEKLEME_OLCEK, y: k.koltuk.ust + 520 * BEKLEME_OLCEK };
    expect(zip.x).toBeCloseTo(koltuk.x, 6);
    expect(zip.y).toBeCloseTo(koltuk.y, 6);
    expect(k.zipzip.ust + 1440 * BEKLEME_OLCEK).toBeCloseTo(k.koltuk.ust + 820 * BEKLEME_OLCEK, 6); // yer çizgisi
  });
  it('dokunma hedefleri telefonda en az 64 px', () => {
    const s = 844 / 1600; // telefon yatay: sahne ekranı kaplar
    const { tabela } = KAPI_YERLESIM;
    expect(Math.min(tabela.g, tabela.y) * KAPI_KAMERA.genis.olcek * s).toBeGreaterThanOrEqual(64);
    for (const r of Object.values(BEKLEME_YERLESIM.raf)) expect(Math.min(r.g, r.y) * BEKLEME_KAMERA.orta.olcek * s).toBeGreaterThanOrEqual(64);
    expect(2 * BEKLEME_YERLESIM.kucak.yaricap * BEKLEME_OLCEK * BEKLEME_KAMERA.orta.olcek * s).toBeGreaterThanOrEqual(64);
  });
  it('raf ve Zıpzıp orta planda, Kino geniş planda iPad ve telefonda görünür', () => {
    for (const [en, boy] of [[1024, 768], [844, 390]] as const) {
      const s = Math.max(en / 1600, boy / 900);
      const gor = { sol: (1600 - en / s) / 2, sag: (1600 + en / s) / 2, ust: (900 - boy / s) / 2, alt: (900 + boy / s) / 2 };
      const k = BEKLEME_KAMERA.orta;
      const kam = (x: number, y: number) => ({ x: (x - k.x) * k.olcek + 800, y: (y - k.y) * k.olcek + 450 });
      const noktalar = [
        ...Object.values(BEKLEME_YERLESIM.raf).flatMap(r => [kam(r.sol, r.ust), kam(r.sol + r.g, r.ust + r.y)]),
        kam(BEKLEME_YERLESIM.zipzipX + 130, BEKLEME_YERLESIM.yer), kam(BEKLEME_YERLESIM.zipzipX, BEKLEME_YERLESIM.yer - 1000 * BEKLEME_OLCEK),
        // Kino'nun konuştuğu adımlar geniş planda: orada baştan ayağa görünür
        { x: BEKLEME_YERLESIM.kinoX + 130, y: BEKLEME_YERLESIM.kinoYer }, { x: BEKLEME_YERLESIM.kinoX - 130, y: BEKLEME_YERLESIM.kinoYer - 1090 * BEKLEME_OLCEK },
      ];
      for (const p of noktalar) {
        expect(p.x, en + '×' + boy).toBeGreaterThanOrEqual(gor.sol); expect(p.x, en + '×' + boy).toBeLessThanOrEqual(gor.sag);
        expect(p.y, en + '×' + boy).toBeGreaterThanOrEqual(gor.ust); expect(p.y, en + '×' + boy).toBeLessThanOrEqual(gor.alt);
      }
    }
  });
});
