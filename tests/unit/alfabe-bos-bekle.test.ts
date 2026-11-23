import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { bosBekleyici } from '../../alfabe/src/bos-bekle';

const belge = { hidden: false };
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('window', globalThis);
  vi.stubGlobal('document', belge);
  belge.hidden = false;
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('boşta kalan çocuğa 12 ve 16 saniye sonra en fazla iki kez hatırlatır', () => {
  const hatirlat = vi.fn();
  const bos = bosBekleyici(hatirlat);
  bos.kur();
  vi.advanceTimersByTime(11_999);
  expect(hatirlat).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(hatirlat).toHaveBeenLastCalledWith(1);
  bos.kur();
  vi.advanceTimersByTime(15_999);
  expect(hatirlat).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(1);
  expect(hatirlat).toHaveBeenLastCalledWith(2);
  bos.kur();
  vi.advanceTimersByTime(60_000);
  expect(hatirlat).toHaveBeenCalledTimes(2);
});

it('dokunuş sayacı durdurur, ilerleme hakkı yeniler, kapanınca hiç çalmaz', () => {
  const hatirlat = vi.fn();
  const bos = bosBekleyici(hatirlat);
  bos.kur();
  vi.advanceTimersByTime(8_000);
  bos.dur();
  vi.advanceTimersByTime(30_000);
  expect(hatirlat).not.toHaveBeenCalled();
  bos.kur(); vi.advanceTimersByTime(12_000);
  bos.kur(); vi.advanceTimersByTime(16_000);
  expect(hatirlat).toHaveBeenCalledTimes(2);
  bos.sifirla();
  bos.kur(); vi.advanceTimersByTime(12_000);
  expect(hatirlat).toHaveBeenLastCalledWith(1);
  bos.kapat();
  bos.kur(); vi.advanceTimersByTime(60_000);
  expect(hatirlat).toHaveBeenCalledTimes(3);
});

it('arka plandaki sekmede süre saymaz, sayfa açılınca yeniden bekler', () => {
  const hatirlat = vi.fn();
  const bos = bosBekleyici(hatirlat);
  belge.hidden = true;
  bos.kur();
  vi.advanceTimersByTime(12_000);
  expect(hatirlat).not.toHaveBeenCalled();
  belge.hidden = false;
  vi.advanceTimersByTime(12_000);
  expect(hatirlat).toHaveBeenLastCalledWith(1);
});
