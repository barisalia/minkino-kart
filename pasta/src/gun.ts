/**
 * Mino'nun Pasta Otobüsü: bir gün (tek ekran). Üstte pencere (park; sırada 1-3 müşteri, başlarının üstünde resimli
 * sipariş balonu), altta tezgâh: HAMUR + tepsi, KALIPLAR, FIRIN (3 göz), KREMA, SÜSLER, SERVİS TABAĞI.
 * Mino tezgâhta, Kino fırının yanında, kasa üstte.
 *
 * Akış: hamur kabına dokun (her dokunuş bir top) → kalıba dokun ("pof", hepsi o şekil) → tepsiye dokun (fırının boş
 * gözüne girer; beyaz → altın ~6 sn "ding" → yanık 6 sn sonra; altınken dokununca tabağa çıkar; yanığı Kino yer) →
 * krema (kurabiyede hepsi o renk; kapkekte her dokunuş bir yığın) → süs (her dokunuş bir tane; fazlası kayar, Kino
 * yakalar) → tabağa sonra müşteriye dokun (ya da tabağı müşteriye sürükle) → karşılaştırma ve jeton.
 * Ret yok: farklıysa müşteri yine yer, farklı olan şey balonda ve tabakta bir an parlar.
 */
import P from '../../content/pasta.json';
import { efekt, KINO_SESI, konus } from '../../src/audio/ses';
import type { KonusmaSecenegi, Soylenecek } from '../../src/audio/konusma';
import { Karakter } from '../../src/karakter/karakter';
import { Mino } from '../../src/mino/mino';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { MinoCanli } from '../../pazar/src/mino-canli';
import { geriGonder, surukle } from '../../pazar/src/surukle';
import { BULASIK_IKON, HAMUR_KABI, JETON, KALP, KAPAK_DESENI, KASA, KINO_CILEK_AGIZ, KINO_UN, MINO_SAPKA, OKUL, OTOBUS, RAF_SUSLERI, TABAK, TEPSI, bardakSvg, kalipSvg, kremaDikSvg, susIkon, susKabiSvg, tabakYigini, urunSvg } from './cizim';
import { icecekPaneli, makineSvg } from './icecek';
import { hareketIzniIste, susle, type Adim } from './susleme';
import { AZ_HAREKET, Efekt, ekranSalla, parkAdres, salla } from './gorsel';
import { ARKA, FIRIN_KAPILARI, FIRIN_LAMBA, oranYaz, yuva } from './resimler';
import { kayit, yukseltmeler } from './kayit';
import {
  acikOlanlar,
  BOYA,
  degisimUygula,
  firinGozSayisi,
  hedefKalem,
  TABAK_SAYISI,
  yildizHesapla,
  type Bardak,
  type Yer,
  EN_COK_HAMUR,
  EN_COK_MUSTERI,
  EN_COK_SUS,
  EN_COK_YIGIN,
  FIRIN,
  FIRIN_GOZ,
  firinHali,
  GUNLER,
  gunPlani,
  hamurRengi,
  jetonHesapla,
  kalemSec,
  okuma,
  pisme,
  sayiSozu,
  siparisSonucu,
  siradakiIndeks,
  tesekkur,
  type FirinHali,
  type FirinZaman,
  type Gun,
  type Kalip,
  type Parti,
  type Renk,
  type Siparis,
  type Sus,
} from './model';
import { PastaMusteri, partiCizimi } from './musteri';
import { ses } from './sesler';

const HAYVAN_RESMI = import.meta.glob<string>('../../assets/hayvanlar/tavsan.webp', { eager: true, query: '?url', import: 'default' });
const TAVSAN_RESMI = Object.values(HAYVAN_RESMI)[0] ?? '';

const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
/** test ya da gösterim (?onizleme=1): durum ve sipariş verisi ekrana yazılır */
const ozelMi = () => TEST_MODU || (typeof document !== 'undefined' && !!document.body?.dataset.onizleme);
/** Test / gösterim: &firin=altin,yanik (ms) ile fırın zamanı */
function firinZamani(): FirinZaman {
  const f = ozelMi() ? q.get('firin') : null;
  if (f) {
    const [a, y] = f.split(',').map(Number);
    if (a > 0 && y > a) return { altin: a, yanik: y };
  }
  return TEST_MODU ? { altin: 700, yanik: 30000 } : FIRIN;
}
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, AZ_HAREKET ? Math.min(ms, 250) : sure(ms)));

/** Müşterinin konuşma tonu (anlatıcı kaydı biraz incelir: hayvanlar daha ince) */
const MUSTERI_TON: Record<string, number> = { tavsan: 1.14, ordek: 1.16, ayi: 0.97, can: 1.06, ada: 1.1, elif: 1.1 };

interface Goz {
  parti: Parti;
  bas: number;
  hal: FirinHali;
  hatirlatildi: boolean;
}

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
}
/** Kino: unlu yüzüyle (kafa katmanına un lekeleri ve gizli çilek suyu) */
export function unluKino(): Karakter {
  const kino = new Karakter('kino', h('div'));
  void kino.hazir.then(() => {
    const kafa = kino.parcaG('kafa');
    if (kafa && !kafa.querySelector('.ps-kino-un')) kafa.insertAdjacentHTML('beforeend', KINO_UN + KINO_CILEK_AGIZ);
  });
  return kino;
}
/**
 * Mekân katmanları (gökyüzü-tepeler, orta, ön): park (okul önünde ortada okul binası, şenlikte park), plaj
 * (assets/film/plaj), karlı bahçe (assets/film/kar). Pencereden bu görünür.
 */
export function parkKatmanlari(yer: Yer): HTMLElement[] {
  const mekan = yer === 'plaj' ? 'plaj' : yer === 'kar' ? 'kar' : 'park';
  const arka = (ad: string, sinif: string) => h(`div.${sinif}`, { style: `background-image:url("${parkAdres(ad, mekan)}")` });
  return [arka('arka-uzak', 'ps-gok'), yer === 'okul' ? h('div.ps-orta.ps-okul', { html: OKUL }) : arka('arka-orta', 'ps-orta'), arka('arka-on', 'ps-on')];
}

