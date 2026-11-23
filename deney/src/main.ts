// Ceren Öğretmen ile Deneyler (Sürüm 6; yönetici 22 Kasım). Ceren Öğretmen ve Kino önlüklü, deney odasında masanın
// arkasında; çocuk deneyi kendi eliyle yapar. Kurallar deney-mantik.ts'te. Ceren'in sesi, pozları ve adım akışı
// Matematik'in ortak ders iskeletinden gelir (matematik/src/ders-iskelet.ts, ceren-ders.css); burada yalnız sahne var.
// - Batar mı, yüzer mi? Nesneyi leğene sürükle (dokununca da gider). Batan yavaşça dibe iner, yüzen suyun üstünde sallanır.
//   4+ önce tahmin eder (ceza yok, "Bakalım!"); 5+ sonra iki sepete ayırır ve portakal sürprizini görür.
// - Renkleri karıştır: şişeye dokun, damlalığı sık, çubukla karıştır; 4+ önce rengi tahmin eder, sonra "yeşil yap" görevi.
// Bitişte Deney Defteri'ne çıkartma ve veliye "Evde dene" kartı. Çizimler ve sesler tamam değilse sayfa ana menüye döner
// (hazir.ts); test kipinde (?test=1) eksik çizimin yerinde adını yazan kutu görünür.
import { menuYasiOku } from '../../src/engine/menu-yas';
import { durum as uygulamaDurumu, yukle } from '../../src/engine/ilerleme';
import { sesiAc } from '../../src/audio/ses';
import { geriDinle } from '../../src/kabuk/yon';
import { anaMenuyeDon } from '../../src/uygulama';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { DersAkisi, DersSesi, cerenBagla, cerenFiguru, hareketler, resimHTML, yuzde } from '../../matematik/src/ders-iskelet';
import '../../matematik/src/ceren-ders.css';
import './stil.css';
import {
  ANA_RENKLER, CEREN_POZLARI, DEFTER_YERLERI, DENEYLER, DENEY_ADI, DENEY_SESLERI, EVDE_DENE, KARISIM, KARISIM_RENKLERI,
  KAYIT_ANAHTARI, KINO_POZLARI, NESNE_ADI, RENK_ADI, YUZER, byAkisi, deneyBitti, gelisNesneleri, kaydiCoz, karistir, renkPlani,
  sonucSozu, sorSozu, yasKumesi, type AnaRenk, type DeneyId, type KarisimRengi, type Nesne,
} from './deney-mantik';
import { cizim, deneyAcik, deneyHazir, sesAdresi } from './hazir';
import { YENI_DENEYLER, type Baglam } from './deneyler';

const adres = new URLSearchParams(location.search);
const TEST = adres.has('test');
/** e2e: konuşma ve beklemeler kısalır. */
const HIZLI = TEST && adres.has('hizli');
declare global { interface Window { __cerenSesleri?: string[] } }
/** Yalnız test kipinde: Ceren'in okuduğu kayıtların sırası (e2e her yönergenin Ceren'in sesiyle geldiğini denetler). */
if (TEST) window.__cerenSesleri = [];
/** Yalnız test kipinde: çalınan bardak sesleri (müzik deneyi; deneyler.ts → bardakSesi). */
if (TEST) window.__bardakSesleri = [];

const dugmeResimleri = import.meta.glob<string>('../../assets/hazirlik/dugmeler/{ev,dinle,tamam}.webp', { eager: true, query: '?url', import: 'default' });
const dugme = (ad: 'ev' | 'dinle' | 'tamam') => '<img src="' + dugmeResimleri['../../assets/hazirlik/dugmeler/' + ad + '.webp'] + '" alt="" draggable="false">';

/** Dünya 16:9: yükseklik = genişlik × 0,5625. Yerleşim oranları dünyaya göre (x genişliğe; alt ve h yüksekliğe). */
const ORAN = 0.5625;
const O = {
  ceren: { x: 0.09, alt: 0.58, h: 0.445 },
  masa: { ust: 0.51, h: 0.6111 },
  kino: { x: 0.71, ust: 0.22, h: 0.4 },
  /** Leğen 760 × 440: taban (y 430) masada. */
  legen: { x: 0.34, w: 0.32, alt: 0.755 },
  /** Masadaki nesneler (200 × 200): leğenin iki yanında ön sıra. */
  nesne: { h: 0.12, alt: 0.785, yer: [0.12, 0.2, 0.28, 0.72, 0.8] },
  sepet: { h: 0.18, alt: 0.755, x: [0.41, 0.59] },
  /** Cam bardak 320 × 420: taban (y 405) masada; sıvının üstü y 170. */
  bardak: { x: 0.5, h: 0.4, alt: 0.755 },
  sise: { h: 0.2, alt: 0.785, x: [0.14, 0.23, 0.32] },
  damlalik: { h: 0.3, x: 0.675, alt: 0.785 },
  cubuk: { h: 0.38, x: 0.625, alt: 0.785 },
  defterDugmesi: { x: 0.82, alt: 0.785, h: 0.12 },
} as const;
/** Ortası x'te, tabanı alt'ta, yüksekliği h olan (en = genişlik / yükseklik) kutu. */
const kutu = (x: number, alt: number, h: number, en: number) => {
  const w = h * ORAN * en;
  return 'left:' + yuzde(x - w / 2) + ';top:' + yuzde(alt - h) + ';width:' + yuzde(w) + ';height:' + yuzde(h);
};
const LEGEN_H = (O.legen.w * 440) / 760 / ORAN;
const LEGEN_UST = O.legen.alt - (LEGEN_H * 430) / 440;
/** Leğende nesne (tuvalde 144 birim) ve yerleri: beş yer, su çizgisi y 140, iç taban y 400. */
const SU_NESNE = 144;
const SU_YERLERI = [116, 248, 380, 512, 644];
const SU_UST = { ustte: 30 - SU_NESNE * 0.95, yuzey: 140 - SU_NESNE * 0.6, dip: 400 - SU_NESNE * 0.95 } as const;
const suKutusu = (yer: number, y: keyof typeof SU_UST) =>
  'left:' + yuzde((SU_YERLERI[yer] - SU_NESNE / 2) / 760) + ';top:' + yuzde(SU_UST[y] / 440) + ';width:' + yuzde(SU_NESNE / 760) + ';height:' + yuzde(SU_NESNE / 440);
const BARDAK_UST = O.bardak.alt - (O.bardak.h * 405) / 420;
const SIVI_UST = BARDAK_UST + (O.bardak.h * 170) / 420;
/** Damlalığın ucu (65, 370 / 130 × 380) nereye gelsin: şişenin ağzına, bardağın ağzının hemen altına. */
const damlalikUcla = (x: number, ucY: number) => kutu(x, ucY - (O.damlalik.h * 370) / 380 + O.damlalik.h, O.damlalik.h, 130 / 380);

const kaydiOku = () => { try { return kaydiCoz(localStorage.getItem(KAYIT_ANAHTARI)); } catch { return kaydiCoz(null); } };

if (!TEST && !deneyHazir()) anaMenuyeDon();
else atolye();

