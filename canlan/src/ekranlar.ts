import canlan from '../../content/canlan.json';
import { efekt, konus } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import { bekle, h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { baslikBalon, sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Tuval, type Cizgi } from '../../sanatci/src/tuval';
import { boyaBolgesi, boyaResmi, sihirliBoya, type Boya } from './boya';
import { canliCizim, sablonSvg, yolD } from './canlandir';
import { noktaOyunu, parmakIpucu, type NoktaOyunu } from './nokta';
import { enIyi, kaydet, kayit, yildizKaydet } from './ilerleme';
import { AYAR, canlanirMi, ornekle, parcalaraBol, puanla, toparla } from './puan';
import { MODLAR, RESIMLER, resim, yasModu, type Mod, type Nokta, type Resim } from './resimler';
import { kartPaylas, kartYap, tekrarOynat } from './kart';
import { resimSesi, resimSesiHazirla } from './ses';
import { SUS } from './susler';

const S = canlan as unknown as {
  hosgeldin: string; sec: string; mod: Record<Mod, string>; mod_ad: Record<Mod, string>; simdi: string; sayac: string[];
  yildiz: Record<string, string>; canlaniyor: string; eksik: string; tekrar: string; bos: string; boya: string; benim: Record<string, string>;
};
const NS = 'http://www.w3.org/2000/svg';
const sv = <K extends keyof SVGElementTagNameMap>(ad: K, a: Record<string, string | number> = {}) => {
  const e = document.createElementNS(NS, ad);
  for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
  return e;
};
const SIRALI = [...RESIMLER].sort((a, b) => a.zorluk - b.zorluk);
const yas = () => durum.i.yas ?? 4;
const aktifMod = (): Mod => kayit.mod[String(yas())] ?? yasModu(yas());
const MOD_IKON: Record<Mod, string> = { iz: IKON.yol, nokta: IKON.noktalar, kopya: IKON.goz, hafiza: IKON.beyin };
const MOD_RENK: Record<Mod, string> = { iz: '#F0413F', nokta: '#3E9DF2', kopya: '#5DBE3F', hafiza: '#9B5CE0' };
const KALINLIK: Record<number, number> = { 3: 0.03, 4: 0.026, 5: 0.022, 6: 0.022 };
const RENKLER = ['#F0413F', '#FF8A2B', '#FFB000', '#3FA535', '#3E9DF2', '#9B5CE0'];
let secilenRenk: string | null = null;

function logo(): HTMLElement {
  const renk = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'];
  const kelime = (k: string, bas: number) => {
    const s = h('span.cc-logo-kelime');
    [...k].forEach((c, i) => s.append(h('span', { style: `color:${renk[(i + bas) % renk.length]};--i:${i + bas}` }, c)));
    return s;
  };
  return h('div.cc-logo', { role: 'img', 'aria-label': 'Çiz Canlansın' }, kelime('Çiz', 0), kelime('Canlansın', 3));
}

const SAHNE_RESIM = import.meta.glob<string>('../../assets/sahne/*.webp', { eager: true, query: '?url', import: 'default' });
/** Sihirli hâl: her resmin kitap illüstrasyonu (Recraft) */
const GERCEK_RESIM = import.meta.glob<string>('../../assets/canlan/*.webp', { eager: true, query: '?url', import: 'default' });
/** İllüstrasyonu sola bakan resimler (sahnede aynalanır) */
const AYNALI = new Set(['ucak']);

/** Adresi veri adresine çevirir (kart için SVG'nin içine gömülebilsin). */
async function veriAdresi(url: string): Promise<string> {
  const b = await (await fetch(url)).blob();
  return new Promise((coz) => {
    const o = new FileReader();
    o.onload = () => coz(String(o.result));
    o.readAsDataURL(b);
  });
}

/** Renklerin ton farkı (derece). Gri/beyaz renklerde 0. */
function tonFarki(hedef: string, kaynak: string): number {
  const ton = (h: string) => {
    const v = parseInt(h.replace('#', ''), 16);
    const [r, g, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x) => x / 255);
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    const d = mx - mn;
    if (d < 0.15) return null;
    const t = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (t * 60 + 360) % 360;
  };
  const a = ton(hedef);
  const b = ton(kaynak);
  if (a === null || b === null) return 0;
  let f = a - b;
  if (f > 180) f -= 360;
  if (f < -180) f += 360;
  return Math.abs(f) < 12 ? 0 : f;
}

