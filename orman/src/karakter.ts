/**
 * Canlı karakter: aynı çizimin ifadeleri (uyuyor, esniyor, mutlu, dinliyor, hmm, göz kırpma) üst üste durur,
 * aralarında yumuşak geçiş yapılır; gövde hareketleri (nefes, esneme, zıplama, kafa eğme) kodla verilir.
 * İfade görselleri: assets/orman-ifade/<ad>/<ifade>.webp (tasarımcılar Gemini ile üretir). Olmayan ifade
 * yerine normal çizim kullanılır, yani karakter her durumda çalışır.
 */
import { h } from '../../src/ui/dom';
import { adres, zzz } from './gorsel';

export type Ifade = 'normal' | 'uyuyor' | 'esniyor' | 'mutlu' | 'dinliyor' | 'hmm' | 'goz-kirpma';
const IFADELER: Ifade[] = ['normal', 'uyuyor', 'esniyor', 'mutlu', 'dinliyor', 'hmm', 'goz-kirpma'];

export interface KarakterSecenek {
  /** normal çizimin yolu (ör. 'orman-karakter/sincap') */
  resim: string;
  /** ifade klasörü adı (ör. 'sincap') */
  ad: string;
  /** dev gibi hiç uyanmayan karakter */
  uyanmaz?: boolean;
  /** uyuyarak başla */
  uyuyor?: boolean;
}

export interface Karakter {
  el: HTMLElement;
  uyu(): void;
  uyan(): Promise<void>;
  sevin(): Promise<void>;
  hmm(): Promise<void>;
  dokun(): Promise<void>;
  kipir(): Promise<void>;
  dinle(acik: boolean): void;
  readonly uyanik: boolean;
  kapat(): void;
}

