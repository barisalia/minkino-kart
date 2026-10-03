/**
 * Okula Hazırım! ekranları:
 *  - harita ("Okul Yolu"): Mino'nun evinden okula kıvrımlı yol; Sayı Bahçesi açık, Ses Kulesi ve Kelime Köprüsü "yakında"
 *  - bolge (Sayı Bahçesi): 10 durak; önerilen durak parlar, Mino ile Kino oraya yürür; biten durak parlar (çıkartmalı)
 *  - etkinlik: ortak sahne (sahne.ts) + etkinliğin oyna(s)'ı
 *  - sonuc: ortak sonuç ekranı: çocuk çıkartmasını albüme kendi eliyle yapıştırır; bölge bitince rozet töreni
 *  - album: çıkartma albümü (bekleyen çıkartmalar da buradan yapıştırılır)
 */
import O from '../../content/okul.json';
import { efekt, konus } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import { Karakter } from '../../src/karakter/karakter';
import { Mino } from '../../src/mino/mino';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { BAHCE, etkinlikSimgesi, EV, KOPRU, KULE, OKUL, parkAdres, rozet } from './cizim';
import { erisimVarMi, kilitleriKur } from '../../src/abonelik/kilit';
import { AZ_HAREKET, Efekt, oynat } from './efekt';
import { bolge, bolgeEtkinlikleri, BOLGELER, etkinlik, oynananlar, yasUygun, type BolgeId } from './etkinlik';
import { etkinlikBitti, kaydetKayit, kayit, siradaki, yapistir, type BitisSonucu } from './kayit';
import { KINO_ORAN, Sahne } from './sahne';
import { kuleEkrani } from './ses/kule';
import type { Yas } from './sayi';
import { ses } from './sesler';
import { geriGonder, hedefliSurukle } from './surukle';

const A = O.arayuz;
const yas = (): Yas => (durum.i.yas ?? 4) as Yas;

