import { h, TEST_MODU } from '../../src/ui/dom';
import { ikon } from './gorsel';
import type { Ekran } from './kayit';
import type { MalzemeId } from './tarif';
import type { Nokta } from './hareket';

const merkez = (el: Element, x = .5, y = .5): Nokta => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width * x, y: r.top + r.height * y };
};
/** Çocuk duraklarsa yalnız o an yapabileceği tek hareketi bir kez göster. */
export function mutfakRehberi(alan: HTMLElement, gerek: () => readonly MalzemeId[]) {
  function yol(ekran: Ekran): Nokta[] {
    const bul = (selector: string) => alan.querySelector<HTMLElement>(selector);
    const ileri = bul('.ileri');
    if (ekran === 'mutfak') {
      const rozet = bul('[data-oneri="true"] .istasyon-rozeti');
      if (rozet) return [merkez(rozet)];
    }
    if (ekran === 'dolap') {
      const toplama=bul('.bostan');
      if(toplama){
        const aktar=bul('.bostan-aktar:not([hidden])');
        if(aktar)return [merkez(aktar)];
        const sepet=bul('.bostan-sepet');
        const uygun=gerek().map(id=>bul('.bostan-urun[data-urun="'+id+'"]:not([hidden]):enabled')).find(Boolean);
        if(uygun&&sepet)return [merkez(uygun),merkez(sepet)];
        const devam=bul('.bostan-ileri')??bul('.bostan-yan');return devam?[merkez(devam)]:[];
      }
      const hedef = bul('.sepet');
      // Sepet doluyken gösterilen sonraki hareket, kesme tahtasına geçmektir.
      // Dördüncü sebzeyi sürükleme ipucu bu noktada yapılamaz.
      if(ileri&&hedef?.querySelectorAll('.sepette-sebze').length===3)return [merkez(ileri)];
      for (const id of gerek()) {
        const sebze = bul(`[data-sebze="${id}"]`);
        if (hedef && sebze) return [merkez(sebze), merkez(hedef, .5, .63)];
      }
    }
    if (ekran === 'tahta') {
      const topla = bul('[data-topla]'), tabak = bul('.dograma-tabagi');
      if (topla && tabak) return [merkez(topla),merkez(tabak)];
      const uclar = alan.querySelectorAll('.kesim-hedef circle');
      if (uclar.length === 2) return Array.from(uclar, el => merkez(el));
    }
    if (ekran === 'kase' || ekran === 'ocak') {
      const blender=bul('.corba-blender'),tane=bul('[data-ez]');
      const patates=bul('[data-ez=patates]');
      if(blender&&patates&&bul('[data-istenen-kivam=patates]'))return [merkez(blender),merkez(patates)];
      if(blender&&tane&&bul('[data-istenen-kivam="puruzsuz"]'))return [merkez(blender),merkez(tane)];
      const porsiyon = bul('[data-porsiyon-al]'), hedef = bul('[data-porsiyon-birak]');
      if (porsiyon && hedef) return [merkez(porsiyon), merkez(hedef)];
      const parca = bul('[data-aktar]'), kap = bul('.kap-alani');
      if (parca && kap) return [merkez(parca), merkez(kap)];
      if (bul('.karistirma') && kap) {
        return Array.from({ length: 17 }, (_, i) => {
          const a = i * Math.PI / 8;
          return merkez(kap, .5 + .26 * Math.cos(a), .5 + .26 * Math.sin(a));
        });
      }
    }
    if (ekran === 'servis') {
      const zil = bul('[data-zil]');
      if (zil) return [merkez(zil)];
      const sus = bul('[data-sus][aria-pressed="true"]'), yemek = bul('[data-sun]');
      if (sus && yemek && !yemek.hasAttribute('disabled')) return [merkez(sus), merkez(yemek, .5, .37)];
    }
    return ileri ? [merkez(ileri)] : [];
  }
  return hareketRehberi(alan,()=>yol(alan.dataset.ekran as Ekran),()=>alan.dataset.ekran!=='siparis').planla;
}

export function hareketRehberi(alan:HTMLElement,yol:()=>Nokta[],acik:()=>boolean){
  let saat:number|undefined;
  let imlec:HTMLElement|undefined;
  let oynuyor:Animation|undefined;
  const sakin=matchMedia('(prefers-reduced-motion: reduce)');
  const dinleme=new AbortController();
  function durdur() {
    clearTimeout(saat);
    oynuyor?.cancel();
    imlec?.remove();
    imlec=undefined;oynuyor=undefined;
  }
  function goster() {
    if (document.hidden || !alan.isConnected || alan.closest('[hidden],[inert]') || !acik() || alan.querySelector('dialog[open]')) return;
    const noktalar = yol();
    if (!noktalar.length) return;
    const r = alan.getBoundingClientRect();
    const el = h('span.rehber-el', { 'aria-hidden': 'true' }, ikon('el'));
    imlec = el;
    alan.append(el);
    const konum = (n: Nokta) => `translate(${n.x - r.left}px, ${n.y - r.top}px)`;
    const yolBoyu = noktalar.length > 1;
    const son = noktalar[noktalar.length - 1];
    if (sakin.matches) {
      el.style.transform = konum(noktalar[0]);
      saat = window.setTimeout(durdur, 1100);
      return;
    }
    const kareler: Keyframe[] = [
      { transform: konum(noktalar[0]), opacity: 0, offset: 0 },
      { transform: konum(noktalar[0]), opacity: .95, offset: .13 },
      ...noktalar.map((n, i) => ({
        transform: konum(n), opacity: .95, offset: .27 + .53 * i / Math.max(1, noktalar.length - 1),
      })),
      { transform: konum(son), opacity: .95, offset: .84 },
      { transform: konum(son), opacity: 0, offset: 1 },
    ];
    oynuyor = el.animate(kareler, { duration: yolBoyu ? 1850 : 1250, easing: 'ease-in-out', iterations: 2 });
    void oynuyor.finished.then(() => el.remove(), () => el.remove());
  }
  function planla() {
    durdur();
    if (!TEST_MODU && acik() && !document.hidden) saat = window.setTimeout(goster, 6200);
  }
  const dinle={capture:true,signal:dinleme.signal};
  document.addEventListener('pointerdown',durdur,dinle);
  document.addEventListener('pointerup',planla,dinle);
  document.addEventListener('pointercancel',planla,dinle);
  document.addEventListener('keydown',planla,dinle);
  document.addEventListener('visibilitychange',planla,dinle);
  return {planla,kapat:()=>{durdur();dinleme.abort();}};
}
