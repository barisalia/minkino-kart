/**
 * Dedektif Mino · konuşma sırası (dedektif/src/konusma-sira.ts) ve dönüşte çalışma odası yerleşimi (mantik.ts →
 * calismaYerlesim): aynı konuşanın art arda iki sözünde ikinci balon erken kapanmaz; "Tekrar dinle" dokunuşları
 * birikmez; telefon iki yöne de dönünce tablolar o yönün değerlerine tam döner.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BalonNobeti, tekTekrar } from '../../dedektif/src/konusma-sira';
import { CALISMA, CALISMA_IZLERI, calismaYerlesim, HALKALAR, KADRAJ, odaW } from '../../dedektif/src/mantik';

afterEach(() => {
  vi.useRealTimers();
  calismaYerlesim(false);
});

describe('konuşma balonu', () => {
  it('aynı konuşanın ikinci sözünde balon, önceki sözün kapanışıyla kapanmaz', () => {
    vi.useFakeTimers();
    const nobet = new BalonNobeti<'mino' | 'pamuk'>();
    let acik = false;
    const kapanis = (k: 'mino' | 'pamuk', n: number) => setTimeout(() => nobet.gecerli(k, n) && (acik = false), 700);
    // Pamuk: "Miyav… kelebek çok güzeldi." biter, hemen "Lambayı devirdim." başlar (2 sn sürer)
    const n1 = nobet.ac('pamuk');
    acik = true;
    kapanis('pamuk', n1);
    const n2 = nobet.ac('pamuk');
    acik = true;
    vi.advanceTimersByTime(700);
    expect(acik).toBe(true);
    vi.advanceTimersByTime(1300);
    // ikinci söz bitti: onun kapanışı balonu kapatır
    kapanis('pamuk', n2);
    vi.advanceTimersByTime(699);
    expect(acik).toBe(true);
    vi.advanceTimersByTime(1);
    expect(acik).toBe(false);
  });

  it('başka konuşanın balonu birbirini etkilemez', () => {
    const nobet = new BalonNobeti<'mino' | 'kino'>();
    const m = nobet.ac('mino');
    nobet.ac('kino');
    expect(nobet.gecerli('mino', m)).toBe(true);
    nobet.ac('mino');
    expect(nobet.gecerli('mino', m)).toBe(false);
  });
});

describe('Tekrar dinle', () => {
  it('beş hızlı dokunuş tek tekrar; bitince yeniden dokunulabilir', async () => {
    const tekrarla = tekTekrar();
    let calan = 0;
    let bitir: () => void = () => undefined;
    const soyle = () => {
      calan++;
      return new Promise<void>((r) => (bitir = r));
    };
    const sonuclar = [1, 2, 3, 4, 5].map(() => tekrarla(soyle));
    expect(sonuclar).toEqual([true, false, false, false, false]);
    expect(calan).toBe(1);
    bitir();
    await new Promise((r) => setTimeout(r, 0));
    expect(tekrarla(soyle)).toBe(true);
    expect(calan).toBe(2);
  });

  it('tekrar hata verse de kilit açılır', async () => {
    const tekrarla = tekTekrar();
    expect(tekrarla(() => Promise.reject(new Error('ses yok')))).toBe(true);
    await new Promise((r) => setTimeout(r, 0));
    expect(tekrarla(() => Promise.resolve())).toBe(true);
  });
});

describe('çalışma odası dönüşte yeniden dizilir', () => {
  const ozet = () => ({
    W: odaW('calisma'),
    calisma: structuredClone(CALISMA),
    izler: structuredClone(CALISMA_IZLERI),
    kadraj: structuredClone(KADRAJ),
    ipucu: HALKALAR.flatMap((hk) => hk.ipuclari).map((t) => ({ ...t })),
  });

  it('dikey → yatay → dikey → yatay: her yön kendi değerlerine tam döner (kayma birikmez)', () => {
    calismaYerlesim(false);
    const yatay = ozet();
    calismaYerlesim(true);
    const dikey = ozet();
    expect(dikey.W).toBeLessThan(yatay.W);
    expect(dikey.ipucu.find((t) => t.id === 'pati-hali')?.y).not.toBe(yatay.ipucu.find((t) => t.id === 'pati-hali')?.y);
    calismaYerlesim(false);
    expect(ozet()).toEqual(yatay);
    calismaYerlesim(true);
    expect(ozet()).toEqual(dikey);
    calismaYerlesim(false);
    expect(ozet()).toEqual(yatay);
  });

  it('iki yerleşimde de iz sayısı aynı (dönünce izler bire bir yer değiştirir)', () => {
    calismaYerlesim(true);
    const n = CALISMA_IZLERI.length;
    calismaYerlesim(false);
    expect(CALISMA_IZLERI.length).toBe(n);
  });
});
