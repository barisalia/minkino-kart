import { durum } from '../engine/ilerleme';
import { efekt, konus, sessizeAlDegistir, tumSesKapaliMi } from '../audio/ses';
import { h, svg } from './dom';
import { IKON } from './ikonlar';

export function yuvarlakDugme(ikon: string, etiket: string, tik: () => void, sinif = ''): HTMLButtonElement {
  const b = h(`button.yuvarlak${sinif ? '.' + sinif.split(' ').join('.') : ''}`, { 'aria-label': etiket, type: 'button' }, svg(ikon));
  b.addEventListener('click', () => {
    efekt.dokunma();
    tik();
  });
  return b;
}

/** Albüm düğmesi (kartların uçtuğu hedef), sayaç rozetiyle. */
export function albumDugmesi(tik: () => void): { el: HTMLButtonElement; artir: () => void } {
  const rozet = h('span.rozet', {}, String(durum.i.album.length));
  const el = yuvarlakDugme(IKON.album, 'Albüm', tik, 'album-dugme');
  el.style.setProperty('--r', '#FF8A2B');
  el.style.setProperty('--i', '#fff');
  el.append(rozet);
  if (durum.i.album.length === 0) rozet.style.display = 'none';
  let sayi = durum.i.album.length;
  return {
    el,
    artir() {
      sayi++;
      rozet.textContent = String(sayi);
      rozet.style.display = '';
      el.classList.remove('ziplat');
      void el.offsetWidth;
      el.classList.add('ziplat');
    },
  };
}

export function sesDugmesi(): HTMLButtonElement {
  const b = yuvarlakDugme(tumSesKapaliMi() ? IKON.sessiz : IKON.hoparlor, 'Sesi aç / kapat', () => {
    const kapali = sessizeAlDegistir();
    b.querySelector('.ikon')!.innerHTML = kapali ? IKON.sessiz : IKON.hoparlor;
  }, 'ses-dugme');
  return b;
}

/** Başlık balonu: hoparlör + metin; hoparlöre dokununca cümle tekrar okunur. */
export function baslikBalon(metin: string, ses: string | string[]): HTMLElement {
  const hop = yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', () => void konus(ses), 'kucuk');
  return h('div.baslik-balon', {}, hop, h('span', {}, metin));
}
