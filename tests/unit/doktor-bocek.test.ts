import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ACIK_YER, ADIMLAR, ALETLER, ARALA_BOY, ASAMALAR, BANTLAR, BANT_TAMAM, BAS, BOCEK, BOCEK_DOSYALAR, BOCEK_DUGMESI, DURGUN_MS, EFEKTLER, KARE_MS, KINO_BURUN, KINO_HAPSU, KULAK,
  KULAK_UCU, KULAK_UCU_DUGMESI, MERCEK, OPAK, PAYLASILAN, PENCERE, PERVAZ, SELAM_YERLERI, SERT_SALLA, SOZLER, TUTAMLAR, TUTAM_DUGMESI, TUVAL, ZORLUK,
  aralandiMi, bantAdimi, bantBaslangici, bantBul, bantOrani, basPozu, bulmaAdimi, gozdeMi, hiz, kacisYeri, kalpNoktasi, kulakPozu, kulaktaMi, penceredeMi, sallaAdimi,
  sallaBaslangici, sertMi, sonrakiAsama, ucusNoktasi, urkerMi, type BasDurumu,
} from '../../doktor/src/vaka-bocek/veri';
import { ORTAK_DOSYALAR } from '../../doktor/src/vaka-kit/ortak';
import { EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, SAHNE, VAKA, VAKA_DOSYALAR, YAKIN, sahneOlcegi } from '../../doktor/src/vaka/veri';
import { HAPSU_DOSYALAR } from '../../doktor/src/vaka-hapsu/veri';
import { KANAT_DOSYALAR } from '../../doktor/src/vaka-kanat/veri';
import { ATES_DOSYALAR } from '../../doktor/src/vaka-ates/veri';
import { BOYA_DOSYALAR } from '../../doktor/src/vaka-boya/veri';
import { KARIN_DOSYALAR } from '../../doktor/src/vaka-karin/veri';

// Minik Doktor · dokuzuncu vaka "Bulut'un Uğur Böceği" (doktor/src/vaka-bocek/), sekiz adım. Böceğe alet dokunmaz, kulağın içine
// bir şey girmez. Çizim adları, ölçüleri ve kare dizileri parça brief'iyle (ekip/senaryo/DOKTOR-Y7-Y9-PARCALAR.md) karşılaştırılır.

const tum = readFileSync('ekip/senaryo/DOKTOR-Y7-Y9-PARCALAR.md', 'utf8');
const bas = tum.indexOf('## Paket Doktor-Y9');
const brief = tum.slice(bas);
const ortak = tum.slice(0, tum.indexOf('## Paket Doktor-Y7'));

