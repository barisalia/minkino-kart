import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ACIK_TAMAM, ADIMLAR, ALETLER, ASAMALAR, ASKI, BANTLAR, BANT_TAMAM, BAS, EFEKTLER, KANAT, KANAT_DOSYALAR, KANAT_DUGMESI, KANAT_YOLU, KAPANIS, KARE_MS, KINO_SOZU, MASA, OPAK, PITRAKLAR, PITRAK_DUGMESI, PITRAK_ESIGI, SAPKA_DUGMESI, SOZLER, TEPSI, TUVAL, TUY, UC_DUGMESI, ZORLUK,
  acAdimi, acilma, askiYerindeMi, asamalar, bantBaslangici, bantBul, bantOrani, basPozu, bastaMi, cirpAdimi, cirpBaslangici, dugumdeMi, gagadaMi, gerilmeKaresi, kanatKaresi, krakerAdimi, sonrakiAsama, taraAdimi, tepedeMi, tepsideMi, tuyAcisi, tuyOturduMu,
  type BasDurumu,
} from '../../doktor/src/vaka-kanat/veri';
import { ORTAK_DOSYALAR, ORTAK_EFEKTLER } from '../../doktor/src/vaka-kit/ortak';
import { EFEKTLER as VAKA_EFEKTLER, EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, HUB, VAKA_DOSYALAR, YAKIN, sahneOlcegi } from '../../doktor/src/vaka/veri';
import { SOZLER as HAPSU_SOZLERI, HAPSU_DOSYALAR } from '../../doktor/src/vaka-hapsu/veri';

// Minik Doktor · altıncı vaka "Polly'nin Karışık Kanadı" (doktor/src/vaka-kanat/), sekiz adım. Çizim adları, ölçüleri ve kare
// dizileri parça brief'iyle (ekip/senaryo/DOKTOR-Y5-Y6-PARCALAR.md) karşılaştırılır; mekaniklerin saf hesabı sınanır.

const tum = readFileSync('ekip/senaryo/DOKTOR-Y5-Y6-PARCALAR.md', 'utf8');
const bas = tum.indexOf('## Paket Doktor-Y6');
const brief = tum.slice(bas);
const ortak = tum.slice(0, tum.indexOf('## Paket Doktor-Y5'));

