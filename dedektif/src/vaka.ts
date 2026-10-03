/**
 * Vaka 1 "Devrilen Lamba": oyunun akışı (ekip/senaryo/dedektif-mino.md v2).
 *
 * Giriş (Mino esneyerek girer, devrik lambayı görür, dedektif şapkasını takar; Kino kayarak gelir) → Halka 1 (halıda
 * pati izi; zürafa / ördek / kedi patisi) → Halka 2 (masada beyaz tüy; turuncu / siyah / beyaz kedi) → Halka 3
 * (pervazda sarı kanat tozu + pencerede kelebek; süt / yastık / kelebek; gölge canlandırma) → Halka 4 (izleri takip et:
 * halı → koridor → iki yol; mutfak yanlışsa Kino'nun sosis izleri; yatak odasında kuyruk) → Final (Pamuk özür diler,
 * lamba masaya, düğmesine dokun, oda aydınlanır, kelebeğe el sallanır) → Ödül: 4 kareli çizgi roman.
 *
 * Hiçbir adım kilitlenmez: 10 sn ipucu bulunamazsa Kino koklayıp yeri gösterir; 2 yanlış karttan sonra doğru kart
 * parlar; her beklemede parmak ipucu var. Animasyonlar yalnız transform / opacity; dokunuşu bekletmez.
 *
 * Test / gösterim: ?test=1&adim=tuy (doğrudan bir halkaya: giris, iz, tuy, neden, nerede, final, roman), &tohum=3.
 * Kök elemanın data-adim değeri o anki adımı söyler (testler bekler).
 */
import D from '../../content/dedektif.json';
import { efekt } from '../../src/audio/ses';
import { Karakter, svgGetir } from '../../src/karakter/karakter';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Buyutec, type BuyutecHedef } from '../../src/ui/buyutec';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import { DosyaSeridi } from './dosya';
import { AZ_HAREKET, calismaOdasi, Dunya, koridor, mutfak, yatakOdasi, type Oda } from './dunya';
import { Efekt, oynat, parmak, pop } from './efekt';
import { vakaCozuldu } from './kayit';
import {
  ADIMLAR,
  CALISMA,
  Dosya,
  halka,
  HALKALAR,
  izNotasi,
  K,
  KADRAJ,
  M,
  ODA_H,
  yolIzleri,
  yollariDiz,
  YARDIM,
  YATAK,
  type Adim,
  type Halka,
  type HalkaId,
  type IpucuTanim,
  type Kadraj,
  type KadrajAdi,
  type Yol,
} from './mantik';
import { Oyuncular } from './oyuncular';
import { resim } from './resimler';
import { kareleriGetir, romanKur, sirayla } from './roman';
import { Fon, muzikCal, ses } from './sesler';
import { sorgu } from './sorgu';

export interface VakaParam {
  adim?: Adim;
}

