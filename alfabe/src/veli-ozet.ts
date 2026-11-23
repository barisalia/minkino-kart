// Harf Atölyesi · Büyükler için (veli sayfası): kayıtlardan görünüm modeli. DOM'suz ve saf; birim testleri buradan sınar.
// Kayıtlar yalnız okunur (yazılmaz); her biri yaş ekiyle durur (ders-kaydi.ts: 5+ düz, 4 `-yas-4`, 2–3 `-yas-2-3`):
//   minkino-alfabe-v1 { biten, son, adimlar }      · harf dersleri (main.ts → Ilerleme)
//   minkino-hece-evleri-v1 { biten }               · Hece Evleri anahtarları (hece-evleri.ts)
//   minkino-hece-pano-kelimeler-v1 { sozler }      · Pano'da kurulan sözcükler (hece-pano-kaydi.ts)
//   minkino-hece-gorulen-sozcukler-v1 { kez }      · Trambolin'de kurulan sözcükler (hece-oyunu.ts)
//   minkino-cumle-okuma-v1 { okunan }              · Ceren'le oku: okunan cümleler (cumle-okuma.ts)
//   minkino-alfabe-gunluk-v1 { gunler, yanlis }   · günlük (gunluk.ts; yaş eki YOK): günde biten adım, harf başına yanlış
import dersler from './harfler.json';
import heceVerisi from './hece-evleri-veri.json';
import { GUNLUK_ANAHTARI, gunKodu } from './gunluk';
import { HARF_SIRASI, SES_GRUPLARI, grupNo, siradakiHarf } from './harf-sirasi';

export type Grup = '2-3' | '4' | '5+';
/** Menüdeki yaş → Harf Atölyesi grubu (yas-grubu.ts ile aynı kural). */
export const yasGrubuOf = (yas: number | null): Grup => (yas === 2 || yas === 3 ? '2-3' : yas === 4 ? '4' : '5+');
/** Kaydın yaş ekli anahtarı (ders-kaydi.ts → grupAnahtari ile aynı). */
export const grupAnahtari = (anahtar: string, g: Grup) => (g === '5+' ? anahtar : anahtar + '-yas-' + g);
export const yasYazisi = (yas: number | null) => (yas === null ? 'Yaş seçilmedi' : yas >= 6 ? '6 yaş ve üzeri' : yas + ' yaş');

export const HARFLER = dersler.map((d) => ({ id: d.id, buyuk: d.upper, kucuk: d.lower, ornek: d.example, ikinci: d.second }));
export const UNSUZLER: readonly string[] = heceVerisi.unsuzler;
const GUN = 86_400_000;
/** Veliye sıranın tek cümlelik anlatımı (ekip/antigravity/CEVAP-07.md → e; Barış'ın kararı 20 Kasım, KULLANICI-KURALLARI.md). */
export const SIRA_ACIKLAMASI = 'Harfler, MEB 1. sınıf ses grupları sırasıyla öğretilir; böylece çocuğunuz daha ilk harflerden anlamlı sözcük ve kısa cümle okumaya geçer.';
export const GRUP_SAYISI = SES_GRUPLARI.length;

export type Durum = 'yok' | 'suruyor' | 'tamam';
export const DURUM_YAZISI: Record<Durum, string> = { yok: 'Henüz başlamadı', suruyor: 'Öğreniyor', tamam: 'Tamamladı' };
export type BeceriId = 'harf' | 'hece' | 'sozcuk' | 'cumle';
export type Oneri = { beceri: BeceriId | 'hepsi'; metin: string; resim?: 'evde-harf-avi' | 'evde-alkis' | 'evde-sozcuk' | 'evde-kitap' };

