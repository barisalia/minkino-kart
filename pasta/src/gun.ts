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
import { FIRIN_GOVDE, HAMUR_KABI, JETON, KASA, KINO_CILEK_AGIZ, KINO_UN, MINO_SAPKA, OKUL, OTOBUS, TABAK, TEPSI, kalipSvg, kremaSvg, susIkon, susKabiSvg, urunSvg } from './cizim';
import { AZ_HAREKET, Efekt, parkAdres, salla } from './gorsel';
import { kayit } from './kayit';
import {
  acikOlanlar,
  BOYA,
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
/** Park katmanları (gökyüzü-tepeler, ağaçlar ya da okul, çimen) */
export function parkKatmanlari(yer: 'park' | 'okul'): HTMLElement[] {
  const arka = (ad: string, sinif: string) => h(`div.${sinif}`, { style: `background-image:url("${parkAdres(ad)}")` });
  return [arka('arka-uzak', 'ps-gok'), yer === 'okul' ? h('div.ps-orta.ps-okul', { html: OKUL }) : arka('arka-orta', 'ps-orta'), arka('arka-on', 'ps-on')];
}

export function gunEkrani(app: Uygulama, p: { gun?: Gun } = {}): Ekran {
  const gun = (p.gun ?? 1) as Gun;
  const ozel = ozelMi();
  const ayar = GUNLER[gun];
  const acik = acikOlanlar(gun, kayit.alinan);
  const FZ = firinZamani();
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
  mino.el.addEventListener('pointerdown', () => mino.tepki('gidik'));
  minoSapkaTak(mino);
  const minoYer = h('div.ps-mino-yer', {}, mino.el);
  const kinoYer = h('div.ps-kino-yer', { 'data-karakter-kap': 'kino' }, kino.el);
  kinoYer.addEventListener('pointerdown', () => {
    efekt.dokunma();
    void kino.oynat('sevin', 900);
    if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 900);
  });
  const sahne = h('div.ps-sahne', {}, ...parkKatmanlari(ayar.yer), musteriKatmani, h('div.ps-cerceve', { 'aria-hidden': 'true' }, h('i.ps-tente')), minoYer, kinoYer);

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
  const gozEl = Array.from({ length: FIRIN_GOZ }, (_, i) => {
    const ic = h('div.ps-goz-ic');
    const b = h('button.ps-goz', { type: 'button', 'data-goz': String(i), 'data-hal': 'bos', 'aria-label': `Fırın ${i + 1}` }, h('div.ps-goz-cam', {}, h('i.ps-goz-isik'), ic), h('i.ps-goz-saat'));
    b.addEventListener('click', () => gozBas(i));
    return { b, ic };
  });
  const firin = h('div.ps-firin', { html: FIRIN_GOVDE }, h('div.ps-gozler', {}, ...gozEl.map((g) => g.b)));

  // krema, süs
  const kremaDugmeleri = acik.renkler.map((r) => {
    const b = h('button.ps-krema-sise', { type: 'button', 'data-renk': r, 'aria-label': r, html: kremaSvg(r) });
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
  let secili = false;
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
    if (!tabak) seciliYap(false);
  };

  const istasyon = (ad: string, ...c: HTMLElement[]) => h(`div.ps-ist.ps-ist-${ad}`, {}, ...c);
  const tezgah = h(
    'div.ps-tezgah',
    {},
    jetonKatmani,
    istasyon('hamur', hamurKabi, tepsiEl),
    istasyon('kalip', h('div.ps-izgara', { 'data-n': String(kalipDugmeleri.length) }, ...kalipDugmeleri)),
    istasyon('firin', firin),
    istasyon('krema', h('div.ps-izgara', { 'data-n': String(kremaDugmeleri.length) }, ...kremaDugmeleri)),
    istasyon('sus', h('div.ps-izgara', { 'data-n': String(susDugmeleri.length) }, ...susDugmeleri)),
    istasyon('tabak', bekleyenEl, tabakEl),
  );

  // ---------------------------------------------------------------- üst çubuk: gün, ilerleme, kasa
  let bugun = 0;
  let yerdeJeton = 0;
  const kasaSayi = h('b.ps-kasa-sayi', {}, '0');
  const kasa = h('button.ps-kasa', { type: 'button', 'aria-label': 'Kasa', html: KASA }, kasaSayi);
  const ilerleme = h('div.ps-ilerleme', { 'aria-hidden': 'true' }, ...Array.from({ length: kuyruk.length }, () => h('i')));
  const gunEtiket = h('div.ps-gun-etiket', {}, h('b', {}, P.arayuz.gun.replace('{gun}', String(gun))), ilerleme);
  const cikis = () => app.git('acilis');
  const ust = h('div.ust-cubuk.ps-ust', {}, yuvarlakDugme(IKON.geri, 'Geri', cikis, 'kucuk'), h('div.orta', {}, gunEtiket), kasa, sesDugmesi());

  const el = h('div.ps-gun', { 'data-gun': String(gun), 'data-yer': ayar.yer }, sahne, tezgah, ust, efekt_.el);
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

  async function musteriGelsin() {
    const yer = yerindeki.findIndex((x) => !x);
    const i = siradakiIndeks(kuyruk, musteriler.map((m) => m.ad));
    if (yer < 0 || i < 0) return;
    const sip = kuyruk.splice(i, 1)[0];
    const m = new PastaMusteri(sip, TAVSAN_RESMI);
    if (ozel) m.el.dataset.siparis = JSON.stringify(sip);
    musteriler.push(m);
    yerindeki[yer] = m;
    gelen++;
    sonGelis = performance.now();
    yerler[yer].replaceChildren(m.el);
    m.el.addEventListener('click', () => musteriBas(m));
    // soldan, ekranın dışından yürüyerek gelir
    const bas = -(yerler[yer].offsetLeft + yerler[yer].offsetWidth + 30);
    window.setTimeout(() => minoCanli.karsila(), sure(400));
    await m.gel(bas);
    if (kapandi) return;
    // Mino siparişi bir kez okur (mantık siparişini müşteri kendisi söyler)
    mino.bak(-0.6);
    if (m.sip.mantik) {
      await soyle(P.mino.hosgeldin);
      await soyle(okuma(m.sip), m);
    } else await soyle([P.mino.hosgeldin, ...okuma(m.sip)]);
    mino.bak(0);
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
    if (secili && tabak) {
      void servis(m);
      return;
    }
    // siparişi bir daha dinlet
    m.dikkat();
    void soyle(m.sip.mantik ? okuma(m.sip) : okuma(m.sip), m.sip.mantik ? m : 'mino', false);
  }

  function seciliYap(acik: boolean) {
    secili = acik && !!tabak;
    tabakEl.classList.toggle('ps-secili', secili);
    el.classList.toggle('ps-servis', secili);
  }

  /** Jetonlar müşterinin önünde tezgâha düşer */
  function jetonDussun(m: PastaMusteri, adet: number, bahsis: number) {
    const r = m.el.getBoundingClientRect();
    const k = jetonKatmani.getBoundingClientRect();
    const x = ((r.left + r.width / 2 - k.left) / Math.max(1, k.width)) * 100;
    for (let i = 0; i < adet + bahsis; i++) {
      // jetonlar yalnız görüntü (müşterilerin önünü kapatmasın); kasaya dokununca toplanır
      const j = h(`i.ps-jeton${i >= adet ? '.ps-bahsis' : ''}`, { 'aria-hidden': 'true', html: JETON, style: `left:calc(${x.toFixed(1)}% + ${((i - (adet + bahsis - 1) / 2) * 30).toFixed(0)}px);--i:${i}` });
      jetonKatmani.append(j);
      yerdeJeton++;
      window.setTimeout(() => !kapandi && ses.singir(i), sure(260 + i * 90));
    }
    el.classList.add('ps-jeton-var');
  }

  /** Tezgâhtaki jetonlar kasaya uçar; Mino sayar */
  let topluyor = false;
  async function jetonTopla(sessiz = false) {
    const js = [...jetonKatmani.querySelectorAll<HTMLElement>('.ps-jeton')];
    if (!js.length || topluyor) return;
    topluyor = true;
    sonDokunus = performance.now();
    const hedef = efekt_.merkez(kasa);
    if (!sessiz) void soyle(js.map((_, i) => sayiSozu(i + 1)), 'mino', false);
    await Promise.all(
      js.map(async (j, i) => {
        const bas = efekt_.merkez(j);
        j.remove();
        await efekt_.ucur(h('div.ps-ucan-jeton', { html: JETON }), bas, hedef, { ms: 600, gecikme: i * 260, kavis: -90, boy1: 0.6, don: 360 });
        if (kapandi) return;
        bugun++;
        kasaSayi.textContent = String(bugun);
        durumYaz();
        ses.singir(i);
        salla(kasa, 'ps-zipla');
        efekt_.parilti(hedef[0], hedef[1], 4, 0.5);
      }),
    );
    yerdeJeton = 0;
    el.classList.remove('ps-jeton-var');
    topluyor = false;
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
    efekt.secim();
    m.verilen[i] = parti;
    const bas = efekt_.merkez(tabakEl);
    tabak = bekleyen.shift() ?? null;
    tabakCiz();
    seciliYap(false);
    const hedef = efekt_.merkez(m.el, 0.5, 0.45);
    await efekt_.ucur(h('div.ps-ucan-tabak', { html: partiCizimi(parti, 'ps-mini').join('') }), bas, hedef, { ms: 520, kavis: -90, boy1: 0.8 });
    if (kapandi) return;
    if (m.verilen.some((v) => !v)) {
      // çok kalemli sipariş: bu kalem alındı, öteki bekleniyor
      m.kalemAlindi(i);
      ses.tik(2);
      void m.karakter.oynat('sevin', 600);
      return;
    }
    m.bitti = true;
    m.el.classList.add('ps-bitti');
    const sonuc = siparisSonucu(m.sip, m.verilen);
    const para = jetonHesapla(sonuc.ayni, m.sabir, m.uyudu);
    m.el.dataset.sonuc = sonuc.ayni ? 'ayni' : 'farkli';
    const [hx, hy] = efekt_.merkez(m.el, 0.5, 0.3);
    if (sonuc.ayni) {
      efekt.dogru();
      efekt_.kalpler(hx, hy, 6);
      efekt_.parilti(hx, hy, 10);
      m.mutlu();
      mino.tepki('sevinc');
      void soyle(P.mino.tam);
    } else {
      // farklı olan şey balonda ve tabakta bir an parlar; yine de yer ve sever
      m.karsilastir(sonuc.farklar);
      mino.tepki('sasir');
      await soyle(P.mino.farkli);
      await bekle(1400);
      if (kapandi) return;
      efekt_.kalpler(hx, hy, 3);
    }
    const ilk = m.verilen.find(Boolean)!;
    await m.ye(partiCizimi(ilk, 'ps-lokma-svg')[0] ?? '');
    if (kapandi) return;
    jetonDussun(m, para.jeton, para.bahsis);
    void soyle(tesekkur(m.ad, m.verilen), m);
    await m.dans();
    if (kapandi) return;
    minoCanli.ugurla();
    // sağa yürüyerek gider
    const yer = yerindeki.indexOf(m);
    const genislik = sahne.clientWidth;
    await m.git(genislik - (yerler[yer]?.offsetLeft ?? 0) + 40);
    m.kapat();
    m.el.remove();
    if (yer >= 0) yerindeki[yer] = null;
    musteriler.splice(musteriler.indexOf(m), 1);
    biten++;
    ilerleme.children[biten - 1]?.classList.add('dolu');
    durumYaz();
    if (biten >= MUSTERI_TOPLAM) void gunBitti();
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
    const i = goz ?? gozler.findIndex((g) => !g);
    if (i < 0 || gozler[i]) {
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
      return;
    }
    ic.replaceChildren(...g.parti.parcalar.map((_, k) => h('i.ps-goz-parca', { style: `--i:${k}`, html: urunSvg({ urun: g.parti.urun, sekil: g.parti.sekil, hal: g.parti.urun === 'kapkek' ? 'pismis' : 'pismis' }) })));
    ic.dataset.adet = String(g.parti.parcalar.length);
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
      const [x, y] = efekt_.merkez(b);
      if (hal === 'altin') {
        ses.ding();
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
          const resim = urunSvg({ urun: g2.parti.urun, sekil: g2.parti.sekil, hal: 'pismis', hamur: '#7B4526' });
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

  function kremaBas(r: Renk, b: HTMLElement) {
    sonDokunus = performance.now();
    salla(b, 'ps-sik');
    if (!tabak) {
      ses.degil();
      ipucu(tabakEl);
      return;
    }
    const [x, y] = efekt_.merkez(tabakEl, 0.5, 0.35);
    if (tabak.urun === 'kurabiye') {
      tabak.parcalar.forEach((p) => (p.renk = r));
    } else {
      let tasti = false;
      for (const p of tabak.parcalar) {
        if (p.yigin.length < EN_COK_YIGIN) p.yigin.push(r);
        else tasti = true;
      }
      if (tasti) {
        ses.kay();
        void kinoYer_(urunSvg({ urun: 'kapkek', sekil: null, hal: 'pismis', yigin: [r] }), [x, y], P.kino.yedim);
      }
    }
    ses.fis();
    efekt_.pof(x, y, 0.8, '#fff');
    tabakCiz();
    tabakIc.classList.remove('ps-kremalandi');
    void tabakIc.offsetWidth;
    tabakIc.classList.add('ps-kremalandi');
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
  const musteriAt = (x: number, y: number) =>
    musteriler.find((m) => {
      if (!m.hazir || m.bitti) return false;
      const r = m.el.getBoundingClientRect();
      return x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20;
    }) ?? null;
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
        void servis(m);
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
    seciliYap(!secili);
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
    if (kapandi || !calisiyor) return;
    const simdi = performance.now();
    const dt = simdi - son;
    son = simdi;
    firinTik(simdi);
    for (const m of musteriler) if (m.hazir && !m.bitti && !m.uyuyor) m.sabirGuncelle(m.sabir + dt / sabirSure);
    // yeni müşteri: boş yer varsa (hiç kimse yoksa hemen, yoksa aralıkla)
    const bekleyenMusteri = musteriler.filter((m) => !m.bitti).length;
    if (kuyruk.length && musteriler.length < EN_COK_MUSTERI && (bekleyenMusteri === 0 ? simdi - sonGelis > (TEST_MODU ? 200 : 1800) : simdi - sonGelis > (bekleyenMusteri === 1 ? aralik * 0.65 : aralik))) void musteriGelsin();
    cilekAsir(simdi);
    durumYaz();
  }, 100);
  function durumYaz() {
    if (ozel) el.dataset.durum = JSON.stringify({ biten, gelen, kuyruk: kuyruk.length, bugun, yerdeJeton });
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
    if (!kapandi) app.git('aksam', { gun, kazanc: bugun });
  }

  // ---------------------------------------------------------------- açılış: otobüs parka gelir
  const giris = otobusGirisi(el, () => {
    calisiyor = true;
    son = performance.now();
  });
  void soyle(P.mino.geldi);
  tepsiCiz();
  tabakCiz();
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
  const katman = h('div.ps-giris', { 'aria-hidden': 'true' }, ...parkKatmanlari(ekran.dataset.yer === 'okul' ? 'okul' : 'park'), h('div.ps-giris-sahne', {}, otobus));
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
