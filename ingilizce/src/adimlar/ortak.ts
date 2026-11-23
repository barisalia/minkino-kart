/**
 * Ders adımlarının ortak parçaları: adım sözleşmesi, iki sahne düzeni (yüz yüze ders, oyun masası),
 * "şimdi sen söyle" kutusu.
 */
import { h } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import type { Unite } from '../icerik';
import { bekle, cizim, dugme, ipucuKur, kisi, pozBirak, pozTut } from '../kit';
import { sozEslesti } from '../../../src/audio/soz-esle';
import { sozDinle, sozTanimaHazirla, type SozDinleme } from '../../../src/audio/soz-tanima';
import { dinle, mikrofonAc, mikrofonKapat, mikrofonTercihi, type Dinleme } from '../mikrofon';
import type { Adim, Yas } from '../plan';
import { konus, konusuyorMu, tik } from '../ses';
import { sesAdresi } from '../varlik';

export interface AdimBaglami {
  /** adımın çizileceği boş alan */
  alan: HTMLElement;
  yas: Yas;
  /** dersin ünitesi (Oyunlar bölümünde yok) */
  unite: Unite | null;
  /** adım tamamlandı: sıradaki adıma geç */
  bitti(): void;
  /** bir geri çağırma sorusunun sonucu (aralıklı tekrar kaydı) */
  cevap(kelimeId: string, ilkDenemedeDogru: boolean): void;
  /** yıldız hesabı için bir hata say */
  hata(): void;
  /** üstteki "yeniden dinle" düğmesi ne yapsın */
  tekrarla(fn: (() => void) | undefined): void;
  /** bu derste Ceren'in bir açıklaması ilk kez mi yapılıyor (aynı açıklama her soruda yinelenmez) */
  ilkKez(anahtar: string): boolean;
}

export type AdimKurucu<T extends Adim['tip'] = Adim['tip']> = (b: AdimBaglami, a: Extract<Adim, { tip: T }>) => () => void;

/** Adımın ömrü: `acik` false olunca süren akışlar durur; zamanlayıcılar temizlenir */
export function yasam() {
  let acik = true, akisNo = 0;
  const zamanlar = new Set<number>();
  const birakilacak: (() => void)[] = [];
  return {
    get acik() { return acik; },
    sonra(fn: () => void, ms: number) {
      const z = window.setTimeout(() => { zamanlar.delete(z); if (acik) fn(); }, ms);
      zamanlar.add(z);
      return z;
    },
    /**
     * Sırayla söyler ve adım hâlâ açıksa true döner. Çocuk "yeniden dinle"ye basıp sözü kesse de akış kilitlenmez:
     * kesilen söz bitmiş sayılır. Yeniden başlatılabilen akışlar `yeniAkis` ile kendini denetler.
     */
    async soyle(...idler: string[]): Promise<boolean> {
      if (!acik) return false;
      await konus(...idler);
      return acik;
    },
    /** Yeniden başlatılabilen akış: her çağrı öncekini geçersiz kılar; dönen işlev false ise o akış bırakılır */
    yeniAkis(): () => boolean {
      const no = ++akisNo;
      return () => acik && no === akisNo;
    },
    async dur(ms: number): Promise<boolean> { await bekle(ms); return acik; },
    kapaninca(fn: () => void) { birakilacak.push(fn); },
    kapat() {
      acik = false;
      zamanlar.forEach((z) => clearTimeout(z));
      zamanlar.clear();
      birakilacak.forEach((fn) => fn());
      ipucuKur(undefined);
    },
  };
}
export type Yasam = ReturnType<typeof yasam>;

/** Yüz yüze ders düzeni: solda büyük Ceren Öğretmen, sağda tahta alanı */
export function yuzYuze(alan: HTMLElement, sinif = ''): { kok: HTMLElement; tahta: HTMLElement } {
  const tahta = h('div.ing-tahta');
  const kok = h('section.ing-yuzyuze', {}, kisi('ceren', 'ing-hoca'), tahta);
  if (sinif) kok.classList.add(...sinif.split(' ').filter(Boolean));
  alan.replaceChildren(kok);
  return { kok, tahta };
}

/** Oyun düzeni: solda Polly ve küçük Ceren, sağda oyun masası */
export function oyunDuzeni(alan: HTMLElement, sinif = '', pollyeDokun?: () => void): { kok: HTMLElement; masa: HTMLElement; yan: HTMLElement } {
  const masa = h('div.ing-masa');
  const polly = kisi('polly', 'ing-yan-polly');
  const dinleDugmesi = dugme('ing-polly-dugme', 'Polly’yi yeniden dinle', () => { tik.dokun(); pollyeDokun?.(); }, polly);
  const yan = h('div.ing-yan', {}, dinleDugmesi, kisi('ceren', 'ing-yan-ceren'));
  const kok = h('section.ing-oyunduzeni', {}, yan, masa);
  if (sinif) kok.classList.add(...sinif.split(' ').filter(Boolean));
  alan.replaceChildren(kok);
  return { kok, masa, yan };
}

