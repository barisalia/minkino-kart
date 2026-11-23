/**
 * Fon taşması (22 Kasım, yönetici: "sahne ekranı tam doldursun, kenarlar kesilmesin, uzatma çizimin kendi kenar
 * renkleriyle"). Oyun sahnesi (#sahne) 16:9 kalır; oyunun bütün koordinatları ona göre. 16:9 olmayan ekranda kalan
 * bantları sahnenin o anki fonu doldurur:
 * - Üst ve alt (iPad 4:3): fonun kendi kenar satırı uzar. Gökyüzü yukarı, çimen ve zemin aşağı devam eder. Kenar
 *   satırı koyu bir kontur çizgisiyse (en alttaki çerçeve çizgisi gibi) birkaç satır içeriden alınır.
 * - Sol ve sağ (geniş telefon): fonun kendi kenarı aynalanır (çiçek, çimen, duvar sürer; çizgi uzamaz).
 * Yeni çizim yok: yalnız fonun kendi pikselleri. Fon yoksa bantlar sahnenin zemin rengini alır.
 */
const SINIF = 'fon-tasma';
type Bantlar = { ust: HTMLElement; alt: HTMLElement; sol: HTMLElement; sag: HTMLElement };

/** Kenardan içeri en çok bu kadar satır aranır (kontur çizgisi 1–4 satır). */
const ICERI = 8;
/** Satırın bu oranından fazlası koyuysa (parlaklık < 70) kontur sayılır, bir içeri geçilir. */
const KONTUR_ORANI = 0.25;

/** Bir satırın (ya da sütunun) kontur olmadığı ilk konum: kenardan içeri doğru. */
export function konturAtla(koyuOrani: (i: number) => number, adet: number): number {
  for (let i = 0; i < Math.min(ICERI, adet); i++) if (koyuOrani(i) < KONTUR_ORANI) return i;
  return 0;
}

/**
 * Kenar satırındaki ince kontur çizgilerini (sap, yaprak kenarı, raf çizgisi) atar: her piksel, çevresindeki 2R+1 pikselin
 * parlaklıkça ortadaki pikselinin rengini alır (1B ortanca süzgeç). Genişliği R'den küçük koyu çizgiler kaybolur; çimen,
 * duvar, yaprak gibi geniş renk alanları ve sınırları kalır. Çıkan renkler satırın kendi renkleridir. Kenar satırı uzayınca
 * çizgiler aşağı ya da yukarı düz çizgi olarak akmaz (22 Kasım: kelebek çayırının köşelerinde akıyordu). Yarıçap fonun %3ü:
 * dar yaprak ve sap şeritleri de gider.
 */
export function cizgileriAt(rgba: Uint8ClampedArray, R: number): Uint8ClampedArray<ArrayBuffer> {
  const W = rgba.length / 4;
  const parlak = new Float32Array(W);
  for (let x = 0; x < W; x++) parlak[x] = rgba[x * 4] * 0.299 + rgba[x * 4 + 1] * 0.587 + rgba[x * 4 + 2] * 0.114;
  const cikti = new Uint8ClampedArray(new ArrayBuffer(rgba.length));
  const pencere: number[] = [];
  for (let x = 0; x < W; x++) {
    pencere.length = 0;
    for (let i = Math.max(0, x - R); i <= Math.min(W - 1, x + R); i++) pencere.push(i);
    pencere.sort((a, b) => parlak[a] - parlak[b]);
    const s = pencere[pencere.length >> 1];
    cikti.set(rgba.subarray(s * 4, s * 4 + 4), x * 4);
  }
  return cikti;
}

/**
 * Satırı yatayda yumuşatır (kayan ortalama, yarıçap R): ortanca süzgeçten kalan yaprak, sap gibi dar renk şeritleri
 * komşu renge yumuşakça karışır; bant uzayınca köşede keskin dikey bloklar kalmaz. Renkler satırın kendi renklerinin
 * ortalamasıdır; düz kenarda (gökyüzü, duvar, zemin) hiçbir şey değişmez.
 */
