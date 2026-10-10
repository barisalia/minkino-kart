import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import icerik from '../../content/oyunlu/kinonun-bir-gunu.json';
import kinoJson from '../../assets/karakter/kino-yeni/kino-yeni.json';
import type { KuklaIskelet } from '../../film/src/kukla';
import sesBilgi from '../../content/oyunlu/kinonun-bir-gunu.ses.json';
import { sozSuresi, yeniDurus } from '../../film/src/oyunlu/aktor';
import { Sozler, type SozTanim } from '../../film/src/oyunlu/oynatici';
import { agizSec, etiketAn, etiketBedeni, etiketsiz, etiketZamanlari } from '../../film/src/oyunlu/seslendirme';
import { kostumGiydir, PIJAMA } from '../../film/src/oyunlu/kostum';
import { kopukYolu } from '../../film/src/oyunlu/kum-saati';
import { kumSeviyeleri } from '../../film/src/oyunlu/esya';
import { ESIK, YardimMerdiveni } from '../../film/src/oyunlu/yardim';

const kelime = (m: string) => m.split(/\s+/).filter(Boolean).length;

describe("Kino'nun Bir Günü: sözler (OYUNLU-FORMAT §3, SERI-KITABI §5)", () => {
  const sozler = Object.entries(icerik.sozler) as [string, { kim: string; metin: string; tur?: string }][];
  it('oyun sesi: en çok 6 kelime / 30 harf, soru yok, "yanlış / tekrar dene" yok', () => {
    for (const [id, s] of sozler.filter(([, s]) => s.tur === 'oyun')) {
      expect(kelime(s.metin), id).toBeLessThanOrEqual(6);
      expect(s.metin.length, id).toBeLessThanOrEqual(30);
      expect(s.metin, id).not.toMatch(/\?/);
    }
    for (const [id, s] of sozler) expect(s.metin.toLocaleLowerCase('tr'), id).not.toMatch(/yanlış|tekrar dene|olmadı/);
  });
  it('karakter cümlesi en çok 7, anlatıcı en çok 12 kelime; anlatıcı izleyiciye soru sormaz', () => {
    for (const [id, s] of sozler) {
      if (s.kim === 'anlatici') {
        expect(kelime(s.metin), id).toBeLessThanOrEqual(12);
        expect(s.metin, id).not.toMatch(/\?/);
      } else expect(kelime(s.metin), id).toBeLessThanOrEqual(7);
    }
  });
  it('söylenme süresi metinle büyür, anlatıcı biraz daha yavaş', () => {
    expect(sozSuresi('Abi!')).toBeLessThan(sozSuresi('Ben büyüdüm artık! Hepsini kendim yaparım.'));
    expect(sozSuresi('Kum bitene kadar.', true)).toBeGreaterThan(sozSuresi('Kum bitene kadar.'));
  });
});

describe('yardım merdiveni (OYUNLU-FORMAT §4)', () => {
  const kos = (m: YardimMerdiveni, sn: number, ilerleme = false) => {
    const olan: string[] = [];
    for (let t = 0; t < sn; t += 0.1) {
      const b = m.adim(0.1, ilerleme);
      if (b) olan.push(b);
    }
    return olan;
  };
  it('5 parla, 10 söyle, 18 göster, 30 bitir; sırayla ve birer kez', () => {
    const m = new YardimMerdiveni();
    expect(kos(m, ESIK.parla - 0.3)).toEqual([]);
    expect(kos(m, 31 - ESIK.parla + 0.3)).toEqual(['parla', 'soyle', 'goster', 'bitir']);
    expect(m.bitiriyor).toBe(true);
  });
  it('çocuk ilerleyince süre baştan sayılır', () => {
    const m = new YardimMerdiveni();
    expect(kos(m, 9)).toEqual(['parla']);
    kos(m, 0.5, true);
    expect(m.parla).toBe(false);
    expect(kos(m, 4.5)).toEqual([]);
  });
  it('yalnız izle: hemen bitir basamağı; tavan 60 sn', () => {
    expect(kos(new YardimMerdiveni(true), 0.2)).toEqual(['bitir']);
    const m = new YardimMerdiveni();
    // her 4 sn'de biraz ilerleyen çocuk merdivene hiç çıkmaz ama 60 sn'de oyun kendiliğinden biter
    let bitti = false;
    for (let t = 0; t < 61 && !bitti; t += 0.1) bitti = m.adim(0.1, Math.floor(t * 10) % 40 === 0) === 'bitir';
    expect(bitti).toBe(true);
  });
  it('kaçırma: 2 parla, 4 mıknatıs, 6 el tutar', () => {
    const m = new YardimMerdiveni();
    m.kacir();
    expect(m.parla).toBe(false);
    m.kacir();
    expect(m.parla).toBe(true);
    m.kacir();
    m.kacir();
    expect(m.miknatis).toBeGreaterThan(1);
    expect(m.kacir()).toBeNull();
    expect(m.kacir()).toBe('el-tut');
  });
});

