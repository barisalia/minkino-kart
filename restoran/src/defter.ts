/**
 * Babaanne'nin Defteri (gün sonu mağazası, §6b): kalın, kumaş kaplı tarif defteri. Dört sekme (tarif, masa, süs,
 * bahçe), her sekmede büyük resimli kartlar. Kartta yazı yok: fiyat altında jeton resimleri (3-4: tek tek; 5-6: beşlik
 * büyük jeton + tekler). Kasa sol üstte, jeton yığını görünür (rakam yok).
 *
 * - Karta dokununca Mino adını söyler; para yetiyorsa jetonlar kasadan karta şelale gibi akar (sayılmaz), kart
 *   "alındı" olur. Masa ve süs için defter kenara çekilir, çocuk lokantadaki boş yuvalardan birini seçer.
 * - Para yetmiyorsa kart hafifçe sallanır, kasa titrer: "Biraz daha biriktirelim." (ceza yok)
 * - Hiçbir kart alınamıyorsa Babaanne bir avuç jeton atar: "Benden de kuzum!" (ekonomi.ts → babaanneHediyesi).
 * - Biriktirmek de seçim: kumbara düğmesi defteri kapatır, para yarına kalır.
 * - Abonelik: Gün 1-2 ücretsiz; ilk yeni tariften sonrakiler 'restoran/tarif' (abonelik) ister.
 */
import { erisimVarMi } from '../../src/abonelik/kilit';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import defterJson from '../../content/restoran/defter.json';
import {
  alinabilirMi,
  babaanneHediyesi,
  defterKartlari,
  fiyat,
  fiyatJetonlari,
  satinAl,
  SEKMELER,
  type AlimSonucu,
  type DefterKalemi,
  type EkonomiDurumu,
  type Sekme,
} from './ekonomi';
import { babaanneSoyle } from './lokanta/babaanne';
import { yemekResmi } from './lokanta/istek-gorsel';
import { Kisi } from './lokanta/kisi';
import { kumbaraResmi, susResmi } from './lokanta/yerlesim';
import { gramofonCizim } from './lokanta/surpriz';
import type { Yas } from './mini/arayuz';
import { ILK_TARIFLER, L } from './model';
import { salonSes, sesler } from './sesler';
import { varlik, yeniden } from './varliklar';

const D = defterJson;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));
const AD = D.ad as Record<string, string | Record<string, string>>;

export interface DefterSecenek {
  yas: Yas;
  /** bugün (1'den) */
  gun: number;
  durum: EkonomiDurumu;
  oynanabilir: (tarif: string) => boolean;
  /** Mino'nun sözü (anlatıcı) */
  soyle: (metin: string) => Promise<void>;
  /** uygulama kökü (abonelik kilidi ekranı) */
  kok: HTMLElement;
  /** alım: kayıt yazılır; masa / süs ise çocuk yuvasını seçer (defter o sırada gizlenir) */
  alindi: (k: DefterKalemi, s: AlimSonucu) => Promise<void>;
  /** jeton değişti (kasa çizimi) */
  kasaDegisti: () => void;
  /** kumbara ya da güneş: yarın */
  kapandi: (alinan: number) => void;
  /** P8: gün içinde HUD'dan bakma: alım yok (akşam alınır), kumbara / güneş yok, kapat düğmesi; karta dokununca ad + aksamSozu */
  bak?: boolean;
  aksamSozu?: string;
}

/** Kartın resmi */
function kalemResmi(k: DefterKalemi): HTMLElement {
  if (k.sekme === 'tarif') {
    const alet = k.alet ? varlik(`alet/${k.alet}`) : null;
    return h('span.rs-df-resim', {}, yemekResmi(k.id), alet ? h('img.rs-df-alet', { src: alet, alt: '', draggable: 'false' }) : null);
  }
  if (k.sekme === 'masa') {
    const u = varlik('sus/masa');
    return h('span.rs-df-resim', {}, u ? h('img', { src: u, alt: '', draggable: 'false' }) : h('span.rs-df-masa', {}, h('i'), h('b')));
  }
  if (k.sekme === 'bolum') {
    const u = varlik('arka/bahce-yatay');
    return h('span.rs-df-resim', {}, u ? h('img.rs-df-bahce-resim', { src: u, alt: '', draggable: 'false' }) : h('span.rs-df-bahce', {}, h('i'), h('i'), h('i'), h('b')));
  }
  if (k.yer === 'ortu') return h('span.rs-df-resim', {}, h('span.rs-ortu-ornek.rs-df-ortu', { 'data-ortu': k.id.replace(/^ortu-/, '') }));
  const r = susResmi(k.id);
  return h('span.rs-df-resim', {}, r ? h('img', { src: r.url, alt: '', draggable: 'false', style: `max-height:${r.enCokH.toFixed(0)}px` }) : k.id === 'gramofon' ? gramofonCizim() : h('span.rs-sus-yok'));
}

