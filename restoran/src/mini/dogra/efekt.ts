/**
 * P2 mini oyunlarının ortak hareketleri: parçacık (damla, çekirdek, kabuk, yaprak, buhar, yağ), leke, ezilme-esneme,
 * parıltı, küçük müzik cümleleri (tıkır tıkır ödül ölçüsü, Babaanne'nin mırıltı ritmi, Mino'nun sümkürmesi).
 * Yalnız transform / opacity; parça döndürme yok (§7c). Test modunda kısa; "az hareket" ayarında parçacık yok.
 */
import { baglam, efektCikisi } from '../../../../src/audio/motor';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import { azHareket } from '../../../../src/ui/hareket';
import { efektResmi } from './gorsel';

const tam = () => !azHareket();
const sureMs = (ms: number) => (TEST_MODU ? Math.min(ms, 60) : ms);

/** Ezilme-esneme (scaleY 0.92 → 1.06 → 1; 120-160 ms). guc: 1 normal, 2 kuvvetli (şlap) */
export function ezil(el: HTMLElement, guc = 1, ms = 160) {
  if (!el.isConnected) return;
  const a = 0.08 * guc;
  try {
    el.animate(
      [
        { transform: 'scale(1,1)' },
        { transform: `scale(${1 + a},${1 - a})`, offset: 0.3 },
        { transform: `scale(${1 - a * 0.5},${1 + a * 0.6})`, offset: 0.65 },
        { transform: 'scale(1,1)' },
      ],
      { duration: sureMs(ms * (guc > 1 ? 1.4 : 1)), easing: 'ease-out', composite: 'add' },
    );
  } catch {
    /* eski tarayıcı */
  }
}

/** Hop: yukarı sıçra, ezilerek in */
export function hopla(el: HTMLElement, yuk = 14, ms = 320) {
  try {
    el.animate(
      [
        { transform: 'translateY(0) scale(1,1)' },
        { transform: 'translateY(0) scale(1.08,0.9)', offset: 0.15 },
        { transform: `translateY(${-yuk}px) scale(0.95,1.07)`, offset: 0.5 },
        { transform: 'translateY(0) scale(1.06,0.93)', offset: 0.85 },
        { transform: 'translateY(0) scale(1,1)' },
      ],
      { duration: sureMs(ms), easing: 'ease-out', composite: 'add' },
    );
  } catch {
    /* yok say */
  }
}

