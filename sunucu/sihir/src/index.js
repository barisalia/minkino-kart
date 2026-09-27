/**
 * Minik Sanatçı — sihir sunucusu.
 * POST /sihir  { resim: <PNG base64>, kucuk?: <≤504 px PNG base64>, konu: "kedi" | ... | "surpriz" }  →  { resim: <base64>, mime }
 *
 * Gizlilik: çizim yalnızca Cloudflare Workers AI'ye (FLUX.2 klein 4B) iletilir; sunucuda saklanmaz, kaydı tutulmaz.
 * Çocuk verisi kuralı (2026-09-27): başka servise yedek YOK. Gemini API şartları 18 yaş altına yönelik uygulamada
 * kullanımı yasaklıyor; klein 9B lisansı ürün içinde kullanıma izin vermiyor. Bu yüzden ikisi de kaldırıldı.
 */

const KONU = {
  kedi: 'a cat', kopek: 'a dog', kus: 'a bird', balik: 'a fish', ev: 'a house', araba: 'a car',
  cicek: 'a flower', agac: 'a tree', cocuk: 'a person', dinozor: 'a dinosaur', gunes: 'the sun',
};

const STIL =
  'premium, finished children\'s picture-book illustration in modern Disney Junior / Nick Jr. preschool cartoon style: ' +
  'glossy clean 2D vector art, soft cel shading, gentle gradients, white highlight glints, thick clean dark-brown outlines, ' +
  'vivid bright saturated colors, cute rounded shapes, cheerful and charming';

function talimat(konu) {
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

function b64ToBytes(b64) {
  const s = atob(b64);
  const a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
}

/**
 * Cloudflare Workers AI. Ana model FLUX.2 [klein] 4B: görsel düzenleme destekli ve çok ucuz
 * (1024 px çıktı ≈ 110 nöron; günlük ücretsiz 10.000 nöron ≈ 90 resim). Giriş resmi 512 px'ten küçük olmalı,
 * bu yüzden uygulama ayrıca küçük bir kopya ("kucuk") gönderir.
 */
// Yalnız 4B (lisansı ürün içi kullanıma uygun). CF_MODEL ayarı bilerek dikkate alınmaz.
const CF_MODELLER = ['@cf/black-forest-labs/flux-2-klein-4b'];

async function cloudflare(env, resim, konu, kucuk) {
  const bayt = b64ToBytes(kucuk || resim);
  const hatalar = [];
  for (const model of CF_MODELLER) {
    try {
      const form = new FormData();
      form.append('prompt', talimat(konu));
      form.append('input_image_0', new Blob([bayt], { type: 'image/png' }), 'cizim.png');
      form.append('width', '1024');
      form.append('height', '1024');
      const govde = new Response(form);
      const cikti = await env.AI.run(model, {
        multipart: { body: govde.body, contentType: govde.headers.get('content-type') },
      });
      if (cikti?.image) return { veri: cikti.image, mime: 'image/png' };
      hatalar.push(`${model}: görsel yok`);
    } catch (e) {
      hatalar.push(`${model}: ${e?.message ?? e}`);
      // günlük kota bittiyse diğer model de çalışmaz
      if (/4006|daily free allocation/i.test(String(e?.message ?? e))) break;
    }
  }
  throw new Error(`Workers AI: ${hatalar.join(' | ')}`);
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
    // Tek motor: Cloudflare Workers AI. Çizim başka hiçbir servise gitmez.
    const sira = env.AI ? ['cloudflare'] : [];
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
    const kucuk = String(govde?.kucuk ?? '');
    if (!resim || resim.length > 4_000_000 || kucuk.length > 1_000_000) return json({ hata: 'resim yok ya da çok büyük' }, 400);

    const calistir = { cloudflare };
    const hatalar = [];
    for (const m of sira) {
      try {
        const sonuc = await calistir[m](env, resim, konu, kucuk);
        return json({ resim: sonuc.veri, mime: sonuc.mime, motor: m });
      } catch (e) {
        hatalar.push(`${m}: ${String(e?.message ?? e).slice(0, 300)}`);
      }
    }
    return json({ hata: hatalar.join(' || ') || 'motor yok' }, 502);
  },
};
