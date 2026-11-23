/**
 * Ada oyunlarının (ada-oyunlari-veri.ts) ortak dinle-seç döngüsü: Polly söyler, çocuk doğru karta dokunur.
 * Yanlışta o kartın adı ve komut yinelenir; ikinci ıskada doğru kart parlar. Sahneyi ve ödülü her oyun kendi kurar.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { kelimeBul } from '../icerik';
import { cizim, dugme, ipucuKur, kelimeResmi, salla } from '../kit';
import { tik } from '../ses';
import { TASLAK } from '../varlik';
import type { AdimBaglami, Yasam } from './ortak';

export interface Kart { id: string; etiket: string; el: HTMLElement }

/** Oyunun bütün kart resimlerini baştan yükler: tur değişince kart bir an boş görünmesin */
export function resimleriOnYukle(idler: readonly string[]) {
  for (const id of new Set(idler)) {
    const w = kelimeBul(id);
    const el = w ? kelimeResmi(w) : null;
    const img = el?.querySelector('img');
    if (img) void img.decode().catch(() => {});
  }
}

/** Kelimenin kartı (resmi yoksa taslakta yer tutucu) */
export function kelimeKarti(id: string, sinif = ''): Kart {
  const w = kelimeBul(id);
  return { id, etiket: w?.tr ?? id, el: w ? kelimeResmi(w, sinif) : yerTutucu(id, sinif) };
}

/** Çizim ya da (taslak ve test kipinde) adı yazılı yer tutucu */
export function cizimYa(yol: string, sinif: string, ad: string): HTMLElement {
  return cizim(yol, sinif) ?? yerTutucu(ad, sinif);
}
const yerTutucu = (ad: string, sinif: string) => {
  const el = h('span.ing-ao-yer', {}, ad);
  if (sinif) el.classList.add(...sinif.split(' ').filter(Boolean));
  return el;
};

export interface SecimTuru {
  kartlar: Kart[];
  hedef: string;
  /** Polly'nin komutu (Polly'ye dokununca yinelenir) */
  soru: string[];
  /** aralıklı tekrar kaydına giden kelime */
  kelime?: string;
  /** kartlar konmadan önce sahne hazırlığı (perde açılır, saat ilerler); false: adım kapandı */
  hazirla?(): Promise<boolean>;
}

export interface SecimDongusu {
  b: AdimBaglami;
  y: Yasam;
  /** kartların dizildiği kutu */
  kutu: HTMLElement;
  turSayisi: number;
  tur(i: number): SecimTuru;
  /** yanlış karta dokununca söylenecekler (ardından komut yinelenir) */
  yanlis(id: string, t: SecimTuru): string[];
  /** doğru kart: sahnede ödül; false: adım kapandı */
  dogru(i: number, d: HTMLButtonElement, t: SecimTuru): Promise<boolean>;
  /** oyunun başında (Ceren'in girişi ilk kez + Polly) */
  giris(): Promise<boolean>;
  bitis?(): Promise<boolean>;
  /** yanlış kart söner ve bir daha seçilemez (Polly's Riddles) */
  yanlisSoner?: boolean;
}

/** Döngüyü başlatır; kutudaki kartlar her turda yeniden dizilir */
export function secimBaslat(o: SecimDongusu): void {
  const { b, y, kutu } = o;
  let no = 0, yanlis = 0, kilit = true, t: SecimTuru;
  const sor = () => { if (!kilit) void y.soyle(...t.soru); };
  b.tekrarla(sor);

  async function turGoster() {
    t = o.tur(no);
    yanlis = 0; kilit = true;
    kutu.replaceChildren();
    if (t.hazirla && !(await t.hazirla())) return;
    kutu.dataset.adet = String(t.kartlar.length);
    // test ve taslak kipinde doğru kart sayfadan okunur (uçtan uca testler)
    if (TEST_MODU || TASLAK) kutu.dataset.hedef = t.hedef;
    kutu.replaceChildren(...t.kartlar.map((k, i) => {
      const d = dugme('ing-secim ing-ao-kart', k.etiket, () => void sec(k.id, d), k.el);
      d.dataset.kart = k.id;
      d.style.setProperty('--n', String(i));
      return d;
    }));
    if (!(await y.dur(300)) || !(await y.soyle(...t.soru))) return;
    kilit = false;
    kutu.dataset.bekliyor = 'true';
    ipucuKur(() => (yanlis >= 2 ? kutu.querySelector(`[data-kart="${t.hedef}"]`) : null), 6000);
  }

  async function sec(id: string, d: HTMLButtonElement) {
    if (kilit) return;
    kilit = true;
    kutu.dataset.bekliyor = 'false';
    if (id !== t.hedef) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      if (o.yanlisSoner) { d.classList.add('ing-ao-sondu'); d.disabled = true; }
      if (!(await y.soyle(...o.yanlis(id, t), ...t.soru))) return;
      if (yanlis >= 2) kutu.querySelector(`[data-kart="${t.hedef}"]`)?.classList.add('ing-parla');
      kilit = false;
      kutu.dataset.bekliyor = 'true';
      return;
    }
    ipucuKur(undefined);
    tik.yapis();
    if (t.kelime) b.cevap(t.kelime, yanlis === 0);
    d.classList.add('ing-dogru');
    kutu.classList.add('ing-bitti');
    if (!(await o.dogru(no, d, t))) return;
    kutu.classList.remove('ing-bitti');
    no++;
    if (no < o.turSayisi) { void turGoster(); return; }
    kutu.replaceChildren();
    if (o.bitis && !(await o.bitis())) return;
    b.bitti();
  }

  void (async () => {
    if (!(await o.giris())) return;
    void turGoster();
  })();
}
