/**
 * Kino'nun Otobüsü (dondurma) — gömülebilir giriş noktası (pasta/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Test / gösterim: ?test=1&ekran=gun&gun=2 (doğrudan güne), &yas=kucuk|buyuk, &sifirla=1 (kaydı sıfırlar), &jeton=20,
 * &alinan=flama,jant (dükkândan alınmış say), &ekran=aksam&gun=1&kazanc=12 (akşam), &ipucu=1 (el ipucu testte de).
 * ?onizleme=1 (gerçek hız): kaydı değiştirmez, kilidi atlatmaz; yalnız açılışa ya da sırası gelmiş açık güne gider.
 */
import { kilitli } from '../../src/engine/erisim';
import { TEST_MODU } from '../../src/ui/dom';
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
    const yas = q.get('yas');
    if (yas === 'kucuk' || yas === 'buyuk') kayit.yas = yas;
    const g = Number(q.get('gun'));
    const gunVar = g >= 1 && g <= GUN_SAYISI;
    ekran = q.get('ekran') ?? 'acilis';
    if (TEST_MODU) {
      // kaydı değiştiren kısayollar (sıfırla, jeton, süs, gün açma, akşam) yalnız test modunda
      if (q.has('sifirla')) {
        sifirla();
        if (yas === 'kucuk' || yas === 'buyuk') kayit.yas = yas;
      }
      const j = Number(q.get('jeton'));
      if (q.has('jeton') && j >= 0) kayit.jeton = Math.floor(j);
      for (const x of (q.get('alinan') ?? '').split(',')) if (OTOBUS_SUSLERI.some((s) => s.id === x) && !kayit.alinan.includes(x)) kayit.alinan.push(x);
      if (gunVar) {
        kayit.acikGun = Math.max(kayit.acikGun, g);
        param = { gun: g, kazanc: Number(q.get('kazanc')) || 0, mutlu: Number(q.get('mutlu')) || 0 };
      }
    } else if (ekran === 'gun' && gunVar && g <= kayit.acikGun && !kilitli(`kino-otobus/gun-${g}`)) {
      // ?onizleme=1 (gerçek hızda gösterim): yalnız sırası gelmiş ve erişimi olan güne gidilir; ilerleme yazılmaz
      param = { gun: g };
    } else ekran = 'acilis';
    // doğrudan güne gidilince yaş sorulmaz
    if (ekran !== 'acilis' && !kayit.yas) kayit.yas = 'kucuk';
    kaydet();
    (window as unknown as { __koOtobus: unknown }).__koOtobus = { app, kayit };
  }
  app.git(ekran, param);
  return () => {
    app.kapat();
    kok.classList.remove('ko-kok', 'mk-kok', 'test-modu');
  };
}
