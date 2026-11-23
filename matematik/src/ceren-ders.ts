// Matematik · Ceren Öğretmen ile Sayılar 1–10 (Aşama 1). 2–3 yaşta ders 1–5'te biter, hatıra orada (Barış, 19 Kasım).
// Her sayı kısa ve tempolu: Ceren rakamı tahtada tanıtır, çocuk TEK bir etkinlik yapar, alkış ve aferin.
// Etkinlik sayıdan sayıya sırayla değişir (aynı oyun art arda gelmez): 1·4·7·10 rakamı parmakla yaz (Ceren yolu gösterir,
// sonra miktarı masaya koyup sayar) · 2·5·8 birlikte say (her birine bir kez; Ceren yalnız 2'de önce kendisi sayar,
// 5 ve 8'de nesneler sessizce gelir: aynı sayma iki kez olmaz) · 3·6·9 masaya kendin koy.
// On sayı bitince hatıra (Sayı masasının abaküsü) tezgâha gider. Yanlış sesi yok; her yönerge Ceren'in sesiyle.
// Astra'nın çizimleri (assets/matematik/ceren/) tamam değilse ders çocuklara hiç görünmez.
import olcu from './ceren-ders-olcu.json';
import { menuYasiOku } from '../../src/engine/menu-yas';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import {
  GEREKLI_CIZIMLER, GEREKLI_SESLER, KAYIT_ANAHTARI, POZLAR, SAYILAR, aferinSesi, esitAralikla, ilerlet,
  ILK_BIRLIKTE, bitisSesi, tanitSesi, dersSayilari, etkinlik, hepsiBitti, kaydiCoz, nesneTuru, siradaki, yuvaKonumu, type Kayit, type Nokta,
} from './ceren-ders-mantik';
import { DersAkisi, DersSesi, cerenBagla, cerenFiguru, hareketler, resimHTML, yuzde } from './ders-iskelet';
import './ceren-ders.css';

