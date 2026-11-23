// Matematik · Ceren Öğretmen dersi 5: Sayılar 11–20 (5+ yaş, yol haritası adım 7). Ders iskeletinin üstünde.
// Onluk ve birlik: çocuk on tek boncuğu çubuğa dizer (birlikte "bir…on"), çubuk bir onluk olur; onluğun yanına birlik
// ekleyerek on üçü kurar ("on bir, on iki, on üç"); abaküste on altıyı gösterir (üst tel onluk, alt tel birlik; fazla
// olunca Ceren "birini geri al" der); on yediden yirmiye birlik ekler, on birlik birleşip ikinci onluk olur: yirmi.
// Her sonuçta rakam blokları iki basamağı gösterir (1 ve 3 = 13). Sayı masasının hatırası alındıktan sonra açılır.
// Astra'nın M6 çizimleri ve Ceren'in sözleri tamam değilse çocuklara hiç görünmez; test kipinde ?test=1&onluk=1 ile
// açılır, gelmemiş çizimin yerinde adı yazılı kutu durur (uygulama yoluna girmez).
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { DersAkisi, DersSesi, cerenBagla, cerenFiguru, hareketler, resimHTML } from './ders-iskelet';
import {
  GEREKLI_CIZIMLER, GEREKLI_SESLER, GOREV, GOREVLER, GOREV_ADI, ONLUK_KAYIT_ANAHTARI, TELDE, abakusDegeri, abakusDurumu, basamaklar, it, kaydiCoz,
  sayiSesi, siradaki, tekBoncuk, type Abakus, type Gorev, type OnlukKaydi,
} from './ders-onluk-mantik';
import './ceren-ders.css';
import './ders-sekiller.css';
import './ders-onluk.css';

