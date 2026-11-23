/**
 * Matematik · Büyükler için (veli sayfası). Ebeveyn kapısının arkasında, çocuğun Matematik'te ne öğrendiği:
 * Ceren Öğretmen'le öğrendiği sayılar, dört oyuncağın turları ve hatıraları, beceriler, evde birlikte 1–2 öneri.
 * Çocuk için değil, yazılıdır; çizim yok. Tezgâhın üstünde açılan ayrı bir katmandır: oyunun sahnesini değiştirmez,
 * kayıtları yalnız okur (görünüm modeli: veli-ozet.ts).
 *
 * Bağlama (tezgâhtaki "Büyükler için"): `veliSayfasiAc(kok)` — `kok` oyunun sahnesi (#sahne); sayfa açıkken tıklanmaz.
 * Kapı kapatılırsa hiçbir şey değişmez. "Geri dön", Esc ve Android geri tuşu sayfayı kapatır (`kapaninca` çağrılır).
 * Dönen işlev kapıyı ya da sayfayı sessizce kapatır (sahne değişirken, sayfa gizlenirken).
 * Test kipinde `?test=1&veli=1`: modül yüklenince sayfa (kapıdan başlayarak) açılır.
 */
// Ebeveyn kapısının stilleri .mk-kok altında (ana.css); geçici şeffaf katman kuralı abonelik.css'te (kilit.ts yükler).
import '../../src/styles/ana.css';
import './veli.css';
import { menuYasiOku } from '../../src/engine/menu-yas';
import { katmanAc } from '../../src/kabuk/yon';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { ebeveynKapisiAc } from '../../src/ui/ebeveyn-kapisi';
import { IKON } from '../../src/ui/ikonlar';
import { DURUM_YAZISI, veliOzeti, type BeceriId, type Durum, type VeliOzeti } from './veli-ozet';

export type VeliSecenekleri = {
  /** Akıllı tekrarın zorlandığı sayılar (ileride). Boşsa "Biraz daha tekrar" bölümü görünmez. */
  zorlananlar?: () => readonly number[];
  zorKonular?: () => readonly { alan: string; konu: string }[];
  /** Kapı kapatılınca ya da sayfadan tezgâha dönülünce. */
  kapaninca?: () => void;
};

// Astra'nın çizimleri (brief: CLAUDE-ASTRA-MESAJLAR.md · 2026-11-19 19:10 · Paket MV1–MV2). Dosya gelince kendiliğinden
// yerine oturur; gelmeyen çizimin yeri hiç çizilmez (yerleşim çizimsiz de düzgün). Hatıralar oyuncakların kendi çizimleri.
const cizimler = import.meta.glob<string>(['../../assets/matematik/veli/*.webp', '../../assets/matematik/hatira-*.webp'], {
  eager: true, import: 'default', query: '?url',
});
const cizim = (yol: string, sinif: string, alt = '') => {
  const adres = cizimler['../../assets/matematik/' + yol + '.webp'];
  return adres ? h(`img.${sinif}`, { src: adres, alt, draggable: 'false', decoding: 'async' }) : null;
};
const BECERI_RESMI: Record<BeceriId, string> = {
  sayma: 'beceri-sayma', bakis: 'beceri-bakis', sekil: 'beceri-sekiller', olcme: 'beceri-olcme', oruntu: 'beceri-oruntu',
};

const SAYI_DURUMU ={ ogrendi: 'öğrendi', sirada: 'sırada', bekliyor: 'henüz değil' } as const;

const cip = (d: Durum) => h('span.mv-cip', { 'data-durum': d }, DURUM_YAZISI[d]);
const cubuk = (oran: number) =>
  h('span.mv-cubuk', { 'aria-hidden': 'true' }, h('i', { style: `--d:${Math.round(Math.max(0, Math.min(1, oran)) * 100)}%` }));
const kart = (sinif: string, baslik: string, id: string, sag: Node | null, ...icerik: (Node | null)[]) =>
  h(`section.mv-kart.${sinif}`, { 'aria-labelledby': id },
    h('div.mv-kart-ust', {}, h('h2', { id }, baslik), sag),
    ...icerik);

