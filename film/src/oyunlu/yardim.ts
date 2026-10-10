/**
 * Yardım merdiveni (OYUNLU-FORMAT §4): çocuk hiçbir şey yapmazsa 5 sn parla + çan, 10 sn çağrı tekrar + hayalet el,
 * 18 sn karakter ilk adımı gösterir, 30 sn karakter kalanını bitirir. Süre her ilerlemede baştan başlar.
 * Deneme merdiveni: 2 kaçırmada hedef parlar, 4'te mıknatıs (dokunma alanı) genişler, 6'da karakter "elini tutar".
 * "Yalnız izle": hemen 30 sn basamağı. Tavan: oyun anı ne olursa olsun ~60 sn'de kendiliğinden biter.
 */
export type Basamak = 'parla' | 'soyle' | 'goster' | 'bitir';
export const ESIK: Record<Basamak, number> = { parla: 5, soyle: 10, goster: 18, bitir: 30 };
const SIRA: Basamak[] = ['parla', 'soyle', 'goster', 'bitir'];
export const TAVAN = 60;

export class YardimMerdiveni {
  /** son ilerlemeden beri geçen süre */
  bos = 0;
  /** oyunun başından beri */
  toplam = 0;
  /** ulaşılan son basamak (-1: hiçbiri) */
  private i = -1;
  kacirma = 0;
  /** bitir basamağına bir kez gelindi mi (geri dönülmez) */
  bitiriyor = false;

  constructor(readonly izle = false) {}

  /** dt kadar ilerler; ilerleme: çocuk bu karede işi yapıyor mu. Dönüş: bu karede yeni ulaşılan basamak */
  adim(dt: number, ilerleme: boolean): Basamak | null {
    this.toplam += dt;
    if (this.bitiriyor) return null;
    if (this.izle || this.toplam >= TAVAN) return this.bitir();
    if (ilerleme) {
      this.bos = 0;
      this.i = -1;
      return null;
    }
    this.bos += dt;
    const sonraki = SIRA[this.i + 1];
    if (sonraki && this.bos >= ESIK[sonraki]) {
      this.i++;
      if (sonraki === 'bitir') return this.bitir();
      return sonraki;
    }
    return null;
  }

  private bitir(): Basamak {
    this.bitiriyor = true;
    this.i = SIRA.length - 1;
    return 'bitir';
  }

  /** şu an parlama gerekiyor mu (5 sn basamağı ya da 2 kaçırma) */
  get parla() {
    return this.i >= 0 || this.kacirma >= 2;
  }
  /** dokunma alanı çarpanı (4 kaçırmada genişler) */
  get miknatis() {
    return this.kacirma >= 4 ? 1.5 : 1;
  }

  /** hedefi tutturamayan dokunuş. Dönüş: 6. kaçırmada 'el-tut' (karakter yardım eder), yoksa null */
  kacir(): 'el-tut' | null {
    this.kacirma++;
    return this.kacirma === 6 ? 'el-tut' : null;
  }
}
