import { h } from '../../src/ui/dom';

const adimlar = import.meta.glob<string>('../../assets/dedektif-oyuncular/*-adim-*.webp', {
  eager: true, query: '?url', import: 'default',
});

/** Aynı ayak çizgisinde hizalanmış arşiv kareleri. Konum sahne tarafından yönetilir. */
export function adimOynat(yer: HTMLElement, kim: 'kino' | 'mino', sola: boolean, ms: number) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || ms < 75) return () => {};
  const adet = kim === 'kino' ? 8 : 6;
  const kareler = Array.from({length: adet}, (_, i) =>
    adimlar['../../assets/dedektif-oyuncular/'+kim+'-adim-'+i+'.webp']);
  const resim = h('img.dd-adim', {alt:'', draggable:false, src:kareler[0]});
  const onceki = yer.querySelector(':scope > .dd-adim');
  onceki?.remove();
  yer.append(resim);
  if (sola) resim.style.scale = '-1 1';
  yer.classList.add('dd-adimli');
  const bas = performance.now();
  const tekrar = Math.max(1, Math.round(ms / (adet * 115)));
  let raf = 0, son = 0;
  function oynat(an: number) {
    if (!resim.isConnected) return;
    const i = Math.floor((an-bas) * tekrar * adet / ms) % adet;
    if (i !== son) {resim.src = kareler[i]; son = i;}
    raf = requestAnimationFrame(oynat);
  }
  raf = requestAnimationFrame(oynat);
  return () => {
    cancelAnimationFrame(raf);
    resim.remove();
    if (!yer.querySelector(':scope > .dd-adim')) yer.classList.remove('dd-adimli');
  };
}
