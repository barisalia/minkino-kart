/**
 * Harf Atölyesi · Büyükler için (veli sayfası). Ebeveyn kapısının arkasında, çocuğun Harf Atölyesi'nde ne öğrendiği:
 * 29 harf, Hece Evleri anahtarları, kurduğu sözcükler, okuduğu cümleler, beceriler, evde birlikte 2 öneri; Harf günlüğünden
 * (gunluk.ts) son 7 gün ve zorlandığı harfler. Matematik'in veli sayfasının kardeşi (matematik/src/veli.ts).
 * Rafın üstünde açılan ayrı bir katmandır: sahneyi değiştirmez, kayıtları yalnız okur (görünüm modeli: veli-ozet.ts).
 *
 * Bağlama (raftaki "Büyükler için", Harf oturumu): `veliSayfasiAc(kok)` — `kok` sahne (#atolye); açıkken tıklanmaz.
 * Kapı kapatılırsa hiçbir şey değişmez. "Derse dön", Esc ve Android geri tuşu kapatır (`kapaninca` çağrılır).
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
import { DURUM_YAZISI, GRUP_SAYISI, SIRA_ACIKLAMASI, veliOzeti, type BeceriId, type Durum, type VeliOzeti } from './veli-ozet';

export type VeliSecenekleri = { kapaninca?: () => void };

// Astra'nın çizimleri (brief: CLAUDE-ASTRA-MESAJLAR.md · 2026-11-20 00:15 · Paket HV1–HV2) ve H1'in resimli harfleri.
// Dosya gelince kendiliğinden yerine oturur; gelmeyen çizimin yeri hiç çizilmez (yerleşim çizimsiz de düzgün).
const cizimler = import.meta.glob<string>(['../../assets/alfabe/veli/*.webp', '../../assets/alfabe/resimli-harf/*.webp'], {
  eager: true, import: 'default', query: '?url',
});
const cizim = (yol: string, sinif: string, alt = '') => {
  const adres = cizimler['../../assets/alfabe/' + yol + '.webp'];
  return adres ? h(`img.${sinif}`, { src: adres, alt, draggable: 'false', decoding: 'async' }) : null;
};
const HARF_DURUMU = { ogrendi: 'öğrendi', yarim: 'yarım kaldı', sirada: 'sırada', bekliyor: 'henüz değil' } as const;

const cip = (d: Durum) => h('span.hv-cip', { 'data-durum': d }, DURUM_YAZISI[d]);
const cubuk = (oran: number) =>
  h('span.hv-cubuk', { 'aria-hidden': 'true' }, h('i', { style: `--d:${Math.round(Math.max(0, Math.min(1, oran)) * 100)}%` }));
const kart = (sinif: string, baslik: string, id: string, sag: Node | null, ...icerik: (Node | null)[]) =>
  h(`section.hv-kart.${sinif}`, { 'aria-labelledby': id }, h('div.hv-kart-ust', {}, h('h2', { id }, baslik), sag), ...icerik);

/** Sayfanın kendisi (görünüm modelinden; durum tutmaz). */
export function veliSayfasi(oz: VeliOzeti, kapat: () => void): HTMLElement {
  const geri = h('button.hv-geri', { type: 'button', 'aria-label': 'Derse dön' }, svg(IKON.geri), h('span', {}, 'Derse dön'));
  geri.addEventListener('click', kapat);
  const ust = h('header.hv-ust', {},
    geri,
    h('div.hv-baslik', {}, h('h1', { id: 'hv-baslik', tabindex: '-1' }, 'Büyükler için'), h('p', {}, 'Türkçe · ' + oz.yasYazi)),
  );
  const kutu = (deger: string, etiket: string, ad: string) => h('div.hv-kutu', { 'data-ad': ad }, h('strong', {}, deger), h('span', {}, etiket));
  const giris = h('section.hv-giris', { 'aria-label': 'Kısa özet' },
    cizim('veli/baslik', 'hv-baslik-resim'),
    h('div.hv-ozet', {},
      kutu(`${oz.ogrenilen}/29`, 'harf öğrendi', 'harf'),
      kutu(`${oz.anahtar}/20`, 'hece anahtarı', 'anahtar'),
      kutu(String(oz.cumleVar ? oz.cumle : oz.sozcuk), oz.cumleVar ? 'cümle okudu' : 'sözcük kurdu', oz.cumleVar ? 'cumle' : 'sozcuk')),
  );

  const harfDurumu: Durum = oz.ogrenilen === 0 ? 'yok' : oz.ogrenilen >= 29 ? 'tamam' : 'suruyor';
  const harfler = kart('hv-harf-kart', 'Öğrendiği harfler', 'hv-harf-b', cip(harfDurumu),
    // Öğrenme sırasıyla, rafla aynı beş ses grubu (2–3 yaşta grup adları yok, yalnız satırlar; CEVAP-07).
    h('div.hv-gruplar', {}, ...Array.from({ length: GRUP_SAYISI }, (_, g) => h('div.hv-grup', { 'data-grup': g },
      oz.grup === '2-3' ? null : h('small.hv-grup-adi', { 'aria-hidden': 'true' }, `${g + 1}. grup`),
      h('ol.hv-harfler', { 'aria-label': `${g + 1}. ses grubu` }, ...oz.harfler.filter((x) => x.grup === g).map((x) =>
        h('li', { 'data-durum': x.durum, 'aria-label': `${x.buyuk}: ${HARF_DURUMU[x.durum]}` },
          x.durum === 'ogrendi' ? cizim('resimli-harf/' + x.id, 'hv-harf-resim') : null,
          h('span', { 'aria-hidden': 'true' }, x.buyuk))))))),
    h('p.hv-alt', {}, oz.ogrenilen === 0
      ? 'Henüz başlamadı. Rafta ilk harfe dokununca Ceren Öğretmen A ile başlar.'
      : oz.ogrenilen >= 29 ? 'Bütün harfleri öğrendi.' : `${oz.ogrenilen} harf öğrendi.${oz.sonHarf ? ` En son: ${oz.sonHarf.buyuk} ${oz.sonHarf.kucuk}.` : ''}`),
    h('p.hv-ince', {}, SIRA_ACIKLAMASI),
  );

  const evler = kart('hv-hece-kart', 'Hece Evleri anahtarları', 'hv-hece-b', h('span.hv-cip', { 'data-durum': oz.anahtar >= 20 ? 'tamam' : oz.anahtar ? 'suruyor' : 'yok' }, `${oz.anahtar} / 20`),
    h('ul.hv-anahtarlar', { 'aria-label': 'Anahtarı alınan ünsüzler' },
      ...oz.anahtarlar.map((a) => h('li', { 'data-alindi': String(a.alindi), 'aria-label': `${a.unsuz.toLocaleUpperCase('tr')}: ${a.alindi ? 'anahtarı alındı' : 'henüz yok'}` }, a.unsuz.toLocaleUpperCase('tr')))),
  );

  const etiket = (b: BeceriId | 'hepsi') => (b === 'hepsi' ? 'Hepsi bitti' : oz.beceriler.find((x) => x.id === b)!.ad);
  const evde = kart('hv-evde', 'Evde birlikte', 'hv-evde-b', null,
    h('ul.hv-oneriler', {}, ...oz.oneriler.map((o) => h('li', { 'data-beceri': o.beceri },
      o.resim ? cizim('veli/' + o.resim, 'hv-oneri-resim') : null,
      h('div', {}, h('small', {}, etiket(o.beceri)), h('span', {}, o.metin))))),
  );

  // Harf günlüğü (gunluk.ts) gelince dolar; günlük yokken bölüm hiç çizilmez.
  const hafta = oz.son7Gun;
  const enCok = hafta ? Math.max(1, ...hafta.gunler.map((x) => x.adim)) : 1;
  const tekrar = hafta || oz.zorlananlar.length
    ? kart('hv-zor', 'Son 7 gün', 'hv-zor-b', null,
      hafta ? h('ol.hv-hafta', { 'aria-label': 'Son 7 günde biten ders adımları' }, ...hafta.gunler.map((x) =>
        h('li', { 'data-bugun': String(x.ad === 'Bugün'), 'aria-label': `${x.ad}: ${x.adim} adım` },
          h('span.hv-hafta-cubuk', { 'aria-hidden': 'true' }, h('i', { style: `--y:${Math.round((x.adim / enCok) * 100)}%` })),
          h('small', { 'aria-hidden': 'true' }, x.ad)))) : null,
      hafta ? h('p.hv-alt', {}, hafta.calisilan
        ? `7 günün ${hafta.calisilan} gününde çalıştı · ${hafta.toplam} ders adımı bitirdi.`
        : 'Son 7 günde Türkçe dersine girmedi.') : null,
      oz.zorlananlar.length ? h('p.hv-alt.hv-zor-baslik', {}, 'Biraz zorlandığı harfler:') : null,
      oz.zorlananlar.length ? h('ul.hv-zor-harfler', { 'aria-label': 'Zorlandığı harfler' }, ...oz.zorlananlar.map((x) => h('li', {}, x))) : null,
      oz.zorlananlar.length ? h('p.hv-alt', {}, 'Bu harflerde birkaç kez yanlış yere dokundu. Evde bu seslerle başlayan sözcükler bulmak iyi gelir.') : null)
    : null;

  const RESIM: Record<BeceriId, string> = { harf: 'beceri-harf', hece: 'beceri-hece', sozcuk: 'beceri-sozcuk', cumle: 'beceri-cumle' };
  const beceriler = kart('hv-beceriler', 'Neler öğreniyor?', 'hv-beceri-b', null,
    h('ul.hv-liste', {}, ...oz.beceriler.map((b) => h('li.hv-beceri', { 'data-id': b.id, 'data-durum': b.durum },
      h('div.hv-satir', {}, h('span.hv-ad', {}, cizim('veli/' + RESIM[b.id], 'hv-beceri-resim'), h('b', {}, b.ad)), cip(b.durum)),
      b.oran !== undefined ? cubuk(b.oran) : null,
      h('span.hv-alt', {}, b.yazi + ' · ' + b.aciklama),
    ))),
  );

  const not = h('p.hv-not', {},
    'Her harf kısa bir derstir: Ceren Öğretmen harfi tanıtır, çocuk sesini dinler, söyler ve ' +
    (oz.grup === '2-3' ? 'boyar.' : oz.grup === '4' ? 'o sesle başlayan sözcüğü bulur.' : 'büyük ve küçük harfi yazar.') +
    ' Hece Evleri’nde her ünsüzün kapısı açılınca bir anahtar gelir. Bilgiler yalnız bu cihazda tutulur.');

  // Bugün Evde 1 Dakika: en son bitirdiğine göre akşam evde tek cümlelik oyun (sayfanın en üstünde).
  const bugun = h('section.hv-bugun', { 'aria-labelledby': 'hv-bugun-b' },
    h('small', {}, 'Bugün evde 1 dakika'),
    h('h2', { id: 'hv-bugun-b' }, oz.bugun.baslik),
    h('p', {}, oz.bugun.metin));
  const icerik = h('div.hv-icerik', {},
    bugun,
    giris,
    h('div.hv-kolonlar', {}, h('div.hv-kolon', {}, harfler, evler), h('div.hv-kolon', {}, evde, tekrar, beceriler)),
    not,
  );
  return h('div.hv-veli', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'hv-baslik', 'data-grup': oz.grup, 'data-bos': String(oz.bos) }, ust, icerik);
}

