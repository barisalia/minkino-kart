/**
 * Kino'nun Otobüsü: bir gün (tek ekran). Üstte pencere (en çok 2 müşteri, yanlarında resimli istek balonu; ortada
 * tezgâhın arkasında Kino) ve sağda sos / süs rafı; altta KAPLAR, DONDURMA DOLABI (tat kapları), İKİ HAZIRLIK YUVASI
 * (her biri önündeki müşterinin rengiyle bağlı), KUMBARA kavanozu.
 *
 * Akış (hiç bekleme yok, her istasyon her an açık): kap seç (dokunduğun son yuva etkin) → tat kabına dokun (her
 * dokunuş bir top; Kino kepçeler, top yay çizerek uçar, "pof") → sos → süs → yeşil "ver" düğmesine dokun ya da
 * kuleyi müşteriye sürükle. Yanlış top: kuleye dokun, Kino en üsttekini yer. Ret, ağlama, sabır sayacı yok.
 *
 * V3 (ekip/senaryo/KINO-OTOBUS-V3.md): üç tür istek (resimli, ipuçlu, sürpriz), müşterinin zevki (bayıldı / mmm /
 * komik), külah biter (yap ya da kâse ver), her müşteri top sayısı kadar jeton bırakır (çocuk dokundukça Mino sayar),
 * kumbara dolunca gün sonu üç kart (app.git('odul')). "Şuna dokun" yok: ipucu merdiveni 12 sn bakış, 20 sn Mino
 * durumu anlatır, 30 sn parlama, 40 sn el. Yakın çekim (zoom) yok: poz ve yüz değişimi, ezilme-esneme. Gizli
 * sürprizler (§8): külah zinciri, dolap camı, kumbara hokkabazlığı, kaçan balon, Lokum'un burnu, Zıpzıp, Tombi'nin
 * külahı, kara tahta, Kino'nun hapşırığı ve şapkası.
 */
import K from '../../content/kino-otobus.json';
import { efekt, KINO_SESI, konus } from '../../src/audio/ses';
import type { Soylenecek } from '../../src/audio/konusma';
import { arkaPlanDinle } from '../../src/kabuk/yon';
import { birlesim, yuzKutulari } from '../../src/karakter/yuz';
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
import { KULAH_BAK_MS, KULAH_PARLA_MS, KULAH_STOK, kepceBirak, kepceDolum, kulahKullan, kulahVarMi, kulahYap, lekeDuserMi, Sallama, SALLAMA_GEREK, sosDolum } from './el-isi';
import { isKosesi, KulahPaneli, kulahYigini, Temizlik, type IsOrtami } from './isler';
import { gorulduYaz, gunBitti as kayitGunBitti, kaydet, kayit } from './kayit';
import { kuleCiz, kuleOlcu } from './kule';
import {
  acikGun,
  bosYuva,
  durumSozu,
  durumTopSozu,
  tatSozu,
  etiketsiz,
  gunPlani,
  KUMBARA_HEDEF,
  kapKoy,
  musteriSozu,
  musteriTanim,
  odeme,
  okuma,
  rastgeleUret,
  sayiSecenekleri,
  sayiSozu,
  secimiIlerlet,
  siparisSonucu,
  SOS_RENK,
  sosKoy,
  susKoy,
  tepkiHesapla,
  topKoy,
  verilebilir,
  yalnizKapFarkli,
  ye,
  yuvaIsi,
  type Dondurma,
  type Gun,
  type Is,
  type Kap,
  type Katman,
  type Siparis,
  type Sos,
  type Sus,
  type Tat,
  type Tepki,
  type Yer,
  type Yuva,
} from './model';
import { iskeletVar } from '../../src/karakter/karakter';
import { kitVar } from './kit-musteri';
import { kutuOlcu, Musteri } from './musteri';
import { dondurmaciKino, otobusAdresleri, otobusEl } from './otobus';
import { ses } from './sesler';
import { adres, DOLAP_GOZLERI, dolapYerleri, duraganResim, gorsel, IC_ARKA_CERCEVE, kapAdi, manzaraAdres, sosSiseAdi, sosUstAdi, susAdi, susRafAdi, tatKabiAdi, topAdi, type VarlikAdi } from './varliklar';
import { KUMBARA_CENTIK, lokumSesi } from './gun-ek';
import { onYukle, resimleriTopla } from './yukle';

const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const ozelMi = () => TEST_MODU || (typeof document !== 'undefined' && !!document.body?.dataset.onizleme);
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, AZ_HAREKET ? Math.min(ms, 200) : sure(ms)));
/**
 * İpucu merdiveni (V3 §7; son dokunuştan sayılır): 12 sn müşteri eksik şeye bakar, 20 sn Mino durumu bir daha
 * anlatır, 30 sn eksik şey hafifçe parlar, 40 sn minik el. Parlama 30 sn'den önce hiç çıkmaz.
 */
export const IPUCU = { bak: 12000, anlat: 20000, parla: 30000, el: 40000 } as const;
/** Jetonlara dokunulmazsa kumbara bu kadar sonra hafifçe sallanır (dolaylı) */
const JETON_SALLA_MS = 12000;
/** Karakter ölçeği (müşteriler, Kino): pencerenin kullanılan boy oranına göre (1: boydan sınırlı) */
export const kisiOlcek = (oran: number) => (oran >= 0.9 ? 0.8 : oran <= 0.7 ? 1 : 1 - ((oran - 0.7) / 0.2) * 0.2);
/** müşteri yuvalarının renkleri (kurdele): sol pembe, sağ nane */
const YUVA_RENK = ['#FF8DB4', '#7FD6B0'];

/** Sıradaki iş (parlama, test): istasyonun adı */
export type AdimAdi = 'kap' | 'top' | 'sos' | 'sus' | 'ye' | 'ver' | 'sec' | 'yuva' | 'makine';

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
  /** kule parmakta (sürükleniyor): bu sırada kule yeniden çizilmez (çizilirse parmaktaki kule kopar, bırakma kaybolur) */
  tasiniyor: boolean;
  /** sürükleme sırasında ertelenen çizim */
  cizBekle: boolean;
  /** yuvanın önündeki jeton sırası (müşterinin bıraktığı, kumbaraya gidecek) */
  jetonSira: HTMLElement;
  /** sırada bekleyen jeton */
  jeton: number;
  /** bu sıradan sayılan (Mino'nun sayısı) */
  jetonSayilan: number;
  /** jetonların indiği an (12 sn dokunulmazsa kumbara sallanır) */
  jetonZaman: number;
  /** son jetondan sonra "Kaç jeton oldu?" sorulacak (5-6) */
  kacSor: boolean;
}

