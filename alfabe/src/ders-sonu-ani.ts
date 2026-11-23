// Ders sonu: albüme yapıştırma anı (main.ts → sonucGoster → yerlestir). Bir harfin bittiği an dersin en büyük anıdır:
// çıkartma sayfaya basılıp oturur, üstünden parlak bir ışık geçer, yıldızlar saçılır; üstteki sayaç çocuğun gözü önünde
// bir artar ("1 / 29" → "2 / 29"). Keşfet, Mıknatıslar, boyama ve söyle anlarıyla aynı dil (canlanma.ts). Akış aynı.
import { An, azHareket, isikSac, kabaGore } from './canlanma';
import { oyunSesi } from './oyun-sesi';
import './ders-sonu-ani.css';

/** Sonuç ekranı açılırken: kart henüz yapışmadı, sayaç bir eksik görünür (yapışınca artar). */
export function sayaciBekletme(alan: HTMLElement, tamamlanan: number) {
  const sayac = alan.querySelector<HTMLElement>('.at-ilerleme span');
  if (!sayac || azHareket() || tamamlanan < 1) return;
  sayac.textContent = (tamamlanan - 1) + ' / 29';
}

/** Kart albüme yapışınca. Durdurucuyu döndürür (ekran kapanınca hareketler ve eklenen ışıklar kalkar). */
export function albumeYapistirAni(alan: HTMLElement, kart: HTMLElement, tamamlanan: number): () => void {
  const an = new An();
  const sayac = alan.querySelector<HTMLElement>('.at-ilerleme span');
  const kitap = alan.querySelector<HTMLElement>('.ka-kitap');
  const sayaciArtir = () => {
    if (!sayac) return;
    sayac.textContent = tamamlanan + ' / 29';
    sayac.classList.add('ka-sayac-artti');
  };
  if (azHareket() || !kitap) { sayaciArtir(); return () => an.durdur(); }
  // Kart kayarak yerine gelir (340 ms, main.ts); bitince çıkartma sayfaya basılır.
  an.sonra(330, () => {
    oyunSesi('kagit');
    an.hareket(kart, [{ transform: 'scale(1)' }, { transform: 'scale(1.06,.93)', offset: .35 }, { transform: 'scale(.985,1.015)', offset: .7 }, { transform: 'scale(1)' }],
      { duration: 340, easing: 'ease-out' });
    const r = kabaGore(kitap, kart);
    // Çıkartmanın üstünden geçen parlak ışık şeridi.
    const parlama = an.ekle(kitap, document.createElement('i'));
    parlama.className = 'ka-parlama'; parlama.setAttribute('aria-hidden', 'true');
    Object.assign(parlama.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    const serit = document.createElement('b');
    parlama.append(serit);
    an.hareket(serit, [{ transform: 'translateX(0) skewX(-18deg)' }, { transform: 'translateX(' + r.w * 1.9 + 'px) skewX(-18deg)' }],
      { duration: 620, delay: 120, easing: 'cubic-bezier(.4,0,.3,1)', fill: 'forwards' }).finished.then(() => an.kaldir(parlama), () => {});
    an.sonra(140, () => {
      isikSac(an, kitap, r.cx, r.cy, { adet: 10, uzaklik: Math.max(64, Math.min(r.w, r.h) * .72), boy: Math.max(20, r.w * .12), sure: 900 });
      oyunSesi('parilti');
    });
  });
  // Sayaç bir artar ve sevinçle büyüyüp küçülür.
  an.sonra(820, () => {
    sayaciArtir();
    if (sayac) an.hareket(sayac, [{ transform: 'scale(1)' }, { transform: 'scale(1.4)', offset: .35 }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
  });
  return () => an.durdur();
}
