// 2–3 yaş ikinci boyama: harf ikinci kez açılınca harfin yerine o harfle başlayan bir resim boyanır (yönetici, 20 Kasım;
// Astra Paket Harf-H11, assets/alfabe/boyama-resim/<dosya>.png). Çocuk büyük renk düğmelerinden birini seçer, resmin bir
// bölgesine dokunur; bölge dokunulan yerden dalga gibi dolar (kova, kova.ts). Büyük bölgelerin çoğu boyanınca Ceren över,
// "Devam et" görünür; çocuk isterse boyamayı sürdürür. Çizim gelmediyse harfin kendi boyaması oynar (main.ts).
import { TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { bosBekleyici } from './bos-bekle';
import { An, azHareket, isikSac, kabaGore } from './canlanma';
import { cerenYuzu } from './konusma-dersi';
import { BOYAMA_RESIMLERI } from './ikinci-tur-kurali';
import { turBitti } from './ikinci-tur';
import { bitisSayisi, bolgeBul, bolgeDizini, bolgele, bolgePikselleri, boya, buyukBolgeler, parlaklik, type BolgeDizini, type Bolgeler } from './kova';
import { oyunSesi } from './oyun-sesi';
import './boyama-resmi.css';

type Oku = (id: string, sonra?: () => void) => void;
const BOY = 1024;
const RENKLER: readonly [string, string, [number, number, number]][] = [
  ['Kırmızı', '#e8473d', [232, 71, 61]], ['Turuncu', '#f39a2b', [243, 154, 43]], ['Sarı', '#f7d23e', [247, 210, 62]],
  ['Yeşil', '#5cb85c', [92, 184, 92]], ['Mavi', '#3d8fe0', [61, 143, 224]], ['Mor', '#9064c8', [144, 100, 200]],
];
const resimler = import.meta.glob<string>('../../assets/alfabe/boyama-resim/*.png', { eager: true, query: '?url', import: 'default' });

// Bitiş anı (yönetici, 21 Kasım): boyama bitince resim kısa bir an kendi hareketiyle canlanır. Yeni çizim yok; boyanmış
// tuvalin kendisi hareket eder (dönüşüm noktası alt orta). İlk altı harf (1. ses grubu) kendi hareketini alır, öbürleri sevinçle zıplar.
type Kare = Keyframe[];
const zipla = (h: number, ez = .9): Kare => [{ transform: 'none' }, { transform: 'scale(1.06,' + ez + ')', offset: .15 },
  { transform: 'translateY(-' + h + '%) scale(.96,1.06)', offset: .45 }, { transform: 'scale(1.06,' + ez + ')', offset: .75 }, { transform: 'none' }];
const CANLANMA: Record<string, { kare: Kare; sure: number; tekrar?: number; koken?: string }> = {
  // Arı vızıldayarak havalanır, küçük bir yay çizip yerine konar.
  ari: { sure: 1500, koken: '50% 50%', kare: [{ transform: 'none' }, { transform: 'translate(2%,-6%) rotate(-6deg)', offset: .2 }, { transform: 'translate(-1%,-9%) rotate(5deg)', offset: .35 },
    { transform: 'translate(3%,-12%) rotate(-5deg)', offset: .5 }, { transform: 'translate(-2%,-8%) rotate(6deg)', offset: .65 }, { transform: 'translate(1%,-4%) rotate(-3deg)', offset: .82 }, { transform: 'none' }] },
  // Nilüfer suda hafifçe salınır.
  nilufer: { sure: 1600, kare: [{ transform: 'none' }, { transform: 'rotate(-4deg) translateY(-2%)', offset: .25 }, { transform: 'rotate(4deg) translateY(-1%)', offset: .6 }, { transform: 'none' }] },
  // Erik iki kez hoplar.
  erik: { sure: 700, tekrar: 2, kare: zipla(10) },
  // Tavşan büyük bir zıplayış yapar.
  tavsan: { sure: 1100, kare: [{ transform: 'none' }, { transform: 'scale(1.08,.86)', offset: .18 }, { transform: 'translateY(-18%) scale(.94,1.08)', offset: .5 },
    { transform: 'scale(1.08,.88)', offset: .82 }, { transform: 'none' }] },
  // Makara iki yana yuvarlanır gibi sallanıp hoplar (kare tuval tam dönerse köşeleri renk düğmelerine biner).
  iplik: { sure: 1300, kare: [{ transform: 'none' }, { transform: 'translateX(-4%) rotate(-8deg)', offset: .25 }, { transform: 'translate(3%,-8%) rotate(7deg)', offset: .55 },
    { transform: 'translateX(-1%) rotate(-3deg)', offset: .8 }, { transform: 'none' }] },
  // Lolipop sapından tutulmuş gibi sağa sola döner.
  lolipop: { sure: 1400, koken: '50% 92%', kare: [{ transform: 'none' }, { transform: 'rotate(-9deg)', offset: .25 }, { transform: 'rotate(8deg)', offset: .55 }, { transform: 'rotate(-4deg)', offset: .8 }, { transform: 'none' }] },
};
// Yardımcılar: sallan (kökten sağa sola), kay (yana gidip dön), yuksel (havalanıp in), nabiz (büyüyüp parlar gibi).
const sallan = (a: number): Kare => [{ transform: 'none' }, { transform: 'rotate(-' + a + 'deg)', offset: .25 }, { transform: 'rotate(' + a * .85 + 'deg)', offset: .55 },
  { transform: 'rotate(-' + a * .4 + 'deg)', offset: .8 }, { transform: 'none' }];
const kay = (x: number, egim = 0): Kare => [{ transform: 'none' }, { transform: 'translateX(' + x + '%) rotate(' + egim + 'deg)', offset: .35 },
  { transform: 'translateX(-' + x * .5 + '%) rotate(-' + egim * .5 + 'deg)', offset: .7 }, { transform: 'none' }];
const yuksel = (h: number): Kare => [{ transform: 'none' }, { transform: 'scale(1.04,.94)', offset: .12 }, { transform: 'translateY(-' + h + '%)', offset: .5 },
  { transform: 'translateY(-' + h * .9 + '%)', offset: .65 }, { transform: 'none' }];
const nabiz = (s: number, a = 0): Kare => [{ transform: 'none' }, { transform: 'scale(' + s + ') rotate(' + a + 'deg)', offset: .3 },
  { transform: 'scale(' + (1 + (s - 1) * .4) + ') rotate(-' + a * .5 + 'deg)', offset: .65 }, { transform: 'none' }];
Object.assign(CANLANMA, {
  balon: { sure: 1700, kare: yuksel(12) },                       // balon süzülerek yükselir
  ceket: { sure: 1300, koken: '50% 8%', kare: sallan(5) },       // askıdaki ceket sallanır
  cicek: { sure: 1500, kare: sallan(7) },                        // çiçek rüzgârda salınır
  dinozor: { sure: 1300, tekrar: 2, kare: zipla(5, .93) },       // dinozor iki adım tepinir
  fare: { sure: 1100, kare: kay(8, 3) },                         // fare koşturup döner
  gitar: { sure: 900, tekrar: 2, kare: sallan(4) },              // gitar tıngırdar gibi titrer
  agac: { sure: 1800, kare: sallan(4) },                         // ağaç dibinden salınır
  horoz: { sure: 1100, kare: [{ transform: 'none' }, { transform: 'translateY(-8%) rotate(-6deg)', offset: .35 }, { transform: 'translateY(-3%) rotate(4deg)', offset: .65 }, { transform: 'none' }] },
  irmak: { sure: 1600, kare: kay(3) },                           // ırmak dalgalanır
  jip: { sure: 1300, kare: [{ transform: 'none' }, { transform: 'translateX(6%) translateY(-2%)', offset: .25 }, { transform: 'translateX(9%)', offset: .45 },
    { transform: 'translateX(-3%) translateY(-2%)', offset: .75 }, { transform: 'none' }] },          // jip hoplayarak gidip gelir
  kus: { sure: 1300, kare: [{ transform: 'none' }, { transform: 'translateY(-10%) rotate(-5deg)', offset: .3 }, { transform: 'translateY(-6%) rotate(4deg)', offset: .55 },
    { transform: 'translateY(-9%) rotate(-3deg)', offset: .75 }, { transform: 'none' }] },             // kuş havalanır, kanat çırpar gibi
  maymun: { sure: 1500, koken: '50% 10%', kare: sallan(8) },     // maymun daldan sallanır
  okul: { sure: 900, kare: zipla(4, .95) },                      // okul neşeyle hoplar
  odul: { sure: 1300, koken: '50% 50%', kare: nabiz(1.08, 4) },  // ödül parıldar
  pasta: { sure: 1000, kare: [{ transform: 'none' }, { transform: 'scale(1.06,.92)', offset: .3 }, { transform: 'scale(.97,1.05)', offset: .6 }, { transform: 'none' }] },
  roket: { sure: 1600, kare: yuksel(16) },                       // roket kalkıp iner
  salyangoz: { sure: 1900, kare: kay(5) },                       // salyangoz ağır ağır kayar
  seker: { sure: 1200, koken: '50% 50%', kare: nabiz(1.06, 8) }, // şeker döner gibi parlar
  'ugur-bocegi': { sure: 1300, kare: kay(5, 5) },               // uğur böceği yürüyüp döner
  utu: { sure: 1300, kare: kay(7) },                             // ütü kayıp gelir
  valiz: { sure: 900, tekrar: 2, kare: zipla(5) },               // valiz iki kez hoplar
  yildiz: { sure: 1400, koken: '50% 50%', kare: nabiz(1.1, 10) },// yıldız ışıldar
  zebra: { sure: 700, tekrar: 2, kare: zipla(6) },               // zebra dörtnala hoplar
});
const SEVINC = { sure: 800, kare: zipla(7) };

/** Test kipinde, çizim gelene dek kova denenebilsin diye kalın konturlu yer tutucu (kodla resim değil, yer işareti). */
function yerTutucu(ad: string) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#fff"/>' +
    '<g fill="none" stroke="#000" stroke-width="18"><circle cx="512" cy="540" r="330"/><circle cx="512" cy="540" r="170"/>' +
    '<path d="M182 540H842M512 210V870"/></g><text x="512" y="110" text-anchor="middle" font-family="sans-serif" font-size="56" fill="#9a6a1c">' +
    ad + ' · Astra</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function resimAdresi(harf: string): string | undefined {
  const k = BOYAMA_RESIMLERI[harf];
  if (!k) return;
  return resimler['../../assets/alfabe/boyama-resim/' + k[0] + '.png'] ?? (TEST_MODU ? yerTutucu(k[0]) : undefined);
}
/** Bu harfin boyama resmi geldi mi (test kipinde hep var)? */
export const boyamaResmiHazir = (harf: string) => !!resimAdresi(harf);