export interface SoyletSecenek {
  bekleyenMetin?: string;
  /**
   * Çocuğun söylemesi beklenen İngilizce söz ("cat", "I like apples"). Verilirse ve cihaz yalnız cihazda söz
   * tanıyabiliyorsa (src/audio/soz-tanima.ts) söylenen söz kontrol edilir: başka söz geçmez. Cihaz tanıyamıyorsa
   * eski yol (ses var/yok) sürer.
   */
  beklenen?: string;
  /** aynı ünitenin öbür kelimeleri: çocuk bunlardan birini söylerse kabul edilmez */
  rakipler?: string[];
  /** ikinci ıskada Polly'nin söyleyeceği yavaş örnek (ses kimliği) */
  ornek?: string;
  /**
   * Kendi başına söyleme (çıkartma adımı): söz önceden söylenmez. Verilirse ilk ıskada Ceren'in "Bir daha"sı yerine
   * bu ipucu çalar (Polly sözü söyler); eski yolda (ses var / yok) çocuk hiç ses çıkarmazsa da bir kez çalar.
   */
  ipucu?: string[];
  /** ipucu çalmadan hemen önce (sözün yazısı görünür olsun diye) */
  ipucuOncesi?: () => void;
}

/** Sözü tanınan dinlemede deneme sayısı: 1. ıska → Ceren "Bir daha", 2. ıska → Polly yavaş örnek, 3. ıska → yıldız */
const SOZ_DENEME = 3;

/**
 * "Şimdi sen söyle": mikrofon halkası çocuğun sesiyle dolar; dolunca ya da çocuk yıldıza dokununca çözülür.
 * Mikrofon yoksa yalnız yıldız düğmesi görünür. Ceren dinlerken elini kulağına götürür.
 * `beklenen` verilmişse ve cihaz yalnız cihazda tanıyabiliyorsa söylenen söz kontrol edilir: yanlış sesi yok, nazik
 * tekrar; üç denemede tutmazsa kendiliğinden onaylanmaz, yıldız düğmesi kalır (çocuk hiçbir zaman kilitlenmez).
 */
export function soylet(kap: HTMLElement, y: Yasam, o: SoyletSecenek = {}): Promise<void> {
  return new Promise((coz) => {
    const halka = h('div.ing-mik', { 'aria-hidden': 'true', html: IKON.mikrofon });
    const yildiz = dugme('ing-yildiz-dugme', 'Söyledim, devam et', () => bitir(true), cizim('ui/yildiz'), h('span', {}, o.bekleyenMetin ?? 'Söyledim!'));
    const kutu = h('div.ing-soylet', {}, halka, yildiz);
    kap.append(kutu);
    let bitti = false, ipucuCaldi = false, dinleme: Dinleme | undefined, sozDinleme: SozDinleme | undefined;
    const bitir = (dokunarak: boolean) => {
      if (bitti) return;
      bitti = true;
      dinleme?.birak();
      sozDinleme?.durdur();
      pozBirak('ceren');
      if (dokunarak) tik.sec();
      kutu.remove();
      coz();
    };
    y.kapaninca(() => { dinleme?.birak(); sozDinleme?.durdur(); pozBirak('ceren'); });
    yildiz.hidden = true;
    halka.hidden = true;
    const yildizaDon = (bekleme: number) => {
      halka.classList.add('ing-sustu');
      yildiz.hidden = false;
      yildiz.classList.add('ing-one-cik');
      pozBirak('ceren');
      ipucuKur(() => yildiz, bekleme);
    };

    /** Söz kontrollü dinleme (yalnız cihazda tanıma) */
    async function sozluDinle(beklenen: string) {
      // mikrofonu tanıyıcı tutar: web tarafının ses var/yok akışı kapanır (iki dinleyici aynı anda olmaz)
      mikrofonKapat();
      halka.hidden = false;
      y.sonra(() => { if (!bitti) yildiz.hidden = false; }, 2600);
      for (let deneme = 1; deneme <= SOZ_DENEME; deneme++) {
        while (konusuyorMu() && y.acik && !bitti) await bekle(120);
        if (bitti || !y.acik) return;
        halka.classList.remove('ing-sustu');
        pozTut('ceren', 'dinle-0');
        let dolu = 0;
        sozDinleme = sozDinle({
          dil: 'en-US',
          ipuclari: [beklenen],
          sureMs: 6000,
          seviye: (n) => {
            dolu = Math.min(1, dolu + n * 0.05);
            halka.style.setProperty('--dolu', dolu.toFixed(2));
            halka.style.setProperty('--anlik', n.toFixed(2));
          },
        });
        const r = await sozDinleme.sonuc;
        sozDinleme = undefined;
        if (bitti || !y.acik) return;
        pozBirak('ceren');
        if (r.durum === 'duydu' && sozEslesti(r.metinler, beklenen, { dil: 'en-US', rakipler: o.rakipler })) return bitir(false);
        // tanıyıcı o an çalışmadı: eski yola dön (çocuk sesle yine geçebilsin)
        if (r.durum === 'yok') return sesleDinle();
        if (r.durum === 'iptal' || deneme === SOZ_DENEME) break;
        halka.style.setProperty('--dolu', '0');
        // nazik tekrar: yanlış sesi yok
        if (o.ipucu) o.ipucuOncesi?.();
        const tekrar = deneme === 1 ? (o.ipucu ?? ['tr/c-bir-daha']) : o.ornek ? ['en/g-listen', o.ornek] : ['en/g-try-again'];
        if (!(await y.soyle(...tekrar))) return;
      }
      if (!bitti && y.acik) yildizaDon(2500);
    }

    void (async () => {
      // veli köşesinde "Mikrofonla söyleme" kapalıysa söz tanıma da kapalı (yalnız yıldız)
      const sozlu = !!o.beklenen && mikrofonTercihi() && (await sozTanimaHazirla('en-US', { izinIste: true }).catch(() => false));
      if (bitti || !y.acik) return;
      if (sozlu && o.beklenen) {
        while (konusuyorMu() && y.acik && !bitti) await bekle(120);
        if (bitti || !y.acik) return;
        return sozluDinle(o.beklenen);
      }
      return sesleDinle();
    })();

    /** Eski yol: yalnız ses var / yok (söz tanınamayan cihazlar ve tanıyıcının çalışmadığı an) */
    async function sesleDinle() {
      const acik = await mikrofonAc();
      // sırayla konuşma: hoparlörden söz çıkarken dinlenmez (çocuğun sesi yerine Polly'ninki sayılmasın)
      while (konusuyorMu() && y.acik && !bitti) await bekle(120);
      if (bitti || !y.acik) return;
      if (!acik) { yildiz.hidden = false; yildiz.classList.add('ing-one-cik'); ipucuKur(() => yildiz, 4000); return; }
      halka.hidden = false;
      pozTut('ceren', 'dinle-0');
      // çocuk takılmasın: kısa süre sonra dokunma yolu da görünür
      y.sonra(() => { if (!bitti) yildiz.hidden = false; }, 2600);
      dinleme = dinle({
        seviye: (dolu, anlik) => { halka.style.setProperty('--dolu', dolu.toFixed(2)); halka.style.setProperty('--anlik', anlik.toFixed(2)); },
        bitti: (konustu) => {
          if (bitti || !y.acik) return;
          if (konustu) return bitir(false);
          // kendi başına söylemede sessiz kalan çocuğa bir kez ipucu: Polly sözü söyler, dinleme yeniden açılır
          if (o.ipucu && !ipucuCaldi) {
            ipucuCaldi = true;
            dinleme = undefined;
            pozBirak('ceren');
            o.ipucuOncesi?.();
            halka.style.setProperty('--dolu', '0');
            void y.soyle(...o.ipucu).then((surdu) => { if (surdu && !bitti) void sesleDinle(); });
            return;
          }
          yildizaDon(2500);
        },
      });
    }
  });
}

