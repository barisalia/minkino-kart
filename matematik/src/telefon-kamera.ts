// Matematik · telefon kamerası (Matematik denetimi 23 Kasım; yönetici: "telefonda oyun alanı en az %60"; KALITE-KURALLARI 8
// "ekran dolu ve iri olsun"). Turlar ve tezgâh 16:9 bir sahnedir; yatay telefonda (geniş ekran) sahnenin içeriği ekranın
// yalnız %30–41'ini dolduruyordu. Kamera her ekranda dokunulan parçaların ve karakterlerin kapladığı kutuyu ölçer ve sahnenin
// KENDİSİNİ (transform değil, gerçek ölçü: sürükleme ve dokunma 1:1 kalır, cqw yazıları birlikte büyür) bu kutu ekranı dolduracak
// kadar büyütüp kaydırır. Kutu hiç kırpılmaz; yalnız fonun kenarları ekran dışında kalır. Üst düğmeler ekranın köşesinde durur
// (üstte 64 px'lik şerit onlara ayrılır). iPad'de ve dikeyde hiçbir şey değişmez; Ceren'in derslerinin kendi dünyası var.
const EKRANLAR = new Set(['oyun', 'kule', 'menu', 'tangram', 'son']);
const telefon = () => matchMedia('(orientation: landscape) and (max-height: 500px)').matches;
/** Ekranın üstünde üst düğmelere ayrılan şerit, yanlarda ve altta pay (px). */
const UST = 60, YAN = 3, ALT = 3;
/** En çok büyütme (fonun anlamı kaybolmasın). */
const EN_COK = 1.75;

/** Saf hesap (birim testi): içerik kutusu (sahneye göre 0–1 kesirler) ve ekran ölçüsünden sahnenin yeni genişliği ve yeri. */
export function kameraHesabi(
  k: { x0: number; y0: number; x1: number; y1: number }, W: number, H: number,
  /** Parçaların kendi kutuları (sahne kesri): verilirse köşe çakışması kutu yerine parça parça denetlenir. */
  parcalar?: readonly { x0: number; y0: number; x1: number; y1: number }[],
) {
  // Üst düğmeler yalnız iki köşede (64 px + pay). İçerik şeritsiz yerleşimde köşelere değmiyorsa şerit ayrılmaz: kamera
  // ekranın bütün boyunu kullanır, daha çok büyür.
  const seritsiz = hesapla(k, W, H, false);
  if (seritsiz) {
    const sh = (seritsiz.w * 9) / 16;
    const koseyeDeger = (p: { x0: number; y0: number; x1: number; y1: number }) => {
      const L = seritsiz.x + p.x0 * seritsiz.w, R = seritsiz.x + p.x1 * seritsiz.w, T = seritsiz.y + p.y0 * sh;
      return T < UST && (L < KOSE || R > W - KOSE);
    };
    if (!(parcalar ? parcalar.some(koseyeDeger) : koseyeDeger(k))) return seritsiz;
  }
  return hesapla(k, W, H, true);
}
/** Karakter pozlarının dosya adı (fon resimleri hariç: oda, mutfak). */
const KARAKTER = /\/(kino|lokum|zipzip|mino|bulut|dede|anne|baba|babaanne|ceren)-(?!odasi|mutfag)[^/]*$/;
/** Köşe düğmesinin kapladığı en (px; düğme 64 px, kenardan pay). */
const KOSE = 84;
function hesapla(k: { x0: number; y0: number; x1: number; y1: number }, W: number, H: number, serit: boolean) {
  const taban = Math.min(W, (H * 16) / 9);
  const kw = Math.max(0.05, k.x1 - k.x0), kh = Math.max(0.05, k.y1 - k.y0);
  const enW = W - 2 * YAN;
  // Önce üstte düğme şeridi bırakılır; içerik o zaman sığmıyorsa şeritsiz (düğmeler köşede, içerik ortada).
  let enH = serit ? H - UST - ALT : H - 2 * ALT, ust = serit ? UST : ALT;
  let sw = Math.min(enW / kw, (enH / kh) * (16 / 9));
  if (serit && sw < W) { enH = H - 2 * ALT; ust = ALT; sw = Math.min(enW / kw, (enH / kh) * (16 / 9)); }
  sw = Math.min(sw, taban * EN_COK);
  // Kamera açıksa sahne ekran genişliğini her zaman örter (yanlarda boş bant kalmaz); içerik o ölçüde sığmıyorsa kamera yok.
  if (sw < W) {
    // Kenar payı bu durumda 1 px'e iner: içerik ekranın boyunu neredeyse doldurur ama hiç kırpılmaz.
    if (kh * ((W * 9) / 16) > H - 2) return null;
    sw = W;
  }
  if (sw < taban * 1.04) return null;
  const sh = (sw * 9) / 16;
  const sinir = (v: number, alt: number, ustSinir: number) => Math.max(alt, Math.min(ustSinir, v));
  const x = sinir(W / 2 - (sw * (k.x0 + k.x1)) / 2, W - sw, 0);
  const y = sinir(ust + enH / 2 - (sh * (k.y0 + k.y1)) / 2, H - sh, 0);
  return { w: sw, x, y };
}

