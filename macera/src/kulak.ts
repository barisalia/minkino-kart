/**
 * Kulak: oyunun mikrofonu. Sesi kare kare analiz eder (ses kaydedilmez), ortam gürültüsünü sürekli izler
 * ve SIRAYLA KONUŞMA kuralını uygular: karakter konuşurken ya da oyun ses çalarken dinlemez.
 * Mikrofon yoksa ya da izin verilmezse oyun dokunarak oynanır (her görevin dokunma karşılığı var).
 */
import { OrtamOlcer, type Ayar, type Ozellik } from '../../ses-testi/src/analiz';
import { Mikrofon } from '../../ses-testi/src/mikrofon';
import { konusuyorMu } from '../../src/audio/ses';
import { baglam, sesMotorunuAc } from '../../src/audio/motor';

export type KulakDurumu = 'kapali' | 'aciliyor' | 'hazir' | 'yok';

class KulakSinifi {
  private mik = new Mikrofon();
  durum: KulakDurumu = 'kapali';
  /** detektörler bu nesneyi paylaşır: taban güncellenince hepsi görür */
  readonly ayar: Ayar = { taban: -62, duyarlilik: 0, kare: 1024 / 48000 };
  private dinleyici: ((o: Ozellik) => void) | null = null;
  private susBitis = 0;
  private son: number[] = [];
  private sayac = 0;
  /** son karenin ses seviyesi 0..1 (kulak simgesi için) */
  seviye = 0;
  /** şu an dinliyor mu (konuşma/efekt yok, dinleyici var) */
  dinliyor = false;
  hamDinleyici: ((g: Float32Array) => void) | null = null;
  degisti: (() => void) | null = null;

  get acik() {
    return this.durum === 'hazir';
  }

  /** Mikrofonu açar ve ortamı 1 saniye ölçer. Başarısızsa false (oyun dokunarak sürer). */
  async ac(): Promise<boolean> {
    if (this.durum === 'hazir') return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.durumYap('yok');
      return false;
    }
    this.durumYap('aciliyor');
    try {
      const ctx = sesMotorunuAc() ?? baglam();
      await this.mik.ac({ yankiIptal: false, gurultuBastir: false, otoSeviye: false }, ctx);
    } catch {
      this.durumYap('yok');
      return false;
    }
    this.ayar.kare = this.mik.kareSuresi;
    const olcer = new OrtamOlcer();
    await new Promise<void>((coz) => {
      const bitis = performance.now() + 1100;
      this.mik.onKare = (o) => {
        olcer.ekle(o);
        if (performance.now() > bitis && olcer.hazir) coz();
      };
      setTimeout(coz, 2500);
    });
    this.ayar.taban = Math.min(-35, olcer.taban);
    this.mik.onKare = (o) => this.kare(o);
    this.mik.onHam = (g) => this.hamDinleyici?.(g);
    this.durumYap('hazir');
    return true;
  }

  private durumYap(d: KulakDurumu) {
    this.durum = d;
    this.degisti?.();
  }

  /** Ortam gürültüsü yavaşça izlenir: düşerse hemen, yükselirse yavaş (uzun üflemeyi gürültü sanmasın). */
  private tabanGuncelle(db: number) {
    this.son.push(db);
    const n = Math.round(6 / this.ayar.kare);
    if (this.son.length > n) this.son.shift();
    if (++this.sayac % Math.round(0.5 / this.ayar.kare)) return;
    const s = [...this.son].sort((a, b) => a - b);
    const p = s[Math.floor(s.length * 0.15)];
    if (p < this.ayar.taban) this.ayar.taban = Math.max(-80, p);
    else this.ayar.taban = Math.min(-35, this.ayar.taban + Math.min(1, p - this.ayar.taban));
  }

  private kare(o: Ozellik) {
    this.tabanGuncelle(o.db);
    this.seviye = Math.max(0, Math.min(1, (o.db - this.ayar.taban) / 40));
    const dinle = !!this.dinleyici && !konusuyorMu() && performance.now() > this.susBitis;
    if (dinle !== this.dinliyor) {
      this.dinliyor = dinle;
      this.degisti?.();
    }
    if (dinle) this.dinleyici!(o);
  }

  /** Görevin kare işleyicisini bağlar (null: dinleme yok) */
  dinle(fn: ((o: Ozellik) => void) | null) {
    this.dinleyici = fn;
    this.degisti?.();
  }

  /** Oyun ses çalarken bir süre dinleme (kendi sesini çocuk sanmasın) */
  sustur(ms: number) {
    this.susBitis = Math.max(this.susBitis, performance.now() + ms);
  }

  /** Mikrofonsuz (dokunarak) oyna */
  mikrofonsuz() {
    this.mik.kapat();
    this.durumYap('yok');
  }

  kapat() {
    this.mik.kapat();
    this.dinleyici = null;
    if (this.durum === 'hazir') this.durumYap('kapali');
  }
}

export const kulak = new KulakSinifi();
