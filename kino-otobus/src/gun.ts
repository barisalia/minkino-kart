/**
 * Kino'nun Otobüsü: bir gün (tek ekran). Üstte pencere (en çok 2 müşteri, yanlarında resimli istek balonu; ortada
 * tezgâhın arkasında Kino) ve sağda sos / süs rafı; altta KAPLAR, DONDURMA DOLABI (tat kapları), İKİ HAZIRLIK YUVASI
 * (her biri önündeki müşterinin rengiyle bağlı), KUMBARA kavanozu.
 *
 * Akış (hiç bekleme yok, her istasyon her an açık): kap seç (dokunduğun son yuva etkin) → tat kabına dokun (her
 * dokunuş bir top; Kino kepçeler, top yay çizerek uçar, "pof") → sos → süs → yeşil "ver" düğmesine dokun ya da
 * kuleyi müşteriye sürükle. Yanlış top: kuleye dokun, Kino en üsttekini yer. Kontrol: aynıysa kalpler ve 3 jeton;
 * farklıysa farklı parça balonda parlar, 2 jeton. Ret, ağlama, sabır sayacı yok.
 * Sıradaki işin yeri hafifçe parlar; 5 sn dokunulmazsa minik el. Gün 1'in ilk müşterisi Mino: her adımda el hemen
 * görünür, "Şimdi buna dokun!". Yakın çekimler (istek, kule, tadım, Kino'nun yemesi) ≤ 1 sn, dokununca hemen biter.
 */
import K from '../../content/kino-otobus.json';
import { efekt, KINO_SESI, konus } from '../../src/audio/ses';
import type { Soylenecek } from '../../src/audio/konusma';
import { arkaPlanDinle } from '../../src/kabuk/yon';
import { Mino } from '../../src/mino/mino';
import { h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { geriGonder, surukle } from '../../pazar/src/surukle';
import { KALP } from './cizim';
import { ekranMerkez, elSurukle, icinde, Tutulan } from './dokunsal';
import { dolapBuhari, duvarSusleri, kulahZinciri, sicakIsik } from './dukkan-ic';
import { AZ_HAREKET, Efekt, ekranSalla, salla } from './efekt';
import { KULAH_STOK, kepceBirak, kepceDolum, kulahAzMi, kulahKullan, kulahYap, lekeDuserMi, Sallama, SALLAMA_GEREK, sosDolum } from './el-isi';
import { isKosesi, KulahPaneli, kulahYigini, Temizlik, type IsOrtami } from './isler';
import { gunBitti as kayitGunBitti, kaydet, kayit } from './kayit';
import { kuleCiz, kuleOlcu } from './kule';
import {
  bosYuva,
  GUNLER,
  gunPlani,
  jetonHesapla,
  kapKoy,
  okuma,
  secimiIlerlet,
  siparisSonucu,
  SOS_RENK,
  sosKoy,
  susKoy,
  topKoy,
  verilebilir,
  ye,
  yuvaIsi,
  type Dondurma,
  type Gun,
  type Is,
  type Kap,
  type Katman,
  type Sos,
  type Sus,
  type Tat,
  type Yer,
  type Yuva,
} from './model';
import { kutuOlcu, Musteri } from './musteri';
import { dondurmaciKino, otobusAdresleri, otobusEl } from './otobus';
import { ses } from './sesler';
import { adres, DOLAP_GOZLERI, dolapYerleri, gorsel, IC_ARKA_CERCEVE, kapAdi, manzaraAdres, sosSiseAdi, sosUstAdi, susAdi, susRafAdi, tatKabiAdi, topAdi, type VarlikAdi } from './varliklar';
import { onYukle, resimleriTopla } from './yukle';

const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const ozelMi = () => TEST_MODU || (typeof document !== 'undefined' && !!document.body?.dataset.onizleme);
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, AZ_HAREKET ? Math.min(ms, 200) : sure(ms)));
/** Dokunulmazsa el ipucu bu kadar sonra çıkar (ms) */
const IPUCU_MS = 5000;
/** müşteri yuvalarının renkleri (kurdele): sol pembe, sağ nane */
const YUVA_RENK = ['#FF8DB4', '#7FD6B0'];

/** Sıradaki iş (parlama, test): istasyonun adı */
export type AdimAdi = 'kap' | 'top' | 'sos' | 'sus' | 'ye' | 'ver' | 'sec' | 'yuva';

/** Pencere manzarası: park, plaj (assets/film), doğum günü bahçesi (görseli yoksa park + kodla balonlar ve flama) */
export function manzara(yer: Yer): HTMLElement {
  const dg = yer === 'dogumgunu' ? adres('pencere-dogumgunu') : null;
  if (dg) return h('div.ko-manzara', { 'data-yer': yer }, h('div.ko-mz', { style: `background-image:url("${dg}")` }));
  const mekan = yer === 'plaj' ? 'plaj' : 'park';
  const kat = (ad: 'arka-uzak' | 'arka-orta' | 'arka-on', sinif: string) => h(`div.ko-mz.${sinif}`, { style: `background-image:url("${manzaraAdres(mekan, ad)}")` });
  const ekler: (HTMLElement | null)[] =
    yer === 'dogumgunu'
      ? [
          h('div.ko-mz-balonlar', { 'aria-hidden': 'true' }, ...['#FF8DB4', '#FFE45C', '#8ED3F2', '#A9DB8C', '#8C88E0'].map((r, i) => h('i', { style: `--r:${r};--i:${i}` }))),
          h('div.ko-mz-flama', { 'aria-hidden': 'true', html: gorsel('sus-flama') }),
        ]
      : [];
  return h('div.ko-manzara', { 'data-yer': yer }, kat('arka-uzak', 'ko-mz-uzak'), kat('arka-orta', 'ko-mz-orta'), ...ekler, kat('arka-on', 'ko-mz-on'));
}

interface Slot {
  i: number;
  musteri: Musteri | null;
  yuva: Yuva;
  /** uçmakta olan toplar (kap sırası → top sırası): uçuş bitince görünür */
  ucan: Set<number>[];
  /** Mino'nun doğum günü: kupada mum */
  mum: 'yanik' | 'sonuk' | null;
  yerEl: HTMLElement;
  balonYer: HTMLElement;
  yuvaEl: HTMLElement;
  kuleKap: HTMLElement;
  verDugme: HTMLButtonElement;
  surukleBirak: (() => void)[];
  /** müşterinin sevinci (dans, çak) sürerken: dokununca biter */
  atla: (() => void) | null;
}

