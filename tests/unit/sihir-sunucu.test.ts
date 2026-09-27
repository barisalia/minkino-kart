import { afterEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error — düz JS Cloudflare Worker modülü
import sunucu from '../../sunucu/sihir/src/index.js';

const AI = { run: vi.fn(async (_m: string, _g?: unknown) => ({ image: 'QUJD' })) };
// Eski yedek anahtarlar ortamda dursa bile kullanılmamalı (çocuk verisi kuralı)
const env = { AI, GEMINI_API_KEY: 'test', RECRAFT_API_KEY: 'test', MOTOR: 'gemini', IZINLI_KOKENLER: 'https://barisalia.github.io', DAKIKA_SINIRI: '3' };
const istek = (govde: unknown, ip = '1.1.1.1', koken = 'https://barisalia.github.io') =>
  new Request('https://sihir.test/sihir', { method: 'POST', headers: { Origin: koken, 'CF-Connecting-IP': ip, 'Content-Type': 'application/json' }, body: JSON.stringify(govde) });

afterEach(() => {
  vi.unstubAllGlobals();
  AI.run.mockClear();
});

describe('sihir sunucusu', () => {
  it('yalnız Cloudflare klein 4B kullanılır; anahtar olsa da çizim Gemini ya da Recraft servisine gitmez', async () => {
    const fetchSahte = vi.fn();
    vi.stubGlobal('fetch', fetchSahte);
    const r = await sunucu.fetch(istek({ resim: 'aGVsbG8=', konu: 'kedi' }, '2.2.2.2'), env);
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ resim: 'QUJD', mime: 'image/png', motor: 'cloudflare' });
    expect(fetchSahte).not.toHaveBeenCalled();
    expect((AI.run.mock.calls[0] as unknown[])[0]).toBe('@cf/black-forest-labs/flux-2-klein-4b');
    expect(r.headers.get('Access-Control-Allow-Origin')).toBe('https://barisalia.github.io');
  });

  it('Cloudflare Workers AI motoru: FLUX sonucu döner', async () => {
    const ai = { run: vi.fn(async () => ({ image: 'RkxVWA==' })) };
    const r = await sunucu.fetch(istek({ resim: 'aGVsbG8=', konu: 'ev' }, '6.6.6.6'), { ...env, MOTOR: 'cloudflare', AI: ai });
    expect(await r.json()).toMatchObject({ resim: 'RkxVWA==', motor: 'cloudflare' });
    expect(ai.run).toHaveBeenCalledTimes(1);
  });

  it('Workers AI: yalnız klein 4B (9B ayarı yok sayılır); kota bitince başka yere gidilmez', async () => {
    const ai = { run: vi.fn(async (_m: string) => { throw new Error('4006: you have used up your daily free allocation'); }) };
    const r = await sunucu.fetch(istek({ resim: 'aGVsbG8=', kucuk: 'a2s=', konu: 'ev' }, '8.8.8.8'), { ...env, MOTOR: 'cloudflare', AI: ai, CF_MODEL: '@cf/black-forest-labs/flux-2-klein-9b' });
    expect(r.status).toBe(502);
    expect(ai.run).toHaveBeenCalledTimes(1);
    expect((ai.run.mock.calls[0] as unknown[])[0]).toBe('@cf/black-forest-labs/flux-2-klein-4b');
  });

  it('Workers AI olmazsa Gemini yedeğine DÜŞMEZ, hata döner', async () => {
    const ai = { run: vi.fn(async () => { throw new Error('kota bitti'); }) };
    const fetchSahte = vi.fn();
    vi.stubGlobal('fetch', fetchSahte);
    const r = await sunucu.fetch(istek({ resim: 'aGVsbG8=', konu: 'ev' }, '7.7.7.7'), { ...env, MOTOR: 'cloudflare', AI: ai });
    expect(r.status).toBe(502);
    expect(fetchSahte).not.toHaveBeenCalled();
  });

  it('izinsiz siteden gelen isteği reddeder', async () => {
    const r = await sunucu.fetch(istek({ resim: 'eA==' }, '3.3.3.3', 'https://kotu.site'), env);
    expect(r.status).toBe(403);
  });

  it('dakika sınırını uygular', async () => {
    const kodlar = [];
    for (let i = 0; i < 5; i++) kodlar.push((await sunucu.fetch(istek({ resim: 'eA==' }, '4.4.4.4'), env)).status);
    expect(kodlar).toEqual([200, 200, 200, 429, 429]);
  });

  it('boş resmi ve bilinmeyen yolu reddeder, OPTIONS ön isteğine izin verir', async () => {
    expect((await sunucu.fetch(istek({ resim: '' }, '5.5.5.5'), env)).status).toBe(400);
    expect((await sunucu.fetch(new Request('https://sihir.test/baska', { method: 'POST' }), env)).status).toBe(404);
    expect((await sunucu.fetch(new Request('https://sihir.test/sihir', { method: 'OPTIONS', headers: { Origin: 'https://barisalia.github.io' } }), env)).status).toBe(204);
  });
});
