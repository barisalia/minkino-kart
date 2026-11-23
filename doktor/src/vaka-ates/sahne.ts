// Minik Doktor · "Bulut'un Ateşi" (sekiz adım; veri.ts başındaki senaryo). Masa (yukarıdan) → çanta → Bulut'un yüzüne
// yakın plan: termometre (salla, alna tut: uç parlar, gösterge kırmızı) → bez (kâseye daldır: su taçlanıp sıçrar; kâsenin
// üstünde aşağı çekerek sık: bez burulur, su akar) → bezi yüze bastırıp gezdir (kızarıklık silinir, buhar halkaları yükselir,
// sıcak dalgası ve ter kaybolur) → pipetli bardak (Bulut yudum yudum içer, su azalır, kabarcıklar) → buz (küpler torbaya
// tek tek düşer, torba şişer ve çıtırdar, soğuk buğu tüter; kapak çevrilerek kapanır) → torba başa (Bulut ürperir) →
// yelpaze (rüzgâr akar, yün kabarır) → termometre yeniden (yeşil) → masada kutlama: torba şapka, "Ferahladım!".
// Çizimler Astra'dan (Paket Doktor-Y3, assets/doktor/ates/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
// Boyama kuralları öbür vakalarla aynı: iki görünüm de baştan çizili, pozlar üst üste boyalı, eldeki aletler baştan hazır.
import '../vaka/vaka.css';
import './ates.css';
import { TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { anaMenuyeDon } from '../../../src/uygulama';
import { efekt, konus, sesleriYukle, sus } from '../ses';
import { ZIPLAMA_KARELERI, golgeYap, kenarUzat, yildizEtkisi } from '../vaka/etki';
import { SuKatmani } from '../vaka/his';
import { cevirUyarisi } from '../vaka/sahne';
import { DOK_ALET_BOYU, ELDE_OLCEK, HUB, SECMELI, SERIT_YUVALARI, SERIT_YUVA_BOYU, TEKRAR_BOYU, YAKIN, ZIPLAMA_MS, alkisKaresi, beklemeKaresi, kinoYakinPozu, sahneOlcegi, sevincKaresi, ziplamaKaresi, type KinoPozu, type Kutu, type Nokta, type Yas } from '../vaka/veri';
import {
  ALETLER, ALIN_DUGMESI, ATES, ATES_DOSYALAR, BAS, BEZ_DAMLA, BEZ_YARICAPI, EFEKTLER, GOSTERGE, KAPANIS, KARE_MS, KASE, KEYIF_MS, KIKIR_MS, MASA, NORMAL_OKUMA, ORTAK, ORTAK_DOSYALAR, ORTAK_EFEKTLER,
  SAHNE, SASIR_MS, SERIN_MS, SILME_YOLU, SOZLER, TEPSI, TORBA, TORBA_DUGMESI, URPER_MS, YELPAZE_BEKLEME, YELPAZE_GENLIK, YUTKUN_MS, ZORLUK,
  agizdaMi, alindaMi, bardakKademesi, basPozu, bezAdimi, bezIsindiMi, burukKaresi, burundaMi, daldirAdimi, eskiOkuma, icAdimi, kapakAdimi, kapakBaslangici, kaseUstundeMi, kizariklikIzgarasi, kizariklikOrani,
  olcAdimi, sallaAdimi, sallaBaslangici, sikAdimi, sonrakiAsama, sudaMi, tepedeMi, torbaKademesi, torbayaMi, yelpazeYuzdeMi, yunKademesi, yuzdeMi,
  type AletAdi, type Asama, type BasPozu, type EfektAdi, type SozAdi,
} from './veri';

const TEKRAR_DUGMESI = new URL('../../../assets/hazirlik/dugmeler/tekrar.webp', import.meta.url).href;
import { cizimKlasoru } from '../vaka-kit/ortak';
const atesDosyalar = import.meta.glob<string>('../../../assets/doktor/ates/*.webp', { eager: true, query: '?url', import: 'default' });
const ortakDosyalar = import.meta.glob<string>('../../../assets/doktor/vaka/*.webp', { eager: true, query: '?url', import: 'default' });
const sorgu = new URLSearchParams(location.search);
/** Yalnız geliştirme sunucusunda: çizimler gelmeden mekaniği denemek için geçici klasörden okur (uygulamaya girmez). */
const TASLAK = import.meta.env.DEV && sorgu.has('taslak');
// kendi klasöründen; Dikenli Pati'nin klasöründen yalnız ortak parçalar ve Kino (vaka-kit/ortak.ts → cizimKlasoru)
const gercek = (ad: string): string | undefined => (cizimKlasoru(ad, 'ates') === 'vaka' ? ortakDosyalar[`../../../assets/doktor/vaka/${ad}.webp`] : atesDosyalar[`../../../assets/doktor/ates/${ad}.webp`]);
const adres = (ad: string): string | undefined => gercek(ad) ?? (TASLAK && ATES_DOSYALAR.includes(ad) ? `/output/doktor/ates-taslak/${ad}.png` : undefined);
export const eksikCizimler = (): string[] => [...(TASLAK ? [] : ATES_DOSYALAR), ...ORTAK_DOSYALAR].filter(ad => !gercek(ad));
const KINO = [SECMELI.kino.goster, SECMELI.kino.sasir, ...SECMELI.kino.alkis];
const KINO_VAR = KINO.every(ad => !!gercek(ad));
const KINO_POZLARI: Record<KinoPozu, string> = { izler: SECMELI.kino.alkis[1], sasir: SECMELI.kino.sasir, sevin: SECMELI.kino.goster };

const el = <K extends keyof HTMLElementTagNameMap>(etiket: K, sinif: string): HTMLElementTagNameMap[K] => { const e = document.createElement(etiket); e.className = sinif; return e; };
function resim(ad: string, sinif = ''): HTMLImageElement {
  const r = el('img', sinif);
  r.src = adres(ad) ?? ''; r.alt = ''; r.draggable = false; r.decoding = 'sync';
  return r;
}
const koy = (e: HTMLElement, k: Kutu) => { Object.assign(e.style, { left: k.sol + 'px', top: k.ust + 'px', width: k.g + 'px', height: k.y + 'px' }); };
const ortala = (e: HTMLElement, p: Nokta, g: number, y: number) => koy(e, { sol: p.x - g / 2, ust: p.y - y / 2, g, y });
const bekle = (ms: number) => new Promise<void>(r => setTimeout(r, TEST_MODU ? Math.min(ms, 30) : ms));
const sure = (ms: number) => (TEST_MODU ? 1 : ms);
const ses = (ad: EfektAdi | (typeof ORTAK_EFEKTLER)[number], kazanc = 1, hiz = 1) => efekt(ad, kazanc, hiz);
const soyle = (ad: SozAdi) => void konus(ad);
const pop = (e: HTMLElement, ms = 200) => e.animate([{ transform: 'scale(.6)' }, { transform: 'scale(1.12)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: sure(ms), easing: 'ease-out' });
const ziplat = (e: HTMLElement) => { e.animate([{ transform: 'scale(1) translateY(0)' }, { transform: 'scale(1.22) translateY(-14px)', offset: 0.4 }, { transform: 'scale(1) translateY(0)' }], { duration: sure(280), easing: 'ease-out' }); };
const hop = (e: HTMLElement | null | undefined, px = 20, ms = 260) => { e?.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-px}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(ms), easing: 'ease-out', composite: 'add' }); };
const salla = (e: HTMLElement) => e.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: sure(260) });
const titret = (e: HTMLElement) => e.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: sure(360), composite: 'add' });

/** Aynı yerde duran pozlar: hepsi baştan boyalı, görünmeyenler neredeyse saydam; değişim yalnız saydamlıktır. */
function yigin(adlar: readonly string[], sinif: string): { kutu: HTMLDivElement; goster: (ad: string) => void } {
  const kutu = el('div', sinif + ' vk-yigin');
  const kareler = new Map(adlar.map(ad => [ad, resim(ad)] as const));
  kutu.append(...kareler.values());
  let simdi = '';
  const goster = (ad: string) => {
    if (ad === simdi || !kareler.has(ad)) return;
    kareler.get(simdi)?.classList.remove('vk-gorunur');
    kareler.get(ad)!.classList.add('vk-gorunur');
    simdi = ad;
  };
  goster(adlar[0]);
  return { kutu, goster };
}

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  kok.replaceChildren();
  kok.dataset.oyun = 'ates';
  cevirUyarisi(kok);
  const geri = el('button', 'vk-geri'); geri.type = 'button'; geri.setAttribute('aria-label', 'Geri'); geri.innerHTML = IKON.geri;
  geri.addEventListener('click', () => anaMenuyeDon());
  kok.append(geri);
  const eksik = eksikCizimler();
  if (eksik.length) { kok.dataset.durum = 'eksik'; kok.dataset.eksik = String(eksik.length); console.info('Ateş vakası: ' + eksik.length + ' çizim bekleniyor (Paket Doktor-Y3):', eksik.join(', ')); return; }
  kok.dataset.durum = 'yukleniyor';
  const adlar = [...ATES_DOSYALAR, ...ORTAK_DOSYALAR];
  const hepsi = adlar.map(ad => { const r = new Image(); r.src = adres(ad)!; return r.decode().catch(() => undefined).then(() => r); });
  void Promise.all([Promise.all(hepsi), sesleriYukle([...Object.keys(SOZLER), ...EFEKTLER, ...ORTAK_EFEKTLER])]).then(([resimler]) => kur(kok, yas, secenek, new Map(adlar.map((ad, i) => [ad, resimler[i]]))));
}

