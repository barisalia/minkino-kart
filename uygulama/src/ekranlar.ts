/**
 * Minkino ana menüsü: Mino ve Kino karşılar (Mino yandan yürüyerek, Kino hoplayarak gelir; arada birbirine bakıp el
 * sallarlar, dokununca tepki verirler), altında oyun kartları (sırayla gelir, yan oyun rozetleri, parmakla hafif
 * parallax); büyükler için ebeveyn kapısı (yazıyla toplama sorusu). Uygulamada abonelikli kartlarda kilit rozeti.
 */
import { abonelikEkrani, kilitliIcerik } from '../../src/abonelik/ekran';
import { kilitleriKur } from '../../src/abonelik/kilit';
import { DosyaMuzik, fonDosyasi } from '../../src/audio/dosya-muzik';
import { saglayici } from '../../src/abonelik/satin';
import { kilitli, premiumAyarla, premiumMu } from '../../src/engine/erisim';
import { ABONELIK_YONETIM, GIZLILIK_ADRESI, SARTLAR_ADRESI } from '../../src/kabuk/ayar';import { uygulamaPlatformu } from '../../src/kabuk/ortam';
import { ebeveynKapisiAc } from '../../src/ui/ebeveyn-kapisi';
import { efekt } from '../../src/audio/ses';
import '../../src/karakter/karakter.css';
import { Karakter, type HareketAdi, type Poz as KPoz } from '../../src/karakter/karakter';
import { type Tepki } from '../../src/mino/mino';
import { minoProfilYukle, YuruyenMino } from '../../src/mino/mino-profil';
import { h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { OTOBUS } from '../../pasta/src/cizim';
import { derinlik, menuOyunlari, type OyunKarti } from './oyunlar';

// Yalnız kartların kullandığı klasörler (bütün assets/ pakete adres olarak girmesin)
const CIZIMLER = import.meta.glob<string>(
  ['../../assets/{hayvanlar,tasitlar,meyveler,pazar,sahne,canlan,parti,parti-sahne,orman-esya}/*.webp', '../../assets/okul/sayi-bloklari.webp', '../../assets/film/{kapak,park}/*.webp'],
  { eager: true, query: '?url', import: 'default' },
);
const adres = (yol: string) => CIZIMLER[`../../assets/${yol}.webp`] ?? '';

const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOGO_RENK = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'];

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
    if (c.kod === 'otobus') {
      kap.append(h(`span.ug-k.${sinif}`, { style: d, html: OTOBUS }));
      return;
    }
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

// ---------------------------------------------------------------- Menü
export function menuEkrani(app: Uygulama): Ekran {
  const yuruyen = new YuruyenMino();
  const mino = yuruyen.mino;
  const tepki = (t: Tepki) => {
    if (!AZ_HAREKET) mino.tepki(t);
  };
  const zamanlar: number[] = [];
  const sonra = (ms: number, fn: () => void) => zamanlar.push(window.setTimeout(fn, sure(ms)));
  // menü müziği (assets/muzik/menu-dongu.mp3 varsa): kısık döngü, konuşurken kısılır, sessize almaya uyar
  const fon = new DosyaMuzik(fonDosyasi('menu-dongu'), 0.3);
  fon.baslat();

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
  const uygulamada = !!uygulamaPlatformu();
  const oyunlar = menuOyunlari(uygulamada);
  const kilitKartlari: [HTMLElement, string, HTMLElement][] = [];
  const kartlar = oyunlar.map((k, i) => {
    const govde = h('span.ug-kart-govde', {}, kartResmi(k), h('span.ug-kart-ad', {}, k.ad), ...(k.rozet ? [h('span.ug-yeni', { 'aria-hidden': 'true' }, k.rozet)] : []));
    const a = h('a.ug-kart', { href: k.adres, 'data-oyun': k.id, 'aria-label': k.ad, style: `--r:${k.renk};--i:${i}`, draggable: 'false' }, govde);
    kilitKartlari.push([a, k.id, govde]);
    a.addEventListener('pointerdown', () => {
      a.classList.add('basili');
      // yumuşak dokunma sesi (seçilince ayrıca "seçim" sesi; kilitli kartta sesi ebeveyn kapısı çalar)
      if (!a.hasAttribute('data-kilitli')) efekt.dokunma();
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
      a.classList.remove('basili');
      // abonelikli oyun (yalnız uygulamada): ebeveyn kapısı → abonelik ekranı; abone olunca kilit kalkar
      if (kilitli(k.id)) {
        tepki('mir');
        void kilitliIcerik(app.kok);
        return;
      }
      gidiyor = true;
      efekt.secim();
      tepki('zipla');
      kinoOynat('sevin', 600);
      a.classList.add('secildi');
      zamanlar.push(window.setTimeout(() => location.assign(a.href), sure(AZ_HAREKET ? 150 : 650)));
    });
    return h(`li.ug-kart-yer${k.genis ? '.ug-genis' : ''}`, { style: `--i:${i}` }, a);
  });
  const kilitBirak = kilitleriKur(kilitKartlari);

  // ebeveyn köşesi: yazıyla toplama sorusu (mağaza kuralı; eskiden "basılı tut")
  const kapi = h('button.ug-kapi', { type: 'button', 'aria-label': 'Ebeveyn köşesi' }, h('span.ug-kapi-daire', {}, svg(IKON.ebeveyn)));
  kapi.addEventListener('click', async () => {
    efekt.dokunma();
    if (await ebeveynKapisiAc(app.kok)) app.git('ayarlar');
  });

  const el = h(
    'div.ug-menu',
    {},
    h('div.ug-gok', { 'aria-hidden': 'true' }, h('i.ug-bulut.ug-bulut-1'), h('i.ug-bulut.ug-bulut-2'), h('i.ug-bulut.ug-bulut-3')),
    h('div.ug-kose', {}, kapi),
    h('header.ug-giris', {}, logo(), h('div.ug-ikili', {}, minoKap, kinoKap)),
    // tek sayıda kart (uygulamada 7): geniş kart (Pasta Otobüsü) son sırayı doldurur, ızgarada boşluk kalmaz
    h('nav.ug-oyunlar', { 'aria-label': 'Oyunlar' }, h(`ul.ug-izgara${oyunlar.length % 2 ? '.ug-tek' : ''}`, { 'data-adet': String(oyunlar.length) }, ...kartlar)),
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
      cancelAnimationFrame(raf);
      kilitBirak();
      fon.durdur();
      yuruyen.kapat();
      kino.kapat();
    },
  };
}

