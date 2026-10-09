import { durum } from '../engine/ilerleme';
import { TEST_MODU } from '../ui/dom';
import { normal } from './cumleler';
import { kayitCal, kayitDurdur, kayitVar, onYukle } from './kayit';
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
  // yarıda kesilen cümle müziği/efektleri kısık bırakmasın (yeni cümle hemen yine kısar)
  if (konusuyor) muzikKis(false);
  konusuyor = false;
  ani = null;
  kayitDurdur();
  if (destek()) speechSynthesis.cancel();
  if (aktifDosya) {
    aktifDosya.pause();
    aktifDosya = null;
  }
  bitir?.();
  bitir = null;
}

const DOSYA = /\.(mp3|m4a|ogg|wav|aac)$/i;

export type Soylenecek = string | undefined | null | (string | undefined | null)[];

/**
 * Metni (ya da parçalarını sırayla) söyler; bittiğinde çözülür.
 * Her parça için önce gerçek kayıt aranır (public/ses), yoksa cihazın Türkçe sesi kullanılır.
 */
let konusuyor = false;
/** Şu an bir cümle söyleniyor mu (kayıt ya da cihaz sesi). */
export const konusuyorMu = () => konusuyor;

/**
 * Şu an çalan parça (dudak senkronu, src/audio/dudak.ts): 'kayit' = Web Audio'dan geçen gerçek kayıt (ses
 * ölçülebilir), 'cihaz' = cihazın sesi ya da düz ses dosyası (ölçülemez; ağız metnin ritmiyle oynar).
 * bas: parçanın başladığı an (performance.now). Parça başlamadan / bitince null.
 */
export interface KonusmaAni {
  kaynak: 'kayit' | 'cihaz';
  metin: string;
  bas: number;
}
let ani: KonusmaAni | null = null;
export const konusmaAni = (): KonusmaAni | null => ani;

export interface KonusmaSecenegi {
  /** Karakter sesi: kayıtlar bu hızda (ve tonda) çalınır, ör. 1.18 = daha ince, sevimli */
  ton?: number;
  /**
   * Konuşan karakter (ör. 'kino'): karakterin kendi ses kaydı varsa o normal tonda çalınır ve `ton` yok sayılır;
   * yoksa anlatıcı kaydı `ton` ile çalınır (content/seslendirme.json → karakter_sesleri).
   */
  karakter?: string | null;
  /**
   * false: kaydı çalınamayan parça (kayıt yok ya da ses motoru henüz açılmadı — ilk dokunuştan önce) cihazın robotik
   * Türkçe sesine düşmez; parçanın süresi kadar sessiz beklenir (ekrandaki balon / yazı yine görünür).
   */
  cihazSesi?: boolean;
}

/** Kino'nun konuşması: kendi sesi yoksa anlatıcı sesinin kalın tonu. */
export const KINO_SESI: KonusmaSecenegi = { karakter: 'kino', ton: 0.92 };

/** Söylenmekte olan cümlenin, çağıranın beklediği sözü (tekrarSoyle bunu devralır). */
interface Bekleyen {
  coz: () => void;
  devredildi: boolean;
}
let bekleyen: Bekleyen | null = null;

function sarmala(ic: Promise<void>, onceki: Bekleyen | null): Promise<void> {
  return new Promise<void>((coz, red) => {
    const b: Bekleyen = {
      devredildi: false,
      coz: () => {
        coz();
        onceki?.coz();
      },
    };
    bekleyen = b;
    ic.then(
      () => {
        if (!b.devredildi) b.coz();
      },
      (e) => {
        if (b.devredildi) return;
        red(e);
        onceki?.coz();
      },
    );
  });
}

export function konus(girdi: Soylenecek, secenek: KonusmaSecenegi = {}): Promise<void> {
  const ic = konusIc(girdi, secenek);
  // test / konuşma kapalı / boş metin: çalan bir şey yok, devralınacak bir şey de yok
  return konusuyor ? sarmala(ic, null) : ic;
}

/**
 * "Tekrar dinle": bir cümle söylenirken çağrılırsa o cümleyi baştan söyler ve cümleyi bekleyen akış (sahnede
 * `await konus(...)`) tekrar bitene kadar bekler; böylece hikâye sonraki cümleye atlamaz. Sessizken düz konus gibidir.
 */
