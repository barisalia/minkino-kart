/**
 * Yeni Kino kesme kuklasının deneme klibi (yalnız geliştirme: /film/kukla-test.html). ~14 sn, parkta:
 * yürüyerek gelir (kameraya doğru), durur ve göz kırpar, konuşur (ağız kaydın ses zarfıyla), güler, el sallar,
 * zıplar ("Yaşasın!"). Kulak, kuyruk ve eller yaylı (gecikme ve sallanma).
 *
 * Kayıt: scripts/film/kukla-kayit.mjs sayfayı ?kayit=1 ile açar, window.kuklaTest.kare(i) ile kare kare çizdirir.
 * Normal açılışta gerçek zamanlı oynar (tıklayınca sesli baştan).
 */
import { aralik, Kukla, tasan, type KuklaIskelet, type Matris } from './kukla';
import { bacakKur, Ikincil, yuruyusPozu } from './kukla-hareket';
import { konusmaAgzi, konusmaGucu, zarfCikar, type Zarf } from './kukla-ses';
import iskeletJson from '../../assets/karakter/kino-yeni/kino-yeni.json';

const GORSEL = import.meta.glob<string>('../../assets/karakter/kino-yeni/*.webp', { eager: true, query: '?url', import: 'default' });
const PARK = import.meta.glob<string>('../../assets/film/park/*.webp', { eager: true, query: '?url', import: 'default' });
const iskelet = iskeletJson as unknown as KuklaIskelet;

const FPS = 30;
const SURE = 14;
const GEN = 844, YUK = 390;
const SESLER = [
  { dosya: 'ses/kino/54b576605cca7c.mp3', metin: 'Kaydırak! Kaydırak!', t: 4.75 },
  { dosya: 'ses/kino/d27a032e541b12.mp3', metin: 'Yaşasın!', t: 11.85 },
];

// ---------- klip ----------
const ADIM_SAYISI = 9, ADIM_T = 0.42, YURU_BAS = 0.25, YURU_SON = YURU_BAS + ADIM_SAYISI * ADIM_T;
/** sahnedeki yer (css px) ve ölçek: kameraya doğru gelir */
const BAS = { x: 470, y: 313, o: 0.074 }, SON = { x: 432, y: 374, o: 0.128 };

/** yürüyüş ilerleyişi 0..1: ilk ve son adımda hızlanıp yavaşlar */
function ilerle(u: number) {
  const N = ADIM_SAYISI, r = 0.8;
  const v = (x: number) => (x < r ? x / r : x > N - r ? (N - x) / r : 1);
  // hız eğrisinin integrali (sayısal, ince adım)
  let s = 0, top = 0;
  for (let x = 0; x < N; x += 0.01) {
    const d = v(x) * 0.01;
    top += d;
    if (x < u) s += d;
  }
  return Math.min(1, s / top);
}

function gozKirp(t: number, anlar: number[]): string | null {
  for (const a of anlar) {
    const d = t - a;
    if (d < 0 || d > 0.2) continue;
    return d < 0.05 ? 'gozler-yari' : d < 0.14 ? 'gozler-kapali' : 'gozler-yari';
  }
  return null;
}

interface Sahne {
  x: number;
  y: number;
  o: number;
  /** zıplama yüksekliği (kare birimi, + yukarı) */
  hava: number;
}

