// Minik Doktor · bekleme odası ve klinik akışı (Doktor-K1; senaryo veri.ts başında). Altı vakayı tek oyuna bağlar:
// bekleme odası → seçilen hasta kalkıp kapıdan içeri yürür → vakası oynanır → iyileşen hasta mutlu çıkar, çıkartması panoya uçar
// → pano dolunca kutlama. Vakalar kendi sözleşmeleriyle çağrılır: baslat(kok, yas, { bitince }). Vaka sırasında geri düğmesi
// ana menüye değil bekleme odasına döner.
// Çizimler Astra'dan (Paket Doktor-K1, assets/doktor/klinik/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
import '../vaka/vaka.css';
import './klinik.css';
import { TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { anaMenuyeDon } from '../../../src/uygulama';
import { efekt, konus, sesleriYukle, sus } from '../ses';
import { kenarUzat, yildizEtkisi } from '../vaka/etki';
import { cevirUyarisi } from '../vaka/sahne';
import { SAHNE, type Kutu, type Nokta, type Yas } from '../vaka/veri';
import { ORTAK } from '../vaka-kit/ortak';
import {
  AD, DERT_SESI, DONGU, EFEKTLER, ESIK, HASTALAR, HASTA_TUVAL, KAPI, KAYIT_ANAHTARI, KINO_KUTU, KLINIK, KLINIK_DOSYALAR, KOLTUKLAR, PANO_YUVALARI,
  CIKARTMA_BOYU, SOZLER, SURE, VAKASI, adimAtildi, bekleKaresi, dokunmaKutusu, gelSozu, hastaDurumu, iyilestir, kayitOku, kayitYaz, mutluKaresi,
  panoDolu, secilebilir, sira, yuruKaresi, yuruNoktasi, yuruSuresi, KAPIDAN_DALIS, VAKALAR, VAKA_HASTASI, odadakiVaka, vakaKareleri, BUYUME, odaOlcegi,
  type HastaAdi, type HastaDurumu, type Kayit, type Koltuk, type SozAdi, type VakaAdi, type VakaOyunu,
} from './veri';

const klinikDosyalari = import.meta.glob<string>('../../../assets/doktor/klinik/*.webp', { eager: true, query: '?url', import: 'default' });
const vakaDosyalari = import.meta.glob<string>('../../../assets/doktor/vaka/*.webp', { eager: true, query: '?url', import: 'default' });
const sorgu = new URLSearchParams(location.search);
/** Yalnız geliştirme sunucusunda: çizimler gelmeden akışı denemek için geçici klasörden okur (uygulamaya girmez). */
const TASLAK = import.meta.env.DEV && sorgu.has('taslak');
const gercek = (ad: string): string | undefined => klinikDosyalari[`../../../assets/doktor/klinik/${ad}.webp`] ?? vakaDosyalari[`../../../assets/doktor/vaka/${ad}.webp`];
// gerçek çizim varsa o; geliştirmede (?taslak) eksik olanın yerine geçici çizim
const adres = (ad: string): string | undefined => gercek(ad) ?? (TASLAK && KLINIK_DOSYALAR.includes(ad) ? `/output/doktor/klinik-taslak/${ad}.png` : undefined);
const ETKI_CIZIMLERI = [ORTAK.yildiz, ORTAK.pof[1]];
export const eksikCizimler = (): string[] => [...(TASLAK ? [] : KLINIK_DOSYALAR), ...ETKI_CIZIMLERI].filter(ad => !gercek(ad));

interface VakaModulu { baslat: (kok: HTMLElement, yas: Yas, secenek?: { bitince?: () => void }) => void; eksikCizimler: () => string[]; }
const MODUL: Readonly<Record<VakaOyunu, () => Promise<VakaModulu>>> = {
  // Mino'nun dişleri: Harf'ın dokuz adımlı yeni Y2'si (vaka-dis/, ?oyun=disler); eski dis/ çizim almayacak
  vaka: () => import('../vaka/sahne'), disler: () => import('../vaka-dis/sahne'), ates: () => import('../vaka-ates/sahne'),
  boya: () => import('../vaka-boya/sahne'), hapsu: () => import('../vaka-hapsu/sahne'), kanat: () => import('../vaka-kanat/sahne'),
  karin: () => import('../vaka-karin/sahne'), kuzu: () => import('../vaka-kuzu/sahne'), bocek: () => import('../vaka-bocek/sahne'), cingirak: () => import('../vaka-cingirak/sahne'),
};

const el = <K extends keyof HTMLElementTagNameMap>(etiket: K, sinif: string): HTMLElementTagNameMap[K] => { const e = document.createElement(etiket); e.className = sinif; return e; };
const koy = (e: HTMLElement, k: Kutu) => { Object.assign(e.style, { left: k.sol + 'px', top: k.ust + 'px', width: k.g + 'px', height: k.y + 'px' }); };
const ortala = (e: HTMLElement, p: Nokta, g: number, y: number) => koy(e, { sol: p.x - g / 2, ust: p.y - y / 2, g, y });
const sure = (ms: number) => (TEST_MODU ? 1 : ms);
const bekle = (ms: number) => new Promise<void>(r => setTimeout(r, TEST_MODU ? Math.min(ms, 30) : ms));
const pop = (e: HTMLElement, ms = 220) => e.animate([{ transform: 'scale(.6)' }, { transform: 'scale(1.14)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: sure(ms), easing: 'ease-out', composite: 'add' });
const hop = (e: HTMLElement | null | undefined, px = 20, ms = 260) => { e?.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-px}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(ms), easing: 'ease-out', composite: 'add' }); };
const kaydet = (k: Kayit) => { try { localStorage.setItem(KAYIT_ANAHTARI, kayitYaz(k)); } catch { /* özel pencere: oyun kayıtsız sürer */ } };
const kayitAl = (): Kayit => { try { return kayitOku(localStorage.getItem(KAYIT_ANAHTARI)); } catch { return kayitOku(null); } };

type Asama = 'yukleniyor' | 'bekleme' | 'cagri' | 'vaka' | 'donus' | 'kutlama' | 'doldu';

export function baslat(kok: HTMLElement, yas: Yas): void {
  kok.replaceChildren();
  kok.dataset.oyun = 'klinik';
  delete kok.dataset.asama; delete kok.dataset.klinik;
  cevirUyarisi(kok);
  const geri = el('button', 'vk-geri'); geri.type = 'button'; geri.setAttribute('aria-label', 'Geri'); geri.innerHTML = IKON.geri;
  geri.addEventListener('click', () => anaMenuyeDon());
  kok.append(geri);
  const eksik = eksikCizimler();
  if (eksik.length) { kok.dataset.durum = 'eksik'; kok.dataset.eksik = String(eksik.length); console.info(`Bekleme odası: ${eksik.length} çizim bekleniyor:`, eksik.join(', ')); return; }
  kok.dataset.durum = 'yukleniyor';
  const adlar = [...KLINIK_DOSYALAR, ...ETKI_CIZIMLERI];
  const resimler = adlar.map(ad => { const r = new Image(); r.src = adres(ad)!; return r.decode().catch(() => undefined).then(() => r); });
  // çizimi gelmiş vakalar (gelmemiş vaka sırada görünmez); modüller vakayı başlatmak için de hazır kalır
  const moduller = Promise.all(VAKALAR.map(v => MODUL[VAKASI[v]]().then(m => [v, m] as const, () => null)));
  void Promise.all([Promise.all(resimler), moduller, sesleriYukle([...Object.keys(SOZLER), ...EFEKTLER, ...Object.values(DERT_SESI), 'e-cin', 'e-tik', 'e-pof', 'e-vuu'])])
    .then(([r, m]) => {
      const acik = new Map<VakaAdi, VakaModulu>();
      for (const x of m) if (x && x[1].eksikCizimler().length === 0) acik.set(x[0], x[1]);
      kur(kok, yas, geri, new Map(adlar.map((ad, i) => [ad, r[i]])), acik);
    });
}

function kur(kok: HTMLElement, yas: Yas, geri: HTMLButtonElement, cozulmus: Map<string, HTMLImageElement>, moduller: Map<VakaAdi, VakaModulu>) {
  const acik = VAKALAR.filter(v => moduller.has(v));
  /** bekleme odasında hep yedi hasta oturur (vakası henüz oynanamayan da derdiyle bekler; oda hep dolu ve canlı) */
  const odadakiler = [...HASTALAR];
  let kayit = kayitAl();
  /** hastanın şimdiki vakası ve onun kareleri (Bulut'un ikinci vakasında böcekli kareler) */
  const simdiki = (h: HastaAdi): VakaAdi => odadakiVaka(h, acik, kayit.iyilesen);
  const kk = (h: HastaAdi) => vakaKareleri(simdiki(h));
  const resim = (ad: string, sinif = ''): HTMLImageElement => { const r = el('img', sinif); r.src = adres(ad) ?? ''; r.alt = ''; r.draggable = false; r.decoding = 'sync'; return r; };
  const yigin = (adlar: readonly string[], sinif: string) => {
    const kutu = el('div', sinif + ' vk-yigin');
    const kareler = new Map(adlar.map(ad => [ad, resim(ad)] as const));
    kutu.append(...kareler.values());
    let simdi = '';
    const goster = (ad: string) => { if (ad === simdi || !kareler.has(ad)) return; kareler.get(simdi)?.classList.remove('vk-gorunur'); kareler.get(ad)!.classList.add('vk-gorunur'); simdi = ad; };
    goster(adlar[0]);
    return { kutu, goster, simdi: () => simdi };
  };

  const sahne = el('div', 'vk-sahne kl-sahne');
  const perde = el('div', 'kl-perde');
  let S = 1;
  const tasma = { yan: 0, dik: 0 };
  const boyutla = () => {
    const o = odaOlcegi(kok.clientWidth || innerWidth, kok.clientHeight || innerHeight);
    S = o.s;
    sahne.style.transform = `translate(${o.sol}px, ${o.ust}px) scale(${o.s})`;
    tasma.yan = o.sol / o.s; tasma.dik = o.ust / o.s;
    sahne.style.setProperty('--ty', tasma.yan.toFixed(1) + 'px'); sahne.style.setProperty('--td', tasma.dik.toFixed(1) + 'px');
  };
  addEventListener('resize', () => { if (sahne.isConnected) boyutla(); });
  // iPad'de oda kenarlardan taşar (kamera): kök kaydırılabilir olmasın (odak ya da dokunuş kökü kaydırıp her şeyi yana itmesin)
  kok.addEventListener('scroll', () => { if (kok.scrollLeft || kok.scrollTop) { kok.scrollLeft = 0; kok.scrollTop = 0; } });
  const noktaya = (e: PointerEvent): Nokta => { const r = sahne.getBoundingClientRect(); return { x: (e.clientX - r.left) / S, y: (e.clientY - r.top) / S }; };
  const ekrana = (p: Nokta): Nokta => { const r = sahne.getBoundingClientRect(); return { x: r.left + p.x * S, y: r.top + p.y * S }; };
  const ses = (ad: string, kazanc = 1, hiz = 1) => efekt(ad, kazanc, hiz);
  const soyle = (ad: SozAdi) => void konus(ad);

  // ——————————————————————————— oda
  const oda = el('div', 'vk-gorunum kl-oda');
  const fon = resim(KLINIK.fon, 'vk-fon');
  const kapi = resim(KLINIK.kapiAcik, 'vk-katman kl-kapi'); koy(kapi, KAPI);
  /** kapıdan dalışta açık kapıdan taşan sıcak ışık (CSS) */
  const kapiIsigi = el('div', 'vk-katman kl-kapi-isigi'); koy(kapiIsigi, { sol: KAPI.sol + KAPI.g / 2 - KAPI.g * 1.7, ust: KAPI.ust + KAPI.y * 0.55 - KAPI.y * 1.5, g: KAPI.g * 3.4, y: KAPI.y * 3 });
  oda.style.transformOrigin = `${KAPI.sol + KAPI.g / 2}px ${KAPI.ust + KAPI.y * 0.55}px`;
  const pano = el('div', 'vk-katman kl-pano'); koy(pano, { sol: 0, ust: 0, g: SAHNE.g, y: SAHNE.y });
  const cikartmalar = new Map(VAKALAR.map(v => { const r = resim(KLINIK.cikartma[v], 'vk-katman kl-cikartma'); ortala(r, PANO_YUVALARI[v], CIKARTMA_BOYU, CIKARTMA_BOYU); r.dataset.vaka = v; pano.append(r); return [v, r] as const; }));
  const kinoY = yigin([...KLINIK.kino.bekle, KLINIK.kino.goster, KLINIK.kino.sevin], 'vk-katman kl-kino'); koy(kinoY.kutu, KINO_KUTU);
  const etkiKati = el('div', 'vk-katman kl-etki');
  const yildizlar = yildizEtkisi(() => resim(ORTAK.yildiz, 'vk-katman vk-yildiz-p'), sure, tasma);
  const yildizHavuzu = yildizlar.havuz(etkiKati, 46);
  const konfetiKati = el('div', 'vk-katman kl-konfeti');

  interface Hasta { ad: HastaAdi; kutu: HTMLDivElement; y: ReturnType<typeof yigin>; halka: HTMLDivElement; dugme: HTMLButtonElement; yer: Koltuk; tepki: { ad: string; son: number } | null; /** çağrılıp yürürken: boşta döngü karesini değiştirmez */ mesgul: boolean; /** yürüyüş kareleri bir yöne bakar; öbür yöne yürürken aynalanır */ ayna: boolean; }
  const hastalar = new Map<HastaAdi, Hasta>();
  for (const h of odadakiler) {
    const kutu = el('div', 'vk-katman kl-hasta'); kutu.dataset.hasta = h;
    kutu.style.width = HASTA_TUVAL[0] + 'px'; kutu.style.height = HASTA_TUVAL[1] + 'px';
    const halka = el('div', 'kl-halka');
    const adlar = [...new Set(VAKALAR.filter(v => VAKA_HASTASI[v] === h).flatMap(v => { const c = vakaKareleri(v); return [...c.bekle, c.sec, ...c.kalk, ...c.yuru, ...c.cik, ...c.mutlu]; }))];
    const y = yigin(adlar, 'kl-hasta-resmi');
    y.goster(kk(h).bekle[0]);
    kutu.append(halka, y.kutu);
    const dugme = el('button', 'vk-katman kl-hasta-dugme'); dugme.type = 'button'; dugme.dataset.hasta = h; dugme.setAttribute('aria-label', AD[h]);
    koy(dugme, dokunmaKutusu(KOLTUKLAR[h]));
    hastalar.set(h, { ad: h, kutu, y, halka, dugme, yer: KOLTUKLAR[h], tepki: null, mesgul: false, ayna: false });
  }
  const yerlestir = (x: Hasta, k: Koltuk) => {
    x.yer = k;
    x.kutu.style.transform = `translate3d(${(k.ayak.x - HASTA_TUVAL[0] / 2).toFixed(1)}px, ${(k.ayak.y - HASTA_TUVAL[1]).toFixed(1)}px, 0) scale(${(k.olcek * BUYUME * (x.ayna ? -1 : 1)).toFixed(3)}, ${(k.olcek * BUYUME).toFixed(3)})`;
    x.kutu.style.zIndex = String(Math.round(k.ayak.y));
  };
  for (const x of hastalar.values()) yerlestir(x, KOLTUKLAR[x.ad]);
  // arka sıra önce, ön sıra sonra; Kino ve kapı arasında (yürüyen hasta z-index ile öne geçer)
  const sirali = [...hastalar.values()].sort((a, b) => a.yer.ayak.y - b.yer.ayak.y);
  oda.append(fon, pano, kapi, kinoY.kutu, kapiIsigi, ...sirali.map(x => x.kutu), ...sirali.map(x => x.dugme), etkiKati, konfetiKati);
  kenarUzat(oda, [[cozulmus.get(KLINIK.fon), { sol: 0, ust: 0, g: SAHNE.g, y: SAHNE.y }]]);
  // alt bant: fonun son satırı uzatılınca minderler dikey çizgi gibi uzuyor; yerin düz rengiyle doldurulur
  // üst bant da: yakın kadrajda pano fonun üst kenarına değiyor, uzatılınca koyu bir şerit oluyordu; duvarın düz rengiyle doldurulur
  { const fonR = cozulmus.get(KLINIK.fon);
    for (const [sinif, x, y] of [['.vk-t-alt', 0.03, 0.995], ['.vk-t-ust', 0.03, 0.01]] as const) {
      const bant = oda.querySelector<HTMLCanvasElement>(sinif);
      if (!fonR?.naturalWidth || !bant) continue;
      const o = document.createElement('canvas'); o.width = o.height = 1; const c = o.getContext('2d')!;
      c.drawImage(fonR, Math.round(fonR.naturalWidth * x), Math.round(fonR.naturalHeight * y), 1, 1, 0, 0, 1, 1);
      const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
      const a2 = bant.getContext('2d')!; a2.fillStyle = `rgb(${r},${g},${b})`; a2.fillRect(0, 0, bant.width, bant.height);
     }
    // yan bantlar: fonun en kenar sütunu dolabın ve kitaplığın siyah dış çizgisi; uzatılınca kara şerit oluyordu, biraz içeriden alınır
    for (const [sinif, x] of [['.vk-t-sol', 14], ['.vk-t-sag', SAHNE.g - 15]] as const) {
      const bant = oda.querySelector<HTMLCanvasElement>(sinif);
      if (!fonR?.naturalWidth || !bant) continue;
      const g2 = bant.getContext('2d')!; g2.clearRect(0, 0, bant.width, bant.height);
      g2.drawImage(fonR, Math.round((x / SAHNE.g) * fonR.naturalWidth), 0, 1, fonR.naturalHeight, 0, 0, 1, SAHNE.y);
    } }
  sahne.append(oda);
  kok.append(sahne, perde);
  boyutla();

  // ——————————————————————————— durum
  let asama: Asama = 'yukleniyor', calisiyor = true, aktif: VakaAdi | null = null, vakaTuru = 0;
  let kinoTepki: { ad: string; son: number } | null = null, sonSabir = -1e9, sonrakiKendi = performance.now() + 2600;
  const durum = (h: HastaAdi): HastaDurumu => hastaDurumu(h, acik, kayit.iyilesen);
  const asamaGec = (a: Asama) => { asama = a; kok.dataset.asama = a; siraGoster(); };
  function siraGoster() {
    const s = sira(acik, kayit.iyilesen), secim = asama === 'bekleme' || asama === 'doldu';
    for (const x of hastalar.values()) {
      const d = durum(x.ad);
      x.dugme.dataset.durum = d;
      const sirada = secim && s.includes(simdiki(x.ad));
      x.kutu.classList.toggle('kl-sirada', sirada);
      x.dugme.classList.toggle('kl-sirada', sirada);
    }
    for (const [h, r] of cikartmalar) r.classList.toggle('kl-asili', kayit.iyilesen.includes(h));
    kok.dataset.iyilesen = String(kayit.iyilesen.length);
  }
  const parilti = (p: Nokta, boy = 190) => {
    const r = resim(ORTAK.pof[1], 'vk-katman vk-pof'); ortala(r, p, boy, boy); etkiKati.append(r);
    void r.animate([{ transform: 'scale(.5)', opacity: 1 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: sure(380), easing: 'ease-out' }).finished.then(() => r.remove(), () => r.remove());
  };
  const kinoyaTepki = (ad: string, ms = 900, px = 20) => { kinoTepki = { ad, son: performance.now() + ms }; hop(kinoY.kutu, px); };
  const tepki = (x: Hasta, ad: string, ms: number) => { x.tepki = { ad, son: performance.now() + ms }; };
  const govde = (x: Hasta): Nokta => ({ x: x.yer.ayak.x, y: x.yer.ayak.y - HASTA_TUVAL[1] * x.yer.olcek * BUYUME * 0.55 });
  /** derdinin vurgusu: hapşırık, damla, kıkırdama… (kendiliğinden ya da dokununca) */
  function dert(x: Hasta, kazanc = 1) {
    tepki(x, kk(x.ad).bekle[DONGU[x.ad].vurgu], 520);
    ses(DERT_SESI[simdiki(x.ad)], kazanc);
    hop(x.y.kutu, 12, 240);
  }
  const siradakileriGoster = () => { for (const v of sira(acik, kayit.iyilesen)) { const x = hastalar.get(VAKA_HASTASI[v]); if (x) { hop(x.y.kutu, 24, 300); pop(x.halka, 320); } } };

  // ——————————————————————————— dokunuşlar
  for (const x of hastalar.values()) x.dugme.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    parilti(noktaya(e), 120);
    if (asama !== 'bekleme' && asama !== 'doldu') { ses('e-tik', 0.4, 1.3); return; }
    const d = durum(x.ad);
    if (secilebilir(d)) { void cagir(x, d); return; }
    // sırası gelmemiş hasta: derdiyle tepki verir, Kino sabır ister, sıradakiler kendini gösterir
    dert(x);
    const an = performance.now();
    if (an - sonSabir > SURE.sabir) { sonSabir = an; kinoyaTepki(KLINIK.kino.goster, 1200, 14); soyle('kl-sabir'); }
    siradakileriGoster();
  });
  sahne.addEventListener('pointerdown', e => {
    if (e.button !== 0 || (e.target as Element).closest('button')) return;
    const p = noktaya(e);
    const icinde = (k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
    ses('e-tik', 0.45, 1.35);
    parilti(p, 130);
    if (icinde(KINO_KUTU)) { kinoyaTepki(KLINIK.kino.sevin, 700, 18); return; }
    for (const [v, r] of cikartmalar) if (kayit.iyilesen.includes(v) && Math.hypot(p.x - PANO_YUVALARI[v].x, p.y - PANO_YUVALARI[v].y) < CIKARTMA_BOYU * 0.6) { pop(r, 300); ses('e-cin', 0.5, 1.2); return; }
    if (asama === 'bekleme' || asama === 'doldu') siradakileriGoster();
  });

  // ——————————————————————————— içeri: hasta kalkar, kapıya yürür, kapıdan geçer; vaka başlar
  /** sagaBakar: kareler sağa bakıyor (kapıya yürüyüş); değilse sola (mutlu dönüş). Öbür yöne yürürken aynalanır. */
  async function yuru(x: Hasta, a: Koltuk, b: Koltuk, kareler: readonly string[], sagaBakar: boolean) {
    const ms = sure(yuruSuresi(a.ayak, b.ayak)), t0 = performance.now();
    x.ayna = Math.abs(b.ayak.x - a.ayak.x) > 20 && (b.ayak.x > a.ayak.x) !== sagaBakar;
    let once = 0;
    await new Promise<void>(bitti => {
      const adim = (an: number) => {
        if (!calisiyor) { bitti(); return; }
        const t = an - t0;
        yerlestir(x, yuruNoktasi(a, b, t / ms));
        x.kutu.style.zIndex = '2000';
        x.y.goster(kareler[yuruKaresi(t)]);
        if (adimAtildi(once, t)) ses('kl-ayak', 0.55, 0.9 + Math.random() * 0.25);
        once = t;
        if (t >= ms) { bitti(); return; }
        requestAnimationFrame(adim);
      };
      requestAnimationFrame(adim);
    });
    x.ayna = false;
    yerlestir(x, b);
  }
  async function kalkOtur(x: Hasta, kareler: readonly string[]) { for (const k of kareler) { x.y.goster(k); await bekle(SURE.kalk); } }
  async function cagir(x: Hasta, d: HastaDurumu) {
    asamaGec('cagri');
    x.mesgul = true;
    const v = simdiki(x.ad), c = vakaKareleri(v);
    ses('kl-zil');
    x.y.goster(c.sec); pop(x.y.kutu, 260);
    kinoyaTepki(KLINIK.kino.goster, 2200, 22);
    soyle(d === 'iyi' ? 'kl-yine' : gelSozu(x.ad));
    await bekle(380);
    kapi.classList.add('kl-acik'); ses('kl-kapi');
    await kalkOtur(x, c.kalk);
    await yuru(x, x.yer, ESIK, c.yuru, true);
    // kapıdan geçiş: küçülerek içeri girer
    await x.kutu.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -26px' }], { duration: sure(300), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
    if (!calisiyor) return;
    vakayiBaslat(v);
  }
  function vakayiBaslat(v: VakaAdi) {
    aktif = v;
    const tur = ++vakaTuru;
    asama = 'vaka';
    kok.dataset.klinik = 'vaka';
    moduller.get(v)!.baslat(kok, yas, {
      bitince: () => { void bekle(SURE.donus).then(() => { if (aktif === v && tur === vakaTuru && kok.dataset.asama === 'son') void don(true); }); },
    });
    // kapıdan geçiş: oda vakanın üstünde kalır, kamera açık kapının içine dalar; vaka çizimleri çözülünce oda kapının ışığında söner
    // (boş zemin ya da düz perde yok: çocuk hep odayı, kapıyı ve sonra doğrudan sahneyi görür)
    sahne.classList.add('kl-ortu');
    kok.append(sahne);
    const dal = oda.animate([{ transform: 'scale(1)' }, { transform: `scale(${KAPIDAN_DALIS})` }],
      { duration: sure(900), easing: 'cubic-bezier(.55,0,.75,.4)', fill: 'forwards' });
    const isik = kapiIsigi.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(900), easing: 'ease-in', fill: 'forwards' });
    // vaka yüklenirken kamera durmaz: ışığın içinde yavaşça ilerlemeye devam eder
    let suzul: Animation | null = null;
    void dal.finished.then(() => { if (tur === vakaTuru && sahne.isConnected) suzul = oda.animate([{ transform: `scale(${KAPIDAN_DALIS})` }, { transform: `scale(${KAPIDAN_DALIS * 1.25})` }], { duration: 5000, easing: 'ease-out', fill: 'forwards' }); }, () => undefined);
    const t0 = performance.now();
    const izle = () => {
      if (tur !== vakaTuru) return;
      const d = kok.dataset.durum, t = performance.now() - t0;
      if (!((d === 'hazir' || d === 'eksik') && t >= sure(900)) && t <= 15000) { requestAnimationFrame(izle); return; }
      void sahne.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(380), easing: 'ease-out', fill: 'forwards' }).finished.catch(() => undefined).then(() => {
        sahne.getAnimations().forEach(a => a.cancel()); dal.cancel(); isik.cancel(); suzul?.cancel();
        sahne.classList.remove('kl-ortu');
        if (tur === vakaTuru) sahne.remove();
        kapi.classList.remove('kl-acik');
      });
    };
    requestAnimationFrame(izle);
  }
  // vaka sırasında geri: ana menüye değil bekleme odasına (vakanın kendi dinleyicisinden önce yakalanır)
  kok.addEventListener('click', e => {
    if (!aktif || !(e.target as Element).closest('.vk-geri')) return;
    e.stopImmediatePropagation(); e.preventDefault();
    void don(false);
  }, { capture: true });

  // ——————————————————————————— dışarı: iyileşen hasta mutlu çıkar, yerine oturur, çıkartması panoya uçar
  async function don(iyilesti: boolean) {
    const v = aktif;
    if (!v) return;
    const h = VAKA_HASTASI[v];
    aktif = null; vakaTuru++;
    asama = 'donus';
    for (const a of [...sahne.getAnimations(), ...oda.getAnimations(), ...kapiIsigi.getAnimations()]) a.cancel();
    // dönüş: oda kapının ışığından açılır (kamera kapıdan geri çekilir); vaka altında kalır, düz perde yok
    sahne.classList.add('kl-ortu');
    oda.style.transform = `scale(${KAPIDAN_DALIS})`; kapiIsigi.style.opacity = '1'; kapi.classList.add('kl-acik');
    kok.append(sahne);
    await sahne.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(240), easing: 'ease-in' }).finished.catch(() => undefined);
    sus();
    const x = hastalar.get(h)!, c = vakaKareleri(v);
    const ilkKez = iyilesti && !kayit.iyilesen.includes(v);
    const dolmadan = panoDolu(acik, kayit.iyilesen);
    if (iyilesti) { kayit = iyilestir(kayit, v); kaydet(kayit); }
    // bekleme odası geri gelir (çizimler hâlâ çözülü; kare döngüsü yeniden başlar)
    sahne.classList.remove('kl-ortu');
    kok.replaceChildren(geri, sahne, perde);
    void oda.animate([{ transform: `scale(${KAPIDAN_DALIS})` }, { transform: 'scale(1)' }], { duration: sure(700), easing: 'cubic-bezier(.2,.7,.3,1)' }).finished.catch(() => undefined);
    void kapiIsigi.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(700), easing: 'ease-out' }).finished.catch(() => undefined);
    oda.style.transform = ''; kapiIsigi.style.opacity = '';
    kok.dataset.oyun = 'klinik'; delete kok.dataset.klinik; delete kok.dataset.eksik; kok.dataset.durum = 'hazir';
    cevirUyarisi(kok);
    boyutla();
    asamaGec('donus');
    if (ilkKez) cikartmalar.get(v)!.classList.remove('kl-asili');
    x.kutu.getAnimations().forEach(a => a.cancel());
    dongu();
    if (!iyilesti) {
      // vaka yarıda bırakıldı: hasta yerinde, derdiyle bekliyor
      yerlestir(x, KOLTUKLAR[h]);
      kapi.classList.remove('kl-acik');
      x.mesgul = false;
      asamaGec(panoDolu(acik, kayit.iyilesen) ? 'doldu' : 'bekleme');
      return;
    }
    yerlestir(x, ESIK);
    x.kutu.style.opacity = '0';
    await bekle(sure(520));
    ses('kl-kapi');
    x.y.goster(c.cik[0]);
    await x.kutu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(240), fill: 'forwards' }).finished.catch(() => undefined);
    x.kutu.style.opacity = ''; x.kutu.getAnimations().forEach(a => a.cancel());
    kinoyaTepki(KLINIK.kino.sevin, 2600, 24);
    soyle('kl-iyilesti');
    await yuru(x, ESIK, KOLTUKLAR[h], c.cik, false);
    kapi.classList.remove('kl-acik'); ses('kl-kapan', 0.6);
    await kalkOtur(x, [...c.kalk].reverse());
    ses('kl-otur', 0.8);
    x.mesgul = false;
    yerlestir(x, KOLTUKLAR[h]);
    await cikartmaUcur(x, v, ilkKez);
    if (!calisiyor) return;
    if (ilkKez && !dolmadan && panoDolu(acik, kayit.iyilesen)) await kutla();
    asamaGec(panoDolu(acik, kayit.iyilesen) ? 'doldu' : 'bekleme');
  }
  async function cikartmaUcur(x: Hasta, v: VakaAdi, ilkKez: boolean) {
    const hedef = cikartmalar.get(v)!, bas = govde(x), son_ = PANO_YUVALARI[v];
    if (!ilkKez) { pop(hedef, 340); parilti(son_, 220); ses('e-cin', 0.7, 1.1); hop(x.y.kutu, 20); return; }
    // çıkartma önce odanın ortasında iri görünür (çocuk ne kazandığını görsün), sonra panodaki yuvasına uçar
    const IRI = 300, orta = { x: SAHNE.g / 2, y: 470 }, k = IRI / CIKARTMA_BOYU;
    const u = resim(KLINIK.cikartma[v], 'vk-katman kl-ucan'); ortala(u, son_, CIKARTMA_BOYU, CIKARTMA_BOYU); etkiKati.append(u);
    const dx = bas.x - son_.x, dy = bas.y - son_.y, ox = orta.x - son_.x, oy = orta.y - son_.y;
    hop(x.y.kutu, 26, 320);
    ses('e-cin', 0.8);
    await u.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${k * 0.2}) rotate(-30deg)`, opacity: 0 },
      { transform: `translate(${ox}px, ${oy}px) scale(${k * 1.12}) rotate(0deg)`, opacity: 1, offset: 0.7 },
      { transform: `translate(${ox}px, ${oy}px) scale(${k}) rotate(0deg)`, opacity: 1 },
    ], { duration: sure(560), easing: 'cubic-bezier(.2,.8,.3,1.1)', fill: 'forwards' }).finished.catch(() => undefined);
    parilti(orta, 420); yildizlar.sac(yildizHavuzu, orta, 10, 300, 80); ses('e-cin', 0.7, 1.15);
    await u.animate([{ transform: `translate(${ox}px, ${oy}px) scale(${k}) rotate(0deg)` }, { transform: `translate(${ox}px, ${oy}px) scale(${k * 1.06}) rotate(-6deg)`, offset: 0.5 }, { transform: `translate(${ox}px, ${oy}px) scale(${k}) rotate(0deg)` }],
      { duration: sure(620), easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => undefined);
    await u.animate([
      { transform: `translate(${ox}px, ${oy}px) scale(${k}) rotate(0deg)` },
      { transform: `translate(${ox * 0.4}px, ${oy * 0.4 - 120}px) scale(${k * 0.6}) rotate(200deg)`, offset: 0.55 },
      { transform: 'translate(0, 0) scale(1) rotate(360deg)' },
    ], { duration: sure(SURE.cikartma), easing: 'cubic-bezier(.4,0,.4,1)' }).finished.catch(() => undefined);
    u.remove();
    hedef.classList.add('kl-asili');
    pop(hedef, 300);
    ses('kl-pano'); parilti(son_, 260);
    yildizlar.sac(yildizHavuzu, son_, 8, 200, 60);
  }

  // ——————————————————————————— pano doldu: küçük kutlama
  async function kutla() {
    asamaGec('kutlama');
    ses('kl-patlangic');
    kinoyaTepki(KLINIK.kino.sevin, SURE.kutlama, 30);
    soyle('kl-doldu');
    konfeti();
    yildizlar.yagdir(yildizHavuzu, 30);
    acik.forEach((v, i) => setTimeout(() => {
      const r = cikartmalar.get(v)!;
      pop(r, 320); parilti(PANO_YUVALARI[v], 230); ses('e-cin', 0.5, 1 + i * 0.08);
      const h = VAKA_HASTASI[v], x = hastalar.get(h); if (x) { tepki(x, KLINIK.hasta[h].mutlu[1], 900); hop(x.y.kutu, 34, 380); }
    }, sure(200 + i * 150)));
    // bütün çıkartmalar panodan iner, odanın ortasında iri bir halka olup döner, sonra yuvalarına döner
    const merkez = { x: SAHNE.g / 2, y: 520 }, R = 330, BOY = 170, kk = BOY / CIKARTMA_BOYU;
    const halka = acik.map((v, i) => {
      const r = resim(KLINIK.cikartma[v], 'vk-katman kl-ucan'); const y = PANO_YUVALARI[v]; ortala(r, y, CIKARTMA_BOYU, CIKARTMA_BOYU); etkiKati.append(r);
      const a = (i / acik.length) * Math.PI * 2 - Math.PI / 2, hx = merkez.x + Math.cos(a) * R - y.x, hy = merkez.y + Math.sin(a) * R * 0.62 - y.y;
      return r.animate([
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', offset: 0 },
        { transform: `translate(${hx}px, ${hy}px) scale(${kk}) rotate(360deg)`, offset: 0.25 },
        { transform: `translate(${hx}px, ${hy - 30}px) scale(${kk * 1.12}) rotate(360deg)`, offset: 0.5 },
        { transform: `translate(${hx}px, ${hy}px) scale(${kk}) rotate(360deg)`, offset: 0.75 },
        { transform: 'translate(0, 0) scale(1) rotate(720deg)', offset: 1 },
      ], { duration: sure(SURE.kutlama - 200), delay: sure(500 + i * 60), easing: 'cubic-bezier(.4,0,.3,1)' }).finished.then(() => r.remove(), () => r.remove());
    });
    setTimeout(() => { parilti(merkez, 520); yildizlar.sac(yildizHavuzu, merkez, 14, 420, 90); ses('e-cin', 0.8, 1.3); }, sure(1400));
    void Promise.all(halka);
    pano.classList.add('kl-dolu');
    await bekle(SURE.kutlama);
    pano.classList.remove('kl-dolu');
  }
  const KONFETI = ['#ffb3c7', '#ffd98a', '#a9e6cc', '#b9d4ff', '#d9c2ff', '#ffc9a0'];
  function konfeti() {
    for (let i = 0; i < 60; i++) {
      const k = el('div', 'kl-konfet');
      k.style.background = KONFETI[i % KONFETI.length];
      const x = -tasma.yan + Math.random() * (SAHNE.g + 2 * tasma.yan), kay = (Math.random() - 0.5) * 300, don = (Math.random() - 0.5) * 900;
      konfetiKati.append(k);
      void k.animate([
        { transform: `translate(${x}px, ${-60 - tasma.dik}px) rotate(0deg)` },
        { transform: `translate(${x + kay}px, ${SAHNE.y + tasma.dik + 40}px) rotate(${don}deg)` },
      ], { duration: sure(1800 + Math.random() * 1400), delay: sure(Math.random() * 600), easing: 'cubic-bezier(.35,0,.7,1)' }).finished.then(() => k.remove(), () => k.remove());
    }
  }

  // ——————————————————————————— kare döngüsü: boşta döngüler, Kino, kendiliğinden dertler
  // bekleme odası her geri gelişte döngüyü yeniden başlatır; eski döngü turundan anlar ve durur
  let donguTuru = 0;
  const dongu = () => { const tur = ++donguTuru; const k = (an: number) => { if (tur === donguTuru && kare(an)) requestAnimationFrame(k); }; requestAnimationFrame(k); };
  function kare(an: number): boolean {
    if (!calisiyor || !sahne.isConnected) return false;
    for (const x of hastalar.values()) {
      if (x.mesgul) continue;
      const c = kk(x.ad);
      if (x.tepki && an < x.tepki.son) { x.y.goster(x.tepki.ad); continue; }
      x.tepki = null;
      x.y.goster(durum(x.ad) === 'iyi' ? c.mutlu[mutluKaresi(x.ad, an)] : c.bekle[bekleKaresi(x.ad, an)]);
    }
    if (kinoTepki && an < kinoTepki.son) kinoY.goster(kinoTepki.ad);
    else { kinoTepki = null; kinoY.goster(KLINIK.kino.bekle[Math.floor(an / 620) % 2]); }
    if ((asama === 'bekleme' || asama === 'doldu') && an >= sonrakiKendi) {
      const [a, b] = SURE.kendiliginden;
      sonrakiKendi = an + a + Math.random() * (b - a);
      const bekleyen = [...hastalar.values()].filter(x => durum(x.ad) !== 'iyi' && !x.tepki && !x.mesgul);
      const x = bekleyen[Math.floor(Math.random() * bekleyen.length)];
      if (x) dert(x, 0.35);
    }
    return true;
  }

  // ——————————————————————————— açılış: çizimler çözülünce görünür
  sahne.style.opacity = '0.01';
  let gorunduAni = 0;
  void Promise.all([...sahne.querySelectorAll('img')].map(r => r.decode().catch(() => undefined)))
    .then(() => bekle(TEST_MODU ? 30 : 220))
    .then(() => { sahne.style.opacity = ''; gorunduAni = Date.now(); return new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))); })
    .then(() => {
      if (!calisiyor) return;
      kok.dataset.durum = 'hazir';
      asamaGec(panoDolu(acik, kayit.iyilesen) ? 'doldu' : 'bekleme');
      setTimeout(() => { soyle('kl-hosgeldin'); kinoyaTepki(KLINIK.kino.goster, 2400, 18); }, sure(400));
      setTimeout(siradakileriGoster, sure(1600));
      dongu();
    });

  // Test ve video kaydı için okuma (oyunun işleyişini değiştirmez): ?test ya da ?kayit ile. window.__klinik
  if (TEST_MODU || sorgu.has('kayit')) {
    const m = (e: Element) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    (window as unknown as Record<string, unknown>).__klinik = {
      asama: () => (aktif ? 'vaka' : asama), gorunduAni: () => gorunduAni, olcek: () => S,
      acik: () => [...acik], sira: () => sira(acik, kayit.iyilesen), iyilesen: () => [...kayit.iyilesen], aktif: () => aktif,
      durum: (h: HastaAdi) => durum(h),
      hasta: (h: HastaAdi) => { const x = hastalar.get(h); return x ? m(x.dugme) : null; },
      hastaKutusu: (h: HastaAdi) => { const x = hastalar.get(h); if (!x) return null; const r = x.dugme.getBoundingClientRect(); return { g: r.width, y: r.height }; },
      kare: (h: HastaAdi) => hastalar.get(h)?.y.simdi() ?? null,
      asili: () => [...cikartmalar].filter(([, r]) => r.classList.contains('kl-asili')).map(([v]) => v),
      odadakiler: () => [...odadakiler], simdiki: (h: HastaAdi) => simdiki(h),
      kino: () => ekrana({ x: KINO_KUTU.sol + KINO_KUTU.g / 2, y: KINO_KUTU.ust + KINO_KUTU.y / 2 }),
      /** vakanın sonu yerine: bekleme odasına iyileşmiş dönüş (vakanın bitince'si gibi) */
      vakaBitti: () => { if (aktif) void don(true); },
    };
  }
}