let acikOlan: (() => void) | undefined;

/** Ebeveyn kapısını, geçilince veli sayfasını açar. Dönen işlev ikisini de sessizce kapatır. */
export function veliSayfasiAc(kok: HTMLElement, o: VeliSecenekleri = {}): () => void {
  if (acikOlan) return acikOlan;
  const kapiKatmani = h('div.mk-kok.mk-kilit-katmani');
  let kapandi = false, kapiAcik = true, oncekiInert = false;
  let sayfa: HTMLElement | undefined;
  let birak: (() => void) | undefined;
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
    if (sayfa) { sayfa.remove(); kok.inert = oncekiInert; }
    if (onceki?.isConnected) onceki.focus({ preventScroll: true });
    if (bildir) o.kapaninca?.();
  }
  function sayfayiAc() {
    const oz = veliOzeti({ yas: menuYasiOku(), oku: (a) => localStorage.getItem(a) });
    sayfa = veliSayfasi(oz, () => kapat(true));
    document.body.append(sayfa);
    oncekiInert = kok.inert;
    kok.inert = true;
    birak = katmanAc(sayfa, () => kapat(true));
    document.addEventListener('keydown', klavye);
    sayfa.querySelector<HTMLElement>('#hv-baslik')?.focus({ preventScroll: true });
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

// Raftaki satır gelene dek (ve testlerde): ?test=1&veli=1 sayfa yüklenince kapıyı açar.
// Modül sayfada iki kez yüklenebilir (main.ts ve test aynı dosyayı başka adresle alırsa): kapı yine bir kez açılır.
const acildiIsareti = window as unknown as Record<string, boolean>;
if (TEST_MODU && new URLSearchParams(location.search).get('veli') === '1' && !acildiIsareti.__harfVeliAcildi) {
  acildiIsareti.__harfVeliAcildi = true;
  const ac = () => { veliSayfasiAc(document.querySelector<HTMLElement>('#atolye') ?? document.body); };
  if (document.readyState === 'complete') ac();
  else window.addEventListener('load', ac, { once: true });
}
