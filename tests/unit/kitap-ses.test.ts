import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KITAPLAR } from '../../kitap/src/kitaplar';
import { etiketsiz, kelimeler } from '../../kitap/src/metin';
import { kelimeAnlari, kelimeYerleri, konusmaSonu, satirAnahtari, simdikiKelime, type Hizalama, type KitapSesManifest } from '../../kitap/src/ses-mantik';
import type { Kim } from '../../kitap/src/tipler';

const KOK = resolve(__dirname, '../..');

/** Kitapların seslendirilecek bütün satırları (sayfa + canlanan anların sözleri) */
function satirlar(): { kim: Kim; metin: string }[] {
  const l: { kim: Kim; metin: string }[] = [];
  for (const k of KITAPLAR) {
    if (!k.icerik) continue;
    for (const s of [k.icerik.kapak.satirlar, ...k.icerik.sayfalar.map((p) => p.satirlar)].flat()) if (s.kim !== 'ses') l.push(s);
    for (const sc of Object.values(k.canli ?? {})) for (const an of sc.anlar) for (const a of [...an.adimlar, ...(an.sirali ?? []).flat()]) if (a.soz) l.push(a.soz);
  }
  return l;
}

/** Yapay hizalama: her harf 50 ms, etiketler sessiz */
function hizala(metin: string): Hizalama {
  const characters = [...metin];
  return { characters, character_start_times_seconds: characters.map((_, i) => i * 0.05), character_end_times_seconds: characters.map((_, i) => i * 0.05 + 0.05) };
}

describe('Kitap sesi: kelime anları', () => {
  it('kelime sırası sayfadaki kelimelerle aynı (ses etiketleri sayılmaz)', () => {
    for (const s of satirlar()) expect(kelimeYerleri(s.metin).map((w) => w.k), s.metin).toEqual(kelimeler(s.metin).map((w) => w.k));
  });
  it('zaman damgalarından her kelimenin başladığı an', () => {
    const m = '[whispers] Söz mü?';
    const a = kelimeAnlari(m, hizala(m));
    expect(a).toEqual([550, 750]);
    expect(simdikiKelime(a, 0)).toBe(0);
    expect(simdikiKelime(a, 760)).toBe(1);
    expect(konusmaSonu(hizala(m))).toBe(850);
  });
  it('model metni değiştirse de (büyük/küçük harf, noktalama) harf harf eşlenir', () => {
    const h = hizala('ben de okul');
    expect(kelimeAnlari('[giggles] Ben de okul!', h)).toEqual([0, 200, 350]);
  });
});

describe('Kitap sesi: kayıtlar', () => {
  const m: KitapSesManifest = JSON.parse(readFileSync(resolve(KOK, 'public/ses/kitap/manifest.json'), 'utf8'));
  const ayar = JSON.parse(readFileSync(resolve(KOK, 'content/kitap-ses.json'), 'utf8'));
  it('her konuşanın sesi tanımlı (Seri 2 sesleri, eleven_v4)', () => {
    const seri2 = JSON.parse(readFileSync(resolve(KOK, ayar.kaynak), 'utf8'));
    expect(ayar.model).toBe('eleven_v4');
    for (const s of satirlar()) expect(seri2.sesler[ayar.kimler[s.kim]?.ses], s.kim).toBeTruthy();
  });
  it('kitabın her satırının kendi kaydı ve kelime anları var', () => {
    for (const s of satirlar()) {
      const k = m.satirlar[satirAnahtari(s.kim, s.metin)];
      expect(k, `${s.kim}: ${s.metin}`).toBeTruthy();
      expect(k.d.startsWith(`${s.kim}/`)).toBe(true);
      expect(existsSync(resolve(KOK, 'public/ses/kitap', k.d)), k.d).toBe(true);
      expect(k.k.length, s.metin).toBe(kelimeler(s.metin).length);
      for (let i = 1; i < k.k.length; i++) expect(k.k[i]).toBeGreaterThanOrEqual(k.k[i - 1]);
      expect(k.k.at(-1)!, s.metin).toBeLessThan(k.s);
      expect(etiketsiz(s.metin).length).toBeGreaterThan(0);
    }
  });
});
