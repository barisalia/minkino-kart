// Deneyler · Köpüren Renk Volkanı (Paket Deney-Y3, ikinci yazım; yönetici 23 Kasım: "Top Parkuru derinliğinde"). Altı aşama:
//  1 · Hazırlık: çocuk askılıktaki önlüğü, sonra gözlüğü Kino'ya taşır (Kino giyinir; Lokum da gözlüğünü takar), örtüyü serer.
//  2 · Malzemeler: Lokum tezgâhın arkasına eğilip malzemeleri tek tek kaldırır; çocuk her birini yerine koyar, her birinin kendi
//      tepkisi var (volkan gümler, kolba çınlar, karbonat tozu Kino'yu hapşırtır, şişeler şıngırdar).
//  3 · Renk: şişeden kolbaya döker, renkler kolbada karışır (girdap kareleri, renk geçişi); tarif kartı hedefi gösterir.
//  4 · Köpük: kaşıkla karbonat, kolba volkana: köpük doğar, taşar, yamaçtan akar, tepside birikir, kabarır, söner.
//  5 · İkinci tur: çocuk seçer: başka renk ya da kocaman volkan.
//  6 · Temizlik ve ödül: Lokum süngeri getirir, çocuk birikintileri siler; deney defterine volkan çıkartması yapışır.
// Kurallar karisim.ts ve senaryo.ts'te (DOM'suz). His ilkeleri (ekip/KALITE-KURALLARI.md): her dokunuşa 0 ms'de ses ve canlanma,
// 1 sn'den uzun boşluk yok, açılışta 1 sn içinde ne yapılacağı belli, bitiş sevinci en çok 2 sn, karakterler canlı, yanlış komik.
// Çizimler (Astra, assets/deney/volkan/) temel takım tamam değilse sayfa açılmaz; kare dizileri geldikçe kendiliğinden bağlanır.
// Test kipinde (?test=1) çizimsiz görünüm; ?atla=1 hazırlığı ve malzemeyi atlar.
import { sesiAc } from '../../../src/audio/ses';
import { sesMotorunuAc } from '../../../src/audio/motor';
import { menuYasiOku } from '../../../src/engine/menu-yas';
import { geriDinle } from '../../../src/kabuk/yon';
import { anaMenuyeDon } from '../../../src/uygulama';
import { fonTasmasiKur } from '../../../matematik/src/fon-tasma';
import { BOYA, KOLBA_EN_COK, RENKLER, Tezgah, bilesenleri, karisim, tuttu, type Hedef, type Karisim, type Patlama, type Renk, type Yas } from './karisim';
import { CEKMECEDE, MALZEMELER, Senaryo, cikartmaRengi, type HazirlikAdimi, type Malzeme, type Secim } from './senaryo';
import {
  BIRIKINTILER, BIRIKINTI_BOYU, DEFTER, DEFTER_RAF, DEFTER_YENI, DEV_KRATER, DEV_OLCEK, DEV_VOLKAN, FON, GOZLUK, KARBONAT, KASIK,
  KASIK_CANAK, KAVANOZ, KAVANOZ_AGZI, KINO, KINO_GOGUS, KOLBA, VOLKAN, KOLBA_AGZI, KOLBA_SIVI, KOPUK, KRATER, LOKUM, LOKUM_EL, MALZEME_YERI,
  ONLUK, ORTU, RAF_BOYU, SECIM_DEV, SECIM_RENK, SEPET, SISELER, SISE_AGZI, SUNGER, TARIF, TARIF_DAMLALAR, TASIMA_OLCEGI, TEZGAH_Y,
  merkez, yuvaIsigi, type Kutu, type Nokta,
} from './geometri';
import {
  GIYINME, KINO_POZLARI, KINO_YEDEK, Kareler, LOKUM_POZLARI, LOKUM_YEDEK, TEMEL, cizim, dizi, pozCiz, resimEl, var_,
} from './cizimler';
import { dizi as sozDizisi, dongu, efekt, kuyruguBosalt, sesKaydi, sesleriYukle, sirayla, soyle, sozuUnut, type Soz } from './ses';
import './stil.css';

const ARAMA = new URLSearchParams(location.search);
const TEST = ARAMA.has('test');
const AZ_HAREKET = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAZIR = TEMEL.every(var_);
if (!HAZIR && !TEST) anaMenuyeDon();

function yasi(): Yas {
  const a = ARAMA.get('yas');
  const y = a ? Number(a) : menuYasiOku() ?? 4;
  return y <= 3 ? 'minik' : y === 4 ? 'dort' : 'bes';
}
const YAS = yasi();
const dugmeResimleri = import.meta.glob<string>('../../../assets/hazirlik/dugmeler/{ev,dinle,tekrar}.webp', { eager: true, query: '?url', import: 'default' });

// ----- Sahne (16:9; iPad ve telefonda kalan bantları fonun kendi kenarı doldurur) -----
const kok = document.querySelector<HTMLElement>('#sahne')!;
kok.dataset.yas = YAS;
if (TEST) kok.classList.add('vk-test');
const fon = cizim('volkan-fon');
kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
fonTasmasiKur(kok, { yanlar: 'uzat' });

function yer(k: Kutu, el: HTMLElement, ust: Kutu = { x: 0, y: 0, w: FON.w, h: FON.h }) {
  el.style.left = ((k.x - ust.x) / ust.w) * 100 + '%';
  el.style.top = ((k.y - ust.y) / ust.h) * 100 + '%';
  el.style.width = (k.w / ust.w) * 100 + '%';
  el.style.height = (k.h / ust.h) * 100 + '%';
}
function ekle<T extends HTMLElement>(el: T, k: Kutu, ust: HTMLElement = kok, ustKutu?: Kutu): T { yer(k, el, ustKutu); ust.append(el); return el; }
const tamBoy = (el: HTMLElement) => { el.style.cssText += ';left:0;top:0;width:100%;height:100%'; return el; };
/** Öğeyi kendi kutusuna göre fon pikseli kadar kaydırır (translate yüzdesi öğenin kendi boyuna göre). */
const kaydir = (el: HTMLElement, k: Kutu, dx: number, dy: number) => { el.style.translate = (dx / k.w) * 100 + '% ' + (dy / k.h) * 100 + '%'; };
const boya = (el: HTMLElement, r: Karisim) => { el.style.setProperty('--boya', BOYA[r]); el.dataset.renk = r; };
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, AZ_HAREKET ? Math.min(ms, 60) : ms));
const uzak = (a: Nokta, b: Nokta) => Math.hypot(a.x - b.x, a.y - b.y);
/** Kısa hareketi bir kez oynatır, bitince sınıfı kaldırır. */
function birKez(el: HTMLElement | null | undefined, sinif: string, sure: number) {
  if (!el) return;
  el.classList.remove(sinif); void el.offsetWidth; el.classList.add(sinif);
  setTimeout(() => el.classList.remove(sinif), sure);
}
function ekrandanDunyaya(x: number, y: number): Nokta {
  const r = kok.getBoundingClientRect();
  return { x: ((x - r.left) / r.width) * FON.w, y: ((y - r.top) / r.height) * FON.h };
}
/** Tek seferlik efekt karesi (kareler hazır öğede durur; her seferinde baştan oynar). */
class Efekt {
  readonly k: Kareler;
  constructor(ad: string, adet: number, sinif: string, kutu: Kutu, boyali = false) {
    this.k = new Kareler(adet === 1 ? (var_(ad) ? [ad] : []) : dizi(ad, adet), 'vk-efekt ' + sinif, { boyali, ad: adet === 1 ? ad : ad + '-0…' + (adet - 1) });
    ekle(this.k.el, kutu);
  }
  async oyna(ms = 110, kutu?: Kutu, renk?: Karisim) {
    if (kutu) yer(kutu, this.k.el);
    if (renk) boya(this.k.el, renk);
    this.k.el.classList.add('acik');
    if (this.k.bos) birKez(this.k.el, 'puf', ms * 3);
    await this.k.oynat(ms, bekle);
    this.k.el.classList.remove('acik');
  }
}

