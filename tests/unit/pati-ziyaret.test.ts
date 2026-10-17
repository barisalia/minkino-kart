import { describe, expect, it } from 'vitest';
import P from '../../content/pati.json';
import { karakterCumleleri, patiCumleleri, patiKarakterCumleleri, tumCumleler } from '../../src/audio/cumleler';
import { CEKMECELER, ESYA_IDLERI, esyaBilgi, HAYVAN_IDLERI, hayvanBilgi, SUS_IDLERI, susBilgi, type CekmeceAdi } from '../../pati/src/katalog';
import { bosKayit, type SahipHayvan } from '../../pati/src/kayit';
import { cekmeceAcik, cekmeceSirali, sahipEsya, tepki } from '../../pati/src/tercih';
import {
  babaanneTepsisi,
  dansTepkisi,
  dikenSonucu,
  hayvanSonucu,
  ikramSonucu,
  KINO_IKRAM,
  LISTELER,
  listeSec,
  listeSonucu,
  partiHazir,
  SAHNELER,
  siradakiZiyaret,
  ziyaretJetonu,
  type ZiyaretId,
} from '../../pati/src/ziyaret-sahneleri';

const hayvan = (id: string): SahipHayvan => ({ id, ad: id, kose: hayvanBilgi(id).kose, yer: 0, minder: null, kalp: 0, dans: 0, sonDans: 0, ihtiyac: null });
const kayitIle = (...ids: string[]) => {
  const k = bosKayit();
  k.hayvanlar = ids.map(hayvan);
  return k;
};
const HAYVAN_ISTEYEN: ZiyaretId[] = ['lokum', 'can', 'ada', 'elif', 'ege', 'baba', 'dede'];

describe('Pati v2 · ziyaret sırası (PATI-V2 §9b)', () => {
  it('ikinci hayvandan önce ziyaret yok; ilk ziyaretçi Kino', () => {
    expect(siradakiZiyaret(kayitIle('tarcin'))).toBeNull();
    expect(siradakiZiyaret(kayitIle('tarcin', 'findik'))).toBe('kino');
  });
  it('sonra en az gelen önce, son 3 ziyaret tekrar etmez; Dede de sırası gelince gelir', () => {
    const k = kayitIle('tarcin', 'findik');
    const son: ZiyaretId[] = [];
    const gelen: ZiyaretId[] = [];
    for (let i = 0; i < 12; i++) {
      const z = siradakiZiyaret(k, son)!;
      expect(son.slice(-3)).not.toContain(z);
      gelen.push(z);
      k.ziyaretler[z] = (k.ziyaretler[z] ?? 0) + 1;
      son.push(z);
    }
    expect(gelen[0]).toBe('kino');
    for (const z of ['lokum', 'dede', 'baba', 'babaanne', 'liste', 'can', 'ada', 'elif', 'ege'] as ZiyaretId[]) expect(gelen).toContain(z);
  });
  it('5 hayvandan sonra dükkân fotoğrafı bir kez; parti müzik kutusu konunca', () => {
    const k = kayitIle('tarcin', 'findik', 'pofuduk', 'fistik', 'piril');
    k.ziyaretler.kino = 1;
    expect(siradakiZiyaret(k)).toBe('foto');
    k.ziyaretler.foto = 1;
    expect(siradakiZiyaret(k)).not.toBe('foto');
    expect(partiHazir(k)).toBe(false);
    k.susler.push({ ad: 'muzik-kutusu', nokta: 'o1-yer' });
    expect(partiHazir(k)).toBe(true);
    expect(siradakiZiyaret(k)).toBe('parti');
  });
});

