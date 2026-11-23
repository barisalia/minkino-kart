import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import {
  ALETLER, ALET_SIRASI, ASAMALAR, BULMA_MS, DIKENLER, DIKEN_BOYU, DIKEN_ESIGI, EFEKTLER, HUB, KOPUK_MS, MIKROPLAR, OPAK, SAHNE, SERIT_YUVALARI, SOZLER, SPREY_MENZILI,
  SECMELI_DOSYALAR, TUVAL, VAKA_DOSYALAR, YAKIN, ZORLUK, asamaAleti, beklemeKaresi, bulmaAdimi, dikenCekisi, dikenUcu, kopukAdimi, mercekCapi, sahneOlcegi, sargiAdimi,
  sargiBaslangici, sargiOrani, sevincKaresi, sonrakiAsama, damlaUret, tepsideMi, yuzIfadesi, AYY_MS, KIKIR_MS, ELDE_OLCEK, KACIS_EN, KACIS_MENZILI, ZIPLAMA_MS, DIKEN_GERILME, KOPUK_DOLU, KOPUK_HUCRE, OVMA_KARE_SINIRI, SARGI_EGIMI, SARGI_KOL, SU_YERCEKIMI, dikenGerilmesi, dikenYayi, izgaraDolular, izgaraEkle, izgaraMiktar, izgaraSil, kopukIzgarasi, ovmaAdimi, sargiKenari, sicramaUret, suAdimi, BANT_DUGMESI, DOK_ALET_BOYU, EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, KAPANIS, KOL_DUGMESI, SERIT_YUVA_BOYU, TEKRAR_BOYU, kacisHedefi, kinoYakinPozu, ziplamaKaresi, type Nokta,
} from '../../doktor/src/vaka/veri';

// Minik Doktor · "Zıpzıp'ın Dikenli Patisi" (Barış'ın 22 Kasım'da seçtiği yön). Çizim adları ve ölçüleri Astra'ya yazılan
// Paket Doktor-Y1 brief'iyle karşılaştırılır; mekaniklerin saf hesabı sınanır.

const tum = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
const bas = tum.indexOf('Paket Doktor-Y1 · "Zıpzıp\'ın Dikenli Patisi"');
const brief = tum.slice(bas, tum.indexOf('\n## ', bas + 10));