function atolye() {
  const kok = document.getElementById('sahne')!;
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let kayit = kaydiOku();
  const sakla = () => { try { localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(kayit)); } catch { /* özel pencere */ } };
  let ekran: 'secim' | DeneyId = 'secim';
  let simdikiSoz = 'giris';
  let ilkAcilis = true;

  // ----- Sahne: deney odası, Ceren, Kino, masa; deneyin öğeleri .dn-alan'da -----
  const C = O.ceren, K = O.kino;
  const agizKareleri = [0, 1, 2, 3].map((i) => cizim('ceren-onluk-konus-' + i)).filter((u): u is string => !!u);
  const dunya = document.createElement('div');
  dunya.className = 'cd-dunya dn-dunya' + (sakin || HIZLI ? ' dn-hizli' : '');
  dunya.innerHTML =
    resimHTML(cizim('deney-atolyesi'), 'cd-sinif', 'deney-atolyesi') +
    cerenFiguru({ pozlar: CEREN_POZLARI, pozResmi: (p) => cizim('ceren-onluk-' + p), agizKareleri: agizKareleri.length === 4 ? agizKareleri : [], x: C.x, ust: C.alt - C.h, h: C.h }) +
    '<button type="button" class="dn-kino" data-poz="merak" aria-label="Kino" style="left:' + yuzde(K.x) + ';top:' + yuzde(K.ust) + ';height:' + yuzde(K.h) + '">' +
      KINO_POZLARI.map((p) => resimHTML(cizim('kino-onluk-' + p), 'dn-kino-poz', 'kino-onluk-' + p, ' data-poz="' + p + '"')).join('') + '</button>' +
    resimHTML(cizim('deney-masasi'), 'cd-masa', 'deney-masasi', ' style="top:' + yuzde(O.masa.ust) + ';--masa-h:' + yuzde(O.masa.h) + '"') +
    '<div class="dn-alan"></div>' +
    '<div class="dn-kart" hidden></div>' +
    '<div class="dn-katman" hidden></div>';
  const ceren = dunya.querySelector<HTMLButtonElement>('.cd-ceren')!;
  const kino = dunya.querySelector<HTMLButtonElement>('.dn-kino')!;
  const alan = dunya.querySelector<HTMLElement>('.dn-alan')!;
  const kart = dunya.querySelector<HTMLElement>('.dn-kart')!;
  const katman = dunya.querySelector<HTMLElement>('.dn-katman')!;
  kok.replaceChildren(dunya);
  const evDugmesi = navDugmesi('Ana menü', dugme('ev'), 'nav ev');
  navDugmesi('Tekrar dinle', dugme('dinle'), 'nav ses');
  function navDugmesi(ad: string, ic: string, sinif: string) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = sinif;
    b.setAttribute('aria-label', ad);
    b.innerHTML = ic;
    kok.append(b);
    return b;
  }

  // ----- Ceren, hareketler, akış (ders-iskelet.ts) -----
  const ses = new DersSesi(sesAdresi, { hizli: HIZLI, okundu: (id) => window.__cerenSesleri?.push(id) });
  const akis = new DersAkisi(ses, sesiAc, HIZLI);
  const { cerenPoz } = cerenBagla(ceren, ses, { pozVar: (p) => !!cizim('ceren-onluk-' + p), sakin, hizli: HIZLI, kapandi: () => akis.kapandi });
  const { zipla, salla, ucur } = hareketler(sakin, HIZLI);
  const bekle = (ms: number, a: number) => akis.bekle(ms, a);
  /** Ceren söyler; yönerge ise ses düğmesi onu yeniden okur. */
  const konus = (id: string, a: number, yonerge = false) => { if (yonerge) simdikiSoz = id; return akis.konus(id, a); };
  const isaretle = (adim: string) => { dunya.dataset.adim = adim; };
  let kinoSaati = 0;
  function kinoPoz(p: (typeof KINO_POZLARI)[number], ms = 0) {
    clearTimeout(kinoSaati);
    kino.dataset.poz = p;
    if (p === 'sevinc') zipla(kino, 0.6);
    if (ms) kinoSaati = window.setTimeout(() => { kino.dataset.poz = 'merak'; }, HIZLI ? 1 : ms);
  }
  akis.dokununca(kino, () => kinoPoz('sevinc', 900));
  function tekrarla() {
    if (ses.calan === simdikiSoz && ses.bastan()) return;
    void ses.cal(simdikiSoz);
  }
  akis.dokununca(ceren, () => { zipla(ceren, 0.25); tekrarla(); });
  kok.querySelector<HTMLButtonElement>('.nav.ses')!.onclick = () => { sesiAc(); tekrarla(); };
  evDugmesi.onclick = () => {
    sesiAc();
    if (ekran !== 'secim' || !katman.hidden) { secimEkrani(); return; }
    akis.kapandi = true;
    akis.iptal();
    anaMenuyeDon();
  };
  geriDinle(() => {
    if (ekran === 'secim' && katman.hidden) return false;
    secimEkrani();
    return true;
  });
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    uygulamaDurumu.i = yukle();
    kayit = kaydiOku();
    akis.kapandi = false;
    secimEkrani();
  });

  // ----- Hareket yardımcıları -----
  /** Öğe yeni yerine kayar (önce eski yeri ölçülür). `egim`: yolda hafif yalpalama (batan nesne). */
  function kaydir(el: HTMLElement, degistir: () => void, ms: number, easing = 'ease-in-out', egim = 0): Promise<void> {
    const once = el.getBoundingClientRect();
    degistir();
    if (sakin || HIZLI) return Promise.resolve();
    const sonra = el.getBoundingClientRect();
    const dx = once.left - sonra.left, dy = once.top - sonra.top;
    if (!sonra.width || (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)) return Promise.resolve();
    const bas = 'translate(' + dx + 'px,' + dy + 'px)';
    const kareler: Keyframe[] = egim
      ? [{ transform: bas }, { transform: 'translate(' + dx * 0.6 + 'px,' + dy * 0.6 + 'px) rotate(' + egim + 'deg)', offset: 0.35 },
        { transform: 'translate(' + dx * 0.25 + 'px,' + dy * 0.25 + 'px) rotate(' + -egim * 0.6 + 'deg)', offset: 0.7 }, { transform: 'none' }]
      : [{ transform: bas }, { transform: 'none' }];
    const an = el.animate(kareler, { duration: ms, easing });
    return bitince(an, ms);
  }
  /**
   * Hareketin bitişi; sayfa görünmüyor ya da cihaz yavaşsa da akış takılmaz (süre + 0,3 sn sonra hareket sona atlanır).
   * Ders iskeletindeki ucur ile aynı koruma.
   */
  function bitince(an: Animation, ms: number): Promise<void> {
    return Promise.race([an.finished.then(() => undefined, () => undefined), new Promise<void>((r) => setTimeout(r, ms + 300))])
      .then(() => { if (an.playState === 'running') an.finish(); });
  }
  /** Bir öğeyi başka kaba taşır; eski yerinden yenisine uçar. */
  function tasi(el: HTMLElement, kap: HTMLElement, stil: string, ms = 420, bas = el.getBoundingClientRect()) {
    el.style.translate = '';
    kap.append(el);
    el.style.cssText = stil;
    return ucur(el, bas, ms);
  }
  const icinde = (h: Element, x: number, y: number, pay = 0.06) => {
    const r = h.getBoundingClientRect();
    return x >= r.left - r.width * pay && x <= r.right + r.width * pay && y >= r.top - r.height * 0.3 && y <= r.bottom + r.height * pay;
  };

  /**
   * Çocuğun bir seçeneğe dokunmasını bekler (Ceren konuşurken de dokunabilir; dokununca Ceren susar). `kabul` false ise
   * öğe sallanır. Boşta kalınca ipucu ve yönergenin yinelenmesi (ders-iskelet.ts → bostaIzle).
   */
  function dokunusBekle<T>(secenekler: readonly (readonly [HTMLElement, T])[], soz: () => string, o: { kabul?: (d: T) => boolean; bosta?: boolean } = {}) {
    let secilen: T | undefined;
    const kabul = o.kabul ?? (() => true);
    return akis.adim((bitir) => {
      const bos = o.bosta === false ? undefined : akis.bostaIzle(() => secenekler.forEach(([el, d]) => { if (kabul(d)) zipla(el, 0.5); }), soz);
      for (const [el, d] of secenekler) akis.dokununca(el, () => {
        bos?.dokundu();
        if (!kabul(d)) { salla(el); return; }
        secilen = d;
        ses.sus();
        bitir(true);
      });
      return () => { bos?.dur(); for (const [el] of secenekler) el.onpointerdown = el.onclick = null; };
    }).then((tamam) => (tamam ? secilen : undefined));
  }

  type Birakis = { el: HTMLElement; hedef: HTMLElement; bas: DOMRect };
  /** Parmakla sürükleme: hedefin üstünde bırakılırsa `birakinca(hedef)`, değilse öğe yerine döner. Dokunmak da sayılır. */
  function surukle(el: HTMLElement, o: { hedefBul: (x: number, y: number) => HTMLElement | null; tutunca: () => void; birakinca: (h: HTMLElement) => void; dokununca: () => void }) {
    let bas: { x: number; y: number; id: number } | undefined, tasindi = false, isaretli: HTMLElement | null = null;
    const isaretle = (h: HTMLElement | null) => {
      if (isaretli === h) return;
      isaretli?.classList.remove('ustunde');
      isaretli = h;
      h?.classList.add('ustunde');
    };
    el.onpointerdown = (e) => {
      if (!e.isPrimary || e.button !== 0) return;
      sesiAc();
      bas = { x: e.clientX, y: e.clientY, id: e.pointerId };
      tasindi = false;
      try { el.setPointerCapture(e.pointerId); } catch { /* eski tarayıcı */ }
      el.classList.add('tutuldu');
      o.tutunca();
    };
    el.onpointermove = (e) => {
      if (!bas || e.pointerId !== bas.id) return;
      const dx = e.clientX - bas.x, dy = e.clientY - bas.y;
      if (!tasindi && Math.hypot(dx, dy) < 10) return;
      tasindi = true;
      el.style.translate = dx + 'px ' + dy + 'px';
      isaretle(o.hedefBul(e.clientX, e.clientY));
    };
    const son = (e: PointerEvent, iptal: boolean) => {
      if (!bas || e.pointerId !== bas.id) return;
      bas = undefined;
      el.classList.remove('tutuldu');
      isaretle(null);
      if (!tasindi) { if (!iptal) o.dokununca(); return; }
      const h = iptal ? null : o.hedefBul(e.clientX, e.clientY);
      if (h) { o.birakinca(h); return; }
      const r = el.getBoundingClientRect();
      el.style.translate = '';
      void ucur(el, r, 280);
    };
    el.onpointerup = (e) => son(e, false);
    el.onpointercancel = (e) => son(e, true);
    el.onclick = (e) => { if (e.detail === 0) { sesiAc(); o.dokununca(); } };
    return () => {
      el.onpointerdown = el.onpointermove = el.onpointerup = el.onpointercancel = el.onclick = null;
      el.classList.remove('tutuldu');
      isaretle(null);
    };
  }
  /**
   * Taşınanlardan birinin bir hedefe bırakılmasını bekler. `dokunHedef` varsa nesneye dokunmak onu oraya götürür; yoksa
   * dokunulan nesne seçilir, sonra hedefe dokunulur (sürükleyemeyen çocuk için).
   */
  function birakisBekle(tasinanlar: readonly HTMLElement[], hedefler: readonly HTMLElement[], soz: () => string, dokunHedef?: HTMLElement) {
    let sonuc: Birakis | undefined;
    return akis.adim((bitir) => {
      let secili: HTMLElement | undefined;
      const bos = akis.bostaIzle(() => tasinanlar.forEach((el) => zipla(el, 0.5)), soz);
      const sec = (el?: HTMLElement) => {
        secili?.classList.remove('secili');
        secili = el;
        el?.classList.add('secili');
        hedefler.forEach((h) => h.classList.toggle('hedef', !!el));
      };
      const ver = (el: HTMLElement, hedef: HTMLElement) => {
        const bas = el.getBoundingClientRect();
        sec();
        sonuc = { el, hedef, bas };
        ses.sus();
        bitir(true);
      };
      const birak = tasinanlar.map((el) => surukle(el, {
        hedefBul: (x, y) => hedefler.find((h) => icinde(h, x, y)) ?? null,
        tutunca: () => { bos.dokundu(); },
        birakinca: (h) => ver(el, h),
        dokununca: () => {
          bos.dokundu();
          if (dokunHedef) ver(el, dokunHedef);
          else { sec(secili === el ? undefined : el); zipla(el, 0.4); }
        },
      }));
      for (const h of hedefler) if (h !== dokunHedef) akis.dokununca(h, () => { bos.dokundu(); if (secili) ver(secili, h); });
      return () => {
        bos.dur();
        sec();
        birak.forEach((f) => f());
        hedefler.forEach((h) => { h.onpointerdown = h.onclick = null; h.classList.remove('hedef'); });
      };
    }).then((tamam) => (tamam ? sonuc : undefined));
  }

  // ----- Kart (orta üstte: tahmin ve deney seçimi) -----
  function kartAc(tur: string, ic: string) {
    kart.dataset.tur = tur;
    delete kart.dataset.nesne;
    delete kart.dataset.tahmin;
    kart.innerHTML = ic;
    kart.hidden = false;
    if (!sakin && !HIZLI) kart.animate([{ opacity: 0, transform: 'translateY(-6%) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' });
  }
  async function kartKapat() {
    if (kart.hidden) return;
    if (!sakin && !HIZLI) await bitince(kart.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.96)' }], { duration: 160, easing: 'ease-in' }), 160);
    kart.hidden = true;
    kart.replaceChildren();
  }
  function temizle() {
    akis.iptal();
    alan.replaceChildren();
    kart.hidden = true;
    kart.replaceChildren();
    katman.hidden = true;
    katman.replaceChildren();
    delete dunya.dataset.deney;
    // Deneylerin sahneye yazdığı işaretler (fener, zaman, tahmin, gün, sıra…) bir sonrakine taşınmaz.
    for (const k of Object.keys(dunya.dataset)) if (k !== 'adim') delete dunya.dataset[k];
    dunya.classList.remove('dn-gece');
    clearTimeout(kinoSaati);
    kino.dataset.poz = 'merak';
    return akis.no;
  }

  // ----- Seçim ekranı -----
  function secimEkrani() {
    const a = temizle();
    ekran = 'secim';
    isaretle('secim');
    // Paket D6+ deneyleri kendi çizimleri ve kayıtları gelince girer (hazir.ts → deneyAcik); test kipinde hepsi görünür.
    const gorunen = DENEYLER.filter((id) => TEST || deneyAcik(id));
    kartAc('secim', gorunen.map((id) =>
      '<button type="button" class="dn-deney" data-deney="' + id + '" aria-label="' + DENEY_ADI[id] + '">' +
        resimHTML(cizim('cikartma-' + id), 'dn-deney-resim', 'cikartma-' + id) + '<span class="dn-deney-ad">' + DENEY_ADI[id] + '</span></button>').join(''));
    kart.dataset.sayi = String(gorunen.length);
    const defterDugmesi = document.createElement('button');
    defterDugmesi.type = 'button';
    defterDugmesi.className = 'dn-defter-dugmesi';
    defterDugmesi.setAttribute('aria-label', 'Deney defteri');
    defterDugmesi.style.cssText = kutu(O.defterDugmesi.x, O.defterDugmesi.alt, O.defterDugmesi.h, 1000 / 700);
    defterDugmesi.innerHTML = resimHTML(cizim('deney-defteri'), 'dn-resim', 'deney-defteri');
    alan.append(defterDugmesi);
    cerenPoz('sorar');
    const soz = ilkAcilis ? 'giris' : 'sec';
    ilkAcilis = false;
    const secenekler = [...Array.from(kart.querySelectorAll<HTMLElement>('.dn-deney')).map((el) => [el, el.dataset.deney as DeneyId] as const), [defterDugmesi, 'defter'] as const];
    const p = dokunusBekle<DeneyId | 'defter'>(secenekler, () => 'sec');
    void (async () => {
      await konus(soz, a, true);
      simdikiSoz = 'sec';
      if (akis.canli(a)) cerenPoz('bekler');
      const s = await p;
      if (!s || !akis.canli(a)) return;
      if (s === 'defter') { await defterGoster(a); if (akis.canli(a)) secimEkrani(); return; }
      deneyBaslat(s);
    })();
  }
  function deneyBaslat(id: DeneyId) {
    const a = temizle();
    ekran = id;
    dunya.dataset.deney = id;
    ses.onYukle([...DENEY_SESLERI[id]]);
    const yeni = YENI_DENEYLER[id];
    void (yeni ? yeni(baglam, a) : id === 'batar-yuzer' ? batarYuzer(a) : renkleriKaristir(a));
  }
  /** Paket D6+ deneylerine (deneyler.ts) sahnenin ortak parçaları. */
  const baglam: Baglam = {
    alan, kart, dunya, sakin, hizli: HIZLI,
    kume: () => kume(),
    gelis: (id) => kayit.gelis[id] ?? 0,
    kutu,
    resim: (ad, sinif = 'dn-resim', ek = '') => resimHTML(cizim(ad), sinif, ad, ek),
    konus, bekle, canli: (a) => akis.canli(a), isaretle,
    yonerge: (id) => { simdikiSoz = id; },
    cerenPoz, kinoPoz, zipla, salla, ucur, kaydir, bitince, tasi, dokunusBekle, birakisBekle, kartAc, kartKapat,
    adim: (kur) => akis.adim(kur),
    bostaIzle: (ipucu, soz) => akis.bostaIzle(ipucu, soz),
    sus: () => ses.sus(),
    bitis,
  };
  const kume = () => yasKumesi(menuYasiOku());

  // ================= Batar mı, yüzer mi? =================
  async function batarYuzer(a: number) {
    const k = kume(), plan = byAkisi(k);
    const nesneler = gelisNesneleri(k, kayit.gelis['batar-yuzer'] ?? 0);
    const L = O.legen;
    alan.insertAdjacentHTML('beforeend',
      '<div class="dn-legen" style="left:' + yuzde(L.x) + ';top:' + yuzde(LEGEN_UST) + ';width:' + yuzde(L.w) + ';height:' + yuzde(LEGEN_H) + '">' +
        resimHTML(cizim('legen-arka'), 'dn-legen-arka', 'legen-arka') + '<div class="dn-legen-ic"></div>' +
        resimHTML(cizim('legen-on'), 'dn-legen-on', 'legen-on') + '</div>');
    const legen = alan.querySelector<HTMLElement>('.dn-legen')!;
    const legenIc = legen.querySelector<HTMLElement>('.dn-legen-ic')!;
    /** Leğendeki nesneler (yer: SU_YERLERI sırası). */
    let sudakiler: { el: HTMLElement; n: Nesne; yer: number }[] = [];
    let birakDendi = false;

    function nesneEl(n: Nesne) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'dn-nesne';
      el.dataset.nesne = n;
      el.setAttribute('aria-label', NESNE_ADI[n]);
      el.innerHTML = resimHTML(cizim(n), 'dn-resim', n);
      return el;
    }
    const masaKutusu = (i: number) => kutu(O.nesne.yer[i], O.nesne.alt, O.nesne.h, 1);
    function nesneKoy(n: Nesne, i: number) {
      const el = nesneEl(n);
      el.style.cssText = masaKutusu(i);
      alan.append(el);
      const r = ceren.getBoundingClientRect();
      void ucur(el, new DOMRect(r.left + r.width * 0.7, r.top + r.height * 0.45, r.width * 0.12, r.width * 0.12), 460 + i * 70);
      return el;
    }
    function sicrat(yer: number) {
      const s = document.createElement('div');
      s.className = 'dn-sicrama';
      s.style.cssText = 'left:' + yuzde((SU_YERLERI[yer] - 170) / 760) + ';top:' + yuzde((140 - 170) / 440) + ';width:' + yuzde(340 / 760) + ';height:' + yuzde(180 / 440);
      s.innerHTML = resimHTML(cizim('su-sicramasi'), 'dn-resim', 'su-sicramasi');
      legen.append(s);
      if (sakin || HIZLI) { setTimeout(() => s.remove(), HIZLI ? 30 : 500); return; }
      void bitince(s.animate([{ transform: 'scale(.35,.15)', opacity: 0.2 }, { transform: 'scale(1)', opacity: 1, offset: 0.35 }, { transform: 'scale(1.08,.9)', opacity: 0 }],
        { duration: 650, easing: 'ease-out', fill: 'forwards' }), 650).then(() => s.remove());
    }
    /** Bırakılan yere en yakın boş yer. */
    function bosYer(bas: DOMRect) {
      const r = legen.getBoundingClientRect();
      const x = r.width ? ((bas.left + bas.width / 2 - r.left) / r.width) * 760 : 380;
      const dolu = new Set(sudakiler.map((s) => s.yer));
      let en = -1;
      SU_YERLERI.forEach((yx, i) => { if (!dolu.has(i) && (en < 0 || Math.abs(yx - x) < Math.abs(SU_YERLERI[en] - x))) en = i; });
      return Math.max(0, en);
    }
    /** Nesne leğene düşer: sıçrar; batan yavaşça dibe iner, yüzen yüzeyde sallanır. */
    async function suyaBirak(el: HTMLElement, n: Nesne, bas: DOMRect) {
      const yer = bosYer(bas);
      sudakiler.push({ el, n, yer });
      el.classList.add('dn-suda');
      await tasi(el, legenIc, suKutusu(yer, 'ustte'), 360, bas);
      await kaydir(el, () => { el.style.top = yuzde(SU_UST.yuzey / 440); }, 240, 'ease-in');
      sicrat(yer);
      oyunSesi('damla');
      if (YUZER[n]) {
        if (!sakin && !HIZLI) await bitince(el.animate([{ transform: 'none' }, { transform: 'translateY(9%)', offset: 0.35 }, { transform: 'translateY(-3%)', offset: 0.7 }, { transform: 'none' }],
          { duration: 900, easing: 'ease-out' }), 900);
        el.classList.add('yuzuyor');
      } else {
        await kaydir(el, () => { el.style.top = yuzde(SU_UST.dip / 440); }, 1800, 'cubic-bezier(.35,.1,.45,1)', 5);
        oyunSesi('kutu');
      }
      el.dataset.sonuc = YUZER[n] ? 'yuzdu' : 'batti';
    }
    /** Bir nesneyi dene: (4+) tahmin, bırak, gör ve söyle. */
    async function dene(el: HTMLElement, n: Nesne): Promise<boolean> {
      let tahmin: boolean | undefined;
      el.classList.add('sirada');
      if (plan.tahmin) {
        isaretle('by-tahmin');
        kartAc('tahmin',
          '<button type="button" class="dn-rozet" data-yuzer="0" aria-label="Batar">' + resimHTML(cizim('rozet-batar'), 'dn-resim', 'rozet-batar') + '</button>' +
          '<span class="dn-kart-nesne">' + resimHTML(cizim(n), 'dn-resim', n) + '</span>' +
          '<button type="button" class="dn-rozet" data-yuzer="1" aria-label="Yüzer">' + resimHTML(cizim('rozet-yuzer'), 'dn-resim', 'rozet-yuzer') + '</button>');
        kart.dataset.nesne = n;
        const rozetler = Array.from(kart.querySelectorAll<HTMLElement>('.dn-rozet'));
        cerenPoz('sorar');
        const p = dokunusBekle(rozetler.map((r) => [r, r.dataset.yuzer === '1'] as const), () => sorSozu(n));
        if (!(await konus(sorSozu(n), a, true))) return false;
        cerenPoz('bekler');
        tahmin = await p;
        if (tahmin === undefined) return false;
        rozetler.find((r) => (r.dataset.yuzer === '1') === tahmin)?.classList.add('secildi');
        kart.dataset.tahmin = tahmin ? 'yuzer' : 'batar';
        oyunSesi('kagit');
        if (!(await konus('bakalim', a))) return false;
        await kartKapat();
      }
      isaretle('by-birak');
      cerenPoz('bekler');
      const p = birakisBekle([el], [legen], () => 'by-birak', legen);
      if (!birakDendi || k === 'minik') {
        birakDendi = true;
        if (!(await konus('by-birak', a, true))) return false;
      } else simdikiSoz = 'by-birak';
      const b = await p;
      if (!b) return false;
      el.classList.remove('sirada');
      await suyaBirak(el, n, b.bas);
      if (!akis.canli(a)) return false;
      cerenPoz('sevinir');
      kinoPoz(YUZER[n] ? 'sevinc' : 'saskin', 1900);
      if (tahmin === YUZER[n]) oyunSesi('parilti');
      if (!(await konus(sonucSozu(n), a))) return false;
      return bekle(300, a);
    }
    /** 5+: sudakileri çıkar, iki sepete ayır (taşlı sepet batanlar, ördekli sepet yüzenler). */
    async function ayir(): Promise<boolean> {
      isaretle('by-ayir');
      const cikanlar = sudakiler;
      sudakiler = [];
      await Promise.all(cikanlar.map(({ el }, i) => {
        el.classList.remove('yuzuyor', 'dn-suda');
        return bekle(i * 60, a).then(() => tasi(el, alan, masaKutusu(i), 460));
      }));
      await gorunurluk(legen, false);
      const S = O.sepet;
      const sepetler = [false, true].map((yuzer, i) => {
        const s = document.createElement('button');
        s.type = 'button';
        s.className = 'dn-sepet';
        s.dataset.yuzer = yuzer ? '1' : '0';
        s.setAttribute('aria-label', yuzer ? 'Yüzenler sepeti' : 'Batanlar sepeti');
        s.style.cssText = kutu(S.x[i], S.alt, S.h, 380 / 260);
        s.innerHTML = resimHTML(cizim('sepet'), 'dn-resim', 'sepet') +
          resimHTML(cizim(yuzer ? 'rozet-yuzer' : 'rozet-batar'), 'dn-sepet-rozet', yuzer ? 'rozet-yuzer' : 'rozet-batar');
        alan.append(s);
        void gorunurluk(s, true);
        return s;
      });
      /** Sepete giren nesne sepetin arkasında, üstü ağızdan görünür (sepet z 2, nesne z 1); her sepette en çok üç. */
      const sepetteKi = [0, 0];
      const sepetKutusu = (i: number, sira: number) => {
        const w = S.h * ORAN * (380 / 260), h = S.h * 0.56;
        return 'left:' + yuzde(S.x[i] - w / 2 + w * (0.31 + (sira - 1) * 0.22)) + ';top:' + yuzde(S.alt - S.h * 1.06) +
          ';width:' + yuzde(h * ORAN) + ';height:' + yuzde(h) + ';z-index:1';
      };
      cerenPoz('sorar');
      if (!(await konus('by-ayir', a, true))) return false;
      cerenPoz('bekler');
      let kalan = cikanlar.slice();
      const yanlis = new Map<HTMLElement, number>();
      while (kalan.length) {
        const b = await birakisBekle(kalan.map((s) => s.el), sepetler, () => 'by-ayir');
        if (!b) return false;
        const s = kalan.find((x) => x.el === b.el)!;
        const sepetYuzer = b.hedef.dataset.yuzer === '1';
        if (sepetYuzer === YUZER[s.n]) {
          const i = sepetYuzer ? 1 : 0;
          b.el.classList.remove('sirada');
          b.el.classList.add('sepette');
          b.el.dataset.sepet = sepetYuzer ? 'yuzer' : 'batar';
          b.hedef.classList.remove('ipucu');
          void tasi(b.el, alan, sepetKutusu(i, sepetteKi[i]++), 380, b.bas);
          oyunSesi('kutu');
          zipla(b.hedef, 0.35);
          kinoPoz('sevinc', 900);
          kalan = kalan.filter((x) => x !== s);
        } else {
          const r = b.el.getBoundingClientRect();
          b.el.style.translate = '';
          void ucur(b.el, r, 300).then(() => salla(b.el));
          kinoPoz('saskin', 1200);
          const kez = (yanlis.get(b.el) ?? 0) + 1;
          yanlis.set(b.el, kez);
          if (kez === 1) void ses.cal('by-ayir-ipucu');
          else sepetler.find((h) => (h.dataset.yuzer === '1') === YUZER[s.n])?.classList.add('ipucu');
        }
      }
      cerenPoz('sevinir');
      oyunSesi('parilti');
      if (!(await konus('by-ayir-tamam', a))) return false;
      await bekle(400, a);
      const sepettekiler = cikanlar.map((s) => s.el);
      await Promise.all([...sepetler, ...sepettekiler].map((s) => gorunurluk(s, false)));
      [...sepetler, ...sepettekiler].forEach((s) => s.remove());
      await gorunurluk(legen, true);
      return akis.canli(a);
    }
    /** 5+: kabuklu portakal yüzer, soyulunca batar; "neden?" anı. */
    async function surpriz(): Promise<boolean> {
      isaretle('by-surpriz');
      const el = nesneKoy('portakal-kabuklu', 2);
      cerenPoz('sevinir');
      kinoPoz('saskin', 1500);
      if (!(await konus('by-surpriz', a))) return false;
      if (!(await dene(el, 'portakal-kabuklu'))) return false;
      isaretle('by-soy');
      el.classList.add('sirada', 'dokunulur');
      cerenPoz('bekler');
      const p = dokunusBekle([[el, true]], () => 'by-soy');
      if (!(await konus('by-soy', a, true))) return false;
      if ((await p) === undefined) return false;
      sudakiler = sudakiler.filter((s) => s.el !== el);
      el.classList.remove('yuzuyor', 'dn-suda', 'sirada', 'dokunulur');
      delete el.dataset.sonuc;
      await tasi(el, alan, masaKutusu(2), 460);
      oyunSesi('kagit');
      if (!sakin && !HIZLI) await bitince(el.animate([{ transform: 'none' }, { transform: 'rotate(-12deg) scale(1.1)' }, { transform: 'rotate(10deg) scale(.92)' }, { transform: 'none' }],
        { duration: 520, easing: 'ease-in-out' }), 520);
      el.dataset.nesne = 'portakal-soyulmus';
      el.setAttribute('aria-label', NESNE_ADI['portakal-soyulmus']);
      el.innerHTML = resimHTML(cizim('portakal-soyulmus'), 'dn-resim', 'portakal-soyulmus');
      oyunSesi('birles');
      if (!(await bekle(350, a))) return false;
      if (!(await dene(el, 'portakal-soyulmus'))) return false;
      isaretle('by-neden');
      cerenPoz('sorar');
      if (!(await konus('by-neden', a, true))) return false;
      cerenPoz('bekler');
      return konus('by-agir', a, true);
    }

    isaretle('by-giris');
    const elemanlar = nesneler.map((n, i) => nesneKoy(n, i));
    cerenPoz('sorar');
    kinoPoz('merak');
    if (!(await konus('by-giris', a, true))) return;
    for (const [i, n] of nesneler.entries()) if (!(await dene(elemanlar[i], n))) return;
    if (plan.ayir && !(await ayir())) return;
    if (plan.surpriz && !(await surpriz())) return;
    await bitis('batar-yuzer', a);
  }
  /** Öğe yumuşakça belirir / kaybolur. */
  async function gorunurluk(el: HTMLElement, gorunur: boolean) {
    if (gorunur) el.hidden = false;
    if (!sakin && !HIZLI) {
      await bitince(el.animate(gorunur ? [{ opacity: 0, transform: 'translateY(4%)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 1 }, { opacity: 0, transform: 'translateY(4%)' }],
        { duration: 300, easing: 'ease-out' }), 300);
    }
    if (!gorunur) el.hidden = true;
  }

  // ================= Renkleri karıştır =================
  async function renkleriKaristir(a: number) {
    const k = kume(), plan = renkPlani(k, kayit.gelis.renkler ?? 0);
    const B = O.bardak;
    const sivilar = ['su', ...ANA_RENKLER, ...KARISIM_RENKLERI];
    alan.insertAdjacentHTML('beforeend',
      '<button type="button" class="dn-bardak" aria-label="Bardak" style="' + kutu(B.x, B.alt + (B.h * 15) / 420, B.h, 320 / 420) + '">' +
        sivilar.map((r) => resimHTML(cizim('sivi-' + r), 'dn-sivi', 'sivi-' + r, ' data-renk="' + r + '"')).join('') +
        resimHTML(cizim('cam-bardak'), 'dn-cam', 'cam-bardak') + '</button>' +
      ANA_RENKLER.map((r, i) => '<button type="button" class="dn-sise" data-renk="' + r + '" aria-label="' + RENK_ADI[r] + ' boya" style="' + kutu(O.sise.x[i], O.sise.alt + (O.sise.h * 5) / 280, O.sise.h, 200 / 280) + '">' +
        resimHTML(cizim('sise-' + r), 'dn-resim', 'sise-' + r) + '</button>').join('') +
      '<div class="dn-cubuk" style="' + kutu(O.cubuk.x, O.cubuk.alt, O.cubuk.h, 80 / 440) + '">' + resimHTML(cizim('karistirma-cubugu'), 'dn-resim', 'karistirma-cubugu') + '</div>' +
      '<button type="button" class="dn-damlalik" aria-label="Damlalık" style="' + kutu(O.damlalik.x, O.damlalik.alt, O.damlalik.h, 130 / 380) + '">' +
        resimHTML(cizim('damlalik'), 'dn-resim', 'damlalik') + '<span class="dn-uc"></span></button>');
    const bardak = alan.querySelector<HTMLButtonElement>('.dn-bardak')!;
    const siseler = Array.from(alan.querySelectorAll<HTMLButtonElement>('.dn-sise'));
    const cubuk = alan.querySelector<HTMLElement>('.dn-cubuk')!;
    const damlalik = alan.querySelector<HTMLButtonElement>('.dn-damlalik')!;
    const uc = damlalik.querySelector<HTMLElement>('.dn-uc')!;
    const siviKatmani = (r: string) => bardak.querySelector<HTMLElement>('.dn-sivi[data-renk="' + r + '"]')!;
    let ustSira = 1;
    let simdikiSivi = 'su';
    let sikDendi = false;
    /** Bardaktaki sıvı yeni renge yumuşakça döner (`miktar` 0–1: karıştırırken azar azar). */
    function sivi(r: string, miktar = 1) {
      const yeni = siviKatmani(r);
      if (r !== simdikiSivi && yeni.style.zIndex !== String(ustSira)) yeni.style.zIndex = String(++ustSira);
      yeni.style.opacity = String(miktar);
      if (miktar >= 1) {
        simdikiSivi = r;
        bardak.dataset.renk = r;
        const kalan = yeni;
        window.setTimeout(() => bardak.querySelectorAll<HTMLElement>('.dn-sivi').forEach((s) => { if (s !== kalan && simdikiSivi === r) s.style.opacity = '0'; }), sakin || HIZLI ? 0 : 950);
      }
    }
    siviKatmani('su').style.opacity = '1';
    bardak.dataset.renk = 'su';
    const damlalikYerde = () => kutu(O.damlalik.x, O.damlalik.alt, O.damlalik.h, 130 / 380);

    /** Bir damla: (rehberli) Ceren rengi söyler; çocuk şişeye dokunur, damlalık dolar, bardağın üstüne gelir, çocuk sıkar. */
    async function damlat(istenen: AnaRenk | null, ilk: boolean, o: { soz: string; kullanilan?: ReadonlySet<AnaRenk>; ipucu?: readonly AnaRenk[]; sozlu?: boolean }): Promise<AnaRenk | undefined> {
      isaretle('rk-sise');
      const kabul = (r: AnaRenk) => (istenen ? r === istenen : !o.kullanilan?.has(r));
      siseler.forEach((s) => {
        const r = s.dataset.renk as AnaRenk;
        s.classList.toggle('sirada', !!istenen && r === istenen);
        s.classList.toggle('ipucu', !!o.ipucu?.includes(r) && kabul(r));
        s.classList.toggle('kullanildi', !!o.kullanilan?.has(r));
      });
      cerenPoz('bekler');
      const p = dokunusBekle(siseler.map((s) => [s, s.dataset.renk as AnaRenk] as const), () => o.soz, { kabul });
      if (istenen && !(await konus('rk-damlat-' + istenen, a, true))) return undefined;
      if (!istenen) simdikiSoz = o.soz;
      const r = await p;
      if (!r) return undefined;
      const sise = siseler.find((s) => s.dataset.renk === r)!;
      siseler.forEach((s) => s.classList.remove('sirada', 'ipucu'));
      // Damlalık şişeye iner, boyayı çeker, bardağın üstüne gelir.
      const sr = O.sise.x[ANA_RENKLER.indexOf(r)];
      await kaydir(damlalik, () => { damlalik.style.cssText = damlalikUcla(sr, O.sise.alt - O.sise.h * 0.82); }, 420);
      zipla(sise, 0.25);
      uc.innerHTML = resimHTML(cizim('damla-' + r), 'dn-resim', 'damla-' + r);
      uc.dataset.renk = r;
      if (!(await bekle(250, a))) return undefined;
      await kaydir(damlalik, () => { damlalik.style.cssText = damlalikUcla(B.x, BARDAK_UST + 0.035); }, 520);
      isaretle('rk-sik');
      damlalik.classList.add('sirada');
      const p2 = dokunusBekle([[damlalik, true]], () => 'rk-sik');
      if (!sikDendi) {
        sikDendi = true;
        if (!(await konus('rk-sik', a, true))) return undefined;
      } else simdikiSoz = 'rk-sik';
      if ((await p2) === undefined) return undefined;
      damlalik.classList.remove('sirada');
      if (!sakin && !HIZLI) damlalik.animate([{ transform: 'none' }, { transform: 'scale(1.06,.93)', offset: 0.4 }, { transform: 'none' }], { duration: 300, easing: 'ease-out' });
      await damlaDus(r);
      uc.replaceChildren();
      delete uc.dataset.renk;
      if (ilk) sivi(r);
      kinoPoz(ilk ? 'saskin' : 'merak', 1200);
      void kaydir(damlalik, () => { damlalik.style.cssText = damlalikYerde(); }, 480);
      if (ilk && o.sozlu !== false && !(await konus('rk-su-' + r, a))) return undefined;
      return akis.canli(a) ? r : undefined;
    }
    /** Damla damlalığın ucundan sıvının üstüne düşer. */
    async function damlaDus(r: AnaRenk) {
      const d = document.createElement('div');
      d.className = 'dn-damla';
      d.dataset.renk = r;
      const h = 0.055;
      d.style.cssText = kutu(B.x, BARDAK_UST + 0.035 + h, h, 70 / 90);
      d.innerHTML = resimHTML(cizim('damla-' + r), 'dn-resim', 'damla-' + r);
      alan.append(d);
      oyunSesi('damla');
      await kaydir(d, () => { d.style.top = yuzde(SIVI_UST - h * 0.6); }, 300, 'ease-in');
      if (!sakin && !HIZLI) await bitince(d.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(1.8,.4)', opacity: 0 }], { duration: 260, easing: 'ease-out' }), 260);
      d.remove();
    }
    /** 4+: karıştırmadan önce "Sence ne renk olacak?" (ceza yok). */
    async function renkTahmini(): Promise<KarisimRengi | undefined> {
      isaretle('rk-tahmin');
      kartAc('renk', KARISIM_RENKLERI.map((r) => '<button type="button" class="dn-mini" data-renk="' + r + '" aria-label="' + RENK_ADI[r] + '">' +
        resimHTML(cizim('sivi-' + r), 'dn-mini-sivi', 'sivi-' + r) + resimHTML(cizim('cam-bardak'), 'dn-mini-cam', 'cam-bardak') + '</button>').join(''));
      const miniler = Array.from(kart.querySelectorAll<HTMLElement>('.dn-mini'));
      cerenPoz('sorar');
      const p = dokunusBekle(miniler.map((m) => [m, m.dataset.renk as KarisimRengi] as const), () => 'rk-tahmin');
      if (!(await konus('rk-tahmin', a, true))) return undefined;
      cerenPoz('bekler');
      const t = await p;
      if (!t) return undefined;
      miniler.find((m) => m.dataset.renk === t)?.classList.add('secildi');
      kart.dataset.tahmin = t;
      oyunSesi('kagit');
      if (!(await konus('bakalim', a))) return undefined;
      await kartKapat();
      return t;
    }
    /** Çubuk bardağa girer; çocuk bardağın üstünde parmağını gezdirir (ya da dokunur), renk azar azar değişir. */
    async function karistirAdimi(sonuc: KarisimRengi): Promise<boolean> {
      isaretle('rk-karistir');
      const cubukYeri = cubuk.style.cssText;
      await kaydir(cubuk, () => { cubuk.style.cssText = kutu(B.x + 0.02, B.alt - 0.02, O.cubuk.h, 80 / 440); cubuk.classList.add('bardakta'); }, 420);
      cerenPoz('bekler');
      let ilerleme = 0;
      const dokunusPayi = k === 'minik' ? 0.34 : 0.15;
      const p = akis.adim((bitir) => {
        const bos = akis.bostaIzle(() => zipla(bardak, 0.3), () => 'rk-karistir');
        let son: { x: number; y: number; id: number } | undefined;
        const ilerlet = (m: number) => {
          ilerleme = Math.min(1, ilerleme + m);
          bardak.dataset.karisim = ilerleme.toFixed(2);
          sivi(sonuc, ilerleme);
          if (ilerleme >= 1) { ses.sus(); bitir(true); }
        };
        const salinim = () => { if (!sakin && !HIZLI) cubuk.animate([{ rotate: '0deg' }, { rotate: '-9deg' }, { rotate: '8deg' }, { rotate: '0deg' }], { duration: 360, easing: 'ease-in-out' }); };
        bardak.onpointerdown = (e) => {
          if (!e.isPrimary || e.button !== 0) return;
          sesiAc();
          bos.dokundu();
          son = { x: e.clientX, y: e.clientY, id: e.pointerId };
          try { bardak.setPointerCapture(e.pointerId); } catch { /* eski tarayıcı */ }
          salinim();
          ilerlet(dokunusPayi);
        };
        bardak.onpointermove = (e) => {
          if (!son || e.pointerId !== son.id) return;
          const r = bardak.getBoundingClientRect();
          const d = Math.hypot(e.clientX - son.x, e.clientY - son.y);
          son.x = e.clientX;
          son.y = e.clientY;
          const dx = Math.max(-0.3, Math.min(0.3, (e.clientX - (r.left + r.width / 2)) / r.width));
          cubuk.style.translate = (dx * r.width).toFixed(1) + 'px 0';
          cubuk.style.rotate = (dx * 30).toFixed(1) + 'deg';
          bos.dokundu();
          ilerlet(d / Math.max(1, r.width * 3.5));
        };
        bardak.onpointerup = bardak.onpointercancel = () => { son = undefined; cubuk.style.translate = ''; cubuk.style.rotate = ''; };
        bardak.onclick = (e) => { if (e.detail === 0) { sesiAc(); salinim(); ilerlet(0.34); } };
        return () => {
          bos.dur();
          bardak.onpointerdown = bardak.onpointermove = bardak.onpointerup = bardak.onpointercancel = bardak.onclick = null;
          cubuk.style.translate = cubuk.style.rotate = '';
        };
      });
      if (!(await konus('rk-karistir', a, true))) return false;
      if (!(await p)) return false;
      oyunSesi('birles');
      delete bardak.dataset.karisim;
      void kaydir(cubuk, () => { cubuk.style.cssText = cubukYeri; cubuk.classList.remove('bardakta'); }, 420);
      return bekle(sakin || HIZLI ? 0 : 900, a);
    }
    async function bosalt(): Promise<boolean> {
      isaretle('rk-bosalt');
      sivi('su');
      const t = await konus('rk-bosalt', a);
      return t && bekle(200, a);
    }
    /** Görev: "Yeşil yap!" Çocuk iki şişeyi kendi seçer. Başka renk olursa gözlem söylenir, ipucuyla yeniden. */
    async function gorev(hedef: KarisimRengi): Promise<boolean> {
      let deneme = 0;
      for (;;) {
        if (!(await bosalt())) return false;
        isaretle('rk-gorev');
        dunya.dataset.gorev = hedef;
        cerenPoz('sorar');
        const soz = 'rk-gorev-' + hedef;
        if (!(await konus(deneme ? 'rk-yeniden' : soz, a, !deneme))) return false;
        if (deneme) simdikiSoz = soz;
        const ipucu = deneme ? KARISIM[hedef] : undefined;
        const kullanilan = new Set<AnaRenk>();
        const r1 = await damlat(null, true, { soz, kullanilan, ipucu, sozlu: false });
        if (!r1) return false;
        kullanilan.add(r1);
        const r2 = await damlat(null, false, { soz, kullanilan, ipucu });
        if (!r2) return false;
        const sonuc = karistir(r1, r2)!;
        if (!(await karistirAdimi(sonuc))) return false;
        if (sonuc === hedef) {
          cerenPoz('sevinir');
          kinoPoz('sevinc', 1900);
          oyunSesi('parilti');
          delete dunya.dataset.gorev;
          return konus('rk-oldu-' + sonuc, a);
        }
        kinoPoz('saskin', 1600);
        if (!(await konus('rk-oldu-' + sonuc, a))) return false;
        cerenPoz('bekler');
        if (!(await konus('rk-ipucu-' + hedef, a, true))) return false;
        deneme++;
      }
    }

    isaretle('rk-giris');
    cerenPoz('sorar');
    kinoPoz('merak');
    if (!(await konus('rk-giris', a, true))) return;
    for (const [i, renk] of plan.karisimlar.entries()) {
      if (i > 0 && !(await bosalt())) return;
      const [r1, r2] = KARISIM[renk];
      if (!(await damlat(r1, true, { soz: 'rk-damlat-' + r1 }))) return;
      if (!(await damlat(r2, false, { soz: 'rk-damlat-' + r2 }))) return;
      const tahmin = plan.tahmin ? await renkTahmini() : null;
      if (tahmin === undefined) return;
      if (!(await karistirAdimi(renk))) return;
      cerenPoz('sevinir');
      kinoPoz('sevinc', 1900);
      oyunSesi('parilti');
      if (!(await konus('rk-oldu-' + renk, a))) return;
      if (!(await bekle(300, a))) return;
    }
    for (const hedef of plan.gorevler) if (!(await gorev(hedef))) return;
    cerenPoz('sevinir');
    if (!(await konus('rk-iki-renk', a))) return;
    await bitis('renkler', a);
  }

  // ================= Bitiş: Deney Defteri ve "Evde dene" =================
  function defterHTML(yerlesmis: readonly DeneyId[], bekleyen?: DeneyId) {
    return '<div class="dn-defter">' + resimHTML(cizim('deney-defteri'), 'dn-resim', 'deney-defteri') +
      DEFTER_YERLERI.map(([x, y], i) => {
        const id = DENEYLER[i];
        const ic = id && yerlesmis.includes(id) ? resimHTML(cizim('cikartma-' + id), 'dn-resim', 'cikartma-' + id) : '';
        return '<span class="dn-yer' + (id && id === bekleyen ? ' bekliyor' : '') + '"' + (id ? ' data-deney="' + id + '"' : '') +
          ' style="left:' + yuzde((x - 90) / 1000) + ';top:' + yuzde((y - 90) / 700) + ';width:18%;height:' + yuzde(180 / 700) + '">' + ic + '</span>';
      }).join('') + '</div>';
  }
  function katmanAc(ic: string, tur: string) {
    katman.dataset.tur = tur;
    katman.innerHTML = ic;
    katman.hidden = false;
    if (!sakin && !HIZLI) katman.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260 });
  }
  async function katmanKapat() {
    if (katman.hidden) return;
    if (!sakin && !HIZLI) await bitince(katman.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220 }), 220);
    katman.hidden = true;
    katman.replaceChildren();
  }
  async function bitis(id: DeneyId, a: number) {
    const onceki = kayit.cikartma.filter((d) => d !== id);
    kayit = deneyBitti(kayit, id);
    sakla();
    // Deney Defteri: yeni çıkartma büyük; çocuk dokununca yerine yapışır.
    isaretle('defter');
    katmanAc(defterHTML(onceki, id) +
      '<button type="button" class="dn-yeni-cikartma" data-deney="' + id + '" aria-label="Çıkartma">' + resimHTML(cizim('cikartma-' + id), 'dn-resim', 'cikartma-' + id) + '</button>', 'defter');
    const yeni = katman.querySelector<HTMLElement>('.dn-yeni-cikartma')!;
    const yer = katman.querySelector<HTMLElement>('.dn-yer[data-deney="' + id + '"]')!;
    cerenPoz('bekler');
    kinoPoz('sevinc', 1500);
    const p = dokunusBekle([[yeni, true]], () => 'defter');
    if (!(await konus('defter', a, true))) return;
    if ((await p) === undefined) return;
    yer.classList.remove('bekliyor');
    await tasi(yeni, yer, '', 620);
    yeni.classList.add('yapisti');
    oyunSesi('parilti');
    zipla(yer, 0.5);
    cerenPoz('sevinir');
    kinoPoz('sevinc', 1500);
    if (!(await konus('harika', a))) return;
    if (!(await bekle(500, a))) return;
    await katmanKapat();
    // Veliye kart: bu deneyi evde nasıl yaparsınız.
    isaretle('evde');
    const e = EVDE_DENE[id];
    katmanAc('<div class="dn-evde" role="dialog" aria-label="' + e.baslik + '">' + resimHTML(cizim('evde-dene'), 'dn-evde-simge', 'evde-dene') +
      '<h2>' + e.baslik + '</h2><ol>' + e.adimlar.map((s) => '<li>' + s + '</li>').join('') + '</ol>' +
      '<button type="button" class="dn-tamam" aria-label="Tamam">' + dugme('tamam') + '</button></div>', 'evde');
    const tamam = katman.querySelector<HTMLElement>('.dn-tamam')!;
    cerenPoz('bekler');
    const p2 = dokunusBekle([[tamam, true]], () => 'evde', { bosta: false });
    if (!(await konus('evde', a, true))) return;
    if ((await p2) === undefined) return;
    await katmanKapat();
    if (akis.canli(a)) secimEkrani();
  }
  /** Seçim ekranından: biriken çıkartmalarıyla defter. */
  async function defterGoster(a: number) {
    isaretle('defter-bak');
    katmanAc(defterHTML(kayit.cikartma) + '<button type="button" class="dn-tamam dn-defter-tamam" aria-label="Tamam">' + dugme('tamam') + '</button>', 'defter');
    const tamam = katman.querySelector<HTMLElement>('.dn-tamam')!;
    cerenPoz('sevinir');
    const p = dokunusBekle([[tamam, true]], () => 'sec', { bosta: false });
    if ((await p) === undefined) return;
    if (akis.canli(a)) await katmanKapat();
  }

  secimEkrani();
}
