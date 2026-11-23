/**
 * Ders yürütücüsü: bir dersin (ya da Oyunlar bölümünden açılan tek oyunun, ya da Günün Tekrarı'nın) adımlarını
 * sırayla oynatır, hataları sayar, sonunda yıldızı ve çıkartmaları kaydeder ve sonuç ekranını gösterir.
 */
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import { anlatKur } from '../adimlar/anlat';
import { balonKur } from '../adimlar/balon';
import { besleKur } from '../adimlar/besle';
import { DOGRUMU_YEDEK_YONERGE, dogruMuKur } from '../adimlar/dogrumu';
import { hafiza2Kur } from '../adimlar/hafiza2';
import { sayKoyKur } from '../adimlar/saykoy';
import { postaKur } from '../adimlar/posta';
import { giydirHazir, giydirKur } from '../adimlar/giydir';
import { sarkiKur } from '../adimlar/sarki';
import { gecitKur } from '../adimlar/gecit';
import { masalOyunKur } from '../adimlar/masaloyun';
import { kitapKur } from '../adimlar/kitap';
import { kanitCizimleri, kanitSesleri } from '../kitap/veri';
import { masal2Kur } from '../adimlar/masal2';
import { masal2Bul, masal2Sesleri, type Masal2 } from '../adimlar/masal2-veri';
import { adaninMasal2si } from '../adimlar/masal2-hazir';
import { sasirtKur } from '../adimlar/sasirt';
import { MASAL_SORULARI, masalSorusuSesi } from '../masal-oyun';
import { bahceKur } from '../adimlar/bahce';
import { saklambacKur, saklambacPlani, saklambacSesleri } from '../adimlar/saklambac';
import { adaOyunuHazir, adaOyunuKur, adaOyunuSesleri, renkliPlani } from '../adimlar/ada-oyunlari';
import { yerlestirKur } from '../adimlar/yerlestir';
import { YERLESTIR_SAHNELERI, sahneYolu, yerlestirSesleri, type YerlestirPlani } from '../adimlar/yerlestir-veri';
import { canlandirKur } from '../adimlar/canlandir';
import { ovalaKur } from '../adimlar/ovala';
import { OVALA_SAHNELERI, ovYolu, ovalaSesleri, type OvalaPlani } from '../adimlar/ovala-veri';
import { CANLANDIR_SAHNELERI, canlandirCizimleri, canlandirSesleri, type CanlandirPlani } from '../adimlar/canlandir-veri';
import { bilmeceOyunu, farkliOyunu } from '../adimlar/bilmece-plan';
import { adaninSarkisi, sarkiBul } from '../sarkilar';
import { senSorKur } from '../adimlar/sensor';
import { soyle2Kur } from '../adimlar/soyle2';
import { yakalaKur } from '../adimlar/yakala';
import { bulKur } from '../adimlar/bul';
import { eksikKur } from '../adimlar/eksik';
import { eslestirKur } from '../adimlar/eslestir';
import { fenerKur, fenerSesleri } from '../adimlar/fener';
import { hikayeKur, siralaKur } from '../adimlar/hikaye';
import { kurKur } from '../adimlar/kur';
import { ogretKur } from '../adimlar/ogret';
import { aferin, yuzYuze, type AdimBaglami } from '../adimlar/ortak';
import { nesneliSahne, resimKur, sahnedeYeriVar, sahneYerlesimiVar } from '../adimlar/resim';
import { sayKur } from '../adimlar/say';
import { yapKur } from '../adimlar/yap';
import { kapiKur } from '../adimlar/kapi';
import { rutinSesleri, selamKur, vedaKur } from '../adimlar/selam';
import { sohbetKur } from '../adimlar/sohbet';
import { soyleKur } from '../adimlar/soyle';
import { tarifKur } from '../adimlar/tarif';
import { tanisKur } from '../adimlar/tanis';
import { HAYVAN_DERSI_2, HAYVAN_DERSI_1, KINO_SOZLERI, SAYI_KELIMELERI, TUM_DERSLER, UNITELER, dersBul, dersKelimeleri, dersKimligi, kelimeBul, kelimeSesleri, uniteBul, yeniKelimeler, type DersNo, type Kelime, type Unite } from '../icerik';
import { DERS_ADI, dersIfadeleri, dersSesKimlikleri, ilerisi, type Ifade } from '../icerik2';
import { gorselCiz } from '../gorsel';
import { animasyonGorunur, miniAnimasyon } from '../mini-animasyon';
import { MINI_ANIMASYONLAR, dersAnahtari, kutlamaAnimasyonu, odulAnimasyonu, turSuresi } from '../mini-animasyon-veri';

/** Son ders sonu kutlamasında oynayan mini animasyon (bir sonrakinde başkası gelsin; yalnız bu cihazda) */
const KUTLAMA_ANAHTARI = 'minkino-ingilizce-mini-son';
function sonKutlama(yeni?: string): string | null {
  try {
    if (yeni) { localStorage.setItem(KUTLAMA_ANAHTARI, yeni); return yeni; }
    return localStorage.getItem(KUTLAMA_ANAHTARI);
  } catch { return null; }
}
import { GUN_MS, bugunTekrarEdildi, cevapIsle, dersBitir, ogrenilenler, oku, siradakiDers, tekrarBitir, tekrarSec, yaz, yildizHesapla, type Kayit } from '../ilerleme';
import { cikartmaResmi, dugme, kutla, noktalar, simgeDugme, yildizYagmuru, yildizlar } from '../kit';
import { mikrofonKapat } from '../mikrofon';
import { hayvanPlani, dersPlani, farkliOzneler, fenerPlani, kurTurlari, ogretSorulari, oyunPlani, soruSayisi, tarifSorulari, type Adim, type Yas } from '../plan';
import { konus, sesHazirla, sus, tik } from '../ses';
import { TASLAK, acikKelimeler, dersHazir, kelimeAcik, oyunHazir, resim, sahneResmi, sarkiAdresi, sesAdresi, hayvanAcik } from '../varlik';

