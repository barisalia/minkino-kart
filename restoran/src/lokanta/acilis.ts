/** Açılış: lokantanın önü, "Kapalı" levhası (iskelet) */
import { h } from '../../../src/ui/dom';
import type { Ekran, Uygulama } from '../../../src/uygulama';

export function acilisEkrani(app: Uygulama): Ekran {
  const levha = h('button.rs-levha', { type: 'button', 'aria-label': 'Lokantayı aç' });
  levha.addEventListener('click', () => app.git('lokanta'));
  return { el: h('div.rs-acilis', {}, levha) };
}
