/**
 * Söz tanıma: çocuğun söylediği sözcüğü tanır, YALNIZ CİHAZDA.
 *   iOS: SFSpeechRecognizer + requiresOnDeviceRecognition (ios/App/App/SozTanima.swift)
 *   Android 12+: createOnDeviceSpeechRecognizer (android/app/src/main/java/com/minkino/app/SozTanimaPlugin.java)
 * Ses kaydedilmez, saklanmaz, Apple'a/Google'a ya da hiçbir yere gönderilmez.
 *
 * Kullanım (sözcüğü kontrol eden "şimdi sen söyle" adımı):
 *   1. Çocuğun bir dokunuşunda `sozTanimaHazirla(dil, { izinIste: true })` → false ise eski yol (ses var/yok, dokunma).
 *   2. Kendi getUserMedia akışınızı kapatın (mikrofonu tanıyıcı tutar), sonra `sozDinle({ dil, ipuclari, seviye })`.
 *   3. Sonuç `duydu` ise `sozEslesti(metinler, beklenen, { dil, rakipler })` (src/audio/soz-esle.ts).
 *   Hiçbir durumda oyun kilitlenmez: `yok` / `sessiz` / `anlasilmadi` için oyunun nazik tekrar ve dokunma yolu vardır.
 *
 * Web sitesinde kapalıdır (çocuk sesi tarayıcıda Google'a gidebilir). Yalnız geliştirme sunucusunda (localhost) ekip
 * Chrome'un tanıyıcısıyla deneyebilir. Test: `?test=1&soz=cat` her dinlemede "cat" duyar, `&soz=yok` tanıma yok.
 */
import { UYGULAMA_DERLEMESI, yerelPlatform } from '../kabuk/ortam';
import { TEST_MODU } from '../ui/dom';
import type { SozDili } from './soz-esle';

export type { SozDili } from './soz-esle';
export type TanimaDurumu = 'duydu' | 'anlasilmadi' | 'sessiz' | 'yok' | 'iptal';
export interface TanimaSonucu {
  durum: TanimaDurumu;
  /** en olası seçenekler (en çok 5); yalnız `duydu` iken dolu */
  metinler: string[];
}
export interface SozDinleme {
  sonuc: Promise<TanimaSonucu>;
  durdur(): void;
}
interface DinleSecenek {
  dil: SozDili;
  /** beklenen sözcük(ler): tanıyıcıya ipucu */
  ipuclari?: string[];
  /** en uzun dinleme (çocuk susunca daha erken biter) */
  sureMs?: number;
  /** anlık ses 0…1 (mikrofon halkası) */
  seviye?: (n: number) => void;
}

interface Dinleyici {
  remove(): Promise<void>;
}
interface YerelEklenti {
  durum(o: { dil: string }): Promise<{ cihazda: boolean; izin: boolean; sorulmadi: boolean }>;
  izinIste(): Promise<{ izin: boolean }>;
  dinle(o: { dil: string; ipuclari: string[]; sureMs: number }): Promise<TanimaSonucu>;
  durdur(): Promise<void>;
  addListener(ad: 'seviye', fn: (v: { deger: number }) => void): Promise<Dinleyici>;
}

const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const SAHTE = TEST_MODU ? q.get('soz') : null;
const GELISTIRME = typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

let eklentiSozu: Promise<YerelEklenti | null> | undefined;
function yerelEklenti(): Promise<YerelEklenti | null> {
  if (!UYGULAMA_DERLEMESI || !yerelPlatform()) return Promise.resolve(null);
  eklentiSozu ??= import('@capacitor/core')
    .then((m) => m.registerPlugin<YerelEklenti>('SozTanima'))
    .catch(() => null);
  return eklentiSozu;
}

