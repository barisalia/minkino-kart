/**
 * Minkino ana menüsü: Mino ve Kino karşılar (Mino yandan yürüyerek, Kino hoplayarak gelir; arada birbirine bakıp el
 * sallarlar, dokununca tepki verirler), altında oyun kartları (sırayla gelir, yan oyun rozetleri, parmakla hafif
 * parallax); büyükler için ebeveyn kapısı (basılı tut).
 */
import { efekt } from '../../src/audio/ses';
import '../../src/karakter/karakter.css';
import { Karakter, type HareketAdi, type Poz as KPoz } from '../../src/karakter/karakter';
import { type Tepki } from '../../src/mino/mino';
import { minoProfilYukle, YuruyenMino } from '../../src/mino/mino-profil';
import { h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { derinlik, OYUNLAR, type OyunKarti } from './oyunlar';

// Yalnız kartların kullandığı klasörler (bütün assets/ pakete adres olarak girmesin)
const CIZIMLER = import.meta.glob<string>(
  ['../../assets/{hayvanlar,tasitlar,meyveler,pazar,sahne,canlan,sanatci,parti,parti-sahne,orman-esya}/*.webp'],
  { eager: true, query: '?url', import: 'default' },
);
const adres = (yol: string) => CIZIMLER[`../../assets/${yol}.webp`] ?? '';

const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOGO_RENK = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'];
/** Ebeveyn kapısının açılması için basılı tutma süresi */
export const KAPI_SURE = 1500;

function logo(): HTMLElement {
  const yazi = h('div.logo-yazi', { role: 'img', 'aria-label': 'Minkino' });
  [...'minkino'].forEach((c, i) => yazi.append(h('span', { style: `color:${LOGO_RENK[i]};--i:${i};--yon:${i % 2 ? 1 : -1}`, 'aria-hidden': 'true' }, c)));
  return h('div.ug-logo', {}, yazi);
}

/** Kartın resmi: oyunun kendi çizimlerinden küçük bir sahne; katmanlar parallax için derinlik (--d) alır */
function kartResmi(k: OyunKarti): HTMLElement {
  const zemin = k.zemin ? adres(k.zemin) : '';
  const kap = h('span.ug-kart-resim', { style: zemin ? `--zemin:url("${zemin}")` : undefined });
  const n = k.katmanlar.length;
  k.katmanlar.forEach((c, i) => {
    const sinif = c.sinif.split(' ').join('.');
    const d = `--d:${derinlik(i, n).toFixed(2)}`;
    if (c.ikon) {
      const ikon = svg(IKON[c.ikon], `ug-k ug-rozet ${c.sinif}`);
      ikon.style.setProperty('--d', derinlik(i, n).toFixed(2));
      kap.append(ikon);
      return;
    }
    const url = c.gorsel ? adres(c.gorsel) : '';
    if (!url) return;
    const img = h('img', { src: url, alt: '', draggable: 'false', decoding: 'async' });
    kap.append(c.cerceve ? h(`span.ug-k.${sinif}.ug-cerceve`, { style: d }, img) : h(`span.ug-k.${sinif}`, { style: d }, img));
  });
  return kap;
}

/**
 * Basılı tutunca `ac` çalışır; erken bırakılırsa `kisa`. Tutarken `dolduruyor` sınıfı eklenir
 * (CSS'te `--kapi-sure` boyunca dolan daire; yalnız transform).
 */
export function basiliTut(el: HTMLElement, ms: number, ac: () => void, kisa?: () => void): () => void {
  let zaman = 0;
  el.style.setProperty('--kapi-sure', `${ms}ms`);
  const birak = (erken: boolean) => {
    if (!zaman) return;
    clearTimeout(zaman);
    zaman = 0;
    el.classList.remove('dolduruyor');
    if (erken && kisa) kisa();
  };
  el.addEventListener('pointerdown', (e) => {
    if (e.button > 0 || zaman) return;
    el.classList.add('dolduruyor');
    zaman = window.setTimeout(() => {
      zaman = 0;
      el.classList.remove('dolduruyor');
      ac();
    }, ms);
  });
  el.addEventListener('pointerup', () => birak(true));
  el.addEventListener('pointercancel', () => birak(false));
  el.addEventListener('pointerleave', () => birak(false));
  // Klavye: Enter/Boşluk basılı tutma yerine doğrudan açar (büyükler için)
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      ac();
    }
  });
  return () => birak(false);
}