/** Kâğıt tanesi (bir kez üretilir): sahnenin üstünde çok hafif, pastel resim hissi verir. */
let kagitUrl = '';
function kagitDokusu(): string {
  if (kagitUrl) return kagitUrl;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const x = c.getContext('2d')!;
    const img = x.createImageData(160, 160);
    for (let i = 0; i < 160 * 160; i++) {
      const v = 200 + Math.random() * 55;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    kagitUrl = c.toDataURL('image/png');
  } catch {
    kagitUrl = 'data:,';
  }
  return kagitUrl;
}

/** Sahne (deniz, gök, çayır…): kitap kalitesinde arka plan resmi + hareketli süsler. */
function sahne(r: Resim): HTMLElement {
  const s = h(`div.cc-sahne.sahne-${r.sahne}`);
  s.style.setProperty('--kagit', `url("${kagitDokusu()}")`);
  const url = SAHNE_RESIM[`../../assets/sahne/${r.sahne}.webp`];
  if (url) {
    s.classList.add('resimli');
    s.style.setProperty('--sahne', `url("${url}")`);
  }
  const sus = h('div.cc-sahne-sus', { 'aria-hidden': 'true' });
  const adet = { deniz: 7, okyanus: 0, gok: 3, cayir: 4, gece: 12, yol: 3, kar: 14 }[r.sahne];
  for (let i = 0; i < adet; i++) sus.append(h('i', { style: `--i:${i};--x:${(i * 37) % 100};--y:${(i * 53) % 100}` }));
  s.append(sus);
  return s;
}

/** Çizimin titrek el ile yapılmış hâli (açılıştaki vitrin için). */
function titrekKopya(r: Resim): Nokta[][] {
  let t = 0;
  return r.cizgiler.map((c) => ornekle(c.n, 0.01).map(([x, y]): Nokta => {
    t += 0.37;
    return [x + Math.sin(t) * 0.006, y + Math.cos(t * 1.3) * 0.006];
  }));
}

// ---------------------------------------------------------------- Açılış
export function acilisEkrani(app: Uygulama): Ekran {
  const r = resim('balik')!;
  const p = puanla(r, titrekKopya(r), 'iz', 5);
  const vitrin = sahne(r);
  vitrin.classList.add('cc-vitrin', 'canli');
  const c = canliCizim(r, p.parcalar, p.donusum, { kalinlik: 0.03, renk: r.renk });
  vitrin.append(c.el);
  const boyalar = sihirliBoya(r, titrekKopya(r).map((n) => ({ n, kalinlik: 0.03 })), p.donusum);
  new Set(boyalar.map((b) => b.parca)).forEach((parca) => c.boyaKoy(parca, boyaResmi(boyalar.filter((b) => b.parca === parca)).toDataURL()));
  c.susGoster();
  c.baslat();
  let sonDokunus = 0;
  vitrin.addEventListener('pointerdown', () => {
    const simdi = performance.now();
    if (simdi - sonDokunus < 350) return;
    sonDokunus = simdi;
    c.dokun();
    void resimSesi(r.id);
  });

  const oyna = h('button.dugme.cc-oyna', { type: 'button', 'aria-label': 'Oyna' }, svg(IKON.oyna), h('span', {}, 'Oyna'));
  oyna.addEventListener('click', () => {
    efekt.secim();
    app.git(durum.i.yas ? 'liste' : 'yas', { sonra: 'liste' });
  });
  const el = h(
    'div.cc-acilis',
    {},
    h('div.ust-cubuk', {}, h('div'), sesDugmesi()),
    logo(),
    vitrin,
    h('div.cc-acilis-alt', {}, oyna),
  );
  el.addEventListener('pointerdown', () => void konus(S.hosgeldin), { once: true });
  return { el, kapat: () => c.durdur() };
}

