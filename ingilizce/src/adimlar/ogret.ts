/**
 * Kino'ya Öğret: Kino İngilizce öğreniyor ve bazen yanlış resmi kaldırıyor. Polly sorar ("Is it a duck?"),
 * çocuk evet ya da hayır der; hayırsa doğru resmi Kino'ya gösterir. Öğreten çocuk daha iyi öğrenir
 * ve hata yapan Kino olduğu için çocuk yanılmaktan çekinmez.
 */
import { h } from '../../../src/ui/dom';
import { KINO_HATA, KINO_OGRENDI, KINO_SORU, evetHayir } from '../icerik';
import { cizim, dugme, hareket, ipucuKur, kelimeResmi, kisi, kutla, salla } from '../kit';
import type { OgretSorusu } from '../plan';
import { sesAdresi } from '../varlik';
import { oyunDuzeni, yasam, type AdimKurucu } from './ortak';

/**
 * Kino'nun sözü: listeden sırayla, her derste başka yerden başlar (aynı söz art arda gelmez). Yalnız kaydı olan söz
 * çalınır; hiçbiri yoksa ilk söz (test ve taslakta hepsi açıktır).
 */
function kinoSozu(liste: readonly string[], sira: number, kaydir: number): string {
  for (let i = 0; i < liste.length; i++) {
    const ad = liste[(sira + kaydir + i) % liste.length];
    if (sesAdresi(`tr/kino-${ad}`)) return `tr/kino-${ad}`;
  }
  return `tr/kino-${liste[0]}`;
}

export const ogretKur: AdimKurucu<'ogret'> = (b, a) => {
  const y = yasam();
  const kaydir = Math.floor(Math.random() * 7);
  let no = 0, kilit = true, yanlis = 0, asama: 'sor' | 'ver' = 'sor', soru: OgretSorusu = a.sorular[0];
  const tekrarSoz = () => { if (!kilit) void y.soyle(asama === 'sor' ? `en/y-${soru.hedef.id}` : `en/w-${soru.hedef.id}`); };
  const { masa } = oyunDuzeni(b.alan, 'ing-ogret', tekrarSoz);

  const kart = h('span.ing-kino-kart');
  const kino = kisi('kino', 'ing-ogrenci');
  const soruBalonu = h('div.ing-soz-balonu.ing-gorunur', { lang: 'en-US' });
  const sinif = h('div.ing-sinif', {}, kino, kart, soruBalonu);
  const evet = dugme('ing-oy ing-evet', 'Yes, evet', () => void oyVer(true), cizim('ui/evet'), h('strong', { lang: 'en-US' }, 'Yes'));
  const hayir = dugme('ing-oy ing-hayir', 'No, hayır', () => void oyVer(false), cizim('ui/hayir'), h('strong', { lang: 'en-US' }, 'No'));
  const oylar = h('div.ing-oylar', {}, evet, hayir);
  const secenekler = h('div.ing-secenekler');
  secenekler.hidden = true;
  masa.append(sinif, oylar, secenekler);

  function karttaGoster(id: string) {
    const w = [...soru.secenekler, soru.hedef, soru.gosterilen].find((x) => x.id === id)!;
    kart.replaceChildren(kelimeResmi(w));
    kart.classList.remove('ing-geldi'); void kart.offsetWidth; kart.classList.add('ing-geldi');
  }

  async function soruGoster() {
    soru = a.sorular[no];
    yanlis = 0; asama = 'sor'; kilit = true;
    oylar.hidden = false; secenekler.hidden = true;
    soruBalonu.textContent = evetHayir(soru.hedef);
    karttaGoster(soru.gosterilen.id);
    void hareket('kino', 'kart');
    // Kino her soruda başka bir söz söyler (18 Kasım 2026: çizgi filmdeki Kino sesiyle on beş söz)
    if (!(await y.soyle(kinoSozu(KINO_SORU, no, kaydir), `en/y-${soru.hedef.id}`))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? (soru.gosterilen.id === soru.hedef.id ? evet : hayir) : null), 5000);
  }

  async function oyVer(evetDedi: boolean) {
    if (kilit || asama !== 'sor') return;
    const dogruMu = soru.gosterilen.id === soru.hedef.id;
    if (evetDedi !== dogruMu) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(evetDedi ? evet : hayir);
      kilit = true;
      // Kino'nun kaldırdığı resmin gerçek adını duyar, sonra soru yinelenir
      if (!(await y.soyle(`en/c-${soru.gosterilen.id}`, `en/y-${soru.hedef.id}`))) return;
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    if (dogruMu) {
      b.cevap(soru.hedef.id, yanlis === 0);
      kutla(kart);
      void hareket('kino', 'sevin');
      if (!(await y.soyle('en/g-yes', `en/c-${soru.hedef.id}`))) return;
      return sonraki();
    }
    // "No!" doğru: şimdi doğrusunu Kino'ya göster
    void hareket('kino', 'hata');
    if (!(await y.soyle('en/g-no', `en/c-${soru.gosterilen.id}`, kinoSozu(KINO_HATA, no, kaydir)))) return;
    asama = 'ver';
    oylar.hidden = true; secenekler.hidden = false;
    soruBalonu.textContent = `${soru.hedef.en.charAt(0).toUpperCase()}${soru.hedef.en.slice(1)}?`;
    secenekler.dataset.adet = String(soru.secenekler.length);
    secenekler.replaceChildren(...soru.secenekler.map((w, i) => {
      const d = dugme('ing-secim', w.tr, () => void ver(w.id, d), kelimeResmi(w));
      d.dataset.kelime = w.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    if (b.ilkKez('ogret-ver') && !(await y.soyle('tr/c-ogret-ver'))) return;
    if (!(await y.soyle(`en/w-${soru.hedef.id}`))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? secenekler.querySelector(`[data-kelime="${soru.hedef.id}"]`) : null), 5000);
  }

  async function ver(id: string, d: HTMLButtonElement) {
    if (kilit || asama !== 'ver') return;
    if (id !== soru.hedef.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      if (!(await y.soyle(`en/w-${id}`, `en/w-${soru.hedef.id}`))) return;
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    b.cevap(soru.hedef.id, yanlis === 0);
    karttaGoster(id);
    kutla(kart);
    void hareket('kino', 'sevin');
    if (!(await y.soyle(kinoSozu(KINO_OGRENDI, no, kaydir), `en/c-${soru.hedef.id}`))) return;
    sonraki();
  }

  function sonraki() {
    no++;
    if (no >= a.sorular.length) b.bitti();
    else void soruGoster();
  }

  b.tekrarla(tekrarSoz);
  void (async () => {
    if (b.ilkKez('ogret') && !(await y.soyle('tr/c-ogret-giris'))) return;
    void soruGoster();
  })();
  return () => y.kapat();
};
