/**
 * MANGAL (bahçe) · köfte, közlenmiş biber ve domates. ekip/senaryo/RESTORAN.md §8 M9, §3c, §4c, §9.
 *
 * Rafta tepsiden gelen çiğ köfte sinisi (Yoğur ve Yuvarla), biber, domates. Hepsi gerçek seçim.
 *   - Izgaraya diz (bırak ya da dokun): cızzz, duman tüter.
 *   - Köfteye dokun: maşa gelir, "tık tık" çevirir; alttaki yüzde ızgara izleri. Alttaki yüz kızardıkça köftenin
 *     kenarı halka halka renk alır (dolaylı işaret). 3-4: bir çevirme iki yüzü birlikte pişirir; 5-6: iki yüz ayrı.
 *   - 5-6: köfteyi ızgarada başka yere taşı: aynı yüze ikinci iz dik gelir → ÇAPRAZ iz, yıldız parlar.
 *   - Hasır yelpaze: mangalın üstünde sağa sola salla → köz canlanır, alev yükselir, kıvılcım, pişme hızlanır.
 *     ÇOK yelpazelersen duman bulutu kalkar, kenardan bakan Kino'nun yüzünü kaplar: öksürür, yüzü is olur (lokantada da
 *     isli yüzle servis eder: surprizBildir 'kino-isli'). Köfte yine en çok "çıtır" olur, yanmaz.
 *   - Ödül: bütün köfteler altın olunca ızgaranın üstünde çizgi film duman kalpleri; tepside köfteler tabağa dizilir.
 * Mangal kendi pişirir: geri çıkılınca arkaPlanda cızırdamaya devam eder.
 */
import { konus, konusuyorMu } from '../../../../src/audio/ses';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-mangal.json';
import { MALZEME_ADI, urunId, type ArkaIs, type Malzeme, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun, type YemekOzelligi } from '../arayuz';
import { ezil, hopla, kipirda, parilti, sac, TITRESIM, ucur } from '../dogra/efekt';
import { surukle } from '../dogra/surukle';
import { Elde, merkez, olayci, rafOge, rafYerlestir, YUKARI, type RafOge } from '../kir-cirp/ortak';
import { bakanKur } from '../yika/ortak';
import { kofteEl, siniGorsel } from '../yogur';
import type { Topak } from '../yogur/mantik';
import { p6Ses, surprizBildir } from '../yogur/ortak';
import { ATES_TABAN, atesSon, cevir, hazir as hazirMi, parcaPisme, pismeAdi, pisir, tasi, toplamPisme, ustYuz, yelpazele, yeniParca, type MangalParca, type MangalTur } from './mantik';
import './mangal.css';

const M = metin.mino;
const K = metin.kino;

type KofteBicim = { sekil: Topak['sekil']; boy: number; benek: [string, number, number][] };
type RafTur = 'sini' | 'biber' | 'domates';

export const oyun: MiniOyun = {
  ad: 'mangal',
  istasyon: 'mangal',
  simge: () => h('span.rs-mg-simge', {}, h('i.rs-mg-simge-izgara')),
  baslat: (b, g) => mangalBaslat(b, g),
};

interface Izgarada {
  p: MangalParca;
  el: HTMLElement;
  yuva: number;
  bicim: KofteBicim | null;
  /** her yüzün ilk iz yönü */
  ilkYon: [0 | 1, 0 | 1];
  /** sinisinden gelen çiğ köfte ürünü (özellik taşınır) */
  kaynak?: string;
}
interface MangalKayit {
  parcalar: { p: MangalParca; yuva: number; bicim: KofteBicim | null; ilkYon: [0 | 1, 0 | 1]; kaynak?: string }[];
  ates: number;
  kullanilan: string[];
  ozellik: YemekOzelligi['malzemeler'];
  tuz: number;
  aci: number;
  porsiyon?: 'az' | 'normal' | 'kocaman';
  isli: boolean;
  t: number;
}

/** Izgara köftesi (tepside, masada): tabakta köfteler (+ közlenmiş sebze) — kutusunu doldurur */
export function izgaraGorsel(parcalar: { tur: MangalTur; bicim: KofteBicim | null; pisme: string; iz: number }[], tabaksiz = false): HTMLElement {
  const el = h(tabaksiz ? 'span.rs-mg-tabak-gorsel.rs-mg-tabaksiz' : 'span.rs-mg-tabak-gorsel');
  const n = Math.max(1, parcalar.length);
  const sutun = Math.min(3, n);
  const satir = Math.ceil(n / sutun);
  parcalar.forEach((pa, i) => {
    const c = i % sutun;
    const r = Math.floor(i / sutun);
    const w = tabaksiz ? Math.min(48, 96 / sutun) : Math.min(36, 74 / sutun);
    const e = pa.tur === 'kofte' && pa.bicim ? kofteEl(pa.bicim.sekil === 'putur' ? 'yassi' : pa.bicim.sekil, pa.bicim.benek, pa.pisme) : h('i.rs-mg-sebze', { 'data-tur': pa.tur, style: `--kabarma:${pa.pisme === 'cig' ? 0 : pa.pisme === 'az' ? 0.4 : 0.85}` });
    const kap = h('span.rs-mg-tabak-parca', { 'data-iz': String(pa.iz) }, e, h('i.rs-mg-iz', { 'data-yon': '0' }));
    kap.style.cssText = `width:${w}%;left:${(100 / (sutun + 1)) * (c + 1) - w / 2}%;top:${(100 / (satir + 1)) * (r + 1)}%`;
    el.append(kap);
  });
  return el;
}

function mangalBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const kok = h('div.rs-p5-oyun.rs-mangal', { 'data-yas': yas });
  const { olaylar, olay } = olayci(kok);
  const onceki = g.devam as MangalKayit | undefined;
  let ates = onceki ? Math.max(ATES_TABAN, onceki.ates) : ATES_TABAN;
  const kullanilan: string[] = onceki ? onceki.kullanilan.slice() : [];
  const tasinan: YemekOzelligi['malzemeler'] = onceki ? { ...onceki.ozellik } : {};
  let tuz = onceki?.tuz ?? 0;
  let aci = onceki?.aci ?? 0;
  let porsiyonCig: 'az' | 'normal' | 'kocaman' | undefined = onceki?.porsiyon;
  let isli = onceki?.isli ?? false;
  let kapandi = false;
  const zamanlar: number[] = [];
  const zaman = (f: () => void, ms: number) => zamanlar.push(window.setTimeout(f, TEST_MODU ? Math.min(ms, 30) : ms));

  // ------------------------------------------------------------ DOM
  const raf = h('div.rs-p5-raf');
  const mangal = h('div.rs-mg-mangal');
  const komur = h('div.rs-mg-komur');
  const alevler = h('div.rs-mg-alevler', {}, ...Array.from({ length: 9 }, (_, i) => h('i.rs-mg-alev', { style: `--i:${i}` })));
  const izgara = h('div.rs-mg-izgara');
  mangal.append(h('i.rs-mg-kasa'), komur, alevler, izgara);
  const parcaKat = h('div.rs-mg-parcalar');
  const masa_ = h('div.rs-mg-masa', { role: 'button', 'aria-label': 'Maşa' }, h('i.rs-mg-masa-kol.rs-sol'), h('i.rs-mg-masa-kol.rs-sag'));
  const yelpaze = h('div.rs-mg-yelpaze', { role: 'button', 'aria-label': 'Yelpaze' }, h('i.rs-mg-yelpaze-yaprak'), h('i.rs-mg-yelpaze-sap'));
  const efektKat = h('div.rs-mg-efekt');
  const eldeKat = h('div.rs-mg-elde-kat');
  kok.append(mangal, parcaKat, raf, masa_, yelpaze, efektKat, eldeKat);
  b.kok.append(kok);
  const elde = new Elde(eldeKat, kok);
  const kino = bakanKur(kok, 'kino');

  // raf: tepsideki çiğ köfte sinileri (Yoğur ve Yuvarla), biber, domates; deneme sayfasında örnek sini
  type Sini = { id: string; kofteler: KofteBicim[]; ozellik: YemekOzelligi; ornek?: boolean };
  const siniler: Sini[] = g.tepsi
    .filter((u) => u.tur === 'kofte-cig' && !kullanilan.includes(u.id))
    .map((u) => ({ id: u.id, ozellik: u.ozellik, kofteler: ((u as Urun & { kofteler?: KofteBicim[] }).kofteler ?? Array.from({ length: u.ozellik.malzemeler.kofte?.adet ?? 2 }, () => ({ sekil: 'yassi' as const, boy: 1, benek: [] }))) }));
  if (!siniler.length && !onceki && !g.tepsi.length && (g.tarif === 'kofte' || !g.tarif)) {
    const benek: [string, number, number][] = [
      ['#FFF4E2', 40, 38],
      ['#3C9A3A', 60, 52],
      ['#FFF4E2', 52, 66],
      ['#3C9A3A', 34, 60],
    ];
    siniler.push({ id: 'ornek', ornek: true, ozellik: { malzemeler: { kofte: { adet: 3 }, sogan: { adet: 1, kesim: 'kiyim' }, maydanoz: { adet: 1, kesim: 'kiyim' } } }, kofteler: [0, 1, 2].map(() => ({ sekil: 'yassi' as const, boy: 1, benek })) });
  }
  const rafOgeleri: (RafOge<RafTur> & { sini?: Sini })[] = [];
  for (const s of siniler) {
    rafOge(raf, rafOgeleri, 'sini', siniGorsel(s.kofteler), 'Köfte');
    rafOgeleri[rafOgeleri.length - 1].sini = s;
  }
  const sebzeler: MangalTur[] = (['biber', 'domates'] as const).filter((m) => g.malzemeler.includes(m) || !g.tarif || g.tarif === 'kofte');
  for (const m of sebzeler) rafOge(raf, rafOgeleri, m as RafTur, h('i.rs-mg-sebze', { 'data-tur': m }), MALZEME_ADI[m as Malzeme]);

  // ------------------------------------------------------------ yerleşim
  let mr = { x: 0, y: 0, w: 0, h: 0 };
  let yuvalar: { x: number; y: number }[] = [];
  let taban = 70;
  let masaYer = { x: 0, y: 0 };
  let yelpazeYer = { x: 0, y: 0 };
  let masaTutuluyor = false;
  let yelpazeTutuluyor = false;
  function yerlestir() {
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const rafAlt = rafYerlestir(kok, raf, yatay);
    if (yatay) {
      const x0 = Math.max(118, W * 0.15);
      const sag = Math.max(150, W * 0.18);
      mr = { x: x0, y: rafAlt + 8, w: W - x0 - sag, h: H - rafAlt - 22 };
      // yelpaze sağ üstte (rafın yanı), maşa sağ sütunun ortasında (tepsi düğmesinin üstü)
      yelpazeYer = { x: W - 66, y: 64 };
      masaYer = { x: W - sag / 2 - 4, y: Math.max(rafAlt + 6, rafAlt + (H - rafAlt - 112) / 2 - 56) };
    } else {
      mr = { x: 14, y: rafAlt + 10, w: W - 28, h: Math.min(W * 1.05, (H - rafAlt) * 0.52) };
      const alt = mr.y + mr.h + 16;
      masaYer = { x: W * 0.3, y: alt + 56 };
      yelpazeYer = { x: W * 0.7, y: alt + 56 };
    }
    const sutun = 3;
    const satir = 2;
    const yw = (mr.w * 0.86) / sutun;
    const yh = (mr.h * 0.8) / satir;
    taban = Math.max(56, Math.min(92, Math.min(yw, yh) * 0.74));
    yuvalar = [];
    for (let r = 0; r < satir; r++) for (let c = 0; c < sutun; c++) yuvalar.push({ x: mr.x + mr.w * 0.07 + yw * (c + 0.5), y: mr.y + mr.h * 0.1 + yh * (r + 0.5) });
    mangal.style.cssText = `left:${mr.x}px;top:${mr.y}px;width:${mr.w}px;height:${mr.h}px`;
    if (!masaTutuluyor) masaKoy(masaYer.x, masaYer.y);
    if (!yelpazeTutuluyor) yelpazeKoy(yelpazeYer.x, yelpazeYer.y);
    for (const z of izgaradakiler) yerKoy(z);
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);
  const masaKoy = (x: number, y: number) => (masa_.style.transform = `translate(${x}px,${y}px)`);
  const yelpazeKoy = (x: number, y: number) => (yelpaze.style.transform = `translate(${x}px,${y}px)`);
  const mangalda = (x: number, y: number, pay = 0) => x > mr.x - pay && x < mr.x + mr.w + pay && y > mr.y - pay && y < mr.y + mr.h + pay;

  // ------------------------------------------------------------ ızgaradakiler
  const izgaradakiler: Izgarada[] = [];
  const bosYuva = () => {
    const dolu = new Set(izgaradakiler.map((z) => z.yuva));
    return yuvalar.findIndex((_, i) => !dolu.has(i));
  };
  const enYakinBos = (x: number, y: number, haric?: Izgarada) => {
    const dolu = new Set(izgaradakiler.filter((z) => z !== haric).map((z) => z.yuva));
    let en = Infinity;
    let i = -1;
    yuvalar.forEach((yv, k) => {
      if (dolu.has(k)) return;
      const m = Math.hypot(yv.x - x, yv.y - y);
      if (m < en) {
        en = m;
        i = k;
      }
    });
    return i;
  };
  function capi(z: Izgarada) {
    if (z.p.tur !== 'kofte' || !z.bicim) return taban * 0.95;
    const k = Math.sqrt(z.bicim.boy) * (z.bicim.sekil === 'krep' ? 1.5 : z.bicim.sekil === 'ince' ? 1.25 : z.bicim.sekil === 'top' ? 0.92 : 1.08);
    return Math.min(taban * 1.35, taban * k);
  }
  function yerKoy(z: Izgarada) {
    const y = yuvalar[z.yuva];
    if (!y) return;
    const c = capi(z);
    z.el.style.left = `${y.x - c / 2}px`;
    z.el.style.top = `${y.y - c / 2}px`;
    z.el.style.width = `${c}px`;
    z.el.style.height = `${c}px`;
  }
  const HALKA: Record<string, string> = { cig: 'transparent', az: 'rgba(196,128,70,0.85)', altin: 'rgba(214,150,44,0.95)', citir: 'rgba(120,64,26,0.95)' };
  function parcaCiz(z: Izgarada) {
    const ust = (1 - z.p.alt) as 0 | 1;
    const pis = pismeAdi(ustYuz(z.p));
    const ic = z.el.querySelector<HTMLElement>('.rs-yg-kofte, .rs-mg-sebze');
    if (ic) {
      ic.dataset.pisme = pis;
      ic.style.setProperty('--kabarma', String(Math.min(1, ustYuz(z.p) / 2.6)));
    }
    // alttaki yüz kızardıkça kenarda halka (dolaylı işaret: çevirme vakti)
    z.el.style.setProperty('--halka', HALKA[pismeAdi(z.p.yuz[z.p.alt])]);
    const iz = z.p.iz[ust];
    z.el.dataset.iz = String(iz);
    z.el.dataset.izyon = String(z.ilkYon[ust]);
    z.el.style.setProperty('--iz-koyu', String(Math.min(1, 0.45 + ustYuz(z.p) * 0.2)));
  }
  function izgarayaKoy(tur: MangalTur, kaynak: { x: number; y: number }, bicim: KofteBicim | null, kaynakId?: string, onceki_?: { p: MangalParca; yuva: number; ilkYon: [0 | 1, 0 | 1] }) {
    const yuva = onceki_?.yuva ?? bosYuva();
    if (yuva < 0) return false;
    const p = onceki_?.p ?? yeniParca(tur);
    const ic = tur === 'kofte' && bicim ? kofteEl(bicim.sekil === 'putur' ? 'yassi' : bicim.sekil, bicim.benek, 'cig') : h('i.rs-mg-sebze', { 'data-tur': tur });
    const el = h('div.rs-mg-parca', { role: 'button', 'aria-label': tur, 'data-tur': tur }, ic, h('i.rs-mg-iz', { 'data-yon': '0' }), h('i.rs-mg-iz', { 'data-yon': '1' }));
    parcaKat.append(el);
    const z: Izgarada = { p, el, yuva, bicim, ilkYon: onceki_?.ilkYon ?? [0, 0], kaynak: kaynakId };
    izgaradakiler.push(z);
    yerKoy(z);
    parcaCiz(z);
    parcaBagla(z);
    if (!onceki_) {
      const y = yuvalar[yuva];
      try {
        el.animate([{ transform: `translate(${kaynak.x - y.x}px,${kaynak.y - y.y}px) scale(0.8)` }, { transform: 'translate(0,-18px) scale(1.06,0.94)', offset: 0.7 }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 380, delay: TEST_MODU ? 0 : izgaradakiler.length * 40, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'backwards' });
      } catch {
        /* yok say */
      }
      zaman(() => {
        b.ses.cal('ciz', { guc: 0.9 });
        sac(kok, y.x, y.y, 'buhar', '#fff', 3, { yon: -Math.PI / 2, yay: 1.2, guc: 0.6 });
      }, 300);
    }
    return true;
  }

  // ------------------------------------------------------------ raftan ızgaraya
  function rafKoy(o: RafOge<RafTur> & { sini?: Sini }, kaynak?: { x: number; y: number }) {
    const k = kaynak ?? merkez(o.el, kok);
    if (o.tur === 'sini' && o.sini) {
      const s = o.sini;
      let kondu = 0;
      for (const kb of s.kofteler) if (izgarayaKoy('kofte', k, kb, s.id)) kondu++;
      if (!kondu) {
        kipirda(mangal, 5);
        return;
      }
      if (!s.ornek) kullanilan.push(s.id);
      // çiğ köftenin malzemesi, tuzu, acısı, porsiyonu ızgara ürününe taşınır
      for (const [m, d] of Object.entries(s.ozellik.malzemeler)) {
        if (m === 'kofte') continue;
        const e = tasinan[m as Malzeme];
        tasinan[m as Malzeme] = e ? { ...e, adet: e.adet + d!.adet } : { ...d! };
      }
      tuz += s.ozellik.tuz ?? 0;
      aci += s.ozellik.aci ?? 0;
      porsiyonCig = s.ozellik.porsiyon ?? porsiyonCig;
      o.el.classList.add('rs-kullanildi');
      olay('kofteKondu');
      if (!konusuyorMu()) void b.mino.soyle(M.ciz);
    } else {
      if (!izgarayaKoy(o.tur as MangalTur, k, null)) {
        kipirda(mangal, 5);
        return;
      }
      olay(`kondu-${o.tur}`);
      if (!olaylar.slice(0, -1).includes(`kondu-${o.tur}`) && !konusuyorMu()) void b.mino.soyle((M.ad as Record<string, string>)[o.tur]);
    }
    b.dokunsal(TITRESIM.slap);
    durumGuncelle();
  }
  for (const o of rafOgeleri) {
    const el = o.el;
    surukle(el, kok, {
      basla: (x, y) => {
        if (el.classList.contains('rs-kullanildi')) return false;
        elde.al(el, x, y, o.tur === 'sini' ? 'rs-mg-elde-sini' : '');
        el.classList.add('rs-p5-tutuldu');
        b.ses.cal('hop', { perde: 1.1, guc: 0.35 });
      },
      hareket: (x, y) => elde.tasi(x, y),
      birak: (x, y) => {
        el.classList.remove('rs-p5-tutuldu');
        const ici = mangalda(x, y - YUKARI, 10);
        elde.birak(ici ? null : el);
        if (ici) rafKoy(o, { x, y: y - YUKARI });
      },
      dokun: () => {
        el.classList.remove('rs-p5-tutuldu');
        elde.birak();
        ezil(el, 1.3);
        rafKoy(o);
      },
    });
  }

  // ------------------------------------------------------------ maşa: dokun → çevir; sürükle → yer değiştir
  function masaGoster(x: number, y: number) {
    masa_.classList.add('rs-tutuyor');
    masaKoy(x, y - 10);
  }
  function masaBirak() {
    masa_.classList.remove('rs-tutuyor');
    if (!masaTutuluyor) masaKoy(masaYer.x, masaYer.y);
  }
  function cevirOyna(z: Izgarada) {
    const c = merkez(z.el, kok);
    masaGoster(c.x, c.y);
    p6Ses.masa();
    b.dokunsal(TITRESIM.kesim);
    const ilk = !z.p.cevrildi;
    const ic = z.el.firstElementChild as HTMLElement;
    try {
      ic.animate([{ transform: 'scale(1,1)' }, { transform: 'translateY(-14px) scale(1.04,0.12)', offset: 0.45 }, { transform: 'translateY(-6px) scale(1.04,0.5)', offset: 0.6 }, { transform: 'scale(1.06,0.92)', offset: 0.85 }, { transform: 'none' }], { duration: TEST_MODU ? 30 : 360, easing: 'ease-in-out' });
    } catch {
      /* yok say */
    }
    zaman(() => {
      cevir(z.p);
      parcaCiz(z);
      b.ses.cal('ciz', { guc: 1 });
      sac(kok, c.x, c.y, 'buhar', '#fff', 4, { yon: -Math.PI / 2, yay: 1.6, guc: 0.7 });
      olay('cevir');
      const ust = (1 - z.p.alt) as 0 | 1;
      if (z.p.iz[ust] && ilk && !olaylar.includes('izGorundu')) {
        olay('izGorundu');
        if (!konusuyorMu()) void b.mino.soyle(M.cevrildi);
      }
      durumGuncelle();
    }, 170);
    zaman(masaBirak, 420);
  }
  function parcaBagla(z: Izgarada) {
    let bas = { x: 0, y: 0 };
    let kaydi = false;
    surukle(z.el, kok, {
      basla: (x, y) => {
        if (odulde) return false;
        bas = { x, y };
        kaydi = false;
        // aynı karede: maşa parçayı kavrar
        masaGoster(x, y);
        p6Ses.masa();
        z.el.classList.add('rs-tutuluyor');
      },
      hareket: (x, y) => {
        if (!kaydi && Math.hypot(x - bas.x, y - bas.y) < 10) return;
        kaydi = true;
        const c = capi(z);
        z.el.style.left = `${x - c / 2}px`;
        z.el.style.top = `${y - YUKARI - c / 2}px`;
        masaKoy(x, y - YUKARI - 10);
      },
      birak: (x, y) => {
        z.el.classList.remove('rs-tutuluyor');
        const yuva = mangalda(x, y - YUKARI, 0) ? enYakinBos(x, y - YUKARI, z) : -1;
        if (yuva >= 0 && yuva !== z.yuva) {
          z.yuva = yuva;
          tasi(z.p);
          olay('tasi');
          b.ses.cal('ciz', { guc: 0.7 });
        }
        yerKoy(z);
        parcaCiz(z);
        masaBirak();
      },
      dokun: () => {
        z.el.classList.remove('rs-tutuluyor');
        yerKoy(z);
        cevirOyna(z);
      },
    });
  }
  // maşanın kendisini köfteye götürmek de çevirir
  surukle(masa_, kok, {
    basla: () => {
      masaTutuluyor = true;
      masa_.classList.add('rs-tutuyor');
      p6Ses.masa();
    },
    hareket: (x, y) => masaKoy(x, y - YUKARI),
    birak: (x, y) => {
      masaTutuluyor = false;
      const hedef = izgaradakiler.find((z) => {
        const c = merkez(z.el, kok);
        return Math.hypot(c.x - x, c.y - (y - YUKARI)) < capi(z) * 0.7;
      });
      if (hedef) cevirOyna(hedef);
      else masaBirak();
    },
    dokun: () => {
      masaTutuluyor = false;
      // dokununca sıradaki (en çok kızarmış, çevrilmemiş) köfteyi çevirir
      const z = [...izgaradakiler].sort((a, c) => c.p.yuz[c.p.alt] - a.p.yuz[a.p.alt])[0];
      if (z) cevirOyna(z);
      else {
        p6Ses.masa();
        kipirda(masa_, 4);
        masaBirak();
      }
    },
  });

  // ------------------------------------------------------------ yelpaze: köz canlanır; fazlası duman bulutu
  const dalgalar: number[] = [];
  let yonX = 0;
  let sonX = 0;
  function dalga(x: number) {
    const simdi = performance.now();
    const s = yelpazele(ates, dalgalar, simdi);
    dalgalar.push(simdi);
    while (dalgalar.length > 30) dalgalar.shift();
    const once = ates;
    ates = s.ates;
    atesCiz();
    p6Ses.vus(0.8 + ates * 0.4);
    if (once < 0.8 && ates >= 0.8) {
      p6Ses.fuf();
      if (!olaylar.includes('alev') && !konusuyorMu()) void b.mino.soyle(M.alev);
      olay('alev');
    }
    for (let i = 0; i < 2; i++) sac(kok, Math.max(mr.x + 20, Math.min(mr.x + mr.w - 20, x + (Math.random() - 0.5) * 80)), mr.y + mr.h * 0.6, 'cekirdek', i ? '#FFD449' : '#FF8A2A', 3, { yon: -Math.PI / 2, yay: 0.9, guc: 1.4, boy: 5 });
    ezil(mangal, 0.25, 140);
    olay('yelpaze');
    if (s.duman) dumanBulutu();
    durumGuncelle(false);
  }
  surukle(yelpaze, kok, {
    basla: (x, y) => {
      yelpazeTutuluyor = true;
      yelpaze.classList.add('rs-tutuyor');
      yelpazeKoy(x, y - YUKARI);
      yonX = 0;
      sonX = x;
      p6Ses.vus(0.6);
    },
    hareket: (x, y) => {
      yelpazeKoy(x, y - YUKARI);
      const dx = x - sonX;
      if (Math.abs(dx) > 4) {
        const yon = Math.sign(dx);
        if (yonX && yon !== yonX && mangalda(x, y - YUKARI, 70)) dalga(x);
        yonX = yon;
        yelpaze.dataset.yon = yon > 0 ? 'sag' : 'sol';
      }
      sonX = x;
    },
    birak: () => {
      yelpazeTutuluyor = false;
      yelpaze.classList.remove('rs-tutuyor');
      yelpazeKoy(yelpazeYer.x, yelpazeYer.y);
    },
    dokun: () => {
      // dokununca yelpaze mangalın üstüne gelir, iki kez sallar
      yelpazeTutuluyor = true;
      yelpaze.classList.add('rs-tutuyor');
      const cx = mr.x + mr.w / 2;
      const cy = mr.y + mr.h * 0.35;
      let i = 0;
      const z = window.setInterval(() => {
        yelpazeKoy(cx + (i % 2 ? 40 : -40), cy);
        yelpaze.dataset.yon = i % 2 ? 'sag' : 'sol';
        if (i > 0) dalga(cx);
        if (++i > 3) {
          clearInterval(z);
          yelpazeTutuluyor = false;
          yelpaze.classList.remove('rs-tutuyor');
          yelpazeKoy(yelpazeYer.x, yelpazeYer.y);
        }
      }, TEST_MODU ? 20 : 170);
      zamanlar.push(z);
    },
  });
  function atesCiz() {
    mangal.style.setProperty('--ates', ates.toFixed(2));
    mangal.dataset.alev = ates >= 0.8 ? 'yuksek' : ates > 0.5 ? 'orta' : 'dusuk';
  }
  let kinoBakti = false;
  let dumanda = false;
  /** Komik başarısızlık: duman bulutu, Kino öksürür, yüzü is olur (lokantada da) */
  function dumanBulutu() {
    if (dumanda) return;
    dumanda = true;
    olay('duman');
    p6Ses.fuf();
    void b.mino.tepki('sasir', 1200);
    if (!konusuyorMu()) void b.mino.soyle(M.duman);
    const W = kok.clientWidth;
    const H = kok.clientHeight;
    const bulut = h('div.rs-mg-bulut', {}, ...Array.from({ length: 7 }, (_, i) => h('i', { style: `--i:${i}` })));
    const bx = mr.x + mr.w / 2;
    const by = mr.y + mr.h * 0.4;
    const bw = Math.min(W * 0.5, 320);
    bulut.style.cssText = `left:${bx - bw / 2}px;top:${by - bw * 0.35}px;width:${bw}px;height:${bw * 0.7}px`;
    efektKat.append(bulut);
    // bütün köfteler biraz daha pişer (yanmaz: en çok çıtır)
    for (const z of izgaradakiler) {
      pisir(z.p, 2.4, 1, yas);
      parcaCiz(z);
    }
    const ilkKino = !kinoBakti;
    kinoBakti = true;
    void (async () => {
      const hedefX = W - bw * 0.42;
      const hedefY = H * 0.42;
      try {
        await bulut.animate([{ transform: 'translate(0,20px) scale(0.3)', opacity: 0 }, { transform: 'translate(0,-10px) scale(1)', opacity: 0.95, offset: 0.3 }, { transform: `translate(${hedefX - bx}px,${hedefY - by}px) scale(1.15)`, opacity: 0.95 }], { duration: TEST_MODU ? 40 : 1300, easing: 'ease-in-out', fill: 'forwards' }).finished;
      } catch {
        /* yok say */
      }
      if (kapandi) return;
      if (ilkKino) {
        // Kino kenardan bakıyordu: bulut yüzünü kaplar
        await kino.gel('sag', hedefY, Math.min(H * 0.4, 180));
        if (kapandi) return;
        kino.yuz('kapali', 'o');
        p6Ses.oksur();
        olay('oksur');
        void kinoSoyle(K.oksur);
        isEkle();
      }
      try {
        await bulut.animate([{ opacity: 0.95 }, { opacity: 0, transform: `translate(${hedefX - bx + 40}px,${hedefY - by - 40}px) scale(1.4)` }], { duration: TEST_MODU ? 40 : 900, fill: 'forwards' }).finished;
      } catch {
        /* yok say */
      }
      bulut.remove();
      dumanda = false;
      if (ilkKino && !kapandi) {
        kino.yuz('mutlu', 'kahkaha');
        hopla(kino.el.firstElementChild as HTMLElement, 10, 320);
        await kinoSoyle(K.isli);
        await new Promise((r) => zaman(() => r(null), 900));
        if (!kapandi) await kino.git();
        isKatman?.remove();
      }
    })();
  }
  let isKatman: HTMLElement | null = null;
  function isEkle() {
    isli = true;
    olay('isli');
    const n = kino.nokta('burun');
    isKatman = h('div.rs-mg-is', {}, ...Array.from({ length: 6 }, (_, i) => h('i', { style: `--i:${i}` })));
    isKatman.style.cssText = `left:${n.x - 46}px;top:${n.y - 50}px`;
    efektKat.append(isKatman);
    surprizBildir(kok, 'kino-isli');
  }
  /** Kino'nun sözü (kendi sesi; balon) */
  async function kinoSoyle(t: string) {
    const balon = h('div.rs-mg-kino-balon', {}, t.replace(/\[[^\]]*\]\s*/g, ''));
    const n = kino.nokta('tepe');
    balon.style.cssText = `right:${kok.clientWidth - n.x + 20}px;top:${Math.max(6, n.y - 10)}px`;
    efektKat.append(balon);
    try {
      await konus(t, { karakter: 'kino', cihazSesi: false });
    } catch {
      /* yok say */
    }
    await new Promise((r) => zaman(() => r(null), 600));
    balon.remove();
  }

  // ------------------------------------------------------------ zaman: pişme, ateş, duman
  let cizDongu: { guc(g: number): void; dur(): void } | null = null;
  let sonT = performance.now();
  let sonDuman = 0;
  let citirDendi = false;
  const hizli = TEST_MODU && new URLSearchParams(location.search).has('hizli') ? 8 : 1;
  if (onceki) {
    // dışarıdayken de pişti
    const sn = (performance.now() - onceki.t) / 1000;
    for (const k of onceki.parcalar) pisir(k.p, sn, ATES_TABAN, yas);
  }
  const zamanlayici = window.setInterval(() => {
    const t = performance.now();
    const sn = ((t - sonT) / 1000) * hizli;
    sonT = t;
    ates = atesSon(ates, sn / hizli);
    atesCiz();
    pismeAdimi(sn);
    if (izgaradakiler.length) {
      if (!cizDongu) cizDongu = b.ses.dongu('ciz');
      cizDongu.guc(Math.min(1, 0.3 + izgaradakiler.length * 0.1 + (ates - ATES_TABAN) * 0.6));
      if (t - sonDuman > (TEST_MODU ? 2000 : 900)) {
        sonDuman = t;
        const z = izgaradakiler[Math.floor(Math.random() * izgaradakiler.length)];
        const c = merkez(z.el, kok);
        sac(kok, c.x, c.y - 10, 'buhar', '#fff', 1, { yon: -Math.PI / 2, yay: 0.6, guc: 0.4 });
      }
    }
    durumGuncelle(false);
  }, 100);
  /** Izgaradakiler sn saniye pişer: iz, çapraz iz (yıldız), altın / çıtır işaretleri */
  function pismeAdimi(sn: number) {
    for (const z of izgaradakiler) {
      const r = pisir(z.p, sn, ates, yas);
      if (r.iz) {
        const a = z.p.alt;
        if (z.p.iz[a] === 1) z.ilkYon[a] = z.p.izYon;
        olay('iz');
      }
      if (r.capraz) {
        olay('capraz');
        const c = merkez(z.el, kok);
        parilti(kok, c.x, c.y, 6, capi(z) * 0.7);
        b.ses.cal('ting', { perde: 1.3 });
        if (yas === 'buyuk' && !konusuyorMu()) void b.mino.soyle(M.capraz);
      }
      // alttaki yüz altına ulaşınca köfte bir kez kıpırdar ve cızırtı yükselir (dolaylı işaret)
      const ad = pismeAdi(z.p.yuz[z.p.alt]);
      if (z.el.dataset.alt !== ad) {
        z.el.dataset.alt = ad;
        if (ad === 'altin' || ad === 'citir') {
          kipirda(z.el, 3, 240);
          b.ses.cal('ciz', { guc: 0.6 });
        }
        if (ad === 'citir' && z.p.tur === 'kofte' && !citirDendi) {
          citirDendi = true;
          olay('citir');
          if (!konusuyorMu()) void b.mino.soyle(M.citir);
        }
      }
      parcaCiz(z);
    }
  }

  // geri dönüşte ızgaradakiler yeniden çizilir
  if (onceki) for (const k of onceki.parcalar) izgarayaKoy(k.p.tur, { x: 0, y: 0 }, k.bicim, k.kaynak, { p: k.p, yuva: k.yuva, ilkYon: k.ilkYon });

  // ------------------------------------------------------------ doğal son: duman kalpleri; ipucu
  let hazirDi = false;
  function kalpler() {
    const n = TEST_MODU ? 2 : 4;
    for (let i = 0; i < n; i++) {
      const k = h('i.rs-mg-kalp');
      const x = mr.x + mr.w * (0.2 + 0.6 * (i / Math.max(1, n - 1)));
      k.style.cssText = `left:${x}px;top:${mr.y + mr.h * 0.3}px`;
      efektKat.append(k);
      try {
        k.animate([{ transform: 'translate(-50%,0) scale(0.4)', opacity: 0 }, { transform: 'translate(-50%,-30px) scale(1)', opacity: 0.95, offset: 0.3 }, { transform: 'translate(-50%,-110px) scale(1.25)', opacity: 0 }], { duration: TEST_MODU ? 60 : 2200, delay: TEST_MODU ? 0 : i * 220, easing: 'ease-out', fill: 'both' }).finished.then(
          () => k.remove(),
          () => k.remove(),
        );
      } catch {
        k.remove();
      }
    }
  }
  function durumGuncelle(ipucuDa = true) {
    const hz = hazirMi(izgaradakiler.map((z) => z.p), yas);
    if (hz && !hazirDi) {
      hazirDi = true;
      kalpler();
      b.ses.cal('ting');
      b.tepsi.hopla();
      void b.mino.tepki('sevin', 1000);
      if (!konusuyorMu()) void b.mino.soyle(M.hazir);
      olay('kalp');
    }
    kok.dataset.durum = JSON.stringify(ozet());
    if (ipucuDa) ipucuGuncelle();
  }
  let sonIpucu = '';
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    const kofte = izgaradakiler.filter((z) => z.p.tur === 'kofte');
    let anahtar = '';
    let hedef: Parameters<typeof b.ipucu.hedef>[0] = null;
    if (!izgaradakiler.length) {
      const ilk = rafOgeleri.find((o) => !o.el.classList.contains('rs-kullanildi'));
      anahtar = 'bos';
      hedef = ilk ? { el: () => ilk.el, soz: siniler.length ? M.ipucu.bos : M.bos, hareket: 'surukle', nereye: () => mangal } : null;
    } else {
      const cevrilecek = kofte.find((z) => z.p.yuz[z.p.alt] >= 2 && (yas === 'buyuk' ? z.p.yuz[1 - z.p.alt] < 2 : !z.p.cevrildi));
      if (cevrilecek) {
        anahtar = `cevir-${cevrilecek.p.id}`;
        hedef = { el: () => cevrilecek.el, soz: M.ipucu.alti, hareket: 'dokun' };
      } else if (hazirMi(izgaradakiler.map((z) => z.p), yas)) {
        anahtar = 'bitti';
        hedef = { el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' };
      } else {
        anahtar = 'pisiyor';
        hedef = { el: () => yelpaze, soz: M.ipucu.pisiyor, hareket: 'kaydir-yatay' };
      }
    }
    // aynı iş sürdükçe merdiven baştan başlamasın
    if (anahtar === sonIpucu) return;
    sonIpucu = anahtar;
    b.ipucu.hedef(hedef);
  }

  // ------------------------------------------------------------ ödül anı, ürün
  let odulde = false;
  let coz: (u: Urun[]) => void = () => undefined;
  const bittiSoz = new Promise<Urun[]>((r) => (coz = r));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (!izgaradakiler.length) return coz([]);
    odulde = true;
    b.ipucu.hedef(null);
    olay('odul');
    void (async () => {
      const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));
      if (!hazirDi) kalpler();
      const tabak = h('div.rs-mg-tabak');
      const tw = Math.min(mr.w * 0.62, taban * 3.4);
      const tx = mr.x + mr.w / 2;
      const ty = mr.y + mr.h / 2;
      tabak.style.cssText = `left:${tx - tw / 2}px;top:${ty - tw * 0.36}px;width:${tw}px;height:${tw * 0.72}px`;
      parcaKat.prepend(tabak);
      try {
        tabak.animate([{ transform: 'translateY(40px) scale(0.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: TEST_MODU ? 20 : 260, easing: 'ease-out' });
      } catch {
        /* yok say */
      }
      await bekle(260);
      const n = izgaradakiler.length;
      for (let i = 0; i < n; i++) {
        const z = izgaradakiler[i];
        const c = merkez(z.el, kok);
        const hx = tx - tw * 0.32 + (tw * 0.64 * (i + 0.5)) / n;
        masaGoster(c.x, c.y);
        p6Ses.masa();
        void ucur(z.el, hx - c.x, ty - c.y, 260, -30);
        await bekle(TEST_MODU ? 10 : 150);
      }
      masaBirak();
      await bekle(300);
      p6Ses.ezgi([64, 67, 72, 76], 0.1);
      parilti(efektKat, tx, ty - 20, 6, tw * 0.35);
      b.ses.cal('ting');
      await bekle(500);
      const u = urunYap();
      const t = merkez(b.tepsi.el, kok);
      await Promise.all([tabak, ...izgaradakiler.map((z) => z.el)].map((e) => ucur(e, t.x - tx, t.y - ty, 380, -30)));
      coz([u]);
    })();
  });

  function urunYap(): Urun {
    const ps = izgaradakiler.map((z) => z.p);
    const kofteSay = ps.filter((p) => p.tur === 'kofte').length;
    const malzemeler: YemekOzelligi['malzemeler'] = { ...tasinan };
    if (kofteSay) malzemeler.kofte = { adet: kofteSay };
    for (const s of ['biber', 'domates'] as const) {
      const n = ps.filter((p) => p.tur === s).length;
      if (n) malzemeler[s] = { adet: n + (malzemeler[s]?.adet ?? 0), kesim: 'butun' };
    }
    const ozellik: YemekOzelligi = { malzemeler, pisme: toplamPisme(ps, yas), sicak: true };
    if (porsiyonCig) ozellik.porsiyon = porsiyonCig;
    if (tuz) ozellik.tuz = Math.min(3, tuz);
    if (aci) ozellik.aci = Math.min(3, aci);
    const snap = izgaradakiler.map((z) => ({ tur: z.p.tur, bicim: z.bicim, pisme: parcaPisme(z.p, yas), iz: Math.max(z.p.iz[0], z.p.iz[1]) }));
    return {
      id: urunId('izgara'),
      tur: kofteSay ? 'izgara' : 'kozleme',
      yemek: kofteSay ? 'kofte' : undefined,
      ozellik,
      butun: true,
      kullanilan: kullanilan.slice(),
      gorsel: () => izgaraGorsel(snap),
      yemekGorsel: () => izgaraGorsel(snap, true),
    } as Urun;
  }

  function ozet() {
    return {
      ates: +ates.toFixed(2),
      isli,
      parcalar: izgaradakiler.map((z) => ({ tur: z.p.tur, yuz: z.p.yuz.map((x) => +x.toFixed(2)), alt: z.p.alt, iz: z.p.iz.slice(), cevrildi: z.p.cevrildi, pisme: parcaPisme(z.p, yas) })),
      pisme: toplamPisme(izgaradakiler.map((z) => z.p), yas) ?? null,
    };
  }
  (window as unknown as { __rsMangal?: unknown }).__rsMangal = {
    olaylar,
    durum: ozet,
    merkez: () => ({ mr, yuvalar, taban }),
    parcaYeri: () =>
      izgaradakiler.map((z) => {
        const r = z.el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, tur: z.p.tur };
      }),
    /** test: zamanı ileri sar (gerçek döngüyle aynı adım: iz, çapraz, işaretler) */
    pisir: (sn: number) => {
      for (let i = 0; i < Math.ceil(sn * 4); i++) pismeAdimi(sn / Math.ceil(sn * 4));
      durumGuncelle();
    },
  };
  yerlestir();
  atesCiz();
  durumGuncelle();

  return {
    bitti: bittiSoz,
    arkaPlanda(): ArkaIs | null {
      if (!izgaradakiler.length || odulde) return null;
      const durum: MangalKayit = JSON.parse(
        JSON.stringify({
          parcalar: izgaradakiler.map((z) => ({ p: z.p, yuva: z.yuva, bicim: z.bicim, ilkYon: z.ilkYon, kaynak: z.kaynak })),
          ates,
          kullanilan,
          ozellik: tasinan,
          tuz,
          aci,
          porsiyon: porsiyonCig,
          isli,
          t: performance.now(),
        }),
      );
      return {
        durum,
        isaret: () => {
          const sn = (performance.now() - durum.t) / 1000;
          const kopya = durum.parcalar.map((k) => {
            const p = JSON.parse(JSON.stringify(k.p)) as MangalParca;
            pisir(p, sn, ATES_TABAN, yas);
            return p;
          });
          return { ses: 'ciz', buhar: true, pisme: toplamPisme(kopya, yas) };
        },
      };
    },
    kapat() {
      kapandi = true;
      ro?.disconnect();
      clearInterval(zamanlayici);
      zamanlar.forEach((z) => {
        clearTimeout(z);
        clearInterval(z);
      });
      cizDongu?.dur();
      kino.sil();
      kok.remove();
    },
  };
}