export type DersParametresi =
  | { tur: 'ders'; uniteId: string; no: DersNo }
  /** Oyunlar bölümünün tek oyunu (18 Kasım 2026): Fener Avı */
  | { tur: 'fener' }
  | { tur: 'tekrar' }
  /** Masal Kitaplığı: bir adanın hikâyesi (masal saati: Ceren tanıtır, Polly okur, çocuk anlatır) */
  | { tur: 'masal'; uniteId: string }
  /** Oyunlar: Hayvanat Bahçesi (yüz hayvan, serbest gezinti ve sorular) */
  | { tur: 'bahce' }
  /** Oyunlar: Hide & Seek with Mino (yer bildiren sözler) */
  | { tur: 'saklambac' }
  | { tur: 'renkli' }
  | { tur: 'bilmece' }
  | { tur: 'farkli' }
  /** açılır kitap (?kitap=gol): göl masalının 3 boyutlu kitabı; şimdilik kanıt sayfası */
  | { tur: 'kitap'; ad: string }
  /** bir şarkı tek başına (?sarki=<id>) */
  | { tur: 'sarki'; id: string };

export interface Gezinme {
  ana(): void;
  adalar(uniteId?: string): void;
  oyunlar(): void;
  ders(p: DersParametresi): void;
  masallar(): void;
  yas: Yas;
}

/**
 * Fener Avı'nın oynanabileceği adalar: sahne çizimi ve nesne yerleşimi olan, en az üç kelimesi öğrenilmiş üniteler.
 * Oyunlar ekranı da kartı buna göre açar ya da kilitler.
 */
export function fenerAdaylari(k: Kayit): { uniteId: string; kelimeler: Kelime[]; ogrenilen: Kelime[] }[] {
  const bilinen = new Set(ogrenilenler(k));
  return UNITELER.filter((u) => nesneliSahne(u.id) && !!sahneResmi(u.id)).map((u) => {
    const kelimeler = acikKelimeler(u).filter((w) => sahnedeYeriVar(u.id, w.id));
    return { uniteId: u.id, kelimeler, ogrenilen: kelimeler.filter((w) => bilinen.has(w.id)) };
  }).filter((x) => x.ogrenilen.length >= 3);
}

/** Kilitli kartın resmi için çiftlik adası (henüz oynanacak ada yokken de kart boş görünmesin) */
export function fenerOrnekAdasi(): { uniteId: string; kelimeler: Kelime[] } | undefined {
  const u = uniteBul('ciftlik');
  return u ? { uniteId: u.id, kelimeler: acikKelimeler(u).filter((w) => sahnedeYeriVar(u.id, w.id)) } : undefined;
}

const kelimeler = (idler: readonly string[]): Kelime[] => idler.map(kelimeBul).filter((w): w is Kelime => !!w);

/** Yönergesinin kaydı var mı (taslakta ve testte her oyun açıktır) */
const kayitli = (id: string): boolean => TASLAK || TEST_MODU || !!sesAdresi(id);
const tekIfadeler = <T extends { id: string }>(liste: T[]): T[] => [...new Map(liste.map((f) => [f.id, f])).values()];

/**
 * Çizimi henüz gelmemiş oyun adımını, çizimi hazır bir adımla değiştirir (yarım görüntü çıkmasın). Yönergesinin sesi
 * henüz üretilmemiş yeni oyun da aynı işi gören eski oyunla değişir: çocuk açıklamasız bir oyuna girmez; ses gelince
 * yeni oyun kendiliğinden açılır.
 */
const giydirSesleri = (a: Extract<Adim, { tip: 'giydir' }>): string[] =>
  ['tr/c-giydir-giris', 'en/g-kino-ready', 'en/g-say-cheese', 'en/g-yes', ...a.hedefler.flatMap((w) => [`en/g-put-on-${w.id}`, `en/w-${w.id}`])];

/** Sahneye Taşı açılabilir mi: fon, karakterin iki pozu, raftaki eşyaların katmanları ve Ceren'in girişi ile Polly'nin sonu */
function yerlestirHazir(p: YerlestirPlani): boolean {
  const s = YERLESTIR_SAHNELERI.find((x) => x.ad === p.sahne);
  if (!s) return false;
  const cizimler = [sahneYolu(s, 'fon'), sahneYolu(s, `${s.kim}-0`), sahneYolu(s, `${s.kim}-1`), ...p.raf.map((w) => sahneYolu(s, w.id))];
  return cizimler.every((y) => !!resim(y)) && yerlestirSesleri(p).every((id) => !!sesAdresi(id));
}

/** Söyle, Canlansın açılabilir mi: sahnenin fonu ve bütün parçaları, Ceren'in girişi, Polly'nin sonu ve soruları */
function canlandirHazir(p: CanlandirPlani): boolean {
  const s = CANLANDIR_SAHNELERI.find((x) => x.ad === p.sahne);
  return !!s && canlandirCizimleri(s).every((y) => !!resim(y)) && canlandirSesleri(p).every((id) => !!sesAdresi(id));
}

/** Ovala, Bul açılabilir mi: sahnenin fonu ve örtüsü, Ceren'in girişi, Polly'nin sonu ve soruları */
function ovalaHazir(p: OvalaPlani): boolean {
  const s = OVALA_SAHNELERI.find((x) => x.ad === p.sahne);
  return !!s && !!resim(ovYolu(s, 'fon')) && !!resim(ovYolu(s, 'ortu')) && ovalaSesleri(p).every((id) => !!sesAdresi(id));
}

/** Masal 2.0'ın Masal Oyunu için sayfaları (ipucu resmi, "Find the picture!" yedeği) */
const masal2Sayfalari = (m: Masal2): Ifade[] => m.sayfalar.map((s, i) => ({ id: `${m.ad}-${i + 1}`, en: s.en, tr: s.tr, g: { ozel: s.ipucuResmi ?? s.resim }, parcalar: [], ses: s.ses }));

