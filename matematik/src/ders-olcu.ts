// Matematik · Ceren Öğretmen dersi 3: Karşılaştır ve ölç (yol haritası adım 5). Ders iskeletinin üstünde.
// Her kavramda Ceren bir çifti tanıtır (büyük/küçük ayıcık, aynı yerden başlayan uzun/kısa kalem, çok/az düğmeli kavanoz,
// ağır karpuz/hafif tüy), sonra çocuk 1–2 hızlı soruda doğru olana dokunur; övgü; sonunda hatıra (mezura).
// 2–3 yaşta ders ilk üç kavramda biter. Ölçü tezgâhına girerken açılır (Boy Duvarı ve Yaprak Yolu orada birimle pekiştirir).
// Astra'nın M4 çizimleri ve Ceren'in sözleri tamam değilse çocuklara hiç görünmez; test kipinde ?test=1&olcudersi=1 ile
// açılır, gelmemiş çizimin yerinde adı yazılı kutu durur (uygulama yoluna girmez).
import { menuYasiOku } from '../../src/engine/menu-yas';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { DersAkisi, DersSesi, cerenBagla, cerenFiguru, hareketler, resimHTML } from './ders-iskelet';
import {
  GEREKLI_CIZIMLER, GEREKLI_SESLER, KAVRAM_ADI, OLCU_KAYIT_ANAHTARI, PLAN, bitisSesi, dersKavramlari, dizilis, dogruSesi, kaydiCoz,
  siradaki, type Kavram, type OlcuKaydi,
} from './ders-olcu-mantik';
import './ceren-ders.css';
import './ders-sekiller.css';
import './ders-olcu.css';

