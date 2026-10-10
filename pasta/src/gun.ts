/**
 * Mino ile Kino'nun Pasta Otobüsü: bir gün (tek ekran). Üstte pencere (sırada en çok 2 müşteri; yanlarında resimli sipariş
 * balonu), altta tezgâh: HAMUR + tepsi, KALIPLAR, FIRIN (3 göz, hepsi açık), KREMA, SÜSLER (Gün 2+), SERVİS TABAĞI.
 *
 * Akış (hiç bekleme yok, işler paralel): hamur kabına dokun (her dokunuş bir top, hemen düşer) → kalıba dokun ("pof",
 * hepsi o şekil) → tepsiye dokun ya da tepsiyi fırına sürükle (boş gözlerden birine uçar; beyaz → altın ~5 sn "ding";
 * altın en az 10 sn kalır, sonra yavaşça kızarır; Gün 1'de hiç yanmaz) → fırın pişerken yeni tepsi hazırlanır, tabaktaki
 * süslenir, servis edilir → altın göze dokununca tabağa çıkar (tabak doluysa yanında sıraya girer) → krema (hepsi o
 * renk; Gün 3'te zigzag siparişte kolay bir kaydırma) → süs (her dokunuş bir tane, yerine zıplayarak oturur; yanlış süs
 * ya da fazlası kayar, Kino yakalar) → tabağa dokun (hazırsa siparişin sahibine gider) ya da tabağı müşteriye sürükle.
 * Sıradaki işin yeri hafifçe parlar; 4 sn dokunulmazsa küçük bir el gösterir. Ret yok, ceza yok: farklıysa müşteri yine
 * yer, farklı olan şey balonda bir an parlar. Sabır kalbi dolunca müşteri yalnız uyuklar.
 */
import P from '../../content/pasta.json';
import { efekt, KINO_SESI, konus } from '../../src/audio/ses';
import type { KonusmaSecenegi, Soylenecek } from '../../src/audio/konusma';
import { arkaPlanDinle } from '../../src/kabuk/yon';
import { Karakter } from '../../src/karakter/karakter';
import { Mino } from '../../src/mino/mino';
import { h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { MinoCanli } from '../../pazar/src/mino-canli';
import { geriGonder, surukle } from '../../pazar/src/surukle';
import { boyaFiltresi, HAMUR_KABI, JETON, KALP, KAPAK_DESENI, KASA, KINO_UN, MINO_SAPKA, OKUL, OTOBUS, RAF_SUSLERI, TABAK, TEPSI, kalipSvg, kremaDikSvg, susIkon, susKabiSvg, urunSvg } from './cizim';
import { zigzagCiz } from './susleme';
import { AZ_HAREKET, Efekt, ekranSalla, parkAdres, salla } from './gorsel';
import { ARKA, FIRIN_GOZLERI, FIRIN_ORAN, onYukle, oranYaz, resimleriTopla, yuva } from './resimler';
import { gunBitti as kayitGunBitti, kayit } from './kayit';
import {
  acikOlanlar,
  BOYA,
  EN_COK_HAMUR,
  EN_COK_MUSTERI,
  FIRIN,
  FIRIN_GOZ,
  firinHali,
  GUNLER,
  gunPlani,
  hamurRengi,
  hedefKalem,
  jetonHesapla,
  kalanIs,
  kalemSec,
  okuma,
  pisme,
  siparisSonucu,
  siradakiIndeks,
  susYeri,
  tesekkur,
  yildizHesapla,
  type FirinHali,
  type FirinZaman,
  type Gun,
  type Kalem,
  type Kalip,
  type Parti,
  type Renk,
  type Siparis,
  type Sus,
  type Yer,
} from './model';
import { PastaMusteri, partiCizimi, siparisResmi } from './musteri';
import { ses } from './sesler';
import { KinoIsci } from './kino-is';

const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
/** test ya da gösterim (?onizleme=1): durum ve sipariş verisi ekrana yazılır */
const ozelMi = () => TEST_MODU || (typeof document !== 'undefined' && !!document.body?.dataset.onizleme);
/** Test / gösterim: &firin=altin,yanik (ms) ile fırın zamanı; Gün 1'de fırın hiç yakmaz */
function firinZamani(gun: number): FirinZaman {
  const f = ozelMi() ? q.get('firin') : null;
  let z: FirinZaman = TEST_MODU ? { altin: 700, yanik: 30000 } : FIRIN;
  if (f) {
    const [a, y] = f.split(',').map(Number);
    if (a > 0 && y > a) z = { altin: a, yanik: y };
  }
  return gun === 1 ? { ...z, yanik: Infinity } : z;
}
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, AZ_HAREKET ? Math.min(ms, 250) : sure(ms)));

/** Müşterinin konuşma tonu (anlatıcı kaydı biraz incelir: hayvanlar daha ince) */
const MUSTERI_TON: Record<string, number> = { tavsan: 1.14, ordek: 1.16, ayi: 0.97, can: 1.06, ada: 1.1, elif: 1.1 };
/** Dokunulmazsa el ipucu bu kadar sonra çıkar (ms) */
const IPUCU_MS = 4000;

interface Goz {
  parti: Parti;
  bas: number;
  hal: FirinHali;
  hatirlatildi: boolean;
}
/** Sıradaki iş: hangi istasyon (test ve parlama için ad) */
export type AdimAdi = 'hamur' | 'kalip' | 'tepsi' | 'firin' | 'krema' | 'sus' | 'servis';

/** Mino'ya pastacı şapkası (alındıysa): kafa grubuna eklenir, kafa dönünce o da döner */
export function minoSapkaTak(mino: Mino) {
  if (!kayit.alinan.includes('sapka')) return;
  const k = mino.el.querySelector('svg > .k');
  if (k && !k.querySelector('.ps-mino-sapka')) k.insertAdjacentHTML('beforeend', MINO_SAPKA);
  mino.el.classList.add('ps-sapkali');
}
/** Otobüsün boyası (CSS değişkenleri) */
export function boyaUygula(el: HTMLElement) {
  const b = BOYA[kayit.boya] ?? BOYA.pembe;
  el.style.setProperty('--boya', b.govde);
  el.style.setProperty('--boya-koyu', b.koyu);
  el.style.setProperty('--boya-filtre', boyaFiltresi(kayit.boya));
}
/** Kino: unlu yüzüyle (kafa katmanına un lekeleri) */
export function unluKino(): Karakter {
  const kino = new Karakter('kino', h('div'));
  void kino.hazir.then(() => {
    const kafa = kino.parcaG('kafa');
    if (kafa && !kafa.querySelector('.ps-kino-un')) kafa.insertAdjacentHTML('beforeend', KINO_UN);
  });
  return kino;
}
/**
 * Mekân katmanları (gökyüzü-tepeler, orta, ön): park (okul önünde ortada okul binası), plaj (assets/film/plaj), karlı
 * bahçe (assets/film/kar). Pencereden bu görünür.
 */
export function parkKatmanlari(yer: Yer): HTMLElement[] {
  const mekan = yer === 'plaj' ? 'plaj' : yer === 'kar' ? 'kar' : 'park';
  const arka = (ad: string, sinif: string) => h(`div.${sinif}`, { style: `background-image:url("${parkAdres(ad, mekan)}")` });
  return [arka('arka-uzak', 'ps-gok'), yer === 'okul' ? h('div.ps-orta.ps-okul', { html: OKUL }) : arka('arka-orta', 'ps-orta'), arka('arka-on', 'ps-on')];
}

