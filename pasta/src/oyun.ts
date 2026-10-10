/**
 * Mino ile Kino'nun Pasta Otobüsü — gömülebilir giriş noktası (pazar/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Test / gösterim: ?test=1&ekran=gun&gun=3 (doğrudan güne), &sifirla=1 (kaydı sıfırlar), &jeton=20,
 * &alinan=sapka (dükkândan alınmış say), &firin=700,30000 (fırın ms), &sabir=3000, &ipucu=1 (el ipucu testte de),
 * &yildiz=6 (toplam yıldız: günlere üçer dağıtılır).
 * ?onizleme=1 (gerçek hız): kaydı değiştirmez, kilidi atlatmaz; yalnız açılışa ya da sırası gelmiş açık güne gider.
 */
import { kilitli } from '../../src/engine/erisim';
import { TEST_MODU } from '../../src/ui/dom';
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { acilisEkrani, aksamEkrani } from './ekranlar';
import { gunEkrani } from './gun';
import { kaydet, kayit, sifirla } from './kayit';
import { oynanirMi, RAF, SON_OYNANAN } from './model';

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
    const g = Number(q.get('gun'));
    const gunVar = oynanirMi(g);
    ekran = q.get('ekran') ?? 'acilis';
    if (TEST_MODU) {
      // kaydı değiştiren kısayollar (sıfırla, jeton, raf, yıldız, gün açma, akşam) yalnız test modunda
      if (q.has('sifirla')) sifirla();
      const j = Number(q.get('jeton'));
      if (j >= 0 && q.has('jeton')) kayit.jeton = Math.floor(j);
      const al = (q.get('alinan') ?? '').split(',').filter((x) => RAF.some((r) => r.id === x));
      for (const x of al) if (!kayit.alinan.includes(x)) kayit.alinan.push(x);
      if (q.has('yildiz')) {
        let y = Math.max(0, Math.floor(Number(q.get('yildiz')) || 0));
        kayit.yildiz = {};
        for (let gg = 1; gg <= SON_OYNANAN && y > 0; gg++, y -= 3) kayit.yildiz[String(gg)] = Math.min(3, y);
      }
      if (gunVar) {
        kayit.acikGun = Math.max(kayit.acikGun, g);
        param = { gun: g, kazanc: Number(q.get('kazanc')) || 0 };
      }
      kaydet();
    } else if (ekran === 'gun' && gunVar && g <= kayit.acikGun && !kilitli('pasta')) {
      // ?onizleme=1 (gerçek hızda gösterim): yalnız sırası gelmiş ve erişimi olan güne gidilir; ilerleme yazılmaz
      param = { gun: g };
    } else ekran = 'acilis';
    (window as unknown as { __pasta: unknown }).__pasta = { app, kayit };
  }
  app.git(ekran, param);
  return () => {
    app.kapat();
    kok.classList.remove('ps-kok', 'mk-kok', 'test-modu');
  };
}
