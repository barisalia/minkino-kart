/**
 * Vaka 2 "Kino'nun Kayıp Atkısı": oyunun akışı (ekip/senaryo/dedektif-vaka2.md). Motor Vaka 1'inki: dünya + kamera
 * (dunya.ts), oyuncular (Mino, Kino; nefes ve göz kırpma kendi döngülerinde), büyüteç, kart sorgusu (sorgu.ts),
 * poz ekleri (poz.ts: yumuşak esneyerek), çizgi roman (roman.ts). Yeni mekanikler sorgu2.ts'de.
 *
 * Giriş (rüzgârlı sabah, Kino ipin önünde donar: atkı yok) → Halka 1 (çimde mandal; makas / rüzgâr / yağmur) →
 * Halka 2 (çamurda ördek izi + kırmızı iplik; ayak boyu ölçme: köpek patisi taşar, tavşan ayağı aşar, ördek ayağı
 * tam oturur) → Halka 3 (renk izi: yalnız kırmızı iplikler; mavi Ada'nın balon ipi, yaprak uçar gider) → Halka 4
 * (ses: üç çalı vırak / vıjjj / vak; ördek kartı ördeğin çalısına; çalı aralanır, Vakvak Anne yuvada) → Halka 5
 * (sıralama: üç olay üç kareye) → Final (yumurtalar titrer; atkı yumurtalara örtülür, üç dokunuşla çatlar; atkılı
 * yavrular) → Ödül: çocuğun dizdiği üç kare + kuluçka = çizgi roman; "Vaka Dosyam"a ikinci vaka.
 *
 * Hiçbir adım kilitlenmez (10 sn'de Kino koklar, 7 sn'de parmak, 2 yanlışta doğru parlar). Yalnız transform / opacity.
 * Test / gösterim: ?test=1&ekran=vaka2&adim=kim (giris, ne, kim, renk, ses, sira, final, roman); kökte data-adim.
 */
import { efekt } from '../../src/audio/ses';
import { boyGenislik, CIZIM } from '../../src/karakter/boy';
import { Karakter } from '../../src/karakter/karakter';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Buyutec, type BuyutecHedef } from '../../src/ui/buyutec';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import D from '../../content/dedektif.json';
import { DosyaSeridi } from './dosya';
import { AZ_HAREKET, Dunya, type KadrajKaynak, type Oda } from './dunya';
import { bahceGolet, bahceIp, bahceKur, bahceYenidenDiz, bahceYol, Ruzgar } from './dunya2';
import { Efekt, oynat, parmak, parmaklariDurdur, pop } from './efekt';
import { vakaCozuldu } from './kayit';
import { Dosya, izNotasi, K, M, ODA_H, odaW, YARDIM, type IpucuTanim, type Kadraj } from './mantik';
import {
  ADA_YERI,
  ADIMLAR2,
  CALILAR,
  CATLAMA,
  G2,
  halka2,
  HALKALAR2,
  IP,
  IZ_YERI,
  K2,
  KADRAJ2,
  KARTLAR2,
  KINO_PATI,
  M2,
  O2,
  RenkIzi,
  ROMAN2,
  SesSorusu,
  V2,
  YOL_PARCALARI,
  YUVA,
  BAHCE_DIKEY,
  type Adim2,
  type BahceId,
  type Halka2,
} from './mantik2';
import { Oyuncular } from './oyuncular';
import { pozlariYukle, PozYuvasi } from './poz';
import { resim } from './resimler';
import { kareleriGetir, romanKur, sirayla } from './roman';
import { Fon, muzikCal, ses } from './sesler';
import { sorgu } from './sorgu';
import { caliSesi, demekGoster, izParla, kimYanlis, neYanlis, sesSorgu, siraSorgu, type Ortak } from './sorgu2';

export interface Vaka2Param {
  adim?: Adim2;
}

