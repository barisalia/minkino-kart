/**
 * Kapıda sıra (§7e, P8): gelen müşteri kapıdan girmez, kapının önündeki taş yolda sıraya girer. En çok 3 kişi sırada
 * (YERLESIM34.sira), sonrakiler yolun başında (YERLESIM34.yolBasi) bekler. Sabır sayacı YOK, kimse sıradan gitmez.
 *
 * - Çocuk sıradaki HERHANGİ birini (ilki olmak zorunda değil) bir masaya ya da sandalyeye sürükler (lokanta.ts
 *   sürükleme hedefini bulur; P7'nin iki kişilik masaları bu modülün `cikar` / `uyeler` yüzünü kullanır).
 * - Biri çıkınca arkadakiler bir yuva öne yürür; yolun başındaki sıraya girer.
 * - Beklerken sıkılmazlar (oyalanma): çiçek koklar, gözlerini kapayıp güneşlenir, arıya bakar, yanındakiyle
 *   konuşur (küçük resimli balon). Sıra pozları (§11h #76-78 sira-1/2/3) gelince onlarla; gelene kadar duruş + hop.
 * - Kapı: sıranın başına biri gelince zil çalar, kapı iki kare açılıp kapanır.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Yer } from '../olcek';
import { salonSes } from '../sesler';
import { varlik } from '../varliklar';
import type { Kisi } from './kisi';
import { aynala, derinlik } from './sahne34';

export interface SiraUyesi {
  kisi: Kisi;
  eslik: Kisi | null;
  /** yuvasına vardı (sürüklenebilir) */
  hazir: boolean;
  /** yuvaya varış ya da son dokunuş zamanı (3-4 yaşta 10 sn kuralı) */
  zaman: number;
  /** hangi yuvada (0-2 sıra, 3-4 yolun başı) */
  yuva: number;
}

export interface SiraBaglam {
  katman: HTMLElement;
  /** yuvanın yeri: 0-2 sıra, 3+ yolun başı */
  yer: (yuva: number) => Yer;
  /** yürüme (yol grafiğiyle) */
  yuru: (k: Kisi, hedef: Yer) => Promise<void>;
  /** sıranın başına biri geldi: kapı zili ve iki kareli kapı */
  kapiCal: () => void;
  kapandi: () => boolean;
}

/** Sırada en çok kaç kişi, yolun başında en çok kaç kişi */
export const SIRA_EN_COK = 3;
export const YOL_BASI_EN_COK = 2;
export const KAPASITE = SIRA_EN_COK + YOL_BASI_EN_COK;

/** Saf: n kişilik sırada her kişinin yuvası (0..n-1, kapasiteyle sınırlı) */
export const yuvalar = (n: number) => Array.from({ length: Math.min(n, KAPASITE) }, (_, i) => i);

type Oyalanma = 'kokla' | 'gunes' | 'ari' | 'sohbet';
const OYALANMALAR: Oyalanma[] = ['kokla', 'gunes', 'ari', 'sohbet'];

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));

export class Sira {
  readonly uyeler: SiraUyesi[] = [];
  private zaman = 0;
  private kapali = false;
  private son = 0;

  constructor(private b: SiraBaglam) {
    this.zaman = window.setInterval(() => this.oyalan(), TEST_MODU ? 100000 : 2600);
  }

  get dolu() {
    return this.uyeler.length >= KAPASITE;
  }
  /** sıradaki ilk hazır kişi (ipucu ve 10 sn kuralı) */
  get ilk(): SiraUyesi | null {
    return [...this.uyeler].sort((a, b) => a.yuva - b.yuva).find((u) => u.hazir) ?? null;
  }
  icinde = (u: SiraUyesi) => this.uyeler.includes(u);

  /** Yeni gelen: yolun dışından yürür, ilk boş yuvaya girer (vardı: yuvaya varınca) */
  ekle(u: Pick<SiraUyesi, 'kisi' | 'eslik'>): SiraUyesi & { vardi: Promise<void> } {
    const uye: SiraUyesi = { ...u, hazir: false, zaman: performance.now(), yuva: this.uyeler.length };
    this.uyeler.push(uye);
    return Object.assign(uye, { vardi: this.yerine(uye) });
  }

  /** Ekran boyu değişti: herkes yuvasına (yürümeden) */
  yerlestir() {
    for (const u of this.uyeler) {
      if (!u.hazir) continue;
      const p = this.b.yer(u.yuva);
      u.kisi.yerKoy(p.x, p.y);
      u.eslik?.yerKoy(p.x + 3.2, p.y + 0.6);
      u.kisi.el.style.zIndex = String(derinlik(p.y));
      if (u.eslik) u.eslik.el.style.zIndex = String(derinlik(p.y + 0.6));
    }
  }

