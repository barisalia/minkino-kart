// Harf Atölyesi · "Ceren'le oku": çocuk, bitirdiği harflerden kurulan kısa cümleleri okur.
// Önce Ceren sözcükleri sırayla yakarak okur, sonra çocuk sözcüklere dokunur, en sonda bütün cümleye
// dokunur; cümle akıcı okunur ve sahne canlanır. Bağlantı noktası A (ekip/alfabe/YOL-HARITASI.md).
// Okuma kitaplığı (20 Kasım): beş ses grubunun cümleleri ve "Ceren'in Hikâye Defteri". Her ses grubu bitince bir öykü
// uyanır (5+); tur sonunda kitap olarak sunulur. Öykü sayfaları cümle gibi okunur, son sayfa "okuduğunu yaptır".
import './cumle-okuma.css';
import { cerenYuzu } from './konusma-dersi';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { kelimeResmi } from './kelime-resmi';
import { yasGrubu } from './yas-grubu';
import { IKON } from '../../src/ui/ikonlar';
import { okuBulOyna, okuBulTurlari } from './oku-bul';
import { oyunSesi } from './oyun-sesi';
import { cerenSevinsin, pariltiNokta } from './cila';
import { kitapParcasi, kivrimKareleri, ogedeOynat, kareOynat, oykuKatmanlari } from './a1-kareler';
import { acikOykuler, isaretleri, cumleDurumu, okunacaklar, oykuler, yaptirAcilir, sozcukKaydi, sozcukleri, type Cumle, type CumleYasi, type Oyku } from './cumle-okuma-kurallari';

// Astra'nın cümle sahneleri ve öykü sayfaları, dosya adıyla (cumle-01, cumle-01-sonra, oyku-1-4 …).
const cizimler = Object.fromEntries(Object.entries(import.meta.glob('../../assets/alfabe/{cumle,oyku}/*.webp', { eager: true, import: 'default' }) as Record<string, string>)
  .map(([yol, url]) => [yol.split('/').pop()!.replace(/\.webp$/, ''), url]));
const harfResimleri = import.meta.glob('../../assets/alfabe/[0-9][0-9].webp', { eager: true, import: 'default' }) as Record<string, string>;
// Astra'nın cümle sahneleri gelene kadar karakterin uygulamadaki onaylı çizimi (Şef salonu ve Hazırlık).
const kisiResimleri = import.meta.glob(['../../assets/sef/salon/{anne,baba,babaanne,kino}-portre-0.webp', '../../assets/sef/misafir/{dede,lokum,mino}-istek.webp',
  '../../assets/sef/salon/arkadaslar/bulut-0.webp', '../../assets/hazirlik/ders/zipzip-0.webp'], { eager: true, import: 'default' }) as Record<string, string>;
const kisiResmi = (ad: string) => Object.entries(kisiResimleri).find(([yol]) => yol.split('/').pop()!.startsWith(ad + '-'))?.[1];
const KAYIT = 'minkino-cumle-okuma-v1';
const TUR = 3;

export interface CumleOkumaBaglami {
  /** Ceren'in kaydını çalar; oynarken çalınan saniyeyi bildirir (cerenKonus ile aynı imza). */
  oku: (id: string, sonra?: () => void, oynarken?: (saniye: number) => void) => void;
  sustur: () => void;
  cikis: () => void;
  geri: HTMLButtonElement;
  baslik: HTMLElement;
  ilerleme: HTMLElement;
  bitenHarfler: string[];
  yas?: CumleYasi;
  /** Test kipi: "Okuduğunu yaptır" anı ve öyküler, Astra'nın kareleri gelmeden yer tutucuyla oynar. */
  yaptirYerTutucu?: boolean;
  /** Test kipi: bu öyküyle doğrudan başla (oyku-1 …). */
  oyku?: string;
  /** Test kipi: "Oku ve bul" ısınmasını atla (false) */
  okuBul?: boolean;
}

/** Sahnenin resmi: Astra'nın sahnesi; gelmediyse eski cümlelerde geçici resim, yenilerinde yok. */
/**
 * Sayfa çevirme (yönetici, 23 Kasım: "sayfa geçiş animasyonu"): eski kart yeni sayfanın üstünde, sol kenarı menteşe
 * gibi, kıvrılarak kalkar (0,62 sn); yenisi hafifçe öne gelir. Kâğıt sesi. Az hareket ayarında yok.
 */