export function tekrarSoyle(girdi: Soylenecek, secenek: KonusmaSecenegi = {}): Promise<void> {
  const eski = konusuyor ? bekleyen : null;
  if (eski) eski.devredildi = true;
  const ic = konusIc(girdi, secenek);
  if (!eski) return konusuyor ? sarmala(ic, null) : ic;
  if (konusuyor) return sarmala(ic, eski);
  void ic.then(eski.coz, eski.coz);
  return ic;
}

function konusIc(girdi: Soylenecek, secenek: KonusmaSecenegi): Promise<void> {
  sus();
  const benim = sayac;
  let parcalar = (Array.isArray(girdi) ? girdi : [girdi]).map((p) => normal(p ?? '')).filter(Boolean);
  // Birleşik cümlenin tek parça kaydı varsa onu çal (daha doğal, arada boşluk yok)
  const kayitSecenegi = { karakter: secenek.karakter, ton: secenek.ton };
  const butun = normal(parcalar.join(' '));
  if (parcalar.length > 1 && kayitVar(butun, kayitSecenegi)) parcalar = [butun];
  if (!parcalar.length) return Promise.resolve();
  if (TEST_MODU) return new Promise((r) => setTimeout(r, 5));
  if (!durum.i.ayarlar.konusma) return new Promise((r) => setTimeout(r, 250));

  onYukle(parcalar, kayitSecenegi);
  muzikKis(true);
  konusuyor = true;
  return (async () => {
    try {
      for (const p of parcalar) {
        if (benim !== sayac) return;
        const basladi = () => {
          if (benim === sayac) ani = { kaynak: 'kayit', metin: p, bas: performance.now() };
        };
        const calindi = kayitVar(p, kayitSecenegi) && (await kayitCal(p, () => benim !== sayac, kayitSecenegi, basladi));
        if (!calindi && benim === sayac) await (secenek.cihazSesi === false && !DOSYA.test(p) ? sessizParca(p, benim) : tekParca(p, benim, secenek.ton ?? 1));
        if (benim === sayac) ani = null;
      }
      if (benim === sayac) muzikKis(false);
    } finally {
      if (benim === sayac) {
        konusuyor = false;
        ani = null;
      }
    }
  })();
}

/** Cihaz sesi istenmeyen parça: söylenecekmiş gibi kısa süre beklenir (akış ve balonlar aynı ritimde sürer). */
function sessizParca(metin: string, benim: number): Promise<void> {
  return new Promise<void>((coz) => {
    if (benim !== sayac) return coz();
    const t = setTimeout(son, 500 + metin.length * 55);
    function son() {
      clearTimeout(t);
      coz();
    }
    bitir = son;
  });
}

function tekParca(metin: string, benim: number, ton = 1): Promise<void> {
  const ayar = durum.i.ayarlar;
  return new Promise<void>((coz) => {
    let bitti = false;
    const son = () => {
      if (bitti) return;
      bitti = true;
      coz();
    };
    bitir = son;
    const emniyet = setTimeout(son, 1800 + metin.length * 95);

    if (DOSYA.test(metin)) {
      const a = new Audio(metin);
      aktifDosya = a;
      a.volume = ayar.seviye;
      a.onended = a.onerror = () => {
        clearTimeout(emniyet);
        son();
      };
      a.play().then(() => {
        if (benim === sayac) ani = { kaynak: 'cihaz', metin, bas: performance.now() };
      }, () => son());
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
    u.pitch = Math.min(2, TON * ton);
    u.volume = ayar.seviye;
    u.onend = u.onerror = () => {
      clearTimeout(emniyet);
      son();
    };
    // ağız ritmi sesin gerçekten başladığı andan (onstart gelmeyen cihazda konuşma isteğinden) sayılır
    u.onstart = () => {
      if (benim === sayac) ani = { kaynak: 'cihaz', metin, bas: performance.now() };
    };
    // Chrome bazen cancel()'dan hemen sonra gelen konuşmayı yutar; kısa gecikme.
    setTimeout(() => {
      if (benim !== sayac) return;
      speechSynthesis.speak(u);
      ani ??= { kaynak: 'cihaz', metin, bas: performance.now() };
    }, 60);
  });
}
