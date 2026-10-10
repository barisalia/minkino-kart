import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import K from '../../content/kino-otobus.json';
import {
  HAMUR_DOLU_MS,
  KEPCE_YOL,
  KULAH_STOK,
  kepceBirak,
  kepceDolum,
  kulahAdimlari,
  kulahAzMi,
  kulahKullan,
  kulahYap,
  lekeDuserMi,
  lekelerUret,
  Sallama,
  SALLAMA_ESIK,
  SALLAMA_GEREK,
  sil,
  SILME_YOL,
  SOS_DOLU_MS,
  sosDolum,
  temizlikAyari,
} from '../../kino-otobus/src/el-isi';
import { VARLIK } from '../../kino-otobus/src/varliklar';

describe('Kino’nun Otobüsü: dokunsal hazırlık', () => {
  it('kepçe: tatta sürükledikçe top büyür, dışarıda daha yavaş; en çok 1', () => {
    expect(kepceDolum(0, KEPCE_YOL / 2, true)).toBeCloseTo(0.5);
    expect(kepceDolum(0, KEPCE_YOL / 2, false)).toBeLessThan(0.5);
    expect(kepceDolum(0.9, 1000, true)).toBe(1);
    // tatın üstünde azıcık sürükleyip bırakan vazgeçmiş sayılır; başka her bırakış topu verir (affedici)
    expect(kepceBirak(0.1, true)).toBe('geri');
    expect(kepceBirak(0.1, false)).toBe('ver');
    expect(kepceBirak(0.6, true)).toBe('ver');
  });
  it('sos: şişe kulenin üstünde tutuldukça akar, ~0.7 sn’de tamam', () => {
    let d = 0;
    for (let t = 0; t < SOS_DOLU_MS; t += 16) d = sosDolum(d, 16);
    expect(d).toBeGreaterThan(0.97);
    expect(SOS_DOLU_MS).toBeLessThanOrEqual(1000);
    expect(sosDolum(0.95, 500)).toBe(1);
  });
  it('serpinti: yön değiştiren sallamalar sayılır, küçük titreme sayılmaz', () => {
    const s = new Sallama();
    // sağa 20u, sola 20u, sağa 20u, sola 20u: üç yön değişimi
    const hareketler = [20, -20, 20, -20];
    let sayilan = 0;
    for (const dx of hareketler) for (let i = 0; i < 4; i++) if (s.ekle(dx / 4, 0)) sayilan++;
    expect(sayilan).toBe(3);
    expect(s.sayi).toBeGreaterThanOrEqual(SALLAMA_GEREK);
    const t = new Sallama();
    for (let i = 0; i < 10; i++) t.ekle(i % 2 ? -SALLAMA_ESIK / 4 : SALLAMA_ESIK / 4, 0);
    expect(t.sayi).toBe(0);
    // dikey sallama da olur
    const d = new Sallama();
    d.ekle(0, 20);
    expect(d.ekle(0, -20)).toBe(true);
  });
});

describe('Kino’nun Otobüsü: yan işler', () => {
  it('temizlik: ovdukça kir azalır, iki dokunuş bir leke; 3-4 iki leke, 5-6 üç leke ve sinek', () => {
    const [l] = lekelerUret('kucuk');
    expect(l.kir).toBe(1);
    sil(l, SILME_YOL / 2);
    expect(l.kir).toBeCloseTo(0.5);
    sil(l, SILME_YOL);
    expect(l.kir).toBe(0);
    const [m] = lekelerUret('kucuk');
    sil(m, null);
    expect(sil(m, null)).toBe(0);
    expect(lekelerUret('kucuk')).toHaveLength(temizlikAyari('kucuk').leke);
    expect(temizlikAyari('kucuk')).toEqual({ leke: 2, sinek: false });
    expect(temizlikAyari('buyuk')).toEqual({ leke: 3, sinek: true });
  });
  it('lekeler yoğun anlardan sonra (her ikinci verişte), tezgâh temizse, öğreticide asla', () => {
    expect(lekeDuserMi(1, 0, false)).toBe(false);
    expect(lekeDuserMi(2, 0, false)).toBe(true);
    expect(lekeDuserMi(2, 1, false)).toBe(false);
    expect(lekeDuserMi(2, 0, true)).toBe(false);
    expect(lekeDuserMi(4, 0, false)).toBe(true);
  });
  it('külah hiç bitmez: gün başında az (sabah hazırlığı), alındıkça azalır, en az 1; yapınca dolar', () => {
    expect(kulahAzMi(KULAH_STOK.bas)).toBe(true);
    let s: number = KULAH_STOK.bas;
    for (let i = 0; i < 10; i++) s = kulahKullan(s);
    expect(s).toBe(KULAH_STOK.enAz);
    s = kulahYap();
    expect(s).toBe(KULAH_STOK.dolu);
    expect(kulahAzMi(s)).toBe(false);
    expect(kulahAzMi(kulahKullan(kulahKullan(s)))).toBe(true);
  });
  it('külah yapımı: 3-4 iki adım (bas, yuvarla), 5-6 bir adım fazla (önce hamur); süre yok', () => {
    expect(kulahAdimlari('kucuk')).toEqual(['bas', 'yuvarla']);
    expect(kulahAdimlari('buyuk')).toEqual(['hamur', 'bas', 'yuvarla']);
    expect(HAMUR_DOLU_MS).toBeLessThanOrEqual(1000);
  });
  it('yan işlerin yeni sözleri kısa; Ek C görselleri listede ve haritada', () => {
    for (const s of [K.kino.piril, K.kino.taze, K.mino.kulah_az]) expect(s.length).toBeLessThanOrEqual(20);
    const liste = fs.readFileSync(path.resolve(__dirname, '../../ekip/gemini/IS-LISTESI-YENI.md'), 'utf8');
    const ekC = liste.slice(liste.indexOf('## Ek C'));
    const adlar = ['kara-tahta', 'kavanoz-rafi', 'lamba', 'leke-cilek', 'leke-cikolata', 'leke-vanilya', 'sunger', 'sinek', 'kulah-makinesi', 'kulah-makinesi-kapak', 'hamur-surahi', 'kulah-hamuru'];
    for (const a of adlar) {
      expect(Object.keys(VARLIK)).toContain(a);
      expect(ekC).toContain(`kino-otobus/${a}.webp`);
    }
  });
});
