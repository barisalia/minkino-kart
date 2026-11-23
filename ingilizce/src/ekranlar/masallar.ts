/**
 * Masal Kitaplığı: on iki adanın hikâyesi rafta durur. Çocuk kitaba dokununca "masal saati" başlar: Ceren Öğretmen
 * hikâyeyi bir Türkçe cümleyle tanıtır, Polly sayfa sayfa okur (sözcükler yanar), sonra çocuk Polly'nin ardından
 * hikâyeyi kendisi anlatır (yankı okuma). Çiftlik masalı baştan, öbürleri adasının kelimeleri öğrenilince açılır;
 * kilitli kitaba dokununca Ceren nasıl açılacağını söyler.
 *
 * Çizimler (Astra, Paket 13): `sahne/kitaplik` (üç raf; rafların üst yüzeyi y = 520, 900, 1280 / 1400) ve
 * `kitap/<ada>` kapakları. Kitaplık çizimi gelmeden ana ekranda bölüm görünmez (taslakta görünür).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { adaninMasal2si } from '../adimlar/masal2-hazir';
import { IKON } from '../../../src/ui/ikonlar';
import { UNITELER, dersKimligi, type Unite } from '../icerik';
import { ilerisi } from '../icerik2';
import { oku, type Kayit } from '../ilerleme';
import { cizim, dugme, kisi, salla, simgeDugme } from '../kit';
import { konus, sesAcikMi, tik } from '../ses';
import { TASLAK, resim, sahneResmi, uniteHazir } from '../varlik';
import type { Gezinme } from './ders';

/** Masallar bölümü açık mı: kitaplık çizimi geldiyse (taslakta her zaman) */
export const kitaplikHazir = (): boolean => TASLAK || !!sahneResmi('kitaplik');

/** Hikâyesi olan adalar, haritadaki sırayla; çizimi ve sesi gelmemiş adanın kitabı rafa çıkmaz (13–24. adalar geldikçe) */
export const masalAdalari = (): Unite[] => UNITELER.filter((u) => {
  const sayfalar = ilerisi(u)?.hikaye.sayfalar ?? [];
  if (!sayfalar.length || !uniteHazir(u)) return false;
  // 13–24. adalar: kapak ve dört hikâye resmi gelmeden kitap rafa çıkmaz (yer tutuculu masal açılmasın)
  return TASLAK || (!!resim(`kitap/${u.id}`) && sayfalar.every((f) => !f.g.ozel || !!resim(f.g.ozel)));
});

/**
 * Kitap açık mı: resimli masal yeni başlayan çocuğa da uygundur (anlamı resim taşır). İlk ada Çiftlik'in masalı baştan
 * açıktır; öbürleri adasının kelimeleri öğrenilince (şenlik dersi, 3. ders) açılır. Taslak ve test kipinde hepsi açık.
 */
export const masalAcik = (k: Kayit, u: Unite): boolean => TASLAK || TEST_MODU || u.id === UNITELER[0].id || !!k.dersler[dersKimligi(u, 2)];

export function masallarEkrani(kok: HTMLElement, git: Gezinme): () => void {
  const kayit = oku();
  const ust = h('header.ing-ust', {},
    simgeDugme('geri', 'Ana ekrana dön', () => { tik.dokun(); git.ana(); }, 'ing-geri'),
    h('div.ing-ust-orta', {}, h('h1.ing-baslik', {}, 'Masallar')),
    h('div.ing-ust-sag'),
  );

  const fon = sahneResmi('kitaplik');
  const raf = h('div.ing-kitaplik', { 'aria-label': 'Masal kitaplığı' });
  if (fon) { raf.style.backgroundImage = `url("${fon}")`; raf.classList.add('ing-kitaplik-cizim'); }
  const adalar = masalAdalari();
  // 12'den fazla kitapta her rafa sekiz kitap dizilir (24 adaya kadar)
  if (adalar.length > 12) raf.dataset.genis = '1';
  adalar.forEach((u, i) => {
    const x = ilerisi(u)!;
    const acik = masalAcik(kayit, u);
    // Masal 2.0 hazırsa kitap yeni masalı açar, adı da onun adıdır (Çiftlik → Kino at the Lake)
    const m2 = adaninMasal2si(u.id);
    // yeni masalın kendi kapağı geldiyse o, yoksa adanın kitabının kapağı
    const kapak = (m2?.kapak ? cizim(m2.kapak, 'ing-kitap-kapak') : null) ?? cizim(`kitap/${u.id}`, 'ing-kitap-kapak');
    const en = m2?.en ?? x.hikaye.en, tr = m2?.tr ?? x.hikaye.tr;
    const ad = h('span.ing-kitap-ad', { lang: 'en-US' }, en);
    const kitap = dugme('ing-kitap', acik ? `${en}, ${tr}` : `${tr}, kilitli`, () => {
      if (!acik) { salla(kitap); void konus('tr/c-masal-kilitli'); return; }
      tik.sec();
      git.ders({ tur: 'masal', uniteId: u.id });
    }, ...(kapak ? [kapak] : [h('span.ing-kitap-yer', {}, u.tr)]), ad);
    kitap.style.setProperty('--renk', u.renk);
    kitap.style.setProperty('--n', String(i));
    kitap.dataset.raf = String(Math.floor(i / (adalar.length > 12 ? 8 : 4)));
    kitap.dataset.unite = u.id;
    if (!acik) { kitap.classList.add('ing-kilitli'); kitap.append(h('span.ing-kitap-kilit', { 'aria-hidden': 'true', html: IKON.kilit ?? '' })); }
    raf.append(kitap);
  });

  const ceren = kisi('ceren', 'ing-masal-ceren');
  kok.append(ust, h('section.ing-masallar', {}, raf, ceren));
  // ilk gelişte Ceren kitaplığı tanıtır (ses açıldıysa)
  const ilk = !localStorage.getItem('minkino-ingilizce-masal');
  if (ilk && sesAcikMi()) {
    window.setTimeout(() => { void konus('tr/c-masal-giris'); }, 350);
    try { localStorage.setItem('minkino-ingilizce-masal', '1'); } catch { /* özel pencere */ }
  }

  return () => {};
}
