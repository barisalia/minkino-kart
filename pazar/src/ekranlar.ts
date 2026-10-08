/** Mino'nun Pazarı ekranları: açılış, pazar (5 müşteri), şenlik */
import P from '../../content/pazar.json';
import { resimSesi, resimSesiHazirla } from '../../canlan/src/ses';
import { efekt, konus } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import type { Yas } from '../../src/engine/types';
import { bekle, h, karistir, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Mino } from '../../src/mino/mino';
import { balonlar, canliSahne, havaiFisek } from './canli';
import { BARDAK_IKON } from './blender';
import { adres, boing, flamaYerlestir, parilti, resim, tozKalkar } from './gorsel';
import { MinoCanli } from './mino-canli';
import { odulSesi } from './meyvesuyu-ses';
import { kaydet, kayit } from './ilerleme';
import { agirlik, urunRengi, denetle, istekUret, MUSTERI_SAYISI, PARA, paraMi, urunAdi, uygunMu, type Istek, type Tur } from './istek';
import { Musteri, musteriHazirla } from './musteri';
import { pazarSarkisi, type PazarSarkisi } from './sarki';
import { Terazi } from './terazi';
import { geriGonder, surukle, tasi } from './surukle';
import { Kamera, type Kutu } from './kamera';
import { Karakter } from '../../src/karakter/karakter';

const A = P.arayuz;
const RENK_KODU = P.renk_kodu as Record<string, string>;
const yas = (): Yas => durum.i.yas ?? 4;
const rastgele = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const bosluk = () => h('div', { style: 'width:72px' });

/** Tasarımcının görseli geldiyse arka plan olarak (yoksa CSS yer tutucu); yatay telefon için geniş hâli de (yol-genis) */
export function gorselStil(yol: string): string | undefined {
  const url = adres(yol);
  const genis = adres(`${yol}-genis`);
  return url ? `--resim:url("${url}")${genis ? `;--resim-genis:url("${genis}")` : ''}` : undefined;
}

/**
 * Oyun ekranının kamerası: stand + müşteri katmanı yaklaşır; gökyüzü, uzak yayalar ve pazar resmi daha az
 * (derinlik). Odak alanı: üst çubuğun altı ile ön tezgâhın üstü (yatay telefonda bandın biraz dışına taşar).
 */
export function oyunKamerasi(el: HTMLElement, sahne: HTMLElement, kamera: HTMLElement, tezgah: HTMLElement, zemin: HTMLElement, arka: HTMLElement, ufuk: HTMLElement): Kamera {
  const ustCubuk = el.querySelector('.ust-cubuk');
  const yildizlar = el.querySelector('.pz-yildizlar');
  const alan = (tam: boolean) => {
    const e = el.getBoundingClientRect();
    // tezgâhın kayıp gitmeden önceki üst kenarı (offsetTop: kayma dönüşümünden etkilenmez)
    const altY = tam ? e.bottom - 4 : e.top + tezgah.offsetTop;
    const s = sahne.getBoundingClientRect();
    if (YATAY_TELEFON()) {
      // yıldız rafı üstte ortada: odak onun altından başlar
      const pay = Math.max(0, s.left - e.left) * 0.4;
      const ust = (yildizlar?.getBoundingClientRect().bottom ?? e.top) + 4;
      return new DOMRect(s.left - pay, ust, s.width + 2 * pay, Math.max(40, altY - ust));
    }
    const ust = Math.max(ustCubuk?.getBoundingClientRect().bottom ?? e.top, yildizlar?.getBoundingClientRect().bottom ?? e.top) + 6;
    return new DOMRect(e.left + 6, ust, e.width - 12, Math.max(40, altY - ust));
  };
  const kam = new Kamera(
    sahne,
    kamera,
    [
      { el: zemin, k: 0.22 },
      { el: arka, k: 0.3 },
      { el: ufuk, k: 0.5 },
    ],
    alan,
    (gizli) => el.classList.toggle('pz-tezgah-gizli', gizli),
  );
  // tam ekran yakın çekimde (tezgâh aşağıda) çocuk ekranın herhangi bir yerine dokununca tezgâh hemen geri gelir
  el.addEventListener('pointerdown', () => el.classList.contains('pz-tezgah-gizli') && el.classList.contains('pz-aktif') && kam.genis(450), true);
  return kam;
}
/**
 * Ön tezgâh: ürünlerin durduğu büyük ahşap masa (pazar/on-tezgah.webp çizimi: arka kenarında yuvarlak tahta,
 * üstten bakılan tahtalar). Çizim kenarları bozulmadan esner (border-image). Görsel yoksa CSS ahşap.
 */
export function onTezgah(...cocuklar: HTMLElement[]): HTMLElement {
  const url = adres('pazar/on-tezgah');
  return h(`div.pz-tezgah${url ? '.pz-gorselli' : ''}`, { style: url ? `--tz:url("${url}")` : undefined }, url ? h('i.pz-tezgah-resim', { 'aria-hidden': 'true' }) : null, ...cocuklar);
}

/** yatay.css ile aynı koşul: alçak yatay ekran (telefon yan) */
export const YATAY_TELEFON = () => typeof matchMedia !== 'undefined' && matchMedia('(min-aspect-ratio: 13/10) and (max-height: 540px)').matches;

/** Müşterinin kamera kutusu: balonla (istek) ya da balonsuz (yerken, içerken) */
export function musteriKutusu(kam: Kamera, kap: HTMLElement, balonlu: boolean): Kutu {
  // yakın çekim belden yukarı: yüz ve balon ekranı doldurur
  return kam.kutu(kap, balonlu ? { ust: 0.62, sag: 0.25, alt: -0.45 } : { ust: 0.05, alt: -0.38, sol: 0.05, sag: 0.05 });
}

/** Bir öğenin ekrandaki yeri, kabın kutusuna göre (0..1): parıltı / konfeti kamera yaklaşmışken de doğru yerde */
export function oran(e: Element, kap: Element, oy = 0.5): [number, number] {
  const a = e.getBoundingClientRect();
  const b = kap.getBoundingClientRect();
  return [(a.left + a.width / 2 - b.left) / (b.width || 1), (a.top + a.height * oy - b.top) / (b.height || 1)];
}