// ---------------------------------------------------------------- Resim seçimi
export function listeEkrani(app: Uygulama): Ekran {
  let mod = aktifMod();
  const izgara = h('div.cc-izgara');
  const modlar = h('div.cc-modlar', { role: 'radiogroup', 'aria-label': 'Nasıl çizelim?' });

  function kartlar() {
    izgara.replaceChildren();
    SIRALI.forEach((r, i) => {
      const y = enIyi(mod, r.id);
      const yildizlar = h('div.cc-kart-yildiz', { 'aria-label': `${y} yıldız` });
      for (let k = 0; k < 3; k++) yildizlar.append(h(`i${k < y ? '.dolu' : ''}`, { html: IKON.yildiz }));
      const b = h('button.cc-resim', { type: 'button', 'aria-label': r.ad, 'data-resim': r.id, style: `--i:${i};--r:${r.renk}` }, GERCEK_RESIM[`../../assets/canlan/${r.id}.webp`] ? h('img.cc-resim-gorsel', { src: GERCEK_RESIM[`../../assets/canlan/${r.id}.webp`], alt: '', loading: 'lazy' }) : sablonSvg(r, { kalinlik: 0.03, tur: 'sus' }), h('span.cc-resim-ad', {}, r.ad), yildizlar);
      b.addEventListener('click', () => {
        efekt.secim();
        app.git('ciz', { id: r.id, mod });
      });
      izgara.append(b);
    });
  }
  function modlariCiz() {
    modlar.replaceChildren();
    for (const m of MODLAR) {
      const b = h(`button.cc-mod${m === mod ? '.secili' : ''}`, { type: 'button', role: 'radio', 'aria-checked': String(m === mod), 'aria-label': S.mod_ad[m], 'data-mod': m, style: `--r:${MOD_RENK[m]}` }, svg(MOD_IKON[m]), h('span', {}, S.mod_ad[m]));
      b.addEventListener('click', () => {
        if (m === mod) return;
        efekt.dokunma();
        mod = m;
        kayit.mod[String(yas())] = m;
        kaydet();
        modlariCiz();
        kartlar();
        void konus(S.mod[m]);
      });
      modlar.append(b);
    }
  }
  modlariCiz();
  kartlar();
  const yasDugme = h('button.cc-yas', { type: 'button', 'aria-label': 'Yaşı değiştir' }, `${yas()} yaş`);
  yasDugme.addEventListener('click', () => {
    efekt.dokunma();
    app.git('yas', { sonra: 'liste' });
  });
  const el = h(
    'div.cc-liste',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.ev, 'Ana ekran', () => app.git('acilis')), baslikBalon('Ne çizelim?', S.sec), yasDugme),
    modlar,
    h('div.kaydir', {}, izgara),
  );
  void konus(S.sec);
  return { el };
}

