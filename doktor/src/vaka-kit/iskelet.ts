// Minik Doktor · vaka iskeleti (Y5 ve sonrası). Bir vakanın değişmeyen kısmı: masa (hasta, çanta, şerit, Kino), masadan yakın
// plana kamera geçişi, yakın plandaki alet şeridi ve Kino, elde tutulan aletler (parmağı izler, gittiği yöne yatar, gölgesi
// vardır), kare dizisi oynatıcı, her dokunuşa karşılık, kısa kapanış (en çok 2 sn), yeniden oyna ve test kancası.
// Vakanın kendisi (yakın plan katmanları, el hareketleri, tepkiler) kurucu işlevde yazılır ve kare kancasıyla çalışır.
// Kurallar Dikenli Pati'de ölçülenlerle aynı: iki görünüm de baştan çizili, pozlar üst üste boyalı, çizimler çözülmeden oyun
// başlamaz; çizim eksikse ekranda hiçbir görüntü olmaz (data-durum="eksik").
import '../vaka/vaka.css';
import './iskelet.css';
import { TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { anaMenuyeDon } from '../../../src/uygulama';
import { efekt, konus, sesleriYukle, sus } from '../ses';
import { ZIPLAMA_KARELERI, golgeYap, kenarUzat, yildizEtkisi } from '../vaka/etki';
import { cevirUyarisi } from '../vaka/sahne';
import {
  DOK_ALET_BOYU, ELDE_OLCEK, HUB, SAHNE, SECMELI, SERIT_YUVALARI, SERIT_YUVA_BOYU, TEKRAR_BOYU, YAKIN, ZIPLAMA_MS,
  alkisKaresi, beklemeKaresi, kinoYakinPozu, sahneOlcegi, sevincKaresi, ziplamaKaresi, type KinoPozu, type Kutu, type Nokta, type Yas,
} from '../vaka/veri';

const vakaDosyalari = import.meta.glob<string>('../../../assets/doktor/*/*.webp', { eager: true, query: '?url', import: 'default' });
const TEKRAR_DUGMESI = new URL('../../../assets/hazirlik/dugmeler/tekrar.webp', import.meta.url).href;
const sorgu = new URLSearchParams(location.search);
/** Yalnız geliştirme sunucusunda: çizimler gelmeden mekaniği denemek için geçici klasörden okur (uygulamaya girmez). */
const TASLAK = import.meta.env.DEV && sorgu.has('taslak');
import { ORTAK, ORTAK_DOSYALAR, ORTAK_EFEKTLER, cizimKlasoru } from './ortak';
export { ORTAK, ORTAK_DOSYALAR, ORTAK_EFEKTLER };
const KINO = [SECMELI.kino.goster, SECMELI.kino.sasir, ...SECMELI.kino.alkis];
const KINO_POZLARI: Record<KinoPozu, string> = { izler: SECMELI.kino.alkis[1], sasir: SECMELI.kino.sasir, sevin: SECMELI.kino.goster };

export const el = <K extends keyof HTMLElementTagNameMap>(etiket: K, sinif: string): HTMLElementTagNameMap[K] => { const e = document.createElement(etiket); e.className = sinif; return e; };
export const koy = (e: HTMLElement, k: Kutu) => { Object.assign(e.style, { left: k.sol + 'px', top: k.ust + 'px', width: k.g + 'px', height: k.y + 'px' }); };
export const ortala = (e: HTMLElement, p: Nokta, g: number, y: number) => koy(e, { sol: p.x - g / 2, ust: p.y - y / 2, g, y });
export const sure = (ms: number) => (TEST_MODU ? 1 : ms);
export const bekle = (ms: number) => new Promise<void>(r => setTimeout(r, TEST_MODU ? Math.min(ms, 30) : ms));
export const pop = (e: HTMLElement, ms = 200) => e.animate([{ transform: 'scale(.6)' }, { transform: 'scale(1.12)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: sure(ms), easing: 'ease-out' });
export const ziplat = (e: HTMLElement) => { e.animate([{ transform: 'scale(1) translateY(0)' }, { transform: 'scale(1.22) translateY(-14px)', offset: 0.4 }, { transform: 'scale(1) translateY(0)' }], { duration: sure(280), easing: 'ease-out' }); };
export const hop = (e: HTMLElement | null | undefined, px = 20, ms = 260) => { e?.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-px}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(ms), easing: 'ease-out', composite: 'add' }); };
export const salla = (e: HTMLElement) => e.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: sure(260) });
export const titret = (e: HTMLElement) => e.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: sure(360), composite: 'add' });

export interface Alet { g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; /** parmağın aletin altında kalmaması için kaldırma (sahne pikseli) */ kaldir?: number; }
export interface Tutulan { ad: string; kaynak: HTMLElement; kutu: HTMLDivElement; a: Alet; parmak: Nokta; id: number; golge: HTMLCanvasElement; egim: number; once: Nokta; ucOnce: Nokta | null; }
export interface Yigin { kutu: HTMLDivElement; goster: (ad: string) => void; simdi: () => string; }

