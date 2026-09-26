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
import { adres, parilti, resim } from './gorsel';
import { kaydet, kayit } from './ilerleme';
import { agirlik, denetle, istekUret, MUSTERI_SAYISI, PARA, paraMi, urunAdi, uygunMu, type Istek, type Tur } from './istek';
import { Terazi } from './terazi';
import { geriGonder, surukle, tasi } from './surukle';

const A = P.arayuz;
const RENK_KODU = P.renk_kodu as Record<string, string>;
const yas = (): Yas => durum.i.yas ?? 4;
const rastgele = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const bosluk = () => h('div', { style: 'width:72px' });

/** Tasarımcının görseli geldiyse arka plan olarak (yoksa CSS yer tutucu) */
function gorselStil(yol: string): string | undefined {
  const url = adres(yol);
  return url ? `--resim:url("${url}")` : undefined;
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
function stand(icinde: HTMLElement[], ustunde: HTMLElement[] = []): HTMLElement {
  const url = adres('pazar/tezgah');
  const katman = (sinif: string) =>
    url ? h(`img.pz-stand-katman.${sinif}`, { src: url, alt: '', draggable: 'false' }) : h(`div.pz-stand-katman.pz-stand-yedek.${sinif}`);
  return h('div.pz-stand', {}, katman('pz-stand-arka'), ...icinde, katman('pz-stand-tente'), katman('pz-stand-tahta'), ...ustunde);
}

// ---------------------------------------------------------------- Açılış
export function acilisEkrani(app: Uygulama): Ekran {
  const mino = new Mino();
  // Mino tezgâhın arkasından el sallar; dokununca zıplar
  const selam = setTimeout(() => mino.tepki('evet'), sure(500));
  mino.el.addEventListener('pointerdown', () => mino.tepki('zipla'));
  const oyna =h('button.dugme.pz-oyna', { type: 'button' }, svg(IKON.oyna), A.oyna);
  oyna.addEventListener('click', async () => {
    efekt.secim();
    void konus(P.hosgeldin);
    await bekle(sure(250));
    app.git(durum.i.yas ? 'pazar' : 'yas', { sonra: 'pazar' });
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
      oyna,
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
      clearTimeout(selam);
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
  const musteriler = karistir(P.musteriler).slice(0, MUSTERI_SAYISI);
  musteriler.forEach(resimSesiHazirla);

  const yazi = h('span', {}, P.basla);
  let sonSoz: string[] = [P.basla];
  const balon = h('div.baslik-balon.pz-baslik', {}, yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', () => void konus(sonSoz), 'kucuk'), yazi);
  const yildizlar = h('div.pz-yildizlar', { 'aria-label': 'Yıldızlar' }, ...Array.from({ length: MUSTERI_SAYISI }, () => h('i.pz-yildiz', {}, svg(IKON.yildiz))));
  const musteriKap = h('div.pz-musteri-kap');
  const mino = new Mino();
  mino.el.addEventListener('pointerdown', () => mino.tepki('gidik'));
  const sepetUrl = adres('pazar/sepet');
  const sepetIc = h('div.pz-sepet-ic');
  const sepet = h(`div.pz-sepet${sepetUrl ? '.pz-gorselli' : ''}`, { role: 'region', 'aria-label': 'Sepet' }, sepetUrl ? h('img.pz-sepet-resim', { src: sepetUrl, alt: '', draggable: 'false' }) : null, sepetIc);
  const verYazi = h('span', {}, A.ver);
  const ver = h('button.dugme.pz-ver', { type: 'button', hidden: true }, svg(IKON.onay), verYazi);
  const urunler = h('div.pz-urunler');
  // Mino standın içinde tahtanın arkasında, sepet tahtanın üstünde; müşteri standın önünde
  // yaşayan pazar: bulutlar, flamalar, kuşlar, uzak yayalar, günün ışığı (canli.ts)
  const canli = canliSahne();
  canli.gun(0);
  const sahne = h('div.pz-sahne', {}, canli.ufuk, stand([h('div.pz-mino', {}, mino.el)], [sepet]), musteriKap);
  // ön tezgâh: standın tahtasının devamı; ürünler bunun üstünde
  // terazi (5-6 yaş, ortadaki müşteri): ön tezgâhın üstünde, ürünlerin önünde
  const teraziYer = h('div.pz-terazi-yer');
  const tezgah = h('div.pz-tezgah', {}, h('div.pz-tezgah-ust', {}, teraziYer, ver), urunler);
  const cikis = () => app.git('acilis');
  const el = h(
    'div.pz-pazar',
    { style: gorselStil('pazar/arkaplan'), 'data-yas': y },
    canli.arka,
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', cikis), h('div.orta', {}, balon), sesDugmesi()),
    yildizlar,
    sahne,
    tezgah,
  );

  // test ve gösterim: ?tur=terazi ile ilk müşteri o türden gelir
  const zorla = (TEST_MODU || document.body.dataset.onizleme ? new URLSearchParams(location.search).get('tur') : null) as Tur | null;
  let ist: Istek = istekUret(y, 0);
  let terazi: Terazi | null = null;
  /** ürünlerin konduğu yer: sepet ya da terazinin kefesi */
  const kap = () => (terazi && ist.tur === 'terazi' ? terazi.icSag : sepetIc);
  const hedefEl = () => (terazi && ist.tur === 'terazi' ? terazi.kefeSag : sepet);
  let aktif = false;
  let kapandi = false;
  let hata = 0;
  let verHata = 0;
  let sonHareket = performance.now();
  let sonBirakma = 0;
  let ipucu = false;
  let musteri: HTMLElement | null = null;
  let bitir: () => void = () => undefined;
  const sokuler: (() => void)[] = [];

  const sepettekiler = () => [...kap().querySelectorAll<HTMLElement>('.pz-urun:not(.pz-hazir)')].map((e) => e.dataset.urun ?? '');
  /** terazi: kefelerdeki ağırlıklar kola iletilir */
  const teraziGuncelle = () => terazi?.agirliklar((ist.sol ?? []).reduce((a, id) => a + agirlik(id), 0), sepettekiler().reduce((a, id) => a + agirlik(id), 0));
  let fazlaDendi = false;
  /** terazi dengelenince: kol ortada durup kefeler parlayınca biter (el çekilirse beklemeyi bırakır) */
  async function dengeBekle() {
    for (let k = 0; k < 80 && terazi && !terazi.dengede; k++) await bekle(sure(50));
    await bekle(sure(650));
    if (aktif && denetle(ist, sepettekiler()) === 'tamam') bitir();
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
    salla(musteri);
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
    } else setTimeout(() => salla(e, 'pz-dustu'), sure(300));
    efekt.yapis();
    if (ist.tur === 'terazi') {
      e.style.setProperty('--a', String(agirlik(id)));
      teraziGuncelle();
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
        },
        birak: (hedefte) => {
          sonBirakma = performance.now();
          if (hedefte) koy(e, id);
          else geriGonder(e);
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
    sepet.classList.toggle('pz-gizli', ist.tur === 'terazi');
    el.classList.toggle('pz-terazili', ist.tur === 'terazi');
    if (ist.tur === 'terazi') {
      const tz = new Terazi();
      terazi = tz;
      teraziYer.append(tz.el);
      // müşterinin meyveleri sol kefeye teker teker konur: her birinde kefe biraz daha iner
      (ist.sol ?? []).forEach((id, k) =>
        setTimeout(() => {
          if (terazi !== tz) return;
          tz.icSol.append(h('div.pz-urun.pz-hazir', { 'data-urun': id, style: `--a:${agirlik(id)}` }, urunResmi(id)));
          const sol = (ist.sol ?? []).slice(0, k + 1).reduce((a, x) => a + agirlik(x), 0);
          tz.agirliklar(sol, 0);
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
    const m = h('div.pz-musteri', { 'data-musteri': ad }, h('div.pz-istek-balon', {}, istekGorseli(ist)), resim(`hayvanlar/${ad}`, 'pz-musteri-resim', ad));
    musteri = m;
    musteriKap.replaceChildren(m);
    void resimSesi(ad);
    // Mino müşteriyi karşılar
    setTimeout(() => mino.tepki('mir', 1.4), sure(450));
    await bekle(sure(700));
    if (kapandi) return;

    const bitti = new Promise<void>((r) => (bitir = r));
    yazi.textContent = ist.yazi;
    sonHareket = performance.now();
    aktif = true;
    el.classList.add('pz-aktif');
    await soyle(ist.soz);
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
    mino.tepki('uzat');
    // parıltı: müşterinin (solda) ve Mino'nun (standın içinde) üstünde
    parilti(sahne, 0.2, 0.55, 10);
    parilti(sahne, 0.56, 0.4, 8);
    const r = sahne.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width * 0.2, r.top + r.height * 0.55, 40);
    // yıldız müşterinin üstünden uçup üstteki yerine oturur
    void yildizUcur(app.kok, m, yildizlar.children[i] as HTMLElement | undefined).then(() => efekt.yildiz(Math.min(2, i % 3)));
    kayit.yildiz++;
    kaydet();
    const tesekkur = rastgele(P.dogru);
    yazi.textContent = tesekkur;
    await Promise.all([soyle(tesekkur), bekle(sure(1300))]);
    if (kapandi) return;
    m.classList.add('gidiyor');
    await bekle(sure(550));
  };

  void (async () => {
    await bekle(sure(300));
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
      clearInterval(ipucuSayaci);
      sokuler.splice(0).forEach((f) => f());
      mino.kapat();
      canli.kapat();
      terazi?.kapat();
    },
  };
}

/** Para kasaya düşünce sepetin ağzında şıngır parıltısı */
function singir(sepet: HTMLElement) {
  const s = h('div.pz-singir', { style: 'left:50%;top:40%' }, ...Array.from({ length: 7 }, (_, i) => h('i', { style: `--a:${Math.round((i * 360) / 7)}deg` })));
  sepet.append(s);
  setTimeout(() => s.remove(), 700);
}

/**
 * Kazanılan yıldız müşterinin üstünden kavis çizerek uçar, dönerek üstteki yerine oturur; varınca yer dolar.
 * Yalnız transform (WAAPI).
 */
function yildizUcur(kok: HTMLElement, kaynak: HTMLElement, hedef: HTMLElement | undefined): Promise<void> {
  if (!hedef) return Promise.resolve();
  const a = kaynak.getBoundingClientRect();
  const b = hedef.getBoundingClientRect();
  const x0 = a.left + a.width / 2;
  const y0 = a.top + a.height * 0.25;
  const dx = b.left + b.width / 2 - x0;
  const dy = b.top + b.height / 2 - y0;
  const y = h('div.pz-ucan-yildiz', { style: `left:${x0}px;top:${y0}px` }, svg(IKON.yildiz));
  kok.append(y);
  const an = y.animate(
    [
      { transform: 'translate(0, 0) scale(0.3) rotate(0)', offset: 0, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)' },
      { transform: 'translate(0, -40px) scale(1.5) rotate(90deg)', offset: 0.25, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 60}px) scale(1.2) rotate(250deg)`, offset: 0.62, easing: 'cubic-bezier(0.5, 0, 0.7, 0.6)' },
      { transform: `translate(${dx}px, ${dy}px) scale(0.7) rotate(360deg)`, offset: 1 },
    ],
    { duration: sure(900), fill: 'forwards' },
  );
  return an.finished
    .catch(() => undefined)
    .then(() => {
      y.remove();
      hedef.classList.add('dolu');
    });
}

// ---------------------------------------------------------------- Şenlik (5 müşteri mutlu)
export function senlikEkrani(app: Uygulama, p?: { musteriler?: string[] }): Ekran {
  const ms = p?.musteriler?.length ? p.musteriler : P.musteriler.slice(0, MUSTERI_SAYISI);
  ms.forEach(resimSesiHazirla);
  const sahne = h('div.pz-senlik-sahne');
  const hayvanlar = ms.map((ad, i) => {
    const b = h('button.pz-senlik-hayvan', { type: 'button', style: `--i:${i}`, 'aria-label': ad, 'data-musteri': ad }, resim(`hayvanlar/${ad}`, '', ad));
    b.addEventListener('pointerdown', () => {
      b.classList.remove('zipla');
      void b.offsetWidth;
      b.classList.add('zipla');
      void resimSesi(ad);
      parilti(sahne, (i + 0.5) / ms.length, 0.6, 6);
    });
    return b;
  });
  // Mino ortada dans eder; dokununca zıplar
  const mino = new Mino();
  mino.tepki('dans');
  const dans = setInterval(() => mino.tepki('dans'), 3000);
  mino.el.addEventListener('pointerdown', () => mino.tepki('zipla'));
  sahne.append(h('div.pz-senlik-mino', {}, mino.el), h('div.pz-senlik-hayvanlar', {}, ...hayvanlar));
  const birDaha = h('button.dugme', { type: 'button', style: '--r:var(--yesil)' }, svg(IKON.tekrar), A.bir_daha);
  birDaha.addEventListener('click', () => app.git('pazar'));
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
    h('div.pz-yildizlar.pz-hepsi', {}, ...Array.from({ length: MUSTERI_SAYISI }, () => h('i.pz-yildiz.dolu', {}, svg(IKON.yildiz)))),
    sahne,
    h('div.pz-senlik-alt', {}, birDaha, cik),
  );
  efekt.kilitAcildi();
  const balonDur = balonlar(gok);
  const fisekDur = havaiFisek(gok);
  void konus([P.senlik, P.senlik_dokun]);
  return {
    el,
    kapat() {
      clearInterval(dans);
      mino.kapat();
      canli.kapat();
      balonDur();
      fisekDur();
    },
  };
}
