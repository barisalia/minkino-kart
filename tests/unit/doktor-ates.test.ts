import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ADIMLAR, ALETLER, ALET_SIRASI, ASAMALAR, ATES, ATES_DOSYALAR, BAS, BEZ_ISINMA, EFEKTLER, ESKI_OKUMA, GOSTERGE, KAPANIS, KARE_MS, KASE, MASA, OPAK, ORTAK_DOSYALAR, ORTAK_EFEKTLER, SALLA_BEKLEME, SALLA_GENLIK, SOZLER, TEPSI, TORBA, TORBA_DUGMESI, TUVAL, ZORLUK,
  agizdaMi, alindaMi, asamaAleti, asamalar, bardakKademesi, basPozu, bezAdimi, bezIsindiMi, burukKaresi, burundaMi, daldirAdimi, eskiOkuma, icAdimi, kapakAdimi, kapakBaslangici, kaseUstundeMi, kizariklikIzgarasi, kizariklikOrani,
  olcAdimi, sallaAdimi, sallaBaslangici, sikAdimi, sonrakiAsama, sudaMi, tepedeMi, torbaKademesi, torbayaMi, yelpazeYuzdeMi, yunKademesi, yuzdeMi,
  type BasDurumu,
} from '../../doktor/src/vaka-ates/veri';
import { EFEKTLER as VAKA_EFEKTLER, EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, HUB, SAHNE, VAKA_DOSYALAR, YAKIN, sahneOlcegi } from '../../doktor/src/vaka/veri';
import { SOZLER as DIS_SOZLERI } from '../../doktor/src/dis/veri';

// Minik Doktor · üçüncü vaka "Bulut'un Ateşi" (doktor/src/vaka-ates/), sekiz adımlı elit sürüm (Barış'ın temel kuralı, 23 Kasım).
// Çizim adları, ölçüleri ve kare dizileri parça brief'iyle (ekip/senaryo/DOKTOR-Y3-Y4-PARCALAR.md) karşılaştırılır; mekaniklerin
// saf hesabı sınanır.

const tum = readFileSync('ekip/senaryo/DOKTOR-Y3-Y4-PARCALAR.md', 'utf8');
const bas = tum.indexOf('## Paket Doktor-Y3');
const brief = tum.slice(bas, tum.indexOf('\n## Paket Doktor-Y4') > 0 ? tum.indexOf('\n## Paket Doktor-Y4') : undefined);
const ortak = tum.slice(0, bas);