/** Harfler öğrenme sırasıyla (harf-sirasi.ts: beş ses grubu); `grup` 0…4. */
export type HarfOzeti = { id: string; buyuk: string; kucuk: string; grup: number; durum: 'ogrendi' | 'yarim' | 'sirada' | 'bekliyor' };
export type BeceriOzeti = { id: BeceriId; ad: string; aciklama: string; durum: Durum; yazi: string; oran?: number };
// ---------------------------------------------------------------- Bugün Evde 1 Dakika (danışman CEVAP-06, ilk 10'un 5. maddesi)
/** Her harfin akşam evde bir dakikalık oyunu: o sesle başlayan gerçek ev eşyaları (ders kimliği → ipucu). Çilek yok. */
export const EVDE_HARF: Record<string, string> = {
  '01': 'Sofrada A ile başlayan üç şey bulun: armut, ayran, ayva.',
  '02': 'Sofrada B ile başlayan üç şey bulun: bardak, bal, biber.',
  '03': 'Evde C ile başlayan üç şey bulun: ceket, cetvel, ceviz.',
  '04': 'Evde Ç ile başlayan üç şey bulun: çatal, çanta, çorap.',
  '05': 'Evde D ile başlayan üç şey bulun: dolap, düğme, defter.',
  '06': 'Evde E ile başlayan üç şey bulun: elma, ekmek, eldiven.',
  '07': 'Evde F ile başlayan üç şey bulun: fincan, fırça, fasulye.',
  '08': 'Evde G ile başlayan üç şey bulun: gözlük, gömlek, gazete.',
  '09': 'Ğ hiçbir sözcüğün başında olmaz; içinde ğ olanları arayın: yoğurt, kâğıt, yağ.',
  '10': 'Evde H ile başlayan üç şey bulun: havlu, halı, havuç.',
  '11': 'Evde I ile başlayan üç şey bulun: ışık, ılık su, ıspanak.',
  '12': 'Evde İ ile başlayan üç şey bulun: ip, incir, iskemle.',
  '13': 'Evde J ile başlayan üç şey bulun: jöle, jeton, jaluzi.',
  '14': 'Mutfakta K ile başlayan üç şey bulun: kaşık, kâse, kapak.',
  '15': 'Evde L ile başlayan üç şey bulun: limon, lamba, lavabo.',
  '16': 'Mutfakta M ile başlayan üç şey bulun: muz, makarna, mısır.',
  '17': 'Mutfakta N ile başlayan üç şey bulun: nane, nar, nohut.',
  '18': 'Evde O ile başlayan üç şey bulun: oyuncak, oklava, ocak.',
  '19': 'Evde Ö ile başlayan üç şey bulun: önlük, örtü, örgü.',
  '20': 'Mutfakta P ile başlayan üç şey bulun: peynir, patates, pirinç.',
  '21': 'Evde R ile başlayan üç şey bulun: radyo, resim, rende.',
  '22': 'Banyoda S ile başlayan üç şey bulun: sabun, su, sünger.',
  '23': 'Evde Ş ile başlayan üç şey bulun: şeker, şişe, şemsiye.',
  '24': 'Mutfakta T ile başlayan üç şey bulun: tabak, tuz, tencere.',
  '25': 'Evde U ile başlayan üç şey bulun: un, uçurtma, uyku tulumu.',
  '26': 'Evde Ü ile başlayan üç şey bulun: ütü, üzüm, üst raf.',
  '27': 'Evde V ile başlayan üç şey bulun: vazo, valiz, vida.',
  '28': 'Mutfakta Y ile başlayan üç şey bulun: yumurta, yoğurt, yağ.',
  '29': 'Evde Z ile başlayan üç şey bulun: zeytin, zil, zarf.',
};
export const EVDE_BASLANGIC = 'Adının ilk harfini birlikte bulun; sonra evde o sesle başlayan bir şey arayın.';
export type BugunEvde = { baslik: string; metin: string; harf?: string };

export type VeliOzeti = {
  grup: Grup;
  yasYazi: string;
  bos: boolean;
  harfler: HarfOzeti[];
  ogrenilen: number;
  /** En son biten harf (öneriler buna göre). */
  sonHarf?: (typeof HARFLER)[number];
  anahtarlar: { unsuz: string; alindi: boolean }[];
  anahtar: number;
  sozcuk: number;
  cumle: number;
  /** Cümle okuma bu yaşta var mı (2–3 yaşta yok). */
  cumleVar: boolean;
  beceriler: BeceriOzeti[];
  oneriler: Oneri[];
  /** Günlükten son 7 gün (eskiden bugüne; günde biten ders adımı). Günlük hiç yoksa null (bölüm görünmez). */
  son7Gun: { gunler: { kod: string; ad: string; adim: number }[]; calisilan: number; toplam: number } | null;
  /** Günlükten en çok yanılınan harfler (en az 2 yanlış, en çok 6); yoksa boş (bölüm görünmez). */
  zorlananlar: string[];
  /** En son öğrendiği harfe göre akşam evde bir dakikalık oyun; ilerleme yoksa başlangıç. */
  bugun: BugunEvde;
};
export type VeliGirdisi = { yas: number | null; oku: (anahtar: string) => string | null; simdi?: number };

const json = (oku: VeliGirdisi['oku'], a: string): unknown => {
  try { return JSON.parse(oku(a) || 'null'); } catch { return null; }
};
const nesne = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const pozitif = (v: unknown) => Number.isSafeInteger(v) && (v as number) > 0;

