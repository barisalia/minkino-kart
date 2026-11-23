// Matematik · Ceren Öğretmen derslerinin ortak iskeleti (yol haritası adım 3b). Sayılar dersi (ceren-ders.ts) bunun
// üstünde çalışır; sıradaki dersler (Şekiller, Karşılaştır ve ölç, Örüntü, 11–20, Toplama) aynı parçaları kullanır:
// - DersSesi: Ceren'in kayıtları (Web Audio; olmazsa <audio>), ağız açıklığı sesi izler, çalarken / susunca haber verir.
// - cerenFiguru / cerenBagla: Ceren'in poz ve konuşma kareleri; konuşurken ağız kareleri, sessiz anlarda el hareketi.
// - DersAkisi: adım akışı (bekle, konuş, çocuğun eylemini bekle, iptal), boşta yardım, anında dokunma.
// - hareketler: zıpla, salla, uçur (hareket azaltılmışsa sessizce atlanır).
// Her ders yalnız kendi sahnesini, sözlerini (kendi ses klasörü) ve adımlarını yazar.
import { konusmaCikisi, sesMotorunuAc } from '../../src/audio/motor';
import { DUDAK, sekilDizisi, zarfCikar, type AgizSekli } from '../../src/audio/dudak-mantik';
import { durum as uygulamaDurumu } from '../../src/engine/ilerleme';
import { tepkiYay } from './a1-kareler';

export const yuzde = (v: number) => (v * 100).toFixed(3) + '%';
/** Çizim varsa resmi, yoksa (yalnız test kipinde görünür) adını yazan iskelet kutuyu verir. */
export function resimHTML(src: string | undefined, sinif: string, ad: string, ek = '', iskeletYazi = ad) {
  return src
    ? '<img class="' + sinif + '" src="' + src + '" alt="" draggable="false"' + ek + '>'
    : '<span class="' + sinif + ' cd-iskelet" data-ad="' + ad + '"' + ek + '>' + iskeletYazi + '</span>';
}

// ---------- Ceren'in sesi ----------
const ACIKLIK: Record<AgizSekli, number> = { kapali: 0, gulumse: 0, az: 1, dis: 1, orta: 2, yuvarlak: 3 };
type Klip = { buffer: AudioBuffer; agiz: number[] };
type Calma = {
  id: string; bitir: (tamam: boolean) => void; saat: number; raf: number;
  dugum?: AudioBufferSourceNode; seviye?: GainNode; medya?: HTMLAudioElement;
};
const konusmaAcik = () => (uygulamaDurumu.i.ayarlar.konusma ? 1 : 0);

export type SesSecenekleri = {
  /** e2e: kayıtlar çalınmaz, kısa bekleyişle biter. */
  hizli?: boolean;
  /** Her okunan kaydın kimliği (test kipinde okunan sıra denetlenir). */
  okundu?: (id: string) => void;
};
export class DersSesi {
  private klipler = new Map<string, Promise<Klip>>();
  private calma: Calma | undefined;
  /** Ağız açıklığı (0 kapalı … 3 en açık); dersin Ceren'i bağlar. */
  agizCiz: (aciklik: number) => void = () => {};
  /** Ceren konuşmaya başlayınca / susunca. */
  konusmaDinle: (konusuyor: boolean) => void = () => {};
  constructor(private adres: (id: string) => string | undefined, private o: SesSecenekleri = {}) {}

  /** Şu an okunan kaydın kimliği (yoksa undefined). */
  get calan(): string | undefined { return this.calma?.id; }
  varMi(id: string) { return !!this.adres(id); }