describe('Oyun 1 Kum Saati: köpüğün yolu', () => {
  it('3-4: üst dişler sağdan sola, alt dişler soldan sağa, düz çizgi', () => {
    const bas = kopukYolu(0, false), orta = kopukYolu(0.4, false), alt = kopukYolu(0.6, false), son = kopukYolu(1, false);
    expect(bas.sira).toBe('ust');
    expect(orta.p[0]).toBeLessThan(bas.p[0]);
    expect(alt.sira).toBe('alt');
    expect(son.p[0]).toBeGreaterThan(alt.p[0]);
    expect(son.p[1]).toBeGreaterThan(bas.p[1]);
  });
  it('5-6: dört bölge (üst sağ, üst sol, alt sol, alt sağ) ve yukarı-aşağı zikzak', () => {
    expect([0.1, 0.35, 0.6, 0.9].map((u) => kopukYolu(u, true).bolge)).toEqual([0, 1, 2, 3]);
    const ys = Array.from({ length: 40 }, (_, i) => kopukYolu(0.02 + i * 0.005, true).p[1]);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(40);
  });
});

describe('pijama kostümü (KARAKTER-KITI §8.1 K8 yerine)', () => {
  it('aynı dönme noktaları, pijama parçaları, fular gizli; asıl iskelet değişmez', () => {
    const asil = kinoJson as unknown as KuklaIskelet;
    const p = kostumGiydir(asil, PIJAMA);
    expect(p.parcalar.govde.resim).toBe('pijama/govde.webp');
    expect(p.parcalar.govde.pivot).toEqual(asil.parcalar.govde.pivot);
    expect(p.parcalar['kol-ust-sag'].dolgu).toBe('pijama/kol-ust-sag.dolgu.webp');
    expect(p.gizli).toContain('fular');
    expect(asil.parcalar.govde.resim).toBe('govde.webp');
    expect(asil.gizli).not.toContain('fular');
    for (const ad of PIJAMA.parcalar) {
      const q = p.parcalar[ad];
      expect(existsSync(resolve('assets/karakter/kino-yeni', q.resim)), q.resim).toBe(true);
      if (q.dolgu) expect(existsSync(resolve('assets/karakter/kino-yeni', q.dolgu)), q.dolgu).toBe(true);
    }
  });
});

