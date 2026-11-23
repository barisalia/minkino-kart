import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ADIMLAR, AGIZ, ALETLER, ARALIKLAR, ASAMALAR, AYNA_YARICAPI, DIS_SAYISI, DISLER, DISLER_DOSYALAR, EFEKTLER, IP_ADIMI, KASE, KILLAR, KIRINTILAR, OPAK, SIRA_DISI, SOZLER, TATLAR, TUVAL, ZORLUK,
  aralikBul, bardakKaresi, calkalaAdimi, calkalaBaslangici, disBul, disYeri, fircaAdimi, gidikAdimi, gidikPozu, gidiktaMi, ipAdimi, ipBaslangici, killardaMi, notaHizi, seritKademesi, sonrakiAsama, temizSayisi, yanakBul, yuzdeMi,
} from '../../doktor/src/vaka-dis/veri';
import { A1_DOSYALAR } from '../../doktor/src/vaka/a1';
import { SAHNE, YAKIN } from '../../doktor/src/vaka/veri';

// Minik Doktor · "Mino'nun Kurabiyeli Dişleri" (Paket Doktor-Y2, yeni): dokuz adım, 99 kare. Adlar ve sayfalar
// ekip/senaryo/DOKTOR-Y2-PARCALAR.md ile karşılaştırılır; adımların saf hesabı sınanır.
const brief = readFileSync('ekip/senaryo/DOKTOR-Y2-PARCALAR.md', 'utf8');
const sayfalar = [...brief.matchAll(/^### Sayfa (\d+) · [^\n]*?\((\d+)[^)]*\)[^\n]*→ ([^\n]+)$/gm)].map(m => ({ no: +m[1], adet: +m[2], adlar: [...m[3].matchAll(/`([^`]+)`/g)].map(x => x[1]) }));

describe('Paket Doktor-Y2 (yeni): adlar, sayfalar ve ölçüler brief\'le birebir', () => {
  it('99 kare, hepsi bir kez; her biri brief\'te bir sayfada; sayfa başına en çok 8', () => {
    expect(DISLER_DOSYALAR).toHaveLength(99);
    expect(new Set(DISLER_DOSYALAR).size).toBe(99);
    expect(sayfalar.map(s => s.no)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    for (const s of sayfalar) { expect(s.adlar, 'sayfa ' + s.no).toHaveLength(s.adet); expect(s.adet).toBeLessThanOrEqual(8); }
    expect(sayfalar.flatMap(s => s.adlar).sort()).toEqual([...DISLER_DOSYALAR].sort());
    expect(brief).toContain('(99 çizim, 15 sayfa)');
  });
  it('her karenin tuvali yazılı; yalnız fon opak; adlar Dikenli Pati\'nin çizimleriyle çakışmaz', () => {
    for (const ad of DISLER_DOSYALAR) expect(TUVAL[ad], ad).toBeDefined();
    expect(Object.keys(TUVAL).sort()).toEqual([...DISLER_DOSYALAR].sort());
    expect(OPAK).toEqual([DISLER.fon]);
    // iskelet, vakanın klasöründe bulamadığını assets/doktor/vaka/ içinde arar: aynı ad orada varsa yanlış çizim açılır
    const vaka = new Set(readdirSync('assets/doktor/vaka').filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5)));
    for (const ad of DISLER_DOSYALAR) { expect(vaka.has(ad), ad).toBe(false); expect(A1_DOSYALAR, ad).not.toContain(ad); }
  });
  it('yakın plan ölçüleri brief\'te; dişler, kırıntılar, kıllar ve kâse yerinde', () => {
    expect(brief).toContain('**Üst diş sırası x 610…1110, y 585…690; alt diş sırası x 630…1090, y 765…850.**');
    expect(AGIZ.ust).toEqual({ sol: 610, ust: 585, g: 500, y: 105 }); expect(AGIZ.alt).toEqual({ sol: 630, ust: 765, g: 460, y: 85 });
    expect(brief).toContain('**altı diş, eşit genişlikte**'); expect(SIRA_DISI).toBe(6); expect(DIS_SAYISI).toBe(12);
    expect(brief).toContain('merkezleri (500, 640) ve (1220, 640)'); expect(AGIZ.yanak).toEqual([{ x: 500, y: 640 }, { x: 1220, y: 640 }]);
    expect(brief).toContain('kılların üst yüzü x 60…260, y 230');
    expect(KILLAR.sol).toBeGreaterThan(1430); expect(KILLAR.sag).toBeLessThan(2030); expect(KILLAR.y).toBeGreaterThan(440); expect(KILLAR.y).toBeLessThan(640);   // havlunun üstünde
    expect(brief).toContain('x 40…420, y 650…920'); expect(KASE.kutu).toEqual({ sol: 40, ust: 650, g: 380, y: 270 });
    // kırıntılar dişlerin üstünde ya da arasında; aynanın ışığı her birine ayrı ayrı değebilir
    for (const k of KIRINTILAR) { expect(k.x).toBeGreaterThan(AGIZ.ust.sol); expect(k.x).toBeLessThan(AGIZ.ust.sol + AGIZ.ust.g); expect(k.y).toBeGreaterThan(AGIZ.ust.ust); expect(k.y).toBeLessThan(AGIZ.alt.ust + AGIZ.alt.y); expect(k.cesit).toBeLessThan(3); }
    expect(AYNA_YARICAPI).toBeGreaterThanOrEqual(90);
    // alet şeridi ve Kino'nun köşesi boş kalır
    expect(AGIZ.gidik.y + AGIZ.gidik.ry).toBeLessThanOrEqual(SAHNE.y); expect(KASE.kutu.ust + KASE.kutu.y).toBeLessThanOrEqual(YAKIN.serit.ust);
    for (const a of Object.values(ALETLER)) { for (const v of [...a.tut, ...a.uc]) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(1); } }
  });
});