describe('Paket Doktor-Y3: çizim adları, ölçüler ve kare dizileri brief\'le birebir', () => {
  it('85 çizim, hepsi bir kez; her ad brief\'te geçer; tuvaller tam', () => {
    expect(bas).toBeGreaterThan(0);
    expect(ATES_DOSYALAR).toHaveLength(85);
    expect(new Set(ATES_DOSYALAR).size).toBe(85);
    for (const ad of ATES_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...ATES_DOSYALAR].sort());
    expect(brief).toContain('85 çizim');
    expect(OPAK).toEqual(['ates-fon']);
  });
  it('sayfa başına en çok 8 çizim; sayfaların toplamı 85; her sayfanın adları başlığında', () => {
    const sayfalar = [...brief.matchAll(/^### Sayfa \d+ · [^\n]*?\((\d+)[,)][^\n]*→ ([^\n]+)$/gm)];
    expect(sayfalar.length).toBe(13);
    for (const m of sayfalar) {
      const n = Number(m[1]);
      expect(n).toBeLessThanOrEqual(8);
      expect((m[2].match(/`[^`]+`/g) ?? []).length, m[0]).toBe(n);
    }
    expect(sayfalar.reduce((a, m) => a + Number(m[1]), 0)).toBe(85);
  });
  it('kare dizileri: her dizinin kareleri sıralı adlarla ve aynı tuvalde', () => {
    for (const d of [ATES.suHalkasi, ATES.sicrama, ATES.termometreSalla, ATES.termometreIsik, ATES.bezBuruk, ATES.buhar, ATES.buz, ATES.buzParilti, ATES.torba, ATES.citirti, ATES.soguk, ATES.bardak, ATES.kabarcik, ATES.ruzgar]) {
      d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i}$`)));
      expect(new Set(d.map(ad => TUVAL[ad].join('×'))).size).toBe(1);
    }
    expect(Object.keys(ATES.bas)).toHaveLength(14);
    for (const ad of Object.values(ATES.bas)) expect(TUVAL[ad]).toEqual([2048, 1152]);
    for (const k of Object.values(KARE_MS)) { expect(k).toBeGreaterThanOrEqual(60); expect(k).toBeLessThanOrEqual(200); }
  });
  it('Dikenli Pati\'den aynen kullanılanlar o pakette var ve ortak bölümde yazılı; adlar çakışmaz', () => {
    for (const ad of ORTAK_DOSYALAR) { expect(VAKA_DOSYALAR, ad).toContain(ad); expect(ortak, ad).toContain('`' + ad + '`'); }
    for (const ad of ATES_DOSYALAR) expect(VAKA_DOSYALAR, ad).not.toContain(ad);
  });
  it('yerleşim sayıları brief\'te yazanlarla aynı', () => {
    expect(brief).toContain('merkezi (900, 290)'); expect({ x: BAS.alin.x, y: BAS.alin.y }).toEqual({ x: 900, y: 290 });
    expect(brief).toContain('(690, 610) ve (1110, 610), yarıçap 150'); expect(BAS.yanaklar).toEqual([{ x: 690, y: 610 }, { x: 1110, y: 610 }]);
    expect(brief).toContain('Burun ucu: (900, 560)'); expect(BAS.burun).toEqual({ x: 900, y: 560 });
    expect(brief).toContain('Ağız: (900, 655)'); expect(BAS.agiz).toEqual({ x: 900, y: 655 });
    expect(brief).toContain('(880, 150)'); expect(BAS.tepe).toEqual({ x: 880, y: 150 });
    expect(brief).toContain('ortalar: (900, 300)'.replace('ortalar: ', 'merkezine ')); expect(BAS.bez).toEqual({ x: 900, y: 300 });
    expect(brief).toContain('x 40…440, y 370…770'); expect(KASE.kutu).toEqual({ sol: 40, ust: 370, g: 400, y: 400 });
    expect(brief).toContain('kâse çiziminde (200, 150)'); expect(KASE.yuz).toEqual({ x: KASE.kutu.sol + 200, y: KASE.kutu.ust + 150 });
    expect(brief).toContain('(1660, 220), (1860, 220), (1660, 370), (1860, 370)');
    expect(brief).toContain('x 1250…1570, y 450…770'); expect(TORBA.merkez.x - TORBA.boy / 2).toBe(1250); expect(TORBA.merkez.y - TORBA.boy / 2).toBe(450);
    expect(brief).toContain('merkezi (200, 70)'); expect(TORBA.agiz).toEqual({ x: TORBA.merkez.x, y: TORBA.merkez.y + (70 - 200) * (TORBA.boy / 400) });
    expect(brief).toContain('baş merkezi (560, 300), alın (560, 230), göğüs (560, 520)');
    expect(MASA.alin).toEqual({ x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 230 });
  });
  it('aletlerin ucu çizimdeki noktada', () => {
    expect(brief).toContain('ucu (300, 60)'); expect(ALETLER.termometre.uc).toEqual([0.5, 60 / 600]);
    expect(brief).toContain('x 272…328, y 190…430'); expect(GOSTERGE).toEqual({ sol: 272, ust: 190, g: 56, y: 240 });
    expect(brief).toContain('(300, 180) tutulan yer'); expect(ALETLER.bez.tut[1] * 600).toBe(180);
    expect(brief).toContain('Pipetin ucu (190, 60)'); expect(ALETLER.bardak.uc).toEqual([190 / 600, 60 / 600]);
    expect(brief).toContain('Sapın ucu (300, 560) tutulan yer; açık yelpazenin ortası (300, 240)'); expect(ALETLER.yelpaze.tut).toEqual([0.5, 560 / 600]); expect(ALETLER.yelpaze.uc).toEqual([0.5, 240 / 600]);
    expect(ALET_SIRASI).toEqual(['termometre', 'bez', 'torba', 'yelpaze']);
    for (const ad of ATES_DOSYALAR) expect(ad).not.toMatch(/buyutec|sprey|cimbiz|sargi|bant-|firca|macun/);
  });
});