/** Kıpırda: yerinde iki yana sallan (döndürmeden) */
export function kipirda(el: HTMLElement, px = 4, ms = 260) {
  try {
    el.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${-px}px)` }, { transform: `translateX(${px}px)` }, { transform: `translateX(${-px / 2}px)` }, { transform: 'translateX(0)' }],
      { duration: sureMs(ms), easing: 'ease-in-out', composite: 'add' },
    );
  } catch {
    /* yok say */
  }
}

export type ParcacikTur = 'damla' | 'cekirdek' | 'kabuk' | 'yaprak' | 'buhar' | 'yag' | 'kopuk' | 'un';

/**
 * (x, y) noktasından parçacık saçar (kap içi px). yon: ana atılış yönü (radyan; yoksa her yöne), guc: hız çarpanı.
 * yerdeKal: düşen parçacık yerde kalır (tahtada çekirdek); yoksa söner.
 */
export function sac(kap: HTMLElement, x: number, y: number, tur: ParcacikTur, renk: string, adet = 8, s: { yon?: number; yay?: number; guc?: number; boy?: number; yerdeKal?: boolean; yercekim?: boolean } = {}): HTMLElement[] {
  if (!tam() || TEST_MODU) adet = Math.min(adet, s.yerdeKal ? adet : 2);
  const kalanlar: HTMLElement[] = [];
  const resim = tur === 'buhar' ? efektResmi('buhar') : tur === 'damla' ? null : null;
  for (let i = 0; i < adet; i++) {
    const boy = (s.boy ?? (tur === 'buhar' ? 26 : tur === 'yaprak' ? 11 : tur === 'kabuk' ? 16 : 8)) * (0.7 + Math.random() * 0.6);
    const el = h('i.rs-p2-parcacik', { 'data-tur': tur });
    el.style.width = `${boy}px`;
    el.style.height = `${tur === 'cekirdek' ? boy * 0.62 : tur === 'kabuk' ? boy * 0.7 : boy}px`;
    if (tur !== 'buhar') el.style.background = renk;
    if (resim) {
      el.style.background = `center / contain no-repeat url("${resim}")`;
    }
    el.style.marginLeft = `${-boy / 2}px`;
    el.style.marginTop = `${-boy / 2}px`;
    kap.append(el);
    const a = s.yon !== undefined ? s.yon + (Math.random() - 0.5) * (s.yay ?? 1.2) : Math.random() * Math.PI * 2;
    const v = (s.guc ?? 1) * (40 + Math.random() * 60);
    const dx = Math.cos(a) * v;
    const dy = Math.sin(a) * v;
    const dus = s.yercekim === false || tur === 'buhar' ? 0 : 50 + Math.random() * 30;
    const ms = sureMs(tur === 'buhar' ? 900 + Math.random() * 400 : 420 + Math.random() * 260);
    const son = s.yerdeKal ? 1 : 0;
    const k: Keyframe[] =
      tur === 'buhar'
        ? [
            { transform: `translate(${x}px,${y}px) scale(0.4)`, opacity: 0 },
            { transform: `translate(${x + dx * 0.2}px,${y - 18}px) scale(0.9)`, opacity: 0.85, offset: 0.3 },
            { transform: `translate(${x + dx * 0.4}px,${y - 60 - Math.random() * 30}px) scale(1.3)`, opacity: 0 },
          ]
        : [
            { transform: `translate(${x}px,${y}px) scale(0.6)`, opacity: 1 },
            { transform: `translate(${x + dx * 0.55}px,${y + dy * 0.55 - 6}px) scale(1)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${x + dx}px,${y + dy + dus}px) scale(${s.yerdeKal ? 0.9 : 0.7})`, opacity: son },
          ];
    try {
      const an = el.animate(k, { duration: ms, easing: tur === 'buhar' ? 'ease-out' : 'cubic-bezier(.25,.6,.5,1)', fill: 'forwards' });
      if (s.yerdeKal) {
        kalanlar.push(el);
        an.finished.then(
          () => {
            el.style.transform = `translate(${x + dx}px,${y + dy + dus}px) scale(0.9)`;
            an.cancel();
          },
          () => undefined,
        );
      } else
        an.finished.then(
          () => el.remove(),
          () => el.remove(),
        );
    } catch {
      if (!s.yerdeKal) el.remove();
    }
  }
  return kalanlar;
}

/** Tahtada kalan leke (domates suyu): kap içi px */
export function leke(kap: HTMLElement, x: number, y: number, renk: string, boy = 46): HTMLElement {
  const el = h('i.rs-p2-leke');
  el.style.cssText = `left:${x - boy / 2}px;top:${y - boy * 0.35}px;width:${boy}px;height:${boy * 0.7}px;background:${renk}`;
  kap.prepend(el);
  try {
    el.animate([{ transform: 'scale(0.2)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 0.6, offset: 0.6 }, { transform: 'scale(1)', opacity: 0.55 }], { duration: sureMs(260), easing: 'ease-out' });
  } catch {
    /* yok say */
  }
  return el;
}

/** Tek parıltı: dört köşeli yıldızlar (kap içi px) */
export function parilti(kap: HTMLElement, x: number, y: number, adet = 6, yaricap = 40) {
  if (!tam()) return;
  for (let i = 0; i < adet; i++) {
    const boy = 12 + Math.random() * 14;
    const el = h('i.rs-p2-yildiz');
    el.style.width = el.style.height = `${boy}px`;
    el.style.margin = `${-boy / 2}px 0 0 ${-boy / 2}px`;
    kap.append(el);
    const a = (i / adet) * Math.PI * 2 + Math.random() * 0.6;
    const r = yaricap * (0.6 + Math.random() * 0.6);
    try {
      el.animate(
        [
          { transform: `translate(${x}px,${y}px) scale(0)`, opacity: 0 },
          { transform: `translate(${x + Math.cos(a) * r * 0.5}px,${y + Math.sin(a) * r * 0.5}px) scale(1.15)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${x + Math.cos(a) * r}px,${y + Math.sin(a) * r}px) scale(0)`, opacity: 0 },
        ],
        { duration: sureMs(560 + Math.random() * 200), delay: Math.random() * 80, easing: 'ease-out', fill: 'backwards' },
      ).finished.then(
        () => el.remove(),
        () => el.remove(),
      );
    } catch {
      el.remove();
    }
  }
}

/** Bir elemanı kap içinde (x, y) px'ten (x2, y2)'ye kavisle uçurur (döndürmeden); bitince söz */
export function ucur(el: HTMLElement, dx: number, dy: number, ms = 420, yukari = -50): Promise<void> {
  try {
    const a = el.animate(
      [
        { transform: 'translate(0,0) scale(1,1)' },
        { transform: `translate(${dx * 0.5}px,${dy * 0.5 + yukari}px) scale(0.96,1.05)`, offset: 0.5 },
        { transform: `translate(${dx}px,${dy}px) scale(1.04,0.95)` },
      ],
      { duration: sureMs(ms), easing: 'cubic-bezier(.4,.1,.5,1)', fill: 'forwards' },
    );
    return a.finished.then(
      () => undefined,
      () => undefined,
    );
  } catch {
    return Promise.resolve();
  }
}

// ------------------------------------------------------------------ küçük müzik cümleleri (Web Audio, dosya yok)

function hazir(): [AudioContext, GainNode] | null {
  const c = baglam();
  const o = efektCikisi();
  if (!c || !o || c.state !== 'running') return null;
  return [c, o];
}
const NOTA = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
function nota(n: number, bas: number, sure: number, tip: OscillatorType = 'triangle', ses = 0.12, kay?: number) {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  const t = c.currentTime + bas;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(NOTA(n), t);
  if (kay) o.frequency.exponentialRampToValueAtTime(NOTA(n + kay), t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}

/** "Tıkır tıkır" ödül ölçüsü: ksilofon gibi sekiz nota (bir ölçü) */
export function tikirTikir() {
  const dizi = [72, 76, 79, 76, 77, 81, 84, 79];
  dizi.forEach((n, i) => nota(n, i * 0.11, 0.16, 'triangle', 0.11));
  nota(84, 0.9, 0.4, 'sine', 0.1);
}

/** Mino'nun sümkürmesi: gürültülü bir "trööt" */
export function sumkur() {
  nota(50, 0, 0.32, 'sawtooth', 0.07, 4);
  nota(57, 0.02, 0.3, 'square', 0.035, 3);
  nota(62, 0.34, 0.12, 'triangle', 0.06, -5);
}

/** Hıçkırarak gülme: kısa yükselen hıçkırık + kıkırdama */
export function hickir() {
  nota(74, 0, 0.08, 'sine', 0.12, 5);
  [79, 81, 79, 81].forEach((n, i) => nota(n, 0.25 + i * 0.09, 0.07, 'triangle', 0.07));
}

/** Babaanne'nin mırıltısı: maydanoz ritmi. Vuruş notası (yumuşak sinüs, küçük titreşim) */
export function mirilti(i: number) {
  const ezgi = [67, 69, 71, 69, 67, 64, 67, 69];
  nota(ezgi[i % ezgi.length], 0, 0.28, 'sine', 0.07);
}
/** Ritme uyan vuruşta küçük "ting" */
export function ritimTing(i: number) {
  nota(84 + (i % 3) * 2, 0, 0.18, 'sine', 0.08);
}
/** Tavaya yapışma "tak" */
export function tak() {
  nota(45, 0, 0.12, 'triangle', 0.18, -3);
}

/** Dokunsal ritim: yoksa boş */
export const TITRESIM = { kesim: 12, slap: 20, centik: 8, hafif: 6 } as const;
