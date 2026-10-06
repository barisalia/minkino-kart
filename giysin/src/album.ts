/**
 * Kino'nun Albümü: dört mevsim sayfası (Gemini sayfa çizimleri). Fotoğrafı çekilen mevsimin yuvasında o günün
 * polaroidi; boş sayfada mevsim ağacı soluk durur. Sayfaya dokununca o mevsim oynanır (kış ücretsiz, diğerleri
 * abonelikle: kilitliyse kilit anı). Dört sayfa dolunca üstte Mevsim Ustası rozeti parlar.
 */
import { erisimVarMi, kilitleriKur } from '../../src/abonelik/kilit';
import { efekt } from '../../src/audio/efekt';
import { h } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import G from '../../content/giysin.json';
import YUVA from '../../assets/giysin/album.json';
import { ms, oynat } from './anim';
import { polaroid } from './foto';
import { fotoKiyafeti, kayit, MEVSIMLER } from './kayit';
import type { Mevsim } from './model';
import { resim } from './resimler';

const YUVALAR = YUVA as unknown as Record<Mevsim, [number, number, number, number, number]>;

export function albumEkrani(app: Uygulama): Ekran {
  const geri = yuvarlakDugme(IKON.geri, 'Geri', () => app.git('oda', { mevsim: kayit.album[kayit.album.length - 1] ?? 'kis' }), 'kucuk');
  const kilitler: [HTMLElement, string, HTMLElement?][] = [];
  const sayfalar = MEVSIMLER.map((m, i) => {
    const dolu = kayit.album.includes(m);
    const [x, y, w, hh, oran] = YUVALAR[m];
    const yuva = h('div.gy-album-yuva', { style: `left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${hh * 100}%` }, dolu ? polaroid(m, fotoKiyafeti(m)) : h('img.gy-album-agac', { src: resim(`pencere-${m}-on`), alt: '', draggable: 'false' }));
    const s = h(
      `button.gy-album-sayfa.${m}${dolu ? '.dolu' : ''}`,
      { type: 'button', style: `--i:${i};aspect-ratio:${oran}`, 'aria-label': G.yazi[m], 'data-mevsim': m },
      h('img.gy-album-zemin', { src: resim(`album-${m}`), alt: '', draggable: 'false' }),
      yuva,
      dolu ? null : h('span.gy-album-oyna', { html: IKON.oyna }),
      h('div.gy-album-ad', {}, G.yazi[m]),
    );
    if (m !== 'kis') kilitler.push([s, `giysin/${m}`]);
    s.addEventListener('click', () => {
      efekt.dokunma();
      if (!erisimVarMi(`giysin/${m}`, app.kok)) return;
      void oynat(s, [{ transform: 'none' }, { transform: 'scale(1.06) rotate(-2deg)' }, { transform: 'none' }], 300).then(() => app.git('oda', { mevsim: m }));
    });
    return s;
  });
  const rozet = kayit.rozet ? h('div.gy-album-rozet', {}, h('i.gy-rozet-isik'), h('img', { src: resim('rozet-mevsim'), alt: G.yazi.rozet, draggable: 'false' })) : h('div', { style: 'width:56px' });
  const el = h('div.gy-ekran.gy-album', {}, h('img.gy-oda', { src: resim('oda-yatay'), alt: '', draggable: 'false' }), h('div.gy-ust', {}, geri, h('h1.gy-baslik', {}, kayit.rozet ? G.yazi.rozet : G.yazi.album), rozet), h('div.gy-album-izgara', {}, ...sayfalar));
  sayfalar.forEach((s, i) => void oynat(s, [{ transform: 'translateY(30px) rotate(-4deg) scale(0.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], 520, { delay: ms(i * 90), easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' }));
  if (kayit.rozet) void oynat(rozet.querySelector('img'), [{ transform: 'scale(0) rotate(-20deg)' }, { transform: 'scale(1.15) rotate(5deg)', offset: 0.7 }, { transform: 'none' }], 700, { delay: ms(450), easing: 'ease-out', fill: 'backwards' });
  const kilitBirak = kilitleriKur(kilitler);
  return { el, kapat: kilitBirak };
}
