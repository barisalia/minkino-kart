import { efektCikisi, seviyeleriUygula, sesMotorunuAc } from '../../src/audio/motor';
import { durum, ILERLEME_ANAHTARI, yukle } from '../../src/engine/ilerleme';
import { cilaKendiliginden, cilaVurus } from './cila';

type DersSesKanali = 'konusma' | 'efekt';
export function dersSesSeviyesi(kanal: DersSesKanali): number {
  const {ayarlar} = durum.i;
  if (!ayarlar[kanal]) return 0;
  return Number.isFinite(ayarlar.seviye) ? Math.max(0, Math.min(1, ayarlar.seviye)) : .9;
}

export function medyaSeviyesiniUygula(medya: HTMLMediaElement, seviye: number) {
  const sessiz = seviye === 0;
  if (medya.muted !== sessiz) medya.muted = sessiz;
  if (medya.volume !== seviye) medya.volume = seviye;
}

function kayitliSesAyarlariniAl() {
  durum.i.ayarlar = yukle().ayarlar;
  seviyeleriUygula();
}
window.addEventListener('storage', olay => {
  if (olay.key === ILERLEME_ANAHTARI || olay.key === null) kayitliSesAyarlariniAl();
});
window.addEventListener('pageshow', olay => {
  if (olay.persisted) kayitliSesAyarlariniAl();
});

type Vurus = 'kagit' | 'kutu' | 'geri' | 'miknatis' | 'birles' | 'korna' | 'parilti' | 'damla' | 'zil';
type Nota = [bas: number, frekans: number, bitis: number, sure: number, siddet: number, tip: OscillatorType];

// Hışırtı için iki kısa tiz darbe, kutuda alçak bir gövde sesi, mıknatısta iki metal teması.
const sesler: Record<Vurus, Nota[]> = {
  korna: [[0, 360, 332, .16, .075, 'triangle'], [0, 451, 413, .16, .05, 'triangle']],
  kagit: [[0, 1750, 820, .035, .035, 'triangle'], [.018, 1150, 700, .042, .023, 'triangle']],
  kutu: [[0, 160, 82, .102, .15, 'sine'], [.022, 620, 430, .055, .042, 'triangle']],
  geri: [[0, 185, 340, .1, .09, 'sine']],
  miknatis: [[0, 1740, 970, .035, .06, 'triangle'], [.016, 570, 510, .073, .1, 'sine']],
  birles: [[0, 790, 640, .05, .07, 'triangle'], [.045, 880, 880, .14, .055, 'sine']],
  // Canlanma anları: yukarı çıkan üç ince çan sesi; boya damlasının yumuşak "pıt"ı.
  parilti: [[0, 1318, 1318, .13, .045, 'sine'], [.07, 1760, 1760, .14, .04, 'sine'], [.14, 2093, 2093, .2, .035, 'sine']],
  damla: [[0, 640, 250, .1, .09, 'sine'], [.01, 1400, 900, .03, .02, 'triangle']],
  // Mutfak zili (Mino'nun Harf Kurabiyesi): iki vuruş, çınlayan üst ses.
  zil: [[0, 2093, 2090, .9, .06, 'sine'], [0, 5274, 5270, .35, .014, 'sine'], [.24, 2093, 2090, .9, .05, 'sine'], [.24, 5274, 5270, .35, .012, 'sine']],
};
// Cila katmanı (cila.ts, 22 Kasım gecesi): her vuruş doğruda parıltı ve Ceren'in sevinci, yanlışta komik ses ve sallanma
// getirir; dokunuşların kendi sesi yoksa yumuşak "pıt". Türkçe'nin her sayfası bu modülü yüklediği için cila burada kurulur.
cilaKendiliginden();
export function oyunSesi(ad: Vurus) {
  if (cilaVurus(ad)) return;
  const ctx = sesMotorunuAc(), cikis = efektCikisi();
  if (!ctx || !cikis) return;
  for (const [gecikme, frekans, bitis, sure, siddet, tip] of sesler[ad]) {
    const ton = ctx.createOscillator(), seviye = ctx.createGain(), bas = ctx.currentTime + gecikme;
    ton.type = tip;
    ton.frequency.setValueAtTime(frekans, bas);
    ton.frequency.exponentialRampToValueAtTime(bitis, bas + sure);
    seviye.gain.setValueAtTime(.0001, bas);
    seviye.gain.exponentialRampToValueAtTime(siddet, bas + .006);
    seviye.gain.exponentialRampToValueAtTime(.0001, bas + sure);
    ton.connect(seviye).connect(cikis);
    ton.onended = () => { ton.disconnect(); seviye.disconnect(); };
    ton.start(bas); ton.stop(bas + sure);
  }
}
