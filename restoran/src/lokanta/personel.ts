/**
 * Personel yemeği (§3a/12; yalnız 5-6, isteğe bağlı): son müşteri gidince Kino önlüğünü çıkarıp bir masaya oturur,
 * Lokum kapıdan koşarak gelir, Mino da masaya zıplar. Adisyon yok: çocuk açık istasyonlarla istediği her şeyi yapar,
 * tabağı masaya götürür (ya da tabağa dokunur, sıradaki aç olana gider). Üçü kendi zevkine göre tepki verir
 * (Kino soğanı sevmez: "Köpeklere soğan olmaz!", Mino acıyı sevmez, Lokum lokantadaki gibi). Jeton yok, ceza yok.
 * Kapının yanındaki "Kapalı" levhası (ay) her an günü kapatır; üçü de doyunca gün kendiliğinden kapanır.
 */
import { konus } from '../../../src/audio/ses';
import type { Mino } from '../../../src/mino/mino';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import metin from '../../../content/restoran/surpriz.json';
import type { Urun } from '../mini/arayuz';
import { L, MUSTERILER, tepkiHesapla, type Musteri, type TepkiSonuc } from '../model';
import type { Yer } from '../olcek';
import { salonSes, sesler } from '../sesler';
import type { Kisi } from './kisi';
import { ustunde } from './surukle';

const M = metin.mino;
const K = metin.kino;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 30) : ms));

/** Kino ile Mino'nun damak zevki (personel yemeğinde; müşteri havuzunda yoklar) */
export const PERSONEL: Record<'kino' | 'mino', Musteri> = {
  kino: { id: 'kino', boy: 'kino', ton: 0.92, sever: [{ t: 'kofte' }, { t: 'patates' }, { k: 'kocaman' }], sevmez: [{ m: 'sogan' }], gag: 'omuz', gun: 99 },
  mino: { id: 'mino', boy: 'mino', ton: 1, sever: [{ k: 'beyaz' }, { t: 'pankek' }, { m: 'bal' }], sevmez: [{ k: 'aci' }], gag: 'kulak', gun: 99 },
};

export interface PersonelMasa {
  el: HTMLElement;
  yer: Yer;
  oturan: unknown;
  ust: HTMLElement;
}

export interface PersonelBaglam {
  el: HTMLElement;
  katman: HTMLElement;
  kino: Kisi;
  minoEl: HTMLElement;
  mino: Mino;
  masalar: () => PersonelMasa[];
  kapi: () => Yer;
  kinoIs: (f: () => Promise<void>) => Promise<void>;
  kinoYerine: () => Promise<void>;
  kinoYuru: (x: number, y: number) => Promise<void>;
  minoSoyle: (metin: string) => Promise<void>;
  kinoSoyle: (metin: string) => Promise<void>;
  yeniKisi: (ad: string, boy: string) => Kisi;
  /** kişiyi masanın arkasına oturtur (lokantanın oturuş hesabı) */
  oturt: (k: Kisi, x: number, masa: PersonelMasa) => void;
  zSira: (k: Kisi) => void;
  /** personel yemeği bitti: gün kapanır */
  bitti: () => void;
  kapandi: () => boolean;
}

interface Yiyen {
  ad: 'lokum' | 'kino' | 'mino';
  m: Musteri;
  kisi: Kisi | null;
  doydu: boolean;
  yiyor: boolean;
  /** masaya oturdu */
  hazir: boolean;
}

export interface Personel {
  /** tabağa dokunuldu: sıradaki aç olana gider */
  ver(u: Urun, t: HTMLElement): boolean;
  /** tabak bırakıldı (ekran px): personel masasının üstündeyse yenir */
  birak(u: Urun, x: number, y: number): boolean;
  /** e2e */
  durum(): { ad: string; doydu: boolean; tepki?: string }[];
  kapat(): void;
}

