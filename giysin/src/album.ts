/** Kino'nun Albümü: dört mevsim sayfası; fotoğrafı çekilen mevsimde polaroid, diğerlerinde "Yakında". */
import { efekt } from '../../src/audio/efekt';
import { h } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import G from '../../content/giysin.json';
import { oynat } from './anim';
import { polaroid } from './foto';
import { kayit, MEVSIMLER } from './kayit';
import { resim } from './resimler';

export function albumEkrani(app: Uygulama): Ekran {
  const geri = yuvarlakDugme(IKON.geri, 'Geri', () => app.git('oda'), 'kucuk');
  const sayfalar = MEVSIMLER.map((m, i) => {
    const var_ = kayit.album.includes(m);
    const ic = var_ ? polaroid(['corap', 'bot', 'mont', 'bere', 'eldiven']) : h('div.gy-album-bos', {}, h('img', { src: resim('polaroid'), alt: '', draggable: 'false' }), h('span', {}, G.yazi.yakinda));
    const s = h(`div.gy-album-sayfa.${m}${var_ ? '.dolu' : ''}`, { style: `--i:${i}` }, h('div.gy-album-ad', {}, G.yazi[m]), ic);
    s.addEventListener('click', () => efekt.dokunma());
    return s;
  });
  const el = h('div.gy-ekran.gy-album', {}, h('img.gy-oda', { src: resim('oda-yatay'), alt: '', draggable: 'false' }), h('div.gy-ust', {}, geri, h('h1.gy-baslik', {}, G.yazi.album), h('div', { style: 'width:56px' })), h('div.gy-album-izgara', {}, ...sayfalar));
  sayfalar.forEach((s, i) => void oynat(s, [{ transform: 'translateY(30px) rotate(-4deg) scale(0.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], 520, { delay: i * 90, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' }));
  return { el };
}