/** Test / gösterim: &tohum=… ile rastgelelik sabitlenir */
function rastgele(): () => number {
  const t = Number(new URLSearchParams(location.search).get('tohum'));
  if (!TEST_MODU || !Number.isFinite(t) || !t) return Math.random;
  let a = t >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const parkKatmanlari = (orta: string | null = 'arka-orta') =>
  h(
    'div.ok-park',
    { 'aria-hidden': 'true' },
    h('div.ok-gok', { style: `background-image:url("${parkAdres('arka-uzak')}")` }),
    orta ? h('div.ok-orta', { style: `background-image:url("${parkAdres(orta)}")` }) : null,
    h('div.ok-on', { style: `background-image:url("${parkAdres('arka-on')}")` }),
  );

function logo(): HTMLElement {
  const harfler = [...A.baslik_alt].map((c, i) => h('span', { style: `--i:${i}` }, c));
  return h('div.ok-logo', { role: 'img', 'aria-label': `${A.baslik_ust} ${A.baslik_alt}` }, h('span.ok-logo-ust', {}, A.baslik_ust), h('span.ok-logo-alt', {}, ...harfler));
}

/** Mino ile Kino yan yana (boylar boy.ts'den: Kino'nun kutusu Mino'nun KINO_ORAN katı) */
function ikili(): { el: HTMLElement; mino: Mino; kino: Karakter; kapat: () => void } {
  const mino = new Mino();
  const kino = new Karakter('kino', h('div'));
  mino.el.addEventListener('pointerdown', () => !AZ_HAREKET && mino.tepki('gidik'));
  const kinoKap = h('div.ok-ikili-kino', { style: `--ko:${KINO_ORAN.toFixed(3)}` }, h('i.ok-golge'), kino.el);
  kinoKap.addEventListener('pointerdown', () => {
    efekt.dokunma();
    if (!AZ_HAREKET) void kino.oynat('sevin', 800);
  });
  const el = h('div.ok-ikili', {}, h('div.ok-ikili-mino', {}, mino.el), kinoKap);
  return {
    el,
    mino,
    kino,
    kapat() {
      mino.kapat();
      kino.kapat();
    },
  };
}

/** Çıkartma (beyaz kesim kenarlı) */
export function cikartmaEl(id: string): HTMLElement {
  return h('div.ok-cikartma', { 'data-cikartma': id, html: etkinlikSimgesi(id) });
}

/** Kıvrımlı yol çizgisi (0..100 kutu, esner); d verilmezse Okul Yolu'nun kıvrımı */
function yolCizgisi(d = 'M8 92 C40 90 62 80 50 66 S22 46 50 36 S80 16 86 6'): SVGSVGElement {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  c.setAttribute('viewBox', '0 0 100 100');
  c.setAttribute('preserveAspectRatio', 'none');
  c.setAttribute('class', 'ok-yol-cizgi');
  c.setAttribute('aria-hidden', 'true');
  c.innerHTML = `<path class="ok-yol-dis" d="${d}"/><path class="ok-yol-ic" d="${d}"/>`;
  return c;
}

function yasDugmesi(app: Uygulama, sonra: string): HTMLElement {
  const b = h('button.ok-yas-dugme', { type: 'button', 'aria-label': 'Yaşı değiştir' }, A.yas.replace('{yas}', String(yas())));
  b.addEventListener('click', () => {
    efekt.dokunma();
    app.git('yas', { sonra });
  });
  return b;
}

function albumDugmesi(app: Uygulama, donus: string, bolgeId?: BolgeId): HTMLElement {
  const b = yuvarlakDugme(IKON.album, A.album, () => app.git('album', { donus, bolge: bolgeId }), 'kucuk ok-album-dugme');
  if (kayit.bekleyen.length) b.append(h('span.rozet', {}, String(kayit.bekleyen.length)));
  return b;
}

// ---------------------------------------------------------------- Harita: Okul Yolu
export function haritaEkrani(app: Uygulama): Ekran {
  const cikis = app.secenekler.cikis;
  const geri = cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : h('div', { style: 'width:56px' });
  const resim: Record<BolgeId, () => string> = { sayi: BAHCE, ses: KULE, kelime: KOPRU };
  const ikiz = ikili();
  const bolgeler = BOLGELER.map((b, i) => {
    const kart = h(
      `button.ok-bolge-kart${b.acik ? '' : '.ok-kilitli'}`,
      { type: 'button', 'data-bolge': b.id, style: `--r:${b.renk};--i:${i}`, 'aria-label': b.acik ? b.ad : `${b.ad} (${A.yakinda})` },
      h('span.ok-bolge-resim', { html: resim[b.id]() }),
      h('span.ok-bolge-ad', {}, b.ad),
      b.acik ? null : h('span.ok-yakinda', {}, svg(IKON.kilit), A.yakinda),
      kayit.rozet.includes(b.id) ? h('span.ok-bolge-rozet', { html: rozet(b.id) }) : null,
    );
    kart.addEventListener('click', () => {
      if (!b.acik) {
        efekt.kilitli();
        oynat(kart, 'ok-hmm');
        if (!AZ_HAREKET) ikiz.mino.tepki('kararsiz', 1.2);
        void konus(O.mino.yakinda);
        return;
      }
      efekt.secim();
      if (durum.i.yas) app.git('bolge', { bolge: b.id });
      else app.git('yas', { sonra: 'bolge', sonraParam: { bolge: b.id } });
    });
    return kart;
  });
  // kıvrımlı yol (evden okula); ilk açık bölgenin yanında Mino ile Kino
  const yol = h('div.ok-yol', {}, yolCizgisi(), h('div.ok-yol-ev', { html: EV() }), ...bolgeler, h('div.ok-yol-okul', { html: OKUL() }), h('div.ok-yol-ikili', {}, ikiz.el));

  const el = h(
    'div.ok-harita',
    {},
    parkKatmanlari(null),
    h('div.ust-cubuk', {}, geri, h('div.orta', {}, logo()), h('div.ust-grup', {}, albumDugmesi(app, 'acilis'), sesDugmesi())),
    yol,
    h('div.ok-harita-alt', {}, durum.i.yas ? yasDugmesi(app, 'acilis') : null),
  );
  const zaman = window.setTimeout(() => {
    if (!AZ_HAREKET) ikiz.mino.tepki('selam');
    void konus([kayit.biten.length ? '' : O.mino.hosgeldin, O.mino.harita]);
  }, TEST_MODU ? 10 : 500);
  return {
    el,
    kapat() {
      clearTimeout(zaman);
      ikiz.kapat();
    },
  };
}

// ---------------------------------------------------------------- Bölge: Sayı Bahçesi
/** Durakların yerleri (%): yılan gibi kıvrılan yol, aşağıdan yukarı; c sütun */
export function durakYerleri(n: number, c: number): [number, number][] {
  const r = Math.ceil(n / c);
  return Array.from({ length: n }, (_, i) => {
    const satir = Math.floor(i / c);
    const s = i % c;
    const sutun = satir % 2 === 0 ? s : c - 1 - s;
    const x = 10 + ((sutun + 0.5) / c) * 80;
    const y = 90 - ((satir + 0.5) / r) * 80 + (s % 2 ? -3 : 3);
    return [x, y] as [number, number];
  });
}

type Kutu = [number, number, number, number];
const kesisim = (a: Kutu, b: Kutu) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));