function harfDurumlari(ham: unknown) {
  const v = nesne(ham);
  const gecerli = (id: unknown): id is string => HARFLER.some((h) => h.id === id);
  const biten = Array.isArray(v.biten) ? [...new Set(v.biten.filter(gecerli))] : [];
  const yarim = Object.keys(nesne(v.adimlar)).filter((id) => gecerli(id) && !biten.includes(id));
  // Sıradaki: yarıda bırakılan son ders; yoksa ses grubu sırasında bitmemiş ilk harf (main.ts → siradakiHarf).
  const sirada = gecerli(v.son) && !biten.includes(v.son) && yarim.includes(v.son) ? v.son : siradakiHarf(biten);
  return { biten, yarim, sirada };
}

/** Evde birlikte: harfin, hecenin, sözcüğün, cümlenin o anki düzeyine göre kısa bir oyun. */
function oneriler(o: Omit<VeliOzeti, 'oneriler' | 'beceriler' | 'bugun'>): Oneri[] {
  const liste: Oneri[] = [];
  const h = o.sonHarf;
  // Harfin "ev eşyası bul" oyunu en üstteki Bugün Evde kartında; burada yinelenmez. 2–3 yaşta yalnız başka bir iş: harfi havada çizmek.
  if (o.grup === '2-3' && h && o.ogrenilen < HARFLER.length) {
    liste.push({ beceri: 'harf', resim: 'evde-harf-avi', metin: `“${h.buyuk}” harfini boyadı. Parmağıyla havada ${h.buyuk} çizsin; siz de “${h.ornek}” deyin.` });
  }
  if (o.anahtar < UNSUZLER.length) {
    liste.push({
      beceri: 'hece',
      resim: 'evde-alkis',
      metin: o.anahtar === 0 || o.grup === '2-3'
        ? 'Adını alkışlayarak hecelere ayırın: A-li, iki alkış. Sonra sizin adınızı o alkışlasın.'
        : `Hece Evleri'nde ${o.anahtar} anahtar topladı. “ba-ba”, “ma-ma” gibi heceleri birlikte söyleyin; ikinci heceyi o tamamlasın.`,
    });
  }
  if (o.grup !== '2-3' && o.ogrenilen >= 3) {
    liste.push({ beceri: 'sozcuk', resim: 'evde-sozcuk', metin: 'Kâğıda “at”, “bal”, “el” gibi kısa sözcükler yazın; harf harf birlikte okuyun, sonra o tek başına okusun.' });
  }
  if (o.cumleVar && (o.cumle > 0 || o.ogrenilen >= 8)) {
    liste.push({ beceri: 'cumle', resim: 'evde-kitap', metin: 'Yatmadan önce kitaptaki kısa bir cümleyi parmağınızla izleyerek okuyun; son sözcüğü o okusun.' });
  }
  // İlk öneri başta; üçten fazlaysa ardından öğrenmekte olduğu en ileri iş (yeni beceri hazırlık olsun).
  const secim = liste.length > 2 ? [liste[0], liste[liste.length - 1]] : liste;
  if (o.ogrenilen === HARFLER.length && secim.length < 2) {
    secim.unshift({ beceri: 'hepsi', metin: '29 harfin hepsini öğrendi! Market tabelalarında, kitap kapaklarında gördüğü sözcükleri bu kez ona okutun.' });
  }
  return secim.slice(0, 2);
}

