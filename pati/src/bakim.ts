/**
 * Pati Dükkânı: bakım rafı ve eşyaların elle kullanımı (yakın çekimde).
 *
 * Her eşya hem sürüklenir hem dokunulur (dokunuş = o işin bir adımını kendiliğinden yapar; aynı yol yardım
 * merdiveninin "Bak, böyle!" ve "Birlikte bitirelim" adımlarında da kullanılır):
 * - mama torbası: Fındık'ın kabının üstünde tutulunca eğilir, taneler dökülür; her ölçek "Bir!", "İki!"
 * - top: bırakınca (fiske) yay çizer, sekip yere düşer; Fındık koşar, ağzına alır, getirir
 * - oyuncak kuş (tüy değneği yerine): Tarçın'ın köşesinde sallanınca Tarçın izler, popo sallar, atlayıp yakalar
 * - minder (battaniye yerine): Tarçın'ın ayağının dibine yumuşakça iner, Tarçın üstüne kıvrılır
 * - yem kutusu: akvaryumun üstünde sallanınca tutam düşer, Pırıl yüzüp yutar
 * Yanlış eşya ceza değil: hayvan koklar ("hı?"), eşya rafına döner. Hiçbir şey girdiyi kilitlemez.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { elSurukle, icinde, Tutulan } from '../../kino-otobus/src/dokunsal';
import { Sallama } from '../../kino-otobus/src/el-isi';
import type { Efekt } from '../../kino-otobus/src/efekt';
import type { Hayvan } from './hayvan';
import { rafEsyalari, type EsyaAdi, type HayvanAdi, type IhtiyacTuru, type Yas } from './ihtiyac';
import { AKVARYUM, KOSE, type Sahne } from './sahne';
import { ses } from './sesler';
import { esyaAdresi, MAMA_KABI, MAMA_KABI_BOS, varMi } from './varliklar';

/** Tüy değneği (G4) sapının ucundan tutulur, tüy aşağıda sallanır; geçici kuş oyuncağı ipinin ucundan */
const DEGNEK = varMi('esya-tuy-degnek');
const KUS_TUT: [number, number] = DEGNEK ? [0.06, 0.95] : [0.5, 0.1];
/** Oyuncağın kedinin yakaladığı ucu (tüy / kuş), kutunun oranı */
const KUS_UC: [number, number] = DEGNEK ? [0.86, 0.86] : [0.5, 0.7];
/** Battaniye yere serilir, Tarçın üstüne kıvrılır (geçici minder daha kalın) */
const SERGI_Y = varMi('esya-battaniye') ? -18 : -46;

const ras = (a: number, b: number) => a + Math.random() * (b - a);
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ || TEST_MODU;

/** Hangi hayvana hangi eşya "kendi işi" (ihtiyaç olmasa da oynanır) */
const KENDI: Record<HayvanAdi, EsyaAdi[]> = { findik: ['mama', 'top'], tarcin: ['kus', 'minder'], piril: ['yem'] };
/** Ekranda tutulan eşyanın boyu (px, kısa kenar ölçüsü; kök yüksekliğine göre) */
const tutBoy = (kok: HTMLElement) => Math.max(84, Math.min(130, Math.min(kok.clientWidth, kok.clientHeight) * 0.26));

export interface BakimOrtam {
  kok: HTMLElement;
  efekt: Efekt;
  sahne: Sahne;
  hayvanlar: Record<HayvanAdi, Hayvan>;
  yas: () => Yas;
  /** hayvanın açık ihtiyacı (yoksa null) */
  ihtiyac: (h: HayvanAdi) => IhtiyacTuru | null;
  /** bir bakım adımı yapıldı (gun.ts sayar, ihtiyacı kapatır) */
  adim: (h: HayvanAdi, e: EsyaAdi) => void;
  /** günün anları (polaroid için) */
  an: (ad: string) => void;
  /** "Bir!", "İki!" (Nehir abla) */
  say: (n: number) => void;
}

