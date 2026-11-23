import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { agizDizisi, agizIndeksi, agizKaresi, sesVarMi } from '../../doktor/src/once-kuzu/agiz';
import { Akis, EFEKTLER, KAYIT_MS, ONCE_KUZU, REPLIKLER, gorunumCizimleri, yazilanSure, type CocukOlayi } from '../../doktor/src/once-kuzu/akis';
import { AGIZ, DIZI, K1, K1_DOSYALAR, KIRPMA_MS, diziSuresi, kareSec, kirpiyorMu } from '../../doktor/src/once-kuzu/diziler';
import { Bekleme, Nabiz, atisAraligi, atisKazanci, kalpAyari, yakinlik } from '../../doktor/src/once-kuzu/kalp';
import { HEDEF, KAMERA, OLCEK, SAHNE, STETOSKOP, TUVAL, ekranOlcegi, kameradan, tuvalKutusu, tuvalNoktasi } from '../../doktor/src/once-kuzu/yerlesim';

// Minik Doktor · kanıt sahnesi "Önce Kuzu" (doktor/src/once-kuzu/): çizimler gelmeden doğrulanabilen her şey.
// Çizim adları Astra'ya yazılan Paket Doktor-K1 brief'iyle birebir olmalı; çizim klasöre düşünce kendiliğinden bağlanır.

