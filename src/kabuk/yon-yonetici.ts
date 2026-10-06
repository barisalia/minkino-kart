/**
 * Uygulama kabuğunun ekran yönü yöneticisi (yalnız uygulamada; src/kabuk/yerel.ts kurar). Eklenti ve ekran bilgisi
 * dışarıdan verilir: birim testinde sahteleriyle denenir (tests/unit/ekran-yonu.test.ts).
 *
 * - Sayfa açılınca (ve önbellekten dönünce) o sayfanın yönü: telefonda geniş sahneli oyunlar yatay kilitli, öbürleri
 *   serbest; tablette her sayfa serbest.
 * - Sayfa içi istek (film oynatıcısı): yalnız tablette etkili (telefonda film sayfası zaten yatay).
 * - Başka sayfaya geçmeden önce: gidilecek sayfanın yönü krem perde inerken ayarlanır; telefon yatay kilitlenecekse
 *   ve ekran şu an dikeyse dönüş beklenir (yeni sayfa dikey açılıp sonra dönmesin). En çok `bekleMs`.
 * - Yatay kilit iki yönlü: o an telefon hangi yatay yöndeyse o istenir; yerel taraf iki yatay yöne de izin verir
 *   (Android MainActivity.setRequestedOrientation → SENSOR_LANDSCAPE, iOS MinkinoBridgeViewController → .landscape).
 */
import { sayfaYonu, telefonMu, yonKarari, type Yon } from './yon';

/** @capacitor/screen-orientation'ın kullanılan kısmı */
export interface YonEklentisi {
  orientation(): Promise<{ type: string }>;
  lock(o: { orientation: string }): Promise<void>;
  unlock(): Promise<void>;
}

export interface YonOrtami {
  eklenti: YonEklentisi;
  /** cihaz ekranı (dp; yön değişince en ve boy yer değiştirebilir) */
  ekran: () => { width: number; height: number };
  /** ekran şu an yatay mı (görünüm) */
  yatayMi: () => boolean;
  /** görünüm yatay ↔ dikey değişince haber verir; bırakma fonksiyonu döner */
  yonDegisince: (fn: () => void) => () => void;
  /** dönüş için en çok bekleme (ms) */
  bekleMs?: number;
}

export interface YonYoneticisi {
  sayfaAcildi(yol: string): Promise<void>;
  istek(yol: string, yon: Yon): Promise<void>;
  gitmedenOnce(hedefYol: string): Promise<void>;
}

export function yonYoneticisi(o: YonOrtami): YonYoneticisi {
  const telefon = () => {
    const e = o.ekran();
    return telefonMu(e.width, e.height);
  };
  async function uygula(karar: 'kilitle' | 'birak') {
    try {
      if (karar === 'birak') {
        await o.eklenti.unlock();
        return;
      }
      // telefon şu an hangi yatay yöndeyse o (ters yatayda tutan çocuğa ekran baş aşağı dönmesin); dikey ya da
      // bilinmiyorsa düz yatay
      let tip = 'landscape';
      try {
        const { type } = await o.eklenti.orientation();
        if (type === 'landscape-primary' || type === 'landscape-secondary') tip = type;
      } catch {
        /* bilinmiyor: düz yatay */
      }
      await o.eklenti.lock({ orientation: tip });
    } catch {
      /* eklenti yok ya da desteklenmiyor: yön değişmez, oyun yine çalışır */
    }
  }
  /** görünüm yataya dönene kadar (ya da süre dolana kadar) */
  function yatayiBekle(): Promise<void> {
    if (o.yatayMi()) return Promise.resolve();
    return new Promise((bitti) => {
      let birak = () => {};
      const t = setTimeout(son, o.bekleMs ?? 1000);
      function son() {
        clearTimeout(t);
        birak();
        bitti();
      }
      birak = o.yonDegisince(() => {
        if (o.yatayMi()) son();
      });
    });
  }
  return {
    sayfaAcildi: (yol) => uygula(yonKarari({ telefon: telefon(), sayfa: sayfaYonu(yol) })),
    istek: (yol, yon) => uygula(yonKarari({ telefon: telefon(), sayfa: sayfaYonu(yol), istek: yon })),
    gitmedenOnce(hedefYol) {
      const karar = yonKarari({ telefon: telefon(), sayfa: sayfaYonu(hedefYol) });
      const is = uygula(karar);
      if (karar !== 'kilitle' || o.yatayMi()) return is;
      return Promise.all([is, yatayiBekle()]).then(() => undefined);
    },
  };
}
