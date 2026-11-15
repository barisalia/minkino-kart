import { TEST_MODU } from '../../src/ui/dom';

const sakin = matchMedia('(prefers-reduced-motion: reduce)');
export const zaman = (ms: number) => TEST_MODU || sakin.matches ? 12 : ms;
export type Nokta = { x: number; y: number };
const nokta = (olay: PointerEvent): Nokta => ({ x: olay.clientX, y: olay.clientY });
export function merkez(el: Element): Nokta {
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}
export function icinde(hedef: Element, yer: Nokta, bosluk = 0): boolean {
  const r = hedef.getBoundingClientRect();
  return yer.x >= r.left - bosluk && yer.x <= r.right + bosluk && yer.y >= r.top - bosluk && yer.y <= r.bottom + bosluk;
}

// Only direct ancestry changes can detach the station. Cooking animations and
// ingredient movement inside it need no mutation callbacks.
export function sahnedenAyrilinca(el:HTMLElement,bitir:()=>void){
  const izleyici=new MutationObserver(()=>{
    if(!el.isConnected){izleyici.disconnect();bitir();}
  });
  for(let ust=el.parentElement;ust;ust=ust.parentElement)izleyici.observe(ust,{childList:true});
  return ()=>izleyici.disconnect();
}

interface Jest {
  basla?: (yer: Nokta) => void;
  tasi?: (yer: Nokta, ilk: Nokta) => void;
  birak: (yer: Nokta, ilk: Nokta, tik: boolean) => void;
  iptal?: () => void;
  klavye: () => void;
}
// Touch WebView bazen pointerup ile yenilenen sahnenin altındaki düğmeye
// ikinci bir uyumluluk click'i gönderir. Gerçek klavye click'i detail=0'dır.
let tuketilen: number | null = null;
document.addEventListener('pointerdown', () => { tuketilen = null; }, true);
document.addEventListener('click', e => {
  if (e.detail === 0 || tuketilen === null) return;
  // WebKit yeni sahnedeki en yakın düğmeyi hedefleyince click koordinatını
  // da kaydırabilir. Ayrı bir fiziksel dokunuş zaten pointerdown ile başlar.
  if (performance.now() - tuketilen > 850) return;
  tuketilen = null;
  e.preventDefault();
  e.stopImmediatePropagation();
}, true);
/** Tek parmak bütün hareketi sahiplenir. Dokunma, fare, klavye ve okuyucunun ürettiği click aynı sonuca gider. */
export function jest(el: HTMLButtonElement, j: Jest) {
  let id: number | null = null;
  let ilk: Nokta = { x: 0, y: 0 };
  let uzunluk = 0;
  let sonrakiKlik = -1;
  el.addEventListener('pointerdown', e => {
    if (id !== null || e.button !== 0 || el.disabled) return;
    id = e.pointerId;
    ilk = nokta(e);
    uzunluk = 0;
    el.setPointerCapture(id);
    j.basla?.(ilk);
  });
  el.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    const yer = nokta(e);
    uzunluk = Math.max(uzunluk, Math.hypot(yer.x - ilk.x, yer.y - ilk.y));
    j.tasi?.(yer, ilk);
  });
  el.addEventListener('pointerup', e => {
    if (e.pointerId !== id) return;
    const yer = nokta(e);
    const tik = Math.max(uzunluk, Math.hypot(yer.x - ilk.x, yer.y - ilk.y)) < 9;
    id = null;
    sonrakiKlik = performance.now();
    tuketilen = sonrakiKlik;
    j.birak(yer, ilk, tik);
  });
  const iptal = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = null;
    j.iptal?.();
  };
  el.addEventListener('pointercancel', iptal);
  el.addEventListener('lostpointercapture', iptal);
  el.addEventListener('click', e => {
    if (e.detail !== 0 && performance.now() - sonrakiKlik < 700) return;
    j.klavye();
  });
}

export function hareket(el: Element, kareler: Keyframe[], ms: number): Promise<void> {
  return el.animate(kareler, { duration: zaman(ms), easing: 'cubic-bezier(.23,.7,.3,1)' }).finished.then(() => {}, () => {});
}

/** Görsel parmakla birlikte taşınır, bırakınca özgün düğme klavye odağını korur. */
export function malzemeTasi(
  el: HTMLButtonElement, hedef: HTMLElement, sonuc: () => void, reddet: () => void,
  kabulEdilir = true,
) {
  let kopya: HTMLElement | SVGSVGElement | null = null;
  let bittiriliyor = false;
  function goruntu(yer: Nokta) {
    if (!kopya) {
      const asil = el.querySelector<HTMLImageElement | SVGSVGElement>('img, svg.kesik-resmi');
      if (!asil) return;
      kopya = asil.cloneNode(true) as typeof asil;
      const kutu = asil.getBoundingClientRect();
      Object.assign(kopya.style, { width: kutu.width + 'px', height: kutu.height + 'px' });
      kopya.setAttribute('class', 'tasinan');
      document.body.append(kopya);
      el.classList.add('elde');
    }
    kopya.style.left = yer.x + 'px';
    kopya.style.top = yer.y + 'px';
  }
  function temizle() {
    kopya?.remove();
    kopya = null;
    el.classList.remove('elde');
    hedef.classList.remove('yaklas');
  }
  async function tamamla(uygun: boolean, yer: Nokta) {
    if (bittiriliyor) return;
    bittiriliyor = true;
    goruntu(yer);
    const varis = merkez(uygun ? hedef : el);
    // Malzeme bırakıldığı anda sepete aittir. İkinci sebzeye hızlıca dokunmak
    // birinci uçuşun sonundaki yeniden çizim yüzünden bu seçimi yitirmesin.
    if (uygun && el.isConnected) sonuc();
    if (kopya) await hareket(kopya, [
      { transform: 'translate(-50%, -50%) scale(1)' },
      { transform: `translate(calc(-50% + ${varis.x - yer.x}px), calc(-50% + ${varis.y - yer.y}px)) scale(${uygun ? .48 : 1})` },
    ], uygun ? 280 : 190);
    temizle();
    bittiriliyor = false;
    if (!uygun && el.isConnected) reddet();
  }
  jest(el, {
    tasi: (yer, ilk) => {
      if (bittiriliyor || Math.hypot(yer.x - ilk.x, yer.y - ilk.y) < 6) return;
      goruntu(yer);
      hedef.classList.toggle('yaklas', kabulEdilir && icinde(hedef, yer, 15));
    },
    birak: (yer, _ilk, tik) => void tamamla(kabulEdilir && (tik || icinde(hedef, yer, 15)), yer),
    iptal: temizle,
    klavye: () => void tamamla(kabulEdilir, merkez(el)),
  });
}
