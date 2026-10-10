/**
 * Kino ve Ailesi bölüm önizleme ve YouTube kayıt sayfası: /film/bolum.html (yalnız geliştirme sunucusunda; sitede ve
 * uygulamada yok). Seslendirme tam kalite (ekip/ses/seri2-gelen/<kimlik>.mp3). Uygulamadaki oynatıcı: ekran.ts.
 *
 * Adres: ?bolum=bolum-01 &parca=tum|acilis|s1..s6|kapanis (birden çok: s4,kapanis) &altyazi=0 &kilavuz=1 &t=12
 *   ?kayit=1 → window.film2Kayit (kare kare; scripts/film/bolum-kayit.mjs), ?kapak=1 → window.film2Kapak (1280×720)
 */
import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import { bolumParcalari, dogrula, srtYaz, type Bolum, type Sahne, type Seri } from './bicim';
import { kilavuzCiz } from './gorsel';
import { karisimIsle, karisimKur, wavBayt } from './karisim';
import { FPS, kur, Surucu, type Kurulum } from './kurulum';
import seriJson from '../../../content/film2/seri.json';

const BOLUMLER: Record<string, Bolum> = import.meta.glob('../../../content/film2/bolum-*.json', { eager: true, import: 'default' });
/** tam kalite seslendirme (yalnız geliştirme sayfası; uygulama paketine girmez) */
const SES_DOSYA: Record<string, string> = import.meta.glob<string>('../../../ekip/ses/seri2-gelen/*.mp3', { eager: true, query: '?url', import: 'default' });
const sesAdresi = (kimlik: string) => SES_DOSYA[`../../../ekip/ses/seri2-gelen/${kimlik}.mp3`] ?? null;

const seri = seriJson as unknown as Seri;
const q = new URLSearchParams(location.search);
const bolumAdi = q.get('bolum') ?? 'bolum-01';
const bolum = BOLUMLER[`../../../content/film2/${bolumAdi}.json`];
const kisa = bolum.kimlik.replace('bolum-', 'b');

const kok = document.getElementById('film2')!;
const tuval = document.createElement('canvas');
tuval.className = 'f2-tuval';
kok.append(tuval);

declare global {
  interface Window {
    film2Kayit?: {
      hazir: Promise<void>;
      fps: number;
      kareSayisi: () => number;
      sure: () => number;
      /** i. kareyi çizer (sırayla çağrılır, 0'dan) */
      kare: (i: number) => void;
      png: () => string;
      sesHazirla: () => Promise<number>;
      sesParca: (bas: number, boy: number) => string;
      srt: () => string;
      eksikler: () => string[];
      hatalar: () => string[];
    };
    film2Kapak?: { hazir: Promise<void>; png: () => string };
    film2?: { saat: () => number; parca: () => string | undefined; eksikler: () => string[]; hatalar: () => string[] };
  }
}

function sahneSec(): Sahne[] {
  const hepsi = bolumParcalari(seri, bolum);
  const parca = q.get('parca') ?? 'tum';
  if (parca === 'tum') return hepsi;
  const istek = parca.split(',');
  return hepsi.filter((s) => istek.includes(s.kimlik));
}
const fontlar = async () => {
  for (const w of [500, 600, 700]) await document.fonts.load(`${w} 40px Fredoka`);
};
const kurulum = (sahneler: Sahne[]) => kur({ seri, bolum: kisa, sahneler, tuval, sesAdresi });

if (q.has('kayit')) {
  // ---------------------------------------------------------------- YouTube kaydı (kare kare)
  const [W, H] = (q.get('boy') ?? '1920x1080').split('x').map(Number);
  let k!: Kurulum, s!: Surucu, wav: Uint8Array | null = null;
  const hazir = (async () => {
    await fontlar();
    k = await kurulum(sahneSec());
    k.oynatici.boyutla(W, H, 1);
    k.oynatici.altyaziGoster = false;
    s = new Surucu(k);
  })();
  window.film2Kayit = {
    hazir,
    fps: FPS,
    kareSayisi: () => Math.round(k.toplam * FPS),
    sure: () => k.toplam,
    kare: (i) => {
      s.git(i / FPS, 1 / FPS);
      s.ciz();
    },
    png: () => tuval.toDataURL('image/png'),
    async sesHazirla() {
      wav = wavBayt(await karisimIsle(k.plan));
      return wav.length;
    },
    sesParca(bas, boy) {
      const p = wav!.subarray(bas, bas + boy);
      let x = '';
      for (let i = 0; i < p.length; i += 0x8000) x += String.fromCharCode(...p.subarray(i, i + 0x8000));
      return btoa(x);
    },
    srt: () => srtYaz(k.altyazi),
    eksikler: () => [...k.eksik].sort(),
    hatalar: () => dogrula(seri, bolum),
  };
} else if (q.has('kapak')) {
  // ---------------------------------------------------------------- YouTube kapağı (1280×720)
  const hazir = (async () => {
    await fontlar();
    if (!bolum.kapak) throw new Error('bölümde kapak yok');
    const k = await kurulum([bolum.kapak]);
    k.oynatici.boyutla(1280, 720, 1);
    k.oynatici.altyaziGoster = false;
    const p = k.parcalar[0];
    p.vurgu = true;
    p.karanlik = () => 0;
    const s = new Surucu(k);
    const an = bolum.kapak.an ?? 1.5;
    for (let i = 0; i <= Math.round(an * FPS); i++) s.git(i / FPS);
    s.ciz();
    if (q.has('kilavuz')) {
      const c = tuval.getContext('2d')!;
      c.setTransform(1, 0, 0, 1, 0, 0);
      kilavuzCiz(c, 1280, 720, false);
    }
    kok.dataset.durum = 'hazir';
  })();
  window.film2Kapak = { hazir, png: () => tuval.toDataURL('image/png') };
  tuval.style.width = '100%';
} else void onizleme();

