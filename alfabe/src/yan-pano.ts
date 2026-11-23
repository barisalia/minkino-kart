// Sabit oranlı sahneli Hece oyunları (Hece Köprüsü, Posta Kutusu; çizimler 1672 × 941) telefonda yatayda sahne en çok
// ekran yüksekliği × 1,78 genişliğe çıkar, iki yanda boşluk kalır (yönetici 23 Kasım: oyun alanı en az %60, hedefler 64 px).
// Geniş kapta bu boşluklar oyunun parçası olur: solda Ceren (sözcüğü o söyler, ağzı sesle oynar), sağda büyük "sözcüğü dinle"
// düğmesi. tepsi: true verilirse sol pano oyunun taş tepsisi olur (kıyıdaki küçük taşlar orada 64 px'ten iri durur), Ceren
// dinle düğmesinin üstüne geçer. Dar kapta (iPad, dikey) panolar görünmez. Yerleşim yan-pano.css'te (kap sorgusu).
import { IKON } from '../../src/ui/ikonlar';
import { cerenYuzu } from './konusma-dersi';
import './yan-pano.css';

/** kok: oyunun kabı (container-type: size); dinle: sahnenin kendi dinle düğmesi (yan düğme onu tetikler). */
export function yanPanolariKur(kok: HTMLElement, dinle: HTMLButtonElement, o: { tepsi?: boolean } = {}) {
  kok.classList.add('yp-kap');
  if (o.tepsi) kok.classList.add('yp-tepsili');
  const sol = document.createElement('div');
  sol.className = 'yp-yan yp-sol';
  const sag = document.createElement('div');
  sag.className = 'yp-yan yp-sag';
  const ceren = cerenYuzu('yp-ceren');
  if (o.tepsi) {
    sol.innerHTML = '<div class="yp-tepsi" role="group" aria-label="Hece taşları"></div>';
    sag.innerHTML = ceren;
  } else sol.innerHTML = ceren;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'yp-dinle';
  b.setAttribute('aria-label', dinle.getAttribute('aria-label') ?? 'Sözcüğü yeniden dinle');
  b.innerHTML = IKON.hoparlor + '<span>Dinle</span>';
  b.onclick = () => { if (!dinle.disabled) dinle.click(); };
  // Sahnedeki düğme kapanınca (ses çalarken, oyun bitince) yan düğme de kapanır.
  const esitle = () => { b.disabled = dinle.disabled; b.hidden = dinle.hidden; };
  new MutationObserver(esitle).observe(dinle, { attributes: true, attributeFilter: ['disabled', 'hidden'] });
  esitle();
  sag.append(b);
  kok.prepend(sol);
  kok.append(sag);
}

/** Taş tepsisi şu an ekranda mı (geniş kap)? Görünüyorsa öğesi, değilse null. */
export function yanTepsi(kok: HTMLElement): HTMLElement | null {
  const t = kok.querySelector<HTMLElement>('.yp-tepsi');
  return t && t.getClientRects().length ? t : null;
}