function hazirAdimlar(adimlar: Adim[], unite: Unite | null, yas: Yas): Adim[] {
  return adimlar.flatMap((a): Adim[] => {
    // günlük söz baştan sona sestir: kaydı yoksa taslakta bile açılmaz
    if (a.tip === 'selam' && a.rutin && !rutinSesleri(a.rutin).every((id) => TEST_MODU || !!sesAdresi(id))) return [{ ...a, rutin: undefined }];
    if (a.tip === 'dogrumu' && !kayitli('tr/c-dogrumu-giris') && !kayitli(DOGRUMU_YEDEK_YONERGE)) {
      const ifadeler = tekIfadeler(a.sorular.flatMap((q) => [q.soylenen, q.gosterilen]));
      return [{ tip: 'tarif', sorular: tarifSorulari(ifadeler, a.sorular.length, yas, Math.random), giris: 'tr/c-tarif-giris' }];
    }
    // Şakacı Polly'nin iki sözü gelmeden adım açılmaz
    if (a.tip === 'sasirt' && !(kayitli('en/g-oops-silly-polly') && kayitli('en/g-look-again') && a.turlar.length)) return [];
    // adanın şarkısı yalnız onaylanmış dosyası varsa çalınır (taslakta ve testte de)
    if (a.tip === 'sarki' && !sarkiAdresi(a.sarki.id)) return [];
    // Kino'yu Giydir: çizimi ve sesi tamam değilse dersin yedek oyunu (taslak ve test kipinde yer tutucuyla açılır)
    if (a.tip === 'giydir' && !(TASLAK || TEST_MODU || (giydirHazir(a.hedefler) && giydirSesleri(a).every((id) => !!sesAdresi(id))))) {
      return hazirAdimlar([a.yedek], unite, yas);
    }
    // adaya özel oyun: çizimi ve sesi tamam değilse dersin yedek adımı (taslak ve test kipinde yer tutucuyla açılır)
    if (a.tip === 'adaoyunu' && !adaOyunuHazir(a.oyun)) return hazirAdimlar([a.yedek], unite, yas);
    // Sahneye Taşı: çizimi ve sesi tamam değilse dersin yedek adımı (yalnız taslak kipinde yer tutucuyla açılır)
    if (a.tip === 'yerlestir' && !(TASLAK || yerlestirHazir(a.plan))) return hazirAdimlar([a.yedek], unite, yas);
    // Söyle, Canlansın: çizimi ve sesi tamam değilse düz söyleme adımı (yalnız taslak kipinde yer tutucuyla açılır)
    if (a.tip === 'canlandir' && !(TASLAK || canlandirHazir(a.plan))) return hazirAdimlar([a.yedek], unite, yas);
    // Ovala, Bul: çizimi ve sesi tamam değilse dersin yedek adımı (yalnız taslak kipinde yer tutucuyla açılır)
    if (a.tip === 'ovala' && !(TASLAK || ovalaHazir(a.plan))) return hazirAdimlar([a.yedek], unite, yas);
    // Polly'nin Postası'nın yönergesi yoksa yerine o cümlelerle Cümle Kur oynanır
    if (a.tip === 'posta' && !kayitli('tr/c-posta-giris')) {
      return [{ tip: 'kur', turlar: kurTurlari(a.evler.slice(0, yas === '2-3' ? 2 : 3), yas, Math.random) }];
    }
    if (a.tip === 'saykoy' && !kayitli('tr/c-saykoy-giris')) {
      return [{ tip: 'yakala', sorular: tarifSorulari(a.turlar.map((t) => t.ifade), a.turlar.length, yas, Math.random) }];
    }
    if (a.tip === 'balon' && !oyunHazir('balon')) {
      const hedefler = [...new Map(a.sorular.map((q) => [q.hedef.id, q.hedef])).values()];
      const diger = a.sorular.flatMap((q) => q.secenekler).filter((w) => !hedefler.some((x) => x.id === w.id));
      return [{ tip: 'ogret', sorular: ogretSorulari(hedefler, diger, Math.min(4, a.sorular.length), Math.random) }];
    }
    if (a.tip === 'besle' && !oyunHazir('besle')) return [];
    if (a.tip === 'eslestir' && !oyunHazir('eslestir')) return [];
    if (a.tip === 'eksik' && !oyunHazir('eksik')) {
      const hedefler = [...new Map(a.turlar.map((t) => [t.eksik.id, t.eksik])).values()];
      return [{ tip: 'ogret', sorular: ogretSorulari(hedefler, a.turlar.flatMap((t) => t.gosterilen), Math.min(4, a.turlar.length), Math.random) }];
    }
    if (a.tip === 'resim') {
      if (!(unite && sahneResmi(unite.id) && sahneYerlesimiVar(unite.id))) return [];
      // sahnede yeri henüz belirlenmemiş kelime (sonradan eklenenler) sahneye rastgele konmaz
      const yerli = (w: Kelime) => sahnedeYeriVar(unite.id, w.id);
      return [{ ...a, kelimeler: a.kelimeler.filter(yerli), sorular: a.sorular.filter(yerli) }];
    }
    return [a];
  });
}

/** Çocuğun bitirdiği cümle derslerinin (her adanın 4. ve 5. dersi) cümleleri */
function ogrenilenCumleler(k: Kayit): Ifade[] {
  return UNITELER.flatMap((u) => {
    const x = ilerisi(u);
    if (!x) return [];
    return [...(k.dersler[dersKimligi(u, 3)] ? x.a.ifadeler : []), ...(k.dersler[dersKimligi(u, 4)] ? x.b.ifadeler : [])];
  });
}