const cizimler = import.meta.glob<string>('../../assets/matematik/ceren/*.{webp,png}', { eager: true, query: '?url', import: 'default' });
function cizim(ad: string): string | undefined {
  const yol = '../../assets/matematik/ceren/' + ad;
  return cizimler[yol + '.webp'] ?? cizimler[yol + '.png'];
}
const nesneCizimleri = import.meta.glob<string>('../../assets/matematik/{elma,armut,boncuk,tas,hatira-sayi}.webp', { eager: true, query: '?url', import: 'default' });
const nesneResmi = (ad: string) => nesneCizimleri['../../assets/matematik/' + ad + '.webp'];
/** Harf oyunlarındaki onaylı Ceren'in konuşma kareleri (kapalı → en açık ağız). */
const agizKareleri = Object.entries(import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp', { eager: true, query: '?url', import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b)).map(([, u]) => u);
const sesAdresleri = import.meta.glob<string>('../../assets/matematik/ceren/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const sesAdresi = (id: string) => sesAdresleri['../../assets/matematik/ceren/ses/' + id + '.mp3'];
/** Sonradan eklenen kayıtlar (yeni övgüler, "hepsi … tane", düzeltilmiş "on"): varsa çalınır, yoksa ders onlarsız akar. */
const varsa = (id: string) => !!sesAdresi(id);

const adres = new URLSearchParams(location.search);
const TEST = adres.has('test');
/** e2e: konuşma ve beklemeler kısalır. */
const HIZLI = TEST && adres.has('hizli');
declare global { interface Window { __cerenSesleri?: string[] } }
/** Yalnız test modunda: Ceren'in okuduğu kayıtların sırası (e2e, her yönergenin Ceren'in sesiyle geldiğini denetler). */
if (TEST) window.__cerenSesleri = [];
export const cerenDersiHazir = GEREKLI_CIZIMLER.every((ad) => !!cizim(ad)) && GEREKLI_SESLER.every((id) => !!sesAdresi(id));
/**
 * Uygulamada çizimler ve sesler tamamsa kendiliğinden açılır. Test modunda yalnız ?test=1&ceren=1 ile açılır (çizimler
 * gelmeden de denenebilir; Sayı masasının eski oyunlarını oynayan testler etkilenmez).
 */
export const cerenDersiGorunur = TEST ? adres.has('ceren') : cerenDersiHazir;
/** 2–3 yaş: dersin kısa yolu (1–5). */
const minikMi = () => (menuYasiOku() ?? 5) < 4;
function kaydiOku(): Kayit {
  const sayilar = dersSayilari(minikMi());
  try { return kaydiCoz(localStorage.getItem(KAYIT_ANAHTARI), sayilar); } catch { return kaydiCoz(null, sayilar); }
}
export const cerenDersiBitti = () => kaydiOku().bitti;

// ---------- Ceren'in sesi (ders-iskelet.ts: Web Audio; olmazsa <audio>) ----------
const ses = new DersSesi(sesAdresi, { hizli: HIZLI, okundu: (id) => window.__cerenSesleri?.push(id) });
/** Ceren susar; bekleyen okuma false ile biter. */
export const cerenSus = () => ses.sus();
const cal = (id: string) => ses.cal(id);
const bastan = () => ses.bastan();
const onYukle = (ids: string[]) => ses.onYukle(ids);

// ---------- Ders ----------
export type CerenBaglami = {
  kok: HTMLElement;
  sesiAc: () => void;
  /** Ses düğmesi bu işlevi çağırır: o anki yönerge yeniden okunur. */
  tekrarDinle: (fn: () => void) => void;
  /** Dersin sayıları bitti (2–3 yaşta beş, sonra on), hatıra verildi. */
  bitir: () => void;
};

const rakamHTML = (n: number, sinif: string) =>
  resimHTML(cizim('rakam-' + n), sinif, 'rakam-' + n, '', '<b>' + n + '</b>');

export function cerenDersi(b: CerenBaglami): () => void {
  const kayit = kaydiOku();
  const sakla = () => { try { localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(kayit)); } catch { /* özel pencere */ } };
  const minik = minikMi();
  /** Bu yaşın ders sayıları: 2–3 yaşta 1–5, sonra 1–10. */
  const sayilar = dersSayilari(minik);
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let simdikiSoz = 'giris';
  /** "Tekrar hoş geldin" bu açılışta söylendi mi (ekran dönünce yinelenmez). */
  let karsilandi = false;
  let simdikiSayi = 0;
  const soylenen = new Map<string, number>();

  // ----- Sahne -----
  const C = olcu.ceren, M = olcu.masa, T = olcu.tahta, Y = olcu.yazi, N = olcu.nesne, K = olcu.kaynak, H = olcu.hatira;
  const dunya = document.createElement('div');
  dunya.className = 'cd-dunya';
  dunya.style.setProperty('--nesne-h', yuzde(N.h));
  dunya.innerHTML =
    resimHTML(cizim('sinif'), 'cd-sinif', 'sinif') +
    '<div class="cd-tahta" style="left:' + yuzde(T.x) + ';top:' + yuzde(T.y) + ';width:' + yuzde(T.w) + ';height:' + yuzde(T.h) + '"></div>' +
    cerenFiguru({ pozlar: POZLAR, pozResmi: (p) => cizim('ceren-' + p), agizKareleri: C.konusmaKareleri ? agizKareleri : [], x: C.x, ust: C.alt - C.h, h: C.h }) +
    resimHTML(cizim('ders-masasi'), 'cd-masa', 'ders-masasi', ' style="top:' + yuzde(M.ust) + ';--masa-h:' + yuzde(M.h) + '"') +
    '<div class="cd-hatira" hidden style="left:' + yuzde(H.x) + ';top:' + yuzde(H.alt - H.h) + ';height:' + yuzde(H.h) + '">' +
      '<img src="' + nesneResmi('hatira-sayi') + '" alt="" draggable="false"></div>' +
    '<div class="cd-nesneler" role="group" aria-label="Masadaki nesneler"></div>' +
    '<button type="button" class="cd-kaynak" hidden style="left:' + yuzde(K.x) + ';top:' + yuzde(K.alt) + '"></button>' +
    '<div class="cd-yazi" hidden style="left:' + yuzde(Y.x) + ';top:' + yuzde(Y.alt - Y.h) + ';height:' + yuzde(Y.h) + '"></div>';
  const ceren = dunya.querySelector<HTMLButtonElement>('.cd-ceren')!;
  const tahta = dunya.querySelector<HTMLElement>('.cd-tahta')!;
  const nesnelerEl = dunya.querySelector<HTMLElement>('.cd-nesneler')!;
  const kaynakEl = dunya.querySelector<HTMLButtonElement>('.cd-kaynak')!;
  const yaziEl = dunya.querySelector<HTMLElement>('.cd-yazi')!;
  const hatiraEl = dunya.querySelector<HTMLElement>('.cd-hatira')!;

  const sira = document.createElement('div');
  sira.className = 'cd-sira';
  sira.setAttribute('role', 'group');
  sira.setAttribute('aria-label', 'Sayılar');
  sira.innerHTML = sayilar.map((n) => '<button type="button" class="cd-sira-rakam" data-n="' + n + '" aria-label="' + n + '">' + rakamHTML(n, 'cd-sira-resim') + '</button>').join('');
  const siraDugmeleri = Array.from(sira.querySelectorAll<HTMLButtonElement>('.cd-sira-rakam'));
  b.kok.append(dunya, sira);
  // Sahne hiçbir koşulda kaymaz (eski WebKit'te overflow: clip yoksa diye ek koruma).
  const kaydirmaYok = () => {
    for (const el of [b.kok, dunya, document.scrollingElement]) {
      if (el && (el.scrollLeft || el.scrollTop)) { el.scrollLeft = 0; el.scrollTop = 0; }
    }
  };
  document.addEventListener('scroll', kaydirmaYok, true);

  // ----- Ceren, hareketler, akış (ders-iskelet.ts) -----
  const akis = new DersAkisi(ses, b.sesiAc, HIZLI);
  const { cerenPoz, birak: cereniBirak } = cerenBagla(ceren, ses, { pozVar: (p) => !!cizim('ceren-' + p), sakin, hizli: HIZLI, kapandi: () => akis.kapandi });
  const { zipla, salla, ucur } = hareketler(sakin, HIZLI);

  /** Dersin hangi adımda olduğu (testler ve ekran okuyucu olmayan denetimler için). */
  const isaretle = (adimAdi: string) => { dunya.dataset.adim = adimAdi; };

  // ----- Akış denetimi -----
  const canli = akis.canli;
  const bekle = (ms: number, a: number) => akis.bekle(ms, a);
  const konus = (id: string, a: number) => akis.konus(id, a);
  const adim = (kur: (bitir: (tamam: boolean) => void) => () => void) => akis.adim(kur);
  const iptal = () => akis.iptal();
  const bostaIzle = (ipucu: () => void, soz: () => string) => akis.bostaIzle(ipucu, soz);
  const dokununca = (el: HTMLElement, fn: (e: PointerEvent | MouseEvent) => void) => akis.dokununca(el, fn);
  /** Her sayıda tekrarlanan yönergeler: ilk iki sayıda ve oturumun ilk iki kez okunur; sonra yalnız istenince. */
  function paylasilan(id: string, n: number) {
    const kez = soylenen.get(id) ?? 0;
    if (n > 2 && kez >= 2) return false;
    soylenen.set(id, kez + 1);
    return true;
  }

  // ----- Sıra (üstteki on rakam) -----
  function siraGuncelle() {
    siraDugmeleri.forEach((d, i) => {
      const n = i + 1, bitti = kayit.biten.includes(n);
      d.classList.toggle('bitti', bitti);
      d.classList.toggle('simdi', n === simdikiSayi);
      d.classList.toggle('sonra', !bitti && n !== simdikiSayi);
      d.setAttribute('aria-label', n + (bitti ? ', öğrenildi' : n === simdikiSayi ? ', şimdi' : ''));
      if (n === simdikiSayi) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
  }
  siraDugmeleri.forEach((d, i) => dokununca(d, () => {
    const n = i + 1;
    if (n === simdikiSayi) { zipla(d); zipla(tahta.firstElementChild); return; }
    if (!kayit.biten.includes(n)) { salla(d); return; }
    zipla(d);
    void sayiDersi(n);
  }));

  // ----- Tahta, masa, nesneler -----
  function tahtayaKoy(n: number, bas?: DOMRect) {
    tahta.innerHTML = '<button type="button" class="cd-tahta-rakam" aria-label="' + n + '">' + rakamHTML(n, 'cd-rakam-resim') + '</button>';
    const el = tahta.firstElementChild as HTMLButtonElement;
    dokununca(el, () => { zipla(el); void cal('say_' + n); });
    return ucur(el, bas, 620);
  }
  const nesneler: HTMLButtonElement[] = [];
  function nesneKoy(i: number, n: number, bas?: DOMRect) {
    const { x, alt } = yuvaKonumu(i);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'cd-nesne';
    el.dataset.i = String(i);
    el.dataset.n = String(n);
    el.style.left = yuzde(x);
    el.style.top = yuzde(alt);
    // Arka sıra üstte: ön sıradaki nesne, arka sıranın numara etiketini örtmesin (nesneler birbirine değmez).
    el.style.zIndex = String(i < 5 ? 2 : 1);
    el.setAttribute('aria-label', nesneTuru(n));
    el.innerHTML = '<img src="' + nesneResmi(nesneTuru(n)) + '" alt="" draggable="false">';
    nesnelerEl.append(el);
    nesneler.push(el);
    void ucur(el.firstElementChild as HTMLElement, bas, 430);
    return el;
  }
  function etiketle(el: HTMLElement, sayi: number | null) {
    el.querySelector('.cd-sayi')?.remove();
    if (sayi === null) { el.classList.remove('sayildi'); return; }
    el.classList.add('sayildi');
    el.insertAdjacentHTML('beforeend', '<b class="cd-sayi" aria-hidden="true">' + sayi + '</b>');
    if (!sakin) el.lastElementChild!.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 260 });
    el.setAttribute('aria-label', nesneTuru(Number(el.dataset.n) || 1) + ', ' + sayi);
  }
  function masayiTopla(hedef?: DOMRect) {
    const giden = nesneler.splice(0);
    giden.forEach((el, i) => {
      el.onpointerdown = el.onclick = null;
      el.disabled = true;
      if (sakin) { el.remove(); return; }
      const r = el.getBoundingClientRect();
      const dx = hedef ? hedef.left + hedef.width / 2 - (r.left + r.width / 2) : 0;
      const dy = hedef ? hedef.top + hedef.height / 2 - (r.top + r.height / 2) : r.height * 0.4;
      el.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.55)', opacity: 0 }],
        { duration: HIZLI ? 1 : 360, delay: HIZLI ? 0 : i * 25, easing: 'ease-in', fill: 'forwards' }).finished.then(() => el.remove(), () => el.remove());
      setTimeout(() => el.remove(), 900);
    });
  }
  function cerenElindenRect() {
    const r = ceren.getBoundingClientRect();
    return new DOMRect(r.left + r.width * 0.72, r.top + r.height * 0.42, r.width * 0.16, r.width * 0.16);
  }

  // ----- 1. Tanıt -----
  // (sayiDersi içinde: tahtayaKoy + tanit_n)

  // ----- 2. Yaz: Ceren yolu parmağıyla gösterir, çocuk yeşil noktadan izler -----
  const NS = 'http://www.w3.org/2000/svg';
  /** Rakamın yazma yolu: Astra'nın bloğunda yüzün orta çizgisi, MEB yazılış yönüyle (ceren-ders-olcu.json → rakamYolu). */
  function yaziYolu(n: number): Nokta[][] {
    const cizgiler = (olcu.rakamYolu as Record<string, number[][][]>)[String(n)] ?? [];
    return cizgiler.map((c) => esitAralikla(c as Nokta[], 14));
  }
  const yolD = (c: Nokta[]) => c.length ? 'M' + c.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') : '';
  function yaziAsamasi(n: number, a: number) {
    const yol = yaziYolu(n);
    yaziEl.hidden = false;
    yaziEl.innerHTML = '<div class="cd-yazi-blok">' + rakamHTML(n, 'cd-rakam-resim') + '</div>';
    const blok = yaziEl.firstElementChild as HTMLElement;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1000 1000');
    svg.setAttribute('class', 'cd-yazi-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', n + ' rakamının yolunu parmağınla izle');
    if (TEST) svg.dataset.yol = JSON.stringify(yol.map((c) => c.map((p) => [Math.round(p[0]), Math.round(p[1])])));
    const yeni = <K extends keyof SVGElementTagNameMap>(ad: K, sinif: string, ust: Element = svg) => {
      const el = document.createElementNS(NS, ad);
      el.setAttribute('class', sinif);
      ust.append(el);
      return el;
    };
    const murekkep = yol.map(() => {
      const g = yeni('g', 'cd-murekkep');
      return [yeni('path', 'cd-m-alt', g), yeni('path', 'cd-m-ust', g)] as const;
    });
    const ornekIz = yeni('path', 'cd-ornek-iz');
    const parmakIzi = yeni('circle', 'cd-parmak');
    parmakIzi.setAttribute('r', '36');
    const uc = yeni('g', 'cd-uc');
    const nabiz = yeni('g', 'cd-uc-nabiz', uc);
    for (const [r, s] of [[50, 'cd-uc-kontur'], [42, 'cd-uc-halka'], [31, 'cd-uc-ic']] as const) {
      const c = yeni('circle', s, nabiz);
      c.setAttribute('r', String(r));
    }
    blok.append(svg);
    // Tahtadaki rakam yerinde kalır; büyük blok masada büyüyerek belirir (Ceren'in yüzünün önünden geçmez).
    if (!sakin) blok.animate([{ transform: 'scale(.55)', opacity: 0 }, { transform: 'scale(1.04)', opacity: 1, offset: 0.7 }, { transform: 'none' }],
      { duration: HIZLI ? 1 : 420, easing: 'ease-out' });

    let cizgi = 0, nokta = 0, parmak = -1, bitti = false, ornekRaf = 0;
    const tol = minik ? 135 : 108, baslamaTol = minik ? 165 : 135;
    function ucuGoster() {
      const p = yol[cizgi]?.[nokta];
      if (!p) { uc.style.display = 'none'; return; }
      uc.style.display = '';
      uc.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')');
    }
    function murekkepCiz() {
      murekkep.forEach(([alt, ust], i) => {
        const d = i < cizgi ? yolD(yol[i]) : i === cizgi && nokta > 0 ? yolD(yol[i].slice(0, nokta + 1)) : '';
        alt.setAttribute('d', d);
        ust.setAttribute('d', d);
      });
    }
    /** Ceren'in parmağı yolu baştan sona gezer (çizgi bırakmaz, arkasında hafif iz söner). */
    function ornekGoster() {
      cancelAnimationFrame(ornekRaf);
      if (bitti || parmak !== -1) return;
      const uzunluklar = yol.map((c) => c.length);
      const toplam = uzunluklar.reduce((x, y) => x + y, 0);
      const sure = HIZLI ? 1 : Math.max(1300, toplam * 24);
      const t0 = performance.now();
      parmakIzi.classList.add('gorunur');
      ornekIz.classList.remove('soner');
      const adimla = () => {
        if (akis.kapandi || bitti || parmak !== -1) { parmakIzi.classList.remove('gorunur'); ornekIz.setAttribute('d', ''); return; }
        let k = Math.min(toplam - 1, Math.floor(((performance.now() - t0) / sure) * toplam));
        let c = 0;
        while (c < yol.length - 1 && k >= uzunluklar[c]) { k -= uzunluklar[c]; c++; }
        const p = yol[c][Math.min(k, yol[c].length - 1)];
        parmakIzi.setAttribute('cx', p[0].toFixed(1));
        parmakIzi.setAttribute('cy', p[1].toFixed(1));
        ornekIz.setAttribute('d', yolD(yol[c].slice(0, k + 1)));
        if (performance.now() - t0 < sure) ornekRaf = requestAnimationFrame(adimla);
        else {
          parmakIzi.classList.remove('gorunur');
          ornekIz.classList.add('soner');
        }
      };
      adimla();
    }
    function svgNoktasi(e: { clientX: number; clientY: number }) {
      const m = svg.getScreenCTM();
      return m ? new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()) : null;
    }
    ucuGoster();
    murekkepCiz();
    const soz = 'yaz';
    simdikiSoz = soz;
    return adim((bitir) => {
      const bos = bostaIzle(ornekGoster, () => soz);
      const ilerle = (x: number, y: number) => {
        const yeniNokta = ilerlet(yol[cizgi], nokta, x, y, tol);
        if (yeniNokta === nokta) return;
        nokta = yeniNokta;
        if (nokta === yol[cizgi].length - 1) {
          cizgi++;
          nokta = 0;
          parmak = -1;
          blok.classList.remove('yaziyor');
          if (cizgi === yol.length) {
            bitti = true;
            murekkepCiz();
            uc.style.display = 'none';
            bos.dur();
            oyunSesi('miknatis');
            zipla(blok, 0.6);
            // Önce sessiz bir alkış, sonra övgü (yoksa rakamın adı).
            cerenPoz('alkis');
            void bekle(450, a)
              .then((devam) => (devam ? cal(varsa('yazdin_' + n) ? 'yazdin_' + n : 'say_' + n) : false))
              .then(() => bekle(300, a)).then((devam) => bitir(devam));
            return;
          }
        }
        murekkepCiz();
        ucuGoster();
      };
      svg.onpointerdown = (e) => {
        if (!e.isPrimary || e.button !== 0 || bitti || parmak !== -1) return;
        b.sesiAc();
        bos.dokundu();
        cancelAnimationFrame(ornekRaf);
        parmakIzi.classList.remove('gorunur');
        ornekIz.setAttribute('d', '');
        const p = svgNoktasi(e), q = yol[cizgi][nokta];
        if (!p || Math.hypot(p.x - q[0], p.y - q[1]) > baslamaTol) {
          // Yanlış yer yok: yeşil nokta "buradan başla" diye kıpırdar.
          if (!sakin) nabiz.animate([{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }], { duration: 320 });
          return;
        }
        parmak = e.pointerId;
        try { svg.setPointerCapture(parmak); } catch { /* sentetik olay */ }
        blok.classList.add('yaziyor');
      };
      svg.onpointermove = (e) => {
        if (e.pointerId !== parmak || bitti) return;
        for (const olay of [...(e.getCoalescedEvents?.() ?? []), e]) {
          if (bitti || parmak === -1) break;
          const p = svgNoktasi(olay);
          if (p) ilerle(p.x, p.y);
        }
      };
      svg.onpointerup = svg.onpointercancel = (e) => {
        if (e.pointerId !== parmak) return;
        parmak = -1;
        blok.classList.remove('yaziyor');
        bos.dokundu();
      };
      // Yönerge ve Ceren'in parmağı birlikte başlar; Ceren susunca eliyle "sıra sende" der.
      cerenPoz('sen-dene');
      if (paylasilan(soz, n)) void cal(soz);
      ornekGoster();
      return () => {
        bos.dur();
        cancelAnimationFrame(ornekRaf);
        svg.onpointerdown = svg.onpointermove = svg.onpointerup = svg.onpointercancel = null;
      };
    }).then(async (tamam) => {
      if (!tamam || !canli(a)) return false;
      // Yazılan blok küçülerek kaybolur, masa sayma için boşalır.
      if (!sakin && !HIZLI) {
        const kalk = blok.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.6)', opacity: 0 }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
        await Promise.race([kalk.finished.catch(() => undefined), new Promise((r) => setTimeout(r, 600))]);
      }
      yaziEl.hidden = true;
      yaziEl.replaceChildren();
      return canli(a);
    });
  }

  // ----- 3. Ceren sayar -----
  async function cerenSayar(n: number, a: number) {
    cerenPoz('parmak-say');
    // Ceren sayarken ses düğmesi araya girmez (sayma yarıda kesilmesin).
    simdikiSoz = '';
    if (varsa('ben_sayayim') && paylasilan('ben_sayayim', n)) {
      if (!(await konus('ben_sayayim', a))) return false;
    } else if (!(await bekle(500, a))) return false;
    for (let k = 1; k <= n; k++) {
      const el = nesneKoy(k - 1, n, cerenElindenRect());
      el.disabled = true;
      oyunSesi('kutu');
      etiketle(el, k);
      if (!(await konus('say_' + k, a))) return false;
      if (!(await bekle(140, a))) return false;
    }
    return bekle(420, a);
  }
  /** Nesneler Ceren'in elinden masaya sayılmadan gelir: çocuk onları birlikte sayacak. */
  async function nesneleriGetir(n: number, a: number) {
    cerenPoz('goster');
    simdikiSoz = '';
    for (let k = 0; k < n; k++) {
      const el = nesneKoy(k, n, cerenElindenRect());
      el.disabled = true;
      if (k % 2 === 0) oyunSesi('kutu');
      if (!(await bekle(110, a))) return false;
    }
    return bekle(520, a);
  }

  // ----- 4. Birlikte sayalım: her birine bir kez -----
  function birlikteSay(n: number, a: number) {
    const soz = 'birlikte';
    simdikiSoz = soz;
    nesneler.forEach((el) => { etiketle(el, null); el.disabled = false; });
    if (!sakin) nesneler.forEach((el, i) => el.animate([{ transform: 'none' }, { transform: 'translateY(-4%)' }, { transform: 'none' }], { duration: 300, delay: i * 40 }));
    return adim((bitir) => {
      const sayilan = new Set<HTMLElement>();
      const sonDokunus = new WeakMap<HTMLElement, number>();
      let kilit = false;
      const sonrakiSayilmamis = () => nesneler.find((el) => !sayilan.has(el));
      const bos = bostaIzle(() => zipla(sonrakiSayilmamis(), 0.7), () => soz);
      nesneler.forEach((el) => dokununca(el, () => {
        if (kilit) { zipla(el, 0.4); return; }
        bos.dokundu();
        const simdi = performance.now();
        if (sayilan.has(el)) {
          zipla(el, 0.4);
          // Çift dokunuş kazara olabilir; sayılanı bilerek yeniden sayınca Ceren yumuşakça baştan saydırır.
          if (simdi - (sonDokunus.get(el) ?? 0) < 700) return;
          sayilan.clear();
          nesneler.forEach((x) => etiketle(x, null));
          simdikiSoz = 'tekrar';
          void cal('tekrar').then(() => { if (canli(a) && !kilit) simdikiSoz = soz; });
          return;
        }
        sayilan.add(el);
        sonDokunus.set(el, simdi);
        cerenPoz('parmak-say');
        zipla(el);
        etiketle(el, sayilan.size);
        const bu = cal('say_' + sayilan.size);
        if (sayilan.size === n) {
          kilit = true;
          bos.dur();
          // Saymanın sonucu: son söylenen sayı, kaç tane olduğunu söyler.
          const hepsi = 'hepsi_' + n;
          void bu.then(() => bekle(250, a))
            .then((devam) => (devam && varsa(hepsi) ? cal(hepsi) : devam))
            .then(() => bekle(380, a)).then((devam) => bitir(devam));
        }
      }));
      cerenPoz('parmak-say');
      if (paylasilan(soz, n)) void cal(soz);
      return () => { bos.dur(); nesneler.forEach((el) => { el.onpointerdown = el.onclick = null; }); };
    });
  }

  // ----- 5. Sen koy -----
  function senKoy(n: number, a: number) {
    const tur = nesneTuru(n);
    kaynakEl.innerHTML = '<img src="' + nesneResmi(tur) + '" alt="" draggable="false">';
    kaynakEl.setAttribute('aria-label', 'Masaya bir ' + tur + ' koy');
    kaynakEl.hidden = false;
    masayiTopla(kaynakEl.getBoundingClientRect());
    if (!sakin) kaynakEl.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, delay: HIZLI ? 0 : 200, easing: 'ease-out', fill: 'backwards' });
    cerenPoz('sen-dene');
    simdikiSoz = 'koy_' + n;
    return adim((bitir) => {
      let sayi = 0, kilit = false;
      const bos = bostaIzle(() => zipla(kaynakEl, 0.8), () => 'koy_' + n);
      function koy(bas?: DOMRect) {
        if (kilit) return;
        bos.dokundu();
        sayi++;
        const el = nesneKoy(sayi - 1, n, bas ?? kaynakEl.getBoundingClientRect());
        etiketle(el, sayi);
        const k = sayi;
        dokununca(el, () => { zipla(el, 0.5); if (!kilit) void cal('say_' + k); });
        oyunSesi('kutu');
        cerenPoz('parmak-say');
        if (!sakin) kaynakEl.animate([{ transform: 'scale(.4)', opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 240, easing: 'ease-out' });
        const bu = cal('say_' + sayi);
        if (sayi === n) {
          kilit = true;
          bos.dur();
          kaynakEl.disabled = true;
          void bu.then(() => bekle(300, a)).then((devam) => bitir(devam));
        }
      }
      // Dokun ya da sürükle: ikisi de bir nesne koyar.
      let parmak = -1, x0 = 0, y0 = 0, kayan: HTMLElement | undefined;
      kaynakEl.disabled = false;
      kaynakEl.onpointerdown = (e) => {
        if (!e.isPrimary || e.button !== 0 || kilit || parmak !== -1) return;
        b.sesiAc();
        bos.dokundu();
        parmak = e.pointerId; x0 = e.clientX; y0 = e.clientY;
        try { kaynakEl.setPointerCapture(parmak); } catch { /* sentetik olay */ }
        if (!sakin) kaynakEl.animate([{ transform: 'none' }, { transform: 'scale(.9,1.06)' }, { transform: 'none' }], { duration: 200 });
      };
      kaynakEl.onpointermove = (e) => {
        if (e.pointerId !== parmak) return;
        const dx = e.clientX - x0, dy = e.clientY - y0;
        if (!kayan && Math.hypot(dx, dy) > 9) {
          kayan = kaynakEl.firstElementChild!.cloneNode(true) as HTMLElement;
          kayan.className = 'cd-kayan';
          const r = kaynakEl.firstElementChild!.getBoundingClientRect();
          Object.assign(kayan.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
          document.body.append(kayan);
        }
        if (kayan) kayan.style.translate = dx + 'px ' + dy + 'px';
      };
      const birak = (e: PointerEvent, iptalEdildi: boolean) => {
        if (e.pointerId !== parmak) return;
        parmak = -1;
        const k = kayan;
        kayan = undefined;
        if (!k) { if (!iptalEdildi) koy(); return; }
        const r = k.getBoundingClientRect();
        k.remove();
        const masa = dunya.getBoundingClientRect();
        // Masanın üstüne (ya da herhangi bir yere) bırakılan nesne sıradaki yerine oturur.
        if (!iptalEdildi && r.top + r.height / 2 > masa.top) koy(r);
      };
      kaynakEl.onpointerup = (e) => birak(e, false);
      kaynakEl.onpointercancel = (e) => birak(e, true);
      kaynakEl.onclick = (e) => { if (e.detail === 0) koy(); };
      void (async () => {
        if (paylasilan('sen_dene', n)) {
          simdikiSoz = 'sen_dene';
          await cal('sen_dene');
          if (!canli(a) || sayi > 0) { simdikiSoz = 'koy_' + n; return; }
        }
        simdikiSoz = 'koy_' + n;
        if (sayi === 0) await cal('koy_' + n);
      })();
      return () => {
        bos.dur();
        kayan?.remove();
        kaynakEl.onpointerdown = kaynakEl.onpointermove = kaynakEl.onpointerup = kaynakEl.onpointercancel = kaynakEl.onclick = null;
      };
    });
  }

  // ----- Bir sayının dersi -----
  async function sayiDersi(n: number) {
    iptal();
    const a = akis.no;
    simdikiSayi = n;
    kayit.simdi = n;
    sakla();
    siraGuncelle();
    dunya.dataset.sayi = String(n);
    isaretle('tanit');
    masayiTopla();
    kaynakEl.hidden = true;
    yaziEl.hidden = true;
    yaziEl.replaceChildren();
    hatiraEl.hidden = true;
    onYukle([tanitSesi(n), 'yaz', 'birlikte', 'sen_dene', ...(etkinlik(n) === 'koy' ? ['koy_' + n] : []), aferinSesi(n), ...sayilar.map((k) => 'say_' + k),
      ...['yazdin_' + n, 'hepsi_' + n, 'ben_sayayim'].filter(varsa)]);
    // 1) Tanıt: rakam sıradan tahtaya uçarken Ceren eliyle tahtayı gösterir, sonra rakamın adını söyler.
    const siraResmi = siraDugmeleri[n - 1].firstElementChild as HTMLElement;
    cerenPoz('goster');
    await tahtayaKoy(n, siraResmi.getBoundingClientRect());
    if (!(await bekle(380, a))) return;
    simdikiSoz = tanitSesi(n);
    if (!(await konus(tanitSesi(n), a))) return;
    if (!(await bekle(450, a))) return;
    // 2) Her sayıda tek bir çocuk etkinliği; sayıdan sayıya sırayla değişir (aynı oyun art arda gelmez).
    const tur = etkinlik(n);
    if (tur === 'yaz') {
      isaretle('yaz');
      if (!(await yaziAsamasi(n, a))) return;
      // Yazılan rakamın miktarı: Ceren hızla koyup sayar, sonucu söyler.
      isaretle('cerenSayar');
      if (!(await cerenSayar(n, a))) return;
      if (varsa('hepsi_' + n) && !(await konus('hepsi_' + n, a))) return;
    } else if (tur === 'birlikte') {
      // İlk "birlikte"de Ceren önce kendisi sayar (örnek); sonra yalnız çocukla birlikte sayılır.
      if (n === ILK_BIRLIKTE) {
        isaretle('cerenSayar');
        if (!(await cerenSayar(n, a))) return;
      } else {
        isaretle('getir');
        if (!(await nesneleriGetir(n, a))) return;
      }
      isaretle('birlikte');
      if (!(await birlikteSay(n, a))) return;
    } else {
      isaretle('sen');
      if (!(await senKoy(n, a))) return;
      if (varsa('hepsi_' + n) && !(await konus('hepsi_' + n, a))) return;
    }
    // 3) Aferin
    isaretle('aferin');
    kaynakEl.hidden = true;
    cerenPoz('alkis');
    oyunSesi('birles');
    zipla(tahta.firstElementChild);
    nesneler.forEach((el, i) => { if (!sakin) el.animate([{ transform: 'none' }, { transform: 'translateY(-9%)' }, { transform: 'none' }], { duration: 360, delay: i * 45 }); });
    if (!kayit.biten.includes(n)) kayit.biten = SAYILAR.filter((k) => k === n || kayit.biten.includes(k));
    sakla();
    siraGuncelle();
    simdikiSoz = aferinSesi(n);
    if (!(await bekle(650, a))) return;
    if (!(await konus(aferinSesi(n), a))) return;
    if (!(await bekle(350, a))) return;
    // Rakam yerine, sıradaki sayıya geçilir.
    const tahtaRakam = tahta.firstElementChild as HTMLElement | null;
    const r = tahtaRakam?.getBoundingClientRect();
    tahta.replaceChildren();
    if (r) await ucur(siraResmi, r, 520);
    zipla(siraDugmeleri[n - 1], 0.6);
    if (!canli(a)) return;
    masayiTopla();
    if (!(await bekle(450, a))) return;
    const sonraki = siradaki(kayit, n, sayilar);
    if (sonraki === undefined) void hatiraVer(a);
    else void sayiDersi(sonraki);
  }

  // ----- Hatıra -----
  async function hatiraVer(a: number) {
    isaretle('hatira');
    kayit.bitti = true;
    sakla();
    simdikiSayi = 0;
    siraGuncelle();
    cerenPoz('alkis');
    hatiraEl.hidden = false;
    if (!sakin) hatiraEl.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: 560, easing: 'ease-out' });
    oyunSesi('birles');
    siraDugmeleri.forEach((d, i) => { if (!sakin) d.animate([{ transform: 'none' }, { transform: 'translateY(-22%)' }, { transform: 'none' }], { duration: 420, delay: 200 + i * 60 }); });
    // "Bugün beşe kadar / ona kadar saymayı öğrendin."
    simdikiSoz = bitisSesi(sayilar);
    if (!(await bekle(900, a))) return;
    if (!(await konus(simdikiSoz, a))) return;
    if (!(await bekle(500, a))) return;
    b.bitir();
  }

  // ----- Başlangıç -----
  async function basla() {
    iptal();
    const a = akis.no;
    // Bütün sayıları öğrenmiş ama hatırasını almamış çocuk (ör. 2–3 yaşta 6–10'da kalmış eski kayıt) karşılanır, hatırasını alır.
    const hatiraBekliyor = !kayit.bitti && hepsiBitti(kayit, sayilar);
    const n = kayit.bitti || hatiraBekliyor ? sayilar[0] : kayit.biten.includes(kayit.simdi) ? siradaki(kayit, kayit.simdi, sayilar) ?? sayilar[0] : kayit.simdi;
    simdikiSayi = n;
    siraGuncelle();
    isaretle('giris');
    onYukle(['giris', tanitSesi(n), 'say_' + n, ...['devam'].filter(varsa)]);
    cerenPoz('konus');
    if (!kayit.tanitildi) {
      simdikiSoz = 'giris';
      if (!(await konus('giris', a))) return;
      kayit.tanitildi = true;
      sakla();
    } else if (varsa('devam') && !karsilandi) {
      karsilandi = true;
      simdikiSoz = 'devam';
      if (!(await konus('devam', a))) return;
    }
    if (!(await bekle(350, a))) return;
    if (hatiraBekliyor) { void hatiraVer(a); return; }
    void sayiDersi(n);
  }

  dokununca(ceren, () => { zipla(ceren, 0.25); tekrarla(); });
  function tekrarla() {
    if (!simdikiSoz) return;
    if (ses.calan === simdikiSoz && bastan()) return;
    void cal(simdikiSoz);
  }
  b.tekrarDinle(tekrarla);
  void basla();

  return () => {
    akis.kapandi = true;
    iptal();
    document.removeEventListener('scroll', kaydirmaYok, true);
    cereniBirak();
    document.querySelectorAll('.cd-kayan').forEach((el) => el.remove());
    sira.remove();
    dunya.remove();
  };
}
