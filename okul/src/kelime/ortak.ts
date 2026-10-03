/**
 * Kelime Köprüsü etkinliklerinin ortak parçaları: resimli kart, dokunarak seçme (yanlışa ceza yok, 2 yanlıştan sonra
 * doğru parlar), durak/çıkartma simgesi.
 */
import K from '../../../content/okul-kelime.json';
import { h, TEST_MODU } from '../../../src/ui/dom';
import { AZ_HAREKET, type Efekt } from '../efekt';
import { Ipucu, type Sahne } from '../sahne';
import { ses } from '../sesler';
import { kelime } from './model';
import { kelimeEl, kelimeGorsel } from './resim';

export const KM = K.mino;
export const KK = K.kino;
export const KA = K.arayuz;

/** Durak ve çıkartma simgesi: hazır görsellerden küçük kompozisyon ([yol, sınıf]) */
export function simge(...parcalar: [string, string][]): string {
  return `<span class="ok-simge-yigin">${parcalar.map(([y, s]) => `<img class="ok-resim ${s}" src="${kelimeGorsel(y)}" alt="" draggable="false">`).join('')}</span>`;
}

/**
 * Sıçrama: damlalar (su mavisi ya da boya rengi) bir noktadan yay çizerek dışa ve yukarı uçar, düşerken söner.
 * Yalnız transform / opacity; az hareket ayarında ve test modunda yok.
 */
export function sicrat(e: Efekt, x: number, y: number, renk = '#6cc4ff', adet = 12, boy = 1) {
  if (AZ_HAREKET || TEST_MODU) return;
  for (let i = 0; i < adet; i++) {
    const a = -Math.PI / 2 + (i / (adet - 1) - 0.5) * Math.PI * 1.2 + (Math.random() - 0.5) * 0.3;
    const r = (50 + Math.random() * 50) * boy;
    const s = (10 + Math.random() * 10) * boy;
    const d = h('i.ok-k-damlacik', { style: `left:${x}px;top:${y}px;width:${s}px;height:${s}px;--renk:${renk}` });
    e.el.append(d);
    const dx = Math.cos(a) * r;
    const dy = Math.sin(a) * r;
    d.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${dx * 0.7}px, ${dy * 0.8}px) scale(1)`, opacity: 1, offset: 0.45 },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy * 0.4 + 40 * boy}px) scale(0.6)`, opacity: 0 },
      ],
      { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.2,.7,.5,1)' },
    ).finished.then(
      () => d.remove(),
      () => d.remove(),
    );
  }
}

/** Büyük resimli kart (dokunulur); kelime kimliği data-kelime'de */
export function resimKarti(id: string, sinif = ''): HTMLButtonElement {
  return h(`button.ok-k-kart${sinif ? '.' + sinif.split(' ').join('.') : ''}`, { type: 'button', 'data-kelime': id, 'aria-label': kelime(id).ad }, kelimeEl(id));
}

/**
 * Kartlardan doğru olana dokunulunca çözülür (dokunulan kartı döndürür). Yanlışta kart nazikçe sallanır, yanlis(kart)
 * beklenir; 2 yanlıştan sonra doğru kart parlar. Test modunda doğru kart data-dogru="1".
 */
export function dokunSec(
  s: Sahne,
  kartlar: HTMLElement[],
  dogruMu: (k: HTMLElement) => boolean,
  o: { yanlis?: (k: HTMLElement) => Promise<void> | void; dokun?: (k: HTMLElement) => void; /** yanlışta nazik "hı-hı" (komik sahnede kapalı) */ nazik?: boolean } = {},
): Promise<HTMLElement> {
  const ipucu = new Ipucu(() => kartlar.filter(dogruMu));
  if (TEST_MODU) kartlar.forEach((k) => dogruMu(k) && (k.dataset.dogru = '1'));
  let mesgul = false;
  return new Promise((coz) => {
    for (const k of kartlar) {
      k.addEventListener('click', async () => {
        if (mesgul || s.kapandi()) return;
        mesgul = true;
        o.dokun?.(k);
        if (dogruMu(k)) {
          ipucu.sifirla();
          ses.tik();
          k.classList.add('ok-k-dogru');
          kartlar.forEach((x) => x !== k && x.classList.add('ok-solgun'));
          coz(k);
          return;
        }
        if (o.nazik !== false) s.nazik(k);
        ipucu.yanlis();
        await o.yanlis?.(k);
        mesgul = false;
      });
    }
  });
}
