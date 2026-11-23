// Ceren Öğretmen ile Sayılar 1–10: DOM'suz yardımcılar (birim testleri buradan sınar).
import olcu from './ceren-ders-olcu.json';

export const SAYILAR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const POZLAR = ['goster', 'parmak-say', 'alkis', 'sen-dene'] as const;
export type Poz = (typeof POZLAR)[number] | 'konus';

/** Astra'nın Aşama 1 çizimleri (assets/matematik/ceren/). Biri bile eksikse ders çocuklara görünmez. */
export const GEREKLI_CIZIMLER: readonly string[] = [
  'sinif',
  ...POZLAR.map((p) => 'ceren-' + p),
  'ders-masasi',
  ...SAYILAR.map((n) => 'rakam-' + n),
];
/**
 * Her sayıda tek çocuk etkinliği, sayıdan sayıya sırayla (Barış: "aşırı tekrar sıkar"; aynı oyun art arda gelmez):
 * 1, 4, 7, 10 yaz (ardından Ceren miktarı gösterir) · 2, 5, 8 birlikte say · 3, 6, 9 sen koy.
 */
export type Etkinlik = 'yaz' | 'birlikte' | 'koy';
export const etkinlik = (n: number): Etkinlik => (['yaz', 'birlikte', 'koy'] as const)[(n - 1) % 3];
/** Rakamın tanıtım kaydı; 10 rakam değil sayıdır ("Bu sayının adı on"). */
export const tanitSesi = (n: number) => (n === 10 ? 'tanit_10b' : 'tanit_' + n);
/**
 * Ceren'in dersin çaldığı 33 kaydı (scripts/matematik-ceren-ses.ps1). "Masaya koy" yalnız koyma sayılarında (3·6·9);
 * bitis_5: 2–3 yaşta 1–5 dersinin kapanışı. Yazma övgüsü (yazdin_n) ve "hepsi n tane" varsa çalar.
 */
export const GEREKLI_SESLER: readonly string[] = [
  'giris', 'birlikte', 'sen_dene', 'tekrar', 'yaz', 'aferin_1', 'aferin_2', 'aferin_3', 'bitis', 'bitis_5',
  ...SAYILAR.flatMap((n) => [tanitSesi(n), 'say_' + n, ...(etkinlik(n) === 'koy' ? ['koy_' + n] : [])]),
];

/** Sayılacak nesneler: mevcut Matematik çizimleri (çilek yok). */
export const NESNELER = ['elma', 'armut', 'boncuk', 'tas'] as const;
export const nesneTuru = (n: number) => NESNELER[(n - 1) % NESNELER.length];
export const aferinSesi = (n: number) => 'aferin_' + (((n - 1) % 3) + 1);
/** Ceren yalnız ilk "birlikte say"da önce kendisi sayıp örnek olur; sonrakilerde nesneler sessizce gelir (aynı sayma iki kez olmaz). */
export const ILK_BIRLIKTE = SAYILAR.find((n) => etkinlik(n) === 'birlikte')!;

/**
 * Onluk çerçeve: ilk beş nesne arka sırada, sonraki beş ön sırada, soldan sağa.
 * Dönen değerler dünya oranı: x nesnenin ortası, alt tabanı.
 */
export function yuvaKonumu(i: number) {
  const { sol, aralik, arkaAlt, onAlt } = olcu.nesne;
  return { x: sol + (i % 5) * aralik, alt: i < 5 ? arkaAlt : onAlt };
}

