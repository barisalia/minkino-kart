import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ADIMLAR, ALETLER, ASAMALAR, ATKI_TAMAM, BAS, BUHAR_DUGMESI, BURUN_DUGMESI, CEK_ESIGI, EFEKTLER, HAPSU, HAPSU_DONGU, HAPSU_DOSYALAR, KAPANIS, KARE_MS, KASE, KUTU_DUGMESI, MASA, MENDIL_KUTUSU, NEFES_UZUN, OPAK, ORTU_TAMAM, RAF, SOZLER, TUVAL, ZORLUK,
  asamaAleti, atkiAdimi, atkiBaslangici, atkiOrani, basPozu, burundaMi, cekmeKaresi, cekmeUzunlugu, dokAdimi, egimAdimi, hapsuEvresi, kaseKademesi, kaseUstundeMi, nefesBitti, ortuAdimi, papatyaKademesi, sallaAdimi, sallaBaslangici, silAdimi, sonrakiAsama, yakaladiMi, yuzdeMi,
  type BasDurumu,
} from '../../doktor/src/vaka-hapsu/veri';
import { ORTAK_DOSYALAR, ORTAK_EFEKTLER } from '../../doktor/src/vaka-kit/ortak';
import { EFEKTLER as VAKA_EFEKTLER, EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, HUB, VAKA_DOSYALAR, YAKIN, sahneOlcegi } from '../../doktor/src/vaka/veri';
import { SOZLER as DIS_SOZLERI } from '../../doktor/src/dis/veri';
import { SOZLER as ATES_SOZLERI } from '../../doktor/src/vaka-ates/veri';
import { SOZLER as BOYA_SOZLERI } from '../../doktor/src/vaka-boya/veri';

// Minik Doktor · beşinci vaka "Pamuk'un Hapşırığı" (doktor/src/vaka-hapsu/), sekiz adım. Çizim adları, ölçüleri ve kare
// dizileri parça brief'iyle (ekip/senaryo/DOKTOR-Y5-Y6-PARCALAR.md) karşılaştırılır; mekaniklerin saf hesabı sınanır.

const tum = readFileSync('ekip/senaryo/DOKTOR-Y5-Y6-PARCALAR.md', 'utf8');
const bas = tum.indexOf('## Paket Doktor-Y5');
const son = tum.indexOf('\n## Paket Doktor-Y6');
const brief = tum.slice(bas, son > 0 ? son : undefined);
const ortak = tum.slice(0, bas);