/** Bozuk para: görsel varsa üstüne rakam yazılır, yoksa CSS ile yuvarlak para */
function paraEl(id: keyof typeof PARA): HTMLElement {
  const url = adres(`pazar/${id}`);
  return h(`div.pz-para.pz-${id}${url ? '.pz-gorselli' : ''}`, { role: 'img', 'aria-label': A.lira.replace('{sayi}', String(PARA[id])) }, url ? h('img', { src: url, alt: '', draggable: 'false' }) : null, h('b', {}, String(PARA[id])));
}

function urunResmi(id: string): HTMLElement {
  return paraMi(id) ? paraEl(id) : resim(`meyveler/${id}`, '', urunAdi(id));
}

function logo(): HTMLElement {
  const harfler = [...A.baslik_alt].map((c, i) => h('span', { style: `--i:${i}` }, c));
  return h('div.pz-logo', { role: 'img', 'aria-label': `${A.baslik_ust} ${A.baslik_alt}` }, h('span.pz-logo-ust', {}, A.baslik_ust), h('span.pz-logo-alt', {}, ...harfler));
}

/**
 * Pazar standı (tasarımcının pazar/tezgah.webp çizimi: tente, direkler, tahta). Üç katman:
 * arkada bütün stand, ortada içindekiler (Mino, standın içinde), önde tente ve tahta (Mino tahtanın arkasında kalır).
 * "ustunde" tahtanın üstüne konanlar (sepet, meyveler) en öndedir. Görsel yoksa CSS yer tutucu.
 */
export function stand(icinde: HTMLElement[], ustunde: HTMLElement[] = []): HTMLElement {
  const url = adres('pazar/tezgah');
  const katman = (sinif: string) =>
    url ? h(`img.pz-stand-katman.${sinif}`, { src: url, alt: '', draggable: 'false' }) : h(`div.pz-stand-katman.pz-stand-yedek.${sinif}`);
  return h('div.pz-stand', {}, katman('pz-stand-arka'), ...icinde, katman('pz-stand-tente'), katman('pz-stand-tahta'), ...ustunde);
}

// ---------------------------------------------------------------- Açılış
export function acilisEkrani(app: Uygulama): Ekran {
  const mino = new Mino();
  // Mino tezgâhın arkasından el sallar; dokununca zıplar
  const selam = setTimeout(() => mino.tepki('selam'), sure(500));
  mino.el.addEventListener('pointerdown', () => mino.tepki('zipla'));
  // boşta durmaz: meyveleri düzeltir, yayalara bakar, mırlar
  const minoCanli = new MinoCanli(mino, { urunVar: () => true, musteriVar: () => false });
  // ekran değişince (git → sus) konuşma kesilir: hoş geldin cümlesi bitmeden geçilmez; ikinci dokunuş yok sayılır
  let gidiliyor = false;
  let kapali = false;
  const oyna =h('button.dugme.pz-oyna', { type: 'button' }, svg(IKON.oyna), A.oyna);
  oyna.addEventListener('click', async () => {
    if (gidiliyor) return;
    gidiliyor = true;
    efekt.secim();
    clearTimeout(selam);
    mino.tepki('selam');
    // kayıt ~1.8 sn; kayıt/cihaz sesi takılırsa en çok 3.5 sn beklenir
    await Promise.race([konus(P.hosgeldin), bekle(sure(3500))]);
    if (kapali) return;
    app.git(durum.i.yas ? 'pazar' : 'yas', { sonra: 'pazar' });
  });
  // ikinci oyun: Meyve Suyu Köşesi (giriş cümlesini kendi ekranı söyler; burada söylenirse yarıda kesilirdi)
  const meyveSuyu = h('button.dugme.pz-ms-dugme', { type: 'button' }, svg(BARDAK_IKON), A.meyvesuyu);
  meyveSuyu.addEventListener('click', async () => {
    if (gidiliyor) return;
    gidiliyor = true;
    efekt.secim();
    await bekle(sure(250));
    if (kapali) return;
    app.git(durum.i.yas ? 'meyvesuyu' : 'yas', { sonra: 'meyvesuyu' });
  });
  const cikis = app.secenekler.cikis;
  const sol = cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : bosluk();
  const yasDugme = durum.i.yas
    ? h('button.pz-yas-dugme', { type: 'button', 'aria-label': 'Yaşı değiştir' }, A.yas.replace('{yas}', String(durum.i.yas)))
    : null;
  yasDugme?.addEventListener('click', () => {
    efekt.dokunma();
    app.git('yas', { sonra: 'pazar' });
  });
  const meyveler = ['elma', 'muz', 'cilek', 'portakal', 'havuc'].map((u, i) => h('div.pz-acilis-meyve', { style: `--i:${i}` }, resim(`meyveler/${u}`, '', urunAdi(u))));
  const canli = canliSahne();
  canli.gun(0);
  canli.ufuk.classList.add('pz-acilis-ufuk');
  const el = h(
    'div.pz-acilis',
    { style: gorselStil('pazar/arkaplan') },
    canli.arka,
    canli.ufuk,
    h('div.ust-cubuk', {}, sol, h('div.orta'), sesDugmesi()),
    h(
      'div.pz-acilis-ic',
      {},
      logo(),
      h('div.pz-acilis-sahne', {}, stand([h('div.pz-mino', {}, mino.el)], [h('div.pz-acilis-meyveler', {}, ...meyveler)])),
      h('div.pz-acilis-dugmeler', {}, oyna, meyveSuyu),
      h(
        'div.pz-acilis-alt',
        {},
        kayit.yildiz ? h('span.pz-toplam-yildiz', {}, svg(IKON.yildiz), A.yildiz.replace('{yildiz}', String(kayit.yildiz))) : null,
        yasDugme,
      ),
    ),
  );
  return {
    el,
    kapat() {
      kapali = true;
      clearTimeout(selam);
      minoCanli.kapat();
      mino.kapat();
      canli.kapat();
    },
  };
}

