/**
 * Kitabın sesi: "Bana oku" ve canlanan anların sözleri, konuşanın kendi ElevenLabs kaydıyla (public/ses/kitap/,
 * scripts/kitap-seslendir.ts üretir). Okunan kelime kaydın zaman damgalarıyla vurgulanır.
 *
 * Robot ses YOK: kaydı olmayan (ya da ses motoru açılmamış, konuşma kapalı) satır cihazın sesine düşmez; satırın
 * süresi kadar sessiz beklenir, yazı görünür ve kelimeler aynı ritimde vurgulanır.
 */
import { dosyaCal, dosyaOnYukle } from '../../src/audio/kayit';
import { sus } from '../../src/audio/konusma';
import { baglam } from '../../src/audio/motor';
import { durum } from '../../src/engine/ilerleme';
import { TEST_MODU } from '../../src/ui/dom';
import { etiketsiz, kelimeAgirliklari } from './metin';
import { satirAnahtari, simdikiKelime, type KitapSesKaydi, type KitapSesManifest } from './ses-mantik';
import type { Kim } from './tipler';

/** Site kökündeki ses/kitap (kitap/ alt sayfası), yedek: tek klasör önizleme */
const KOKLER = ['../ses/kitap/', './ses/kitap/'];
let kok = KOKLER[0];
let manifest: KitapSesManifest | null = null;
let yukleme: Promise<void> | null = null;

export function kitapSesleriniHazirla(): Promise<void> {
  yukleme ??= (async () => {
    for (const k of KOKLER) {
      try {
        const r = await fetch(`${k}manifest.json`);
        if (!r.ok) continue;
        const m = (await r.json()) as KitapSesManifest;
        if (!m?.satirlar) continue;
        kok = k;
        manifest = m;
        return;
      } catch {
        /* sonraki klasör */
      }
    }
  })();
  return yukleme;
}

const sinirli = (p: Promise<void>, ms: number) => Promise.race([p, new Promise<void>((r) => setTimeout(r, ms))]);

export function kitapKaydi(kim: Kim, metin: string): KitapSesKaydi | null {
  return manifest?.satirlar[satirAnahtari(kim, metin)] ?? null;
}

/** Sayfanın kayıtlarını önceden indirir (sayfa açılınca: okuma gecikmesiz başlasın) */
export function kitapOnYukle(satirlar: { kim: Kim; metin: string }[]) {
  void sinirli(kitapSesleriniHazirla(), 3000).then(() => {
    const yollar = satirlar.map((s) => kitapKaydi(s.kim, s.metin)).filter((k): k is KitapSesKaydi => !!k).map((k) => kok + k.d);
    dosyaOnYukle(yollar);
  });
}

const motorAcik = () => baglam()?.state === 'running';

/** Motor kapalıysa (ilk dokunuştan önce) kısa süre açılmasını bekler */
function motoruBekle(ms: number): Promise<void> {
  const c = baglam();
  if (!c || c.state === 'running') return Promise.resolve();
  return new Promise<void>((coz) => {
    const bitti = () => {
      clearTimeout(t);
      c.removeEventListener?.('statechange', bak);
      coz();
    };
    const bak = () => c.state === 'running' && bitti();
    const t = setTimeout(bitti, ms);
    c.addEventListener?.('statechange', bak);
  });
}

export interface SoylemeSecenegi {
  /** true dönünce (sayfa çevrildi, okuma durdu) söyleme biter */
  iptal: () => boolean;
  /** Okunan kelime (etiketsiz metindeki sırası) */
  kelime?: (j: number) => void;
}

/**
 * Satırı söyler: kaydı varsa kaydı çalar ('kayit'), yoksa sessiz geçer ('sessiz'). Bitince (ya da iptal edilince)
 * çözülür. Durdurmak için ortak sus() yeter (kayıt ortak konuşma çıkışından çalar).
 */
export async function satirSoyle(kim: Kim, metin: string, o: SoylemeSecenegi): Promise<'kayit' | 'sessiz'> {
  if (TEST_MODU) return 'sessiz';
  // çalan söz / kayıt varsa yumuşakça kesilir (iki ses üst üste binmez)
  sus();
  await sinirli(kitapSesleriniHazirla(), 1500);
  if (o.iptal()) return 'sessiz';
  const k = kitapKaydi(kim, metin);
  if (k && durum.i.ayarlar.konusma) {
    if (!motorAcik()) await motoruBekle(1500);
    if (o.iptal()) return 'sessiz';
    let bas: number | null = null;
    let son = -1;
    let raf = 0;
    const izle = () => {
      const c = baglam();
      if (o.iptal() || !c) return;
      if (bas !== null) {
        const j = simdikiKelime(k.k, (c.currentTime - bas) * 1000);
        if (j !== son) {
          son = j;
          o.kelime?.(j);
        }
      }
      raf = requestAnimationFrame(izle);
    };
    try {
      const calindi = await dosyaCal(
        kok + k.d,
        o.iptal,
        (b) => {
          bas = b;
          raf = requestAnimationFrame(izle);
        },
      );
      if (calindi) return 'kayit';
    } finally {
      cancelAnimationFrame(raf);
    }
  }
  await sessizOku(metin, k, o);
  return 'sessiz';
}

/** Kayıt çalınamadı: satırın süresince sessiz bekle, kelimeleri kaydın (yoksa tahminin) ritminde vurgula */
async function sessizOku(metin: string, k: KitapSesKaydi | null, o: SoylemeSecenegi) {
  const agirlik = kelimeAgirliklari(metin);
  const sure = k?.s ?? 500 + etiketsiz(metin).length * 70;
  const toplam = agirlik.at(-1) ?? 1;
  const anlar = k?.k ?? agirlik.map((_, i) => (i === 0 ? 0 : ((agirlik[i - 1] ?? 0) / toplam) * (sure - 400)));
  const bas = performance.now();
  let son = -1;
  while (!o.iptal()) {
    const ms = performance.now() - bas;
    if (ms >= sure) break;
    const j = simdikiKelime(anlar, ms);
    if (j !== son) {
      son = j;
      o.kelime?.(j);
    }
    await new Promise((r) => setTimeout(r, 40));
  }
}
