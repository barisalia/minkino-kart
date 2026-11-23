// Sahne yürütücüsü: bir sahne tanımını (adımlar, diziler, katmanlar) ekrana koyar. Görünen her şey Astra'nın çizimidir
// (assets/doktor/zipzip-diz/<ad>.webp). Tanımın istediği çizimlerden biri eksikse sahne açılmaz; yer tutucu yoktur.
// Hareket çizilmiş pozların sırayla gösterilmesidir; yürüyüşte katman yer değiştirir, çizim esnetilmez.
import '../stil.css';
import '../once-kuzu/once-kuzu.css';
import type { HazirDizi } from '../../../src/audio/dudak-mantik';
import { TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { anaMenuyeDon } from '../../../src/uygulama';
import { agizDizisi, agizKaresi, sesVarMi } from '../once-kuzu/agiz';
import { kareSec, kirpiyorMu, type Dizi } from '../once-kuzu/diziler';
import { efekt, konus, sesYukle } from '../ses';
import { elKatmaniKur } from '../tutma';
import { AkisMotoru, yuruKaymasi, type Adim, type Gorunum, type Konusma } from './akis';

const cizimler = import.meta.glob<string>('../../../assets/doktor/zipzip-diz/*.webp', { eager: true, query: '?url', import: 'default' });
export const cizimAdresi = (ad: string): string | undefined => cizimler['../../../assets/doktor/zipzip-diz/' + ad + '.webp'];

export interface Kutu { sol: number; ust: number; g: number; y: number; }
export const SAHNE = { g: 1600, y: 900 } as const;
/** Yakın plan tuvali (2048 × 1536) sahnenin boyuna sığar ve ortalanır. */
export const YAKIN_OLCEK = SAHNE.y / 1536;
export const YAKIN_KUTU: Kutu = { sol: (SAHNE.g - 2048 * YAKIN_OLCEK) / 2, ust: 0, g: 2048 * YAKIN_OLCEK, y: SAHNE.y };

export interface KatmanTanimi {
  ad: string;
  kutu: Kutu;
  /** çizim pikselinin sahne birimi (yürüyüş kayması için) */
  olcek: number;
  /** yakın plan katmanı: kameranın dışında durur, yalnız yakın planda görünür */
  yakin?: boolean;
}

export interface SahneTanimi<O extends string = string> {
  /** data-sahne ve adres çubuğundaki ad */
  ad: string;
  /** sahnenin açılması için gereken bütün çizimler */
  dosyalar: readonly string[];
  adimlar: readonly Adim<O>[];
  diziler: Readonly<Record<string, Dizi>>;
  /** ağız dizisi adı → hangi katmanda, altı çizim */
  agizlar: Readonly<Record<string, { katman: string; kareler: readonly string[] }>>;
  /** fon (tam sahne) */
  fon: string;
  /** çizim katmanları, arkadan öne */
  katmanlar: readonly KatmanTanimi[];
  /** plan adı → büyütme ve sahnede ortalanan nokta; yakin: oda bulanır, yakın katmanlar görünür */
  kamera: Readonly<Record<string, { olcek: number; x: number; y: number; yakin?: boolean }>>;
  replikler: readonly string[];
  efektler: readonly string[];
  /** kayıt süreleri (ms): ses yüklenemezse kullanılır */
  kayitMs: Readonly<Record<string, number>>;
  /** sahneye özel dokunmalar: öğelerini kurar, her adımda ve her karede çağrılır */
  kur?(b: Baglam<O>): { adim?(a: Adim<O>): void; kare?(dt: number): void } | void;
}

export interface Baglam<O extends string = string> {
  kok: HTMLElement;
  /** oda katmanı: sahneye özel düğmeler buraya eklenir (kamerayla birlikte büyür) */
  kamera: HTMLElement;
  /** yakın plan katmanı (kameranın dışında, 1600 × 900 birim) */
  yakin: HTMLElement;
  /** her planda görünen üst katman (kameranın dışında): seçenek düğmeleri buraya konur */
  ust: HTMLElement;
  akis: AkisMotoru<Adim<O>, O>;
  /** ekran pikseli / sahne birimi */
  olcek(): number;
  saat(): number;
  adres(ad: string): string;
  katman(ad: string): HTMLImageElement;
  /** katmanda o an görünen çizim ve yürüyüş kayması (sahne birimi) */
  durum(katman: string): { poz: string; kayma: number };
  /** çocuğun eylemi; hedef verilirse o adıma gidilir */
  olay(o: O, hedef?: string): boolean;
  /** kısa süre başka bir çizilmiş poz göster (ipucu, tepki) */
  gecici(katman: string, kare: string, ms: number): void;
  efekt(ad: string, kazanc?: number, hiz?: number): void;
  /** çocuğun son dokunuşundan beri geçen süre (ms) */
  bostaMs(): number;
  kayitMs(ad: string): number;
}

const div = (sinif: string) => { const d = document.createElement('div'); d.className = sinif; return d; };
const dugme = (sinif: string, etiket: string) => { const b = document.createElement('button'); b.type = 'button'; b.className = sinif; b.setAttribute('aria-label', etiket); return b; };
export function kutuyaKoy(el: HTMLElement, k: Kutu) { Object.assign(el.style, { left: k.sol + 'px', top: k.ust + 'px', width: k.g + 'px', height: k.y + 'px' }); }
/** Sahnenin beklediği ama klasörde olmayan çizimler. */
export const eksikCizimler = (t: { dosyalar: readonly string[] }): string[] => [...new Set(t.dosyalar)].filter(ad => !cizimAdresi(ad));

export interface Secenek {
  /** sahne bitince çağrılır (zincirde sıradaki sahne); verilmezse "yeniden oyna" düğmesi çıkar */
  bitince?: () => void;
  /** sahne ilk karesini çizince çağrılır (geçiş perdesi kalkar) */
  hazir?: () => void;
}

/** Çizimler gelmeden sahne açılmaz ve ekrana hiçbir şey çizilmez: yalnız geri düğmesi. */
export function eksikGoster(kok: HTMLElement, ad: string, eksik: readonly string[]) {
  const geri = dugme('dk-geri', 'Geri');
  geri.innerHTML = IKON.geri;
  geri.addEventListener('click', () => anaMenuyeDon());
  kok.dataset.sahne = ad;
  kok.dataset.durum = 'eksik';
  kok.dataset.eksik = String(eksik.length);
  kok.append(geri);
  console.info(ad + ': ' + eksik.length + ' çizim bekleniyor:', eksik.join(', '));
}

export function sahneyiBaslat<O extends string>(kok: HTMLElement, t: SahneTanimi<O>, secenek: Secenek = {}) {
  const eksik = eksikCizimler(t);
  if (eksik.length) { eksikGoster(kok, t.ad, eksik); secenek.hazir?.(); return; }
  const geri = dugme('dk-geri', 'Geri');
  geri.innerHTML = IKON.geri;
  geri.addEventListener('click', () => anaMenuyeDon());
  kok.dataset.sahne = t.ad;
  kok.dataset.durum = 'yukleniyor';
  void yukle(t).then(v => calistir(kok, geri, t, v, secenek));
}

interface Yuklenen { kayitMs: Record<string, number>; agiz: Record<string, HazirDizi>; resimler: HTMLImageElement[]; }
async function yukle(t: SahneTanimi<string>): Promise<Yuklenen> {
  const resimler = Promise.all([...new Set(t.dosyalar)].map(async ad => {
    const r = new Image();
    r.src = cizimAdresi(ad)!;
    try { await r.decode(); } catch { await new Promise(c => { r.onload = r.onerror = c; }); }
    return r;
  }));
  const kayitMs: Record<string, number> = { ...t.kayitMs };
  const agiz: Record<string, HazirDizi> = {};
  await Promise.all([...t.replikler, ...t.efektler].map(async ad => {
    const b = await sesYukle(ad);
    if (b && t.replikler.includes(ad)) { kayitMs[ad] = b.duration * 1000; agiz[ad] = agizDizisi(b.getChannelData(0), b.sampleRate); }
  }));
  return { kayitMs, agiz, resimler: await resimler };
}

function calistir<O extends string>(kok: HTMLElement, geri: HTMLElement, t: SahneTanimi<O>, v: Yuklenen, secenek: Secenek) {
  const azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sahne = div('dk-sahne ok-sahne');
  const kamera = div('ok-kamera');
  const yakin = div('ok-yakin');
  const yakinIc = div('ok-yakin-ic');
  yakin.append(yakinIc);
  yakin.hidden = true;
  const ust = div('ok-ust');
  const fon = document.createElement('img');
  fon.className = 'ok-fon'; fon.alt = ''; fon.draggable = false; fon.src = cizimAdresi(t.fon)!;
  kamera.append(fon);
  const el: Record<string, HTMLImageElement> = {};
  for (const k of t.katmanlar) {
    const r = document.createElement('img');
    r.className = 'ok-katman'; r.alt = ''; r.draggable = false; r.decoding = 'sync'; r.hidden = true;
    kutuyaKoy(r, k.kutu);
    el[k.ad] = r;
    (k.yakin ? yakinIc : kamera).append(r);
  }
  const tekrar = dugme('dk-tekrar', 'Yeniden oyna');
  tekrar.innerHTML = IKON.tekrar; tekrar.hidden = true;
  tekrar.addEventListener('click', () => location.reload());
  sahne.append(kamera, yakin, ust);
  kok.append(sahne, geri, tekrar);
  elKatmaniKur(kok);
  (window as unknown as Record<string, unknown>).__doktorResimler = v.resimler; // çözülmüş resimler bellekte kalsın

  let S = 1;
  const olcekle = () => {
    const W = innerWidth, H = innerHeight;
    S = Math.max(W / SAHNE.g, H / SAHNE.y);
    sahne.style.transform = 'translate(' + (W - SAHNE.g * S) / 2 + 'px,' + (H - SAHNE.y * S) / 2 + 'px) scale(' + S + ')';
    kok.style.setProperty('--hucre', Math.round(Math.max(64, Math.min(112, Math.min(H * 0.12, W * 0.085)))) + 'px');
  };
  olcekle();
  addEventListener('resize', olcekle);

  // ——— kamera
  let plan = t.adimlar[0]?.plan ?? '';
  const donusum = (p: string) => { const k = t.kamera[p]; return 'translate(' + (SAHNE.g / 2 - k.x * k.olcek) + 'px,' + (SAHNE.y / 2 - k.y * k.olcek) + 'px) scale(' + k.olcek + ')'; };
  const bulanik = (p: string) => (t.kamera[p].yakin ? 'blur(6px) brightness(.93)' : 'blur(0px) brightness(1)');
  kamera.style.transform = donusum(plan);
  kamera.style.filter = bulanik(plan);
  yakin.hidden = !t.kamera[plan]?.yakin;
  function planaGec(yeni: string) {
    if (yeni === plan) return;
    const eski = plan; plan = yeni;
    kok.dataset.plan = yeni;
    const giris = !!t.kamera[yeni].yakin && !t.kamera[eski].yakin, cikis = !t.kamera[yeni].yakin && !!t.kamera[eski].yakin;
    const sure = azHareket || TEST_MODU ? 1 : giris || cikis ? 950 : 650;
    const e = 'cubic-bezier(.5,0,.2,1)';
    kamera.getAnimations().forEach(a => a.cancel());
    kamera.style.transform = donusum(yeni); kamera.style.filter = bulanik(yeni);
    kamera.animate([{ transform: donusum(eski), filter: bulanik(eski) }, { transform: donusum(yeni), filter: bulanik(yeni) }], { duration: sure, easing: e });
    if (!giris && !cikis) return;
    // yakın çizim sahnenin ortasından büyüyerek gelir (kesme yok); çıkarken aynı yoldan küçülür
    const a0 = 0.42, kucukHal = 'translate(' + SAHNE.g / 2 * (1 - a0) + 'px,' + SAHNE.y / 2 * (1 - a0) + 'px) scale(' + a0 + ')';
    yakin.hidden = false;
    yakinIc.getAnimations().forEach(a => a.cancel()); yakin.getAnimations().forEach(a => a.cancel());
    if (giris) {
      yakinIc.animate([{ transform: kucukHal }, { transform: 'none' }], { duration: sure, easing: e });
      yakin.animate([{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], { duration: sure, easing: 'ease-out' });
    } else {
      yakinIc.animate([{ transform: 'none' }, { transform: kucukHal }], { duration: sure, easing: e });
      void yakin.animate([{ opacity: 1 }, { opacity: 0, offset: 0.7 }, { opacity: 0 }], { duration: sure, easing: 'ease-in' }).finished
        .then(() => { if (!t.kamera[plan].yakin) yakin.hidden = true; }).catch(() => undefined);
    }
  }

  // ——— zaman, görünüm, ses
  const akis = new AkisMotoru<Adim<O>, O>(t.adimlar, ad => v.kayitMs[ad] ?? 0);
  let saat = 0;
  const gorunum: Record<string, { g: Gorunum; bas: number } | undefined> = {};
  const gosterilen: Record<string, string> = {};
  const kaymalar: Record<string, number> = {};
  const olcekleri: Record<string, number> = Object.fromEntries(t.katmanlar.map(k => [k.ad, k.olcek]));
  let aktifSes: { k: Konusma; bas: number; sure: number; dizi: HazirDizi | null } | null = null;
  let sesBekliyor = false;
  let adimSesi: 'yok' | 'bekliyor' | 'istendi' = 'yok';
  let calanEfektler = new Set<number>();
  const gecici: Record<string, { kare: string; bitis: number } | undefined> = {};
  let sonEtkilesim = 0;
  let sonKare = performance.now();
  let kanca: { adim?(a: Adim<O>): void; kare?(dt: number): void } = {};
  let durdu = false, bittiBildirildi = false;

  function adimaGir(a: Adim<O>) {
    kok.dataset.adim = a.ad;
    if (a.katman) for (const [k, g] of Object.entries(a.katman)) gorunum[k] = { g, bas: saat };
    adimSesi = a.ses ? 'bekliyor' : 'yok';
    calanEfektler = new Set();
    for (const k of Object.keys(gecici)) gecici[k] = undefined;
    sonEtkilesim = saat;
    planaGec(a.plan);
    kanca.adim?.(a);
  }

  function kareBul(k: string): { kare: string | null; kayma: number } {
    const d = gorunum[k];
    if (!d || 'yok' in d.g) return { kare: null, kayma: 0 };
    const tt = saat - d.bas, g = d.g;
    const kayma = 'dizi' in g && g.yuru ? yuruKaymasi(t.diziler[g.dizi], g.yuru, tt) * (olcekleri[k] ?? 1) : 0;
    const gc = gecici[k];
    if (gc && saat < gc.bitis) return { kare: gc.kare, kayma };
    if (aktifSes && aktifSes.k.agiz && aktifSes.dizi) {
      const a = t.agizlar[aktifSes.k.agiz];
      const gs = saat - aktifSes.bas;
      if (a && a.katman === k && gs >= (aktifSes.k.agizBas ?? 0) && gs <= aktifSes.sure) return { kare: a.kareler[agizKaresi(aktifSes.dizi, gs, aktifSes.k.dinlenme ?? 5)], kayma };
    }
    if ('dizi' in g) return { kare: kareSec(t.diziler[g.dizi], tt).kare, kayma };
    if ('kulak' in g) {
      const konusuyor = aktifSes !== null && aktifSes.dizi !== null && sesVarMi(aktifSes.dizi, saat - aktifSes.bas);
      return { kare: konusuyor ? g.kulak[0] : g.kulak[1], kayma };
    }
    if (g.kirp && g.kirpAnlari && kirpiyorMu(g.kirpAnlari, tt)) return { kare: g.kirp, kayma };
    return { kare: g.poz, kayma };
  }
  function ciz() {
    for (const k of t.katmanlar) {
      const r = el[k.ad], { kare, kayma } = kareBul(k.ad);
      kaymalar[k.ad] = kayma;
      if (!kare) { if (!r.hidden) { r.hidden = true; gosterilen[k.ad] = ''; } continue; }
      if (gosterilen[k.ad] !== kare) { gosterilen[k.ad] = kare; r.src = cizimAdresi(kare)!; r.dataset.poz = kare; r.hidden = false; }
      r.style.transform = kayma ? 'translateX(' + kayma + 'px)' : '';
    }
  }

  const b: Baglam<O> = {
    kok, kamera, yakin: yakinIc, ust, akis,
    olcek: () => S, saat: () => saat,
    adres: ad => cizimAdresi(ad)!,
    katman: ad => el[ad],
    durum: k => ({ poz: gosterilen[k] ?? '', kayma: kaymalar[k] ?? 0 }),
    olay: (o, hedef) => { const yeni = akis.olay(o, hedef); if (yeni) adimaGir(yeni); return yeni !== null; },
    gecici: (k, kare, ms) => { gecici[k] = { kare, bitis: saat + ms }; },
    efekt: (ad, kazanc = 1, hiz = 1) => efekt(ad, kazanc, hiz),
    bostaMs: () => saat - sonEtkilesim,
    kayitMs: ad => v.kayitMs[ad] ?? 0,
  };
  kanca = t.kur?.(b) ?? {};

  const dokundu = () => { sonEtkilesim = saat; };
  function kapat() {
    durdu = true;
    removeEventListener('resize', olcekle);
    kok.removeEventListener('pointerdown', dokundu, true);
    kok.replaceChildren();
  }

  function kare(simdi: number) {
    if (durdu) return;
    const dt = Math.min(100, simdi - sonKare);
    sonKare = simdi;
    if (!sesBekliyor) {
      saat += dt;
      if (!akis.bitti) {
        for (const a of akis.ilerlet(dt)) adimaGir(a);
        const a = akis.adim;
        if (a) {
          if (adimSesi === 'bekliyor' && a.ses && akis.gecen >= (a.ses.gecikme ?? 0)) {
            const k = a.ses;
            adimSesi = 'istendi';
            sesBekliyor = true;
            void konus(k.ad, () => { sesBekliyor = false; aktifSes = { k, bas: saat, sure: v.kayitMs[k.ad] ?? 0, dizi: v.agiz[k.ad] ?? null }; });
          }
          a.efekt?.forEach((ef, i) => { if (!calanEfektler.has(i) && akis.gecen >= (ef.gecikme ?? 0)) { calanEfektler.add(i); efekt(ef.ad, ef.kazanc ?? 1); } });
        }
      }
      kanca.kare?.(dt);
      if (aktifSes && saat - aktifSes.bas > aktifSes.sure + 60) aktifSes = null;
      if (akis.bitti && !bittiBildirildi) {
        bittiBildirildi = true;
        kok.dataset.adim = 'son';
        kok.dataset.durum = 'bitti';
        if (secenek.bitince) { const sonra = secenek.bitince; kapat(); sonra(); return; }
        tekrar.hidden = false;
      }
    }
    ciz();
    requestAnimationFrame(kare);
  }

  kok.addEventListener('pointerdown', dokundu, true);
  for (const a of akis.ilerlet(0)) adimaGir(a);
  ciz();
  kok.dataset.durum = 'hazir';
  kok.dataset.plan = plan;
  secenek.hazir?.();
  requestAnimationFrame(z => { sonKare = z; requestAnimationFrame(kare); });

  if (TEST_MODU || new URLSearchParams(location.search).has('kayit')) {
    (window as unknown as Record<string, unknown>).__doktorSahne = { ad: t.ad, adim: () => akis.adim?.ad ?? 'son', saat: () => saat };
  }
}
