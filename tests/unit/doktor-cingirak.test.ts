import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ADIMLAR, ALETLER, ASAMALAR, BOYUN, CEP, CINGIRAK, CINGIRAK_DOSYALAR, DUSME_YERLERI, EFEKTLER, FERMUAR, KARE_MS, MINO_DUGMESI, OPAK, PATILER, SOZLER, TOKA, TOP_CEPTE, TOP_YERI, TUVAL,
  VURUS, ZORLUK, TOP_DUGMESI, TOKA_DUGMESI, TUTAMAK_DUGMESI, acikDis, atis, basilma, basPozu, cekmeBoyu, cepKademesi, dusmeYeri, fermuarIlerleme, sesYeri, SES_YOLU, sonrakiAsama, tokaDolumu, vurusta, vurusaUzaklik,
  yakaladiMi, yayNoktasi, ziplayis, ZIPLA_ESIGI, BOING_ESIGI, type BasDurumu,
} from '../../doktor/src/vaka-cingirak/veri';
import { ORTAK_DOSYALAR } from '../../doktor/src/vaka-kit/ortak';
import { EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, SAHNE, VAKA_DOSYALAR, YAKIN, sahneOlcegi } from '../../doktor/src/vaka/veri';
import { KARIN_DOSYALAR } from '../../doktor/src/vaka-karin/veri';
import { BOCEK_DOSYALAR } from '../../doktor/src/vaka-bocek/veri';
import { KUZU_DOSYALAR } from '../../doktor/src/vaka-kuzu/veri';
import { HAPSU_DOSYALAR } from '../../doktor/src/vaka-hapsu/veri';
import { KANAT_DOSYALAR } from '../../doktor/src/vaka-kanat/veri';

// Minik Doktor · onuncu vaka "Mino'nun Kayıp Çıngırağı" (doktor/src/vaka-cingirak/), sekiz adım. Çizim adları, ölçüleri ve kare
// dizileri parça brief'iyle (ekip/senaryo/DOKTOR-Y8-Y10-PARCALAR.md) karşılaştırılır; mekaniklerin saf hesabı sınanır.

const tum = readFileSync('ekip/senaryo/DOKTOR-Y8-Y10-PARCALAR.md', 'utf8');
const bas = tum.indexOf('## Paket Doktor-Y10');
const brief = tum.slice(bas);
const ortak = tum.slice(0, tum.indexOf('## Paket Doktor-Y8'));
const nokta = (p: { x: number; y: number }) => `(${p.x}, ${p.y})`;

