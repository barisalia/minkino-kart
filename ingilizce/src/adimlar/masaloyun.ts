/**
 * Masal Oyunu: masal bitince Polly hikâyeyle ilgili kısa sorular sorar ("What does Kino eat?"), çocuk resimlerden doğru
 * olana dokunur. Doğruda kart parlar, Polly "Yes!" ve cevabın adını söyler. Yanlışta dokunulan resmin adı duyulur ve
 * masalın ilgili sayfası küçük bir ipucu olarak belirir ("Look!"); ikinci yanlışta doğru kart parlar. Mikrofon yok.
 * Sorular `masal-oyun.ts`'te; çizimi ya da sesi eksik soru girmez, eksik kalan yer masalın sayfalarından "Find the
 * picture!" sorusuyla dolar (Polly sayfanın cümlesini söyler, çocuk o sahneyi bulur).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { kelimeBul, type Kelime } from '../icerik';
import type { Ifade } from '../icerik2';
import { gorselCiz } from '../gorsel';
import { cizim, dugme, hareket, ipucuKur, kelimeResmi, kutla, salla } from '../kit';
import { MASAL_SORULARI, masalSorusuSesi } from '../masal-oyun';
import { karistir, type Yas } from '../plan';
import { TASLAK, kelimeResmiAdresi, resim, sesAdresi } from '../varlik';
import { balonYaz, oyunDuzeni, ovgu, soruBalonu, yasam, type AdimKurucu } from './ortak';

type Secenek = { id: string; ad: string; resim: () => HTMLElement; ses: string };
interface Soru { yazi: string; ses: string[]; cevap: Secenek; secenekler: Secenek[]; ipucu?: Ifade }

const kelimeSecenegi = (w: Kelime): Secenek => ({ id: w.id, ad: w.en, resim: () => kelimeResmi(w), ses: `en/w-${w.id}` });
const sayfaSecenegi = (f: Ifade): Secenek => ({ id: f.id, ad: f.en, resim: () => gorselCiz(f.g), ses: f.ses });
const var_ = (id: string) => TASLAK || TEST_MODU || !!sesAdresi(id);

/** Masalın sorularını kurar: önce `MASAL_SORULARI`, eksik kalan yer sayfa sorularıyla; en çok üç soru */
export function masalSorulari(uniteId: string, sayfalar: readonly Ifade[], yas: Yas, rnd = Math.random): Soru[] {
  const adet = 3, secenek = yas === '2-3' ? 2 : 3;
  const sorular: Soru[] = [];
  (MASAL_SORULARI[uniteId] ?? []).forEach((m, i) => {
    const kelimeler = m.secenekler.map((id) => kelimeBul(id));
    if (kelimeler.some((w) => !w || !kelimeResmiAdresi(w) || !var_(`en/w-${w.id}`))) return;
    const ses = masalSorusuSesi(uniteId, i);
    if (!var_(ses)) return;
    const [cevap, ...diger] = kelimeler as Kelime[];
    sorular.push({ yazi: m.soru, ses: [ses], cevap: kelimeSecenegi(cevap), secenekler: karistir([cevap, ...diger.slice(0, secenek - 1)].map(kelimeSecenegi), rnd), ipucu: sayfalar[m.sayfa] });
  });
  // sayfa soruları: ilk sayfa dışındaki sayfalardan, karışık
  if (var_('en/g-find-the-picture')) {
    // yalnız resmi gelmiş sayfalar (masal resmi olmayan sayfa seçenek olmaz)
    const resimli = sayfalar.filter((f) => !f.g.ozel || TASLAK || !!resim(f.g.ozel));
    for (const f of karistir(resimli.slice(1), rnd)) {
      if (sorular.length >= adet || resimli.length < 2) break;
      const diger = karistir(resimli.filter((x) => x.id !== f.id), rnd).slice(0, secenek - 1);
      sorular.push({ yazi: 'Find the picture!', ses: ['en/g-find-the-picture', f.ses], cevap: sayfaSecenegi(f), secenekler: karistir([f, ...diger].map(sayfaSecenegi), rnd) });
    }
  }
  return sorular.slice(0, adet);
}