function sayfaCevir(eski: HTMLElement, eskiKutu: DOMRect, sahneKutu: DOMRect, yeni: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const kopya = eski.cloneNode(true) as HTMLElement;
  kopya.classList.remove('co-kart'); kopya.classList.add('co-cevrilen');
  const olcek = sahneKutu.width / ((yeni.parentElement as HTMLElement | null)?.offsetWidth || sahneKutu.width);
  Object.assign(kopya.style, { left: (eskiKutu.left - sahneKutu.left) / olcek + 'px', top: (eskiKutu.top - sahneKutu.top) / olcek + 'px', width: eskiKutu.width / olcek + 'px', height: eskiKutu.height / olcek + 'px', margin: '0', aspectRatio: 'auto' });
  yeni.parentElement?.append(kopya);
  oyunSesi('kagit');
  // Astra'nın kıvrılan sayfa kareleri (Paket Harf-A1) varsa sayfa onlarla döner; eski kart yalnız söner.
  const kivrim = kivrimKareleri();
  if (kivrim) {
    ogedeOynat(yeni, kivrim, 1, 140);
    const s = kopya.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-in' });
    s.onfinish = s.oncancel = () => kopya.remove();
    return;
  }
  const a = kopya.animate([
    // 2B kıvrılma (scaleX + skewY + gölge): 3B dönüşüm (perspective/rotateY) kardeşlerini dokunma sınamasından düşürüyordu,
    // çocuğun o anki dokunuşu sahneye gidiyordu (iPad, 23 Kasım).
    { transform: 'scaleX(1) skewY(0deg)', filter: 'brightness(1)', opacity: 1 },
    { transform: 'scaleX(.5) skewY(-3deg)', filter: 'brightness(.9)', opacity: 1, offset: .55 },
    { transform: 'scaleX(.04) skewY(-5deg)', filter: 'brightness(.78)', opacity: 0 },
  ], { duration: 620, easing: 'cubic-bezier(.45,.05,.4,1)' });
  a.onfinish = a.oncancel = () => kopya.remove();
  yeni.animate([{ transform: 'scale(.97)', filter: 'brightness(.94)' }, { transform: 'scale(1)', filter: 'brightness(1)' }], { duration: 620, easing: 'ease-out', composite: 'add' });
}

