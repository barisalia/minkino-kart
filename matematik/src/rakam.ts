import { yazilar, yolNoktalari } from '../../hazirlik/src/yazi-yollari';
const yollar: Record<number, string[]> = {
  0: ['M119 48 C67 48 65 186 118 186 C174 186 175 48 119 48'],
  1: [...yazilar['1'].yollar],
  2: [...yazilar['2'].yollar],
  3: [...yazilar['3'].yollar],
  4: ['M139 49 L72 138 H170', 'M140 91 V187'],
  5: ['M160 49 H89 L84 112 C143 84 179 131 153 170 C136 196 95 194 74 174'],
  6: ['M149 47 C93 68 60 145 86 174 C110 203 164 189 163 146 C162 113 111 101 84 136'],
  7: ['M72 49 H172 L100 187'],
  8: ['M119 116 C60 86 84 44 120 48 C171 48 170 94 119 116 C58 145 77 188 120 188 C173 190 178 143 119 116'],
  9: ['M157 99 C157 38 86 32 80 83 C74 133 138 141 157 99 Q157 153 110 187'],
};
const ns = 'http://www.w3.org/2000/svg';
export function rakamAtolyesi(
  kutu: HTMLElement,
  rakam: number,
  bitir: () => void,
  onceki?: { satir: number; nokta: number },
  sakla?: (satir: number, nokta: number) => void,
) {
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 240 232');
  svg.classList.add('yazitahtasi');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', rakam + ' rakamının yolunu izle');
  kutu.append(svg);
  function yol(d: string, css: string) {
    const el = document.createElementNS(ns, 'path');
    el.setAttribute('d', d);
    el.setAttribute('class', css);
    svg.append(el);
    return el;
  }
  const cizgiler = yollar[rakam];
  cizgiler.forEach((d) => yol(d, 'yazi-iz'));
  let satir = 0,
    i = 0,
    id: number | null = null,
    son = false;
  const ilerleme = cizgiler.map((d) => yol(d, 'yazi-murekkep'));
  ilerleme.forEach((el) => {
    el.setAttribute('pathLength', '1');
    el.style.strokeDasharray = '1';
    el.style.strokeDashoffset = '1';
  });
  const uc = document.createElementNS(ns, 'circle');
  uc.setAttribute('r', '10');
  uc.setAttribute('class', 'yazi-uc');
  svg.append(uc);
  const noktalar = () => yolNoktalari(cizgiler[satir]);
  if (onceki && Number.isInteger(onceki.satir) && onceki.satir >= 0 && onceki.satir < cizgiler.length) {
    satir = onceki.satir;
    i = Number.isInteger(onceki.nokta) ? Math.max(0, Math.min(onceki.nokta, noktalar().length - 2)) : 0;
    for (let j = 0; j < satir; j++) ilerleme[j].style.strokeDashoffset = '0';
  }
  function goster() {
    const a = noktalar(),
      p = a[i];
    uc.setAttribute('cx', String(p[0]));
    uc.setAttribute('cy', String(p[1]));
    ilerleme[satir].style.strokeDashoffset = String(1 - i / (a.length - 1));
  }
  function nokta(e: PointerEvent) {
    const mat = svg.getScreenCTM();
    return mat ? new DOMPoint(e.clientX, e.clientY).matrixTransform(mat.inverse()) : null;
  }
  function ilerle(e: PointerEvent) {
    if (e.pointerId !== id || son) return;
    // Bir ekran yenilemesine birden fazla kalem örneği sığabilir.
    for (const olay of [...(e.getCoalescedEvents?.() ?? []), e]) {
      if (son || id === null) break;
      const p = nokta(olay);
      if (p) ilerlet(p.x, p.y);
    }
  }
  function ilerlet(x: number, y: number) {
    const a = noktalar();
    let yeni = i,
      mesafe = 17;
    for (let j = i + 1; j < Math.min(a.length, i + 8); j++) {
      const d = Math.hypot(a[j][0] - x, a[j][1] - y);
      if (d < mesafe) {
        mesafe = d;
        yeni = j;
      }
    }
    if (yeni === i) return;
    i = yeni;
    goster();
    if (i === a.length - 1) {
      id = null;
      if (++satir === cizgiler.length) {
        son = true;
        uc.remove();
        bitir();
      } else {
        i = 0;
        goster();
      }
    }
    if (!son) sakla?.(satir, i);
  }
  svg.onpointerdown = (e) => {
    if (!e.isPrimary || e.button !== 0 || id !== null || son) return;
    const p = nokta(e),
      a = noktalar()[i];
    if (!p || Math.hypot(a[0] - p.x, a[1] - p.y) > 24) return;
    id = e.pointerId;
    svg.setPointerCapture(id);
  };
  svg.onpointermove = ilerle;
  svg.onpointerup = (e) => {
    ilerle(e);
    if (e.pointerId === id) id = null;
  };
  svg.onlostpointercapture = svg.onpointercancel = (e) => {
    if (e.pointerId === id) id = null;
  };
  goster();
}