describe('Paket Doktor-Y10: çizim adları, ölçüler ve kare dizileri brief\'le birebir', () => {
  it('80 çizim, hepsi bir kez; her ad brief\'te geçer; tuvaller tam', () => {
    expect(bas).toBeGreaterThan(0);
    expect(CINGIRAK_DOSYALAR).toHaveLength(80);
    expect(new Set(CINGIRAK_DOSYALAR).size).toBe(80);
    for (const ad of CINGIRAK_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...CINGIRAK_DOSYALAR].sort());
    expect(brief).toContain('80 çizim');
    expect(OPAK).toEqual(['cingirak-fon']);
  });
  it('sayfa başına en çok 8; on iki sayfa; toplam 80; her sayfanın adları başlığında', () => {
    const sayfalar = [...brief.matchAll(/^### Sayfa \d+ · [^\n]*?\((\d+)[,)][^\n]*→ ([^\n]+)$/gm)];
    expect(sayfalar).toHaveLength(12);
    for (const m of sayfalar) { const n = Number(m[1]); expect(n).toBeLessThanOrEqual(8); expect((m[2].match(/`[^`]+`/g) ?? []).length, m[0]).toBe(n); }
    expect(sayfalar.flatMap(m => (m[2].match(/`[^`]+`/g) ?? []).map(s => s.slice(1, -1))).sort()).toEqual([...CINGIRAK_DOSYALAR].sort());
  });
  it('kare dizileri sıralı ve aynı tuvalde; yirmi ifade', () => {
    for (const d of [CINGIRAK.cep, CINGIRAK.tingir, CINGIRAK.sesDalga, CINGIRAK.yuvarlan, CINGIRAK.ucus, CINGIRAK.kirinti, CINGIRAK.ezikCizgi, CINGIRAK.toz, CINGIRAK.ritim, CINGIRAK.nota, CINGIRAK.cin, CINGIRAK.kalp]) {
      d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i}$`)));
      expect(new Set(d.map(ad => TUVAL[ad].join('×'))).size).toBe(1);
    }
    expect(Object.keys(CINGIRAK.bas)).toHaveLength(20);
    for (const ad of Object.values(CINGIRAK.bas)) expect(TUVAL[ad]).toEqual([SAHNE.g, SAHNE.y]);
    for (const k of Object.values(KARE_MS)) { expect(k).toBeGreaterThanOrEqual(60); expect(k).toBeLessThanOrEqual(300); }
  });
  it('ortak çizimler; adlar öbür paketlerle çakışmaz', () => {
    for (const ad of ORTAK_DOSYALAR) { expect(VAKA_DOSYALAR).toContain(ad); expect(ortak, ad).toContain('`' + ad + '`'); }
    for (const liste of [VAKA_DOSYALAR, HAPSU_DOSYALAR, KANAT_DOSYALAR, KARIN_DOSYALAR, BOCEK_DOSYALAR, KUZU_DOSYALAR]) expect(CINGIRAK_DOSYALAR.filter(ad => liste.includes(ad))).toEqual([]);
  });
  it('yerleşim sayıları brief\'te yazanlarla aynı', () => {
    for (const p of [FERMUAR.bas, FERMUAR.son, TOP_CEPTE, TOP_YERI, PATILER, BOYUN, TOKA, ...DUSME_YERLERI]) expect(brief, nokta(p)).toContain(nokta(p));
    expect(brief).toContain(`x ${CEP.sol}…${CEP.sol + CEP.g}, y ${CEP.ust}…${CEP.ust + CEP.y}`);
    expect(brief).toContain('on iki diş'); expect(FERMUAR.dis).toBe(12);
    expect(brief).toContain('tutulan yer bilek (300, 490), avucun ortası (300, 250)');
    expect([ALETLER.eldiven.tut[1] * 600, ALETLER.eldiven.uc[1] * 600].map(Math.round)).toEqual([490, 250]);
    expect(brief).toContain('kulaklıklar (300, 140), dinleme başı (450, 470)');
  });
  it('dokunma hedefleri küçük ekranda da en az 64 pt; düşme yerleri şeridin üstünde', () => {
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    for (const b of [TOP_DUGMESI, TOKA_DUGMESI, TUTAMAK_DUGMESI]) expect(b * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(Math.min(MINO_DUGMESI.g, MINO_DUGMESI.y) * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    for (const p of [...DUSME_YERLERI, TOP_YERI]) expect(p.y).toBeLessThan(YAKIN.serit.ust);
  });
});

describe('mekanikler', () => {
  it('zıplatma: eşik, boing ve basılma', () => {
    expect(ziplayis(ZIPLA_ESIGI - 1)).toBe('yok'); expect(ziplayis(ZIPLA_ESIGI)).toBe('zipla'); expect(ziplayis(BOING_ESIGI)).toBe('boing');
    expect(basilma(-50)).toBe(0); expect(basilma(BOING_ESIGI * 2)).toBe(1);
  });
  it('kaçan ses cebin çevresinde gezer', () => {
    for (let t = 0; t < SES_YOLU.tur; t += 300) { const p = sesYeri(t); expect(Math.abs(p.x - SES_YOLU.x)).toBeLessThanOrEqual(SES_YOLU.rx + 1); expect(Math.abs(p.y - SES_YOLU.y)).toBeLessThanOrEqual(SES_YOLU.ry + 1); }
    expect(sesYeri(0)).not.toEqual(sesYeri(SES_YOLU.tur / 4));
  });
  it('fermuar yalnız ileri; dişler ve cep kademeleri', () => {
    expect(fermuarIlerleme(FERMUAR.son, 0)).toBe(1); expect(fermuarIlerleme(FERMUAR.bas, 0.5)).toBe(0.5); expect(fermuarIlerleme({ x: FERMUAR.son.x, y: FERMUAR.son.y + 300 }, 0.2)).toBe(0.2);
    expect(acikDis(0.5)).toBe(6); expect([0, 0.3, 0.6, 0.99, 1].map(cepKademesi)).toEqual([0, 1, 2, 3, 4]);
    expect(cekmeBoyu({ x: 880, y: CEP.ust - 200 })).toBe(240); expect(cekmeBoyu(TOP_CEPTE)).toBe(0);
  });
  it('ritim: vuruşa yakınlık ve pencere', () => {
    expect(vurusaUzaklik(0)).toBe(0); expect(vurusaUzaklik(VURUS / 2)).toBe(VURUS / 2); expect(vurusaUzaklik(VURUS - 50)).toBe(50);
    expect(vurusta(VURUS * 3 + 100, 160)).toBe(true); expect(vurusta(VURUS * 3 + 300, 160)).toBe(false);
  });
  it('fırlatma: yön ve hız; yay; yakalama', () => {
    const b = TOP_YERI, hedefe = { x: b.x + (PATILER.x - b.x) * 0.5, y: b.y + (PATILER.y - b.y) * 0.5 };
    expect(atis(b, hedefe, 100, 1.3)).toBe('tam'); expect(atis(b, hedefe, 1000, 1.3)).toBe('kisa');
    expect(atis(b, { x: b.x + 300, y: b.y }, 100, 1.3)).toBe('yanlis'); expect(atis(b, { x: b.x + 10, y: b.y }, 10, 1.3)).toBe('yanlis');
    expect(yayNoktasi(b, PATILER, 0)).toEqual(b); expect(yayNoktasi(b, PATILER, 1).x).toBeCloseTo(PATILER.x, 5);
    expect(yayNoktasi(b, PATILER, 0.5).y).toBeLessThan((b.y + PATILER.y) / 2);
    expect(new Set([0, 1, 2].map(dusmeYeri).map(p => p.x)).size).toBe(3);
    expect(yakaladiMi(DUSME_YERLERI[0], DUSME_YERLERI[0], 120)).toBe(true); expect(yakaladiMi(null, DUSME_YERLERI[0], 120)).toBe(false);
    expect(tokaDolumu(350, 700)).toBe(0.5); expect(tokaDolumu(900, 700)).toBe(1);
  });
  it('yaşa göre zorluk', () => {
    const [k, b] = [ZORLUK['2-3'], ZORLUK['5+']];
    expect(k.pencere).toBeGreaterThan(b.pencere); expect(k.atis).toBeLessThan(b.atis); expect(k.yakalaR).toBeGreaterThan(b.yakalaR); expect(k.toka).toBeLessThan(b.toka); expect(k.firlat).toBeLessThan(b.firlat);
  });
});

describe('senaryo, ifadeler ve sesler', () => {
  it('sekiz adım sırayla', () => {
    expect(ADIMLAR).toHaveLength(8);
    expect(ADIMLAR).toEqual(ASAMALAR.filter(a => !['giris', 'canta', 'kutlama', 'son'].includes(a)));
    expect(sonrakiAsama('firlat')).toBe('yakala'); expect(sonrakiAsama('toka')).toBe('kutlama');
    expect(brief).toMatch(/\| 8 \| Toka/);
  });
  it('yüz ifadesi: zıplama ve dans kareleri; kapanışta güler', () => {
    const d = (x: Partial<BasDurumu>): BasDurumu => ({ asama: 'zipla', ezikKalan: 0, havadaKalan: 0, boingKalan: 0, sasirKalan: 0, kikirKalan: 0, merakKalan: 0, ohKalan: 0, sevinKalan: 0, dansKalan: 0, uzanKalan: 0, yakalaKalan: 0, firlatKalan: 0, utanKalan: 0, dinliyor: false, kirp: false, an: 0, ...x });
    expect(basPozu(d({}))).toBe('uzgun'); expect(basPozu(d({ boingKalan: 1, ezikKalan: 1 }))).toBe('boing');
    expect(basPozu(d({ dansKalan: 1, an: KARE_MS.dans * 2 }))).toBe('dans2'); expect(basPozu(d({ asama: 'ritim' }))).toBe('sevin');
    expect(basPozu(d({ asama: 'son', boingKalan: 1 }))).toBe('gulen'); expect(basPozu(d({ dinliyor: true }))).toBe('dinle');
  });
  it('sözler yazılı, efektler kayıtlı; giriş yolu var', () => {
    expect(Object.keys(SOZLER).length).toBeGreaterThanOrEqual(10);
    for (const e of EFEKTLER) expect(existsSync(`assets/doktor/cingirak/ses/${e}.mp3`), e).toBe(true);
    expect(readFileSync('doktor/src/ses.ts', 'utf8')).toContain('assets/doktor/cingirak/ses/');
    // giriş yolu (giris.ts 23 Kasım'dan beri `oyun === …` yazıyor; eski `p.get('oyun') === …` de geçer)
    expect(readFileSync('doktor/src/giris.ts', 'utf8')).toMatch(/(p\.get\('oyun'\)|\boyun) === 'cingirak'/);
    // her söz kayıtlı (23 Kasım: karakter klonlarıyla seslendirildi, Scribe'dan geçti); ses havuzu tek, ad bir klasörde
    const sesler = readdirSync('assets/doktor').flatMap(k => existsSync(`assets/doktor/${k}/ses`) ? readdirSync(`assets/doktor/${k}/ses`) : []);
    for (const id of Object.keys(SOZLER)) expect(sesler.filter(f => f === id + '.mp3').length, id).toBe(1);
  });
});
