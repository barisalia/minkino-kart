/**
 * Dedektif Mino — gömülebilir giriş noktası (pazar/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Ekranlar: acilis (vaka seçimi: iki dosya), vaka (Vaka 1: Devrilen Lamba), vaka2 (Vaka 2: Kino'nun Kayıp Atkısı;
 * Vaka 1 çözülünce açılır), dosya (Vaka Dosyam: çizgi romanlar).
 * Test / gösterim: ?test=1&ekran=vaka&adim=tuy (doğrudan bir halkaya), &ekran=vaka2&adim=kim, &sifirla=1 (kayıt
 * sıfırlanır), &cozuldu=1 (Vaka 1 çözülmüş sayılır), &cozuldu=2 (iki vaka da), &tohum=3 (sabit rastgelelik).
 */
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { acilisEkrani, dosyaEkrani } from './ekranlar';
import { kayit, kaydet, sifirla } from './kayit';
import { ADIMLAR, type Adim } from './mantik';
import { adim2mi } from './mantik2';
import { vakaEkrani } from './vaka';
import { vaka2Ekrani } from './vaka2';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('acilis', acilisEkrani);
  ekranKaydet('vaka', vakaEkrani);
  ekranKaydet('vaka2', vaka2Ekrani);
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
    if (q.has('cozuldu')) {
      const n = Number(q.get('cozuldu')) || 1;
      for (const v of ['vaka1', 'vaka2'].slice(0, n)) if (!kayit.cozulen.includes(v)) kayit.cozulen.push(v);
      kaydet();
    }
    ekran = q.get('ekran') ?? 'acilis';
    const a = q.get('adim');
    if (ekran === 'vaka2') {
      if (adim2mi(a)) param = { adim: a };
    } else if (a && (ADIMLAR as readonly string[]).includes(a)) {
      ekran = q.get('ekran') ?? 'vaka';
      param = { adim: a as Adim };
    }
    (window as unknown as { __dedektif: unknown }).__dedektif = { app, kayit };
  }
  app.git(ekran, param);
  return () => {
    app.kapat();
    kok.classList.remove('dd-kok', 'mk-kok', 'test-modu');
  };
}