export function boyamaResmiKur(alan: HTMLElement, ders: { id: string; upper: string }, oku: Oku, bitti: () => void): () => void {
  const [dosya, ad, ses] = BOYAMA_RESIMLERI[ders.id];
  const an = new An();
  let kapali = false, tamam = false, secili = 0, kare = 0;
  const kok = document.createElement('section');
  kok.className = 'br';
  kok.dataset.resim = dosya;
  kok.innerHTML = '<div class="br-ogretmen">' + cerenYuzu('br-ceren') + '</div><div class="br-kagit">' +
    '<button type="button" class="br-dinle at-ses" aria-label="Resmin adını dinle">' + IKON.hoparlor + '</button>' +
    '<canvas class="br-tuval" width="' + BOY + '" height="' + BOY + '" role="img" aria-label="' + ad + ' resmi. Boyamak için bir yere dokun."></canvas>' +
    '<div class="br-alt"><div class="br-renkler" role="radiogroup" aria-label="Renkler">' +
    RENKLER.map(([isim, hex], i) => '<button type="button" class="br-renk" role="radio" aria-checked="' + (i ? 'false' : 'true') +
      '" aria-label="' + isim + '" style="--renk:' + hex + '" data-renk="' + i + '"></button>').join('') + '</div>' +
    '<button type="button" class="at-basla br-ileri" hidden>Devam et ' + IKON.oyna + '</button></div></div>';
  alan.replaceChildren(kok);
  const tuval = kok.querySelector<HTMLCanvasElement>('.br-tuval')!, kagit = kok.querySelector<HTMLElement>('.br-kagit')!;
  const ileri = kok.querySelector<HTMLButtonElement>('.br-ileri')!;
  const c = tuval.getContext('2d', { willReadFrequently: true })!;
  const renkDugmeleri = [...kok.querySelectorAll<HTMLButtonElement>('.br-renk')];
  renkDugmeleri.forEach((d, i) => {
    d.onclick = () => {
      secili = i;
      renkDugmeleri.forEach((x, j) => x.setAttribute('aria-checked', String(j === i)));
      oyunSesi('kagit');
    };
  });
  ileri.onclick = () => { if (!kapali) bitti(); };
  const bos = bosBekleyici(() => { if (!kapali && !tamam) oku('boyama-resim-giris', () => bos.kur()); });
  kok.querySelector<HTMLButtonElement>('.br-dinle')!.onclick = () => { bos.dur(); oku(ses, () => bos.kur()); };

  let asil: Uint8ClampedArray | undefined, cikti: ImageData | undefined, bolgeler: Bolgeler | undefined, dizin: BolgeDizini | undefined;
  let buyuk = new Set<number>(), gerekli = 0;
  const boyanan = new Set<number>();
  const img = new Image();
  img.onload = () => {
    if (kapali) return;
    c.fillStyle = '#fff'; c.fillRect(0, 0, BOY, BOY);
    c.drawImage(img, 0, 0, BOY, BOY);
    cikti = c.getImageData(0, 0, BOY, BOY);
    asil = new Uint8ClampedArray(cikti.data);
    bolgeler = bolgele(parlaklik(asil), BOY, BOY);
    dizin = bolgeDizini(bolgeler);
    buyuk = new Set(buyukBolgeler(bolgeler, BOY * BOY));
    gerekli = bitisSayisi(buyuk.size);
    kok.dataset.hazir = '1';
    kok.dataset.gerekli = String(gerekli);
  };
  img.src = resimAdresi(ders.id)!;

  tuval.addEventListener('pointerdown', e => {
    if (kapali || !bolgeler || !asil || !cikti) return;
    e.preventDefault();
    bos.sifirla();
    const r = tuval.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * BOY, y = (e.clientY - r.top) / r.height * BOY;
    const no = bolgeBul(bolgeler, BOY, BOY, x, y, 22);
    if (!no) return;
    doldur(no, x, y, RENKLER[secili][2]);
  });

  function doldur(no: number, x: number, y: number, renk: [number, number, number]) {
    const { p, d } = bolgePikselleri(bolgeler!, BOY, BOY, no, x, y, dizin);
    if (!p.length) return;
    oyunSesi('damla');
    // Değişen piksellerin kutusu: her karede yalnız orası yazılır.
    let x0 = BOY, y0 = BOY, x1 = 0, y1 = 0;
    for (const i of p) { const px = i % BOY, py = (i - px) / BOY; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
    const yaz = () => c.putImageData(cikti!, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    const tamamla = () => {
      boyanan.add(no);
      kok.dataset.boyanan = String([...boyanan].filter(b => buyuk.has(b)).length);
      if (!tamam && gerekli && [...boyanan].filter(b => buyuk.has(b)).length >= gerekli) bitis();
    };
    if (azHareket()) { boya(cikti!.data, asil!, p, 0, p.length, renk); yaz(); tamamla(); return; }
    const enUzak = Math.sqrt(d[d.length - 1]), sure = Math.min(420, 160 + enUzak * 0.5), bas = performance.now();
    let k = 0;
    const adim = (simdi: number) => {
      if (kapali) return;
      const rr = (Math.min(1, (simdi - bas) / sure) * enUzak) ** 2;
      let son = k;
      while (son < p.length && d[son] <= rr) son++;
      if (son > k) { boya(cikti!.data, asil!, p, k, son, renk); k = son; yaz(); }
      if (k < p.length) kare = requestAnimationFrame(adim); else tamamla();
    };
    kare = requestAnimationFrame(adim);
  }

  function bitis() {
    tamam = true;
    kok.dataset.tamam = '1';
    turBitti('boya', ders.id);
    bos.kapat();
    oyunSesi('parilti');
    if (!azHareket() && cikti) {
      // Yalnız çizim hareket eder (21 Kasım, yönetici: tuvalin beyaz zemini de kayıp kâğıdın dışına taşıyordu).
      // Boyanmış resmin saydam bir kopyası (beyaz zemin saydam) tuvalin üstüne konur; asıl tuval o sırada gizlenir,
      // kopya kâğıdın içinde kırpılarak oynar (.br-kagit overflow: hidden), bitince kalkar, asıl tuval geri gelir.
      const c = CANLANMA[dosya] ?? SEVINC;
      const kat = document.createElement('canvas');
      kat.width = BOY; kat.height = BOY; kat.className = 'br-canli'; kat.setAttribute('aria-hidden', 'true');
      const veri = new ImageData(new Uint8ClampedArray(cikti.data), BOY, BOY);
      const d = veri.data;
      for (let i = 0; i < d.length; i += 4) if (d[i] > 238 && d[i + 1] > 238 && d[i + 2] > 238) d[i + 3] = 0;
      kat.getContext('2d')!.putImageData(veri, 0, 0);
      const r = kabaGore(kagit, tuval);
      Object.assign(kat.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px',
        transformOrigin: ('koken' in c && c.koken) || '50% 100%' });
      an.ekle(kagit, kat);
      tuval.style.visibility = 'hidden';
      kok.dataset.canlandi = dosya;
      an.hareket(kat, c.kare, { duration: c.sure, iterations: ('tekrar' in c && c.tekrar) || 1, easing: 'ease-in-out' }).finished
        .then(() => { tuval.style.visibility = ''; an.kaldir(kat); }, () => { tuval.style.visibility = ''; });
    }
    const t = kabaGore(kagit, tuval);
    isikSac(an, kagit, t.cx, t.cy, { adet: 10, uzaklik: t.w * 0.45, boy: Math.max(18, t.w * 0.06) });
    ileri.hidden = false;
    oku('boyama-resim-bitti', () => { if (!kapali) ileri.focus({ preventScroll: true }); });
  }

  oku(ses, () => { if (!kapali) oku('boyama-resim-giris', () => bos.kur()); });
  return () => { kapali = true; cancelAnimationFrame(kare); an.durdur(); bos.kapat(); tuval.style.visibility = ''; };
}