/** Bir kutunun sahne kutusu içinde kalan kısmı (sahnenin dışına taşan kısım ne kamerayı ne ölçüyü ilgilendirir). */
function sahneyeKirp(q: DOMRect, s: DOMRect) {
  const l = Math.max(q.left, s.left), t = Math.max(q.top, s.top), r = Math.min(q.right, s.right), b = Math.min(q.bottom, s.bottom);
  return { l, t, r, b, pay: r > l && b > t ? ((r - l) * (b - t)) / Math.max(1, q.width * q.height) : 0 };
}

/** Resmin opak (görünen) kısmının tuvaldeki oranı; kaynak başına bir kez ölçülür. Pozların saydam payı (Lokum'un kâsedeki pozunun
 *  üst %42'si boş) kamerayı gereksiz uzaklaştırmasın. */
const opakOran = new Map<string, readonly [number, number, number, number] | null>();
export function opakKutu(e: Element): { left: number; top: number; right: number; bottom: number } {
  const q = e.getBoundingClientRect();
  if (!(e instanceof HTMLImageElement) || !e.complete || !e.naturalWidth) return q;
  const src = e.currentSrc || e.src;
  let o = opakOran.get(src);
  if (o === undefined) {
    o = null;
    try {
      const N = 48, c = document.createElement('canvas');
      c.width = c.height = N;
      const x = c.getContext('2d', { willReadFrequently: true })!;
      x.drawImage(e, 0, 0, N, N);
      const v = x.getImageData(0, 0, N, N).data;
      let a = N, b = N, cc = -1, dd = -1;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (v[(j * N + i) * 4 + 3] > 24) { a = Math.min(a, i); b = Math.min(b, j); cc = Math.max(cc, i); dd = Math.max(dd, j); }
      if (cc >= 0) o = [a / N, b / N, (cc + 1) / N, (dd + 1) / N] as const;
    } catch { o = null; }
    opakOran.set(src, o);
  }
  if (!o) return q;
  const st = getComputedStyle(e);
  let L = q.left, T = q.top, w = q.width, h = q.height;
  if (st.objectFit === 'contain') {
    const k = Math.min(q.width / e.naturalWidth, q.height / e.naturalHeight);
    w = e.naturalWidth * k; h = e.naturalHeight * k;
    const [px, py] = st.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    L += (q.width - w) * (Number.isFinite(px) ? px : 0.5); T += (q.height - h) * (Number.isFinite(py) ? py : 0.5);
  }
  return { left: L + w * o[0], top: T + h * o[1], right: L + w * o[2], bottom: T + h * o[3] };
}

