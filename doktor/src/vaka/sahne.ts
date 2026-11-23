// Minik Doktor · "Zıpzıp'ın Dikenli Patisi": masa (yukarıdan) → çanta açılır → kolun yakın planı: büyüteçle mikrop avı,
// köpük spreyi, cımbızla diken, sargı bezi, desenli bant → masada kutlama. Her dokunuşa aynı karede karşılık verilir.
// Çizimler Astra'dan (Paket Doktor-Y1, assets/doktor/vaka/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
import './vaka.css';
import { menuYasiOku } from '../../../src/engine/menu-yas';
import { TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { anaMenuyeDon } from '../../../src/uygulama';
import { efekt, konus, sesleriYukle, sus } from '../ses';
import { A1, A1_BASTAN, A1_DOSYALAR, A1_EK_DOSYALAR, A1_EFEKTLER, A1_SAHNE, A1_SOZLER, GIRIS, type A1Asama, type A1SahneAdi, HUB_LAVABO, PAMUK, PAMUK_HEDEF, asamaAcik, kirpKutusu, bekleEki, dongudekiKare, kasede, kinoDansKaresi, kinoMasaKaresi, kinoYakinKaresi, yuzKaresi, mikropKaresi, gerginKaresi, kareAnahtarlari, BANT_DUZLEME, YILDIZ_KUYRUK, DIKEN_KOKU, GERGIN_BOY, KOPMA_KARE_MS, pamukHucre, pamukKiri, pamukOrani, ruloKaresi, sargiKati, zipDuragi } from './a1';
import { defterKur } from './defter';
import { gogusKur } from './gogus';
import { KopukKatmani, SuKatmani } from './his';
import { lavaboKur } from './lavabo';
import { KareDizisi, Surukle, ziplat as parcaZiplat, type GorunumSahnesi, type Ortam } from './parca';
import {
  ALETLER, ALET_SIRASI, DIKENLER, DIKEN_BOYU, DOK_ALET_BOYU, EFEKTLER, HUB, MERCEK_BUYUTME, MIKROPLAR, SAHNE, SERIT_YUVALARI, SERIT_YUVA_BOYU, SOZLER,
  SECMELI, SECMELI_DOSYALAR, SPREY_MENZILI, VAKA, VAKA_DOSYALAR, YAKIN, ZORLUK, BULMA_MS, alkisKaresi, asamaAleti, beklemeKaresi, bulmaAdimi, dikenCekisi, dikenUcu, mercekCapi,
  sahneOlcegi, sargiAdimi, sargiBaslangici, sargiOrani, sevincKaresi, tepsideMi, yuzIfadesi, AYY_MS, KIKIR_MS, BANT_DUGMESI, DIKEN_ESIGI, ELDE_OLCEK, KOPUK_ARALIGI, SARGI_EGIMI, SARGI_KOL, dikenGerilmesi, dikenYayi, ovmaAdimi, sargiKenari, KACIS_EN, KAPANIS, KOL_DUGMESI, TEKRAR_BOYU, ZIPLAMA_MS, kacisHedefi, kinoYakinPozu, ziplamaKaresi, type KinoPozu, type Yuz,
  type AletAdi, type Asama, type EfektAdi, type Kutu, type Nokta, type SozAdi, type Yas,
} from './veri';

/** "Yeniden oyna": uygulamanın ortak, çizilmiş düğmesi. */
const TEKRAR_DUGMESI = new URL('../../../assets/hazirlik/dugmeler/tekrar.webp', import.meta.url).href;
const dosyalar = import.meta.glob<string>('../../../assets/doktor/vaka/*.webp', { eager: true, query: '?url', import: 'default' });
const sorgu = new URLSearchParams(location.search);
/** Yalnız geliştirme sunucusunda: çizimler gelmeden mekaniği denemek için geçici klasörden okur (uygulamaya girmez). */
const TASLAK = import.meta.env.DEV && sorgu.has('taslak');
const gercek = (ad: string): string | undefined => dosyalar[`../../../assets/doktor/vaka/${ad}.webp`];
/** Çizimin adresi: gerçek çizim; yoksa yalnız geliştirmede (?taslak) geçici klasördeki karşılığı. */
const adres = (ad: string): string | undefined => gercek(ad) ?? (TASLAK ? `/output/doktor/vaka-taslak/${ad}.png` : undefined);
export const eksikCizimler = (): string[] => VAKA_DOSYALAR.filter(ad => !adres(ad));
/** Seçmeli çizimler (Y1 ekleri, Paket Doktor-A1): gerçek klasörde varsa bağlanır; ?taslak ile A1 kareleri geçici çizimle açılır. */
const secmeliVar = (ad: string): boolean => !!gercek(ad) || (TASLAK && (A1_DOSYALAR.includes(ad) || A1_EK_DOSYALAR.includes(ad)));
const BANTLAR: readonly string[] = [...VAKA.bantlar, ...(secmeliVar(SECMELI.bant) ? [SECMELI.bant] : [])];
const KINO_VAR = [SECMELI.kino.goster, SECMELI.kino.sasir, ...SECMELI.kino.alkis].every(secmeliVar);
const YUZ_VAR = Object.values(SECMELI.yuz).every(secmeliVar);
/** Yakın plandaki Kino'nun pozları (masadaki çizimler): izlerken patiler birleşik, şaşırınca patiler yanakta, sevinince gülerek gösterir. */
const KINO_POZLARI: Record<KinoPozu, string> = { izler: SECMELI.kino.alkis[1], sasir: SECMELI.kino.sasir, sevin: SECMELI.kino.goster };
// Paket Doktor-A1'in tepki kareleri: geleni Y1 pozlarının yanına girer; gelmeyenin yerinde Y1'deki karşılığı durur.
const varsa = (ad: string | null, yedek: string): string => (ad && secmeliVar(ad) ? ad : yedek);
const A1_YUZLER = Object.values(A1.yuz).filter(secmeliVar);
const A1_KINO_MASA = [...A1.kinoMasa.karsila, A1.kinoMasa.kirp, A1.kinoMasa.dusun, A1.kinoMasa.kahkaha, A1.kinoMasa.ups, ...A1.kinoMasa.yasasin].filter(secmeliVar);
const A1_KINO_YAKIN = [...A1.kinoYakin.bak, A1.kinoYakin.basparmak, A1.kinoYakin.alkisHizli, A1.kinoMasa.ups].filter(secmeliVar);
const A1_BEKLE = A1.bekle.filter(secmeliVar);

const el = <K extends keyof HTMLElementTagNameMap>(etiket: K, sinif: string): HTMLElementTagNameMap[K] => { const e = document.createElement(etiket); e.className = sinif; return e; };
function resim(ad: string, sinif = ''): HTMLImageElement {
  const r = el('img', sinif);
  r.src = adres(ad) ?? ''; r.alt = ''; r.draggable = false; r.decoding = 'sync';
  return r;
}
const koy = (e: HTMLElement, k: Kutu) => { Object.assign(e.style, { left: k.sol + 'px', top: k.ust + 'px', width: k.g + 'px', height: k.y + 'px' }); };
const ortala = (e: HTMLElement, p: Nokta, g: number, y: number) => koy(e, { sol: p.x - g / 2, ust: p.y - y / 2, g, y });
const uzak = (a: Nokta, b: Nokta) => Math.hypot(a.x - b.x, a.y - b.y);
const bekle = (ms: number) => new Promise<void>(r => setTimeout(r, TEST_MODU ? Math.min(ms, 30) : ms));
const sure = (ms: number) => (TEST_MODU ? 1 : ms);
const ses = (ad: EfektAdi | (typeof A1_EFEKTLER)[number], kazanc = 1, hiz = 1) => efekt(ad, kazanc, hiz);
const soyle = (ad: SozAdi | keyof typeof A1_SOZLER) => void konus(ad);

/** Dikey telefonda "yan çevir" uyarısı (uygulamanın öbür oyunlarındaki işaret); bir kez eklenir. */
export function cevirUyarisi(kok: HTMLElement) {
  if (document.querySelector('.vk-cevir')) return;
  const c = el('div', 'vk-cevir'); c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Oynamak için telefonu yan çevir');
  c.innerHTML = '<span aria-hidden="true">↷</span>';
  kok.after(c);
}

/** Yaş: adresteki ?yas= ya da menüde seçilen yaş. */
export function yasOku(): Yas {
  const y = sorgu.get('yas');
  if (y === '2-3' || y === '4' || y === '5+') return y;
  const m = menuYasiOku();
  return m === 2 || m === 3 ? '2-3' : m === 4 ? '4' : '5+';
}

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  kok.replaceChildren();
  kok.dataset.oyun = 'vaka';
  cevirUyarisi(kok);
  const geri = el('button', 'vk-geri'); geri.type = 'button'; geri.setAttribute('aria-label', 'Geri'); geri.innerHTML = IKON.geri;
  geri.addEventListener('click', () => anaMenuyeDon());
  kok.append(geri);
  const eksik = eksikCizimler();
  if (eksik.length) { kok.dataset.durum = 'eksik'; kok.dataset.eksik = String(eksik.length); console.info('Vaka: ' + eksik.length + ' çizim bekleniyor (Paket Doktor-Y1):', eksik.join(', ')); return; }
  kok.dataset.durum = 'yukleniyor';
  // Açılışta masa ve kol sahnesinin çizimleri yüklenir; lavabo, göğüs, defter ve dans sırası gelince (bellek için).
  const adlar = [...VAKA_DOSYALAR, ...SECMELI_DOSYALAR.filter(secmeliVar), ...A1_BASTAN.filter(secmeliVar)];
  const hepsi = adlar.map(ad => { const r = new Image(); r.src = adres(ad)!; return r.decode().catch(() => undefined).then(() => r); });
  void Promise.all([Promise.all(hepsi), sesleriYukle([...Object.keys(SOZLER), ...EFEKTLER, ...Object.keys(A1_SOZLER), ...A1_EFEKTLER])]).then(([resimler]) => kur(kok, yas, secenek, resimler, adlar));
}

/**
 * Aynı yerde duran pozlar (Zıpzıp'ın kareleri, çantanın kapalı ve açık hâli). Hepsi baştan boyanır; görünmeyenler
 * neredeyse saydamdır. Poz değişimi yalnız saydamlık değişimidir: resim o anda çözülmez, kare atlamaz.
 */
function yigin(adlar: readonly string[], sinif: string): { kutu: HTMLDivElement; goster: (ad: string) => void; ekle: (ad: string) => HTMLImageElement } {
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
  const ekle = (ad: string) => { const r = kareler.get(ad) ?? resim(ad); if (!kareler.has(ad)) { kareler.set(ad, r); kutu.append(r); } return r; };
  return { kutu, goster, ekle };
}

