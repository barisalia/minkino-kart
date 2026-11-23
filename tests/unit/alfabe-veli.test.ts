import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { gunKodu } from '../../alfabe/src/gunluk';
import { HARF_SIRASI } from '../../alfabe/src/harf-sirasi';
import { EVDE_BASLANGIC, EVDE_HARF, HARFLER, SIRA_ACIKLAMASI, UNSUZLER, grupAnahtari, veliOzeti, yasGrubuOf } from '../../alfabe/src/veli-ozet';

const depo = (k: Record<string, unknown> = {}) => (a: string) => (a in k ? JSON.stringify(k[a]) : null);
const ids = (n: number) => HARFLER.slice(0, n).map((h) => h.id);
const GUN = 86_400_000;
const SIMDI = Date.UTC(2026, 10, 20, 12);

describe('Harf Atölyesi veli sayfası: kayıtlardan özet', () => {
  it('boş kayıt: 29 harf bekliyor, A sırada, hiç anahtar yok; tekrar bölümleri görünmez', () => {
    const o = veliOzeti({ yas: 5, oku: depo(), simdi: SIMDI });
    expect(o.bos).toBe(true);
    expect(o.grup).toBe('5+');
    expect(o.harfler).toHaveLength(29);
    expect(o.harfler[0]).toMatchObject({ buyuk: 'A', durum: 'sirada' });
    expect(o.harfler.slice(1).every((h) => h.durum === 'bekliyor')).toBe(true);
    expect([o.ogrenilen, o.anahtar, o.sozcuk, o.cumle]).toEqual([0, 0, 0, 0]);
    expect(o.anahtarlar).toHaveLength(20);
    expect(o.beceriler.map((b) => b.durum)).toEqual(['yok', 'yok', 'yok', 'yok']);
    // Harfin ev oyunu en üstteki Bugün Evde kartında; Evde birlikte yinelemez.
    expect(o.oneriler.map((x) => x.beceri)).toEqual(['hece']);
    expect(o.bugun.metin).toContain('Adının ilk harfini');
    expect(o.son7Gun).toBeNull();
    expect(o.zorlananlar).toEqual([]);
  });

  it('yarım kayıt (4 yaş): 5 harf, yarım ders, 3 anahtar, sözcükler; öneri son harfe göre', () => {
    const o = veliOzeti({
      yas: 4, simdi: SIMDI,
      oku: depo({
        'minkino-alfabe-v1-yas-4': { biten: ids(5), son: '06', adimlar: { '06': 1 } },
        'minkino-hece-evleri-v1-yas-4': { biten: ['l', 'k', 'n', 'zz'] },
        'minkino-hece-pano-kelimeler-v1-yas-4': { tur: 3, sozler: { '02': { kez: 2, son: 1 }, x: { kez: 0 } } },
        'minkino-hece-gorulen-sozcukler-v1-yas-4': { kez: { '02': 1, '05': 3 }, son: [] },
        // Başka yaşın kaydı okunmaz.
        'minkino-alfabe-v1': { biten: ids(20) },
      }),
    });
    expect(o.grup).toBe('4');
    expect(o.ogrenilen).toBe(5);
    expect(o.harfler.find((h) => h.buyuk === 'E')).toMatchObject({ durum: 'yarim' });
    expect(o.anahtar).toBe(3);
    expect(o.sozcuk).toBe(2);
    expect(o.beceriler.find((b) => b.id === 'harf')).toMatchObject({ durum: 'suruyor', yazi: '5 / 29 harf' });
    expect(o.bugun).toMatchObject({ harf: '05', baslik: '“D” harfini öğrendi' });
    expect(o.oneriler.map((x) => x.beceri)).toEqual(['hece', 'sozcuk']);
  });

  it('dolu kayıt: 29 harf, 20 anahtar, cümleler; günlükten son 7 gün ve zorlandığı harfler (yaş eki yok)', () => {
    const o = veliOzeti({
      yas: 6, simdi: SIMDI,
      oku: depo({
        'minkino-alfabe-v1': { biten: ids(29), son: '29' },
        'minkino-hece-evleri-v1': { biten: [...UNSUZLER] },
        'minkino-cumle-okuma-v1': { okunan: ['c1', 'c2', 'c2'] },
        'minkino-alfabe-gunluk-v1': {
          gunler: { [gunKodu(new Date(SIMDI))]: 4, [gunKodu(new Date(SIMDI - 2 * GUN))]: 3, [gunKodu(new Date(SIMDI - 9 * GUN))]: 5 },
          yanlis: { '09': 3, '11': 2, '14': 1, xx: 9 },
        },
      }),
    });
    expect(o.harfler.every((h) => h.durum === 'ogrendi')).toBe(true);
    expect(o.beceriler.slice(0, 2).map((b) => b.durum)).toEqual(['tamam', 'tamam']);
    expect(o.cumle).toBe(2);
    expect(o.son7Gun!.gunler).toHaveLength(7);
    expect(o.son7Gun!.gunler[6]).toMatchObject({ ad: 'Bugün', adim: 4 });
    expect(o.son7Gun!.gunler.map((g) => g.adim)).toEqual([0, 0, 0, 0, 3, 0, 4]);
    expect([o.son7Gun!.calisilan, o.son7Gun!.toplam]).toEqual([2, 7]);
    // Tek yanlış sayılmaz (en az 2).
    expect(o.zorlananlar).toEqual(['Ğ', 'I']);
    // 4 yaşta da aynı günlük okunur.
    expect(veliOzeti({ yas: 4, simdi: SIMDI, oku: depo({ 'minkino-alfabe-gunluk-v1': { gunler: {}, yanlis: { '02': 2 } } }) }).zorlananlar).toEqual(['B']);
    expect(o.oneriler.map((x) => x.beceri)).toEqual(['sozcuk', 'cumle']);
  });

  it('2–3 yaş: kayıtlar -yas-2-3 ekinde, cümle okuma yok, öneriler boyamaya göre', () => {
    for (const yas of [2, 3]) {
      const o = veliOzeti({ yas, oku: depo({ 'minkino-alfabe-v1-yas-2-3': { biten: ['02'], son: '02' } }) });
      expect(o.grup).toBe('2-3');
      expect(o.cumleVar).toBe(false);
      expect(o.beceriler.map((b) => b.id)).toEqual(['harf', 'hece', 'sozcuk']);
      expect(o.oneriler[0].metin).toBe('“B” harfini boyadı. Parmağıyla havada B çizsin; siz de “Balık” deyin.');
      expect(o.oneriler.map((x) => x.beceri)).not.toContain('cumle');
      // Ses grubu sırasında bitmemiş ilk harf: A.
      expect(o.harfler.find((h) => h.durum === 'sirada')?.buyuk).toBe('A');
    }
  });

  it('Ğ için ilk ses değil "içinde geçen"; bozuk kayıt düşürmez; anahtarlar ders-kaydi.ts ile aynı', () => {
    const g = veliOzeti({ yas: 5, oku: depo({ 'minkino-alfabe-v1': { biten: ['09'] } }) });
    expect(g.bugun.metin).toContain('içinde ğ olanları arayın');
    const bozuk = veliOzeti({ yas: 5, oku: (a) => (a.includes('hece') ? '{{' : a.includes('alfabe-v1') ? '[1,2]' : 'null') });
    expect(bozuk.bos).toBe(true);
    expect(veliOzeti({ yas: 5, oku: () => { throw new Error('kapalı'); } }).bos).toBe(true);
    expect(['2-3', '4', '5+'].map((x) => grupAnahtari('k', x as '4'))).toEqual(['k-yas-2-3', 'k-yas-4', 'k']);
    expect([null, 2, 3, 4, 5, 6].map(yasGrubuOf)).toEqual(['5+', '2-3', '2-3', '4', '5+', '5+']);
    expect(readFileSync('alfabe/src/ders-kaydi.ts', 'utf8')).toContain("tamDers?anahtar:anahtar+'-yas-'+yasGrubu");
  });

  it('harfler okuldaki ses grubu sırasıyla, beş grupta; sıradaki harf bu sırayı izler; veliye tek cümle', () => {
    const o = veliOzeti({ yas: 5, oku: depo({ 'minkino-alfabe-v1': { biten: ['01', '17', '06'], son: '06' } }) });
    expect(o.harfler.map((h) => h.id)).toEqual([...HARF_SIRASI]);
    expect(o.harfler.slice(0, 6).map((h) => h.buyuk).join('')).toBe('ANETİL');
    expect(o.harfler.map((h) => h.grup)).toEqual([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4]);
    // A, N, E bitti: sırada T (alfabede B olurdu).
    expect(o.harfler.find((h) => h.durum === 'sirada')?.buyuk).toBe('T');
    expect(SIRA_ACIKLAMASI).toContain('MEB 1. sınıf ses grupları sırasıyla');
    // Hece Evleri de okul sırasında: N, T, L, K…
    expect(o.anahtarlar.slice(0, 4).map((a) => a.unsuz)).toEqual(['n', 't', 'l', 'k']);
  });

  it('Bugün Evde 1 Dakika: 29 harfin her birine bir ipucu; en son öğrenilen harfe göre; ilerleme yoksa başlangıç', () => {
    expect(Object.keys(EVDE_HARF).sort()).toEqual(HARFLER.map((h) => h.id).sort());
    for (const h of HARFLER) {
      const ipucu = EVDE_HARF[h.id];
      expect(ipucu.length, h.buyuk).toBeLessThan(110);
      expect(ipucu.toLocaleLowerCase('tr')).not.toContain('çilek');
      // Ğ dışında ipucu kendi harfini anar ve örnekleri o sesle başlar.
      if (h.buyuk !== 'Ğ') {
        expect(ipucu).toContain(' ' + h.buyuk + ' ile başlayan');
        const ornekler = ipucu.split(':')[1].replace('.', '').split(',').map((x) => x.trim());
        for (const o of ornekler) expect(o.startsWith(h.kucuk), h.buyuk + ' ' + o).toBe(true);
      } else expect(ipucu).toContain('ğ');
    }
    expect(veliOzeti({ yas: 5, oku: depo() }).bugun).toEqual({ baslik: 'Başlarken', metin: EVDE_BASLANGIC });
    const o = veliOzeti({ yas: 5, oku: depo({ 'minkino-alfabe-v1': { biten: ['01', '17'], son: '17' } }) });
    expect(o.bugun).toEqual({ harf: '17', baslik: '“N” harfini öğrendi', metin: EVDE_HARF['17'] });
  });
});