/** Dokunulan noktadaki nesne (üstteki önce; saydamlık örneği): sırası, yoksa -1. */
function degilenNesne(kart: HTMLElement, x: number, y: number): number {
  const l = [...kart.querySelectorAll<HTMLImageElement>('img.co-nesne:not(.co-nesne-2)')];
  for (let i = l.length - 1; i >= 0; i--) if (nesneyeDegdi(l[i], x, y)) return Number(l[i].dataset.nesne);
  return -1;
}
/** Nesne katmanının dokunulan noktası boş değil mi (resim kartla aynı oranda). */
const nesneTuvali = new WeakMap<HTMLImageElement, CanvasRenderingContext2D | null>();
function nesneyeDegdi(n: HTMLImageElement, x: number, y: number): boolean {
  if (!n.naturalWidth) return false;
  if (!nesneTuvali.has(n)) {
    const t = document.createElement('canvas'); t.width = n.naturalWidth; t.height = n.naturalHeight;
    const c = t.getContext('2d', { willReadFrequently: true });
    c?.drawImage(n, 0, 0);
    nesneTuvali.set(n, c);
  }
  const c = nesneTuvali.get(n);
  if (!c) return false;
  const k = n.getBoundingClientRect();
  const ix = Math.round(((x - k.left) / k.width) * n.naturalWidth), iy = Math.round(((y - k.top) / k.height) * n.naturalHeight);
  // parmak payı: noktanın çevresindeki 9 örnekten biri doluysa değmiş sayılır
  for (const dx of [-14, 0, 14]) for (const dy of [-14, 0, 14]) {
    const px = ix + dx, py = iy + dy;
    if (px < 0 || py < 0 || px >= n.naturalWidth || py >= n.naturalHeight) continue;
    try { if (c.getImageData(px, py, 1, 1).data[3] > 40) return true; } catch { return false; }
  }
  return false;
}
/** Nesne kendi hareket pozuna geçip yaylanır, pırıltı ve parıltı sesi; 0,8 sn sonra döner. */
function nesneKipirdat(kart: HTMLElement, sira: number) {
  const [n1, n2] = kart.querySelectorAll<HTMLImageElement>('img.co-nesne[data-nesne="' + sira + '"]');
  if (!n1 || !n2) return;
  n1.hidden = true; n2.hidden = false;
  oyunSesi('parilti');
  n2.animate([{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.06) rotate(-2deg)', offset: .3 }, { transform: 'scale(.98) rotate(1.5deg)', offset: .65 }, { transform: 'scale(1) rotate(0)' }], { duration: 620, easing: 'ease-out' });
  window.setTimeout(() => { n2.hidden = true; n1.hidden = false; }, 800);
}

/** Jöle dokunuşu: dokunulan noktanın çevresi (yumuşak kenarlı daire) büyüyüp yaylanır; dokunulan nesne kıpırdar gibi. */
function jole(kart: HTMLElement, x: number, y: number) {
  const resimler = kart.querySelectorAll<HTMLImageElement>('img.co-resim');
  const kaynak = resimler[resimler.length - 1];
  if (!kaynak) return;
  kart.querySelector('.co-jole')?.remove();
  const k = kart.getBoundingClientRect();
  const px = ((x - k.left) / k.width) * 100, py = ((y - k.top) / k.height) * 100;
  const j = document.createElement('img');
  j.className = 'co-jole'; j.src = kaynak.currentSrc || kaynak.src; j.alt = ''; j.draggable = false;
  const maske = 'radial-gradient(circle at ' + px + '% ' + py + '%, #000 0, #000 13%, transparent 21%)';
  j.style.setProperty('mask-image', maske); j.style.setProperty('-webkit-mask-image', maske);
  j.style.transformOrigin = px + '% ' + py + '%';
  kart.append(j);
  const a = j.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.16)', offset: .3 }, { transform: 'scale(.95)', offset: .6 }, { transform: 'scale(1.04)', offset: .8 }, { transform: 'scale(1)' }], { duration: 560, easing: 'ease-out' });
  a.onfinish = a.oncancel = () => j.remove();
}

export function cumleResmi(c: Cumle): { src: string; gecici: boolean } | undefined {
  const sahne = cizimler[c.id];
  if (sahne) return { src: sahne, gecici: false };
  if (!c.gecici) return undefined;
  const src = c.gecici.startsWith('harf:') ? harfResimleri['../../assets/alfabe/' + c.gecici.slice(5) + '.webp']
    : c.gecici.startsWith('kisi:') ? kisiResmi(c.gecici.slice(5)) : kelimeResmi(c.gecici);
  return src ? { src, gecici: true } : undefined;
}

/** "Okuduğunu yaptır" anının sonra karesi (cumle-NN-sonra, oyku-N-4-sonra); yoksa an gerçek oyunda görünmez. */
export function sonraResmi(c: Cumle): string | undefined {
  return cizimler[c.id + '-sonra'];
}
/** Çokgenin (yüzde) kapsayan dikdörtgeni: dokunma düğmesinin yeri. */
function kutusu(points: string) {
  const n = points.trim().split(/\s+/).map((p) => p.split(',').map(Number));
  const xs = n.map((p) => p[0]), ys = n.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export function cumleOkumaKarti(): string {
  return '<button class="at-hece-karti at-oyun-karti at-cumle-ac" type="button" aria-label="Ceren\'le oku"><span class="at-cumle-kart-yazi">Ceren\'le oku</span></button>';
}

function kaydiOku(): { okunan: string[]; oykuler: string[] } {
  try {
    const k = JSON.parse(dersKaydiniOku(KAYIT) ?? '{}');
    const liste = (x: unknown) => (Array.isArray(x) ? x.filter((y: unknown) => typeof y === 'string') : []);
    return { okunan: liste(k.okunan), oykuler: liste(k.oykuler) };
  } catch { return { okunan: [], oykuler: [] }; }
}
function okunanYaz(id: string, oyku = false) {
  const k = kaydiOku(), liste = oyku ? k.oykuler : k.okunan;
  if (!liste.includes(id)) liste.push(id);
  dersKaydiniYaz(KAYIT, JSON.stringify(k.oykuler.length ? k : { okunan: k.okunan }));
}

export function cumleOkumaKur(alan: HTMLElement, b: CumleOkumaBaglami): () => void {
  let kapandi = false;
  const zamanlar: number[] = [];
  let kurSayaci = 0;
  const bekle = (ms: number, f: () => void) => { zamanlar.push(window.setTimeout(() => { if (!kapandi) f(); }, ms)); };
  const oku = (id: string, sonra?: () => void, oynarken?: (saniye: number) => void) => b.oku(id, () => { if (!kapandi) sonra?.(); }, oynarken);
  const yas = b.yas ?? yasGrubu;
  const yonergeDuyuldu = new Set<string>();
  const yonerge = (id: string, sonra: () => void) => { if (yonergeDuyuldu.has(id)) { sonra(); return; } yonergeDuyuldu.add(id); oku(id, sonra); };
  // "Okuduğunu yaptır" (5+ yaş): yalnız önce ve sonra kareleri geldiyse (test kipinde yer tutucuyla da).
  const yaptirHazir = (c: Cumle) => yaptirAcilir(c, yas, (ad) => !!cizimler[ad.replace(/\.webp$/, '')], !!b.yaptirYerTutucu);

  const sahne = document.createElement('section');
  sahne.className = 'co-sahne';
  sahne.setAttribute('aria-label', 'Ceren\'le oku');
  alan.replaceChildren(sahne);

  // Tur: ya bir öykünün dört sayfası ya da üç cümle (önce okunmamışlar; hepsi okunduysa baştan).
  let tur: Cumle[] = [];
  let oyku: Oyku | undefined;
  let sira = 0;

  function cumleTuru() {
    oyku = undefined;
    b.baslik.textContent = 'Ceren\'le oku';
    const hepsi = okunacaklar(b.bitenHarfler, yas), okunan = kaydiOku().okunan;
    tur = [...hepsi.filter((c) => !okunan.includes(c.id)), ...hepsi.filter((c) => okunan.includes(c.id))].slice(0, TUR);
    sira = 0;
    if (!tur.length) { bosGoster(); return; }
    // Isınma: "Oku ve bul" (oku-bul.ts), turda bir kez; okunabilir sözcük yoksa atlanır.
    const okuBul = b.okuBul === false || isindi ? [] : okuBulTurlari(b.bitenHarfler, yas);
    isindi = true;
    if (okuBul.length) {
      b.baslik.textContent = 'Oku ve bul';
      okuBulOyna({ sahne, oku: (id, sonra) => oku(id, sonra), sustur: b.sustur, bekle, ilerleme: b.ilerleme, cerenYuzu: cerenYuzu('co-ceren') }, okuBul, () => { b.baslik.textContent = 'Ceren\'le oku'; cumleKur(tur[0]); });
      return;
    }
    cumleKur(tur[0]);
  }
  let isindi = false;
  function oykuTuru(o: Oyku) {
    b.sustur();
    anlamaBitti = false;
    oyku = o;
    b.baslik.textContent = o.baslik;
    tur = o.sayfalar;
    sira = 0;
    sahne.dataset.oyku = o.id;
    cumleKur(tur[0]);
  }

  function bosGoster() {
    sahne.dataset.evre = 'bos';
    // Boş durum kırık görünmesin: en yakın cümle için kalan harfler ve Ceren'in sözü (cumle-kart-bos).
    const eksik = cumleDurumu(b.bitenHarfler, yas).eksikHarfler;
    sahne.innerHTML = cerenYuzu('co-ceren') + '<div class="co-bos"><p>Önce birkaç harf daha öğrenelim, sonra birlikte okuyacağız.</p>' +
      (eksik.length ? '<p class="co-eksik" aria-label="Kalan harfler: ' + eksik.join(', ') + '">' + eksik.map((h) => '<b>' + h + '</b>').join('') + '</p>' : '') + '</div>';
    oku('cumle-kart-bos');
  }

  function ilerlemeCiz() {
    // Harf Atölyesi'nin adım noktaları (stil.css .at-adim): okunan ve o anki cümle dolu, o anki bir kez zıplar.
    b.ilerleme.innerHTML = '<span class="at-adim co-adim">' + tur.map((_, i) => '<i class="' + (i < sira ? 'at-dolu' : i === sira ? 'at-dolu at-simdi' : '') + '"></i>').join('') + '</span>';
    b.ilerleme.setAttribute('aria-label', (sira + 1) + (oyku ? '. sayfa, ' : '. cümle, ') + tur.length + (oyku ? ' sayfadan' : ' cümleden'));
  }

  function cumleKur(c: Cumle) {
    const sozler = sozcukleri(c.metin), isaretler = isaretleri(c.metin);
    const resim = cumleResmi(c);
    // Öykü sayfası katmanları (Paket Harf-A1): nesnesiz zemin + dokununca kıpırdayan nesne (geçici resimde yok).
    const katman = resim && !resim.gecici ? oykuKatmanlari(c.id) : undefined;
    // Sayfa çevirme: önceki sayfanın kartı (varsa) yeni sayfanın üstünde sol kenarından kıvrılıp kalkar.
    const eskiKart = sahne.querySelector<HTMLElement>('.co-kart');
    const eskiKutu = eskiKart?.getBoundingClientRect(), sahneKutu = sahne.getBoundingClientRect();
    sahne.dataset.evre = 'ceren';
    sahne.dataset.cumle = c.id;
    // Bu sayfanın geç kalan geri çağrıları (Ceren'in okuması, bekleme) yeni sayfada çalışıp bir sayfayı atlatmasın:
    // her ilerleme, sahne hâlâ bu sayfadaysa olur (sayfa çevirme ve sustur yarışında sayfa 3 atlanıyordu, 23 Kasım).
    const buKur = ++kurSayaci;
    const buSayfa = () => kurSayaci === buKur && sahne.dataset.cumle === c.id;
    sahne.innerHTML =
      '<div class="co-kart"' + (resim?.gecici ? ' data-gecici="true"' : '') + (!resim ? ' data-yer-tutucu="true"' : '') + '>' +
      (katman ? '<img class="co-resim" alt="" draggable="false" src="' + katman.zemin + '">' + katman.nesneler.map((n, i) => '<img class="co-nesne" data-nesne="' + i + '" alt="" draggable="false" src="' + n.dur + '"><img class="co-nesne co-nesne-2" data-nesne="' + i + '" alt="" draggable="false" src="' + n.hareket + '" hidden>').join('')
        : resim ? '<img class="co-resim" alt="" draggable="false" src="' + resim.src + '">' : '') +
      (resim && kitapParcasi('kose') ? '<img class="co-kose" alt="" draggable="false" src="' + kitapParcasi('kose') + '">' : '') +
      (resim && oyku && kitapParcasi('ayrac') ? '<img class="co-ayrac" alt="" draggable="false" src="' + kitapParcasi('ayrac') + '">' : '') + '</div>' +
      cerenYuzu('co-ceren') +
      // Noktalama (virgül dahil) önündeki sözcük taşının hemen ardında, taşın dışında. Yazı boyu cümlenin uzunluğuna göre:
      // dört sözcük de tek satırda kalsın (--n sözcük, --h harf sayısı; cumle-okuma.css → .co-cumle).
      '<p class="co-cumle" role="group" aria-label="' + (oyku ? 'Sayfa' : 'Cümle') + ': ' + c.metin + '" style="--n:' + sozler.length + ';--h:' + sozler.join('').length + '">' +
      sozler.map((s, i) => '<span class="co-dilim"><button class="co-soz" type="button" data-sira="' + i + '" disabled>' + s + '</button>' +
        (isaretler[i] ? '<span class="co-son" aria-hidden="true">' + isaretler[i] + '</span>' : '') + '</span>').join('') + '</p>' +
      '<button class="co-tumu" type="button" aria-label="Bütün cümleyi oku" disabled><span aria-hidden="true">' + IKON.oyna + '</span></button>';
    const sozDugmeleri = [...sahne.querySelectorAll<HTMLButtonElement>('.co-soz')];
    const tumu = sahne.querySelector<HTMLButtonElement>('.co-tumu')!;
    // Telefonda resmin iki yanı boş kalmasın: aynı sahnenin bulanık hâli zemine (yalnız CSS süzgeci; cumle-okuma.css).
    if (resim) sahne.style.setProperty('--co-arka', 'url("' + resim.src + '")'); else sahne.style.removeProperty('--co-arka');
    // Resme dokununca resim "boing" diye kıpırdar (kalite denetimi 22 Kasım, kural 5, 7); yaptır anında kendi işi var.
    const kartEl = sahne.querySelector<HTMLElement>('.co-kart')!;
    kartEl.addEventListener('pointerdown', (e) => {
      if (sahne.dataset.evre === 'yaptir' || sahne.dataset.evre === 'yapildi' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const n = katman ? degilenNesne(kartEl, e.clientX, e.clientY) : -1;
      if (n >= 0) nesneKipirdat(kartEl, n); else jole(kartEl, e.clientX, e.clientY);
    });
    if (eskiKart && eskiKutu && eskiKutu.width) sayfaCevir(eskiKart, eskiKutu, sahneKutu, kartEl);
    ilerlemeCiz();

    // Cümle kaydı çalarken sözcükler, kaydın zaman damgalarına göre sırayla yanar.
    const yak = (i: number, birak = false) => sozDugmeleri.forEach((d, j) => d.classList.toggle('co-yanik', birak ? j <= i : j === i));
    const izle = (birak: boolean) => (saniye: number) => {
      const z = c.zamanlar ?? [];
      let i = 0;
      while (i + 1 < z.length && z[i + 1] <= saniye * 1000) i++;
      yak(i, birak);
    };
    // 1 · Ceren okur: akıcı cümle kaydı, sözcükler sesle birlikte yanar. Zaman bilgisi yoksa sözcük sözcük.
    function cerenOkur(i: number) {
      if (!buSayfa()) return;
      if (c.zamanlar?.length === sozler.length) {
        yak(0);
        oku(c.id, () => { yak(-1); bekle(250, cocukDokunur); }, izle(false));
        return;
      }
      yak(i);
      if (i >= sozDugmeleri.length) { cocukDokunur(); return; }
      oku(sozcukKaydi(sozler[i]), () => bekle(120, () => cerenOkur(i + 1)));
    }
    // 2 · Çocuk sözcüklere dokunur; her sözcük okunur. Hepsine dokununca bütün cümle açılır.
    function cocukDokunur() {
      if (!buSayfa()) return;
      sahne.dataset.evre = 'cocuk';
      yonerge('cumle-yonerge-sen', () => {});
      for (const d of sozDugmeleri) {
        d.disabled = false;
        d.onclick = () => {
          b.sustur();
          sozDugmeleri.forEach((x) => x.classList.toggle('co-yanik', x === d));
          d.dataset.okundu = 'true';
          const hepsi = sozDugmeleri.every((x) => x.dataset.okundu === 'true');
          // Son sözcüğün kaydı kesilmesin: bütün cümle adımı (ve yönergesi) sözcük okunduktan sonra açılır.
          oku(sozcukKaydi(sozler[Number(d.dataset.sira)]), () => {
            d.classList.remove('co-yanik');
            if (hepsi && sahne.dataset.evre === 'cocuk' && buSayfa()) tumuAc();
          });
        };
      }
    }
    // 3 · Bütün cümle: akıcı okunur, sahne canlanır.
    function tumuAc() {
      sahne.dataset.evre = 'tumu';
      tumu.disabled = false;
      tumu.onclick = () => {
        b.sustur();
        tumu.disabled = true;
        sozDugmeleri.forEach((d) => { d.disabled = true; });
        sahne.dataset.evre = 'canli';
        yak(0, true);
        oku(c.id, () => {
          yak(sozler.length, true);
          if (!oyku) okunanYaz(c.id);
          if (!buSayfa()) return;
          if (yaptirHazir(c)) bekle(500, () => { if (buSayfa()) yaptir(); }); else bekle(900, () => { if (buSayfa()) sonraki(); });
        }, izle(true));
      };
      yonerge('cumle-yonerge-tumu', () => {});
    }
    // 4 · Okuduğunu yaptır: Ceren "Şimdi yaptıralım!" der; çocuk sahnede cümlenin işini yapan yere dokunur, cümle
    // sahnede gerçekleşir (önce → sonra karesi). Başka yere dokunursa cümle bir kez daha okunup yanar; ikinci kez
    // şaşarsa hedef hafifçe parlar.
    function yaptir() {
      const y = c.yaptir!, k = kutusu(y.points), sonra = sonraResmi(c);
      const kart = sahne.querySelector<HTMLElement>('.co-kart')!;
      sahne.dataset.evre = 'yaptir';
      if (!sonra) kart.dataset.yerTutucu = 'true';
      kart.insertAdjacentHTML('beforeend',
        '<svg class="co-bolge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="' + y.points + '"/></svg>' +
        '<button class="co-hedef" type="button" aria-label="' + y.hedef + '" style="left:' + k.x + '%;top:' + k.y + '%;width:' + k.w + '%;height:' + k.h + '%"></button>');
      let sasma = 0, oldu = false;
      kart.querySelector<HTMLButtonElement>('.co-hedef')!.onclick = (e) => {
        e.stopPropagation();
        if (oldu) return;
        oldu = true;
        b.sustur();
        sahne.dataset.evre = 'yapildi';
        kart.querySelectorAll('.co-bolge,.co-hedef').forEach((x) => x.remove());
        if (sonra) kart.insertAdjacentHTML('beforeend', '<img class="co-resim co-sonra" alt="" draggable="false" src="' + sonra + '">');
        // Tempo (22 Kasım): çocuk cümleyi az önce iki kez duydu (Ceren'in okuyuşu, kendi "bütün cümle"si). Sahne
        // canlanırken üçüncü kez okunmaz: sözcükler yanar, parıltı çalar, sahnenin "sonra" hâli görülünce sonraki sayfa.
        yak(sozler.length, true);
        oyunSesi('parilti');
        bekle(1600, () => { if (buSayfa()) sonraki(); });
      };
      kart.onclick = () => {
        if (oldu) return;
        b.sustur();
        if (++sasma >= 2) kart.classList.add('co-ipucu');
        yak(-1);
        oku('cumle-yaptir-tekrar', () => { yak(0, true); oku(c.id, () => yak(sozler.length, true), izle(true)); });
      };
      oku('cumle-yaptir');
    }
    function sonraki() { sira++; if (sira < tur.length) cumleKur(tur[sira]); else bitir(); }
    yonerge('cumle-yonerge-ben', () => cerenOkur(0));
  }

  // Tur sonu: kaç cümle okundu; açık öyküler kitap olarak (yeni uyananın üstünde "Yeni" parıltısı).
  // Öykü sonu "anladın mı?" (21 Kasım): (a) Hangi sayfa? Ceren öyküden bir sayfayı okur, çocuk iki resimden doğrusunu seçer
  // (iki soru; yanlışta ceza yok, doğru resim parlar). (b) 5+: Sıraya diz. Dört sayfa karışık gelir, çocuk sırayla dokunur;
  // dizilince Ceren öyküyü baştan sona okur. Yeni çizim yok: öykünün kendi kareleri.
  let anlamaBitti = false;
  const karis = <T,>(l: T[]) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sayfaResmi = (s: Cumle) => { const r = cumleResmi(s); return r ? '<img src="' + r.src + '" alt="" draggable="false">' : '<span class="co-sayfa-yer">' + s.metin + '</span>'; };
  function anlama(o: Oyku, sonra: () => void) {
    b.ilerleme.innerHTML = '';
    const sorular = karis(o.sayfalar.map((_, i) => i)).slice(0, 2);
    let no = 0;
    function soru() {
      if (no >= sorular.length) { if (yas === '5+') sirala(); else sonra(); return; }
      const dogru = o.sayfalar[sorular[no]];
      const diger = karis(o.sayfalar.filter((x) => x !== dogru))[0];
      sahne.dataset.evre = 'hangi';
      sahne.dataset.hedef = dogru.id;
      sahne.dataset.soru = String(no);
      sahne.innerHTML = cerenYuzu('co-ceren') + '<div class="co-anlama"><p class="co-anlama-baslik">Hangi sayfa?</p><div class="co-sayfalar">' +
        karis([dogru, diger]).map((x) => '<button type="button" class="co-sayfa" data-sayfa="' + x.id + '" aria-label="Sayfa resmi">' + sayfaResmi(x) + '</button>').join('') + '</div></div>';
      let kilit = true;
      sahne.querySelectorAll<HTMLButtonElement>('.co-sayfa').forEach((d) => {
        d.onclick = () => {
          if (kilit) return;
          if (d.dataset.sayfa !== dogru.id) {
            oyunSesi('geri');
            sahne.querySelector('.co-sayfa[data-sayfa="' + dogru.id + '"]')?.classList.add('co-parla');
            kilit = true; oku(dogru.id, () => { kilit = false; });
            return;
          }
          kilit = true; b.sustur();
          oyunSesi('birles');
          d.classList.add('co-dogru');
          no++;
          bekle(1000, soru);
        };
      });
      const sor = () => oku(dogru.id, () => { kilit = false; sahne.dataset.bekliyor = 'true'; });
      sahne.dataset.bekliyor = 'false';
      if (no === 0) oku('cumle-oyku-hangi', sor); else sor();
    }
    function sirala() {
      sahne.dataset.evre = 'sirala';
      const karisik = karis(o.sayfalar.map((_, i) => i));
      if (karisik.every((x, i) => x === i)) karisik.reverse();
      sahne.innerHTML = cerenYuzu('co-ceren') + '<div class="co-anlama"><div class="co-yuvalar">' + o.sayfalar.map((_, i) => '<span class="co-yuva" data-yuva="' + i + '"><b>' + (i + 1) + '</b></span>').join('') + '</div>' +
        '<div class="co-sayfalar co-karisik">' + karisik.map((i) => '<button type="button" class="co-sayfa" data-sira="' + i + '" aria-label="Sayfa resmi">' + sayfaResmi(o.sayfalar[i]) + '</button>').join('') + '</div></div>';
      let siradaki = 0, kilit = true;
      sahne.querySelectorAll<HTMLButtonElement>('.co-karisik .co-sayfa').forEach((d) => {
        d.onclick = () => {
          if (kilit || d.disabled) return;
          const i = Number(d.dataset.sira);
          if (i !== siradaki) {
            oyunSesi('geri');
            d.classList.remove('co-salla'); void d.offsetWidth; d.classList.add('co-salla');
            sahne.querySelector('.co-karisik .co-sayfa[data-sira="' + siradaki + '"]')?.classList.add('co-parla');
            return;
          }
          b.sustur();
          oyunSesi(siradaki + 1 < o.sayfalar.length ? 'miknatis' : 'birles');
          d.disabled = true;
          d.classList.remove('co-parla');
          sahne.querySelector('.co-yuva[data-yuva="' + i + '"]')!.replaceChildren(d.firstElementChild!.cloneNode(true));
          d.classList.add('co-yerlesti');
          siradaki++;
          if (siradaki < o.sayfalar.length) { oku(o.sayfalar[i].id); return; }
          kilit = true;
          sahne.dataset.evre = 'sirali';
          // Dizildi (tempo, 22 Kasım: bitişe 8 sn yerine ~1,6 sn): sayfaları çocuk yerleştirirken zaten duydu; öykü baştan
          // okunmaz. Yuvalar sırayla parlar, parıltı çalar, son sayfa okunur, sonra "okudun" ekranı.
          // Son yerleştirilen sayfa ışıklarla aynı anda okunur; okuma bitince bitiş.
          oyunSesi('parilti');
          const oyna = (k: number) => {
            sahne.querySelectorAll('.co-yuva').forEach((y, j) => y.classList.toggle('co-okunan', j === k));
            if (k < o.sayfalar.length) bekle(280, () => oyna(k + 1));
          };
          bekle(150, () => oyna(0));
          oku(o.sayfalar[i].id, () => bekle(200, sonra));
        };
      });
      oku('cumle-oyku-sirala', () => { kilit = false; sahne.dataset.bekliyor = 'true'; });
      sahne.dataset.bekliyor = 'false';
    }
    soru();
  }

  function bitir() {
    if (oyku && !anlamaBitti) { anlamaBitti = true; anlama(oyku, bitir); return; }
    sahne.dataset.evre = 'bitti';
    ilerlemeCiz();
    if (oyku) okunanYaz(oyku.id, true);
    const okunanOykuler = kaydiOku().oykuler;
    const kitaplar = acikOykuler(b.bitenHarfler, yas, !!b.yaptirYerTutucu, okunanOykuler).filter((o) => o.id !== oyku?.id);
    const yeni = kitaplar.some((o) => !okunanOykuler.includes(o.id));
    // Bitiş (kalite denetimi 22 Kasım, kural 6, 8): okunan öykünün kapağı iri bir kitap olarak döner gelir, yıldızlar saçılır,
    // Ceren sevinir; sıradaki yeni öykü büyük kartla önde, öbürleri küçük.
    kitaplar.sort((x, y) => Number(okunanOykuler.includes(x.id)) - Number(okunanOykuler.includes(y.id)));
    const bitenKapak = oyku ? cizimler[oyku.sayfalar[0].id] : undefined;
    sahne.innerHTML = cerenYuzu('co-ceren') + '<div class="co-bitti' + (bitenKapak ? ' co-bitti-kitapli' : '') + '" role="status">' +
      (bitenKapak ? '<div class="co-bitti-kitap' + (kitapParcasi('kapak') ? ' co-kapakli' : '') + '"' + (kitapParcasi('kapak') ? ' style="--kapak:url(&quot;' + kitapParcasi('kapak') + '&quot;)"' : '') + '><img src="' + bitenKapak + '" alt="" draggable="false">' +
        (kitapParcasi('rozet') ? '<img class="co-bitti-rozet co-rozet-resim" src="' + kitapParcasi('rozet') + '" alt="" draggable="false">' : '<span class="co-bitti-rozet" aria-hidden="true">★</span>') + '</div>' : '') +
      '<div class="co-bitti-yan"><p>' + (oyku ? oyku.baslik + ' öyküsünü okudun!' : tur.length + ' cümle okudun!') + '</p>' +
      (kitaplar.length ? '<div class="co-kitaplar">' + kitaplar.map((o, sira) => {
        const kapak = cizimler[o.sayfalar[0].id];
        return '<button type="button" class="co-kitap' + (sira === 0 && !okunanOykuler.includes(o.id) ? ' co-kitap-sonraki' : '') + '" data-oyku="' + o.id + '"' + (okunanOykuler.includes(o.id) ? '' : ' data-yeni="true"') +
          ' aria-label="Öykü: ' + o.baslik + '">' + (kapak ? '<img src="' + kapak + '" alt="" draggable="false">' : '') + '<span>' + o.baslik + '</span></button>';
      }).join('') + '</div>' : '') + '</div></div>' +
      '<button class="co-cikis" type="button" aria-label="Rafa dön"><span aria-hidden="true">' + IKON.onay + '</span></button>';
    sahne.querySelector<HTMLButtonElement>('.co-cikis')!.onclick = () => { kapat(); b.cikis(); };
    sahne.querySelectorAll<HTMLButtonElement>('.co-kitap').forEach((d) => {
      d.onclick = () => { const o = oykuler.find((x) => x.id === d.dataset.oyku); if (o) oykuTuru(o); };
    });
    oku('cumle-yonerge-bitti', () => { if (yeni) oku('cumle-oyku-uyandi'); });
    const kitapEl = sahne.querySelector('.co-bitti-kitap');
    if (kitapEl) bekle(380, () => { const r = kitapEl.getBoundingClientRect(); pariltiNokta(r.left + r.width / 2, r.top + r.height / 2, 12, Math.max(r.width, r.height) * 0.75); cerenSevinsin();
      const kirpinti = kitapParcasi('kirpinti'); if (kirpinti) kareOynat([kirpinti], r.left + r.width / 2, r.top + r.height / 2, Math.max(r.width, r.height) * 1.5, 900); });
  }

  function kapat() {
    if (kapandi) return;
    kapandi = true;
    zamanlar.forEach((z) => clearTimeout(z));
    b.sustur();
  }
  const baslangic = b.oyku ? oykuler.find((o) => o.id === b.oyku) : undefined;
  if (baslangic) oykuTuru(baslangic); else cumleTuru();
  return kapat;
}