  private klipYukle(id: string, ctx: AudioContext): Promise<Klip> {
    let is = this.klipler.get(id);
    if (!is) {
      is = (async () => {
        const url = this.adres(id);
        if (!url) throw new Error('Ceren kaydı yok: ' + id);
        const yanit = await fetch(url);
        if (!yanit.ok) throw new Error('Ceren kaydı okunamadı: ' + id);
        const buffer = await ctx.decodeAudioData(await yanit.arrayBuffer());
        const zarf = zarfCikar(buffer.getChannelData(0), buffer.sampleRate);
        return { buffer, agiz: sekilDizisi(zarf, 10, { ...DUDAK, enAzMs: 88 }).map((s) => ACIKLIK[s]) };
      })();
      this.klipler.set(id, is);
      is.catch(() => this.klipler.delete(id));
    }
    return is;
  }
  private durdur(c: Calma) {
    cancelAnimationFrame(c.raf);
    clearTimeout(c.saat);
    if (c.dugum) {
      c.dugum.onended = null;
      try { c.dugum.stop(); } catch { /* başlamamış */ }
      c.dugum.disconnect();
      c.seviye?.disconnect();
    }
    if (c.medya) {
      c.medya.onended = c.medya.onerror = null;
      c.medya.pause();
    }
    c.dugum = c.seviye = c.medya = undefined;
  }
  private bitti(c: Calma) {
    if (this.calma !== c) return;
    this.calma = undefined;
    this.durdur(c);
    this.agizCiz(0);
    this.konusmaDinle(false);
    c.bitir(true);
  }
  /** Ceren susar; bekleyen okuma false ile biter. */
  sus() {
    const c = this.calma;
    if (!c) return;
    this.calma = undefined;
    this.durdur(c);
    this.agizCiz(0);
    this.konusmaDinle(false);
    c.bitir(false);
  }
  private medyaIle(c: Calma) {
    const url = this.adres(c.id);
    if (!url) { c.saat = window.setTimeout(() => this.bitti(c), 700); return; }
    const m = new Audio(url);
    m.muted = !konusmaAcik();
    m.volume = Math.max(0, Math.min(1, uygulamaDurumu.i.ayarlar.seviye));
    c.medya = m;
    m.onended = m.onerror = () => this.bitti(c);
    c.saat = window.setTimeout(() => this.bitti(c), 9000);
    void m.play().catch(() => this.bitti(c));
    const ciz = () => {
      if (this.calma !== c || c.medya !== m) return;
      this.agizCiz(m.paused ? 0 : [1, 2, 1, 3, 0][Math.floor(performance.now() / 105) % 5]);
      c.raf = requestAnimationFrame(ciz);
    };
    ciz();
  }
  private baslat(c: Calma) {
    this.konusmaDinle(true);
    if (this.o.hizli || document.hidden) { c.saat = window.setTimeout(() => this.bitti(c), this.o.hizli ? 40 : 300); return; }
    const ctx = sesMotorunuAc(), cikis = konusmaCikisi();
    if (!ctx || !cikis) { this.medyaIle(c); return; }
    // Bekçi: ses bağlamı askıda kalsa da (iOS) akış takılmaz.
    c.saat = window.setTimeout(() => this.bitti(c), 9000);
    this.klipYukle(c.id, ctx).then((klip) => {
      if (this.calma !== c) return;
      const dugum = ctx.createBufferSource(), seviye = ctx.createGain();
      seviye.gain.value = konusmaAcik();
      dugum.buffer = klip.buffer;
      dugum.connect(seviye).connect(cikis);
      c.dugum = dugum; c.seviye = seviye;
      const bas = ctx.currentTime + 0.01;
      dugum.onended = () => this.bitti(c);
      clearTimeout(c.saat);
      c.saat = window.setTimeout(() => this.bitti(c), (klip.buffer.duration + 1.5) * 1000);
      dugum.start(bas);
      const ciz = () => {
        if (this.calma !== c || c.dugum !== dugum) return;
        this.agizCiz(klip.agiz[Math.floor(Math.max(0, ctx.currentTime - bas) * 100)] ?? 0);
        c.raf = requestAnimationFrame(ciz);
      };
      ciz();
    }, () => { if (this.calma === c) { clearTimeout(c.saat); this.medyaIle(c); } });
  }
  /** Ceren'in bir kaydını okur; bitince true, başka okuma ya da susma gelirse false. */
  cal(id: string): Promise<boolean> {
    this.sus();
    this.o.okundu?.(id);
    return new Promise((coz) => {
      let tamam = false;
      const c: Calma = { id, saat: 0, raf: 0, bitir: (t) => { if (!tamam) { tamam = true; coz(t); } } };
      this.calma = c;
      this.baslat(c);
    });
  }
  /** Çalan kaydı baştan okur (bekleyen akış aynı sözü bekler). */
  bastan(): boolean {
    const c = this.calma;
    if (!c) return false;
    this.durdur(c);
    this.baslat(c);
    return true;
  }
  onYukle(ids: string[]) {
    if (this.o.hizli) return;
    const ctx = sesMotorunuAc();
    if (ctx) ids.forEach((id) => { void this.klipYukle(id, ctx).catch(() => undefined); });
  }
}

// ---------- Ceren'in görünüşü ----------
/**
 * Göz kırpma ve tepki pozları (Paket Harf-A1 Bölüm A; yönetici 23 Kasım: Matematik aynı kareleri kullanır, ikinci kez
 * çizdirilmez). Kareler assets/alfabe/ceren-tepki/ altında, konuşma kareleriyle (ceren-konus/0–3, 627 × 627) aynı tuvalde:
 * göz katmanları yalnız göz kapağını çizer ve konuşma karelerinin üstüne oturur; tepki pozları bütün busttur.
 * Kareler gelmeden hiçbir şey değişmez.
 */