function kur(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void }, resimler: HTMLImageElement[], yuklenen: readonly string[]) {
  const Z = ZORLUK[yas];
  const mikroplar = MIKROPLAR.slice(0, Z.mikrop);
  const dikenler = DIKENLER.slice(0, Z.diken);
  const sahne = el('div', 'vk-sahne');
  let S = 1;
  /** sahnenin dışında kalan ekran payı (sahne pikseli): yanlarda ve üstte-altta. Bu pay boş bant olmaz (→ kenarUzat). */
  const tasma = { yan: 0, dik: 0 };
  /** pencereye bağlanan dinleyiciler: yeniden oynayınca hepsi birden kalkar (birikmez) */
  const iptal = new AbortController();
  const boyutla = () => {
    const o = sahneOlcegi(kok.clientWidth || innerWidth, kok.clientHeight || innerHeight);
    S = o.s;
    sahne.style.transform = `translate(${o.sol}px, ${o.ust}px) scale(${o.s})`;
    tasma.yan = o.sol / o.s; tasma.dik = o.ust / o.s;
    sahne.style.setProperty('--ty', tasma.yan.toFixed(1) + 'px'); sahne.style.setProperty('--td', tasma.dik.toFixed(1) + 'px');
  };
  addEventListener('resize', boyutla, { signal: iptal.signal });
  const noktaya = (e: PointerEvent): Nokta => { const r = sahne.getBoundingClientRect(); return { x: (e.clientX - r.left) / S, y: (e.clientY - r.top) / S }; };
  const ekrana = (p: Nokta): Nokta => { const r = sahne.getBoundingClientRect(); return { x: r.left + p.x * S, y: r.top + p.y * S }; };

  // Yıldız parçacıkları (bant parıltısı, yıldız yağmuru): Astra'nın yıldız çizimi, baştan boyalı bir havuzdan. Hareket yalnız
  // transform ve saydamlıktır. Havuzdaki yıldız kendi başına neredeyse saydam durur; görünürlüğü animasyon verir.
  const yildizHavuzu = (kati: HTMLElement, adet: number): HTMLImageElement[] => Array.from({ length: adet }, () => { const r = resim(VAKA.yildiz, 'vk-katman vk-yildiz-p'); kati.append(r); return r; });
  const yildizYeri = (q: Nokta, aci: number, k: number) => `translate(${(q.x - 50).toFixed(1)}px, ${(q.y - 50).toFixed(1)}px) rotate(${aci.toFixed(0)}deg) scale(${k.toFixed(3)})`;
  /** p noktasından çevreye saçılan yıldızlar */
  function yildizSac(havuz: HTMLImageElement[], p: Nokta, adet: number, uzaklik = 210, boy = 64) {
    for (let i = 0; i < adet; i++) {
      const r = havuz.pop(); if (!r) return;
      const a = (i / adet) * Math.PI * 2 + Math.random() * 0.6, d = uzaklik * (0.65 + Math.random() * 0.5), k = (boy * (0.7 + Math.random() * 0.6)) / 100, don = (Math.random() < 0.5 ? -1 : 1) * (140 + Math.random() * 160);
      const uc = { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d };
      const geri = () => { havuz.push(r); };
      void r.animate([
        { transform: yildizYeri(p, 0, k * 0.3), opacity: 1 },
        { transform: yildizYeri({ x: p.x + (uc.x - p.x) * 0.85, y: p.y + (uc.y - p.y) * 0.85 }, don * 0.7, k), opacity: 1, offset: 0.55 },
        { transform: yildizYeri({ x: uc.x, y: uc.y + 36 }, don, k * 0.5), opacity: 0 },
      ], { duration: sure(520 + Math.random() * 180), easing: 'cubic-bezier(.15,.7,.3,1)' }).finished.then(geri, geri);
    }
  }
  /** yukarıdan aşağı yağan yıldızlar (masa) */
  function yildizYagdir(havuz: HTMLImageElement[], adet: number) {
    for (let i = 0; i < adet; i++) {
      const r = havuz.pop(); if (!r) return;
      const x = -tasma.yan + 80 + Math.random() * (SAHNE.g + 2 * tasma.yan - 160), k = (54 + Math.random() * 70) / 100, don = (Math.random() < 0.5 ? -1 : 1) * (200 + Math.random() * 340), kay = (Math.random() - 0.5) * 220;
      const geri = () => { havuz.push(r); };
      void r.animate([
        { transform: yildizYeri({ x, y: -90 - tasma.dik }, 0, k), opacity: 1 },
        { transform: yildizYeri({ x: x + kay, y: SAHNE.y + tasma.dik + 110 }, don, k), opacity: 1 },
      ], { duration: sure(1150 + Math.random() * 750), delay: sure(Math.random() * 320), easing: 'cubic-bezier(.4,0,.85,.75)' }).finished.then(geri, geri);
    }
  }

  // Ekran sahneden (16:9) uzun ya da genişse kalan kenarda düz renkli boş bant kalmaz: görünümün kenarındaki pikseller
  // dışarı doğru uzar (duvar, çarşaf, zemin çizgileri ve soldan giren kol devam eder). Dört ince tuval; boyları CSS'ten
  // (--ty, --td) gelir. Kenardan bir piksel içerideki sıra alınır (kenar yumuşatmasının dışı).
  // Çözülmüş çizimler (tuvale çizmek için). Sonradan kurulan sahnelerinki kurulurken eklenir, sahne bırakılınca çıkar.
  const cozulmusler = new Map<string, HTMLImageElement>(yuklenen.map((ad, i) => [ad, resimler[i]]));
  const cizimBul = (ad: string): HTMLImageElement | undefined => cozulmusler.get(ad);
  const cizimYukle = (istenen: readonly string[]) => Promise.all(istenen.filter(ad => secmeliVar(ad) && !cozulmusler.has(ad)).map(async ad => { const r = new Image(); r.src = adres(ad)!; await r.decode().catch(() => undefined); cozulmusler.set(ad, r); }));
  const cizimBirak = (istenen: readonly string[]) => { for (const ad of istenen) cozulmusler.delete(ad); };
  const TAM: Kutu = { sol: 0, ust: 0, g: SAHNE.g, y: SAHNE.y };
  function kenarUzat(gorunum: HTMLElement, katmanlar: readonly (readonly [string, Kutu])[]) {
    const kutu = el('div', 'vk-tasma');
    for (const kenar of ['ust', 'alt', 'sol', 'sag'] as const) {
      const yatay = kenar === 'ust' || kenar === 'alt';
      const c = el('canvas', 'vk-t-' + kenar); c.width = yatay ? SAHNE.g : 1; c.height = yatay ? 1 : SAHNE.y;
      const g = c.getContext('2d')!;
      const yer = kenar === 'ust' || kenar === 'sol' ? 1 : (yatay ? SAHNE.y : SAHNE.g) - 2;
      for (const [ad, k] of katmanlar) {
        const r = cizimBul(ad);
        if (!r || !r.naturalWidth) continue;
        if (yatay) { if (yer >= k.ust && yer < k.ust + k.y) g.drawImage(r, 0, Math.floor(((yer - k.ust) / k.y) * r.naturalHeight), r.naturalWidth, 1, k.sol, 0, k.g, 1); }
        else if (yer >= k.sol && yer < k.sol + k.g) g.drawImage(r, Math.floor(((yer - k.sol) / k.g) * r.naturalWidth), 0, 1, r.naturalHeight, 0, k.ust, 1, k.y);
      }
      kutu.append(c);
    }
    gorunum.prepend(kutu);
  }

  // ——————————————————————————— masa (hub)
  const hub = el('div', 'vk-gorunum vk-hub');
  const zipzipY = yigin([...VAKA.uzgun, VAKA.uzgunKirp, ...VAKA.sevinc, ...A1_BEKLE], 'vk-katman vk-zipzip');
  const zipzip = zipzipY.kutu; koy(zipzip, HUB.zipzip);
  const canta = el('button', 'vk-katman vk-canta'); canta.type = 'button'; canta.setAttribute('aria-label', 'Doktor çantası'); koy(canta, HUB.canta);
  const cantaY = yigin([VAKA.cantaKapali, VAKA.cantaAcik], 'vk-canta-resmi'); canta.append(cantaY.kutu);
  const cantaAletleri = ALET_SIRASI.map((a, i) => {
    const r = resim(ALETLER[a].cizim, 'vk-yuva-aleti');
    const [x, y] = HUB.yuvalar[i];
    ortala(r, { x, y }, HUB.yuvaBoyu[1], HUB.yuvaBoyu[1]);
    r.hidden = true;
    canta.append(r);
    return r;
  });
  const hubSerit = el('div', 'vk-katman vk-serit'); koy(hubSerit, HUB.serit);
  hubSerit.append(resim(VAKA.serit));
  const yuvaya = (r: HTMLElement, i: number, oran: number, yk: number = SERIT_YUVA_BOYU[1]) => { const [x, y] = SERIT_YUVALARI[i]; ortala(r, { x, y }, yk * oran, yk); };
  BANTLAR.forEach((b, i) => { const r = resim(b, 'vk-yuva-aleti'); yuvaya(r, i, 360 / 150); hubSerit.append(r); });
  // yıldız: dört bant varsa şeritte yer kalmaz; kutlamada çantadan çıkar
  const hubYildiz = resim(VAKA.yildiz, 'vk-yuva-aleti'); yuvaya(hubYildiz, 3, 1); hubYildiz.hidden = BANTLAR.length > 3; hubSerit.append(hubYildiz);
  const kinoY = KINO_VAR ? yigin([SECMELI.kino.goster, SECMELI.kino.sasir, ...SECMELI.kino.alkis, ...A1_KINO_MASA], 'vk-katman vk-kino') : null;
  const kino = kinoY ? kinoY.kutu : null;
  if (kino) koy(kino, HUB.kino);
  /** masadaki Kino'nun tepki anları (şaşırdı, "ups", kahkaha) ve çocuğun son dokunuşu (uzun süre dokunmazsa Kino düşünür, Zıpzıp iç çeker) */
  let kinoSasirdi = 0, kinoUps = 0, kinoKahkaha = 0, sonDokunus = performance.now(), kinoDansVar = false;
  const kolDugmesi = el('button', 'vk-katman vk-kol-dugmesi vk-pati-dugmesi'); kolDugmesi.type = 'button'; kolDugmesi.setAttribute('aria-label', 'Zıpzıp\'ın patisi'); ortala(kolDugmesi, { x: HUB.pati.x - 50, y: HUB.pati.y }, KOL_DUGMESI[0], KOL_DUGMESI[1]); kolDugmesi.hidden = true;
  const hubBant = el('img', 'vk-katman vk-hub-bant'); hubBant.alt = ''; hubBant.hidden = true; ortala(hubBant, HUB.sargi, 84, 35);
  const yagmurKati = el('div', 'vk-katman vk-yagmur');
  const hubYildizlari = yildizHavuzu(yagmurKati, 40);
  // A1: kutlamada yıldızlarla birlikte konfeti süzülür (altı parça; havuzdan, baştan boyalı)
  const KONFETI = A1.konfeti.filter(secmeliVar);            // gelen parçalarla (en az üçü varsa)
  const konfetiHavuzu: HTMLImageElement[] = KONFETI.length >= 3 ? Array.from({ length: 36 }, (_, i) => { const r = resim(KONFETI[i % KONFETI.length], 'vk-katman vk-yildiz-p'); yagmurKati.append(r); return r; }) : [];
  /** yukarıdan süzülen konfeti: sağa sola salınarak, dönerek iner (yıldızdan yavaş) */
  function konfetiYagdir(adet: number) {
    for (let i = 0; i < adet; i++) {
      const r = konfetiHavuzu.pop(); if (!r) return;
      const x = -tasma.yan + 60 + Math.random() * (SAHNE.g + 2 * tasma.yan - 120), k = (38 + Math.random() * 34) / 100, don = (Math.random() < 0.5 ? -1 : 1) * (300 + Math.random() * 500), sal = 70 + Math.random() * 90;
      const y0 = -80 - tasma.dik, y1 = SAHNE.y + tasma.dik + 90, faz = Math.random() * Math.PI * 2;
      const geri = () => { konfetiHavuzu.push(r); };
      const yol = [0, 0.25, 0.5, 0.75, 1].map(f => ({ transform: yildizYeri({ x: x + Math.sin(faz + f * Math.PI * 3) * sal, y: y0 + (y1 - y0) * f }, don * f, k), opacity: 1 }));
      void r.animate(yol, { duration: sure(1900 + Math.random() * 1300), delay: sure(Math.random() * 500), easing: 'linear' }).finished.then(geri, geri);
    }
  }
  hub.append(resim(VAKA.hubFon, 'vk-fon'), zipzip, hubBant, canta, hubSerit, ...(kino ? [kino] : []), kolDugmesi, yagmurKati);
  kenarUzat(hub, [[VAKA.hubFon, TAM]]);

  // ——————————————————————————— yakın plan
  const yakin = el('div', 'vk-gorunum vk-yakin vk-altta');
  const camur = el('canvas', 'vk-katman vk-camur'); camur.width = SAHNE.g / 2; camur.height = SAHNE.y / 2;
  // okunup yazılan tuval: baştan işlemci belleğinde tutulur (ilk silmede bellek türü değişmez, kare atlamaz)
  const cg = camur.getContext('2d', { willReadFrequently: true })!;
  cg.drawImage(resimler[VAKA_DOSYALAR.indexOf(VAKA.kolCamurlu)], 0, 0, camur.width, camur.height);
  // Yalnız lekeler kalır: temiz kolla aynı olan pikseller saydamlaşır. İki çizimin tonu bir parça farklı; böylece
  // silinen yerin çevresinde ton izi kalmaz ve altta hep aynı temiz kol görünür.
  {
    const t = el('canvas', ''); t.width = camur.width; t.height = camur.height;
    const tg = t.getContext('2d', { willReadFrequently: true })!;
    tg.drawImage(resimler[VAKA_DOSYALAR.indexOf(VAKA.kolTemiz)], 0, 0, t.width, t.height);
    const a = cg.getImageData(0, 0, camur.width, camur.height), b = tg.getImageData(0, 0, t.width, t.height);
    for (let i = 0; i < a.data.length; i += 4) {
      const fark = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
      a.data[i + 3] = Math.round(a.data[i + 3] * Math.max(0, Math.min(1, (fark - 45) / 50)));
    }
    cg.putImageData(a, 0, 0);
  }
  // çamurlu kol yalnız bu tuval için gerekliydi: çözülmüş hâli bırakılır (2048 × 1152, 9,4 MB)
  resimler[VAKA_DOSYALAR.indexOf(VAKA.kolCamurlu)].removeAttribute('src'); cozulmusler.delete(VAKA.kolCamurlu);
  const sargi = resim(VAKA.sargiSarili, 'vk-fon vk-sargi');
  // A1 kareleri geldiyse sargı kat kat sarılır (beş kare); gelmediyse tek çizim soldan sağa açılır
  const sargiKatY = A1.sargiKat.every(secmeliVar) ? yigin(A1.sargiKat, 'vk-fon vk-sargi-kat vk-gizli') : null;
  if (sargiKatY) { sargi.hidden = true; if (gercek(A1.sargiKat[0])) { const k = kirpKutusu(A1.sargiKat[0]); if (k) koy(sargiKatY.kutu, k); } }
  // sarılan ucun kenarı: açılan bölümün sonunda konturla aynı kalınlıkta çizgi (kesik görünmesin)
  const sargiKenar = el('div', 'vk-katman vk-sargi-kenar'); sargiKenar.hidden = true;
  // Açılan ucun kenarı eğimlidir: rulo kolun üstündeyken bir yana, altındayken öbür yana yatar (kolun çevresinde
  // dönerek sarıyor görünür). egim: kolun üst kenarında kenarın x kayması (sahne pikseli).
  const sargiGoster = (oran: number, egim = 0) => {
    const x = YAKIN.sargi.sol - 30 + (YAKIN.sargi.sag - YAKIN.sargi.sol + 60) * oran;
    const k = sargiKenari(x, egim);
    sargi.style.clipPath = `polygon(0 0, ${k.ust.toFixed(1)}px 0, ${k.alt.toFixed(1)}px 100%, 0 100%)`;
    if (sargiKatY) { const kat = sargiKati(oran); sargiKatY.kutu.classList.toggle('vk-gizli', kat < 0); if (kat >= 0) sargiKatY.goster(A1.sargiKat[kat]); }
    sargiKenar.hidden = !!sargiKatY || x <= YAKIN.sargi.sol + 6 || x >= YAKIN.sargi.sag - 6;
    sargiKenar.style.left = x - 4 + 'px';
    sargiKenar.style.transform = `skewX(${Math.atan((-2 * egim) / (SARGI_KOL.alt - SARGI_KOL.ust)).toFixed(4)}rad)`;
    return x;
  };
  // Rulodan kola uzanan sargı şeridi: rulo parmağı izlerken bez ondan açılıp kola gider. (Paket Doktor-A1'in
  // `sargi-serit` çizimi gelince şeridin dokusu o olur; o zamana kadar sargının düz rengi ve konturu.)
  const sargiBez = el('div', 'vk-sargi-bez'); sargiBez.hidden = true;
  if (secmeliVar(A1.sargiSerit)) { sargiBez.style.background = `url("${adres(A1.sargiSerit)}") left center / auto 100% repeat-x`; sargiBez.style.border = '0'; }
  sargiGoster(0);
  const dikenEl = dikenler.map(d => {
    const r = resim(VAKA.diken, 'vk-katman vk-diken');
    koy(r, { sol: d.x, ust: d.y - DIKEN_BOYU * 0.2, g: DIKEN_BOYU, y: DIKEN_BOYU * 0.4 });
    r.style.transformOrigin = '0 50%';
    r.style.transform = `rotate(${d.aci}deg)`;
    return r;
  });
  // Mikroplar: Y1'in tek karesi; A1 geldiyse kıpırdama döngüsü (dört kare), korkmuş ve köpüğe gömülmüş hâli. "Pof" dizisi de
  // aynı yığındadır (A1'in iki ek karesi geldiyse dört kare).
  const mikropNo = mikroplar.map(k => (VAKA.mikroplar as readonly string[]).indexOf(k.ad));
  const mikropA1 = mikropNo.map(n => !!A1.mikrop[n] && [...A1.mikrop[n].kipir, A1.mikrop[n].kork, A1.mikrop[n].kopukte].every(secmeliVar));
  const POF: readonly string[] = [...VAKA.pof, ...(A1.pofEk.every(secmeliVar) ? A1.pofEk : [])];
  const mikropY = mikroplar.map((k, i) => {
    const a = A1.mikrop[mikropNo[i]];
    const y = yigin([k.ad, ...(mikropA1[i] ? [...a.kipir, a.kork, a.kopukte] : []), ...POF], 'vk-katman vk-mikrop');
    ortala(y.kutu, k, k.boy, k.boy); y.kutu.style.setProperty('--i', String(i));
    return y;
  });
  const mikropEl = mikropY.map(y => y.kutu);
  const mikropSimdi = mikroplar.map(k => k.ad);
  // Diken: A1 geldiyse çekilirken tüy küçük bir çadır gibi kalkar (üç kare), çıktığı an "pıt" (iki kare), yerinde minik
  // pembe bir iz kalır. Kareler 300 × 200, dikenin battığı yer (40, 100); Y1 dikeniyle aynı ölçek (200 px = DIKEN_BOYU).
  const dk = DIKEN_BOYU / 200;
  const dikenKareY = [...A1.dikenGergin, ...A1.dikenKopma].every(secmeliVar) ? dikenler.map(d => {
    const y = yigin([...A1.dikenGergin, A1.dikenKopma[0], A1.dikenKopma[1]], 'vk-katman vk-diken-kare vk-gizli');
    koy(y.kutu, { sol: d.x - DIKEN_KOKU.x * dk, ust: d.y - DIKEN_KOKU.y * dk, g: 300 * dk, y: 200 * dk });
    y.kutu.style.transformOrigin = `${DIKEN_KOKU.x * dk}px ${DIKEN_KOKU.y * dk}px`; y.kutu.style.transform = `rotate(${d.aci}deg)`;
    return y;
  }) : null;
  const dikenIzleri = secmeliVar(A1.dikenIzi) ? dikenler.map(d => { const r = resim(A1.dikenIzi, 'vk-katman vk-diken-izi vk-gizli'); ortala(r, d, 120 * dk, 120 * dk); return r; }) : [];
  const kopukKati = el('div', 'vk-katman vk-kopuk-kati');
  // köpük, parmağın geçtiği yerde birikir ve kalır (tuval); doğan öbek önce küçük bir canlanmayla belirir (kopukKoy)
  const kopukTuvali = new KopukKatmani(resimler[VAKA_DOSYALAR.indexOf(VAKA.kopuk)]);
  const yakinBant = el('img', 'vk-katman vk-yakin-bant'); yakinBant.alt = ''; yakinBant.hidden = true;
  yakinBant.style.transform = 'rotate(-6deg)';                       // yapışınca hafif yan durur (uçuş animasyonunun son karesiyle aynı)
  // A1: bant ele alınınca arkasındaki kâğıt soyulur; kola kırışık yapışır, üstünden parmakla geçildikçe düzelir
  const bantKagitlari = A1.bantKagit.filter(secmeliVar), BANT_KAGIT = secmeliVar(A1.bantKagit[0]) && secmeliVar(A1.bantKagit[1]);      // üçüncü kare (düşen kâğıt) gelmese de soyulur
  const bantUstu = (ad: string) => { const r = resim(ad, 'vk-katman vk-yakin-bant vk-bant-ust'); r.hidden = true; r.style.transform = 'rotate(-6deg)'; return r; };
  const bantKirisikEl = secmeliVar(A1.bantKirisik) && secmeliVar(A1.bantDuz) ? bantUstu(A1.bantKirisik) : null, bantDuzEl = bantKirisikEl ? bantUstu(A1.bantDuz) : null;
  /** kırışık bandın düzeltilmesi: kalan geçiş sayısı, biriken parmak yolu, bastıran parmak */
  let bantDuzle: { kalan: number; yol: number; id: number; son: Nokta | null } | null = null;
  const BANT_GECIS = 170;                                            // bir geçiş sayılan parmak yolu (sahne pikseli); kısa bir basış 60 sayılır
  const dok = el('div', 'vk-katman vk-serit vk-dok'); koy(dok, YAKIN.serit);
  dok.append(resim(VAKA.serit));
  const dokAletleri = new Map<AletAdi, HTMLButtonElement>();
  ALET_SIRASI.forEach((a, i) => {
    const b = el('button', 'vk-dok-aleti'); b.type = 'button'; b.dataset.alet = a;
    b.setAttribute('aria-label', { buyutec: 'Büyüteç', sprey: 'Köpük spreyi', cimbiz: 'Cımbız', sargi: 'Sargı bezi' }[a]);
    yuvaya(b, i, 1, DOK_ALET_BOYU); b.append(resim(ALETLER[a].cizim));
    dok.append(b); dokAletleri.set(a, b);
  });
  const dokBantlari = BANTLAR.map((ad, i) => {
    const b = el('button', 'vk-dok-aleti vk-dok-bant'); b.type = 'button'; b.dataset.bant = ad; b.setAttribute('aria-label', 'Desenli bant'); b.hidden = true;
    yuvaya(b, i, BANT_DUGMESI[0] / BANT_DUGMESI[1], BANT_DUGMESI[1]); b.append(resim(ad));   // dokunma kutusu yuvanın tamamı
    dok.append(b);
    return b;
  });
  const elKati = el('div', 'vk-katman vk-el');
  // Büyütecin camı: küçük bir tuval. Her karede yalnız camın altındaki bölge büyütülerek çizilir (bütün sahnenin
  // büyütülmüş kopyası çok büyük bir doku isterdi; alet ele alınınca ve gezdirilirken takılma yapardı).
  const mercek = el('canvas', 'vk-mercek'); mercek.style.visibility = 'hidden';
  const mc = mercek.getContext('2d')!;
  // Camın çizdiği çizimler kol sahnesine girilirken kendi tuvallerine kopyalanır (çizim o anda çözülür; cam ilk
  // çizimde beklemez), büyüteç işi bitince bırakılır. ImageBitmap kullanılmaz: açılışta hazırlanan ImageBitmap'ler,
  // araya ağır sahneler girince tarayıcının geri aldığı belleğe bakıyor ve cam ilk çizimde sayfayı çökertiyordu
  // (ölçüldü: lavabo ve göğüsten sonra büyüteç ele alınınca "Target crashed").
  const mercekKaynagi = new Map<string, HTMLCanvasElement>();
  function mercekHazirla() {
    const a1 = mikroplar.flatMap((_, i) => (mikropA1[i] ? [...A1.mikrop[mikropNo[i]].kipir, A1.mikrop[mikropNo[i]].kork] : []));
    for (const ad of [VAKA.yakinFon, VAKA.kolTemiz, VAKA.diken, ...mikroplar.map(k => k.ad), ...a1]) {
      const r = cizimBul(ad);
      if (mercekKaynagi.has(ad) || !r || !r.naturalWidth) continue;
      const c = el('canvas', ''); c.width = r.naturalWidth; c.height = r.naturalHeight;
      c.getContext('2d')!.drawImage(r, 0, 0);
      mercekKaynagi.set(ad, c);
    }
  }
  function mercekBirak() { for (const c of mercekKaynagi.values()) { c.width = 0; c.height = 0; } mercekKaynagi.clear(); }
  const ciz = (ad: string): HTMLCanvasElement | HTMLImageElement => mercekKaynagi.get(ad) ?? resimler[VAKA_DOSYALAR.indexOf(ad)];
  let mercekCss = 0;
  function mercekCiz(uc: Nokta, an: number) {
    const c = mercek.width, o = c / mercekCss, k = MERCEK_BUYUTME, yari = mercekCss / (2 * k);
    mc.setTransform(1, 0, 0, 1, 0, 0);
    mc.fillStyle = '#a9e6cc'; mc.fillRect(0, 0, c, c);
    // sahne pikseli → cam pikseli
    mc.setTransform(k * o, 0, 0, k * o, c / 2 - uc.x * k * o, c / 2 - uc.y * k * o);
    // büyük katmanlardan yalnız camın altındaki kare (sahnenin içinde kalan bölümü)
    const x0 = Math.max(0, uc.x - yari), y0 = Math.max(0, uc.y - yari), x1 = Math.min(SAHNE.g, uc.x + yari), y1 = Math.min(SAHNE.y, uc.y + yari);
    if (x1 > x0 && y1 > y0) {
      for (const r of [ciz(VAKA.yakinFon), ciz(VAKA.kolTemiz)]) { const e = r.width / SAHNE.g; mc.drawImage(r, x0 * e, y0 * e, (x1 - x0) * e, (y1 - y0) * e, x0, y0, x1 - x0, y1 - y0); }
      const e = camur.width / SAHNE.g;
      mc.drawImage(camur, x0 * e, y0 * e, (x1 - x0) * e, (y1 - y0) * e, x0, y0, x1 - x0, y1 - y0);
    }
    dikenler.forEach((d, i) => {
      if (cikan[i]) return;
      mc.save(); mc.translate(d.x, d.y); mc.rotate((d.aci * Math.PI) / 180);
      mc.drawImage(ciz(VAKA.diken), 0, -DIKEN_BOYU * 0.2, DIKEN_BOYU, DIKEN_BOYU * 0.4);
      mc.restore();
    });
    // mikroplar camın altında kıpır kıpır (sahnedeki kıpırtıyla aynı tempo)
    mikroplar.forEach((m, i) => {
      if (giden[i]) return;
      const f = (an / 900 + i * 0.23) * Math.PI * 2, sal = (1 - Math.cos(f)) / 2;
      // kaçarken telaşla titrer
      const telas = Math.min(1, Math.hypot(kac[i].x, kac[i].y) / KACIS_EN);
      mc.save(); mc.translate(m.x + kac[i].x + Math.sin(an / 31) * 3 * telas, m.y + kac[i].y - 9 * sal); mc.rotate(((-4 + 9 * sal + Math.sin(an / 38) * 8 * telas) * Math.PI) / 180);
      mc.drawImage(mercekKaynagi.get(mikropSimdi[i]) ?? ciz(m.ad), -m.boy / 2, -m.boy / 2, m.boy, m.boy);
      mc.restore();
    });
  }
  elKati.append(mercek);
  // Oyun sırasında yaratılan küçük çizimler (köpük, pof, yıldız, bantlar): birer örneği baştan boyalı durur
  // (neredeyse saydam), ilk kullanımda çözme beklenmez.
  const onBoya = el('div', 'vk-katman vk-onboya');
  for (const [ad, boy] of [[VAKA.kopuk, 160], [VAKA.pof[0], 170], [VAKA.pof[1], 190], [VAKA.pof[1], 300], [VAKA.yildiz, 120], ...BANTLAR.map(b => [b, 330] as const), ...[...A1.parilti, ...A1.bantKagit, A1.bantKirisik, A1.bantDuz].filter(secmeliVar).map(a => [a, 200] as const)] as const) {
    const r = resim(ad); r.style.width = boy + 'px'; onBoya.append(r);
  }
  yakin.append(onBoya);
  const onBoyaHub = el('div', 'vk-katman vk-onboya');
  for (const [ad, boy] of [[VAKA.yildiz, 120], [VAKA.pof[1], 300], ...BANTLAR.map(b => [b, 84] as const), ...[...A1.parilti, A1.yildizKuyruk].filter(secmeliVar).map(a => [a, 200] as const)] as const) { const r = resim(ad); r.style.width = boy + 'px'; onBoyaHub.append(r); }
  hub.append(onBoyaHub);
  // Aletlerin eldeki hâli: baştan kurulur ve boyalı bekler (neredeyse saydam); ele alınınca çözme ya da ilk boyama beklenmez.
  const hazirKutu = new Map<AletAdi, HTMLDivElement>();
  const CIMBIZ_YARI = secmeliVar(A1.cimbizYari), SPREY_BASILI = secmeliVar(A1.spreyBasili);
  let fiskirma: HTMLDivElement | null = null;
  for (const ad of ALET_SIRASI) {
    const k = el('div', 'vk-tutulan vk-bekler'); k.dataset.alet = ad;
    k.style.width = k.style.height = ALETLER[ad].boy + 'px';
    k.append(resim(ALETLER[ad].cizim));
    if (ad === 'cimbiz') k.append(resim(VAKA.cimbizKapali, 'vk-ikinci'));
    if (ad === 'cimbiz' && CIMBIZ_YARI) k.append(resim(A1.cimbizYari, 'vk-ucuncu'));             // dikene yaklaşınca yarı kapanır
    if (ad === 'sprey' && SPREY_BASILI) k.append(resim(A1.spreyBasili, 'vk-ikinci'));             // her pompada başlık basılır
    if (ad === 'sprey' && A1.fiskirma.every(secmeliVar)) {
      // ağızdan fışkıran köpük: üç kare, sağ üst köşesi ağza gelir (ağız çizimde (150, 110), tuval 600)
      const f = el('div', 'vk-fiskirma'), o = ALETLER.sprey.boy / 600;
      f.style.left = (150 - 300) * o + 'px'; f.style.top = 110 * o + 'px'; f.style.width = 300 * o + 'px'; f.style.height = 200 * o + 'px';
      f.append(...A1.fiskirma.map(a => resim(a)));
      k.append(f); fiskirma = f;
    }
    // rulo açıldıkça incelir: A1'in dört karesi (geldiyse) Y1 rulosunun yerine geçer
    if (ad === 'sargi' && A1.sargiRulo.every(secmeliVar)) k.replaceChildren(...A1.sargiRulo.map((a, i) => resim(a, 'vk-kare' + (i ? '' : ' vk-gorunur'))));
    elKati.append(k); hazirKutu.set(ad, k);
  }
  // Elde tutulan aletin gölgesi: çizimin silueti küçük bir tuvale bir kez çizilir ve yumuşatılır; ekranda büyütülerek durur
  // (her karede filtre yok). Alet ele alınınca belirir, aletle birlikte gezer; camın altında kalır.
  const golgeYap = (r: HTMLImageElement, g: number, y: number): HTMLCanvasElement => {
    const c = el('canvas', 'vk-golge'); c.width = Math.max(8, Math.round(g / 7)); c.height = Math.max(8, Math.round(y / 7));
    c.style.width = g + 'px'; c.style.height = y + 'px';
    const x = c.getContext('2d', { willReadFrequently: true })!;
    x.drawImage(r, 0, 0, c.width, c.height);
    const d = x.getImageData(0, 0, c.width, c.height);
    let a = new Float32Array(c.width * c.height);
    for (let i = 0; i < a.length; i++) a[i] = d.data[i * 4 + 3];
    for (let tur = 0; tur < 2; tur++) {
      const b = a; a = new Float32Array(b.length);
      for (let yy = 0; yy < c.height; yy++) for (let xx = 0; xx < c.width; xx++) {
        let t = 0;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const X = xx + i, Y = yy + j; if (X >= 0 && Y >= 0 && X < c.width && Y < c.height) t += b[Y * c.width + X]; }
        a[yy * c.width + xx] = t / 9;
      }
    }
    for (let i = 0; i < a.length; i++) { d.data[i * 4] = 43; d.data[i * 4 + 1] = 36; d.data[i * 4 + 2] = 64; d.data[i * 4 + 3] = Math.round(a[i] * 0.3); }
    x.putImageData(d, 0, 0);
    return c;
  };
  const golgeler = new Map<AletAdi | 'bant', HTMLCanvasElement>();
  for (const ad of ALET_SIRASI) golgeler.set(ad, golgeYap(resimler[VAKA_DOSYALAR.indexOf(ALETLER[ad].cizim)], ALETLER[ad].boy, ALETLER[ad].boy));
  golgeler.set('bant', golgeYap(resimler[VAKA_DOSYALAR.indexOf(VAKA.bantlar[0])], 330, (330 * 150) / 360));
  for (const g of golgeler.values()) elKati.insertBefore(g, mercek);
  elKati.prepend(sargiBez);
  // Kino yakın planda da yanımızda: sağ alt köşeden izler, her adıma tepki verir (masadaki çizimleri)
  const kinoYakinY = KINO_VAR ? yigin([...Object.values(KINO_POZLARI), ...A1_KINO_YAKIN], 'vk-katman vk-kino-yakin') : null;
  if (kinoYakinY) koy(kinoYakinY.kutu, YAKIN.kino);
  let kinoTepkiPozu: KinoPozu | null = null, kinoTepkiSonu = 0, kinoSimdi: KinoPozu = 'izler', kinoBuyuk = false, kinoYakinUps = false;
  const yakinYildizlari = yildizHavuzu(kopukKati, 14);
  // Zıpzıp'ın yüzü: kolun arkasında, sol üstten eğilir; dört ifade üst üste boyalı durur
  const yuzY = YUZ_VAR ? yigin([...Object.values(SECMELI.yuz), ...A1_YUZLER], 'vk-katman vk-yuz') : null;
  if (yuzY) koy(yuzY.kutu, YAKIN.yuz);
  let ayyKalan = 0, kikirKalan = 0, ohKalan = 0, pofKalan = 0, sakaKalan = 0, yuzSimdi: Yuz = 'endise';
  yakin.append(resim(VAKA.yakinFon, 'vk-fon'), ...(yuzY ? [yuzY.kutu] : []), resim(VAKA.kolTemiz, 'vk-fon'), camur, ...dikenIzleri, sargi, ...(sargiKatY ? [sargiKatY.kutu] : []), sargiKenar, yakinBant, ...(bantKirisikEl && bantDuzEl ? [bantKirisikEl, bantDuzEl] : []), ...(kinoYakinY ? [kinoYakinY.kutu] : []), ...(dikenKareY ? dikenKareY.map(y => y.kutu) : []), ...dikenEl, ...mikropEl, kopukTuvali.tuval, kopukKati, dok, elKati);
  // Yüz kenar uzatmaya girmez: kulağın koyu konturu üst kenara değiyor, 4:3 ekranda (iPad) üst bantta siyah bir çizgi olarak uzuyordu.
  kenarUzat(yakin, [[VAKA.yakinFon, TAM], [VAKA.kolTemiz, TAM]]);

  const tekrar = el('button', 'vk-tekrar'); tekrar.style.width = tekrar.style.height = TEKRAR_BOYU + 'px'; tekrar.type = 'button'; tekrar.setAttribute('aria-label', 'Yeniden oyna'); tekrar.hidden = true;
  const tekrarResmi = el('img', ''); tekrarResmi.src = TEKRAR_DUGMESI; tekrarResmi.alt = ''; tekrarResmi.draggable = false;
  tekrar.append(tekrarResmi);
  sahne.append(hub, yakin, tekrar);
  kok.append(sahne);
  boyutla();

  // ——————————————————————————— durum
  let asama: Asama = 'giris';
  let asamaBasi = performance.now();
  const bulunan = mikroplar.map(() => false), giden = mikroplar.map(() => false);
  const bulma = mikroplar.map(() => 0), kopuk = mikroplar.map(() => 0);
  const cikan = dikenler.map(() => false);
  let tepsideki = 0, secilenBant: string | null = null;
  let sargiDurumu = sargiBaslangici(), sargiSesi = 0, gidikSoylendi = false;
  /** mikropların mercekten kaçarken görüntüdeki kayması */
  const kac = mikroplar.map((): Nokta => ({ x: 0, y: 0 }));
  const SIFIR: Nokta = { x: 0, y: 0 };
  let kacVar = false;
  let zipla: Animation | null = null, ziplamaTuru = 0;
  const asamaGec = (a: Asama) => {
    asama = a; asamaBasi = performance.now();
    kok.dataset.asama = a;
    const alet = asamaAleti(a);
    for (const [ad, b] of dokAletleri) b.classList.toggle('vk-sirada', ad === alet);
  };

  const pop = (e: HTMLElement, ms = 220) => e.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.65 }, { transform: 'scale(1)', opacity: 1 }], { duration: sure(ms), easing: 'ease-out' });
  const salla = (e: HTMLElement) => e.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: sure(240), easing: 'ease-in-out' });
  /** yerinde büyüyüp zıplar: "sıra bende" (şeritteki alet, pati düğmesi) */
  const ziplat = (e: HTMLElement) => { e.animate([{ transform: 'scale(1) translateY(0)' }, { transform: 'scale(1.22) translateY(-14px)', offset: 0.4 }, { transform: 'scale(1) translateY(0)' }], { duration: sure(280), easing: 'ease-out' }); };
  /** küçük bir zıplayış (Kino'nun tepkisi) */
  const hop = (e: HTMLElement | null | undefined, px = 20, ms = 260) => { e?.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-px}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(ms), easing: 'ease-out', composite: 'add' }); };
  /** bir kutudaki kareleri sırayla bir kez oynatır (yalnız saydamlık; kareler baştan boyalı) */
  const kareOynat = (kutu: Element, ms: number) => { const k = [...kutu.children]; k.forEach((c, i) => c.animate(kareAnahtarlari(i, k.length), { duration: Math.max(1, sure(ms)) })); };
  /** cımbız dikeni bıraktı (çıkmadan): diken ve tüy eski hâline döner */
  function dikenSal(i: number) {
    dikenEl[i].style.transform = `rotate(${dikenler[i].aci}deg)`; dikenEl[i].classList.remove('vk-gizli');
    dikenKareY?.[i].kutu.classList.add('vk-gizli');
  }
  /** diken çıktı: A1'in "pıt" kareleri (tüy geri iner), ardından yerinde minik pembe iz belirir */
  function dikenKoptu(i: number) {
    const y = dikenKareY?.[i];
    if (y) {
      y.kutu.style.transform = `rotate(${dikenler[i].aci}deg)`;
      y.goster(A1.dikenKopma[0]);
      setTimeout(() => y.goster(A1.dikenKopma[1]), sure(KOPMA_KARE_MS));
      setTimeout(() => { y.kutu.classList.add('vk-gizli'); dikenEl[i].classList.remove('vk-gizli'); }, sure(KOPMA_KARE_MS * 2));
    }
    const iz = dikenIzleri[i];
    if (iz) setTimeout(() => { iz.classList.remove('vk-gizli'); iz.animate([{ opacity: 0, scale: '.6' }, { opacity: 1, scale: '1' }], { duration: sure(260), easing: 'ease-out' }); }, sure(y ? KOPMA_KARE_MS * 2 : 60));
  }
  /** yakın plandaki Kino bir olaya tepki verir: poz değişir, zıplar */
  function kinoTepki(poz: KinoPozu, ms = 700, px = 22, ups = false) {
    kinoTepkiPozu = poz; kinoTepkiSonu = performance.now() + ms;
    kinoBuyuk = px >= 24; kinoYakinUps = ups;                 // büyük başarıda coşkulu alkış; sırası gelmemiş alette "ups"
    hop(kinoYakinY?.kutu, px);
  }
  /** düşen dikenin tepside yaydığı halka */
  function dalga(p: Nokta) {
    for (let i = 0; i < 2; i++) {
      const d = el('div', 'vk-katman vk-dalga'); ortala(d, p, 170, 170); kopukKati.append(d);
      const sil = () => d.remove();
      void d.animate([{ transform: 'scale(.25)', opacity: 0.95 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: sure(360), delay: sure(i * 110), easing: 'ease-out' }).finished.then(sil, sil);
    }
  }
  // A1 geldiyse parıltı dört karelik bir yıldız parıltısıdır (küçük, büyük, ince, sönerken); kutuları havuzdan gelir
  const PARILTI_VAR = A1.parilti.every(secmeliVar);
  const pariltiHavuzu: HTMLDivElement[] = [];
  function parilti(p: Nokta, boy = 190, hedef: HTMLElement = kopukKati) {
    if (PARILTI_VAR) {
      const k = pariltiHavuzu.pop() ?? (() => { const d = el('div', 'vk-katman vk-parilti'); d.append(...A1.parilti.map(a => resim(a))); return d; })();
      ortala(k, p, boy, boy); hedef.append(k);
      kareOynat(k, 320);
      const geri = () => { k.remove(); pariltiHavuzu.push(k); };
      void k.animate([{ transform: `scale(.7) rotate(${(Math.random() * 40 - 20).toFixed(0)}deg)` }, { transform: 'scale(1.15) rotate(0deg)' }], { duration: Math.max(1, sure(320)), easing: 'ease-out' }).finished.then(geri, geri);
      return;
    }
    const r = resim(VAKA.pof[1], 'vk-katman vk-pof'); ortala(r, p, boy, boy); hedef.append(r);
    void r.animate([{ transform: 'scale(.5)', opacity: 1 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: sure(380), easing: 'ease-out' }).finished.then(() => r.remove());
  }

  // ——————————————————————————— Paket Doktor-A1: yeni aşamalar (çizimleri tam gelen açılır; gelmeyen atlanır)
  // Yalnız geliştirme ve test: ?a1=lavabo,pamuk gibi bir liste, açılacak A1 aşamalarını sınırlar (boş liste: hiçbiri).
  const a1Siniri = TASLAK || TEST_MODU ? sorgu.get('a1') : null;
  const acikMi = (a: A1Asama): boolean => asamaAcik(a, secmeliVar) && (a1Siniri === null || a1Siniri.split(',').includes(a));
  const ACIK = { giris: acikMi('giris'), lavabo: acikMi('lavabo'), gogus: acikMi('gogus'), pamuk: acikMi('pamuk'), defter: acikMi('defter'), dans: acikMi('dans') };
  const ortam: Ortam = {
    kok, sahne, yas, sinyal: iptal.signal, tasma, noktaya, resim, cozulmus: cizimBul, varMi: secmeliVar,
    kutu: (ad: string): Kutu => (gercek(ad) ? kirpKutusu(ad) : null) ?? TAM,       // geçici çizimler kırpılmaz
    ses: (ad, kazanc = 1, hiz = 1) => efekt(ad, kazanc, hiz), soyle: ad => void konus(ad), sure, bekle,
    parilti, yildizHavuzu, yildizSac,
    asamaYaz: ad => { kok.dataset.asama = ad; }, calisiyor: () => calisiyor && sahne.isConnected,
  };
  // Kendi görünümü olan sahneler (lavabo, göğüs, defter) sırası gelince kurulur, işi bitince bırakılır: çizimleri de
  // onunla gelir ve gider (hepsi birden açık durursa sayfa belleği taşıyordu). Kurulan sahne bir kez, neredeyse saydam
  // çizdirilir; açılırken takılmaz.
  const ALT_KUR: Record<A1SahneAdi, (o: Ortam) => GorunumSahnesi> = { lavabo: lavaboKur, gogus: gogusKur, defter: defterKur };
  const ALT_FON: Record<A1SahneAdi, string> = { lavabo: A1.lavaboFon, gogus: A1.gogusFon, defter: A1.defterFon };
  const alt: Partial<Record<A1SahneAdi, { sahne: GorunumSahnesi; iptal: AbortController }>> = {};
  const altBekleyen: Partial<Record<A1SahneAdi, Promise<GorunumSahnesi>>> = {};
  function altHazirla(ad: A1SahneAdi): Promise<GorunumSahnesi> {
    return (altBekleyen[ad] ??= (async () => {
      await cizimYukle(A1_SAHNE[ad]);
      const c = new AbortController();
      iptal.signal.addEventListener('abort', () => c.abort());
      const x = ALT_KUR[ad]({ ...ortam, sinyal: c.signal });
      const g = x.gorunum;
      g.style.opacity = '0.01'; g.style.pointerEvents = 'none'; g.style.zIndex = '2'; g.classList.remove('vk-altta');
      sahne.insertBefore(g, tekrar);
      kenarUzat(g, [[ALT_FON[ad], TAM]]);
      await Promise.all([...g.querySelectorAll('img')].map(r => r.decode().catch(() => undefined)));
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      await new Promise<void>(r => setTimeout(r, TEST_MODU ? 10 : 120));
      g.classList.add('vk-altta'); g.style.opacity = ''; g.style.pointerEvents = ''; g.style.zIndex = '';
      alt[ad] = { sahne: x, iptal: c };
      return x;
    })());
  }
  function altBirak(ad: A1SahneAdi) {
    const k = alt[ad];
    if (!k) return;
    k.iptal.abort(); k.sahne.gorunum.remove();
    delete alt[ad]; delete altBekleyen[ad];
    cizimBirak(A1_SAHNE[ad]);
  }
  const etkinAlt = (): GorunumSahnesi | undefined => Object.values(alt).find(k => k?.sahne.gorunum === etkin)?.sahne;
  /** şu an görünen görünüm (masa, kol ya da bir alt sahne) */
  let etkin: HTMLElement = hub;
  /** bir görünümden öbürüne: yenisi hafifçe yaklaşarak belirir */
  // Bellek: görünmeyen görünüm (masa ya da yakın plan) çizimden çıkarılır; dokuları ve çözülmüş çizimleri bırakılır.
  // Dönüşte önce çizimleri çözülür, iki kare beklenir, sonra geçiş başlar: ilk gösterimde takılma olmaz.
  const uyut = (g: HTMLElement) => { if (g === hub || g === yakin) g.classList.add('vk-uykuda'); };
  async function uyandir(g: HTMLElement) {
    if (!g.classList.contains('vk-uykuda')) return;
    g.classList.remove('vk-uykuda');
    await Promise.all([...g.querySelectorAll('img')].map(r => r.decode().catch(() => undefined)));
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  }
  async function gorunumGec(yeni: HTMLElement) {
    if (yeni === etkin) return;
    geciste = true;
    ses('e-vuu', 0.7, yeni === hub ? 1.15 : 1);
    const eski = etkin, yakindan = `translate(${-SAHNE.g * 0.04}px, ${-SAHNE.y * 0.04}px) scale(1.08)`;
    await uyandir(yeni);
    yeni.classList.remove('vk-altta'); yeni.style.zIndex = '2';
    await yeni.animate([{ opacity: 0, transform: yakindan }, { opacity: 1, transform: 'translate(0px, 0px) scale(1)' }], { duration: sure(360), easing: 'cubic-bezier(.3,0,.3,1)' }).finished.catch(() => undefined);
    yeni.style.zIndex = ''; eski.classList.add('vk-altta'); uyut(eski);
    etkin = yeni; geciste = false;
  }
  // masadaki istasyon düğmeleri: lavabo ve göğüs (pati düğmesiyle aynı görünüş); sırayla açılır
  const istasyonDugmesi = (etiket: string, p: Nokta) => {
    const b = el('button', 'vk-katman vk-kol-dugmesi'); b.type = 'button'; b.setAttribute('aria-label', etiket);
    ortala(b, p, KOL_DUGMESI[0], KOL_DUGMESI[1]); b.hidden = true; hub.insertBefore(b, yagmurKati);
    return b;
  };
  const lavaboDugmesi = istasyonDugmesi('Lavabo', HUB_LAVABO), gogusDugmesi = istasyonDugmesi('Zıpzıp\'ın göğsü', HUB.gogus);
  let lavaboBitti = !ACIK.lavabo, gogusBitti = !ACIK.gogus;
  /** masada sıradaki iş: önce eller yıkanır, sonra kalp dinlenir, sonra pati */
  const siradakiDugme = (): HTMLButtonElement => (!lavaboBitti ? lavaboDugmesi : !gogusBitti ? gogusDugmesi : kolDugmesi);
  function siradakiniGoster() {
    for (const b of [lavaboDugmesi, gogusDugmesi, kolDugmesi]) b.hidden = true;
    const b = siradakiDugme(); b.hidden = false; pop(b, 240); hop(kino, 14, 220);
  }
  async function altSahne(ad: 'lavabo' | 'gogus') {
    if (!ACIK[ad] || geciste || asama !== 'canta') return;
    asamaGec(ad);
    for (const b of [lavaboDugmesi, gogusDugmesi, kolDugmesi]) b.hidden = true;
    const x = await altHazirla(ad);              // çoğu zaman hazırdır (düğme görünürken kuruldu)
    if (!calisiyor) return;
    await gorunumGec(x.gorunum);
    await x.oyna();
    if (!calisiyor) return;
    await gorunumGec(hub);
    altBirak(ad);
    if (ad === 'lavabo') lavaboBitti = true; else gogusBitti = true;
    asamaGec('canta');
    siradakiniGoster();
    if (!gogusBitti) void altHazirla('gogus');   // sıradaki sahne, düğmesi beklerken kurulur
  }
  const istasyonaGit = () => { const b = siradakiDugme(); if (b === kolDugmesi) void yaklas(); else void altSahne(b === lavaboDugmesi ? 'lavabo' : 'gogus'); };
  lavaboDugmesi.addEventListener('pointerdown', () => { void altSahne('lavabo'); });
  gogusDugmesi.addEventListener('pointerdown', () => { void altSahne('gogus'); });

  // geliş: Zıpzıp topallayarak gelir; ona dokundukça sedyeye doğru zıplar (üç zıplayış)
  const gelis = ACIK.giris ? (() => {
    const kutu = el('button', 'vk-katman vk-gelis'); kutu.type = 'button'; kutu.setAttribute('aria-label', 'Zıpzıp'); koy(kutu, HUB.zipzip);
    const topal = new KareDizisi(ortam, A1.topal, 'vk-gelis-kare'), zip = new KareDizisi(ortam, A1.zipla, 'vk-gelis-kare vk-gizli');
    kutu.append(topal.kutu, zip.kutu);
    hubSerit.after(kutu);            // çantanın ve şeridin önünde: gelirken çantanın önünden geçer, dokunuş ona gider
    return { kutu, topal, zip, x: GIRIS.baslangic as number, yuruyor: false, zipliyor: false, zipSayisi: 0, basi: 0 };
  })() : null;
  const gelisKonumla = (dy = 0) => { if (gelis) gelis.kutu.style.translate = `${(gelis.x - HUB.zipzip.sol).toFixed(1)}px ${dy.toFixed(1)}px`; };
  async function gelisZipla() {
    const g = gelis;
    if (!g || asama !== 'gelis' || g.yuruyor || g.zipliyor) return;
    g.zipliyor = true; g.zipSayisi++;
    g.kutu.classList.remove('vk-sirada');
    const basX = g.x, hedefX = zipDuragi(g.zipSayisi, HUB.zipzip.sol), T = sure(380), t0 = performance.now();
    g.topal.kutu.classList.add('vk-gizli'); g.zip.kutu.classList.remove('vk-gizli');
    ses('e-vuu', 0.5, 1.4); hop(kino, 10, 200); sonDokunus = performance.now();
    await new Promise<void>(r => {
      const adim = () => {
        const k = Math.min(1, (performance.now() - t0) / Math.max(1, T));
        g.x = basX + (hedefX - basX) * k;
        g.zip.goster(k < 0.2 ? 0 : k < 0.8 ? 1 : 2);
        gelisKonumla(-150 * Math.sin(Math.PI * k));
        if (k < 1 && calisiyor) requestAnimationFrame(adim); else r();
      };
      requestAnimationFrame(adim);
    });
    ses('e-pat', 0.6, 0.85);
    if (g.zipSayisi >= GIRIS.zipSayisi) {
      // sedyede: Y1'in bekleme pozlarına geçer, derdini söyler; çanta kendini gösterir
      g.kutu.remove(); cizimBirak([...A1.topal, ...A1.zipla]);     // geliş kareleri artık gerekmez
      if (!lavaboBitti) void altHazirla('lavabo'); else if (!gogusBitti) void altHazirla('gogus');     // ilk istasyon şimdi kurulur (çanta açılana dek hazır)
      zipzip.classList.remove('vk-gizli'); pop(zipzip, 220);
      asamaGec('giris');
      soyle('z-ay');
      kinoKahkaha = performance.now();                    // sedyeye konunca Kino sevinir
      setTimeout(() => { if (calisiyor && asama === 'giris') { salla(canta); hop(kino, 16); } }, sure(260));
    } else {
      g.zip.kutu.classList.add('vk-gizli'); g.topal.kutu.classList.remove('vk-gizli'); g.topal.goster(0);
      g.kutu.classList.add('vk-sirada');
      g.zipliyor = false;
    }
  }
  gelis?.kutu.addEventListener('pointerdown', () => { void gelisZipla(); });

  // ıslak pamuk: dikenlerden sonra kol pamukla silinir. Pamuk kâseye daldırılınca ıslanır, sildikçe kirlenir;
  // çok kirlenince silmez, kâsede çalkalanır.
  const pamuk = ACIK.pamuk ? (() => {
    const kase = el('div', 'vk-katman vk-kase'); koy(kase, PAMUK.kase); kase.append(resim(A1.kase));
    const dalga = A1.kaseDalga.every(secmeliVar) ? new KareDizisi(ortam, A1.kaseDalga, 'vk-kase-dalga vk-gizli') : null;
    if (dalga) kase.append(dalga.kutu);
    const kare = new KareDizisi(ortam, [A1.pamukKuru, A1.pamukIslak, ...A1.pamukKir], 'vk-katman vk-pamuk');
    const golge = golgeYap(cizimBul(A1.pamukKuru) ?? new Image(), PAMUK.boy, PAMUK.boy);
    const durum = { islak: false, sildigi: 0, silinen: new Set<number>(), sonSes: 0, bitti: false };
    const surukle = new Surukle(ortam, kare.kutu, { sol: PAMUK.yer.x - PAMUK.boy / 2, ust: PAMUK.yer.y - PAMUK.boy / 2, g: PAMUK.boy, y: PAMUK.boy }, {
      izin: () => asama === 'pamuk' && !durum.bitti, golge, kaldir: 40,
      basladi: () => { ses('e-tik', 0.7, 1.2); kare.kutu.classList.remove('vk-sirada'); },
      tutulurken: (m, _dt, yol) => pamukAdimi(m, yol),
      birakildi: () => { if (!durum.bitti) kare.kutu.classList.add('vk-sirada'); },
    });
    // kâseden sıçrayan ve ıslak pamuktan damlayan su (gerçekten düşer); kâsenin ve kolun üstünde, pamuğun altında
    const su = new SuKatmani(cizimBul(A1.suDamla[0]), { sutun: false });
    yakin.insertBefore(kase, dok); yakin.insertBefore(su.tuval, dok); yakin.insertBefore(golge, dok); yakin.insertBefore(kare.kutu, dok);
    kase.hidden = true; kare.kutu.hidden = true;
    return { kase, dalga, kare, surukle, durum, su, sonDamla: 0 };
  })() : null;
  function pamukAdimi(m: Nokta, yol: number) {
    const P = pamuk!, d = P.durum, an = performance.now();
    if (kasede(m)) {
      if (d.islak && d.sildigi === 0) return;
      // daldır: ıslanır ya da çalkalanıp temizlenir
      d.islak = true; d.sildigi = 0;
      P.kare.goster(1);
      ses('p-sip', 0.9, 0.95 + Math.random() * 0.15);
      P.su.sicrat({ x: PAMUK.kaseAgzi.x, y: PAMUK.kaseAgzi.y + 10 }, 9);
      P.kase.animate([{ scale: '1' }, { scale: '1.06 .95', offset: 0.35 }, { scale: '1' }], { duration: sure(260) });
      const dl = P.dalga;
      if (dl) { dl.kutu.classList.remove('vk-gizli'); dl.goster(0); setTimeout(() => dl.goster(1), sure(130)); setTimeout(() => dl.kutu.classList.add('vk-gizli'), sure(320)); }
      kinoTepki('sevin', 450, 12);
      return;
    }
    // ıslak pamuk taşınırken damlar (temizken; sildikçe suyu azalır)
    if (d.islak && pamukKiri(d.sildigi) < 2 && an - P.sonDamla > 420) { P.sonDamla = an; P.su.damlat({ x: m.x, y: m.y + PAMUK.boy * 0.3 }); }
    const h = pamukHucre(m);
    if (h < 0 || yol < 0.5) return;
    if (!d.islak || pamukKiri(d.sildigi) === 3) {
      // kuru ya da çok kirli pamuk silmez: kâse kendini gösterir (ceza yok)
      if (an - d.sonSes > 600) { d.sonSes = an; ses('e-tik', 0.5, 0.7); ziplat(P.kase); kinoTepki('sasir', 500, 10); }
      return;
    }
    camurSil(m, 190, 160); kopukTuvali.sil(m, 150);
    if (an - d.sonSes > 140) { d.sonSes = an; ses('p-sil', 0.7, 0.9 + Math.random() * 0.25); }
    if (d.silinen.has(h)) return;
    d.silinen.add(h); d.sildigi++;
    const kir = pamukKiri(d.sildigi);
    P.kare.goster(2 + kir);
    if (kir === 3) { ses('e-pof', 0.4, 0.8); ziplat(P.kase); }
    if (pamukOrani(d.silinen) >= PAMUK_HEDEF[yas]) void pamukBitti();
  }
  async function pamukBitti() {
    const P = pamuk!;
    if (P.durum.bitti) return;
    P.durum.bitti = true; P.surukle.birak();
    P.kare.kutu.classList.remove('vk-sirada');
    // kalan çamur da gider; kol pırıl pırıl
    for (let x = PAMUK.alan.sol; x <= PAMUK.alan.sol + PAMUK.alan.g; x += 160) camurSil({ x, y: PAMUK.alan.ust + PAMUK.alan.y / 2 }, 420, 260);
    ses('e-cin', 0.6, 1.3); soyle('z-pamuk'); kinoTepki('sevin', 800, 24);
    yildizSac(yakinYildizlari, { x: 760, y: 540 }, 8, 260, 60);
    await bekle(520);
    for (const e of [P.kase, P.kare.kutu]) e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(200), fill: 'forwards' });
    await bekle(200);
    P.kase.hidden = true; P.kare.kutu.hidden = true;
    if (calisiyor) asamaGec('sargi');
  }
  /** dikenler bitti: pamuk açıksa ıslak pamuk adımı, değilse sargı */
  function dikenlerdenSonra() {
    if (!pamuk) { asamaGec('sargi'); return; }
    asamaGec('pamuk');
    pamuk.kase.hidden = false; pamuk.kare.kutu.hidden = false;
    pop(pamuk.kase, 240); pop(pamuk.kare.kutu, 240);
    pamuk.kare.kutu.classList.add('vk-sirada');
    ses('e-tik', 0.7, 1.2);
  }
  // sevinç dansı (A1 geldiyse zıplamanın yerine): sekiz kare döner
  let odulKaydi: Record<string, unknown> | null = null;
  let dans: { dizi: KareDizisi; basi: number; tur: number } | null = null;
  let dansBekleyen: Promise<void> | null = null;
  /** dans kareleri bant aşamasında yüklenir ve masada bir kez (görünmeden) çizdirilir */
  const dansHazirla = (): Promise<void> => (dansBekleyen ??= (async () => {
    if (!ACIK.dans) return;
    await cizimYukle(A1_SAHNE.dans);
    const d = new KareDizisi(ortam, A1.dans, 'vk-katman vk-dans vk-gizli'); koy(d.kutu, HUB.zipzip); zipzip.after(d.kutu);
    await Promise.all([...d.kutu.querySelectorAll('img')].map(r => r.decode().catch(() => undefined)));
    if (kinoY && A1.kinoDans.every(secmeliVar)) { await Promise.all(A1.kinoDans.map(a => kinoY.ekle(a).decode().catch(() => undefined))); kinoDansVar = true; }
    dans = { dizi: d, basi: 0, tur: 0 };
  })());

  // ——————————————————————————— masa: çanta ve kola dokunma
  canta.addEventListener('pointerdown', () => {
    if (asama === 'gelis') { if (gelis) ziplat(gelis.kutu); return; }
    if (asama !== 'giris') { if (asama === 'canta') istasyonaGit(); return; }
    asamaGec('canta'); sonDokunus = performance.now();
    ses('e-cit');
    cantaY.goster(VAKA.cantaAcik);
    canta.classList.add('vk-acik');
    canta.animate([{ transform: 'scale(.96)' }, { transform: 'scale(1.04)', offset: 0.55 }, { transform: 'scale(1)' }], { duration: sure(260), easing: 'ease-out' });
    cantaAletleri.forEach((r, i) => setTimeout(() => { r.hidden = false; pop(r); ses('e-tik', 0.8, 1 + i * 0.08); }, sure(140 + i * 95)));
    kinoSasirdi = performance.now();
    hop(kino, 18);
    setTimeout(() => { soyle('z-canta'); siradakiniGoster(); }, sure(420));
    setTimeout(() => hop(kino, 14, 220), sure(1150));        // şaşkınlıktan çıkıp patiyi gösterir
  });
  kolDugmesi.addEventListener('pointerdown', () => { if (asama === 'canta' && siradakiDugme() === kolDugmesi) void yaklas(); });

  const kamera = (k: number) => {
    const y = HUB.yaklasma, t = (k - 1) / (y.olcek - 1);
    return `translate(${y.x + (SAHNE.g / 2 - y.x) * t - y.x * k}px, ${y.y + (SAHNE.y / 2 - y.y) * t - y.y * k}px) scale(${k})`;
  };
  let geciste = false;
  async function yaklas() {
    if (geciste) return;
    geciste = true;
    ses('e-vuu', 0.7);
    kolDugmesi.hidden = true;
    mercekHazirla();
    await uyandir(yakin);
    yakin.classList.remove('vk-altta');
    yakin.animate([{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], { duration: sure(430), easing: 'ease-in' });
    const asagi = `translateY(${Math.round(240 + tasma.dik)}px)`, dahaAsagi = `translateY(${Math.round(420 + tasma.dik)}px)`;
    dok.animate([{ transform: asagi }, { transform: asagi, offset: 0.6 }, { transform: 'translateY(0)' }], { duration: sure(620), easing: 'cubic-bezier(.2,.9,.3,1.15)' });
    kinoYakinY?.kutu.animate([{ transform: dahaAsagi }, { transform: dahaAsagi, offset: 0.55 }, { transform: 'translateY(0)' }], { duration: sure(700), easing: 'cubic-bezier(.2,.9,.3,1.15)' });
    await hub.animate([{ transform: kamera(1) }, { transform: kamera(HUB.yaklasma.olcek) }], { duration: sure(430), easing: 'cubic-bezier(.5,0,.6,1)' }).finished.catch(() => undefined);
    hub.classList.add('vk-altta'); uyut(hub);
    etkin = yakin;
    geciste = false;
    asamaGec('buyutec');
    // yakın plana gelince Zıpzıp patisini gösterir (geçişten ilk mikroba kadar sessizlik kalmaz)
    setTimeout(() => { if (asama === 'buyutec') soyle('z-bak'); }, sure(120));
  }
  /** kutlamadan önce masa: Zıpzıp sevinç pozunda, bileğinde seçilen bant */
  function masayiHazirla() {
    zipzipY.goster(VAKA.sevinc[0]);
    if (secilenBant) { hubBant.src = adres(secilenBant)!; hubBant.hidden = false; }
  }
  async function uzaklas() {
    geciste = true;
    ses('e-vuu', 0.7, 1.15);
    await uyandir(hub);
    hub.classList.remove('vk-altta');
    masayiHazirla();
    void yakin.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(260), easing: 'ease-out', fill: 'forwards' });
    await hub.animate([{ transform: kamera(HUB.yaklasma.olcek) }, { transform: kamera(1) }], { duration: sure(430), easing: 'cubic-bezier(.3,0,.3,1)' }).finished.catch(() => undefined);
    yakin.classList.add('vk-altta'); uyut(yakin);
    etkin = hub;
    geciste = false;
  }

  // ——————————————————————————— elde tutulan alet
  interface Tutulan { alet: AletAdi | 'bant'; kaynak: HTMLElement; kutu: HTMLDivElement; resim: HTMLImageElement; g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir: number; parmak: Nokta; id: number; kilit: number; tasinan: number; mercek?: HTMLCanvasElement;
    /** gölgesi; gittiği yöne yatış açısı (derece); bir önceki karedeki parmak yeri; parmağın hızı (sahne pikseli/ms); cımbızın dikeni tuttuğu an */
    golge?: HTMLCanvasElement; egim: number; once: Nokta; surat: number; kilitAni: number;
    /** eldeki ölçeği (rulo açıldıkça küçülür); dikenin çıktığı an (yay titreşimi buradan sayılır) */
    olcek: number; cikisAni: number; }
  let tutulan: Tutulan | null = null;
  const cimbizGoster = (t: Tutulan, kapali: boolean) => { t.kutu.classList.toggle('vk-kapali', kapali); };
  const ucNoktasi = (t: Tutulan, parmak = t.parmak): Nokta => ({ x: parmak.x - t.tut[0] * t.g + t.uc[0] * t.g, y: parmak.y - t.kaldir - t.tut[1] * t.y + t.uc[1] * t.y });
  /** aleti, ucu verilen noktaya gelecek biçimde çizer */
  function ucaCiz(t: Tutulan, uc: Nokta, mercekDe = true) {
    // alet elde bir parça büyük ve gittiği yöne hafifçe yatık; ikisi de ucun çevresinde, uç yerinden oynamaz
    const x = uc.x - t.uc[0] * t.g, y = uc.y - t.uc[1] * t.y, don = `rotate(${t.egim.toFixed(2)}deg) scale(${t.olcek.toFixed(3)})`;
    t.kutu.style.transform = `translate3d(${x}px, ${y}px, 0) ${don}`;
    if (t.golge) t.golge.style.transform = `translate3d(${x + 18}px, ${y + 32}px, 0) ${don}`;
    if (t.mercek) {
      t.mercek.style.transform = `translate3d(${uc.x - mercekCss / 2}px, ${uc.y - mercekCss / 2}px, 0) scale(${ELDE_OLCEK})`;
      if (mercekDe) mercekCiz(uc, performance.now());
    }
  }
  const golgeSondur = (t: Tutulan) => { const g = t.golge; if (!g) return; g.getAnimations().forEach(c => c.cancel()); g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(150), fill: 'forwards' }); };
  function tut(kaynak: HTMLElement, alet: AletAdi | 'bant', cizim: string, e: PointerEvent) {
    const a = alet === 'bant' ? { boy: 330, tut: [0.5, 0.5] as const, uc: [0.5, 0.5] as const } : ALETLER[alet];
    const oran = alet === 'bant' ? 150 / 360 : 1;
    // dört aletin eldeki hâli sahne kurulurken hazırlandı (çizimi çözülü ve boyalı); bant küçük, o anda yapılır
    const hazir = alet === 'bant' ? undefined : hazirKutu.get(alet);
    const kutu = hazir ?? el('div', 'vk-tutulan'); kutu.dataset.alet = alet;
    const r = hazir ? hazir.querySelector('img')! : resim(cizim);
    kutu.getAnimations().forEach(c => c.cancel());
    kutu.classList.remove('vk-bekler', 'vk-kapali', 'vk-yari');
    kutu.style.width = a.boy + 'px'; kutu.style.height = a.boy * oran + 'px';
    if (!hazir) kutu.append(r);
    if (alet === 'bant' && BANT_KAGIT) {
      // A1: bandın arkasındaki koruyucu kâğıt soyulur (üç kare), "cırt"
      const f = el('div', 'vk-bant-kagit'); f.append(...bantKagitlari.map(a => resim(a))); kutu.append(f);
      kareOynat(f, 300); ses('d-cirt', 0.6, 1.25);
      setTimeout(() => f.remove(), sure(320));
    }
    const t: Tutulan = { alet, kaynak, kutu, resim: r, g: a.boy, y: a.boy * oran, tut: a.tut, uc: a.uc, kaldir: alet === 'buyutec' ? 0 : alet === 'sargi' || alet === 'bant' ? 70 : 40, parmak: noktaya(e), id: e.pointerId, kilit: -1, tasinan: -1, egim: 0, once: noktaya(e), surat: 0, kilitAni: 0, olcek: ELDE_OLCEK, cikisAni: 0 };
    kutu.style.transformOrigin = `${a.uc[0] * 100}% ${a.uc[1] * 100}%`;
    const golge = golgeler.get(alet);
    if (golge) {
      golge.style.transformOrigin = kutu.style.transformOrigin;
      golge.getAnimations().forEach(c => c.cancel());
      golge.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(140), easing: 'ease-out', fill: 'forwards' });
      t.golge = golge;
    }
    if (alet === 'buyutec') {
      mercekCss = mercekCapi(a.boy);
      mercek.style.width = mercek.style.height = mercekCss + 'px';
      // tuvalin çözünürlüğü ekrandaki boyu kadar (sahne ölçeği × ekran yoğunluğu), en çok 2 kat
      mercek.width = mercek.height = Math.round(mercekCss * Math.min(2, Math.max(1, S * (window.devicePixelRatio || 1))));
      mercek.style.visibility = 'visible';
      // çerçeve ele gelirken büyür; cam o bitince belirir (çerçevenin dışına taşmış görünmesin)
      mercek.animate([{ opacity: 0 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }], { duration: sure(150) });
      t.mercek = mercek;
    }
    elKati.append(kutu);
    kaynak.classList.add('vk-kalkti');
    try { kaynak.setPointerCapture(e.pointerId); } catch { /* yakalanamazsa pencere olayları yeter */ }
    tutulan = t; sonDokunus = performance.now();
    ucaCiz(t, ucNoktasi(t));
    // ele gelirken küçük bir "hop": alet tutulduğu noktadan büyür, yeri değişmez
    for (const c of kutu.children) {
      (c as HTMLElement).style.transformOrigin = `${a.tut[0] * 100}% ${a.tut[1] * 100}%`;
      c.animate([{ transform: 'scale(.82)' }, { transform: 'scale(1)' }], { duration: sure(120), easing: 'cubic-bezier(.2,.8,.3,1.3)' });
    }
    ses('e-tik', 0.7, 1.2);
    hop(kinoYakinY?.kutu, 8, 200);
  }
  /** alet yuvasına döner */
  function birak(t: Tutulan, hemen = false) {
    if (tutulan === t) tutulan = null;
    if (t.mercek) t.mercek.style.visibility = 'hidden';
    if (t.alet === 'sargi') sargiBez.hidden = true;
    golgeSondur(t);
    const k = t.kaynak.getBoundingClientRect(), s = sahne.getBoundingClientRect();
    const hedef = { x: (k.left + k.width / 2 - s.left) / S, y: (k.top + k.height / 2 - s.top) / S };
    const bitir = () => {
      t.kaynak.classList.remove('vk-kalkti');
      if (tutulan && tutulan.kutu === t.kutu) return;      // dönerken yeniden ele alındı
      if (t.alet !== 'bant' && hazirKutu.get(t.alet) === t.kutu) { t.kutu.getAnimations().forEach(c => c.cancel()); t.kutu.classList.add('vk-bekler'); t.kutu.classList.remove('vk-kapali', 'vk-yari'); } else t.kutu.remove();
    };
    if (hemen || !t.kaynak.isConnected || t.kaynak.hidden) { bitir(); return; }
    // büyüme ve eğim ucun çevresinde: yuvaya ortalanması için öteleme ona göre hesaplanır
    const ox = t.uc[0] * t.g, oy = t.uc[1] * t.y, kucuk = Math.min(1, (k.height / S) / t.y);
    void t.kutu.animate([{ transform: t.kutu.style.transform }, { transform: `translate3d(${hedef.x - ox - kucuk * (t.g / 2 - ox)}px, ${hedef.y - oy - kucuk * (t.y / 2 - oy)}px, 0) rotate(0deg) scale(${kucuk})` }],
      { duration: sure(190), easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }).finished.then(bitir, bitir);
  }

  /**
   * Sırası gelmemiş aletin şakası: sprey boşa "fıs" edip minik bir köpük çıkarır, cımbız takır takır eder,
   * büyüteç büyüyüp döner, sargı yerinde yuvarlanır. Zıpzıp kıkırdar (yüzü güler).
   */
  function aletSakasi(ad: AletAdi, b: HTMLElement, p: Nokta) {
    const T = sure(440);
    if (ad === 'sprey') {
      b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14,.84)', offset: 0.25 }, { transform: 'scale(.93,1.1)', offset: 0.55 }, { transform: 'scale(1)' }], { duration: T, easing: 'ease-out' });
      ses('e-fis', 0.6, 1.5);
      const k = resim(VAKA.kopuk, 'vk-katman'); k.style.pointerEvents = 'none'; k.style.zIndex = '7'; ortala(k, { x: p.x + 30, y: p.y - 170 }, 150, 150); yakin.append(k);
      const sil = () => k.remove();
      void k.animate([{ scale: '.2', opacity: 0, translate: '0 60px' }, { scale: '1', opacity: 1, translate: '0 0', offset: 0.4 }, { scale: '1.3', opacity: 0, translate: '0 -50px' }], { duration: sure(560), easing: 'ease-out' }).finished.then(sil, sil);
      setTimeout(() => ses('e-pof', 0.4, 1.5), sure(300));
    } else if (ad === 'cimbiz') {
      b.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-11deg) scale(1.08)' }, { transform: 'rotate(9deg) scale(1.08)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0)' }], { duration: T, easing: 'ease-in-out' });
      ses('e-kilit', 0.5, 1.6); setTimeout(() => ses('e-kilit', 0.5, 1.9), sure(170));
    } else if (ad === 'buyutec') {
      b.animate([{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.28) rotate(-18deg)', offset: 0.4 }, { transform: 'scale(1.1) rotate(12deg)', offset: 0.72 }, { transform: 'scale(1) rotate(0)' }], { duration: T, easing: 'ease-out' });
      ses('e-vuu', 0.5, 1.7);
    } else {
      b.animate([{ transform: 'rotate(0) translateY(0)' }, { transform: 'rotate(200deg) translateY(-16px)', offset: 0.5 }, { transform: 'rotate(360deg) translateY(0)' }], { duration: T, easing: 'cubic-bezier(.3,0,.3,1)' });
      ses('e-vuu', 0.5, 1.3); setTimeout(() => ses('e-pat', 0.4, 1.2), T);
    }
    sakaKalan = 750;
    setTimeout(() => { if (calisiyor) ses('e-hihi', 0.6, 1.1); }, sure(220));
    if (yuzY) hop(yuzY.kutu, 10, 240);
  }
  for (const [ad, b] of dokAletleri) {
    b.addEventListener('pointerdown', e => {
      if (e.button !== 0 || tutulan || geciste) return;
      e.preventDefault();
      // sırası gelmemiş alet kendi şakasını yapar, Zıpzıp güler, Kino "ups" der; ardından sıradaki alet zıplar (ceza yok)
      if (asamaAleti(asama) !== ad) { aletSakasi(ad, b, noktaya(e)); kinoTepki('sasir', 700, 10, true); const sira = asamaAleti(asama); if (sira) setTimeout(() => { if (calisiyor) ziplat(dokAletleri.get(sira)!); }, sure(380)); return; }
      tut(b, ad, ad === 'cimbiz' ? VAKA.cimbizAcik : ALETLER[ad].cizim, e);
    });
  }
  dokBantlari.forEach(b => b.addEventListener('pointerdown', e => {
    if (e.button !== 0 || tutulan || asama !== 'bant') return;
    e.preventDefault();
    tut(b, 'bant', b.dataset.bant!, e);
  }));
  addEventListener('pointermove', e => {
    const b = bantDuzle;
    if (b && b.son && e.pointerId === b.id) { const q = noktaya(e), yol = uzak(q, b.son); b.son = q; if (uzak(q, YAKIN.sargi) <= 300) bantBastir(yol); }
    const t = tutulan; if (t && e.pointerId === t.id) { t.parmak = noktaya(e); if (t.kilit < 0) ucaCiz(t, ucNoktasi(t)); } }, { signal: iptal.signal });
  const kalk = (e: PointerEvent) => {
    if (bantDuzle && e.pointerId === bantDuzle.id) { bantDuzle.id = -1; bantDuzle.son = null; }
    const t = tutulan;
    if (!t || e.pointerId !== t.id) return;
    if (t.alet === 'bant') { bantBirakildi(t); return; }
    if (t.alet === 'cimbiz' && t.tasinan >= 0) { void tepsiyeBirak(t, t.tasinan, true); return; }
    if (t.alet === 'cimbiz' && t.kilit >= 0) { dikenSal(t.kilit); t.kilit = -1; }
    birak(t);
  };
  addEventListener('pointerup', kalk, { signal: iptal.signal });
  addEventListener('pointercancel', kalk, { signal: iptal.signal });
  // Her dokunuşa anında karşılık: boş yere, karaktere ya da kola dokununca küçük bir parıltı ve "tık"; dokunulan karakter
  // kıpırdar, sıradaki iş kendini gösterir (çanta, pati ya da şeritteki alet; Kino onu gösterir).
  sahne.addEventListener('pointerdown', e => {
    if (e.button !== 0 || tutulan || geciste || (e.target as Element).closest('button')) return;
    const p = noktaya(e), yakinda = etkin === yakin;
    sonDokunus = performance.now();
    if (bantDuzle && yakinda && uzak(p, YAKIN.sargi) <= 260) { bantDuzle.id = e.pointerId; bantDuzle.son = p; bantBastir(60); return; }
    const icinde = (k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
    ses('e-tik', 0.45, 1.35);
    const ustte = etkinAlt();
    if (ustte) { parilti(ustte.yerel?.(p) ?? p, 130, ustte.ust); ustte.ipucu(); return; }
    parilti(p, 130, yakinda ? kopukKati : yagmurKati);
    if (yakinda) {
      if (kinoYakinY && icinde(YAKIN.kino)) { kinoTepki('sevin', 520, 20); return; }
      if (yuzY && icinde(YAKIN.yuz)) { hop(yuzY.kutu, 12, 220); return; }
      if (bantDuzle) { yakinBant.animate([{ scale: '1' }, { scale: '1.14', offset: 0.4 }, { scale: '1' }], { duration: sure(280), easing: 'ease-out' }); kinoTepki('sevin', 520, 12); return; }
      const alet = asamaAleti(asama);
      const sirada = alet ? dokAletleri.get(alet) : asama === 'bant' ? dokBantlari.find(b => !b.hidden) : undefined;
      if (sirada) { ziplat(sirada); kinoTepki('sevin', 520, 12); }
      else if (asama === 'pamuk' && pamuk) { if (pamuk.durum.islak && pamukKiri(pamuk.durum.sildigi) < 3) parcaZiplat(ortam, pamuk.kare.kutu); else ziplat(pamuk.kase); kinoTepki('sevin', 520, 12); }
    } else {
      if (kino && icinde(HUB.kino)) { kinoSasirdi = kinoKahkaha = performance.now(); hop(kino, 18); return; }       // Kino'ya dokununca güler
      // şeritteki bantlar daha sırada değil: Kino "ups" der, sıradaki iş kendini gösterir
      if (icinde(HUB.serit) && asama !== 'kutlama' && asama !== 'son') { kinoUps = performance.now(); hop(kino, 12, 200); }
      if (icinde(HUB.zipzip) && asama !== 'kutlama' && asama !== 'son') hop(zipzip, 10, 220);
      if (asama === 'gelis' && gelis && !gelis.yuruyor) ziplat(gelis.kutu);
      else if (asama === 'giris') salla(canta); else if (asama === 'canta') ziplat(siradakiDugme());
    }
  });

  // ——————————————————————————— mekanikler
  /** guc: 1 tamamen siler; pamuk adımı açıkken köpük çamuru yalnız çözer (0,55), ıslak pamuk siler */
  function camurSil(p: Nokta, yaricap: number, ms = 420, guc = 1) {
    const t0 = performance.now();
    const adim = (an: number) => {
      // kare damgası başlangıçtan önceye düşebilir (aynı karede başlatılırsa): oran 0–1 arasında tutulur
      const k = Math.max(0, Math.min(1, (an - t0) / Math.max(1, sure(ms))));
      const r = (yaricap * (0.35 + 0.65 * k)) / 2;
      const g = cg.createRadialGradient(p.x / 2, p.y / 2, r * 0.55, p.x / 2, p.y / 2, r);
      g.addColorStop(0, `rgba(0,0,0,${guc})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      cg.globalCompositeOperation = 'destination-out';
      cg.fillStyle = g; cg.beginPath(); cg.arc(p.x / 2, p.y / 2, r, 0, Math.PI * 2); cg.fill();
      if (k < 1) requestAnimationFrame(adim);
    };
    requestAnimationFrame(adim);
  }
  // Köpük öbekleri havuzu: kırk öbek baştan sahnede, neredeyse saydam. İlk köpükte yeni katman kurulmaz, kare atlamaz.
  const kopukHavuzu: HTMLImageElement[] = [];
  for (let i = 0; i < 40; i++) { const r = resim(VAKA.kopuk, 'vk-katman vk-kopuk vk-bos'); ortala(r, { x: 500 + (i % 10) * 60, y: 520 + Math.floor(i / 10) * 30 }, 160, 160); kopukKati.append(r); kopukHavuzu.push(r); }
  // ısınma: ilk köpük animasyonu ve ilk çamur silme yolu açılışta bir kez (görünmeden) çalışır
  kopukHavuzu[0].animate([{ scale: '.2' }, { scale: '1' }], { duration: 200 });
  { const g = cg.createRadialGradient(4, 4, 1, 4, 4, 3); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0)'); cg.globalCompositeOperation = 'destination-out'; cg.fillStyle = g; cg.beginPath(); cg.arc(4, 4, 3, 0, Math.PI * 2); cg.fill(); cg.globalCompositeOperation = 'source-over'; }
  /**
   * Bir köpük öbeği doğar: havuzdaki hazır öbek küçükten büyüyerek belirir, sonra tuvale basılır ve havuza döner
   * (ekranda hep birkaç canlı öbek olur; biriken köpük tuvaldedir, yüzlerce katman kurulmaz).
   */
  function kopukKoy(p: Nokta, boy: number): void {
    const aci = Math.round(Math.random() * 360);
    const r = kopukHavuzu.pop();
    if (!r) { if (asama === 'sprey') kopukTuvali.ekle(p, boy, aci); return; }
    r.classList.remove('vk-bos');
    ortala(r, p, boy, boy);
    r.style.rotate = aci + 'deg';
    // köpük adımı bittiyse (kalan köpük sönerken) doğmakta olan öbek tuvale basılmaz: kolda köpük kalmaz
    const bitti = () => { if (asama === 'sprey') kopukTuvali.ekle(p, boy, aci); r.classList.add('vk-bos'); kopukHavuzu.push(r); };
    r.animate([{ scale: '.2', opacity: 0.4 }, { scale: '1.12', opacity: 1, offset: 0.7 }, { scale: '1', opacity: 1 }], { duration: sure(150), easing: 'ease-out' }).finished.then(bitti, bitti);
  }
  /** köpükten bir kabarcık yükselir ve "pıt" diye patlar */
  function kabarcik(p: Nokta) {
    const r = kopukHavuzu.pop();
    if (!r) return;
    const boy = 46 + Math.random() * 34, dx = (Math.random() - 0.5) * 70, dy = -(70 + Math.random() * 60);
    r.classList.remove('vk-bos');
    ortala(r, p, boy, boy);
    r.style.rotate = '0deg';
    const bitti = () => { r.classList.add('vk-bos'); kopukHavuzu.push(r); };
    setTimeout(() => ses('e-pof', 0.13, 1.9 + Math.random() * 0.5), sure(430));
    r.animate([{ transform: 'translate(0, 0) scale(.4)', opacity: 0.9 }, { transform: `translate(${dx * 0.8}px, ${dy * 0.85}px) scale(1)`, opacity: 1, offset: 0.78 }, { transform: `translate(${dx}px, ${dy}px) scale(1.7)`, opacity: 0 }],
      { duration: sure(560), easing: 'ease-out' }).finished.then(bitti, bitti);
  }
  /** p çevresindeki köpük tek tek "pof" diye söner (tuvalden silinir, yerinde küçük bir patlama görünür) */
  function kopukPatlatBolge(p: Nokta, yaricap: number, adet = 6, aralik = 55) {
    for (let i = 0; i < adet; i++) {
      const a = (i / adet) * Math.PI * 2 + Math.random(), u = yaricap * (0.25 + 0.6 * Math.random());
      const q = { x: p.x + Math.cos(a) * u, y: p.y + Math.sin(a) * u * 0.8 };
      setTimeout(() => { kopukTuvali.sil(q, 150); parilti(q, 120); ses('e-pof', 0.28, 1.45 + (i % 5) * 0.14 + Math.random() * 0.08); }, sure(40 + i * aralik));
    }
    setTimeout(() => kopukTuvali.sil(p, yaricap * 1.25), sure(60 + adet * aralik));
  }
  /** kalan bütün köpük art arda söner; bitince tuval temizlenir */
  function kopuguBitir(aralik = 26): number {
    const yerler = kopukTuvali.dolular().sort(() => Math.random() - 0.5).slice(0, 26);
    yerler.forEach((q, i) => setTimeout(() => { kopukTuvali.sil(q, 130); if (i % 2 === 0) parilti(q, 110); ses('e-pof', i < 10 ? 0.24 : 0.1, 1.5 + (i % 6) * 0.12); }, sure(30 + i * aralik)));
    const toplam = 60 + yerler.length * aralik;
    setTimeout(() => kopukTuvali.temizle(), sure(toplam));
    return toplam;
  }

  function mikropBulundu(i: number) {
    bulunan[i] = true;
    mikropEl[i].classList.add('vk-bulundu');
    pop(mikropEl[i], 260);
    ses('e-hihi', 0.9, 1 + i * 0.12);
    kinoTepki('sevin', 650);
    if (bulunan.every(Boolean)) {
      const t = tutulan;
      setTimeout(() => { soyle('z-mikrop'); if (t && tutulan === t) birak(t); asamaGec('sprey'); mercekBirak(); }, sure(380));
    }
  }
  async function mikropGitti(i: number) {
    giden[i] = true;
    const m = mikroplar[i], r = mikropEl[i];
    ses('e-pof');
    kinoTepki('sevin', 700, 24);
    kikirKalan = KIKIR_MS; pofKalan = KIKIR_MS;
    if (giden.filter(Boolean).length === 1) soyle('z-kikir');
    kopukPatlatBolge(m, 190);
    // pamuk adımı açıkken köpük çamuru silmez, yalnız çözer (rengi açılır); silme işi ıslak pamuğundur
    if (pamuk) { camur.style.transition = 'opacity .4s'; camur.style.opacity = String(1 - 0.3 * (giden.filter(Boolean).length / giden.length)); } else camurSil(m, 300, 420);
    r.classList.remove('vk-bulundu', 'vk-titriyor');
    r.classList.add('vk-gidiyor');
    mikropY[i].goster(POF[0]);
    r.animate([{ scale: '1' }, { scale: '1.25' }], { duration: sure(90), fill: 'forwards' });
    await bekle(90);
    mikropY[i].goster(POF[1]);
    if (POF.length > 2) {
      // A1: bulut dört karede dağılır, son karede üç dört küçük nokta kalır
      r.animate([{ scale: '1.25' }, { scale: '1.6' }], { duration: sure(250), easing: 'ease-out', fill: 'forwards' });
      await bekle(80); mikropY[i].goster(POF[2]);
      await bekle(80); mikropY[i].goster(POF[3]);
      await r.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(110), fill: 'forwards' }).finished.catch(() => undefined);
    } else await r.animate([{ scale: '1.25', opacity: 1 }, { scale: '1.6', opacity: 0 }], { duration: sure(170), fill: 'forwards' }).finished.catch(() => undefined);
    r.remove();
    // ikinci mikropta söyler: ilkinde "mikroplar saklanmış" sözü daha bitmemiş olur
    if (!gidikSoylendi && giden.filter(Boolean).length >= Math.min(2, mikroplar.length)) { gidikSoylendi = true; soyle('z-gidik'); }
    if (giden.every(Boolean)) {
      const t = tutulan;
      // kalan çamur da köpükle gider
      if (!pamuk) MIKROPLAR.forEach(k => camurSil(k, 340, 500));
      await bekle(420);
      if (t && tutulan === t) birak(t);
      kopuguBitir();
      asamaGec('cimbiz');
    }
  }
  async function tepsiyeBirak(t: Tutulan, i: number, parmakKalkti: boolean) {
    t.tasinan = -1;
    cimbizGoster(t, false);
    const r = dikenEl[i], yer = YAKIN.tepsiYerleri[tepsideki % YAKIN.tepsiYerleri.length];
    tepsideki++;
    const aci = yer.aci, sira = tepsideki;
    const konum = (dy = 0, da = 0) => `translate(${yer.x - dikenler[i].x}px, ${yer.y - dikenler[i].y + dy}px) rotate(${aci + da}deg)`;
    const hedef = konum();
    r.classList.add('vk-tepside'); r.classList.remove('vk-gizli');
    // düşer, tepside iki kez seker: her değişte "tıngır" (ikincisi kısık, yankı gibi); düştüğü yerden halka yayılır
    const dusus = parmakKalkti ? 300 : 170, sekme = 330, f = dusus / (dusus + sekme), rad = (aci * Math.PI) / 180;
    setTimeout(() => {
      ses('e-tingir', 1, 0.95 + sira * 0.06);
      dalga({ x: yer.x + Math.cos(rad) * DIKEN_BOYU * 0.5, y: yer.y + Math.sin(rad) * DIKEN_BOYU * 0.5 });
      hop(kinoYakinY?.kutu, 10, 180);
    }, sure(dusus));
    setTimeout(() => ses('e-tingir', 0.32, 1.5), sure(dusus + sekme * 0.62));
    void r.animate([
      { transform: r.style.transform, easing: 'ease-in' },
      { transform: konum(-26), offset: f * 0.7, easing: 'ease-in' },
      { transform: hedef, offset: f, easing: 'ease-out' },
      { transform: konum(-24, 10), offset: f + (1 - f) * 0.3, easing: 'ease-in' },
      { transform: hedef, offset: f + (1 - f) * 0.62, easing: 'ease-out' },
      { transform: konum(-8, -5), offset: f + (1 - f) * 0.8, easing: 'ease-in' },
      { transform: hedef },
    ], { duration: sure(dusus + sekme), fill: 'forwards' });
    r.style.transform = hedef;
    if (parmakKalkti) birak(t);
    if (cikan.every(Boolean)) {
      await bekle(360);
      soyle('z-acimadi');
      if (tutulan === t) birak(t);
      dikenlerdenSonra();
    }
  }
  function bantBirakildi(t: Tutulan) {
    const uc = ucNoktasi(t);
    if (asama !== 'bant' || uc.y > YAKIN.serit.ust - 40) { birak(t); return; }
    secilenBant = t.kaynak.dataset.bant!;
    tutulan = null;
    golgeSondur(t);
    t.kutu.remove();
    t.kaynak.hidden = true;
    yakinBant.src = adres(secilenBant)!;
    ortala(yakinBant, YAKIN.sargi, 330, 138);
    yakinBant.hidden = false;
    const dx = uc.x - YAKIN.sargi.x, dy = uc.y - YAKIN.sargi.y;
    yakinBant.animate([{ transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(1.3)` }, { transform: 'rotate(-6deg) scale(.94)', offset: 0.75 }, { transform: 'rotate(-6deg) scale(1)' }], { duration: sure(230), easing: 'ease-out' });
    ses('e-pat');
    if (bantKirisikEl && bantDuzEl) {
      // A1: bant kırışık yapışır; üstünden parmakla geçilince düzelir, o zaman parıldar ve ödüle geçilir
      for (const r of [bantKirisikEl, bantDuzEl]) ortala(r, YAKIN.sargi, 330, 138);
      bantKirisikEl.style.opacity = ''; bantKirisikEl.hidden = false;
      bantDuzle = { kalan: BANT_DUZLEME[yas], yol: 0, id: -1, son: null };
      setTimeout(() => parilti(YAKIN.sargi, 150), sure(160));
      kinoTepki('sevin', 600);
      yakinBant.classList.add('vk-sirada');
      return;
    }
    bantParla();
    void odul();
  }
  /** bant yerinde ve düz: parıldar, küçük yıldızlar saçılır, çın eder */
  function bantParla() {
    setTimeout(() => { parilti(YAKIN.sargi, 260); yildizSac(yakinYildizlari, YAKIN.sargi, 9); ses('e-cin', 0.55, 1.25); }, sure(160));
    kinoTepki('sevin', 1200, 30);
  }
  /** kırışık bandın üstünden parmakla geçiliyor: her geçişte kırışıklık azalır (yaşa göre bir, iki ya da üç geçiş) */
  function bantBastir(yol: number) {
    const b = bantDuzle;
    if (!b || !bantKirisikEl || !bantDuzEl) return;
    b.yol += yol;
    if (b.yol < BANT_GECIS) return;
    b.yol = 0; b.kalan--;
    ses('e-his', 0.7, 1.1 + (BANT_DUZLEME[yas] - b.kalan) * 0.12);
    for (const r of [yakinBant, bantKirisikEl]) r.animate([{ scale: '1' }, { scale: '1.06 .93', offset: 0.4 }, { scale: '1' }], { duration: sure(160), easing: 'ease-out' });
    bantKirisikEl.style.opacity = String(b.kalan / BANT_DUZLEME[yas]);
    hop(kinoYakinY?.kutu, 8, 180);
    if (b.kalan > 0) return;
    bantDuzle = null;
    yakinBant.classList.remove('vk-sirada');
    bantKirisikEl.hidden = true; bantDuzEl.hidden = false;
    bantParla();
    void odul();
  }
  /** bant yapıştı: çıkartma defteri açıksa önce o (çıkartma, damga), sonra masada kutlama */
  async function odul() {
    await dansHazirla();
    if (!ACIK.defter) { asamaGec('kutlama'); void kutla(false); return; }
    asamaGec('defter');
    const [defter] = await Promise.all([altHazirla('defter'), bekle(KAPANIS.bekleme + 300)]);
    if (!calisiyor) return;
    await gorunumGec(defter.gorunum);
    await defter.oyna();
    if (!calisiyor) return;
    odulKaydi = defter.sayim();                 // sahne bırakılmadan: seçilen çıkartmalar (kayıt ve test için)
    asamaGec('kutlama');
    masayiHazirla();
    await gorunumGec(hub);
    altBirak('defter');
    void kutla(true);
  }
  async function kutla(masada: boolean) {
    if (!masada) { await bekle(KAPANIS.bekleme); await uzaklas(); }
    if (!calisiyor) return;
    const t0 = performance.now();
    // Zıpzıp sevinçle zıplar; ilk zıplayışla yıldız yağmuru başlar, her inişte yenileri gelir (kare döngüsü → inis)
    zipzip.style.transformOrigin = '50% 62%';
    if (dans) { dans.basi = performance.now(); dans.tur = 0; zipzip.classList.add('vk-gizli'); dans.dizi.kutu.classList.remove('vk-gizli'); }
    else zipla = zipzip.animate([
      { transform: 'translateY(0) scale(1)', easing: 'cubic-bezier(.2,.7,.4,1)' },
      { transform: 'translateY(-38px) scale(1.04)', offset: 0.45, easing: 'cubic-bezier(.6,0,.9,.4)' },
      { transform: 'translateY(0) scale(1.03, .975)', offset: 0.86, easing: 'ease-out' },
      { transform: 'translateY(0) scale(1)' },
    ], { duration: ZIPLAMA_MS, iterations: Infinity });
    ziplamaTuru = 0;
    yildizYagdir(hubYildizlari, 14); konfetiYagdir(22);
    kino?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-16px)', offset: 0.45 }, { transform: 'translateY(0)' }], { duration: 300, iterations: Infinity, easing: 'ease-in-out' });
    const tesekkur = konus('z-tesekkur');
    await bekle(100);
    // yıldız şeritten göğse uçar
    const bas = BANTLAR.length > 3 ? { x: HUB.canta.sol + HUB.canta.g / 2, y: HUB.canta.ust + 600 } : { x: HUB.serit.sol + SERIT_YUVALARI[3][0], y: HUB.serit.ust + SERIT_YUVALARI[3][1] };
    hubYildiz.hidden = true;
    const y = resim(VAKA.yildiz, 'vk-katman vk-ucan-yildiz'); ortala(y, HUB.gogus, 120, 120); hub.append(y);
    const dx = bas.x - HUB.gogus.x, dy = bas.y - HUB.gogus.y;
    if (secmeliVar(A1.yildizKuyruk)) {
      // A1: yıldız, arkasında incelen parlak kuyrukla uçar (kuyruk gidiş yönünün tersinde); varınca yıldız kalır
      const k = YILDIZ_KUYRUK, kq = resim(A1.yildizKuyruk, 'vk-katman vk-ucan-yildiz');
      koy(kq, { sol: HUB.gogus.x - k.merkez.x * k.olcek, ust: HUB.gogus.y - k.merkez.y * k.olcek, g: 400 * k.olcek, y: 200 * k.olcek });
      kq.style.transformOrigin = `${(k.merkez.x / 4).toFixed(1)}% ${(k.merkez.y / 2).toFixed(1)}%`; hub.append(kq);
      y.classList.add('vk-gizli');
      const ara = { x: dx * 0.45, y: dy * 0.45 - 190 }, a1 = Math.atan2(ara.y - dy, ara.x - dx), b = Math.atan2(-ara.y, -ara.x), a2 = a1 + Math.atan2(Math.sin(b - a1), Math.cos(b - a1));
      const bitti = () => { kq.remove(); y.classList.remove('vk-gizli'); pop(y, 180); };
      void kq.animate([{ transform: `translate(${dx}px, ${dy}px) rotate(${a1.toFixed(3)}rad) scale(1.1)` }, { transform: `translate(${ara.x}px, ${ara.y}px) rotate(${((a1 + a2) / 2).toFixed(3)}rad) scale(1.5)`, offset: 0.55 }, { transform: `translate(0, 0) rotate(${a2.toFixed(3)}rad) scale(1)` }],
        { duration: sure(480), easing: 'cubic-bezier(.3,0,.4,1)' }).finished.then(bitti, bitti);
    }
    await y.animate([{ transform: `translate(${dx}px, ${dy}px) scale(1.1) rotate(0deg)` }, { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 190}px) scale(1.7) rotate(200deg)`, offset: 0.55 }, { transform: 'translate(0, 0) scale(1) rotate(360deg)' }],
      { duration: sure(480), easing: 'cubic-bezier(.3,0,.4,1)' }).finished.catch(() => undefined);
    if (!calisiyor) return;
    ses('e-cin');
    parilti(HUB.gogus, 300, hub);
    // bitiş sevinci kısa: "yeniden oyna" hemen hazır. Zıpzıp zıplamayı, yıldızlar seyrekçe yağmayı sürdürür; teşekkürü
    // ilk sözü bitince, düğme ekrandayken söyler.
    await bekle(Math.max(0, KAPANIS.sevinc - (performance.now() - t0)));
    if (!calisiyor) return;
    asamaGec('son');
    tekrar.hidden = false;
    pop(tekrar, 300);
    secenek.bitince?.();
    void tesekkur.then(() => { if (calisiyor && sahne.isConnected) soyle('z-iyilesti'); });
  }
  /** Zıpzıp her yere inişinde: yumuşak "pat", yeni yıldızlar; bitiş ekranında yalnız seyrek yıldız */
  function inis(tur: number) {
    if (asama === 'son') { yildizYagdir(hubYildizlari, 2); konfetiYagdir(2); return; }
    ses('e-pat', 0.3, 0.8);
    if (tur % 2 === 0) ses('e-cin', 0.14, 1.1 + (tur % 6) * 0.06);
    yildizYagdir(hubYildizlari, 5); konfetiYagdir(5);
  }
  // yeniden oyna: eski oyunun dinleyicileri ve sözü kapanır, her şey baştan kurulur
  tekrar.addEventListener('click', () => { calisiyor = false; iptal.abort(); sus(); baslat(kok, yas, secenek); });

  // ——————————————————————————— kare döngüsü
  let calisiyor = true, son = performance.now(), fisSesi = 0, kopukYolu = 0, kabarcikSuresi = 0, mercekSesi = 0, sargiEgim = 0;
  function kare(an: number) {
    if (!calisiyor || !sahne.isConnected) return;
    const dt = Math.min(64, an - son); son = an;
    const t = an - asamaBasi;
    // alt sahneler (lavabo, göğüs, defter) ve pamuk yalnız görünürken çalışır
    etkinAlt()?.kare(an, dt);
    pamuk?.surukle.kare(dt); pamuk?.su.kare(dt);
    // geliş: Zıpzıp topallayarak sedyenin önüne yürür
    if (gelis && gelis.yuruyor) {
      gelis.x = Math.min(GIRIS.durak, gelis.x + GIRIS.hiz * dt * (TEST_MODU ? 40 : 1));
      gelis.topal.goster(dongudekiKare(an - gelis.basi, A1.topal.length, GIRIS.kareMs));
      gelisKonumla(-6 * Math.abs(Math.sin((an - gelis.basi) / 180)));
      if (gelis.x >= GIRIS.durak) { gelis.yuruyor = false; gelis.topal.goster(0); gelisKonumla(); gelis.kutu.classList.add('vk-sirada'); hop(kino, 14, 220); }
    }
    // sevinç dansı: sekiz kare döner; her tur başında yıldız yağar
    if (dans && dans.basi) {
      const gecen = an - dans.basi, tur = Math.floor(gecen / (A1.dans.length * 110));
      dans.dizi.goster(dongudekiKare(gecen, A1.dans.length, 110));
      if (tur > dans.tur) { dans.tur = tur; inis(tur); }
    }
    // Zıpzıp: bekleme döngüsü ve kutlama
    // yakın plandaki yüz: ifade değişince küçük bir "hop" (baş birkaç piksel oynar)
    ayyKalan = Math.max(0, ayyKalan - dt); kikirKalan = Math.max(0, kikirKalan - dt); sakaKalan = Math.max(0, sakaKalan - dt); ohKalan = Math.max(0, ohKalan - dt); pofKalan = Math.max(0, pofKalan - dt);
    const bos = an - sonDokunus > 7000;
    if (yuzY) {
      const h = tutulan;
      if (h && h.alet === 'sprey' && asama === 'sprey' && mikroplar.some((m, i) => !giden[i] && kopuk[i] > 0 && uzak(ucNoktasi(h), m) <= SPREY_MENZILI)) kikirKalan = Math.max(kikirKalan, 260);
      const y = yuzIfadesi({ asama, kilitli: !!h && h.kilit >= 0, ayyKalan, kikirKalan });
      // A1'in altı yüzü araya girer: çekilirken dişini sıkar, çıkınca "oh" der, pofta kahkaha atar, göz kırpar
      yuzY.goster(varsa(yuzKaresi(y, { asama, kilitli: !!h && h.kilit >= 0, buyutecElde: !!h && h.alet === 'buyutec', an, ohKalan, pofKalan, sakaKalan }), SECMELI.yuz[y]));
      if (y !== yuzSimdi) {
        yuzSimdi = y;
        yuzY.kutu.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${y === 'ayy' ? -10 : 6}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(y === 'ayy' ? 160 : 240), easing: 'ease-out' });
      }
    }
    if (!hub.classList.contains('vk-altta')) {
      if (asama === 'kutlama' || asama === 'son') {
        // zıplama sürerken kare ona uyar (havadayken ikinci poz)
        const zt = zipla && !TEST_MODU ? Number(zipla.currentTime ?? 0) : -1;
        zipzipY.goster(VAKA.sevinc[zt >= 0 ? ziplamaKaresi(zt) : sevincKaresi(t)]);
        if (zt >= 0) { const tur = Math.floor(zt / ZIPLAMA_MS); if (tur > ziplamaTuru) { ziplamaTuru = tur; inis(tur); } }
      } else {
        const b = beklemeKaresi(t);
        const ad = b === 'kirp' ? VAKA.uzgunKirp : VAKA.uzgun[b === 'a' ? 0 : 1];
        zipzipY.goster(b === 'kirp' ? ad : varsa(bekleEki(an, bos), ad));       // arada patisine bakar; beklerse iç çeker
      }
      if (kino) {
        const kutlama = asama === 'kutlama' || asama === 'son', sasirdi = !!kinoSasirdi && an - kinoSasirdi < 1100;
        const ad = kutlama ? SECMELI.kino.alkis[alkisKaresi(t)] : sasirdi ? SECMELI.kino.sasir : SECMELI.kino.goster;
        // A1: karşılar, göz kırpar, güler, "ups" der, düşünür; kutlamada dans eder (dans kareleri yüklendiyse) ya da "yaşasın"
        const a1 = kutlama && kinoDansVar && dans && dans.basi ? kinoDansKaresi(an - dans.basi)
          : kinoMasaKaresi({ asama, an, t, sasirdi, ups: !!kinoUps && an - kinoUps < 900, kahkaha: !!kinoKahkaha && an - kinoKahkaha < 1000, karsiliyor: asama === 'gelis', bos: bos && an % 6000 < 2600 });
        kinoY!.goster(varsa(a1, ad));
      }
    }
    const h = tutulan;
    // mikroplar mercekten kaçmaya çalışır (yalnız görüntü: bulma hesabı mikrobun asıl yerine göredir)
    let mercekte = false;
    if (asama === 'buyutec' || kacVar) {
      const mrk = h && h.alet === 'buyutec' && asama === 'buyutec' ? ucNoktasi(h) : null;
      kacVar = false;
      mikroplar.forEach((m, i) => {
        const hedef = bulunan[i] ? SIFIR : kacisHedefi(m, mrk, Z.mercekYaricapi, kac[i]);
        const k = 1 - Math.exp(-dt / (bulunan[i] ? 55 : 80));
        const x = kac[i].x + (hedef.x - kac[i].x) * k, y = kac[i].y + (hedef.y - kac[i].y) * k;
        if (Math.abs(x - kac[i].x) + Math.abs(y - kac[i].y) > 0.05) { kac[i].x = x; kac[i].y = y; mikropEl[i].style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`; }
        if (Math.abs(x) + Math.abs(y) > 0.3) kacVar = true;
        if (!bulunan[i] && bulma[i] > 0) mercekte = true;
      });
    }
    // mikropların kareleri (A1): kıpırdar; büyüteçten kaçarken ve sprey yaklaşırken korkar, köpük biriktikçe gömülür
    if (etkin === yakin && (asama === 'buyutec' || asama === 'sprey')) {
      const agiz = h && h.alet === 'sprey' ? ucNoktasi(h) : null;
      mikroplar.forEach((k, i) => {
        if (giden[i] || !mikropA1[i]) return;
        const ad = mikropKaresi(mikropNo[i], { an, kaciyor: Math.hypot(kac[i].x, kac[i].y) > 8 || (!!agiz && uzak(agiz, k) <= SPREY_MENZILI * 1.25), kopukte: kopuk[i] >= Z.ovma * 0.4 });
        if (ad !== mikropSimdi[i]) { mikropSimdi[i] = ad; mikropY[i].goster(ad); }
      });
    }
    // yakın plandaki Kino: olaya tepki sürerken o poz; diken tutulurken ya da mikrop mercekteyken şaşkın
    if (kinoYakinY) {
      if (an >= kinoTepkiSonu) kinoTepkiPozu = null;
      const poz = kinoYakinPozu({ tepki: kinoTepkiPozu, kilitli: !!h && h.kilit >= 0, mercekte });
      if (poz !== kinoSimdi) { if (!kinoTepkiPozu) hop(kinoYakinY.kutu, 10, 200); kinoSimdi = poz; }
      kinoYakinY.goster(varsa(kinoYakinKaresi(poz, an, kinoBuyuk, !!kinoTepkiPozu && kinoYakinUps), KINO_POZLARI[poz]));
    }
    if (h) {
      // alet gittiği yöne hafifçe yatar; cımbız dikeni tutarken dik durur
      const hx = (h.parmak.x - h.once.x) / Math.max(1, dt);
      h.surat = Math.hypot(h.parmak.x - h.once.x, h.parmak.y - h.once.y) / Math.max(1, dt);
      h.once = h.parmak;
      const hedef = h.kilit >= 0 ? 0 : Math.max(-8, Math.min(8, hx * 9)), once = h.egim;
      h.egim += (hedef - h.egim) * Math.min(1, dt / 90);
      if (h.kilit < 0 && Math.abs(h.egim - once) > 0.01) ucaCiz(h, ucNoktasi(h), false);
    }
    if (h && h.alet !== 'bant') {
      const uc = ucNoktasi(h);
      if (h.alet === 'buyutec') mercekCiz(uc, an);
      if (h.alet === 'buyutec' && asama === 'buyutec') {
        mikroplar.forEach((m, i) => {
          if (bulunan[i]) return;
          const once = bulma[i];
          bulma[i] = bulmaAdimi(bulma[i], uzak(uc, m), Z.mercekYaricapi, dt);
          // mercek mikrobun üstüne ilk geldiği an: kısa bir "vuu" (dokunuşa anında karşılık)
          if (once === 0 && bulma[i] > 0 && an - mercekSesi > 500) { ses('e-vuu', 0.45, 1.5); mercekSesi = an; }
          if (bulma[i] >= BULMA_MS) mikropBulundu(i);
        });
      } else if (h.alet === 'sprey' && asama === 'sprey') {
        // Köpükle ovma: sprey parmağı izler; köpük ağzın önüne, parmağın geçtiği yola birikir, altındaki çamur
        // gerçekten silinir. Mikrop, yakınında ne kadar ovulduysa o kadar köpüğe gömülür.
        const yol = Math.min(80, h.surat * dt), dusen = { x: uc.x - 30, y: uc.y + 30 };
        let en = -1, enUzak = Infinity;
        mikroplar.forEach((m, i) => { const u = uzak(dusen, m); if (!giden[i] && u < enUzak) { en = i; enUzak = u; } });
        fisSesi -= dt; kabarcikSuresi -= dt; kopukYolu += yol + dt * 0.1;
        if (fisSesi <= 0) {
          // pompa: "fış" ve başlığın küçük geri tepmesi (hızlı ovarken daha sık)
          ses('e-fis', 0.75, 0.95 + Math.random() * 0.12); fisSesi = h.surat > 0.25 ? 230 : 330;
          for (const c of h.kutu.children) c.animate([{ translate: '0 0' }, { translate: '3px -5px', offset: 0.3 }, { translate: '0 0' }], { duration: sure(140), easing: 'ease-out' });
          if (SPREY_BASILI) { const k = h.kutu; k.classList.add('vk-kapali'); setTimeout(() => k.classList.remove('vk-kapali'), sure(110)); }
          if (fiskirma) kareOynat(fiskirma, 150);
        }
        if (kopukYolu >= KOPUK_ARALIGI) {
          kopukYolu = 0;
          const q = { x: dusen.x + (Math.random() - 0.5) * 70, y: dusen.y + (Math.random() - 0.5) * 60 };
          kopukKoy(q, 110 + Math.random() * 80);
          if (!pamuk) camurSil(q, 150, 260);
        }
        if (kabarcikSuresi <= 0 && kopukTuvali.miktar(dusen, 150) >= 2) { kabarcikSuresi = 220 + Math.random() * 220; kabarcik({ x: dusen.x + (Math.random() - 0.5) * 120, y: dusen.y + (Math.random() - 0.5) * 80 }); }
        if (en >= 0 && enUzak <= SPREY_MENZILI) {
          kopuk[en] = ovmaAdimi(kopuk[en], enUzak, yol, dt, Z.ovma);
          mikropEl.forEach((x, k) => x.classList.toggle('vk-titriyor', k === en));
          if (kopuk[en] >= Z.ovma) void mikropGitti(en);
        } else mikropEl.forEach(m => m.classList.remove('vk-titriyor'));
      } else if (h.alet === 'cimbiz' && asama === 'cimbiz') {
        if (h.tasinan >= 0) {
          const d = dikenler[h.tasinan];
          const r = (d.aci * Math.PI) / 180;
          // çıkan diken yay gibi bir iki kez titreyip durulur (ucu cımbızın ağzında kalır)
          const yay = dikenYayi(an - h.cikisAni - (dikenKareY ? KOPMA_KARE_MS * 2 : 0));          // "pıt" kareleri bitince cımbızın ucunda belirir
          dikenEl[h.tasinan].style.transform = `translate(${uc.x - d.x - Math.cos(r) * DIKEN_BOYU * yay}px, ${uc.y - d.y - Math.sin(r) * DIKEN_BOYU * yay}px) rotate(${d.aci}deg) scaleX(${yay.toFixed(3)})`;
          if (tepsideMi(uc)) void tepsiyeBirak(h, h.tasinan, false);
        } else if (h.kilit >= 0) {
          const d = dikenler[h.kilit];
          const c = dikenCekisi(d, dikenUcu(d), uc);
          const r = (d.aci * Math.PI) / 180;
          // değince minik bir titreşim; çekildikçe diken direnir, titreşim artar (cımbız dikenin ucuyla birlikte oynar)
          const guc = Math.max(0, 1 - (an - h.kilitAni) / 180) + 0.8 * Math.min(1, c.cekis / DIKEN_ESIGI);
          // diken önce gerilir (uzar), sonra "pıt" diye çıkar
          const gerilme = dikenGerilmesi(c.cekis), uzama = c.kayma + DIKEN_BOYU * (gerilme - 1);
          const sapma = Math.sin(an / 9) * guc * 2.6, kol = (DIKEN_BOYU + uzama) * ((sapma * Math.PI) / 180), tutus = dikenUcu(d, uzama);
          dikenEl[h.kilit].style.transform = `translate(${Math.cos(r) * c.kayma}px, ${Math.sin(r) * c.kayma}px) rotate(${(d.aci + sapma).toFixed(2)}deg) scaleX(${gerilme.toFixed(3)})`;
          ucaCiz(h, { x: tutus.x - Math.sin(r) * kol, y: tutus.y + Math.cos(r) * kol });
          if (dikenKareY) {
            // A1: tüy çadır gibi kalkar; karedeki diken, ucu cımbızın tuttuğu yere gelecek kadar uzar
            const kn = gerginKaresi(c.cekis, DIKEN_ESIGI), y = dikenKareY[h.kilit];
            y.goster(A1.dikenGergin[kn]); y.kutu.classList.remove('vk-gizli'); dikenEl[h.kilit].classList.add('vk-gizli');
            y.kutu.style.transform = `rotate(${(d.aci + sapma).toFixed(2)}deg) scaleX(${((DIKEN_BOYU + uzama) / ((DIKEN_BOYU * GERGIN_BOY[kn]) / 200)).toFixed(3)})`;
          }
          if (c.cikti) {
            cikan[h.kilit] = true; h.tasinan = h.kilit; h.kilit = -1; h.cikisAni = an;
            dikenKoptu(h.tasinan);
            ses('e-pit');
            // çıkarken kısa bir "ay!"; sonuncusunda "hop!" (ardından "hiç acımadı" gelir)
            soyle(cikan.every(Boolean) ? 'z-oh-1' : tepsideki % 2 ? 'z-ayy-1' : 'z-ayy-0');
            ayyKalan = AYY_MS; ohKalan = AYY_MS + 800;        // "ay!"ın ardından rahat bir nefes
            parilti({ x: d.x, y: d.y }, 150);
            kinoTepki('sevin', 600);
          } else if (uzak(uc, dikenUcu(d)) > 260) { dikenSal(h.kilit); h.kilit = -1; cimbizGoster(h, false); }
        } else {
          // dikene yaklaşınca cımbız yarı kapanır (A1)
          if (CIMBIZ_YARI) h.kutu.classList.toggle('vk-yari', dikenler.some((d, k) => !cikan[k] && uzak(uc, dikenUcu(d)) <= Z.cimbizKilidi * 2.4));
          const i = dikenler.findIndex((d, k) => !cikan[k] && uzak(uc, dikenUcu(d)) <= Z.cimbizKilidi);
          if (i >= 0) {
            h.kilit = i; h.kilitAni = an; cimbizGoster(h, true); ses('e-kilit');
            try { navigator.vibrate?.(15); } catch { /* titreşim yoksa yalnız görüntü */ }
          }
        }
      } else if (h.alet === 'sargi' && asama === 'sargi') {
        const once = sargiDurumu.toplam;
        sargiDurumu = sargiAdimi(sargiDurumu, uc);
        const oran = sargiOrani(sargiDurumu.toplam, Z.sargiTuru);
        // rulo kolun üstünde mi altında mı: açılan ucun kenarı o yana yatar; bez rulodan kola uzanır; rulo açıldıkça incelir
        const ustte = uc.y < YAKIN.sargi.y;
        sargiEgim += ((ustte ? SARGI_EGIMI : -SARGI_EGIMI) - sargiEgim) * Math.min(1, dt / 110);
        const kenarX = sargiGoster(oran, sargiEgim);
        // rulo açıldıkça incelir: A1 kareleri varsa onlarla, yoksa küçülerek
        if (h.kutu.querySelector('.vk-kare')) { const kareNo = ruloKaresi(oran); [...h.kutu.children].forEach((c, i) => c.classList.toggle('vk-gorunur', i === kareNo)); }
        else h.olcek = ELDE_OLCEK * (1 - 0.2 * oran);
        {
          const bas = { x: kenarX + (ustte ? sargiEgim : -sargiEgim) * 0.6, y: ustte ? SARGI_KOL.ust + 14 : SARGI_KOL.alt - 14 };
          const boy = Math.hypot(uc.x - bas.x, uc.y - bas.y), aci = Math.atan2(uc.y - bas.y, uc.x - bas.x);
          sargiBez.hidden = oran >= 1 || boy < 30;
          sargiBez.style.width = boy.toFixed(1) + 'px';
          sargiBez.style.transform = `translate3d(${bas.x.toFixed(1)}px, ${(bas.y - 32).toFixed(1)}px, 0) rotate(${aci.toFixed(4)}rad)`;
        }
        // kumaş hışırtısı sarma hareketini izler: beşte bir turda bir, hızlı sarınca daha tiz
        if (Math.floor(sargiDurumu.toplam * 5) > Math.floor(once * 5) && an - sargiSesi > 105) { ses('e-his', 0.8, 0.9 + Math.min(0.45, h.surat * 0.22) + Math.random() * 0.08); sargiSesi = an; }
        if (Math.floor(sargiDurumu.toplam * 3) > Math.floor(once * 3) && oran < 1) { parilti({ x: kenarX, y: YAKIN.sargi.y + (Math.random() - 0.5) * 150 }, 110); hop(kinoYakinY?.kutu, 8, 180); }
        if (oran >= 1) {
          ses('e-tik', 1, 1.4);
          soyle('z-yumusak');
          parilti({ x: YAKIN.sargi.sag, y: YAKIN.sargi.y }, 200);
          kinoTepki('sevin', 800, 24);
          birak(h);
          asamaGec('bant');
          if (ACIK.defter) void altHazirla('defter');
          void dansHazirla();
          dokAletleri.forEach(b => { b.hidden = true; });
          dokBantlari.forEach((b, i) => setTimeout(() => { b.hidden = false; pop(b); ses('e-tik', 0.7, 1.1 + i * 0.1); }, sure(120 + i * 90)));
        }
      }
    } else if (asama === 'sprey') mikropEl.forEach(m => m.classList.remove('vk-titriyor'));
    if (!h || h.alet !== 'sargi') { if (!sargiBez.hidden) sargiBez.hidden = true; }
    requestAnimationFrame(kare);
  }

  // Oyun, sahnedeki bütün çizimler çözülüp ilk kare çizildikten sonra başlar: ilk görünen kare tam yüklü sahnedir,
  // Zıpzıp'ın ilk sözü de o kareyle birlikte gelir.
  // İki görünüm de (masa ve yakın plan) baştan çizdirilir: geçişte ve büyüteç ele alınınca takılma olmaz. Bu sırada
  // sahne görünmez sayılacak kadar saydamdır (tam saydam katmanı tarayıcı çizmez); ekranda zeminin rengi durur.
  asamaGec('giris');
  const dur = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
  let gorunduAni = 0; // sahnenin göründüğü an (video kaydında ses ile görüntüyü eşlemek için okunur)
  sahne.style.opacity = '0.01';
  yakin.classList.remove('vk-altta');
  if (gelis) { zipzip.classList.add('vk-gizli'); gelisKonumla(); }
  void Promise.all([...sahne.querySelectorAll('img')].map(r => r.decode().catch(() => undefined)))
    .then(() => dur(TEST_MODU ? 30 : 240))
    .then(() => { yakin.classList.add('vk-altta'); yakin.classList.add('vk-uykuda'); return dur(TEST_MODU ? 30 : 200); })
    .then(() => { sahne.style.opacity = ''; gorunduAni = Date.now(); return new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))); })
    .then(() => {
      if (!calisiyor) return;
      kok.dataset.durum = 'hazir';
      if (!gelis) { if (!lavaboBitti) void altHazirla('lavabo'); else if (!gogusBitti) void altHazirla('gogus'); }     // geliş varsa ilk istasyon, geliş kareleri bırakıldıktan sonra kurulur (bellek)
      if (gelis) {
        // Zıpzıp topallayarak gelir; Kino karşılar
        asamaGec('gelis');
        gelis.yuruyor = true; gelis.basi = performance.now();
        setTimeout(() => soyle('z-topal'), sure(300));
        kinoSasirdi = performance.now();
      } else {
        setTimeout(() => soyle('z-ay'), sure(350));
        // ilk saniyede ne yapılacağı belli: çanta sallanır, Kino zıplayıp onu gösterir
        setTimeout(() => { if (calisiyor && asama === 'giris') { salla(canta); hop(kino, 16); ses('e-tik', 0.5, 1.2); } }, sure(260));
      }
      requestAnimationFrame(t => { son = t; requestAnimationFrame(kare); });
    });

  // Test ve video kaydı için okuma (oyunun işleyişini değiştirmez): ?test ya da ?kayit ile.
  if (TEST_MODU || sorgu.has('kayit')) {
    (window as unknown as { __vaka: unknown }).__vaka = {
      asama: () => asama,
      gorunduAni: () => gorunduAni,
      uc: () => (tutulan ? ekrana(ucNoktasi(tutulan)) : null),
      nokta: (ad: string, i = 0): Nokta | null => {
        const m = (e: Element) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
        if (ad === 'canta') return m(canta);
        if (ad === 'pati') return ekrana({ x: HUB.pati.x - 60, y: HUB.pati.y });
        if (ad === 'alet') return m(dokAletleri.get(ALET_SIRASI[i])!);
        if (ad === 'bant') return m(dokBantlari[i]);
        if (ad === 'mikrop') return mikroplar[i] ? ekrana(mikroplar[i]) : null;
        if (ad === 'diken') return dikenler[i] && !cikan[i] ? ekrana(dikenUcu(dikenler[i])) : null;
        if (ad === 'diken-yon') return dikenler[i] ? ekrana(dikenUcu(dikenler[i], 260)) : null;
        if (ad === 'tepsi') return ekrana({ x: YAKIN.tepsi.sol + YAKIN.tepsi.g / 2, y: YAKIN.tepsi.ust + YAKIN.tepsi.y / 2 });
        if (ad === 'sargi') return ekrana(YAKIN.sargi);
        if (ad === 'tekrar') return m(tekrar);
        if (ad === 'lavabo-dugmesi') return m(lavaboDugmesi);
        if (ad === 'gogus-dugmesi') return m(gogusDugmesi);
        if (ad === 'gelis') return gelis ? m(gelis.kutu) : null;
        if (ad === 'kase') return ekrana(PAMUK.kaseAgzi);
        if (ad === 'pamuk') return pamuk ? ekrana(pamuk.surukle.merkez) : null;
        if (ad === 'pamuk-hucre') return ekrana({ x: PAMUK.alan.sol + ((i % PAMUK.sutun) + 0.5) * (PAMUK.alan.g / PAMUK.sutun), y: PAMUK.alan.ust + (Math.floor(i / PAMUK.sutun) + 0.5) * (PAMUK.alan.y / PAMUK.satir) });
        return null;
      },
      /** Paket Doktor-A1 aşamalarından hangileri açık */
      acik: () => ({ ...ACIK }),
      // ikinci geçişin (A1) kareleri: hangileri bağlı, hangileri o anda görünüyor
      kareler: () => ({
        mikrop: mikropA1.filter(Boolean).length, pof: POF.length, diken: !!dikenKareY, iz: dikenIzleri.filter(r => !r.classList.contains('vk-gizli')).length,
        yuz: A1_YUZLER.length, kinoMasa: A1_KINO_MASA.length, kinoYakin: A1_KINO_YAKIN.length, bekle: A1_BEKLE.length, parilti: PARILTI_VAR, konfeti: KONFETI.length >= 3,
        bantKagit: BANT_KAGIT, bantDuz: !!bantDuzEl && !bantDuzEl.hidden, kuyruk: secmeliVar(A1.yildizKuyruk), kinoDans: kinoDansVar,
      }),
      /** alt sahnenin (lavabo, gogus, defter) bir noktası, ekran pikseli */
      alt: (sahneAdi: A1SahneAdi, ad: string, i = 0): Nokta | null => { const p = alt[sahneAdi]?.sahne.nokta(ad, i); return p ? ekrana(p) : null; },
      altSayim: (sahneAdi: A1SahneAdi) => alt[sahneAdi]?.sahne.sayim() ?? null,
      /** şu an kurulu sahneler (bellek: aynı anda en çok biri) */
      kurulu: () => Object.keys(alt),
      durum: () => ({ bant: bantDuzle ? bantDuzle.kalan : 0, damla: pamuk ? pamuk.su.damlaSayisi : 0, gelis: gelis ? { yuruyor: gelis.yuruyor, zip: gelis.zipSayisi } : null, pamuk: pamuk ? { islak: pamuk.durum.islak, kir: pamukKiri(pamuk.durum.sildigi), oran: pamukOrani(pamuk.durum.silinen), hedef: PAMUK_HEDEF[yas] } : null, dans: !!dans && dans.basi > 0, odul: odulKaydi }),
      sayim: () => ({ mikrop: mikroplar.length, diken: dikenler.length, bulunan: bulunan.filter(Boolean).length, giden: giden.filter(Boolean).length, cikan: cikan.filter(Boolean).length, sargi: sargiOrani(sargiDurumu.toplam, Z.sargiTuru), bant: secilenBant }),
      olcek: () => S,
    };
  }
}
