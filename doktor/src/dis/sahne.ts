// Minik Doktor · "Mino'nun Kurabiyeli Dişleri": masa (yukarıdan) → çanta açılır → Mino'nun ağzına yakın plan: fener
// ("Aaaa!"), macunu kıllara sürerek sıkma, ileri geri fırçalama, su verme, yanaklara dokunarak çalkalama → masada kutlama.
// Çizimler Astra'dan (Paket Doktor-Y2, assets/doktor/dis/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
// Boyama kuralları Dikenli Pati'de ölçülenlerle aynı: iki görünüm de baştan çizili, pozlar üst üste boyalı, eldeki
// aletler ve köpük öbekleri baştan hazır (ilk kullanımda kare atlamaz).
import '../vaka/vaka.css';
import './dis.css';
import { TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { anaMenuyeDon } from '../../../src/uygulama';
import { efekt, konus, sesleriYukle, sus } from '../ses';
import { ZIPLAMA_KARELERI, golgeYap, kenarUzat, yildizEtkisi } from '../vaka/etki';
import { cevirUyarisi } from '../vaka/sahne';
import { DOK_ALET_BOYU, ELDE_OLCEK, HUB, SECMELI, SERIT_YUVALARI, SERIT_YUVA_BOYU, TEKRAR_BOYU, YAKIN, ZIPLAMA_MS, alkisKaresi, beklemeKaresi, kinoYakinPozu, sahneOlcegi, sevincKaresi, ziplamaKaresi, type KinoPozu, type Kutu, type Nokta, type Yas } from '../vaka/veri';
import {
  AC_MS, AGIZ, AGIZ_DUGMESI, ALETLER, DIS, DIS_DOSYALAR, DOK_MS, KAPANIS, TUP_DUGMESI, EFEKTLER, INCELE_MS, KIKIR_MS, MACUN_SOZLERI, MACUN_TAMAM, MASA, ORTAK, ORTAK_DOSYALAR, ORTAK_EFEKTLER, SAHNE, SOZLER, ZORLUK,
  agizdaMi, basPozu, bolmeler, dislerGorunur, dokmeAdimi, fenerAdimi, fircaAdimi, fircaBitti, macunAdimi, macunBaslangici, macunOrani, temizBolme,
  type AletAdi, type Asama, type BasPozu, type EfektAdi, type SozAdi,
} from './veri';

const TEKRAR_DUGMESI = new URL('../../../assets/hazirlik/dugmeler/tekrar.webp', import.meta.url).href;
const disDosyalar = import.meta.glob<string>('../../../assets/doktor/dis/*.webp', { eager: true, query: '?url', import: 'default' });
const ortakDosyalar = import.meta.glob<string>('../../../assets/doktor/vaka/*.webp', { eager: true, query: '?url', import: 'default' });
const sorgu = new URLSearchParams(location.search);
/** Yalnız geliştirme sunucusunda: çizimler gelmeden mekaniği denemek için geçici klasörden okur (uygulamaya girmez). */
const TASLAK = import.meta.env.DEV && sorgu.has('taslak');
const gercek = (ad: string): string | undefined => disDosyalar[`../../../assets/doktor/dis/${ad}.webp`] ?? ortakDosyalar[`../../../assets/doktor/vaka/${ad}.webp`];
const adres = (ad: string): string | undefined => (TASLAK && DIS_DOSYALAR.includes(ad) ? `/output/doktor/dis-taslak/${ad}.png` : gercek(ad));
export const eksikCizimler = (): string[] => [...(TASLAK ? [] : DIS_DOSYALAR), ...ORTAK_DOSYALAR].filter(ad => !gercek(ad));
const KINO = [SECMELI.kino.goster, SECMELI.kino.sasir, ...SECMELI.kino.alkis];
const KINO_VAR = KINO.every(ad => !!gercek(ad));
/** Yakın plandaki Kino'nun pozları (masadaki çizimler): izler, şaşırır, sevinir. */
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
/** yerinde büyüyüp zıplar: "sıra bende" */
const ziplat = (e: HTMLElement) => { e.animate([{ transform: 'scale(1) translateY(0)' }, { transform: 'scale(1.22) translateY(-14px)', offset: 0.4 }, { transform: 'scale(1) translateY(0)' }], { duration: sure(280), easing: 'ease-out' }); };
/** küçük bir zıplayış (karakterin tepkisi); süren başka bir harekete eklenir */
const hop = (e: HTMLElement | null | undefined, px = 20, ms = 260) => { e?.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-px}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(ms), easing: 'ease-out', composite: 'add' }); };
const salla = (e: HTMLElement) => e.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: sure(260) });

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
  kok.dataset.oyun = 'dis';
  cevirUyarisi(kok);
  const geri = el('button', 'vk-geri'); geri.type = 'button'; geri.setAttribute('aria-label', 'Geri'); geri.innerHTML = IKON.geri;
  geri.addEventListener('click', () => anaMenuyeDon());
  kok.append(geri);
  const eksik = eksikCizimler();
  if (eksik.length) { kok.dataset.durum = 'eksik'; kok.dataset.eksik = String(eksik.length); console.info('Diş vakası: ' + eksik.length + ' çizim bekleniyor (Paket Doktor-Y2):', eksik.join(', ')); return; }
  kok.dataset.durum = 'yukleniyor';
  const adlar = [...DIS_DOSYALAR, ...ORTAK_DOSYALAR];
  const hepsi = adlar.map(ad => { const r = new Image(); r.src = adres(ad)!; return r.decode().catch(() => undefined).then(() => r); });
  void Promise.all([Promise.all(hepsi), sesleriYukle([...Object.keys(SOZLER), ...EFEKTLER, ...ORTAK_EFEKTLER])]).then(([resimler]) => kur(kok, yas, secenek, new Map(adlar.map((ad, i) => [ad, resimler[i]]))));
}

