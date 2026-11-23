// "Dede'nin Posta Kutusu"nun sözcük seçimi ve pul sesleri (saf; tests/unit/alfabe-posta-kutusu.test.ts sınar).
// Sözcükler 2–4 harfli, resmi ve Ceren'in ad kaydı olan sözcüklerden (sözcük havuzu, ders örnekleri, Harf Kutusu kartları);
// bütün harfleri çocuğun bitirdiği harflerden. Tek heceli sözcükler (jip, kuş, mum) burada da yer alır.
// Pul sesleri: ünsüz Türkçede tek başına doğru okunamaz (uygulama hiçbir yerde okutmaz). Bu yüzden ünsüz pulu yalnız
// "küt" diye yapışır; arkasından gelen ünlü onunla birleşince hece duyulur: n → (küt), a → "na", r → sözcük "nar".
// Hecenin başındaki ünlü kendi sesini söyler ("Aaa"); hece tamamlanınca kaydı varsa hece okunur; son harfte sözcük okunur.

export type PostaSozcugu = { id: string; ad: string; gorsel: string; ses: string };
export const OTURUM_ZARF = 3;
export const ABC = 'abcçdefgğhıijklmnoöprsştuüvyz';
const UNLU = new Set('aeıioöuü');
const BELIRTEC: Record<string, string> = { 'ç': 'cc', 'ş': 'ss', 'ı': 'ii', 'ö': 'oo', 'ü': 'uu' };
const belirtec = (h: string) => BELIRTEC[h] ?? h;
/** Ünlünün uzatılmış kaydı (Mıknatıslar'ın parça kayıtları: "Aaa.", "Eee." …). */
export const unluSesi = (h: string) => 'mik-parca-' + h.codePointAt(0)!.toString(16);
/** Ünsüz + ünlü açık hece kaydı (Hece Evleri: "na", "ku" …). */
export const acikHeceSesi = (unsuz: string, unlu: string) => 'ev-' + belirtec(unsuz) + '-' + belirtec(unlu);

/** Sözcüğün küçük harfleri ("Kuş" → ["k","u","ş"]). */
export const harfleri = (ad: string) => [...ad.toLocaleLowerCase('tr')];

/** Türkçe heceleme: her ünlü bir hece; iki ünlü arasındaki son ünsüz sonraki heceye geçer ("erik" → e-rik, "elma" → el-ma). */
export function hecele(ad: string): string[] {
  const h = harfleri(ad);
  const unluler = h.map((c, i) => (UNLU.has(c) ? i : -1)).filter(i => i >= 0);
  if (unluler.length < 2) return [h.join('')];
  const baslar = [0];
  for (let k = 1; k < unluler.length; k++) {
    const onceki = unluler[k - 1], bu = unluler[k];
    baslar.push(bu - onceki > 1 ? bu - 1 : bu);
  }
  return baslar.map((b, i) => h.slice(b, baslar[i + 1] ?? h.length).join(''));
}

/** Bu harflerle yazılabilen 2–4 harfli, tek sözcüklü adaylar (aynı ad bir kez). bilinen: çocuğun bitirdiği küçük harfler. */
export function postaAdaylari(sozcukler: readonly PostaSozcugu[], bilinen: ReadonlySet<string>): PostaSozcugu[] {
  const gorulen = new Set<string>();
  return sozcukler.filter(s => {
    const h = harfleri(s.ad);
    const anahtar = h.join('');
    if (gorulen.has(anahtar)) return false;
    const uygun = h.length >= 2 && h.length <= 4 && h.every(c => ABC.includes(c) && bilinen.has(c));
    if (uygun) gorulen.add(anahtar);
    return uygun;
  });
}

/** Oturumun zarfları: hiç görülmemişler önce, sonra en eski görülenler. gorulen: sözcük → son görüldüğü oturum. */
export function postaOturumu(adaylar: readonly PostaSozcugu[], gorulen: Readonly<Record<string, number>>, rastgele = Math.random): PostaSozcugu[] {
  return [...adaylar].map(s => ({ s, r: rastgele() }))
    .sort((a, b) => (gorulen[a.s.id] ?? -1) - (gorulen[b.s.id] ?? -1) || a.r - b.r)
    .slice(0, OTURUM_ZARF).map(x => x.s);
}

/** Çeldirici pul: çocuğun bildiği, sözcükte olmayan bir harf (yoksa undefined). */
export function celdirici(ad: string, bilinen: ReadonlySet<string>, rastgele = Math.random): string | undefined {
  const h = new Set(harfleri(ad));
  const aday = [...bilinen].filter(c => ABC.includes(c) && c !== 'ğ' && !h.has(c)).sort();
  return aday.length ? aday[Math.floor(rastgele() * aday.length)] : undefined;
}

/**
 * Her pul yapışınca çalacak kayıt (undefined: yalnız "küt"). Son harfin yeri boş kalır: orada sözcüğün kendisi okunur.
 * kayitVar: bu kaydın dosyası var mı (hece kaydı olmayan kapalı hece sessiz geçer).
 */
export function pulSesleri(ad: string, kayitVar: (id: string) => boolean, heceSesi: (hece: string) => string): (string | undefined)[] {
  const heceler = hecele(ad);
  const sonuc: (string | undefined)[] = [];
  heceler.forEach((hece, hi) => {
    const h = [...hece];
    h.forEach((c, i) => {
      const onek = h.slice(0, i + 1);
      const sonHece = hi === heceler.length - 1;
      let ses: string | undefined;
      if (i === h.length - 1 && !sonHece && onek.length > 2) ses = heceSesi(hece);
      else if (onek.length === 1 && UNLU.has(c)) ses = unluSesi(c);
      else if (onek.length === 2 && !UNLU.has(onek[0]) && UNLU.has(c)) ses = acikHeceSesi(onek[0], c);
      else if (i === h.length - 1 && !sonHece) ses = heceSesi(hece);
      sonuc.push(ses && kayitVar(ses) ? ses : undefined);
    });
  });
  sonuc[sonuc.length - 1] = undefined;
  return sonuc;
}
