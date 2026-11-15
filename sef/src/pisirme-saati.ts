import {arkaPlanDinle} from '../../src/kabuk/yon';

/** Yalnızca çocuk tezgâhı görebilirken pişirme süresini ilerletir. */
export function pisirmeSaati() {
  let kare = 0, onceki = 0;
  let arkada = false, sayfaKapali = false;
  let ilerlet: ((gecen: number) => boolean) | undefined;
  let sakla: (() => void) | undefined;
  function dur() {
    cancelAnimationFrame(kare);
    kare = 0;
    onceki = 0;
  }
  function ciz(an: number) {
    kare = 0;
    if (!ilerlet) return;
    const gecen = onceki ? an - onceki : 0;
    onceki = an;
    if (ilerlet(gecen)) kare = requestAnimationFrame(ciz);
    else bitir();
  }
  function gorunurluk() {
    if (!ilerlet) return;
    if (document.hidden || arkada || sayfaKapali) {
      if (kare) sakla?.();
      dur();
    } else if (!kare) kare = requestAnimationFrame(ciz);
  }
  function gizle() { sayfaKapali = true; gorunurluk(); }
  function goster() { sayfaKapali = false; gorunurluk(); }
  const arkayiBirak = arkaPlanDinle(deger => { arkada = deger; gorunurluk(); });
  document.addEventListener('visibilitychange', gorunurluk);
  window.addEventListener('pagehide', gizle);
  window.addEventListener('pageshow', goster);
  function bitir() { dur(); ilerlet = undefined; sakla = undefined; }
  return {
    baslat(adim: (gecen: number) => boolean, kaydet: () => void) {
      bitir(); ilerlet = adim; sakla = kaydet; gorunurluk();
    },
    dur: bitir,
    temizle() {
      bitir(); arkayiBirak();
      document.removeEventListener('visibilitychange', gorunurluk);
      window.removeEventListener('pagehide', gizle);
      window.removeEventListener('pageshow', goster);
    }
  };
}