export function yumusat(rgba: Uint8ClampedArray, R: number): Uint8ClampedArray<ArrayBuffer> {
  const W = rgba.length / 4;
  const cikti = new Uint8ClampedArray(new ArrayBuffer(rgba.length));
  const top = [0, 0, 0, 0];
  let a = 0, b = -1;
  for (let x = 0; x < W; x++) {
    const ilk = Math.max(0, x - R), son = Math.min(W - 1, x + R);
    while (b < son) { b++; for (let k = 0; k < 4; k++) top[k] += rgba[b * 4 + k]; }
    while (a < ilk) { for (let k = 0; k < 4; k++) top[k] -= rgba[a * 4 + k]; a++; }
    const n = b - a + 1;
    for (let k = 0; k < 4; k++) cikti[x * 4 + k] = Math.round(top[k] / n);
  }
  return cikti;
}

const onbellek = new Map<string, { ust: string; alt: string }>();

/** Fonun üst ve alt kenar satırını 1 piksel yükseklikte PNG olarak verir (bant bunu boyuna uzatır). */
async function kenarSatirlari(adres: string): Promise<{ ust: string; alt: string } | null> {
  const hazir = onbellek.get(adres);
  if (hazir) return hazir;
  const img = new Image();
  img.decoding = 'async';
  img.src = adres;
  try { await img.decode(); } catch { return null; }
  const W = img.naturalWidth, H = img.naturalHeight;
  if (!W || !H) return null;
  const tuval = document.createElement('canvas');
  tuval.width = W;
  tuval.height = ICERI * 2;
  const c = tuval.getContext('2d', { willReadFrequently: true });
  if (!c) return null;
  // Üstten ve alttan ICERI satır.
  c.drawImage(img, 0, 0, W, ICERI, 0, 0, W, ICERI);
  c.drawImage(img, 0, H - ICERI, W, ICERI, 0, ICERI, W, ICERI);
  let veri: ImageData;
  try { veri = c.getImageData(0, 0, W, ICERI * 2); } catch { return null; }
  const koyu = (satir: number) => {
    let n = 0;
    for (let x = 0; x < W; x++) {
      const o = (satir * W + x) * 4;
      if ((veri.data[o] + veri.data[o + 1] + veri.data[o + 2]) / 3 < 70) n++;
    }
    return n / W;
  };
  const ustSatir = konturAtla((i) => koyu(i), ICERI);
  const altSatir = ICERI * 2 - 1 - konturAtla((i) => koyu(ICERI * 2 - 1 - i), ICERI);
  // Ortanca süzgeç yarıçapı fonun %3'ü (1672 px'te 50): kontur çizgileri (2–8 px) ve dar yaprak, sap şeritleri gider;
  // perde, duvar, zemin gibi geniş alanların sınırı keskin kalır. Ardından %0,4'lük (7 px) yumuşatma yalnız sınırları
  // pürüzsüzleştirir (22 Kasım: geniş ortalama perde kenarını bulanıklaştırıyordu).
  const R = Math.max(3, Math.round(W * 0.03)), Y = Math.max(2, Math.round(W * 0.004));
  const serit = (satir: number) => {
    const s = document.createElement('canvas');
    s.width = W;
    s.height = 1;
    const ham = veri.data.subarray(satir * W * 4, (satir + 1) * W * 4);
    s.getContext('2d')!.putImageData(new ImageData(yumusat(cizgileriAt(ham, R), Y), W, 1), 0, 0);
    return s.toDataURL('image/png');
  };
  const sonuc = { ust: serit(ustSatir), alt: serit(altSatir) };
  onbellek.set(adres, sonuc);
  return sonuc;
}

const sutunBellegi = new Map<string, { sol: string; sag: string }>();
/** Fonun sol ve sağ kenar sütunu, 1 piksel genişlikte (yan bant bunu enine uzatır; satırlarla aynı süzgeçler). */
async function kenarSutunlari(adres: string): Promise<{ sol: string; sag: string } | null> {
  const hazir = sutunBellegi.get(adres);
  if (hazir) return hazir;
  const img = new Image();
  img.src = adres;
  try { await img.decode(); } catch { return null; }
  const W = img.naturalWidth, H = img.naturalHeight;
  if (!W || !H) return null;
  const c = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!c) return null;
  c.canvas.width = 2;
  c.canvas.height = H;
  // Kenardan 2 piksel içerideki sütunlar (en dıştaki sütunda kenar yumuşatması olabilir).
  c.drawImage(img, 2, 0, 1, H, 0, 0, 1, H);
  c.drawImage(img, W - 3, 0, 1, H, 1, 0, 1, H);
  let veri: ImageData;
  try { veri = c.getImageData(0, 0, 2, H); } catch { return null; }
  const R = Math.max(3, Math.round(H * 0.03)), Y = Math.max(2, Math.round(H * 0.004));
  const serit = (s: number) => {
    const ham = new Uint8ClampedArray(H * 4);
    for (let y = 0; y < H; y++) ham.set(veri.data.subarray((y * 2 + s) * 4, (y * 2 + s) * 4 + 4), y * 4);
    const e = document.createElement('canvas');
    e.width = 1;
    e.height = H;
    e.getContext('2d')!.putImageData(new ImageData(yumusat(cizgileriAt(ham, R), Y), 1, H), 0, 0);
    return e.toDataURL('image/png');
  };
  const sonuc = { sol: serit(0), sag: serit(1) };
  sutunBellegi.set(adres, sonuc);
  return sonuc;
}

