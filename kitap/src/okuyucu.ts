/**
 * "Bana oku": sayfanın satırları sırayla, anlatıcı ve karakterlerin kendi ElevenLabs kayıtlarıyla okunur; okunan
 * kelime kaydın zaman damgalarıyla vurgulanır (kitap/src/kitap-ses.ts). Sayfa bitince otomatik çevirme YOK (çocuk
 * kendisi çevirir).
 *
 * Robot ses yok: kaydı olmayan satır cihazın sesine düşmez, sessiz geçer (yazı görünür, kelimeler aynı ritimde
 * vurgulanır).
 */
import { efekt, sus } from '../../src/audio/ses';
import { muzikKis } from '../../src/audio/motor';
import { TEST_MODU } from '../../src/ui/dom';
import { kitapOnYukle, satirSoyle } from './kitap-ses';
import type { MetinSayfasi } from './metin';

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class Okuyucu {
  private tur = 0;
  /** Okuma sürüyor mu */
  aktif = false;
  /** Test / izleme: okunan [sayfa anahtarı, satır] sırası */
  readonly gecmis: string[] = [];
  /** İzleme: satır kayıttan mı çalındı, sessiz mi geçti ('sayfa:satır' → kaynak) */
  readonly kaynak: Record<string, 'kayit' | 'sessiz'> = {};

  /** Sayfanın kayıtlarını önceden indir (sayfa açılınca) */
  hazirla(m: MetinSayfasi) {
    kitapOnYukle(m.satirlar);
  }

  /** Sayfayı baştan (ya da `bas` satırından) sonuna kadar okur; dur() ya da yeni okuma keser */
  async sayfaOku(m: MetinSayfasi, anahtar: string, bas = 0): Promise<boolean> {
    const benim = ++this.tur;
    this.aktif = true;
    kitapOnYukle(m.satirlar.slice(bas));
    muzikKis(true);
    try {
      for (let i = bas; i < m.satirlar.length; i++) {
        if (benim !== this.tur) return false;
        await this.satir(m, anahtar, i, benim);
        if (benim !== this.tur) return false;
        await bekle(TEST_MODU ? 5 : 380);
      }
      return benim === this.tur;
    } finally {
      if (benim === this.tur) {
        this.aktif = false;
        m.vurgula(-1);
        muzikKis(false);
      }
    }
  }

  /** Tek satırı okur (satıra dokununca, iki modda da) */
  async tekSatir(m: MetinSayfasi, anahtar: string, i: number) {
    const benim = ++this.tur;
    this.aktif = true;
    sus();
    muzikKis(true);
    try {
      await this.satir(m, anahtar, i, benim);
    } finally {
      if (benim === this.tur) {
        this.aktif = false;
        m.vurgula(-1);
        muzikKis(false);
      }
    }
  }

  dur() {
    this.tur++;
    this.aktif = false;
    sus();
    muzikKis(false);
  }

  private async satir(m: MetinSayfasi, anahtar: string, i: number, benim: number) {
    const s = m.satirlar[i];
    this.gecmis.push(`${anahtar}:${i}`);
    m.vurgula(i, 0);
    if (s.kim === 'ses') {
      // "GÜM!": ses yazısı efektle
      efekt.pof();
      await bekle(TEST_MODU ? 5 : 700);
      return;
    }
    const iptal = () => benim !== this.tur;
    const kaynak = await satirSoyle(s.kim, s.metin, {
      iptal,
      kelime: (j) => {
        if (!iptal()) m.vurgula(i, j);
      },
    });
    this.kaynak[`${anahtar}:${i}`] = kaynak;
    if (TEST_MODU) {
      // test: kelimeler sırayla (vurgunun her kelimeyi gezdiği denetlenir)
      for (let j = 0; j < m.kelimeSayisi(i) && benim === this.tur; j++) {
        m.vurgula(i, j);
        await bekle(4);
      }
    }
  }
}