/** Polly'nin sorduğu söz yazıyla da görünür (okuyan çocuk ve yanındaki büyük için); masanın üstüne konur */
export function soruBalonu(masa: HTMLElement): HTMLElement {
  const balon = h('div.ing-soz-balonu.ing-soru', { lang: 'en-US', 'aria-hidden': 'true' });
  masa.prepend(balon);
  return balon;
}
export function balonYaz(balon: HTMLElement, yazi: string) {
  balon.textContent = yazi;
  balon.classList.remove('ing-gorunur');
  void balon.offsetWidth;
  balon.classList.add('ing-gorunur');
}

/** Kaydı gelmiş sözler (çeşitleme sözleri isteğe bağlıdır; kaydı yoksa sıraya girmez) */
const kayitlilar = (idler: string[]): string[] => { const var_ = idler.filter((id) => !!sesAdresi(id)); return var_.length ? var_ : idler.slice(0, 1); };

/** Polly'nin övgüleri sırayla döner (hep aynı söz yinelenmesin) */
const OVGULER = ['en/g-great-job', 'en/g-super', 'en/g-well-done', 'en/g-good-job', 'en/g-wow', 'en/g-excellent'];
let ovguSirasi = 0;
export const ovgu = (): string => { const l = kayitlilar(OVGULER); return l[ovguSirasi++ % l.length]; };
/** "Sıra sende" sözleri de döner: Your turn! · Say it! · Now you! */
const SIRALAR = ['en/g-your-turn', 'en/g-say-it', 'en/g-now-you'];
let siraNo = 0;
export const sira = (): string => { const l = kayitlilar(SIRALAR); return l[siraNo++ % l.length]; };
/** Yeni bir oyunun yönergesi: kaydı gelene kadar aynı işi anlatan eski yönerge söylenir */
export const yonerge = (id: string, yedek: string): string => (sesAdresi(id) ? id : yedek);
const AFERINLER = ['tr/c-aferin-1', 'tr/c-aferin-2', 'tr/c-aferin-4'];
let aferinSirasi = 0;
export const aferin = (): string => AFERINLER[aferinSirasi++ % AFERINLER.length];