export class Bakim {
  readonly raf: HTMLElement;
  private dugmeler = new Map<EsyaAdi, HTMLButtonElement>();
  private birak: (() => void)[] = [];
  /** raf hangi hayvan için açık */
  hayvan: HayvanAdi | null = null;
  /** kullanımda olan eşya (top havada, kuş sallanıyor): rafta soluk */
  private kullanimda = new Set<EsyaAdi>();
  private mamaKabi: HTMLImageElement;
  private minder: HTMLImageElement | null = null;
  private topEl: HTMLImageElement | null = null;
  private kapandi = false;

  constructor(private o: BakimOrtam) {
    this.raf = h('div.pt-raf', { 'aria-label': 'Bakım rafı' });
    const f = o.hayvanlar.findik;
    // Fındık'ın kabı köşesinde durur: boş (G4) ya da gelmediyse yalnız dökünce görünür
    this.mamaKabi = h(`img.pt-mama-kabi${MAMA_KABI_BOS ? '.acik' : ''}`, { src: MAMA_KABI_BOS ?? MAMA_KABI, alt: '', draggable: 'false', style: `left:${f.evX + 230}px;top:${f.evY + 8}px` }) as HTMLImageElement;
    o.sahne.katman.append(this.mamaKabi);
  }

  // ---------------------------------------------------------------- raf
  /** Rafı o hayvanın eşyalarıyla açar */
  ac(hayvan: HayvanAdi) {
    this.hayvan = hayvan;
    this.temizle();
    const esyalar = rafEsyalari(hayvan);
    this.raf.replaceChildren(
      ...esyalar.map((e, i) => {
        const b = h(`button.pt-raf-esya`, { type: 'button', 'data-esya': e, 'aria-label': e, style: `--i:${i}` }, h('img', { src: esyaAdresi(e), alt: '', draggable: 'false' })) as HTMLButtonElement;
        b.classList.toggle('pt-kullanimda', this.kullanimda.has(e));
        b.addEventListener('click', () => {
          if (this.kullanimda.has(e) || !this.hayvan) return;
          void this.kullan(e, this.hayvan);
        });
        this.birak.push(elSurukle(b, this.surukle(e, b)));
        this.dugmeler.set(e, b);
        return b;
      }),
    );
    this.raf.dataset.hayvan = hayvan;
    this.raf.classList.add('acik');
  }

  kapa() {
    this.raf.classList.remove('acik');
    this.hayvan = null;
  }

  private temizle() {
    for (const b of this.birak) b();
    this.birak = [];
    this.dugmeler.clear();
  }

  /** Gereken eşya rafta parlar ve hafifçe zıplar (3-4 ve yardım merdiveni) */
  parlat(e: EsyaAdi | null) {
    for (const [ad, b] of this.dugmeler) b.classList.toggle('pt-parla', ad === e);
  }

  private kullanimaAl(e: EsyaAdi, var_: boolean) {
    if (var_) this.kullanimda.add(e);
    else this.kullanimda.delete(e);
    this.dugmeler.get(e)?.classList.toggle('pt-kullanimda', var_);
  }

