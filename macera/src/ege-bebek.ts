/**
 * Bebek Ege: ortak parçalı karakter (src/karakter) + tasarımcının iskeleti (ekip/ege/ege.svg + ege.json →
 * scripts/karakter/iskelet-al.mjs → assets/karakter-iskelet/ege.*). Katmanlar: govde, kol-sol/sag, bacak-sol/sag,
 * kafa, kas, agiz, goz-sol/sag, gizli goz-kapali. Açılar: kafa ±10, kol -40…+35, bacak ±8 (kisilik.ts).
 *
 * İfadeler tasarımcının vektör ekleri (ekip/ege/IFADELER.md; göster/gizle setleri iskeletin JSON'unda "ifadeler"):
 * ağlıyor, am, kıkırdama, kahkaha, şaşkın, dudak büzük, esneme, uyku, uykuda gülümseme, bir göz açık; mamalı yüz
 * (yanak-mamali) her ifadeyle birlikte, silindikçe solar. Gözyaşı damlaları, emzik ve önlük kodla (kafa / gövde katmanına
 * eklenen SVG: kafa dönünce onlar da döner). Başını çevirme: kafa eğilir, yüz parçaları o yana kayar.
 * Hareketler (ağlarken çırpınma, kıkırdama, kahkaha, tekme, irkilme, esneme, uyku nefesi) Karakter.ekHareket ile.
 * Yalnız transform / opacity.
 */
import '../../src/karakter/karakter.css';
import { Karakter, type Poz } from '../../src/karakter/karakter';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { egeAdres } from './ege-cizim';
import { AZ_HAREKET } from './oyuncu';

export const EGE_ISKELET = 'ege';
/** Çizimin kırpımı (x, y, en, boy; 2048'lik iskelet koordinatı) */
const KIRPIM: [number, number, number, number] = [215, 118, 1620, 1840];
/** Ege kutusunun boy/en oranı */
export const EGE_ORAN = KIRPIM[3] / KIRPIM[2];

/** Yüz noktaları (iskelet koordinatı) */
const AGIZ: [number, number] = [1026, 842];
const K = '#4b1917';

export type EgeIfade = 'agliyor' | 'bakiyor' | 'am' | 'kikir' | 'kahkaha' | 'saskin' | 'buzuk' | 'esniyor' | 'uyuyor' | 'uykuda-gulumsuyor' | 'tek-goz';
/** ifade → yanak kızarır mı (ifade setinin adı ifadenin kendisi; "bakiyor" = çizimin kendi yüzü) */
const KIZARIK: Record<EgeIfade, boolean> = {
  agliyor: true,
  bakiyor: false,
  am: false,
  kikir: true,
  kahkaha: true,
  saskin: false,
  buzuk: false,
  esniyor: false,
  uyuyor: false,
  'uykuda-gulumsuyor': true,
  'tek-goz': false,
};

/**
 * Beşikte yatış pozu (iskelet açıları): bacaklar kalçadan aşağı (düz), kollar omuzdan gövdeye doğru.
 * Nefes hızı (rad/sn): ~4.8 sn'lik döngü; battaniye aynı nefesle iner kalkar (--nefes).
 */
const YATIS = { bacak: -62, bacakSinir: 70, kol: -74, nefesHiz: 1.3, kafa: 17, kafaSinir: 34 };

export type EgeHareket = 'kikir' | 'kahkaha' | 'ayak' | 'irkil' | 'esne' | 'kipir' | 'vur' | 'cirp' | 'am' | 'gurul' | 'hayir';
type Mod = 'normal' | 'agla' | 'uyku' | 'yatik';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (ad: string, html: string, sinif = '') => {
  const e = document.createElementNS(NS, ad);
  if (sinif) e.setAttribute('class', sinif);
  e.innerHTML = html;
  return e as SVGGElement;
};

/** Kodla eklenen yüz parçaları (kafa katmanına): hafif yanak kızarması, mama lekelerinin silme noktaları, emzik */
function yuzSvg(dx = 0): string {
  return `
<g class="eg-yanak"><ellipse cx="800" cy="780" rx="92" ry="60" fill="#ef8a82"/><ellipse cx="1254" cy="782" rx="92" ry="60" fill="#ef8a82"/></g>
<g class="eg-yuz-on" transform="translate(${dx} 0)">
  <g class="eg-lekeler"></g>
  <g class="eg-emzik"></g>
</g>`;
}
/** Mama lekesinin yerleri (kafa koordinatı): ağız çevresi, yanaklar, burun, alın */
const LEKE_YER: [number, number, number][] = [
  [920, 922, 60], [1136, 914, 56], [786, 838, 64], [1268, 832, 66], [1036, 984, 56],
];