describe('Paket Doktor-Y6: çizim adları, ölçüler ve kare dizileri brief\'le birebir', () => {
  it('81 çizim, hepsi bir kez; her ad brief\'te geçer; tuvaller tam', () => {
    expect(bas).toBeGreaterThan(0);
    expect(KANAT_DOSYALAR).toHaveLength(81);
    expect(new Set(KANAT_DOSYALAR).size).toBe(81);
    for (const ad of KANAT_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...KANAT_DOSYALAR].sort());
    expect(brief).toContain('81 çizim');
    expect(OPAK).toEqual(['kanat-fon']);
  });
  it('sayfa başına en çok 8; toplam 81; her sayfanın adları başlığında', () => {
    const sayfalar = [...brief.matchAll(/^### Sayfa \d+ · [^\n]*?\((\d+)[,)][^\n]*→ ([^\n]+)$/gm)];
    expect(sayfalar.length).toBe(11);
    for (const m of sayfalar) { const n = Number(m[1]); expect(n).toBeLessThanOrEqual(8); expect((m[2].match(/`[^`]+`/g) ?? []).length, m[0]).toBe(n); }
    expect(sayfalar.reduce((a, m) => a + Number(m[1]), 0)).toBe(81);
  });
  it('kare dizileri sıralı ve aynı tuvalde; 15 yüz ifadesi', () => {
    for (const d of [KANAT.kanat, KANAT.kanatCirp, KANAT.pitrak, KANAT.pitrakGergin, KANAT.pit, KANAT.tarakTara, KANAT.parilti, KANAT.tuyKabarik, KANAT.tuyTik, KANAT.tuyUcan, KANAT.kanatRuzgar, KANAT.askiYerinde, KANAT.kraker, KANAT.kirinti, KANAT.nota, KANAT.son]) {
      d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i}$`)));
      expect(new Set(d.map(ad => TUVAL[ad].join('×'))).size).toBe(1);
    }
    expect(Object.keys(KANAT.bas)).toHaveLength(15);
    for (const k of Object.values(KARE_MS)) { expect(k).toBeGreaterThanOrEqual(60); expect(k).toBeLessThanOrEqual(300); }
  });
  it('ortak çizimler; adlar öbür paketlerle çakışmaz', () => {
    for (const ad of ORTAK_DOSYALAR) { expect(VAKA_DOSYALAR).toContain(ad); expect(ortak, ad).toContain('`' + ad + '`'); }
    for (const ad of KANAT_DOSYALAR) { expect(VAKA_DOSYALAR, ad).not.toContain(ad); }
    expect(KANAT_DOSYALAR.filter(ad => HAPSU_DOSYALAR.includes(ad))).toEqual([]);
  });
  it('yerleşim sayıları brief\'te yazanlarla aynı', () => {
    expect(brief).toContain('başın ortası (330, 260)'); expect(BAS.bas).toEqual({ x: 330, y: 260 });
    expect(brief).toContain('gaga ucu (520, 300)'); expect(BAS.gaga).toEqual({ x: 520, y: 300 });
    expect(brief).toContain('başın tepesi (320, 110)'); expect(BAS.tepe).toEqual({ x: 320, y: 110 });
    expect(brief).toContain('boynun arkası (300, 470)'); expect(BAS.boyun).toEqual({ x: 300, y: 470 });
    expect(brief).toContain('Kökü (480, 560)'); expect(KANAT_YOLU.kok).toEqual({ x: 480, y: 560 });
    expect(brief).toContain('Kapalıyken ucu (760, 780); tam açıkken ucu (1380, 420)'); expect(KANAT_YOLU.kapali).toEqual({ x: 760, y: 780 }); expect(KANAT_YOLU.acik).toEqual({ x: 1380, y: 420 });
    expect(brief).toContain('ortası (900, 600)'); expect(KANAT_YOLU.orta).toEqual({ x: 900, y: 600 });
    for (const p of PITRAKLAR) expect(brief).toContain(`(${p.x}, ${p.y})`);
    expect(brief).toContain('y 420, 520, 620, 720'); expect(BANTLAR.map(b => b.y)).toEqual([420, 520, 620, 720]);
    expect(brief).toContain('kökü (1180, 700)'); expect(TUY.kok).toEqual({ x: 1180, y: 700 });
    expect(brief).toContain('açısı 18°, başta −40°'); expect(TUY.hedefAci).toBe(18); expect(TUY.baslangicAci).toBe(-40);
    expect(brief).toContain('x 1580…1880, y 300…760'); expect(TEPSI.kutu).toEqual({ sol: 1580, ust: 300, g: 300, y: 460 });
    expect(brief).toContain('(1730, 650)'); expect(TEPSI.sapka).toEqual({ x: 1730, y: 650 });
    expect(brief).toContain('(560, 720) ve (1260, 800)'); expect(ASKI).toEqual({ sol: { x: 560, y: 720 }, sag: { x: 1260, y: 800 } });
    expect(brief).toContain('yaralı kanat (700, 420), göğüs (520, 520)'); expect(MASA.kanat).toEqual({ x: HUB.zipzip.sol + 700, y: HUB.zipzip.ust + 420 });
  });
  it('aletlerin ucu çizimdeki noktada', () => {
    expect(brief).toContain('tutulan yer (300, 160); dişlerin ortası (300, 430)'); expect(ALETLER.tarak.tut).toEqual([0.5, 160 / 600]); expect(ALETLER.tarak.uc).toEqual([0.5, 430 / 600]);
    expect(brief).toContain('Tutulan yer alt (200, 300); ısırılan kenar üst (200, 110)'); expect(ALETLER.kraker.tut).toEqual([0.5, 300 / 400]); expect(ALETLER.kraker.uc).toEqual([0.5, 110 / 400]);
    expect(brief).toContain('Kökü sol ortada (0, 60)');
  });
});

