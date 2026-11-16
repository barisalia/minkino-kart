/**
 * Kilitli kart / bölüm: köşede küçük kilit rozeti; dokununca çocuğa kilit anı ("Bunu anne-babanla açabilirsin";
 * src/abonelik/kilit-ani.ts), oradan yalnız "Büyükler için" düğmesiyle ebeveyn kapısı → abonelik ekranı.
 * Kilitler yalnız uygulamada (anahtar varken) etkin; web sitesinde hiçbir şey kilitlenmez (src/engine/erisim.ts).
 */
import '../styles/ana.css';
import './abonelik.css';
import { erisimDinle, kilitli } from '../engine/erisim';
import { h, svg } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { kilitliIcerik } from './ekran';
import { durumuTazele } from './satin';

/** Kartın kilit rozetini erişime göre ekler / kaldırır (`data-kilitli`) */
export function kilitGoster(el: HTMLElement, id: string, kap: HTMLElement = el): boolean {
  const k = kilitli(id);
  el.toggleAttribute('data-kilitli', k);
  const rozet = kap.querySelector(':scope > .mk-kilit');
  if (k && !rozet) kap.append(h('span.mk-kilit', { 'aria-hidden': 'true' }, svg(IKON.kilit)));
  else if (!k) rozet?.remove();
  return k;
}

/**
 * Bir ekrandaki kilitli kartları yönetir: `kartlar` [eleman, içerik kimliği, rozetin konacağı kap]. Erişim değişince
 * (satın alma, mağazadan gelen durum) rozetler yenilenir. Ekran kapanınca dönen fonksiyon çağrılır.
 */
export function kilitleriKur(kartlar: [HTMLElement, string, HTMLElement?][]): () => void {
  const yenile = () => kartlar.forEach(([el, id, kap]) => kilitGoster(el, id, kap));
  yenile();
  // sayfa açılınca mağazadan güncel durum (çevrimdışıysa son bilinen durum kalır)
  void durumuTazele();
  return erisimDinle(yenile);
}

/**
 * Kilitliyse kilit anını (→ büyükler için ebeveyn kapısı → abonelik) açar ve false döner (çağıran içerik açmaz);
 * açıksa true.
 * Abonelik alınırsa rozetler kendiliğinden kalkar; çocuk karta yeniden dokunur.
 */
export function erisimVarMi(id: string, kok: HTMLElement): boolean {
  if (!kilitli(id)) return true;
  // kilit anı, ebeveyn kapısı ve abonelik ekranının stilleri .mk-kok altında: oyun sayfası .mk-kok değilse
  // (Matematik, Harf, Kitap, Pati …) geçici, şeffaf bir .mk-kok katmanı açılır, iş bitince kalkar
  const ev = kok.closest<HTMLElement>('.mk-kok');
  if (ev) { void kilitliIcerik(ev); return false; }
  const katman = h('div.mk-kok.mk-kilit-katmani');
  document.body.append(katman);
  void kilitliIcerik(katman).finally(() => katman.remove());
  return false;
}