// ---------------------------------------------------------------- Pazar
/** Balonda isteğin resimli hâli (okuma bilmeyen çocuk için) */
function istekGorseli(ist: Istek): HTMLElement {
  const grup = (id: string, n: number, on = '') => h('div.pz-istek-grup', {}, h('b', {}, `${on}${n}`), urunResmi(id));
  const [u] = Object.keys(ist.istenen);
  switch (ist.tur) {
    case 'tek':
      return h('div.pz-istek', {}, urunResmi(u));
    case 'renk':
      return h('div.pz-istek', {}, h('i.pz-renk-leke', { style: `--r:${RENK_KODU[ist.renk ?? ''] ?? '#ccc'}`, role: 'img', 'aria-label': ist.renk ?? '' }));
    case 'sayi':
      return h('div.pz-istek', {}, grup(u, ist.istenen[u]));
    case 'iki':
      return h('div.pz-istek', {}, ...Object.entries(ist.istenen).map(([id, n]) => grup(id, n)));
    case 'toplama':
      return h('div.pz-istek', {}, grup(u, ist.istenen[u], '+'));
    case 'ode':
      return h('div.pz-istek', {}, h('div.pz-istek-grup.pz-istek-lira', {}, h('b', {}, A.lira.replace('{sayi}', String(ist.lira)))));
    case 'terazi':
      // müşterinin kefesindekiler = ? (dengele)
      return h(
        'div.pz-istek.pz-istek-terazi',
        {},
        // aynı meyveler "3 🍐" diye kısalır (balon ekrana sığsın)
        ...[...new Set(ist.sol ?? [])].map((id) => {
          const n = (ist.sol ?? []).filter((x) => x === id).length;
          return n > 1 ? grup(id, n) : urunResmi(id);
        }),
        h('b', {}, '='),
        h('b.pz-soru', {}, '?'),
      );
    case 'ayir': {
      // tezgâhta olmayan bir örnekle grubu göster (cevabı ele vermesin)
      const ornek = P.urunler[ist.grup ?? 'meyve'].find((x) => !ist.tezgah.includes(x)) ?? u;
      return h('div.pz-istek.pz-istek-ayir', {}, urunResmi(ornek), h('span', {}, ist.grup === 'sebze' ? A.sebzeler : A.meyveler));
    }
  }
}

