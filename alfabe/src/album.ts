import dersler from './harfler.json';
import { harfYazisi, type Ders, type Kalemler } from './kartlar';
import { resim } from './resimler';
import { IKON } from '../../src/ui/ikonlar';
import { An, azHareket } from './canlanma';
import { oyunSesi } from './oyun-sesi';
import { parilti } from './cila';
import './album.css';

type Ses = (id: string, bitince?: () => void) => void;
export function albumKur(alan: HTMLElement, biten: string[], renkler: Record<string,Kalemler>,
  ilkKart: string, oku: Ses, sustur: () => void, dersAc: (id:string)=>void, ekOyun?: { resim: string; ad: string; ac: () => void },
  sozlukAc?: (id: string) => void) {
  const kartlar = biten.map(id => dersler.find(d => d.id === id)!).filter(Boolean);
  let sayfa = Math.max(0, Math.floor(kartlar.findIndex(d => d.id === ilkKart) / 2));
  const sayfaSayisi = Math.ceil(kartlar.length / 2);
  const an = new An();
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
      // Resimli Sözlük: her sayfanın köşesinde harfin sözlüğünü açan düğme (resimli-sozluk.ts).
      '</div>' + (sozlukAc ? gorunen.map((d, i) => '<button type="button" class="ka-sozluk-ac ' + (i ? 'ka-sag' : 'ka-sol') + '" data-sozluk="' + d.id + '" aria-label="' + d.upper + ' harfinin resimli sözlüğü">' + IKON.resim + '<span>Sözlük</span></button>').join('') : '') +
      '</div><div class="ka-kumanda">' +
      (ekOyun ? '<button type="button" class="ka-kurabiye" aria-label="' + ekOyun.ad + '"><img src="' + ekOyun.resim + '" alt="" draggable="false"></button>' : '') +
      (sayfaSayisi > 1 ? '<button class="at-geri ka-once" type="button" aria-label="Önceki sayfa"' + (sayfa===0?' disabled':'') + '>' + IKON.geri + '</button>' : '') +
      (sayfaSayisi > 1 ? '<button class="at-geri ka-sonra" type="button" aria-label="Sonraki sayfa"' + (sayfa===sayfaSayisi-1?' disabled':'') + '>' + IKON.geri + '</button>' : '') +
      '</div></section>';
    const once = alan.querySelector<HTMLButtonElement>('.ka-once'), sonra = alan.querySelector<HTMLButtonElement>('.ka-sonra');
    if (once) once.onclick = () => cevir(-1);
    if (sonra) sonra.onclick = () => cevir(1);
    const ek = alan.querySelector<HTMLButtonElement>('.ka-kurabiye');
    if (ek && ekOyun) ek.onclick = () => { sustur(); ekOyun.ac(); };
    for (const b of alan.querySelectorAll<HTMLButtonElement>('[data-sozluk]')) b.onclick = () => { sustur(); sozlukAc?.(b.dataset.sozluk!); };
    const sec = alan.querySelector<HTMLButtonElement>('.ka-ilk button');
    if (sec) sec.onclick = () => dersAc('');
    for (const b of alan.querySelectorAll<HTMLButtonElement>('[data-dinle]')) {
      // Dokunulan kart adını söylerken sevinçle zıplar.
      b.onclick = () => {
        oku(b.dataset.dinle + '-label');
        parilti(b, 6);
        if (!azHareket()) an.hareket(b, [{ transform: 'none' }, { transform: 'translateY(-5%) rotate(-2deg) scale(1.04)', offset: .35 }, { transform: 'translateY(1%) rotate(1deg)', offset: .7 }, { transform: 'none' }], { duration: 460, easing: 'ease-out' });
      };
    }
  }
  // Sayfa çevirme: ileri giderken eski sağ sayfa omurgadan kalkıp kapanır, yeni sol sayfa omurgadan inip açılır
  // (geri giderken tersi); öbür sayfa yumuşakça belirir, kâğıt sesi duyulur.
  function cevir(yon: number) {
    sustur(); an.durdur();
    const kitap = alan.querySelector<HTMLElement>('.ka-kitap'), kartEl = alan.querySelectorAll<HTMLElement>('.ka-sayfalar > *');
    const kalkan = yon > 0 ? kartEl[1] : kartEl[0];
    const k = kitap?.getBoundingClientRect(), r = kalkan?.getBoundingClientRect();
    const kopya = !azHareket() && kalkan && k && r ? kalkan.cloneNode(true) as HTMLElement : undefined;
    sayfa += yon;
    sayfayiCiz();
    if (kopya && k && r) sayfaCevir(kopya, r.left - k.left, r.top - k.top, r.width, r.height, yon);
    const ileri = alan.querySelector<HTMLButtonElement>('.ka-sonra:enabled');
    const geri = alan.querySelector<HTMLButtonElement>('.ka-once:enabled');
    (yon > 0 ? ileri ?? geri : geri ?? ileri)?.focus({preventScroll:true});
  }
  function sayfaCevir(kopya: HTMLElement, x: number, y: number, w: number, h: number, yon: number) {
    const kitap = alan.querySelector<HTMLElement>('.ka-kitap');
    const yeni = alan.querySelectorAll<HTMLElement>('.ka-sayfalar > *');
    if (!kitap || !yeni.length) return;
    oyunSesi('kagit');
    kopya.removeAttribute('data-dinle'); kopya.setAttribute('aria-hidden', 'true'); kopya.tabIndex = -1;
    kopya.classList.add('ka-cevrilen');
    Object.assign(kopya.style, { position: 'absolute', left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', margin: '0', zIndex: '3', pointerEvents: 'none' });
    an.ekle(kitap, kopya);
    const omurga = yon > 0 ? 'left center' : 'right center';
    kopya.style.transformOrigin = omurga;
    an.hareket(kopya, [{ transform: 'perspective(1400px) rotateY(0deg)', filter: 'brightness(1)' }, { transform: 'perspective(1400px) rotateY(' + (yon > 0 ? -90 : 90) + 'deg)', filter: 'brightness(.88)' }],
      { duration: 240, easing: 'ease-in', fill: 'forwards' }).finished.then(() => an.kaldir(kopya), () => {});
    // Yeni sayfa omurganın öbür yanından iner.
    const inen = yon > 0 ? yeni[0] : yeni[yeni.length > 1 ? 1 : 0], oteki = yon > 0 ? yeni[1] : yeni[0];
    inen.style.transformOrigin = yon > 0 ? 'right center' : 'left center';
    an.hareket(inen, [{ transform: 'perspective(1400px) rotateY(' + (yon > 0 ? 90 : -90) + 'deg)', opacity: 0 }, { transform: 'perspective(1400px) rotateY(' + (yon > 0 ? 90 : -90) + 'deg)', opacity: 1, offset: .01 },
      { transform: 'perspective(1400px) rotateY(' + (yon > 0 ? -6 : 6) + 'deg)', offset: .8 }, { transform: 'none', opacity: 1 }], { duration: 300, delay: 230, easing: 'ease-out', fill: 'backwards' });
    if (oteki && oteki !== inen) an.hareket(oteki, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 210, easing: 'ease-out', fill: 'backwards' });
  }
  sayfayiCiz();
  return () => { an.durdur(); sustur(); };
}
