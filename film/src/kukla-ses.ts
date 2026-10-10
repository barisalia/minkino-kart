/**
 * Kesme kukla konuşması: kayıttan ses zarfı ve hece (ünlü) çıkarımı, ağız seçimi. Kullananlar: kukla-test.ts,
 * aile-test.ts (yalnız geliştirme sayfaları).
 */
// ---------- ses zarfı (ekip/blender-pilot/ses-hazirla.cjs ile aynı yol: kare başına RMS, tepe-22 dB .. tepe) ----------
export interface Zarf {
  t: number;
  zarf: number[];
  hece: { kare: number; sesli: 'acik' | 'dis' | 'yuvarlak' }[];
}
const UNLU: Record<string, 'acik' | 'dis' | 'yuvarlak'> = { a: 'acik', e: 'acik', ı: 'dis', i: 'dis', o: 'yuvarlak', ö: 'yuvarlak', u: 'yuvarlak', ü: 'yuvarlak' };
export async function zarfCikar(adres: string, metin: string, t: number, FPS = 30): Promise<Zarf> {
  const veri = await (await fetch(adres)).arrayBuffer();
  const ses = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(veri);
  const x = ses.getChannelData(0), hz = ses.sampleRate, pencere = hz / FPS;
  const rms: number[] = [];
  for (let k = 0; k < Math.ceil(x.length / pencere); k++) {
    const a = Math.max(0, Math.floor((k - 0.5) * pencere)), b = Math.min(x.length, Math.floor((k + 1.5) * pencere));
    let s = 0;
    for (let i = a; i < b; i++) s += x[i] * x[i];
    rms.push(Math.sqrt(s / Math.max(1, b - a)));
  }
  const db = rms.map((r) => 20 * Math.log10(r + 1e-9));
  const tepe = Math.max(...db), alt = Math.max(-45, tepe - 22);
  const zarf = db.map((d) => Math.min(1, Math.max(0, (d - alt) / (tepe - alt))));
  const tepeler: number[] = [];
  for (let i = 0; i < zarf.length; i++) {
    const s = zarf[i];
    if (s < 0.45 || (i > 0 && zarf[i - 1] > s) || (i < zarf.length - 1 && zarf[i + 1] >= s)) continue;
    if (tepeler.length && i - tepeler[tepeler.length - 1] < 3) {
      if (zarf[tepeler[tepeler.length - 1]] < s) tepeler[tepeler.length - 1] = i;
      continue;
    }
    tepeler.push(i);
  }
  const unluler = [...metin.toLocaleLowerCase('tr')].filter((c) => UNLU[c]).map((c) => UNLU[c]);
  const hece = tepeler.map((kare, i) => ({ kare, sesli: unluler.length ? unluler[Math.min(unluler.length - 1, Math.round((i * unluler.length) / tepeler.length))] : ('acik' as const) }));
  return { t, zarf, hece };
}

/** konuşma anındaki ağız (null: konuşmuyor) */
export function konusmaAgzi(z: Zarf[], t: number, FPS = 30): string | null {
  for (const s of z) {
    const k = Math.round((t - s.t) * FPS);
    if (k < 0 || k >= s.zarf.length + 2) continue;
    const a = s.zarf[Math.min(s.zarf.length - 1, k)] ?? 0;
    if (a < 0.16) return 'agiz-gulumse';
    const h = s.hece.find((x) => Math.abs(x.kare - k) <= 1);
    if (h?.sesli === 'yuvarlak') return 'agiz-o';
    if (h?.sesli === 'dis') return 'agiz-e';
    return a < 0.42 ? 'agiz-az' : a < 0.72 ? 'agiz-orta' : 'agiz-genis';
  }
  return null;
}
export function konusmaGucu(z: Zarf[], t: number, FPS = 30): number {
  for (const s of z) {
    const k = Math.round((t - s.t) * FPS);
    if (k >= 0 && k < s.zarf.length) return s.zarf[k];
  }
  return 0;
}