export function personelBaslat(b: PersonelBaglam): Personel {
  let kapandi = false;
  let bitirildi = false;
  const tepkiler: Record<string, string> = {};
  // masa: boş masalardan ortadaki
  const bos = b.masalar().filter((m) => !m.oturan);
  const masa = [...(bos.length ? bos : b.masalar())].sort((a, c) => Math.abs(a.yer.x - 50) - Math.abs(c.yer.x - 50))[0];
  masa.el.dataset.personel = '1';
  const yiyenler: Yiyen[] = [
    { ad: 'lokum', m: MUSTERILER.lokum, kisi: null, doydu: false, yiyor: false, hazir: false },
    { ad: 'mino', m: PERSONEL.mino, kisi: null, doydu: false, yiyor: false, hazir: false },
    { ad: 'kino', m: PERSONEL.kino, kisi: b.kino, doydu: false, yiyor: false, hazir: false },
  ];
  // "Kapalı" levhası: her an günü kapatır
  const levha = h('button.rs-pr-levha', { type: 'button', 'aria-label': 'Kapalı' }, h('i.rs-pr-levha-ip'), h('i.rs-pr-levha-tahta', {}, h('i.rs-pr-ay')));
  b.katman.append(levha);
  // levha masaların ve istasyonların arasındaki boş zeminde (yatay: salonun ortası, dikey: sağ alt masaların üstü)
  const dikeyMi = b.kapi().y > 80;
  Object.assign(levha.style, dikeyMi ? { left: '76%', top: '69%' } : { left: '44%', top: '54%' });
  levha.addEventListener('click', () => void bitir());

  const tabakKoy = (y: Yiyen, u: Urun): HTMLElement => {
    const t = h('div.rs-masa-tabak.rs-pr-tabak', { 'data-kim': y.ad }, u.gorsel());
    t.style.left = y.ad === 'lokum' ? '24%' : y.ad === 'mino' ? '50%' : '76%';
    masa.ust.append(t);
    sesler.cal('pof', { guc: 0.6 });
    return t;
  };

  const soyle = async (y: Yiyen, metin_: string | undefined) => {
    if (!metin_ || kapandi) return;
    if (y.ad === 'mino') return b.minoSoyle(metin_);
    if (y.ad === 'kino') return b.kinoSoyle(metin_);
    const k_ = y.kisi!;
    const bal = h('div.rs-soz', {}, metin_.replace(/\[[^\]]*\]\s*/g, ''));
    k_.el.append(bal);
    k_.konus(true);
    try {
      await konus(metin_, { karakter: 'lokum', ton: y.m.ton, cihazSesi: false });
      await bekle(250);
    } finally {
      k_.konus(false);
      bal.remove();
    }
  };

  async function ye(y: Yiyen, u: Urun) {
    y.yiyor = true;
    const t = tabakKoy(y, u);
    const s: TepkiSonuc = tepkiHesapla(y.m, { tur: 'surpriz' }, u);
    tepkiler[y.ad] = s.tepki;
    for (let i = 0; i < 3; i++) {
      salonSes.cigne();
      if (y.kisi) await y.kisi.oynat('ye', 700);
      else {
        b.mino.tepki('ham', 0.7);
        await bekle(700);
      }
      t.dataset.adim = String(i + 1);
    }
    if (kapandi) return;
    if (s.tepki === 'bayildi') {
      salonSes.bayildi();
      if (y.kisi) {
        y.kisi.ifade('keyif', 1600);
        void y.kisi.oynat('sevin', 900);
      } else b.mino.tepki('sevinc', 1.4);
      await soyle(y, y.ad === 'kino' ? K.bayildi : y.ad === 'mino' ? M.tepki.bayildi : (L.musteri as Record<string, Record<string, string>>).lokum?.bayildi);
    } else if (s.tepki === 'mmm') {
      salonSes.mmm();
      if (y.kisi) {
        y.kisi.ifade('mutlu', 1200);
        void y.kisi.oynat('hop', 500);
      } else b.mino.tepki('ham', 1);
      await soyle(y, y.ad === 'kino' ? K.mmm : y.ad === 'mino' ? M.tepki.mmm : undefined);
    } else {
      salonSes.komik();
      if (y.kisi) {
        y.kisi.ifade('saskin', 700);
        await y.kisi.oynat('titre', 500);
        y.kisi.ifade('keyif', 1200);
      } else b.mino.tepki('zorlan', 1.2);
      if (s.neden === 'bos') await b.minoSoyle(L.mino.tepki.bos);
      else await soyle(y, y.ad === 'kino' ? (s.neden === 'sevmez' ? K.komik : K.mmm) : y.ad === 'mino' ? (s.neden === 'sevmez' ? M.tepki.komik : M.tepki.mmm) : (L.musteri as Record<string, Record<string, string>>).lokum?.komik);
    }
    t.classList.add('rs-kirli');
    y.doydu = true;
    y.yiyor = false;
    if (yiyenler.every((x) => x.doydu)) {
      await bekle(600);
      void b.minoSoyle(M.personel_bitti);
      await bekle(1600);
      void bitir();
    }
  }

  const sirada = () => yiyenler.find((y) => !y.doydu && !y.yiyor && y.hazir) ?? yiyenler.find((y) => !y.doydu && !y.yiyor && (y.ad !== 'lokum' || !!y.kisi));
  function servis(u: Urun, t: HTMLElement | null): boolean {
    const y = sirada();
    if (!y || bitirildi) return false;
    if (t) {
      // tabak pencereden masaya uçar
      const a = t.getBoundingClientRect();
      const c = masa.el.getBoundingClientRect();
      try {
        t.animate([{ transform: 'none' }, { transform: `translate(${c.left + c.width / 2 - a.left - a.width / 2}px, ${c.top - a.top - a.height}px) scale(0.8)`, opacity: 0.4 }], { duration: sure(420), easing: 'ease-in' }).finished.then(
          () => t.remove(),
          () => t.remove(),
        );
      } catch {
        t.remove();
      }
    }
    void ye(y, u);
    return true;
  }

  // ---------------------------------------------------------------- açılış: üçü masaya
  let minoEski: { left: string; top: string } | null = null;
  const kur = async () => {
    void b.minoSoyle(M.personel);
    const ust = (x: number) => masa.yer.x + x;
    // Kino (sıradaki işini bitirince) önlüğünü çıkarır, masaya oturur
    void b.kinoIs(async () => {
      await b.kinoYuru(ust(8), masa.yer.y - 0.4);
      if (kapandi || bitirildi) return;
      b.oturt(b.kino, ust(8), masa);
      b.kino.el.classList.add('rs-pr-oturan');
      yiyenler[2].hazir = true;
      void b.kinoSoyle(K.personel);
    });
    // Lokum kapıdan koşar
    const lokum = b.yeniKisi('lokum', 'lokum');
    yiyenler[0].kisi = lokum;
    const kp = b.kapi();
    lokum.yerKoy(kp.x, kp.y + 20);
    lokum.el.style.zIndex = '950';
    await lokum.hazir;
    await lokum.yuru(ust(-8), masa.yer.y - 0.4, 34);
    if (kapandi) return;
    b.oturt(lokum, ust(-8), masa);
    b.zSira(lokum);
    yiyenler[0].hazir = true;
    void lokum.oynat('hop', 380);
    // Mino masaya zıplar (masanın ortası, sandalyede)
    minoEski = { left: b.minoEl.style.left, top: b.minoEl.style.top };
    b.minoEl.classList.add('rs-pr-mino');
    b.minoEl.style.left = `${masa.yer.x}%`;
    b.minoEl.style.top = `${masa.yer.y - 6}%`;
    void b.mino.otur(true);
    yiyenler[1].hazir = true;
    b.mino.tepki('zipla', 0.6);
  };
  void kur();

  async function bitir() {
    if (bitirildi) return;
    bitirildi = true;
    salonSes.tabela();
    levha.classList.add('rs-dondu');
    await bekle(500);
    levha.remove();
    delete masa.el.dataset.personel;
    for (const t of masa.ust.querySelectorAll('.rs-pr-tabak')) t.remove();
    b.kino.otur(false);
    b.kino.el.classList.remove('rs-pr-oturan');
    void b.mino.otur(false);
    b.minoEl.classList.remove('rs-pr-mino');
    if (minoEski) Object.assign(b.minoEl.style, minoEski);
    const lokum = yiyenler[0].kisi;
    if (lokum) {
      lokum.otur(false);
      lokum.poz('selam');
      const kp = b.kapi();
      void lokum.yuru(kp.x, kp.y + 20, 30).then(() => lokum.kapat());
    }
    await b.kinoIs(() => b.kinoYerine());
    if (!kapandi) b.bitti();
  }

  return {
    ver: (u, t) => servis(u, t),
    birak(u, x, y) {
      if (!ustunde(masa.el, x, y, 24)) return false;
      return servis(u, null);
    },
    durum: () => yiyenler.map((y) => ({ ad: y.ad, doydu: y.doydu, tepki: tepkiler[y.ad] })),
    kapat() {
      kapandi = true;
      levha.remove();
      yiyenler[0].kisi?.kapat();
    },
  };
}
