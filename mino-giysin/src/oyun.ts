/**
 * Mino Ne Giysin? · Yardımcı Mino — gömülebilir giriş noktası (giysin/src/oyun.ts kalıbı).
 *   const kapat = oyunuBaslat(kokEleman, { cikis: () => anaMenuyeDon() });
 *
 * Ekranlar: oda (yardım balonları, dolap, sepet, ayna, kapı; final: kostüm partisi), dert (4 sahne × 4 alet).
 * Senaryo: ekip/senaryo/MINO-NE-GIYSIN.md.
 *
 * Test / gösterim (?test=1 ya da ?onizleme=1):
 *   &ekran=oda|dert|parti|onizleme  &dert=pamuk|kino|ege|ada  &alet=stetoskop|merdiven|kasik|sulama
 *   &giy=bas-itfaiye,ust-itfaiye  (açılış kostümü)  &cozulen=pamuk,kino (odaya gelmiş arkadaşlar)  &yas=3..6
 *   &sifirla=1 (yıldızlar)  &yildiz=pamuk:merdiven,...
 */
import { ekranKaydet, Uygulama, type BaslatSecenekleri } from '../../src/uygulama';
import { dertEkrani } from './dert';
import { kaydet, kayit, sifirla } from './kayit';
import { aletParcasi, ALETLER, DERTLER, parcaMi, yerDegistir, type Alet, type Dert } from './model';
import { odaEkrani, onizlemeEkrani } from './oda';
import { oturum } from './oturum';

export type { BaslatSecenekleri };

export function oyunuBaslat(kok: HTMLElement, secenekler: BaslatSecenekleri = {}): () => void {
  ekranKaydet('oda', odaEkrani);
  ekranKaydet('dert', dertEkrani);
  ekranKaydet('onizleme', onizlemeEkrani);
  const app = new Uygulama(kok, secenekler);
  kok.classList.add('mg-kok');
  kok.addEventListener(
    'scroll',
    (e) => {
      const t = e.target as HTMLElement;
      if (t.scrollLeft || t.scrollTop) t.scrollTo(0, 0);
    },
    true,
  );
  const q = new URLSearchParams(location.search);
  let ekran = 'oda';
  let param: unknown = {};
  if (q.has('test') || q.has('onizleme')) {
    if (q.has('sifirla')) sifirla();
    const y = q.get('yildiz');
    if (y) {
      kayit.yildiz = y.split(',');
      kaydet();
    }
    for (const id of (q.get('giy') ?? '').split(',')) if (parcaMi(id)) oturum.giyili = yerDegistir(oturum.giyili, id).giyili;
    oturum.cozulen = (q.get('cozulen') ?? '').split(',').filter((d): d is Dert => (DERTLER as readonly string[]).includes(d));
    ekran = q.get('ekran') ?? 'oda';
    const d = q.get('dert') as Dert | null;
    const a = q.get('alet') as Alet | null;
    if (a && ALETLER.includes(a)) oturum.giyili = yerDegistir(oturum.giyili, aletParcasi(a)).giyili;
    if (ekran === 'parti') {
      oturum.cozulen = [...DERTLER];
      oturum.parti = true;
      ekran = 'oda';
    }
    if (ekran === 'dert') param = { dert: d && DERTLER.includes(d) ? d : 'pamuk' };
    (window as unknown as { __mg: unknown }).__mg = { app, kayit, oturum };
  }
  app.git(ekran, param);
  return () => {
    app.kapat();
    kok.classList.remove('mg-kok', 'mk-kok', 'test-modu');
  };
}