export function pazarEkrani(app: Uygulama): Ekran {
  const y = yas();
  // gösterim / test: &musteriler=ordek,tavsan,… ile müşteriler seçilebilir
  const secili = TEST_MODU || document.body.dataset.onizleme ? (new URLSearchParams(location.search).get('musteriler') ?? '').split(',').filter((x) => P.musteriler.includes(x)) : [];
  const musteriler = [...secili, ...karistir(P.musteriler.filter((x) => !secili.includes(x)))].slice(0, MUSTERI_SAYISI);
  musteriler.forEach((ad) => {
    resimSesiHazirla(ad);
    musteriHazirla(ad);
  });

  const yazi = h('span', {}, P.basla);
  let sonSoz: string[] = [P.basla];
  // açılış şarkısı çalarken (el.dataset.sarki) cümle şarkının üstüne söylenmez
  const balon = h('div.baslik-balon.pz-baslik', {}, yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', () => el.dataset.sarki !== 'caliyor' && void konus(sonSoz), 'kucuk'), yazi);
  const yildizlar = h('div.pz-yildizlar', { 'aria-label': 'Yıldızlar' }, ...Array.from({ length: MUSTERI_SAYISI }, () => h('i.pz-yildiz', {}, svg(IKON.yildiz))));
  const musteriKap = h('div.pz-musteri-kap');
  const mino = new Mino();
  mino.el.addEventListener('pointerdown', () => mino.tepki('gidik'));
  const urunler = h('div.pz-urunler');
  let aktif = false;
  // Mino tezgâhta boş durmaz; sürüklenen ürünü gözleriyle izler
  const minoCanli = new MinoCanli(mino, { urunVar: () => urunler.children.length > 0, musteriVar: () => aktif });
  const sepetUrl = adres('pazar/sepet');
  const sepetIc = h('div.pz-sepet-ic');
  const sepet = h(`div.pz-sepet${sepetUrl ? '.pz-gorselli' : ''}`, { role: 'region', 'aria-label': 'Sepet' }, sepetUrl ? h('img.pz-sepet-resim', { src: sepetUrl, alt: '', draggable: 'false' }) : null, sepetIc);
  const verYazi = h('span', {}, A.ver);
  const ver = h('button.dugme.pz-ver', { type: 'button', hidden: true }, svg(IKON.onay), verYazi);
  // Mino standın içinde tahtanın arkasında, sepet tahtanın üstünde; müşteri standın önünde
  // yaşayan pazar: bulutlar, flamalar, kuşlar, uzak yayalar, günün ışığı (canli.ts)
  const canli = canliSahne();
  canli.gun(0);
  // kamera: stand ve müşteri bir katmanda; müşteri gelince kadraj yumuşakça ona yaklaşır, gidince açılır (uzak yayalar yarı hızda: derinlik)
  const kamera = h('div.pz-kamera', {}, stand([h('div.pz-mino', {}, mino.el)], [sepet]), musteriKap);
  const sahne = h('div.pz-sahne', {}, canli.ufuk, kamera);
  // ön tezgâh: standın tahtasının devamı; ürünler bunun üstünde
  // terazi (5-6 yaş, ortadaki müşteri): ön tezgâhın üstünde, ürünlerin önünde
  const teraziYer = h('div.pz-terazi-yer');
  const tezgah = onTezgah(h('div.pz-tezgah-ust', {}, teraziYer, ver), urunler);
  const cikis = () => app.git('acilis');
  const zemin = h('div.pz-zemin', { 'aria-hidden': 'true' });
  const el = h(
    'div.pz-pazar',
    { style: gorselStil('pazar/arkaplan'), 'data-yas': y },
    zemin,
    canli.arka,
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', cikis), h('div.orta', {}, balon), sesDugmesi()),
    yildizlar,
    sahne,
    tezgah,
  );
  const flamaKapat = flamaYerlestir(el, kamera);
  const kam = oyunKamerasi(el, sahne, kamera, tezgah, zemin, canli.arka, canli.ufuk);
  // çocuk tezgâha dokununca (istek yakın çekimi sürerken) kadraj hemen açılır: beklemeden oynar
  tezgah.addEventListener('pointerdown', () => aktif && kam.yakin && kam.genis(450));

  // test ve gösterim: ?tur=terazi ile ilk müşteri o türden gelir
  const zorla = (TEST_MODU || document.body.dataset.onizleme ? new URLSearchParams(location.search).get('tur') : null) as Tur | null;
  let ist: Istek = istekUret(y, 0);
  let terazi: Terazi | null = null;
  /** ürünlerin konduğu yer: sepet ya da terazinin kefesi */
  const kap = () => (terazi && ist.tur === 'terazi' ? terazi.icSag : sepetIc);
  const hedefEl = () => (terazi && ist.tur === 'terazi' ? terazi.kefeSag : sepet);
  let kapandi = false;
  let hata = 0;
  let verHata = 0;
  let sonHareket = performance.now();
  let sonBirakma = 0;
  let ipucu = false;
  let musteri: Musteri | null = null;
  let bitir: () => void = () => undefined;
  const sokuler: (() => void)[] = [];

  const sepettekiler = () => [...kap().querySelectorAll<HTMLElement>('.pz-urun:not(.pz-hazir)')].map((e) => e.dataset.urun ?? '');
  /** terazi: kefelerdeki ağırlıklar kola iletilir */
  const teraziGuncelle = () => terazi?.agirliklar((ist.sol ?? []).reduce((a, id) => a + agirlik(id), 0), sepettekiler().reduce((a, id) => a + agirlik(id), 0));
  let fazlaDendi = false;
  /** terazi dengelenince: kol ortada durup kefeler parlayınca biter (el çekilirse beklemeyi bırakır) */
  async function dengeBekle() {
    const bu = ist;
    for (let k = 0; k < 80 && terazi && !terazi.dengede; k++) await bekle(sure(50));
    // denge anı: terazi öne çıkıp büyür (yakın çekim), tezgâhtaki öteki ürünler geri çekilir
    if (terazi?.dengede && ist === bu) el.classList.add('pz-terazi-odak');
    await bekle(sure(650));
    if (aktif && ist === bu && denetle(ist, sepettekiler()) === 'tamam') bitir();
  }
  const salla = (e: HTMLElement | null, sinif = 'pz-hayir') => {
    if (!e) return;
    e.classList.remove(sinif);
    void e.offsetWidth;
    e.classList.add(sinif);
  };
  const soyle = (soz: string | string[]) => {
    sonSoz = [soz].flat();
    return konus(sonSoz);
  };

  /** Sepetteki ürünleri kendi türü içinde numaralar (sayma ipucu) ve para toplamını yazar */
  function sepetGuncelle() {
    const say = new Map<string, number>();
    for (const e of sepetIc.querySelectorAll<HTMLElement>('.pz-urun:not(.pz-hazir)')) {
      const id = e.dataset.urun ?? '';
      const n = (say.get(id) ?? 0) + 1;
      say.set(id, n);
      e.dataset.no = String(n);
    }
    // sepet doldukça içindekiler küçülür: üst üste binmeden sığsınlar
    const adet = sepetIc.children.length;
    sepetIc.style.setProperty('--ks', String(adet <= 3 ? 1 : adet <= 5 ? 0.82 : adet <= 7 ? 0.68 : 0.58));
    if (ist.tur === 'ode') {
      const t = sepettekiler().reduce((a, id) => a + (paraMi(id) ? PARA[id] : 0), 0);
      sepet.dataset.toplam = A.lira.replace('{sayi}', String(t));
    }
  }

  /** Doğru ürünleri parlat (2 hatadan sonra ya da uzun süre hareket yoksa) */
  function parlat() {
    for (const e of urunler.querySelectorAll<HTMLElement>('.pz-urun')) e.classList.toggle('pz-parla', uygunMu(ist, e.dataset.urun ?? ''));
  }

  function yanlisUrun() {
    hata++;
    efekt.yanlis();
    void musteri?.hayir();
    mino.tepki('hayir');
    const soz = ist.tur === 'ayir' ? (ist.grup === 'meyve' ? P.meyve_degil : P.sebze_degil) : rastgele(P.yanlis);
    if (hata >= 2) {
      parlat();
      void soyle([soz, P.yardim]);
    } else void soyle(soz);
  }

  function koy(e: HTMLElement, id: string) {
    sonHareket = performance.now();
    if (!aktif) {
      geriGonder(e);
      return;
    }
    if (!uygunMu(ist, id)) {
      geriGonder(e);
      yanlisUrun();
      return;
    }
    e.classList.remove('pz-parla');
    tasi(e, kap());
    // ürün sepete düşünce küçük bir sekme (kayma bittikten sonra)
    // ürün sekip yerleşir; para dönerek kavisle düşer ve şıngırdar
    if (paraMi(id)) {
      setTimeout(() => salla(e, 'pz-para-dustu'), sure(120));
      setTimeout(() => {
        singir(sepet);
        efekt.nota(9);
      }, sure(420));
    } else
      setTimeout(() => {
        salla(e, 'pz-dustu');
        // düştüğü yerde küçük toz ve parıltı
        tozAt(e, ist.tur === 'terazi' && terazi ? terazi.kefeSag : sepet);
      }, sure(300));
    efekt.yapis();
    if (ist.tur === 'terazi') {
      e.style.setProperty('--a', String(agirlik(id)));
      teraziGuncelle();
      // meyve kefeye inince terazi kısa bir "pat" ile öne gelir
      if (terazi) teraziVurgu(terazi.el);
      const r = denetle(ist, sepettekiler());
      if (r === 'tamam') {
        efekt.nota(8);
        void dengeBekle();
      } else if (r === 'fazla') {
        // fazla geldi: kefe iner; bir kez söylenir, kefedeki meyveye dokununca geri döner
        mino.tepki('sasir');
        if (!fazlaDendi) void soyle(P.fazla);
        fazlaDendi = true;
      } else efekt.nota(sepettekiler().length);
      return;
    }
    salla(sepet, 'pz-zipla');
    sepetGuncelle();
    if (!ist.dugmeli) {
      if (denetle(ist, sepettekiler()) === 'tamam') bitir();
      else efekt.nota(sepettekiler().length);
    }
  }

  function urunEl(id: string, i: number): HTMLElement {
    const e = h('div.pz-urun', { 'data-urun': id, role: 'img', 'aria-label': paraMi(id) ? A.lira.replace('{sayi}', String(PARA[id])) : urunAdi(id) }, h('i.pz-urun-golge'), urunResmi(id));
    const yuva = h('div.pz-yuva', { style: `--i:${i}` }, e);
    sokuler.push(
      surukle({
        el: e,
        hedef: hedefEl,
        aktif: () => aktif && e.parentElement === yuva,
        basla: () => {
          sonHareket = performance.now();
          efekt.secim();
          minoCanli.izleBasla();
        },
        tasi: (x) => minoCanli.izle(x),
        birak: (hedefte, dokunus) => {
          sonBirakma = performance.now();
          minoCanli.izleBitti();
          if (hedefte) koy(e, id);
          else if (dokunus) {
            // dokununca ürün canlanır: zıplar, kıvrılır, kendi notasını söyler; Mino ona bakar
            geriGonder(e);
            boing(e);
            efekt.nota(2 + (i % 6));
            minoCanli.bakin(oran(e, sahne)[0] < 0.5 ? -0.7 : 0.7, 900);
          } else {
            // hedefe varmadan bırakıldı: yumuşak "pıt" sesi ve yuvasında yaylanma
            efekt.dokunma();
            geriGonder(e);
          }
        },
      }),
    );
    // sayma işlerinde sepetteki ürüne dokununca tezgâha geri döner (fazlayı düzeltmek için)
    e.addEventListener('click', () => {
      if (!aktif || !(ist.dugmeli || ist.tur === 'terazi') || e.parentElement !== kap() || performance.now() - sonBirakma < 400) return;
      efekt.dokunma();
      tasi(e, yuva);
      sepetGuncelle();
      teraziGuncelle();
      // terazi: fazlayı geri alınca kefeler denkleşirse tur da biter (yoksa kefe parlar ama müşteri hep bekler)
      if (ist.tur === 'terazi' && denetle(ist, sepettekiler()) === 'tamam') {
        efekt.nota(8);
        void dengeBekle();
      }
    });
    return yuva;
  }

  ver.addEventListener('click', () => {
    if (!aktif) return;
    const r = denetle(ist, sepettekiler());
    if (r === 'tamam') {
      bitir();
      return;
    }
    verHata++;
    efekt.yanlis();
    salla(sepet);
    const soz = [r === 'az' ? P.az : P.fazla];
    if (verHata >= 2) {
      sepet.classList.add('pz-say');
      soz.push(P.sayalim);
    }
    void soyle(soz);
  });

  // uzun süre hareket yoksa: doğru ürün parlar, "Sepete sürükle!"
  const ipucuSayaci = setInterval(() => {
    if (!aktif || ipucu || TEST_MODU || performance.now() - sonHareket < 12000) return;
    ipucu = true;
    parlat();
    void soyle(P.surukle);
  }, 1000);

  const tur = async (i: number) => {
    ist = istekUret(y, i, Math.random, i === 0 && zorla ? zorla : undefined);
    fazlaDendi = false;
    // terazi yalnız terazili müşteride kurulur; sepet o sırada kenara çekilir
    terazi?.kapat();
    terazi = null;
    teraziYer.replaceChildren();
    el.classList.remove('pz-terazi-odak');
    sepet.classList.toggle('pz-gizli', ist.tur === 'terazi');
    el.classList.toggle('pz-terazili', ist.tur === 'terazi');
    if (ist.tur === 'terazi') {
      const tz = new Terazi();
      terazi = tz;
      teraziYer.append(tz.el);
      // müşterinin meyveleri sol kefeye teker teker konur: her birinde kefe biraz daha iner
      (ist.sol ?? []).forEach((id, k) =>
        setTimeout(() => {
          if (terazi !== tz || kapandi) return;
          tz.icSol.append(h('div.pz-urun.pz-hazir', { 'data-urun': id, style: `--a:${agirlik(id)}` }, urunResmi(id)));
          const sol = (ist.sol ?? []).slice(0, k + 1).reduce((a, x) => a + agirlik(x), 0);
          tz.agirliklar(sol, 0);
          teraziVurgu(tz.el);
          efekt.yapis();
        }, sure(500 + k * 380)),
      );
    }
    // gün ilerler: ilk müşteri sabah, sonuncusu akşamüstü
    canli.gun(i / (MUSTERI_SAYISI - 1));
    hata = 0;
    verHata = 0;
    ipucu = false;
    sokuler.splice(0).forEach((f) => f());
    sepet.classList.remove('pz-say', 'pz-teslim');
    delete sepet.dataset.toplam;
    sepetIc.replaceChildren();
    const [u] = Object.keys(ist.istenen);
    for (let k = 0; k < (ist.bende ?? 0); k++) sepetIc.append(h('div.pz-urun.pz-hazir', { 'data-urun': u }, urunResmi(u)));
    urunler.replaceChildren(...ist.tezgah.map((id, k) => urunEl(id, k)));
    urunler.dataset.adet = String(ist.tezgah.length);
    ver.hidden = !ist.dugmeli;
    verYazi.textContent = ist.tur === 'ode' ? A.tamam : A.ver;
    el.dataset.tur = ist.tur;
    if (TEST_MODU || document.body.dataset.onizleme) el.dataset.istek = JSON.stringify({ istenen: ist.istenen, lira: ist.lira, sol: ist.sol });
    sepetGuncelle();

    const ad = musteriler[i];
    // müşteri kendi yürüyüşüyle gelir (musteri.ts: kişilikler)
    musteri?.kapat();
    const mu = new Musteri(ad, resim(`hayvanlar/${ad}`, 'pz-musteri-resim', ad), h('div.pz-istek-balon', {}, istekGorseli(ist)));
    const m = mu.el;
    musteri = mu;
    musteriKap.replaceChildren(m);
    void resimSesi(ad);
    // Mino müşteriyi karşılar; kamera gelen müşteriyle Mino'yu birlikte alır
    setTimeout(() => minoCanli.karsila(), sure(450));
    kamera.classList.add('pz-yakin');
    sahne.classList.add('pz-yakin');
    const ikili = () => Kamera.birlesik(musteriKutusu(kam, musteriKap, true), kam.kutu(mino.el, { alt: -0.35 }));
    kam.odakla(ikili, { doluluk: 0.95, enCok: 1.3, sure: 1500 });
    await mu.gel();
    if (kapandi) return;
    mu.bekle(true);

    // istek karşılanınca girdi hemen kapanır (müşteri cümlesini bitirirken sepet bozulmasın, yanlış ürün sayılmasın)
    const bitti = new Promise<void>((r) => (bitir = () => ((aktif = false), r())));
    yazi.textContent = ist.yazi;
    sonHareket = performance.now();
    aktif = true;
    el.classList.add('pz-aktif');
    // istek: yakın çekim müşteri ve balonunda (çocuk tezgâha dokununca hemen açılır, beklemek yok)
    kam.odakla(() => musteriKutusu(kam, musteriKap, true), { doluluk: 0.9, enCok: 2, sure: 900, dikey: 0.5, tamEkran: true });
    // müşteri isteğini söylerken ağzı oynar
    mu.konus(true);
    // yakın çekim en az bir an sürer (kısa cümlede kadraj hemen kaçmasın); çocuk dokunursa beklemeden açılır
    await Promise.all([soyle(ist.soz).then(() => mu.konus(false)), bekle(sure(kam.acik ? 1800 : 0))]);
    mu.konus(false);
    if (aktif) kam.genis(1000);
    await bitti;
    aktif = false;
    el.classList.remove('pz-aktif');
    if (kapandi) return;

    // müşteri sevinir, teşekkür eder, yıldız
    m.classList.add('sevindi');
    sepet.classList.add('pz-teslim');
    terazi?.el.classList.add('pz-teslim');
    urunler.querySelectorAll('.pz-parla').forEach((e) => e.classList.remove('pz-parla'));
    efekt.dogru();
    void resimSesi(ad);
    // Mino sepeti patisiyle müşteriye uzatır
    // hazırlık → uzatma → takip
    mino.tepki('sun');
    // parıltı: müşterinin ve Mino'nun üstünde (kamera nerede olursa olsun ekrandaki yerlerinde)
    const [mx, my] = oran(m, sahne, 0.45);
    const [nx, ny] = oran(mino.el, sahne, 0.3);
    parilti(sahne, mx, my, 10);
    parilti(sahne, nx, ny, 8);
    const r = sahne.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width * mx, r.top + r.height * my, 40);
    // teslim: kamera müşteriyle Mino'yu birlikte alır (sepet müşteriye uzanır)
    kam.odakla(() => Kamera.birlesik(musteriKutusu(kam, musteriKap, false), kam.kutu(mino.el, { alt: -0.35 })), { doluluk: 0.92, enCok: 1.6, sure: 800, tamEkran: true });
    // yıldız müşterinin üstünden uçup üstteki yerine oturur
    // ödül anı: yıldız büyüyüp parlar, uçup yerine oturur; Mino kısa sevinir
    void odulAni(app.kok, m, yildizlar.children[i] as HTMLElement | undefined, i, mino);
    kayit.yildiz++;
    kaydet();
    const tesekkur = rastgele(P.dogru);
    yazi.textContent = tesekkur;
    // ürün müşteriye ulaşınca: alır, ısırır (kırıntılar), kendi sevinç dansını yapar, sonra kendi yürüyüşüyle gider
    const yenen = ist.tur === 'ode' ? undefined : sepettekiler()[0];
    await Promise.all([
      soyle(tesekkur),
      (async () => {
        await bekle(sure(750));
        // yerken ve dans ederken yakın çekim: yalnız müşteri (mutlu yüzü ekranı doldurur)
        kam.odakla(() => musteriKutusu(kam, musteriKap, false), { doluluk: 0.82, enCok: 2.1, sure: 900, dikey: 0.55, tamEkran: true });
        await mu.ye(yenen ? urunResmi(yenen) : null, RENK_KODU[urunRengi(yenen ?? '') ?? ''] ?? '#f4a340', A.nyam);
        mu.kalpler();
        await mu.dans();
      })(),
    ]);
    if (kapandi) return;
    m.classList.add('gidiyor');
    minoCanli.ugurla();
    kamera.classList.remove('pz-yakin');
    sahne.classList.remove('pz-yakin');
    kam.genis(1100);
    await mu.git();
  };

  // pazar açılışı: şarkı (sayılan meyveler tezgâhta sözle birlikte zıplar), sonra ilk müşteri
  let sarki: PazarSarkisi | null = null;
  void (async () => {
    await bekle(sure(300));
    if (kapandi) return;
    sarki = pazarSarkisi({ tezgah, yazi, ekran: el, mino });
    await sarki.bitti;
    if (kapandi) return;
    await soyle(P.basla);
    for (let i = 0; i < MUSTERI_SAYISI && !kapandi; i++) await tur(i);
    if (kapandi) return;
    kayit.senlik++;
    kaydet();
    app.git('senlik', { musteriler });
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      aktif = false;
      bitir();
      sarki?.durdur();
      clearInterval(ipucuSayaci);
      minoCanli.kapat();
      sokuler.splice(0).forEach((f) => f());
      mino.kapat();
      canli.kapat();
      flamaKapat();
      kam.kapat();
      terazi?.kapat();
      musteri?.kapat();
    },
  };
}