// ---------------------------------------------------------------- önizleme (geliştirme)
async function onizleme() {
  const durum = document.createElement('div');
  durum.className = 'f2-durum';
  durum.textContent = 'Yükleniyor…';
  kok.append(durum);
  await fontlar();
  const k = await kurulum(sahneSec());
  const s = new Surucu(k);
  const hatalar = dogrula(seri, bolum);
  const eksikler = [...k.eksik].sort();
  let oynuyor = false;
  let ses: AudioContext | null = null;
  let durdur: (() => void) | null = null;
  let sifir = 0, basT = 0, onceki = 0;
  const kilavuz = q.has('kilavuz');
  k.oynatici.altyaziGoster = q.get('altyazi') !== '0';

  const cubuk = document.createElement('div');
  cubuk.className = 'f2-cubuk';
  const oynat = document.createElement('button');
  oynat.textContent = '▶';
  oynat.setAttribute('aria-label', 'Oynat');
  const kaydir = document.createElement('input');
  kaydir.type = 'range';
  kaydir.min = '0';
  kaydir.max = String(k.toplam);
  kaydir.step = String(1 / FPS);
  const saatYazi = document.createElement('span');
  const sec = document.createElement('select');
  for (const [d, ad] of [['tum', 'Bütün bölüm'], ...bolumParcalari(seri, bolum).map((x) => [x.kimlik, `${x.kimlik} · ${x.ad}`])]) {
    const o = document.createElement('option');
    o.value = d;
    o.textContent = ad;
    o.selected = (q.get('parca') ?? 'tum') === d;
    sec.append(o);
  }
  sec.addEventListener('change', () => {
    q.set('parca', sec.value);
    q.delete('t');
    location.search = q.toString();
  });
  const altyaziD = document.createElement('label');
  const ak = document.createElement('input');
  ak.type = 'checkbox';
  ak.checked = k.oynatici.altyaziGoster;
  ak.addEventListener('change', () => {
    k.oynatici.altyaziGoster = ak.checked;
    ciz();
  });
  altyaziD.append(ak, ' altyazı');
  const eksikD = document.createElement('button');
  eksikD.textContent = `Eksikler (${eksikler.length})${hatalar.length ? ` · ${hatalar.length} HATA` : ''}`;
  const panel = document.createElement('pre');
  panel.className = 'f2-panel';
  panel.hidden = true;
  panel.textContent = [...hatalar.map((h) => `HATA: ${h}`), ...eksikler].join('\n') || 'Eksik yok.';
  eksikD.addEventListener('click', () => (panel.hidden = !panel.hidden));
  cubuk.append(oynat, kaydir, saatYazi, sec, altyaziD, eksikD);
  kok.append(cubuk, panel);
  durum.remove();

  function ciz() {
    s.ciz();
    if (kilavuz) {
      const c = tuval.getContext('2d')!;
      c.setTransform(k.oynatici.dpr, 0, 0, k.oynatici.dpr, 0, 0);
      kilavuzCiz(c, k.oynatici.W, k.oynatici.H, s.T > k.toplam - 20.5);
    }
  }
  const boyutla = () => {
    const W = Math.min(window.innerWidth, (window.innerHeight - 56) * (16 / 9));
    k.oynatici.boyutla(W, (W * 9) / 16, Math.min(2, window.devicePixelRatio || 1));
    ciz();
  };
  const yaz = () => {
    const T = s.T, m = Math.floor(T / 60);
    saatYazi.textContent = `${m}:${(T - m * 60).toFixed(1).padStart(4, '0')} / ${Math.floor(k.toplam / 60)}:${Math.round(k.toplam % 60)
      .toString()
      .padStart(2, '0')} · ${k.parcalar[s.i]?.ad ?? ''}`;
    kaydir.value = String(T);
  };
  const atla = (T: number) => {
    s.git(Math.max(0, Math.min(k.toplam - 1e-3, T)), 1 / FPS, true);
    ciz();
    yaz();
  };
  const sesBasla = async () => {
    durdur?.();
    if (!ses) return;
    basT = s.T;
    sifir = ses.currentTime + 0.12;
    durdur = await karisimKur(ses, k.plan, ses.destination, basT, sifir);
  };
  const dongu = (simdi: number) => {
    if (!oynuyor) return;
    const T = ses ? basT + Math.max(0, ses.currentTime - sifir) : s.T + Math.min(0.1, (simdi - onceki) / 1000);
    onceki = simdi;
    if (T >= k.toplam) {
      oynuyor = false;
      oynat.textContent = '▶';
      durdur?.();
      return;
    }
    if (T > s.T) s.ilerle(T);
    ciz();
    yaz();
    requestAnimationFrame(dongu);
  };
  oynat.addEventListener('click', async () => {
    oynuyor = !oynuyor;
    oynat.textContent = oynuyor ? '❚❚' : '▶';
    if (!oynuyor) {
      durdur?.();
      durdur = null;
      return;
    }
    ses ??= new AudioContext();
    await ses.resume();
    await sesBasla();
    onceki = performance.now();
    requestAnimationFrame(dongu);
  });
  kaydir.addEventListener('input', () => {
    atla(Number(kaydir.value));
    if (oynuyor) void sesBasla();
  });
  window.addEventListener('resize', boyutla);
  window.film2 = { saat: () => s.T, parca: () => k.parcalar[s.i]?.ad, eksikler: () => eksikler, hatalar: () => hatalar };
  boyutla();
  atla(Number(q.get('t') ?? 0));
  kok.dataset.durum = 'hazir';
}
