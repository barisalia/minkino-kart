/**
 * "Bana oku": sayfanın satırları sırayla, anlatıcı ve karakter sesiyle okunur; okunan kelime vurgulanır.
 * Sayfa bitince otomatik çevirme YOK (çocuk kendisi çevirir).
 *
 * Ses: ortak konuşma sistemi (src/audio/konusma.ts): kayıt varsa kayıt, yoksa cihazın Türkçe sesi (ses etiketleri
 * orada silinir). Kitabın cümleleri seslendirme listesine EKLENMEDİ (ayrı onay işi), bu yüzden şimdilik cihaz sesi.
 * Kelime vurgusu: cihaz sesi 'boundary' olayı verirse ona göre; vermezse (kayıt, bazı cihazlar) süreyle tahmin.
 */
import { efekt, konus, sus } from '../../src/audio/ses';
import { konusmaAni } from '../../src/audio/konusma';
import { TEST_MODU } from '../../src/ui/dom';
import { KARAKTERLER, kelimeler, type MetinSayfasi } from './metin';

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** Tahmin: saniyede okunan harf (cihaz sesi hızı 0.92; kayıt 0.9) */
const HARF_SN = { cihaz: 12.5, kayit: 13.5 };

/** Satırdaki kelimelerin tahmini bitiş anları (harf birimi; noktalamadan sonra kısa duraklama) */
export function kelimeAgirliklari(metin: string): number[] {
  let t = 0;
  return kelimeler(metin).map((w) => {
    t += w.k.replace(/[^\p{L}\p{N}]/gu, '').length + 1.2 + (/[.!?]$/.test(w.k) ? 5 : /[,:;]$/.test(w.k) ? 2.5 : /\.\.\.$/.test(w.k) ? 6 : 0);
    return t;
  });
}

export class Okuyucu {
  private tur = 0;
  /** Okuma sürüyor mu */
  aktif = false;
  /** Test / izleme: okunan [sayfa anahtarı, satır] sırası */
  readonly gecmis: string[] = [];

  /** Sayfayı baştan (ya da `bas` satırından) sonuna kadar okur; dur() ya da yeni okuma keser */
  async sayfaOku(m: MetinSayfasi, anahtar: string, bas = 0): Promise<boolean> {
    const benim = ++this.tur;
    this.aktif = true;
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
      }
    }
  }

  /** Tek satırı okur (satıra dokununca, iki modda da) */
  async tekSatir(m: MetinSayfasi, anahtar: string, i: number) {
    const benim = ++this.tur;
    this.aktif = true;
    try {
      await this.satir(m, anahtar, i, benim);
    } finally {
      if (benim === this.tur) {
        this.aktif = false;
        m.vurgula(-1);
      }
    }
  }

  dur() {
    this.tur++;
    this.aktif = false;
    sus();
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
    const k = KARAKTERLER[s.kim];
    const agirlik = kelimeAgirliklari(s.metin);
    const toplam = agirlik.at(-1) ?? 1;
    let sinirVar = false;
    let son = 0;
    let rafId = 0;
    const izle = () => {
      if (benim !== this.tur) return;
      const ani = konusmaAni();
      if (ani && !sinirVar) {
        const gecen = ((performance.now() - ani.bas) / 1000) * HARF_SN[ani.kaynak];
        let j = agirlik.findIndex((a) => a > gecen);
        if (j < 0) j = agirlik.length - 1;
        if (j !== son && gecen < toplam + 8) {
          son = j;
          m.vurgula(i, j);
        }
      }
      rafId = requestAnimationFrame(izle);
    };
    rafId = requestAnimationFrame(izle);
    try {
      await konus(s.metin, {
        karakter: k.karakter,
        ton: k.ton,
        kelime: (ci) => {
          if (benim !== this.tur) return;
          sinirVar = true;
          son = m.kelimeBul(i, ci);
          m.vurgula(i, son);
        },
      });
      if (TEST_MODU) {
        // test: kelimeler sırayla (vurgunun her kelimeyi gezdiği denetlenir)
        for (let j = 0; j < m.kelimeSayisi(i) && benim === this.tur; j++) {
          m.vurgula(i, j);
          await bekle(4);
        }
      }
    } finally {
      cancelAnimationFrame(rafId);
    }
  }
}
