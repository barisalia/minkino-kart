import { afterEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error — düz JS Cloudflare Worker modülü
import sunucu from '../../sunucu/sihir/src/index.js';

const env = { GEMINI_API_KEY: 'test', MOTOR: 'gemini', IZINLI_KOKENLER: 'https://barisalia.github.io', DAKIKA_SINIRI: '3' };
const istek = (govde: unknown, ip = '1.1.1.1', koken = 'https://barisalia.github.io') =>
  new Request('https://sihir.test/sihir', { method: 'POST', headers: { Origin: koken, 'CF-Connecting-IP': ip, 'Content-Type': 'application/json' }, body: JSON.stringify(govde) });

afterEach(() => vi.unstubAllGlobals());

describe('sihir sunucusu', () => {
  it('Gemini sonucunu base64 olarak döndürür, konuyu talimata ekler', async () => {
    const fetchSahte = vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'QUJD' } }] } }] })));
    vi.stubGlobal('fetch', fetchSahte);
    const r = await sunucu.fetch(istek({ resim: 'aGVsbG8=', konu: 'kedi' }, '2.2.2.2'), env);
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ resim: 'QUJD', mime: 'image/png', motor: 'gemini' });
    const gonderilen = JSON.parse((fetchSahte.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(gonderilen.contents[0].parts[0].text).toContain('a cat');
    expect(r.headers.get('Access-Control-Allow-Origin')).toBe('https://barisalia.github.io');
  });

  it('izinsiz siteden gelen isteği reddeder', async () => {
    const r = await sunucu.fetch(istek({ resim: 'eA==' }, '3.3.3.3', 'https://kotu.site'), env);
    expect(r.status).toBe(403);
  });

  it('dakika sınırını uygular', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: { data: 'eA==' } }] } }] }))));
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