export function gunEkrani(app: Uygulama, p: { gun?: number } = {}): Ekran {
  const gun = Math.max(1, Math.min(3, Math.floor(p.gun ?? 1))) as Gun;
  const yas = kayit.yas ?? 'kucuk';
  const ozel = ozelMi();
  // ödülle açılanlar tezgâhta: özel tat (iki ya da daha çoksa sabah seçilir; o zamana dek dünkü ya da son açılan),
  // özel süs (son açılan)
  const acTat = kayit.acilan.tat;
  let ozelTat: Tat | null = kayit.ozelTat && acTat.includes(kayit.ozelTat) ? kayit.ozelTat : (acTat.at(-1) ?? null);
  const ozelSus: Sus | null = kayit.acilan.sus.at(-1) ?? null;
  const ayar = acikGun(gun, ozelTat, ozelSus);
  const tohum = TEST_MODU && q.has('tohum') ? Number(q.get('tohum')) || 1 : Math.floor(Math.random() * 1e9);
  // müşterinin resmi / iskeleti yoksa havuzdan düşer (G-OT1 kesimleri gelmeden de oyun çalışır)
  const varMi = (ad: string) => {
    const t = musteriTanim(ad);
    if (!t) return false;
    if (t.kaynak === 'kit') return kitVar(ad);
    if (t.kaynak === 'duragan') return !!duraganResim(ad);
    return t.kaynak === 'mino' || iskeletVar(ad);
  };
  const kuyruk: Siparis[] = gunPlani(gun, yas, {
    tohum,
    gorulen: kayit.gorulen,
    ilk: !kayit.biten.length,
    ozelTat,
    ozelSus,
    yeni: kayit.yeni,
    varMi,
    // test: belli müşteriler önce (sürprizler: ?musteriler=lokum,zipzip)
    once: TEST_MODU ? (q.get('musteriler')?.split(',').filter(Boolean) ?? []) : [],
  });
  const plan = [...kuyruk];
  const TOPLAM = kuyruk.length;
  gorulduYaz(
    kayit,
    plan.flatMap((s) => [s.musteri, s.ikinci ?? '']).filter((a) => a && a !== 'mino'),
  );
  kaydet();
  const rastgele = rastgeleUret(tohum + 7);
  let kapandi = false;
  const zamanlar: number[] = [];
  const sonra = (ms: number, f: () => void) => zamanlar.push(window.setTimeout(() => !kapandi && f(), ms));

  // ---------------------------------------------------------------- konuşma sırası
  let sira: Promise<void> = Promise.resolve();
  let bekleyenSoz = 0;
  const minolar = new Set<Mino>();
  const kino = dondurmaciKino(kayit.acilan.gorunum.includes('kino-sapka'));
  /**
   * Sırayla söyler: 'mino' anlatıcı (Mino'nun sesi), 'kino' Kino, 'musteri' müşterinin hazır kaydı (dosya yolu).
   * onemli değilse ve sırada söz varsa söylenmez.
   */
  const soyle = (soz: Soylenecek, kim: 'mino' | 'kino' | 'musteri' = 'mino', onemli = true): Promise<void> => {
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
  kinoYer.setAttribute('style', `width:calc(var(--pen-h) * var(--kisi-o, 1) * ${kinoOlcu.en.toFixed(4)});bottom:calc(var(--pen-h) * (var(--kisi-o, 1) * ${kinoOlcu.alt.toFixed(4)} + var(--kisi-kalk, 0)));aspect-ratio:${kinoOlcu.oran}`);

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
    const b = h(`button.ko-raf-esya.ko-sus${s === ozelSus ? '.ko-ozel' : ''}`, { type: 'button', 'data-sus': s, 'aria-label': s, html: gorsel(susRafAdi(s)) });
    b.addEventListener('click', () => susBas(s, b));
    surukleKaldir.push(s === 'serpinti' ? serpintiSurukle(b) : susSurukle(s, b));
    return b;
  });
  const rafEsya = [...sosDugmeleri, ...susDugmeleri];
  const rafSutun = Math.ceil(rafEsya.length / (rafEsya.length > 1 ? 2 : 1));
  const raf = h('div.ko-raf', { 'data-n': String(rafEsya.length), style: `--sutun:${rafSutun}` }, ...rafEsya);

  // kaplar
  // külah rafı: 3 yuvalı tahta raf (gün başında 2 külah; biter: yap ya da kâse ver)
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
    const b = h(`button.ko-tat${t === ozelTat ? '.ko-ozel' : ''}`, { type: 'button', 'data-tat': t, 'aria-label': t, html: gorsel(tatKabiAdi(t)) }, h('i.ko-kepce-yer'));
    b.addEventListener('click', () => tatBas(t, b));
    surukleKaldir.push(kepceSurukle(t, b));
    return b;
  });
  const dolapUrl = adres('dolap');
  const dolapIc = h('div.ko-dolap-ic', {}, ...tatDugmeleri, dolapBuhari());
  const dolap = h('div.ko-dolap', { 'data-sira': ayar.tatlar.length > 4 ? '2' : '1', style: dolapUrl ? `--dolap-url:url("${dolapUrl}");--dolap-oran:${DOLAP_GOZLERI.oran.toFixed(4)}` : undefined }, h('i.ko-dolap-cam', { 'aria-hidden': 'true' }), dolapIc);
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
    // jeton sırası: yuvanın önünde, tezgâh çizgisinde (bütün sıra tek dokunma kutusu)
    const jetonSira = h('button.ko-jeton-sira', { type: 'button', 'data-yuva': String(i), 'aria-label': 'Jetonlar', hidden: true });
    const yuvaEl = h('div.ko-yuva', { 'data-yuva': String(i), style: `--kurdele:${YUVA_RENK[i]}` }, h('i.ko-kurdele', { 'aria-hidden': 'true' }), h('i.ko-yuva-altlik', { 'aria-hidden': 'true' }), kuleKap, verDugme, jetonSira);
    return { i, musteri: null, yuva: bosYuva(), ucan: [new Set<number>(), new Set<number>()], mum: null, yerEl: slotEl[i].yerEl, balonYer: slotEl[i].balonYer, yuvaEl, kuleKap, verDugme, surukleBirak: [], atla: null, tasiniyor: false, cizBekle: false, jetonSira, jeton: 0, jetonSayilan: 0, jetonZaman: 0, kacSor: false };
  });
  const yuvalar = h('div.ko-yuvalar', {}, ...slotlar.map((s) => s.yuvaEl));

  // kumbara kavanozu (tezgâh çizgisinde, temas gölgesiyle): rakam yok; yan yüzünde üç çentik, jeton geldikçe içi
  // yükselir (jeton yığını maskesi), dolunca kapağı "pıt" diye bir kez zıplar
  let bugun = 0;
  const HEDEF_JETON = KUMBARA_HEDEF[yas];
  const kumbaraDolgu = h('i.ko-kumbara-dolgu', { 'aria-hidden': 'true', style: '--dolu:0' });
  const kumbara = h(
    'button.ko-kumbara',
    { type: 'button', 'aria-label': 'Kumbara', html: gorsel('kumbara-kavanoz') },
    kumbaraDolgu,
    h('i.ko-kumbara-centik', { 'aria-hidden': 'true' }, ...KUMBARA_CENTIK.map((c) => h('i', { style: `--c:${c}` }))),
  );
  // kumbaranın üstünde külah makinesi (iş köşesi): külah azalınca parlar, dokununca külah yapılır
  const kose = isKosesi(() => kulahPaneliAc());
  const kumbaraYer = h('div.ko-kumbara-yer', {}, kose.el, h('i.ko-golge', { 'aria-hidden': 'true' }), kumbara);
  // kumbara: 5 hızlı dokunuşta Kino üç jetonla hokkabazlık yapar (gizli sürpriz)
  const kumbaraDokunus: number[] = [];
  kumbara.addEventListener('click', () => {
    efekt.dokunma();
    salla(kumbara, 'ko-zipla');
    const t = performance.now();
    kumbaraDokunus.push(t);
    while (kumbaraDokunus.length && t - kumbaraDokunus[0] > 2500) kumbaraDokunus.shift();
    if (kumbaraDokunus.length >= 5) {
      kumbaraDokunus.length = 0;
      void hokkabaz();
    }
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
    // karakterlerin ölçeği: pencere boydan sınırlıysa (yatay telefon: karakterler pencereyi dolduruyordu) %80, enden
    // sınırlıysa (dikey: karakterler zaten küçük) tam boy; arası yumuşak geçer. Balonlar küçülmez (istek okunur kalır).
    // küçülen karakter biraz yükselir (tezgâhın üstünde gövdesi daha çok görünür): yüzü ve tadımdaki dondurma tezgâh
    // çizgisinin üstünde kalır, başın üstünde gökyüzü açılır
    if (penH > 0) {
      const ko = kisiOlcek(penH / mk.height);
      el.style.setProperty('--kisi-o', ko.toFixed(3));
      el.style.setProperty('--kisi-kalk', ((1 - ko) * 0.6).toFixed(3));
    }
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

  // yakın çekim (kamera zoom) yok (V3 §11): bütün anlar aynı ölçekte poz ve yüz değişimiyle; görsel kaynak pikselinin
  // üstüne büyütülmez (src/ui/netlik.ts)

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
  // Kino'ya dokunuş: 3. dokunuşta soğuktan hapşırır, 5.'de kiraz şapkası varsa şapka zıplar (gizli sürpriz)
  let kinoDokunus = 0;
  kinoYer.addEventListener('click', () => {
    efekt.dokunma();
    kinoBas = performance.now() / 1000;
    kinoDokunus++;
    void kino.oynat('sevin', 800);
    if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 900);
    const [x, y] = efekt_.merkez(kino.el, 0.5, 0.3);
    efekt_.kalpler(x, y, 2);
    if (kinoDokunus % 5 === 3) {
      ses.hapsu();
      efekt_.pof(x, y + 20, 0.6);
      surpriz('hapsu');
    } else if (kinoDokunus % 5 === 0 && kayit.acilan.gorunum.includes('kino-sapka')) {
      const sapka = kino.parcaG('kafa')?.querySelector<SVGGElement>('.ko-kino-sapka') ?? null;
      if (sapka) salla(sapka as unknown as HTMLElement, 'ko-sapka-zipla');
      ses.pit(4);
      surpriz('sapka');
    } else seyrekSoyle(K.kino.hav, 'kino', 2500);
  });
  // ---------------------------------------------------------------- gizli sürprizler (V3 §8; hiçbiri ipucuyla gösterilmez)
  // 1. külah zinciri: her külah bir nota; soldan sağa sırayla dokununca "Dondurmaaa" kornası, Kino dans eder
  const zincirKulahlari = [...pencere.querySelectorAll<HTMLElement>('.ko-zincir-kulah')];
  let zincirSira = 0;
  let zincirZaman = 0;
  zincirKulahlari.forEach((k, i) =>
    k.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      ses.nota(i);
      salla(k, 'ko-zincir-dokun');
      const t = performance.now();
      zincirSira = i === zincirSira && t - zincirZaman < 3000 ? i + 1 : i === 0 ? 1 : 0;
      zincirZaman = t;
      if (zincirSira === zincirKulahlari.length) {
        zincirSira = 0;
        surpriz('zincir');
        ses.dondurmaKorna();
        void kino.oynat('dans', 1400);
      }
    }),
  );
  // 2. dolabın camı: üç dokunuşta buğuya kalp çizilir, Kino göz kırpar
  let camDokunus: number[] = [];
  dolap.addEventListener('click', (e) => {
    if ((e.target as Element).closest('.ko-tat, .ko-leke, .ko-sinek')) return;
    const t = performance.now();
    camDokunus = [...camDokunus.filter((x) => t - x < 2500), t];
    if (camDokunus.length < 3) return;
    camDokunus = [];
    surpriz('cam');
    dolap.querySelector('.ko-cam-kalp')?.remove();
    const kalp = h('i.ko-cam-kalp', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 40 36"><path d="M20 32C9 24 4 18 4 12C4 7 8 4 12 4C15.5 4 18 6 20 9C22 6 24.5 4 28 4C32 4 36 7 36 12C36 18 31 24 20 32Z" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" pathLength="100"/></svg>' });
    dolap.append(kalp);
    window.setTimeout(() => kalp.remove(), TEST_MODU ? 300 : 3500);
    ses.gicir();
    if (kino.ifadeVar('keyif')) kino.ifade('keyif', 500);
    kinoBas = performance.now() / 1000;
  });
  // 8. kara tahta: resmine dokunulan tatın adını Mino söyler (çilek, vanilya, fıstık)
  duvar.el.querySelector<HTMLElement>('.ko-duvar-tahta')?.addEventListener('click', (e) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (y < 0.33 || y > 0.86) return;
    const t: Tat = x > 0.5 ? 'fistik' : y < 0.52 ? 'cilek' : 'vanilya';
    surpriz('tahta');
    salla(e.currentTarget as HTMLElement, 'ko-zipla');
    void soyle(tatSozu(t, true), 'mino');
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
  /** müşterisi gelmiş ve dondurmasını bekliyor */
  const bekliyor = (s: Slot) => !!s.musteri?.hazir && !s.musteri.bitti;
  /**
   * Yuvadaki dondurma kime verilir (ver düğmesi, müşteriye dokunuş): kendi müşterisi bekliyorsa ona; kendi müşterisi
   * yoksa (gitti, yenisi gelmedi) bekleyen öbür müşteriye. Verilemiyorsa null.
   */
  function verHedefi(s: Slot): Slot | null {
    if (bekliyor(s)) return verilebilir(s.yuva, s.musteri!.sip) ? s : null;
    const o = slotlar[1 - s.i];
    return bekliyor(o) && verilebilir(s.yuva, o.musteri!.sip) ? o : null;
  }
  /** Yuvada yapılan dondurma hangi siparişe göre (kap sayısı, paylaşmada seçim): kendi müşterisi, yoksa bekleyen öbürü */
  const yuvaSiparisi = (s: Slot) => (bekliyor(s) ? s.musteri!.sip : bekliyor(slotlar[1 - s.i]) ? slotlar[1 - s.i].musteri!.sip : (s.musteri?.sip ?? null));
  /** müşterinin bırakma alanı: müşteri katındaki yeri (balonu dahil) ve karakterlerin kendisi (ekran) */
  function birakmaAlani(m: Slot): DOMRect[] {
    const r = [slotEl[m.i].kap.getBoundingClientRect()];
    for (const k of m.musteri?.kisiler ?? []) r.push(k.el.getBoundingClientRect());
    return r;
  }
  /**
   * Sürüklenen kule nereye bırakıldı: parmağın altındaki bekleyen müşteri (iki müşterinin alanı da tutarsa kendi
   * müşterisi önce); o müşteriye bu yuvadan verilebiliyorsa o.
   */
  function birakmaHedefi(s: Slot, x: number, y: number): Slot | null {
    const pay = 24 * birim();
    const adaylar = [s, slotlar[1 - s.i]].filter((m) => bekliyor(m) && verilebilir(s.yuva, m.musteri!.sip));
    return adaylar.find((m) => birakmaAlani(m).some((r) => icinde(r, x, y, pay))) ?? null;
  }
  function yuvaCiz(s: Slot) {
    const y = s.yuva;
    if (s.tasiniyor) {
      // kule parmakta: yeniden çizilirse sürükleme kopar (bırakınca dondurma verilemezdi); bırakınca çizilir
      s.cizBekle = true;
    } else {
      s.cizBekle = false;
      s.surukleBirak.forEach((f) => f());
      s.surukleBirak = [];
      const cift = y.kaplar.length > 1;
      s.kuleKap.replaceChildren(
        ...y.kaplar.map((d, k) => {
          const kule = kuleCiz({ ...d, mum: k === 0 ? s.mum : null }, { gizliTop: s.ucan[k] });
          const alt = h(`div.ko-alt${k === y.secili && cift ? '.ko-secili' : ''}`, { 'data-k': String(k), style: `--t:${kuleBoyutu(d, cift)}` }, kule);
          let sonX = 0;
          let sonY = 0;
          s.surukleBirak.push(
            surukle({
              el: kule,
              hedef: () => (verHedefi(s) ?? s).yerEl,
              // bekleyen herhangi bir müşteriye verilebiliyorsa sürüklenir
              aktif: () => [s, slotlar[1 - s.i]].some((m) => bekliyor(m) && verilebilir(s.yuva, m.musteri!.sip)),
              basla: () => {
                s.tasiniyor = true;
              },
              tasi: (x, y_) => {
                sonX = x;
                sonY = y_;
              },
              // bırakma yeri birakmaHedefi ile (iki müşteriden biri olabilir); surukle()'nin tek hedefi yalnız vurgu için
              birak: (_hedefte, dokunus) => {
                s.tasiniyor = false;
                const m = dokunus ? null : birakmaHedefi(s, sonX, sonY);
                if (dokunus) {
                  geriGonder(kule);
                  kuleBas(s, k);
                } else if (m) {
                  kule.style.transform = '';
                  void servis(m, s);
                  return;
                } else geriGonder(kule);
                if (s.cizBekle) yuvaCiz(s);
              },
            }),
          );
          // sürüklenemiyorken de dokunuş çalışır
          kule.addEventListener('click', () => {
            if (verHedefi(s)) return;
            kuleBas(s, k);
          });
          return alt;
        }),
      );
    }
    s.kuleKap.dataset.kap = String(y.kaplar.length);
    s.yuvaEl.classList.toggle('ko-aktif', aktif === s.i);
    s.yuvaEl.dataset.dolu = y.kaplar.some((d) => d.toplar.length) ? '1' : '0';
    s.verDugme.hidden = !verHedefi(s);
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
    s.verDugme.addEventListener('click', () => {
      const m = verHedefi(s);
      if (m) void servis(m, s);
      else void servis(s);
    });
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
    const kacKap = yuvaSiparisi(s)?.istek.length ?? 1;
    // rafta külah yok: Kino rafın altına bakar, boş elini gösterir, omuz silker (komik; ceza değil)
    if (kap === 'kulah' && !kulahVarMi(kulahStok)) {
      bosKulah(b);
      return;
    }
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
    const sip = yuvaSiparisi(s);
    if (sip) secimiIlerlet(s.yuva, sip);
    yuvaCiz(s);
    adimGuncelle();
    void (async () => {
      await yuvayaUcur(s, gorsel(topAdi(tat)), bas, `.ko-k-top[data-i="${n}"]`, k);
      if (kapandi) return;
      if (!s.ucan[k].delete(n)) return;
      // top yerine indi: kule yeniden kurulmaz, yalnız top görünür (çocuk o an kuleyi sürüklüyor olabilir)
      const inen = s.kuleKap.querySelector(`.ko-alt[data-k="${k}"] .ko-k-top[data-i="${n}"][data-tat="${tat}"]`);
      if (inen) inen.classList.remove('ko-gizli');
      else yuvaCiz(s);
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
      birak: (x, y, kisa) => {
        yuvaVurgula(null);
        const t = tut;
        tut = null;
        if (!t) return;
        const sonuc = kepceBirak(dolum, icinde(b.getBoundingClientRect(), x, y), kisa);
        if (sonuc === 'dokunus') {
          // kayan dokunuş: dokunmuş gibi Kino kepçeler, top yuvaya uçar
          void t.don_(null, 0);
          tatBas(tat, b);
          return;
        }
        if (sonuc === 'geri') {
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
      birak: (_x, _y, kisa) => {
        cancelAnimationFrame(raf);
        yuvaVurgula(null);
        ustunde = false;
        akisCiz();
        const t = tut;
        tut = null;
        if (kisa && !hedef) {
          // kayan dokunuş (hiçbir kuleye gitmedi): dokunmuş gibi sos dökülür
          t?.kaldir();
          b.classList.remove('ko-tasiniyor');
          sosBas(sos, b);
          return;
        }
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
      birak: (_x, _y, kisa) => {
        yuvaVurgula(null);
        // bir kez bile salladıysa serpinti tamamlanır
        if (hedef && !tamam) tamamla();
        const t = tut;
        tut = null;
        if (kisa && !hedef) {
          // kayan dokunuş: dokunmuş gibi serpilir
          t?.kaldir();
          b.classList.remove('ko-tasiniyor');
          susBas('serpinti', b);
          return;
        }
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
      birak: (x, y, kisa) => {
        yuvaVurgula(null);
        const t = tut;
        tut = null;
        if (!t) return;
        const h_ = topluHedef(x, y);
        if (!h_ && kisa) {
          // kayan dokunuş: dokunmuş gibi süs konur
          t.kaldir();
          b.classList.remove('ko-tasiniyor');
          susBas(sus, b);
          return;
        }
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
    const onceki = s.musteri ? yuvaIsi(s.musteri.sip, s.yuva) : null;
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
    kirazSapka: kayit.acilan.gorunum.includes('kino-sapka'),
  };
  // temizlik: lekeler dolabın üst kenarına (tezgâha) damlar
  const temizlik = new Temizlik(isOrtami);
  dolapIc.append(temizlik.el);
  let verilenSayisi = 0;
  function lekeleriDusur() {
    temizlik.dus([22, 50, 78]);
  }

  // külah (V3 §3): alındıkça raf azalır ve BİTER. Çocuğun üç yolu: külah yap (makine, 3 taze külah), kâse ver ya da
  // bekletip sıradakine geç. Makine yalnız buharıyla işaret verir; ancak külah isteyen müşteri 20 sn bekleyince parlar.
  let kulahBittiSoylendi = false;
  function kulahCiz() {
    if (kulahDugme) {
      kulahDugme.innerHTML = kulahYigini(kulahStok);
      kulahDugme.classList.toggle('ko-kulah-yok', !kulahVarMi(kulahStok));
    }
    kose.el.classList.toggle('ko-buhar-cok', !kulahVarMi(kulahStok));
    if (kulahVarMi(kulahStok)) kose.isVar(false);
    el.dataset.kulah = String(kulahStok);
  }
  function kulahAlindi() {
    const once = kulahStok;
    kulahStok = kulahKullan(kulahStok);
    if (kulahStok === once) return;
    kulahCiz();
    if (!kulahVarMi(kulahStok)) {
      // son külah: raf hafifçe sallanır, boş kâğıt kılıf "pıt" diye çöker; Kino günde bir kez "Külah bitti!"
      salla(kulahDugme, 'ko-raf-salla');
      ses.pit(0);
      if (!kulahBittiSoylendi) {
        kulahBittiSoylendi = true;
        void soyle(K.kino.kulah_bitti, 'kino', false);
      }
    }
  }
  /** Boş rafa dokunuş: Kino rafın altına eğilip bakar, boş patisini gösterir, omuz silker */
  function bosKulah(b: HTMLElement) {
    salla(b, 'ko-hayir');
    ses.degil();
    void kino.oynat('bak', 500).then(() => !kapandi && void kino.oynat('hayir', 700));
    if (kino.ifadeVar('saskin')) kino.ifade('saskin', 900);
    kose.el.classList.add('ko-buhar-cok');
    salla(kose.el, 'ko-zipla');
    if (!kulahBittiSoylendi) {
      kulahBittiSoylendi = true;
      void soyle(K.kino.kulah_bitti, 'kino', false);
    }
    adimGuncelle();
  }
  let panel: KulahPaneli | null = null;
  function kulahPaneliAc() {
    if (panel || kapandi) return;
    elIpucuGizle();
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
    kose.isVar(false);
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
  /** istek okuması (Mino isteği eksiksiz okur) yalnız günün ilk 2 resimli isteğinde; sonra balon kendi konuşur */
  let okunanResimli = 0;
  /** Zıpzıp sıradakinin önüne atladı mı (günde bir) */
  let zipzipAtladi = false;
  /** İstek balonu bir an zıplar (kamera yerine; büyütme yok): çocuk ne istendiğini görür */
  function balonBuyut(b: HTMLElement) {
    if (TEST_MODU || AZ_HAREKET) return;
    b.classList.remove('ko-balon-acil', 'ko-balon-buyu');
    void b.offsetWidth;
    b.classList.add('ko-balon-buyu');
    b.addEventListener('animationend', () => b.classList.remove('ko-balon-buyu'), { once: true });
  }

  /**
   * Müşterinin isteğini kim söyler (V3 §1.3, §9): sesi olan müşteri kendi söyler (kaydı gelene dek balonda yazı;
   * Lokum'un hazır kaydı var); Mino emir vermez, durumu anlatır. Resimli istek yalnız günün ilk 2 resimlisinde okunur.
   */
  function istekSoyle(m: Musteri, tekrar = false): Promise<void> {
    const sip = m.sip;
    if (m.tanim?.ses) {
      const c = musteriSozu(m.ad, 'istek');
      if (c) m.soz(etiketsiz(c), true);
      const kayitli = lokumSesi(m.ad, 'istek');
      if (kayitli) void soyle(kayitli, 'musteri');
    }
    let soz: string[];
    if (sip.tur === 'resimli') {
      if (!tekrar && okunanResimli < 2) {
        okunanResimli++;
        soz = okuma(sip);
      } else soz = [durumSozu(sip)];
    } else if (sip.tur === 'ipucu' || sip.tur === 'surpriz') {
      soz = [durumSozu(sip)];
      const n = sip.ipucu?.top ? durumTopSozu(sip.ipucu.top) : null;
      if (n) soz.push(n);
    } else soz = okuma(sip);
    const p = soyle(soz, 'mino', !tekrar);
    if (!tekrar && sip.ipucu?.ozellik === 'yeni') void soyle(K.kino.yeni_dene, 'kino', false);
    return p;
  }

  async function musteriGelsin(s: Slot) {
    if (kapandi) return;
    // Zıpzıp sıradakinin önüne atlar (gizli sürpriz §8.6): dokunulursa utanıp yerine döner, dokunulmazsa ilk o alır
    const zi = kuyruk.findIndex((x) => x.musteri === 'zipzip');
    let atladi = false;
    if (!zipzipAtladi && zi > 0 && !kuyruk[0].ogretici && kuyruk[0].tur !== 'dogumgunu') {
      zipzipAtladi = true;
      atladi = true;
      kuyruk.unshift(...kuyruk.splice(zi, 1));
    }
    const sip = kuyruk.shift();
    if (!sip) return;
    const m = new Musteri(sip, s.i === 0 ? 'sol' : 'sag');
    if (ozel) m.el.dataset.siparis = JSON.stringify(sip);
    s.musteri = m;
    s.yerEl.replaceChildren(m.el);
    s.yerEl.dataset.adet = String(m.kisiler.length);
    s.balonYer.replaceChildren(m.balon);
    for (const kisi of m.kisiler) if (kisi.mino) minolar.add(kisi.mino);
    m.el.addEventListener('click', () => musteriBas(s));
    m.balon.addEventListener('click', () => musteriBas(s, true));
    await m.hazirSoz;
    await m.gel();
    if (kapandi) return;
    if (atladi && (await zipzipOnce(s, m))) return;
    const balonAyir = () => (kapandi || m.bitti || !m.el.isConnected ? undefined : m.balonuYuzdenAyir());
    window.setTimeout(balonAyir, 500);
    window.setTimeout(balonAyir, 1700);
    // etkin yuvanın müşterisi yoksa ve yuva boşsa yeni gelen müşterinin yuvası etkin olur (dondurma ona yapılır)
    const ak = slotlar[aktif];
    if (ak !== s && !bekliyor(ak) && !ak.yuva.kaplar.length) aktifSec(s.i);
    slotlar.forEach(yuvaCiz);
    adimGuncelle();
    if (!m.tanim?.ses) void soyle(K.kino.hosgeldin, 'kino', false);
    balonBuyut(m.balon);
    await istekSoyle(m);
  }

  /**
   * Zıpzıp önce: yana zıplayıp pencerenin önüne geçer, "Ben önce!". 3.5 sn içinde dokunulursa utanır, yerine döner
   * (sıra eski hâline gelir, dönen: true); dokunulmazsa ilk o alışveriş yapar.
   */
  async function zipzipOnce(s: Slot, m: Musteri): Promise<boolean> {
    m.el.classList.add('ko-zipzip-once');
    m.soz(etiketsiz(musteriSozu('zipzip', 'istek') ?? 'Ben önce!'));
    m.ezEsnet();
    void m.anaKisi.oynat('sevin', 600);
    surpriz('zipzip');
    const geri = await new Promise<boolean>((coz) => {
      const z = window.setTimeout(() => coz(false), TEST_MODU ? 1500 : 3500);
      m.el.addEventListener(
        'pointerdown',
        () => {
          clearTimeout(z);
          coz(true);
        },
        { once: true },
      );
    });
    m.el.classList.remove('ko-zipzip-once');
    if (!geri || kapandi) return false;
    // utandı: yanakları kızarır, yerine döner; sıra eski hâline gelir
    surpriz('zipzip-geri');
    m.el.classList.add('ko-utandi');
    m.bitti = true;
    await m.git();
    m.kapat();
    m.el.remove();
    m.balon.remove();
    s.musteri = null;
    kuyruk.splice(Math.min(1, kuyruk.length), 0, m.sip);
    if (!kapandi) void musteriGelsin(s);
    return true;
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
    if (!balon && verilebilir(s.yuva, m.sip) && yuvaIsi(m.sip, s.yuva).tur === 'ver') {
      void servis(s);
      return;
    }
    // müşterisi olmayan öbür yuvada bu müşterinin dondurması hazırsa o verilir
    const o = slotlar[1 - s.i];
    if (!balon && !bekliyor(o) && verilebilir(o.yuva, m.sip) && yuvaIsi(m.sip, o.yuva).tur === 'ver') {
      void servis(s, o);
      return;
    }
    // Lokum'a dokununca Kino eğilip burnuna minik dondurma sürer (gizli sürpriz §8.5; ziyaret başına bir kez)
    if (!balon && m.ad === 'lokum' && !m.el.classList.contains('ko-burunlu')) {
      void lokumBurun(s, m);
      return;
    }
    // isteği bir daha dinlet; yuvası etkin olur
    m.dikkat();
    aktifSec(s.i);
    void istekSoyle(m, true);
  }

  /** Kino eğilir, Lokum'un burnuna minik dondurma sürer; Lokum kıkırdar */
  async function lokumBurun(s: Slot, m: Musteri) {
    m.el.classList.add('ko-burunlu');
    surpriz('lokum');
    void cakYap(s, m);
    await bekle(330);
    if (kapandi) return;
    const y = m.yuz().yuz;
    const kk = efekt_.kutu();
    if (y) {
      const nokta = h('i.ko-burun-dondurma', { 'aria-hidden': 'true', html: gorsel(topAdi('cilek')), style: `left:${((y.left + y.right) / 2 - kk.left).toFixed(1)}px;top:${(y.top + (y.bottom - y.top) * 0.42 - kk.top).toFixed(1)}px` });
      efekt_.el.append(nokta);
      window.setTimeout(() => nokta.remove(), TEST_MODU ? 200 : 2600);
    }
    ses.pit(2);
    m.mutlu(1600);
    m.ezEsnet();
    const kayitli = lokumSesi('lokum', 'kikir');
    if (kayitli) void soyle(kayitli, 'musteri', false);
    m.soz('Iii!');
  }

  // ---------------------------------------------------------------- para: kısa sayma (V3 §4)
  /** "Kaç jeton oldu?" bugün kaç kez soruldu (5-6, en çok 2) */
  let kacSoruldu = 0;
  let kumbaraDolduMu = false;
  /** Kumbaranın içi: jeton geldikçe yükselir (rakam yok); hedefte kapağı bir kez "pıt" */
  function kumbaraGuncelle() {
    const oran = Math.min(1, bugun / HEDEF_JETON);
    kumbaraDolgu.style.setProperty('--dolu', oran.toFixed(3));
    if (oran >= 1 && !kumbaraDolduMu) {
      kumbaraDolduMu = true;
      kumbara.classList.add('ko-kumbara-dolu');
      salla(kumbara, 'ko-kapak-pit');
      ses.pit(4);
      const [x, y] = efekt_.merkez(kumbara, 0.5, 0.1);
      efekt_.parilti(x, y, 8, 0.6, '#FFE45C');
    }
    durumYaz();
  }
  /** Sıradaki jetonların çizimi (yan yana, temas gölgeli) */
  function jetonCiz(s: Slot) {
    s.jetonSira.replaceChildren(...Array.from({ length: s.jeton }, (_, i) => h('i.ko-sira-jeton', { style: `--i:${i}`, html: gorsel('jeton') })));
    s.jetonSira.hidden = s.jeton === 0;
    s.jetonSira.dataset.n = String(s.jeton);
  }
  /** Bir jeton kumbaraya uçar (bas: ekran yeri); sayilsin: Mino sayar */
  async function jetonUcur(bas: [number, number], sira: number) {
    const hedef = efekt_.merkez(kumbara, 0.5, 0.3);
    await efekt_.ucur(h('div.ko-ucan-jeton', { html: gorsel('jeton') }), bas, hedef, { ms: 420, kavis: -70, boy0: 1, boy1: 0.6, don: 0 });
    if (kapandi) return;
    bugun++;
    salla(kumbara, 'ko-zipla');
    ses.singir(sira);
    efekt_.parilti(hedef[0], hedef[1], 3, 0.45, '#FFE45C');
    kumbaraGuncelle();
  }
  /**
   * Müşteri, top sayısı kadar jetonu kendi yuvasının önüne bırakır (iki sekme). Yuvanın önünde eski jeton kalmışsa önce
   * o sayılmadan "şıngır" diye kumbaraya kayar (sıralar karışmaz).
   */
  async function jetonBirak(s: Slot, m: Musteri, adet: number) {
    if (s.jeton) await kalanJetonlar(s);
    const kat = efekt_.kutu();
    const { yuz } = m.yuz();
    const jy = 15 * birim();
    const pen = pencere.getBoundingClientRect();
    const bas: [number, number] = yuz ? [(yuz.left + yuz.right) / 2 - kat.left, Math.max(yuz.bottom + jy, pen.bottom - jy * 1.4) - kat.top] : efekt_.merkez(m.el, 0.5, 0.85);
    const hedef = efekt_.merkez(s.yuvaEl, 0.5, 0.02);
    s.jeton = 0;
    s.jetonSayilan = 0;
    s.kacSor = yas === 'buyuk' && kacSoruldu < 2 && adet >= 2;
    if (s.kacSor) kacSoruldu++;
    await Promise.all(
      Array.from({ length: adet }, async (_, i) => {
        await efekt_.ucur(h('div.ko-ucan-jeton', { html: gorsel('jeton') }), bas, hedef, { ms: 460, gecikme: i * 110, kavis: -40, boy0: 1, boy1: 0.75, don: 0 });
        if (kapandi) return;
        s.jeton++;
        jetonCiz(s);
        ses.tak();
        salla(s.jetonSira.lastElementChild, 'ko-jeton-sek');
      }),
    );
    s.jetonZaman = performance.now();
    durumYaz();
  }
  /** Jeton sırasına dokunuş: sıradaki jeton kumbaraya uçar, Mino sayar ("Bir!", "İki!" …); son jetonda kavanoz zıplar */
  function jetonSay(s: Slot, bas?: [number, number]) {
    if (!s.jeton || kapandi) return;
    const son = s.jetonSira.lastElementChild as HTMLElement | null;
    const yer = bas ?? (son ? efekt_.merkez(son) : efekt_.merkez(s.jetonSira));
    s.jeton--;
    s.jetonSayilan++;
    s.jetonZaman = performance.now();
    jetonCiz(s);
    const n = s.jetonSayilan;
    void soyle(sayiSozu(n), 'mino');
    void jetonUcur(yer, n).then(() => {
      if (s.jeton || kapandi) return;
      salla(kumbara, 'ko-cok-zipla');
      if (s.kacSor) {
        s.kacSor = false;
        void kacJeton(n);
      }
    });
  }
  /** Gün sonunda (ya da yeni sıra inerken) kalan jetonlar sayılmadan "şıngır" diye kumbaraya kayar */
  async function kalanJetonlar(s: Slot) {
    const n = s.jeton;
    if (!n) return;
    const yerler = [...s.jetonSira.children].map((c) => efekt_.merkez(c));
    s.jeton = 0;
    jetonCiz(s);
    await Promise.all(yerler.map((y, i) => new Promise<void>((coz) => window.setTimeout(() => void jetonUcur(y, i).then(coz), i * 70))));
  }
  /** 5-6: "Kaç jeton oldu?" kumbaranın yanında üç rakam balonu (doğru, bir eksik, bir fazla); 10 sn dokunulmazsa söner */
  let sayiBalonlari: HTMLElement | null = null;
  async function kacJeton(n: number) {
    sayiBalonlari?.remove();
    await soyle(K.mino.odeme.kac, 'mino');
    if (kapandi) return;
    const kap = h('div.ko-sayi-balonlar', { 'data-dogru': String(n) });
    let bitti = false;
    const kapat = () => {
      if (bitti) return;
      bitti = true;
      kap.classList.add('ko-sonuyor');
      window.setTimeout(() => kap.remove(), 300);
      if (sayiBalonlari === kap) sayiBalonlari = null;
    };
    for (const sayi of sayiSecenekleri(n, rastgele)) {
      const b = h('button.ko-sayi-balon', { type: 'button', 'data-sayi': String(sayi) }, String(sayi));
      b.addEventListener('click', async () => {
        if (bitti) return;
        efekt.dokunma();
        if (sayi === n) {
          // doğru: kavanoz parlar
          kapat();
          efekt.dogru();
          const [x, y] = efekt_.merkez(kumbara, 0.5, 0.4);
          efekt_.parilti(x, y, 10, 0.7, '#FFE45C');
          salla(kumbara, 'ko-cok-zipla');
          void soyle(sayiSozu(n), 'mino');
        } else {
          // yanlış değil, yeniden sayalım: jetonlar kavanozda bir kez daha zıplayıp sayılır, Mino güler
          kapat();
          for (let i = 1; i <= n; i++) {
            salla(kumbara, 'ko-zipla');
            ses.singir(i);
            await soyle(sayiSozu(i), 'mino');
            if (kapandi) return;
          }
        }
      });
      kap.append(b);
    }
    kumbaraYer.append(kap);
    sayiBalonlari = kap;
    window.setTimeout(kapat, TEST_MODU ? 4000 : 10000);
  }
  // jeton sırası: dokunuş ya da jetonu kumbaraya sürükleme
  for (const s of slotlar) {
    s.jetonSira.addEventListener('click', () => jetonSay(s));
    let tut: Tutulan | null = null;
    surukleKaldir.push(
      elSurukle(s.jetonSira, {
        aktif: () => s.jeton > 0,
        basla: (x, y) => {
          const en = 40 * birim();
          tut = new Tutulan(efekt_, gorsel('jeton'), { sinif: 'ko-tut-jeton', en, boy: en });
          tut.yer(x, y);
          const son = s.jetonSira.lastElementChild as HTMLElement | null;
          if (son) son.style.visibility = 'hidden';
        },
        tasi: (x, y, dx) => tut?.yer(x, y, dx),
        birak: (x, y, kisa) => {
          const t = tut;
          tut = null;
          const son = s.jetonSira.lastElementChild as HTMLElement | null;
          if (son) son.style.visibility = '';
          if (!t) return;
          const k = efekt_.kutu();
          if (kisa || icinde(kumbaraYer.getBoundingClientRect(), x, y, 24 * birim())) {
            t.kaldir();
            jetonSay(s, [x - k.left, y - k.top]);
          } else void t.don_(son ? ekranMerkez(son) : ekranMerkez(s.jetonSira), 240);
        },
      }),
    );
  }

  /** Dondurmayı verir: s müşterinin yeri, kaynak dondurmanın yapıldığı yuva (çoğunlukla aynı; müşterisi gitmiş yuvadan öbür müşteriye de verilir) */
  async function servis(s: Slot, kaynak: Slot = s) {
    const m = s.musteri;
    if (!m || !m.hazir || m.bitti || kapandi) return;
    if (!verilebilir(kaynak.yuva, m.sip)) {
      salla(kaynak.yuvaEl, 'ko-hayir');
      ses.degil();
      return;
    }
    m.bitti = true;
    m.el.classList.add('ko-bitti');
    // şaşırma, tadım ve sevinç boyunca istek balonu yüzün önüne kaymaz (müşteri hoplayıp dans ederken de)
    m.balonuYuzdenAyir();
    const balonIzle = window.setInterval(() => (kapandi || !m.el.isConnected ? clearInterval(balonIzle) : m.balonuYuzdenAyir()), 200);
    const verilen: Dondurma[] = kaynak.yuva.kaplar.map((d) => ({ ...d, toplar: [...d.toplar], susler: [...d.susler] }));
    const tepki: Tepki = tepkiHesapla(m.sip, verilen, m.tanim);
    const resimli = m.sip.tur !== 'ipucu' && m.sip.tur !== 'surpriz';
    const sonuc = resimli ? siparisSonucu(m.sip, verilen) : null;
    const dogumgunu = m.sip.tur === 'dogumgunu';
    // Mino'nun doğum günü: Kino kupaya mum diker
    if (dogumgunu) {
      kaynak.mum = 'yanik';
      yuvaCiz(kaynak);
      ses.pit(3);
      await bekle(450);
    }
    const kopya = kuleKopya(kaynak.kuleKap);
    const bas = efekt_.merkez(kaynak.kuleKap, 0.5, 0.5);
    kaynak.yuva = bosYuva();
    kaynak.ucan.forEach((u) => u.clear());
    kaynak.mum = null;
    yuvaCiz(kaynak);
    // bekleyen başka müşteri varsa onun yuvası etkin olur
    const obur = slotlar.find((o) => o !== s && bekliyor(o));
    if (obur) aktifSec(obur.i);
    adimGuncelle();
    ses.ksilofon();
    void kino.oynat('sevin', 700);
    void soyle(K.kino.buyurun, 'kino', false);
    // yoğun an: verirken tezgâha dondurma damlar (her ikinci verişte; silmek isteğe bağlı)
    if (lekeDuserMi(++verilenSayisi, temizlik.sayi, !!m.sip.ogretici)) lekeleriDusur();
    const kisiEl = m.anaKisi.el;
    const [ax, ay] = m.anaKisi.agiz();
    // dondurma tadımdaki yerine uçar: ağzın hemen altı (yüzün önünden geçmez, göz ve kaşlar açıkta)
    const kat = efekt_.kutu();
    const ly = m.lokmaYeri();
    const kk = kaynak.kuleKap.getBoundingClientRect();
    const ciz = birlesim([...kaynak.kuleKap.querySelectorAll('.ko-g, img, svg')].map((e) => e.getBoundingClientRect())) ?? kk;
    const boy1 = 0.75;
    const hedef: [number, number] = dogumgunu
      ? efekt_.merkez(kisiEl, ax, ay)
      : [ly.x - kat.left - boy1 * ((ciz.left + ciz.right) / 2 - (kk.left + kk.width / 2)), ly.ust - kat.top - boy1 * (ciz.top - (kk.top + kk.height / 2))];
    kopya.classList.add('ko-ucan-kule');
    await efekt_.ucur(kopya, bas, hedef, dogumgunu ? { ms: 480, kavis: -110, boy1: 0.8 } : { ms: 480, kavis: 30, boy0: 0.85, boy1 });
    if (kapandi) return;
    const lokma = kopya.cloneNode(true) as HTMLElement;
    lokma.classList.remove('ko-ucan-kule');
    if (dogumgunu) {
      // Mino mumu üfler, herkes alkışlar
      const mino = m.anaKisi.mino;
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
    // komik olacaksa müşteri önce şaşırır (iri gözler, "o" ağız), sonra tadar
    if (tepki === 'komik' && !dogumgunu) {
      m.saskin(600);
      await bekle(500);
      if (kapandi) return;
    }
    // Bıdık külahı da yer (gizli şaka): üç ısırık, "kıtır kıtır", "Hıp! Pardon!"
    const kemir = m.ad === 'bidik' && verilen.some((d) => d.kap === 'kulah') ? () => ses.kitir() : undefined;
    await m.tat(lokma, pembe, efekt_, { kemir });
    if (kapandi) return;
    if (kemir) {
      m.soz(etiketsiz(musteriSozu('bidik', 'bayildi') ?? 'Hıp! Pardon!'));
      surpriz('bidik');
    }
    // tepki (V3 §2.3): bayıldı / mmm / komik; sevinç efektleri başın üstünde açılır, yüz hep açıkta
    const [hx, hy] = m.basUstu(efekt_, 14 * birim());
    const sozu = (ne: 'bayildi' | 'komik') => (m.tanim?.ses ? musteriSozu(m.ad, ne) : null);
    const balonSoz = (l: readonly string[]) => l[m.sip.no % l.length];
    if (tepki === 'bayildi') {
      mutlu++;
      efekt.dogru();
      efekt_.konfeti(hx, hy, 20, 0);
      efekt_.kalpler(hx, hy, 7);
      efekt_.buyukKalp(...m.basUstu(efekt_, 40 * birim()));
      salla(m.el, 'ko-cok-mutlu');
      m.bayildi(2200);
      const lk = lokumSesi(m.ad, 'bayildi');
      if (lk) void soyle(lk, 'musteri', false);
      if (!kemir) m.soz(etiketsiz(sozu('bayildi') ?? (m.ad === 'ordek' && verilen.some((d) => d.toplar.includes('limon')) ? K.balon.ordek : balonSoz(K.balon.bayildi))));
      void soyle(K.mino.tepki.bayildi, 'mino', false);
    } else if (tepki === 'mmm') {
      mutlu++;
      efekt.dogru();
      efekt_.kalpler(hx, hy, 3);
      m.mutlu(1400);
      m.ezEsnet();
      void m.anaKisi.oynat('var', 500);
      if (!kemir) m.soz(balonSoz(K.balon.mmm));
      void soyle(K.mino.tepki.mmm, 'mino', false);
    } else {
      // sevmediği varsa onun gag'ı; yoksa "farklı" (şaşkın, titreme, "!")
      const sevmedi = !!m.tanim?.sevmez && verilen.some((d) => m.tanim!.sevmez!(d));
      if (sonuc && !sonuc.ayni) m.karsilastir(sonuc.farklar);
      efekt_.yazi(hx, hy, '!');
      if (!kemir) m.soz(etiketsiz(sozu('komik') ?? balonSoz(K.balon.komik)));
      await m.komik(sevmedi ? m.tanim?.gag : undefined);
      if (kapandi) return;
      efekt_.kalpler(hx, hy, 2);
      void soyle(yalnizKapFarkli(m.sip, verilen) ? K.mino.tepki.kase : K.mino.tepki.komik, 'mino', false);
    }
    hedefCiz(tepki !== 'komik');
    m.el.dataset.sonuc = tepki;
    // ödeme: top sayısı kadar jeton (bayıldıysa +1 bahşiş), yuvanın önüne iner; çocuk dokundukça Mino sayar
    const jeton = jetonBirak(s, m, odeme(verilen, tepki, yas));
    await atlanabilir(s, Promise.all([tepki === 'komik' ? Promise.resolve() : m.dans(), cakYap(s, m)]));
    if (kapandi) return;
    // Tombi dondurmayı bitirince külahı da ister (gizli sürpriz §8.7)
    if (m.ad === 'tombi') await tombiKulah(m);
    clearInterval(balonIzle);
    const gidis = m.git();
    await jeton;
    if (kapandi) return;
    // son müşteri ödedi: gün hemen kaydedilir ("Bugünlük bu kadar!"da çıkılsa da gün biter)
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
    slotlar.forEach(yuvaCiz);
    if (biten === 2 && gun === 2) minoGecsin();
    // kaçan balon: her müşteriden sonra %20 (gizli sürpriz §8.4)
    if (biten < TOPLAM && (rastgele() < 0.2 || (TEST_MODU && q.get('balon') === '1'))) kacanBalon();
    if (biten >= TOPLAM) void gunBitti();
    else if (kuyruk.length) sonra(TEST_MODU ? 50 : 500, () => void musteriGelsin(s));
    else {
      // sıra bitti: öbür yuvadaki müşteri etkin
      const o = slotlar[1 - s.i];
      if (o.musteri && !o.musteri.bitti) aktifSec(o.i);
    }
    adimGuncelle();
  }

  /** Tombi boş külaha bakar: külaha dokunulursa Kino bir külah daha uzatır; rafta yoksa Tombi omuz silker */
  async function tombiKulah(m: Musteri) {
    const [x, y] = m.basUstu(efekt_, 20 * birim());
    const b = h('button.ko-tombi-kulah', { type: 'button', 'aria-label': 'Külah', html: gorsel('kulah'), style: `left:${(x + 30 * birim()).toFixed(1)}px;top:${(y + 10 * birim()).toFixed(1)}px` });
    efekt_.el.append(b);
    m.soz(K.balon.tombi_kulah);
    const alindi = await new Promise<boolean>((coz) => {
      const z = window.setTimeout(() => coz(false), TEST_MODU ? 1500 : 3200);
      b.addEventListener(
        'click',
        () => {
          clearTimeout(z);
          coz(true);
        },
        { once: true },
      );
    });
    b.remove();
    if (!alindi || kapandi) return;
    surpriz('tombi');
    if (kulahVarMi(kulahStok) && kulahDugme) {
      kulahAlindi();
      await efekt_.ucur(h('div.ko-ucan-parca', { html: gorsel('kulah'), style: `width:${(30 * birim()).toFixed(0)}px` }), efekt_.merkez(kulahDugme), [x, y], { ms: 420, kavis: -80 });
      if (kapandi) return;
      ses.kitir();
      m.bayildi(1200);
      m.soz(etiketsiz(musteriSozu('tombi', 'bayildi') ?? 'Mmm!'));
      await bekle(700);
    } else {
      m.saskin(600);
      void kino.oynat('hayir', 600);
      await bekle(600);
    }
  }

  /** Kaçan balon pencerenin önünden süzülür; dokunulursa bir müşterinin kafasına "bop" diye çarpar ve sekip uçar */
  function kacanBalon() {
    if (kapandi || !adres('kacan-balon')) return;
    const b = h('button.ko-kacan-balon', { type: 'button', 'aria-label': 'Balon', html: gorsel('kacan-balon') });
    pencere.append(b);
    const a = b.animate([{ transform: 'translate(-30%, 10%)' }, { transform: 'translate(380%, -10%)', offset: 0.5 }, { transform: 'translate(800%, 5%)' }], { duration: TEST_MODU ? 4000 : 7000, easing: 'linear' });
    a.finished.then(
      () => b.remove(),
      () => b.remove(),
    );
    b.addEventListener(
      'click',
      () => {
        a.pause();
        surpriz('balon');
        const m = slotlar.map((s) => s.musteri).find((x) => x && !x.bitti);
        const r = b.getBoundingClientRect();
        const kk = efekt_.kutu();
        const bas: [number, number] = [r.left + r.width / 2 - kk.left, r.top + r.height / 2 - kk.top];
        b.remove();
        const hedef: [number, number] = m ? m.basUstu(efekt_, 8 * birim()) : [bas[0], -40];
        void efekt_.ucur(h('div.ko-ucan-balon', { html: gorsel('kacan-balon') }), bas, hedef, { ms: 380, kavis: -40 }).then(() => {
          if (kapandi) return;
          ses.bop();
          if (m) {
            m.saskin(500);
            window.setTimeout(() => !kapandi && m.mutlu(900), 520);
          }
          void efekt_.ucur(h('div.ko-ucan-balon', { html: gorsel('kacan-balon') }), hedef, [hedef[0] + 140, -60], { ms: 700, kavis: -90 });
        });
      },
      { once: true },
    );
  }

  /** Kino üç jetonla hokkabazlık yapar, jetonlar kavanoza geri düşer (kumbaraya 5 hızlı dokunuş) */
  async function hokkabaz() {
    surpriz('kumbara');
    const [kx, ky] = efekt_.merkez(kino.el, 0.5, 0.05);
    void kino.oynat('sevin', 1400);
    const jetonlar = [0, 1, 2].map((i) => {
      const j = h('i.ko-hokkabaz-jeton', { style: `left:${kx.toFixed(0)}px;top:${ky.toFixed(0)}px;--i:${i}`, html: gorsel('jeton') });
      efekt_.el.append(j);
      return j;
    });
    await bekle(TEST_MODU ? 50 : 1500);
    jetonlar.forEach((j, i) => {
      const r = j.getBoundingClientRect();
      const kk = efekt_.kutu();
      j.remove();
      void efekt_.ucur(h('div.ko-ucan-jeton', { html: gorsel('jeton') }), [r.left + r.width / 2 - kk.left, r.top + r.height / 2 - kk.top], efekt_.merkez(kumbara, 0.5, 0.3), { ms: 420, gecikme: i * 100, kavis: -60, boy1: 0.6 }).then(() => !kapandi && ses.singir(i));
    });
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
    // Kino müşterinin YANINA hoplar, yüzünün önüne geçmez: başı (kulaklar, şapka) ile müşterinin yüzü arasındaki boşluk
    // ölçülür; Kino ve müşterinin birbirine eğilmesi bu boşluğu aşmaz (boşluk yoksa Kino biraz geri çekilir)
    const yuz = m.yuz().yuz;
    const kinoBas = birlesim(['kafa', 'kulak-sol', 'kulak-sag', 'kopuk-sac'].map((id) => kino.parcaG(id)?.getBoundingClientRect()));
    const yerK = kinoYer.getBoundingClientRect();
    const yolK = m.el.getBoundingClientRect();
    let kinoKay = 0.12 * yerK.width;
    let musteriKay = 0.09 * yolK.width;
    if (yuz && kinoBas) {
      // pay: müşteri sevinçle hoplarken yüzü biraz kayar
      const pay = 8 * birim() + (yuz.right - yuz.left) * 0.08;
      const bosluk = cakYon < 0 ? kinoBas.left - yuz.right : yuz.left - kinoBas.right;
      // eğilmenin payı: Kino 5° (başı müşteriye doğru), müşteri 4° (yüzün merkezin üstündeki kısmı Kino'ya doğru)
      const kinoEgim = Math.sin((5 * Math.PI) / 180) * Math.max(0, yerK.top + yerK.height / 2 - kinoBas.top);
      const musteriEgim = Math.sin((4 * Math.PI) / 180) * Math.max(0, yolK.top + yolK.height / 2 - yuz.top);
      const kalan = bosluk - pay - kinoEgim - musteriEgim;
      kinoKay = Math.max(-0.1 * yerK.width, Math.min(kinoKay, kalan > 0 ? kalan * 0.65 : kalan));
      musteriKay = Math.max(0, Math.min(musteriKay, kalan - kinoKay));
    }
    kinoYer.style.setProperty('--cak-x', `${(cakYon * kinoKay).toFixed(1)}px`);
    m.el.style.setProperty('--cak-m', `${(-cakYon * musteriKay).toFixed(1)}px`);
    kinoYer.classList.add(sinif);
    m.el.classList.add('ko-cak');
    await bekle(330);
    if (kapandi) return;
    const k = kino.el.getBoundingClientRect();
    const kk = efekt_.kutu();
    // patiler buluşur: yıldız Kino ile müşterinin arasında, iki yüzün de üstünde (hiçbir yüzün önüne düşmez)
    const kafa = kino.parcaG('kafa')?.getBoundingClientRect();
    if (k.width) {
      const boy = 0.7;
      const r = 64 * boy * 0.75 * birim();
      const musYuz = m.yuz().yuz;
      const kinoYuz = yuzKutulari(kinoYer).yuz;
      const kinoKenar = kafa?.width ? (cakYon < 0 ? kafa.left : kafa.right) : cakYon < 0 ? k.left + k.width * 0.2 : k.right - k.width * 0.2;
      const x = musYuz ? (kinoKenar + (cakYon < 0 ? musYuz.right : musYuz.left)) / 2 : kinoKenar;
      const ust = Math.min(musYuz?.top ?? 1e9, kinoYuz?.top ?? 1e9, kafa?.height ? kafa.top + kafa.height * 0.4 : k.top + k.height * 0.2);
      const y = Math.max(kk.top + r * 0.7, ust - r);
      efekt_.cak(x - kk.left, y - kk.top, boy);
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

  // ---------------------------------------------------------------- sıradaki iş ve geç ipucu (V3 §7)
  /** Hangi yuva çalışılmalı: etkin yuvada bekleyen müşteri varsa o, yoksa öbürü */
  function calisilacak(): Slot | null {
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
  /**
   * Sıradaki iş (test ve geç ipucu; ekranda hemen görünmez): .ko-sirada yalnız işarettir, parlama 30 sn'de (.ko-parla).
   * Külah istenip rafta yoksa sıradaki iş külah makinesidir (ya da kâse: çocuk seçer).
   */
  function siradakiAdim(): { ad: AdimAdi; el: HTMLElement } | null {
    if (!calisiyor) return null;
    const s = calisilacak();
    if (!s?.musteri) return null;
    // etkin yuvanın müşterisi gitmiş ama içinde dondurma varsa: o dondurma bekleyen müşteriye tamamlanıp verilir
    const ak = slotlar[aktif];
    const kaynak = s.i !== aktif && ak.yuva.kaplar.length ? ak : s;
    if (kaynak.i !== aktif) return { ad: 'yuva', el: s.yuvaEl };
    // uçmakta olan top varken kule işi sayılmaz (top inince yeniden bakılır)
    const is = yuvaIsi(s.musteri.sip, kaynak.yuva);
    if (is.tur === 'ye' && kaynak.ucan.some((u) => u.size)) return null;
    if (is.tur === 'kap' && is.kap === 'kulah' && !kulahVarMi(kulahStok)) return panel ? null : { ad: 'makine', el: kose.el };
    const r = isEl(kaynak, is);
    return r.el ? { ad: r.ad, el: r.el } : null;
  }
  let parlayan: HTMLElement | null = null;
  let adimAdi: AdimAdi | null = null;
  function adimGuncelle() {
    const a = siradakiAdim();
    adimAdi = a?.ad ?? null;
    if (a?.el !== parlayan) {
      parlayan?.classList.remove('ko-sirada', 'ko-parla');
      parlayan = a?.el ?? null;
      parlayan?.classList.add('ko-sirada');
      elIpucuGizle();
    }
    el.dataset.adim = adimAdi ?? '';
    durumYaz();
  }
  let elGoster = false;
  function elIpucuGizle() {
    if (!elGoster) return;
    elGoster = false;
    elIpucu.classList.remove('ko-goster');
  }
  /** 40 sn: minik el (top, sos, süs için kaptan yuvaya sürükler; dokunmak da olur) */
  function elIpucuGoster() {
    if (elGoster || !parlayan || panel) return;
    const k = el.getBoundingClientRect();
    const r = parlayan.getBoundingClientRect();
    const x = r.left - k.left + r.width / 2;
    const y = r.top - k.top + r.height * 0.55;
    elIpucu.style.setProperty('--x', `${x.toFixed(0)}px`);
    elIpucu.style.setProperty('--y', `${y.toFixed(0)}px`);
    const s = calisilacak();
    const surukle = !!s && (adimAdi === 'top' || adimAdi === 'sos' || adimAdi === 'sus');
    elIpucu.classList.toggle('ko-surukle', surukle);
    if (surukle && s) {
      const y_ = s.yuvaEl.getBoundingClientRect();
      elIpucu.style.setProperty('--dx', `${(y_.left - k.left + y_.width / 2 - x).toFixed(0)}px`);
      elIpucu.style.setProperty('--dy', `${(y_.top - k.top + y_.height * 0.45 - y).toFixed(0)}px`);
    }
    elIpucu.classList.add('ko-goster');
    elGoster = true;
  }
  /** Merdivenin hangi basamağı çalıştı (son dokunuşla sıfırlanır) */
  let merdiven = { bas: -1, bak: false, anlat: false, parla: false, el: false };
  /**
   * İpucu merdiveni (her 250 ms): son dokunuştan beri geçen süreye göre. Külah istenip rafta yoksa müşteri 12 sn'de
   * makineye bakar, makine 20 sn'de parlar.
   */
  function ipucuMerdiveni(simdi: number) {
    if (merdiven.bas !== sonDokunus) {
      merdiven = { bas: sonDokunus, bak: false, anlat: false, parla: false, el: false };
      parlayan?.classList.remove('ko-parla');
      kose.isVar(false);
      elIpucuGizle();
    }
    const s = calisilacak();
    const m = s?.musteri;
    if (!m || !m.hazir || m.bitti || !parlayan || panel) return;
    // test: ?ipucu=1 ile merdiven 10 kat hızlı (bekleme olmadan denetlenir)
    const gecen = (simdi - sonDokunus) * (TEST_MODU ? (q.get('ipucu') === '1' ? 10 : 0) : 1);
    const makine = adimAdi === 'makine';
    if (gecen >= (makine ? KULAH_BAK_MS : IPUCU.bak) && !merdiven.bak) {
      merdiven.bak = true;
      m.bak(parlayan);
    }
    if (gecen >= IPUCU.anlat && !merdiven.anlat && bekleyenSoz === 0) {
      merdiven.anlat = true;
      void istekSoyle(m, true);
    }
    if (gecen >= (makine ? KULAH_PARLA_MS : IPUCU.parla) && !merdiven.parla) {
      merdiven.parla = true;
      parlayan.classList.add('ko-parla');
      if (makine) kose.isVar(true);
    }
    if (gecen >= IPUCU.el && !merdiven.el) {
      merdiven.el = true;
      elIpucuGoster();
    }
  }

  // ---------------------------------------------------------------- zaman (yalnız ipucu ve müşteri gelişi; istasyonlarda süre yok)
  let gizli = false;
  const gorunurluk = () => (gizli = document.hidden);
  document.addEventListener('visibilitychange', gorunurluk);
  const arkaBirak = arkaPlanDinle((arkada) => (gizli = arkada || document.hidden));
  const tikZaman = window.setInterval(() => {
    if (kapandi || !calisiyor || gizli) return;
    const simdi = performance.now();
    adimGuncelle();
    ipucuMerdiveni(simdi);
    // jetonlara 12 sn dokunulmazsa kumbara hafifçe sallanır (dolaylı; bir kez)
    for (const s of slotlar)
      if (s.jeton && s.jetonZaman && simdi - s.jetonZaman > JETON_SALLA_MS) {
        s.jetonZaman = 0;
        salla(kumbara, 'ko-hafif-salla');
      }
  }, 250);
  /** gizli sürpriz bulundu (test: el.dataset.surprizler) */
  const bulunan = new Set<string>();
  function surpriz(ad: string) {
    bulunan.add(ad);
    if (ozel) el.dataset.surprizler = [...bulunan].join(' ');
  }
  function durumYaz() {
    if (ozel) el.dataset.durum = JSON.stringify({ biten, mutlu, bugun, kuyruk: kuyruk.length, aktif, adim: adimAdi, toplam: TOPLAM, jeton: slotlar.map((s) => s.jeton), kulah: kulahStok, kacSoruldu });
  }

  // ---------------------------------------------------------------- günün sonu (V3 §1.8)
  let odenen = 0;
  let kaydedildi = false;
  /** Gün bitti (bir sonraki gün açılır), bugünkü "yeni" tüketildi; bir kez */
  function gunuKaydet() {
    if (kaydedildi) return;
    kaydedildi = true;
    kayitGunBitti(kayit, gun, mutlu);
    if (kayit.yeni && plan.some((s) => s.ipucu?.ozellik === 'yeni' || s.istek.some((d) => (kayit.yeni?.tat && d.toplar.includes(kayit.yeni.tat)) || (kayit.yeni?.sus && d.susler[kayit.yeni.sus])))) kayit.yeni = null;
    kaydet();
  }
  async function gunBitti() {
    gunuKaydet();
    calisiyor = false;
    adimGuncelle();
    // dokunulmayan jetonlar sayılmadan "şıngır" diye kumbaraya kayar
    await Promise.all(slotlar.map((s) => kalanJetonlar(s)));
    if (kapandi) return;
    await bekle(400);
    // kumbara dolmadıysa Kino kendi cebinden bir avuç atar: her gün ödül var
    if (bugun < HEDEF_JETON) {
      void soyle(K.kino.benden, 'kino');
      void kino.oynat('sevin', 900);
      const bas = efekt_.merkez(kino.el, 0.6, 0.5);
      const eksik = HEDEF_JETON - bugun;
      await Promise.all(Array.from({ length: Math.min(eksik, 6) }, (_, i) => new Promise<void>((coz) => window.setTimeout(() => void jetonUcur(bas, i).then(coz), i * 90))));
      bugun = Math.max(bugun, HEDEF_JETON);
      kumbaraGuncelle();
    }
    if (kapandi) return;
    salla(kumbara, 'ko-cok-zipla');
    await soyle(K.mino.odul.doldu);
    await bekle(300);
    if (!kapandi) app.git('odul', { gun, mutlu, kaydedildi: true });
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
  // durağan müşterilerin resimleri de önceden çözülür
  for (const ad of iskeletler) {
    const r = duraganResim(ad);
    if (r) urls.push(r.url);
  }
  if (adres('kacan-balon')) urls.push(adres('kacan-balon')!);
  const yuk = onYukle(urls, iskeletler, TEST_MODU ? 3000 : 8000);
  el.classList.add('ko-yukleniyor');
  const baslat = () => {
    el.classList.remove('ko-yukleniyor');
    calisiyor = true;
    sonDokunus = performance.now();
    olc();
    void musteriGelsin(slotlar[0]);
    // ikinci müşteri hemen ardından (ilk oynayışta Mino'ya verilince: Mino anlatırken tezgâh sakin)
    const ikinci = () => {
      if (kapandi) return;
      if (plan[0]?.ogretici && slotlar[0].musteri?.sip.ogretici && !slotlar[0].musteri.bitti) {
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
      set kulahStok(n: number) {
        kulahStok = n;
        kulahCiz();
      },
      plan,
      /** test: jeton sırası (yuva) */
      jetonSay: (i: number) => jetonSay(slotlar[i]),
      /** test: kaçan balonu hemen çıkarır */
      kacanBalon,
      /** test: son dokunuşu geriye alır (ipucu merdiveni) */
      dokunusGeri: (ms: number) => (sonDokunus -= ms),
      get sonDokunus() {
        return sonDokunus;
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
  const otobus = otobusEl({ alinan: kayit.acilan.gorunum, boya: kayit.boya, sinif: 'ko-giris-otobus' });
  const kino = dondurmaciKino(kayit.acilan.gorunum.includes('kino-sapka'));
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
      .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-in', fill: 'forwards' })
      .finished.catch(() => undefined);
    if (!kapandi) gec();
  })();
  return { kapat };
}

