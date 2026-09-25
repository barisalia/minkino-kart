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
import { enIyi, kaydet, kayit, yildizKaydet } from './ilerleme';
import { AYAR, canlanirMi, noktaDizisi, ornekle, puanla } from './puan';
import { MODLAR, RESIMLER, resim, yasModu, type Mod, type Nokta, type Resim } from './resimler';
import { SUS } from './susler';

const S = canlan as unknown as {
  hosgeldin: string; sec: string; mod: Record<Mod, string>; mod_ad: Record<Mod, string>; simdi: string; sayac: string[];
  yildiz: Record<string, string>; canlaniyor: string; eksik: string; tekrar: string; bos: string; boya: string;
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

/** Sahne (deniz, gök, çayır…) ve süsleri. */
function sahne(r: Resim): HTMLElement {
  const s = h(`div.cc-sahne.sahne-${r.sahne}`);
  const sus = h('div.cc-sus', { 'aria-hidden': 'true' });
  const adet = { deniz: 7, gok: 3, cayir: 4, gece: 12, yol: 3, kar: 14 }[r.sahne];
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
      const b = h('button.cc-resim', { type: 'button', 'aria-label': r.ad, 'data-resim': r.id, style: `--i:${i};--r:${r.renk}` }, sablonSvg(r, { kalinlik: 0.03, tur: 'sus' }), h('span.cc-resim-ad', {}, r.ad), yildizlar);
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
  bitti.addEventListener('click', () => bitir());

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
  }

  if (mod === 'nokta') {
    const diziler = r.cizgiler.map((c) => noktaDizisi(c));
    let sira = 0;
    let yanan = new Set<number>();
    const katman = sv('g', { class: 'cc-noktalar' });
    ust.append(katman);
    const ciz = () => {
      katman.replaceChildren();
      diziler.forEach((d, s) => {
        if (s > sira) return;
        d.forEach(([x, y], i) => {
          if (s < sira) {
            katman.append(sv('circle', { cx: x, cy: y, r: 0.012, class: 'cc-nokta-eski' }));
            return;
          }
          const yandi = yanan.has(i);
          const ilkSonmemis = [...d.keys()].find((k) => !yanan.has(k));
          const g = sv('g', { class: `cc-nokta${yandi ? ' yandi' : ''}${i === ilkSonmemis ? ' siradaki' : ''}`, transform: `translate(${x} ${y})` });
          g.append(sv('circle', { r: 0.034 }));
          if (d.length > 1) {
            const t = sv('text', { y: 0.013 });
            t.textContent = String(i + 1);
            g.append(t);
          }
          katman.append(g);
        });
      });
    };
    ciz();
    geriBildirim = ([x, y]) => {
      const d = diziler[sira];
      if (!d) return;
      let degisti = false;
      d.forEach(([a, b], i) => {
        if (!yanan.has(i) && Math.hypot(a - x, b - y) < 0.05) {
          yanan.add(i);
          degisti = true;
          efekt.yildiz(Math.min(4, i));
        }
      });
      if (!degisti) return;
      if (yanan.size === d.length) {
        sira++;
        yanan = new Set();
        if (sira < diziler.length) efekt.eslesti();
      }
      ciz();
    };
    tamamMi = () => sira >= diziler.length;
  }

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

  function bitir() {
    if (kapandi) return;
    if (tuval.bosMu()) {
      bitiyor = false;
      void konus(S.bos);
      return;
    }
    efekt.secim();
    app.git('sonuc', { id: r.id, mod, cizgiler: tuval.cizgiler.filter((c) => !c.silgi) });
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
      h('div.ust-grup', {}, yuvarlakDugme(IKON.geri, 'Resimler', () => app.git('liste')), yuvarlakDugme(IKON.geriAl, 'Geri al', () => tuval.geriAl(), 'kucuk')),
      balon,
      h('div.ust-grup', {}, ...(gozDugme ? [gozDugme] : []), yuvarlakDugme(IKON.sil, 'Temizle', () => tuval.temizle(), 'kucuk')),
    ),
    h('div.cc-calisma', {}, ...(model ? [model] : []), alan),
    h('div.cc-alt', {}, palet, bitti),
  );
  if (TEST_MODU) (window as unknown as { __tuval: Tuval }).__tuval = tuval;
  return {
    el,
    kapat() {
      kapandi = true;
      tuval.kapat();
    },
  };
}

// ---------------------------------------------------------------- Sonuç: yıldız → boya → canlan
const BOYALAR = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#2FB5A5', '#6CC8FF', '#3E9DF2', '#9B5CE0', '#FF7EB6', '#A0522D', '#FFFFFF', '#3b3b3b'];

export function sonucEkrani(app: Uygulama, p: { id: string; mod: Mod; cizgiler: Cizgi[] }): Ekran {
  const r = resim(p.id) ?? RESIMLER[0];
  const sonuc = puanla(r, p.cizgiler.map((c) => c.noktalar), p.mod, yas());
  yildizKaydet(p.mod, r.id, sonuc.yildiz);
  // en uzun çizginin rengi
  const ana = [...p.cizgiler].sort((a, b) => b.noktalar.length - a.noktalar.length)[0];
  const canli = canliCizim(r, sonuc.parcalar, sonuc.donusum, { kalinlik: ana?.kalinlik ?? 0.025, renk: ana?.renk ?? r.renk });
  const sh = sahne(r);
  sh.append(canli.el);
  const kutu = h('div.cc-sonuc-kutu', {}, sh);
  const cizgiler = p.cizgiler.map((c) => ({ n: c.noktalar, kalinlik: c.kalinlik }));

  const yildizlar = h('div.cc-yildizlar', { 'aria-label': `${sonuc.yildiz} yıldız`, 'data-yildiz': sonuc.yildiz });
  for (let i = 0; i < 3; i++) yildizlar.append(h('i', { html: IKON.yildiz }));

  const sonraki = SIRALI[(SIRALI.findIndex((x) => x.id === r.id) + 1) % SIRALI.length];
  const tekrar = h('button.dugme.cc-tekrar', { type: 'button', 'aria-label': 'Tekrar çiz', style: '--r:#FF8A2B' }, svg(IKON.tekrar), h('span', {}, 'Tekrar'));
  tekrar.addEventListener('click', () => app.git('ciz', { id: r.id, mod: p.mod }));
  const ileri = h('button.dugme.cc-sonraki', { type: 'button', 'aria-label': 'Sonraki resim' }, h('span', {}, 'Sonraki'), svg(IKON.oyna));
  ileri.addEventListener('click', () => app.git('ciz', { id: sonraki.id, mod: p.mod }));
  const tamamla = h('button.dugme.cc-tamamla', { type: 'button', 'aria-label': 'Tamamla', style: '--r:#3E9DF2', hidden: true }, svg(IKON.kalem), h('span', {}, 'Tamamla'));
  tamamla.addEventListener('click', () => app.git('ciz', { id: r.id, mod: p.mod, devam: p.cizgiler }));
  const dugmeler = h('div.cc-sonuc-dugmeler', {}, tamamla, tekrar, ileri);

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

  sh.addEventListener('pointerdown', (e) => {
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
    sh.classList.add('canli');
    canli.susGoster();
    canli.baslat();
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
