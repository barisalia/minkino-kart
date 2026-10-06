/** Hata avı 2: tekrar dinle (#33), kayıtlı şarkıların sessize almaya uyması (#16/#32), sayma emniyet saati (#17) */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { durum } from '../../src/engine/ilerleme';
import { konus, sus, tekrarSoyle } from '../../src/audio/konusma';
import { sarkiSesiAyarla } from '../../src/audio/sarki-kayit';
import { emniyetSaati, SAYMA_EMNIYET_MS } from '../../macera/src/salincak-mantik';

describe('tekrar dinle (#33)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    durum.i.ayarlar.konusma = true;
  });
  afterEach(() => {
    sus();
    vi.useRealTimers();
  });

  it('söylenen cümle tekrar dinlenince sahne sonraki cümleye atlamaz, tekrar bitince sürer', async () => {
    let bitti = false;
    void konus('Merhaba arkadaşlar').then(() => (bitti = true));
    await vi.advanceTimersByTimeAsync(100);
    void tekrarSoyle('Merhaba arkadaşlar');
    await vi.advanceTimersByTimeAsync(10);
    expect(bitti).toBe(false); // eskiden burada çözülüp sonraki cümleye geçiyordu
    await vi.advanceTimersByTimeAsync(1000);
    expect(bitti).toBe(true);
  });

  it('iki kez üst üste tekrar dinlenince de sahne bekler', async () => {
    let bitti = false;
    void konus('Merhaba arkadaşlar').then(() => (bitti = true));
    await vi.advanceTimersByTimeAsync(100);
    void tekrarSoyle('Merhaba arkadaşlar');
    await vi.advanceTimersByTimeAsync(100);
    void tekrarSoyle('Merhaba arkadaşlar');
    await vi.advanceTimersByTimeAsync(100);
    expect(bitti).toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(bitti).toBe(true);
  });

  it('bölümden çıkınca (sus) sahnenin beklediği söz çözülür, takılmaz', async () => {
    let bitti = false;
    void konus('Merhaba arkadaşlar').then(() => (bitti = true));
    await vi.advanceTimersByTimeAsync(100);
    void tekrarSoyle('Merhaba arkadaşlar');
    sus();
    await vi.advanceTimersByTimeAsync(0);
    expect(bitti).toBe(true);
  });

  it('düz konus eskisi gibi öncekini keser', async () => {
    let bitti = false;
    void konus('Merhaba arkadaşlar').then(() => (bitti = true));
    await vi.advanceTimersByTimeAsync(100);
    void konus('Başka bir cümle');
    await vi.advanceTimersByTimeAsync(0);
    expect(bitti).toBe(true);
  });
});

describe('kayıtlı şarkı ses ayarı (#16, #32)', () => {
  const eski = { ...durum.i.ayarlar };
  afterEach(() => Object.assign(durum.i.ayarlar, eski));
  const oge = () => ({ muted: false, volume: 1 }) as HTMLMediaElement;

  it('müzik kapalıysa (sessize al) susar; iOS için muted da kurulur', () => {
    Object.assign(durum.i.ayarlar, { muzik: false, seviye: 0.9 });
    const a = oge();
    sarkiSesiAyarla(a);
    expect(a.muted).toBe(true);
    expect(a.volume).toBe(0);
  });
  it('müzik açıksa ses düzeyine uyar (ek kısma ile)', () => {
    Object.assign(durum.i.ayarlar, { muzik: true, seviye: 0.6 });
    const a = oge();
    sarkiSesiAyarla(a);
    expect(a.muted).toBe(false);
    expect(a.volume).toBeCloseTo(0.6);
    sarkiSesiAyarla(a, 0.5);
    expect(a.volume).toBeCloseTo(0.3);
  });
});

describe('sayma emniyet saati (#17)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('sayım sürdükçe (her 2.1 sn) 25 sn dolsa da görev kesilmez', () => {
    const bitti = vi.fn();
    const s = emniyetSaati(SAYMA_EMNIYET_MS, bitti);
    for (let i = 0; i < 14; i++) {
      vi.advanceTimersByTime(2100);
      s.yenile();
    }
    expect(bitti).not.toHaveBeenCalled();
    s.dur();
  });
  it('çocuk takılırsa son sayıdan 25 sn sonra kendiliğinden geçer', () => {
    const bitti = vi.fn();
    const s = emniyetSaati(SAYMA_EMNIYET_MS, bitti);
    vi.advanceTimersByTime(5000);
    s.yenile();
    vi.advanceTimersByTime(SAYMA_EMNIYET_MS - 1);
    expect(bitti).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(bitti).toHaveBeenCalledTimes(1);
  });
  it('dur() sonrası çağrılmaz', () => {
    const bitti = vi.fn();
    emniyetSaati(1000, bitti).dur();
    vi.advanceTimersByTime(5000);
    expect(bitti).not.toHaveBeenCalled();
  });
});
