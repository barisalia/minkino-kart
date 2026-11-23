/**
 * Söz eşleme (saf; birim testi: tests/unit/soz-esle.test.ts). Tanıyıcının duyduğu metinler (en olası 5 seçenek)
 * beklenen sözcükle eşleşiyor mu?
 *
 * - Küçük çocuğun söyleyişine hoşgörülü: tanıyıcı "cat" yerine "kat", "dog" yerine "doc" yazsa da kabul edilir.
 *   Karşılaştırma yazıyla değil, yaklaşık sesle yapılır (sesKalibi).
 * - Ama başka sözcüğü kabul etmez: "cat" beklenirken "cow" geçmez. Aynı dersin öbür sözcükleri `rakipler` olarak
 *   verilirse, duyulan söz rakibe beklenenden daha yakınsa reddedilir.
 * - Çocuk sözcüğü cümle içinde söyleyebilir ("it's a cat", "bu bir kedi"): her sözcük ve ikili söz öbeği ayrı denenir.
 */
export type SozDili = 'en-US' | 'tr-TR';

/** Küçük harf, noktalama yok, tek boşluk (Türkçede İ/I kuralıyla) */
export function normalMetin(metin: string, dil: SozDili): string {
  return metin
    .toLocaleLowerCase(dil === 'tr-TR' ? 'tr-TR' : 'en-US')
    .normalize('NFC')
    .replace(/[’'`´]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Yaklaşık ses kalıbı: yazımı farklı ama kulağa benzer sözcükler aynı kalıba düşer.
 * İngilizce: Türk çocuğunun söyleyişi ve tanıyıcının yazım seçenekleri (th→t, ph→f, ck→k, w→v, ee/ea→i, oo→u …).
 * Türkçe: ğ/g, ı/i, ö/o, ü/u, ş/s, ç/c yakın sayılır (çocuk söyleyişi ve tanıyıcının Türkçe harfsiz yazımı).
 */
export function sesKalibi(sozcuk: string, dil: SozDili): string {
  let s = sozcuk.replace(/\s+/g, '');
  if (dil === 'en-US') {
    s = s
      .replace(/^kn/, 'n')
      .replace(/^wr/, 'r')
      .replace(/ph/g, 'f')
      .replace(/gh/g, '')
      .replace(/ck/g, 'k')
      .replace(/qu/g, 'kv')
      .replace(/th/g, 't')
      .replace(/sh/g, 's')
      .replace(/ch/g, 'c')
      .replace(/c(?=[eiy])/g, 's')
      .replace(/c/g, 'k')
      .replace(/q/g, 'k')
      .replace(/x/g, 'ks')
      .replace(/w/g, 'v')
      .replace(/z/g, 's')
      .replace(/j/g, 'c')
      .replace(/(ee|ea|ie|ey)/g, 'i')
      .replace(/(oo|ou)/g, 'u')
      .replace(/(?<=.)y/g, 'i');
    if (s.length > 3) s = s.replace(/e$/, '');
  } else {
    s = s
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/û/g, 'u');
  }
  return s.replace(/(.)\1+/g, '$1');
}

/** Düzenleme uzaklığı (Levenshtein) */
export function uzaklik(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let onceki = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const simdi = [i];
    for (let j = 1; j <= b.length; j++) {
      simdi[j] = Math.min(onceki[j] + 1, simdi[j - 1] + 1, onceki[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    onceki = simdi;
  }
  return onceki[b.length];
}

/** Duyulan metinden denenecek parçalar: bütünü, her sözcük, yan yana iki sözcük */
function parcalar(metin: string): string[] {
  const s = metin.split(' ').filter(Boolean);
  const p = new Set<string>([metin]);
  s.forEach((x, i) => {
    p.add(x);
    if (i + 1 < s.length) p.add(x + ' ' + s[i + 1]);
  });
  return [...p];
}

/**
 * Bir parçanın hedefe yakınlığı 0…1 (1: aynı). Kısa sözcüklerde (3 ses ve altı) tek ses farkına, uzunlarda
 * orantılı farka izin verilir; ilk ses farklıysa kısa sözcük kabul edilmez ("cat" ≠ "bat").
 */
function yakinlik(parca: string, hedef: string, dil: SozDili): number {
  if (parca === hedef) return 1;
  const a = sesKalibi(parca, dil);
  const b = sesKalibi(hedef, dil);
  if (!a || !b) return 0;
  if (a === b) return 0.98;
  const u = uzaklik(a, b);
  const boy = Math.max(a.length, b.length);
  if (b.length <= 3) return u <= 1 && a[0] === b[0] && Math.abs(a.length - b.length) <= 1 ? 0.8 : 0;
  const y = 1 - u / boy;
  return y >= (b.length >= 7 ? 0.6 : 0.66) ? y : 0;
}

function enIyi(duyulanlar: string[], hedefler: string[], dil: SozDili): number {
  let iyi = 0;
  for (const d of duyulanlar) {
    const n = normalMetin(d, dil);
    if (!n) continue;
    for (const p of parcalar(n)) {
      for (const h of hedefler) {
        const hn = normalMetin(h, dil);
        if (hn) iyi = Math.max(iyi, yakinlik(p, hn, dil));
      }
    }
  }
  return iyi;
}

/** Cümlede anlam taşımayan kısa sözler: cümle eşlemesinde aranmaz (çocuk "big cow" derse "A big cow." tutar) */
const BAGLAC: Record<SozDili, Set<string>> = {
  'en-US': new Set(['a', 'an', 'the', 'is', 'are', 'am', 'its', 'it', 'my', 'your', 'his', 'her', 'our', 'their', 'this', 'that', 'these', 'those', 'to', 'at', 'on', 'in', 'of', 'and', 'do', 'does', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'be', 'im', 'there', 'with', 'for']),
  'tr-TR': new Set(['bir', 'bu', 'şu', 'o', 've', 'de', 'da', 'mi', 'mı', 'mu', 'mü', 'ile']),
};

/** Cümlenin anahtar sözcükleri (bağlaçsız, tekrarsız); hepsi bağlaçsa cümlenin bütün sözcükleri */
export function anahtarSozler(metin: string, dil: SozDili): string[] {
  const s = normalMetin(metin, dil).split(' ').filter(Boolean);
  const anahtar = [...new Set(s.filter((w) => !BAGLAC[dil].has(w)))];
  return anahtar.length ? anahtar : s;
}

/**
 * Cümle (üç ve üstü sözcük): anahtar sözcüklerin hepsi (üçten çoksa en az üçte ikisi) duyulmalı; her biri çocuk
 * söyleyişine hoşgörülü karşılaştırılır. "A big cow." için "big cow", "it's a big cow" tutar; "cow", "table" tutmaz.
 */
function cumleEslesti(duyulanlar: string[], hedef: string, dil: SozDili): boolean {
  const gerekli = anahtarSozler(hedef, dil);
  const esik = gerekli.length <= 2 ? gerekli.length : Math.ceil((gerekli.length * 2) / 3);
  return duyulanlar.some((d) => {
    const n = normalMetin(d, dil);
    if (!n) return false;
    const p = parcalar(n);
    return gerekli.filter((g) => p.some((x) => yakinlik(x, g, dil) > 0)).length >= esik;
  });
}

const cumleMi = (metin: string, dil: SozDili) => normalMetin(metin, dil).split(' ').filter(Boolean).length >= 3;

/**
 * Duyulanlar beklenen sözcükle eşleşiyor mu? `beklenen`: sözcük ya da kabul edilen biçimleri ("ice cream", "icecream").
 * `rakipler`: aynı ekrandaki/dersteki öbür sözcükler; duyulan söz bunlardan birine daha yakınsa kabul edilmez.
 * Beklenen üç ve üstü sözcüklü bir cümleyse anahtar sözcükleri aranır (bkz. cumleEslesti).
 */
export function sozEslesti(
  duyulanlar: string[],
  beklenen: string | string[],
  o: { dil: SozDili; rakipler?: string[] },
): boolean {
  const hedefler = Array.isArray(beklenen) ? beklenen : [beklenen];
  if (hedefler.some((h) => cumleMi(h, o.dil))) return hedefler.some((h) => cumleEslesti(duyulanlar, h, o.dil));
  const puan = enIyi(duyulanlar, hedefler, o.dil);
  if (puan <= 0) return false;
  const beklenenNormal = new Set(hedefler.map((h) => normalMetin(h, o.dil)));
  const rakipler = (o.rakipler ?? []).filter((r) => !beklenenNormal.has(normalMetin(r, o.dil)));
  if (!rakipler.length) return true;
  return enIyi(duyulanlar, rakipler, o.dil) <= puan;
}
