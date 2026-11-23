import { existsSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
import olcu from '../../matematik/src/ceren-ders-olcu.json';
import {
  GEREKLI_CIZIMLER, GEREKLI_SESLER, SAYILAR, aferinSesi, bitisSesi, dersSayilari, esitAralikla, hepsiBitti, ilerlet, kaydiCoz,
  etkinlik, nesneTuru, siradaki, tanitSesi, yuvaKonumu,
  type Nokta,
} from '../../matematik/src/ceren-ders-mantik';

it('Ceren dersi Astra’nın 16 çizimini ve Ceren’in 33 kaydını ister; kayıtların hepsi diskte', () => {
  expect(GEREKLI_CIZIMLER).toHaveLength(16);
  expect(GEREKLI_CIZIMLER).toEqual(expect.arrayContaining(['sinif', 'ders-masasi', 'ceren-goster', 'ceren-parmak-say', 'ceren-alkis', 'ceren-sen-dene', 'rakam-1', 'rakam-10']));
  expect(GEREKLI_SESLER).toHaveLength(33);
  expect(GEREKLI_SESLER).toEqual(expect.arrayContaining(['bitis', 'bitis_5', 'tanit_10b', 'koy_3', 'koy_6', 'koy_9']));
  // 10 rakam değil sayı: eski "On rakamına" kaydı istenmez; masaya koyma yalnız koyma sayılarında.
  expect(GEREKLI_SESLER).not.toContain('tanit_10');
  expect(GEREKLI_SESLER.filter((id) => id.startsWith('koy_'))).toEqual(['koy_3', 'koy_6', 'koy_9']);
  for (const id of GEREKLI_SESLER) expect(existsSync('assets/matematik/ceren/ses/' + id + '.mp3'), id).toBe(true);
});

it('sayılacak nesneler mevcut çizimlerden ve çilek yok; aferin üç kayıt arasında döner', () => {
  const turler = SAYILAR.map(nesneTuru);
  expect(turler).not.toContain('cilek');
  for (const t of new Set(turler)) expect(existsSync('assets/matematik/' + t + '.webp'), t).toBe(true);
  expect(SAYILAR.map(aferinSesi).slice(0, 4)).toEqual(['aferin_1', 'aferin_2', 'aferin_3', 'aferin_1']);
});

it('onluk çerçeve: ilk beş arka sırada, sonraki beş ön sırada, soldan sağa', () => {
  const yerler = Array.from({ length: 10 }, (_, i) => yuvaKonumu(i));
  expect(new Set(yerler.slice(0, 5).map((y) => y.alt)).size).toBe(1);
  expect(yerler[5].alt).toBeGreaterThan(yerler[0].alt);
  expect(yerler[5].x).toBe(yerler[0].x);
  for (let i = 1; i < 5; i++) expect(yerler[i].x).toBeGreaterThan(yerler[i - 1].x);
});

it('yazma sayılarının (1·4·7·10) yolu ölçülmüş ve bloğun içinde; başka rakamın yolu tutulmaz', () => {
  const yollar = olcu.rakamYolu as Record<string, number[][][]>;
  const yazma = SAYILAR.filter((n) => etkinlik(n) === 'yaz');
  expect(Object.keys(yollar).map(Number).sort((a, b) => a - b)).toEqual(yazma);
  for (const n of yazma) {
    const cizgiler = yollar[String(n)];
    expect(cizgiler?.length, String(n)).toBeGreaterThan(0);
    for (const c of cizgiler) {
      expect(c.length).toBeGreaterThan(1);
      for (const [x, y] of c) {
        expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(1000);
        expect(y).toBeGreaterThan(0); expect(y).toBeLessThan(1000);
      }
    }
  }
  // 4 ve 10 iki çizgi (parmak kalkar), 1 ve 7 tek
  expect(yollar['4']).toHaveLength(2);
  expect(yollar['10']).toHaveLength(2);
  expect(yollar['1']).toHaveLength(1);
  expect(yollar['7']).toHaveLength(1);
});

it('yol eşit aralıkla bölünür, uçlar korunur; parmak yalnız ileri ve yolun yakınında ilerler', () => {
  const yol = esitAralikla([[0, 0], [100, 0], [100, 100]] as Nokta[], 14);
  expect(yol[0]).toEqual([0, 0]);
  expect(yol[yol.length - 1]).toEqual([100, 100]);
  // Yol boyunca 14 birim; köşede kirişi biraz kısalır.
  for (let i = 1; i < yol.length - 1; i++) {
    const d = Math.hypot(yol[i][0] - yol[i - 1][0], yol[i][1] - yol[i - 1][1]);
    expect(d).toBeLessThanOrEqual(14.01);
    expect(d).toBeGreaterThan(9);
  }
  expect(ilerlet(yol, 0, 42, 4, 50)).toBe(3);       // yolda: ilerler
  expect(ilerlet(yol, 3, 0, 0, 50)).toBe(3);        // geri gitmek ilerletmez, bozmaz
  expect(ilerlet(yol, 0, 42, 300, 50)).toBe(0);     // yoldan uzak: ilerlemez
  expect(ilerlet(yol, 0, 300, 0, 50)).toBe(0);      // çok ileri atlanmaz (pencere)
});

it('kayıt: bozuk ya da eksik kayıt dersi baştan açar; bitti yalnız on sayı bitince', () => {
  expect(kaydiCoz('{bozuk')).toEqual({ biten: [], simdi: 1, tanitildi: false, bitti: false });
  expect(kaydiCoz(JSON.stringify({ biten: [3, 1, 99, 'x'], simdi: 42, tanitildi: true, bitti: true })))
    .toEqual({ biten: [1, 3], simdi: 1, tanitildi: true, bitti: false });
  const tam = kaydiCoz(JSON.stringify({ biten: [...SAYILAR], simdi: 10, tanitildi: true, bitti: true }));
  expect(tam.bitti).toBe(true);
  expect(siradaki({ biten: [1, 2, 4], simdi: 2, tanitildi: true, bitti: false })).toBe(3);
  expect(siradaki({ biten: [2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: false })).toBe(1);
  expect(siradaki(tam)).toBeUndefined();
});

it('Ceren’in her kaydının metni tek kaynakta; 10 için "rakam" değil "sayı" denir', async () => {
  const sozler = (await import('../../matematik/src/ceren-sozler.json')).default as Record<string, string>;
  for (const id of GEREKLI_SESLER) expect(sozler[id], id).toBeTruthy();
  for (const n of SAYILAR) {
    expect(sozler['hepsi_' + n], 'hepsi_' + n).toBeTruthy();
    // Yazma övgüsü yalnız yazma sayılarında (1·4·7·10).
    if (etkinlik(n) === 'yaz') expect(sozler['yazdin_' + n], 'yazdin_' + n).toBeTruthy();
  }
  expect(sozler.tanit_10b).toMatch(/sayının adı on/);
  expect(sozler.yazdin_10).toMatch(/On sayısını/);
  // Her replik en çok üç kısa cümle (KULLANICI-KURALLARI: ElevenLabs'ta replik uzunluğu)
  for (const [id, metin] of Object.entries(sozler)) expect(metin.replace(/\[[^\]]+\]/g, '').split(/[.!?]+/).filter((c) => c.trim()).length, id).toBeLessThanOrEqual(3);
});

it('her sayıda tek etkinlik, sırayla: art arda iki sayıda aynı oyun yok, üç tür de var', async () => {
  const { etkinlik } = await import('../../matematik/src/ceren-ders-mantik');
  const turler = SAYILAR.map(etkinlik);
  expect(turler).toEqual(['yaz', 'birlikte', 'koy', 'yaz', 'birlikte', 'koy', 'yaz', 'birlikte', 'koy', 'yaz']);
  for (let i = 1; i < turler.length; i++) expect(turler[i]).not.toBe(turler[i - 1]);
});

it('Ceren yalnız ilk "birlikte say"da önce kendisi sayar (2); 5 ve 8 doğrudan birlikte sayılır', async () => {
  const { ILK_BIRLIKTE, etkinlik } = await import('../../matematik/src/ceren-ders-mantik');
  expect(ILK_BIRLIKTE).toBe(2);
  expect(SAYILAR.filter((n) => etkinlik(n) === 'birlikte' && n !== ILK_BIRLIKTE)).toEqual([5, 8]);
});

it('2–3 yaşta ders 1–5, 4 ve 5+ yaşta 1–10; kapanış sözü vardığı sayıyı söyler (Barış, 19 Kasım)', async () => {
  const { etkinlik } = await import('../../matematik/src/ceren-ders-mantik');
  const kisa = dersSayilari(true);
  expect(kisa).toEqual([1, 2, 3, 4, 5]);
  expect(dersSayilari(false)).toEqual([...SAYILAR]);
  // Kısa yolda da üç etkinlik sırayla: yaz 1 · birlikte 2 · koy 3 · yaz 4 · birlikte 5.
  expect(kisa.map(etkinlik)).toEqual(['yaz', 'birlikte', 'koy', 'yaz', 'birlikte']);
  expect(bitisSesi(kisa)).toBe('bitis_5');
  expect(bitisSesi(dersSayilari(false))).toBe('bitis');
  const sozler = (await import('../../matematik/src/ceren-sozler.json')).default as Record<string, string>;
  expect(sozler.bitis_5).toMatch(/beşe kadar/);
  expect(sozler.bitis).toMatch(/ona kadar/);
});

it('kayıt yaşlar arasında güvenli: 2–3 yaşta 6–10’da kalan eski kayıt hatıraya, bitmemişse aralıktaki sayıya gelir', () => {
  const kisa = dersSayilari(true);
  // 1–7 bitmiş, 8’de kalmış: 2–3 yaşta beşi de öğrenilmiş, hatırası bekliyor (ders sonuna, aralığın son sayısına gelir).
  const ileri = kaydiCoz(JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7], simdi: 8, tanitildi: true, bitti: false }), kisa);
  expect(ileri).toEqual({ biten: [1, 2, 3, 4, 5, 6, 7], simdi: 5, tanitildi: true, bitti: false });
  expect(hepsiBitti(ileri, kisa)).toBe(true);
  expect(siradaki(ileri, ileri.simdi, kisa)).toBeUndefined();
  // 3 eksik, 7’de kalmış: aralıktaki ilk bitmemiş sayıdan sürer.
  const eksik = kaydiCoz(JSON.stringify({ biten: [1, 2, 4, 6], simdi: 7, tanitildi: true, bitti: false }), kisa);
  expect(eksik.simdi).toBe(3);
  expect(siradaki({ ...eksik, biten: [...eksik.biten, 3] }, 3, kisa)).toBe(5);
  // 1–5 bitmiş ve hatırası verilmiş: 2–3 yaşta ders bitti; yaş 4’e geçince 6’dan sürer.
  const kisaBitti = JSON.stringify({ biten: [1, 2, 3, 4, 5], simdi: 5, tanitildi: true, bitti: true });
  expect(kaydiCoz(kisaBitti, kisa).bitti).toBe(true);
  const buyuk = kaydiCoz(kisaBitti, dersSayilari(false));
  expect(buyuk.bitti).toBe(false);
  expect(siradaki(buyuk, buyuk.simdi, dersSayilari(false))).toBe(6);
  // 1–10 bitmiş kayıt 2–3 yaşta da bitmiş sayılır.
  expect(kaydiCoz(JSON.stringify({ biten: [...SAYILAR], simdi: 10, tanitildi: true, bitti: true }), kisa).bitti).toBe(true);
});

it('diskte çalınmayan Ceren kaydı yok: her dosya bir sözün kaydı ve ders onu bir yoldan çalar', async () => {
  const sozler = (await import('../../matematik/src/ceren-sozler.json')).default as Record<string, string>;
  // Dersin çalabildiği bütün kayıtlar: gerekli olanlar + varsa çalanlar (hepsi_n, yazma sayılarında yazdin_n, devam, ben_sayayim).
  const calinabilir = new Set([
    ...GEREKLI_SESLER, 'devam', 'ben_sayayim',
    ...SAYILAR.map((n) => 'hepsi_' + n),
    ...SAYILAR.filter((n) => etkinlik(n) === 'yaz').map((n) => 'yazdin_' + n),
  ]);
  const disk = readdirSync('assets/matematik/ceren/ses').filter((d) => d.endsWith('.mp3')).map((d) => d.slice(0, -4));
  for (const id of disk) {
    expect(calinabilir.has(id), id + ' çalınmıyor').toBe(true);
    expect(sozler[id], id + ' metni').toBeTruthy();
  }
  for (const id of Object.keys(sozler)) expect(disk, id + ' kaydı').toContain(id);
  expect(SAYILAR.map(tanitSesi).at(-1)).toBe('tanit_10b');
});
