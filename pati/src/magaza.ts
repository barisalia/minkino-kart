/**
 * Pati Dükkânı v2 · Mağaza ("Nehir abla'nın kataloğu", PATI-V2 §4f). Sağ alttaki (dikeyde alt şeritteki) katalog
 * düğmesi açar; kapalı köşenin perdesine dokunmak da o köşenin sayfasını açar.
 *
 *  Üç sekme, hepsi resimli (yazı yok):
 *   - Yavrular: vitrine gelebilecek yavrular. Vitrinde olan → dokununca vitrine gidilir, yavru kendini gösterir (satın alma
 *     vitrinde, sepetle). Köşesi açılmamış → yavrunun yanında perde; dokununca köşeler sekmesi, o köşe kıpırdar.
 *   - Eşyalar: çekmece çekmece (üstte çekmece resimleri) yeni seçenekler. 3-4'te temizlik çekmecesinin kendisi de burada.
 *   - Süsler ve köşeler: yeni bölümler (perdenin arkasında o köşenin hayvanı) ve dükkân süsleri.
 *  Fiyat jeton resmiyle (5-6'da rakam da). Yetmeyen kalem SİLİK DEĞİL: dokununca jetonlar etikete uçar, eksikler boş
 *  daire kalır, "Biraz daha jeton lazım." (odeme.ts). Alınan kalem dükkânda GÖRÜNÜR bir şey değiştirir:
 *   - eşya kutudan çıkar, dolaba uçar ("Dolaba yeni bir şey geldi!"); çekmecede hemen denenir
 *   - köşe: katalog kapanır, şerit o köşeye kayar, perde açılır, "Akvaryum açıldı!", köşenin hayvanının sevdiği bir eşya
 *     hediye; vitrine o köşenin yavruları gelir
 *   - süs: salonun süs tepsisine iner, çocuk mıknatıslı bir noktaya koyar (sus.ts)
 *  Köşeler abonelikle (src/engine/erisim.ts → pati/*): kilit yalnız köşe alırken, mevcut sakin kilit anıyla.
 */
import { erisimVarMi } from '../../src/abonelik/kilit';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { dolapEl, esyaEl, Etiket, ezil } from './arayuz';
import { esyaAl, koseAc, koseAcik, koseFiyati, koseGorunur, sahipMi, vitrineGelir } from './ekonomi';
import {
  CEKMECELER,
  ESYA_IDLERI,
  esyaBilgi,
  HAYVAN_IDLERI,
  hayvanBilgi,
  KOSELER,
  NEHIR2,
  SUS_IDLERI,
  susBilgi,
  TEMIZLIK_CEKMECESI,
  temizlikFiyati,
  yasla,
  type CekmeceAdi,
  type KoseAdi,
} from './katalog';
import { jetonlaOde, type OdemeOrtam } from './odeme';
import { ses } from './sesler';
import { cekmeceAcik } from './tercih';
import { adres, dolapEtiketi, dolapResmi, ETIKET, hayvanGorseliVar, PERDE, pozAdresi, susResmi } from './varliklar';

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
export type Sekme = 'yavru' | 'esya' | 'sus';
const CEKMECE_SIRA: CekmeceAdi[] = ['mama', 'su', 'oyuncak', 'temizlik', 'yatak', 'ecza'];
/** Köşenin kataloğdaki resmi: o köşenin ilk hayvanı (perdenin önünde) */
const KOSE_HAYVAN: Record<KoseAdi, string[]> = { salon: [], kemirgen: ['fistik', 'kurabiye'], akvaryum: ['piril'], kus: ['limon', 'boncuk'], bahce: ['cucuk', 'vakvak'], surungen: ['tospik', 'zumrut'] };
const KOSE_YEDEK: Partial<Record<KoseAdi, string>> = { kemirgen: 'kadro-a-fistik', akvaryum: 'kadro-b-piril', kus: 'kadro-b-limon', surungen: 'kadro-b-tospik', bahce: 'kadro-b-diken' };
export const koseResmi = (k: KoseAdi): string | null => {
  const id = KOSE_HAYVAN[k].find(hayvanGorseliVar);
  return id ? pozAdresi(id, 'bos').url : KOSE_YEDEK[k] ? adres(KOSE_YEDEK[k]!) : null;
};

export interface MagazaOrtam extends OdemeOrtam {
  /** kilit anının kökü (abonelik) */
  kok: HTMLElement;
  etkilesim: () => void;
  /** köşe alındı: dükkân perdeyi açar, hediye eşya verir */
  koseAcildi: (k: KoseAdi) => Promise<void>;
  /** Yavrular sekmesinden: vitrine git, yavru kendini göstersin */
  yavruGoster: (id: string) => void;
  /** süs alındı: salonun süs tepsisine */
  susAlindi: (id: string) => void;
}

