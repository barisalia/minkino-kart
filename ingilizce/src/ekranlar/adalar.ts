/**
 * Dersler: üniteler denizde adalar olarak durur. Çocuk dersleri bitirdikçe adaya o ünitenin sakinleri gelir
 * (çizilmiş parçalar: ada/<unite>-…), ada canlanır. Adaya dokununca ünitenin üç seviyesi açılır: 1 Kelimeler,
 * 2 Cümleler, 3 Konuşma; her seviyede üç ders. Bir seviye, altındaki bitince açılır.
 * Çizimi ve sesi tamamlanmamış ünitenin adası boş durur ve açılmaz (yarım ünite hiç görünmez).
 */
import { erisimVarMi, kilitGoster } from '../../../src/abonelik/kilit';
import { h } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { UNITELER, dersKimligi, kelimeBul, seviyeDersleri, yeniKelimeler, type DersNo, type Kelime, type Seviye, type Unite } from '../icerik';
import { SEVIYE_ADI, dersAdi, dersIfadeleri, ilerisi } from '../icerik2';
import { gorselCiz } from '../gorsel';
import { dersBittiMi, oku, siradakiDers, toplamYildiz, type Kayit } from '../ilerleme';
import { cizim, dugme, kelimeResmi, simgeDugme, yildizlar } from '../kit';
import { konus, tik } from '../ses';
import { acikKelimeler, adaParcalari, adaResmi, dersHazir, gorselEksikleri, kelimeAcik, kelimeResmiAdresi, uniteHazir } from '../varlik';
import type { Gezinme } from './ders';

/** Bir sayfadaki ada sayısı: tablette iki sıra (6); basık ekranda (yatay telefon) tek sıra (3), yoksa alt sıra üst sıranın etiketlerini örtüyor */
const sayfaBoyu = (kok: HTMLElement): number => (kok.clientWidth / Math.max(1, kok.clientHeight) >= 1.7 ? 3 : 6);
const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const erisimKimligi = (u: Unite) => `ingilizce/unite-${String(u.no).padStart(2, '0')}`;

/** Çizimin dolu bölgesinin merkezi ve tabanı (dönme, zıplama bu noktadan olsun diye) */
function eksenBul(img: HTMLImageElement) {
  const olc = () => {
    try {
      const c = document.createElement('canvas'), n = 64;
      c.width = c.height = n;
      const g = c.getContext('2d', { willReadFrequently: true });
      if (!g) return;
      g.drawImage(img, 0, 0, n, n);
      const d = g.getImageData(0, 0, n, n).data;
      let x0 = n, x1 = 0, y0 = n, y1 = 0;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (d[(y * n + x) * 4 + 3] > 40) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      if (x1 < x0) return;
      img.style.setProperty('--ex', `${(((x0 + x1 + 1) / 2 / n) * 100).toFixed(1)}%`);
      img.style.setProperty('--ey', `${(((y0 + y1 + 1) / 2 / n) * 100).toFixed(1)}%`);
      img.style.setProperty('--et', `${(((y1 + 1) / n) * 100).toFixed(1)}%`);
    } catch { /* ölçülemezse tuval ortası kalır */ }
  };
  if (img.complete && img.naturalWidth) olc(); else img.addEventListener('load', olc, { once: true });
}

/**
 * Adanın canlı sahnesi. `biten` (0–3): bitmiş ders sayısı; sakinler ders bittikçe gelir (0'da yalnız dekor).
 * İki kareli sakinler (ad-0 / ad-1) arada bir kare değiştirir; tek parçalar adlarına göre kodla hareket eder.
 */
export function adaSahnesi(uniteId: string, biten: number): HTMLElement | null {
  const parcalar = adaParcalari(uniteId);
  const set = parcalar.find((p) => p.ad === 'set');
  if (!set) return adaKelimeleri(uniteId, biten);
  const kap = h('span.ing-ada-sahne', { 'aria-hidden': 'true' }, h('img.ing-ada-set', { src: set.adres, alt: '', draggable: 'false' }));
  const gruplar = new Map<string, string[]>();
  for (const p of parcalar) {
    if (p.ad === 'set') continue;
    const m = /^(.*)-(\d)$/.exec(p.ad);
    const ad = m ? m[1] : p.ad;
    gruplar.set(ad, [...(gruplar.get(ad) ?? []), p.adres]);
  }
  // önce karakterler (iki kareli sakinler), sonra küçük parçalar gelir: fırça damlası Kino'dan önce görünmesin
  const sakinler = [...gruplar.entries()].sort((a, b) => Number(b[1].length > 1) - Number(a[1].length > 1));
  const gorunen = Math.ceil((sakinler.length * Math.min(3, biten)) / 3);
  sakinler.slice(0, gorunen).forEach(([ad, kareler], sira) => {
    const img = h('img', { src: kareler[0], alt: '', draggable: 'false' });
    img.className = `ing-ada-sakin ing-p-${ad}${kareler.length > 1 ? ' ing-kareli' : ''}`;
    img.style.setProperty('--sira', String(sira));
    eksenBul(img);
    kap.append(img);
    if (kareler.length > 1 && !azHareket()) {
      kareler.forEach((src) => { new Image().src = src; });
      let i = 0;
      const don = () => {
        if (!img.isConnected) return;
        i = (i + 1) % kareler.length;
        img.src = kareler[i];
        // ikinci karede kısa, ilk karede uzun durur: canlı ama telaşsız
        window.setTimeout(don, i ? 380 + Math.random() * 240 : 1100 + Math.random() * 1300);
      };
      window.setTimeout(don, 500 + Math.random() * 1500);
    }
  });
  return kap;
}