// ----- Karakterler (tezgâhın arkasında; alt kenarları tezgâh çizgisinde kesik) -----
class Karakter {
  readonly el: HTMLElement;
  readonly kap: HTMLElement;
  private readonly pozlar = new Map<string, HTMLElement>();
  temel: [string, string];
  simdi = '';
  private geri = 0;
  constructor(sinif: string, kutu: Kutu, adlar: string[], private yedek: Record<string, string>, temel: [string, string]) {
    // Kap tezgâh çizgisinde kırpar: eğilen Lokum tezgâhın arkasına iner.
    this.kap = ekle(document.createElement('div'), { x: kutu.x, y: 0, w: kutu.w, h: TEZGAH_Y });
    this.kap.className = 'vk-oge vk-karakter-kap ' + sinif + '-kap';
    this.el = ekle(document.createElement('div'), kutu, this.kap, { x: kutu.x, y: 0, w: kutu.w, h: TEZGAH_Y });
    this.el.className = 'vk-oge vk-karakter ' + sinif;
    for (const ad of adlar) {
      const c = pozCiz(ad, yedek);
      if (this.pozlar.has(c)) continue;
      const e = tamBoy(resimEl(c, 'vk-poz'));
      this.el.append(e);
      this.pozlar.set(c, e);
    }
    this.temel = temel;
    this.poz(temel[0]);
  }
  /** Poz; `sure` verilirse o kadar sonra temel poza döner. */
  poz(ad: string, sure = 0) {
    const c = pozCiz(ad, this.yedek);
    this.simdi = ad;
    this.el.dataset.poz = ad;
    for (const [k, e] of this.pozlar) e.classList.toggle('acik', k === c);
    clearTimeout(this.geri);
    if (sure) this.geri = window.setTimeout(() => this.poz(this.temel[0]), sure);
  }
  temelYap(a: string, b = a) { this.temel = [a, b]; this.poz(a); }
  /** Göz kırpma: temel pozdayken kısa an ikinci temel kare. */
  kirp() {
    if (this.simdi !== this.temel[0] || this.temel[1] === this.temel[0]) return;
    this.poz(this.temel[1]);
    setTimeout(() => { if (this.simdi === this.temel[1]) this.poz(this.temel[0]); }, 170);
  }
  /** Giyinme gibi kare dizisi; dizi gelmediyse CSS "giyin" hareketi. */
  async oynat(ad: string, adet: number, ms: number) {
    const kareler = dizi(ad, adet);
    clearTimeout(this.geri);
    if (!kareler.length) { birKez(this.el, 'giyin', ms * adet); await bekle(ms * adet); return; }
    for (const k of kareler) { this.poz(k); await bekle(ms); }
  }
  tepki() { birKez(this.el, 'tepki', 300); }
}
const kinoDiziler = Object.entries(GIYINME).filter(([a]) => a.startsWith('kino')).flatMap(([a, n]) => Array.from({ length: n }, (_, i) => a + '-' + i));
const lokumDiziler = Object.entries(GIYINME).filter(([a]) => a.startsWith('lokum')).flatMap(([a, n]) => Array.from({ length: n }, (_, i) => a + '-' + i));
const kino = new Karakter('vk-kino', KINO, [...KINO_POZLARI, ...kinoDiziler], KINO_YEDEK, ['kino-hazir-0', 'kino-hazir-1']);
const lokum = new Karakter('vk-lokum', LOKUM, [...LOKUM_POZLARI, ...lokumDiziler], LOKUM_YEDEK, ['lokum-ilk-0', 'lokum-ilk-1']);
const KINO_YUZ: Nokta = { x: KINO.x + 190, y: KINO.y + 165 };
/** Lokum'un eğilişi: çizimi yoksa tezgâhın arkasına kayar. */
function lokumEgil(egil: boolean) {
  lokum.el.classList.toggle('egik', egil && !var_('lokum-egil'));
  if (egil) lokum.poz('lokum-egil');
}

// ----- Duvar: askılık (önlük, gözlük), sonra tarif kartı -----
const onlukEl = ekle(resimEl('onluk', 'vk-onluk vk-tasinir'), ONLUK);
const gozlukEl = ekle(resimEl('gozluk', 'vk-gozluk vk-tasinir'), GOZLUK);
const tarifEl = ekle(resimEl('tarif-kart', 'vk-tarif'), TARIF);
const tarifDamla = TARIF_DAMLALAR.map((d) => ekle(resimEl('damla', 'vk-damla', true), { x: d.x - d.w / 2, y: d.y - d.h / 2, w: d.w, h: d.h }, tarifEl, { x: 0, y: 0, w: TARIF.w, h: TARIF.h }));

// ----- Tezgâh: örtü (açılış kareleri; yoksa serili örtü soldan açılır) -----
const ortuK = new Kareler(dizi('ortu-ac', 3), 'vk-ortu', { ad: 'ortu-ac-0…2' });
ekle(ortuK.el, ORTU);
const ortuSon = ekle(resimEl('ortu', 'vk-ortu vk-ortu-son'), ORTU);
if (ortuK.bos) { ortuK.el.hidden = true; ortuSon.classList.add('rulo'); }
const yuvaIsik = ekle(resimEl('yuva-isik', 'vk-yuva-isik'), yuvaIsigi(VOLKAN));

// ----- Malzemeler -----
const volkanEl = ekle(resimEl('volkan', 'vk-volkan vk-malzeme'), VOLKAN);
const devVolkanEl = ekle(resimEl('dev-volkan', 'vk-volkan vk-dev'), DEV_VOLKAN);
const karbonatEl = ekle(resimEl('karbonat', 'vk-karbonat'), KARBONAT);
// Kolba: sıvı ve girdap camın arkasında; boya kolbada (sıvı ve girdap aynı renkte, renk geçişi yumuşak).
const kolbaEl = ekle(document.createElement('div'), KOLBA);
kolbaEl.className = 'vk-oge vk-kolba vk-malzeme';
const kolbaSivi = tamBoy(resimEl('kolba-sivi', 'vk-kolba-sivi', true));
const girdap = new Kareler(dizi('girdap', 3), 'vk-girdap', { boyali: true, ad: 'girdap-0…2' });
tamBoy(girdap.el);
const kolbaCam = tamBoy(resimEl('kolba', 'vk-kolba-cam'));
kolbaEl.append(kolbaSivi, girdap.el, kolbaCam);
const kavanozEl = ekle(resimEl('kavanoz', 'vk-kavanoz vk-malzeme'), KAVANOZ);
const kasikEl = ekle(document.createElement('div'), KASIK);
kasikEl.className = 'vk-oge vk-kasik';
const kasikBos = tamBoy(resimEl('kasik', 'vk-kasik-bos'));
const kasikDolu = tamBoy(resimEl('kasik-dolu', 'vk-kasik-dolu'));
kasikEl.append(kasikBos, kasikDolu);
// Şişe kasası: arka yüz, üç şişe, ön tahta (şişelerin altı ön tahtanın arkasında).
const sepetEl = ekle(document.createElement('div'), SEPET);
sepetEl.className = 'vk-oge vk-sepet vk-malzeme';
sepetEl.append(tamBoy(resimEl('sepet', 'vk-sepet-arka')));
const siseEl = {} as Record<Renk, HTMLElement>;
for (const r of RENKLER) siseEl[r] = ekle(resimEl('sise-' + r, 'vk-sise'), SISELER[r], sepetEl, SEPET);
sepetEl.append(tamBoy(resimEl('sepet-on', 'vk-sepet-on')));
const MALZEME_EL: Record<Malzeme, HTMLElement> = { volkan: volkanEl, kolba: kolbaEl, kavanoz: kavanozEl, sepet: sepetEl };

// ----- Köpük (tek tuvalde kare dizileri; boyanır) -----
const KOPUK_DIZI = { dogus: 3, tas: 3, ak: 3, birik: 3, kabar: 2, sonum: 2, fiskir: 2 } as const;
type KopukDizi = keyof typeof KOPUK_DIZI;
const kopukKap = ekle(document.createElement('div'), KOPUK);
kopukKap.className = 'vk-oge vk-kopuk';
const kopukK = {} as Record<KopukDizi, Kareler>;
for (const [ad, n] of Object.entries(KOPUK_DIZI) as [KopukDizi, number][]) {
  kopukK[ad] = new Kareler(dizi('kopuk-' + ad, n), 'vk-kopuk-dizi', { boyali: true, ad: 'kopuk-' + ad + '-0…' + (n - 1) });
  kopukKap.append(tamBoy(kopukK[ad].el));
}
// Diziler gelmediyse tek köpük çizimi (kabar-0) CSS ile kabarır.
const kopukYedek = tamBoy(resimEl('kopuk-kabar-0', 'vk-kopuk-yedek', true));
kopukKap.append(kopukYedek);
const KOPUK_TAM = (['dogus', 'tas', 'ak', 'birik', 'kabar', 'sonum'] as const).every((d) => !kopukK[d].bos);
// Krater üstünde serpinti (köpük patlarken ince damlacık sisi; buhar değil).
const serpinti = new Kareler(dizi('serpinti', 2), 'vk-serpinti', { ad: 'serpinti-0…1' });
ekle(serpinti.el, { x: KRATER.x - 160, y: KRATER.y - 210, w: 320, h: 200 });
// Tepsideki köpük birikintileri.
const birikintiEl = BIRIKINTILER.map((n, i) => {
  const e = ekle(resimEl('birikinti-' + (i % 3), 'vk-birikinti', true), { x: n.x - BIRIKINTI_BOYU.w / 2, y: n.y - BIRIKINTI_BOYU.h / 2, ...BIRIKINTI_BOYU });
  if (i === 3) e.classList.add('ayna');
  return e;
});
// Efektler (önceden kurulu; her seferinde baştan oynar).
const tozEf = new Efekt('toz', 2, 'vk-toz', { x: 0, y: 0, w: 420, h: 150 });
const pufEf = new Efekt('puf', 2, 'vk-puf', { x: 0, y: 0, w: 220, h: 200 });
const cinEf = new Efekt('cin', 1, 'vk-cin', { x: KOLBA.x - 40, y: KOLBA.y - 30, w: 330, h: 380 });
const tozDokEf = new Efekt('toz-dok', 2, 'vk-toz-dok', { x: KRATER.x - 60, y: KRATER.y - 140, w: 120, h: 140 });
const sicramaEf = BIRIKINTILER.map(() => new Efekt('sicrama', 3, 'vk-sicrama', { x: 0, y: 0, w: 260, h: 200 }, true));
const kraterSicrama = new Efekt('sicrama', 3, 'vk-sicrama', { x: KRATER.x - 260, y: KRATER.y - 380, w: 520, h: 400 }, true);
const piriltiEf = BIRIKINTILER.map(() => new Efekt('pirilti', 2, 'vk-pirilti', { x: 0, y: 0, w: 220, h: 160 }));
// Akış (renkli sıvı sütunu): başlar, akar, kopar.
const akis = new Kareler(dizi('akis', 3), 'vk-akis', { boyali: true, yedek: 'akis-1', ad: 'akis-0…2' });
ekle(akis.el, { x: 0, y: 0, w: 70, h: 260 });
// Kabarcıklar (boyalı; üç biçim, sonda pıt diye patlar).
const kabarciklar = Array.from({ length: 12 }, (_, i) => {
  const e = ekle(resimEl('kabarcik-' + (i % 3), 'vk-kabarcik', true), { x: 0, y: 0, w: 60, h: 60 });
  const pat = new Kareler(dizi('kabarcik-pat', 2), 'vk-kabarcik-pat', { boyali: true, ad: 'kabarcik-pat-0…1' });
  e.append(tamBoy(pat.el));
  return { e, pat };
});

