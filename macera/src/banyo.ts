/**
 * Bölüm: Mino Banyo Yapmıyor! (senaryo: ekip/senaryo/mino-banyo.md, 8 sahne)
 * Mino ile Kino çamura bulanmış gelir. Kino banyoya bayılır, Mino sudan kaçar. Çocuk ikisini de yıkar:
 * 1 çamur bul → 2 fular as + saklanan Mino'yu bul → 3 suyu ılık yap, dolunca kapat → 4 köpük + üfleyerek baloncuk
 * (Mino baloncuk kovalarken ŞLAP! diye küvete düşer) → 5 şampuanla ovalayarak köpürt, gözleri kapat, köpük saç →
 * 6 duşla durula, Kino'yla ulu, tıpayı çek → 7 havluyla kurula, silkelenince ekranı sil, pofuduk Mino'yu tara →
 * 8 toplan, fularları tak, buğulu aynayı sil, "Bir daha çamur?" "Hayııır!", öğüt.
 *
 * Her sesli görevin (üfleme, uluma) parmak karşılığı var. Her görevde 2 yanlışta ya da 12 sn'de parmak ipucu;
 * 3-4 yaşta 3. denemede kabul. Oyun kilitlenmez. Ses algılama eşikleri kilitli (ekip/SES-SISTEMI.md): yalnız
 * mevcut Ufleme / Perde kullanılır, kolaylık oyunun hızından verilir.
 */
import '../../src/karakter/karakter.css';
import './banyo.css';
import B from '../../content/macera-banyo.json';
import { efekt, konus } from '../../src/audio/ses';
import { muzikBaslat, muzikDurdur } from '../../src/audio/muzik';
import { durum } from '../../src/engine/ilerleme';
import { minoHalleriYukle } from '../../src/mino/mino';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { Perde, sesVar, Ufleme } from '../../orman/src/gorev';
import { kulak } from '../../orman/src/kulak';
import { davul } from '../../orman/src/sesler';
import { resimSesi, resimSesiHazirla } from '../../canlan/src/ses';
import type { BolumArayuz } from './dogumgunu';
import { Sahne } from './sahne';
import { ASKI_TOPUZ, BANYO_ORAN, banyoAdres, esya, fularSvg, RAF_YUZ, SEPET_KENAR, TABURE_YUZ } from './banyo-gorsel';
import { Kisi, kopukHtml } from './banyo-karakter';
import { Bugu, EkranDamlalari, geriDon, icinde, merkez, ovala, ParmakIpucu, Parcaciklar, surukle, yansiYazi, type IpucuTuru } from './banyo-efekt';
import {
  BOLUM_BENIM,
  baloncukBoyu,
  bolgeCoz,
  camurPlani,
  Deneme,
  dolumHizi,
  gerekenBaloncuk,
  ILIK,
  KOCAMAN_SURE,
  kucukMu,
  Ovalama,
  OVALAMA_PAY,
  ovalamaYolu,
  SERT_GUC,
  SERT_SURE,
  sicaklik,
  siraKontrol,
  sonrakiAciklik,
  suDurumu,
  taramaMi,
  TASMA,
  ULUMA_HEDEF,
  ulumaKonturu,
  ulumaFrekansi,
  type Bolum,
  type BolgeId,
  type SuDurumu,
} from './banyo-mantik';
import { BanyoMuzik, bs, CanliUluma, SuSesi, ulu } from './banyo-ses';

const IPTAL = Symbol('iptal');
/** Kişinin kutusunun alt kenarının altını gizler (saklambaçta dalarken / çıkarken kutunun altı = örtünün çizgisi) */
const altKirp = (el: HTMLElement) => `polygon(-600px -1200px, 1600px -1200px, 1600px ${el.offsetHeight}px, -600px ${el.offsetHeight}px)`;
const r = (a: number, b: number) => a + Math.random() * (b - a);

/** Sahnedeki yerleşim (x: sahne genişliğinin %'si, y: alttan %, w: --b birimi); zemin: ayakların bastığı yer */
const ZEMIN = 4;
/**
 * Küvet çerçevesinde (kuvet-arka / kuvet-on, 2432×1792; assets/banyo/hizalama.json) oranlar (üstten):
 * ayak tabanı, ön kenarın üst iç çizgisi, suyun karakteri kestiği çizgi; arka kenarın üst çizgisi ortada.
 */
const KV = { oran: 1792 / 2432, ayak: 0.8415, onKenar: 0.385, suOrta: 0.33, arkaOrta: 0.27 };
/** Arka kenarın üst çizgisi (küvetin u ∈ 0..1 yatay konumunda, üstten oran): ortada alçak, uçlarda yüksek */
const arkaKenar = (u: number) => KV.arkaOrta - 0.6 * (u - 0.5) ** 2;
const KISI_W = 27;
const KISI_ORAN = 1790 / 1360;
const MINO_KUVET_X = 34;
const KINO_KUVET_X = 66;