const jetonUrl = () => varlik('efekt/jeton') ?? yeniden('pasta/jeton-1');
function jetonResmi(bes = false): HTMLElement {
  const u = jetonUrl();
  return h(`span.rs-df-jeton${bes ? '.rs-df-bes' : ''}`, {}, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null, bes ? h('span.rs-df-bes-nokta', {}, ...Array.from({ length: 5 }, () => h('i'))) : null);
}
function fiyatEl(n: number, yas: Yas): HTMLElement {
  const { bes, tek } = fiyatJetonlari(n, yas);
  return h('span.rs-df-fiyat', { 'data-adet': String(n) }, ...Array.from({ length: bes }, () => jetonResmi(true)), ...Array.from({ length: tek }, () => jetonResmi()));
}
/** Sekme simgesi (yazısız) */
function sekmeSimge(s: Sekme): HTMLElement {
  if (s === 'tarif') return h('span.rs-df-simge', {}, yemekResmi('menemen'));
  if (s === 'masa') return h('span.rs-df-simge', {}, h('span.rs-df-masa', {}, h('i'), h('b')));
  if (s === 'sus') {
    const r = susResmi('saksi');
    return h('span.rs-df-simge', {}, r ? h('img', { src: r.url, alt: '', draggable: 'false' }) : null);
  }
  return h('span.rs-df-simge', {}, h('span.rs-df-bahce', {}, h('i'), h('i'), h('i'), h('b')));
}