export type Nokta = [number, number];
/** Çizgiyi eşit aralıklı noktalara böler; parmağın izini adım adım ilerletmek için. */
export function esitAralikla(c: Nokta[], adim = 14): Nokta[] {
  if (c.length < 2) return c.slice();
  const cikti: Nokta[] = [c[0]];
  let kalan = adim;
  for (let i = 1; i < c.length; i++) {
    let [px, py] = c[i - 1];
    const [qx, qy] = c[i];
    let d = Math.hypot(qx - px, qy - py);
    while (d >= kalan) {
      const t = kalan / d;
      px += (qx - px) * t; py += (qy - py) * t;
      cikti.push([px, py]);
      d -= kalan; kalan = adim;
    }
    kalan -= d;
  }
  const son = c[c.length - 1], ust = cikti[cikti.length - 1];
  if (Math.hypot(son[0] - ust[0], son[1] - ust[1]) > adim * 0.3) cikti.push(son);
  else cikti[cikti.length - 1] = son;
  return cikti;
}
/**
 * Parmak yolu izliyor mu: şu anki noktadan ileriye bakılır, parmağa en yakın yol noktasına geçilir.
 * Geri gitmek ya da yoldan sapmak ilerlemeyi bozmaz (yanlış yok, yalnız ilerlemez).
 */
export function ilerlet(yol: Nokta[], simdi: number, x: number, y: number, tolerans: number, pencere = 9) {
  let yeni = simdi, en = tolerans;
  for (let j = simdi + 1; j < Math.min(yol.length, simdi + 1 + pencere); j++) {
    const d = Math.hypot(yol[j][0] - x, yol[j][1] - y);
    if (d < en) { en = d; yeni = j; }
  }
  return yeni;
}

export type Kayit = { biten: number[]; simdi: number; tanitildi: boolean; bitti: boolean };
export const KAYIT_ANAHTARI = 'minkino-matematik-ceren-sayilar-v1';
/**
 * Dersin sayıları yaşa göre (Barış, 19 Kasım 2026): 2–3 yaşta ders 1–5'te biter ve hatıra orada verilir; 4 ve 5+ yaşta 1–10.
 * Kayıt yaşlar arasında ortaktır: biten sayılar korunur, yaş değişince ders kendi aralığına göre sürer ya da biter.
 */
export const dersSayilari = (minik: boolean): readonly number[] => (minik ? SAYILAR.slice(0, 5) : SAYILAR);
/** Kapanış sözü dersin vardığı sayıyı söyler ("beşe kadar" / "ona kadar"). */
export const bitisSesi = (sayilar: readonly number[]) => (sayilar.length === 5 ? 'bitis_5' : 'bitis');
/** Dersin bütün sayıları öğrenildi mi (hatıra henüz verilmemiş olabilir)? */
export const hepsiBitti = (k: Kayit, sayilar: readonly number[]) => sayilar.every((n) => k.biten.includes(n));
/**
 * Bozuk ya da eski kayıtta ders baştan açılır. Şimdiki sayı dersin aralığı dışındaysa (2–3 yaşta 6–10'da kalmış eski kayıt)
 * aralıktaki ilk bitmemiş sayıya, hepsi bitmişse aralığın sonuna gelir: ders oradan hatıraya geçer, çocuk takılmaz.
 */
export function kaydiCoz(metin: string | null, sayilar: readonly number[] = SAYILAR): Kayit {
  const k: Kayit = { biten: [], simdi: 1, tanitildi: false, bitti: false };
  try {
    const v = JSON.parse(metin || 'null');
    if (!v || typeof v !== 'object') return k;
    if (Array.isArray(v.biten)) k.biten = SAYILAR.filter((n) => v.biten.includes(n));
    if (sayilar.includes(v.simdi)) k.simdi = v.simdi;
    else if (SAYILAR.includes(v.simdi)) k.simdi = sayilar.find((n) => !k.biten.includes(n)) ?? sayilar[sayilar.length - 1];
    k.tanitildi = v.tanitildi === true;
    k.bitti = v.bitti === true && hepsiBitti(k, sayilar);
  } catch { /* baştan */ }
  return k;
}
/** Sıradaki sayı: şu ankinden sonra bitmemiş ilk sayı (yoksa baştan bakılır); yalnız dersin aralığında. */
export function siradaki(k: Kayit, sonra = k.simdi, sayilar: readonly number[] = SAYILAR) {
  const bas = sayilar.indexOf(sonra) + 1;
  return [...sayilar.slice(bas), ...sayilar.slice(0, bas)].find((n) => !k.biten.includes(n));
}