/**
 * Mino ile Kino'nun j. durağın yanındaki yeri (bahçe kutusunda, sol-üst köşe px): üstte, sağda, solda ya da çaprazda;
 * hiçbir durağa, durak yazısına binmeyen ve ekrandan taşmayan aday seçilir (eşitlikte ilk sıradaki: durağın üstü).
 * Düzen henüz yoksa null.
 */
export function ikiliYeri(bahce: HTMLElement, duraklar: HTMLElement[], j: number, ikili: HTMLElement): [number, number] | null {
  const W = bahce.clientWidth;
  const H = bahce.clientHeight;
  const w = ikili.offsetWidth;
  const hh = ikili.offsetHeight;
  if (!W || !H || !w || !hh || !duraklar[j]) return null;
  // engeller: durak daireleri (biraz küçültülmüş kutu) ve yazıları (offset*: dönüşümsüz yerleşim)
  const engeller: Kutu[] = [];
  const merkez = duraklar.map((d) => {
    const r = d.offsetWidth / 2;
    const [x, y] = [d.offsetLeft, d.offsetTop];
    engeller.push([x - r * 0.85, y - r * 0.85, x + r * 0.85, y + r * 0.85]);
    const ad = d.querySelector<HTMLElement>('.ok-durak-ad');
    if (ad) engeller.push([x - ad.offsetWidth / 2, y - r + ad.offsetTop, x + ad.offsetWidth / 2, y - r + ad.offsetTop + ad.offsetHeight]);
    return { x, y, r };
  });
  const { x, y, r } = merkez[j];
  const adaylar: [number, number][] = [
    [x - w / 2, y - r - 4 - hh],
    [x + r * 0.7, y + r * 0.85 - hh],
    [x - r * 0.7 - w, y + r * 0.85 - hh],
    [x + r * 0.35, y - r * 0.3 - hh],
    [x - r * 0.35 - w, y - r * 0.3 - hh],
  ];
  let en: [number, number] = adaylar[0];
  let enPuan = Infinity;
  for (const [l, t] of adaylar) {
    const k: Kutu = [l, t, l + w, t + hh];
    let puan = engeller.reduce((s, e) => s + kesisim(k, e), 0);
    // ekran dışı (alt kenar biraz esnek: ayaklar çimene basabilir)
    const ic = kesisim(k, [0, 0, W, H + hh * 0.1]);
    puan += (w * hh - ic) * 3;
    if (puan < enPuan - 1) {
      enPuan = puan;
      en = [l, t];
    }
  }
  return [Math.round(en[0]), Math.round(en[1])];
}

