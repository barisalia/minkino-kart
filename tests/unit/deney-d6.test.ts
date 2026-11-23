// Deneyler · Paket D6+ (D7–D12): her deneyin sonucu gerçekteki gibi, 3–6 yaşa güvenli, yaşa ve gelişe göre akış;
// çizim adları brief'le (CLAUDE-ASTRA-MESAJLAR.md 22 Kasım 01:34 ve D6+ ölçü notu) birebir; çizimler gelmeden görünmez.
import { describe, expect, it } from 'vitest';
import sozler from '../../deney/src/sozler.json';
import {
  BARDAK_TONU, BUZ_YERLERI, BUZ_ZAMANI, CEKER, CEKIRDEK, DENEYLER, DENEY_CIZIMLERI, DENEY_SESLERI, EVDE_DENE, MIKNATIS_NESNELERI, SEVIYELER,
  TOHUM_GUNU, buzPlani, erimeSirasi, filizHali, golgeOrani, golgePlani, golgeVardi, inisSuresi, miknatisAkisi, miknatisNesneleri, muzikPlani,
  rampaHareketi, rampaPlani, tohumPlani, UZAK, YAKIN, type DeneyId, type YasKumesi,
} from '../../deney/src/deney-mantik';
import { deneyAcik, deneyHazir } from '../../deney/src/hazir';

const metin = sozler as Record<string, string>;
const KUMELER: YasKumesi[] = ['minik', 'dort', 'bes'];
const YENI: DeneyId[] = ['miknatis', 'golge', 'buz', 'tohum', 'rampa', 'muzik'];
const j = (x: unknown) => JSON.stringify(x);
const ilkUcFarkli = (f: (g: number) => unknown) => new Set([0, 1, 2].map((g) => j(f(g)))).size === 3;

describe('Deney D6+ · bilim doğru', () => {
  it('mıknatıs demiri ve çeliği çeker; tahta, plastik, silgi ve pirinç anahtar çekilmez', () => {
    expect(Object.keys(CEKER).filter((n) => CEKER[n as keyof typeof CEKER]).sort()).toEqual(['kavanoz-kapagi', 'metal-kova', 'teneke-kutu']);
    expect(CEKER.anahtar).toBe(false);
    expect(metin['mk-neden']).toMatch(/her metali çekmez/);
    expect(metin['mk-sonuc']).toMatch(/demiri ve çeliği çeker/);
  });
  it('gölge: fener yaklaşınca büyür, uzaklaşınca küçülür (hep tavşandan büyük)', () => {
    const o = [0, 0.25, 0.5, 0.75, 1].map(golgeOrani);
    for (let i = 1; i < o.length; i++) expect(o[i]).toBeGreaterThan(o[i - 1]);
    expect(o[0]).toBeGreaterThan(1);
    expect(golgeVardi('yaklastir', YAKIN)).toBe(true);
    expect(golgeVardi('uzaklastir', UZAK)).toBe(true);
    expect(metin['gl-buyudu']).toMatch(/yaklaşınca gölge büyüdü/);
    expect(metin['gl-kuculdu']).toMatch(/uzaklaşınca gölge küçüldü/);
  });
  it('buz: önce ılık sudaki, sonra güneşteki, en son gölgedeki erir; eriyen buz geri donmaz', () => {
    expect(erimeSirasi()).toEqual(['su', 'gunes', 'golge']);
    const sira = ['tam', 'yarim', 'az', 'su', 'yok'];
    for (const y of BUZ_YERLERI) {
      const h = BUZ_ZAMANI[y].map((x) => (x === 'yok' ? 3 : sira.indexOf(x)));
      for (let i = 1; i < h.length; i++) expect(h[i], y).toBeGreaterThanOrEqual(h[i - 1]);
    }
    expect(BUZ_ZAMANI.su.at(-1)).toBe('yok');
    expect(BUZ_ZAMANI.golge.at(-1)).not.toMatch(/su|yok/);
    expect(metin['bz-sonuc']).toMatch(/^Ilık su buzu en çabuk eritti/);
    expect(Object.values(metin).join(' ')).not.toMatch(/Güneşteki buz önce/);
  });
  it('tohum: sulanan filizlenir ve çiçek açar; susuz tohum hiç filizlenmez', () => {
    for (let g = 0; g <= TOHUM_GUNU; g++) expect(filizHali(g, false)).toBeNull();
    expect([1, 2, 3].map((g) => filizHali(g, true))).toEqual(['filiz-1', 'filiz-2', 'filiz-3']);
    expect(metin['th-sonuc-tek']).toMatch(/suyla filizlendi, ışıkla büyüdü/);
    expect(metin['th-sonuc-iki']).toMatch(/susuz tohum filizlenmedi/);
  });
  it('rampa: top yuvarlanır, araba tekerlekle iner; kutu az eğimde kalır, dikte kayar; dik rampada daha hızlı', () => {
    expect(rampaHareketi('kup-kutu', 'az')).toBe('kalir');
    expect(rampaHareketi('kup-kutu', 'dik')).toBe('kayar');
    for (const e of ['az', 'dik'] as const) {
      expect(rampaHareketi('top', e)).toBe('yuvarlanir');
      expect(rampaHareketi('oyuncak-araba', e)).toBe('tekerlek');
    }
    for (const n of ['top', 'oyuncak-araba'] as const) expect(inisSuresi(n, 'dik')).toBeLessThan(inisSuresi(n, 'az'));
    expect(inisSuresi('kup-kutu', 'az')).toBe(0);
  });
  it('bardak: su çoğaldıkça ses kalınlaşır (vurunca)', () => {
    for (let i = 1; i < SEVIYELER.length; i++) expect(BARDAK_TONU[SEVIYELER[i]]).toBeLessThan(BARDAK_TONU[SEVIYELER[i - 1]]);
    expect(metin['mz-sonuc']).toBe('Su çok, ses kalın. Su az, ses ince.');
  });
});