/** Basit tohumlu rastgele (testlerde aynı sıra) */
function tohumlu(t: number): () => number {
  let s = t >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

class Vaka {
  readonly el: HTMLElement;
  private dunya: Dunya;
  private oy = new Oyuncular();
  private efekt: Efekt;
  private dosya: Dosya;
  private serit: DosyaSeridi;
  private ara: HTMLElement;
  private buyutec: Buyutec;
  private fon = new Fon();
  private calisma: Oda;
  private kapali = false;
  private zamanlar: number[] = [];
  private temizlik: (() => void)[] = [];
  private rnd: () => number;
  private yollar: Record<'sol' | 'sag', Yol>;
  private bulusSayisi = 0;

  constructor(
    private app: Uygulama,
    baslangic: Adim,
  ) {
    const q = new URLSearchParams(location.search);
    this.rnd = q.has('tohum') ? tohumlu(Number(q.get('tohum'))) : TEST_MODU ? tohumlu(7) : Math.random;
    // test: Kino'nun koklama süresi kısaltılabilir (&kokla=1500 ms)
    if (TEST_MODU && Number(q.get('kokla')) > 0) YARDIM.koklaSn = Number(q.get('kokla')) / 1000;
    this.yollar = TEST_MODU && !q.has('tohum') ? { sol: 'mutfak', sag: 'yatak' } : yollariDiz(this.rnd);
    this.dosya = Dosya.adimdan(baslangic);
    this.serit = new DosyaSeridi(this.dosya);
    this.dunya = new Dunya((w, hh) => this.guvenli(w, hh));
    this.ara = h('div.dd-ara');
    const geri = yuvarlakDugme(IKON.geri, 'Geri', () => this.app.git('acilis'), 'kucuk dd-geri');
    const tekrar = yuvarlakDugme(IKON.tekrar, 'Tekrar dinle', () => this.oy.tekrar(), 'kucuk dd-tekrar');
    const sesD = sesDugmesi();
    sesD.classList.add('kucuk');
    this.el = h(
      'div.dd-vaka',
      { 'data-adim': 'yukleniyor' },
      this.dunya.el,
      this.oy.el,
      this.ara,
      h('div.dd-ust', {}, geri, this.serit.el, h('div.dd-ust-sag', {}, tekrar, sesD)),
    );
    this.efekt = new Efekt(this.el);
    this.el.append(this.efekt.el);
    // çalışma odası: bütün halkaların ipuçlarıyla
    this.calisma = calismaOdasi(HALKALAR.flatMap((hk) => hk.ipuclari));
    this.dunya.kur(this.calisma, 'genel');
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
      oynadi: () => (this.sonOynama = performance.now()),
    });
    this.buyutec.goster(false);
    this.dunya.kameraBitti = () => this.buyutec.yenile();
    const boyut = () => {
      this.dunya.yenile();
      this.buyutec.yenile();
    };
    window.addEventListener('resize', boyut);
    this.temizlik.push(() => window.removeEventListener('resize', boyut));
    // Mino'ya dokununca gıdıklanır ve son cümleyi tekrar söyler
    this.oy.mino.el.addEventListener('pointerdown', () => {
      this.oy.minoTepki('gidik');
      efekt.dokunma();
    });
    this.oy.kinoYer.addEventListener('pointerdown', () => {
      efekt.dokunma();
      this.oy.kinoOynat('sevin', 800);
      this.oy.kinoIfade('heyecan', 800);
    });
    // Mino'nun dedektif şapkası ve poz ekleri önceden yüklensin (giriş akıcı olsun)
    void this.oy.mino.poz(null);
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
    this.fon.durdur();
    this.buyutec.kapat();
    this.oy.kapat();
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
  /** Kadrajın sığacağı güvenli bölge: üst çubuğun altı; yatayda karakterlerin yanları, dikeyde alttaki karakterler dışarıda */
  private guvenli(w: number, hh: number): [number, number, number, number] {
    const ust = Math.min(86, hh * 0.14);
    if (w > hh * 1.15) return [w * 0.14, ust, w * 0.86, hh * 0.98];
    return [w * 0.04, ust, w * 0.96, hh * 0.76];
  }

  // ---------------------------------------------------------------- akış
  private async akis(bas: Adim) {
    const sira = ADIMLAR.slice(ADIMLAR.indexOf(bas));
    this.fon.baslat();
    for (const a of sira) {
      if (this.kapali) return;
      if (a === 'giris') await this.giris();
      else if (a === 'iz' || a === 'tuy' || a === 'neden') await this.halkaOyna(halka(a));
      else if (a === 'nerede') await this.halka4();
      else if (a === 'final') await this.final(sira[0] === 'final');
      else if (a === 'roman') await this.roman();
    }
  }

  // ---------------------------------------------------------------- giriş
  private async giris() {
    const { oy, dunya } = this;
    this.adim('giris');
    this.calisma.e.los?.classList.add('acik');
    dunya.kur(this.calisma, 'giris');
    // Mino esneyerek soldan girer
    void oy.kaydir('mino', -Math.min(420, window.innerWidth * 0.5), 0, 0, 0);
    void oy.kaydir('kino', Math.min(520, window.innerWidth * 0.7), 0, 0, 0);
    await this.bekle(250);
    oy.minoTepki('esne', 2);
    await oy.don('mino', 1300);
    if (this.kapali) return;
    // devrik lambayı görür: gözleri kocaman
    const l = CALISMA.lambaDevrik;
    void dunya.git([l.x - 0.2, l.y - 0.32, l.x + 0.2, 1], 900);
    oy.mino.bak(0.6);
    void oy.mino.ifade('saskin', 1800);
    oy.minoTepki('sasir');
    if (this.calisma.e.lambaDevrik) pop(this.calisma.e.lambaDevrik, 1.08);
    await oy.soyle(M.lambam);
    if (this.kapali) return;
    // şapka düşer, büyüteç kalkar: "Bu bir vaka!"
    void dunya.git('giris', 800);
    await oy.mino.dedektif({ sapka: true });
    oy.mino.el.classList.add('dd-sapkali');
    oynat(oy.mino.el, 'dd-sapka-dus');
    ses.pop();
    this.sonra(220, () => {
      const [x, y] = this.efekt.merkez(oy.mino.el, 0.5, 0.12);
      this.efekt.parilti(x, y, 8, 0.8);
    });
    await this.bekle(450);
    await oy.mino.dedektif({ buyutec: true });
    ses.vaka();
    oy.minoTepki('zipla');
    oynat(this.el, 'dd-vaka-flas');
    await oy.soyle(M.vaka);
    if (this.kapali) return;
    // Kino kayarak gelir, halıya çarpar
    ses.kay();
    oy.kinoIfade('heyecan', 1400);
    await oy.don('kino', 900);
    ses.bum();
    const [kx, ky] = this.efekt.merkez(oy.kino.el, 0.5, 0.2);
    this.efekt.yildizlar(kx, ky);
    void oy.zipla('kino', 10, 380);
    oy.kinoIfade('saskin', 800);
    await this.bekle(500);
    oy.kinoPoz('kalk');
    oy.kinoIfade('heyecan', 1500);
    oy.kinoOynat('sevin', 900);
    await oy.soyle(K.dedektif, 'kino');
    oy.kinoPoz(null);
    if (this.kapali) return;
    // büyüteç Mino'nun elinden sahneye geçer
    await oy.soyle(M.buyutec);
    await oy.mino.dedektif({ buyutec: false });
  }

  // ---------------------------------------------------------------- halka 1-3: ara, sor, demek ki
  private async halkaOyna(hk: Halka) {
    const { oy, dunya } = this;
    if (this.kapali) return;
    this.serit.aktif(hk.id);
    if (dunya.oda !== this.calisma) dunya.kur(this.calisma, hk.kadraj);
    this.calisma.e.los?.classList.add('acik');
    await dunya.git(this.aramaKadraji(hk), 1100);
    if (hk.ara) await oy.soyle(hk.ara);
    await this.ipuclariniBul(hk);
    if (this.kapali) return;
    // soru ve kartlar
    this.adim(`soru-${hk.id}`);
    const t0 = hk.ipuclari[0];
    const t1 = hk.ipuclari[1];
    await sorgu({
      kok: this.el,
      efekt: this.efekt,
      oy,
      halka: hk,
      foto: resim(t0.foto ?? t0.resim) ?? '',
      ekFoto: t1 ? resim(t1.foto ?? t1.resim) : null,
      goz: () => this.serit.goz(hk.id),
      ilk: hk.id === 'iz',
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
    await this.sonrasi(hk.id);
  }

  /**
   * Arama kadrajı: yatayda halkanın kadrajı; dikey ekranda oda ekranı boydan kaplar ve dar bir dilim görünür: kamera
   * ipuçlarının ortasına (yatayda) gelir, ipuçları Mino ile Kino'nun arasında kalır.
   */
  private aramaKadraji(hk: Halka): Kadraj | KadrajAdi {
    const { w, h: hh } = this.dunya.boyut;
    if (w > hh * 1.15 || !hk.ipuclari.length) return hk.kadraj;
    const xs = hk.ipuclari.map((t) => t.x);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const [, y0, , y1] = KADRAJ[hk.kadraj];
    return [cx - 0.12, y0, cx + 0.12, y1];
  }

  /** Halkanın ipuçları büyüteçle bulunana kadar (10 sn'de bir Kino koklar) */
  private ipuclariniBul(hk: Halka): Promise<void> {
    const kalan = hk.ipuclari.filter((t) => !this.dosya.goz(hk.id).ipuclari.includes(t.id));
    if (!kalan.length) return Promise.resolve();
    this.adim(`ara-${hk.id}`);
    return new Promise<void>((coz) => {
      this.aramaBitti = coz;
      this.aranan = hk;
      const hedefler: BuyutecHedef[] = kalan.map((t) => ({ id: t.id, yer: () => this.dunya.merkez(this.ipucuEl(t.id)!) }));
      this.buyutec.hedefleriKur(hedefler);
      this.buyutec.goster(true);
      this.buyutec.yenile();
      // büyüteç ilk kez: Mino'nun gözünün önünden sahnenin ortasına süzülür; parmak gezdirmeyi gösterir
      const r = this.ara.getBoundingClientRect();
      const g = this.guvenli(r.width, r.height);
      if (hk.id === 'iz' && !this.buyutecGosterildi) {
        this.buyutecGosterildi = true;
        const [mx, my] = this.efekt.merkez(this.oy.mino.el, 0.36, 0.42);
        void this.buyutec.git(mx, my, 0).then(() => this.buyutec.git((g[0] + g[2]) / 2 - r.width * 0.12, (g[1] + g[3]) / 2, 700));
        this.sonra(900, () => {
          if (this.dosya.goz(hk.id).ipuclari.length || this.kapali) return;
          const lens = this.buyutec.el;
          const dur = parmak(this.el, () => lens.getBoundingClientRect(), () => {
            const b = lens.getBoundingClientRect();
            return new DOMRect(b.left + b.width * 0.9, b.top + b.height * 0.1, b.width, b.height);
          });
          this.parmakDur = dur;
          this.sonra(3600, () => this.parmakBirak());
        });
      } else void this.buyutec.git((g[0] + g[2]) / 2, (g[1] + g[3]) / 2, 500);
      this.sonBulus = performance.now();
      this.sonOynama = performance.now();
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
  private aramaBitti: (() => void) | null = null;
  private aramaTemizle: (() => void) | null = null;
  private aranan: Halka | null = null;
  private buyutecGosterildi = false;
  private sonBulus = 0;
  private sonOynama = 0;
  private koklaniyor = false;
  private parmakDur: (() => void) | null = null;
  private dokunZaman = 0;
  private sonIsilti = 0;

  private parmakBirak() {
    this.parmakDur?.();
    this.parmakDur = null;
  }

  private ipucuEl(id: string): HTMLElement | null {
    return id === 'kelebek' ? (this.calisma.e.kelebek ?? null) : (this.calisma.e[`ipucu-${id}`] ?? null);
  }
  private ipucuTanim(id: string): IpucuTanim | undefined {
    return HALKALAR.flatMap((hk) => hk.ipuclari).find((t) => t.id === id);
  }

  /** Büyüteç yaklaştı: ince pırıltı ve ses (sıcak-soğuk) */
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

  /** İpucu merceğin içine girdi: belirir, parlar, "Buldun!" */
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
    // dokunulmazsa: parmak dokunmayı gösterir, Mino "İpucuna dokun!" der
    clearTimeout(this.dokunZaman);
    this.dokunZaman = window.setTimeout(() => {
      if (this.kapali || !el.classList.contains('dd-goruldu')) return;
      this.parmakBirak();
      this.parmakDur = parmak(this.el, () => el.getBoundingClientRect());
      void this.oy.soyle(M.dokun);
    }, sure(YARDIM.dokunSn * 1000));
    this.zamanlar.push(this.dokunZaman);
  }

  /** Görülen ipucuna dokunuldu: büyür, dosyaya uçar ve yapışır */
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
    // ipucu büyür (fotoğrafı), sonra dosyadaki gözüne uçar
    const foto = resim(t.foto ?? t.resim) ?? '';
    const goz = this.serit.goz(hk.id);
    const [x1, y1] = this.efekt.merkez(goz);
    const kart = h('div.dd-uc-foto', {}, h('img', { src: foto, alt: '', draggable: 'false' }));
    const kk = this.el.getBoundingClientRect();
    const boy = Math.min(kk.width, kk.height) * 0.36;
    kart.style.width = `${boy}px`;
    kart.style.height = `${boy}px`;
    const ucus = (async () => {
      await this.efekt.ucur(kart, [x0, y0], [kk.width / 2, kk.height * 0.45], { ms: 420, kavis: -30, boy0: 0.35, boy1: 1, don: 4 });
      await this.efekt.ucur(kart, [kk.width / 2, kk.height * 0.45], [x1, y1], { ms: 560, kavis: -60, boy0: 1, boy1: 0.2, don: -12, gecikme: 260 });
      ses.yapis();
      this.serit.ipucu(hk.id, foto);
    })();
    await ucus;
    if (this.kapali) return;
    if (this.dosya.ipuclariTamam(hk.id)) {
      this.aramaTemizle?.();
      this.buyutec.goster(false);
      const c = this.aramaBitti;
      this.aramaBitti = null;
      c?.();
    } else {
      await this.oy.soyle(M.bir_daha);
    }
  }

  /** Kino burnuyla ipucunun yerini gösterir */
  private async kokla(t: IpucuTanim) {
    const el = this.ipucuEl(t.id);
    if (!el) return;
    this.koklaniyor = true;
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
    await oy.git('kino', fx, fy, 900, 50);
    if (this.kapali) return;
    oy.kinoOynat('kokla', 1800);
    ses.kokla();
    const koku = h('i.dd-koku', { style: `left:${tx}px;top:${ty}px` });
    this.efekt.el.append(koku);
    this.sonra(3200, () => koku.remove());
    await oy.soyle(K.kokla, 'kino');
    await this.bekle(700);
    await oy.don('kino', 800);
    this.sonBulus = performance.now();
    this.koklaniyor = false;
    const hk = this.aranan;
    if (hk) this.adim(`ara-${hk.id}`);
  }

  /** Halkadan sonra: şaka ve geçiş anları */
  private async sonrasi(id: HalkaId) {
    const { oy } = this;
    if (id === 'iz') {
      // Kino yavaşça Mino'ya döner: "Mino… sen misin?" Mino şaşırır, kendi patisine bakar
      const [mx, my] = oy.ayak(oy.minoYer);
      const mw = oy.minoYer.getBoundingClientRect().width;
      oy.kinoIfade('saskin', 2200);
      await oy.git('kino', mx + mw * 0.95, my, 1100, 16);
      oy.kinoPoz('isaret');
      await oy.soyle(K.sen_misin, 'kino');
      oy.kinoPoz(null);
      void oy.mino.ifade('saskin', 1400);
      oy.minoTepki('sasir');
      await oy.soyle(M.uyudum);
      // kendi patisine bakar: başı eğilir, sol patisi kalkar
      oy.mino.ekPoz = { kafaY: 14, kafaAci: -5, gozKay: -12 };
      oy.mino.kol('sol', 40);
      await this.bekle(1200);
      oy.mino.ekPoz = null;
      oy.mino.kol('sol', 0);
      await oy.don('kino', 900);
    } else if (id === 'tuy') {
      oy.minoTepki('sevinc');
      await oy.soyle(M.ben_degilim);
      oy.kinoIfade('uzgun', 2200);
      oy.kinoPoz('dusun');
      await oy.soyle(K.pardon, 'kino');
      oy.kinoPoz(null);
      oy.minoTepki('saril');
    } else if (id === 'neden') {
      await this.canlandir();
    }
  }

  /** Halka 3 "demek ki": gölge olarak beyaz kedi masaya zıplar, kelebeğe uzanır, lamba sallanıp devrilir */
  private async canlandir() {
    const { dunya } = this;
    const oda = this.calisma;
    const W = oda.W;
    const ani = oda.e.ani;
    if (!ani) return;
    this.adim('canlandir');
    await dunya.git('sahne3', 900);
    if (this.kapali) return;
    const pamuk = resim('pamuk-b') ?? '';
    const golge = h('img.dd-golge-kedi', { src: pamuk, alt: '', draggable: 'false' });
    ani.replaceChildren(golge);
    ani.classList.add('acik');
    const dik = oda.e.lambaDik;
    const devrik = oda.e.lambaDevrik;
    dik?.classList.add('dd-gecmis');
    devrik?.classList.add('dd-gizli');
    oda.e.kelebek?.classList.add('dd-ucusuyor');
    await this.bekle(500);
    const p = (x: number, y: number) => `translate(${(x * W).toFixed(0)}px, ${(y * ODA_H).toFixed(0)}px)`;
    const tutar = (a: Animation) => a.finished.catch(() => undefined);
    // yerden masaya zıplar
    ses.pop();
    await tutar(
      golge.animate(
        [
          { transform: `${p(0.36, 0.95)} translate(-50%, -100%) scale(0.9, 1.05)`, opacity: 0 },
          { transform: `${p(0.38, 0.95)} translate(-50%, -100%) scale(1.08, 0.88)`, opacity: 1, offset: 0.2 },
          { transform: `${p(0.5, 0.56)} translate(-50%, -100%) rotate(-12deg) scale(0.95, 1.08)`, offset: 0.62 },
          { transform: `${p(0.6, 0.675)} translate(-50%, -100%) scale(1.06, 0.92)`, offset: 0.88 },
          { transform: `${p(0.6, 0.675)} translate(-50%, -100%)`, opacity: 1 },
        ],
        { duration: sure(1100), easing: 'cubic-bezier(.4,0,.4,1)', fill: 'forwards' },
      ),
    );
    if (this.kapali) return;
    // kelebeğe uzanır: lamba sallanır
    ses.kanat();
    void golge.animate(
      [
        { transform: `${p(0.6, 0.675)} translate(-50%, -100%)` },
        { transform: `${p(0.62, 0.64)} translate(-50%, -100%) rotate(14deg) scale(0.96, 1.1)` },
        { transform: `${p(0.6, 0.675)} translate(-50%, -100%)` },
      ],
      { duration: sure(700), easing: 'ease-in-out', fill: 'forwards' },
    );
    ses.sallan();
    // (dönme ayağın ortasından: .dd-esya transform-origin 50% 100%)
    const L = (r: number, dx = 0, dy = 0) => `translate(-50%, -100%) translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) rotate(${r}deg)`;
    if (dik) await tutar(dik.animate([{ transform: L(0) }, { transform: L(-10) }, { transform: L(9) }, { transform: L(-14) }], { duration: sure(700), easing: 'ease-in-out', fill: 'forwards' }));
    // devrilir: masadan halıya
    ses.devril();
    if (dik)
      await tutar(
        dik.animate(
          [
            { transform: L(-14), opacity: 1 },
            { transform: L(-70, -0.05 * W, 0.12 * ODA_H), opacity: 1, offset: 0.7 },
            { transform: L(-90, -0.09 * W, 0.24 * ODA_H), opacity: 0 },
          ],
          { duration: sure(620), easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' },
        ),
      );
    devrik?.classList.remove('dd-gizli');
    if (devrik) pop(devrik, 1.1);
    this.efekt.sars(4);
    // gölge kedi kaçar
    void golge.animate([{ transform: `${p(0.6, 0.675)} translate(-50%, -100%)`, opacity: 1 }, { transform: `${p(0.9, 0.94)} translate(-50%, -100%) scale(0.9)`, opacity: 0 }], { duration: sure(800), easing: 'ease-in', fill: 'forwards' });
    await this.bekle(700);
    dik?.getAnimations().forEach((a) => a.cancel());
    dik?.classList.remove('dd-gecmis');
    ani.classList.remove('acik');
    await this.bekle(400);
    ani.replaceChildren();
  }

  // ---------------------------------------------------------------- halka 4: izler, iki yol, kuyruk
  private async halka4() {
    const { oy, dunya } = this;
    if (this.kapali) return;
    this.serit.aktif('nerede');
    if (dunya.oda !== this.calisma) dunya.kur(this.calisma, 'izler');
    oy.yerlesim(this.dar() ? 'iki' : 'sol');
    await dunya.git(this.ortala(CALISMA.lambaDevrik.x + 0.04, 'izler'), 1000);
    if (this.kapali) return;
    // izler lambanın yanından başlar: sırayla belirir
    const izler = this.calisma.e.izler;
    izler.classList.add('acik');
    await oy.soyle(M.izleri_takip);
    await this.izTakip([...izler.querySelectorAll<HTMLElement>('.dd-iz')], 0, true);
    if (this.kapali) return;
    // koridor
    ses.vuus();
    const kor = koridor(this.yollar, yolIzleri);
    oy.yerlesim('iki');
    await dunya.gec(kor, 'koridor', 1);
    if (this.kapali) return;
    kor.e.ortak.classList.add('acik');
    await this.izTakip([...kor.e.ortak.querySelectorAll<HTMLElement>('.dd-iz')], 8, true);
    if (this.kapali) return;
    kor.e.sol.classList.add('acik');
    kor.e.sag.classList.add('acik');
    // iki yol: hangisi kedinin izi? (Halka 1'in kartı dosyada parlar: kedi izi tırnaksız)
    oynat(this.serit.goz('iz'), 'dd-hatirla');
    let secim = await this.yolSec(kor);
    while (secim === 'mutfak' && !this.kapali) {
      await this.mutfakta(kor);
      if (this.kapali) return;
      secim = await this.yolSec(kor);
    }
    if (this.kapali) return;
    // doğru yol: izler kendiliğinden yanar, yatak odasına
    const yan = this.yollar.sol === 'yatak' ? kor.e.sol : kor.e.sag;
    const dogru = [...yan.querySelectorAll<HTMLElement>('.dd-iz')];
    for (const [i, iz] of dogru.entries()) {
      iz.classList.add('dd-yandi');
      ses.iz(izNotasi(11 + i));
      await this.bekle(160);
    }
    await this.yatakOdasi();
  }

  /** Sıradaki iz ekranın ortasındaki bölgenin dışındaysa kamera ona kayar (izin biraz ilerisini de gösterir) */
  private iziGoster(iz: HTMLElement, ms: number) {
    const r = iz.getBoundingClientRect();
    const k = this.el.getBoundingClientRect();
    const g = this.guvenli(k.width, k.height);
    const x = r.left - k.left + r.width / 2;
    const dar = this.dar();
    // dikeyde iz hep ortada (Mino solda, Kino sağda: aradaki boşlukta); yatayda ortadaki geniş bölgede kalsın
    if (dar ? Math.abs(x - k.width / 2) < k.width * 0.09 : x > g[0] + (g[2] - g[0]) * 0.15 && x < g[0] + (g[2] - g[0]) * 0.8) return;
    const oda = this.dunya.oda!;
    const sx = (parseFloat(iz.style.left) || 0) / oda.W;
    const sy = (parseFloat(iz.style.top) || 0) / ODA_H;
    const kd: Kadraj = dar ? [sx - 0.1, Math.max(0, sy - 0.4), sx + 0.1, Math.min(1, sy + 0.08)] : [sx - 0.16, Math.max(0, sy - 0.42), sx + 0.34, Math.min(1, sy + 0.06)];
    void this.dunya.git(kd, ms);
  }
  /** Dikey (dar) ekran: oda boydan kaplar, karakterler alt köşelerde; sahnedeki iş hep ortada olmalı */
  private dar() {
    const { w, h: hh } = this.dunya.boyut;
    return w < hh * 1.15;
  }
  /** Dar ekranda kamerayı oda oranındaki bir x'e ortalar (kadrajın dikeyi korunur) */
  private ortala(x: number, k: KadrajAdi | Kadraj): Kadraj | KadrajAdi {
    if (!this.dar()) return k;
    const [, y0, , y1] = typeof k === 'string' ? KADRAJ[k] : k;
    return [x - 0.1, y0, x + 0.1, y1];
  }

  /** İzleri sırayla yakar (dokun ya da üstünden kaydır); kamera izleri takip eder */
  private izTakip(izler: HTMLElement[], notaBas: number, kameraIzle: boolean): Promise<void> {
    if (!izler.length) return Promise.resolve();
    this.adim(`iz-takip-${this.dunya.oda?.id ?? ''}`);
    this.el.classList.add('dd-sahne-is');
    return new Promise<void>((coz) => {
      let i = 0;
      let dur: (() => void) | null = null;
      let son = performance.now();
      const sirala = () => izler.forEach((e, j) => e.classList.toggle('dd-sirada', j === i));
      sirala();
      const yak = async (n: number) => {
        // ileri bir ize dokunulduysa aradakiler de çabucak yanar
        while (i <= n && i < izler.length) {
          const e = izler[i];
          e.classList.add('dd-yandi');
          e.classList.remove('dd-sirada');
          ses.iz(izNotasi(notaBas + i));
          const [x, y] = this.efekt.merkez(e);
          this.efekt.parilti(x, y, 5, 0.6);
          i++;
          if (i <= n) await this.bekle(90);
        }
        son = performance.now();
        dur?.();
        dur = null;
        if (i >= izler.length) {
          bitir();
          return;
        }
        sirala();
        // kamera sıradaki izi kadrajda tutar
        if (kameraIzle) this.iziGoster(izler[i], 650);
      };
      if (kameraIzle) this.iziGoster(izler[0], 700);
      const tikla = (e: Event) => {
        const n = izler.indexOf(e.currentTarget as HTMLElement);
        if (n >= i) void yak(n);
      };
      izler.forEach((e) => e.addEventListener('click', tikla));
      // üstünden kaydırma
      const kay = (e: PointerEvent) => {
        if (e.pointerType === 'mouse' && !(e.buttons & 1)) return;
        const hedef = izler[i];
        if (!hedef) return;
        const r = hedef.getBoundingClientRect();
        if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < Math.max(34, r.width * 0.9)) void yak(i);
      };
      this.el.addEventListener('pointermove', kay);
      const ipucu = window.setInterval(() => {
        if (this.kapali || dur || i >= izler.length) return;
        if (performance.now() - son > YARDIM.izSn * 1000) {
          const e = izler[i];
          dur = parmak(this.el, () => e.getBoundingClientRect());
        }
      }, 500);
      const bitir = () => {
        clearInterval(ipucu);
        dur?.();
        this.el.removeEventListener('pointermove', kay);
        izler.forEach((e) => e.removeEventListener('click', tikla));
        coz();
      };
      this.temizlik.push(() => clearInterval(ipucu));
    });
  }

  /** Koridorda iki yoldan birini seçer (iz yolunun herhangi bir izine dokunarak) */
  private yolSec(kor: Oda): Promise<Yol> {
    this.adim('yol-sec');
    void this.oy.soyle(M.iki_yol);
    return new Promise<Yol>((coz) => {
      let dur: (() => void) | null = null;
      const yollar = [kor.e.sol, kor.e.sag];
      const sec = (e: Event) => {
        const yol = (e.currentTarget as HTMLElement).dataset.yol as Yol;
        clearTimeout(z);
        dur?.();
        yollar.forEach((y) => y.removeEventListener('click', sec));
        const izl = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('.dd-iz')];
        izl.forEach((iz) => oynat(iz, 'dd-sec'));
        efekt.secim();
        coz(yol);
      };
      yollar.forEach((y) => !y.classList.contains('dd-soluk') && y.addEventListener('click', sec));
      // 6 sn seçilmezse: dosyadaki kedi patisi kartı parlar, parmak iki yolu sırayla gösterir
      const z = window.setTimeout(() => {
        if (this.kapali) return;
        oynat(this.serit.goz('iz'), 'dd-hatirla');
        const acik = yollar.filter((y) => !y.classList.contains('dd-soluk'));
        const hedef = acik.length === 1 ? acik[0] : acik[Math.floor(this.rnd() * acik.length)];
        dur = parmak(this.el, () => hedef.querySelector('.dd-iz:last-child')?.getBoundingClientRect() ?? null);
      }, sure(6000));
      this.zamanlar.push(z);
    });
  }

  /** Yanlış yol: izler buzdolabının önünde biter, Kino kızarır ("Sosis!"), öbür yola dönülür */
  private async mutfakta(kor: Oda) {
    const { oy, dunya } = this;
    this.adim('mutfak');
    const yan = this.yollar.sol === 'mutfak' ? kor.e.sol : kor.e.sag;
    for (const [i, iz] of [...yan.querySelectorAll<HTMLElement>('.dd-iz')].entries()) {
      iz.classList.add('dd-yandi');
      ses.iz(izNotasi(11 + i));
      await this.bekle(140);
    }
    ses.vuus();
    const mt = mutfak();
    await dunya.gec(mt, 'mutfak', yan === kor.e.sol ? -1 : 1);
    if (this.kapali) return;
    mt.e.izler.classList.add('acik');
    for (const [i, iz] of [...mt.e.izler.querySelectorAll<HTMLElement>('.dd-iz')].entries()) {
      iz.classList.add('dd-yandi');
      ses.iz(izNotasi(10 - i));
      await this.bekle(180);
    }
    if (mt.e.sosis) pop(mt.e.sosis, 1.2);
    // Kino kızarır: kulaklar düşer, utanır
    oy.kinoIfade('uzgun', 2600);
    oy.kinoPoz('dusun');
    oy.el.classList.add('dd-kino-kizardi');
    await oy.soyle(K.sosis, 'kino');
    oy.kinoPoz(null);
    oy.el.classList.remove('dd-kino-kizardi');
    oy.minoTepki('gidik');
    await oy.soyle(M.obur_yol);
    // koridora dön: yanlış yol soluk, öteki parlar
    ses.vuus();
    yan.classList.add('dd-soluk');
    (yan === kor.e.sol ? kor.e.sag : kor.e.sol).classList.add('dd-parla');
    await dunya.gec(kor, 'koridor', yan === kor.e.sol ? 1 : -1);
  }

  /** Yatak odası: izler yatağın ayak ucuna; kuyruk sallanır; dokununca Pamuk çıkar */
  private async yatakOdasi() {
    const { oy, dunya } = this;
    ses.vuus();
    const pamukKap = h('div.dd-pamuk-dunya');
    const pamuk = new Karakter('pamuk', h('img', { src: resim('pamuk-b') ?? '', alt: '', draggable: 'false' }));
    pamukKap.append(pamuk.el);
    this.temizlik.push(() => pamuk.kapat());
    const kuyruk = h('button.dd-kuyruk', { type: 'button', 'aria-label': 'Kuyruk' }, h('div.dd-kuyruk-ic'));
    void this.kuyrukCiz(kuyruk.firstElementChild as HTMLElement);
    const yt = yatakOdasi(pamukKap, kuyruk);
    oy.yerlesim(this.dar() ? 'iki' : 'sag');
    await dunya.gec(yt, 'yatak', 1);
    if (this.kapali) return;
    yt.e.izler.classList.add('acik');
    await this.izTakip([...yt.e.izler.querySelectorAll<HTMLElement>('.dd-iz')], 4, true);
    if (this.kapali) return;
    // kuyruk ucu yatağın altından sallanır; gözler karanlıkta parlar
    this.fon.durdur();
    yt.e.alt.classList.add('acik');
    kuyruk.classList.add('acik');
    await dunya.git(this.ortala(YATAK.kuyruk.x + 0.04, [0.08, 0.5, 0.6, 1]), 900);
    oy.mino.poz('isaret-sol');
    await oy.soyle(M.kuyruk);
    oy.mino.poz(null);
    this.adim('kuyruk');
    await new Promise<void>((coz) => {
      let dur: (() => void) | null = null;
      const z = window.setTimeout(() => (dur = parmak(this.el, () => kuyruk.getBoundingClientRect())), sure(4000));
      this.zamanlar.push(z);
      kuyruk.addEventListener(
        'click',
        () => {
          clearTimeout(z);
          dur?.();
          coz();
        },
        { once: true },
      );
    });
    if (this.kapali) return;
    // Pamuk yatağın altından yavaşça çıkar: kulakları düşük, patilerinde sarı kanat tozu
    kuyruk.classList.add('cekildi');
    muzikCal('film-surpriz', 0.45);
    ses.pop();
    oy.kinoIfade('saskin', 2000);
    oy.minoTepki('sasir');
    this.adim('pamuk');
    pamukKap.classList.add('acik');
    pamuk.ifade('uzgun');
    const W = yt.W;
    const s = YATAK.saklan;
    const c = YATAK.cik;
    const yol = pamukKap.animate(
      [
        { transform: 'translate(0, 0) scale(0.92, 0.82)' },
        { transform: `translate(${((c.x - s.x) * W * 0.45).toFixed(0)}px, ${((c.y - s.y) * ODA_H * 0.3).toFixed(0)}px) scale(0.96, 0.9)`, offset: 0.45 },
        { transform: `translate(${((c.x - s.x) * W).toFixed(0)}px, ${((c.y - s.y) * ODA_H).toFixed(0)}px) scale(1)` },
      ],
      { duration: sure(2000), easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'forwards' },
    );
    if (!AZ_HAREKET) void pamuk.oynat('yuru', 2000);
    void dunya.git(this.ortala(YATAK.cik.x - 0.03, [0.22, 0.42, 0.82, 1]), 1600);
    await yol.finished.catch(() => undefined);
    if (this.kapali) return;
    pamukKap.classList.add('cikti');
    const [px0, py0] = this.efekt.merkez(pamukKap, 0.5, 0.92);
    this.efekt.parilti(px0, py0, 10, 0.7);
    // dosyanın son gözü: Pamuk
    this.dosya.demekEkle('nerede');
    this.serit.demek('nerede');
    ses.muhur();
    // itiraf
    oy.pamukBagla(pamuk, pamukKap);
    pamuk.ifade('utanmis');
    await oy.soyle(D.pamuk.guzeldi, 'pamuk');
    pamuk.ifade('uzgun');
    await oy.soyle(D.pamuk.ozur, 'pamuk');
    oy.minoTepki('saril');
    await oy.soyle(M.olur_boyle);
    pamuk.ifade('mutlu', 1500);
    this.el.classList.remove('dd-sahne-is');
  }

  /** Pamuk'un iskeletinden yalnız kuyruğu (yatağın altından çıkan uç): kökü yatağın ayak ucunun arkasında */
  private async kuyrukCiz(kap: HTMLElement) {
    const metin = await svgGetir('pamuk');
    if (!metin || this.kapali) return;
    kap.innerHTML = metin.replace(/<\?xml[^>]*>/, '');
    const svg = kap.querySelector('svg');
    if (!svg) return;
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    for (const g of svg.querySelectorAll<SVGGElement>(':scope g[id]')) {
      const id = g.id;
      g.removeAttribute('id');
      if (id !== 'kuyruk' && !g.closest('[data-kuyruk]')) g.style.display = 'none';
      else g.dataset.kuyruk = '1';
    }
    // görünür kuyruğun kutusu: kök (1290, 1600) sol altta
    svg.setAttribute('viewBox', '1180 1080 620 620');
    kap.style.setProperty('--kok-x', `${(((1290 - 1180) / 620) * 100).toFixed(1)}%`);
    kap.style.setProperty('--kok-y', `${(((1600 - 1080) / 620) * 100).toFixed(1)}%`);
  }

  // ---------------------------------------------------------------- final
  private async final(dogrudan: boolean) {
    const { oy, dunya } = this;
    if (this.kapali) return;
    this.serit.aktif(null);
    this.adim('final');
    ses.vuus();
    oy.yerlesim('iki');
    this.calisma.e.los?.classList.add('acik');
    // dar ekranda kamera devrik lambayla masanın arasına: ikisi de Mino ile Kino'nun arasında
    const kd = this.ortala((CALISMA.lambaDevrik.x + CALISMA.masaUst.x) / 2, 'final');
    if (dogrudan) dunya.kur(this.calisma, kd);
    else await dunya.gec(this.calisma, kd, -1);
    if (this.kapali) return;
    this.fon.baslat();
    // lambayı masaya koy
    this.adim('lamba-tasi');
    this.el.classList.add('dd-sahne-is');
    // dar ekranda Mino ve Kino kenara çekilir: lamba ve masa aralarında kalsın
    if (this.dar()) oy.yerlesim('kenar');
    await oy.soyle(M.masaya_koy);
    await this.lambaTasi();
    if (this.kapali) return;
    // düğmesine dokun: lamba yanar, oda aydınlanır
    this.adim('lamba-dugme');
    await oy.soyle(M.dugme);
    await this.lambaYak();
    this.el.classList.remove('dd-sahne-is');
    oy.yerlesim('iki');
    if (this.kapali) return;
    // Pamuk (arkalarından gelmişti) Mino'yla Kino'nun arasına gelir
    oy.pamukEkle();
    oy.pamuk?.ifade('utanmis', 1600);
    void oy.kaydir('pamuk', -window.innerWidth * 0.6, 0, 0, 0);
    await oy.don('pamuk', 1000);
    // pencerede kelebek: herkes el sallar, kelebek uçup gider
    this.adim('kelebek');
    const kel = this.calisma.e.kelebek;
    await dunya.git(this.ortala(0.5, 'pencere'), 900);
    kel?.classList.add('dd-ucusuyor');
    oy.minoTepki('selam', 1.8);
    oy.kinoPoz('kalk');
    oy.kinoOynat('sevin', 1200);
    if (oy.pamuk && !AZ_HAREKET) void oy.pamuk.oynat('sevin', 1200);
    oy.pamuk?.ifade('mutlu', 2000);
    ses.kanat();
    await this.bekle(1100);
    kel?.classList.add('dd-gidiyor');
    ses.kanat();
    await this.bekle(900);
    oy.kinoPoz(null);
    await dunya.git(this.ortala(CALISMA.masaUst.x - 0.04, 'final'), 900);
    await oy.soyle(D.pamuk.dikkat, 'pamuk');
    oy.kinoPoz('kalk');
    oy.kinoIfade('heyecan', 2200);
    oy.kinoOynat('sevin', 1200);
    void oy.zipla('kino', 24);
    void oy.zipla('pamuk', 16);
    oy.minoTepki('dans');
    muzikCal('film-kutlama', 0.5);
    const r = this.el.getBoundingClientRect();
    if (!AZ_HAREKET) konfetiPatlat(this.el, r.width / 2, r.height * 0.3, 90);
    await oy.soyle(K.cozuldu, 'kino');
    oy.kinoPoz(null);
  }

  /** Devrik lambayı masaya sürükle (dokunmak da olur): masada dik durur */
  private lambaTasi(): Promise<void> {
    const oda = this.calisma;
    const lamba = oda.e.lambaDevrik;
    const dik = oda.e.lambaDik;
    if (!lamba || !dik) return Promise.resolve();
    const W = oda.W;
    const u = CALISMA.masaUst;
    const hedef = h('div.dd-masa-hedef.bt-yok', { style: `left:${(u.x * W).toFixed(0)}px;top:${(u.y * ODA_H).toFixed(0)}px` });
    oda.e.masaHedef = hedef;
    lamba.parentElement?.parentElement?.querySelector('.dd-k-orta')?.append(hedef);
    lamba.classList.add('dd-tasinir');
    return new Promise<void>((coz) => {
      let dur: (() => void) | null = null;
      let z = window.setTimeout(() => (dur = parmak(this.el, () => lamba.getBoundingClientRect(), () => hedef.getBoundingClientRect())), sure(4000));
      this.zamanlar.push(z);
      let s: { id: number; x0: number; y0: number; tasindi: boolean; hayalet: HTMLElement; ox: number; oy: number } | null = null;
      const k = () => this.el.getBoundingClientRect();
      const masaYakin = (x: number, y: number) => {
        const b = hedef.getBoundingClientRect();
        const kk = k();
        const p = Math.max(70, Math.min(kk.width, kk.height) * 0.16);
        return Math.hypot(x - (b.left + b.width / 2), y - (b.top + b.height / 2)) < p * 1.6;
      };
      const yerlestir = async (hayalet: HTMLElement | null) => {
        lamba.removeEventListener('pointerdown', bas);
        window.removeEventListener('pointermove', kimilda);
        window.removeEventListener('pointerup', birak);
        clearTimeout(z);
        dur?.();
        hedef.remove();
        // hayalet dik lambanın yerine uçar, dik lamba belirir (sallanıp oturur)
        if (hayalet) {
          const b = dik.getBoundingClientRect();
          const kk = k();
          const a = hayalet.getBoundingClientRect();
          await this.efekt.ucur(hayalet, [a.left - kk.left + a.width / 2, a.top - kk.top + a.height / 2], [b.left - kk.left + b.width / 2, b.top - kk.top + b.height / 2], { ms: 360, kavis: -50, boy1: 1, don: 70 });
        }
        lamba.classList.add('dd-gizli');
        lamba.classList.remove('dd-tasinir');
        dik.classList.add('dd-yerinde');
        const L = (r: number) => `translate(-50%, -100%) rotate(${r}deg)`;
        void dik.animate([{ transform: L(-18) }, { transform: L(10) }, { transform: L(-5) }, { transform: L(0) }], { duration: sure(700), easing: 'ease-out' });
        efekt.yapis();
        efekt.dogru();
        const [x, y] = this.efekt.merkez(dik, 0.5, 0.9);
        this.efekt.halka(x, y, 60);
        this.oy.minoTepki('zipla');
        this.oy.kinoOynat('sevin', 800);
        await this.bekle(500);
        coz();
      };
      const bas = (e: PointerEvent) => {
        clearTimeout(z);
        dur?.();
        dur = null;
        const a = lamba.getBoundingClientRect();
        const kk = k();
        const hayalet = h('img.dd-hayalet', { src: lamba.getAttribute('src') ?? '', alt: '', draggable: 'false', style: `width:${a.width}px;height:${a.height}px` });
        s = { id: e.pointerId, x0: e.clientX, y0: e.clientY, tasindi: false, hayalet, ox: e.clientX - a.left, oy: e.clientY - a.top };
        hayalet.style.transform = `translate(${a.left - kk.left}px, ${a.top - kk.top}px)`;
        this.el.append(hayalet);
        lamba.classList.add('dd-tutuldu');
        ses.kart();
      };
      const kimilda = (e: PointerEvent) => {
        if (!s || e.pointerId !== s.id) return;
        if (Math.hypot(e.clientX - s.x0, e.clientY - s.y0) > 8) s.tasindi = true;
        const kk = k();
        s.hayalet.style.transform = `translate(${e.clientX - kk.left - s.ox}px, ${e.clientY - kk.top - s.oy}px) rotate(${Math.max(-30, Math.min(30, (e.clientX - s.x0) * 0.08))}deg)`;
        hedef.classList.toggle('dd-uzerinde', masaYakin(e.clientX, e.clientY));
      };
      const birak = async (e: PointerEvent) => {
        if (!s || e.pointerId !== s.id) return;
        const { tasindi, hayalet } = s;
        s = null;
        lamba.classList.remove('dd-tutuldu');
        hedef.classList.remove('dd-uzerinde');
        if (!tasindi || masaYakin(e.clientX, e.clientY)) {
          // dokunuldu ya da masaya bırakıldı
          const a = hayalet.getBoundingClientRect();
          const kk = k();
          hayalet.remove();
          const uc = h('img', { src: lamba.getAttribute('src') ?? '', alt: '', draggable: 'false', style: `width:${a.width}px;height:${a.height}px;display:block` });
          const kap = h('div', {}, uc);
          kap.style.position = 'absolute';
          kap.style.left = `${a.left - kk.left}px`;
          kap.style.top = `${a.top - kk.top}px`;
          kap.style.width = `${a.width}px`;
          kap.style.height = `${a.height}px`;
          this.el.append(kap);
          await yerlestir(kap);
          kap.remove();
          return;
        }
        // masadan uzakta bırakıldı: yerine süzülür
        const a = lamba.getBoundingClientRect();
        const kk = k();
        await hayalet.animate([{ transform: hayalet.style.transform }, { transform: `translate(${a.left - kk.left}px, ${a.top - kk.top}px)` }], { duration: sure(380), easing: 'cubic-bezier(.3,1.2,.5,1)', fill: 'forwards' }).finished.catch(() => undefined);
        hayalet.remove();
        z = window.setTimeout(() => (dur = parmak(this.el, () => lamba.getBoundingClientRect(), () => hedef.getBoundingClientRect())), sure(3000));
        this.zamanlar.push(z);
      };
      lamba.addEventListener('pointerdown', bas);
      window.addEventListener('pointermove', kimilda);
      window.addEventListener('pointerup', (e) => void birak(e));
      this.temizlik.push(() => {
        window.removeEventListener('pointermove', kimilda);
      });
    });
  }

  /** Lambanın düğmesine dokunulunca yanar: sıcak ışık, oda aydınlanır */
  private lambaYak(): Promise<void> {
    const oda = this.calisma;
    const dik = oda.e.lambaDik;
    if (!dik) return Promise.resolve();
    const dugme = h('button.dd-lamba-dugme', { type: 'button', 'aria-label': 'Lambanın düğmesi', style: dik.getAttribute('style') ?? '' });
    dik.after(dugme);
    return new Promise<void>((coz) => {
      let dur: (() => void) | null = null;
      const z = window.setTimeout(() => (dur = parmak(this.el, () => dugme.getBoundingClientRect())), sure(3500));
      this.zamanlar.push(z);
      dugme.addEventListener(
        'click',
        async () => {
          clearTimeout(z);
          dur?.();
          dugme.remove();
          ses.dugme();
          oda.e.isik?.classList.add('acik');
          oda.e.los?.classList.remove('acik');
          this.el.classList.add('dd-aydinlik');
          const [x, y] = this.efekt.merkez(dik, 0.5, 0.25);
          this.efekt.halka(x, y, 90);
          this.oy.minoTepki('sevinc');
          this.oy.kinoIfade('heyecan', 1200);
          this.oy.pamuk?.ifade('mutlu', 1500);
          await this.bekle(900);
          coz();
        },
        { once: true },
      );
    });
  }

  // ---------------------------------------------------------------- ödül: çizgi roman
  private async roman() {
    if (this.kapali) return;
    this.adim('roman');
    this.fon.durdur();
    // dosyada eksik göz kalmasın (test kısayolu)
    for (const hk of HALKALAR) if (!this.dosya.goz(hk.id).demek) {
      this.dosya.demekEkle(hk.id);
      this.serit.demek(hk.id);
    }
    const r = romanKur();
    this.el.append(r.el);
    const kaynaklar = HALKALAR.map((hk) => this.serit.goz(hk.id));
    efekt.ucus();
    await kareleriGetir(r, kaynaklar, (i) => ses.kare(i));
    if (this.kapali) return;
    const durdur = sirayla(r, 5200);
    await this.oy.soyle(M.hikaye);
    durdur();
    if (this.kapali) return;
    r.kareler.forEach((k) => k.classList.remove('okunuyor'));
    r.muhur.classList.add('bas');
    ses.muhur();
    vakaCozuldu('vaka1');
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
      dugme(D.yazi.tekrar, IKON.tekrar, 'dd-rd-tekrar', () => this.app.git('vaka', { adim: 'giris' })),
    );
    r.alt.classList.add('acik');
    this.adim('bitti');
  }
}

export function vakaEkrani(app: Uygulama, p?: VakaParam): Ekran {
  const v = new Vaka(app, p?.adim ?? 'giris');
  return { el: v.el, kapat: () => v.kapat() };
}