describe('dokuz adımın saf hesabı', () => {
  it('aşamalar sırayla; dokuz adım; yaş büyüdükçe iş artar', () => {
    expect(ADIMLAR).toHaveLength(9);
    expect(ASAMALAR.slice(2, 11)).toEqual(ADIMLAR);
    expect(sonrakiAsama('gidik')).toBe('ayna'); expect(sonrakiAsama('gulus')).toBe('kutlama'); expect(sonrakiAsama('son')).toBe('son');
    for (const k of ['gidik', 'kirinti', 'say', 'dis', 'temiz', 'su', 'calkala', 'aralik', 'gulus'] as const) { expect(ZORLUK['2-3'][k]).toBeLessThan(ZORLUK['4'][k]); expect(ZORLUK['4'][k]).toBeLessThanOrEqual(ZORLUK['5+'][k]); }
    expect(ZORLUK['5+'].kirinti).toBe(KIRINTILAR.length); expect(ZORLUK['5+'].temiz).toBe(DIS_SAYISI); expect(ZORLUK['5+'].aralik).toBe(ARALIKLAR.length);
    expect(ZORLUK['5+'].dil).toBe(true); expect(ZORLUK['2-3'].dil).toBe(false);
    for (const z of Object.values(ZORLUK)) expect(z.calkala % 2).toBe(0);             // su iki yanak arasında gidip gelir
  });
  it('gıdık: parmak gezdikçe birikir, durunca söner; yüz kapalıdan kıkıra geçer', () => {
    let b = 0;
    for (let i = 0; i < 10; i++) b = gidikAdimi(b, 30, 16, 450);
    expect(b).toBe(300);
    expect(gidikAdimi(b, 500, 16, 450)).toBe(360);                                     // tek karede en çok 60
    expect(gidikAdimi(b, 0, 1000, 450)).toBeLessThan(b);                               // durunca söner
    expect(gidikAdimi(5, 0, 5000, 450)).toBe(0); expect(gidikAdimi(440, 60, 16, 450)).toBe(450);
    expect(gidikPozu(0, 1000)).toBe('kapali'); expect(gidikPozu(0, 3050)).toBe('kapaliKirp'); expect(gidikPozu(0.3, 0)).toBe('dudak');
    expect(new Set([0, 150, 290, 430].map(an => gidikPozu(0.8, an))).size).toBe(2);
    expect(gidiktaMi({ x: AGIZ.gidik.x, y: AGIZ.gidik.y })).toBe(true); expect(gidiktaMi({ x: 100, y: 100 })).toBe(false);
  });
  it('dişler: on iki dişin her biri kendi merkezinden bulunur; notalar yükselir', () => {
    for (let i = 0; i < DIS_SAYISI; i++) expect(disBul(disYeri(i))).toBe(i);
    expect(disBul({ x: 860, y: 727 })).toBe(-1);                                       // iki sıranın arası (dil)
    expect(disBul({ x: 300, y: 640 })).toBe(-1);
    expect(notaHizi(1)).toBe(1); expect(notaHizi(8)).toBeGreaterThan(notaHizi(7));
  });
  it('macun: şerit üç kademede uzar; tüp kılların üstündeyken sayılır, yüzdeyken burna konar', () => {
    expect([0, 40, 60, 110, 150, 400].map(y => seritKademesi(y, 150))).toEqual([0, 0, 1, 2, 3, 3]);
    expect(killardaMi({ x: (KILLAR.sol + KILLAR.sag) / 2, y: KILLAR.y })).toBe(true); expect(killardaMi({ x: 860, y: 500 })).toBe(false);
    expect(yuzdeMi(AGIZ.burun)).toBe(true); expect(yuzdeMi({ x: (KILLAR.sol + KILLAR.sag) / 2, y: KILLAR.y })).toBe(false);          // fırça yüzün dışında
    expect(TATLAR).toEqual(['nane', 'portakal', 'muz']);
  });
  it('fırça: geçilen dişte yol birikir, hedefe ulaşınca temizdir; bardak boşalır', () => {
    const y = Array.from({ length: DIS_SAYISI }, () => 0);
    expect(fircaAdimi(y, 3, 40, 90)).toBe(false); expect(fircaAdimi(y, 3, 200, 90)).toBe(true);         // tek karede en çok 50
    expect(fircaAdimi(y, 3, 40, 90)).toBe(false);                                                        // temiz diş yeniden sayılmaz
    expect(fircaAdimi(y, -1, 40, 90)).toBe(false);
    expect(temizSayisi(y, 90)).toBe(1);
    expect([0, 0.4, 0.5, 0.99, 1].map(bardakKaresi)).toEqual([0, 0, 1, 1, 2]);
  });
  it('çalkalama: su bir yanaktan öbürüne geçtikçe sayılır; aynı yanak saymaz', () => {
    expect(yanakBul(AGIZ.yanak[0])).toBe(0); expect(yanakBul(AGIZ.yanak[1])).toBe(1); expect(yanakBul(AGIZ.merkez)).toBe(-1);
    let c = calkalaBaslangici();
    const s1 = calkalaAdimi(c, 0); expect(s1.sayildi).toBe(true); c = s1;
    expect(calkalaAdimi(c, 0).sayildi).toBe(false); expect(calkalaAdimi(c, 0).sayi).toBe(1);
    const s2 = calkalaAdimi(c, 1); expect(s2).toMatchObject({ sayi: 2, son: 1, sayildi: true });
    expect(calkalaAdimi(s2, -1).sayildi).toBe(false);
  });
  it('ip: aralık bulunur; aşağı yukarı her yön değişimi bir vuruş', () => {
    expect(aralikBul(ARALIKLAR[0], 2)).toBe(0); expect(aralikBul(ARALIKLAR[4], 2)).toBe(-1); expect(aralikBul(ARALIKLAR[4], 5)).toBe(4);
    expect(aralikBul({ x: ARALIKLAR[0].x, y: 200 }, 5)).toBe(-1);
    let v = ipBaslangici(700);
    v = ipAdimi(v, 710); expect(v.sayi).toBe(0);                                       // küçük oynama saymaz
    v = ipAdimi(v, 700 + IP_ADIMI + 4); expect(v.sayi).toBe(1);
    v = ipAdimi(v, 780); expect(v.sayi).toBe(1);                                       // aynı yönde sürmek saymaz
    v = ipAdimi(v, 730); expect(v.sayi).toBe(2);
    v = ipAdimi(v, 790); expect(v.sayi).toBe(3);
  });
  it('sözlerde emir yok; kullanılan efektlerin kaydı var', () => {
    for (const s of Object.values(SOZLER)) expect(s).not.toMatch(/(?<!\p{L})(dokun|tıkla|bas|sürükle|şimdi şunu)(?!\p{L})/iu);
    for (const ad of EFEKTLER) expect(existsSync(`assets/doktor/dis/ses/${ad}.mp3`) || existsSync(`assets/doktor/vaka/ses/${ad}.mp3`), ad).toBe(true);
    for (const s of Object.values(SOZLER)) expect(brief).toContain(s);
  });
});