export class Ege {
  readonly el: HTMLElement;
  readonly kar: Karakter;
  private kutuEl: HTMLElement;
  private balonEl: HTMLElement;
  private temel: EgeIfade = 'bakiyor';
  private gecici = 0;
  private simdiki: EgeIfade = 'bakiyor';
  private hazirP: Promise<void>;
  private mod: Mod = 'normal';
  private hr: { ad: EgeHareket; bas: number; sure: number } | null = null;
  private bakHedef = 0;
  private bakSimdi = 0;
  private emzikEmme = 0;
  /** ağlama gücü 0..1 (çırpınma genliği) */
  aglamaGucu = 1;
  private lekeSay = 0;

  constructor() {
    this.kar = new Karakter(EGE_ISKELET, h('div'));
    // ağzın yeri (test ve erişilebilirlik için işaret; kutuyla birlikte döner)
    const agizIsaret = h('i.eg-agiz-isaret', { 'data-ege': 'agiz', style: `left:${(((AGIZ[0] - KIRPIM[0]) / KIRPIM[2]) * 100).toFixed(1)}%;top:${(((AGIZ[1] + 20 - KIRPIM[1]) / KIRPIM[3]) * 100).toFixed(1)}%` });
    this.kutuEl = h('div.eg-ege-kutu', { style: `--ar:${(1 / EGE_ORAN).toFixed(4)}` }, this.kar.el, agizIsaret);
    this.balonEl = h('div.eg-balon');
    this.el = h('div.eg-ege.eg-yuzlu', { 'data-ege': 'bebek' }, h('i.eg-ege-golge'), this.kutuEl, this.balonEl);
    this.hazirP = this.kur();
    this.goster('bakiyor');
  }

  /** İskelet yüklendi ve yüz parçaları eklendi */
  hazir() {
    return this.hazirP;
  }

  private async kur() {
    for (let i = 0; i < 240 && !this.kar.el.classList.contains('kr-iskeletli'); i++) await new Promise((r) => setTimeout(r, 25));
    const s = this.svg();
    if (!s) return;
    s.setAttribute('viewBox', KIRPIM.join(' '));
    // yüz ekleri kafanın üç hâline de (ön, sola / sağa dönük: yüz ~90 birim kayar); görünen kafayla birlikte görünür
    for (const [ad, dx] of [['kafa', 0], ['kafa-sola', -90], ['kafa-saga', 90]] as const) this.parca(ad)?.append(svgEl('g', yuzSvg(dx), 'eg-yuz'));
    // önlük: gövdenin boynunda (kafanın altında, kolların arkasında)
    const onluk = egeAdres('onluk');
    const g = svgEl(
      'g',
      onluk
        ? `<image href="${onluk}" x="792" y="930" width="456" height="497" preserveAspectRatio="xMidYMid meet"/>`
        : `<path d="M820 960Q1020 1060 1220 960Q1260 1040 1230 1080Q1280 1360 1020 1400Q760 1360 810 1080Q780 1040 820 960Z" fill="#fbeeb0" stroke="${K}" stroke-width="14"/>`,
      'eg-onluk',
    );
    this.parca('govde')?.append(g);
    const em = egeAdres('emzik');
    for (const emzik of s.querySelectorAll('.eg-emzik'))
      emzik.innerHTML = em
        ? `<image href="${em}" x="${AGIZ[0] - 92}" y="${AGIZ[1] - 64}" width="184" height="220"/>`
        : `<ellipse cx="${AGIZ[0]}" cy="${AGIZ[1] + 10}" rx="92" ry="34" fill="#9fd2f2" stroke="${K}" stroke-width="12"/><circle cx="${AGIZ[0]}" cy="${AGIZ[1] + 70}" r="44" fill="none" stroke="#a978c9" stroke-width="20"/>`;
    this.kar.ekHareket = (p, t) => this.poz(p, t);
    this.goster(this.simdiki);
  }

