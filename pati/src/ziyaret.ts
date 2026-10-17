/**
 * Pati Dükkânı v2 · ziyaretleri oynatan yönetici (PATI-V2 §9b-9c). Kurallar ziyaret-sahneleri.ts, kişiler ziyaretci.ts.
 *
 *  - İkinci hayvan alınınca ilk ziyaretçi (Kino) gelir; sonra ~2,5 dakikada bir biri. Aynı anda tek ziyaretçi. Yalnız
 *    dükkân görünürken (Bakım Odası, defter, katalog kapalı; gündüz).
 *  - Kapı zili, Nehir abla: "Kapı çaldı!" / "Bir misafirimiz var!". Ziyaretçi kapıdan (soldan) seke seke girer, sevme
 *    köşesinde (bank) durur, isteğini KENDİ SESİYLE söyler (Kino kendi sesi, Kino ailesi Seri 2 sesleri ve hazır Seri 2
 *    kayıtları, Mino ve çocuklar ana ses). 3-4'te başının üstünde resimli balon da çıkar; 5-6'da yalnız söz.
 *  - Çocuk İSTEDİĞİ hayvanı ziyaretçiye verir: hayvanı oyuğundan sürükler ya da hayvana dokunur (hayvan hoplayarak
 *    gelir). Bütün hayvanlar seçilebilir (salon ve açık köşeler).
 *  - 4-6 sn'lik sahne: uygun hayvan sıcak bir sahne + 3/5 jeton, uymayan komik bir sahne + 1/2 jeton (ceza yok). Jetonlar
 *    ziyaretçinin elinden kumbaraya uçar. Ziyaretçi el sallayıp gider, hayvan yerine hoplar.
 *  - Ziyaretçi acele etmez: beklerken kendi hâlini yapar (Baba uyuklar, Lokum her yere bakar, Dede kasketini düzeltir).
 *    90 sn sonra güler yüzle gider ("Yarın görüşürüz!"). Hiçbir şey kaybolmaz, hiçbir şey kilitlenmez.
 *  - "Şuna dokun" yok: ipucu yalnız ziyaretçinin isteği ve (3-4) balonun resmi.
 */
import P from '../../content/pati.json';
import { konus, type KonusmaSecenegi } from '../../src/audio/konusma';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { elSurukle, icinde, Tutulan } from '../../kino-otobus/src/dokunsal';
import type { Efekt } from '../../kino-otobus/src/efekt';
import { esyaEl, ezil, jetonUcur, type Kumbara } from './arayuz';
import { Hayvan } from './hayvan';
import { esyaVar, KOSELER, NEHIR2, ZIYARET, type Yas } from './katalog';
import type { PatiKayit, SahipHayvan } from './kayit';
import type { Nehir } from './nehir';
import { Parti } from './parti';
import { ses } from './sesler';
import { adres, enCokCssBoy, esyaResmi, pozAdresi, pozVar, type Poz } from './varliklar';
import {
  babaanneTepsisi,
  DIKEN_TABAK,
  dikenSonucu,
  hayvanSonucu,
  ikramSonucu,
  INSAN_YEMEGI,
  KINO_IKRAM,
  listeSec,
  listeSonucu,
  SAHNELER,
  siradakiZiyaret,
  ziyaretJetonu,
  type Kisi,
  type Liste,
  type ZiyaretId,
} from './ziyaret-sahneleri';
import { BOY, selamVer, ziyaretciKur, type Ziyaretci } from './ziyaretci';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ || TEST_MODU;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
/** İki ziyaret arası (test: &ziyaret=ms) */
const ARALIK = TEST_MODU && q.has('ziyaret') ? Number(q.get('ziyaret')) : 150000;
/** İkinci hayvandan sonra ilk ziyaret */
const ILK = TEST_MODU && q.has('ziyaret') ? Number(q.get('ziyaret')) : 20000;
/** Ziyaretçi bu kadar bekler, sonra güler yüzle gider (test: &zbekle=ms) */
const BEKLEME = TEST_MODU && q.has('zbekle') ? Number(q.get('zbekle')) : 90000;

const SOZ = ZIYARET.sozler as Record<string, Record<string, string>>;
const SERI2 = import.meta.glob<string>('../../assets/ses-seri2/*.mp3', { eager: true, query: '?url', import: 'default' });
/** Hazır Seri 2 kaydı (yoksa null) */
const hazirSes = (id: string) => SERI2[`../../assets/ses-seri2/${id}.mp3`] ?? null;
const BANK = import.meta.glob<string>('../../assets/film/esya/bank.webp', { eager: true, query: '?url', import: 'default' })['../../assets/film/esya/bank.webp'];
/**
 * Babaanne'nin çayı (Baba'yı uyandırır): çay bardağının çizimi yok. Eskiden assets/uyku/kupler kullanılıyordu ama o
 * resim oyuncak küpler (çay değil); çizim gelene kadar çay rafta kalmaz (sahne çaysız da tam).
 */
const CAY: string | null = null;
/** Börek: Babaanne kitinin börek tabağı (tepsi parçası, onaylı çizim). Pişinin çizimi yok: yayında tepside yok */
const BOREK = import.meta.glob<string>('../../assets/karakter/babaanne/tepsi.webp', { eager: true, query: '?url', import: 'default' })['../../assets/karakter/babaanne/tepsi.webp'];

/** Konuşanın sesi: Kino kendi sesi, Kino ailesi Seri 2 sesleri (kendi kaydı yoksa anlatıcı kaydı tonla), Mino ve çocuklar ana ses */
const SES: Record<Kisi, KonusmaSecenegi> = {
  kino: { karakter: 'kino', ton: 0.92 },
  anne: { karakter: 'anne', ton: 1 },
  lokum: { karakter: 'lokum', ton: 1.25 },
  baba: { karakter: 'baba', ton: 0.85 },
  babaanne: { karakter: 'babaanne', ton: 0.95 },
  dede: { karakter: 'dede', ton: 0.85 },
  mino: {},
  can: { ton: 1.12 },
  ada: { ton: 1.15 },
  elif: { ton: 1.15 },
  'ege-anne': { ton: 1 },
  diken: {},
};
/** Söz grubu (content → v2.ziyaret.sozler) */
const GRUP: Partial<Record<Kisi, string>> = { kino: 'kino', anne: 'anne', lokum: 'lokum', baba: 'baba', babaanne: 'babaanne', dede: 'dede', mino: 'mino', can: 'cocuk', ada: 'cocuk', elif: 'cocuk', 'ege-anne': 'cocuk' };

export interface ZiyaretOrtam {
  /** ziyaret katmanının konulacağı ekran (dükkân) */
  ekran: HTMLElement;
  efekt: Efekt;
  nehir: Nehir;
  kumbara: Kumbara;
  kayit: PatiKayit;
  kaydet: () => void;
  yas: () => Yas;
  etkilesim: () => void;
  /** dükkân şu an ziyarete uygun mu (gündüz, oda / defter / katalog kapalı, açılış bitti) */
  uygun: () => boolean;
  /** hayvanın ekrandaki kutusu (görünen bölümde; yoksa null) */
  hayvanKutusu: (id: string) => DOMRect | null;
  /** ziyarete giden hayvan yerinde görünmez */
  gizle: (id: string, gizli: boolean) => void;
  /** uygun ziyarette hayvana bir kalp */
  kalpVer: (id: string) => void;
  /** görünen bölümün hayvanları (parti) */
  gorunenHayvanlar: () => { id: string; hv: Hayvan }[];
  /** salondaki hayvanın ayağının dibine jeton (parti) */
  jetonBirak: (id: string, n: number) => void;
  /** dikeyde alt şeridin üstü (css px; yoksa null) */
  altUst: () => number | null;
  /** hediye süs (gece misafiri Diken, sabah) */
  susHediye: () => void;
  /** ziyaret bitti (Dede: Bahçe mağazada belirir) */
  bitti?: (id: ZiyaretId) => void;
  /** ziyaret başladı / bitti (dükkân Nehir'i kenara alır) */
  durum?: (var_: boolean) => void;
}