/**
 * Sahnesi henüz çizilmemiş adada ünitenin kelime resimleri durur: başta bir tane, her biten dersle biri daha gelir
 * (en çok üç). Çizimler Astra'nın kelime resimleridir; burada yalnız adanın üstüne dizilir.
 */
function adaKelimeleri(uniteId: string, biten: number): HTMLElement | null {
  const unite = UNITELER.find((u) => u.id === uniteId);
  if (!unite) return null;
  const secilen = [unite.kelimeler[0], unite.kelimeler[3], unite.kelimeler[1]].slice(0, Math.max(1, Math.min(3, biten)));
  const kap = h('span.ing-ada-kelimeler', { 'aria-hidden': 'true', 'data-adet': secilen.length });
  secilen.forEach((w, i) => { const r = kelimeResmi(w); r.style.setProperty('--sira', String(i)); kap.append(r); });
  return kap;
}

const SEVIYELER: readonly Seviye[] = [1, 2, 3];
const seviyedeBiten = (k: Kayit, u: Unite, s: Seviye) => seviyeDersleri(s).filter((no) => dersBittiMi(k, dersKimligi(u, no))).length;
/** Seviye 1'de bitmiş ders sayısı (adanın sakinleri kelime dersleri bittikçe gelir) */
const bitenDersSayisi = (k: Kayit, u: Unite) => seviyedeBiten(k, u, 1);
const seviyeBitti = (k: Kayit, u: Unite, s: Seviye) => seviyedeBiten(k, u, s) === 3;
const seviyeHazir = (u: Unite, s: Seviye) => seviyeDersleri(s).some((no) => dersHazir(u, no));
/** Çocuğun bu adada üzerinde olduğu seviye: bitmemiş, açılmış ve hazır ilk seviye (hepsi bittiyse sonuncu hazır seviye) */
function etkinSeviye(k: Kayit, u: Unite): Seviye {
  for (const s of SEVIYELER) {
    if (!seviyeHazir(u, s)) break;
    if (!seviyeBitti(k, u, s)) return s;
  }
  return [...SEVIYELER].reverse().find((s) => seviyeHazir(u, s) && (s === 1 || seviyeBitti(k, u, (s - 1) as Seviye))) ?? 1;
}

