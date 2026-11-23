/**
 * Masal 2.0: tam ekran sahne masalı (veri: masal2-veri.ts).
 *
 * 22 Kasım akşamı (Barış göl masalını "zayıf, slayt gibi" buldu; yönetici: tam ekran sahne, katmanlı karakter, kamera,
 * küçük canlılık, akıcı geçiş, her sayfada etkileşim, sözcükler oyunun parçası):
 *   - Sahne ekranın tamamını kaplar (çerçeve yok). 1600 × 1200 tuval bir "sahne"dir; kamera onu ekranı kaplayacak ölçüde
 *     büyütür, istenen noktayı ortalar, kenardan taşmaz. Cümle okunurken kamera `bas`'tan `son`'a yavaşça kayar; dokununca
 *     o şeye doğru yaklaşır, ses bitince geri çekilir. Sayfa çevrilirken eski resim yeni resme erirken kamera da kayar.
 *   - Ayrı çizilmiş katmanlar (karakterler) fonun üstünde durur; nefes alır, sallanır, göz kırpar.
 *   - Etkileşim: dokun (ana yer parlar), seç ("Where is the duck?"), söyle (söz tanıma; yedek yıldız), sürükle (bir katmanı
 *     hedefe taşı). Dokunulan şeyin `kelime`si varsa önce İngilizce adı söylenir ve sözcük sahnede o şeyin üstünde parlar.
 *   - Anlatıcı Polly köşede küçük durur, konuşurken ağzı oynar, dokununca cümleyi yeniden okur; girişte Ceren.
 * Dokunulacak yerler sahnenin üstünde saydam düğmelerdir (klavyeyle de seçilir); çizim kırpılmaz.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { kelimeBul } from '../icerik';
import { cumleBandi } from '../gorsel';
import { cizim, dugme, harfleriYak, hareket, ipucuKur, kisi, kutla, noktalar, salla } from '../kit';
import { efektCal, tik } from '../ses';
import { resim } from '../varlik';
import { soylet, yasam, type AdimKurucu } from './ortak';
import { M2_TUVAL, masal2Bul, sozSesi, type Dokunus, type Etkilesim, type Kamera, type Katman, type Kutu, type Masal2Sayfa } from './masal2-veri';
import './masal2.css';

/** ana dokunuşun sesi bittikten sonra sayfanın kendiliğinden çevrilmesine kadar geçen süre */
const KENDILIGINDEN_MS = 1100;
/** kendiliğinden canlanan yerin, önceki ses bittikten sonra başlaması */
const OTO_MS = 250;
/**
 * Polly'nin efektin üstüne girdiği an (ms). Ördek sesi 0,3 sn arayla "vak"lardır; 0,5–0,6 sn arası sessiz: iki vaktan sonra
 * kesmek temizdir. İneğin "möö"sü 0,3–1,8 sn boyunca tek ses: kesilmez, bitmesi beklenir (listede yok).
 */
const EFEKT_KESIMI: Readonly<Record<string, number>> = { 'efekt/duck': 550 };
/** kamera kayma süreleri (ms) */
const KAMERA = { okuma: 6500, sayfa: 800, dokun: 450, don: 900 } as const;
const azHareket = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const px = (k: Kutu) => ({ left: `${k[0]}px`, top: `${k[1]}px`, width: `${k[2]}px`, height: `${k[3]}px` });
const merkez = (k: Kutu) => `${((k[0] + k[2] / 2) / M2_TUVAL.en) * 100}% ${((k[1] + k[3] / 2) / M2_TUVAL.boy) * 100}%`;
const ortasi = (k: Kutu) => ({ x: k[0] + k[2] / 2, y: k[1] + k[3] / 2 });
/**
 * Açılır kitap dünyası (piksel): masa 2000 × 1500; kitap Astra'nın açık kitabı (`oyun/acik-kitap`, 1600 × 1100; sayfalar
 * x 55–1545, y 55–1010); sahne 4:3, sayfa alanına oturur (1273 × 955). Kamera yakınlık 1'de kitabın tamamını gösterir.
 */
const KITAP = { x: 200, y: 250, en: 1600, boy: 1100 } as const;
const SAYFA = { x: KITAP.x + 55 + (1490 - 1273) / 2, y: KITAP.y + 55, olcek: 1273 / 1600 } as const;
const GORUS = { en: 1720, boy: 1220 } as const;
/** kamera verilmemiş sayfa: kitabın tamamı, okunurken sayfaya hafifçe yaklaşır */
const VARSAYILAN: { bas: Kamera; son: Kamera } = { bas: { x: 800, y: 600, yakin: 1 }, son: { x: 800, y: 600, yakin: 1.15 } };
/** yakın an (C "sinema anı"): kamera sayfanın içine dalar, karakterler ekranı doldurur */
const YAKIN_AN = 2.3;
/** kâğıt sesi (sayfa çevirme) */
const KAGIT_SESI = new URL('../../../assets/hazirlik/ses/kres_kagit_ac.mp3', import.meta.url).href;
const kameraSon = (s: Masal2Sayfa) => s.kamera?.son ?? s.kamera?.bas ?? VARSAYILAN.son;

/** Sıradaki çizimler önceden indirilir (sayfa çevrilince boş sahne görünmesin) */
const onYukle = (yollar: readonly string[]) => { for (const y of yollar) { const a = resim(y); if (a) { const i = new Image(); i.decoding = 'async'; i.src = a; } } };