export interface IskeletAyar {
  /** #doktor[data-oyun] */ oyun: string;
  /** çizimlerin klasörü: assets/doktor/<klasor>/ ; geçici çizimler output/doktor/<klasor>-taslak/ */ klasor: string;
  dosyalar: readonly string[];
  /** başka vakadan aynen kullanılan çizimler (ör. Y1'in büyüteci; assets/doktor/vaka/) */ paylasilan?: readonly string[];
  hasta: {
    kutu: Kutu; bekleme: readonly [string, string]; kirp: string; sevinc: readonly [string, string];
    /** kapanışın son pozları (sırayla döner: şaka ya da son sevinç) */ son: readonly string[];
    /** masada dokunulacak yer (yakın plana geçiş) ve düğmenin boyu; göğüs (yıldızın kalktığı yer) */ dokunma: Nokta; dugme: readonly [number, number]; gogus: Nokta; yaklasma: { x: number; y: number; olcek: number };
    ad: string;
  };
  /** açılan çantanın dört yuvası ve masadaki şeridin ilk üç yuvası */ cantaAletleri: readonly string[]; seritAletleri: readonly string[];
  yakinFon: string;
  sesler: readonly string[];
  sozler: { giris: string; canta: string; son?: string; sonSonra?: string };
  kapanis: { parlama: number; kamera: number; sevinc: number };
  /** ekranın kenar rengi (16:9 dışı ekranlarda kenar uzatmanın arkası) */ zemin?: string;
}
export interface Kancalar {
  /** yakın plana geçilince (ilk aşamaya geçer) */ yaklasinca: () => void;
  /** her kare: tutulan alet varsa ucun yeri, bu karede gidilen yol ve yatay hız */ kare: (dt: number, an: number, h: Tutulan | null, uc: Nokta | null, yol: number, hx: number) => void;
  /** parmak kalkınca; true dönerse alet yerine dönmez (vaka kendisi koydu) */ kalkinca?: (t: Tutulan) => boolean;
  /** yakın planda boş yere dokunuş (sahne pikseli) */ bosDokunus?: (p: Nokta) => void;
  /** yakın plandaki Kino şaşkın mı (ör. alet hastaya değerken) */ kinoSasirsin?: () => boolean;
  /** kapanış yıldızlarının yakın plandaki yeri */ kutlamaYeri: Nokta;
  /** sırası gelen düğmeler (zıplar, ipucu) */ siradaki: () => HTMLElement[];
  /** test kancasına eklenecek okumalar */ test?: Record<string, (...a: never[]) => unknown>;
}
export interface Iskelet {
  yas: Yas; kok: HTMLElement; sahne: HTMLDivElement; hub: HTMLDivElement; yakin: HTMLDivElement; etkiKati: HTMLDivElement; elKati: HTMLDivElement; dok: HTMLDivElement;
  cozulmus: Map<string, HTMLImageElement>;
  adres: (ad: string) => string | undefined;
  resim: (ad: string, sinif?: string) => HTMLImageElement;
  yigin: (adlar: readonly string[], sinif: string) => Yigin;
  oynat: (adlar: readonly string[], p: Nokta, g: number, h: number, ms: number, sec?: { hedef?: HTMLElement; taban?: boolean; kay?: number; kayX?: number; don?: number; olcek?: number }) => Promise<void>;
  parilti: (p: Nokta, boy?: number, hedef?: HTMLElement) => void;
  yildizSac: (p: Nokta, adet?: number) => void;
  ses: (ad: string, kazanc?: number, hiz?: number) => void;
  soyle: (ad: string) => void;
  kinoTepki: (poz: KinoPozu, ms?: number, px?: number) => void;
  kinoYakin: HTMLElement | null;
  dokDugmesi: (i: number, ad: string, etiket: string) => HTMLButtonElement;
  aletEkle: (ad: string, alet: Alet, icerik: HTMLElement[], golgeCizimi: string) => HTMLDivElement;
  /** kaynağa basılınca aleti ele alır (sıra uygunsa) */ aletDugmesi: (kaynak: HTMLElement, ad: string, sirada: () => boolean, once?: () => void) => void;
  yanlis: (b: HTMLElement) => void;
  /** aleti hemen ele alır (ör. kutudan koparılan mendil) */ tut: (kaynak: HTMLElement, ad: string, e: PointerEvent) => void;
  tutulan: () => Tutulan | null;
  ucNoktasi: (t: Tutulan) => Nokta;
  birak: (t: Tutulan) => void;
  yerineKoy: (t: Tutulan, p: Nokta, kucuk?: number, ms?: number) => Promise<void>;
  asama: () => string;
  asamaGec: (a: string) => void;
  kutla: () => Promise<void>;
  calisiyor: () => boolean;
  noktaya: (e: PointerEvent) => Nokta;
  ekrana: (p: Nokta) => Nokta;
  iptal: AbortSignal;
}

/** çizimin gerçek adresi: vakanın kendi klasöründen; Dikenli Pati'nin klasöründen yalnız açıkça ortak olanlar (cizimKlasoru) */
const gercekAdres = (klasor: string, ad: string, paylasilan: readonly string[] = []): string | undefined => vakaDosyalari[`../../../assets/doktor/${cizimKlasoru(ad, klasor, paylasilan)}/${ad}.webp`];
/** Vakanın eksik çizimleri (bekleme odası, çizimi gelmemiş vakayı sıraya koymaz). Geçici çizimlerle (?taslak) yalnız ortak çizimlere bakılır. */
export const eksikCizimleri = (klasor: string, dosyalar: readonly string[], paylasilan: readonly string[] = []): string[] => [...(TASLAK ? [] : dosyalar), ...ORTAK_DOSYALAR, ...paylasilan].filter(ad => !gercekAdres(klasor, ad, paylasilan));

