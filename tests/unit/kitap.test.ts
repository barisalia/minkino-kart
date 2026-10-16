import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import okul from '../../content/kitap-okul.json';
import { ANAHTAR, kayitCoz } from '../../kitap/src/kayit';
import { KARAKTERLER, etiketsiz, kelimeAgirliklari, kelimeler } from '../../kitap/src/metin';
import { OKUL_CANLI } from '../../kitap/src/okul-canli';
import type { KitapIcerik, Kim } from '../../kitap/src/tipler';
import { kitapOlcusu, NETLIK_DPR, VARSAYILAN_KAYNAK } from '../../kitap/src/yerlesim';

const icerik = okul as KitapIcerik;
const KOK = resolve(__dirname, '../..');

/** Senaryodaki (§2.5) bir sayfanın konuşma satırları: [kim, metin] */
function senaryoSatirlari(): Map<string, [string, string][]> {
  const md = readFileSync(resolve(KOK, 'ekip/senaryo/KITAP-MINO-KINO.md'), 'utf8');
  const bolum = md.slice(md.indexOf('### 2.5'), md.indexOf('#### Ebeveyn sayfası'));
  const sayfalar = new Map<string, [string, string][]>();
  let anahtar = '';
  for (const satir of bolum.split(/\r?\n/)) {
    const b = satir.match(/^#### (Kapak|Sayfa (\d+))/);
    if (b) {
      anahtar = b[2] ? `s${b[2]}` : 'kapak';
      sayfalar.set(anahtar, []);
      continue;
    }
    const m = satir.match(/^- \*\*([^*]+?)(?::)?\*\*(?: \*\([^)]*\)\*)?:? "([^"]*)"/);
    if (m && anahtar) sayfalar.get(anahtar)!.push([m[1].replace(/:$/, ''), m[2]]);
  }
  return sayfalar;
}

const AD: Record<string, Kim> = { Anlatıcı: 'anlatici', Kino: 'kino', Anne: 'anne', Baba: 'baba', Lokum: 'lokum', Mino: 'mino', Öğretmen: 'ogretmen', Bulut: 'bulut', Tombi: 'tombi', Çocuklar: 'cocuklar', Ses: 'ses' };