describe('Deney D6+ · güvenlik (3–6 yaş)', () => {
  it('kesici, yutulacak küçük parça ya da ateş yok: ne çizimde ne sözde ne evde kartında', () => {
    const hepsi = [...YENI.flatMap((id) => DENEY_CIZIMLERI[id]), ...YENI.flatMap((id) => DENEY_SESLERI[id].map((s) => metin[s]))].join(' ').toLocaleLowerCase('tr');
    expect(hepsi).not.toMatch(/ataş|atas|çivi|civi|vida|bilye|bıçak|makas|kibrit|mum|ateş|ates/);
    const evde = YENI.flatMap((id) => [EVDE_DENE[id].baslik, ...EVDE_DENE[id].adimlar]).join(' ');
    expect(evde).toMatch(/mum kullanmayın/);
    expect(evde).toMatch(/ılık suya koyun \(sıcak değil, ılık\)/);
    expect(EVDE_DENE.miknatis.adimlar.join(' ')).toMatch(/Küçük ya da güçlü mıknatısları çocuğa vermeyin/);
    expect(EVDE_DENE.tohum.adimlar.join(' ')).toMatch(/Tohumları siz ekin/);
    expect(EVDE_DENE.muzik.adimlar.join(' ')).toMatch(/kavanozları siz tutun/);
  });
});

