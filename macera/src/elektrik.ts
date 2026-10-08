/**
 * Bölüm: Elektrikler Kesildi! (senaryo: ekip/senaryo/elektrik.md, 7 sahne)
 * Akşam Mino ile Kino küp kule yaparken elektrikler gider; Kino karanlıktan korkar. Tek hedef: ışıklar gelene kadar
 * Kino'ya cesaret vermek. 1 Pıt! kısık sesle Kino'yu masanın altından çıkar → 2 çekmecede sesinden feneri bul
 * (5-6: pili de bul, tak) → 3 ışık lekesini gezdir, Mino zıplasın, sonunda Kino'nun kafasına konsun → 4 susup
 * karanlığın seslerini bul (saat, saksı, Kino'nun altındaki gıcırtılı kemik) → 5 karşıdaki Can'ın fener işaretine
 * alkışla cevap ver → 6 battaniye çadırı, kamp şarkısını alkışla çal, çadır çöker ("hayalet Kino") → 7 Geldiii!
 * diye bağır, feneri kapatıp çekmeceye koy; Kino büyük lambayı kendisi kapatır.
 *
 * Her sesli görevin parmak karşılığı var; 2 yanlışta ya da 12 sn'de parmak ipucu; her yaşta 3. denemede kabul.
 * Algılama kilitli ses sisteminden (ekip/SES-SISTEMI.md): SesSeviyesi (ege-seviye.ts, kısık ses), SessizlikSayaci,
 * Alkis, yüksek ses (Doğum Günü'ndeki "Sürpriz!" kuralı). Oyun ses çıkarırken kulak susar; sesli görevlerde müzik durur.
 *
 * Dünya: yatay telefonda sahne kare (arka plan resminin tamamı; pencere de görünsün), kamera kaydırarak gezer
 * (translate + scale; kendi kameramız). Karanlık dünyanın içinde en üstte (kamera ile birlikte yaklaşır).
 */
import '../../src/karakter/karakter.css';
import './elektrik.css';
import EL from '../../content/macera-elektrik.json';
import { KINO_SESI, konus } from '../../src/audio/ses';
import { muzikBaslat, muzikDurdur } from '../../src/audio/muzik';
import { durum } from '../../src/engine/ilerleme';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { SessizlikSayaci, type Ozellik } from '../../ses-testi/src/analiz';
import { Alkis } from '../../orman/src/gorev';
import { kulak } from '../../orman/src/kulak';
import type { BolumArayuz } from './dogumgunu';
import { Sahne, yanDolguEkle } from './sahne';
import { adres } from './gorsel';
import { Kisi } from './banyo-karakter';
import { SesSeviyesi } from './ege-seviye';
import { Ipucu, iz, parmak, Surukle, type Hedef } from './ege-surukle';
import {
  CADIR_ORAN,
  CADIR_SVG,
  CEKMECE_IC_SVG,
  CEKMECE_ON_SVG,
  CEKMECE_YAKIN_SVG,
  CEKMECE_YER,
  COKUK_SVG,
  ELDIVEN_ORAN,
  ELDIVEN_SVG,
  esya,
  FENER_ORAN,
  FENER_SVG,
  GOLGE_CANAVAR,
  KEMIK_SVG,
  KOMODIN_ORAN,
  KOMODIN_SVG,
  kupResim,
  type KupRenk,
  LAMBA_ORAN,
  LAMBA_SVG,
  mandalSvg,
  PIL_ORAN,
  PIL_SVG,
  RENDE_ORAN,
  RENDE_SVG,
  SAAT_ORAN,
  SAAT_SVG,
  SAKSI_SVG,
  SANDALYE_SVG,
  tekil,
  YASTIK_SVG,
} from './elektrik-cizim';
import { balonGoster, Gece, GecePencere, PENCERE } from './elektrik-efekt';
import {
  aranan,
  cagriSonucu,
  cekmeceEsyalari,
  cikisAdimi,
  CIKIS_ADIM,
  DURMA_SURE,
  elektrikAyar,
  ESYA_SESI,
  IPUCU_SURE,
  isaretSonuc,
  kabulMu,
  kampNotalari,
  kampSatirBaslari,
  kampTurAyar,
  kampTurlari,
  kucukMu,
  yankiSonuc,
  type KampTur,
  Oksama,
  SES_SIRASI,
  sessizlikIlerle,
  YuksekSes,
  yon,
  ZIPLAMA_SAYISI,
  type EsyaAd,
  type SesKaynagi,
  type ZiplamaYeri,
} from './elektrik-mantik';
import * as S from './elektrik-ses';

const M = EL.mino;
const KN_ = EL.kino;
const B = EL.balon;
const I = EL.ipucu;
const IPTAL = Symbol('iptal');
const KINO_RESIM = import.meta.glob<string>('../../assets/karakter-iskelet/kino.svg', { eager: true, query: '?url', import: 'default' });
const kutu = (el: Element) => () => el.getBoundingClientRect();
const merkezi = (r: DOMRect): [number, number] => [r.left + r.width / 2, r.top + r.height / 2];
/** Kişi çizimi (Mino ve Kino aynı kutu oranı) */
const KISI_W = 24;
const KISI_ORAN = 1790 / 1360;
/** Kuledeki küpler alttan üste (en üstteki sarıyı Kino koyar; çizimler elektrik-cizim.ts → kupResim) */
const KUPLER: KupRenk[] = ['kirmizi', 'mavi', 'yesil', 'sari'];

