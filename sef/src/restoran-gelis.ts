import { h } from '../../src/ui/dom';
import { ikon } from './gorsel';
import './restoran-gelis.css';

const resimler = import.meta.glob<string>('../../assets/sef/tepsi/gelis/*.webp', {
  eager: true, query: '?url', import: 'default',
});
const kaynak = (ad: string) => resimler['../../assets/sef/tepsi/gelis/' + ad + '.webp'];
const oyuncular = {
  salata: { ad: 'Mino', dosya: 'mino', kare: [0, 1, 2, 3], sure: [350, 260, 450, 320] },
  corba: { ad: 'Lokum', dosya: 'lokum', kare: [0, 1, 2, 3, 4, 5, 6, 7], sure: [135, 135, 150, 145, 130, 125, 140, 260] },
  pizza: { ad: 'Dede Hasan', dosya: 'dede', kare: [0, 1, 0, 3, 0], sure: [390, 105, 260, 310, 330] },
} as const;

export function gelisPlan(misafir: keyof typeof oyuncular, bitir: () => void): HTMLElement {
  const oyuncu = oyuncular[misafir];
  const fon = h('img.gelis-dekor', {src: kaynak('giris'), alt: '', draggable: false});
  const beden = h('span.gelis-oyuncu', {'data-kim': oyuncu.dosya});
  const ileri = h('button.gelis-ileri', { type: 'button', 'aria-label': 'Siparişe geç' }, ikon('ileri'));
  const sahne = h('div.restoran-gelis', {role: 'group', 'aria-label': oyuncu.ad + ' restorana geliyor'}, fon, beden, ileri);
  const kareler = Array.from(new Set<number>(oyuncu.kare), i => {
    const resim = h('img', {src: kaynak(oyuncu.dosya + i), alt: '', draggable: false});
    resim.hidden = true;
    beden.append(resim);
    return [i, resim] as const;
  });
  let tamam = false;
  let saat = 0;
  function son() {
    if (tamam || !sahne.isConnected) return;
    tamam = true;
    clearTimeout(saat);
    bitir();
  }
  ileri.addEventListener('click', son, {once: true});
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function goster(i: number) {
    if (tamam || !sahne.isConnected) return;
    for (const [no, resim] of kareler) resim.hidden = no !== oyuncu.kare[i];
    if (oyuncu.dosya === 'lokum') beden.style.left = (39 + i * .54) + '%';
    saat = window.setTimeout(() => {
      if (sakin || i + 1 === oyuncu.kare.length) son();
      else goster(i + 1);
    }, sakin ? 520 : oyuncu.sure[i]);
  }
  requestAnimationFrame(async () => {
    if (!sahne.isConnected) return;
    await Promise.race([
      Promise.allSettled([fon.decode(), ...kareler.map(([, resim]) => resim.decode())]),
      new Promise(resolve => setTimeout(resolve, 700)),
    ]);
    goster(sakin ? oyuncu.kare.length - 1 : 0);
  });
  return sahne;
}