const tepkiKareleri = import.meta.glob<string>('../../assets/alfabe/ceren-tepki/*.webp', { eager: true, query: '?url', import: 'default' });
const tepkiKaresi = (ad: string) => tepkiKareleri['../../assets/alfabe/ceren-tepki/' + ad + '.webp'];
export const CEREN_GOZ = ['goz-yari', 'goz-kapali'] as const;
export const CEREN_TEPKI = ['sevinc', 'sasirma', 'dusunme', 'el-salla', 'isaret', 'alkis'] as const;
export type CerenTepki = typeof CEREN_TEPKI[number];
/** Dersin istediği poz çizilmemişse Harf-A1'deki karşılığı. */
const TEPKI_KARSILIGI: Record<string, CerenTepki> = { dusun: 'dusunme', 'el-salla': 'el-salla', alkis: 'alkis', goster: 'isaret' };
/** Ceren'in düğmesi: konuşma kareleri (ağız) ve pozlar üst üste; görünen poz data-poz ile seçilir. */
export function cerenFiguru(o: {
  pozlar: readonly string[]; pozResmi: (poz: string) => string | undefined; agizKareleri: readonly string[];
  x: number; ust: number; h: number; ad?: string;
}) {
  const pozKatmanlari = o.pozlar.map((p) => resimHTML(o.pozResmi(p), 'cd-poz', 'ceren-' + p, ' data-poz="' + p + '"')).join('');
  const agizKatmanlari = o.agizKareleri.map((u, i) => '<img class="cd-agiz' + (i ? '' : ' acik') + '" src="' + u + '" alt="" draggable="false">').join('');
  // Göz katmanları yalnız konuşma kareleri varken (aynı tuval); tepki pozları dersin kendi pozu olmayanlar için.
  const gozler = o.agizKareleri.length && CEREN_GOZ.every((g) => tepkiKaresi(g))
    ? CEREN_GOZ.map((g) => '<img class="cd-goz" data-goz="' + g + '" src="' + tepkiKaresi(g) + '" alt="" draggable="false">').join('') : '';
  const tepkiler = CEREN_TEPKI.filter((t) => tepkiKaresi(t) && !(o.pozlar.includes(t) && o.pozResmi(t)))
    .map((t) => '<img class="cd-poz cd-tepki" data-poz="' + t + '" src="' + tepkiKaresi(t) + '" alt="" draggable="false">').join('');
  return '<button type="button" class="cd-ceren" data-poz="konus" aria-label="' + (o.ad ?? 'Ceren Öğretmen. Yeniden dinle') + '" style="left:' + yuzde(o.x) +
    ';top:' + yuzde(o.ust) + ';height:' + yuzde(o.h) + '">' + agizKatmanlari + gozler + pozKatmanlari + tepkiler + '</button>';
}
/**
 * Ceren'i sesine bağlar: konuşurken her zaman ağzı sesi izleyen konuşma karelerindedir; el hareketleri konuşma aralarındaki
 * sessiz anlarda görünür. Kısa sözlerde poz titremesin diye susunca 0,65 sn bekleyip harekete döner.
 */
