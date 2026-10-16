/**
 * Açılış (§3a.1, ≤ 8 sn): lokantanın önü, sabah; kapıda "Kapalı" levhası (resimli: uyuyan ay). Çocuk levhaya
 * dokunur, levha döner (gülen güneş), zil çalar, lokanta açılır. Yaş bilinmiyorsa önce iki büyük kart (3-4 / 5-6).
 * Babaanne'nin anahtarı uzattığı ilk açılış P4'te (restoran/src/lokanta/babaanne.ts).
 */
import { h, sure } from '../../../src/ui/dom';
import type { Ekran, Uygulama } from '../../../src/uygulama';
import { kaydet, kayit } from '../kayit';
import { salonSes } from '../sesler';
import { varlik } from '../varliklar';

export function acilisEkrani(app: Uygulama): Ekran {
  const dis = varlik('arka/lokanta-dis');
  const el = h('div.rs-acilis', { style: dis ? `--rs-dis:url("${dis}")` : undefined, 'data-yertutucu': dis ? undefined : '1' });
  const geri = h('button.rs-geri', { type: 'button', 'aria-label': 'Menüye dön' });
  geri.addEventListener('click', () => app.secenekler.cikis?.());
  if (!app.secenekler.cikis) geri.hidden = true;
  const bina = h('div.rs-dis-bina', {}, h('span.rs-dis-tente'), h('span.rs-dis-cam'), h('span.rs-dis-kapi'));
  const levha = h('button.rs-levha', { type: 'button', 'aria-label': 'Lokantayı aç', 'data-yuz': 'kapali' }, h('span.rs-levha-ay'), h('span.rs-levha-gunes'));
  el.append(bina, levha, h('div.rs-ust-cubuk', {}, geri));

  let acildi = false;
  const ac = () => {
    if (acildi) return;
    acildi = true;
    levha.dataset.yuz = 'acik';
    salonSes.tabela();
    window.setTimeout(() => salonSes.kapi(), sure(450));
    window.setTimeout(() => app.git('lokanta', {}), sure(1100));
  };
  levha.addEventListener('click', ac);

  if (!kayit.yas) {
    levha.hidden = true;
    const kart = (y: 'kucuk' | 'buyuk', yazi: string) => {
      const b = h('button.rs-yas', { type: 'button', 'data-yas': y }, h('span.rs-yas-yazi', {}, yazi));
      b.addEventListener('click', () => {
        kayit.yas = y;
        kaydet();
        yasKutu.remove();
        levha.hidden = false;
      });
      return b;
    };
    const yasKutu = h('div.rs-yas-kutu', {}, kart('kucuk', '3-4'), kart('buyuk', '5-6'));
    el.append(yasKutu);
  }
  return { el };
}
