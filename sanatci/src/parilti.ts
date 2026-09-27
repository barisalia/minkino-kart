/**
 * Fırça ucunda parıltı: çizerken parmağın ucunda küçük bir ışık ve arkasında sönen yıldız tozları.
 * Parçacıklar havuzdan gelir (çöp üretmez), yalnız transform / opacity ile oynar. Az harekette kapalı.
 * Çiz Canlansın da kullanır.
 */
import './parilti.css';
import { TEST_MODU } from '../../src/ui/dom';
import { azHareket } from '../../src/ui/hareket';

export interface FircaParilti {
  kapat(): void;
}

const ALTIN = ['#FFD84D', '#FFFFFF', '#FFE9A0'];

/**
 * kap: çizim kâğıdı (konumlu kutu), hedef: olayları dinlenen tuval.
 * renk: o anki boya rengi; izle: fırça ucunun ekrandaki yeri (Mino bakar).
 */
export function fircaParilti(kap: HTMLElement, hedef: HTMLElement, o: { renk?: () => string; izle?: (x: number, y: number) => void } = {}): FircaParilti {
  const katman = document.createElement('div');
  katman.className = 'fp-katman';
  katman.setAttribute('aria-hidden', 'true');
  const uc = document.createElement('span');
  uc.className = 'fp-uc';
  katman.append(uc);
  kap.append(katman);
  const sade = azHareket() || TEST_MODU;
  const havuz: HTMLElement[] = [];
  if (!sade) {
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      s.className = 'fp-toz';
      s.append(document.createElement('i'));
      katman.append(s);
      havuz.push(s);
    }
  }
  let sira = 0;
  let kutu = kap.getBoundingClientRect();
  let basili = false;
  let son = { x: -999, y: -999, t: 0 };

  function toz(x: number, y: number) {
    const s = havuz[sira++ % havuz.length];
    if (!s) return;
    const i = s.firstElementChild as HTMLElement;
    const renk = sira % 3 === 0 && o.renk ? o.renk() : ALTIN[sira % ALTIN.length];
    i.style.background = renk;
    s.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    const a = Math.random() * Math.PI * 2;
    const d = 8 + Math.random() * 14;
    const dx = Math.cos(a) * d;
    const dy = Math.sin(a) * d - 6;
    const b = 0.5 + Math.random() * 0.7;
    i.getAnimations().forEach((x) => x.cancel());
    i.animate(
      [
        { transform: `translate(0, 0) scale(${b * 0.3}) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5}px) scale(${b}) rotate(60deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dx}px, ${dy + 12}px) scale(0) rotate(160deg)`, opacity: 0 },
      ],
      { duration: 560 + Math.random() * 200, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
    );
  }

  function yer(e: PointerEvent) {
    return { x: e.clientX - kutu.left, y: e.clientY - kutu.top };
  }
  const bas = (e: PointerEvent) => {
    kutu = kap.getBoundingClientRect();
    basili = true;
    const p = yer(e);
    uc.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    uc.classList.add('acik');
    son = { ...p, t: performance.now() };
    if (!sade) toz(p.x, p.y);
    o.izle?.(e.clientX, e.clientY);
  };
  const surukle = (e: PointerEvent) => {
    if (!basili) return;
    const p = yer(e);
    uc.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    o.izle?.(e.clientX, e.clientY);
    if (sade) return;
    const t = performance.now();
    if (t - son.t > 34 && Math.hypot(p.x - son.x, p.y - son.y) > 9) {
      son = { ...p, t };
      toz(p.x, p.y);
    }
  };
  const birak = () => {
    basili = false;
    uc.classList.remove('acik');
  };
  hedef.addEventListener('pointerdown', bas);
  hedef.addEventListener('pointermove', surukle);
  hedef.addEventListener('pointerup', birak);
  hedef.addEventListener('pointercancel', birak);
  hedef.addEventListener('pointerleave', birak);
  return {
    kapat() {
      hedef.removeEventListener('pointerdown', bas);
      hedef.removeEventListener('pointermove', surukle);
      hedef.removeEventListener('pointerup', birak);
      hedef.removeEventListener('pointercancel', birak);
      hedef.removeEventListener('pointerleave', birak);
      katman.remove();
    },
  };
}