/** t anındaki temel poz (yaysız) */
function temelPoz(k: Kukla, t: number, sesler: Zarf[]): Sahne {
  k.poz = {};
  const P = k.poz;
  const sec = k.secim;
  sec.gozler = 'gozler-acik';
  sec.kaslar = 'kaslar-notr';
  sec.agiz = 'agiz-gulumse';
  // kollar dinlenmede hafif dışa açık değil: kaynak çizimdeki gibi
  let kolSag = 0, kolSol = 0, dirsekSag = 0, dirsekSol = 0;
  let kalcaY = 0, kalcaA = 0, kalcaX = 0, govdeA = 0, kafaA = 0, kafaY = 0, kuyruk = 0;
  let govdeSy = 1;
  const ayak = { sag: { x: 0, y: 0 } as { x: number; y: number; egim?: number; olcek?: number }, sol: { x: 0, y: 0 } as { x: number; y: number; egim?: number; olcek?: number } };
  let hava = 0;

  // sahnedeki yer
  const u = Math.max(0, Math.min(ADIM_SAYISI, (t - YURU_BAS) / ADIM_T));
  const s = ilerle(u);
  const sahne: Sahne = { x: BAS.x + (SON.x - BAS.x) * s, y: BAS.y + (SON.y - BAS.y) * s, o: BAS.o + (SON.o - BAS.o) * s, hava: 0 };

  // 1) yürüyüş
  if (t >= YURU_BAS && t < YURU_SON) {
    const genlik = Math.min(1, u / 0.7, (ADIM_SAYISI - u) / 0.7);
    // bir adımda kökün yolu (kare birimi): ekrandaki yol / ölçek
    const adim: [number, number] = [((SON.x - BAS.x) / ADIM_SAYISI / sahne.o) * 0.9, ((SON.y - BAS.y) / ADIM_SAYISI / sahne.o) * 0.9];
    const w = yuruyusPozu(u, adim, genlik);
    ayak.sag = w.ayak.sag;
    ayak.sol = w.ayak.sol;
    kalcaY += w.kalcaY;
    kalcaA += w.kalcaA;
    kalcaX += w.kalcaX;
    govdeA -= w.kalcaA * 0.6;
    kafaA -= w.kalcaA * 0.5;
    kolSag += 3 * genlik - 12 * w.kolSalla;
    kolSol += -3 * genlik - 12 * w.kolSalla;
    dirsekSag += -8 - 10 * Math.max(0, w.kolSalla);
    dirsekSol += 8 + 10 * Math.max(0, -w.kolSalla);
    kuyruk += 10 * Math.sin(2 * Math.PI * u * 0.5);
  }
  // 2) durma: gövde bir kez çöküp toparlanır
  const dur = aralik(t, YURU_SON - 0.05, YURU_SON + 0.5);
  if (t >= YURU_SON - 0.05 && t < YURU_SON + 0.7) {
    const d = (t - YURU_SON + 0.05) / 0.6;
    kalcaY += 14 * Math.sin(Math.PI * Math.min(1, d)) * (1 - dur * 0.3);
    govdeA += -1.5 * Math.sin(Math.PI * Math.min(1, d));
  }
  // nefes
  const nefes = Math.sin(2 * Math.PI * t * 0.35);
  govdeSy += 0.006 * nefes;
  kafaY += -3 * nefes;

  // 3) konuşma: kaydırağı gösterir (sağ kol, ekranın soluna), bakış oraya
  const konusBas = 4.55, konusSon = 6.55;
  const g = aralik(t, konusBas, konusBas + 0.35) * (1 - aralik(t, konusSon - 0.1, konusSon + 0.35));
  if (g > 0) {
    kolSag += 58 * tasan(g, 1.2);
    dirsekSag += -10 * g;
    kafaA += -5 * g;
    govdeA += -2 * g;
    if (t > konusBas + 0.1 && t < konusSon) sec.gozler = 'gozler-sola';
    sec.kaslar = 'kaslar-kalkik';
  }
  const guc = konusmaGucu(sesler, t);
  kafaY += -10 * guc;
  kafaA += 2.5 * Math.sin(t * 9) * guc;

  // 4) gülme: gözler mutlu, ağız kahkaha, gövde hoplar
  const gulBas = 6.75, gulSon = 8.45;
  if (t >= gulBas && t < gulSon) {
    const gg = aralik(t, gulBas, gulBas + 0.2) * (1 - aralik(t, gulSon - 0.25, gulSon));
    const ha = Math.sin(2 * Math.PI * 4.6 * (t - gulBas));
    sec.gozler = 'gozler-mutlu';
    sec.kaslar = 'kaslar-kalkik';
    sec.agiz = ha > -0.2 ? 'agiz-kahkaha' : 'agiz-genis';
    if (t > gulSon - 0.2) sec.agiz = 'agiz-genis';
    kalcaY += 10 * Math.abs(ha) * gg;
    govdeA += 2.5 * ha * gg;
    kafaA += -4 * gg + 3 * ha * gg;
    kafaY += -8 * Math.abs(ha) * gg;
    kolSag += -5 * gg + 3 * ha * gg;
    kolSol += 5 * gg - 3 * ha * gg;
    dirsekSag += -55 * gg;
    dirsekSol += 55 * gg;
    govdeSy += 0.02 * Math.abs(ha) * gg;
  }

  // 5) el sallama (sağ kol, ekranın solunda)
  const sallaBas = 8.7, sallaSon = 11.05;
  if (t >= sallaBas - 0.2 && t < sallaSon + 0.6) {
    const kalk = tasan(aralik(t, sallaBas, sallaBas + 0.45), 1.4) * (1 - tasan(aralik(t, sallaSon, sallaSon + 0.5), 0.9));
    const hazirlik = Math.sin(Math.PI * aralik(t, sallaBas - 0.2, sallaBas + 0.05)) * (t < sallaBas + 0.05 ? 1 : 0);
    const dalga = Math.sin(2 * Math.PI * 2.3 * (t - sallaBas - 0.3)) * aralik(t, sallaBas + 0.3, sallaBas + 0.5) * (1 - aralik(t, sallaSon - 0.2, sallaSon));
    kolSag += -8 * hazirlik + 95 * kalk;
    dirsekSag += 55 * kalk + 26 * dalga * kalk;
    kafaA += 4 * kalk;
    govdeA += 2 * kalk;
    kalcaA += 1 * kalk;
    if (kalk > 0.3) {
      sec.agiz = 'agiz-genis';
      sec.kaslar = 'kaslar-kalkik';
    }
    if (t > sallaBas + 0.9 && t < sallaSon - 0.4) sec.agiz = 'agiz-orta';
  }

  // 6) zıplama: hazırlık (çömel), kalkış (uza), havada, iniş (ez), toparlan
  const zHaz = 11.5, zKalk = 11.82, zIn = 12.42, zSon = 13.1;
  if (t >= zHaz && t < zSon + 0.3) {
    const comel = Math.sin(Math.PI * aralik(t, zHaz, zKalk)) * 0.5 + (t < zKalk ? aralik(t, zHaz, zKalk) * 0.5 : 0);
    if (t < zKalk) {
      kalcaY += 55 * comel;
      govdeSy -= 0.06 * comel;
      kolSag += -10 * comel;
      kolSol += 10 * comel;
      sec.gozler = 'gozler-mutlu';
    } else if (t < zIn) {
      const tau = (t - zKalk) / (zIn - zKalk);
      hava = 340 * 4 * tau * (1 - tau);
      govdeSy += 0.07 * (1 - tau) - 0.02 * tau;
      ayak.sag = { x: -6, y: -26 * Math.sin(Math.PI * tau), egim: -8 * Math.sin(Math.PI * tau) };
      ayak.sol = { x: 6, y: -26 * Math.sin(Math.PI * tau), egim: 8 * Math.sin(Math.PI * tau) };
      kolSag += 55 * Math.sin(Math.PI * Math.min(1, tau * 1.3));
      kolSol += -55 * Math.sin(Math.PI * Math.min(1, tau * 1.3));
      dirsekSag += 20 * Math.sin(Math.PI * tau);
      dirsekSol += -20 * Math.sin(Math.PI * tau);
      sec.gozler = tau < 0.75 ? 'gozler-mutlu' : 'gozler-acik';
      sec.kaslar = 'kaslar-kalkik';
    } else {
      const d = (t - zIn) / (zSon - zIn);
      const ez = Math.sin(Math.PI * Math.min(1, d * 1.6)) * Math.exp(-d * 2);
      kalcaY += 60 * ez;
      govdeSy -= 0.07 * ez;
      kolSag += 12 * ez;
      kolSol += -12 * ez;
    }
  }

  // göz kırpma
  const kirp = gozKirp(t, [1.9, 4.45, 6.2, 10.15, 13.45]);
  if (kirp && sec.gozler !== 'gozler-mutlu') sec.gozler = kirp === 'gozler-yari' && sec.gozler === 'gozler-sola' ? 'gozler-yari' : kirp;

  // konuşma ağzı her şeyin üstünde
  const ka = konusmaAgzi(sesler, t);
  if (ka) {
    sec.agiz = ka;
    if (guc > 0.75) sec.kaslar = 'kaslar-kalkik';
  }
  if (t >= 12.6 && t < 13.2 && !ka) sec.agiz = 'agiz-genis';

  // kuyruk hep biraz sallanır (mutlu köpek)
  kuyruk += 9 * Math.sin(2 * Math.PI * 1.6 * t) + (t > 6.7 && t < 8.5 ? 10 * Math.sin(2 * Math.PI * 4 * t) : 0) + (t > 11.4 ? 8 * Math.sin(2 * Math.PI * 3.2 * t) : 0);

  // pozu yaz
  P.kalca = { a: kalcaA, x: kalcaX, y: kalcaY };
  P.govde = { a: govdeA, sx: 1 + (1 - govdeSy) * 0.5, sy: govdeSy };
  P.kafa = { a: kafaA, y: kafaY };
  P.kuyruk = { a: kuyruk };
  P['kol-ust-sag'] = { a: kolSag };
  P['kol-ust-sol'] = { a: kolSol };
  // kol kalktıkça kolun üst kenar çizgisi belirir (dinlenmede tişört omzu dikişsiz)
  const dikis = (a: number) => ({ o: Math.max(0, Math.min(1, (Math.abs(a) - 6) / 18)) });
  P['kol-ust-sag-dikis'] = dikis(kolSag);
  P['kol-ust-sol-dikis'] = dikis(kolSol);
  P['kol-alt-sag'] = { a: dirsekSag };
  P['kol-alt-sol'] = { a: dirsekSol };
  bacakKur(k, 'sag', ayak.sag, kalcaA, kalcaY);
  bacakKur(k, 'sol', ayak.sol, kalcaA, kalcaY);
  sahne.hava = hava;
  return sahne;
}

