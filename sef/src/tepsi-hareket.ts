import type { Masa, Parca } from './tepsi-fisleri';

// Bir servis hareketi yalnızca tabağın ilk kez göründüğü karede oynar.
const yeniTabaklar = new WeakMap<Masa, Parca>();
export function tabakGeldi(masa: Masa, parca: Parca) {
  yeniTabaklar.set(masa, parca);
}

export function tabagiYerlestir(masa: Masa, tepsi: HTMLElement) {
  const parca = yeniTabaklar.get(masa);
  if (!parca) return;
  yeniTabaklar.delete(masa);
  const yuva = tepsi.querySelector<HTMLElement>(`[data-parca="${parca}"]`);
  if (!yuva) return;
  yuva.classList.add('tepsi-yeni-porsiyon');
  if (!['corba','tavuk','makarna','pizza','mucver','sis','krep','menemen'].includes(parca)) return;
  const buhar = new Image();
  buhar.src = new URL('../../assets/sef/tepsi/tavuk/buhar.webp', import.meta.url).href;
  buhar.alt = '';
  buhar.className = 'tepsi-servis-buhari';
  yuva.append(buhar);
}