describe('Paket Doktor-Y5: çizim adları, ölçüler ve kare dizileri brief\'le birebir', () => {
  it('81 çizim, hepsi bir kez; her ad brief\'te geçer; tuvaller tam', () => {
    expect(bas).toBeGreaterThan(0);
    expect(HAPSU_DOSYALAR).toHaveLength(81);
    expect(new Set(HAPSU_DOSYALAR).size).toBe(81);
    for (const ad of HAPSU_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...HAPSU_DOSYALAR].sort());
    expect(brief).toContain('81 çizim');
    expect(OPAK).toEqual(['hapsu-fon']);
  });
  it('sayfa başına en çok 8; toplam 81; her sayfanın adları başlığında', () => {
    const sayfalar = [...brief.matchAll(/^### Sayfa \d+ · [^\n]*?\((\d+)[,)][^\n]*→ ([^\n]+)$/gm)];
    expect(sayfalar.length).toBe(11);
    for (const m of sayfalar) { const n = Number(m[1]); expect(n).toBeLessThanOrEqual(8); expect((m[2].match(/`[^`]+`/g) ?? []).length, m[0]).toBe(n); }
    expect(sayfalar.reduce((a, m) => a + Number(m[1]), 0)).toBe(81);
  });
  it('kare dizileri sıralı ve aynı tuvalde; 16 yüz ifadesi', () => {
    for (const d of [HAPSU.kase, HAPSU.atkiSarili, HAPSU.kalp, HAPSU.mendilCek, HAPSU.mendilUcan, HAPSU.hapsuRuzgar, HAPSU.ucanPamuk, HAPSU.suAkis, HAPSU.sicrama, HAPSU.buhar, HAPSU.buharBurun, HAPSU.koku, HAPSU.papatya, HAPSU.battaniyeKivrim]) {
      d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i}$`)));
      expect(new Set(d.map(ad => TUVAL[ad].join('×'))).size).toBe(1);
    }
    HAPSU.papatyaYuzen.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i + 1}$`)));
    expect(Object.keys(HAPSU.bas)).toHaveLength(16);
    for (const k of Object.values(KARE_MS)) { expect(k).toBeGreaterThanOrEqual(60); expect(k).toBeLessThanOrEqual(320); }
  });
  it('Dikenli Pati\'den aynen kullanılanlar ortak bölümde; adlar çakışmaz', () => {
    for (const ad of ORTAK_DOSYALAR) { expect(VAKA_DOSYALAR).toContain(ad); expect(ortak, ad).toContain('`' + ad + '`'); }
    for (const ad of HAPSU_DOSYALAR) expect(VAKA_DOSYALAR, ad).not.toContain(ad);
  });
  it('yerleşim sayıları brief\'te yazanlarla aynı', () => {
    expect(brief).toContain('Burun ucu (860, 470); ağız (860, 540)'); expect(BAS.burun).toEqual({ x: 860, y: 470 }); expect(BAS.agiz).toEqual({ x: 860, y: 540 });
    expect(brief).toContain('Boynun önü x 640…1080, y 640…760'); expect(BAS.boyun).toEqual({ sol: 640, sag: 1080, ust: 640, alt: 760 });
    expect(brief).toContain('x 60…420, y 400…760'); expect(MENDIL_KUTUSU.kutu).toEqual({ sol: 60, ust: 400, g: 360, y: 360 });
    expect(brief).toContain('ağzı (180, 80)'); expect(MENDIL_KUTUSU.agiz).toEqual({ x: MENDIL_KUTUSU.kutu.sol + 180, y: MENDIL_KUTUSU.kutu.ust + 80 });
    expect(brief).toContain('x 600…1120, y 660…960'); expect(KASE.kutu).toEqual({ sol: 600, ust: 660, g: 520, y: 300 });
    expect(brief).toContain('kâse çiziminde (260, 100)'); expect(KASE.yuz).toEqual({ x: KASE.kutu.sol + 260, y: KASE.kutu.ust + 100 });
    expect(brief).toContain('(1690, 330)'); expect(RAF.demlik).toEqual({ x: 1690, y: 330 }); expect(brief).toContain('(1880, 360)'); expect(RAF.kavanoz).toEqual({ x: 1880, y: 360 });
    expect(brief).toContain('baş merkezi (560, 300), burun (560, 340), göğüs (560, 540)');
    expect(MASA.burun).toEqual({ x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 340 });
  });
  it('aletlerin ucu çizimdeki noktada', () => {
    expect(brief).toContain('Tutulan yer (300, 120), ortası (300, 330)'); expect(ALETLER.mendil.tut).toEqual([0.5, 120 / 600]); expect(ALETLER.mendil.uc).toEqual([0.5, 330 / 600]);
    expect(brief).toContain('tutulan yer (450, 300); emzik solda, ucu (90, 230)'); expect(ALETLER.demlik.tut).toEqual([450 / 600, 300 / 600]); expect(ALETLER.demlik.uc).toEqual([90 / 600, 230 / 600]);
    expect(brief).toContain('Ağzı üstte (300, 120); tutulan yer gövde (300, 420)'); expect(ALETLER.kavanoz.uc).toEqual([0.5, 120 / 600]);
    expect(brief).toContain('Üst kenarının ortası (300, 150) tutulan yer'); expect(ALETLER.battaniye.tut).toEqual([0.5, 150 / 600]);
    expect(brief).toContain('Alt ortası (120, 390) kutunun ağzına oturur');
  });
});

describe('senaryo: sekiz adım', () => {
  it('aşamalar sırayla; her adımın aleti ya da düğmesi var', () => {
    expect(ADIMLAR).toHaveLength(8);
    expect(ADIMLAR.flat()).toEqual(ASAMALAR.filter(a => !['giris', 'canta', 'kutlama', 'son'].includes(a)));
    expect(sonrakiAsama('sil')).toBe('dok'); expect(sonrakiAsama('ort')).toBe('kutlama');
    expect(ASAMALAR.map(asamaAleti).filter(Boolean)).toEqual(['mendil', 'mendil', 'mendil', 'demlik', 'kavanoz', 'atki', 'battaniye']);
    expect(brief).toMatch(/\| 8 \| Battaniye/);
  });
  it('yaş basamakları: küçükte daha az ve daha geniş', () => {
    expect(ZORLUK['2-3'].hapsu).toBe(1); expect(ZORLUK['5+'].hapsu).toBe(3);
    expect(ZORLUK['2-3'].pencere).toBeGreaterThan(ZORLUK['5+'].pencere);
    expect(ZORLUK['2-3'].egim).toBeLessThan(ZORLUK['5+'].egim);
    for (const k of ['sil', 'dok', 'papatya', 'nefes', 'nefesMs'] as const) expect(ZORLUK['2-3'][k], k).toBeLessThanOrEqual(ZORLUK['5+'][k]);
  });
  it('kapanış en çok 2 sn; sözler 8–12, efektler 5–10; adlar öbür vakalarla çakışmaz; emir yok', () => {
    expect(KAPANIS.parlama + KAPANIS.kamera + KAPANIS.sevinc).toBeLessThanOrEqual(2000);
    const n = Object.keys(SOZLER).length; expect(n).toBeGreaterThanOrEqual(8); expect(n).toBeLessThanOrEqual(12);
    expect(EFEKTLER.length).toBeGreaterThanOrEqual(5); expect(EFEKTLER.length).toBeLessThanOrEqual(10);
    for (const e of ORTAK_EFEKTLER) expect(VAKA_EFEKTLER as readonly string[]).toContain(e);
    for (const ad of Object.keys(SOZLER)) for (const o of [DIS_SOZLERI, ATES_SOZLERI, BOYA_SOZLERI]) expect(Object.keys(o)).not.toContain(ad);
    for (const s of Object.values(SOZLER)) expect(s).not.toMatch(/\b(dokun|sür|tut|salla|koy|çek)\b/i);
  });
});

describe('yerleşim', () => {
  it('burun yüzde; kutu, kâse, raf yüzün dışında; düğmeler en küçük ekranda 64 px', () => {
    expect(yuzdeMi(BAS.burun)).toBe(true); expect(burundaMi(BAS.burun)).toBe(true); expect(burundaMi(BAS.agiz)).toBe(true);
    expect(yuzdeMi(MENDIL_KUTUSU.agiz)).toBe(false); expect(yuzdeMi(RAF.demlik)).toBe(false); expect(yuzdeMi(RAF.kavanoz)).toBe(false);
    expect(kaseUstundeMi({ x: KASE.yuz.x, y: KASE.yuz.y - 200 })).toBe(true); expect(kaseUstundeMi(RAF.demlik)).toBe(false);
    expect(BUHAR_DUGMESI.ust + BUHAR_DUGMESI.y).toBeLessThan(YAKIN.serit.ust);
    expect(BUHAR_DUGMESI.sol + BUHAR_DUGMESI.g).toBeLessThan(YAKIN.kino.sol);
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    for (const b of [KUTU_DUGMESI, RAF.dugme, BURUN_DUGMESI[1]]) expect(b * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
  });
});

describe('el hareketleri', () => {
  it('mendil: yukarı çektikçe üç karede uzar, eşikte kopar', () => {
    const a = MENDIL_KUTUSU.agiz;
    expect(cekmeUzunlugu({ x: a.x, y: a.y + 40 })).toBe(0);
    expect(cekmeUzunlugu({ x: a.x, y: a.y - 100 })).toBe(100);
    expect([0, 70, 140, CEK_ESIGI].map(u => cekmeKaresi(u))).toEqual([0, 1, 2, 2]);
  });
  it('hapşırık: kaşınma, hap, HAPŞU, dinlenme döngüsü; pencere içinde yakalanır', () => {
    const D = HAPSU_DONGU;
    expect(hapsuEvresi(0)).toBe('hap0'); expect(hapsuEvresi(D.hap0)).toBe('hap1'); expect(hapsuEvresi(D.hap0 + D.hap1)).toBe('hapsu'); expect(hapsuEvresi(D.hap0 + D.hap1 + D.hapsu)).toBe('dinlen');
    expect(hapsuEvresi(D.hap0 + D.hap1 + D.hapsu + D.dinlen)).toBe('hap0');
    expect(yakaladiMi(true, 99999, 500)).toBe(true); expect(yakaladiMi(false, 300, 500)).toBe(true); expect(yakaladiMi(false, 800, 500)).toBe(false);
  });
  it('silme ve dökme: hareketle; demlik yalnız kâsenin üstünde eğilir', () => {
    expect(silAdimi(0, true, 40, 16, 700)).toBeGreaterThan(40); expect(silAdimi(10, false, 40, 16, 700)).toBe(10);
    expect(egimAdimi(0, true, 30, 16)).toBe(18); expect(egimAdimi(30, true, -20, 16)).toBe(18); expect(egimAdimi(30, false, 30, 100)).toBeLessThan(30);
    expect(dokAdimi(0, 10, 28, 100, 1300)).toBe(0); expect(dokAdimi(0, 40, 28, 100, 1300)).toBeGreaterThan(60);
    expect([0, 1, 433, 434, 1300].map(v => kaseKademesi(v, 1300))).toEqual([0, 1, 1, 2, 3]);
  });
  it('papatya: kavanoz kâsenin üstünde yukarı aşağı sallanınca; üç kademe', () => {
    let d = sallaBaslangici();
    for (const v of [400, 440, 480, 500, 460, 420, 380, 360, 400, 450]) d = sallaAdimi(d, v, true, 16);
    expect(d.sayi).toBe(2);
    let dis = sallaBaslangici();
    for (const v of [400, 480, 400, 480]) dis = sallaAdimi(dis, v, false, 16);
    expect(dis.sayi).toBe(0);
    expect([0, 1, 2, 3, 4].map(s => papatyaKademesi(s, 4))).toEqual([0, 1, 2, 3, 3]);
  });
  it('nefes: kısa sayılmaz, uzun komik', () => {
    expect(nefesBitti(200, 650)).toBe('kisa'); expect(nefesBitti(900, 650)).toBe('tamam'); expect(nefesBitti(NEFES_UZUN + 10, 650)).toBe('uzun');
  });
  it('atkı boynun önünde boydan boya; battaniye aşağıdan yukarı', () => {
    let d = atkiBaslangici();
    for (let x = 600; x <= 1120; x += 20) d = atkiAdimi(d, { x, y: 700 });
    expect(atkiOrani(d)).toBe(1); expect(ATKI_TAMAM).toBeLessThan(1);
    expect(atkiOrani(atkiAdimi(atkiBaslangici(), { x: 860, y: 300 }))).toBe(0);
    let o = 0; for (let y = BAS.gogus.alt; y >= BAS.gogus.ust; y -= 20) o = ortuAdimi(o, { x: 860, y });
    expect(o).toBe(1); expect(ortuAdimi(0.5, { x: 200, y: 700 })).toBe(0.5); expect(ORTU_TAMAM).toBeLessThan(1);
  });
});

describe('yüz ifadesi', () => {
  const d: BasDurumu = { asama: 'mendil', evre: null, sikikKalan: 0, rahatKalan: 0, kikirKalan: 0, sisikKalan: 0, nefes: null, esneKalan: 0, mirr: false, kirp: false, an: 0 };
  it('her an bir tepki', () => {
    expect(basPozu(d)).toBe('uzgun');
    expect(basPozu({ ...d, kirp: true })).toBe('kirp');
    expect(basPozu({ ...d, an: 3 * 140 })).toBe('kasin0'); expect(basPozu({ ...d, an: 4 * 140 })).toBe('kasin1');
    expect(basPozu({ ...d, asama: 'hapsu', evre: 'hap0' })).toBe('hap0'); expect(basPozu({ ...d, asama: 'hapsu', evre: 'hapsu' })).toBe('hapsu');
    expect(basPozu({ ...d, kikirKalan: 100, evre: 'hap1' })).toBe('kikir');
    expect(basPozu({ ...d, nefes: 'al' })).toBe('nefesAl'); expect(basPozu({ ...d, nefes: 'ver' })).toBe('nefesVer');
    expect(basPozu({ ...d, sisikKalan: 10, nefes: 'al' })).toBe('sisik');
    expect(basPozu({ ...d, rahatKalan: 10 })).toBe('rahat'); expect(basPozu({ ...d, sikikKalan: 10 })).toBe('sikik');
    expect(basPozu({ ...d, esneKalan: 10 })).toBe('esne'); expect(basPozu({ ...d, mirr: true })).toBe('mirr');
    expect(basPozu({ ...d, asama: 'son', mirr: true })).toBe('gulen');
  });
});
