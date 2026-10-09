/**
 * Kino Ne Giysin? robotik ses: oyun açılır açılmaz (ilk dokunuştan önce ses motoru kapalıyken) Kino'nun ilk cümlesi
 * cihazın Türkçe sesine düşüyordu. cihazSesi: false → kaydı çalınamayan cümle sessiz geçer, cihaz sesi hiç çağrılmaz.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { durum } from '../../src/engine/ilerleme';
import { konus, KINO_SESI, sus } from '../../src/audio/konusma';

describe('cihazSesi: false (Giysin)', () => {
  const speak = vi.fn((u: { onend?: () => void }) => setTimeout(() => u.onend?.(), 300));
  beforeEach(() => {
    vi.useFakeTimers();
    durum.i.ayarlar.konusma = true;
    speak.mockClear();
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn(), getVoices: () => [] });
    if (typeof window === 'undefined') vi.stubGlobal('window', globalThis);
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        constructor(public text: string) {}
      },
    );
  });
  afterEach(() => {
    sus();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('kaydı çalınamayan Kino cümlesi cihaz sesine düşmez, kısa bir sessizlikten sonra biter', async () => {
    let bitti = false;
    void konus('Kardan adam yapacağım!', { ...KINO_SESI, cihazSesi: false }).then(() => (bitti = true));
    await vi.advanceTimersByTimeAsync(400);
    expect(bitti).toBe(false);
    await vi.advanceTimersByTimeAsync(2000);
    expect(bitti).toBe(true);
    expect(speak).not.toHaveBeenCalled();
  });

  it('sus sessiz bekleyen cümleyi hemen bitirir', async () => {
    let bitti = false;
    void konus('Perdeyi aç!', { cihazSesi: false }).then(() => (bitti = true));
    await vi.advanceTimersByTimeAsync(50);
    sus();
    await vi.advanceTimersByTimeAsync(0);
    expect(bitti).toBe(true);
  });

  it('seçenek verilmeyince eski davranış: cihaz sesi kullanılır', async () => {
    void konus('Kardan adam yapacağım!', KINO_SESI);
    await vi.advanceTimersByTimeAsync(200);
    expect(speak).toHaveBeenCalledTimes(1);
  });
});