// ----- İkinci tur seçimi, sünger, defter -----
const secimRenk = ekle(resimEl('secim-renk', 'vk-secim'), SECIM_RENK);
const secimDev = ekle(resimEl('secim-dev', 'vk-secim'), SECIM_DEV);
const sunger = new Kareler(['sunger', 'sunger-ez'].every(var_) ? ['sunger', 'sunger-ez'] : [], 'vk-sunger vk-tasinir', { yedek: 'sunger', ad: 'sunger' });
const SUNGER_KUTU: Kutu = { x: LOKUM_EL.x - SUNGER.w / 2, y: LOKUM_EL.y - SUNGER.h / 2, ...SUNGER };
ekle(sunger.el, SUNGER_KUTU);
const DEFTER_KARE = ['defter-kapali', 'defter-ac', 'defter-acik'];
const defter = new Kareler(DEFTER_KARE.every(var_) ? DEFTER_KARE : [], 'vk-defter', { yedek: 'defter-acik', ad: 'defter-acik' });
ekle(defter.el, DEFTER);
/** Çıktartma: volkan ve boyanan köpüğü (iki katman, aynı tuval). */
function cikartmaEl(renk: Karisim, k: Kutu, ust: HTMLElement, ustKutu?: Kutu) {
  const e = ekle(document.createElement('div'), k, ust, ustKutu);
  e.className = 'vk-oge vk-cikartma';
  e.append(tamBoy(resimEl('cikartma', 'vk-cikartma-alt')), tamBoy(resimEl('cikartma-kopuk', 'vk-cikartma-kopuk', true)));
  boya(e, renk);
  return e;
}
const yildizEf = new Efekt('yildiz-patla', 3, 'vk-yildiz', { x: DEFTER.x + DEFTER_YENI.x - 200, y: DEFTER.y + DEFTER_YENI.y - 200, w: 400, h: 400 });

// ----- Üst düğmeler -----
const dugme = (ad: 'ev' | 'dinle' | 'tekrar', etiket: string, sinif: string) => {
  const b = document.createElement('button');
  b.className = 'vk-nav ' + sinif;
  b.setAttribute('aria-label', etiket);
  b.innerHTML = '<img src="' + dugmeResimleri['../../../assets/hazirlik/dugmeler/' + ad + '.webp'] + '" alt="" draggable="false">';
  document.body.append(b);
  return b;
};
const ev = dugme('ev', 'Ana menü', 'vk-ev');
const dinle = dugme('dinle', 'Tekrar dinle', 'vk-dinle');
const tekrar = dugme('tekrar', 'Bir daha oyna', 'vk-tekrar');
tekrar.hidden = true;

// ----- Durum -----
let sen = new Senaryo(YAS);
const tezgah = new Tezgah();
let mesgul = false;
let tekrarSayisi = 0;
let patlamaSayisi = 0;
let iskaSayisi = 0;
let devVolkan = false;
let gozlukKopukSoylendi = false;
let renkSoylendi = false;
let dolulukSoylendi = false, boslukSoylendi = false;
let sonDokunus = performance.now();
const turRenkleri: Karisim[] = [];
function durumYaz() {
  kok.dataset.asama = sen.asama;
  kok.dataset.durum = mesgul ? 'mesgul' : 'hazir';
}
const sars = () => { for (const el of [volkanEl, devVolkanEl, kolbaEl, kavanozEl, sepetEl, kasikEl]) birKez(el, 'titre', 340); };
const isle = async (f: () => Promise<void>) => { mesgul = true; durumYaz(); try { await f(); } finally { mesgul = false; durumYaz(); } };
const krater = () => (devVolkan ? DEV_KRATER : KRATER);
const olcek = () => (devVolkan ? DEV_OLCEK : 1);

// ----- Dokunma alanları (görünmez düğmeler; telefonda da en az 64 px) -----
function alan(etiket: string, k: Kutu, sinif = '') {
  const b = document.createElement('button');
  b.className = 'vk-alan ' + sinif;
  b.setAttribute('aria-label', etiket);
  b.hidden = true;
  ekle(b, k);
  b.addEventListener('pointerdown', () => { sonDokunus = performance.now(); sesiAc(); void sesleriYukle(); void basla(); });
  return b;
}
const genis = (k: Kutu, en = 170): Kutu => {
  const w = Math.max(en, k.w), h = Math.max(en, k.h), c = merkez(k);
  return { x: c.x - w / 2, y: c.y - h / 2, w, h };
};
/**
 * Sürükleme: görsel parmağı izler; hedef yaklaşınca mıknatıs gibi çeker; hedefe yakın bırakılınca oturur, uzakta bırakılınca
 * yerine seker. Dokunup bırakmak (sürüklemeden) de olur: parça kendi hedefine uçar (2–3 yaş için sürükleme şart değil).
 */
type Tasima = { gorsel: () => HTMLElement; kutu: () => Kutu; hedef: () => Nokta | null; olcekBas?: () => number; izin: () => boolean; birak: (ok: boolean, p: Nokta) => void; tasirken?: (p: Nokta) => void };
function surukle(b: HTMLButtonElement, t: Tasima) {
  const MIKNATIS = 260, OTUR = 210;
  b.addEventListener('pointerdown', (e) => {
    if (!t.izin()) return;
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    const g = t.gorsel();
    // 0 ms: tık, parça büyür ve gölge alır.
    efekt('tik', 0.7);
    g.classList.add('tutulan');
    birKez(g, 'bas', 220);
    const bas = { x: e.clientX, y: e.clientY };
    let surukluyor = false;
    const tasi = (ev: PointerEvent) => {
      if (!surukluyor && Math.hypot(ev.clientX - bas.x, ev.clientY - bas.y) < 10) return;
      surukluyor = true;
      g.classList.remove('ucuyor');
      const p = ekrandanDunyaya(ev.clientX, ev.clientY), k = t.kutu(), c = merkez(k), h = t.hedef();
      let x = p.x, y = p.y;
      const u = h ? uzak(p, h) : Infinity;
      const cek = u < MIKNATIS ? Math.pow(1 - u / MIKNATIS, 1.5) : 0;
      if (h) { x += (h.x - x) * cek; y += (h.y - y) * cek; }
      kaydir(g, k, x - c.x, y - c.y);
      if (t.olcekBas) g.style.scale = String(t.olcekBas() + (1 - t.olcekBas()) * Math.max(cek, 0.35));
      g.classList.toggle('cekiliyor', cek > 0);
      if (cek > 0 && !g.dataset.cekim) { g.dataset.cekim = '1'; efekt('tak', 0.4); }
      if (cek === 0) delete g.dataset.cekim;
      t.tasirken?.(p);
    };
    const birak = (ev: PointerEvent) => {
      b.removeEventListener('pointermove', tasi);
      b.removeEventListener('pointerup', birak);
      b.removeEventListener('pointercancel', birak);
      g.classList.remove('tutulan', 'cekiliyor');
      delete g.dataset.cekim;
      const p = ekrandanDunyaya(ev.clientX, ev.clientY), h = t.hedef();
      g.classList.add('ucuyor');
      t.birak(!surukluyor || (!!h && uzak(p, h) < OTUR), p);
    };
    b.addEventListener('pointermove', tasi);
    b.addEventListener('pointerup', birak);
    b.addEventListener('pointercancel', birak);
  });
}
/** Görseli fon noktasına uçurur (ortası oraya gelir). */
function ucur(el: HTMLElement, k: Kutu, hedef: Nokta, sc?: number) {
  el.classList.add('ucuyor');
  const c = merkez(k);
  kaydir(el, k, hedef.x - c.x, hedef.y - c.y);
  if (sc !== undefined) el.style.scale = String(sc);
}

