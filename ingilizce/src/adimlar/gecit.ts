/**
 * Hayvan Geçidi (hayvan derslerinin tanıtması; 20 Kasım 2026, Barış: "1. derste 10–15, 2. derste 30 hayvan… hızlı, keyifli").
 * Hayvanlar sırayla sahneye kapkara bir gölge olarak zıplar ("Kim geldi?"). Çocuk gölgeye dokununca hayvan renklenir,
 * sevinçle zıplar, Polly "It's a rabbit." der ve adı kocaman, renkli yazılır; sonra hayvan arka sıraya geçer ve yeni gölge
 * gelir. Sıradaki hayvanlara dokunan çocuk adlarını yeniden duyar. Bütün hayvanlar gelince sıra birlikte zıplar.
 * Bir hayvan iki üç saniyede tanınır: 12 hayvan yarım dakikada biter, ders tempolu kalır.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { efektKimligi, type Kelime } from '../icerik';
import { cikartmaResmi, hareket, hayvanSesi, ipucuKur, kareZipla, kareleriHazirla, kisi, kutla, sesVeAd } from '../kit';
import { efektCal, tik } from '../ses';
import { sahneResmi } from '../varlik';
import { ovgu, yasam, type AdimKurucu } from './ortak';

/** Ad yazısının renkleri: her hayvan bir sonraki renkle yazılır */
const RENKLER = ['#e0533d', '#1e88e5', '#2a9d8f', '#8e5bd8', '#ef7d1a', '#d6336c', '#2b8a3e', '#b5651d'];
/** Gölgenin sahneye giriş biçimi: sağdan, soldan, yukarıdan, aşağıdan (her hayvan bir başkası) */
const GIRISLER = ['sag', 'sol', 'ust', 'alt'] as const;

export const gecitKur: AdimKurucu<'gecit'> = (b, a) => {
  const y = yasam();
  const hayvanlar = a.hayvanlar;
  let no = 0, kilit = true, bekliyor = false;
  const sahne = h('div.ing-gecit-sahne');
  const fon = sahneResmi(a.sahne);
  if (fon) sahne.style.backgroundImage = `url("${fon}")`;
  const polly = kisi('polly', 'ing-gecit-polly');
  const sira = h('div.ing-gecit-sira');
  const ad = h('p.ing-gecit-ad', { lang: 'en-US' });
  const sayac = h('span.ing-gecit-sayac');
  sahne.append(sira, polly, sayac);
  b.alan.replaceChildren(h('div.ing-gecit', {}, sahne, ad));
  let kahraman: HTMLButtonElement | undefined;

  const ziplat = (d: HTMLElement) => { d.classList.remove('ing-zipla'); void d.offsetWidth; d.classList.add('ing-zipla'); };
  // çizilmiş zıplama kareleri (gelmiş hayvanlarda) önceden indirilir
  kareleriHazirla(hayvanlar);
  const sayacYaz = () => { sayac.textContent = `${Math.min(no + 1, hayvanlar.length)} / ${hayvanlar.length}`; };

  function adYaz(w: Kelime, renk: string) {
    ad.replaceChildren(h('strong', {}, w.en), h('small', {}, w.tr));
    ad.style.setProperty('--renk', renk);
    ad.classList.remove('ing-geldi'); void ad.offsetWidth; ad.classList.add('ing-geldi');
  }

  /** Yeni gölge sahneye girer */
  async function gelsin() {
    const w = hayvanlar[no];
    kilit = true; bekliyor = false;
    sayacYaz();
    ad.replaceChildren(); ad.classList.remove('ing-geldi');
    const d = h(`button.ing-gecit-hayvan.ing-kahraman.ing-gecit-golge.ing-giris-${GIRISLER[no % GIRISLER.length]}`, { type: 'button', 'aria-label': 'Kim geldi?' }, cikartmaResmi(w)) as HTMLButtonElement;
    d.dataset.kelime = w.id;
    d.addEventListener('click', () => void tanit(d, w));
    sahne.append(d);
    kahraman = d;
    if (TEST_MODU) sahne.dataset.hedef = w.id;
    tik.yapis();
    // gölge gelir gelmez dokunulabilir (çocuk Polly'nin sorusunu beklemek zorunda değil; dokunuş soruyu keser)
    kilit = false; bekliyor = true;
    ipucuKur(() => (bekliyor ? kahraman : null), 1800);
    // ilk gölgede Polly sorar ("Who is it?"); sonrakilerde tempo için yalnız ipucu eli
    if (no === 0) void y.soyle('en/g-who-is-it');
  }

  /** Çocuk gölgeye dokundu: renklenir, zıplar, adı söylenir; sonra sıraya geçer */
  async function tanit(d: HTMLButtonElement, w: Kelime) {
    if (kilit || !bekliyor || d !== kahraman) return;
    kilit = true; bekliyor = false;
    ipucuKur(undefined);
    tik.sec();
    const renk = RENKLER[no % RENKLER.length];
    d.classList.remove('ing-gecit-golge');
    d.setAttribute('aria-label', `${w.en}, ${w.tr}`);
    ziplat(d);
    void kareZipla(d, w);
    kutla(d);
    adYaz(w, renk);
    if (no % 3 === 2) void hareket('polly', 'sevin');
    // sesi olan hayvan önce kendi sesini çıkarır (inek böğürür, ördek vaklar), sonra Polly adını söyler
    // yüz hayvanın hepsinin sesi var (23 Kasım); dosyası olmayan eski kelimede efekt bayrağı geçerli
    const ses = hayvanSesi(w) ?? (w.efekt ? efektKimligi(w) : null);
    if (ses) { await efektCal(ses); if (!y.acik) return; }
    if (!(await y.soyle(`en/c-${w.id}`))) return;
    if (!(await y.dur(200))) return;
    // sıraya geç: küçülür, arkada yerini alır; dokununca adını yeniden söyler
    d.classList.remove('ing-kahraman', 'ing-giris-sag', 'ing-giris-sol', 'ing-giris-ust', 'ing-giris-alt');
    d.classList.add('ing-sirada');
    d.replaceWith(d.cloneNode(true));
    const sirada = sahne.querySelector<HTMLButtonElement>(`.ing-sirada[data-kelime="${w.id}"]`);
    if (sirada) {
      sirada.addEventListener('click', () => { if (kilit) return; tik.dokun(); ziplat(sirada); void kareZipla(sirada, w); void sesVeAd(w, y.soyle, `en/w-${w.id}`); });
      sira.append(sirada);
    }
    kahraman = undefined;
    no++;
    if (no < hayvanlar.length) { void gelsin(); return; }
    await bitir();
  }

  async function bitir() {
    ad.replaceChildren();
    sayac.textContent = `${hayvanlar.length} / ${hayvanlar.length}`;
    sira.classList.add('ing-hepsi');
    sira.querySelectorAll<HTMLElement>('.ing-gecit-hayvan').forEach((d, i) => { d.style.setProperty('--gecikme', `${i * 50}ms`); ziplat(d); });
    void hareket('polly', 'sevin');
    if (!(await y.soyle(ovgu()))) return;
    if (!(await y.dur(400))) return;
    b.bitti();
  }

  b.tekrarla(() => { if (bekliyor) void y.soyle('en/g-who-is-it'); });
  void (async () => {
    if (!hayvanlar.length) { b.bitti(); return; }
    if (b.ilkKez('gecit') && !(await y.soyle('tr/c-gecit-giris'))) return;
    void gelsin();
  })();
  return () => { ipucuKur(undefined); y.kapat(); };
};
