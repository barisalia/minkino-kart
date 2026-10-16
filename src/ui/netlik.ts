/**
 * Netlik sınırı (Barış: "zoom yapma bunlara, netliği düşüyor"): hiçbir görsel kaynak çözünürlüğünün üstüne büyütülmez.
 * Ölçü: ekrandaki CSS boyu × DPR ≤ resmin doğal pikseli. DPR her cihazda 3 sayılır (asıl kitle telefon; kadraj her
 * cihazda aynı kalsın).
 *
 * Kameralar (Pati salonu, Pazar, Maceralar) yakınlaşmadan önce `netlikSiniri(katman)` ile katmanın en çok hangi ölçeğe
 * çıkabileceğini öğrenir: katmanın içindeki her raster resim (img, CSS arka plan resmi) ölçülür, en dar olanı sınırdır.
 * SVG ve kodla çizim sınırsızdır (her ölçekte keskin). Daha büyük çizim gelince sınır kendiliğinden genişler.
 */
export const NETLIK_DPR = 3;

const svgMi = (u: string) => /\.svg(\?|#|$)/i.test(u) || u.startsWith('data:image/svg');

/** Bir resmin doğal boyu (img'nin naturalWidth'i gibi; ilk soruda yüklenir, o ana kadar null) */
const boylar = new Map<string, [number, number] | null>();
export const dogalBoyu = (url: string) => dogalBoy(url);
function dogalBoy(url: string): [number, number] | null {
  if (boylar.has(url)) return boylar.get(url)!;
  boylar.set(url, null);
  const i = new Image();
  i.onload = () => boylar.set(url, [i.naturalWidth, i.naturalHeight]);
  i.src = url;
  if (i.complete && i.naturalWidth) boylar.set(url, [i.naturalWidth, i.naturalHeight]);
  return boylar.get(url)!;
}

/** Öğenin dönüşüm ölçeği (canlandırılan geçici ezilme-esneme sayılmaz) */
function donusum(e: Element): [number, number] {
  if (e.getAnimations?.().some((a) => a.playState === 'running')) return [1, 1];
  const cs = getComputedStyle(e);
  let sx = 1;
  let sy = 1;
  if (cs.transform && cs.transform !== 'none') {
    const m = new DOMMatrixReadOnly(cs.transform);
    sx *= Math.hypot(m.a, m.b);
    sy *= Math.hypot(m.c, m.d);
  }
  if (cs.scale && cs.scale !== 'none') {
    const p = cs.scale.split(/\s+/).map(parseFloat);
    sx *= Math.abs(p[0]);
    sy *= Math.abs(p[1] ?? p[0]);
  }
  return [sx, sy];
}

/** Katmanın ölçeği 1 iken bir resmin efektif ölçeği (görünen px × DPR / doğal px): ata zinciri katmanda durur */
function etkin(el: HTMLElement, katman: HTMLElement, gw: number, gh: number, nw: number, nh: number): number {
  let sx = 1;
  let sy = 1;
  for (let e: Element | null = el; e && e !== katman; e = e.parentElement) {
    const [a, b] = donusum(e);
    sx *= a;
    sy *= b;
  }
  // katmanın atalarının ölçeği (ör. sahneyi ekrana sığdıran ölçek) de sayılır
  for (let e: Element | null = katman.parentElement; e; e = e.parentElement) {
    const [a, b] = donusum(e);
    sx *= a;
    sy *= b;
  }
  return Math.max((gw * sx * NETLIK_DPR) / nw, (gh * sy * NETLIK_DPR) / nh);
}

/** Bir CSS arka plan katmanının görünen boyu (background-size) */
function arkaBoy(bs: string, bw: number, bh: number, nw: number, nh: number): [number, number] {
  if (bs === 'cover' || bs === 'contain') {
    const k = bs === 'cover' ? Math.max(bw / nw, bh / nh) : Math.min(bw / nw, bh / nh);
    return [nw * k, nh * k];
  }
  const p = bs.split(/\s+/);
  const deger = (t: string, ref: number) => (t.endsWith('%') ? (parseFloat(t) / 100) * ref : t === 'auto' ? null : parseFloat(t));
  let a = deger(p[0], bw);
  let b = deger(p[1] ?? 'auto', bh);
  if (a == null && b == null) [a, b] = [nw, nh];
  else if (a == null) a = (b! * nw) / nh;
  else if (b == null) b = (a * nh) / nw;
  return [a, b!];
}

/**
 * Katmanın (kameranın ölçeklediği öğe) netlik sınırı: katman en çok bu ölçeğe çıkabilir (ölçek 1 = dönüşümsüz).
 * Gizli (display:none) resimler sayılmaz; saydam olanlar sayılır (yakın çekimde belirebilir). Ölçülecek resim yoksa
 * Infinity. haric: sayılmayacak öğeler (ör. kameranın dışında tutulan arayüz).
 */
export function netlikSiniri(katman: HTMLElement, haric?: (el: Element) => boolean): number {
  let sinir = Infinity;
  const ogeler: Element[] = [katman, ...katman.querySelectorAll('*')];
  /** katmanın şu anki (canlandırılan dahil) ölçeği: SVG içindeki resimlerin ekran ölçeğinden çıkarılır */
  let katmanOlcek = 0;
  for (const el of ogeler) {
    if (haric?.(el)) continue;
    if (el instanceof SVGImageElement) {
      // SVG'ye gömülü raster parça (iskelet karakterlerin resim parçaları): ekran ölçeği CTM'den
      const u = el.href.baseVal;
      if (!u || svgMi(u)) continue;
      const d = dogalBoy(u);
      const m = el.getScreenCTM();
      if (!d || !m || (el.checkVisibility && !el.checkVisibility())) continue;
      if (!katmanOlcek) {
        const t = getComputedStyle(katman).transform;
        const km = t && t !== 'none' ? new DOMMatrixReadOnly(t) : null;
        katmanOlcek = km ? Math.hypot(km.a, km.b) || 1 : 1;
      }
      const w = (el.width.baseVal.value * Math.hypot(m.a, m.b)) / katmanOlcek;
      const hh = (el.height.baseVal.value * Math.hypot(m.c, m.d)) / katmanOlcek;
      if (!w || !hh) continue;
      const par = el.preserveAspectRatio.baseVal;
      // preserveAspectRatio: none → kutuya esner; slice → kaplar; meet (varsayılan) → sığar
      const e = par.align === 1 ? Math.max(w / d[0], hh / d[1]) : par.meetOrSlice === 2 ? Math.max(w / d[0], hh / d[1]) : Math.min(w / d[0], hh / d[1]);
      sinir = Math.min(sinir, 1 / (e * NETLIK_DPR));
      continue;
    }
    if (el instanceof HTMLImageElement) {
      const u = el.currentSrc || el.src;
      if (!u || svgMi(u) || !el.naturalWidth || !el.offsetWidth) continue;
      if (el.checkVisibility && !el.checkVisibility()) continue;
      const nw = el.naturalWidth;
      const nh = el.naturalHeight;
      const ow = el.offsetWidth;
      const oh = el.offsetHeight;
      let [gw, gh] = [ow, oh];
      const fit = getComputedStyle(el).objectFit;
      if (fit === 'contain' || fit === 'scale-down' || fit === 'cover') {
        let k = fit === 'cover' ? Math.max(ow / nw, oh / nh) : Math.min(ow / nw, oh / nh);
        if (fit === 'scale-down') k = Math.min(1, k);
        [gw, gh] = [nw * k, nh * k];
      } else if (fit === 'none') [gw, gh] = [nw, nh];
      sinir = Math.min(sinir, 1 / etkin(el, katman, gw, gh, nw, nh));
      continue;
    }
    if (!(el instanceof HTMLElement) || !el.offsetWidth) continue;
    const cs = getComputedStyle(el);
    const bi = cs.backgroundImage;
    if (!bi || !bi.includes('url(') || cs.display === 'none') continue;
    const urller = [...bi.matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1]);
    const ebatlar = cs.backgroundSize.split(',').map((x) => x.trim());
    urller.forEach((u, i) => {
      if (svgMi(u)) return;
      const d = dogalBoy(u);
      if (!d) return;
      const [gw, gh] = arkaBoy(ebatlar[i] ?? ebatlar[0], el.clientWidth || el.offsetWidth, el.clientHeight || el.offsetHeight, d[0], d[1]);
      sinir = Math.min(sinir, 1 / etkin(el, katman, gw, gh, d[0], d[1]));
    });
  }
  return sinir;
}

/** CSS arka plan resimlerinin doğal boylarını şimdiden öğrenir (ilk yakın çekimde sınır hazır olsun) */
export function netlikOnYukle(...urller: string[]) {
  for (const u of urller) if (u && !svgMi(u)) dogalBoy(u);
}

/**
 * İstenen yakınlığı netlik sınırına indirir; taban: yakınlaşmadan önceki ölçek (sınır onun altındaysa kamera
 * yakınlaşmaz ama uzaklaşmaz da). İstenen tabandan küçükse (geniş kadraja dönüş) dokunulmaz.
 */
export function netlikleSinirla(istenen: number, sinir: number, taban = 1): number {
  if (istenen <= taban) return istenen;
  return Math.max(taban, Math.min(istenen, sinir));
}