// ---------------------------------------------------------------- Menü
export function menuEkrani(app: Uygulama): Ekran {
  const yuruyen = new YuruyenMino();
  const mino = yuruyen.mino;
  const tepki = (t: Tepki) => {
    if (!AZ_HAREKET) mino.tepki(t);
  };
  const zamanlar: number[] = [];
  const sonra = (ms: number, fn: () => void) => zamanlar.push(window.setTimeout(fn, sure(ms)));

  // Kino: ortak karakter iskeleti (assets/karakter-iskelet/kino.*; tasarım değişse de katman adları aynı kalır)
  const kino = new Karakter('kino', h('div'));
  /** Kino'nun el sallamasının başladığı an (sn) */
  let kinoSalla = -9;
  kino.ekHareket = (p: KPoz) => {
    const g = performance.now() / 1000 - kinoSalla;
    if (g < 1.3) {
      // Mino'ya selam: baş o yana (izleyicinin soluna) eğilir, kulaklar uçuşur, kuyruk sallanır, iki küçük hop.
      // (Eskiden kol 60° kalkıyordu: çizimde kol omuzdan ayrık, beyaz kütük gibi görünüyordu; bkz. kisilik.ts kino)
      const z = Math.max(0, Math.min(1, g / 0.2, (1.3 - g) / 0.25));
      p.kafa -= 5 * z;
      p.don -= 3 * z;
      p.y -= 3 * Math.abs(Math.sin(g * 9)) * z;
      p.kulakSol += 12 * Math.sin(g * 16) * z;
      p.kulakSag += 12 * Math.sin(g * 16 + 1) * z;
      p.kuyruk += 30 * Math.sin(g * 30) * z;
    }
  };
  const kinoIfade = (ad: string, ms: number) => {
    if (kino.ifadeVar(ad)) kino.ifade(ad, ms);
  };
  const kinoOynat = (ad: HareketAdi, ms: number) => {
    if (!AZ_HAREKET) void kino.oynat(ad, ms);
  };

  // birbirine bakıp el sallarlar
  const selamlas = () => {
    if (AZ_HAREKET) return;
    mino.bak(1);
    kinoOynat('bak', 900);
    sonra(500, () => {
      tepki('selam');
      kinoSalla = performance.now() / 1000;
      kinoIfade('heyecan', 1300);
    });
    sonra(1900, () => mino.bak(0));
  };
  // ara sıra: selamlaşma ya da biri bir şey yapar, öbürü bakar
  const BOS: (() => void)[] = [
    selamlas,
    () => {
      kinoOynat('huy', 1400);
      mino.bak(1);
      sonra(1500, () => mino.bak(0));
    },
    () => {
      tepki('mir');
      kinoOynat('bak', 1000);
    },
  ];
  let bosSira = 0;
  const bosPlanla = () => {
    sonra(5200 + Math.random() * 2600, () => {
      BOS[bosSira++ % BOS.length]();
      bosPlanla();
    });
  };

  // açılış: Mino soldan yandan yürüyerek, Kino sağdan hoplayarak gelir; sonra selamlaşırlar
  const minoKap = h('div.ug-mino-kap', {}, h('div.ug-mino', {}, yuruyen.el));
  const kinoKap = h('div.ug-kino-kap', { 'data-karakter-kap': 'kino' }, h('div.ug-kino', {}, kino.el));
  if (!AZ_HAREKET && !TEST_MODU) {
    minoKap.classList.add('geliyor');
    kinoKap.classList.add('geliyor');
    // yandan çizim yavaş gelirse Mino ekranın dışında beklemesin: kısa süre sonra önden çizimle kayarak gelir
    let geldi = false;
    const gel = (yuruyerek: boolean) => {
      if (geldi) return;
      geldi = true;
      if (yuruyerek) {
        yuruyen.yon = 1;
        yuruyen.yuru(1.9);
        sonra(1250, () => yuruyen.dur());
      }
      minoKap.classList.replace('geliyor', 'geldi');
    };
    void minoProfilYukle().then((m) => gel(!!m));
    sonra(1500, () => gel(false));
    sonra(350, () => {
      kinoOynat('yuru', 1100);
      kinoKap.classList.replace('geliyor', 'geldi');
    });
    sonra(1500, () => kinoOynat('var', 400));
    sonra(1900, selamlas);
  } else sonra(700, () => tepki('evet'));
  bosPlanla();

  const minoTepkileri: Tepki[] = ['gidik', 'mir', 'zipla', 'dans'];
  let sira = 0;
  mino.el.addEventListener('pointerdown', () => {
    efekt.dokunma();
    tepki(minoTepkileri[sira++ % minoTepkileri.length]);
    // Kino dönüp bakar
    kinoOynat('bak', 900);
  });
  const kinoTepkileri: [HareketAdi, string, number][] = [
    ['sevin', 'heyecan', 1300],
    ['huy', 'keyif', 1400],
    ['bak', 'saskin', 1000],
    ['dans', 'heyecan', 1500],
  ];
  let kinoSira = 0;
  kinoKap.addEventListener('pointerdown', () => {
    efekt.dokunma();
    const [hareket, ifade, ms] = kinoTepkileri[kinoSira++ % kinoTepkileri.length];
    kinoOynat(hareket, ms);
    kinoIfade(ifade, ms);
    kinoKap.dataset.tepki = hareket;
    mino.bak(1);
    sonra(ms, () => mino.bak(0));
  });

  let gidiyor = false;
  const kartlar = OYUNLAR.map((k, i) => {
    const govde = h('span.ug-kart-govde', {}, kartResmi(k), h('span.ug-kart-ad', {}, k.ad), ...(k.rozet ? [h('span.ug-yeni', { 'aria-hidden': 'true' }, k.rozet)] : []));
    const a = h('a.ug-kart', { href: k.adres, 'data-oyun': k.id, 'aria-label': k.ad, style: `--r:${k.renk};--i:${i}`, draggable: 'false' }, govde);
    a.addEventListener('pointerdown', () => {
      a.classList.add('basili');
      // Mino basılan karta bakar (canlılık: karakterler çocuğun ne seçtiğiyle ilgilenir)
      if (AZ_HAREKET) return;
      const k = a.getBoundingClientRect();
      const m = mino.el.getBoundingClientRect();
      mino.bak(Math.max(-1, Math.min(1, (k.left + k.width / 2 - (m.left + m.width / 2)) / Math.max(160, innerWidth * 0.4))));
      sonra(1200, () => mino.bak(0));
    });
    for (const olay of ['pointerup', 'pointercancel', 'pointerleave'] as const) a.addEventListener(olay, () => a.classList.remove('basili'));
    a.addEventListener('click', (e) => {
      // Karta dokununca kart zıplar, Mino ve Kino sevinir, kısa bir an sonra oyuna geçilir.
      // Tek uygulamaya gömülünce burada sayfa değişmek yerine oyunun `oyunuBaslat(kok, { cikis })` girişi çağrılacak.
      e.preventDefault();
      if (gidiyor) return;
      gidiyor = true;
      efekt.secim();
      tepki('zipla');
      kinoOynat('sevin', 600);
      a.classList.remove('basili');
      a.classList.add('secildi');
      zamanlar.push(window.setTimeout(() => location.assign(a.href), sure(AZ_HAREKET ? 150 : 650)));
    });
    return h('li.ug-kart-yer', { style: `--i:${i}` }, a);
  });

  const kapi = h('button.ug-kapi', { type: 'button', 'aria-label': 'Ebeveyn köşesi (basılı tutun)' }, h('span.ug-kapi-daire', {}, h('span.ug-kapi-halka', { 'aria-hidden': 'true' }), svg(IKON.ebeveyn)));
  const ipucu = h('span.ug-kapi-ipucu', { role: 'status' }, 'Büyükler için: basılı tutun');
  let ipucuZaman = 0;
  const kapiBirak = basiliTut(
    kapi,
    sure(KAPI_SURE),
    () => {
      efekt.secim();
      app.git('ayarlar');
    },
    () => {
      ipucu.classList.add('gorunur');
      clearTimeout(ipucuZaman);
      ipucuZaman = window.setTimeout(() => ipucu.classList.remove('gorunur'), 2200);
    },
  );

  const el = h(
    'div.ug-menu',
    {},
    h('div.ug-gok', { 'aria-hidden': 'true' }, h('i.ug-bulut.ug-bulut-1'), h('i.ug-bulut.ug-bulut-2'), h('i.ug-bulut.ug-bulut-3')),
    h('div.ug-kose', {}, ipucu, kapi),
    h('header.ug-giris', {}, logo(), h('div.ug-ikili', {}, minoKap, kinoKap)),
    h('nav.ug-oyunlar', { 'aria-label': 'Oyunlar' }, h('ul.ug-izgara', {}, ...kartlar)),
  );

  // parallax: parmak (ya da fare) ekranda gezdikçe kart katmanları ve bulutlar farklı hızda kayar; yumuşak takip
  const hedef = { x: 0, y: 0 };
  const simdi = { x: 0, y: 0 };
  let raf = 0;
  const adim = () => {
    simdi.x += (hedef.x - simdi.x) * 0.12;
    simdi.y += (hedef.y - simdi.y) * 0.12;
    el.style.setProperty('--px', simdi.x.toFixed(3));
    el.style.setProperty('--py', simdi.y.toFixed(3));
    raf = Math.abs(hedef.x - simdi.x) + Math.abs(hedef.y - simdi.y) > 0.002 ? requestAnimationFrame(adim) : 0;
  };
  const izle = (e: PointerEvent) => {
    hedef.x = (e.clientX / innerWidth) * 2 - 1;
    hedef.y = (e.clientY / innerHeight) * 2 - 1;
    if (!raf) raf = requestAnimationFrame(adim);
  };
  if (!AZ_HAREKET) {
    el.addEventListener('pointermove', izle);
    el.addEventListener('pointerdown', izle);
  }

  return {
    el,
    kapat() {
      zamanlar.forEach(clearTimeout);
      clearTimeout(ipucuZaman);
      cancelAnimationFrame(raf);
      kapiBirak();
      yuruyen.kapat();
      kino.kapat();
    },
  };
}

// ---------------------------------------------------------------- Ebeveyn köşesi (şimdilik boş)
export function ayarlarEkrani(app: Uygulama): Ekran {
  const geri = yuvarlakDugme(IKON.geri, 'Ana menü', () => app.git('menu'), 'kucuk');
  const el = h(
    'div.ug-ayarlar',
    {},
    h('div.ust-cubuk', {}, geri, h('h1', {}, 'Ebeveyn Köşesi'), h('div.ug-bosluk')),
    h('div.ug-ayarlar-ic', {}, h('div.ug-ayarlar-kutu', {}, svg(IKON.ebeveyn, 'ug-ayarlar-ikon'), h('p', {}, 'Ayarlar yakında burada olacak.'))),
  );
  return { el };
}
