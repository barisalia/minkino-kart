/**
 * Pati Dükkânı · "İlk Gün" dilimi: tek ekran, beş faz.
 *  yas   : karanlık salon, iki büyük yaş düğmesi (dokunuş sesi de açar)
 *  sabah : Nehir abla lambanın ipini çeker, ışık yanar, üç köşedeki hayvanlar sırayla uyanır, gerinir, zıplar
 *  gun   : salon kendi kendine yaşar; ihtiyaç açılır, hayvan bedeniyle gösterir (3-4: 3 sn sonra resimli düşünce
 *          balonu); köşeye dokununca kamera yaklaşır, bakım rafı açılır (bakim.ts). Yardım merdiveni: 5 sn bakış ve
 *          parlama, 10 sn Nehir söyler, 18 sn "Bak, böyle!", 30 sn "Birlikte bitirelim". Gün kendiliğinden akşama döner.
 *  aksam : salon turuncu, "Herkes uyusun."; her hayvana dokununca uyku pozuna kıvrılır; son iş lamba ipi
 *  foto  : günün en çok tekrarlanan anı polaroid olur, "Yarın görüşürüz!", açılışa dönülür
 *
 * Test: ?test=1 (beklemeler kısa; yardım merdiveni kapalı, &kendiliginden=1 ile açık), &yas=kucuk|buyuk (yaş
 * sorulmadan güne). window.__pati: faz, açık ihtiyaçlar, yakın çekim.
 */
import P from '../../content/pati.json';
import { efekt as genelEfekt } from '../../src/audio/ses';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Efekt } from '../../kino-otobus/src/efekt';
import { onYukle } from '../../kino-otobus/src/yukle';
import { Bakim } from './bakim';
import { Hayvan } from './hayvan';
import { adimSayisi, gerekenEsya, GunAkisi, gununAni, HAYVANLAR, ILK_BEKLEME, planKaristir, YARDIM, type EsyaAdi, type HayvanAdi, type Ihtiyac, type IhtiyacTuru, type Yas, type YardimAdimi } from './ihtiyac';
import { kaydet, kayit } from './kayit';
import { Nehir } from './nehir';
import { AKVARYUM, BALIK_BOY, KOSE, KOSE_TAKIM, Sahne, TAKIM_TABAN, kutuStil, type Alan } from './sahne';
import { ses } from './sesler';
import { adres, DUSUNCE_BALONU, esyaAdresi, hayvanAdresleri, NEHIR, pozAdresi, SALON, type Poz } from './varliklar';

const N = P.nehir;
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
/** Testte oyun saati hızlı akar (ihtiyaç aralıkları); yardım merdiveni yalnız &kendiliginden=1 ile */
const HIZ = TEST_MODU ? 40 : 1;
const YARDIM_ACIK = !TEST_MODU || q.has('kendiliginden');
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const ras = (a: number, b: number) => a + Math.random() * (b - a);

type Faz = 'yas' | 'sabah' | 'gun' | 'aksam' | 'foto';

/** Hayvanların sahnedeki yeri ve boyu (sahne birimi: salon resminin pikseli) */
function hayvanlariKur(): Record<HayvanAdi, Hayvan> {
  return {
    findik: new Hayvan({ ad: 'findik', boy: 470, x: (KOSE.findik.x0 + KOSE.findik.x1) / 2 - 20, y: 1034 }),
    tarcin: new Hayvan({ ad: 'tarcin', boy: 440, x: (KOSE.tarcin.x0 + KOSE.tarcin.x1) / 2, y: 1034 }),
    piril: new Hayvan({
      ad: 'piril',
      boy: BALIK_BOY,
      x: (AKVARYUM.x0 + AKVARYUM.x1) / 2,
      y: AKVARYUM.y0 + BALIK_BOY * 1.4,
      alan: { x0: AKVARYUM.x0 + BALIK_BOY * 0.65, x1: AKVARYUM.x1 - BALIK_BOY * 0.65, y0: AKVARYUM.y0 + BALIK_BOY + 8, y1: AKVARYUM.y1 + (BALIK_BOY < 200 ? 4 : -24) },
    }),
  };
}

/** Polaroid: an → hayvan ve poz */
const AN_POZ: Record<string, [HayvanAdi, Poz]> = {
  'findik-top': ['findik', 'sevinc'],
  'findik-mama': ['findik', 'yiyor'],
  'tarcin-kus': ['tarcin', 'atla'],
  'tarcin-minder': ['tarcin', 'rahat'],
  'piril-yem': ['piril', 'sevinc'],
};

