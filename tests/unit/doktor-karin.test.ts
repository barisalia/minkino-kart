import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ADIMLAR, AGIZ_YARICAPI, ALETLER, ASAMALAR, BAS, CERCEVE, DILIMLER, EFEKTLER, FINCAN, GURULTU_YERLERI, KARE_MS, KARIN, KARIN_DOSYALAR, KARIN_ELIPS, OPAK, SOZLER, TUVAL, ZORLUK,
  agizdaMi, aciFarki, bastaMi, basPozu, bulmaAdimi, burundaMi, daireAdimi, daireBaslangici, fincanKademesi, gurultuAraligi, gurultuKademesi, karindaMi, pencere, penceredeMi,
  sonrakiAsama, surtAdimi, surtBaslangici, torbaYeri, ufleme, UFLE_BOY, yakinlik, yavasMi, yudumAdimi, type BasDurumu,
} from '../../doktor/src/vaka-karin/veri';
import { ORTAK_DOSYALAR, ortalamaHiz } from '../../doktor/src/vaka-kit/ortak';
import { EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, SAHNE, VAKA_DOSYALAR, YAKIN, sahneOlcegi } from '../../doktor/src/vaka/veri';
import { HAPSU_DOSYALAR } from '../../doktor/src/vaka-hapsu/veri';
import { KANAT_DOSYALAR } from '../../doktor/src/vaka-kanat/veri';
import { ATES_DOSYALAR } from '../../doktor/src/vaka-ates/veri';
import { BOYA_DOSYALAR } from '../../doktor/src/vaka-boya/veri';
import { BOCEK_DOSYALAR } from '../../doktor/src/vaka-bocek/veri';

// Minik Doktor · yedinci vaka "Lokum'un Guruldayan Karnı" (doktor/src/vaka-karin/), sekiz adım. Çizim adları, ölçüleri ve kare
// dizileri parça brief'iyle (ekip/senaryo/DOKTOR-Y7-Y9-PARCALAR.md) karşılaştırılır; mekaniklerin saf hesabı sınanır.

const tum = readFileSync('ekip/senaryo/DOKTOR-Y7-Y9-PARCALAR.md', 'utf8');
const bas = tum.indexOf('## Paket Doktor-Y7');
const brief = tum.slice(bas, tum.indexOf('## Paket Doktor-Y9'));
const ortak = tum.slice(0, bas);

