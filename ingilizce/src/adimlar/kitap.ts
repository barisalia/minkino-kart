/**
 * Açılır kitap · kanıt sayfası (22 Kasım 2026 gecesi; sahne: kitap/sahne.ts, ölçüler: kitap/veri.ts,
 * tasarım: ekip/ingilizce/MASAL-GOL-CILEK.md). "Kino at the Lake"in 4. sayfası tek başına, son kalitede:
 *
 *   1. Masada kapalı kitap, yanında Ceren Öğretmen (karton kesim). Kapak hafifçe aralanıp kapanır: "aç beni".
 *   2. Çocuk kapağa dokunur ya da sola çeker: kapak sırttan döner, kâğıt katmanlar arkadan öne yaylanarak kalkar,
 *      Polly sayfanın köşesine konar ve cümleyi okur.
 *   3. Sudan kabarcıklar çıkar. Çocuk dokunur: kabarcıklar patlar, su sıçrar, ördek yarıktan yaylanarak fırlar; başında muz.
 *   4. Kino umutla sorar: "Is this my hat?" (ağzı kaydı izler). Yukarıdan iki kâğıt etiket sarkar: Yes / No.
 *      "Yes": muz ördeğin gözüne kayar, Kino kıkırdar, soru yinelenir (ceza yok). "No": Polly "No! It's a banana!" der,
 *      ördek muza bakar, omuz silker, dalar; muz suda kalır.
 *   5. Sayfanın köşesi kıvrılır; çekince (ya da kısa bir an sonra kendiliğinden) katmanlar yatar, kapak kapanır: "The end!"
 *
 * Her dokunuşun karşılığı aynı anda gelir (ses, sıçrama, poz); 1 sn'den uzun boşluk yoktur.
 */
import { efekt } from '../../../src/audio/efekt';
import { h, TEST_MODU } from '../../../src/ui/dom';
import { cumleBandi } from '../gorsel';
import { dugme, harfleriYak, ipucuKur, kutla } from '../kit';
import { parca, sahneKur, type Oyuncu } from '../kitap/sahne';
import { CEREN, DALGA, EFEKT_CIZIMLERI, GOL_DEKORU, KABARCIK_SAYFASI, KINO, ORDEK, POLLY, YARIK } from '../kitap/veri';
import { efektCal, sus, tik } from '../ses';
import { resim } from '../varlik';
import { yasam, type AdimKurucu } from './ortak';

const KAGIT_SESI = new URL('../../../assets/hazirlik/ses/kres_kagit_ac.mp3', import.meta.url).href;
type Asama = 'kapali' | 'aciliyor' | 'acik' | 'cikiyor' | 'soru' | 'saka' | 'cevap' | 'bitti' | 'kapaniyor';
/** bitince kitabın kendiliğinden kapanması (çocuk köşeyi daha erken çekebilir) */
const KENDILIGINDEN_MS = 2600;