const cizimler = import.meta.glob<string>('../../assets/matematik/ders/olcu/*.webp', { eager: true, query: '?url', import: 'default' });
const cizim = (ad: string): string | undefined => cizimler['../../assets/matematik/ders/olcu/' + ad + '.webp'];
const cerenCizimleri = import.meta.glob<string>('../../assets/matematik/ceren/ceren-*.webp', { eager: true, query: '?url', import: 'default' });
const POZLAR = ['goster', 'alkis', 'sen-dene', 'buyuk', 'kucuk', 'tart'] as const;
type Poz = (typeof POZLAR)[number] | 'konus';
const pozResmi = (p: string) => cizim('ceren-' + p) ?? cerenCizimleri['../../assets/matematik/ceren/ceren-' + p + '.webp'];
const agizKareleri = Object.entries(import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp', { eager: true, query: '?url', import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b)).map(([, u]) => u);
const sesAdresleri = import.meta.glob<string>('../../assets/matematik/ders/olcu/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const sesAdresi = (id: string) => sesAdresleri['../../assets/matematik/ders/olcu/ses/' + id + '.mp3'];

const adres = new URLSearchParams(location.search);
const TEST = adres.has('test');
const HIZLI = TEST && adres.has('hizli');
declare global { interface Window { __olcuDersSesleri?: string[] } }
if (TEST) window.__olcuDersSesleri = [];
export const olcuDersiHazir = GEREKLI_CIZIMLER.every((ad) => !!cizim(ad)) && GEREKLI_SESLER.every((id) => !!sesAdresi(id));
/** Uygulamada çizimler ve sesler tamamsa kendiliğinden açılır; test kipinde yalnız ?test=1&olcudersi=1 ile. */
export const olcuDersiGorunur = TEST ? adres.has('olcudersi') : olcuDersiHazir;
const minikMi = () => (menuYasiOku() ?? 5) < 4;
function kaydiOku(): OlcuKaydi {
  try { return kaydiCoz(localStorage.getItem(OLCU_KAYIT_ANAHTARI), dersKavramlari(minikMi())); } catch { return kaydiCoz(null, dersKavramlari(minikMi())); }
}
export const olcuDersiBitti = () => kaydiOku().bitti;

const ses = new DersSesi(sesAdresi, { hizli: HIZLI, okundu: (id) => window.__olcuDersSesleri?.push(id) });

/** Test kipinde, çizimi gelmemiş nesnenin kutusunda okunan ad. */
const ETIKET: Record<string, string> = {
  'ayicik-buyuk': 'büyük ayıcık', 'ayicik-kucuk': 'küçük ayıcık', 'sapka-buyuk': 'büyük şapka', 'sapka-kucuk': 'küçük şapka',
  'kupa-buyuk': 'büyük kupa', 'kupa-kucuk': 'küçük kupa', 'kalem-uzun': 'uzun kalem', 'kalem-kisa': 'kısa kalem',
  'atki-uzun': 'uzun atkı', 'atki-kisa': 'kısa atkı', 'tren-uzun': 'uzun tren', 'tren-kisa': 'kısa tren',
  'kavanoz-cok': 'çok düğme', 'kavanoz-az': 'az düğme', karpuz: 'karpuz', tuy: 'tüy',
};
const SIMGE: Record<Kavram, string> = { 'buyuk-kucuk': 'ayicik-buyuk', 'uzun-kisa': 'kalem-uzun', 'cok-az': 'kavanoz-cok', 'agir-hafif': 'karpuz' };

export type OlcuDersiBaglami = {
  kok: HTMLElement; sesiAc: () => void; tekrarDinle: (fn: () => void) => void; bitir: () => void;
  /** Bir konuda ilk denemede yanlış ya da yanlışsız doğru (akıllı tekrar, veli sayfası). */
  zorlandi?: (konu: string) => void;
  basardi?: (konu: string) => void;
};

export function olcuDersi(b: OlcuDersiBaglami): () => void {
  const kayit = kaydiOku();
  const sakla = () => { try { localStorage.setItem(OLCU_KAYIT_ANAHTARI, JSON.stringify(kayit)); } catch { /* özel pencere */ } };
  const kavramlar = dersKavramlari(minikMi());
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let simdikiSoz = 'giris';
  let simdiki: Kavram = kavramlar[0];
  let ovgu = 0;

  // ----- Sahne: Ceren solda önde, çiftler halının üstünde -----
  const dunya = document.createElement('div');
  dunya.className = 'cd-dunya do-dunya';
  dunya.innerHTML =
    resimHTML(cizim('oyuncak-odasi'), 'cd-sinif', 'oyuncak-odasi') +
    cerenFiguru({ pozlar: POZLAR, pozResmi, agizKareleri, x: 0.005, ust: 0.4, h: 0.6 }) +
    '<div class="do-alan" role="group" aria-label="Karşılaştır"></div>';
  const ceren = dunya.querySelector<HTMLButtonElement>('.cd-ceren')!;
  const alanEl = dunya.querySelector<HTMLElement>('.do-alan')!;
  const sira = document.createElement('div');
  sira.className = 'ds-sira do-sira';
  sira.setAttribute('role', 'group');
  sira.setAttribute('aria-label', 'Kavramlar');
  sira.innerHTML = kavramlar.map((k) => '<button type="button" class="ds-sira-sekil" data-kavram="' + k + '" aria-label="' + KAVRAM_ADI[k] + '">' +
    resimHTML(cizim(SIMGE[k]), 'ds-sira-resim', SIMGE[k], '', '') + '</button>').join('');
  const siraDugmeleri = Array.from(sira.querySelectorAll<HTMLButtonElement>('.ds-sira-sekil'));
  b.kok.append(dunya, sira);

  const akis = new DersAkisi(ses, b.sesiAc, HIZLI);
  const { cerenPoz: poz, birak: cereniBirak } = cerenBagla(ceren, ses, { pozVar: (p) => !!pozResmi(p), sakin, hizli: HIZLI, kapandi: () => akis.kapandi });
  const cerenPoz = (p: Poz) => poz(p);
  const { zipla, salla } = hareketler(sakin, HIZLI);
  const isaretle = (adim: string) => { dunya.dataset.adim = adim; dunya.dataset.kavram = simdiki; };

  function siraGuncelle() {
    siraDugmeleri.forEach((d) => {
      const k = d.dataset.kavram as Kavram, bitti = kayit.biten.includes(k);
      d.classList.toggle('bitti', bitti);
      d.classList.toggle('simdi', k === simdiki);
      d.setAttribute('aria-label', KAVRAM_ADI[k] + (bitti ? ', öğrenildi' : k === simdiki ? ', şimdi' : ''));
      if (k === simdiki) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
  }
  siraDugmeleri.forEach((d) => akis.dokununca(d, () => {
    const k = d.dataset.kavram as Kavram;
    if (k === simdiki) { zipla(d); return; }
    if (!kayit.biten.includes(k)) { salla(d); return; }
    zipla(d);
    void kavramDersi(k);
  }));

  /** Çifti halıya koyar: yatay olanlar üst üste (sol uçları aynı yerde), ötekiler yan yana. Belirerek gelir. */
  function ciftiKoy(cift: readonly [string, string]) {
    alanEl.replaceChildren();
    alanEl.dataset.dizilis = dizilis(cift);
    return cift.map((ad, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'do-nesne';
      d.dataset.nesne = ad;
      d.dataset.yer = String(i);
      d.setAttribute('aria-label', ETIKET[ad] ?? ad);
      d.innerHTML = resimHTML(cizim(ad), 'do-nesne-resim', ad, '', ETIKET[ad] ?? ad);
      alanEl.append(d);
      if (!sakin) d.animate([{ transform: 'translateY(25%) scale(.7)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: HIZLI ? 1 : 380, delay: HIZLI ? 0 : 140 * i, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
      return d;
    });
  }
  /** Tüy havalanıp süzülür (hafif); karpuz yerinde ağırca sallanır. */
  function agirHafif(el: HTMLElement) {
    if (sakin) return;
    if (el.dataset.nesne === 'tuy') el.animate([{ transform: 'none' }, { transform: 'translate(-6%,-30%) rotate(-12deg)' }, { transform: 'translate(5%,-18%) rotate(10deg)' }, { transform: 'none' }], { duration: 1600, easing: 'ease-in-out' });
    if (el.dataset.nesne === 'karpuz') el.animate([{ transform: 'none' }, { transform: 'translateY(-3%)' }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.5,0,.5,1)' });
  }

  async function tanit(k: Kavram, a: number) {
    const { cift, sozler } = PLAN[k].tanit;
    const el = ciftiKoy(cift);
    isaretle('tanit');
    if (!(await akis.bekle(450, a))) return false;
    for (const s of sozler) {
      const one = s.one ? el[cift.indexOf(s.one)] : null;
      el.forEach((e) => e.classList.toggle('one', e === one));
      if (one) zipla(one, 0.5); else el.forEach((e) => agirHafif(e));
      cerenPoz(s.poz as Poz);
      simdikiSoz = s.soz;
      if (!(await akis.konus(s.soz, a))) return false;
      if (!(await akis.bekle(250, a))) return false;
    }
    el.forEach((e) => e.classList.remove('one'));
    return akis.bekle(300, a);
  }

  function soruSor(k: Kavram, i: number, a: number) {
    const soru = PLAN[k].sorular[i];
    const el = ciftiKoy(soru.cift);
    const dogruEl = el[soru.cift.indexOf(soru.dogru)];
    simdikiSoz = soru.soz;
    isaretle('soru-' + i);
    let yanlis = 0;
    return akis.adim((bitir) => {
      const bos = akis.bostaIzle(() => zipla(dogruEl, 0.3), () => soru.soz);
      let bitti = false;
      el.forEach((d) => akis.dokununca(d, () => {
        if (bitti) return;
        bos.dokundu();
        if (d !== dogruEl) {
          if (++yanlis === 1) b.zorlandi?.(k);
          salla(d);
          ses.sus();
          cerenPoz('goster');
          simdikiSoz = 'ipucu';
          void akis.bekle(500, a)
            .then((devam) => (devam && !bitti ? ses.cal('ipucu') : false))
            .then(() => { if (!bitti && akis.canli(a)) { simdikiSoz = soru.soz; cerenPoz('sen-dene'); if (yanlis >= 2) dogruEl.classList.add('ipucu'); } });
          return;
        }
        bitti = true;
        bos.dur();
        if (!yanlis) b.basardi?.(k);
        oyunSesi('miknatis');
        d.classList.add('dogru');
        el.forEach((o) => { if (o !== d) o.classList.add('soluk'); });
        zipla(d, 0.6);
        agirHafif(d);
        cerenPoz('alkis');
        simdikiSoz = dogruSesi(ovgu++);
        void akis.bekle(250, a).then((devam) => (devam ? ses.cal(simdikiSoz) : false)).then(() => akis.bekle(350, a)).then((devam) => bitir(devam));
      }));
      cerenPoz('sen-dene');
      void ses.cal(soru.soz);
      return () => bos.dur();
    });
  }

  async function kavramDersi(k: Kavram) {
    akis.iptal();
    const a = akis.no;
    simdiki = k;
    siraGuncelle();
    const plan = PLAN[k];
    ses.onYukle([...plan.tanit.sozler.map((s) => s.soz), ...plan.sorular.map((s) => s.soz), 'dogru_1', 'dogru_2', 'dogru_3', 'ipucu']);
    if (!(await tanit(k, a))) return;
    for (let i = 0; i < plan.sorular.length; i++) {
      if (!(await soruSor(k, i, a)) || !akis.canli(a)) return;
    }
    if (!kayit.biten.includes(k)) kayit.biten.push(k);
    const sonraki = siradaki(kayit, kavramlar);
    if (sonraki) kayit.simdi = sonraki;
    sakla();
    siraGuncelle();
    zipla(siraDugmeleri.find((d) => d.dataset.kavram === k));
    if (!(await akis.bekle(450, a))) return;
    if (!sonraki) { void hatiraVer(a); return; }
    void kavramDersi(sonraki);
  }

  async function hatiraVer(a: number) {
    alanEl.replaceChildren();
    delete alanEl.dataset.dizilis;
    simdiki = kavramlar[kavramlar.length - 1];
    isaretle('hatira');
    cerenPoz('alkis');
    const h = document.createElement('div');
    h.className = 'ds-hatira do-hatira';
    h.innerHTML = resimHTML(cizim('hatira-mezura'), 'ds-hatira-resim', 'hatira-mezura', '', 'mezura');
    alanEl.append(h);
    oyunSesi('birles');
    if (!sakin) h.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: HIZLI ? 1 : 560, easing: 'ease-out' });
    simdikiSoz = bitisSesi(kavramlar);
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
    const hatiraBekliyor = !kayit.bitti && kavramlar.every((k) => kayit.biten.includes(k));
    const k = kayit.bitti || hatiraBekliyor ? kavramlar[0] : kayit.biten.includes(kayit.simdi) ? siradaki(kayit, kavramlar) ?? kavramlar[0] : kayit.simdi;
    simdiki = k;
    siraGuncelle();
    isaretle('giris');
    ses.onYukle(['giris', 'devam', ...PLAN[k].tanit.sozler.map((s) => s.soz)]);
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
    void kavramDersi(k);
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
