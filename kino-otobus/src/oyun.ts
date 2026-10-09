/**
 * Kino'nun Otobüsü (dondurma) — gömülebilir giriş noktası (pasta/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Test / gösterim: ?test=1&ekran=gun&gun=2 (doğrudan güne), &yas=kucuk|buyuk, &sifirla=1 (kaydı sıfırlar), &jeton=20,
 * &alinan=flama,jant (dükkândan alınmış say), &ekran=aksam&gun=1&kazanc=12 (akşam), &ipucu=1 (el ipucu testte de).
 */
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { acilisEkrani, aksamEkrani } from './ekranlar';
import { gunEkrani } from './gun';
import { kaydet, kayit, sifirla } from './kayit';
import { GUN_SAYISI, OTOBUS_SUSLERI } from './model';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('acilis', acilisEkrani);
  ekranKaydet('gun', gunEkrani);
  ekranKaydet('aksam', aksamEkrani);

  const app = new Uygulama(kok, secenekler);
  kok.classList.add('ko-kok');
  const q = new URLSearchParams(location.search);
  const kisayol = q.has('test') || q.has('onizleme');
  let ekran = 'acilis';
  let param: unknown;
  if (kisayol) {
    if (q.has('onizleme')) document.body.dataset.onizleme = '1';
    if (q.has('sifirla')) sifirla();
    const yas = q.get('yas');
    if (yas === 'kucuk' || yas === 'buyuk') kayit.yas = yas;
    const j = Number(q.get('jeton'));
    if (q.has('jeton') && j >= 0) kayit.jeton = Math.floor(j);
    for (const x of (q.get('alinan') ?? '').split(',')) if (OTOBUS_SUSLERI.some((s) => s.id === x) && !kayit.alinan.includes(x)) kayit.alinan.push(x);
    const g = Number(q.get('gun'));
    if (g >= 1 && g <= GUN_SAYISI) {
      kayit.acikGun = Math.max(kayit.acikGun, g);
      param = { gun: g, kazanc: Number(q.get('kazanc')) || 0, mutlu: Number(q.get('mutlu')) || 0 };
    }
    // doğrudan güne gidilince yaş sorulmaz
    if (q.get('ekran') && !kayit.yas) kayit.yas = 'kucuk';
    kaydet();
    ekran = q.get('ekran') ?? 'acilis';
    (window as unknown as { __koOtobus: unknown }).__koOtobus = { app, kayit };
  }
  app.git(ekran, param);
  return () => {
    app.kapat();
    kok.classList.remove('ko-kok', 'mk-kok', 'test-modu');
  };
}
