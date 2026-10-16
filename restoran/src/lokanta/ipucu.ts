/**
 * İpucu merdiveni (§4c; lokanta ve istasyonlar ortak). Son dokunuştan itibaren sayılır:
 *   12 sn: dolaylı: hedef kendi kendine hafifçe kıpırdar (salonda müşteri mutfağa doğru koklar)
 *   20 sn: Mino durumu anlatır (emir değil): hedefin `soz`ü
 *   30 sn: hedef bir kez yumuşakça parlar
 *   40 sn: yarı saydam minik el hareketi bir kez gösterir
 *   asla: "şuna dokun", ok, sürekli parlayan hedef.
 * İlk oyunun ilk iki müşterisinde 30 sn basamağı 20 sn'ye iner. Sonra merdiven 40 sn'de bir baştan döner.
 * Test modunda kapalı; `?test=1&ipucu=1` ile süreler 1/20 (e2e).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { IpucuHedefi, IpucuMerdiveni } from '../mini/arayuz';

export const BASAMAK = { kipir: 12_000, soz: 20_000, parla: 30_000, el: 40_000, tur: 52_000 } as const;
const hizli = () => TEST_MODU && new URLSearchParams(location.search).get('ipucu') === '1';

export interface Merdiven extends IpucuMerdiveni {
  /** çocuk dokundu: merdiven baştan */
  dokunuldu(): void;
  /** gelen basamaklar (test) */
  readonly gelen: string[];
  dur(): void;
}

export function merdivenKur(kap: HTMLElement, soyle: (metin: string) => void, sec: { erken?: boolean } = {}): Merdiven {
  const kapali = TEST_MODU && !hizli();
  const olcek = hizli() ? 1 / 20 : 1;
  let hedef: IpucuHedefi | null = null;
  let zamanlar: number[] = [];
  const gelen: string[] = [];
  let durdu = kapali;

  const temizle = () => {
    zamanlar.forEach((t) => clearTimeout(t));
    zamanlar = [];
  };
  const kur = () => {
    temizle();
    if (durdu || !hedef) return;
    const parlaMs = sec.erken ? BASAMAK.soz + 1 : BASAMAK.parla;
    const ekle = (ms: number, f: () => void) => zamanlar.push(window.setTimeout(f, ms * olcek));
    ekle(BASAMAK.kipir, () => basamak('kipir'));
    ekle(BASAMAK.soz, () => basamak('soz'));
    ekle(parlaMs, () => basamak('parla'));
    ekle(BASAMAK.el, () => basamak('el'));
    ekle(BASAMAK.tur, kur);
  };
  const basamak = (ad: 'kipir' | 'soz' | 'parla' | 'el') => {
    if (durdu || !hedef) return;
    const el = hedef.el();
    gelen.push(ad);
    kap.dataset.ipucu = ad;
    if (ad === 'soz') {
      if (hedef.soz) soyle(hedef.soz);
      return;
    }
    if (!el || !el.isConnected) return;
    if (ad === 'kipir' || ad === 'parla') {
      const sinif = ad === 'kipir' ? 'rs-kipir' : 'rs-parla';
      el.classList.remove(sinif);
      void el.offsetWidth;
      el.classList.add(sinif);
      window.setTimeout(() => el.classList.remove(sinif), 1400);
      return;
    }
    elGoster(kap, el, hedef.hareket ?? 'dokun', hedef.nereye?.() ?? null);
  };

  return {
    hedef(yeni) {
      hedef = yeni;
      kur();
    },
    dokunuldu() {
      kur();
    },
    gelen,
    dur() {
      durdu = true;
      temizle();
    },
  };
}

/** Yarı saydam minik el bir kez hareketi gösterir (kendi kendine kaybolur) */
function elGoster(kap: HTMLElement, hedef: HTMLElement, hareket: NonNullable<IpucuHedefi['hareket']>, nereye: HTMLElement | null) {
  const kr = kap.getBoundingClientRect();
  const r = hedef.getBoundingClientRect();
  const x = r.left + r.width / 2 - kr.left;
  const y = r.top + r.height / 2 - kr.top;
  const el = h('div.rs-ipucu-el', { 'aria-hidden': 'true', style: `left:${x}px;top:${y}px` });
  kap.append(el);
  let k: Keyframe[];
  if (hareket === 'surukle' && nereye) {
    const n = nereye.getBoundingClientRect();
    const dx = n.left + n.width / 2 - kr.left - x;
    const dy = n.top + n.height / 2 - kr.top - y;
    k = [{ opacity: 0, transform: 'translate(0,0)' }, { opacity: 0.75, offset: 0.15 }, { opacity: 0.75, transform: `translate(${dx}px,${dy}px)`, offset: 0.8 }, { opacity: 0, transform: `translate(${dx}px,${dy}px)` }];
  } else if (hareket === 'kaydir-dik') k = [{ opacity: 0, transform: 'translateY(-50px)' }, { opacity: 0.75, offset: 0.2 }, { opacity: 0.75, transform: 'translateY(50px)', offset: 0.8 }, { opacity: 0, transform: 'translateY(50px)' }];
  else if (hareket === 'kaydir-yatay') k = [{ opacity: 0, transform: 'translateX(-60px)' }, { opacity: 0.75, offset: 0.2 }, { opacity: 0.75, transform: 'translateX(60px)', offset: 0.8 }, { opacity: 0, transform: 'translateX(60px)' }];
  else if (hareket === 'daire')
    k = [0, 90, 180, 270, 360].map((a, i) => ({ opacity: i === 0 || i === 4 ? 0 : 0.75, transform: `translate(${Math.cos((a * Math.PI) / 180) * 36}px,${Math.sin((a * Math.PI) / 180) * 36}px)` }));
  else if (hareket === 'fiske') k = [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 0.75, offset: 0.3 }, { opacity: 0.75, transform: 'translateY(-50px)', offset: 0.6 }, { opacity: 0, transform: 'translateY(-60px)' }];
  else k = [{ opacity: 0, transform: 'scale(1)' }, { opacity: 0.75, offset: 0.3 }, { opacity: 0.75, transform: 'scale(0.85)', offset: 0.5 }, { opacity: 0.75, transform: 'scale(1)', offset: 0.7 }, { opacity: 0, transform: 'scale(1)' }];
  try {
    el.animate(k, { duration: TEST_MODU ? 60 : 1600, easing: 'ease-in-out' }).finished.then(
      () => el.remove(),
      () => el.remove(),
    );
  } catch {
    window.setTimeout(() => el.remove(), 1600);
  }
}