export async function banyoBolumu(kok: HTMLElement, ui: BolumArayuz): Promise<void> {
  const yas = durum.i.yas ?? 4;
  const kucuk = kucukMu(yas);
  // Mino'nun sırılsıklam / pofuduk çizimleri (ağır, tembel paket) ilk kullanımdan önce hazır olsun
  void minoHalleriYukle();

  // ================================================================ sahne kurulumu
  const sahne = new Sahne('banyo/arkaplan');
  sahne.el.classList.add('bn-sahne');
  sahne.dunya.querySelector<HTMLElement>('.mc-oda')?.style.setProperty('--resim', `url("${banyoAdres('arkaplan')}")`);
  kok.append(sahne.el);
  const parca = new Parcaciklar();
  sahne.dunya.append(parca.el);
  const damla = new EkranDamlalari();
  const ipEl = new ParmakIpucu();
  const sira = h(
    'div.bn-sira',
    { 'aria-hidden': 'true' },
    ...(['islat', 'kopurt', 'durula', 'kurula'] as const).map((a) => h(`i.bn-sira-${a}`, { 'data-adim': a })),
  );
  sahne.el.append(damla.el, sira, ipEl.el);

  // ölçüler: --b (CSS ile aynı) ve sahne yüksekliğine göre yüzdeler
  const W = () => sahne.el.clientWidth || innerWidth;
  const H = () => sahne.el.clientHeight || innerHeight;
  const bPx = () => Math.min(innerWidth * 0.013, innerHeight * 0.0075);
  /** b birimi → sahne yüksekliğinin %'si */
  const bY = (n: number) => ((n * bPx()) / H()) * 100;
  /** b birimi → sahne genişliğinin %'si */
  const bX = (n: number) => ((n * bPx()) / W()) * 100;
  /** dikey ekran (telefon / dikey tablet): sahne yatay çizildiği için üstte boş duvar kalır */
  const kucukEkranMi = W() / H() < 0.8;
  /**
   * Kameranın taban yakınlığı: dikeyde küvete yaklaşılır, duvarın boş üstü azalır (alttan sabit). Karakterler
   * kadrajdan taşacaksa kadraj koruması (kam) odağı kaydırır ya da yakınlığı düşürür.
   */
  const taban = kucukEkranMi ? 1.22 : 1;
  const KUVET_W = 66;
  const kuvetH = bY(KUVET_W * KV.oran);
  const KUVET = { x: 50, y: ZEMIN - kuvetH * (1 - KV.ayak), w: KUVET_W };
  const kisiH = bY(KISI_W * KISI_ORAN);
  const onKenarY = KUVET.y + kuvetH * (1 - KV.onKenar);
  /** arka kenarın üstü, sahnedeki x'e göre (alttan %) */
  const arkaUst = (x: number) => KUVET.y + kuvetH * (1 - arkaKenar(0.5 + (x - KUVET.x) / bX(KUVET_W)));
  const arkaUstY = arkaUst(50);
  const suCizgiY = KUVET.y + kuvetH * (1 - KV.suOrta);
  const AYAKTA_Y = onKenarY - kisiH * 0.03;
  const OTUR_Y = onKenarY - kisiH * 0.36;

  /** Arka plan resmindeki bir nokta (1344×768) sahnede nerede, görünüyor mu (background: cover, center 82%) */
  const arkaNokta = (ix: number, iy: number) => {
    const w = W();
    const hh = H();
    const s = Math.max(w / 1344, hh / 768);
    const X = (w - 1344 * s) * 0.5 + ix * s;
    const Y = (hh - 768 * s) * 0.82 + iy * s;
    return { x: (X / w) * 100, y: ((hh - Y) / hh) * 100, gorunur: X > w * 0.04 && X < w * 0.96 && Y > hh * 0.12 && Y < hh };
  };
  /** Ekran noktası → dünya konumu (%; y alttan) */
  const dunyada = (cx: number, cy: number) => {
    const k = sahne.dunya.getBoundingClientRect();
    return { x: ((cx - k.left) / k.width) * 100, y: ((k.bottom - cy) / k.height) * 100 };
  };

  // --- duvar: askılık ve raf (arka plandaki görünüyorsa onlar, yoksa çizilir)
  const askiArka = [arkaNokta(1100, 430), arkaNokta(1300, 430)];
  const rafArka = [arkaNokta(1080, 315), arkaNokta(1300, 315)];
  const askiVar = askiArka.every((n) => n.gorunur);
  const rafVar = rafArka.every((n) => n.gorunur);
  /** duvar eşyası sağ kenardan taşmasın: dikeyde kamera yaklaşınca da (≈1.3 kat) kadrajda kalacak kadar içeri alınır */
  const duvarX = (x: number, w: number) => Math.min(x, kucukEkranMi ? 50 + 36 - bX(w) / 2 : 100 - bX(w) / 2 - 3);
  let askiNokta: [{ x: number; y: number }, { x: number; y: number }];
  if (askiVar) askiNokta = [arkaNokta(1128, 425), arkaNokta(1218, 432)];
  else {
    // askılık (üç topuzlu ahşap çubuk): fularlar iki yandaki topuza asılır
    const AW = 28;
    const ax = duvarX(79, AW);
    const ay = kucukEkranMi ? 50 : 57;
    sahne.koy(h('div.bn-askilik', {}, esya('askilik', '', 'Askılık')), { x: ax, y: ay, w: AW, z: 1 });
    const topuzY = ay + bY(AW * BANYO_ORAN.askilik) * (1 - ASKI_TOPUZ.y);
    askiNokta = [
      { x: ax + bX(AW) * (ASKI_TOPUZ.x[0] - 0.5), y: topuzY },
      { x: ax + bX(AW) * (ASKI_TOPUZ.x[2] - 0.5), y: topuzY },
    ];
  }
  const askiHedef = sahne.koy(h('div.bn-askilik-hedef'), { x: (askiNokta[0].x + askiNokta[1].x) / 2, y: askiNokta[0].y - 9, w: 34, z: 1 });
  let rafNokta: { x: number; y: number };
  if (rafVar) rafNokta = arkaNokta(1170, 312);
  else {
    // raf (ördeğin yeri): ördek rafın üst yüzüne oturur
    const RW = 22;
    const rx = duvarX(79, RW);
    const ry = kucukEkranMi ? 62 : 68;
    sahne.koy(h('div.bn-raf', {}, esya('raf', '', 'Raf')), { x: rx, y: ry, w: RW, z: 1 });
    rafNokta = { x: rx + bX(RW) * (RAF_YUZ.x - 0.5), y: ry + bY(RW * BANYO_ORAN.raf) * (1 - RAF_YUZ.y) };
  }
  const rafHedef = sahne.koy(h('div.bn-raf-hedef'), { x: rafNokta.x, y: rafNokta.y - 2, w: 30, z: 1 });

  // --- eşyalar
  // duş perdesi (süs; sağ kenarı eski yerinde)
  const PERDE_W = 30;
  const perdeSag = 11 + bX(24) / 2;
  sahne.koy(h('div.bn-perde', {}, esya('dus-perdesi', '', 'Duş perdesi')), { x: perdeSag - bX(PERDE_W) / 2, y: 3, w: PERDE_W, z: 7 });
  // tabure: havlular üstünde durur (Mino'nun üçüncü saklandığı yer: tabure ve havluların arkası)
  const TABURE_W = 19;
  const tabureUst = 1 + bY(TABURE_W * BANYO_ORAN.tabure) * (1 - TABURE_YUZ.y);
  sahne.koy(h('div.bn-tabure', {}, esya('tabure', '', 'Tabure')), { x: 22, y: 1, w: TABURE_W, z: 7 });
  const kuvetArka = sahne.koy(h('div.bn-kuvet.bn-kuvet-arka', {}, esya('kuvet-arka', '', 'Küvet')), { ...KUVET, z: 3 });
  const suArka = sahne.koy(h('div.bn-kuvet.bn-su.bn-su-arka', {}, h('div.bn-su-agiz', {}, h('div.bn-su-dolgu', {}, h('i.bn-su-yuzey')))), { ...KUVET, z: 3 });
  const suOn = sahne.koy(h('div.bn-kuvet.bn-su.bn-su-on', {}, h('div.bn-su-agiz', {}, h('div.bn-su-dolgu', {}, h('i.bn-su-yuzey')))), { ...KUVET, z: 5 });
  const kopukYuzey = sahne.koy(h('div.bn-kopuk-yuzey', { html: kopukSerisi() }), { x: 50, y: suCizgiY - bY(5), w: 58, z: 5 });
  const kuvetOn = sahne.koy(h('div.bn-kuvet.bn-kuvet-on', {}, esya('kuvet-on', '', '')), { ...KUVET, z: 6 });
  const tasma = sahne.koy(h('div.bn-tasma', {}, h('i'), h('i'), h('i')), { x: 50, y: KUVET.y, w: 70, z: 6 });
  const birikinti = sahne.koy(h('div.bn-birikinti'), { x: 50, y: 0.5, w: 96, z: 2 });
  kuvetArka.dataset.bn = 'kuvet';
  const MUS_X = { kirmizi: 24, agiz: 37, mavi: 50 };
  const musluklar = {
    kirmizi: sahne.koy(h('div.bn-musluk', { 'data-renk': 'kirmizi', role: 'button', 'aria-label': 'Sıcak su musluğu' }, h('i.bn-musluk-halka'), esya('musluk-kirmizi')), { x: MUS_X.kirmizi, y: arkaUst(MUS_X.kirmizi) - bY(1.2), w: 9.5, z: 3 }),
    mavi: sahne.koy(h('div.bn-musluk', { 'data-renk': 'mavi', role: 'button', 'aria-label': 'Soğuk su musluğu' }, h('i.bn-musluk-halka'), esya('musluk-mavi')), { x: MUS_X.mavi, y: arkaUst(MUS_X.mavi) - bY(1.2), w: 9.5, z: 3 }),
  };
  // ağızlık (ağzı solda, aşağı bakar): sağ ayağı kenarda durur
  const agizY = arkaUst(MUS_X.agiz) - bY(0.8);
  sahne.koy(h('div.bn-agizlik', {}, esya('agizlik')), { x: MUS_X.agiz, y: agizY, w: 10, z: 3 });
  const agizAgziY = agizY + bY(10 * (399 / 729)) * 0.42;
  const akis = sahne.koy(h('div.bn-akis', {}, h('i')), { x: MUS_X.agiz - bX(10) * 0.4, y: suCizgiY - bY(2), w: 2.4, z: 5 });
  akis.style.height = `${Math.max(2, agizAgziY - (suCizgiY - bY(2)))}%`;
  const isiGosterge = kucuk
    ? null
    : sahne.koy(h('div.bn-isi', {}, h('i.bn-isi-yesil', { style: `--a:${ILIK.alt};--u:${ILIK.ust}` }), h('div.bn-isi-yol', {}, h('i.bn-isi-ok'))), { x: MUS_X.agiz, y: agizY + bY(15), w: 26, z: 4 });
  const zincir = sahne.koy(h('div.bn-zincir', { role: 'button', 'aria-label': 'Tıpanın zinciri' }, h('i.bn-zincir-halka')), { x: 34, y: onKenarY - bY(9), w: 4, z: 9 });
  zincir.style.height = `${bY(9) + 1}%`;
  // ördek küvetin ARKA kenarında durur: küvetteki Kino'nun arkasında kalır (eskiden göğsünün önüne biniyordu)
  const ordek = sahne.koy(h('div.bn-ordek-kap', {}, h('div.bn-ordek', {}, esya('ordek', '', 'Lastik ördek'))), { x: 77, y: arkaUst(77) - bY(1.2), w: 9, z: 3 });
  // çamaşır sepeti: yerde, karakterlerin ayak çizgisinin biraz arkasında (kimseyi örtmez), kadrajda tam görünür.
  // İki katman: arka (sap + iç) ve ön kenar (hasır gövde): havlu ve saklanan Mino ikisinin arasına düşer.
  const SEPET_W = 22;
  const SEPET_X = duvarX(87, SEPET_W);
  const SEPET_Y = 3.4;
  const sepet = sahne.koy(h('div.bn-sepet', {}, esya('sepet', '', 'Çamaşır sepeti')), { x: SEPET_X, y: SEPET_Y, w: SEPET_W, z: 6 });
  const sepetOn = sahne.koy(h('div.bn-sepet.bn-sepet-on', { 'aria-hidden': 'true' }, esya('sepet', '', '')), { x: SEPET_X, y: SEPET_Y, w: SEPET_W, z: 8 });
  /** sepetin ön kenarının üst çizgisi (dünya y, alttan %): içine düşen bunun altında görünmez */
  const sepetKenarY = () => SEPET_Y + bY(SEPET_W * BANYO_ORAN.sepet) * (1 - SEPET_KENAR);
  const havluMavi = sahne.koy(h('div.bn-havlu', { 'data-renk': 'mavi' }, esya('havlu-mavi', '', 'Mavi havlu')), { x: 22, y: tabureUst, w: 17, z: 7 });
  const havluTuruncu = sahne.koy(h('div.bn-havlu', { 'data-renk': 'turuncu' }, esya('havlu-turuncu', '', 'Turuncu havlu')), { x: 21, y: tabureUst + bY(17 * 0.36), w: 17, z: 7 });
  const top = sahne.koy(h('div.bn-top', {}, esya('top', '', 'Top')), { x: -10, y: 1.5, w: 7, z: 8 });

  // --- karakterler
  const M = new Kisi('mino');
  const KN = new Kisi('kino');
  for (const k of [M, KN]) {
    sahne.koy(k.el, { x: k === M ? 120 : -20, y: 3, w: KISI_W, z: 8 });
  }
  await KN.hazir();
  M.isabetleriKur();
  KN.isabetleriKur();
  M.fular(true);
  KN.fular(true);

  // --- kamera ve kadraj koruması
  // Sahne kodu çekimi ister (odak x/y, yakınlık z). Mino ile Kino (ve o an gereken eşyalar) kadrajın dışına
  // taşacaksa odak yana kayar; ikisi birden sığmıyorsa yakınlık düşer. Karakter yürümeye başlayınca yeniden bakılır.
  let cekim = { x: 50, y: 96, z: 1, tut: [] as HTMLElement[], kisiler: [M, KN] };
  let uygulanan = { x: 50, y: 96, z: 1 };
  const kadrajHesap = () => {
    let l = Infinity;
    let r = -Infinity;
    const ekle = (x: number, yari: number) => {
      l = Math.min(l, x - yari);
      r = Math.max(r, x + yari);
    };
    for (const k of cekim.kisiler) {
      const x = k.hedefX;
      // sahneye henüz girmemiş / çıkmış olan sayılmaz
      if (x > -4 && x < 104) ekle(x, bX(KISI_W) * 0.48);
    }
    for (const el of cekim.tut) {
      if (!el.isConnected) continue;
      ekle(Number(el.style.getPropertyValue('--x')) || 50, bX(Number(el.style.getPropertyValue('--w')) || 0) / 2);
    }
    if (l === Infinity) return { x: cekim.x, y: cekim.y, z: cekim.z };
    l = Math.max(0, l - 3);
    r = Math.min(100, r + 3);
    const z = Math.max(1, Math.min(cekim.z, 100 / Math.max(1, r - l)));
    if (z <= 1.001) return { x: cekim.x, y: cekim.y, z: 1 };
    // görünen aralık: [ox·(1 − 1/z), ox·(1 − 1/z) + 100/z]
    const k = 1 - 1 / z;
    const alt = (r - 100 / z) / k;
    const ust = l / k;
    const x = alt > ust ? (alt + ust) / 2 : Math.min(ust, Math.max(alt, cekim.x));
    return { x: Math.max(0, Math.min(100, x)), y: cekim.y, z };
  };
  /**
   * Kamera (kadraj korumalı). tut: bu çekimde kadrajda kalması gereken eşyalar; kisiler: korunan karakterler
   * (yakın çekimde yalnız biri).
   */
  const kam = (x: number, y: number, z: number, ms: number, tut: HTMLElement[] = [], kisiler: Kisi[] = [M, KN]) => {
    cekim = { x, y, z, tut, kisiler };
    uygulanan = kadrajHesap();
    return sahne.kamera(uygulanan.x, uygulanan.y, uygulanan.z, ms);
  };
  const kadrajGuncelle = (ms: number) => {
    const c = kadrajHesap();
    if (Math.abs(c.x - uygulanan.x) < 0.5 && Math.abs(c.z - uygulanan.z) < 0.01) return;
    uygulanan = c;
    void sahne.kamera(c.x, c.y, c.z, Math.max(450, ms));
  };
  M.gitBasi = (_x, ms) => kadrajGuncelle(ms);
  KN.gitBasi = (_x, ms) => kadrajGuncelle(ms);

  const muzik = new BanyoMuzik();
  const suSesi = new SuSesi();
  resimSesiHazirla('kopek');
  resimSesiHazirla('kedi');
  resimSesiHazirla('kikir');
  resimSesiHazirla('yasasin');
  resimSesiHazirla('top');

  // ================================================================ akış altyapısı
  const tikler = new Set<(dt: number) => void>();
  let iptaller: (() => void)[] = [];
  let kapandi = false;
  let onceki = performance.now();
  let raf = requestAnimationFrame(function d(t) {
    const dt = Math.min(0.1, (t - onceki) / 1000);
    onceki = t;
    if (ui.kapandiMi() && !kapandi) {
      kapandi = true;
      iptaller.slice().forEach((f) => f());
    }
    tikler.forEach((f) => f(dt));
    raf = requestAnimationFrame(d);
  });

  /** Kurulan bir görevi çözülene kadar bekler; bölüm kapanırsa IPTAL fırlatır, temizlik her durumda çalışır */
  function gorev<T>(kur: (coz: (v: T) => void) => void | (() => void)): Promise<T> {
    return new Promise<T>((cozP, redP) => {
      if (kapandi || ui.kapandiMi()) return redP(IPTAL);
      let temiz: void | (() => void);
      let bitti = false;
      const son = () => {
        if (bitti) return;
        bitti = true;
        iptaller = iptaller.filter((f) => f !== iptal);
        if (typeof temiz === 'function') temiz();
      };
      const iptal = () => {
        son();
        redP(IPTAL);
      };
      iptaller.push(iptal);
      temiz = kur((v) => {
        son();
        cozP(v);
      });
      if (bitti && typeof temiz === 'function') temiz();
    });
  }
  const bekle = (ms: number) =>
    gorev<void>((coz) => {
      const t = setTimeout(() => coz(), sure(ms));
      return () => clearTimeout(t);
    });
  const tik = (f: (dt: number) => void) => {
    tikler.add(f);
    return () => void tikler.delete(f);
  };
  const durumYaz = (gorevAd: string | null, hedef: string | null = null) => {
    if (gorevAd) sahne.el.dataset.bnGorev = gorevAd;
    else delete sahne.el.dataset.bnGorev;
    if (hedef) sahne.el.dataset.bnHedef = hedef;
    else delete sahne.el.dataset.bnHedef;
  };

  // --- konuşma: Mino (ince ton) ve Kino (aynı ses, kalın ton; ağzı oynar, Mino'nunki durur)
  const mSoyle = async (t: string) => {
    if (kapandi) throw IPTAL;
    ui.yazi(t);
    await konus(t, { ton: 1.12 });
    if (kapandi) throw IPTAL;
  };
  const kSoyle = async (t: string) => {
    if (kapandi) throw IPTAL;
    ui.yazi(t);
    M.mino!.agizSus = true;
    KN.konus(true);
    try {
      await konus(t, { ton: 0.92 });
    } finally {
      KN.konus(false);
      M.mino!.agizSus = false;
    }
    if (kapandi) throw IPTAL;
  };
  const efektCal = (ad: string, ms = 1200) => {
    kulak.sustur(ms);
    void resimSesi(ad);
  };
  /** Ekran → sahne kabı içinde yansı yazısı */
  const yazi = (cx: number, cy: number, t: string, renk?: string, buyuk = false) => yansiYazi(sahne.el, cx, cy, t, renk, buyuk);

  // --- parmak ipucu
  const ipucuGoster = (tur: IpucuTuru, a: [number, number], b?: [number, number]) => ipEl.goster(tur, a, b);
  /** Deneme sayacına bağlı ipucu: 12 sn'de bir ya da 2 yanlışta göster. Döner: kapat() */
  const ipucuDongusu = (d: Deneme, goster: () => void) => {
    const kapat = tik((dt) => {
      if (d.tik(dt)) goster();
    });
    return () => {
      kapat();
      ipEl.gizle();
    };
  };

  // --- banyo sırası (ıslat → köpürt → durula → kurula)
  const siraYak = (adim: 'islat' | 'kopurt' | 'durula' | 'kurula', hal: 'simdi' | 'bitti') => {
    const e = sira.querySelector<HTMLElement>(`[data-adim="${adim}"]`);
    if (!e) return;
    e.classList.remove('simdi');
    e.classList.add(hal);
    if (hal === 'bitti') {
      e.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: sure(500), easing: 'cubic-bezier(0.3, 1.6, 0.5, 1)' });
      efekt.nota(['islat', 'kopurt', 'durula', 'kurula'].indexOf(adim) + 3);
      kulak.sustur(500);
    }
  };

  // --- her an dokunulabilir: Mino, Kino, lastik ördek
  const kisiIs = new Map<Kisi, ((e: PointerEvent) => void) | null>([
    [M, null],
    [KN, null],
  ]);
  let sonSerbest = 0;
  const serbestDokun = (k: Kisi, e: PointerEvent) => {
    if (performance.now() - sonSerbest < 700) return;
    sonSerbest = performance.now();
    if (k === M) {
      if (M.gov.classList.contains('bn-sirilsiklam')) {
        void M.titre(600);
        void M.balon(B.balon.brrr, 900);
        bs.damla();
        parca.sicrat(e.clientX, e.clientY, 'su', 5, 0.6);
        return;
      }
      const b = M.mino!.bolge(e.clientX, e.clientY);
      if (b === 'gobek') {
        M.tepki('gidik');
        efektCal('kikir', 900);
      } else if (b === 'burun') M.tepki('hapsu');
      else {
        M.tepki('mir');
        void M.balon(B.balon.mir, 900);
      }
    } else {
      KN.kinoOynat('coskulu', 1100);
      void KN.zipla(10, 500);
      void KN.balon(Math.random() < 0.5 ? B.balon.hav : B.balon.havhav, 900);
      efektCal('kopek', 1100);
    }
  };
  for (const k of [M, KN]) {
    k.kap.addEventListener('pointerdown', (e) => {
      const f = kisiIs.get(k);
      if (f) f(e);
      else serbestDokun(k, e);
    });
  }
  let ordekSerbest = true;
  const ordekIc = ordek.querySelector<HTMLElement>('.bn-ordek')!;
  ordek.addEventListener('pointerdown', () => {
    if (!ordekSerbest) return;
    bs.vik();
    ordekIc.animate(
      [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.15, 0.85) rotate(-6deg)' }, { transform: 'scale(0.95, 1.08) rotate(5deg)' }, { transform: 'scale(1) rotate(0)' }],
      { duration: sure(420), easing: 'cubic-bezier(0.3, 1.5, 0.5, 1)' },
    );
    const [x, y] = merkez(ordek);
    yazi(x, y - 30, B.balon.vik, '#e8a722');
  });

  // --- su
  let suSeviye = 0;
  const suCiz = (renk?: string) => {
    const L = Math.max(0, Math.min(1, suSeviye));
    for (const s of [suArka, suOn]) {
      s.style.setProperty('--L', L.toFixed(3));
      if (renk) s.style.setProperty('--su', renk);
    }
    suArka.classList.toggle('dolu', L > 0.01);
    suOn.classList.toggle('dolu', L > 0.01);
  };
  let suRenk = '#8fd3ec';
  suCiz(suRenk);
  const suRengi = (t: number | null) => {
    if (t === null) return '#8fd3ec';
    // soğuk mavi → ılık turkuaz → sıcak pembe-turuncu
    if (t < 0.5) return karistir('#5aa6f0', '#8fd3ec', t / 0.5);
    return karistir('#8fd3ec', '#ffab8a', (t - 0.5) / 0.5);
  };

  // --- müzik: ninniyi durdur, banyo müziği çalsın
  muzikDurdur();
  const muzikAc = () => {
    if (!TEST_MODU) muzik.baslat();
  };
  const muzikKapat = () => muzik.durdur();

  const temizle = () => {
    cancelAnimationFrame(raf);
    kulak.dinle(null);
    muzik.durdur();
    suSesi.durdur();
    M.kapat();
    KN.kapat();
    ipEl.gizle();
    muzikBaslat();
  };

  try {
    muzikAc();
    await sahne1();
    await sahne2();
    await sahne3();
    await sahne4();
    await sahne5();
    await sahne6();
    await sahne7();
    await sahne8();
    durumYaz('son');
  } catch (e) {
    if (e !== IPTAL) throw e;
  } finally {
    temizle();
  }

  // ================================================================ 1. Çamur kaşifleri
  async function sahne1() {
    sahne.el.dataset.bnSahne = '1';
    const plan = camurPlani(yas);
    // çamur lekeleri (hepsi baştan)
    let tohum = 1;
    for (const id of [...plan.serbest, ...plan.hedefli]) {
      const [kisi, b] = bolgeCoz(id);
      (kisi === 'mino' ? M : KN).camurEkle(b, tohum++);
    }
    // kalan çamur benekleri (süs: dokunulmaz)
    await kam(50, 96, taban * 1.12, 10);
    // top yuvarlanarak girer
    efektCal('top', 1200);
    const topIc = top.querySelector<HTMLElement>('.bn-esya')!;
    topIc.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(1080deg)' }], { duration: sure(1500), easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' });
    // top küvetin önünde durur (sepetin önüne yuvarlanıp onu örtmesin)
    await kayGit(top, -10, 57, 1500);
    // Kino hoplayarak gelir (pati izleri bırakır)
    KN.kinoOynat('coskulu', 0);
    for (const x of [2, 16, 30]) {
      await KN.git(x, 3, 380, 7);
      patiIzi(x - 3);
    }
    await kSoyle(B.kino.camur);
    // Mino somurtarak gelir (yandan yürüyerek)
    await M.git(70, 3, 1300, 0, undefined, true);
    M.tepki('hayir');
    void M.balon(B.balon.hih, 900);
    KN.kinoDur();
    await mSoyle(B.mino.kino_atladi);
    await kam(50, 96, taban * 1.25, 800);
    await mSoyle(B.mino.nereler);

    // --- serbest dokunuşlar
    const toplam = plan.serbest.length + plan.hedefli.length;
    let bulunan = 0;
    ui.ilerleme(0, toplam);
    ui.ipucu(B.ipucu.camur);
    const soyleBolum = (id: BolgeId) => {
      const [kisi, b] = bolgeCoz(id);
      const t = { kulak: B.mino.kulagim, kuyruk: B.mino.kuyrugum, pati: B.mino.patim, burun: B.kino.burnum, gobek: B.kino.gobegim, sirt: B.kino.sirtim, kafa: B.mino.kulagim }[b];
      return kisi === 'mino' ? mSoyle(t) : kSoyle(t);
    };
    const parlaCamur = (id: BolgeId) => {
      const [kisi, b] = bolgeCoz(id);
      const k = kisi === 'mino' ? M : KN;
      const c = k.camur(b);
      c?.classList.add('bulundu');
      const [x, y] = k.bolgeEkran(b);
      parca.parilti(x, y, 8);
      efekt.nota(bulunan + 2);
      kulak.sustur(500);
      void k.kipir();
    };
    const kalan = new Set<BolgeId>(plan.serbest);
    const d = new Deneme(yas);
    durumYaz('camur', [...kalan][0]);
    const ipKapat = ipucuDongusu(d, () => {
      const id = [...kalan][0];
      if (!id) return;
      const [kisi, b] = bolgeCoz(id);
      ipucuGoster('dokun', (kisi === 'mino' ? M : KN).bolgeEkran(b));
    });
    while (kalan.size) {
      const id = await gorev<BolgeId>((coz) => {
        const is = (k: Kisi) => (e: PointerEvent) => {
          const b = k.bolgeBul(e.clientX, e.clientY, 1.2);
          const id2 = b ? (`${k.ad}-${b}` as BolgeId) : null;
          if (id2 && kalan.has(id2)) coz(id2);
          else serbestDokun(k, e);
        };
        kisiIs.set(M, is(M));
        kisiIs.set(KN, is(KN));
        return () => {
          kisiIs.set(M, null);
          kisiIs.set(KN, null);
        };
      });
      kalan.delete(id);
      d.hareket();
      ipEl.gizle();
      bulunan++;
      ui.ilerleme(bulunan, toplam);
      durumYaz('camur-bekle');
      parlaCamur(id);
      await soyleBolum(id);
      durumYaz('camur', [...kalan][0] ?? null);
    }
    ipKapat();

    // --- hedefli sorular (5-6 yaş)
    for (const id of plan.hedefli) {
      const [kisi, b] = bolgeCoz(id);
      const hedefK = kisi === 'mino' ? M : KN;
      await mSoyle(id === 'kino-kuyruk' ? B.mino.hedef_kuyruk : B.mino.hedef_pati);
      durumYaz('camur', id);
      const dh = new Deneme(yas);
      const ipK = ipucuDongusu(dh, () => ipucuGoster('dokun', hedefK.bolgeEkran(b)));
      await gorev<void>((coz) => {
        const is = (k: Kisi) => (e: PointerEvent) => {
          const bb = k.bolgeBul(e.clientX, e.clientY, 1.2);
          if (k === hedefK && bb === b) return coz();
          if (!bb) return serbestDokun(k, e);
          // yanlış yer: gülerek "Orası …!"
          k.tepki(k === M ? 'gidik' : 'zipla');
          void k.balon(B.balon.orasi.replace('{b}', BOLUM_BENIM[bb]), 1300);
          if (k === KN) efektCal('kikir', 900);
          if (dh.yanlisEkle()) ipucuGoster('dokun', hedefK.bolgeEkran(b));
        };
        kisiIs.set(M, is(M));
        kisiIs.set(KN, is(KN));
        return () => {
          kisiIs.set(M, null);
          kisiIs.set(KN, null);
        };
      });
      ipK();
      bulunan++;
      ui.ilerleme(bulunan, toplam);
      durumYaz('camur-bekle');
      parlaCamur(id);
      await (hedefK === M ? mSoyle(B.mino.patim) : kSoyle(B.mino.kuyrugum));
    }
    ui.ipucu(null);
    ui.ilerleme(toplam, toplam);
    durumYaz(null);
    M.tepki('evet');
    await mSoyle(B.mino.kirlendik);
  }

  // ================================================================ 2. Kino dalar, Mino kaçar
  async function sahne2() {
    sahne.el.dataset.bnSahne = '2';
    // "Banyo!" kelimesini duyan Kino boş küvete dalar
    KN.kinoOynat('kulakDik', 600);
    await kSoyle(B.kino.yasasin);
    KN.katman = 4;
    await KN.git(KINO_KUVET_X + 6, AYAKTA_Y, 900, 20);
    KN.kinoOynat('yuz', 1800);
    parca.sicrat(...KN.bolgeEkran('gobek'), 'camur', 6, 0.5);
    await bekle(1800);
    KN.kinoOynat('bak', 1200, -1);
    void KN.balon(B.balon.hi, 1200);
    await bekle(900);

    // --- fularlar askıya
    await mSoyle(B.mino.fular);
    await kam(50, 96, taban, 700, [askiHedef]);
    ui.ipucu(B.ipucu.fular);
    const fularlar = ([
      [M, 'kirmizi'],
      [KN, 'mavi'],
    ] as const).map(([k, renk]) => {
      const [cx, cy] = k.fularEkran();
      const n = dunyada(cx, cy);
      const en = KISI_W * 0.42;
      const el = sahne.koy(h('div.bn-fular', { 'data-renk': renk, html: fularSvg(renk) }), { x: n.x, y: n.y - bY(en * 0.75) / 2, w: en, z: 9 });
      return { k, renk, el, asili: false };
    });
    const asilan: string[] = [];
    const d = new Deneme(yas);
    durumYaz('fular');
    const ipK = ipucuDongusu(d, () => {
      const f = fularlar.find((x) => !x.asili);
      if (f) ipucuGoster('surukle', merkez(f.el), merkez(askiHedef));
    });
    await gorev<void>((coz) => {
      const kapatlar = fularlar.map((f) =>
        surukle(f.el, {
          basla() {
            f.k.fular(false);
            if (f.k === M) M.tepki('kararsiz', 1.4);
            else KN.kinoOynat('coskulu', 700);
            d.hareket();
          },
          birak(cx, cy) {
            if (!icinde(cx, cy, askiHedef, d.kolay ? 1.2 : 0.6)) {
              if (d.yanlisEkle()) ipucuGoster('surukle', merkez(f.el), merkez(askiHedef));
              return false;
            }
            // boş kancaya as
            const i = asilan.length;
            asilan.push(f.renk);
            f.asili = true;
            const n = askiNokta[i];
            f.el.style.translate = '';
            f.el.style.setProperty('--x', String(n.x));
            f.el.style.setProperty('--y', String(n.y - bY(KISI_W * 0.42 * 0.75)));
            f.el.classList.add('asili');
            f.el.style.zIndex = '2';
            bs.pop();
            const [x, y] = merkez(f.el);
            parca.parilti(x, y, 7);
            kapatlar[fularlar.indexOf(f)]();
            if (fularlar.every((x) => x.asili)) setTimeout(coz, sure(400));
            return true;
          },
        }),
      );
      return () => kapatlar.forEach((k) => k());
    });
    ipK();
    ui.ipucu(null);
    durumYaz(null);

    // --- Mino kaçar: çizgi film saklambacı. Yandan koşar, saklanacağı yere sıçrayıp arkasına dalar (örtünün
    // çizgisinin altı hiç görünmez: yarım / kesik Mino yok). Saklandığı yerden kuyruk ucu çıkar ve ritmik sallanır,
    // ara sıra kulak ucu / gözleri dikizler; bulununca "Aa!" deyip fırlar.
    M.tepki('sasir');
    await mSoyle(B.mino.yapmam);
    M.tepki('hayir');
    await bekle(300);
    await kSoyle(B.kino.bul);
    const yerler = saklanmaYerleri();
    for (const [i, yer] of yerler.entries()) {
      await saklan(yer);
      durumYaz('bul');
      ui.ipucu(B.ipucu.bul);
      const sk = sakliGoster(yer);
      const dk = new Deneme(yas);
      let gecen = 0;
      const ipK2 = ipucuDongusu(dk, () => ipucuGoster('dokun', sk.kuyrukUcu()));
      await gorev<void>((coz) => {
        const bul = (e: PointerEvent) => {
          e.stopPropagation();
          coz();
        };
        sk.hedef.addEventListener('pointerdown', bul);
        // 5 sn'de bulunmazsa kuyruk daha hızlı sallanır ve parlar (ipucu)
        const kapat = tik((dt) => {
          gecen += dt;
          sk.salla(gecen > 5);
        });
        return () => {
          sk.hedef.removeEventListener('pointerdown', bul);
          kapat();
        };
      });
      ipK2();
      ui.ipucu(null);
      durumYaz(null);
      sk.kapat();
      await bulundu(yer);
      if (i < yerler.length - 1) await mSoyle(B.mino.eyvah);
    }
    // yakalandı: köşeye koşup oturur, küsmüş
    await M.git(80, 2, 900, 0, undefined, true);
    M.tepki('hayir');
    void M.balon(B.balon.hih, 1000);
    await mSoyle(B.mino.girmem);
  }

  // ================================================================ 3. Su: sıcak mı soğuk mu?
  async function sahne3() {
    sahne.el.dataset.bnSahne = '3';
    KN.kinoOynat('coskulu', 1600);
    void KN.zipla(14, 600);
    await kSoyle(B.kino.su);
    await kam(40, 90, taban * 1.15, 800, [musluklar.kirmizi, musluklar.mavi]);
    await mSoyle(B.mino.musluk);
    ui.ipucu(kucuk ? B.ipucu.musluk : B.ipucu.ilik);
    isiGosterge?.classList.add('acik');
    const acik = { kirmizi: 0, mavi: 0 };
    let doldu = false;
    let tasti = false;
    let sonDurum: SuDurumu | null = null;
    let durumZaman = 0;
    let buharZaman = 0;
    let kinoKenarda = false;
    let buz = null as SVGGElement | null;
    const d = new Deneme(yas);
    durumYaz('musluk');
    const eksikMusluk = () => (acik.kirmizi === 0 ? musluklar.kirmizi : acik.mavi === 0 ? musluklar.mavi : acik.kirmizi > acik.mavi ? musluklar.mavi : musluklar.kirmizi);
    const ipK = ipucuDongusu(d, () => {
      if (doldu) ipucuGoster('dokun', merkez(acik.kirmizi ? musluklar.kirmizi : musluklar.mavi));
      else ipucuGoster(kucuk ? 'dokun' : 'cevir', merkez(eksikMusluk()));
    });
    const ayarla = (renk: 'kirmizi' | 'mavi', deger: number) => {
      acik[renk] = Math.max(0, Math.min(1, deger));
      const m = musluklar[renk];
      m.style.setProperty('--a', acik[renk].toFixed(2));
      m.classList.toggle('acik', acik[renk] > 0);
      d.hareket();
    };
    const kinoTepki = async (dd: SuDurumu | null) => {
      if (dd === 'sicak') {
        KN.kinoOynat('kulakDik', 0);
        KN.kinoIfade('sicak');
        if (!kinoKenarda) {
          kinoKenarda = true;
          KN.katman = 7;
          void KN.git(KINO_KUVET_X + 14, arkaUst(KINO_KUVET_X + 14) - kisiH * 0.3, 500, 8);
        }
        await kSoyle(B.kino.sicak);
      } else if (dd === 'soguk') {
        KN.kinoOynat('titre', 0);
        bs.takir();
        if (!buz) {
          buz = KN.ekle('kafa', 'bn-buz', '<path d="M1010 990 L1070 990 L1044 1110 Z" fill="#dff4ff" stroke="#6aa9d6" stroke-width="10" stroke-linejoin="round"/><path d="M1028 1000 L1040 1060" stroke="#fff" stroke-width="8" stroke-linecap="round"/>');
          bs.tin();
        }
        await kSoyle(B.kino.soguk);
      } else if (dd === 'ilik') {
        KN.kinoOynat('ic', 1400);
        KN.kinoIfade('keyif', 1800);
        void KN.balon(B.balon.ooh, 1200);
        await kSoyle(B.kino.tam);
      }
    };
    await gorev<void>((coz) => {
      const kapatlar = (['kirmizi', 'mavi'] as const).map((renk) => muslukKontrol(musluklar[renk], (v) => ayarla(renk, v), () => acik[renk], () => doldu));
      const kapat = tik((dt) => {
        // 5-6 yaş: 3. denemede ya da 12 sn'lik ipucundan sonra iki musluk da açıksa ılık sayılır (3-4 yaş kuralı)
        const dd = suDurumu(acik.kirmizi, acik.mavi, d.kolay ? 3 : yas);
        const t = sicaklik(acik.kirmizi, acik.mavi);
        const akisG = (acik.kirmizi + acik.mavi) / 2;
        suSesi.ayarla(akisG, t ?? 0.5);
        suSesi.tik();
        akis.style.setProperty('--g', akisG.toFixed(2));
        akis.classList.toggle('acik', akisG > 0);
        akis.style.setProperty('--su', suRengi(t));
        if (isiGosterge) {
          isiGosterge.style.setProperty('--t', (t ?? 0.5).toFixed(3));
          isiGosterge.classList.toggle('akiyor', t !== null);
          isiGosterge.classList.toggle('yesilde', dd === 'ilik');
        }
        // dolum
        // dolduktan sonra yavaş yükselir: çocuk "Doldu! Musluğu kapat." cümlesini duyup kapatabilsin, kapatmazsa taşar
        if (dd) suSeviye += dolumHizi(acik.kirmizi, acik.mavi, dd, suSeviye) * dt * (TEST_MODU ? 12 : 1) * (suSeviye >= 1 ? 0.18 : 1);
        else if (suSeviye > 1) suSeviye = Math.max(1, suSeviye - dt * 0.12);
        if (dd) {
          suRenk = karistir(suRenk, suRengi(t), Math.min(1, dt * 2));
          suCiz(suRenk);
        } else suCiz();
        if (dd === 'sicak' && performance.now() - buharZaman > 500) {
          buharZaman = performance.now();
          parca.yuksel(...merkez(suArka), 'buhar', 2, 70);
        }
        // Kino'nun tepkisi (durum 1.1 sn değişmeden kalırsa)
        if (dd !== sonDurum) {
          sonDurum = dd;
          durumZaman = performance.now();
        } else if (dd && durumZaman && performance.now() - durumZaman > (TEST_MODU ? 40 : 1100)) {
          durumZaman = 0;
          if (dd !== 'ilik' && !doldu && d.yanlisEkle()) ipucuGoster(kucuk ? 'dokun' : 'cevir', merkez(eksikMusluk()));
          if (dd !== 'soguk' && buz) {
            buz.remove();
            buz = null;
          }
          if (dd !== 'sicak' && kinoKenarda) {
            kinoKenarda = false;
            KN.katman = 4;
            void KN.git(KINO_KUVET_X + 6, AYAKTA_Y, 500, 8);
          }
          if (dd === 'ilik') KN.kinoDur();
          if (!doldu) void kinoTepki(dd).catch(() => undefined);
        }
        // doldu: musluk kapatılmalı
        if (!doldu && suSeviye >= 1) {
          doldu = true;
          ui.ipucu(B.ipucu.kapat);
          durumYaz('kapat');
          d.hareket();
          void mSoyle(B.mino.doldu).catch(() => undefined);
        }
        if (doldu && suSeviye > TASMA && !tasti) {
          tasti = true;
          tasma.classList.add('acik');
          birikinti.classList.add('acik');
          ordekKay();
          void mSoyle(B.mino.bosa).catch(() => undefined);
          ipucuGoster('dokun', merkez(acik.kirmizi ? musluklar.kirmizi : musluklar.mavi));
        }
        if (doldu && acik.kirmizi === 0 && acik.mavi === 0) {
          tasma.classList.remove('acik');
          birikinti.classList.remove('acik');
          coz();
        }
      });
      return () => {
        kapatlar.forEach((k) => k());
        kapat();
      };
    });
    ipK();
    suSesi.ayarla(0);
    akis.classList.remove('acik');
    isiGosterge?.classList.remove('acik');
    ui.ipucu(null);
    durumYaz(null);
    KN.kinoDur();
    KN.kinoIfade(null);
    buz?.remove();
    if (kinoKenarda) {
      KN.katman = 4;
      await KN.git(KINO_KUVET_X + 6, AYAKTA_Y, 500, 8);
    }
    // su yavaşça doğru seviyeye iner, Kino suya yayılır
    while (suSeviye > 1) {
      suSeviye = Math.max(1, suSeviye - 0.05);
      suCiz();
      await bekle(40);
    }
    await KN.git(KINO_KUVET_X, OTUR_Y, 500);
    // ördek suya iner ve yüzer
    ordek.getAnimations().forEach((a) => a.cancel());
    ordek.style.translate = '';
    ordek.style.rotate = '';
    ordek.style.setProperty('--x', '50');
    ordek.style.setProperty('--y', String(suCizgiY - bY(2.5)));
    ordek.style.zIndex = '5';
    ordek.classList.add('yuzuyor');
    girisZipla(ordek);
    KN.kinoOynat('ic', 1500);
    KN.kinoIfade('keyif', 2000);
    void KN.balon(B.balon.ooh, 1300);
    parca.halka(...KN.bolgeEkran('gobek'), 90);
    efekt.dogru();
    kulak.sustur(900);
    await kam(50, 96, taban, 800);
  }

  // ================================================================ 4. Baloncuk tuzağı
  async function sahne4() {
    sahne.el.dataset.bnSahne = '4';
    M.tepki('hayir');
    await kSoyle(B.kino.kopuk);
    // köpük şişesi
    const sise = sahne.koy(h('div.bn-sise.bn-sise-kopuk', {}, esya('kopuk', '', 'Köpük şişesi')), { x: 16, y: 2, w: 8, z: 9 });
    girisZipla(sise);
    await kam(cekim.x, cekim.y, cekim.z, 500, [sise]);
    ui.ipucu(B.ipucu.kopuk);
    durumYaz('kopuk');
    const d = new Deneme(yas);
    const ipK = ipucuDongusu(d, () => ipucuGoster('surukle', merkez(sise), merkez(suArka)));
    await gorev<void>((coz) => {
      const kapat = surukle(sise, {
        basla: () => d.hareket(),
        birak(cx, cy) {
          if (!icinde(cx, cy, suArka, d.kolay ? 0.8 : 0.25)) {
            if (d.yanlisEkle()) ipucuGoster('surukle', merkez(sise), merkez(suArka));
            return false;
          }
          kapat();
          void dok(sise, cx, cy).then(() => coz());
          return true;
        },
      });
      return kapat;
    });
    ipK();
    ui.ipucu(null);
    durumYaz(null);

    // Kino köpükten bir baloncuk halkası çıkarır
    await bekle(300);
    KN.kinoOynat('coskulu', 900);
    // halkanın uzun sapı karakterlerin yüzüne binmesin: halka başlarının üstünde, boş duvarda durur; askılığın ve
    // fularların önüne binmesin diye solda (baloncuklar sağdaki Mino'ya doğru ekranı geçer)
    const HALKA_W = 14;
    const halkaKonum = { x: 36, y: AYAKTA_Y + kisiH * 0.95 + bY(HALKA_W * 2.2) };
    // halka: kutu halkanın kendisi (dokunma ve baloncuk yeri); çizimin sapı kutudan aşağı sarkar
    const halka = sahne.koy(h('div.bn-halka', { role: 'button', 'aria-label': 'Baloncuk halkası' }, esya('baloncuk-halkasi', 'bn-halka-resim'), h('i.bn-halka-zar')), { x: halkaKonum.x, y: halkaKonum.y, w: HALKA_W, z: 9 });
    girisZipla(halka);
    bs.blup(true);
    await mSoyle(B.mino.ufle);
    if (!kucuk) await mSoyle(B.mino.yavas);
    const mikVar = kulak.acik && !TEST_MODU;
    ui.ipucu(mikVar ? B.ipucu.ufle : B.ipucu.ufle_dokun);
    durumYaz('ufle');
    muzikKapat();

    const gereken = gerekenBaloncuk(yas);
    let cekici = 0;
    let basarisiz = 0;
    const zar = halka.querySelector<HTMLElement>('.bn-halka-zar')!;
    const u = new Ufleme(kulak.ayar, 0.5);
    let sertSure = 0;
    const dh = new Deneme(yas);
    const ipK2 = ipucuDongusu(dh, () => ipucuGoster('bas', merkez(halka)));
    let mesgul = false;
    const kose = { x: 80, y: 2 };
    /** Mino baloncuğa doğru adım adım yaklaşır */
    const minoCekil = async (n: number) => {
      const kalan = gereken - n;
      if (kalan >= 2) {
        // gözleri baloncuğu izler, kuyruğu seğirir, bir adım yaklaşır
        M.tepki('kararsiz', 1.6);
        await M.git(kose.x - 5, kose.y, 500);
      } else if (kalan === 1) {
        M.tepki('uzat', 1.2);
        bs.pit();
        yazi(...M.bolgeEkran('pati'), B.balon.pit, '#3e9df2');
        await M.git(76, arkaUst(76) - kisiH * 0.3, 600, 10);
        M.katman = 7;
      }
    };
    await gorev<void>((coz) => {
      const baloncukUcur = async (boy: 'kocaman' | 'minik', son: boolean) => {
        const [hx, hy] = merkez(halka);
        const b = h(`div.bn-baloncuk.${boy}`);
        sahne.el.append(b);
        const k = sahne.el.getBoundingClientRect();
        b.style.left = `${hx - k.left}px`;
        b.style.top = `${hy - k.top}px`;
        bs.blup(boy === 'kocaman');
        if (boy === 'minik') {
          const dx = r(-80, 80);
          await b.animate(
            [
              { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 1 },
              { transform: `translate(calc(-50% + ${dx}px), calc(-50% - 120px)) scale(1)`, opacity: 1, offset: 0.7 },
              { transform: `translate(calc(-50% + ${dx * 1.2}px), calc(-50% - 150px)) scale(1.3)`, opacity: 0 },
            ],
            { duration: sure(1200), easing: 'ease-out' },
          ).finished.catch(() => undefined);
          b.remove();
          M.tepki('kararsiz', 0.8);
          return;
        }
        // kocaman: Mino'ya doğru süzülür (son baloncuk küvetin üstünde durur)
        const [mx, my] = son ? merkez(suArka) : M.bolgeEkran('kafa');
        const tx = mx - hx;
        const ty = (son ? my - kisiH * 0.02 * H() - 90 : my - 40) - hy;
        await b.animate(
          [
            { transform: 'translate(-50%, -50%) scale(0.4)' },
            { transform: `translate(calc(-50% + ${tx * 0.4}px), calc(-50% + ${ty * 0.2 - 50}px)) scale(1)`, offset: 0.35 },
            { transform: `translate(calc(-50% + ${tx * 0.8}px), calc(-50% + ${ty * 0.7 - 20}px)) scale(1.02, 0.96)`, offset: 0.75 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)` },
          ],
          { duration: sure(son ? 1900 : 1500), easing: 'ease-in-out', fill: 'forwards' },
        ).finished.catch(() => undefined);
        bs.kutu([79, 81, 84, 86, 88][Math.min(4, cekici)]);
        if (son) {
          coz();
          sonBaloncuk = b;
          return;
        }
        b.classList.add('patla');
        setTimeout(() => b.remove(), sure(300));
        bs.pit();
      };
      let sonBaloncuk: HTMLElement | null = null;
      void sonBaloncuk;
      const kocaman = async () => {
        cekici++;
        dh.hareket();
        const son = cekici >= gereken;
        ui.ilerleme(cekici, gereken);
        mesgul = true;
        await baloncukUcur('kocaman', son);
        if (!son) await minoCekil(cekici);
        mesgul = false;
      };
      const minik = () => {
        basarisiz++;
        for (let i = 0; i < 4; i++) setTimeout(() => void baloncukUcur('minik', false), sure(i * 110));
        if (dh.yanlisEkle()) {
          ipucuGoster('bas', merkez(halka));
          if (basarisiz === 2) void mSoyle(B.mino.yavas).catch(() => undefined);
        }
      };
      /** bir baloncuk uçarken gelen üfleme boşa gitmesin: sayılmayan küçük baloncuklar çıkar (her üflemede baloncuk) */
      const sus = () => {
        for (let i = 0; i < 2; i++) setTimeout(() => void baloncukUcur('minik', false), sure(i * 120));
      };
      ui.ilerleme(0, gereken);
      halka.classList.add('bekliyor');
      u.onBasla = () => {
        sertSure = 0;
        dh.hareket();
        halka.classList.add('ufleniyor');
        if (kucuk) {
          if (!mesgul) void kocaman();
          else sus();
        }
      };
      u.onBitti = (sn) => {
        halka.classList.remove('ufleniyor');
        zar.style.setProperty('--s', '0');
        if (kucuk) return;
        if (mesgul) return sus();
        // 3. denemede (2 minikten sonra) ya da 12 sn'lik ipucundan sonra her üfleme kocaman
        const boy = baloncukBoyu(sn, sertSure, yas, dh.kolay ? 2 : basarisiz);
        if (boy === 'kocaman') void kocaman();
        else minik();
      };
      const kapat = tik((dt) => {
        u.tik(dt);
        if (!u.aktif || kucuk) return;
        if (u.guc > SERT_GUC) sertSure += dt;
        // büyük grup: üfledikçe halkadaki baloncuk büyür (dolunca kocaman olur); çok sert üflenirse patlar
        zar.style.setProperty('--s', Math.min(1, u.sure / KOCAMAN_SURE).toFixed(3));
        if (sertSure > SERT_SURE && !mesgul && !dh.kolay) {
          sertSure = -99;
          zar.style.setProperty('--s', '0');
          minik();
        }
      });
      kulak.dinle((o) => u.kare(o));
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        u.bas();
      };
      const birak = () => u.birak();
      halka.addEventListener('pointerdown', bas);
      halka.addEventListener('pointerup', birak);
      halka.addEventListener('pointercancel', birak);
      halka.addEventListener('pointerleave', birak);
      return () => {
        kapat();
        kulak.dinle(null);
        halka.removeEventListener('pointerdown', bas);
        halka.removeEventListener('pointerup', birak);
        halka.removeEventListener('pointercancel', birak);
        halka.removeEventListener('pointerleave', birak);
      };
    });
    ipK2();
    ui.ipucu(null);
    ui.ilerleme(gereken, gereken);
    durumYaz(null);
    halka.classList.remove('bekliyor', 'ufleniyor');
    halka.classList.add('gidiyor');
    setTimeout(() => halka.remove(), sure(500));

    // --- DORUK: Mino son baloncuğa atılır ve ŞLAP!
    const sonB = sahne.el.querySelector<HTMLElement>('.bn-baloncuk.kocaman:not(.patla)');
    await bekle(400);
    M.tepki('sasir', 1);
    await M.gov.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18, 0.78) translateY(4%)' }], { duration: sure(380), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
    M.gov.getAnimations().forEach((a) => a.cancel());
    M.katman = 7;
    const ucus = M.git(MINO_KUVET_X, OTUR_Y, 820, 26);
    await bekle(390);
    if (sonB) {
      bs.pit();
      yazi(...merkez(sonB), B.balon.pit, '#3e9df2');
      sonB.classList.add('patla');
      setTimeout(() => sonB.remove(), sure(300));
    }
    await ucus;
    M.katman = 4;
    // şlap
    bs.slap();
    const [sx, sy] = merkez(suOn);
    parca.sicrat(sx - 20, sy, 'su', 26, 1.5);
    parca.sicrat(sx, sy, 'kopuk', 14, 1.1);
    parca.halka(sx, sy, 200);
    sahne.titret(1.6);
    yazi(sx, sy - 120, B.balon.slap, '#3e9df2', true);
    M.islak(1);
    kopukYuzey.animate([{ transform: 'translateX(-50%) scale(1, 1)' }, { transform: 'translateX(-50%) scale(1.1, 1.4)' }, { transform: 'translateX(-50%) scale(1, 1)' }], { duration: sure(600), easing: 'cubic-bezier(0.3, 1.5, 0.5, 1)' });
    await kam(MINO_KUVET_X, 85, taban * 1.3, 350, [], [M]);
    siraYak('islat', 'bitti');
    // bir an sessizlik
    await bekle(1400);
    M.tepki('kararsiz', 2);
    await bekle(1500);
    M.ekle('k', 'bn-sakal', kopukHtml(1030, 1130, 150, 3));
    bs.blup(true);
    M.tepki('mir', 1.8);
    await mSoyle(B.mino.fena_degil);
    await kam(50, 96, taban, 800);
    muzikAc();
  }

  // ================================================================ 5. Köpür köpür
  async function sahne5() {
    sahne.el.dataset.bnSahne = '5';
    siraYak('kopurt', 'simdi');
    // ikisi de ayağa kalkar
    M.el.querySelector("g.bn-sakal")?.remove();
    kopukYuzey.classList.add("ince");
    await Promise.all([M.git(MINO_KUVET_X, AYAKTA_Y, 500, 5), KN.git(KINO_KUVET_X, AYAKTA_Y, 500, 5)]);
    const sampuan = sahne.koy(h('div.bn-sise.bn-sise-sampuan', {}, esya('sampuan', '', 'Şampuan')), { x: 16, y: 2, w: 8, z: 9 });
    girisZipla(sampuan);
    await kam(50, 92, taban * 1.12, 700, [sampuan]);

    const planM: { hedef: Bolum[]; soz: string }[] = kucuk
      ? [
          { hedef: ['kulak'], soz: B.mino.kopurt },
          { hedef: ['pati'], soz: B.mino.patilerim },
          { hedef: ['kuyruk'], soz: B.mino.kuyrugum_da },
          { hedef: ['gobek'], soz: B.mino.gobegim_de },
        ]
      : [
          { hedef: ['kulak', 'kuyruk'], soz: B.mino.iki_adim },
          { hedef: ['pati'], soz: B.mino.patilerim },
          { hedef: ['gobek'], soz: B.mino.gobegim_de },
        ];
    const planK: { hedef: Bolum[]; soz: string }[] = kucuk
      ? [
          { hedef: ['burun'], soz: B.kino.burnum },
          { hedef: ['gobek'], soz: B.kino.gobegim },
          { hedef: ['sirt'], soz: B.kino.sirtim },
        ]
      : [
          { hedef: ['burun', 'sirt'], soz: B.kino.iki_adim },
          { hedef: ['gobek'], soz: B.kino.gobegim },
        ];
    const toplam = [...planM, ...planK].reduce((t, p) => t + p.hedef.length, 0) + 2;
    let yapilan = 0;
    ui.ilerleme(0, toplam);
    const ilk = await sampuanGetir(sampuan, null);
    const sirayla = ilk === KN ? ([[KN, planK], [M, planM]] as const) : ([[M, planM], [KN, planK]] as const);
    for (const [i, [k, plan]] of sirayla.entries()) {
      if (i === 1) await sampuanGetir(sampuan, k);
      for (const adim of plan) {
        await (k === M ? mSoyle(adim.soz) : kSoyle(adim.soz));
        await ovalaGorev(k, adim.hedef, kucuk, adim.soz, () => {
          yapilan++;
          ui.ilerleme(yapilan, toplam);
        });
        // gıdık
        if (adim.hedef.includes('gobek')) {
          if (k === M) {
            M.tepki('gidik', 2);
            efektCal('kikir', 1000);
            await mSoyle(B.mino.gidik);
          } else {
            KN.kinoOynat('tekme', 1500);
            void KN.balon(B.balon.hihi, 1200);
            for (let j = 0; j < 3; j++) setTimeout(() => davul(false, 0.12), sure(200 + j * 220));
            await bekle(1500);
          }
        }
      }
    }
    // göz kuralı: başa sıra geldi
    await mSoyle(B.mino.gozler);
    // gözler sıkıca kapalı (ikisi de). Mino sırılsıklam: çizilmiş "zorlanma" eki ıslak kafaya uymuyor (yamalı
    // görünüyordu), bu yüzden gözler kendi kapalı çizgileriyle kapanır
    M.gozSik(true);
    KN.gozSik(true);
    await sampuanGetir(sampuan, M, true);
    await ovalaGorev(M, ['kafa'], true, B.mino.gozler, () => {
      yapilan++;
      ui.ilerleme(yapilan, toplam);
    });
    await ovalaGorev(KN, ['kafa'], true, B.mino.gozler, () => {
      yapilan++;
      ui.ilerleme(yapilan, toplam);
    });
    M.gozSik(false);
    KN.gozSik(false);
    M.tepki('evet', 1);
    sampuan.classList.add('gidiyor');
    ui.ilerleme(toplam, toplam);
    // ikisi de bembeyaz köpük topu (kalan çamur da gider)
    for (const k of [M, KN]) {
      for (const c of k.camurlar()) c.remove();
      for (const b of ['kulak', 'kafa', 'gobek', 'kuyruk', 'pati', 'burun', 'sirt'] as Bolum[]) if (k.bolge(b)) k.kopuk(b, 1);
    }
    parca.yuksel(...merkez(suOn), 'baloncuk', 10, 90);
    efekt.dogru();
    kulak.sustur(900);
    siraYak('kopurt', 'bitti');

    // --- köpük saç (serbest oyun)
    await kSoyle(B.kino.sac);
    // Kino'nun çizilmiş köpük saçı (kopuk-sac eki); her dokunuşta başka şekle esner
    let sekil = -1;
    const sacCiz = () => KN.kopukSac(sekil);
    ui.ipucu(B.ipucu.sac);
    durumYaz('sac', 'kino-kafa');
    const dugme = ui.dugme('Tamam!');
    let ipGoster = window.setTimeout(() => ipucuGoster('dokun', KN.bolgeEkran('kafa')), TEST_MODU ? 50 : 4000);
    await gorev<void>((coz) => {
      void dugme.then(() => coz());
      kisiIs.set(KN, (e) => {
        const b = KN.bolgeBul(e.clientX, e.clientY, 1.4);
        if (b !== 'kafa') return serbestDokun(KN, e);
        clearTimeout(ipGoster);
        ipEl.gizle();
        sekil = (sekil + 1) % 3;
        sacCiz();
        bs.blup(true);
        KN.kinoOynat('bak', 1100, sekil % 2 ? 1 : -1);
        parca.parilti(...KN.bolgeEkran('kafa'), 6);
        parca.yuksel(...KN.bolgeEkran('kafa'), 'baloncuk', 3, 30);
      });
      return () => {
        kisiIs.set(KN, null);
        clearTimeout(ipGoster);
      };
    });
    ipGoster = 0;
    ui.dugmeKaldir();
    ui.ipucu(null);
    durumYaz(null);
    sampuan.remove();
  }

  // ================================================================ 6. Duş ve uluma
  async function sahne6() {
    sahne.el.dataset.bnSahne = '6';
    siraYak('durula', 'simdi');
    await mSoyle(B.mino.durula);
    const dus = sahne.koy(h('div.bn-dus', { role: 'button', 'aria-label': 'Duş başlığı' }, h('div.bn-dus-akis', {}, h('i'), h('i'), h('i')), esya('dus', '', 'Duş')), { x: 84, y: AYAKTA_Y + kisiH * 0.9, w: 13, z: 9 });
    girisZipla(dus);
    void kam(cekim.x, cekim.y, cekim.z, 600, [dus]);
    ui.ipucu(B.ipucu.dus);
    durumYaz('dus');
    const d = new Deneme(yas);
    const enKopuklu = () => ([M, KN] as const).map((k) => ({ k, b: k.kopukluBolumler() })).find((x) => x.b.length);
    const ipK = ipucuDongusu(d, () => {
      const x = enKopuklu();
      if (x) ipucuGoster('surukle', merkez(dus), x.k.bolgeEkran(x.b[0]));
    });
    let minoKapadi = false;
    let kinoIciyor = 0;
    // başlangıçtaki toplam köpük: çoğu akınca (%85) kalan kendiliğinden akar gider (son kırıntıyı aramak gerekmez)
    const toplamKopuk = () => [M, KN].reduce((t, k) => t + k.kopukluBolumler().reduce((s, b) => s + k.kopukOrani(b), 0), 0);
    const ilkKopuk = Math.max(0.01, toplamKopuk());
    await gorev<void>((coz) => {
      let akiyor = false;
      // su, duş tutulduğu sürece her karede akar (parmak dursa da): durulama parmağın hızına bağlı değil
      const kapatTik = tik((dt) => {
        if (!akiyor) return;
        suSesi.tik();
        const simdi = performance.now();
        const [dx, dy] = merkez(dus.querySelector('.bn-esya')!);
        for (const k of [M, KN]) {
          for (const b of k.kopukluBolumler()) {
            const [bx, by] = k.bolgeEkran(b);
            const rp = k.bolge(b)!.r * k.birim();
            // duşun altında (başlığın biraz üstü de sayılır), geniş bir su sütunu
            if (by > dy - rp - 30 && Math.abs(bx - dx) < rp * 1.6 + 50) {
              const yeni = Math.max(0, k.kopukOrani(b) - dt * (TEST_MODU ? 20 : 2.2));
              k.kopuk(b, yeni);
              if (Math.random() < 0.25) parca.sicrat(bx, by, 'kopuk', 1, 0.4);
              if (yeni === 0) {
                parca.parilti(bx, by, 5);
                bs.damla();
              }
              if (k === M && !minoKapadi) {
                minoKapadi = true;
                M.tepki('zorlan', 3);
              }
              if (k === KN && simdi - kinoIciyor > 1600) {
                // köpük saç duşla akar gider
                if (KN.sacSekil !== null) {
                  KN.kopukSac(null);
                  parca.sicrat(...KN.bolgeEkran('kafa'), 'kopuk', 8, 0.7);
                }
                kinoIciyor = simdi;
                KN.kinoOynat('ic', 1400);
              }
            }
          }
        }
        if (toplamKopuk() <= ilkKopuk * 0.15) coz();
      });
      const kapat = surukle(dus, {
        basla() {
          dus.classList.add('akiyor');
          suSesi.ayarla(0.6, 0.5);
          akiyor = true;
          d.hareket();
        },
        hareket() {
          d.hareket();
        },
        birak() {
          dus.classList.remove('akiyor');
          suSesi.ayarla(0);
          akiyor = false;
          return false;
        },
        kalk: 1.05,
      });
      return () => {
        kapat();
        kapatTik();
        suSesi.ayarla(0);
      };
    });
    // kalan köpük kırıntıları da akıp gider
    for (const k of [M, KN]) for (const b of k.kopukluBolumler()) k.kopuk(b, 0);
    if (KN.sacSekil !== null) KN.kopukSac(null);
    ipK();
    dus.classList.remove('akiyor');
    geriDon(dus);
    ui.ipucu(null);
    durumYaz(null);
    M.islak(1);
    KN.islak(1);
    efekt.dogru();
    kulak.sustur(900);
    await bekle(500);
    dus.classList.add('gidiyor');

    // --- Kino'nun duş şarkısı (uluma)
    await ulumaGorevi();

    // --- tıpa
    await mSoyle(B.mino.bosalt);
    ui.ipucu(B.ipucu.tipa);
    durumYaz('tipa');
    zincir.classList.add('parla', 'gorunur');
    zincir.animate([{ opacity: 0, transform: 'translateX(-50%) scaleY(0.2)' }, { opacity: 1, transform: 'translateX(-50%) scaleY(1)' }], { duration: sure(450), easing: 'cubic-bezier(0.3, 1.5, 0.5, 1)' });
    const dt2 = new Deneme(yas);
    const ipK2 = ipucuDongusu(dt2, () => ipucuGoster('asagi', merkez(zincir.querySelector('.bn-zincir-halka')!)));
    await gorev<void>((coz) => {
      let by = -1;
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        zincir.setPointerCapture?.(e.pointerId);
        by = e.clientY;
        dt2.hareket();
      };
      const hareket = (e: PointerEvent) => {
        if (by < 0) return;
        const dy = Math.max(0, e.clientY - by);
        zincir.style.setProperty('--c', String(Math.min(1, dy / 80)));
        if (dy > 70) {
          by = -1;
          coz();
        }
      };
      const birak = () => {
        if (by >= 0 && dt2.yanlisEkle()) ipucuGoster('asagi', merkez(zincir.querySelector('.bn-zincir-halka')!));
        by = -1;
        zincir.style.setProperty('--c', '0');
      };
      zincir.addEventListener('pointerdown', bas);
      zincir.addEventListener('pointermove', hareket);
      zincir.addEventListener('pointerup', birak);
      zincir.addEventListener('pointercancel', birak);
      return () => {
        zincir.removeEventListener('pointerdown', bas);
        zincir.removeEventListener('pointermove', hareket);
        zincir.removeEventListener('pointerup', birak);
        zincir.removeEventListener('pointercancel', birak);
      };
    });
    ipK2();
    ui.ipucu(null);
    durumYaz(null);
    zincir.classList.remove('parla', 'gorunur');
    zincir.style.setProperty('--c', '0');
    // tıpa fırlar, gider gluk gluk çeker, girdap döner
    bs.plop();
    const tipa = sahne.koy(h('div.bn-tipa', {}, esya('tipa', '', 'Tıpa')), { x: 34, y: onKenarY - bY(6), w: 9, z: 7 });
    tipa.animate(
      [
        { transform: 'translateX(-50%) translateY(60%) rotate(0) scale(0.6)', opacity: 0 },
        { transform: 'translateX(-50%) translateY(-140%) rotate(-160deg) scale(1)', opacity: 1, offset: 0.5 },
        { transform: 'translateX(-50%) translateY(0) rotate(-340deg) scale(1)', opacity: 1 },
      ],
      { duration: sure(700), easing: 'ease-out', fill: 'forwards' },
    );
    await bekle(400);
    bs.gluk(5);
    yazi(...merkez(suOn), B.balon.gluk, '#3e9df2');
    const girdap = sahne.koy(h('div.bn-girdap', { html: girdapSvg() }), { x: 44, y: suCizgiY - bY(3), w: 16, z: 5 });
    ordekGirdaba(44);
    KN.kinoOynat('bak', 1600, -1);
    setTimeout(() => void KN.balon(B.balon.hi, 1000), sure(900));
    const bas0 = performance.now();
    const boslukSure = TEST_MODU ? 60 : 3200;
    await gorev<void>((coz) =>
      tik(() => {
        const u = Math.min(1, (performance.now() - bas0) / boslukSure);
        suSeviye = 1 - u * 0.97;
        suCiz();
        kopukYuzey.style.setProperty('--d', String(u));
        if (u >= 1) coz();
      }),
    );
    girdap.classList.add('gidiyor');
    setTimeout(() => girdap.remove(), sure(500));
    siraYak('durula', 'bitti');
  }

  /** Uluma: önce normal ses (referans), sonra çocuk ulur, Kino yankı gibi aynı perdede ulur. Parmakla: Kino'ya basılı tut. */
  async function ulumaGorevi() {
    muzikKapat();
    KN.kinoOynat('kulakDik', 700);
    const mikVar = kulak.acik && !TEST_MODU;
    let referans: number | null = null;
    if (mikVar) {
      await kSoyle(B.kino.referans);
      ui.ipucu(B.ipucu.aaa);
      durumYaz('aaa');
      referans = await gorev<number | null>((coz) => {
        const perdeler: number[] = [];
        const zaman = setTimeout(() => coz(null), 12000);
        kisiIs.set(KN, () => coz(null));
        kulak.dinle((o) => {
          if (o.perde !== null && sesVar(o, kulak.ayar, 10)) perdeler.push(o.perde);
          if (perdeler.length >= 30) {
            const s = [...perdeler].sort((a, b) => a - b);
            coz(s[Math.floor(s.length / 2)]);
          }
        });
        return () => {
          clearTimeout(zaman);
          kulak.dinle(null);
          kisiIs.set(KN, null);
        };
      });
      if (referans) efekt.secim();
    }
    await kSoyle(B.kino.ulu);
    KN.kinoOynat('ulu', 1300);
    KN.kinoKulakYon = 0.5;
    ulu([ulumaFrekansi(-2), ulumaFrekansi(2), ulumaFrekansi(0)], 1.2);
    void KN.balon(B.balon.auuu, 1200);
    await bekle(1400);
    ui.ipucu(mikVar ? B.ipucu.ulu : B.ipucu.ulu_dokun);
    durumYaz('ulu');
    let toplam = 0;
    let deneme = 0;
    let minoTepki = false;
    const d = new Deneme(yas);
    const ipK = ipucuDongusu(d, () => {
      ui.ipucu(B.ipucu.ulu_dokun);
      ipucuGoster('bas', KN.bolgeEkran('kafa'));
    });
    ui.ilerleme(0, 3);
    const minoDinle = () => {
      if (minoTepki) return;
      minoTepki = true;
      M.tepki('zorlan', 2.5);
      void M.balon(B.balon.hih, 1200);
    };
    await gorev<void>((coz) => {
      const p = new Perde(kulak.ayar, referans ?? 280);
      let farklar: number[] = [];
      let sesli = 0;
      let sessiz = 0;
      let yanki = false;
      /** bir uluma bitti: süre sayılır, Kino yankı gibi ulur */
      const bitti = async (sn: number) => {
        const kabul = sn >= 0.3 || (kucuk && deneme >= 2);
        if (!kabul) {
          deneme++;
          if (d.yanlisEkle()) ipucuGoster('bas', KN.bolgeEkran('kafa'));
          return;
        }
        toplam += Math.max(sn, 0.6);
        d.hareket();
        ui.ilerleme(Math.min(3, Math.floor((toplam / ULUMA_HEDEF) * 3)), 3);
        minoDinle();
        if (toplam >= ULUMA_HEDEF) setTimeout(() => coz(), sure(Math.min(3, sn) * 1000 + 300));
      };
      kulak.dinle((o) => {
        if (yanki) return;
        p.kare(o);
        if (p.sesli && p.fark !== null) {
          sesli += kulak.ayar.kare;
          sessiz = 0;
          farklar.push(p.fark);
          KN.kinoKulakYon = p.sinif === 'ince' ? 1 : p.sinif === 'kalin' ? -1 : 0;
          if (KN.kinoHareket !== 'dinle') KN.kinoOynat('dinle', 0);
          if (sesli > 4) sessiz = 1;
        } else if (sesli > 0) {
          sessiz += kulak.ayar.kare;
        }
        if (sesli > 0 && sessiz > 0.25) {
          const sn = sesli;
          const kontur = ulumaKonturu(farklar);
          const ort = farklar.reduce((a, b) => a + b, 0) / Math.max(1, farklar.length);
          farklar = [];
          sesli = 0;
          sessiz = 0;
          if (sn < 0.3 && !(kucuk && deneme >= 2)) {
            KN.kinoDur();
            void bitti(sn);
            return;
          }
          // yankı: çocuğun sesi bitince Kino aynı perdede, aynı uzunlukta ulur (mikrofon bu sırada susar)
          yanki = true;
          KN.kinoKulakYon = ort > 2.5 ? 1 : ort < -2.5 ? -1 : 0;
          const uz = Math.min(3, Math.max(0.6, sn));
          KN.kinoOynat('ulu', uz * 1000 + 200);
          void KN.balon(B.balon.auuu, uz * 1000);
          const ms = ulu(kontur, uz);
          setTimeout(() => (yanki = false), sure(ms));
          void bitti(sn);
        }
      });
      // parmakla: Kino'ya basılı tut; yukarı kaydır ince, aşağı kalın
      const canli = new CanliUluma();
      let basY = 0;
      let basZaman = 0;
      let basili = false;
      kisiIs.set(KN, (e) => {
        basili = true;
        basY = e.clientY;
        basZaman = performance.now();
        KN.kap.setPointerCapture?.(e.pointerId);
        canli.basla(ulumaFrekansi(0));
        KN.kinoOynat('ulu', 0);
        void KN.balon(B.balon.auuu, 900);
        d.hareket();
      });
      const kay = (e: PointerEvent) => {
        if (!basili) return;
        const fark = ((basY - e.clientY) / 60) * 6;
        KN.kinoKulakYon = fark > 2.5 ? 1 : fark < -2.5 ? -1 : 0;
        canli.frekans(ulumaFrekansi(fark));
      };
      const birak = () => {
        if (!basili) return;
        basili = false;
        canli.bitir();
        KN.kinoDur();
        void bitti((performance.now() - basZaman) / 1000 + (TEST_MODU ? 1 : 0));
      };
      KN.kap.addEventListener('pointermove', kay);
      KN.kap.addEventListener('pointerup', birak);
      KN.kap.addEventListener('pointercancel', birak);
      return () => {
        kulak.dinle(null);
        kisiIs.set(KN, null);
        KN.kap.removeEventListener('pointermove', kay);
        KN.kap.removeEventListener('pointerup', birak);
        KN.kap.removeEventListener('pointercancel', birak);
        canli.bitir();
      };
    });
    ipK();
    ui.ipucu(null);
    ui.ilerleme(3, 3);
    durumYaz(null);
    // Mino da dayanamaz: minik bir "miyauu" ile katılır, birlikte ulurlar
    await bekle(300);
    efektCal('kedi', 1500);
    M.tepki('sasir', 1.2);
    void M.balon(B.balon.miyav, 1400);
    KN.kinoKulakYon = 1;
    KN.kinoOynat('ulu', 1600);
    ulu([ulumaFrekansi(0), ulumaFrekansi(4), ulumaFrekansi(1)], 1.5, 0.12);
    void KN.balon(B.balon.auuu, 1500);
    await bekle(1700);
    KN.kinoKulakYon = 0;
    M.tepki('dans', 1.6);
    KN.tepki('dans');
    efektCal('yasasin', 1800);
    await bekle(900);
    muzikAc();
  }

  // ================================================================ 7. Kurula, silkelen, tara
  async function sahne7() {
    sahne.el.dataset.bnSahne = '7';
    siraYak('kurula', 'simdi');
    // kurulanmak için küvetten çıkarlar
    await kam(50, 96, taban, 10);
    M.katman = 8;
    KN.katman = 8;
    await Promise.all([M.git(45, 3, 700, 16), KN.git(71, 3, 700, 16)]);
    havluMavi.style.zIndex = '9';
    havluTuruncu.style.zIndex = '10';
    void kam(55, 96, taban * 1.1, 700, [havluMavi, havluTuruncu]);
    kuvetOn.classList.add('arkada');
    // --- Kino'yu kurula (yarıya kadar)
    ui.ipucu(B.ipucu.havlu);
    durumYaz('havlu-kino');
    await havluGorevi(havluMavi, KN, 0.5);
    ui.ipucu(null);
    durumYaz(null);
    await kSoyle(B.kino.kendim);
    await mSoyle(B.mino.silkelenme);
    // silkelenme: kulaklar pervane, damlalar ekrana
    bs.silkele();
    davul(true, 0.4);
    KN.kinoOynat('silkelen', 1700);
    const ekranSicrat = setInterval(() => {
      parca.sicrat(...KN.bolgeEkran('gobek'), 'su', 8, 1.3);
    }, sure(160));
    sahne.titret(1.2);
    await bekle(350);
    damla.sicrat(kucuk ? 10 : 14);
    sahne.titret(1.4);
    await bekle(1350);
    clearInterval(ekranSicrat);
    KN.islak(0);
    // ekranı sil
    await mSoyle(B.mino.ekran);
    ui.ipucu(B.ipucu.sil);
    durumYaz('ekran');
    const d = new Deneme(yas);
    const ipK = ipucuDongusu(d, () => {
      const k = damla.kalanlar()[0];
      if (k) ipucuGoster('sil', k);
    });
    await gorev<void>((coz) => {
      damla.onSil = (kalan) => {
        d.hareket();
        if (kalan <= 0.3) coz();
      };
      return () => (damla.onSil = () => undefined);
    });
    ipK();
    damla.temizle();
    ui.ipucu(null);
    durumYaz(null);
    KN.kinoOynat('coskulu', 1200);
    await kSoyle(B.kino.pardon);

    // --- Mino'yu kurula: kurudukça kabarır → pofuduk top
    ui.ipucu(B.ipucu.havlu);
    durumYaz('havlu-mino');
    await havluGorevi(havluTuruncu, M, 1, (p) => {
      M.islak(Math.max(0, 1 - p * 1.6));
      M.pofuduk(Math.max(0, (p - 0.15) / 0.85));
    });
    ui.ipucu(null);
    durumYaz(null);
    M.islak(0);
    M.pofuduk(1);
    bs.blup(true);
    parca.yuksel(...M.bolgeEkran('gobek'), 'baloncuk', 4, 60);
    await bekle(500);
    // Kino kahkahayı basar
    KN.tepki('dans');
    void KN.balon(B.balon.haha, 1600);
    efektCal('kikir', 1200);
    void M.balon(B.balon.hih, 1200);
    await bekle(1500);

    // --- tara
    const tarak = sahne.koy(h('div.bn-tarak', { role: 'button', 'aria-label': 'Tarak' }, esya('tarak', '', 'Tarak')), { x: 16, y: 20, w: 6, z: 10 });
    girisZipla(tarak);
    await mSoyle(B.mino.tara);
    ui.ipucu(B.ipucu.tara);
    durumYaz('tara');
    let kabarik = 1;
    const dtar = new Deneme(yas);
    const ipK2 = ipucuDongusu(dtar, () => {
      const [x, y] = M.bolgeEkran('kafa');
      ipucuGoster('surukle', merkez(tarak), [x, y]);
      setTimeout(() => ipucuGoster('asagi', [x, y]), TEST_MODU ? 50 : 1800);
    });
    await gorev<void>((coz) => {
      let bas: [number, number] | null = null;
      const kapat = surukle(tarak, {
        basla: () => dtar.hareket(),
        hareket(cx, cy) {
          const k = M.kap.getBoundingClientRect();
          const ustunde = cx > k.left - 20 && cx < k.right + 20 && cy > k.top - 30 && cy < k.bottom + 20;
          if (!ustunde) {
            bas = null;
            return;
          }
          if (!bas || cy < bas[1]) bas = [cx, cy];
          if (taramaMi(cx - bas[0], cy - bas[1], k.height)) {
            bas = [cx, cy];
            kabarik = Math.max(0, kabarik - 0.34);
            M.pofuduk(kabarik);
            bs.havlu();
            parca.sicrat(cx, cy, 'yildiz', 3, 0.6);
            M.tepki('mir', 0.8);
            dtar.hareket();
            if (kabarik <= 0) coz();
          }
        },
        birak: () => false,
        kalk: 1.1,
      });
      return kapat;
    });
    ipK2();
    ui.ipucu(null);
    durumYaz(null);
    geriDon(tarak);
    M.pofuduk(0);
    M.gov.classList.add('bn-parlak');
    parca.parilti(...M.bolgeEkran('kafa'), 12);
    parca.parilti(...M.bolgeEkran('gobek'), 10);
    efekt.dogru();
    kulak.sustur(900);
    M.tepki('evet', 1.2);
    siraYak('kurula', 'bitti');
    await bekle(800);
    tarak.classList.add('gidiyor');
  }

  // ================================================================ 8. Mis gibi!
  async function sahne8() {
    sahne.el.dataset.bnSahne = '8';
    // ortayı boşaltırlar: ördek küvetten yere zıplar, havlular önde
    ordek.getAnimations().forEach((a) => a.cancel());
    ordek.style.translate = '';
    ordek.style.rotate = '';
    ordek.style.zIndex = '10';
    ordek.style.setProperty('--x', '52');
    ordek.style.setProperty('--y', '1.5');
    girisZipla(ordek);
    havluMavi.style.zIndex = '10';
    havluTuruncu.style.zIndex = '11';
    // toplanma: havlular, sepet ve raf kadrajda; ikisi ortada, sepetin önünü kapatmadan durur
    void kam(50, 96, taban, 600, [havluMavi, havluTuruncu, sepet, rafHedef]);
    // dar ekranda (telefon) sığmazsa ikisi birlikte sağa kayar: Mino taburenin önüne binmesin
    const kay = Math.max(0, 32 - (SEPET_X - bX(SEPET_W) * 0.5 - bX(KISI_W) * 0.92));
    const kinoX = SEPET_X - bX(SEPET_W) * 0.5 - bX(KISI_W) * 0.3 + kay;
    await Promise.all([M.git(kinoX - bX(KISI_W) * 0.62, 3, 600, 8), KN.git(kinoX, 3, 600, 8)]);
    await mSoyle(B.mino.topla);
    // --- ıslak havlular sepete
    ui.ipucu(B.ipucu.topla);
    durumYaz('sepet');
    for (const hv of [havluMavi, havluTuruncu]) hv.classList.add('islak');
    const d = new Deneme(yas);
    const havlular = [havluTuruncu, havluMavi];
    const ipK = ipucuDongusu(d, () => {
      const hv = havlular.find((x) => !x.classList.contains('sepette'));
      if (hv) ipucuGoster('surukle', merkez(hv), merkez(sepet));
    });
    await gorev<void>((coz) => {
      const kapatlar = havlular.map((hv, i) =>
        surukle(hv, {
          basla: () => d.hareket(),
          birak(cx, cy) {
            // bırakma alanı cömert: sepetin çevresi (ve üstü) de sayılır
            if (!icinde(cx, cy, sepet, d.kolay ? 1.2 : 0.6)) {
              if (d.yanlisEkle()) ipucuGoster('surukle', merkez(hv), merkez(sepet));
              return false;
            }
            kapatlar[i]();
            hv.classList.add('sepette');
            sepeteKoy(hv, havlular.filter((x) => x.classList.contains('sepette')).length - 1);
            if (havlular.every((x) => x.classList.contains('sepette'))) setTimeout(coz, sure(700));
            return true;
          },
        }),
      );
      return () => kapatlar.forEach((k) => k());
    });
    ipK();

    // --- ördek rafa
    ui.ipucu(B.ipucu.ordek);
    durumYaz('ordek');
    ordekSerbest = false;
    ordek.getAnimations().forEach((a) => a.cancel());
    ordekIc.getAnimations().forEach((a) => a.cancel());
    const d2 = new Deneme(yas);
    const ipK2 = ipucuDongusu(d2, () => ipucuGoster('surukle', merkez(ordek), merkez(rafHedef)));
    await gorev<void>((coz) => {
      const kapat = surukle(ordek, {
        basla: () => {
          d2.hareket();
          bs.vik();
        },
        birak(cx, cy) {
          if (!icinde(cx, cy, rafHedef, d2.kolay ? 1.5 : 0.8)) {
            if (d2.yanlisEkle()) ipucuGoster('surukle', merkez(ordek), merkez(rafHedef));
            return false;
          }
          kapat();
          ordek.style.translate = '';
          ordek.style.setProperty('--x', String(rafNokta.x));
          ordek.style.setProperty('--y', String(rafNokta.y));
          ordek.style.zIndex = '2';
          ordek.classList.remove('yuzuyor');
          bs.vik();
          parca.parilti(...merkez(ordek), 6);
          setTimeout(coz, sure(400));
          return true;
        },
      });
      return kapat;
    });
    ipK2();
    ordekSerbest = true;

    // --- fularlar sahiplerine
    await mSoyle(B.mino.fular_tak);
    ui.ipucu(B.ipucu.fular_tak);
    durumYaz('fular-tak');
    const fularlar = [...sahne.dunya.querySelectorAll<HTMLElement>('.bn-fular')];
    const d3 = new Deneme(yas);
    const sahibi = (f: HTMLElement) => (f.dataset.renk === 'kirmizi' ? M : KN);
    const ipK3 = ipucuDongusu(d3, () => {
      const f = fularlar.find((x) => !x.classList.contains('takildi'));
      if (f) ipucuGoster('surukle', merkez(f), sahibi(f).fularEkran());
    });
    await gorev<void>((coz) => {
      const kapatlar = fularlar.map((f, i) =>
        surukle(f, {
          basla() {
            d3.hareket();
            f.style.zIndex = '10';
            f.classList.remove('asili');
            // 3-4 yaş: fuların sahibi parlar
            if (kucuk) sahibi(f).el.classList.add('bn-sahip');
          },
          birak(cx, cy) {
            M.el.classList.remove('bn-sahip');
            KN.el.classList.remove('bn-sahip');
            // iki karakter yan yana (üst üste binebilir): önce fuların sahibine bakılır
            const sahip = sahibi(f);
            const diger = sahip === M ? KN : M;
            const kime = icinde(cx, cy, sahip.kap, 0.15) ? sahip : icinde(cx, cy, diger.kap, 0.05) ? diger : d3.kolay ? sahip : null;
            if (kime !== sahibi(f)) {
              if (kime) {
                kime.tepki('hayir');
                void kime.balon(kime === M ? B.balon.hih : B.balon.hi, 900);
              }
              f.classList.add('asili');
              if (d3.yanlisEkle()) ipucuGoster('surukle', merkez(f), sahibi(f).fularEkran());
              return false;
            }
            kapatlar[i]();
            f.classList.add('takildi');
            f.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '0.6' }], { duration: sure(250), fill: 'forwards' });
            kime.fular(true);
            parca.parilti(...kime.fularEkran(), 8);
            kime.tepki('zipla');
            efekt.nota(i + 4);
            kulak.sustur(500);
            if (fularlar.every((x) => x.classList.contains('takildi'))) setTimeout(coz, sure(600));
            return true;
          },
        }),
      );
      return () => kapatlar.forEach((k) => k());
    });
    ipK3();
    ui.ipucu(null);
    durumYaz(null);

    // --- buğulu ayna
    const yakin = h('div.bn-ayna-yakin');
    const ic = h('div.bn-ayna-ic');
    const yansiM = new Kisi('mino');
    const yansiK = new Kisi('kino');
    ic.append(h('div.bn-ayna-arka', { style: `--resim:url("${banyoAdres('arkaplan')}")` }), h('div.bn-ayna-kisiler', {}, yansiM.el, yansiK.el));
    const bugu = new Bugu();
    const cerceve = esya('ayna-buyuk', 'bn-ayna-cerceve', 'Ayna');
    yakin.append(cerceve, h('div.bn-ayna-cam', {}, ic, bugu.el, h('i.bn-ayna-parilti')));
    sahne.on.append(yakin);
    await yansiK.hazir();
    yansiM.fular(true);
    yansiK.fular(true);
    yansiM.gov.classList.add('bn-parlak');
    yansiK.gov.classList.add('bn-parlak');
    await bekle(60);
    bugu.kur();
    yakin.classList.add('acik');
    await bekle(600);
    await mSoyle(B.mino.ayna);
    ui.ipucu(B.ipucu.ayna);
    durumYaz('ayna');
    const d4 = new Deneme(yas);
    const ipK4 = ipucuDongusu(d4, () => ipucuGoster('sil', merkez(bugu.el)));
    await gorev<void>((coz) => {
      bugu.onDegis = (o) => {
        d4.hareket();
        if (o >= 0.45) coz();
      };
      return () => (bugu.onDegis = () => undefined);
    });
    ipK4();
    ui.ipucu(null);
    durumYaz(null);
    bugu.temizle();
    bs.jingle();
    for (const a of ['islat', 'kopurt', 'durula', 'kurula'] as const) siraYak(a, 'bitti');
    sira.classList.add('hepsi');
    const [ax, ay] = merkez(ic);
    parca.parilti(ax, ay, 14);
    yansiM.tepki('zipla');
    yansiK.tepki('zipla');
    await bekle(700);
    yansiK.konus(true);
    await kSoyle(B.kino.mis);
    yansiK.konus(false);
    await mSoyle(B.mino.guzelmis);
    yakin.classList.remove('acik');
    await bekle(500);
    yakin.remove();
    yansiM.kapat();
    yansiK.kapat();

    // --- final şakası: pencerede parıldayan çamur birikintisi
    const pencere = h('div.bn-pencere', { style: `--resim:url("${banyoAdres('arkaplan')}")` }, h('i.bn-pencere-parilti'), h('i.bn-pencere-parilti'), h('i.bn-pencere-parilti'));
    sahne.on.append(pencere);
    await bekle(40);
    pencere.classList.add('acik');
    KN.kinoOynat('bak', 1800, -1);
    await bekle(900);
    KN.kinoOynat('coskulu', 2600);
    await kSoyle(B.kino.bir_daha);
    M.tepki('sasir', 0.9);
    void M.zipla(24, 700);
    await mSoyle(B.mino.hayir);
    pencere.classList.remove('acik');
    // ikisi de güler, Mino Kino'ya sarılır
    M.tepki('gidik', 1.6);
    KN.tepki('dans');
    efektCal('kikir', 1200);
    await bekle(1000);
    pencere.remove();
    await M.git(KN.x - bX(KISI_W) * 0.45, 3, 600, 0, undefined, true);
    M.tepki('saril', 1.8);
    parca.parilti(...M.bolgeEkran('kafa'), 7, 'kalp');
    await bekle(1200);
    // öğüt: kameraya
    await kam(50, 90, taban * 1.25, 800);
    M.tepki('evet', 1);
    await mSoyle(B.mino.ogut);
    await kam(50, 96, taban, 700);
    // ödül kartı
    const kart = h(
      'div.bn-odul',
      {},
      // kopyalar .bn-cizim altında: köpük / çamur ekleri banyo.css kurallarıyla (ölçek 0) gizli kalır — eskiden kartta
      // karakterlerin üstünde kocaman köpük kümeleri görünüyordu
      h(
        'div.bn-odul-resim',
        {},
        h('div.bn-odul-kisi.bn-cizim', { html: M.mino!.el.outerHTML }),
        h('div.bn-odul-kisi.bn-cizim', { html: KN.kap.innerHTML }),
        h('div.bn-odul-tac', { html: tacSvg() }),
      ),
      h('b', {}, B.kart),
    );
    sahne.el.append(kart);
    await bekle(40);
    kart.classList.add('acik');
    const [kx, ky] = merkez(kart);
    konfetiPatlat(kok, kx, ky, 140);
    efektCal('yasasin', 2000);
    await bekle(1200);
  }

  // ================================================================ saklambaç (sahne 2)
  /** Mino çiziminin (viewBox 344 140 1360 1790) (dx, dy) noktası dünyada (X, Y)'ye gelsin diye kutunun yeri (x merkez, y alt) */
  function minoKutu(X: number, Y: number, dx: number, dy: number, s = 1) {
    return { x: X - bX(KISI_W * s) * ((dx - 344) / 1360 - 0.5), y: Y - bY(KISI_W * s * KISI_ORAN) * (1 - (dy - 140) / 1790) };
  }
  /** Kutunun (y alt, yükseklik h; dünya %) içinde, alttan cizgi'ye kadarını gizleyen kırpma (üstü ve yanları serbest) */
  function cizgiKirp(el: HTMLElement, yAlt: number, h: number, cizgi: number | null) {
    if (cizgi === null) {
      el.style.clipPath = '';
      return;
    }
    // px ile (yüzdeli, kutunun dışına taşan çokgen Chrome'da parçayı hiç çizdirmiyordu)
    const hPx = (h / 100) * H();
    const ust = (1 - (cizgi - yAlt) / h) * hPx;
    const w = W();
    el.style.clipPath = `polygon(${-w}px ${-2 * hPx}px, ${2 * w}px ${-2 * hPx}px, ${2 * w}px ${ust.toFixed(1)}px, ${-w}px ${ust.toFixed(1)}px)`;
  }
  interface SaklanmaYeri {
    ad: 'kuvet' | 'sepet' | 'havlu';
    /** Mino'nun saklandığı x (kutu merkezi) */
    x: number;
    /** örtünün üst çizgisi (dünya y, alttan %): Mino bunun arkasına dalar, altı hiç görünmez */
    cizgi: () => number;
    /** saklanırken katman */
    z: number;
    /** sıçramadan önce koşup geldiği yer (yerde) */
    yaklas: () => number;
    /** bulununca sıçradığı yer */
    cikis: () => [number, number];
    /** dikizleyen kafanın x'i (null: havlunun altından gözler) */
    kafaX: number | null;
    /** kuyruk kökü (dünya) ve kuyruğun kırpma çizgisi (null: kırpma yok, katmanla örtülür) */
    kuyruk: () => { x: number; y: number; cizgi: number | null };
    /** saklanınca / dikizlerken kıpırdayan örtü */
    ortu: HTMLElement[];
  }
  function saklanmaYerleri(): SaklanmaYeri[] {
    const KX = 44;
    const havluY = () => Number(havluTuruncu.style.getPropertyValue('--y')) || tabureUst;
    const havluUst = () => havluY() + bY(17 * BANYO_ORAN.havlu) * 0.82;
    const MW = bX(KISI_W);
    return [
      {
        // küvetin arkası: Kino'nun (küvette) önünden sıçrayıp küvetin arkasına dalar
        ad: 'kuvet',
        x: KX,
        cizgi: () => arkaUst(KX),
        z: 2,
        yaklas: () => M.x,
        cikis: () => [KX, 3],
        kafaX: KX,
        kuyruk: () => ({ x: KX - MW * 0.62, y: arkaUst(KX - MW * 0.4) - bY(1), cizgi: arkaUst(KX - MW * 0.4) }),
        ortu: [ordekIc],
      },
      {
        // çamaşır sepetinin içi
        ad: 'sepet',
        x: SEPET_X,
        cizgi: sepetKenarY,
        z: 7,
        yaklas: () => SEPET_X - MW * 0.85,
        cikis: () => [SEPET_X - MW * 0.8, 3],
        kafaX: SEPET_X - bX(1),
        kuyruk: () => ({ x: SEPET_X + bX(SEPET_W) * 0.02, y: sepetKenarY() - bY(1.5), cizgi: sepetKenarY() }),
        ortu: [sepet, sepetOn],
      },
      {
        // taburedeki havluların altı: üstteki havlu kalkınca karanlıkta iki göz
        ad: 'havlu',
        x: 22,
        cizgi: havluUst,
        z: 7,
        yaklas: () => 22 + MW * 0.95,
        cikis: () => [22 + MW * 0.9, 3],
        kafaX: null,
        kuyruk: () => ({ x: 22 + bX(17) * 0.3, y: havluY() + bY(2.5), cizgi: null }),
        ortu: [havluTuruncu, havluMavi],
      },
    ];
  }
  /** Örtü kıpırdar (Mino arkasına daldı / dikizliyor) */
  function kipirdat(ortu: HTMLElement[], guc = 1) {
    for (const o of ortu) {
      const e = o.classList.contains('bn-ordek') ? o : (o.querySelector<HTMLElement>(':scope > .bn-esya') ?? o);
      e.animate(
        [
          { transform: 'scale(1, 1) rotate(0deg)' },
          { transform: `scale(${1 + 0.07 * guc}, ${1 - 0.07 * guc}) rotate(${-2 * guc}deg)` },
          { transform: `scale(${1 - 0.03 * guc}, ${1 + 0.04 * guc}) rotate(${1.5 * guc}deg)` },
          { transform: 'scale(1, 1) rotate(0deg)' },
        ],
        { duration: sure(420), easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' },
      );
    }
  }
  /** Koşup saklanma yerine dalar */
  async function saklan(yer: SaklanmaYeri) {
    // hazırlan (çömel), fırla
    await M.gov.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15, 0.8)' }], { duration: sure(200), fill: 'forwards' }).finished.catch(() => undefined);
    M.gov.getAnimations().forEach((a) => a.cancel());
    bs.vuu();
    const yx = yer.yaklas();
    if (Math.abs(M.x - yx) > 3) await M.git(yx, 3, 380 + Math.abs(M.x - yx) * 11, 0, undefined, true);
    // sıçrar: ayakları örtünün çizgisine konar; havada, en tepede örtünün arkasına geçer
    const cizgi = yer.cizgi();
    M.el.classList.add('bn-dalis');
    const zz = window.setTimeout(() => (M.katman = yer.z), sure(300));
    await M.git(yer.x, cizgi, 600, 15);
    clearTimeout(zz);
    M.katman = yer.z;
    // dalar: kutunun alt kenarı örtünün çizgisinde; altı hiç görünmez
    M.el.style.clipPath = altKirp(M.el);
    await M.gov.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14, 0.84)' }], { duration: sure(110), fill: 'forwards' }).finished.catch(() => undefined);
    bs.blup(false);
    kipirdat(yer.ortu, 1.4);
    const D = M.el.offsetHeight + 16;
    await M.yol
      .animate([{ transform: 'translateY(0)' }, { transform: `translateY(${D}px)` }], { duration: sure(240), easing: 'cubic-bezier(0.55, 0, 0.9, 0.5)', fill: 'forwards' })
      .finished.catch(() => undefined);
    M.sakla(true);
    M.gov.getAnimations().forEach((a) => a.cancel());
    M.yol.getAnimations().forEach((a) => a.cancel());
    M.el.style.clipPath = '';
    parca.sicrat(...ekranda(yer.x, cizgi), yer.ad === 'kuvet' ? 'su' : 'yildiz', 5, 0.5);
  }
  /** Bulununca: "Aa!" deyip saklandığı yerden fırlar, öne sıçrar */
  async function bulundu(yer: SaklanmaYeri) {
    M.el.style.clipPath = altKirp(M.el);
    const D = M.el.offsetHeight + 16;
    M.yol.style.transform = `translateY(${D}px)`;
    M.sakla(false);
    M.tepki('sasir', 1.3);
    void M.balon(B.balon.aa, 1000);
    bs.pop();
    kipirdat(yer.ortu, 1.6);
    await M.yol
      .animate([{ transform: `translateY(${D}px)` }, { transform: 'translateY(-14%)', offset: 0.65 }, { transform: 'translateY(0)' }], { duration: sure(460), easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' })
      .finished.catch(() => undefined);
    M.yol.style.transform = '';
    M.el.style.clipPath = '';
    yazi(...M.bolgeEkran('kafa'), '!', '#f0413f');
    const [cx, cy] = yer.cikis();
    const zz = window.setTimeout(() => (M.katman = 8), sure(280));
    await M.git(cx, cy, 560, 14);
    clearTimeout(zz);
    M.katman = 8;
    M.el.classList.remove('bn-dalis');
  }
  /** Dünya (x, y alttan %) → ekran */
  function ekranda(x: number, y: number): [number, number] {
    const k = sahne.dunya.getBoundingClientRect();
    return [k.left + (x / 100) * k.width, k.bottom - (y / 100) * k.height];
  }
  /**
   * Saklanan Mino'nun görünen parçaları: örtünün arkasından çıkan kuyruk ucu (ritmik sallanır), ara sıra dikizleyen
   * kafa (kulak ucu ya da gözler) ya da havlunun altından bakan gözler. Hepsi örtünün çizgisinde kırpılır.
   */
  function sakliGoster(yer: SaklanmaYeri) {
    const S = 0.94;
    const MH = bY(KISI_W * S * KISI_ORAN);
    const parcalar: HTMLElement[] = [];
    // kuyruk: kök örtünün arkasında, uç dışarıda
    const ky = yer.kuyruk();
    const kk = minoKutu(ky.x, ky.y, 1250, 1680, S);
    const kIc = h('div.bn-saklanan-ic.bn-saklanan-kuyruk-ic', {}, M.minoKlon('q') ?? '');
    const kuyruk = sahne.koy(h('div.bn-saklanan.bn-saklanan-kuyruk', { 'aria-hidden': 'true' }, kIc), { x: kk.x, y: kk.y, w: KISI_W * S, z: yer.z });
    cizgiKirp(kuyruk, kk.y, MH, ky.cizgi);
    parcalar.push(kuyruk);
    kuyruk.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(200) });
    // dikiz
    let kafaIc: HTMLElement | null = null;
    let gozler: HTMLElement | null = null;
    const cizgi = yer.cizgi();
    if (yer.kafaX !== null) {
      // kafanın tepesi (kulak uçları) çizginin biraz altında bekler
      const kb = minoKutu(yer.kafaX, cizgi - bY(1.5), 1030, 170, S);
      kafaIc = h('div.bn-saklanan-ic', {}, M.minoKlon('k') ?? '');
      const kafa = sahne.koy(h('div.bn-saklanan.bn-saklanan-kafa', { 'aria-hidden': 'true' }, kafaIc), { x: kb.x, y: kb.y, w: KISI_W * S, z: yer.z });
      cizgiKirp(kafa, kb.y, MH, cizgi);
      parcalar.push(kafa);
    } else {
      // havlu: üstteki havlu kalkınca aradaki karanlıkta iki göz
      gozler = sahne.koy(h('div.bn-sakli-gozler', { 'aria-hidden': 'true', html: gozlerSvg() }), { x: 22 + bX(17) * 0.22, y: Number(havluTuruncu.style.getPropertyValue('--y')) + bY(1), w: 9, z: 7 });
      parcalar.push(gozler);
      havluTuruncu.style.zIndex = '8';
    }
    // dokunma alanı: saklandığı yer (kuyruk + dikiz bölgesi), cömert
    const hx = (yer.x + (kk.x + bX(KISI_W * S) * 0.3)) / 2;
    const hedef = sahne.koy(h('div.bn-sakli-hedef', { role: 'button', 'aria-label': 'Mino burada' }), { x: hx, y: cizgi - bY(9), w: KISI_W * 1.35, z: 12 });
    parcalar.push(hedef);

    // dikiz döngüsü: kulak ucu ya da gözler kısa süre görünür, Kino o yana bakar
    let kapandi2 = false;
    let zaman = 0;
    let sayac = 0;
    const px = (n: number) => (bY(n) / 100) * H();
    const dikiz = async () => {
      if (kapandi2) return;
      sayac++;
      KN.kinoOynat('bak', 1300, yer.x < KN.x ? -1 : 1);
      if (kafaIc) {
        // sırayla: kulak ucu, gözler
        const yuk = sayac % 2 ? px(5.5) : px(11);
        kipirdat(yer.ortu, 0.6);
        await kafaIc
          .animate(
            [
              { transform: 'translateY(0)' },
              { transform: `translateY(${-yuk}px)`, offset: 0.25 },
              { transform: `translateY(${-yuk}px) rotate(${sayac % 4 < 2 ? 4 : -4}deg)`, offset: 0.75 },
              { transform: 'translateY(0)' },
            ],
            { duration: sure(1500), easing: 'ease-in-out' },
          )
          .finished.catch(() => undefined);
      } else if (gozler) {
        const hv = havluTuruncu.querySelector<HTMLElement>(':scope > .bn-esya');
        const kalk = [
          { transform: 'rotate(0deg) translateY(0)' },
          { transform: 'rotate(-7deg) translateY(-18%)', offset: 0.22 },
          { transform: 'rotate(-7deg) translateY(-18%)', offset: 0.8 },
          { transform: 'rotate(0deg) translateY(0)' },
        ];
        hv?.animate(kalk, { duration: sure(1600), easing: 'ease-in-out' });
        await gozler
          .animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: sure(1600) })
          .finished.catch(() => undefined);
      }
      if (!kapandi2) zaman = window.setTimeout(() => void dikiz(), sure(1400 + Math.random() * 1600));
    };
    zaman = window.setTimeout(() => void dikiz(), sure(900));
    return {
      hedef,
      kuyrukUcu: (): [number, number] => {
        const r = kuyruk.getBoundingClientRect();
        return [r.left + ((1640 - 344) / 1360) * r.width, r.top + ((1250 - 140) / 1790) * r.height];
      },
      salla(hizli: boolean) {
        kuyruk.classList.toggle('hizli', hizli);
      },
      kapat() {
        kapandi2 = true;
        clearTimeout(zaman);
        for (const p of parcalar) p.remove();
        if (yer.ad === 'havlu') havluTuruncu.style.zIndex = '7';
        KN.kinoDur();
      },
    };
  }

  // ================================================================ sahne yardımcıları
  /**
   * Havlu sepetin İÇİNE düşer: sepetin arka ve ön katmanı arasına yerleşir (ön kenar önde, havlunun üstü kenardan
   * taşar); bırakıldığı yerden yay çizerek, küçülerek gelir. sira: sepetteki kaçıncı havlu (üst üste biner).
   */
  function sepeteKoy(hv: HTMLElement, sira: number) {
    const once = hv.getBoundingClientRect();
    hv.getAnimations().forEach((a) => a.cancel());
    hv.style.translate = '';
    hv.style.rotate = '';
    hv.style.scale = '';
    const w = SEPET_W * 0.74;
    hv.style.setProperty('--x', String(SEPET_X + (sira % 2 ? bX(2.2) : -bX(1.6))));
    hv.style.setProperty('--y', String(sepetKenarY() - bY(w * BANYO_ORAN.havlu) * 0.6 + bY(sira * 2.4)));
    hv.style.setProperty('--w', String(w));
    hv.style.zIndex = '7';
    hv.classList.remove('parla', 'tutuluyor');
    const sonra = hv.getBoundingClientRect();
    const olcek = hv.offsetWidth ? sonra.width / hv.offsetWidth : 1;
    const dx = (once.left + once.width / 2 - (sonra.left + sonra.width / 2)) / olcek;
    const dy = (once.top + once.height / 2 - (sonra.top + sonra.height / 2)) / olcek;
    const s0 = sonra.width ? once.width / sonra.width : 1;
    const tepe = Math.min(dy, 0) * 0.5 - 50;
    hv.animate(
      [
        { translate: `${dx}px ${dy}px`, scale: String(s0), rotate: '0deg' },
        { translate: `${dx * 0.45}px ${tepe}px`, scale: String((s0 + 1) / 2), rotate: `${sira % 2 ? 10 : -10}deg`, offset: 0.45 },
        { translate: '0px 6px', scale: '1.04 0.94', rotate: `${sira % 2 ? -3 : 3}deg`, offset: 0.82 },
        { translate: '0px 0px', scale: '1', rotate: '0deg' },
      ],
      { duration: sure(560), easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
    );
    setTimeout(() => {
      kipirdat([sepet, sepetOn], 1.2);
      bs.pop();
      parca.parilti(...ekranda(SEPET_X, sepetKenarY()), 6);
    }, sure(460));
  }
  /** Topu soldan sağa kaydır (yalnız transform) */
  async function kayGit(el: HTMLElement, x0: number, x1: number, ms: number) {
    const dx = ((x1 - x0) / 100) * W();
    await el.animate([{ translate: '0px 0px' }, { translate: `${dx}px 0px` }], { duration: sure(ms), easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)', fill: 'forwards' }).finished.catch(() => undefined);
    el.style.setProperty('--x', String(x1));
    el.getAnimations().forEach((a) => a.cancel());
  }
  /** Yerde çamurlu pati izi */
  function patiIzi(x: number) {
    const iz = sahne.koy(h('div.bn-pati-izi'), { x, y: 1.5, w: 4, z: 2 });
    iz.animate([{ opacity: 0, transform: 'translateX(-50%) scale(0.5)' }, { opacity: 0.8, transform: 'translateX(-50%) scale(1)' }], { duration: sure(200), fill: 'forwards' });
  }
  /** Sahneye zıplayarak gelen eşya */
  function girisZipla(el: HTMLElement) {
    el.animate(
      [
        { transform: 'translateX(-50%) translateY(40%) scale(0.3)', opacity: 0 },
        { transform: 'translateX(-50%) translateY(-18%) scale(1.1, 0.92)', opacity: 1, offset: 0.55 },
        { transform: 'translateX(-50%) translateY(0) scale(0.95, 1.06)', offset: 0.8 },
        { transform: 'translateX(-50%) translateY(0) scale(1)' },
      ],
      { duration: sure(520), easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)' },
    );
    bs.pop();
  }
  /**
   * Musluk: dokununca açılır/kapanır (büyüklerde adım adım), daire çizerek çevirmek de açar/kısar.
   * doluMu: küvet dolduysa dokunuş musluğu kapatır.
   */
  function muslukKontrol(m: HTMLElement, ayarla: (v: number) => void, deger: () => number, doluMu: () => boolean) {
    let merk: [number, number] = [0, 0];
    let aci0 = 0;
    let top = 0;
    let basili = false;
    const aci = (e: PointerEvent) => Math.atan2(e.clientY - merk[1], e.clientX - merk[0]);
    const cevirAnim = () =>
      m.querySelector('.bn-esya')?.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.55) rotate(-8deg)' }, { transform: 'scaleX(1)' }], { duration: sure(280), easing: 'ease-in-out' });
    const bas = (e: PointerEvent) => {
      e.stopPropagation();
      m.setPointerCapture?.(e.pointerId);
      merk = merkez(m);
      aci0 = aci(e);
      top = 0;
      basili = true;
    };
    const hareket = (e: PointerEvent) => {
      if (!basili) return;
      const a = aci(e);
      let fark = a - aci0;
      if (fark > Math.PI) fark -= Math.PI * 2;
      if (fark < -Math.PI) fark += Math.PI * 2;
      aci0 = a;
      top += fark;
      if (Math.abs(top) > 0.35) {
        // saat yönü açar, tersi kapar
        ayarla(deger() + (top > 0 ? 0.12 : -0.12));
        top = 0;
        bs.hisirti(0.5);
        cevirAnim();
      }
    };
    const birak = () => {
      if (!basili) return;
      basili = false;
    };
    const tikla = () => {
      ayarla(doluMu() ? 0 : sonrakiAciklik(deger(), yas));
      cevirAnim();
      efekt.cevir();
      kulak.sustur(300);
    };
    let basZaman = 0;
    let basNokta: [number, number] = [0, 0];
    const kisa = (e: PointerEvent) => {
      basZaman = performance.now();
      basNokta = [e.clientX, e.clientY];
    };
    const kisaBit = (e: PointerEvent) => {
      if (performance.now() - basZaman < 450 && Math.hypot(e.clientX - basNokta[0], e.clientY - basNokta[1]) < 14) tikla();
    };
    m.addEventListener('pointerdown', bas);
    m.addEventListener('pointerdown', kisa);
    m.addEventListener('pointermove', hareket);
    m.addEventListener('pointerup', birak);
    m.addEventListener('pointerup', kisaBit);
    m.addEventListener('pointercancel', birak);
    m.classList.add('etkin');
    return () => {
      m.removeEventListener('pointerdown', bas);
      m.removeEventListener('pointerdown', kisa);
      m.removeEventListener('pointermove', hareket);
      m.removeEventListener('pointerup', birak);
      m.removeEventListener('pointerup', kisaBit);
      m.removeEventListener('pointercancel', birak);
      m.classList.remove('etkin');
    };
  }
  /** Taşan suda ördek kenardan kayıp yere düşer */
  function ordekKay() {
    ordek.animate(
      [
        { translate: '0px 0px', rotate: '0deg' },
        { translate: `${W() * 0.04}px -${H() * 0.02}px`, rotate: '20deg', offset: 0.3 },
        { translate: `${W() * 0.08}px ${H() * ((arkaUstY - 2) / 100)}px`, rotate: '380deg' },
      ],
      { duration: sure(900), easing: 'cubic-bezier(0.4, 0, 0.8, 0.6)', fill: 'forwards' },
    );
    bs.vik();
  }
  /** Tıpa çekilince ördek girdapta dönerek gidere yaklaşır */
  function ordekGirdaba(x: number) {
    ordek.getAnimations().forEach((a) => a.cancel());
    ordek.style.setProperty('--x', String(72));
    ordek.style.setProperty('--y', String(suCizgiY - bY(1)));
    ordek.style.zIndex = '5';
    const dx = ((x - 72) / 100) * W();
    ordek.animate(
      [
        { translate: '0px 0px', rotate: '0deg' },
        { translate: `${dx * 0.6}px -6px`, rotate: '360deg', offset: 0.5 },
        { translate: `${dx}px 4px`, rotate: '900deg' },
      ],
      { duration: sure(3000), easing: 'ease-in', fill: 'forwards' },
    );
  }
  /** Şişeyi küvete boşalt: eğilir, köpük akar, su köpükle kaplanır */
  async function dok(sise: HTMLElement, cx: number, cy: number) {
    void cx;
    void cy;
    sise.style.transformOrigin = '50% 30%';
    await sise.animate([{ rotate: '0deg' }, { rotate: '-125deg' }], { duration: sure(350), easing: 'ease-out', fill: 'forwards' }).finished.catch(() => undefined);
    bs.fis();
    const [x, y] = merkez(sise);
    yazi(x, y - 40, B.balon.fis, '#ff7eb6');
    for (let i = 0; i < 5; i++) {
      parca.sicrat(x, y + 20, 'kopuk', 4, 0.5, 0.3);
      parca.yuksel(...merkez(suArka), 'baloncuk', 3, 90);
      await bekle(160);
    }
    kopukYuzey.classList.add('acik');
    bs.blup(true);
    parca.parilti(...merkez(suOn), 8);
    await sise.animate([{ opacity: 1 }, { opacity: 0, scale: '0.5' }], { duration: sure(300), fill: 'forwards' }).finished.catch(() => undefined);
    sise.remove();
    KN.kinoOynat('coskulu', 1000);
    efekt.dogru();
    kulak.sustur(900);
  }
  /**
   * Şampuanı bir karaktere sürükle, bas ("fıs"): başında köpük belirir. kime null ise ikisinden biri olur.
   * Döner: şampuanlanan karakter.
   */
  async function sampuanGetir(sise: HTMLElement, kime: Kisi | null, kafaya = false): Promise<Kisi> {
    ui.ipucu(B.ipucu.sampuan);
    durumYaz('sampuan', kime ? `${kime.ad}-kafa` : 'mino-kafa');
    const d = new Deneme(yas);
    const hedefler = kime ? [kime] : [M, KN];
    const ipK = ipucuDongusu(d, () => ipucuGoster('surukle', merkez(sise), hedefler[0].bolgeEkran('kafa')));
    const k = await gorev<Kisi>((coz) => {
      const kapat = surukle(sise, {
        basla: () => d.hareket(),
        birak(cx, cy) {
          const bulunan = hedefler.find((x) => icinde(cx, cy, x.kap, d.kolay ? 0.8 : 0.3));
          if (!bulunan) {
            if (d.yanlisEkle()) ipucuGoster('surukle', merkez(sise), hedefler[0].bolgeEkran('kafa'));
            return false;
          }
          coz(bulunan);
          return false;
        },
      });
      return kapat;
    });
    ipK();
    ui.ipucu(null);
    durumYaz(null);
    bs.fis();
    const [x, y] = k.bolgeEkran('kafa');
    yazi(x, y - 50, B.balon.fis, '#5dbe3f');
    parca.sicrat(x, y - 20, 'kopuk', 8, 0.5);
    if (!kafaya) k.kopuk('kafa', 0.35);
    void k.kipir();
    await bekle(300);
    return k;
  }
  /**
   * Ovalayarak köpürt: karakter hedefleri söyler; 3-4 yaşta hedef parlar, 5-6 yaşta parlamaz ve sıra önemlidir.
   * Yanlış yeri ovalayınca (5-6) karakter gülerek "Orası …!" der.
   */
  async function ovalaGorev(k: Kisi, hedefler: Bolum[], parlat: boolean, soz: string, adimBitti: () => void) {
    const sirali = !parlat && hedefler.length > 1;
    let siraNo = 0;
    const oval = new Map<Bolum, Ovalama>(hedefler.map((b) => [b, new Ovalama(ovalamaYolu(yas))]));
    const bitenler = new Set<Bolum>();
    const d = new Deneme(yas);
    const simdiki = () => (sirali ? hedefler[siraNo] : hedefler.find((b) => !bitenler.has(b)))!;
    const parlaGuncelle = () => k.parla(parlat || d.ipucuGosterildi || d.yanlis >= 2 ? simdiki() ?? null : null);
    ui.ipucu(B.ipucu.ova);
    durumYaz('ova', `${k.ad}-${simdiki()}`);
    parlaGuncelle();
    const ipK = ipucuDongusu(d, () => {
      k.parla(simdiki());
      ipucuGoster('ova', k.bolgeEkran(simdiki()));
    });
    let yanlisYol = 0;
    let sesZaman = 0;
    let kopukZaman = 0;
    await gorev<void>((coz) => {
      kisiIs.set(k, () => undefined);
      const oteki = k === M ? KN : M;
      oteki.el.classList.add('bn-gecirgen');
      /** hedef bölgede sürtme: köpük hemen ve bolca belirir, ilerleme halkası dolar */
      const hedefeSurt = (b: Bolum, cx: number, cy: number, yol: number) => {
        const px = (k.bolge(b)?.r ?? 100) * k.birim();
        const o = oval.get(b)!;
        o.ekle(yol / px);
        k.kopuk(b, 0.45 + o.oran * 0.55);
        k.ilerlemeCiz(b, o.oran);
        d.hareket();
        yanlisYol = 0;
        const simdi = performance.now();
        if (simdi - kopukZaman > 90) {
          kopukZaman = simdi;
          parca.sicrat(cx, cy, 'kopuk', 2, 0.35);
          parca.yuksel(cx, cy, 'baloncuk', 1, 24);
        }
        if (simdi - sesZaman > 140) {
          sesZaman = simdi;
          bs.hisirti();
        }
        if (o.bitti) {
          bitenler.add(b);
          k.ilerlemeCiz(null);
          parca.parilti(...k.bolgeEkran(b), 9);
          parca.yuksel(...k.bolgeEkran(b), 'baloncuk', 5, 40);
          efekt.nota(bitenler.size + 2);
          kulak.sustur(400);
          adimBitti();
          if (sirali) {
            const s = siraKontrol(hedefler, siraNo, b);
            siraNo++;
            if (s === 'bitti') return coz();
          } else if (bitenler.size === hedefler.length) return coz();
          parlaGuncelle();
          durumYaz('ova', `${k.ad}-${simdiki()}`);
        }
      };
      const surt = (cx: number, cy: number, yol: number) => {
        const hedef = simdiki();
        // hedefin yakını da sayılır (geniş dokunma alanı); kolay modda (2 yanlış / 12 sn) karakterin her yeri
        if (k.bolgeBul(cx, cy, OVALAMA_PAY, [hedef]) || d.kolay) return hedefeSurt(hedef, cx, cy, yol);
        const b = k.bolgeBul(cx, cy, 1.2);
        if (!b) return;
        if (!parlat && !bitenler.has(b)) {
          // yanlış yer (büyük grup): biraz ovalayınca gülerek düzeltir; iki yanlıştan sonra kolay mod
          yanlisYol += yol / ((k.bolge(b)?.r ?? 100) * k.birim());
          if (yanlisYol > 2.2) {
            yanlisYol = 0;
            k.tepki(k === M ? 'gidik' : 'zipla', 1);
            void k.balon(B.balon.orasi.replace('{b}', BOLUM_BENIM[b]), 1300);
            if (d.yanlisEkle()) {
              k.parla(hedef);
              ipucuGoster('ova', k.bolgeEkran(hedef));
            }
            void (k === M ? mSoyle(soz) : kSoyle(soz)).catch(() => undefined);
          }
        }
      };
      // parmak değer değmez köpük (sürtmeyi beklemeden)
      const kapat = ovala(k.kap, surt, (cx, cy) => surt(cx, cy, 0));
      return () => {
        kapat();
        kisiIs.set(k, null);
        oteki.el.classList.remove('bn-gecirgen');
      };
    });
    ipK();
    k.ilerlemeCiz(null);
    k.parla(null);
    ui.ipucu(null);
    durumYaz(null);
  }
  /** Havluyla ovalayarak kurula: havlu karakterin üstünde gezdikçe kurur (0..1); hedef orana varınca biter */
  async function havluGorevi(hv: HTMLElement, k: Kisi, hedef: number, ilerle?: (p: number) => void) {
    const d = new Deneme(yas);
    const ipK = ipucuDongusu(d, () => ipucuGoster('surukle', merkez(hv), k.bolgeEkran('gobek')));
    let p = 0;
    let sesZaman = 0;
    let bitti = false;
    hv.classList.add('parla');
    await gorev<void>((coz) => {
      let son: [number, number] | null = null;
      const kapat = surukle(hv, {
        basla: () => {
          d.hareket();
          son = null;
        },
        hareket(cx, cy) {
          if (bitti) return;
          if (!icinde(cx, cy, k.kap, -0.05)) {
            son = null;
            return;
          }
          if (son) {
            const yol = Math.hypot(cx - son[0], cy - son[1]);
            p = Math.min(1, p + yol / (k.kap.getBoundingClientRect().height * (TEST_MODU ? 0.8 : 3.5)));
            if (ilerle) ilerle(p);
            else k.islak(1 - p);
            d.hareket();
            if (performance.now() - sesZaman > 180) {
              sesZaman = performance.now();
              bs.havlu();
              parca.sicrat(cx, cy, 'su', 2, 0.5);
            }
          }
          son = [cx, cy];
          if (p >= hedef) {
            bitti = true;
            setTimeout(coz, sure(150));
          }
        },
        birak: () => false,
        kalk: 1.08,
      });
      return kapat;
    });
    ipK();
    hv.classList.remove('parla');
    geriDon(hv);
  }
}

// ================================================================ çizim yardımcıları
/** İki renk arası (#rrggbb) */
function karistir(a: string, b: string, t: number): string {
  const p = (s: string) => {
    const m = s.replace('#', '');
    return m.length === 6 ? [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16)) : [143, 211, 236];
  };
  const x = p(a);
  const y = p(b);
  const u = Math.max(0, Math.min(1, t));
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * u).toString(16).padStart(2, '0')).join('');
}

/** Su yüzeyindeki köpük sırası (SVG) */
function kopukSerisi(): string {
  let s = '';
  for (let i = 0; i < 26; i++) {
    const x = 20 + i * 22 + (i % 3) * 4;
    const y = 50 + ((i * 37) % 17) - 8;
    const rr = 16 + ((i * 53) % 14);
    s += `<circle cx="${x}" cy="${y}" r="${rr}" fill="#fff" stroke="#b9c9d8" stroke-width="2.5"/><circle cx="${x - rr * 0.35}" cy="${y - rr * 0.4}" r="${rr * 0.25}" fill="#e6f6ff"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const x = 50 + i * 44;
    const rr = 12 + ((i * 29) % 10);
    s += `<circle cx="${x}" cy="${30 + ((i * 17) % 10)}" r="${rr}" fill="#fff" stroke="#b9c9d8" stroke-width="2.5"/>`;
  }
  return `<svg viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
}

/** Gider girdabı */
function girdapSvg(): string {
  return `<svg viewBox="0 0 200 80" aria-hidden="true"><g fill="none" stroke-linecap="round">
    <ellipse cx="100" cy="40" rx="90" ry="32" stroke="#5aa6f0" stroke-width="6" opacity=".6"/>
    <path d="M100 40 m-70 0 a70 26 0 1 1 70 26 a50 18 0 1 1 -40 -14 a28 10 0 1 1 30 6" stroke="#fff" stroke-width="7" opacity=".9"/>
    <ellipse cx="100" cy="40" rx="12" ry="5" fill="#2c6fb3" stroke="none"/></g></svg>`;
}

/** Havlunun altındaki karanlıktan bakan iki göz (Mino'nun göz renkleri) */
function gozlerSvg(): string {
  const goz = (x: number) =>
    `<ellipse cx="${x}" cy="50" rx="25" ry="29" fill="#fff" stroke="#3a1210" stroke-width="5"/>` +
    `<circle cx="${x + 4}" cy="54" r="17" fill="#9a5a2a"/><circle cx="${x + 5}" cy="55" r="10" fill="#3a1210"/>` +
    `<circle cx="${x - 2}" cy="45" r="6" fill="#fff"/>`;
  return `<svg viewBox="0 0 200 100" aria-hidden="true"><ellipse cx="100" cy="52" rx="96" ry="44" fill="#2a1410" opacity=".82"/>${goz(68)}${goz(132)}</svg>`;
}

/** Ödül kartındaki köpük taç */
function tacSvg(): string {
  let s = '';
  for (let i = 0; i < 9; i++) s += `<circle cx="${20 + i * 20}" cy="${50 - (i % 2) * 22}" r="${14 + (i % 2) * 4}" fill="#fff" stroke="#b9c9d8" stroke-width="3"/>`;
  return `<svg viewBox="0 0 200 70" aria-hidden="true">${s}</svg>`;
}