describe('senaryo: sekiz adım, her adımda el hareketi', () => {
  it('sekiz adım, aşamalar sırayla; 2–3 yaşta sallama yok; her aşamanın kendi aleti var', () => {
    expect(ADIMLAR).toHaveLength(8);
    expect(ADIMLAR.flat()).toEqual(ASAMALAR.filter(a => !['giris', 'canta', 'kutlama', 'son'].includes(a)));
    expect(ASAMALAR).toEqual(['giris', 'canta', 'salla', 'olc', 'daldir', 'sik', 'bez', 'ic', 'buz', 'kapat', 'koy', 'yelpaze', 'olc2', 'kutlama', 'son']);
    expect(asamalar('2-3')).not.toContain('salla');
    expect(sonrakiAsama('2-3', 'canta')).toBe('olc'); expect(sonrakiAsama('4', 'canta')).toBe('salla');
    expect(sonrakiAsama('4', 'bez')).toBe('ic'); expect(sonrakiAsama('4', 'ic')).toBe('buz'); expect(sonrakiAsama('4', 'koy')).toBe('yelpaze'); expect(sonrakiAsama('4', 'yelpaze')).toBe('olc2');
    for (const a of ADIMLAR.flat()) expect(asamaAleti(a), a).not.toBeNull();
    expect(brief).toMatch(/\| 8 \| Son ölçüm/);
  });
  it('yaş basamakları: 2–3 iki küp, 5+ dört küp ve iki ıslatma; küçükte daha az iş', () => {
    expect(ZORLUK['2-3'].salla).toBe(0); expect(ZORLUK['2-3'].buz).toBe(2); expect(ZORLUK['5+'].buz).toBe(4);
    expect(ZORLUK['5+'].bezTur).toBe(2); expect(ZORLUK['4'].bezTur).toBe(1);
    for (const k of ['olc', 'daldir', 'sik', 'bez', 'kapak', 'ic', 'yelpaze'] as const) expect(ZORLUK['2-3'][k], k).toBeLessThanOrEqual(ZORLUK['5+'][k]);
  });
  it('kapanış en çok 2 sn; sözler 8–12, efektler 5–10; adlar Mino\'nunkilerle çakışmaz; emir yok', () => {
    expect(KAPANIS.parlama + KAPANIS.kamera + KAPANIS.sevinc).toBeLessThanOrEqual(2000);
    const n = Object.keys(SOZLER).length;
    expect(n).toBeGreaterThanOrEqual(8); expect(n).toBeLessThanOrEqual(12);
    expect(EFEKTLER.length).toBeGreaterThanOrEqual(5); expect(EFEKTLER.length).toBeLessThanOrEqual(10);
    for (const e of ORTAK_EFEKTLER) expect(VAKA_EFEKTLER as readonly string[]).toContain(e);
    for (const ad of Object.keys(SOZLER)) expect(Object.keys(DIS_SOZLERI)).not.toContain(ad);
    for (const s of Object.values(SOZLER)) expect(s).not.toMatch(/\b(dokun|sür|tut|salla|koy)\b/i);
    expect(SOZLER['b-ferah']).toBe('Ferahladım! Yünüm de kabardı!');
  });
});