  private svg(): SVGSVGElement | null {
    return this.kar.el.querySelector('svg');
  }
  private parca(ad: string): SVGGElement | null {
    return this.svg()?.querySelector<SVGGElement>(`g[data-parca="${ad}"]`) ?? null;
  }

  // ---------------------------------------------------------------- ifade
  private goster(ad: EgeIfade) {
    this.simdiki = ad;
    this.el.dataset.ifade = ad;
    this.el.classList.toggle('kizarik', KIZARIK[ad]);
    // tasarımcının ifade eki (göster / gizle seti iskeletin JSON'unda); bakıyor: çizimin kendi yüzü
    const yon = this.bakHedef <= -0.5 ? 'sola' : this.bakHedef >= 0.5 ? 'saga' : '';
    if (yon) this.el.dataset.yon = yon;
    else delete this.el.dataset.yon;
    const set = (ad === 'bakiyor' ? 'normal' : ad) + (yon ? `-${yon}` : '');
    this.kar.ifade(set === 'normal' ? null : set);
  }

  /** İfade; ms verilirse o süre sonra temel ifadeye döner, verilmezse yeni temel ifade olur */
  ifade(ad: EgeIfade, ms = 0) {
    clearTimeout(this.gecici);
    if (!ms) this.temel = ad;
    this.goster(ad);
    if (ms) this.gecici = window.setTimeout(() => this.goster(this.temel), sure(ms));
  }
  get ifadeAdi() {
    return this.simdiki;
  }

  // ---------------------------------------------------------------- hareket
  /** Sürekli durum: normal, ağlıyor (çırpınır), uyku (yavaş nefes, kollar gevşek) */
  durum(m: Mod) {
    this.mod = m;
    this.el.classList.toggle('uykuda', m === 'uyku' || m === 'yatik');
    // beşikte yatış: bacaklar düz uzanır, kollar yana iner (oturuş sınırları yalnız bu pozda gevşer)
    this.kar.ozelSinir = m === 'yatik' ? { sinir: { kafa: YATIS.kafaSinir, bacak: YATIS.bacakSinir }, kol: [YATIS.kol - 8, 40] } : null;
    if (m !== 'yatik') this.nefesYaz(0);
  }
  /** Nefes (−1…1) bu elemana --nefes olarak yazılır: üstündeki battaniye nefesle iner kalkar */
  nefesEl: HTMLElement | null = null;
  private nefesYaz(n: number) {
    this.el.style.setProperty('--nefes', n.toFixed(3));
    this.nefesEl?.style.setProperty('--nefes', n.toFixed(3));
  }
  /** Kısa hareket (ms) */
  oynat(ad: EgeHareket, ms = 900) {
    this.hr = { ad, bas: performance.now() / 1000, sure: TEST_MODU ? 0.05 : (AZ_HAREKET ? Math.min(ms, 500) : ms) / 1000 };
  }
  /** Başını çevir: -1 sola (ayı), 1 sağa (civciv), 0 önüne */
  bak(yon: number) {
    this.bakHedef = Math.max(-1, Math.min(1, yon));
    this.el.style.setProperty('--bak', String(this.bakHedef));
    // tasarımcının dönük başı (X-sola / X-saga katmanları), ifadeyle birlikte
    this.goster(this.simdiki);
  }
  /** Ayak sallama (sevinç / yemek) */
  ayakSalla(ms = 900) {
    this.oynat('ayak', ms);
  }
  /** Kıpırdanma */
  kipir(guc = 1) {
    this.oynat(guc > 0.7 ? 'irkil' : 'kipir', 500 + guc * 300);
  }

