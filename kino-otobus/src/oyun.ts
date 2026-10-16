/**
 * Kino'nun Otobüsü (dondurma) — gömülebilir giriş noktası (pasta/src/oyun.ts gibi).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Test / gösterim: ?test=1&ekran=gun&gun=2 (doğrudan güne), &yas=kucuk|buyuk, &sifirla=1 (kaydı sıfırlar),
 * &acilan=visne,muz,flama (ödülle açılmış say: tat, süs, görünüm), &ekran=odul&gun=1 (gün sonu üç kart), &tohum=5
 * (günün planı sabit), &musteriler=lokum,zipzip (önce gelenler), &balon=1 (kaçan balon her müşteriden sonra),
 * &ipucu=1 (ipucu merdiveni testte 10 kat hızlı).
 * ?onizleme=1 (gerçek hız): kaydı değiştirmez, kilidi atlatmaz; yalnız açılışa ya da sırası gelmiş açık güne gider.
 */
import { kilitli } from '../../src/engine/erisim';
import { TEST_MODU } from '../../src/ui/dom';
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { acilisEkrani, odulEkrani } from './ekranlar';
import { gunEkrani } from './gun';
import { kaydet, kayit, sifirla } from './kayit';
import { GUN_SAYISI, ODUL_KATALOGU, type Sus, type Tat } from './model';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('acilis', acilisEkrani);
  ekranKaydet('gun', gunEkrani);
  ekranKaydet('odul', odulEkrani);

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
      for (const x of (q.get('acilan') ?? '').split(',')) {
        if (ODUL_KATALOGU.tat.includes(x as Tat) && !kayit.acilan.tat.includes(x as Tat)) kayit.acilan.tat.push(x as Tat);
        else if (ODUL_KATALOGU.sus.includes(x as Sus) && !kayit.acilan.sus.includes(x as Sus)) kayit.acilan.sus.push(x as Sus);
        else if (ODUL_KATALOGU.gorunum.includes(x) && !kayit.acilan.gorunum.includes(x)) kayit.acilan.gorunum.push(x);
      }
      if (gunVar) {
        kayit.acikGun = Math.max(kayit.acikGun, g);
        param = { gun: g, mutlu: Number(q.get('mutlu')) || 0 };
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
