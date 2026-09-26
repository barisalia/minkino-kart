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
import { adres, parilti, resim } from './gorsel';
import { kaydet, kayit } from './ilerleme';
import { denetle, istekUret, MUSTERI_SAYISI, PARA, paraMi, urunAdi, uygunMu, type Istek } from './istek';
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

/** Çizgili pazar tentesi */
const tente = () => h('div.pz-tente', { 'aria-hidden': 'true' });

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
  const el = h(
    'div.pz-acilis',
    { style: gorselStil('pazar/arkaplan') },
    tente(),
    h('div.ust-cubuk', {}, sol, h('div.orta'), sesDugmesi()),
    h(
      'div.pz-acilis-ic',
      {},
      logo(),
      h('div.pz-acilis-sahne', {}, h('div.pz-acilis-mino', {}, mino.el), h('div.pz-acilis-tezgah', { style: gorselStil('pazar/tezgah') }, ...meyveler)),
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
  const sahne = h('div.pz-sahne', {}, tente(), h('div.pz-mino', {}, mino.el), musteriKap);
  const sepetUrl = adres('pazar/sepet');
  const sepetIc = h('div.pz-sepet-ic');
  const sepet = h(`div.pz-sepet${sepetUrl ? '.pz-gorselli' : ''}`, { role: 'region', 'aria-label': 'Sepet' }, sepetUrl ? h('img.pz-sepet-resim', { src: sepetUrl, alt: '', draggable: 'false' }) : null, sepetIc);
  const verYazi = h('span', {}, A.ver);
  const ver = h('button.dugme.pz-ver', { type: 'button', hidden: true }, svg(IKON.onay), verYazi);
  const urunler = h('div.pz-urunler');
  const tezgah = h(`div.pz-tezgah${adres('pazar/tezgah') ? '.pz-gorselli' : ''}`, { style: gorselStil('pazar/tezgah') }, h('div.pz-tezgah-ust', {}, sepet, ver), urunler);
  const cikis = () => app.git('acilis');
  const el = h(
    'div.pz-pazar',
    { style: gorselStil('pazar/arkaplan'), 'data-yas': y },
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', cikis), h('div.orta', {}, balon), sesDugmesi()),
    yildizlar,
    sahne,
    tezgah,
  );

  let ist: Istek = istekUret(y, 0);
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

  const sepettekiler = () => [...sepetIc.querySelectorAll<HTMLElement>('.pz-urun:not(.pz-hazir)')].map((e) => e.dataset.urun ?? '');
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
    tasi(e, sepetIc);
    // ürün sepete düşünce küçük bir sekme (kayma bittikten sonra)
    setTimeout(() => salla(e, 'pz-dustu'), sure(300));
    efekt.yapis();
    salla(sepet, 'pz-zipla');
    sepetGuncelle();
    if (!ist.dugmeli) {
      if (denetle(ist, sepettekiler()) === 'tamam') bitir();
      else efekt.nota(sepettekiler().length);
    }
  }

  function urunEl(id: string, i: number): HTMLElement {
    const e = h('div.pz-urun', { 'data-urun': id, role: 'img', 'aria-label': paraMi(id) ? A.lira.replace('{sayi}', String(PARA[id])) : urunAdi(id) }, urunResmi(id));
    const yuva = h('div.pz-yuva', { style: `--i:${i}` }, e);
    sokuler.push(
      surukle({
        el: e,
        hedef: () => sepet,
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
      if (!aktif || !ist.dugmeli || e.parentElement !== sepetIc || performance.now() - sonBirakma < 400) return;
      efekt.dokunma();
      tasi(e, yuva);
      sepetGuncelle();
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
    ist = istekUret(y, i);
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
    if (TEST_MODU) el.dataset.istek = JSON.stringify({ istenen: ist.istenen, lira: ist.lira });
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
    urunler.querySelectorAll('.pz-parla').forEach((e) => e.classList.remove('pz-parla'));
    efekt.dogru();
    void resimSesi(ad);
    mino.tepki('zipla');
    parilti(sahne, 0.72, 0.5, 10);
    parilti(sahne, 0.24, 0.45, 8);
    const r = sahne.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width * 0.72, r.top + r.height * 0.5, 40);
    yildizlar.children[i]?.classList.add('dolu');
    efekt.yildiz(Math.min(2, i % 3));
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
    },
  };
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
  const el = h(
    'div.pz-senlik',
    { style: gorselStil('pazar/arkaplan') },
    tente(),
    h('div.ust-cubuk', {}, bosluk(), h('div.orta', {}, h('div.baslik-balon', {}, h('span', {}, P.senlik))), sesDugmesi()),
    h('div.pz-yildizlar.pz-hepsi', {}, ...Array.from({ length: MUSTERI_SAYISI }, () => h('i.pz-yildiz.dolu', {}, svg(IKON.yildiz)))),
    sahne,
    h('div.pz-senlik-alt', {}, birDaha, cik),
  );
  efekt.kilitAcildi();
  setTimeout(() => {
    const r = sahne.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width / 2, r.top + r.height / 3, 110);
  }, sure(200));
  void konus([P.senlik, P.senlik_dokun]);
  return {
    el,
    kapat() {
      clearInterval(dans);
      mino.kapat();
    },
  };
}
