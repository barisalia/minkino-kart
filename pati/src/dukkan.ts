/**
 * Pati Dükkânı v2 · ana ekran ("Benim Pati Dükkânım", ekip/senaryo/PATI-V2.md). Paket 1: vitrin + salon.
 * Paket 2: dükkânın bölümleri (yatay kaydırma, kapalı köşelerin perdesi), Bakım Odası, ihtiyaç saati ve yardım
 * merdiveni, Hayvan Defteri, lamba ipi ve günün kapanışı (polaroid, pano).
 *
 *  yaş   : iki büyük düğme (3-4, 5-6); dokunuş sesi de açar
 *  açılış: İLK KEZ (~12 sn): ışıklar sönük; Nehir abla gelir, "Bu dükkân artık senin!", kapı zili çalar, ışıklar yanar,
 *          yavrular sırayla bölmelerine hoplar; Nehir ilk jetonları kumbaraya atar ("İşte ilk jetonların!").
 *          SONRAKİLER (~4 sn): ışık, "Hoş geldin!", hayvanlar zıplar. Hayvanı olan çocuk salonda açar.
 *  şerit : VİTRİN · SALON · kapalı köşeler (perde; arkasında o köşenin hayvanının gölgesi ve sesi). Parmakla yatay
 *          kaydırılır (büyütme yok, kayma var); ekranın kenarında komşu bölümün ucu görünür, dokununca oraya geçilir.
 *  salon : hayvana dokununca Bakım Odası (bakim-odasi.ts). İhtiyacı olan hayvan bedeniyle gösterir.
 *  ihtiyaç saati (ihtiyac.ts): her hayvanda 20-40 sn arayla bir ihtiyaç; aynı anda en çok 2 (3-4) / 3 (5-6).
 *  yardım merdiveni: 12 sn dolaylı hareket · 25 sn 3-4 resim balonu, 5-6 Nehir beden dilini söyler · 40 sn doğru
 *          çekmecenin kulpu kıpırdar. Hiçbir şey kötüleşmez.
 *  kapanış: lamba ipi çekilince (ya da ~12 dk sonra Nehir "Hava kararıyor...", ip kıpırdar; çocuk isterse devam eder)
 *          gün batar, "Herkes uyusun."; çocuk her hayvanı uyutur (yatak çekmecesinden KENDİ seçtiği yatak); hepsi
 *          uyuyunca ip yeniden: gece, "İyi geceler, minikler!", günün fotoğrafı (polaroid) panoya asılır,
 *          "Yarın görüşürüz!". Dokununca (ya da kendiliğinden) sabah olur. Gün sonu sayımı yok.
 *
 * Test: ?test=1&yas=kucuk|buyuk (yaş sorulmadan), &sifirla=1 (kayıt silinir), &jeton=N (kumbara), &panel=salon,
 * &kendiliginden=1 (testte ihtiyaç saati çalışır), &hiz=N (saat N kat hızlı: merdiven 12/25/40 sn), &aksam=ms.
 * window.__pati: panel, jeton, kumbara, vitrin, salon, oda, ihtiyacAc, odaAc, ipCek, isik, defter …
 */
import P from '../../content/pati.json';
import { efekt as genelEfekt } from '../../src/audio/ses';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Efekt } from '../../kino-otobus/src/efekt';
import { onYukle } from '../../kino-otobus/src/yukle';
import { ezil, jetonUcur, Kumbara } from './arayuz';
import { BakimOdasi } from './bakim-odasi';
import { Defter, defterDugmesi } from './defter';
import { baslangicJetonu, koseAcik, koseGorunur } from './ekonomi';
import { gununAni, IhtiyacSaati, yardimAdimlari, type YardimAdimi } from './ihtiyac';
import { HAYVAN_IDLERI, hayvanBilgi, KOSELER, NEHIR2, type IhtiyacAdi, type KoseAdi, type Yas } from './katalog';
import { kaydet, kayit, sifirla, type SahipHayvan } from './kayit';
import { Nehir } from './nehir';
import { Salon } from './salon';
import { ses } from './sesler';
import { BAKIM_ODASI, DIS_VITRIN, hayvanAdresleri, hayvanGorseliVar, JETON, KUMBARA, NEHIR, PERDE, pozAdresi, SALON, SALON_GECE, VITRIN, adres, type Poz } from './varliklar';
import { Vitrin } from './vitrin';

