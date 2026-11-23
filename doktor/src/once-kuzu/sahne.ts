// "Önce Kuzu" kanıt sahnesinin yürütücüsü: akış (akis.ts) ne derse onu ekrana koyar.
// Görünen her şey Astra'nın çizimidir (assets/doktor/zipzip-diz/<ad>.webp, Paket Doktor-K1). Çizimlerden biri eksikse
// sahne açılmaz; yer tutucu yoktur. Hareket çizilmiş pozların sırayla gösterilmesidir, kodla esnetme yok.
import '../stil.css';
import './once-kuzu.css';
import { menuYasiOku } from '../../../src/engine/menu-yas';
import { TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { anaMenuyeDon } from '../../../src/uygulama';
import type { HazirDizi } from '../../../src/audio/dudak-mantik';
import { efekt, konus, sesYukle } from '../ses';
import { elKatmaniKur, merkez, suz, tutmaBaslat, uzaklik, type Nokta, type Tutma } from '../tutma';
import { agizDizisi, agizKaresi, sesVarMi } from './agiz';
import { Akis, EFEKTLER, KAYIT_MS, ONCE_KUZU, REPLIKLER, type Adim, type Gorunum, type Konusma, type Plan } from './akis';
import { AGIZ, DIZI, K1, K1_DOSYALAR, kareSec, kirpiyorMu } from './diziler';
import { Bekleme, Nabiz, atisHizi, atisKazanci, kalpAyari, yakinlik } from './kalp';
import { HEDEF, OLCEK, PERDE, SAHNE, STETOSKOP, TUVAL, kameraDonusumu, tuvalKutusu, tuvalNoktasi, type Kutu, type TuvalAdi } from './yerlesim';

const cizimler = import.meta.glob<string>('../../../assets/doktor/zipzip-diz/*.webp', { eager: true, query: '?url', import: 'default' });
const adres = (ad: string): string | undefined => cizimler['../../../assets/doktor/zipzip-diz/' + ad + '.webp'];
/** Klasörde henüz olmayan K1 çizimleri. Boşsa sahne açılabilir. */
export const eksikCizimler = (): string[] => K1_DOSYALAR.filter(ad => !adres(ad));

type Katman = 'zipzip' | 'kino' | 'yakin';
const AGIZ_KATMANI = { 'zipzip-otur': 'zipzip', 'zipzip-yakin': 'yakin', 'kino-steto': 'kino' } as const;
const KUZU_BEKLEME_MS = 600;
const BOS_MS = 6000;

const div = (sinif: string) => { const d = document.createElement('div'); d.className = sinif; return d; };
const resimEl = (sinif: string) => { const r = document.createElement('img'); r.className = sinif; r.alt = ''; r.draggable = false; r.decoding = 'sync'; return r; };
const dugme = (sinif: string, etiket: string) => { const b = document.createElement('button'); b.type = 'button'; b.className = sinif; b.setAttribute('aria-label', etiket); return b; };
function kutuyaKoy(el: HTMLElement, k: Kutu) { Object.assign(el.style, { left: k.sol + 'px', top: k.ust + 'px', width: k.g + 'px', height: k.y + 'px' }); }

export function baslat(kok: HTMLElement, secenek: { bitince?: () => void; hazir?: () => void } = {}) {
  const geri = dugme('dk-geri', 'Geri');
  geri.innerHTML = IKON.geri;
  geri.addEventListener('click', () => anaMenuyeDon());
  kok.dataset.sahne = 'once-kuzu';
  const eksik = eksikCizimler();
  if (eksik.length) {
    // Çizimler gelmeden sahne açılmaz ve ekrana hiçbir şey çizilmez.
    kok.dataset.durum = 'eksik';
    kok.dataset.eksik = String(eksik.length);
    kok.append(geri);
    console.info('Önce Kuzu: ' + eksik.length + ' çizim bekleniyor (Paket Doktor-K1):', eksik.join(', '));
    secenek.hazir?.();
    return;
  }
  kok.dataset.durum = 'yukleniyor';
  void yukle().then(v => calistir(kok, geri, v, secenek));
}

interface Yuklenen { kayitMs: Record<string, number>; agiz: Record<string, HazirDizi>; stetoskopOrani: number; }
async function yukle(): Promise<Yuklenen> {
  // Bütün çizimler çözülmeden sahne görünmez: ilk kare tam yüklü açılır, poz değişirken boş kare olmaz.
  let stetoskopOrani = 1;
  const resimler = Promise.all(K1_DOSYALAR.map(async ad => {
    const r = new Image();
    r.src = adres(ad)!;
    try { await r.decode(); } catch { await new Promise(t => { r.onload = r.onerror = t; }); }
    if (ad === K1.stetoskop && r.naturalHeight) stetoskopOrani = r.naturalWidth / r.naturalHeight;
    return r;
  }));
  const kayitMs: Record<string, number> = { ...KAYIT_MS };
  const agiz: Record<string, HazirDizi> = {};
  const sesler = Promise.all([...REPLIKLER.map(r => r.ad), ...EFEKTLER].map(async ad => {
    const b = await sesYukle(ad);
    if (!b) return;
    if (ad in KAYIT_MS) { kayitMs[ad] = b.duration * 1000; agiz[ad] = agizDizisi(b.getChannelData(0), b.sampleRate); }
  }));
  const tutulan = await resimler; // çözülmüş resimler bellekte kalsın
  (window as unknown as { __onceKuzuResimler?: unknown }).__onceKuzuResimler = tutulan;
  await sesler;
  return { kayitMs, agiz, stetoskopOrani };
}

function calistir(kok: HTMLElement, geri: HTMLElement, v: Yuklenen, secenek: { bitince?: () => void; hazir?: () => void }) {
  let durdu = false;
  const yasMenu = new URLSearchParams(location.search).get('yas');
  const y = menuYasiOku();
  const kucuk = yasMenu ? yasMenu === '2-3' : y === 2 || y === 3;
  const ayar = kalpAyari(kucuk);
  const azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ——— katmanlar
  const sahne = div('dk-sahne ok-sahne');
  const kamera = div('ok-kamera');
  const fon = resimEl('ok-fon'); fon.src = adres(K1.fon)!;
  const perde = resimEl('ok-katman'); perde.src = adres(K1.perde[0])!; kutuyaKoy(perde, PERDE);
  const masa = resimEl('ok-katman'); masa.src = adres(K1.masa)!; kutuyaKoy(masa, tuvalKutusu('masa'));
  const kinoEl = resimEl('ok-katman'); kutuyaKoy(kinoEl, tuvalKutusu('kino'));
  const zipzipEl = resimEl('ok-katman'); kutuyaKoy(zipzipEl, tuvalKutusu('zipzip'));
  const avuc = dugme('ok-hedef ok-avuc', 'Stetoskop');
  const kuzuIsareti = div('ok-isaret');
  const yakin = div('ok-yakin');
  const yakinIc = div('ok-yakin-ic');
  const yakinEl = resimEl('ok-katman'); kutuyaKoy(yakinEl, tuvalKutusu('yakin'));
  const kalpIsareti = div('ok-isaret');
  const gogusKutusu = div('ok-isaret');
  const dinlenme = dugme('ok-hedef ok-dinlenme', 'Stetoskop');
  const dinlenmeResim = resimEl('dk-ters'); dinlenmeResim.src = adres(K1.stetoskop)!;
  const nabizEl = div('dk-nabiz');
  const tekrar = dugme('dk-tekrar', 'Yeniden oyna');
  tekrar.innerHTML = IKON.tekrar; tekrar.hidden = true;
  tekrar.addEventListener('click', () => location.reload());

  const noktaKoy = (el: HTMLElement, tuval: TuvalAdi, x: number, y2: number, yaricapPx = 0) => {
    const p = tuvalNoktasi(tuval, x, y2), r = yaricapPx * TUVAL[tuval].olcek;
    Object.assign(el.style, { left: p.x - r + 'px', top: p.y - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px' });
  };
  noktaKoy(avuc, 'kino', HEDEF.kinoAvuc.x, HEDEF.kinoAvuc.y, HEDEF.kinoAvuc.yaricap);
  noktaKoy(kuzuIsareti, 'zipzip', HEDEF.kuzuGogus.x, HEDEF.kuzuGogus.y);
  noktaKoy(kalpIsareti, 'yakin', HEDEF.kalp.x, HEDEF.kalp.y);
  { const a = tuvalNoktasi('yakin', HEDEF.gogus.sol, HEDEF.gogus.ust), o = TUVAL.yakin.olcek;
    kutuyaKoy(gogusKutusu, { sol: a.x, ust: a.y, g: HEDEF.gogus.g * o, y: HEDEF.gogus.y * o }); }
  { const b = STETOSKOP.boy.yakin, d = HEDEF.stetoskopDinlenme;
    kutuyaKoy(dinlenme, { sol: d.x - STETOSKOP.uc[0] * b, ust: d.y - STETOSKOP.uc[1] * b, g: b, y: b / v.stetoskopOrani }); }
  dinlenme.append(dinlenmeResim);
  avuc.hidden = true; dinlenme.hidden = true; yakin.hidden = true;
  kamera.append(fon, perde, masa, kinoEl, zipzipEl, avuc, kuzuIsareti);
  yakinIc.append(yakinEl, kalpIsareti, gogusKutusu, dinlenme);
  yakin.append(yakinIc);
  sahne.append(kamera, yakin);
  kok.append(sahne, nabizEl, geri, tekrar);
  elKatmaniKur(kok);

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
  let plan: Plan = 'genis';
  const donusum = (p: Plan) => { const d = kameraDonusumu(p); return 'translate(' + d.tx + 'px,' + d.ty + 'px) scale(' + d.s + ')'; };
  const bulanik = (p: Plan) => (p === 'yakin' ? 'blur(6px) brightness(.93)' : 'blur(0px) brightness(1)');
  kamera.style.transform = donusum(plan);
  function planaGec(yeni: Plan) {
    if (yeni === plan) return;
    const eski = plan; plan = yeni;
    kok.dataset.plan = yeni;
    const yakinaGiris = yeni === 'yakin', yakindanCikis = eski === 'yakin';
    const t = azHareket || TEST_MODU ? 1 : yakinaGiris || yakindanCikis ? 950 : 600;
    const e = 'cubic-bezier(.5,0,.2,1)';
    kamera.getAnimations().forEach(a => a.cancel());
    kamera.style.transform = donusum(yeni); kamera.style.filter = bulanik(yeni);
    kamera.animate([{ transform: donusum(eski), filter: bulanik(eski) }, { transform: donusum(yeni), filter: bulanik(yeni) }], { duration: t, easing: e });
    if (yakinaGiris || yakindanCikis) {
      // yakın çizim Zıpzıp'ın göğsünden büyüyerek gelir (kesme yok); çıkarken aynı yoldan küçülür
      const g = tuvalNoktasi('zipzip', 650, 860), o = kameraDonusumu(eski === 'yakin' ? yeni : eski);
      const bas = { x: g.x * o.s + o.tx, y: g.y * o.s + o.ty }, a0 = 0.42;
      const kucukHal = 'translate(' + (bas.x - SAHNE.g / 2 * a0) + 'px,' + (bas.y - SAHNE.y / 2 * a0) + 'px) scale(' + a0 + ')';
      yakin.hidden = false;
      yakinIc.getAnimations().forEach(a => a.cancel()); yakin.getAnimations().forEach(a => a.cancel());
      if (yakinaGiris) {
        yakinIc.animate([{ transform: kucukHal }, { transform: 'none' }], { duration: t, easing: e });
        yakin.animate([{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], { duration: t, easing: 'ease-out' });
      } else {
        yakinIc.animate([{ transform: 'none' }, { transform: kucukHal }], { duration: t, easing: e });
        void yakin.animate([{ opacity: 1 }, { opacity: 0, offset: 0.7 }, { opacity: 0 }], { duration: t, easing: 'ease-in' }).finished
          .then(() => { if (plan !== 'yakin') yakin.hidden = true; }).catch(() => undefined);
      }
    }
  }

  // ——— zaman, görünüm, ses
  const akis = new Akis(ONCE_KUZU, ad => v.kayitMs[ad] ?? 0);
  let saat = 0;                       // sahne saati (ms): ses bağlamı dokunuş beklerken durur
  const gorunum: Record<Katman, { g: Gorunum; bas: number } | null> = { zipzip: null, kino: null, yakin: null };
  const elKatman: Record<Katman, HTMLImageElement> = { zipzip: zipzipEl, kino: kinoEl, yakin: yakinEl };
  const gosterilen: Record<Katman, string> = { zipzip: '', kino: '', yakin: '' };
  let aktifSes: { k: Konusma; bas: number; sure: number; dizi: HazirDizi | null } | null = null;
  let sesBekliyor = false;            // konuş çağrıldı, ses henüz başlamadı
  let adimSesi: 'yok' | 'bekliyor' | 'istendi' = 'yok';
  let calanEfektler = new Set<number>();
  let atisBitis = 0;                  // göğsün kabarık görüneceği son an (saat)
  let gecici: Partial<Record<Katman, { kare: string; bitis: number }>> = {};  // ipucu için kısa poz
  let sonEtkilesim = 0;
  let stetoskop: 'kinoda' | 'avucta' | 'elde' | 'dinlenmede' = 'kinoda';
  let geriAlindi = false;             // Kuzu dinlendikten sonra stetoskop Kino'nun avucuna döndü
  let tutma: Tutma | null = null;
  let tutmaKaynagi: HTMLElement | null = null;   // parmağı yakalayan düğme: tutulurken gizlenmez (yakalama kopmasın)
  let sonKare = performance.now();
  const kuzuBekleme = new Bekleme(KUZU_BEKLEME_MS);
  const kalpBekleme = new Bekleme(ayar.beklemeMs);
  const nabiz = new Nabiz();

  const goster = (k: Katman, ad: string) => {
    if (gosterilen[k] === ad) return;
    gosterilen[k] = ad;
    elKatman[k].src = adres(ad)!;
    elKatman[k].dataset.poz = ad;
  };
  function adimaGir(a: Adim) {
    kok.dataset.adim = a.ad;
    for (const k of ['zipzip', 'kino', 'yakin'] as const) { const g = a[k]; if (g) gorunum[k] = { g, bas: saat }; }
    adimSesi = a.ses ? 'bekliyor' : 'yok';
    calanEfektler = new Set();
    gecici = {};
    sonEtkilesim = saat;
    planaGec(a.plan);
    kuzuBekleme.sifirla();
    if (a.ad === 'k3-al') { stetoskop = 'avucta'; geriAlindi = false; }
    if (a.plan === 'yakin' && stetoskop !== 'elde') stetoskop = 'dinlenmede';
    if (a.plan !== 'yakin' && stetoskop === 'dinlenmede') stetoskop = 'kinoda';
    if (a.ad === 'k5-ac') { if (tutma) { void tutma.bitir('yerinde'); tutma = null; tutmaKaynagi = null; } stetoskop = 'kinoda'; }
    hedefleriGuncelle();
  }
  function hedefleriGuncelle() {
    const a = akis.adim;
    const elde = tutma !== null ? tutmaKaynagi : null;
    avuc.hidden = elde !== avuc && !(stetoskop === 'avucta' && a !== null && (a.ad === 'k3-al' || a.ad === 'k3-kuzu'));
    dinlenme.hidden = elde !== dinlenme && !(stetoskop === 'dinlenmede' && plan === 'yakin' && a !== null && ['k4-dinle', 'k4-serin', 'k4-kalp', 'k4-serbest'].includes(a.ad));
  }

  function kareBul(k: Katman): string | null {
    const d = gorunum[k];
    if (!d) return null;
    const t = saat - d.bas, g = d.g;
    const gc = gecici[k];
    if (gc && saat < gc.bitis) return gc.kare;
    // konuşma: ağız dizisi olan duruşta dudak sese oturur
    if (aktifSes && aktifSes.k.agiz && AGIZ_KATMANI[aktifSes.k.agiz] === k && aktifSes.dizi) {
      const gs = saat - aktifSes.bas;
      if (gs >= (aktifSes.k.agizBas ?? 0) && gs <= aktifSes.sure) return AGIZ[aktifSes.k.agiz][agizKaresi(aktifSes.dizi, gs, aktifSes.k.dinlenme ?? 5)];
    }
    if ('dizi' in g) return kareSec(DIZI[g.dizi], t).kare;
    if ('kulak' in g) {
      const konusuyor = aktifSes !== null && aktifSes.dizi !== null && sesVarMi(aktifSes.dizi, saat - aktifSes.bas);
      return konusuyor ? g.kulak[0] : g.kulak[1];
    }
    if (k === 'kino' && g.poz === K1.kinoEgilBos && (stetoskop === 'avucta' || geriAlindi)) return K1.kinoEgil[3];
    if (k === 'yakin' && g.poz === K1.yakinDinle && saat < atisBitis) return K1.yakinGogus;
    if (g.kirp && g.kirpAnlari && kirpiyorMu(g.kirpAnlari, t)) return g.kirp;
    return g.poz;
  }

  // ——— stetoskop
  const tanim = (b: number) => ({ resimAdresi: adres(K1.stetoskop)!, oran: v.stetoskopOrani, boyPx: b * S, tut: [STETOSKOP.uc[0], STETOSKOP.uc[1] + 0.04] as [number, number], uc: STETOSKOP.uc, ters: true });
  function stetoskobuTut(kaynak: HTMLElement, boy: number, e?: PointerEvent): Tutma {
    const t = tutmaBaslat(kaynak, tanim(boy), { birak: () => { stetoskopBirakildi(t); return true; } }, e);
    tutma = t;
    tutmaKaynagi = kaynak;
    stetoskop = 'elde';
    sonEtkilesim = saat;
    hedefleriGuncelle();
    return t;
  }
  function stetoskopBirakildi(t: Tutma) {
    if (tutma === t) { tutma = null; tutmaKaynagi = null; }
    void t.bitir('yerinde');
    const a = akis.adim;
    if (plan === 'yakin') stetoskop = 'dinlenmede';
    else if (a && a.ad === 'k3-kuzu') stetoskop = 'avucta';       // Kuzu dinlenmeden bırakıldı: Kino'nun avucuna döner
    else { stetoskop = 'kinoda'; geriAlindi = true; }
    hedefleriGuncelle();
  }
  const kuzuNoktasi = () => merkez(kuzuIsareti);
  const kalpNoktasi = () => merkez(kalpIsareti);
  const gogusteMi = (p: Nokta) => { const r = gogusKutusu.getBoundingClientRect(); return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom; };

  function avuctanAl(e?: PointerEvent) {
    const a = akis.adim;
    if (!a || stetoskop !== 'avucta' || (a.ad !== 'k3-al' && a.ad !== 'k3-kuzu')) return;
    if (e) { if (e.button !== 0) return; e.preventDefault(); }
    if (a.ad === 'k3-al') { const yeni = akis.olay('steto-alindi'); if (yeni) adimaGir(yeni); }
    const t = stetoskobuTut(avuc, STETOSKOP.boy.orta, e);
    if (!e) void suz(t, kuzuNoktasi(), 700);
  }
  avuc.addEventListener('pointerdown', e => avuctanAl(e));
  avuc.addEventListener('click', e => { if (e.detail === 0) avuctanAl(); });
  function dinlenmedenAl(e?: PointerEvent) {
    if (stetoskop !== 'dinlenmede') return;
    if (e) { if (e.button !== 0) return; e.preventDefault(); }
    const t = stetoskobuTut(dinlenme, STETOSKOP.boy.yakin, e);
    if (!e) void suz(t, kalpNoktasi(), 900);
  }
  dinlenme.addEventListener('pointerdown', e => dinlenmedenAl(e));
  dinlenme.addEventListener('click', e => { if (e.detail === 0) dinlenmedenAl(); });

  function cocukAdimi(dt: number) {
    const a = akis.adim;
    if (!a) return;
    const uc = tutma && !tutma.birakti ? tutma.uc() : null;
    if (a.ad === 'k3-kuzu') {
      const ustunde = uc !== null && uzaklik(uc, kuzuNoktasi()) <= HEDEF.kuzuGogus.yaricap * OLCEK * kameraDonusumu('orta').s * S;
      if (kuzuBekleme.adim(ustunde, dt)) { const yeni = akis.olay('kuzu-dinlendi'); if (yeni) adimaGir(yeni); }
      return;
    }
    if (plan !== 'yakin') return;
    if (a.ad === 'k4-dinle' && uc && gogusteMi(uc)) { const yeni = akis.olay('gogse-degdi'); if (yeni) adimaGir(yeni); return; }
    if (a.ad !== 'k4-kalp' && a.ad !== 'k4-serbest') return;
    const d = uc ? uzaklik(uc, kalpNoktasi()) : Infinity;
    const yk = uc && gogusteMi(uc) ? Math.max(0.12, yakinlik(d, 300 * S)) : 0;
    const atis = nabiz.adim(saat, yk);
    if (atis !== null) {
      efekt('e1-gum', atisKazanci(atis), atisHizi(atis));
      atisBitis = saat + 140;
      if (!azHareket) nabizEl.animate([{ opacity: 0.12 + 0.5 * atis * atis }, { opacity: 0 }], { duration: 420, easing: 'ease-out' });
    }
    if (a.ad === 'k4-kalp' && kalpBekleme.adim(d <= ayar.yaricap * S, dt)) {
      efekt('e1-gum', 1.2, 1.05);
      const yeni = akis.olay('kalp-tutuldu'); if (yeni) adimaGir(yeni);
    }
  }

  /** Çocuk bir süre bir şey yapmazsa karakter çizilmiş bir pozla yol gösterir (ok, yazı, esnetme yok). */
  function ipucu() {
    const a = akis.adim;
    if (!a || a.bitis.tur !== 'cocuk' || stetoskop === 'elde' || saat - sonEtkilesim < BOS_MS) return;
    sonEtkilesim = saat;
    if (a.ad === 'k3-al') gecici.kino = { kare: K1.kinoEgil[2], bitis: saat + 220 };          // Kino stetoskobu bir kez daha uzatır
    else if (a.ad === 'k3-kuzu') gecici.zipzip = { kare: K1.zipzipSaklan[2], bitis: saat + 260 };  // Zıpzıp'ın kulakları oynar
    else gecici.yakin = { kare: K1.yakinBak, bitis: saat + 700 };                              // Zıpzıp bize bakar
  }

  // ——— perde: iki çizim, arada bir dalgalanır
  const perdeKaresi = () => (saat % 4600 > 4000 ? K1.perde[1] : K1.perde[0]);
  let perdeGosterilen = K1.perde[0];

  function kare(simdi: number) {
    if (durdu) return;
    const dt = Math.min(100, simdi - sonKare);
    sonKare = simdi;
    if (!sesBekliyor && !akis.bitti) {
      saat += dt;
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
        cocukAdimi(dt);
        ipucu();
      }
      if (aktifSes && saat - aktifSes.bas > aktifSes.sure + 60) aktifSes = null;
      if (akis.bitti) {
        kok.dataset.adim = 'son'; kok.dataset.durum = 'bitti';
        // zincirde: sahne kapanır, sıradaki açılır
        if (secenek.bitince) { durdu = true; removeEventListener('resize', olcekle); kok.replaceChildren(); secenek.bitince(); return; }
        tekrar.hidden = false;
      }
    }
    ciz();
    requestAnimationFrame(kare);
  }
  function ciz() {
    for (const k of ['zipzip', 'kino', 'yakin'] as const) { const ad = kareBul(k); if (ad) goster(k, ad); }
    const p = perdeKaresi();
    if (p !== perdeGosterilen && !azHareket) { perdeGosterilen = p; perde.src = adres(p)!; }
  }

  kok.addEventListener('pointerdown', () => { sonEtkilesim = saat; }, { capture: true });
  // İlk kare: ilk adımın pozları yerinde açılır.
  for (const a of akis.ilerlet(0)) adimaGir(a);
  ciz();
  kok.dataset.durum = 'hazir';
  kok.dataset.plan = plan;
  secenek.hazir?.();
  requestAnimationFrame(t => { sonKare = t; requestAnimationFrame(kare); });

  // Test ve video kaydı için okuma (oyunun işleyişini değiştirmez): ?test ya da ?kayit ile.
  if (TEST_MODU || new URLSearchParams(location.search).has('kayit')) {
    (window as unknown as { __onceKuzu: unknown }).__onceKuzu = {
      adim: () => akis.adim?.ad ?? 'son', saat: () => saat, stetoskop: () => stetoskop,
      nokta: (ad: string): Nokta | null => (ad === 'kuzu' ? kuzuNoktasi() : ad === 'kalp' ? kalpNoktasi() : ad === 'avuc' ? merkez(avuc) : ad === 'dinlenme' ? merkez(dinlenme) : null),
      uc: () => (tutma && !tutma.birakti ? tutma.uc() : null),
    };
  }
}