// ===== 1 · Hazırlık =====
const onlukAlan = alan('Önlük', genis(ONLUK), 'vk-alan-hazirlik');
const gozlukAlan = alan('Gözlük', genis({ x: 615, y: 45, w: 200, h: 160 }), 'vk-alan-hazirlik');
const ortuAlan = alan('Örtü', { x: 70, y: 720, w: 320, h: 200 }, 'vk-alan-hazirlik');
const HAZIRLIK_EL: Record<HazirlikAdimi, HTMLElement> = { onluk: onlukEl, gozluk: gozlukEl, ortu: ortuSon };
const HAZIRLIK_SOZ: Record<HazirlikAdimi, Soz> = { onluk: 'c-hos', gozluk: 'c-gozluk', ortu: 'c-ortu' };
const siradakiHazirlik = (): HazirlikAdimi | undefined => (['onluk', 'gozluk', 'ortu'] as const).find((a) => !sen.giyilen.has(a));
function hazirlikDavet() {
  const a = siradakiHazirlik();
  for (const [k, el] of Object.entries(HAZIRLIK_EL)) el.classList.toggle('davet', k === a);
  if (a === 'ortu' && !ortuK.bos) ortuK.el.classList.add('davet'); else ortuK.el.classList.remove('davet');
}
surukle(onlukAlan, { gorsel: () => onlukEl, kutu: () => ONLUK, hedef: () => KINO_GOGUS, izin: () => !mesgul && sen.asama === 'hazirlik', birak: (ok) => void hazirlikBirak('onluk', ok) });
surukle(gozlukAlan, { gorsel: () => gozlukEl, kutu: () => GOZLUK, hedef: () => KINO_YUZ, izin: () => !mesgul && sen.asama === 'hazirlik', birak: (ok) => void hazirlikBirak('gozluk', ok) });
ortuAlan.addEventListener('click', () => { if (!mesgul && sen.asama === 'hazirlik') void hazirlikBirak('ortu', true); });
const tasiyan = (a: HazirlikAdimi) => (a === 'onluk' ? onlukEl : a === 'gozluk' ? gozlukEl : null);
const geriSek = (el: HTMLElement | null) => { if (!el) return; el.classList.add('ucuyor'); el.style.translate = ''; el.style.scale = ''; birKez(el, 'sek', 500); };
async function hazirlikBirak(a: HazirlikAdimi, ok: boolean) {
  const el = tasiyan(a);
  if (!ok) { geriSek(el); efekt('bidik', 0.6); return; }
  const s = sen.hazirla(a);
  if (s.tur === 'zaten') { geriSek(el); return; }
  if (s.tur === 'once') {
    // Sıra dışı: parça komikçe geri seker, Kino başını sallar, Ceren sıradakini söyler, sıradaki zıplar.
    geriSek(el);
    efekt('bidik');
    birKez(kino.el, 'hayir', 600);
    soyle(s.gereken === 'onluk' ? 'c-once-onluk' : 'c-once-gozluk');
    hazirlikDavet();
    birKez(HAZIRLIK_EL[s.gereken], 'zipla', 1300);
    return;
  }
  durumYaz();
  await isle(async () => {
    for (const e of Object.values(HAZIRLIK_EL)) e.classList.remove('davet');
    ortuK.el.classList.remove('davet');
    if (a === 'onluk') {
      ucur(onlukEl, ONLUK, KINO_GOGUS, 0.7);
      efekt('kumas');
      await bekle(260);
      onlukEl.classList.add('giyildi');
      birKez(lokum.el, 'zipla-css', 600);
      await kino.oynat('kino-onluk', GIYINME['kino-onluk'], 170);
      kino.temelYap('kino-onluklu');
      kino.tepki();
      sozDizisi(['k-onluk', 'c-gozluk']);
    } else if (a === 'gozluk') {
      ucur(gozlukEl, GOZLUK, KINO_YUZ, 0.8);
      await bekle(240);
      gozlukEl.classList.add('giyildi');
      efekt('cit');
      const lokumGozluk = (async () => { await bekle(250); await lokum.oynat('lokum-gozluk', GIYINME['lokum-gozluk'], 200); efekt('cit', 0.5); lokum.temelYap('lokum-bekle-0', 'lokum-bekle-1'); lokum.tepki(); })();
      await kino.oynat('kino-gozluk', GIYINME['kino-gozluk'], 170);
      kino.temelYap('kino-bekle-0', 'kino-bekle-1');
      kino.poz('kino-alkis', 700);
      await lokumGozluk;
      sozDizisi(['k-gozluk', 'c-ortu']);
    } else {
      efekt('firt');
      if (!ortuK.bos) {
        await ortuK.oynat(150, bekle);
        ortuK.el.hidden = true;
        ortuSon.classList.add('acik');
      } else {
        ortuSon.classList.add('acik');
        ortuSon.classList.remove('rulo');
        await bekle(480);
      }
      void piriltiEf[0].oyna(110, { x: 300, y: 760, w: 220, h: 160 });
      void piriltiEf[1].oyna(110, { x: 1100, y: 760, w: 220, h: 160 });
      kino.poz('kino-kahkaha', 700);
      lokum.poz('lokum-alkis', 700);
    }
  });
  if (s.bitti) { await malzemeyeBasla(); return; }
  hazirlikDavet();
  hazirlikAlanlari();
}
function hazirlikAlanlari() {
  const h = sen.asama === 'hazirlik';
  onlukAlan.hidden = !h || sen.giyilen.has('onluk');
  gozlukAlan.hidden = !h || sen.giyilen.has('gozluk');
  ortuAlan.hidden = !h || sen.giyilen.has('ortu');
}

// ===== 2 · Malzemeler =====
const MALZEME_ETIKET: Record<Malzeme, string> = { volkan: 'Volkanı yerine koy', kolba: 'Kolbayı yerine koy', kavanoz: 'Kavanozu yerine koy', sepet: 'Şişe kasasını yerine koy' };
const tasimaAlani = alan('', { x: LOKUM_EL.x - 130, y: LOKUM_EL.y - 150, w: 260, h: 280 }, 'vk-alan-tasima');
let tasinan: Malzeme | null = null;
const malzemeYeri = (m: Malzeme): Nokta => merkez(MALZEME_YERI[m]);
/** Lokum'un patilerindeki malzeme (kendi yerinden patilere kaydırılmış ve küçültülmüş). */
function patilerde(m: Malzeme, ucarak = false) {
  const el = MALZEME_EL[m], k = MALZEME_YERI[m], c = merkez(k);
  el.classList.remove('sakli');
  el.classList.toggle('ucuyor', ucarak);
  el.classList.add('tasiniyor');
  // İlk kez patilerde belirirken tezgâhtan uçmuş gibi görünmesin (kolbanın kendi geçişi var).
  if (!ucarak) el.style.transition = 'none';
  kaydir(el, k, LOKUM_EL.x - c.x, LOKUM_EL.y - c.y);
  el.style.scale = String(TASIMA_OLCEGI[m]);
  if (!ucarak) { void el.offsetWidth; el.style.transition = ''; }
}
for (const m of MALZEMELER) MALZEME_EL[m].classList.add('sakli');
surukle(tasimaAlani, {
  gorsel: () => MALZEME_EL[tasinan ?? 'volkan'], kutu: () => MALZEME_YERI[tasinan ?? 'volkan'], hedef: () => (tasinan ? malzemeYeri(tasinan) : null),
  olcekBas: () => TASIMA_OLCEGI[tasinan ?? 'volkan'], izin: () => !mesgul && !!tasinan,
  birak: (ok) => { if (tasinan) void malzemeBirak(tasinan, ok); },
});
async function malzemeyeBasla() {
  hazirlikAlanlari();
  // 2–3 yaşta kolba ve kavanoz kendiliğinden yerine konur (kısa iniş sesleriyle).
  for (const m of MALZEMELER) {
    if (CEKMECEDE[YAS].includes(m)) continue;
    const el = MALZEME_EL[m];
    el.classList.remove('sakli');
    birKez(el, 'inis', 420);
    efekt(m === 'kolba' ? 'cin' : 'tak', 0.7);
    await bekle(260);
  }
  sirayla('c-malzeme');
  await siradakiMalzeme();
}
async function siradakiMalzeme() {
  const m = CEKMECEDE[YAS].find((x) => !sen.konan.has(x));
  if (!m) { await deneyeBasla(); return; }
  await isle(async () => {
    lokumEgil(true);
    efekt('vuu', 0.5);
    await bekle(300);
    tasinan = m;
    patilerde(m);
    lokumEgil(false);
    lokum.temelYap('lokum-uzat');
    lokum.tepki();
    efekt('pit', 0.7);
    yer(yuvaIsigi(MALZEME_YERI[m]), yuvaIsik);
    yuvaIsik.classList.add('acik');
    tasimaAlani.setAttribute('aria-label', MALZEME_ETIKET[m]);
    tasimaAlani.hidden = false;
    kok.dataset.tasinan = m;
  });
}
async function malzemeBirak(m: Malzeme, ok: boolean) {
  const el = MALZEME_EL[m];
  if (!ok) {
    // Başka yere bırakıldı: Lokum'un patilerine geri seker, Lokum şaşırır.
    patilerde(m, true);
    birKez(el, 'sek', 500);
    efekt('bidik', 0.6);
    lokum.poz('lokum-saskin', 600);
    return;
  }
  tasimaAlani.hidden = true;
  tasinan = null;
  delete kok.dataset.tasinan;
  sen.koy(m);
  await isle(async () => {
    el.classList.remove('tasiniyor');
    el.classList.add('ucuyor');
    el.style.translate = '';
    el.style.scale = '';
    yuvaIsik.classList.remove('acik');
    lokum.temelYap('lokum-bekle-0', 'lokum-bekle-1');
    await bekle(330);
    el.classList.remove('ucuyor');
    birKez(el, 'inis', 420);
    await malzemeTepkisi(m);
  });
  await siradakiMalzeme();
}
/** Her malzemenin kendi tepkisi. */
async function malzemeTepkisi(m: Malzeme) {
  if (m === 'volkan') {
    efekt('gum');
    void tozEf.oyna(100, { x: VOLKAN.x + 40, y: VOLKAN.y + VOLKAN.h - 110, w: 420, h: 150 });
    sars();
    kino.poz('kino-saskin', 900);
    lokum.poz('lokum-saskin', 700);
    sirayla('k-volkan');
    await bekle(500);
  } else if (m === 'kolba') {
    efekt('cin');
    void cinEf.oyna(140);
    kino.poz('kino-merak', 900);
    sirayla('k-kolba');
    await bekle(450);
  } else if (m === 'kavanoz') {
    // Kavanoz konunca karbonat tozu pufler: Kino hapşırır, Ceren "çok yaşa".
    efekt('tak');
    efekt('puf', 0.8);
    void pufEf.oyna(120, { x: KAVANOZ_AGZI.x - 110, y: KAVANOZ_AGZI.y - 170, w: 220, h: 200 });
    await bekle(260);
    kino.poz('kino-hapsir-0');
    await bekle(420);
    kino.poz('kino-hapsir-1', 900);
    birKez(kino.el, 'hapsir', 500);
    lokum.poz('lokum-gul', 900);
    sozDizisi(['k-hapsu', 'c-cok-yasa']);
    await bekle(500);
  } else {
    efekt('singir');
    RENKLER.forEach((r, i) => setTimeout(() => birKez(siseEl[r], 'salla', 520), i * 90));
    lokum.poz('lokum-alkis', 900);
    kino.poz('kino-kahkaha', 800);
    sirayla('k-sepet');
    await bekle(500);
  }
}