export function bolgeEkrani(app: Uygulama, p: { bolge?: BolgeId } = {}): Ekran {
  const b = bolge(p.bolge ?? 'sayi') ?? BOLGELER[0];
  // Ses Kulesi'nin kendi ekranı (okul/src/ses/kule.ts): harf odaları kulenin katlarında
  if (b.id === 'ses') return kuleEkrani(app, { ikili, parkKatmanlari, albumDugmesi: () => albumDugmesi(app, 'bolge', 'ses') });
  const y = yas();
  const etkinlikler = bolgeEtkinlikleri(b.id);
  const oynanan = oynananlar(b.id, y);
  const oneri = siradaki(kayit, oynanan);
  const yatay = typeof matchMedia !== 'undefined' && matchMedia('(orientation: landscape)').matches;
  const yerler = durakYerleri(etkinlikler.length, yatay ? 5 : 3);
  const ikiz = ikili();
  const duraklar = etkinlikler.map((e, i) => {
    const uygun = yasUygun(e, y);
    const bitti = kayit.biten.includes(e.id);
    const d = h(
      'button.ok-durak',
      {
        type: 'button',
        'data-etkinlik': e.id,
        'data-durum': !uygun ? 'buyuk' : bitti ? 'bitti' : e.id === oneri ? 'oneri' : 'acik',
        style: `left:${yerler[i][0]}%;top:${yerler[i][1]}%;--i:${i}`,
        'aria-label': e.ad,
      },
      h('span.ok-durak-simge', { html: etkinlikSimgesi(e.id) }),
      h('b.ok-durak-no', {}, String(i + 1)),
      bitti ? h('i.ok-durak-tamam', { html: IKON.onay }) : null,
      uygun ? null : h('span.ok-durak-yas', {}, A.buyuk),
      h('span.ok-durak-ad', {}, e.ad),
    );
    d.addEventListener('click', () => {
      if (!uygun) {
        efekt.kilitli();
        oynat(d, 'ok-hmm');
        void konus(O.mino.buyukler);
        return;
      }
      if (!erisimVarMi(`okul/${e.id}`, app.kok)) return;
      efekt.secim();
      app.git('etkinlik', { id: e.id });
    });
    return d;
  });
  const yolD = yerler.map(([x, yy], i) => `${i ? 'L' : 'M'}${x} ${yy}`).join(' ');
  const cizgi = yolCizgisi(yolD);
  // Mino ile Kino önerilen durağın yanında (önceki duraktan yürüyerek gelir)
  const oi = Math.max(0, etkinlikler.findIndex((e) => e.id === oneri));
  const once = Math.max(0, oi - 1);
  const ikiliYer = h('div.ok-durak-ikili', { style: `left:${yerler[once][0]}%;top:${yerler[once][1]}%` }, ikiz.el);
  const bahce = h('div.ok-bahce', {}, cizgi, ...duraklar, ikiliYer);
  const rozetEl = kayit.rozet.includes(b.id) ? h('div.ok-bahce-rozet', { html: rozet(b.id), 'aria-label': b.rozet }) : null;
  const el = h(
    'div.ok-bolge',
    { 'data-bolge': b.id, style: `--r:${b.renk}` },
    parkKatmanlari('arka-orta-2'),
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Harita', () => app.git('acilis'), 'kucuk'), h('div.orta', {}, h('h1.ok-baslik', {}, b.ad)), h('div.ust-grup', {}, albumDugmesi(app, 'bolge'), sesDugmesi())),
    h('div.ok-bahce-kap', {}, bahce, rozetEl),
  );
  const zamanlar: number[] = [];
  zamanlar.push(
    window.setTimeout(() => {
      // yürüyüş: ikili durağın yanında, başka durağa ve yazısına binmeyen yerde (düzen hazır olunca ölçülür)
      const bas = ikiliYeri(bahce, duraklar, once, ikiliYer);
      const son = ikiliYeri(bahce, duraklar, oi, ikiliYer);
      if (bas && son) {
        ikiliYer.classList.add('ok-olculu');
        ikiliYer.style.transition = 'none';
        ikiliYer.style.left = `${bas[0]}px`;
        ikiliYer.style.top = `${bas[1]}px`;
        void ikiliYer.offsetWidth;
        ikiliYer.style.transition = '';
        ikiliYer.style.left = `${son[0]}px`;
        ikiliYer.style.top = `${son[1]}px`;
      } else {
        ikiliYer.style.left = `${yerler[oi][0]}%`;
        ikiliYer.style.top = `${yerler[oi][1]}%`;
      }
      if (!AZ_HAREKET && oi !== once) void ikiz.kino.oynat('yuru', 900);
    }, TEST_MODU ? 10 : 450),
  );
  zamanlar.push(window.setTimeout(() => void konus(O.mino.bahce), TEST_MODU ? 10 : 400));
  // uygulamada abonelikli duraklarda küçük kilit rozeti (dokununca kilit anı; web sitesinde kilit yok)
  const kilitBirak = kilitleriKur(duraklar.map((d, i): [HTMLElement, string] => [d, `okul/${etkinlikler[i].id}`]));
  return {
    el,
    kapat() {
      zamanlar.forEach(clearTimeout);
      kilitBirak();
      ikiz.kapat();
    },
  };
}