  /** Sıradan çıkar (masaya gidiyor): arkadakiler öne yürür */
  cikar(u: SiraUyesi) {
    const i = this.uyeler.indexOf(u);
    if (i < 0) return;
    this.uyeler.splice(i, 1);
    u.kisi.el.classList.remove('rs-sirada');
    u.eslik?.el.classList.remove('rs-sirada');
    this.uyeler.sort((a, b) => a.yuva - b.yuva).forEach((x, j) => {
      if (x.yuva !== j) {
        x.yuva = j;
        void this.yerine(x);
      }
    });
  }

  /** Bütün sırayı bırak (gün bitti) */
  bosalt(): SiraUyesi[] {
    const l = this.uyeler.splice(0);
    return l;
  }

  /** Yuvasına yürür; vardığında hazır */
  private async yerine(u: SiraUyesi) {
    const yuva = u.yuva;
    const p = this.b.yer(yuva);
    u.hazir = false;
    await Promise.all([this.b.yuru(u.kisi, p), u.eslik ? this.b.yuru(u.eslik, { x: p.x + 3.2, y: p.y + 0.6 }) : null]);
    if (this.b.kapandi() || !this.icinde(u) || u.yuva !== yuva) return;
    u.hazir = true;
    u.zaman = performance.now();
    u.kisi.el.classList.add('rs-sirada');
    u.eslik?.el.classList.add('rs-sirada');
    // sırada kapıya (sağa) bakar
    aynala(u.kisi, false);
    if (u.eslik) aynala(u.eslik, false);
    u.kisi.poz(varlik(`kisi/${u.kisi.ad}/sira-1`) ? 'sira-1' : 'giris');
    u.kisi.el.style.zIndex = String(derinlik(p.y));
    if (u.eslik) u.eslik.el.style.zIndex = String(derinlik(p.y + 0.6));
    if (yuva === 0) this.b.kapiCal();
    void u.kisi.oynat('hop', 380);
  }

  /** Bekleme oyalanması: bir kişi (2,6 sn'de bir, art arda aynı kişi değil) */
  private oyalan() {
    if (this.kapali || this.b.kapandi()) return;
    const hazir = this.uyeler.filter((u) => u.hazir);
    if (!hazir.length) return;
    const n = (this.son + 1 + Math.floor(Math.random() * hazir.length)) % hazir.length;
    this.son = n;
    const u = hazir[n];
    const tur = OYALANMALAR[Math.floor(Math.random() * OYALANMALAR.length)];
    void this.oyna(u, tur);
  }

  /** Bir oyalanmayı oynat (test kancası da çağırır) */
  async oyna(u: SiraUyesi, tur: Oyalanma) {
    const k = u.kisi;
    const poz = (p: string, yedek = 'giris') => k.poz(varlik(`kisi/${k.ad}/${p}`) ? p : yedek);
    const geri = () => {
      if (this.icinde(u) && u.hazir) poz('sira-1');
    };
    k.el.dataset.oyalanma = tur;
    if (tur === 'kokla') {
      poz('sira-3');
      const cicek = h('i.rs-sira-cicek', { 'aria-hidden': 'true' });
      k.el.append(cicek);
      await k.oynat('kokla', 900);
      await bekle(700);
      cicek.remove();
    } else if (tur === 'gunes') {
      poz('sira-2');
      await bekle(1300);
    } else if (tur === 'ari') {
      poz('sira-3');
      const ari = h('i.rs-sira-ari', { 'aria-hidden': 'true' });
      const u2 = varlik('balon/ipucu-tatli');
      if (u2) ari.append(h('img', { src: u2, alt: '', draggable: 'false' }));
      k.el.append(ari);
      await bekle(1800);
      ari.remove();
    } else {
      // yanındakiyle konuşur: sırayla küçük hop + resimli balon (nota, kalp)
      const yan = this.uyeler.find((x) => x !== u && x.hazir && Math.abs(x.yuva - u.yuva) === 1);
      const balon = (kim: Kisi, ne: string) => {
        const b = h('i.rs-sira-sohbet', { 'data-ne': ne, 'aria-hidden': 'true' });
        kim.el.append(b);
        window.setTimeout(() => b.remove(), TEST_MODU ? 30 : 900);
      };
      balon(k, 'nota');
      await k.oynat('hop', 360);
      if (yan) {
        await bekle(450);
        balon(yan.kisi, 'kalp');
        await yan.kisi.oynat('hop', 360);
      }
      await bekle(300);
    }
    delete k.el.dataset.oyalanma;
    geri();
  }

  kapat() {
    this.kapali = true;
    clearInterval(this.zaman);
  }
}

/** Sıradaki kişi beklerken dokunulursa (sürüklenmeden): sevinçle hop ve el sallar */
export async function siradakiSelam(u: SiraUyesi) {
  u.zaman = performance.now();
  void u.kisi.oynat('hop', 360);
  salonSes.vuu();
}