const cizimler = import.meta.glob<string>('../../assets/matematik/ders/onluk/*.webp', { eager: true, query: '?url', import: 'default' });
const cerenCizimleri = import.meta.glob<string>('../../assets/matematik/ceren/*.webp', { eager: true, query: '?url', import: 'default' });
const cizim = (ad: string): string | undefined => cizimler['../../assets/matematik/ders/onluk/' + ad + '.webp'] ?? cerenCizimleri['../../assets/matematik/ceren/' + ad + '.webp'];
const POZLAR = ['goster', 'alkis', 'sen-dene', 'parmak-say', 'on-parmak'] as const;
type Poz = (typeof POZLAR)[number] | 'konus';
const pozResmi = (p: string) => cizim('ceren-' + p);
const agizKareleri = Object.entries(import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp', { eager: true, query: '?url', import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b)).map(([, u]) => u);
const sesAdresleri = import.meta.glob<string>(['../../assets/matematik/ders/onluk/ses/*.mp3', '../../assets/matematik/ceren/ses/say_*.mp3'], { eager: true, query: '?url', import: 'default' });
const sesAdresi = (id: string) => sesAdresleri['../../assets/matematik/ders/onluk/ses/' + id + '.mp3'] ?? sesAdresleri['../../assets/matematik/ceren/ses/' + id + '.mp3'];

const adres = new URLSearchParams(location.search);
const TEST = adres.has('test');
const HIZLI = TEST && adres.has('hizli');
declare global { interface Window { __onlukSesleri?: string[] } }
if (TEST) window.__onlukSesleri = [];
export const onlukDersiHazir = GEREKLI_CIZIMLER.every((ad) => !!cizim(ad)) && GEREKLI_SESLER.every((id) => !!sesAdresi(id));
/** Uygulamada çizimler ve sesler tamamsa kendiliğinden açılır; test kipinde yalnız ?test=1&onluk=1 ile. */
export const onlukDersiGorunur = TEST ? adres.has('onluk') : onlukDersiHazir;
function kaydiOku(): OnlukKaydi {
  try { return kaydiCoz(localStorage.getItem(ONLUK_KAYIT_ANAHTARI)); } catch { return kaydiCoz(null); }
}
export const onlukDersiBitti = () => kaydiOku().bitti;

const ses = new DersSesi(sesAdresi, { hizli: HIZLI, okundu: (id) => window.__onlukSesleri?.push(id) });
const SIMGE: Record<Gorev, string> = { onluk: 'onluk-cubuk', 'on-uc': 'birlik', abakus: 'abakus-cerceve', yirmi: 'rakam-2' };

export type OnlukDersiBaglami = { kok: HTMLElement; sesiAc: () => void; tekrarDinle: (fn: () => void) => void; bitir: () => void };

export function onlukDersi(b: OnlukDersiBaglami): () => void {
  const kayit = kaydiOku();
  const sakla = () => { try { localStorage.setItem(ONLUK_KAYIT_ANAHTARI, JSON.stringify(kayit)); } catch { /* özel pencere */ } };
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let simdikiSoz = 'giris';
  let simdiki: Gorev = GOREVLER[0];

  // ----- Sahne: Ceren solda önde; masada onluk ve birlik sütunları, sağda tek boncuklar ya da abaküs, üstte rakam blokları -----
  const dunya = document.createElement('div');
  dunya.className = 'cd-dunya dk-dunya';
  dunya.innerHTML =
    resimHTML(cizim('boncuk-masasi'), 'cd-sinif', 'boncuk-masasi') +
    cerenFiguru({ pozlar: POZLAR, pozResmi, agizKareleri, x: 0.005, ust: 0.4, h: 0.6 }) +
    '<div class="dk-alan" role="group" aria-label="Onluk ve birlik"></div>';
  const ceren = dunya.querySelector<HTMLButtonElement>('.cd-ceren')!;
  const alanEl = dunya.querySelector<HTMLElement>('.dk-alan')!;
  const sira = document.createElement('div');
  sira.className = 'ds-sira dk-sira';
  sira.setAttribute('role', 'group');
  sira.setAttribute('aria-label', 'Görevler');
  sira.innerHTML = GOREVLER.map((g) => '<button type="button" class="ds-sira-sekil" data-gorev="' + g + '" aria-label="' + GOREV_ADI[g] + '">' +
    resimHTML(cizim(SIMGE[g]), 'ds-sira-resim', SIMGE[g], '', '') + '</button>').join('');
  const siraDugmeleri = Array.from(sira.querySelectorAll<HTMLButtonElement>('.ds-sira-sekil'));
  b.kok.append(dunya, sira);

  const akis = new DersAkisi(ses, b.sesiAc, HIZLI);
  const { cerenPoz: poz, birak: cereniBirak } = cerenBagla(ceren, ses, { pozVar: (p) => !!pozResmi(p), sakin, hizli: HIZLI, kapandi: () => akis.kapandi });
  const cerenPoz = (p: Poz) => poz(p);
  const { zipla, salla, ucur } = hareketler(sakin, HIZLI);
  const isaretle = (adim: string) => { dunya.dataset.adim = adim; dunya.dataset.gorev = simdiki; };

  function siraGuncelle() {
    siraDugmeleri.forEach((d) => {
      const g = d.dataset.gorev as Gorev, bitti = kayit.biten.includes(g);
      d.classList.toggle('bitti', bitti);
      d.classList.toggle('simdi', g === simdiki);
      d.setAttribute('aria-label', GOREV_ADI[g] + (bitti ? ', öğrenildi' : g === simdiki ? ', şimdi' : ''));
      if (g === simdiki) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
  }
  siraDugmeleri.forEach((d) => akis.dokununca(d, () => {
    const g = d.dataset.gorev as Gorev;
    if (g === simdiki) { zipla(d); return; }
    if (!kayit.biten.includes(g)) { salla(d); return; }
    zipla(d);
    void gorevDersi(g);
  }));

  // ----- Parçalar -----
  const resim = (ad: string, sinif: string, yazi = ad) => resimHTML(cizim(ad), sinif, ad, '', yazi);
  /** Sütun: onluk yerinde (x sırası 0, 1) ya da birliklerin sütunu (alttan üste). */
  function sutun(sinif: string, yer: number) {
    const s = document.createElement('div');
    s.className = 'dk-sutun ' + sinif;
    s.dataset.yer = String(yer);
    alanEl.append(s);
    return s;
  }
  function onlukKoy(yer: number) {
    const s = sutun('dk-onluk', yer);
    s.innerHTML = resim('onluk-cubuk', 'dk-onluk-resim', 'onluk');
    return s;
  }
  function birlikKoy(s: HTMLElement) {
    const el = document.createElement('span');
    el.className = 'dk-birlik';
    el.style.setProperty('--k', String(s.childElementCount));
    el.innerHTML = resim('birlik', 'dk-birlik-resim', '');
    s.append(el);
    return el;
  }
  /** Rakam blokları: onlar ve birler basamağı yan yana (13 → 1 ve 3). */
  function rakamGoster(n: number) {
    alanEl.querySelector('.dk-rakamlar')?.remove();
    const [o, bb] = basamaklar(n);
    const r = document.createElement('div');
    r.className = 'dk-rakamlar';
    r.setAttribute('aria-label', String(n));
    r.dataset.sayi = String(n);
    r.innerHTML = resim('rakam-' + o, 'dk-rakam', String(o)) + resim('rakam-' + bb, 'dk-rakam', String(bb));
    alanEl.append(r);
    if (!sakin) r.animate([{ transform: 'translateY(-30%) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: HIZLI ? 1 : 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
  }
  /** Masadaki tek boncuklar (dokunulan sütuna uçar). */
  function tekBoncuklar(adet: number) {
    const kap = document.createElement('div');
    kap.className = 'dk-tekler';
    kap.dataset.adet = String(adet);
    alanEl.append(kap);
    return Array.from({ length: adet }, (_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dk-tek';
      d.dataset.i = String(i);
      d.setAttribute('aria-label', 'Boncuk');
      d.innerHTML = resim('birlik', 'dk-birlik-resim', '');
      kap.append(d);
      return d;
    });
  }
  const say = (n: number) => { const id = sayiSesi(n); if (id) void ses.cal(id); };

  // ----- Boncuk görevleri: onluk (on boncuğu diz), on üç (birlik ekle), yirmi (on yediden yirmiye) -----
  async function boncukGorevi(g: Exclude<Gorev, 'abakus'>, a: number) {
    const { bas, hedef, yonerge, sonuc } = GOREV[g];
    alanEl.replaceChildren();
    const onluklar = Math.floor(bas / 10);
    for (let i = 0; i < onluklar; i++) onlukKoy(i);
    // Onluk görevinde boncuklar boş çubuğa (onluğun yerine), ötekilerde birlik sütununa dizilir.
    const hedefSutun = g === 'onluk' ? sutun('dk-dizilen', 0) : sutun('dk-birlikler', 2);
    for (let i = 0; i < bas % 10; i++) birlikKoy(hedefSutun);
    if (bas >= 10) rakamGoster(bas);
    const tekler = tekBoncuklar(tekBoncuk(g));
    isaretle('tanit');
    if (g === 'onluk') {
      cerenPoz('on-parmak');
      simdikiSoz = 'on_parmak';
      if (!(await akis.konus('on_parmak', a))) return false;
    }
    simdikiSoz = yonerge;
    cerenPoz('sen-dene');
    isaretle('diz');
    let sayi = bas;
    const tamam = await akis.adim((bitir) => {
      const bos = akis.bostaIzle(() => { const t = tekler.find((x) => !x.disabled); if (t) zipla(t, 0.4); }, () => yonerge);
      tekler.forEach((t) => akis.dokununca(t, () => {
        if (t.disabled || sayi >= hedef) return;
        bos.dokundu();
        t.disabled = true;
        t.classList.add('gitti');
        const el = birlikKoy(hedefSutun);
        void ucur(el.firstElementChild as HTMLElement, t.getBoundingClientRect(), 380);
        oyunSesi('damla');
        sayi++;
        say(sayi);
        if (sayi === hedef) { bos.dur(); bitir(true); }
      }));
      void ses.cal(yonerge);
      return () => bos.dur();
    });
    if (!tamam || !akis.canli(a)) return false;
    tekler.forEach((t) => { t.disabled = true; t.classList.add('gitti'); });
    if (!(await akis.bekle(650, a))) return false;
    // On birlik bir onluk olur: dizilen boncuklar çubuğa dönüşür (yirmide sütun onluğun yanına kayar).
    if (g === 'onluk' || g === 'yirmi') {
      const yer = g === 'onluk' ? 0 : 1;
      const eski = hedefSutun.getBoundingClientRect();
      hedefSutun.remove();
      const o = onlukKoy(yer);
      o.classList.add('yeni');
      void ucur(o.firstElementChild as HTMLElement, eski, 520);
      oyunSesi('birles');
    } else oyunSesi('miknatis');
    cerenPoz('alkis');
    rakamGoster(hedef);
    simdikiSoz = sonuc;
    if (!(await akis.konus(sonuc, a))) return false;
    return akis.bekle(400, a);
  }

  // ----- Abaküs: üst tel onluk, alt tel birlik; on altıyı göster -----
  async function abakusGorevi(a: number) {
    const { hedef, yonerge, sonuc } = GOREV.abakus;
    alanEl.replaceChildren();
    const ab = document.createElement('div');
    ab.className = 'dk-abakus';
    ab.innerHTML = resim('abakus-cerceve', 'dk-abakus-cerceve', 'abaküs');
    alanEl.append(ab);
    const durum: Abakus = { ust: 0, alt: 0 };
    const teller = (['ust', 'alt'] as const).map((tel) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'dk-tel';
      t.dataset.tel = tel;
      t.setAttribute('aria-label', tel === 'ust' ? 'Üst tel: onluklar' : 'Alt tel: birlikler');
      t.innerHTML = Array.from({ length: TELDE }, (_, i) =>
        '<span class="dk-boncuk" style="--i:' + i + '">' + resim(tel === 'ust' ? 'abakus-boncuk-kirmizi' : 'abakus-boncuk-mavi', 'dk-boncuk-resim', '') + '</span>').join('');
      ab.append(t);
      return t;
    });
    const ciz = () => teller.forEach((t) => {
      const sol = durum[t.dataset.tel as 'ust' | 'alt'];
      t.dataset.sol = String(sol);
      t.style.setProperty('--sol', String(sol));
      t.querySelectorAll<HTMLElement>('.dk-boncuk').forEach((bn, i) => bn.classList.toggle('solda', i < sol));
    });
    ciz();
    isaretle('abakus');
    cerenPoz('goster');
    simdikiSoz = yonerge;
    const tamam = await akis.adim((bitir) => {
      const bos = akis.bostaIzle(() => zipla(teller[durum.ust < 1 ? 0 : 1], 0.15), () => yonerge);
      let bitti = false;
      teller.forEach((t) => {
        const dokun = (e: PointerEvent | MouseEvent) => {
          if (bitti) return;
          bos.dokundu();
          const tel = t.dataset.tel as 'ust' | 'alt';
          const r = t.getBoundingClientRect();
          // Tel 900 birim: soldaki grup (80'lik boncuklar), 100'lük boşluk, sağdaki grup. Sol gruba dokunmak birini geri alır,
          // boşluğa ya da sağa dokunmak birini iter.
          const sinir = r.left + (r.width * (80 * durum[tel] + 50)) / 900;
          durum[tel] = it(durum[tel], e.clientX > sinir);
          ciz();
          oyunSesi('kagit');
          const d = abakusDurumu(durum, hedef);
          if (d === 'tamam') { bitti = true; bos.dur(); say(abakusDegeri(durum)); bitir(true); return; }
          if (d === 'fazla') { ses.sus(); cerenPoz('goster'); simdikiSoz = 'fazla'; void ses.cal('fazla'); return; }
          simdikiSoz = yonerge;
          cerenPoz('parmak-say');
          say(abakusDegeri(durum));
        };
        akis.dokununca(t, dokun);
      });
      void ses.cal(yonerge);
      return () => bos.dur();
    });
    if (!tamam || !akis.canli(a)) return false;
    if (!(await akis.bekle(600, a))) return false;
    oyunSesi('miknatis');
    cerenPoz('alkis');
    rakamGoster(hedef);
    simdikiSoz = sonuc;
    if (!(await akis.konus(sonuc, a))) return false;
    return akis.bekle(400, a);
  }

  async function gorevDersi(g: Gorev) {
    akis.iptal();
    const a = akis.no;
    simdiki = g;
    siraGuncelle();
    ses.onYukle([GOREV[g].yonerge, GOREV[g].sonuc, 'fazla']);
    const tamam = g === 'abakus' ? await abakusGorevi(a) : await boncukGorevi(g, a);
    if (!tamam || !akis.canli(a)) return;
    if (!kayit.biten.includes(g)) kayit.biten.push(g);
    const sonraki = siradaki(kayit);
    if (sonraki) kayit.simdi = sonraki;
    sakla();
    siraGuncelle();
    zipla(siraDugmeleri.find((d) => d.dataset.gorev === g));
    if (!(await akis.bekle(450, a))) return;
    if (!sonraki) { void hatiraVer(a); return; }
    void gorevDersi(sonraki);
  }

  async function hatiraVer(a: number) {
    alanEl.replaceChildren();
    simdiki = GOREVLER[GOREVLER.length - 1];
    isaretle('hatira');
    cerenPoz('alkis');
    const h = document.createElement('div');
    h.className = 'ds-hatira dk-hatira';
    h.innerHTML = resim('hatira-boncuk-kolye', 'ds-hatira-resim', 'boncuk kolye');
    alanEl.append(h);
    oyunSesi('birles');
    if (!sakin) h.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: HIZLI ? 1 : 560, easing: 'ease-out' });
    simdikiSoz = 'bitis';
    if (!(await akis.bekle(700, a))) return;
    if (!(await akis.konus('bitis', a))) return;
    simdikiSoz = 'hatira';
    if (!(await akis.konus('hatira', a))) return;
    kayit.bitti = true;
    sakla();
    if (!(await akis.bekle(600, a))) return;
    b.bitir();
  }

  let karsilandi = false;
  async function basla() {
    akis.iptal();
    const a = akis.no;
    const hatiraBekliyor = !kayit.bitti && GOREVLER.every((g) => kayit.biten.includes(g));
    const g = kayit.bitti || hatiraBekliyor ? GOREVLER[0] : kayit.biten.includes(kayit.simdi) ? siradaki(kayit) ?? GOREVLER[0] : kayit.simdi;
    simdiki = g;
    siraGuncelle();
    isaretle('giris');
    ses.onYukle(['giris', 'devam', 'on_parmak', GOREV[g].yonerge]);
    cerenPoz('konus');
    if (!kayit.tanitildi) {
      simdikiSoz = 'giris';
      if (!(await akis.konus('giris', a))) return;
      kayit.tanitildi = true;
      sakla();
    } else if (!karsilandi) {
      karsilandi = true;
      simdikiSoz = 'devam';
      if (!(await akis.konus('devam', a))) return;
    }
    if (!(await akis.bekle(300, a))) return;
    if (hatiraBekliyor) { void hatiraVer(a); return; }
    void gorevDersi(g);
  }

  akis.dokununca(ceren, () => { zipla(ceren, 0.25); tekrarla(); });
  function tekrarla() {
    if (!simdikiSoz) return;
    if (ses.calan === simdikiSoz && ses.bastan()) return;
    void ses.cal(simdikiSoz);
  }
  b.tekrarDinle(tekrarla);
  void basla();

  return () => {
    akis.kapandi = true;
    akis.iptal();
    cereniBirak();
    sira.remove();
    dunya.remove();
  };
}