export function telefonKamerasiKur(kok: HTMLElement) {
  // Parmak ekrandayken (sürükleme) kamera kımıldamaz; bekleyen ölçü parmak kalkınca yapılır.
  let saat = 0, basili = false, bekleyen = false, sonDeger = '';
  addEventListener('pointerdown', () => { basili = true; }, { capture: true });
  const birak = () => { basili = false; if (bekleyen) { bekleyen = false; planla(300); } };
  addEventListener('pointerup', birak, { capture: true });
  addEventListener('pointercancel', birak, { capture: true });
  function kapat() {
    if (!kok.classList.contains('tk-acik')) return;
    kok.classList.remove('tk-acik');
    for (const v of ['--tk-x', '--tk-y', '--tk-w']) kok.style.removeProperty(v);
    sonDeger = '';
  }
  function olc(zorla = false) {
    if (basili) { bekleyen = true; return; }
    if (!telefon() || !EKRANLAR.has(kok.dataset.ekran ?? '')) { kapat(); return; }
    const r = kok.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const alan = r.width * r.height;
    const gor = (e: Element) => {
      const q = e.getBoundingClientRect(), c = getComputedStyle(e);
      return q.width > 4 && q.height > 4 && q.width * q.height < 0.7 * alan && c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.05;
    };
    // Görünen her şey kutuda: resimler, düğmeler, oyuncak adları ve boyalı kutular (perde, pano, kart; içi boş olsa da).
    // Fonda çizili oyun yeri (kaydırak, fırın) görünmez bir .tk-alan kutusuyla bildirilir; o da kutudadır.
    // Ekrana sabit üst düğmeler ve ilerleme noktaları kutuya girmez.
    const boyali = (e: Element) => {
      const c = getComputedStyle(e);
      return c.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor) || parseFloat(c.borderTopWidth) > 0;
    };
    // Yazı da oyunun parçası: panodaki soru sayısı, levha yazısı (kendi metni olan öğe).
    const yazili = (e: Element) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
    const parcalar = [...kok.querySelectorAll('img, svg, canvas, button, [role="button"], .oyuncak-adi, .tk-alan'), ...[...kok.querySelectorAll(':scope > *, :scope > * > *, :scope > * > * > *')].filter(boyali), ...[...kok.querySelectorAll('*')].filter(yazili)]
      .filter((e) => !e.closest('.nav, .buyukler, .ilerleme, .cila-efekt, .cila-parilti, .cila-isik, svg svg') && !(e.tagName === 'svg' && e.closest('button')))
      .filter(gor)
      // Yarısından çoğu sahnenin dışında olan parça sahneden çıkıyor ya da giriyor (kaydıraktan kayıp giden arkadaş): kutuya girmez.
      .filter((e) => sahneyeKirp(e.getBoundingClientRect(), r).pay >= 0.5);
    if (!parcalar.length) { kapat(); return; }
    let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
    const kesirler = parcalar.map((e) => {
      const q = opakKutu(e);
      const p = { x0: (q.left - r.left) / r.width, y0: (q.top - r.top) / r.height, x1: (q.right - r.left) / r.width, y1: (q.bottom - r.top) / r.height };
      // Sahnenin alt ya da üst kenarına değen karakter pozu (ayakları sahne tabanında) zaten kadrajla kesilmiş bir figürdür:
      // o kenarı en çok sahne boyunun %8'i kadar ekran dışında kalabilir. Sayılan nesne ve düğme hiç kırpılmaz.
      if (e.tagName === 'IMG' && KARAKTER.test((e as HTMLImageElement).src) && !e.closest('button')) {
        if (p.y1 > 0.96) p.y1 = Math.max(p.y0, p.y1 - 0.08);
        if (p.y0 < 0.04) p.y0 = Math.min(p.y1, p.y0 + 0.08);
      }
      x0 = Math.min(x0, p.x0); y0 = Math.min(y0, p.y0); x1 = Math.max(x1, p.x1); y1 = Math.max(y1, p.y1);
      return p;
    });
    const k = { x0: Math.max(0, x0), y0: Math.max(0, y0), x1: Math.min(1, x1), y1: Math.min(1, y1) };
    const h = kameraHesabi(k, innerWidth, innerHeight, kesirler);
    if (!h) { kapat(); return; }
    const deger = [h.w, h.x, h.y].map((v) => Math.round(v)).join(',');
    if (deger === sonDeger) return;
    // Nefes alan bir pozun bir iki piksellik oynaması kamerayı pompalatmaz: fark %2'nin ve 10 px'in altındaysa yerinde kalır.
    if (!zorla && sonDeger && kok.classList.contains('tk-acik')) {
      const [w0, x0, y0] = sonDeger.split(',').map(Number);
      if (Math.abs(h.w - w0) < w0 * 0.02 && Math.abs(h.x - x0) < 10 && Math.abs(h.y - y0) < 10) return;
    }
    sonDeger = deger;
    kok.style.setProperty('--tk-w', Math.round(h.w) + 'px');
    kok.style.setProperty('--tk-x', Math.round(h.x) + 'px');
    kok.style.setProperty('--tk-y', Math.round(h.y) + 'px');
    kok.classList.add('tk-acik');
  }
  function planla(ms = 220, zorla = false) {
    clearTimeout(saat);
    saat = window.setTimeout(() => olc(zorla), ms);
  }
  // Yeni ekran (temiz → replaceChildren) ve ekran türü değişince; parçalar yerine oturunca bir kez daha.
  new MutationObserver((l) => {
    if (l.some((m) => m.type === 'attributes' || [...m.addedNodes].some((n) => n.nodeType === 1 && !(n as Element).matches('.cila-parilti, .cila-efekt, i')))) {
      // İlk ölçü hemen (yeni ekranın ilk karesi kırpık ya da küçük görünmesin), sonra parçalar yerine oturunca iki kez daha.
      planla(16); setTimeout(() => planla(), 260); setTimeout(() => planla(), 700);
    }
  }).observe(kok, { childList: true, attributes: true, attributeFilter: ['data-ekran'] });
  addEventListener('resize', () => { sonDeger = ''; planla(120); });
  // Tur sürerken parça büyür ya da yeni poz gelirse: görünen bir resim ya da düğme ekran dışına taşıyorsa kamera yeniden ölçer
  // (uzaklaşır). Her şey ekrandaysa dokunmaz: tur sırasında kamera yaklaşıp zıplamaz.
  setInterval(() => {
    if (basili || document.hidden || !kok.classList.contains('tk-acik')) return;
    const W = innerWidth, H = innerHeight, s = kok.getBoundingClientRect();
    const tasan = [...kok.querySelectorAll('img, button, [role="button"], strong')].some((e) => {
      if (e.closest('.nav, .buyukler, .ilerleme')) return false;
      const ham = e.getBoundingClientRect();
      if (ham.width < 4 || ham.height < 4) return false;
      const c = getComputedStyle(e);
      if (c.visibility === 'hidden' || +c.opacity < 0.05) return false;
      const o = opakKutu(e);
      const q = new DOMRect(o.left, o.top, o.right - o.left, o.bottom - o.top);
      // Sahnenin kendi kenarından taşan kısım (pozun saydam payı, sahneden çıkan arkadaş) kamerayla düzelmez; sayılmaz.
      const k = sahneyeKirp(q, s);
      if (k.pay < 0.5) return false;
      return k.l < -6 || k.t < -6 || k.r > W + 6 || k.b > H + 6;
    });
    if (tasan) planla(0, true);
  }, 1200);
  planla();
}