  // ---------------------------------------------------------------- sürükleme
  private surukle(e: EsyaAdi, b: HTMLButtonElement) {
    let tut: Tutulan | null = null;
    let dolum = 0;
    let sonT = 0;
    let raf = 0;
    const sallama = new Sallama();
    let sonSicrama = 0;
    let sonX = 0;
    let sonY = 0;
    let hizX = 0;
    let hizY = 0;
    const ustunde = (x: number, y: number) => {
      const hy = this.hayvan;
      if (!hy) return false;
      const r = this.koseEkran(hy);
      return icinde(r, x, y, 10);
    };
    // mama: kabın üstünde tutuldukça dökülür (rAF), her ölçek ~650 ms
    const mamaDongu = (t: number) => {
      if (!tut) return;
      const dt = Math.min(64, t - (sonT || t));
      sonT = t;
      if (ustunde(sonX, sonY) && this.hayvan === 'findik') {
        tut.dondur(115);
        dolum += dt / 650;
        if (Math.random() < 0.35) this.taneDok(tut.donukNokta(0.5, 0.05), 2);
        if (dolum >= 1) {
          dolum = 0;
          void this.mamaOlcek();
        }
      } else tut.dondur(0);
      raf = requestAnimationFrame(mamaDongu);
    };
    return {
      aktif: () => !this.kullanimda.has(e) && !!this.hayvan,
      basla: (x: number, y: number) => {
        const boy = tutBoy(this.o.kok);
        tut = new Tutulan(this.o.efekt, h('img.pt-tutulan-resim', { src: esyaAdresi(e), alt: '' }), { en: boy, boy, sinif: 'pt-tutulan', tx: e === 'kus' ? KUS_TUT[0] : 0.5, ty: e === 'kus' ? KUS_TUT[1] : 0.55 });
        tut.yer(x, y);
        b.classList.add('pt-tutuldu');
        sonX = x;
        sonY = y;
        dolum = 0;
        sonT = 0;
        if (e === 'mama') raf = requestAnimationFrame(mamaDongu);
        if (e === 'kus' && this.hayvan === 'tarcin') this.o.hayvanlar.tarcin.el.classList.add('pt-izliyor');
      },
      tasi: (x: number, y: number, dx: number, dy: number) => {
        if (!tut) return;
        tut.yer(x, y, dx);
        hizX = hizX * 0.6 + dx * 0.4;
        hizY = hizY * 0.6 + dy * 0.4;
        sonX = x;
        sonY = y;
        const hy = this.hayvan;
        if (!hy) return;
        if (e === 'yem' && hy === 'piril' && ustunde(x, y)) {
          if (sallama.ekle(dx, dy)) {
            ses.tikir(sallama.sayi);
            void this.yemTutam(this.o.sahne.sahneye(x, y));
          }
        }
        if (e === 'kus' && hy === 'tarcin') {
          const t = this.o.hayvanlar.tarcin;
          // kedinin baktığı ve atladığı yer: oyuncağın ucu (tüy)
          const boy = tutBoy(this.o.kok);
          const [sx, sy] = this.o.sahne.sahneye(x + (KUS_UC[0] - KUS_TUT[0]) * boy, y + (KUS_UC[1] - KUS_TUT[1]) * boy);
          t.bak(sx);
          const simdi = performance.now();
          if (ustunde(x, y) && simdi - sonSicrama > 1300 && sy < t.y - 80) {
            sonSicrama = simdi;
            void this.kusYakala([sx, sy], tut);
          }
        }
      },
      birak: (x: number, y: number) => {
        cancelAnimationFrame(raf);
        b.classList.remove('pt-tutuldu');
        this.o.hayvanlar.tarcin.el.classList.remove('pt-izliyor');
        const t = tut;
        tut = null;
        if (!t) return;
        const hy = this.hayvan;
        const geri = () => void t.don_(this.rafNokta(e), 280);
        if (!hy || !ustunde(x, y)) return geri();
        const nokta = this.o.sahne.sahneye(x, y);
        if (e === 'top') {
          t.kaldir();
          void this.topAt(hy, nokta, [hizX, hizY]);
        } else if (e === 'minder') {
          t.kaldir();
          void this.minderKoy(hy, nokta);
        } else if (e === 'mama' || e === 'yem' || e === 'kus') {
          // dökme / sallama / yakalama tutarken oldu; tutmadan bırakıldıysa bir adım kendiliğinden
          if (e === 'kus' && performance.now() - sonSicrama > 1300) {
            void t.don_(null, 120);
            void this.kullan(e, hy);
          } else geri();
        } else geri();
      },
    };
  }

  /** Köşenin ekrandaki kutusu (bırakma hedefi) */
  private koseEkran(hy: HayvanAdi): DOMRect {
    const k = KOSE[hy];
    const r = this.o.sahne.sahne.getBoundingClientRect();
    const s = r.width / 2752;
    return new DOMRect(r.left + k.x0 * s, r.top + (k.y0 - 160) * s, (k.x1 - k.x0) * s, (k.y1 - k.y0 + 220) * s);
  }

  /** Eşyanın raftaki yeri (ekran) */
  private rafNokta(e: EsyaAdi): [number, number] | null {
    const b = this.dugmeler.get(e);
    if (!b || !b.isConnected) return null;
    const r = b.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }

  /** Sahne noktası → efekt katmanı noktası */
  private efektNokta(x: number, y: number): [number, number] {
    const r = this.o.sahne.sahne.getBoundingClientRect();
    const k = this.o.efekt.kutu();
    const s = r.width / 2752;
    return [r.left - k.left + x * s, r.top - k.top + y * s];
  }

  // ---------------------------------------------------------------- dokunuş / yardım: bir adımı kendiliğinden
  /** Eşyayı o hayvana kullan (dokunuş, "Bak, böyle!", "Birlikte"): bir adım */
  async kullan(e: EsyaAdi, hy: HayvanAdi) {
    if (this.kapandi) return;
    const hv = this.o.hayvanlar[hy];
    if (!KENDI[hy].includes(e)) return this.yanlis(e, hy);
    if (e === 'mama') {
      await this.esyaUcur(e, this.efektNokta(hv.evX + 210, hv.evY - 260), true);
      return this.mamaOlcek();
    }
    if (e === 'top') return this.topAt(hy, [hv.evX - 40, hv.evY - 380], [-6, -10]);
    if (e === 'minder') return this.minderKoy(hy, [hv.evX, hv.evY - 200]);
    if (e === 'kus') {
      const hedef: [number, number] = [hv.x + 150, hv.y - hv.ayar.boy * 0.8];
      this.kullanimaAl('kus', true);
      const kus = h('img.pt-ucan-esya', { src: esyaAdresi('kus'), alt: '' });
      const [ex, ey] = this.efektNokta(...hedef);
      const bas = this.rafNokta('kus');
      const k = this.o.efekt.kutu();
      if (bas) await this.o.efekt.ucur(kus.cloneNode() as HTMLElement, [bas[0] - k.left, bas[1] - k.top], [ex, ey], { ms: 420, kavis: -40 });
      const boy = tutBoy(this.o.kok);
      const tut = new Tutulan(this.o.efekt, kus, { en: boy, boy, sinif: 'pt-tutulan', tx: KUS_TUT[0], ty: KUS_TUT[1] });
      // tutma noktası: ucu (tüy) hedefte olacak şekilde
      const px = ex + k.left - (KUS_UC[0] - KUS_TUT[0]) * boy;
      const py = ey + k.top - (KUS_UC[1] - KUS_TUT[1]) * boy;
      tut.yer(px, py);
      // sallanır, Tarçın izler, atlar
      for (let i = 0; i < 6; i++) {
        tut.yer(px + Math.sin(i * 1.3) * 18, py, Math.cos(i * 1.3) * 8);
        await bekle(90);
      }
      await this.kusYakala(hedef, tut);
      await tut.don_(this.rafNokta('kus'), 300);
      this.kullanimaAl('kus', false);
      return;
    }
    if (e === 'yem') {
      const nokta: [number, number] = [ras(AKVARYUM.x0 + 120, AKVARYUM.x1 - 120), AKVARYUM.y0 - 120];
      // yakın çekimde akvaryumun üstü ekranın tepesine dayanır: kutu ekranın içinde sallansın (yarısı kesilmesin)
      const [ex, ey] = this.efektNokta(...nokta);
      await this.esyaUcur(e, [ex, Math.max(ey, tutBoy(this.o.kok) * 0.6 + 6)], false);
      ses.tikir(1);
      return this.yemTutam(nokta);
    }
  }