function kur(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void }, cozulmus: Map<string, HTMLImageElement>) {
  const Z = ZORLUK[yas];
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

  // ——————————————————————————— durum
  let asama: Asama = 'giris';
  let calisiyor = true, son = performance.now(), geciste = false;
  let sallama = sallaBaslangici(), olc = 0, olc2 = 0, daldir = 0, sik = 0, bezTuru = 1, ic = 0, buzSayisi = 0, kapak = kapakBaslangici(), torbaBasta = false, yelpaze = sallaBaslangici(), yun = 0;
  const iz = kizariklikIzgarasi();
  const yanakSerin = [false, false];
  let kikirKalan = 0, serinKalan = 0, urperKalan = 0, sasirKalan = 0, keyifKalan = 0, yutkunKalan = 0;
  let sesAni = 0, halkaAni = 0, damlaAni = 0, burunAni = 0, buharYolu = 0, buharAdimi = 0, buharAni = 0, asagiAni = 0, soguAni = 0, parAni = 0, pipetBurunAni = 0, yudumAni = 0;
  let suIcinde = false, serinSoylendi = false, kikirSoylendi = false, ruzgarSoylendi = false, brrAni = 0, kapakCeyrek = 0, kapakId: number | null = null, iciyor = false, olcuyor = false;
  let zipla: Animation | null = null, ziplamaTuru = 0, ferahOldu = false;
  let kinoTepkiPozu: KinoPozu | null = null, kinoTepkiSonu = 0, kinoSimdi: KinoPozu = 'izler', kinoSasirdi = 0;

  // ——————————————————————————— masa
  const hub = el('div', 'vk-gorunum vk-hub');
  const bulutY = yigin([...ATES.uzgun, ATES.uzgunKirp, ...ATES.sevinc, ATES.ferah], 'vk-katman vk-zipzip');
  koy(bulutY.kutu, MASA.bulut);
  const canta = el('button', 'vk-katman vk-canta'); canta.type = 'button'; canta.setAttribute('aria-label', 'Doktor çantası'); koy(canta, HUB.canta);
  const cantaY = yigin([ORTAK.cantaKapali, ORTAK.cantaAcik], 'vk-canta-resmi'); canta.append(cantaY.kutu);
  const cantaAletleri = [ATES.termometre, ATES.bezKuru, ATES.torba[0], ATES.yelpazeKapali].map((ad, i) => {
    const r = resim(ad, 'vk-yuva-aleti');
    const [x, y] = HUB.yuvalar[i];
    ortala(r, { x, y }, HUB.yuvaBoyu[1], HUB.yuvaBoyu[1]);
    r.hidden = true;
    canta.append(r);
    return r;
  });
  const hubSerit = el('div', 'vk-katman vk-serit'); koy(hubSerit, HUB.serit);
  hubSerit.append(resim(ORTAK.serit));
  [ATES.termometre, ATES.bezKuru, ATES.torba[0]].forEach((ad, i) => { const r = resim(ad, 'vk-yuva-aleti'); const [x, y] = SERIT_YUVALARI[i]; ortala(r, { x, y }, SERIT_YUVA_BOYU[1] * 1.3, SERIT_YUVA_BOYU[1] * 1.3); hubSerit.append(r); });
  const hubYildiz = resim(ORTAK.yildiz, 'vk-yuva-aleti'); { const [x, y] = SERIT_YUVALARI[3]; ortala(hubYildiz, { x, y }, SERIT_YUVA_BOYU[1], SERIT_YUVA_BOYU[1]); } hubSerit.append(hubYildiz);
  const kinoY = KINO_VAR ? yigin(KINO, 'vk-katman vk-kino') : null;
  if (kinoY) koy(kinoY.kutu, HUB.kino);
  const alinDugmesi = el('button', 'vk-katman vk-kol-dugmesi'); alinDugmesi.type = 'button'; alinDugmesi.setAttribute('aria-label', 'Bulut\'un alnı'); ortala(alinDugmesi, MASA.alin, ALIN_DUGMESI[0], ALIN_DUGMESI[1]); alinDugmesi.hidden = true;
  const yagmurKati = el('div', 'vk-katman vk-yagmur');
  const hubYildizlari = yildizlar.havuz(yagmurKati, 40);
  hub.append(resim(ORTAK.hubFon, 'vk-fon'), bulutY.kutu, canta, hubSerit, ...(kinoY ? [kinoY.kutu] : []), alinDugmesi, yagmurKati);
  kenarUzat(hub, [[cozulmus.get(ORTAK.hubFon), TAM]]);

  // ——————————————————————————— yakın plan
  const yakin = el('div', 'vk-gorunum vk-yakin vk-altta');
  const kase = resim(ATES.kase, 'vk-katman at-kase'); koy(kase, KASE.kutu);
  const basY = yigin(Object.values(ATES.bas), 'vk-fon at-bas');
  // kabaran yün: üç kademe üst üste, yalnız şimdiki kademe görünür
  const yunY = yigin(ATES.yun, 'vk-fon at-yun');
  yunY.kutu.classList.add('at-yun-yok');
  // yanakların kızarıklığı: başın üstünde bir tuval; bez geçtikçe silinir
  const kiz = el('canvas', 'vk-fon at-kizariklik'); kiz.width = SAHNE.g / 2; kiz.height = SAHNE.y / 2;
  const kzg = kiz.getContext('2d')!;
  kzg.drawImage(cozulmus.get(ATES.kizariklik)!, 0, 0, kiz.width, kiz.height);
  kzg.globalCompositeOperation = 'destination-out';
  const kizSil = (p: Nokta, yaricap: number, guc: number) => {
    const g = kzg.createRadialGradient(p.x / 2, p.y / 2, yaricap * 0.15, p.x / 2, p.y / 2, yaricap / 2);
    g.addColorStop(0, `rgba(0,0,0,${Math.min(1, guc).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    kzg.fillStyle = g; kzg.beginPath(); kzg.arc(p.x / 2, p.y / 2, yaricap / 2, 0, Math.PI * 2); kzg.fill();
  };
  kizSil({ x: 4, y: 4 }, 6, 0.5);
  const ter = resim(ATES.ter, 'vk-fon at-ter');
  const isi = resim(ATES.isiDalgasi, 'vk-katman at-isi'); ortala(isi, BAS.isi, 600, 300);
  const alinBezi = resim(ATES.bezAlinda, 'vk-katman at-alin-bezi'); ortala(alinBezi, BAS.bez, 600, 360);
  const bastakiTorba = resim(ATES.torbaKapali, 'vk-katman at-bastaki-torba'); ortala(bastakiTorba, BAS.tepe, 320, 320);
  const etkiKati = el('div', 'vk-katman at-etki');
  const su = new SuKatmani(cozulmus.get(ATES.damla));
  const damlaHavuzu: HTMLImageElement[] = Array.from({ length: 16 }, () => { const r = resim(ATES.damla, 'vk-katman at-damla'); etkiKati.append(r); return r; });
  // buz torbası: beş şişkinlik kademesi ve kapalı hâli üst üste
  const torbaKutu = el('div', 'vk-katman at-torba'); ortala(torbaKutu, TORBA.merkez, TORBA.boy, TORBA.boy);
  const torbaY = yigin([...ATES.torba, ATES.torbaKapali], 'at-torba-yigin');
  torbaKutu.append(torbaY.kutu);
  torbaKutu.hidden = true;
  const kapakResmi = resim(ATES.kapak, 'vk-katman at-kapak'); ortala(kapakResmi, TORBA.agiz, TORBA.kapakBoyu, TORBA.kapakBoyu); kapakResmi.hidden = true;
  const torbaDugmesi = el('button', 'vk-katman at-torba-dugmesi'); torbaDugmesi.type = 'button'; torbaDugmesi.setAttribute('aria-label', 'Buz torbası'); ortala(torbaDugmesi, TORBA.merkez, TORBA_DUGMESI, TORBA_DUGMESI); torbaDugmesi.hidden = true;
  const kupler = TEPSI.kupler.slice(0, Z.buz).map((p, i) => {
    const b = el('button', 'vk-katman at-kup'); b.type = 'button'; b.setAttribute('aria-label', 'Buz küpü ' + (i + 1));
    ortala(b, p, TEPSI.dugme, TEPSI.dugme);
    const r = resim(ATES.buz[i % ATES.buz.length]); r.style.rotate = [8, -12, 15, -5][i] + 'deg'; b.append(r);
    return b;
  });
  // alet şeridi: termometre, bez (alına konunca yerine bardak), buz torbası, yelpaze
  const dok = el('div', 'vk-katman vk-serit vk-dok'); koy(dok, YAKIN.serit);
  dok.append(resim(ORTAK.serit));
  const dokDugmesi = (ad: string, etiket: string, i: number) => {
    const b = el('button', 'vk-dok-aleti'); b.type = 'button'; b.setAttribute('aria-label', etiket);
    const [x, y] = SERIT_YUVALARI[i]; ortala(b, { x, y }, DOK_ALET_BOYU, DOK_ALET_BOYU); b.append(resim(ad));
    dok.append(b);
    return b;
  };
  const dokTermometre = dokDugmesi(ATES.termometre, 'Termometre', 0);
  const dokBez = dokDugmesi(ATES.bezKuru, 'Serin bez', 1);
  const dokBardak = dokDugmesi(ATES.bardak[0], 'Su bardağı', 1); dokBardak.hidden = true;
  const dokTorba = dokDugmesi(ATES.torba[0], 'Buz torbası', 2);
  const dokYelpaze = dokDugmesi(ATES.yelpazeKapali, 'Yelpaze', 3);
  const elKati = el('div', 'vk-katman vk-el');
  interface Tutulan { alet: AletAdi; kaynak: HTMLElement; kutu: HTMLDivElement; g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir: number; parmak: Nokta; id: number;
    golge?: HTMLCanvasElement; egim: number; once: Nokta; ucOnce: Nokta | null; }
  const hazirla = (alet: AletAdi, ...icerik: HTMLElement[]): HTMLDivElement => {
    const k = el('div', 'vk-tutulan vk-bekler'); k.dataset.alet = alet;
    k.style.width = ALETLER[alet].g + 'px'; k.style.height = ALETLER[alet].y + 'px';
    k.append(...icerik);
    elKati.append(k);
    return k;
  };
  /** eldeki aletin içinde, çizim tuvalinin (600 × 600) bir noktasına ortalanmış küçük katman */
  const icKatman = (alet: AletAdi, ad: string, x: number, y: number, g: number, h: number, sinif: string) => {
    const o = ALETLER[alet].g / 600, r = resim(ad, sinif);
    Object.assign(r.style, { left: (x - g / 2) * o + 'px', top: (y - h / 2) * o + 'px', width: g * o + 'px', height: h * o + 'px' });
    return r;
  };
  // termometre: düz ve iki sallanma karesi; gösterge (kırmızı, yeşil); uçta parlayan ışık
  const gosterge = el('div', 'at-gosterge');
  { const o = ALETLER.termometre.g / 600; koy(gosterge, { sol: GOSTERGE.sol * o, ust: GOSTERGE.ust * o, g: GOSTERGE.g * o, y: GOSTERGE.y * o }); }
  const kirmizi = resim(ATES.gostergeKirmizi), yesil = resim(ATES.gostergeYesil);
  gosterge.append(yesil, kirmizi);
  const seviye = (r: HTMLElement, o: number) => { r.style.clipPath = `inset(${((1 - Math.max(0, Math.min(1, o))) * 100).toFixed(1)}% 0 0 0)`; };
  seviye(yesil, eskiOkuma(0, Z.salla > 0 ? 1 : 0)); seviye(kirmizi, 0);
  const termometreY = yigin([ATES.termometre, ...ATES.termometreSalla], 'at-alet-yigin');
  const isik = icKatman('termometre', ATES.termometreIsik[0], 300, 60, 200, 200, 'at-isik');
  let isikKaresi = 0;
  // bardak: dört su kademesi; içerken pipetin dibinden kabarcık
  const bardakY = yigin(ATES.bardak, 'at-alet-yigin');
  const kabarcik = icKatman('bardak', ATES.kabarcik[0], 300, 400, 160, 240, 'at-kabarcik');
  let kabarcikKaresi = 0;
  const bezY = yigin([ATES.bezKuru, ATES.bezIslak, ...ATES.bezBuruk], 'at-alet-yigin');
  const yelpazeY = yigin([ATES.yelpazeAcik, ATES.yelpazeEgik], 'at-alet-yigin');
  const buzResmi = resim(ATES.buz[0]);
  const hazirKutu: Record<AletAdi, HTMLDivElement> = {
    termometre: hazirla('termometre', termometreY.kutu, gosterge, isik),
    bez: hazirla('bez', bezY.kutu),
    bardak: hazirla('bardak', bardakY.kutu, kabarcik),
    buz: hazirla('buz', buzResmi),
    torba: hazirla('torba', resim(ATES.torbaKapali)),
    yelpaze: hazirla('yelpaze', yelpazeY.kutu),
  };
  const golgeler: Record<AletAdi, HTMLCanvasElement> = {
    termometre: golgeYap(cozulmus.get(ATES.termometre)!, ALETLER.termometre.g, ALETLER.termometre.y),
    bez: golgeYap(cozulmus.get(ATES.bezIslak)!, ALETLER.bez.g, ALETLER.bez.y),
    bardak: golgeYap(cozulmus.get(ATES.bardak[0])!, ALETLER.bardak.g, ALETLER.bardak.y),
    buz: golgeYap(cozulmus.get(ATES.buz[0])!, ALETLER.buz.g, ALETLER.buz.y),
    torba: golgeYap(cozulmus.get(ATES.torbaKapali)!, ALETLER.torba.g, ALETLER.torba.y),
    yelpaze: golgeYap(cozulmus.get(ATES.yelpazeAcik)!, ALETLER.yelpaze.g, ALETLER.yelpaze.y),
  };
  elKati.prepend(...Object.values(golgeler));
  const kinoYakinY = KINO_VAR ? yigin(Object.values(KINO_POZLARI), 'vk-katman vk-kino-yakin') : null;
  if (kinoYakinY) koy(kinoYakinY.kutu, YAKIN.kino);
  function kinoTepki(poz: KinoPozu, ms = 700, px = 22) {
    kinoTepkiPozu = poz; kinoTepkiSonu = performance.now() + ms;
    hop(kinoYakinY?.kutu, px);
  }
  yakin.append(resim(ATES.fon, 'vk-fon'), kase, basY.kutu, kiz, ter, yunY.kutu, isi, alinBezi, bastakiTorba, su.tuval, torbaKutu, kapakResmi, ...kupler, torbaDugmesi, etkiKati,
    ...(kinoYakinY ? [kinoYakinY.kutu] : []), dok, elKati);
  kenarUzat(yakin, [[cozulmus.get(ATES.fon), TAM]]);

  const tekrar = el('button', 'vk-tekrar'); tekrar.style.width = tekrar.style.height = TEKRAR_BOYU + 'px'; tekrar.type = 'button'; tekrar.setAttribute('aria-label', 'Yeniden oyna'); tekrar.hidden = true;
  { const r = el('img', ''); r.src = TEKRAR_DUGMESI; r.alt = ''; r.draggable = false; tekrar.append(r); }
  sahne.append(hub, yakin, tekrar);
  kok.append(sahne);
  boyutla();

  // ——————————————————————————— etkiler (yalnız Astra'nın çizimlerini canlandırır)
  /**
   * Kare dizisi: p'de (merkez ya da `taban` ile tabanın ortası) bir kez oynatılır; kareler sırayla değişir, sonda söner.
   * kay / kayX: dizi boyunca kayma (buhar, buğu, rüzgâr); don: dönüş (derece).
   */
  function oynat(adlar: readonly string[], p: Nokta, g: number, h: number, ms: number, sec: { hedef?: HTMLElement; taban?: boolean; kay?: number; kayX?: number; don?: number } = {}): Promise<void> {
    const r = resim(adlar[0], 'vk-katman at-dizi');
    koy(r, { sol: p.x - g / 2, ust: sec.taban ? p.y - h : p.y - h / 2, g, y: h });
    (sec.hedef ?? etkiKati).append(r);
    const kx = sec.kayX ?? 0, ky = sec.kay ?? 0, d = sec.don ?? 0;
    const a = r.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${kx}px, ${-ky}px) rotate(${d}deg)`, opacity: 1, offset: 0.8 },
      { transform: `translate(${kx * 1.15}px, ${-ky * 1.15}px) rotate(${d}deg)`, opacity: 0 },
    ], { duration: sure(ms * adlar.length), easing: 'linear', fill: 'forwards' });
    adlar.forEach((ad, i) => { if (i) setTimeout(() => { r.src = adres(ad) ?? ''; }, sure(ms * i)); });
    return a.finished.then(() => r.remove(), () => r.remove());
  }
  function parilti(p: Nokta, boy = 190, hedef: HTMLElement = etkiKati) {
    const r = resim(ORTAK.pof[1], 'vk-katman vk-pof'); ortala(r, p, boy, boy); hedef.append(r);
    void r.animate([{ transform: 'scale(.5)', opacity: 1 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: sure(380), easing: 'ease-out' }).finished.then(() => r.remove(), () => r.remove());
  }
  const halka = (p: Nokta = KASE.yuz, olcek = 1) => oynat(ATES.suHalkasi, p, 300 * olcek, 100 * olcek, KARE_MS.halka);
  const sicrat = (p: Nokta = KASE.yuz, olcek = 1) => oynat(ATES.sicrama, p, 300 * olcek, 300 * olcek, KARE_MS.sicrama, { taban: true });
  function damlaSac(p: Nokta, adet: number, guc = 1) {
    for (let i = 0; i < adet; i++) {
      const r = damlaHavuzu.pop(); if (!r) return;
      const vx = (Math.random() - 0.5) * 340 * guc, yuk = (120 + Math.random() * 160) * guc, k = 0.6 + Math.random() * 0.6;
      const yer = (x: number, y: number, s: number, a: number) => `translate(${(p.x + x - 30).toFixed(1)}px, ${(p.y + y - 40).toFixed(1)}px) rotate(${a.toFixed(0)}deg) scale(${s.toFixed(2)})`;
      const geri = () => { damlaHavuzu.push(r); };
      void r.animate([
        { transform: yer(0, 0, k * 0.4, 0), opacity: 1 },
        { transform: yer(vx * 0.55, -yuk, k, vx * 0.08), opacity: 1, offset: 0.45 },
        { transform: yer(vx, 40, k * 0.8, vx * 0.15), opacity: 0 },
      ], { duration: sure(480 + Math.random() * 160), easing: 'cubic-bezier(.2,.7,.5,1)' }).finished.then(geri, geri);
    }
  }
  function damlaDusur(a: Nokta, b: Nokta): Promise<void> {
    const r = damlaHavuzu.pop();
    if (!r) return Promise.resolve();
    const yer = (p: Nokta, s: number) => `translate(${(p.x - 30).toFixed(1)}px, ${(p.y - 40).toFixed(1)}px) scale(${s})`;
    const geri = () => { damlaHavuzu.push(r); };
    return r.animate([{ transform: yer(a, 0.5), opacity: 1 }, { transform: yer(a, 0.8), opacity: 1, offset: 0.25 }, { transform: yer(b, 0.9), opacity: 1 }],
      { duration: sure(380), easing: 'cubic-bezier(.55,0,1,.6)' }).finished.then(geri, geri);
  }
  /** bezden yükselen buhar halkası (beş kare, yukarı süzülür) */
  const buharCikar = (p: Nokta, olcek = 1) => oynat(ATES.buhar, p, 200 * olcek, 300 * olcek, KARE_MS.buhar, { taban: true, kay: 160 * olcek, kayX: (Math.random() - 0.5) * 60 });
  /** torbadan tüten soğuk buğu */
  const buguCikar = (p: Nokta, olcek = 1) => oynat(ATES.soguk, p, 300 * olcek, 300 * olcek, KARE_MS.soguk, { taban: true, kay: 90 * olcek, kayX: (Math.random() - 0.5) * 50 });
  /** yığındaki (tutulan alet içindeki) bir resmin karesini değiştirir */
  const kareYap = (r: HTMLImageElement, ad: string) => { const a = adres(ad) ?? ''; if (r.getAttribute('src') !== a) r.src = a; };

  function asamaGec(a: Asama) {
    asama = a;
    kok.dataset.asama = a;
    dokTermometre.classList.toggle('vk-sirada', a === 'salla' || a === 'olc' || a === 'olc2');
    dokBez.classList.toggle('vk-sirada', a === 'daldir' || a === 'sik' || a === 'bez');
    dokBardak.classList.toggle('vk-sirada', a === 'ic');
    kupler.forEach(k => k.classList.toggle('vk-sirada', a === 'buz'));
    torbaKutu.classList.toggle('vk-sirada', a === 'kapat' || a === 'koy');
    dokYelpaze.classList.toggle('vk-sirada', a === 'yelpaze');
  }
  const ilerle = () => asamaGec(sonrakiAsama(yas, asama));

  // ——————————————————————————— masa
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
    setTimeout(() => { soyle('b-canta'); alinDugmesi.hidden = false; }, sure(420));
    setTimeout(() => hop(kinoY?.kutu, 14, 220), sure(1150));
  });
  alinDugmesi.addEventListener('pointerdown', () => { if (asama === 'canta') void yaklas(); });

  const kamera = (k: number) => {
    const y = MASA.yaklasma, t = (k - 1) / (y.olcek - 1);
    return `translate(${y.x + (SAHNE.g / 2 - y.x) * t - y.x * k}px, ${y.y + (SAHNE.y / 2 - y.y) * t - y.y * k}px) scale(${k})`;
  };
  async function yaklas() {
    if (geciste) return;
    geciste = true;
    alinDugmesi.hidden = true;
    ses('e-vuu', 0.7);
    yakin.classList.remove('vk-altta');
    yakin.animate([{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], { duration: sure(430), easing: 'ease-in' });
    const asagi = `translateY(${Math.round(240 + tasma.dik)}px)`, dahaAsagi = `translateY(${Math.round(420 + tasma.dik)}px)`;
    dok.animate([{ transform: asagi }, { transform: asagi, offset: 0.6 }, { transform: 'translateY(0)' }], { duration: sure(620), easing: 'cubic-bezier(.2,.9,.3,1.15)' });
    kinoYakinY?.kutu.animate([{ transform: dahaAsagi }, { transform: dahaAsagi, offset: 0.55 }, { transform: 'translateY(0)' }], { duration: sure(700), easing: 'cubic-bezier(.2,.9,.3,1.15)' });
    await hub.animate([{ transform: kamera(1) }, { transform: kamera(MASA.yaklasma.olcek) }], { duration: sure(KAPANIS.kamera), easing: 'cubic-bezier(.5,0,.6,1)' }).finished.catch(() => undefined);
    hub.classList.add('vk-altta');
    geciste = false;
    ilerle();
  }
  async function uzaklas() {
    geciste = true;
    ses('e-vuu', 0.7, 1.15);
    hub.classList.remove('vk-altta');
    bulutY.goster(ATES.sevinc[0]);
    void yakin.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(260), easing: 'ease-out', fill: 'forwards' });
    await hub.animate([{ transform: kamera(MASA.yaklasma.olcek) }, { transform: kamera(1) }], { duration: sure(KAPANIS.kamera), easing: 'cubic-bezier(.3,0,.3,1)' }).finished.catch(() => undefined);
    yakin.classList.add('vk-altta');
    geciste = false;
  }

  // ——————————————————————————— elde tutulan alet
  let tutulan: Tutulan | null = null;
  const ucNoktasi = (t: Tutulan, parmak = t.parmak): Nokta => ({ x: parmak.x - t.tut[0] * t.g + t.uc[0] * t.g, y: parmak.y - t.kaldir - t.tut[1] * t.y + t.uc[1] * t.y });
  const damlaNoktasi = (t: Tutulan): Nokta => { const u = ucNoktasi(t); return { x: u.x + (BEZ_DAMLA[0] - t.uc[0]) * t.g * ELDE_OLCEK, y: u.y + (BEZ_DAMLA[1] - t.uc[1]) * t.y * ELDE_OLCEK }; };
  const ucaCiz = (t: Tutulan, uc: Nokta) => {
    const x = uc.x - t.uc[0] * t.g, y = uc.y - t.uc[1] * t.y, don = `rotate(${t.egim.toFixed(2)}deg) scale(${ELDE_OLCEK})`;
    t.kutu.style.transform = `translate3d(${x}px, ${y}px, 0) ${don}`;
    if (t.golge) t.golge.style.transform = `translate3d(${x + 18}px, ${y + 32}px, 0) ${don}`;
  };
  const golgeSondur = (t: Tutulan) => { const g = t.golge; if (!g) return; g.getAnimations().forEach(c => c.cancel()); g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(150), fill: 'forwards' }); };
  function tut(kaynak: HTMLElement, alet: AletAdi, e: PointerEvent) {
    const a = ALETLER[alet], kutu = hazirKutu[alet];
    kutu.getAnimations().forEach(c => c.cancel());
    kutu.classList.remove('vk-bekler');
    const t: Tutulan = { alet, kaynak, kutu, g: a.g, y: a.y, tut: a.tut, uc: a.uc, kaldir: alet === 'buz' ? 70 : 40, parmak: noktaya(e), id: e.pointerId, egim: 0, once: noktaya(e), ucOnce: null };
    kutu.style.transformOrigin = `${a.uc[0] * 100}% ${a.uc[1] * 100}%`;
    const golge = golgeler[alet];
    golge.style.transformOrigin = kutu.style.transformOrigin;
    golge.getAnimations().forEach(c => c.cancel());
    golge.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(140), easing: 'ease-out', fill: 'forwards' });
    t.golge = golge;
    hop(kinoYakinY?.kutu, 8, 200);
    kaynak.classList.add(kaynak === torbaDugmesi ? 'at-kalkti' : 'vk-kalkti');
    if (kaynak === torbaDugmesi) torbaKutu.classList.add('at-kalkti');
    try { kaynak.setPointerCapture(e.pointerId); } catch { /* pencere olayları yeter */ }
    tutulan = t;
    ucaCiz(t, ucNoktasi(t));
    for (const c of kutu.children) {
      if (!(c instanceof HTMLElement) || c === isik || c === kabarcik || c === gosterge) continue;
      c.style.transformOrigin = `${a.tut[0] * 100}% ${a.tut[1] * 100}%`;
      c.animate([{ transform: 'scale(.82)' }, { transform: 'scale(1)' }], { duration: sure(120), easing: 'cubic-bezier(.2,.8,.3,1.3)' });
    }
    if (alet === 'yelpaze') { ses('a-yelpaze', 0.5, 1.2); yelpaze = { ...yelpaze, uc: null, tepe: null, yon: 0 }; }
    else ses(alet === 'buz' ? 'a-buz' : 'e-tik', alet === 'buz' ? 0.5 : 0.7, 1.2);
  }
  const kaldir = (t: Tutulan) => {
    if (tutulan === t) tutulan = null;
    golgeSondur(t);
    if (t.alet === 'bez') su.kes();
    iciyor = false; olcuyor = false;
    isik.classList.remove('at-yaniyor'); kabarcik.classList.remove('at-yaniyor');
  };
  const bekleyeAl = (t: Tutulan) => {
    t.kaynak.classList.remove('vk-kalkti', 'at-kalkti');
    if (t.kaynak === torbaDugmesi) torbaKutu.classList.remove('at-kalkti');
    if (tutulan && tutulan.kutu === t.kutu) return;
    t.kutu.getAnimations().forEach(c => c.cancel()); t.kutu.classList.add('vk-bekler');
  };
  function birak(t: Tutulan) {
    kaldir(t);
    const k = t.kaynak.getBoundingClientRect(), s = sahne.getBoundingClientRect();
    const hedef = { x: (k.left + k.width / 2 - s.left) / S, y: (k.top + k.height / 2 - s.top) / S };
    const bitir = () => bekleyeAl(t);
    if (!t.kaynak.isConnected || t.kaynak.hidden) { bitir(); return; }
    const ox = t.uc[0] * t.g, oy = t.uc[1] * t.y, kucuk = Math.min(1, (k.height / S) / t.y);
    void t.kutu.animate([{ transform: t.kutu.style.transform }, { transform: `translate3d(${hedef.x - ox - kucuk * (t.g / 2 - ox)}px, ${hedef.y - oy - kucuk * (t.y / 2 - oy)}px, 0) rotate(0deg) scale(${kucuk})` }],
      { duration: sure(190), easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }).finished.then(bitir, bitir);
  }
  async function yerineKoy(t: Tutulan, p: Nokta, kucuk = 1, ms = 220): Promise<void> {
    kaldir(t);
    const ox = t.uc[0] * t.g, oy = t.uc[1] * t.y;
    await t.kutu.animate([{ transform: t.kutu.style.transform }, { transform: `translate3d(${p.x - ox}px, ${p.y - oy}px, 0) rotate(0deg) scale(${kucuk})` }],
      { duration: sure(ms), easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }).finished.catch(() => undefined);
    bekleyeAl(t);
  }
  const siradaki = (): HTMLElement[] => {
    if (asama === 'salla' || asama === 'olc' || asama === 'olc2') return [dokTermometre];
    if (asama === 'daldir' || asama === 'sik' || asama === 'bez') return [dokBez];
    if (asama === 'ic') return [dokBardak];
    if (asama === 'buz') return kupler.filter(k => !k.hidden);
    if (asama === 'kapat' || asama === 'koy') return [torbaKutu];
    if (asama === 'yelpaze') return [dokYelpaze];
    return [];
  };
  const yanlis = (b: HTMLElement) => { salla(b); ses('e-tik', 0.5, 0.8); kinoTepki('sasir', 450, 10); siradaki().filter(x => x !== b).forEach(ziplat); };
  const hazirMi = (e: PointerEvent) => e.button === 0 && !tutulan && !geciste;
  const aletDugmesi = (b: HTMLElement, alet: AletAdi, sira: (a: Asama) => boolean, once?: () => void) => b.addEventListener('pointerdown', e => {
    if (!hazirMi(e)) return;
    if (!sira(asama)) { yanlis(b); return; }
    once?.();
    tut(b, alet, e);
  });
  aletDugmesi(dokTermometre, 'termometre', a => a === 'salla' || a === 'olc' || a === 'olc2', () => { sallama = { ...sallama, uc: null, tepe: null, yon: 0 }; });
  aletDugmesi(dokBez, 'bez', a => a === 'daldir' || a === 'sik' || a === 'bez', () => { suIcinde = false; });
  aletDugmesi(dokBardak, 'bardak', a => a === 'ic');
  aletDugmesi(dokYelpaze, 'yelpaze', a => a === 'yelpaze');
  dokTorba.addEventListener('pointerdown', e => { if (hazirMi(e)) yanlis(dokTorba); });
  kupler.forEach(k => k.addEventListener('pointerdown', e => {
    if (!hazirMi(e)) return;
    if (asama !== 'buz') { yanlis(k); return; }
    buzResmi.src = k.querySelector('img')?.src ?? buzResmi.src;
    tut(k, 'buz', e);
  }));
  torbaDugmesi.addEventListener('pointerdown', e => {
    if (!hazirMi(e)) return;
    if (asama === 'kapat') {
      kapakId = e.pointerId; kapak = { ...kapak, aci: null };
      try { torbaDugmesi.setPointerCapture(e.pointerId); } catch { /* pencere olayları yeter */ }
      kapak = kapakAdimi(kapak, noktaya(e));
      ses('e-tik', 0.5, 1.3); pop(kapakResmi, 160);
      return;
    }
    if (asama === 'koy') { tut(torbaDugmesi, 'torba', e); return; }
    salla(torbaKutu);
  });
  const hareket = (e: PointerEvent) => {
    if (kapakId !== null && e.pointerId === kapakId && asama === 'kapat') { kapakCevir(noktaya(e)); return; }
    const t = tutulan; if (!t || e.pointerId !== t.id) return;
    t.parmak = noktaya(e); ucaCiz(t, ucNoktasi(t));
  };
  const kalk = (e: PointerEvent) => {
    if (kapakId !== null && e.pointerId === kapakId) { kapakId = null; return; }
    const t = tutulan; if (!t || e.pointerId !== t.id) return;
    if (t.alet === 'buz') { void buzuBirak(t); return; }
    birak(t);
  };
  addEventListener('pointermove', hareket, { signal: iptal.signal });
  addEventListener('pointerup', kalk, { signal: iptal.signal });
  addEventListener('pointercancel', kalk, { signal: iptal.signal });
  sahne.addEventListener('pointerdown', e => {
    if (e.button !== 0 || tutulan || geciste || (e.target as Element).closest('button')) return;
    const p = noktaya(e), yakinda = hub.classList.contains('vk-altta');
    const icinde = (k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
    ses('e-tik', 0.45, 1.35);
    parilti(p, 130, yakinda ? etkiKati : yagmurKati);
    if (yakinda) {
      if (kinoYakinY && icinde(YAKIN.kino)) { kinoTepki('sevin', 520, 20); return; }
      if (yuzdeMi(p)) hop(basY.kutu, 8, 200);
      if (sudaMi(p) || icinde(KASE.kutu)) { void halka(KASE.yuz, 0.7); damlaSac(KASE.yuz, 3, 0.5); ses('a-sap', 0.35, 1.3); }
      const sira = siradaki();
      if (sira.length) { sira.forEach(ziplat); kinoTepki('sevin', 520, 12); }
    } else {
      if (kinoY && icinde(HUB.kino)) { kinoSasirdi = performance.now(); hop(kinoY.kutu, 18); return; }
      if (icinde(MASA.bulut) && asama !== 'kutlama' && asama !== 'son') hop(bulutY.kutu, 10, 220);
      if (asama === 'giris') salla(canta); else if (asama === 'canta' && !alinDugmesi.hidden) ziplat(alinDugmesi);
    }
  });

  // ——————————————————————————— buz: küp torbaya atılır
  async function buzuBirak(t: Tutulan) {
    const uc = ucNoktasi(t);
    if (asama === 'buz' && torbayaMi(uc)) {
      t.kaynak.hidden = true;
      buzSayisi++;
      const n = buzSayisi;
      await yerineKoy(t, { x: TORBA.agiz.x, y: TORBA.agiz.y - 20 }, 0.85, 150);
      ses('a-buz', 1, 0.9 + n * 0.1);
      setTimeout(() => ses('a-citir', 0.7, 0.95 + n * 0.05), sure(90));
      // torba bir kademe şişer, buz çıtırdar, soğuk buğu tüter
      torbaY.goster(ATES.torba[torbaKademesi(n, Z.buz)]);
      torbaKutu.animate([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.08, .9)', offset: 0.35 }, { transform: 'scale(.97, 1.04)', offset: 0.7 }, { transform: 'scale(1, 1)' }], { duration: sure(300), easing: 'ease-out' });
      void oynat(ATES.citirti, { x: TORBA.merkez.x + (Math.random() - 0.5) * 80, y: TORBA.merkez.y + 20 }, 300, 300, KARE_MS.citirti, { don: (Math.random() - 0.5) * 40 });
      void buguCikar({ x: TORBA.agiz.x + (Math.random() - 0.5) * 60, y: TORBA.agiz.y }, 0.8);
      kinoTepki('sevin', 450, 14);
      hop(basY.kutu, 6, 200);
      if (n >= Z.buz) {
        ses('e-cin', 0.6);
        ilerle();
        kapakResmi.hidden = false; pop(kapakResmi, 240);
        torbaDugmesi.hidden = false;
        kapakGoster();
      }
      return;
    }
    if (yuzdeMi(uc)) {
      ses('a-buz', 0.7, 1.4);
      urperKalan = URPER_MS * 0.7;
      titret(basY.kutu);
      kinoTepki('sasir', 600, 16);
      if (performance.now() - brrAni > 2500) { brrAni = performance.now(); soyle('b-brr'); }
    }
    birak(t);
  }

  // ——————————————————————————— kapak
  const kapakGoster = () => {
    const o = Math.min(1, kapak.toplam / Z.kapak);
    kapakResmi.style.transform = `translateY(${(-(1 - o) * 46).toFixed(1)}px) rotate(${(kapak.toplam * 360).toFixed(1)}deg)`;
  };
  function kapakCevir(p: Nokta) {
    kapak = kapakAdimi(kapak, p);
    kapakGoster();
    const ceyrek = Math.floor(kapak.toplam * 4);
    if (ceyrek > kapakCeyrek) { kapakCeyrek = ceyrek; ses('a-cevir', 0.9, 0.95 + Math.min(0.4, kapak.toplam * 0.15)); hop(kinoYakinY?.kutu, 8, 180); }
    if (kapak.toplam >= Z.kapak) {
      kapakId = null;
      kapakResmi.hidden = true;
      torbaY.goster(ATES.torbaKapali);
      ses('e-cit');
      parilti(TORBA.agiz, 220);
      void buguCikar({ x: TORBA.merkez.x, y: TORBA.agiz.y }, 1);
      pop(torbaKutu, 220);
      kinoTepki('sevin', 650, 22);
      ilerle();
    }
  }

  const yakinYildizlari = yildizlar.havuz(etkiKati, 14);
  async function kutla() {
    ses('e-cin');
    kinoTepki('sevin', 900, 28);
    yildizlar.sac(yakinYildizlari, { x: BAS.yuz.x, y: BAS.yuz.y - 60 }, 9, 320, 76);
    await bekle(KAPANIS.parlama);
    await uzaklas();
    if (!calisiyor) return;
    const t0 = performance.now();
    bulutY.kutu.style.transformOrigin = '50% 62%';
    zipla = bulutY.kutu.animate(ZIPLAMA_KARELERI, { duration: ZIPLAMA_MS, iterations: Infinity });
    ziplamaTuru = 0;
    yildizlar.yagdir(hubYildizlari, 14);
    kinoY?.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-16px)', offset: 0.45 }, { transform: 'translateY(0)' }], { duration: 300, iterations: Infinity, easing: 'ease-in-out' });
    await bekle(100);
    const bas = { x: HUB.serit.sol + SERIT_YUVALARI[3][0], y: HUB.serit.ust + SERIT_YUVALARI[3][1] };
    hubYildiz.hidden = true;
    const y = resim(ORTAK.yildiz, 'vk-katman vk-ucan-yildiz'); ortala(y, MASA.gogus, 120, 120); hub.append(y);
    const dx = bas.x - MASA.gogus.x, dy = bas.y - MASA.gogus.y;
    await y.animate([{ transform: `translate(${dx}px, ${dy}px) scale(1.1) rotate(0deg)` }, { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 190}px) scale(1.7) rotate(200deg)`, offset: 0.55 }, { transform: 'translate(0, 0) scale(1) rotate(360deg)' }],
      { duration: sure(480), easing: 'cubic-bezier(.3,0,.4,1)' }).finished.catch(() => undefined);
    if (!calisiyor) return;
    ses('e-cin');
    parilti(MASA.gogus, 300, hub);
    await bekle(Math.max(0, KAPANIS.sevinc - (performance.now() - t0) - 280));
    if (!calisiyor) return;
    // son poz: zıplama durur, Bulut kollarını açar: "Ferahladım! Yünüm de kabardı!"
    ferahOldu = true;
    zipla?.cancel(); zipla = null;
    bulutY.goster(ATES.ferah);
    pop(bulutY.kutu, 260);
    yildizlar.sac(hubYildizlari, MASA.gogus, 8, 260, 70);
    soyle('b-ferah');
    await bekle(280);
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
  tekrar.addEventListener('click', () => { calisiyor = false; iptal.abort(); sus(); baslat(kok, yas, secenek); });

  // ——————————————————————————— aşamaların işi (kare döngüsünden)
  function termometreKaresi(h: Tutulan, uc: Nokta, dt: number, an: number, hx: number) {
    if (asama === 'salla') {
      const once = sallama.sayi;
      sallama = sallaAdimi(sallama, uc.x, dt);
      // sallanırken bulanık kareler (yöne göre); dururken düz termometre
      termometreY.goster(Math.abs(hx) > 0.6 ? ATES.termometreSalla[hx > 0 ? 1 : 0] : ATES.termometre);
      if (sallama.sayi > once) { ses('a-sik', 0.9, 0.95 + Math.random() * 0.15); hop(kinoYakinY?.kutu, 6, 160); }
      seviye(yesil, eskiOkuma(sallama.sayi, Z.salla));
      if (sallama.sayi >= Z.salla) { seviye(yesil, 0); termometreY.goster(ATES.termometre); ses('e-cin', 0.5, 1.3); kinoTepki('sevin', 500, 16); ilerle(); }
      return;
    }
    termometreY.goster(ATES.termometre);
    const alinda = alindaMi(uc);
    olcuyor = alinda;
    // uç alındayken parlar: üç karelik ışık döngüsü
    isik.classList.toggle('at-yaniyor', alinda);
    if (alinda) { const k = Math.floor(an / KARE_MS.isik) % 3; if (k !== isikKaresi) { isikKaresi = k; kareYap(isik, ATES.termometreIsik[k]); } }
    if (asama === 'olc') {
      const once = olc;
      olc = olcAdimi(olc, alinda, dt, Z.olc);
      if (once === 0 && olc > 0) ses('a-olc', 0.8);
      seviye(kirmizi, olc / Z.olc);
      if (olc >= Z.olc) {
        kinoTepki('sasir', 1100, 26);
        sasirKalan = SASIR_MS;
        hop(basY.kutu, 10, 220);
        soyle('b-ates');
        parilti(uc, 220);
        birak(h);
        ilerle();
      }
      return;
    }
    const once = olc2;
    olc2 = olcAdimi(olc2, alinda, dt, Z.olc);
    if (once === 0 && olc2 > 0) ses('a-olc', 0.8, 0.85);
    const k = olc2 / Z.olc;
    seviye(kirmizi, 1 - k); seviye(yesil, NORMAL_OKUMA * k);
    if (olc2 >= Z.olc) {
      soyle('b-iyi');
      parilti(uc, 240);
      birak(h);
      asamaGec('kutlama');
      void kutla();
    }
  }
  function bezKaresi(h: Tutulan, uc: Nokta, yol: number, dt: number, an: number) {
    if (asama === 'daldir') {
      const suda = sudaMi(uc);
      if (suda && !suIcinde) { ses('a-sap'); void sicrat(); damlaSac(KASE.yuz, 6); void halka(); hop(kinoYakinY?.kutu, 10, 200); }
      suIcinde = suda;
      daldir = daldirAdimi(daldir, suda, yol, dt, Z.daldir);
      if (suda && yol > 2 && an - halkaAni > 240) {
        halkaAni = an; void halka({ x: uc.x, y: KASE.yuz.y }, 0.8);
        if (an - sesAni > 380) { sesAni = an; ses('a-sap', 0.35, 1.2 + Math.random() * 0.2); }
        if (Math.random() < 0.35) void sicrat({ x: uc.x, y: KASE.yuz.y }, 0.55);
      }
      if (daldir >= Z.daldir) { bezY.goster(ATES.bezIslak); ses('a-damla', 0.8); kinoTepki('sevin', 500, 14); ilerle(); }
      return;
    }
    if (asama === 'sik') {
      const dn = damlaNoktasi(h), dy = h.ucOnce ? uc.y - h.ucOnce.y : 0;
      const ustunde = kaseUstundeMi(uc);
      const once = sik;
      sik = sikAdimi(sik, ustunde, dy, dt, Z.sik);
      if (ustunde && dy > 1.5) {
        asagiAni = an;
        bezY.goster(ATES.bezBuruk[burukKaresi(sik, Z.sik)]);
        su.ak(dn, KASE.yuz.y);
        if (an - damlaAni > 160) { damlaAni = an; ses('a-damla', 0.6, 0.9 + Math.random() * 0.3); }
        if (an - halkaAni > 220) { halkaAni = an; void halka({ x: dn.x, y: KASE.yuz.y }, 0.6); }
      } else if (an - asagiAni > 140) { bezY.goster(ATES.bezIslak); su.kes(); }
      if (sik > once && Math.floor(sik / 120) > Math.floor(once / 120)) hop(kinoYakinY?.kutu, 6, 160);
      if (yuzdeMi(uc) && an - burunAni > 1500) {
        burunAni = an;
        void damlaDusur(dn, BAS.burun).then(() => {
          if (!calisiyor) return;
          ses('a-damla', 0.9, 1.25); damlaSac(BAS.burun, 4, 0.45);
          kikirKalan = KIKIR_MS;
          hop(basY.kutu, 12, 240);
          kinoTepki('sasir', 600, 16);
          if (!kikirSoylendi) { kikirSoylendi = true; soyle('b-kikir'); } else ses('e-hihi', 0.8);
        });
      }
      if (sik >= Z.sik) { su.kes(); bezY.goster(ATES.bezIslak); ses('a-damla', 0.7, 0.8); parilti(uc, 170); kinoTepki('sevin', 600, 18); ilerle(); }
      return;
    }
    // bez: yüze bastırıp gezdir; kızarıklık geçilen yerden silinir, buhar yükselir, ter ve sıcak dalgası söner
    if (!yuzdeMi(uc)) return;
    serinKalan = SERIN_MS;
    if (!serinSoylendi) { serinSoylendi = true; soyle('b-serin'); }
    bezAdimi(iz, uc, yol, dt);
    kizSil(uc, BEZ_YARICAPI * 1.2, (Math.min(60, yol) + dt * 0.05) / SILME_YOLU * 0.9);
    buharYolu += Math.min(60, yol);
    if (buharYolu - buharAdimi > 90) { buharAdimi = buharYolu; void buharCikar({ x: uc.x + (Math.random() - 0.5) * 140, y: uc.y - 60 }); }
    if (yol > 2 && an - sesAni > 230) { sesAni = an; ses('a-sil', 0.7, 0.9 + Math.random() * 0.25); }
    const oran = kizariklikOrani(iz);
    ter.style.opacity = Math.max(0.001, 1 - oran * 1.2).toFixed(3);
    isi.style.opacity = Math.max(0.001, 1 - oran * 1.4).toFixed(3);
    BAS.yanaklar.forEach((y, i) => {
      if (yanakSerin[i]) return;
      const yakinlar = iz.merkezler.map((m, j) => [m, iz.deger[j]] as const).filter(([m]) => Math.hypot(m.x - y.x, m.y - y.y) <= BAS.yanakYaricapi);
      if (yakinlar.filter(([, v]) => v >= 1).length >= yakinlar.length * 0.85) { yanakSerin[i] = true; parilti(y, 230); ses('e-cin', 0.45, 1.2 + i * 0.1); kinoTepki('sevin', 500, 16); }
    });
    if (bezIsindiMi(oran, bezTuru, Z)) {
      bezTuru++;
      bezY.goster(ATES.bezKuru);
      soyle('b-isindi');
      kinoTepki('sasir', 600, 14);
      daldir = 0; sik = 0; suIcinde = false;
      asamaGec('daldir');
      return;
    }
    if (oran >= Z.bez) {
      iz.deger.fill(1);
      kiz.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(380), fill: 'forwards' });
      ter.style.opacity = '.001'; isi.style.opacity = '.001';
      yanakSerin.fill(true);
      ses('e-cin', 0.7);
      kinoTepki('sevin', 700, 24);
      for (const y of BAS.yanaklar) parilti(y, 240);
      asamaGec('ic');
      void yerineKoy(h, { x: BAS.bez.x, y: BAS.bez.y + 0.1 * ALETLER.bez.y }, 1, 240).then(() => {
        alinBezi.classList.add('at-gorunur'); pop(alinBezi, 200);
        void buharCikar({ x: BAS.bez.x, y: BAS.bez.y - 40 }, 1.2);
        dokBez.hidden = true;
        dokBardak.hidden = false; pop(dokBardak, 260); ses('e-tik', 0.7, 1.1);
      });
    }
  }
  function bardakKaresi(h: Tutulan, uc: Nokta, dt: number, an: number) {
    const agizda = agizdaMi(uc);
    iciyor = agizda;
    kabarcik.classList.toggle('at-yaniyor', agizda);
    if (agizda) {
      const k = Math.floor(an / KARE_MS.kabarcik) % 2;
      if (k !== kabarcikKaresi) { kabarcikKaresi = k; kareYap(kabarcik, ATES.kabarcik[k]); }
      if (an - yudumAni > 420) { yudumAni = an; ses('a-yudum', 0.8, 0.95 + Math.random() * 0.15); }
    } else if (burundaMi(uc) && an - pipetBurunAni > 1500) {
      // pipet burnu gıdıklar
      pipetBurunAni = an; kikirKalan = KIKIR_MS; ses('e-hihi', 0.9); hop(basY.kutu, 10, 220); kinoTepki('sasir', 500, 12);
    }
    const once = bardakKademesi(ic, Z.ic);
    ic = icAdimi(ic, agizda, dt, Z.ic);
    const simdi = bardakKademesi(ic, Z.ic);
    if (simdi !== once) { bardakY.goster(ATES.bardak[simdi]); yutkunKalan = YUTKUN_MS; ses('a-yudum', 1, 0.8); hop(basY.kutu, 6, 200); }
    if (ic >= Z.ic) {
      iciyor = false;
      soyle('b-lik');
      kinoTepki('sevin', 600, 18);
      parilti(BAS.agiz, 200);
      birak(h);
      setTimeout(() => { if (calisiyor) dokBardak.hidden = true; }, sure(260));
      ilerle();
      torbaGelsin();
    }
  }
  function torbaGelsin() {
    const s = dok.getBoundingClientRect(), r = sahne.getBoundingClientRect();
    const [x, y] = SERIT_YUVALARI[2];
    const bas = { x: (s.left - r.left) / S + x * (s.width / S) / YAKIN.serit.g, y: (s.top - r.top) / S + y * (s.height / S) / YAKIN.serit.y };
    dokTorba.hidden = true;
    torbaKutu.hidden = false;
    torbaY.goster(ATES.torba[0]);
    ses('e-cit', 0.8);
    torbaKutu.animate([{ transform: `translate(${bas.x - TORBA.merkez.x}px, ${bas.y - TORBA.merkez.y}px) scale(.55)` }, { transform: `translate(${(bas.x - TORBA.merkez.x) * 0.4}px, ${(bas.y - TORBA.merkez.y) * 0.4 - 120}px) scale(.9)`, offset: 0.55 }, { transform: 'translate(0, 0) scale(1)' }],
      { duration: sure(420), easing: 'cubic-bezier(.3,0,.4,1)' });
    setTimeout(() => { if (calisiyor) kupler.forEach((k, i) => setTimeout(() => ziplat(k), sure(i * 90))); }, sure(440));
  }
  function torbaKaresi(h: Tutulan, uc: Nokta) {
    if (asama !== 'koy' || !tepedeMi(uc)) return;
    torbaBasta = true;
    torbaDugmesi.hidden = true;
    torbaKutu.hidden = true;
    asamaGec('yelpaze');
    void yerineKoy(h, { x: BAS.tepe.x, y: BAS.tepe.y + 0.05 * 320 }, 320 / ALETLER.torba.g, 160).then(() => {
      bastakiTorba.classList.add('at-gorunur'); pop(bastakiTorba, 260);
      ses('e-pof', 0.8); ses('a-citir', 0.8, 1.1); parilti(BAS.tepe, 260);
      void buguCikar({ x: BAS.tepe.x + 40, y: BAS.tepe.y - 60 }, 1);
      // önce ürperir ("Brrr!"), sonra rahatlar
      urperKalan = URPER_MS;
      soyle('b-brr');
      kinoTepki('sasir', 700, 20);
      setTimeout(() => { if (!calisiyor) return; soyle('b-oh'); kinoTepki('sevin', 700, 24); hop(basY.kutu, 10, 240); ziplat(dokYelpaze); }, sure(URPER_MS + 150));
    });
  }
  function yelpazeKaresi(h: Tutulan, uc: Nokta, dt: number, hx: number) {
    yelpazeY.goster(Math.abs(hx) > 0.6 ? ATES.yelpazeEgik : ATES.yelpazeAcik);
    if (!yelpazeYuzdeMi(uc)) return;
    const once = yelpaze.sayi;
    yelpaze = sallaAdimi(yelpaze, uc.x, dt, YELPAZE_GENLIK, YELPAZE_BEKLEME);
    if (yelpaze.sayi <= once) return;
    ses('a-yelpaze', 0.8, 0.9 + Math.random() * 0.25);
    keyifKalan = KEYIF_MS;
    // rüzgâr, yelpazeden yüze doğru akar
    const hedef = { x: (uc.x + BAS.yuz.x) / 2, y: (uc.y + BAS.yuz.y - 120) / 2 };
    void oynat(ATES.ruzgar, hedef, 400, 300, KARE_MS.ruzgar, { kayX: uc.x > BAS.yuz.x ? -80 : 80 });
    if (!ruzgarSoylendi && yelpaze.sayi >= 2) { ruzgarSoylendi = true; soyle('b-ruzgar'); }
    const k = yunKademesi(yelpaze.sayi, Z.yelpaze);
    if (k > yun) {
      yun = k;
      yunY.kutu.classList.remove('at-yun-yok');
      yunY.goster(ATES.yun[k - 1]);
      yunY.kutu.animate([{ transform: 'scale(.96)' }, { transform: 'scale(1.03)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: sure(320), easing: 'ease-out' });
      parilti({ x: BAS.tepe.x - 160, y: BAS.tepe.y + 60 }, 200); parilti({ x: BAS.tepe.x + 200, y: BAS.tepe.y + 80 }, 180);
      ses('e-cin', 0.4, 1.1 + k * 0.08);
      kinoTepki('sevin', 500, 16);
    }
    if (yelpaze.sayi >= Z.yelpaze) {
      yun = 3; yunY.kutu.classList.remove('at-yun-yok'); yunY.goster(ATES.yun[2]);
      kinoTepki('sevin', 600, 18);
      birak(h);
      ilerle();
      ziplat(dokTermometre);
    }
  }

  // ——————————————————————————— kare döngüsü
  let pozSimdi: BasPozu = 'sicak';
  function kare(an: number) {
    if (!calisiyor || !sahne.isConnected) return;
    const dt = Math.min(64, an - son); son = an;
    kikirKalan = Math.max(0, kikirKalan - dt); serinKalan = Math.max(0, serinKalan - dt); urperKalan = Math.max(0, urperKalan - dt);
    sasirKalan = Math.max(0, sasirKalan - dt); keyifKalan = Math.max(0, keyifKalan - dt); yutkunKalan = Math.max(0, yutkunKalan - dt);
    if (!hub.classList.contains('vk-altta')) {
      const t = an;
      if (ferahOldu) bulutY.goster(ATES.ferah);
      else if (asama === 'kutlama' || asama === 'son') {
        const zt = zipla && !TEST_MODU ? Number(zipla.currentTime ?? 0) : -1;
        bulutY.goster(ATES.sevinc[zt >= 0 ? ziplamaKaresi(zt) : sevincKaresi(t)]);
        if (zt >= 0) { const tur = Math.floor(zt / ZIPLAMA_MS); if (tur > ziplamaTuru) { ziplamaTuru = tur; inis(tur); } }
      }
      else { const k = beklemeKaresi(t); bulutY.goster(k === 'kirp' ? ATES.uzgunKirp : ATES.uzgun[k === 'a' ? 0 : 1]); }
      if (kinoY) kinoY.goster(asama === 'kutlama' || asama === 'son' ? SECMELI.kino.alkis[alkisKaresi(t)] : kinoSasirdi && an - kinoSasirdi < 1100 ? SECMELI.kino.sasir : SECMELI.kino.goster);
    }
    const poz = basPozu({ asama, kikirKalan, serinKalan, urperKalan, sasirKalan, keyifKalan, yutkunKalan, olcuyor, iciyor, kirp: beklemeKaresi(an) === 'kirp', an });
    if (poz !== pozSimdi) {
      const sessiz = poz === 'kirp' || pozSimdi === 'kirp' || poz.startsWith('ic') || pozSimdi.startsWith('ic') || poz.startsWith('urper') || pozSimdi.startsWith('urper');
      pozSimdi = poz;
      basY.goster(ATES.bas[poz]);
      if (!sessiz) basY.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(200), easing: 'ease-out' });
    }
    // hayat: alındaki bezden ve başındaki torbadan ara ara buhar ve buğu; tepside buz parıldar
    if (!tutulan && asama !== 'son' && asama !== 'kutlama' && hub.classList.contains('vk-altta')) {
      if (alinBezi.classList.contains('at-gorunur') && an - buharAni > 1100) { buharAni = an; void buharCikar({ x: BAS.bez.x + (Math.random() - 0.5) * 200, y: BAS.bez.y - 40 }, 0.8); }
      if (torbaBasta && an - soguAni > 1500) { soguAni = an; void buguCikar({ x: BAS.tepe.x + (Math.random() - 0.5) * 120, y: BAS.tepe.y - 40 }, 0.7); }
    }
    if (asama === 'buz' && an - parAni > 1400) {
      parAni = an;
      const acik = kupler.filter(k => !k.hidden);
      const k = acik[Math.floor(Math.random() * acik.length)];
      if (k) { const i = kupler.indexOf(k); void oynat(ATES.buzParilti, { x: TEPSI.kupler[i].x + 30, y: TEPSI.kupler[i].y - 30 }, 120, 120, KARE_MS.parilti); }
    }
    su.kare(dt);
    const h = tutulan;
    if (kinoYakinY) {
      if (an >= kinoTepkiSonu) kinoTepkiPozu = null;
      const kp = kinoYakinPozu({ tepki: kinoTepkiPozu, kilitli: false, mercekte: olcuyor });
      if (kp !== kinoSimdi) { if (!kinoTepkiPozu) hop(kinoYakinY.kutu, 10, 200); kinoSimdi = kp; kinoYakinY.goster(KINO_POZLARI[kp]); }
    }
    if (h) {
      const hx = (h.parmak.x - h.once.x) / Math.max(1, dt);
      h.once = h.parmak;
      const sinir = (h.alet === 'termometre' && asama === 'salla') || h.alet === 'yelpaze' ? 16 : 8;
      const hedef = Math.max(-sinir, Math.min(sinir, hx * 9)), onceki = h.egim;
      h.egim += (hedef - h.egim) * Math.min(1, dt / 90);
      if (Math.abs(h.egim - onceki) > 0.01) ucaCiz(h, ucNoktasi(h));
      const uc = ucNoktasi(h);
      const yol = h.ucOnce ? Math.hypot(uc.x - h.ucOnce.x, uc.y - h.ucOnce.y) : 0;
      if (h.alet === 'termometre' && (asama === 'salla' || asama === 'olc' || asama === 'olc2')) termometreKaresi(h, uc, dt, an, hx);
      else if (h.alet === 'bez' && (asama === 'daldir' || asama === 'sik' || asama === 'bez')) bezKaresi(h, uc, yol, dt, an);
      else if (h.alet === 'bardak' && asama === 'ic') bardakKaresi(h, uc, dt, an);
      else if (h.alet === 'torba') torbaKaresi(h, uc);
      else if (h.alet === 'yelpaze' && asama === 'yelpaze') yelpazeKaresi(h, uc, dt, hx);
      h.ucOnce = uc;
    }
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
      setTimeout(() => soyle('b-sicak'), sure(350));
      setTimeout(() => { if (calisiyor && asama === 'giris') { salla(canta); hop(kinoY?.kutu, 16); ses('e-tik', 0.5, 1.2); } }, sure(260));
      requestAnimationFrame(t => { son = t; requestAnimationFrame(kare); });
    });

  if (TEST_MODU || sorgu.has('kayit')) {
    const m = (e: Element): Nokta => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    (window as unknown as { __ates: unknown }).__ates = {
      asama: () => asama,
      gorunduAni: () => gorunduAni,
      uc: () => (tutulan ? ekrana(ucNoktasi(tutulan)) : null),
      olcek: () => S,
      poz: () => pozSimdi,
      nokta: (ad: string, i = 0): Nokta | null => {
        if (ad === 'canta') return m(canta);
        if (ad === 'alin-dugmesi') return ekrana(MASA.alin);
        if (ad === 'termometre') return m(dokTermometre);
        if (ad === 'bez') return m(dokBez);
        if (ad === 'bardak') return m(dokBardak);
        if (ad === 'yelpaze') return m(dokYelpaze);
        if (ad === 'alin') return ekrana(BAS.alin);
        if (ad === 'agiz') return ekrana(BAS.agiz);
        if (ad === 'yuz') return ekrana({ x: BAS.yuz.x, y: BAS.yuz.y });
        if (ad === 'su') return ekrana({ x: KASE.su.x, y: KASE.su.y });
        if (ad === 'kase-ust') return ekrana({ x: KASE.yuz.x, y: KASE.ust.ust + 60 + i });
        if (ad === 'yanak') return ekrana(BAS.yanaklar[i]);
        if (ad === 'burun') return ekrana(BAS.burun);
        if (ad === 'kup') return kupler[i] ? m(kupler[i]) : null;
        if (ad === 'torba-agiz') return ekrana(TORBA.agiz);
        if (ad === 'torba') return ekrana(TORBA.merkez);
        if (ad === 'tepe') return ekrana(BAS.tepe);
        if (ad === 'tekrar') return m(tekrar);
        return null;
      },
      sayim: () => ({ salla: sallama.sayi, hedefSalla: Z.salla, olc, olc2, hedefOlc: Z.olc, daldir, sik, kizariklik: kizariklikOrani(iz), bezTuru, ic, hedefIc: Z.ic, buz: buzSayisi, hedefBuz: Z.buz,
        kapak: kapak.toplam, hedefKapak: Z.kapak, torbaBasta, yelpaze: yelpaze.sayi, hedefYelpaze: Z.yelpaze, yun, ferah: ferahOldu }),
    };
  }
}