interface Oyuncu {
  kim: Kisi;
  z: Ziyaretci;
}

export class Ziyaret {
  readonly katman: HTMLElement;
  private bank: HTMLElement;
  private balon: HTMLElement;
  private tepsi: HTMLElement;
  private oyuncular: Oyuncu[] = [];
  aktif: ZiyaretId | null = null;
  /** çocuktan beklenen (null: sahne oynuyor ya da ziyaret yok) */
  bekleyis: 'hayvan' | 'ikram' | 'esya' | 'muzik' | 'foto' | 'tabak' | null = null;
  private sonBitis = 0;
  private ikinciHayvan = 0;
  private son: ZiyaretId[] = [];
  private kapandi = false;
  private zaman = 0;
  private bitir: (() => void) | null = null;
  private secilenIkram: string | null = null;
  private birak: (() => void)[] = [];
  private gecici: Hayvan[] = [];
  private parti: Parti | null = null;
  private listeKez = 0;
  private fotoSecilen: string[] = [];
  /** sahnenin olayları (test): "kino:oksar" … */
  readonly gunluk: string[] = [];

  constructor(private o: ZiyaretOrtam) {
    this.bank = h('div.pt-zy-bank', {}, BANK ? h('img', { src: BANK, alt: '', draggable: 'false' }) : null);
    this.balon = h('div.pt-zy-balon', { 'aria-hidden': 'true' });
    this.tepsi = h('div.pt-zy-tepsi');
    this.katman = h('div.pt-ziyaret', { 'data-aktif': '' }, this.bank, this.tepsi, this.balon);
    this.zaman = window.setInterval(() => this.tik(), 500);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => this.yerlesim()).observe(o.ekran);
  }

  // ---------------------------------------------------------------- zamanlama
  private tik() {
    if (this.kapandi || this.aktif) return;
    const n = this.o.kayit.hayvanlar.length;
    if (n < 2) return;
    const simdi = performance.now();
    if (!this.ikinciHayvan) this.ikinciHayvan = simdi;
    const ilk = !(this.o.kayit.ziyaretler.kino ?? 0);
    const bekleme = ilk ? ILK : ARALIK;
    const bas = Math.max(this.sonBitis, ilk ? this.ikinciHayvan : this.sonBitis || this.ikinciHayvan);
    if (simdi - bas < bekleme || !this.o.uygun()) return;
    const id = siradakiZiyaret(this.o.kayit, this.son);
    if (id) void this.baslat(id);
  }

  // ---------------------------------------------------------------- yerleşim
  /** Ziyaretçinin ayaklarının yeri ve Kino boyu (css px, katmanın içinde) */
  private yer(): { x: number; y: number; k: number; dikey: boolean } {
    const W = this.o.ekran.clientWidth || 844;
    const H = this.o.ekran.clientHeight || 390;
    const dikey = H > W;
    if (!dikey) return { x: Math.max(92, W * 0.12), y: H - 4, k: Math.min(H * 0.44, 176), dikey };
    const alt = this.o.altUst() ?? H * 0.72;
    return { x: W * 0.6, y: alt - 2, k: Math.min(150, (alt - 120) / 1.9), dikey };
  }
  private yerlesim() {
    if (!this.aktif) return;
    const { x, y, k, dikey } = this.yer();
    const n = this.oyuncular.length;
    if (this.aktif === 'foto') {
      // aile yan yana, dükkânın önünde
      const W = this.o.ekran.clientWidth || 844;
      const kk = k * (dikey ? 0.62 : 0.6);
      this.oyuncular.forEach((p, i) => p.z.yerlestir(W * (0.1 + (0.8 * i) / Math.max(1, n - 1)), y, kk * BOY[p.kim]));
    } else
      this.oyuncular.forEach((p, i) => {
        const dx = n > 1 ? (i === 0 ? -k * 0.32 : k * 0.42) : 0;
        p.z.yerlestir(x + dx, y - (n > 1 && i === 1 ? 0 : 0), k * BOY[p.kim]);
      });
    const bw = Math.min(k * 1.25, 230);
    this.bank.style.cssText = `width:${bw.toFixed(0)}px;left:${(x - bw / 2).toFixed(0)}px;top:${(y - bw * 0.64).toFixed(0)}px`;
    this.bank.classList.toggle('pt-gizli', this.aktif === 'foto' || this.aktif === 'diken');
    this.balonYerlesim();
    this.tepsiYerlesim();
  }
  private balonYerlesim() {
    const p = this.oyuncular[this.oyuncular.length - 1];
    if (!p) return;
    const [bx, by] = p.z.basUstu();
    this.balon.style.transform = `translate(${bx.toFixed(0)}px, ${Math.max(64, by - 8).toFixed(0)}px)`;
  }
  private tepsiYerlesim() {
    const { x, y, k, dikey } = this.yer();
    const W = this.o.ekran.clientWidth || 844;
    // yatay: ziyaretçinin sağında, tabandan yukarı (müzik kutusu gibi uzun tepsi ekrandan taşmaz)
    if (!dikey) this.tepsi.style.cssText = `left:${(x + k * 0.55).toFixed(0)}px;bottom:${((this.o.ekran.clientHeight || 390) - y + 4).toFixed(0)}px;max-width:${(W - x - k * 0.55 - 12).toFixed(0)}px`;
    else {
      // dikey: ziyaretçinin solunda, alt şeridin üstünden yukarı doğru (2 sütun)
      const H = this.o.ekran.clientHeight || 844;
      this.tepsi.style.cssText = `left:12px;bottom:${(H - y + 6).toFixed(0)}px;max-width:${Math.max(150, x - k * 0.45 - 20).toFixed(0)}px`;
    }
    this.tepsi.classList.toggle('pt-dikey', dikey);
  }

  // ---------------------------------------------------------------- konuşma
  /** Kişinin sözü (anahtar: content → v2.ziyaret.sozler.<grup>.<anahtar>) ya da hazır Seri 2 kaydı (hazir: <id>) */
  private async soyle(p: Oyuncu | undefined, anahtar: string) {
    if (!p || this.kapandi) return;
    let metin: string | null;
    let secenek: KonusmaSecenegi = SES[p.kim];
    if (anahtar.startsWith('hazir:')) {
      metin = hazirSes(anahtar.slice(6));
      secenek = {};
      if (!metin) return;
    } else metin = SOZ[GRUP[p.kim] ?? '']?.[anahtar] ?? null;
    if (!metin) return;
    this.gunluk.push(`${p.kim}:${anahtar}`);
    p.z.konus(true);
    // ses kısa sürse ya da hiç çalmasa da (ses kapalı) sahne aceleye gelmez: ağız sözün süresince oynar
    const enAz = sakin() ? 0 : anahtar.startsWith('hazir:') ? 900 : 350 + metin.replace(/\[[^\]]*\]/g, '').length * 55;
    try {
      await Promise.all([konus(metin, secenek), bekle(enAz)]);
    } finally {
      p.z.konus(false);
    }
  }
  private kisi(k: Kisi) {
    return this.oyuncular.find((p) => p.kim === k);
  }

  // ---------------------------------------------------------------- başlat / bitir
  /** Bir ziyareti başlatır (test: window.__pati.ziyaretGetir) */
  async baslat(id: ZiyaretId) {
    if (this.aktif || this.kapandi) return;
    const sahne = SAHNELER[id];
    this.aktif = id;
    this.katman.dataset.aktif = id;
    this.gunluk.length = 0;
    this.o.durum?.(true);
    ses.zil();
    const ilk = !Object.values(this.o.kayit.ziyaretler).some((n) => n > 0);
    void this.o.nehir.soyle(ilk ? NEHIR2.kapi_caldi : NEHIR2.misafir);
    this.oyuncular = sahne.kisiler.map((kim) => ({ kim, z: ziyaretciKur(kim) }));
    for (const p of this.oyuncular) this.katman.insertBefore(p.z.el, this.tepsi);
    this.yerlesim();
    if (id === 'babaanne') this.kisi('babaanne')?.z.parca('tepsi', true), this.kisi('babaanne')?.z.parca('buhar', true);
    await Promise.all(this.oyuncular.map((p, i) => bekle(i * 160).then(() => p.z.gir(900))));
    await bekle(200);
    try {
      await this.sahneOyna(id);
    } catch {
      /* sahne yarıda kaldı (kapandı): sessizce */
    }
    await this.bitirSahne(id);
  }

  private async bitirSahne(id: ZiyaretId) {
    if (this.kapandi) return;
    this.bekleyis = null;
    this.katman.dataset.bekleyis = '';
    this.balon.classList.remove('acik');
    this.tepsi.replaceChildren();
    for (const f of this.birak) f();
    this.birak = [];
    await Promise.all(this.oyuncular.map((p, i) => bekle(i * 120).then(() => p.z.cik(900))));
    for (const p of this.oyuncular) {
      p.z.kapat();
      p.z.el.remove();
    }
    this.oyuncular = [];
    this.parti?.kapat();
    this.parti = null;
    this.o.kayit.ziyaretler[id] = (this.o.kayit.ziyaretler[id] ?? 0) + 1;
    this.o.kaydet();
    this.son = [...this.son, id].slice(-4);
    this.aktif = null;
    this.katman.dataset.aktif = '';
    this.sonBitis = performance.now();
    this.o.durum?.(false);
    this.o.bitti?.(id);
  }

  /** Çocuk seçene kadar (ya da 90 sn) bekler; ziyaretçi bu arada kendi hâlini yapar */
  private bekle(ne: NonNullable<Ziyaret['bekleyis']>, idle?: () => void): Promise<boolean> {
    this.bekleyis = ne;
    this.katman.dataset.bekleyis = ne;
    return new Promise((coz) => {
      let bitti = false;
      const t0 = performance.now();
      const z = window.setInterval(() => {
        if (bitti || this.kapandi) return;
        if (performance.now() - t0 > BEKLEME) son(false);
        else if (Math.random() < 0.08) idle?.();
      }, 900);
      const son = (secti: boolean) => {
        if (bitti) return;
        bitti = true;
        clearInterval(z);
        this.bitir = null;
        this.bekleyis = null;
        this.katman.dataset.bekleyis = '';
        coz(secti);
      };
      this.bitir = () => son(true);
    });
  }
  /** Beklerken: Baba uyuklar, Lokum bakınır, Dede kasketini düzeltir, öbürleri gülümser */
  private bosta = () => {
    const p = this.oyuncular[Math.floor(Math.random() * this.oyuncular.length)];
    if (!p) return;
    if (p.kim === 'baba') return void p.z.ifade('keyif', 1600);
    if (p.kim === 'lokum') return void p.z.oynat('bak', 600);
    if (p.kim === 'dede') return void p.z.oynat('var', 500);
    p.z.ifade('mutlu', 800);
    void p.z.oynat('bak', 600);
  };
  private balonGoster(resim: string | null) {
    const u = resim ? (resim.startsWith('esya-') ? esyaResmi(resim.slice(5)) : null) ?? adres(resim) ?? (resim === 'sus-saksi' ? null : null) : null;
    if (this.o.yas() !== 'kucuk' || !u) return this.balon.classList.remove('acik');
    this.balon.replaceChildren(h('span.pt-zy-balon-ic', {}, h('img', { src: u, alt: '', draggable: 'false' })), h('i.pt-balon2-k1'), h('i.pt-balon2-k2'));
    this.balon.classList.add('acik');
    this.balonYerlesim();
    ezil(this.balon.firstElementChild, 1.6, 420);
  }

  // ---------------------------------------------------------------- sahneler
  private async sahneOyna(id: ZiyaretId) {
    const y = this.o.yas();
    switch (id) {
      case 'kino':
        return this.kinoSahnesi();
      case 'babaanne':
        return this.babaanneSahnesi();
      case 'liste':
        return this.listeSahnesi();
      case 'parti':
        return this.partiSahnesi();
      case 'foto':
        return this.fotoSahnesi();
      case 'diken':
        return;
    }
    // hayvan isteyenler: Lokum (Anne), Baba, Dede, çocuklar
    const ana = this.oyuncular[0];
    if (id === 'lokum') await this.soyle(ana, 'lokum');
    else if (id === 'baba') {
      await this.soyle(ana, 'esne');
      ana.z.ifade('keyif', Infinity);
      this.zz(true);
      this.cayTepsisi();
    } else if (id === 'dede') {
      void ana.z.oynat('var', 500);
      await this.soyle(ana, 'istek');
    } else {
      selamVer(ana.z);
      await this.soyle(ana, id === 'ege' ? 'ege' : id);
    }
    this.balonGoster(SAHNELER[id].balon);
    const secti = await this.bekle('hayvan', id === 'baba' ? undefined : this.bosta);
    this.balon.classList.remove('acik');
    if (!secti) {
      this.zz(false);
      ana.z.ifade('mutlu', 1200);
      await this.o.nehir.soyle(P.nehir.yarin).catch(() => undefined);
      return;
    }
    // çocuğun seçtiği hayvanın (ya da çayın) sahnesi bitene kadar
    await this.sahneSozu;
    this.sahneSozu = null;
    void y;
  }
  private sahneSozu: Promise<void> | null = null;

  // ---------------------------------------------------------------- hayvan ziyaretçiye
  /** Bekleyen ziyaretçiye hayvan (dokunuş ya da sürükleme). true: alındı */
  hayvanVer(s: SahipHayvan): boolean {
    if (this.bekleyis === 'foto') return this.fotoyaEkle(s);
    if (this.bekleyis !== 'hayvan' && !(this.bekleyis === 'ikram' && this.secilenIkram)) return false;
    if (this.bekleyis === 'ikram') {
      const e = this.secilenIkram!;
      this.secilenIkram = null;
      void this.ikramVer(e, s);
      return true;
    }
    const z = this.aktif!;
    this.sahneSozu = this.hayvanSahnesi(z, s);
    this.bitir?.();
    return true;
  }
  /** Sürüklenen hayvan ziyaretçinin üstünde bırakıldı mı */
  birakildi(s: SahipHayvan, x: number, y: number): boolean {
    if (this.bekleyis !== 'hayvan' && this.bekleyis !== 'foto') return false;
    const ust = this.oyuncular.some((p) => icinde(p.z.el.getBoundingClientRect(), x, y, 30)) || icinde(this.bank.getBoundingClientRect(), x, y, 20);
    if (!ust && this.bekleyis !== 'foto') return false;
    return this.hayvanVer(s);
  }
  get surukleAcik() {
    return this.bekleyis === 'hayvan' || this.bekleyis === 'foto';
  }

  /** Hayvan yerinden ziyaretçinin yanına hoplar (geçici kopya; asıl hayvan yerinde görünmez) */
  private async getir(s: SahipHayvan, hedefX: number, hedefY: number, boy?: number): Promise<Hayvan> {
    const kaynak = this.o.hayvanKutusu(s.id);
    const k = this.katman.getBoundingClientRect();
    const b = Math.min(boy ?? this.yer().k * 0.62, enCokCssBoy(pozAdresi(s.id, 'bos').url) ?? 140);
    this.o.gizle(s.id, true);
    if (kaynak && !sakin()) {
      const img = h('img.pt-zy-ucan', { src: pozAdresi(s.id, 'sevinc').url, alt: '', draggable: 'false', style: `width:${b * 0.9}px;height:${b}px` });
      await this.o.efekt.ucur(img, [kaynak.left - k.left + kaynak.width / 2, kaynak.top - k.top + kaynak.height / 2], [hedefX, hedefY - b / 2], { ms: 560, kavis: -120 });
    }
    const hv = new Hayvan({ ad: s.id, boy: b, x: hedefX, y: hedefY });
    hv.el.classList.add('pt-zy-hayvan');
    this.katman.insertBefore(hv.el, this.tepsi);
    this.gecici.push(hv);
    void hv.zipla(30, 360, 'sevinc');
    hv.sesi(1);
    return hv;
  }
  /** Geçici kopya yerine döner, asıl hayvan hoplayarak görünür */
  private async gonder(s: SahipHayvan, hv: Hayvan) {
    const k = this.katman.getBoundingClientRect();
    const r = hv.kutu();
    hv.el.remove();
    hv.kapat();
    this.gecici = this.gecici.filter((x) => x !== hv);
    const hedef = this.o.hayvanKutusu(s.id);
    if (hedef && !sakin()) {
      const img = h('img.pt-zy-ucan', { src: pozAdresi(s.id, 'sevinc').url, alt: '', draggable: 'false', style: `width:${r.width}px;height:${r.height}px` });
      await this.o.efekt.ucur(img, [r.left - k.left + r.width / 2, r.top - k.top + r.height / 2], [hedef.left - k.left + hedef.width / 2, hedef.top - k.top + hedef.height / 2], { ms: 520, kavis: -110 });
    }
    this.o.gizle(s.id, false);
  }
  /** Ziyaretçinin yanı (hayvanın duracağı yer) */
  private yan(): [number, number] {
    const { x, y, k, dikey } = this.yer();
    const iki = this.oyuncular.length > 1;
    const W = this.o.ekran.clientWidth || 390;
    return dikey ? [Math.min(W - 44, x + k * (iki ? 1.0 : 0.72)), y] : [x + k * (iki ? 1.05 : 0.75), y];
  }
  private poz = (hv: Hayvan, p: Poz, ms: number) => hv.anlik(pozVar(hv.ad, p) ? p : 'sevinc', ms);

  private async hayvanSahnesi(z: ZiyaretId, s: SahipHayvan) {
    const sonuc = hayvanSonucu(z, s.id);
    this.gunluk.push(`sahne:${sonuc.sahne}`, `uygun:${sonuc.uygun ? 1 : 0}`);
    const [hx, hy] = this.yan();
    const hv = await this.getir(s, hx, hy);
    const ana = this.oyuncular[0];
    const lokum = this.kisi('lokum');
    const kutu = () => {
      const r = hv.kutu();
      const k = this.o.efekt.kutu();
      return [r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.3] as [number, number];
    };
    await bekle(350);
    switch (sonuc.sahne) {
      // ---- Z2 Lokum
      case 'oksar':
        lokum?.z.ifade('keyif', 1600);
        void this.poz(hv, 'fircalanma', 1600);
        this.o.efekt.kalpler(...kutu(), 4);
        await this.soyle(lokum, 'hazir:s2-lok2');
        await this.soyle(ana, 'yavas');
        break;
      case 'yalar':
      case 'abi':
        hv.sesi(2);
        await hv.zipla(70, 420, 'sevinc');
        lokum?.z.ifade('saskin', 500);
        await bekle(400);
        lokum?.z.ifade('keyif', 1400);
        void lokum?.z.oynat('sevin', 700);
        if (sonuc.sahne === 'abi') {
          await this.soyle(lokum, 'hazir:s1-lok1');
          ana.z.ifade('keyif', 1400);
          await this.soyle(ana, 'gul');
        } else await this.soyle(lokum, 'hazir:s2-lok1');
        break;
      case 'basa-konar': {
        const p = lokum ?? ana;
        const [bx, by] = p.z.basUstu();
        hv.sesi(2);
        if (!sakin()) await hv.el.animate([{ translate: '0 0' }, { translate: `${bx - hx}px ${by - hy + 20}px` }], { duration: 600, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' }).finished.catch(() => undefined);
        p.z.ifade('saskin', 700);
        await bekle(500);
        p.z.ifade('keyif', 1200);
        await this.soyle(p, p.kim === 'lokum' ? 'hazir:s1-lok2' : 'komik');
        break;
      }
      case 'cam':
        void lokum?.z.oynat('bak', 700);
        await this.soyle(lokum, 'hazir:o1-pft');
        this.o.efekt.kopuk(...kutu(), 1);
        void this.poz(hv, 'saskin', 900);
        lokum?.z.ifade('keyif', 1000);
        break;
      case 'bekler':
        void this.poz(hv, 'begenmedi', 1600);
        await bekle(1200);
        await this.soyle(lokum, 'yok');
        void hv.zipla(30, 380, 'sevinc');
        lokum?.z.ifade('keyif', 1200);
        await this.soyle(lokum, 'hazir:s2-lok2');
        break;
      // ---- Z8 çocuklar
      case 'top':
        hv.sesi(2);
        for (let i = 0; i < 2; i++) await hv.zipla(60, 380, 'oyun');
        ana.z.ifade('mutlu', 1400);
        await this.soyle(ana, 'can_uygun');
        break;
      case 'yavas-top':
        void this.poz(hv, 'oyun', 1800);
        await bekle(1400);
        ana.z.ifade('keyif', 1200);
        await this.soyle(ana, 'komik');
        break;
      case 'kucakta-uyur':
        void this.poz(hv, 'uyku', 2000);
        this.zz(true, hv);
        ana.z.ifade('keyif', 1600);
        await this.soyle(ana, 'ada_uygun');
        this.zz(false);
        break;
      case 'cikcik':
        ses.cikcik(4);
        for (let i = 0; i < 3; i++) await hv.zipla(30, 260);
        ana.z.ifade('keyif', 1200);
        await this.soyle(ana, 'komik2');
        break;
      case 'sarki':
        ses.cikcik(6);
        void this.poz(hv, 'ozel', 1600);
        this.o.efekt.parilti(...kutu(), 8, 0.8, '#FFE45C');
        ana.z.ifade('mutlu', 1600);
        await this.soyle(ana, 'elif_uygun');
        break;
      case 'uluma':
        hv.sesi(3);
        void this.poz(hv, 'iyy', 1400);
        ana.z.ifade('saskin', 900);
        await bekle(900);
        ana.z.ifade('keyif', 1200);
        await this.soyle(ana, 'komik');
        break;
      case 'yavas':
        void this.poz(hv, 'fircalanma', 1600);
        this.o.efekt.kalpler(...kutu(), 3);
        ana.z.ifade('mutlu', 1400);
        await this.soyle(ana, 'ege_uygun');
        break;
      // ---- Z4 Baba
      case 'hapsu':
        void this.poz(hv, 'oyun', 900);
        await bekle(500);
        this.zz(false);
        ana.z.ifade('saskin', 900);
        void ana.z.oynat('var', 500);
        await this.soyle(ana, 'hapsu');
        break;
      case 'gidik':
        hv.sesi(2);
        await hv.zipla(70, 420, 'sevinc');
        this.zz(false);
        ana.z.ifade('keyif', 1400);
        void ana.z.oynat('sevin', 800);
        await this.soyle(ana, 'gidik');
        break;
      case 'cep':
        await hv.zipla(60, 420, 'sevinc');
        this.zz(false);
        ana.z.ifade('saskin', 1200);
        void ana.z.oynat('var', 500);
        await this.soyle(ana, 'cep');
        break;
      case 'kus':
        ses.cikcik(6);
        void this.poz(hv, 'ozel', 1400);
        await this.soyle(ana, 'kus');
        break;
      case 'uyur':
        void this.poz(hv, 'uyku', 2200);
        this.zz(true, hv);
        await bekle(1800);
        this.zz(false);
        ana.z.ifade('saskin', 800);
        await this.soyle(ana, 'hapsu');
        break;
      // ---- Z6 Dede
      case 'guzel':
        void this.poz(hv, 'fircalanma', 1500);
        await bekle(700);
        ana.z.ifade('mutlu', 1200);
        await this.soyle(ana, 'guzel');
        break;
      case 'kasket':
        hv.sesi(2);
        ana.z.parca('kasket', false);
        ana.z.ifade('saskin', 1600);
        await hv.zipla(80, 420, 'sevinc');
        await this.soyle(ana, 'bak');
        ana.z.parca('kasket', true);
        break;
      case 'kasket-kus': {
        const [bx, by] = ana.z.basUstu();
        if (!sakin()) await hv.el.animate([{ translate: '0 0' }, { translate: `${bx - hx}px ${by - hy + 24}px` }], { duration: 600, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' }).finished.catch(() => undefined);
        ana.z.ifade('saskin', 1800);
        ses.cikcik(3);
        await bekle(1500);
        break;
      }
      case 'goz-kirp':
        void ana.z.oynat('bak', 700);
        void this.poz(hv, 'saskin', 1000);
        await bekle(700);
        ana.z.ifade('keyif', 300);
        void hv.anlik('goz', 300);
        await bekle(500);
        break;
      default:
        // koklar: hayvan ziyaretçiyi koklar, ziyaretçi şaşırır sonra güler
        await hv.kokla();
        ana.z.ifade('saskin', 700);
        await bekle(600);
        ana.z.ifade('keyif', 1100);
        if (ana.kim === 'can' || ana.kim === 'ada' || ana.kim === 'elif' || ana.kim === 'ege-anne') await this.soyle(ana, 'komik2');
        else if (ana.kim === 'dede') await this.soyle(ana, 'bak');
        else if (ana.kim === 'baba') await this.soyle(ana, 'hapsu');
        else await bekle(700);
    }
    this.zz(false);
    if (sonuc.uygun) this.o.kalpVer(s.id);
    await this.jetonVer(ana, ziyaretJetonu(sonuc.uygun, this.o.yas()));
    // vedalar
    if (z === 'lokum') await this.soyle(ana, 'tesekkur');
    else if (z === 'baba') {
      await this.soyle(ana, 'biskuvi');
      this.hediyeEsya('kemik-biskuvi');
    } else if (z === 'dede') {
      // "Arkada bahçe olur…" yalnız Bahçe dükkânda alınabiliyorsa (yayın kapsamında yok: yayin.ts)
      if (!(this.o.kayit.ziyaretler.dede ?? 0) && KOSELER.bahce) await this.soyle(ana, 'bahce');
      else ana.z.ifade('mutlu', 800);
    } else if (['can', 'ada', 'elif', 'ege'].includes(z)) await this.soyle(ana, 'tesekkur');
    await this.gonder(s, hv);
  }

  // ---------------------------------------------------------------- Z1 Kino, Z5 Babaanne: ikram
  private ikramTepsisi(ikramlar: readonly string[]) {
    this.tepsi.replaceChildren();
    for (const e of ikramlar) {
      const icerik = esyaVar(e)
        ? esyaEl(e)
        : e === 'borek' && BOREK
          ? h('img', { src: BOREK, alt: '', draggable: 'false', 'data-yemek': e })
          : h('span.pt-zy-yemek.pt-yer-tutucu', { 'data-yemek': e });
      const b = h('button.pt-zy-ikram', { type: 'button', 'data-ikram': e, 'aria-label': e }, icerik) as HTMLButtonElement;
      b.addEventListener('click', () => {
        this.o.etkilesim();
        this.secilenIkram = e;
        for (const x of this.tepsi.children) x.classList.toggle('secili', x === b);
        ezil(b, 1.5, 340);
        ses.pit();
        if (this.aktif === 'kino') void this.soyle(this.kisi('kino'), 'kime');
      });
      this.birak.push(elSurukle(b, this.ikramSurukle(e, b)));
      this.tepsi.append(b);
    }
    this.tepsiYerlesim();
  }
  private ikramSurukle(e: string, b: HTMLButtonElement) {
    let tut: Tutulan | null = null;
    return {
      basla: (x: number, y: number) => {
        this.o.etkilesim();
        const r = b.getBoundingClientRect();
        tut = new Tutulan(this.o.efekt, (b.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement, { en: r.width, boy: r.height, sinif: 'pt-tutulan-ikram' });
        tut.yer(x, y);
        b.classList.add('pt-tutuldu');
      },
      tasi: (x: number, y: number, dx: number) => tut?.yer(x, y, dx),
      birak: (x: number, y: number, kisa: boolean) => {
        b.classList.remove('pt-tutuldu');
        const t = tut;
        tut = null;
        if (!t) return;
        const s = kisa ? null : this.o.kayit.hayvanlar.find((h_) => {
          const r = this.o.hayvanKutusu(h_.id);
          return r && icinde(r, x, y, 18);
        });
        if (s) {
          t.kaldir();
          void this.ikramVer(e, s);
          return;
        }
        const r = b.getBoundingClientRect();
        void t.don_([r.left + r.width / 2, r.top + r.height / 2], 260);
      },
    };
  }
  private ikramBekleyen: ((e: string) => void) | null = null;
  /** Bir ikram bir hayvana: hayvan tadar, ziyaretçi tepki verir; ikram tepsiden kalkar */
  private async ikramVer(e: string, s: SahipHayvan) {
    if (this.bekleyis !== 'ikram') return;
    const b = this.tepsi.querySelector<HTMLElement>(`[data-ikram="${e}"]`);
    if (!b) return;
    b.remove();
    this.secilenIkram = null;
    this.bekleyis = null;
    const ana = this.oyuncular[0];
    const kutu = this.o.hayvanKutusu(s.id);
    const k = this.o.efekt.kutu();
    // ikram hayvana uçar (Kino peşinden koşar gibi hoplar)
    const r0 = b.getBoundingClientRect();
    if (kutu && !sakin()) {
      void ana.z.oynat('sevin', 600);
      const uc = (b.firstElementChild as HTMLElement | null)?.cloneNode(true) as HTMLElement;
      if (uc) {
        uc.style.width = `${r0.width}px`;
        uc.style.height = `${r0.height}px`;
        await this.o.efekt.ucur(uc, [r0.left - k.left + r0.width / 2, r0.top - k.top + r0.height / 2], [kutu.left - k.left + kutu.width / 2, kutu.top - k.top + kutu.height * 0.6], { ms: 520, kavis: -90 });
      }
    }
    const sonuc = ikramSonucu(s.id, e, this.o.yas());
    this.gunluk.push(`ikram:${e}:${s.id}:${sonuc}`);
    const kx = kutu ? kutu.left - k.left + kutu.width / 2 : 0;
    const ky = kutu ? kutu.top - k.top + kutu.height * 0.3 : 0;
    if (sonuc === 'sever' || sonuc === 'olur') {
      this.o.efekt.kalpler(kx, ky, sonuc === 'sever' ? 5 : 2);
      ses.lap(2);
      this.ikramUygun++;
      if (this.aktif === 'kino') {
        ana.z.ifade('mutlu', 1400);
        await this.soyle(ana, 'hazir:o1-bak');
      } else {
        ana.z.ifade('mutlu', 1200);
        await this.soyle(ana, 'aferin');
      }
      if (sonuc === 'sever') this.o.kalpVer(s.id);
    } else if (sonuc === 'insan-kapar') {
      // köpek böreği kapar; 5-6'da karnı guruldar
      ses.lap(3);
      ana.z.ifade('saskin', 1000);
      if (this.o.yas() === 'buyuk') {
        await bekle(700);
        ses.gurul();
      }
      await this.soyle(ana, 'olmadi');
      await this.o.nehir.soyle(NEHIR2.ders2.insan_yemegi).catch(() => undefined);
    } else {
      // sevmez / insan yemeğini iter: koklar, burnunu kırıştırır
      ses.hmm();
      ana.z.ifade('saskin', 900);
      if (this.aktif === 'kino') {
        // balık yemi tozu: hapşu
        if (e === 'balik-yemi') await this.soyle(ana, 'hazir:o1-hapsu');
        await this.soyle(ana, 'hazir:s2-kino1');
      } else {
        await this.soyle(ana, 'olmadi');
        if (INSAN_YEMEGI.includes(e)) await this.o.nehir.soyle(NEHIR2.ders2.insan_yemegi).catch(() => undefined);
      }
    }
    this.ikramBekleyen?.(e);
  }
  private ikramUygun = 0;
  /** İkram sahnesi: tepsideki her şey verilene kadar (ya da 90 sn; hiç vermemek de serbest) */
  private async ikramDongusu(ikramlar: readonly string[], enAz: number): Promise<void> {
    this.ikramUygun = 0;
    this.ikramTepsisi(ikramlar);
    let verilen = 0;
    while (this.tepsi.children.length && !this.kapandi) {
      const secti = await Promise.race([
        this.bekle('ikram', this.bosta),
        new Promise<boolean>((coz) => {
          this.ikramBekleyen = () => {
            verilen++;
            coz(true);
          };
        }),
      ]);
      this.ikramBekleyen = null;
      this.bitir?.();
      if (!secti) break;
      if (verilen >= enAz && this.aktif === 'babaanne') break;
      await bekle(300);
    }
    this.tepsi.replaceChildren();
  }
  private async kinoSahnesi() {
    const kino = this.kisi('kino')!;
    void kino.z.oynat('sevin', 700);
    await this.soyle(kino, 'selam');
    await this.soyle(kino, 'hazir:s1-kino3');
    await this.ikramDongusu(KINO_IKRAM, 3);
    // giderken jetonları kendi kumbarasından sayarak bırakır: "Bir! İki! Üç!"
    await this.jetonVer(kino, ziyaretJetonu(this.ikramUygun > 0, this.o.yas()), true);
    void kino.z.oynat('var', 600);
    await this.soyle(kino, 'gule');
  }
  private async babaanneSahnesi() {
    const b = this.kisi('babaanne')!;
    await this.soyle(b, 'tepsi');
    await this.ikramDongusu(babaanneTepsisi(this.o.yas()), 2);
    b.z.parca('buhar', false);
    await this.jetonVer(b, ziyaretJetonu(this.ikramUygun > 0, this.o.yas()));
    await this.soyle(b, 'afiyet');
    b.z.parca('tepsi', false);
    // tepsideki çay rafta kalır (Baba'yı uyandırmaya yarar)
    this.o.kayit.ziyaretler.cay = 1;
  }

  // ---------------------------------------------------------------- Z4: çay
  private cayTepsisi() {
    if (!(this.o.kayit.ziyaretler.cay ?? 0) || !CAY) return;
    this.tepsi.replaceChildren();
    const b = h('button.pt-zy-ikram.pt-zy-cay', { type: 'button', 'data-ikram': 'cay', 'aria-label': 'Çay' }, CAY ? h('img', { src: CAY, alt: '', draggable: 'false' }) : h('span.pt-yer-tutucu'));
    const ver = () => {
      if (this.bekleyis !== 'hayvan') return;
      this.sahneSozu = this.cayVer(b);
      this.bitir?.();
    };
    b.addEventListener('click', ver);
    this.birak.push(
      elSurukle(b, {
        basla: () => ezil(b, 1.2),
        tasi: () => undefined,
        birak: (x, y) => {
          const p = this.kisi('baba');
          if (p && icinde(p.z.el.getBoundingClientRect(), x, y, 30)) ver();
        },
      }),
    );
    this.tepsi.append(b);
    this.tepsiYerlesim();
  }
  private async cayVer(b: HTMLElement) {
    b.remove();
    const baba = this.kisi('baba')!;
    this.gunluk.push('sahne:cay', 'uygun:1');
    this.zz(false);
    baba.z.ifade('saskin', 900);
    void baba.z.oynat('sevin', 800);
    await this.soyle(baba, 'cay');
    await this.jetonVer(baba, ziyaretJetonu(true, this.o.yas()));
    await this.soyle(baba, 'biskuvi');
    this.hediyeEsya('kemik-biskuvi');
  }

  // ---------------------------------------------------------------- Z3 Anne'nin listesi
  private async listeSahnesi() {
    const anne = this.kisi('anne')!;
    const { liste, secenekler } = listeSec(this.listeKez++);
    void anne.z.oynat('var', 500);
    anne.z.ifade('saskin', 1200);
    await this.soyle(anne, 'liste');
    // 3-4: balonda resmi; 5-6: yalnız ipuçları (bilmece)
    this.balonGoster(this.o.yas() === 'kucuk' ? `esya-${liste.cevap}` : null);
    this.listeTepsisi(secenekler, liste);
    let ipucu = 0;
    await this.soyle(anne, liste.ipuclari[ipucu++]);
    let bulundu = false;
    while (!bulundu && !this.kapandi) {
      const secti = await Promise.race([
        this.bekle('esya', this.bosta),
        new Promise<boolean>((coz) => {
          this.esyaBekleyen = async (e) => {
            const r = listeSonucu(liste, e);
            this.gunluk.push(`liste:${e}:${r}`);
            await this.listeTepki(r);
            if (r === 'buldun') bulundu = true;
            else if (ipucu < liste.ipuclari.length) await this.soyle(anne, liste.ipuclari[ipucu++]);
            coz(true);
          };
        }),
      ]);
      this.esyaBekleyen = null;
      this.bitir?.();
      if (!secti) break;
    }
    this.balon.classList.remove('acik');
    this.tepsi.replaceChildren();
    if (bulundu) await this.jetonVer(anne, ziyaretJetonu(true, this.o.yas()));
    else await this.o.nehir.soyle(P.nehir.yarin).catch(() => undefined);
  }
  private esyaBekleyen: ((e: string) => Promise<void>) | null = null;
  private listeTepsisi(secenekler: string[], _l: Liste) {
    this.tepsi.replaceChildren();
    for (const e of secenekler) {
      const b = h('button.pt-zy-ikram', { type: 'button', 'data-esya': e, 'aria-label': e }, esyaEl(e)) as HTMLButtonElement;
      const ver = () => {
        if (this.bekleyis !== 'esya' || !this.esyaBekleyen) return;
        this.o.etkilesim();
        this.bekleyis = null;
        ezil(b, 1.5, 340);
        void this.esyaUcur(b).then(() => this.esyaBekleyen?.(e));
      };
      b.addEventListener('click', ver);
      this.birak.push(
        elSurukle(b, {
          basla: () => ezil(b, 1.2),
          tasi: () => undefined,
          birak: (x, y, kisa) => {
            if (kisa) return;
            const p = this.kisi('anne');
            if (p && icinde(p.z.el.getBoundingClientRect(), x, y, 30)) ver();
          },
        }),
      );
      this.tepsi.append(b);
    }
    this.tepsiYerlesim();
  }
  /** Eşya tepsiden Anne'nin eline uçar */
  private async esyaUcur(b: HTMLElement) {
    const p = this.kisi('anne');
    if (!p || sakin()) return;
    const k = this.o.efekt.kutu();
    const r = b.getBoundingClientRect();
    const [ex, ey] = p.z.el_();
    const uc = (b.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
    uc.style.width = `${r.width}px`;
    uc.style.height = `${r.height}px`;
    await this.o.efekt.ucur(uc, [r.left - k.left + r.width / 2, r.top - k.top + r.height / 2], [ex - k.left, ey - k.top], { ms: 480, kavis: -80 });
  }
  private async listeTepki(r: ReturnType<typeof listeSonucu>) {
    const anne = this.kisi('anne')!;
    const [ex, ey] = anne.z.el_();
    const k = this.o.efekt.kutu();
    if (r === 'buldun') {
      anne.z.ifade('mutlu', 1600);
      void anne.z.oynat('sevin', 800);
      this.o.efekt.konfeti(ex - k.left, ey - k.top - 40, 18, 100);
      await this.soyle(anne, 'buldun');
    } else if (r === 'islandim') {
      ses.sprey();
      this.o.efekt.serpinti(ex - k.left, ey - k.top - 60, ex - k.left, ey - k.top + 40, 10);
      anne.z.ifade('saskin', 700);
      await bekle(500);
      anne.z.ifade('keyif', 1400);
      await this.soyle(anne, 'islandim');
    } else if (r === 'sarilir') {
      anne.z.ifade('keyif', 1600);
      this.o.efekt.kalpler(ex - k.left, ey - k.top - 40, 3);
      await this.soyle(anne, 'olmadi');
    } else if (r === 'kum') {
      ses.firca();
      void anne.z.oynat('var', 700);
      await this.soyle(anne, 'hazir:s2-anne2');
    } else {
      anne.z.ifade('saskin', 800);
      await this.soyle(anne, 'olmadi');
    }
  }

  // ---------------------------------------------------------------- Z7 Mino'nun partisi
  private async partiSahnesi() {
    const mino = this.kisi('mino')!;
    void mino.z.dans(4, 380);
    await this.soyle(mino, 'selam');
    void this.o.nehir.soyle(NEHIR2.parti_zamani);
    await this.soyle(mino, 'dans');
    const parti = new Parti({
      hayvanlar: () => this.o.gorunenHayvanlar(),
      jetonBirak: (id, n) => {
        this.o.kayit.jeton += n;
        this.o.kaydet();
        this.o.jetonBirak(id, n);
      },
      minoDans: (v, a) => mino.z.dans(v, a),
      minoSoyle: (a) => this.soyle(mino, a),
      etkilesim: () => this.o.etkilesim(),
    });
    this.parti = parti;
    this.tepsi.replaceChildren(parti.el);
    this.tepsiYerlesim();
    // çocuk müziği değiştirip dener; 3 müzikten sonra (ya da uzun sessizlikte) Mino gider
    const t0 = performance.now();
    this.bekleyis = 'muzik';
    this.katman.dataset.bekleyis = 'muzik';
    let son = performance.now();
    let sayi = 0;
    while (!this.kapandi) {
      await bekle(400);
      if (parti.secimSayisi !== sayi) {
        sayi = parti.secimSayisi;
        son = performance.now();
      }
      if (parti.caliyor) continue;
      if (sayi >= 3 || performance.now() - son > Math.min(BEKLEME, 40000) || performance.now() - t0 > BEKLEME * 2) break;
    }
    this.gunluk.push(...parti.gecmis.map((g) => `parti:${g.muzik}:${Object.entries(g.tepkiler).map(([i, t]) => `${i}=${t}`).join(',')}`));
    this.bekleyis = null;
    mino.z.ifade('mutlu', 1000);
    await this.soyle(mino, 'yasasin');
  }
  /** test: partide müzik seç */
  partiCal(m: 'hizli' | 'yavas' | 'komik') {
    return this.parti?.cal(m);
  }

  // ---------------------------------------------------------------- Z9 dükkân fotoğrafı
  private async fotoSahnesi() {
    const kino = this.kisi('kino')!;
    for (const p of this.oyuncular) void p.z.oynat('sevin', 700);
    await this.soyle(kino, 'selam');
    this.fotoSecilen = [];
    const secti = await this.bekle('foto', this.bosta);
    void secti;
    for (const p of this.oyuncular) p.z.ifade('mutlu', 2400);
    await this.soyle(kino, 'foto');
    ses.cik();
    const flas = h('div.pt-flas');
    this.o.ekran.append(flas);
    if (!sakin()) await flas.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: 600, easing: 'ease-out' }).finished.catch(() => undefined);
    flas.remove();
    const ilk = this.fotoSecilen[0] ?? this.o.kayit.hayvanlar[0]?.id;
    if (ilk) {
      this.o.kayit.pano = [...this.o.kayit.pano, `${ilk}:sevinc`].slice(-12);
      this.o.kaydet();
    }
    await this.jetonVer(kino, ziyaretJetonu(this.fotoSecilen.length > 0, this.o.yas()), true);
    for (const id of [...this.fotoSecilen]) {
      const s = this.o.kayit.hayvanlar.find((x) => x.id === id);
      const hv = this.gecici.find((x) => x.ad === id);
      if (s && hv) await this.gonder(s, hv);
    }
    await this.soyle(kino, 'gule');
  }
  private fotoyaEkle(s: SahipHayvan): boolean {
    if (this.fotoSecilen.includes(s.id) || this.fotoSecilen.length >= 4) return false;
    this.fotoSecilen.push(s.id);
    const W = this.o.ekran.clientWidth || 844;
    const { y, k } = this.yer();
    const i = this.fotoSecilen.length - 1;
    void this.getir(s, W * (0.32 + i * 0.12), y + 2, k * 0.5);
    this.gunluk.push(`foto:${s.id}`);
    // 4 hayvan ya da son seçimden 6 sn sonra çekilir
    clearTimeout(this.fotoZaman);
    if (this.fotoSecilen.length >= 4) window.setTimeout(() => this.bitir?.(), sure(900));
    else this.fotoZaman = window.setTimeout(() => this.bitir?.(), sure(6000));
    return true;
  }
  private fotoZaman = 0;

  // ---------------------------------------------------------------- Z10 gece misafiri Diken
  /** Kapanışta, Bahçe açıksa: Diken çalılıktan çıkar, tabağına ne konacağını çocuk seçer */
  async geceMisafiri() {
    if (this.aktif || this.kapandi) return;
    this.aktif = 'diken';
    this.katman.dataset.aktif = 'diken';
    this.gunluk.length = 0;
    const diken: Oyuncu = { kim: 'diken', z: ziyaretciKur('diken') };
    this.oyuncular = [diken];
    this.katman.insertBefore(diken.z.el, this.tepsi);
    const { x, y, k, dikey } = this.yer();
    const dx = dikey ? 0 : k * 1.4;
    diken.z.yerlestir(x + dx, y, k * BOY.diken);
    this.bank.classList.add('pt-gizli');
    ses.burun(2);
    await diken.z.gir(1400);
    void diken.z.oynat('bak', 700);
    this.tepsi.replaceChildren();
    let secilen: string | null = null;
    for (const e of DIKEN_TABAK) {
      const b = h('button.pt-zy-ikram', { type: 'button', 'data-tabak': e, 'aria-label': e }, esyaEl(e));
      b.addEventListener('click', () => {
        if (this.bekleyis !== 'tabak') return;
        secilen = e;
        ezil(b, 1.5, 340);
        this.bitir?.();
      });
      this.tepsi.append(b);
    }
    this.tepsiYerlesim();
    const secti = await this.bekle('tabak');
    this.tepsi.replaceChildren();
    if (secti && secilen) {
      const r = dikenSonucu(secilen);
      this.gunluk.push(`diken:${secilen}:${r}`);
      if (r === 'sevmez') {
        ses.hmm();
        await diken.z.oynat('var', 600);
      } else {
        ses.lap(3);
        await diken.z.oynat('dans', 900);
        const [bx, by] = diken.z.basUstu();
        this.o.efekt.kalpler(bx, by, r === 'sever' ? 4 : 2);
      }
      await this.o.nehir.soyle(NEHIR2.ders2.diken_yabani).catch(() => undefined);
      // sabah bahçede bir hediye bırakmış olur
      this.dikenHediye = true;
    }
    await diken.z.cik(1400);
    diken.z.kapat();
    diken.z.el.remove();
    this.oyuncular = [];
    this.o.kayit.ziyaretler.diken = (this.o.kayit.ziyaretler.diken ?? 0) + 1;
    this.o.kaydet();
    this.aktif = null;
    this.katman.dataset.aktif = '';
  }
  /** Sabah: Diken'in hediyesi (süs) */
  sabah() {
    if (!this.dikenHediye) return;
    this.dikenHediye = false;
    this.o.susHediye();
  }
  private dikenHediye = false;

  // ---------------------------------------------------------------- jeton, hediye, uyku
  /** Jetonlar ziyaretçinin elinden kumbaraya (Kino sayar: "Bir! İki! Üç!") */
  private async jetonVer(p: Oyuncu, n: number, kinoSayar = false) {
    this.o.kayit.jeton += n;
    this.o.kaydet();
    const [ex, ey] = p.z.el_();
    const SAY = ['o1-bir', 'o1-iki', 'o1-uc', 'o1-dort'];
    let gosterilen = this.o.kumbara.jeton;
    for (let i = 0; i < n && !this.kapandi; i++) {
      if (kinoSayar && SAY[i]) void this.soyle(p, `hazir:${SAY[i]}`);
      await jetonUcur(this.o.efekt, [ex, ey], this.o.kumbara.agiz(), 1, 420);
      gosterilen += 1;
      this.o.kumbara.ayarla(Math.min(this.o.kayit.jeton, gosterilen));
      this.o.kumbara.yut();
      ses.jeton(i);
      await bekle(kinoSayar ? 520 : 120);
    }
    this.o.kumbara.ayarla(this.o.kayit.jeton);
  }
  /** Fırından bisküvi: eşya hediye (dolaba) */
  private hediyeEsya(e: string) {
    if (this.o.kayit.esyalar.includes(e)) return;
    this.o.kayit.esyalar.push(e);
    this.o.kaydet();
    this.gunluk.push(`hediye:${e}`);
  }
  private zzEl: HTMLElement | null = null;
  /** Horlama "z z z" (Baba; kucakta uyuyan hayvan) */
  private zz(acik: boolean, hv?: Hayvan) {
    this.zzEl?.remove();
    this.zzEl = null;
    if (!acik) return;
    const p = hv ? null : this.kisi('baba');
    const el = h('div.pt-zy-zz', { 'aria-hidden': 'true' }, h('i', {}, 'z'), h('i', {}, 'z'), h('i', {}, 'z'));
    const k = this.katman.getBoundingClientRect();
    if (p) {
      const [bx, by] = p.z.basUstu();
      el.style.transform = `translate(${bx + 20}px, ${by + 20}px)`;
    } else if (hv) {
      const r = hv.kutu();
      el.style.transform = `translate(${r.right - k.left - 10}px, ${r.top - k.top}px)`;
    }
    this.katman.append(el);
    this.zzEl = el;
  }

  get durum() {
    return { aktif: this.aktif, bekleyis: this.bekleyis, kisiler: this.oyuncular.map((p) => p.kim), gunluk: [...this.gunluk], tepsi: [...this.tepsi.querySelectorAll<HTMLElement>(':scope > [data-ikram], :scope > [data-esya], :scope > [data-tabak], .pt-parti-dugme')].map((x) => x.dataset.ikram ?? x.dataset.esya ?? x.dataset.tabak ?? x.dataset.muzik), balon: this.balon.classList.contains('acik') };
  }

  kapat() {
    this.kapandi = true;
    clearInterval(this.zaman);
    clearTimeout(this.fotoZaman);
    for (const f of this.birak) f();
    for (const p of this.oyuncular) p.z.kapat();
    for (const hv of this.gecici) hv.kapat();
    this.parti?.kapat();
    this.bitir?.();
  }
}