describe('yerleşim: her şey sahnede ve birbirine girmiyor', () => {
  it('yüz noktaları yüzde; kâse, tepsi ve torba dışında; ağız ve burun ayrı', () => {
    expect(alindaMi(BAS.alin)).toBe(true);
    for (const y of BAS.yanaklar) { expect(yuzdeMi(y)).toBe(true); expect(alindaMi(y)).toBe(false); }
    expect(agizdaMi(BAS.agiz)).toBe(true); expect(agizdaMi(BAS.burun)).toBe(false); expect(burundaMi(BAS.burun)).toBe(true); expect(burundaMi(BAS.agiz)).toBe(false);
    expect(yuzdeMi(KASE.yuz)).toBe(false); expect(sudaMi(KASE.yuz)).toBe(true);
    for (const k of TEPSI.kupler) { expect(yuzdeMi(k)).toBe(false); expect(torbayaMi(k)).toBe(false); }
    expect(torbayaMi(TORBA.agiz)).toBe(true);
    expect(TORBA.merkez.y + TORBA_DUGMESI / 2).toBeLessThanOrEqual(YAKIN.kino.ust);
    expect(tepedeMi(BAS.tepe)).toBe(true); expect(tepedeMi(TORBA.merkez)).toBe(false);
    expect(kaseUstundeMi({ x: KASE.yuz.x, y: KASE.ust.ust + 60 })).toBe(true);
    // yelpaze yüzün önünde de sayılır (yanında sallanır)
    expect(yelpazeYuzdeMi({ x: BAS.yuz.x + BAS.yuz.yariEn + 120, y: BAS.yuz.y })).toBe(true);
    expect(yelpazeYuzdeMi(KASE.yuz)).toBe(false);
  });
  it('dokunma hedefleri en küçük ekranda da en az 64 px', () => {
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    expect(TEPSI.dugme * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(TORBA_DUGMESI * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(SAHNE.g).toBe(2048);
  });
});

describe('el hareketleri: ilerleme süreyle değil hareketle', () => {
  it('sallama: her yön değiştirme bir; küçük titreme sayılmaz; yerinde tutmak çok yavaş', () => {
    let d = sallaBaslangici();
    for (const x of [500, 520, 560, 600, 560, 520, 480, 520, 560, 600]) d = sallaAdimi(d, x, 16);
    expect(d.sayi).toBe(2);
    let k = sallaBaslangici();
    for (const x of [500, 510, 500, 510, 500, 510, 500]) k = sallaAdimi(k, x, 16);
    expect(k.sayi).toBe(0);
    let y = sallaBaslangici();
    for (let t = 0; t < SALLA_BEKLEME * 2 + 50; t += 16) y = sallaAdimi(y, 500, 16);
    expect(y.sayi).toBe(2);
    expect(SALLA_GENLIK).toBeGreaterThan(30);
    expect(eskiOkuma(0, 6)).toBe(ESKI_OKUMA); expect(eskiOkuma(6, 6)).toBe(0);
  });
  it('ölçme, daldırma, sıkma', () => {
    let o = 0; for (let i = 0; i < 20; i++) o = olcAdimi(o, true, 16, 900);
    expect(o).toBe(320); expect(olcAdimi(o, false, 500, 900)).toBe(320);
    expect(daldirAdimi(0, true, 40, 16, 1000)).toBeGreaterThan(daldirAdimi(0, true, 0, 16, 1000) * 5);
    expect(daldirAdimi(100, false, 40, 16, 1000)).toBe(100);
    expect(sikAdimi(0, true, 30, 16, 500)).toBeGreaterThan(29); expect(sikAdimi(0, true, -30, 16, 500)).toBeLessThan(1); expect(sikAdimi(0, false, 30, 16, 500)).toBe(0);
    expect([0, 100, 200, 300, 439, 440].map(s => burukKaresi(s, 440))).toEqual([0, 0, 1, 2, 2, 2]);
  });
  it('bez: kızarıklık yalnız yanaklarda, gezdirmek bastırmaktan hızlı; 5+ yarıda ısınır', () => {
    const iz = kizariklikIzgarasi();
    for (const m of iz.merkezler) expect(BAS.yanaklar.some(y => Math.hypot(m.x - y.x, m.y - y.y) <= BAS.yanakYaricapi)).toBe(true);
    for (let tur = 0; tur < 6; tur++) for (let a = 0; a < 40; a++) { const t = (a / 40) * Math.PI * 2; bezAdimi(iz, { x: 690 + Math.cos(t) * 70, y: 610 + Math.sin(t) * 70 }, 12, 16); }
    expect(kizariklikOrani(iz)).toBeGreaterThan(0.4); expect(kizariklikOrani(iz)).toBeLessThan(0.6);
    const a = kizariklikIzgarasi(), b = kizariklikIzgarasi();
    for (let i = 0; i < 30; i++) { bezAdimi(a, BAS.yanaklar[1], 0, 16); bezAdimi(b, BAS.yanaklar[1], 30, 16); }
    expect(kizariklikOrani(b)).toBeGreaterThan(kizariklikOrani(a));
    expect(bezIsindiMi(BEZ_ISINMA, 1, ZORLUK['5+'])).toBe(true); expect(bezIsindiMi(0.9, 2, ZORLUK['5+'])).toBe(false); expect(bezIsindiMi(0.9, 1, ZORLUK['4'])).toBe(false);
  });
  it('içme: pipet ağızdayken yudum yudum; bardak dört kademede boşalır', () => {
    let i = 0; for (let k = 0; k < 10; k++) i = icAdimi(i, true, 50, 1700);
    expect(i).toBe(500); expect(icAdimi(i, false, 500, 1700)).toBe(500);
    expect([0, 424, 425, 850, 1275, 1699, 1700].map(v => bardakKademesi(v, 1700))).toEqual([0, 0, 1, 2, 3, 3, 3]);
  });
  it('buz: torba atılan küple kademe kademe şişer (2, 3 ya da 4 küp hep dolu biter)', () => {
    for (const n of [2, 3, 4]) { expect(torbaKademesi(0, n)).toBe(0); expect(torbaKademesi(n, n)).toBe(4); for (let k = 1; k <= n; k++) expect(torbaKademesi(k, n)).toBeGreaterThan(torbaKademesi(k - 1, n)); }
  });
  it('kapak: çevresinde dönmek tur sayar; sıçrayış sınırlı', () => {
    let d = kapakBaslangici();
    for (let i = 0; i <= 64; i++) { const t = (i / 64) * Math.PI * 2; d = kapakAdimi(d, { x: TORBA.agiz.x + Math.cos(t) * 150, y: TORBA.agiz.y + Math.sin(t) * 150 }); }
    expect(d.toplam).toBeCloseTo(1, 2);
    let s = kapakAdimi(kapakBaslangici(), { x: TORBA.agiz.x + 200, y: TORBA.agiz.y });
    s = kapakAdimi(s, { x: TORBA.agiz.x - 200, y: TORBA.agiz.y + 1 });
    expect(s.toplam).toBeLessThanOrEqual(0.25);
  });
  it('yelpaze: yün sallama sayısıyla üç kademede kabarır', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(s => yunKademesi(s, 6))).toEqual([0, 0, 1, 1, 2, 2, 3]);
    expect(yunKademesi(8, 8)).toBe(3); expect(yunKademesi(4, 4)).toBe(3);
  });
});