export function cerenBagla(ceren: HTMLElement, ses: DersSesi, o: { pozVar: (poz: string) => boolean; sakin: boolean; hizli: boolean; kapandi: () => boolean }) {
  const agizlar = Array.from(ceren.querySelectorAll<HTMLElement>('.cd-agiz'));
  let dinlenme = 'konus', konusuyor = false, donus = 0, tepkiSaati = 0, kirpSaati = 0, birakildi = false;
  const tepkiVar = (p: string) => !!ceren.querySelector('.cd-tepki[data-poz="' + p + '"]');
  /** İstenen poz çizilmişse kendisi, yoksa Harf-A1'deki karşılığı, o da yoksa konuşma kareleri. */
  function cozumle(istenen: string) {
    if (istenen === 'konus' || o.pozVar(istenen) || tepkiVar(istenen)) return istenen;
    const k = TEPKI_KARSILIGI[istenen];
    return k && tepkiVar(k) ? k : agizlar.length ? 'konus' : istenen;
  }
  function gorunenPoz(istenen: string) {
    // Pozu henüz gelmemişse (yalnız test modunda olabilir) Ceren konuşma karelerinde kalır.
    const yeni = cozumle(istenen);
    if (yeni === 'konus' && !agizlar.length) return;
    if (ceren.dataset.poz === yeni) return;
    ceren.dataset.poz = yeni;
    for (const p of ceren.querySelectorAll<HTMLElement>('.cd-poz')) p.classList.toggle('gorunur', p.dataset.poz === yeni);
    if (!o.sakin && !o.hizli) ceren.animate([{ transform: 'translateY(1.2%) scale(.985)' }, { transform: 'none' }], { duration: 170, easing: 'ease-out' });
  }
  function cerenPoz(istenen: string) {
    // Ceren alkışlıyorsa doğru an: sahnedeki rakam ve nesneler de sevinir (Paket Matematik-A1 kareleri gelince).
    if (istenen === 'alkis' && dinlenme !== 'alkis') tepkiYay('dogru');
    dinlenme = istenen;
    ceren.dataset.istenen = istenen;
    clearTimeout(tepkiSaati);
    if (!konusuyor || !agizlar.length) gorunenPoz(istenen);
  }
  /** Kısa tepki (sevinç, düşünme, şaşırma…): konuşmuyorsa bir an o poz, sonra dinlenme pozuna döner. */
  function tepki(ad: CerenTepki | string, ms = 1100) {
    if (konusuyor && agizlar.length) return;
    // Çizimi yoksa hiçbir şey değişmez (konuşma karesine düşüp pozu bozmasın).
    if (!o.pozVar(ad) && !tepkiVar(ad)) return;
    clearTimeout(tepkiSaati);
    gorunenPoz(ad);
    tepkiSaati = window.setTimeout(() => { if (!konusuyor && !o.kapandi()) gorunenPoz(dinlenme); }, o.hizli ? 0 : ms);
  }
  // Yanlışta (hareketler().salla yayar) Ceren bir an düşünür; doğru anını alkış pozu zaten verir.
  const yanlisDinle = (e: Event) => { if ((e as CustomEvent).detail === 'yanlis' && !o.kapandi()) tepki('dusunme', 1200); };
  document.addEventListener('matematik-tepki', yanlisDinle);
  // Boşta canlı (KALITE-KURALLARI 7): nefes alır; göz katmanları geldiyse 2,6–5,4 sn'de bir göz kırpar.
  if (!o.sakin && !o.hizli) ceren.classList.add('cd-canli');
  const gozler = CEREN_GOZ.map((g) => ceren.querySelector<HTMLElement>('.cd-goz[data-goz="' + g + '"]'));
  if (gozler.every(Boolean) && !o.sakin && !o.hizli) {
    const [yari, kapali] = gozler as HTMLElement[];
    const goster = (y: boolean, k: boolean) => { yari.classList.toggle('acik', y); kapali.classList.toggle('acik', k); };
    const kirp = () => {
      kirpSaati = window.setTimeout(() => {
        if (birakildi || o.kapandi()) return;
        if (!document.hidden && ceren.dataset.poz === 'konus') {
          goster(true, false);
          setTimeout(() => goster(false, true), 60);
          setTimeout(() => goster(true, false), 150);
          setTimeout(() => goster(false, false), 210);
        }
        kirp();
      }, 2600 + Math.random() * 2800);
    };
    kirp();
  }
  ses.konusmaDinle = (simdi) => {
    konusuyor = simdi;
    clearTimeout(donus);
    if (!agizlar.length) return;
    if (simdi) gorunenPoz('konus');
    else donus = window.setTimeout(() => { if (!konusuyor && !o.kapandi()) gorunenPoz(dinlenme); }, o.hizli ? 0 : 650);
  };
  let sonAgiz = 0;
  ses.agizCiz = (aciklik) => {
    if (!agizlar.length || aciklik === sonAgiz) return;
    agizlar[sonAgiz]?.classList.remove('acik');
    sonAgiz = Math.max(0, Math.min(agizlar.length - 1, aciklik));
    agizlar[sonAgiz].classList.add('acik');
  };
  return {
    cerenPoz,
    tepki,
    /** Ders kapanırken: Ceren sesten ayrılır. */
    birak: () => { birakildi = true; document.removeEventListener('matematik-tepki', yanlisDinle); clearTimeout(donus); clearTimeout(tepkiSaati); clearTimeout(kirpSaati); ses.agizCiz = () => {}; ses.konusmaDinle = () => {}; },
  };
}

