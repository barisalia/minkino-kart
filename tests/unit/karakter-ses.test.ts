import { describe, expect, it } from 'vitest';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import fs from 'node:fs';
import {
  karakterUretimleri,
  kayitSec,
  kimlikOzeti,
  manifestiAyikla,
  manifestKimligi,
  sesImzasi,
  uretimIsleri,
  type Seri2Sesleri,
  type SesAyari,
  type SesManifest,
} from '../../src/audio/karakter-ses';
import film2 from '../../content/film2/sesler.json';
import otobus from '../../content/kino-otobus.json';
import lokanta from '../../content/restoran/lokanta.json';
import seslendirme from '../../content/seslendirme.json';
import banyo from '../../content/macera-banyo.json';

// Betikteki sha1 yerine sınamada basit, belirleyici bir ad (aynı imza + metin → aynı ad)
const dosyaAdi = (metin: string, imza: string) => encodeURIComponent(`${imza}|${normal(metin)}`) + '.mp3';
const ANLATICI = 'anlatici-ses';
const KINO = 'kino-ses';
const temel: SesAyari = { model: 'eleven_v3', baglam: false, dil: 'tr' };
const bos = (): SesManifest => ({ ses_id: null, model: null, dosyalar: {} });
const cumleler = tumCumleler();
const kc = karakterCumleleri();

/** Karakter sesi desteği gelmeden önceki betiğin eksik listesi (eski davranış) */
function eskiListe(m: SesManifest, varMi: (f: string) => boolean) {
  const imza = `${ANLATICI}|${temel.model}|${temel.baglam ? 'baglam' : ''}|${temel.dil ?? ''}`;
  const guncelDegil = (c: string) => !m.dosyalar[c] || !varMi(m.dosyalar[c]) || m.imzalar?.[c] !== imza;
  return cumleler.filter(guncelDegil).map((c) => ({ metin: c, dosya: dosyaAdi(c, imza) }));
}
const plan = (ayar: SesAyari, manifest: SesManifest, dosyaVar: (f: string) => boolean = () => true, sesId = ANLATICI) =>
  uretimIsleri({ ayar, sesId, manifest, cumleler, karakterCumleleri: kc, dosyaAdi, dosyaVar });

/** Anlatıcı kayıtlarının hepsi güncel olan bir manifest */
function tamManifest(): SesManifest {
  const imza = sesImzasi(ANLATICI, temel);
  const m = bos();
  m.imzalar = {};
  for (const c of cumleler) {
    m.dosyalar[c] = dosyaAdi(c, imza);
    m.imzalar[c] = imza;
  }
  return m;
}

describe('Kino cümleleri', () => {
  it('Banyo bölümünün bütün Kino cümleleri listede, hepsinin anlatıcı yedeği de var', () => {
    const beklenen = Object.values(banyo.kino).map(normal);
    expect(kc.kino).toEqual(expect.arrayContaining(beklenen));
    const hepsi = new Set(cumleler);
    for (const c of kc.kino) expect(hepsi.has(c)).toBe(true);
  });

  it('seslendirme.json: karakter_sesleri.kino tanımlı (boş = eski davranış) ve anlatıcıdan ayrı bir ses', () => {
    expect(typeof seslendirme.karakter_sesleri.kino).toBe('string');
    expect(seslendirme.karakter_sesleri.kino).not.toBe(seslendirme.ses_id);
  });
});