describe('yüz ifadesi: her adımın kendi tepkisi', () => {
  const d: BasDurumu = { asama: 'bez', kikirKalan: 0, serinKalan: 0, urperKalan: 0, sasirKalan: 0, keyifKalan: 0, yutkunKalan: 0, olcuyor: false, iciyor: false, kirp: false, an: 0 };
  it('sıcak, göz kırpma, bakış (ölçerken), şaşkın, kıkır, serin, keyif, ürperme, içme, yutkunma, gülme', () => {
    expect(basPozu(d)).toBe('sicak');
    expect(basPozu({ ...d, kirp: true })).toBe('kirp');
    expect(basPozu({ ...d, olcuyor: true })).toBe('bakis');
    expect(basPozu({ ...d, sasirKalan: 100 })).toBe('sasir');
    expect(basPozu({ ...d, kikirKalan: 100 })).toBe('kikir');
    expect(basPozu({ ...d, serinKalan: 100 })).toBe('serin');
    expect(basPozu({ ...d, asama: 'yelpaze', keyifKalan: 100 })).toBe('keyif');
    expect(basPozu({ ...d, urperKalan: 100, an: 0 })).toBe('urper0');
    expect(basPozu({ ...d, urperKalan: 100, an: 130 })).toBe('urper1');
    expect(['ic0', 'ic1', 'ic2']).toContain(basPozu({ ...d, iciyor: true, an: 260 }));
    expect(basPozu({ ...d, iciyor: true, yutkunKalan: 100 })).toBe('yutkun');
    expect(basPozu({ ...d, asama: 'son', urperKalan: 100 })).toBe('gulen');
  });
});