export function defterAc(kap: HTMLElement, s: DefterSecenek): { el: HTMLElement; gizle(g: boolean): void; kapat(): void } {
  const kasa = h('div.rs-df-kasa', {}, h('span.rs-df-kasa-govde'), h('span.rs-df-kasa-yigin'));
  const kasaResmi = varlik('ui/kasa-acik');
  if (kasaResmi) kasa.prepend(h('img.rs-df-kasa-resim', { src: kasaResmi, alt: '', draggable: 'false' }));
  const sekmeler = h('div.rs-df-sekmeler');
  const sayfa = h('div.rs-df-sayfa');
  const kitapResmi = varlik('ui/defter-acik');
  const kitap = h('div.rs-df-kitap', { 'data-resimli': kitapResmi ? '1' : undefined, style: kitapResmi ? `--rs-df-kitap:url("${kitapResmi}")` : undefined }, h('span.rs-df-sirt'), sayfa);
  const kumbara = h('button.rs-df-kumbara', { type: 'button', 'aria-label': 'Biriktir' });
  const ku = kumbaraResmi();
  if (ku) kumbara.append(h('img', { src: ku, alt: '', draggable: 'false' }));
  const yarin = h('button.rs-gs-yarin.rs-df-yarin', { type: 'button', 'aria-label': 'Yarın' }, h('span.rs-gunes'));
  yarin.hidden = true;
  const kapatD = h('button.rs-df-kapat', { type: 'button', 'aria-label': 'Kapat' });
  kapatD.hidden = !s.bak;
  if (s.bak) kumbara.hidden = true;
  const babaanneYer = h('div.rs-df-babaanne');
  const el = h('div.rs-defter', {}, h('div.rs-df-perde'), kitap, babaanneYer, sekmeler, kasa, kumbara, yarin, kapatD);
  kap.append(el);
  salonSes.gunSonu();

  // Babaanne defterin başında (Seri 2 kuklası; Gemini pozu gelince o)
  const bab = new Kisi('babaanne', 'babaanne');
  bab.el.classList.add('rs-df-babaanne-kisi');
  babaanneYer.append(bab.el);
  bab.yerKoy(50, 100);

  let kapandi = false;
  let alinan = 0;
  let mesgul = false;
  let aktif: Sekme = 'tarif';
  const dokunulan = new Set<string>();

  const kasaCiz = () => {
    const y = kasa.querySelector('.rs-df-kasa-yigin') as HTMLElement;
    const n = Math.min(14, s.durum.jeton);
    const u = jetonUrl();
    y.replaceChildren(...Array.from({ length: n }, (_, i) => h('span.rs-jeton', { style: `--i:${i}` }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null)));
    kasa.dataset.jeton = String(s.durum.jeton);
  };
  const kartlariAl = () => defterKartlari(s.durum, { yas: s.yas, gun: s.gun, oynanabilir: s.oynanabilir });

  const sekmeCiz = () => {
    const k = kartlariAl();
    sekmeler.replaceChildren(
      ...SEKMELER.filter((x) => k[x].length || x === aktif).map((x) => {
        const b = h('button.rs-df-sekme', { type: 'button', 'data-sekme': x, 'aria-label': x, 'aria-pressed': String(x === aktif) }, sekmeSimge(x));
        b.addEventListener('click', () => {
          // sekme değiştirmek alım sırasında da serbest (yalnız kart alımı sıra bekler)
          if (kapandi || x === aktif) return;
          aktif = x;
          sesler.cal('hop', { guc: 0.6 });
          void s.soyle(((AD.sekme as Record<string, string>)[x] ?? ''));
          ciz();
        });
        return b;
      }),
    );
  };
  const sayfaCiz = () => {
    const k = kartlariAl();
    const l = k[aktif];
    sayfa.dataset.sekme = aktif;
    sayfa.dataset.adet = String(l.length);
    sayfa.replaceChildren(
      ...l.map((x) => {
        const yetiyor = alinabilirMi(x, s.durum.jeton, s.yas);
        const kart = h('button.rs-df-kart', { type: 'button', 'data-kalem': x.id, 'data-yetiyor': yetiyor ? '1' : '0', 'aria-label': x.id }, kalemResmi(x), fiyatEl(fiyat(x, s.yas), s.yas));
        kart.addEventListener('click', () => void kartaDokun(x, kart));
        return kart;
      }),
    );
    if (!l.length) sayfa.append(h('span.rs-df-bos'));
  };
  const ciz = () => {
    kasaCiz();
    sekmeCiz();
    sayfaCiz();
  };

  const salla = (e: HTMLElement) => {
    e.classList.remove('rs-kipir');
    void e.offsetWidth;
    e.classList.add('rs-kipir');
    window.setTimeout(() => e.classList.remove('rs-kipir'), 900);
  };

  /** jetonlar kasadan karta akar (sayılmaz) */
  const selale = async (kart: HTMLElement, n: number) => {
    const a = kasa.getBoundingClientRect();
    const b = kart.getBoundingClientRect();
    const kr = el.getBoundingClientRect();
    const u = jetonUrl();
    const adet = Math.min(n, 8);
    const isler: Promise<unknown>[] = [];
    for (let i = 0; i < adet; i++) {
      const j = h('span.rs-ucan-jeton.rs-df-ucan', { style: `left:${a.left - kr.left + a.width * 0.5 - 14}px;top:${a.top - kr.top + a.height * 0.3}px;width:28px;height:28px` }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
      el.append(j);
      const dx = b.left + b.width * (0.3 + 0.4 * Math.random()) - a.left - a.width * 0.5;
      const dy = b.top + b.height * 0.55 - a.top - a.height * 0.3;
      try {
        const an = j.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 50}px)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 0.2 }], { duration: sure(520), delay: sure(i * 70), easing: 'ease-in', fill: 'backwards' });
        isler.push(an.finished.then(() => j.remove(), () => j.remove()));
      } catch {
        j.remove();
      }
      window.setTimeout(() => salonSes.jeton(i), TEST_MODU ? 0 : i * 70 + 380);
    }
    await Promise.all(isler);
  };

  async function kartaDokun(x: DefterKalemi, kart: HTMLElement) {
    if (mesgul || kapandi) return;
    const ad = x.sekme === 'tarif' ? (L.tarif as Record<string, string>)[x.id] : x.sekme === 'masa' ? (AD.masa as string) : ((AD[x.id] as string) ?? '');
    if (s.bak) {
      // gün içinde yalnız bakılır: adı söylenir, alım akşam (müşteri akışı kesilmez)
      kart.classList.remove('rs-hopla');
      void kart.offsetWidth;
      kart.classList.add('rs-hopla');
      void s.soyle(ad).then(() => s.soyle(s.aksamSozu ?? D.mino.yetmedi));
      return;
    }
    if (!alinabilirMi(x, s.durum.jeton, s.yas)) {
      salla(kart);
      salla(kasa);
      sesler.cal('yanlis', { guc: 0.5 });
      if (!dokunulan.has(x.id)) void s.soyle(ad).then(() => s.soyle(D.mino.yetmedi));
      else void s.soyle(D.mino.yetmedi);
      dokunulan.add(x.id);
      return;
    }
    // abonelik: Gün 1-2 ücretsiz ve ilk yeni tarif ücretsiz; sonrası 'restoran/tarif'
    if (x.sekme === 'tarif' && s.durum.acilan.tarif.length > ILK_TARIFLER.length && !erisimVarMi('restoran/tarif', s.kok)) return;
    mesgul = true;
    kart.classList.add('rs-df-secili');
    void s.soyle(ad);
    const f = fiyat(x, s.yas);
    const sonuc = satinAl(s.durum, x, s.yas);
    if (!sonuc.ok) {
      mesgul = false;
      kart.classList.remove('rs-df-secili');
      return;
    }
    kasaCiz();
    s.kasaDegisti();
    await selale(kart, f);
    if (kapandi) return;
    sesler.cal('cin');
    kart.classList.add('rs-df-alindi');
    alinan++;
    bab.poz('alkis');
    void bab.oynat('sevin', 900);
    await babaanneSoyle(bab, D.babaanne.aldi);
    if (kapandi) return;
    await s.alindi(x, sonuc);
    if (kapandi) return;
    mesgul = false;
    kumbara.hidden = true;
    yarin.hidden = false;
    yarin.classList.remove('rs-hopla');
    void yarin.offsetWidth;
    yarin.classList.add('rs-hopla');
    // sekmede kart kalmadıysa dolu bir sekmeye geç
    const k = kartlariAl();
    if (!k[aktif].length) aktif = SEKMELER.find((z) => k[z].length) ?? aktif;
    ciz();
  }

  kumbara.addEventListener('click', async () => {
    if (mesgul || kapandi) return;
    mesgul = true;
    sesler.cal('cin');
    kumbara.classList.add('rs-hopla');
    void s.soyle(D.mino.kumbara);
    await babaanneSoyle(bab, D.babaanne.biriktir);
    bitir();
  });
  kapatD.addEventListener('click', () => {
    if (kapandi) return;
    sesler.cal('hop');
    bitir();
  });
  yarin.addEventListener('click', () => {
    if (mesgul || kapandi) return;
    sesler.cal('hop');
    bitir();
  });
  const bitir = () => {
    if (kapandi) return;
    kapandi = true;
    bab.kapat();
    s.kapandi(alinan);
  };

  // açılış: hediyesi gerekiyorsa Babaanne atar; en uygun sekme
  // açılış: kasa hiçbir karta yetmiyorsa Babaanne hemen bir avuç atar (alım beklemez); sonra sözler
  const k0 = kartlariAl();
  const hediye = s.bak ? 0 : babaanneHediyesi(s.durum, k0, s.yas);
  if (hediye > 0) {
    s.durum.jeton += hediye;
    s.kasaDegisti();
  }
  aktif = SEKMELER.find((x) => k0[x].some((y) => alinabilirMi(y, s.durum.jeton, s.yas))) ?? SEKMELER.find((x) => k0[x].length) ?? 'sus';
  ciz();
  void (async () => {
    await bab.hazir;
    if (hediye > 0 && !kapandi) {
      bab.poz('gul');
      void bab.oynat('hop', 420);
      salla(kasa);
      for (let i = 0; i < Math.min(hediye, 8); i++) {
        salonSes.jeton(i);
        await bekle(90);
      }
      await Promise.all([s.soyle(D.mino.defter), babaanneSoyle(bab, D.babaanne.hediye)]);
    } else await Promise.all([s.soyle(D.mino.defter), babaanneSoyle(bab, D.babaanne.defter)]);
  })();

  return {
    el,
    gizle(g: boolean) {
      el.classList.toggle('rs-df-gizli', g);
    },
    kapat() {
      kapandi = true;
      bab.kapat();
      el.remove();
    },
  };
}
