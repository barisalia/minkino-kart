import { efekt } from '../../audio/ses';
import { refCoz } from '../../engine/katalog';
import { dogruIndeks } from '../../engine/soru';
import { h, TEST_MODU } from '../../ui/dom';
import { izgaraSigdir, kwGrubu, ucur } from '../../ui/hareket';
import { diziGenis, diziOlcekli, diziOrani, kartEl } from '../../ui/kart';
import type { SoruBaglam } from '../oyun';
import { dogruCumlesi } from '../../audio/cumleler';

/** BUL, SAY, FARKLI ve SIRADAKI: gösterge + dokunarak seçilen kartlar. */
export function secmeliCiz(b: SoruBaglam) {
  const s = b.soru;
  let yuva: HTMLElement | null = null;
  // boy sırası (Ayıcık büyüyor): gösterge ve seçenek kartları aynı boyda, büyüme karşılaştırılabilsin
  const boyGrubu = s.tip === 'SIRADAKI' && s.gosterge && diziOlcekli(s.gosterge) && diziOlcekli(s.kartlar) ? kwGrubu() : undefined;

  // ---- Gösterge ----
  if (s.tip === 'SAY' && s.gosterge?.length) {
    const dizi = h('div.izgara');
    const gGenis = diziGenis(s.gosterge);
    const kartlar = s.gosterge.map((g) => kartEl(g, { sinif: 'giris', genis: gGenis }));
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
    if (diziOlcekli(s.gosterge)) yuva.classList.add('olcekli');
    dizi.append(yuva);
    b.temizlik(izgaraSigdir(b.gosterge, dizi, s.gosterge.length + 1, { enBuyuk: 170, bosluk: 10, oran: diziOrani(s.gosterge), grup: boyGrubu }));
    b.gosterge.append(dizi);
  } else if (s.gosterge?.length) {
    const dizi = h('div.izgara');
    const gosGenis = diziGenis(s.gosterge);
    s.gosterge.forEach((g, i) => {
      const k = kartEl(g, { sinif: 'giris', genis: gosGenis });
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
  // bir dizide kartlar aynı boyda: 4+ adetli kart varsa hepsi geniş
  const sGenis = diziGenis(s.kartlar);
  s.kartlar.forEach((g, i) => {
    const el = kartEl(g, { sinif: 'secenek giris', genis: sGenis });
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
          const klon = kartEl(g, { genis: sGenis });
          el.style.visibility = 'hidden';
          efekt.ucus();
          const oran = yuva.getBoundingClientRect().width / Math.max(1, el.getBoundingClientRect().width);
          void ucur(b.app.kok, klon, el, yuva, oran, 450).then(() => {
            const yeni = kartEl(g, { sinif: 'dogru-oldu', genis: sGenis });
            yuva!.replaceWith(yeni);
            b.dogru(yeni, dogruCumlesi(s, g));
          });
        } else {
          el.classList.add('dogru-oldu');
          b.dogru(el, dogruCumlesi(s, g));
        }
      } else {
        b.yanlis(el, elemanlar[dogru]);
      }
    });
    elemanlar.push(el);
    izgara.append(el);
  });
  b.temizlik(izgaraSigdir(b.secenek, izgara, s.kartlar.length, { enBuyuk: s.kartlar.length <= 2 ? 300 : 240, oran: diziOrani(s.kartlar), grup: boyGrubu }));
  b.secenek.append(izgara);
}
