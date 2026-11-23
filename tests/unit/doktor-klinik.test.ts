import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AD, CIKARTMA_BOYU, DERT_SESI, DONGU, EFEKTLER, ESIK, HASTALAR, HASTA_TUVAL, KAPI, KAYIT_ANAHTARI, KINO_KUTU, KLINIK, KLINIK_DOSYALAR, KOLTUKLAR, OPAK, PANO, PANO_YUVALARI,
  SIRA_BOYU, SOZLER, SURE, TUVAL, VAKALAR, VAKASI, VAKA_HASTASI, adimAtildi, bekleKaresi, dokunmaKutusu, gelSozu, hastaDurumu, hastaKutusu, hastaninVakasi, odadakiVaka, odaOlcegi, GORUNUR_GENISLIK, iyilestir,
  kayitOku, kayitYaz, mutluKaresi, panoDolu, secilebilir, sira, vakaKareleri, yuruKaresi, yuruNoktasi, yuruSuresi, type VakaAdi,
} from '../../doktor/src/klinik/veri';
import { EN_KUCUK_EKRAN, EN_KUCUK_HEDEF, SAHNE, VAKA_DOSYALAR, sahneOlcegi, type Kutu } from '../../doktor/src/vaka/veri';
import { HAPSU_DOSYALAR } from '../../doktor/src/vaka-hapsu/veri';
import { KANAT_DOSYALAR } from '../../doktor/src/vaka-kanat/veri';
import { ATES_DOSYALAR } from '../../doktor/src/vaka-ates/veri';
import { BOYA_DOSYALAR } from '../../doktor/src/vaka-boya/veri';
import { KARIN_DOSYALAR } from '../../doktor/src/vaka-karin/veri';
import { BOCEK_DOSYALAR } from '../../doktor/src/vaka-bocek/veri';
import { KUZU_DOSYALAR } from '../../doktor/src/vaka-kuzu/veri';
import { CINGIRAK_DOSYALAR } from '../../doktor/src/vaka-cingirak/veri';
import { DIS_DOSYALAR } from '../../doktor/src/dis/veri';

// Minik Doktor · bekleme odası ve klinik akışı (doktor/src/klinik/). Çizim adları ve ölçüler parça brief'iyle
// (ekip/senaryo/DOKTOR-K1-PARCALAR.md) karşılaştırılır; sıra, kayıt ve hareketin saf hesabı sınanır.

const tum = readFileSync('ekip/senaryo/DOKTOR-K1-PARCALAR.md', 'utf8');
const brief = tum.slice(tum.indexOf('## Paket Doktor-K1'));
const icinde = (k: Kutu, d: Kutu = { sol: 0, ust: 0, g: SAHNE.g, y: SAHNE.y }) => k.sol >= d.sol && k.ust >= d.ust && k.sol + k.g <= d.sol + d.g && k.ust + k.y <= d.ust + d.y;
const hepsi = [...VAKALAR];