describe('Pati v2 · istekler: birden çok cevap, ikisi de jeton (PATI-V2 §9c)', () => {
  it('her hayvan isteyen ziyarete her hayvan götürülebilir; hem uygun hem uymayan var', () => {
    for (const z of HAYVAN_ISTEYEN) {
      const sonuclar = HAYVAN_IDLERI.map((id) => hayvanSonucu(z, id));
      expect(sonuclar.some((s) => s.uygun), z).toBe(true);
      expect(sonuclar.some((s) => !s.uygun), z).toBe(true);
      for (const s of sonuclar) expect(s.sahne.length).toBeGreaterThan(0);
    }
  });
  it('belgedeki eşleşmeler', () => {
    expect(hayvanSonucu('lokum', 'pofuduk').uygun).toBe(true);
    expect(hayvanSonucu('lokum', 'findik').sahne).toBe('abi');
    expect(hayvanSonucu('lokum', 'limon').sahne).toBe('basa-konar');
    expect(hayvanSonucu('can', 'findik').uygun).toBe(true);
    expect(hayvanSonucu('can', 'kakao').uygun).toBe(true);
    expect(hayvanSonucu('elif', 'limon').uygun).toBe(true);
    expect(hayvanSonucu('elif', 'findik').sahne).toBe('uluma');
    expect(hayvanSonucu('ege', 'tospik').uygun).toBe(true);
    expect(hayvanSonucu('baba', 'tarcin').sahne).toBe('hapsu');
    expect(hayvanSonucu('baba', 'limon')).toEqual({ uygun: false, sahne: 'kus' });
    expect(hayvanSonucu('dede', 'findik').sahne).toBe('kasket');
    expect(hayvanSonucu('dede', 'tospik').uygun).toBe(true);
  });
  it('uygun 3/5, uymayan 1/2 jeton', () => {
    expect([ziyaretJetonu(true, 'kucuk'), ziyaretJetonu(true, 'buyuk'), ziyaretJetonu(false, 'kucuk'), ziyaretJetonu(false, 'buyuk')]).toEqual([3, 5, 1, 2]);
  });
  it('ikramlar: Kino üç ikram; Babaanne 3-4 yalnız sağlıklı, 5-6 pişi ve börek de; köpek böreği kapar', () => {
    expect([...KINO_IKRAM]).toEqual(['kemik-biskuvi', 'havuc', 'balik-yemi']);
    expect(babaanneTepsisi('kucuk')).toEqual(['havuc', 'elma', 'bezelye']);
    expect(babaanneTepsisi('buyuk')).toContain('borek');
    expect(ikramSonucu('findik', 'borek', 'buyuk')).toBe('insan-kapar');
    expect(ikramSonucu('tarcin', 'pisi', 'buyuk')).toBe('insan-iter');
    expect(ikramSonucu('findik', 'kemik-biskuvi', 'kucuk')).toBe('sever');
    expect(ikramSonucu('pofuduk', 'havuc', 'kucuk')).toBe('olur');
  });
  it("Anne'nin listesi: 6 seçenek, cevap ve şaka eşyaları rafta; yanlış komik, doğru buldun", () => {
    for (let i = 0; i < LISTELER.length; i++) {
      const { liste, secenekler } = listeSec(i, () => 0.3);
      expect(secenekler).toHaveLength(6);
      expect(new Set(secenekler).size).toBe(6);
      expect(secenekler).toContain(liste.cevap);
      for (const e of secenekler) expect(esyaBilgi(e)).toBeTruthy();
      expect(listeSonucu(liste, liste.cevap)).toBe('buldun');
    }
    const top = LISTELER[0];
    expect(listeSonucu(top, 'su-spreyi')).toBe('islandim');
    expect(listeSonucu(top, 'pelus-ayi')).toBe('sarilir');
    expect(listeSonucu(top, 'kum-saati')).toBe('kum');
  });
  it('parti: her hayvan her müziğe aynı tepkiyi vermez (Tospik yalnız yavaşta dans eder)', () => {
    expect(dansTepkisi('tospik', 'yavas')).toBe('dans');
    expect(dansTepkisi('tospik', 'hizli')).toBe('saklan');
    expect(dansTepkisi('findik', 'hizli')).toBe('deli');
    expect(dansTepkisi('vakvak', 'komik')).toBe('paytak');
    for (const id of HAYVAN_IDLERI) expect(new Set((['hizli', 'yavas', 'komik'] as const).map((m) => dansTepkisi(id, m))).size).toBeGreaterThan(0);
  });
  it('gece misafiri Diken: kedi maması ve su sever, süt sevmez', () => {
    expect(dikenSonucu('kedi-mamasi')).toBe('sever');
    expect(dikenSonucu('su-kabi')).toBe('sever');
    expect(dikenSonucu('elma')).toBe('olur');
    expect(dikenSonucu('sut-kasesi')).toBe('sevmez');
  });
  it('10 sahne: Kino ailesinden en az 5 kişi ve Mino', () => {
    expect(Object.keys(SAHNELER)).toHaveLength(13);
    const kisiler = new Set(Object.values(SAHNELER).flatMap((s) => s.kisiler));
    for (const k of ['kino', 'anne', 'lokum', 'baba', 'babaanne', 'dede', 'mino']) expect(kisiler.has(k as never)).toBe(true);
  });
});

