/**
 * Bölüm 1: Ada'nın Sürpriz Doğum Günü.
 * Mino ve arkadaşları Ada'ya sürpriz parti hazırlar; çocuk sesiyle yardım eder:
 * balonları şişirir (üfleme) → saklanıp susar (sessizlik) → "Sürpriz!" diye bağırır (yüksek ses) →
 * şarkı söyler (perde) → mumları üfler (üfleme gücü) → pastayı dil şaklatarak keser (tık) → alkışla dans (ritim).
 * Her adım parmakla da oynanır; hiçbir adımda takılıp kalınmaz.
 */
import M from '../../content/macera.json';
import { efekt, konus } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { Mino } from '../../src/mino/mino';
import type { Ozellik } from '../../ses-testi/src/analiz';
import { Alkis, sesVar, Ufleme } from '../../orman/src/gorev';
import { kulak } from '../../orman/src/kulak';
import { davul, nota } from '../../orman/src/sesler';
import { resimSesi, resimSesiHazirla } from '../../canlan/src/ses';
import { adres, resim } from './gorsel';
import { FIGURLER, Oyuncu } from './oyuncu';
import { MINO_SVG } from '../../src/mino/mino-svg';
import { Sahne } from './sahne';
import { anlikFark, melodi, notaDegerlendir, referansBul, tepeNota, type Nota, type NotaSonucu } from './sarki';

const D = M.dogumgunu;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const sec = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export interface BolumArayuz {
  /** alt yazı (Mino'nun söylediği) */
  yazi(t: string): void;
  /** görev ipucu (ekranın altında, kısa) */
  ipucu(t: string | null): void;
  /** büyük dokunma düğmesi (ör. "SÜRPRİZ!") — dokununca çözülür */
  dugme(etiket: string): Promise<void>;
  dugmeKaldir(): void;
  /** ilerleme noktaları */
  ilerleme(n: number, toplam: number): void;
  kapandiMi(): boolean;
}

/** Ada'nın arkadaşları (konuklar) */
const KONUKLAR = ['can', 'elif', 'deniz', 'zeynep'] as const;
type KonukAd = (typeof KONUKLAR)[number];
/** çizim oranı (en/boy) ve şapkanın kafadaki yeri */
const KONUK_CIZIM: Record<KonukAd, { oran: number; sapka: { x: number; y: number; w: number; d?: number } }> = {
  can: { oran: 281 / 512, sapka: { x: 49, y: 7, w: 32, d: -6 } },
  elif: { oran: 274 / 512, sapka: { x: 50, y: 6, w: 30, d: 6 } },
  deniz: { oran: 289 / 512, sapka: { x: 47, y: 10, w: 32, d: -5 } },
  zeynep: { oran: 322 / 512, sapka: { x: 50, y: 6, w: 28, d: 6 } },
};
/** Konukların parti sırasındaki yerleri (x, alttan y) */
const YER: Record<KonukAd, [number, number, number]> = { can: [27, 5, 7], elif: [34, 21, 4], deniz: [66, 21, 4], zeynep: [74, 5, 7] };
/** Saklanma yerleri (x, y, katman): koltuğun, masanın, hediyelerin arkası */
const SAKLI: Record<KonukAd, [number, number, number]> = { can: [16, 13, 2], elif: [37, 5, 5], deniz: [63, 5, 5], zeynep: [84, 3, 4] };
const ADA_YER: [number, number] = [50, 30];
/** Balonların flamadaki yerleri */
const BALON_YER: [number, number][] = [
  [10, 68], [26, 64], [42, 62], [58, 62], [74, 64], [90, 68],
];
const BALON_TON = [0, 200, 60, 280, 130, 330];