describe('Paket Doktor-K1: çizim adları, ölçüler ve sayfalar brief\'le birebir', () => {
  it('172 çizim, hepsi bir kez; her ad brief\'te geçer; tuvaller tam', () => {
    expect(KLINIK_DOSYALAR).toHaveLength(172);
    expect(new Set(KLINIK_DOSYALAR).size).toBe(172);
    for (const ad of KLINIK_DOSYALAR) expect(brief, ad).toContain('`' + ad + '`');
    expect(Object.keys(TUVAL).sort()).toEqual([...KLINIK_DOSYALAR].sort());
    expect(brief).toContain('172 çizim');
    expect(OPAK).toEqual(['klinik-fon']);
    expect(TUVAL['klinik-fon']).toEqual([2048, 1152]);
  });
  it('sayfa başına en çok 8; yirmi altı sayfa; toplam 172; her sayfanın adları başlığında', () => {
    const sayfalar = [...brief.matchAll(/^### Sayfa \d+ · [^\n]*?\((\d+)[,)][^\n]*→ ([^\n]+)$/gm)];
    expect(sayfalar).toHaveLength(26);
    for (const m of sayfalar) { const n = Number(m[1]); expect(n).toBeLessThanOrEqual(8); expect((m[2].match(/`[^`]+`/g) ?? []).length, m[0]).toBe(n); }
    expect(sayfalar.reduce((a, m) => a + Number(m[1]), 0)).toBe(172);
    const adlar = sayfalar.flatMap(m => (m[2].match(/`[^`]+`/g) ?? []).map(s => s.slice(1, -1)));
    expect(adlar.sort()).toEqual([...KLINIK_DOSYALAR].sort());
  });
  it('yedi hasta, on vaka; boşta döngü 4–6 kare; diziler sıralı ve aynı tuvalde; ikinci dertler kendi kareleriyle', () => {
    expect(HASTALAR).toHaveLength(7);
    expect(VAKALAR).toHaveLength(10);
    for (const v of VAKALAR) {
      const c = vakaKareleri(v);
      expect(c.bekle.length).toBeGreaterThanOrEqual(4); expect(c.bekle.length).toBeLessThanOrEqual(6);
      for (const d of [c.bekle, c.kalk, c.yuru, c.cik, c.mutlu]) d.forEach((ad, i) => expect(ad).toMatch(new RegExp(`-${i}$`)));
      expect(new Set([...c.bekle, c.sec, ...c.kalk, ...c.yuru, ...c.cik, ...c.mutlu].map(ad => TUVAL[ad].join('×')))).toEqual(new Set([HASTA_TUVAL.join('×')]));
      expect(TUVAL[KLINIK.cikartma[v]]).toEqual([300, 300]);
    }
    expect(vakaKareleri('bulut-bocek').bekle).not.toEqual(vakaKareleri('bulut').bekle);
    expect(vakaKareleri('bulut-bocek').cik).toEqual(vakaKareleri('bulut').cik);
    for (const [a, b] of [['lokum-kuzu', 'lokum'], ['mino-cingirak', 'mino']] as const) { expect(vakaKareleri(a).bekle).not.toEqual(vakaKareleri(b).bekle); expect(vakaKareleri(a).mutlu).toEqual(vakaKareleri(b).mutlu); }
    expect(brief).toContain('420 × 460');
  });
  it('adlar öbür paketlerle çakışmaz; Y1 etki çizimleri ortak', () => {
    for (const liste of [VAKA_DOSYALAR, DIS_DOSYALAR, ATES_DOSYALAR, BOYA_DOSYALAR, HAPSU_DOSYALAR, KANAT_DOSYALAR, KARIN_DOSYALAR, BOCEK_DOSYALAR, KUZU_DOSYALAR, CINGIRAK_DOSYALAR]) expect(KLINIK_DOSYALAR.filter(ad => liste.includes(ad))).toEqual([]);
    for (const ad of ['yildiz', 'pof-1']) { expect(VAKA_DOSYALAR).toContain(ad); expect(tum).toContain('`' + ad + '`'); }
  });
  it('yerleşim sayıları brief\'te yazanlarla aynı', () => {
    for (const h of HASTALAR) expect(brief, h).toContain(`${AD[h]} (${KOLTUKLAR[h].ayak.x}, ${KOLTUKLAR[h].ayak.y})`);
    expect(brief).toContain(`x ${KAPI.sol}…${KAPI.sol + KAPI.g}, y ${KAPI.ust}…${KAPI.ust + KAPI.y}`);
    expect(brief).toContain(`Eşiği (${ESIK.ayak.x}, ${ESIK.ayak.y})`);
    // Kino B'deki gibi iri: ayakları eşikte, boyu yaklaşık 400 (yönetici, 07:30)
    expect(KINO_KUTU.ust + KINO_KUTU.y).toBe(ESIK.ayak.y); expect(KINO_KUTU.y).toBeGreaterThanOrEqual(400);
    expect(brief).toContain(`x ${PANO.sol}…${PANO.sol + PANO.g}, y ${PANO.ust}…${PANO.ust + PANO.y}`);
    expect(brief).toContain(`üst sıra y ${PANO_YUVALARI.zipzip.y}, alt sıra y ${PANO_YUVALARI.polly.y}; ikisinde de x ${VAKALAR.slice(0, 5).map(v => PANO_YUVALARI[v].x).join(', ')}`);
    expect(tum).toContain('Seçilen ekran B');
    for (let i = 0; i < 5; i++) expect(PANO_YUVALARI[VAKALAR[i + 5]].x).toBe(PANO_YUVALARI[VAKALAR[i]].x);
    expect(brief).toContain('%82'); expect(KOLTUKLAR.mino.olcek).toBe(0.82); expect(brief).toContain('%90'); expect(KOLTUKLAR.zipzip.olcek).toBe(0.9);
    expect(brief).toContain(`kodda ${CIKARTMA_BOYU} boyda`);
  });
  it('herkes sahnenin içinde; çıkartmalar panoda; eşik kapının altında; dokunma kutuları küçük ekranda da en az 64 pt', () => {
    const s = sahneOlcegi(EN_KUCUK_EKRAN.g, EN_KUCUK_EKRAN.y).s;
    for (const h of HASTALAR) {
      expect(icinde(hastaKutusu(KOLTUKLAR[h])), h).toBe(true);
      const d = dokunmaKutusu(KOLTUKLAR[h]);
      expect(Math.min(d.g, d.y) * s, h).toBeGreaterThanOrEqual(EN_KUCUK_HEDEF);
    }
    for (const v of VAKALAR) { const p = PANO_YUVALARI[v], r = CIKARTMA_BOYU / 2; expect(icinde({ sol: p.x - r, ust: p.y - r, g: 2 * r, y: 2 * r }, PANO), v).toBe(true); }
    for (let i = 0; i < VAKALAR.length; i++) for (let j = i + 1; j < VAKALAR.length; j++) { const a = PANO_YUVALARI[VAKALAR[i]], b = PANO_YUVALARI[VAKALAR[j]]; expect(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)), VAKALAR[i] + '/' + VAKALAR[j]).toBeGreaterThan(CIKARTMA_BOYU); }
    expect(icinde(KAPI)).toBe(true); expect(icinde(KINO_KUTU)).toBe(true); expect(icinde(PANO)).toBe(true);
    // B: pano kapının üstünde, Kino kapının yanında
    expect(PANO.ust + PANO.y).toBeLessThanOrEqual(KAPI.ust + 50); // açık kapının üstü panonun arkasında (Astra 07:33) expect(KINO_KUTU.sol + KINO_KUTU.g / 2).toBeGreaterThan(KAPI.sol); expect(KINO_KUTU.sol + KINO_KUTU.g / 2).toBeLessThan(ESIK.ayak.x);
    expect(ESIK.ayak.x).toBeGreaterThan(KAPI.sol); expect(ESIK.ayak.x).toBeLessThan(KAPI.sol + KAPI.g); expect(ESIK.ayak.y).toBe(KAPI.ust + KAPI.y);
    // dokunma kutuları birbirini çok örtmez (yan yana ya da önlü arkalı iki hasta yanlış seçilmez): kesişim küçük kutunun %25'inden az
    for (let i = 0; i < HASTALAR.length; i++) for (let j = i + 1; j < HASTALAR.length; j++) {
      const a = dokunmaKutusu(KOLTUKLAR[HASTALAR[i]]), b = dokunmaKutusu(KOLTUKLAR[HASTALAR[j]]);
      const g = Math.max(0, Math.min(a.sol + a.g, b.sol + b.g) - Math.max(a.sol, b.sol)), y = Math.max(0, Math.min(a.ust + a.y, b.ust + b.y) - Math.max(a.ust, b.ust));
      // yakın kadrajda (Astra 07:33) minderler sık: öndeki üstte dokunuşu alır, arkadakinin başı açıkta kalır
      expect(g * y, HASTALAR[i] + '/' + HASTALAR[j]).toBeLessThan(0.3 * Math.min(a.g * a.y, b.g * b.y));
    }
  });
});

describe('sıra, durum ve kayıt', () => {
  it('sırada iyileşmemiş ilk iki vaka; bir hasta sırada bir kez; Bulut ateşi geçince uğur böceğiyle yeniden sıraya girer', () => {
    expect(SIRA_BOYU).toBe(2);
    expect(sira(hepsi, [])).toEqual(['zipzip', 'mino']);
    expect(sira(hepsi, ['zipzip'])).toEqual(['mino', 'bulut']);
    expect(sira(hepsi, ['zipzip', 'mino', 'mila', 'pamuk', 'polly', 'lokum'])).toEqual(['bulut', 'lokum-kuzu']);
    expect(sira(hepsi, ['zipzip', 'mino', 'bulut', 'mila', 'pamuk', 'polly', 'lokum', 'lokum-kuzu', 'bulut-bocek'])).toEqual(['mino-cingirak']);
    expect(hastaninVakasi('mino', hepsi, ['mino'])).toBe('mino-cingirak');
    expect(sira(hepsi, ['zipzip', 'mino', 'bulut', 'mila', 'pamuk', 'polly'])).toEqual(['lokum', 'bulut-bocek']);
    expect(sira(['bulut-bocek', 'mila'], [])).toEqual(['mila', 'bulut-bocek']);
    expect(sira(hepsi, hepsi)).toEqual([]);
    expect(hastaninVakasi('bulut', hepsi, [])).toBe('bulut');
    expect(hastaninVakasi('bulut', hepsi, ['bulut'])).toBe('bulut-bocek');
    expect(hastaninVakasi('bulut', hepsi, ['bulut', 'bulut-bocek'])).toBe('bulut-bocek');
    expect(hastaninVakasi('bulut', ['bulut'], ['bulut'])).toBe('bulut');
    expect(hastaninVakasi('lokum', ['zipzip'], [])).toBeNull();
  });
  it('durum: çizimi gelmemiş vakanın hastası da derdiyle bekler; iyileşen yeniden seçilebilir; sırası gelmeyen bekler', () => {
    const acik: VakaAdi[] = ['zipzip', 'mino', 'bulut', 'pamuk', 'bulut-bocek'];
    expect(hastaDurumu('polly', acik, [])).toBe('bekliyor');
    expect(odadakiVaka('polly', acik, [])).toBe('polly'); expect(odadakiVaka('lokum', [], [])).toBe('lokum'); expect(odadakiVaka('bulut', ['bulut'], ['bulut'])).toBe('bulut');
    expect(hastaDurumu('zipzip', acik, [])).toBe('sirada');
    expect(hastaDurumu('bulut', acik, [])).toBe('bekliyor');
    expect(hastaDurumu('zipzip', acik, ['zipzip'])).toBe('iyi');
    expect(hastaDurumu('bulut', acik, ['zipzip'])).toBe('sirada');
    expect(hastaDurumu('bulut', acik, ['zipzip', 'mino', 'bulut'])).toBe('sirada');
    expect(hastaDurumu('bulut', acik, ['bulut', 'bulut-bocek'])).toBe('iyi');
    expect(secilebilir('sirada')).toBe(true); expect(secilebilir('iyi')).toBe(true);
    expect(secilebilir('bekliyor')).toBe(false);
  });
  it('kamera: iPad yükseklikten dolar (kenarlar kırpılır, orta görünür); geniş telefonda oda bütün', () => {
    const p = odaOlcegi(1024, 768);
    expect(p.s).toBeCloseTo(1024 / GORUNUR_GENISLIK, 5); expect(p.s).toBeGreaterThan(1024 / 2048);
    expect(-p.sol / p.s).toBeLessThanOrEqual(KOLTUKLAR.zipzip.ayak.x - 120);
    const t = odaOlcegi(844, 390);
    expect(t.s).toBeCloseTo(390 / 1152, 5); expect(t.sol).toBeGreaterThanOrEqual(0);
  });
  it('pano: on vakanın hepsi iyileşince dolar', () => {
    expect(panoDolu(hepsi, hepsi.slice(0, 9))).toBe(false);
    expect(panoDolu(hepsi, [...hepsi].reverse())).toBe(true);
    // çizimi gelmemiş vaka varken pano dolmaz (tek çıkartmayla kutlama olmaz)
    expect(panoDolu(['zipzip', 'mino'], ['mino', 'zipzip'])).toBe(false);
    expect(panoDolu([], [])).toBe(false);
  });
  it('kayıt: anahtar, okuma, yazma; bozuk kayıt boş sayılır, tekrar ve yabancı ad atılır; eski kayıtlar geçerli', () => {
    expect(KAYIT_ANAHTARI).toBe('minkino-doktor-vaka-v1');
    expect(kayitOku(null).iyilesen).toEqual([]);
    expect(kayitOku('{bozuk').iyilesen).toEqual([]);
    expect(kayitOku('"metin"').iyilesen).toEqual([]);
    expect(kayitOku(JSON.stringify({ iyilesen: ['mino', 'kuzu', 'mino', 3, 'polly', 'bulut-bocek'] })).iyilesen).toEqual(['mino', 'polly', 'bulut-bocek']);
    const k = iyilestir(iyilestir(kayitOku(null), 'bulut'), 'bulut');
    expect(k.iyilesen).toEqual(['bulut']);
    expect(kayitOku(kayitYaz(iyilestir(k, 'lokum')))).toEqual({ s: 1, iyilesen: ['bulut', 'lokum'] });
  });
});

describe('hareket', () => {
  it('boşta döngüler beş kareyi de kullanır; vurgu karesi döngüde; hastalar aynı anda kıpırdamaz', () => {
    for (const h of HASTALAR) {
      const d = DONGU[h];
      expect(new Set(d.kareler)).toEqual(new Set([0, 1, 2, 3, 4]));
      expect(d.kareler).toContain(d.vurgu);
      expect(d.ms).toBeGreaterThanOrEqual(150); expect(d.ms).toBeLessThanOrEqual(260);
      const goruldu = new Set<number>();
      for (let an = 0; an < 4000; an += 20) { const k = bekleKaresi(h, an); expect(k).toBeGreaterThanOrEqual(0); expect(k).toBeLessThan(KLINIK.hasta[h].bekle.length); goruldu.add(k); }
      expect(goruldu.size).toBe(5);
      expect([0, 1]).toContain(mutluKaresi(h, 1234));
    }
    expect(HASTALAR.map(h => bekleKaresi(h, 0))).not.toEqual(HASTALAR.map(() => bekleKaresi('zipzip', 0)));
  });
  it('yürüyüş: dört karelik döngü, uçlarda tam yerinde, hız sabit, adım sesi iki karede bir', () => {
    expect([0, 129, 130, 520].map(yuruKaresi)).toEqual([0, 0, 1, 0]);
    const a = KOLTUKLAR.zipzip;
    expect(yuruNoktasi(a, ESIK, 0)).toEqual(a);
    expect(yuruNoktasi(a, ESIK, 1)).toEqual(ESIK);
    expect(yuruNoktasi(a, ESIK, 2)).toEqual(ESIK);
    const orta = yuruNoktasi(a, ESIK, 0.5);
    expect(orta.ayak.x).toBeCloseTo((a.ayak.x + ESIK.ayak.x) / 2, 5);
    expect(orta.olcek).toBeCloseTo((a.olcek + ESIK.olcek) / 2, 5);
    expect(yuruSuresi(a.ayak, ESIK.ayak)).toBeGreaterThan(yuruSuresi(KOLTUKLAR.lokum.ayak, ESIK.ayak));
    expect(yuruSuresi({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(700);
    expect(adimAtildi(250, 270)).toBe(true); expect(adimAtildi(100, 200)).toBe(false);
    for (const h of HASTALAR) expect(yuruSuresi(KOLTUKLAR[h].ayak, ESIK.ayak), h).toBeLessThan(3000);
  });
  it('vaka bitince dönüş, son sevinç izlenecek kadar bekler ama uzamaz', () => {
    expect(SURE.donus).toBeGreaterThanOrEqual(2000); expect(SURE.donus).toBeLessThanOrEqual(3200);
    expect(SURE.kutlama).toBeLessThanOrEqual(4000);
  });
});

describe('vakalar ve sesler', () => {
  it('her vakanın oyunu giriş yolunda var ve bitince sözleşmesiyle başlar', () => {
    const giris = readFileSync('doktor/src/giris.ts', 'utf8');
    const iskelet = readFileSync('doktor/src/vaka-kit/iskelet.ts', 'utf8');
    expect(Object.values(VAKASI).sort()).toEqual(['ates', 'bocek', 'boya', 'cingirak', 'disler', 'hapsu', 'kanat', 'karin', 'kuzu', 'vaka']);
    for (const v of [...Object.values(VAKASI), 'klinik']) expect(giris.includes(`p.get('oyun') === '${v}'`) || giris.includes(`oyun === '${v}'`), v).toBe(true);
    const klasor: Record<string, string> = { vaka: 'vaka', disler: 'vaka-dis', ates: 'vaka-ates', boya: 'vaka-boya', hapsu: 'vaka-hapsu', kanat: 'vaka-kanat', karin: 'vaka-karin', bocek: 'vaka-bocek', kuzu: 'vaka-kuzu', cingirak: 'vaka-cingirak' };
    for (const v of Object.values(VAKASI)) {
      const k = readFileSync(`doktor/src/${klasor[v]}/sahne.ts`, 'utf8');
      expect(k, v).toMatch(/export function baslat\(kok: HTMLElement, yas: Yas, secenek: \{ bitince\?: \(\) => void \} = \{\}\)/);
      expect(k, v).toMatch(/export const eksikCizimler/);
      // geri düğmesi (bekleme odası onu yakalar): vakanın kendisinde ya da iskelette
      expect(k.includes('vk-geri') || (k.includes('vakaBaslat(') && iskelet.includes('vk-geri')), v).toBe(true);
    }
    expect(iskelet).toContain('secenek.bitince?.()');
    for (const v of VAKALAR) expect(HASTALAR).toContain(VAKA_HASTASI[v]);
  });
  it('Kino\'nun on iki sözü ve sekiz efekt kayıtlı; dert efektleri vakaların klasörlerinde', () => {
    expect(Object.keys(SOZLER)).toHaveLength(12);
    for (const h of HASTALAR) expect(SOZLER).toHaveProperty(gelSozu(h));
    for (const ad of [...Object.keys(SOZLER), ...EFEKTLER]) expect(existsSync(`assets/doktor/klinik/ses/${ad}.mp3`), ad).toBe(true);
    const klasorler = readdirSync('assets/doktor', { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(`assets/doktor/${d.name}/ses`));
    const butun = klasorler.flatMap(d => readdirSync(`assets/doktor/${d.name}/ses`));
    for (const v of VAKALAR) expect(butun, v).toContain(DERT_SESI[v] + '.mp3');
    // adlar başka klasörlerdekilerle çakışmaz (ses.ts adla arar)
    const baska = klasorler.filter(d => d.name !== 'klinik').flatMap(d => readdirSync(`assets/doktor/${d.name}/ses`));
    for (const ad of [...Object.keys(SOZLER), ...EFEKTLER]) expect(baska, ad).not.toContain(ad + '.mp3');
    expect(readFileSync('doktor/src/ses.ts', 'utf8')).toContain('assets/doktor/klinik/ses/');
  });
});