/** Kayıtlar → veli sayfasının görünüm modeli (saf: aynı girdiye aynı sonuç). */
export function veliOzeti(g: VeliGirdisi): VeliOzeti {
  const grup = yasGrubuOf(g.yas);
  const oku = (a: string) => json(g.oku, grupAnahtari(a, grup));
  const ders = harfDurumlari(oku('minkino-alfabe-v1'));
  const harfler: HarfOzeti[] = HARF_SIRASI.map((id) => HARFLER.find((h) => h.id === id)!).map((h) => ({
    id: h.id, buyuk: h.buyuk, kucuk: h.kucuk, grup: grupNo(h.id),
    durum: ders.biten.includes(h.id) ? 'ogrendi' : ders.yarim.includes(h.id) ? 'yarim' : h.id === ders.sirada ? 'sirada' : 'bekliyor',
  }));
  const evler = nesne(oku('minkino-hece-evleri-v1'));
  const alinan = Array.isArray(evler.biten) ? evler.biten : [];
  const anahtarlar = UNSUZLER.map((unsuz) => ({ unsuz, alindi: alinan.includes(unsuz) }));
  const sozcukler = new Set<string>();
  for (const [id, k] of Object.entries(nesne(nesne(oku('minkino-hece-pano-kelimeler-v1')).sozler))) if (pozitif(nesne(k).kez)) sozcukler.add(id);
  for (const [id, kez] of Object.entries(nesne(nesne(oku('minkino-hece-gorulen-sozcukler-v1')).kez))) if (pozitif(kez)) sozcukler.add(id);
  const okunan = nesne(oku('minkino-cumle-okuma-v1')).okunan;
  const cumle = Array.isArray(okunan) ? new Set(okunan.filter((x) => typeof x === 'string')).size : 0;
  const cumleVar = grup !== '2-3';

  // Günlük yaştan bağımsız tek kayıttır (gunluk.ts): yaş eki eklenmez.
  const gunlukHam = json(g.oku, GUNLUK_ANAHTARI);
  const gunluk = nesne(gunlukHam);
  const simdi = g.simdi ?? Date.now();
  const GUN_ADI = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const gunSayilari = nesne(gunluk.gunler);
  const son7Gun = gunlukHam && typeof gunlukHam === 'object' ? (() => {
    const gunler = Array.from({ length: 7 }, (_, i) => {
      const t = new Date(simdi - (6 - i) * GUN);
      const kod = gunKodu(t);
      return { kod, ad: i === 6 ? 'Bugün' : GUN_ADI[t.getDay()], adim: pozitif(gunSayilari[kod]) ? (gunSayilari[kod] as number) : 0 };
    });
    return { gunler, calisilan: gunler.filter((x) => x.adim > 0).length, toplam: gunler.reduce((t, x) => t + x.adim, 0) };
  })() : null;
  const zorlananlar = Object.entries(nesne(gunluk.yanlis))
    .filter(([id, n]) => HARFLER.some((h) => h.id === id) && pozitif(n) && (n as number) >= 2)
    .sort((a, b) => (b[1] as number) - (a[1] as number) || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([id]) => HARFLER.find((h) => h.id === id)!.buyuk);

  const ogrenilen = ders.biten.length;
  const anahtar = anahtarlar.filter((a) => a.alindi).length;
  const sonId = ders.biten[ders.biten.length - 1];
  const temel = {
    grup, yasYazi: yasYazisi(g.yas),
    bos: ogrenilen === 0 && ders.yarim.length === 0 && anahtar === 0 && sozcukler.size === 0 && cumle === 0,
    harfler, ogrenilen, sonHarf: HARFLER.find((h) => h.id === sonId),
    anahtarlar, anahtar, sozcuk: sozcukler.size, cumle, cumleVar, son7Gun, zorlananlar,
  };
  const durum = (n: number, toplam?: number): Durum => (n === 0 ? 'yok' : toplam !== undefined && n >= toplam ? 'tamam' : 'suruyor');
  const beceriler: BeceriOzeti[] = [
    {
      id: 'harf', ad: 'Harfler', durum: durum(ogrenilen, HARFLER.length), oran: ogrenilen / HARFLER.length,
      yazi: `${ogrenilen} / ${HARFLER.length} harf`,
      aciklama: grup === '2-3' ? 'Harfin şeklini boyayarak tanımak, sesini duymak.'
        : grup === '4' ? 'Harfi tanımak, sesini söylemek, o sesle başlayan sözcüğü bulmak.'
          : 'Harfi tanımak, sesini söylemek, büyük ve küçük harfi yazmak.',
    },
    {
      id: 'hece', ad: 'Heceler', durum: durum(anahtar, UNSUZLER.length), oran: anahtar / UNSUZLER.length,
      yazi: `${anahtar} / ${UNSUZLER.length} anahtar`,
      aciklama: grup === '2-3' ? 'Hece Evleri’nde kapıyı çalıp heceyi dinlemek.' : 'Ünsüzü ünlüyle birleştirip heceyi okumak: ba, be, bı…',
    },
    {
      id: 'sozcuk', ad: 'Sözcük kurma', durum: durum(sozcukler.size), yazi: sozcukler.size ? `${sozcukler.size} sözcük kurdu` : 'Henüz sözcük kurmadı',
      aciklama: 'Heceleri yan yana koyup sözcük kurmak ve okumak.',
    },
    ...(cumleVar ? [{
      id: 'cumle' as const, ad: 'Cümle okuma', durum: durum(cumle), yazi: cumle ? `${cumle} cümle okudu` : 'Henüz cümle okumadı',
      aciklama: 'Kısa cümleleri önce sözcük sözcük, sonra akıcı okumak.',
    }] : []),
  ];
  const sonH = temel.sonHarf;
  const bugun: BugunEvde = sonH
    ? { harf: sonH.id, baslik: `“${sonH.buyuk}” harfini öğrendi`, metin: EVDE_HARF[sonH.id] }
    : { baslik: 'Başlarken', metin: EVDE_BASLANGIC };
  return { ...temel, beceriler, oneriler: oneriler(temel), bugun };
}