type WebTanici = {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onspeechstart: (() => void) | null;
  onend: (() => void) | null;
};
function webTaniciSinifi(): (new () => WebTanici) | null {
  if (!GELISTIRME || TEST_MODU) return null;
  const w = globalThis as unknown as { SpeechRecognition?: new () => WebTanici; webkitSpeechRecognition?: new () => WebTanici };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const hazir = new Map<SozDili, boolean>();
/** Bu oturumda tanıyıcısı hata veren diller: bir daha denenmez, oyun doğrudan eski yola (ses var/yok) geçer */
const bozuk = new Set<SozDili>();

/**
 * Bu cihazda bu dilde (yalnız cihazda) söz tanıma kullanılabilir mi? `izinIste`: izin henüz sorulmadıysa sorar;
 * yalnız çocuğun bir dokunuşunda true verin. Hata olursa false (oyun eski yoluna geçer).
 */
export async function sozTanimaHazirla(dil: SozDili, o: { izinIste?: boolean } = {}): Promise<boolean> {
  if (SAHTE !== null) return SAHTE !== 'yok';
  if (bozuk.has(dil)) return false;
  if (hazir.get(dil)) return true;
  const e = await yerelEklenti();
  if (e) {
    try {
      const d = await e.durum({ dil });
      let ok = d.cihazda && d.izin;
      if (d.cihazda && !d.izin && d.sorulmadi && o.izinIste) ok = (await e.izinIste()).izin && (await e.durum({ dil })).izin;
      if (ok) hazir.set(dil, true);
      return ok;
    } catch {
      return false;
    }
  }
  return !!webTaniciSinifi();
}

/** Bir kez dinler; çocuk susunca ya da süre dolunca sonuç verir. `durdur`: hemen bırak (sonuç `iptal`). */
export function sozDinle(o: DinleSecenek): SozDinleme {
  const sureMs = o.sureMs ?? 6000;
  if (SAHTE !== null) return sahteDinle(sureMs);
  let durduruldu = false;
  let durdurucu: () => void = () => {
    durduruldu = true;
  };
  const sonuc = (async (): Promise<TanimaSonucu> => {
    const e = await yerelEklenti();
    if (durduruldu) return { durum: 'iptal', metinler: [] };
    if (e) {
      let dinleyici: Dinleyici | undefined;
      try {
        if (o.seviye) dinleyici = await e.addListener('seviye', (v) => o.seviye?.(v.deger));
        durdurucu = () => void e.durdur().catch(() => undefined);
        const r = await e.dinle({ dil: o.dil, ipuclari: o.ipuclari ?? [], sureMs });
        if (r.durum === 'yok') {
          bozuk.add(o.dil);
          hazir.delete(o.dil);
        }
        return { durum: r.durum, metinler: Array.isArray(r.metinler) ? r.metinler.filter((m) => typeof m === 'string') : [] };
      } catch {
        bozuk.add(o.dil);
        hazir.delete(o.dil);
        return { durum: 'yok', metinler: [] };
      } finally {
        void dinleyici?.remove().catch(() => undefined);
      }
    }
    const Sinif = webTaniciSinifi();
    if (!Sinif) return { durum: 'yok', metinler: [] };
    return new Promise<TanimaSonucu>((coz) => {
      const t = new Sinif();
      t.lang = o.dil;
      t.maxAlternatives = 5;
      t.interimResults = false;
      t.continuous = false;
      let bitti = false;
      let konustu = false;
      const bitir = (r: TanimaSonucu) => {
        if (bitti) return;
        bitti = true;
        clearTimeout(zaman);
        coz(r);
      };
      t.onspeechstart = () => {
        konustu = true;
      };
      t.onresult = (ev) => {
        const metinler: string[] = [];
        for (let i = 0; i < ev.results.length; i++) {
          const sonuclar = ev.results[i];
          for (let j = 0; j < sonuclar.length; j++) if (sonuclar[j].transcript) metinler.push(sonuclar[j].transcript);
        }
        bitir(metinler.length ? { durum: 'duydu', metinler: metinler.slice(0, 5) } : { durum: 'anlasilmadi', metinler: [] });
      };
      t.onerror = (ev) => {
        const d: TanimaDurumu = ev.error === 'no-speech' ? 'sessiz' : ev.error === 'aborted' ? 'iptal' : ev.error === 'no-match' ? 'anlasilmadi' : 'yok';
        bitir({ durum: d, metinler: [] });
      };
      t.onend = () => bitir({ durum: konustu ? 'anlasilmadi' : 'sessiz', metinler: [] });
      const zaman = setTimeout(() => t.stop(), sureMs);
      durdurucu = () => {
        t.abort();
        bitir({ durum: 'iptal', metinler: [] });
      };
      try {
        t.start();
      } catch {
        bitir({ durum: 'yok', metinler: [] });
      }
    });
  })();
  return { sonuc, durdur: () => durdurucu() };
}

/** Test (`?test=1&soz=…`): kısa bir beklemeden sonra verilen sözü duyar; `soz=` boşsa sessiz */
function sahteDinle(sureMs: number): SozDinleme {
  let coz: (r: TanimaSonucu) => void = () => undefined;
  const sonuc = new Promise<TanimaSonucu>((c) => (coz = c));
  const zaman = setTimeout(() => {
    if (SAHTE === 'yok') coz({ durum: 'yok', metinler: [] });
    else if (SAHTE) coz({ durum: 'duydu', metinler: [SAHTE] });
    else coz({ durum: 'sessiz', metinler: [] });
  }, Math.min(300, sureMs));
  return {
    sonuc,
    durdur: () => {
      clearTimeout(zaman);
      coz({ durum: 'iptal', metinler: [] });
    },
  };
}