export function gunEkrani(app: Uygulama, p: { gun?: Gun } = {}): Ekran {
  const gun = (p.gun ?? 1) as Gun;
  const ozel = ozelMi();
  const ayar = GUNLER[gun];
  const yuk = yukseltmeler(gun);
  const acik = acikOlanlar(gun, kayit.alinan, yuk);
  // hızlı fırın yükseltmesi: pişme %30 hızlı
  const FZ0 = firinZamani();
  const FZ: FirinZaman = yuk.includes('hizli-firin') && !TEST_MODU ? { altin: FZ0.altin * 0.7, yanik: FZ0.yanik * 0.7 } : FZ0;
  /** açık fırın gözleri (öbürleri kilitli: yükseltmeyle açılır) */
  const acikGoz = firinGozSayisi(yuk);
  const sabirSure = ozel && Number(q.get('sabir')) > 0 ? Number(q.get('sabir')) : TEST_MODU ? 10 * 60 * 1000 : ayar.sabir;
  const aralik = TEST_MODU ? 400 : ayar.aralik;
  const kuyruk: Siparis[] = gunPlani(gun, acik);
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
  // Mino ve Kino tezgâhın katmanında: yatayda Mino pencerenin solunda tezgâhın arkasında (beli tezgâhın gerisinde),
  // Kino fırının yanındaki rafta; dikeyde ikisi de üst katta, fırının iki yanında (boyları tam görünür)
  const minoYer = h('div.ps-mino-yer', {}, mino.el);
  const kinoYer = h('div.ps-kino-yer', { 'data-karakter-kap': 'kino' }, kino.el);
  kinoYer.addEventListener('pointerdown', () => {
    efekt.dokunma();
    void kino.oynat('sevin', 900);
    if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 900);
    const [x, y] = efekt_.merkez(kino.el, 0.5, 0.3);
    efekt_.kalpler(x, y, 2);
  });
  // yatayda sağda otobüsün iç duvarı: fayans, raf (tatlı süsleri), Kino'nun rafı; fırın bunun önünde
  const duvar = h('div.ps-duvar', { 'aria-hidden': 'true' }, h('i.ps-duvar-raf', { html: RAF_SUSLERI }));
  // Gemini görselleri (assets/pasta): otobüsün içi (pencereli duvar, raflar) müşterilerin önünde, penceresi oyulmuş;
  // tezgâhlar aynı çizimin ön yüzünden. Görsel yoksa eski kod çizimi (duvar, çerçeve, tezgâh yüzeyi) kalır.
  const arkaUrl = yuva('arka');
  const onUrl = yuva('tezgahOn');
  const resimli = !!(arkaUrl && onUrl);
  const arkaResim = resimli ? h('div.ps-arka-resim', { 'aria-hidden': 'true' }) : null;
  const sahne = h('div.ps-sahne', {}, ...parkKatmanlari(ayar.yer), musteriKatmani, arkaResim, duvar, h('div.ps-cerceve', { 'aria-hidden': 'true' }, h('i.ps-tente'), h('i.ps-flama')));

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
          html: urunSvg({ urun: k === 'kapkek' ? 'kapkek' : 'kurabiye', sekil: k && k !== 'kapkek' ? k : null, hal: k ? 'cig' : 'top', hamur: '#FBF0DC' }),
        }),
      ),
    );
    tepsiEl.dataset.adet = String(tepsi.length);
    tepsiEl.dataset.hazir = tepsi.length && tepsi.every((k) => k) ? '1' : '0';
  };

  // kalıplar
  const kaliplar: Kalip[] = [...acik.sekiller, ...(acik.kapkek ? (['kapkek'] as const) : [])];
  const kalipDugmeleri = kaliplar.map((k) => {
    const b = h('button.ps-kalip', { type: 'button', 'data-kalip': k, 'aria-label': k, html: kalipSvg(k) });
    b.addEventListener('click', () => kalipBas(k, b));
    return b;
  });

  // fırın
  const gozler: (Goz | null)[] = Array.from({ length: FIRIN_GOZ }, () => null);
  // fırın görseli varsa: kapılar görselin kendi kapıları (her kapı görselin o parçası: sallanınca kapı sallanır),
  // camların yerine oyunun camı (içi parlar, kurabiyeler kabarır); yoksa kod çizimi fırın
  const firinUrl = yuva('firin');
  const yuzde = (v: number) => `${(v * 100).toFixed(2)}%`;
  const gozEl = Array.from({ length: FIRIN_GOZ }, (_, i) => {
    const ic = h('div.ps-goz-ic');
    const cam = h('div.ps-goz-cam', {}, h('i.ps-goz-isik'), h('i.ps-goz-izgara'), ic, h('i.ps-goz-parlama'));
    const kp = FIRIN_KAPILARI[i];
    if (firinUrl && kp) cam.setAttribute('style', `left:${yuzde(kp.cx - kp.rx)};top:${yuzde(kp.cy - kp.ry)};width:${yuzde(kp.rx * 2)};height:${yuzde(kp.ry * 2)}`);
    const b = h(
      'button.ps-goz',
      {
        type: 'button',
        'data-goz': String(i),
        'data-hal': 'bos',
        'data-kilit': i >= acikGoz ? '1' : null,
        'aria-label': i >= acikGoz ? `Fırın ${i + 1} kilitli` : `Fırın ${i + 1}`,
        style: firinUrl && kp ? `--kx:${kp.x};--ky:${kp.y};--kw:${kp.w};--kh:${kp.h}` : null,
      },
      ...(firinUrl && kp ? [h('i.ps-goz-kapi', {}, cam)] : [h('i.ps-goz-kol'), cam]),
      h('i.ps-goz-saat'),
      // kilitli göz: yıldızla açılır (asma kilit ve yıldız)
      i >= acikGoz ? h('i.ps-goz-kilit', { 'aria-hidden': 'true', html: GOZ_KILIT }) : null,
    );
    b.addEventListener('click', () => gozBas(i));
    return { b, ic };
  });
  // gerçek bir fırın: üstte düğmeler, sıcaklık lambası ve saat; üç camlı kapak; ayaklar
  const firin = firinUrl
    ? h(
        'div.ps-firin.ps-firin-r',
        { style: `--firin-resim:url("${firinUrl}");--lx:${yuzde(FIRIN_LAMBA.x)};--ly:${yuzde(FIRIN_LAMBA.y)}` },
        h('img.ps-firin-resim', { src: firinUrl, alt: '', draggable: 'false', 'aria-hidden': 'true' }),
        h('i.ps-firin-lamba', { 'aria-hidden': 'true' }),
        h('div.ps-gozler', {}, ...gozEl.map((g) => g.b)),
      )
    : h(
        'div.ps-firin',
        {},
        h('i.ps-firin-baca', { 'aria-hidden': 'true' }),
        h('div.ps-firin-ust', { 'aria-hidden': 'true' }, h('i.ps-firin-dugme'), h('i.ps-firin-dugme'), h('i.ps-firin-lamba'), h('i.ps-firin-gosterge'), h('i.ps-firin-dugme')),
        h('div.ps-gozler', {}, ...gozEl.map((g) => g.b)),
        h('i.ps-firin-alt', { 'aria-hidden': 'true' }),
      );
  if (firinUrl) oranYaz(firinUrl, firin, '--firin-oran');

  // krema, süs
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

  // tabak
  let tabak: Parti | null = null;
  const bekleyen: Parti[] = [];
  /** servis için seçili olan: tabak ya da hazır bardak (sonra müşteriye dokunulur) */
  let secili: null | 'tabak' | 'bardak' = null;
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
    if (!tabak && secili === 'tabak') seciliYap(null);
  };

  // ---------------------------------------------------------------- bulaşık (Gün 4+): tabaklar birikir, Kino yıkar
  /** temiz tabak (servise hazır), kirli (müşteri yedi, Kino'nun yanında birikir); yıkanırken */
  let temiz = TABAK_SAYISI;
  let kirli = 0;
  let yikiyor = false;
  const temizEl = h('i.ps-temiz', { 'aria-hidden': 'true' });
  const kirliEl = h('i.ps-kirli', { 'aria-hidden': 'true' });
  const gorevEl = h('i.ps-kino-gorev', { 'aria-hidden': 'true', html: BULASIK_IKON }, h('i.ps-gorev-halka'));
  const bulasikCiz = () => {
    if (!acik.bulasik) return;
    temizEl.innerHTML = tabakYigini(Math.min(temiz, TABAK_SAYISI), false);
    temizEl.dataset.n = String(temiz);
    kirliEl.innerHTML = kirli ? tabakYigini(Math.min(kirli, 5), true) : '';
    kirliEl.dataset.n = String(kirli);
    kirliEl.classList.toggle('ps-sallanan', kirli >= 3);
    gorevEl.classList.toggle('ps-goster', kirli > 0 || yikiyor);
    gorevEl.classList.toggle('ps-yikiyor', yikiyor);
    kinoYer.classList.toggle('ps-gorev-var', kirli > 0 && !yikiyor);
    kinoYer.setAttribute('role', 'button');
    kinoYer.setAttribute('aria-label', kirli > 0 && !yikiyor ? 'Kino: bulaşık' : 'Kino');
  };
  if (acik.bulasik) kinoYer.append(kirliEl, gorevEl);

  // ---------------------------------------------------------------- içecek makinesi (yükseltme)
  let hazirBardak: Bardak | null = null;
  const bardakYer = h('i.ps-hazir-bardak', { 'aria-hidden': 'true' });
  const makineEl = acik.icecek ? h('button.ps-icecek-makinesi', { type: 'button', 'aria-label': 'İçecek makinesi', html: makineSvg() }, bardakYer) : null;
  const bardakCiz = () => {
    if (!makineEl) return;
    bardakYer.innerHTML = hazirBardak ? bardakSvg({ ...hazirBardak, golge: false }) : '';
    makineEl.dataset.bardak = hazirBardak ? '1' : '0';
    if (ozel) makineEl.dataset.parti = hazirBardak ? JSON.stringify(hazirBardak) : '';
    if (!hazirBardak && secili === 'bardak') seciliYap(null);
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
   * sağa HAMUR → KALIP (askıda; tepsi altında) → FIRIN (tezgâha oturur, iki sırayı kaplar) → KREMA (önde tutacakta;
   * süs kavanozları arkasındaki rafta) → SERVİS (tabak; kasa arkasındaki rafta). Dikeyde üst katta fırın, altında
   * iki raf: HAMUR | KALIP, KREMA·SÜS | SERVİS. Çizim: her kat (arka duvar fayansı, arka raf, tezgâh yüzeyi, ön kenar)
   * kod çizimi; en alttaki dolaplar görselden. Önce arka sıradakiler (dokunuşta öndekiler üstte kalır).
   * İçecek makinesi (yükseltme) hamur kâsesinin üstündeki arka rafa oturur (kâse o zaman yalnız ön sırada); bulaşıkta
   * temiz tabaklar servis tabağının yanında, kirliler Kino'nun yanında birikir.
   */
  const tezgah = h(
    'div.ps-tezgah',
    { 'data-kalip': String(kalipDugmeleri.length), 'data-krema': String(kremaDugmeleri.length), 'data-sus': String(susDugmeleri.length), 'data-icecek': makineEl ? '1' : null },
    h('i.ps-kat', { 'aria-hidden': 'true', 'data-kat': '0' }),
    h('i.ps-kat', { 'aria-hidden': 'true', 'data-kat': '1' }),
    h('i.ps-kat', { 'aria-hidden': 'true', 'data-kat': '2' }),
    h('i.ps-tz-panel', { 'aria-hidden': 'true', style: `--kapak:${KAPAK_DESENI}` }),
    minoYer,
    kinoYer,
    makineEl ? istasyon('icecek', makineEl) : null,
    istasyon('kalip', h('div.ps-askilik', {}, izgara(kalipDugmeleri))),
    istasyon('sus', izgara(susDugmeleri)),
    istasyon('kasa', kasa),
    istasyon('hamur', hamurKabi),
    istasyon('tepsi', tepsiEl),
    istasyon('firin', firin),
    istasyon('krema', h('div.ps-tutacak', {}, izgara(kremaDugmeleri))),
    istasyon('tabak', bekleyenEl, acik.bulasik ? temizEl : null, tabakEl),
    jetonKatmani,
  );

  const ilerleme = h('div.ps-ilerleme', { 'aria-hidden': 'true' }, ...Array.from({ length: kuyruk.length }, () => h('i')));
  // günlük hedef: "Bugün N mutlu müşteri" (kalpler dolar; görsel: mutlu-kalp)
  const kalpUrl = yuva('mutluKalp');
  const hedefKalbi = kalpUrl ? `<img src="${kalpUrl}" alt="" draggable="false">` : KALP;
  const hedefEl = h('div.ps-hedef', { 'aria-label': `Hedef ${ayar.hedef}`, 'data-hedef': String(ayar.hedef), 'data-mutlu': '0' }, ...Array.from({ length: ayar.hedef }, () => h('i', { html: hedefKalbi })));
  const gunEtiket = h('div.ps-gun-etiket', {}, h('b', {}, P.arayuz.gun.replace('{gun}', String(gun))), hedefEl, ilerleme);
  const cikis = () => app.git('acilis');
  const ust = h('div.ust-cubuk.ps-ust', {}, yuvarlakDugme(IKON.geri, 'Geri', cikis, 'kucuk'), h('div.orta', {}, gunEtiket), sesDugmesi());

  const el = h('div.ps-gun', { 'data-gun': String(gun), 'data-yer': ayar.yer }, sahne, tezgah, ust, efekt_.el);
  if (resimli) {
    el.classList.add('ps-resimli');
    const a = ARKA;
    // pencerenin açıklığı oyulur (maske): arkasındaki park ve müşteriler görünür, pencereden taşan yerleri duvarın gerisinde
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
  // her dokunuşta minik parıltı (tezgâhtaki bütün düğmeler; sıkışma her düğmenin kendi tepkisinde)
  tezgah.addEventListener('pointerdown', (e) => {
    if (!(e.target as Element).closest('button')) return;
    const k = app.kok.getBoundingClientRect();
    efekt_.parilti(e.clientX - k.left, e.clientY - k.top, 3, 0.45);
  });
  boyaUygula(el);

  // ---------------------------------------------------------------- Mino ve Kino
  const minoCanli = new MinoCanli(mino, { urunVar: () => !!tabak, musteriVar: () => musteriler.length > 0 });
  let kinoSonSoz = 0;
  /** Kino'nun kuyruğu pervane olur, iki kez hoplar */
  let pervaneBas = -9;
  kino.ekHareket = (pz) => {
    const g = performance.now() / 1000 - pervaneBas;
    if (g < 1.4) {
      const z = Math.max(0, Math.min(1, g / 0.15, (1.4 - g) / 0.25));
      pz.kuyruk += 40 * Math.sin(g * 40) * z;
      pz.y -= 4 * Math.abs(Math.sin(g * 9)) * z;
      pz.kulakSol += 10 * Math.sin(g * 18) * z;
      pz.kulakSag += 10 * Math.sin(g * 18 + 1) * z;
    }
  };
  const kinoPervane = () => {
    pervaneBas = performance.now() / 1000;
    if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 1400);
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
  const kinoCilekAgiz = (ms: number) => {
    const g = kino.el.querySelector<SVGGElement>('.ps-kino-cilek');
    if (!g) return;
    g.style.opacity = '1';
    sonra(ms, () => (g.style.opacity = '0'));
  };

  // ---------------------------------------------------------------- müşteriler
  const musteriler: PastaMusteri[] = [];
  const yerindeki: (PastaMusteri | null)[] = yerler.map(() => null);
  let sonGelis = -1e9;
  let biten = 0;
  let gelen = 0;
  let calisiyor = false;
  let sonDokunus = performance.now();

  /** müşterinin tezgâha vardığı an (kafası karışık müşterinin balonu bundan sonra değişir) */
  const varis = new Map<PastaMusteri, number>();
  /** bugünün mutlu müşterileri (sipariş tam aynı) ve uyuyan oldu mu (3. yıldız) */
  let mutlu = 0;

  async function musteriGelsin() {
    const yer = yerindeki.findIndex((x) => !x);
    const i = siradakiIndeks(kuyruk, musteriler.map((m) => m.ad));
    if (yer < 0 || i < 0) return;
    const sip = kuyruk.splice(i, 1)[0];
    const m = new PastaMusteri(sip, TAVSAN_RESMI);
    if (ozel) m.el.dataset.siparis = JSON.stringify(sip);
    if (sip.ozel) m.el.dataset.ozel = sip.ozel;
    m.el.dataset.sira = String(gelen);
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
    varis.set(m, performance.now());
    // Mino siparişi bir kez okur (mantık siparişini müşteri kendisi söyler)
    mino.bak(-0.6);
    if (m.sip.mantik) {
      await soyle(P.mino.hosgeldin);
      await soyle(okuma(m.sip), m);
    } else await soyle([P.mino.hosgeldin, ...okuma(m.sip)]);
    mino.bak(0);
  }

  /** Kafası karışık müşteri: hamur aşamasında (krema öncesi) balon değişir: "Şey… hayır, şöyle olsun!" */
  async function fikirDegistir(m: PastaMusteri) {
    if (!m.sip.degisim || m.bitti) return;
    const yeni = degisimUygula(m.sip);
    m.siparisDegisti(yeni, TAVSAN_RESMI);
    if (ozel) m.el.dataset.siparis = JSON.stringify(yeni);
    const [x, y] = efekt_.merkez(m.balon);
    efekt_.pof(x, y, 1);
    ses.pof();
    void m.karakter.oynat('bak', 700);
    await soyle(P.musteri.karisik, m);
    await soyle(okuma(yeni));
  }

  function musteriBas(m: PastaMusteri) {
    sonDokunus = performance.now();
    if (!m.hazir || m.bitti) return;
    efekt.dokunma();
    if (m.uyuyor) {
      m.uyan();
      void soyle(P.musteri.uyandi, m);
      if (!secili) return;
    }
    if (secili) {
      void servis(m, secili);
      return;
    }
    // siparişi bir daha dinlet
    m.dikkat();
    void soyle(okuma(m.sip), m.sip.mantik ? m : 'mino', false);
  }

  function seciliYap(ne: null | 'tabak' | 'bardak') {
    secili = ne === 'tabak' && tabak ? 'tabak' : ne === 'bardak' && hazirBardak ? 'bardak' : null;
    tabakEl.classList.toggle('ps-secili', secili === 'tabak');
    makineEl?.classList.toggle('ps-secili', secili === 'bardak');
    el.classList.toggle('ps-servis', !!secili);
  }

  /** Jetonlar müşterinin önünde tezgâha düşer */
  function jetonDussun(m: PastaMusteri, adet: number, bahsis: number) {
    const r = m.el.getBoundingClientRect();
    const k = jetonKatmani.getBoundingClientRect();
    const x = ((r.left + r.width / 2 - k.left) / Math.max(1, k.width)) * 100;
    for (let i = 0; i < adet + bahsis; i++) {
      // jetonlar yalnız görüntü (müşterilerin önünü kapatmasın); kasaya dokununca toplanır
      const j = h(`i.ps-jeton${i >= adet ? '.ps-bahsis' : ''}`, { 'aria-hidden': 'true', html: JETON, style: `left:calc(${x.toFixed(1)}% + ${((i - (adet + bahsis - 1) / 2) * 0.62).toFixed(2)} * var(--jeton));--i:${i}` });
      jetonKatmani.append(j);
      yerdeJeton++;
      window.setTimeout(() => !kapandi && ses.singir(i), sure(260 + i * 90));
    }
    const [yx, yy] = efekt_.merkez(m.el, 0.5, 0.15);
    efekt_.yazi(yx, yy, `+${adet + bahsis}`);
    el.classList.add('ps-jeton-var');
  }

  /** Tezgâhtaki jetonlar kasaya uçar; Mino sayar */
  let topluyor = false;
  async function jetonTopla(sessiz = false) {
    const js = [...jetonKatmani.querySelectorAll<HTMLElement>('.ps-jeton')];
    if (!js.length || topluyor) return;
    topluyor = true;
    sonDokunus = performance.now();
    const hedef = efekt_.merkez(kasa, 0.5, 0.75);
    if (!sessiz) void soyle(js.map((_, i) => sayiSozu(i + 1)), 'mino', false);
    kasa.classList.add('ps-kasa-acik');
    await Promise.all(
      js.map(async (j, i) => {
        const bas = efekt_.merkez(j);
        j.remove();
        // yüksek bir yay çizerek döne döne kasanın çekmecesine
        const kavis = -Math.max(90, Math.abs(hedef[0] - bas[0]) * 0.35);
        await efekt_.ucur(h('div.ps-ucan-jeton', { html: JETON }), bas, hedef, { ms: 680, gecikme: i * 220, kavis, boy0: 1.1, boy1: 0.55, don: 540 });
        if (kapandi) return;
        bugun++;
        kasaSayi.textContent = String(bugun);
        salla(kasaSayi, 'ps-zipla');
        durumYaz();
        ses.singir(i);
        salla(kasa, 'ps-zipla');
        efekt_.parilti(hedef[0], hedef[1], 5, 0.6);
      }),
    );
    kasa.classList.remove('ps-kasa-acik');
    yerdeJeton = 0;
    el.classList.remove('ps-jeton-var');
    topluyor = false;
  }
  kasa.addEventListener('click', () => {
    efekt.dokunma();
    void jetonTopla();
  });

  /** Temiz tabak kalmadı: servis bekler (ceza yok); Kino "Bana iş ver!" der, bulaşık simgesi parlar */
  let kinoIsDedi = 0;
  function tabakYok() {
    ses.degil();
    salla(temizEl, 'ps-hayir');
    salla(gorevEl, 'ps-ipucu');
    salla(tabakEl, 'ps-hayir');
    if (performance.now() - kinoIsDedi > 6000) {
      kinoIsDedi = performance.now();
      void soyle(P.mino.tabak_yok, 'mino', false);
      void soyle(P.kino.is_ver, 'kino', false);
      void kino.oynat('sevin', 900);
    }
  }

  async function servis(m: PastaMusteri, kaynak: 'tabak' | 'bardak' = 'tabak') {
    const parti: Parti | null = kaynak === 'tabak' ? tabak : hazirBardak ? { urun: 'icecek', sekil: null, parcalar: [], bardak: hazirBardak } : null;
    if (!parti || m.bitti || !m.hazir) return;
    const i = kalemSec(m.sip, m.verilen, parti);
    if (i < 0) return;
    // bulaşık: tatlı temiz bir tabakla gider
    const tabakla = acik.bulasik && kaynak === 'tabak';
    if (tabakla && temiz <= 0) {
      tabakYok();
      return;
    }
    efekt.secim();
    m.verilen[i] = parti;
    let bas: [number, number];
    if (kaynak === 'tabak') {
      bas = efekt_.merkez(tabakEl);
      tabak = bekleyen.shift() ?? null;
      tabakCiz();
      if (tabakla) {
        temiz--;
        bulasikCiz();
      }
    } else {
      bas = efekt_.merkez(bardakYer);
      hazirBardak = null;
      bardakCiz();
    }
    seciliYap(null);
    const hedef = efekt_.merkez(m.el, 0.5, 0.45);
    await efekt_.ucur(h(kaynak === 'tabak' ? 'div.ps-ucan-tabak' : 'div.ps-ucan-bardak', { html: partiCizimi(parti, 'ps-mini').join('') }), bas, hedef, { ms: 520, kavis: -90, boy1: 0.8 });
    if (kapandi) return;
    // yüzlü kurabiye: müşteri o ifadeyi yapar
    const yuz = parti.parcalar.find((p) => p.yuz)?.yuz;
    if (yuz) m.ifadeYap(yuz);
    if (m.verilen.some((v) => !v)) {
      // çok kalemli sipariş: bu kalem alındı (balonda yeşil tik), öteki bekleniyor
      m.kalemAlindi(i);
      ses.tik(2);
      void m.karakter.oynat('sevin', 600);
      return;
    }
    m.bitti = true;
    m.kalemAlindi(i);
    m.el.classList.add('ps-bitti');
    const sonuc = siparisSonucu(m.sip, m.verilen);
    const para = jetonHesapla(sonuc.ayni, m.sabir, m.uyudu);
    m.el.dataset.sonuc = sonuc.ayni ? 'ayni' : 'farkli';
    const [hx, hy] = efekt_.merkez(m.el, 0.5, 0.3);
    if (sonuc.ayni) {
      mutlu++;
      hedefCiz();
      efekt.dogru();
      efekt_.konfeti(hx, hy);
      efekt_.kalpler(hx, hy, 8);
      efekt_.parilti(hx, hy, 10);
      ekranSalla(el, 2.5);
      if (!yuz) m.mutlu(2600);
      mino.tepki('sevinc');
      void soyle(mutlu === ayar.hedef ? [P.mino.tam, P.mino.hedef_tamam] : P.mino.tam);
    } else {
      // farklı olan şey balonda ve tabakta bir an parlar; yine de yer ve sever
      m.karsilastir(sonuc.farklar);
      mino.tepki('sasir');
      await soyle(P.mino.farkli);
      await bekle(1400);
      if (kapandi) return;
      efekt_.kalpler(hx, hy, 4);
      m.mutlu(1600);
    }
    // önce tatlı yenir (içecek varsa onunla birlikte); doğum günü kapkeğinde önce mumlar üflenir
    const tatli = m.verilen.find((v) => v && !v.bardak) ?? m.verilen.find(Boolean)!;
    const mumlu = !tatli.bardak && tatli.parcalar.some((p) => (p.mum ?? 0) > 0);
    if (mumlu) {
      void soyle(P.mino.iyi_ki);
      void soyle(P.musteri.ufle, m);
    }
    await m.ye(partiCizimi(tatli, 'ps-lokma-svg')[0] ?? '', mumlu ? partiCizimi(tatli, 'ps-lokma-svg', true)[0] : undefined);
    if (kapandi) return;
    jetonDussun(m, para.jeton, para.bahsis);
    void soyle(tesekkur(m.ad, m.verilen), m);
    // kirli tabaklar Kino'nun yanına uçar (tabakla verilen her tatlı bir tabak)
    if (acik.bulasik) {
      const n = m.verilen.filter((v) => v && !v.bardak).length;
      for (let k = 0; k < n; k++) {
        void efekt_.ucur(h('div.ps-ucan-tabak-kirli', { html: tabakYigini(1, true) }), efekt_.merkez(m.el, 0.5, 0.6), efekt_.merkez(kirliEl, 0.5, 0.6), { ms: 600, gecikme: k * 120, kavis: -70 }).then(() => {
          if (kapandi) return;
          kirli++;
          bulasikCiz();
          salla(kirliEl, 'ps-zipla');
          if (kirli >= 3 && !yikiyor && performance.now() - kinoIsDedi > 9000) {
            kinoIsDedi = performance.now();
            void soyle(P.kino.is_ver, 'kino', false);
          }
        });
      }
    }
    await m.dans();
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
    varis.delete(m);
    biten++;
    ilerleme.children[biten - 1]?.classList.add('dolu');
    durumYaz();
    if (biten >= MUSTERI_TOPLAM) void gunBitti();
  }
  /** Hedef kalpleri: mutlu müşteri kadar dolu */
  function hedefCiz() {
    hedefEl.dataset.mutlu = String(mutlu);
    [...hedefEl.children].forEach((k, i) => k.classList.toggle('dolu', i < mutlu));
    salla(hedefEl.children[Math.min(mutlu, ayar.hedef) - 1], 'ps-zipla');
  }

  /** Kino bulaşığı yıkar (paralel): köpüklü, ilerleme halkası döner; bitince kirliler temiz tabak olur */
  async function bulasikYika() {
    if (!acik.bulasik || yikiyor || kirli <= 0) return;
    yikiyor = true;
    const n = kirli;
    const ms = TEST_MODU ? 700 : 8000;
    gorevEl.style.setProperty('--sure', `${ms}ms`);
    kinoYer.classList.add('ps-yikiyor');
    bulasikCiz();
    void soyle(P.kino.bulasik, 'kino', false);
    void kino.oynat('sevin', 600);
    const kopukler = window.setInterval(() => !kapandi && ses.kopuk(), 900);
    zamanlar.push(kopukler);
    await bekle(ms);
    clearInterval(kopukler);
    if (kapandi) return;
    kirli -= n;
    temiz += n;
    yikiyor = false;
    kinoYer.classList.remove('ps-yikiyor');
    bulasikCiz();
    // temiz tabaklar servis tabağının yanına uçar
    void efekt_.ucur(h('div.ps-ucan-tabak-kirli', { html: tabakYigini(Math.min(n, 4), false) }), efekt_.merkez(kinoYer, 0.3, 0.7), efekt_.merkez(temizEl), { ms: 600, kavis: -80 });
    salla(temizEl, 'ps-zipla');
    kinoPervane();
    void soyle(P.kino.piril, 'kino', false);
  }
  kinoYer.addEventListener('click', () => {
    if (acik.bulasik && kirli > 0 && !yikiyor) void bulasikYika();
  });

  // içecek makinesi: bardak yoksa yakın plan (doldur), varsa bardak seçilir (sonra müşteriye dokun)
  makineEl?.addEventListener('click', async () => {
    sonDokunus = performance.now();
    if (panelAcik) return;
    if (hazirBardak) {
      efekt.secim();
      seciliYap(secili === 'bardak' ? null : 'bardak');
      if (secili) musteriler.forEach((m) => m.hazir && !m.bitti && salla(m.el, 'ps-cagir'));
      return;
    }
    salla(makineEl, 'ps-bas');
    const hedefK = bekleyenSiparisler()
      .flatMap((m) => m.sip.kalemler.filter((k, i) => k.urun === 'icecek' && !m.verilen[i]))
      .at(0) ?? null;
    const b = await panelle(() => icecekPaneli({ kok: el, efekt: efekt_, soyle: (s, k, o) => soyle(s, k ?? 'mino', o) }, hedefK));
    if (kapandi || !b) return;
    hazirBardak = b;
    bardakCiz();
    salla(bardakYer, 'ps-zipla');
  });

  /** Sıradaki (servis bekleyen) müşteriler, geliş sırasıyla */
  const bekleyenSiparisler = () => musteriler.filter((m) => m.hazir && !m.bitti);

  // ---------------------------------------------------------------- yakın plan paneli açıkken gün durur
  let panelAcik = false;
  async function panelle<T>(f: () => Promise<T>): Promise<T> {
    panelAcik = true;
    const dur = performance.now();
    el.classList.add('ps-panel-acik');
    try {
      return await f();
    } finally {
      // fırın ve sabır kaldığı yerden
      const fark = performance.now() - dur;
      gozler.forEach((g) => g && (g.bas += fark));
      sonGelis += fark;
      son = performance.now();
      panelAcik = false;
      el.classList.remove('ps-panel-acik');
    }
  }
  const MUSTERI_TOPLAM = kuyruk.length;

  // ---------------------------------------------------------------- tezgâh işleri
  const ipucu = (...e: HTMLElement[]) => e.forEach((x) => salla(x, 'ps-ipucu'));
  let kinoHamurDedi = false;

  hamurKabi.addEventListener('click', async () => {
    sonDokunus = performance.now();
    salla(hamurKabi, 'ps-bas');
    if (tepsi.length >= EN_COK_HAMUR) {
      // tepsi dolu: top seker, Kino yakalayıp yer
      ses.kay();
      void kinoYer_(urunSvg({ urun: 'kurabiye', sekil: null, hal: 'top' }), efekt_.merkez(tepsiEl), kinoHamurDedi ? undefined : P.kino.yedim);
      kinoHamurDedi = true;
      return;
    }
    tepsi.push(null);
    const n = tepsi.length;
    ses.plop(n);
    efekt.nota(n - 1);
    tepsiCiz();
    const yeni = tepsiIc.lastElementChild as HTMLElement | null;
    yeni?.classList.add('ps-dustu');
    // kâsedeki hamur kabarıp iner, un tozu havalanır
    salla(hamurKabi, 'ps-kabar');
    const [ux, uy] = efekt_.merkez(hamurKabi, 0.5, 0.25);
    efekt_.pof(ux, uy, 0.45);
  });

  function kalipBas(k: Kalip, b: HTMLElement) {
    sonDokunus = performance.now();
    salla(b, 'ps-bas');
    if (!tepsi.length) {
      ses.degil();
      ipucu(hamurKabi);
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
  }

  /** Tepsi fırına: verilen göz (yoksa ilk boş göz) */
  function firinaKoy(goz?: number): boolean {
    if (!tepsi.length) {
      ses.degil();
      ipucu(hamurKabi);
      return false;
    }
    if (!tepsi.every((k) => k)) {
      ses.degil();
      ipucu(...kalipDugmeleri);
      return false;
    }
    const i = goz ?? gozler.findIndex((g, k) => !g && k < acikGoz);
    if (i < 0 || gozler[i] || i >= acikGoz) {
      ses.degil();
      ipucu(...gozEl.map((g) => g.b));
      return false;
    }
    const kalip = tepsi[0] as Kalip;
    const parti: Parti = { urun: kalip === 'kapkek' ? 'kapkek' : 'kurabiye', sekil: kalip === 'kapkek' ? null : kalip, parcalar: tepsi.map(() => ({ renk: null, yigin: [], susler: [] })) };
    const bas = efekt_.merkez(tepsiEl);
    const resim = tepsiIc.innerHTML;
    tepsi.length = 0;
    tepsiCiz();
    gozler[i] = { parti, bas: performance.now(), hal: 'cig', hatirlatildi: false };
    gozCiz(i);
    efekt.secim();
    void efekt_.ucur(h('div.ps-ucan-tepsi', { html: resim }), bas, efekt_.merkez(gozEl[i].b), { ms: 420, kavis: -50, boy1: 0.7 });
    salla(gozEl[i].b, 'ps-zipla');
    firinDurum();
    return true;
  }
  tepsiEl.addEventListener('click', () => {
    sonDokunus = performance.now();
    salla(tepsiEl, 'ps-bas');
    firinaKoy();
  });

  function gozCiz(i: number) {
    const g = gozler[i];
    const { b, ic } = gozEl[i];
    b.dataset.hal = g ? g.hal : 'bos';
    if (!g) {
      ic.replaceChildren();
      b.style.removeProperty('--hamur');
      b.style.removeProperty('--p');
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
      b.style.setProperty('--hamur', hamurRengi(pisme(gecen, FZ)));
      b.style.setProperty('--p', Math.min(1, gecen / FZ.altin).toFixed(3));
      b.style.setProperty('--y', Math.max(0, Math.min(1, (gecen - FZ.altin) / (FZ.yanik - FZ.altin))).toFixed(3));
      const hal = firinHali(gecen, FZ);
      if (hal === g.hal) {
        // altında bekliyor: bir kez hatırlat
        if (hal === 'altin' && !g.hatirlatildi && gecen - FZ.altin > 3500) {
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
        ses.ding();
        efekt_.isik(x, y, 1.1);
        ekranSalla(el, 1.5);
        efekt_.parilti(x, y, 10);
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
        });
      }
    });
  }

  function gozBas(i: number) {
    sonDokunus = performance.now();
    const g = gozler[i];
    const b = gozEl[i].b;
    if (!g && i >= acikGoz) {
      // kilitli göz: yıldızla açılır
      ses.degil();
      salla(b, 'ps-hayir');
      return;
    }
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
    // altın: tabağa çıkar
    gozler[i] = null;
    gozCiz(i);
    const parti = g.parti;
    efekt_.parilti(...efekt_.merkez(b), 6, 0.7);
    const bas = efekt_.merkez(b);
    efekt.yapis();
    if (tabak) bekleyen.push(parti);
    else tabak = parti;
    void efekt_.ucur(h('div.ps-ucan-tabak', { html: partiCizimi(parti, 'ps-mini').join('') }), bas, efekt_.merkez(tabakEl), { ms: 480, kavis: -70 }).then(() => {
      if (kapandi) return;
      tabakCiz();
      salla(tabakEl, 'ps-zipla');
    });
    tabakCiz();
  }

  /**
   * Krema: kurabiyede ilk dokunuş süsleme masasını açar (siparişteki desen parmakla çizilir, yüz yapılır, serpinti
   * sallanır); sonraki dokunuşlar yalnız rengi değiştirir. Kapkekte her dokunuş bir yığın; doğum günü kapkeğinde
   * yığınlar tamamlanınca mum masası açılır.
   */
  function kremaBas(r: Renk, b: HTMLElement) {
    sonDokunus = performance.now();
    salla(b, 'ps-sik');
    hareketIzniIste();
    if (panelAcik) return;
    if (!tabak) {
      ses.degil();
      ipucu(tabakEl);
      return;
    }
    const parti = tabak;
    const [x, y] = efekt_.merkez(tabakEl, 0.5, 0.35);
    const hedefK = hedefKalem(bekleyenSiparisler(), parti, r);
    const adimlar: Adim[] = [];
    if (parti.urun === 'kurabiye') {
      const ilk = parti.parcalar.every((p) => !p.renk);
      parti.parcalar.forEach((p) => (p.renk = r));
      if (ilk) {
        const desen = hedefK?.desen ?? 'duz';
        if (desen !== 'duz') {
          adimlar.push({ tur: 'desen', desen, renk: r });
          parti.parcalar.forEach((p) => (p.desen = desen));
        }
        if (hedefK?.yuz) adimlar.push({ tur: 'yuz', yuz: hedefK.yuz });
        adimlar.push({ tur: 'serpinti' });
      }
    } else {
      let tasti = false;
      for (const p of parti.parcalar) {
        if (p.yigin.length < EN_COK_YIGIN) p.yigin.push(r);
        else tasti = true;
      }
      if (tasti) {
        ses.kay();
        void kinoYer_(urunSvg({ urun: 'kapkek', sekil: null, hal: 'pismis', yigin: [r] }), [x, y], P.kino.yedim);
      }
      const p0 = parti.parcalar[0];
      if (hedefK?.mum && !p0.mum && p0.yigin.length >= hedefK.yigin) adimlar.push({ tur: 'mum' });
    }
    ses.fis();
    efekt_.pof(x, y, 0.8, '#fff');
    tabakCiz();
    tabakIc.classList.remove('ps-kremalandi');
    void tabakIc.offsetWidth;
    tabakIc.classList.add('ps-kremalandi');
    if (adimlar.length) {
      void panelle(() => susle({ kok: el, efekt: efekt_, soyle: (s, k, o) => soyle(s, k ?? 'mino', o) }, parti, hedefK, adimlar)).then(() => {
        if (kapandi) return;
        tabakCiz();
        salla(tabakEl, 'ps-zipla');
      });
    }
  }

  let susSira = 0;
  function susBas(s: Sus, b: HTMLElement) {
    sonDokunus = performance.now();
    salla(b, 'ps-bas');
    if (!tabak) {
      ses.degil();
      ipucu(tabakEl);
      return;
    }
    const enAz = tabak.parcalar.reduce((a, p, i) => (p.susler.length < tabak!.parcalar[a].susler.length ? i : a), 0);
    const hedefParca = tabak.parcalar[enAz];
    const [x, y] = efekt_.merkez(tabakEl, 0.5, 0.35);
    const bas = efekt_.merkez(b, 0.5, 0.3);
    if (hedefParca.susler.length >= EN_COK_SUS) {
      // sığmadı: kayıp düşer, Kino yakalar
      ses.kay();
      void kinoYer_(susIkon(s), [x, y], P.kino.yedim);
      return;
    }
    hedefParca.susler.push(s);
    ses.tik(susSira++);
    void efekt_.ucur(h('div.ps-ucan-sus', { html: susIkon(s) }), bas, [x, y], { ms: 360, kavis: -50, boy1: 0.8 });
    tabakCiz();
  }

  // tabak: dokun → seç (sonra müşteriye dokun); ya da müşteriye sürükle
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
      if (m) {
        tabakIc.style.transform = '';
        void servis(m, 'tabak');
      } else geriGonder(tabakIc);
      window.setTimeout(() => (surukleniyor = false), 50);
    },
  });
  tabakEl.addEventListener('pointerdown', (e) => {
    sonX = e.clientX;
    sonY = e.clientY;
  });
  tabakEl.addEventListener('click', () => {
    sonDokunus = performance.now();
    if (surukleniyor) return;
    if (!tabak) {
      ses.degil();
      return;
    }
    efekt.secim();
    seciliYap(secili === 'tabak' ? null : 'tabak');
    if (secili) musteriler.forEach((m) => m.hazir && !m.bitti && salla(m.el, 'ps-cagir'));
  });

  // Kino ara sıra süs kabından gizlice bir çilek aşırır (Gün 2'den itibaren, günde bir kez)
  let cilekAsirildi = gun < 2 || (TEST_MODU && q.get('cilek') !== '1');
  const cilekZamani = performance.now() + (TEST_MODU ? 1500 : 35000 + Math.random() * 40000);
  function cilekAsir(simdi: number) {
    if (cilekAsirildi || simdi < cilekZamani || simdi - sonDokunus < 1500 || !tabak) return;
    const p = tabak.parcalar.find((x) => x.susler.includes('cilek'));
    if (!p) return;
    cilekAsirildi = true;
    p.susler.splice(p.susler.lastIndexOf('cilek'), 1);
    const kab = susDugmeleri[acik.susler.indexOf('cilek')];
    tabakCiz();
    salla(tabakEl, 'ps-hayir');
    void kinoYer_(susIkon('cilek'), efekt_.merkez(tabakEl, 0.5, 0.3));
    kinoCilekAgiz(6000);
    kab?.classList.add('ps-eksik');
    sonra(sure(2600), () => kab?.classList.remove('ps-eksik'));
    mino.tepki('sasir');
    void soyle(P.mino.cilek_eksik);
  }

  // ---------------------------------------------------------------- zaman
  let son = performance.now();
  const tikZaman = window.setInterval(() => {
    if (kapandi || !calisiyor || panelAcik) return;
    const simdi = performance.now();
    const dt = simdi - son;
    son = simdi;
    firinTik(simdi);
    for (const m of musteriler) if (m.hazir && !m.bitti && !m.uyuyor) m.sabirGuncelle(m.sabir + dt / sabirSure);
    // yeni müşteri: boş yer varsa (hiç kimse yoksa hemen, yoksa aralıkla)
    const bekleyenMusteri = musteriler.filter((m) => !m.bitti).length;
    if (kuyruk.length && musteriler.length < EN_COK_MUSTERI && (bekleyenMusteri === 0 ? simdi - sonGelis > (TEST_MODU ? 200 : 1800) : simdi - sonGelis > (bekleyenMusteri === 1 ? aralik * 0.65 : aralik))) void musteriGelsin();
    cilekAsir(simdi);
    if (musteriler.some((m) => m.uyuyor)) uyuyanOldu = true;
    // kafası karışık müşteri: hamur tepsideyken ya da fırındayken (krema öncesi) fikrini değiştirir
    for (const m of musteriler) {
      const v = varis.get(m);
      if (!m.sip.degisim || !v || m.bitti || m.verilen.some(Boolean) || bekleyenSoz > 0) continue;
      const hamurVar = tepsi.length > 0 || gozler.some(Boolean);
      if ((hamurVar && simdi - v > (TEST_MODU ? 300 : 2500)) || simdi - v > (TEST_MODU ? 60000 : 16000)) void fikirDegistir(m);
    }
    durumYaz();
  }, 100);
  let uyuyanOldu = false;
  function durumYaz() {
    if (ozel) el.dataset.durum = JSON.stringify({ biten, gelen, kuyruk: kuyruk.length, bugun, yerdeJeton, mutlu, temiz, kirli, uyuyanOldu, panel: panelAcik });
  }

  // ---------------------------------------------------------------- günün sonu
  async function gunBitti() {
    calisiyor = false;
    await bekle(400);
    if (yerdeJeton) await jetonTopla(true);
    if (kapandi) return;
    await soyle(P.mino.bitti);
    mino.tepki('dans');
    await bekle(900);
    const yildiz = yildizHesapla(mutlu, ayar.hedef, uyuyanOldu);
    if (!kapandi) app.git('aksam', { gun, kazanc: bugun, yildiz, mutlu });
  }

  // ---------------------------------------------------------------- açılış: otobüs parka gelir
  const giris = otobusGirisi(el, () => {
    calisiyor = true;
    son = performance.now();
  });
  void soyle(P.mino.geldi);
  // günün hedefi: "Bugün beş mutlu müşteri!"
  const hedefSoz = (P.mino.hedef as Record<string, string>)[String(ayar.hedef)];
  if (hedefSoz) void soyle(hedefSoz);
  tepsiCiz();
  tabakCiz();
  bulasikCiz();
  bardakCiz();
  if (ozel) (window as unknown as Record<string, unknown>).__pastaGun = { kuyruk, musteriler, gozler, get tabak() { return tabak; } };

  return {
    el,
    kapat() {
      kapandi = true;
      calisiyor = false;
      clearInterval(tikZaman);
      zamanlar.forEach(clearTimeout);
      giris.kapat();
      surukleBitir();
      minoCanli.kapat();
      mino.kapat();
      kino.kapat();
      musteriler.forEach((m) => m.kapat());
    },
  };
}