describe('Deney D6+ · yaşa ve gelişe göre akış', () => {
  it('mıknatıs: 2–3 yaş dört, büyükler beş nesne; her takımda çeken de çekmeyen de; ilk ikisi ayrı sonuçlu', () => {
    for (const k of KUMELER)
      for (let g = 0; g < 6; g++) {
        const n = miknatisNesneleri(k, g);
        expect(n).toHaveLength(k === 'minik' ? 4 : 5);
        expect(n.some((x) => CEKER[x]) && n.some((x) => !CEKER[x])).toBe(true);
        expect(CEKER[n[0]]).not.toBe(CEKER[n[1]]);
        expect(n.filter((x) => CEKER[x]).length).toBeLessThanOrEqual(3);
        if (g > 0) expect(j(n)).not.toBe(j(miknatisNesneleri(k, g - 1)));
      }
    expect(miknatisAkisi('minik')).toEqual({ tahmin: false, surpriz: false });
    expect(miknatisAkisi('bes')).toEqual({ tahmin: true, surpriz: true });
  });
  it('gölge, buz, tohum, rampa, müzik: ilk üç geliş farklı; yaşa göre basamak', () => {
    for (const k of KUMELER) {
      expect(ilkUcFarkli((g) => golgePlani(k, g))).toBe(true);
      expect(ilkUcFarkli((g) => rampaPlani(k, g))).toBe(true);
      expect(ilkUcFarkli((g) => muzikPlani(k, g))).toBe(true);
    }
    for (const k of ['dort', 'bes'] as const) {
      expect(ilkUcFarkli((g) => buzPlani(k, g))).toBe(false); // üç soru yok: ilk / son sırayla
      expect(new Set([0, 1].map((g) => buzPlani(k, g).soru)).size).toBe(2);
      expect(new Set([0, 1].map((g) => tohumPlani(k, g).sulanan)).size).toBe(2);
    }
    expect(golgePlani('minik').tahmin).toBe(false);
    expect(golgePlani('bes').sondur).toBe(true);
    expect(tohumPlani('minik').saksi).toBe(1);
    expect(tohumPlani('dort').saksi).toBe(2);
    expect(rampaPlani('minik').az).toContain('kup-kutu');
    for (const k of KUMELER) expect(rampaPlani(k).dik).toContain('kup-kutu');
    expect(muzikPlani('minik').kulak).toEqual([]);
    expect(muzikPlani('bes').kulak.length).toBeGreaterThan(0);
    // Bardaklar hiçbir gelişte sıralı dizilmez (çocuk suya bakarak sıralar).
    for (let g = 0; g < 5; g++) { const d = muzikPlani('dort', g).dizilis; expect(j(d)).not.toBe(j([1, 2, 3, 4])); expect(j(d)).not.toBe(j([4, 3, 2, 1])); }
    // Gölgede iki adım da var; başlangıç iki hedefin arasında.
    for (let g = 0; g < 4; g++) { const p = golgePlani('dort', g); expect([...p.adimlar].sort()).toEqual(['uzaklastir', 'yaklastir']); expect(p.baslangic > UZAK && p.baslangic < YAKIN).toBe(true); }
  });
});

describe('Deney D6+ · çizimler, kayıtlar, kapı', () => {
  it('çizim adları brief\'le birebir (mıknatısta güvenlik değişikliği ölçü notunda)', () => {
    expect(DENEY_CIZIMLERI.miknatis).toEqual(['miknatis', ...MIKNATIS_NESNELERI, 'cikartma-miknatis']);
    expect(DENEY_CIZIMLERI.golge).toEqual(['el-feneri-kapali', 'el-feneri-acik', 'isik-huzmesi', 'oyuncak-tavsan', 'tavsan-golgesi', 'golge-perdesi', 'cikartma-golge']);
    expect(DENEY_CIZIMLERI.buz).toEqual(['buz-tam', 'buz-yarim', 'buz-az', 'su-birikintisi', 'gunes-isigi', 'golgelik', 'ilik-su-kabi', 'cikartma-buz']);
    expect(DENEY_CIZIMLERI.tohum).toEqual(['saksi-bos', 'tohum', 'filiz-1', 'filiz-2', 'filiz-3', 'sulama-kabi', 'cikartma-tohum']);
    expect(DENEY_CIZIMLERI.rampa).toEqual(['rampa-az', 'rampa-dik', 'top', 'oyuncak-araba', 'kup-kutu', 'cikartma-rampa']);
    expect(DENEY_CIZIMLERI.muzik).toEqual(['muzik-bardagi', 'su-seviye-1', 'su-seviye-2', 'su-seviye-3', 'su-seviye-4', 'cikartma-muzik']);
    expect(DENEYLER).toHaveLength(8);
    expect(CEKIRDEK).toEqual(['batar-yuzer', 'renkler']);
  });
  it('her yeni deneyin sözleri var ve kısa; kayıtları yerinde', () => {
    for (const id of YENI) for (const s of DENEY_SESLERI[id]) { expect(metin[s], s).toBeTruthy(); expect(metin[s].length, s).toBeLessThanOrEqual(90); }
  });
  it('çizimler gelmeden ne sayfa ne yeni deneyler açılır', () => {
    expect(deneyHazir()).toBe(false);
    for (const id of DENEYLER) expect(deneyAcik(id), id).toBe(false);
  });
});