function planKur(p: DersParametresi, k: Kayit, yas: Yas): { adimlar: Adim[]; unite: Unite | null; baslik: string } {
  const simdi = Date.now();
  if (p.tur === 'bahce') {
    const adimlar = hayvanPlani({ no: 2, yas, ilk: false, isinma: [], acik: hayvanAcik }).filter((a) => a.tip === 'bahce');
    return { adimlar, unite: null, baslik: 'Hayvanat Bahçesi' };
  }
  if (p.tur === 'saklambac') return { adimlar: [saklambacPlani(yas)], unite: null, baslik: 'Hide & Seek' };
  if (p.tur === 'bilmece' || p.tur === 'farkli') {
    const oyun = p.tur === 'bilmece' ? bilmeceOyunu(k, yas) : farkliOyunu(k, yas);
    return { adimlar: oyun ? [{ tip: 'adaoyunu', oyun, yedek: { tip: 'veda', unite: false } }] : [], unite: null, baslik: p.tur === 'bilmece' ? 'Polly’s Riddles' : 'Odd One Out' };
  }
  if (p.tur === 'renkli') return { adimlar: [{ tip: 'adaoyunu', oyun: renkliPlani(yas), yedek: { tip: 'veda', unite: false } }], unite: null, baslik: 'Renkli Kino' };
  if (p.tur === 'sarki') {
    const sarki = sarkiBul(p.id);
    return { adimlar: sarki ? [{ tip: 'sarki', sarki }] : [], unite: sarki ? uniteBul(sarki.uniteId) ?? null : null, baslik: sarki?.en ?? '' };
  }
  if (p.tur === 'kitap') {
    // çizimlerin hepsi gelmeden kitap açılmaz (taslak kipinde yer tutucularla açılır)
    const hazir = p.ad === 'gol' && (TASLAK || (kanitCizimleri().every((y) => !!resim(y)) && (TEST_MODU || kanitSesleri().every((id) => !!sesAdresi(id)))));
    return { adimlar: hazir ? [{ tip: 'kitap', kitap: p.ad }] : [], unite: uniteBul('ciftlik') ?? null, baslik: 'Kino at the Lake' };
  }
  if (p.tur === 'masal') {
    const unite = uniteBul(p.uniteId)!;
    const x = ilerisi(unite);
    if (!x) return { adimlar: [], unite, baslik: 'Masallar' };
    // Masal 2.0: adanın yeni masalının çizimleri ve sesleri tamamsa kitap onu açar (Çiftlik → Kino at the Lake)
    const m2 = adaninMasal2si(unite.id);
    if (m2) {
      return { adimlar: [{ tip: 'masal2', masal: m2.ad }, { tip: 'masaloyun', uniteId: unite.id, sayfalar: masal2Sayfalari(m2), baslik: m2.en, soruKumesi: m2.ad, kapak: m2.kapak }], unite, baslik: m2.en };
    }
    const sayfalar = x.hikaye.sayfalar;
    // 22 Kasım 2026 (Barış): önce masal, sonra ayrı bir oyun: resimli anlama soruları (yankı okuma kalktı)
    return {
      adimlar: [{ tip: 'hikaye', hikaye: x.hikaye, aciklama: `tr/d-${unite.id}-h`, kitap: true }, { tip: 'masaloyun', uniteId: unite.id, sayfalar, baslik: x.hikaye.en }],
      unite, baslik: x.hikaye.en,
    };
  }
  if (p.tur === 'ders') {
    const unite = uniteBul(p.uniteId)!;
    const calisilan = dersKelimeleri(unite, p.no).filter(kelimeAcik).map((w) => w.id);
    const bilinen = kelimeler(ogrenilenler(k).filter((id) => !calisilan.includes(id)));
    const isinma = kelimeler(tekrarSec(k, simdi, 2, calisilan));
    // selamlaşmanın günlük sözü, çocuğun bitirdiği üst seviye ders sayısına göre döner
    // Çiftlik adasının ilk üç dersi hayvan dersleridir: 12, 30, 100 hayvan (Hayvan Geçidi, Hayvanat Bahçesi)
    if (unite.id === 'ciftlik' && p.no <= 2) {
      const adimlar = hazirAdimlar(hayvanPlani({ no: p.no as 0 | 1 | 2, yas, ilk: !k.tanisildi, isinma, acik: hayvanAcik, sarki: adaninSarkisi(unite.id) }), unite, yas);
      return { adimlar, unite, baslik: `${unite.en} · ${unite.tr}` };
    }
    const ustDersSayisi = Object.keys(k.dersler).filter((id) => (dersBul(id)?.no ?? 0) >= 3).length;
    const adimlar = hazirAdimlar(dersPlani({ unite, no: p.no, yas, bilinen, isinma, ilk: !k.tanisildi, acik: kelimeAcik, ustDersSayisi }), unite, yas);
    return { adimlar, unite, baslik: p.no < 3 ? `${unite.en} · ${unite.tr}` : `${unite.en} · ${DERS_ADI[p.no]}` };
  }
  const ogrenilen = kelimeler(ogrenilenler(k));
  if (p.tur === 'tekrar') {
    const odak = kelimeler(tekrarSec(k, simdi, 6));
    const diger = ogrenilen.filter((w) => !odak.some((x) => x.id === w.id));
    const adimlar: Adim[] = [oyunPlani('bul', odak, diger, yas)];
    // cümle derslerini bitirmiş çocuğun tekrarına öğrendiği cümleler de girer (unutulmasın): bir gün dürbün, bir gün cümle kurma
    const cumleler = ogrenilenCumleler(k);
    if (cumleler.length >= 3) {
      const secilen = farkliOzneler(cumleler, 4, Math.random);
      if (Math.floor(simdi / GUN_MS) % 2) adimlar.push({ tip: 'kur', turlar: kurTurlari(secilen.slice(0, 2), yas, Math.random) });
      else adimlar.push({ tip: 'yakala', sorular: tarifSorulari(secilen, 3, yas, Math.random) });
    }
    return { adimlar, unite: null, baslik: 'Günün Tekrarı' };
  }
  // Fener Avı: vadesi gelen (unutulmak üzere olan) kelimelerin adası öne alınır
  const adaylar = fenerAdaylari(k);
  return { adimlar: adaylar.length ? [fenerPlani(adaylar, tekrarSec(k, simdi, 6))] : [], unite: null, baslik: 'Fener Avı' };
}

