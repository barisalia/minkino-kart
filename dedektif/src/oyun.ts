/**
 * Dedektif Mino — gömülebilir giriş noktası (pazar/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Ekranlar: acilis (vaka dosyası), vaka (Vaka 1: Devrilen Lamba), dosya (Vaka Dosyam: çizgi romanlar).
 * Test / gösterim: ?test=1&ekran=vaka&adim=tuy (doğrudan bir halkaya), &sifirla=1 (kayıt sıfırlanır), &cozuldu=1
 * (Vaka 1 çözülmüş sayılır), &tohum=3 (sabit rastgelelik: kart sırası, yolların yanı).
 */
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { acilisEkrani, dosyaEkrani } from './ekranlar';
import { kayit, kaydet, sifirla } from './kayit';
import { ADIMLAR, type Adim } from './mantik';
import { vakaEkrani } from './vaka';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('acilis', acilisEkrani);
  ekranKaydet('vaka', vakaEkrani);
  ekranKaydet('dosya', dosyaEkrani);

  const app = new Uygulama(kok, secenekler);
  kok.classList.add('dd-kok');
  const q = new URLSearchParams(location.search);
  const kisayol = q.has('test') || q.has('onizleme');
  let ekran = 'acilis';
  let param: unknown;
  if (kisayol) {
    if (q.has('onizleme')) document.body.dataset.onizleme = '1';
    if (q.has('sifirla')) sifirla();
    if (q.has('cozuldu') && !kayit.cozulen.includes('vaka1')) {
      kayit.cozulen.push('vaka1');
      kaydet();
    }
    ekran = q.get('ekran') ?? 'acilis';
    const a = q.get('adim') as Adim | null;
    if (a && (ADIMLAR as readonly string[]).includes(a)) {
      ekran = q.get('ekran') ?? 'vaka';
      param = { adim: a };
    }
    (window as unknown as { __dedektif: unknown }).__dedektif = { app, kayit };
  }
  app.git(ekran, param);
  return () => {
    app.kapat();
    kok.classList.remove('dd-kok', 'mk-kok', 'test-modu');
  };
}
