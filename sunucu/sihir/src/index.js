/**
 * Minik Sanatçı — sihir sunucusu.
 * POST /sihir  { resim: <PNG base64>, konu: "kedi" | ... | "surpriz" }  →  { resim: <base64>, mime }
 *
 * Gizlilik: çizim yalnızca dönüştürme için yapay zeka servisine iletilir; sunucuda saklanmaz, kaydı tutulmaz.
 * Anahtarlar (GEMINI_API_KEY, RECRAFT_API_KEY) Cloudflare'de gizli değişken olarak durur, uygulamaya hiç inmez.
 */

const KONU = {
  kedi: 'a cat', kopek: 'a dog', kus: 'a bird', balik: 'a fish', ev: 'a house', araba: 'a car',
  cicek: 'a flower', agac: 'a tree', cocuk: 'a person', dinozor: 'a dinosaur', gunes: 'the sun',
};

const STIL =
  'premium, finished children\'s picture-book illustration in modern Disney Junior / Nick Jr. preschool cartoon style: ' +
  'glossy clean 2D vector art, soft cel shading, gentle gradients, white highlight glints, thick clean dark-brown outlines, ' +
  'vivid bright saturated colors, cute rounded shapes, cheerful and charming';

function geminiTalimati(konu) {
  const ne = KONU[konu] ? ` The child says it is ${KONU[konu]}.` : '';
  return (
    `A young child drew this with crayons.${ne} Turn it into an adorable, ${STIL}. ` +
    'The child must instantly recognize their drawing: keep the same subjects, the same pose, layout and composition, ' +
    'and the same number of objects. COLORS: use exactly the colors the child used — fill every shape with the color of ' +
    'its crayon outline (a red outline means a red part, a blue outline means a blue part); do not replace them with beige, ' +
    'peach or pastel tones. Only living creatures the child drew may have cute sparkling eyes; never add eyes or faces to ' +
    'houses, vehicles, suns or other objects. Make it look cute and professional. ' +
    'Plain pure white background, no text, no letters, no frame. Keep it wholesome and suitable for toddlers.'
  );
}

function recraftTalimati(konu) {
  const ne = KONU[konu] ?? 'the thing';
  return `Premium glossy cartoon illustration of ${ne} drawn by a child, same pose, composition and colors as the drawing, ${STIL}. Plain white background. No text.`;
}

function b64ToBytes(b64) {
  const s = atob(b64);
  const a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
}
function bytesToB64(buf) {
  const a = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000));
  return btoa(s);
}

async function gemini(env, resim, konu) {
  const modeller = [env.GEMINI_MODEL || 'gemini-3-pro-image-preview', 'gemini-2.5-flash-image'];
  let sonHata = '';
  for (const model of modeller) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: geminiTalimati(konu) }, { inlineData: { mimeType: 'image/png', data: resim } }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } },
      }),
    });
    if (r.status === 404) {
      sonHata = `model yok: ${model}`;
      continue;
    }
    const j = await r.json();
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
    const parca = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
    const veri = parca?.inlineData ?? parca?.inline_data;
    if (!veri?.data) throw new Error('Gemini görsel döndürmedi');
    return { veri: veri.data, mime: veri.mimeType ?? veri.mime_type ?? 'image/png' };
  }
  throw new Error(sonHata || 'Gemini modeli bulunamadı');
}

/**
 * Cloudflare Workers AI (ücretsiz günlük kota). Önce görsel düzenleme destekli FLUX.2 denenir,
 * olmazsa Stable Diffusion img2img.
 */
async function cloudflare(env, resim, konu) {
  const bayt = b64ToBytes(resim);
  const hatalar = [];
  try {
    const form = new FormData();
    form.append('prompt', geminiTalimati(konu));
    form.append('input_image_0', new Blob([bayt], { type: 'image/png' }), 'cizim.png');
    form.append('width', '1024');
    form.append('height', '1024');
    const govde = new Response(form);
    const cikti = await env.AI.run(env.CF_MODEL || '@cf/black-forest-labs/flux-2-dev', {
      multipart: { body: govde.body, contentType: govde.headers.get('content-type') },
    });
    if (cikti?.image) return { veri: cikti.image, mime: 'image/png' };
    hatalar.push('flux: görsel yok');
  } catch (e) {
    hatalar.push(`flux: ${e?.message ?? e}`);
  }
  try {
    const akim = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
      prompt: recraftTalimati(konu),
      negative_prompt: 'text, letters, watermark, scary, ugly, blurry, photo, realistic',
      image: [...bayt],
      strength: 0.65,
      guidance: 8,
      num_steps: 20,
    });
    const tampon = await new Response(akim).arrayBuffer();
    return { veri: bytesToB64(tampon), mime: 'image/png' };
  } catch (e) {
    hatalar.push(`sd: ${e?.message ?? e}`);
  }
  throw new Error(`Workers AI: ${hatalar.join(' | ')}`);
}

