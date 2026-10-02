/**
 * Mino'nun Pasta Otobüsü — gömülebilir giriş noktası (pazar/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Test / gösterim: ?test=1&ekran=gun&gun=3 (doğrudan güne), &sifirla=1 (kaydı sıfırlar), &jeton=20,
 * &alinan=sapka,kalip-ay (dükkândan alınmış say), &firin=700,30000 (fırın ms), &sabir=3000, &cilek=1,
 * &yildiz=6 (toplam yıldız: günlere üçer dağıtılır; yükseltmeler açılır).
 */
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { acilisEkrani, aksamEkrani } from './ekranlar';
import { gunEkrani } from './gun';
import { kaydet, kayit, sifirla } from './kayit';
import { RAF, SON_OYNANAN } from './model';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('acilis', acilisEkrani);
  ekranKaydet('gun', gunEkrani);
  ekranKaydet('aksam', aksamEkrani);

  const app = new Uygulama(kok, secenekler);
  kok.classList.add('ps-kok');
  const q = new URLSearchParams(location.search);
  const kisayol = q.has('test') || q.has('onizleme');
  let ekran = 'acilis';
  let param: unknown;
  if (kisayol) {
    if (q.has('onizleme')) document.body.dataset.onizleme = '1';
    if (q.has('sifirla')) sifirla();
    const j = Number(q.get('jeton'));
    if (j >= 0 && q.has('jeton')) kayit.jeton = Math.floor(j);
    const al = (q.get('alinan') ?? '').split(',').filter((x) => RAF.some((r) => r.id === x));
    for (const x of al) if (!kayit.alinan.includes(x)) kayit.alinan.push(x);
    if (q.has('yildiz')) {
      let y = Math.max(0, Math.floor(Number(q.get('yildiz')) || 0));
      kayit.yildiz = {};
      for (let g = 1; g <= 10 && y > 0; g++, y -= 3) kayit.yildiz[String(g)] = Math.min(3, y);
    }
    const g = Number(q.get('gun'));
    if (g >= 1 && g <= SON_OYNANAN) {
      kayit.acikGun = Math.max(kayit.acikGun, g);
      param = { gun: g, kazanc: Number(q.get('kazanc')) || 0 };
    }
    kaydet();
    ekran = q.get('ekran') ?? 'acilis';
    (window as unknown as { __pasta: unknown }).__pasta = { app, kayit };
  }
  app.git(ekran, param);
  return () => {
    app.kapat();
    kok.classList.remove('ps-kok', 'mk-kok', 'test-modu');
  };
}
