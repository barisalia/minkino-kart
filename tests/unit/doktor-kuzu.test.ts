import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ADIMLAR, ALETLER, ASAMALAR, KOSE_DUGMESI, KURDELE_DUGMESI, SEC_DUGMESI, EFEKTLER, GOZ, KARE_MS, KOSELER, KULAK_YIRTIK, KURDELE, KUZU, KUZU_DOSYALAR, OPAK, PAMUKLAR, SEPET, SEPET_PAMUGU, SOKUK, SOZLER, TUVAL, YAMA_YERLERI,
  YUNLER, YUZ, ZORLUK, cevirAdimi, cevirBaslangici, cirtAdimi, cirtBaslangici, cirtOrani, CIRT_TAMAM, dolguKademesi, firladiMi, koseBul, sagGecti, sokuktaMi, solGecti, sonrakiAsama,
  yamaYeri, yarimTur, yirtikta, yunBul, yuzPozu, type YuzDurumu,
} from '../../doktor/src/vaka-kuzu/veri';
import { ORTAK_DOSYALAR } from '../../doktor/src/vaka-kit/ortak';
import { EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, SAHNE, VAKA_DOSYALAR, YAKIN, sahneOlcegi } from '../../doktor/src/vaka/veri';
import { HAPSU_DOSYALAR } from '../../doktor/src/vaka-hapsu/veri';
import { KANAT_DOSYALAR } from '../../doktor/src/vaka-kanat/veri';
import { KARIN_DOSYALAR } from '../../doktor/src/vaka-karin/veri';
import { BOCEK_DOSYALAR } from '../../doktor/src/vaka-bocek/veri';
import { CINGIRAK_DOSYALAR } from '../../doktor/src/vaka-cingirak/veri';

// Minik Doktor · sekizinci vaka "Kuzu'nun Sökük Dikişi" (doktor/src/vaka-kuzu/): oyuncak tamiri, iğne yok. Çizim adları, ölçüleri ve
// kare dizileri parça brief'iyle (ekip/senaryo/DOKTOR-Y8-Y10-PARCALAR.md) karşılaştırılır; mekaniklerin saf hesabı sınanır.

const tum = readFileSync('ekip/senaryo/DOKTOR-Y8-Y10-PARCALAR.md', 'utf8');
const bas = tum.indexOf('## Paket Doktor-Y8');
const brief = tum.slice(bas, tum.indexOf('## Paket Doktor-Y10'));
const ortak = tum.slice(0, bas);
const nokta = (p: { x: number; y: number }) => `(${p.x}, ${p.y})`;

