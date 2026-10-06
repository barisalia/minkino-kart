/**
 * Kino Ne Giysin? — gömülebilir giriş noktası (dedektif/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Ekranlar: oda (istek, perde, dolap, giyinme, ayna, kapı), disari (kardan adam, fotoğraf), album.
 * Test / gösterim: ?test=1&ekran=oda&adim=perde|dolap|giyin|kapi, &ekran=disari, &ekran=album, &sifirla=1.
 */
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { albumEkrani } from './album';
import { disariEkrani } from './dis';
import { kayit, sifirla } from './kayit';
import { odaEkrani } from './oda';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('oda', odaEkrani);
  ekranKaydet('disari', disariEkrani);
  ekranKaydet('album', albumEkrani);
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
  if (q.has('test') || q.has('onizleme')) {
    if (q.has('sifirla')) sifirla();
    ekran = q.get('ekran') ?? 'oda';
    (window as unknown as { __giysin: unknown }).__giysin = { app, kayit };
  }
  app.git(ekran);
  return () => {
    app.kapat();
    kok.classList.remove('gy-kok', 'mk-kok', 'test-modu');
  };
}