// ===== 3–4 · Renk ve köpük =====
const siseAlan = {} as Record<Renk, HTMLButtonElement>;
const RENK_ADI: Record<Renk, string> = { kirmizi: 'Kırmızı', sari: 'Sarı', mavi: 'Mavi' };
for (const r of RENKLER) {
  const k = SISELER[r];
  siseAlan[r] = alan(RENK_ADI[r] + ' şişe', { x: k.x - 5, y: k.y - 20, w: k.w + 10, h: 200 }, 'vk-alan-deney');
  siseAlan[r].addEventListener('pointerdown', () => { if (!mesgul) { birKez(siseEl[r], 'bas', 220); efekt('tik'); } });
  siseAlan[r].addEventListener('click', () => void sisedenDok(r));
}
const kolbaAlan = alan('Kolba', KOLBA, 'vk-alan-deney');
kolbaAlan.addEventListener('pointerdown', () => { if (!mesgul) { birKez(kolbaEl, 'bas', 220); efekt('tik'); } });
kolbaAlan.addEventListener('click', () => void kolbayiDok());
const kasikAlan = alan('Karbonat kaşığı', { x: KAVANOZ.x, y: KAVANOZ.y, w: KASIK.x + KASIK.w - KAVANOZ.x, h: KASIK.y + KASIK.h - KAVANOZ.y }, 'vk-alan-deney');
kasikAlan.addEventListener('pointerdown', () => { if (!mesgul) { birKez(kasikEl, 'bas', 220); efekt('tik'); } });
kasikAlan.addEventListener('click', () => void kasikla());
const deneyAlanlari = () => { for (const b of [...Object.values(siseAlan), kolbaAlan, kasikAlan]) b.hidden = sen.asama !== 'deney'; };

/** Kolbadaki sıvının yüksekliği (0…3 ölçek) ve rengi. */
function kolbayiCiz() {
  const n = tezgah.kolba.length, renk = karisim(tezgah.kolba);
  const tavan = KOLBA_SIVI.alt - ((KOLBA_SIVI.alt - KOLBA_SIVI.ust) * n) / KOLBA_EN_COK;
  const kirp = 'inset(' + (n ? (tavan / KOLBA.h) * 100 : 100) + '% 0 0 0)';
  kolbaSivi.style.clipPath = kirp;
  girdap.el.style.clipPath = kirp;
  if (renk) boya(kolbaEl, renk);
  kok.dataset.kolba = tezgah.kolba.join(',');
}
function karbonatiCiz() {
  const k = olcek(), c = krater();
  yer({ x: c.x - (KARBONAT.w * k) / 2, y: c.y - 50 * k, w: KARBONAT.w * k, h: KARBONAT.h * k }, karbonatEl);
  karbonatEl.classList.toggle('acik', tezgah.krater.karbonat);
}
/** Köpük tuvali kraterin çevresinde (kocaman volkanda 1,2 kat; üç ölçek köpük biraz daha büyük). */
function kopukYerlestir(boy: number) {
  const c = krater(), s = olcek() * (boy === 3 ? 1.12 : 1);
  yer({ x: c.x - 450 * s, y: c.y - 350 * s, w: KOPUK.w * s, h: KOPUK.h * s }, kopukKap);
  yer({ x: c.x - 160, y: c.y - 210, w: 320, h: 200 }, serpinti.el);
}
const hedefSozleri = (h: Hedef | null): Soz[] => {
  if (!h) return ['c-giris-minik'];
  const s: Soz[] = [('c-hedef-' + h.renk) as Soz];
  if (h.boy === 3) s.push('c-hedef-kocaman');
  return s;
};
async function deneyeBasla() {
  durumYaz();
  for (const m of MALZEMELER) MALZEME_EL[m].classList.remove('sakli');
  yuvaIsik.classList.remove('acik');
  await turaBasla();
}
/** Turun başı: tarif kartı, 2–3 yaşta karbonat hazır, hedef sözü, açılış işareti. */
async function turaBasla() {
  iskaSayisi = 0;
  tezgah.kolba = [];
  tezgah.temizle();
  if (YAS === 'minik') { tezgah.krater.karbonat = true; void pufEf.oyna(100, { x: krater().x - 110, y: krater().y - 170, w: 220, h: 200 }); efekt('karbonat', 0.6); }
  kolbayiCiz();
  karbonatiCiz();
  for (const r of RENKLER) siseEl[r].classList.remove('ipucu');
  const h = sen.hedef();
  kok.dataset.hedef = h ? h.renk + (h.boy ? '-' + h.boy : '') : '';
  tarifGoster(h);
  deneyAlanlari();
  durumYaz();
  davet();
  sozDizisi(hedefSozleri(h));
}
function tarifGoster(h: Hedef | null) {
  tarifEl.classList.toggle('acik', !!h);
  if (!h) return;
  const [a, b] = bilesenleri(h.renk);
  boya(tarifDamla[0], a);
  boya(tarifDamla[1], b ?? a);
  boya(tarifDamla[2], h.renk);
  tarifDamla[2].classList.toggle('kocaman', h.boy === 3);
  birKez(tarifEl, 'gel', 600);
}
/** Açılış işareti (1 sn içinde): ilk gerekli şişe zıplar, Kino işaret eder. */
function davet() {
  if (sen.asama === 'hazirlik') {
    hazirlikDavet();
    // Önlüksüz Kino askılığı gösterir; önlüklü Kino canlanır.
    if (!sen.giyilen.has('onluk')) kino.poz('kino-hazir-isaret', 1000); else kino.tepki();
    return;
  }
  if (sen.asama !== 'deney') return;
  const h = sen.hedef();
  const n = tezgah.kolba.length;
  if (n && (!h || karisim(tezgah.kolba) === h.renk) && (!h?.boy || n >= h.boy)) {
    birKez(tezgah.krater.karbonat ? kolbaEl : kasikEl, 'zipla', 1300);
  } else {
    const gerek: Renk = h ? bilesenleri(h.renk).find((r) => !tezgah.kolba.includes(r)) ?? bilesenleri(h.renk)[0] : RENKLER[Math.floor(Math.random() * 3)];
    birKez(siseEl[gerek], 'zipla', 1300);
  }
  kino.poz('kino-isaret', 1000);
}