function tohumlu(t: number): () => number {
  let s = t >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const px = (v: number) => `${v.toFixed(1)}px`;
const tutar = (a: Animation | null | undefined) => (a ? a.finished.then(() => undefined, () => undefined) : Promise.resolve());

/** Dünyadaki bir karakter (Ada, Vakvak Anne): iskeletin kare tuvali, ayak tabanı (x, y) noktasında */
class DunyaKarakteri {
  readonly kap: HTMLElement;
  readonly kutu: HTMLElement;
  readonly k: Karakter;
  constructor(
    readonly ad: 'ada' | 'ordek',
    x: number,
    y: number,
    W: number,
    sinif: string,
  ) {
    this.k = new Karakter(ad, h('div'));
    this.kutu = h('div.dd-dk-kutu', {}, this.k.el);
    const taban = CIZIM[ad].taban / CIZIM[ad].kutu[1];
    this.kap = h(`div.dd-dunya-karakter.${sinif}`, { 'data-karakter': ad, style: `left:${px(x * W)};top:${px(y * ODA_H)};--taban:${(taban * 100).toFixed(2)}%` }, h('i.dd-golge'), this.kutu);
  }
  /** Boyu: Mino'nun bu çekimdeki dünya boyuna göre (src/karakter/boy.ts) */
  boyla(minoW: number) {
    // dünyadakiler önde duran Mino'dan biraz geride: derinlik payı (boy oranları boy.ts'deki gibi)
    const w = boyGenislik(this.ad, minoW) * 0.85;
    this.kap.style.width = px(w);
    this.kap.style.height = px(w);
  }
  get w() {
    return parseFloat(this.kap.style.width) || 200;
  }
  kapat() {
    this.k.kapat();
  }
}

class Vaka2 {
  readonly el: HTMLElement;
  private dunya: Dunya;
  private oy = new Oyuncular();
  private efekt: Efekt;
  private dosya: Dosya;
  private serit: DosyaSeridi;
  private ara: HTMLElement;
  private buyutec: Buyutec;
  private fon = new Fon();
  private ruzgar = new Ruzgar();
  private ip: Oda;
  private yol: Oda;
  private golet: Oda;
  private ada: DunyaKarakteri;
  private balon: HTMLElement;
  private ordek: DunyaKarakteri;
  private ordekPoz: PozYuvasi;
  /** yuvanın katmanı (gölette): yumurtalı yuva, üstündeki atkı, atkılı yavrular, Vakvak Anne */
  private yuvaKap: HTMLElement;
  private yuva: HTMLElement;
  private atkiUst: HTMLElement;
  private yavrular: HTMLElement;
  private kapali = false;
  private zamanlar: number[] = [];
  private temizlik: (() => void)[] = [];
  private rnd: () => number;
  private bulusSayisi = 0;
  private ortak: Ortak;
  /** ekran boyu değişince (dönüş) o anki işin ek düzeltmesi (renk izinde: sıradaki kırmızı kadraja) */
  private boyutSonrasi: (() => void) | null = null;
  /** finalde Kino'nun önüne konan atkı (ekran px): dönünce ekranın içinde kalsın */
  private atkiTasi: HTMLElement | null = null;

  constructor(
    private app: Uygulama,
    baslangic: Adim2,
  ) {
    const q = new URLSearchParams(location.search);
    this.rnd = q.has('tohum') ? tohumlu(Number(q.get('tohum'))) : TEST_MODU ? tohumlu(7) : Math.random;
    if (TEST_MODU && Number(q.get('kokla')) > 0) YARDIM.koklaSn = Number(q.get('kokla')) / 1000;
    this.dosya = Dosya.adimdan(baslangic, ADIMLAR2, HALKALAR2);
    // seçim kartlarının resimleri şimdiden yüklenir: kartlar açılınca bir an bembeyaz boş kutu görünmesin
    // (sıralama soru kartları çizgi roman kareleridir: onlar da)
    for (const ad of [...Object.values(KARTLAR2).map((k) => k.resim), 'v2/roman-1', 'v2/roman-2', 'v2/roman-3', 'v2/roman-4']) {
      const i = new Image();
      i.src = resim(ad) ?? '';
    }
    this.serit = new DosyaSeridi(this.dosya);
    this.dunya = new Dunya((w, hh) => this.guvenli(w, hh));
    this.ara = h('div.dd-ara');
    const geri = yuvarlakDugme(IKON.geri, 'Geri', () => this.app.git('acilis'), 'kucuk dd-geri');
    const tekrar = yuvarlakDugme(IKON.tekrar, 'Tekrar dinle', () => this.oy.tekrar(), 'kucuk dd-tekrar');
    const sesD = sesDugmesi();
    sesD.classList.add('kucuk');
    this.el = h('div.dd-vaka.dd-vaka2', { 'data-adim': 'yukleniyor', 'data-vaka': 'vaka2' }, this.dunya.el, this.oy.el, this.ara, h('div.dd-ust', {}, geri, this.serit.el, h('div.dd-ust-sag', {}, tekrar, sesD)));
    this.efekt = new Efekt(this.el);
    this.el.append(this.efekt.el, this.oy.balonKatman);
    this.ortak = { kok: this.el, efekt: this.efekt, oy: this.oy, rnd: this.rnd, kapandi: () => this.kapali, bekle: this.bekle, adim: (a) => this.adim(a) };

    // bahçe: üç bölüm
    bahceKur();
    this.ip = bahceIp(halka2('ne').ipuclari);
    const W = odaW('bahce-yol');
    const WG = odaW('bahce-golet');
    this.ada = new DunyaKarakteri('ada', ADA_YERI.x, ADA_YERI.y, W, 'dd-ada');
    this.balon = h('div.dd-balon-ada', {}, h('img', { src: resim('balon') ?? '', alt: '', draggable: 'false' }));
    this.ada.kutu.append(this.balon);
    this.yol = bahceYol(halka2('kim').ipuclari, this.ada.kap);
    this.ordek = new DunyaKarakteri('ordek', YUVA.x, YUVA.y, WG, 'dd-ordek-dunya');
    this.ordekPoz = PozYuvasi.ordek(this.ordek.kutu, this.ordek.k.el);
    this.yuva = h('img.dd-yuva', { src: resim('v2/yuva-yumurta') ?? '', alt: '', draggable: 'false' });
    this.atkiUst = h('img.dd-atki-ust', { src: resim('v2/atki-yerde') ?? '', alt: '', draggable: 'false' });
    this.yavrular = h('img.dd-yavrular', { src: resim('v2/yavru-atki') ?? '', alt: '', draggable: 'false' });
    this.yuvaKap = h('div.dd-yuva-kap', { style: `left:${px(YUVA.x * WG)};top:${px(YUVA.y * ODA_H)}` }, h('div.dd-yuva-ic', {}, this.yuva, this.atkiUst, this.yavrular), h('button.dd-yuva-dokun', { type: 'button', 'aria-label': 'Yumurtalar' }));
    this.golet = bahceGolet(h('div.dd-yuva-katman', {}, this.ordek.kap, this.yuvaKap));
    this.temizlik.push(() => this.ada.kapat(), () => this.ordek.kapat(), () => this.ordekPoz.temizle(), () => this.ruzgar.kapat());

    const ilk = this.odaAdimi(baslangic);
    this.dunya.kur(ilk, 'genel');
    this.buyutec = new Buyutec({
      kap: this.ara,
      kaynak: () => this.dunya.oda!.el,
      resim: resim('buyutec'),
      yaricap: () => {
        const r = this.ara.getBoundingClientRect();
        return Math.max(48, Math.min(120, Math.min(r.width, r.height) * (r.width > r.height ? 0.2 : 0.15)));
      },
      yakinlik: (hd, oran) => this.yakinlik(hd, oran),
      gordu: (hd) => this.gordu(hd),
      dokundu: (hd) => void this.dokundu(hd),
    });
    this.buyutec.goster(false);
    this.dunya.kameraBitti = () => this.buyutec.yenile();
    const boyut = () => {
      // telefon vakanın ortasında döndü (web sitesinde yön serbest): bahçe bölümleri yeni yönün yerleşimine geçer;
      // kamera aynı işi yeni yerde gösterir: ipuçları, iz parçaları ve çalılar ekranda kalır
      const degisen = [this.ip, this.yol, this.golet].filter((o) => bahceYenidenDiz(o));
      if (degisen.length) this.dunyadakileriDiz();
      if (this.dunya.oda && degisen.includes(this.dunya.oda)) this.dunya.odaYenilendi();
      else this.dunya.yenile();
      this.buyutec.yenile();
      // (bir kare sonra: az hareket ayarında da her değişimin kısa bir geçişi var; ölçüm yeni yeri görsün)
      requestAnimationFrame(() => {
        if (this.kapali) return;
        this.boyutSonrasi?.();
        this.atkiSigdir();
      });
    };
    window.addEventListener('resize', boyut);
    this.temizlik.push(() => window.removeEventListener('resize', boyut));
    this.oy.mino.el.addEventListener('pointerdown', () => {
      this.oy.minoTepki('gidik');
      efekt.dokunma();
    });
    this.oy.kinoYer.addEventListener('pointerdown', () => {
      efekt.dokunma();
      this.oy.kinoOynat('sevin', 800);
      this.oy.kinoIfade('heyecan', 800);
    });
    void this.oy.mino.poz(null);
    // bu vakada Kino'nun boynu açık (atkısı kayıp; poz çizimleri de fularsız): iskeletin fuları gizli
    this.oy.kino.gizle('fular', true);
    pozlariYukle();
    void this.oy.mino.dedektif({ sapka: baslangic !== 'giris' });
    if (baslangic !== 'giris') this.oy.mino.el.classList.add('dd-sapkali');
    void this.akis(baslangic);
  }

  // ---------------------------------------------------------------- yaşam döngüsü
  kapat() {
    this.kapali = true;
    this.zamanlar.forEach(clearTimeout);
    this.temizlik.forEach((f) => {
      try {
        f();
      } catch {
        /* yok say */
      }
    });
    // el ipuçları hep birlikte durur (renk izi, çalılar, kartlar, atkı, yuva: yerel "dur" tutamaçları da)
    this.parmakBirak();
    parmaklariDurdur(this.el);
    this.fon.durdur();
    this.buyutec.kapat();
    this.oy.kapat();
  }
  /** Kapanınca yapılacak iş; ekran çoktan kapandıysa hemen yapılır */
  private temizle(f: () => void) {
    if (this.kapali) f();
    else this.temizlik.push(f);
  }
  private bekle = (ms: number): Promise<void> =>
    new Promise((r) => {
      if (this.kapali) return r();
      this.zamanlar.push(window.setTimeout(r, sure(ms)));
    });
  private sonra(ms: number, fn: () => void) {
    this.zamanlar.push(window.setTimeout(() => !this.kapali && fn(), sure(ms)));
  }
  private adim(ad: string) {
    this.el.dataset.adim = ad;
  }
  private guvenli(w: number, hh: number): [number, number, number, number] {
    const ust = Math.min(86, hh * 0.14);
    if (w > hh * 1.15) return [w * 0.14, ust, w * 0.86, hh * 0.98];
    return [w * 0.04, ust, w * 0.96, hh * 0.76];
  }
  private dar() {
    const { w, h: hh } = this.dunya.boyut;
    return w < hh * 1.15;
  }
  /**
   * Dar ekranda kamerayı oda oranındaki bir x'e ortalar (kadrajın dikeyi korunur); genişte kadraj aynen. İşlev döner
   * (x ve kadraj da işlev: tablolar dönüşte yerinde değişir): kamera her hesapta, telefon dönünce de, yeniden kurar.
   */
  private ortala(x: () => number, k: () => Kadraj, yari = 0.1): () => Kadraj {
    return () => {
      const kd = k();
      // dikey bahçe çizimi ekran oranında: kamera kadrajın tam eninde (dunya.ts), x'e ortalamaya gerek yok
      if (!this.dar() || (this.dunya.oda && BAHCE_DIKEY[this.dunya.oda.id as BahceId])) return kd;
      const cx = x();
      return [cx - yari, kd[1], cx + yari, kd[3]];
    };
  }
  /** Bu çekimde Mino'nun kutu genişliği dünya biriminde (dünyadaki karakterler buna göre boylanır) */
  private minoDunyaW() {
    return (this.oy.minoYer.getBoundingClientRect().width || 140) / Math.max(0.05, this.dunya.olcek);
  }
  private odaAdimi(a: Adim2): Oda {
    if (a === 'giris' || a === 'ne') return this.ip;
    if (a === 'kim' || a === 'renk') return this.yol;
    return this.golet;
  }
  /** Odaya geçer (zaten oradaysa yalnız kamera) */
  private async odaya(oda: Oda, kd: KadrajKaynak, yon: 1 | -1 = 1) {
    this.ruzgar.es(oda, oda.id === 'bahce-ip' ? 1.1 : 0.45);
    if (this.dunya.oda === oda) return this.dunya.git(kd, 1000);
    ses.vuus();
    await this.dunya.gec(oda, kd, yon);
  }

  // ---------------------------------------------------------------- akış
  private async akis(bas: Adim2) {
    const sira = ADIMLAR2.slice(ADIMLAR2.indexOf(bas));
    // bahçenin üç resmi (4096 px) çözülene kadar sahne görünmez, sonra yumuşakça belirir (resim bir anda yerine oturmasın)
    this.el.classList.add('dd-yukleniyor');
    const resimler = [this.ip, this.yol, this.golet].map((o) => o.el.querySelector<HTMLImageElement>('img.dd-zemin')!);
    await Promise.race([Promise.all(resimler.map((i) => i.decode().catch(() => undefined))), this.bekle(TEST_MODU ? 50 : 3500)]);
    this.el.classList.remove('dd-yukleniyor');
    if (this.kapali) return;
    this.fon.baslat();
    for (const a of sira) {
      if (this.kapali) return;
      if (a === 'giris') await this.giris();
      else if (a === 'ne' || a === 'kim') await this.kartHalkasi(halka2(a));
      else if (a === 'renk') await this.renkIzi();
      else if (a === 'ses') await this.sesIpucu(sira[0] === 'ses');
      else if (a === 'sira') await this.siralama(sira[0] === 'sira');
      else if (a === 'final') await this.final(sira[0] === 'final');
      else if (a === 'roman') await this.roman();
    }
  }

  // ---------------------------------------------------------------- giriş
  private async giris() {
    const { oy, dunya } = this;
    this.adim('giris');
    dunya.kur(this.ip, this.ortala(() => 0.5, () => KADRAJ2.giris, 0.12));
    this.ruzgar.es(this.ip, 1.4);
    this.ip.e.mandallar?.classList.add('dd-ruzgarli');
    const giris = -Math.min(460, window.innerWidth * 0.55);
    void oy.kaydir('mino', giris, 0, 0, 0);
    void oy.kaydir('kino', Math.min(520, window.innerWidth * 0.7), 0, 0, 0);
    await this.bekle(400);
    // Kino koşa koşa ipin önüne gelir ve donar
    oy.kinoIfade('heyecan', 900);
    await oy.kaydir('kino', 0, 0, 900, 22);
    if (this.kapali) return;
    oy.kinoIfade('saskin', 1200);
    ses.pop();
    void dunya.git(this.ortala(() => IP.atki.x, () => KADRAJ2.ip, 0.12), 900);
    await this.bekle(450);
    // atkı yok: üzgün poz (atkısız boynu), mandallar boş sallanır
    void oy.kinoPozu.goster('kino-uzgun');
    oy.kinoIfade('uzgun', 3000);
    this.ruzgar.firtina(this.ip, 6);
    ses.ruzgar(0.7);
    const minoGel = oy.minoYuruyerekGel(giris, 1700);
    await oy.soyle(K2.atkim_yok, 'kino');
    await minoGel;
    if (this.kapali) return;
    // Mino şapkasını takar: "Bu bir vaka!"
    oy.minoTepki('sasir');
    await oy.mino.dedektif({ sapka: true });
    oy.mino.el.classList.add('dd-sapkali');
    oynat(oy.mino.el, 'dd-sapka-dus');
    ses.pop();
    this.sonra(220, () => {
      const [x, y] = this.efekt.merkez(oy.mino.el, 0.5, 0.12);
      this.efekt.parilti(x, y, 8, 0.8);
    });
    await this.bekle(420);
    await oy.mino.dedektif({ buyutec: true });
    ses.vaka();
    oy.minoTepki('zipla');
    oynat(this.el, 'dd-vaka-flas');
    void oy.kinoPozu.birak();
    oy.kinoIfade('heyecan', 1400);
    await oy.soyle(M.vaka);
    if (this.kapali) return;
    oy.kinoOynat('sevin', 800);
    await oy.soyle(M.buyutec);
    await oy.mino.dedektif({ buyutec: false });
  }

  // ---------------------------------------------------------------- Halka 1 ve 2: ara, sor (kart), demek ki
  private async kartHalkasi(hk: Halka2) {
    const { oy, dunya } = this;
    if (this.kapali) return;
    this.serit.aktif(hk.id);
    const oda = hk.id === 'ne' ? this.ip : this.yol;
    oy.yerlesim('iki');
    dunya.darYakin = null;
    await this.odaya(oda, this.aramaKadraji(hk), 1);
    if (this.kapali) return;
    // dikeyde ipuçları zeminde, karakterlerin baş hizasında: ikisi de kenara çekilir (ortası boş kalır)
    oy.yerlesim('iki', 'kenar');
    await this.ipuclariniBul(hk, oda);
    oy.yerlesim('iki');
    if (this.kapali) return;
    this.adim(`soru-${hk.id}`);
    const t0 = hk.ipuclari[0];
    const t1 = hk.ipuclari[1];
    await sorgu({
      kok: this.el,
      efekt: this.efekt,
      oy,
      halka: hk,
      kartlar: KARTLAR2,
      foto: resim(t0.foto ?? t0.resim) ?? '',
      ekFoto: t1 ? resim(t1.foto ?? t1.resim) : null,
      oturma: hk.id === 'kim' ? { x: IZ_YERI.x, y: IZ_YERI.y, w: IZ_YERI.w, sade: true, don: IZ_YERI.don } : { x: 0.52, y: 0.5, w: 0.62, sade: true, don: -4 },
      yanlisAni: hk.id === 'ne' ? neYanlis(this.ortak, () => this.ipiGoster()) : kimYanlis(this.ortak),
      dogruAni: hk.id === 'ne' ? () => this.ruzgarEsti() : undefined,
      parlaAni: hk.id === 'kim' ? () => izParla(this.el) : undefined,
      goz: () => this.serit.goz(hk.id),
      ilk: hk.id === 'ne',
      rnd: this.rnd,
      kapandi: () => this.kapali,
      bekle: this.bekle,
      adim: (a) => this.adim(a),
    });
    if (this.kapali) return;
    this.dosya.demekEkle(hk.id);
    this.serit.demek(hk.id);
    ses.muhur();
    this.adim(`demek-${hk.id}`);
    if (hk.id === 'ne') await this.atkiUcar();
    else await this.kinoPatisi();
  }

  /** Arama kadrajı: yatayda halkanın kadrajı; dikeyde ipuçlarının ortasına dar bir dilim */
  private aramaKadraji(hk: Halka2): () => Kadraj {
    // (işlev: telefon dönünce kadraj yeni yöne ve yerleşime göre yeniden kurulur, ipuçları ekranda kalır)
    const orta = this.ortala(
      () => {
        const xs = hk.ipuclari.map((t) => t.x);
        return (Math.min(...xs) + Math.max(...xs)) / 2;
      },
      () => hk.kadraj,
      0.12,
    );
    return () => (!this.dar() || !hk.ipuclari.length ? hk.kadraj : orta());
  }

  /** Makas kartı: perde aralanır, ip boydan boya parlar (kesik yok) */
  private async ipiGoster() {
    if (this.dunya.oda !== this.ip) return;
    for (const [i, [x, y]] of IP.noktalar.entries()) {
      this.sonra(i * 90, () => {
        const [sx, sy] = this.dunya.ekranda(x, y);
        this.efekt.isilti(sx, sy, 6);
        this.efekt.parilti(sx, sy, 3, 0.35);
      });
    }
    this.ip.e.ip?.classList.add('acik');
    await this.bekle(IP.noktalar.length * 90 + 900);
    this.ip.e.ip?.classList.remove('acik');
  }

  /** Rüzgâr kartı mandala oturunca: rüzgâr eser, yapraklar uçar, Kino'nun kulakları havalanır */
  private async ruzgarEsti() {
    const { oy } = this;
    ses.ruzgar(1.2);
    this.ruzgar.firtina(this.ip, 12);
    const kk = this.el.getBoundingClientRect();
    // ekranın önünden de birkaç yaprak geçer (sorgu perdesinin üstünde)
    if (!AZ_HAREKET && !TEST_MODU)
      for (let i = 0; i < 7; i++) {
        const y = kk.height * (0.25 + Math.random() * 0.55);
        const yp = h('img.dd-yaprak.dd-yaprak-on', { src: resim('v2/yaprak') ?? '', alt: '', draggable: 'false', style: `top:${y.toFixed(0)}px;height:${(26 + Math.random() * 18).toFixed(0)}px` });
        this.efekt.el.append(yp);
        yp.animate(
          [
            { transform: 'translate(-60px, 0) rotate(0deg)', opacity: 0 },
            { transform: `translate(${kk.width * 0.5}px, ${-30 + Math.random() * 60}px) rotate(300deg) rotateX(360deg)`, opacity: 1, offset: 0.5 },
            { transform: `translate(${kk.width + 60}px, ${-20 + Math.random() * 40}px) rotate(620deg) rotateX(720deg)`, opacity: 0 },
          ],
          { duration: 1500 + i * 120, delay: i * 90, easing: 'cubic-bezier(.3,.1,.6,1)', fill: 'both' },
        ).finished.then(() => yp.remove(), () => yp.remove());
      }
    oy.kinoIfade('saskin', 1600);
    // kulaklar rüzgârda havalanır (komik): iskeletin kulakları kalkıp çırpınır
    const t0 = performance.now();
    oy.kinoEkHareket((p, t) => {
      const g = Math.max(0, 1 - (performance.now() - t0) / sure(1700));
      p.kulakSol += (-40 + Math.sin(t * 22) * 14) * g;
      p.kulakSag += (40 + Math.sin(t * 22 + 1) * 14) * g;
      p.kafa += Math.sin(t * 9) * 3 * g;
    });
    oy.minoTepki('gidik');
    await this.bekle(1700);
    oy.kinoEkHareket(null);
    oy.kinoIfade('heyecan', 900);
  }

  /** Halka 1 "demek ki": anı (eski film tonu): ipteki atkı rüzgârla havalanır, uçup gider */
  private async atkiUcar() {
    const { dunya, oy } = this;
    const ani = this.ip.e.ani;
    const atki = ani?.querySelector<HTMLElement>('.dd-ani-atki');
    if (!ani || !atki) return;
    this.adim('canlandir');
    await dunya.git(this.ortala(() => IP.atki.x, () => KADRAJ2.ip, 0.12), 800);
    if (this.kapali) return;
    ani.classList.add('acik');
    await this.bekle(500);
    ses.ruzgar(1);
    this.ruzgar.firtina(this.ip, 8);
    const W = this.ip.W;
    const L = (dx: number, dy: number, r: number, s = 1) => `translate(-50%, -100%) translate(${(dx * W).toFixed(0)}px, ${(dy * ODA_H).toFixed(0)}px) rotate(${r}deg) scale(${s})`;
    await tutar(atki.animate([{ transform: L(0, 0, 0) }, { transform: L(0.004, 0, 9) }, { transform: L(-0.002, 0, -6) }, { transform: L(0.006, -0.005, 14) }], { duration: sure(900), easing: 'ease-in-out', fill: 'forwards' }));
    if (this.kapali) return;
    await tutar(
      atki.animate(
        [
          { transform: L(0.006, -0.005, 14), opacity: 1 },
          { transform: L(0.12, -0.12, 40, 0.9), opacity: 1, offset: 0.45 },
          { transform: L(0.32, -0.08, 80, 0.75), opacity: 0.9, offset: 0.8 },
          { transform: L(0.45, 0.05, 120, 0.6), opacity: 0 },
        ],
        { duration: sure(1500), easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' },
      ),
    );
    ani.classList.remove('acik');
    await this.bekle(350);
    atki.getAnimations().forEach((a) => a.cancel());
    if (this.kapali) return;
    oy.mino.bak(0.4);
    oy.minoTepki('kararsiz', 1.4);
    await oy.soyle(M2.kim_aldi);
  }

  /** Halka 2 şakası: Kino patisini ize koyar, pati izin içinde yüzer: "Benim ayağım minicik!" */
  private async kinoPatisi() {
    const { oy } = this;
    const iz = this.yol.e['ipucu-ordek-izi'];
    if (!iz) return;
    const [x, y] = this.efekt.merkez(iz);
    const kinoH = oy.kinoYer.getBoundingClientRect().height;
    const k = this.el.getBoundingClientRect();
    const sag = x < k.width / 2;
    oy.el.classList.add('dd-onde');
    await oy.git('kino', x + (sag ? 1 : -1) * Math.max(60, kinoH * 0.4), Math.min(k.height - 6, y + kinoH * 0.3), 900, 40);
    if (this.kapali) return;
    oy.kinoOynat('kokla', 900);
    // Kino'nun minik patisi izin içinde (Vaka 1'in köpek pati izi)
    const r = iz.getBoundingClientRect();
    const pati = h('img.dd-kino-pati', { src: resim('ipucu-kopek-pati') ?? '', alt: '', draggable: 'false', style: `left:${x}px;top:${y}px;width:${(r.width * KINO_PATI).toFixed(0)}px` });
    this.efekt.el.append(pati);
    if (!AZ_HAREKET) void pati.animate([{ transform: 'translate(-50%, -50%) scale(1.6)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.9 }], { duration: sure(380), easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'forwards' });
    else pati.style.cssText += ';transform:translate(-50%,-50%);opacity:.9';
    ses.pop();
    oy.kinoIfade('saskin', 1800);
    await oy.soyle(K2.minicik, 'kino');
    oy.minoTepki('gidik');
    await this.bekle(400);
    pati.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: sure(400), fill: 'forwards' }).finished.then(() => pati.remove(), () => pati.remove());
    await oy.don('kino', 800);
    oy.el.classList.remove('dd-onde');
  }

  // ---------------------------------------------------------------- büyüteçle arama (Vaka 1'in kalıbı)
  private aramaBitti: (() => void) | null = null;
  private aramaTemizle: (() => void) | null = null;
  private aranan: Halka2 | null = null;
  private aramaOdasi: Oda | null = null;
  private buyutecGosterildi = false;
  private sonBulus = 0;
  private koklaniyor = false;
  private parmakDur: (() => void) | null = null;
  private dokunZaman = 0;
  private sonIsilti = 0;

  private parmakBirak() {
    this.parmakDur?.();
    this.parmakDur = null;
  }
  private ipucuEl(id: string): HTMLElement | null {
    return this.aramaOdasi?.e[`ipucu-${id}`] ?? null;
  }
  private ipucuTanim(id: string): IpucuTanim | undefined {
    return HALKALAR2.flatMap((hk) => hk.ipuclari).find((t) => t.id === id);
  }

  private ipuclariniBul(hk: Halka2, oda: Oda): Promise<void> {
    const kalan = hk.ipuclari.filter((t) => !this.dosya.goz(hk.id).ipuclari.includes(t.id));
    if (!kalan.length) return Promise.resolve();
    this.adim(`ara-${hk.id}`);
    this.aramaOdasi = oda;
    return new Promise<void>((coz) => {
      this.aramaBitti = coz;
      this.aranan = hk;
      const hedefler: BuyutecHedef[] = kalan.map((t) => ({ id: t.id, yer: () => this.dunya.merkez(this.ipucuEl(t.id)!) }));
      this.buyutec.hedefleriKur(hedefler);
      // aranan ipuçları çıplak gözle de sezilir (soluk gölge, göz kırpan yıldız: dedektif.css); öbür halkalarınkiler görünmez
      for (const t of kalan) this.ipucuEl(t.id)?.classList.add('dd-aranan');
      this.buyutec.goster(true);
      this.buyutec.yenile();
      const r = this.ara.getBoundingClientRect();
      const g = this.guvenli(r.width, r.height);
      if (!this.buyutecGosterildi) {
        this.buyutecGosterildi = true;
        const [mx, my] = this.efekt.merkez(this.oy.mino.el, 0.36, 0.42);
        void this.buyutec.git(mx, my, 0).then(() => this.buyutec.git((g[0] + g[2]) / 2 - r.width * 0.12, (g[1] + g[3]) / 2 - r.height * 0.08, 700));
        this.sonra(900, () => {
          if (this.dosya.goz(hk.id).ipuclari.length || this.kapali) return;
          const lens = this.buyutec.el;
          this.parmakDur = parmak(this.el, () => lens.getBoundingClientRect(), () => {
            const b = lens.getBoundingClientRect();
            return new DOMRect(b.left + b.width * 0.9, b.top + b.height * 0.1, b.width, b.height);
          });
          this.sonra(3600, () => this.parmakBirak());
        });
      } else {
        const gw = g[2] - g[0];
        const gh = g[3] - g[1];
        const adaylar: [number, number][] = [
          [g[0] + gw * 0.5, g[1] + gh * 0.4],
          [g[0] + gw * 0.22, g[1] + gh * 0.4],
          [g[0] + gw * 0.78, g[1] + gh * 0.4],
          [g[0] + gw * 0.5, g[1] + gh * 0.18],
        ];
        const uzaklik = ([x, y]: [number, number]) => Math.min(...hedefler.map((hd) => Math.hypot(hd.yer().x - x, hd.yer().y - y)));
        const [bx, by] = adaylar.reduce((a, b) => (uzaklik(b) > uzaklik(a) ? b : a));
        void this.buyutec.git(bx, by, 500);
      }
      this.sonBulus = performance.now();
      const koku = window.setInterval(() => {
        if (this.kapali || this.koklaniyor) return;
        if (performance.now() - this.sonBulus > YARDIM.koklaSn * 1000) {
          const t = kalan.find((x) => !this.dosya.goz(hk.id).ipuclari.includes(x.id) && !this.buyutec.gorulduMu(x.id));
          if (t) void this.kokla(t);
        }
      }, 1000);
      this.temizlik.push(() => clearInterval(koku));
      this.aramaTemizle = () => clearInterval(koku);
    });
  }

  private yakinlik(hd: BuyutecHedef, oran: number) {
    const el = this.ipucuEl(hd.id);
    el?.style.setProperty('--yakin', oran.toFixed(2));
    const simdi = performance.now();
    if (oran > 0.5 && simdi - this.sonIsilti > 260 - oran * 120) {
      this.sonIsilti = simdi;
      const { x, y, r } = hd.yer();
      const k = this.el.getBoundingClientRect();
      const a = this.ara.getBoundingClientRect();
      this.efekt.isilti(x + a.left - k.left, y + a.top - k.top, r * 1.2);
      ses.isilti(oran);
    }
  }

  private gordu(hd: BuyutecHedef) {
    const el = this.ipucuEl(hd.id);
    if (!el) return;
    el.classList.remove('bt-gizli');
    el.classList.add('dd-goruldu');
    this.buyutec.yenile();
    ses.ting();
    this.parmakBirak();
    const [x, y] = this.efekt.merkez(el);
    this.efekt.halka(x, y, Math.max(40, el.getBoundingClientRect().width * 0.7));
    this.sonBulus = performance.now();
    const b = M.buldun;
    void this.oy.soyle(b[this.bulusSayisi++ % b.length]);
    this.oy.minoTepki('sevinc');
    this.oy.kinoIfade('heyecan', 900);
    clearTimeout(this.dokunZaman);
    this.dokunZaman = window.setTimeout(() => {
      if (this.kapali || !el.classList.contains('dd-goruldu')) return;
      this.parmakBirak();
      this.parmakDur = parmak(this.el, () => el.getBoundingClientRect());
      void this.oy.soyle(M.dokun);
    }, sure(YARDIM.dokunSn * 1000));
    this.zamanlar.push(this.dokunZaman);
  }

  private async dokundu(hd: BuyutecHedef) {
    const el = this.ipucuEl(hd.id);
    const hk = this.aranan;
    const t = this.ipucuTanim(hd.id);
    if (!el || !hk || !t || !el.classList.contains('dd-goruldu')) return;
    this.buyutec.bitir(hd.id);
    clearTimeout(this.dokunZaman);
    this.parmakBirak();
    el.classList.remove('dd-goruldu');
    el.classList.add('dd-alindi');
    this.sonBulus = performance.now();
    this.dosya.ipucuEkle(hk.id, t.id);
    ses.buldun();
    efekt.dogru();
    const [x0, y0] = this.efekt.merkez(el);
    this.efekt.halka(x0, y0, 70);
    const foto = resim(t.foto ?? t.resim) ?? '';
    const goz = this.serit.goz(hk.id);
    const [x1, y1] = this.efekt.merkez(goz);
    const kart = h('div.dd-uc-foto', {}, h('img', { src: foto, alt: '', draggable: 'false' }));
    const kk = this.el.getBoundingClientRect();
    const boy = Math.min(kk.width, kk.height) * 0.36;
    kart.style.width = `${boy}px`;
    kart.style.height = `${boy}px`;
    await this.efekt.ucur(kart, [x0, y0], [kk.width / 2, kk.height * 0.45], { ms: 420, kavis: -30, boy0: 0.35, boy1: 1, don: 4 });
    await this.efekt.ucur(kart, [kk.width / 2, kk.height * 0.45], [x1, y1], { ms: 560, kavis: -60, boy0: 1, boy1: 0.2, don: -12, gecikme: 260 });
    ses.yapis();
    this.serit.ipucu(hk.id, foto);
    if (this.kapali) return;
    if (this.dosya.ipuclariTamam(hk.id)) {
      this.aramaTemizle?.();
      // koklamaya giden Kino geri döner (kart sorusu açılırken önde yürümesin)
      this.koklaIptal();
      this.buyutec.goster(false);
      const c = this.aramaBitti;
      this.aramaBitti = null;
      c?.();
    } else {
      await this.oy.soyle(M.bir_daha);
    }
  }

  /** Koklamaya giden Kino'yu geri çağırır (arama bitince) */
  private koklaIptal() {
    this.koklaNesil++;
    if (!this.koklaniyor) return;
    this.koklaniyor = false;
    this.koku?.remove();
    this.koku = null;
    this.oy.el.classList.remove('dd-onde');
    if (this.aranan && this.el.dataset.adim?.startsWith('kokla-')) this.adim(`ara-${this.aranan.id}`);
    if (!this.kapali) void this.oy.don('kino', 500);
  }
  private koklaNesil = 0;
  private koku: HTMLElement | null = null;

  private async kokla(t: IpucuTanim) {
    const el = this.ipucuEl(t.id);
    if (!el) return;
    this.koklaniyor = true;
    const nesil = ++this.koklaNesil;
    const bitti = () => this.kapali || nesil !== this.koklaNesil;
    const { oy } = this;
    const m = this.dunya.merkez(el);
    const a = this.ara.getBoundingClientRect();
    const k = this.el.getBoundingClientRect();
    const tx = m.x + a.left - k.left;
    const ty = m.y + a.top - k.top;
    const kinoH = oy.kinoYer.getBoundingClientRect().height;
    const sag = tx < k.width / 2;
    const fx = tx + (sag ? 1 : -1) * Math.max(70, kinoH * 0.42);
    const fy = Math.min(k.height - 6, ty + kinoH * 0.38);
    this.adim(`kokla-${t.id}`);
    oy.el.classList.add('dd-onde');
    await oy.git('kino', fx, fy, 900, 50);
    if (bitti()) return;
    oy.kinoOynat('kokla', 1800);
    ses.kokla();
    const koku = h('i.dd-koku', { style: `left:${tx}px;top:${ty}px` });
    this.koku = koku;
    this.efekt.el.append(koku);
    this.sonra(3200, () => koku.remove());
    await oy.soyle(K.kokla, 'kino');
    if (bitti()) return;
    await this.bekle(700);
    if (bitti()) return;
    await oy.don('kino', 800);
    if (bitti()) return;
    oy.el.classList.remove('dd-onde');
    this.koku = null;
    this.sonBulus = performance.now();
    this.koklaniyor = false;
    // adım hâlâ koklamaysa aramaya döner (arama bitip soru açıldıysa onun adımına dokunmaz)
    const hk = this.aranan;
    if (hk && this.el.dataset.adim === `kokla-${t.id}`) this.adim(`ara-${hk.id}`);
  }

  // ---------------------------------------------------------------- Halka 3: renk izi
  private async renkIzi() {
    const { oy, dunya } = this;
    const hk = halka2('renk');
    if (this.kapali) return;
    this.serit.aktif('renk');
    oy.yerlesim('iki');
    const iz = new RenkIzi(YOL_PARCALARI);
    const ilk = iz.siradaki ?? 0;
    dunya.darYakin = null;
    await this.odaya(this.yol, this.ortala(() => YOL_PARCALARI[ilk].x + 0.02, () => hk.kadraj, 0.12), 1);
    if (this.kapali) return;
    // Ada çalıların önünde: boyu bu çekimde Mino'ya göre
    this.ada.boyla(this.minoDunyaW());
    this.ada.kap.classList.add('acik');
    this.ada.k.ekHareket = (p, t) => {
      p.kolSag += Math.sin(t * 1.4) * 4;
    };
    const parcalar = [...this.yol.e.parcalar.querySelectorAll<HTMLElement>('.dd-parca')];
    this.yol.e.parcalar.classList.add('acik');
    // Mino sorar; Kino önce yanılır, sonra kendini düzeltir (parçalara bu arada da dokunulabilir)
    const tanit = (async () => {
      await oy.soyle(M2.renk);
      if (this.kapali || iz.bitti) return;
      oy.kinoPoz('isaret');
      oy.kinoIfade('heyecan', 900);
      const k = oy.soyle(K2.mavi, 'kino');
      this.sonra(700, () => {
        oy.kinoPoz('dusun');
        oy.kinoIfade('saskin', 900);
      });
      await k;
      oy.kinoPoz('kalk');
      oy.kinoOynat('sevin', 600);
      await this.bekle(500);
      oy.kinoPoz(null);
    })();
    this.adim('renk-izi');
    this.el.classList.add('dd-sahne-is');
    await new Promise<void>((coz) => {
      let son = performance.now();
      let mesgul = false;
      let titreyen: HTMLElement | null = null;
      let dur: (() => void) | null = null;
      let ipucuSayisi = 0;
      const sakin = () => {
        son = performance.now();
        titreyen?.classList.remove('dd-titre');
        titreyen = null;
        dur?.();
        dur = null;
      };
      const kameraSiradaki = () => {
        const i = iz.siradaki;
        if (i === null || !this.dar()) return;
        const el = parcalar[i];
        const r = el.getBoundingClientRect();
        const k = this.el.getBoundingClientRect();
        const x = r.left - k.left + r.width / 2;
        if (Math.abs(x - k.width / 2) < k.width * 0.22) return;
        void dunya.git(this.ortala(() => YOL_PARCALARI[i].x + 0.03, () => hk.kadraj, 0.12), 700);
      };
      // telefon dönünce sıradaki kırmızı yeniden kadraja alınır
      this.boyutSonrasi = kameraSiradaki;
      const tikla = async (e: Event) => {
        const el = e.currentTarget as HTMLElement;
        const i = Number(el.dataset.parca);
        if (mesgul || el.classList.contains('dd-alindi') || el.classList.contains('dd-gitti')) return;
        sakin();
        const p = YOL_PARCALARI[i];
        const r = iz.dokun(i);
        const [x, y] = this.efekt.merkez(el);
        if (p.tur === 'kirmizi') {
          el.classList.add('dd-alindi');
          ses.iz(izNotasi(r.sira * 2));
          this.efekt.parilti(x, y, 6, 0.6);
          void pop(el.querySelector('img'), 1.4);
          oy.minoTepki(r.sira % 2 ? 'evet' : 'sevinc');
          if (r.bitti) {
            el.removeEventListener('click', h1);
            bitir();
            return;
          }
          kameraSiradaki();
        } else if (p.tur === 'yaprak') {
          // yaprak rüzgârla uçup gider (bir şey olmaz)
          el.classList.add('dd-gitti');
          ses.ruzgar(0.4);
          if (!AZ_HAREKET) void el.animate([{ transform: `translate(-50%, -50%) rotate(${p.don}deg)`, opacity: 1 }, { transform: `translate(-50%, -50%) translate(${200 + Math.random() * 120}px, -${160 + Math.random() * 100}px) rotate(400deg)`, opacity: 0 }], { duration: sure(1100), easing: 'cubic-bezier(.3,.1,.6,1)', fill: 'forwards' });
        } else {
          // mavi: kamera kısa bir an Ada'ya kayar; Ada balonunu sallar
          el.classList.add('dd-soluk-parca');
          mesgul = true;
          await this.adaGoster();
          mesgul = false;
          son = performance.now();
        }
      };
      const h1 = (e: Event) => void tikla(e);
      parcalar.forEach((el) => el.addEventListener('click', h1));
      // yardım: 7 sn dokunulmazsa sıradaki kırmızı hafifçe titrer; bir daha geçerse parmak gösterir
      const yardim = window.setInterval(() => {
        if (this.kapali || mesgul) return;
        if (performance.now() - son > YARDIM.surukleSn * 1000) {
          const i = iz.siradaki;
          if (i === null) return;
          son = performance.now();
          kameraSiradaki();
          titreyen = parcalar[i];
          oynat(titreyen, 'dd-titre');
          if (++ipucuSayisi >= 2 && !dur) dur = parmak(this.el, () => parcalar[i].getBoundingClientRect());
        }
      }, 500);
      const bitir = () => {
        clearInterval(yardim);
        sakin();
        parcalar.forEach((el) => el.removeEventListener('click', h1));
        this.boyutSonrasi = null;
        coz();
      };
      this.temizlik.push(() => clearInterval(yardim));
    });
    this.el.classList.remove('dd-sahne-is');
    await tanit;
    if (this.kapali) return;
    // bütün kırmızılar yanar: iz gölete gider
    for (const [i, el] of parcalar.entries()) if (YOL_PARCALARI[i].tur === 'kirmizi') this.sonra(i * 80, () => oynat(el, 'dd-sec'));
    await this.bekle(500);
    await demekGoster(this.ortak, hk.demekResim, hk.demekKi, this.serit.goz('renk'));
    if (this.kapali) return;
    this.dosya.demekEkle('renk');
    this.serit.demek('renk');
    this.adim('demek-renk');
  }

  /** Mavi ipe dokunuldu: kamera Ada'ya kayar, Ada balonunu sallar: "O benim balonumun ipi!" */
  private async adaGoster() {
    const { dunya, oy } = this;
    // (işlevler: telefon dönünce yeni yöne göre yeniden kurulur)
    const adaya = this.ortala(() => ADA_YERI.x, () => [0, 0.42, 1, 1], 0.12);
    const kd = (): Kadraj => (this.dar() ? adaya() : [0.1, 0.42, 0.55, 1]);
    this.adim('ada');
    await dunya.git(kd, 700);
    if (this.kapali) return;
    oynat(this.balon, 'dd-balon-salla');
    if (!AZ_HAREKET) void this.ada.k.oynat('sevin', 1200);
    this.ada.k.ifade('mutlu', 1800);
    oy.konukBagla(this.ada.k, this.ada.kutu, 0.04);
    await oy.soyle(G2.ada, 'ada');
    oy.konukBagla(null, this.ada.kutu);
    if (this.kapali) return;
    const iz = YOL_PARCALARI.findIndex((p, i) => p.tur === 'kirmizi' && !this.yol.e.parcalar.querySelector(`[data-parca="${i}"]`)?.classList.contains('dd-alindi'));
    // dar ekranda sıradaki kırmızıya (kalmadıysa Ada'ya) döner; genişte halkanın kadrajı
    const hedef = this.ortala(() => (iz >= 0 ? YOL_PARCALARI[iz].x + 0.02 : ADA_YERI.x), () => halka2('renk').kadraj, 0.12);
    await dunya.git(hedef, 700);
    this.adim('renk-izi');
  }

  // ---------------------------------------------------------------- Halka 4: ses ipucu
  private async sesIpucu(dogrudan: boolean) {
    const { oy, dunya } = this;
    if (this.kapali) return;
    this.serit.aktif('ses');
    oy.yerlesim('iki', 'kenar');
    dunya.darYakin = null;
    const soru = new SesSorusu(CALILAR);
    const calilar = CALILAR.map((_, i) => this.golet.e[`cali-${i}`]);
    const kd = (i: number) => this.ortala(() => (CALILAR[i].x0 + CALILAR[i].x1) / 2, () => KADRAJ2.calilar, 0.1);
    if (dogrudan) dunya.kur(this.golet, kd(0));
    else await this.odaya(this.golet, kd(0), 1);
    if (this.kapali) return;
    // kırmızı iz burada biter
    this.golet.e.son.classList.add('acik');
    this.golet.e.son.querySelectorAll('.dd-parca').forEach((p, i) => this.sonra(200 + i * 160, () => (p.classList.add('dd-alindi'), ses.iz(izNotasi(12 + i)))));
    void oy.soyle(M2.dinle);
    this.adim('ses-dinle');
    this.el.classList.add('dd-sahne-is');
    calilar.forEach((c) => c.classList.add('acik'));
    await new Promise<void>((coz) => {
      let son = performance.now();
      let dur: (() => void) | null = null;
      let mesgul = false;
      const tikla = async (e: Event) => {
        const c = e.currentTarget as HTMLElement;
        const i = Number(c.dataset.cali);
        if (mesgul) return;
        dur?.();
        dur = null;
        son = performance.now();
        mesgul = true;
        this.caliSalla(c);
        caliSesi(CALILAR[i].ses);
        soru.dinle(i);
        c.classList.add('dinlendi');
        await this.bekle(soru.hepsiDinlendi ? 1100 : 700);
        mesgul = false;
        if (this.kapali) return;
        if (soru.hepsiDinlendi) {
          calilar.forEach((x) => x.removeEventListener('click', h1));
          clearInterval(yardim);
          coz();
          return;
        }
        // dikeyde kamera sıradaki dinlenmemiş çalıya kayar
        const j = soru.siradaki;
        if (j !== null && this.dar()) void dunya.git(kd(j), 800);
      };
      const h1 = (e: Event) => void tikla(e);
      calilar.forEach((c) => c.addEventListener('click', h1));
      const yardim = window.setInterval(() => {
        if (this.kapali || mesgul || dur) return;
        if (performance.now() - son > YARDIM.surukleSn * 1000) {
          const j = soru.siradaki;
          if (j === null) return;
          if (this.dar()) void dunya.git(kd(j), 600);
          dur = parmak(this.el, () => calilar[j].querySelector('.dd-cali-kopya')?.getBoundingClientRect() ?? null);
        }
      }, 500);
      this.temizlik.push(() => clearInterval(yardim));
    });
    this.el.classList.remove('dd-sahne-is');
    calilar.forEach((c) => c.classList.remove('acik'));
    if (this.kapali) return;
    // dikeyde çalılar sırayla gösterildi; soru katmanında üçünün fotoğrafı yan yana
    if (this.dar()) void dunya.git(kd(1), 700);
    this.adim('soru-ses');
    await sesSorgu({ ...this.ortak, goz: () => this.serit.goz('ses') });
    if (this.kapali) return;
    this.dosya.demekEkle('ses');
    this.serit.demek('ses');
    ses.muhur();
    this.adim('demek-ses');
    await this.caliArala();
  }

  /** Çalı dokununca kabarır, yaprakları savrulur (kopya hep ≥ 1 ölçek: altındaki boyalı çalı görünmez) */
  private caliSalla(c: HTMLElement) {
    const k = c.querySelector<HTMLElement>('.dd-cali-kopya');
    ses.hisirti();
    if (!k || AZ_HAREKET) return;
    void k.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(1.04, 1.02)', offset: 0.18 },
        { transform: 'scale(1.015, 1.045)', offset: 0.4 },
        { transform: 'scale(1.035, 1.015)', offset: 0.62 },
        { transform: 'scale(1.01, 1.02)', offset: 0.82 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: sure(720), easing: 'ease-in-out' },
    );
    const [x, y] = this.efekt.merkez(k ?? c, 0.5, 0.2);
    this.efekt.parilti(x, y, 4, 0.5);
  }

  /** "Demek ki ördek bu çalının arkasında!": çocuk çalıyı kenara çeker (sürükler ya da dokunur); arkasında Vakvak Anne */
  private async caliArala() {
    const { oy, dunya } = this;
    const c3 = this.golet.e['cali-2'];
    const sol = this.golet.e.yarimSol;
    const sag = this.golet.e.yarimSag;
    oy.yerlesim('iki', 'kenar');
    await dunya.git(this.finalKadraj(), 900);
    if (this.kapali) return;
    // Vakvak Anne'nin boyu bu çekimde (final de aynı çekim)
    this.ordek.boyla(this.minoDunyaW());
    this.yuvaBoyla();
    this.adim('arala');
    this.el.classList.add('dd-sahne-is');
    c3.classList.add('acik', 'dd-aralanacak');
    void oy.soyle(M2.arala);
    const k3 = c3.querySelector<HTMLElement>('.dd-cali-kopya')!;
    await new Promise<void>((coz) => {
      let dur: (() => void) | null = null;
      const goster = () =>
        (dur = parmak(this.el, () => k3.getBoundingClientRect(), () => {
          const b = k3.getBoundingClientRect();
          return new DOMRect(b.left + b.width * 0.75, b.top, b.width, b.height);
        }));
      let z = window.setTimeout(goster, sure(4000));
      this.zamanlar.push(z);
      let s: { id: number; x0: number } | null = null;
      // sürüklerken çalı parmağın yönüne hafifçe eğilir (dokunuş hissi); bırakınca aralanır
      const bas = (e: PointerEvent) => {
        s = { id: e.pointerId, x0: e.clientX };
        k3.setPointerCapture?.(e.pointerId);
        clearTimeout(z);
        dur?.();
        dur = null;
        ses.hisirti();
      };
      const kimilda = (e: PointerEvent) => {
        if (!s || e.pointerId !== s.id) return;
        const dx = Math.max(-60, Math.min(60, e.clientX - s.x0));
        k3.style.transform = `rotate(${(dx * 0.08).toFixed(2)}deg) scale(1.02)`;
      };
      const birak = (e: PointerEvent) => {
        if (!s || e.pointerId !== s.id) return;
        s = null;
        k3.style.transform = '';
        k3.removeEventListener('pointerdown', bas);
        k3.removeEventListener('pointermove', kimilda);
        k3.removeEventListener('pointerup', birak);
        k3.removeEventListener('pointercancel', birak);
        clearTimeout(z);
        coz();
      };
      k3.addEventListener('pointerdown', bas);
      k3.addEventListener('pointermove', kimilda);
      k3.addEventListener('pointerup', birak);
      k3.addEventListener('pointercancel', birak);
      this.temizlik.push(() => clearTimeout(z));
    });
    this.el.classList.remove('dd-sahne-is');
    if (this.kapali) return;
    // çalı ikiye ayrılır, yarımlar yana açılır; arkasında yuvada Vakvak Anne
    const bw = k3.getBoundingClientRect().width / Math.max(0.05, dunya.olcek);
    const [ux, uy] = this.efekt.merkez(k3, 0.5, 0.35);
    c3.classList.remove('dd-aralanacak', 'acik');
    c3.classList.add('dd-gizli');
    this.golet.e.yarimlar.classList.add('acik');
    ses.hisirti();
    ses.ruzgar(0.4);
    void this.ordekPoz.goster('ordek-kulucka');
    this.ordek.kap.classList.add('acik');
    this.yuvaKap.classList.add('acik');
    // yarımlar yana açılır ve yaprak savrularak söner: arkada boyalı çalı kalır, Vakvak Anne onun önünde (çalının içinde)
    const ac = (el: HTMLElement, yon: 1 | -1) =>
      AZ_HAREKET
        ? ((el.style.opacity = '0'), null)
        : el.animate(
            [
              { transform: 'translateX(0) rotate(0)', opacity: 1 },
              { transform: `translateX(${yon * bw * 0.16}px) rotate(${yon * 7}deg)`, opacity: 1, offset: 0.45 },
              { transform: `translateX(${yon * bw * 0.26}px) rotate(${yon * 11}deg)`, opacity: 0 },
            ],
            { duration: sure(820), easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' },
          );
    const a1 = ac(sol, -1);
    const a2 = ac(sag, 1);
    this.ruzgar.firtina(this.golet, 5);
    this.efekt.parilti(ux, uy, 8, 0.7);
    if (!AZ_HAREKET) void this.ordek.kap.animate([{ transform: 'translate(-50%, calc(var(--taban) * -1)) scale(0.9, 1.08)', opacity: 0 }, { transform: 'translate(-50%, calc(var(--taban) * -1)) scale(1.05, 0.96)', opacity: 1, offset: 0.55 }, { transform: 'translate(-50%, calc(var(--taban) * -1))', opacity: 1 }], { duration: sure(620), delay: sure(160), easing: 'cubic-bezier(.3,.8,.4,1)', fill: 'backwards' });
    this.temizle(muzikCal('film-surpriz', 0.45));
    await Promise.all([tutar(a1), tutar(a2)]);
    if (this.kapali) return;
    const [x, y] = this.efekt.merkez(this.ordek.kap, 0.5, 0.5);
    this.efekt.parilti(x, y, 10, 0.8);
    oy.kinoIfade('saskin', 1600);
    oy.minoTepki('sasir');
    ses.vakvak(false, false);
    this.adim('ordek');
    await this.bekle(500);
  }

  /** Final çekimi: yuva ortada (dikeyde yuva biraz sağda: Vakvak Anne solunda, Kino sağ önde) */
  private finalKadraj(): () => Kadraj {
    // dikeyde yakın (gök yarım ekranı kaplamasın): yuva, Vakvak Anne ve çalı ekranı doldurur (yalnız dar ekranda etkili)
    this.dunya.darYakin = 1.5;
    // (işlev: genişte final kadrajı aynen; telefon dönünce yeni yöne göre yeniden kurulur)
    return this.ortala(() => YUVA.x - 0.03, () => KADRAJ2.final, 0.1);
  }

  /** Bahçe dönüşte yeniden dizildi: vakanın dünyaya koyduğu Ada, Vakvak Anne ve yuva yeni yerlerine */
  private dunyadakileriDiz() {
    const W = odaW('bahce-yol');
    const WG = odaW('bahce-golet');
    for (const [el, x, y, w] of [
      [this.ada.kap, ADA_YERI.x, ADA_YERI.y, W],
      [this.ordek.kap, YUVA.x, YUVA.y, WG],
      [this.yuvaKap, YUVA.x, YUVA.y, WG],
    ] as const) {
      el.style.left = px(x * w);
      el.style.top = px(y * ODA_H);
    }
    // boyları da yeni çekimde Mino'ya göre (ilk açılıştaki gibi); kamera yerleşince
    requestAnimationFrame(() => {
      if (this.kapali) return;
      if (this.ada.kap.classList.contains('acik')) this.ada.boyla(this.minoDunyaW());
      if (this.ordek.kap.classList.contains('acik')) {
        this.ordek.boyla(this.minoDunyaW());
        this.yuvaBoyla();
      }
    });
  }

  /** Finalde Kino'nun önündeki atkı (ekran px) dönünce yine Kino'nun önünde ve ekranın içinde */
  private atkiSigdir() {
    const a = this.atkiTasi;
    if (!a?.isConnected || a.classList.contains('dd-tutuldu')) return;
    const kk = this.el.getBoundingClientRect();
    const w = a.getBoundingClientRect().width || 100;
    const [kx0, ky0] = this.efekt.merkez(this.oy.kinoYer, this.dar() ? 0.2 : 0.45, 0.82);
    a.style.left = px(Math.max(w * 0.6 + 8, Math.min(kk.width - w * 0.6 - 8, kx0)));
    a.style.top = px(Math.min(kk.height - w * 0.4 - 8, ky0));
  }

  /** Yuvanın, atkının ve yavruların boyu: Vakvak Anne'nin kutusuna göre */
  private yuvaBoyla() {
    const w = this.ordek.w;
    this.yuvaKap.style.width = px(w * 0.78);
    this.yuvaKap.style.height = px(w * 0.78);
  }

  // ---------------------------------------------------------------- Halka 5: sıralama
  private async siralama(dogrudan: boolean) {
    const { oy, dunya } = this;
    if (this.kapali) return;
    this.serit.aktif('sira');
    if (dogrudan) await this.yuvaHazir();
    oy.yerlesim('iki', 'kenar');
    // Kino öfkeli ama sevimli: ayağını yere vurur
    this.adim('sen-mi');
    oy.kinoPoz('isaret');
    oy.kinoIfade('saskin', 1800);
    void oy.zipla('kino', 8, 380);
    this.sonra(420, () => void oy.zipla('kino', 8, 380));
    await oy.soyle(K2.sen_mi, 'kino');
    oy.kinoPoz(null);
    if (this.kapali) return;
    // Vakvak Anne (yuvada) anlatır: başı hafifçe sallanır
    oy.konukBagla(null, this.ordek.kutu, 0.12);
    this.ordek.kap.classList.add('dd-anlatiyor');
    await oy.soyle(O2.buldum, 'ordek');
    this.ordek.kap.classList.remove('dd-anlatiyor');
    oy.kinoIfade('uzgun', 1600);
    if (this.kapali) return;
    void dunya;
    this.adim('soru-sira');
    await siraSorgu({ ...this.ortak, gozler: () => ['ne', 'kim', 'renk'].map((id) => this.serit.goz(id)), goz: () => this.serit.goz('sira') });
    if (this.kapali) return;
    this.dosya.demekEkle('sira');
    this.serit.demek('sira');
    ses.muhur();
    this.adim('demek-sira');
  }

  /** Test kısayolu: gölette, çalı aralanmış, Vakvak Anne yuvada */
  private async yuvaHazir() {
    const { dunya } = this;
    if (dunya.oda !== this.golet) dunya.kur(this.golet, this.finalKadraj());
    else await dunya.git(this.finalKadraj(), 0);
    this.ordek.boyla(this.minoDunyaW());
    this.yuvaBoyla();
    this.golet.e['cali-2'].classList.add('dd-gizli');
    this.golet.e.yarimlar.classList.add('acik', 'dd-acik-kal');
    void this.ordekPoz.goster('ordek-kulucka');
    this.ordek.kap.classList.add('acik');
    this.yuvaKap.classList.add('acik');
  }

  // ---------------------------------------------------------------- final: yavrular üşümesin
  private async final(dogrudan: boolean) {
    const { oy, dunya } = this;
    if (this.kapali) return;
    this.serit.aktif(null);
    this.adim('final');
    if (dogrudan) await this.yuvaHazir();
    else await dunya.git(this.finalKadraj(), 700);
    if (this.kapali) return;
    oy.yerlesim('iki', 'kenar');
    const w = this.ordek.w;
    // 1) Vakvak Anne kalkar: yuvadan çıkar (yumurtalar açıkta), gagasında atkı, Kino'ya doğru
    this.yuva.classList.add('acik');
    await this.ordekPoz.goster('ordek-atki');
    const yana = this.dar() ? -w * 0.42 : -w * 0.7;
    const geri = this.dar() ? -w * 0.1 : -w * 0.04;
    if (!AZ_HAREKET) void this.ordek.k.oynat('yuru', 900);
    await tutar(this.ordek.kutu.animate([{ transform: 'translate(0, 0)' }, { transform: `translate(${yana * 0.5}px, ${geri - 10}px)`, offset: 0.5 }, { transform: `translate(${yana}px, ${geri}px)` }], { duration: sure(AZ_HAREKET ? 10 : 900), easing: 'cubic-bezier(.45,.1,.4,1)', fill: 'forwards' }));
    if (this.kapali) return;
    // atkı Kino'ya uzatılır: gagadan Kino'nun önüne uçar
    const kk = this.el.getBoundingClientRect();
    const [gx, gy] = this.efekt.merkez(this.ordek.kutu, 0.3, 0.45);
    const atkiW = Math.min(kk.width * 0.3, oy.kinoYer.getBoundingClientRect().width * (this.dar() ? 1.1 : 0.85));
    // atkı Kino'nun önüne (dikeyde Kino kenarda: atkı hep ekranın içinde, Kino'nun hemen solunda)
    // (yatayda Kino'nun hemen solunda, yerde: Kino'nun yüzünü örtmez; atkı bütünüyle ekranda)
    const [ax, ay] = oy.ayak(oy.kinoYer);
    const kinoW = oy.kinoYer.getBoundingClientRect().width;
    const [kx0, ky0] = this.dar() ? this.efekt.merkez(oy.kinoYer, 0.2, 0.82) : [ax - kinoW * 0.62, ay - atkiW * 0.12];
    const kx = Math.max(atkiW * 0.6 + 8, Math.min(kk.width - atkiW * 0.6 - 8, kx0));
    const ky = Math.min(kk.height - atkiW * 0.4 - 8, ky0);
    const atki = h('div.dd-atki-tasi', { style: `width:${px(atkiW)}` }, h('img', { src: resim('v2/atki-yerde') ?? '', alt: '', draggable: 'false' }));
    void this.ordekPoz.birak();
    ses.kart();
    await this.efekt.ucur(h('img.dd-atki-ucan', { src: resim('v2/atki-yerde') ?? '', alt: '', draggable: 'false', style: `width:${px(atkiW)}` }), [gx, gy], [kx, ky], { ms: 620, kavis: -70, boy0: 0.6, boy1: 1, don: 8 });
    atki.style.left = px(kx);
    atki.style.top = px(ky);
    this.el.append(atki);
    this.atkiTasi = atki;
    oy.kinoIfade('heyecan', 900);
    if (this.kapali) return;
    // 2) yumurtalar açıkta titrer
    this.adim('titriyor');
    this.yuva.classList.add('dd-titriyor');
    const brr = window.setInterval(() => !this.kapali && ses.brr(), 1300);
    this.temizlik.push(() => clearInterval(brr));
    ses.brr();
    oy.minoTepki('kararsiz', 1.4);
    await oy.soyle(M2.titriyor);
    if (this.kapali) return;
    // Kino durur, yumurtalara bakar: üzgün → şefkatli
    await oy.kinoPozu.goster('kino-uzgun');
    await this.bekle(900);
    if (this.kapali) return;
    void oy.kinoPozu.goster('kino-sarilma');
    await oy.soyle(K2.usumesin, 'kino');
    void oy.kinoPozu.birak();
    if (this.kapali) return;
    // 3) atkıyı yumurtaların üstüne sürükle
    this.adim('atki-ort');
    this.el.classList.add('dd-sahne-is');
    void oy.soyle(M2.ort);
    await this.atkiOrt(atki);
    clearInterval(brr);
    this.yuva.classList.remove('dd-titriyor');
    if (this.kapali) return;
    // 4) yumurtalara üç kez dokun: çıt… çıt… ÇAT!
    this.adim('yumurta');
    void oy.soyle(M2.dokun_yumurta);
    await this.catlat();
    this.el.classList.remove('dd-sahne-is');
    if (this.kapali) return;
    // 5) yavrulardan biri Kino'nun burnunu gagalar
    this.adim('yavrular');
    oy.kinoIfade('saskin', 1200);
    if (!AZ_HAREKET) void this.yavrular.animate([{ transform: 'translate(-50%, -100%)' }, { transform: 'translate(-46%, -100%) rotate(6deg)', offset: 0.3 }, { transform: 'translate(-50%, -100%)', offset: 0.5 }, { transform: 'translate(-46%, -100%) rotate(6deg)', offset: 0.75 }, { transform: 'translate(-50%, -100%)' }], { duration: sure(700), easing: 'ease-in-out' });
    ses.pop();
    this.sonra(300, () => ses.pop());
    const [nx, ny] = this.efekt.merkez(oy.kino.el, 0.5, 0.46);
    this.efekt.parilti(nx, ny, 6, 0.5);
    void oy.zipla('kino', 10, 420);
    await this.bekle(700);
    oy.kinoIfade('heyecan', 1600);
    oy.kinoOynat('sevin', 900);
    // 6) Vakvak Anne teşekkür eder
    oy.konukBagla(this.ordek.k, this.ordek.kutu, 0.08);
    this.ordek.k.ifade('mutlu', 2400);
    await oy.soyle(O2.tesekkur, 'ordek');
    oy.konukBagla(null, this.ordek.kutu);
    if (this.kapali) return;
    // 7) "Vaka çözüldü! Ben hediye ettim!": konfeti, müzik; yavrular Kino'nun arkasından paytak paytak
    oy.kinoPoz('kalk');
    oy.kinoIfade('heyecan', 2400);
    oy.kinoOynat('sevin', 1200);
    void oy.zipla('kino', 24);
    oy.minoTepki('dans');
    this.temizle(muzikCal('film-kutlama', 0.5));
    const r = this.el.getBoundingClientRect();
    if (!AZ_HAREKET) konfetiPatlat(this.el, r.width / 2, r.height * 0.3, 90);
    this.yavrularYuru();
    await oy.soyle(K2.cozuldu, 'kino');
    oy.kinoPoz(null);
    if (this.kapali) return;
    if (resim('poz-mino-rahat')) {
      await this.bekle(150);
      void oy.minoPoz.goster('mino-rahat');
      const [mx, my] = this.efekt.merkez(oy.mino.el, 0.5, 0.15);
      this.sonra(300, () => this.efekt.parilti(mx, my, 6, 0.6));
      await this.bekle(1600);
      if (this.kapali) return;
      await oy.minoPoz.birak();
    }
  }

  /** Atkıyı yumurtaların üstüne sürükle (dokunmak da olur): atkı yuvaya uçar, örter; titreme durur */
  private atkiOrt(atki: HTMLElement): Promise<void> {
    const hedef = this.yuvaKap;
    return new Promise<void>((coz) => {
      let dur: (() => void) | null = null;
      let z = window.setTimeout(() => (dur = parmak(this.el, () => atki.getBoundingClientRect(), () => hedef.getBoundingClientRect())), sure(4000));
      this.zamanlar.push(z);
      let s: { id: number; x0: number; y0: number; ox: number; oy: number; tasindi: boolean } | null = null;
      const yakin = (x: number, y: number) => {
        const b = hedef.getBoundingClientRect();
        const p = Math.max(50, b.width * 0.45);
        return Math.hypot(x - (b.left + b.width / 2), y - (b.top + b.height * 0.6)) < b.width * 0.5 + p;
      };
      const ort = async () => {
        atki.removeEventListener('pointerdown', bas);
        window.removeEventListener('pointermove', kimilda);
        window.removeEventListener('pointerup', birak);
        clearTimeout(z);
        dur?.();
        hedef.classList.remove('dd-uzerinde');
        // atkı yuvanın üstüne uçar ve örtülür
        const a = atki.getBoundingClientRect();
        const kk = this.el.getBoundingClientRect();
        const b = this.atkiUst.getBoundingClientRect();
        atki.remove();
        await this.efekt.ucur(h('img.dd-atki-ucan', { src: resim('v2/atki-yerde') ?? '', alt: '', draggable: 'false', style: `width:${px(a.width)}` }), [a.left - kk.left + a.width / 2, a.top - kk.top + a.height / 2], [b.left - kk.left + b.width / 2, b.top - kk.top + b.height / 2], {
          ms: 420,
          kavis: -60,
          boy1: Math.max(0.3, b.width / Math.max(1, a.width)),
          don: -6,
        });
        this.atkiUst.classList.add('acik');
        if (!AZ_HAREKET) void this.atkiUst.animate([{ transform: 'translate(-50%, -100%) scale(1.08, 0.9)' }, { transform: 'translate(-50%, -100%) scale(0.97, 1.04)', offset: 0.5 }, { transform: 'translate(-50%, -100%)' }], { duration: sure(480), easing: 'cubic-bezier(.3,.8,.4,1)' });
        ses.sicak();
        efekt.dogru();
        const [x, y] = this.efekt.merkez(this.atkiUst);
        this.efekt.halka(x, y, Math.max(60, b.width * 0.4));
        this.oy.minoTepki('saril');
        this.oy.kinoIfade('heyecan', 1200);
        await this.bekle(600);
        coz();
      };
      const bas = (e: PointerEvent) => {
        clearTimeout(z);
        dur?.();
        dur = null;
        const a = atki.getBoundingClientRect();
        s = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ox: e.clientX - (a.left + a.width / 2), oy: e.clientY - (a.top + a.height / 2), tasindi: false };
        atki.classList.add('dd-tutuldu');
        ses.kart();
      };
      const kimilda = (e: PointerEvent) => {
        if (!s || e.pointerId !== s.id) return;
        if (Math.hypot(e.clientX - s.x0, e.clientY - s.y0) > 8) s.tasindi = true;
        atki.style.translate = `${(e.clientX - s.x0).toFixed(0)}px ${(e.clientY - s.y0).toFixed(0)}px`;
        hedef.classList.toggle('dd-uzerinde', yakin(e.clientX, e.clientY));
      };
      const birak = async (e: PointerEvent) => {
        if (!s || e.pointerId !== s.id) return;
        const { tasindi } = s;
        s = null;
        atki.classList.remove('dd-tutuldu');
        if (!tasindi || yakin(e.clientX, e.clientY)) {
          await ort();
          return;
        }
        // uzakta bırakıldı: yerine süzülür
        const t = atki.style.translate || '0px 0px';
        await tutar(atki.animate([{ translate: t }, { translate: '0px 0px' }], { duration: sure(380), easing: 'cubic-bezier(.3,1.2,.5,1)' }));
        atki.style.translate = '';
        hedef.classList.remove('dd-uzerinde');
        z = window.setTimeout(() => (dur = parmak(this.el, () => atki.getBoundingClientRect(), () => hedef.getBoundingClientRect())), sure(3000));
        this.zamanlar.push(z);
      };
      atki.addEventListener('pointerdown', bas);
      window.addEventListener('pointermove', kimilda);
      window.addEventListener('pointerup', (e) => void birak(e));
      this.temizlik.push(() => window.removeEventListener('pointermove', kimilda));
    });
  }

  /** Yumurtalara üç kez dokun: çıt… çıt… ÇAT! Atkılı üç yavru çıkar */
  private catlat(): Promise<void> {
    const dokun = this.yuvaKap.querySelector<HTMLElement>('.dd-yuva-dokun')!;
    dokun.classList.add('acik');
    return new Promise<void>((coz) => {
      let n = 0;
      let dur: (() => void) | null = null;
      let z = 0;
      const bekletme = () => {
        clearTimeout(z);
        z = window.setTimeout(() => (dur = parmak(this.el, () => this.yuvaKap.getBoundingClientRect())), sure(3500));
        this.zamanlar.push(z);
      };
      bekletme();
      const tik = async () => {
        if (n >= CATLAMA) return;
        dur?.();
        dur = null;
        n++;
        const ic = this.yuvaKap.querySelector<HTMLElement>('.dd-yuva-ic')!;
        const [x, y] = this.efekt.merkez(this.atkiUst, 0.5, 0.45);
        if (n < CATLAMA) {
          ses.cit(n);
          if (!AZ_HAREKET) void ic.animate([{ transform: 'rotate(0)' }, { transform: `rotate(${-2 - n}deg)` }, { transform: `rotate(${2 + n}deg)` }, { transform: 'rotate(0)' }], { duration: sure(360), easing: 'ease-in-out' });
          this.efekt.parilti(x, y, 3 + n * 2, 0.4 + n * 0.12);
          this.oy.kinoIfade('heyecan', 700);
          bekletme();
          return;
        }
        // ÇAT!
        clearTimeout(z);
        dokun.classList.remove('acik');
        ses.cat();
        this.efekt.sars(3);
        this.efekt.halka(x, y, 90);
        oynat(this.el, 'dd-vaka-flas');
        this.yuva.classList.add('dd-gitti');
        this.atkiUst.classList.add('dd-gitti');
        this.yavrular.classList.add('acik');
        if (!AZ_HAREKET) void this.yavrular.animate([{ transform: 'translate(-50%, -100%) scale(0.8, 1.12)', opacity: 0 }, { transform: 'translate(-50%, -100%) scale(1.06, 0.94)', opacity: 1, offset: 0.45 }, { transform: 'translate(-50%, -100%) scale(0.98, 1.02)', offset: 0.75 }, { transform: 'translate(-50%, -100%)', opacity: 1 }], { duration: sure(620), easing: 'cubic-bezier(.3,.8,.4,1)' });
        this.temizle(muzikCal('film-surpriz', 0.45));
        this.oy.minoTepki('sevinc');
        await this.bekle(900);
        coz();
      };
      dokun.addEventListener('click', () => void tik());
    });
  }

  /** Yavrular sıra olup Kino'ya doğru paytak paytak (yalnız transform) */
  private yavrularYuru() {
    if (AZ_HAREKET) return;
    // Kino sağda: yavrular ona doğru birkaç paytak adım (dikeyde Kino yakında: daha kısa)
    const w = this.ordek.w * (this.dar() ? 0.1 : 0.22);
    const adim = (i: number) => `translate(calc(-50% + ${(w * i).toFixed(0)}px), -100%)`;
    const kf: Keyframe[] = [];
    for (let i = 0; i <= 6; i++) {
      kf.push({ transform: `${adim(i * 0.5)} rotate(${i % 2 ? 5 : -5}deg)`, offset: i / 6 });
    }
    void this.yavrular.animate(kf, { duration: sure(2400), easing: 'ease-in-out', fill: 'forwards' });
  }

  // ---------------------------------------------------------------- ödül: çizgi roman
  private async roman() {
    if (this.kapali) return;
    this.adim('roman');
    this.fon.durdur();
    for (const hk of HALKALAR2)
      if (!this.dosya.goz(hk.id).demek) {
        this.dosya.demekEkle(hk.id);
        this.serit.demek(hk.id);
      }
    const r = romanKur(ROMAN2, V2.vaka, 'vaka2');
    this.el.append(r.el);
    // çocuğun dizdiği üç kare dosyanın son gözünden, dördüncüsü (kuluçka) yuvadan uçar
    const g = this.serit.goz('sira');
    const kaynaklar = [g, g, g, this.yavrular.classList.contains('acik') ? this.yavrular : null];
    efekt.ucus();
    await kareleriGetir(r, kaynaklar, (i) => ses.kare(i));
    if (this.kapali) return;
    const durdur = sirayla(r, 4200);
    await this.oy.soyle(M2.hikaye);
    durdur();
    if (this.kapali) return;
    r.kareler.forEach((k) => k.classList.remove('okunuyor'));
    r.muhur.classList.add('bas');
    ses.muhur();
    vakaCozuldu('vaka2');
    const kr = this.el.getBoundingClientRect();
    if (!AZ_HAREKET) konfetiPatlat(this.el, kr.width / 2, kr.height * 0.25, 110);
    await this.bekle(500);
    const dugme = (etiket: string, ikon: string, sinif: string, fn: () => void) => {
      const b = h(`button.dd-roman-dugme.${sinif}`, { type: 'button' }, h('span.dd-rd-ikon', { html: ikon }), h('span', {}, etiket));
      b.addEventListener('click', () => {
        efekt.dokunma();
        fn();
      });
      return b;
    };
    r.alt.append(
      dugme(D.yazi.dosya, IKON.album, 'dd-rd-dosya', () => this.app.git('dosya')),
      dugme(D.yazi.tekrar, IKON.tekrar, 'dd-rd-tekrar', () => this.app.git('vaka2', { adim: 'giris' })),
    );
    r.alt.classList.add('acik');
    this.adim('bitti');
  }
}

export function vaka2Ekrani(app: Uygulama, p?: Vaka2Param): Ekran {
  const v = new Vaka2(app, p?.adim ?? 'giris');
  return { el: v.el, kapat: () => v.kapat() };
}

/** test: odanın kimliği (kullanılmayan import uyarısı olmasın diye tür) */
export type { BahceId };