export const masal2Kur: AdimKurucu<'masal2'> = (b, a) => {
  const y = yasam();
  const m = masal2Bul(a.masal)!;
  let no = 0, kilit = true, anaTamam = false, cizimAdi = '';
  /** seç etkileşimi sürüyorsa beklenen doğru yer */
  let secBekliyor: Masal2Sayfa['sec'] | null = null;
  const sayfa = () => m.sayfalar[no];
  const tekrar = () => {
    if (kilit) return;
    harfleriYak(bant ?? null, 1600);
    void (secBekliyor ? y.soyle(secBekliyor.soru) : y.soyle(sayfa().ses));
  };

  // ---- açılır kitap (22 Kasım kararı, UI-2 B): görüş alanı > kamera (dünya: masa, kitap, sayfa) > sayfa (sahne ölçeğinde)
  //      > kıpırtı > sahne (fon, katmanlar, yerler; 1600 × 1200 tuval pikseli). Polly kitabın kenarında oturur; sayfanın
  //      sağ alt köşesi kıvrıktır, parmakla çekilince (ya da dokununca) sayfa kâğıt sesiyle çevrilir.
  const sahne = h('div.ing-m2-sahne');
  const kipir = h('div.ing-m2-kipir', {}, sahne);
  const sayfaKutu = h('div.ing-m2-sayfa', {}, kipir);
  Object.assign(sayfaKutu.style, { left: `${SAYFA.x}px`, top: `${SAYFA.y}px`, width: `${M2_TUVAL.en}px`, height: `${M2_TUVAL.boy}px`, transform: `scale(${SAYFA.olcek})` });
  const kitapResmi = cizim('oyun/acik-kitap', 'ing-m2-kitap');
  if (kitapResmi) Object.assign(kitapResmi.style, { left: `${KITAP.x}px`, top: `${KITAP.y}px`, width: `${KITAP.en}px`, height: `${KITAP.boy}px` });
  const ceren = kisi('ceren', 'ing-m2-anlatici-kisi');
  const polly = kisi('polly', 'ing-m2-anlatici-kisi');
  const anlatici = dugme('ing-m2-anlatici', 'Polly’yi yeniden dinle', () => { tik.dokun(); tekrar(); }, ceren, polly);
  polly.hidden = true;
  // sayfanın kıvrık köşesi: ileri (sürükle ya da dokun)
  const ileri = dugme('ing-m2-ileri', 'Sayfayı çevir', () => void sonraki(), h('span.ing-m2-kose-kagit', { 'aria-hidden': 'true' }));
  ileri.hidden = true;
  const kamera = h('div.ing-m2-kamera', {}, ...(kitapResmi ? [kitapResmi] : []), sayfaKutu, anlatici, ileri);
  const cerceve = h('div.ing-m2-cerceve', { 'data-masal': m.ad }, kamera);
  const bantYeri = h('div.ing-m2-bant');
  // mikrofon yuvası yalnız söyle sırasında görünür: .ing-tanis-alt'ın display:grid'i gizlemeyi eziyordu, boş ve saydam
  // kutu göl sayfasının ortasında dokunuşları yutuyordu (hidden + aşağıdaki !important)
  const sozYeri = h('div.ing-tanis-alt.ing-m2-soz');
  sozYeri.hidden = true;
  const sayac = h('div.ing-m2-sayac');
  // Yes / No düğmeleri (v2: "Is this my hat?"): sahnenin üstünde iki büyük düğme, yalnız soru sırasında
  const evetHayirYeri = h('div.ing-m2-evethayir');
  evetHayirYeri.hidden = true;
  const kok = h('section.ing-m2.ing-m2-kitapli', {}, cerceve, bantYeri, sozYeri, evetHayirYeri, sayac);
  b.alan.replaceChildren(kok);
  // tam ekran sahnede dersin üst şeridi (geri, ses, adım noktaları) sahnenin üstünde durur: şeridin boş yerleri dokunuşu
  // sahneye geçirir (yukarıdaki şapkaya dokunulamıyordu), yalnız düğmeleri dokunuş alır
  const ustSerit = b.alan.closest('.ing')?.querySelector<HTMLElement>('.ing-ust') ?? document.querySelector<HTMLElement>('.ing-ust');
  ustSerit?.classList.add('ing-ust-gecirgen');
  let bant: HTMLElement | undefined;
  let yerler: HTMLButtonElement[] = [];
  let katmanlar = new Map<string, HTMLElement>();

  // ---- kamera: yakınlık 1'de kitabın tamamı ekrana sığar; daha yakında sayfanın içine girer (yakın an ≈ 2,3: karakterler
  //      ekranı doldurur). Kamera noktası sahne (tuval) pikselidir, dünyaya çevrilir.
  let kam: Kamera = VARSAYILAN.bas;
  const tabanOlcek = () => Math.min(cerceve.clientWidth / GORUS.en, cerceve.clientHeight / GORUS.boy);
  function kameraUygula(k: Kamera, ms: number) {
    kam = k;
    const vw = cerceve.clientWidth, vh = cerceve.clientHeight;
    if (!vw || !vh) return;
    const s = tabanOlcek() * k.yakin;
    // yakınlık 1'de kitabın ortası, yaklaştıkça sahnenin istenen noktası ortalanır
    const t = Math.min(1, Math.max(0, (k.yakin - 1) / 0.35));
    const wx = KITAP.x + KITAP.en / 2 + ((SAYFA.x + k.x * SAYFA.olcek) - (KITAP.x + KITAP.en / 2)) * t;
    const wy = KITAP.y + KITAP.boy / 2 - 30 + ((SAYFA.y + k.y * SAYFA.olcek) - (KITAP.y + KITAP.boy / 2 - 30)) * t;
    const tx = vw / 2 - wx * s, ty = vh / 2 - wy * s;
    const sure = azHareket() ? 0 : ms;
    kamera.style.transition = sure ? `transform ${sure}ms cubic-bezier(.45,.05,.35,1)` : 'none';
    kamera.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
  }
  /**
   * Etkileşimin yerlerini ekranda gösterir: kutuların hepsi cümle bandının üstünde, görüş alanının içinde kalacak biçimde
   * kamera ortalanır (geniş telefonda sahne üstten alttan kırpıldığı için sorulan ördek bandın altında kalıyordu).
   * Yakınlık sahnenin o anki yakınlığını geçmez, ekranı kaplama ölçüsünün altına inmez.
   */
  function goster(kutular: readonly Kutu[], ms = 600) {
    if (!kutular.length) return;
    const vw = cerceve.clientWidth, vh = cerceve.clientHeight;
    if (!vw || !vh) return;
    const x0 = Math.min(...kutular.map((k) => k[0])), y0 = Math.min(...kutular.map((k) => k[1]));
    const x1 = Math.max(...kutular.map((k) => k[0] + k[2])), y1 = Math.max(...kutular.map((k) => k[1] + k[3]));
    // kitapta: kitap görünür kalır; yerler ekrana ve bandın üstüne sığmıyorsa geri çekilinir (o anki yakınlığı geçmez)
    const taban = tabanOlcek() * SAYFA.olcek;
    const altPay = bantYeri.offsetHeight + 24;
    // dokunma hedefi en az 64 px (kalite kuralı 8): telefonda kitap küçük kaldığında en küçük yer 64 px olana kadar yaklaşılır
    const enKucuk = Math.min(...kutular.map((k) => Math.min(k[2], k[3])));
    const yakin = Math.max(
      Math.max(1, Math.min(kam.yakin, (vw * 0.9) / ((x1 - x0) * taban), ((vh - altPay) * 0.9) / ((y1 - y0) * taban))),
      Math.min(2.4, 64 / (enKucuk * taban)),
    );
    const s = taban * yakin;
    kameraUygula({ x: (x0 + x1) / 2, y: (y0 + y1) / 2 + altPay / 2 / s, yakin }, ms);
  }
  /** O anki etkileşimin yerleri: seçte bütün yerler, sürüklemede taşınan ve hedef, yoksa ana yer */
  function etkilesimKutulari(): Kutu[] {
    const s = sayfa();
    if (akisKutulari.length) return akisKutulari;
    if (secBekliyor) return aktifListe.filter((d) => !d.oto).map((d) => d.kutu);
    if (s.surukle && sahne.querySelector('.ing-m2-tasinir')) return [...(s.katmanlar ?? []).filter((k) => k.id === s.surukle!.nesne).map((k) => k.kutu), s.surukle.hedef];
    const ana = aktifListe.find((d) => d.ana);
    return ana ? [ana.kutu] : [];
  }
  const boyGozcu = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => kameraUygula(kam, 0)) : null;
  boyGozcu?.observe(cerceve);

  /** Fonu değiştirir: yeni fon eskinin üstünde erir, eskisi sonra kalkar (bellekte en çok iki fon) */
  function cizimKoy(yol: string, tur: 'cevir' | 'gecis') {
    cizimAdi = yol;
    sahne.dataset.cizim = yol.split('/').pop();
    const img = cizim(yol, `ing-m2-resim ing-m2-${tur}`);
    const eski = [...sahne.querySelectorAll<HTMLElement>('.ing-m2-resim')];
    const yeni = img ?? h('span.ing-m2-resim.ing-m2-yer-tutucu', {}, yol.split('/').pop() ?? '');
    sahne.insertBefore(yeni, sahne.querySelector('.ing-m2-katman, .ing-m2-yer'));
    // sayfa çevrilince eski sahne sayfaya yatar, yenisi sayfadan kalkar (açılır kitap)
    if (tur === 'cevir') eski.forEach((e) => e.classList.add('ing-m2-yat'));
    y.sonra(() => eski.forEach((e) => e.remove()), tur === 'gecis' ? 450 : 750);
    katmanGorunurlugu();
  }

  /** yalnız belli bir çizimde görünen katmanlar (şapkalı ördek sudan çıkınca gagasındaki şapka) */
  let katmanVeri = new Map<string, Katman>();
  function katmanGorunurlugu() {
    katmanlar.forEach((el, id) => { const k = katmanVeri.get(id); if (k?.cizimde) el.hidden = cizimAdi !== k.cizimde; });
  }

  /** Sayfanın katmanları: kendi kutusunda, canlılığıyla; göz kırpan katmanın gözü kapalı karesi ara ara görünür */
  function katmanlariKur(liste: readonly Katman[]) {
    katmanlar.forEach((k) => k.remove());
    katmanlar = new Map();
    katmanVeri = new Map(liste.map((k) => [k.id, k]));
    liste.forEach((k, i) => {
      // kalkış (dış kap) ve canlılık (iç kap) ayrı: ikisi aynı öğede birbirinin animasyonunu ezerdi
      const resmi = cizim(k.resim, 'ing-m2-katman-resim');
      const ic = h('span.ing-m2-katman-ic', {}, resmi ?? h('span.ing-m2-yer-tutucu', {}, k.id));
      const el = h('span.ing-m2-katman.ing-m2-kalkar', { 'data-katman': k.id }, ic);
      Object.assign(el.style, px(k.kutu));
      // katmanlar sahneden sonra, birer birer kalkar
      el.style.animationDelay = `${260 + i * 140}ms`;
      if (k.canlilik) ic.classList.add(`ing-m2-${k.canlilik}`);
      ic.style.setProperty('--gecikme', `${-(k.kutu[0] % 1700)}ms`);
      const goz = k.goz ? cizim(k.goz, 'ing-m2-katman-resim ing-m2-goz') : null;
      if (goz) {
        ic.append(goz);
        const kirp = () => { goz.classList.add('ing-m2-kapali'); y.sonra(() => goz.classList.remove('ing-m2-kapali'), 140); y.sonra(kirp, 2600 + Math.random() * 2600); };
        y.sonra(kirp, 1200 + Math.random() * 2000);
      }
      sahne.insertBefore(el, sahne.querySelector('.ing-m2-yer'));
      katmanlar.set(k.id, el);
    });
    katmanGorunurlugu();
  }

  /** O çizimin dokunulacak yerleri: listede önce gelen üstte durur (ördek ineğin önünde) */
  let aktifListe: readonly Dokunus[] = [];
  function yerleriKur(liste: readonly Dokunus[]) {
    aktifListe = liste;
    yerler.forEach((d) => d.remove());
    yerler = liste.map((d, i) => {
      const yer = dugme('ing-m2-yer', d.kelime ? (kelimeBul(d.kelime)?.en ?? d.id) : d.id, () => void dokun(d, yer), h('span.ing-m2-isik', { 'aria-hidden': 'true' }));
      Object.assign(yer.style, px(d.kutu));
      yer.style.zIndex = String(10 + liste.length - i);
      yer.dataset.yer = d.id;
      if (d.ana) yer.classList.add('ing-m2-ana');
      if (d.oto) yer.classList.add('ing-m2-oto');
      return yer;
    });
    sahne.append(...yerler);
    hedefYaz();
  }
  /** test kipinde beklenen yer (seçte doğrusu, yoksa ana yer) */
  function hedefYaz() {
    if (!TEST_MODU) return;
    const hedef = secBekliyor?.dogru ?? akisHedef ?? aktifListe.find((d) => d.ana)?.id;
    if (hedef) cerceve.dataset.hedef = hedef; else delete cerceve.dataset.hedef;
  }

  const anaYer = () => (secBekliyor ? yerler.find((d) => d.dataset.yer === secBekliyor!.dogru) : yerler.find((d) => d.classList.contains('ing-m2-ana'))) ?? null;
  /** Çizimin kendiliğinden canlanan yeri varsa kısa bir an sonra onu oynatır (çocuk dokunmadan); oynattıysa true */
  async function otoOynat(ms: number): Promise<boolean> {
    const oto = aktifListe.find((x) => x.oto);
    const dugmesi = oto && yerler.find((x) => x.dataset.yer === oto.id);
    if (!oto || !dugmesi) return false;
    if (!(await y.dur(ms))) return true;
    kilit = false;
    void dokun(oto, dugmesi);
    return true;
  }
  const parlat = (acik: boolean) => cerceve.classList.toggle('ing-m2-parlak', acik);

  /** Sözcük sahnede, o şeyin üstünde kısa bir an parlar (harfleri sırayla yanar) */
  function sozcukGoster(kelimeId: string, k: Kutu, kalici = false, yaziVar?: string): HTMLElement {
    const w = kelimeBul(kelimeId);
    const el = h('span.ing-m2-sozcuk', { lang: 'en-US', 'aria-hidden': 'true' }, ...(yaziVar ?? w?.en ?? kelimeId).split('').map((c, i) => {
      const harf = h('span', {}, c);
      harf.style.animationDelay = `${120 + i * 70}ms`;
      return harf;
    }));
    const o = ortasi(k);
    el.style.left = `${o.x}px`;
    // sözcük nesnenin hemen üstünde, küçük bir okla nesneyi gösterir (nesnenin üstünü ya da iki karakterin arasını örtmez);
    // sahnenin üst kenarına yakın şeyde altına yazılır, ok yukarı bakar (üstteki düğme ve noktaların altında kalmasın)
    if (k[1] < 240) { el.style.top = `${k[1] + k[3] + 16}px`; el.classList.add('ing-m2-altta'); } else el.style.top = `${k[1] - 16}px`;
    sahne.append(el);
    // söyle etkileşiminde sözcük çocuk söyleyene kadar durur
    if (kalici) el.classList.add('ing-m2-kalici'); else y.sonra(() => el.remove(), 2000);
    return el;
  }

  function canlan(d: Dokunus) {
    kipir.style.transformOrigin = merkez(d.kutu);
    kipir.classList.remove('ing-m2-sek', 'ing-m2-ruzgar', 'ing-m2-sicra');
    void kipir.offsetWidth;
    kipir.classList.add(`ing-m2-${d.canlanma}`);
    if (d.canlanma === 'sicra') {
      // su halkaları: dokunulan yerin ortasından iki halka açılır
      for (let i = 0; i < 2; i++) {
        const halka = h('span.ing-m2-halka', { 'aria-hidden': 'true' });
        halka.style.setProperty('--x', `${d.kutu[0] + d.kutu[2] / 2}px`);
        halka.style.setProperty('--y', `${d.kutu[1] + d.kutu[3] * 0.62}px`);
        halka.style.animationDelay = `${i * 180}ms`;
        sahne.append(halka);
        y.sonra(() => halka.remove(), 1400);
      }
    }
  }

  async function dokun(d: Dokunus, yer: HTMLElement, o: { sozluSoylendi?: boolean; surukleyle?: true } = {}) {
    if (kilit) return;
    // sürükleme beklenirken yerlere dokunmak sayılmaz (şapkayı taşımadan Kino'ya dokunmak adımı atlatmasın)
    if (surukleBekliyor && !o.surukleyle) return;
    // seç etkileşimi: yanlış yer adını söyler ve sallanır, soru yinelenir
    // (kendiliğinden canlanan yer de seçenek değildir: soru sürerken ona dokunmak cevap sayılmaz; o yer soru bitince oynar)
    if (secBekliyor && d.id !== secBekliyor.dogru) {
      kilit = true;
      salla(yer);
      if (d.kelime) sozcukGoster(d.kelime, d.kutu);
      if (!(await y.soyle(...(d.kelime ? [`en/w-${d.kelime}`] : []), secBekliyor.soru))) return;
      kilit = false;
      ipucuKur(anaYer, 3000);
      return;
    }
    const secDogru = !!secBekliyor;
    secBekliyor = null;
    cerceve.classList.remove('ing-m2-secim');
    kilit = true;
    ipucuKur(undefined);
    parlat(false);
    // 0 ms karşılık: kod efekti (kabarcık "pop", "şıp") ya da dokunma sesi, canlanma, yıldızlar, Polly'nin sevinci
    if (d.kodEfekt) tik[d.kodEfekt](); else tik.dokun();
    canlan(d);
    kutla(yer);
    // kamera dokunulan şeye yaklaşır; yakın anda (hikâyenin doruğu) sayfanın içine dalar, karakterler ekranı doldurur
    const o2 = ortasi(d.kutu);
    if (d.yakin) { cerceve.classList.add('ing-m2-yakin-an'); kameraUygula({ x: o2.x, y: o2.y, yakin: YAKIN_AN }, 700); }
    else kameraUygula({ x: o2.x, y: o2.y, yakin: Math.max(kam.yakin, 1.15) * 1.08 }, KAMERA.dokun);
    const sesler = [...d.sesler];
    const efekt = sesler[0]?.startsWith('efekt/') ? sesler.shift()! : null;
    // sözcük: adı söylenir ("cow"), sahnede parlar. Geçişli dokunuşta önce resim değişir (şapkalı ördek gelmeden "hat"
    // yazmasın), sonra sözcük; geçişsizde sözcük efektten önce (Polly'nin sözü efekti keser)
    const sozcukSoyle = async () => {
      if (!d.kelime || o.sozluSoylendi) return true;
      sozcukGoster(d.kelime, d.kutu);
      return y.soyle(`en/w-${d.kelime}`);
    };
    if (!d.gecis && !(await sozcukSoyle())) return;
    // efekt hemen başlar; Polly konuşunca efekt kesilir (sus), bu yüzden Polly efektin temiz bir yerinde girer:
    // ördekte iki "vak"tan sonraki sessizlikte, inekte "möö" bitince
    const efektSesi = efekt ? efektCal(efekt) : null;
    const t = performance.now();
    if (d.gecis && d.gecis !== cizimAdi) {
      // resim su sıçrar sıçramaz değişir (Barış: dokununca anında canlanma)
      if (!(await y.dur(efekt ? 250 : 160))) return;
      cizimKoy(d.gecis, 'gecis');
      yerleriKur(sayfa().sonraki?.[d.gecis] ?? []);
      void hareket('polly', 'sevin');
      if (!(await sozcukSoyle())) return;
    }
    if (efektSesi) {
      const kesim = EFEKT_KESIMI[efekt!];
      await (kesim ? Promise.race([efektSesi, y.dur(Math.max(0, kesim - (performance.now() - t)))]) : efektSesi);
      if (!y.acik) return;
    }
    if (sesler.length && !(await y.soyle(...sesler))) return;
    // geçişle gelen çizim kendiliğinden canlanıyorsa (muzlu ördek dalıp şapkayla çıkar) hemen arkasından o oynar;
    // seçimin doğrusundan sonra da sayfanın kendiliğinden yeri (son sayfada Kino'nun el sallaması)
    if ((d.gecis || secDogru) && (await otoOynat(OTO_MS))) return;
    // sırayla oynanan etkileşimlerde dokunuş bitti haberi akışa gider; sayfayı akış bitirir
    if (akisBekle) { cerceve.classList.remove('ing-m2-yakin-an'); akisBekle(d.id); return; }
    // geçişten sonra yeni çizimin kendi ana yeri varsa o beklenir
    const yeniAna = d.gecis && yerler.find((x) => x.classList.contains('ing-m2-ana'));
    if (!yeniAna && (d.ana || secDogru)) anaTamam = true;
    kilit = false;
    // kamera geri çekilir: sayfa bittiyse sayfanın son kadrajına, sürüyorsa sıradaki etkileşimin yerlerine
    cerceve.classList.remove('ing-m2-yakin-an');
    // sayfa bitince kamera kitabın tamamına çekilir: kıvrık köşe (sayfa çevirme) görünür kalır
    if (anaTamam) { kameraUygula({ x: 800, y: 600, yakin: 1 }, KAMERA.don); ileri.hidden = false; ipucuKur(() => ileri, 4000); kendiliginden(); }
    else { goster(etkilesimKutulari(), KAMERA.don); parlat(true); ipucuKur(anaYer, 3500); }
  }

  // ---- sırayla oynanan etkileşimler (Masal 2.0 v2): her biri bitince bir sonraki başlar, hepsi bitince sayfa biter
  /** akışın beklediği dokunuş: dokun() sonunda bu çağrılır (kabul etmezse çocuk dokunmaya devam eder) */
  let akisBekle: ((id: string) => void) | null = null;
  let akisHedef: string | undefined;
  let akisKutulari: Kutu[] = [];
  const yerDugmesi = (id: string) => yerler.find((x) => x.dataset.yer === id);
  const yerVerisi = (id: string) => aktifListe.find((d) => d.id === id);
  /** Yer(ler) parlar, çocuk dokunur; `kabul` true dönünce çözülür */
  function yerBekle(kabul: (id: string) => boolean): Promise<string> {
    return new Promise((coz) => {
      akisBekle = (id) => {
        if (kabul(id)) { akisBekle = null; coz(id); return; }
        kilit = false; parlat(true); ipucuKur(anaYer, 3500);
      };
      kilit = false;
      parlat(true);
      goster(etkilesimKutulari());
      ipucuKur(anaYer, 3500);
    });
  }
  /** yalnız beklenen yer(ler) nabız gibi atar */
  function anaYap(ids: readonly string[]) {
    yerler.forEach((x) => x.classList.toggle('ing-m2-ana', ids.includes(x.dataset.yer ?? '')));
    akisHedef = ids[0];
    akisKutulari = ids.map((id) => yerVerisi(id)?.kutu).filter((k): k is Kutu => !!k);
    hedefYaz();
  }
  /** Bir yeri kodla canlandırır (yakala, Yes/No ve söyle sonrası) ve dokunuşun bitmesini bekler */
  async function yeriOynat(id: string, o: { sozluSoylendi?: boolean } = {}) {
    const d = yerVerisi(id), dugmesi = yerDugmesi(id);
    if (!d || !dugmesi) return;
    const bitti = yerBekle((x) => x === id);
    kilit = false;
    void dokun(d, dugmesi, o);
    await bitti;
  }

  /** Yakala: kaçan hedef. Katman her dokunuşta "fırt" diye bir sonraki noktaya kaçar, sonda düşer, `sonra` canlanır */
  async function yakala(e: Extract<Etkilesim, { tip: 'yakala' }>) {
    const el = katmanlar.get(e.nesne), veri = katmanVeri.get(e.nesne);
    if (!el || !veri) return;
    const merkezi: [number, number] = [veri.kutu[0] + veri.kutu[2] / 2, veri.kutu[1] + veri.kutu[3] / 2];
    const git = (n: readonly [number, number]) => { el.style.translate = `${n[0] - merkezi[0]}px ${n[1] - merkezi[1]}px`; };
    akisKutulari = [veri.kutu];
    if (TEST_MODU) cerceve.dataset.yakala = e.nesne;
    el.classList.add('ing-m2-yakalanir');
    goster([veri.kutu, ...e.kacis.map(([x, yy]) => [x - veri.kutu[2] / 2, yy - veri.kutu[3] / 2, veri.kutu[2], veri.kutu[3]] as Kutu)]);
    // yakalarken sahnenin yerleri kilitli: göle önceden dokunmak şapkayı düşürmeden sıçratmasın (yalnız katman dinler)
    kilit = true;
    ipucuKur(() => el, 3000);
    for (let i = 0; i <= e.kacis.length; i++) {
      await new Promise<void>((coz) => el.addEventListener('pointerdown', () => coz(), { once: true }));
      if (!y.acik) return;
      ipucuKur(undefined);
      if (i < e.kacis.length) {
        // kaçış: "fırt", katman yeni yere süzülür, Polly şaşırır (çocuk kaybetmez, komik)
        tik.firt();
        el.classList.remove('ing-m2-kacti'); void el.offsetWidth; el.classList.add('ing-m2-kacti');
        git(e.kacis[i]);
        void hareket('polly', 'saskin');
        ipucuKur(() => el, 2500);
        continue;
      }
      // sonda göle düşer: küçülerek düşüş noktasına iner, kaybolur
      el.classList.remove('ing-m2-yakalanir');
      el.classList.add('ing-m2-dusuyor');
      git(e.dusme);
      if (!(await y.dur(TEST_MODU ? 0 : 420))) return;
      el.hidden = true;
    }
    delete cerceve.dataset.yakala;
    akisKutulari = [];
    await yeriOynat(e.sonra);
  }

  /** Yes / No: soru çalar, iki büyük düğme; doğruya `sonra` canlanır, yanlışa komik karşılık ve soru yinelenir */
  async function evetHayir(e: Extract<Etkilesim, { tip: 'evethayir' }>) {
    const dugmeler = (['yes', 'no'] as const).map((c) => {
      const d = dugme(`ing-m2-${c === 'yes' ? 'evet' : 'hayir'}`, c === 'yes' ? 'Yes' : 'No', () => void sec(c, d),
        h('span.ing-m2-eh-isaret', { 'aria-hidden': 'true' }, c === 'yes' ? '✓' : '✗'), h('b', { lang: 'en-US' }, c === 'yes' ? 'Yes' : 'No'));
      d.dataset.cevap = c;
      return d;
    });
    evetHayirYeri.replaceChildren(...dugmeler);
    if (TEST_MODU) cerceve.dataset.evethayir = e.dogru;
    let bitir: () => void = () => {};
    const bitti = new Promise<void>((coz) => { bitir = coz; });
    let bekliyor = false;
    async function sor() {
      bekliyor = false;
      if (!(await y.soyle(e.soru))) return;
      evetHayirYeri.hidden = false;
      bekliyor = true;
      ipucuKur(() => (dugmeler.find((x) => x.dataset.cevap === e.dogru) ?? null), 5000);
    }
    async function sec(c: 'yes' | 'no', d: HTMLButtonElement) {
      if (!bekliyor) return;
      bekliyor = false;
      ipucuKur(undefined);
      if (c !== e.dogru) {
        // ceza yok: düğme jöle gibi esner, Polly şaşırır, (varsa) komik ses, soru yinelenir
        salla(d);
        if (e.yanlisSes) await efektCal(e.yanlisSes);
        if (!y.acik) return;
        void sor();
        return;
      }
      tik.dogru();
      kutla(d);
      d.classList.add('ing-m2-eh-dogru');
      if (!(await y.dur(TEST_MODU ? 0 : 260))) return;
      evetHayirYeri.hidden = true;
      evetHayirYeri.replaceChildren();
      delete cerceve.dataset.evethayir;
      bitir();
    }
    void sor();
    await bitti;
    await yeriOynat(e.sonra);
  }

  /** Söyle (akış): `onceki` (Kino'nun sorusu) ya da "Say it!", sözcük sahnede bekler, çocuk söyler, hedef canlanır */
  async function akisSoyle(e: Extract<Etkilesim, { tip: 'soyle' }>) {
    const hedef = yerVerisi(e.hedef);
    if (!hedef) return;
    const evetHayirSoz = e.kelime === 'yes' || e.kelime === 'no';
    const yazi = evetHayirSoz ? (e.kelime === 'yes' ? 'Yes!' : 'No!') : (kelimeBul(e.kelime)?.en ?? e.kelime);
    const sozcuk = sozcukGoster(e.kelime, hedef.kutu, true, yazi);
    akisKutulari = [hedef.kutu];
    goster([hedef.kutu]);
    if (!(await y.soyle(e.onceki ?? 'en/g-say-it'))) return;
    sozYeri.hidden = false;
    sozYeri.classList.add('ing-m2-soz-acik');
    await soylet(sozYeri, y, {
      beklenen: evetHayirSoz ? e.kelime : (kelimeBul(e.kelime)?.en ?? e.kelime),
      ...(evetHayirSoz ? {} : { ornek: `en/w-${e.kelime}-yavas` }),
      ipucu: ['en/g-listen', sozSesi(e.kelime)],
    });
    sozYeri.classList.remove('ing-m2-soz-acik');
    sozYeri.hidden = true;
    sozYeri.replaceChildren();
    sozcuk.remove();
    akisKutulari = [];
    if (!y.acik) return;
    await yeriOynat(e.hedef, { sozluSoylendi: !evetHayirSoz });
  }

  /** Akışı baştan sona oynatır; her etkileşim bitince sıradaki */
  async function akisOyna(liste: readonly Etkilesim[]) {
    for (const e of liste) {
      if (!y.acik) return;
      if (e.tip === 'dokun') { anaYap([e.yer]); await yerBekle((id) => id === e.yer); }
      else if (e.tip === 'hepsi') {
        const kalan = new Set(e.yerler);
        anaYap([...kalan]);
        await yerBekle((id) => { kalan.delete(id); anaYap([...kalan]); return kalan.size === 0; });
      }
      else if (e.tip === 'yakala') { anaYap([]); await yakala(e); }
      else if (e.tip === 'evethayir') { anaYap([]); await evetHayir(e); }
      else if (e.tip === 'soyle') { anaYap([]); await akisSoyle(e); }
      else if (e.tip === 'surukle') {
        anaYap([]);
        const bitti = yerBekle((id) => id === e.sonra);
        surukleKur(e);
        await bitti;
      }
    }
    anaYap([]);
    akisHedef = undefined;
  }

  /** Sayfa bitti: kamera kitaba çekilir, köşe kıvrılır, kısa bir an sonra sayfa kendiliğinden çevrilir */
  function sayfaBitti() {
    anaTamam = true;
    kilit = false;
    parlat(false);
    cerceve.classList.remove('ing-m2-yakin-an');
    kameraUygula({ x: 800, y: 600, yakin: 1 }, KAMERA.don);
    ileri.hidden = false;
    ipucuKur(() => ileri, 4000);
    kendiliginden();
  }

  /** Seç: Polly sorar, sayfanın yerleri eşit parlar; doğru yere dokununca o yer canlanır */
  async function secSor(s: NonNullable<Masal2Sayfa['sec']>) {
    secBekliyor = s;
    hedefYaz();
    cerceve.classList.add('ing-m2-secim');
    parlat(true);
    goster(etkilesimKutulari());
    if (!(await y.soyle(s.soru))) return;
    kilit = false;
    ipucuKur(anaYer, 5000);
  }

  /** Söyle: sözcük sahnede durur, Polly "Say it!" der; çocuk söyleyince (ya da yıldıza dokununca) hedef yer canlanır */
  async function soyleSor(s: NonNullable<Masal2Sayfa['soyle']>) {
    const w = kelimeBul(s.kelime);
    const hedef = aktifListe.find((d) => d.id === s.hedef);
    const dugmesi = yerler.find((x) => x.dataset.yer === s.hedef);
    if (!w || !hedef || !dugmesi) { kilit = false; parlat(true); return; }
    const sozcuk = sozcukGoster(s.kelime, hedef.kutu, true);
    goster([hedef.kutu]);
    if (!(await y.soyle('en/g-say-it'))) return;
    sozYeri.hidden = false;
    sozYeri.classList.add('ing-m2-soz-acik');
    await soylet(sozYeri, y, { beklenen: w.en, ornek: `en/w-${w.id}-yavas`, ipucu: ['en/g-listen', `en/w-${w.id}`] });
    sozYeri.classList.remove('ing-m2-soz-acik');
    sozYeri.hidden = true;
    sozYeri.replaceChildren();
    sozcuk.remove();
    if (!y.acik) return;
    kilit = false;
    await dokun(hedef, dugmesi, { sozluSoylendi: true });
  }

  /** Sürükle: katman parmakla taşınır; hedef kutuya bırakılınca yerine oturur ve `sonra` yeri canlanır */
  let surukleBekliyor = false;
  function surukleKur(s: NonNullable<Masal2Sayfa['surukle']>) {
    const el = katmanlar.get(s.nesne);
    const sonra = aktifListe.find((d) => d.id === s.sonra);
    if (!el || !sonra) { kilit = false; parlat(true); return; }
    surukleBekliyor = true;
    el.classList.add('ing-m2-tasinir');
    if (TEST_MODU) cerceve.dataset.tasi = `${s.hedef[0] + s.hedef[2] / 2},${s.hedef[1] + s.hedef[3] / 2}`;
    const hedefIsik = h('span.ing-m2-hedef', { 'aria-hidden': 'true' });
    Object.assign(hedefIsik.style, px(s.hedef));
    sahne.append(hedefIsik);
    let bas: { x: number; y: number; px: number; py: number } | null = null;
    const olcek = () => sahne.getBoundingClientRect().width / M2_TUVAL.en;
    el.addEventListener('pointerdown', (e) => {
      if (kilit) return;
      el.setPointerCapture(e.pointerId);
      bas = { x: e.clientX, y: e.clientY, px: 0, py: 0 };
      el.classList.add('ing-m2-tutuldu');
      ipucuKur(undefined);
    });
    el.addEventListener('pointermove', (e) => {
      if (!bas) return;
      const s2 = olcek();
      bas.px = (e.clientX - bas.x) / s2; bas.py = (e.clientY - bas.y) / s2;
      el.style.translate = `${bas.px}px ${bas.py}px`;
    });
    const birak = async () => {
      if (!bas) return;
      const k = sahne.querySelector<HTMLElement>(`[data-katman="${s.nesne}"]`)!;
      const kutu = [parseFloat(k.style.left) + bas.px, parseFloat(k.style.top) + bas.py, parseFloat(k.style.width), parseFloat(k.style.height)] as const;
      const o = { x: kutu[0] + kutu[2] / 2, y: kutu[1] + kutu[3] / 2 };
      bas = null;
      el.classList.remove('ing-m2-tutuldu');
      const icinde = o.x >= s.hedef[0] && o.x <= s.hedef[0] + s.hedef[2] && o.y >= s.hedef[1] && o.y <= s.hedef[1] + s.hedef[3];
      if (!icinde) { el.style.translate = ''; salla(el); ipucuKur(() => el, 3500); return; }
      // hedefe oturur: katmanın ortası hedefin ortasına kayar
      el.style.translate = `${s.hedef[0] + s.hedef[2] / 2 - (parseFloat(k.style.left) + kutu[2] / 2)}px ${s.hedef[1] + s.hedef[3] / 2 - (parseFloat(k.style.top) + kutu[3] / 2)}px`;
      el.classList.remove('ing-m2-tasinir');
      hedefIsik.remove();
      delete cerceve.dataset.tasi;
      const dugmesi = yerler.find((x) => x.dataset.yer === s.sonra)!;
      kilit = false;
      surukleBekliyor = false;
      await dokun(sonra, dugmesi, { surukleyle: true });
    };
    el.addEventListener('pointerup', () => void birak());
    el.addEventListener('pointercancel', () => { if (bas) { bas = null; el.style.translate = ''; el.classList.remove('ing-m2-tutuldu'); } });
    goster(etkilesimKutulari());
    kilit = false;
    ipucuKur(() => el, 3500);
  }

  /**
   * Tempo (22 Kasım, Barış: "boş bekleme yok"): ana dokunuşun sesi bitince sayfa kısa bir an sonra kendiliğinden çevrilir;
   * ileri düğmesi daha erken çevirmek isteyen çocuk için durur. Çocuk bu arada başka yere dokunursa süre yeniden başlar.
   * Test kipinde kapalı (testler düğmeyle çevirir).
   */
  let cevirmeNo = 0;
  function kendiliginden() {
    if (TEST_MODU) return;
    const benim = ++cevirmeNo, sayfaNo = no;
    // son sayfada "The end" hemen gelir (son karede uzun durulmaz)
    const ms = no + 1 < m.sayfalar.length ? KENDILIGINDEN_MS : 300;
    y.sonra(() => { if (benim === cevirmeNo && sayfaNo === no && anaTamam && !kilit) void sonraki(); }, ms);
  }

  async function sayfaGoster(ilk = false) {
    const s = sayfa();
    kilit = true; anaTamam = false; secBekliyor = null;
    akisBekle = null; akisKutulari = []; akisHedef = undefined; surukleBekliyor = false;
    evetHayirYeri.hidden = true; evetHayirYeri.replaceChildren();
    delete cerceve.dataset.yakala; delete cerceve.dataset.evethayir;
    cerceve.classList.remove('ing-m2-secim');
    ileri.hidden = true;
    parlat(false);
    sayac.replaceChildren(noktalar(m.sayfalar.length, no));
    // sayfa geçişi: yeni fon erirken kamera yeni sayfanın başlangıcına kayar; okunurken sonuna doğru süzülür
    if (!ilk || cizimAdi !== s.resim) cizimKoy(s.resim, 'cevir');
    katmanlariKur(s.katmanlar ?? []);
    yerleriKur(s.dokunuslar);
    sahne.querySelectorAll('.ing-m2-hedef, .ing-m2-sozcuk').forEach((x) => x.remove());
    kameraUygula(s.kamera?.bas ?? VARSAYILAN.bas, ilk ? 0 : KAMERA.sayfa);
    // okunurken yavaş kayma yalnız cümle sürüyorsa başlar (kısa cümlede etkileşimin kadrajını ezmesin)
    let okunuyor = true;
    y.sonra(() => { if (okunuyor && sayfa() === s) kameraUygula(kameraSon(s), KAMERA.okuma); }, ilk ? 60 : KAMERA.sayfa);
    onYukle([...Object.keys(s.sonraki ?? {}), ...(s.katmanlar ?? []).map((k) => k.resim), ...(m.sayfalar[no + 1] ? [m.sayfalar[no + 1].resim] : [])]);
    bant = cumleBandi({ id: `${m.ad}-${no + 1}`, en: s.en, tr: s.tr }, 'ing-kur-bant');
    bantYeri.replaceChildren(bant);
    harfleriYak(bant, 1600);
    const okundu = await y.soyle(s.ses);
    okunuyor = false;
    if (!okundu) return;
    // sırayla oynanan etkileşimler (v2): hepsi bitince sayfa biter
    if (s.etkilesimler?.length) {
      await akisOyna(s.etkilesimler);
      if (y.acik && sayfa() === s) sayfaBitti();
      return;
    }
    // sayfanın etkileşimi: seç, söyle, sürükle; yoksa kendiliğinden yer (son sayfa) ya da dokun
    if (s.sec) { await secSor(s.sec); return; }
    if (s.soyle) { await soyleSor(s.soyle); return; }
    if (s.surukle) { surukleKur(s.surukle); return; }
    if (await otoOynat(OTO_MS)) return;
    kilit = false;
    goster(etkilesimKutulari());
    parlat(true);
    ipucuKur(anaYer, 3500);
  }

  /** Sayfa çevrilir: sağ sayfa kâğıt sesiyle sırttan sola döner, arkasından yeni sayfanın katmanları kalkar */
  function sayfaCevir() {
    try { const ses = new Audio(KAGIT_SESI); ses.volume = 0.7; void ses.play().then(() => y.sonra(() => ses.pause(), 900)).catch(() => {}); } catch { /* ses yoksa sessiz */ }
    const yaprak = h('span.ing-m2-yaprak', { 'aria-hidden': 'true' });
    Object.assign(yaprak.style, { left: `${KITAP.x + 800}px`, top: `${KITAP.y + 55}px`, width: `${745}px`, height: `${955}px` });
    kamera.append(yaprak);
    y.sonra(() => yaprak.remove(), 800);
  }

  // köşe parmakla sola çekilince sayfa çevrilir (dokunmak da çevirir)
  {
    let bas: number | null = null;
    ileri.addEventListener('pointerdown', (e) => { bas = e.clientX; ileri.setPointerCapture(e.pointerId); });
    ileri.addEventListener('pointermove', (e) => {
      if (bas === null) return;
      const fark = Math.min(0, e.clientX - bas);
      ileri.style.setProperty('--cek', `${Math.min(1, -fark / 140)}`);
      if (fark < -70) { bas = null; ileri.style.removeProperty('--cek'); void sonraki(); }
    });
    const birak = () => { bas = null; ileri.style.removeProperty('--cek'); };
    ileri.addEventListener('pointerup', birak);
    ileri.addEventListener('pointercancel', birak);
  }

  async function sonraki() {
    if (kilit || !anaTamam) return;
    cevirmeNo++;
    ipucuKur(undefined);
    if (no + 1 < m.sayfalar.length) {
      // kamera kitabın tamamına çekilir, sayfa kitapta çevrilir (yakında kalırsa yaprak ekranı düz bir panel gibi örtüyordu)
      kilit = true;
      kameraUygula({ x: 800, y: 600, yakin: 1 }, 380);
      if (!(await y.dur(TEST_MODU ? 0 : 380))) return;
      sayfaCevir(); no++; void sayfaGoster(); return;
    }
    kilit = true;
    ileri.hidden = true;
    parlat(false);
    kutla(cerceve);
    void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-the-end'))) return;
    b.bitti();
  }

  b.tekrarla(tekrar);
  // giriş: ilk sayfa baştan görünür (ekran boş kalmasın), Ceren köşede tanıtır, sonra Polly anlatıcı olur
  cizimKoy(m.sayfalar[0].resim, 'cevir');
  katmanlariKur(m.sayfalar[0].katmanlar ?? []);
  kameraUygula(m.sayfalar[0].kamera?.bas ?? VARSAYILAN.bas, 0);
  sayac.replaceChildren(noktalar(m.sayfalar.length, 0));
  onYukle([m.sayfalar[1]?.resim].filter(Boolean) as string[]);
  void (async () => {
    // Ceren ilk resim ekranda belirince başlar (yavaş cihazda boş sahneye konuşmasın); en çok 1,5 sn beklenir
    const ilkResim = sahne.querySelector<HTMLImageElement>('img.ing-m2-resim');
    if (ilkResim && !TEST_MODU) await Promise.race([ilkResim.decode().catch(() => {}), y.dur(1500)]);
    if (!(await y.soyle(m.giris.id))) return;
    ceren.hidden = true;
    polly.hidden = false;
    anlatici.classList.add('ing-m2-polly');
    if (!(await y.soyle('en/g-story-time'))) return;
    void sayfaGoster(true);
  })();
  return () => { ipucuKur(undefined); boyGozcu?.disconnect(); ustSerit?.classList.remove('ing-ust-gecirgen'); y.kapat(); };
};
