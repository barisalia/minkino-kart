/**
 * Müzem (yan dal): çocuğun canlandırdığı resimler bir müze duvarında çerçeveli asılı; dokununca yine canlanır.
 * Kayıt yalnız bu cihazda (localStorage `minkino-canlan-muze-v1`). Çizim toparlanmış hâliyle, boyalar
 * sıkıştırılmış maske (koşu uzunluğu) olarak saklanır; en çok MUZE_EN_COK resim tutulur (en yenisi başta).
 */
import './muze.css';
import canlan from '../../content/canlan.json';
import { efekt, konus } from '../../src/audio/ses';
import { yoldasYuvasi } from '../../src/mino/cizim-yoldas-yuva';
import { h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { azHareket } from '../../src/ui/hareket';
import { IKON } from '../../src/ui/ikonlar';
import { baslikBalon, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { BOYUT, boyaResmi, type Boya } from './boya';
import { canliCizim, type Canli } from './canlandir';
import type { Donusum, Parcali } from './puan';
import { resim, type Mod, type Nokta } from './resimler';
import { sahne } from './sahne';
import { resimSesi, resimSesiHazirla } from './ses';
import { SUS } from './susler';

const S = canlan as unknown as { benim: Record<string, string>; muze: string; muze_bos: string };
const ANAHTAR = 'minkino-canlan-muze-v1';
export const MUZE_EN_COK = 12;

/** Saklanan eser (kısa alan adları: yer kaplamasın) */
interface Kayitli {
  id: string;
  r: string;
  m: Mod;
  y: number;
  t: number;
  d: Donusum;
  k: number;
  c: string;
  /** parçalar: parça adı + noktalar (binde bir hassasiyet, "x,y,x,y…") */
  p: { a: string; n: string }[];
  /** boyalar: parça, renk, maske koşu uzunlukları (0'dan başlar) */
  b: { a: string; r: string; m: string }[];
}

export interface MuzeEseri {
  id: string;
  resim: string;
  mod: Mod;
  yildiz: number;
  tarih: number;
  donusum: Donusum;
  kalinlik: number;
  renk: string;
  parcalar: Parcali[];
  boyalar: Boya[];
}

function rleYaz(m: Uint8Array): string {
  const kosu: number[] = [];
  let deger = 0;
  let say = 0;
  for (let i = 0; i < m.length; i++) {
    const v = m[i] ? 1 : 0;
    if (v === deger) say++;
    else {
      kosu.push(say);
      deger = v;
      say = 1;
    }
  }
  kosu.push(say);
  return kosu.join(',');
}

function rleOku(s: string, N = BOYUT * BOYUT): Uint8Array {
  const m = new Uint8Array(N);
  let i = 0;
  let deger = 0;
  for (const k of s.split(',')) {
    const n = Number(k) || 0;
    if (deger) m.fill(1, i, Math.min(N, i + n));
    i += n;
    deger ^= 1;
  }
  return m;
}

const noktaYaz = (n: Nokta[]) => n.map(([x, y]) => `${Math.round(x * 1000)},${Math.round(y * 1000)}`).join(',');
function noktaOku(s: string): Nokta[] {
  const v = s.split(',').map(Number);
  const n: Nokta[] = [];
  for (let i = 0; i + 1 < v.length; i += 2) n.push([v[i] / 1000, v[i + 1] / 1000]);
  return n;
}

function hamOku(): Kayitli[] {
  try {
    const ham = globalThis.localStorage?.getItem(ANAHTAR);
    const liste = ham ? (JSON.parse(ham) as Kayitli[]) : [];
    return Array.isArray(liste) ? liste.filter((k) => k && typeof k.r === 'string' && resim(k.r)) : [];
  } catch {
    return [];
  }
}

function hamYaz(liste: Kayitli[]) {
  // yer dolarsa en eskiler bırakılır
  for (let n = liste.length; n > 0; n--) {
    try {
      globalThis.localStorage?.setItem(ANAHTAR, JSON.stringify(liste.slice(0, n)));
      return;
    } catch {
      /* kota: bir eksiğiyle dene */
    }
  }
}

export const muzeSayisi = () => hamOku().length;

export function muzeListe(): MuzeEseri[] {
  return hamOku().map((k) => ({
    id: k.id,
    resim: k.r,
    mod: k.m,
    yildiz: k.y,
    tarih: k.t,
    donusum: k.d,
    kalinlik: k.k,
    renk: k.c,
    parcalar: k.p.map((p) => ({ parca: p.a, n: noktaOku(p.n) })),
    boyalar: k.b.map((b) => ({ parca: b.a, renk: b.r, maske: rleOku(b.m) })),
  }));
}

/** Canlanan resmi müzeye asar (en yenisi başta). */
export function muzeyeAs(e: Omit<MuzeEseri, 'id' | 'tarih'>): void {
  // aynı parçaya üst üste boyandıysa yalnız son boya görünür; hepsi saklanır (sıra önemli)
  const k: Kayitli = {
    id: `m${Date.now().toString(36)}`,
    r: e.resim,
    m: e.mod,
    y: e.yildiz,
    t: Date.now(),
    d: { s: +e.donusum.s.toFixed(5), tx: +e.donusum.tx.toFixed(5), ty: +e.donusum.ty.toFixed(5) },
    k: +e.kalinlik.toFixed(4),
    c: e.renk,
    p: e.parcalar.map((p) => ({ a: p.parca, n: noktaYaz(p.n) })),
    b: e.boyalar.slice(-24).map((b) => ({ a: b.parca, r: b.renk, m: rleYaz(b.maske) })),
  };
  hamYaz([k, ...hamOku()].slice(0, MUZE_EN_COK));
}

/** Bir eseri sahnesiyle çizer (canlı değil; baslat() ile canlanır). */
function eserSahnesi(e: MuzeEseri): { sh: HTMLElement; canli: Canli } | null {
  const r = resim(e.resim);
  if (!r) return null;
  const sh = sahne(r);
  sh.classList.add('canli');
  const canli = canliCizim(r, e.parcalar, e.donusum, { kalinlik: e.kalinlik, renk: e.renk });
  sh.append(canli.el);
  return { sh, canli };
}

/** Boyaları parça parça resme çevirir (ağır: çerçeveler sırayla, kare kare boyanır). */
const boyaOnbellek = new Map<string, Map<string, string>>();
function boyalariKoy(e: MuzeEseri, canli: Canli) {
  let m = boyaOnbellek.get(e.id);
  if (!m) {
    m = new Map();
    for (const parca of new Set(e.boyalar.map((b) => b.parca))) m.set(parca, boyaResmi(e.boyalar.filter((b) => b.parca === parca)).toDataURL());
    boyaOnbellek.set(e.id, m);
  }
  for (const [parca, url] of m) canli.boyaKoy(parca, url);
  if (SUS[e.resim]) canli.susGoster();
}

function yildizlar(y: number): HTMLElement {
  const k = h('span.cc-plaka-yildiz', { 'aria-label': `${y} yıldız` });
  for (let i = 0; i < 3; i++) k.append(h(`i${i < y ? '.dolu' : ''}`, { html: IKON.yildiz }));
  return k;
}

// ---------------------------------------------------------------- Müze ekranı
export function muzeEkrani(app: Uygulama): Ekran {
  const liste = muzeListe();
  const duvar = h('div.cc-muze-duvar');
  const yuva = yoldasYuvasi('cc-muze-mino');
  const zamanlar: number[] = [];
  let acik: { kapat(): void } | null = null;
  let kapandi = false;

  liste.forEach((e, i) => {
    const r = resim(e.resim)!;
    const ic = h('div.cc-cerceve-ic');
    const cerceve = h(
      'button.cc-muze-cerceve',
      { type: 'button', 'aria-label': S.benim[e.resim] ?? r.ad, 'data-resim': e.resim, style: `--i:${i};--egim:${(((i * 7) % 5) - 2) * 0.9}deg` },
      ic,
      h('span.cc-plaka', {}, h('b', {}, S.benim[e.resim] ?? r.ad), yildizlar(e.yildiz)),
    );
    // çizimler sırayla (her biri ayrı karede) yerine konur: giriş akıcı kalsın
    zamanlar.push(
      window.setTimeout(() => {
        if (kapandi) return;
        const s = eserSahnesi(e);
        if (!s) return;
        ic.append(s.sh);
        boyalariKoy(e, s.canli);
      }, TEST_MODU ? 0 : 120 + i * 90),
    );
    cerceve.addEventListener('click', () => {
      if (acik) return;
      efekt.secim();
      acik = yakinBak(app, e, cerceve, () => (acik = null));
      yuva.yap((y) => y.sasir());
    });
    duvar.append(cerceve);
  });

  // Duvar yarım kalmasın: az resim varken boş yerlere soru işaretli çerçeveler, altında "Hadi çizelim"
  if (liste.length < 3) {
    for (let i = liste.length; i < 3; i++) duvar.append(h('div.cc-muze-cerceve.bos', { style: `--i:${i};--egim:${[-2, 1.5, -1][i]}deg` }, h('div.cc-cerceve-ic', {}, h('span', {}, '?'))));
    const hadi = h('button.dugme.cc-muze-hadi', { type: 'button', 'aria-label': 'Hadi çizelim' }, svg(IKON.kalem), h('span', {}, 'Hadi çizelim'));
    hadi.addEventListener('click', () => {
      efekt.secim();
      app.git('liste');
    });
    duvar.append(hadi);
  }

  const el = h(
    'div.cc-muze',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.git('liste')), baslikBalon('Müzem', liste.length ? S.muze : S.muze_bos), h('div', { style: 'width:56px' })),
    h('div.kaydir.cc-muze-kaydir', {}, duvar, h('div.cc-muze-zemin')),
    yuva.el,
  );
  yuva.hazir.then((y) => y?.dokunulur(true));
  void konus(liste.length ? S.muze : S.muze_bos);
  return {
    el,
    kapat() {
      kapandi = true;
      zamanlar.forEach(clearTimeout);
      acik?.kapat();
      yuva.kapat();
    },
  };
}