export const kitapKur: AdimKurucu<'kitap'> = (b) => {
  const y = yasam();
  const s = sahneKur(b.alan);
  y.kapaninca(() => s.birak());
  // dersin üst şeridi sahnenin üstünde durur: boş yerleri dokunuşu sahneye geçirir
  const ustSerit = b.alan.closest('.ing')?.querySelector<HTMLElement>('.ing-ust') ?? document.querySelector<HTMLElement>('.ing-ust');
  ustSerit?.classList.add('ing-ust-gecirgen', 'ing-kt-ust');
  const S = KABARCIK_SAYFASI.sesler;
  let asama: Asama = 'kapali';
  const asamaYaz = (a: Asama) => { asama = a; s.kok.dataset.asama = a; };

  // ---- dekor ve oyuncular, arkadan öne (kalkış sırası budur)
  s.zeminKoy(GOL_DEKORU.zemin);
  s.kapakAdiYaz('Kino at the Lake');
  const [arka, orta, on] = GOL_DEKORU.dikler;
  s.dikEkle(arka);
  s.dikEkle(orta);
  // suyun yarığı: ördeğin tuvali su çizgisinden (taban) yarığın alt kenarına oturur, gizliyken tamamen aşağıdadır
  const YARIK_EN = 640, YARIK_BOY = 720;
  const yarik = s.duzlem(YARIK.x, YARIK.y, YARIK_EN, YARIK_BOY);
  yarik.classList.add('ing-kt-yarik');
  const ordekBoy = ORDEK.en * ORDEK.oran;
  const kutu = h('div.ing-kt-yarik-kutu');
  Object.assign(kutu.style, { left: `${(YARIK_EN - ORDEK.en) / 2}px`, top: `${YARIK_BOY - ordekBoy * ORDEK.taban}px`, width: `${ORDEK.en}px`, height: `${ordekBoy}px` });
  yarik.append(kutu);
  const ordek = s.oyuncu(ORDEK, { kap: kutu });
  s.dikEkle(DALGA);
  const kino = s.oyuncu(KINO);
  s.dikEkle(on);
  // Polly kalkışa bağlı değil: kitap açılınca yukarıdan konar
  const polly = s.oyuncu(POLLY, { kalkar: false });
  polly.ic.classList.add('ing-kt-konar', 'ing-kt-havada');
  polly.golge?.classList.add('ing-kt-gizli');
  // Ceren Öğretmen kapalı kitabın solunda, masada; kapak açılırken sola çekilir
  const ceren = s.oyuncu(CEREN, { ebeveyn: s.kitap, kalkar: false });
  ceren.ic.classList.add('ing-kt-cekilir');

  // kadraj işaretleri: her zaman dik duran görünmez düzlemler (kalkmamış katman yatıkken ölçü yanıltır)
  const isaret = (x: number, yy: number, en: number, boy: number) => { const el = s.duzlem(x, yy, en, boy); el.classList.add('ing-kt-isaret'); return el; };
  const mArka = isaret(arka.x + arka.en / 2, arka.y, arka.en, arka.boy);
  const mKino = isaret(KINO.x, KINO.y, KINO.en, KINO.en * 0.9);
  const mPolly = isaret(POLLY.x, POLLY.y, POLLY.en * 0.7, POLLY.en * 0.8);

  // ---- ekran katmanı: cümle bandı, Yes / No etiketleri
  const bantYeri = h('div.ing-kt-bant');
  let bant: HTMLElement | undefined;
  function bantYaz(id: string, en: string, tr: string) {
    bant = cumleBandi({ id, en, tr }, 'ing-kur-bant');
    bantYeri.replaceChildren(bant);
    harfleriYak(bant, 1400);
  }
  const etiket = (c: 'yes' | 'no') => {
    const yazi = c === 'yes' ? 'Yes' : 'No';
    const d = dugme('ing-kt-etiket', yazi, () => void cevap(c, d), h('b', { lang: 'en-US' }, yazi));
    d.dataset.cevap = c;
    const adres = resim(c === 'yes' ? EFEKT_CIZIMLERI.etiketEvet : EFEKT_CIZIMLERI.etiketHayir);
    if (adres) d.style.backgroundImage = `url("${adres}")`; else d.classList.add('ing-kt-yok-resim');
    return d;
  };
  const evetDugme = etiket('yes'), hayirDugme = etiket('no');
  const etiketler = h('div.ing-kt-etiketler', {}, evetDugme, hayirDugme);
  etiketler.hidden = true;
  s.ust.append(etiketler, bantYeri);

  // ---- kamera
  const genis = () => { const r = s.kok.getBoundingClientRect(); return r.width / Math.max(1, r.height) > 1.65; };
  const altPay = () => bantYeri.offsetHeight + 16;
  const kadrajKapali = (ms: number) => s.kadraj([s.sagYarim, ceren.el], ms, { pay: 0.84 });
  /** açık kitap: tablette kitabın tamamı; geniş telefonda olayın geçtiği yer (karakterler küçülmesin) */
  const kadrajAcik = (ms: number) => (genis()
    ? s.kadraj([mKino, yarik, mPolly], ms, { pay: 0.97, altPay: altPay() })
    : s.kadraj([s.kitap, mArka], ms, { pay: 0.98, altPay: altPay() }));
  /**
   * yakın: Kino, ördek ve Polly (kenarda yarım kesilmiş karakter kalmasın). Ölçek sınırlı: çizim kendi çözünürlüğünün
   * çok üstünde büyütülmez (bulanmasın).
   */
  const kadrajYakin = (ms: number) => s.kadraj([mPolly, mKino, yarik], ms, { pay: 0.97, altPay: altPay(), enCok: 0.9 });

  /** Polly konuşurken kanadıyla sahneyi gösterir (gagası kaydı izler), bitince kanadını indirir */
  async function pollySoyle(...idler: string[]): Promise<boolean> {
    polly.poz('konus');
    const surdu = await y.soyle(...idler);
    if (polly.simdiki() === 'konus') polly.poz('otur');
    return surdu;
  }

  // ---- kâğıt hareketleri (parça yerinden oynar; resim esnetilmez)
  const oynat = (o: Oyuncu, sinif: string) => { o.ic.classList.remove('ing-kt-irkil', 'ing-kt-kikir'); void o.ic.offsetWidth; o.ic.classList.add(sinif); };
  function kagit() {
    if (TEST_MODU) return;
    try { const a = new Audio(KAGIT_SESI); a.volume = 0.7; void a.play().catch(() => {}); s.sonra(() => a.pause(), 1100); } catch { /* ses yoksa sessiz */ }
  }

  // ---- kabarcıklar: yarığın üstünde, iki kare sırayla
  const kabarcikDuzlem = s.duzlem(YARIK.x, YARIK.y + 4, 300, 300);
  const kabarcikKareleri = EFEKT_CIZIMLERI.kabarcik.map((yol) => parca(yol));
  const kabarcik = dugme('ing-kt-kabarcik', 'Kabarcıklar', () => void patlat(), ...kabarcikKareleri);
  kabarcikDuzlem.append(kabarcik);
  kabarcikDuzlem.hidden = true;
  {
    let kare = 0;
    const don = () => {
      kabarcikKareleri.forEach((x, i) => { if (i === kare) x.dataset.acik = ''; else delete x.dataset.acik; });
      kare = (kare + 1) % kabarcikKareleri.length;
      if (!TEST_MODU) s.sonra(don, 300);
    };
    don();
  }

  /** su sıçrar: üç kare art arda, zeminde iki halka açılır */
  function sicrat() {
    const d = s.duzlem(YARIK.x, YARIK.y + 6, 560, 373, 0.95);
    d.classList.add('ing-kt-efekt');
    const kareler = EFEKT_CIZIMLERI.sicrama.map((yol) => parca(yol));
    d.append(...kareler);
    kareler[0].dataset.acik = '';
    kareler.forEach((k, i) => { if (i) s.sonra(() => { kareler.forEach((x) => { delete x.dataset.acik; }); k.dataset.acik = ''; }, i * 95); });
    s.sonra(() => d.remove(), kareler.length * 95 + 70);
    for (let i = 0; i < 2; i++) {
      s.sonra(() => {
        const halka = s.yatik(YARIK.x, YARIK.y + 20, 520, 520);
        halka.classList.add('ing-kt-halka');
        halka.append(parca(EFEKT_CIZIMLERI.halka));
        s.sonra(() => halka.remove(), 1150);
      }, i * 220);
    }
  }

  /** sözcük, ipli kâğıt etiketle o şeyin üstüne asılır */
  let sozcuk: HTMLElement | undefined;
  function sozcukAs(yazi: string, hedef: Element, yukseklik: number) {
    sozcuk?.remove();
    const r = hedef.getBoundingClientRect(), c = s.kok.getBoundingClientRect();
    const el = h('span.ing-kt-sozcuk', { lang: 'en-US', 'aria-hidden': 'true' }, h('b', {}, yazi));
    const adres = resim(EFEKT_CIZIMLERI.etiketSozcuk);
    if (adres) el.style.backgroundImage = `url("${adres}")`; else el.classList.add('ing-kt-yok-resim');
    el.style.left = `${r.left + r.width / 2 - c.left}px`;
    el.style.top = `${r.top - c.top + r.height * yukseklik}px`;
    s.ust.append(el);
    sozcuk = el;
  }

  // ---- 1 · kapak: dokun ya da sola çek
  const kapakDugme = dugme('ing-kt-kapak-dugme', 'Kitabı aç', () => { if (!surukledi) void ac(); });
  s.kapakOnu.append(kapakDugme);
  let surukledi = false;
  {
    let bas: number | null = null;
    kapakDugme.addEventListener('pointerdown', (e) => { if (asama !== 'kapali') return; bas = e.clientX; surukledi = false; kapakDugme.setPointerCapture(e.pointerId); });
    kapakDugme.addEventListener('pointermove', (e) => {
      if (bas === null) return;
      const cek = (bas - e.clientX) / (s.kok.clientWidth * 0.4);
      if (Math.abs(bas - e.clientX) > 12) { surukledi = true; s.kok.dataset.asama = 'tutuldu'; }
      if (surukledi) s.acilmaAyarla(Math.min(0.5, Math.max(0, cek * 0.55)));
    });
    const birak = () => {
      if (bas === null) return;
      bas = null;
      if (!surukledi) return;
      s.kok.dataset.asama = asama;
      if (s.acilma() > 0.1) void ac(); else void s.acilmaYurut(0, 250);
      // sürüklemenin ardından gelen tıklama ayrıca açmasın
      window.setTimeout(() => { surukledi = false; }, 0);
    };
    kapakDugme.addEventListener('pointerup', birak);
    kapakDugme.addEventListener('pointercancel', birak);
  }

  async function ac() {
    if (asama !== 'kapali') return;
    asamaYaz('aciliyor');
    ipucuKur(undefined);
    sus();
    tik.sec();
    kagit();
    kapakDugme.remove();
    ceren.ic.classList.add('ing-kt-cekildi');
    ceren.golge?.classList.add('ing-kt-cekildi');
    kadrajAcik(1300);
    // katmanlar kalkarken yay sesi
    s.sonra(() => efekt.pof(), 950);
    await s.acilmaYurut(1, 1700);
    if (!y.acik) return;
    ceren.el.hidden = true;
    polly.ic.classList.remove('ing-kt-havada');
    polly.golge?.classList.remove('ing-kt-gizli');
    kabarcikDuzlem.hidden = false;
    asamaYaz('acik');
    bantYaz('gol2-4', KABARCIK_SAYFASI.en, KABARCIK_SAYFASI.tr);
    kadrajAcik(500);
    ipucuKur(() => kabarcik, 3000);
    void pollySoyle(S.cumle);
  }

  // ---- 3 · kabarcıklar patlar, ördek fırlar
  async function patlat() {
    if (asama !== 'acik') return;
    asamaYaz('cikiyor');
    ipucuKur(undefined);
    // Polly cümlenin ortasındaysa susar (çocuk beklemez)
    sus();
    tik.pop();
    efekt.sicrama();
    kabarcik.classList.add('ing-kt-patladi');
    s.sonra(() => { kabarcikDuzlem.hidden = true; }, 240);
    sicrat();
    kutu.classList.add('ing-kt-cikti');
    void efektCal(S.ordek);
    kino.poz('sasir');
    oynat(kino, 'ing-kt-irkil');
    void polly.oyna([['sasir', 800], ['otur', 0]]);
    kadrajYakin(700);
    if (!(await y.dur(650))) return;
    void sor();
  }

  // ---- 4 · "Is this my hat?"
  async function sor() {
    asamaYaz('soru');
    kino.poz('sor');
    bantYaz('gol2-sor', KABARCIK_SAYFASI.soru, 'Bu benim şapkam mı?');
    etiketler.classList.remove('ing-kt-gitti');
    etiketler.hidden = false;
    if (TEST_MODU) s.kok.dataset.hedef = 'no';
    if (!(await y.soyle(S.soru))) return;
    if (asama === 'soru') ipucuKur(() => hayirDugme, 4500);
  }

  async function cevap(c: 'yes' | 'no', d: HTMLElement) {
    if (asama !== 'soru') return;
    ipucuKur(undefined);
    if (c === 'yes') {
      // ceza yok, komik karşılık: muz ördeğin gözüne kayar, Kino kıkırdar, soru yinelenir
      asamaYaz('saka');
      s.kok.dataset.saka = String(Number(s.kok.dataset.saka ?? 0) + 1);
      tik.dokun();
      d.classList.remove('ing-kt-olmaz'); void d.offsetWidth; d.classList.add('ing-kt-olmaz');
      sus();
      ordek.poz('evet');
      kino.poz('gul');
      oynat(kino, 'ing-kt-kikir');
      void efektCal(S.ordek);
      if (!(await y.dur(950))) return;
      ordek.poz('cik');
      void sor();
      return;
    }
    asamaYaz('cevap');
    tik.dogru();
    kutla(d);
    etiketler.classList.add('ing-kt-gitti');
    s.sonra(() => { etiketler.hidden = true; }, 340);
    kino.poz('gul');
    oynat(kino, 'ing-kt-kikir');
    bantYaz('gol2-4b', KABARCIK_SAYFASI.cevap, 'Hayır! Bu bir muz!');
    sozcukAs('banana', yarik, 0.5);
    // ördek muza bakar, omuz silker (Polly konuşurken)
    void ordek.oyna([['bak', 950], ['omuz', 1200]]);
    if (!(await pollySoyle(S.hayir))) return;
    // dalış: baş suda, kuyruk havada; sonra yarığa iner, su sıçrar, muz suda kalır
    ordek.poz('dal');
    void polly.oyna([['gul', 1100], ['otur', 0]]);
    if (!(await y.dur(240))) return;
    kutu.classList.remove('ing-kt-cikti');
    tik.sip();
    s.sonra(() => { sicrat(); efekt.sicrama(); }, 200);
    s.sonra(() => {
      const m = s.duzlem(YARIK.x + 30, YARIK.y + 22, 220, 147);
      m.dataset.muz = '';
      m.append(parca(EFEKT_CIZIMLERI.muzSuda, 'ing-kt-yuzer'));
    }, 380);
    if (!(await y.dur(900))) return;
    sozcuk?.remove();
    kino.poz('diz');
    bitir();
  }

  // ---- 5 · köşe kıvrılır; çekince katmanlar yatar, kapak kapanır
  const kose = dugme('ing-kt-kose', 'Kitabı kapat', () => { if (!koseSurukledi) void kapat(); }, h('span', { 'aria-hidden': 'true' }));
  kose.hidden = true;
  s.kitap.append(kose);
  let koseSurukledi = false;
  {
    let bas: number | null = null;
    kose.addEventListener('pointerdown', (e) => { if (asama !== 'bitti') return; bas = e.clientX; koseSurukledi = false; kose.setPointerCapture(e.pointerId); });
    kose.addEventListener('pointermove', (e) => {
      if (bas === null) return;
      if (Math.abs(bas - e.clientX) > 12) koseSurukledi = true;
      if (koseSurukledi) s.acilmaAyarla(1 - Math.min(1, Math.max(0, (bas - e.clientX) / (s.kok.clientWidth * 0.45))) * 0.9);
    });
    const birak = () => {
      if (bas === null) return;
      bas = null;
      if (!koseSurukledi) return;
      if (s.acilma() < 0.72) void kapat(); else void s.acilmaYurut(1, 350);
      window.setTimeout(() => { koseSurukledi = false; }, 0);
    };
    kose.addEventListener('pointerup', birak);
    kose.addEventListener('pointercancel', birak);
  }

  function bitir() {
    asamaYaz('bitti');
    kose.hidden = false;
    // tırnak kadrajda olsun (kitabın sağ kenarından taşar)
    s.kadraj(genis() ? [mKino, yarik, kose] : [s.kitap, mArka, kose], 700, { pay: 0.97, altPay: altPay() });
    ipucuKur(() => kose, 3000);
    if (!TEST_MODU) s.sonra(() => { if (asama === 'bitti' && !koseSurukledi) void kapat(); }, KENDILIGINDEN_MS);
  }

  async function kapat() {
    if (asama !== 'bitti') return;
    asamaYaz('kapaniyor');
    ipucuKur(undefined);
    kose.hidden = true;
    bantYeri.replaceChildren();
    polly.ic.classList.add('ing-kt-havada');
    polly.golge?.classList.add('ing-kt-gizli');
    kagit();
    kadrajKapali(1200);
    await s.acilmaYurut(0, 1300);
    if (!y.acik) return;
    kutla(s.sagYarim);
    if (!(await y.soyle(S.son))) return;
    b.bitti();
  }

  b.tekrarla(() => {
    if (asama === 'acik') { harfleriYak(bant ?? null, 1400); void pollySoyle(S.cumle); }
    else if (asama === 'soru') void y.soyle(S.soru);
  });

  // ---- açılış: kapalı kitap ve Ceren Öğretmen; kapak hemen "aç beni" der (çocuk Ceren'i beklemeden açabilir)
  asamaYaz('kapali');
  kadrajKapali(0);
  ipucuKur(() => kapakDugme, 2500);
  void y.soyle(S.giris);

  return () => { ipucuKur(undefined); ustSerit?.classList.remove('ing-ust-gecirgen', 'ing-kt-ust'); y.kapat(); };
};
