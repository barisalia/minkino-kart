// Matematik · Ceren Öğretmen dersi 2: Şekiller (yol haritası adım 4). Ders iskeletinin (ders-iskelet.ts) üstünde,
// Sayılar dersinin kalıbıyla: her şekilde Ceren şekli tanıtır, çocuk TEK bir etkinlik yapar, alkış ve övgü; sonunda hatıra.
// Etkinlik şekilden şekle değişir: daire ve üçgen parmakla çizilir (şeklin kenarındaki kesik izden), kare ve dikdörtgen
// sınıftaki nesneler arasında bulunur (pencere kare, kitap dikdörtgen). 2–3 yaşta ders üç şekilde (daire, kare, üçgen) biter.
// Şekil evine girerken açılır (Sayı masasındaki Sayılar dersi gibi). Astra'nın M3 çizimleri ve Ceren'in sözleri
// tamam değilse çocuklara hiç görünmez; test kipinde ?test=1&sekiller=1 ile açılır.
import { menuYasiOku } from '../../src/engine/menu-yas';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { ilerlet, type Nokta } from './ceren-ders-mantik';
import { DersAkisi, DersSesi, cerenBagla, cerenFiguru, hareketler, resimHTML } from './ders-iskelet';
import {
  BUL, GEREKLI_CIZIMLER, GEREKLI_SESLER, MASALI_FON, NESNE_YERI, SEKIL_ADI, SEKIL_KAYIT_ANAHTARI, bitisSesi, bulSecenekleri, dersSekilleri,
  kaydiCoz, sekilEtkinligi, sekilYolu, siradaki, tanitSesi, type Sekil, type SekilKaydi,
} from './ders-sekiller-mantik';
import './ceren-ders.css';
import './ders-sekiller.css';

