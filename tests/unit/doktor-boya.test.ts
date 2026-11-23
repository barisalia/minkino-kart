import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ADIMLAR, ALETLER, ALET_SIRASI, ASAMALAR, BALONCUKLAR, BALONCUK_DUGMESI, BENEKLER, BENEK_MS, BENEK_YARICAPI, BOYA, BOYA_DOSYALAR, BURUN, EFEKTLER, KAPANIS, KARE_MS, KOVA, LEKELER, LEKE_TAMAM, MASA, OPAK, ORTAK_DOSYALAR, ORTAK_EFEKTLER, PATILER, PIS_ARALIGI, PIS_MS, SOZLER, SUNGER_DUGMESI, TUVAL, YANLIS_OVMA, YUZ, ZORLUK,
  asamaAleti, asamalar, aynaAdimi, aynadaMi, basPozu, benekAdimi, calkalaAdimi, calkalaBaslangici, kirKademesi, kirSiniri, kopukKademesi, kopurtAdimi, kovadaMi, kurulaAdimi, lekeBittiMi, lekeBul, lekeEkle, lekeIzgarasi, lekeOrani,
  mildaMi, ovAdimi, ovmaSayaciAdimi, ovmaSayaciBaslangici, pisAdimi, pisBaslangici, secilenLekeler, sisNoktasi, sonrakiAsama, suKademesi, sungerdeMi, toplamOran,
  type BasDurumu, type Damla,
} from '../../doktor/src/vaka-boya/veri';
import { ATES_DOSYALAR } from '../../doktor/src/vaka-ates/veri';
import { EFEKTLER as VAKA_EFEKTLER, EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, HUB, SAHNE, VAKA_DOSYALAR, YAKIN, sahneOlcegi } from '../../doktor/src/vaka/veri';
import { SOZLER as DIS_SOZLERI } from '../../doktor/src/dis/veri';

// Minik Doktor · dördüncü vaka "Mila'nın Boya Lekeleri" (doktor/src/vaka-boya/), sekiz adımlı elit sürüm (Barış'ın temel kuralı,
// 23 Kasım). Çizim adları, ölçüleri ve kare dizileri parça brief'iyle (ekip/senaryo/DOKTOR-Y3-Y4-PARCALAR.md) karşılaştırılır.

const tum = readFileSync('ekip/senaryo/DOKTOR-Y3-Y4-PARCALAR.md', 'utf8');
const bas = tum.indexOf('## Paket Doktor-Y4');
const brief = tum.slice(bas);
const ortak = tum.slice(0, tum.indexOf('## Paket Doktor-Y3'));

