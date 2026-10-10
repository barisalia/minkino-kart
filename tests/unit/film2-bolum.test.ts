import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bolumParcalari, dogrula, etiketsiz, satirla, srtYaz, tumReplikler, zamanla, type Bolum, type Sahne, type Seri } from '../../film/src/film2/bicim';

const seri = JSON.parse(readFileSync('content/film2/seri.json', 'utf8')) as Seri;
const bolumler = readdirSync('content/film2')
  .filter((f) => /^bolum-\d+\.json$/.test(f))
  .map((f) => JSON.parse(readFileSync(`content/film2/${f}`, 'utf8')) as Bolum);
const muzikler = readdirSync('assets/muzik')
  .filter((f) => f.endsWith('.mp3'))
  .map((f) => f.replace(/\.mp3$/, ''));

describe('Kino ve Ailesi bölüm dosyaları', () => {
  it('en az bir bölüm var', () => {
    expect(bolumler.length).toBeGreaterThan(0);
  });
  for (const b of bolumler) {
    it(`${b.kimlik} geçerli (denetim hatasız)`, () => {
      expect(dogrula(seri, b, muzikler)).toEqual([]);
    });
    it(`${b.kimlik} replik kimlikleri bölüm önekli ve tek`, () => {
      const r = tumReplikler(seri, b);
      const on = b.kimlik.replace('bolum-', 'b');
      for (const x of r) expect(x.kimlik.startsWith(`${on}-`), x.kimlik).toBe(true);
      expect(new Set(r.map((x) => x.kimlik)).size).toBe(r.length);
    });
    it(`${b.kimlik} kitler ve mekân görselleri ya var ya eksik listesinde açıklanmış`, () => {
      for (const s of bolumParcalari(seri, b)) {
        const m = seri.mekanlar[s.mekan];
        if (m.resim && !existsSync(`assets/film-seri2/${m.resim}.webp`)) expect(m.not ?? '', `${s.mekan} görseli yok, not gerekli`).not.toBe('');
      }
    });
  }
});

describe('denetim hataları yakalar', () => {
  const b = bolumler[0];
  const bozuk = (f: (s: Sahne) => void) => {
    const kopya = JSON.parse(JSON.stringify(b)) as Bolum;
    f(kopya.sahneler.find((s) => s.kimlik === 's4')!);
    return dogrula(seri, kopya, muzikler);
  };
  it('bilinmeyen komut', () => {
    expect(bozuk((s) => s.olaylar!.push({ t: 1, kim: 'kino', yap: 'uc' })).join()).toMatch(/bilinmeyen komut/);
  });
  it('bilinmeyen çapa', () => {
    expect(bozuk((s) => s.olaylar!.push({ t: 'yok-boyle-bir-sey + 1', kim: 'kino', yap: 'gizle' })).join()).toMatch(/bilinmeyen çapa/);
  });
  it('altyazı ile etiketli metin farklı', () => {
    expect(bozuk((s) => (s.replikler[0].etiket = '[softly] Başka bir cümle.')).join()).toMatch(/etiketli metin/);
  });
  it('sahnede olmayan konuşan', () => {
    expect(bozuk((s) => s.replikler.push({ kimlik: 'b01-s4-mino-99', kim: 'mino', metin: 'Merhaba.' })).join()).toMatch(/sahnede yok/);
  });
  it('olmayan müzik dosyası', () => {
    expect(bozuk((s) => s.muzik!.push({ t: 2, ad: 'boyle-muzik-yok' })).join()).toMatch(/müzik dosyası yok/);
  });
  it('sahne bittikten sonraki olay', () => {
    expect(bozuk((s) => s.olaylar!.push({ t: 9999, kim: 'kino', yap: 'gizle' })).join()).toMatch(/sahne bittikten sonra/);
  });
});

describe('zaman çizelgesi', () => {
  const s: Sahne = {
    kimlik: 'x',
    ad: 'x',
    mekan: 'oda-sabah',
    sure: 'b-2:son + 1',
    isaretler: { gir: 'b-1:son + 0.5' },
    oyuncular: { kino: { kit: 'kino', x: 0, y: 0 } },
    kamera: [{ t: 0, x: 0, y: 0, g: 100 }],
    replikler: [
      { kimlik: 'b-1', kim: 'kino', t: 2, metin: 'Bir.' },
      { kimlik: 'b-2', kim: 'kino', t: 'gir + 1', metin: 'İki.' },
      { kimlik: 'b-3', kim: 'kino', metin: 'Üç.', ara: 0.25 },
    ],
  };
  it('çapalar, işaretler ve sıralı replikler', () => {
    const c = zamanla(s, (r) => ({ 'b-1': 1, 'b-2': 2, 'b-3': 1 })[r.kimlik]);
    expect(c.replikler.map((r) => [r.bas, r.son])).toEqual([
      [2, 3],
      [4.5, 6.5],
      [6.75, 7.75],
    ]);
    expect(c.coz('b-1:son - 0.5')).toBe(2.5);
    expect(c.coz('b-2:son+0.5')).toBe(7);
    expect(c.sure).toBe(7.5);
  });
  it('kayıt yokken metnin hece ritminden süre', () => {
    const c = zamanla(s);
    expect(c.replikler[0].son).toBeGreaterThan(c.replikler[0].bas);
  });
  it('döngü hata verir', () => {
    expect(() => zamanla({ ...s, isaretler: { a: 'b', b: 'a' }, replikler: [{ kimlik: 'r', kim: 'kino', t: 'a', metin: 'x' }] })).toThrow(/döngü/);
  });
});

describe('altyazı', () => {
  it('etiketler atılır', () => {
    expect(etiketsiz('[softly] Merhaba. [giggles] Nasılsın?')).toBe('Merhaba. Nasılsın?');
  });
  it('srt biçimi ve uzun satır bölünür', () => {
    const s = srtYaz([
      { bas: 1, son: 2.5, metin: 'Kino battaniyesinin altına saklandı. Kimse onu görmesin istedi.' },
      { bas: 62.25, son: 63, metin: 'Ben!' },
    ]);
    expect(s).toContain('1\n00:00:01,000 --> 00:00:02,800\n');
    expect(s).toContain('2\n00:01:02,250 --> 00:01:03,300\nBen!');
    expect(s.split('\n')[3]).not.toBe('');
    expect(satirla('kısa')).toBe('kısa');
  });
});