export function gunEkrani(app: Uygulama, p: { gun?: number } = {}): Ekran {
  const gun = Math.max(1, Math.min(3, Math.floor(p.gun ?? 1))) as Gun;
  const yas = kayit.yas ?? 'kucuk';
  const ayar = GUNLER[gun];
  const ozel = ozelMi();
  const kuyruk = gunPlani(gun, yas);
  const TOPLAM = kuyruk.length;
  let kapandi = false;
  const zamanlar: number[] = [];
  const sonra = (ms: number, f: () => void) => zamanlar.push(window.setTimeout(() => !kapandi && f(), ms));

  // ---------------------------------------------------------------- konuşma sırası
  let sira: Promise<void> = Promise.resolve();
  let bekleyenSoz = 0;
  const minolar = new Set<Mino>();
  const kino = dondurmaciKino(kayit.alinan.includes('kino-sapka'));
  /** Sırayla söyler: 'mino' anlatıcı (Mino'nun sesi), 'kino' Kino. onemli değilse ve sırada söz varsa söylenmez. */
  const soyle = (soz: Soylenecek, kim: 'mino' | 'kino' = 'mino', onemli = true): Promise<void> => {
    if (!onemli && bekleyenSoz > 0) return Promise.resolve();
    bekleyenSoz++;
    const is = sira.then(async () => {
      if (kapandi) return;
      for (const m of minolar) m.agizSus = kim !== 'mino';
      if (kim === 'kino') kino.konus(true);
      try {
        await konus(soz, kim === 'kino' ? KINO_SESI : {});
      } finally {
        for (const m of minolar) m.agizSus = false;
        if (kim === 'kino') kino.konus(false);
      }
    });
    sira = is.catch(() => undefined).then(() => {
      bekleyenSoz--;
    });
    return is;
  };
  /** aynı söz en çok bu aralıkla bir (ms) */
  const sonSoz = new Map<string, number>();
  const seyrekSoyle = (soz: string, kim: 'mino' | 'kino', aralik = 6000) => {
    const t = performance.now();
    if (t - (sonSoz.get(soz) ?? -1e9) < aralik) return;
    sonSoz.set(soz, t);
    void soyle(soz, kim, false);
  };

  // ---------------------------------------------------------------- sahne
  const efekt_ = new Efekt(app.kok);
  const kinoYer = h('div.ko-kino-yer', { 'data-karakter-kap': 'kino' }, kino.el);
  const slotEl = [0, 1].map((i) => {
    const yerEl = h('div.ko-yer', { 'data-yer': String(i) });
    const balonYer = h('div.ko-balon-yer', { 'data-yer': String(i) });
    return { kap: h('div.ko-slot', { 'data-slot': String(i), style: `--kurdele:${YUVA_RENK[i]}` }, balonYer, yerEl), yerEl, balonYer };
  });
  const pencere = h(
    'div.ko-pencere',
    {},
    manzara(ayar.yer),
    h('i.ko-mino-gecis-yer', { 'aria-hidden': 'true' }),
    h('div.ko-musteriler', {}, slotEl[0].kap, h('div.ko-kino-bosluk', {}, kinoYer), slotEl[1].kap),
    h('i.ko-pencere-cerceve', { 'aria-hidden': 'true' }),
    // dükkânın içi: fırfırın altında sallanan külah zinciri (Kino'nun arkasında, müşterilerin önünde)
    kulahZinciri(),
  );
  // Kino da müşteriler gibi belden yukarı (tezgâhın arkasında), boyu tablodan
  const kinoOlcu = kutuOlcu('kino', 0.8);
  kinoYer.setAttribute('style', `width:calc(var(--pen-h) * ${kinoOlcu.en.toFixed(4)});bottom:calc(var(--pen-h) * ${kinoOlcu.alt.toFixed(4)});aspect-ratio:${kinoOlcu.oran}`);

  // raf: soslar ve süsler (Gün 1'de yalnız çikolata sos); hiçbir zaman küçülmez, artınca iki sıra
  // dokunuş her zaman geçerli; sürükleme dokunsal yol (şişeyi eğip dök, kavanozu salla, süsü sürükle)
  const surukleKaldir: (() => void)[] = [];
  const sosDugmeleri = ayar.soslar.map((s) => {
    const b = h('button.ko-raf-esya.ko-sos', { type: 'button', 'data-sos': s, 'aria-label': `${s} sos`, html: gorsel(sosSiseAdi(s)) });
    b.addEventListener('click', () => sosBas(s, b));
    surukleKaldir.push(sosSurukle(s, b));
    return b;
  });
  const susDugmeleri = ayar.susler.map((s) => {
    const b = h('button.ko-raf-esya.ko-sus', { type: 'button', 'data-sus': s, 'aria-label': s, html: gorsel(susRafAdi(s)) });
    b.addEventListener('click', () => susBas(s, b));
    surukleKaldir.push(s === 'serpinti' ? serpintiSurukle(b) : susSurukle(s, b));
    return b;
  });
  const rafEsya = [...sosDugmeleri, ...susDugmeleri];
  const rafSutun = Math.ceil(rafEsya.length / (rafEsya.length > 1 ? 2 : 1));
  const raf = h('div.ko-raf', { 'data-n': String(rafEsya.length), style: `--sutun:${rafSutun}` }, ...rafEsya);

  // kaplar
  // külah rafı: iç içe külahlar (sabah az; külah yapınca dolar, hiç bitmez)
  let kulahStok: number = KULAH_STOK.bas;
  const kapDugmeleri = ayar.kaplar.map((k) => {
    const b = h('button.ko-kap-dugme', { type: 'button', 'data-kap': k, 'aria-label': k, html: k === 'kulah' ? kulahYigini(kulahStok) : gorsel(kapAdi(k)) });
    b.addEventListener('click', () => kapBas(k, b));
    return b;
  });
  const kaplar = h('div.ko-kaplar', { 'data-n': String(kapDugmeleri.length) }, ...kapDugmeleri);
  const kulahDugme = kapDugmeleri[ayar.kaplar.indexOf('kulah')] ?? null;

  // dondurma dolabı: tat kapları (Gün 1 tek sıra, büyük); kepçeyle sürükleyince top oluşur
  const tatDugmeleri = ayar.tatlar.map((t) => {
    const b = h('button.ko-tat', { type: 'button', 'data-tat': t, 'aria-label': t, html: gorsel(tatKabiAdi(t)) }, h('i.ko-kepce-yer'));
    b.addEventListener('click', () => tatBas(t, b));
    surukleKaldir.push(kepceSurukle(t, b));
    return b;
  });
  const dolapUrl = adres('dolap');
  const dolapIc = h('div.ko-dolap-ic', {}, ...tatDugmeleri, dolapBuhari());
  const dolap = h('div.ko-dolap', { 'data-sira': ayar.tatlar.length > 3 ? '2' : '1', style: dolapUrl ? `--dolap-url:url("${dolapUrl}");--dolap-oran:${DOLAP_GOZLERI.oran.toFixed(4)}` : undefined }, h('i.ko-dolap-cam', { 'aria-hidden': 'true' }), dolapIc);
  if (dolapUrl) {
    // Gemini dolabı: kaplar görseldeki gözlere (fazlası dolabın önüne) oturur (varliklar.ts → DOLAP_GOZLERI)
    dolap.classList.add('ko-resimli');
    const yerler = dolapYerleri(tatDugmeleri.length);
    tatDugmeleri.forEach((b, i) => {
      const y = yerler[i];
      b.style.cssText += `left:${y.sol.toFixed(2)}%;top:${y.ust.toFixed(2)}%;width:${y.en.toFixed(2)}%;height:${y.boy.toFixed(2)}%;--kap-alt:${y.kapAlt.toFixed(2)}%;--kap-boy:${y.kapBoy.toFixed(2)}%`;
      if (y.ust >= DOLAP_GOZLERI.sinir * 100 - 0.01) b.classList.add('ko-tat-on');
    });
    // boş kalan gözde Kino'nun kepçesi durur
    const bos = DOLAP_GOZLERI.goz.slice(tatDugmeleri.length);
    if (bos.length) {
      const x = bos[bos.length - 1];
      dolap.querySelector('.ko-dolap-ic')!.append(h('i.ko-dolap-kepce', { 'aria-hidden': 'true', style: `left:${((x - DOLAP_GOZLERI.aralik / 2) * 100).toFixed(2)}%;width:${(DOLAP_GOZLERI.aralik * 100).toFixed(2)}%`, html: gorsel('kepce') }));
    }
  }

  // iki hazırlık yuvası
  const slotlar: Slot[] = [0, 1].map((i) => {
    const kuleKap = h('div.ko-yuva-kule');
    const verDugme = h('button.ko-ver', { type: 'button', 'aria-label': 'Ver', hidden: true }, svg(IKON.onay));
    const yuvaEl = h('div.ko-yuva', { 'data-yuva': String(i), style: `--kurdele:${YUVA_RENK[i]}` }, h('i.ko-kurdele', { 'aria-hidden': 'true' }), h('i.ko-yuva-altlik', { 'aria-hidden': 'true' }), kuleKap, verDugme);
    return { i, musteri: null, yuva: bosYuva(), ucan: [new Set<number>(), new Set<number>()], mum: null, yerEl: slotEl[i].yerEl, balonYer: slotEl[i].balonYer, yuvaEl, kuleKap, verDugme, surukleBirak: [], atla: null };
  });
  const yuvalar = h('div.ko-yuvalar', {}, ...slotlar.map((s) => s.yuvaEl));

  // kumbara kavanozu (tezgâh çizgisinde, temas gölgesiyle)
  let bugun = 0;
  const kumbaraSayi = h('b.ko-kumbara-sayi', {}, '0');
  const kumbara = h('button.ko-kumbara', { type: 'button', 'aria-label': 'Kumbara', html: gorsel('kumbara-kavanoz') }, kumbaraSayi);
  // kumbaranın üstünde külah makinesi (iş köşesi): külah azalınca parlar, dokununca külah yapılır
  const kose = isKosesi(() => kulahPaneliAc());
  const kumbaraYer = h('div.ko-kumbara-yer', {}, kose.el, h('i.ko-golge', { 'aria-hidden': 'true' }), kumbara);
  kumbara.addEventListener('click', () => {
    efekt.dokunma();
    salla(kumbara, 'ko-zipla');
  });

  // duvar süsleri (kara tahta, kavanoz rafı, lamba): sos rafının üstündeki boş duvara (olc → duvarYerlestir)
  const duvar = duvarSusleri();
  const ustKat = h('div.ko-ust-kat', {}, duvar.el, pencere, raf);
  const altKat = h('div.ko-alt-kat', {}, h('i.ko-tezgah-on', { 'aria-hidden': 'true' }), kaplar, dolap, yuvalar, kumbaraYer);
  // 3 kaplı günde tezgâh sıkışık: dolap daralmaz, öbürleri biraz incelir (kino-otobus.css → .ko-sik)
  if (dolapUrl && ayar.kaplar.length >= 3) altKat.classList.add('ko-sik');
  const icArka = adres('ic-arka');
  if (icArka) {
    // Gemini pencere çerçevesi (gri maske şeffaf): 9 dilim; fırfır ve pervaz yatayda, yanlar dikeyde esner, her en-boyda
    // pencereye oturur (varliklar.ts → IC_ARKA_CERCEVE)
    const C = IC_ARKA_CERCEVE;
    const kal = (px: number) => `calc(${(px * C.olcek).toFixed(3)} * var(--u))`;
    pencere.style.setProperty('--ic-cerceve', `url("${icArka}")`);
    pencere.style.setProperty('--ic-dilim', `${C.ust} ${C.sag} ${C.alt} ${C.sol}`);
    pencere.style.setProperty('--ic-kalinlik', `${kal(C.ust)} ${kal(C.sag)} ${kal(C.alt)} ${kal(C.sol)}`);
    pencere.style.setProperty('--ic-yan', kal(C.sol));
    pencere.style.setProperty('--ic-ust', kal(C.ust));
    pencere.style.setProperty('--ic-alt', kal(C.alt));
    ustKat.classList.add('ko-ic-resimli');
  }
  const tezgahOn = adres('tezgah-on');
  if (tezgahOn) altKat.style.setProperty('--tezgah-on', `url("${tezgahOn}")`);
  const duzen = h('div.ko-duzen', { 'data-gun': String(gun) }, ustKat, altKat);
  // dikeyde kaplar (166u) ile raf yan yana: dar telefonda dolu raf (Gün 3: 4 sütun) sığmaz, şişeler kap düğmelerinin
  // üstüne binerdi; o zaman raf kendi şeridine geçer (olc → .ko-raf-serit). Gereken en: 24u kenar + kaplar + 8u + raf
  const yanYanaEn = 24 + 166 + 8 + Math.max(rafSutun * 64 + (rafSutun - 1) * 4 + 8, rafEsya.length === 1 ? 150 : 0);
  const kamera = h('div.ko-kamera', {}, duzen);

  // üst çubuk: geri, gün ve hedef kalpleri, ses
  const hedefEl = h('div.ko-hedef', { 'data-hedef': String(ayar.hedef), 'data-mutlu': '0' }, ...Array.from({ length: ayar.hedef }, () => h('i', { html: KALP })));
  const gunEtiket = h('div.ko-gun-etiket', { 'aria-label': K.arayuz.gun.replace('{gun}', String(gun)) }, h('b.ko-gun-sayi', {}, String(gun)), hedefEl);
  const ust = h('div.ust-cubuk.ko-ust', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.git('acilis'), 'kucuk'), h('div.orta', {}, gunEtiket), sesDugmesi());

  const elIpucu = h('div.ko-el-ipucu', { 'aria-hidden': 'true' }, h('i.ko-el-dalga'), h('span.ko-el-el', {}, svg(IKON.el)));
  const sahne = h('div.ko-sahne', {}, kamera, sicakIsik(), efekt_.el);
  const el = h('div.ko-gun', { 'data-gun': String(gun), 'data-yer': ayar.yer, 'data-yas': yas }, sahne, ust, elIpucu);

  // ölçü: --u (tasarım birimi: 844×390 telefonda ~1 px), yön
  const olc = () => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const yatay = r.width >= r.height;
    const sahneEn = yatay ? Math.min(r.width, r.height * 2.17) : r.width;
    // çentik payı (safe-area) genişlikten düşülür
    const cs = getComputedStyle(duzen);
    const pay = Math.max(0, parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) - 24 * (parseFloat(el.style.getPropertyValue('--u')) || 1));
    const u = yatay ? Math.min(r.height / 390, (sahneEn - pay) / 840) : Math.min((r.width - pay) / 420, r.height / 820);
    el.style.setProperty('--u', `${u.toFixed(4)}px`);
    el.dataset.yon = yatay ? 'yatay' : 'dikey';
    duzen.classList.toggle('ko-raf-serit', !yatay && (r.width - pay) / u < yanYanaEn);
    // kısa telefonda (375×667: boy sınırlı, artan yer yok) şerit biraz alçalır, pencere müşteri balonlarına yer bıraksın
    duzen.classList.toggle('ko-kisa', !yatay && r.height / u < 880);
    // külah tezgâhı kartı (yatay tasarım 620×320) çok kareleşiyorsa dikey düzenine geçer (kino-otobus.css → .ko-is-dik)
    el.classList.toggle('ko-is-dik', Math.min(0.92 * r.width, 620 * u) / Math.min(0.86 * r.height, 320 * u) < 1.6);
    el.style.setProperty('--sahne-en', `${sahneEn.toFixed(1)}px`);
    // müşteri katının ve yuvanın ölçüsü (kule ve karakter boyları bunun katı)
    const mk = pencere.querySelector('.ko-musteriler')!.getBoundingClientRect();
    // dar pencerede karakterler yan yana sığsın: genişlikten de sınırlanır
    const penH = Math.min(mk.height, mk.width / 3.6);
    if (penH > 0) el.style.setProperty("--pen-h", `${penH.toFixed(1)}px`);
    const yk = slotlar[0].yuvaEl.getBoundingClientRect();
    if (yk.height) el.style.setProperty('--yuva-h', `${(yk.height - 24 * u).toFixed(1)}px`);
    duvarYerlestir(u, yatay);
  };
  /** duvar süsleri: sos rafının üstünde, ses düğmesinin solunda kalan boş duvar (dikeyde duvar yok) */
  function duvarYerlestir(u: number, yatay: boolean) {
    const k = ustKat.getBoundingClientRect();
    const r = raf.getBoundingClientRect();
    const sesD = ust.lastElementChild?.getBoundingClientRect();
    if (!yatay || !k.width || !r.width || !sesD) return duvar.gizle();
    const sag = Math.min(sesD.left - 6 * u, k.right - 8 * u);
    const sol = r.left;
    const tepe = k.top + 2 * u;
    const alt = r.top - 2 * u;
    const sesAlti = Math.min(alt, sesD.bottom + 2 * u);
    duvar.yerlestir(
      { sol: sol - k.left, ust: tepe - k.top, en: sag - sol, boy: sesAlti - tepe },
      { sol: sol - k.left, ust: sesAlti - k.top, en: k.right - 8 * u - sol, boy: alt - sesAlti },
      u,
    );
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(olc) : null;
  ro?.observe(el);

  // her dokunuşta: el ipucu kaybolur; boşluğa dokununca minik buz yıldızı (sessiz)
  let sonDokunus = performance.now();
  el.addEventListener('pointerdown', (e) => {
    sonDokunus = performance.now();
    elIpucuGizle();
    const t = e.target as Element;
    if (t.closest('button, .ko-musteri, .ko-kule, .ko-kino-yer, .ko-balon, .ko-yuva, .ko-leke, .ko-sinek, .ko-is-panel')) return;
    const k = efekt_.kutu();
    efekt_.buzYildizi(e.clientX - k.left, e.clientY - k.top);
  });

  // ---------------------------------------------------------------- yakın çekim (kamera; ≤ 1 sn, dokununca biter)
  let yakinBitir: (() => void) | null = null;
  let yutulacakTik = false;
  const sonYakin = new Map<string, number>();
  function yakin(hedef: Element, olcek: number, ad: string, o: { ms?: number; odak?: number | 'kino'; aralik?: number } = {}) {
    if (TEST_MODU || AZ_HAREKET || yakinBitir || kapandi) return;
    const simdi = performance.now();
    if (simdi - (sonYakin.get(ad) ?? -1e9) < (o.aralik ?? 0)) return;
    sonYakin.set(ad, simdi);
    const k = kamera.getBoundingClientRect();
    const r = hedef.getBoundingClientRect();
    if (!k.width || !r.width) return;
    const cx = r.left + r.width / 2 - k.left;
    const cy = r.top + r.height / 2 - k.top;
    const tx = Math.min(0, Math.max(k.width - k.width * olcek, k.width / 2 - cx * olcek));
    const ty = Math.min(0, Math.max(k.height - k.height * olcek, k.height / 2 - cy * olcek));
    const hedefT = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${olcek})`;
    el.classList.add('ko-yakin');
    el.dataset.odak = o.odak === undefined ? '' : String(o.odak);
    const a = kamera.animate([{ transform: 'none' }, { transform: hedefT }], { duration: 300, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
    const zaman = window.setTimeout(() => bitir(), 300 + (o.ms ?? 1000));
    const bitir = () => {
      if (yakinBitir !== bitir) return;
      yakinBitir = null;
      clearTimeout(zaman);
      a.cancel();
      kamera.animate([{ transform: hedefT }, { transform: 'none' }], { duration: 260, easing: 'ease-out' });
      el.classList.remove('ko-yakin');
      delete el.dataset.odak;
    };
    yakinBitir = bitir;
  }
  // yakın çekimdeyken dokunuş yalnız kamerayı geri açar (o dokunuşun tıklaması yutulur)
  el.addEventListener(
    'pointerdown',
    (e) => {
      if (!yakinBitir) return;
      yakinBitir();
      yutulacakTik = true;
      e.stopPropagation();
    },
    true,
  );
  el.addEventListener(
    'click',
    (e) => {
      if (!yutulacakTik) return;
      yutulacakTik = false;
      e.stopPropagation();
      e.preventDefault();
    },
    true,
  );

  // ---------------------------------------------------------------- Kino
  let kinoBas = -9;
  /** çak: Kino müşterinin yanına eğilip patisini kaldırır (yon -1 sol müşteri, 1 sağ) */
  let cakBas = -9;
  let cakYon = 1;
  kino.ekHareket = (pz) => {
    // dokununca kulakları sallanır, hoplar
    const simdi = performance.now() / 1000;
    const g = simdi - kinoBas;
    if (g < 1.2) {
      const z = Math.max(0, Math.min(1, g / 0.12, (1.2 - g) / 0.25));
      pz.kulakSol += 14 * Math.sin(g * 20) * z;
      pz.kulakSag += 14 * Math.sin(g * 20 + 1) * z;
      pz.y -= 3 * Math.abs(Math.sin(g * 9)) * z;
      pz.kuyruk += 30 * Math.sin(g * 30) * z;
    }
    const c = simdi - cakBas;
    if (c < 0.85) {
      const z = Math.max(0, Math.min(1, c / 0.18, (0.85 - c) / 0.2));
      // sol müşteri: Kino'nun ekranda soldaki kolu (kol-sol)
      if (cakYon < 0) pz.yukSol = 155 * z;
      else pz.yukSag = 155 * z;
      pz.don += cakYon * 7 * z;
      pz.kuyruk += 25 * Math.sin(c * 28) * z;
    }
  };
  /** Kino'nun küçük tepkisi (her dokunsal işte): kulak sallanır, hop, kuyruk */
  const kinoTepki = (heyecan = false) => {
    kinoBas = performance.now() / 1000;
    if (heyecan && kino.ifadeVar('heyecan')) kino.ifade('heyecan', 700);
  };
  kinoYer.addEventListener('click', () => {
    efekt.dokunma();
    kinoBas = performance.now() / 1000;
    void kino.oynat('sevin', 800);
    if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 900);
    const [x, y] = efekt_.merkez(kino.el, 0.5, 0.3);
    efekt_.kalpler(x, y, 2);
    // bazen hapşırır (dondurma dolabı soğuk)
    if (Math.random() < 0.25) {
      ses.hapsu();
      efekt_.pof(x, y + 20, 0.6);
    } else seyrekSoyle(K.kino.hav, 'kino', 2500);
  });
  /** Kino bir şeyi yer: ağzına uçar, ham ham, dili dışarıda keyif */
  async function kinoYesin(icerik: string, [x, y]: [number, number], soz?: string) {
    const [ax, ay] = kino.k.agiz;
    const hedef = efekt_.merkez(kino.el, ax, ay);
    void kino.oynat('bak', 300);
    await efekt_.ucur(h('div.ko-ucan-parca', { html: icerik }), [x, y], hedef, { ms: 420, kavis: -70, boy1: 0.45 });
    if (kapandi) return;
    ses.ham();
    void kino.oynat('ye', 900);
    if (kino.ifadeVar('keyif')) kino.ifade('keyif', 1100);
    kino.ek('dil-disarida', true);
    sonra(sure(1000), () => kino.ek('dil-disarida', false));
    efekt_.parilti(hedef[0], hedef[1], 4, 0.5);
    yakin(kino.el, 1.5, 'kino', { odak: 'kino', ms: 700, aralik: 25000 });
    if (soz) seyrekSoyle(soz, 'kino', 7000);
  }
  /** Kino kepçeyi daldırır: kepçe kabın üstünde döner (girdi kilitlenmez, üst üste biner) */
  function kepce(b: HTMLElement) {
    ses.sikk();
    void kino.oynat('var', 260);
    if (TEST_MODU || AZ_HAREKET) return;
    const yer = b.querySelector('.ko-kepce-yer')!;
    const k = h('i.ko-kepce', { html: gorsel('kepce') });
    yer.append(k);
    // Gemini kepçesi yatay (çanak solda, sap sağda): sağ üstten gelir, çanak kaba dalar (saat yönünde), kıvrılıp kalkar
    k.animate(
      [
        { transform: 'translate(-20%, -110%) rotate(-25deg)', opacity: 0 },
        { transform: 'translate(-45%, -10%) rotate(28deg)', opacity: 1, offset: 0.45 },
        { transform: 'translate(-55%, -20%) rotate(5deg)', opacity: 1, offset: 0.7 },
        { transform: 'translate(-40%, -120%) rotate(-30deg)', opacity: 0 },
      ],
      { duration: 340, easing: 'ease-out' },
    ).finished.then(
      () => k.remove(),
      () => k.remove(),
    );
    // kapta kepçe izi
    salla(b, 'ko-kepcelendi');
  }

  // ---------------------------------------------------------------- yuvalar
  let aktif = 0;
  const kuleBoyutu = (d: Dondurma, cift: boolean) => {
    const o = kuleOlcu(d.kap, Math.max(d.toplar.length, 1), d.susler.length > 0);
    const en = cift ? 0.5 : 1;
    return `min(calc(var(--yuva-h) * ${(0.92 / Math.max(o.boy, 1.9)).toFixed(4)}), calc(var(--yuva-w) * ${((0.86 * en) / o.en).toFixed(4)}), calc(var(--u) * ${cift ? 46 : 62}))`;
  };
  function yuvaCiz(s: Slot) {
    s.surukleBirak.forEach((f) => f());
    s.surukleBirak = [];
    const y = s.yuva;
    const cift = y.kaplar.length > 1;
    s.kuleKap.replaceChildren(
      ...y.kaplar.map((d, k) => {
        const kule = kuleCiz({ ...d, mum: k === 0 ? s.mum : null }, { gizliTop: s.ucan[k] });
        const alt = h(`div.ko-alt${k === y.secili && cift ? '.ko-secili' : ''}`, { 'data-k': String(k), style: `--t:${kuleBoyutu(d, cift)}` }, kule);
        s.surukleBirak.push(
          surukle({
            el: kule,
            hedef: () => s.musteri?.el ?? s.yerEl,
            aktif: () => !!s.musteri?.hazir && !s.musteri.bitti && verilebilir(s.yuva, s.musteri.sip),
            birak: (hedefte, dokunus) => {
              if (dokunus) {
                geriGonder(kule);
                kuleBas(s, k);
              } else if (hedefte) {
                kule.style.transform = '';
                void servis(s);
              } else geriGonder(kule);
            },
          }),
        );
        // sürüklenemiyorken de dokunuş çalışır
        kule.addEventListener('click', () => {
          if (s.musteri?.hazir && !s.musteri.bitti && verilebilir(s.yuva, s.musteri.sip)) return;
          kuleBas(s, k);
        });
        return alt;
      }),
    );
    s.kuleKap.dataset.kap = String(y.kaplar.length);
    s.yuvaEl.classList.toggle('ko-aktif', aktif === s.i);
    s.yuvaEl.dataset.dolu = y.kaplar.some((d) => d.toplar.length) ? '1' : '0';
    const m = s.musteri;
    const verir = !!m && m.hazir && !m.bitti && verilebilir(y, m.sip);
    s.verDugme.hidden = !verir;
    if (ozel) s.yuvaEl.dataset.yuva_durum = JSON.stringify(y);
  }
  /** son dokunulan kule (dokunuş ve sürükleme aynı anda iki kez saymasın) */
  let sonKuleBas = 0;
  function kuleBas(s: Slot, k: number) {
    const t = performance.now();
    if (t - sonKuleBas < 250) return;
    sonKuleBas = t;
    if (aktif !== s.i) {
      aktifSec(s.i);
      return;
    }
    if (s.yuva.kaplar.length > 1 && s.yuva.secili !== k) {
      s.yuva.secili = k;
      ses.tik();
      yuvaCiz(s);
      adimGuncelle();
      return;
    }
    yeBas(s);
  }
  function aktifSec(i: number) {
    if (aktif === i) return;
    aktif = i;
    efekt.dokunma();
    slotlar.forEach(yuvaCiz);
    salla(slotlar[i].yuvaEl, 'ko-zipla');
    adimGuncelle();
  }
  slotlar.forEach((s) => {
    s.yuvaEl.addEventListener('click', (e) => {
      if ((e.target as Element).closest('.ko-ver, .ko-kule')) return;
      aktifSec(s.i);
    });
    s.verDugme.addEventListener('click', () => void servis(s));
  });

  /** Kulenin kopyası (uçuş ve tadım): ölçüsü piksele çevrilir (yuvanın dışında da aynı boy) */
  function kuleKopya(kap: HTMLElement): HTMLElement {
    const kopya = kap.cloneNode(true) as HTMLElement;
    const asil = [...kap.querySelectorAll<HTMLElement>('.ko-alt')];
    kopya.querySelectorAll<HTMLElement>('.ko-alt').forEach((a, i) => {
      const k = asil[i]?.querySelector<HTMLElement>('.ko-kule');
      const en = Number(k?.style.getPropertyValue('--en')) || 1;
      const px = k ? k.getBoundingClientRect().width / en : 40;
      a.style.setProperty('--t', `${px.toFixed(1)}px`);
    });
    kopya.classList.add('ko-kule-kopya');
    return kopya;
  }

  /** Uçan bir şeyi yuvadaki yerine indirir (yer: kulede o parçanın elemanı) */
  async function yuvayaUcur(s: Slot, icerik: string, bas: [number, number], secici: string, kap: number) {
    const hedefEl = s.kuleKap.querySelector(`.ko-alt[data-k="${kap}"] ${secici}`);
    const hedef = hedefEl ? efekt_.merkez(hedefEl) : efekt_.merkez(s.kuleKap);
    const r = hedefEl?.getBoundingClientRect();
    const genis = r ? r.width : 60;
    await efekt_.ucur(h('div.ko-ucan-parca', { html: icerik, style: `width:${genis.toFixed(0)}px` }), bas, hedef, { ms: 380, kavis: -90 });
  }

  // ---------------------------------------------------------------- dokunuşlar
  const aktifSlot = () => slotlar[aktif];
  function kapBas(kap: Kap, b: HTMLElement) {
    const s = aktifSlot();
    const kacKap = s.musteri?.sip.istek.length ?? 1;
    const r = kapKoy(s.yuva, kap, kacKap);
    salla(b, 'ko-bas');
    if (r.olay === 'ayni') {
      ses.tik();
      salla(s.kuleKap.querySelector(`.ko-alt[data-k="${s.yuva.secili}"] .ko-k-kap`), 'ko-zipla');
      adimGuncelle();
      return;
    }
    ses.tik();
    efekt.secim();
    if (kap === 'kulah') kulahAlindi();
    s.ucan[s.yuva.secili]?.clear();
    yuvaCiz(s);
    const kk = s.kuleKap.querySelector(`.ko-alt[data-k="${s.yuva.secili}"] .ko-k-kap`);
    salla(kk, 'ko-kap-dus');
    if (kk) {
      const [x, y] = efekt_.merkez(kk, 0.5, 0.3);
      efekt_.parilti(x, y, 4, 0.5);
    }
    for (const t of r.tasan) void kinoYesin(gorsel(topAdi(t)), efekt_.merkez(s.kuleKap, 0.5, 0.2));
    adimGuncelle();
  }

  let kuleSoylendi = false;
  /** Top: dokununca Kino kepçeler; kepçe sürüklenip bırakılınca (elBas: topun ekrandaki yeri) top oradan iner */
  function tatBas(tat: Tat, b: HTMLElement, elBas?: [number, number]) {
    const s = aktifSlot();
    const r = topKoy(s.yuva, tat);
    if (!elBas) salla(b, 'ko-bas');
    if (r === 'kapYok') {
      ses.degil();
      kapDugmeleri.forEach((d) => salla(d, 'ko-cagir'));
      seyrekSoyle(K.mino.kap_sor, 'mino', 5000);
      // kepçedeki top kaba geri döner
      if (elBas) void efekt_.ucur(h('div.ko-ucan-parca', { html: gorsel(topAdi(tat)), style: `width:${(40 * birim()).toFixed(0)}px` }), elBas, efekt_.merkez(b, 0.5, 0.4), { ms: 300, kavis: -40, boy1: 0.3 });
      return;
    }
    if (!elBas) kepce(b);
    const bas = elBas ?? efekt_.merkez(b, 0.5, 0.3);
    if (r === 'tasti') {
      // kap dolu: Kino havada yakalar, yer
      void kinoYesin(gorsel(topAdi(tat)), bas);
      return;
    }
    const k = s.yuva.secili;
    const d = s.yuva.kaplar[k];
    const n = d.toplar.length - 1;
    s.ucan[k].add(n);
    if (s.musteri) secimiIlerlet(s.yuva, s.musteri.sip);
    yuvaCiz(s);
    adimGuncelle();
    void (async () => {
      await yuvayaUcur(s, gorsel(topAdi(tat)), bas, `.ko-k-top[data-i="${n}"]`, k);
      if (kapandi) return;
      if (!s.ucan[k].delete(n)) return;
      yuvaCiz(s);
      const top = s.kuleKap.querySelector(`.ko-alt[data-k="${k}"] .ko-k-top[data-i="${n}"]`);
      salla(top, 'ko-pof');
      ses.pof(n);
      kinoTepki();
      if (top) {
        const [x, y] = efekt_.merkez(top, 0.5, 0.4);
        efekt_.parilti(x, y, 3, 0.45, '#DDF6FF');
      }
      // üçüncü top: kule sallanır, Kino "Ooo, kule!"
      if (n === 2) {
        salla(s.kuleKap.querySelector(`.ko-alt[data-k="${k}"] .ko-kule`), 'ko-kule-salla');
        ses.vuuu();
        if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 900);
        void kino.oynat('sevin', 700);
        if (!kuleSoylendi) {
          kuleSoylendi = true;
          void soyle(K.kino.kule, 'kino', false);
        }
      }
    })();
  }

  function sosBas(sos: Sos, b: HTMLElement) {
    const s = aktifSlot();
    const r = sosKoy(s.yuva, sos);
    salla(b, 'ko-bas');
    if (r === 'topYok') {
      ses.degil();
      return;
    }
    if (r === 'ayni') {
      salla(s.kuleKap.querySelector(`.ko-alt[data-k="${s.yuva.secili}"] .ko-k-sos`), 'ko-zipla');
      return;
    }
    ses.slurp();
    yuvaCiz(s);
    const so = s.kuleKap.querySelector<HTMLElement>(`.ko-alt[data-k="${s.yuva.secili}"] .ko-k-sos`);
    if (so && !TEST_MODU && !AZ_HAREKET) void sosDok(sos, b, so);
    else salla(so, 'ko-sos-ak');
    adimGuncelle();
  }
  /** Şişe raftan kulenin tepesine uçar, ağzı topun tepesine gelecek şekilde eğilir; sos o an yukarıdan aşağı akar */
  async function sosDok(sos: Sos, b: HTMLElement, so: HTMLElement) {
    const r = so.getBoundingClientRect();
    if (!r.width) return salla(so, 'ko-sos-ak');
    const en = r.width * 0.42;
    const boy = en * (1024 / 437);
    const sise = h('div.ko-sos-dok', { style: `width:${en.toFixed(1)}px;height:${boy.toFixed(1)}px`, html: gorsel(sosSiseAdi(sos)) });
    so.style.clipPath = 'inset(0 0 100% 0)';
    // 150° dönmüş şişenin ağzı merkezden (boy/2)·(sin150°, −cos150°) = (0.25·boy, 0.433·boy) uzakta: ağız topun tepesine
    const [x, y] = efekt_.merkez(so, 0.5, 0.02);
    const [x0, y0] = efekt_.merkez(b);
    const dx = x - boy * 0.25 - x0;
    const dy = y - boy * 0.433 - y0;
    const kap = h('div.ko-ucan', { style: `left:${x0}px;top:${y0}px` }, sise);
    efekt_.el.append(kap);
    const yer = (ek: string) => `translate(-50%, -50%) translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) rotate(150deg)${ek}`;
    const a = kap.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.9)' },
        { transform: `translate(-50%, -50%) translate(${(dx / 2).toFixed(0)}px, ${(dy / 2 - 50).toFixed(0)}px) rotate(70deg)`, offset: 0.2 },
        { transform: yer(''), offset: 0.38 },
        { transform: yer(' scale(1.05, 0.92)'), offset: 0.6 },
        { transform: yer(''), offset: 0.8 },
        { transform: yer(' translateY(30px)'), opacity: 0 },
      ],
      { duration: sure(1000), easing: 'ease-in-out', fill: 'both' },
    );
    // sos, şişe yerine varınca akar
    sonra(sure(380), () => {
      so.style.clipPath = '';
      salla(so, 'ko-sos-ak');
    });
    await a.finished.catch(() => undefined);
    kap.remove();
  }

  function susBas(sus: Sus, b: HTMLElement, elBas?: [number, number]) {
    const s = aktifSlot();
    const r = susKoy(s.yuva, sus);
    if (!elBas) salla(b, 'ko-bas');
    if (r === 'topYok') {
      ses.degil();
      return;
    }
    const k = s.yuva.secili;
    if (sus === 'serpinti') {
      ses.cingirak();
      yuvaCiz(s);
      salla(s.kuleKap.querySelector(`.ko-alt[data-k="${k}"] .ko-k-serpinti`), 'ko-serp');
      salla(b, 'ko-salla');
      adimGuncelle();
      return;
    }
    if (r === 'dolu') {
      ses.degil();
      return;
    }
    yuvaCiz(s);
    adimGuncelle();
    const j = s.yuva.kaplar[k].susler.filter((x) => x !== 'serpinti').length - 1;
    const parca = s.kuleKap.querySelector<HTMLElement>(`.ko-alt[data-k="${k}"] .ko-k-sus:last-of-type`);
    const otur = () => {
      // süs tepeye "pıt" diye düşer, sapı sallanır
      if (parca) parca.style.opacity = '';
      salla(parca, 'ko-pit');
      ses.pit(j);
      kinoTepki();
    };
    if (!elBas || !parca || TEST_MODU || AZ_HAREKET) return otur();
    // sürüklenen süs bırakıldığı yerden tepedeki yerine kayar, yaylanarak oturur
    parca.style.opacity = '0';
    const pr = parca.getBoundingClientRect();
    void efekt_.ucur(h('div.ko-ucan-parca', { html: gorsel(susAdi(sus)), style: `width:${pr.width.toFixed(0)}px` }), elBas, efekt_.merkez(parca), { ms: 200, kavis: -20, boy0: 1.3 }).then(() => !kapandi && otur());
  }

  // ---------------------------------------------------------------- dokunsal hazırlık (sürükleme; dokunuş da geçerli)
  const birim = () => parseFloat(el.style.getPropertyValue('--u')) || 1;
  /** parmağın altındaki yuva */
  const yuvaAltinda = (x: number, y: number) => slotlar.find((s) => icinde(s.yuvaEl.getBoundingClientRect(), x, y, 12 * birim())) ?? null;
  /** parmağın altındaki yuvada üstüne bir şey konabilecek (topu olan) kap: varsa o seçilir */
  function topluHedef(x: number, y: number): { s: Slot; k: number } | null {
    const s = yuvaAltinda(x, y);
    if (!s) return null;
    const altlar = [...s.kuleKap.querySelectorAll<HTMLElement>('.ko-alt')];
    const alt = altlar.find((a) => icinde(a.getBoundingClientRect(), x, y, 6 * birim()));
    const k = alt ? Number(alt.dataset.k) : s.yuva.secili;
    return s.yuva.kaplar[k]?.toplar.length ? { s, k } : null;
  }
  /** hedef yuvayı etkin, kabı seçili yapar (dokunuşlardaki gibi) */
  function hedefSec(h_: { s: Slot; k: number }) {
    if (aktif !== h_.s.i) aktifSec(h_.s.i);
    if (h_.s.yuva.secili !== h_.k) {
      h_.s.yuva.secili = h_.k;
      yuvaCiz(h_.s);
    }
  }
  /** kulenin en üst topunun tepesi (efekt katmanına göre) */
  function kuleTepesi(s: Slot, k: number): [number, number] {
    const top = s.kuleKap.querySelector(`.ko-alt[data-k="${k}"] .ko-k-top:last-of-type`);
    return top ? efekt_.merkez(top, 0.5, 0.12) : efekt_.merkez(s.kuleKap, 0.5, 0.3);
  }
  const yuvaVurgula = (s: Slot | null) => slotlar.forEach((o) => o.yuvaEl.classList.toggle('ko-uzerinde', o === s));
  /** Döndürülmüş aracın içindeki bir nokta: tutma noktasından (gx, gy) uzaklık (vx, vy px, dönmeden önce), açı derece */
  const donukNokta = (gx: number, gy: number, vx: number, vy: number, aci: number): [number, number] => {
    const a = (aci * Math.PI) / 180;
    return [gx + vx * Math.cos(a) - vy * Math.sin(a), gy + vx * Math.sin(a) + vy * Math.cos(a)];
  };

  /** Kepçe: tatın içinde sürükledikçe kepçede top büyür ("kırt kırt"); yuvaya (ya da herhangi bir yere) bırakınca iner */
  function kepceSurukle(tat: Tat, b: HTMLElement) {
    let tut: Tutulan | null = null;
    let topEl: HTMLElement | null = null;
    let dolum = 0;
    let kaziYol = 0;
    let parcaYol = 0;
    return elSurukle(b, {
      basla: (x, y) => {
        const en = 104 * birim();
        topEl = h('span.ko-kepce-top', { html: gorsel(topAdi(tat)) });
        topEl.style.setProperty('--d', '0');
        tut = new Tutulan(efekt_, h('div.ko-kepce-tut', {}, h('span.ko-kepce-tut-g', { html: gorsel('kepce') }), topEl), { sinif: 'ko-tut-kepce', en, boy: en * (345 / 1024), tx: 0.72, ty: 0.5 });
        tut.yer(x, y);
        tut.dondur(-12);
        dolum = 0;
        kaziYol = 0;
        ses.sikk();
        salla(b, 'ko-kepcelendi');
        void kino.oynat('bak', 400);
      },
      tasi: (x, y, dx, dy) => {
        if (!tut || !topEl) return;
        tut.yer(x, y, dx);
        const yolU = Math.hypot(dx, dy) / birim();
        const tatta = icinde(b.getBoundingClientRect(), x, y);
        const once = dolum;
        dolum = kepceDolum(dolum, yolU, tatta);
        topEl.style.setProperty('--d', dolum.toFixed(3));
        if (tatta && dolum < 1) {
          kaziYol += yolU;
          parcaYol += yolU;
          if (kaziYol > 22) {
            kaziYol = 0;
            ses.kazi();
            salla(b, 'ko-kepcelendi');
          }
          if (parcaYol > 34) {
            parcaYol = 0;
            const [px, py] = tut.nokta(0.22, 0.3);
            efekt_.parilti(px, py, 2, 0.35, '#DDF6FF');
          }
        }
        if (once < 1 && dolum >= 1) {
          // top tamam: pop, kepçede yaylanır
          ses.pop();
          const [px, py] = tut.nokta(0.22, 0);
          efekt_.pof(px, py, 0.45, '#FFFFFF');
          salla(topEl, 'ko-top-tamam');
          kinoTepki(true);
        }
        yuvaVurgula(yuvaAltinda(x, y));
      },
      birak: (x, y) => {
        yuvaVurgula(null);
        const t = tut;
        tut = null;
        if (!t) return;
        if (kepceBirak(dolum, icinde(b.getBoundingClientRect(), x, y)) === 'geri') {
          // vazgeçti: top kaba geri erir
          ses.kazi();
          void t.don_(null);
          return;
        }
        if (dolum < 1) ses.pop();
        const bas = t.nokta(0.22, 0.05);
        void t.don_(null);
        const hedef = yuvaAltinda(x, y);
        if (hedef && hedef.i !== aktif) aktifSec(hedef.i);
        tatBas(tat, b, bas);
      },
    });
  }

  /** Sos: şişeyi kulenin üstüne götür, eğilir ve dökülür; tuttukça sos yukarıdan aşağı yayılır */
  function sosSurukle(sos: Sos, b: HTMLElement) {
    let tut: Tutulan | null = null;
    let hedef: { s: Slot; k: number } | null = null;
    let soEl: HTMLElement | null = null;
    let dolum = 0;
    let ustunde = false;
    let son = 0;
    let raf = 0;
    let damla = 0;
    let akis: HTMLElement | null = null;
    let gx = 0;
    let gy = 0;
    let boy = 0;
    const akisCiz = () => {
      if (!tut || !ustunde || !hedef || dolum >= 1 || TEST_MODU || AZ_HAREKET) {
        akis?.remove();
        akis = null;
        return;
      }
      const kk = efekt_.kutu();
      const [ax, ay] = donukNokta(gx - kk.left, gy - kk.top + tut.kalkis, 0, -boy * 0.5, tut.aci);
      const [hx, hy] = kuleTepesi(hedef.s, hedef.k);
      if (!akis) {
        akis = h('i.ko-sos-akis', { style: `--renk:${SOS_RENK[sos].ana}` });
        efekt_.el.append(akis);
      }
      const uzun = Math.max(6, Math.hypot(hx - ax, hy - ay));
      const aci = (Math.atan2(hy - ay, hx - ax) * 180) / Math.PI - 90;
      akis.style.cssText = `--renk:${SOS_RENK[sos].ana};left:${ax.toFixed(1)}px;top:${ay.toFixed(1)}px;height:${uzun.toFixed(1)}px;transform:translateX(-50%) rotate(${aci.toFixed(1)}deg)`;
    };
    const bitir = () => {
      if (!hedef) return;
      ses.slurp();
      if (soEl) {
        soEl.style.clipPath = '';
        salla(soEl, 'ko-sos-oturdu');
      }
      const [x, y] = kuleTepesi(hedef.s, hedef.k);
      efekt_.parilti(x, y, 4, 0.5);
      kinoTepki(true);
      adimGuncelle();
    };
    const dongu = (t: number) => {
      if (!tut) return;
      const ms = son ? Math.min(60, t - son) : 0;
      son = t;
      if (ustunde && hedef && dolum < 1) {
        const once = dolum;
        dolum = sosDolum(dolum, ms);
        if (soEl) soEl.style.clipPath = `inset(0 0 ${((1 - dolum) * 100).toFixed(1)}% 0)`;
        if (Math.floor(dolum * 4) > Math.floor(once * 4) && dolum < 1) ses.damla(damla++);
        if (dolum >= 1) bitir();
      }
      akisCiz();
      raf = requestAnimationFrame(dongu);
    };
    return elSurukle(b, {
      basla: (x, y) => {
        const r = b.querySelector('.ko-g')?.getBoundingClientRect() ?? b.getBoundingClientRect();
        boy = Math.max(r.height * 1.45, 70 * birim());
        tut = new Tutulan(efekt_, gorsel(sosSiseAdi(sos)), { sinif: 'ko-tut-sise', en: boy * (437 / 1024), boy, tx: 0.5, ty: 0.5 });
        tut.yer(x, y);
        gx = x;
        gy = y;
        hedef = null;
        soEl = null;
        dolum = 0;
        damla = 0;
        son = 0;
        b.classList.add('ko-tasiniyor');
        raf = requestAnimationFrame(dongu);
      },
      tasi: (x, y, dx) => {
        if (!tut) return;
        tut.yer(x, y, dx);
        gx = x;
        gy = y;
        const h_ = topluHedef(x, y);
        // dökülmeye başlanan kule bitene kadar hedef o kalır; yenisi bitince
        if (h_ && (!hedef || dolum >= 1) && !(hedef && hedef.s === h_.s && hedef.k === h_.k)) {
          hedefSec(h_);
          const r = sosKoy(h_.s.yuva, sos);
          if (r === 'kondu') {
            yuvaCiz(h_.s);
            hedef = h_;
            dolum = 0;
            soEl = h_.s.kuleKap.querySelector<HTMLElement>(`.ko-alt[data-k="${h_.k}"] .ko-k-sos`);
            if (soEl) soEl.style.clipPath = 'inset(0 0 100% 0)';
            ses.damla(damla++);
            adimGuncelle();
          } else if (r === 'ayni' && !hedef) {
            hedef = h_;
            dolum = 1;
            salla(h_.s.kuleKap.querySelector(`.ko-alt[data-k="${h_.k}"] .ko-k-sos`), 'ko-zipla');
          }
        }
        ustunde = !!hedef && !!h_ && h_.s === hedef.s;
        const dokuyor = ustunde && dolum < 1;
        tut.dondur(dokuyor ? 160 : h_ ? 40 : 0);
        // dökerken şişe kulenin biraz üstüne kalkar: sos şeridi görünür
        tut.yukari(dokuyor ? boy * 0.75 : 0);
        yuvaVurgula(h_?.s ?? null);
      },
      birak: () => {
        cancelAnimationFrame(raf);
        yuvaVurgula(null);
        ustunde = false;
        akisCiz();
        const t = tut;
        tut = null;
        // dökmeye başladıysa kalanı kendiliğinden akar
        if (hedef && dolum < 1) {
          dolum = 1;
          bitir();
        }
        if (t) void t.don_(ekranMerkez(b), 280).then(() => b.classList.remove('ko-tasiniyor'));
        else b.classList.remove('ko-tasiniyor');
      },
    });
  }

  /** Serpinti: kavanozu kulenin üstünde salla; her sallamada taneler yağar, üçüncüde serpinti tamam */
  function serpintiSurukle(b: HTMLElement) {
    let tut: Tutulan | null = null;
    let sallama = new Sallama();
    let hedef: { s: Slot; k: number } | null = null;
    let serpEl: HTMLElement | null = null;
    let tamam = false;
    let boy = 0;
    let gx = 0;
    let gy = 0;
    const tamamla = () => {
      if (tamam || !hedef) return;
      tamam = true;
      ses.cingirak();
      if (serpEl) serpEl.style.opacity = '';
      salla(serpEl, 'ko-serp');
      const [x, y] = kuleTepesi(hedef.s, hedef.k);
      efekt_.parilti(x, y, 5, 0.55, '#FFE45C');
      kinoTepki(true);
      adimGuncelle();
    };
    return elSurukle(b, {
      basla: (x, y) => {
        const r = b.querySelector('.ko-g')?.getBoundingClientRect() ?? b.getBoundingClientRect();
        boy = r.height * 1.1;
        tut = new Tutulan(efekt_, gorsel('serpinti-kavanoz'), { sinif: 'ko-tut-kavanoz', en: boy * 0.9, boy, tx: 0.5, ty: 0.5 });
        tut.yer(x, y);
        sallama = new Sallama();
        hedef = null;
        serpEl = null;
        tamam = false;
        b.classList.add('ko-tasiniyor');
      },
      tasi: (x, y, dx, dy) => {
        if (!tut) return;
        tut.yer(x, y, dx * 1.6);
        gx = x;
        gy = y;
        const h_ = topluHedef(x, y);
        tut.dondur(h_ ? 170 : 0);
        yuvaVurgula(h_?.s ?? null);
        if (!h_) return;
        if (!sallama.ekle(dx / birim(), dy / birim())) return;
        const n = sallama.sayi;
        ses.tikir(n);
        const kk = efekt_.kutu();
        const [ax, ay] = donukNokta(gx - kk.left, gy - kk.top, 0, -boy * 0.42, tut.aci);
        if (!hedef || hedef.s !== h_.s || hedef.k !== h_.k) {
          hedefSec(h_);
          const r = susKoy(h_.s.yuva, 'serpinti');
          if (r === 'kondu') yuvaCiz(h_.s);
          hedef = h_;
          tamam = r !== 'kondu';
          serpEl = h_.s.kuleKap.querySelector<HTMLElement>(`.ko-alt[data-k="${h_.k}"] .ko-k-serpinti`);
          if (serpEl && !tamam) serpEl.style.opacity = '0.3';
          adimGuncelle();
        }
        const [hx, hy] = kuleTepesi(h_.s, h_.k);
        efekt_.serpinti(ax, ay, hx, hy, 9);
        salla(h_.s.kuleKap.querySelector(`.ko-alt[data-k="${h_.k}"] .ko-kule`), 'ko-serp-titre');
        if (serpEl && !tamam) serpEl.style.opacity = String(Math.min(1, 0.3 + (0.7 * n) / SALLAMA_GEREK));
        if (n >= SALLAMA_GEREK) tamamla();
      },
      birak: () => {
        yuvaVurgula(null);
        // bir kez bile salladıysa serpinti tamamlanır
        if (hedef && !tamam) tamamla();
        const t = tut;
        tut = null;
        if (t) void t.don_(ekranMerkez(b), 280).then(() => b.classList.remove('ko-tasiniyor'));
        else b.classList.remove('ko-tasiniyor');
      },
    });
  }

  /** Süs (kiraz, gofret, şemsiye, kalp): sürükle, kulenin üstüne bırak; tepeye kayıp yaylanarak oturur */
  function susSurukle(sus: Sus, b: HTMLElement) {
    let tut: Tutulan | null = null;
    return elSurukle(b, {
      basla: (x, y) => {
        const en = 54 * birim();
        tut = new Tutulan(efekt_, gorsel(susAdi(sus)), { sinif: 'ko-tut-sus', en, boy: en });
        tut.yer(x, y);
        tut.buyut(1.15);
        b.classList.add('ko-tasiniyor');
        ses.tik();
      },
      tasi: (x, y, dx) => {
        tut?.yer(x, y, dx);
        yuvaVurgula(topluHedef(x, y)?.s ?? null);
      },
      birak: (x, y) => {
        yuvaVurgula(null);
        const t = tut;
        tut = null;
        if (!t) return;
        const h_ = topluHedef(x, y);
        if (!h_) {
          void t.don_(ekranMerkez(b), 280).then(() => b.classList.remove('ko-tasiniyor'));
          return;
        }
        const bas = t.nokta(0.5, 0.5);
        t.kaldir();
        b.classList.remove('ko-tasiniyor');
        hedefSec(h_);
        susBas(sus, b, bas);
      },
    });
  }

  function yeBas(s: Slot) {
    const onceki = s.musteri ? yuvaIsi(s.musteri.sip, s.yuva, ayar.tatlar) : null;
    const yer = s.kuleKap.querySelector(`.ko-alt[data-k="${s.yuva.secili}"] .ko-kule`);
    const bas = yer ? efekt_.merkez(yer, 0.5, 0.15) : efekt_.merkez(s.kuleKap);
    const k = s.yuva.secili;
    const kat: Katman | null = ye(s.yuva);
    if (!kat) return;
    if (kat.tur === 'top') s.ucan[k]?.delete(s.yuva.kaplar[k]?.toplar.length ?? -1);
    yuvaCiz(s);
    adimGuncelle();
    const resim = kat.tur === 'top' ? gorsel(topAdi(kat.tat)) : kat.tur === 'sos' ? gorsel(sosUstAdi(kat.sos)) : kat.tur === 'sus' ? gorsel(susAdi(kat.sus)) : gorsel(kapAdi(kat.kap));
    // yanlış topu yediyse: "Ham! Yanlışmış ama güzelmiş!"
    void kinoYesin(resim, bas, onceki?.tur === 'ye' ? K.kino.ham : undefined);
  }

  // ---------------------------------------------------------------- yan işler (isteğe bağlı; hiçbir şeyi beklemez)
  const isOrtami: IsOrtami = {
    efekt: efekt_,
    yas,
    u: birim,
    kapandi: () => kapandi,
    kinoSevin: () => {
      kinoTepki(true);
      void kino.oynat('sevin', 700);
    },
    soyle: (soz, kim) => seyrekSoyle(soz, kim, 6000),
    kirazSapka: kayit.alinan.includes('kino-sapka'),
  };
  // temizlik: lekeler dolabın üst kenarına (tezgâha) damlar
  const temizlik = new Temizlik(isOrtami);
  dolapIc.append(temizlik.el);
  let verilenSayisi = 0;
  function lekeleriDusur() {
    temizlik.dus([22, 50, 78]);
  }

  // külah: alındıkça raf azalır (en az 1); az kalınca iş köşesi parlar; dolu raf için külah yapılır
  let kulahAzSoylendi = false;
  function kulahCiz() {
    if (kulahDugme) kulahDugme.innerHTML = kulahYigini(kulahStok);
    kose.isVar(kulahAzMi(kulahStok));
    el.dataset.kulah = String(kulahStok);
  }
  function kulahAlindi() {
    const once = kulahStok;
    kulahStok = kulahKullan(kulahStok);
    if (kulahStok === once) return;
    kulahCiz();
    if (kulahStok <= KULAH_STOK.enAz && !ogretici && !kulahAzSoylendi) {
      kulahAzSoylendi = true;
      seyrekSoyle(K.mino.kulah_az, 'mino', 60000);
    }
  }
  let panel: KulahPaneli | null = null;
  function kulahPaneliAc() {
    if (panel || kapandi) return;
    elIpucuGizle();
    yakinBitir?.();
    panel = new KulahPaneli(
      isOrtami,
      (yerler) => {
        panel = null;
        void kulahlarGelsin(yerler);
      },
      () => (panel = null),
    );
    el.append(panel.el);
  }
  /** taze külahlar tezgâhtaki yığına uçar, raf dolar */
  async function kulahlarGelsin(yerler: [number, number][]) {
    const hedef = kulahDugme ? efekt_.merkez(kulahDugme, 0.5, 0.45) : null;
    kulahStok = kulahYap();
    kulahAzSoylendi = false;
    if (hedef)
      await Promise.all(
        yerler.map(async (y, i) => {
          await efekt_.ucur(h('div.ko-ucan-parca', { html: gorsel('kulah'), style: `width:${(34 * birim()).toFixed(0)}px` }), y, hedef, { ms: 520, gecikme: i * 130, kavis: -90 });
          if (kapandi) return;
          ses.pit(i);
          salla(kulahDugme, 'ko-zipla');
          efekt_.parilti(hedef[0], hedef[1], 3, 0.45, '#FFE45C');
        }),
      );
    if (!kapandi) kulahCiz();
  }

  // ---------------------------------------------------------------- müşteriler
  let biten = 0;
  let mutlu = 0;
  let hedefSoylendi = false;
  let calisiyor = false;
  let ogretici = false;
  let ilkIstekGosterildi = false;
  /** İstek balonu bir an büyür (kamera yerine): çocuk ne istendiğini görür */
  function balonBuyut(b: HTMLElement) {
    if (TEST_MODU || AZ_HAREKET) return;
    b.classList.remove('ko-balon-acil', 'ko-balon-buyu');
    void b.offsetWidth;
    b.classList.add('ko-balon-buyu');
    b.addEventListener('animationend', () => b.classList.remove('ko-balon-buyu'), { once: true });
  }

  async function musteriGelsin(s: Slot) {
    const sip = kuyruk.shift();
    if (!sip || kapandi) return;
    const m = new Musteri(sip, s.i === 0 ? 'sol' : 'sag');
    if (ozel) m.el.dataset.siparis = JSON.stringify(sip);
    s.musteri = m;
    s.yerEl.replaceChildren(m.el);
    s.yerEl.dataset.adet = String(m.kisiler.length);
    s.balonYer.replaceChildren(m.balon);
    for (const kisi of m.kisiler) if (kisi.mino) minolar.add(kisi.mino);
    if (sip.tur === 'ogretici') ogretici = true;
    m.el.addEventListener('click', () => musteriBas(s));
    m.balon.addEventListener('click', () => musteriBas(s, true));
    await m.hazirSoz;
    await m.gel();
    if (kapandi) return;
    yuvaCiz(s);
    adimGuncelle();
    void soyle(K.kino.hosgeldin, 'kino', false);
    // günün ilk isteğinde yakın çekim (dokununca hemen biter); sonrakilerde kamera oynamaz, yalnız balon büyür
    // (dolap ve kaplar ekrandan kaymaz, hedefler parmağın altından kaçmaz)
    if (!ilkIstekGosterildi) {
      ilkIstekGosterildi = true;
      yakin(s.yerEl.closest('.ko-slot')!, 1.45, `istek-${sip.no}`, { odak: s.i, ms: 900 });
    } else balonBuyut(m.balon);
    await soyle(okuma(sip));
    if (ogretici) adimGuncelle(true);
  }

  function musteriBas(s: Slot, balon = false) {
    const m = s.musteri;
    // sevinç anında dokunmak: dans biter, müşteri el sallayıp gider
    if (m?.bitti && s.atla) {
      s.atla();
      efekt.dokunma();
      return;
    }
    if (!m || !m.hazir || m.bitti) return;
    efekt.dokunma();
    if (!balon && verilebilir(s.yuva, m.sip) && yuvaIsi(m.sip, s.yuva, ayar.tatlar).tur === 'ver') {
      void servis(s);
      return;
    }
    // isteği bir daha dinlet; yuvası etkin olur
    m.dikkat();
    aktifSec(s.i);
    void soyle(okuma(m.sip), 'mino', false);
  }

  /** Jetonlar müşteriden kumbara kavanozuna yay çizerek düşer (havada jeton kalmaz) */
  async function jetonVer(m: Musteri, adet: number) {
    const bas = efekt_.merkez(m.el, 0.5, 0.35);
    const hedef = efekt_.merkez(kumbara, 0.5, 0.3);
    efekt_.yazi(bas[0], bas[1] - 20, `+${adet}`);
    await Promise.all(
      Array.from({ length: adet }, async (_, i) => {
        await efekt_.ucur(h('div.ko-ucan-jeton', { html: gorsel('jeton') }), bas, hedef, { ms: 620, gecikme: i * 140, kavis: -120, boy0: 1, boy1: 0.6, don: 360 });
        if (kapandi) return;
        bugun++;
        kumbaraSayi.textContent = String(bugun);
        salla(kumbara, 'ko-zipla');
        ses.singir(i);
        efekt_.parilti(hedef[0], hedef[1], 4, 0.5, '#FFE45C');
        durumYaz();
      }),
    );
  }

  async function servis(s: Slot) {
    const m = s.musteri;
    if (!m || !m.hazir || m.bitti || kapandi) return;
    if (!verilebilir(s.yuva, m.sip)) {
      salla(s.yuvaEl, 'ko-hayir');
      ses.degil();
      return;
    }
    m.bitti = true;
    m.el.classList.add('ko-bitti');
    const verilen: Dondurma[] = s.yuva.kaplar.map((d) => ({ ...d, toplar: [...d.toplar], susler: [...d.susler] }));
    const sonuc = siparisSonucu(m.sip, verilen);
    const dogumgunu = m.sip.tur === 'dogumgunu';
    if (m.sip.tur === 'ogretici') ogretici = false;
    // Mino'nun doğum günü: Kino kupaya mum diker
    if (dogumgunu) {
      s.mum = 'yanik';
      yuvaCiz(s);
      ses.pit(3);
      await bekle(450);
    }
    const kopya = kuleKopya(s.kuleKap);
    const bas = efekt_.merkez(s.kuleKap, 0.5, 0.5);
    s.yuva = bosYuva();
    s.ucan.forEach((u) => u.clear());
    s.mum = null;
    yuvaCiz(s);
    // öbür yuvada bekleyen varsa o etkin olur
    const obur = slotlar[1 - s.i];
    if (obur.musteri?.hazir && !obur.musteri.bitti) aktifSec(obur.i);
    adimGuncelle();
    ses.ksilofon();
    void kino.oynat('sevin', 700);
    void soyle(K.kino.buyurun, 'kino', false);
    // yoğun an: verirken tezgâha dondurma damlar (her ikinci verişte; silmek isteğe bağlı)
    if (lekeDuserMi(++verilenSayisi, temizlik.sayi, m.sip.tur === 'ogretici')) lekeleriDusur();
    const kisiEl = m.anaKisi.el;
    const [ax, ay] = m.anaKisi.agiz();
    const hedef = efekt_.merkez(kisiEl, ax, ay);
    kopya.classList.add('ko-ucan-kule');
    await efekt_.ucur(kopya, bas, hedef, { ms: 480, kavis: -110, boy1: 0.8 });
    if (kapandi) return;
    const lokma = kopya.cloneNode(true) as HTMLElement;
    lokma.classList.remove('ko-ucan-kule');
    if (dogumgunu) {
      // Mino mumu üfler, herkes alkışlar
      const mino = m.anaKisi.mino;
      // kupa Mino'nun ağzının önünde (yerken olduğu gibi): mum pencerenin fırfırının altında, üflenince görünür
      const lokmaKap = h('div.ko-m-lokma.ko-dogumgunu', { style: `left:${ax * 100}%;top:${ay * 100}%;transform:translateX(-50%)` }, lokma);
      kisiEl.append(lokmaKap);
      mino?.tepki('evet');
      await bekle(600);
      ses.ufle();
      lokma.querySelector('.ko-k-mum')?.classList.add('ko-sonuk');
      const mumEl = lokma.querySelector('.ko-k-mum');
      if (mumEl) mumEl.innerHTML = gorsel('mum').replace('ko-g ', 'ko-g ko-mum-sonuk ');
      const [kx, ky] = efekt_.merkez(kisiEl, 0.5, 0.3);
      efekt_.konfeti(kx, ky, 30);
      ekranSalla(el, 2);
      void soyle(K.mino.iyi_ki);
      for (const o of slotlar) if (o.musteri && o.musteri !== m) void o.musteri.dans();
      void kino.oynat('dans', 1200);
      await bekle(900);
      lokmaKap.remove();
    }
    const pembe = verilen.every((d) => d.toplar.every((t) => t === 'cilek'));
    await m.tat(lokma, pembe);
    if (kapandi) return;
    const limonlu = verilen.some((d) => d.toplar.includes('limon'));
    m.soz(m.ad === 'ordek' && limonlu ? K.balon.ordek : K.balon.genel[m.sip.no % K.balon.genel.length]);
    const [hx, hy] = efekt_.merkez(m.el, 0.5, 0.3);
    if (sonuc.ayni) {
      mutlu++;
      efekt.dogru();
      efekt_.konfeti(hx, hy);
      efekt_.kalpler(hx, hy, 7);
      efekt_.buyukKalp(...efekt_.merkez(m.el, 0.5, 0.08));
      salla(m.el, 'ko-cok-mutlu');
      m.mutlu(2200);
      void soyle(K.mino.tam, 'mino', false);
    } else {
      m.karsilastir(sonuc.farklar);
      efekt_.kalpler(hx, hy, 3);
      m.mutlu(1400);
      void soyle(K.mino.farkli, 'mino', false);
    }
    hedefCiz(sonuc.ayni);
    m.el.dataset.sonuc = sonuc.ayni ? 'ayni' : 'farkli';
    // jetonlar kumbaraya uçarken müşteri dans eder, Kino ile çak yapar (~1 sn; müşteriye dokununca biter)
    const jeton = jetonVer(m, jetonHesapla(sonuc.ayni));
    await atlanabilir(s, Promise.all([m.dans(), cakYap(s, m)]));
    if (kapandi) return;
    const gidis = m.git();
    await jeton;
    if (kapandi) return;
    // son müşteri ödedi: gün hemen kaydedilir (akşam yalnız gösterir; "Bugünlük bu kadar!"da çıkılsa da jeton kalır)
    if (++odenen >= TOPLAM) gunuKaydet();
    if (mutlu >= ayar.hedef && !hedefSoylendi) {
      hedefSoylendi = true;
      void soyle(K.mino.hedef_tamam, 'mino', false);
      const [x, y] = efekt_.merkez(hedefEl);
      efekt_.parilti(x, y, 10, 0.8, '#FFE45C');
    }
    await gidis;
    for (const kisi of m.kisiler) if (kisi.mino) minolar.delete(kisi.mino);
    m.kapat();
    m.el.remove();
    m.balon.remove();
    s.musteri = null;
    biten++;
    durumYaz();
    yuvaCiz(s);
    if (biten === 2 && gun === 2) minoGecsin();
    if (biten >= TOPLAM) void gunBitti();
    else if (kuyruk.length) sonra(TEST_MODU ? 50 : 500, () => void musteriGelsin(s));
    else {
      // sıra bitti: öbür yuvadaki müşteri etkin
      const o = slotlar[1 - s.i];
      if (o.musteri && !o.musteri.bitti) aktifSec(o.i);
    }
    adimGuncelle();
  }

  /** Bir sevinç anını bekler; o müşteriye dokunulursa hemen biter */
  function atlanabilir(s: Slot, p: Promise<unknown>): Promise<void> {
    return new Promise<void>((coz) => {
      const bitir = () => {
        if (s.atla !== bitir) return;
        s.atla = null;
        coz();
      };
      s.atla = bitir;
      p.then(bitir, bitir);
    });
  }

  /** Çak: Kino müşteriye eğilip patisini kaldırır, müşteri de eğilir; patiler buluşunca yıldız ve "Çak!" */
  async function cakYap(s: Slot, m: Musteri) {
    if (TEST_MODU || AZ_HAREKET || kapandi) return;
    cakYon = s.i === 0 ? -1 : 1;
    cakBas = performance.now() / 1000;
    const sinif = s.i === 0 ? 'ko-cak-sol' : 'ko-cak-sag';
    // kalkık kol ayrı katman (iskelet): o yanın asıl kolu gizlenir (film/src/oyuncu.ts gibi)
    const kolId = cakYon < 0 ? 'kol-sol' : 'kol-sag';
    const kalkik = !!kino.parcaG(`${kolId}-yukari`);
    if (kalkik) {
      kino.ek(`${kolId}-yukari`, true);
      kino.gizle(kolId, true);
    }
    kinoYer.classList.add(sinif);
    m.el.classList.add('ko-cak');
    await bekle(330);
    if (kapandi) return;
    const k = kino.el.getBoundingClientRect();
    const kisi = m.anaKisi.el.getBoundingClientRect();
    const kk = efekt_.kutu();
    // patiler buluşur: Kino'nun kafasının müşteri yanındaki kenarı (Kino ile müşterinin arası), yanak hizası
    const kafa = kino.parcaG('kafa')?.getBoundingClientRect();
    if (k.width && kisi.width) {
      const x = kafa?.width ? (cakYon < 0 ? kafa.left : kafa.right) : cakYon < 0 ? k.left + k.width * 0.2 : k.right - k.width * 0.2;
      const y = kafa?.height ? kafa.top + kafa.height * 0.6 : k.top + k.height * 0.3;
      efekt_.cak(x - kk.left + cakYon * 6 * birim(), y - kk.top);
    }
    ses.cak();
    seyrekSoyle(K.kino.cak, 'kino', 9000);
    await bekle(420);
    kinoYer.classList.remove(sinif);
    m.el.classList.remove('ko-cak');
    if (kalkik) {
      kino.ek(`${kolId}-yukari`, false);
      kino.gizle(kolId, false);
    }
  }

  // gün tahtası: tam istediği gibiyse dolu kalp
  function hedefCiz(ayni: boolean) {
    hedefEl.dataset.mutlu = String(mutlu);
    if (!ayni) return;
    const k = hedefEl.children[mutlu - 1];
    k?.classList.add('dolu');
    salla(k, 'ko-zipla');
  }

  /** Gün 2: Mino otobüsün yanından geçip el sallar (bir kez; süs) */
  function minoGecsin() {
    if (TEST_MODU || AZ_HAREKET) return;
    const mino = new Mino();
    const kap = h('div.ko-mino-gecis', { 'aria-hidden': 'true' }, mino.el);
    pencere.querySelector('.ko-mino-gecis-yer')?.after(kap);
    mino.tepki('selam');
    const a = kap.animate([{ transform: 'translateX(-30%)' }, { transform: 'translateX(40vw)', offset: 0.45 }, { transform: 'translateX(40vw)', offset: 0.6 }, { transform: 'translateX(110vw)' }], { duration: 6000, easing: 'linear' });
    sonra(2700, () => mino.tepki('selam'));
    a.finished.then(
      () => {
        mino.kapat();
        kap.remove();
      },
      () => {
        mino.kapat();
        kap.remove();
      },
    );
  }

  // ---------------------------------------------------------------- sıradaki iş (parlama, el ipucu)
  /** Hangi yuva çalışılmalı: etkin yuvada bekleyen müşteri varsa o, yoksa öbürü */
  function calisilacak(): Slot | null {
    const bekliyor = (s: Slot) => !!s.musteri?.hazir && !s.musteri.bitti;
    const a = slotlar[aktif];
    if (bekliyor(a)) return a;
    const o = slotlar[1 - aktif];
    return bekliyor(o) ? o : null;
  }
  function isEl(s: Slot, is: Is): { ad: AdimAdi; el: HTMLElement | null } {
    switch (is.tur) {
      case 'kap':
        return { ad: 'kap', el: kapDugmeleri[ayar.kaplar.indexOf(is.kap)] ?? null };
      case 'top':
        return { ad: 'top', el: tatDugmeleri[ayar.tatlar.indexOf(is.tat)] ?? null };
      case 'sos':
        return { ad: 'sos', el: sosDugmeleri[ayar.soslar.indexOf(is.sos)] ?? null };
      case 'sus':
        return { ad: 'sus', el: susDugmeleri[ayar.susler.indexOf(is.sus)] ?? null };
      case 'ye':
        return { ad: 'ye', el: s.kuleKap.querySelector<HTMLElement>(`.ko-alt[data-k="${s.yuva.secili}"] .ko-kule`) };
      case 'sec':
        return { ad: 'sec', el: s.kuleKap.querySelector<HTMLElement>(`.ko-alt[data-k="${is.kap}"] .ko-kule`) };
      case 'ver':
        return { ad: 'ver', el: s.verDugme };
    }
  }
  function siradakiAdim(): { ad: AdimAdi; el: HTMLElement } | null {
    if (!calisiyor) return null;
    const s = calisilacak();
    if (!s?.musteri) return null;
    if (s.i !== aktif) return { ad: 'yuva', el: s.yuvaEl };
    // uçmakta olan top varken kule işi sayılmaz (top inince yeniden bakılır)
    const is = yuvaIsi(s.musteri.sip, s.yuva, ayar.tatlar);
    if (is.tur === 'ye' && s.ucan.some((u) => u.size)) return null;
    const r = isEl(s, is);
    return r.el ? { ad: r.ad, el: r.el } : null;
  }
  let parlayan: HTMLElement | null = null;
  let adimAdi: AdimAdi | null = null;
  let ogreticiAdim = '';
  function adimGuncelle(ogreticiSoyle = false) {
    const a = siradakiAdim();
    adimAdi = a?.ad ?? null;
    if (a?.el !== parlayan) {
      parlayan?.classList.remove('ko-sirada');
      parlayan = a?.el ?? null;
      parlayan?.classList.add('ko-sirada');
      elIpucuGizle();
    }
    el.dataset.adim = adimAdi ?? '';
    // öğretici (Gün 1, Mino): el hemen görünür; adım değişince "Şimdi buna dokun!"
    if (ogretici && a) {
      const anahtar = `${a.ad}:${a.el.dataset.kap ?? a.el.dataset.tat ?? a.el.dataset.sos ?? ''}`;
      if (anahtar !== ogreticiAdim || ogreticiSoyle) {
        ogreticiAdim = anahtar;
        if (bekleyenSoz === 0 || ogreticiSoyle) void soyle(a.ad === 'ver' ? K.mino.bana_ver : K.mino.dokun, 'mino', false);
      }
      if (!elGoster) sonra(sure(400), () => elIpucuBak(performance.now(), true));
    }
    durumYaz();
  }
  let elGoster = false;
  function elIpucuGizle() {
    if (!elGoster) return;
    elGoster = false;
    elIpucu.classList.remove('ko-goster');
  }
  function elIpucuBak(simdi: number, hemen = false) {
    if (elGoster || !parlayan || yakinBitir || panel) return;
    if (!hemen && (simdi - sonDokunus < IPUCU_MS || bekleyenSoz > 0)) return;
    if (TEST_MODU && q.get('ipucu') !== '1') return;
    if (!hemen) seyrekSoyle(K.mino.sirada, 'mino', 30000);
    const k = el.getBoundingClientRect();
    const r = parlayan.getBoundingClientRect();
    const x = r.left - k.left + r.width / 2;
    const y = r.top - k.top + r.height * 0.55;
    elIpucu.style.setProperty('--x', `${x.toFixed(0)}px`);
    elIpucu.style.setProperty('--y', `${y.toFixed(0)}px`);
    // kendiliğinden çıkan ipucu (öğretici değil): top, sos, süs için el kaptan yuvaya sürükler (dokunmak da olur)
    const s = calisilacak();
    const surukle = !hemen && !!s && (adimAdi === 'top' || adimAdi === 'sos' || adimAdi === 'sus');
    elIpucu.classList.toggle('ko-surukle', surukle);
    if (surukle && s) {
      const y_ = s.yuvaEl.getBoundingClientRect();
      elIpucu.style.setProperty('--dx', `${(y_.left - k.left + y_.width / 2 - x).toFixed(0)}px`);
      elIpucu.style.setProperty('--dy', `${(y_.top - k.top + y_.height * 0.45 - y).toFixed(0)}px`);
    }
    elIpucu.classList.add('ko-goster');
    elGoster = true;
  }

  // ---------------------------------------------------------------- zaman (yalnız ipucu ve müşteri gelişi; istasyonlarda süre yok)
  let gizli = false;
  const gorunurluk = () => (gizli = document.hidden);
  document.addEventListener('visibilitychange', gorunurluk);
  const arkaBirak = arkaPlanDinle((arkada) => (gizli = arkada || document.hidden));
  const tikZaman = window.setInterval(() => {
    if (kapandi || !calisiyor || gizli) return;
    adimGuncelle();
    elIpucuBak(performance.now());
  }, 250);
  function durumYaz() {
    if (ozel) el.dataset.durum = JSON.stringify({ biten, mutlu, bugun, kuyruk: kuyruk.length, aktif, adim: adimAdi, toplam: TOPLAM });
  }

  // ---------------------------------------------------------------- günün sonu
  let odenen = 0;
  let kaydedildi = false;
  /** Günün jetonları kumbaraya, gün bitti (bir sonraki gün açılır); bir kez */
  function gunuKaydet() {
    if (kaydedildi) return;
    kaydedildi = true;
    kayitGunBitti(kayit, gun, bugun, mutlu);
    kaydet();
  }
  async function gunBitti() {
    gunuKaydet();
    calisiyor = false;
    adimGuncelle();
    await bekle(500);
    if (kapandi) return;
    await soyle(K.mino.bitti);
    await bekle(400);
    if (!kapandi) app.git('aksam', { gun, kazanc: bugun, mutlu, kaydedildi: true });
  }

  // ---------------------------------------------------------------- açılış: otobüs gelir, görseller çözülür
  /** günün bütün görselleri: tezgâh, raf, dolap, balonlardaki ve kulelerdeki her parça; iskeletler */
  const parcaAdlari: VarlikAdi[] = [
    ...ayar.tatlar.map(topAdi),
    ...ayar.soslar.map(sosUstAdi),
    ...ayar.susler.map(susAdi),
    ...ayar.kaplar.map(kapAdi),
    'mum',
    'kepce',
    'jeton',
    'sus-flama',
    'pencere-dogumgunu',
    'ic-arka',
    'tezgah-on',
    'dolap',
  ];
  const urls = [...resimleriTopla(el), ...parcaAdlari.map((a) => adres(a)).filter((u): u is string => !!u), ...otobusAdresleri()];
  const iskeletler = ['kino', ...kuyruk.flatMap((s) => [s.musteri, s.ikinci ?? ''])].filter(Boolean);
  const yuk = onYukle(urls, iskeletler, TEST_MODU ? 3000 : 8000);
  el.classList.add('ko-yukleniyor');
  const baslat = () => {
    el.classList.remove('ko-yukleniyor');
    calisiyor = true;
    sonDokunus = performance.now();
    olc();
    void musteriGelsin(slotlar[0]);
    // ikinci müşteri hemen ardından (öğreticide Mino'ya verilince)
    const ikinci = () => {
      if (kapandi) return;
      if (ogretici) {
        sonra(400, ikinci);
        return;
      }
      if (!slotlar[1].musteri && kuyruk.length) void musteriGelsin(slotlar[1]);
    };
    sonra(TEST_MODU ? 100 : 1600, ikinci);
  };
  const giris = otobusGirisi(el, ayar.yer, yuk.hazir, baslat);
  void soyle(K.mino.geldi);
  void soyle((K.mino.hedef as Record<string, string>)[String(ayar.hedef)]);
  for (const s of slotlar) yuvaCiz(s);
  kulahCiz();
  requestAnimationFrame(olc);
  if (ozel)
    (window as unknown as Record<string, unknown>).__koGun = {
      slotlar,
      get aktif() {
        return aktif;
      },
      get kulahStok() {
        return kulahStok;
      },
      /** test: tezgâha leke düşürür */
      lekeDusur: lekeleriDusur,
      kino,
    };

  return {
    el,
    kapat() {
      kapandi = true;
      calisiyor = false;
      clearInterval(tikZaman);
      zamanlar.forEach(clearTimeout);
      ro?.disconnect();
      document.removeEventListener('visibilitychange', gorunurluk);
      arkaBirak();
      giris.kapat();
      yakinBitir?.();
      surukleKaldir.forEach((f) => f());
      temizlik.kapat();
      panel?.kapat();
      kino.kapat();
      for (const s of slotlar) {
        s.surukleBirak.forEach((f) => f());
        s.musteri?.kapat();
      }
      yuk.resimler.length = 0;
    },
  };
}

/**
 * Otobüs mekâna gelir: soldan yuvarlanır, durur, korna; yan kapak açılıp tente olur, Kino içeriden el sallar; sonra
 * kadraj kapağa yaklaşır ve tezgâh görünür. Bütün görseller çözülmeden tezgâh açılmaz; dokununca (hazırsa) hemen geçer.
 */
function otobusGirisi(ekran: HTMLElement, yer: Yer, hazir: Promise<void>, bitti: () => void): { kapat: () => void } {
  const otobus = otobusEl({ alinan: kayit.alinan, boya: kayit.boya, sinif: 'ko-giris-otobus' });
  const kino = dondurmaciKino(kayit.alinan.includes('kino-sapka'));
  const kinoKap = h('div.ko-giris-kino', {}, kino.el);
  const katman = h('div.ko-giris', { 'aria-hidden': 'true' }, manzara(yer), h('div.ko-giris-sahne', {}, h('div.ko-giris-ob', {}, otobus, kinoKap)));
  ekran.append(katman);
  let kapandi = false;
  let gecildi = false;
  const kapat = () => {
    kapandi = true;
    kino.kapat();
    katman.remove();
  };
  const gec = () => {
    if (gecildi) return;
    gecildi = true;
    void hazir.then(() => {
      if (kapandi) return;
      kapat();
      bitti();
    });
  };
  katman.addEventListener('pointerdown', gec);
  void (async () => {
    if (TEST_MODU || AZ_HAREKET) {
      await new Promise((r) => setTimeout(r, TEST_MODU ? 60 : 300));
      if (!kapandi) gec();
      return;
    }
    const ob = katman.querySelector<HTMLElement>('.ko-giris-ob')!;
    const tekerler = [...otobus.querySelectorAll<Element>('.ko-ob-teker')];
    const donus = tekerler.map((t) => t.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(720deg)' }], { duration: 1400, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }));
    await ob
      .animate(
        [
          { transform: 'translateX(-120vw)' },
          { transform: 'translateX(3%) rotate(-1deg)', offset: 0.82 },
          { transform: 'translateX(-1%) rotate(.6deg)', offset: 0.92 },
          { transform: 'translateX(0)' },
        ],
        { duration: 1400, easing: 'cubic-bezier(.25,.6,.35,1)', fill: 'both' },
      )
      .finished.catch(() => undefined);
    donus.forEach((d) => d.cancel());
    if (kapandi) return;
    ses.korna();
    await new Promise((r) => setTimeout(r, 300));
    ses.vuup();
    otobus.classList.add('ko-ob-acik');
    await new Promise((r) => setTimeout(r, 450));
    if (kapandi) return;
    kinoKap.classList.add('ko-goster');
    void kino.oynat('sevin', 900);
    await new Promise((r) => setTimeout(r, 900));
    if (kapandi) return;
    await hazir;
    if (kapandi) return;
    await katman
      .animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.2) translateY(4%)', opacity: 0 }], { duration: 500, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' })
      .finished.catch(() => undefined);
    if (!kapandi) gec();
  })();
  return { kapat };
}