/** Brief'in K1 bölümündeki dosya adları: `ad-0 … 5` aralıkları, `ad-0`, `-1` devamları ve tek adlar. */
function briefAdlari(): string[] | null {
  if (!existsSync('CLAUDE-ASTRA-MESAJLAR.md')) return null;
  const t = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
  const bas = t.indexOf('· Paket Doktor-K1 · kanıt sahnesi');
  if (bas < 0) return null;
  const son = t.indexOf('\n## ', bas);
  const bolum = t.slice(bas, son < 0 ? undefined : son);
  const adlar = new Set<string>();
  const kok = /^(zipzip-|kino-|stetoskop$|fon-muayene$|muayene-masasi$|perde-)/;
  let onceki = '';
  for (const m of bolum.matchAll(/`([^`]+)`/g)) {
    const s = m[1].trim();
    const aralik = s.match(/^([a-z-]+-)(\d+) … (\d+)$/);
    if (aralik && kok.test(aralik[1])) { for (let i = +aralik[2]; i <= +aralik[3]; i++) adlar.add(aralik[1] + i); onceki = aralik[1]; continue; }
    const devam = s.match(/^-(\d+)$/);
    if (devam && onceki) { adlar.add(onceki + devam[1]); continue; }
    if (/[/.… ]/.test(s) || !kok.test(s)) continue;
    adlar.add(s);
    const sayili = s.match(/^([a-z-]+-)\d+$/);
    onceki = sayili ? sayili[1] : '';
  }
  return [...adlar].sort();
}

describe('Önce Kuzu · çizim adları', () => {
  it('68 çizim, yinelenen yok', () => {
    expect(K1_DOSYALAR).toHaveLength(68);
    expect(new Set(K1_DOSYALAR).size).toBe(68);
    expect(K1_DOSYALAR.filter(a => a.startsWith('zipzip-') && !a.startsWith('zipzip-yakin-'))).toHaveLength(26);
    expect(K1_DOSYALAR.filter(a => a.startsWith('zipzip-yakin-'))).toHaveLength(16);
    expect(K1_DOSYALAR.filter(a => a.startsWith('kino-'))).toHaveLength(21);
  });
  it('adlar Astra brief’indeki adlarla birebir', () => {
    const brief = briefAdlari();
    if (!brief) return; // brief dosyası bu ortamda yoksa atlanır
    expect(brief).toEqual([...K1_DOSYALAR].sort());
  });
  it('ağız dizileri altışar çizim, sıra 0 kapalı … 5 gülümseme', () => {
    for (const d of Object.values(AGIZ)) { expect(d).toHaveLength(6); d.forEach((ad, i) => expect(ad.endsWith('-agiz-' + i)).toBe(true)); }
  });
  it('dizilerin ve akışın kullandığı her çizim pakette var', () => {
    const var_ = new Set(K1_DOSYALAR);
    for (const [ad, d] of Object.entries(DIZI)) {
      expect(d.kareler.length, ad).toBe(d.sureler.length);
      d.kareler.forEach(k => expect(var_.has(k), ad + ' → ' + k).toBe(true));
    }
    for (const a of ONCE_KUZU) for (const g of [a.zipzip, a.kino, a.yakin]) {
      gorunumCizimleri(g, n => DIZI[n].kareler).forEach(k => expect(var_.has(k), a.ad + ' → ' + k).toBe(true));
    }
  });
  it('orta plan pozları orta katmanda, yakın plan pozları yakın katmanda', () => {
    for (const a of ONCE_KUZU) {
      gorunumCizimleri(a.zipzip, n => DIZI[n].kareler).forEach(k => expect(k.startsWith('zipzip-') && !k.startsWith('zipzip-yakin-'), a.ad + ' ' + k).toBe(true));
      gorunumCizimleri(a.kino, n => DIZI[n].kareler).forEach(k => expect(k.startsWith('kino-'), a.ad + ' ' + k).toBe(true));
      gorunumCizimleri(a.yakin, n => DIZI[n].kareler).forEach(k => expect(k.startsWith('zipzip-yakin-'), a.ad + ' ' + k).toBe(true));
      if (a.yakin) expect(a.plan, a.ad).toBe('yakin');
    }
  });
});

describe('Önce Kuzu · poz dizileri', () => {
  it('tırmanış: pozlar sırayla, son pozda durur', () => {
    const d = DIZI['zipzip-tirman'];
    expect(kareSec(d, 0).kare).toBe('zipzip-tirman-0');
    expect(kareSec(d, 519).kare).toBe('zipzip-tirman-0');
    expect(kareSec(d, 520).kare).toBe('zipzip-tirman-1');
    expect(kareSec(d, diziSuresi(d) - 1).kare).toBe('zipzip-tirman-4');
    expect(kareSec(d, diziSuresi(d))).toMatchObject({ kare: 'zipzip-tirman-5', bitti: true });
    expect(kareSec(d, 99999).kare).toBe('zipzip-tirman-5');
  });
  it('hareket sürerken poz başına 520 ms’den uzun kalınmaz; geçiş pozları saniyede 6–12 poz aralığında', () => {
    for (const [ad, d] of Object.entries(DIZI)) d.sureler.forEach((s, i) => {
      if (s === 0) return;
      expect(s, ad + '[' + i + ']').toBeLessThanOrEqual(520);
      expect(s, ad + '[' + i + ']').toBeGreaterThanOrEqual(1000 / 12);
    });
  });
  it('sevinç dizisi son iki poz arasında döner', () => {
    const d = DIZI['zipzip-kuzu-kaldir'];
    const t = diziSuresi(d);
    expect(kareSec(d, t + 10).kare).toBe('zipzip-kuzu-kaldir-2');
    expect(kareSec(d, t + 270).kare).toBe('zipzip-kuzu-kaldir-3');
    expect(kareSec(d, t + 530).kare).toBe('zipzip-kuzu-kaldir-2');
    expect(kareSec(d, t + 530).bitti).toBe(false);
  });
  it('göz kırpma yaklaşık üç film karesi sürer', () => {
    expect(kirpiyorMu([450], 449)).toBe(false);
    expect(kirpiyorMu([450], 450)).toBe(true);
    expect(kirpiyorMu([450], 450 + KIRPMA_MS - 1)).toBe(true);
    expect(kirpiyorMu([450], 450 + KIRPMA_MS)).toBe(false);
  });
});

describe('Önce Kuzu · akış ve 12 kaydın zamanlaması', () => {
  const kayit = (ad: string) => KAYIT_MS[ad] ?? 0;
  const SIRA: CocukOlayi[] = ['steto-alindi', 'kuzu-dinlendi', 'gogse-degdi', 'kalp-tutuldu'];

  /** Sahneyi 16 ms adımlarla oynatır; çocuk beklenen eylemi beklemeMs sonra yapar. */
  function oynat(beklemeMs: number) {
    const akis = new Akis(ONCE_KUZU, kayit);
    const girilen: { ad: string; t: number }[] = [];
    let t = 0, cocukBas: number | null = null;
    const gir = (a: { ad: string }[]) => a.forEach(x => girilen.push({ ad: x.ad, t }));
    for (let i = 0; i < 20000 && !akis.bitti; i++) {
      gir(akis.ilerlet(16));
      t += 16;
      const a = akis.adim;
      if (a && a.bitis.tur === 'cocuk') {
        cocukBas ??= t;
        if (t - cocukBas >= beklemeMs) { const y = akis.olay(a.bitis.olay); if (y) gir([y]); cocukBas = null; }
      }
    }
    return { akis, girilen, t };
  }

  it('on iki replik sırayla, her biri bir kez çalar', () => {
    const { girilen, akis } = oynat(300);
    expect(akis.bitti).toBe(true);
    const calan = girilen.map(g => ONCE_KUZU.find(a => a.ad === g.ad)!.ses?.ad).filter((s): s is string => !!s);
    expect(calan).toEqual(REPLIKLER.map(r => r.ad));
    expect(new Set(calan).size).toBe(12);
  });
  it('kayıtlar ve efektler diskte', () => {
    for (const ad of [...REPLIKLER.map(r => r.ad), ...EFEKTLER]) expect(existsSync('assets/doktor/zipzip-diz/ses/' + ad + '.mp3'), ad).toBe(true);
    for (const a of ONCE_KUZU) a.efekt?.forEach(e => expect((EFEKTLER as readonly string[]).includes(e.ad), a.ad + ' ' + e.ad).toBe(true));
  });
  it('her replik bitmeden sonraki başlamaz; konuşan adım kaydın süresi kadar sürer', () => {
    const akis = new Akis(ONCE_KUZU, kayit);
    for (const a of ONCE_KUZU) {
      if (!a.ses) continue;
      if (a.bitis.tur === 'ses') expect(akis.adimSuresi(a), a.ad).toBeGreaterThanOrEqual((a.ses.gecikme ?? 0) + kayit(a.ses.ad));
      if (a.bitis.tur === 'sure') expect(a.bitis.ms, a.ad).toBeGreaterThanOrEqual((a.ses.gecikme ?? 0) + kayit(a.ses.ad));
    }
  });
  it('çocuğun eylemini bekleyen adım kendiliğinden geçmez; yanlış olay yok sayılır', () => {
    const akis = new Akis(ONCE_KUZU, kayit);
    akis.ilerlet(60_000);
    expect(akis.adim?.ad).toBe('k3-al');
    akis.ilerlet(60_000);
    expect(akis.adim?.ad).toBe('k3-al');
    expect(akis.olay('kalp-tutuldu')).toBeNull();
    expect(akis.olay('steto-alindi')?.ad).toBe('k3-kuzu');
    expect(akis.olay('steto-alindi')).toBeNull();
    expect(akis.olay('kuzu-dinlendi')?.ad).toBe('k3-davul');
  });
  it('çocuğun dört eylemi sırayla: stetoskobu al, Kuzu’yu dinle, göğse değdir, kalpte bekle', () => {
    expect(ONCE_KUZU.filter(a => a.bitis.tur === 'cocuk').map(a => (a.bitis as { olay: CocukOlayi }).olay)).toEqual(SIRA);
  });
  it('yazılan süre 30–36 sn; çocuk her eylemde 1,5 sn düşünürse sahne 45 sn’yi geçmez', () => {
    expect(yazilanSure()).toBeGreaterThanOrEqual(30_000);
    expect(yazilanSure()).toBeLessThanOrEqual(36_000);
    const { t } = oynat(1500);
    expect(t).toBeLessThanOrEqual(45_000);
  });
  it('planlar: geniş → orta → yakın → orta; her plan en az 2,5 sn', () => {
    const planlar: { plan: string; ms: number }[] = [];
    for (const a of ONCE_KUZU) {
      const ms = a.bitis.tur === 'cocuk' ? 0 : new Akis(ONCE_KUZU, kayit).adimSuresi(a);
      const son = planlar[planlar.length - 1];
      if (son && son.plan === a.plan) son.ms += ms; else planlar.push({ plan: a.plan, ms });
    }
    expect(planlar.map(p => p.plan)).toEqual(['genis', 'orta', 'yakin', 'orta']);
    planlar.forEach(p => expect(p.ms, p.plan).toBeGreaterThanOrEqual(2500));
  });
  it('dudakla konuşma yalnız ağız dizisi olan duruşlarda; saklanırken ağız görünmez', () => {
    for (const a of ONCE_KUZU) {
      if (!a.ses) continue;
      if (a.ses.agiz === 'kino-steto') expect(a.plan).not.toBe('yakin');
      if (a.ses.agiz === 'zipzip-yakin') expect(a.plan).toBe('yakin');
    }
    expect(ONCE_KUZU.find(a => a.ad === 'k2-soguk-mu')!.ses!.agiz).toBeNull();
    expect(ONCE_KUZU.find(a => a.ad === 'k3-kuzu-davul')!.ses!.agiz).toBeNull();
  });
  it('Kino emir vermez: yasak sözcük yok', () => {
    const YASAK = ['dokun', 'tıkla', 'bas', 'sürükle', 'şimdi şunu', 'yanlış', 'hatalı', 'hızlı ol', 'çabuk', 'süre', 'kaybettin', 'aferin'];
    for (const r of REPLIKLER.filter(x => x.kim === 'kino')) {
      const sozcukler = r.metin.toLocaleLowerCase('tr').split(/[^a-zçğıöşü]+/);
      for (const y of YASAK) {
        if (y.includes(' ')) expect(r.metin.toLocaleLowerCase('tr').includes(y), r.ad + ': ' + y).toBe(false);
        else expect(sozcukler.includes(y), r.ad + ': ' + y).toBe(false);
      }
    }
  });
});

describe('Önce Kuzu · stetoskop ve kalp', () => {
  it('kalbe yaklaştıkça atış sıklaşır ve yükselir', () => {
    expect(yakinlik(300, 300)).toBe(0);
    expect(yakinlik(0, 300)).toBe(1);
    expect(atisAraligi(1)).toBeLessThan(atisAraligi(0.5));
    expect(atisAraligi(0.5)).toBeLessThan(atisAraligi(0));
    expect(atisKazanci(1)).toBeGreaterThan(atisKazanci(0.2));
    expect(atisAraligi(1)).toBeGreaterThanOrEqual(400);
  });
  it('uzakta atış yok; yakında aralığa uyar', () => {
    const n = new Nabiz();
    expect(n.adim(0, 0)).toBeNull();
    expect(n.adim(10, 1)).toBe(1);
    expect(n.adim(10 + atisAraligi(1) - 1, 1)).toBeNull();
    expect(n.adim(10 + atisAraligi(1), 1)).toBe(1);
  });
  it('kalpte kesintisiz 2 sn (2–3 yaşta 1,2 sn); kalpten çıkınca sayaç sıfırlanır', () => {
    expect(kalpAyari(false).beklemeMs).toBe(2000);
    expect(kalpAyari(true).beklemeMs).toBe(1200);
    expect(kalpAyari(true).yaricap).toBeGreaterThan(kalpAyari(false).yaricap);
    const b = new Bekleme(2000);
    for (let i = 0; i < 100; i++) expect(b.adim(true, 16)).toBe(false); // 1,6 sn
    expect(b.adim(false, 16)).toBe(false);
    expect(b.oran).toBe(0);
    let tamam = 0;
    for (let i = 0; i < 200; i++) if (b.adim(true, 16)) tamam++;
    expect(tamam).toBe(1);
    expect(b.bitti).toBe(true);
  });
});

describe('Önce Kuzu · ağız', () => {
  const HIZ = 22050;
  const ses = (hz: number, ms: number, g: number) => Float32Array.from({ length: Math.round(HIZ * ms / 1000) }, (_, i) => g * Math.sin(2 * Math.PI * hz * i / HIZ));
  it('sessizlikte dinlenme ağzı, konuşurken açık ağız; indeks 0–5', () => {
    const x = new Float32Array([...new Float32Array(HIZ * 0.4), ...ses(900, 600, 0.4), ...new Float32Array(HIZ * 0.6)]);
    const d = agizDizisi(x, HIZ);
    expect(agizKaresi(d, 100, 5)).toBe(5);
    expect(agizKaresi(d, 100, 0)).toBe(0);
    expect([1, 2]).toContain(agizKaresi(d, 700));
    expect(sesVarMi(d, 700)).toBe(true);
    expect(sesVarMi(d, 100)).toBe(false);
    expect(agizKaresi(d, 99999, 5)).toBe(5);
    for (let t = 0; t < 1600; t += 10) { const i = agizKaresi(d, t); expect(i).toBeGreaterThanOrEqual(0); expect(i).toBeLessThanOrEqual(5); }
  });
  it('şekil → çizim sırası: kapalı 0, az 1, orta 2, yuvarlak 3, diş 4, gülümseme 5', () => {
    expect((['kapali', 'az', 'orta', 'yuvarlak', 'dis', 'gulumse'] as const).map(s => agizIndeksi(s, 5))).toEqual([0, 1, 2, 3, 4, 5]);
    expect(agizIndeksi('gulumse', 0)).toBe(0);
    expect(agizIndeksi(null, 0)).toBe(0);
  });
});

describe('Önce Kuzu · yerleşim', () => {
  it('Zıpzıp’ın oturduğu nokta masanın oturağıyla, bütün yer çizgileri birbiriyle aynı', () => {
    expect(tuvalNoktasi('zipzip', 650, 1020)).toEqual(tuvalNoktasi('masa', 1000, 420));
    const yer = tuvalNoktasi('zipzip', 650, TUVAL.zipzip.yer).y;
    expect(tuvalNoktasi('kino', 650, TUVAL.kino.yer).y).toBe(yer);
    expect(tuvalNoktasi('masa', 1000, TUVAL.masa.yer).y).toBe(yer);
    // tabure: Zıpzıp tuvalinde x 300–560, basamaklar y 1310 ve 1180; masa tuvalinde x 650–910, y 710 ve 580
    expect(tuvalNoktasi('zipzip', 430, 1310)).toEqual(tuvalNoktasi('masa', 780, 710));
    expect(tuvalNoktasi('zipzip', 430, 1180)).toEqual(tuvalNoktasi('masa', 780, 580));
  });
  it('Kino ve Zıpzıp aynı ölçekte; Kino biraz uzun', () => {
    expect(TUVAL.kino.olcek).toBe(TUVAL.zipzip.olcek);
    expect(1090 * OLCEK).toBeGreaterThan(1000 * OLCEK);
  });
  it('yakın plan sahnenin boyuna tam sığar ve ortalanır', () => {
    const k = tuvalKutusu('yakin');
    expect(k.ust).toBeCloseTo(0, 6);
    expect(k.y).toBeCloseTo(SAHNE.y, 6);
    expect(k.sol + k.g / 2).toBeCloseTo(SAHNE.g / 2, 6);
  });
  const EKRANLAR = { 'iPad yatay': [1024, 768], 'telefon yatay': [844, 390] } as const;
  it('orta planda iki karakter baştan ayağa iki ekranda da görünür', () => {
    for (const [ad, [en, boy]] of Object.entries(EKRANLAR)) {
      const g = ekranOlcegi(en, boy).gorunen;
      const noktalar = [
        tuvalNoktasi('kino', 650 - 330, TUVAL.kino.yer - 1090), tuvalNoktasi('kino', 650, TUVAL.kino.yer),
        tuvalNoktasi('zipzip', 650 + 330, 300), tuvalNoktasi('zipzip', 650, TUVAL.zipzip.yer),
      ].map(p => kameradan('orta', p));
      for (const p of noktalar) {
        expect(p.x, ad).toBeGreaterThanOrEqual(g.sol); expect(p.x, ad).toBeLessThanOrEqual(g.sol + g.g);
        expect(p.y, ad).toBeGreaterThanOrEqual(g.ust); expect(p.y, ad).toBeLessThanOrEqual(g.ust + g.y);
      }
    }
  });
  it('kalp ve göğüs alanı iki ekranda da görünür; dokunma hedefleri en az 64 px', () => {
    for (const [ad, [en, boy]] of Object.entries(EKRANLAR)) {
      const { s, gorunen: g } = ekranOlcegi(en, boy);
      const kalp = tuvalNoktasi('yakin', HEDEF.kalp.x, HEDEF.kalp.y);
      expect(kalp.x, ad).toBeGreaterThan(g.sol); expect(kalp.x, ad).toBeLessThan(g.sol + g.g);
      expect(kalp.y, ad).toBeGreaterThan(g.ust); expect(kalp.y, ad).toBeLessThan(g.ust + g.y);
      const gu = tuvalNoktasi('yakin', HEDEF.gogus.sol, HEDEF.gogus.ust), ga = tuvalNoktasi('yakin', HEDEF.gogus.sol + HEDEF.gogus.g, HEDEF.gogus.ust + HEDEF.gogus.y);
      expect(gu.y, ad).toBeGreaterThanOrEqual(g.ust); expect(ga.y, ad).toBeLessThanOrEqual(g.ust + g.y);
      // kalp noktası (çap), Kuzu'nun göğsü ve Kino'nun avucu (orta planda kamera büyütmesiyle)
      for (const kucuk of [false, true]) expect(2 * kalpAyari(kucuk).yaricap * s, ad).toBeGreaterThanOrEqual(64);
      expect(2 * HEDEF.kuzuGogus.yaricap * OLCEK * KAMERA.orta.olcek * s, ad).toBeGreaterThanOrEqual(64);
      expect(2 * HEDEF.kinoAvuc.yaricap * OLCEK * KAMERA.orta.olcek * s, ad).toBeGreaterThanOrEqual(64);
      // stetoskobun ucu parmağın altında kaybolmayacak kadar iri
      expect(STETOSKOP.ucCapi * STETOSKOP.boy.yakin * s, ad).toBeGreaterThanOrEqual(44);
    }
  });
  it('kalp tişörtün bize göre sağ yarısında ve göğüs alanının içinde', () => {
    expect(HEDEF.kalp.x).toBeGreaterThan(TUVAL.yakin.eksen);
    expect(HEDEF.kalp.x).toBeLessThan(HEDEF.gogus.sol + HEDEF.gogus.g);
    expect(HEDEF.kalp.y).toBeGreaterThan(HEDEF.gogus.ust);
    expect(HEDEF.kalp.y).toBeLessThan(HEDEF.gogus.ust + HEDEF.gogus.y);
  });
  it('K1 çizim sabitleri brief’teki tuvallerle aynı', () => {
    expect([TUVAL.zipzip.g, TUVAL.zipzip.y, TUVAL.zipzip.yer]).toEqual([1300, 1500, 1440]);
    expect([TUVAL.kino.g, TUVAL.kino.y, TUVAL.kino.yer]).toEqual([1300, 1600, 1540]);
    expect([TUVAL.masa.g, TUVAL.masa.y, TUVAL.masa.yer, TUVAL.masa.eksen]).toEqual([2000, 1000, 840, 1000]);
    expect([TUVAL.yakin.g, TUVAL.yakin.y, TUVAL.yakin.eksen]).toEqual([2048, 1536, 1024]);
    expect(K1.stetoskop).toBe('stetoskop');
  });
});