describe('Paket Doktor-Y8: çizim adları, ölçüler ve kare dizileri brief\'le birebir', () => {
  it('84 çizim, hepsi bir kez; her ad brief\'te geçer; tuvaller tam', () => {
    expect(bas).toBeGreaterThan(0);
    expect(KUZU_DOSYALAR).toHaveLength(84);
    expect(new Set(KUZU_DOSYALAR).size).toBe(84);
    for (const ad of KUZU_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...KUZU_DOSYALAR].sort());
    expect(brief).toContain('84 çizim');
    expect(OPAK).toEqual(['kuzu-fon']);
  });
  it('sayfa başına en çok 8; on dört sayfa; toplam 84; her sayfanın adları başlığında', () => {
    const sayfalar = [...brief.matchAll(/^### Sayfa \d+ · [^\n]*?\((\d+)[,)][^\n]*→ ([^\n]+)$/gm)];
    expect(sayfalar).toHaveLength(14);
    for (const m of sayfalar) { const n = Number(m[1]); expect(n).toBeLessThanOrEqual(8); expect((m[2].match(/`[^`]+`/g) ?? []).length, m[0]).toBe(n); }
    expect(sayfalar.flatMap(m => (m[2].match(/`[^`]+`/g) ?? []).map(s => s.slice(1, -1))).sort()).toEqual([...KUZU_DOSYALAR].sort());
  });
  it('kare dizileri sıralı ve aynı tuvalde; dört dolgu kademesi, dokuz yüz', () => {
    for (const d of [KUZU.govde, KUZU.pamuk, KUZU.pof, KUZU.pamukParca, KUZU.kayma, KUZU.kosePit, KUZU.cirtIz, KUZU.kulakSallan, KUZU.dugmeYerinde, KUZU.vida, KUZU.kurdeleFiyonk, KUZU.toz, KUZU.yun, KUZU.kalp, KUZU.mee]) {
      d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i}$`)));
      expect(new Set(d.map(ad => TUVAL[ad].join('×'))).size).toBe(1);
    }
    expect(KUZU.govde).toHaveLength(4); expect(Object.keys(KUZU.yuz)).toHaveLength(9);
    for (const ad of KUZU.govde) expect(TUVAL[ad]).toEqual([SAHNE.g, SAHNE.y]);
    for (const k of Object.values(KARE_MS)) { expect(k).toBeGreaterThanOrEqual(60); expect(k).toBeLessThanOrEqual(300); }
  });
  it('ortak çizimler; adlar öbür paketlerle çakışmaz', () => {
    for (const ad of ORTAK_DOSYALAR) { expect(VAKA_DOSYALAR).toContain(ad); expect(ortak, ad).toContain('`' + ad + '`'); }
    for (const liste of [VAKA_DOSYALAR, HAPSU_DOSYALAR, KANAT_DOSYALAR, KARIN_DOSYALAR, BOCEK_DOSYALAR, CINGIRAK_DOSYALAR]) expect(KUZU_DOSYALAR.filter(ad => liste.includes(ad))).toEqual([]);
  });
  it('yerleşim sayıları brief\'te yazanlarla aynı; iğne yok', () => {
    for (const p of [YUZ, GOZ, SOKUK, ...PAMUKLAR, ...KOSELER, KULAK_YIRTIK.bas, KULAK_YIRTIK.son, KURDELE.boyun, KURDELE.sol, KURDELE.sag, ...YUNLER, SEPET_PAMUGU, ...Object.values(YAMA_YERLERI)]) expect(brief, nokta(p)).toContain(nokta(p));
    expect(brief).toContain(`x ${SEPET.sol}…${SEPET.sol + SEPET.g}, y ${SEPET.ust}…${SEPET.ust + SEPET.y}`);
    expect(brief).toContain('iğne, iplik, dikiş yok'); expect(brief).toContain('insan biçimli değil');
    expect(brief).toContain('sol ucundan tutulur (120, 300), ucu sağda (520, 300)');
    expect([ALETLER.cirt.tut[0] * 600, ALETLER.cirt.uc[0] * 600].map(Math.round)).toEqual([120, 520]);
  });
  it('dokunma hedefleri küçük ekranda da en az 64 pt; hepsi şeridin üstünde', () => {
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    for (const b of [KOSE_DUGMESI, KURDELE_DUGMESI, SEC_DUGMESI, 210, 240]) expect(b * s).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    for (const p of [...PAMUKLAR, ...KOSELER, GOZ, ...YUNLER, KURDELE.sol, KURDELE.sag]) expect(p.y + 80).toBeLessThan(YAKIN.serit.ust);
    for (let i = 0; i < KOSELER.length; i++) for (let j = i + 1; j < KOSELER.length; j++) expect(Math.hypot(KOSELER[i].x - KOSELER[j].x, KOSELER[i].y - KOSELER[j].y)).toBeGreaterThanOrEqual(KOSE_DUGMESI);
    expect(Math.abs(KURDELE.sag.x - KURDELE.sol.x)).toBeGreaterThanOrEqual(KURDELE_DUGMESI);
  });
});

describe('mekanikler', () => {
  it('sökük, yama yeri ve köşeler', () => {
    expect(sokuktaMi(SOKUK)).toBe(true); for (const p of PAMUKLAR) expect(sokuktaMi(p)).toBe(false);
    expect(yamaYeri(SOKUK)).toBe('tam'); expect(yamaYeri({ x: SOKUK.x + 200, y: SOKUK.y })).toBe('kayar'); expect(yamaYeri({ x: 100, y: 100 })).toBe('uzak');
    expect(koseBul(KOSELER[2], [false, false, false, false])).toBe(2); expect(koseBul(KOSELER[2], [false, false, true, false])).toBe(-1);
    expect([0, 1, 2, 3].map(i => dolguKademesi(i, 3))).toEqual([0, 1, 2, 3]);
  });
  it('cırt cırt yırtık boyunca kaplanır', () => {
    let d = cirtBaslangici();
    const { bas: b, son } = KULAK_YIRTIK;
    for (let t = 0; t <= 1; t += 0.05) d = cirtAdimi(d, { x: b.x + (son.x - b.x) * t, y: b.y + (son.y - b.y) * t });
    expect(cirtOrani(d)).toBeGreaterThanOrEqual(CIRT_TAMAM);
    expect(yirtikta({ x: b.x, y: b.y + 300 })).toBe(false);
  });
  it('düğme saat yönünde çevrilince takılır; ters çevrilince fırlar', () => {
    let d = cevirBaslangici();
    for (let i = 0; i <= 64; i++) { const a = (i / 32) * Math.PI * 2; d = cevirAdimi(d, { x: GOZ.x + Math.cos(a) * 120, y: GOZ.y + Math.sin(a) * 120 }); }
    expect(d.toplam).toBeCloseTo(Math.PI * 4, 1); expect(yarimTur(d.toplam)).toBe(4); expect(firladiMi(d)).toBe(false);
    let t = cevirBaslangici();
    for (let i = 0; i <= 16; i++) { const a = -(i / 32) * Math.PI * 2; t = cevirAdimi(t, { x: GOZ.x + Math.cos(a) * 120, y: GOZ.y + Math.sin(a) * 120 }); }
    expect(firladiMi(t)).toBe(true); expect(t.toplam).toBe(0);
  });
  it('kurdele çaprazı ve yün', () => {
    expect(solGecti(KURDELE.boyun.x + 60)).toBe(true); expect(solGecti(KURDELE.sol.x)).toBe(false);
    expect(sagGecti(KURDELE.boyun.x - 60)).toBe(true); expect(sagGecti(KURDELE.sag.x)).toBe(false);
    expect(yunBul(YUNLER[1], [false, false, false, false], 4)).toBe(1); expect(yunBul(YUNLER[3], [false, false, false, false], 2)).toBe(-1);
  });
  it('yaşa göre zorluk', () => {
    const [k, b] = [ZORLUK['2-3'], ZORLUK['5+']];
    expect(k.pamuk).toBeLessThanOrEqual(PAMUKLAR.length); expect(b.pamuk).toBe(PAMUKLAR.length + 1);
    expect(k.dugme).toBeLessThan(b.dugme); expect(k.yun).toBeLessThan(b.yun); expect(k.itHiz).toBeGreaterThan(b.itHiz); expect(b.yun).toBeLessThanOrEqual(YUNLER.length);
  });
});

describe('senaryo, ifadeler ve sesler', () => {
  it('sekiz adım sırayla', () => {
    expect(ADIMLAR).toHaveLength(8);
    expect(ADIMLAR).toEqual(ASAMALAR.filter(a => !['giris', 'canta', 'kutlama', 'son'].includes(a)));
    expect(sonrakiAsama('kose')).toBe('cirt'); expect(sonrakiAsama('kabart')).toBe('kutlama');
    expect(brief).toMatch(/\| 8 \| Kabart/);
  });
  it('yüz: tepkiler öncelikli; düğme takılınca mutlu; kapanışta güler', () => {
    const d = (x: Partial<YuzDurumu>): YuzDurumu => ({ asama: 'tikistir', meeKalan: 0, sasirKalan: 0, kikirKalan: 0, utanKalan: 0, gidikKalan: 0, merakKalan: 0, mutluKalan: 0, an: 0, ...x });
    expect(yuzPozu(d({}))).toBe('uzgun'); expect(yuzPozu(d({ meeKalan: 1, sasirKalan: 1 }))).toBe('mee');
    expect(yuzPozu(d({ asama: 'kurdele' }))).toBe('mutlu'); expect(yuzPozu(d({ asama: 'son', sasirKalan: 1 }))).toBe('gulen');
  });
  it('sözler yazılı, efektler kayıtlı; giriş yolu var', () => {
    expect(Object.keys(SOZLER).length).toBeGreaterThanOrEqual(6);
    for (const e of EFEKTLER) expect(existsSync(`assets/doktor/kuzu/ses/${e}.mp3`), e).toBe(true);
    expect(readFileSync('doktor/src/ses.ts', 'utf8')).toContain('assets/doktor/kuzu/ses/');
    // giriş yolu (giris.ts 23 Kasım'dan beri `oyun === …` yazıyor; eski `p.get('oyun') === …` de geçer)
    expect(readFileSync('doktor/src/giris.ts', 'utf8')).toMatch(/(p\.get\('oyun'\)|\boyun) === 'kuzu'/);
    // her söz kayıtlı (23 Kasım: karakter klonlarıyla seslendirildi, Scribe'dan geçti); ses havuzu tek, ad bir klasörde
    const sesler = readdirSync('assets/doktor').flatMap(k => existsSync(`assets/doktor/${k}/ses`) ? readdirSync(`assets/doktor/${k}/ses`) : []);
    for (const id of Object.keys(SOZLER)) expect(sesler.filter(f => f === id + '.mp3').length, id).toBe(1);
    // iğne, iplik ve dikiş çizimi yok
    for (const ad of KUZU_DOSYALAR) expect(ad).not.toMatch(/igne|iplik|dikis/);
  });
});