function planSesleri(adimlar: Adim[], ek: string[] = []): string[] {
  const idler = new Set<string>(['en/g-yes', 'en/g-no', 'en/g-hello', 'en/g-goodbye', 'en/g-great-job', 'en/g-well-done', 'en/g-wow', 'en/g-your-turn', 'en/g-super', 'en/g-good-job', 'en/g-excellent', 'en/g-say-it', 'en/g-now-you', ...ek]);
  const ekle = (w: Kelime) => { for (const s of kelimeSesleri(w)) idler.add(s.id); };
  for (const a of adimlar) {
    if (a.tip === 'tanis') ekle(a.kelime);
    else if (a.tip === 'soyle' || a.tip === 'eslestir' || a.tip === 'resim') a.kelimeler.forEach(ekle);
    else if (a.tip === 'fener') fenerSesleri(a).forEach((id) => idler.add(id));
    else if (a.tip === 'eksik') a.turlar.forEach((t) => t.gosterilen.forEach(ekle));
    else if (a.tip === 'say') { idler.add('en/g-how-many'); a.turlar.forEach((t) => t.secenekler.forEach(ekle)); }
    else if (a.tip === 'selam' && a.rutin) rutinSesleri(a.rutin).forEach((id) => idler.add(id));
    else if (a.tip === 'giydir') { giydirSesleri(a).forEach((id) => idler.add(id)); a.raf.forEach((w) => idler.add(`en/w-${w.id}`)); }
    else if (a.tip === 'sasirt') { ['tr/c-sasirt-giris', 'en/g-look-again', 'en/g-oops-silly-polly', 'en/g-yes'].forEach((id) => idler.add(id)); a.turlar.forEach((t) => { idler.add(`en/y-${t.soylenen.id}`); idler.add(`en/y-${t.goster.id}`); idler.add(`en/w-${t.goster.id}`); }); }
    else if (a.tip === 'masaloyun') {
      ['tr/c-masal-oyun-giris', 'en/g-find-the-picture', 'en/g-yes'].forEach((id) => idler.add(id));
      const kume = a.soruKumesi ?? a.uniteId;
      (MASAL_SORULARI[kume] ?? []).forEach((m, i) => { idler.add(masalSorusuSesi(kume, i)); m.secenekler.forEach((w) => idler.add(`en/w-${w}`)); });
      a.sayfalar.forEach((f) => idler.add(f.ses));
    }
    else if (a.tip === 'gecit') { ['tr/c-gecit-giris', 'en/g-who-is-it'].forEach((id) => idler.add(id)); a.hayvanlar.forEach((w) => { idler.add(`en/c-${w.id}`); idler.add(`en/w-${w.id}`); if (w.efekt || sesAdresi(`efekt/${w.id}`)) idler.add(`efekt/${w.id}`); }); }
    else if (a.tip === 'bahce') {
      ['tr/c-bahce-giris', 'en/g-yes', 'en/g-yuz-hayvan'].forEach((id) => idler.add(id));
      // hayvan sesleri (yüz hayvan, 23 Kasım)
      for (const x of a.bolumler) x.hayvanlar.forEach((w) => { if (sesAdresi(`efekt/${w.id}`)) idler.add(`efekt/${w.id}`); });
      for (const x of a.bolumler) { idler.add(`en/g-bahce-${x.grup}`); x.hayvanlar.forEach((w) => idler.add(`en/w-${w.id}`)); x.sorular.forEach((w) => { idler.add(`en/q-${w.id}`); idler.add(`en/c-${w.id}`); }); }
    }
    else if (a.tip === 'saklambac') saklambacSesleri(a).forEach((id) => idler.add(id));
    else if (a.tip === 'adaoyunu') adaOyunuSesleri(a.oyun).forEach((id) => idler.add(id));
    else if (a.tip === 'yerlestir') yerlestirSesleri(a.plan, (id) => !!sesAdresi(`efekt/${id}`)).forEach((id) => idler.add(id));
    else if (a.tip === 'ovala') ovalaSesleri(a.plan).forEach((id) => idler.add(id));
    else if (a.tip === 'masal2') { const m = masal2Bul(a.masal); if (m) masal2Sesleri(m).forEach((id) => idler.add(id)); }
    else if (a.tip === 'kitap') kanitSesleri().forEach((id) => idler.add(id));
    else if (a.tip === 'canlandir') { canlandirSesleri(a.plan).forEach((id) => idler.add(id)); idler.add('en/g-listen'); a.plan.kelimeler.forEach((w) => idler.add(`en/w-${w.id}-yavas`)); }
    else if (a.tip === 'posta') { idler.add('tr/c-posta-giris'); a.evler.forEach((f) => idler.add(f.ses)); }
    else if (a.tip === 'saykoy') { idler.add('tr/c-saykoy-giris'); SAYI_KELIMELERI.forEach((id) => idler.add(`en/w-${id}`)); }
    else if (a.tip === 'dogrumu') { idler.add('tr/c-dogrumu-giris'); idler.add(DOGRUMU_YEDEK_YONERGE); a.sorular.forEach((q) => { idler.add(q.soylenen.ses); idler.add(q.gosterilen.ses); }); }
    else if (a.tip === 'yakala') { idler.add('tr/c-yakala-giris'); a.sorular.forEach((q) => q.secenekler.forEach((f) => idler.add(f.ses))); }
    else if (a.tip === 'tarif') a.sorular.forEach((q) => q.secenekler.forEach((f) => idler.add(f.ses)));
    else if (a.tip === 'kur') a.turlar.forEach((t) => { idler.add(t.ifade.ses); t.taslar.forEach((p) => idler.add(p.ses)); });
    else if (a.tip === 'hafiza2') idler.add('tr/c-eslestir-giris');
    else if (a.tip === 'soyle2') idler.add(a.giris);
    else if (a.tip === 'sensor') idler.add('tr/c-sensor-giris');
    else if (a.tip === 'bul' || a.tip === 'tekrar' || a.tip === 'balon' || a.tip === 'besle' || a.tip === 'ogret' || a.tip === 'yap' || a.tip === 'kapi') a.sorular.forEach((q) => q.secenekler.forEach(ekle));
  }
  // Kino'ya Öğret: Kino'nun on beş sözü (her soruda başkası çalar)
  if (adimlar.some((a) => a.tip === 'ogret')) Object.keys(KINO_SOZLERI).forEach((ad) => idler.add(`tr/kino-${ad}`));
  return [...idler];
}