describe('Paket Doktor-Y9: çizim adları, ölçüler ve kare dizileri brief\'le birebir', () => {
  it('82 çizim, hepsi bir kez; her ad brief\'te geçer; tuvaller tam; büyüteç Y1\'den', () => {
    expect(bas).toBeGreaterThan(0);
    expect(BOCEK_DOSYALAR).toHaveLength(82);
    expect(new Set(BOCEK_DOSYALAR).size).toBe(82);
    for (const ad of BOCEK_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...BOCEK_DOSYALAR].sort());
    expect(brief).toContain('82 çizim');
    expect(OPAK).toEqual(['bocek-fon']);
    expect(PAYLASILAN).toEqual([VAKA.buyutec]); expect(VAKA_DOSYALAR).toContain(VAKA.buyutec); expect(ortak).toContain('`buyutec`');
  });
  it('sayfa başına en çok 8; on üç sayfa; toplam 82; her sayfanın adları başlığında', () => {
    const sayfalar = [...brief.matchAll(/^### Sayfa \d+ · [^\n]*?\((\d+)[,)][^\n]*→ ([^\n]+)$/gm)];
    expect(sayfalar).toHaveLength(13);
    for (const m of sayfalar) { const n = Number(m[1]); expect(n).toBeLessThanOrEqual(8); expect((m[2].match(/`[^`]+`/g) ?? []).length, m[0]).toBe(n); }
    expect(sayfalar.reduce((a, m) => a + Number(m[1]), 0)).toBe(82);
    expect(sayfalar.flatMap(m => (m[2].match(/`[^`]+`/g) ?? []).map(s => s.slice(1, -1))).sort()).toEqual([...BOCEK_DOSYALAR].sort());
  });
  it('kare dizileri sıralı ve aynı tuvalde; on altı yüz ifadesi, beş kulak', () => {
    for (const d of [BOCEK.tuyUcusan, BOCEK.kipirti, BOCEK.tuyParilti, BOCEK.gidik, BOCEK.bak, BOCEK.yuru, BOCEK.saklan, BOCEK.otur, BOCEK.kanat, BOCEK.uc, BOCEK.selam, BOCEK.arkadasA, BOCEK.arkadasB, BOCEK.yaprakBocekli, BOCEK.yaprakSalla, BOCEK.fircaIz, BOCEK.dal, BOCEK.kalp]) {
      d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i}$`)));
      expect(new Set(d.map(ad => TUVAL[ad].join('×'))).size).toBe(1);
    }
    expect(Object.keys(BOCEK.bas)).toHaveLength(16);
    expect(Object.keys(BOCEK.kulak)).toHaveLength(5);
    for (const ad of [...Object.values(BOCEK.bas), ...Object.values(BOCEK.kulak)]) expect(TUVAL[ad]).toEqual([SAHNE.g, SAHNE.y]);
    for (const k of Object.values(KARE_MS)) { expect(k).toBeGreaterThanOrEqual(60); expect(k).toBeLessThanOrEqual(900); }
  });
  it('ortak çizimler; adlar öbür paketlerle çakışmaz', () => {
    for (const ad of ORTAK_DOSYALAR) { expect(VAKA_DOSYALAR).toContain(ad); expect(ortak, ad).toContain('`' + ad + '`'); }
    for (const liste of [VAKA_DOSYALAR, HAPSU_DOSYALAR, KANAT_DOSYALAR, ATES_DOSYALAR, BOYA_DOSYALAR, KARIN_DOSYALAR]) expect(BOCEK_DOSYALAR.filter(ad => liste.includes(ad))).toEqual([]);
  });
  it('yerleşim sayıları brief\'te yazanlarla aynı', () => {
    expect(brief).toContain(`Göz (${BAS.goz.x}, ${BAS.goz.y})`);
    expect(brief).toContain(`Kulağın ucu (${KULAK_UCU.x}, ${KULAK_UCU.y})`);
    expect(brief).toContain(`x ${KULAK.x - KULAK.yariEn}…${KULAK.x + KULAK.yariEn}, y ${KULAK.y - KULAK.yariBoy}…${KULAK.y + KULAK.yariBoy}`);
    for (const p of [...TUTAMLAR, ACIK_YER, PERVAZ, ...SELAM_YERLERI, KINO_BURUN]) expect(brief).toContain(`(${p.x}, ${p.y})`);
    expect(brief).toContain(`x ${PENCERE.sol}…${PENCERE.sol + PENCERE.g}, y ${PENCERE.ust}…${PENCERE.ust + PENCERE.y}`);
    expect(brief).toContain(`y ${BANTLAR.map(b => b.y).join(', ')}`);
  });
  it('aletlerin tutulan yeri ve ucu çizimdeki noktada; büyüteç Y1\'inkiyle aynı', () => {
    expect(brief).toContain('Tutulan yer sap (140, 520); böceğin bindiği yer yaprağın ortası (330, 250)');
    expect([ALETLER.yaprak.tut[0] * 600, ALETLER.yaprak.tut[1] * 600].map(Math.round)).toEqual([140, 520]);
    expect([ALETLER.yaprak.uc[0] * 600, ALETLER.yaprak.uc[1] * 600].map(Math.round)).toEqual([330, 250]);
    expect(brief).toContain('sapı altta (300, 500), kılların ucu üstte (300, 110)');
    expect([ALETLER.firca.tut[1] * 600, ALETLER.firca.uc[1] * 600].map(Math.round)).toEqual([500, 110]);
    expect(MERCEK.cap).toBeGreaterThan(200); expect(MERCEK.buyutme).toBeGreaterThan(1.4);
  });
  it('dokunma hedefleri küçük ekranda da en az 64 pt; herkes sakin alanların dışında', () => {
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    for (const b of [BOCEK_DUGMESI, TUTAM_DUGMESI, KULAK_UCU_DUGMESI]) expect(b * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    for (const p of [...TUTAMLAR, ACIK_YER, KULAK_UCU, PERVAZ, ...SELAM_YERLERI]) expect(p.y + BOCEK_DUGMESI / 2).toBeLessThan(YAKIN.serit.ust);
    for (const p of TUTAMLAR) expect(kulaktaMi(p)).toBe(true);
    expect(kulaktaMi(ACIK_YER)).toBe(true);
    // tutamların düğmeleri birbirine değmez
    for (let i = 0; i < TUTAMLAR.length; i++) for (let j = i + 1; j < TUTAMLAR.length; j++) expect(Math.hypot(TUTAMLAR[i].x - TUTAMLAR[j].x, TUTAMLAR[i].y - TUTAMLAR[j].y)).toBeGreaterThanOrEqual(TUTAM_DUGMESI * 0.75);
    for (const p of [PERVAZ, ...SELAM_YERLERI]) expect(penceredeMi(p)).toBe(true);
    // Kino'nun burnu yakın plandaki Kino'nun kutusunda
    expect(KINO_BURUN.x).toBeGreaterThan(YAKIN.kino.sol); expect(KINO_BURUN.y).toBeGreaterThan(YAKIN.kino.ust);
  });
});

describe('mekanikler', () => {
  it('bulma, aralama ve kaçış', () => {
    let b = 0;
    for (let i = 0; i < 20; i++) b = bulmaAdimi(b, 40, ZORLUK['4'].bulR, 40);
    expect(b).toBeGreaterThanOrEqual(ZORLUK['4'].bulMs);
    expect(aralandiMi(500, 500 + ARALA_BOY)).toBe(true); expect(aralandiMi(500, 500 - ARALA_BOY)).toBe(true); expect(aralandiMi(500, 560)).toBe(false);
    for (let s = 0; s < 3; s++) for (let t = 1; t <= 3; t++) { const j = kacisYeri(s, t); expect(j).not.toBe(s); expect(j).toBeGreaterThanOrEqual(0); expect(j).toBeLessThan(TUTAMLAR.length); }
    expect(gozdeMi(BAS.goz)).toBe(true); expect(gozdeMi(KULAK)).toBe(false);
    expect(kulaktaMi(BAS.goz)).toBe(false);
  });
  it('yaklaştırma ve taşıma: yakında hızlı gelirse ürker; uzakta hız önemsiz', () => {
    expect(hiz(32, 16)).toBe(2);
    expect(urkerMi(200, 2, ZORLUK['4'].yavas)).toBe(true);
    expect(urkerMi(200, 0.5, ZORLUK['4'].yavas)).toBe(false);
    expect(urkerMi(500, 5, ZORLUK['4'].yavas)).toBe(false);
    expect(ZORLUK['2-3'].sarsinti).toBeGreaterThan(ZORLUK['5+'].sarsinti);
    expect(DURGUN_MS).toBeLessThanOrEqual(600);
  });
  it('fırça: yalnız kökten uca giden fırça kaplar; ters gidiş dikilir', () => {
    const i = bantBul({ x: 800, y: BANTLAR[1].y });
    expect(i).toBe(1);
    let d = bantBaslangici();
    const b = BANTLAR[1];
    for (let x = b.sol; x < b.sag; x += 40) d = bantAdimi(d, 1, { x, y: b.y }, { x: x + 40, y: b.y }).d;
    expect(bantOrani(d, 1)).toBeGreaterThanOrEqual(BANT_TAMAM);
    const t = bantAdimi(bantBaslangici(), 1, { x: 900, y: b.y }, { x: 860, y: b.y });
    expect(t.ters).toBe(true); expect(bantOrani(t.d, 1)).toBe(0);
    expect(bantBul({ x: 800, y: 900 })).toBe(-1);
  });
  it('kulak sallama: yön değiştirme sayılır; çok sert çekmek komik', () => {
    let d = sallaBaslangici();
    for (const y of [560, 500, 440, 500, 560, 620, 560]) d = sallaAdimi(d, y);
    expect(d.sayi).toBe(2);
    let k = sallaBaslangici();
    for (const y of [560, 540, 560, 540]) k = sallaAdimi(k, y);
    expect(k.sayi).toBe(0);
    expect(sertMi(560, 560 + SERT_SALLA)).toBe(true); expect(sertMi(560, 700)).toBe(false);
    expect(kulakPozu(60)).toBe('asagi'); expect(kulakPozu(-60)).toBe('yukari'); expect(kulakPozu(5)).toBe('tarali');
  });
  it('uçuş pervazdan Kino\'nun burnuna; kalp yolu kapalı', () => {
    expect(ucusNoktasi(0, PERVAZ, KINO_BURUN)).toEqual(PERVAZ);
    const s = ucusNoktasi(1, PERVAZ, KINO_BURUN); expect(s.x).toBeCloseTo(KINO_BURUN.x, 5); expect(s.y).toBeCloseTo(KINO_BURUN.y, 5);
    const m = { x: 1750, y: 300 };
    const a = kalpNoktasi(0, m, 150), z = kalpNoktasi(1, m, 150);
    expect(a.x).toBeCloseTo(z.x, 5); expect(a.y).toBeCloseTo(z.y, 5);
    for (let t = 0; t <= 1; t += 0.05) { const p = kalpNoktasi(t, m, 150); expect(p.x).toBeGreaterThan(m.x - 200); expect(p.x).toBeLessThan(m.x + 200); }
  });
});

describe('senaryo, ifadeler ve sesler', () => {
  it('sekiz adım sırayla', () => {
    expect(ADIMLAR).toHaveLength(8);
    expect(ADIMLAR).toEqual(ASAMALAR.filter(a => !['giris', 'canta', 'kutlama', 'son'].includes(a)));
    expect(sonrakiAsama('tasi')).toBe('ucur'); expect(sonrakiAsama('selam')).toBe('kutlama');
    expect(brief).toMatch(/\| 8 \| Selam/);
    expect(brief).toContain('Cımbız yok'); expect(brief).toContain('kulağın içine hiçbir şey girmez');
  });
  it('yüz ifadesi: tepkiler öncelikli; taşırken nefesini tutar; böcek gidince mutlu', () => {
    const d = (x: Partial<BasDurumu>): BasDurumu => ({ asama: 'bul', sallaKalan: 0, korKalan: 0, irkilKalan: 0, sasirKalan: 0, kikirKalan: 0, gidikKalan: 0, ohhKalan: 0, tasiyor: false, yakinda: false, kirp: false, an: 0, ...x });
    expect(basPozu(d({}))).toBe('uzgun');
    expect(basPozu(d({ an: 150 * 5 }))).toBe('kasin0');
    expect(basPozu(d({ yakinda: true }))).toBe('merak');
    expect(basPozu(d({ asama: 'tasi', tasiyor: true }))).toBe('sessiz');
    expect(basPozu(d({ asama: 'tasi', tasiyor: true, irkilKalan: 100 }))).toBe('irkil');
    expect(basPozu(d({ sallaKalan: 100, an: 0 }))).toBe('salla0'); expect(basPozu(d({ sallaKalan: 100, an: KARE_MS.salla }))).toBe('salla1');
    expect(basPozu(d({ asama: 'firca' }))).toBe('mutlu');
    expect(basPozu(d({ asama: 'son', korKalan: 100 }))).toBe('gulen');
  });
  it('Bulut\'un sözleri yazılı ve kayıtlı (klon sesleri); efektler ve Kino\'nun hapşırığı kayıtlı', () => {
    expect(Object.keys(SOZLER).length).toBeGreaterThanOrEqual(10);
    for (const s of Object.values(SOZLER)) expect(s.length).toBeLessThan(60);
    for (const e of EFEKTLER) expect(existsSync(`assets/doktor/bocek/ses/${e}.mp3`), e).toBe(true);
    expect(existsSync(`assets/doktor/kanat/ses/${KINO_HAPSU}.mp3`)).toBe(true);
    expect(readFileSync('doktor/src/ses.ts', 'utf8')).toContain('assets/doktor/bocek/ses/');
    // giriş yolu (giris.ts 23 Kasım'dan beri `oyun === …` yazıyor; eski `p.get('oyun') === …` de geçer)
    expect(readFileSync('doktor/src/giris.ts', 'utf8')).toMatch(/(p\.get\('oyun'\)|\boyun) === 'bocek'/);
    // her söz kayıtlı (23 Kasım: karakter klonlarıyla seslendirildi, Scribe'dan geçti); ses havuzu tek, ad bir klasörde
    const sesler = readdirSync('assets/doktor').flatMap(k => existsSync(`assets/doktor/${k}/ses`) ? readdirSync(`assets/doktor/${k}/ses`) : []);
    for (const id of Object.keys(SOZLER)) expect(sesler.filter(f => f === id + '.mp3').length, id).toBe(1);
  });
});
