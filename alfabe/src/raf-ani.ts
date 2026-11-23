// Harf rafının canlanma anı (main.ts → rafGoster). Çocuk bir harfi bitirip kartını albüme yapıştırdıktan sonra rafa
// döndüğünde: biten harfin onay rozeti damga gibi basılır, ışıklar saçılır; sonra sıradaki harf uyanıp zıplar.
// Sıradaki harf (kilitli değilse) rafta her zaman hafifçe nefes alır gibi parlar: çocuk nereden devam edeceğini görür.
// Keşfet, Mıknatıslar, boyama, söyle ve ders sonu anlarıyla aynı dil (canlanma.ts). Raf düzeni ve akış aynı.
import { An, azHareket, isikSac, kabaGore } from './canlanma';
import { oyunSesi } from './oyun-sesi';
import './raf-ani.css';

export function rafAni(alan: HTMLElement, siradakiId: string | undefined, yeniBitenId: string | undefined): () => void {
  const an = new An();
  const harfler = alan.querySelector<HTMLElement>('.at-harfler');
  const dugme = (id?: string) => id ? alan.querySelector<HTMLElement>('.at-harf[data-id="' + id + '"]') : null;
  const siradaki = dugme(siradakiId), yeni = dugme(yeniBitenId);
  const parlat = () => { if (siradaki && !siradaki.hasAttribute('data-kilitli')) siradaki.classList.add('at-siradaki'); };
  if (!harfler || azHareket() || !yeni) { parlat(); return () => an.durdur(); }
  // Biten harf: rozet görünmez başlar, raf açılınca damga gibi basılır.
  const rozet = yeni.querySelector<HTMLElement>('.at-biten');
  if (rozet) rozet.style.opacity = '0';
  an.sonra(450, () => {
    if (rozet) {
      rozet.style.opacity = '';
      an.hareket(rozet, [{ transform: 'translate(-60%,60%) scale(3.6) rotate(-30deg)', opacity: 0 }, { transform: 'translate(-30%,30%) scale(3) rotate(-15deg)', opacity: 1, offset: .3 },
        { transform: 'scale(.8) rotate(6deg)', opacity: 1, offset: .7 }, { transform: 'scale(1.12)', opacity: 1, offset: .85 }, { transform: 'none', opacity: 1 }], { duration: 560, easing: 'ease-in-out' });
    }
    an.hareket(yeni, [{ transform: 'none' }, { transform: 'scale(1.08,.92)', offset: .45 }, { transform: 'none' }], { duration: 300, delay: 340, easing: 'ease-out' });
    yeni.classList.add('at-yeni-bitti');
    oyunSesi('kagit');
    an.sonra(360, () => {
      const r = kabaGore(harfler, yeni);
      isikSac(an, harfler, r.cx, r.cy, { adet: 9, uzaklik: r.h * 1.05, boy: Math.max(20, r.h * .42), sure: 900 });
      oyunSesi('parilti');
    });
  });
  // Sıradaki harf uyanır: zıplar, ışıkları saçılır, sonra nefes alır gibi parlamaya başlar.
  if (siradaki && !siradaki.hasAttribute('data-kilitli')) an.sonra(1250, () => {
    an.hareket(siradaki, [{ transform: 'none' }, { transform: 'translateY(-14%) scale(1.06)', offset: .35 }, { transform: 'translateY(2%) scale(1.03,.97)', offset: .7 }, { transform: 'none' }],
      { duration: 520, easing: 'ease-out' });
    const r = kabaGore(harfler, siradaki);
    an.sonra(140, () => isikSac(an, harfler, r.cx, r.cy, { adet: 6, uzaklik: r.h * .8, boy: Math.max(14, r.h * .26), renk: '#ffe08a' }));
    an.sonra(400, parlat);
  });
  else parlat();
  return () => an.durdur();
}