describe('seslendirme: etiketler, ağız, süreler', () => {
  const sozler = Object.entries(icerik.sozler) as [string, { kim: string; metin: string; ses?: string }][];
  const KIT_AGIZ = ['agiz-az', 'agiz-e', 'agiz-genis', 'agiz-gulumse', 'agiz-kahkaha', 'agiz-o', 'agiz-orta', 'agiz-uzgun'];
  it('her sözün kaydı ve süresi var; altyazıda etiket yok', () => {
    for (const [id, s] of sozler) {
      expect(existsSync(resolve('assets/ses-seri2', `${id}.mp3`)), id).toBe(true);
      const b = (sesBilgi.sozler as Record<string, { sure: number; tepe: number }>)[id];
      expect(b?.sure, id).toBeGreaterThan(0.4);
      expect(b.tepe, id).toBeLessThan(b.sure);
      expect(s.metin, id).not.toMatch(/\[|\]/);
      expect(s.ses, id).toBeTruthy();
    }
  });
  it('etiketsiz: köşeli parantezler ve fazla boşluk silinir', () => {
    expect(etiketsiz('[sneezes] Hapşu! [giggles]')).toBe('Hapşu!');
    expect(etiketsiz('[surprised] Iı… [giggles] biraz çok oldu.')).toBe('Iı… biraz çok oldu.');
    expect(etiketsiz("[happy] Dişler pırıl pırıldı. [chuckles] Lokum'un iki dişi bile.")).toBe("Dişler pırıl pırıldı. Lokum'un iki dişi bile.");
  });
  it('etiket anı metindeki yerinden: baştaki esneme başta, sondaki kıkırdama sonda, süre içinde', () => {
    const [esne] = etiketZamanlari('[yawns] Günaydın, Lokum!', 2.2);
    expect(esne.tur).toBe('esne');
    expect(esne.bas).toBeLessThan(0.1);
    expect(esne.son).toBeGreaterThan(0.6);
    expect(esne.son).toBeLessThan(1.3);
    const h = etiketZamanlari('[sneezes] Hapşu! [giggles]', 2.6);
    expect(h.map((e) => e.tur)).toEqual(['hapsu', 'gul']);
    expect(h[1].bas).toBeGreaterThan(h[0].son - 0.3);
    expect(h[1].son).toBeLessThanOrEqual(2.6);
    // ton etiketleri ([excited], [softly]) bedeni oynatmaz
    expect(etiketZamanlari('[excited] Bir!', 0.7)).toEqual([]);
    expect(etiketAn(h, 0.2)?.tur).toBe('hapsu');
  });
  it('ağız: sesin şekli kitin 8 ağzından birine; gülerken kahkaha', () => {
    for (const s of ['kapali', 'az', 'orta', 'yuvarlak', 'dis', 'gulumse'] as const)
      for (const g of [0, 0.4, 0.9]) for (const e of [null, 'gul', 'esne', 'hapsu', 'sasir'] as const) expect(KIT_AGIZ).toContain(agizSec(s, g, e));
    expect(agizSec('orta', 0.9)).toBe('agiz-genis');
    expect(agizSec('orta', 0.5)).toBe('agiz-orta');
    expect(agizSec('yuvarlak', 0.5)).toBe('agiz-o');
    expect(agizSec('kapali', 0.5)).toBe('agiz-gulumse');
    expect(agizSec('orta', 0.8, 'gul')).toBe('agiz-kahkaha');
  });
  it('beden: esnerken kollar kalkar, gülerken kafa sarsılır', () => {
    const d = yeniDurus();
    etiketBedeni(d, etiketZamanlari('[yawns] Günaydın!', 2), 0.45);
    expect(d.kolSag).toBeGreaterThan(60);
    expect(d.gozler).toBe('gozler-kapali');
    const g = etiketZamanlari('Abi! [giggles]', 1.6);
    const ys = Array.from({ length: 12 }, (_, i) => {
      const x = yeniDurus();
      etiketBedeni(x, g, g[0].bas + 0.1 + i * 0.03);
      return x.kafaY;
    });
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(3);
    const h = yeniDurus();
    etiketBedeni(h, etiketZamanlari('[yawns] Günaydın!', 2), 0.45, 1, ['esne']);
    expect(h.kolSag).toBe(0);
  });
  it('Sozler: kaydı olan sözün süresi kaydınki; altyazı kapatılınca görünmez; bitiş anı', () => {
    const s = new Sozler(icerik.sozler as Record<string, SozTanim>, { 's1-kino1': 2.21 });
    expect(s.sure('s1-kino1')).toBe(2.21);
    expect(s.sure('s1-lok1')).toBeCloseTo(sozSuresi('Abi! Abi!'));
    const calan: string[] = [];
    s.onSoyle = (id) => calan.push(id);
    s.soyle('s1-kino1', 10);
    expect(calan).toEqual(['s1-kino1']);
    expect(s.bitis()).toBeCloseTo(12.21);
    expect(s.aktif('kino', 10.5)?.etiketler[0].tur).toBe('esne');
    expect(s.altyazi(11)?.id).toBe('s1-kino1');
    s.altyaziAcik = false;
    expect(s.altyazi(11)).toBeNull();
    expect(s.etiket('s1-kino1', 'esne')?.bas).toBeLessThan(0.1);
  });
});

describe('Eşyalar (Gemini çizimi): kum saati', () => {
  it('kum akarken üstteki yüzey iner, alttaki tepecik yükselir; bitince üst hazne boş', () => {
    let once = kumSeviyeleri(0);
    for (let p = 0.1; p <= 1.001; p += 0.1) {
      const s = kumSeviyeleri(p);
      expect(s.ust).toBeGreaterThanOrEqual(once.ust);
      expect(s.alt).toBeLessThan(once.alt);
      once = s;
    }
    expect(kumSeviyeleri(1).ust).toBeGreaterThan(kumSeviyeleri(0.5).ust);
  });
  it('kum saati katmanları ve öteki eşyalar assets/film-seri2/esya altında', () => {
    for (const ad of ['kum-saati-bos', 'kum-saati-ust-kum', 'kum-saati-alt-kum', 'dis-fircasi-kino', 'dis-fircasi-lokum', 'macun-tupu', 'macun-kapak', 'macun-kulesi', 'havlu-kino', 'tabure', 'saksi', 'yastik'])
      expect(existsSync(resolve('assets/film-seri2/esya', `${ad}.webp`)), ad).toBe(true);
  });
});