// ---------------------------------------------------------------- Çizim
export function cizEkrani(app: Uygulama, p: { id: string; mod: Mod; devam?: Cizgi[] }): Ekran {
  const r = resim(p.id) ?? RESIMLER[0];
  const mod = p.mod;
  const tuval = new Tuval();
  tuval.renk = secilenRenk ?? r.renk;
  tuval.kalinlik = KALINLIK[yas()] ?? 0.024;
  const alt = sv('svg', { viewBox: '0 0 1 1', class: 'cc-alt-katman', 'aria-hidden': 'true' });
  const ust = sv('svg', { viewBox: '0 0 1 1', class: 'cc-ust-katman', 'aria-hidden': 'true' });
  const kagit = h('div.cc-kagit', { 'data-mod': mod }, alt, tuval.el, ust);
  const alan = h('div.cc-alan', {}, kagit);
  let kapandi = false;
  let bitiyor = false;
  const kapanis: (() => void)[] = [];
  const tol = AYAR.tolerans[mod] * (AYAR.yas_carpani[String(yas())] ?? 1);

  // --- Renkler
  const palet = h('div.cc-palet', { role: 'radiogroup', 'aria-label': 'Renkler' });
  for (const renk of RENKLER) {
    const b = h(`button.cc-boya${renk === tuval.renk ? '.secili' : ''}`, { type: 'button', style: `--r:${renk}`, 'aria-label': 'Renk', 'data-renk': renk });
    b.addEventListener('click', () => {
      tuval.renk = renk;
      secilenRenk = renk;
      palet.querySelectorAll('.secili').forEach((x) => x.classList.remove('secili'));
      b.classList.add('secili');
      efekt.dokunma();
    });
    palet.append(b);
  }

  const bitti = h('button.dugme.cc-bitti', { type: 'button', 'aria-label': 'Bitti', disabled: true }, svg(IKON.onay), h('span', {}, 'Bitti'));
  bitti.addEventListener('click', () => bitir(nokta?.hata));

  // --- Canlı geri bildirim (yol boyanır / noktalar yanar)
  let geriBildirim: (p: Nokta) => void = () => undefined;
  let tamamMi = () => false;

  if (mod === 'iz') {
    const yollar = sv('g', { class: 'cc-yol' });
    for (const c of r.cizgiler) {
      const d = yolD(c.n);
      yollar.append(sv('path', { d, class: 'cc-yol-zemin' }), sv('path', { d, class: 'cc-yol-orta', stroke: r.renk }));
    }
    for (const c of r.cizgiler) {
      const [x, y] = c.n[0];
      yollar.append(sv('circle', { cx: x, cy: y, r: 0.028, class: 'cc-basla' }));
    }
    alt.append(yollar);
    const boyali = sv('g', { class: 'cc-boya-izi', fill: r.renk });
    const noktalar = r.cizgiler.flatMap((c) => ornekle(c.n, 0.02));
    const daireler = noktalar.map(([x, y]) => {
      const d = sv('circle', { cx: x, cy: y, r: 0.014 });
      boyali.append(d);
      return d;
    });
    const dolu = new Uint8Array(noktalar.length);
    let sayi = 0;
    ust.append(boyali);
    geriBildirim = ([x, y]) => {
      noktalar.forEach(([a, b], i) => {
        if (!dolu[i] && Math.hypot(a - x, b - y) < tol) {
          dolu[i] = 1;
          sayi++;
          daireler[i].classList.add('dolu');
        }
      });
    };
    tamamMi = () => sayi / noktalar.length >= 0.93;
    // Bir süre çizilmezse parmak, boyanmamış ilk yolu gösterir
    const sinirlar: [number, number][] = [];
    let k = 0;
    for (const c of r.cizgiler) {
      const n = ornekle(c.n, 0.02).length;
      sinirlar.push([k, k + n]);
      k += n;
    }
    const ipucu = parmakIpucu(kagit);
    let bosta: number | undefined;
    const bostaKur = () => {
      clearTimeout(bosta);
      ipucu.gizle();
      bosta = window.setTimeout(() => {
        if (kapandi) return;
        const i = sinirlar.findIndex(([a, b]) => dolu.slice(a, b).reduce((t, v) => t + v, 0) / (b - a) < 0.8);
        if (i < 0) return;
        const [a, b] = sinirlar[i];
        let bas = a;
        while (bas < b && dolu[bas]) bas++;
        ipucu.goster(noktalar.slice(Math.max(a, bas - 1), Math.min(b, bas + 18)));
      }, 3000);
    };
    kagit.addEventListener('pointerdown', bostaKur);
    kagit.addEventListener('pointerup', bostaKur);
    bostaKur();
    kapanis.push(() => {
      clearTimeout(bosta);
      ipucu.gizle();
    });
  }

  let nokta: NoktaOyunu | null = null;
  if (mod === 'nokta') nokta = noktaOyunu({ r, kagit, ust, tuval, bitti: (hata) => bitir(hata) });

  let model: HTMLElement | null = null;
  if (mod === 'kopya') {
    model = h('div.cc-model', {}, sablonSvg(r, { kalinlik: 0.04, tur: 'acik' }));
  }

  // canlı izleme: çizim sırasında son noktalar
  let takip = false;
  const hareket = () => {
    const son = tuval.cizgiler[tuval.cizgiler.length - 1];
    if (!son || son.silgi) return;
    for (const n of son.noktalar.slice(-6)) geriBildirim(n);
  };
  tuval.el.addEventListener('pointerdown', () => {
    takip = true;
    hareket();
  });
  tuval.el.addEventListener('pointermove', () => takip && hareket());
  tuval.onDegisim = () => {
    takip = false;
    const bos = tuval.bosMu();
    bitti.disabled = bos;
    bitti.classList.toggle('hazir', !bos);
    if (!bos && tamamMi() && !bitiyor) {
      bitiyor = true;
      setTimeout(() => !kapandi && bitir(), sure(650));
    }
  };

  function bitir(hata?: number) {
    if (kapandi) return;
    if (tuval.bosMu()) {
      bitiyor = false;
      void konus(S.bos);
      return;
    }
    efekt.secim();
    app.git('sonuc', { id: r.id, mod, cizgiler: tuval.cizgiler.filter((c) => !c.silgi), hata: hata ?? nokta?.hata });
  }

  // --- Hafızadan: 3 saniye göster, sonra sakla
  let gozDugme: HTMLButtonElement | null = null;
  if (mod === 'hafiza') {
    const goster = sablonSvg(r, { kalinlik: 0.04, sinif: 'cc-hafiza-model', tur: 'acik' });
    const sayac = h('div.cc-sayac', { 'aria-live': 'polite' });
    kagit.append(goster, sayac);
    kagit.classList.add('bakiyor');
    let bakti = false;
    gozDugme = yuvarlakDugme(IKON.goz, 'Bir daha bak', async () => {
      if (bakti) return;
      bakti = true;
      gozDugme!.disabled = true;
      goster.classList.remove('gizli');
      await bekle(sure(1500));
      goster.classList.add('gizli');
    }, 'kucuk cc-goz');
    gozDugme.disabled = true;
    void (async () => {
      await konus(S.mod.hafiza);
      for (let i = 0; i < 3 && !kapandi; i++) {
        sayac.textContent = String(3 - i);
        sayac.classList.remove('vur');
        void sayac.offsetWidth;
        sayac.classList.add('vur');
        efekt.dokunma();
        await Promise.all([konus(S.sayac[i]), bekle(sure(1000))]);
      }
      if (kapandi) return;
      sayac.remove();
      goster.classList.add('gizli');
      kagit.classList.remove('bakiyor');
      gozDugme!.disabled = false;
      void konus(S.simdi);
    })();
  } else {
    void konus([`${r.ad}!`, S.mod[mod]]);
  }

  if (p.devam?.length) tuval.yukle(p.devam);
  const balonSesi = mod === 'hafiza' ? S.mod.hafiza : [`${r.ad}!`, S.mod[mod]];
  const balon = baslikBalon(r.ad, balonSesi);
  balon.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.yuvarlak')) return;
    void konus(balonSesi);
  });

  const el = h(
    `div.cc-ciz.mod-${mod}`,
    {},
    h(
      'div.ust-cubuk',
      {},
      h('div.ust-grup', {}, yuvarlakDugme(IKON.geri, 'Resimler', () => app.git('liste')), yuvarlakDugme(IKON.geriAl, 'Geri al', () => (nokta ? nokta.geriAl() : tuval.geriAl()), 'kucuk')),
      balon,
      h('div.ust-grup', {}, ...(gozDugme ? [gozDugme] : []), yuvarlakDugme(IKON.sil, 'Temizle', () => (nokta ? nokta.temizle() : tuval.temizle()), 'kucuk')),
    ),
    h('div.cc-calisma', {}, ...(model ? [model] : []), alan),
    h('div.cc-alt', {}, palet, bitti),
  );
  if (TEST_MODU) (window as unknown as { __tuval: Tuval }).__tuval = tuval;
  return {
    el,
    kapat() {
      kapandi = true;
      nokta?.kapat();
      kapanis.forEach((f) => f());
      tuval.kapat();
    },
  };
}