export function vakaBaslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void }, ayar: IskeletAyar, kurucu: (I: Iskelet) => Kancalar): void {
  const gercek = (ad: string): string | undefined => gercekAdres(ayar.klasor, ad, ayar.paylasilan);
  // gerçek çizim varsa o; geliştirmede (?taslak) yalnız eksik olanın yerine geçici çizim (paket parça parça gelirken de akar)
  const adres = (ad: string): string | undefined => gercek(ad) ?? (TASLAK && ayar.dosyalar.includes(ad) ? `/output/doktor/${ayar.klasor}-taslak/${ad}.png` : undefined);
  kok.replaceChildren();
  kok.dataset.oyun = ayar.oyun;
  delete kok.dataset.asama;
  cevirUyarisi(kok);
  const geri = el('button', 'vk-geri'); geri.type = 'button'; geri.setAttribute('aria-label', 'Geri'); geri.innerHTML = IKON.geri;
  geri.addEventListener('click', () => anaMenuyeDon());
  kok.append(geri);
  const eksik = eksikCizimleri(ayar.klasor, ayar.dosyalar, ayar.paylasilan);
  if (eksik.length) { kok.dataset.durum = 'eksik'; kok.dataset.eksik = String(eksik.length); console.info(`${ayar.hasta.ad}: ${eksik.length} çizim bekleniyor:`, eksik.join(', ')); return; }
  kok.dataset.durum = 'yukleniyor';
  const kino = KINO.every(ad => !!gercek(ad)) ? KINO : [];
  const adlar = [...ayar.dosyalar, ...ORTAK_DOSYALAR, ...(ayar.paylasilan ?? []), ...kino];
  const hepsi = adlar.map(ad => { const r = new Image(); r.src = adres(ad)!; return r.decode().catch(() => undefined).then(() => r); });
  void Promise.all([Promise.all(hepsi), sesleriYukle([...ayar.sesler, ...ORTAK_EFEKTLER])]).then(([resimler]) =>
    kur(kok, yas, secenek, ayar, kurucu, adres, new Map(adlar.map((ad, i) => [ad, resimler[i]])), kino.length > 0));
}

/** Kino'nun kapanıştaki varsayılan pozları için */
const kinoHub = (an: number, asama: string, sasirdi: number) => (asama === 'kutlama' || asama === 'son' ? (sasirdi && an - sasirdi < 1100 ? SECMELI.kino.sasir : SECMELI.kino.alkis[alkisKaresi(an)]) : sasirdi && an - sasirdi < 1100 ? SECMELI.kino.sasir : SECMELI.kino.goster);