/** Terazi kısa bir an öne gelip yaylanır (meyve kefeye indi); `scale` ayrı özellik: girişteki transform'a karışmaz */
function teraziVurgu(t: HTMLElement) {
  if (AZ_ODUL) return;
  t.animate([{ scale: '1' }, { scale: '1.07', offset: 0.35 }, { scale: '0.985', offset: 0.7 }, { scale: '1' }], { duration: sure(420), easing: 'ease-out' });
}

/** Ürünün düştüğü yerde (kabın içinde, ürünün altında) toz ve parıltı */
export function tozAt(e: HTMLElement, kap: HTMLElement) {
  const a = e.getBoundingClientRect();
  const b = kap.getBoundingClientRect();
  if (!b.width || !b.height) return;
  tozKalkar(kap, (a.left + a.width / 2 - b.left) / b.width, (a.bottom - a.height * 0.15 - b.top) / b.height);
}

/** Para kasaya düşünce sepetin ağzında şıngır parıltısı */
function singir(sepet: HTMLElement) {
  const s = h('div.pz-singir', { style: 'left:50%;top:40%' }, ...Array.from({ length: 7 }, (_, i) => h('i', { style: `--a:${Math.round((i * 360) / 7)}deg` })));
  sepet.append(s);
  setTimeout(() => s.remove(), 700);
}

