/**
 * Minkino Kartlar — gömülebilir giriş noktası.
 *
 * Ana Minkino uygulaması bu oyunu şöyle açar:
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 * Oyun tüm arayüzünü `kokEleman` içine çizer; `kapat()` her şeyi temizler.
 */
import { acilisEkrani } from './screens/acilis';
import { albumEkrani } from './screens/album';
import { ebeveynEkrani } from './screens/ebeveyn';
import { oyunEkrani } from './screens/oyun';
import { temalarEkrani } from './screens/temalar';
import { turSonuEkrani } from './screens/turSonu';
import { yasEkrani } from './screens/yas';
import { durum } from './engine/ilerleme';
import type { Yas } from './engine/types';
import { ekranKaydet, Uygulama, type BaslatSecenekleri, type EkranAdi } from './uygulama';

ekranKaydet('acilis', acilisEkrani);
ekranKaydet('yas', yasEkrani);
ekranKaydet('temalar', temalarEkrani);
ekranKaydet('oyun', oyunEkrani);
ekranKaydet('turSonu', turSonuEkrani);
ekranKaydet('album', albumEkrani);
ekranKaydet('ebeveyn', ebeveynEkrani);

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  const app = new Uygulama(kok, secenekler);
  const q = new URLSearchParams(location.search);
  if (q.has('test') && q.get('yas')) {
    // Test kısayolu: ?test=1&yas=5&tema=sayilar[&ekran=album]
    durum.i.yas = Number(q.get('yas')) as Yas;
    if (q.get('ekran')) app.git(q.get('ekran') as EkranAdi, { tema: q.get('tema') ?? 'hayvanlar' });
    else app.git('oyun', { tema: q.get('tema') ?? 'hayvanlar' });
  } else app.git('acilis');
  if (import.meta.env.DEV || new URLSearchParams(location.search).has('test')) {
    (window as unknown as { __minkino: Uygulama }).__minkino = app;
  }
  return () => app.kapat();
}