/**
 * Üst seviye adımlarının özel çizimleri (hikâye resimleri, cümle resimleri) ders başında önceden yüklenir:
 * yavaş cihazda hikâyenin ilk resmi bir an boş çerçeve olarak görünüyordu.
 */
function cizimleriHazirla(adimlar: Adim[]) {
  const yollar = new Set<string>();
  const ekle = (f: Ifade) => { if (f.g.ozel) yollar.add(f.g.ozel); };
  for (const a of adimlar) {
    if (a.tip === 'hikaye') a.hikaye.sayfalar.forEach(ekle);
    else if (a.tip === 'sirala') a.sayfalar.forEach(ekle);
    else if (a.tip === 'anlat') ekle(a.ifade);
    else if (a.tip === 'tarif' || a.tip === 'yakala') a.sorular.forEach((q) => q.secenekler.forEach(ekle));
    else if (a.tip === 'dogrumu') a.sorular.forEach((q) => ekle(q.gosterilen));
    else if (a.tip === 'hafiza2' || a.tip === 'soyle2') a.ifadeler.forEach(ekle);
    else if (a.tip === 'sensor') a.turlar.forEach((t) => { if (t.soru.g.ozel) yollar.add(t.soru.g.ozel); });
    else if (a.tip === 'kur') a.turlar.forEach((t) => ekle(t.ifade));
    else if (a.tip === 'sohbet') a.turlar.forEach((t) => { if (t.soru.g.ozel) yollar.add(t.soru.g.ozel); });
    else if (a.tip === 'kitap') kanitCizimleri().forEach((y) => yollar.add(y));
  }
  for (const y of yollar) { const adres = resim(y); if (adres) new Image().src = adres; }
}