describe('seslendirme planı', () => {
  it('karakter sesi boşken çıktı listesi eskisiyle aynı', () => {
    const m = bos();
    const eski = eskiListe(m, () => true);
    for (const ayar of [temel, { ...temel, karakter_sesleri: { kino: '' } }, { ...temel, karakter_sesleri: { kino: '  ' } }]) {
      const isler = plan(ayar, m);
      expect(isler.map(({ metin, dosya }) => ({ metin, dosya }))).toEqual(eski);
      expect(isler.every((x) => x.karakter === null && x.sesId === ANLATICI)).toBe(true);
    }
    // Kısmen dolu manifest ve diskte eksik dosya ile de aynı
    const t = tamManifest();
    delete t.dosyalar[cumleler[3]];
    const yok = t.dosyalar[cumleler[7]];
    const varMi = (f: string) => f !== yok;
    expect(plan({ ...temel, karakter_sesleri: { kino: '' } }, t, varMi).map(({ metin, dosya }) => ({ metin, dosya }))).toEqual(eskiListe(t, varMi));
  });

  it('karakter sesi doluyken Kino cümleleri kendi sesiyle ayrı klasöre gidiyor', () => {
    const ayar = { ...temel, karakter_sesleri: { kino: KINO } };
    const isler = plan(ayar, bos());
    const anlatici = isler.filter((x) => !x.karakter);
    const kino = isler.filter((x) => x.karakter === 'kino');
    expect(anlatici.map(({ metin, dosya }) => ({ metin, dosya }))).toEqual(eskiListe(bos(), () => true));
    expect(kino.map((x) => x.metin).sort()).toEqual([...kc.kino].sort());
    for (const x of kino) {
      expect(x.sesId).toBe(KINO);
      expect(x.dosya.startsWith('kino/')).toBe(true);
    }
    // Aynı metnin anlatıcı ve Kino dosyaları çakışmaz
    const adlar = isler.map((x) => x.dosya);
    expect(new Set(adlar).size).toBe(adlar.length);
  });

  it('Kino sesi değişince yalnız Kino dosyaları, anlatıcı sesi değişince yalnız anlatıcı dosyaları yeniden üretilir', () => {
    const m = tamManifest();
    const eskiKino = sesImzasi('eski-kino', temel);
    m.karakterler = { kino: { ses_id: 'eski-kino', dosyalar: {}, imzalar: {} } };
    for (const c of kc.kino) {
      m.karakterler.kino.dosyalar[c] = `kino/${dosyaAdi(c, eskiKino)}`;
      m.karakterler.kino.imzalar![c] = eskiKino;
    }
    // hiçbir şey değişmediyse iş yok
    expect(plan({ ...temel, karakter_sesleri: { kino: 'eski-kino' } }, m)).toEqual([]);
    // Kino'nun sesi değişti → yalnız Kino
    const kinoDegisti = plan({ ...temel, karakter_sesleri: { kino: KINO } }, m);
    expect(kinoDegisti.length).toBe(kc.kino.length);
    expect(kinoDegisti.every((x) => x.karakter === 'kino')).toBe(true);
    // Anlatıcının sesi değişti → yalnız anlatıcı
    const anlaticiDegisti = plan({ ...temel, karakter_sesleri: { kino: 'eski-kino' } }, m, () => true, 'yeni-anlatici');
    expect(anlaticiDegisti.length).toBe(cumleler.length);
    expect(anlaticiDegisti.every((x) => x.karakter === null)).toBe(true);
  });

  it('karakter sesi boşaltılınca kayıtları manifestten çıkar; anlatıcı kayıtları kalır', () => {
    const m = tamManifest();
    m.karakterler = { kino: { ses_id: KINO, dosyalar: { [kc.kino[0]]: 'kino/a.mp3' }, imzalar: {} } };
    const doluyken = manifestiAyikla(structuredClone(m), { ...temel, karakter_sesleri: { kino: KINO } }, cumleler, kc);
    expect(doluyken.has('kino/a.mp3')).toBe(true);
    const kullanilan = manifestiAyikla(m, { ...temel, karakter_sesleri: { kino: '' } }, cumleler, kc);
    expect(m.karakterler).toBeUndefined();
    expect(kullanilan.has('kino/a.mp3')).toBe(false);
    expect(kullanilan.size).toBe(new Set(Object.values(tamManifest().dosyalar)).size);
  });
});

describe('oyuncu: kayıt seçimi', () => {
  const metin = 'Burnum!';
  const m: SesManifest = { ses_id: ANLATICI, dosyalar: { [metin]: 'anlatici.mp3', 'Kulağım!': 'kulak.mp3' }, karakterler: { kino: { ses_id: KINO, dosyalar: { [metin]: 'kino/burun.mp3' } } } };

  it('Kino cümlesinin kendi kaydı varsa onu normal tonda çalar', () => {
    expect(kayitSec(m, metin, { karakter: 'kino', ton: 0.92 })).toEqual({ kayit: 'kino/burun.mp3', hiz: 1, karakter: 'kino' });
    expect(kayitSec(m, '  Burnum! ', { karakter: 'kino', ton: 0.92 })?.kayit).toBe('kino/burun.mp3');
  });

  it('kendi kaydı yoksa anlatıcı kaydını Kino tonuyla (0.92) çalar', () => {
    expect(kayitSec(m, 'Kulağım!', { karakter: 'kino', ton: 0.92 })).toEqual({ kayit: 'kulak.mp3', hiz: 0.92, karakter: null });
    const kinosuz: SesManifest = { ses_id: ANLATICI, dosyalar: { [metin]: 'anlatici.mp3' } };
    expect(kayitSec(kinosuz, metin, { karakter: 'kino', ton: 0.92 })).toEqual({ kayit: 'anlatici.mp3', hiz: 0.92, karakter: null });
  });

  it('karakter belirtilmezse (Mino, anlatıcı) Kino kaydına dokunmaz', () => {
    expect(kayitSec(m, metin, { ton: 1.12 })).toEqual({ kayit: 'anlatici.mp3', hiz: 1.12, karakter: null });
    expect(kayitSec(m, metin)).toEqual({ kayit: 'anlatici.mp3', hiz: 1, karakter: null });
    expect(kayitSec(m, 'Olmayan cümle', { karakter: 'kino' })).toBeNull();
    expect(kayitSec(null, metin, { karakter: 'kino' })).toBeNull();
  });
});