/** Yakından bak: çerçeve büyüyüp ortaya gelir, resim yeniden canlanır; dokununca tepki + sesi. */
function yakinBak(app: Uygulama, e: MuzeEseri, kaynak: HTMLElement, bitti: () => void): { kapat(): void } {
  const s = eserSahnesi(e)!;
  s.sh.classList.remove('canli');
  const buyuk = h('div.cc-muze-buyuk', {}, h('div.cc-cerceve-ic', {}, s.sh));
  const yuva = yoldasYuvasi('cc-muze-buyuk-mino');
  const kapatD = yuvarlakDugme(IKON.kapat, 'Kapat', () => kapat(), 'cc-muze-kapat');
  const perde = h('div.cc-muze-perde', { role: 'dialog', 'aria-label': S.benim[e.resim] ?? 'Resim' }, h('div.cc-muze-sahne', {}, buyuk, yuva.el), kapatD);
  app.kok.append(perde);
  boyalariKoy(e, s.canli);
  resimSesiHazirla(e.resim);
  // FLIP: küçük çerçevenin yerinden büyüyerek gelir
  if (!TEST_MODU && !azHareket()) {
    const a = kaynak.getBoundingClientRect();
    const b = buyuk.getBoundingClientRect();
    if (a.width && b.width) {
      buyuk.animate(
        [
          { transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width})` },
          { transform: 'none' },
        ],
        { duration: 520, easing: 'cubic-bezier(0.3, 1.25, 0.5, 1)' },
      );
    }
  }
  let bitis = 0;
  let canlandi = false;
  const baslat = window.setTimeout(() => {
    s.sh.classList.add('canli');
    s.canli.baslat();
    canlandi = true;
    efekt.kilitAcildi();
    void resimSesi(e.resim);
    yuva.yap((y) => y.dans());
  }, sure(480));
  yuva.hazir.then((y) => y && window.setTimeout(() => y.sasir(), sure(300)));
  let sonDokunus = 0;
  s.sh.addEventListener('pointerdown', () => {
    if (!canlandi) return;
    const simdi = performance.now();
    if (simdi - sonDokunus < 350) return;
    sonDokunus = simdi;
    s.canli.dokun();
    void resimSesi(e.resim);
    yuva.yap((y) => y.sevin());
  });
  perde.addEventListener('click', (ev) => ev.target === perde && kapat());
  function kapat() {
    if (bitis) return;
    clearTimeout(baslat);
    perde.classList.add('kapaniyor');
    bitis = window.setTimeout(() => {
      s.canli.durdur();
      yuva.kapat();
      perde.remove();
      bitti();
    }, sure(260));
  }
  return { kapat };
}
