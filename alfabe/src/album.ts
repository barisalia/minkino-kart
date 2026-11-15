import dersler from './harfler.json';
import { harfYazisi, type Ders, type Kalemler } from './kartlar';
import { resim } from './resimler';
import { IKON } from '../../src/ui/ikonlar';
import './album.css';

type Ses = (id: string, bitince?: () => void) => void;
export function albumKur(alan: HTMLElement, biten: string[], renkler: Record<string,Kalemler>,
  ilkKart: string, oku: Ses, sustur: () => void, dersAc: (id:string)=>void) {
  const kartlar = biten.map(id => dersler.find(d => d.id === id)!).filter(Boolean);
  let sayfa = Math.max(0, Math.floor(kartlar.findIndex(d => d.id === ilkKart) / 2));
  const sayfaSayisi = Math.ceil(kartlar.length / 2);
  function kart(ders: Ders) {
    return '<button type="button" class="ka-kart" data-dinle="' + ders.id + '" aria-label="' + ders.example + '">' +
      harfYazisi(ders, renkler[ders.id]) + '<img src="' + resim(ders.id) + '" alt="" draggable="false">' +
      '<span>' + ders.example + '</span></button>';
  }
  function sayfayiCiz() {
    const gorunen = kartlar.slice(sayfa * 2, sayfa * 2 + 2);
    alan.innerHTML = '<section class="ka-album"><h1>Harf albümüm</h1>' +
      '<div class="ka-kitap"><div class="ka-sayfalar">' +
      (gorunen.length ? gorunen.map(kart).join('') : '<div class="ka-ilk"><h2>İlk kartını yap</h2><button type="button" class="at-basla">Bir harf seç</button></div>') +
      (gorunen.length === 1 ? '<div class="ka-bos" aria-hidden="true"></div>' : '') +
      '</div></div><div class="ka-kumanda">' +
      (sayfaSayisi > 1 ? '<button class="at-geri ka-once" type="button" aria-label="Önceki sayfa"' + (sayfa===0?' disabled':'') + '>' + IKON.geri + '</button>' : '') +
      (sayfaSayisi > 1 ? '<button class="at-geri ka-sonra" type="button" aria-label="Sonraki sayfa"' + (sayfa===sayfaSayisi-1?' disabled':'') + '>' + IKON.geri + '</button>' : '') +
      '</div></section>';
    const once = alan.querySelector<HTMLButtonElement>('.ka-once'), sonra = alan.querySelector<HTMLButtonElement>('.ka-sonra');
    if (once) once.onclick = () => cevir(-1);
    if (sonra) sonra.onclick = () => cevir(1);
    const sec = alan.querySelector<HTMLButtonElement>('.ka-ilk button');
    if (sec) sec.onclick = () => dersAc('');
    for (const b of alan.querySelectorAll<HTMLButtonElement>('[data-dinle]')) {
      b.onclick = () => oku(b.dataset.dinle + '-label');
    }
  }
  function cevir(yon: number) {
    sustur(); sayfa += yon;
    sayfayiCiz();
    const ileri = alan.querySelector<HTMLButtonElement>('.ka-sonra:enabled');
    const geri = alan.querySelector<HTMLButtonElement>('.ka-once:enabled');
    (yon > 0 ? ileri ?? geri : geri ?? ileri)?.focus({preventScroll:true});
  }
  sayfayiCiz();
  return sustur;
}