describe('Paket Doktor-Y1: çizim adları ve ölçüler brief\'le birebir', () => {
  it('29 çizim, hepsi bir kez', () => {
    expect(VAKA_DOSYALAR).toHaveLength(29);
    expect(new Set(VAKA_DOSYALAR).size).toBe(29);
    expect(Object.keys(TUVAL).sort()).toEqual([...VAKA_DOSYALAR, ...SECMELI_DOSYALAR].sort());
    // seçmeli beş çizim (yöneticinin 15:28 eki) Astra dosyasındaki ek brief'te
    const ek = tum.slice(tum.indexOf('Paket Doktor-Y1 eki: yöneticinin 15:28'));
    // (yakın plandaki dört yüz 18:13 ölçü kaydında)
    for (const ad of SECMELI_DOSYALAR) expect(ek, ad).toContain('`' + ad + '`');
    const yakinEk = tum.slice(tum.indexOf('yakın plan güçlendirme: ölçüler'));
    expect(yakinEk).toContain('640 × 460'); expect(yakinEk).toContain('SOL ÜSTTEN');
    expect(ek).toContain('560 × 620'); expect(ek).toContain('(1488, 532)'); expect(ek).toContain('x 20…1520');
  });
  it('koddaki her ad brief\'te geçer; brief\'in oyun çizimleri kodda vardır', () => {
    expect(bas).toBeGreaterThan(0);
    const briefAdlari = new Set<string>();
    for (const m of brief.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)*)`/g)) briefAdlari.add(m[1]);
    for (const ad of VAKA_DOSYALAR) expect(briefAdlari.has(ad), ad).toBe(true);
    // brief'teki "→ ad, ad" teslim satırlarındaki adlar (anahtar kare dışında) kodda olmalı
    const teslim = [...brief.matchAll(/^### Çağrı (?!0).*→ (.+)$/gm)].flatMap(m => [...m[1].matchAll(/`([a-z0-9-]+)`/g)].map(x => x[1]));
    const acik = teslim.flatMap(a => (a.endsWith('-') ? [] : [a]));
    for (const ad of acik) expect(VAKA_DOSYALAR, ad).toContain(ad);
    expect(acik.length).toBeGreaterThanOrEqual(26);
  });
  it('tuval boyutları brief\'te yazanlarla aynı', () => {
    for (const boyut of ['2048 × 1152', '1000 × 940', '640 × 860', '600 × 600', '300 × 300', '200 × 80', '360 × 150', '1500 × 190']) expect(brief, boyut).toContain(boyut);
    expect(TUVAL['zipzip-uzgun-0']).toEqual([1000, 940]); expect(TUVAL['canta-acik']).toEqual([640, 860]); expect(TUVAL.diken).toEqual([200, 80]);
    expect(OPAK).toEqual(['hub-fon', 'yakin-fon']);
  });
  it('yerleşim noktaları bağlanmış çizimlerde ölçülen yerlerde (doktor/araclar/y1-bagla.ts)', () => {
    // brief'teki sayılar hedefti; çizimler tuvale oturtulunca noktalar çizimden ölçüldü
    expect(HUB.pati).toEqual({ x: HUB.zipzip.sol + 829, y: HUB.zipzip.ust + 454 });       // uzanan patinin ortası
    expect(HUB.sargi).toEqual({ x: HUB.zipzip.sol + 750, y: HUB.zipzip.ust + 455 });      // sevinç pozundaki sargının ortası
    expect(HUB.yuvalar).toEqual([[202, 472], [437, 472], [202, 673], [437, 673]]);         // açık çantadaki mavi yuvalar
    expect(MIKROPLAR.map(m => [m.x, m.y])).toEqual([[592, 514], [911, 583], [240, 584]]);  // kol-camurlu'daki leke merkezleri
    expect(SERIT_YUVALARI.map(y => y[0])).toEqual([219, 573, 926, 1281]);                  // şeritteki dört yuva
    expect([YAKIN.sargi.sol, YAKIN.sargi.sag]).toEqual([560, 1006]);                        // sargi-sarili'nin kapladığı aralık
    // dikenlerin battığı yerler sargının altında kalır
    for (const d of DIKENLER) { expect(d.x).toBeGreaterThan(YAKIN.sargi.sol); expect(d.x).toBeLessThan(YAKIN.sargi.sag); }
    // küçük yaşta oynanan ilk iki mikrop ekranın ortasına yakın olanlar
    expect(MIKROPLAR[0].x).toBeGreaterThan(300); expect(MIKROPLAR[1].x).toBeGreaterThan(300);
    // büyüteç en soldaki mikropta da ekranda kalır
    for (const m of MIKROPLAR) expect(m.x - (303 / 600) * ALETLER.buyutec.boy / 2).toBeGreaterThan(0);
  });
  it('aletlerin ucu çizimde: büyütecin camı (300, 230), spreyin ağzı (150, 110), cımbızın ucu (300, 40)', () => {
    expect(ALETLER.buyutec.uc).toEqual([0.5, 230 / 600]);
    expect(ALETLER.sprey.uc).toEqual([150 / 600, 110 / 600]);
    expect(ALETLER.cimbiz.uc).toEqual([0.5, 40 / 600]);
    expect(ALET_SIRASI).toEqual(['buyutec', 'sprey', 'cimbiz', 'sargi']);
    // mercek çerçevenin içinde kalır (bağlanmış çizimde cam çapı 261, çerçevenin dışı 303)
    expect(mercekCapi(ALETLER.buyutec.boy)).toBeCloseTo((261 / 600) * ALETLER.buyutec.boy);
    expect(mercekCapi(600)).toBeLessThan(303);
  });
});

describe('yerleşim: her şey sahnede ve birbirine girmiyor', () => {
  const icinde = (k: { sol: number; ust: number; g: number; y: number }) => k.sol >= 0 && k.ust >= 0 && k.sol + k.g <= SAHNE.g && k.ust + k.y <= SAHNE.y;
  it('masa: çanta, Zıpzıp ve şerit sahnenin içinde; şerit çantanın altında', () => {
    expect(icinde(HUB.canta)).toBe(true); expect(icinde(HUB.zipzip)).toBe(true); expect(icinde(HUB.serit)).toBe(true);
    expect(HUB.serit.ust).toBeGreaterThanOrEqual(HUB.canta.ust + HUB.canta.y);
    expect(HUB.zipzip.sol + 272).toBeGreaterThanOrEqual(HUB.canta.sol + HUB.canta.g);   // Zıpzıp'ın çizimi tuvalde x 272'den başlar
    // Kino sağ alt köşede: beli ekranın alt kenarında, şeridin sağında
    expect(HUB.kino.ust + HUB.kino.y).toBeGreaterThanOrEqual(SAHNE.y); expect(HUB.kino.sol + HUB.kino.g).toBe(SAHNE.g);
    // Kino'nun başı (tuvalde kulaklar x 90…630) şeridin sağında; yalnız işaret eden patisi şeride yaklaşır
    expect(HUB.kino.sol + 90).toBeGreaterThanOrEqual(HUB.serit.sol + HUB.serit.g - 40);
  });
  it('yakın plan: mikroplar ve dikenler ön kolda, alet şeridinin üstünde, tepsinin solunda', () => {
    for (const m of MIKROPLAR) { expect(m.x).toBeGreaterThan(YAKIN.kol.sol); expect(m.x).toBeLessThan(YAKIN.kol.sol + YAKIN.kol.g); expect(m.y + m.boy / 2).toBeLessThan(YAKIN.serit.ust); }
    for (const d of DIKENLER) {
      expect(d.x).toBeGreaterThan(YAKIN.kol.sol); expect(d.x).toBeLessThan(YAKIN.tepsi.sol);
      const uc = dikenUcu(d);
      expect(uc.y).toBeGreaterThan(40); expect(uc.y).toBeLessThan(YAKIN.serit.ust - 150);   // sahnede, alet şeridinin üstünde
      expect(uc.y < YAKIN.kol.ust + 70 || uc.y > YAKIN.kol.ust + YAKIN.kol.y - 70).toBe(true); // tutulacak uç kolun dışında (üstünde ya da altında)
      expect(Math.hypot(uc.x - d.x, uc.y - d.y)).toBeCloseTo(DIKEN_BOYU);
    }
    // dikenlerin tutulacak uçları birbirine karışmayacak kadar uzak (her yaşta, o yaşta oynanan dikenler için)
    for (const z of Object.values(ZORLUK)) {
      const uclar = DIKENLER.slice(0, z.diken).map(d => dikenUcu(d));
      for (let i = 0; i < uclar.length; i++) for (let k = i + 1; k < uclar.length; k++) expect(Math.hypot(uclar[i].x - uclar[k].x, uclar[i].y - uclar[k].y)).toBeGreaterThan(2 * z.cimbizKilidi);
    }
    for (const y of YAKIN.tepsiYerleri) expect(tepsideMi(y)).toBe(true);
  });
  it('sahne ekrana sığar; iPad ve telefonda taşmaz, ortalanır', () => {
    for (const [en, boy] of [[1024, 768], [844, 390], [1280, 720]] as const) {
      const o = sahneOlcegi(en, boy);
      expect(SAHNE.g * o.s).toBeLessThanOrEqual(en + 0.01); expect(SAHNE.y * o.s).toBeLessThanOrEqual(boy + 0.01);
      expect(o.sol).toBeCloseTo((en - SAHNE.g * o.s) / 2); expect(o.ust).toBeCloseTo((boy - SAHNE.y * o.s) / 2);
      // dokunma hedefleri: şeritteki alet ve mikrop en az 44 px
      expect(140 * o.s, `${en}×${boy} alet`).toBeGreaterThanOrEqual(44);
      expect(2 * ZORLUK['5+'].mercekYaricapi * o.s, `${en}×${boy} mercek`).toBeGreaterThanOrEqual(64);
    }
  });
});

describe('akış ve yaş basamakları', () => {
  it('aşamalar sırayla; yakın plandaki dört aşamanın kendi aleti var', () => {
    expect(ASAMALAR).toEqual(['gelis', 'giris', 'canta', 'lavabo', 'gogus', 'buyutec', 'sprey', 'cimbiz', 'pamuk', 'sargi', 'bant', 'defter', 'kutlama', 'son']);
    expect(sonrakiAsama('giris')).toBe('canta'); expect(sonrakiAsama('son')).toBe('son');
    expect(ASAMALAR.map(asamaAleti)).toEqual([null, null, null, null, null, 'buyutec', 'sprey', 'cimbiz', null, 'sargi', null, null, null, null]);
  });
  it('küçük yaşta daha az iş ve daha geniş hedef', () => {
    expect(ZORLUK['2-3'].mikrop).toBeLessThan(ZORLUK['5+'].mikrop); expect(ZORLUK['2-3'].diken).toBeLessThan(ZORLUK['5+'].diken);
    expect(ZORLUK['2-3'].mercekYaricapi).toBeGreaterThan(ZORLUK['5+'].mercekYaricapi); expect(ZORLUK['2-3'].cimbizKilidi).toBeGreaterThan(ZORLUK['5+'].cimbizKilidi);
    for (const z of Object.values(ZORLUK)) { expect(z.mikrop).toBeLessThanOrEqual(MIKROPLAR.length); expect(z.diken).toBeLessThanOrEqual(DIKENLER.length); }
  });
  it('sözlerde emir yok; her sözün ve efektin kaydı var', () => {
    for (const metin of Object.values(SOZLER)) expect(metin).not.toMatch(/\b(dokun|bas|tut|sür|sürükle|çek|seç|yap)\b/i);
    for (const ad of [...Object.keys(SOZLER), ...EFEKTLER]) expect(existsSync(`assets/doktor/vaka/ses/${ad}.mp3`), ad).toBe(true);
  });
  it('bekleme döngüsü sakin: iki poz arasında gidip gelir, arada 140 ms göz kırpar', () => {
    const kareler = Array.from({ length: 360 }, (_, i) => beklemeKaresi(i * 10));
    expect(kareler.filter(k => k === 'kirp')).toHaveLength(14);
    let degisim = 0; for (let i = 1; i < kareler.length; i++) if (kareler[i] !== kareler[i - 1]) degisim++;
    expect(degisim).toBeLessThanOrEqual(9);                         // 3,6 saniyede en çok dokuz kare değişimi: titreme yok
    expect(sevincKaresi(0)).toBe(0); expect(sevincKaresi(250)).toBe(1); expect(sevincKaresi(500)).toBe(0);
  });
});

describe('yakın plandaki yüz', () => {
  const d = { asama: 'buyutec' as const, kilitli: false, ayyKalan: 0, kikirKalan: 0 };
  it('dikende "ay", köpükte kıkır, dikenler bitince rahat; kalan zamanda endişeli', () => {
    expect(yuzIfadesi(d)).toBe('endise');
    expect(yuzIfadesi({ ...d, asama: 'cimbiz' })).toBe('endise');
    expect(yuzIfadesi({ ...d, asama: 'cimbiz', kilitli: true })).toBe('ayy');
    expect(yuzIfadesi({ ...d, asama: 'cimbiz', ayyKalan: AYY_MS })).toBe('ayy');
    expect(yuzIfadesi({ ...d, asama: 'sprey' })).toBe('endise');
    expect(yuzIfadesi({ ...d, asama: 'sprey', kikirKalan: KIKIR_MS })).toBe('kikir');
    for (const asama of ['sargi', 'bant', 'kutlama', 'son'] as const) expect(yuzIfadesi({ ...d, asama })).toBe('rahat');
    // başka aşamadan kalan sayaç ifadeyi bozmaz
    expect(yuzIfadesi({ ...d, asama: 'sargi', ayyKalan: 300, kikirKalan: 300 })).toBe('rahat');
  });
  it('yüz sol üstte, dikenlerin uçları yüzün sağında', () => {
    expect(YAKIN.yuz).toEqual({ sol: 0, ust: 0, g: 640, y: 460 });
    for (const dk of DIKENLER) { const uc = dikenUcu(dk); expect(uc.x).toBeGreaterThan(650); expect(uc.x).toBeLessThan(YAKIN.tepsi.sol - 300); }
  });
});

describe('mekanikler', () => {
  it('mikrop: mercek üstünde kalınca bulunur; uzaklaşınca birikim geri gider', () => {
    let b = 0;
    for (let t = 16; t < BULMA_MS; t += 16) b = bulmaAdimi(b, 60, 110, 16);
    expect(b).toBeLessThan(BULMA_MS);
    b = bulmaAdimi(b, 60, 110, 16);
    expect(b).toBe(BULMA_MS);
    expect(bulmaAdimi(100, 400, 110, 16)).toBe(68);
    expect(bulmaAdimi(10, 400, 110, 16)).toBe(0);
  });
  it('köpük: yalnız menzildeyken birikir, dolunca durur', () => {
    expect(kopukAdimi(0, SPREY_MENZILI + 1, 16)).toBe(0);
    expect(kopukAdimi(0, SPREY_MENZILI, 16)).toBe(16);
    expect(kopukAdimi(KOPUK_MS - 4, 10, 16)).toBe(KOPUK_MS);
  });
  it('diken: ekseni boyunca çekilince önce direnir, eşiği geçince çıkar; yana çekmek çıkarmaz', () => {
    const d = DIKENLER[0], uc = dikenUcu(d);
    const yon = (k: number): Nokta => { const r = (d.aci * Math.PI) / 180; return { x: uc.x + Math.cos(r) * k, y: uc.y + Math.sin(r) * k }; };
    expect(dikenCekisi(d, uc, uc)).toEqual({ cekis: 0, kayma: 0, cikti: false });
    const yari = dikenCekisi(d, uc, yon(DIKEN_ESIGI / 2));
    expect(yari.cikti).toBe(false); expect(yari.kayma).toBeGreaterThan(0); expect(yari.kayma).toBeLessThan(DIKEN_ESIGI / 2);   // direnç: parmaktan az kayar
    expect(dikenCekisi(d, uc, yon(DIKEN_ESIGI + 1)).cikti).toBe(true);
    expect(dikenCekisi(d, uc, yon(-80)).cekis).toBe(0);                                                                          // içeri itmek çekmez
    const r = ((d.aci + 90) * Math.PI) / 180;
    expect(dikenCekisi(d, uc, { x: uc.x + Math.cos(r) * 200, y: uc.y + Math.sin(r) * 200 }).cikti).toBe(false);                 // yana çekiş
  });
  it('sargı: kolun çevresinde üç tur dönünce biter; yarım turda yarısı değil, oranı kadar', () => {
    const m = YAKIN.sargi;
    let d = sargiBaslangici();
    const don = (tur: number, yaricap = 230) => { for (let i = 0; i <= 40 * tur; i++) { const a = (i / 40) * Math.PI * 2; d = sargiAdimi(d, { x: m.x + Math.cos(a) * yaricap, y: m.y + Math.sin(a) * yaricap }); } };
    don(1);
    expect(d.toplam).toBeGreaterThan(0.95); expect(d.toplam).toBeLessThan(1.6);
    expect(sargiOrani(d.toplam, 3)).toBeLessThan(0.6);
    don(2);
    expect(sargiOrani(d.toplam, 3)).toBe(1);
    // ekranın öbür ucunda çevrilen daire sarmaz
    let uzak = sargiBaslangici();
    for (let i = 0; i <= 80; i++) { const a = (i / 40) * Math.PI * 2; uzak = sargiAdimi(uzak, { x: 1800 + Math.cos(a) * 40, y: 150 + Math.sin(a) * 40 }); }
    expect(uzak.toplam).toBeLessThan(0.2);
  });
  it('sargı: kolun üstünden karşıya ileri geri geçmek de sarar (küçük çocuk hareketi)', () => {
    const m = YAKIN.sargi;
    let d = sargiBaslangici();
    for (let k = 0; k < 6; k++) for (let i = 0; i <= 10; i++) d = sargiAdimi(d, { x: m.x + (k % 2 ? 20 : -20), y: m.y + (k % 2 ? 1 : -1) * (200 - i * 40) });
    expect(sargiOrani(d.toplam, 3)).toBeGreaterThan(0.6);
  });
  it('mikrop mercekten kaçmaya çalışır: yaklaşınca öbür yana kayar, sınırı aşmaz, bulmayı zorlaştırmaz', () => {
    const m = MIKROPLAR[0], R = ZORLUK['5+'].mercekYaricapi;
    expect(kacisHedefi(m, null, R)).toEqual({ x: 0, y: 0 });                                              // mercek elde değil
    expect(kacisHedefi(m, { x: m.x - R * KACIS_MENZILI - 1, y: m.y }, R)).toEqual({ x: 0, y: 0 });        // uzakta: kıpırdamaz
    const soldan = kacisHedefi(m, { x: m.x - R, y: m.y }, R), sagdan = kacisHedefi(m, { x: m.x + R, y: m.y }, R);
    expect(soldan.x).toBeGreaterThan(20); expect(sagdan.x).toBeLessThan(-20);                             // mercekten uzağa
    const yakin = kacisHedefi(m, { x: m.x - 30, y: m.y }, R);
    expect(yakin.x).toBeGreaterThan(soldan.x);                                                            // yaklaştıkça daha çok
    for (let a = 0; a < 12; a++) for (const u of [0, 10, 60, 120, 200]) {
      const k = kacisHedefi(m, { x: m.x + Math.cos(a) * u, y: m.y + Math.sin(a) * u }, R, { x: 30, y: 0 });
      expect(Math.hypot(k.x, k.y)).toBeLessThanOrEqual(KACIS_EN + 0.001);
      expect(Math.abs(k.y)).toBeLessThanOrEqual(KACIS_EN * 0.45 + 0.001);                                 // enine az: kolun üstünde kalır
    }
    // mercek tam üstündeyken yön, o ana kadarki kaçış yönüdür (sıçramaz)
    expect(kacisHedefi(m, { x: m.x, y: m.y }, R, { x: -20, y: 0 }).x).toBeLessThan(0);
    // kaçış camın içinde kalır: kayma, mikrobun yarısından küçük (cam tam üstündeyken mikrop camdan çıkmaz)
    expect(KACIS_EN).toBeLessThan(m.boy / 2);
  });
  it('yakın plan: alet şeridi solda, Kino sağ altta; ikisi çakışmaz, Kino tepsinin altında', () => {
    const k = YAKIN.kino, s = YAKIN.serit;
    expect(s.sol).toBeGreaterThanOrEqual(0); expect(s.sol + s.g).toBeLessThanOrEqual(SAHNE.g);
    // Kino'nun kulakları tuvalin 0,14–0,98'i arasında (bağlamada kulak eni 540 / 640, eksen 360)
    const kulakSol = k.sol + (k.g * (360 - 270)) / 640;
    expect(kulakSol).toBeGreaterThanOrEqual(s.sol + s.g);                                                  // şeridin sağında
    expect(k.ust + (k.y * 20) / 620).toBeGreaterThanOrEqual(824);                                         // başın tepesi tepsinin alt kenarından aşağıda
    expect(k.g / k.y).toBeCloseTo(640 / 620, 2);                                                           // çizimin oranı bozulmaz
    expect(k.ust + k.y * 0.55).toBeLessThan(SAHNE.y);                                                      // yüzü ekranda
    expect(kinoYakinPozu({ tepki: null, kilitli: false, mercekte: false })).toBe('izler');
    expect(kinoYakinPozu({ tepki: null, kilitli: true, mercekte: false })).toBe('sasir');
    expect(kinoYakinPozu({ tepki: null, kilitli: false, mercekte: true })).toBe('sasir');
    expect(kinoYakinPozu({ tepki: 'sevin', kilitli: true, mercekte: true })).toBe('sevin');
  });
  it('elde alet biraz büyür; kutlamada zıplayışın havadaki bölümünde ikinci sevinç karesi görünür', () => {
    expect(ELDE_OLCEK).toBeGreaterThan(1); expect(ELDE_OLCEK).toBeLessThanOrEqual(1.08);
    expect(ziplamaKaresi(0)).toBe(0); expect(ziplamaKaresi(ZIPLAMA_MS * 0.45)).toBe(1); expect(ziplamaKaresi(ZIPLAMA_MS * 0.95)).toBe(0);
    expect(ziplamaKaresi(ZIPLAMA_MS * 3.45)).toBe(1);
  });
  it('kapanış kısa: bant yapıştıktan en çok 2 sn sonra "yeniden oyna" hazır', () => {
    expect(KAPANIS.bekleme + KAPANIS.kamera + KAPANIS.sevinc).toBeLessThanOrEqual(2000);
    expect(KAPANIS.sevinc).toBeGreaterThanOrEqual(ZIPLAMA_MS * 2);                                         // en az iki zıplayış görülür
  });
  it('dokunma hedefleri en küçük yatay telefonda da 64 pikselden küçük değil', () => {
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    for (const kenar of [DOK_ALET_BOYU, BANT_DUGMESI[1], BANT_DUGMESI[0], KOL_DUGMESI[0], KOL_DUGMESI[1], TEKRAR_BOYU, HUB.canta.g]) expect(kenar * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(BANT_DUGMESI[0]).toBeLessThanOrEqual(SERIT_YUVA_BOYU[0]);                                       // bant kutuları yan yana çakışmaz
    expect(SERIT_YUVALARI[1][0] - SERIT_YUVALARI[0][0]).toBeGreaterThanOrEqual(BANT_DUGMESI[0]);
  });
});

describe('gerçek his: parmağın yolu sayılır, iz bırakır', () => {
  it('köpükle ovma: gezdirmek yerinde tutmaktan çok daha hızlı; uzakta sayılmaz; bir sıçrayış işi bitirmez', () => {
    for (const yas of ['2-3', '4', '5+'] as const) {
      const hedef = ZORLUK[yas].ovma;
      let tutarak = 0, ms = 0;
      while (tutarak < hedef && ms < 20000) { tutarak = ovmaAdimi(tutarak, 10, 0, 16, hedef); ms += 16; }
      expect(ms).toBeGreaterThan(2000); expect(ms).toBeLessThan(6000);                                   // tutarak da biter, ama yavaş
      let ovarak = 0, ms2 = 0;
      while (ovarak < hedef && ms2 < 20000) { ovarak = ovmaAdimi(ovarak, 10, 0.6 * 16, 16, hedef); ms2 += 16; }   // 600 px/sn ovma
      expect(ms2).toBeLessThan(ms / 2.5); expect(ms2).toBeGreaterThan(450);
    }
    expect(ZORLUK['2-3'].ovma).toBeLessThan(ZORLUK['4'].ovma); expect(ZORLUK['4'].ovma).toBeLessThan(ZORLUK['5+'].ovma);
    expect(ovmaAdimi(100, SPREY_MENZILI + 1, 50, 16, 900)).toBe(100);
    expect(ovmaAdimi(0, 10, 5000, 16, 900)).toBeLessThanOrEqual(OVMA_KARE_SINIRI + 16);
    expect(ovmaAdimi(895, 10, 50, 16, 900)).toBe(900);
  });
  it('köpük ızgarası: birikir, bir yere en çok üç öbek, silinince azalır, köpüklü yerler sıralanır', () => {
    const iz = kopukIzgarasi(), p = { x: 600, y: 520 };
    expect(izgaraMiktar(iz, p, 1)).toBe(0); expect(izgaraDolular(iz)).toEqual([]);
    for (let i = 1; i <= KOPUK_DOLU; i++) expect(izgaraEkle(iz, p)).toBe(i);
    expect(izgaraMiktar(iz, p, 1)).toBe(KOPUK_DOLU);
    izgaraEkle(iz, { x: p.x + KOPUK_HUCRE, y: p.y });
    expect(izgaraMiktar(iz, p, 150)).toBe(KOPUK_DOLU + 1);                                               // çevresiyle birlikte
    expect(izgaraMiktar(iz, { x: 1800, y: 100 }, 150)).toBe(0);
    expect(izgaraDolular(iz)).toHaveLength(2);
    izgaraSil(iz, p, 40, 0.5);
    expect(izgaraMiktar(iz, p, 1)).toBeCloseTo(KOPUK_DOLU / 2);                                          // yarım güçle yarıya iner
    izgaraSil(iz, p, 200, 1);
    expect(izgaraDolular(iz)).toEqual([]);
    expect(izgaraEkle(iz, { x: -5, y: 10 })).toBe(0);                                                    // sahne dışı sayılmaz
  });
  it('su damlaları: yukarı sıçrar, yerçekimiyle düşer, ömrü bitince kaybolur', () => {
    let n = 0; const sabit = () => [0.5, 0.9, 0.1, 0.5, 0.5][n++ % 5];
    let d = sicramaUret({ x: 1000, y: 700 }, 6, sabit);
    expect(d).toHaveLength(6);
    for (const p of d) { expect(p.vy).toBeLessThan(0); expect(p.boy).toBeGreaterThan(10); }
    const y0 = d[0].y; d = suAdimi(d, 50);
    expect(d[0].y).toBeLessThan(y0);                                                                      // önce yükselir
    for (let i = 0; i < 6; i++) d = suAdimi(d, 50);
    expect(d.every(p => p.vy > 0 || p.omur <= 0) || d.length < 6).toBe(true);                             // sonra düşer
    for (let i = 0; i < 20; i++) d = suAdimi(d, 50);
    expect(d).toEqual([]);
    expect(SU_YERCEKIMI).toBeGreaterThan(0);
  });
  it('tek damla (ıslak pamuktan): olduğu yerden dümdüz aşağı düşer, hızlanır, kaybolur', () => {
    let d = [damlaUret({ x: 800, y: 500 }, () => 0.5)];
    expect(d[0]).toMatchObject({ x: 800, y: 500, vx: 0 });
    d = suAdimi(d, 100); const y1 = d[0].y, v1 = d[0].vy;
    d = suAdimi(d, 100);
    expect(d[0].x).toBe(800); expect(y1).toBeGreaterThan(500); expect(d[0].y - y1).toBeGreaterThan(y1 - 500); expect(d[0].vy).toBeGreaterThan(v1);
    for (let i = 0; i < 6; i++) d = suAdimi(d, 100);
    expect(d).toEqual([]);
  });
  it('diken: çekildikçe gerilir, çıkınca yay gibi titreyip durulur', () => {
    expect(dikenGerilmesi(0)).toBe(1);
    expect(dikenGerilmesi(DIKEN_ESIGI / 2)).toBeCloseTo(1 + DIKEN_GERILME / 2);
    expect(dikenGerilmesi(DIKEN_ESIGI * 3)).toBeCloseTo(1 + DIKEN_GERILME);
    expect(dikenYayi(0)).toBeGreaterThan(1.15);
    expect(Math.min(...Array.from({ length: 40 }, (_, i) => dikenYayi(i * 10)))).toBeLessThan(1);         // geri de teper
    expect(dikenYayi(500)).toBe(1);
  });
  it('sargının kenarı kolun üstünde bir yana, altında öbür yana yatar', () => {
    const k = sargiKenari(800, SARGI_EGIMI);
    const xAt = (y: number) => k.ust + ((k.alt - k.ust) * y) / SAHNE.y;
    expect(xAt(SARGI_KOL.ust)).toBeCloseTo(800 + SARGI_EGIMI); expect(xAt(SARGI_KOL.alt)).toBeCloseTo(800 - SARGI_EGIMI);
    const d = sargiKenari(800, 0);
    expect(d.ust).toBe(800); expect(d.alt).toBe(800);
  });
});
