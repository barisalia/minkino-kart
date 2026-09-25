/**
 * Sihir: çizimi Minkino stilinde illüstrasyona çeviren sunucu (sunucu/sihir).
 * Sunucu adresi ./ayar.json dosyasından okunur. Adres yoksa uygulama "kurulum bekleniyor" durumundadır.
 */
interface Ayar {
  sunucu?: string;
}

let ayar: Ayar | null = null;
export async function ayarYukle(): Promise<Ayar> {
  if (ayar) return ayar;
  try {
    const r = await fetch('./ayar.json', { cache: 'no-store' });
    ayar = r.ok ? await r.json() : {};
  } catch {
    ayar = {};
  }
  return ayar!;
}

export async function sihirHazirMi(): Promise<boolean> {
  return !!(await ayarYukle()).sunucu;
}

export class SihirHatasi extends Error {
  constructor(public kod: 'kurulum' | 'ag' | 'sunucu' | 'yogun', mesaj: string) {
    super(mesaj);
  }
}

function base64(b: Blob): Promise<string> {
  return new Promise((coz, red) => {
    const r = new FileReader();
    r.onload = () => coz(String(r.result).split(',')[1] ?? '');
    r.onerror = () => red(r.error);
    r.readAsDataURL(b);
  });
}

/** Çizimi sunucuya gönderir, sihirli sonucu (PNG/WebP) döndürür. */
export async function sihirYap(cizim: Blob, konu: string, sinyal?: AbortSignal): Promise<Blob> {
  const { sunucu } = await ayarYukle();
  if (!sunucu) throw new SihirHatasi('kurulum', 'Sihir sunucusu henüz kurulmadı.');
  let r: Response;
  try {
    r = await fetch(`${sunucu.replace(/\/$/, '')}/sihir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resim: await base64(cizim), konu }),
      signal: sinyal,
    });
  } catch {
    throw new SihirHatasi('ag', 'İnternet bağlantısı yok gibi görünüyor.');
  }
  if (r.status === 429) throw new SihirHatasi('yogun', 'Biraz dinlenelim, birazdan tekrar dene.');
  if (!r.ok) throw new SihirHatasi('sunucu', `Sunucu hatası (${r.status}).`);
  const j = (await r.json()) as { resim?: string; mime?: string };
  if (!j.resim) throw new SihirHatasi('sunucu', 'Sonuç gelmedi.');
  const ikili = Uint8Array.from(atob(j.resim), (c) => c.charCodeAt(0));
  return new Blob([ikili], { type: j.mime ?? 'image/png' });
}