export function gunEkrani(app: Uygulama, p: { gun?: Gun } = {}): Ekran {
  const gun = (Math.max(1, Math.min(3, p.gun ?? 1)) as Gun);
  const ozel = ozelMi();
  const ayar = GUNLER[gun];
  const acik = acikOlanlar(gun);
  const FZ = firinZamani(gun);
  const sabirSure = ozel && Number(q.get('sabir')) > 0 ? Number(q.get('sabir')) : TEST_MODU ? 10 * 60 * 1000 : ayar.sabir;
  const aralik = TEST_MODU ? 400 : ayar.aralik;
  const kuyruk: Siparis[] = gunPlani(gun, acik);
  const MUSTERI_TOPLAM = kuyruk.length;
  let kapandi = false;
  const zamanlar: number[] = [];
  const sonra = (ms: number, f: () => void) => zamanlar.push(window.setTimeout(() => !kapandi && f(), ms));

  // ---------------------------------------------------------------- konuşma sırası
  let sira: Promise<void> = Promise.resolve();
  let bekleyenSoz = 0;
  const mino = new Mino();
  const kino = unluKino();
  /** Sırayla söyler; kim: 'mino' (anlatıcı, Mino'nun ağzı), 'kino' (Kino sesi), ya da müşteri */
  const soyle = (soz: Soylenecek, kim: 'mino' | 'kino' | PastaMusteri = 'mino', onemli = true): Promise<void> => {
    if (!onemli && bekleyenSoz > 0) return Promise.resolve();
    bekleyenSoz++;
    const is = sira.then(async () => {
      if (kapandi) return;
      const secenek: KonusmaSecenegi = kim === 'kino' ? KINO_SESI : kim === 'mino' ? {} : { ton: MUSTERI_TON[kim.ad] ?? 1.08 };
      mino.agizSus = kim !== 'mino';
      if (kim === 'kino') kino.konus(true);
      else if (kim !== 'mino') kim.konus(true);
      try {
        await konus(soz, secenek);
      } finally {
        mino.agizSus = false;
        if (kim === 'kino') kino.konus(false);
        else if (kim !== 'mino') kim.konus(false);
      }
    });
    sira = is.catch(() => undefined).then(() => {
      bekleyenSoz--;
    });
    return is;
  };

  // ---------------------------------------------------------------- sahne
  const efekt_ = new Efekt(app.kok);
  const yerler = Array.from({ length: EN_COK_MUSTERI }, (_, i) => h('div.ps-yer', { 'data-yer': String(i) }));
  const musteriKatmani = h('div.ps-musteriler', {}, ...yerler);
  const jetonKatmani = h('div.ps-jetonlar');
  mino.el.addEventListener('pointerdown', () => {
    mino.tepki('gidik');
    const [x, y] = efekt_.merkez(mino.el, 0.5, 0.3);
    efekt_.parilti(x, y, 4, 0.5);
  });
  minoSapkaTak(mino);
  // Mino ve Kino tezgâhın katmanında: yatayda Mino pencerenin solunda, Kino sağdaki rafta; dikeyde ikisi de üst katta
  const minoYer = h('div.ps-mino-yer', {}, mino.el);
  const kinoYer = h('div.ps-kino-yer', { 'data-karakter-kap': 'kino' }, h('div.ps-kino-hareket', {}, kino.el));
  const kinoIs = new KinoIsci(kino, kinoYer);
  kinoYer.addEventListener('pointerdown', () => {
    efekt.dokunma();
    void kino.oynat('sevin', 900);
    if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 900);
    const [x, y] = efekt_.merkez(kino.el, 0.5, 0.3);
    efekt_.kalpler(x, y, 2);
  });
  const duvar = h('div.ps-duvar', { 'aria-hidden': 'true' }, h('i.ps-duvar-raf', { html: RAF_SUSLERI }));
  // Gemini görselleri (assets/pasta): otobüsün içi (pencereli duvar, raflar) müşterilerin önünde, penceresi oyulmuş
  const arkaUrl = yuva('arka');
  const onUrl = yuva('tezgahOn');
  const resimli = !!(arkaUrl && onUrl);
  const arkaResim = resimli ? h('div.ps-arka-resim', { 'aria-hidden': 'true' }) : null;
  // pencerenin görünen açıklığı (yalnız ölçü: balonlar bunun içinde kalır; test de bununla denetler)
  const pencere = h('i.ps-pencere', { 'aria-hidden': 'true' });
  const sahne = h('div.ps-sahne', {}, ...parkKatmanlari(ayar.yer), musteriKatmani, arkaResim, duvar, h('div.ps-cerceve', { 'aria-hidden': 'true' }, h('i.ps-tente'), h('i.ps-flama')), pencere);

  // ---------------------------------------------------------------- tezgâh: hamur ve tepsi
  const tepsi: (Kalip | null)[] = [];
  const tepsiIc = h('div.ps-tepsi-ic');
  const tepsiEl = h('button.ps-tepsi', { type: 'button', 'aria-label': 'Tepsi', html: TEPSI }, tepsiIc);
  const hamurKabi = h('button.ps-hamur-kabi', { type: 'button', 'aria-label': 'Hamur', html: HAMUR_KABI });
  const tepsiCiz = () => {
    tepsiIc.replaceChildren(
      ...tepsi.map((k, i) =>
        h('i.ps-tepsi-parca', {
          'data-kalip': k ?? 'top',
          style: `--i:${i}`,
          html: urunSvg({ urun: 'kurabiye', sekil: k && k !== 'kapkek' ? k : null, hal: k ? 'cig' : 'top', hamur: '#FBF0DC' }),
        }),
      ),
    );
    tepsiIc.dataset.adet = String(tepsi.length);
    tepsiEl.dataset.adet = String(tepsi.length);
    tepsiEl.dataset.hazir = tepsi.length && tepsi.every((k) => k) ? '1' : '0';
  };

  // kalıplar
  const kaliplar: Kalip[] = acik.sekiller.slice();
  const kalipDugmeleri = kaliplar.map((k) => {
    const b = h('button.ps-kalip', { type: 'button', 'data-kalip': k, 'aria-label': k, html: kalipSvg(k) });
    b.addEventListener('click', () => kalipBas(k, b));
    return b;
  });

  // fırın: üç göz, hepsi açık (paralel pişer)
  const gozler: (Goz | null)[] = Array.from({ length: FIRIN_GOZ }, () => null);
  const firinUrl = yuva('firin');
  const yuzde = (v: number) => `${(v * 100).toFixed(2)}%`;
  // dik fırın dolabı (firin-dik: önden düz, üst üste 3 göz): her göz kapı paneli kadar bir düğme; camında kurabiyeler,
  // sağındaki düğmenin üstünde pişme saati. Boş göz karanlık, pişen göz ışıklı, altın olan parlar.
  const kutuStil = (k: { x: number; y: number; w: number; h: number }) => `left:${yuzde(k.x)};top:${yuzde(k.y)};width:${yuzde(k.w)};height:${yuzde(k.h)}`;
  const gozEl = Array.from({ length: FIRIN_GOZ }, (_, i) => {
    const g = FIRIN_GOZLERI[i];
    const ic = h('div.ps-goz-ic');
    // cam ve saat: kapı panelinin içinde, görseldeki yerinde (panele göre oran)
    const ici = (v: number, a: number, b: number) => (v - a) / b;
    const cam = h(
      'div.ps-goz-cam',
      { style: kutuStil({ x: ici(g.cam.x, g.kapi.x, g.kapi.w), y: ici(g.cam.y, g.kapi.y, g.kapi.h), w: g.cam.w / g.kapi.w, h: g.cam.h / g.kapi.h }) },
      h('i.ps-goz-isik'),
      ic,
      h('i.ps-goz-parlama'),
    );
    const b = h(
      'button.ps-goz',
      { type: 'button', 'data-goz': String(i), 'data-hal': 'bos', 'aria-label': `Fırın ${i + 1}`, style: kutuStil(g.kapi) },
      cam,
      h('i.ps-goz-saat', { style: `left:${yuzde(ici(g.dugme.x, g.kapi.x, g.kapi.w))};top:${yuzde(ici(g.dugme.y, g.kapi.y, g.kapi.h))}` }),
    );
    b.addEventListener('click', () => gozBas(i));
    return { b, ic };
  });
  const firin = h(
    'div.ps-firin-dik',
    { style: `--firin-oran:${FIRIN_ORAN}` },
    firinUrl ? h('img.ps-firin-resim', { src: firinUrl, alt: '', draggable: 'false', 'aria-hidden': 'true' }) : null,
    ...gozEl.map((g) => g.b),
  );

  // krema, süs (süs kavanozları Gün 2'den itibaren)
  const kremaDugmeleri = acik.renkler.map((r) => {
    const b = h('button.ps-krema-sise', { type: 'button', 'data-renk': r, 'aria-label': r, html: kremaDikSvg(r) });
    b.addEventListener('click', () => kremaBas(r, b));
    return b;
  });
  const susDugmeleri = acik.susler.map((s) => {
    const b = h('button.ps-sus-kabi', { type: 'button', 'data-sus': s, 'aria-label': s, html: susKabiSvg(s) });
    b.addEventListener('click', () => susBas(s, b));
    return b;
  });

  // tabak (doluyken fırından çıkanlar yanında sıraya girer)
  let tabak: Parti | null = null;
  const bekleyen: Parti[] = [];
  const tabakIc = h('div.ps-tabak-ic');
  const tabakEl = h('button.ps-tabak', { type: 'button', 'aria-label': 'Servis tabağı', html: TABAK }, tabakIc);
  const bekleyenEl = h('div.ps-bekleyen');
  const tabakCiz = () => {
    tabakIc.replaceChildren(...(tabak ? partiCizimi(tabak, 'ps-tabak-parca').map((s, i) => h('i.ps-tabak-yer', { style: `--i:${i}`, html: s })) : []));
    tabakEl.dataset.dolu = tabak ? '1' : '0';
    tabakEl.dataset.urun = tabak?.urun ?? '';
    tabakIc.dataset.adet = String(tabak?.parcalar.length ?? 0);
    if (ozel) tabakEl.dataset.parti = tabak ? JSON.stringify(tabak) : '';
    bekleyenEl.replaceChildren(...bekleyen.map((b) => h('i.ps-bekleyen-parti', { html: partiCizimi(b, 'ps-mini')[0] ?? '' })));
    bekleyenEl.dataset.n = String(bekleyen.length);
  };

  // ---------------------------------------------------------------- kasa (tezgâhta), gün tahtası
  let bugun = 0;
  let yerdeJeton = 0;
  const kasaSayi = h('b.ps-kasa-sayi', {}, '0');
  const kasa = h('button.ps-kasa', { type: 'button', 'aria-label': 'Kasa', html: KASA }, kasaSayi);

  const istasyon = (ad: string, ...c: (HTMLElement | null)[]) => h(`div.ps-ist.ps-ist-${ad}`, {}, ...c);
  const izgara = (d: HTMLElement[]) => h('div.ps-izgara', { 'data-n': String(d.length) }, ...d);
  /**
   * Tezgâh bir istasyon ızgarası: iki sıra (arka raf ve ön tezgâh), her sıranın tek taban çizgisi. Yatayda soldan
   * sağa HAMUR → KALIP (askıda; tepsi altında) → FIRIN (iki sırayı kaplar) → KREMA (önde; süs kavanozları arkasındaki
   * rafta) → SERVİS (tabak; kasa arkasındaki rafta). Gün 1'de süs kavanozu yok (yalnız gereken istasyonlar).
   */
  const tezgah = h(
    'div.ps-tezgah',
    { 'data-kalip': String(kalipDugmeleri.length), 'data-krema': String(kremaDugmeleri.length), 'data-sus': String(susDugmeleri.length) },
    h('i.ps-kat', { 'aria-hidden': 'true', 'data-kat': '0' }),
    h('i.ps-kat', { 'aria-hidden': 'true', 'data-kat': '1' }),
    h('i.ps-kat', { 'aria-hidden': 'true', 'data-kat': '2' }),
    h('i.ps-tz-panel', { 'aria-hidden': 'true', style: `--kapak:${KAPAK_DESENI}` }),
    minoYer,
    kinoYer,
    istasyon('kalip', h('div.ps-askilik', {}, izgara(kalipDugmeleri))),
    susDugmeleri.length ? istasyon('sus', izgara(susDugmeleri)) : null,
    istasyon('kasa', kasa),
    istasyon('hamur', hamurKabi),
    istasyon('tepsi', tepsiEl),
    istasyon('firin', firin),
    istasyon('krema', h('div.ps-tutacak', {}, izgara(kremaDugmeleri))),
    istasyon('tabak', bekleyenEl, tabakEl),
    jetonKatmani,
  );

  // gün tahtası: her müşteri bir kalp (tam istediği gibiyse dolu kalp, biraz farklıysa açık kalp)
  const kalpUrl = yuva('mutluKalp');
  const hedefKalbi = kalpUrl ? `<img src="${kalpUrl}" alt="" draggable="false">` : KALP;
  const hedefEl = h('div.ps-hedef', { 'aria-label': `${MUSTERI_TOPLAM} müşteri`, 'data-hedef': String(MUSTERI_TOPLAM), 'data-mutlu': '0' }, ...Array.from({ length: MUSTERI_TOPLAM }, () => h('i', { html: hedefKalbi })));
  // gün tahtası: yazı yok, büyük gün numarası ve müşteri kalpleri
  const gunEtiket = h('div.ps-gun-etiket', { 'aria-label': P.arayuz.gun.replace('{gun}', String(gun)) }, h('b.ps-gun-sayi', {}, String(gun)), hedefEl);
  const cikis = () => app.git('acilis');
  const ust = h('div.ust-cubuk.ps-ust', {}, yuvarlakDugme(IKON.geri, 'Geri', cikis, 'kucuk'), h('div.orta', {}, gunEtiket), sesDugmesi());

  // el ipucu: sıradaki işin üstünde dokunur gibi iner kalkar
  const elIpucu = h('div.ps-el-ipucu', { 'aria-hidden': 'true' }, h('i.ps-el-dalga'), h('span.ps-el-el', {}, svg(IKON.el)));
  const el = h('div.ps-gun', { 'data-gun': String(gun), 'data-yer': ayar.yer }, sahne, tezgah, ust, efekt_.el, elIpucu);
  // sahne en çok ~19.5:9 genişlikte, ortada; daha geniş ekranda iki yan otobüsün iç duvarı (hiçbir şey yayılmaz)
  const dis = h('div.ps-gun-dis', {}, el);
  if (resimli) {
    el.classList.add('ps-resimli');
    const a = ARKA;
    // pencerenin açıklığı oyulur (maske): arkasındaki park ve müşteriler görünür
    const [x0, x1, y0, y1, rx, ry] = [a.pencere.sol, a.pencere.sag, a.pencere.ust, a.tezgah + 0.03, 0.02, 0.036];
    const maske = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none"><path fill-rule="evenodd" d="M0 0H1V1H0Z M${x0} ${y1}V${y0 + ry}Q${x0} ${y0} ${x0 + rx} ${y0}H${x1 - rx}Q${x1} ${y0} ${x1} ${y0 + ry}V${y1}Z"/></svg>`;
    arkaResim!.style.setProperty('--maske', `url("data:image/svg+xml,${encodeURIComponent(maske)}")`);
    const tabakUrl = yuva('tabak');
    el.setAttribute(
      'style',
      `--arka-url:url("${arkaUrl}");--on-url:url("${onUrl}");--a-sol:${a.pencere.sol};--a-sag:${a.pencere.sag};--a-ust:${a.pencere.ust};--a-tz:${a.tezgah};--a-tzon:${a.tezgahOn}${tabakUrl ? `;--tabak-url:url("${tabakUrl}")` : ''}`,
    );
    oranYaz(arkaUrl!, el, '--a-oran');
  }
  // her dokunuşta minik parıltı; el ipucu kaybolur
  el.addEventListener('pointerdown', (e) => {
    sonDokunus = performance.now();
    elIpucuGizle();
    if (!(e.target as Element).closest('.ps-tezgah button')) return;
    const k = efekt_.kutu();
    efekt_.parilti(e.clientX - k.left, e.clientY - k.top, 3, 0.45);
  });
  boyaUygula(el);
  boyaUygula(dis);

  // ---------------------------------------------------------------- Mino ve Kino
  const minoCanli = new MinoCanli(mino, { urunVar: () => !!tabak, musteriVar: () => musteriler.length > 0 });
  let kinoSonSoz = 0;
  /** Kino'nun kuyruğu pervane olur, iki kez hoplar */
  const kinoPervane = () => kinoIs.pervane();
  /** Kino'nun binmemesi gereken kutular: fırın, tezgâhtaki bütün eşyalar, Mino */
  const kinoEngeller = () => [firin, ...tezgah.querySelectorAll('button'), mino.el].map((e) => e.getBoundingClientRect());
  /** Mino ekranda Kino'nun hangi yanında */
  const minoYonu = (): 'sol' | 'sag' => {
    const a = mino.el.getBoundingClientRect();
    const b = kinoIs.kutu();
    return a.left + a.width / 2 < b.left + b.width / 2 ? 'sol' : 'sag';
  };
  /**
   * Mutlu müşteride Mino ile Kino çak yapar: iki pati havada (0.5 sn), "şak!", üç yıldız. Bekletmez. Yan yanaysalar
   * (dikey) patiler buluşur; uzaksalar (yatay) ikisi de patisini birbirine kaldırır, yıldızlar iki patiden çıkar.
   */
  const cak = () => {
    const yon = minoYonu();
    // Mino'ya doğru sıçrar (Mino engel sayılmaz: çakta patiler buluşur), fırın ve istasyonlar engel
    kinoIs.cak(yon, 500, kinoEngeller().slice(0, -1), el.getBoundingClientRect());
    // Mino'nun patileri sevinçle havada (tepki 'sevinc', servisle başladı). Mino.kol() kullanılmaz: kalkık kol için
    // poz katmanlarını (~90 KB) Mino'ya ekler, sonraki her dokunuş ağırlaşıyordu (ölçüldü: dokunuş başı ~250 ms).
    sonra(200, () => {
      ses.sak();
      const k = kinoIs.kutu();
      const m = mino.el.getBoundingClientRect();
      const e = efekt_.kutu();
      const kx = (yon === 'sag' ? k.left + k.width * 0.78 : k.left + k.width * 0.22) - e.left;
      const ky = k.top + k.height * 0.12 - e.top;
      const mx = (yon === 'sag' ? m.left + m.width * 0.22 : m.left + m.width * 0.78) - e.left;
      const my = m.top + m.height * 0.12 - e.top;
      if (Math.hypot(kx - mx, ky - my) < k.width * 1.6) efekt_.yildizlar((kx + mx) / 2, Math.min(ky, my), 3);
      else {
        efekt_.yildizlar(kx, ky, 3);
        efekt_.yildizlar(mx, my, 3);
      }
    });
    if (performance.now() - kinoSonSoz > 2500) {
      kinoSonSoz = performance.now();
      void soyle(P.kino.cak, 'kino', false);
    }
  };
  /** Kino bir şeyi yer: parça Kino'nun ağzına uçar, ham ham */
  const kinoYer_ = async (resim: string, [x, y]: [number, number], soz?: string) => {
    const [ax, ay] = kino.k.agiz;
    const hedef = efekt_.merkez(kino.el, ax, ay);
    void kino.oynat('bak', 400);
    await efekt_.ucur(h('div.ps-ucan-parca', { html: resim }), [x, y], hedef, { ms: 520, kavis: -80, boy1: 0.5 });
    if (kapandi) return;
    ses.ham();
    void kino.oynat('ye', 1000);
    if (kino.ifadeVar('keyif')) kino.ifade('keyif', 1200);
    efekt_.parilti(hedef[0], hedef[1], 4, 0.5);
    if (soz && performance.now() - kinoSonSoz > 2500) {
      kinoSonSoz = performance.now();
      void soyle(soz, 'kino', false);
    }
  };

  // ---------------------------------------------------------------- müşteriler
  const musteriler: PastaMusteri[] = [];
  const yerindeki: (PastaMusteri | null)[] = yerler.map(() => null);
  let sonGelis = -1e9;
  let biten = 0;
  let gelen = 0;
  let calisiyor = false;
  let sonDokunus = performance.now();
  /** bugünün mutlu müşterileri (sipariş tam aynı) */
  let mutlu = 0;
  let uyuyanOldu = false;

  /** servis edilmiş, yiyip dans eden müşteriler (gidene kadar değil, dansı bitene kadar) */
  const yiyenler = new Set<PastaMusteri>();
  /**
   * Yeni müşteri soldan yürür: yerinin solunda yiyen / dans eden müşteri varsa önünden geçip kalpleri, lokmayı, dansı
   * örtmesin; dans bitene kadar beklenir (sayaç her 100 ms yeniden dener).
   */
  const yolKapali = (yer: number) => [...yiyenler].some((m) => {
    const y = yerindeki.indexOf(m);
    return y >= 0 && yerler[y].offsetLeft < yerler[yer].offsetLeft;
  });

  async function musteriGelsin() {
    const yer = yerindeki.findIndex((x, j) => !x && !yolKapali(j));
    const i = siradakiIndeks(kuyruk, musteriler.map((m) => m.ad));
    if (yer < 0 || i < 0) return;
    const sip = kuyruk.splice(i, 1)[0];
    const m = new PastaMusteri(sip);
    if (ozel) m.el.dataset.siparis = JSON.stringify(sip);
    m.el.dataset.sira = String(gelen);
    // karşılama dönüşümlü: bir müşteriye Mino, bir müşteriye Kino
    const kinoKarsilar = gelen % 2 === 1;
    m.el.dataset.karsilayan = kinoKarsilar ? 'kino' : 'mino';
    musteriler.push(m);
    yerindeki[yer] = m;
    gelen++;
    sonGelis = performance.now();
    yerler[yer].replaceChildren(m.el);
    m.el.addEventListener('click', () => musteriBas(m));
    // soldan, ekranın dışından yürüyerek gelir
    const bas = -(yerler[yer].offsetLeft + m.el.offsetWidth / 2 + 30);
    window.setTimeout(() => minoCanli.karsila(), sure(400));
    await m.gel(bas);
    if (kapandi) return;
    sonGelis = performance.now();
    mino.bak(-0.6);
    if (kinoKarsilar) {
      // Kino pencereye hop atar, patisini sallar: "Hoş geldin!"; siparişi yine Mino bir kez okur
      kinoIs.selam(m.el.getBoundingClientRect().left + m.el.offsetWidth / 2);
      void soyle(P.kino.hosgeldin, 'kino');
      await soyle(okuma(m.sip));
    } else await soyle([P.mino.hosgeldin, ...okuma(m.sip)]);
    mino.bak(0);
  }

  /** Sıradaki (servis bekleyen) müşteriler, geliş sırasıyla */
  const bekleyenSiparisler = () => musteriler.filter((m) => m.hazir && !m.bitti);
  /** Tabaktaki partinin sahibi: en çok tutan kalemin müşterisi */
  function sahibi(parti: Parti): PastaMusteri | null {
    const b = bekleyenSiparisler();
    const k = hedefKalem(b, parti);
    return (k && b.find((m) => m.sip.kalemler.includes(k))) ?? b[0] ?? null;
  }

  function musteriBas(m: PastaMusteri) {
    if (!m.hazir || m.bitti) return;
    efekt.dokunma();
    if (m.uyuyor) {
      m.uyan();
      void soyle(P.musteri.uyandi, m);
    }
    // tabak hazırsa bu müşteriye gider
    if (tabak && !kalanIs(tabak, hedefKalem([m], tabak))) {
      void servis(m);
      return;
    }
    // siparişi bir daha dinlet
    m.dikkat();
    void soyle(okuma(m.sip), 'mino', false);
  }

  /** Jetonlar müşterinin önünde tezgâha düşer, az sonra kendiliğinden kasaya uçar */
  function jetonDussun(m: PastaMusteri, adet: number, bahsis: number) {
    const r = m.el.getBoundingClientRect();
    const k = jetonKatmani.getBoundingClientRect();
    const x = ((r.left + r.width / 2 - k.left) / Math.max(1, k.width)) * 100;
    for (let i = 0; i < adet + bahsis; i++) {
      const j = h(`i.ps-jeton${i >= adet ? '.ps-bahsis' : ''}`, { 'aria-hidden': 'true', html: JETON, style: `left:calc(${x.toFixed(1)}% + ${((i - (adet + bahsis - 1) / 2) * 0.62).toFixed(2)} * var(--jeton));--i:${i}` });
      jetonKatmani.append(j);
      yerdeJeton++;
      window.setTimeout(() => !kapandi && ses.singir(i), sure(260 + i * 90));
    }
    const [yx, yy] = efekt_.merkez(m.el, 0.5, 0.15);
    efekt_.yazi(yx, yy, `+${adet + bahsis}`);
    el.classList.add('ps-jeton-var');
    sonra(sure(TEST_MODU ? 300 : 1100), () => void jetonTopla());
  }

  /** Tezgâhtaki jetonlar kasaya uçar */
  let topluyor = false;
  async function jetonTopla() {
    const js = [...jetonKatmani.querySelectorAll<HTMLElement>('.ps-jeton')];
    if (!js.length || topluyor) return;
    topluyor = true;
    const hedef = efekt_.merkez(kasa, 0.5, 0.75);
    kasa.classList.add('ps-kasa-acik');
    await Promise.all(
      js.map(async (j, i) => {
        const bas = efekt_.merkez(j);
        j.remove();
        // yüksek bir yay çizerek döne döne kasanın çekmecesine
        const kavis = -Math.max(90, Math.abs(hedef[0] - bas[0]) * 0.35);
        await efekt_.ucur(h('div.ps-ucan-jeton', { html: JETON }), bas, hedef, { ms: 640, gecikme: i * 150, kavis, boy0: 1.1, boy1: 0.55, don: 540 });
        if (kapandi) return;
        bugun++;
        yerdeJeton--;
        kasaSayi.textContent = String(bugun);
        salla(kasaSayi, 'ps-zipla');
        ses.singir(i);
        salla(kasa, 'ps-zipla');
        efekt_.parilti(hedef[0], hedef[1], 5, 0.6);
        durumYaz();
      }),
    );
    kasa.classList.remove('ps-kasa-acik');
    if (!jetonKatmani.querySelector('.ps-jeton')) el.classList.remove('ps-jeton-var');
    topluyor = false;
    // toplarken yenileri düştüyse onlar da
    if (jetonKatmani.querySelector('.ps-jeton')) void jetonTopla();
  }
  kasa.addEventListener('click', () => {
    efekt.dokunma();
    void jetonTopla();
  });

  async function servis(m: PastaMusteri) {
    const parti = tabak;
    if (!parti || m.bitti || !m.hazir) return;
    const i = kalemSec(m.sip, m.verilen, parti);
    if (i < 0) return;
    // uyuyan müşteriye (tabağa dokunup ya da sürükleyip) verilince o da uyanır
    if (m.uyuyor) {
      m.uyan();
      void soyle(P.musteri.uyandi, m);
    }
    efekt.secim();
    m.verilen[i] = parti;
    const bas = efekt_.merkez(tabakEl);
    tabak = bekleyen.shift() ?? null;
    tabakCiz();
    if (tabak) salla(tabakEl, 'ps-zipla');
    m.bitti = true;
    yiyenler.add(m);
    m.el.classList.add('ps-bitti');
    adimGuncelle();
    const hedef = efekt_.merkez(m.el, 0.5, 0.45);
    // tabak aynı yolda, aynı sürede uçar; Kino yolun ilk yarısında yanından koşar, pencerede "Buyurun!" (tabak beklemez)
    kinoIs.servis(hedef[0] + efekt_.kutu().left, sure(460), kinoEngeller(), el.getBoundingClientRect());
    if (performance.now() - kinoSonSoz > 2500) {
      kinoSonSoz = performance.now();
      void soyle(P.kino.buyurun, 'kino', false);
    }
    await efekt_.ucur(h('div.ps-ucan-tabak', { html: partiCizimi(parti, 'ps-mini').join('') }), bas, hedef, { ms: 460, kavis: -90, boy1: 0.85 });
    if (kapandi) return;
    const sonuc = siparisSonucu(m.sip, m.verilen);
    const para = jetonHesapla(sonuc.ayni, m.sabir, m.uyudu);
    m.el.dataset.sonuc = sonuc.ayni ? 'ayni' : 'farkli';
    const [hx, hy] = efekt_.merkez(m.el, 0.5, 0.3);
    if (sonuc.ayni) {
      mutlu++;
      efekt.dogru();
      efekt_.konfeti(hx, hy);
      efekt_.kalpler(hx, hy, 8);
      efekt_.parilti(hx, hy, 10);
      // büyük sevinç: müşteri iki kez hoplar, başının üstünde kocaman kalp açılır
      efekt_.buyukKalp(...efekt_.merkez(m.el, 0.5, 0.05));
      salla(m.el, 'ps-cok-mutlu');
      ekranSalla(el, 2.5);
      m.mutlu(2600);
      mino.tepki('sevinc');
      cak();
      void soyle(P.mino.tam);
    } else {
      // farklı olan şey balonda bir an parlar; yine de yer ve sever
      m.karsilastir(sonuc.farklar);
      mino.tepki('sasir');
      void soyle(P.mino.farkli);
      await bekle(1600);
      if (kapandi) return;
      efekt_.kalpler(hx, hy, 4);
      m.mutlu(1600);
    }
    hedefCiz(sonuc.ayni);
    await m.ye(partiCizimi(parti, 'ps-lokma-svg')[0] ?? '');
    if (kapandi) return;
    jetonDussun(m, para.jeton, para.bahsis);
    void soyle(tesekkur(m.ad, m.verilen), m);
    await m.dans();
    yiyenler.delete(m);
    if (kapandi) return;
    minoCanli.ugurla();
    // sağa yürüyerek gider
    const yer = yerindeki.indexOf(m);
    const genislik = sahne.clientWidth;
    await m.git(genislik - (yerler[yer]?.offsetLeft ?? 0) + m.el.offsetWidth / 2 + 40);
    m.kapat();
    m.el.remove();
    if (yer >= 0) yerindeki[yer] = null;
    musteriler.splice(musteriler.indexOf(m), 1);
    biten++;
    durumYaz();
    if (biten >= MUSTERI_TOPLAM) void gunBitti();
  }
  /** Gün tahtası: servis edilen müşterinin kalbi dolar (tam aynıysa dolu, farklıysa açık) */
  let servisSayisi = 0;
  let hedefTuttu = false;
  function hedefCiz(ayni: boolean) {
    // günün hedefi tutunca Mino ile Kino birlikte zıplar (bir kez; çak bittikten sonra)
    if (!hedefTuttu && mutlu >= ayar.hedef) {
      hedefTuttu = true;
      sonra(sure(600), () => {
        mino.tepki('zipla');
        kinoIs.zipla();
      });
    }
    const k = hedefEl.children[servisSayisi++];
    k?.classList.add(ayni ? 'dolu' : 'yarim');
    hedefEl.dataset.mutlu = String(mutlu);
    salla(k, 'ps-zipla');
  }

  // ---------------------------------------------------------------- yakın plan paneli açıkken gün durur
  let panelAcik = false;
  // fırın ve sabır saatleri durur (panel açık ya da sayfa gizli); ikisi üst üste binerse süre bir kez kaydırılır
  let durmaSayisi = 0;
  let durBas = 0;
  function saatDur() {
    if (durmaSayisi++ === 0) durBas = performance.now();
  }
  function saatDevam() {
    if (--durmaSayisi > 0) return;
    // fırın ve sabır kaldığı yerden
    const fark = performance.now() - durBas;
    gozler.forEach((g) => g && (g.bas += fark));
    sonGelis += fark;
    son = performance.now();
  }
  async function panelle<T>(f: () => Promise<T>): Promise<T> {
    panelAcik = true;
    saatDur();
    el.classList.add('ps-panel-acik');
    adimGuncelle();
    try {
      return await f();
    } finally {
      saatDevam();
      panelAcik = false;
      el.classList.remove('ps-panel-acik');
      adimGuncelle();
    }
  }

  // ---------------------------------------------------------------- sıradaki iş (parlama, el ipucu)
  /** Yapılmakta olan partiler: fırındakiler, tabaktaki, tabağın yanında bekleyenler */
  const uretimde = (): Parti[] => [...gozler.filter((g): g is Goz => !!g).map((g) => g.parti), ...(tabak ? [tabak] : []), ...bekleyen];
  /** Daha başlanmamış ilk kalem (geliş sırasıyla; yapılmakta olan partiler şekil ve adetle eşlenir) */
  function yapilacak(): Kalem | null {
    const serbest = uretimde();
    for (const m of bekleyenSiparisler()) {
      for (const k of m.sip.kalemler.filter((_, i) => !m.verilen[i])) {
        const j = serbest.findIndex((p) => p.sekil === k.sekil && p.parcalar.length === k.adet);
        const j2 = j >= 0 ? j : serbest.findIndex((p) => p.urun === k.urun);
        if (j2 >= 0) serbest.splice(j2, 1);
        else return k;
      }
    }
    return null;
  }
  function siradakiAdim(): { ad: AdimAdi; el: HTMLElement } | null {
    if (!calisiyor || panelAcik) return null;
    const bekleyenler = bekleyenSiparisler();
    if (!bekleyenler.length) return null;
    // 1) tabaktaki: krema, süs, servis
    if (tabak) {
      const k = hedefKalem(bekleyenler, tabak);
      const is = kalanIs(tabak, k);
      if (is === 'krema') {
        const r = k?.renk ?? tabak.parcalar[0]?.renk ?? acik.renkler[0];
        return { ad: 'krema', el: kremaDugmeleri[acik.renkler.indexOf(r)] ?? kremaDugmeleri[0] };
      }
      if (is === 'sus' && k?.sus && acik.susler.includes(k.sus)) return { ad: 'sus', el: susDugmeleri[acik.susler.indexOf(k.sus)] };
      return { ad: 'servis', el: tabakEl };
    }
    // 2) fırında altın olan
    const ai = gozler.findIndex((g) => g?.hal === 'altin');
    if (ai >= 0) return { ad: 'firin', el: gozEl[ai].b };
    // 3) yeni tepsi
    const k = yapilacak();
    if (!k) return null;
    if (tepsi.length < Math.min(k.adet, EN_COK_HAMUR)) return { ad: 'hamur', el: hamurKabi };
    if (tepsi.some((x) => x !== k.sekil)) return { ad: 'kalip', el: kalipDugmeleri[kaliplar.indexOf(k.sekil as Kalip)] ?? kalipDugmeleri[0] };
    if (gozler.some((g) => !g)) return { ad: 'tepsi', el: tepsiEl };
    return null;
  }
  let parlayan: HTMLElement | null = null;
  let adimAdi: AdimAdi | null = null;
  function adimGuncelle() {
    const a = siradakiAdim();
    adimAdi = a?.ad ?? null;
    if (a?.el !== parlayan) {
      parlayan?.classList.remove('ps-sirada');
      parlayan = a?.el ?? null;
      parlayan?.classList.add('ps-sirada');
      elIpucuGizle();
    }
    el.dataset.adim = adimAdi ?? '';
  }
  let elGoster = false;
  function elIpucuGizle() {
    if (!elGoster) return;
    elGoster = false;
    elIpucu.classList.remove('ps-goster');
  }
  function elIpucuBak(simdi: number) {
    if (elGoster || !parlayan || simdi - sonDokunus < IPUCU_MS || bekleyenSoz > 0) return;
    if (TEST_MODU && q.get('ipucu') !== '1') return;
    const [x, y] = efekt_.merkez(parlayan, 0.5, 0.55);
    elIpucu.style.setProperty('--x', `${x.toFixed(0)}px`);
    elIpucu.style.setProperty('--y', `${y.toFixed(0)}px`);
    elIpucu.classList.add('ps-goster');
    elGoster = true;
  }

  // ---------------------------------------------------------------- tezgâh işleri
  const ipucu = (...e: HTMLElement[]) => e.forEach((x) => salla(x, 'ps-ipucu'));
  const yanlis = () => {
    // yanlış dokunuş zararsız: sıradaki işin yeri bir kez zıplar
    ses.degil();
    if (parlayan) ipucu(parlayan);
  };
  let kinoHamurDedi = false;

  hamurKabi.addEventListener('click', () => {
    salla(hamurKabi, 'ps-bas');
    const k = yapilacak();
    const sinir = Math.min(EN_COK_HAMUR, k?.adet ?? EN_COK_HAMUR);
    if (tepsi.length >= sinir) {
      // tepsi dolu: top seker, Kino yakalayıp yer
      ses.kay();
      void kinoYer_(urunSvg({ urun: 'kurabiye', sekil: null, hal: 'top' }), efekt_.merkez(tepsiEl), kinoHamurDedi ? undefined : P.kino.yedim);
      kinoHamurDedi = true;
      adimGuncelle();
      return;
    }
    tepsi.push(null);
    const n = tepsi.length;
    ses.plop(n);
    efekt.nota(n - 1);
    tepsiCiz();
    tepsiIc.lastElementChild?.classList.add('ps-dustu');
    // kâsedeki hamur kabarıp iner, un tozu havalanır; top tepsiye "pof" diye düşer
    salla(hamurKabi, 'ps-kabar');
    const [ux, uy] = efekt_.merkez(hamurKabi, 0.5, 0.25);
    efekt_.pof(ux, uy, 0.45);
    const son_ = tepsiIc.lastElementChild;
    if (son_) sonra(sure(260), () => {
      const [x, y] = efekt_.merkez(son_, 0.5, 0.8);
      efekt_.pof(x, y, 0.5);
    });
    adimGuncelle();
  });

  function kalipBas(k: Kalip, b: HTMLElement) {
    salla(b, 'ps-bas');
    if (!tepsi.length) {
      yanlis();
      return;
    }
    for (let i = 0; i < tepsi.length; i++) tepsi[i] = k;
    ses.pof();
    const [x, y] = efekt_.merkez(tepsiEl);
    efekt_.pof(x, y, 1.1);
    tepsiCiz();
    tepsiIc.classList.remove('ps-pofladi');
    void tepsiIc.offsetWidth;
    tepsiIc.classList.add('ps-pofladi');
    adimGuncelle();
  }

  /** Tepsi fırına: verilen göz (yoksa ilk boş göz); hepsi açık, paralel pişer */
  function firinaKoy(goz?: number): boolean {
    if (!tepsi.length || !tepsi.every((k) => k)) {
      yanlis();
      return false;
    }
    const i = goz !== undefined && !gozler[goz] ? goz : gozler.findIndex((g) => !g);
    if (i < 0) {
      ses.degil();
      ipucu(...gozEl.map((g) => g.b));
      return false;
    }
    const kalip = tepsi[0] as Kalip;
    const parti: Parti = { urun: 'kurabiye', sekil: kalip === 'kapkek' ? null : kalip, parcalar: tepsi.map(() => ({ renk: null, yigin: [], susler: [] })) };
    const bas = efekt_.merkez(tepsiIc);
    const resim = tepsiIc.innerHTML;
    tepsi.length = 0;
    tepsiCiz();
    gozler[i] = { parti, bas: performance.now(), hal: 'cig', hatirlatildi: false };
    efekt.secim();
    // tepsideki kurabiyeler kavis çizerek fırının gözüne uçar; göz kapağı yaylanır
    const gozB = gozEl[i].b;
    void efekt_.ucur(h('div.ps-ucan-tepsi', { html: resim }), bas, efekt_.merkez(gozB), { ms: 380, kavis: -60, boy1: 0.7 }).then(() => {
      if (kapandi) return;
      gozCiz(i);
      ses.pof();
      salla(gozB, 'ps-zipla');
      const [x, y] = efekt_.merkez(gozB);
      efekt_.parilti(x, y, 4, 0.5);
    });
    gozB.dataset.hal = 'cig';
    firinDurum();
    adimGuncelle();
    return true;
  }
  let tepsiSurukledi = false;
  tepsiEl.addEventListener('click', () => {
    if (tepsiSurukledi) return;
    salla(tepsiEl, 'ps-bas');
    firinaKoy();
  });
  /** Tepsiyi fırına sürükleme: parmağın altındaki boş göze (yoksa ilk boş göze) */
  let tepsiX = 0;
  let tepsiY = 0;
  const gozAt = (x: number, y: number) =>
    gozEl.findIndex((g, i) => {
      if (gozler[i]) return false;
      const r = g.b.getBoundingClientRect();
      return x > r.left - 10 && x < r.right + 10 && y > r.top - 20 && y < r.bottom + 20;
    });
  const tepsiSurukleBitir = surukle({
    el: tepsiIc,
    hedef: () => firin,
    aktif: () => tepsi.length > 0 && tepsi.every((k) => k),
    basla: () => {
      tepsiSurukledi = false;
    },
    tasi: (x, y) => {
      if (Math.abs(x - tepsiX) + Math.abs(y - tepsiY) > 3) tepsiSurukledi = true;
      tepsiX = x;
      tepsiY = y;
    },
    birak: (hedefte) => {
      tepsiIc.style.transition = 'none';
      if (tepsiSurukledi && hedefte) {
        tepsiIc.style.transform = '';
        const g = gozAt(tepsiX, tepsiY);
        firinaKoy(g >= 0 ? g : undefined);
      } else geriGonder(tepsiIc);
      window.setTimeout(() => (tepsiSurukledi = false), 50);
    },
  });
  tepsiEl.addEventListener('pointerdown', (e) => {
    tepsiX = e.clientX;
    tepsiY = e.clientY;
  });

  function gozCiz(i: number) {
    const g = gozler[i];
    const { b, ic } = gozEl[i];
    b.dataset.hal = g ? g.hal : 'bos';
    if (!g) {
      ic.replaceChildren();
      b.style.removeProperty('--hamur');
      b.style.removeProperty('--p');
      b.style.removeProperty('--y');
      firinDurum();
      return;
    }
    ic.replaceChildren(...g.parti.parcalar.map((_, k) => h('i.ps-goz-parca', { style: `--i:${k}`, html: urunSvg({ urun: g.parti.urun, sekil: g.parti.sekil, hal: 'pismis', firin: true }) })));
    ic.dataset.adet = String(g.parti.parcalar.length);
  }
  /** Fırının lambası ve göstergesi: çalışıyor mu, pişmiş var mı */
  function firinDurum() {
    firin.dataset.calisiyor = gozler.some(Boolean) ? '1' : '0';
    firin.dataset.altin = gozler.some((g) => g?.hal === 'altin') ? '1' : '0';
  }

  let pistiDedi = false;
  function firinTik(simdi: number) {
    gozler.forEach((g, i) => {
      if (!g) return;
      const gecen = simdi - g.bas;
      const b = gozEl[i].b;
      const pm = pisme(gecen, FZ);
      b.style.setProperty('--hamur', hamurRengi(pm));
      b.style.setProperty('--p', Math.min(1, gecen / FZ.altin).toFixed(3));
      b.style.setProperty('--y', Math.max(0, pm - 1).toFixed(3));
      const hal = firinHali(gecen, FZ);
      if (hal === g.hal) {
        // altında bekliyor: bir kez hatırlat
        if (hal === 'altin' && !g.hatirlatildi && gecen - FZ.altin > 4000) {
          g.hatirlatildi = true;
          void soyle(P.mino.pisti, 'mino', false);
        }
        return;
      }
      g.hal = hal;
      b.dataset.hal = hal;
      firinDurum();
      const [x, y] = efekt_.merkez(b);
      if (hal === 'altin') {
        // büyük "ding": ışık patlaması, parıltılar, kapak zıplar
        ses.ding();
        efekt_.isik(x, y, 1.4);
        ekranSalla(el, 1.5);
        efekt_.parilti(x, y, 14, 1.1);
        salla(b, 'ps-zipla');
        kinoPervane();
        if (!pistiDedi) {
          pistiDedi = true;
          void soyle(P.mino.pisti);
        } else if (performance.now() - kinoSonSoz > 6000) {
          kinoSonSoz = performance.now();
          void soyle(P.kino.pisti, 'kino', false);
        }
      } else if (hal === 'yanik') {
        ses.cizir();
        efekt_.duman(x, y - 20);
        // Kino koşar ve yer: "Çıtır çıtır!" (ceza yok, yeniden yapılır)
        sonra(sure(900), () => {
          const g2 = gozler[i];
          if (!g2 || g2.hal !== 'yanik') return;
          gozler[i] = null;
          const resim = urunSvg({ urun: g2.parti.urun, sekil: g2.parti.sekil, hal: 'pismis', hamur: '#7B4526', yanik: true });
          gozCiz(i);
          kinoPervane();
          void kinoYer_(resim, [x, y], P.kino.citir);
          kinoSonSoz = performance.now();
          adimGuncelle();
        });
      }
      adimGuncelle();
    });
  }

  function gozBas(i: number) {
    const g = gozler[i];
    const b = gozEl[i].b;
    if (!g) {
      if (!firinaKoy(i)) salla(b, 'ps-bas');
      return;
    }
    if (g.hal === 'cig') {
      // henüz değil: kapak hafifçe titrer
      ses.degil();
      salla(b, 'ps-hayir');
      return;
    }
    if (g.hal === 'yanik') return;
    // altın: tabağa çıkar (tabak doluysa yanında sıraya girer)
    gozler[i] = null;
    gozCiz(i);
    const parti = g.parti;
    const bas = efekt_.merkez(b);
    efekt_.parilti(bas[0], bas[1], 6, 0.7);
    efekt.yapis();
    const tabagaMi = !tabak;
    if (tabak) bekleyen.push(parti);
    else tabak = parti;
    adimGuncelle();
    void efekt_.ucur(h('div.ps-ucan-tabak', { html: partiCizimi(parti, 'ps-mini').join('') }), bas, efekt_.merkez(tabagaMi ? tabakEl : bekleyenEl), { ms: 420, kavis: -70 }).then(() => {
      if (kapandi) return;
      tabakCiz();
      salla(tabagaMi ? tabakEl : bekleyenEl, 'ps-zipla');
    });
  }

  /** Krema: hepsi o renk, krema kurabiyenin üstüne yayılır. Gün 3 zigzag siparişte kolay kaydırma paneli açılır. */
  function kremaBas(r: Renk, b: HTMLElement) {
    salla(b, 'ps-sik');
    if (panelAcik) return;
    if (!tabak) {
      yanlis();
      return;
    }
    const parti = tabak;
    const [x, y] = efekt_.merkez(tabakEl, 0.5, 0.35);
    parti.parcalar.forEach((p) => (p.renk = r));
    const hedefK = hedefKalem(bekleyenSiparisler(), parti, r);
    ses.fis();
    efekt_.pof(x, y, 0.9, '#fff');
    // torbadan tabağa krema damlası uçar
    // krema torbası (kendi çizimi) kurabiyenin üstüne süzülür, ucunu sıkar
    void efekt_.ucur(h('div.ps-ucan-torba', { html: kremaDikSvg(r) }), efekt_.merkez(b, 0.5, 0.4), [x, y - 14], { ms: 300, kavis: -40, boy0: 0.9, boy1: 0.7 });
    tabakCiz();
    tabakIc.classList.remove('ps-kremalandi');
    void tabakIc.offsetWidth;
    tabakIc.classList.add('ps-kremalandi');
    adimGuncelle();
    if (acik.zigzag && hedefK?.desen === 'zigzag' && parti.parcalar.some((p) => p.desen !== 'zigzag')) {
      void panelle(() => zigzagCiz({ kok: el, efekt: efekt_, soyle: (s, k, o) => soyle(s, k ?? 'mino', o) }, parti, r)).then(() => {
        if (kapandi) return;
        tabakCiz();
        salla(tabakEl, 'ps-zipla');
        adimGuncelle();
      });
    }
  }

  /** Süs: her dokunuş en az süslü kurabiyeye bir tane (zıplayarak oturur); yanlış süs ya da fazlası kayar, Kino yer */
  let susSira = 0;
  function susBas(s: Sus, b: HTMLElement) {
    salla(b, 'ps-bas');
    if (!tabak) {
      yanlis();
      return;
    }
    const parti = tabak;
    const k = hedefKalem(bekleyenSiparisler(), parti);
    // konabilen (üstünde başka süs olmayan, sınırı dolmamış) en az süslü kurabiye
    const enAz = susYeri(parti, s, k);
    const [x, y] = efekt_.merkez(tabakEl, 0.5, 0.35);
    const bas = efekt_.merkez(b, 0.5, 0.3);
    if (enAz < 0) {
      // yanlış ya da fazla süs: kayıp düşer, Kino yakalar (zararsız)
      ses.kay();
      void kinoYer_(susIkon(s), [x, y], P.kino.yedim);
      if (parlayan && parlayan !== b) ipucu(parlayan);
      return;
    }
    parti.parcalar[enAz].susler.push(s);
    ses.tik(susSira++);
    // süs kavanozdan kavis çizerek kurabiyesinin üstüne uçar, sonra yerinde zıplar
    const yerEl = tabakIc.children[enAz] as HTMLElement | undefined;
    const varis = yerEl ? efekt_.merkez(yerEl, 0.5, 0.45) : ([x, y] as [number, number]);
    void efekt_.ucur(h('div.ps-ucan-sus', { html: susIkon(s) }), bas, varis, { ms: 320, kavis: -60, boy1: 0.9 }).then(() => {
      if (kapandi || tabak !== parti) return;
      tabakCiz();
      const yeni = (tabakIc.children[enAz] as HTMLElement | undefined)?.querySelectorAll('.ps-sus');
      const son_ = yeni?.[yeni.length - 1];
      son_?.classList.add('ps-sus-kondu');
      efekt_.parilti(varis[0], varis[1], 3, 0.4);
    });
    adimGuncelle();
  }

  // tabak: dokun → hazırsa sahibine gider; ya da müşteriye sürükle
  let surukleniyor = false;
  let sonX = 0;
  let sonY = 0;
  /** Parmağın altındaki müşteri: görünen gövdesinin (dokunma alanı) çevresinde; birkaçıysa ortası en yakın olan */
  const musteriAt = (x: number, y: number) => {
    let en: PastaMusteri | null = null;
    let enUzak = Infinity;
    for (const m of musteriler) {
      if (!m.hazir || m.bitti) continue;
      const r = (m.el.querySelector('.ps-m-dokun') ?? m.el).getBoundingClientRect();
      if (!(x > r.left - 24 && x < r.right + 24 && y > r.top - 24 && y < r.bottom + 24)) continue;
      const uzak = Math.abs(x - (r.left + r.width / 2));
      if (uzak < enUzak) {
        enUzak = uzak;
        en = m;
      }
    }
    return en;
  };
  const surukleBitir = surukle({
    el: tabakIc,
    hedef: () => musteriKatmani,
    aktif: () => !!tabak,
    basla: () => {
      surukleniyor = false;
      minoCanli.izleBasla();
    },
    tasi: (x, y) => {
      if (Math.abs(x - sonX) + Math.abs(y - sonY) > 2) surukleniyor = true;
      sonX = x;
      sonY = y;
      minoCanli.izle(x);
      const m = musteriAt(x, y);
      musteriler.forEach((x2) => x2.el.classList.toggle('ps-uzerinde', x2 === m));
    },
    birak: () => {
      minoCanli.izleBitti();
      musteriler.forEach((x2) => x2.el.classList.remove('ps-uzerinde'));
      const m = surukleniyor ? musteriAt(sonX, sonY) : null;
      tabakIc.style.transition = 'none';
      if (m && tabak) {
        tabakIc.style.transform = '';
        // hazır değilse (krema, süs eksik) tabak geri döner, eksik iş parlar
        if (kalanIs(tabak, hedefKalem([m], tabak))) {
          geriGonder(tabakIc);
          yanlis();
        } else void servis(m);
      } else geriGonder(tabakIc);
      window.setTimeout(() => (surukleniyor = false), 50);
    },
  });
  tabakEl.addEventListener('pointerdown', (e) => {
    sonX = e.clientX;
    sonY = e.clientY;
  });
  tabakEl.addEventListener('click', () => {
    if (surukleniyor) return;
    if (!tabak) {
      yanlis();
      return;
    }
    const m = sahibi(tabak);
    if (!m) {
      ses.degil();
      return;
    }
    // eksik iş varsa servis edilmez: eksik işin yeri parlar
    if (kalanIs(tabak, hedefKalem([m], tabak))) {
      salla(tabakEl, 'ps-hayir');
      yanlis();
      return;
    }
    void servis(m);
  });

  // ---------------------------------------------------------------- zaman
  let son = performance.now();
  // telefon kilitlenince / uygulama arkaya geçince fırın ve sabır durur, dönünce kaldığı yerden sürer
  let gizli = false;
  const gizlilik = (arkada: boolean) => {
    if (kapandi || arkada === gizli) return;
    gizli = arkada;
    if (arkada) saatDur();
    else {
      saatDevam();
      sonDokunus = performance.now();
    }
  };
  const gorunurluk = () => gizlilik(document.hidden);
  document.addEventListener('visibilitychange', gorunurluk);
  const arkaBirak = arkaPlanDinle((arkada) => gizlilik(arkada || document.hidden));
  if (document.hidden) gizlilik(true);
  const tikZaman = window.setInterval(() => {
    if (kapandi || !calisiyor || panelAcik || gizli) return;
    const simdi = performance.now();
    const dt = simdi - son;
    son = simdi;
    firinTik(simdi);
    for (const m of musteriler) if (m.hazir && !m.bitti && !m.uyuyor) m.sabirGuncelle(m.sabir + dt / sabirSure);
    // yeni müşteri: boş yer varsa (bekleyen yoksa hemen, biri bekliyorsa aralıkla)
    const bekleyenMusteri = musteriler.filter((m) => !m.bitti).length;
    if (kuyruk.length && yerindeki.some((x) => !x) && simdi - sonGelis > (bekleyenMusteri === 0 ? (TEST_MODU ? 200 : 1200) : aralik)) void musteriGelsin();
    if (musteriler.some((m) => m.uyuyor)) uyuyanOldu = true;
    adimGuncelle();
    elIpucuBak(simdi);
    durumYaz();
  }, 100);
  function durumYaz() {
    if (ozel) el.dataset.durum = JSON.stringify({ biten, gelen, kuyruk: kuyruk.length, bugun, yerdeJeton, mutlu, uyuyanOldu, panel: panelAcik, adim: adimAdi });
  }

  // ---------------------------------------------------------------- günün sonu
  async function gunBitti() {
    calisiyor = false;
    adimGuncelle();
    await bekle(400);
    for (let i = 0; i < 40 && (yerdeJeton > 0 || topluyor) && !kapandi; i++) {
      void jetonTopla();
      await bekle(150);
    }
    if (kapandi) return;
    // jetonlar toplandı: gün hemen kaydedilir (akşam yalnız gösterir; "bitti" cümlesinde çıkılsa da jeton kalır)
    const yildiz = yildizHesapla(mutlu, ayar.hedef);
    kayitGunBitti(gun, yildiz, bugun);
    await soyle(P.mino.bitti);
    mino.tepki('dans');
    await bekle(900);
    if (!kapandi) app.git('aksam', { gun, kazanc: bugun, yildiz, mutlu, kaydedildi: true });
  }

  // ---------------------------------------------------------------- açılış: otobüs parka gelir
  tepsiCiz();
  tabakCiz();
  // günün bütün görselleri (tezgâh, fırın, kalıplar, torbalar, arka; bugünkü siparişlerin balon resimleri) otobüs
  // gelirken indirilip çözülür; mutfak ancak hepsi hazır olunca açılır (yarım tezgâh, boş balon görünmez). Önce
  // otobüsün kendi görselleri (girişte o görünür), sonra mutfağınkiler: yavaş bağlantıda ikisi birbirini beklemez.
  const otobusYuk = onYukle([yuva('otobus'), yuva('teker'), yuva('tekerIsik')].filter((u): u is string => !!u), 4000);
  const mutfakUrl = resimleriTopla(el, ...kuyruk.map((s) => siparisResmi(s)));
  const onYuk = { resimler: [...otobusYuk.resimler], hazir: Promise.resolve() };
  onYuk.hazir = otobusYuk.hazir.then(() => {
    const m = onYukle(mutfakUrl, TEST_MODU ? 3000 : 7000);
    onYuk.resimler.push(...m.resimler);
    // Kino'nun iskeleti (SVG'si ayrı iner) de: mutfak onsuz açılmaz (en çok görsel sınırı kadar)
    const iskelet = Promise.race([kino.hazir, new Promise<void>((r) => setTimeout(r, TEST_MODU ? 3000 : 7000))]);
    return Promise.all([m.hazir, iskelet]).then(() => undefined);
  });
  el.classList.add('ps-yukleniyor');
  void onYuk.hazir.then(() => el.classList.remove('ps-yukleniyor'));
  const giris = otobusGirisi(el, otobusYuk.hazir, onYuk.hazir, () => {
    calisiyor = true;
    son = performance.now();
    sonDokunus = performance.now();
  });
  void soyle(P.mino.geldi);
  if (ozel) (window as unknown as Record<string, unknown>).__pastaGun = { kuyruk, musteriler, gozler, kinoIs, cak, kinoEngeller, get tabak() { return tabak; } };

  return {
    el: dis,
    kapat() {
      kapandi = true;
      calisiyor = false;
      clearInterval(tikZaman);
      document.removeEventListener('visibilitychange', gorunurluk);
      arkaBirak();
      zamanlar.forEach(clearTimeout);
      giris.kapat();
      surukleBitir();
      tepsiSurukleBitir();
      minoCanli.kapat();
      mino.kapat();
      kinoIs.kapat();
      kino.kapat();
      musteriler.forEach((m) => m.kapat());
      onYuk.resimler.length = 0;
    },
  };
}