/**
 * Otobüs parka gelir: soldan yuvarlanarak gelir, durur (esneyip basılır), korna; yan kapağı yukarı açılıp tente olur,
 * tezgâh kayarak çıkar, Mino kapağın içinde el sallar; sonra kadraj kapağa yaklaşır ve tezgâh görünür.
 */
function otobusGirisi(ekran: HTMLElement, bitti: () => void): { kapat: () => void } {
  const mino = new Mino();
  minoSapkaTak(mino);
  const otobus = h('div.ps-otobus', { html: OTOBUS }, h('div.ps-giris-mino', {}, mino.el));
  const katman = h('div.ps-giris', { 'aria-hidden': 'true' }, ...parkKatmanlari((ekran.dataset.yer ?? 'park') as Yer), h('div.ps-giris-sahne', {}, otobus));
  ekran.append(katman);
  const sakin = AZ_HAREKET || TEST_MODU;
  const minoKopya = otobus.querySelector('.ps-giris-mino')!;
  let kapandi = false;
  const kapat = () => {
    kapandi = true;
    mino.kapat();
    katman.remove();
  };
  void (async () => {
    if (sakin) {
      await new Promise((r) => setTimeout(r, TEST_MODU ? 60 : 300));
      if (kapandi) return;
      kapat();
      bitti();
      return;
    }
    const tekerler = [...otobus.querySelectorAll<SVGGElement>('.ps-ob-teker')];
    const donus = tekerler.map((t) => t.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(720deg)' }], { duration: 1600, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }));
    await otobus
      .animate(
        [
          { transform: 'translateX(-120vw) rotate(0deg)' },
          { transform: 'translateX(4%) rotate(-1.5deg)', offset: 0.82 },
          { transform: 'translateX(-1%) rotate(1deg)', offset: 0.92 },
          { transform: 'translateX(0) rotate(0deg)' },
        ],
        { duration: 1700, easing: 'cubic-bezier(.25,.6,.35,1)', fill: 'both' },
      )
      .finished.catch(() => undefined);
    donus.forEach((d) => d.cancel());
    ses.korna();
    otobus.querySelector('.ps-ob-govde')?.animate([{ transform: 'none' }, { transform: 'translateY(6px) scale(1.02, .96)' }, { transform: 'none' }], { duration: 380, easing: 'ease-out' });
    await new Promise((r) => setTimeout(r, 300));
    // kapak açılır (tente olur), tezgâh çıkar
    ses.vuup();
    otobus.classList.add('ps-acik');
    await new Promise((r) => setTimeout(r, 650));
    if (kapandi) return;
    ses.pof();
    minoKopya.classList.add('ps-goster');
    mino.tepki('selam');
    await new Promise((r) => setTimeout(r, 1500));
    if (kapandi) return;
    // kadraj kapağa yaklaşır
    await katman
      .animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.4) translateY(6%)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' })
      .finished.catch(() => undefined);
    if (kapandi) return;
    kapat();
    bitti();
  })();
  return { kapat };
}

/** Kilitli fırın gözü: asma kilit ve yıldız (yıldızla açılır) */
const GOZ_KILIT = `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M19 28V21A11 11 0 0 1 41 21V28" fill="none" stroke="#6b3a1f" stroke-width="6"/><path d="M19 28V21A11 11 0 0 1 41 21V28" fill="none" stroke="#C9D4DE" stroke-width="3"/><rect x="12" y="27" width="36" height="26" rx="7" fill="#FFD23F" stroke="#6b3a1f" stroke-width="3.4"/><path d="M30 32l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8z" fill="#fff" stroke="#C47F00" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