/** Şişeden kolbaya: şişe kasadan kalkar, kolbanın üstünde eğilir, renkli sirke akar, kolba dolar ve renk karışır. */
async function sisedenDok(r: Renk) {
  if (mesgul || sen.asama !== 'deney') return;
  const once = karisim(tezgah.kolba);
  const s = tezgah.dok(r, YAS === 'minik' ? 2 : 1);
  if (s.tur === 'dolu') {
    // Komik, cezasız: kolba sallanır, "bıdık"; Kino bir kez "Kolba doldu!" der.
    birKez(kolbaEl, 'salla', 500);
    efekt('bidik');
    kino.poz('kino-saskin', 700);
    if (!dolulukSoylendi) { dolulukSoylendi = true; soyle('k-dolu'); }
    return;
  }
  await isle(async () => {
    const el = siseEl[r], k = SISELER[r];
    // Şişenin ağzı kolbanın ağzının üstüne gelir; şişe yatar (dönme noktası ağzında).
    const hedef = { x: KOLBA.x + KOLBA_AGZI.x - 8, y: KOLBA.y + KOLBA_AGZI.y - 130 };
    sepetEl.classList.add('dokuyor');
    kaydir(el, k, hedef.x - (k.x + SISE_AGZI.x), hedef.y - (k.y + SISE_AGZI.y));
    el.classList.add('kalkti');
    efekt('vuu', 0.4);
    await bekle(320);
    el.classList.add('dokuyor');
    await bekle(200);
    boya(akis.el, r);
    yer({ x: hedef.x - 35, y: hedef.y + 10, w: 70, h: KOLBA_AGZI.y + KOLBA.y - hedef.y + 20 }, akis.el);
    akis.el.classList.add('acik');
    efekt('dok');
    akis.goster(0);
    await bekle(110);
    akis.goster(1);
    kolbayiCiz();
    const sonra = karisim(tezgah.kolba)!;
    const degisti = !!once && sonra !== once;
    if (degisti) {
      // Renk değişimi: girdap kareleri dönerken renk eskisinden yenisine kayar.
      boya(kolbaEl, once);
      girdap.el.classList.add('acik');
      requestAnimationFrame(() => boya(kolbaEl, sonra));
      efekt('girdap');
      kino.poz('kino-saskin', 1100);
      lokum.poz('lokum-saskin', 900);
      if (!renkSoylendi) { renkSoylendi = true; sirayla('k-renk'); }
    } else {
      birKez(kolbaSivi, 'dalga', 600);
      kino.poz('kino-merak', 700);
    }
    for (let i = 0; i < 4; i++) { girdap.goster(i % Math.max(1, girdap.adet)); await bekle(degisti ? 140 : 90); }
    akis.goster(2);
    await bekle(120);
    akis.el.classList.remove('acik');
    girdap.el.classList.remove('acik');
    el.classList.remove('dokuyor');
    await bekle(120);
    el.classList.remove('kalkti');
    el.style.translate = '';
    await bekle(300);
    sepetEl.classList.remove('dokuyor');
    if (degisti) birKez(kolbaEl, 'parla', 700);
  });
  yonlendir();
}
/** Kaşık kavanoza dalar, karbonatla dolar, volkanın ağzına gider, eğilir: toz akar, kraterde yığılır. */
async function kasikla() {
  if (mesgul || sen.asama !== 'deney') return;
  if (tezgah.krater.karbonat) {
    // Karbonat zaten volkanda: kaşık sallanır (ceza yok), volkan parlar.
    birKez(kasikEl, 'salla', 500);
    birKez(devVolkan ? devVolkanEl : volkanEl, 'parla', 700);
    efekt('bidik', 0.7);
    if (tezgah.kolba.length) sirayla('c-dok');
    return;
  }
  let sonuc: ReturnType<Tezgah['kasik']> | null = null;
  await isle(async () => {
    const git = (x: number, y: number) => kaydir(kasikEl, KASIK, x - (KASIK.x + KASIK_CANAK.x), y - (KASIK.y + KASIK_CANAK.y));
    kasikEl.classList.add('tasiniyor');
    git(KAVANOZ_AGZI.x, KAVANOZ_AGZI.y + 10);
    await bekle(300);
    efekt('kasik');
    birKez(kavanozEl, 'bas', 240);
    kasikEl.classList.add('dolu');
    void pufEf.oyna(90, { x: KAVANOZ_AGZI.x - 80, y: KAVANOZ_AGZI.y - 130, w: 160, h: 140 });
    await bekle(260);
    const c = krater();
    git(c.x, c.y - 80);
    efekt('vuu', 0.4);
    await bekle(400);
    kasikEl.classList.add('dokuyor');
    efekt('karbonat');
    yer({ x: c.x - 60, y: c.y - 150, w: 120, h: 140 }, tozDokEf.k.el);
    void tozDokEf.oyna(110);
    await bekle(260);
    sonuc = tezgah.kasik();
    karbonatiCiz();
    birKez(karbonatEl, 'puf', 500);
    kasikEl.classList.remove('dokuyor', 'dolu');
    kasikEl.style.translate = '';
    await bekle(340);
    kasikEl.classList.remove('tasiniyor');
  });
  const s = sonuc as ReturnType<Tezgah['kasik']> | null;
  if (s?.tur === 'patlama') { await kopur(s.p); return; }
  yonlendir();
}
/** Kolba volkanın ağzına taşınır, eğilir, sirke akar: karbonat varsa köpürür, yoksa sirke volkanda bekler. */
async function kolbayiDok() {
  if (mesgul || sen.asama !== 'deney') return;
  if (!tezgah.kolba.length) {
    birKez(kolbaEl, 'salla', 500);
    efekt('bidik');
    kino.poz('kino-saskin', 700);
    if (!boslukSoylendi) { boslukSoylendi = true; soyle('k-bos'); }
    return;
  }
  let sonuc: ReturnType<Tezgah['kolbayiBosalt']> | null = null;
  await isle(async () => {
    const renk = karisim(tezgah.kolba)!, c = krater();
    const hedef = { x: c.x - 20, y: c.y - 250 };
    kaydir(kolbaEl, KOLBA, hedef.x - (KOLBA.x + KOLBA_AGZI.x), hedef.y - (KOLBA.y + KOLBA_AGZI.y));
    kolbaEl.classList.add('kalkti');
    efekt('vuu', 0.4);
    await bekle(380);
    kolbaEl.classList.add('dokuyor');
    await bekle(220);
    boya(akis.el, renk);
    yer({ x: hedef.x - 35, y: hedef.y + 20, w: 70, h: c.y - hedef.y - 10 }, akis.el);
    akis.el.classList.add('acik');
    akis.goster(0);
    efekt('dok');
    await bekle(120);
    akis.goster(1);
    sonuc = tezgah.kolbayiBosalt();
    kolbayiCiz();
    await bekle(340);
    akis.goster(2);
    await bekle(120);
    akis.el.classList.remove('acik');
    kolbaEl.classList.remove('dokuyor');
    await bekle(140);
    kolbaEl.classList.remove('kalkti');
    kolbaEl.style.translate = '';
    await bekle(200);
  });
  const s = sonuc as ReturnType<Tezgah['kolbayiBosalt']> | null;
  if (s?.tur === 'patlama') { await kopur(s.p); return; }
  yonlendir();
}
/** Ceren bir sonraki adımı söyler (hedef rengi kolbada olunca: karbonat ya da dök). */
function yonlendir() {
  if (YAS === 'minik') { if (tezgah.kolba.length) sirayla('c-dok'); return; }
  const h = sen.hedef(), renk = karisim(tezgah.kolba);
  if (tezgah.krater.sivi && !tezgah.krater.karbonat) { sirayla('c-karbonat'); return; }
  if (!renk || (h && renk !== h.renk)) return;
  if (h?.boy && tezgah.kolba.length < h.boy) return;
  sirayla(tezgah.krater.karbonat ? 'c-dok' : 'c-karbonat');
}

/** Köpük: fısss ve serpinti, köpük doğar, taşar, yamaçtan akar, tepside birikir, kabarır, söner; karakterler tepki verir. */
async function kopur(p: Patlama) {
  patlamaSayisi++;
  kok.dataset.patlama = p.renk + '-' + p.boy;
  const tutti = tuttu(sen.hedef(), p);
  if (tutti) turRenkleri.push(p.renk);
  kuyruguBosalt();
  await isle(async () => {
    kopukYerlestir(p.boy);
    boya(kopukKap, p.renk);
    tezgah.temizle();
    karbonatiCiz();
    const volkan = devVolkan ? devVolkanEl : volkanEl;
    // Fısss: serpinti ve kabarcıklar.
    efekt('fizz');
    serpinti.el.classList.add('acik');
    const serpintiDon = setInterval(() => serpinti.ilerle(0.1, 8), 100);
    kino.poz('kino-merak');
    lokum.poz('lokum-saskin');
    kabarcikSal(p.renk, 5, 0);
    await bekle(380);
    // Doğuş, taşma, akış, birikme.
    kopukKap.classList.add('acik');
    let blupDon = 0;
    if (KOPUK_TAM) {
      await kopukOyna('dogus', 110);
      efekt('blup');
      if (p.boy === 1) {
        await kopukKabar(900, p);
        await kopukOyna('dogus', 110, true);
      } else {
        efekt('patlama');
        birKez(volkan, 'titre', 500);
        kino.poz('kino-geri');
        lokum.poz('lokum-saklan');
        await kopukOyna('tas', 120);
        if (p.boy === 3 && !kopukK.fiskir.bos) {
          for (let i = 0; i < 2; i++) await kopukOyna('fiskir', 130);
          void kraterSicrama.oyna(110, undefined, p.renk);
        }
        kabarcikSal(p.renk, 7, 0);
        await kopukOyna('ak', 140);
        await kopukOyna('birik', 140);
        efekt('sap');
        birikintiDoldur(p, true);
        await kopukKabar(1300, p);
        await kopukOyna('sonum', 190);
      }
    } else {
      // Kare dizileri gelmediyse: tek köpük çizimi kabarır, durur, iner (birikintiler yine oluşur).
      kopukYedek.classList.add('acik');
      kopukYedek.style.setProperty('--olcek', p.boy === 1 ? '0.7' : '1');
      if (p.boy > 1) { efekt('patlama'); birKez(volkan, 'titre', 500); kino.poz('kino-geri'); lokum.poz('lokum-saklan'); }
      blupDon = window.setInterval(() => efekt('blup', 0.5), 420);
      kabarcikSal(p.renk, 8, 120);
      await bekle(700);
      if (p.boy > 1) { efekt('sap'); birikintiDoldur(p, true); }
      await kopukKabar(1300, p);
      kopukYedek.classList.add('iniyor');
      await bekle(550);
      kopukYedek.classList.remove('acik', 'iniyor');
    }
    clearInterval(blupDon);
    clearInterval(serpintiDon);
    serpinti.el.classList.remove('acik');
    kopukGoster(null);
    kopukKap.classList.remove('acik');
    kino.poz(kino.temel[0]);
    lokum.poz(lokum.temel[0]);
  });
  // Sözler: Kino'nun tepkisi (ilk köpükte ya da çamurda), rengi; ilk köpükte nedeni; kocamanda "daha çok sirke"; ilk üç ölçekte gözlük.
  const sira: Soz[] = [];
  if (p.renk === 'kahve') sira.push('k-iyy');
  else if (patlamaSayisi === 1) sira.push('k-vay');
  sira.push(('r-' + p.renk) as Soz);
  if (patlamaSayisi === 1) sira.push('c-neden');
  if (p.boy === 3 && !gozlukKopukSoylendi) { gozlukKopukSoylendi = true; sira.push('k-kopuk-gozluk', 'c-gozluk-ise'); }
  else if (p.boy === 3 && YAS === 'bes') sira.push('c-buyuk');
  if (!tutti) sira.push('c-baska');
  const sozler = sozDizisi(sira);
  if (!sen.kopurdu(tutti)) {
    // Başka renk: aynı hedef yeniden; ikinci ıskada gerekli şişeler parlar.
    iskaSayisi++;
    const h = sen.hedef();
    if (h && iskaSayisi >= 2) for (const r of bilesenleri(h.renk)) siseEl[r].classList.add('ipucu');
    durumYaz();
    return;
  }
  deneyAlanlari();
  tarifEl.classList.remove('acik');
  // Sözler bitince sıradaki aşama ("Tekrar dinle" sözü bölerse en çok 7 sn beklenir).
  await Promise.race([sozler, bekle(7000)]);
  if (sen.asama === 'secim') secimGoster();
  else if (sen.asama === 'temizlik') await temizligeBasla();
}
const kopukGoster = (ad: KopukDizi | null) => { for (const k of Object.keys(kopukK) as KopukDizi[]) kopukK[k].el.classList.toggle('acik', k === ad); };
async function kopukOyna(ad: KopukDizi, ms: number, geri = false) {
  const k = kopukK[ad];
  kopukGoster(ad);
  if (!geri) { await k.oynat(ms, bekle); return; }
  for (let i = k.adet - 1; i >= 0; i--) { k.goster(i); await bekle(ms); }
}
/** Sevinç anı: köpük kabarır (iki kare), Kino güler, Lokum zıplar; üç ölçekte Kino'nun gözlüğüne köpük sıçrar. */
async function kopukKabar(ms: number, p: Patlama) {
  if (KOPUK_TAM) kopukGoster('kabar');
  const kahve = p.renk === 'kahve';
  kino.poz(kahve ? 'kino-iyy' : 'kino-kahkaha');
  lokum.poz(kahve ? 'lokum-iyy' : 'lokum-zipla');
  kino.tepki();
  if (tuttu(sen.hedef(), p) && sen.hedef()) efekt('pirilti');
  let i = 0;
  const don = setInterval(() => { kopukK.kabar.goster(++i % 2); if (i % 3 === 0) efekt('blup', 0.4); }, 280);
  if (p.boy === 3 && !gozlukKopukSoylendi) {
    await bekle(ms * 0.4);
    kino.poz('kino-gozluk-kopuk');
    efekt('sap', 0.6);
    await bekle(ms * 0.35);
    kino.poz('kino-sil');
    await bekle(ms * 0.25);
  } else await bekle(ms);
  clearInterval(don);
}
/** Kabarcıklar (boyalı): kraterden yükselir, sonda pıt diye patlar. */
function kabarcikSal(r: Karisim, adet: number, gecikme: number) {
  const c = krater();
  for (let i = 0; i < adet; i++) {
    setTimeout(() => {
      const b = kabarciklar.find((x) => !x.e.classList.contains('acik'));
      if (!b) return;
      const boyut = 40 + Math.random() * 50;
      yer({ x: c.x - boyut / 2 + (Math.random() - 0.5) * 160, y: c.y - boyut, w: boyut, h: boyut }, b.e);
      boya(b.e, r);
      b.e.style.setProperty('--dx', (Math.random() - 0.5) * 520 + '%');
      b.e.style.setProperty('--dy', -(260 + Math.random() * 520) + '%');
      b.e.classList.remove('pat');
      void b.e.offsetWidth;
      b.e.classList.add('acik');
      setTimeout(() => {
        b.e.classList.add('pat');
        b.pat.basaSar();
        setTimeout(() => b.pat.goster(1), 90);
        if (Math.random() < 0.5) efekt('pit', 0.5);
      }, AZ_HAREKET ? 100 : 950);
      setTimeout(() => b.e.classList.remove('acik', 'pat'), AZ_HAREKET ? 200 : 1150);
    }, gecikme + i * 90);
  }
}
/** Köpük tepside birikir: iki ölçekte sol ve sağ, üç ölçekte önde de; kocaman volkanda dördüncüsü. */
function birikintiDoldur(p: Patlama, sicrat: boolean) {
  const n = p.boy === 1 ? 0 : p.boy === 2 ? 2 : devVolkan ? 4 : 3;
  for (let i = 0; i < n; i++) birikintiAc(i, p.renk, sicrat);
}
function birikintiAc(i: number, renk: Karisim, sicrat: boolean) {
  const e = birikintiEl[i], n = BIRIKINTILER[i];
  boya(e, renk);
  e.style.setProperty('--kalan', '1');
  e.classList.add('acik');
  e.dataset.kalan = '1';
  if (sicrat) void sicramaEf[i].oyna(100, { x: n.x - 130, y: n.y - 160, w: 260, h: 200 }, renk);
}