export function dersEkrani(kok: HTMLElement, p: DersParametresi, git: Gezinme): () => void {
  let kayit = oku();
  const { adimlar, unite, baslik } = planKur(p, kayit, git.yas);
  const dersId = p.tur === 'ders' ? dersKimligi(unite!, p.no) : '';
  /** dersin yeni kelimeleri (çıkartmaları): kelime derslerinde o dersin, şenlikte ünitenin açık kelimeleri; üst seviyelerde yok */
  const hayvanCikartmasi = (ids: readonly string[]) => unite!.kelimeler.filter((w) => ids.includes(w.id)).filter(kelimeAcik);
  const dersYenileri: Kelime[] = p.tur !== 'ders' || p.no > 2 ? []
    // hayvan derslerinde (Çiftlik 1–2) çıkartma, dersin hayvanlarından ünitenin kelimesi olanlardır
    : unite?.id === 'ciftlik' && p.no < 2 ? hayvanCikartmasi(p.no === 0 ? HAYVAN_DERSI_1 : HAYVAN_DERSI_2)
    : p.no === 2 ? acikKelimeler(unite!) : yeniKelimeler(unite!, p.no).filter(kelimeAcik);
  // sorulacak kelime yoksa (henüz hiç kelime öğrenilmemiş) oyun açılmaz: Oyunlar'a dönülür
  if (p.tur !== 'ders' && p.tur !== 'masal' && p.tur !== 'kitap' && p.tur !== 'sarki' && soruSayisi(adimlar) === 0) { window.setTimeout(() => git.oyunlar(), 0); return () => {}; }
  if ((p.tur === 'masal' || p.tur === 'kitap') && !adimlar.length) { window.setTimeout(() => git.masallar(), 0); return () => {}; }
  if (p.tur === 'sarki' && !adimlar.length) { window.setTimeout(() => git.ana(), 0); return () => {}; }
  const geri = () => { tik.dokun(); if (p.tur === 'ders') git.adalar(p.uniteId); else if (p.tur === 'masal' || p.tur === 'kitap') git.masallar(); else if (p.tur === 'sarki') git.ana(); else git.oyunlar(); };
  let tekrarFn: (() => void) | undefined;
  const gosterge = h('div.ing-ust-orta');
  const ust = h('header.ing-ust', {},
    simgeDugme('geri', p.tur === 'ders' ? 'Adalara dön' : p.tur === 'masal' || p.tur === 'kitap' ? 'Kitaplığa dön' : 'Oyunlara dön', geri, 'ing-geri'),
    gosterge,
    simgeDugme('hoparlor', 'Yeniden dinle', () => tekrarFn?.(), 'ing-tekrar-dinle'),
  );
  const alan = h('div.ing-ders-alan');
  kok.append(ust, alan);
  kok.dataset.baslik = baslik;

  let adimNo = 0, hata = 0, birak: (() => void) | undefined, kapandi = false;
  // yalnız test kipinde: ?adim=<tip> dersi o türün ilk adımından açar (uçtan uca testler ara adımı doğrudan dener)
  if (TEST_MODU) { const tip = new URLSearchParams(location.search).get('adim'); const i = tip ? adimlar.findIndex((x) => x.tip === tip) : -1; if (i > 0) adimNo = i; }
  const gorulen = new Set<string>();
  /** bu derste oynamış mini animasyonlar (tanışma, ödül, kapanış) */
  const oynayanlar = () => new Set(MINI_ANIMASYONLAR.filter((x) => gorulen.has(dersAnahtari(x))).map((x) => x.id));
  // doğru cevap ödülü (22 Kasım 2026 gece): ilk denemede üç doğru üst üste gelince köşede bir tur mini animasyon
  let seri = 0, odulSayisi = 0, odulKaldir: (() => void) | undefined;
  function odulVer(kelimeId: string, ilkDenemede: boolean) {
    seri = ilkDenemede ? seri + 1 : 0;
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ma = odulAnimasyonu(animasyonGorunur, oynayanlar(), sonKutlama(), kelimeId, seri, odulSayisi);
    const mini = ma ? miniAnimasyon(ma, { bekle: true, sinif: 'ing-ma-odul' }) : null;
    if (!ma || !mini) return;
    seri = 0; odulSayisi++; gorulen.add(dersAnahtari(ma));
    odulKaldir?.();
    const kutu = h('div.ing-ma-odul-kutu', { 'aria-hidden': 'true' }, mini.el);
    kok.append(kutu);
    mini.oynat(1);
    const z1 = window.setTimeout(() => kutu.classList.add('ing-ma-gidiyor'), sure(turSuresi(ma) + 250));
    const z2 = window.setTimeout(() => odulKaldir?.(), sure(turSuresi(ma) + 600));
    odulKaldir = () => { clearTimeout(z1); clearTimeout(z2); mini.durdur(); kutu.remove(); odulKaldir = undefined; };
  }
  sesHazirla(planSesleri(adimlar, p.tur === 'ders' ? dersSesKimlikleri(unite!, p.no) : []));
  cizimleriHazirla(adimlar);

  const baglam = (): AdimBaglami => ({
    alan,
    yas: git.yas,
    unite,
    bitti: () => { if (kapandi) return; adimNo++; adimGoster(); },
    cevap: (kelimeId, ilkDenemede) => { kayit = cevapIsle(oku(), kelimeId, ilkDenemede, Date.now()); yaz(kayit); if (p.tur === 'ders') odulVer(kelimeId, ilkDenemede); },
    hata: () => { hata++; },
    tekrarla: (fn) => { tekrarFn = fn; },
    ilkKez: (anahtar) => { if (gorulen.has(anahtar)) return false; gorulen.add(anahtar); return true; },
  });

  function adimGoster() {
    birak?.(); birak = undefined; tekrarFn = undefined;
    sus();
    if (adimNo >= adimlar.length) { bitir(); return; }
    const a = adimlar[adimNo];
    gosterge.replaceChildren(noktalar(adimlar.length, adimNo));
    kok.dataset.adim = a.tip;
    const b = baglam();
    switch (a.tip) {
      case 'selam': birak = selamKur(b, a); break;
      case 'veda': birak = vedaKur(b, a); break;
      case 'tanis': birak = tanisKur(b, a); break;
      case 'bul': case 'tekrar': birak = bulKur(b, a); break;
      case 'ogret': birak = ogretKur(b, a); break;
      case 'balon': birak = balonKur(b, a); break;
      case 'eksik': birak = eksikKur(b, a); break;
      case 'besle': birak = besleKur(b, a); break;
      case 'eslestir': birak = eslestirKur(b, a); break;
      case 'resim': birak = resimKur(b, a); break;
      case 'fener': birak = fenerKur(b, a); break;
      case 'say': birak = sayKur(b, a); break;
      case 'yap': birak = yapKur(b, a); break;
      case 'kapi': birak = kapiKur(b, a); break;
      case 'soyle': birak = soyleKur(b, a); break;
      case 'anlat': birak = anlatKur(b, a); break;
      case 'tarif': birak = tarifKur(b, a); break;
      case 'kur': birak = kurKur(b, a); break;
      case 'sohbet': birak = sohbetKur(b, a); break;
      case 'hikaye': birak = hikayeKur(b, a); break;
      case 'sirala': birak = siralaKur(b, a); break;
      case 'dogrumu': birak = dogruMuKur(b, a); break;
      case 'yakala': birak = yakalaKur(b, a); break;
      case 'hafiza2': birak = hafiza2Kur(b, a); break;
      case 'soyle2': birak = soyle2Kur(b, a); break;
      case 'saykoy': birak = sayKoyKur(b, a); break;
      case 'posta': birak = postaKur(b, a); break;
      case 'giydir': birak = giydirKur(b, a); break;
      case 'sarki': birak = sarkiKur(b, a); break;
      case 'gecit': birak = gecitKur(b, a); break;
      case 'masaloyun': birak = masalOyunKur(b, a); break;
      case 'sasirt': birak = sasirtKur(b, a); break;
      case 'bahce': birak = bahceKur(b, a); break;
      case 'saklambac': birak = saklambacKur(b, a); break;
      case 'adaoyunu': birak = adaOyunuKur(b, a); break;
      case 'yerlestir': birak = yerlestirKur(b, a); break;
      case 'canlandir': birak = canlandirKur(b, a); break;
      case 'ovala': birak = ovalaKur(b, a); break;
      case 'masal2': birak = masal2Kur(b, a); break;
      case 'kitap': birak = kitapKur(b, a); break;
      case 'sensor': birak = senSorKur(b, a); break;
    }
  }

  function bitir() {
    odulKaldir?.();
    kok.dataset.adim = 'sonuc';
    gosterge.replaceChildren();
    tekrarFn = undefined;
    const yildiz = yildizHesapla(hata, soruSayisi(adimlar));
    let kazanilan: Kelime[] = [];
    let uniteBitti = false;
    kayit = oku();
    if (p.tur === 'ders') {
      kazanilan = dersYenileri.filter((w) => !kayit.cikartmalar.includes(w.id));
      kayit = { ...dersBitir(kayit, dersId, yildiz, dersYenileri.map((w) => w.id), Date.now()), tanisildi: true };
      uniteBitti = p.no === 2;
    } else if (p.tur === 'tekrar') {
      const ilk = !bugunTekrarEdildi(kayit, Date.now());
      kayit = tekrarBitir(kayit, Date.now());
      void ilk;
    }
    yaz(kayit);
    mikrofonKapat();

    const { tahta } = yuzYuze(alan, 'ing-sonuc');
    const dugmeler = h('div.ing-sonuc-dugmeler');
    const siradaki = siradakiDers(kayit, (d) => dersHazir(d.unite, d.no));
    if (p.tur === 'ders') {
      if (siradaki) {
        dugmeler.append(dugme('ing-ana-dugme', 'Sıradaki ders', () => { tik.sec(); git.ders({ tur: 'ders', uniteId: siradaki.unite.id, no: siradaki.no }); }, 'Sıradaki ders ', h('span.ing-ok', { 'aria-hidden': 'true' }, '▶')));
      }
      dugmeler.append(dugme('ing-yan-dugme', 'Adalara dön', () => { tik.dokun(); git.adalar(unite!.id); }, 'Adalar'));
    } else if (p.tur === 'sarki') {
      dugmeler.append(
        dugme('ing-ana-dugme', 'Bir daha söyle', () => { tik.sec(); git.ders(p); }, 'Bir daha söyle'),
        dugme('ing-yan-dugme', 'Ana ekran', () => { tik.dokun(); git.ana(); }, 'Ana ekran'),
      );
    } else if (p.tur === 'masal' || p.tur === 'kitap') {
      dugmeler.append(
        dugme('ing-ana-dugme', 'Bir daha oku', () => { tik.sec(); git.ders(p); }, 'Bir daha oku'),
        dugme('ing-yan-dugme', 'Kitaplığa dön', () => { tik.dokun(); git.masallar(); }, 'Kitaplık'),
      );
    } else {
      dugmeler.append(
        dugme('ing-ana-dugme', 'Tekrar oyna', () => { tik.sec(); git.ders(p); }, 'Tekrar oyna'),
        dugme('ing-yan-dugme', 'Oyunlara dön', () => { tik.dokun(); git.oyunlar(); }, 'Oyunlar'),
      );
    }
    const cikartmalar = h('div.ing-sonuc-cikartmalar');
    for (const w of dersYenileri) {
      const c = cikartmaResmi(w, 'ing-mini-cikartma');
      const d = dugme('ing-sonuc-cikartma', `${w.en}, ${w.tr}`, () => { kutla(d); void konus(`en/w-${w.id}`); }, c, h('small', { lang: 'en-US' }, w.en));
      cikartmalar.append(d);
    }
    // Fener Avı: bulunanların hepsi sonuçta durur; dokununca adı yeniden dinlenir
    if (p.tur === 'fener') {
      for (const a of adimlar) if (a.tip === 'fener') for (const x of a.sahneler) for (const w of x.sorular) {
        const d = dugme('ing-sonuc-cikartma', `${w.en}, ${w.tr}`, () => { kutla(d); void konus(`en/w-${w.id}`); }, cikartmaResmi(w, 'ing-mini-cikartma'), h('small', { lang: 'en-US' }, w.en));
        cikartmalar.append(d);
      }
    }
    // üst seviyelerde çıkartma yerine dersin cümleleri durur: dokununca yeniden dinlenir
    const ustSeviye = p.tur === 'ders' && p.no > 2;
    if (ustSeviye) {
      cikartmalar.classList.add('ing-sonuc-cumleler');
      const gosterilecek: Ifade[] = dersIfadeleri(unite!, p.no).filter((f) => !f.g.ozel?.startsWith('ui/')).slice(0, 4);
      for (const f of gosterilecek) {
        const d = dugme('ing-sonuc-cikartma ing-sonuc-cumle', f.tr, () => { kutla(d); void konus(f.ses); }, gorselCiz(f.g, 'ing-mini-cikartma'), h('small', { lang: 'en-US' }, f.en));
        cikartmalar.append(d);
      }
    }
    const ustBaslik: Record<number, string> = { 3: 'Yeni cümleler!', 4: 'Yeni cümleler!', 5: 'Cümleler tamam!', 6: 'Harika konuştun!', 7: 'Cümle ustası!', 8: 'Hikâye bitti!' };
    const basliklar = p.tur === 'sarki' ? 'Şarkı bitti!' : p.tur === 'masal' || p.tur === 'kitap' ? 'Masal bitti!' : p.tur === 'fener' ? 'Hepsini buldun!' : uniteBitti ? 'Adan canlandı!' : ustSeviye ? ustBaslik[p.no] : p.tur === 'ders' ? (kazanilan.length ? `${kazanilan.length} yeni kelime!` : 'Harika!') : 'Harika!';
    tahta.append(h('h2.ing-sonuc-baslik', {}, basliklar), yildizlar(yildiz, 3, 'ing-sonuc-yildiz'), cikartmalar, dugmeler);
    // kelime dersinin sonunda kapanış mini animasyonu: her seferinde başka biri, bu derste oynamamış olan (22 Kasım 2026);
    // ödül hiçbir zaman sonuncuyu almaz, kapanışa en az biri kalır
    if (p.tur === 'ders') {
      const ma = kutlamaAnimasyonu(animasyonGorunur, oynayanlar(), sonKutlama());
      const mini = ma ? miniAnimasyon(ma, { dokun: true, sinif: 'ing-ma-kutlama' }) : null;
      if (ma && mini) { gorulen.add(dersAnahtari(ma)); sonKutlama(ma.id); tahta.append(mini.el); }
    }
    yildizYagmuru();
    const kapanis = p.tur !== 'ders' ? aferin() : p.no < 2 ? 'tr/c-ders-bitti' : p.no === 2 ? 'tr/c-unite-bitti' : p.no <= 5 ? 'tr/c-cumle-bitti' : p.no === 8 ? 'tr/c-hikaye-bitti' : 'tr/c-konusma-bitti';
    void konus('en/g-great-job', kapanis);
  }

  adimGoster();
  return () => { kapandi = true; odulKaldir?.(); birak?.(); sus(); mikrofonKapat(); delete kok.dataset.adim; delete kok.dataset.baslik; };
}

/** Müfredattaki bütün dersler içinde hazır olan ünitelerin dersleri */
export const hazirDersler = () => TUM_DERSLER.filter((d) => dersHazir(d.unite, d.no));