// ---------------------------------------------------------------- Etkinlik
const ORTA: Record<string, 'arka-orta' | 'arka-orta-2' | null> = {
  'kac-elma': null,
  'sayi-karti': 'arka-orta-2',
  'sepete-koy': 'arka-orta',
  'hangisinde-cok': 'arka-orta',
  'bir-fazla': 'arka-orta-2',
  merdiven: null,
  'kac-alkis': 'arka-orta',
  'rakam-ciz': null,
  kuslar: 'arka-orta-2',
  piknik: 'arka-orta',
};

export function etkinlikEkrani(app: Uygulama, p: { id: string }): Ekran {
  const e = etkinlik(p?.id);
  const s = new Sahne({ id: p?.id ?? '', yas: yas(), rnd: rastgele(), orta: ORTA[p?.id] ?? 'arka-orta', geri: () => app.git('bolge', { bolge: e?.bolge }), ilkKez: !kayit.biten.includes(p?.id) });
  if (!e) {
    window.setTimeout(() => app.git('bolge'), 0);
    return { el: s.el, kapat: () => s.kapat() };
  }
  void (async () => {
    try {
      await e.oyna(s);
    } catch (hata) {
      console.warn('Etkinlik durdu', e.id, hata);
    }
    if (s.kapandi()) return;
    const sonuc = etkinlikBitti(kayit, e.id, e.bolge, oynananlar(e.bolge, s.yas));
    kaydetKayit();
    app.git('sonuc', { id: e.id, ...sonuc });
  })();
  return { el: s.el, kapat: () => s.kapat() };
}

// ---------------------------------------------------------------- Ortak sonuç ekranı
/** Albüm sayfası: bölgenin etkinlik yuvaları (yapışanlar dolu) */
function albumSayfasi(b: BolgeId, vurgu?: string): { el: HTMLElement; yuva: (id: string) => HTMLElement | undefined } {
  const yuvalar = new Map<string, HTMLElement>();
  const el = h(
    'div.ok-sayfa',
    { 'data-bolge': b },
    ...bolgeEtkinlikleri(b).map((e) => {
      const yapisti = kayit.cikartma.includes(e.id);
      const y = h(`div.ok-yuva${yapisti ? '.dolu' : ''}${e.id === vurgu ? '.ok-hedef' : ''}`, { 'data-yuva': e.id }, yapisti ? cikartmaEl(e.id) : h('span.ok-yuva-golge', { html: etkinlikSimgesi(e.id) }), h('span.ok-yuva-ad', {}, e.ad));
      yuvalar.set(e.id, y);
      return y;
    }),
  );
  return { el, yuva: (id) => yuvalar.get(id) };
}

/** Çıkartmayı sürükleyip yapıştırma: çözülünce yapıştı */
function yapistirmaBekle(cikartma: HTMLElement, yuva: HTMLElement, kapanislar: (() => void)[]): Promise<void> {
  return new Promise((coz) => {
    const kapat = hedefliSurukle({
      el: cikartma,
      hedefler: () => [yuva],
      aktif: () => !cikartma.dataset.yapisti,
      birak: (yer) => {
        if (!yer) {
          geriGonder(cikartma);
          oynat(yuva, 'ok-parla');
          return;
        }
        cikartma.dataset.yapisti = '1';
        cikartma.style.transition = 'none';
        cikartma.style.transform = '';
        yuva.replaceChildren(cikartma, ...[...yuva.querySelectorAll('.ok-yuva-ad')]);
        yuva.classList.add('dolu');
        yuva.classList.remove('ok-hedef');
        efekt.yapis();
        ses.tik();
        oynat(yuva, 'ok-yapis');
        coz();
      },
    });
    kapanislar.push(kapat);
  });
}