type Panel = 'vitrin' | 'salon' | `kose-${KoseAdi}`;
type Isik = 'gun' | 'aksam' | 'uyutma' | 'gece';
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const NV1 = P.nehir;
/** Saat hızı (test: &hiz=N; merdiven ve ihtiyaç aralıkları N kat kısalır) */
const HIZ = TEST_MODU ? Math.max(1, Number(q.get('hiz')) || 1) : 1;
/** Testte ihtiyaç saati kendiliğinden çalışmaz (e2e kendisi açar), &kendiliginden=1 ile çalışır */
const SAAT_KENDI = !TEST_MODU || q.has('kendiliginden');
/** Bu kadar oyundan sonra Nehir "Hava kararıyor..." der (çocuk isterse devam eder) */
const AKSAM_MS = TEST_MODU && q.has('aksam') ? Number(q.get('aksam')) : 12 * 60 * 1000;
/** Kapalı köşenin perdesinin arkasındaki gölge ve ses */
const KOSE_GOLGE: Partial<Record<KoseAdi, string>> = { kemirgen: 'kadro-a-fistik', akvaryum: 'kadro-b-piril', kus: 'kadro-b-limon', surungen: 'kadro-b-tospik' };

export function dukkanEkrani(app: Uygulama): Ekran {
  let kapandi = false;
  let panel: Panel = 'vitrin';
  let acilisSuruyor = false;
  let isik: Isik = 'gun';
  const yas = (): Yas => kayit.yas ?? 'kucuk';
  const zamanlar: number[] = [];

  if (TEST_MODU && q.has('sifirla')) sifirla();
  if (TEST_MODU && q.has('jeton')) {
    kayit.jeton = Math.max(0, Number(q.get('jeton')) || 0);
    kayit.acildi = true;
    kaydet();
  }

  const el = h('div.pt-ekran.pt-v2', { 'data-panel': panel, 'data-isik': 'gun' });
  const efekt = new Efekt(el);
  const nehir = new Nehir();
  const kumbara = new Kumbara(yas);
  kumbara.ayarla(kayit.jeton);
  const saatBas = performance.now();
  const simdi = () => (performance.now() - saatBas) * HIZ;
  const saat = new IhtiyacSaati();
  saat.durdu = !SAAT_KENDI;
  /** günün anları (polaroid) */
  const anlar: Record<string, number> = {};
  const an = (ad: string) => (anlar[ad] = (anlar[ad] ?? 0) + 1);
  /** akşam uyuyan hayvanlar */
  const uyuyan = new Set<string>();
  let sonEtkilesim = performance.now();
  const etkilesim = () => (sonEtkilesim = performance.now());

  const ortak = { efekt, nehir, kumbara, kayit, kaydet, yas };
  const salon = new Salon({
    ...ortak,
    etkilesim,
    hayvanSecildi: (s) => {
      if (acilisSuruyor || isik === 'gece') return false;
      odaAc(s);
      return true;
    },
    ipCek: () => ipCekildi(),
    uyuyor: (id) => uyuyan.has(id),
  });
  const vitrin = new Vitrin({
    ...ortak,
    alindi: (s: SahipHayvan) => void yeniHayvan(s),
  });
  const defter = new Defter({ ...ortak, etkilesim });
  const oda = new BakimOdasi({
    ...ortak,
    saat,
    simdi,
    cik: () => odaKapa(),
    degisti: (s) => {
      salon.hayvanDurumu(s.id);
      if (s === oda.sahip) oda.halGuncelle();
    },
    an,
    aksam: () => isik === 'uyutma',
    uyudu: (s) => uyudu(s),
    etkilesim,
    kesif: (id) => {
      if (!defter.uzmanKontrol(id)) return;
      const r = oda.el.getBoundingClientRect();
      efekt.konfeti(r.width * 0.3, r.height * 0.25, 26);
    },
  });

  // ---------------------------------------------------------------- şerit: vitrin, salon, kapalı köşeler
  const koseler = new Map<KoseAdi, HTMLElement>();
  function kosePaneli(k: KoseAdi): HTMLElement {
    const golge = KOSE_GOLGE[k] ? adres(KOSE_GOLGE[k]!) : null;
    const perde = PERDE ? h('img.pt-perde-resim', { src: PERDE, alt: '', draggable: 'false' }) : h('span.pt-perde-yer-tutucu', {}, h('i'), h('i'));
    const g = golge ? h('img.pt-kose-golge', { src: golge, alt: '', draggable: 'false' }) : null;
    const b = h('button.pt-perde', { type: 'button', 'data-kose': k, 'aria-label': k }, g, perde);
    b.addEventListener('click', () => {
      etkilesim();
      // perdenin arkasından o köşenin sesi; gölge zıplar (mağaza paket 3'te bu perdeden açılır)
      if (k === 'akvaryum') [0, 1, 2].forEach((i) => setTimeout(() => ses.blup(i), i * 140));
      else if (k === 'kus' || k === 'bahce') ses.cikcik(3);
      else if (k === 'kemirgen') ses.vuik(2);
      else ses.hop();
      ezil(perde, 1.2, 420);
      if (g) g.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-14%)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(480), easing: 'ease-out' });
    });
    return h('div.pt-panel.pt-kose-panel', { 'data-panel': `kose-${k}`, 'data-kose': k }, b);
  }
  const serit = h('div.pt-serit', {}, vitrin.el, salon.el);
  function paneller(): Panel[] {
    const kapali = (Object.keys(KOSELER) as KoseAdi[]).filter((k) => k !== 'salon' && !koseAcik(kayit, k) && koseGorunur(kayit, k));
    return ['vitrin', 'salon', ...kapali.map((k) => `kose-${k}` as Panel)];
  }
  function seritKur() {
    const kapali = paneller().filter((p) => p.startsWith('kose-')).map((p) => p.slice(5) as KoseAdi);
    for (const [k, p] of koseler)
      if (!kapali.includes(k)) {
        p.remove();
        koseler.delete(k);
      }
    for (const k of kapali)
      if (!koseler.has(k)) {
        const p = kosePaneli(k);
        koseler.set(k, p);
        serit.append(p);
      }
    gizliPaneller();
  }
  function gizliPaneller() {
    for (const x of serit.children) (x as HTMLElement).toggleAttribute('data-panel-gizli', (x as HTMLElement).dataset.panel !== panel);
  }

  // komşu bölümün ucu (kenar): dokununca oraya geçilir
  const kenarSol = h('button.pt-kenar', { type: 'button', 'data-yon': '-1', 'aria-label': 'Önceki' });
  const kenarSag = h('button.pt-kenar', { type: 'button', 'data-yon': '1', 'aria-label': 'Sonraki' });
  for (const k of [kenarSol, kenarSag])
    k.addEventListener('click', () => {
      genelEfekt.secim();
      const l = paneller();
      const i = l.indexOf(panel) + Number(k.dataset.yon);
      if (l[i]) void panelGit(l[i]);
    });
  function kenarGuncelle() {
    const l = paneller();
    const i = l.indexOf(panel);
    const goster = !acilisSuruyor && !oda.acik && kayit.hayvanlar.length > 0;
    for (const [k, j] of [[kenarSol, i - 1], [kenarSag, i + 1]] as [HTMLElement, number][]) {
      const p = l[j];
      k.classList.toggle('pt-gizli', !goster || !p);
      if (!p) continue;
      k.dataset.hedef = p;
      k.style.backgroundImage = p === 'vitrin' ? `url("${VITRIN}")` : p === 'salon' ? `url("${isik === 'gece' && SALON_GECE ? SALON_GECE : SALON}")` : '';
    }
  }

  // parmakla yatay kaydırma (büyütme yok): hayvana, eşyaya, düğmeye değmeyen sürükleme
  {
    let id: number | null = null;
    let x0 = 0;
    let y0 = 0;
    let dx = 0;
    let yatay = false;
    const ETKILESIMLI = 'button, .pt-yer, .pt-bolme, .pt-sepet, .pt-hayvan, .pt-adlar, .pt-tepsi';
    serit.addEventListener('pointerdown', (e) => {
      if (oda.acik || acilisSuruyor || (e.target as Element).closest(ETKILESIMLI)) return;
      id = e.pointerId;
      x0 = e.clientX;
      y0 = e.clientY;
      dx = 0;
      yatay = false;
    });
    serit.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (!yatay && Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        yatay = true;
        try {
          serit.setPointerCapture(e.pointerId);
        } catch {
          /* yok say */
        }
      }
      if (yatay) {
        const l = paneller();
        const i = l.indexOf(panel);
        // uçta lastik gibi az kayar
        const uc = (dx > 0 && i === 0) || (dx < 0 && i === l.length - 1);
        serit.style.transition = 'none';
        serit.style.transform = `translateX(calc(${-i * 100}% + ${(uc ? dx * 0.25 : dx).toFixed(0)}px))`;
      }
    });
    const son = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      if (!yatay) return;
      const l = paneller();
      const i = l.indexOf(panel);
      const W = el.clientWidth || 844;
      const j = Math.abs(dx) > Math.min(90, W * 0.18) ? i + (dx < 0 ? 1 : -1) : i;
      etkilesim();
      if (l[j] && j !== i) void panelGit(l[j], 420);
      else seritKonum(i, 260);
    };
    serit.addEventListener('pointerup', son);
    serit.addEventListener('pointercancel', son);
  }
  function seritKonum(i: number, ms: number) {
    const d = TEST_MODU ? 0 : sure(ms);
    serit.style.transition = d ? `transform ${d}ms cubic-bezier(.45,.05,.3,1)` : 'none';
    serit.style.transform = `translateX(${-i * 100}%)`;
  }

  // ---------------------------------------------------------------- üst çubuk: geri, panel düğmesi, kumbara, defter, ses
  const geri = yuvarlakDugme(IKON.geri, 'Geri', () => {
    if (defter.acik) return defter.kapa();
    if (oda.acik) return odaKapa();
    app.secenekler.cikis?.();
  });
  /** Öbür panele geçiş düğmesi: resimli (vitrin: bir cam bölme kesiti; salon: çocuğun ilk hayvanı) */
  const gecis = h('button.pt-gecis', { type: 'button', 'aria-label': 'Dükkân' }, h('span.pt-gecis-resim'));
  gecis.addEventListener('click', () => {
    genelEfekt.secim();
    void panelGit(panel === 'salon' ? 'vitrin' : 'salon');
  });
  const defterBtn = defterDugmesi(() => {
    genelEfekt.secim();
    etkilesim();
    if (defter.acik) defter.kapa();
    else defter.ac(oda.sahip?.id ?? null);
  });
  const ust = h('div.pt-ust', {}, geri, gecis, h('div.pt-ust-bosluk'), kumbara.el, defterBtn, sesDugmesi());
  el.append(serit, kenarSol, kenarSag, oda.el, nehir.el, defter.el, ust, efekt.el);

  function geriGuncelle() {
    geri.classList.toggle('pt-gizli', !app.secenekler.cikis && !oda.acik && !defter.acik);
  }
  function gecisGuncelle() {
    const sahip = kayit.hayvanlar[0];
    const goster = !!sahip && !acilisSuruyor && !oda.acik;
    gecis.classList.toggle('pt-gizli', !goster);
    defterBtn.classList.toggle('pt-gizli', !sahip || acilisSuruyor);
    gecis.dataset.hedef = panel === 'salon' ? 'vitrin' : 'salon';
    const r = gecis.querySelector('.pt-gecis-resim') as HTMLElement;
    if (panel !== 'salon' && sahip) {
      r.style.cssText = `background-image:url("${pozAdresi(sahip.id, 'bos').url}")`;
      r.dataset.tur = 'hayvan';
    } else {
      r.style.cssText = `background-image:url("${VITRIN}")`;
      r.dataset.tur = 'vitrin';
    }
    geriGuncelle();
    kenarGuncelle();
  }

  // ---------------------------------------------------------------- paneller
  async function panelGit(p: Panel, ms = 650) {
    if (p === panel) return;
    if (panel === 'salon') salon.jetonlariTopla();
    salon.adlariKapat();
    panel = p;
    el.dataset.panel = p;
    const i = paneller().indexOf(p);
    const d = TEST_MODU ? 0 : sure(ms);
    seritKonum(i, ms);
    gizliPaneller();
    if (p === 'vitrin') vitrin.yenile();
    if (p === 'salon') salon.yerlesimYenile();
    gecisGuncelle();
    await bekle(d);
  }

  async function yeniHayvan(s: SahipHayvan) {
    await bekle(500);
    await panelGit('salon', 800);
    await salon.yeniGeldi(s);
    seritKur();
    gecisGuncelle();
  }

  // ---------------------------------------------------------------- Bakım Odası
  function odaAc(s: SahipHayvan) {
    etkilesim();
    if (panel !== 'salon') void panelGit('salon', 0);
    salon.jetonlariTopla();
    oda.ac(s, isik === 'uyutma' ? 'yatak' : undefined);
    el.classList.add('pt-odada');
    gecisGuncelle();
    // 40 sn'yi geçmiş ihtiyaç: kulp hemen bir kez kıpırdar (salonda görünmüyordu)
    const t0 = saat.acilisZamani(s.id);
    if (s.ihtiyac && t0 !== null && simdi() - t0 >= 40000) window.setTimeout(() => oda.sahip === s && oda.kulpKipirdat(), sure(1400));
    if (s.ihtiyac && t0 !== null) oda.balonGuncelle(yardimAdimlari(simdi() - t0, yas()).includes('balon'));
  }
  function odaKapa() {
    if (!oda.acik) return;
    oda.kapa();
    el.classList.remove('pt-odada');
    salon.hepsiniYenile();
    salon.yerlesimYenile();
    gecisGuncelle();
  }

  // ---------------------------------------------------------------- ihtiyaç saati ve yardım merdiveni
  /** her ihtiyacın verilmiş adımları (anahtar: hayvan:açılış) */
  const verilen = new Map<string, Set<YardimAdimi>>();
  /** dolaylı hareketin kaç kez yinelendiği */
  const tekrar = new Map<string, number>();
  const salonGorunur = () => panel === 'salon' && !oda.acik && !defter.acik;
  function tik() {
    if (kapandi || acilisSuruyor || !kayit.acildi) return;
    const t = simdi();
    const yeni = saat.tik(t, kayit.hayvanlar, { yas: yas(), temizlik: kayit.esyalar.includes('temizlik'), hayvanSayisi: kayit.hayvanlar.length }, (id) => hayvanBilgi(id).ihtiyaclar, Date.now());
    for (const y of yeni) {
      kaydet();
      salon.hayvanDurumu(y.id);
      if (oda.sahip?.id === y.id) oda.halGuncelle();
      if (salonGorunur()) salon.hayvanSesi(y.id);
    }
    oda.cagriGuncelle();
    // yardım merdiveni: her adım bir kez, hayvan görünürken
    for (const s of kayit.hayvanlar) {
      if (!s.ihtiyac) continue;
      const t0 = saat.acilisZamani(s.id);
      if (t0 === null) continue;
      const anahtar = `${s.id}:${t0}`;
      const v = verilen.get(anahtar) ?? new Set();
      verilen.set(anahtar, v);
      const odada = oda.acik && oda.sahip === s;
      const gorunur = odada || salonGorunur();
      if (!gorunur || uyuyan.has(s.id) || isik === 'uyutma') continue;
      const gecen = t - t0;
      for (const a of yardimAdimlari(gecen, yas())) {
        if (v.has(a)) continue;
        v.add(a);
        yardimGoster(s, a, odada);
      }
      // dolaylı hareket ara sıra yinelenir (hayvan canlı; ihtiyaç beklemeye devam eder)
      const kez = Math.floor((gecen - 12000) / 18000);
      if (v.has('dolayli') && kez > (tekrar.get(anahtar) ?? 0)) {
        tekrar.set(anahtar, kez);
        if (odada) oda.yardim('dolayli');
        else salon.yardim(s.id, 'dolayli');
      }
    }
    // akşam önerisi (~12 dk)
    if (isik === 'gun' && performance.now() - saatBas > AKSAM_MS && !aksamDendi) {
      aksamDendi = true;
      void nehir.soyle(NEHIR2.hava_karariyor);
      el.dataset.isik = 'aksam';
      isik = 'aksam';
      salon.ipKipirdat();
    }
    if (isik === 'aksam' && salonGorunur() && Math.random() < 0.02) salon.ipKipirdat();
    if (isik === 'uyutma' && salonGorunur() && hepsiUyudu() && Math.random() < 0.05) salon.ipKipirdat();
  }
  function yardimGoster(s: SahipHayvan, a: YardimAdimi, odada: boolean) {
    if (a === 'soz') {
      void nehir.soyle((NEHIR2.beden as Record<IhtiyacAdi, string>)[s.ihtiyac!]);
      return;
    }
    if (odada) oda.yardim(a);
    else salon.yardim(s.id, a);
  }
  zamanlar.push(window.setInterval(tik, 400));

  // ---------------------------------------------------------------- lamba ipi, akşam, gece, polaroid
  let aksamDendi = false;
  const hepsiUyudu = () => kayit.hayvanlar.filter((x) => x.kose === 'salon').every((x) => uyuyan.has(x.id));
  function ipCekildi() {
    etkilesim();
    if (acilisSuruyor) return;
    if (isik === 'gun' || isik === 'aksam') return void uyutmaBasla();
    if (isik === 'uyutma') return void geceOlsun();
    if (isik === 'gece') return void sabah();
  }
  /** Gün batar: herkes uyusun; ihtiyaç saati durur, her hayvan uykulu */
  async function uyutmaBasla() {
    isik = 'uyutma';
    el.dataset.isik = 'aksam';
    saat.durdu = true;
    ses.ninni();
    for (const s of kayit.hayvanlar) {
      if (s.ihtiyac !== 'uykulu') saat.ac(s, 'uykulu', simdi());
      salon.hayvanDurumu(s.id);
    }
    kaydet();
    gecisGuncelle();
    if (!aksamDendi) {
      aksamDendi = true;
      await nehir.soyle(NEHIR2.hava_karariyor).catch(() => undefined);
    }
    void nehir.soyle(NV1.herkes_uyusun);
    if (!kayit.hayvanlar.length) void geceOlsun();
  }
  function uyudu(s: SahipHayvan) {
    uyuyan.add(s.id);
    odaKapa();
    salon.hayvanDurumu(s.id);
    if (hepsiUyudu()) {
      void bekle(700).then(() => {
        if (isik !== 'uyutma') return;
        void nehir.soyle(NV1.isigi_kapat);
        salon.ipKipirdat();
      });
    }
  }
  async function geceOlsun() {
    if (isik === 'gece') return;
    odaKapa();
    isik = 'gece';
    // uyumayanlar da kıvrılır (çocuğun seçimi; zorlama yok)
    for (const s of kayit.hayvanlar) uyuyan.add(s.id);
    ses.cit();
    el.dataset.isik = 'gece';
    salon.gece(true, SALON_GECE);
    salon.hepsiniYenile();
    gecisGuncelle();
    await nehir.soyle(NV1.iyi_geceler).catch(() => undefined);
    if (kapandi) return;
    await foto();
    void nehir.soyle(NV1.yarin);
    // sabah: dokununca ya da kendiliğinden
    sabahZamani = window.setTimeout(() => void sabah(), sure(9000));
  }
  let sabahZamani = 0;
  async function sabah() {
    if (isik !== 'gece') return;
    clearTimeout(sabahZamani);
    polaroid?.remove();
    polaroid = null;
    isik = 'gun';
    aksamDendi = false;
    el.dataset.isik = 'gun';
    salon.gece(false, SALON_GECE);
    uyuyan.clear();
    for (const s of kayit.hayvanlar) if (s.ihtiyac === 'uykulu') saat.kapat(s, simdi());
    saat.ertele(simdi(), 6000);
    saat.durdu = !SAAT_KENDI;
    kaydet();
    salon.hepsiniYenile();
    gecisGuncelle();
    ses.zil();
    void nehir.soyle(NV1.gunaydin);
    for (const k of Object.keys(anlar)) delete anlar[k];
  }

  /** Günün fotoğrafı: en çok tekrarlanan an polaroid olur, panoya asılır */
  let polaroid: HTMLElement | null = null;
  async function foto() {
    const ilk = kayit.hayvanlar[0];
    const enCok = gununAni(anlar) ?? (ilk ? `${ilk.id}:uyku` : null);
    if (!enCok) return;
    const [id, poz] = enCok.split(':');
    const kart = h('button.pt-polaroid2', { type: 'button', 'aria-label': 'Günün fotoğrafı', 'data-an': enCok }, h('span.pt-polaroid2-resim', {}, h('img', { src: pozAdresi(id, (poz || 'bos') as Poz).url, alt: '', draggable: 'false' })));
    polaroid = kart;
    kart.addEventListener('click', () => void sabah());
    el.append(kart);
    ses.cik();
    const flas = h('div.pt-flas');
    el.append(flas);
    if (!TEST_MODU) await flas.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 500, easing: 'ease-out' }).finished.catch(() => undefined);
    flas.remove();
    ezil(kart, 1.4, 420);
    kayit.pano = [...kayit.pano, enCok].slice(-12);
    kaydet();
    await bekle(2200);
    if (kapandi || polaroid !== kart) return;
    // panoya uçar (yatay salonda mantar pano görünür)
    const hedef = salonGorunur() ? salon.panoNoktasi() : null;
    if (hedef && !TEST_MODU) {
      const r = kart.getBoundingClientRect();
      await kart.animate([{ transform: 'translate(-50%, -50%)' }, { transform: `translate(calc(-50% + ${(hedef[0] - (r.left + r.width / 2)).toFixed(0)}px), calc(-50% + ${(hedef[1] - (r.top + r.height / 2)).toFixed(0)}px)) scale(0.2)`, opacity: 0.4 }], { duration: 700, easing: 'cubic-bezier(.4,.1,.5,1)', fill: 'forwards' }).finished.catch(() => undefined);
    }
    kart.classList.add('pt-asildi');
    salon.panoKur(kayit.pano);
  }

  // ---------------------------------------------------------------- açılış
  async function ilkAcilis() {
    acilisSuruyor = true;
    gecisGuncelle();
    el.classList.add('pt-karanlik');
    vitrin.bos = true;
    vitrin.yenile();
    await bekle(500);
    el.classList.add('pt-nehir-gel');
    await bekle(700);
    await nehir.soyle(NEHIR2.dukkan_senin).catch(() => undefined);
    // kapı zili, ışıklar yanar, yavrular gelir
    ses.zil();
    await bekle(300);
    el.classList.remove('pt-karanlik');
    await bekle(600);
    await vitrin.yavrularGelsin();
    // ilk jetonlar: Nehir abla kumbaraya atar
    const n = baslangicJetonu(yas());
    void nehir.soyle(NEHIR2.ilk_jetonlar);
    const r = nehir.el.getBoundingClientRect();
    const kaynak: [number, number] = [r.left + r.width * 0.6, r.top + r.height * 0.45];
    for (let i = 0; i < n && !kapandi; i++) {
      await jetonUcur(efekt, kaynak, kumbara.agiz(), 1, 380, 34);
      kumbara.ayarla(i + 1);
      kumbara.yut();
      ses.jeton(i);
      await bekle(n > 4 ? 80 : 150);
    }
    kayit.jeton = Math.max(kayit.jeton, n);
    kayit.acildi = true;
    kaydet();
    kumbara.ayarla(kayit.jeton);
    acilisSuruyor = false;
    gecisGuncelle();
  }

  async function donus() {
    el.classList.add('pt-nehir-gel');
    ses.zil();
    if (kayit.hayvanlar.length) await panelGit('salon', 0);
    await bekle(400);
    void nehir.soyle(NEHIR2.hos_geldin);
    if (panel === 'vitrin') await vitrin.selam();
    gecisGuncelle();
  }

  async function basla() {
    if (!kayit.acildi) await ilkAcilis();
    else await donus();
  }

  // ---------------------------------------------------------------- dükkânın önü (dis-vitrin, Gün 2 çizimi gelince)
  function disaridan(): Promise<void> {
    if (!DIS_VITRIN || kayit.acildi) return Promise.resolve();
    // dükkânın önü; kapıya (ekrana) dokununca ya da 2,5 sn sonra zil çalar, içeri girilir
    return new Promise((bitti) => {
      const dis = h('button.pt-dis', { type: 'button', 'aria-label': 'Dükkânın kapısı', style: `background-image:url("${DIS_VITRIN}")` });
      el.append(dis);
      let oldu = false;
      const gir = () => {
        if (oldu) return;
        oldu = true;
        ses.zil();
        dis.classList.add('kapan');
        window.setTimeout(() => dis.remove(), sure(700));
        bitti();
      };
      dis.addEventListener('click', gir);
      window.setTimeout(gir, sure(2500));
    });
  }

  // ---------------------------------------------------------------- yaş seçimi
  const yasDugme = (y: Yas, yazi: string, resimler: string[]) => {
    const b = h(`button.pt-yas${kayit.yas === y ? '.pt-secili' : ''}`, { type: 'button', 'data-yas': y, 'aria-label': yazi }, h('span.pt-yas-resim', {}, ...resimler.map((u) => h('img', { src: u, alt: '' }))), h('b', {}, yazi));
    b.addEventListener('click', () => {
      if (!perde.isConnected || perde.classList.contains('kapan')) return;
      genelEfekt.secim();
      kayit.yas = y;
      kaydet();
      kumbara.ayarla(kayit.jeton);
      vitrin.yenile();
      perde.classList.add('kapan');
      window.setTimeout(() => perde.remove(), 400);
      void disaridan().then(basla);
    });
    return b;
  };
  const perde = h(
    'div.pt-yas-perde',
    { role: 'dialog', 'aria-label': 'Yaş' },
    h('h1.pt-baslik', {}, P.arayuz.baslik),
    h('div.pt-yas-kutu', {}, yasDugme('kucuk', P.arayuz.yas_kucuk, [pozAdresi('findik', 'bos').url]), yasDugme('buyuk', P.arayuz.yas_buyuk, [pozAdresi('findik', 'bos').url, pozAdresi('tarcin', 'bos').url])),
  );
  seritKur();
  const yasKisayol = q.get('yas');
  if (!kayit.acildi) el.classList.add('pt-karanlik');
  if (TEST_MODU && (yasKisayol === 'kucuk' || yasKisayol === 'buyuk')) {
    kayit.yas = yasKisayol;
    kaydet();
    kumbara.ayarla(kayit.jeton);
    if (q.get('panel') === 'salon') void panelGit('salon', 0);
    void basla();
  } else el.append(perde);
  salon.panoKur(kayit.pano);

  // görseller önceden çözülür (yavrular bölmeye gelirken boş kare görünmesin)
  const yukle = onYukle([VITRIN, SALON, NEHIR, JETON, KUMBARA, ...(BAKIM_ODASI ? [BAKIM_ODASI] : []), ...HAYVAN_IDLERI.filter(hayvanGorseliVar).flatMap(hayvanAdresleri)]);
  void yukle.hazir;
  gizliPaneller();
  gecisGuncelle();

  if (TEST_MODU || document.body.dataset.onizleme) {
    (window as unknown as { __pati: unknown }).__pati = {
      panel: () => panel,
      paneller: () => paneller(),
      acilis: () => acilisSuruyor,
      jeton: () => kayit.jeton,
      kumbara: () => kumbara.jeton,
      vitrin: () => vitrin.liste,
      salon: () => salon.durum,
      dusenJeton: () => salon.dusenJeton,
      hayvanlar: () => kayit.hayvanlar.map((x) => ({ ...x })),
      kalpKazan: (id: string) => salon.kalpKazan(id, 'sever'),
      oda: () => oda.durum,
      odaAc: (id: string) => {
        const s = kayit.hayvanlar.find((x) => x.id === id);
        if (s) odaAc(s);
      },
      ihtiyacAc: (id: string, ih: IhtiyacAdi) => {
        const s = kayit.hayvanlar.find((x) => x.id === id);
        if (!s) return;
        saat.ac(s, ih, simdi());
        kaydet();
        salon.hayvanDurumu(id);
        if (oda.sahip === s) oda.halGuncelle();
      },
      defter: () => ({ ...kayit.defter }),
      defterAcik: () => defter.acik,
      isik: () => isik,
      uyuyan: () => [...uyuyan],
      pano: () => [...kayit.pano],
      ipCek: () => ipCekildi(),
      saat: () => simdi(),
      bosta: () => performance.now() - sonEtkilesim,
    };
  }

  return {
    el,
    kapat() {
      kapandi = true;
      for (const z of zamanlar) clearInterval(z);
      clearTimeout(sabahZamani);
      vitrin.kapat();
      salon.kapat();
      oda.kapat();
      defter.kapat();
      nehir.kapat();
      void yukle;
    },
  };
}