async function recraft(env, resim, konu) {
  const f = new FormData();
  f.append('image', new Blob([b64ToBytes(resim)], { type: 'image/png' }), 'cizim.png');
  f.append('prompt', recraftTalimati(konu));
  f.append('strength', '0.5');
  f.append('model', 'recraftv4_1');
  const r = await fetch('https://external.api.recraft.ai/v1/images/imageToImage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RECRAFT_API_KEY}` },
    body: f,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`Recraft ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
  const d = j.data?.[0];
  if (d?.b64_json) return { veri: d.b64_json, mime: 'image/png' };
  if (!d?.url) throw new Error('Recraft görsel döndürmedi');
  const g = await fetch(d.url);
  return { veri: bytesToB64(await g.arrayBuffer()), mime: g.headers.get('content-type') ?? 'image/png' };
}

// Basit hız sınırı (her sunucu örneğinde ayrı tutulur; kötüye kullanıma karşı ilk savunma)
const gecmis = new Map();
function sinirAsildi(ip, dakikaSiniri) {
  const simdi = Date.now();
  const liste = (gecmis.get(ip) ?? []).filter((t) => simdi - t < 60_000);
  liste.push(simdi);
  gecmis.set(ip, liste);
  if (gecmis.size > 5000) gecmis.clear();
  return liste.length > dakikaSiniri;
}

export default {
  async fetch(req, env) {
    const koken = req.headers.get('Origin') ?? '';
    const izinli = (env.IZINLI_KOKENLER ?? '*').split(',').map((s) => s.trim());
    const cors = {
      'Access-Control-Allow-Origin': izinli.includes('*') ? '*' : izinli.includes(koken) ? koken : izinli[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    };
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
    const url = new URL(req.url);
    // Motor sırası: ayarlanan motor önce, olmazsa anahtarı olan diğerleri
    const sira = [env.MOTOR || 'cloudflare', 'cloudflare', 'gemini', 'recraft'].filter(
      (m, i, a) => a.indexOf(m) === i && (m === 'cloudflare' ? !!env.AI : m === 'gemini' ? !!env.GEMINI_API_KEY : !!env.RECRAFT_API_KEY),
    );
    const motor = sira[0] ?? 'yok';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (url.pathname === '/' && req.method === 'GET') return json({ durum: motor === 'yok' ? 'motor yok' : 'hazır', motorlar: sira });
    if (url.pathname !== '/sihir' || req.method !== 'POST') return json({ hata: 'bulunamadı' }, 404);
    if (!izinli.includes('*') && koken && !izinli.includes(koken)) return json({ hata: 'izin yok' }, 403);

    const ip = req.headers.get('CF-Connecting-IP') ?? 'bilinmiyor';
    if (sinirAsildi(ip, Number(env.DAKIKA_SINIRI ?? 6))) return json({ hata: 'çok sık' }, 429);

    let govde;
    try {
      govde = await req.json();
    } catch {
      return json({ hata: 'geçersiz istek' }, 400);
    }
    const resim = String(govde?.resim ?? '');
    const konu = String(govde?.konu ?? 'surpriz');
    if (!resim || resim.length > 4_000_000) return json({ hata: 'resim yok ya da çok büyük' }, 400);

    const calistir = { cloudflare, gemini, recraft };
    const hatalar = [];
    for (const m of sira) {
      try {
        const sonuc = await calistir[m](env, resim, konu);
        return json({ resim: sonuc.veri, mime: sonuc.mime, motor: m });
      } catch (e) {
        hatalar.push(`${m}: ${String(e?.message ?? e).slice(0, 300)}`);
      }
    }
    return json({ hata: hatalar.join(' || ') || 'motor yok' }, 502);
  },
};
