// Paket Harf-A1 (23 Kasım; CLAUDE-ASTRA-MESAJLAR.md → "Paket Harf-A1"): Keşfet ve Hikâye Defteri'nin Astra kareleri.
// Her parça yalnız kendi kareleri tamsa açılır; gelmeyen kare için eski hâl (CSS hareketleri) sürer. Ceren'in göz ve tepki
// kareleri ayrı modülde (ceren-tepki.ts).
const tum = import.meta.glob<string>('../../assets/alfabe/{kesfet-hareket,kesfet-efekt,kitap,oyku-katman}/*.webp', { eager: true, query: '?url', import: 'default' });
const al = (klasor: string, ad: string): string | undefined => tum['../../assets/alfabe/' + klasor + '/' + ad + '.webp'];

/** Saf yardımcı (birim testi): adların hepsi varsa adres listesi, biri eksikse undefined. */
export function hepsiVarsa(adlar: readonly string[], bul: (ad: string) => string | undefined): string[] | undefined {
  const l = adlar.map(bul);
  return l.every(Boolean) ? (l as string[]) : undefined;
}

/** Keşfet: sözcüğün iki hareket karesi (kaynak resmin adı: ders "01", havuz "ari"). */
export const sozcukKareleri = (kaynak: string) => hepsiVarsa([kaynak + '-1', kaynak + '-2'], (ad) => al('kesfet-hareket', ad));
/** Kart kimliğinden kaynak resmin adı: "havuz-ari" → "ari", "01" → "01". */
export const kaynakAdi = (kartId: string) => kartId.replace(/^havuz-/, '');

/** Keşfet efektleri: dalga (harf sesi), yildiz (doğru), pof (yanlış). */
export const EFEKTLER = { dalga: ['dalga-0', 'dalga-1', 'dalga-2'], yildiz: ['yildiz-0', 'yildiz-1', 'yildiz-2'], pof: ['pof-0', 'pof-1'] } as const;
export const efektKareleri = (ad: keyof typeof EFEKTLER) => hepsiVarsa(EFEKTLER[ad], (a) => al('kesfet-efekt', a));
/** Keşfet harf tuşları (dokuz parça): dördü de varsa. */
export const tusKareleri = () => hepsiVarsa(['tus', 'tus-basili', 'tus-bulundu', 'tus-ipucu'], (a) => al('kesfet-efekt', a));

/** Hikâye Defteri kitap parçaları. */
export const kivrimKareleri = () => hepsiVarsa(['kivrim-0', 'kivrim-1', 'kivrim-2'], (a) => al('kitap', a));
export const kitapParcasi = (ad: 'kose' | 'ayrac' | 'kapak' | 'rozet' | 'kirpinti') => al('kitap', ad);

/**
 * Öykü sayfası katmanları: nesnesiz zemin ve dokununca hareket pozuna geçen bir ya da iki nesne (Paket Harf-A1 E ve
 * A1-ek: ikinci nesne "-b"). İkinci nesne geldiyse zemin iki nesnesiz çizilmiştir; ikincisinin kareleri eksikse yalnız
 * birincisi kullanılır (zemin dosyası da aynı ad).
 */
export const oykuKatmanlari = (sayfa: string) => {
  const l = hepsiVarsa([sayfa + '-zemin', sayfa + '-nesne', sayfa + '-nesne-2'], (a) => al('oyku-katman', a));
  if (!l) return undefined;
  const b = hepsiVarsa([sayfa + '-nesne-b', sayfa + '-nesne-b-2'], (a) => al('oyku-katman', a));
  return { zemin: l[0], nesneler: [{ dur: l[1], hareket: l[2] }, ...(b ? [{ dur: b[0], hareket: b[1] }] : [])] };
};

const azHareket = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Kare dizisini ekranın bir noktasında oynatır (sabit konumlu, tıklanmaz): her kare `kareMs` kadar, sonra kaybolur.
 * boy: karenin genişliği (px). Az hareket ayarında oynamaz.
 */
export function kareOynat(kareler: readonly string[], x: number, y: number, boy: number, kareMs = 90) {
  if (azHareket() || typeof document === 'undefined' || !kareler.length) return;
  const img = document.createElement('img');
  img.alt = ''; img.draggable = false; img.setAttribute('aria-hidden', 'true');
  Object.assign(img.style, { position: 'fixed', left: x + 'px', top: y + 'px', width: boy + 'px', height: 'auto', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: '2147482000' });
  document.body.append(img);
  kareler.forEach((k, i) => setTimeout(() => { img.src = k; }, i * kareMs));
  setTimeout(() => img.remove(), kareler.length * kareMs + 60);
}
/** Bir öğenin ortasında kare dizisi (öğe boyunun `oran` katı). */
export function ogedeOynat(el: Element | null | undefined, kareler: readonly string[] | undefined, oran = 1.4, kareMs = 90) {
  if (!el || !kareler) return;
  const r = el.getBoundingClientRect();
  if (!r.width) return;
  kareOynat(kareler, r.left + r.width / 2, r.top + r.height / 2, Math.max(r.width, r.height) * oran, kareMs);
}
