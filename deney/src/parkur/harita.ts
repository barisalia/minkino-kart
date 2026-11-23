// Deneyler · Zincirleme Top Parkuru: bölüm haritası (Paket Deney-A1). Kino'nun bahçesinden geçen kıvrımlı yolda altı durak; bitmiş
// durakta yıldız, açık durak parlar, kilitli durak asma kilitli. Durağa dokununca Kino yürüyerek oraya gider, bölüm açılır.
// Yeni açılan durak ilk gelişte yaylanarak açılır, kilit düşer. İlerleme cihazda (minkino-parkur-v1).
import { sesiAc } from '../../../src/audio/ses';
import { BOLUM_SAYISI } from './bolumler';
import { Kareler, cizim, dizi, resimEl, yuzde } from './cizimler';
import { efekt, sesleriYukle, soyle } from './ses';

const FON = { w: 1672, h: 941 };
/** Durakların ortası (harita fonunda; Astra brief'iyle birebir). */
export const DURAKLAR = [
  { x: 260, y: 700 }, { x: 560, y: 520 }, { x: 860, y: 700 }, { x: 1120, y: 480 }, { x: 1380, y: 660 }, { x: 1540, y: 300 },
] as const;
export const haritaCizimleri = () => ['harita-fon', 'harita-kilit', 'yildiz-bos', 'yildiz-dolu', ...DURAKLAR.map((_, i) => 'durak-' + (i + 1)), 'harita-kino-0', 'harita-kino-1', 'harita-kino-2', 'harita-kino-3'];
const ANAHTAR = 'minkino-parkur-v1';
export function ilerleme(): { acik: number; yildiz: number[] } {
  try {
    const v = JSON.parse(localStorage.getItem(ANAHTAR) || '{}') as { acik?: number; yildiz?: number[] };
    return { acik: Math.max(1, Math.min(BOLUM_SAYISI, v.acik ?? 1)), yildiz: v.yildiz ?? [] };
  } catch { return { acik: 1, yildiz: [] }; }
}

export function haritaKur(kok: HTMLElement, ayar: { test: boolean; hazir: (no: number) => boolean; ac: (no: number) => void; yeniAcilan?: number }) {
  kok.replaceChildren();
  kok.dataset.durum = 'harita';
  kok.classList.toggle('pk-cizimsiz', !cizim('harita-fon'));
  kok.style.backgroundImage = cizim('harita-fon') ? 'url("' + cizim('harita-fon') + '")' : 'none';
  // Altı durak ve yürüyen Kino tabletin görünür alanında birlikte kalır.
  const olc = () => {
    const z = Math.min(innerWidth / FON.w, innerHeight / FON.h);
    kok.style.width = FON.w * z + 'px';
    kok.style.height = FON.h * z + 'px';
    kok.style.translate = (innerWidth - FON.w * z) / 2 + 'px ' + (innerHeight - FON.h * z) / 2 + 'px';
  };
  olc();
  addEventListener('resize', olc);
  const yer = (x: number, y: number, w: number, h: number, el: HTMLElement) => { yuzde({ x, y, w, h }, el, FON.w, FON.h); kok.append(el); return el; };
  const { acik, yildiz } = ilerleme();
  let gidiyor = false;
  const kino = new Kareler(dizi('harita-kino', 4), 'pk-harita-kino', 'harita-kino-0');
  // Kino son bitirilen durakta (yoksa ilk durağın solunda) bekler.
  const basla = yildiz.length ? DURAKLAR[Math.min(5, Math.max(...yildiz) - 1)] : { x: DURAKLAR[0].x - 140, y: DURAKLAR[0].y };
  const kinoYeri: { x: number; y: number } = { x: basla.x, y: basla.y };
  const kinoKoy = () => yuzde({ x: kinoYeri.x - 80, y: kinoYeri.y - 190, w: 160, h: 200 }, kino.el, FON.w, FON.h);
  kinoKoy();
  DURAKLAR.forEach((d, i) => {
    const no = i + 1;
    const hazir = ayar.hazir(no);
    const kilitli = no > acik || !hazir;
    const b = document.createElement('button');
    b.className = 'pk-durak' + (kilitli ? ' kilitli' : '') + (no === acik && !yildiz.includes(no) ? ' sirada' : '') + (yildiz.includes(no) ? ' bitti' : '');
    b.setAttribute('aria-label', 'Parkur ' + no + (kilitli ? ', kilitli' : ''));
    b.dataset.no = String(no);
    b.append(resimEl('durak-' + no, 'pk-poz acik'));
    if (yildiz.includes(no)) b.append(resimEl('yildiz-dolu', 'pk-durak-yildiz'));
    if (kilitli) b.append(resimEl('harita-kilit', 'pk-durak-kilit'));
    yer(d.x - 110, d.y - 110, 220, 220, b);
    b.addEventListener('pointerdown', () => { sesiAc(); void sesleriYukle(); b.classList.remove('bas'); void b.offsetWidth; b.classList.add('bas'); efekt('tik'); });
    b.addEventListener('click', () => {
      if (gidiyor) return;
      if (kilitli) {
        // Kilitli durak: kilit sallanır (komik), Kino omuz silker gibi zıplar.
        b.classList.remove('salla'); void b.offsetWidth; b.classList.add('salla');
        efekt('puf', 0.7);
        return;
      }
      git(no);
    });
    // Yeni açılan durak: kilit düşer, durak yaylanır.
    if (ayar.yeniAcilan === no && !kilitli) { b.classList.add('yeni'); setTimeout(() => { efekt('konfeti', 0.6); soyle('c-yeni-durak'); }, 400); }
  });
  kok.append(kino.el);
  /** Kino yürüyerek durağa gider (yürüme kareleri), sonra bölüm açılır. */
  function git(no: number) {
    gidiyor = true;
    const hedef = DURAKLAR[no - 1];
    const bas = { ...kinoYeri };
    const sure = Math.min(1400, 300 + Math.hypot(hedef.x - bas.x, hedef.y - bas.y) * 1.2);
    const t0 = performance.now();
    kino.el.classList.toggle('sola', hedef.x < bas.x);
    let son = t0;
    const adim = () => {
      const simdi = performance.now();
      const s = Math.min(1, (simdi - t0) / sure), e = s * s * (3 - 2 * s);
      kinoYeri.x = bas.x + (hedef.x - bas.x) * e;
      kinoYeri.y = bas.y + (hedef.y - bas.y) * e - Math.sin(Math.PI * s) * 40;
      kinoKoy();
      kino.ilerle((simdi - son) / 1000, 8);
      son = simdi;
      if (s < 1) { requestAnimationFrame(adim); return; }
      efekt('tik');
      setTimeout(() => ayar.ac(no), 200);
    };
    efekt('adim', 0.7);
    requestAnimationFrame(adim);
  }
  // İlk açılışta Ceren sorar.
  let soruldu = false;
  const sor = () => { if (soruldu) return; soruldu = true; void sesleriYukle()?.then(() => soyle('c-harita')); };
  kok.addEventListener('pointerdown', sor, { once: true, capture: true });
  return () => { removeEventListener('resize', olc); kok.style.translate = ''; };
}