// ===== 5 · İkinci tur seçimi =====
const secimRenkAlan = alan('Başka renk', SECIM_RENK, 'vk-alan-secim');
const secimDevAlan = alan('Kocaman volkan', SECIM_DEV, 'vk-alan-secim');
secimRenkAlan.addEventListener('click', () => void sec('renk'));
secimDevAlan.addEventListener('click', () => void sec('dev'));
for (const [b, el] of [[secimRenkAlan, secimRenk], [secimDevAlan, secimDev]] as const) b.addEventListener('pointerdown', () => { birKez(el, 'bas', 220); efekt('tik'); });
function secimGoster() {
  durumYaz();
  secimRenk.classList.add('acik');
  setTimeout(() => secimDev.classList.add('acik'), 140);
  efekt('vuu', 0.5);
  secimRenkAlan.hidden = secimDevAlan.hidden = false;
  kino.poz('kino-dusun');
  lokum.poz('lokum-saskin', 800);
  soyle('c-secim');
}
async function sec(s: Secim) {
  if (mesgul || !sen.sec(s)) return;
  secimRenkAlan.hidden = secimDevAlan.hidden = true;
  await isle(async () => {
    const [secilen, oteki] = s === 'renk' ? [secimRenk, secimDev] : [secimDev, secimRenk];
    secilen.classList.add('secildi');
    oteki.classList.add('gitti');
    efekt('pirilti');
    kino.poz('kino-alkis', 800);
    await bekle(520);
    for (const e of [secimRenk, secimDev]) e.classList.remove('acik', 'secildi', 'gitti');
    if (s === 'dev') await devVolkanGetir();
  });
  await turaBasla();
}
/** Kocaman volkan: küçüğü tezgâhın arkasına iner, kocamanı yukarıdan güm diye konar. */
async function devVolkanGetir() {
  sirayla('k-dev');
  volkanEl.classList.add('gidiyor');
  efekt('vuu', 0.6);
  await bekle(380);
  volkanEl.classList.add('sakli');
  volkanEl.classList.remove('gidiyor');
  devVolkan = true;
  devVolkanEl.classList.add('acik', 'dusuyor');
  await bekle(420);
  devVolkanEl.classList.remove('dusuyor');
  efekt('gum', 1.2);
  sars();
  void tozEf.oyna(100, { x: DEV_VOLKAN.x + 90, y: DEV_VOLKAN.y + DEV_VOLKAN.h - 120, w: 420, h: 150 });
  kino.poz('kino-saskin', 900);
  lokum.poz('lokum-zipla', 900);
  karbonatiCiz();
  await bekle(400);
}