export const masalOyunKur: AdimKurucu<'masaloyun'> = (b, a) => {
  const y = yasam();
  const sorular = masalSorulari(a.soruKumesi ?? a.uniteId, a.sayfalar, b.yas);
  let no = 0, kilit = true, yanlis = 0;
  const soru = () => sorular[no];
  const sor = () => { if (!kilit) void y.soyle(...soru().ses); };
  const { masa } = oyunDuzeni(b.alan, 'ing-bul ing-masaloyun', sor);
  const ipucuYeri = h('div.ing-masaloyun-ipucu', { 'aria-hidden': 'true' });
  const secenekler = h('div.ing-secenekler');
  masa.append(ipucuYeri, secenekler);
  const balon = soruBalonu(masa);
  // giriş: Ceren oyunu tanıtırken masalın kapağı ve "Story Game" (ekran boş kalmasın)
  const kapakResmi = (a.kapak ? cizim(a.kapak) : null) ?? cizim(`kitap/${a.uniteId}`);
  // kapağın alttaki boş şeridine masalın adı yazılır (kitaplıktaki gibi)
  const kapak = h('div.ing-masaloyun-kapak', {}, kapakResmi ? h('span.ing-masaloyun-kitap', {}, kapakResmi, h('b', { lang: 'en-US' }, a.baslik ?? '')) : '', h('strong', { lang: 'en-US' }, 'Story Game'));
  masa.append(kapak);
  const dogruKart = () => secenekler.querySelector<HTMLElement>(`[data-secenek="${soru().cevap.id}"]`);

  async function soruGoster() {
    kapak.remove();
    const s = soru();
    kilit = true; yanlis = 0;
    ipucuYeri.classList.remove('ing-gorunur');
    ipucuYeri.replaceChildren();
    balonYaz(balon, s.yazi);
    secenekler.dataset.adet = String(s.secenekler.length);
    secenekler.classList.toggle('ing-masaloyun-sayfa', s.yazi === 'Find the picture!');
    if (TEST_MODU) secenekler.dataset.hedef = s.cevap.id;
    secenekler.replaceChildren(...s.secenekler.map((x, i) => {
      const d = dugme('ing-secim ing-masaloyun-kart', x.ad, () => void sec(x, d), x.resim());
      d.dataset.secenek = x.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    if (!(await y.soyle(...s.ses))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? dogruKart() : null), 5000);
  }

  async function sec(x: Secenek, d: HTMLButtonElement) {
    if (kilit) return;
    const s = soru();
    if (x.id !== s.cevap.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      // ipucu: masalın ilgili sayfası belirir ("Look!")
      if (s.ipucu && !ipucuYeri.childElementCount) {
        ipucuYeri.replaceChildren(gorselCiz(s.ipucu.g));
        ipucuYeri.classList.add('ing-gorunur');
      }
      if (!(await y.soyle(x.ses, ...s.ses))) return;
      if (yanlis >= 2) dogruKart()?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    d.classList.remove('ing-parla');
    d.classList.add('ing-dogru');
    secenekler.classList.add('ing-bitti');
    kutla(d);
    if (no % 2 === 0) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', s.cevap.ses))) return;
    secenekler.classList.remove('ing-bitti');
    no++;
    if (no < sorular.length) { void soruGoster(); return; }
    void hareket('polly', 'sevin');
    if (!(await y.soyle(ovgu()))) return;
    b.bitti();
  }

  b.tekrarla(sor);
  void (async () => {
    if (!sorular.length) { b.bitti(); return; }
    if (b.ilkKez('masaloyun') && !(await y.soyle('tr/c-masal-oyun-giris'))) return;
    void soruGoster();
  })();
  return () => { ipucuKur(undefined); y.kapat(); };
};