interface AcikBilgi {
  ih: Ihtiyac;
  t0: number;
  adimlar: Set<YardimAdimi>;
  sayac: number;
  balon: HTMLElement;
}

export function patiEkrani(app: Uygulama): Ekran {
  let faz: Faz = 'yas';
  let kapandi = false;
  const zamanlar: number[] = [];
  const zaman = (fn: () => void, ms: number) => zamanlar.push(window.setTimeout(() => !kapandi && fn(), sure(ms)));

  const sahne = new Sahne();
  const hayvanlar = hayvanlariKur();
  const nehir = new Nehir();
  const el = h('div.pt-ekran', { 'data-faz': faz });
  const efekt = new Efekt(el);
  const saatBas = performance.now();
  const saat = () => (performance.now() - saatBas) * HIZ;
  let akis: GunAkisi | null = null;
  const acik = new Map<HayvanAdi, AcikBilgi>();
  const anlar: Record<string, number> = {};
  const yas = (): Yas => kayit.yas ?? 'kucuk';

  // ---------------------------------------------------------------- köşeler (dokunma) ve düşünce balonları
  for (const hy of HAYVANLAR) {
    const k = KOSE[hy];
    const kose = h('button.pt-kose', { type: 'button', 'data-kose': hy, 'aria-label': hy, style: kutuStil({ x0: k.x0, y0: k.y0 - 60, x1: k.x1, y1: k.y1 + 40 }) });
    kose.addEventListener('click', (e) => koseDokun(hy, e));
    sahne.katman.append(kose);
    (hy === 'piril' ? sahne.suIc : sahne.katman).append(hayvanlar[hy].el);
  }
  const balonKur = (hy: HayvanAdi, esya: EsyaAdi) => {
    const hv = hayvanlar[hy];
    const b = h(
      'div.pt-balon',
      { 'data-balon': hy, style: `left:${hv.evX + (hy === 'piril' ? 0 : 60)}px;top:${hy === 'piril' ? AKVARYUM.y0 - 10 : hv.evY - hv.ayar.boy - 10}px` },
      DUSUNCE_BALONU
        ? h('div.pt-balon-resim', {}, h('img.pt-balon-zemin', { src: DUSUNCE_BALONU, alt: '' }), h('img.pt-balon-esya', { src: esyaAdresi(esya), alt: '' }))
        : h('div.pt-balon-ic', {}, h('img', { src: esyaAdresi(esya), alt: '' }), h('i.pt-balon-k1'), h('i.pt-balon-k2')),
    );
    sahne.katman.append(b);
    return b;
  };

  // ---------------------------------------------------------------- bakım
  const bakim = new Bakim({
    kok: el,
    efekt,
    sahne,
    hayvanlar,
    yas,
    ihtiyac: (hy) => acik.get(hy)?.ih.tur ?? null,
    adim: (hy, esya) => adimYapildi(hy, esya),
    an: (ad) => (anlar[ad] = (anlar[ad] ?? 0) + 1),
    say: (n) => void nehir.soyle(N.sayi[Math.min(n, N.sayi.length) - 1]),
  });

  // ---------------------------------------------------------------- üst çubuk
  const geri = yuvarlakDugme(IKON.geri, 'Geri', () => {
    if (sahne.odak) yakindanCik();
    else app.secenekler.cikis?.();
  });
  const ust = h('div.pt-ust', {}, geri, h('div.pt-ust-bosluk'), sesDugmesi());

  el.append(sahne.el, nehir.el, bakim.raf, ust, efekt.el);
  // düğme ekranda: yalnız gömülüyken (cikis) ya da yakın çekimde
  const geriGuncelle = () => geri.classList.toggle('pt-gizli', !sahne.odak && !app.secenekler.cikis);
  sahne.degisti = (_s, yakin) => {
    el.classList.toggle('pt-yakin', yakin);
    el.dataset.taraf = rafTaraf(sahne.odak);
    geriGuncelle();
  };

  // ---------------------------------------------------------------- yakın çekim
  const rafTaraf = (hy: HayvanAdi | null) => (el.clientHeight > el.clientWidth ? 'alt' : hy === 'piril' ? 'sol' : 'sag');
  const alan = (): Alan => {
    const W = el.clientWidth;
    const H = el.clientHeight;
    const r = bakim.raf.getBoundingClientRect();
    if (H > W) return { sol: 0, sag: W, ust: 60, alt: H - Math.max(r.height, 150) - 10 };
    const rw = Math.max(r.width, 120);
    return sahne.odak === 'piril' ? { sol: rw, sag: W, ust: 0, alt: H } : { sol: 0, sag: W - rw, ust: 0, alt: H };
  };
  let soylenenYakin = new Set<string>();
  function yakinGit(hy: HayvanAdi) {
    if (faz !== 'gun' || sahne.odak === hy) return;
    el.dataset.taraf = rafTaraf(hy);
    bakim.ac(hy);
    sahne.odakla(hy, alan);
    parlaGuncelle();
    // ilk yaklaşmada ölçüyü söyler (iki ölçek, bir tutam)
    const a = acik.get(hy);
    if (a && !soylenenYakin.has(`${a.ih.id}`)) {
      soylenenYakin.add(`${a.ih.id}`);
      if (hy === 'findik' && a.ih.tur === 'ac') void nehir.soyle(N.iki_olcek);
      if (hy === 'piril' && a.ih.tur === 'ac' && yas() === 'buyuk') void nehir.soyle(N.bir_tutam);
    }
  }
  function yakindanCik() {
    if (!sahne.odak) return;
    bakim.kapa();
    sahne.genis();
  }
  function koseDokun(hy: HayvanAdi, e: MouseEvent) {
    const hv = hayvanlar[hy];
    const r = hv.kutu();
    const hayvanaDokundu = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
    if (faz === 'aksam') return uyut(hy);
    if (faz !== 'gun') {
      if (hayvanaDokundu) void hv.dokunuldu();
      return;
    }
    if (sahne.odak === hy) {
      if (hayvanaDokundu) void hv.dokunuldu();
      return;
    }
    genelEfekt.secim();
    yakinGit(hy);
  }

  /** Gereken eşya rafta parlar: 3-4 hep, 5-6 yardım merdiveninin "bakış" adımından sonra */
  function parlaGuncelle() {
    const hy = sahne.odak;
    const a = hy ? acik.get(hy) : undefined;
    bakim.parlat(a && (yas() === 'kucuk' || a.adimlar.has('bakis')) ? gerekenEsya(a.ih.hayvan, a.ih.tur) : null);
  }

  // ---------------------------------------------------------------- ihtiyaçlar
  function ihtiyacAc(ih: Ihtiyac) {
    const hv = hayvanlar[ih.hayvan];
    const esya = gerekenEsya(ih.hayvan, ih.tur);
    acik.set(ih.hayvan, { ih, t0: saat() / HIZ, adimlar: new Set(), sayac: 0, balon: balonKur(ih.hayvan, esya) });
    hv.halAyarla(ih.tur);
    hv.sesi(1);
    el.dataset.acik = [...acik.values()].map((a) => `${a.ih.hayvan}-${a.ih.tur}`).join(' ');
    parlaGuncelle();
  }

  function adimYapildi(hy: HayvanAdi, esya: EsyaAdi) {
    const a = acik.get(hy);
    if (!a || gerekenEsya(hy, a.ih.tur) !== esya) return;
    a.sayac++;
    if (a.sayac >= adimSayisi(esya, yas())) ihtiyacKapat(hy);
  }

  function ihtiyacKapat(hy: HayvanAdi) {
    const a = acik.get(hy);
    if (!a || !akis) return;
    acik.delete(hy);
    akis.kapat(a.ih.id, saat());
    el.dataset.acik = [...acik.values()].map((x) => `${x.ih.hayvan}-${x.ih.tur}`).join(' ');
    const b = a.balon;
    b.classList.remove('acik');
    zaman(() => b.remove(), 400);
    const hv = hayvanlar[hy];
    hv.el.classList.remove('pt-cagir');
    parlaGuncelle();
    // anında olumlu geri bildirim: kalpler, ksilofon, sevinç, Nehir'in övgüsü
    zaman(() => {
      hv.halAyarla('bos');
      const r = hv.kutu();
      const k = efekt.kutu();
      efekt.kalpler(r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.2, 6);
      efekt.parilti(r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.3, 8, 1.1, '#FFE45C');
      ses.ksilofon();
      void hv.sevin();
      void nehir.soyle(N.bayildi[hy]);
    }, hy === 'findik' && a.ih.tur === 'ac' ? 1900 : hy === 'tarcin' && a.ih.tur === 'usudu' ? 2300 : 500);
    // 3 sn sonra kamera kendiliğinden salona açılır
    zaman(() => {
      if (sahne.odak === hy && !acik.has(hy) && faz === 'gun') yakindanCik();
    }, 4200);
  }

  /** Yardım merdiveni (her tıkta açık ihtiyaçlar için) */
  async function yardim(a: AcikBilgi) {
    const gecen = saat() / HIZ - a.t0;
    const hy = a.ih.hayvan;
    const esya = gerekenEsya(hy, a.ih.tur);
    const ulasti = (ad: YardimAdimi) => gecen >= YARDIM[ad] * (TEST_MODU ? 0.02 : 1) && !a.adimlar.has(ad);
    if (ulasti('balon') && yas() === 'kucuk') {
      a.adimlar.add('balon');
      a.balon.classList.add('acik');
    }
    if (!YARDIM_ACIK) return;
    if (ulasti('bakis')) {
      a.adimlar.add('bakis');
      hayvanlar[hy].el.classList.add('pt-cagir');
      parlaGuncelle();
    }
    if (ulasti('soyle')) {
      a.adimlar.add('soyle');
      void nehir.soyle([N.ihtiyac[a.ih.tur], yas() === 'buyuk' ? N.ipucu[a.ih.tur] : null]);
    }
    if (ulasti('goster')) {
      a.adimlar.add('goster');
      if (!sahne.odak) yakinGit(hy);
      if (sahne.odak === hy) {
        await nehir.soyle(N.bak_boyle);
        if (acik.get(hy) === a) await bakim.kullan(esya, hy);
      }
    }
    if (ulasti('birlikte')) {
      a.adimlar.add('birlikte');
      if (sahne.odak !== hy) {
        if (sahne.odak) yakindanCik();
        await bekle(300);
        yakinGit(hy);
      }
      await nehir.soyle(N.birlikte);
      for (let i = 0; i < 4 && acik.get(hy) === a && !kapandi; i++) await bakim.kullan(esya, hy);
      // her durumda kapanır (gün hiç kilitlenmez)
      if (acik.get(hy) === a) ihtiyacKapat(hy);
    }
  }

  // ---------------------------------------------------------------- gün döngüsü
  let tikNo = 0;
  let bosZaman = performance.now() + 6000;
  function gunBasla() {
    faz = 'gun';
    el.dataset.faz = faz;
    akis = new GunAkisi(planKaristir(P.gun1 as [HayvanAdi, IhtiyacTuru][]), yas(), Math.random, saat(), ILK_BEKLEME);
    const tik = () => {
      if (kapandi || faz !== 'gun' || !akis) return;
      for (const ih of akis.tik(saat())) ihtiyacAc(ih);
      for (const a of acik.values()) void yardim(a);
      // kimse dokunmasa da salon yaşar: ihtiyacı olmayan biri ara sıra kendi hareketini yapar
      if (performance.now() > bosZaman) {
        bosZaman = performance.now() + ras(6000, 10000);
        const bos = HAYVANLAR.filter((x) => !acik.has(x) && x !== 'piril' && sahne.odak !== x);
        const x = bos[Math.floor(Math.random() * bos.length)];
        if (x) void (x === 'findik' ? hayvanlar[x].zipla(40, 400) : hayvanlar[x].gerin());
      }
      if (akis.bitti && !aksamBekliyor) {
        aksamBekliyor = true;
        zaman(() => void aksam(), 2600);
      }
      tikNo = window.setTimeout(tik, 200);
    };
    tik();
  }
  let aksamBekliyor = false;

  // ---------------------------------------------------------------- sabah
  async function sabah() {
    faz = 'sabah';
    el.dataset.faz = faz;
    el.classList.add('pt-nehir-gel');
    await bekle(700);
    sahne.ipCek();
    ses.cit();
    sahne.isik('gun', 700);
    await bekle(800);
    for (const hy of HAYVANLAR) {
      const hv = hayvanlar[hy];
      hv.halAyarla('bos');
      void (async () => {
        await hv.gerin();
        hv.sesi(1);
        await hv.zipla(70, 480, 'sevinc');
      })();
      await bekle(380);
    }
    await nehir.soyle(N.gunaydin);
    if (!kapandi) gunBasla();
  }

  // ---------------------------------------------------------------- akşam
  const uyuyan = new Set<HayvanAdi>();
  let ipHazir = false;
  async function aksam() {
    if (faz !== 'gun') return;
    faz = 'aksam';
    el.dataset.faz = faz;
    yakindanCik();
    sahne.isik('aksam', 2200);
    await bekle(1400);
    for (const hy of HAYVANLAR) hayvanlar[hy].halAyarla('uykulu');
    ses.ninni();
    await nehir.soyle(N.herkes_uyusun);
    // dokunulmazsa Nehir abla tek tek uyutur
    if (YARDIM_ACIK) {
      const sirayla = () => {
        const kalan = HAYVANLAR.find((x) => !uyuyan.has(x));
        if (!kalan || faz !== 'aksam') return;
        uyut(kalan);
        zaman(sirayla, 2500);
      };
      zaman(sirayla, TEST_MODU ? 300 : 9000);
    }
  }
  function uyut(hy: HayvanAdi) {
    if (faz !== 'aksam' || uyuyan.has(hy)) return;
    uyuyan.add(hy);
    const hv = hayvanlar[hy];
    hv.halAyarla('uyku');
    hv.ezil(1.3);
    ses.ninni();
    el.dataset.uyuyan = [...uyuyan].join(' ');
    if (uyuyan.size === HAYVANLAR.length) zaman(() => void ipiHazirla(), 900);
  }
  async function ipiHazirla() {
    if (ipHazir) return;
    ipHazir = true;
    sahne.ipEl.classList.add('pt-ip-parla');
    el.dataset.ip = '1';
    await nehir.soyle(N.isigi_kapat);
    if (YARDIM_ACIK) zaman(() => isikKapat(), TEST_MODU ? 300 : 10000);
  }
  let isikKapandi = false;
  function isikKapat() {
    if (!ipHazir || isikKapandi) return;
    isikKapandi = true;
    sahne.ipEl.classList.remove('pt-ip-parla');
    sahne.ipCek();
    ses.cit();
    sahne.isik('gece', 1200);
    zaman(async () => {
      await nehir.soyle(N.iyi_geceler);
      void foto();
    }, 1300);
  }
  // ipi çekmek: aşağı sürükle ya da dokun
  const ipAlan = h('button.pt-ip-alan', { type: 'button', 'aria-label': 'Lamba ipi', style: (() => { const [x0, y0, x1, y1] = [1500, 140, 1650, 360]; return `left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px`; })() });
  let ipY = 0;
  ipAlan.addEventListener('pointerdown', (e) => (ipY = e.clientY));
  ipAlan.addEventListener('pointermove', (e) => {
    if (e.buttons && e.clientY - ipY > 18) isikKapat();
  });
  ipAlan.addEventListener('click', () => isikKapat());
  sahne.katman.append(ipAlan);

  // ---------------------------------------------------------------- günün fotoğrafı
  async function foto() {
    faz = 'foto';
    el.dataset.faz = faz;
    await bekle(400);
    const an = gununAni(anlar) ?? 'tarcin-kus';
    const [hy, poz] = AN_POZ[an] ?? ['tarcin', 'atla'];
    const k = KOSE[hy];
    // fotoğraf: o köşenin gündüz hâli (salonun kesiti) ve hayvanın o anki pozu
    const genis = k.x1 - k.x0;
    // kare: köşenin sahnedeki kutusu; köşe takımı ve hayvan aynı sahne ölçüsüyle yerleşir
    const bx0 = k.x0;
    const by1 = k.y1 + 40;
    const bh = k.y1 - k.y0 + 80;
    const yuzde = (v: number, b: number) => `${((v / b) * 100).toFixed(2)}%`;
    const takimAd = { findik: KOSE_TAKIM.kopek, tarcin: KOSE_TAKIM.kedi, piril: KOSE_TAKIM.akvaryum }[hy];
    const takimUrl = adres(takimAd.ad);
    const hv = hayvanlar[hy];
    const hy_ = hy === 'piril' ? AKVARYUM.y0 + hv.ayar.boy * 1.35 : hv.evY;
    const resim = h(
      'div.pt-foto-resim',
      { style: `background-image:url("${SALON}");background-size:${(2752 / genis) * 100}% auto;background-position:${(k.x0 / (2752 - genis)) * 100}% ${((k.y0 - 40) / (1536 - bh)) * 100}%` },
      takimUrl ? h('img.pt-foto-takim', { src: takimUrl, alt: '', style: `left:${yuzde(takimAd.x - takimAd.en / 2 - bx0, genis)};width:${yuzde(takimAd.en, genis)};bottom:${yuzde(by1 - TAKIM_TABAN, bh)}` }) : null,
      h('img.pt-foto-hayvan', { src: pozAdresi(hy, poz).url, alt: '', style: `left:${yuzde(hv.evX - bx0, genis)};height:${yuzde(hv.ayar.boy, bh)};bottom:${yuzde(by1 - hy_, bh)}` }),
    );
    resim.dataset.hayvan = hy;
    const kart = h('button.pt-polaroid', { type: 'button', 'aria-label': 'Günün fotoğrafı', 'data-an': an }, resim);
    const flas = h('div.pt-flas');
    el.append(flas, kart);
    ses.cik();
    zaman(() => flas.remove(), 600);
    zaman(() => kart.classList.add('acik'), 80);
    kart.addEventListener('click', () => yeniden());
    await bekle(1600);
    await nehir.soyle(N.yarin);
    // fotoğraf ekranda kalır (testte de kısaltılmaz), sonra açılışa dönülür
    zamanlar.push(window.setTimeout(() => !kapandi && yeniden(), 3500));
  }
  let yenidenOldu = false;
  function yeniden() {
    if (yenidenOldu || kapandi) return;
    yenidenOldu = true;
    app.git('pati');
  }

  // ---------------------------------------------------------------- açılış: yaş seçimi (karanlık salon)
  sahne.isik('gece', 0);
  for (const hy of HAYVANLAR) hayvanlar[hy].halAyarla('uyku');
  const yasDugme = (y: Yas, yazi: string, resimler: string[]) => {
    const b = h(`button.pt-yas${kayit.yas === y ? '.pt-secili' : ''}`, { type: 'button', 'data-yas': y, 'aria-label': yazi }, h('span.pt-yas-resim', {}, ...resimler.map((u) => h('img', { src: u, alt: '' }))), h('b', {}, yazi));
    b.addEventListener('click', () => {
      if (faz !== 'yas') return;
      genelEfekt.secim();
      kayit.yas = y;
      kaydet();
      perde.classList.add('kapan');
      zaman(() => perde.remove(), 400);
      void sabah();
    });
    return b;
  };
  const perde = h(
    'div.pt-yas-perde',
    { role: 'dialog', 'aria-label': 'Yaş' },
    h('h1.pt-baslik', {}, P.arayuz.baslik),
    h('div.pt-yas-kutu', {}, yasDugme('kucuk', P.arayuz.yas_kucuk, [pozAdresi('findik', 'bos').url]), yasDugme('buyuk', P.arayuz.yas_buyuk, [pozAdresi('findik', 'bos').url, pozAdresi('tarcin', 'bos').url])),
  );
  const yasKisayol = q.get('yas');
  if (TEST_MODU && (yasKisayol === 'kucuk' || yasKisayol === 'buyuk')) {
    kayit.yas = yasKisayol;
    void sabah();
  } else el.append(perde);

  // görseller önceden çözülür (ilk yaklaşmada boş kare görünmesin)
  const yukle = onYukle([SALON, NEHIR, ...HAYVANLAR.flatMap(hayvanAdresleri), ...(['mama', 'top', 'kus', 'minder', 'yem'] as EsyaAdi[]).map(esyaAdresi)]);
  void yukle.hazir;
  requestAnimationFrame(() => {
    sahne.kur(0);
    geriGuncelle();
  });

  if (TEST_MODU || document.body.dataset.onizleme) {
    (window as unknown as { __pati: unknown }).__pati = {
      faz: () => faz,
      acik: () => [...acik.values()].map((a) => ({ hayvan: a.ih.hayvan, tur: a.ih.tur, esya: gerekenEsya(a.ih.hayvan, a.ih.tur), sayac: a.sayac })),
      yakin: () => sahne.odak,
      biten: () => akis?.biten.length ?? 0,
      anlar: () => ({ ...anlar }),
    };
  }

  return {
    el,
    kapat() {
      kapandi = true;
      clearTimeout(tikNo);
      for (const z of zamanlar) clearTimeout(z);
      for (const hv of Object.values(hayvanlar)) hv.kapat();
      bakim.kapat();
      nehir.kapat();
      sahne.kapat();
      void yukle;
    },
  };
}