  /** Eşya raftan bir noktaya uçar, (döker gibi eğilir) ve geri döner */
  private async esyaUcur(e: EsyaAdi, [x, y]: [number, number], egil: boolean) {
    const bas = this.rafNokta(e);
    const k = this.o.efekt.kutu();
    const boy = tutBoy(this.o.kok);
    const img = () => h('img', { src: esyaAdresi(e), alt: '', style: `width:${boy}px;height:${boy}px;object-fit:contain;display:block` });
    if (bas) await this.o.efekt.ucur(img(), [bas[0] - k.left, bas[1] - k.top], [x, y], { ms: 380, kavis: -50 });
    const kalan = img();
    const kap = h('div.ko-ucan', { style: `left:${x}px;top:${y}px` }, kalan);
    this.o.efekt.el.append(kap);
    if (!sakin()) await kap.animate([{ transform: 'translate(-50%,-50%) rotate(0deg)' }, { transform: `translate(-50%,-50%) rotate(${egil ? 110 : 0}deg) translateY(${egil ? 0 : -12}px)` }], { duration: 260, fill: 'forwards', easing: 'ease-out' }).finished.catch(() => undefined);
    void bekle(egil ? 520 : 200).then(async () => {
      if (bas) await this.o.efekt.ucur(img(), [x, y], [bas[0] - k.left, bas[1] - k.top], { ms: 320, kavis: -30 });
      kap.remove();
    });
    if (egil) this.taneDok([x - 10, y + boy * 0.2], 8);
  }

  // ---------------------------------------------------------------- mama
  private mamaSayac = 0;
  private async mamaOlcek() {
    const f = this.o.hayvanlar.findik;
    ses.sikir();
    this.mamaSayac++;
    this.o.say(this.mamaSayac);
    this.mamaKabi.classList.add('acik');
    this.mamaKabi.src = MAMA_KABI;
    this.mamaKabi.style.setProperty('--dolu', String(Math.min(1, this.mamaSayac / 2)));
    this.mamaKabi.animate([{ scale: '1 1' }, { scale: '1.12 .9' }, { scale: '1 1' }], { duration: 260 });
    this.o.adim('findik', 'mama');
    if (this.mamaSayac >= 2) {
      this.mamaSayac = 0;
      this.o.an('findik-mama');
      await bekle(250);
      f.bak(f.evX + 300);
      ses.hapir();
      await f.anlik('yiyor', 1700);
      // yedi bitirdi: kap boşalır
      if (MAMA_KABI_BOS) this.mamaKabi.src = MAMA_KABI_BOS;
      else this.mamaKabi.classList.remove('acik');
    } else if (this.o.ihtiyac('findik') !== 'ac') {
      // aç değilken: koklar, kabı burnuyla iter (komik)
      await f.kokla();
    }
  }

