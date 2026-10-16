/**
 * İlk cümle yarışı (kalite denetimi 2026-10-16, K1): açılışta manifest ya da ses motoru hazır olmadan gelen cümle,
 * kaydı olduğu hâlde cihazın robot sesiyle okunuyordu (Pasta, Dedektif, Banyo, Elektrik). Kayıt varsa her zaman
 * kayıt çalar; motor hiç açılmazsa cümle sessiz geçer, robot sese hiç düşmez.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const KAYITLI = 'Yeni bir vaka var!';
const KAYITSIZ = 'Bu cümlenin kaydı yok.';

/** Sahte ses motoru: durumu test değiştirir; çalınan kayıtlar `calinan`a yazılır. */
const motor = vi.hoisted(() => {
  const dinleyiciler = new Set<() => void>();
  const m = {
    var: true,
    state: 'running' as AudioContextState,
    calinan: [] as number[],
    ctx: null as unknown,
    durumDegistir(s: AudioContextState) {
      m.state = s;
      dinleyiciler.forEach((f) => f());
    },
    sifirla() {
      m.var = true;
      m.state = 'running';
      m.calinan = [];
      dinleyiciler.clear();
    },
  };
  const dugum = () => ({ connect: () => undefined, disconnect: () => undefined, gain: { value: 1 } });
  m.ctx = {
    get state() {
      return m.state;
    },
    currentTime: 0,
    addEventListener: (_: string, f: () => void) => dinleyiciler.add(f),
    removeEventListener: (_: string, f: () => void) => dinleyiciler.delete(f),
    decodeAudioData: async () => ({ duration: 0.4 }),
    createGain: dugum,
    createBufferSource() {
      const src = {
        ...dugum(),
        buffer: null,
        playbackRate: { value: 1 },
        onended: null as null | (() => void),
        start() {
          m.calinan.push(Date.now());
          setTimeout(() => src.onended?.(), 400);
        },
        stop() {
          src.onended?.();
        },
      };
      return src;
    },
  };
  return m;
});

vi.mock('../../src/audio/motor', () => ({
  baglam: () => (motor.var ? motor.ctx : null),
  sesMotorunuAc: () => {
    motor.var = true;
    return motor.ctx;
  },
  konusmaCikisi: () => (motor.var ? { connect: () => undefined } : null),
  muzikKis: () => undefined,
}));

async function yukle() {
  vi.resetModules();
  const k = await import('../../src/audio/konusma');
  const { durum } = await import('../../src/engine/ilerleme');
  durum.i.ayarlar.konusma = true;
  return k;
}

describe('ilk cümle: kayıt varken robot ses yok (K1)', () => {
  const speak = vi.fn((u: { onend?: () => void }) => setTimeout(() => u.onend?.(), 300));
  let manifestGecikme = 800;
  beforeEach(() => {
    vi.useFakeTimers();
    motor.sifirla();
    speak.mockClear();
    manifestGecikme = 800;
    if (typeof window === 'undefined') vi.stubGlobal('window', globalThis);
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn(), getVoices: () => [] });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        constructor(public text: string) {}
      },
    );
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.endsWith('manifest.json')
          ? new Promise((coz) => setTimeout(() => coz({ ok: true, json: async () => ({ ses_id: 'x', dosyalar: { [KAYITLI]: 'a.mp3' } }) }), manifestGecikme))
          : Promise.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }),
      ),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('manifest geç gelse de ilk cümle kayıttan çalar', async () => {
    const { konus } = await yukle();
    let bitti = false;
    void konus(KAYITLI).then(() => (bitti = true));
    await vi.advanceTimersByTimeAsync(700);
    expect(motor.calinan).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1500);
    expect(motor.calinan).toHaveLength(1);
    expect(bitti).toBe(true);
    expect(speak).not.toHaveBeenCalled();
  });

  it('ses motoru biraz sonra açılırsa (ilk dokunuş) beklenir, kayıt çalar', async () => {
    manifestGecikme = 10;
    motor.state = 'suspended';
    const { konus } = await yukle();
    void konus(KAYITLI);
    await vi.advanceTimersByTimeAsync(600);
    expect(motor.calinan).toHaveLength(0);
    motor.durumDegistir('running');
    await vi.advanceTimersByTimeAsync(50);
    expect(motor.calinan).toHaveLength(1);
    expect(speak).not.toHaveBeenCalled();
  });

  it('motor hiç açılmazsa kayıtlı cümle sessiz geçer, robot sese düşmez; sonraki cümle beklemez', async () => {
    manifestGecikme = 10;
    motor.var = false;
    motor.state = 'suspended';
    const { konus } = await yukle();
    let bitti = false;
    void konus(KAYITLI).then(() => (bitti = true));
    await vi.advanceTimersByTimeAsync(4000);
    expect(bitti).toBe(true);
    expect(speak).not.toHaveBeenCalled();
    expect(motor.calinan).toHaveLength(0);
    // ikinci cümle: bir daha 1.5 sn beklenmez
    let ikinci = false;
    void konus(KAYITLI).then(() => (ikinci = true));
    await vi.advanceTimersByTimeAsync(1600);
    expect(ikinci).toBe(true);
    expect(speak).not.toHaveBeenCalled();
  });

  it('sessiz geçen cümlenin ortasında çocuk dokunursa kayıt hemen başlar', async () => {
    manifestGecikme = 10;
    motor.state = 'suspended';
    const { konus } = await yukle();
    void konus(KAYITLI);
    await vi.advanceTimersByTimeAsync(1700); // 1.5 sn beklendi, sessiz parça sürüyor
    expect(motor.calinan).toHaveLength(0);
    motor.durumDegistir('running');
    await vi.advanceTimersByTimeAsync(20);
    expect(motor.calinan).toHaveLength(1);
    expect(speak).not.toHaveBeenCalled();
  });

  it('kaçan açılış cümlesi ilk dokunuşta (6 sn içinde) bir kez kayıttan söylenir', async () => {
    manifestGecikme = 10;
    motor.state = 'suspended';
    const { konus } = await yukle();
    await Promise.all([konus(KAYITLI), vi.advanceTimersByTimeAsync(4000)]);
    expect(motor.calinan).toHaveLength(0);
    motor.durumDegistir('running');
    await vi.advanceTimersByTimeAsync(300);
    expect(motor.calinan).toHaveLength(0); // oyunun kendi cümlesine yol verilir
    await vi.advanceTimersByTimeAsync(200);
    expect(motor.calinan).toHaveLength(1);
    motor.durumDegistir('suspended');
    motor.durumDegistir('running');
    await vi.advanceTimersByTimeAsync(1000);
    expect(motor.calinan).toHaveLength(1);
    expect(speak).not.toHaveBeenCalled();
  });

  it('kaydı olmayan cümle yine cihaz sesine düşer', async () => {
    manifestGecikme = 10;
    const { konus } = await yukle();
    void konus(KAYITSIZ);
    await vi.advanceTimersByTimeAsync(500);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(motor.calinan).toHaveLength(0);
  });

  it('manifest hiç gelmezse en çok 1.5 sn beklenir', async () => {
    manifestGecikme = 60_000;
    const { konus } = await yukle();
    void konus(KAYITSIZ);
    await vi.advanceTimersByTimeAsync(1400);
    expect(speak).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(400);
    expect(speak).toHaveBeenCalledTimes(1);
  });
});
