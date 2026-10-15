/**
 * Pati Dükkânı — gömülebilir giriş noktası (kino-otobus/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 * Menüde yok (uygulama/src/oyunlar.ts → PATI_MENUDE = false): yalnız web'de /pati/ adresinden açılır.
 * Test: ?test=1&yas=kucuk|buyuk (yaş sorulmadan sabaha), &kendiliginden=1 (yardım merdiveni testte de), &sifirla=1.
 */
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { TEST_MODU } from '../../src/ui/dom';
import { patiEkrani } from './gun';
import { kaydet, kayit } from './kayit';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('pati', patiEkrani);
  const app = new Uygulama(kok, secenekler);
  kok.classList.add('pt-kok');
  if (TEST_MODU && new URLSearchParams(location.search).has('sifirla')) {
    kayit.yas = null;
    kaydet();
  }
  app.git('pati');
  return () => {
    app.kapat();
    kok.classList.remove('pt-kok', 'mk-kok', 'test-modu');
  };
}