export function sonucEkrani(app: Uygulama, p: { id: string } & Partial<BitisSonucu>): Ekran {
  const e = etkinlik(p?.id) ?? bolgeEtkinlikleri('sayi')[0];
  const b = bolge(e.bolge) ?? BOLGELER[0];
  const ikiz = ikili();
  const sayfa = albumSayfasi(b.id, kayit.bekleyen.includes(e.id) ? e.id : undefined);
  const cikartmaYer = h('div.ok-sonuc-cikartma');
  const harita = h('button.dugme.ok-harita-dugme', { type: 'button', hidden: true, style: '--r:var(--mavi)' }, svg(IKON.ev), A.harita);
  const sonraki = siradaki(kayit, oynananlar(b.id, yas()));
  const siradakiVar = !!sonraki && !kayit.biten.includes(sonraki);
  const sira = h('button.dugme.ok-siradaki', { type: 'button', hidden: true }, svg(IKON.oyna), A.siradaki);
  harita.addEventListener('click', () => (efekt.secim(), app.git('bolge', { bolge: b.id })));
  sira.addEventListener('click', () => {
    if (sonraki && !erisimVarMi(`okul/${sonraki}`, app.kok)) return;
    efekt.secim();
    app.git('etkinlik', { id: sonraki });
  });
  const rozetKatman = h('div.ok-rozet-katman', { 'aria-hidden': 'true' });
  const el = h(
    'div.ok-sonuc',
    { 'data-etkinlik': e.id },
    parkKatmanlari('arka-orta'),
    h('div.ust-cubuk', {}, h('div', { style: 'width:56px' }), h('div.orta', {}, h('h1.ok-baslik', {}, e.ad)), sesDugmesi()),
    h('div.ok-sonuc-govde', {}, h('div.ok-album-kitap', {}, h('div.ok-album-ust', {}, b.ad), sayfa.el), cikartmaYer, h('div.ok-sonuc-ikili', {}, ikiz.el)),
    h('div.ok-sonuc-alt', {}, harita, sira),
    rozetKatman,
  );
  const efektK = new Efekt(el);
  el.append(efektK.el);
  const kapanislar: (() => void)[] = [];
  let kapandi = false;
  const bitir = () => {
    harita.hidden = false;
    sira.hidden = !siradakiVar;
    el.dataset.durum = 'bitti';
  };

  void (async () => {
    await new Promise((r) => setTimeout(r, TEST_MODU ? 20 : 350));
    if (kapandi) return;
    konfetiPatlat(el, el.clientWidth / 2, el.clientHeight * 0.3, AZ_HAREKET ? 0 : 70);
    efekt.konfeti();
    if (!AZ_HAREKET) {
      ikiz.mino.tepki('dans', 1.6);
      void ikiz.kino.oynat('dans', 1600);
    }
    const yuva = sayfa.yuva(e.id);
    if (kayit.bekleyen.includes(e.id) && yuva) {
      // çocuk çıkartmasını kendi eliyle yapıştırır
      const c = cikartmaEl(e.id);
      c.classList.add('ok-yeni-cikartma');
      cikartmaYer.append(c);
      el.dataset.durum = 'yapistir';
      await konus(O.mino.yapistir);
      await yapistirmaBekle(c, yuva, kapanislar);
      if (kapandi) return;
      yapistir(kayit, e.id);
      kaydetKayit();
      const [x, y] = efektK.merkez(yuva);
      efektK.parilti(x, y, 10);
      await konus(O.mino.yapisti);
    } else {
      // tekrar oynandı: yeni çıkartma yok, Kino'dan başka bir şaka
      const t = O.kino.tekrar;
      if (!AZ_HAREKET) void ikiz.kino.oynat('sevin', 900);
      await konus(t[((p.kez ?? 2) - 2 + t.length) % t.length], { karakter: 'kino', ton: 0.92 });
    }
    if (kapandi) return;
    if (p.rozet) {
      // rozet töreni: rozet büyür, Mino'nun göğsüne takılır
      el.dataset.durum = 'rozet';
      const r = h('div.ok-buyuk-rozet', { html: rozet(b.id) }, h('span.ok-rozet-ad', {}, b.rozet));
      rozetKatman.append(r);
      rozetKatman.classList.add('acik');
      ses.sihir();
      konfetiPatlat(el, el.clientWidth / 2, el.clientHeight * 0.4, AZ_HAREKET ? 0 : 120);
      await konus(b.rozetSozu ?? O.mino.rozet);
      if (kapandi) return;
      const gogus = h('div.ok-gogus-rozet', { html: rozet(b.id) });
      ikiz.el.querySelector('.ok-ikili-mino')?.append(gogus);
      rozetKatman.classList.remove('acik');
      oynat(gogus, 'ok-yapis');
      if (!AZ_HAREKET) ikiz.mino.tepki('sevinc', 1.2);
    }
    bitir();
  })();
  return {
    el,
    kapat() {
      kapandi = true;
      kapanislar.forEach((f) => f());
      ikiz.kapat();
    },
  };
}