// ---------- sahne çizimi ----------
const tuval = document.getElementById('sahne') as HTMLCanvasElement;
const DPR = Math.max(1, Math.min(3, Math.round(window.devicePixelRatio || 1)));
tuval.width = GEN * DPR;
tuval.height = YUK * DPR;
tuval.style.width = `${GEN}px`;
tuval.style.height = `${YUK}px`;
const ctx = tuval.getContext('2d')!;

const resim = async (a: string) => {
  const i = new Image();
  i.src = a;
  await i.decode();
  return i;
};
const kukla = new Kukla(iskelet, (d) => GORSEL[`../../assets/karakter/kino-yeni/${d}`]);
let arka: HTMLImageElement[] = [];
let sesler: Zarf[] = [];
const ikincil = { y: new Ikincil(), son: -1 };

function arkaCiz() {
  // 16:9 park katmanları, 844×390'ı kaplar (alt kısım: çimen)
  const h = GEN * (9 / 16);
  const y = -(h - YUK) * 0.72;
  for (const i of arka) ctx.drawImage(i, 0, y * DPR, GEN * DPR, h * DPR);
}

function kareCiz(i: number) {
  const dt = 1 / FPS;
  // yaylar sırayla: geri sarılırsa baştan
  if (i <= ikincil.son) {
    ikincil.y = new Ikincil();
    ikincil.son = -1;
  }
  let sahne: Sahne | null = null;
  for (let j = ikincil.son + 1; j <= i; j++) {
    const t = j * dt;
    sahne = temelPoz(kukla, t, sesler);
    ikincil.y.adim(kukla, [sahne.x / sahne.o, sahne.y / sahne.o - sahne.hava], dt);
  }
  ikincil.son = i;
  if (!sahne) sahne = temelPoz(kukla, i * dt, sesler);
  ikincil.y.uygula(kukla);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, tuval.width, tuval.height);
  arkaCiz();
  // gölge: ayakların altında, havadayken küçülür
  const zemin = iskelet.zemin, ortaX = 845;
  const golgeO = 1 - Math.min(0.5, sahne.hava / 600);
  ctx.save();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = `rgba(40, 70, 20, ${0.22 * golgeO})`;
  ctx.beginPath();
  ctx.ellipse(sahne.x, sahne.y - 4 * sahne.o, 560 * sahne.o * golgeO, 70 * sahne.o * golgeO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const o = sahne.o * DPR;
  const taban: Matris = [o, 0, 0, o, sahne.x * DPR - ortaX * o, (sahne.y - 0) * DPR - (zemin + sahne.hava) * o];
  kukla.ciz(ctx, taban);
}

