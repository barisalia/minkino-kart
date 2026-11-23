// Minik Doktor · "Mila'nın Boya Lekeleri" (sekiz adım; veri.ts başındaki senaryo). Masa → çanta → Mila'ya yakın plan:
// sabunu kovanın kenarındaki süngere sürt (köpük kabarır, baloncuklar uçuşur) → süngerle lekeleri ov (köpük lekenin rengini
// alır, sünger kirlenir) ↔ kovada çalkala (su dalgalanır ve renklenir) → pamuklu çubukla benekler (pıt pıt) → spreyle püskürt
// (sis açılır, köpük söner, damlalar süzülür, tüy ıslanır) → havluyla kurula (tüy pof pof kabarır) → kovadan yükselen sabun
// baloncuklarını patlat (Mila patileriyle uzanır) → aynayı tut (Mila kendini görür, kalpler) → masada kutlama; Mila patisini
// yine boya kabına sokar, Kino "Mila, Mila! Yine mi boya?". Yanlış hamle: kirli süngerle yüzü yeniden ovmak burnu mor yapar.
// Çizimler Astra'dan (Paket Doktor-Y4, assets/doktor/boya/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
import '../vaka/vaka.css';
import './boya.css';
import { TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { anaMenuyeDon } from '../../../src/uygulama';
import { efekt, konus, sesleriYukle, sus } from '../ses';
import { ZIPLAMA_KARELERI, golgeYap, kenarUzat, yildizEtkisi } from '../vaka/etki';
import { KopukKatmani } from '../vaka/his';
import { cevirUyarisi } from '../vaka/sahne';
import { DOK_ALET_BOYU, ELDE_OLCEK, HUB, SECMELI, SERIT_YUVALARI, SERIT_YUVA_BOYU, TEKRAR_BOYU, YAKIN, ZIPLAMA_MS, alkisKaresi, beklemeKaresi, kinoYakinPozu, sahneOlcegi, sevincKaresi, ziplamaKaresi, type KinoPozu, type Kutu, type Nokta, type Yas } from '../vaka/veri';
import {
  ALETLER, BALONCUKLAR, BALONCUK_BOYU, BALONCUK_DUGMESI, BENEKLER, BENEK_BOYU, BENEK_MS, BOYA, BOYA_DOSYALAR, BURUN, EFEKTLER, EN_COK_DAMLA, GIDIK_MS, IYY_MS, KAPANIS, KARE_MS, KINO_SOZU, KOVA, KURULA_YOLU,
  MASA, MOR_MS, ORTAK, ORTAK_DOSYALAR, ORTAK_EFEKTLER, PATI_MS, PATILER, PIS_DAMLASI, PIS_YARICAPI, SAHNE, SIKIK_MS, SOZLER, SUNGER_DUGMESI, SUNGER_YARICAPI, YANLIS_OVMA, YUZ, YUZ_DUGMESI, ZORLUK,
  aynaAdimi, aynadaMi, basPozu, benekAdimi, calkalaAdimi, calkalaBaslangici, kirKademesi, kirSiniri, kopukKademesi, kopurtAdimi, kovadaMi, kurulaAdimi, lekeBittiMi, lekeBul, lekeEkle, lekeIzgarasi, lekeOrani, mildaMi, ovAdimi,
  ovmaSayaciAdimi, ovmaSayaciBaslangici, pisAdimi, pisBaslangici, secilenLekeler, sisNoktasi, sonrakiAsama, suKademesi, toplamOran,
  type AletAdi, type Asama, type BasPozu, type Damla, type EfektAdi, type Leke, type Renk, type SozAdi,
} from './veri';

const TEKRAR_DUGMESI = new URL('../../../assets/hazirlik/dugmeler/tekrar.webp', import.meta.url).href;
import { cizimKlasoru } from '../vaka-kit/ortak';
const boyaDosyalar = import.meta.glob<string>('../../../assets/doktor/boya/*.webp', { eager: true, query: '?url', import: 'default' });
const ortakDosyalar = import.meta.glob<string>('../../../assets/doktor/vaka/*.webp', { eager: true, query: '?url', import: 'default' });
const sorgu = new URLSearchParams(location.search);
const TASLAK = import.meta.env.DEV && sorgu.has('taslak');
// kendi klasöründen; Dikenli Pati'nin klasöründen yalnız ortak parçalar ve Kino (vaka-kit/ortak.ts → cizimKlasoru)
const gercek = (ad: string): string | undefined => (cizimKlasoru(ad, 'boya') === 'vaka' ? ortakDosyalar[`../../../assets/doktor/vaka/${ad}.webp`] : boyaDosyalar[`../../../assets/doktor/boya/${ad}.webp`]);
const adres = (ad: string): string | undefined => gercek(ad) ?? (TASLAK && BOYA_DOSYALAR.includes(ad) ? `/output/doktor/boya-taslak/${ad}.png` : undefined);
export const eksikCizimler = (): string[] => [...(TASLAK ? [] : BOYA_DOSYALAR), ...ORTAK_DOSYALAR].filter(ad => !gercek(ad));
const KINO = [SECMELI.kino.goster, SECMELI.kino.sasir, ...SECMELI.kino.alkis];
const KINO_VAR = KINO.every(ad => !!gercek(ad));
const KINO_POZLARI: Record<KinoPozu, string> = { izler: SECMELI.kino.alkis[1], sasir: SECMELI.kino.sasir, sevin: SECMELI.kino.goster };
const RENKLER: readonly Renk[] = ['sari', 'mavi', 'yesil', 'mor'];

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
const soyle = (ad: SozAdi | typeof KINO_SOZU) => void konus(ad);
const pop = (e: HTMLElement, ms = 200) => e.animate([{ transform: 'scale(.6)' }, { transform: 'scale(1.12)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: sure(ms), easing: 'ease-out' });
const ziplat = (e: HTMLElement) => { e.animate([{ transform: 'scale(1) translateY(0)' }, { transform: 'scale(1.22) translateY(-14px)', offset: 0.4 }, { transform: 'scale(1) translateY(0)' }], { duration: sure(280), easing: 'ease-out' }); };
const hop = (e: HTMLElement | null | undefined, px = 20, ms = 260) => { e?.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-px}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(ms), easing: 'ease-out', composite: 'add' }); };
const salla = (e: HTMLElement) => e.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: sure(260) });

function yigin(adlar: readonly string[], sinif: string): { kutu: HTMLDivElement; goster: (ad: string) => void; simdi: () => string } {
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
  return { kutu, goster, simdi: () => simdi };
}

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  kok.replaceChildren();
  kok.dataset.oyun = 'boya';
  cevirUyarisi(kok);
  const geri = el('button', 'vk-geri'); geri.type = 'button'; geri.setAttribute('aria-label', 'Geri'); geri.innerHTML = IKON.geri;
  geri.addEventListener('click', () => anaMenuyeDon());
  kok.append(geri);
  const eksik = eksikCizimler();
  if (eksik.length) { kok.dataset.durum = 'eksik'; kok.dataset.eksik = String(eksik.length); console.info('Boya vakası: ' + eksik.length + ' çizim bekleniyor (Paket Doktor-Y4):', eksik.join(', ')); return; }
  kok.dataset.durum = 'yukleniyor';
  const adlar = [...BOYA_DOSYALAR, ...ORTAK_DOSYALAR];
  const hepsi = adlar.map(ad => { const r = new Image(); r.src = adres(ad)!; return r.decode().catch(() => undefined).then(() => r); });
  void Promise.all([Promise.all(hepsi), sesleriYukle([...Object.keys(SOZLER), KINO_SOZU, ...EFEKTLER, ...ORTAK_EFEKTLER])]).then(([resimler]) => kur(kok, yas, secenek, new Map(adlar.map((ad, i) => [ad, resimler[i]]))));
}

