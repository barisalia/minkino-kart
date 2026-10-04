/**
 * Bölüm 5: Salıncak Kimin? (senaryo: ekip/senaryo/salincak.md, 7 sahne)
 * Parkta tek büyük salıncak var. Tek hedef: "Herkes binsin, kimse üzülmesin." 1 ters binen Kino'yu çevir, "Hop!"
 * diye it (5-6: halka parlayınca) → 2 herkese aynı sayı: salıncak her gelişinde alkışla say (3-4: 5, 5-6: 10), Can'ın
 * yüzü açılır → 3 Kino inmiyor: sus (ya da basılı tut), salıncak yavaşlayıp dursun; Kino bekleme çizgisinde
 * ("Beklemek zor…") → 4 beklerken kaydırak: uzun "vııı" ile kay, kuma gömül (2 kayış) → 5 nazlı Mino: yumuşacık it;
 * yüksek seste tüyleri kabarır, fuları Kino'nun kafasına uçar → 6 bebek salıncağında sıkışan Kino'yu çek, Ege'yi
 * fısıltıyla salla → 7 iki salıncak birden: tekerlemeyi dinle, dizeleri alkışla; final, "Parkın Sıra Ustası".
 *
 * Her sesli görevin parmak karşılığı var; 2 yanlışta ya da 8 sn'de parmak ipucu; her yaşta 3. denemede kabul.
 * Algılama kilitli ses sisteminden (ekip/SES-SISTEMI.md): sesVar (herhangi bir ses), Alkis, SessizlikSayaci,
 * SesSeviyesi (ege-seviye.ts: kısık ses, fısıltı). Oyun ses çıkarırken kulak susar; sesli görevlerde müzik durur;
 * tekerleme kaydı çalarken mikrofon dinlemez (sırayla: dize çalar, sonra çocuk alkışlar).
 *
 * Dünya: park (assets/film/park; yerleşim salincak-cizim.ts → PARK): uzak gök ve tepeler (kaydırınca yavaş kayar), orta
 * ağaçlar ve çit, kenarlarda ön katmanın çalı-lale kümeleri, zemin ön katmanın çimeni. Ölçü birimi b (--b); eşyalar b
 * cinsinden. Kamera kaydırır ve yaklaşır; artan boy üste (gök) gider, zemin altta az kalır. Kadraj koruması her
 * çekimde: kimse ve salıncağın A ayakları kenarda yarım kalmaz (yarım kalacaksa çekim genişler ya da tamamen dışarıda).
 * Salıncak: iki zincirli sarkaç (oturak yatay kalır), fizik salincak-mantik.ts → Sarkac.
 */
import '../../src/karakter/karakter.css';
import './salincak.css';
import SL from '../../content/macera-salincak.json';
import { KINO_SESI, konus } from '../../src/audio/ses';
import { muzikDurdur } from '../../src/audio/muzik';
import { DosyaMuzik } from '../../src/audio/dosya-muzik';
import { KayitCalar, sarkiTablosu } from '../../src/audio/sarki-kayit';
import { durum } from '../../src/engine/ilerleme';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { SessizlikSayaci, seviye, type Ozellik } from '../../ses-testi/src/analiz';
import { Alkis, sesVar } from '../../orman/src/gorev';
import { kulak } from '../../orman/src/kulak';
import { YandanKarakter } from '../../src/karakter/yandan';
import type { BolumArayuz } from './dogumgunu';
import { Sahne } from './sahne';
import { Kisi } from './banyo-karakter';
import { fularSvg } from './banyo-gorsel';
import { Ege, egeGenislik } from './ege-bebek';
import { SesSeviyesi } from './ege-seviye';
import { kikir as egeKikir } from './ege-ses';
import { Ipucu, parmak } from './ege-surukle';
import { balonGoster } from './elektrik-efekt';
import { Anne, Cocuk, cocukGenislik, MINO_W } from './salincak-karakter';
import {
  ASKI,
  bankSvg,
  BANK,
  beklemeCizgisiSvg,
  CERCEVE,
  CERCEVE_KUTU,
  cerceveSvg,
  cimenYeri,
  KAYDIRAK,
  kaydirakArkaSvg,
  kaydirakOnSvg,
  kaymaNoktasi,
  kelepceSvg,
  KOVA,
  kovaArkaSvg,
  kovaOnSvg,
  KUME_AYRI_ORAN,
  KUME_ORAN,
  KUM,
  kumArkaSvg,
  kumOnSvg,
  kumYiginSvg,
  MERDIVEN,
  OTURAK,
  oturakSvg,
  PARK,
  PARK_ORAN,
  cimenKaynakEni,
  PARK_RESIM,
  YILDIZ_SVG,
  ZINCIR,
  zincirSvg,
} from './salincak-cizim';
import {
  canYuzu,
  DURMA_GENLIK,
  egeItisi,
  EN_BUYUK_ACI,
  hopArtisi,
  IPUCU_SURE,
  itisPenceresi,
  kabulMu,
  kaydirakIlerle,
  KAYMA_IPUCU,
  kucukMu,
  minoItisi,
  parmakItisi,
  ritimTurlari,
  salincakAyar,
  SalinimSayaci,
  Sarkac,
  sayiSoyle,
  SERT_GENLIK,
  SES_ITISI,
  surukleIlerle,
  SUS_SURTUNME,
  TUT_SURTUNME,
  YUMUSAK_GENLIK,
  yankiSonuc,
  type Itis,
  type RitimTur,
} from './salincak-mantik';
import * as S from './salincak-ses';

const M = SL.mino;
const KN_ = SL.kino;
const B = SL.balon;
const I = SL.ipucu;
const IPTAL = Symbol('iptal');
const PARK_DOSYA = import.meta.glob<string>('../../assets/film/park/*.webp', { eager: true, query: '?url', import: 'default' });
const park = (ad: string) => PARK_DOSYA[`../../assets/film/park/${ad}.webp`] ?? '';
const ISKELET = import.meta.glob<string>(['../../assets/karakter-iskelet/kino.svg', '../../assets/karakter-iskelet/ege.svg'], { eager: true, query: '?url', import: 'default' });
const kutu = (el: Element) => () => el.getBoundingClientRect();
const merkezi = (r: DOMRect): [number, number] => [r.left + r.width / 2, r.top + r.height / 2];

/** Dünyanın eni (b); park katmanlarının yerleşimi salincak-cizim.ts → PARK */
const WB = 400;
/** Zeminin (v = 0) altında kalan çimen payı (b); dünyanın üstü uzak katmanın (gök) üst kenarı */
const ALT_PAY = 20;
const UZAK_H = PARK.uzak.w / PARK_ORAN;
const ORTA_H = PARK.orta.w / PARK_ORAN;
/**
 * Boylar tek tablodan (src/karakter/boy.ts; salincak-karakter.ts → MINO_W): Mino ve Kino çiziminin kutusu (b), çocuklar
 * Mino'nun ~1.35 katı, oturan Ege Mino'dan biraz büyük. KISI_K: Mino / Kino'nun eski tasarıma (24 b) göre ölçeği;
 * EGE_K: Ege'nin (ve bebek oturağının, kucağın) eski tasarıma (14 b) göre ölçeği.
 */
const KISI_W = MINO_W;
const KISI_K = KISI_W / 24;
const CAN_W = cocukGenislik('can');
const ADA_W = cocukGenislik('ada');
const EGE_W = egeGenislik(KISI_W);
const EGE_K = EGE_W / 14;
/** Kino oturunca kalçası kutunun altından bu kadar yukarıda (b); yan görünüşte göbek (ters binince) */
const KINO_OTURMA = 3.3 * KISI_K;
const KINO_GOBEK = 10.6 * KISI_K;
/** Mino oturunca */
const MINO_OTURMA = 1.6 * KISI_K;
/** Bebek Ege oturunca */
const EGE_OTURMA = 1.7 * EGE_K;
/**
 * Bebek oturağının zinciri: oturak Ege'yle büyüdü; alt kenarı zeminden 4 b yukarıda kalsın (oturağın üstü bağlantının
 * 5.4 b üstünde, altı KOVA.h - 5.4 altında), Ege'nin başı barın altında kalsın
 */
const ZINCIR_BEBEK = CERCEVE.bar - 4 - (KOVA.h - 5.4) * EGE_K;
/** Test modunda fizik daha hızlı akar (bekleme kısalsın) */
const FIZIK = TEST_MODU ? 2.6 : 1;

type Kisiler = Kisi | Cocuk;