const cizimler = import.meta.glob<string>('../../assets/matematik/ders/sekiller/*.webp', { eager: true, query: '?url', import: 'default' });
const cizim = (ad: string): string | undefined => cizimler['../../assets/matematik/ders/sekiller/' + ad + '.webp'];
/** Ceren'in Sayılar dersindeki el pozları (aynı Ceren): göster, alkış, sen dene. */
const cerenCizimleri = import.meta.glob<string>('../../assets/matematik/ceren/ceren-*.webp', { eager: true, query: '?url', import: 'default' });
const POZLAR = ['goster', 'alkis', 'sen-dene', 'havada-ciz', 'buyutec', 'dusun'] as const;
type Poz = (typeof POZLAR)[number] | 'konus';
const pozResmi = (p: string) => cizim('ceren-' + p) ?? cerenCizimleri['../../assets/matematik/ceren/ceren-' + p + '.webp'];
const agizKareleri = Object.entries(import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp', { eager: true, query: '?url', import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b)).map(([, u]) => u);
const sesAdresleri = import.meta.glob<string>('../../assets/matematik/ders/sekiller/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const sesAdresi = (id: string) => sesAdresleri['../../assets/matematik/ders/sekiller/ses/' + id + '.mp3'];

const adres = new URLSearchParams(location.search);
const TEST = adres.has('test');
const HIZLI = TEST && adres.has('hizli');
declare global { interface Window { __sekilSesleri?: string[] } }
if (TEST) window.__sekilSesleri = [];
export const sekillerDersiHazir = GEREKLI_CIZIMLER.every((ad) => !!cizim(ad)) && GEREKLI_SESLER.every((id) => !!sesAdresi(id));
/** Uygulamada çizimler ve sesler tamamsa kendiliğinden açılır; test kipinde yalnız ?test=1&sekiller=1 ile. */
export const sekillerDersiGorunur = TEST ? adres.has('sekiller') : sekillerDersiHazir;
const minikMi = () => (menuYasiOku() ?? 5) < 4;
function kaydiOku(): SekilKaydi {
  try { return kaydiCoz(localStorage.getItem(SEKIL_KAYIT_ANAHTARI), dersSekilleri(minikMi())); } catch { return kaydiCoz(null, dersSekilleri(minikMi())); }
}
export const sekillerDersiBitti = () => kaydiOku().bitti;

const ses = new DersSesi(sesAdresi, { hizli: HIZLI, okundu: (id) => window.__sekilSesleri?.push(id) });

export type SekillerBaglami = {
  kok: HTMLElement;
  sesiAc: () => void;
  tekrarDinle: (fn: () => void) => void;
  /** Ders bitti, hatıra verildi. */
  bitir: () => void;
  /** Bir konuda ilk denemede yanlış ya da yanlışsız doğru (akıllı tekrar, veli sayfası). */
  zorlandi?: (konu: string) => void;
  basardi?: (konu: string) => void;
};

const NS = 'http://www.w3.org/2000/svg';
const yolD = (c: Nokta[]) => (c.length ? 'M' + c.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') : '');

export function sekillerDersi(b: SekillerBaglami): () => void {
  const kayit = kaydiOku();
  const sakla = () => { try { localStorage.setItem(SEKIL_KAYIT_ANAHTARI, JSON.stringify(kayit)); } catch { /* özel pencere */ } };
  const minik = minikMi();
  const sekiller = dersSekilleri(minik);
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let simdikiSoz = 'giris';
  let simdiki: Sekil = sekiller[0];

  // ----- Sahne: Ceren solda önde, şekil duvarın ortasında, sınıf nesneleri yerde -----
  const dunya = document.createElement('div');
  dunya.className = 'cd-dunya ds-dunya';
  // Masalı fon geldiyse kitap ve pizza masaya konur; yoksa yerde, masanın duracağı yerin önünde.
  if (cizim(MASALI_FON)) dunya.dataset.masa = '1';
  dunya.innerHTML =
    resimHTML(cizim(MASALI_FON) ?? cizim('sinif-sekiller'), 'cd-sinif', 'sinif-sekiller') +
    cerenFiguru({ pozlar: POZLAR, pozResmi, agizKareleri, x: 0.005, ust: 0.4, h: 0.6 }) +
    '<div class="ds-alan" role="group" aria-label="Şekiller"></div>';
  const ceren = dunya.querySelector<HTMLButtonElement>('.cd-ceren')!;
  const alanEl = dunya.querySelector<HTMLElement>('.ds-alan')!;
  const sira = document.createElement('div');
  sira.className = 'ds-sira';
  sira.setAttribute('role', 'group');
  sira.setAttribute('aria-label', 'Şekiller');
  sira.innerHTML = sekiller.map((s) => '<button type="button" class="ds-sira-sekil" data-sekil="' + s + '" aria-label="' + SEKIL_ADI[s] + '">' +
    resimHTML(cizim(s), 'ds-sira-resim', s) + '</button>').join('');
  const siraDugmeleri = Array.from(sira.querySelectorAll<HTMLButtonElement>('.ds-sira-sekil'));
  b.kok.append(dunya, sira);

  const akis = new DersAkisi(ses, b.sesiAc, HIZLI);
  const { cerenPoz: poz, birak: cereniBirak } = cerenBagla(ceren, ses, { pozVar: (p) => !!pozResmi(p), sakin, hizli: HIZLI, kapandi: () => akis.kapandi });
  const cerenPoz = (p: Poz) => poz(p);
  const { zipla, salla, ucur } = hareketler(sakin, HIZLI);
  const isaretle = (adim: string) => { dunya.dataset.adim = adim; dunya.dataset.sekil = simdiki; };
  const soylenen = new Set<string>();

  function siraGuncelle() {
    siraDugmeleri.forEach((d) => {
      const s = d.dataset.sekil as Sekil, bitti = kayit.biten.includes(s);
      d.classList.toggle('bitti', bitti);
      d.classList.toggle('simdi', s === simdiki);
      d.setAttribute('aria-label', SEKIL_ADI[s] + (bitti ? ', öğrenildi' : s === simdiki ? ', şimdi' : ''));
      if (s === simdiki) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
  }
  siraDugmeleri.forEach((d) => akis.dokununca(d, () => {
    const s = d.dataset.sekil as Sekil;
    if (s === simdiki) { zipla(d); zipla(alanEl.querySelector('.ds-sekil')); return; }
    if (!kayit.biten.includes(s)) { salla(d); return; }
    zipla(d);
    void sekilDersi(s);
  }));

  /** Şekil duvarda: sıradaki küçük şeklinden büyüyerek gelir. */
  function sekliKoy(s: Sekil) {
    alanEl.replaceChildren();
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'ds-sekil';
    el.dataset.sekil = s;
    el.setAttribute('aria-label', SEKIL_ADI[s]);
    el.innerHTML = resimHTML(cizim(s), 'ds-sekil-resim', s);
    alanEl.append(el);
    akis.dokununca(el, () => { zipla(el, 0.4); void ses.cal(tanitSesi(s)); });
    const kaynak = siraDugmeleri.find((d) => d.dataset.sekil === s)?.getBoundingClientRect();
    return ucur(el, kaynak, 620).then(() => el);
  }

  // ----- Çiz: şeklin kenarındaki kesik izden, yeşil noktadan başlayarak -----
  function cizAsamasi(s: Sekil, a: number, el: HTMLElement) {
    const yol = sekilYolu(s);
    el.insertAdjacentHTML('beforeend', resimHTML(cizim('iz-' + s), 'ds-iz', 'iz-' + s));
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1000 1000');
    svg.setAttribute('class', 'cd-yazi-svg ds-cizim');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', SEKIL_ADI[s] + ' şeklini parmağınla çiz');
    if (TEST) svg.dataset.yol = JSON.stringify([yol.map((p) => [Math.round(p[0]), Math.round(p[1])])]);
    const yeni = <K extends keyof SVGElementTagNameMap>(ad: K, sinif: string, ust: Element = svg) => {
      const e = document.createElementNS(NS, ad);
      e.setAttribute('class', sinif);
      ust.append(e);
      return e;
    };
    const g = yeni('g', 'cd-murekkep');
    const alt = yeni('path', 'cd-m-alt', g), ust = yeni('path', 'cd-m-ust', g);
    const ornekIz = yeni('path', 'cd-ornek-iz');
    const parmakIzi = yeni('circle', 'cd-parmak');
    parmakIzi.setAttribute('r', '36');
    const uc = yeni('g', 'cd-uc');
    const nabiz = yeni('g', 'cd-uc-nabiz', uc);
    for (const [r, k] of [[50, 'cd-uc-kontur'], [42, 'cd-uc-halka'], [31, 'cd-uc-ic']] as const) yeni('circle', k, nabiz).setAttribute('r', String(r));
    el.append(svg);
    el.classList.add('ciziliyor');

    let nokta = 0, parmak = -1, bitti = false, ornekRaf = 0;
    const tol = minik ? 140 : 112, baslamaTol = minik ? 170 : 140;
    const ucuGoster = () => uc.setAttribute('transform', 'translate(' + yol[nokta][0].toFixed(1) + ' ' + yol[nokta][1].toFixed(1) + ')');
    const murekkepCiz = () => { const d = nokta > 0 ? yolD(yol.slice(0, nokta + 1)) : ''; alt.setAttribute('d', d); ust.setAttribute('d', d); };
    /** Ceren'in parmağı yolu bir kez gezer (çizgi bırakmaz, arkasında hafif iz söner). */
    function ornekGoster() {
      cancelAnimationFrame(ornekRaf);
      if (bitti || parmak !== -1) return;
      const sure = HIZLI ? 1 : Math.max(1500, yol.length * 22), t0 = performance.now();
      parmakIzi.classList.add('gorunur');
      ornekIz.classList.remove('soner');
      const adimla = () => {
        if (akis.kapandi || bitti || parmak !== -1) { parmakIzi.classList.remove('gorunur'); ornekIz.setAttribute('d', ''); return; }
        const k = Math.min(yol.length - 1, Math.floor(((performance.now() - t0) / sure) * yol.length));
        parmakIzi.setAttribute('cx', yol[k][0].toFixed(1));
        parmakIzi.setAttribute('cy', yol[k][1].toFixed(1));
        ornekIz.setAttribute('d', yolD(yol.slice(0, k + 1)));
        if (performance.now() - t0 < sure) ornekRaf = requestAnimationFrame(adimla);
        else { parmakIzi.classList.remove('gorunur'); ornekIz.classList.add('soner'); }
      };
      adimla();
    }
    const svgNoktasi = (e: { clientX: number; clientY: number }) => {
      const m = svg.getScreenCTM();
      return m ? new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()) : null;
    };
    ucuGoster();
    simdikiSoz = 'ciz';
    isaretle('ciz');
    return akis.adim((bitir) => {
      const bos = akis.bostaIzle(ornekGoster, () => 'ciz');
      const ilerle = (x: number, y: number) => {
        const yeniNokta = ilerlet(yol, nokta, x, y, tol);
        if (yeniNokta === nokta) return;
        nokta = yeniNokta;
        murekkepCiz();
        if (nokta < yol.length - 1) { ucuGoster(); return; }
        bitti = true;
        uc.style.display = 'none';
        bos.dur();
        el.classList.remove('yaziyor');
        el.classList.add('cizildi');
        oyunSesi('miknatis');
        zipla(el, 0.6);
        cerenPoz('alkis');
        simdikiSoz = 'cizdin_' + s;
        void akis.bekle(400, a).then((d) => (d ? ses.cal(simdikiSoz) : false)).then(() => akis.bekle(350, a)).then((d) => bitir(d));
      };
      svg.onpointerdown = (e) => {
        if (!e.isPrimary || e.button !== 0 || bitti || parmak !== -1) return;
        b.sesiAc();
        bos.dokundu();
        cancelAnimationFrame(ornekRaf);
        parmakIzi.classList.remove('gorunur');
        ornekIz.setAttribute('d', '');
        const p = svgNoktasi(e), q = yol[nokta];
        if (!p || Math.hypot(p.x - q[0], p.y - q[1]) > baslamaTol) {
          // Yanlış yer yok: yeşil nokta "buradan başla" diye kıpırdar.
          if (!sakin) nabiz.animate([{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }], { duration: 320 });
          return;
        }
        parmak = e.pointerId;
        try { svg.setPointerCapture(parmak); } catch { /* sentetik olay */ }
        el.classList.add('yaziyor');
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
        el.classList.remove('yaziyor');
        bos.dokundu();
      };
      // Çocuk çizerken Ceren de havada çizer. Yönerge ilk çizimde (2–3 yaşta her çizimde) okunur.
      cerenPoz('havada-ciz');
      const ilk = !soylenen.has('ciz');
      soylenen.add('ciz');
      if (ilk || minik) void ses.cal('ciz');
      ornekGoster();
      return () => {
        bos.dur();
        cancelAnimationFrame(ornekRaf);
        svg.onpointerdown = svg.onpointermove = svg.onpointerup = svg.onpointercancel = null;
      };
    });
  }

  // ----- Bul: sınıftaki üç nesneden hangisi bu şekil -----
  function bulAsamasi(s: 'kare' | 'dikdortgen', a: number, el: HTMLElement) {
    el.classList.add('kucuk');
    const dogru = BUL[s].dogru;
    const secenekler = bulSecenekleri(s);
    const dugmeler = secenekler.map((ad, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'ds-nesne';
      d.dataset.nesne = ad;
      d.dataset.i = String(i);
      d.dataset.yer = NESNE_YERI[ad];
      d.setAttribute('aria-label', ad === 'pizza-dilimi' ? 'pizza dilimi' : ad);
      d.innerHTML = resimHTML(cizim(ad), 'ds-nesne-resim', ad);
      alanEl.append(d);
      if (!sakin) d.animate([{ transform: 'translateY(30%) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: HIZLI ? 1 : 380, delay: HIZLI ? 0 : 120 * i, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
      return d;
    });
    simdikiSoz = 'bul_' + s;
    isaretle('bul');
    let yanlis = 0;
    return akis.adim((bitir) => {
      const dogruEl = dugmeler[secenekler.indexOf(dogru)];
      const bos = akis.bostaIzle(() => zipla(dogruEl, 0.3), () => 'bul_' + s);
      let bitti = false;
      dugmeler.forEach((d) => akis.dokununca(d, () => {
        if (bitti) return;
        bos.dokundu();
        if (d !== dogruEl) {
          if (++yanlis === 1) b.zorlandi?.(s);
          salla(d);
          // Ceren önce sessizce düşünür (poz görünsün), sonra ipucunu söyler, yeniden büyüteçle arar.
          ses.sus();
          cerenPoz('dusun');
          simdikiSoz = 'ipucu_' + s;
          void akis.bekle(800, a)
            .then((devam) => (devam && !bitti ? ses.cal(simdikiSoz) : false))
            .then(() => { if (!bitti && akis.canli(a)) { cerenPoz('buyutec'); if (yanlis >= 2) dogruEl.classList.add('ipucu'); } });
          return;
        }
        bitti = true;
        bos.dur();
        if (!yanlis) b.basardi?.(s);
        oyunSesi('miknatis');
        d.classList.add('dogru');
        dugmeler.forEach((o) => { if (o !== d) o.classList.add('gitti'); });
        zipla(d, 0.6);
        cerenPoz('alkis');
        simdikiSoz = 'buldun_' + s;
        void akis.bekle(300, a).then((devam) => (devam ? ses.cal(simdikiSoz) : false)).then(() => akis.bekle(400, a)).then((devam) => bitir(devam));
      }));
      cerenPoz('buyutec');
      void ses.cal('bul_' + s);
      return () => bos.dur();
    });
  }

  async function sekilDersi(s: Sekil) {
    akis.iptal();
    const a = akis.no;
    simdiki = s;
    siraGuncelle();
    isaretle('tanit');
    ses.onYukle([tanitSesi(s), 'ciz', 'cizdin_' + s, 'bul_' + s, 'buldun_' + s, 'ipucu_' + s].filter((id) => ses.varMi(id)));
    cerenPoz('goster');
    const el = await sekliKoy(s);
    if (!akis.canli(a)) return;
    simdikiSoz = tanitSesi(s);
    if (!(await akis.konus(simdikiSoz, a))) return;
    if (!(await akis.bekle(300, a))) return;
    const tamam = sekilEtkinligi(s) === 'ciz' ? await cizAsamasi(s, a, el) : await bulAsamasi(s as 'kare' | 'dikdortgen', a, el);
    if (!tamam || !akis.canli(a)) return;
    if (!kayit.biten.includes(s)) kayit.biten.push(s);
    const sonraki = siradaki(kayit, sekiller);
    if (sonraki) kayit.simdi = sonraki;
    sakla();
    siraGuncelle();
    zipla(siraDugmeleri.find((d) => d.dataset.sekil === s));
    if (!(await akis.bekle(500, a))) return;
    if (!sonraki) { void hatiraVer(a); return; }
    void sekilDersi(sonraki);
  }

  async function hatiraVer(a: number) {
    alanEl.replaceChildren();
    simdiki = sekiller[sekiller.length - 1];
    isaretle('hatira');
    cerenPoz('alkis');
    const h = document.createElement('div');
    h.className = 'ds-hatira';
    h.innerHTML = resimHTML(cizim('hatira-sekil-kutusu'), 'ds-hatira-resim', 'hatira-sekil-kutusu');
    alanEl.append(h);
    oyunSesi('birles');
    if (!sakin) h.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: HIZLI ? 1 : 560, easing: 'ease-out' });
    siraDugmeleri.forEach((d, i) => { if (!sakin) d.animate([{ transform: 'none' }, { transform: 'translateY(-22%)' }, { transform: 'none' }], { duration: 420, delay: 200 + i * 60 }); });
    simdikiSoz = bitisSesi(sekiller);
    if (!(await akis.bekle(700, a))) return;
    if (!(await akis.konus(simdikiSoz, a))) return;
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
    const hatiraBekliyor = !kayit.bitti && sekiller.every((s) => kayit.biten.includes(s));
    const s = kayit.bitti || hatiraBekliyor ? sekiller[0] : kayit.biten.includes(kayit.simdi) ? siradaki(kayit, sekiller) ?? sekiller[0] : kayit.simdi;
    simdiki = s;
    siraGuncelle();
    isaretle('giris');
    ses.onYukle(['giris', 'devam', tanitSesi(s)]);
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
    void sekilDersi(s);
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