const AZ_ODUL = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Ödül anı: yıldız müşterinin üstünde doğar, arkasında dönen ışınlar ve parlama ile kocaman büyür ("vııng" + çan),
 * bir an asılı kalıp nabız gibi atar, sonra kavis çizerek üstteki yerine uçar. Oturunca yer sekip dolar,
 * çevresinde bir halka ve parıltılar açılır, ikinci çan çalar, Mino kısa bir sevinç yapar.
 * Yalnız transform / opacity (WAAPI). Hareketi azalt tercihinde yıldız doğrudan yerine oturur.
 */
export function odulAni(kok: HTMLElement, kaynak: HTMLElement, hedef: HTMLElement | undefined, sira: number, mino?: Mino): Promise<void> {
  if (!hedef) return Promise.resolve();
  const otur = () => {
    hedef.classList.add('dolu');
    efekt.yildiz(Math.min(2, sira % 3));
    mino?.tepki('sevinc');
  };
  if (AZ_ODUL) {
    otur();
    return Promise.resolve();
  }
  const a = kaynak.getBoundingClientRect();
  const b = hedef.getBoundingClientRect();
  const x0 = a.left + a.width / 2;
  const y0 = a.top + a.height * 0.2;
  const dx = b.left + b.width / 2 - x0;
  const dy = b.top + b.height / 2 - y0;
  const isin = h('i.pz-odul-isin');
  const parla = h('i.pz-odul-parla');
  const yildiz = h('div.pz-odul-yildiz', {}, svg(IKON.yildiz));
  const el = h('div.pz-odul', { style: `left:${x0}px;top:${y0}px`, 'aria-hidden': 'true' }, parla, isin, yildiz);
  kok.append(el);
  const T = sure(1500);
  odulSesi();
  // yıldız uygulama kökünde uçar; oyun ekranından çıkılınca (yer kalktı ya da ekran soluyor) yarıda kesilir
  const ayrildi = () => !hedef.isConnected || !!hedef.closest('.cikiyor');
  const can = window.setTimeout(() => !ayrildi() && efekt.nota(7 + (sira % 3)), sure(300));
  const bekci = window.setInterval(() => ayrildi() && el.getAnimations({ subtree: true }).forEach((a) => a.cancel()), 100);
  // yol: yükselir, asılı kalır, kavisle yerine uçar
  const yol = el.animate(
    [
      { transform: 'translate(0, 0)', easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: 'translate(0, -60px)', offset: 0.28, easing: 'ease-in-out' },
      { transform: 'translate(0, -66px)', offset: 0.52, easing: 'cubic-bezier(.45,0,.55,.2)' },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.5 - 90}px)`, offset: 0.76, easing: 'cubic-bezier(.3,.3,.6,1)' },
      { transform: `translate(${dx}px, ${dy}px)` },
    ],
    { duration: T, fill: 'forwards' },
  );
  // yıldız: doğar, fazlasıyla büyür, nabız atar, uçarken döner ve küçülür
  yildiz.animate(
    [
      { transform: 'scale(.15) rotate(-140deg)' },
      { transform: 'scale(2.5) rotate(12deg)', offset: 0.22, easing: 'ease-out' },
      { transform: 'scale(2.1) rotate(0deg)', offset: 0.3 },
      { transform: 'scale(2.3) rotate(-4deg)', offset: 0.4 },
      { transform: 'scale(2.1) rotate(0deg)', offset: 0.52, easing: 'ease-in' },
      { transform: 'scale(.72) rotate(360deg)' },
    ],
    { duration: T, fill: 'forwards' },
  );
  // arkadaki ışınlar dönerek açılır, uçuşta söner; parlama nefes alır
  isin.animate(
    [
      { transform: 'scale(.2) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1.15) rotate(50deg)', opacity: 1, offset: 0.25 },
      { transform: 'scale(1.3) rotate(95deg)', opacity: 0.9, offset: 0.52 },
      { transform: 'scale(.5) rotate(150deg)', opacity: 0, offset: 0.7 },
      { transform: 'scale(.5) rotate(150deg)', opacity: 0 },
    ],
    { duration: T, fill: 'forwards' },
  );
  parla.animate(
    [
      { transform: 'scale(.3)', opacity: 0 },
      { transform: 'scale(1.2)', opacity: 1, offset: 0.2 },
      { transform: 'scale(1)', opacity: 0.8, offset: 0.52 },
      { transform: 'scale(.4)', opacity: 0, offset: 0.72 },
      { transform: 'scale(.4)', opacity: 0 },
    ],
    { duration: T, fill: 'forwards' },
  );
  return yol.finished
    .catch(() => undefined)
    .then(() => {
      clearTimeout(can);
      clearInterval(bekci);
      el.remove();
      if (ayrildi()) return;
      otur();
      // yerine oturduğu anda halka ve parıltılar
      const bx = b.left + b.width / 2;
      const by = b.top + b.height / 2;
      const varis = h('div.pz-odul-varis', { style: `left:${bx}px;top:${by}px`, 'aria-hidden': 'true' }, h('i.pz-odul-halka'));
      for (let i = 0; i < 8; i++) {
        const aci = (i / 8) * Math.PI * 2;
        varis.append(h('i.pz-parilti', { style: `left:0;top:0;--dx:${(Math.cos(aci) * 46).toFixed(0)}px;--dy:${(Math.sin(aci) * 46).toFixed(0)}px;--g:0ms` }));
      }
      kok.append(varis);
      setTimeout(() => varis.remove(), 1100);
    });
}

// ---------------------------------------------------------------- Şenlik (5 müşteri mutlu)
export function senlikEkrani(app: Uygulama, p?: { musteriler?: string[]; kaynak?: 'pazar' | 'meyvesuyu'; yildiz?: number }): Ekran {
  // hangi oyundan gelindi: "Bir daha" onu açar, yanındaki düğme öteki oyunu (pazar ↔ meyve suyu)
  const kaynak = p?.kaynak ?? 'pazar';
  const ms = p?.musteriler?.length ? p.musteriler : P.musteriler.slice(0, MUSTERI_SAYISI);
  ms.forEach(resimSesiHazirla);
  const sahne = h('div.pz-senlik-sahne');
  // müşteriler iskeletleriyle canlı: sırayla kendi danslarını yapar, dokununca sevinip zıplar
  const karakterler: Karakter[] = [];
  const hayvanlar = ms.map((ad, i) => {
    const k = new Karakter(ad, resim(`hayvanlar/${ad}`, '', ad));
    karakterler.push(k);
    const b = h('button.pz-senlik-hayvan', { type: 'button', style: `--i:${i}`, 'aria-label': ad, 'data-musteri': ad }, h('i.pz-senlik-golge'), k.el);
    b.addEventListener('pointerdown', () => {
      b.classList.remove('zipla');
      void b.offsetWidth;
      b.classList.add('zipla');
      void resimSesi(ad);
      if (!k.mesgul) void k.oynat('sevin', 900);
      const [x, y] = oran(b, sahne, 0.4);
      parilti(sahne, x, y, 6);
    });
    return b;
  });
  let dansSira = 0;
  const dansEt = () => {
    karakterler.forEach((k, i) => {
      if (k.mesgul) return;
      window.setTimeout(() => !k.mesgul && void k.oynat(dansSira % 2 ? 'sevin' : 'dans', 1300), i * 160);
    });
    dansSira++;
  };
  const ilkDans = window.setTimeout(dansEt, sure(500));
  const hayvanDans = window.setInterval(dansEt, 2600);
  // Mino ortada dans eder; dokununca zıplar
  const mino = new Mino();
  mino.tepki('dans');
  const dans = setInterval(() => mino.tepki('dans'), 3000);
  mino.el.addEventListener('pointerdown', () => mino.tepki('zipla'));
  sahne.append(h('div.pz-senlik-mino', {}, mino.el), h('div.pz-senlik-hayvanlar', {}, ...hayvanlar));
  const birDaha = h('button.dugme', { type: 'button', style: '--r:var(--yesil)' }, svg(IKON.tekrar), A.bir_daha);
  birDaha.addEventListener('click', () => app.git(kaynak));
  const obur = kaynak === 'pazar'
    ? h('button.dugme.pz-ms-dugme', { type: 'button' }, svg(BARDAK_IKON), A.meyvesuyu)
    : h('button.dugme', { type: 'button', style: '--r:var(--turuncu)' }, svg(IKON.oyna), A.pazar);
  obur.addEventListener('click', () => {
    efekt.secim();
    app.git(kaynak === 'pazar' ? 'meyvesuyu' : 'pazar');
  });
  const cik = h('button.dugme', { type: 'button', style: '--r:var(--sari)' }, svg(IKON.ev), A.cikis);
  const cikis = app.secenekler.cikis;
  cik.addEventListener('click', () => (cikis ? cikis() : app.git('acilis')));
  // akşam oldu: fenerler yanar; konfeti yerine uçan balonlar ve havai fişek
  const canli = canliSahne({ senlik: true });
  canli.gun(1);
  canli.ufuk.classList.add('pz-acilis-ufuk');
  const gok = h('div.pz-senlik-gok', { 'aria-hidden': 'true' });
  const el = h(
    'div.pz-senlik',
    { style: gorselStil('pazar/arkaplan') },
    canli.arka,
    canli.ufuk,
    gok,
    h('div.ust-cubuk', {}, bosluk(), h('div.orta', {}, h('div.baslik-balon', {}, h('span', {}, P.senlik))), sesDugmesi()),
    h('div.pz-yildizlar.pz-hepsi', {}, ...Array.from({ length: p?.yildiz ?? MUSTERI_SAYISI }, () => h('i.pz-yildiz.dolu', {}, svg(IKON.yildiz)))),
    sahne,
    h('div.pz-senlik-alt', {}, birDaha, obur, cik),
  );
  efekt.kilitAcildi();
  const balonDur = balonlar(gok);
  const fisekDur = havaiFisek(gok);
  void konus([P.senlik, P.senlik_dokun]);
  return {
    el,
    kapat() {
      clearInterval(dans);
      clearTimeout(ilkDans);
      clearInterval(hayvanDans);
      karakterler.forEach((k) => k.kapat());
      mino.kapat();
      canli.kapat();
      balonDur();
      fisekDur();
    },
  };
}