  /** Torbadan / kutudan dökülen taneler (efekt katmanı noktası) */
  private taneDok([x, y]: [number, number], adet: number) {
    if (sakin()) return;
    for (let i = 0; i < adet; i++) {
      const p = h('i.pt-tane', { style: `left:${x + ras(-10, 10)}px;top:${y}px` });
      this.o.efekt.el.append(p);
      const a = p.animate(
        [
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: `translate(-50%,-50%) translate(${ras(-14, 14).toFixed(0)}px, ${ras(60, 90).toFixed(0)}px) scale(.9)`, opacity: 1, offset: 0.85 },
          { transform: `translate(-50%,-50%) translate(${ras(-14, 14).toFixed(0)}px, ${ras(80, 100).toFixed(0)}px) scale(.8)`, opacity: 0 },
        ],
        { duration: ras(380, 520), delay: i * 40, easing: 'cubic-bezier(.4,0,.9,.6)', fill: 'backwards' },
      );
      void a.finished.then(() => p.remove(), () => p.remove());
    }
  }

  // ---------------------------------------------------------------- top (Fındık getirir)
  private async topAt(hy: HayvanAdi, [x, y]: [number, number], [vx]: [number, number]) {
    const hv = this.o.hayvanlar[hy];
    const k = KOSE[hy];
    this.kullanimaAl('top', true);
    const top = this.topEl ?? (this.topEl = h('img.pt-top', { src: esyaAdresi('top'), alt: '', draggable: 'false' }) as HTMLImageElement);
    this.o.sahne.katman.append(top);
    // iniş yeri: fiskenin yönüne göre köşenin zemininde (hayvandan uzağa)
    const yon = vx === 0 ? (x < hv.x ? -1 : 1) : Math.sign(vx);
    const inis = Math.max(k.x0 + 90, Math.min(k.x1 - 90, x + yon * 160));
    const zemin = hv.evY - 10;
    const sec = (bx: number, by: number) => {
      top.style.transform = `translate(${bx.toFixed(0)}px, ${by.toFixed(0)}px)`;
    };
    sec(x, y);
    ses.boing();
    if (!sakin()) {
      await top.animate(
        [
          { transform: `translate(${x}px, ${y}px)` },
          { transform: `translate(${(x + inis) / 2}px, ${Math.min(y, zemin) - 180}px)`, offset: 0.45, easing: 'ease-in' },
          { transform: `translate(${inis}px, ${zemin}px)`, offset: 0.75, easing: 'ease-out' },
          { transform: `translate(${inis + yon * 30}px, ${zemin - 60}px)`, offset: 0.87, easing: 'ease-in' },
          { transform: `translate(${inis + yon * 50}px, ${zemin}px)` },
        ],
        { duration: 900 },
      ).finished.catch(() => undefined);
    }
    const son = inis + yon * 50;
    sec(son, zemin);
    ses.pit();
    if (hy !== 'findik') {
      // köpek olmayan: topa bakar, koklar; top rafa döner
      hv.bak(son);
      await hv.kokla();
      this.topKaldir();
      return;
    }
    // Fındık koşar, topu ağzına alır, getirir
    hv.bak(son);
    await hv.zipla(30, 300);
    await hv.yuru(son - yon * 120, 900);
    top.classList.add('pt-agizda');
    top.style.setProperty('--yon', String(yon));
    hv.el.querySelector('.pt-hareket')?.append(top);
    top.style.transform = '';
    // G4'ün kırmızı topu gelince Fındık'ın "top ağzında" pozu (aynı kırmızı top) kullanılır; geçici yeşil topta top
    // ağzın önünde taşınır (pozdaki kırmızı topla renk karışmasın)
    if (varMi('esya-top')) {
      top.classList.add('pt-gizli');
      void hv.anlik('top', 1300);
    }
    await hv.yuru(hv.evX, 800);
    hv.bak(hv.evX + 400);
    // ayağının dibine bırakır, "bir daha!" diye zıplar
    top.classList.remove('pt-agizda', 'pt-gizli');
    this.o.sahne.katman.append(top);
    sec(hv.evX + 150, zemin);
    ses.pit();
    this.o.an('findik-top');
    this.o.adim('findik', 'top');
    await hv.zipla(70, 480, 'sevinc');
    this.topKaldir();
  }

  private topKaldir() {
    const t = this.topEl;
    if (t) {
      if (sakin()) t.remove();
      else void t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => t.remove(), () => t.remove());
      this.topEl = null;
    }
    this.kullanimaAl('top', false);
  }

  // ---------------------------------------------------------------- oyuncak kuş (Tarçın atlar)
  private async kusYakala([sx, sy]: [number, number], tut: Tutulan | null) {
    const t = this.o.hayvanlar.tarcin;
    t.bak(sx);
    // popo sallama: kısa çömelme (oyun hâli döngüsü), sonra atlayış
    t.el.classList.add('pt-pusu');
    await bekle(380);
    t.el.classList.remove('pt-pusu');
    const yuk = Math.max(90, Math.min(300, t.y - sy - t.ayar.boy * 0.6));
    const dx = Math.max(-200, Math.min(200, sx - t.x));
    await t.zipla(yuk, 640, 'atla', dx);
    // yakaladı: oyuncak sallanır, kalp
    if (tut && !sakin()) tut.el.animate([{ translate: '0 0' }, { translate: '0 14px' }, { translate: '0 -6px' }, { translate: '0 0' }], { duration: 300 });
    const [ex, ey] = this.efektNokta(sx, sy);
    this.o.efekt.parilti(ex, ey, 6, 0.8, '#FFE45C');
    ses.miyav();
    this.o.an('tarcin-kus');
    this.o.adim('tarcin', 'kus');
    // Tarçın yerine yürüyerek döner
    await t.eveDon();
  }

  // ---------------------------------------------------------------- minder (Tarçın kıvrılır)
  private async minderKoy(hy: HayvanAdi, [x, y]: [number, number]) {
    const hv = this.o.hayvanlar[hy];
    if (hy !== 'tarcin') {
      const m = h('img.pt-minder.pt-gecici-minder', { src: esyaAdresi('minder'), alt: '' }) as HTMLImageElement;
      this.o.sahne.katman.prepend(m);
      m.style.transform = `translate(${hv.evX}px, ${hv.evY}px)`;
      ses.fis();
      await hv.kokla();
      m.remove();
      return;
    }
    const m = this.minder ?? (this.minder = h('img.pt-minder', { src: esyaAdresi('minder'), alt: '', draggable: 'false' }) as HTMLImageElement);
    // hayvanın arkasında (önce eklenir)
    hv.el.before(m);
    const son = `translate(${hv.evX}px, ${hv.evY + 24}px)`;
    if (!sakin()) {
      await m.animate(
        [
          { transform: `translate(${x}px, ${y}px) scale(.8)` },
          { transform: `translate(${(x + hv.evX) / 2}px, ${Math.min(y, hv.evY) - 120}px) scale(1.05, .95)`, offset: 0.5 },
          { transform: `${son} scale(1.12, .82)`, offset: 0.82 },
          { transform: `${son} scale(1, 1)` },
        ],
        { duration: 700, easing: 'ease-in-out' },
      ).finished.catch(() => undefined);
    }
    m.style.transform = son;
    ses.fis();
    hv.minderde(true, -SERGI_Y);
    await hv.zipla(60, 440);
    this.o.an('tarcin-minder');
    this.o.adim('tarcin', 'minder');
    ses.mir();
    await hv.anlik('rahat', 2200);
  }

  // ---------------------------------------------------------------- yem (Pırıl yutar)
  private yemSayac = 0;
  private async yemTutam([x]: [number, number]) {
    const p = this.o.hayvanlar.piril;
    const tx = Math.max(AKVARYUM.x0 + 80, Math.min(AKVARYUM.x1 - 80, x));
    const yuzey = AKVARYUM.y0 + 30;
    // pullar yüzeye düşer
    const [ex, ey] = this.efektNokta(tx, AKVARYUM.y0 - 60);
    const [, ey2] = this.efektNokta(tx, yuzey + 40);
    if (!sakin()) {
      for (let i = 0; i < 5; i++) {
        const q = h('i.pt-pul', { style: `left:${ex + ras(-14, 14)}px;top:${ey}px` });
        this.o.efekt.el.append(q);
        const a = q.animate(
          [
            { transform: 'translate(-50%,-50%)', opacity: 1 },
            { transform: `translate(-50%,-50%) translate(${ras(-10, 10).toFixed(0)}px, ${(ey2 - ey).toFixed(0)}px)`, opacity: 1, offset: 0.6 },
            { transform: `translate(-50%,-50%) translate(${ras(-16, 16).toFixed(0)}px, ${(ey2 - ey + 16).toFixed(0)}px)`, opacity: 0 },
          ],
          { duration: 1100, delay: i * 50, easing: 'ease-out', fill: 'backwards' },
        );
        void a.finished.then(() => q.remove(), () => q.remove());
      }
    }
    const ac = this.o.ihtiyac('piril') === 'ac';
    await p.yemeGit(tx, yuzey + 30);
    this.o.an('piril-yem');
    if (ac) {
      this.yemSayac++;
      if (this.o.yas() === 'kucuk') this.o.say(this.yemSayac);
      this.o.adim('piril', 'yem');
    } else {
      // tok balık: karnı şişer, güler (5-6: fazlası su bulandırmaz)
      this.yemSayac = 0;
      await p.sisir();
    }
  }

  // ---------------------------------------------------------------- yanlış eşya
  private async yanlis(e: EsyaAdi, hy: HayvanAdi) {
    const hv = this.o.hayvanlar[hy];
    if (e === 'top') return this.topAt(hy, [hv.evX - 40, hv.evY - 380], [-4, -8]);
    if (e === 'minder') return this.minderKoy(hy, [hv.evX, hv.evY - 200]);
    await this.esyaUcur(e, this.efektNokta(hv.x + 180, hv.y - hv.ayar.boy * 0.6), false);
    await hv.kokla();
  }

  kapat() {
    this.kapandi = true;
    this.temizle();
  }
}