export async function dogumGunu(kok: HTMLElement, ui: BolumArayuz): Promise<void> {
  const yas = durum.i.yas ?? 4;
  const adaYer: [number, number] = [...ADA_YER];
  const sahne = new Sahne('parti-sahne/oda');
  kok.append(sahne.el);

  // --------------------------------------------------------------- dekor
  sahne.koy(resim('parti/flama', 'mc-flama'), { x: 50, y: 74, w: 106, z: 1 });
  const kapi = sahne.koy(h('div.mc-kapi', {}, resim('parti/kapi', '', 'Kapı')), { x: 89, y: 24, w: 24, z: 1 });
  sahne.koy(resim('parti/koltuk', '', 'Koltuk'), { x: 22, y: 17, w: 42, z: 3 });
  sahne.koy(resim('parti/hediye', '', 'Hediyeler'), { x: 82, y: 9, w: 24, z: 5 });
  sahne.koy(resim('parti/masa', '', 'Masa'), { x: 50, y: 2, w: 54, z: 6 });
  const pasta = sahne.koy(h('div.mc-pasta', {}, resim('parti/pasta', 'mc-pasta-resim', 'Pasta')), { x: 50, y: 17, w: 32, z: 7 });

  const ada = new Oyuncu({ ad: 'ada', resim: 'parti/ada', boy: 17, oran: 284 / 512, sapka: { x: 50, y: 12, w: 34, d: -4 } });
  const konuklar = KONUKLAR.map((ad) => new Oyuncu({ ad, resim: `parti/${ad}`, boy: 15.5, ...KONUK_CIZIM[ad] }));
  const oy = { ada };
  const konukAd = KONUKLAR;
  for (const k of konuklar) {
    k.el.classList.add('gizli');
    sahne.dunya.append(k.el);
  }
  oy.ada.el.classList.add('gizli');
  sahne.dunya.append(oy.ada.el);

  const mino = new Mino();
  const minoKutu = sahne.koy(h('div.mc-mino', {}, mino.el), { x: 13, y: -2, w: 30, z: 10 });
  resimSesiHazirla('zil');
  resimSesiHazirla('patla');
  resimSesiHazirla('duduk');
  resimSesiHazirla('yasasin');
  resimSesiHazirla('kikir');

  const soyle = async (t: string) => {
    if (ui.kapandiMi()) return;
    ui.yazi(t);
    await konus(t, { ton: 1.12 });
  };
  const adaSoyle = async (t: string) => {
    ui.yazi(t);
    await konus(t, { ton: 1.28 });
  };
  const efektCal = (ad: string, sus = 1200) => {
    kulak.sustur(sus);
    void resimSesi(ad);
  };
  /**
   * Tepki dalgası: biri sevinince sahnede ona en yakın iki kişi kısa gecikmeyle, daha küçük tepki verir.
   * Herkes aynı anda aynı hareketi yapmaz.
   */
  const dalga = (ilk: Oyuncu, yukseklik = 18) => {
    void ilk.sevin(yukseklik);
    const x = (k: Oyuncu) => Number(k.el.style.getPropertyValue('--x')) || 50;
    [...konuklar, oy.ada]
      .filter((k) => k !== ilk && !k.el.classList.contains('gizli'))
      .sort((a, b) => Math.abs(x(a) - x(ilk)) - Math.abs(x(b) - x(ilk)))
      .slice(0, 2)
      .forEach((k, i) => setTimeout(() => void (i === 0 ? k.sevin(yukseklik * 0.45, 700) : k.kipir()), 160 + i * 150));
  };
  const konfeti = (x = 50, y = 40, adet = 90) => {
    const [px, py] = sahne.noktaEkran(x, y);
    konfetiPatlat(kok, px, py, adet);
  };

  // rAF döngüsü (görevlerin zamanlaması için)
  const tikler = new Set<(dt: number) => void>();
  let onceki = performance.now();
  let raf = requestAnimationFrame(function d(t) {
    const dt = Math.min(0.1, (t - onceki) / 1000);
    onceki = t;
    tikler.forEach((f) => f(dt));
    raf = requestAnimationFrame(d);
  });
  const temizle = () => {
    cancelAnimationFrame(raf);
    kulak.dinle(null);
    mino.kapat();
  };

  const balonSayisi = { 3: 3, 4: 4, 5: 5, 6: 6 }[yas] ?? 4;
  /** 5-6 yaş: balon çizgide durmalı, fazla şişen patlar */
  const kontrollu = yas >= 5;

  try {
    // =============================================================== 0. Açılış
    minoKutu.classList.add('giris');
    await bekle(700);
    mino.tepki('zipla');
    await soyle(D.merhaba);
    // arkadaşlar kapıdan tek tek gelir: zil çalar, kapı açılır, içeri yürüyüp el sallarlar
    for (const [i, k] of konuklar.entries()) {
      const [x, y, z] = YER[konukAd[i]];
      efektCal('zil', 900);
      kapi.classList.add('acik');
      await bekle(450);
      k.koy(89, 25);
      k.katman = 2;
      k.el.classList.remove('gizli');
      k.el.classList.add('kapida');
      await bekle(250);
      k.el.classList.remove('kapida');
      k.katman = z;
      await k.git(x, y, 900);
      kapi.classList.remove('acik');
      void k.balon(M.tepki.selam, 900);
      await k.selamVer();
    }
    await soyle(D.arkadaslar);
    await soyle(D.surpriz_plan);
    if (ui.kapandiMi()) return;

    // =============================================================== 1. Balonlar
    await soyle(D.balon_giris);
    if (kontrollu) await soyle(D.balon_cizgi);
    for (let n = 0; n < balonSayisi && !ui.kapandiMi(); n++) {
      ui.ilerleme(n, balonSayisi);
      await balonSisir(n);
    }
    ui.ilerleme(balonSayisi, balonSayisi);
    ui.ipucu(null);
    await soyle(D.balon_bitti);

    // =============================================================== 2. Saklan, sus
    mino.tepki('sasir');
    await soyle(D.saklan);
    for (const [i, k] of konuklar.entries()) {
      const [x, y, z] = SAKLI[konukAd[i]];
      k.katman = z;
      k.poz('saklaniyor');
      k.el.classList.add('comeldi');
      void k.git(x, y, 600);
    }
    minoKutu.classList.add('sakli');
    await bekle(700);
    await sahne.isik(false, 1000);
    efektCal('zil', 1600);
    await bekle(1300);
    await soyle(D.sessiz);
    await sessizBekle();

    // =============================================================== 3. SÜRPRİZ!
    kapi.classList.add('acik');
    oy.ada.koy(89, 25);
    oy.ada.katman = 2;
    oy.ada.el.classList.remove('gizli');
    oy.ada.el.classList.add('karanlikta');
    await bekle(700);
    await oy.ada.git(adaYer[0], adaYer[1], 1600);
    kapi.classList.remove('acik');
    oy.ada.katman = 4;
    await soyle(D.surpriz_simdi);
    await surprizBekle();
    // ışıklar yanar, herkes fırlar
    await sahne.isik(true, 250);
    oy.ada.el.classList.remove('karanlikta');
    minoKutu.classList.remove('sakli');
    efektCal('duduk', 900);
    sahne.titret(1);
    oy.ada.poz('saskin', 2600);
    void oy.ada.zipla(34);
    mino.tepki('zipla');
    konfeti(50, 35, 140);
    for (const [i, k] of konuklar.entries()) {
      const [x, y, z] = YER[konukAd[i]];
      k.katman = z;
      k.poz('normal');
      k.el.classList.remove('comeldi');
      k.sapkaTak();
      // fırlayış sırayla: herkes aynı anda değil
      setTimeout(() => void k.git(x, y, 450).then(() => k.figur('zipla', 1, 560)), i * 90);
    }
    efektCal('yasasin', 2000);
    await bekle(900);
    oy.ada.sapkaTak();
    await adaSoyle(M.ada.vay);
    await soyle(D.iyi_ki);

    // =============================================================== 4. Şarkı
    await sarkiSoyle();

    // =============================================================== 5. Mumlar
    await mumlar();

    // =============================================================== 6. Pastayı kes
    await pastaKes();

    // =============================================================== 7. Dans
    await dans();

    await sahne.kamera(50, 50, 1, 900);
    oy.ada.poz('mutlu');
    await adaSoyle(M.ada.tesekkur);
    konfeti(50, 30, 160);
    efektCal('yasasin', 2000);
    await soyle(D.son);
  } finally {
    temizle();
  }

  // ================================================================= sahne yardımcıları

  /** Balon: öne gelir, üfledikçe şişer, dolunca uçup flamaya asılır. 5-6 yaş: çizgiyi geçerse patlar. */
  async function balonSisir(n: number) {
    const hedef = 1;
    const ton = BALON_TON[n % BALON_TON.length];
    const govde = h('div.mc-balon-govde', { style: `--ton:${ton}deg` }, resim('orman-esya/balon', '', 'Balon'));
    const balon = sahne.koy(h('div.mc-balon', {}, govde), { x: 50, y: 34, w: 16, z: 11 });
    // 5-6 yaş: yanda ölçer; yeşil bölgede durmalı
    const isaret = h('i.mc-olcer-isaret');
    const olcer = kontrollu ? sahne.koy(h('div.mc-olcer', {}, h('i.mc-olcer-yesil'), isaret), { x: 70, y: 34, w: 5, z: 11 }) : null;
    const u = new Ufleme(kulak.ayar, 0.5, true);
    let dolu = 0;
    let patladi = false;
    ui.ipucu(kontrollu ? 'Üfle, yeşilde dur!' : 'Balona üfle');
    // geniş yeşil bölge; yeşile girince balon yavaşlar (durmak kolay olsun)
    const ALT = 0.7;
    const UST = 1.4;
    await new Promise<void>((coz) => {
      const bitir = () => {
        tikler.delete(tik);
        coz();
      };
      const tik = (dt: number) => {
        if (ui.kapandiMi()) return bitir();
        u.tik(dt);
        if (u.aktif) dolu += dt * (0.6 + u.guc * 0.5) * (yas <= 3 ? 1.3 : 1) * (kontrollu && dolu >= ALT ? 0.45 : 1);
        balon.style.setProperty('--s', String(0.25 + Math.min(dolu, 1.25) * 0.75));
        isaret.style.setProperty('--p', String(Math.min(1, dolu / 1.25)));
        govde.classList.toggle('sisiyor', u.aktif);
        if (kontrollu && dolu > UST) {
          patladi = true;
          return bitir();
        }
        if (kontrollu ? dolu >= ALT && !u.aktif : dolu >= hedef) bitir();
      };
      tikler.add(tik);
      kulak.dinle((o) => u.kare(o));
      dokunma = { bas: () => u.bas(), birak: () => u.birak() };
    });
    kulak.dinle(null);
    dokunma = null;
    olcer?.remove();
    if (ui.kapandiMi()) return;
    if (patladi) {
      balon.classList.add('patladi');
      sahne.titret(0.8);
      sahne.parilti(50, 40, 18, '#ff9ec4');
      efektCal('patla', 800);
      void konuklar[n % 4].balon(M.tepki.vay, 900);
      await bekle(450);
      balon.remove();
      await soyle(D.balon_patladi);
      return balonSisir(n);
    }
    // bağla ve as
    const [x, y] = BALON_YER[n % BALON_YER.length];
    efekt.secim();
    balon.classList.add('asiliyor');
    balon.style.setProperty('--s', '0.62');
    balon.style.setProperty('--x', String(x));
    balon.style.setProperty('--y', String(y));
    balon.style.zIndex = '2';
    const k = konuklar[n % 4];
    dalga(k, 18);
    await bekle(900);
    balon.classList.add('asili');
    sahne.parilti(x, y + 4, 9);
    if (n < balonSayisi - 1) void soyle(D.balon_asildi[n % D.balon_asildi.length]);
  }

  /** Sessizlik: Ada kapıya yaklaşırken ses çıkmamalı. Ses olunca bir konuk kıkırdar, Ada durur. */
  async function sessizBekle() {
    const hedef = { 3: 3, 4: 4, 5: 5, 6: 6 }[yas] ?? 4;
    let gecen = 0;
    let gurultu = 0;
    let uyari = 0;
    let dokunuyor = false;
    ui.ipucu('Şşş… sessiz ol');
    const halka = h('div.mc-sessiz', {}, h('i'));
    sahne.on.append(halka);
    await new Promise<void>((coz) => {
      const kare = (o: Ozellik) => {
        if (dokunuyor) return;
        if (o.db - kulak.ayar.taban + kulak.ayar.duyarlilik > 12) gurultu += kulak.ayar.kare;
        else gurultu = Math.max(0, gurultu - kulak.ayar.kare * 2);
        if (gurultu > 0.15) {
          gurultu = 0;
          gecen = Math.max(0, gecen - 1.2);
          const k = sec(konuklar);
          void k.kipir();
          void k.balon('hihi', 900);
          if (performance.now() - uyari > 5000) {
            uyari = performance.now();
            efektCal('kikir', 900);
            void soyle(D.kim_var);
          }
        }
      };
      const mikVar = kulak.acik && !TEST_MODU;
      const tik = (dt: number) => {
        if (!mikVar && !dokunuyor) return;
        if (dokunuyor || gurultu === 0) gecen += dt;
        halka.style.setProperty('--p', String(Math.min(1, gecen / hedef)));
        // ayak sesleri: Ada yaklaşıyor
        if (Math.floor(gecen * 2) !== Math.floor((gecen - dt) * 2)) davul(false, 0.08 + (gecen / hedef) * 0.12);
        if (gecen >= hedef) {
          tikler.delete(tik);
          coz();
        }
      };
      tikler.add(tik);
      kulak.dinle(kare);
      dokunma = { bas: () => (dokunuyor = true), birak: () => (dokunuyor = false) };
      if (!mikVar) ui.ipucu('Parmağını basılı tut, sessizce bekle');
    });
    kulak.dinle(null);
    dokunma = null;
    halka.remove();
    ui.ipucu(null);
  }

  /** "SÜRPRİZ!": yüksek bir ses (ya da büyük düğme) */
  async function surprizBekle() {
    let yuksek = 0;
    let deneme = 0;
    const dugme = ui.dugme('SÜRPRİZ!');
    await Promise.race([
      dugme,
      new Promise<void>((coz) => {
        kulak.dinle((o) => {
          const ust = o.db - kulak.ayar.taban + kulak.ayar.duyarlilik;
          if (ust > 24) yuksek += kulak.ayar.kare;
          else if (ust > 12 && yuksek === 0) {
            // ses var ama kısık
            deneme++;
            if (deneme === 60) void soyle(D.surpriz_yine);
          }
          if (yuksek > 0.18) coz();
        });
      }),
    ]);
    kulak.dinle(null);
    ui.dugmeKaldir();
  }

  /** Karaoke: önce Mino'nun müzik kutusu çalar (dinle), sonra çocuk söyler; konuklar sesine göre tepki verir. */
  async function sarkiSoyle() {
    await sahne.kamera(50, 58, 1.08, 900);
    const satir = yas <= 3 ? 2 : 4;
    const notalar = melodi(satir);
    const VURUS = yas <= 4 ? 0.62 : 0.56;
    const panel = h('div.mc-karaoke');
    const heceEl = notalar.map((n) => h(`span.mc-hece${n.midi === tepeNota(notalar).midi && yas >= 6 ? '.tepe' : ''}`, { style: `--h:${(n.midi - 65) / 16}` }, n.hece));
    const satirlar: HTMLElement[] = [];
    notalar.forEach((n, i) => {
      satirlar[n.satir] ??= h('div.mc-satir');
      satirlar[n.satir].append(heceEl[i]);
    });
    const top = h('i.mc-top');
    panel.append(...satirlar, top);
    sahne.on.append(panel);

    const hece = (i: number) => {
      heceEl.forEach((e, k) => e.classList.toggle('simdi', k === i));
      const r = heceEl[i].getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      top.style.transform = `translate(${r.left - p.left + r.width / 2}px, ${r.top - p.top - 14}px)`;
    };

    // --- dinle: müzik kutusu
    await soyle(D.sarki_giris);
    konuklar.forEach((k) => k.sallan(true));
    for (const [i, n] of notalar.entries()) {
      if (ui.kapandiMi()) return;
      hece(i);
      nota(n.midi, n.vurus * VURUS * 0.95, 0.22);
      await bekle(n.vurus * VURUS * 1000 + (notalar[i + 1] && notalar[i + 1].satir !== n.satir ? VURUS * 1000 : 0));
    }
    heceEl.forEach((e) => e.classList.remove('simdi'));
    konuklar.forEach((k) => k.sallan(false));

    // --- sen söyle
    await soyle(D.sarki_sen);
    for (const s of ['3', '2', '1']) {
      ui.ipucu(s);
      davul(true, 0.18);
      await bekle(VURUS * 1000);
    }
    ui.ipucu('Söyle!');
    const sonuclar: NotaSonucu[] = [];
    let referans: number | null = null;
    const refPerdeler: number[] = [];
    let perdeler: number[] = [];
    let sesliKare = 0;
    let kareSay = 0;
    let dokunusVar = false;
    let simdiki: Nota | null = null;
    let tepkiZamani = 0;
    konuklar.forEach((k) => k.sallan(true));
    kulak.dinle((o) => {
      if (!simdiki) return;
      kareSay++;
      if (sesVar(o, kulak.ayar, 10)) sesliKare++;
      if (o.perde !== null && sesVar(o, kulak.ayar, 10)) {
        perdeler.push(o.perde);
        if (simdiki.satir === 0 && simdiki.midi === 67) refPerdeler.push(o.perde);
        // anlık tepki: çok ince / çok kalın
        if (referans && yas >= 4 && performance.now() - tepkiZamani > 1400) {
          const f = anlikFark(o.perde, referans, simdiki.midi);
          if (Math.abs(f) > 4.5) {
            tepkiZamani = performance.now();
            const k = sec(konuklar);
            k.poz('saskin', 1100);
            void k.balon(f > 0 ? M.tepki.tiz : M.tepki.kalin, 1000);
          }
        }
      }
    });
    dokunma = { bas: () => (dokunusVar = true), birak: () => undefined };
    const tolerans = yas >= 6 ? 2.5 : 3.5;
    for (const [i, n] of notalar.entries()) {
      if (ui.kapandiMi()) break;
      simdiki = n;
      perdeler = [];
      sesliKare = 0;
      kareSay = 0;
      dokunusVar = false;
      hece(i);
      // çok hafif vuruş (tempo için); kulak kısa süre susar
      davul(false, 0.05);
      await bekle(n.vurus * VURUS * 1000);
      if (!referans) referans = referansBul(refPerdeler);
      const oran = kareSay ? sesliKare / kareSay : 0;
      const r = dokunusVar
        ? 'dogru'
        : notaDegerlendir({ perdeler, sesli: TEST_MODU ? 1 : oran, midi: n.midi, referans, tolerans, yalnizSes: yas <= 4 || i < 2 });
      sonuclar.push(r);
      heceEl[i].classList.add(r === 'dogru' || r === 'ses' ? 'iyi' : r === 'sessiz' ? 'bos' : 'kacti');
      if (r === 'dogru' && n === tepeNota(notalar) && yas >= 6) {
        const k = sec(konuklar);
        k.poz('alkis', 1000);
        void k.balon(M.tepki.vay, 1000);
      }
      if (notalar[i + 1] && notalar[i + 1].satir !== n.satir) {
        simdiki = null;
        await bekle(VURUS * 1000);
      }
    }
    simdiki = null;
    kulak.dinle(null);
    dokunma = null;
    ui.ipucu(null);
    konuklar.forEach((k) => k.sallan(false));
    const iyi = sonuclar.filter((r) => r === 'dogru' || r === 'ses').length;
    // herkes alkışlar (ne kadar iyi söylediyse o kadar coşkulu)
    konuklar.forEach((k, i) => setTimeout(() => {
      k.poz('alkis', 1400);
      void k.zipla(iyi / sonuclar.length > 0.6 ? 26 : 12);
    }, i * 120));
    efektCal('yasasin', 2000);
    if (iyi / Math.max(1, sonuclar.length) > 0.6) konfeti(50, 30, 80);
    panel.classList.add('bitti');
    await soyle(D.sarki_bitti);
    panel.remove();
  }

  /** Mumlar: yaş kadar mum; üfleme gücüne göre teker teker (güçlüyse ikişer) söner */
  async function mumlar() {
    const adet = Math.max(3, Math.min(6, yas));
    const mumKutu = h('div.mc-mumlar');
    const mumlar: { el: HTMLElement; alev: HTMLElement; sondu: boolean }[] = [];
    for (let i = 0; i < adet; i++) {
      const alev = h('div.mc-alev', {}, resim('orman-esya/alev'));
      const el = h('div.mc-mum', { style: `--i:${i};--n:${adet}` }, alev, resim('parti/mum', 'mc-mum-resim'));
      mumKutu.append(el);
      mumlar.push({ el, alev, sondu: false });
    }
    pasta.append(mumKutu);
    await sahne.kamera(50, 72, 1.7, 1100);
    oy.ada.poz('dilek');
    await soyle(D.mum_giris);
    ui.ipucu('Mumlara üfle');
    const u = new Ufleme(kulak.ayar, 0.8, true);
    let biriken = 0;
    await new Promise<void>((coz) => {
      const tik = (dt: number) => {
        u.tik(dt);
        const acik = mumlar.filter((m) => !m.sondu);
        for (const m of acik) m.alev.style.setProperty('--g', String(u.guc));
        if (!u.aktif) {
          biriken = Math.max(0, biriken - dt);
          return;
        }
        biriken += dt * (0.8 + u.guc * 1.6);
        if (biriken > 0.28 && acik.length) {
          biriken = 0;
          const kac = u.guc > 0.55 ? 2 : 1;
          for (const m of acik.slice(0, kac)) {
            m.sondu = true;
            m.el.classList.add('sondu');
          }
          nota(84 - acik.length, 0.3, 0.12);
          if (mumlar.every((m) => m.sondu)) {
            tikler.delete(tik);
            coz();
          }
        }
      };
      tikler.add(tik);
      kulak.dinle((o) => u.kare(o));
      dokunma = { bas: () => u.bas(), birak: () => u.birak() };
    });
    kulak.dinle(null);
    dokunma = null;
    ui.ipucu(null);
    await bekle(600);
    oy.ada.poz('mutlu');
    dalga(oy.ada, 20);
    efektCal('yasasin', 2000);
    konfeti(50, 45, 110);
    sahne.parilti(50, 32, 20);
    await soyle(D.mum_bitti);
    mumKutu.classList.add('kalkti');
    await bekle(500);
    mumKutu.remove();
  }

  /**
   * Pasta: yakın çekim — pasta üstten görünür, her "tık"ta (dil şaklatma ya da alkış) pasta spatulası
   * bir kesik atar, dilim kalkar ve sırası gelen arkadaşın tabağına uçar. Son dilimde tabak boş kalır.
   */
  async function pastaKes() {
    const adet = Math.max(3, Math.min(6, yas));
    const kimler: { ad: string; oyuncu: Oyuncu | null }[] = [
      { ad: 'ada', oyuncu: oy.ada },
      ...KONUKLAR.map((ad, i) => ({ ad, oyuncu: konuklar[i] })),
      { ad: 'mino', oyuncu: null },
    ].slice(0, adet);

    // --- yakın çekim katmanı
    const aci = (i: number) => -90 + (i * 360) / adet;
    const rad = (d: number) => (d * Math.PI) / 180;
    const dilimler = Array.from({ length: adet }, (_, i) => {
      const a0 = aci(i);
      const a1 = aci(i + 1);
      const noktalar = ['50% 50%'];
      for (let k = 0; k <= 10; k++) {
        const a = rad(a0 + ((a1 - a0) * k) / 10);
        noktalar.push(`${(50 + 72 * Math.cos(a)).toFixed(2)}% ${(50 + 72 * Math.sin(a)).toFixed(2)}%`);
      }
      const orta = rad((a0 + a1) / 2);
      const ic = h('div.mc-kd-ic', { style: `clip-path:polygon(${noktalar.join(',')})` }, resim('parti/pasta-ust', '', ''));
      const dis = h('div.mc-kd', { style: `--dx:${(Math.cos(orta) * 9).toFixed(2)}%;--dy:${(Math.sin(orta) * 9).toFixed(2)}%` }, ic);
      return { dis, orta };
    });
    const bicakImg = resim('parti/bicak', 'mc-kb-resim', 'Pasta spatulası');
    const bicak = h('div.mc-kb', {}, bicakImg);
    const pastaUst = h('div.mc-kesim-pasta', {}, ...dilimler.map((d) => d.dis), bicak);
    const kirintilar = h('div.mc-kesim-kirinti', {}, ...Array.from({ length: 9 }, (_, i) => h('i', { style: `--i:${i}` })));
    const tabakEl = kimler.map((k) => {
      const yuz = k.ad === 'mino' ? h('div.mc-avatar.mino') : h('div.mc-avatar', { style: `--resim:url("${adres(`parti/${k.ad}`)}")` });
      if (k.ad === 'mino') yuz.innerHTML = MINO_SVG;
      return h('div.mc-kesim-yer', {}, yuz, h('div.mc-kesim-tabakcik'));
    });
    const yakin = h('div.mc-kesim', {}, h('div.mc-kesim-servis', {}, kirintilar, pastaUst), h('div.mc-kesim-tabaklar', {}, ...tabakEl));
    await sahne.kamera(50, 70, 1.35, 800);
    sahne.on.append(yakin);
    await bekle(60);
    yakin.classList.add('acik');
    await bekle(700);
    await soyle(D.kes_giris);
    ui.ipucu('Dilini şaklat: tık tık!');

    /** spatula bir çizgiye (açı) gider ve bastırır; o çizginin iki yanındaki dilimler "kesik" olur */
    const kes = async (cizgi: number) => {
      bicak.style.setProperty('--a', `${aci(cizgi) + 45}deg`);
      bicak.classList.add('gorunur');
      await bekle(170);
      bicakImg.animate(
        [{ transform: 'translate(-5%, -93%) scale(1)' }, { transform: 'translate(-5%, -93%) scale(0.9) translateY(4%)', offset: 0.45 }, { transform: 'translate(-5%, -93%) scale(1)' }],
        { duration: sure(260), easing: 'ease-in-out' },
      );
      efekt.cevir();
      await bekle(130);
      dilimler[(cizgi + adet - 1) % adet].dis.classList.add('kesik');
      dilimler[cizgi % adet].dis.classList.add('kesik');
    };
    /** i. dilim kalkar ve i. tabağa uçar */
    const tasi = async (i: number) => {
      const d = dilimler[i];
      d.dis.classList.add('kalkti');
      await bekle(280);
      const r = pastaUst.getBoundingClientRect();
      const t = tabakEl[i].getBoundingClientRect();
      const cx = r.left + r.width / 2 + Math.cos(d.orta) * r.width * 0.3;
      const cy = r.top + r.height / 2 + Math.sin(d.orta) * r.height * 0.3;
      const dx = t.left + t.width / 2 - cx;
      const dy = t.top + t.height * 0.72 - cy;
      await d.dis
        .animate(
          [
            { transform: 'translate(var(--dx), var(--dy)) scale(1)' },
            { transform: `translate(calc(var(--dx) + ${dx * 0.5}px), calc(var(--dy) + ${dy * 0.5 - r.height * 0.12}px)) scale(0.7)`, offset: 0.5 },
            { transform: `translate(calc(var(--dx) + ${dx}px), calc(var(--dy) + ${dy}px)) scale(0.42)` },
          ],
          { duration: sure(560), easing: 'cubic-bezier(0.45, 0, 0.3, 1)', fill: 'forwards' },
        )
        .finished.catch(() => undefined);
      d.dis.remove();
      const tabakcik = tabakEl[i].querySelector('.mc-kesim-tabakcik')!;
      tabakcik.append(resim('parti/dilim', '', 'Dilim'));
      tabakEl[i].classList.add('dolu');
      nota(72 + i * 2, 0.35, 0.18);
      void kimler[i].oyuncu?.figur('zipla', 1, 520);
    };

    const eski = kulak.ayar.duyarlilik;
    kulak.ayar.duyarlilik = eski + 6; // dil şaklatması alkıştan kısıktır
    const a = new Alkis(kulak.ayar);
    let kesilen = 0;
    let mesgul = false;
    let kesTik: ((dt: number) => void) | null = null;
    await new Promise<void>((coz) => {
      const tikla = async () => {
        if (mesgul || kesilen >= adet) return;
        mesgul = true;
        const i = kesilen++;
        if (i === 0) await kes(0);
        if (i < adet - 1) await kes(i + 1);
        bicak.classList.remove('gorunur');
        await tasi(i);
        mesgul = false;
        if (kesilen === adet) coz();
      };
      a.onAlkis = () => void tikla();
      kesTik = () => a.tik();
      tikler.add(kesTik);
      kulak.dinle((o) => a.kare(o));
      dokunma = { bas: () => void tikla(), birak: () => undefined };
    });
    kulak.dinle(null);
    if (kesTik) tikler.delete(kesTik);
    kulak.ayar.duyarlilik = eski;
    dokunma = null;
    ui.ipucu(null);
    kirintilar.classList.add('gorunur');
    efektCal('yasasin', 2000);
    await soyle(D.kes_bitti);
    // yakın çekim kapanır: masada boş pasta tabağı, önlerde dilimler
    yakin.classList.remove('acik');
    pasta.replaceChildren(resim('parti/altlik', 'mc-altlik', 'Boş pasta tabağı'));
    // dilimler masanın önüne, tabaklarda
    kimler.forEach((_, i) => {
      const x = 29 + (42 * i) / Math.max(1, adet - 1);
      sahne.koy(h('div.mc-tabak.dolu', { style: `--g:${i * 90}ms` }, h('i.mc-tabak-bos'), resim('parti/dilim', '', 'Dilim')), { x, y: 11 + (i % 2) * 2, w: 8, z: 8 });
    });
    // pasta bitti: Ada artık pastanın değil masanın arkasında durur
    adaYer[1] = 21;
    oy.ada.koy(adaYer[0], adaYer[1]);
    await bekle(500);
    yakin.remove();
    konuklar.forEach((k, i) => setTimeout(() => k.poz('alkis', 1200), i * 110));
    await sahne.kamera(50, 50, 1, 900);
  }

  /**
   * Dans: her alkış bir müzik vuruşu + bir dans figürü. Koreografi: aynalı figürler (soldakiler sola,
   * sağdakiler sağa), dalga (soldan sağa sırayla), yer değiştirme, Ada'nın etrafında toplanma ve final taklası.
   * Disko topu iner, renkli spot ışıklar döner.
   */
  async function dans() {
    const herkes = [oy.ada, ...konuklar];
    const evler = new Map<Oyuncu, [number, number]>([[oy.ada, adaYer], ...konuklar.map((k, i) => [k, [YER[konukAd[i]][0], YER[konukAd[i]][1]]] as [Oyuncu, [number, number]])]);
    const yon = (k: Oyuncu): 1 | -1 => ((evler.get(k)?.[0] ?? 50) < 50 ? -1 : 1);
    const topu = h('div.mc-disko-topu', {}, h('i.mc-dt-ip'), h('i.mc-dt-top'));
    const spotlar = h('div.mc-spotlar', {}, h('i'), h('i'), h('i'), h('i'));
    const isiltilar = h('div.mc-isiltilar', {}, ...Array.from({ length: 14 }, (_, i) => h('i', { style: `--i:${i};--x:${(i * 37) % 100};--y:${(i * 53) % 70}` })));
    sahne.on.prepend(spotlar, isiltilar, topu);
    await bekle(40);
    topu.classList.add('indi');
    await soyle(D.dans_giris);
    spotlar.classList.add('acik');
    isiltilar.classList.add('acik');
    sahne.los(true);
    ui.ipucu('Alkışla!');
    const a = new Alkis(kulak.ayar);
    const RENK = ['#ff7eb6', '#ffc72c', '#5dbe3f', '#3e9df2', '#9b5ce0', '#ff8a2b'];
    const AKOR = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]];
    const BAS = [48, 53, 55, 48];
    const HEDEF = 12;
    let n = 0;
    let dansTik: ((dt: number) => void) | null = null;
    const topla = (hedef: 'ada' | 'ev') => {
      konuklar.forEach((k) => {
        const [x, y] = evler.get(k)!;
        void k.git(hedef === 'ada' ? x + (adaYer[0] - x) * 0.35 : x, y, 420);
      });
    };
    await new Promise<void>((coz) => {
      const vur = () => {
        if (n >= HEDEF) return;
        n++;
        ui.ilerleme(n, HEDEF);
        // müzik: davul + bas + akor arpej
        const olcu = Math.floor((n - 1) / 2) % AKOR.length;
        davul(n % 2 === 1, 0.35);
        nota(BAS[olcu], 0.4, 0.14);
        AKOR[olcu].forEach((m, i) => setTimeout(() => nota(m + 12, 0.35, 0.08), i * 60));
        sahne.diskoRenk(RENK[n % RENK.length]);
        topu.classList.remove('parla');
        void topu.offsetWidth;
        topu.classList.add('parla');
        mino.tepki('dans', 0.8);
        if (n === HEDEF) {
          // final: herkes takla atar
          herkes.forEach((k, i) => setTimeout(() => void k.figur('takla', yon(k), 700), i * 70));
          setTimeout(coz, sure(1100));
          return;
        }
        if (n === 5) topla('ada');
        if (n === 9) topla('ev');
        if (n % 4 === 0) {
          // dalga: soldan sağa sırayla zıplarlar
          [...herkes]
            .sort((p, q) => (evler.get(p)![0] - evler.get(q)![0]))
            .forEach((k, i) => setTimeout(() => {
              k.poz('dans', 600);
              void k.figur('zipla', 1, 520);
            }, i * 110));
          return;
        }
        const figur = FIGURLER[(n - 1) % (FIGURLER.length - 1)];
        // aynı figür ama herkes birkaç kare arayla: robot gibi değil, bir grup gibi
        herkes.forEach((k, i) => setTimeout(() => {
          k.poz((['dans', 'alkis', 'dans2'] as const)[n % 3], 600);
          void k.figur(figur, yon(k), 640);
        }, (i * 37) % 110));
      };
      a.onAlkis = vur;
      dansTik = () => a.tik();
      tikler.add(dansTik);
      kulak.dinle((o) => a.kare(o));
      dokunma = { bas: vur, birak: () => undefined };
    });
    kulak.dinle(null);
    if (dansTik) tikler.delete(dansTik);
    dokunma = null;
    ui.ipucu(null);
    sahne.diskoRenk(null);
    konfeti(30, 30, 120);
    konfeti(70, 30, 120);
    efektCal('yasasin', 2200);
    spotlar.classList.remove('acik');
    isiltilar.classList.remove('acik');
    sahne.los(false);
    topu.classList.remove('indi');
    setTimeout(() => {
      spotlar.remove();
      isiltilar.remove();
      topu.remove();
    }, 1400);
  }
}

/** Sahneye dokunma (her adımın parmak karşılığı) — bölüm ekranı bağlar */
export let dokunma: { bas: () => void; birak: () => void } | null = null;
