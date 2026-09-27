/**
 * Kısık ses ve fısıltı (Bölüm 2: ninni, "İyi geceler Ege", cee-ee'de yumuşak ses).
 *
 * YENİ sınıf; kilitli ses sistemine dokunmaz (ekip/SES-SISTEMI.md): ses-testi/src/analiz.ts'teki mevcut seviye
 * ölçümünü (seviye(): sessiz / fısıltı / konuşma / bağırma) sarar, süreye yayar ve söyleyişi (bir nefeslik ses
 * parçasını) değerlendirir. Algılama eşikleri değişmez; aşağıdaki YUKSEK_UST yalnız oyunun yorumudur: "konuşma"
 * seviyesinin üst bölümü ninni ve fısıltı için "fazla yüksek" sayılır (bağırma her zaman yüksek).
 */
import { seviye, type Ayar, type Ozellik } from '../../ses-testi/src/analiz';

export type SesDurumu = 'sessiz' | 'fisilti' | 'kisik' | 'yuksek';

/** Tabanın kaç dB üstü "fazla yüksek" (oyunun yorumu; seviye() konuşma 8…36, bağırma 36 üstü) */
export const YUKSEK_UST = 30;

/** Bir karenin durumu */
export function sesDurumu(o: Ozellik, a: Ayar): SesDurumu {
  const s = seviye(o, a);
  if (s === 'sessiz') return 'sessiz';
  if (s === 'fisilti') return 'fisilti';
  if (s === 'bagirma') return 'yuksek';
  return o.db - a.taban + a.duyarlilik > YUKSEK_UST ? 'yuksek' : 'kisik';
}

/** Bir söyleyişin (nefeslik ses parçasının) özeti */
export interface Soyleyis {
  /** toplam ses süresi (sn) */
  sure: number;
  fisilti: number;
  kisik: number;
  yuksek: number;
  /** baskın durum */
  sonuc: 'fisilti' | 'kisik' | 'yuksek';
}

/** Söyleyişin sonucu: bağırma/yüksek ses kısa da olsa baskındır; fısıltı sesin çoğunu oluşturmalı */
export function soyleyisSonucu(fisilti: number, kisik: number, yuksek: number): Soyleyis['sonuc'] {
  const top = fisilti + kisik + yuksek;
  if (yuksek >= 0.25 || yuksek > top * 0.35) return 'yuksek';
  if (fisilti >= top * 0.5) return 'fisilti';
  return 'kisik';
}

/**
 * Ses seviyesini kare kare izler: anlık durum (kısa çıtırtılar yumuşatılır), sürekli yüksek ses uyarısı ve
 * söyleyiş parçaları (ses başlar, 0.6 sn susunca biter).
 */
export class SesSeviyesi {
  /** yumuşatılmış anlık durum */
  durum: SesDurumu = 'sessiz';
  /** kesintisiz yüksek ses süresi (sn) */
  yuksekSure = 0;
  /** bir söyleyiş bitince (en az 0.25 sn ses) */
  onSoyleyis: (s: Soyleyis) => void = () => undefined;
  private parca = { fisilti: 0, kisik: 0, yuksek: 0 };
  private bosluk = 0;
  private sesVar = false;
  constructor(private a: Ayar) {}

  kare(o: Ozellik): SesDurumu {
    const d = sesDurumu(o, this.a);
    const k = this.a.kare;
    if (d === 'sessiz') {
      this.yuksekSure = Math.max(0, this.yuksekSure - k * 2);
      if (this.sesVar) {
        this.bosluk += k;
        if (this.bosluk > 0.6) this.bitir();
      }
    } else {
      this.sesVar = true;
      this.bosluk = 0;
      this.parca[d] += k;
      this.yuksekSure = d === 'yuksek' ? this.yuksekSure + k : Math.max(0, this.yuksekSure - k);
    }
    // anlık durum: tek kare çıtırtı durumu değiştirmez
    if (d === this.sonHam) this.ayni += k;
    else {
      this.sonHam = d;
      this.ayni = k;
    }
    if (this.ayni >= 0.06 || d === 'sessiz') this.durum = d;
    return this.durum;
  }
  private sonHam: SesDurumu = 'sessiz';
  private ayni = 0;

  private bitir() {
    const { fisilti, kisik, yuksek } = this.parca;
    const sure = fisilti + kisik + yuksek;
    this.parca = { fisilti: 0, kisik: 0, yuksek: 0 };
    this.sesVar = false;
    this.bosluk = 0;
    if (sure >= 0.25) this.onSoyleyis({ sure, fisilti, kisik, yuksek, sonuc: soyleyisSonucu(fisilti, kisik, yuksek) });
  }

  sifirla() {
    this.parca = { fisilti: 0, kisik: 0, yuksek: 0 };
    this.sesVar = false;
    this.bosluk = 0;
    this.yuksekSure = 0;
    this.durum = 'sessiz';
  }
}