/** Sayfanın kendisi (görünüm modelinden; durum tutmaz). */
export function veliSayfasi(oz: VeliOzeti, kapat: () => void): HTMLElement {
  const geri = h('button.mv-geri', { type: 'button', 'aria-label': 'Geri dön' }, svg(IKON.geri), h('span', {}, 'Geri dön'));
  geri.addEventListener('click', kapat);
  const ust = h('header.mv-ust', {},
    geri,
    h('div.mv-baslik', {}, h('h1', { id: 'mv-baslik', tabindex: '-1' }, 'Büyükler için'), h('p', {}, 'Matematik · ' + oz.yasYazi)),
  );

  const kutu = (deger: string, etiket: string, ad: string) =>
    h('div.mv-kutu', { 'data-ad': ad }, h('strong', {}, deger), h('span', {}, etiket));
  const ozet = h('section.mv-giris', { 'aria-label': 'Kısa özet' },
    cizim('veli/baslik', 'mv-baslik-resim'),
    h('div.mv-ozet', {},
      kutu(`${oz.ders.ogrenilen}/${oz.ders.toplam}`, 'sayı öğrendi', 'sayi'),
      kutu(`${oz.turlar.yapilan}/${oz.turlar.toplam}`, 'oyun turu bitirdi', 'tur'),
      kutu(`${oz.hatiralar}/4`, 'hatıra aldı', 'hatira')),
  );

  const ders = kart('mv-ders', "Ceren Öğretmen'le sayılar", 'mv-ders-b', cip(oz.ders.durum),
    h('ol.mv-sayilar', { 'data-adet': oz.ders.toplam },
      ...oz.ders.sayilar.map((s) => h('li', { 'data-durum': s.durum, 'aria-label': `${s.n}: ${SAYI_DURUMU[s.durum]}` }, String(s.n)))),
    h('p.mv-alt', {}, oz.ders.yazi),
    oz.yol === 'minik' ? h('p.mv-ince', {}, "2–3 yaşta ders 1–5'te biter; 4 yaşta 1–10'a çıkar.") : null,
  );

  const oyuncaklar = kart('mv-oyuncaklar', 'Oyuncaklar', 'mv-oyuncak-b', null,
    h('ul.mv-liste', {}, ...oz.oyuncaklar.map((t) => h('li.mv-oyuncak', { 'data-id': t.id, 'data-durum': t.durum },
      h('div.mv-satir', {},
        h('b', {}, t.ad),
        h('span.mv-hatira', { 'data-alindi': String(t.hatira) }, cizim('hatira-' + t.id, 'mv-hatira-resim'), t.hatira ? 'Hatırası alındı' : 'Hatıra henüz yok')),
      cubuk(t.oran),
      h('span.mv-alt', {}, t.yazi),
    ))),
  );

  const beceriler = kart('mv-beceriler', 'Neler öğreniyor?', 'mv-beceri-b', null,
    h('ul.mv-liste', {}, ...oz.beceriler.map((b) => h('li.mv-beceri', { 'data-id': b.id, 'data-durum': b.durum },
      h('div.mv-satir', {}, h('span.mv-ad', {}, cizim('veli/' + BECERI_RESMI[b.id], 'mv-beceri-resim'), h('b', {}, b.ad)), cip(b.durum)),
      cubuk(b.toplam ? b.yapilan / b.toplam : 0),
      h('span.mv-alt', {}, b.aciklama),
    ))),
  );

  const etiket = (b: BeceriId | 'hepsi') => (b === 'hepsi' ? 'Hepsi bitti' : oz.beceriler.find((x) => x.id === b)!.ad);
  const evde = kart('mv-evde', 'Evde birlikte', 'mv-evde-b', null,
    h('ul.mv-oneriler', {}, ...oz.oneriler.map((o) => h('li', { 'data-beceri': o.beceri },
      o.resim ? cizim('veli/' + o.resim, 'mv-oneri-resim') : null,
      h('div', {}, h('small', {}, etiket(o.beceri)), h('span', {}, o.metin))))),
  );

  // Akıllı tekrar gelince dolar; veri yokken bölüm hiç çizilmez. Sayılar oyunlarda yeniden sorulur; konular (Şekiller, Örüntü,
  // Ölçü, sınıflama) yalnız burada görünür.
  const sayiVar = oz.zorlananlar.length > 0, konuVar = oz.zorKonular.length > 0;
  const zor = sayiVar || konuVar
    ? kart('mv-zor', 'Biraz daha tekrar', 'mv-zor-b', null,
      sayiVar ? h('ul.mv-zor-sayilar', { 'aria-label': 'Zorlandığı sayılar' }, ...oz.zorlananlar.map((n) => h('li', {}, String(n)))) : null,
      sayiVar ? h('p.mv-alt', {}, 'Bu sayılarda biraz zorlandı; oyunlar onları yeniden soracak. Evde de birlikte sayabilirsiniz.') : null,
      konuVar ? h('ul.mv-zor-konular', { 'aria-label': 'Zorlandığı konular' }, ...oz.zorKonular.map((z) =>
        h('li', { 'data-alan': z.alan }, h('small', {}, z.alanAdi), h('span', {}, z.ad)))) : null,
      konuVar ? h('p.mv-alt', {}, 'Bu konularda ilk denemede zorlandı. Evde eşyalarla birlikte oynayabilirsiniz: şekil arayın, sıraya dizin, karşılaştırın.') : null)
    : null;

  const not = h('p.mv-not', {},
    "Matematik'te dört oyuncak var; her biri yaşa göre 6–10 kısa turdur ve aynı iş art arda gelmez. Bütün turlar bitince çocuk oyuncağın hatırasını alır, tezgâhta oyuncağın üstünde yıldız belirir. Sayı masası Ceren Öğretmen'in dersiyle başlar; masanın hatırası ders bitince gelir.");

  // Bugün Evde 1 Dakika: en son bitirdiğine göre akşam evde tek cümlelik oyun (sayfanın en üstünde).
  const bugun = h('section.mv-bugun', { 'aria-labelledby': 'mv-bugun-b' },
    h('small', {}, 'Bugün evde 1 dakika'),
    h('h2', { id: 'mv-bugun-b' }, oz.bugun.baslik),
    h('p', {}, oz.bugun.metin));
  const icerik = h('div.mv-icerik', {},
    bugun,
    ozet,
    h('div.mv-kolonlar', {}, h('div.mv-kolon', {}, ders, oyuncaklar), h('div.mv-kolon', {}, evde, zor, beceriler)),
    not,
  );
  return h('div.mv-veli', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mv-baslik', 'data-yol': oz.yol, 'data-bos': String(oz.bos) }, ust, icerik);
}

let acikOlan: (() => void) | undefined;

/** Ebeveyn kapısını, geçilince veli sayfasını açar. Dönen işlev ikisini de sessizce kapatır. */
export function veliSayfasiAc(kok: HTMLElement, o: VeliSecenekleri = {}): () => void {
  // Çift dokunuşta ikinci bir kapı açılmaz.
  if (acikOlan) return acikOlan;
  const kapiKatmani = h('div.mk-kok.mk-kilit-katmani');
  let kapandi = false, kapiAcik = true;
  let sayfa: HTMLElement | undefined;
  let birak: (() => void) | undefined;
  let oncekiInert = false;
  const onceki = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const klavye = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    kapat(true);
  };

  function kapat(bildir: boolean) {
    if (kapandi) return;
    kapandi = true;
    acikOlan = undefined;
    // Açık kapı kendi dinleyicisini bıraksın (src/kabuk/yerel.ts da pencereleri böyle kapatır).
    if (kapiAcik) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    kapiKatmani.remove();
    document.removeEventListener('keydown', klavye);
    birak?.();
    if (sayfa) {
      sayfa.remove();
      kok.inert = oncekiInert;
    }
    if (onceki?.isConnected) onceki.focus({ preventScroll: true });
    if (bildir) o.kapaninca?.();
  }

  function sayfayiAc() {
    const oz = veliOzeti({ yas: menuYasiOku(), oku: (a) => localStorage.getItem(a), zorlananlar: o.zorlananlar?.(), zorKonular: o.zorKonular?.() });
    sayfa = veliSayfasi(oz, () => kapat(true));
    document.body.append(sayfa);
    oncekiInert = kok.inert;
    kok.inert = true;
    birak = katmanAc(sayfa, () => kapat(true));
    document.addEventListener('keydown', klavye);
    sayfa.querySelector<HTMLElement>('#mv-baslik')?.focus({ preventScroll: true });
  }

  document.body.append(kapiKatmani);
  void ebeveynKapisiAc(kapiKatmani).then((gecti) => {
    kapiAcik = false;
    kapiKatmani.remove();
    if (kapandi) return;
    if (gecti) sayfayiAc();
    else kapat(true);
  });
  acikOlan = () => kapat(false);
  return acikOlan;
}

// Tezgâhtaki satır gelene dek (ve testlerde): ?test=1&veli=1 sayfa yüklenince kapıyı açar.
// Modül sayfada iki kez yüklenebilir (main.ts ve test aynı dosyayı başka adresle alırsa): kapı yine bir kez açılır.
const acildiIsareti = window as unknown as Record<string, boolean>;
if (TEST_MODU && new URLSearchParams(location.search).get('veli') === '1' && !acildiIsareti.__matematikVeliAcildi) {
  acildiIsareti.__matematikVeliAcildi = true;
  const ac = () => { veliSayfasiAc(document.querySelector<HTMLElement>('#sahne') ?? document.body); };
  if (document.readyState === 'complete') ac();
  else window.addEventListener('load', ac, { once: true });
}