function ifadeAdresi(s: KarakterSecenek, i: Ifade): string {
  const ozel = adres(`orman-ifade/${s.ad}/${i}`);
  if (ozel) return ozel;
  if (i === 'normal') return adres(s.resim);
  if (i === 'uyuyor') return adres(`${s.resim}-uyku`);
  return '';
}

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function karakter(s: KarakterSecenek): Karakter {
  const resimler = new Map<Ifade, HTMLImageElement>();
  const govde = h('div.or-kr-govde');
  for (const i of IFADELER) {
    const url = ifadeAdresi(s, i);
    if (!url) continue;
    const img = h('img.or-kr-ifade', { src: url, alt: '', draggable: 'false', 'data-ifade': i }) as HTMLImageElement;
    resimler.set(i, img);
    govde.append(img);
  }
  const hareket = h('div.or-kr-hareket', {}, govde);
  const golge = h('i.or-kr-golge');
  const z = zzz();
  const el = h('div.or-kr', { 'data-karakter': s.ad }, golge, hareket, z);
  if (!resimler.has('uyuyor')) el.classList.add('uyku-yedek');

  let uyanik = !s.uyuyor;
  let dinliyor = false;
  let mesgul = false;
  let kirpma = 0;
  let kapandi = false;

  const goster = (i: Ifade) => {
    const hedef = resimler.has(i) ? i : 'normal';
    resimler.forEach((img, k) => img.classList.toggle('aktif', k === hedef));
  };
  const dinlenme = (): Ifade => (!uyanik ? (s.uyanmaz && el.dataset.durum === 'mutlu' ? 'mutlu' : 'uyuyor') : dinliyor ? 'dinliyor' : 'normal');
  const oynat = (kf: Keyframe[], ms: number, hedef: HTMLElement = hareket) => hedef.animate(kf, { duration: ms, easing: 'ease-in-out' }).finished.catch(() => undefined);
  /** zorunlu: süren kısa hareket bitene kadar bekler (uyanma gibi atlanmaması gereken anlar) */
  const gorev = async (fn: () => Promise<void>, zorunlu = false) => {
    if (mesgul && !zorunlu) return;
    while (mesgul) await bekle(50);
    mesgul = true;
    try {
      await fn();
    } finally {
      mesgul = false;
      if (!kapandi) goster(dinlenme());
    }
  };

  // göz kırpma: uyanıkken 2.5-5 sn'de bir
  const kirp = () => {
    kirpma = window.setTimeout(async () => {
      if (kapandi) return;
      if (uyanik && !mesgul && resimler.has('goz-kirpma')) {
        goster('goz-kirpma');
        await bekle(110);
        if (!mesgul) goster(dinlenme());
      }
      kirp();
    }, 2500 + Math.random() * 2500);
  };
  kirp();

  el.dataset.durum = uyanik ? 'uyanik' : 'uyku';
  goster(dinlenme());

  const zipla = () =>
    Promise.all([
      oynat(
        [
          { transform: 'translateY(0) scale(1, 1)' },
          { transform: 'translateY(0) scale(1.12, 0.86)', offset: 0.15 },
          { transform: 'translateY(-26%) scale(0.92, 1.1)', offset: 0.45 },
          { transform: 'translateY(0) scale(1.14, 0.86)', offset: 0.72 },
          { transform: 'translateY(0) scale(0.96, 1.04)', offset: 0.86 },
          { transform: 'translateY(0) scale(1, 1)' },
        ],
        720,
      ),
      oynat([{ transform: 'scale(1)' }, { transform: 'scale(0.6)', opacity: 0.4, offset: 0.45 }, { transform: 'scale(1)' }], 720, golge),
    ]);

  return {
    el,
    get uyanik() {
      return uyanik;
    },
    uyu() {
      uyanik = false;
      el.dataset.durum = 'uyku';
      goster('uyuyor');
    },
    uyan: () =>
      gorev(async () => {
        if (s.uyanmaz) {
          // dev: uyumaya devam eder ama gülümser, renklenir
          el.dataset.durum = 'mutlu';
          goster('mutlu');
          await oynat([{ transform: 'scale(1)' }, { transform: 'scale(1.05, 0.95)' }, { transform: 'scale(0.98, 1.03)' }, { transform: 'scale(1)' }], 1200);
          return;
        }
        // esneme: gerinir, gözler kapalı ağız açık → silkelenir → mutlu zıplar
        goster(resimler.has('esniyor') ? 'esniyor' : 'uyuyor');
        el.dataset.durum = 'uyaniyor';
        await oynat(
          [
            { transform: 'translateY(0) scale(1, 1) rotate(0)' },
            { transform: 'translateY(0) scale(1.08, 0.9) rotate(0)', offset: 0.2 },
            { transform: 'translateY(-4%) scale(0.92, 1.14) rotate(-3deg)', offset: 0.55 },
            { transform: 'translateY(-4%) scale(0.93, 1.12) rotate(3deg)', offset: 0.75 },
            { transform: 'translateY(0) scale(1, 1) rotate(0)' },
          ],
          1300,
        );
        uyanik = true;
        el.dataset.durum = 'uyanik';
        goster('normal');
        // silkelenme
        await oynat(
          [{ transform: 'rotate(0)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }],
          420,
        );
        goster('mutlu');
        await zipla();
        await bekle(250);
      }, true),
    sevin: () =>
      gorev(async () => {
        goster(uyanik || s.uyanmaz ? 'mutlu' : 'uyuyor');
        await zipla();
        await bekle(200);
      }),
    hmm: () =>
      gorev(async () => {
        if (!uyanik) return;
        goster('hmm');
        await oynat(
          [{ transform: 'rotate(0)' }, { transform: 'rotate(-9deg) translateX(-3%)', offset: 0.35 }, { transform: 'rotate(-7deg) translateX(-3%)', offset: 0.7 }, { transform: 'rotate(0)' }],
          800,
        );
      }),
    dokun: () =>
      gorev(async () => {
        goster(uyanik || s.uyanmaz ? 'mutlu' : 'uyuyor');
        await oynat(
          [
            { transform: 'scale(1, 1) rotate(0)' },
            { transform: 'scale(1.1, 0.88) rotate(-4deg)', offset: 0.25 },
            { transform: 'scale(0.95, 1.06) rotate(4deg)', offset: 0.55 },
            { transform: 'scale(1.02, 0.98) rotate(-2deg)', offset: 0.8 },
            { transform: 'scale(1, 1) rotate(0)' },
          ],
          560,
        );
        await bekle(300);
      }),
    kipir: () =>
      gorev(async () => {
        await oynat(
          [
            { transform: 'rotate(0) scale(1)' },
            { transform: 'rotate(-4deg) scale(1.03, 0.97)', offset: 0.3 },
            { transform: 'rotate(3deg) scale(0.98, 1.02)', offset: 0.6 },
            { transform: 'rotate(0) scale(1)' },
          ],
          750,
        );
      }),
    dinle(acik) {
      if (dinliyor === acik) return;
      dinliyor = acik;
      el.classList.toggle('dinliyor', acik);
      if (!mesgul) goster(dinlenme());
    },
    kapat() {
      kapandi = true;
      clearTimeout(kirpma);
    },
  };
}
