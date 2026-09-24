import { efekt } from '../../audio/ses';
import { refCoz } from '../../engine/katalog';
import { dogruIndeks } from '../../engine/soru';
import { h, TEST_MODU } from '../../ui/dom';
import { izgaraSigdir, ucur } from '../../ui/hareket';
import { diziOrani, kartEl } from '../../ui/kart';
import type { SoruBaglam } from '../oyun';
import { aciklama } from './ortak';

/** BUL, SAY, FARKLI ve SIRADAKI: gösterge + dokunarak seçilen kartlar. */
export function secmeliCiz(b: SoruBaglam) {
  const s = b.soru;
  let yuva: HTMLElement | null = null;

  // ---- Gösterge ----
  if (s.tip === 'SAY' && s.gosterge?.length) {
    const dizi = h('div.izgara');
    const kartlar = s.gosterge.map((g) => kartEl(g, { sinif: 'giris' }));
    if (s.islem === '+' && kartlar.length === 2) {
      dizi.classList.add('islem-dizi');
      dizi.append(kartlar[0], h('div.islem-isaret', {}, '+'), kartlar[1]);
      b.temizlik(izgaraSigdir(b.gosterge, dizi, 2, { enBuyuk: 250, ekW: 60, bosluk: 12, oran: diziOrani(s.gosterge) }));
    } else {
      dizi.append(...kartlar);
      b.temizlik(izgaraSigdir(b.gosterge, dizi, kartlar.length, { enBuyuk: 330, oran: diziOrani(s.gosterge) }));
    }
    b.gosterge.append(dizi);
  } else if (s.tip === 'SIRADAKI' && s.gosterge?.length) {
    const dizi = h('div.izgara.siradaki-dizi');
    s.gosterge.forEach((g, i) => {
      const k = kartEl(g, { sinif: 'giris' });
      k.style.setProperty('--i', String(i));
      dizi.append(k);
    });
    yuva = h('div.kart.soru-yuva', { style: `--i:${s.gosterge.length}` }, h('b', {}, '?'));
    yuva.classList.add('giris');
    dizi.append(yuva);
    b.temizlik(izgaraSigdir(b.gosterge, dizi, s.gosterge.length + 1, { enBuyuk: 170, bosluk: 10 }));
    b.gosterge.append(dizi);
  } else if (s.gosterge?.length) {
    const dizi = h('div.izgara');
    s.gosterge.forEach((g, i) => {
      const k = kartEl(g, { sinif: 'giris' });
      k.style.setProperty('--i', String(i));
      dizi.append(k);
    });
    b.temizlik(izgaraSigdir(b.gosterge, dizi, s.gosterge.length, { enBuyuk: 260, oran: diziOrani(s.gosterge) }));
    b.gosterge.append(dizi);
  } else {
    b.alan.classList.add('gostergesiz');
  }

  // ---- Seçenekler ----
  const dogru = dogruIndeks(s);
  const izgara = h('div.izgara.secenekler');
  const elemanlar: HTMLElement[] = [];
  let bitti = false;
  s.kartlar.forEach((g, i) => {
    const el = kartEl(g, { sinif: 'secenek giris' });
    el.style.setProperty('--i', String(i + (s.gosterge?.length ?? 0)));
    el.style.setProperty('--yon', i % 2 ? '1' : '-1');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', refCoz(g).yazi ?? refCoz(g).kart ?? '');
    el.dataset.sira = String(i);
    if (TEST_MODU && i === dogru) el.dataset.dogru = '1';
    el.addEventListener('click', () => {
      if (bitti) return;
      if (i === dogru) {
        bitti = true;
        elemanlar.forEach((e) => e !== el && e.classList.add('soluk'));
        if (yuva) {
          // Sıradaki kart "?" yuvasına uçar
          const klon = kartEl(g);
          el.style.visibility = 'hidden';
          efekt.ucus();
          const oran = yuva.getBoundingClientRect().width / Math.max(1, el.getBoundingClientRect().width);
          void ucur(b.app.kok, klon, el, yuva, oran, 450).then(() => {
            const yeni = kartEl(g, { sinif: 'dogru-oldu' });
            yuva!.replaceWith(yeni);
            b.dogru(yeni, aciklama(s, g));
          });
        } else {
          el.classList.add('dogru-oldu');
          b.dogru(el, aciklama(s, g));
        }
      } else {
        b.yanlis(el, elemanlar[dogru]);
      }
    });
    elemanlar.push(el);
    izgara.append(el);
  });
  b.temizlik(izgaraSigdir(b.secenek, izgara, s.kartlar.length, { enBuyuk: s.kartlar.length <= 2 ? 300 : 240, oran: diziOrani(s.kartlar) }));
  b.secenek.append(izgara);
}