export async function salincakKimin(kok: HTMLElement, ui: BolumArayuz): Promise<void> {
  const yas = durum.i.yas ?? 4;
  const ayar = salincakAyar(yas);
  const mik = () => kulak.acik && !TEST_MODU;

  // ================================================================ sahne ve dünya ölçüsü
  const sahne = new Sahne('');
  sahne.el.classList.add('sl-sahne');
  // bebek oturağı ve kucak Ege'yle orantılı (salincak.css → --kova)
  sahne.el.style.setProperty('--kova', EGE_K.toFixed(4));
  kok.append(sahne.el);
  const W = sahne.el.clientWidth || innerWidth;
  const H = sahne.el.clientHeight || innerHeight;
  // yatay ekranda çekim alçak ve geniş: uzak katman (gök, tepeler) biraz aşağıda, ufuk ekranın üst kısmında kaybolmasın
  const uzak = W / H > 1.3 ? PARK.uzakYatay : PARK.uzak;
  const HB = uzak.alt + UZAK_H + ALT_PAY;
  const bPx = Math.max(W / WB, H / HB);
  const Wd = WB * bPx;
  const Hd = HB * bPx;
  const dunya = sahne.dunya;
  Object.assign(dunya.style, { width: `${Wd}px`, height: `${Hd}px`, right: 'auto', bottom: 'auto' });
  sahne.el.style.setProperty('--b', `${bPx.toFixed(3)}px`);
  const bX = (n: number) => (n / WB) * 100;
  const bY = (n: number) => (n / HB) * 100;
  /** Konum: u (dünyanın ortasından b), v (dünyanın altından b) */
  const X = (u: number) => 50 + bX(u);
  const Y = (v: number) => bY(v + ALT_PAY);
  const dikey = W / H < 0.8;
  /** Dar dikey ekran (telefon): çekimler tek odaklı ve yakın; Can yakın çekim penceresinde */
  const dar = dikey && W < 600;
  /** Alçak yatay telefon */
  const yatayTel = W / H > 1.3 && H < 500;

  // park katmanları (salincak-cizim.ts → PARK): uzak (gök, bulutlar, tepeler, evler; kaydırınca yavaş kayar) · orta
  // (iki büyük ağaç ve çit; çizili küçük salıncak kırpılır) · kenar çalıları (ön katmanın köşe kümeleri, ağaçların
  // dibinde; çizili bankı ve tahterevalliyi örter) · ön çimen (ön katmanın çimeni; üst kenarı eşyaların arkasında)
  const katman = (sinif: `div.${string}`, ad: string, k: { w: number; alt: number }, hh: number) =>
    h(sinif, { style: `background-image:url("${park(ad)}");left:${X(-k.w / 2)}%;width:${bX(k.w)}%;bottom:${Y(k.alt)}%;height:${bY(hh)}%` });
  const gok = katman('div.sl-gok', 'arka-uzak', uzak, UZAK_H);
  const orta = katman('div.sl-orta', 'arka-orta', PARK.orta, ORTA_H);
  const cy = cimenYeri(ALT_PAY);
  // ön çimen şeridi resmin altından (y0 → 1) eşit ölçekle kesilir (esnemez): dünyanın eni kadar şerit için kaynak eni
  // şeridin oranından gelir (ortada, x0-x1 aralığının biraz dışına taşar; kenarlar köşe öbeklerinin arkasında kalır)
  const { y0 } = PARK_RESIM.cimenKaynak;
  const cimenEn = cimenKaynakEni(WB, cy.boy);
  const cimen = h('div.sl-cimen', {
    style: `background-image:url("${park('arka-on')}");background-size:${(100 / cimenEn).toFixed(3)}% ${100 / (1 - y0)}%;bottom:${Y(cy.alt)}%;height:${bY(cy.boy)}%`,
  });
  /**
   * Köşe kümesi (çalı, lale, mantar, taş): w eni (b); dünyada u ortası, v altı. Ayrı çizim (film/park/kume-sol,
   * kume-sag: şeffaf, ortak tuval, alta hizalı) varsa o, kendi oranında; yoksa ön katmanın köşesinden kesilir.
   */
  const kume = (yon: 'sol' | 'sag', u: number, v: number, w: number, ek = '') => {
    const { kume: kk } = PARK_RESIM;
    const ayri = park(`kume-${yon}`);
    const e = ayri
      ? h(`div.sl-kume.sl-kume-ayri.${yon}${ek}`, { style: `background-image:url("${ayri}");aspect-ratio:${KUME_AYRI_ORAN.toFixed(4)}` })
      : h(`div.sl-kume.${yon}${ek}`, {
          style: `background-image:url("${park('arka-on')}");background-size:${100 / kk.w}% ${100 / (1 - kk.y0)}%;aspect-ratio:${KUME_ORAN.toFixed(4)}`,
        });
    e.style.setProperty('--x', String(X(u)));
    e.style.setProperty('--y', String(Y(v)));
    e.style.setProperty('--w', String(w));
    return e;
  };
  // kenar çalıları: ağaçların dibinde, ön çimenin arkasında (altları çimenin kenarında kalır)
  const CALI = { w: 104, alt: 40 };
  dunya.append(gok, orta, kume('sol', -WB / 2 + CALI.w * 0.42, CALI.alt, CALI.w), kume('sag', WB / 2 - CALI.w * 0.42, CALI.alt, CALI.w), cimen);
  // ön çiçek öbekleri: yalnız kenarlarda, düzenli (karakterlerin yürüdüğü orta boş kalır)
  for (const [yon, u, v, w] of [
    ['sol', -176, -4, 58],
    ['sag', 176, -4, 58],
    ['sol', -118, 8, 36],
    ['sag', 118, 6, 40],
  ] as const) {
    const e = kume(yon, u, v, w, '.on');
    e.style.zIndex = '2';
    dunya.append(e);
  }

  // ================================================================ yerleşim (b)
  const ZEMIN = 44;
  const CER_Y = 52;
  const BAR_Y = CER_Y + CERCEVE.bar;
  const BANK_YER = { x: -104, y: 50 };
  const BANK_OTURAK = BANK_YER.y + BANK.oturak;
  const ANNE_YER = { x: BANK_YER.x - 15, y: BANK_YER.y - 0.5 };
  const CAN_BANK = { x: BANK_YER.x + 18 };
  const ADA_YER = { x: -150, y: ZEMIN + 2 };
  const MINO_YER = { x: -60, y: ZEMIN - 5 };
  const CIZGI = { x: ASKI.buyuk, y: ZEMIN - 2.5, w: 48 };
  const BEKLE = { x: ASKI.buyuk - 14, y: ZEMIN - 7 };
  const KAYDIRAK_SOL = 92;
  const KAYDIRAK_Y = 52;
  const KUM_YER = { x: KAYDIRAK_SOL + 70, y: 43 };

  // ================================================================ eşyalar
  const koy = (el: HTMLElement, u: number, v: number, w: number, z: number) => sahne.koy(el, { x: X(u), y: Y(v), w, z });
  const bank = koy(h('div.sl-bank', { 'data-el': 'bank', html: bankSvg() }), BANK_YER.x, BANK_YER.y - 1.2, BANK.w, 6);
  // bekleme çizgisi (yerde, salıncağın önünde)
  koy(h('div.sl-cizgi', { 'data-el': 'cizgi', html: beklemeCizgisiSvg() }), CIZGI.x, CIZGI.y, CIZGI.w, 3);
  // salıncak çerçevesi (arka), oturaklar (sarkaç), kelepçeler (ön)
  koy(h('div.sl-cerceve', { 'data-el': 'cerceve', html: cerceveSvg() }), 0, CER_Y - CERCEVE_KUTU.alt, CERCEVE_KUTU.w, 5);
  // kadraj koruması: salıncağın iki A ayağı (görünmez işaret; kutunun %10'u kenarlardan kırpılır diye geniş) ya tamamen
  // görünür ya hiç görünmez; iskele kenarda kesik kalmaz
  const AYAK = { u: (CERCEVE.disAyak + CERCEVE.icAyak) / 2 + 1.2, w: (CERCEVE.disAyak - CERCEVE.icAyak + 8) / 0.8 };
  const ayaklar = [-1, 1].map((s) => koy(h('div.sl-isaret.sl-ayak'), s * AYAK.u, CER_Y, AYAK.w, 1));
  // bebek oturağı da (az sallanır) kenarda yarım kalmaz
  ayaklar.push(koy(h('div.sl-isaret.sl-ayak'), ASKI.bebek, CER_Y, (KOVA.w * EGE_K + 2) / 0.8, 1));

  interface SarkacDom {
    ad: 'buyuk' | 'bebek';
    s: Sarkac;
    L: number;
    kap: HTMLElement;
    zincirler: HTMLElement[];
    binek: HTMLElement;
    binici: HTMLElement;
    golge: HTMLElement;
    /** oturağın dokunma alanı (oturak + binen) */
    alan: HTMLElement;
    halka: HTMLElement;
    /** sürtünme çarpanı (sus, fren) */
    surt: number;
  }
  const BINICI = { w: 40, h: 46 };
  function sarkacKur(ad: 'buyuk' | 'bebek'): SarkacDom {
    const L = ad === 'buyuk' ? ZINCIR.buyuk : ZINCIR_BEBEK;
    const ara = ad === 'buyuk' ? OTURAK.zincirAra : KOVA.zincirAra * EGE_K;
    const zincirler = [-1, 1].map((s) => h('div.sl-zincir', { style: `left:calc(${(s * ara) / 2 - 1} * var(--b));height:calc(${L} * var(--b))`, html: zincirSvg(L) }));
    const oturak = ad === 'buyuk' ? h('div.sl-oturak', { html: oturakSvg() }) : h('div.sl-kova.arka', { html: kovaArkaSvg() });
    const onParca = ad === 'bebek' ? h('div.sl-kova.on', { html: kovaOnSvg() }) : null;
    // (binen: oturağın üst çizgisine oturur; bebek oturağında kovanın içine)
    const binici = h('div.sl-binici', { style: `left:calc(${-BINICI.w / 2} * var(--b));width:calc(${BINICI.w} * var(--b));height:calc(${BINICI.h} * var(--b));top:calc(${-BINICI.h + (ad === 'buyuk' ? 0.7 : 2.8 * EGE_K)} * var(--b))` });
    const halka = h('i.sl-halka');
    const alan = h('div.sl-alan', { 'data-el': ad === 'buyuk' ? 'salincak' : 'bebek-salincak', style: ad === 'buyuk' ? '' : `--aw:${(20 * EGE_K).toFixed(1)};--ah:${(26 * EGE_K).toFixed(1)}` });
    const binek = h('div.sl-binek', { style: `top:calc(${L} * var(--b))` }, halka, oturak, binici, ...(onParca ? [onParca] : []), alan);
    const kap = h('div.sl-sarkac', { 'data-sarkac': ad, style: `left:${X(ASKI[ad])}%;bottom:${Y(BAR_Y)}%` }, ...zincirler, binek);
    kap.style.zIndex = '7';
    dunya.append(kap);
    const golge = koy(h('div.sl-oturak-golge'), ASKI[ad], CER_Y - 0.6, ad === 'buyuk' ? 22 : 14, 5);
    koy(h('div.sl-kelepce', { html: kelepceSvg() }), ASKI[ad] - ara / 2, BAR_Y - 2.6, 2.6, 8);
    koy(h('div.sl-kelepce', { html: kelepceSvg() }), ASKI[ad] + ara / 2, BAR_Y - 2.6, 2.6, 8);
    return { ad, s: new Sarkac(), L, kap, zincirler, binek, binici, golge, alan, halka, surt: 1 };
  }
  const BUYUK = sarkacKur('buyuk');
  const BEBEK = sarkacKur('bebek');
  BEBEK.s.enBuyuk = 0.3;
  const sarkacCiz = (d: SarkacDom) => {
    const a = d.s.aci;
    const Lp = d.L * bPx;
    const dx = Lp * Math.sin(a);
    const dy = -Lp * (1 - Math.cos(a));
    for (const z of d.zincirler) z.style.transform = `rotate(${(-a).toFixed(4)}rad)`;
    d.binek.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${(a * 0.18).toFixed(4)}rad)`;
    const yuk = 1 - Math.cos(a);
    d.golge.style.transform = `translateX(${dx.toFixed(1)}px) scale(${(1 - yuk * 2.2).toFixed(3)})`;
    d.golge.style.opacity = String(Math.max(0.35, 1 - yuk * 3).toFixed(2));
  };

  // kaydırak ve kum havuzu
  const kaydirakArka = koy(h('div.sl-kaydirak', { 'data-el': 'kaydirak', html: kaydirakArkaSvg() }), KAYDIRAK_SOL + KAYDIRAK.w / 2, KAYDIRAK_Y, KAYDIRAK.w, 5);
  const kaydirakOn = koy(h('div.sl-kaydirak.on', { html: kaydirakOnSvg() }), KAYDIRAK_SOL + KAYDIRAK.w / 2, KAYDIRAK_Y, KAYDIRAK.w, 8);
  const kumArka = koy(h('div.sl-kum', { 'data-el': 'kum', html: kumArkaSvg() }), KUM_YER.x, KUM_YER.y, KUM.w, 6);
  const kumOn = koy(h('div.sl-kum.on', { html: kumOnSvg() }), KUM_YER.x, KUM_YER.y, KUM.w, 9);
  void kumArka;
  /** Kayma yolundaki nokta (b; dünya) */
  const kaymaB = (t: number) => {
    const p = kaymaNoktasi(t);
    return { u: KAYDIRAK_SOL + p.x / 10, v: KAYDIRAK_Y + (KAYDIRAK.h * 10 - p.y) / 10, aci: p.aci };
  };
  const merdivenB = (t: number) => {
    const [ax, ay] = MERDIVEN.alt;
    const [ux, uy] = MERDIVEN.ust;
    return { u: KAYDIRAK_SOL + (ax + (ux - ax) * t) / 10, v: KAYDIRAK_Y + (KAYDIRAK.h * 10 - (ay + (uy - ay) * t)) / 10 };
  };
  // kaydırağın sonu (test ve ipucu için görünmez işaret)
  {
    const son = kaymaB(0.97);
    koy(h('div.sl-isaret', { 'data-el': 'kaydirak-son' }), son.u, son.v, 4, 1);
  }

  // ================================================================ karakterler
  const MN = new Kisi('mino');
  const KN = new Kisi('kino');
  MN.el.dataset.el = 'mino';
  KN.el.dataset.el = 'kino';
  const CAN = new Cocuk('can');
  const ADA = new Cocuk('ada');
  const ANNE = new Anne();
  const EGE = new Ege();
  const egeKap = h('div.sl-ege', { 'data-el': 'ege' }, EGE.el);
  // Kino'nun yan görünüşü (koşarken, ters binince): gövde katmanında önden çizimin yerine
  const kinoYan = new YandanKarakter('kino');
  const kinoYanKap = h('div.sl-kino-yan', {}, kinoYan.el);
  KN.gov.append(kinoYanKap);
  sahne.koy(MN.el, { x: X(MINO_YER.x), y: Y(MINO_YER.y), w: KISI_W, z: 12 });
  sahne.koy(KN.el, { x: X(WB / 2 + 30), y: Y(ZEMIN - 2), w: KISI_W, z: 11 });
  sahne.koy(CAN.el, { x: X(-WB / 2 - 30), y: Y(ZEMIN), w: CAN_W, z: 9 });
  sahne.koy(ADA.el, { x: X(ADA_YER.x), y: Y(ADA_YER.y), w: ADA_W, z: 9 });
  sahne.koy(ANNE.el, { x: X(ANNE_YER.x), y: Y(ANNE_YER.y), w: ANNE.genislik, z: 8 });
  ANNE.poz('oturuyor');
  ANNE.el.style.setProperty('--w', ANNE.genislik.toFixed(2));
  CAN.koy(X(-WB / 2 - 30), Y(ZEMIN));
  ADA.koy(X(ADA_YER.x), Y(ADA_YER.y));
  // Ege annenin kucağında
  const egeKucakta = () => {
    ANNE.kucak.append(egeKap);
    egeKap.classList.add('kucakta');
    egeKap.classList.remove('mc-oge');
    egeKap.removeAttribute('style');
  };
  egeKucakta();
  // kadraj koruması için gidilen yer (yürürken de bilinsin)
  const hedefY = new Map<Kisi, number>();
  for (const k of [MN, KN]) {
    const git = k.git.bind(k);
    k.git = (x, y, ...a) => {
      hedefY.set(k, y);
      return git(x, y, ...a);
    };
  }
  await Promise.all([KN.hazir(), CAN.hazir(), ADA.hazir(), EGE.hazir()]);

  // Kino'nun ek duruşu: oturma (govde-oturma), kalkık kollar (kol-*-yukari), kulakların salıncakla savrulması
  const kn = { otur: false, yukSol: 0, yukSag: 0, kulak: 0, kulakSal: 0 };
  {
    const kar = KN.kar!;
    const eski = kar.ekHareket;
    kar.ekHareket = (p, t) => {
      eski?.(p, t);
      const otur = kn.otur && !!kar.parcaG('govde-oturma');
      kar.ek('govde-oturma', otur);
      kar.ek('kuyruk-oturma', otur);
      kar.gizle('govde', otur);
      kar.gizle('kuyruk', otur);
      const ks = kn.yukSol >= 30 && !!kar.parcaG('kol-sol-yukari');
      const kg = kn.yukSag >= 30 && !!kar.parcaG('kol-sag-yukari');
      kar.ek('kol-sol-yukari', ks);
      kar.ek('kol-sag-yukari', kg);
      kar.gizle('kol-sol', ks);
      kar.gizle('kol-sag', kg);
      p.yukSol = ks ? kn.yukSol : 0;
      p.yukSag = kg ? kn.yukSag : 0;
      // kulaklar: salıncağın hızına göre savrulur (pervane); durunca bir süre kendi kendine sallanır
      const k = kn.kulak + kn.kulakSal * Math.sin(t * 13);
      p.kulakSol += k;
      p.kulakSag += k;
    };
  }
  /** Kino'nun bedeni: 'on' önden, 'yan' yan görünüş (koşu), 'ters' karnının üstünde (yan görünüş yatık) */
  const kinoBeden = (b: 'on' | 'yan' | 'ters') => {
    KN.el.classList.toggle('sl-yandan', b !== 'on');
    KN.el.classList.toggle('sl-ters', b === 'ters');
  };
  const kinoKos = async (u: number, v: number, ms: number) => {
    const dx = X(u) - KN.x;
    if (Math.abs(dx) < bX(4)) return KN.git(X(u), Y(v), ms);
    kinoYan.yon = dx < 0 ? -1 : 1;
    kinoBeden('yan');
    const yolCizim = (Math.abs(dx) / 100) * Wd / Math.max(1, kinoYanKap.offsetWidth || KISI_W * bPx * 1.45) * 2048;
    kinoYan.yuru(Math.min(4.2, Math.max(1.2, yolCizim / 900 / Math.max(0.2, sure(ms) / 1000))));
    await KN.git(X(u), Y(v), ms, 0, 'linear');
    kinoYan.dur();
    await bekle(140);
    kinoBeden('on');
  };

  // ================================================================ akış altyapısı
  const tikler = new Set<(dt: number) => void>();
  let iptaller: (() => void)[] = [];
  let kapandi = false;
  let onceki = performance.now();
  /** Sesli görev sürüyor: gıcırtı, rüzgâr ve kuş sesi yok (mikrofon kendi sesini duymasın) */
  let sessizOyun = false;
  let kusZaman = 3;
  let raf = requestAnimationFrame(function d(t) {
    const dt = Math.min(0.1, (t - onceki) / 1000);
    onceki = t;
    if (ui.kapandiMi() && !kapandi) {
      kapandi = true;
      iptaller.slice().forEach((f) => f());
    }
    for (const sk of [BUYUK, BEBEK]) {
      const eskiHiz = sk.s.hiz;
      sk.s.tik(dt * FIZIK, sk.surt);
      sarkacCiz(sk);
      // salıncak sesleri (yalnız mikrofon dinlemiyorken): uçta hafif gıcırtı, dipte rüzgâr
      if (!sessizOyun && !TEST_MODU) {
        const g = sk.s.genlik;
        if (g > 0.12 && Math.sign(eskiHiz) !== Math.sign(sk.s.hiz) && eskiHiz !== 0 && sk.s.aci > 0) S.gicirti(g / EN_BUYUK_ACI, 0);
        if (g > 0.3 && Math.abs(sk.s.aci) < 0.03 && Math.abs(eskiHiz) > 0.8) S.vuus(g / EN_BUYUK_ACI);
      }
    }
    // Kino binerken kulakları salıncakla savrulur
    if (KN.el.parentElement === BUYUK.binici) kn.kulak = Math.max(-8, Math.min(20, -BUYUK.s.hiz * 9));
    if (!sessizOyun && !TEST_MODU) {
      kusZaman -= dt;
      if (kusZaman < 0) {
        kusZaman = 5 + Math.random() * 7;
        S.kus();
      }
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
    if (ad) sahne.el.dataset.slGorev = ad;
    else delete sahne.el.dataset.slGorev;
    if (hedef !== undefined) sahne.el.dataset.slHedef = String(hedef);
    else delete sahne.el.dataset.slHedef;
  };

  const mSoyle = async (t: string) => {
    if (kapandi) throw IPTAL;
    ui.yazi(t);
    await konus(t, { ton: 1.12 });
    if (kapandi) throw IPTAL;
  };
  const kSoyle = async (t: string) => {
    if (kapandi) throw IPTAL;
    ui.yazi(t);
    MN.mino!.agizSus = true;
    KN.konus(true);
    try {
      await konus(t, KINO_SESI);
    } finally {
      KN.konus(false);
      MN.mino!.agizSus = false;
    }
    if (kapandi) throw IPTAL;
  };
  const balonKatman = h('div.el-balonlar.sl-balonlar');
  sahne.el.append(balonKatman);
  /** Konuşma balonu (seslendirilmez): kişinin başının üstünde */
  const balon = (hedef: Kisiler | Anne | HTMLElement, yazi: string, ms = 1300) => {
    const el = hedef instanceof Kisi ? hedef.kap : hedef instanceof Cocuk ? hedef.kap : hedef instanceof Anne ? hedef.gov : hedef;
    const r = el.getBoundingClientRect();
    // çocuklarda kutunun üstü boş: başın tepesine
    const ust = hedef instanceof Cocuk ? 1 - hedef.tepeOran : hedef instanceof Kisi ? 0.06 : 0;
    return balonGoster(balonKatman, r, yazi, ms, ust);
  };
  const konfeti = (el: Element, adet = 50) => {
    const [x, y] = merkezi(el.getBoundingClientRect());
    konfetiPatlat(kok, x, y, adet);
  };

  // müzik: genel müziği durdur, parkın fonu (yalnız mikrofonun dinlemediği anlarda)
  muzikDurdur();
  const fon = new DosyaMuzik(S.fonAdresi(), 0.26);
  const fonAc = () => {
    if (!kapandi && fon.var) fon.baslat();
  };
  const sesliGorev = async <T>(f: () => Promise<T>): Promise<T> => {
    fon.durdur();
    sessizOyun = true;
    try {
      return await f();
    } finally {
      sessizOyun = false;
      fonAc();
    }
  };

  // parmak ipucu (görev bitince kapanır)
  const acik = new Set<{ kapat(): void }>();
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

  // ================================================================ kamera (kaydırma + yakınlık) ve kadraj koruması
  let kamZ = 1;
  let kamT: [number, number] = [0, H - Hd];
  dunya.style.transformOrigin = '0 0';
  /** Uzak gökyüzü kaydırınca yavaş kayar (derinlik) */
  const PARALAKS = 0.55;
  const kamUygula = (ms: number) => {
    const d = `${sure(ms)}ms`;
    dunya.style.transitionDuration = d;
    dunya.style.transform = `translate(${kamT[0].toFixed(1)}px, ${kamT[1].toFixed(1)}px) scale(${kamZ.toFixed(4)})`;
    gok.style.transitionDuration = d;
    gok.style.transform = `translateX(${((-kamT[0] * (1 - PARALAKS)) / kamZ).toFixed(1)}px)`;
    sahne.el.dataset.kamera = kamZ.toFixed(2);
  };
  kamUygula(0);
  /** Güvenli alan (px): üstte düğme ve yazı, altta ipucu (arayüzden ölçülür) */
  const GUVEN = { ust: dikey ? 104 : 72, alt: dikey ? 84 : 56 };
  {
    const bolum = kok.closest('.mc-bolum');
    const sr = sahne.el.getBoundingClientRect();
    const ust = bolum?.querySelector('.mc-ust')?.getBoundingClientRect();
    const alt = bolum?.querySelector('.mc-alt')?.getBoundingClientRect();
    if (ust && ust.height) GUVEN.ust = Math.max(GUVEN.ust * 0.8, ust.bottom - sr.top + 10);
    if (alt && alt.height) GUVEN.alt = Math.max(GUVEN.alt * 0.8, sr.bottom - alt.top + 6);
  }
  /** Ekran noktası → dünya pikseli (ölçeksiz) */
  const dunyaPx = (cx: number, cy: number): [number, number] => {
    const r = dunya.getBoundingClientRect();
    return [((cx - r.left) / r.width) * Wd, ((cy - r.top) / r.height) * Hd];
  };
  /** Kişinin dünyadaki görünen kutusu (%): yürüyenlerde gittiği yer, binenlerde ekrandaki yeri; gizliyse null */
  const kisiKutu = (k: Kisiler | Anne | HTMLElement): { l: number; r: number } | null => {
    const el = k instanceof Kisi || k instanceof Cocuk || k instanceof Anne ? k.el : k;
    if (!el.isConnected || el.classList.contains('sl-gizli')) return null;
    if (el.parentElement === dunya && (k instanceof Kisi || k instanceof Cocuk)) {
      const w = Number(el.style.getPropertyValue('--w')) || KISI_W;
      // görünen gövde kutunun ortası: Mino / Kino ~%80, çocuklar ~%55
      const gorunen = bX(w * (k instanceof Kisi ? 0.8 : 0.55));
      const x = k instanceof Kisi ? k.hedefX : (k.hedefX ?? k.x);
      return { l: x - gorunen / 2, r: x + gorunen / 2 };
    }
    const r = (k instanceof Kisi ? k.kap : k instanceof Cocuk ? k.kap : k instanceof Anne ? k.gov : k).getBoundingClientRect();
    if (!r.width) return null;
    const [a] = dunyaPx(r.left + r.width * (k instanceof Cocuk ? 0.22 : 0.1), 0);
    const [b] = dunyaPx(r.right - r.width * (k instanceof Cocuk ? 0.22 : 0.1), 0);
    return { l: (a / Wd) * 100, r: (b / Wd) * 100 };
  };
  const korunan = (): (Kisiler | Anne | HTMLElement)[] => [MN, KN, CAN, ADA, ANNE, egeKap, ...ayaklar];
  /**
   * Çekim: dünyadaki bir bölge (b: sol, sağ, alttan alt, alttan üst) güvenli alana sığsın; zmax en çok yakınlık.
   * Dünya ekranı her zaman örter. Kadraj koruması: bir kişi kenarda yarım kalacaksa önce onu tamamen dışarıda
   * bırakacak kaydırma denenir (istenen bölge içeride kalıyorsa), olmazsa çekim onu da içine alacak kadar genişler.
   */
  const cekB = (lb: number, rb: number, altb: number, ustb: number, zmax = 2, ms = 1100) => {
    // dar dikey ekranda en çok bu kadar yakın: ufuk ekranın üst üçte biriyle ortası arasında kalsın
    if (dar) zmax = Math.min(zmax, 2.2);
    let l = X(lb);
    let r = X(rb);
    const alt = Y(altb);
    const ust = Y(ustb);
    const gw = W;
    const gh = H - GUVEN.ust - GUVEN.alt;
    const hesap = (l: number, r: number) => {
      const bw = ((r - l) / 100) * Wd;
      const bh = ((ust - alt) / 100) * Hd;
      const z = Math.max(1, Math.min(zmax, gw / Math.max(1, bw), gh / Math.max(1, bh)));
      const cx = ((l + r) / 200) * Wd;
      // dikeyde bölge güvenli alana enden sığar, boyda yer artar: artan yer çoğunlukla üste (gök, ağaçlar) gider,
      // zemin ekranın altında az kalır (bölgenin altı güvenli alanın altına yakın)
      const ustPx = Hd * (1 - ust / 100);
      const artan = Math.max(0, gh - bh * z);
      const tx = Math.min(0, Math.max(W - Wd * z, gw / 2 - cx * z));
      const ty = Math.min(0, Math.max(H - Hd * z, GUVEN.ust + artan * 0.88 - ustPx * z));
      return { z, tx, ty };
    };
    let c = hesap(l, r);
    for (let tur = 0; tur < 3; tur++) {
      let degisti = false;
      for (const k of korunan()) {
        const kk = kisiKutu(k);
        if (!kk) continue;
        const vl = (-c.tx / c.z / Wd) * 100;
        const vr = ((W - c.tx) / c.z / Wd) * 100;
        if (kk.r <= vl || kk.l >= vr || (kk.l >= vl && kk.r <= vr)) continue;
        const gorunen = (Math.min(vr, kk.r) - Math.max(vl, kk.l)) / Math.max(0.01, kk.r - kk.l);
        // yakınlığı bozmadan kaydırmayı dene: çoğu görünüyorsa tamamen içeri, azı görünüyorsa tamamen dışarı (istenen
        // bölge yine kadrajda kalmalı); olmazsa öbürü; o da olmazsa çekim genişler
        const solda = kk.l < vl;
        const icine = solda ? -((kk.l - 0.4) / 100) * Wd * c.z : W - ((kk.r + 0.4) / 100) * Wd * c.z;
        const disina = solda ? -((kk.r + 0.4) / 100) * Wd * c.z : W - ((kk.l - 0.4) / 100) * Wd * c.z;
        const uygun = (tx: number) => {
          const yl = (-tx / c.z / Wd) * 100;
          const yr = ((W - tx) / c.z / Wd) * 100;
          return yl <= l + 0.01 && yr >= r - 0.01 && tx <= 0 && tx >= W - Wd * c.z;
        };
        const aday = (gorunen >= 0.5 ? [icine, disina] : [disina, icine]).find(uygun);
        if (aday !== undefined) {
          c = { ...c, tx: aday };
          degisti = true;
          continue;
        }
        l = Math.min(l, kk.l - 0.6);
        r = Math.max(r, kk.r + 0.6);
        c = hesap(l, r);
        degisti = true;
      }
      if (!degisti) break;
    }
    // son güvence: hâlâ yarım kalan varsa (kaydırmalar birbirini bozduysa) çekim hepsini içine alacak kadar genişler
    for (let tur = 0; tur < 4; tur++) {
      const vl = (-c.tx / c.z / Wd) * 100;
      const vr = ((W - c.tx) / c.z / Wd) * 100;
      const yarim = korunan()
        .map(kisiKutu)
        .filter((kk): kk is { l: number; r: number } => !!kk && kk.r > vl && kk.l < vr && (kk.l < vl || kk.r > vr));
      if (!yarim.length) break;
      for (const kk of yarim) {
        l = Math.min(l, kk.l - 0.6);
        r = Math.max(r, kk.r + 0.6);
      }
      c = hesap(l, r);
    }
    kamZ = c.z;
    kamT = [c.tx, c.ty];
    kamUygula(ms);
    return bekle(ms * 0.9);
  };

  // ================================================================ serbest dokunma (her an): tepki
  let sonSerbest = 0;
  const serbest = (k: Kisiler) => (e: PointerEvent) => {
    const g = sahne.el.dataset.slGorev ?? '';
    if (performance.now() - sonSerbest < 800 || g) return;
    sonSerbest = performance.now();
    e.stopPropagation();
    if (k === MN) {
      MN.tepki('gidik');
      void balon(MN, 'Miyav!', 900);
    } else if (k === KN) {
      KN.kinoOynat('coskulu', 900);
      void balon(KN, 'Hav!', 900);
    } else if (k instanceof Cocuk) {
      k.sevin(900);
      void balon(k, B.hihi, 900);
    }
  };
  for (const k of [MN, KN] as Kisi[]) k.kap.addEventListener('pointerdown', serbest(k));
  for (const k of [CAN, ADA]) k.kap.addEventListener('pointerdown', serbest(k));

  // ================================================================ binme / inme
  /** Binenin oturakta yeri: kutunun altı oturağın üst çizgisinden `alt` b aşağıda (binici kutusunun %'si) */
  const binYer = (alt: number) => ({ x: 50, y: (-alt / BINICI.h) * 100 });
  /**
   * Bir elemanı başka bir kaba taşır (dünyadan oturağa ya da geri): ekrandaki yerinden yeni yerine yay çizerek atlar
   * (FLIP; kamera ölçeği hesaba katılır).
   */
  const atla = async (el: HTMLElement, kap: HTMLElement, x: number, y: number, ms = 600, yay = 40, z?: number) => {
    const once = el.getBoundingClientRect();
    el.getAnimations().forEach((a) => a.cancel());
    kap.append(el);
    el.style.setProperty('--x', String(x));
    el.style.setProperty('--y', String(y));
    if (z !== undefined) el.style.zIndex = String(z);
    const sonra = el.getBoundingClientRect();
    const olcek = sonra.width / Math.max(1, el.offsetWidth) || 1;
    const dx = (once.left + once.width / 2 - (sonra.left + sonra.width / 2)) / olcek;
    const dy = (once.top + once.height / 2 - (sonra.top + sonra.height / 2)) / olcek;
    await el
      .animate(
        [
          { translate: `${dx}px ${dy}px` },
          { translate: `${dx * 0.5}px ${dy * 0.5 - yay}px`, offset: 0.5 },
          { translate: '0px 0px' },
        ],
        { duration: sure(ms), easing: 'cubic-bezier(0.35, 0, 0.45, 1)' },
      )
      .finished.catch(() => undefined);
  };
  const bin = async (k: Kisi | Cocuk, sk: SarkacDom, alt: number) => {
    k.el.classList.add('sl-binen');
    const p = binYer(alt);
    await atla(k.el, sk.binici, p.x, p.y, 620, 34, 2);
    otur(k, true);
    S.pat();
    void k.gov.animate([{ scale: '1.1 0.88' }, { scale: '0.96 1.04' }, { scale: '1 1' }], { duration: sure(320), easing: 'ease-out' });
  };
  const in_ = async (k: Kisi | Cocuk, u: number, v: number, z: number) => {
    otur(k, false);
    await atla(k.el, dunya, X(u), Y(v), 560, 30, z);
    k.el.classList.remove('sl-binen');
    if (k instanceof Kisi) {
      hedefY.set(k, Y(v));
      k.koy(X(u), Y(v));
    }
    if (k instanceof Cocuk) k.koy(X(u), Y(v));
    S.pat();
  };
  const otur = (k: Kisi | Cocuk, acik: boolean) => {
    if (k === KN) {
      kn.otur = acik;
      kn.yukSol = kn.yukSag = acik ? 38 : 0;
    } else if (k === MN) void MN.mino!.otur(acik);
    else if (k instanceof Cocuk) {
      k.otur(acik);
      k.zincir(acik && k.el.parentElement === BUYUK.binici);
    }
  };

  /** Dar ekranda bank ile salıncak aynı çekime sığmaz: Can köşede yuvarlak bir pencerede (aynı hareketler) */
  let canYakin: Cocuk | null = null;
  let yakinEl: HTMLElement | null = null;
  /** Mino'nun uçan fuları */
  let fularEl: HTMLElement | null = null;

  // ================================================================ akış
  try {
    fonAc();
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
    fon.durdur();
    kulak.dinle(null);
    ui.ipucu(null);
    ui.dugmeKaldir();
    durumYaz(null);
    acik.forEach((o) => o.kapat());
    MN.kapat();
    KN.kapat();
    CAN.kapat();
    ADA.kapat();
    ANNE.kapat();
    EGE.kapat();
    kinoYan.kapat();
    (canYakin as Cocuk | null)?.kapat();
  }

  // ================================================================ çekimler (her ekran için)
  /** Salıncak yakın (büyük oturak ve binen) */
  function cekSalincak(ms = 1000, zmax = 2.4) {
    // dikeyde sol A ayağı ve büyük salıncak (tablette bebek oturağı da); kadraj koruması ayakları kesik bırakmaz
    return dar ? cekB(-86, 6, ZEMIN - 10, BAR_Y + 6, zmax, ms) : dikey ? cekB(-88, 34, ZEMIN - 10, BAR_Y + 6, zmax, ms) : cekB(-70, 30, ZEMIN - 10, BAR_Y + 6, zmax, ms);
  }
  /** Bank ve salıncak birlikte */
  function cekBankSalincak(ms = 1000) {
    return dar ? cekB(-128, -60, ZEMIN - 10, 96, 2.4, ms) : cekB(-140, 22, ZEMIN - 12, BAR_Y + 8, 2.2, ms);
  }

  // ================================================================ 1: Ters binen Kino
  async function sahne1() {
    ui.ilerleme(0, 7);
    // park: geniş plan; Can biraz geriden gelir, bankta beklemeye oturur
    void cekB(dar ? -150 : -175, dar ? -60 : 60, ZEMIN - 12, BAR_Y + 20, dar ? 2 : 1.6, 0);
    ADA.selam(1600);
    void balon(ADA, B.selam, 1200);
    await bekle(500);
    const canBankY = BANK_OTURAK - CAN.kalcaOran * CAN_W + 0.4;
    await CAN.git(X(CAN_BANK.x), Y(ZEMIN), 1500);
    CAN.otur(true);
    await CAN.git(X(CAN_BANK.x), Y(canBankY), 320, false);
    CAN.katman = 8;
    // Kino koşarak gelir: "Salıncak! Benim!"
    void cekB(-130, dar ? -2 : 40, ZEMIN - 12, BAR_Y + 10, 2, 900);
    S.patiler(8, 0.09);
    const kos = kinoKos(ASKI.buyuk + 26, ZEMIN - 2, 1300);
    await bekle(400);
    void kSoyle(KN_.benim).catch(() => undefined);
    await kos;
    // karnının üstüne biner, patileri havada
    KN.katman = 2;
    kinoBeden('ters');
    kinoYan.yon = 1;
    await atla(KN.el, BUYUK.binici, 50, (-KINO_GOBEK / BINICI.h) * 100, 520, 30, 2);
    KN.el.classList.add('sl-binen');
    S.pat();
    kinoYan.yuru(2.6);
    BUYUK.s.genlikYap(0.06);
    void cekSalincak(900);
    MN.mino!.ifade('saskin', 1800);
    MN.tepki('sasir');
    await bekle(500);
    await mSoyle(M.ters);
    await kinoCevir();
    kinoYan.dur();
    void balon(KN, B.guzel, 1500);
    KN.kinoIfade('heyecan', 1500);
    await bekle(700);
    await mSoyle(M.hop);
    await sesliGorev(() => hopGorevi());
    // en yükseğe çıktı: Kino kahkaha atar
    KN.kinoIfade('heyecan', 2200);
    void balon(KN, B.haha, 1400);
    S.yildiz(0);
    await bekle(1400);
    // geçiş (gerilim): kamera banka döner, Can bekliyor, yüzü yavaş yavaş asılıyor
    await (dar ? cekB(-128, -58, ZEMIN - 8, 92, 2.4, 1100) : cekBankSalincak(1100));
    canHep((c) => c.uzgun(1));
    await bekle(1300);
    ui.ilerleme(1, 7);
    await mSoyle(M.kural);
  }

  /** Kino'yu çevir: parmakla sürükle (döndürme hareketi); tek dokunuş yetmez (Kino kıpırdar) */
  function kinoCevir(): Promise<void> {
    durumYaz('cevir');
    ui.ipucu(I.cevir);
    return gorev<void>((coz) => {
      let yanlis = 0;
      const ip = ipucu(kutu(KN.kap), () => {
        const r = KN.kap.getBoundingClientRect();
        return new DOMRect(r.left + r.width * 0.9, r.top - r.height * 0.2, 1, 1);
      });
      let bas: [number, number] | null = null;
      let yol = 0;
      let son: [number, number] = [0, 0];
      const cevir = async () => {
        ip.ilerle();
        coz();
      };
      const dokun = (e: PointerEvent) => {
        e.stopPropagation();
        bas = [e.clientX, e.clientY];
        son = bas;
        yol = 0;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          /* test */
        }
      };
      const hareket = (e: PointerEvent) => {
        if (!bas) return;
        yol += Math.hypot(e.clientX - son[0], e.clientY - son[1]);
        son = [e.clientX, e.clientY];
        // parmakla çevrilirken Kino biraz döner
        KN.gov.style.rotate = `${Math.min(60, yol * 0.4).toFixed(1)}deg`;
        if (yol > Math.max(40, KN.kap.getBoundingClientRect().width * 0.35)) {
          bas = null;
          void cevir();
        }
      };
      const birak = () => {
        if (!bas) return;
        bas = null;
        KN.gov.style.rotate = '';
        // tek dokunuş: Kino kıpırdar, "Hı?" (3. denemede o da çevirir)
        if (kabulMu(yanlis)) return void cevir();
        yanlis++;
        ip.yanlis();
        void KN.kipir();
        void balon(KN, B.hi, 800);
      };
      const hedefler = [BUYUK.alan, KN.kap];
      hedefler.forEach((el) => {
        el.addEventListener('pointerdown', dokun);
        el.addEventListener('pointermove', hareket);
        el.addEventListener('pointerup', birak);
        el.addEventListener('pointercancel', birak);
      });
      return () => {
        bitir(ip);
        hedefler.forEach((el) => {
          el.removeEventListener('pointerdown', dokun);
          el.removeEventListener('pointermove', hareket);
          el.removeEventListener('pointerup', birak);
          el.removeEventListener('pointercancel', birak);
        });
        ui.ipucu(null);
        durumYaz(null);
      };
    }).then(async () => {
      // takla atıp oturur
      S.hop(0.8);
      KN.gov.style.rotate = '';
      await KN.gov.animate([{ rotate: '0deg', translate: '0 0' }, { rotate: '200deg', translate: '0 -40%', offset: 0.5 }, { rotate: '360deg', translate: '0 0' }], { duration: sure(620), easing: 'cubic-bezier(0.4, 0, 0.3, 1)' }).finished.catch(() => undefined);
      kinoBeden('on');
      const p = binYer(KINO_OTURMA);
      KN.el.style.setProperty('--x', String(p.x));
      KN.el.style.setProperty('--y', String(p.y));
      otur(KN, true);
      S.pat();
      await KN.gov.animate([{ scale: '1.12 0.86' }, { scale: '0.95 1.05' }, { scale: '1 1' }], { duration: sure(360), easing: 'ease-out' }).finished.catch(() => undefined);
    });
  }

  /** "Hop!": her ses (ya da dokunuş) bir itiş; 5-6 yaşta salıncak yanına gelince (halka parlarken) */
  function hopGorevi(): Promise<void> {
    durumYaz('hop', ayar.hopSayisi);
    ui.ipucu(mik() ? (ayar.hopPencere ? I.hop_halka : I.hop) : ayar.hopPencere ? I.hop_halka : I.hop_dokun);
    const artis = hopArtisi(ayar.hopSayisi);
    return gorev<void>((coz) => {
      let n = 0;
      let yanlis = 0;
      let mesgul = false;
      const ip = ipucu(kutu(BUYUK.alan));
      const dene = () => {
        if (mesgul) return;
        const pencere = !ayar.hopPencere || itisPenceresi(BUYUK.s, 0.4) || kabulMu(yanlis);
        if (!pencere) {
          yanlis++;
          ip.yanlis();
          void balon(KN, B.hi, 700);
          KN.kinoOynat('bak', 600, 1);
          return;
        }
        n++;
        ip.ilerle();
        BUYUK.s.it(artis);
        S.hop(n / ayar.hopSayisi);
        void balonGoster(balonKatman, BUYUK.alan.getBoundingClientRect(), B.hop, 600, 0.9);
        KN.kinoOynat('coskulu', 700);
        if (n === 2) void balon(KN, B.agaclar, 1300);
        sahne.el.dataset.slHedef = String(ayar.hopSayisi - n);
        if (n >= ayar.hopSayisi) {
          mesgul = true;
          setTimeout(coz, sure(900));
        }
      };
      // halka: salıncak sağ uca yakınken parlar (5-6)
      const kapat = tik(() => {
        const acikMi = ayar.hopPencere && itisPenceresi(BUYUK.s, 0.4) && BUYUK.s.genlik > 0.05;
        BUYUK.halka.classList.toggle('acik', ayar.hopPencere && (acikMi || BUYUK.s.genlik <= 0.05));
        sahne.el.dataset.slPencere = !ayar.hopPencere || itisPenceresi(BUYUK.s, 0.4) ? '1' : '0';
      });
      // mikrofon: herhangi bir ses ("Hop!"): sessizlikten sonra başlayan ses bir itiş
      let sesSure = 0;
      let sessizSure = 1;
      kulak.dinle((o) => {
        const k = kulak.ayar.kare;
        if (sesVar(o, kulak.ayar)) {
          sesSure += k;
          if (sesSure >= 0.08 && sessizSure >= 0.25) {
            sessizSure = 0;
            dene();
          }
        } else {
          if (sesSure > 0) sessizSure = 0;
          sesSure = 0;
          sessizSure += k;
        }
      });
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        dene();
      };
      BUYUK.alan.addEventListener('pointerdown', bas);
      return () => {
        kapat();
        kulak.dinle(null);
        bitir(ip);
        BUYUK.halka.classList.remove('acik');
        delete sahne.el.dataset.slPencere;
        BUYUK.alan.removeEventListener('pointerdown', bas);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  // ================================================================ Can'ın yakın çekimi (dar dikey ekran)
  function canHep(f: (c: Cocuk) => void) {
    f(CAN);
    if (canYakin) f(canYakin);
  }
  function yakinAc(acik: boolean) {
    if (!dar) return;
    if (acik && !yakinEl) {
      canYakin = new Cocuk('can');
      canYakin.otur(true);
      canYakin.uzgun(1);
      yakinEl = h('div.sl-yakin', { 'data-el': 'can-yakin', style: `background-image:url("${park('arka-uzak')}")` }, h('div.sl-yakin-bank', { html: bankSvg() }), canYakin.el);
      canYakin.el.classList.add('sl-yakin-can');
      sahne.el.append(yakinEl);
      yakinEl.style.top = `${GUVEN.ust + 4}px`;
      void yakinEl.offsetWidth;
      yakinEl.classList.add('acik');
    } else if (!acik && yakinEl) {
      const el = yakinEl;
      const c = canYakin;
      yakinEl = null;
      canYakin = null;
      el.classList.remove('acik');
      setTimeout(() => {
        el.remove();
        c?.kapat();
      }, 400);
    }
  }

  // ================================================================ 2: Say bakalım
  async function sahne2() {
    // salıncak sallanmaya devam eder (Kino ayaklarıyla güç verir)
    const pompa = tik(() => {
      if (BUYUK.s.genlik < 0.3) BUYUK.s.it(0.004);
    });
    yakinAc(true);
    await cekSalincakVeBank(1000);
    await mSoyle(ayar.sayi === 5 ? M.say_5 : M.say_10);
    const rozet = h('div.sl-rozet', { 'data-el': 'sayi' }, h('span.sl-rozet-yildiz', { html: YILDIZ_SVG }), h('b', {}, ''));
    koy(rozet, ASKI.buyuk, BAR_Y + 3, 12, 12);
    await sesliGorev(() => saymaGorevi(rozet));
    pompa();
    // son sayıda Can ayağa fırlar: "Sıra bende!"
    canHep((c) => {
      c.uzgun(0);
      c.sevin(1400);
    });
    void CAN.zipla(20, 700);
    if (canYakin) void canYakin.zipla(20, 700);
    await bekle(200);
    void balon(canYakin ?? CAN, B.sira_bende, 1500);
    S.yildiz(1);
    await bekle(1500);
    rozet.classList.add('gidiyor');
    setTimeout(() => rozet.remove(), sure(500));
    yakinAc(false);
    ui.ilerleme(2, 7);
  }
  function cekSalincakVeBank(ms: number) {
    return dar ? cekSalincak(ms) : cekBankSalincak(ms);
  }

  /** Salıncak her gelişinde bir alkış (ya da salıncağa dokunma); salınım tamamlanmadan gelen alkış sayılmaz */
  function saymaGorevi(rozet: HTMLElement): Promise<void> {
    const hedef = ayar.sayi;
    durumYaz('say', hedef);
    ui.ipucu(mik() ? I.say : I.say_dokun);
    const sayac = new SalinimSayaci();
    const eskiUc = BUYUK.s.onUc;
    BUYUK.s.onUc = (yon) => {
      if (yon === 1) sayac.uc();
    };
    return gorev<void>((coz) => {
      let yanlis = 0;
      const ip = ipucu(kutu(BUYUK.alan));
      const yazi = rozet.querySelector('b')!;
      const alkis = () => {
        if (sayac.sayi >= hedef) return;
        let sayildi = sayac.alkis();
        if (!sayildi && kabulMu(yanlis)) {
          sayac.sayi++;
          sayildi = true;
        }
        if (!sayildi) {
          // salıncak gelmeden: sayı artmaz, Can'ın parmağı havada bekler
          yanlis++;
          ip.yanlis();
          canHep((c) => c.ifade('saskin', 900));
          void balonGoster(balonKatman, BUYUK.alan.getBoundingClientRect(), B.hi, 700, 0.1);
          return;
        }
        yanlis = 0;
        ip.ilerle();
        const n = sayac.sayi;
        yazi.textContent = String(n);
        rozet.classList.remove('pat');
        void rozet.offsetWidth;
        rozet.classList.add('pat');
        S.nota(60 + [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][n - 1]);
        ui.yazi(sayiSoyle(n));
        void konus(sayiSoyle(n), { ton: 1.12 });
        canHep((c) => {
          c.say();
          c.uzgun(canYuzu(n, hedef));
        });
        KN.kinoOynat('coskulu', 500);
        sahne.el.dataset.slHedef = String(hedef - n);
        if (n >= hedef) setTimeout(coz, sure(700));
      };
      const kapat = tik(() => {
        sahne.el.dataset.slHazir = sayac.bekliyor ? '0' : '1';
      });
      const a = new Alkis(kulak.ayar);
      a.onAlkis = () => alkis();
      kulak.dinle((o) => a.kare(o));
      const kapatA = tik(() => a.tik());
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        S.sak();
        alkis();
      };
      BUYUK.alan.addEventListener('pointerdown', bas);
      return () => {
        kapat();
        kapatA();
        kulak.dinle(null);
        bitir(ip);
        BUYUK.s.onUc = eskiUc;
        delete sahne.el.dataset.slHazir;
        BUYUK.alan.removeEventListener('pointerdown', bas);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  // ================================================================ 3: "Bir daha!"
  async function sahne3() {
    // Can bekleme çizgisine gelir; Kino zincire baş aşağı sarılır
    const canBekle = { x: ASKI.buyuk + (dar ? 24 : 30), y: ZEMIN - 7 };
    otur(CAN, false);
    CAN.katman = 11;
    void CAN.git(X(CAN_BANK.x), Y(ZEMIN), 300, false).then(() => CAN.git(X(canBekle.x), Y(canBekle.y), 1400));
    S.hop(0.7);
    kn.otur = false;
    kn.yukSol = kn.yukSag = 150;
    KN.el.classList.add('sl-bas-asagi');
    KN.el.style.setProperty('--y', String(binYer(-3).y));
    await KN.gov.animate([{ rotate: '0deg' }, { rotate: '180deg' }], { duration: sure(500), easing: 'cubic-bezier(0.4, 0, 0.3, 1.3)' }).finished.catch(() => undefined);
    KN.gov.style.rotate = '180deg';
    BUYUK.s.genlikYap(0.34);
    await (dar ? cekB(-86, 16, ZEMIN - 10, BAR_Y + 6, 2.2, 900) : cekSalincak(900, 2.2));
    await kSoyle(KN_.bir_daha);
    CAN.uzgun(0.9);
    await bekle(400);
    await mSoyle(M.inmiyor);
    await sesliGorev(() => susGorevi());
    // salıncak durdu; Kino'nun kulakları bir süre daha kendi kendine sallanır
    BUYUK.s.durdur();
    kn.kulakSal = 16;
    const kulakDur = tik((dt) => {
      kn.kulakSal = Math.max(0, kn.kulakSal - dt * 5);
    });
    await bekle(1800);
    kulakDur();
    kn.kulakSal = 0;
    // Kino döner, iner, bekleme çizgisinin arkasına geçer; Can biner
    await KN.gov.animate([{ rotate: '180deg' }, { rotate: '360deg' }], { duration: sure(420), easing: 'ease-in-out' }).finished.catch(() => undefined);
    KN.gov.style.rotate = '';
    KN.el.classList.remove('sl-bas-asagi');
    kn.yukSol = kn.yukSag = 0;
    await in_(KN, BEKLE.x, BEKLE.y, 13);
    KN.katman = 13;
    KN.kinoIfade('uzgun');
    kn.kulak = -6;
    await bin(CAN, BUYUK, CAN.kalcaOran * CAN_W - 0.3);
    CAN.uzgun(0);
    CAN.ifade('mutlu', 1500);
    BUYUK.s.genlikYap(0.14);
    await cekB(ASKI.buyuk - 26, ASKI.buyuk + 26, ZEMIN - 12, BAR_Y + 4, 2.4, 800);
    await kSoyle(KN_.zor);
    await mSoyle(M.bekleyen);
    KN.kinoIfade(null);
    kn.kulak = 0;
    ui.ilerleme(3, 7);
  }

  /** Sus: salıncak yavaşlayıp dursun (mikrofon: SessizlikSayaci; parmak: salıncağa basılı tut). Ses çıkınca itilir. */
  function susGorevi(): Promise<void> {
    durumYaz('sus');
    ui.ipucu(mik() ? I.sus : I.sus_dokun);
    return gorev<void>((coz) => {
      let yanlis = 0;
      let sessiz = false;
      let tutuyor = false;
      let sonSevinc = 0;
      const ip = ipucu(kutu(BUYUK.alan));
      const ss = new SessizlikSayaci(kulak.ayar);
      const sesGeldi = () => {
        // ses çıktı: salıncak yeniden itilir, Kino sevinir, Mino gözlerini devirir
        yanlis++;
        ip.yanlis();
        if (kabulMu(yanlis)) return;
        BUYUK.s.it(SES_ITISI);
        S.hop(0.6);
        KN.kinoOynat('coskulu', 700);
        void MN.mino?.ifade('kararsiz', 1400);
        if (performance.now() - sonSevinc > 5000) {
          sonSevinc = performance.now();
          void kSoyle(KN_.yasasin).catch(() => undefined);
        } else void balon(KN, B.yasasin, 900);
      };
      kulak.dinle((o: Ozellik) => {
        const r = ss.kare(o);
        sessiz = r.gecen > 0.05;
        if (r.bozuldu) sesGeldi();
      });
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        tutuyor = true;
        BUYUK.alan.classList.add('tutuluyor');
      };
      const birak = () => {
        tutuyor = false;
        BUYUK.alan.classList.remove('tutuluyor');
      };
      BUYUK.alan.addEventListener('pointerdown', bas);
      addEventListener('pointerup', birak);
      addEventListener('pointercancel', birak);
      const sk = BUYUK;
      const kapat = tik(() => {
        const yavasliyor = tutuyor || (mik() && sessiz) || (mik() && kabulMu(yanlis));
        sk.surt = tutuyor ? TUT_SURTUNME : yavasliyor ? SUS_SURTUNME : 1;
        // kimse susturmazsa Kino ayaklarıyla güç verir (salıncak sallanmaya devam eder)
        if (!yavasliyor && BUYUK.s.genlik < 0.34) BUYUK.s.it(0.004);
        if (BUYUK.s.genlik < DURMA_GENLIK) coz();
      });
      return () => {
        kapat();
        sk.surt = 1;
        kulak.dinle(null);
        bitir(ip);
        BUYUK.alan.classList.remove('tutuluyor');
        BUYUK.alan.removeEventListener('pointerdown', bas);
        removeEventListener('pointerup', birak);
        removeEventListener('pointercancel', birak);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  // ================================================================ 4: Beklerken kaydırak
  async function sahne4() {
    // Can sallanıyor (kendi kendine hafif), Kino çizgide hoplayıp duruyor
    const canPompa = tik(() => {
      if (BUYUK.s.genlik < 0.16) BUYUK.s.it(0.003);
    });
    KN.kinoOynat('coskulu', 1200);
    await bekle(600);
    await mSoyle(M.kaydirak);
    // Mino kum havuzunun yanına geçer (kum ona sıçrayacak)
    const minoKum = { x: KUM_YER.x - 36, y: ZEMIN - 8 };
    void MN.git(X(minoKum.x), Y(minoKum.y), 1500, 0, undefined, true);
    for (let k = 0; k < ayar.kayis; k++) {
      await kaydiraktanKay(k);
    }
    canPompa();
    await cekSalincak(1000);
    await mSoyle(M.can_bitti);
    ui.ilerleme(4, 7);
  }

  /** Kino merdivene koşar, tırmanır, tepede oturur; çocuğun uzun sesiyle (ya da parmakla) kayar, kuma gömülür */
  async function kaydiraktanKay(sira: number) {
    const alt = merdivenB(0);
    const kamKay = () => (dar ? cekB(KAYDIRAK_SOL + 2, KUM_YER.x + 22, ZEMIN - 10, KAYDIRAK_Y + 54, 2.2, 1000) : cekB(KAYDIRAK_SOL - 30, KUM_YER.x + 28, ZEMIN - 12, KAYDIRAK_Y + 58, 2, 1000));
    void kamKay();
    await kinoKos(alt.u - 4, ZEMIN - 1, sira ? 900 : 1500);
    // merdiven: yan görünüşle basamak basamak tırmanır
    KN.katman = 6;
    kinoYan.yon = 1;
    kinoBeden('yan');
    kinoYan.yuru(2.2);
    const ust = merdivenB(1);
    await KN.git(X(ust.u - 3), Y(ust.v - 2), sira ? 900 : 1300, 0, 'linear');
    kinoYan.dur();
    // tepede oturur (önden), kollar havada
    const bas = kaymaB(0);
    await KN.git(X(bas.u), Y(bas.v - KINO_OTURMA + 0.5), 360, 6);
    kinoBeden('on');
    kn.otur = true;
    kn.yukSol = kn.yukSag = 150;
    KN.katman = 7;
    KN.kinoIfade('heyecan');
    await bekle(300);
    await sesliGorev(() => kaymaGorevi());
    // uçup kuma gömülür
    const son = kaymaB(1);
    kn.yukSol = kn.yukSag = 160;
    S.vizz(0.3);
    await KN.git(X(KUM_YER.x), Y(KUM_YER.y + 6), 460, 10, 'linear');
    KN.el.classList.add('sl-gizli');
    S.puf();
    const yigin = koy(h('div.sl-yigin', { 'data-el': 'yigin', html: kumYiginSvg() }), KUM_YER.x, KUM_YER.y + 5.5, 26, 8);
    kumSac(KUM_YER.x, KUM_YER.y + 10, 14);
    void balonGoster(balonKatman, yigin.getBoundingClientRect(), B.puf, 900, 0.2);
    void son;
    await bekle(1300);
    // kumdan fırlar, silkelenir: kum Mino'ya sıçrar
    yigin.classList.add('gidiyor');
    setTimeout(() => yigin.remove(), sure(400));
    KN.el.classList.remove('sl-gizli');
    kn.otur = false;
    kn.yukSol = kn.yukSag = 0;
    KN.katman = 12;
    KN.kinoIfade(null);
    await KN.git(X(KUM_YER.x - 12), Y(ZEMIN - 6), 520, 14);
    S.pat();
    KN.kinoOynat('silkelen', 1100);
    kumSac(KUM_YER.x - 12, ZEMIN + 6, 22, -1);
    await bekle(350);
    MN.tepki('hayir');
    void MN.titre(500);
    void balon(MN, B.iyy, 1100);
    await bekle(700);
    await kSoyle(KN_.on_oldu);
    await bekle(300);
  }

  /** Uzun ses: ses sürdükçe kayar, kesilince durur ("Hı?"); parmak: Kino'yu kaydırak boyunca aşağı sürükle */
  function kaymaGorevi(): Promise<void> {
    durumYaz('kay');
    ui.ipucu(mik() ? I.kay : I.kay_dokun);
    const sonIsaret = dunya.querySelector<HTMLElement>('[data-el="kaydirak-son"]')!;
    return gorev<void>((coz) => {
      let ilerleme = 0;
      let ses = false;
      let sessizlik = 0;
      let hiDedi = false;
      let vizZaman = 0;
      const ip = ipucu(kutu(KN.kap), kutu(sonIsaret), KAYMA_IPUCU * 1000);
      const yerlestir = () => {
        const p = kaymaB(ilerleme);
        KN.el.style.setProperty('--x', String(X(p.u)));
        KN.el.style.setProperty('--y', String(Y(p.v - KINO_OTURMA + 0.5)));
        KN.gov.style.rotate = `${(p.aci * 0.35).toFixed(1)}deg`;
      };
      kulak.dinle((o) => {
        ses = sesVar(o, kulak.ayar);
      });
      // parmak: Kino'yu tut, kaydırak boyunca çek (ilerleme parmağın yola en yakın noktası)
      let tutuyor = false;
      const yolEkranda = (n = 24) =>
        Array.from({ length: n + 1 }, (_, i) => {
          const p = kaymaB(i / n);
          const r = dunya.getBoundingClientRect();
          return [r.left + (X(p.u) / 100) * r.width, r.top + (1 - Y(p.v) / 100) * r.height, i / n] as const;
        });
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        tutuyor = true;
        try {
          KN.kap.setPointerCapture(e.pointerId);
        } catch {
          /* test */
        }
      };
      const hareket = (e: PointerEvent) => {
        if (!tutuyor) return;
        let en = Infinity;
        let t = ilerleme;
        for (const [x, y, u] of yolEkranda()) {
          const d = Math.hypot(e.clientX - x, e.clientY - y);
          if (d < en) {
            en = d;
            t = u;
          }
        }
        const once = ilerleme;
        ilerleme = surukleIlerle(ilerleme, t);
        if (ilerleme > once) {
          ip.ilerle();
          vizZaman += ilerleme - once;
          if (vizZaman > 0.15) {
            vizZaman = 0;
            S.vizz(0.25);
          }
        }
      };
      const birak = () => (tutuyor = false);
      KN.kap.addEventListener('pointerdown', bas);
      addEventListener('pointermove', hareket);
      addEventListener('pointerup', birak);
      addEventListener('pointercancel', birak);
      const kapat = tik((dt) => {
        if (mik()) {
          const once = ilerleme;
          ilerleme = kaydirakIlerle(ilerleme, dt, ses);
          if (ses) {
            sessizlik = 0;
            hiDedi = false;
            ip.ilerle();
          } else if (ilerleme > 0.02 && ilerleme < 1) {
            sessizlik += dt;
            // ortada fren: "Hı?"
            if (!hiDedi && sessizlik > 0.4) {
              hiDedi = true;
              void balon(KN, B.hi, 800);
            }
          }
          if (ilerleme > once) KN.kinoIfade('heyecan');
        }
        yerlestir();
        if (ilerleme >= 1) coz();
      });
      return () => {
        kapat();
        kulak.dinle(null);
        bitir(ip);
        KN.gov.style.rotate = '';
        KN.kap.removeEventListener('pointerdown', bas);
        removeEventListener('pointermove', hareket);
        removeEventListener('pointerup', birak);
        removeEventListener('pointercancel', birak);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  /** Kum taneleri saçılır (yon: -1 sola) */
  function kumSac(u: number, v: number, adet = 14, yon = 0) {
    const r = dunya.getBoundingClientRect();
    const sr = sahne.el.getBoundingClientRect();
    const x = r.left + (X(u) / 100) * r.width - sr.left;
    const y = r.top + (1 - Y(v) / 100) * r.height - sr.top;
    for (let i = 0; i < adet; i++) {
      const t = h('i.sl-kum-tane', { style: `left:${x}px;top:${y}px` });
      sahne.on.append(t);
      const a = (yon ? (yon < 0 ? Math.PI : 0) : -Math.PI / 2) + (Math.random() - 0.5) * (yon ? 1.4 : 2.4);
      const g = (40 + Math.random() * 70) * kamZ;
      void t
        .animate(
          [
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(a) * g}px, ${Math.sin(a) * g - 30}px) scale(0.9)`, opacity: 1, offset: 0.55 },
            { transform: `translate(${Math.cos(a) * g * 1.3}px, ${Math.sin(a) * g + 40}px) scale(0.6)`, opacity: 0 },
          ],
          { duration: sure(700 + Math.random() * 300), easing: 'cubic-bezier(0.3, 0.6, 0.6, 1)' },
        )
        .finished.catch(() => undefined)
        .then(() => t.remove());
    }
  }

  // ================================================================ 5: Nazlı Mino
  async function sahne5() {
    // Can iner, banka döner; Mino biner, fularını düzeltir
    const fren = BUYUK;
    fren.surt = 6;
    await bekle(900);
    BUYUK.s.durdur();
    fren.surt = 1;
    await in_(CAN, ASKI.buyuk + 30, ZEMIN - 6, 11);
    CAN.selam(900);
    void CAN.git(X(CAN_BANK.x), Y(ZEMIN), 1400).then(() => {
      CAN.otur(true);
      return CAN.git(X(CAN_BANK.x), Y(BANK_OTURAK - CAN.kalcaOran * CAN_W + 0.4), 300, false);
    }).then(() => (CAN.katman = 8));
    // Kino bekleme çizgisinin arkasında
    void kinoKos(BEKLE.x + 34, BEKLE.y, 1400).then(() => (KN.katman = 13));
    await MN.git(X(ASKI.buyuk - 8), Y(ZEMIN - 1), 1500, 0, undefined, true);
    MN.katman = 2;
    await bin(MN, BUYUK, MINO_OTURMA);
    await cekB(ASKI.buyuk - 24, BEKLE.x + 34 + 12, ZEMIN - 12, BAR_Y + 4, 2.4, 900);
    MN.tepki('duzelt');
    await bekle(600);
    await mSoyle(M.yavas);
    await sesliGorev(() => yavasGorevi());
    MN.tepki('mir', 1.6);
    S.mirr();
    await mSoyle(SL.mirr);
    void balon(MN, B.cok_guzel, 1300);
    await bekle(900);
    ui.ilerleme(5, 7);
  }

  /** Mino'yu yumuşak itmek: kısık ses (ya da hafif dokunuş) sallar; yüksek ses fırlatır (tüyler kabarır, fular uçar) */
  function yavasGorevi(): Promise<void> {
    const hedef = ayar.yumusakItis;
    durumYaz('yavas', hedef);
    ui.ipucu(mik() ? I.yavas : I.yavas_dokun);
    const sk = BUYUK;
    return gorev<void>((coz) => {
      let n = 0;
      let yanlis = 0;
      let mesgul = false;
      const ip = ipucu(kutu(BUYUK.alan));
      const it = async (tur: Itis) => {
        if (mesgul) return;
        if (tur === 'sert' && kabulMu(yanlis)) tur = 'yumusak';
        mesgul = true;
        if (tur === 'yumusak') {
          n++;
          ip.ilerle();
          BUYUK.s.genlikYap(Math.max(BUYUK.s.genlik, YUMUSAK_GENLIK));
          S.hop(0.2);
          MN.tepki('mir', 1.2);
          S.mirr();
          sahne.el.dataset.slHedef = String(hedef - n);
          if (n >= hedef) {
            setTimeout(coz, sure(900));
            return;
          }
          await bekle(700).catch(() => undefined);
          mesgul = false;
          return;
        }
        // sert: salıncak fırlar, Mino pofuduk, fuları Kino'nun kafasına uçar
        yanlis++;
        ip.yanlis();
        BUYUK.s.genlikYap(SERT_GENLIK);
        S.hop(1);
        S.pof();
        MN.pofuduk(1);
        MN.mino!.ifade('saskin', 1600);
        await fularUcur().catch(() => undefined);
        await mSoyle(M.yumusak).catch(() => undefined);
        // salıncak durulur, tüyler iner, fular döner
        sk.surt = 5;
        await bekle(1200).catch(() => undefined);
        sk.surt = 1;
        BUYUK.s.durdur();
        MN.pofuduk(0);
        await fularGeri().catch(() => undefined);
        mesgul = false;
      };
      const sv = new SesSeviyesi(kulak.ayar);
      let bagirma = 0;
      sv.onSoyleyis = (x) => {
        const r = minoItisi(x.sonuc, bagirma, ayar.darBant);
        bagirma = 0;
        void it(r);
      };
      kulak.dinle((o) => {
        sv.kare(o);
        if (seviye(o, kulak.ayar) === 'bagirma') bagirma += kulak.ayar.kare;
      });
      // parmak: kısa hafif kaydırma / dokunuş yumuşak, uzun hızlı kaydırma sert
      let bas: { x: number; y: number; t: number } | null = null;
      const basla = (e: PointerEvent) => {
        e.stopPropagation();
        bas = { x: e.clientX, y: e.clientY, t: performance.now() };
      };
      const birak = (e: PointerEvent) => {
        if (!bas) return;
        const w = Math.max(1, BUYUK.alan.getBoundingClientRect().width);
        const yol = Math.hypot(e.clientX - bas.x, e.clientY - bas.y) / w;
        const s = (performance.now() - bas.t) / 1000;
        bas = null;
        void it(parmakItisi(yol, s));
      };
      BUYUK.alan.addEventListener('pointerdown', basla);
      addEventListener('pointerup', birak);
      return () => {
        kulak.dinle(null);
        bitir(ip);
        BUYUK.alan.removeEventListener('pointerdown', basla);
        removeEventListener('pointerup', birak);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  /** Mino'nun fuları uçar, Kino'nun kafasına konar; Kino poz verir: "Ben Mino'yum!" */
  async function fularUcur() {
    const [fx, fy] = MN.fularEkran();
    MN.fular(false);
    S.firr();
    const sr = sahne.el.getBoundingClientRect();
    const w = MN.kap.getBoundingClientRect().width * 0.42;
    fularEl = h('div.sl-fular', { html: fularSvg('kirmizi'), style: `left:${fx - sr.left}px;top:${fy - sr.top}px;width:${w}px` });
    sahne.el.append(fularEl);
    const k = KN.kap.getBoundingClientRect();
    const hx = k.left + k.width * 0.5 - sr.left;
    const hy = k.top + k.height * 0.08 - sr.top;
    const dx = hx - (fx - sr.left);
    const dy = hy - (fy - sr.top);
    await fularEl
      .animate(
        [
          { transform: 'translate(-50%, -50%) rotate(0deg)' },
          { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 120}px)) rotate(260deg)`, offset: 0.5 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(350deg)` },
        ],
        { duration: sure(900), easing: 'cubic-bezier(0.3, 0, 0.4, 1)', fill: 'forwards' },
      )
      .finished.catch(() => undefined);
    fularEl.remove();
    fularEl = null;
    // Kino'nun kafasında (kafa katmanında: kafayla döner)
    KN.ekle('kafa', 'sl-kino-fular', `<g transform="translate(700 70) rotate(-8 200 150) scale(3)">${fularSvg('kirmizi').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>`);
    S.pat();
    KN.kinoOynat('sevin', 1200);
    KN.kinoIfade('heyecan', 1600);
    void balon(KN, B.ben_mino, 1600);
    MN.gozSik(true);
    await bekle(1500);
    MN.gozSik(false);
  }
  async function fularGeri() {
    KN.kap.querySelectorAll('.sl-kino-fular').forEach((e) => e.remove());
    S.firr();
    await bekle(300);
    MN.fular(true);
    MN.tepki('duzelt');
  }

  // ================================================================ 6: Ege'nin sırası
  async function sahne6() {
    // Mino iner; anne Ege'yi kucaklayıp kalkar
    await in_(MN, ASKI.buyuk - 40, ZEMIN - 5, 12);
    MN.katman = 12;
    ANNE.poz('ayakta');
    ANNE.el.style.setProperty('--y', String(Y(ZEMIN)));
    ANNE.el.style.setProperty('--x', String(X(ANNE_YER.x)));
    ANNE.katman = 10;
    const anneYol = ANNE.git(X(ASKI.bebek + 20), Y(ZEMIN - 1), 2600);
    // bu arada Kino bebek oturağına kendisi girer, sıkışır
    // (dikeyde bebek salıncağı ve sağ A ayağı: anne ayağın önünde, ayak kesik kalmasın; telefonda büyük oturak tam dışarıda, tablette tam içeride)
    void (dar ? cekB(-10.5, 85.5, ZEMIN - 12, BAR_Y + 4, 2.4, 1000) : dikey ? cekB(-40, 86, ZEMIN - 12, BAR_Y + 4, 2.4, 1000) : cekB(ASKI.buyuk - 10, ASKI.bebek + 36, ZEMIN - 12, BAR_Y + 4, 2.4, 1000));
    await kinoKos(ASKI.bebek - 12, ZEMIN - 2, 1100);
    KN.katman = 2;
    KN.el.classList.add('sl-sikisik');
    await bin(KN, BEBEK, 5.2);
    kn.otur = true;
    kn.yukSol = kn.yukSag = 0;
    BEBEK.s.genlikYap(0.05);
    void KN.titre(600);
    void balon(KN, B.yardim, 1500);
    await anneYol;
    ANNE.katman = 10;
    await mSoyle(M.sikisti);
    await cekGorevi();
    // "Pop!": Kino fırlar, takla atıp yere düşer
    S.pop();
    void balonGoster(balonKatman, KN.kap.getBoundingClientRect(), B.pop, 900, 0.1);
    KN.el.classList.remove('sl-sikisik');
    otur(KN, false);
    KN.gov.style.translate = '';
    await atla(KN.el, dunya, X(ASKI.bebek - 22), Y(ZEMIN - 4), 800, 90, 13);
    void KN.gov.animate([{ rotate: '0deg' }, { rotate: '-360deg' }], { duration: sure(700), easing: 'ease-out' });
    KN.el.classList.remove('sl-binen');
    hedefY.set(KN, Y(ZEMIN - 4));
    KN.koy(X(ASKI.bebek - 22), Y(ZEMIN - 4));
    S.pat();
    KN.kinoIfade('saskin', 1200);
    await bekle(600);
    // anne Ege'yi oturtur
    void ANNE.balon(B.hadi, 1500);
    egeKap.classList.remove('kucakta');
    egeKap.classList.add('mc-oge');
    Object.assign(egeKap.style, {});
    egeKap.style.setProperty('--w', String(EGE_W));
    await atla(egeKap, BEBEK.binici, 50, (-EGE_OTURMA / BINICI.h) * 100, 600, 30, 1);
    egeKap.classList.add('sl-binen');
    EGE.ifade('bakiyor');
    S.pat();
    await bekle(400);
    await mSoyle(M.ege);
    await sesliGorev(() => fisiltiGorevi());
    EGE.ifade('kahkaha', 1800);
    EGE.oynat('kahkaha', 1400);
    egeKikir(0.9);
    void ANNE.sevin();
    void balon(ANNE, B.cok_guzel, 1300);
    await bekle(1500);
    ui.ilerleme(6, 7);
  }

  /** Sıkışan Kino'yu yukarı çek (sürükleme); çekildikçe Kino uzar, yeterince çekilince "Pop!" */
  function cekGorevi(): Promise<void> {
    durumYaz('cek');
    ui.ipucu(I.cek);
    return gorev<void>((coz) => {
      const ip = ipucu(kutu(KN.kap), () => {
        const r = KN.kap.getBoundingClientRect();
        return new DOMRect(r.left + r.width / 2, r.top - r.height * 0.8, 1, 1);
      });
      let bas: number | null = null;
      const esik = () => KN.kap.getBoundingClientRect().height * 0.55;
      const dokun = (e: PointerEvent) => {
        e.stopPropagation();
        bas = e.clientY;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          /* test */
        }
      };
      const hareket = (e: PointerEvent) => {
        if (bas === null) return;
        const d = Math.max(0, bas - e.clientY);
        const o = Math.min(1, d / esik());
        // çekildikçe uzar
        KN.gov.style.scale = `${(1 - o * 0.12).toFixed(3)} ${(1 + o * 0.28).toFixed(3)}`;
        if (o >= 1) {
          bas = null;
          ip.ilerle();
          coz();
        }
      };
      const birak = () => {
        if (bas === null) return;
        bas = null;
        KN.gov.animate([{ scale: KN.gov.style.scale || '1 1' }, { scale: '1 1' }], { duration: sure(300), easing: 'cubic-bezier(0.3, 1.6, 0.5, 1)' });
        KN.gov.style.scale = '';
        ip.yanlis();
        void KN.titre(300);
      };
      const hedefler = [BEBEK.alan, KN.kap];
      for (const el of hedefler) {
        el.addEventListener('pointerdown', dokun);
        el.addEventListener('pointermove', hareket);
        el.addEventListener('pointerup', birak);
        el.addEventListener('pointercancel', birak);
      }
      return () => {
        bitir(ip);
        KN.gov.style.scale = '';
        for (const el of hedefler) {
          el.removeEventListener('pointerdown', dokun);
          el.removeEventListener('pointermove', hareket);
          el.removeEventListener('pointerup', birak);
          el.removeEventListener('pointercancel', birak);
        }
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  /** Ege'yi fısıltıyla (ya da minicik dokunuşla) sallamak; yüksek ses itmez (anne "Şşş, yavaş", Ege "Ooo?") */
  function fisiltiGorevi(): Promise<void> {
    const hedef = ayar.fisiltiItis;
    durumYaz('fisilti', hedef);
    ui.ipucu(mik() ? I.fisilti : I.fisilti_dokun);
    return gorev<void>((coz) => {
      let n = 0;
      let yanlis = 0;
      let mesgul = false;
      const ip = ipucu(kutu(BEBEK.alan));
      const it = async (tur: Itis) => {
        if (mesgul) return;
        if (tur === 'sert' && kabulMu(yanlis)) tur = 'yumusak';
        mesgul = true;
        if (tur === 'yumusak') {
          n++;
          ip.ilerle();
          BEBEK.s.genlikYap(Math.max(BEBEK.s.genlik, 0.1 + n * 0.02));
          S.hop(0.15);
          EGE.ifade('kikir', 1100);
          EGE.oynat('kikir', 900);
          egeKikir(0.5);
          sahne.el.dataset.slHedef = String(hedef - n);
          if (n >= hedef) {
            setTimeout(coz, sure(800));
            return;
          }
          await bekle(600).catch(() => undefined);
          mesgul = false;
          return;
        }
        yanlis++;
        ip.yanlis();
        void ANNE.yavasIsaret();
        void ANNE.balon(B.sss, 1300);
        EGE.ifade('saskin', 1300);
        void balon(egeKap, B.ooo, 1000);
        await bekle(1100).catch(() => undefined);
        mesgul = false;
      };
      const sv = new SesSeviyesi(kulak.ayar);
      sv.onSoyleyis = (x) => void it(egeItisi(x.sonuc));
      kulak.dinle((o) => sv.kare(o));
      let bas: { x: number; y: number; t: number } | null = null;
      const basla = (e: PointerEvent) => {
        e.stopPropagation();
        bas = { x: e.clientX, y: e.clientY, t: performance.now() };
      };
      const birak = (e: PointerEvent) => {
        if (!bas) return;
        const w = Math.max(1, BEBEK.alan.getBoundingClientRect().width);
        const yol = Math.hypot(e.clientX - bas.x, e.clientY - bas.y) / w;
        const s = (performance.now() - bas.t) / 1000;
        bas = null;
        void it(parmakItisi(yol, s));
      };
      BEBEK.alan.addEventListener('pointerdown', basla);
      addEventListener('pointerup', birak);
      return () => {
        kulak.dinle(null);
        bitir(ip);
        BEBEK.alan.removeEventListener('pointerdown', basla);
        removeEventListener('pointerup', birak);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  // ================================================================ 7: İki salıncak birden
  async function sahne7() {
    // Can gelir: "Sen çok güzel bekledin. Bir tur daha senin!"
    otur(CAN, false);
    CAN.katman = 12;
    await CAN.git(X(CAN_BANK.x), Y(ZEMIN), 300, false);
    void cekB(ASKI.buyuk - 46, ASKI.bebek + 14, ZEMIN - 12, BAR_Y + 4, 2.2, 1000);
    await CAN.git(X(-90), Y(ZEMIN - 4), 1500);
    CAN.selam(1200);
    void balon(CAN, B.bekledin, 2600);
    await bekle(2400);
    KN.kinoIfade('heyecan', 2200);
    await kSoyle(KN_.sagol);
    // Kino büyük salıncağa biner
    await kinoKos(ASKI.buyuk + 10, ZEMIN - 1, 700);
    await bin(KN, BUYUK, KINO_OTURMA);
    await cekB(ASKI.buyuk - 40, ASKI.bebek + 26, ZEMIN - 12, BAR_Y + 6, 2.2, 900);
    await mSoyle(M.iki);
    await sesliGorev(() => tekerleme());
    // final: herkes el sallar, Ada zıplar, anne gülümser
    await (dar ? cekB(-100, ASKI.bebek + 22, ZEMIN - 14, BAR_Y + 10, 1.8, 1200) : cekB(-165, ASKI.bebek + 34, ZEMIN - 12, BAR_Y + 14, 1.4, 1200));
    canHep((c) => c.sevin(1400));
    ADA.sevin(1600);
    void ADA.zipla(22, 700).then(() => ADA.zipla(18, 600));
    void ANNE.sevin();
    MN.tepki('zipla');
    KN.kinoOynat('sevin', 1200);
    konfeti(BUYUK.binek, 50);
    S.yildiz(2);
    await bekle(900);
    ui.ilerleme(7, 7);
    await mSoyle(M.ogut);
    odulKarti();
    await bekle(2600);
    // bitiş düğmeleri altta çıkar: sahne yukarı kalksın, yüzler açık kalsın
    void (dar ? cekB(-100, ASKI.bebek + 22, ZEMIN - 60, BAR_Y + 6, 1.8, 900) : cekB(-165, ASKI.bebek + 34, ZEMIN - 42, BAR_Y + 10, 1.4, 900));
  }

  /**
   * Tekerleme (Gemini kaydı; oyun kayda uyar): önce sözlü şarkı dinlenir (salıncaklar vuruşlarda itilir, sözler ekranda);
   * sonra her dize çalar ve bitince çocuk vurgulu iki vuruşu alkışlar (ya da salıncaklara dokunur): her alkış iki salıncağı
   * birlikte iter. Kayıt çalarken mikrofon dinlemez.
   */
  async function tekerleme() {
    const kayit = S.tekerlemeKaydi();
    const tablo = kayit ? sarkiTablosu(kayit.kayit) : null;
    const turlarKayit = tablo ? ritimTurlari(tablo, ayar.dize) : [];
    const calar = kayit && turlarKayit.length ? new S.TekerlemeCalar(kayit.sozlu, kayit.sozsuz) : null;
    iptaller.push(() => calar?.kapat());
    const YEDEK = 1170;
    const TURLAR: RitimTur[] = turlarKayit.length
      ? turlarKayit
      : Array.from({ length: ayar.dize }, (_, i) => ({ basMs: i * 2100, bitMs: i * 2100 + 2100, vuruslar: [i * 2100 + 300, i * 2100 + 300 + YEDEK], ara: YEDEK }));
    const ikisiniIt = (guc = 0.09) => {
      BUYUK.s.it(guc);
      BEBEK.s.it(guc * 0.6);
      KN.kinoOynat('coskulu', 400);
      EGE.ifade('kikir', 700);
    };
    const toplam = TURLAR.length * 2;
    // 1) dinle: sözlü şarkı (sarki-kayit.ts → KayitCalar), vuruşlarda salıncaklar itilir
    durumYaz('dinle');
    ui.ipucu(I.dinle);
    if (kayit && tablo && !TEST_MODU) {
      let satir = -1;
      const k = new KayitCalar({
        url: kayit.sozlu,
        tablo,
        sustur: (ms) => kulak.sustur(ms),
        onHece: (i) => {
          const s = tablo.heceler[i].satir;
          if (s !== satir) {
            satir = s;
            ui.yazi(SL.sarki[s] ?? '');
          }
        },
        onVurus: (i) => {
          if (i % 2 === 0) ikisiniIt(0.06);
        },
      });
      iptaller.push(() => k.durdur());
      await k.cal();
    } else {
      for (const s of SL.sarki) {
        ui.yazi(s);
        ikisiniIt(0.06);
        await bekle(500);
      }
    }
    ui.ipucu(null);
    // 2) dize dize: dize çalar, çocuk alkışlar
    let yapilan = 0;
    for (const [ti, t] of TURLAR.entries()) {
      for (let deneme = 0; ; deneme++) {
        durumYaz('dinle', ti);
        ui.yazi(SL.sarki[ti] ?? '');
        await gorev<void>((coz) => {
          const zaman = t.vuruslar.map((ms) => setTimeout(() => ikisiniIt(0.05), sure(ms - t.basMs)));
          if (calar && !TEST_MODU) void calar.cal('sozlu', t.basMs, t.bitMs).then(() => coz());
          else {
            kulak.sustur(t.bitMs - t.basMs + 350);
            t.vuruslar.forEach((ms, i) => zaman.push(setTimeout(() => S.nota(67 + i * 5), sure(ms - t.basMs))));
            zaman.push(setTimeout(coz, sure(t.bitMs - t.basMs)));
          }
          return () => {
            zaman.forEach(clearTimeout);
            calar?.durdur();
          };
        });
        const zamanlar = await alkisBekle(t.vuruslar.length, ti);
        const sonuc = yankiSonuc(zamanlar, t.vuruslar.length, t.ara, !kucukMu(yas) && !TEST_MODU);
        if (sonuc === 'dogru' || kabulMu(deneme)) break;
        KN.kinoOynat('bak', 900, 1);
        void balon(KN, B.hi, 900);
        await bekle(900);
      }
      yapilan += 2;
      S.yildiz(ti);
      ui.ilerleme(yapilan, toplam);
      await bekle(500);
    }
    ui.ilerleme(0, 0);
    // 3) hep birlikte: sözlü kaydın tamamı (son iki dize), salıncaklar vuruşlarda
    konfeti(BEBEK.binek, 30);
    if (kayit && tablo && calar && !TEST_MODU) {
      const bas = TURLAR[Math.max(0, TURLAR.length - 2)].basMs;
      ui.yazi(SL.sarki.slice(-2).join(' '));
      await gorev<void>((coz) => {
        const zaman = tablo.vuruslar.filter((v) => v >= bas).map((v) => setTimeout(() => ikisiniIt(0.05), v - bas));
        void calar.cal('sozlu', bas, (kayit.kayit.sure_ms ?? tablo.sonMs + 600)).then(() => coz());
        return () => {
          zaman.forEach(clearTimeout);
          calar.durdur();
        };
      });
    } else [72, 76, 79, 84].forEach((m, i) => setTimeout(() => S.nota(m), sure(i * 120)));
    calar?.kapat();
    durumYaz(null);
  }

  /** Alkış (mikrofon) ya da salıncaklara dokunma: seri bitince (1.4 sn sessizlik) alkış zamanları (ms) döner */
  function alkisBekle(n: number, tur: number): Promise<number[]> {
    durumYaz('alkis', `${n}/${tur}`);
    ui.ipucu(mik() ? I.alkis : I.alkis_dokun);
    return gorev<number[]>((coz) => {
      const a = new Alkis(kulak.ayar);
      const ip = ipucu(kutu(BUYUK.alan));
      a.onAlkis = () => {
        ip.ilerle();
        BUYUK.s.it(0.1);
        BEBEK.s.it(0.06);
        KN.kinoOynat('coskulu', 400);
        EGE.ifade('kikir', 700);
        EGE.oynat('kikir', 500);
        S.nota(67 + (a.sayi % 4) * 2, 0.08);
      };
      a.onSeri = (z) => coz(z.map((s) => s * 1000));
      const bas = (e: PointerEvent) => {
        e.stopPropagation();
        S.sak();
        a.dokun();
      };
      for (const el of [BUYUK.alan, BEBEK.alan]) el.addEventListener('pointerdown', bas);
      kulak.dinle((o) => a.kare(o));
      const kapat = tik(() => a.tik());
      return () => {
        kapat();
        kulak.dinle(null);
        bitir(ip);
        for (const el of [BUYUK.alan, BEBEK.alan]) el.removeEventListener('pointerdown', bas);
        ui.ipucu(null);
        durumYaz(null);
      };
    });
  }

  function odulKarti() {
    const kino = ISKELET['../../assets/karakter-iskelet/kino.svg'] ?? '';
    const ege = ISKELET['../../assets/karakter-iskelet/ege.svg'] ?? '';
    const kart = h(
      'div.sl-odul',
      { 'data-el': 'odul' },
      h(
        'div.sl-odul-resim',
        { style: `background-image:url("${park('arka-uzak')}")` },
        h('div.sl-odul-salincak', { html: kartSalincak() }),
        kino ? h('img.sl-odul-kino', { src: kino, alt: '' }) : null,
        ege ? h('img.sl-odul-ege', { src: ege, alt: '' }) : null,
      ),
      h('b', {}, SL.kart),
    );
    sahne.el.append(kart);
    void kart.offsetWidth;
    kart.classList.add('acik');
    S.yildiz(3);
    const [kx, ky] = merkezi(kart.getBoundingClientRect());
    konfetiPatlat(kok, kx, ky, 50);
    setTimeout(() => kart.classList.add('gidiyor'), sure(2400));
  }
  function kartSalincak() {
    return cerceveSvg();
  }

  void bank;
  void kaydirakArka;
  void kaydirakOn;
  void kumOn;
  void yatayTel;
}