describe('Seri 2 karakter sesleri (eleven_v4)', () => {
  const seri2: Seri2Sesleri = { model: 'eleven_v4', dil: 'tr', ayarlar: { stability: 0.4 }, sesler: { anne: 'anne-gizli-kimlik', babaanne: 'babaanne-gizli', tombi: 'tombi-gizli', kino: 'seri2-kino' } };
  const ayar: SesAyari = { ...temel, karakter_sesleri: { kino: KINO }, seri2: { karakterler: ['anne', 'babaanne', 'tombi', 'kino', 'sesi-olmayan'] } };

  it('cümle listesi konuşanı belirtir: restoran müşterileri, Babaanne ve Otobüs\'ün 36 müşteri cümlesi', () => {
    expect(kc.anne).toEqual(expect.arrayContaining(Object.values(otobus.musteri.anne).map(normal)));
    expect(kc.anne).toEqual(expect.arrayContaining(Object.values(lokanta.musteri.anne).map(normal)));
    const otobusToplam = Object.values(otobus.musteri).flatMap((s) => Object.values(s));
    expect(otobusToplam.length).toBe(36);
    for (const [ad, s] of Object.entries(otobus.musteri)) for (const c of Object.values(s)) expect(kc[ad]).toContain(normal(c));
    expect(kc.babaanne?.length ?? 0).toBeGreaterThan(0);
  });

  it('listedeki karakterler kendi modeli ve ayarıyla, kendi klasörüne üretilir; Kino eski sesiyle kalır', () => {
    const ku = karakterUretimleri(ayar, seri2);
    expect(Object.keys(ku).sort()).toEqual(['anne', 'babaanne', 'kino', 'tombi']);
    expect(ku.kino.sesId).toBe(KINO);
    expect(ku.kino.model).toBe('eleven_v3');
    expect(ku.anne).toMatchObject({ model: 'eleven_v4', dil: 'tr', gizli: true });
    const isler = uretimIsleri({ ayar, sesId: ANLATICI, manifest: tamManifest(), cumleler, karakterCumleleri: kc, karakterler: ku, dosyaAdi, dosyaVar: () => true });
    const anne = isler.filter((x) => x.karakter === 'anne');
    expect(anne.map((x) => x.metin).sort()).toEqual([...kc.anne].sort());
    for (const x of anne) {
      expect(x.model).toBe('eleven_v4');
      expect(x.ayarlar).toEqual({ stability: 0.4 });
      expect(x.dosya.startsWith('anne/')).toBe(true);
      // ses kimliği imzaya (manifest'e) yazılmaz
      expect(x.imza).not.toContain('anne-gizli-kimlik');
    }
    // anlatıcı işleri değişmedi (tam manifest: iş yok)
    expect(isler.filter((x) => !x.karakter)).toEqual([]);
    expect(manifestKimligi(ku.anne)).not.toContain('anne-gizli');
    expect(kimlikOzeti('a')).not.toBe(kimlikOzeti('b'));
  });

  it('seri2 yoksa ya da karakterin kimliği yoksa eski davranış (anlatıcı yedeği)', () => {
    expect(Object.keys(karakterUretimleri(ayar, null))).toEqual(['kino']);
    expect(Object.keys(karakterUretimleri({ ...temel, karakter_sesleri: { kino: KINO } }, seri2))).toEqual(['kino']);
  });

  it('gerçek ayar: seslendirme.json seri2 listesi film2/sesler.json\'da kimliği olanlar; koda kimlik yazılmamış', () => {
    const ku = karakterUretimleri(seslendirme as SesAyari, film2 as Seri2Sesleri);
    for (const k of ['anne', 'baba', 'lokum', 'babaanne', 'dede', 'bidik', 'tombi', 'zipzip', 'bulut', 'nehir']) expect(ku[k]?.model).toBe('eleven_v4');
    expect(ku.kino.model).toBe(seslendirme.model);
    const kod = ['src/audio/karakter-ses.ts', 'src/audio/cumleler.ts', 'scripts/seslendir.ts', 'restoran/src/model.ts', 'kino-otobus/src/gun.ts'].map((d) => fs.readFileSync(d, 'utf8')).join('\n');
    for (const id of Object.values(film2.sesler)) expect(kod.includes(id)).toBe(false);
  });

  it('oyuncu: müşterinin kendi kaydı varsa normal hızda, yoksa anlatıcı kaydı tonla', () => {
    const m: SesManifest = { ses_id: ANLATICI, dosyalar: { 'Selam!': 'a.mp3' }, karakterler: { anne: { ses_id: 'x', dosyalar: { 'Selam!': 'anne/s.mp3' } } } };
    expect(kayitSec(m, 'Selam!', { karakter: 'anne', ton: 1.04 })).toEqual({ kayit: 'anne/s.mp3', hiz: 1, karakter: 'anne' });
    expect(kayitSec(m, 'Selam!', { karakter: 'baba', ton: 0.86 })).toEqual({ kayit: 'a.mp3', hiz: 0.86, karakter: null });
  });
});
