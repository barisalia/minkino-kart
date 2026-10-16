/**
 * Tıkır Tıkır Lokanta: gömülebilir giriş noktası (kino-otobus/src/oyun.ts kalıbı).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Test / gösterim: ?test=1&ekran=lokanta (doğrudan lokanta), &yas=kucuk|buyuk, &sifirla=1 (kaydı siler),
 * &gun=2, &jeton=20, &acilan=ayran,patates,masa-3,saksi,bahce (defter kalemi aç: tarif aletiyle, masa / süs ilk boş
 * yuvaya, bahçe masalarıyla), &yeni=ayran (dün alınmış gibi: bugün istenir, Babaanne tadar), &babaanne=1 (anahtar töreni), &tohum=5 (günün planı sabit), &musteriler=lokum,zipzip
 * (önce gelenler), &ipucu=1 (ipucu merdiveni 20 kat hızlı).
 * ?onizleme=1 (gerçek hız): kaydı değiştiren kısayollar çalışmaz.
 */
import { TEST_MODU } from '../../src/ui/dom';
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { acilisEkrani } from './lokanta/acilis';
import { lokantaEkrani } from './lokanta/lokanta';
import { kaydet, kayit, sifirla } from './kayit';
import { kalem, yerlesmemisleriKoy } from './ekonomi';
import { TARIFLER } from './model';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('acilis', acilisEkrani);
  ekranKaydet('lokanta', lokantaEkrani);

  const app = new Uygulama(kok, secenekler);
  kok.classList.add('rs-kok');
  const q = new URLSearchParams(location.search);
  let ekran = 'acilis';
  let param: unknown;
  if (q.has('test') || q.has('onizleme')) {
    if (q.has('onizleme')) document.body.dataset.onizleme = '1';
    const yas = q.get('yas');
    if (TEST_MODU) {
      if (q.has('sifirla')) sifirla();
      if (yas === 'kucuk' || yas === 'buyuk') kayit.yas = yas;
      const j = Number(q.get('jeton'));
      if (j >= 0 && q.has('jeton')) kayit.jeton = j;
      const g = Number(q.get('gun'));
      if (g >= 1) kayit.gun = g - 1;
      for (const t of (q.get('acilan') ?? '').split(',')) {
        const k = kalem(t);
        if (TARIFLER[t] && !kayit.acilan.tarif.includes(t)) kayit.acilan.tarif.push(t);
        if (k?.alet && !kayit.acilan.alet.includes(k.alet)) kayit.acilan.alet.push(k.alet);
        if (k?.sekme === 'masa' && !kayit.acilan.masa.includes(t)) kayit.acilan.masa.push(t);
        if (k?.sekme === 'sus' && !kayit.acilan.sus.includes(t)) {
          kayit.acilan.sus.push(t);
          if (k.yer === 'ortu') kayit.ortu = t.replace(/^ortu-/, '');
        }
        if (t === 'bahce' && !kayit.acilan.bolum.includes(t)) {
          kayit.acilan.bolum.push(t);
          kayit.acilan.masa.push('bahce-masa-1', 'bahce-masa-2');
        }
      }
      yerlesmemisleriKoy(kayit);
      const yeni = q.get('yeni');
      if (yeni && TARIFLER[yeni] && kayit.acilan.tarif.includes(yeni)) kayit.yeniTarif = yeni;
      kaydet();
    }
    if (q.get('ekran') === 'lokanta') ekran = 'lokanta';
    if (ekran !== 'acilis' && !kayit.yas) kayit.yas = 'kucuk';
    param = { tohum: Number(q.get('tohum')) || undefined, once: q.get('musteriler')?.split(',').filter(Boolean) };
    (window as unknown as { __rsLokanta: unknown }).__rsLokanta = { app, kayit };
  }
  app.git(ekran, param);
  return () => {
    app.kapat();
    kok.classList.remove('rs-kok', 'mk-kok', 'test-modu');
  };
}