export async function elektrikKesildi(kok: HTMLElement, ui: BolumArayuz): Promise<void> {
  const yas = durum.i.yas ?? 4;
  const ayar = elektrikAyar(yas);
  const mik = () => kulak.acik && !TEST_MODU;

  // ================================================================ sahne ve dünya ölçüsü
  const sahne = new Sahne('parti-sahne/oda', 'parti-sahne/oda-dikey');
  sahne.el.classList.add('el-sahne');
  kok.append(sahne.el);
  // yatay ekranda sahne ortada dikey bir bantta; iki yanı odanın geniş çizimi (yoksa bulanık devamı; sahne.ts →
  // yanDolgu), karanlıkta kararır
  yanDolguEkle(kok, adres('parti-sahne/oda'), adres('parti-sahne/oda-genis'));
  const W = sahne.el.clientWidth || innerWidth;
  const H = sahne.el.clientHeight || innerHeight;
  /** Yatay ekranda dünya kare: arka plan resminin tamamı (pencere dahil) dünyada; kamera aşağıdan başlar */
  const Wd = W;
  const Hd = Math.max(H, W);
  const dunya = sahne.dunya;
  dunya.style.height = `${Hd}px`;
  dunya.style.bottom = 'auto';
  // b birimi dünyaya göre (yatay telefonda dünya kare): CSS'teki --b ile aynı
  // (yatay telefonda ekran alçak: birim ekran yüksekliğine göre de sınırlanır, oda ve karakterler çekime sığsın)
  const bPx = Math.min(Wd * 0.0116, Hd * 0.0075, W / H > 1.3 ? H * 0.0115 : Infinity);
  sahne.el.style.setProperty('--b', `${bPx.toFixed(3)}px`);
  const bX = (n: number) => ((n * bPx) / Wd) * 100;
  const bY = (n: number) => ((n * bPx) / Hd) * 100;
  const dikey = W / H < 0.8;
  /** Yatay telefon (alçak ekran): bazı çekim ve yerleşimler buna göre */
  const yatayTel = W / H > 1.3;
  /** Arka plan resmindeki bir nokta (1024×1024, cover, konum 50% 82%): dünya % (x soldan, y alttan, ust üstten) */
  const arkaS = Math.max(Wd / 1024, Hd / 1024);
  const arkaNokta = (ix: number, iy: number) => {
    const X = (Wd - 1024 * arkaS) * 0.5 + ix * arkaS;
    const Y = (Hd - 1024 * arkaS) * 0.82 + iy * arkaS;
    return { x: (X / Wd) * 100, y: ((Hd - Y) / Hd) * 100, ust: (Y / Hd) * 100 };
  };
  /** Duvarın dibi (arka plandaki zeminin üst çizgisi, alttan %) ve ön zemin */
  const DUVAR = arkaNokta(512, 775).y;
  const Z = dikey ? 7 : 5;
  /** Konum: u (merkezden b birimi), v (ön zeminden b birimi) */
  const X = (u: number) => 50 + bX(u);
  const Y = (v: number) => Z + bY(v);
  /** Duvar dibine yakın (arka) eşyaların tabanı */
  const ARKA = (v = 0) => DUVAR - bY(4) + bY(v);

  // ================================================================ kendi kameramız (kaydırma + yakınlık)
  let kamZ = 1;
  let kamT: [number, number] = [0, H - Hd];
  dunya.style.transformOrigin = '0 0';
  const kamUygula = (ms: number) => {
    dunya.style.transitionDuration = `${sure(ms)}ms`;
    dunya.style.transform = `translate(${kamT[0].toFixed(1)}px, ${kamT[1].toFixed(1)}px) scale(${kamZ.toFixed(4)})`;
    sahne.el.dataset.kamera = `${kamZ.toFixed(2)}`;
  };
  kamUygula(0);
  /** Güvenli alan (px): üstte düğme ve yazı, altta ipucu */
  const GUVEN = { ust: dikey ? 104 : 78, alt: dikey ? 84 : 56 };
  /**
   * Çekim: dünyadaki bir bölge (% : sol, sağ, alttan alt, alttan üst) güvenli alana sığsın; zmax en çok yakınlık.
   * Dünya ekranı her zaman örter (kenar boşluğu görünmez).
   */
  const cek = (l: number, r: number, alt: number, ust: number, zmax = 1.6, ms = 1100) => {
    const gw = W;
    const gh = H - GUVEN.ust - GUVEN.alt;
    const hesap = (l: number, r: number) => {
      const bw = ((r - l) / 100) * Wd;
      const bh = ((ust - alt) / 100) * Hd;
      const z = Math.max(1, Math.min(zmax, gw / Math.max(1, bw), gh / Math.max(1, bh)));
      const cx = ((l + r) / 200) * Wd;
      const cy = Hd - ((alt + ust) / 200) * Hd;
      const tx = Math.min(0, Math.max(W - Wd * z, gw / 2 - cx * z));
      const ty = Math.min(0, Math.max(H - Hd * z, GUVEN.ust + gh / 2 - cy * z));
      return { z, tx, ty };
    };
    let c = hesap(l, r);
    // kadraj koruması (Ege ve banyodaki gibi): Mino ya da Kino kenarda yarım kalmaz; yarım kalacaksa çekim onu da
    // içine alacak kadar genişler (yakınlık düşer), neredeyse tamamen dışarıdaysa dışarı itilir
    for (const k of [MN, KN, MN, KN]) {
      const kk = kisiKutu(k);
      if (!kk) continue;
      const vl = ((-c.tx / c.z) / Wd) * 100;
      const vr = (((W - c.tx) / c.z) / Wd) * 100;
      if (kk.r <= vl || kk.l >= vr || (kk.l >= vl && kk.r <= vr)) continue;
      const gorunen = (Math.min(vr, kk.r) - Math.max(vl, kk.l)) / (kk.r - kk.l);
      if (gorunen < 0.25) {
        // dışarı it: kadrajın kenarı kişinin öbür yanına (istenen bölge yine içeride kalıyorsa)
        const solda = kk.l < vl;
        const tx = solda ? -((kk.r + 0.5) / 100) * Wd * c.z : W - ((kk.l - 0.5) / 100) * Wd * c.z;
        const yl = ((-tx / c.z) / Wd) * 100;
        const yr = (((W - tx) / c.z) / Wd) * 100;
        if (yl <= l + 0.01 && yr >= r - 0.01 && tx <= 0 && tx >= W - Wd * c.z) {
          c = { ...c, tx };
          continue;
        }
      }
      l = Math.min(l, kk.l - 1);
      r = Math.max(r, kk.r + 1);
      c = hesap(l, r);
    }
    kamZ = c.z;
    kamT = [c.tx, c.ty];
    kamUygula(ms);
    return bekle(ms * 0.9);
  };
  /** Ekran noktası → dünya pikseli (ölçeksiz) */
  const dunyaPx = (cx: number, cy: number): [number, number] => {
    const r = dunya.getBoundingClientRect();
    return [((cx - r.left) / r.width) * Wd, ((cy - r.top) / r.height) * Hd];
  };
  /** Ekran noktası → dünya % (x soldan, y alttan) */
  const dunyada = (cx: number, cy: number) => {
    const [x, y] = dunyaPx(cx, cy);
    return { x: (x / Wd) * 100, y: ((Hd - y) / Hd) * 100 };
  };
  /** Dünya % → dünya pikseli */
  const px = (x: number, yAlt: number): [number, number] => [(x / 100) * Wd, Hd - (yAlt / 100) * Hd];

  // ================================================================ karanlık ve pencere
  const gece = new Gece();
  dunya.append(gece.el);
  gece.olcu(Wd, Hd);
  const pencere = new GecePencere();
  dunya.append(pencere.el);
  {
    const a = arkaNokta(0, 0);
    pencere.yerlestir(a.x, a.ust, ((1024 * arkaS) / Wd) * 100, ((1024 * arkaS) / Hd) * 100);
    const cam = arkaNokta(PENCERE.x, PENCERE.y + PENCERE.r * 0.6);
    gece.ay(cam.x + bX(8), cam.ust, bX(30), 100 - Z - bY(2));
  }
  const camMerkez = arkaNokta(PENCERE.x, PENCERE.y);
  const camR = ((PENCERE.r * arkaS) / Wd) * 100;
  const camRy = ((PENCERE.r * arkaS) / Hd) * 100;

  // ================================================================ eşyalar
  const koy = (el: HTMLElement, x: number, y: number, w: number, z: number) => sahne.koy(el, { x, y, w, z });
  // koltuk (sağ arka) ve üstünde katlı battaniye
  const KOLTUK = { x: X(dikey ? 27 : 31), y: ARKA(), w: 30 };
  const koltuk = koy(h('div.el-koltuk', { 'data-el': 'koltuk' }, esya('koltuk', '', 'Koltuk', 'parti/koltuk')), KOLTUK.x, KOLTUK.y, KOLTUK.w, 3);
  const koltukH = KOLTUK.w * (396 / 512);
  // ayaklı lamba (koltuğun solunda, arkada): başta yanıyor
  const LAMBA = { x: X(dikey ? 12 : 15), y: ARKA(1), w: 10 };
  const lamba = koy(h('div.el-lamba.yanik', { 'data-el': 'lamba' }, h('i.el-lamba-hale'), esya('lamba', LAMBA_SVG, 'Lamba')), LAMBA.x, LAMBA.y, LAMBA.w, 2);
  // komodin (sol arka) + çekmece + üstünde saksı
  const KOMODIN = { x: X(dikey ? -27 : -30), y: ARKA(), w: 20 };
  const komodinH = KOMODIN.w * KOMODIN_ORAN;
  const komodin = koy(h('div.el-komodin', { 'data-el': 'komodin' }, esya('komodin', KOMODIN_SVG, 'Komodin')), KOMODIN.x, KOMODIN.y, KOMODIN.w, 3);
  const cekmece = h(
    'div.el-cekmece',
    { 'data-el': 'cekmece', style: `left:${CEKMECE_YER.x * 100}%;top:${CEKMECE_YER.y * 100}%;width:${CEKMECE_YER.w * 100}%;height:${CEKMECE_YER.h * 100}%` },
    h('div.el-cekmece-ic', { html: CEKMECE_IC_SVG }),
    h('div.el-cekmece-on', { html: tekil(CEKMECE_ON_SVG) }),
  );
  komodin.append(cekmece);
  const SAKSI = { x: KOMODIN.x + bX(4), y: KOMODIN.y + bY(komodinH * 0.86), w: 8 };
  const saksi = koy(h('div.el-saksi', { 'data-el': 'saksi' }, esya('saksi', SAKSI_SVG, 'Saksı'), h('i.el-damla'), h('i.el-damla.d2')), SAKSI.x, SAKSI.y, SAKSI.w, 4);
  // duvar saati (komodin ile lambanın arasında, duvarda)
  // (yatay telefonda ekran alçak: saat duvarda daha aşağıda, sahne 4 çekimine Kino ile birlikte sığsın)
  const SAAT = { x: X(dikey ? -6 : -8), y: DUVAR + bY(dikey ? 24 : yatayTel ? 5 : 20), w: 10 };
  const saat = koy(h('div.el-saat', { 'data-el': 'saat' }, esya('saat', SAAT_SVG, 'Saat')), SAAT.x, SAAT.y, SAAT.w, 1);
  // masa (ortada, örtülü): Kino altına saklanır
  const MASA = { x: X(5), y: Y(8), w: 32 };
  const masaH = MASA.w * (349 / 512);
  const masa = koy(h('div.el-masa', { 'data-el': 'masa' }, esya('masa', '', 'Masa', 'parti/masa')), MASA.x, MASA.y, MASA.w, 6);
  // küp kule (masanın solunda, önde)
  const KULE = { x: X(-7.5), y: Y(1), w: 7 };
  // küpler aynı katmanda (masanın önünde, Kino ile Mino'nun arkasında); üst üste binen küpte sonraki üstte kalır
  const kupler = KUPLER.map((renk, i) => koy(h('div.el-kup', {}, kupResim(renk)), KULE.x, KULE.y + bY(i * 7 * 0.84), KULE.w, 7));
  kupler[3].style.opacity = '0';
  // katlı battaniye (koltuğun oturağında)
  const battaniyeYer = { x: KOLTUK.x - bX(2), y: KOLTUK.y + bY(koltukH * 0.3), w: 13 };
  const battaniye = koy(h('div.el-battaniye', { 'data-el': 'battaniye' }, esya('battaniye', '', 'Battaniye', 'ege/battaniye-anne')), battaniyeYer.x, battaniyeYer.y, battaniyeYer.w, 4);

  // ================================================================ karakterler
  const MN = new Kisi('mino');
  const KN = new Kisi('kino');
  MN.el.dataset.el = 'mino';
  KN.el.dataset.el = 'kino';
  // (aralarında boşluk: yan yana dururken biri ötekinin yüzünü örtmesin; çizimlerin görünen gövdesi ~19 b)
  const MINO_YER = { x: X(-19), y: Y(-1) };
  const KINO_YER = { x: X(3), y: Y(0) };
  sahne.koy(MN.el, { ...MINO_YER, w: KISI_W, z: 9 });
  sahne.koy(KN.el, { ...KINO_YER, w: KISI_W, z: 8 });
  // kadraj koruması için gidilen yer (yürürken de bilinsin)
  const hedefY = new Map<Kisi, number>();
  for (const k of [MN, KN]) {
    const git = k.git.bind(k);
    k.git = (x, y, ...a) => {
      hedefY.set(k, y);
      return git(x, y, ...a);
    };
  }
  /** Kişinin dünyadaki görünen kutusu (%; çizim kutusunun boş kenarları hariç); saklıysa null */
  const kisiKutu = (k: Kisi) => {
    if (k.el.classList.contains('el-icerde')) return null;
    const x = k.hedefX;
    const kw = Number(k.el.style.getPropertyValue('--w')) || KISI_W;
    const w = bX(kw);
    const y = hedefY.get(k) ?? k.y;
    return { l: x - w / 2, r: x + w / 2, alt: y, ust: y + bY(kw * KISI_ORAN * 0.95) };
  };
  await KN.hazir();
  // Kino'nun korkusu (0..1). Yarının üstünde korkmuş Kino çizimi (Adobe: kafa-korku, goz-korku, agiz-korku,
  // kuyruk-korku; ekip/kino/IFADELER.md): kulaklar başa yapışık, kuyruk bacak arasında. Kodla yalnız büzülme:
  // gövde hafif basık, kafa omuzlara gömülü, titreme. Başka bir ifade (şaşkın, heyecan) bitince korkuya döner.
  let korku = 0;
  let korkuSimdi = 0;
  {
    const kar = KN.kar!;
    const eski = kar.ekHareket;
    kar.ekHareket = (p, t) => {
      eski?.(p, t);
      korkuSimdi += (korku - korkuSimdi) * (TEST_MODU ? 1 : 0.06);
      const k = korkuSimdi;
      if (korku >= 0.5 && kar.ifadeSu === null && kar.ifadeVar('korku')) kar.ifade('korku');
      else if (korku < 0.5 && kar.ifadeSu === 'korku') kar.ifade(null);
      if (k < 0.01) return;
      p.x += 0.6 * Math.sin(t * 52) * k;
      p.kafaY += 1.6 * k;
      p.sy *= 1 - 0.045 * k;
      p.sx *= 1 + 0.02 * k;
    };
  }
  const korkut = (k: number) => {
    korku = k;
    KN.el.classList.toggle('el-korkak', k >= 0.5);
  };
  /** Büzülmüş Kino (masanın altında): gövde toplanır (kodla) */
  const buzul = (acik: boolean) => KN.el.classList.toggle('el-buzuk', acik);
  /**
   * Avlanan Mino: gözleri ışığa kilitlenir (Adobe: goz-av, agiz-av → ifade 'av'), çömelir, kalçası havada kıçını
   * sallar, kuyruğu seğirir (kodla; tikte güncellenir)
   */
  let av = 0;
  const avlan = (acik: boolean) => {
    if (acik === !!av) return;
    av = acik ? 1 : 0;
    if (acik) void MN.mino?.ifade('av');
    else if (MN.mino) {
      MN.mino.ekPoz = null;
      if (MN.mino.ifadeSu === 'av') void MN.mino.ifade(null);
    }
  };
  const kisiH = KISI_W * KISI_ORAN;
  /** Sahne 6'nın çadırı sahne 7'ye geçer (akıştan önce tanımlı olmalı) */
  /** Yankı turlarının sırası (durum yazısında; test her yeni turu ayırt eder) */
  let yankiSira = 0;
  let sahne6Sonu: { cadir: HTMLElement; CADIR: { x: number; y: number; w: number } } | null = null;

  // ================================================================ akış altyapısı
  const tikler = new Set<(dt: number) => void>();
  let iptaller: (() => void)[] = [];
  let kapandi = false;
  let onceki = performance.now();
  let saatT = 0;
  let raf = requestAnimationFrame(function d(t) {
    const dt = Math.min(0.1, (t - onceki) / 1000);
    onceki = t;
    if (ui.kapandiMi() && !kapandi) {
      kapandi = true;
      iptaller.slice().forEach((f) => f());
    }
    gece.tik(dt);
    // avlanan Mino: kıç sallama + kuyruk
    if (av && MN.mino) {
      saatT += dt;
      MN.mino.ekPoz = { sx: 1.1, sy: 0.84, govdeAci: Math.sin(saatT * 16) * 3.5, kuyrukAci: Math.sin(saatT * 22) * 16, kafaY: 10 };
    }
    tikler.forEach((f) => f(dt));
    if (!kapandi) raf = requestAnimationFrame(d);
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
  function bekle(ms: number) {
    return gorev<void>((coz) => {
      const t = setTimeout(() => coz(), sure(ms));
      return () => clearTimeout(t);
    });
  }
  const tik = (f: (dt: number) => void) => {
    tikler.add(f);
    return () => void tikler.delete(f);
  };
  /** Test ve önizleme için: şu anki görev (e2e testi bunu okuyup parmakla oynar) */
  const durumYaz = (ad: string | null, hedef?: string | number) => {
    if (ad) sahne.el.dataset.elGorev = ad;
    else delete sahne.el.dataset.elGorev;
    if (hedef !== undefined) sahne.el.dataset.elHedef = String(hedef);
    else delete sahne.el.dataset.elHedef;
  };

  const mSoyle = async (t: string) => {
    if (kapandi || ui.kapandiMi()) throw IPTAL;
    ui.yazi(t);
    await konus(t, { ton: 1.12 });
    if (kapandi || ui.kapandiMi()) throw IPTAL;
  };
  const kSoyle = async (t: string) => {
    if (kapandi || ui.kapandiMi()) throw IPTAL;
    ui.yazi(t);
    MN.mino!.agizSus = true;
    KN.konus(true);
    try {
      await konus(t, KINO_SESI);
    } finally {
      KN.konus(false);
      MN.mino!.agizSus = false;
    }
    if (kapandi || ui.kapandiMi()) throw IPTAL;
  };
  const balonKatman = h('div.el-balonlar');
  sahne.el.append(balonKatman);
  /** Konuşma balonu (seslendirilmez): kişinin başının üstünde */
  const balon = (hedef: Kisi | HTMLElement, yazi: string, ms = 1300) => {
    const el = hedef instanceof Kisi ? hedef.kap : hedef;
    return balonGoster(balonKatman, el.getBoundingClientRect(), yazi, ms, hedef instanceof Kisi ? 0.06 : 0);
  };
  const konfeti = (el: Element, adet = 50) => {
    const [x, y] = merkezi(el.getBoundingClientRect());
    konfetiPatlat(kok, x, y, adet);
  };

  // müzik: genel müziği durdur, bölümün gece müziği (yalnız mikrofonun dinlemediği anlarda)
  muzikDurdur();
  const muzik = new S.GeceMuzik();
  const muzikAc = () => {
    if (!TEST_MODU && !kapandi) muzik.baslat();
  };
  const sesliGorev = async <T>(f: () => Promise<T>): Promise<T> => {
    muzik.durdur();
    try {
      return await f();
    } finally {
      muzikAc();
    }
  };

  // sürükleme + ipucu (görev bitince kapanır)
  const acik = new Set<{ kapat(): void }>();
  const surukle = (el: HTMLElement, hedefler: Hedef[], birak: (ad: string | null) => boolean | void, izHedef?: () => DOMRect) => {
    const s = new Surukle(el, { hedefler, birak, iz: izHedef ? { katman: sahne.on, kutu: izHedef } : undefined });
    acik.add(s);
    return s;
  };
  const ipucu = (kaynak: () => DOMRect, hedef?: () => DOMRect, ms = IPUCU_SURE * 1000) => {
    const i = new Ipucu(() => parmak(sahne.on, kaynak, hedef), TEST_MODU ? 60000 : ms);
    acik.add(i);
    return i;
  };
  const bitir = (...x: ({ kapat(): void } | null | undefined)[]) =>
    x.forEach((o) => {
      o?.kapat();
      if (o) acik.delete(o);
    });
  iptaller.push(() => acik.forEach((o) => o.kapat()));

  /** Bir elemanı dünyada yeni yere taşır (FLIP; --x/--y/--w) */
  const tasi = async (el: HTMLElement, x: number, y: number, ms = 450, w?: number, egri = 'cubic-bezier(0.3, 0, 0.3, 1.15)') => {
    const once = el.getBoundingClientRect();
    el.style.translate = '';
    el.getAnimations().forEach((a) => a.cancel());
    el.style.setProperty('--x', String(x));
    el.style.setProperty('--y', String(y));
    if (w !== undefined) el.style.setProperty('--w', String(w));
    const sonra = el.getBoundingClientRect();
    const olcek = sonra.width / Math.max(1, el.offsetWidth) || 1;
    const dx = (once.left + once.width / 2 - (sonra.left + sonra.width / 2)) / olcek;
    const dy = (once.top + once.height / 2 - (sonra.top + sonra.height / 2)) / olcek;
    const s = once.width / Math.max(1, sonra.width);
    await el.animate([{ translate: `${dx}px ${dy}px`, scale: String(s) }, { translate: '0px 0px', scale: '1' }], { duration: sure(ms), easing: egri }).finished.catch(() => undefined);
  };
  /** Yay çizerek uçuş (FLIP + yukarı kavis) */
  const ucur = async (el: HTMLElement, x: number, y: number, ms = 600, yay = 30, w?: number, don = 0) => {
    const once = el.getBoundingClientRect();
    el.getAnimations().forEach((a) => a.cancel());
    el.style.translate = '';
    el.style.setProperty('--x', String(x));
    el.style.setProperty('--y', String(y));
    if (w !== undefined) el.style.setProperty('--w', String(w));
    const sonra = el.getBoundingClientRect();
    const olcek = sonra.width / Math.max(1, el.offsetWidth) || 1;
    const dx = (once.left + once.width / 2 - (sonra.left + sonra.width / 2)) / olcek;
    const dy = (once.top + once.height / 2 - (sonra.top + sonra.height / 2)) / olcek;
    const s = once.width / Math.max(1, sonra.width);
    await el
      .animate(
        [
          { translate: `${dx}px ${dy}px`, scale: String(s), rotate: '0deg' },
          { translate: `${dx * 0.5}px ${dy * 0.5 - yay}px`, scale: String((s + 1) / 2), rotate: `${don / 2}deg`, offset: 0.5 },
          { translate: '0px 0px', scale: '1', rotate: `${don}deg` },
        ],
        { duration: sure(ms), easing: 'cubic-bezier(0.35, 0, 0.45, 1)' },
      )
      .finished.catch(() => undefined);
  };
  /** Konmuş eşya: küçük basılıp toparlanma */
  const otur = (el: HTMLElement) =>
    el.animate([{ scale: '1.15 0.85' }, { scale: '0.95 1.06' }, { scale: '1 1' }], { duration: sure(360), easing: 'cubic-bezier(0.3, 1.5, 0.5, 1)' }).finished.catch(() => undefined);
  const salla = (el: HTMLElement, guc = 1) =>
    el
      .animate(
        [{ rotate: '0deg' }, { rotate: `${-10 * guc}deg`, offset: 0.2 }, { rotate: `${9 * guc}deg`, offset: 0.45 }, { rotate: `${-6 * guc}deg`, offset: 0.7 }, { rotate: '0deg' }],
        { duration: sure(520), easing: 'ease-in-out' },
      )
      .finished.catch(() => undefined);

  /** Yumuşak çıkış: küçülüp solar, sonra kaldırılır (hiçbir şey birden kaybolmaz) */
  const sondur = async (el: Element | null | undefined, ms = 320, kaldir = true) => {
    if (!el) return;
    await el
      .animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '0.6' }], { duration: sure(ms), easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' })
      .finished.catch(() => undefined);
    if (kaldir) {
      el.remove();
      // (yeniden eklenen düğme saydam kalmasın)
      el.getAnimations().forEach((a) => a.cancel());
    }
  };
  /** Yumuşak giriş: büyüyerek belirir */
  const belir = (el: Element, ms = 380) =>
    el.animate([{ opacity: 0, scale: '0.4' }, { opacity: 1, scale: '1.08', offset: 0.7 }, { opacity: 1, scale: '1' }], { duration: sure(ms), easing: 'cubic-bezier(0.3, 1.3, 0.5, 1)' });
  /** Kalpçik: ekrandaki bir noktadan yukarı süzülür (Kino'yu okşarken) */
  const kalp = (x: number, y: number) => {
    const sr = sahne.el.getBoundingClientRect();
    const e = h('i.el-kalp', { style: `left:${x - sr.left}px;top:${y - sr.top}px;--dx:${(Math.random() * 40 - 20).toFixed(0)}px` });
    sahne.el.append(e);
    setTimeout(() => e.remove(), sure(1300));
  };

  // ================================================================ serbest dokunma (her an): Mino ve Kino tepki verir
  let sonSerbest = 0;
  let serbestAcik = true;
  const serbest = (k: Kisi) => (e: PointerEvent) => {
    // ışığın ya da sesin yerini gösterme görevlerinde dokunuş sahneye geçer (Kino'nun altındaki kemik gibi)
    const g = sahne.el.dataset.elGorev ?? '';
    if (!serbestAcik || performance.now() - sonSerbest < 800 || g === 'kino' || g === 'isik' || g === 'bul' || g === 'sev') return;
    sonSerbest = performance.now();
    e.stopPropagation();
    if (k === MN) {
      MN.tepki('gidik');
      void balon(MN, B.miyav, 900);
      S.miyav();
    } else {
      if (korku > 0.5) {
        void KN.titre(500);
        void balon(KN, B.ii, 900);
      } else {
        KN.kinoOynat('coskulu', 900);
        void balon(KN, B.hav, 900);
      }
    }
  };
  MN.kap.addEventListener('pointerdown', serbest(MN));
  KN.kap.addEventListener('pointerdown', serbest(KN));

  // ================================================================ akış
  try {
    muzikAc();
    await sahne1();
    await sahne2();
    await sahne3();
    await sahne4();
    await sahne5();
    await sahne6();
    await sahne7();
  } catch (e) {
    if (e !== IPTAL) throw e;
  } finally {
    cancelAnimationFrame(raf);
    muzik.durdur();
    kulak.dinle(null);
    ui.ipucu(null);
    ui.dugmeKaldir();
    durumYaz(null);
    acik.forEach((o) => o.kapat());
    MN.kapat();
    KN.kapat();
    // menünün genel müziği geri gelsin (banyo / ege gibi)
    muzikBaslat();
  }

  // ================================================================ 1: Pıt!
  async function sahne1() {
    ui.ilerleme(0, 7);
    // aydınlık salon: kule, Mino ve Kino
    void cek(X(-30), X(15), Y(-3), Y(38), 2, 0);
    await bekle(600);
    await mSoyle(M.giris);
    // Kino son küpü dikkatle koyar (dili dışarıda), küp kavis çizip kulenin tepesine oturur
    KN.kinoOynat('bak', 1400, -1);
    const son = kupler[3];
    son.style.setProperty('--x', String(KINO_YER.x - bX(6)));
    son.style.setProperty('--y', String(KINO_YER.y + bY(kisiH * 0.3)));
    son.style.opacity = '1';
    await bekle(500);
    await ucur(son, KULE.x, KULE.y + bY(3 * 7 * 0.84), 700, 40);
    void otur(son);
    S.kupDus();
    await bekle(250);
    KN.tepki('zipla');
    void balon(KN, B.yasasin, 900);
    MN.tepki('evet');
    await bekle(900);

    // PIT!
    S.pit();
    lamba.classList.remove('yanik');
    gece.seviye('tam');
    gece.karanlik(true, 120);
    sahne.el.classList.add('el-karanlik');
    gece.titret();
    void balon(lamba, B.pit, 1100);
    await bekle(350);
    // en üstteki küp sarsılıp düşer
    void (async () => {
      await salla(son, 0.6);
      await ucur(son, KULE.x + bX(9), Y(-2), 520, 18, undefined, 110);
      S.kupDus();
      void otur(son);
    })();
    // Kino korkar, masanın altına fırlar
    korkut(1);
    MN.mino!.ifade('saskin', 1800);
    MN.tepki('sasir');
    await bekle(300);
    await kSoyle(KN_.kim_var);
    S.patiler(7);
    const saklan = { x: MASA.x, y: MASA.y - bY(0.5) };
    const kosu = KN.git(saklan.x, saklan.y, 620, 5);
    setTimeout(() => (KN.katman = 5), sure(300));
    await kosu;
    KN.katman = 5;
    buzul(true);
    // örtü sallanır
    masa.animate([{ rotate: '0deg' }, { rotate: '-1.2deg' }, { rotate: '1deg' }, { rotate: '-0.5deg' }, { rotate: '0deg' }], { duration: sure(600), easing: 'ease-out', composite: 'add' });
    S.hisirti();
    await cek(X(-30), X(14), Y(-3), Y(34), 2.1, 900);
    await mSoyle(M.kesildi);
    await mSoyle(M.korktu);
    await mSoyle(M.cagir);
    await sesliGorev(() => kinoCagir(saklan));
    // Kino çıkar: Mino'ya sokulur
    buzul(false);
    KN.katman = 8;
    korkut(0.7);
    await KN.git(MINO_YER.x + bX(19), Y(-1), 800);
    MN.tepki('saril');
    void balon(MN, B.gel, 1100);
    await bekle(500);
    await kSoyle(KN_.korkuyorum);
    // Kino'yu teselli: başını okşa, her okşayışta titremesi azalır, kalpçikler uçar; sonunda derin bir "Ohh…"
    await cek(Math.min(MN.x, KN.x) - bX(16), Math.max(MN.x, KN.x) + bX(16), Y(-3), Y(0) + bY(kisiH + 8), 2.2, 800);
    await mSoyle(M.oksa);
    await kinoSev();
    korkut(0.45);
    KN.kinoIfade('sicak', 2200);
    void balon(KN, B.oh, 1200);
    // derin nefes: göğüs şişer, omuzlar iner
    KN.gov.animate([{ scale: '1 1' }, { scale: '1.05 1.08', offset: 0.45 }, { scale: '0.98 0.96', offset: 0.75 }, { scale: '1 1' }], { duration: sure(1300), easing: 'ease-in-out' });
    await bekle(500);
    await kSoyle(KN_.iyiyim);
    MN.tepki('evet');
    ui.ilerleme(1, 7);
    await mSoyle(M.fener);
  }

  /**
   * Kino'yu teselli: başını okşa (sürt) ya da hafifçe pat pat dokun. 3 okşayış: her birinde korku azalır (titreme
   * yumuşar), kalpçik uçar, Kino gözlerini kapayıp başını ele yaslar. Yanlışı yok; 12 sn'de parmak ipucu.
   */
  function kinoSev(): Promise<void> {
    const GEREK = 3;
    durumYaz('sev', GEREK);
    ui.ipucu(I.sev);
    const bas_ = () => {
      const r = KN.kap.getBoundingClientRect();
      return new DOMRect(r.left + r.width * 0.3, r.top + r.height * 0.18, 1, 1);
    };
    const ip = ipucu(bas_, () => {
      const r = KN.kap.getBoundingClientRect();
      return new DOMRect(r.left + r.width * 0.7, r.top + r.height * 0.18, 1, 1);
    });
    return gorev<void>((coz) => {
      let n = 0;
      let son: [number, number] | null = null;
      let yol = 0;
      let sonOk = 0;
      const oks = new Oksama(TEST_MODU ? 0.5 : 0.9);
      const say = (x: number, y: number) => {
        if (n >= GEREK || performance.now() - sonOk < 350) return;
        sonOk = performance.now();
        n++;
        ip.ilerle();
        durumYaz('sev', GEREK - n);
        kalp(x, y - 10);
        S.hisirti();
        korkut(Math.max(0.5, 1 - n * 0.17));
        KN.kinoIfade(n >= 2 ? 'sicak' : 'uzgun', 1600);
        // başını ele yaslar: kafa yana eğilip geri gelir
        KN.gov.animate([{ rotate: '0deg' }, { rotate: `${n % 2 ? 4 : -4}deg`, offset: 0.4 }, { rotate: '0deg' }], { duration: sure(700), easing: 'ease-in-out' });
        if (n >= GEREK) setTimeout(coz, sure(500));
      };
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        son = [e.clientX, e.clientY];
        yol = 0;
        try {
          KN.kap.setPointerCapture(e.pointerId);
        } catch {
          /* test */
        }
      };
      const hareket = (e: PointerEvent) => {
        if (!son) return;
        const w = Math.max(1, KN.kap.getBoundingClientRect().width);
        const dx = (e.clientX - son[0]) / w;
        const dy = (e.clientY - son[1]) / w;
        yol += Math.hypot(dx, dy);
        son = [e.clientX, e.clientY];
        if (oks.hareket(dx, dy)) say(e.clientX, e.clientY);
      };
      const birak = (e: PointerEvent) => {
        // sürtmeden kısa dokunuş: pat pat (o da sayılır)
        if (son && yol < 0.1) say(e.clientX, e.clientY);
        son = null;
      };
      KN.kap.addEventListener('pointerdown', bas);
      KN.kap.addEventListener('pointermove', hareket);
      KN.kap.addEventListener('pointerup', birak);
      KN.kap.addEventListener('pointercancel', birak);
      KN.kap.classList.add('el-sevilir');
      return () => {
        bitir(ip);
        KN.kap.classList.remove('el-sevilir');
        KN.kap.removeEventListener('pointerdown', bas);
        KN.kap.removeEventListener('pointermove', hareket);
        KN.kap.removeEventListener('pointerup', birak);
        KN.kap.removeEventListener('pointercancel', birak);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  /** Kino'yu kısık sesle (ya da örtüyü okşayarak) çağır: kulak → burun → çıkış */
  function kinoCagir(saklan: { x: number; y: number }): Promise<void> {
    const kx = saklan.x;
    const ADIM_X = [0, bX(-7), bX(-11)];
    let adim = 0;
    let yanlis = 0;
    let uyari = 0;
    let mesgul = false;
    durumYaz('cagir');
    ui.ipucu(mik() ? I.cagir : I.cagir_dokun);
    const sv = new SesSeviyesi(kulak.ayar);
    const oks = new Oksama(TEST_MODU ? 0.9 : 1.1);
    const ip = ipucu(() => new DOMRect(masa.getBoundingClientRect().left + masa.getBoundingClientRect().width * 0.25, masa.getBoundingClientRect().top + masa.getBoundingClientRect().height * 0.4, 1, 1), () => new DOMRect(masa.getBoundingClientRect().left + masa.getBoundingClientRect().width * 0.75, masa.getBoundingClientRect().top + masa.getBoundingClientRect().height * 0.4, 1, 1));
    return gorev<void>((coz) => {
      if (!TEST_MODU) setTimeout(() => coz(), 25000); // takılırsa kendiliğinden geçer
      const ilerle = async () => {
        if (mesgul) return;
        mesgul = true;
        adim = cikisAdimi(adim, 'yumusak', ayar.geriAdim);
        ip.ilerle();
        if (adim >= CIKIS_ADIM) {
          coz();
          return;
        }
        // bir adım: önce kulak, sonra burun görünür (örtünün kenarından yana kayar, eğilerek bakar)
        await KN.git(kx + ADIM_X[adim], saklan.y, 700);
        KN.kinoOynat('bak', 1600, -1);
        if (adim === 1) void balon(KN, B.ii, 1000);
        else {
          KN.kinoIfade('saskin', 1400);
          void balon(KN, B.ii, 1000);
        }
        mesgul = false;
      };
      const bagirdi = async () => {
        if (mesgul) return;
        mesgul = true;
        yanlis++;
        ip.yanlis();
        // 3-4 yaşta ve her yaşta 3. denemede: yüksek ses de çağrı sayılır (titreyip gelir)
        if (kabulMu(yanlis) && !ayar.geriAdim) {
          mesgul = false;
          void ilerle();
          return;
        }
        adim = cikisAdimi(adim, 'yuksek', ayar.geriAdim && !kabulMu(yanlis));
        S.inilti();
        void balon(KN, B.iii, 1000);
        await KN.git(kx + ADIM_X[adim], saklan.y, 300);
        buzul(true);
        void KN.titre(900);
        masa.animate([{ translate: '0 0' }, { translate: '1.5% 0' }, { translate: '-1.5% 0' }, { translate: '0 0' }], { duration: sure(400), iterations: 2, composite: 'add' });
        if (performance.now() - uyari > 6000) {
          uyari = performance.now();
          await mSoyle(M.yumusak).catch(() => undefined);
        }
        mesgul = false;
      };
      sv.onSoyleyis = (s) => {
        if (cagriSonucu(s.sonuc) === 'yumusak') {
          S.hisirti();
          void ilerle();
        } else void bagirdi();
      };
      kulak.dinle((o) => sv.kare(o));
      // parmak: örtüyü okşamak
      let son: [number, number] | null = null;
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        son = [e.clientX, e.clientY];
        try {
          masa.setPointerCapture(e.pointerId);
        } catch {
          /* test */
        }
      };
      const hareket = (e: PointerEvent) => {
        if (!son) return;
        const r = masa.getBoundingClientRect();
        const dx = (e.clientX - son[0]) / r.width;
        const dy = (e.clientY - son[1]) / r.width;
        son = [e.clientX, e.clientY];
        masa.style.setProperty('--oks', (Math.sin(performance.now() / 90) * 0.6).toFixed(2));
        if (oks.hareket(dx, dy)) {
          S.hisirti();
          void ilerle();
        }
      };
      const birak = () => {
        son = null;
        masa.style.setProperty('--oks', '0');
      };
      masa.classList.add('el-oksanir');
      masa.addEventListener('pointerdown', bas);
      masa.addEventListener('pointermove', hareket);
      masa.addEventListener('pointerup', birak);
      masa.addEventListener('pointercancel', birak);
      return () => {
        kulak.dinle(null);
        bitir(ip);
        masa.classList.remove('el-oksanir');
        masa.removeEventListener('pointerdown', bas);
        masa.removeEventListener('pointermove', hareket);
        masa.removeEventListener('pointerup', birak);
        masa.removeEventListener('pointercancel', birak);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  // ================================================================ 2: Çekmecede fener
  async function sahne2() {
    // komodine gidilir, çekmece açılır
    void MN.git(KOMODIN.x + bX(14), Y(0), 1000, 0, undefined, true);
    void KN.git(KOMODIN.x + bX(34), Y(1), 1100);
    await cek(KOMODIN.x - bX(14), KOMODIN.x + bX(45), Y(-2), KOMODIN.y + bY(komodinH + 10), 2, 1100);
    S.cekmece();
    cekmece.classList.add('acik');
    await bekle(700);
    // yakın çekim: yukarıdan açık çekmece (içi karanlık; parmağın altında küçük ışık halkası)
    const esyalar = cekmeceEsyalari(yas);
    const yakin = h('div.el-yakin', { 'data-el': 'yakin' });
    const ic = h('div.el-yakin-ic', { html: CEKMECE_YAKIN_SVG });
    const hale = h('i.el-yakin-hale');
    const karanlik = h('i.el-yakin-karanlik');
    yakin.append(ic);
    const ORAN: Record<EsyaAd, number> = { fener: FENER_ORAN, pil: PIL_ORAN, eldiven: ELDIVEN_ORAN, rende: RENDE_ORAN };
    const SVG: Record<EsyaAd, string> = { fener: FENER_SVG, pil: PIL_SVG, eldiven: ELDIVEN_SVG, rende: RENDE_SVG };
    const GEN: Record<EsyaAd, number> = { fener: 34, pil: 20, eldiven: 19, rende: 15 };
    const YER: [number, number, number][] = esyalar.length === 3 ? [[22, 50, -8], [52, 46, 6], [80, 52, -4]] : [[17, 52, -6], [43, 44, 5], [68, 50, 8], [88, 60, -12]];
    const esyaEl = new Map<EsyaAd, HTMLElement>();
    esyalar.forEach((ad, i) => {
      const [x, y, d] = YER[i];
      const el = h(`div.el-yesya`, { 'data-esya': ad, role: 'button', 'aria-label': ad, style: `left:${x}%;top:${y}%;width:${GEN[ad]}%;--d:${d}deg;aspect-ratio:${1 / ORAN[ad]}` }, esya(ad, SVG[ad], ad));
      esyaEl.set(ad, el);
      yakin.append(el);
    });
    yakin.append(karanlik, hale);
    sahne.el.append(yakin);
    void yakin.offsetWidth;
    yakin.classList.add('acik');
    // ışık halkası parmağı izler
    const haleYer = (cx: number, cy: number) => {
      const r = yakin.getBoundingClientRect();
      const x = ((cx - r.left) / r.width) * 100;
      const y = ((cy - r.top) / r.height) * 100;
      yakin.style.setProperty('--hx', `${x.toFixed(1)}%`);
      yakin.style.setProperty('--hy', `${y.toFixed(1)}%`);
    };
    const haleHareket = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.buttons || e.type === 'pointerdown') haleYer(e.clientX, e.clientY);
    };
    yakin.addEventListener('pointerdown', haleHareket);
    yakin.addEventListener('pointermove', haleHareket);
    await bekle(500);
    await mSoyle(M.dinle);
    await mSoyle(M.tik);

    const bulunan: EsyaAd[] = [];
    const gagYapildi = new Set<EsyaAd>();
    let fenerCikti = false;
    const fenerEl = esyaEl.get('fener')!;
    // eşyaya dokununca: sallanır, kendi sesini çıkarır
    const sesCal = (ad: EsyaAd) => {
      ({ tik: S.tikTik, tikir: S.tikir, pof: S.pof, sirr: S.sirr } as const)[ESYA_SESI[ad]]();
      void balonGoster(balonKatman, esyaEl.get(ad)!.getBoundingClientRect(), B[ESYA_SESI[ad]], 900);
    };
    while (true) {
      const hedef = aranan(bulunan, ayar.pilli);
      if (!hedef) break;
      durumYaz('cekmece', hedef);
      ui.ipucu(I.cekmece);
      const secilen = await gorev<EsyaAd>((coz) => {
        const ip = ipucu(kutu(esyaEl.get(hedef)!));
        let yanlis = 0;
        const dinleyiciler: [HTMLElement, (e: PointerEvent) => void][] = [];
        for (const [ad, el] of esyaEl) {
          if (bulunan.includes(ad) || (ad === 'fener' && fenerCikti)) continue;
          const f = (e: PointerEvent) => {
            e.stopPropagation();
            haleYer(e.clientX, e.clientY);
            void salla(el, 1);
            sesCal(ad);
            if (ad === hedef || (kabulMu(yanlis) && hedef === 'pil' && ad === 'pil')) coz(ad);
            else if (ad === hedef) coz(ad);
            else {
              yanlis++;
              ip.yanlis();
              if (!gagYapildi.has(ad) && (ad === 'eldiven' || ad === 'rende')) coz(ad);
            }
          };
          el.addEventListener('pointerdown', f);
          dinleyiciler.push([el, f]);
        }
        return () => {
          bitir(ip);
          dinleyiciler.forEach(([el, f]) => el.removeEventListener('pointerdown', f));
        };
      });
      durumYaz(null);
      ui.ipucu(null);
      if (secilen === 'eldiven' || secilen === 'rende') {
        gagYapildi.add(secilen);
        await bekle(450);
        await esyaSakasi(secilen, yakin, esyaEl.get(secilen)!);
        continue;
      }
      bulunan.push(secilen);
      const el = esyaEl.get(secilen)!;
      el.classList.add('bulundu');
      if (secilen === 'fener') {
        fenerCikti = true;
        // fener çekmecenin ortasına, büyür
        el.style.setProperty('--d', '0deg');
        el.animate([{ scale: '1' }, { scale: '1.12' }, { scale: '1' }], { duration: sure(400) });
        el.style.left = '50%';
        el.style.top = '40%';
        el.style.width = '46%';
        await bekle(450);
        await fenerYak(el, yakin);
      } else if (secilen === 'pil') {
        await pilTak(el, fenerEl, yakin);
      }
    }
    yakin.classList.add('isikli');
    await bekle(900);
    // yakın çekim kapanır: fener artık bizde, oda ışık lekesiyle aydınlanır
    yakin.classList.remove('acik');
    await bekle(450);
    yakin.remove();
    S.cekmece(true);
    cekmece.classList.remove('acik');
    gece.seviye('fener');
    const [mx, my] = px(X(-4), DUVAR + bY(14));
    gece.hedef(mx, my, true);
    gece.delik(Math.min(W, H) * (dikey ? 0.2 : 0.24) / Math.max(1, kamZ));
    gece.huzme(true);
    korkut(0.5);
    KN.kinoIfade(null);
    ui.ilerleme(2, 7);
  }

  /** Fenerin düğmesine bas: pilliyse yanar; değilse "tık"… yanmaz (pil bulunacak) */
  async function fenerYak(el: HTMLElement, yakin: HTMLElement) {
    await mSoyle(M.yak);
    durumYaz('dugme');
    ui.ipucu(I.dugme);
    await gorev<void>((coz) => {
      const ip = ipucu(kutu(el));
      const f = (e: PointerEvent) => {
        e.stopPropagation();
        coz();
      };
      el.addEventListener('pointerdown', f);
      return () => {
        bitir(ip);
        el.removeEventListener('pointerdown', f);
      };
    });
    durumYaz(null);
    ui.ipucu(null);
    el.classList.add('basildi');
    setTimeout(() => el.classList.remove('basildi'), sure(200));
    if (ayar.pilli || el.dataset.pil === '1') {
      S.yandi();
      el.classList.add('yanik');
      yakin.classList.add('isikli');
      void balonGoster(balonKatman, el.getBoundingClientRect(), B.tik, 900);
      return;
    }
    // pilsiz: tık… yanmaz
    S.tik();
    void balonGoster(balonKatman, el.getBoundingClientRect(), B.tik, 900);
    await bekle(500);
    S.tik();
    void salla(el, 0.4);
    await bekle(500);
    await mSoyle(M.pil_yok);
  }

  /** Pili fenere sürükle (5-6 yaş), sonra düğme */
  async function pilTak(pil: HTMLElement, fener: HTMLElement, yakin: HTMLElement) {
    await mSoyle(M.pil_tak);
    durumYaz('pil');
    ui.ipucu(I.pil);
    await gorev<void>((coz) => {
      const ip = ipucu(kutu(pil), kutu(fener));
      const s = surukle(pil, [{ ad: 'fener', kutu: kutu(fener), pay: 0.35 }], (ad) => {
        if (ad === 'fener') {
          coz();
          return true;
        }
        ip.yanlis();
      }, kutu(fener));
      return () => bitir(ip, s);
    });
    durumYaz(null);
    ui.ipucu(null);
    // pil fenerin gövdesine kayar, kaybolur
    const pr = pil.getBoundingClientRect();
    const fr = fener.getBoundingClientRect();
    const k = pil.style.translate || '0px 0px';
    await pil
      .animate([{ translate: k, scale: '1', opacity: 1 }, { translate: `${fr.left + fr.width * 0.35 - (pr.left + pr.width / 2) + parseFloat(k)}px ${fr.top + fr.height / 2 - (pr.top + pr.height / 2) + parseFloat(k.split(' ')[1] ?? '0')}px`, scale: '0.5', opacity: 0 }], { duration: sure(380), fill: 'forwards', easing: 'ease-in' })
      .finished.catch(() => undefined);
    pil.style.visibility = 'hidden';
    S.yerlesti();
    fener.dataset.pil = '1';
    void otur(fener);
    await bekle(300);
    await fenerYak(fener, yakin);
  }

  /** Yanlış eşya: yakın çekim kapanır, Kino eşyayla komiklik yapar, eşya çekmeceye döner */
  async function esyaSakasi(ad: 'eldiven' | 'rende', yakin: HTMLElement, el: HTMLElement) {
    el.classList.add('ucuyor');
    await bekle(350);
    yakin.classList.remove('acik');
    await cek(KN.x - bX(22), KN.x + bX(22), Y(-2), KN.y + bY(kisiH + 6), 2.2, 600);
    // Kino'nun üstüne eşya: eldiven kafasında şapka, rende kulağında telefon
    const ek =
      ad === 'eldiven'
        ? KN.ekle('kafa', 'el-kino-ek', `<g transform="translate(700 -120) rotate(-8 280 330) scale(5.2)">${tekil(ELDIVEN_SVG).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>`)
        : KN.ekle('kafa', 'el-kino-ek', `<g transform="translate(250 560) rotate(-18 200 300) scale(3.6)">${tekil(RENDE_SVG).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>`);
    ek?.animate([{ opacity: 0, transform: 'translateY(-160px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: sure(380), easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' });
    ad === 'eldiven' ? S.pof() : S.sirr();
    korkut(0.3);
    KN.kinoOynat(ad === 'eldiven' ? 'bak' : 'dinle', 2200, 1);
    await bekle(300);
    await kSoyle(ad === 'eldiven' ? KN_.sapka : KN_.alo);
    MN.tepki('gidik');
    void balon(MN, B.haha, 1000);
    await bekle(700);
    // eşya Kino'nun başından süzülüp kalkar (birden kaybolmaz)
    await ek?.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-140px)' }], { duration: sure(320), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
    ek?.remove();
    korkut(0.8);
    el.classList.remove('ucuyor');
    await cek(KOMODIN.x - bX(14), KOMODIN.x + bX(45), Y(-2), KOMODIN.y + bY(komodinH + 10), 2, 600);
    yakin.classList.add('acik');
    await bekle(400);
  }

  // ================================================================ 3: Işık lekesi
  async function sahne3() {
    // herkes odanın ortasına; ışık lekesi duvarda. Kino masanın solunda durur (önünde değil): masanın yıldızı
    // yüzünü örtmesin
    void MN.git(X(-27), Y(-1), 900, 0, undefined, true);
    void KN.git(X(-13), Y(0), 900);
    // perdenin alt ucu (ışık oraya gelince Mino tırmanır); çekim onu da güvenli alana alır
    const perde = arkaNokta(452, 430);
    // (yatay telefonda perde çekime sığmaz: çekim yerde kalır, ışık üst kenara gelince kamera yukarı kayar)
    await cek(X(-36), X(38), Y(-3), yatayTel ? DUVAR + bY(30) : Math.max(DUVAR + bY(30), perde.y + bY(18)), 1.5, 1000);
    const kamBas: [number, number] = [kamT[0], kamT[1]];
    await mSoyle(M.isik);
    // hedefler: koltuk (oturağı), perde (arka plandaki sağ perde), masa (üstü)
    // (kutular %30 büyük: ışık yaklaşınca yetsin; ekranda parlayan yıldız görünür → elektrik.css .el-hedef)
    const hedefEl = (ad: string, x: number, y: number, w0: number, hh0: number) => {
      const w = w0 * 1.3;
      const hh = hh0 * 1.3;
      const el = h('div.el-hedef', { 'data-el': `${ad}-hedef`, style: `left:${x - w / 2}%;bottom:${y - hh0 * 0.15}%;width:${w}%;height:${hh}%` });
      dunya.append(el);
      return el;
    };
    const HEDEF: Record<ZiplamaYeri, { el: HTMLElement; ini: [number, number] }> = {
      koltuk: { el: hedefEl('koltuk', KOLTUK.x, KOLTUK.y + bY(koltukH * 0.2), bX(KOLTUK.w * 0.8), bY(koltukH * 0.75)), ini: [KOLTUK.x, KOLTUK.y + bY(koltukH * 0.32)] },
      perde: { el: hedefEl('perde', perde.x, perde.y - bY(14), bX(16), bY(30)), ini: [perde.x, perde.y - bY(12)] },
      masa: { el: hedefEl('masa', MASA.x + bX(4), MASA.y + bY(masaH * 0.4), bX(MASA.w * 0.8), bY(masaH * 0.6)), ini: [MASA.x, MASA.y + bY(masaH * 0.9)] },
    };
    const temizHedef = () => Object.values(HEDEF).forEach((h) => h.el.remove());
    durumYaz('isik', 0);
    ui.ipucu(I.isik);
    const ziplanan: ZiplamaYeri[] = [];
    let mesgul = false;
    let kinoSira = false;
    let kinoHedef: HTMLElement | null = null;
    await gorev<void>((coz) => {
      let durma = 0;
      let adayYer: string | null = null;
      const ip = ipucu(() => (kinoSira ? KN.kap.getBoundingClientRect() : HEDEF[ZIPLAMA_YERLERI_SIRA().find((y) => !ziplanan.includes(y)) ?? 'koltuk'].el.getBoundingClientRect()));
      function ZIPLAMA_YERLERI_SIRA(): ZiplamaYeri[] {
        return ['koltuk', 'masa', 'perde'];
      }
      // ışık parmağı izler (basılıyken sürüklenir; dokununca oraya gider)
      let basili = false;
      let parmakYer: [number, number] | null = null;
      const git = (e: PointerEvent) => {
        parmakYer = [e.clientX, e.clientY];
        const [x, y] = dunyaPx(e.clientX, e.clientY);
        gece.hedef(x, y);
      };
      /** Kenar kaydırma: parmak ekranın üst / alt kenarındaysa kamera o yöne kayar (sığmayan perde için) */
      const kenarKay = (dt: number) => {
        if (!basili || !parmakYer) return;
        const py = parmakYer[1];
        const v = py < GUVEN.ust + 40 ? 1 : py > H - GUVEN.alt - 30 ? -1 : 0;
        if (!v) return;
        const yeni = Math.min(0, Math.max(H - Hd * kamZ, kamT[1] + v * dt * 320));
        if (Math.abs(yeni - kamT[1]) < 0.1) return;
        kamT = [kamT[0], yeni];
        kamUygula(0);
        const [x, y] = dunyaPx(parmakYer[0], parmakYer[1]);
        gece.hedef(x, y);
      };
      const bas = (e: PointerEvent) => {
        if ((e.target as Element).closest?.('button')) return;
        basili = true;
        git(e);
      };
      const hareket = (e: PointerEvent) => {
        if (basili) git(e);
      };
      const birak = () => (basili = false);
      sahne.el.addEventListener('pointerdown', bas);
      // hareket pencereden: parmak üst çubuğun üstüne çıksa da ışık (ve kenar kaydırma) izler
      addEventListener('pointermove', hareket);
      addEventListener('pointerup', birak);
      addEventListener('pointercancel', birak);
      const icerde = (el: HTMLElement, x: number, y: number) => {
        const r = el.getBoundingClientRect();
        const d = dunya.getBoundingClientRect();
        const ex = ((r.left - d.left) / d.width) * Wd;
        const ey = ((r.top - d.top) / d.height) * Hd;
        const ew = (r.width / d.width) * Wd;
        const eh = (r.height / d.height) * Hd;
        return x > ex && x < ex + ew && y > ey && y < ey + eh;
      };
      // hedef kutuları görev başında bir kez ölçülür (her karede yerleşim okunmasın)
      let kutular: [string, HTMLElement][] = [];
      const olc = () => {
        kutular = kinoSira ? [['kino', kinoHedef!]] : (Object.entries(HEDEF) as [ZiplamaYeri, { el: HTMLElement }][]).filter(([a]) => !ziplanan.includes(a)).map(([a, v]) => [a, v.el]);
      };
      olc();
      let olcZaman = 0;
      const durdur = tik((dt) => {
        kenarKay(dt);
        // Mino'nun gözleri ışığı izler
        const [gx] = gece.merkez;
        MN.mino?.bak(Math.max(-1, Math.min(1, (gx / Wd) * 100 - MN.x) / 25));
        if (mesgul) return;
        olcZaman += dt;
        if (olcZaman > 0.5) {
          olcZaman = 0;
          olc();
        }
        const [x, y] = gece.merkez;
        const yer = kutular.find(([, el]) => icerde(el, x, y))?.[0] ?? null;
        if (yer !== adayYer) {
          adayYer = yer;
          durma = 0;
          if (yer && !kinoSira) avlan(true);
          else avlan(false);
        }
        if (!yer) return;
        durma += dt;
        if (durma < (TEST_MODU ? 0.05 : DURMA_SURE + 0.35)) return;
        durma = 0;
        adayYer = null;
        mesgul = true;
        ip.ilerle();
        if (yer === 'kino') {
          void minoKinoya().then(coz);
          return;
        }
        void minoZipla(yer as ZiplamaYeri).then(async () => {
          ziplanan.push(yer as ZiplamaYeri);
          HEDEF[yer as ZiplamaYeri].el.classList.add('bitti');
          if (ziplanan.length < ZIPLAMA_SAYISI) durumYaz('isik', ziplanan.length);
          if (ziplanan.length >= ZIPLAMA_SAYISI) {
            kinoSira = true;
            kinoHedef = KN.kap;
            // kamera kenar kaydırmayla kaydıysa Kino'ya geri döner
            if (Math.abs(kamT[1] - kamBas[1]) > 1) {
              kamT = [kamBas[0], kamBas[1]];
              kamUygula(700);
            }
            durumYaz('kino');
            ui.ipucu(I.kino);
            olc();
            await mSoyle(M.kino_tut).catch(() => undefined);
          }
          olc();
          mesgul = false;
        });
      });
      return () => {
        durdur();
        bitir(ip);
        avlan(false);
        MN.mino?.bak(0);
        sahne.el.removeEventListener('pointerdown', bas);
        removeEventListener('pointermove', hareket);
        removeEventListener('pointerup', birak);
        removeEventListener('pointercancel', birak);
      };
    });
    temizHedef();
    durumYaz(null);
    ui.ipucu(null);

    /** Mino ışığın durduğu yere atlar: çömelir, kıçını sallar, fırlar */
    async function minoZipla(yer: ZiplamaYeri) {
      const [hx, hy] = HEDEF[yer].ini;
      avlan(true);
      await bekle(650);
      avlan(false);
      S.hop();
      const eskiX = MN.x;
      const eskiY = MN.y;
      MN.katman = yer === 'masa' ? 9 : yer === 'koltuk' ? 4 : 9;
      await MN.git(hx, hy, 620, yer === 'perde' ? 10 : 14);
      if (yer === 'perde') {
        // perdeye tutunur, "vızzt" diye kayar
        S.vizzt();
        void balon(MN, B.vizzt, 900);
        MN.mino!.ifade('saskin', 1200);
        await MN.git(hx, Math.max(DUVAR - bY(2), hy - bY(18)), 800, 0, 'cubic-bezier(0.5, 0, 0.9, 0.6)');
      } else {
        S.pat();
        MN.tepki('mir', 1);
      }
      if (yer === 'masa') void masa.animate([{ translate: '0 0' }, { translate: '0 1%' }, { translate: '0 0' }], { duration: sure(300), composite: 'add' });
      // Kino her zıplamada biraz daha yaklaşır, korkusu azalır
      const n = ziplanan.length + 1;
      korkut(Math.max(0.15, 0.5 - n * 0.12));
      if (n === 1) void balon(KN, B.ii, 900);
      else KN.kinoIfade('saskin', 1200);
      void KN.git(Math.min(X(-8), KN.x + bX(1.6)), KN.y, 500);
      await bekle(500);
      MN.katman = 9;
      await MN.git(eskiX, eskiY, 650, 10);
      S.pat();
    }

    /** Işık Kino'nun kafasında: Mino kafasına konar, Kino kahkaha atar */
    async function minoKinoya() {
      avlan(true);
      await bekle(700);
      avlan(false);
      S.hop();
      MN.katman = 10;
      const eskiX = MN.x;
      const eskiY = MN.y;
      await MN.git(KN.x + bX(1), KN.y + bY(kisiH * 0.78), 700, 16);
      S.pat();
      void KN.zipla(4, 300);
      MN.tepki('mir', 1.4);
      korkut(0);
      KN.kinoIfade('heyecan', 2400);
      KN.kinoOynat('sevin', 1400);
      void balon(KN, B.haha, 1300);
      await bekle(900);
      await kSoyle(KN_.yakalarim);
      // Mino aşağı, Kino ışığın peşinde zıplar
      await MN.git(eskiX, eskiY, 650, 12);
      MN.katman = 9;
      S.pat();
      for (const dx of [8, -6, 10]) {
        const [gx, gy] = gece.hedefi;
        gece.hedef(gx + (dx * bPx), gy - bPx * 4);
        await KN.git(Math.min(X(14), Math.max(X(1), KN.x + bX(dx * 0.5))), KN.y, 380, 7);
        KN.kinoOynat('coskulu', 500);
      }
      ui.ilerleme(3, 7);
      await mSoyle(M.guluyor);
    }
  }

  // ================================================================ 4: Karanlığın sesleri
  async function sahne4() {
    // Kino oyuncak kemiğin üstüne oturmuş (kemik gövdesinin altında gizli)
    const KINO_OTUR = { x: X(4.5), y: Y(0) };
    void KN.git(KINO_OTUR.x, KINO_OTUR.y, 500);
    const kemik = koy(h('div.el-kemik', { 'data-el': 'kemik' }, esya('kemik', KEMIK_SVG, 'Oyuncak kemik')), KINO_OTUR.x + bX(2), KINO_OTUR.y + bY(1), 10, 7);
    kemik.style.opacity = '0';
    await cek(X(-31), X(17), Y(-3), SAAT.y + bY(10 * SAAT_ORAN + 4), 1.8, 1000);
    // birden bir ses: Kino büzülür
    korkut(0.9);
    await kSoyle(KN_.ne_o);
    await mSoyle(M.dinleyelim);
    const kaynaklar: Record<SesKaynagi, HTMLElement> = { saat, saksi, kemik: KN.kap };
    const kaynakX: Record<SesKaynagi, number> = { saat: SAAT.x, saksi: SAKSI.x, kemik: KINO_OTUR.x };
    for (const [i, ad] of SES_SIRASI.entries()) {
      await sesliGorev(() => sessizBekle());
      // ses gelir (5-6 yaş: yalnız yönüyle; 3-4: kaynak kıpırdar)
      const calSes = () => {
        const p = ayar.kaynakKipir ? 0 : yon(kaynakX[ad]);
        if (ad === 'saat') S.tiktak(p);
        else if (ad === 'saksi') S.damla(p);
        else S.giyk(p, 2);
        if (ayar.kaynakKipir) void salla(ad === 'kemik' ? KN.gov : kaynaklar[ad], 0.5);
      };
      calSes();
      KN.kinoOynat('kulakDik', 1000);
      // duvarda kocaman, kıpır kıpır bir gölge belirir (sesin sahibinin büyümüş gölgesi): Kino titrer
      const golge = golgeKur(ad);
      gece.hedef(...px(golgeYer().x, golgeYer().y + bY(10)));
      await bekle(500);
      korkut(1);
      void KN.titre(900);
      if (i === 0) await kSoyle(KN_.canavar);
      else void balon(KN, B.iii, 900);
      await bekle(i === 0 ? 300 : 900);
      if (i === 0) await mSoyle(M.golge);
      await mSoyle(M.nereden);
      await sesKaynagiBul(ad, kaynaklar, calSes);
      // komik açılış: gölge küçülerek asıl sahibine akar (saat, saksı, oyuncak kemik); Kino rahatlar
      void golgeAc(golge, kaynaklar[ad], ad !== 'kemik');
      korkut(0.3);
      KN.kinoIfade('saskin', 1200);
      // bulundu: ışık oraya, adı konur
      if (ad === 'saat') {
        saat.classList.add('canli');
        void balon(saat, B.tiktak, 1200);
        S.tiktak(0, 2);
        await mSoyle(M.saat);
      } else if (ad === 'saksi') {
        saksi.classList.add('damliyor');
        void balon(saksi, B.tiptip, 1200);
        S.damla(0, 2);
        await mSoyle(M.saksi);
      } else {
        // Kino kalkar: altından kemik çıkar
        kemik.style.zIndex = '9';
        kemik.style.opacity = '1';
        belir(kemik, 360);
        await KN.zipla(14, 600);
        void KN.git(KINO_OTUR.x + bX(6), KINO_OTUR.y, 400);
        await ucur(kemik, KINO_OTUR.x - bX(4), KINO_OTUR.y - bY(1), 450, 20);
        S.giyk(0, 2);
        void balon(kemik, B.giyk, 1000);
        korkut(0);
        KN.kinoIfade('heyecan', 2000);
        await kSoyle(KN_.benmisim);
        KN.kinoOynat('coskulu', 1000);
        S.giyk(0, 1);
      }
      if (i < SES_SIRASI.length - 1) korkut(0.6 - i * 0.2);
      await bekle(500);
    }
    ui.ilerleme(4, 7);
    void tasi(kemik, KINO_OTUR.x - bX(5), Y(-3), 500, 8);
  }

  /** Gölgelerin duvardaki yeri (5-6 yaşta sesin yerini ele vermesin: hep aynı yerde, odanın ortasında) */
  function golgeYer() {
    return { x: X(-6), y: DUVAR + bY(yatayTel ? 1 : 4) };
  }
  /**
   * Sesin sahibinin büyümüş, kıpırdayan gölgesi (karanlığın üstünde; ışık halkasının içinde koyu görünür): önce sevimli
   * bir canavar silueti (kulaklar, parlayan gözler; elektrik-cizim.ts → GOLGE_CANAVAR), ışık sahibini bulunca asıl
   * eşyanın siluetine döner (golgeAc)
   */
  function golgeKur(ad: SesKaynagi): HTMLElement {
    const svg = ad === 'saat' ? SAAT_SVG : ad === 'saksi' ? SAKSI_SVG : KEMIK_SVG;
    const g = koy(
      h('div.el-golge', { 'data-el': 'golge', 'data-golge': ad }, h('div.el-golge-canavar', { html: GOLGE_CANAVAR[ad] }), h('div.el-golge-asil', { html: tekil(svg) })),
      golgeYer().x,
      golgeYer().y,
      yatayTel ? 22 : 27,
      41,
    );
    g.style.opacity = '0';
    g.animate([{ opacity: 0, scale: '0.5 0.3' }, { opacity: 1, scale: '1 1' }], { duration: sure(700), easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)', fill: 'forwards' });
    S.hisirti();
    return g;
  }
  /** Gölge küçülüp sahibinin üstüne akar, solar: "Hiç korkunç değilmiş!" */
  async function golgeAc(g: HTMLElement, sahibi: HTMLElement, balonlu: boolean) {
    // ışık değince canavar silueti asıl eşyanın siluetine döner (kulaklar iner, gözler söner), sonra sahibine akar
    g.getAnimations().forEach((x) => x.finish());
    g.classList.add('donusuyor');
    await bekle(520);
    const a = g.getBoundingClientRect();
    const b = sahibi.getBoundingClientRect();
    const z = Math.max(0.01, kamZ);
    const dx = (b.left + b.width / 2 - (a.left + a.width / 2)) / z;
    const dy = (b.top + b.height / 2 - (a.top + a.height / 2)) / z;
    const s = Math.max(0.15, Math.min(1, b.width / Math.max(1, a.width)));
    g.classList.add('aciliyor');
    g.getAnimations().forEach((x) => x.cancel());
    g.style.opacity = '1';
    await g
      .animate(
        [
          { translate: '0px 0px', scale: '1', opacity: 1 },
          { translate: `${dx * 0.4}px ${dy * 0.4 - 20}px`, scale: String((1 + s) / 2), opacity: 0.9, offset: 0.45 },
          { translate: `${dx}px ${dy}px`, scale: String(s), opacity: 0 },
        ],
        { duration: sure(800), easing: 'cubic-bezier(0.45, 0, 0.3, 1)', fill: 'forwards' },
      )
      .finished.catch(() => undefined);
    g.remove();
    if (balonlu) void balon(KN, B.korkuncDegil, 1300);
  }

  /** Susup dinle: sessizlik halkası dolar (mikrofon: SessizlikSayaci; parmak: kulağa basılı tut) */
  function sessizBekle(): Promise<void> {
    durumYaz('sessiz');
    ui.ipucu(mik() ? I.sessiz : I.sessiz_dokun);
    const dugme = h('button.el-kulak-dugme', { type: 'button', 'aria-label': 'Dinle' }, h('i.el-kulak-halka'), h('span', { html: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 20a11 11 0 0 1 22 0c0 8-7 8-7 15a6 6 0 0 1-11 3"/><path d="M19 21a5 5 0 0 1 10 0c0 3-3 4-3 7"/></svg>' }));
    sahne.el.append(dugme);
    return gorev<void>((coz) => {
      if (!TEST_MODU) setTimeout(() => coz(), 25000); // takılırsa kendiliğinden geçer
      let gecen = 0;
      let dokunuyor = false;
      let sessiz = false;
      const ss = new SessizlikSayaci(kulak.ayar);
      kulak.dinle((o: Ozellik) => {
        const r = ss.kare(o);
        sessiz = r.gecen > 0.05;
        if (r.bozuldu) {
          void KN.titre(300);
          KN.kinoOynat('kulakDik', 600);
        }
      });
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        dokunuyor = true;
        dugme.classList.add('basili');
      };
      const birak = () => {
        dokunuyor = false;
        dugme.classList.remove('basili');
      };
      dugme.addEventListener('pointerdown', bas);
      addEventListener('pointerup', birak);
      addEventListener('pointercancel', birak);
      const hedef = ayar.sessiz;
      const kapat = tik((dt) => {
        if (dokunuyor) gecen += dt;
        else if (mik()) gecen = sessizlikIlerle(gecen, dt, sessiz);
        dugme.style.setProperty('--p', Math.min(1, gecen / hedef).toFixed(3));
        if (gecen >= hedef) coz();
      });
      return () => {
        kapat();
        kulak.dinle(null);
        dugme.removeEventListener('pointerdown', bas);
        removeEventListener('pointerup', birak);
        removeEventListener('pointercancel', birak);
        dugme.classList.add('bitti');
        setTimeout(() => dugme.remove(), 300);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  /** Sesin geldiği yere dokun: ışık oraya gider; doğruysa bulunur, yanlışsa ışık kısaca titrer */
  function sesKaynagiBul(ad: SesKaynagi, kaynaklar: Record<SesKaynagi, HTMLElement>, tekrar: () => void): Promise<void> {
    durumYaz('bul', ad);
    ui.ipucu(I.bul);
    return gorev<void>((coz) => {
      let yanlis = 0;
      const ip = ipucu(kutu(kaynaklar[ad]));
      let tekrarZaman = 0;
      const kapat = tik((dt) => {
        tekrarZaman += dt;
        if (tekrarZaman > 6) {
          tekrarZaman = 0;
          tekrar();
        }
      });
      const bas = (e: PointerEvent) => {
        if ((e.target as Element).closest?.('button')) return;
        const [x, y] = dunyaPx(e.clientX, e.clientY);
        gece.hedef(x, y);
        const icinde = (el: HTMLElement, pay = 0.25) => {
          const r = el.getBoundingClientRect();
          return e.clientX > r.left - r.width * pay && e.clientX < r.right + r.width * pay && e.clientY > r.top - r.height * pay && e.clientY < r.bottom + r.height * pay;
        };
        const hangi = (Object.keys(kaynaklar) as SesKaynagi[]).find((k) => icinde(kaynaklar[k]));
        if (hangi === ad || (kabulMu(yanlis) && hangi)) {
          const [kx, ky] = dunyaPx(...merkezi(kaynaklar[ad].getBoundingClientRect()));
          gece.hedef(kx, ky);
          coz();
          return;
        }
        yanlis++;
        ip.yanlis();
        void balonGoster(balonKatman, new DOMRect(e.clientX - 20, e.clientY - 20, 40, 40), B.yok, 800);
        if (kabulMu(yanlis + 1) && yanlis >= 2) tekrar();
      };
      sahne.el.addEventListener('pointerdown', bas);
      return () => {
        kapat();
        bitir(ip);
        sahne.el.removeEventListener('pointerdown', bas);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  // ================================================================ 5: Karşıdaki Can
  async function sahne5() {
    // kamera pencereye
    const camUst = camMerkez.y + camRy * 1.15;
    const camAlt = camMerkez.y - camRy * 1.25;
    await cek(camMerkez.x - camR * 1.2, camMerkez.x + camR * 1.2, camAlt, camUst, 2.2, 1300);
    gece.hedef(...px(camMerkez.x, camMerkez.y));
    pencere.el.classList.add('can-var');
    await bekle(600);
    await mSoyle(M.can);
    // fener düğmesi (parmak karşılığı): ekranın altında
    const fenerDugme = h('button.el-fener-dugme', { type: 'button', 'aria-label': 'Fener', 'data-el': 'fener-dugme', html: tekil(FENER_SVG) });
    for (const [tur, n] of ayar.isaretler.entries()) {
      let deneme = 0;
      while (true) {
        await canIsaret(n);
        if (tur === 0 && deneme === 0) await mSoyle(M.say);
        const sayi = await sesliGorev(() => alkisBekle(n, fenerDugme));
        const sonuc = isaretSonuc(n, sayi);
        if (sonuc === 'dogru' || kabulMu(deneme)) break;
        deneme++;
        // Can başını yana yatırır: "Hı?"
        pencere.can.classList.add('hi');
        void balonGoster(balonKatman, pencere.can.getBoundingClientRect(), B.hi, 1000);
        await bekle(1100);
        pencere.can.classList.remove('hi');
      }
      // Can el sallar
      pencere.can.classList.add('selam');
      void balonGoster(balonKatman, pencere.can.getBoundingClientRect(), B.selam, 1200);
      S.yildiz(tur + 2);
      await bekle(700);
      if (tur === 0) await mSoyle(M.selam);
      await bekle(600);
      pencere.can.classList.remove('selam');
    }
    fenerDugme.remove();
    // şaka: Kino feneri ağzına alıp sallar, ışık tavanda döner; Can gülmekten pencereden kaybolur
    void cek(X(-40), X(40), Y(-3), camUst, 1.2, 900);
    await bekle(700);
    const fenerAgiz = KN.ekle('kafa', 'el-kino-ek', `<g transform="translate(640 900) rotate(-6 250 110) scale(3.6)">${tekil(FENER_SVG).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>`);
    fenerAgiz?.classList.add('yanik');
    KN.kinoOynat('coskulu', 2400);
    S.hop();
    const [bx, by] = gece.hedefi;
    const dondur = tik(() => {
      const t = performance.now() / 1000;
      gece.hedef(Wd / 2 + Math.cos(t * 5) * Wd * 0.3, Hd * 0.35 + Math.sin(t * 7) * Hd * 0.12);
    });
    await bekle(700);
    pencere.can.classList.add('dustu');
    void balonGoster(balonKatman, pencere.can.getBoundingClientRect(), B.haha, 1400);
    MN.tepki('gidik');
    await bekle(1600);
    dondur();
    void sondur(fenerAgiz, 300);
    gece.hedef(bx, by);
    pencere.el.classList.remove('can-var');
    ui.ilerleme(5, 7);
  }

  /** Can fenerini n kez yakıp söndürür */
  async function canIsaret(n: number) {
    pencere.can.classList.remove('dustu');
    await bekle(400);
    for (let i = 0; i < n; i++) {
      pencere.canFener.classList.add('yanik');
      S.isaret(true);
      await bekle(380);
      pencere.canFener.classList.remove('yanik');
      await bekle(360);
    }
  }

  /** Alkış (mikrofon) ya da fener düğmesi: seri bitince (1.4 sn sessizlik) sayısı döner */
  function alkisBekle(hedef: number, dugme: HTMLElement): Promise<number> {
    durumYaz('alkis', hedef);
    ui.ipucu(mik() ? I.alkis : I.alkis_dokun);
    sahne.el.append(dugme);
    return gorev<number>((coz) => {
      if (!TEST_MODU) setTimeout(() => coz(hedef), 25000); // takılırsa kendiliğinden geçer
      const a = new Alkis(kulak.ayar);
      const ip = ipucu(kutu(dugme));
      const flas = () => {
        pencere.bizimIsik.classList.remove('flas');
        void pencere.bizimIsik.offsetWidth;
        pencere.bizimIsik.classList.add('flas');
      };
      a.onAlkis = () => {
        flas();
        ip.ilerle();
      };
      a.onSeri = (z) => coz(z.length);
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        S.isaret();
        dugme.classList.remove('bas');
        void dugme.offsetWidth;
        dugme.classList.add('bas');
        a.dokun();
      };
      dugme.addEventListener('pointerdown', bas);
      kulak.dinle((o) => a.kare(o));
      const kapat = tik(() => a.tik());
      return () => {
        kapat();
        kulak.dinle(null);
        bitir(ip);
        dugme.removeEventListener('pointerdown', bas);
        void sondur(dugme, 260);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  /**
   * Yankı: çocuk parçanın vuruşlarını alkışlar (mikrofon: Alkis; parmak: yastığa vur). Seri 1.4 sn sessizlikte
   * biter; alkış zamanları (ms) döner. Her alkışta sıradaki yıldız yanar. Mikrofonla gelen alkışta oyun ses
   * çalmaz (sonraki alkışı duyabilsin); yastığa vurunca yumuşak "pof".
   */
  function yankiBekle(n: number, ilk: number, isiklar: HTMLElement[], yastik: HTMLElement): Promise<number[]> {
    // hedef: vuruş sayısı / tur sırası (test her yeni turu ayırt edebilsin)
    durumYaz('sarki', `${n}/${++yankiSira}`);
    ui.ipucu(I.sarki);
    return gorev<number[]>((coz) => {
      if (!TEST_MODU) setTimeout(() => coz(Array.from({ length: n }, (_, i) => i * 600)), 25000); // takılırsa kendiliğinden geçer
      const a = new Alkis(kulak.ayar);
      const ip = ipucu(kutu(yastik));
      a.onAlkis = (sira) => {
        if (sira <= n) isiklar[ilk + sira - 1]?.classList.add('yanik');
        ip.ilerle();
        MN.tepki('dans', 0.5);
        KN.kinoOynat('dans', 400);
      };
      a.onSeri = (z) => coz(z.map((s) => s * 1000));
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        S.pat();
        yastik.animate([{ scale: '1 1' }, { scale: '1.12 0.8' }, { scale: '0.96 1.05' }, { scale: '1 1' }], { duration: sure(280), easing: 'ease-out' });
        a.dokun();
      };
      yastik.addEventListener('pointerdown', bas);
      kulak.dinle((o) => a.kare(o));
      const kapat = tik(() => a.tik());
      return () => {
        kapat();
        kulak.dinle(null);
        bitir(ip);
        yastik.removeEventListener('pointerdown', bas);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  // ================================================================ 6: Battaniye çadırı
  async function sahne6() {
    const cek6 = (ms: number) => (yatayTel ? cek(X(-40), X(40), Y(-7), battaniyeYer.y + bY(9), 1.5, ms) : cek(X(dikey ? -30 : -40), X(dikey ? 30 : 40), Y(dikey ? -7 : -4), Y(40), 1.5, ms));
    await cek6(1000);
    // ışık halının ortasına, geniş; oda biraz daha seçilir
    gece.hedef(...px(X(0), Y(6)));
    gece.delik(Math.min(W, H) * (dikey ? 0.3 : 0.34) / Math.max(1, kamZ));
    await mSoyle(M.cadir);
    // çadır yeri boşalsın: küpler ve oyuncak kemik komodinin dibine toplanır (sırayla, küçük sekerek)
    {
      const kemikEl = dunya.querySelector<HTMLElement>('[data-el="kemik"]');
      const toplanan = [...kupler, ...(kemikEl ? [kemikEl] : [])];
      toplanan.forEach((e, i) => {
        e.style.zIndex = '4';
        setTimeout(() => void ucur(e, KOMODIN.x + bX(13 + (i % 3) * 5.5), ARKA(-1 - Math.floor(i / 3) * 2), 520, 14, e === kemikEl ? 6 : 5), sure(i * 110));
      });
      S.patiler(5);
      await bekle(700 + toplanan.length * 110);
    }
    // sandalyeler iki yanda; ışıklı yerler halıda
    // (tabanı ipucu şeridinin üstünde kalsın: ışıklı yerler ve finaldeki ikili alttaki yazı/düğmelerin altında kalmasın)
    const CADIR = { x: X(-2), y: Y(dikey ? 2 : -4), w: 42 };
    const yerler = [
      { x: CADIR.x - bX(CADIR.w * 0.42), y: CADIR.y },
      { x: CADIR.x + bX(CADIR.w * 0.42), y: CADIR.y },
    ];
    const isikYer = yerler.map((p, i) => koy(h('div.el-yer', { 'data-el': `sandalye-yeri-${i + 1}` }), p.x, p.y - bY(2), 14, 21));
    const sandalyeler = [
      koy(h('div.el-sandalye', { 'data-el': 'sandalye-1' }, esya('sandalye', SANDALYE_SVG, 'Sandalye')), X(dikey ? -25 : -36), Y(dikey ? -2 : -1), 11, 8),
      koy(h('div.el-sandalye', { 'data-el': 'sandalye-2' }, esya('sandalye', SANDALYE_SVG, 'Sandalye')), X(dikey ? 25 : 37), Y(dikey ? -1 : 0), 11, 8),
    ];
    // karakterler kenara
    // (dikey telefonda dar çekim: karakterler arkaya, masanın iki yanına; sandalyeler önde görünür)
    if (dikey || yatayTel) {
      void MN.git(X(-20), Y(13), 700, 0, undefined, true);
      void KN.git(X(20), Y(13), 700);
      MN.katman = 7;
      KN.katman = 7;
    } else {
      void MN.git(X(-22), Y(-6), 700, 0, undefined, true);
      void KN.git(X(20), Y(-6), 700);
      MN.katman = 12;
      KN.katman = 12;
    }
    // çekim yeni yerlerine göre (kadraj koruması: kenarda yarım kalmasınlar)
    void cek6(700);
    await mSoyle(M.sandalye);
    durumYaz('sandalye');
    ui.ipucu(I.sandalye);
    const dolu = [false, false];
    await gorev<void>((coz) => {
      const ipler: Ipucu[] = [];
      const sler = sandalyeler.map((s, i) => {
        const ip = ipucu(kutu(s), kutu(isikYer[i]));
        ipler.push(ip);
        return surukle(
          s,
          isikYer.map((y, j) => ({ ad: String(j), kutu: kutu(y), pay: 0.6 })),
          (ad) => {
            const j = ad === null ? -1 : Number(ad);
            // boş yer seçilir (bırakılan dolu ise öteki)
            const k = j >= 0 && !dolu[j] ? j : j >= 0 ? dolu.indexOf(false) : -1;
            if (k < 0) {
              ip.yanlis();
              return;
            }
            dolu[k] = true;
            void tasi(s, yerler[k].x, yerler[k].y, 420).then(() => void otur(s));
            S.pop();
            isikYer[k].classList.add('dolu');
            s.dataset.yer = String(k);
            bitir(sler[i], ip);
            if (dolu.every(Boolean)) setTimeout(coz, sure(500));
            return true;
          },
          kutu(isikYer[i]),
        );
      });
      return () => {
        sler.forEach((s) => bitir(s));
        ipler.forEach((p) => bitir(p));
      };
    });
    durumYaz(null);
    ui.ipucu(null);
    isikYer.forEach((e) => e.remove());
    // sandalyeler soldan sağa sıralanır (çadır iki sandalyeye oturur)
    sandalyeler.sort((a, b) => Number(a.dataset.yer) - Number(b.dataset.yer));

    // battaniye
    await mSoyle(M.battaniye);
    const cadirYer = koy(h('div.el-yer.genis', { 'data-el': 'cadir-yeri' }), CADIR.x, CADIR.y, CADIR.w * 0.6, 21);
    durumYaz('battaniye');
    ui.ipucu(I.battaniye);
    battaniye.style.zIndex = '13';
    await gorev<void>((coz) => {
      const ip = ipucu(kutu(battaniye), kutu(cadirYer));
      const s = surukle(battaniye, [{ ad: 'cadir', kutu: kutu(cadirYer), pay: 0.5 }], (ad) => {
        if (ad !== 'cadir') {
          ip.yanlis();
          return;
        }
        coz();
        return true;
      }, kutu(cadirYer));
      return () => bitir(ip, s);
    });
    durumYaz(null);
    ui.ipucu(null);
    void sondur(cadirYer, 300);
    // battaniye havada açılır, çadır olur
    await ucur(battaniye, CADIR.x, CADIR.y + bY(CADIR.w * CADIR_ORAN * 0.7), 450, 30, 16);
    battaniye.style.visibility = 'hidden';
    S.hisirti(true);
    const cadir = koy(
      h('div.el-cadir', { 'data-el': 'cadir' }, h('div.el-cadir-cizim', { html: tekil(CADIR_SVG) }), h('div.el-cadir-lamba', {}, esya('gece-lambasi', '', 'Gece lambası', 'ege/gece-lambasi')), h('div.el-isiklar', {}, ...Array.from({ length: ayar.alkis }, (_, i) => h('i', { style: `--i:${i};--n:${ayar.alkis}` })))),
      CADIR.x,
      CADIR.y,
      CADIR.w,
      10,
    );
    cadir.animate([{ scale: '0.2 0.05', opacity: 0 }, { scale: '1.08 0.9', opacity: 1, offset: 0.6 }, { scale: '0.96 1.05', offset: 0.8 }, { scale: '1 1' }], { duration: sure(650), easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)' });
    sandalyeler.forEach((s) => (s.style.zIndex = '9'));
    await bekle(700);

    // mandallar
    await mSoyle(M.mandal);
    const mandallar = [0, 1].map((i) =>
      koy(h('div.el-mandal', { 'data-el': `mandal-${i + 1}`, role: 'button', 'aria-label': 'Mandal', html: mandalSvg(i ? '#5dbe3f' : '#ffc72c') }), CADIR.x + bX(i ? 7 : -7), Y(dikey ? -4 : -10), 3.4, 14),
    );
    mandallar.forEach((m, i) => m.style.setProperty('rotate', i ? '70deg' : '-70deg'));
    durumYaz('mandal');
    ui.ipucu(I.mandal);
    await gorev<void>((coz) => {
      let n = 0;
      const ip = ipucu(kutu(mandallar[0]));
      const dinle = mandallar.map((m, i) => {
        const f = async (e: PointerEvent) => {
          e.stopPropagation();
          if (m.dataset.takili) return;
          m.dataset.takili = '1';
          ip.ilerle();
          // mandal çadırın köşesine (sandalyenin tepesi) uçar, "çıt"
          m.style.setProperty('rotate', '0deg');
          const sx = i ? CADIR.x + bX(CADIR.w * 0.37) : CADIR.x - bX(CADIR.w * 0.37);
          await ucur(m, sx, CADIR.y + bY(CADIR.w * CADIR_ORAN * 0.28), 420, 26);
          S.cit();
          void balon(m, B.cit, 700);
          void otur(m);
          if (++n === 2) setTimeout(coz, sure(400));
          else bitir(ip);
        };
        m.addEventListener('pointerdown', f);
        return [m, f] as const;
      });
      return () => {
        bitir(ip);
        dinle.forEach(([m, f]) => m.removeEventListener('pointerdown', f));
      };
    });
    durumYaz(null);
    ui.ipucu(null);

    // kamp şarkısı (Gemini kaydı; oyun şarkıya uyar): önce sözlü şarkı dinlenir; sonra yankı: altyapıdan bir parça
    // çalar (vuruşlarında çadırın yıldızları yanıp söner), parça bitince çocuk aynı vuruşları alkışlar ya da yastığa
    // vurur. Kayıt çalarken mikrofon dinlemez (sırayla konuşma); değerlendirme kayıttaki vuruş aralığına göre, yumuşak.
    await mSoyle(M.sarki);
    const kayit = S.kampKaydi();
    const turlar = kayit ? kampTurlari(kayit.kayit, yas) : [];
    const calar = kayit && turlar.length ? new S.KampCalar(kayit.sozlu, kayit.sozsuz) : null;
    iptaller.push(() => calar?.kapat());
    // kayıt yoksa: aynı tempoda sentez vuruşlar
    const { vurus: turVurus, tur: turSayisi } = kampTurAyar(yas);
    const YEDEK_ARA = 575;
    const TURLAR: KampTur[] = turlar.length
      ? turlar
      : Array.from({ length: turSayisi }, () => ({ basMs: 0, bitMs: YEDEK_ARA * (turVurus + 0.3), vuruslar: Array.from({ length: turVurus }, (_, i) => YEDEK_ARA * (0.35 + i)), ara: YEDEK_ARA }));
    const toplam = TURLAR.reduce((a, t) => a + t.vuruslar.length, 0);
    const notalar = kampNotalari(toplam);
    const isikKap = cadir.querySelector<HTMLElement>('.el-isiklar')!;
    isikKap.replaceChildren(...Array.from({ length: toplam }, (_, i) => h('i', { style: `--i:${i};--n:${toplam}` })));
    const isiklar = [...isikKap.querySelectorAll<HTMLElement>('i')];
    const parlat = (el: HTMLElement | undefined) => {
      if (!el) return;
      el.classList.remove('goster');
      void el.offsetWidth;
      el.classList.add('goster');
    };
    const dansEt = (guc = 0.6) => {
      cadir.animate([{ scale: '1 1' }, { scale: '1.03 0.97' }, { scale: '1 1' }], { duration: sure(260), easing: 'ease-out' });
      MN.tepki('dans', guc);
      KN.kinoOynat('dans', 500);
    };
    // yastık: alkışın dokunma karşılığı (çadırın kapısının önünde)
    const yastik = koy(h('div.el-yastik', { 'data-el': 'yastik', role: 'button', 'aria-label': 'Yastık' }, esya('yastik', YASTIK_SVG, 'Yastık')), CADIR.x, CADIR.y + bY(1), 12, 13);
    yastik.animate([{ scale: '0.2', opacity: 0 }, { scale: '1.1', opacity: 1, offset: 0.7 }, { scale: '1' }], { duration: sure(420), easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' });
    S.pop();

    await sesliGorev(async () => {
      // 1) sözlü şarkıyı dinle: sözler ekranda satır satır, herkes vuruşlarda sallanır
      await mSoyle(M.sarki_dinle);
      durumYaz('sarki-dinle');
      ui.ipucu(I.sarki_dinle);
      if (calar && kayit && !TEST_MODU) {
        const k = kayit.kayit;
        const satirlar = kampSatirBaslari(k);
        await gorev<void>((coz) => {
          const zaman: ReturnType<typeof setTimeout>[] = [];
          satirlar.forEach((ms, i) => zaman.push(setTimeout(() => ui.yazi(EL.sarki[i] ?? ''), ms)));
          k.vuruslar_ms.forEach((ms, i) => zaman.push(setTimeout(() => {
            parlat(isiklar[i % isiklar.length]);
            if (i % 2 === 0) dansEt(0.4);
          }, ms)));
          void calar.cal('sozlu', 0, k.sure_ms ?? (k.vuruslar_ms[k.vuruslar_ms.length - 1] ?? 0) + 800).then(() => coz());
          return () => {
            zaman.forEach(clearTimeout);
            calar.durdur();
          };
        });
      } else {
        for (const [i, s] of EL.sarki.entries()) {
          ui.yazi(s);
          parlat(isiklar[i]);
          dansEt(0.4);
          await bekle(700);
        }
      }
      ui.ipucu(null);
      durumYaz(null);

      // 2) yankı: parça çalar → çocuk aynı vuruşları alkışlar
      await mSoyle(M.sen_alkisla);
      let yildiz = 0;
      for (const [ti, t] of TURLAR.entries()) {
        const n = t.vuruslar.length;
        for (let deneme = 0; ; deneme++) {
          durumYaz('sarki-dinle');
          await gorev<void>((coz) => {
            const zaman: ReturnType<typeof setTimeout>[] = t.vuruslar.map((ms, i) =>
              setTimeout(() => {
                parlat(isiklar[yildiz + i]);
                dansEt(0.5);
                if (!calar) S.kampNota(notalar[yildiz + i], i % 2 === 0);
              }, sure(ms)),
            );
            if (calar && !TEST_MODU) void calar.cal('sozsuz', t.basMs, t.bitMs).then(() => coz());
            else {
              kulak.sustur(t.bitMs - t.basMs + 350);
              zaman.push(setTimeout(coz, sure(t.bitMs - t.basMs)));
            }
            return () => {
              zaman.forEach(clearTimeout);
              calar?.durdur();
            };
          });
          const zamanlar = await yankiBekle(n, yildiz, isiklar, yastik);
          const sonuc = yankiSonuc(zamanlar, n, t.ara, !kucukMu(yas) && !TEST_MODU);
          if (sonuc === 'dogru' || kabulMu(deneme)) break;
          // tutmadı (komik, cezasız): Kino başını yana yatırır, yıldızlar söner, parça yeniden
          isiklar.slice(yildiz, yildiz + n).forEach((i) => i.classList.remove('yanik'));
          KN.kinoOynat('bak', 1000, 1);
          void balon(KN, B.hi, 900);
          await bekle(1000);
        }
        yildiz += n;
        S.yildiz(ti + 2);
        MN.tepki('zipla');
        KN.kinoOynat('sevin', 700);
        ui.ilerleme(yildiz, toplam);
        await bekle(700);
      }
      ui.ilerleme(0, 0);
      // 3) hep birlikte: sözlü kaydın son satırı ("Hadi alkış, alkış, alkış!"), bütün yıldızlar parlar
      konfeti(cadir, 36);
      if (calar && kayit && !TEST_MODU) {
        const k = kayit.kayit;
        const son = kampSatirBaslari(k).pop() ?? 0;
        ui.yazi(EL.sarki[EL.sarki.length - 1]);
        await gorev<void>((coz) => {
          const zaman = k.vuruslar_ms.filter((ms) => ms >= son - 200).map((ms) => setTimeout(() => {
            isiklar.forEach(parlat);
            dansEt(0.7);
          }, ms - son + 200));
          void calar.cal('sozlu', Math.max(0, son - 200), k.sure_ms ?? son + 3000).then(() => coz());
          return () => {
            zaman.forEach(clearTimeout);
            calar.durdur();
          };
        });
      } else [72, 76, 79, 84].forEach((m, i) => setTimeout(() => S.kampNota(m, false), sure(i * 120)));
      calar?.kapat();
    });
    yastik.animate([{ scale: '1', opacity: 1 }, { scale: '0.3', opacity: 0 }], { duration: sure(300), fill: 'forwards' });
    setTimeout(() => yastik.remove(), sure(320));
    await bekle(600);

    // şaka: Kino çadıra dalar, kuyruğu sandalyeye çarpar, çadır çöker; altında tümsek dolaşır
    KN.kinoOynat('coskulu', 700);
    void balon(KN, B.hav, 700);
    await bekle(500);
    KN.katman = 9;
    await KN.git(CADIR.x, CADIR.y + bY(2), 520, 8);
    KN.el.classList.add('el-icerde');
    await bekle(250);
    void salla(sandalyeler[1], 1.4);
    S.cokus();
    cadir.classList.add('coktu');
    const cokuk = koy(h('div.el-cokuk', { 'data-el': 'cokuk', html: tekil(COKUK_SVG) }, h('i.el-tumsek')), CADIR.x, CADIR.y - bY(1), CADIR.w * 1.05, 11);
    sandalyeler.forEach((s, i) => s.animate([{ rotate: '0deg' }, { rotate: `${i ? 14 : -14}deg` }, { rotate: '0deg' }], { duration: sure(500), easing: 'ease-out' }));
    mandallar.forEach((m) => (m.style.opacity = '0'));
    MN.mino!.ifade('saskin', 1600);
    MN.tepki('sasir');
    await bekle(500);
    await mSoyle(M.coktu);
    cokuk.classList.add('dolasiyor');
    await kSoyle(KN_.hayalet);
    await bekle(800);
    // Kino battaniyenin kenarından çıkar, çadır "hop" diye yeniden kurulur
    cokuk.classList.remove('dolasiyor');
    KN.el.classList.remove('el-icerde');
    await KN.git(CADIR.x + bX(CADIR.w * (dikey ? 0.5 : 0.62)), Y(-6), 500, 6);
    KN.katman = 15;
    KN.kinoIfade('heyecan', 1400);
    void balon(KN, B.haha, 1000);
    MN.tepki('gidik');
    await bekle(700);
    S.pop();
    // çöküntü solarken çadır kalkar (çapraz geçiş)
    void sondur(cokuk, 380);
    cadir.classList.remove('coktu');
    cadir.animate([{ scale: '1 0.2' }, { scale: '1.05 1.1', offset: 0.6 }, { scale: '1 1' }], { duration: sure(500), easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' });
    mandallar.forEach((m) => (m.style.opacity = '1'));
    void balon(cadir, B.hop, 800);
    await bekle(800);
    ui.ilerleme(6, 7);
    sahne6Sonu = { cadir, CADIR };
  }

  // ================================================================ 7: Geldiii!
  async function sahne7() {
    const { cadir, CADIR } = sahne6Sonu!;
    // fener bizde (yerde, ışığı açık): önde
    const fener = koy(h('div.el-fener.yanik', { 'data-el': 'fener', role: 'button', 'aria-label': 'Fener' }, esya('fener', FENER_SVG, 'Fener')), X(-12), Y(dikey ? -3 : -9), 12, 14);
    belir(fener, 420);
    gece.huzme(false);
    await bekle(300);
    // ışıklar gelir: vızz vızz, lamba titreyip yanar
    S.vizilti();
    gece.titret();
    await bekle(900);
    gece.karanlik(false, 300);
    sahne.el.classList.remove('el-karanlik');
    gece.delik(0);
    lamba.classList.add('yanik');
    pencere.el.classList.add('komsular');
    await cek(X(dikey ? -34 : -40), X(dikey ? 34 : 40), Y(-10), Y(42), 1.4, 900);
    // mahalleden "Geldiii!" balonları (pencerenin yanından)
    const sr = sahne.el.getBoundingClientRect();
    for (let i = 0; i < 3; i++) setTimeout(() => void balonGoster(balonKatman, new DOMRect(sr.left + W * (0.2 + i * 0.3), sr.top + GUVEN.ust + 30 + (i % 2) * 30, 10, 10), B.geldi, 1400), sure(i * 350));
    KN.kinoIfade('heyecan', 1500);
    KN.kinoOynat('sevin', 900);
    MN.tepki('zipla');
    await mSoyle(M.geldi);
    await mSoyle(M.bagir);
    // yüksek ses (ya da büyük düğme)
    durumYaz('bagir');
    ui.ipucu(I.bagir);
    await sesliGorev(() =>
      gorev<void>((coz) => {
        if (!TEST_MODU) setTimeout(() => coz(), 25000); // takılırsa kendiliğinden geçer
        const ys = new YuksekSes();
        void ui.dugme(EL.dugme.geldi).then(() => coz());
        kulak.dinle((o) => {
          if (ys.kare(o.db - kulak.ayar.taban + kulak.ayar.duyarlilik, kulak.ayar.kare)) coz();
        });
        return () => {
          kulak.dinle(null);
          ui.dugmeKaldir();
        };
      }),
    );
    durumYaz(null);
    ui.ipucu(null);
    // Kino uluyor, Mino kulaklarını tıkar ("Of!"), sonra o da katılır: "Miyaav!"
    KN.kinoOynat('ulu', 2600);
    S.uluma(1.6);
    MN.gozSik(true);
    void MN.titre(700);
    void balon(MN, B.kulak, 1400);
    await bekle(TEST_MODU ? 50 : 1700);
    await kSoyle(KN_.geldi);
    MN.gozSik(false);
    MN.tepki('zipla');
    S.miyav();
    void balon(MN, B.miyav, 1100);
    konfeti(KN.kap, 40);
    await bekle(900);

    // feneri kapat, çekmeceye koy
    await mSoyle(M.kapat);
    durumYaz('kapat');
    ui.ipucu(I.kapat);
    await gorev<void>((coz) => {
      const ip = ipucu(kutu(fener));
      const f = (e: PointerEvent) => {
        e.stopPropagation();
        coz();
      };
      fener.addEventListener('pointerdown', f);
      return () => {
        bitir(ip);
        fener.removeEventListener('pointerdown', f);
      };
    });
    S.tik();
    fener.classList.remove('yanik');
    void otur(fener);
    durumYaz(null);
    S.cekmece();
    cekmece.classList.add('acik');
    void cek(Math.min(KOMODIN.x, X(-12)) - bX(14), X(24), Y(-11), KOMODIN.y + bY(komodinH + 8), 1.6, 700);
    await bekle(600);
    durumYaz('koy');
    ui.ipucu(I.koy);
    await gorev<void>((coz) => {
      const ip = ipucu(kutu(fener), kutu(cekmece));
      const s = surukle(fener, [{ ad: 'cekmece', kutu: kutu(komodin), pay: 0.3 }], (ad) => {
        if (ad !== 'cekmece') {
          ip.yanlis();
          return;
        }
        coz();
        return true;
      }, kutu(cekmece));
      return () => bitir(ip, s);
    });
    durumYaz(null);
    ui.ipucu(null);
    fener.style.zIndex = '4';
    await ucur(fener, KOMODIN.x, KOMODIN.y + bY(komodinH * 0.62), 420, 24, 7);
    fener.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 20%' }], { duration: sure(250), fill: 'forwards' });
    await bekle(250);
    fener.remove();
    S.cekmece(true);
    cekmece.classList.remove('acik');
    await bekle(500);

    // final: Kino lambayı kendisi kapatır
    // (Mino çadırın önüne: çadırın ve mandalların önünde)
    MN.katman = 15;
    void MN.git(CADIR.x - bX(CADIR.w * (dikey ? 0.5 : 0.62)), Y(-6), 700, 0, undefined, true);
    await cek(X(dikey ? -34 : -40), X(dikey ? 34 : 40), Y(-10), LAMBA.y + bY(LAMBA.w * LAMBA_ORAN + 4), 1.3, 900);
    KN.katman = 3;
    await KN.git(LAMBA.x + bX(6), LAMBA.y - bY(1), 1000);
    await kSoyle(KN_.kapatirim);
    KN.kinoOynat('sevin', 600);
    const ip = lamba.querySelector<SVGGElement>('.el-lamba-ip');
    ip?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(9px)' }, { transform: 'translateY(0)' }], { duration: sure(400), easing: 'cubic-bezier(0.3, 1.6, 0.5, 1)' });
    await bekle(200);
    S.tik();
    lamba.classList.remove('yanik');
    gece.seviye('los');
    gece.karanlik(true, 700);
    sahne.el.classList.add('el-karanlik', 'el-los');
    await bekle(400);
    // çadırda gece lambası yanar
    cadir.classList.add('lamba');
    S.lambaTik();
    // loş odada çadırın çevresi gece lambasıyla aydınlık kalır
    gece.hedef(...px(CADIR.x, CADIR.y + bY(CADIR.w * CADIR_ORAN * 0.45)));
    gece.delik(Math.min(W, H) * (dikey ? 0.32 : 0.3) / Math.max(1, kamZ));
    await bekle(500);
    KN.katman = 15;
    await KN.git(CADIR.x + bX(CADIR.w * (dikey ? 0.5 : 0.62)), Y(-6), 900);
    await kSoyle(KN_.oynayalim);
    await mSoyle(M.aferin);
    // ikisi çadırın kapısının iki yanına oturur: kapı aralarında içeriden parlar, ikisi de görünür (yüzleri açık)
    // (biraz küçülür: çadır arkada görünsün)
    const KAPI_W = KISI_W * 0.72;
    MN.katman = 16;
    KN.katman = 15;
    for (const k of [MN, KN]) k.el.style.setProperty('--w', String(KAPI_W));
    void MN.git(CADIR.x - bX(CADIR.w * 0.27), CADIR.y + bY(0.5), 800, 0, undefined, true);
    await KN.git(CADIR.x + bX(CADIR.w * 0.27), CADIR.y + bY(0.5), 800);
    cadir.classList.add('dolu');
    KN.kinoIfade('heyecan', 3000);
    MN.tepki('evet');
    await bekle(700);
    // (yakın: bitişteki düğmeler altta çıkınca ikisinin yüzü üstte açık kalsın)
    await cek(CADIR.x - bX(CADIR.w * 0.52), CADIR.x + bX(CADIR.w * 0.52), CADIR.y - bY(3), CADIR.y + bY(CADIR.w * CADIR_ORAN + 6), 2.2, 1400);
    ui.ilerleme(7, 7);
    await mSoyle(M.son);
    odulKarti();
    await bekle(2600);
  }

  function odulKarti() {
    const kino = KINO_RESIM['../../assets/karakter-iskelet/kino.svg'] ?? '';
    const kart = h(
      'div.el-odul',
      { 'data-el': 'odul' },
      h('div.el-odul-resim', {}, kino ? h('img.el-odul-kino', { src: kino, alt: '' }) : null, h('div.el-odul-fener', { html: tekil(FENER_SVG) })),
      h('b', {}, EL.kart),
    );
    sahne.el.append(kart);
    void kart.offsetWidth;
    kart.classList.add('acik');
    S.yildiz(3);
    const [kx, ky] = merkezi(kart.getBoundingClientRect());
    konfetiPatlat(kok, kx, ky, 50);
    setTimeout(() => kart.classList.add('gidiyor'), sure(2400));
  }

  // (kullanılmayan uyarısı olmasın: bazı ölçüler yalnız belirli sahnelerde)
  void koltuk;
  void iz;
  void dunyada;
  void serbestAcik;
  void (serbestAcik = true);
}
