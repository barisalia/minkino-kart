// Matematik · Paket Matematik-A1 kareleri (yönetici 23 Kasım gecesi, KALITE-KURALLARI madde 0: "çizilmiş hareket gereken yerde
// tek resim ve CSS kaydırma olmasın"). Astra'nın kareleri kendi resminin klasörüne, AYNI TUVALDE ve aynı yerde gelir; ad kuralı:
//  · <ad>-goz      göz kırpma karesi (karakterin bekleme pozu, gözler kapalı): 2,6–5,4 sn'de bir 0,15 sn görünür;
//  · <ad>-sevinc   doğru cevapta 1,1 sn (sevinç), <ad>-saskin yanlışta 1,1 sn (komik şaşkınlık; ceza yok);
//  · <ad>-hop-0…2  dokununca bir kez oynayan hareket kareleri (sayılan nesne zıplar, rakam sevinir);
//  · <ad>-bos-0…1  boşta dönen kıpırtı (balon salınır, bayrak dalgalanır, oyuncak nefes alır).
// Bağlama: sahneye giren her <img>'nin kaynağı adına çözülür; o ada kare varsa resmin yalnız kaynağı (src) o an değişir, sonra
// geri döner (yer, ölçü, CSS hareketleri bozulmaz). Kareler önceden çözülür (ilk gösterimde takılma yok). Kare yoksa hiçbir şey
// değişmez. Doğru ve yanlış sinyali: document üstünde 'matematik-tepki' olayı (detail: 'dogru' | 'yanlis'); main.ts ve dersler yayar.
const tum = import.meta.glob<string>('../../assets/matematik/**/*.webp', { eager: true, query: '?url', import: 'default' });
const ONEK = '../../assets/matematik/';
const urldenAd = new Map<string, string>();
const addanUrl = new Map<string, string>();
for (const [yol, url] of Object.entries(tum)) {
  const ad = yol.slice(ONEK.length, -'.webp'.length);
  urldenAd.set(url, ad);
  addanUrl.set(ad, url);
}
export const kareVar = (ad: string) => addanUrl.has(ad);
const dizi = (ad: string, n: number) => {
  const a = Array.from({ length: n }, (_, i) => addanUrl.get(ad + '-' + i));
  return a.every(Boolean) ? (a as string[]) : [];
};
/** Bir resim adının A1 kareleri (birim testi ve brief denetimi de bunu kullanır). */
export function kareleri(ad: string) {
  return {
    goz: addanUrl.get(ad + '-goz'), sevinc: addanUrl.get(ad + '-sevinc'), saskin: addanUrl.get(ad + '-saskin'),
    hop: dizi(ad + '-hop', 3), bos: dizi(ad + '-bos', 2),
  };
}

type Bag = ReturnType<typeof kareleri> & { img: HTMLImageElement; asil?: string; oncelik: number; saat: number; bosI: number; sonraKirp: number };
const baglar = new Set<Bag>();
const bagli = new WeakSet<HTMLImageElement>();
const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const gorunur = (img: HTMLImageElement) => img.isConnected && img.offsetParent !== null && getComputedStyle(img).visibility !== 'hidden';
const bizim = (b: Bag, src: string | null) => !!src && [b.goz, b.sevinc, b.saskin, ...b.hop, ...b.bos].includes(src);

/** Resmi bir an `url` karesine çevirir; öncelik daha yüksek bir kare oynuyorsa beklemez, vazgeçer. */
function goster(b: Bag, url: string, ms: number, oncelik: number) {
  if (b.oncelik > oncelik) return false;
  const simdi = b.img.getAttribute('src');
  if (!bizim(b, simdi)) b.asil = simdi ?? undefined;
  b.img.src = url;
  b.oncelik = oncelik;
  clearTimeout(b.saat);
  b.saat = window.setTimeout(() => geriAl(b), ms);
  return true;
}
function geriAl(b: Bag) {
  // Oyun bu arada resmi kendisi değiştirdiyse (başka poz) dokunma.
  if (b.asil && bizim(b, b.img.getAttribute('src'))) b.img.src = b.asil;
  b.asil = undefined;
  b.oncelik = 0;
}
function sirala(b: Bag, kareler: string[], ms: number, oncelik: number) {
  kareler.forEach((u, i) => setTimeout(() => goster(b, u, ms + 40, oncelik), i * ms));
}

function bagla(img: HTMLImageElement) {
  if (bagli.has(img)) return;
  bagli.add(img);
  const ad = urldenAd.get(img.getAttribute('src') ?? '');
  if (!ad) return;
  const k = kareleri(ad);
  if (!k.goz && !k.sevinc && !k.saskin && !k.hop.length && !k.bos.length) return;
  const b: Bag = { ...k, img, oncelik: 0, saat: 0, bosI: 0, sonraKirp: performance.now() + 1500 + Math.random() * 3000 };
  baglar.add(b);
  // Önceden çöz: kare ilk kez gösterilirken takılmasın.
  for (const u of [k.goz, k.sevinc, k.saskin, ...k.hop, ...k.bos]) if (u) { const on = new Image(); on.src = u; void on.decode?.().catch(() => undefined); }
  if (k.hop.length) {
    const hedef = img.closest<HTMLElement>('button, [role="button"]') ?? img;
    hedef.addEventListener('pointerdown', () => { if (!azHareket()) sirala(b, b.hop, 90, 3); }, { passive: true });
  }
}
function tara(kok: ParentNode) {
  if (kok instanceof HTMLImageElement) bagla(kok);
  kok.querySelectorAll?.('img').forEach((i) => bagla(i));
}

/** Doğru ve yanlış: görünen karakterler tepki verir. */
export function tepkiYay(tur: 'dogru' | 'yanlis') {
  document.dispatchEvent(new CustomEvent('matematik-tepki', { detail: tur }));
}
let kuruldu = false;
export function a1KareleriniKur() {
  if (kuruldu || typeof document === 'undefined') return;
  kuruldu = true;
  tara(document);
  new MutationObserver((l) => { for (const m of l) m.addedNodes.forEach((n) => { if (n.nodeType === 1) tara(n as Element); }); })
    .observe(document.body, { childList: true, subtree: true });
  document.addEventListener('matematik-tepki', (e) => {
    const tur = (e as CustomEvent<'dogru' | 'yanlis'>).detail;
    for (const b of baglar) {
      const u = tur === 'dogru' ? b.sevinc : b.saskin;
      // Küçük resimler (dersin rakam sırası gibi) tepki vermez; yalnız sahnedeki iri karakterler ve nesneler.
      if (u && gorunur(b.img) && b.img.getBoundingClientRect().width >= 70) goster(b, u, 1100, 4);
    }
  });
  // Saat: göz kırpma ve boştaki kıpırtı (bağlı resim yoksa hiçbir şey yapmaz).
  setInterval(() => {
    if (document.hidden) return;
    const simdi = performance.now();
    for (const b of baglar) {
      if (!b.img.isConnected) { baglar.delete(b); continue; }
      if (!gorunur(b.img)) continue;
      if (b.goz && simdi >= b.sonraKirp) {
        b.sonraKirp = simdi + 2600 + Math.random() * 2800;
        goster(b, b.goz, 150, 2);
      } else if (b.bos.length && !azHareket() && b.oncelik <= 1) {
        // taban → bos-0 → bos-1 → bos-0 → taban …
        const sira = [b.bos[0], b.bos[1], b.bos[0]];
        if (b.bosI < sira.length) goster(b, sira[b.bosI], 340, 1);
        b.bosI = (b.bosI + 1) % (sira.length + 1);
      }
    }
  }, 320);
}