/** Paylaşım yoksa kartı gösterir (basılı tutup kaydetmek için). */
function kartPenceresi(b: Blob): HTMLElement {
  const url = URL.createObjectURL(b);
  const kapat = h('button.dugme', { type: 'button', style: '--r:#5DBE3F' }, 'Tamam');
  const perde = h('div.perde', { role: 'dialog', 'aria-label': 'Kartım' }, h('div.pencere.cc-kart-pencere', {}, h('img', { src: url, alt: 'Resim kartım' }), h('p', {}, 'Resmi basılı tutup kaydedebilirsin.'), kapat));
  kapat.addEventListener('click', () => {
    perde.remove();
    URL.revokeObjectURL(url);
  });
  return perde;
}

// ---------------------------------------------------------------- Sonuç: yıldız → boya → canlan
const BOYALAR = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#2FB5A5', '#6CC8FF', '#3E9DF2', '#9B5CE0', '#FF7EB6', '#A0522D', '#FFFFFF', '#3b3b3b'];

export function sonucEkrani(app: Uygulama, p: { id: string; mod: Mod; cizgiler: Cizgi[]; hata?: number }): Ekran {
  const r = resim(p.id) ?? RESIMLER[0];
  const sonuc = puanla(r, p.cizgiler.map((c) => c.noktalar), p.mod, yas());
  // Nokta birleştirmede çizgi zaten düzgün çıkar; yıldızı yanlış başlangıç sayısı belirler
  if (p.mod === 'nokta' && p.hata !== undefined) sonuc.yildiz = Math.min(sonuc.yildiz, p.hata <= 2 ? 3 : p.hata <= 6 ? 2 : 1) as typeof sonuc.yildiz;
  yildizKaydet(p.mod, r.id, sonuc.yildiz);
  // en uzun çizginin rengi
  const ana = [...p.cizgiler].sort((a, b) => b.noktalar.length - a.noktalar.length)[0];
  // Çocuğun çizgisi toparlanır: onun çizgisi ama kitaptaki gibi temiz
  const guzel = toparla(r, p.cizgiler.map((c) => c.noktalar), sonuc.donusum);
  const canli = canliCizim(r, parcalaraBol(r, guzel, sonuc.donusum), sonuc.donusum, { kalinlik: ana?.kalinlik ?? 0.025, renk: ana?.renk ?? r.renk });
  const sh = sahne(r);
  sh.append(canli.el);
  const kutu = h('div.cc-sonuc-kutu', {}, sh);
  const cizgiler = guzel.map((n, i) => ({ n, kalinlik: p.cizgiler[i].kalinlik }));

  const yildizlar = h('div.cc-yildizlar', { 'aria-label': `${sonuc.yildiz} yıldız`, 'data-yildiz': sonuc.yildiz });
  for (let i = 0; i < 3; i++) yildizlar.append(h('i', { html: IKON.yildiz }));

  const sonraki = SIRALI[(SIRALI.findIndex((x) => x.id === r.id) + 1) % SIRALI.length];
  const tekrar = h('button.dugme.cc-tekrar', { type: 'button', 'aria-label': 'Tekrar çiz', style: '--r:#FF8A2B' }, svg(IKON.tekrar), h('span', {}, 'Tekrar'));
  tekrar.addEventListener('click', () => app.git('ciz', { id: r.id, mod: p.mod }));
  const ileri = h('button.dugme.cc-sonraki', { type: 'button', 'aria-label': 'Sonraki resim' }, h('span', {}, 'Sonraki'), svg(IKON.oyna));
  ileri.addEventListener('click', () => app.git('ciz', { id: sonraki.id, mod: p.mod }));
  const tamamla = h('button.dugme.cc-tamamla', { type: 'button', 'aria-label': 'Tamamla', style: '--r:#3E9DF2', hidden: true }, svg(IKON.kalem), h('span', {}, 'Tamamla'));
  tamamla.addEventListener('click', () => app.git('ciz', { id: r.id, mod: p.mod, devam: p.cizgiler }));
  // Nasıl çizdim? (çizimi sırayla yeniden çizer) ve paylaşılabilir kart
  let tekrarOynuyor = false;
  const nasil = yuvarlakDugme(IKON.oyna, 'Nasıl çizdim?', async () => {
    if (tekrarOynuyor) return;
    tekrarOynuyor = true;
    await tekrarOynat(sh, p.cizgiler);
    tekrarOynuyor = false;
  }, 'kucuk cc-nasil');
  const kart = yuvarlakDugme(IKON.paylas, 'Kartım', async () => {
    kart.disabled = true;
    try {
      const b = await kartYap({ svg: canli.el, sahneUrl: SAHNE_RESIM[`../../assets/sahne/${r.sahne}.webp`], baslik: S.benim[r.id] ?? r.ad, yildiz: sonuc.yildiz });
      const d = await kartPaylas(b, `${r.id}-kartim.png`);
      if (d === 'goster') app.kok.append(kartPenceresi(b));
    } finally {
      kart.disabled = false;
    }
  }, 'kucuk cc-kart');
  kart.hidden = true;
  // Sihirli hâl: çizim, çocuğun boyasıyla renklenen kitap illüstrasyonuna dönüşür (tekrar dokununca geri döner)
  const gercekUrl = GERCEK_RESIM[`../../assets/canlan/${r.id}.webp`];
  let gercekte = false;
  let gercekVeri: string | null = null;
  const sihirDugme = yuvarlakDugme(IKON.sihir, 'Sihirli hâli', async () => {
    if (!gercekUrl) return;
    gercekte = !gercekte;
    sihirDugme.classList.toggle('acik', gercekte);
    if (!gercekte) {
      canli.gercek(null);
      efekt.dokunma();
      return;
    }
    gercekVeri ??= await veriAdresi(gercekUrl).catch(() => gercekUrl);
    const anaParca = Object.keys(SUS[r.id]?.boya ?? {})[0];
    const cocukRengi = boyalar.filter((b) => b.parca === anaParca).at(-1)?.renk;
    const oneri = SUS[r.id]?.boya[anaParca];
    canli.gercek(gercekVeri, { renkKaydir: cocukRengi && oneri ? tonFarki(cocukRengi, oneri) : 0, ayna: AYNALI.has(r.id) });
    efekt.kilitAcildi();
    const k = kutu.getBoundingClientRect();
    konfetiPatlat(app.kok, k.left + k.width / 2, k.top + k.height / 2, 40, 0.5);
  }, 'kucuk cc-sihir-dugme');
  sihirDugme.hidden = true;
  const dugmeler = h('div.cc-sonuc-dugmeler', {}, h('div.ust-grup', {}, nasil, sihirDugme, kart), tamamla, tekrar, ileri);

  // --- Boyama
  const boyalar: Boya[] = [];
  let boyaRengi = SUS[r.id]?.boya[Object.keys(SUS[r.id]?.boya ?? {})[0]] ?? '#FFC72C';
  let boyuyor = false;
  const parcaCiz = (parca: string) => {
    const liste = boyalar.filter((b) => b.parca === parca);
    canli.boyaKoy(parca, liste.length ? boyaResmi(liste).toDataURL() : null);
  };
  const palet = h('div.cc-palet.cc-boya-palet', { role: 'radiogroup', 'aria-label': 'Boyalar' });
  for (const renk of BOYALAR) {
    const b = h(`button.cc-boya${renk === boyaRengi ? '.secili' : ''}`, { type: 'button', style: `--r:${renk}`, 'aria-label': 'Boya rengi', 'data-renk': renk });
    b.addEventListener('click', () => {
      boyaRengi = renk;
      palet.querySelectorAll('.secili').forEach((x) => x.classList.remove('secili'));
      b.classList.add('secili');
      efekt.dokunma();
    });
    palet.append(b);
  }
  const geriAl = yuvarlakDugme(IKON.geriAl, 'Boyayı geri al', () => {
    const b = boyalar.pop();
    if (b) parcaCiz(b.parca);
  }, 'kucuk');
  const sihirli = yuvarlakDugme(IKON.sihir, 'Sihirli boya', () => {
    const yeni = sihirliBoya(r, cizgiler, sonuc.donusum);
    if (!yeni.length) return;
    boyalar.push(...yeni);
    new Set(yeni.map((b) => b.parca)).forEach(parcaCiz);
    efekt.kilitAcildi();
    sh.classList.remove('boyandi');
    void sh.offsetWidth;
    sh.classList.add('boyandi');
  }, 'kucuk cc-sihirli');
  const canlandir = h('button.dugme.cc-canlandir', { type: 'button', 'aria-label': 'Canlandır' }, svg(IKON.sihir), h('span', {}, 'Canlandır'));
  const boyaCubugu = h('div.cc-boya-cubugu', { hidden: true }, palet, h('div.cc-boya-arac', {}, geriAl, sihirli, canlandir));
  dugmeler.hidden = true;

  let canlandi = false;
  let sonDokunus = 0;
  sh.addEventListener('pointerdown', (e) => {
    // canlandıktan sonra: dokununca hafif tepki + resmin sesi
    if (canlandi) {
      const simdi = performance.now();
      if (simdi - sonDokunus < 350) return;
      sonDokunus = simdi;
      canli.dokun();
      void resimSesi(r.id);
      return;
    }
    if (!boyuyor) return;
    const q = canli.noktaAl(e.clientX, e.clientY);
    const b = boyaBolgesi(r, cizgiler, sonuc.donusum, q);
    if (!b) {
      efekt.dokunma();
      return;
    }
    boyalar.push({ ...b, renk: boyaRengi });
    parcaCiz(b.parca);
    efekt.yapis();
  });

  let kapandi = false;
  let bitirBoya: () => void = () => undefined;
  void (async () => {
    await bekle(sure(350));
    const kutular = [...yildizlar.children] as HTMLElement[];
    for (let i = 0; i < sonuc.yildiz && !kapandi; i++) {
      kutular[i].classList.add('dolu');
      efekt.yildiz(i);
      await bekle(sure(380));
    }
    if (kapandi) return;
    const canlanir = canlanirMi(sonuc.yildiz);
    if (!canlanir) {
      dugmeler.hidden = false;
      canli.hayalet(sonuc.eksik.length ? sonuc.eksik : 'hepsi');
      tekrar.classList.add('vurgu');
      await konus([sonuc.yildiz ? S.yildiz[String(sonuc.yildiz)] : '', S.tekrar]);
      return;
    }
    // Boyama: çocuk resmin içini boyar, sonra "Canlandır"
    boyuyor = true;
    boyaCubugu.hidden = false;
    sh.classList.add('boyaniyor');
    void konus([S.yildiz[String(sonuc.yildiz)], S.boya]);
    await new Promise<void>((coz) => {
      bitirBoya = coz;
      canlandir.addEventListener('click', () => coz(), { once: true });
    });
    if (kapandi) return;
    boyuyor = false;
    boyaCubugu.hidden = true;
    dugmeler.hidden = false;
    sh.classList.remove('boyaniyor');
    // boyanmamış yerler sihirle renklenir (çocuk bir renk seçtiyse ana parça o renk olur)
    const boyanan = new Set(boyalar.map((b) => b.parca));
    const oneri = SUS[r.id]?.boya ?? {};
    const anaParca = Object.keys(oneri)[0];
    const kendiRengi = !boyalar.length && ana?.renk && ana.renk !== r.renk ? ana.renk : null;
    const oto = sihirliBoya(r, cizgiler, sonuc.donusum)
      .filter((b) => !boyanan.has(b.parca))
      .map((b) => (kendiRengi && b.parca === anaParca ? { ...b, renk: kendiRengi } : b));
    if (oto.length) {
      boyalar.push(...oto);
      new Set(oto.map((b) => b.parca)).forEach(parcaCiz);
    }
    sh.classList.add('canli');
    canli.susGoster();
    canli.baslat();
    canlandi = true;
    kart.hidden = false;
    sihirDugme.hidden = !gercekUrl;
    resimSesiHazirla(r.id);
    efekt.kilitAcildi();
    const k = kutu.getBoundingClientRect();
    konfetiPatlat(app.kok, k.left + k.width / 2, k.top + k.height / 2, sonuc.yildiz === 3 ? 110 : 45, sonuc.yildiz === 3 ? 1 : 0.6);
    await konus(S.canlaniyor);
    if (kapandi) return;
    if (sonuc.eksik.length) {
      canli.hayalet(sonuc.eksik);
      tamamla.hidden = false;
      tamamla.classList.add('vurgu');
      await konus(S.eksik);
    } else ileri.classList.add('vurgu');
  })();

  const el = h(
    'div.cc-sonuc',
    { 'data-yildiz': sonuc.yildiz, 'data-puan': sonuc.puan.toFixed(2), 'data-eksik': sonuc.eksik.join(',') },
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.ev, 'Ana ekran', () => app.git('acilis')), yildizlar, yuvarlakDugme(IKON.izgara, 'Resimler', () => app.git('liste'))),
    kutu,
    boyaCubugu,
    dugmeler,
  );
  return {
    el,
    kapat() {
      kapandi = true;
      bitirBoya();
      canli.durdur();
    },
  };
}