describe('Kitap: Kino Okula Başlıyor metni', () => {
  const senaryo = senaryoSatirlari();
  it('her sayfanın metni senaryoyla birebir (kim ve söz, sırası dahil)', () => {
    expect(senaryo.size).toBe(15);
    expect(senaryo.get('kapak')!.map(([k, m]) => [AD[k], m])).toEqual(icerik.kapak.satirlar.map((s) => [s.kim, s.metin]));
    for (const s of icerik.sayfalar) {
      const bek = senaryo.get(`s${s.no}`)!;
      expect(bek.length, `sayfa ${s.no}`).toBeGreaterThan(0);
      expect(bek.map(([k, m]) => [AD[k], m]), `sayfa ${s.no}`).toEqual(s.satirlar.map((x) => [x.kim, x.metin]));
    }
    expect(icerik.sayfalar.map((s) => s.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('ebeveyn sayfası senaryodaki sorular', () => {
    const md = readFileSync(resolve(KOK, 'ekip/senaryo/KITAP-MINO-KINO.md'), 'utf8');
    for (const q of icerik.ebeveyn.sorular) expect(md).toContain(q);
    expect(md).toContain(icerik.ebeveyn.not.replace('Küçük not: ', ''));
  });
  it('ses etiketleri sayfaya basılmaz ve kelimeler etiketsiz sayılır', () => {
    expect(etiketsiz('[excited] Ben büyüdüm artık!')).toBe('Ben büyüdüm artık!');
    expect(kelimeler('[whispers] Söz mü?').map((k) => k.k)).toEqual(['Söz', 'mü?']);
    const a = kelimeAgirliklari('Önce oyun... sonra yemek.');
    expect(a.length).toBe(4);
    for (let i = 1; i < a.length; i++) expect(a[i]).toBeGreaterThan(a[i - 1]);
  });
  it('karakter renkleri krem sayfada okunaklı (kontrast ≥ 4.5)', () => {
    const lum = (h: string) => {
      const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const zemin = lum('#FFF8EA');
    for (const [kim, k] of Object.entries(KARAKTERLER)) expect((zemin + 0.05) / (lum(k.renk) + 0.05), kim).toBeGreaterThanOrEqual(4.5);
  });
});

describe('Kitap: canlanan anlar ve çizim listesi', () => {
  it('her sayfada (kapak + 14) canlı tanım; adımlar var olan katmana, poza ve parça karesine', () => {
    for (let no = 0; no <= 14; no++) {
      const c = OKUL_CANLI[no];
      expect(c, `sayfa ${no}`).toBeTruthy();
      expect(c.ugur[0]).toBeGreaterThan(0.08);
      expect(c.ugur[0]).toBeLessThan(0.92);
      const kat = new Map(c.katmanlar.map((k) => [k.id, k]));
      for (const an of c.anlar) {
        for (const d of an.dokun) if (d.startsWith('bolge:')) expect(c.bolgeler?.[d.slice(6)], d).toBeTruthy();
        else expect(kat.has(d), `${no}/${an.id}/${d}`).toBe(true);
        for (const a of [...an.adimlar, ...(an.sirali ?? []).flat()]) {
          if (!a.k || a.k === 'ugur') continue;
          const k = kat.get(a.k);
          expect(k, `${no}/${an.id}/${a.k}`).toBeTruthy();
          if (a.poz) expect(a.poz).toBeLessThanOrEqual(k!.pozlar);
          if (a.parca) {
            expect(k!.parcalar?.[a.parca[0]], `${no}/${a.k}/${a.parca[0]}`).toBeTruthy();
            expect(a.parca[1]).toBeLessThanOrEqual(k!.parcalar![a.parca[0]]);
          }
        }
      }
      // en az bir dokunmayla tetiklenen an (çocuk keşfeder)
      expect(c.anlar.some((a) => a.dokun.length > 0), `sayfa ${no}`).toBe(true);
    }
  });
  it('kesme betiğinin tablosu (kitap-isle.cjs) kodla aynı: katmanlar, poz ve kare sayıları, yaklaşık yerler', () => {
    const req = createRequire(import.meta.url);
    type BetikKatman = { id: string; yer: number[]; pozlar: number; parcalar?: Record<string, number> };
    const { SAYFALAR, parcaAdi } = req('../../ekip/illustrator/kitap-isle.cjs') as { SAYFALAR: Record<string, BetikKatman[]>; parcaAdi: (s: string, k: BetikKatman, p: string) => string };
    for (let no = 0; no <= 14; no++) {
      const anahtar = no === 0 ? 'kapak' : `s${String(no).padStart(2, '0')}`;
      const betik = new Map(SAYFALAR[anahtar].map((k) => [k.id, k]));
      for (const k of OKUL_CANLI[no].katmanlar) {
        const id = k.kaynak?.[0] ?? k.id;
        const b = betik.get(id);
        expect(b, `${anahtar}/${id}`).toBeTruthy();
        if (k.kaynak) {
          expect(b!.pozlar).toBeGreaterThanOrEqual(k.kaynak[1]);
          continue;
        }
        expect(b!.pozlar, `${anahtar}/${id}`).toBe(k.pozlar);
        expect(b!.parcalar ?? {}, `${anahtar}/${id}`).toEqual(k.parcalar ?? {});
        expect(b!.yer, `${anahtar}/${id}`).toEqual(k.yer);
      }
    }
    // çizim listesi her hareket sayfasının dosya adını içerir
    const liste = readFileSync(resolve(KOK, 'ekip/antigravity/KITAP-DOSYA-ADLARI.md'), 'utf8');
    for (const [anahtar, kat] of Object.entries(SAYFALAR)) {
      for (const k of kat) {
        expect(liste, `${anahtar}-${k.id}.png`).toContain(`${anahtar}-${k.id}.png`);
        for (const p of Object.keys(k.parcalar ?? {})) expect(liste).toContain(`${parcaAdi(anahtar, k, p)}.png`);
      }
    }
  });
});

describe('Kitap: ekran ölçüleri (telefon önce)', () => {
  it('yatay telefonda iki sayfa, dikeyde tek sayfa; ekrana sığar', () => {
    for (const [w, h] of [[844, 390], [667, 375], [932, 430], [1024, 768]]) {
      const o = kitapOlcusu(w, h);
      expect(o.yatay).toBe(true);
      expect(o.x).toBeGreaterThanOrEqual(56);
      expect(o.x + 2 * o.pw).toBeLessThanOrEqual(w - 56);
      expect(o.y + o.ph).toBeLessThanOrEqual(h);
      // dar sayfada resmin ortadaki %70'i görünür
      expect(o.pw / o.ph).toBeGreaterThanOrEqual(0.75);
    }
    for (const [w, h] of [[390, 844], [360, 780], [768, 1024]]) {
      const o = kitapOlcusu(w, h);
      expect(o.yatay).toBe(false);
      expect(o.x + o.pw).toBeLessThanOrEqual(w);
      expect(o.y + o.ph).toBeLessThanOrEqual(h);
      expect(o.ph - o.resimH, `${w}x${h} yazı alanı`).toBeGreaterThanOrEqual(280);
    }
  });
  it('netlik: sayfa resmi (1376×768 tam sayfa) hiçbir ekranda büyütülmez, kırpılmaz; resim alanı sayfaya sığar', () => {
    const [kw, kh] = VARSAYILAN_KAYNAK;
    for (const [w, h] of [[844, 390], [667, 375], [390, 844], [360, 780], [768, 1024], [1024, 768], [1366, 1024]]) {
      const o = kitapOlcusu(w, h);
      expect(o.resimW * NETLIK_DPR, `${w}x${h}`).toBeLessThanOrEqual(kw);
      expect(o.resimH * NETLIK_DPR, `${w}x${h}`).toBeLessThanOrEqual(kh);
      expect(Math.abs(o.resimW / o.resimH - kw / kh)).toBeLessThan(0.02);
      expect(o.resimW).toBeLessThanOrEqual(o.pw);
      expect(o.resimH).toBeLessThanOrEqual(o.ph);
    }
    // telefonda resim yatayda sol sayfanın, dikeyde ekranın neredeyse tamamı
    expect(kitapOlcusu(844, 390).resimW).toBeGreaterThanOrEqual(330);
    expect(kitapOlcusu(390, 844).resimW).toBe(366);
    // daha büyük çizim gelince alan büyür (yine sınırda)
    expect(kitapOlcusu(768, 1024, [2752, 1536]).resimW).toBeGreaterThan(kitapOlcusu(768, 1024).resimW);
  });
  it('tam sayfa çizimlerinde dokunma bölgeleri bir ana bağlı, uğur böceği resmin içinde', () => {
    for (let no = 0; no <= 14; no++) {
      const t = OKUL_CANLI[no].tam!;
      expect(t, `sayfa ${no}`).toBeTruthy();
      expect(t.ugur[0]).toBeGreaterThan(0);
      expect(t.ugur[0]).toBeLessThan(1);
      expect(t.ugur[1]).toBeGreaterThan(0);
      expect(t.ugur[1]).toBeLessThan(1);
      const dokun = new Set(OKUL_CANLI[no].anlar.flatMap((a) => a.dokun));
      expect(Object.keys(t.yerler).length, `sayfa ${no}`).toBeGreaterThan(0);
      for (const [k, v] of Object.entries(t.yerler)) {
        expect(dokun.has(k), `sayfa ${no}: ${k}`).toBe(true);
        for (const kutu of (Array.isArray(v[0]) ? v : [v]) as number[][]) {
          expect(kutu[0] + kutu[2], `sayfa ${no}: ${k}`).toBeLessThanOrEqual(1.001);
          expect(kutu[1] + kutu[3], `sayfa ${no}: ${k}`).toBeLessThanOrEqual(1.001);
        }
      }
    }
  });
});

describe('Kitap: kayıt', () => {
  it('bozuk kayıt baştan başlar; tanınan alanlar korunur', () => {
    expect(ANAHTAR).toMatch(/^minkino-/);
    expect(kayitCoz('{bozuk').kitaplar).toEqual({});
    const k = kayitCoz(JSON.stringify({ mod: 'oku', kitaplar: { okul: { sayfa: 4.2, bitti: 1, bulunan: { s01: ['ugur', 3] } } } }));
    expect(k.mod).toBe('oku');
    expect(k.kitaplar.okul).toEqual({ sayfa: 4, bitti: 1, bulunan: { s01: ['ugur'] } });
    expect(kayitCoz(JSON.stringify({ mod: 'xx' })).mod).toBeNull();
  });
});