// ---------------------------------------------------------------- Ebeveyn köşesi (ebeveyn kapısından sonra)
export function ayarlarEkrani(app: Uygulama): Ekran {
  const geri = yuvarlakDugme(IKON.geri, 'Ana menü', () => app.git('menu'), 'kucuk');
  const uygulamada = !!uygulamaPlatformu();
  // dış bağlantılar (kapının arkasında): gizlilik politikası ve kullanım koşulları web sitesinde
  const baglanti = (adres: string, yazi: string) => h('a.ince-dugme.ug-baglanti', { href: adres, target: '_blank', rel: 'noopener noreferrer' }, yazi);
  // abonelik (yalnız uygulamada): durum + abonelik ekranı (satın alımları geri yükleme orada)
  const aboneDurum = h('p.ug-abone-durum');
  const durumYaz = () => {
    aboneDurum.textContent = premiumMu() ? 'Minkino Premium etkin. Teşekkürler!' : 'Bazı oyunlar ücretsiz. Premium ile hepsi açılır.';
  };
  durumYaz();
  const aboneDugme = h('button.dugme.ug-abone-dugme', { type: 'button' }, svg(IKON.tac), 'Minkino Premium');
  aboneDugme.addEventListener('click', async () => {
    efekt.secim();
    await abonelikEkrani(app.kok);
    durumYaz();
  });
  // satın alımları geri yükle (mağaza kuralı: abonelik ekranına girmeden de bulunabilsin)
  const geriYukleDugme = h('button.ince-dugme.ug-geri-yukle', { type: 'button' }, 'Satın alımları geri yükle');
  geriYukleDugme.addEventListener('click', async () => {
    efekt.dokunma();
    const s = await saglayici();
    if (!s) {
      aboneDurum.textContent = 'Abonelik çok yakında. Şimdilik bütün oyunlar açık!';
      return;
    }
    geriYukleDugme.setAttribute('disabled', '');
    aboneDurum.textContent = 'Satın alımlar kontrol ediliyor…';
    try {
      const var_ = await s.geriYukle();
      premiumAyarla(var_);
      aboneDurum.textContent = var_ ? 'Minkino Premium geri yüklendi. Teşekkürler!' : 'Bu hesapta etkin bir abonelik bulunamadı.';
    } catch {
      aboneDurum.textContent = 'Mağazaya şu an ulaşılamıyor. Lütfen tekrar deneyin.';
    } finally {
      geriYukleDugme.removeAttribute('disabled');
    }
  });
  const platform = uygulamaPlatformu();
  const yonet = platform ? baglanti(ABONELIK_YONETIM[platform], 'Aboneliği yönet') : null;
  const el = h(
    'div.ug-ayarlar',
    {},
    h('div.ust-cubuk', {}, geri, h('h1', {}, 'Ebeveyn Köşesi'), h('div.ug-bosluk')),
    h(
      'div.ug-ayarlar-ic',
      {},
      h(
        'div.ug-ayarlar-kutu',
        {},
        svg(IKON.ebeveyn, 'ug-ayarlar-ikon'),
        ...(uygulamada ? [h('h2', {}, 'Abonelik'), aboneDurum, aboneDugme, h('div.ug-baglantilar', {}, geriYukleDugme, ...(yonet ? [yonet] : []))] : []),
        h('h2', {}, 'Gizlilik ve güvenlik'),
        h('p', {}, 'Reklam yok. Kişisel veri toplanmaz; ilerleme yalnızca bu cihazda saklanır. Mikrofon sesi anlık işlenir, kaydedilmez.'),
        h('div.ug-baglantilar', {}, baglanti(GIZLILIK_ADRESI, 'Gizlilik politikası'), baglanti(SARTLAR_ADRESI, 'Kullanım koşulları')),
      ),
    ),
  );
  return { el };
}
