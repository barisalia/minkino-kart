// Sözcük havuzu (yol haritası madde 6, Astra Harf-H6): her harfe yeni resimli sözcükler. Liste ve Ceren'in kayıtları
// ayrı oturumda hazırlandı: ekip/alfabe/sozcuk-havuzu.json (57 sözcük; test: tests/unit/alfabe-sozcuk-havuzu.test.ts).
// - Bir sözcük yalnız resmi gelince oyunda görünür (resimsiz sözcük gösterilmez): assets/alfabe/kelime/<ad>.webp.
// - Sesler listedeki `ses` alanından okunur, önekten tahmin edilmez (açık hecelerin çoğu Hece Evleri'nin ev-* kayıtları,
//   "ağaç" kutu-ad-agac, "jip" doğrulanmış hece kaydı).
// - En küçük yaş: 2–3 yaş yalnız "2-3" sözcüklerini, 4 yaş "2-3" ve "4"ü, 5+ hepsini görür.
// Test kipinde ?havuz=1 ile resmi gelmemiş sözcükler de (yer tutucu resimle) açılır: bağlantı denetlensin.
import liste from '../../ekip/alfabe/sozcuk-havuzu.json';
import { TEST_MODU } from '../../src/ui/dom';

type Kullanim = 'pano' | 'ders' | 'cumle';
export type Kayit = { sozcuk: string; harf: string; resim: string; enKucukYas: '2-3' | '4' | '5+'; ses: string; heceler: { hece: string; ses: string }[]; kullanim?: Kullanim[] };
/** Sözcüğün girdiği yer: listede `kullanim` yoksa hepsi (yönetici, 20 Kasım; jip, kuş, mum yalnız ders ve cümle). */
export const kullanimVar = (s: Pick<Kayit, 'kullanim'>, yer: Kullanim) => !s.kullanim || s.kullanim.includes(yer);
/** Hece birleştirme oyunlarına (Pano, Hece Kulağı) girer mi: Pano kullanımı ve en az iki hece. */
export const panoyaGirer = (s: Pick<Kayit, 'kullanim' | 'heceler'>) => kullanimVar(s, 'pano') && s.heceler.length >= 2;
const resimler = import.meta.glob<string>('../../assets/alfabe/kelime/*.webp', { eager: true, query: '?url', import: 'default' });
const YAS_SIRASI = { '2-3': 0, '4': 1, '5+': 2 } as const;
const testteHepsi = TEST_MODU && new URLSearchParams(location.search).get('havuz') === '1';
const YER_TUTUCU = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect x="40" y="40" width="720" height="720" rx="60" fill="#fff7e6" stroke="#c48a2c" stroke-width="16" stroke-dasharray="50 30"/></svg>');

export type HavuzSozcugu = { id: string; ad: string; harf: string; gorsel: string; ses: string; heceler: string[]; heceSesleri: string[]; pano: boolean; ders: boolean };

/** Bu yaşta oyunda görünebilecek havuz sözcükleri (resmi gelmiş olanlar). Saf: yaş dışarıdan gelir (birim testi). */
export const havuzSozcukleri = (yasGrubu: '2-3' | '4' | '5+'): HavuzSozcugu[] => (liste.sozcukler as Kayit[]).flatMap(s => {
  const id = s.resim.split('/').pop()!.replace(/\.webp$/, '');
  const gorsel = resimler['../../assets/alfabe/kelime/' + id + '.webp'] ?? (testteHepsi ? YER_TUTUCU : undefined);
  if (!gorsel || YAS_SIRASI[s.enKucukYas] > YAS_SIRASI[yasGrubu]) return [];
  const ad = s.sozcuk.charAt(0).toLocaleUpperCase('tr') + s.sozcuk.slice(1);
  return [{ id, ad, harf: s.harf, gorsel, ses: s.ses, heceler: s.heceler.map(h => h.hece), heceSesleri: s.heceler.map(h => h.ses),
    pano: panoyaGirer(s), ders: kullanimVar(s, 'ders') }];
});

/** Bir harf dersinin resimli sözcük adayları (Keşfet'in ikinci sözcüğü; harf-kutusu-kartlari.ts → kutuTurlari). */
export const havuzDersKartlari = (harf: string, yasGrubu: '2-3' | '4' | '5+') =>
  havuzSozcukleri(yasGrubu).filter(s => s.ders && s.harf === harf).map(s => ({ id: 'havuz-' + s.id, ad: s.ad, gorsel: s.gorsel, ses: s.ses }));

/** Hece → Ceren'in kaydı (listede olan heceler; bütün havuzdan, resmi gelmemiş sözcükler de dahil: aynı hece aynı ses). */
export const havuzHeceSesleri: Record<string, string> = Object.fromEntries(
  (liste.sozcukler as Kayit[]).flatMap(s => s.heceler.map(h => [h.hece, h.ses] as const)));
