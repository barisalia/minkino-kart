import { efekt, konus } from '../audio/ses';
import { metin } from '../audio/metin';
import { albumKartlari, temaBul, TEMALAR } from '../engine/katalog';
import { durum } from '../engine/ilerleme';
import { temaDurumu } from '../engine/odul';
import type { Tema } from '../engine/types';
import { h, svg, TEST_MODU } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { kartEl, kartResimleriniYukle } from '../ui/kart';
import { kartSesi } from '../audio/cumleler';
import { azHareket, sinifOynat } from '../ui/hareket';
import { baslikBalon, yuvarlakDugme } from '../ui/ortak';
import type { Ekran, Uygulama } from '../uygulama';

/** Bir temanın albüm sayfası: kazanılan kartlar renkli, diğerleri gri siluet. */
export function albumSayfasi(t: Tema, sec: { yeni?: string[] } = {}): HTMLElement {
  const sahip = new Set(durum.i.album);
  const yeni = sec.yeni ?? [];
  const kartlar = albumKartlari(t.id);
  const alinan = kartlar.filter((k) => sahip.has(k.id)).length;

  const izgara = h('div.album-izgara');
  let parilti = 0;
  kartlar.forEach((k) => {
    const var_ = sahip.has(k.id);
    const el = kartEl(k.id, { sinif: var_ ? 'var' : 'yok', ornek: true });
    // koleksiyon parıltısı: kazanılmış kartların üstünden sırayla ışık geçer
    if (var_) el.append(h('i.kart-parilti', { style: `--p:${parilti++ % 7}`, 'aria-hidden': 'true' }));
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', var_ ? k.ad : 'Bulunmamış kart');
    const yeniSira = yeni.indexOf(k.id);
    if (yeniSira >= 0) {
      el.classList.add('yeni');
      el.style.setProperty('--i', String(yeniSira));
    }
    el.addEventListener('click', () => {
      if (var_) {
        efekt.secim();
        void sinifOynat(el, 'ziplat', 500);
        void konus(kartSesi(k.id));
      } else {
        efekt.kilitli();
        void sinifOynat(el, 'sallan', 500);
        void konus(metin('album_gri'));
      }
    });
    izgara.append(el);
  });

  return h(
    'div.album-sayfa',
    { style: `--r:${t.renk}`, 'data-tema': t.id },
    h('div.album-baslik', {}, h('span', {}, t.ad), h('span.album-sayac', {}, svg(IKON.album), `${alinan} / ${kartlar.length}`)),
    izgara,
    alinan === 0 ? h('div.album-bos', {}, 'Oynadıkça kartlar burada birikecek!') : null,
  );
}

export function albumEkrani(app: Uygulama, param?: { tema?: string }): Ekran {
  kartResimleriniYukle();
  let secili = temaBul(param?.tema ?? '') ?? TEMALAR[0];
  const sekmeler = h('div.album-sekmeler', { role: 'tablist' });
  const sayfaKutu = h('div.sayfa-kutu');

  /**
   * Sayfa çevirme: eski sayfa sırttan (ileri: sol kenar, geri: sağ kenar) kalkıp döner ve gölgelenerek kaybolur;
   * altından yeni sayfa görünür, kartları çıkartma gibi sırayla yerine oturur. İlk açılışta albüm kapağı açılır gibi.
   */
  function sayfaCevir(onceki: HTMLElement | null, yeni: HTMLElement, ileri: boolean, kaydirma: number) {
    if (TEST_MODU || azHareket()) {
      sayfaKutu.replaceChildren(yeni);
      return;
    }
    const kartlar = [...yeni.querySelectorAll<HTMLElement>('.album-izgara .kart')];
    kartlar.forEach((k, i) =>
      k.animate([{ transform: 'scale(.6) rotate(-6deg)', opacity: 0 }, { transform: 'scale(1.06) rotate(1deg)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], {
        duration: 360,
        delay: (onceki ? 220 : 260) + Math.min(i, 18) * 28,
        easing: 'cubic-bezier(.3,.8,.4,1)',
        fill: 'backwards',
        composite: 'add',
      }),
    );
    if (!onceki) {
      sayfaKutu.replaceChildren(yeni);
      yeni.style.transformOrigin = 'left center';
      yeni.animate([{ transform: 'perspective(1600px) rotateY(-70deg)', opacity: 0 }, { transform: 'perspective(1600px) rotateY(6deg)', opacity: 1, offset: 0.75 }, { transform: 'none', opacity: 1 }], {
        duration: 560,
        easing: 'cubic-bezier(.25,.8,.35,1)',
      });
      return;
    }
    Object.assign(onceki.style, { position: 'absolute', left: '0', right: '0', top: `${-kaydirma}px`, zIndex: '3', transformOrigin: ileri ? 'left center' : 'right center', pointerEvents: 'none' });
    const golge = h('i.sayfa-golge', { style: `--yon:${ileri ? '90deg' : '-90deg'}` });
    onceki.append(golge);
    sayfaKutu.replaceChildren(yeni, onceki);
    const aci = ileri ? -92 : 92;
    onceki
      .animate([{ transform: 'perspective(1600px) rotateY(0deg)', opacity: 1 }, { transform: `perspective(1600px) rotateY(${aci * 0.7}deg)`, opacity: 1, offset: 0.7 }, { transform: `perspective(1600px) rotateY(${aci}deg)`, opacity: 0 }], {
        duration: 520,
        easing: 'cubic-bezier(.45,.05,.7,.6)',
        fill: 'forwards',
      })
      .finished.then(() => onceki.remove(), () => onceki.remove());
    golge.animate([{ opacity: 0 }, { opacity: 0.55 }], { duration: 520, fill: 'forwards' });
    // alttaki yeni sayfa önce gölgede, sayfa kalkınca aydınlanır
    const alt = h('i.sayfa-golge.alt');
    yeni.append(alt);
    alt.animate([{ opacity: 0.35 }, { opacity: 0 }], { duration: 520, fill: 'forwards' }).finished.then(() => alt.remove(), () => alt.remove());
  }
  const kaydir = h('div.kaydir', {}, sayfaKutu);

  function goster(t: Tema, konusma = true) {
    const ileri = TEMALAR.indexOf(t) >= TEMALAR.indexOf(secili);
    secili = t;
    [...sekmeler.children].forEach((s) => s.classList.toggle('secili', (s as HTMLElement).dataset.tema === t.id));
    const onceki = sayfaKutu.firstElementChild as HTMLElement | null;
    const yeni = albumSayfasi(t);
    sayfaCevir(onceki, yeni, ileri, kaydir.scrollTop);
    kaydir.scrollTop = 0;
    if (konusma) {
      const bos = !albumKartlari(t.id).some((k) => durum.i.album.includes(k.id));
      void konus([`${t.ad}.`, bos ? metin('album_bos') : '']);
    }
  }

  TEMALAR.forEach((t) => {
    const acik = temaDurumu(t, durum.i.album.length, durum.i.premium).acik;
    const s = h('button.sekme', { style: `--r:${t.renk}`, 'data-tema': t.id, 'aria-label': t.ad, role: 'tab', type: 'button' }, kartEl(t.kapak));
    if (!acik) s.classList.add('kilitli');
    s.addEventListener('click', () => {
      efekt.sayfa();
      goster(t);
    });
    sekmeler.append(s);
  });

  const el = h(
    'div.album',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.geri()), h('div.orta', {}, baslikBalon('Albümüm', metin('album'))), h('div', { style: 'width:72px' })),
    sekmeler,
    kaydir,
  );
  goster(secili, false);
  void konus(metin('album'));
  return { el };
}