describe('Paket Doktor-Y7: çizim adları, ölçüler ve kare dizileri brief\'le birebir', () => {
  it('80 çizim, hepsi bir kez; her ad brief\'te geçer; tuvaller tam', () => {
    expect(bas).toBeGreaterThan(0);
    expect(KARIN_DOSYALAR).toHaveLength(80);
    expect(new Set(KARIN_DOSYALAR).size).toBe(80);
    for (const ad of KARIN_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...KARIN_DOSYALAR].sort());
    expect(brief).toContain('80 çizim');
    expect(OPAK).toEqual(['karin-fon']);
  });
  it('sayfa başına en çok 8; on iki sayfa; toplam 80; her sayfanın adları başlığında', () => {
    const sayfalar = [...brief.matchAll(/^### Sayfa \d+ · [^\n]*?\((\d+)[,)][^\n]*→ ([^\n]+)$/gm)];
    expect(sayfalar).toHaveLength(12);
    for (const m of sayfalar) { const n = Number(m[1]); expect(n).toBeLessThanOrEqual(8); expect((m[2].match(/`[^`]+`/g) ?? []).length, m[0]).toBe(n); }
    expect(sayfalar.reduce((a, m) => a + Number(m[1]), 0)).toBe(80);
    expect(sayfalar.flatMap(m => (m[2].match(/`[^`]+`/g) ?? []).map(s => s.slice(1, -1))).sort()).toEqual([...KARIN_DOSYALAR].sort());
  });
  it('kare dizileri sıralı ve aynı tuvalde; on yedi yüz ifadesi', () => {
    for (const d of [KARIN.gurultu, KARIN.gurultuYeri, KARIN.titreme, KARIN.gidikCizgi, KARIN.dilim, KARIN.ellerSur, KARIN.sicakParilti, KARIN.ovIz, KARIN.fincan, KARIN.girdap, KARIN.papatya, KARIN.sicrama, KARIN.buhar, KARIN.dagil, KARIN.torbaBas, KARIN.kalp]) {
      d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i}$`)));
      expect(new Set(d.map(ad => TUVAL[ad].join('×'))).size).toBe(1);
    }
    expect(Object.keys(KARIN.bas)).toHaveLength(17);
    for (const ad of Object.values(KARIN.bas)) expect(TUVAL[ad]).toEqual([SAHNE.g, SAHNE.y]);
    for (const k of Object.values(KARE_MS)) { expect(k).toBeGreaterThanOrEqual(60); expect(k).toBeLessThanOrEqual(300); }
  });
  it('ortak çizimler; adlar öbür paketlerle çakışmaz', () => {
    for (const ad of ORTAK_DOSYALAR) { expect(VAKA_DOSYALAR).toContain(ad); expect(ortak, ad).toContain('`' + ad + '`'); }
    for (const liste of [VAKA_DOSYALAR, HAPSU_DOSYALAR, KANAT_DOSYALAR, ATES_DOSYALAR, BOYA_DOSYALAR, BOCEK_DOSYALAR]) expect(KARIN_DOSYALAR.filter(ad => liste.includes(ad))).toEqual([]);
  });
  it('yerleşim sayıları brief\'te yazanlarla aynı', () => {
    expect(brief).toContain(`başın ortası (${BAS.bas.x}, ${BAS.bas.y}), burun (${BAS.burun.x}, ${BAS.burun.y}), ağız (${BAS.agiz.x}, ${BAS.agiz.y})`);
    expect(brief).toContain(`ortası (${KARIN_ELIPS.x}, ${KARIN_ELIPS.y})`);
    expect(brief).toContain(`x ${KARIN_ELIPS.x - KARIN_ELIPS.yariEn}…${KARIN_ELIPS.x + KARIN_ELIPS.yariEn}, y ${KARIN_ELIPS.y - KARIN_ELIPS.yariBoy}…${KARIN_ELIPS.y + KARIN_ELIPS.yariBoy}`);
    for (const p of [...GURULTU_YERLERI, ...DILIMLER]) expect(brief).toContain(`(${p.x}, ${p.y})`);
    expect(brief).toContain(`çayın yüzü (${FINCAN.yuz.x}, ${FINCAN.yuz.y})`);
    expect(brief).toContain(`x ${FINCAN.kutu.sol}…${FINCAN.kutu.sol + FINCAN.kutu.g}, y ${FINCAN.kutu.ust}…${FINCAN.kutu.ust + FINCAN.kutu.y}`);
  });
  it('aletlerin tutulan yeri ve ucu çizimdeki noktada', () => {
    const nokta = (a: { g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number] }, cg: number, cy: number) => ({ tut: [a.tut[0] * cg, a.tut[1] * cy].map(Math.round), uc: [a.uc[0] * cg, a.uc[1] * cy].map(Math.round) });
    expect(brief).toContain('kulaklıklar (300, 140); dinleme başı (450, 470)'); expect(nokta(ALETLER.steto, 600, 600)).toEqual({ tut: [300, 140], uc: [450, 470] });
    expect(brief).toContain('bilekler (300, 450); avuçların ortası (300, 270)'); expect(nokta(ALETLER.eller, 600, 600)).toEqual({ tut: [300, 450], uc: [300, 270] });
    expect(brief).toContain('sap üstte (300, 120), çorba kısmı altta (300, 520)'); expect(nokta(ALETLER.kasik, 600, 600)).toEqual({ tut: [300, 120], uc: [300, 520] });
    expect(brief).toContain('ağzı (200, 76)'); expect(nokta(ALETLER.fincan, 400, 420).uc).toEqual([200, 76]);
    expect(brief).toContain('tutulan yer üst (300, 180)'); expect(nokta(ALETLER.torba, 600, 600).tut).toEqual([300, 180]);
    // röntgen camı: çizimde x 70…530, y 70…410, elde %70
    expect(brief).toContain('cam x 70…530, y 70…410');
    expect(CERCEVE.g / 600).toBeCloseTo(0.7, 5); expect(CERCEVE.pencereG).toBe(Math.round(460 * 0.7)); expect(CERCEVE.pencereY).toBe(Math.round(340 * 0.7));
  });
  it('dokunma hedefleri küçük ekranda da en az 64 pt; çay ve torba sakin alanların dışında', () => {
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    expect(FINCAN.kutu.g * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(FINCAN.yaricap * 2 * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(AGIZ_YARICAPI * 2 * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(FINCAN.kutu.ust + FINCAN.kutu.y).toBeLessThan(YAKIN.serit.ust);
    expect(KARIN_ELIPS.y + KARIN_ELIPS.yariBoy).toBeLessThan(YAKIN.serit.ust);
  });
});

describe('mekanikler', () => {
  it('sıcak-soğuk: yaklaştıkça yakınlık artar, gurultu sıklaşır; yerinde tutunca bulunur', () => {
    const h = GURULTU_YERLERI[0];
    expect(yakinlik(h, h)).toBe(1); expect(yakinlik({ x: h.x + 600, y: h.y }, h)).toBe(0);
    expect(yakinlik({ x: h.x + 100, y: h.y }, h)).toBeGreaterThan(yakinlik({ x: h.x + 300, y: h.y }, h));
    expect(gurultuAraligi(1)).toBeLessThan(gurultuAraligi(0.2)); expect(gurultuAraligi(0)).toBe(1500); expect(gurultuAraligi(1)).toBe(400);
    let b = 0;
    for (let i = 0; i < 20; i++) b = bulmaAdimi(b, 50, ZORLUK['4'].dinleR, 40);
    expect(b).toBeGreaterThanOrEqual(ZORLUK['4'].dinleMs);
    expect(bulmaAdimi(500, 400, 130, 100)).toBe(450);
    for (const p of GURULTU_YERLERI) expect(karindaMi(p)).toBe(true);
  });
  it('röntgen: pencere çerçevenin ortasında; dilimler karnın içinde ve ayrı ayrı bulunur', () => {
    const uc = { x: 860, y: 640 };
    const k = pencere(uc);
    expect(k.sol + k.g / 2).toBe(uc.x); expect(k.ust + k.y / 2).toBe(uc.y);
    expect(penceredeMi(uc, uc)).toBe(true); expect(penceredeMi({ x: uc.x + 200, y: uc.y }, uc)).toBe(false);
    for (const d of DILIMLER) expect(karindaMi(d)).toBe(true);
    for (let i = 0; i < DILIMLER.length; i++) for (let j = i + 1; j < DILIMLER.length; j++) expect(Math.hypot(DILIMLER[i].x - DILIMLER[j].x, DILIMLER[i].y - DILIMLER[j].y)).toBeGreaterThan(ZORLUK['2-3'].dilimR);
    expect(bastaMi(BAS.bas)).toBe(true); expect(bastaMi(KARIN_ELIPS)).toBe(false);
  });
  it('sürtme: yalnız yeterince gidip dönmek sayılır', () => {
    let d = surtBaslangici();
    for (const x of [500, 560, 620, 560, 500, 560, 620]) d = surtAdimi(d, x);
    expect(d.sayi).toBe(2);
    let k = surtBaslangici();
    for (const x of [500, 520, 500, 520, 500]) k = surtAdimi(k, x);
    expect(k.sayi).toBe(0);
  });
  it('daire: açı farkı en kısa yoldan; merkeze çok yakın ya da dışarıda sayılmaz; yavaşlık sınırı', () => {
    expect(aciFarki(3, -3)).toBeCloseTo(2 * Math.PI - 6, 5);
    expect(aciFarki(-3, 3)).toBeCloseTo(-(2 * Math.PI - 6), 5);
    const m = { x: 860, y: 640 };
    let d = daireBaslangici(), toplam = 0;
    for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; const r = daireAdimi(d, { x: m.x + Math.cos(a) * 200, y: m.y + Math.sin(a) * 150 }, m, true); d = r.d; toplam += Math.abs(r.fark); }
    expect(toplam).toBeCloseTo(Math.PI * 2, 1);
    expect(daireAdimi(d, { x: m.x + 10, y: m.y }, m, true, 40).fark).toBe(0);
    expect(daireAdimi({ aci: 0, toplam: 0 }, { x: m.x, y: m.y + 200 }, m, false).fark).toBe(0);
    expect(yavasMi(0.1, 16, ZORLUK['4'].ovHiz)).toBe(true); expect(yavasMi(0.5, 16, ZORLUK['4'].ovHiz)).toBe(false);
  });
  it('gurultu kademesi üçten sıfıra; fincan dolu → boş; torba karnın içine çekilir; üfleme yukarı çekiştir', () => {
    expect([0, 0.2, 0.4, 0.7, 0.99, 1].map(gurultuKademesi)).toEqual([3, 3, 2, 1, 1, 0]);
    expect([0, 1, 2, 3].map(y => fincanKademesi(y, 3))).toEqual([0, 1, 2, 3]);
    expect([0, 1, 2].map(y => fincanKademesi(y, 2))).toEqual([0, 2, 3]);
    expect(torbaYeri({ x: KARIN_ELIPS.x, y: KARIN_ELIPS.y })).toEqual({ x: KARIN_ELIPS.x, y: KARIN_ELIPS.y });
    const disari = torbaYeri({ x: KARIN_ELIPS.x + 500, y: KARIN_ELIPS.y });
    expect(karindaMi(disari)).toBe(true); expect(disari.x).toBeLessThan(KARIN_ELIPS.x + KARIN_ELIPS.yariEn);
    const b = { x: 260, y: 400 };
    expect(ufleme(b, { x: 260, y: 400 - UFLE_BOY })).toBe(true);
    expect(ufleme(b, { x: 260, y: 400 - UFLE_BOY + 10 })).toBe(false);
    expect(ufleme(b, { x: 700, y: 400 - UFLE_BOY })).toBe(false);
    expect(yudumAdimi(100, true, 50)).toBe(150); expect(yudumAdimi(100, false, 50)).toBe(50);
    expect(agizdaMi(BAS.agiz)).toBe(true); expect(burundaMi(BAS.burun)).toBe(true); expect(burundaMi(BAS.agiz)).toBe(false);
  });
  it('el hızı kare hızından bağımsız: 60, 120 ve 240 Hz ekranda aynı yavaş el aynı hızda ölçülür', () => {
    // parmak 0,5 px/ms ile gider; dokunma olayları 60 Hz'de gelir, kareler 60/120/240 Hz
    for (const hz of [60, 120, 240]) {
      const dt = 1000 / hz;
      let ort = 0, sonOlay = 0, son: number[] = [];
      for (let t = dt; t <= 1000; t += dt) {
        const olay = Math.floor(t / (1000 / 60));
        const yol = olay > sonOlay ? (olay - sonOlay) * (1000 / 60) * 0.5 : 0; sonOlay = olay;
        ort = ortalamaHiz(ort, yol / dt, dt);
        if (t > 800) son.push(ort);
      }
      expect(Math.max(...son), hz + ' Hz').toBeLessThan(0.75); expect(Math.min(...son), hz + ' Hz').toBeGreaterThan(0.3);
    }
    // hızlı sarsıntı birkaç karede yakalanır
    let o = 0; for (let i = 0; i < 6; i++) o = ortalamaHiz(o, 8, 16);
    expect(o).toBeGreaterThan(5);
  });
  it('yaşa göre zorluk: küçükler kolay, büyükler zor', () => {
    const [k, o, b] = [ZORLUK['2-3'], ZORLUK['4'], ZORLUK['5+']];
    expect(k.dinleR).toBeGreaterThan(o.dinleR); expect(o.dinleR).toBeGreaterThan(b.dinleR);
    expect(k.ov).toBeLessThan(o.ov); expect(o.ov).toBeLessThan(b.ov);
    expect(k.ovHiz).toBeGreaterThan(o.ovHiz); expect(o.ovHiz).toBeGreaterThan(b.ovHiz);
    expect(k.isit).toBeLessThan(b.isit); expect(k.yudum).toBeLessThanOrEqual(b.yudum);
  });
});

describe('senaryo, ifadeler ve sesler', () => {
  it('sekiz adım sırayla', () => {
    expect(ADIMLAR).toHaveLength(8);
    expect(ADIMLAR).toEqual(ASAMALAR.filter(a => !['giris', 'canta', 'kutlama', 'son'].includes(a)));
    expect(sonrakiAsama('isit')).toBe('ov'); expect(sonrakiAsama('torba')).toBe('kutlama');
    expect(brief).toMatch(/\| 8 \| Torba/);
  });
  it('yüz ifadesi: tepkiler beklemeyi bastırır, kapanışta güler, ovulduktan sonra rahat', () => {
    const d = (x: Partial<BasDurumu>): BasDurumu => ({ asama: 'dinle', gurKalan: 0, kikirKalan: 0, gidikKalan: 0, utanKalan: 0, rahatKalan: 0, usuduKalan: 0, koklarKalan: 0, uflerKalan: 0, yudumKalan: 0, mutluKalan: 0, havKalan: 0, kirp: false, an: 0, ...x });
    expect(basPozu(d({}))).toBe('uzgun');
    expect(basPozu(d({ gurKalan: 100 }))).toBe('gur');
    expect(basPozu(d({ gurKalan: 100, usuduKalan: 100 }))).toBe('usudu');
    expect(basPozu(d({ gidikKalan: 100, an: 0 }))).toBe('gidik0'); expect(basPozu(d({ gidikKalan: 100, an: KARE_MS.gidik }))).toBe('gidik1');
    expect(basPozu(d({ asama: 'ic' }))).toBe('rahat');
    expect(basPozu(d({ asama: 'son', gurKalan: 100 }))).toBe('gulen');
    expect(basPozu(d({ kirp: true }))).toBe('kirp');
  });
  it('Lokum\'un sözleri yazılı ve kayıtlı (klon sesleri); efektler kayıtlı', () => {
    expect(Object.keys(SOZLER).length).toBeGreaterThanOrEqual(10);
    for (const s of Object.values(SOZLER)) expect(s.length).toBeLessThan(60);
    for (const e of EFEKTLER) expect(existsSync(`assets/doktor/karin/ses/${e}.mp3`), e).toBe(true);
    expect(readFileSync('doktor/src/ses.ts', 'utf8')).toContain('assets/doktor/karin/ses/');
    // giriş yolu (giris.ts 23 Kasım'dan beri `oyun === …` yazıyor; eski `p.get('oyun') === …` de geçer)
    expect(readFileSync('doktor/src/giris.ts', 'utf8')).toMatch(/(p\.get\('oyun'\)|\boyun) === 'karin'/);
    // her söz kayıtlı (23 Kasım: karakter klonlarıyla seslendirildi, Scribe'dan geçti); ses havuzu tek, ad bir klasörde
    const sesler = readdirSync('assets/doktor').flatMap(k => existsSync(`assets/doktor/${k}/ses`) ? readdirSync(`assets/doktor/${k}/ses`) : []);
    for (const id of Object.keys(SOZLER)) expect(sesler.filter(f => f === id + '.mp3').length, id).toBe(1);
  });
});