function kur(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void }, cozulmus: Map<string, HTMLImageElement>) {
  const Z = ZORLUK[yas];
  const B = bolmeler(Z.sutun);
  const sahne = el('div', 'vk-sahne');
  let S = 1;
  /** sahnenin dışında kalan ekran payı (sahne pikseli); boş bant olmaz (→ kenarUzat) */
  const tasma = { yan: 0, dik: 0 };
  /** pencereye bağlanan dinleyiciler: yeniden oynayınca hepsi birden kalkar */
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
  let calisiyor = true, son = performance.now();
  let fener = 0, agizAcik = false, macun = macunBaslangici(), secilenMacun = -1, yol = B.map(() => 0), fircaOnce: Nokta | null = null, fircaYolu = 0, dokum = 0, suAgizda = false, calkala = 0;
  let kikirKalan = 0, kinoSasirdi = 0, sesAni = 0, isiltiAni = 0, gidikSoylendi = false, geciste = false;
  let zipla: Animation | null = null, ziplamaTuru = 0;
  let kinoTepkiPozu: KinoPozu | null = null, kinoTepkiSonu = 0, kinoSimdi: KinoPozu = 'izler';

  // ——————————————————————————— masa
  const hub = el('div', 'vk-gorunum vk-hub');
  const minoY = yigin([...DIS.uzgun, DIS.uzgunKirp, ...DIS.sevinc], 'vk-katman vk-zipzip');
  koy(minoY.kutu, MASA.mino);
  const canta = el('button', 'vk-katman vk-canta'); canta.type = 'button'; canta.setAttribute('aria-label', 'Doktor çantası'); koy(canta, HUB.canta);
  const cantaY = yigin([ORTAK.cantaKapali, ORTAK.cantaAcik], 'vk-canta-resmi'); canta.append(cantaY.kutu);
  const cantaAletleri = [DIS.fenerKapali, DIS.macunlar[0], DIS.firca, DIS.bardakDolu].map((ad, i) => {
    const r = resim(ad, 'vk-yuva-aleti');
    const [x, y] = HUB.yuvalar[i];
    ortala(r, { x, y }, HUB.yuvaBoyu[1], HUB.yuvaBoyu[1]);
    r.hidden = true;
    canta.append(r);
    return r;
  });
  const hubSerit = el('div', 'vk-katman vk-serit'); koy(hubSerit, HUB.serit);
  hubSerit.append(resim(ORTAK.serit));
  // şeritte üç macun tüpü yatık durur (ağzı sağda), dördüncü yuvada yıldız
  const yatikTup = (ad: string, i: number) => { const r = resim(ad, 'vk-yuva-aleti ds-yatik'); const [x, y] = SERIT_YUVALARI[i]; ortala(r, { x, y }, 110, 220); return r; };
  DIS.macunlar.forEach((ad, i) => hubSerit.append(yatikTup(ad, i)));
  const hubYildiz = resim(ORTAK.yildiz, 'vk-yuva-aleti'); { const [x, y] = SERIT_YUVALARI[3]; ortala(hubYildiz, { x, y }, SERIT_YUVA_BOYU[1], SERIT_YUVA_BOYU[1]); } hubSerit.append(hubYildiz);
  const kinoY = KINO_VAR ? yigin(KINO, 'vk-katman vk-kino') : null;
  if (kinoY) koy(kinoY.kutu, HUB.kino);
  const agizDugmesi = el('button', 'vk-katman vk-kol-dugmesi'); agizDugmesi.type = 'button'; agizDugmesi.setAttribute('aria-label', 'Mino\'nun ağzı'); ortala(agizDugmesi, MASA.agiz, AGIZ_DUGMESI[0], AGIZ_DUGMESI[1]); agizDugmesi.hidden = true;
  const yagmurKati = el('div', 'vk-katman vk-yagmur');
  const hubYildizlari = yildizlar.havuz(yagmurKati, 40);
  hub.append(resim(ORTAK.hubFon, 'vk-fon'), minoY.kutu, canta, hubSerit, ...(kinoY ? [kinoY.kutu] : []), agizDugmesi, yagmurKati);
  kenarUzat(hub, [[cozulmus.get(ORTAK.hubFon), TAM]]);

  // ——————————————————————————— yakın plan
  const yakin = el('div', 'vk-gorunum vk-yakin vk-altta');
  const basY = yigin(Object.values(DIS.bas), 'vk-fon ds-bas');
  // dişler: temiz dişlerin üstünde yalnız kir (bulaşık ve kırıntı) duran bir tuval; fırça geçtikçe silinir
  const disler = el('div', 'vk-fon ds-disler');
  const kir = el('canvas', 'vk-fon'); kir.width = SAHNE.g / 2; kir.height = SAHNE.y / 2;
  const kg = kir.getContext('2d', { willReadFrequently: true })!;
  {
    kg.drawImage(cozulmus.get(DIS.disKirli)!, 0, 0, kir.width, kir.height);
    const t = el('canvas', ''); t.width = kir.width; t.height = kir.height;
    const tg = t.getContext('2d', { willReadFrequently: true })!;
    tg.drawImage(cozulmus.get(DIS.disTemiz)!, 0, 0, t.width, t.height);
    const a = kg.getImageData(0, 0, kir.width, kir.height), b = tg.getImageData(0, 0, t.width, t.height);
    for (let i = 0; i < a.data.length; i += 4) {
      const fark = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
      a.data[i + 3] = Math.round(a.data[i + 3] * Math.max(0, Math.min(1, (fark - 30) / 40)));
    }
    kg.putImageData(a, 0, 0);
    kg.globalCompositeOperation = 'destination-out';
  }
  const kirSil = (p: Nokta, yaricap: number) => {
    const g = kg.createRadialGradient(p.x / 2, p.y / 2, yaricap * 0.2, p.x / 2, p.y / 2, yaricap / 2);
    g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    kg.fillStyle = g; kg.beginPath(); kg.arc(p.x / 2, p.y / 2, yaricap / 2, 0, Math.PI * 2); kg.fill();
  };
  const bolmeSil = (i: number) => { const k = B[i]; kg.fillStyle = '#000'; kg.fillRect(k.sol / 2 - 2, (k.ust - 30) / 2, k.g / 2 + 4, (k.y + 60) / 2); };
  kirSil({ x: 4, y: 4 }, 6); // ısınma: ilk silme yolu açılışta bir kez çalışır
  disler.append(resim(DIS.disTemiz, 'vk-fon'), kir);
  const isik = resim(DIS.isik, 'vk-katman ds-isik'); isik.style.width = isik.style.height = '560px';
  const su = resim(DIS.su, 'vk-katman ds-su'); koy(su, { sol: AGIZ.merkez.x - 70, ust: AGIZ.merkez.y - 330, g: 140, y: 280 });
  const kopukKati = el('div', 'vk-katman vk-kopuk-kati');
  const kopukHavuzu: HTMLImageElement[] = [];
  for (let i = 0; i < 40; i++) { const r = resim(ORTAK.kopuk, 'vk-katman vk-kopuk vk-bos'); ortala(r, { x: 660 + (i % 10) * 40, y: 640 + Math.floor(i / 10) * 40 }, 120, 120); kopukKati.append(r); kopukHavuzu.push(r); }
  kopukHavuzu[0].animate([{ scale: '.2' }, { scale: '1' }], { duration: 200 });
  function kopukKoy(p: Nokta, boy: number): HTMLImageElement {
    const r = kopukHavuzu.pop() ?? resim(ORTAK.kopuk, 'vk-katman vk-kopuk');
    r.classList.remove('vk-bos'); r.dataset.grup = 'dis';
    ortala(r, p, boy, boy);
    r.style.rotate = Math.round(Math.random() * 360) + 'deg';
    if (!r.isConnected) kopukKati.append(r);
    r.animate([{ scale: '.2', opacity: 0.4 }, { scale: '1.12', opacity: 1, offset: 0.7 }, { scale: '1', opacity: 1 }], { duration: sure(150), easing: 'ease-out' });
    return r;
  }
  /** bir köpük öbeği "pof" diye söner */
  function kopukPatlat(k: HTMLElement, sira = 0, kazanc = 0.3) {
    if (!k.isConnected || k.dataset.sondu) return;
    k.dataset.sondu = '1';
    ses('e-pof', kazanc, 1.45 + (sira % 5) * 0.14 + Math.random() * 0.08);
    const sil = () => k.remove();
    void k.animate([{ scale: '1', opacity: 1 }, { scale: '1.38', opacity: 0.9, offset: 0.55 }, { scale: '1.5', opacity: 0 }], { duration: sure(130), easing: 'ease-out', fill: 'forwards' }).finished.then(sil, sil);
  }
  /** öbekler tek tek, art arda söner */
  const kopukSil = (aralik = 40) => [...kopukKati.querySelectorAll<HTMLElement>('.vk-kopuk[data-grup="dis"]')].forEach((k, i) => { setTimeout(() => kopukPatlat(k, i, i < 10 ? 0.3 : 0.12), sure(30 + i * aralik)); });
  const yakinYildizlari = yildizlar.havuz(kopukKati, 14);
  function parilti(p: Nokta, boy = 190, hedef: HTMLElement = kopukKati) {
    const r = resim(ORTAK.pof[1], 'vk-katman vk-pof'); ortala(r, p, boy, boy); hedef.append(r);
    void r.animate([{ transform: 'scale(.5)', opacity: 1 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: sure(380), easing: 'ease-out' }).finished.then(() => r.remove(), () => r.remove());
  }
  // fırça havlunun üstünde: macun şeridi kılların üstünde, sıkıldıkça açılır
  const fircaYer = el('button', 'vk-katman ds-firca-yeri'); fircaYer.type = 'button'; fircaYer.setAttribute('aria-label', 'Diş fırçası'); koy(fircaYer, AGIZ.fircaYeri);
  const seritKutusu = (): { kutu: HTMLDivElement; goster: (ad: string) => void } => {
    const y = yigin(DIS.seritler, 'ds-macun-seridi');
    koy(y.kutu, { sol: AGIZ.killar.sol - AGIZ.fircaYeri.sol, ust: AGIZ.killar.y - 58 - AGIZ.fircaYeri.ust, g: AGIZ.killar.sag - AGIZ.killar.sol, y: 64 });
    return y;
  };
  const yerSerit = seritKutusu();
  fircaYer.append(resim(DIS.firca), yerSerit.kutu);
  const seritGoster = (kutu: HTMLElement, d = macun) => {
    const en = AGIZ.killar.sag - AGIZ.killar.sol;
    const a = d.sol === null ? 100 : ((d.sol - AGIZ.killar.sol) / en) * 100, b = d.sag === null ? 100 : 100 - ((d.sag - AGIZ.killar.sol) / en) * 100;
    kutu.style.clipPath = d.sol === null ? 'inset(0 100% 0 0)' : `inset(0 ${b.toFixed(1)}% 0 ${a.toFixed(1)}%)`;
  };
  seritGoster(yerSerit.kutu);
  // yanaklar: çalkalama sırasında dokunulur
  const yanaklar = AGIZ.yanaklar.map((p, i) => {
    const b = el('button', 'vk-katman vk-kol-dugmesi'); b.type = 'button'; b.setAttribute('aria-label', i ? 'Sağ yanak' : 'Sol yanak');
    ortala(b, p, AGIZ.yanakYaricapi * 1.7, AGIZ.yanakYaricapi * 1.7); b.hidden = true;
    return b;
  });
  // alet şeridi: fener ve üç macun tüpü; fırçalamadan sonra bardak gelir
  const dok = el('div', 'vk-katman vk-serit vk-dok'); koy(dok, AGIZ.serit);
  dok.append(resim(ORTAK.serit));
  const yuvaya = (r: HTMLElement, i: number, g: number, y: number) => { const [x, yy] = SERIT_YUVALARI[i]; ortala(r, { x, y: yy }, g, y); };
  const dokDugmesi = (ad: string, etiket: string, i: number, g: number, y: number, sinif = '') => {
    const b = el('button', 'vk-dok-aleti ' + sinif); b.type = 'button'; b.setAttribute('aria-label', etiket);
    yuvaya(b, i, g, y); b.append(resim(ad));
    dok.append(b);
    return b;
  };
  const dokFener = dokDugmesi(DIS.fenerKapali, 'Ağız feneri', 0, DOK_ALET_BOYU, DOK_ALET_BOYU);
  // tüpün dokunma kutusu çizimden geniş (küçük telefonda da en az 64 px); çizim içinde ortalanır
  const dokTupler = DIS.macunlar.map((ad, i) => dokDugmesi(ad, ['Naneli macun', 'Portakallı macun', 'Sade macun'][i], i + 1, TUP_DUGMESI[0], TUP_DUGMESI[1], 'ds-tup'));
  const dokBardak = dokDugmesi(DIS.bardakDolu, 'Su bardağı', 3, DOK_ALET_BOYU, DOK_ALET_BOYU); dokBardak.hidden = true;
  const elKati = el('div', 'vk-katman vk-el');
  // eldeki aletler: baştan kurulu ve boyalı bekler
  interface Tutulan { alet: AletAdi; kaynak: HTMLElement; kutu: HTMLDivElement; g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir: number; parmak: Nokta; id: number;
    /** gölgesi; gittiği yöne yatış açısı (derece); bir önceki karedeki parmak yeri */
    golge?: HTMLCanvasElement; egim: number; once: Nokta; }
  const hazirla = (alet: AletAdi, adlar: readonly string[], ek?: HTMLElement): HTMLDivElement => {
    const k = el('div', 'vk-tutulan vk-bekler'); k.dataset.alet = alet;
    k.style.width = ALETLER[alet].g + 'px'; k.style.height = ALETLER[alet].y + 'px';
    adlar.forEach((ad, i) => k.append(resim(ad, i ? 'vk-ikinci' : '')));
    if (ek) k.append(ek);
    elKati.append(k);
    return k;
  };
  const elSerit = seritKutusu();
  { const o = ALETLER.firca.g / AGIZ.fircaYeri.g; Object.assign(elSerit.kutu.style, { left: (AGIZ.killar.sol - AGIZ.fircaYeri.sol) * o + 'px', top: (AGIZ.killar.y - 58 - AGIZ.fircaYeri.ust) * o + 'px', width: (AGIZ.killar.sag - AGIZ.killar.sol) * o + 'px', height: 64 * o + 'px' }); }
  const hazirKutu = {
    fener: hazirla('fener', [DIS.fenerKapali, DIS.fenerAcik]),
    firca: hazirla('firca', [DIS.firca], elSerit.kutu),
    bardak: hazirla('bardak', [DIS.bardakDolu, DIS.bardakBos]),
  };
  const hazirTup = DIS.macunlar.map(ad => hazirla('macun', [ad]));
  elKati.append(isik);
  // eldeki aletin gölgesi (siluet bir kez çizilir; aletle birlikte yalnız transform ile gezer)
  const golgeler: Record<AletAdi, HTMLCanvasElement> = {
    fener: golgeYap(cozulmus.get(DIS.fenerKapali)!, ALETLER.fener.g, ALETLER.fener.y),
    macun: golgeYap(cozulmus.get(DIS.macunlar[0])!, ALETLER.macun.g, ALETLER.macun.y),
    firca: golgeYap(cozulmus.get(DIS.firca)!, ALETLER.firca.g, ALETLER.firca.y),
    bardak: golgeYap(cozulmus.get(DIS.bardakDolu)!, ALETLER.bardak.g, ALETLER.bardak.y),
  };
  elKati.prepend(...Object.values(golgeler));
  // Kino yakın planda da yanımızda: sağ alt köşeden izler, her adıma tepki verir (masadaki çizimleri)
  const kinoYakinY = KINO_VAR ? yigin(Object.values(KINO_POZLARI), 'vk-katman vk-kino-yakin') : null;
  if (kinoYakinY) koy(kinoYakinY.kutu, YAKIN.kino);
  function kinoTepki(poz: KinoPozu, ms = 700, px = 22) {
    kinoTepkiPozu = poz; kinoTepkiSonu = performance.now() + ms;
    hop(kinoYakinY?.kutu, px);
  }
  yakin.append(resim(DIS.agizFon, 'vk-fon'), basY.kutu, disler, su, ...(kinoYakinY ? [kinoYakinY.kutu] : []), kopukKati, fircaYer, ...yanaklar, dok, elKati);
  kenarUzat(yakin, [[cozulmus.get(DIS.agizFon), TAM]]);

  const tekrar = el('button', 'vk-tekrar'); tekrar.style.width = tekrar.style.height = TEKRAR_BOYU + 'px'; tekrar.type = 'button'; tekrar.setAttribute('aria-label', 'Yeniden oyna'); tekrar.hidden = true;
  { const r = el('img', ''); r.src = TEKRAR_DUGMESI; r.alt = ''; r.draggable = false; tekrar.append(r); }
  sahne.append(hub, yakin, tekrar);
  kok.append(sahne);
  boyutla();

  function asamaGec(a: Asama) {
    asama = a;
    kok.dataset.asama = a;
    dokFener.classList.toggle('vk-sirada', a === 'fener');
    dokTupler.forEach(t => t.classList.toggle('vk-sirada', a === 'macun'));
    fircaYer.classList.toggle('vk-sirada', a === 'firca');
    dokBardak.classList.toggle('vk-sirada', a === 'bardak');
  }

  // ——————————————————————————— masa: çanta ve ağza dokunma
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
    setTimeout(() => { soyle('m-canta'); agizDugmesi.hidden = false; }, sure(420));
    setTimeout(() => hop(kinoY?.kutu, 14, 220), sure(1150));
  });
  agizDugmesi.addEventListener('pointerdown', () => { if (asama === 'canta') void yaklas(); });

  const kamera = (k: number) => {
    const y = MASA.yaklasma, t = (k - 1) / (y.olcek - 1);
    return `translate(${y.x + (SAHNE.g / 2 - y.x) * t - y.x * k}px, ${y.y + (SAHNE.y / 2 - y.y) * t - y.y * k}px) scale(${k})`;
  };
  async function yaklas() {
    if (geciste) return;
    geciste = true;
    agizDugmesi.hidden = true;
    ses('e-vuu', 0.7);
    yakin.classList.remove('vk-altta');
    yakin.animate([{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], { duration: sure(430), easing: 'ease-in' });
    const asagi = `translateY(${Math.round(240 + tasma.dik)}px)`, dahaAsagi = `translateY(${Math.round(420 + tasma.dik)}px)`;
    dok.animate([{ transform: asagi }, { transform: asagi, offset: 0.6 }, { transform: 'translateY(0)' }], { duration: sure(620), easing: 'cubic-bezier(.2,.9,.3,1.15)' });
    kinoYakinY?.kutu.animate([{ transform: dahaAsagi }, { transform: dahaAsagi, offset: 0.55 }, { transform: 'translateY(0)' }], { duration: sure(700), easing: 'cubic-bezier(.2,.9,.3,1.15)' });
    await hub.animate([{ transform: kamera(1) }, { transform: kamera(MASA.yaklasma.olcek) }], { duration: sure(430), easing: 'cubic-bezier(.5,0,.6,1)' }).finished.catch(() => undefined);
    hub.classList.add('vk-altta');
    geciste = false;
    asamaGec('fener');
  }
  async function uzaklas() {
    geciste = true;
    ses('e-vuu', 0.7, 1.15);
    hub.classList.remove('vk-altta');
    minoY.goster(DIS.sevinc[0]);
    void yakin.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(260), easing: 'ease-out', fill: 'forwards' });
    await hub.animate([{ transform: kamera(MASA.yaklasma.olcek) }, { transform: kamera(1) }], { duration: sure(430), easing: 'cubic-bezier(.3,0,.3,1)' }).finished.catch(() => undefined);
    yakin.classList.add('vk-altta');
    geciste = false;
  }

  // ——————————————————————————— elde tutulan alet
  let tutulan: Tutulan | null = null;
  const ucNoktasi = (t: Tutulan, parmak = t.parmak): Nokta => ({ x: parmak.x - t.tut[0] * t.g + t.uc[0] * t.g, y: parmak.y - t.kaldir - t.tut[1] * t.y + t.uc[1] * t.y });
  /** aleti, ucu verilen noktaya gelecek biçimde çizer: elde bir parça büyük ve gittiği yöne hafifçe yatık; ikisi de ucun çevresinde */
  const ucaCiz = (t: Tutulan, uc: Nokta) => {
    const x = uc.x - t.uc[0] * t.g, y = uc.y - t.uc[1] * t.y, don = `rotate(${t.egim.toFixed(2)}deg) scale(${ELDE_OLCEK})`;
    t.kutu.style.transform = `translate3d(${x}px, ${y}px, 0) ${don}`;
    if (t.golge) t.golge.style.transform = `translate3d(${x + 18}px, ${y + 32}px, 0) ${don}`;
  };
  const golgeSondur = (t: Tutulan) => { const g = t.golge; if (!g) return; g.getAnimations().forEach(c => c.cancel()); g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(150), fill: 'forwards' }); };
  function tut(kaynak: HTMLElement, alet: AletAdi, kutu: HTMLDivElement, e: PointerEvent) {
    const a = ALETLER[alet];
    kutu.getAnimations().forEach(c => c.cancel());
    kutu.classList.remove('vk-bekler');
    kutu.classList.toggle('vk-kapali', alet === 'fener');           // fener ele alınınca yanar (ikinci çizim)
    const t: Tutulan = { alet, kaynak, kutu, g: a.g, y: a.y, tut: a.tut, uc: a.uc, kaldir: alet === 'fener' ? 30 : 50, parmak: noktaya(e), id: e.pointerId, egim: 0, once: noktaya(e) };
    kutu.style.transformOrigin = `${a.uc[0] * 100}% ${a.uc[1] * 100}%`;
    const golge = golgeler[alet];
    golge.style.transformOrigin = kutu.style.transformOrigin;
    golge.getAnimations().forEach(c => c.cancel());
    golge.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(140), easing: 'ease-out', fill: 'forwards' });
    t.golge = golge;
    hop(kinoYakinY?.kutu, 8, 200);
    kaynak.classList.add(alet === 'firca' ? 'ds-kalkti' : 'vk-kalkti');
    try { kaynak.setPointerCapture(e.pointerId); } catch { /* yakalanamazsa pencere olayları yeter */ }
    tutulan = t;
    ucaCiz(t, ucNoktasi(t));
    for (const c of kutu.children) {
      (c as HTMLElement).style.transformOrigin = `${a.tut[0] * 100}% ${a.tut[1] * 100}%`;
      c.animate([{ transform: 'scale(.82)' }, { transform: 'scale(1)' }], { duration: sure(120), easing: 'cubic-bezier(.2,.8,.3,1.3)' });
    }
    if (alet === 'fener') { ses('d-fener'); isik.classList.add('ds-yaniyor'); isikKoy(ucNoktasi(t)); } else ses('e-tik', 0.7, 1.2);
    if (alet === 'firca') fircaOnce = null;
  }
  /** alet yerine döner */
  function birak(t: Tutulan) {
    if (tutulan === t) tutulan = null;
    if (t.alet === 'fener') isik.classList.remove('ds-yaniyor');
    if (t.alet === 'bardak') su.classList.remove('ds-akiyor');
    golgeSondur(t);
    const k = t.kaynak.getBoundingClientRect(), s = sahne.getBoundingClientRect();
    const hedef = { x: (k.left + k.width / 2 - s.left) / S, y: (k.top + k.height / 2 - s.top) / S };
    const bitir = () => {
      t.kaynak.classList.remove('vk-kalkti', 'ds-kalkti');
      if (tutulan && tutulan.kutu === t.kutu) return;
      t.kutu.getAnimations().forEach(c => c.cancel()); t.kutu.classList.add('vk-bekler'); t.kutu.classList.remove('vk-kapali');
    };
    if (!t.kaynak.isConnected || t.kaynak.hidden) { bitir(); return; }
    // büyüme ve eğim ucun çevresinde: yerine ortalanması için öteleme ona göre hesaplanır
    const ox = t.uc[0] * t.g, oy = t.uc[1] * t.y, kucuk = Math.min(1, (k.height / S) / t.y);
    void t.kutu.animate([{ transform: t.kutu.style.transform }, { transform: `translate3d(${hedef.x - ox - kucuk * (t.g / 2 - ox)}px, ${hedef.y - oy - kucuk * (t.y / 2 - oy)}px, 0) rotate(0deg) scale(${kucuk})` }],
      { duration: sure(190), easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }).finished.then(bitir, bitir);
  }
  const isikKoy = (p: Nokta) => { isik.style.transform = `translate3d(${p.x - 280}px, ${p.y - 280}px, 0)`; };
  /** şu an sırası gelen alet(ler) */
  const siradaki = (): HTMLElement[] => (asama === 'fener' ? [dokFener] : asama === 'macun' ? (secilenMacun >= 0 && macun.sol !== null ? [dokTupler[secilenMacun]] : dokTupler) : asama === 'firca' ? [fircaYer] : asama === 'bardak' ? [dokBardak] : asama === 'calkala' ? yanaklar : []);
  // sırası gelmemiş alet: başını sallar, Kino şaşırır, sıradaki alet zıplar (ceza yok)
  const yanlis = (b: HTMLElement) => { salla(b); ses('e-tik', 0.5, 0.8); kinoTepki('sasir', 450, 10); siradaki().filter(x => x !== b).forEach(ziplat); };
  dokFener.addEventListener('pointerdown', e => {
    if (e.button !== 0 || tutulan || geciste) return;
    if (asama !== 'fener') { yanlis(dokFener); return; }
    tut(dokFener, 'fener', hazirKutu.fener, e);
  });
  dokTupler.forEach((b, i) => b.addEventListener('pointerdown', e => {
    if (e.button !== 0 || tutulan || geciste) return;
    if (asama !== 'macun') { yanlis(b); return; }
    // tat, şerit başlamadan değiştirilebilir; başladıktan sonra aynı tüple sürer
    if (macun.sol !== null && secilenMacun !== i) { yanlis(b); return; }
    secilenMacun = i;
    yerSerit.goster(DIS.seritler[i]); elSerit.goster(DIS.seritler[i]);
    tut(b, 'macun', hazirTup[i], e);
  }));
  fircaYer.addEventListener('pointerdown', e => {
    if (e.button !== 0 || tutulan || geciste) return;
    if (asama !== 'firca') { yanlis(fircaYer); return; }
    tut(fircaYer, 'firca', hazirKutu.firca, e);
  });
  dokBardak.addEventListener('pointerdown', e => {
    if (e.button !== 0 || tutulan || geciste) return;
    if (asama !== 'bardak') { yanlis(dokBardak); return; }
    tut(dokBardak, 'bardak', hazirKutu.bardak, e);
  });
  const hareket = (e: PointerEvent) => { const t = tutulan; if (!t || e.pointerId !== t.id) return; t.parmak = noktaya(e); ucaCiz(t, ucNoktasi(t)); if (t.alet === 'fener') isikKoy(ucNoktasi(t)); };
  const kalk = (e: PointerEvent) => { const t = tutulan; if (!t || e.pointerId !== t.id) return; birak(t); };
  addEventListener('pointermove', hareket, { signal: iptal.signal });
  addEventListener('pointerup', kalk, { signal: iptal.signal });
  addEventListener('pointercancel', kalk, { signal: iptal.signal });
  // Her dokunuşa anında karşılık: boş yere ya da karaktere dokununca küçük bir parıltı ve "tık"; dokunulan karakter
  // kıpırdar, sıradaki iş kendini gösterir (çanta, ağız ya da sıradaki alet).
  sahne.addEventListener('pointerdown', e => {
    if (e.button !== 0 || tutulan || geciste || (e.target as Element).closest('button')) return;
    const p = noktaya(e), yakinda = hub.classList.contains('vk-altta');
    const icinde = (k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
    ses('e-tik', 0.45, 1.35);
    parilti(p, 130, yakinda ? kopukKati : yagmurKati);
    if (yakinda) {
      if (kinoYakinY && icinde(YAKIN.kino)) { kinoTepki('sevin', 520, 20); return; }
      if (Math.hypot(p.x - AGIZ.merkez.x, p.y - (AGIZ.merkez.y - 180)) < 520) hop(basY.kutu, 8, 200);
      const sira = siradaki();
      if (sira.length) { sira.forEach(ziplat); kinoTepki('sevin', 520, 12); }
    } else {
      if (kinoY && icinde(HUB.kino)) { kinoSasirdi = performance.now(); hop(kinoY.kutu, 18); return; }
      if (icinde(MASA.mino) && asama !== 'kutlama' && asama !== 'son') hop(minoY.kutu, 10, 220);
      if (asama === 'giris') salla(canta); else if (asama === 'canta' && !agizDugmesi.hidden) ziplat(agizDugmesi);
    }
  });

  // ——————————————————————————— çalkalama: yanaklara dokunma
  yanaklar.forEach((b, i) => b.addEventListener('pointerdown', () => {
    if (asama !== 'calkala') return;
    calkala++;
    ses('d-blup', 1, 0.9 + (calkala % 2) * 0.2 + Math.random() * 0.1);
    const p = AGIZ.yanaklar[i];
    for (let k = 0; k < 3; k++) { const r = kopukKoy({ x: p.x + (Math.random() - 0.5) * 160, y: p.y - 40 - Math.random() * 120 }, 60 + Math.random() * 50); void r.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(500), delay: sure(250), fill: 'forwards' }).finished.then(() => r.remove(), () => r.remove()); }
    basY.kutu.animate([{ transform: 'translate(0, 0)' }, { transform: `translate(${i ? 14 : -14}px, -8px)`, offset: 0.4 }, { transform: 'translate(0, 0)' }], { duration: sure(200), easing: 'ease-out' });
    pop(b, 160);
    hop(kinoYakinY?.kutu, 10, 180);
    if (calkala >= Z.calkala) { yanaklar.forEach(y => { y.hidden = true; }); asamaGec('kutlama'); void kutla(); }
  }));

  async function kutla() {
    // dişler parlar: ışıltı üst sıradan alt sıraya geçer, yıldızlar saçılır. Bitiş sevinci kısa (en çok 2 sn): masaya
    // dönülür, Mino zıplar, yıldız yağar ve "yeniden oyna" hazırdır. Teşekkürünü ilk sözü bitince söyler.
    ses('e-cin');
    const parlak = konus('m-parlak');
    kinoTepki('sevin', 900, 28);
    yildizlar.sac(yakinYildizlari, { x: AGIZ.merkez.x, y: AGIZ.merkez.y - 20 }, 9, 320, 76);
    [AGIZ.ustDis, AGIZ.altDis].forEach((d, i) => setTimeout(() => { for (let k = 0; k < 3; k++) parilti({ x: d.sol + (d.g / 3) * (k + 0.5), y: d.ust + d.y / 2 }, 200); ses('d-isilti', 0.8, 1 + i * 0.15); }, sure(60 + i * 170)));
    await bekle(KAPANIS.parlama);
    await uzaklas();
    if (!calisiyor) return;
    const t0 = performance.now();
    minoY.kutu.style.transformOrigin = '50% 62%';
    zipla = minoY.kutu.animate(ZIPLAMA_KARELERI, { duration: ZIPLAMA_MS, iterations: Infinity });
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
    await bekle(Math.max(0, KAPANIS.sevinc - (performance.now() - t0)));
    if (!calisiyor) return;
    asamaGec('son');
    tekrar.hidden = false;
    pop(tekrar, 300);
    secenek.bitince?.();
    void parlak.then(() => { if (calisiyor && sahne.isConnected) soyle('m-tesekkur'); });
  }
  /** Mino her yere inişinde: yumuşak "pat", yeni yıldızlar; bitiş ekranında yalnız seyrek yıldız */
  function inis(tur: number) {
    if (asama === 'son') { yildizlar.yagdir(hubYildizlari, 2); return; }
    ses('e-pat', 0.3, 0.8);
    if (tur % 2 === 0) ses('e-cin', 0.14, 1.1 + (tur % 6) * 0.06);
    yildizlar.yagdir(hubYildizlari, 5);
  }
  // yeniden oyna: eski oyunun dinleyicileri ve sözü kapanır, her şey baştan kurulur
  tekrar.addEventListener('click', () => { calisiyor = false; iptal.abort(); sus(); baslat(kok, yas, secenek); });

  // ——————————————————————————— kare döngüsü
  let pozSimdi: BasPozu = 'kapali';
  function kare(an: number) {
    if (!calisiyor || !sahne.isConnected) return;
    const dt = Math.min(64, an - son); son = an;
    kikirKalan = Math.max(0, kikirKalan - dt);
    if (!hub.classList.contains('vk-altta')) {
      const t = an;
      if (asama === 'kutlama' || asama === 'son') {
        // zıplama sürerken kare ona uyar (havadayken ikinci poz); her inişte yıldız yağar
        const zt = zipla && !TEST_MODU ? Number(zipla.currentTime ?? 0) : -1;
        minoY.goster(DIS.sevinc[zt >= 0 ? ziplamaKaresi(zt) : sevincKaresi(t)]);
        if (zt >= 0) { const tur = Math.floor(zt / ZIPLAMA_MS); if (tur > ziplamaTuru) { ziplamaTuru = tur; inis(tur); } }
      }
      else { const k = beklemeKaresi(t); minoY.goster(k === 'kirp' ? DIS.uzgunKirp : DIS.uzgun[k === 'a' ? 0 : 1]); }
      if (kinoY) kinoY.goster(asama === 'kutlama' || asama === 'son' ? SECMELI.kino.alkis[alkisKaresi(t)] : kinoSasirdi && an - kinoSasirdi < 1100 ? SECMELI.kino.sasir : SECMELI.kino.goster);
    }
    const poz = basPozu({ asama, agizAcik, suAgizda, kikirKalan });
    if (poz !== pozSimdi) {
      pozSimdi = poz;
      basY.goster(DIS.bas[poz]);
      disler.classList.toggle('ds-gorunur', dislerGorunur(poz));
      basY.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(200), easing: 'ease-out' });
    }
    const h = tutulan;
    // yakın plandaki Kino: olaya tepki sürerken o poz; fener ağzın içindeyken şaşkın
    if (kinoYakinY) {
      if (an >= kinoTepkiSonu) kinoTepkiPozu = null;
      const kp = kinoYakinPozu({ tepki: kinoTepkiPozu, kilitli: false, mercekte: !!h && h.alet === 'fener' && asama === 'fener' && agizAcik });
      if (kp !== kinoSimdi) { if (!kinoTepkiPozu) hop(kinoYakinY.kutu, 10, 200); kinoSimdi = kp; kinoYakinY.goster(KINO_POZLARI[kp]); }
    }
    if (h) {
      // alet gittiği yöne hafifçe yatar (ucu yerinden oynamaz)
      const hx = (h.parmak.x - h.once.x) / Math.max(1, dt);
      h.once = h.parmak;
      const hedef = Math.max(-8, Math.min(8, hx * 9)), onceki = h.egim;
      h.egim += (hedef - h.egim) * Math.min(1, dt / 90);
      if (Math.abs(h.egim - onceki) > 0.01) ucaCiz(h, ucNoktasi(h));
    }
    if (h) {
      const uc = ucNoktasi(h);
      if (h.alet === 'fener' && asama === 'fener') {
        const once = fener;
        fener = fenerAdimi(fener, agizdaMi(uc), dt);
        if (once < AC_MS && fener >= AC_MS) { agizAcik = true; soyle('m-aaa'); hop(basY.kutu, 10, 220); }
        if (agizAcik && agizdaMi(uc) && an - isiltiAni > 230) {
          // ışık kırıntıların üstünden geçtikçe kırıntılar parlar
          isiltiAni = an;
          const d = Math.random() < 0.5 ? AGIZ.ustDis : AGIZ.altDis;
          parilti({ x: d.sol + Math.random() * d.g, y: d.ust + Math.random() * d.y }, 110);
          ses('d-isilti', 0.55, 1 + Math.random() * 0.3);
        }
        if (fener >= AC_MS + INCELE_MS) { birak(h); asamaGec('macun'); kinoTepki('sevin', 650); dokTupler.forEach(ziplat); }
      } else if (h.alet === 'macun' && asama === 'macun') {
        const once = macunOrani(macun);
        macun = macunAdimi(macun, uc);
        const oran = macunOrani(macun);
        if (oran > once) {
          seritGoster(yerSerit.kutu);
          if (an - sesAni > 170) { ses('d-fist', 0.8, 0.95 + oran * 0.3); sesAni = an; }
        }
        if (oran >= MACUN_TAMAM) {
          macun = { sol: AGIZ.killar.sol, sag: AGIZ.killar.sag };
          seritGoster(yerSerit.kutu); seritGoster(elSerit.kutu);
          soyle(MACUN_SOZLERI[Math.max(0, secilenMacun)]);
          parilti({ x: (AGIZ.killar.sol + AGIZ.killar.sag) / 2, y: AGIZ.killar.y - 20 }, 220);
          kinoTepki('sevin', 700, 24);
          birak(h);
          asamaGec('firca');
          dokFener.hidden = true;
          dokTupler.forEach((b, i) => setTimeout(() => { void b.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.5)', opacity: 0 }], { duration: sure(160), fill: 'forwards' }).finished.then(() => { b.hidden = true; }); }, sure(200 + i * 60)));
        }
      } else if (h.alet === 'firca' && asama === 'firca') {
        const onceTemiz = temizBolme(yol, Z.surtme);
        const r = fircaAdimi(yol, B, fircaOnce, uc);
        const gidilen = fircaOnce ? Math.hypot(uc.x - fircaOnce.x, uc.y - fircaOnce.y) : 0;
        fircaOnce = uc;
        if (r.bolme >= 0 && gidilen > 1) {
          yol = r.yol;
          kirSil(uc, 150);
          const onceYol = fircaYolu; fircaYolu += Math.min(80, gidilen);
          if (Math.floor(fircaYolu / 85) > Math.floor(onceYol / 85)) kopukKoy({ x: uc.x + (Math.random() - 0.5) * 120, y: uc.y + (Math.random() - 0.5) * 70 }, 90 + Math.random() * 60);
          if (an - sesAni > 150) { ses('d-fircala', 0.8, 0.9 + Math.random() * 0.25); sesAni = an; }
          if (fircaYolu > 260) elSerit.kutu.style.opacity = '.001';     // macun köpüğe döndü
          if (yol[r.bolme] >= Z.surtme && r.yol[r.bolme] - Math.min(80, gidilen) < Z.surtme) bolmeSil(r.bolme);
          const temiz = temizBolme(yol, Z.surtme);
          if (temiz > onceTemiz) {
            const k = B[r.bolme];
            parilti({ x: k.sol + k.g / 2, y: k.ust + k.y / 2 }, 170);
            ses('d-isilti', 0.7, 1 + temiz * 0.04);
            kinoTepki('sevin', 450, 14);
            kikirKalan = KIKIR_MS;
            if (!gidikSoylendi && temiz >= 2) { gidikSoylendi = true; soyle('m-gidik'); }
          }
          if (fircaBitti(yol, Z.surtme)) {
            B.forEach((_, i) => bolmeSil(i));
            kopukSil();
            ses('e-pof');
            kinoTepki('sevin', 800, 26);
            yildizlar.sac(yakinYildizlari, AGIZ.merkez, 7, 260, 60);
            birak(h);
            yerSerit.kutu.style.opacity = '.001';
            asamaGec('bardak');
            dokBardak.hidden = false; pop(dokBardak); ses('e-tik', 0.7, 1.2);
          }
        }
      } else if (h.alet === 'bardak' && asama === 'bardak') {
        const once = dokum;
        dokum = dokmeAdimi(dokum, agizdaMi(uc), dt);
        if (once === 0 && dokum > 0) ses('d-likir');
        su.classList.toggle('ds-akiyor', dokum > once && dokum < DOK_MS);  // su, bardak ağızdayken ve ağız açıkken akar
        if (dokum >= DOK_MS) {
          suAgizda = true;
          kinoTepki('sevin', 700, 22);
          ses('d-blup', 0.7, 1.2);
          h.kutu.classList.add('vk-kapali');                           // bardak boşaldı (ikinci çizim)
          setTimeout(() => { if (tutulan === h) birak(h); dokBardak.hidden = true; }, sure(300));
          asamaGec('calkala');
          yanaklar.forEach(y => { y.hidden = false; });
        }
      }
    }
    requestAnimationFrame(kare);
  }

  // Oyun, iki görünüm de bir kez çizdirildikten ve bütün çizimler çözüldükten sonra başlar (ilk kare tam yüklü sahne).
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
      setTimeout(() => soyle('m-yapis'), sure(350));
      // ilk saniyede ne yapılacağı belli: çanta sallanır, Kino zıplayıp onu gösterir
      setTimeout(() => { if (calisiyor && asama === 'giris') { salla(canta); hop(kinoY?.kutu, 16); ses('e-tik', 0.5, 1.2); } }, sure(260));
      requestAnimationFrame(t => { son = t; requestAnimationFrame(kare); });
    });

  // Test ve video kaydı için okuma (oyunun işleyişini değiştirmez): ?test ya da ?kayit ile.
  if (TEST_MODU || sorgu.has('kayit')) {
    const m = (e: Element): Nokta => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    (window as unknown as { __dis: unknown }).__dis = {
      asama: () => asama,
      gorunduAni: () => gorunduAni,
      uc: () => (tutulan ? ekrana(ucNoktasi(tutulan)) : null),
      olcek: () => S,
      nokta: (ad: string, i = 0): Nokta | null => {
        if (ad === 'canta') return m(canta);
        if (ad === 'agiz-dugmesi') return ekrana(MASA.agiz);
        if (ad === 'fener') return m(dokFener);
        if (ad === 'tup') return m(dokTupler[i]);
        if (ad === 'firca') return ekrana({ x: AGIZ.fircaYeri.sol + ALETLER.firca.tut[0] * AGIZ.fircaYeri.g, y: AGIZ.fircaYeri.ust + ALETLER.firca.tut[1] * AGIZ.fircaYeri.y });
        if (ad === 'bardak') return m(dokBardak);
        if (ad === 'agiz') return ekrana(AGIZ.merkez);
        if (ad === 'kil') return ekrana({ x: i ? AGIZ.killar.sag : AGIZ.killar.sol, y: AGIZ.killar.y - 30 });
        if (ad === 'bolme') return B[i] ? ekrana({ x: B[i].sol + B[i].g / 2, y: B[i].ust + B[i].y / 2 }) : null;
        if (ad === 'yanak') return ekrana(AGIZ.yanaklar[i]);
        if (ad === 'tekrar') return m(tekrar);
        return null;
      },
      sayim: () => ({ bolme: B.length, temiz: temizBolme(yol, Z.surtme), macun: macunOrani(macun), fener, agizAcik, dokum, calkala, hedefCalkala: Z.calkala, tat: secilenMacun }),
    };
  }
}