// ===== 6 · Temizlik ve ödül =====
const birikintiAlan = BIRIKINTILER.map((n, i) => {
  const b = alan('Köpük birikintisi ' + (i + 1), { x: n.x - 120, y: n.y - 70, w: 240, h: 130 }, 'vk-alan-temizlik');
  b.addEventListener('click', () => void birikintiyiSil(i));
  return b;
});
const sungerAlan = alan('Sünger', genis(SUNGER_KUTU), 'vk-alan-temizlik');
let sungerMesgul = false;
let sungerYolu = 0;
let sungerKare = 0;
let sonSungerNokta: Nokta | null = null;
surukle(sungerAlan, {
  gorsel: () => sunger.el, kutu: () => SUNGER_KUTU, hedef: () => null, izin: () => sen.asama === 'temizlik' && !sungerMesgul,
  tasirken: (p) => sungerSurt(p),
  birak: () => { dongu('fis', 0); sonSungerNokta = null; sunger.goster(0); sungerGeriGel(); },
});
/** Sünger birikintinin üstünde sürtünce birikinti azalır (her ~70 fon pikseli bir silme). */
function sungerSurt(p: Nokta) {
  const once = sonSungerNokta;
  sonSungerNokta = p;
  if (!once) return;
  const i = sen.birikinti.findIndex((k, j) => k > 0 && uzak(p, BIRIKINTILER[j]) < 135);
  if (i < 0) { dongu('fis', 0); return; }
  dongu('fis', 0.7);
  sungerYolu += uzak(p, once);
  if (sungerYolu < 70) return;
  sungerYolu = 0;
  sunger.goster(++sungerKare % 2);
  silmeAdimi(i);
}
function silmeAdimi(i: number) {
  sen.sil(i);
  const kalan = sen.birikinti[i], e = birikintiEl[i];
  e.style.setProperty('--kalan', String(kalan));
  e.dataset.kalan = String(Math.round(kalan * 100) / 100);
  efekt('fis', 0.6);
  if (kalan === 0) {
    e.classList.remove('acik');
    birikintiAlan[i].hidden = true;
    const n = BIRIKINTILER[i];
    void piriltiEf[i].oyna(110, { x: n.x - 110, y: n.y - 110, w: 220, h: 160 });
    efekt('ting');
    lokum.poz('lokum-gul', 600);
  }
  if (sen.asama === 'odul') { dongu('fis', 0); void odul(); }
}
function sungerGeriGel() {
  sunger.el.classList.add('ucuyor');
  sunger.el.style.translate = '';
  sunger.el.style.scale = '';
}
/** Dokununca: sünger birikintiye uçar, üç kez sürter. */
async function birikintiyiSil(i: number) {
  if (sungerMesgul || sen.asama !== 'temizlik' || !(sen.birikinti[i] > 0)) return;
  sungerMesgul = true;
  const n = BIRIKINTILER[i];
  ucur(sunger.el, SUNGER_KUTU, n);
  efekt('vuu', 0.4);
  await bekle(280);
  sunger.el.classList.remove('ucuyor');
  while (sen.asama === 'temizlik' && sen.birikinti[i] > 0) {
    for (const dx of [-60, 60]) {
      kaydir(sunger.el, SUNGER_KUTU, n.x + dx - merkez(SUNGER_KUTU).x, n.y - merkez(SUNGER_KUTU).y);
      sunger.goster(++sungerKare % 2);
      await bekle(110);
    }
    silmeAdimi(i);
  }
  sunger.goster(0);
  sungerMesgul = false;
  if (sen.asama === 'temizlik') sungerGeriGel();
}
async function temizligeBasla() {
  // Görünen birikinti sayısı yaşın ve volkanın istediği kadar (eksik yerlere son köpük damlar).
  const renk = turRenkleri[turRenkleri.length - 1] ?? 'mor';
  await isle(async () => {
    for (let i = 0; i < sen.birikinti.length; i++) {
      if (!birikintiEl[i].classList.contains('acik')) { birikintiAc(i, renk, true); efekt('sap', 0.5); await bekle(160); }
      birikintiEl[i].style.setProperty('--kalan', '1');
    }
    for (let i = sen.birikinti.length; i < birikintiEl.length; i++) birikintiEl[i].classList.remove('acik');
    soyle('c-temizlik');
    lokumEgil(true);
    efekt('vuu', 0.5);
    await bekle(300);
    lokumEgil(false);
    lokum.temelYap('lokum-uzat');
    sunger.el.classList.add('acik');
    birKez(sunger.el, 'gel', 500);
    efekt('pit', 0.7);
    kino.poz('kino-isaret', 1000);
  });
  sungerAlan.hidden = false;
  for (let i = 0; i < sen.birikinti.length; i++) birikintiAlan[i].hidden = false;
  birKez(birikintiEl[0], 'zipla', 1300);
}
const DEFTER_ANAHTAR = 'minkino-volkan-v1';
function koleksiyon(): Karisim[] {
  try { const v = JSON.parse(localStorage.getItem(DEFTER_ANAHTAR) ?? '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x in BOYA) : []; } catch { return []; }
}
const rafEl: HTMLElement[] = [];
let yeniCikartma: HTMLElement | null = null;
async function odul() {
  sungerAlan.hidden = true;
  for (const b of birikintiAlan) b.hidden = true;
  const renk = cikartmaRengi(turRenkleri);
  await isle(async () => {
    sunger.el.classList.add('ucuyor');
    sunger.el.style.translate = '';
    await bekle(260);
    sunger.el.classList.remove('acik');
    lokum.temelYap('lokum-bekle-0', 'lokum-bekle-1');
    kino.poz('kino-alkis', 800);
    sirayla('k-parlak');
    // Deney defteri: ortada belirir, açılır; sağ sayfada önceki çıkartmalar.
    defter.el.classList.add('acik');
    efekt('vuu', 0.5);
    await bekle(280);
    efekt('sayfa');
    await defter.oynat(150, bekle);
    const eski = koleksiyon().slice(-DEFTER_RAF.length);
    eski.forEach((r, i) => {
      const n = DEFTER_RAF[i];
      rafEl.push(cikartmaEl(r, { x: n.x - RAF_BOYU / 2, y: n.y - RAF_BOYU / 2, w: RAF_BOYU, h: RAF_BOYU }, defter.el, { x: 0, y: 0, w: DEFTER.w, h: DEFTER.h }));
    });
    // Yeni çıkartma kraterden uçar, sol sayfaya "şap" diye yapışır.
    const c = krater(), w = DEFTER_YENI.w;
    yeniCikartma = cikartmaEl(renk, { x: DEFTER.x + DEFTER_YENI.x - w / 2, y: DEFTER.y + DEFTER_YENI.y - w / 2, w, h: w }, kok);
    yeniCikartma.classList.add('ucan');
    kaydir(yeniCikartma, { x: 0, y: 0, w, h: w }, c.x - (DEFTER.x + DEFTER_YENI.x), c.y - (DEFTER.y + DEFTER_YENI.y));
    yeniCikartma.style.scale = '0.3';
    void yeniCikartma.offsetWidth;
    yeniCikartma.classList.add('ucuyor');
    yeniCikartma.style.translate = '';
    yeniCikartma.style.scale = '';
    efekt('vuu', 0.6);
    await bekle(520);
    efekt('sap');
    efekt('pirilti');
    birKez(yeniCikartma, 'yapis', 400);
    void yildizEf.oyna(110);
    kino.poz('kino-alkis', 1600);
    lokum.poz('lokum-zipla', 1600);
    kino.tepki();
    try { localStorage.setItem(DEFTER_ANAHTAR, JSON.stringify([...koleksiyon(), renk].slice(-30))); } catch { /* özel pencere */ }
    sirayla('c-final');
    await bekle(1500);
  });
  sen.odulAlindi();
  durumYaz();
  tekrar.hidden = false;
}
async function birDaha() {
  tekrar.hidden = true;
  tekrarSayisi++;
  sen = new Senaryo(YAS, tekrarSayisi);
  sen.hazirlikAtla();
  turRenkleri.length = 0;
  defter.el.classList.remove('acik');
  defter.basaSar();
  for (const e of rafEl.splice(0)) e.remove();
  yeniCikartma?.remove();
  yeniCikartma = null;
  if (devVolkan) {
    devVolkan = false;
    devVolkanEl.classList.remove('acik');
    volkanEl.classList.remove('sakli');
    birKez(volkanEl, 'inis', 420);
    efekt('tak');
  }
  sozuUnut();
  await turaBasla();
}

// ----- Karakterler canlı: göz kırpar, nefes alır; dokununca güler -----
setInterval(() => { kino.kirp(); setTimeout(() => lokum.kirp(), 700); }, 2700);
for (const [k, gul] of [[kino, 'kino-kahkaha'], [lokum, 'lokum-gul']] as const) {
  k.el.addEventListener('pointerdown', () => {
    sesiAc();
    void sesleriYukle();
    efekt('pit', 0.6);
    k.tepki();
    if (!mesgul && sen.giyilen.has('gozluk')) k.poz(gul, 700);
  });
}
// Boşta: 6 sn dokunulmazsa sıradaki şey yeniden zıplar (söz tekrarlanmaz).
setInterval(() => {
  if (mesgul || !basladi || performance.now() - sonDokunus < 6000) return;
  sonDokunus = performance.now();
  if (sen.asama === 'malzeme' && tasinan) { birKez(MALZEME_EL[tasinan], 'zipla', 1300); yuvaIsik.classList.add('acik'); lokum.tepki(); }
  else if (sen.asama === 'temizlik') birKez(sunger.el, 'zipla', 1300);
  else if (sen.asama === 'secim') { birKez(secimRenk, 'zipla', 1300); setTimeout(() => birKez(secimDev, 'zipla', 1300), 300); }
  else davet();
}, 1000);

// ----- Düğmeler, geri tuşu, başlangıç -----
ev.onclick = () => { sesiAc(); anaMenuyeDon(); };
dinle.onclick = () => {
  sesiAc();
  void sesleriYukle()?.then(() => {
    sozuUnut();
    const a = sen.asama;
    if (a === 'hazirlik') soyle(HAZIRLIK_SOZ[siradakiHazirlik() ?? 'onluk']);
    else if (a === 'malzeme') soyle('c-malzeme');
    else if (a === 'deney') sozDizisi(hedefSozleri(sen.hedef()));
    else if (a === 'secim') soyle('c-secim');
    else if (a === 'temizlik') soyle('c-temizlik');
    else soyle('c-final');
  });
};
tekrar.onclick = () => { sesiAc(); efekt('tik'); void birDaha(); };
geriDinle(() => false);
kolbayiCiz();
karbonatiCiz();
durumYaz();
hazirlikAlanlari();
let basladi = false;
async function basla() {
  if (basladi) return;
  basladi = true;
  sesiAc();
  await sesleriYukle();
  if (TEST && ARAMA.has('atla')) {
    sen.hazirlikAtla();
    onlukEl.classList.add('giyildi');
    gozlukEl.classList.add('giyildi');
    ortuK.el.hidden = true;
    ortuSon.classList.add('acik');
    ortuSon.classList.remove('rulo');
    kino.temelYap('kino-bekle-0', 'kino-bekle-1');
    lokum.temelYap('lokum-bekle-0', 'lokum-bekle-1');
    hazirlikAlanlari();
    await deneyeBasla();
    return;
  }
  durumYaz();
  davet();
  soyle('c-hos');
}
kok.addEventListener('pointerdown', () => { sonDokunus = performance.now(); void basla(); }, { once: true, capture: true });
// Uygulamanın web görünümünde ses dokunuş beklemeden açılabilir: Ceren hemen tanıtır. Tarayıcıda ilk dokunuşu bekler.
if (HAZIR) {
  const ctx = sesMotorunuAc();
  if (ctx && ctx.state === 'running') void basla();
  else ctx?.resume().then(() => { if (ctx.state === 'running') void basla(); }).catch(() => { /* dokunuşu bekle */ });
}

declare global { interface Window { __volkan?: unknown } }
if (TEST) {
  window.__volkan = {
    durum: () => (mesgul ? 'mesgul' : 'hazir'), asama: () => sen.asama, sesKaydi, basla, tezgah, sen: () => sen,
    hedef: () => sen.hedef(), kino: () => kino.simdi, lokum: () => lokum.simdi, cizimHazir: HAZIR, kopukTam: KOPUK_TAM,
  };
}