/**
 * Otobüs parka gelir: soldan yuvarlanarak gelir, durur (esneyip basılır), korna; yan kapağı yukarı açılıp tente olur,
 * Mino kapağın içinde el sallar; sonra kadraj kapağa yaklaşır ve tezgâh görünür. Dokununca hemen geçer.
 */
function otobusGirisi(ekran: HTMLElement, otobusHazir: Promise<void>, hazir: Promise<void>, bitti: () => void): { kapat: () => void } {
  const mino = new Mino();
  minoSapkaTak(mino);
  // Mino ile Kino kapağın penceresinde, gövdenin içinde (tekerlekler önde, açıkta)
  const kino = unluKino();
  const otobus = h('div.ps-otobus', { html: OTOBUS }, h('div.ps-giris-mino', {}, mino.el), h('div.ps-giris-kino', {}, kino.el));
  const katman = h('div.ps-giris', { 'aria-hidden': 'true' }, ...parkKatmanlari((ekran.dataset.yer ?? 'park') as Yer), h('div.ps-giris-sahne', {}, otobus));
  ekran.append(katman);
  const sakin = AZ_HAREKET || TEST_MODU;
  const minoKopya = otobus.querySelector('.ps-giris-mino')!;
  const kinoKopya = otobus.querySelector('.ps-giris-kino')!;
  let kapandi = false;
  let bitirildi = false;
  const kapat = () => {
    kapandi = true;
    mino.kapat();
    kino.kapat();
    katman.remove();
  };
  // mutfak görselleri hazır olmadan giriş kalkmaz (dokunulsa da: hazır olunca hemen geçer)
  let mutfakHazir = false;
  void hazir.then(() => (mutfakHazir = true));
  const gec = () => {
    if (bitirildi) return;
    bitirildi = true;
    void hazir.then(() => {
      if (kapandi) return;
      kapat();
      bitti();
    });
  };
  // beklemek istemeyen çocuk dokununca giriş biter
  katman.addEventListener('pointerdown', gec);
  void (async () => {
    if (sakin) {
      await new Promise((r) => setTimeout(r, TEST_MODU ? 60 : 300));
      if (!kapandi) gec();
      return;
    }
    // otobüsün kendi görselleri (gövde, tekerlek) çözülmeden yola çıkmaz: yarım otobüs (havada tente) görünmez
    otobus.style.visibility = 'hidden';
    await otobusHazir;
    otobus.style.visibility = '';
    if (kapandi) return;
    const tekerler = [...otobus.querySelectorAll<SVGGElement>('.ps-ob-teker')];
    const donus = tekerler.map((t) => t.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(720deg)' }], { duration: 1500, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }));
    await otobus
      .animate(
        [
          { transform: 'translateX(-120vw) rotate(0deg)' },
          { transform: 'translateX(4%) rotate(-1.5deg)', offset: 0.82 },
          { transform: 'translateX(-1%) rotate(1deg)', offset: 0.92 },
          { transform: 'translateX(0) rotate(0deg)' },
        ],
        { duration: 1500, easing: 'cubic-bezier(.25,.6,.35,1)', fill: 'both' },
      )
      .finished.catch(() => undefined);
    donus.forEach((d) => d.cancel());
    if (kapandi) return;
    ses.korna();
    otobus.querySelector('.ps-ob-govde')?.animate([{ transform: 'none' }, { transform: 'translateY(6px) scale(1.02, .96)' }, { transform: 'none' }], { duration: 380, easing: 'ease-out' });
    await new Promise((r) => setTimeout(r, 250));
    // kapak açılır (tente olur)
    ses.vuup();
    otobus.classList.add('ps-acik');
    await new Promise((r) => setTimeout(r, 550));
    if (kapandi) return;
    ses.pof();
    minoKopya.classList.add('ps-goster');
    kinoKopya.classList.add('ps-goster');
    mino.tepki('selam');
    void kino.oynat('sevin', 900);
    await new Promise((r) => setTimeout(r, 1100));
    if (kapandi) return;
    // görseller daha inmediyse Mino el sallamayı sürdürür (en çok onYukle sınırı kadar)
    if (!mutfakHazir) {
      const salla_ = window.setInterval(() => !kapandi && mino.tepki('selam'), 1400);
      await hazir;
      clearInterval(salla_);
      if (kapandi) return;
    }
    // kadraj kapağa yaklaşır
    await katman
      .animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.4) translateY(6%)', opacity: 0 }], { duration: 550, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' })
      .finished.catch(() => undefined);
    if (!kapandi) gec();
  })();
  return { kapat };
}