export function adalarEkrani(kok: HTMLElement, git: Gezinme, acikUnite?: string): () => void {
  const kayit = oku();
  let sayfa = 0;
  const SAYFA_BOYU = sayfaBoyu(kok);
  const ust = h('header.ing-ust', {},
    simgeDugme('geri', 'Ana ekrana dön', () => git.ana(), 'ing-geri'),
    h('div.ing-ust-orta', {}, h('h1.ing-baslik', {}, 'Dersler')),
    h('div.ing-ust-sag', {}, h('div.ing-sayac', { 'aria-label': `${toplamYildiz(kayit)} yıldız` }, cizim('ui/yildiz'), h('strong', {}, String(toplamYildiz(kayit))))),
  );
  const deniz = adaResmi('kasaba-deniz');
  const harita = h('section.ing-adalar');
  if (deniz) harita.style.backgroundImage = `url("${deniz}")`;
  const izgara = h('div.ing-ada-izgara');
  const onceki = simgeDugme('geri', 'Önceki adalar', () => { sayfa--; ciz(); }, 'ing-sayfa-ok ing-sayfa-geri');
  const sonraki = simgeDugme('geri', 'Sonraki adalar', () => { sayfa++; ciz(); }, 'ing-sayfa-ok ing-sayfa-ileri');
  const panelYeri = h('div.ing-panel-yeri');
  harita.append(izgara, onceki, sonraki, panelYeri);
  kok.append(ust, harita);

  const siradakiUnite = siradakiDers(kayit, (d) => dersHazir(d.unite, d.no))?.unite;

  // yarım üniteler haritayı doldurmasın: hazır adalar ve sıradaki tek "yakında" adası görünür
  const ilkBekleyen = UNITELER.find((u) => !uniteHazir(u));
  const gorunen = UNITELER.filter((u) => uniteHazir(u) || u === ilkBekleyen);

  function ciz() {
    const sayfaSayisi = Math.ceil(gorunen.length / SAYFA_BOYU);
    sayfa = Math.max(0, Math.min(sayfaSayisi - 1, sayfa));
    onceki.hidden = sayfa === 0;
    sonraki.hidden = sayfa >= sayfaSayisi - 1;
    const sayfadakiler = gorunen.slice(sayfa * SAYFA_BOYU, (sayfa + 1) * SAYFA_BOYU);
    izgara.dataset.sira = sayfadakiler.length <= 3 ? '1' : '2';
    izgara.replaceChildren(...sayfadakiler.map((u, i) => {
      const hazir = uniteHazir(u);
      const biten = bitenDersSayisi(kayit, u);
      const zemin = adaResmi('kasaba-ada');
      const d = dugme('ing-ada', `${u.tr}${hazir ? '' : ', yakında'}`, () => adayaDokun(u, d));
      d.dataset.unite = u.id;
      d.style.setProperty('--i', String(i));
      d.style.setProperty('--renk', u.renk);
      if (zemin) d.append(h('img.ing-ada-zemin', { src: zemin, alt: '', draggable: 'false' }));
      const sahne = hazir ? adaSahnesi(u.id, biten) : null;
      if (sahne) d.append(sahne);
      // etiketteki yıldızlar çocuğun o adadaki seviyesinin derslerini sayar; ikinci ve üçüncü seviyede rozet görünür
      const seviye = hazir ? etkinSeviye(kayit, u) : 1;
      const rozet = seviye > 1 ? h('b.ing-ada-seviye', { 'aria-label': `${seviye}. seviye` }, String(seviye)) : null;
      d.append(h('span.ing-ada-etiket', {}, rozet, h('strong', { lang: 'en-US' }, u.en), h('small', {}, hazir ? u.tr : 'Yakında'), hazir ? yildizlar(seviyedeBiten(kayit, u, seviye), 3, 'ing-ada-yildiz') : null));
      if (!hazir) d.classList.add('ing-bekliyor');
      if (u === siradakiUnite) d.classList.add('ing-sirada');
      if (u.en.length > 9) d.classList.add('ing-uzun-ad');
      if (hazir) kilitGoster(d, erisimKimligi(u));
      return d;
    }));
  }

  function adayaDokun(u: Unite, d: HTMLElement) {
    if (!uniteHazir(u)) { d.classList.remove('ing-salla'); void d.offsetWidth; d.classList.add('ing-salla'); tik.dokun(); return; }
    tik.sec();
    if (!erisimVarMi(erisimKimligi(u), document.body)) return;
    paneliAc(u);
  }

  function paneliAc(u: Unite, secili?: Seviye) {
    const k = oku();
    const biten = bitenDersSayisi(k, u);
    const kapat = () => { panelYeri.replaceChildren(); panelYeri.classList.remove('ing-acik'); };
    const seviyeAcik = (s: Seviye) => s === 1 || seviyeBitti(k, u, (s - 1) as Seviye);
    const seviye = secili ?? etkinSeviye(k, u);

    // seviye sekmeleri: 1 Kelimeler · 2 Cümleler · 3 Konuşma
    const sekmeler = h('div.ing-seviyeler', { role: 'tablist', 'aria-label': 'Seviyeler' });
    for (const s of SEVIYELER) {
      const hazir = seviyeHazir(u, s), acik = seviyeAcik(s);
      const durum = !hazir ? 'Yakında' : seviyeBitti(k, u, s) ? 'Tamam' : SEVIYE_ADI[s];
      const b = dugme('ing-seviye', `${s}. seviye, ${SEVIYE_ADI[s]}`, () => { tik.dokun(); paneliAc(u, s); },
        h('b', {}, String(s)), h('span', {}, h('strong', {}, SEVIYE_ADI[s]), h('small', {}, durum === SEVIYE_ADI[s] ? `${seviyedeBiten(k, u, s)} / 3 ders` : durum)));
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(s === seviye));
      b.dataset.seviye = String(s);
      if (!hazir || !acik) { b.disabled = true; if (hazir) b.append(h('span.ing-ders-kilit', { 'aria-hidden': 'true', html: IKON.kilit })); }
      if (seviyeBitti(k, u, s)) b.classList.add('ing-tam');
      sekmeler.append(b);
    }

    const dersler = h('div.ing-ders-secimi');
    seviyeDersleri(seviye).forEach((no, i) => {
      const id = dersKimligi(u, no);
      const acik = dersHazir(u, no) && seviyeAcik(seviye) && (i === 0 || dersBittiMi(k, dersKimligi(u, (no - 1) as DersNo)));
      const yildiz = k.dersler[id] ?? 0;
      const resimler = h('span.ing-ders-resimler');
      if (no < 3) {
        // Çiftlik'in hayvan derslerinde dersin kendi hayvanlarından dördü (12 · 30 · 100 hayvan)
        const hayvanResmi = u.id === 'ciftlik' ? [['cow', 'duck', 'rabbit', 'goat'], ['lion', 'tiger', 'zebra', 'panda'], ['dolphin', 'owl', 'ladybug', 'fox']][no] : undefined;
        const gosterilecek = hayvanResmi ? hayvanResmi.map((x) => kelimeBul(x)).filter((w): w is Kelime => !!w && !!kelimeResmiAdresi(w))
          : no === 2 ? acikKelimeler(u).filter((_, n) => n % 2 === 0) : yeniKelimeler(u, no).filter(kelimeAcik);
        gosterilecek.forEach((w) => resimler.append(kelimeResmi(w)));
      } else {
        // üst seviye dersinde dersin cümlelerinden iki resim (çizimi gelmemişse ünitenin kelimeleri)
        const cizilebilen = dersIfadeleri(u, no).filter((f) => !f.g.ozel?.startsWith('ui/') && gorselEksikleri(f.g).length === 0);
        if (cizilebilen.length >= 2) [cizilebilen[0], cizilebilen[cizilebilen.length - 1]].forEach((f) => resimler.append(gorselCiz(f.g)));
        else acikKelimeler(u).slice(0, 3).forEach((w) => resimler.append(kelimeResmi(w)));
        resimler.classList.add('ing-ders-cumle-resimleri');
      }
      // 2. seviyenin iki kalıp dersi kendi kalıbının adıyla görünür ("Big · Small", "And")
      const kalipAdi = no === 3 ? ilerisi(u)?.a.ad : no === 4 ? ilerisi(u)?.b.ad : undefined;
      const etiket = kalipAdi ? h('small', { lang: 'en-US' }, kalipAdi) : h('small', {}, dersAdi(u.id, no));
      if ((kalipAdi ?? '').length > 14) etiket.classList.add('ing-uzun');
      const b = dugme('ing-ders-dugme', `${no + 1}. ders, ${dersAdi(u.id, no)}`, () => { tik.sec(); git.ders({ tur: 'ders', uniteId: u.id, no }); },
        h('b.ing-ders-no', {}, String(i + 1)), resimler, h('span.ing-ders-bilgi', {}, etiket, yildizlar(yildiz, 3, 'ing-ders-yildiz')));
      b.dataset.ders = String(no + 1);
      if (!acik) { b.disabled = true; b.append(h('span.ing-ders-kilit', { 'aria-hidden': 'true', html: IKON.kilit })); }
      if (acik && !yildiz) b.classList.add('ing-sirada');
      dersler.append(b);
    });
    const sahne = adaSahnesi(u.id, biten);
    const zemin = adaResmi('kasaba-ada');
    const adaKutusu = h('div.ing-panel-ada', {}, zemin ? h('img.ing-ada-zemin', { src: zemin, alt: '' }) : null, sahne);
    const panel = h('div.ing-unite-paneli', { role: 'dialog', 'aria-label': u.tr },
      simgeDugme('kapat', 'Kapat', kapat, 'ing-panel-kapat'),
      adaKutusu,
      h('div.ing-panel-sag', {}, h('h2', {}, h('span', { lang: 'en-US' }, u.en), h('small', {}, u.tr)), sekmeler, dersler),
    );
    panel.style.setProperty('--renk', u.renk);
    panelYeri.replaceChildren(panel);
    panelYeri.classList.add('ing-acik');
    panelYeri.onclick = (e) => { if (e.target === panelYeri) kapat(); };
    // ünite girişi panel ilk açıldığında söylenir; seviye sekmesi değişince yinelenmez
    if (secili === undefined) void konus(`tr/u-${u.id}`);
  }

  if (acikUnite) sayfa = Math.floor(Math.max(0, gorunen.findIndex((u) => u.id === acikUnite)) / SAYFA_BOYU);
  else if (siradakiUnite) sayfa = Math.floor(Math.max(0, gorunen.indexOf(siradakiUnite)) / SAYFA_BOYU);
  ciz();
  return () => {};
}