function kur(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void }, cozulmus: Map<string, HTMLImageElement>) {
  const Z = ZORLUK[yas];
  const secili = secilenLekeler(yas);
  const benekler = BENEKLER.slice(0, Z.benek);
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
  let iz = lekeIzgarasi(secili);
  const bitenLeke = new Set<number>();
  let kopurt = calkalaBaslangici(), kir = 0, kirli = false, kirliAyrildi = false, kirliIpucu = 0, kirliOvma = ovmaSayaciBaslangici(), cal = calkalaBaslangici(), yikama = 0, morBurun = false, kovada = false;
  let benekKalan = benekler.map(() => BENEK_MS), alinanBenek = 0, pis = pisBaslangici(), patlayan = 0, ayna = 0;
  const damlalar: (Damla & { r: HTMLImageElement })[] = [];
  let sikikKalan = 0, saskinKalan = 0, iyyKalan = 0, gidikKalan = 0, morKalan = 0, patiKalan = 0;
  let sesAni = 0, kopukYolu = 0, kopukAni = 0, ovusAni = 0, kalpAni = 0, parAni = 0;
  let renkSoylendi = false, kirliSoylendi = false, pitSoylendi = false, serinSoylendi = false, yumusakSoylendi = false, gidikSoylendi = false, kopukSoylendi = false, baloncukSoylendi = false, sakaOldu = false, aynaSesi = false;
  let zipla: Animation | null = null, ziplamaTuru = 0;
  let kinoTepkiPozu: KinoPozu | null = null, kinoTepkiSonu = 0, kinoSimdi: KinoPozu = 'izler', kinoSasirdi = 0;

  // ——————————————————————————— masa
  const hub = el('div', 'vk-gorunum vk-hub');
  const milaY = yigin([...BOYA.boyali, BOYA.boyaliKirp, ...BOYA.sevinc, BOYA.saka, BOYA.sakaKikir], 'vk-katman vk-zipzip');
  koy(milaY.kutu, MASA.mila);
  const canta = el('button', 'vk-katman vk-canta'); canta.type = 'button'; canta.setAttribute('aria-label', 'Doktor çantası'); koy(canta, HUB.canta);
  const cantaY = yigin([ORTAK.cantaKapali, ORTAK.cantaAcik], 'vk-canta-resmi'); canta.append(cantaY.kutu);
  const cantaAletleri = [BOYA.sabun, BOYA.cubuk, BOYA.sprey, BOYA.havluKuru].map((ad, i) => {
    const r = resim(ad, 'vk-yuva-aleti');
    const [x, y] = HUB.yuvalar[i];
    ortala(r, { x, y }, HUB.yuvaBoyu[1], HUB.yuvaBoyu[1]);
    r.hidden = true;
    canta.append(r);
    return r;
  });
  const hubSerit = el('div', 'vk-katman vk-serit'); koy(hubSerit, HUB.serit);
  hubSerit.append(resim(ORTAK.serit));
  [BOYA.sabun, BOYA.cubuk, BOYA.sprey].forEach((ad, i) => { const r = resim(ad, 'vk-yuva-aleti'); const [x, y] = SERIT_YUVALARI[i]; ortala(r, { x, y }, SERIT_YUVA_BOYU[1] * 1.3, SERIT_YUVA_BOYU[1] * 1.3); hubSerit.append(r); });
  const hubYildiz = resim(ORTAK.yildiz, 'vk-yuva-aleti'); { const [x, y] = SERIT_YUVALARI[3]; ortala(hubYildiz, { x, y }, SERIT_YUVA_BOYU[1], SERIT_YUVA_BOYU[1]); } hubSerit.append(hubYildiz);
  const kinoY = KINO_VAR ? yigin(KINO, 'vk-katman vk-kino') : null;
  if (kinoY) koy(kinoY.kutu, HUB.kino);
  const yuzDugmesi = el('button', 'vk-katman vk-kol-dugmesi'); yuzDugmesi.type = 'button'; yuzDugmesi.setAttribute('aria-label', 'Mila\'nın yüzü'); ortala(yuzDugmesi, MASA.yuz, YUZ_DUGMESI[0], YUZ_DUGMESI[1]); yuzDugmesi.hidden = true;
  const yagmurKati = el('div', 'vk-katman vk-yagmur');
  const hubYildizlari = yildizlar.havuz(yagmurKati, 40);
  hub.append(resim(ORTAK.hubFon, 'vk-fon'), milaY.kutu, canta, hubSerit, ...(kinoY ? [kinoY.kutu] : []), yuzDugmesi, yagmurKati);
  kenarUzat(hub, [[cozulmus.get(ORTAK.hubFon), TAM]]);

  // ——————————————————————————— yakın plan
  const yakin = el('div', 'vk-gorunum vk-yakin vk-altta');
  // kova: berrak su; yıkadıkça renkli su kademeleri belirir
  const kova = el('div', 'vk-katman by-kova'); koy(kova, KOVA.kutu);
  const kovaSuY = yigin(BOYA.kovaSu, 'by-kova-su');
  kovaSuY.kutu.classList.add('by-berrak');
  kova.append(resim(BOYA.kova), kovaSuY.kutu);
  // kovanın kenarındaki sünger (sabunlanır; sonra buradan alınır, bırakılınca buraya döner)
  const sungerYer = el('button', 'vk-katman by-sunger-yeri'); sungerYer.type = 'button'; sungerYer.setAttribute('aria-label', 'Sünger');
  ortala(sungerYer, KOVA.sunger, SUNGER_DUGMESI, SUNGER_DUGMESI);
  const yerSungerY = yigin([BOYA.sunger, ...BOYA.sungerKopuk], 'by-sunger-resmi');
  sungerYer.append(yerSungerY.kutu);
  const basY = yigin(Object.values(BOYA.bas), 'vk-fon by-bas');
  const leke = el('canvas', 'vk-fon by-lekeler'); leke.width = SAHNE.g / 2; leke.height = SAHNE.y / 2;
  const lg = leke.getContext('2d')!;
  const lekeBoya = (cizim: HTMLImageElement, l: Leke) => {
    lg.save(); lg.globalCompositeOperation = 'source-over';
    lg.beginPath(); lg.arc(l.x / 2, l.y / 2, (l.r + 30) / 2, 0, Math.PI * 2); lg.clip();
    lg.drawImage(cizim, 0, 0, leke.width, leke.height); lg.restore();
  };
  for (const l of secili) lekeBoya(cozulmus.get(BOYA.lekeler)!, l);
  const lekeSil = (p: Nokta, yaricap: number, guc: number) => {
    lg.save(); lg.globalCompositeOperation = 'destination-out';
    const g = lg.createRadialGradient(p.x / 2, p.y / 2, yaricap * 0.15, p.x / 2, p.y / 2, yaricap / 2);
    g.addColorStop(0, `rgba(0,0,0,${Math.min(1, guc).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    lg.fillStyle = g; lg.beginPath(); lg.arc(p.x / 2, p.y / 2, yaricap / 2, 0, Math.PI * 2); lg.fill(); lg.restore();
  };
  const lekeyiKaldir = (l: Leke) => { lg.save(); lg.globalCompositeOperation = 'destination-out'; lg.beginPath(); lg.arc(l.x / 2, l.y / 2, (l.r + 34) / 2, 0, Math.PI * 2); lg.fill(); lg.restore(); };
  lekeSil({ x: 4, y: 4 }, 6, 0.5);
  const islak = resim(BOYA.islak, 'vk-fon by-islak');
  const tuyKabarik = resim(BOYA.tuyKabarik, 'vk-fon by-tuy');
  const kopukler = Object.fromEntries(RENKLER.map(r => [r, new KopukKatmani(cozulmus.get(BOYA.kopukler[r])!)])) as Record<Renk, KopukKatmani>;
  const kopukKalan = () => RENKLER.reduce((t, r) => t + kopukler[r].dolular().length, 0);
  const benekResimleri = benekler.map((b, i) => { const r = resim(BOYA.benekler[b.renk], 'vk-katman by-benek'); ortala(r, b, BENEK_BOYU, BENEK_BOYU); r.style.rotate = (i * 47) % 360 + 'deg'; return r; });
  const damlaKati = el('div', 'vk-katman by-damlalar');
  const baloncukKati = el('div', 'vk-katman by-baloncuklar');
  const etkiKati = el('div', 'vk-katman by-etki');
  const damlaHavuzu: HTMLImageElement[] = Array.from({ length: 14 }, () => { const r = resim(BOYA.damla, 'vk-katman by-damla'); etkiKati.append(r); return r; });
  // alet şeridi: sabun (sonra boş), çubuk (sonra ayna), sprey, havlu
  const dok = el('div', 'vk-katman vk-serit vk-dok'); koy(dok, YAKIN.serit);
  dok.append(resim(ORTAK.serit));
  const dokDugmesi = (ad: string, etiket: string, i: number) => {
    const b = el('button', 'vk-dok-aleti'); b.type = 'button'; b.setAttribute('aria-label', etiket);
    const [x, y] = SERIT_YUVALARI[i]; ortala(b, { x, y }, DOK_ALET_BOYU, DOK_ALET_BOYU); b.append(resim(ad));
    dok.append(b);
    return b;
  };
  const dokSabun = dokDugmesi(BOYA.sabun, 'Sabun', 0);
  const dokCubuk = dokDugmesi(BOYA.cubuk, 'Pamuklu çubuk', 1);
  const dokAyna = dokDugmesi(BOYA.ayna, 'Ayna', 1); dokAyna.hidden = true;
  const dokSprey = dokDugmesi(BOYA.sprey, 'Sprey şişesi', 2);
  const dokHavlu = dokDugmesi(BOYA.havluKuru, 'Havlu', 3);
  if (!benekler.length) dokCubuk.hidden = true;
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
  const icKatman = (alet: AletAdi, ad: string, x: number, y: number, g: number, h: number, sinif: string) => {
    const o = ALETLER[alet].g / 600, r = resim(ad, sinif);
    Object.assign(r.style, { left: (x - g / 2) * o + 'px', top: (y - h / 2) * o + 'px', width: g * o + 'px', height: h * o + 'px' });
    return r;
  };
  const sabunY = yigin([BOYA.sabun, BOYA.sabunKopuklu], 'by-alet-yigin');
  const sungerY = yigin([BOYA.sunger, ...BOYA.sungerKopuk, ...BOYA.sungerKirli, BOYA.sungerSikis], 'by-alet-yigin');
  const cubukY = yigin([BOYA.cubuk, BOYA.cubukBoyali], 'by-alet-yigin');
  const spreyY = yigin([BOYA.sprey, BOYA.spreyBasili], 'by-alet-yigin');
  const havluY = yigin([BOYA.havluKuru, BOYA.havluIslak, ...BOYA.havluOvus], 'by-alet-yigin');
  const aynaParilti = icKatman('ayna', BOYA.aynaParilti[0], 300, 220, 300, 300, 'by-ayna-parilti');
  let parKaresi = 0;
  const hazirKutu: Record<AletAdi, HTMLDivElement> = {
    sabun: hazirla('sabun', sabunY.kutu),
    sunger: hazirla('sunger', sungerY.kutu),
    cubuk: hazirla('cubuk', cubukY.kutu),
    sprey: hazirla('sprey', spreyY.kutu),
    havlu: hazirla('havlu', havluY.kutu),
    ayna: hazirla('ayna', resim(BOYA.ayna), aynaParilti),
  };
  const golgeler: Record<AletAdi, HTMLCanvasElement> = {
    sabun: golgeYap(cozulmus.get(BOYA.sabun)!, ALETLER.sabun.g, ALETLER.sabun.y),
    sunger: golgeYap(cozulmus.get(BOYA.sunger)!, ALETLER.sunger.g, ALETLER.sunger.y),
    cubuk: golgeYap(cozulmus.get(BOYA.cubuk)!, ALETLER.cubuk.g, ALETLER.cubuk.y),
    sprey: golgeYap(cozulmus.get(BOYA.sprey)!, ALETLER.sprey.g, ALETLER.sprey.y),
    havlu: golgeYap(cozulmus.get(BOYA.havluKuru)!, ALETLER.havlu.g, ALETLER.havlu.y),
    ayna: golgeYap(cozulmus.get(BOYA.ayna)!, ALETLER.ayna.g, ALETLER.ayna.y),
  };
  elKati.prepend(...Object.values(golgeler));
  const kinoYakinY = KINO_VAR ? yigin(Object.values(KINO_POZLARI), 'vk-katman vk-kino-yakin') : null;
  if (kinoYakinY) koy(kinoYakinY.kutu, YAKIN.kino);
  function kinoTepki(poz: KinoPozu, ms = 700, px = 22) {
    kinoTepkiPozu = poz; kinoTepkiSonu = performance.now() + ms;
    hop(kinoYakinY?.kutu, px);
  }
  yakin.append(resim(BOYA.fon, 'vk-fon'), kova, basY.kutu, leke, islak, tuyKabarik, ...RENKLER.map(r => kopukler[r].tuval), ...benekResimleri, damlaKati, sungerYer, baloncukKati, etkiKati,
    ...(kinoYakinY ? [kinoYakinY.kutu] : []), dok, elKati);
  kenarUzat(yakin, [[cozulmus.get(BOYA.fon), TAM]]);

  const tekrar = el('button', 'vk-tekrar'); tekrar.style.width = tekrar.style.height = TEKRAR_BOYU + 'px'; tekrar.type = 'button'; tekrar.setAttribute('aria-label', 'Yeniden oyna'); tekrar.hidden = true;
  { const r = el('img', ''); r.src = TEKRAR_DUGMESI; r.alt = ''; r.draggable = false; tekrar.append(r); }
  sahne.append(hub, yakin, tekrar);
  kok.append(sahne);
  boyutla();

  // ——————————————————————————— etkiler (yalnız Astra'nın çizimlerini canlandırır)
  function oynat(adlar: readonly string[], p: Nokta, g: number, h: number, ms: number, sec: { hedef?: HTMLElement; taban?: boolean; kay?: number; kayX?: number; don?: number; sonda?: 'sondur' | 'kal' } = {}): Promise<HTMLImageElement> {
    const r = resim(adlar[0], 'vk-katman by-dizi');
    koy(r, { sol: p.x - g / 2, ust: sec.taban ? p.y - h : p.y - h / 2, g, y: h });
    (sec.hedef ?? etkiKati).append(r);
    const kx = sec.kayX ?? 0, ky = sec.kay ?? 0, d = sec.don ?? 0, kal = sec.sonda === 'kal';
    const a = r.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${kx}px, ${-ky}px) rotate(${d}deg)`, opacity: 1, offset: kal ? 1 : 0.8 },
      ...(kal ? [] : [{ transform: `translate(${kx * 1.15}px, ${-ky * 1.15}px) rotate(${d}deg)`, opacity: 0 }]),
    ], { duration: sure(ms * adlar.length), easing: 'linear', fill: 'forwards' });
    adlar.forEach((ad, i) => { if (i) setTimeout(() => { r.src = adres(ad) ?? ''; }, sure(ms * i)); });
    return a.finished.then(() => { if (!kal) r.remove(); return r; }, () => { r.remove(); return r; });
  }
  function parilti(p: Nokta, boy = 190, hedef: HTMLElement = etkiKati) {
    const r = resim(ORTAK.pof[1], 'vk-katman vk-pof'); ortala(r, p, boy, boy); hedef.append(r);
    void r.animate([{ transform: 'scale(.5)', opacity: 1 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: sure(380), easing: 'ease-out' }).finished.then(() => r.remove(), () => r.remove());
  }
  function damlaSac(p: Nokta, adet: number, guc = 1) {
    for (let i = 0; i < adet; i++) {
      const r = damlaHavuzu.pop(); if (!r) return;
      const vx = (Math.random() - 0.5) * 320 * guc, yuk = (110 + Math.random() * 150) * guc, k = 0.6 + Math.random() * 0.6;
      const yer = (x: number, y: number, s: number, a: number) => `translate(${(p.x + x - 30).toFixed(1)}px, ${(p.y + y - 40).toFixed(1)}px) rotate(${a.toFixed(0)}deg) scale(${s.toFixed(2)})`;
      const geri = () => { damlaHavuzu.push(r); };
      void r.animate([
        { transform: yer(0, 0, k * 0.4, 0), opacity: 1 },
        { transform: yer(vx * 0.55, -yuk, k, vx * 0.08), opacity: 1, offset: 0.45 },
        { transform: yer(vx, 40, k * 0.8, vx * 0.15), opacity: 0 },
      ], { duration: sure(460 + Math.random() * 160), easing: 'cubic-bezier(.2,.7,.5,1)' }).finished.then(geri, geri);
    }
  }
  /** püskürtmeden sonra yüzde bir damla üç karede süzülür ve durur (havlu alır) */
  function damlaBirak(p: Nokta) {
    if (damlalar.filter(d => d.kalan > 0).length >= EN_COK_DAMLA) return;
    const kay = 60 + Math.random() * 60;
    const yer = { x: p.x, y: Math.min(PATILER.ust + PATILER.y - 30, p.y + kay) };
    const r = resim(BOYA.damla, 'vk-katman by-yuz-damla'); ortala(r, yer, 48, 64); r.style.opacity = '.001'; damlaKati.append(r);
    void oynat(BOYA.damlaSuzul, { x: p.x, y: yer.y + 30 }, 80, 200, KARE_MS.suzul, { hedef: damlaKati, taban: true }).then(() => { r.style.opacity = ''; });
    damlalar.push({ x: yer.x, y: yer.y, kalan: KURULA_YOLU, r });
  }
  const kovaDalga = () => oynat(BOYA.kovaDalga, { x: KOVA.kutu.sol + KOVA.kutu.g / 2, y: KOVA.kutu.ust + KOVA.kutu.y / 2 }, KOVA.kutu.g, KOVA.kutu.y, KARE_MS.dalga, { hedef: kova });
  const kovaSicrat = (p: Nokta = KOVA.yuz, olcek = 1) => oynat(BOYA.kovaSicrama, p, 300 * olcek, 300 * olcek, KARE_MS.sicrama, { taban: true });

  function asamaGec(a: Asama) {
    asama = a;
    kok.dataset.asama = a;
    dokSabun.classList.toggle('vk-sirada', a === 'kopurt');
    sungerYer.classList.toggle('vk-sirada', a === 'ov' || a === 'calkala');
    dokCubuk.classList.toggle('vk-sirada', a === 'cubuk');
    dokSprey.classList.toggle('vk-sirada', a === 'pisk');
    dokHavlu.classList.toggle('vk-sirada', a === 'kurula');
    dokAyna.classList.toggle('vk-sirada', a === 'ayna');
    kova.classList.toggle('vk-sirada', a === 'calkala');
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
    setTimeout(() => { soyle('mi-canta'); yuzDugmesi.hidden = false; }, sure(420));
    setTimeout(() => hop(kinoY?.kutu, 14, 220), sure(1150));
  });
  yuzDugmesi.addEventListener('pointerdown', () => { if (asama === 'canta') void yaklas(); });

  const kamera = (k: number) => {
    const y = MASA.yaklasma, t = (k - 1) / (y.olcek - 1);
    return `translate(${y.x + (SAHNE.g / 2 - y.x) * t - y.x * k}px, ${y.y + (SAHNE.y / 2 - y.y) * t - y.y * k}px) scale(${k})`;
  };
  async function yaklas() {
    if (geciste) return;
    geciste = true;
    yuzDugmesi.hidden = true;
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
    milaY.goster(BOYA.sevinc[0]);
    void yakin.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(260), easing: 'ease-out', fill: 'forwards' });
    await hub.animate([{ transform: kamera(MASA.yaklasma.olcek) }, { transform: kamera(1) }], { duration: sure(KAPANIS.kamera), easing: 'cubic-bezier(.3,0,.3,1)' }).finished.catch(() => undefined);
    yakin.classList.add('vk-altta');
    geciste = false;
  }

  // ——————————————————————————— elde tutulan alet
  let tutulan: Tutulan | null = null;
  const ucNoktasi = (t: Tutulan, parmak = t.parmak): Nokta => ({ x: parmak.x - t.tut[0] * t.g + t.uc[0] * t.g, y: parmak.y - t.kaldir - t.tut[1] * t.y + t.uc[1] * t.y });
  const ucaCiz = (t: Tutulan, uc: Nokta) => {
    const x = uc.x - t.uc[0] * t.g, y = uc.y - t.uc[1] * t.y, don = `rotate(${t.egim.toFixed(2)}deg) scale(${ELDE_OLCEK})`;
    t.kutu.style.transform = `translate3d(${x}px, ${y}px, 0) ${don}`;
    if (t.golge) t.golge.style.transform = `translate3d(${x + 18}px, ${y + 32}px, 0) ${don}`;
  };
  const golgeSondur = (t: Tutulan) => { const g = t.golge; if (!g) return; g.getAnimations().forEach(c => c.cancel()); g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(150), fill: 'forwards' }); };
  /** eldeki süngerin görünüşü: kirliyse kirli kademe, değilse köpüklü */
  const sungerGoster = () => { sungerY.goster(kirli ? BOYA.sungerKirli[1] : kir > 0 && kirKademesi(kir, kirSiniri(iz, secili.length)) >= 1 ? BOYA.sungerKirli[0] : BOYA.sungerKopuk[1]); };
  function tut(kaynak: HTMLElement, alet: AletAdi, e: PointerEvent) {
    const a = ALETLER[alet], kutu = hazirKutu[alet];
    kutu.getAnimations().forEach(c => c.cancel());
    kutu.classList.remove('vk-bekler');
    const t: Tutulan = { alet, kaynak, kutu, g: a.g, y: a.y, tut: a.tut, uc: a.uc, kaldir: 40, parmak: noktaya(e), id: e.pointerId, egim: 0, once: noktaya(e), ucOnce: null };
    kutu.style.transformOrigin = `${a.uc[0] * 100}% ${a.uc[1] * 100}%`;
    const golge = golgeler[alet];
    golge.style.transformOrigin = kutu.style.transformOrigin;
    golge.getAnimations().forEach(c => c.cancel());
    golge.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(140), easing: 'ease-out', fill: 'forwards' });
    t.golge = golge;
    hop(kinoYakinY?.kutu, 8, 200);
    kaynak.classList.add('vk-kalkti');
    try { kaynak.setPointerCapture(e.pointerId); } catch { /* pencere olayları yeter */ }
    tutulan = t;
    ucaCiz(t, ucNoktasi(t));
    for (const c of kutu.children) {
      if (!(c instanceof HTMLElement) || c === aynaParilti) continue;
      c.style.transformOrigin = `${a.tut[0] * 100}% ${a.tut[1] * 100}%`;
      c.animate([{ transform: 'scale(.82)' }, { transform: 'scale(1)' }], { duration: sure(120), easing: 'cubic-bezier(.2,.8,.3,1.3)' });
    }
    if (alet === 'sunger') sungerGoster();
    ses('e-tik', 0.7, 1.2);
    pis = { ...pis, son: null, bekleme: 0 };
    cal = { ...cal, uc: null, tepe: null, yon: 0 };
    kopurt = { ...kopurt, uc: null, tepe: null, yon: 0 };
    kovada = false;
  }
  const bekleyeAl = (t: Tutulan) => {
    t.kaynak.classList.remove('vk-kalkti');
    if (tutulan && tutulan.kutu === t.kutu) return;
    t.kutu.getAnimations().forEach(c => c.cancel()); t.kutu.classList.add('vk-bekler');
  };
  function birak(t: Tutulan) {
    if (tutulan === t) tutulan = null;
    golgeSondur(t);
    aynaParilti.classList.remove('by-gorunur');
    const k = t.kaynak.getBoundingClientRect(), s = sahne.getBoundingClientRect();
    const hedef = { x: (k.left + k.width / 2 - s.left) / S, y: (k.top + k.height / 2 - s.top) / S };
    const bitir = () => bekleyeAl(t);
    if (!t.kaynak.isConnected || t.kaynak.hidden) { bitir(); return; }
    const ox = t.uc[0] * t.g, oy = t.uc[1] * t.y, kucuk = Math.min(1, (k.height / S) / t.y);
    void t.kutu.animate([{ transform: t.kutu.style.transform }, { transform: `translate3d(${hedef.x - ox - kucuk * (t.g / 2 - ox)}px, ${hedef.y - oy - kucuk * (t.y / 2 - oy)}px, 0) rotate(0deg) scale(${kucuk})` }],
      { duration: sure(190), easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }).finished.then(bitir, bitir);
  }
  const siradaki = (): HTMLElement[] => (asama === 'kopurt' ? [dokSabun] : asama === 'ov' ? [sungerYer] : asama === 'calkala' ? [sungerYer, kova] : asama === 'cubuk' ? [dokCubuk]
    : asama === 'pisk' ? [dokSprey] : asama === 'kurula' ? [dokHavlu] : asama === 'baloncuk' ? [...baloncukKati.querySelectorAll<HTMLElement>('.by-baloncuk:not(.by-patladi)')] : asama === 'ayna' ? [dokAyna] : []);
  const yanlis = (b: HTMLElement) => { salla(b); ses('e-tik', 0.5, 0.8); kinoTepki('sasir', 450, 10); siradaki().filter(x => x !== b).forEach(ziplat); };
  const hazirMi = (e: PointerEvent) => e.button === 0 && !tutulan && !geciste;
  const aletDugmesi = (b: HTMLElement, alet: AletAdi, sira: (a: Asama) => boolean) => b.addEventListener('pointerdown', e => {
    if (!hazirMi(e)) return;
    if (!sira(asama)) { yanlis(b); return; }
    tut(b, alet, e);
  });
  aletDugmesi(dokSabun, 'sabun', a => a === 'kopurt');
  aletDugmesi(sungerYer, 'sunger', a => a === 'ov' || a === 'calkala');
  aletDugmesi(dokCubuk, 'cubuk', a => a === 'cubuk');
  aletDugmesi(dokSprey, 'sprey', a => a === 'pisk');
  aletDugmesi(dokHavlu, 'havlu', a => a === 'kurula');
  aletDugmesi(dokAyna, 'ayna', a => a === 'ayna');
  const hareket = (e: PointerEvent) => { const t = tutulan; if (!t || e.pointerId !== t.id) return; t.parmak = noktaya(e); ucaCiz(t, ucNoktasi(t)); };
  const kalk = (e: PointerEvent) => { const t = tutulan; if (!t || e.pointerId !== t.id) return; birak(t); };
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
      if (mildaMi(p)) { hop(basY.kutu, 8, 200); ses('e-hihi', 0.5, 1.1); }
      if (icinde(KOVA.kutu)) { damlaSac(KOVA.yuz, 3, 0.5); void kovaDalga(); ses('y-calkala', 0.35, 1.3); }
      const sira = siradaki();
      if (sira.length) { sira.forEach(ziplat); kinoTepki('sevin', 520, 12); }
    } else {
      if (kinoY && icinde(HUB.kino)) { kinoSasirdi = performance.now(); hop(kinoY.kutu, 18); return; }
      if (icinde(MASA.mila) && asama !== 'kutlama' && asama !== 'son') hop(milaY.kutu, 10, 220);
      if (asama === 'giris') salla(canta); else if (asama === 'canta' && !yuzDugmesi.hidden) ziplat(yuzDugmesi);
    }
  });

  // ——————————————————————————— aşamaların işi
  function sabunKaresi(h: Tutulan, uc: Nokta, dt: number) {
    const once = kopurt.sayi;
    kopurt = kopurtAdimi(kopurt, uc, dt);
    if (kopurt.sayi <= once) return;
    ses('y-sabun', 0.85, 0.9 + Math.random() * 0.25);
    sabunY.goster(BOYA.sabunKopuklu);
    yerSungerY.goster([BOYA.sunger, ...BOYA.sungerKopuk][kopukKademesi(kopurt.sayi, Z.kopurt)]);
    pop(yerSungerY.kutu, 160);
    void oynat([BOYA.baloncukUcan], { x: KOVA.sunger.x + (Math.random() - 0.5) * 120, y: KOVA.sunger.y - 120 }, 300, 300, 520, { kay: 140, kayX: (Math.random() - 0.5) * 120 });
    hop(kinoYakinY?.kutu, 6, 160);
    if (!kopukSoylendi && kopurt.sayi >= 2) { kopukSoylendi = true; soyle('mi-kopuk'); }
    if (kopurt.sayi >= Z.kopurt) {
      yerSungerY.goster(BOYA.sungerKopuk[1]);
      parilti(KOVA.sunger, 240); ses('e-cin', 0.5, 1.2);
      kinoTepki('sevin', 600, 18);
      birak(h);
      setTimeout(() => { if (calisiyor) dokSabun.hidden = true; }, sure(240));
      ilerle();
      ziplat(sungerYer);
    }
  }
  function sungerKaresi(h: Tutulan, uc: Nokta, yol: number, dt: number, an: number) {
    if (asama === 'calkala') {
      const suda = kovadaMi(uc);
      if (suda && !kovada) { ses('y-calkala', 0.9); void kovaSicrat(); damlaSac(KOVA.yuz, 6); void kovaDalga(); hop(kinoYakinY?.kutu, 10, 200); }
      kovada = suda;
      if (suda) {
        const once = cal.sayi;
        cal = calkalaAdimi(cal, uc, dt);
        sungerY.goster(Math.abs(yol) > 3 ? BOYA.sungerSikis : BOYA.sungerKirli[1]);
        if (cal.sayi > once) {
          ses('y-calkala', 0.7, 0.9 + Math.random() * 0.25);
          void kovaDalga(); void kovaSicrat({ x: uc.x, y: KOVA.yuz.y }, 0.6);
          kova.animate([{ transform: 'rotate(0)' }, { transform: `rotate(${cal.sayi % 2 ? 2.5 : -2.5}deg)` }, { transform: 'rotate(0)' }], { duration: sure(220) });
        }
        if (cal.sayi >= Z.calkala) {
          yikama++; kir = 0; kirli = false;
          kovaSuY.kutu.classList.remove('by-berrak');
          kovaSuY.goster(BOYA.kovaSu[Math.max(0, suKademesi(yikama, Math.max(1, secili.length - 1)) - 1)]);
          pop(kovaSuY.kutu, 260);
          sungerGoster();
          cal = calkalaBaslangici();
          ses('y-sikis', 0.8); parilti(uc, 180);
          kinoTepki('sevin', 600, 18);
          asamaGec('ov');
        }
        return;
      }
      // yanlış hamle: sünger kirlendiği an süren ovma sayılmaz; yüzden ayrılıp yeniden ovulursa burun mor olur
      if (!mildaMi(uc)) { kirliOvma = ovmaSayaciBaslangici(); kirliAyrildi = true; return; }
      if (!kirliAyrildi) { if (yol > 2 && an - kirliIpucu > 900) { kirliIpucu = an; ziplat(kova); ses('e-hihi', 0.4, 1.2); } return; }
      kirliOvma = ovmaSayaciAdimi(kirliOvma, uc);
      if (kirliOvma.sayi >= YANLIS_OVMA) {
        sikikKalan = SIKIK_MS;
        if (!morBurun) {
          morBurun = true;
          lekeBoya(cozulmus.get(BOYA.burunMor)!, BURUN);
          iz = lekeEkle(iz, BURUN);
          for (let k = 0; k < 4; k++) kopukler.mor.ekle({ x: BURUN.x + (Math.random() - 0.5) * 90, y: BURUN.y + (Math.random() - 0.5) * 60 }, 110, Math.random() * 360);
          ses('y-sapir'); morKalan = MOR_MS;
          soyle('mi-mor');
          kinoTepki('sasir', 900, 24);
        } else if (an - sesAni > 900) { sesAni = an; ses('e-hihi', 0.8); kinoTepki('sasir', 500, 12); }
      }
      return;
    }
    // ov: köpüklü sünger lekenin üstünde gezdikçe leke silinir, köpük lekenin rengini alır
    if (!mildaMi(uc)) return;
    gidikKalan = GIDIK_MS;
    const i = lekeBul(iz, uc);
    const sayi = ovAdimi(iz, uc, yol, dt, Z.ovma);
    kir += sayi.reduce((a, b) => a + b, 0);
    if (i >= 0) {
      lekeSil(uc, SUNGER_YARICAPI * 1.15, ((Math.min(60, yol) + dt * 0.05) / Z.ovma) * 0.9);
      kopukYolu += Math.min(60, yol);
      if (kopukYolu - kopukAni > 46) {
        kopukAni = kopukYolu;
        kopukler[iz.lekeler[i].renk].ekle({ x: uc.x + (Math.random() - 0.5) * 120, y: uc.y + (Math.random() - 0.5) * 90 }, 110 + Math.random() * 50, Math.random() * 360);
        if (!renkSoylendi && kopukYolu > 300) { renkSoylendi = true; soyle('mi-renk'); }
        else if (!gidikSoylendi && kopukYolu > 1400) { gidikSoylendi = true; soyle('mi-gidik'); }
      }
      sungerGoster();
    }
    if (yol > 2 && an - sesAni > 220) { sesAni = an; ses('y-ov', 0.75, 0.9 + Math.random() * 0.25); }
    iz.lekeler.forEach((l, j) => {
      if (bitenLeke.has(j) || !lekeBittiMi(iz, j)) return;
      bitenLeke.add(j);
      iz.leke.forEach((x, k) => { if (x === j) iz.deger[k] = 1; });
      lekeyiKaldir(l);
      parilti(l, 230); ses('e-cin', 0.5, 1.1 + j * 0.06);
      kinoTepki('sevin', 600, 18);
      hop(basY.kutu, 8, 200);
    });
    if (bitenLeke.size >= iz.lekeler.length) { birak(h); ilerle(); return; }
    if (kir >= kirSiniri(iz, secili.length)) {
      kirli = true; kirliAyrildi = false; kirliOvma = ovmaSayaciBaslangici();
      sungerGoster();
      ses('y-sikis', 0.6, 0.8);
      if (!kirliSoylendi) { kirliSoylendi = true; soyle('mi-kirli'); }
      kinoTepki('sasir', 500, 14);
      asamaGec('calkala');
      ziplat(kova);
    }
  }
  function cubukKaresi(h: Tutulan, uc: Nokta, dt: number) {
    const r = benekAdimi(benekKalan, benekler, uc, dt);
    benekKalan = r.kalan;
    if (!r.alinanlar.length) return;
    alinanBenek += r.alinanlar.length;
    for (const i of r.alinanlar) {
      benekResimleri[i].animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.3) translateY(-30px)', opacity: 0 }], { duration: sure(200), fill: 'forwards' });
      void oynat(BOYA.benekPit, benekler[i], 120, 120, KARE_MS.pit);
    }
    cubukY.goster(BOYA.cubukBoyali);
    ses('y-pit', 0.9, 0.95 + alinanBenek * 0.06);
    h.kutu.animate([{ transform: h.kutu.style.transform }, { transform: h.kutu.style.transform + ' translateY(10px)' }, { transform: h.kutu.style.transform }], { duration: sure(140) });
    saskinKalan = 260;
    hop(kinoYakinY?.kutu, 8, 180);
    if (!pitSoylendi) { pitSoylendi = true; soyle('mi-pit'); }
    if (alinanBenek >= benekler.length) {
      parilti(uc, 200); ses('e-cin', 0.5); kinoTepki('sevin', 600, 18); birak(h); ilerle();
      // çubuğun yuvasına sonra ayna gelir
      setTimeout(() => { if (calisiyor) dokCubuk.hidden = true; }, sure(240));
    }
  }
  function spreyKaresi(h: Tutulan, uc: Nokta, dt: number) {
    const sis = sisNoktasi(uc);
    const r = pisAdimi(pis, sis, dt);
    pis = r.d;
    if (!r.pis) return;
    ses('y-pis', 0.9, 0.95 + Math.random() * 0.15);
    spreyY.goster(BOYA.spreyBasili);
    setTimeout(() => spreyY.goster(BOYA.sprey), sure(130));
    void oynat(BOYA.sis, { x: (uc.x + sis.x) / 2, y: sis.y }, 300, 300, KARE_MS.sis, { kayX: -60 });
    const vardi = kopukKalan();
    for (const renk of RENKLER) kopukler[renk].sil(sis, PIS_YARICAPI);
    if (kopukKalan() < vardi) void oynat(BOYA.kopukPof, sis, 300, 300, KARE_MS.pof);
    for (let k = 0; k < PIS_DAMLASI; k++) damlaBirak({ x: sis.x + (Math.random() - 0.5) * 160, y: sis.y + (Math.random() - 0.5) * 80 });
    islak.style.opacity = Math.min(1, 0.35 + pis.sayi * 0.2).toFixed(2);
    iyyKalan = IYY_MS;
    if (!serinSoylendi) { serinSoylendi = true; soyle('mi-serin'); }
    hop(kinoYakinY?.kutu, 8, 180);
    if (kopukKalan() === 0 && pis.sayi >= Z.pis) { kinoTepki('sevin', 600, 18); birak(h); ilerle(); }
  }
  function havluKaresi(h: Tutulan, uc: Nokta, yol: number, dt: number, an: number) {
    const yuzde = mildaMi(uc);
    if (yuzde) { sikikKalan = SIKIK_MS; if (!yumusakSoylendi) { yumusakSoylendi = true; soyle('mi-yumusak'); } }
    // ovarken havlu buruşur (iki kare); dururken kuru ya da ıslak
    const toplam = Math.max(1, damlalar.length), kalan = damlalar.filter(d => d.kalan > 0).length;
    if (yuzde && yol > 3 && an - ovusAni > KARE_MS.ovus) { ovusAni = an; havluY.goster(havluY.simdi() === BOYA.havluOvus[0] ? BOYA.havluOvus[1] : BOYA.havluOvus[0]); }
    else if (!yuzde || yol <= 3) havluY.goster(kalan <= toplam / 2 ? BOYA.havluIslak : BOYA.havluKuru);
    if (yol > 2 && yuzde && an - sesAni > 260) { sesAni = an; ses('y-havlu', 0.7, 0.9 + Math.random() * 0.2); }
    for (const i of kurulaAdimi(damlalar, uc, yol, dt)) {
      const d = damlalar[i];
      void d.r.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.2)', opacity: 0 }], { duration: sure(180), fill: 'forwards' }).finished.then(() => d.r.remove(), () => d.r.remove());
      void oynat(BOYA.tuyPof, d, 240, 240, KARE_MS.tuy);
    }
    const kalanSonra = damlalar.filter(d => d.kalan > 0).length;
    islak.style.opacity = Math.max(0.001, (kalanSonra / toplam) * 0.9).toFixed(3);
    tuyKabarik.style.opacity = Math.max(0.001, 1 - kalanSonra / toplam).toFixed(3);
    if (kalanSonra === 0) {
      havluY.goster(BOYA.havluIslak);
      tuyKabarik.style.opacity = '1'; islak.style.opacity = '.001';
      ses('e-cin', 0.6); kinoTepki('sevin', 600, 18);
      birak(h);
      ilerle();
      baloncuklarGelsin();
    }
  }
  /** kovadan sabun baloncukları yükselir; çocuk dokundukça patlar, Mila da patileriyle uzanır */
  function baloncuklarGelsin() {
    BALONCUKLAR.slice(0, Z.baloncuk).forEach((p, i) => {
      const b = el('button', 'vk-katman by-baloncuk'); b.type = 'button'; b.setAttribute('aria-label', 'Sabun baloncuğu ' + (i + 1));
      ortala(b, p, BALONCUK_DUGMESI, BALONCUK_DUGMESI);
      const r = resim(BOYA.baloncuk[i % 2]); b.append(r);
      baloncukKati.append(b);
      const dx = KOVA.yuz.x - p.x, dy = KOVA.yuz.y - p.y;
      b.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.2)`, opacity: 0 }, { transform: 'translate(0, 0) scale(1)', opacity: 1 }], { duration: sure(700 + i * 120), easing: 'cubic-bezier(.2,.7,.4,1)', delay: sure(i * 90) });
      b.style.setProperty('--gecikme', `${-i * 0.37}s`);
      b.addEventListener('pointerdown', e => {
        if (e.button !== 0 || asama !== 'baloncuk' || b.classList.contains('by-patladi') || tutulan || geciste) return;
        b.classList.add('by-patladi');
        r.style.opacity = '0';
        void oynat(BOYA.baloncukPatla, { x: BALONCUK_DUGMESI / 2, y: BALONCUK_DUGMESI / 2 }, BALONCUK_BOYU, BALONCUK_BOYU, KARE_MS.patla, { hedef: b }).then(() => { b.hidden = true; });
        patlayan++;
        ses('y-baloncuk', 0.9, 0.9 + patlayan * 0.06);
        patiKalan = PATI_MS;
        hop(kinoYakinY?.kutu, 10, 180);
        if (!baloncukSoylendi) { baloncukSoylendi = true; soyle('mi-baloncuk'); } else if (patlayan % 2 === 0) ses('e-hihi', 0.6, 1.1);
        if (patlayan >= Z.baloncuk) {
          kinoTepki('sevin', 700, 24);
          ilerle();
          dokAyna.hidden = false; pop(dokAyna, 260); ses('y-ayna', 0.6, 1.2);
        }
      });
    });
    void oynat([BOYA.baloncukUcan], { x: KOVA.yuz.x, y: KOVA.yuz.y - 120 }, 300, 300, 600, { kay: 200 });
  }
  function aynaKaresi(h: Tutulan, uc: Nokta, dt: number, an: number) {
    const onunde = aynadaMi(uc);
    aynaParilti.classList.toggle('by-gorunur', onunde);
    if (onunde) {
      const k = Math.floor(an / KARE_MS.parilti) % 3;
      if (k !== parKaresi) { parKaresi = k; const a = adres(BOYA.aynaParilti[k]) ?? ''; if (aynaParilti.getAttribute('src') !== a) aynaParilti.src = a; }
      if (!aynaSesi) { aynaSesi = true; ses('y-ayna', 0.9); }
      if (an - kalpAni > 380) { kalpAni = an; void oynat(BOYA.kalp, { x: YUZ.x + (Math.random() - 0.5) * 420, y: YUZ.y - 260 }, 160, 160, KARE_MS.kalp * 2, { kay: 160, kayX: (Math.random() - 0.5) * 60 }); }
    }
    ayna = aynaAdimi(ayna, onunde, dt, Z.ayna);
    if (ayna >= Z.ayna) {
      birak(h);
      asamaGec('kutlama');
      void kutla();
    }
  }

  const yakinYildizlari = yildizlar.havuz(etkiKati, 14);
  async function kutla() {
    ses('e-cin');
    const temiz = konus('mi-temiz');
    kinoTepki('sevin', 900, 28);
    yildizlar.sac(yakinYildizlari, { x: YUZ.x, y: YUZ.y }, 9, 320, 76);
    await bekle(KAPANIS.parlama);
    await uzaklas();
    if (!calisiyor) return;
    const t0 = performance.now();
    milaY.kutu.style.transformOrigin = '50% 62%';
    zipla = milaY.kutu.animate(ZIPLAMA_KARELERI, { duration: ZIPLAMA_MS, iterations: Infinity });
    ziplamaTuru = 0;
    yildizlar.yagdir(hubYildizlari, 14);
    kinoY?.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-16px)', offset: 0.45 }, { transform: 'translateY(0)' }], { duration: 300, iterations: 2, easing: 'ease-in-out' });
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
    await bekle(Math.max(0, KAPANIS.sevinc - (performance.now() - t0) - 300));
    if (!calisiyor) return;
    // şaka: Mila patisini yine boya kabına sokar (iki kare: sinsi gülüş, kıkır); Kino "Mila, Mila! Yine mi boya?"
    sakaOldu = true;
    zipla?.cancel(); zipla = null;
    milaY.goster(BOYA.saka);
    pop(milaY.kutu, 240);
    ses('y-sapir', 0.9);
    kinoSasirdi = performance.now();
    hop(kinoY?.kutu, 20);
    void temiz.then(() => (calisiyor && sahne.isConnected ? konus(KINO_SOZU) : undefined));
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
  tekrar.addEventListener('click', () => { calisiyor = false; iptal.abort(); sus(); baslat(kok, yas, secenek); });

  // ——————————————————————————— kare döngüsü
  let pozSimdi: BasPozu = 'kikir';
  function kare(an: number) {
    if (!calisiyor || !sahne.isConnected) return;
    const dt = Math.min(64, an - son); son = an;
    sikikKalan = Math.max(0, sikikKalan - dt); saskinKalan = Math.max(0, saskinKalan - dt); iyyKalan = Math.max(0, iyyKalan - dt);
    gidikKalan = Math.max(0, gidikKalan - dt); morKalan = Math.max(0, morKalan - dt); patiKalan = Math.max(0, patiKalan - dt);
    if (!hub.classList.contains('vk-altta')) {
      const t = an;
      if (sakaOldu) milaY.goster(Math.floor(t / 320) % 2 ? BOYA.sakaKikir : BOYA.saka);
      else if (asama === 'kutlama' || asama === 'son') {
        const zt = zipla && !TEST_MODU ? Number(zipla.currentTime ?? 0) : -1;
        milaY.goster(BOYA.sevinc[zt >= 0 ? ziplamaKaresi(zt) : sevincKaresi(t)]);
        if (zt >= 0) { const tur = Math.floor(zt / ZIPLAMA_MS); if (tur > ziplamaTuru) { ziplamaTuru = tur; inis(tur); } }
      }
      else { const k = beklemeKaresi(t); milaY.goster(k === 'kirp' ? BOYA.boyaliKirp : BOYA.boyali[k === 'a' ? 0 : 1]); }
      if (kinoY) kinoY.goster(kinoSasirdi && an - kinoSasirdi < 1100 ? SECMELI.kino.sasir : asama === 'kutlama' || asama === 'son' ? SECMELI.kino.alkis[alkisKaresi(t)] : SECMELI.kino.goster);
    }
    const h = tutulan;
    const aynaOrani = h && h.alet === 'ayna' && asama === 'ayna' && aynadaMi(ucNoktasi(h)) ? Math.max(0.01, ayna / Z.ayna) : 0;
    const poz = basPozu({ asama, sikikKalan, saskinKalan, iyyKalan, gidikKalan, morKalan, patiKalan, ayna: aynaOrani, kirp: beklemeKaresi(an) === 'kirp', an });
    if (poz !== pozSimdi) {
      const sessiz = poz === 'kirp' || pozSimdi === 'kirp' || poz.startsWith('pati') || pozSimdi.startsWith('pati');
      pozSimdi = poz;
      basY.goster(BOYA.bas[poz]);
      if (!sessiz) basY.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(200), easing: 'ease-out' });
    }
    // hayat: köpüklü sünger kovanın kenarında ara ara baloncuk çıkarır
    if (!h && (asama === 'ov' || asama === 'calkala') && an - parAni > 1600) { parAni = an; void oynat([BOYA.baloncukUcan], { x: KOVA.sunger.x, y: KOVA.sunger.y - 90 }, 220, 220, 700, { kay: 120, kayX: (Math.random() - 0.5) * 80 }); }
    if (kinoYakinY) {
      if (an >= kinoTepkiSonu) kinoTepkiPozu = null;
      const kp = kinoYakinPozu({ tepki: kinoTepkiPozu, kilitli: false, mercekte: aynaOrani > 0 });
      if (kp !== kinoSimdi) { if (!kinoTepkiPozu) hop(kinoYakinY.kutu, 10, 200); kinoSimdi = kp; kinoYakinY.goster(KINO_POZLARI[kp]); }
    }
    if (h) {
      const hx = (h.parmak.x - h.once.x) / Math.max(1, dt);
      h.once = h.parmak;
      const sinir = (h.alet === 'sunger' && asama === 'calkala') || h.alet === 'sabun' ? 14 : 8;
      const hedef = Math.max(-sinir, Math.min(sinir, hx * 9)), onceki = h.egim;
      h.egim += (hedef - h.egim) * Math.min(1, dt / 90);
      if (Math.abs(h.egim - onceki) > 0.01) ucaCiz(h, ucNoktasi(h));
      const uc = ucNoktasi(h);
      const yol = h.ucOnce ? Math.hypot(uc.x - h.ucOnce.x, uc.y - h.ucOnce.y) : 0;
      if (h.alet === 'sabun' && asama === 'kopurt') sabunKaresi(h, uc, dt);
      else if (h.alet === 'sunger' && (asama === 'ov' || asama === 'calkala')) sungerKaresi(h, uc, yol, dt, an);
      else if (h.alet === 'cubuk' && asama === 'cubuk') cubukKaresi(h, uc, dt);
      else if (h.alet === 'sprey' && asama === 'pisk') spreyKaresi(h, uc, dt);
      else if (h.alet === 'havlu' && asama === 'kurula') havluKaresi(h, uc, yol, dt, an);
      else if (h.alet === 'ayna' && asama === 'ayna') aynaKaresi(h, uc, dt, an);
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
      setTimeout(() => soyle('mi-boya'), sure(350));
      setTimeout(() => { if (calisiyor && asama === 'giris') { salla(canta); hop(kinoY?.kutu, 16); ses('e-tik', 0.5, 1.2); } }, sure(260));
      requestAnimationFrame(t => { son = t; requestAnimationFrame(kare); });
    });

  if (TEST_MODU || sorgu.has('kayit')) {
    const m = (e: Element): Nokta => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    (window as unknown as { __boya: unknown }).__boya = {
      asama: () => asama,
      gorunduAni: () => gorunduAni,
      uc: () => (tutulan ? ekrana(ucNoktasi(tutulan)) : null),
      olcek: () => S,
      poz: () => pozSimdi,
      nokta: (ad: string, i = 0): Nokta | null => {
        if (ad === 'canta') return m(canta);
        if (ad === 'yuz-dugmesi') return ekrana(MASA.yuz);
        if (ad === 'sabun') return m(dokSabun);
        if (ad === 'sunger') return m(sungerYer);
        if (ad === 'sunger-yeri') return ekrana(KOVA.sunger);
        if (ad === 'cubuk') return m(dokCubuk);
        if (ad === 'sprey') return m(dokSprey);
        if (ad === 'havlu') return m(dokHavlu);
        if (ad === 'ayna') return m(dokAyna);
        if (ad === 'leke') return iz.lekeler[i] ? ekrana(iz.lekeler[i]) : null;
        if (ad === 'kova') return ekrana({ x: KOVA.su.x, y: KOVA.su.y });
        if (ad === 'benek') return benekler[i] ? ekrana(benekler[i]) : null;
        if (ad === 'yuz') return ekrana({ x: YUZ.x, y: YUZ.y });
        if (ad === 'tekrar') return m(tekrar);
        return null;
      },
      kopukler: () => RENKLER.flatMap(r => kopukler[r].dolular()).map(ekrana),
      damlalar: () => damlalar.filter(d => d.kalan > 0).map(ekrana),
      baloncuklar: () => [...baloncukKati.querySelectorAll('.by-baloncuk:not(.by-patladi)')].map(m),
      sayim: () => ({ kopurt: kopurt.sayi, hedefKopurt: Z.kopurt, leke: iz.lekeler.length, biten: bitenLeke.size, oranlar: iz.lekeler.map((_, i) => lekeOrani(iz, i)), toplam: toplamOran(iz), kirli, yikama, calkala: cal.sayi, hedefCalkala: Z.calkala, morBurun,
        benek: alinanBenek, hedefBenek: benekler.length, pis: pis.sayi, hedefPis: Z.pis, kopuk: kopukKalan(), damla: damlalar.filter(d => d.kalan > 0).length, baloncuk: patlayan, hedefBaloncuk: Z.baloncuk, ayna, hedefAyna: Z.ayna, saka: sakaOldu }),
    };
  }
}