// ---------------------------------------------------------------- Albüm
export function albumEkrani(app: Uygulama, p: { donus?: string; bolge?: BolgeId } = {}): Ekran {
  const kapanislar: (() => void)[] = [];
  const bekleyenVar = (b: BolgeId) => kayit.bekleyen.some((id) => etkinlik(id)?.bolge === b);
  // açılış sekmesi: istenen bölge, yoksa yapıştırılmayı bekleyen çıkartması olan, yoksa Sayı Bahçesi
  const ilk = (p?.bolge && bolge(p.bolge)?.acik ? p.bolge : BOLGELER.find((b) => b.acik && bekleyenVar(b.id))?.id) ?? 'sayi';
  const kitap = h('div.ok-album-kitap');
  const tepsi = h('div.ok-tepsi');
  const sekmeler = BOLGELER.map((b) => {
    const s = h(`button.ok-sekme${b.acik ? '' : '.ok-kilitli'}`, { type: 'button', style: `--r:${b.renk}`, disabled: !b.acik, 'data-bolge': b.id }, b.ad, b.acik ? null : svg(IKON.kilit));
    s.addEventListener('click', () => {
      if (!b.acik || s.classList.contains('secili')) return;
      efekt.secim();
      goster(b.id);
    });
    return s;
  });
  function goster(id: BolgeId) {
    kapanislar.splice(0).forEach((f) => f());
    sekmeler.forEach((s) => s.classList.toggle('secili', s.dataset.bolge === id));
    const b = bolge(id) ?? BOLGELER[0];
    const sayfa = albumSayfasi(id);
    tepsi.replaceChildren();
    for (const cid of [...kayit.bekleyen]) {
      const yuva = sayfa.yuva(cid);
      if (!yuva) continue;
      const c = cikartmaEl(cid);
      tepsi.append(c);
      yuva.classList.add('ok-hedef');
      void yapistirmaBekle(c, yuva, kapanislar).then(() => {
        yapistir(kayit, cid);
        kaydetKayit();
        void konus(O.mino.yapisti);
        if (!tepsi.children.length) tepsi.hidden = true;
      });
    }
    tepsi.hidden = !tepsi.children.length;
    const rozetEl = kayit.rozet.includes(id) ? h('div.ok-album-rozetler', {}, h('div.ok-album-rozet', { html: rozet(id), title: b.rozet })) : null;
    kitap.replaceChildren(h('div.ok-album-ust', {}, b.ad, rozetEl), sayfa.el);
    if (!tepsi.hidden) void konus(O.mino.yapistir);
  }
  const geri = () => (p?.donus === 'bolge' ? app.git('bolge', { bolge: p.bolge }) : app.git('acilis'));
  const el = h(
    'div.ok-album',
    {},
    parkKatmanlari(null),
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', geri, 'kucuk'), h('div.orta', {}, h('h1.ok-baslik', {}, A.album)), sesDugmesi()),
    h('div.ok-album-govde', {}, h('div.ok-sekmeler', {}, ...sekmeler), kitap, tepsi),
  );
  goster(ilk);
  return { el, kapat: () => kapanislar.forEach((f) => f()) };
}
