/**
 * Okula Hazırım! — gömülebilir giriş noktası (pazar/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Test / gösterim: ?test=1&yas=3 (yaş), &sifirla=1 (kayıt sıfırlanır), &ekran=bolge|etkinlik|sonuc|album,
 * &etkinlik=kac-elma (doğrudan etkinliğe), &tohum=7 (sabit rastgelelik), &biten=kac-elma,sayi-karti (bitmiş say).
 */
import { durum, kaydetDurum } from '../../src/engine/ilerleme';
import type { Yas } from '../../src/engine/types';
import { yasEkrani } from '../../src/screens/yas';
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { albumEkrani, bolgeEkrani, etkinlikEkrani, haritaEkrani, sonucEkrani } from './ekranlar';
import { etkinlik } from './etkinlik';
// Sayı Bahçesi'nin etkinlikleri (belgedeki sırayla kaydolur)
import './etkinlikler/kac-elma';
import './etkinlikler/sayi-karti';
import './etkinlikler/sepete-koy';
import './etkinlikler/hangisinde-cok';
import './etkinlikler/bir-fazla';
import './etkinlikler/merdiven';
import './etkinlikler/kac-alkis';
import './etkinlikler/rakam-ciz';
import './etkinlikler/kuslar';
import './etkinlikler/piknik';
import { kaydetKayit, kayit, sifirla } from './kayit';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  // Ekranlar her açılışta kaydedilir: başka bir oyun aynı adları kullandıysa bu oyunun ekranları geçerli olur.
  // 'acilis' = Okul Yolu haritası (yaş ekranının geri düğmesi de buraya döner)
  ekranKaydet('acilis', haritaEkrani);
  ekranKaydet('yas', yasEkrani);
  ekranKaydet('bolge', bolgeEkrani);
  ekranKaydet('etkinlik', etkinlikEkrani);
  ekranKaydet('sonuc', sonucEkrani);
  ekranKaydet('album', albumEkrani);

  const app = new Uygulama(kok, secenekler);
  kok.classList.add('ok-kok');
  const q = new URLSearchParams(location.search);
  const kisayol = q.has('test') || q.has('onizleme');
  let ekran = 'acilis';
  let param: unknown;
  if (kisayol) {
    if (q.has('onizleme')) document.body.dataset.onizleme = '1';
    if (q.has('sifirla')) sifirla();
    const y = Number(q.get('yas'));
    if (y >= 3 && y <= 6) {
      durum.i.yas = y as Yas;
      kaydetDurum();
    }
    for (const id of (q.get('biten') ?? '').split(',')) {
      if (etkinlik(id) && !kayit.biten.includes(id)) kayit.biten.push(id);
    }
    kaydetKayit();
    ekran = q.get('ekran') ?? 'acilis';
    const id = q.get('etkinlik');
    if (id && etkinlik(id)) {
      ekran = q.get('ekran') ?? 'etkinlik';
      param = { id };
    }
    (window as unknown as { __okul: unknown }).__okul = { app, kayit };
  }
  app.git(ekran, param);
  return () => {
    app.kapat();
    kok.classList.remove('ok-kok', 'mk-kok', 'test-modu');
  };
}