  private poz(p: Poz, t: number) {
    const S = Math.sin;
    const az = AZ_HAREKET ? 0.3 : 1;
    // bakış yumuşakça döner (takip: kafa önce, yüz parçaları CSS geçişiyle)
    this.bakSimdi += (this.bakHedef - this.bakSimdi) * 0.12;
    p.kafa += this.bakSimdi * 4;
    // bebek: kollar hafif iner-kalkar, ayaklar arada kıpırdar
    p.kolSol += S(t * 1.6) * 3;
    p.kolSag += S(t * 1.6 + 0.8) * 3;
    if (this.mod === 'agla') {
      const g = this.aglamaGucu * az;
      p.kafa += S(t * 9) * 2.5 * g;
      p.y -= Math.abs(S(t * 4.5)) * 1.4 * g;
      p.sy *= 1 + S(t * 9) * 0.018 * g;
      p.kolSol += (14 + S(t * 7) * 16) * g;
      p.kolSag += (14 + S(t * 7 + 1.3) * 16) * g;
      p.bacakSol += S(t * 8) * 7 * g;
      p.bacakSag += S(t * 8 + 1.6) * 7 * g;
    } else if (this.mod === 'yatik') {
      // sırtüstü yatış (kutu CSS'te −90° döner, baş yastıkta): gövde düz, bacaklar uzanık, kollar yanda; yavaş nefes
      const n = S(t * YATIS.nefesHiz);
      this.nefesYaz(AZ_HAREKET ? n * 0.4 : n);
      p.sy = 1 + n * 0.014 * az;
      p.sx = 1 + n * 0.006 * az;
      // baş yastıkta yüzü bize dönük (yatış kutusu −90°; baş boyundan geri döner, yüz dik okunur)
      p.kafa += YATIS.kafa + S(t * 0.5) * 0.8 * az;
      p.kolSol = YATIS.kol + n * 2 * az;
      p.kolSag = YATIS.kol + S(t * YATIS.nefesHiz + 0.3) * 2 * az;
      p.bacakSol = YATIS.bacak;
      p.bacakSag = YATIS.bacak;
    } else if (this.mod === 'uyku') {
      p.sy = 1 + S(t * 1.3) * 0.022;
      p.sx = 1 - S(t * 1.3) * 0.01;
      p.kafa += (this.mod === 'uyku' ? 5 : 0) + S(t * 0.6) * 1;
      p.kolSol = -28 + S(t * 1.3) * 2;
      p.kolSag = -28 + S(t * 1.3 + 0.3) * 2;
    }
    // emzik: cup cup
    if (this.el.classList.contains('emzikli')) {
      const hiz = this.emzikEmme > performance.now() ? 11 : 4;
      this.el.style.setProperty('--emme', (1 + Math.max(0, S(t * hiz)) * 0.07).toFixed(3));
    }
    const hr = this.hr;
    if (!hr) return;
    const u = (performance.now() / 1000 - hr.bas) / hr.sure;
    if (u >= 1) {
      this.hr = null;
      return;
    }
    const z = Math.min(1, u / 0.12, (1 - u) / 0.15);
    const yay = (n: number) => Math.abs(S(u * Math.PI * n));
    switch (hr.ad) {
      case 'kikir':
        p.y -= yay(6) * 2.6 * z * az;
        p.sx *= 1 + yay(6) * 0.03 * z;
        p.sy *= 1 - yay(6) * 0.03 * z;
        p.kolSol += 22 * yay(6) * z;
        p.kolSag += 22 * yay(6) * z;
        p.bacakSol += 7 * S(u * Math.PI * 8) * z;
        p.bacakSag -= 7 * S(u * Math.PI * 8) * z;
        p.kafa -= 3 * z;
        break;
      case 'kahkaha':
        p.y -= yay(8) * 5 * z * az;
        p.sx *= 1 + yay(8) * 0.05 * z;
        p.sy *= 1 - yay(8) * 0.05 * z + 0.02 * z;
        p.kolSol += (18 + 17 * yay(8)) * z;
        p.kolSag += (18 + 17 * yay(8)) * z;
        p.bacakSol += 8 * S(u * Math.PI * 12) * z;
        p.bacakSag -= 8 * S(u * Math.PI * 12) * z;
        p.kafa += 4 * S(u * Math.PI * 4) * z;
        break;
      case 'ayak':
        p.bacakSol += 8 * S(u * Math.PI * 10) * z;
        p.bacakSag -= 8 * S(u * Math.PI * 10) * z;
        p.y -= yay(10) * 0.8 * z;
        break;
      case 'irkil': {
        // irkilme: ani sıçrar (uzar), kollar açılır, sonra toparlanır (follow-through)
        const e = u < 0.18 ? u / 0.18 : Math.max(0, 1 - (u - 0.18) / 0.82);
        p.y -= 6 * e * az;
        p.sy *= 1 + 0.07 * e;
        p.sx *= 1 - 0.04 * e;
        p.kolSol += 35 * e;
        p.kolSag += 35 * e;
        p.bacakSol += 8 * e;
        p.bacakSag += 8 * e;
        p.kafa -= 5 * e;
        break;
      }
      case 'kipir':
        p.don += S(u * Math.PI * 4) * 3 * z;
        p.bacakSol += 6 * S(u * Math.PI * 5) * z;
        p.kolSag += 12 * S(u * Math.PI * 3) * z;
        break;
      case 'esne': {
        const e = S(u * Math.PI);
        p.sy *= 1 + 0.05 * e;
        p.sx *= 1 - 0.02 * e;
        p.kolSol = 35 * e + p.kolSol * (1 - e);
        p.kolSag = 35 * e + p.kolSag * (1 - e);
        p.kafa -= 6 * e;
        break;
      }
      case 'vur':
        // ritim: kollar bir kez çırpar
        p.kolSol += 32 * S(u * Math.PI);
        p.kolSag += 32 * S(u * Math.PI);
        p.y -= 1.5 * S(u * Math.PI);
        break;
      case 'cirp':
        p.kolSol += 25 + 10 * S(u * Math.PI * 8);
        p.kolSag += 25 - 10 * S(u * Math.PI * 8);
        p.y -= yay(4) * 2 * z;
        break;
      case 'am':
        // yer: öne eğilir, çiğner
        p.kafa += 4 * S(u * Math.PI) ;
        p.sx *= 1 + 0.03 * yay(6) * z;
        p.kafaY += 1.2 * yay(6) * z;
        break;
      case 'gurul':
        p.sx *= 1 + 0.03 * S(u * Math.PI * 16) * z;
        p.sy *= 1 - 0.03 * S(u * Math.PI * 16) * z;
        break;
      case 'hayir':
        p.kafa += 9 * S(u * Math.PI * 4) * z;
        break;
    }
  }

