/**
 * Mino'nun Pazarı — gömülebilir giriş noktası.
 *
 * Ana Minkino uygulaması bu oyunu şöyle açar:
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 * Oyun tüm arayüzünü `kokEleman` içine çizer; `kapat()` her şeyi temizler.
 */
import { durum, kaydetDurum } from '../../src/engine/ilerleme';
import type { Yas } from '../../src/engine/types';
import { yasEkrani } from '../../src/screens/yas';
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { acilisEkrani, pazarEkrani, senlikEkrani } from './ekranlar';
import { kayit } from './ilerleme';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  // Ekranlar her açılışta kaydedilir: başka bir oyun aynı adları kullandıysa bu oyunun ekranları geçerli olur
  ekranKaydet('acilis', acilisEkrani);
  ekranKaydet('yas', yasEkrani);
  ekranKaydet('pazar', pazarEkrani);
  ekranKaydet('senlik', senlikEkrani);

  const app = new Uygulama(kok, secenekler);
  kok.classList.add('pz-kok');
  const q = new URLSearchParams(location.search);
  if (q.has('test')) {
    // Test kısayolu: ?test=1&yas=4&ekran=pazar
    const y = Number(q.get('yas'));
    if (y >= 3 && y <= 6) {
      durum.i.yas = y as Yas;
      kaydetDurum();
    }
    (window as unknown as { __pazar: unknown }).__pazar = { app, kayit };
  }
  const ekran = q.has('test') ? q.get('ekran') : null;
  app.git(ekran ?? 'acilis');
  return () => {
    app.kapat();
    kok.classList.remove('pz-kok', 'mk-kok', 'test-modu');
  };
}
