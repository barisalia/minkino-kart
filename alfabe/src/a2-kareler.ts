// Paket Harf-A2 (yönetici 23 Kasım: "CSS nefesi yerine çizilmiş hareket"): Mıknatıslar, Hayvan çağır, Oku ve bul, Hece Evleri
// ve Yazma için Astra'nın çizdiği arayüz parçaları, tepki ve hareket kareleri. Kod hazır, kareler gelmeden hiçbir şey değişmez:
//  · a2-arayuz/   mıknatıs taşları, yuvaları, levha ve tepsi; Oku ve bul kartları (9 dilimli çerçeve, CSS border-image)
//  · yazma-efekt/ mürekkep damlası (vuruş bitince kalem ucunda)
//  · hece-evleri/ kapi-N-yari, kapi-N-acik (kapı açılırken iki kare; hece-evleri.ts kendi klasörüne bakar)
//  · hayvan-cagirma/hareket/<hayvan>-0…3 (harf-hayvan.ts), ceren-tepki/ kalem pozları (ceren-tepki.ts)
// Bir grubun karelerinin hepsi gelmeden o grup açılmaz (yarım takım ekranda karışık durur).
import { hepsiVarsa } from './a1-kareler';

const tum = import.meta.glob<string>('../../assets/alfabe/{a2-arayuz,yazma-efekt,hayvan-sakla}/*.webp', { eager: true, query: '?url', import: 'default' });
const al = (klasor: string, ad: string) => tum['../../assets/alfabe/' + klasor + '/' + ad + '.webp'];

/** Arayüz grupları: <html> öğesine a2-<grup> sınıfı ve her parça için --a2-<ad> değişkeni (kalite.css kullanır). */
export const ARAYUZ = {
  miknatis: ['mik-tas', 'mik-tas-alindi', 'mik-tas-ipucu', 'mik-yuva', 'mik-yuva-sirada', 'mik-yuva-dolu', 'mik-levha', 'mik-tepsi'],
  okubul: ['okubul-kart', 'okubul-kart-dogru', 'okubul-kart-yanlis', 'okubul-kart-soluk'],
} as const;
export type ArayuzGrubu = keyof typeof ARAYUZ;

/** Saf karar (birim testi): grubun bütün parçaları varsa adresleri, yoksa undefined. */
export const arayuzKareleri = (grup: ArayuzGrubu, bul: (ad: string) => string | undefined = (a) => al('a2-arayuz', a)) => hepsiVarsa(ARAYUZ[grup], bul);

/** Gelen grupları sayfaya bağlar (bir kez; kareler yoksa hiçbir şey yapmaz). */
export function arayuzuKur(kok: HTMLElement | undefined = typeof document === 'undefined' ? undefined : document.documentElement) {
  if (!kok) return;
  for (const grup of Object.keys(ARAYUZ) as ArayuzGrubu[]) {
    const urls = arayuzKareleri(grup);
    if (!urls) continue;
    ARAYUZ[grup].forEach((ad, i) => kok.style.setProperty('--a2-' + ad, 'url("' + urls[i] + '")'));
    kok.classList.add('a2-' + grup);
  }
}

export const YAZMA_EFEKT = ['murekkep-0', 'murekkep-1', 'murekkep-2'] as const;
/** Vuruş bitince kalem ucunda mürekkep damlası (üç kare). */
export const yazmaEfekti = () => hepsiVarsa(YAZMA_EFEKT, (a) => al('yazma-efekt', a));

/** Paket Harf-A2-ek · Hayvan çağır: hayvanın saklandığı yer (yaşam alanına göre) kıpırdar; üç kare (-0 durgun, -1, -2). */
export const SAKLANMA_YERLERI = ['orman', 'deniz', 'buz', 'kiyi'] as const;
export const saklanmaKareleri = (mekan: string) => hepsiVarsa([0, 1, 2].map((i) => mekan + '-' + i), (a) => al('hayvan-sakla', a));

/** Hece Evleri kapısının açılış kareleri (n: 1–8). */
export const kapiKareAdlari = (n: number) => ['kapi-' + n + '-yari', 'kapi-' + n + '-acik'] as const;