// ---------- Hareketler ----------
export function hareketler(sakin: boolean, hizli: boolean) {
  function zipla(el: Element | null | undefined, guc = 1) {
    if (!el || sakin) return;
    el.animate([
      { transform: 'none' }, { transform: 'translateY(' + -11 * guc + '%) scale(' + (1 + 0.05 * guc) + ')', offset: 0.32 },
      { transform: 'none', offset: 0.62 }, { transform: 'translateY(' + -3 * guc + '%)', offset: 0.8 }, { transform: 'none' },
    ], { duration: 430, easing: 'ease-out' });
  }
  function salla(el: Element) {
    tepkiYay('yanlis');
    if (sakin) return;
    el.animate([{ transform: 'none' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'none' }], { duration: 380 });
  }
  /** Öğeyi önceki konumundan (bas) şimdiki yerine uçurur. */
  function ucur(el: HTMLElement, bas: DOMRect | undefined, ms = 520) {
    if (!bas || sakin) return Promise.resolve();
    const son = el.getBoundingClientRect();
    if (!son.width || !son.height) return Promise.resolve();
    el.style.transformOrigin = '0 0';
    const a = el.animate([
      { transform: 'translate(' + (bas.left - son.left) + 'px,' + (bas.top - son.top) + 'px) scale(' + bas.width / son.width + ',' + bas.height / son.height + ')' },
      { transform: 'none' },
    ], { duration: hizli ? 1 : ms, easing: 'cubic-bezier(.3,.7,.25,1)' });
    // Hareket bitince devam; sayfa arka planda ya da cihaz yavaşsa da akış takılmaz.
    return Promise.race([a.finished.then(() => undefined, () => undefined), new Promise<void>((r) => setTimeout(r, ms + 300))])
      .then(() => { if (a.playState === 'running') a.finish(); el.style.transformOrigin = ''; });
  }
  return { zipla, salla, ucur };
}

// ---------- Akış ----------
/**
 * Dersin adım akışı. Her yeni akış (iptal) numarayı artırır; eski akışın bekleyen adımları false döner ve sessizce biter.
 * `no` o anki akışın numarası (`const a = akis.no`), `kapandi` ders kapanınca true.
 */
export class DersAkisi {
  no = 0;
  kapandi = false;
  private zamanlayicilar = new Set<number>();
  private adimBitir: ((tamam: boolean) => void) | undefined;
  constructor(private ses: DersSesi, private sesiAc: () => void, private hizli = false) {}

  canli = (a: number) => !this.kapandi && a === this.no;
  bekle(ms: number, a: number) {
    return new Promise<boolean>((coz) => {
      const t = window.setTimeout(() => { this.zamanlayicilar.delete(t); coz(this.canli(a)); }, this.hizli ? Math.min(ms, 30) : ms);
      this.zamanlayicilar.add(t);
    });
  }
  async konus(id: string, a: number) {
    await this.ses.cal(id);
    return this.canli(a);
  }
  /** Çocuğun eylemini bekleyen adım: bitir(true) ile ya da akış değişince false ile biter. */
  adim(kur: (bitir: (tamam: boolean) => void) => () => void) {
    return new Promise<boolean>((coz) => {
      let bitti = false, birak: (() => void) | undefined;
      const bitir = (tamam: boolean) => {
        if (bitti) return;
        bitti = true;
        if (this.adimBitir === bitir) this.adimBitir = undefined;
        birak?.();
        coz(tamam);
      };
      this.adimBitir = bitir;
      const geri = kur(bitir);
      if (bitti) geri(); else birak = geri;
    });
  }
  iptal() {
    this.no++;
    this.adimBitir?.(false);
    this.ses.sus();
    this.zamanlayicilar.forEach(clearTimeout);
    this.zamanlayicilar.clear();
  }
  /** Çocuk bir süre dokunmazsa küçük bir ipucu; her ikincide Ceren yönergeyi yeniden söyler (en çok iki kez). */
  bostaIzle(ipucu: () => void, soz: () => string) {
    let saat = 0, kez = 0, durdu = false;
    const kur = () => {
      clearTimeout(saat);
      if (durdu || this.hizli) return;
      saat = window.setTimeout(() => {
        if (durdu || this.kapandi || document.hidden) return;
        if (this.ses.calan) { kur(); return; }
        kez++;
        ipucu();
        if (kez % 2 === 0 && kez <= 4) void this.ses.cal(soz());
        kur();
      }, 5200);
    };
    kur();
    return { dokundu: () => { kez = 0; kur(); }, dur: () => { durdu = true; clearTimeout(saat); } };
  }
  /** Dokunuşa anında tepki: parmak değer değmez çalışır, klavyede tıklamayla. */
  dokununca(el: HTMLElement, fn: (e: PointerEvent | MouseEvent) => void) {
    el.onpointerdown = (e) => { if (!e.isPrimary || e.button !== 0) return; this.sesiAc(); fn(e); };
    el.onclick = (e) => { if (e.detail === 0) { this.sesiAc(); fn(e); } };
  }
}