function kur(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void }, ayar: IskeletAyar, kurucu: (I: Iskelet) => Kancalar,
  adres: (ad: string) => string | undefined, cozulmus: Map<string, HTMLImageElement>, kinoVar: boolean) {
  const resim = (ad: string, sinif = ''): HTMLImageElement => { const r = el('img', sinif); r.src = adres(ad) ?? ''; r.alt = ''; r.draggable = false; r.decoding = 'sync'; return r; };
  const yigin = (adlar: readonly string[], sinif: string): Yigin => {
    const kutu = el('div', sinif + ' vk-yigin');
    const kareler = new Map(adlar.map(ad => [ad, resim(ad)] as const));
    kutu.append(...kareler.values());
    let simdi = '';
    const goster = (ad: string) => { if (ad === simdi || !kareler.has(ad)) return; kareler.get(simdi)?.classList.remove('vk-gorunur'); kareler.get(ad)!.classList.add('vk-gorunur'); simdi = ad; };
    goster(adlar[0]);
    return { kutu, goster, simdi: () => simdi };
  };
  const sahne = el('div', 'vk-sahne');
  let S = 1;
  const tasma = { yan: 0, dik: 0 };
  const iptal = new AbortController();
  const boyutla = () => {
    const o = sahneOlcegi(kok.clientWidth || innerWidth, kok.clientHeight || innerHeight);
    S = o.s;
    sahne.style.transform = `translate(${o.sol}px, ${o.ust}px) scale(${o.s})`;
    tasma.yan = o.sol / o.s; tasma.dik = o.ust / o.s;
    sahne.style.setProperty('--ty', tasma.yan.toFixed(1) + 'px'); sahne.style.setProperty('--td', tasma.dik.toFixed(1) + 'px');
  };
  addEventListener('resize', boyutla, { signal: iptal.signal });
  const TAM: Kutu = { sol: 0, ust: 0, g: SAHNE.g, y: SAHNE.y };
  const yildizlar = yildizEtkisi(() => resim(ORTAK.yildiz, 'vk-katman vk-yildiz-p'), sure, tasma);
  const noktaya = (e: PointerEvent): Nokta => { const r = sahne.getBoundingClientRect(); return { x: (e.clientX - r.left) / S, y: (e.clientY - r.top) / S }; };
  const ekrana = (p: Nokta): Nokta => { const r = sahne.getBoundingClientRect(); return { x: r.left + p.x * S, y: r.top + p.y * S }; };
  const ses = (ad: string, kazanc = 1, hiz = 1) => efekt(ad, kazanc, hiz);
  const soyle = (ad: string) => void konus(ad);

  let kanca: Kancalar | null = null;
  let asama = 'giris', calisiyor = true, son = performance.now(), geciste = false, sonOldu = false;
  let zipla: Animation | null = null, ziplamaTuru = 0, kinoSasirdi = 0;
  let kinoTepkiPozu: KinoPozu | null = null, kinoTepkiSonu = 0, kinoSimdi: KinoPozu = 'izler';

  // ——————————————————————————— masa
  const hub = el('div', 'vk-gorunum vk-hub');
  const H = ayar.hasta;
  const hastaY = yigin([...H.bekleme, H.kirp, ...H.sevinc, ...H.son], 'vk-katman vk-zipzip');
  koy(hastaY.kutu, H.kutu);
  const canta = el('button', 'vk-katman vk-canta'); canta.type = 'button'; canta.setAttribute('aria-label', 'Doktor çantası'); koy(canta, HUB.canta);
  const cantaY = yigin([ORTAK.cantaKapali, ORTAK.cantaAcik], 'vk-canta-resmi'); canta.append(cantaY.kutu);
  const cantaAletleri = ayar.cantaAletleri.slice(0, 4).map((ad, i) => { const r = resim(ad, 'vk-yuva-aleti'); const [x, y] = HUB.yuvalar[i]; ortala(r, { x, y }, HUB.yuvaBoyu[1], HUB.yuvaBoyu[1]); r.hidden = true; canta.append(r); return r; });
  const hubSerit = el('div', 'vk-katman vk-serit'); koy(hubSerit, HUB.serit);
  hubSerit.append(resim(ORTAK.serit));
  ayar.seritAletleri.slice(0, 3).forEach((ad, i) => { const r = resim(ad, 'vk-yuva-aleti'); const [x, y] = SERIT_YUVALARI[i]; ortala(r, { x, y }, SERIT_YUVA_BOYU[1] * 1.3, SERIT_YUVA_BOYU[1] * 1.3); hubSerit.append(r); });
  const hubYildiz = resim(ORTAK.yildiz, 'vk-yuva-aleti'); { const [x, y] = SERIT_YUVALARI[3]; ortala(hubYildiz, { x, y }, SERIT_YUVA_BOYU[1], SERIT_YUVA_BOYU[1]); } hubSerit.append(hubYildiz);
  const kinoY = kinoVar ? yigin(KINO, 'vk-katman vk-kino') : null;
  if (kinoY) koy(kinoY.kutu, HUB.kino);
  const hastaDugmesi = el('button', 'vk-katman vk-kol-dugmesi'); hastaDugmesi.type = 'button'; hastaDugmesi.setAttribute('aria-label', H.ad); ortala(hastaDugmesi, H.dokunma, H.dugme[0], H.dugme[1]); hastaDugmesi.hidden = true;
  const yagmurKati = el('div', 'vk-katman vk-yagmur');
  const hubYildizlari = yildizlar.havuz(yagmurKati, 40);
  hub.append(resim(ORTAK.hubFon, 'vk-fon'), hastaY.kutu, canta, hubSerit, ...(kinoY ? [kinoY.kutu] : []), hastaDugmesi, yagmurKati);
  kenarUzat(hub, [[cozulmus.get(ORTAK.hubFon), TAM]]);

  // ——————————————————————————— yakın plan (vakanın katmanları kurucuda fonun üstüne eklenir)
  const yakin = el('div', 'vk-gorunum vk-yakin vk-altta');
  const etkiKati = el('div', 'vk-katman vk-etki-kati');
  const dok = el('div', 'vk-katman vk-serit vk-dok'); koy(dok, YAKIN.serit);
  dok.append(resim(ORTAK.serit));
  const elKati = el('div', 'vk-katman vk-el');
  const kinoYakinY = kinoVar ? yigin(Object.values(KINO_POZLARI), 'vk-katman vk-kino-yakin') : null;
  if (kinoYakinY) koy(kinoYakinY.kutu, YAKIN.kino);
  yakin.append(resim(ayar.yakinFon, 'vk-fon'));
  const tekrar = el('button', 'vk-tekrar'); tekrar.style.width = tekrar.style.height = TEKRAR_BOYU + 'px'; tekrar.type = 'button'; tekrar.setAttribute('aria-label', 'Yeniden oyna'); tekrar.hidden = true;
  { const r = el('img', ''); r.src = TEKRAR_DUGMESI; r.alt = ''; r.draggable = false; tekrar.append(r); }
  sahne.append(hub, yakin, tekrar);
  kok.append(sahne);
  boyutla();

  // ——————————————————————————— yardımcılar
  function oynat(adlar: readonly string[], p: Nokta, g: number, h: number, ms: number, sec: { hedef?: HTMLElement; taban?: boolean; kay?: number; kayX?: number; don?: number; olcek?: number } = {}): Promise<void> {
    const r = resim(adlar[0], 'vk-katman vk-dizi');
    koy(r, { sol: p.x - g / 2, ust: sec.taban ? p.y - h : p.y - h / 2, g, y: h });
    (sec.hedef ?? etkiKati).append(r);
    const kx = sec.kayX ?? 0, ky = sec.kay ?? 0, d = sec.don ?? 0, o = sec.olcek ?? 1;
    const a = r.animate([
      { transform: `translate(0, 0) rotate(0deg) scale(${o})`, opacity: 1 },
      { transform: `translate(${kx}px, ${-ky}px) rotate(${d}deg) scale(${o})`, opacity: 1, offset: 0.8 },
      { transform: `translate(${kx * 1.15}px, ${-ky * 1.15}px) rotate(${d}deg) scale(${o})`, opacity: 0 },
    ], { duration: sure(ms * adlar.length), easing: 'linear', fill: 'forwards' });
    adlar.forEach((ad, i) => { if (i) setTimeout(() => { r.src = adres(ad) ?? ''; }, sure(ms * i)); });
    return a.finished.then(() => r.remove(), () => r.remove());
  }
  function parilti(p: Nokta, boy = 190, hedef: HTMLElement = etkiKati) {
    const r = resim(ORTAK.pof[1], 'vk-katman vk-pof'); ortala(r, p, boy, boy); hedef.append(r);
    void r.animate([{ transform: 'scale(.5)', opacity: 1 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: sure(380), easing: 'ease-out' }).finished.then(() => r.remove(), () => r.remove());
  }
  const yakinYildizlari = yildizlar.havuz(etkiKati, 14);
  function kinoTepki(poz: KinoPozu, ms = 700, px = 22) { kinoTepkiPozu = poz; kinoTepkiSonu = performance.now() + ms; hop(kinoYakinY?.kutu, px); }
  const dokDugmesi = (i: number, ad: string, etiket: string) => {
    const b = el('button', 'vk-dok-aleti'); b.type = 'button'; b.setAttribute('aria-label', etiket);
    const [x, y] = SERIT_YUVALARI[i]; ortala(b, { x, y }, DOK_ALET_BOYU, DOK_ALET_BOYU); b.append(resim(ad));
    dok.append(b);
    return b;
  };
  const aletler = new Map<string, { a: Alet; kutu: HTMLDivElement; golge: HTMLCanvasElement }>();
  const aletEkle = (ad: string, a: Alet, icerik: HTMLElement[], golgeCizimi: string) => {
    const k = el('div', 'vk-tutulan vk-bekler'); k.dataset.alet = ad;
    k.style.width = a.g + 'px'; k.style.height = a.y + 'px';
    k.append(...icerik);
    const golge = golgeYap(cozulmus.get(golgeCizimi)!, a.g, a.y);
    elKati.prepend(golge); elKati.append(k);
    aletler.set(ad, { a, kutu: k, golge });
    return k;
  };

  // ——————————————————————————— elde tutulan alet
  let tutulan: Tutulan | null = null;
  const ucNoktasi = (t: Tutulan, parmak = t.parmak): Nokta => ({ x: parmak.x - t.a.tut[0] * t.a.g + t.a.uc[0] * t.a.g, y: parmak.y - (t.a.kaldir ?? 40) - t.a.tut[1] * t.a.y + t.a.uc[1] * t.a.y });
  const ucaCiz = (t: Tutulan, uc: Nokta) => {
    const x = uc.x - t.a.uc[0] * t.a.g, y = uc.y - t.a.uc[1] * t.a.y, don = `rotate(${t.egim.toFixed(2)}deg) scale(${ELDE_OLCEK})`;
    t.kutu.style.transform = `translate3d(${x}px, ${y}px, 0) ${don}`;
    t.golge.style.transform = `translate3d(${x + 18}px, ${y + 32}px, 0) ${don}`;
  };
  const golgeSondur = (t: Tutulan) => { t.golge.getAnimations().forEach(c => c.cancel()); t.golge.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(150), fill: 'forwards' }); };
  function tut(kaynak: HTMLElement, ad: string, e: PointerEvent) {
    const k = aletler.get(ad)!;
    k.kutu.getAnimations().forEach(c => c.cancel());
    k.kutu.classList.remove('vk-bekler');
    const t: Tutulan = { ad, kaynak, kutu: k.kutu, a: k.a, parmak: noktaya(e), id: e.pointerId, golge: k.golge, egim: 0, once: noktaya(e), ucOnce: null };
    k.kutu.style.transformOrigin = `${k.a.uc[0] * 100}% ${k.a.uc[1] * 100}%`;
    k.golge.style.transformOrigin = k.kutu.style.transformOrigin;
    k.golge.getAnimations().forEach(c => c.cancel());
    k.golge.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(140), easing: 'ease-out', fill: 'forwards' });
    hop(kinoYakinY?.kutu, 8, 200);
    kaynak.classList.add('vk-kalkti');
    try { kaynak.setPointerCapture(e.pointerId); } catch { /* pencere olayları yeter */ }
    tutulan = t;
    ucaCiz(t, ucNoktasi(t));
    for (const c of k.kutu.children) {
      if (!(c instanceof HTMLElement) || c.classList.contains('vk-ic')) continue;
      c.style.transformOrigin = `${k.a.tut[0] * 100}% ${k.a.tut[1] * 100}%`;
      c.animate([{ transform: 'scale(.82)' }, { transform: 'scale(1)' }], { duration: sure(120), easing: 'cubic-bezier(.2,.8,.3,1.3)' });
    }
    ses('e-tik', 0.7, 1.2);
  }
  const bekleyeAl = (t: Tutulan) => {
    t.kaynak.classList.remove('vk-kalkti');
    if (tutulan && tutulan.kutu === t.kutu) return;
    t.kutu.getAnimations().forEach(c => c.cancel()); t.kutu.classList.add('vk-bekler');
  };
  function birak(t: Tutulan) {
    if (tutulan === t) tutulan = null;
    golgeSondur(t);
    const k = t.kaynak.getBoundingClientRect(), s = sahne.getBoundingClientRect();
    const hedef = { x: (k.left + k.width / 2 - s.left) / S, y: (k.top + k.height / 2 - s.top) / S };
    const bitir = () => bekleyeAl(t);
    if (!t.kaynak.isConnected || t.kaynak.hidden) { bitir(); return; }
    const ox = t.a.uc[0] * t.a.g, oy = t.a.uc[1] * t.a.y, kucuk = Math.min(1, (k.height / S) / t.a.y);
    void t.kutu.animate([{ transform: t.kutu.style.transform }, { transform: `translate3d(${hedef.x - ox - kucuk * (t.a.g / 2 - ox)}px, ${hedef.y - oy - kucuk * (t.a.y / 2 - oy)}px, 0) rotate(0deg) scale(${kucuk})` }],
      { duration: sure(190), easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }).finished.then(bitir, bitir);
  }
  async function yerineKoy(t: Tutulan, p: Nokta, kucuk = 1, ms = 220): Promise<void> {
    if (tutulan === t) tutulan = null;
    golgeSondur(t);
    const ox = t.a.uc[0] * t.a.g, oy = t.a.uc[1] * t.a.y;
    await t.kutu.animate([{ transform: t.kutu.style.transform }, { transform: `translate3d(${p.x - ox}px, ${p.y - oy}px, 0) rotate(0deg) scale(${kucuk})` }],
      { duration: sure(ms), easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }).finished.catch(() => undefined);
    bekleyeAl(t);
  }

  function asamaGec(a: string) {
    asama = a;
    kok.dataset.asama = a;
    for (const b of sahne.querySelectorAll('.vk-sirada')) b.classList.remove('vk-sirada');
    if (kanca) for (const b of kanca.siradaki()) b.classList.add('vk-sirada');
  }
  const yanlis = (b: HTMLElement) => { salla(b); ses('e-tik', 0.5, 0.8); kinoTepki('sasir', 450, 10); kanca?.siradaki().filter(x => x !== b).forEach(ziplat); };
  const hazirMi = (e: PointerEvent) => e.button === 0 && !tutulan && !geciste;
  const aletDugmesi = (kaynak: HTMLElement, ad: string, sirada: () => boolean, once?: () => void) => kaynak.addEventListener('pointerdown', e => {
    if (!hazirMi(e)) return;
    if (!sirada()) { yanlis(kaynak); return; }
    once?.();
    tut(kaynak, ad, e);
  });

  // ——————————————————————————— kapanış
  async function kutla() {
    if (!kanca) return;
    ses('e-cin');
    kinoTepki('sevin', 900, 28);
    yildizlar.sac(yakinYildizlari, kanca.kutlamaYeri, 9, 320, 76);
    await bekle(ayar.kapanis.parlama);
    await uzaklas();
    if (!calisiyor) return;
    const t0 = performance.now();
    hastaY.kutu.style.transformOrigin = '50% 62%';
    zipla = hastaY.kutu.animate(ZIPLAMA_KARELERI, { duration: ZIPLAMA_MS, iterations: Infinity });
    ziplamaTuru = 0;
    yildizlar.yagdir(hubYildizlari, 14);
    kinoY?.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-16px)', offset: 0.45 }, { transform: 'translateY(0)' }], { duration: 300, iterations: 2, easing: 'ease-in-out' });
    await bekle(100);
    const bas = { x: HUB.serit.sol + SERIT_YUVALARI[3][0], y: HUB.serit.ust + SERIT_YUVALARI[3][1] };
    hubYildiz.hidden = true;
    const y = resim(ORTAK.yildiz, 'vk-katman vk-ucan-yildiz'); ortala(y, H.gogus, 120, 120); hub.append(y);
    const dx = bas.x - H.gogus.x, dy = bas.y - H.gogus.y;
    await y.animate([{ transform: `translate(${dx}px, ${dy}px) scale(1.1) rotate(0deg)` }, { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 190}px) scale(1.7) rotate(200deg)`, offset: 0.55 }, { transform: 'translate(0, 0) scale(1) rotate(360deg)' }],
      { duration: sure(480), easing: 'cubic-bezier(.3,0,.4,1)' }).finished.catch(() => undefined);
    if (!calisiyor) return;
    ses('e-cin');
    parilti(H.gogus, 300, hub);
    await bekle(Math.max(0, ayar.kapanis.sevinc - (performance.now() - t0) - 300));
    if (!calisiyor) return;
    // son poz (şaka ya da son sevinç): zıplama durur
    sonOldu = true;
    zipla?.cancel(); zipla = null;
    hastaY.goster(H.son[0]);
    pop(hastaY.kutu, 240);
    kinoSasirdi = performance.now();
    hop(kinoY?.kutu, 20);
    const ilk = ayar.sozler.son ? konus(ayar.sozler.son) : Promise.resolve();
    if (ayar.sozler.sonSonra) { const s = ayar.sozler.sonSonra; void ilk.then(() => { if (calisiyor && sahne.isConnected) soyle(s); }); }
    await bekle(300);
    if (!calisiyor) return;
    asamaGec('son');
    tekrar.hidden = false;
    pop(tekrar, 300);
    secenek.bitince?.();
  }
  function inis(tur: number) {
    if (asama === 'son') { yildizlar.yagdir(hubYildizlari, 2); return; }
    ses('e-pat', 0.3, 0.8);
    if (tur % 2 === 0) ses('e-cin', 0.14, 1.1 + (tur % 6) * 0.06);
    yildizlar.yagdir(hubYildizlari, 5);
  }
  tekrar.addEventListener('click', () => { calisiyor = false; iptal.abort(); sus(); vakaBaslat(kok, yas, secenek, ayar, kurucu); });

  // ——————————————————————————— masa → yakın plan
  const kamera = (k: number) => {
    const y = H.yaklasma, t = (k - 1) / (y.olcek - 1);
    return `translate(${y.x + (SAHNE.g / 2 - y.x) * t - y.x * k}px, ${y.y + (SAHNE.y / 2 - y.y) * t - y.y * k}px) scale(${k})`;
  };
  async function yaklas() {
    if (geciste) return;
    geciste = true;
    hastaDugmesi.hidden = true;
    ses('e-vuu', 0.7);
    yakin.classList.remove('vk-altta');
    yakin.animate([{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], { duration: sure(430), easing: 'ease-in' });
    const asagi = `translateY(${Math.round(240 + tasma.dik)}px)`, dahaAsagi = `translateY(${Math.round(420 + tasma.dik)}px)`;
    dok.animate([{ transform: asagi }, { transform: asagi, offset: 0.6 }, { transform: 'translateY(0)' }], { duration: sure(620), easing: 'cubic-bezier(.2,.9,.3,1.15)' });
    kinoYakinY?.kutu.animate([{ transform: dahaAsagi }, { transform: dahaAsagi, offset: 0.55 }, { transform: 'translateY(0)' }], { duration: sure(700), easing: 'cubic-bezier(.2,.9,.3,1.15)' });
    await hub.animate([{ transform: kamera(1) }, { transform: kamera(H.yaklasma.olcek) }], { duration: sure(ayar.kapanis.kamera), easing: 'cubic-bezier(.5,0,.6,1)' }).finished.catch(() => undefined);
    hub.classList.add('vk-altta');
    geciste = false;
    kanca?.yaklasinca();
  }
  async function uzaklas() {
    geciste = true;
    ses('e-vuu', 0.7, 1.15);
    hub.classList.remove('vk-altta');
    hastaY.goster(H.sevinc[0]);
    void yakin.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(260), easing: 'ease-out', fill: 'forwards' });
    await hub.animate([{ transform: kamera(H.yaklasma.olcek) }, { transform: kamera(1) }], { duration: sure(ayar.kapanis.kamera), easing: 'cubic-bezier(.3,0,.3,1)' }).finished.catch(() => undefined);
    yakin.classList.add('vk-altta');
    geciste = false;
  }
  canta.addEventListener('pointerdown', () => {
    if (asama !== 'giris') return;
    asamaGec('canta');
    ses('e-cit');
    cantaY.goster(ORTAK.cantaAcik);
    canta.classList.add('vk-acik');
    canta.animate([{ transform: 'scale(.96)' }, { transform: 'scale(1.04)', offset: 0.55 }, { transform: 'scale(1)' }], { duration: sure(260), easing: 'ease-out' });
    cantaAletleri.forEach((r, i) => setTimeout(() => { r.hidden = false; pop(r); ses('e-tik', 0.8, 1 + i * 0.08); }, sure(140 + i * 95)));
    kinoSasirdi = performance.now();
    hop(kinoY?.kutu, 18);
    setTimeout(() => { soyle(ayar.sozler.canta); hastaDugmesi.hidden = false; }, sure(420));
    setTimeout(() => hop(kinoY?.kutu, 14, 220), sure(1150));
  });
  hastaDugmesi.addEventListener('pointerdown', () => { if (asama === 'canta') void yaklas(); });

  const I: Iskelet = {
    yas, kok, sahne, hub, yakin, etkiKati, elKati, dok, cozulmus, adres, resim, yigin, oynat, parilti,
    yildizSac: (p, adet = 7) => yildizlar.sac(yakinYildizlari, p, adet, 260, 60),
    ses, soyle, kinoTepki, kinoYakin: kinoYakinY?.kutu ?? null, dokDugmesi, aletEkle, aletDugmesi, yanlis, tut,
    tutulan: () => tutulan, ucNoktasi: t => ucNoktasi(t), birak, yerineKoy, asama: () => asama, asamaGec, kutla, calisiyor: () => calisiyor, noktaya, ekrana, iptal: iptal.signal,
  };
  const K: Kancalar = kurucu(I);
  kanca = K;
  // vakanın katmanları fonun üstünde; etkiler, Kino, şerit ve el en üstte
  yakin.append(etkiKati, ...(kinoYakinY ? [kinoYakinY.kutu] : []), dok, elKati);
  kenarUzat(yakin, [[cozulmus.get(ayar.yakinFon), TAM]]);

  const hareket = (e: PointerEvent) => { const t = tutulan; if (!t || e.pointerId !== t.id) return; t.parmak = noktaya(e); ucaCiz(t, ucNoktasi(t)); };
  const kalk = (e: PointerEvent) => { const t = tutulan; if (!t || e.pointerId !== t.id) return; if (K.kalkinca?.(t)) return; birak(t); };
  addEventListener('pointermove', hareket, { signal: iptal.signal });
  addEventListener('pointerup', kalk, { signal: iptal.signal });
  addEventListener('pointercancel', kalk, { signal: iptal.signal });
  // her dokunuşa anında karşılık: boş yere ya da karaktere dokununca parıltı ve "tık"; sıradaki iş kendini gösterir
  sahne.addEventListener('pointerdown', e => {
    if (e.button !== 0 || tutulan || geciste || (e.target as Element).closest('button')) return;
    const p = noktaya(e), yakinda = hub.classList.contains('vk-altta');
    const icinde = (k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
    ses('e-tik', 0.45, 1.35);
    parilti(p, 130, yakinda ? etkiKati : yagmurKati);
    if (yakinda) {
      if (kinoYakinY && icinde(YAKIN.kino)) { kinoTepki('sevin', 520, 20); return; }
      K.bosDokunus?.(p);
      const sira = K.siradaki();
      if (sira.length) { sira.forEach(ziplat); kinoTepki('sevin', 520, 12); }
    } else {
      if (kinoY && icinde(HUB.kino)) { kinoSasirdi = performance.now(); hop(kinoY.kutu, 18); return; }
      if (icinde(H.kutu) && asama !== 'kutlama' && asama !== 'son') hop(hastaY.kutu, 10, 220);
      if (asama === 'giris') salla(canta); else if (asama === 'canta' && !hastaDugmesi.hidden) ziplat(hastaDugmesi);
    }
  });

  // ——————————————————————————— kare döngüsü
  function kare(an: number) {
    if (!sahne.isConnected) { calisiyor = false; iptal.abort(); return; }
    if (!calisiyor) return;
    const dt = Math.min(64, an - son); son = an;
    if (!hub.classList.contains('vk-altta')) {
      if (sonOldu) hastaY.goster(H.son[Math.floor(an / 320) % H.son.length]);
      else if (asama === 'kutlama' || asama === 'son') {
        const zt = zipla && !TEST_MODU ? Number(zipla.currentTime ?? 0) : -1;
        hastaY.goster(H.sevinc[zt >= 0 ? ziplamaKaresi(zt) : sevincKaresi(an)]);
        if (zt >= 0) { const tur = Math.floor(zt / ZIPLAMA_MS); if (tur > ziplamaTuru) { ziplamaTuru = tur; inis(tur); } }
      } else { const k = beklemeKaresi(an); hastaY.goster(k === 'kirp' ? H.kirp : H.bekleme[k === 'a' ? 0 : 1]); }
      kinoY?.goster(kinoHub(an, asama, kinoSasirdi));
    }
    if (kinoYakinY) {
      if (an >= kinoTepkiSonu) kinoTepkiPozu = null;
      const kp = kinoYakinPozu({ tepki: kinoTepkiPozu, kilitli: false, mercekte: K.kinoSasirsin?.() ?? false });
      if (kp !== kinoSimdi) { if (!kinoTepkiPozu) hop(kinoYakinY.kutu, 10, 200); kinoSimdi = kp; kinoYakinY.goster(KINO_POZLARI[kp]); }
    }
    const h = tutulan;
    let uc: Nokta | null = null, yol = 0, hx = 0;
    if (h) {
      hx = (h.parmak.x - h.once.x) / Math.max(1, dt);
      h.once = h.parmak;
      const hedef = Math.max(-10, Math.min(10, hx * 9)), onceki = h.egim;
      h.egim += (hedef - h.egim) * Math.min(1, dt / 90);
      if (Math.abs(h.egim - onceki) > 0.01) ucaCiz(h, ucNoktasi(h));
      uc = ucNoktasi(h);
      yol = h.ucOnce ? Math.hypot(uc.x - h.ucOnce.x, uc.y - h.ucOnce.y) : 0;
    }
    K.kare(dt, an, h, uc, yol, hx);
    if (h && uc && tutulan === h) h.ucOnce = uc;
    requestAnimationFrame(kare);
  }

  asamaGec('giris');
  const dur = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
  let gorunduAni = 0;
  sahne.style.opacity = '0.01';
  yakin.classList.remove('vk-altta');
  void Promise.all([...sahne.querySelectorAll('img')].map(r => r.decode().catch(() => undefined)))
    .then(() => dur(TEST_MODU ? 30 : 240))
    .then(() => { yakin.classList.add('vk-altta'); return dur(TEST_MODU ? 30 : 200); })
    .then(() => { sahne.style.opacity = ''; gorunduAni = Date.now(); return new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))); })
    .then(() => {
      if (!calisiyor) return;
      kok.dataset.durum = 'hazir';
      setTimeout(() => soyle(ayar.sozler.giris), sure(350));
      setTimeout(() => { if (calisiyor && asama === 'giris') { salla(canta); hop(kinoY?.kutu, 16); ses('e-tik', 0.5, 1.2); } }, sure(260));
      requestAnimationFrame(t => { son = t; requestAnimationFrame(kare); });
    });

  // Test ve video kaydı için okuma (oyunun işleyişini değiştirmez): ?test ya da ?kayit ile. window.__<oyun>
  if (TEST_MODU || sorgu.has('kayit')) {
    const m = (e: Element) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    (window as unknown as Record<string, unknown>)['__' + ayar.oyun] = {
      asama: () => asama, gorunduAni: () => gorunduAni, olcek: () => S,
      uc: () => (tutulan ? ekrana(ucNoktasi(tutulan)) : null),
      ekrana: (p: Nokta) => ekrana(p),
      dugme: (secici: string) => { const e = sahne.querySelector(secici); return e ? m(e) : null; },
      canta: () => m(canta), hasta: () => ekrana(H.dokunma), tekrar: () => m(tekrar),
      ...(K.test ?? {}),
    };
  }
}

export { HUB, SAHNE, YAKIN, type Kutu, type Nokta, type Yas, type KinoPozu };
