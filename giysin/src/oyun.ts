/**
 * Kino Ne Giysin? — gömülebilir giriş noktası (dedektif/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Ekranlar: oda (istek, perde, dolap, giyinme, küçük görev, ayna, kapı), disari (dış sahne, fotoğraf), album,
 * gecis (mevsim geçişi). Dört mevsim: kış ücretsiz, ilkbahar / yaz / sonbahar abonelikle (src/engine/erisim.ts).
 * Açılışta fotoğrafı henüz çekilmemiş ilk açık mevsim; hepsi çekildiyse kış.
 * Test / gösterim: ?test=1&ekran=oda&mevsim=yaz&adim=perde|dolap|giyin|gorev|kapi, &ekran=disari, &ekran=album,
 * &sifirla=1, &album=kis,ilkbahar,yaz (albümü önceden doldurur).
 */
import { kilitli } from '../../src/engine/erisim';
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { albumEkrani } from './album';
import { disariEkrani } from './dis';
import { gecisEkrani } from './gecis';
import { guvenliTaklit } from './guvenli';
import { kaydet, kayit, sifirla } from './kayit';
import { MEVSIMLER, type Mevsim } from './model';
import { odaEkrani } from './oda';

export type { BaslatSecenekleri };

/** Açılış mevsimi: albümde olmayan ilk açık mevsim (kilitliler atlanır); yoksa kış */
export function acilisMevsimi(): Mevsim {
  return MEVSIMLER.find((m) => !kayit.album.includes(m) && !kilitli(`giysin/${m}`)) ?? 'kis';
}

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('oda', odaEkrani);
  ekranKaydet('disari', disariEkrani);
  ekranKaydet('album', albumEkrani);
  ekranKaydet('gecis', gecisEkrani);
  const app = new Uygulama(kok, secenekler);
  kok.classList.add('gy-kok');
  // dünya ekrandan geniş (kapı solda bekler): odak / dokunma kabı kaydırmasın, kamera yalnız transform'la
  kok.addEventListener(
    'scroll',
    (e) => {
      const t = e.target as HTMLElement;
      if (t.scrollLeft || t.scrollTop) t.scrollTo(0, 0);
    },
    true,
  );
  const q = new URLSearchParams(location.search);
  let ekran = 'oda';
  if ((q.has('test') || q.has('onizleme')) && q.has('sifirla')) sifirla();
  // çentikli telefon taklidi (?guvenli=ust,sag,alt,sol)
  if (q.has('test') || q.has('onizleme')) guvenliTaklit(kok);
  let mevsim = acilisMevsimi();
  if (q.has('test') || q.has('onizleme')) {
    const album = q.get('album');
    if (album) {
      kayit.album = album.split(',').filter((m): m is Mevsim => MEVSIMLER.includes(m as Mevsim));
      kayit.rozet = q.has('rozet');
      kaydet();
    }
    ekran = q.get('ekran') ?? 'oda';
    const m = q.get('mevsim') as Mevsim | null;
    if (m && MEVSIMLER.includes(m)) mevsim = m;
    (window as unknown as { __giysin: unknown }).__giysin = { app, kayit };
  }
  app.git(ekran, ekran === 'gecis' ? { den: q.get('den') ?? 'kis', ye: mevsim } : { mevsim });
  return () => {
    app.kapat();
    kok.classList.remove('gy-kok', 'mk-kok', 'test-modu');
  };
}