export class Magaza {
  readonly el: HTMLElement;
  private kart: HTMLElement;
  private sekmeler: HTMLElement;
  private alt: HTMLElement;
  private izgara: HTMLElement;
  private sekme: Sekme = 'yavru';
  private cekmece: CekmeceAdi = 'mama';
  private islem = false;
  private kapandi = false;

  constructor(private o: MagazaOrtam) {
    const sekmeDugme = (s: Sekme, resim: string | null) => {
      const b = h('button.pt-mg-sekme', { type: 'button', 'data-sekme': s, 'aria-label': s }, resim ? h('img', { src: resim, alt: '', draggable: 'false' }) : null);
      b.addEventListener('click', () => {
        this.o.etkilesim();
        ses.pit();
        this.goster(s);
      });
      return b;
    };
    this.sekmeler = h('div.pt-mg-sekmeler', {}, sekmeDugme('yavru', pozAdresi('findik', 'bos').url), sekmeDugme('esya', adres('esya-top', 'esya-tuy-degnek')), sekmeDugme('sus', Object.keys(KOSELER).length > 1 ? (PERDE ?? susResmi('saksi', 'elektrik/saksi')) : susResmi('saksi', 'elektrik/saksi')));
    this.alt = h('div.pt-mg-alt');
    this.izgara = h('div.pt-mg-izgara');
    this.kart = h('div.pt-mg-kart', {}, this.sekmeler, this.alt, this.izgara);
    this.el = h('div.pt-magaza', { role: 'dialog', 'aria-label': 'Katalog', 'data-acik': '0' }, this.kart);
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el && !this.islem) this.kapa();
    });
  }

  get acik() {
    return this.el.dataset.acik === '1';
  }

  /** Kataloğu açar (sekme; odak: o kalem bir kez kıpırdar) */
  ac(sekme: Sekme = this.sekme, odak?: string) {
    this.o.etkilesim();
    this.el.dataset.acik = '1';
    this.goster(sekme, odak);
    if (!TEST_MODU) this.kart.animate([{ transform: 'translateY(40px) scale(.94)', opacity: 0 }, { transform: 'translateY(-6px) scale(1.01)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 340, easing: 'ease-out' });
  }
  kapa() {
    if (!this.acik) return;
    this.el.dataset.acik = '0';
  }

  private goster(s: Sekme, odak?: string) {
    // bütün yavrular alındıysa (yayın kapsamında 3 yavru) Yavrular sekmesi boş kalmaz: gizlenir
    const yavruYok = !this.yavrular().length;
    this.sekmeler.querySelector<HTMLElement>('[data-sekme="yavru"]')!.style.display = yavruYok ? 'none' : '';
    if (s === 'yavru' && yavruYok) s = 'esya';
    this.sekme = s;
    this.el.dataset.sekme = s;
    for (const b of this.sekmeler.children) b.classList.toggle('secili', (b as HTMLElement).dataset.sekme === s);
    this.alt.replaceChildren();
    if (s === 'esya') this.altCekmeceler();
    const kartlar = s === 'yavru' ? this.yavrular() : s === 'esya' ? this.esyalar() : this.susler();
    this.izgara.replaceChildren(...kartlar);
    this.izgara.scrollTop = 0;
    if (!TEST_MODU)
      kartlar.forEach((k, i) =>
        k.animate([{ transform: 'translateY(24px) scale(.8, 1.1)', opacity: 0 }, { transform: 'translateY(-6px) scale(1.05, .95)', opacity: 1, offset: 0.65 }, { transform: 'none', opacity: 1 }], { duration: 340, delay: 40 * i, easing: 'ease-out', fill: 'backwards' }),
      );
    if (odak) {
      const k = this.izgara.querySelector<HTMLElement>(`[data-kalem="${odak}"]`);
      if (k) {
        k.scrollIntoView({ block: 'nearest' });
        void bekle(380).then(() => ezil(k, 1.8, 520));
      }
    }
  }

  // ---------------------------------------------------------------- kalem kartı
  private kalem(id: string, resim: string | null, fiyat: number | null, ek: HTMLElement | null, dokun: (kart: HTMLElement, et: Etiket | null) => void, sahip = false): HTMLElement {
    const et = fiyat !== null && !sahip ? new Etiket(fiyat, this.o.yas()) : null;
    const res = resim ? h('span.pt-mg-resim', {}, h('img', { src: resim, alt: '', draggable: 'false' })) : h('span.pt-mg-resim.pt-yer-tutucu');
    const kart = h(`button.pt-mg-kalem${sahip ? '.pt-sahip' : ''}`, { type: 'button', 'data-kalem': id, 'aria-label': id }, res, ek, et?.el ?? null);
    kart.addEventListener('click', () => {
      if (this.islem) return;
      this.o.etkilesim();
      dokun(kart, et);
    });
    return kart;
  }

  // ---------------------------------------------------------------- yavrular
  private yavrular(): HTMLElement[] {
    const k = this.o.kayit;
    return HAYVAN_IDLERI.filter((id) => !sahipMi(k, id) && hayvanGorseliVar(id)).map((id) => {
      const b = hayvanBilgi(id);
      const vitrinde = vitrineGelir(k, id);
      const perde = !vitrinde ? h('span.pt-mg-perde', {}, PERDE ? h('img', { src: PERDE, alt: '' }) : null) : null;
      return this.kalem(id, pozAdresi(id, 'bos').url, yasla(b.fiyat, this.o.yas()), perde, (kart) => {
        ezil(kart, 1.3, 320);
        if (vitrinde) {
          ses.hop();
          this.kapa();
          this.o.yavruGoster(id);
        } else {
          // köşesi açılmamış: köşeler sekmesi, o köşe kıpırdar
          ses.hmm();
          void this.o.nehir.soyle(NEHIR2.kose_lazim);
          this.goster('sus', `kose-${b.kose}`);
        }
      });
    });
  }

  // ---------------------------------------------------------------- eşyalar
  private altCekmeceler() {
    const yas = this.o.yas();
    const temizlikAlindi = this.o.kayit.esyalar.includes(TEMIZLIK_CEKMECESI);
    for (const c of CEKMECE_SIRA) {
      // 3-4'te temizlik çekmecesi de alınabilir (kartı onun sekmesinde); ecza yalnız 5-6
      if (!CEKMECELER[c].yas.includes(yas) && c !== 'temizlik') continue;
      const b = h(`button.pt-mg-cekmece${c === this.cekmece ? '.secili' : ''}`, { type: 'button', 'data-cekmece': c, 'aria-label': c }, dolapEl(c));
      b.toggleAttribute('data-kapali', !cekmeceAcik(c, yas, temizlikAlindi));
      b.addEventListener('click', () => {
        this.o.etkilesim();
        ses.cekmece(true);
        this.cekmece = c;
        this.goster('esya');
      });
      this.alt.append(b);
    }
    if (!this.alt.querySelector(`[data-cekmece="${this.cekmece}"]`)) this.cekmece = 'mama';
  }
  private esyalar(): HTMLElement[] {
    const k = this.o.kayit;
    const yas = this.o.yas();
    const c = this.cekmece;
    const kartlar: HTMLElement[] = [];
    if (c === 'temizlik' && !cekmeceAcik('temizlik', yas, k.esyalar.includes(TEMIZLIK_CEKMECESI))) {
      // 3-4: önce çekmecenin kendisi
      const f = temizlikFiyati(yas);
      kartlar.push(
        // resmi: çekmece önü (ui-dolap) ya da temizlik çekmecesinin etiketi (fırça); boş yer tutucu kart yok
        this.kalem('cekmece-temizlik', dolapResmi('temizlik') ?? dolapEtiketi('temizlik'), f, null, (kart, et) =>
          void this.ode(kart, et!, f, () => {
            if (k.jeton < f) return false;
            k.jeton -= f;
            k.esyalar.push(TEMIZLIK_CEKMECESI);
            return true;
          }).then((ok) => void (ok && this.esyaGeldi(kart))),
        ),
      );
    }
    for (const e of ESYA_IDLERI) {
      const b = esyaBilgi(e);
      if (b.cekmece !== c || b.bastan) continue;
      const sahip = k.esyalar.includes(e);
      const f = yasla(b.fiyat, yas);
      const kart = this.kalem(e, null, f, null, (kk, et) => {
        if (sahip || !et) {
          ezil(kk, 1.2, 300);
          ses.pit();
          return;
        }
        void this.ode(kk, et, f, () => esyaAl(k, e, yas)).then((ok) => void (ok && this.esyaGeldi(kk)));
      }, sahip);
      // resim esyaEl ile (çizimi yoksa çekmecenin sade yer tutucusu)
      kart.querySelector('.pt-mg-resim')!.replaceWith(h('span.pt-mg-resim', {}, esyaEl(e)));
      kartlar.push(kart);
    }
    return kartlar;
  }

  // ---------------------------------------------------------------- süsler ve köşeler
  private susler(): HTMLElement[] {
    const k = this.o.kayit;
    const yas = this.o.yas();
    const kartlar: HTMLElement[] = [];
    for (const kose of Object.keys(KOSELER) as KoseAdi[]) {
      if (kose === 'salon' || koseAcik(k, kose) || !koseGorunur(k, kose)) continue;
      const f = koseFiyati(kose, yas);
      const perde = h('span.pt-mg-perde.pt-mg-kose-perde', {}, PERDE ? h('img', { src: PERDE, alt: '' }) : null);
      kartlar.push(
        this.kalem(`kose-${kose}`, koseResmi(kose), f, perde, (kart, et) => {
          // köşeler abonelikle: kilit anı yalnız burada
          if (!erisimVarMi(`pati/kose-${kose}`, this.o.kok)) return;
          void this.ode(kart, et!, f, () => koseAc(k, kose, yas)).then(async (ok) => {
            if (!ok) return;
            await bekle(350);
            this.kapa();
            await this.o.koseAcildi(kose);
          });
        }),
      );
    }
    for (const id of SUS_IDLERI) {
      const s = susBilgi(id);
      const sahip = k.susler.some((x) => x.ad === id);
      const f = yasla(s.fiyat, yas);
      kartlar.push(
        this.kalem(id, susResmi(id, s.resim), f, null, (kart, et) => {
          if (sahip || !et) {
            ezil(kart, 1.2, 300);
            ses.pit();
            return;
          }
          void this.ode(kart, et, f, () => {
            if (k.jeton < f || k.susler.some((x) => x.ad === id)) return false;
            k.jeton -= f;
            k.susler.push({ ad: id, nokta: '' });
            return true;
          }).then(async (ok) => {
            if (!ok) return;
            ses.ksilofon();
            await bekle(450);
            this.kapa();
            this.o.susAlindi(id);
          });
        }, sahip),
      );
    }
    return kartlar;
  }

  // ---------------------------------------------------------------- ödeme ve alınan
  private async ode(kart: HTMLElement, et: Etiket, f: number, al: () => boolean): Promise<boolean> {
    this.islem = true;
    kart.dataset.odeme = '1';
    try {
      return await jetonlaOde(this.o, et, f, al, () => this.kapandi);
    } finally {
      this.islem = false;
      delete kart.dataset.odeme;
    }
  }
  /** Eşya kutudan çıkar, dolaba uçar (sağ alta); kart "dolapta" olur */
  private async esyaGeldi(kart: HTMLElement) {
    ezil(kart, 1.6, 420);
    const r = kart.getBoundingClientRect();
    const k = this.o.efekt.kutu();
    this.o.efekt.konfeti(r.left - k.left + r.width / 2, r.top - k.top + r.height / 3, 14, 90);
    const resim = kart.querySelector('.pt-mg-resim')?.cloneNode(true) as HTMLElement | undefined;
    void this.o.nehir.soyle(NEHIR2.yeni_esya);
    if (resim && !TEST_MODU) {
      resim.style.width = `${r.width * 0.6}px`;
      resim.style.height = `${r.width * 0.6}px`;
      await this.o.efekt.ucur(resim, [r.left - k.left + r.width / 2, r.top - k.top + r.height / 2], [k.width - 40, k.height - 30], { ms: 650, kavis: -120, boy1: 0.3 });
    }
    if (this.acik) this.goster(this.sekme);
  }

  /**
   * Çekmecedeki fiyat etiketli eşya (Bakım Odası): aynı ödeme; alınca "Dolaba yeni bir şey geldi!" denmez (eşya zaten
   * çekmecede, hemen denenir).
   */
  async cekmeceden(e: string, et: Etiket): Promise<boolean> {
    if (this.islem) return false;
    this.islem = true;
    try {
      const f = yasla(esyaBilgi(e).fiyat, this.o.yas());
      return await jetonlaOde(this.o, et, f, () => esyaAl(this.o.kayit, e, this.o.yas()), () => this.kapandi);
    } finally {
      this.islem = false;
    }
  }

  /** Kataloğu açan düğme (resimli: fiyat etiketi; yoksa sade yer tutucu) */
  static dugme(tik: () => void): HTMLButtonElement {
    const b = h('button.pt-katalog-dugme', { type: 'button', 'aria-label': 'Katalog' }, ETIKET ? h('img', { src: ETIKET, alt: '', draggable: 'false' }) : h('span.pt-yer-tutucu')) as HTMLButtonElement;
    b.addEventListener('click', tik);
    return b;
  }

  /** test */
  get durum() {
    return { acik: this.acik, sekme: this.sekme, cekmece: this.cekmece, kalemler: [...this.izgara.querySelectorAll<HTMLElement>('[data-kalem]')].map((x) => x.dataset.kalem) };
  }

  kapat() {
    this.kapandi = true;
  }
}