describe('Pati v2 · çekmece sahipliğe göre (paket 2 kalanı)', () => {
  const k = bosKayit();
  const sahip = (e: string) => sahipEsya(k, e);
  // çekmecede baştan (bedava) kaç eşya var (su çekmecesinde 2)
  const elde = (c: CekmeceAdi) => ESYA_IDLERI.filter((e) => esyaBilgi(e).cekmece === c && sahip(e)).length;
  it('3-4: önce elindeki eşyalar (en çok 3, hepsi sahip), sonra en çok 1 fiyat etiketli; en az 3 seçenek', () => {
    for (const id of HAYVAN_IDLERI)
      for (const c of ['mama', 'su', 'oyuncak', 'yatak'] as CekmeceAdi[]) {
        const { kullan, satilik } = cekmeceSirali(id, c, 'kucuk', sahip);
        expect(kullan.length, `${id} ${c}`).toBeLessThanOrEqual(3);
        expect(kullan.length, `${id} ${c}`).toBeGreaterThanOrEqual(Math.min(3, elde(c)));
        expect(kullan.length + satilik.length, `${id} ${c}`).toBeGreaterThanOrEqual(Math.min(3, elde(c) + 1));
        for (const e of kullan) expect(sahip(e)).toBe(true);
        expect(satilik.length).toBeLessThanOrEqual(1);
        for (const e of satilik) expect(sahip(e)).toBe(false);
      }
  });
  it('alınan eşya elindekilere geçer (Fındık: kemik bisküvi alınınca çekmecede)', () => {
    const once = cekmeceSirali('findik', 'mama', 'kucuk', sahip);
    expect(once.kullan).not.toContain('kemik-biskuvi');
    expect(once.satilik).toContain('kemik-biskuvi');
    k.esyalar.push('kemik-biskuvi');
    const sonra = cekmeceSirali('findik', 'mama', 'kucuk', sahip);
    expect(sonra.kullan).toContain('kemik-biskuvi');
    expect(tepki('findik', 'ac', 'kemik-biskuvi', 'kucuk')).toBe('sever');
  });
  it('5-6: 4-6 kullanılır; 3-4 temizlik çekmecesi mağazadan alınınca açılır', () => {
    for (const id of HAYVAN_IDLERI)
      for (const c of Object.keys(CEKMECELER) as CekmeceAdi[]) {
        const { kullan, satilik } = cekmeceSirali(id, c, 'buyuk', sahip);
        expect(kullan.length, `${id} ${c}`).toBeGreaterThanOrEqual(Math.min(4, elde(c)));
        expect(satilik.length).toBeLessThanOrEqual(2);
      }
    expect(cekmeceAcik('temizlik', 'kucuk')).toBe(false);
    expect(cekmeceAcik('temizlik', 'kucuk', true)).toBe(true);
  });
});

describe('Pati v2 · süsler ve sözler', () => {
  it('her süsün resmi (başka oyunun onaylı çizimi ya da pati eşyası) ve nokta türü var', () => {
    for (const id of SUS_IDLERI) {
      const s = susBilgi(id);
      expect(['duvar', 'yer', 'hali']).toContain(s.yer);
      expect(s.resim).toMatch(/^[a-z0-9-]+(\/[a-z0-9-]+)+$/);
    }
  });
  const etiketsiz = (t: string) => t.replace(/\[[^\]]*\]/g, '').trim();
  it('yeni sözler kısa (≤ 30 harf hedef, en çok 40) ve "şunu yap" demez', () => {
    const hepsi = [...patiCumleleri(), ...Object.values(patiKarakterCumleleri()).flat()];
    for (const t of hepsi) {
      expect(etiketsiz(t).length, t).toBeLessThanOrEqual(40);
      expect(t, t).not.toMatch(/dokun|tıkla|sürükle|bas\b/i);
    }
  });
  it('seslendirme listesinde: Nehir ve Mino ana ses; Kino ailesi kendi sesleriyle (CI seslendirir)', () => {
    const ana = new Set(tumCumleler());
    for (const t of [P.v2.nehir.kapi_caldi, P.v2.nehir.tanisma.fistik, P.v2.nehir.kose_acildi.akvaryum, P.v2.ziyaret.sozler.mino.selam, P.v2.ziyaret.sozler.cocuk.can, 'Pamuk!']) expect(ana.has(t), t).toBe(true);
    const kar = karakterCumleleri();
    expect(kar.kino).toContain(P.v2.ziyaret.sozler.kino.selam);
    for (const kim of ['anne', 'lokum', 'baba', 'babaanne', 'dede'] as const) for (const t of Object.values(P.v2.ziyaret.sozler[kim])) expect(kar[kim], `${kim}: ${t}`).toContain(t);
  });
});