function adresi(bg: string): string | null {
  const m = /url\(["']?(.*?)["']?\)/.exec(bg);
  return m ? m[1] : null;
}

/**
 * Ceren'in ders ekranları (data-ekran="ceren", ceren-ders.css) zaten tam ekran: 16:9 sınıf alta oturur, üstte duvar
 * şeridi kalır. O şerit sabit bir renk yerine sınıf resminin kendi üst satırıyla dolar (body'deki --ders-ust değişkeni).
 */
function dersSeridi(sahne: HTMLElement) {
  let son = '';
  const bak = async () => {
    const img = sahne.dataset.ekran === 'ceren' ? sahne.querySelector<HTMLImageElement>('.cd-sinif') : null;
    const adres = img?.currentSrc || img?.src || '';
    if (adres === son) return;
    son = adres;
    if (!adres) { document.body.style.removeProperty('--ders-ust'); return; }
    const satirlar = await kenarSatirlari(adres);
    if (son !== adres) return;
    if (satirlar) document.body.style.setProperty('--ders-ust', 'url("' + satirlar.ust + '")');
  };
  new MutationObserver(() => void bak()).observe(sahne, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-ekran', 'src'] });
  void bak();
}

/**
 * Bantları kurar ve sahnenin fonunu izler. yanlar: 'ayna' (varsayılan; çiçek, perde sürer) ya da 'uzat' (kenar sütunu
 * enine uzar; kenarda kule, pencere gibi tek bir nesne olan fonlarda ikinci bir kopya görünmesin diye; Deneyler parkuru).
 */
export function fonTasmasiKur(sahne: HTMLElement, ayar: { yanlar?: 'ayna' | 'uzat' } = {}) {
  dersSeridi(sahne);
  const yap = (yon: string) => {
    const e = document.createElement('div');
    e.className = SINIF + ' ' + yon;
    e.setAttribute('aria-hidden', 'true');
    document.body.prepend(e);
    return e;
  };
  const b: Bantlar = { ust: yap('ust'), alt: yap('alt'), sol: yap('sol'), sag: yap('sag') };
  let sira = 0;
  const guncelle = async () => {
    const no = ++sira;
    const adres = adresi(sahne.style.backgroundImage || '');
    const zemin = getComputedStyle(sahne).backgroundColor;
    for (const e of Object.values(b)) e.style.backgroundColor = zemin;
    if (!adres) {
      for (const e of Object.values(b)) e.style.backgroundImage = 'none';
      return;
    }
    const uzat = ayar.yanlar === 'uzat';
    // Yanlar: aynada fonun kendisi (CSS'te scale -1 1); uzatmada kenar sütunu.
    if (!uzat) b.sol.style.backgroundImage = b.sag.style.backgroundImage = 'url("' + adres + '")';
    const [satirlar, sutunlar] = await Promise.all([kenarSatirlari(adres), uzat ? kenarSutunlari(adres) : null]);
    if (no !== sira) return;
    if (uzat) {
      for (const [e, s] of [[b.sol, sutunlar?.sol], [b.sag, sutunlar?.sag]] as const) {
        e.style.scale = '1';
        e.style.backgroundSize = '100% 100%';
        e.style.backgroundImage = s ? 'url("' + s + '")' : 'none';
      }
    }
    b.ust.style.backgroundImage = satirlar ? 'url("' + satirlar.ust + '")' : 'none';
    b.alt.style.backgroundImage = satirlar ? 'url("' + satirlar.alt + '")' : 'none';
  };
  new MutationObserver(() => void guncelle()).observe(sahne, { attributes: true, attributeFilter: ['style', 'data-ekran'] });
  void guncelle();
}