describe('Paket Doktor-Y4: çizim adları, ölçüler ve kare dizileri brief\'le birebir', () => {
  it('83 çizim, hepsi bir kez; her ad brief\'te geçer; tuvaller tam', () => {
    expect(bas).toBeGreaterThan(0);
    expect(BOYA_DOSYALAR).toHaveLength(83);
    expect(new Set(BOYA_DOSYALAR).size).toBe(83);
    for (const ad of BOYA_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...BOYA_DOSYALAR].sort());
    expect(brief).toContain('83 çizim');
    expect(OPAK).toEqual(['boya-fon']);
  });
  it('sayfa başına en çok 8 çizim; sayfaların toplamı 83; her sayfanın adları başlığında', () => {
    const sayfalar = [...brief.matchAll(/^### Sayfa \d+ · [^\n]*?\((\d+)[,)][^\n]*→ ([^\n]+)$/gm)];
    expect(sayfalar.length).toBe(12);
    for (const m of sayfalar) { const n = Number(m[1]); expect(n).toBeLessThanOrEqual(8); expect((m[2].match(/`[^`]+`/g) ?? []).length, m[0]).toBe(n); }
    expect(sayfalar.reduce((a, m) => a + Number(m[1]), 0)).toBe(83);
  });
  it('kare dizileri sıralı adlarla ve aynı tuvalde', () => {
    for (const d of [BOYA.kovaDalga, BOYA.kovaSicrama, BOYA.kopukPof, BOYA.baloncuk, BOYA.baloncukPatla, BOYA.benekPit, BOYA.sis, BOYA.damlaSuzul, BOYA.havluOvus, BOYA.tuyPof, BOYA.aynaParilti, BOYA.kalp]) {
      d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i}$`)));
      expect(new Set(d.map(ad => TUVAL[ad].join('×'))).size).toBe(1);
    }
    for (const d of [BOYA.kovaSu, BOYA.sungerKopuk, BOYA.sungerKirli]) d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i + 1}$`)));
    expect(Object.keys(BOYA.bas)).toHaveLength(12);
    for (const k of Object.values(KARE_MS)) { expect(k).toBeGreaterThanOrEqual(60); expect(k).toBeLessThanOrEqual(300); }
  });
  it('ortak çizimler Dikenli Pati\'de var; adlar öbür paketlerle çakışmaz (Y3 ile yalnız damla, ayrı klasörde)', () => {
    for (const ad of ORTAK_DOSYALAR) { expect(VAKA_DOSYALAR, ad).toContain(ad); expect(ortak, ad).toContain('`' + ad + '`'); }
    for (const ad of BOYA_DOSYALAR) expect(VAKA_DOSYALAR, ad).not.toContain(ad);
    expect(BOYA_DOSYALAR.filter(ad => ATES_DOSYALAR.includes(ad))).toEqual(['damla']);
  });
  it('yerleşim sayıları brief\'te yazanlarla aynı', () => {
    const yaz = (l: { x: number; y: number }) => `(${l.x}, ${l.y})`;
    for (const l of LEKELER) expect(brief, l.yer).toContain(`${yaz(l)} yarıçap ${l.r}`);
    expect(brief).toContain(`Burun** ${yaz(BURUN)}`);
    for (const b of BENEKLER) expect(brief).toContain(yaz(b));
    expect(brief).toContain('x 40…460, y 400…820'); expect(KOVA.kutu).toEqual({ sol: 40, ust: 400, g: 420, y: 420 });
    expect(brief).toContain('kova çiziminde (210, 130)'); expect(KOVA.yuz).toEqual({ x: KOVA.kutu.sol + 210, y: KOVA.kutu.ust + 130 });
    expect(brief).toContain('(250, 380) çevresinde'); expect(KOVA.sunger).toEqual({ x: 250, y: 380 });
    expect(brief).toContain('x 620…1140, y 700…920'); expect(PATILER).toEqual({ sol: 620, ust: 700, g: 520, y: 220 });
    expect(brief).toContain('baş merkezi (560, 300), yüz (560, 330), göğüs (560, 540)');
    expect(MASA.yuz).toEqual({ x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 330 });
  });
  it('aletlerin ucu çizimdeki noktada', () => {
    expect(brief).toContain('ortası (300, 310) tutulan yer'); expect(ALETLER.sabun.uc).toEqual([0.5, 310 / 600]);
    expect(brief).toContain('ortası (300, 300)'); expect(ALETLER.sunger.uc).toEqual([0.5, 0.5]);
    expect(brief).toContain('pamuk ucu (300, 60)'); expect(ALETLER.cubuk.uc).toEqual([0.5, 60 / 600]);
    expect(brief).toContain('ucu (130, 140)'); expect(ALETLER.sprey.uc).toEqual([130 / 600, 140 / 600]);
    expect(brief).toContain('(300, 180) tutulan yer'); expect(ALETLER.havlu.tut[1] * 600).toBe(180);
    expect(brief).toContain('Sapın ucu (300, 560) tutulan yer; camın ortası (300, 220)'); expect(ALETLER.ayna.uc).toEqual([0.5, 220 / 600]);
    expect(ALET_SIRASI).toEqual(['sabun', 'cubuk', 'sprey', 'havlu']);
  });
});

describe('senaryo: sekiz adım, her adımda el hareketi', () => {
  it('sekiz adım; aşamalar sırayla; çalkalama ovmanın içinde; 2–3 yaşta çubuk yok', () => {
    expect(ADIMLAR).toHaveLength(8);
    expect(ASAMALAR).toEqual(['giris', 'canta', 'kopurt', 'ov', 'calkala', 'cubuk', 'pisk', 'kurula', 'baloncuk', 'ayna', 'kutlama', 'son']);
    expect(sonrakiAsama('4', 'canta')).toBe('kopurt'); expect(sonrakiAsama('4', 'kopurt')).toBe('ov');
    expect(sonrakiAsama('4', 'ov')).toBe('cubuk'); expect(sonrakiAsama('4', 'calkala')).toBe('cubuk');
    expect(sonrakiAsama('2-3', 'ov')).toBe('pisk'); expect(sonrakiAsama('5+', 'kurula')).toBe('baloncuk'); expect(sonrakiAsama('5+', 'baloncuk')).toBe('ayna'); expect(sonrakiAsama('5+', 'ayna')).toBe('kutlama');
    expect(asamalar('2-3')).not.toContain('cubuk');
    expect(ASAMALAR.map(asamaAleti).filter(Boolean)).toEqual(['sabun', 'sunger', 'sunger', 'cubuk', 'sprey', 'havlu', 'ayna']);
    expect(brief).toMatch(/\| 8 \| Ayna/);
  });
  it('yaş basamakları: 2–3 iki renk, çubuk yok, üç baloncuk; 5+ yedi baloncuk', () => {
    expect(secilenLekeler('2-3').map(l => l.renk)).toEqual(['mavi', 'yesil']);
    expect(secilenLekeler('5+')).toHaveLength(4);
    expect(ZORLUK['2-3'].benek).toBe(0); expect(ZORLUK['2-3'].baloncuk).toBe(3); expect(ZORLUK['4'].baloncuk).toBe(5); expect(ZORLUK['5+'].baloncuk).toBe(7);
    expect(BALONCUKLAR.length).toBeGreaterThanOrEqual(ZORLUK['5+'].baloncuk);
    for (const k of ['kopurt', 'calkala', 'pis', 'ovma', 'ayna'] as const) expect(ZORLUK['2-3'][k], k).toBeLessThanOrEqual(ZORLUK['5+'][k]);
  });
  it('kapanış en çok 2 sn; sözler 8–12, efektler 5–10; adlar Mino\'nunkilerle çakışmaz', () => {
    expect(KAPANIS.parlama + KAPANIS.kamera + KAPANIS.sevinc).toBeLessThanOrEqual(2000);
    const n = Object.keys(SOZLER).length;
    expect(n).toBeGreaterThanOrEqual(8); expect(n).toBeLessThanOrEqual(12);
    expect(EFEKTLER.length).toBeGreaterThanOrEqual(5); expect(EFEKTLER.length).toBeLessThanOrEqual(10);
    for (const e of ORTAK_EFEKTLER) expect(VAKA_EFEKTLER as readonly string[]).toContain(e);
    for (const ad of Object.keys(SOZLER)) expect(Object.keys(DIS_SOZLERI)).not.toContain(ad);
    for (const s of Object.values(SOZLER)) expect(s).not.toMatch(/\b(dokun|sür|tut|ov|koy|sık)\b/i);
  });
});

describe('yerleşim', () => {
  it('lekeler yüzde/patide, birbirine değmez; benekler ayrı; kova ve sünger yüzün dışında; baloncuklar yüzün çevresinde', () => {
    for (const l of [...LEKELER, BURUN]) expect(mildaMi(l), l.yer).toBe(true);
    for (let i = 0; i < LEKELER.length; i++) for (let j = i + 1; j < LEKELER.length; j++) expect(Math.hypot(LEKELER[i].x - LEKELER[j].x, LEKELER[i].y - LEKELER[j].y)).toBeGreaterThan(LEKELER[i].r + LEKELER[j].r);
    for (const b of BENEKLER) { expect(mildaMi(b)).toBe(true); for (const l of LEKELER) expect(Math.hypot(b.x - l.x, b.y - l.y)).toBeGreaterThan(l.r); }
    for (let i = 0; i < BENEKLER.length; i++) for (let j = i + 1; j < BENEKLER.length; j++) expect(Math.hypot(BENEKLER[i].x - BENEKLER[j].x, BENEKLER[i].y - BENEKLER[j].y)).toBeGreaterThan(BENEK_YARICAPI);
    expect(kovadaMi(KOVA.yuz)).toBe(true); expect(mildaMi(KOVA.yuz)).toBe(false);
    expect(sungerdeMi(KOVA.sunger)).toBe(true); expect(mildaMi(KOVA.sunger)).toBe(false); expect(kovadaMi(KOVA.sunger)).toBe(false);
    for (const p of BALONCUKLAR) {
      expect(mildaMi(p)).toBe(false);
      expect(p.y + BALONCUK_DUGMESI / 2).toBeLessThan(YAKIN.serit.ust);
      expect(p.x + BALONCUK_DUGMESI / 2 < YAKIN.kino.sol || p.y + BALONCUK_DUGMESI / 2 < YAKIN.kino.ust).toBe(true);
      expect(p.x - BALONCUK_DUGMESI / 2).toBeGreaterThanOrEqual(0); expect(p.y - BALONCUK_DUGMESI / 2).toBeGreaterThanOrEqual(0);
    }
    for (let i = 0; i < BALONCUKLAR.length; i++) for (let j = i + 1; j < BALONCUKLAR.length; j++) expect(Math.hypot(BALONCUKLAR[i].x - BALONCUKLAR[j].x, BALONCUKLAR[i].y - BALONCUKLAR[j].y)).toBeGreaterThan(BALONCUK_DUGMESI * 0.9);
    expect(aynadaMi({ x: YUZ.x, y: YUZ.y - 40 })).toBe(true); expect(aynadaMi(KOVA.yuz)).toBe(false);
  });
  it('dokunma hedefleri en küçük ekranda da en az 64 px', () => {
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    expect(BALONCUK_DUGMESI * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(SUNGER_DUGMESI * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    expect(SAHNE.g).toBe(2048);
  });
});

describe('el hareketleri: ilerleme süreyle değil hareketle', () => {
  it('köpürtme: sabun süngerin üstünde ileri geri; süngerin dışında sayılmaz; köpük iki kademe', () => {
    let d = calkalaBaslangici();
    const y = KOVA.sunger.y;
    for (const x of [250, 280, 320, 330, 290, 250, 200, 190, 230, 280, 320]) d = kopurtAdimi(d, { x, y }, 16);
    expect(d.sayi).toBe(2);
    let dis = calkalaBaslangici();
    for (const x of [900, 980, 900, 820, 900]) dis = kopurtAdimi(dis, { x, y: 500 }, 16);
    expect(dis.sayi).toBe(0);
    expect([0, 2, 3, 5, 6].map(s => kopukKademesi(s, 6))).toEqual([0, 0, 1, 1, 2]);
  });
  it('ovma: sünger geçtiği lekeyi siler; gezdirmek bastırmaktan hızlı; kir iki kademe', () => {
    const iz = lekeIzgarasi(secilenLekeler('4'));
    const mavi = LEKELER[0];
    expect(lekeBul(iz, mavi)).toBe(0); expect(lekeBul(iz, { x: 700, y: 560 })).toBe(-1);
    for (let tur = 0; tur < 8; tur++) for (let a = 0; a < 40; a++) { const t = (a / 40) * Math.PI * 2; ovAdimi(iz, { x: mavi.x + Math.cos(t) * 50, y: mavi.y + Math.sin(t) * 50 }, 12, 16, 90); }
    expect(lekeBittiMi(iz, 0)).toBe(true); expect(lekeOrani(iz, 1)).toBe(0);
    expect(toplamOran(iz)).toBeGreaterThan(0.2);
    const a = lekeIzgarasi([LEKELER[1]]), b = lekeIzgarasi([LEKELER[1]]);
    for (let i = 0; i < 20; i++) { ovAdimi(a, LEKELER[1], 0, 16, 90); ovAdimi(b, LEKELER[1], 30, 16, 90); }
    expect(b.deger.reduce((x, y) => x + y, 0)).toBeGreaterThan(a.deger.reduce((x, y) => x + y, 0) * 5);
    expect(LEKE_TAMAM).toBeLessThan(1);
    const s = kirSiniri(iz, 4);
    expect([0, s / 2 - 1, s / 2, s - 1, s].map(k => kirKademesi(k, s))).toEqual([0, 0, 1, 1, 2]);
  });
  it('mor burun yeni bir leke olarak eklenir; kova suyu yıkadıkça üç kademede renklenir', () => {
    const iz = lekeEkle(lekeIzgarasi(secilenLekeler('4')), BURUN);
    expect(iz.lekeler).toHaveLength(5); expect(lekeBul(iz, BURUN)).toBe(4);
    expect([0, 1, 2, 3].map(y => suKademesi(y, 3))).toEqual([0, 1, 2, 3]);
    expect(suKademesi(1, 1)).toBe(3); expect(suKademesi(5, 3)).toBe(3);
  });
  it('çalkalama yalnız kovada', () => {
    let d = calkalaBaslangici();
    const y = KOVA.yuz.y + 50;
    for (const x of [250, 280, 320, 340, 300, 260, 200, 180, 220, 280, 330]) d = calkalaAdimi(d, { x, y }, 16);
    expect(d.sayi).toBe(2);
  });
  it('çubuk: kısa bir an durunca "pıt"; geçip gitmek almaz', () => {
    let k = BENEKLER.map(() => BENEK_MS);
    let r = benekAdimi(k, BENEKLER, BENEKLER[0], 60); k = r.kalan; expect(r.alinanlar).toEqual([]);
    r = benekAdimi(k, BENEKLER, BENEKLER[0], 60); expect(r.alinanlar).toEqual([0]);
  });
  it('yanlış hamle: yüzde gidip gelmek sayılır, düz geçmek sayılmaz', () => {
    let duz = ovmaSayaciBaslangici();
    for (let x = 1200; x >= 500; x -= 20) duz = ovmaSayaciAdimi(duz, { x, y: 500 });
    expect(duz.sayi).toBe(0);
    let ov = ovmaSayaciBaslangici();
    for (const x of [800, 840, 880, 920, 880, 840, 800, 760, 800, 840, 880]) ov = ovmaSayaciAdimi(ov, { x, y: 500 });
    expect(ov.sayi).toBeGreaterThanOrEqual(YANLIS_OVMA);
  });
  it('sprey: yeni yer ya da bekleme "pıs"; yüzün dışında sıkmaz; sis memenin solunda', () => {
    let d = pisBaslangici();
    let r = pisAdimi(d, YUZ, 16); expect(r.pis).toBe(true); d = r.d;
    r = pisAdimi(d, { x: YUZ.x + 20, y: YUZ.y }, 16); expect(r.pis).toBe(false); d = r.d;
    r = pisAdimi(d, { x: YUZ.x + PIS_ARALIGI + 5, y: YUZ.y }, 16); expect(r.pis).toBe(true); d = r.d;
    let n = 0; for (let t = 0; t < PIS_MS * 2 + 20; t += 16) { r = pisAdimi(d, { x: YUZ.x + PIS_ARALIGI + 5, y: YUZ.y }, 16); d = r.d; if (r.pis) n++; }
    expect(n).toBe(2);
    expect(pisAdimi(pisBaslangici(), KOVA.yuz, 16).pis).toBe(false);
    expect(sisNoktasi({ x: 1300, y: 500 }).x).toBeLessThan(1300);
  });
  it('havlu emer; ayna yüzün önündeyken dolar, çekilince kalır', () => {
    const d: Damla[] = [{ x: 800, y: 500, kalan: 70 }];
    expect(kurulaAdimi(d, { x: 800, y: 500 }, 40, 16)).toEqual([]);
    expect(kurulaAdimi(d, { x: 820, y: 510 }, 40, 16)).toEqual([0]);
    let a = 0; for (let i = 0; i < 10; i++) a = aynaAdimi(a, true, 50, 900);
    expect(a).toBe(500); expect(aynaAdimi(a, false, 500, 900)).toBe(500);
  });
});

describe('yüz ifadesi: her adımın kendi tepkisi', () => {
  const d: BasDurumu = { asama: 'ov', sikikKalan: 0, saskinKalan: 0, iyyKalan: 0, gidikKalan: 0, morKalan: 0, patiKalan: 0, ayna: 0, kirp: false, an: 0 };
  it('kıkır, kırp, gıdık, sıkık, şaşkın, iyy, mor, pati, aynaya bakış ve poz, gülme', () => {
    expect(basPozu(d)).toBe('kikir');
    expect(basPozu({ ...d, kirp: true })).toBe('kirp');
    expect(basPozu({ ...d, gidikKalan: 100 })).toBe('gidik');
    expect(basPozu({ ...d, sikikKalan: 100 })).toBe('sikik');
    expect(basPozu({ ...d, saskinKalan: 100 })).toBe('saskin');
    expect(basPozu({ ...d, iyyKalan: 100, saskinKalan: 100 })).toBe('iyy');
    expect(basPozu({ ...d, morKalan: 100, iyyKalan: 100 })).toBe('mor');
    expect(basPozu({ ...d, patiKalan: 100, an: 0 })).toBe('pati0'); expect(basPozu({ ...d, patiKalan: 100, an: 160 })).toBe('pati1');
    expect(basPozu({ ...d, ayna: 0.2 })).toBe('bakis'); expect(basPozu({ ...d, ayna: 0.6 })).toBe('ayna');
    expect(basPozu({ ...d, asama: 'son', morKalan: 100 })).toBe('gulen');
  });
});
