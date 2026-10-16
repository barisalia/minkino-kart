/**
 * Pati Dükkânı — gömülebilir giriş noktası (kino-otobus/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 * Menüde yok (uygulama/src/oyunlar.ts → PATI_MENUDE = false): yalnız web'de /pati/ adresinden açılır.
 * v2 (ekip/senaryo/PATI-V2.md): dukkan.ts (vitrin + salon; paket 2-3 genişletir). v1 "İlk Gün" akışı (gun.ts) artık
 * açılmıyor; bakım el işleri ve kapanış (foto) paket 2'de oradan taşınır.
 * Test: ?test=1&yas=kucuk|buyuk (yaş sorulmadan), &sifirla=1, &jeton=N, &panel=salon (dukkan.ts).
 * Önizleme: ?onizleme=1 (gerçek hız, window.__pati açık).
 */
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { dukkanEkrani } from './dukkan';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  // ?onizleme=1: gerçek hızda gösterim ve kare kare izleme (window.__pati açık, beklemeler kısalmaz)
  if (typeof location !== 'undefined' && new URLSearchParams(location.search).has('onizleme')) document.body.dataset.onizleme = '1';
  ekranKaydet('pati', dukkanEkrani);
  const app = new Uygulama(kok, secenekler);
  kok.classList.add('pt-kok');
  app.git('pati');
  return () => {
    app.kapat();
    kok.classList.remove('pt-kok', 'mk-kok', 'test-modu');
  };
}
