import { durum } from '../engine/ilerleme';
import { TEST_MODU } from '../ui/dom';
import { muzikKis } from './motor';

/**
 * Konuşma: şimdilik cihazın Türkçe sesi (Web Speech API, tr-TR).
 * Metin bir ses dosyası yoluysa (.mp3/.m4a/.ogg/.wav) o dosya çalınır — gerçek kayıtlara geçişte kod değişmez.
 */
const HIZ = 0.92;
const TON = 1.1;

let turkceSes: SpeechSynthesisVoice | null = null;
let sayac = 0;
let aktifDosya: HTMLAudioElement | null = null;
let bitir: (() => void) | null = null;

const destek = () => typeof window !== 'undefined' && 'speechSynthesis' in window && !TEST_MODU;

function sesSec() {
  if (!destek()) return;
  const sesler = speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('tr'));
  const tercih = ['yelda', 'google', 'emel', 'filiz', 'seda', 'natural', 'premium', 'enhanced'];
  sesler.sort((a, b) => puan(b) - puan(a));
  function puan(v: SpeechSynthesisVoice) {
    const ad = v.name.toLowerCase();
    return tercih.reduce((p, t, i) => (ad.includes(t) ? p + (tercih.length - i) : p), 0) + (v.localService ? 1 : 0);
  }
  turkceSes = sesler[0] ?? null;
}
if (destek()) {
  sesSec();
  speechSynthesis.addEventListener?.('voiceschanged', sesSec);
}

/** iOS: ilk dokunuşta boş bir konuşma ile motoru uyandır. */
export function konusmaMotorunuAc() {
  if (!destek()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.lang = 'tr-TR';
    speechSynthesis.speak(u);
  } catch {
    /* yok say */
  }
}

export function sus() {
  sayac++;
  if (destek()) speechSynthesis.cancel();
  if (aktifDosya) {
    aktifDosya.pause();
    aktifDosya = null;
  }
  bitir?.();
  bitir = null;
}

const DOSYA = /\.(mp3|m4a|ogg|wav|aac)$/i;

/** Metni söyler; bittiğinde (veya güvenli bir süre sonra) çözülür. */
export function konus(metin: string | undefined | null): Promise<void> {
  sus();
  const benim = sayac;
  if (!metin?.trim()) return Promise.resolve();
  const ayar = durum.i.ayarlar;
  if (TEST_MODU) return new Promise((r) => setTimeout(r, 5));
  if (!ayar.konusma) return new Promise((r) => setTimeout(r, 250));

  return new Promise<void>((coz) => {
    let bitti = false;
    const son = () => {
      if (bitti) return;
      bitti = true;
      if (benim === sayac) muzikKis(false);
      coz();
    };
    bitir = son;
    muzikKis(true);
    const emniyet = setTimeout(son, 1800 + metin.length * 95);

    if (DOSYA.test(metin)) {
      const a = new Audio(metin);
      aktifDosya = a;
      a.volume = ayar.seviye;
      a.onended = a.onerror = () => {
        clearTimeout(emniyet);
        son();
      };
      a.play().catch(() => son());
      return;
    }
    if (!destek()) {
      clearTimeout(emniyet);
      setTimeout(son, 400);
      return;
    }
    const u = new SpeechSynthesisUtterance(metin);
    u.lang = 'tr-TR';
    if (turkceSes) u.voice = turkceSes;
    u.rate = HIZ;
    u.pitch = TON;
    u.volume = ayar.seviye;
    u.onend = u.onerror = () => {
      clearTimeout(emniyet);
      son();
    };
    // Chrome bazen cancel()'dan hemen sonra gelen konuşmayı yutar; kısa gecikme.
    setTimeout(() => {
      if (benim === sayac) speechSynthesis.speak(u);
    }, 60);
  });
}
