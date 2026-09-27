/**
 * Filmde bir oyuncu: Mino (src/mino, katmanlı iskelet; yürürken yandan iskelete döner) ya da ortak karakter bileşeni
 * (src/karakter: köpek, tavşan, ördek… iskelet varsa parça parça, yoksa tek görsel). Motor ikisini aynı arayüzle yönetir.
 */
import type { KonusBilgi } from '../../src/audio/dudak';
import { Karakter, type HareketAdi } from '../../src/karakter/karakter';
import { Mino, minoIfadeleriYukle, type MinoIfade, type Tepki } from '../../src/mino/mino';
import { MINO_DONGU_YOLU, MINO_KUTU_GENISLIK, minoProfilYukle, YuruyenMino } from '../../src/mino/mino-profil';
import { h } from '../../src/ui/dom';

// film açılınca Mino'nun ifade ekleri ve yandan iskeleti önceden yüklensin (ilk kullanımda gecikme olmasın)
void minoIfadeleriYukle();
void minoProfilYukle();

const HAYVAN = import.meta.glob<string>('../../assets/hayvanlar/*.webp', { eager: true, query: '?url', import: 'default' });

/** Mino'nun adım hızı sınırları (döngü / sn; bir döngü iki adım): çok yavaşta sürünür, çok hızlıda koşar gibi olur */
const ADIM_EN_AZ = 1.2;
const ADIM_EN_COK = 2.8;

export class Oyuncu {
  readonly el: HTMLElement;
  /** kutunun en/boy oranı */
  readonly oran: number;
  private mino: Mino | null = null;
  private yuruyen: YuruyenMino | null = null;
  private karakter: Karakter | null = null;
  /** üst üste binen yürüyüşlerde yalnız sonuncusu bitince durulur */
  private yuruNo = 0;

  constructor(readonly tip: string) {
    if (tip === 'mino') {
      this.yuruyen = new YuruyenMino();
      this.mino = this.yuruyen.mino;
      // filmde Mino'nun ağzını yalnız motor açar (konus): başkasının cümlesinde oynamasın
      this.mino.agizSus = true;
      this.el = h('div.fl-oyuncu.fl-mino', {}, this.yuruyen.el);
      this.oran = 1360 / 1790;
    } else {
      const url = HAYVAN[`../../assets/hayvanlar/${tip}.webp`] ?? '';
      this.karakter = new Karakter(tip, h('img', { src: url, alt: '', draggable: 'false' }));
      this.el = h('div.fl-oyuncu', {}, this.karakter.el);
      this.oran = 1;
    }
  }

  /** Tepki / hareket (Mino: zipla, sasir, dans, zorlan, sersem, kararsiz, uzat…; karakter: dans, huy, kokla, bak, hayir, ye…) */
  tepki(ad: string, sure?: number) {
    if (this.mino) this.mino.tepki(ad as Tepki, sure);
    else this.karakter?.oynat(ad as HareketAdi, (sure ?? 1.2) * 1000);
  }

  /**
   * Yürüyüş hareketi (karakterin kendi yürüyüşü); yol motorda. sure: gerçek saniye, mesafe: kendi genişliği
   * cinsinden yatay yol. Mino yana yürüyorsa yandan iskelete döner ve adımlarını yola göre ayarlar.
   * Dönüş: bu yürüyüşün numarası (bitince yuruBitti'ye verilir) ve karakterin kendi yürüyüşü var mı
   * (yoksa motor sektirir).
   */
  yuru(sure: number, mesafe = 0): { no: number; kendi: boolean } {
    const no = ++this.yuruNo;
    if (this.yuruyen) {
      if (mesafe < 0.2 || sure <= 0) return { no, kendi: false };
      const dongu = (mesafe * MINO_KUTU_GENISLIK) / MINO_DONGU_YOLU;
      const hiz = Math.min(ADIM_EN_COK, Math.max(ADIM_EN_AZ, dongu / sure));
      return { no, kendi: this.yuruyen.yuru(hiz) };
    }
    this.karakter?.oynat('yuru', sure * 1000);
    return { no, kendi: true };
  }

  /** Yürüyüş yolu bitti (motor); Mino durur ve önden çizime döner */
  yuruBitti(no: number) {
    if (no === this.yuruNo) this.yuruyen?.dur();
  }

  ifade(ad: string | null, ms = 0) {
    this.mino?.ifade(ad as MinoIfade | null, ms);
    this.karakter?.ifade(ad, ms);
  }

  /** Konuşuyor: ağzı sese göre oynar (bilgi: cümle ve MP4 kaydında önceden çıkarılmış ağız dizisi) */
  konus(acik: boolean, bilgi?: KonusBilgi) {
    if (this.yuruyen) this.yuruyen.konus(acik, bilgi);
    else this.karakter?.konus(acik, true, bilgi);
  }

  duraklat(d: boolean) {
    if (this.yuruyen) this.yuruyen.duraklat = d;
  }

  kapat() {
    this.yuruyen?.kapat();
    this.karakter?.kapat();
  }
}