  // ---------------------------------------------------------------- balon, önlük, emzik
  async balon(yazi: string, ms = 1300) {
    this.balonEl.textContent = yazi;
    this.balonEl.classList.remove('acik');
    void this.balonEl.offsetWidth;
    this.balonEl.classList.add('acik');
    await new Promise((r) => setTimeout(r, sure(ms)));
    this.balonEl.classList.remove('acik');
  }
  set onluk(tak: boolean) {
    this.el.classList.toggle('onluklu', tak);
  }
  set emzik(tak: boolean) {
    this.el.classList.toggle('emzikli', tak);
  }
  /** Emziği hızlı hızlı emer (uykuda kıpırdanınca) */
  emzikHizli(ms = 1500) {
    this.emzikEmme = performance.now() + ms;
  }

  // ---------------------------------------------------------------- mama lekeleri
  /** Yüzüne bir mama lekesi ekler */
  lekeEkle() {
    const g = this.svg()?.querySelector('.eg-lekeler');
    if (!g) return;
    const [x, y, r] = LEKE_YER[this.lekeSay++ % LEKE_YER.length];
    const n = 9;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (0.82 + 0.2 * Math.sin(i * 2.7 + x));
      d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(0)} ${(y + Math.sin(a) * rr * 0.85).toFixed(0)}`;
    }
    const e = document.createElementNS(NS, 'g');
    e.setAttribute('class', 'eg-leke');
    e.dataset.x = String(x);
    e.dataset.y = String(y);
    e.dataset.r = String(r);
    e.innerHTML = `<path d="${d}Z" fill="#f4c65c" stroke="#c98e22" stroke-width="7" stroke-linejoin="round"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.3}" rx="${r * 0.22}" ry="${r * 0.14}" fill="#fff6c8"/>`;
    g.append(e);
    this.mamaGuncelle();
  }
  /** Tasarımcının mamalı yanak eki: lekeler çoğaldıkça belirginleşir, silindikçe solar */
  private mamaGuncelle() {
    const hepsi = [...(this.svg()?.querySelectorAll<SVGGElement>('.eg-leke') ?? [])];
    const kalan = hepsi.reduce((t, l) => t + Math.max(0, Number(l.dataset.o ?? 1)), 0);
    const oran = hepsi.length ? Math.min(1, 0.45 + 0.11 * hepsi.length) * (kalan / hepsi.length) : 0;
    this.el.style.setProperty('--mama', oran.toFixed(3));
    this.el.classList.toggle('mamali', oran > 0.02);
  }
  /** Silinmemiş lekeler */
  lekeler(): SVGGElement[] {
    return [...(this.svg()?.querySelectorAll<SVGGElement>('.eg-leke:not(.silindi)') ?? [])];
  }
  /** Bir noktanın (ekran px) çevresindeki lekeleri siler (miktar: bu harekette silinen oran); silinen var mı */
  sil(px: number, py: number, yaricap: number, miktar: number): boolean {
    let degisti = false;
    for (const l of this.lekeler()) {
      const [x, y] = this.ekranda(Number(l.dataset.x), Number(l.dataset.y));
      const r = Number(l.dataset.r) * this.birim();
      if (Math.hypot(x - px, y - py) > yaricap + r) continue;
      const o = Number(l.dataset.o ?? 1) - miktar;
      l.dataset.o = String(o);
      l.style.opacity = String(Math.max(0, o));
      if (o <= 0) l.classList.add('silindi');
      degisti = true;
    }
    if (degisti) this.mamaGuncelle();
    return degisti;
  }
  /** En yakın silinmemiş lekenin ekrandaki yeri (ipucu) */
  lekeEkran(): [number, number] | null {
    const l = this.lekeler()[0];
    return l ? this.ekranda(Number(l.dataset.x), Number(l.dataset.y)) : null;
  }

  // ---------------------------------------------------------------- koordinat
  /** Kutunun CSS dönüşü (derece; yatarken −90, kucakta −12; geçiş sürerken o anki değer) */
  private aci(): number {
    const r = getComputedStyle(this.kutuEl).rotate;
    const m = /(-?[\d.]+)deg/.exec(r ?? '');
    return m ? Number(m[1]) : 0;
  }
  /** Çizimin dönmemiş ekran boyu ve dönük kutunun merkezi */
  private cerceve() {
    const r = (this.svg() ?? this.kutuEl).getBoundingClientRect();
    const a = (this.aci() * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const ar = KIRPIM[2] / KIRPIM[3];
    // dönmüş dikdörtgenin sınır kutusu: en = w·|cos| + h·|sin|
    const h0 = a ? r.width / (ar * Math.abs(c) + Math.abs(s)) : r.height;
    const w0 = a ? ar * h0 : r.width;
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w0, h0, c, s };
  }
  /** Çizim koordinatı → ekran (kutu döndüyse dönüşle birlikte: beşikte yatarken de doğru nokta) */
  ekranda(x: number, y: number): [number, number] {
    const { cx, cy, w0, h0, c, s } = this.cerceve();
    const [vx, vy, vw, vh] = KIRPIM;
    const dx = ((x - vx) / vw - 0.5) * w0;
    const dy = ((y - vy) / vh - 0.5) * h0;
    return [cx + dx * c - dy * s, cy + dx * s + dy * c];
  }
  birim() {
    return this.cerceve().w0 / KIRPIM[2];
  }
  /** Çizimdeki bir dikdörtgenin ekrandaki sınır kutusu (dönükken köşeler yer değiştirir) */
  private kutuEkran(x0: number, y0: number, x1: number, y1: number): DOMRect {
    const k = [this.ekranda(x0, y0), this.ekranda(x1, y0), this.ekranda(x0, y1), this.ekranda(x1, y1)];
    const xs = k.map((p) => p[0]);
    const ys = k.map((p) => p[1]);
    return new DOMRect(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  }
  /** Beşikte yatarken örtülecek yer: boyundan ayak uçlarına (baş yastıkta açıkta) */
  yatisOrtuKutusu(): DOMRect {
    return this.kutuEkran(640, 960, 1400, 1960);
  }
  /** Ağzın ekrandaki kutusu (kaşık hedefi) */
  agizKutusu(): DOMRect {
    const [x, y] = this.ekranda(AGIZ[0] + this.bakHedef * 90, AGIZ[1] + 20);
    const b = this.birim() * 220;
    return new DOMRect(x - b / 2, y - b / 2, b, b);
  }
  /** Yüzün ekrandaki kutusu */
  yuzKutusu(): DOMRect {
    return this.kutuEkran(640, 380, 1410, 1030);
  }
  /** Başın üstü (kalpler, Zzz) ekran noktası */
  basUstu(): [number, number] {
    return this.ekranda(1020, 220);
  }
  /** Gövdenin ekrandaki kutusu (önlük, battaniye hedefi) */
  govdeKutusu(): DOMRect {
    return this.kutuEkran(700, 900, 1340, 1700);
  }

  kapat() {
    clearTimeout(this.gecici);
    this.kar.kapat();
  }
}