describe('senaryo ve sesler', () => {
  it('sekiz adım; 2–3 yaşta tüy adımı yok', () => {
    expect(ADIMLAR).toHaveLength(8);
    expect(ADIMLAR.flat()).toEqual(ASAMALAR.filter(a => !['giris', 'canta', 'kutlama', 'son'].includes(a)));
    expect(asamalar('2-3')).not.toContain('tuy'); expect(asamalar('4')).toContain('tuy');
    expect(sonrakiAsama('2-3', 'tara')).toBe('cirp'); expect(sonrakiAsama('4', 'tara')).toBe('tuy'); expect(sonrakiAsama('4', 'dugum')).toBe('kraker'); expect(sonrakiAsama('4', 'sapka')).toBe('kutlama');
    expect(brief).toMatch(/\| 8 \| Şapka/);
  });
  it('yaş: küçükte daha az ve daha hızlı açmaya izin', () => {
    expect(ZORLUK['2-3'].hiz).toBeGreaterThan(ZORLUK['5+'].hiz);
    for (const k of ['pitrak', 'bant', 'cirp', 'isirik'] as const) expect(ZORLUK['2-3'][k], k).toBeLessThanOrEqual(ZORLUK['5+'][k]);
    expect(PITRAKLAR.length).toBeGreaterThanOrEqual(ZORLUK['5+'].pitrak);
  });
  it('kapanış en çok 2 sn; Polly İngilizce, Kino Türkçe; kayıtların hepsi var; adlar çakışmaz', () => {
    expect(KAPANIS.parlama + KAPANIS.kamera + KAPANIS.sevinc).toBeLessThanOrEqual(2000);
    const n = Object.keys(SOZLER).length; expect(n).toBeGreaterThanOrEqual(8); expect(n).toBeLessThanOrEqual(12);
    for (const s of Object.values(SOZLER)) { expect(s).toMatch(/^[A-Za-z ,.!'-]+$/); expect(s.split(' ').length).toBeLessThanOrEqual(5); }
    for (const ad of [...Object.keys(SOZLER), KINO_SOZU, ...EFEKTLER]) expect(existsSync(`assets/doktor/kanat/ses/${ad}.mp3`), ad).toBe(true);
    for (const ad of Object.keys(SOZLER)) expect(Object.keys(HAPSU_SOZLERI)).not.toContain(ad);
    for (const e of ORTAK_EFEKTLER) expect(VAKA_EFEKTLER as readonly string[]).toContain(e);
  });
});

describe('yerleşim', () => {
  it('pıtraklar kanatta ve tepsi, baş ile çakışmaz; düğmeler en küçük ekranda 64 px', () => {
    for (const p of PITRAKLAR) { expect(tepsideMi(p)).toBe(false); expect(bastaMi(p)).toBe(false); expect(bantBul(p, 4)).toBeGreaterThanOrEqual(0); }
    // eğik tüyün dokunulan ortası (boyunun 0,6'sı) başta da yuvada da şeridin üstünde
    for (const a of [TUY.baslangicAci, TUY.hedefAci]) expect(TUY.kok.y + Math.sin((a * Math.PI) / 180) * TUY.boy * 0.6 + 130).toBeLessThan(YAKIN.serit.ust);
    for (const y of TEPSI.yerler) expect(tepsideMi(y)).toBe(true);
    expect(tepsideMi(TEPSI.sapka)).toBe(true);
    expect(gagadaMi(BAS.gaga)).toBe(true); expect(tepedeMi(BAS.tepe)).toBe(true); expect(dugumdeMi(BAS.boyun)).toBe(true);
    expect(askiYerindeMi(KANAT_YOLU.orta)).toBe(true); expect(askiYerindeMi(BAS.bas)).toBe(false);
    expect(TEPSI.kutu.ust + TEPSI.kutu.y).toBeLessThan(YAKIN.kino.ust);
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    for (const b of [UC_DUGMESI, PITRAK_DUGMESI, SAPKA_DUGMESI, KANAT_DUGMESI[1]]) expect(b * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
  });
});

describe('el hareketleri', () => {
  it('kanadı açmak: yavaşça ilerler, hızlı çekince "Ouch!" ve biraz geri; altı kare', () => {
    expect(acilma(KANAT_YOLU.kapali)).toBe(0); expect(acilma(KANAT_YOLU.acik)).toBe(1);
    expect(acAdimi(0.2, 0.4, 0.5, 1.8)).toEqual({ oran: 0.4, ouch: false });
    const h = acAdimi(0.4, 0.8, 3, 1.8); expect(h.ouch).toBe(true); expect(h.oran).toBeLessThan(0.4);
    expect([0, 0.19, 0.2, 0.5, 0.99, 1].map(kanatKaresi)).toEqual([0, 0, 1, 2, 4, 5]); expect(ACIK_TAMAM).toBeLessThan(1);
  });
  it('pıtrak gerilir, eşikte kopar', () => {
    expect(gerilmeKaresi(10)).toBe(0); expect(gerilmeKaresi(PITRAK_ESIGI / 2)).toBe(1);
  });
  it('tarama: yalnız kökten uca; ters gidiş ayrı; bant dolunca biter', () => {
    let d = bantBaslangici();
    const b = BANTLAR[0];
    for (let x = b.sol; x < b.sag; x += 40) d = taraAdimi(d, 0, { x, y: b.y }, { x: x + 40, y: b.y }).d;
    expect(bantOrani(d, 0)).toBeGreaterThanOrEqual(BANT_TAMAM);
    expect(taraAdimi(bantBaslangici(), 0, { x: 900, y: b.y }, { x: 860, y: b.y }).ters).toBe(true);
    expect(bantBul({ x: 900, y: 470 }, 4)).toBe(-1);
  });
  it('tüy: açı yuvaya yaklaşınca oturur', () => {
    const p = (a: number) => ({ x: TUY.kok.x + Math.cos((a * Math.PI) / 180) * 200, y: TUY.kok.y + Math.sin((a * Math.PI) / 180) * 200 });
    expect(tuyAcisi(p(40))).toBeCloseTo(40, 5);
    expect(tuyOturduMu(TUY.hedefAci + 5)).toBe(true); expect(tuyOturduMu(TUY.baslangicAci)).toBe(false);
  });
  it('çırpma: uçta yukarı aşağı; uzakta sayılmaz', () => {
    let d = cirpBaslangici();
    const u = KANAT_YOLU.acik;
    for (const yy of [0, 40, 80, 100, 60, 20, -20, -40, 0, 50]) d = cirpAdimi(d, { x: u.x, y: u.y + yy });
    expect(d.sayi).toBe(2);
    let dis = cirpBaslangici();
    for (const yy of [0, 100, 0, 100]) dis = cirpAdimi(dis, { x: 400, y: 900 + yy });
    expect(dis.sayi).toBe(0);
  });
  it('kraker: her girişte bir ısırık; içeride beklemek yenisini saymaz', () => {
    let d = { isirik: 0, icerde: false };
    for (const g of [true, true, false, true, false, false, true]) d = krakerAdimi(d, g);
    expect(d.isirik).toBe(3);
  });
});

describe('yüz ifadesi', () => {
  const d: BasDurumu = { asama: 'ac', ouchKalan: 0, heyKalan: 0, kikirKalan: 0, kirtKalan: 0, yayKalan: 0, sasirKalan: 0, gururKalan: 0, konusuyor: false, bakiyor: false, kirp: false, an: 0 };
  it('her an bir tepki; konuşurken gaga açılıp kapanır', () => {
    expect(basPozu(d)).toBe('endise'); expect(basPozu({ ...d, kirp: true })).toBe('kirp');
    expect(basPozu({ ...d, ouchKalan: 10 })).toBe('ouch'); expect(basPozu({ ...d, heyKalan: 10 })).toBe('hey');
    expect(basPozu({ ...d, kirtKalan: 10, an: 0 })).toBe('kirt0'); expect(basPozu({ ...d, kirtKalan: 10, an: 140 })).toBe('kirt1');
    expect(basPozu({ ...d, kikirKalan: 10 })).toBe('kikir'); expect(basPozu({ ...d, yayKalan: 10 })).toBe('yay'); expect(basPozu({ ...d, gururKalan: 10 })).toBe('gurur');
    expect(basPozu({ ...d, konusuyor: true, an: 0 })).toBe('gaga0'); expect(basPozu({ ...d, konusuyor: true, an: 150 })).toBe('gaga1');
    expect(basPozu({ ...d, bakiyor: true })).toBe('bakis'); expect(basPozu({ ...d, asama: 'kraker' })).toBe('huzur');
    expect(basPozu({ ...d, asama: 'son', ouchKalan: 10 })).toBe('mutlu');
  });
});