const kayit = new URLSearchParams(location.search).has('kayit');
const hazir = (async () => {
  arka = await Promise.all(['arka-uzak', 'arka-on', 'arka-orta-2'].map((a) => resim(PARK[`../../assets/film/park/${a}.webp`])));
  await kukla.yukle();
  const taban = import.meta.env.BASE_URL;
  sesler = await Promise.all(SESLER.map((s) => zarfCikar(`${taban}${s.dosya}`, s.metin, s.t)));
})();

declare global {
  interface Window {
    kuklaTest: { hazir: Promise<void>; kare: (i: number) => void; fps: number; sure: number; sesler: typeof SESLER };
  }
}
window.kuklaTest = { hazir, kare: kareCiz, fps: FPS, sure: SURE, sesler: SESLER };

if (!kayit) {
  void hazir.then(() => {
    let bas = performance.now();
    const caliyor: HTMLAudioElement[] = [];
    tuval.addEventListener('click', () => {
      bas = performance.now();
      ikincil.son = -1;
      ikincil.y = new Ikincil();
      for (const a of caliyor) a.pause();
      caliyor.length = 0;
      for (const s of SESLER) {
        const a = new Audio(`${import.meta.env.BASE_URL}${s.dosya}`);
        caliyor.push(a);
        setTimeout(() => void a.play(), s.t * 1000);
      }
    });
    const dongu = () => {
      const t = ((performance.now() - bas) / 1000) % SURE;
      kareCiz(Math.floor(t * FPS));
      requestAnimationFrame(dongu);
    };
    requestAnimationFrame(dongu);
  });
}
