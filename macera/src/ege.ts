/**
 * Bölüm 2: Şşş, Ege Uyuyor! (senaryo: ekip/senaryo/ege-uyuyor.md, Barış onaylı).
 * Anne çok yorgun, bebek Ege uyumuyor. Çocuk Ada, Can ve Mino'yla Ege'yi susturur, doyurur, güldürür, uyutur.
 * Her sahnede bir elle yapılan iş (sürükle, ara, sil, salla, basılı tut) ve bir ses işi var; her ses işinin
 * dokunma karşılığı da var. Mikrofon algılayıcıları kilitli ses sisteminden (ekip/SES-SISTEMI.md): eşik yok.
 *
 * Şimdilik sahne 1-4 (anne, çıngırak, mama, kuklalar); 5-9 sırada.
 */
import E from '../../content/macera-ege.json';
import { efekt, konus } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { Mino } from '../../src/mino/mino';
import { ritimAyniMi, ritimKalibi } from '../../ses-testi/src/analiz';
import { Alkis, Perde, sesVar, Ufleme } from '../../orman/src/gorev';
import { kulak } from '../../orman/src/kulak';
import type { BolumArayuz } from './dogumgunu';
import { Ege } from './ege-bebek';
import { esya } from './ege-cizim';
import * as S from './ege-ses';
import { Ipucu, parmak, Surukle, tasi, type Hedef } from './ege-surukle';
import { Oyuncu } from './oyuncu';
import { Sahne } from './sahne';
import './ege.css';

const M = E.mino;
const B = E.balon;
const I = E.ipucu;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
const kutu = (el: Element) => () => el.getBoundingClientRect();

export async function egeUyuyor(kok: HTMLElement, ui: BolumArayuz): Promise<void> {
  const yas = durum.i.yas ?? 4;
  /** 3-4 yaş: daha az tekrar, her ses geçer, 3. denemede kabul */
  const kucuk = yas <= 4;
  const sahne = new Sahne('parti-sahne/oda');
  sahne.el.classList.add('eg-sahne');
  // akşamüstü ışığı (perde kapanınca gece olur)
  sahne.el.insertBefore(h('div.eg-aksam'), sahne.dunya.nextSibling);
  kok.append(sahne.el);
  const koy = <T extends HTMLElement>(el: T, x: number, y: number, w: number, z: number, ad?: string) => {
    if (ad) el.dataset.ege = ad;
    return sahne.koy(el, { x, y, w, z });
  };

  // --------------------------------------------------------------- dekor ve oyuncular
  koy(esya('koltuk', 'parti/koltuk'), 22, 15, 42, 3);
  const besikArka = koy(esya('besik-arka'), 74, 13, 38, 2);
  const besikOn = koy(esya('besik-on'), 74, 13, 38, 6);
  const anneAyakta = koy(h('div.eg-anne', {}, esya('anne-ayakta')), 54, 12, 18, 5, 'anne-ayakta');
  const anne = koy(h('div.eg-anne.eg-anne-uyuyor.gizli', {}, esya('anne-uyuyor'), h('div.eg-balon')), 22, 21, 28, 4, 'anne');
  const anneBalon = anne.querySelector<HTMLElement>('.eg-balon')!;

  const ege = new Ege();
  koy(ege.el, 74, 18, 17, 5);

  const ada = new Oyuncu({ ad: 'ada', resim: 'parti/ada', boy: 20.65, oran: 345 / 622, golge: 24, pozlar: ['normal', 'saskin', 'dilek'] });
  const can = new Oyuncu({ ad: 'can', resim: 'parti/can', boy: 23.28, oran: 422 / 558, golge: 28.6, pozlar: ['normal', 'selam', 'saklaniyor'] });
  ada.koy(44, 6);
  ada.katman = 7;
  can.koy(108, 3);
  can.katman = 8;
  can.el.classList.add('gizli');
  sahne.dunya.append(ada.el, can.el);

  const mino = new Mino();
  const minoKutu = koy(h('div.mc-mino', {}, mino.el), 10, -4, 26, 10, 'mino');
  S.hazirla();

  // --------------------------------------------------------------- yardımcılar
  const soyle = async (t: string) => {
    if (ui.kapandiMi()) return;
    ui.yazi(t);
    await konus(t, { ton: 1.12 });
  };
  const anneSoyle = async (t: string) => {
    ui.yazi(t);
    await konus(t, { ton: 0.95 });
  };
  const konfeti = (x = 50, y = 40, adet = 70) => {
    const [px, py] = sahne.noktaEkran(x, y);
    konfetiPatlat(kok, px, py, adet);
  };
  const balon = async (el: HTMLElement, yazi: string, ms = 1300) => {
    el.textContent = yazi;
    el.classList.remove('acik');
    void el.offsetWidth;
    el.classList.add('acik');
    await bekle(ms);
    el.classList.remove('acik');
  };

  // rAF döngüsü (görev zamanlamaları)
  const tikler = new Set<(dt: number) => void>();
  let onceki = performance.now();
  let raf = requestAnimationFrame(function d(t) {
    const dt = Math.min(0.1, (t - onceki) / 1000);
    onceki = t;
    tikler.forEach((f) => f(dt));
    raf = requestAnimationFrame(d);
  });
  const acikSurukle = new Set<Surukle>();
  const acikIpucu = new Set<Ipucu>();
  const temizle = () => {
    cancelAnimationFrame(raf);
    kulak.dinle(null);
    mino.kapat();
    ege.kapat();
    acikSurukle.forEach((s) => s.kapat());
    acikIpucu.forEach((i) => i.kapat());
  };
  /** Sürükleme + ipucu birlikte (görev bitince ikisi de kapanır) */
  const surukle = (el: HTMLElement, hedefler: Hedef[], birak: (ad: string | null) => boolean | void, ipucuHedef?: () => DOMRect) => {
    const s = new Surukle(el, { hedefler, birak, iz: ipucuHedef ? { katman: sahne.on, kutu: ipucuHedef } : undefined });
    acikSurukle.add(s);
    return s;
  };
  const ipucu = (kaynak: () => DOMRect, hedef?: () => DOMRect, ms = 12000) => {
    const i = new Ipucu(() => parmak(sahne.on, kaynak, hedef), ms);
    acikIpucu.add(i);
    return i;
  };
  const bitir = (...x: (Surukle | Ipucu | null | undefined)[]) =>
    x.forEach((o) => {
      o?.kapat();
      if (o instanceof Surukle) acikSurukle.delete(o);
      else if (o) acikIpucu.delete(o);
    });

  // --------------------------------------------------------------- Ege'nin ağlaması (arka planda sürer)
  /** 0: ağlamıyor … 1: çok ağlıyor */
  let aglama = 0;
  /** dinlerken ağlama sesi çalmaz (kulak susmasın), yalnız gözyaşı ve balon */
  let aglamaSessiz = false;
  let aglamaZaman = 0.4;
  tikler.add((dt) => {
    if (aglama <= 0) return;
    aglamaZaman -= dt;
    if (aglamaZaman > 0) return;
    aglamaZaman = 2 + (1 - aglama) * 1.6;
    if (!aglamaSessiz) S.aglama(aglama);
    if (Math.random() < 0.5 + aglama * 0.3) void ege.balon(B.ege.ingaa, 900);
    ege.kipir(0.4 + aglama * 0.6);
  });
  const aglamayiKes = () => {
    aglama = 0;
    ege.ifade('bakiyor');
  };

  // --------------------------------------------------------------- her an dokunulabilir sahne
  let egeUyuyor = false;
  ege.el.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('.eg-suruklenir')) return;
    if (egeUyuyor) return void balon(minoBalon, B.ada.sss, 1000);
    if (aglama > 0) return ege.kipir(0.5);
    ege.ifade('kikir', 900);
    ege.ayakSalla();
    S.kikir(0.3);
  });
  anne.addEventListener('pointerdown', () => void balon(anneBalon, B.anne_uykuda, 1500));
  const minoBalon = h('div.eg-balon.eg-mino-balon');
  minoKutu.append(minoBalon);
  let minoSira = 0;
  minoKutu.addEventListener('pointerdown', () => mino.tepki((['gidik', 'mir', 'zipla'] as const)[minoSira++ % 3]));

  try {
    await sahne1();
    await sahne2();
    await sahne3();
    await sahne4();
    if (ui.kapandiMi()) return;
    // taslak sonu (sahne 5-9 sırada)
    await sahne.kamera(50, 80, 1, 900);
    ege.ifade('kahkaha', 1500);
    konfeti(60, 40, 90);
    efekt.dogru();
    await soyle(M.guldu);
  } finally {
    temizle();
  }

  // ================================================================= Sahne 1: Anne çok yorgun
  async function sahne1() {
    await sahne.kamera(66, 84, 1.5, 10);
    ege.ifade('agliyor');
    aglama = 1;
    anneAyakta.classList.add('salliyor');
    besikArka.classList.add('sallaniyor');
    besikOn.classList.add('sallaniyor');
    ege.el.classList.add('sallaniyor');
    await bekle(300);
    void sahne.kamera(50, 86, 1.22, 2200);
    minoKutu.classList.add('giris');
    await bekle(700);
    mino.tepki('zipla');
    await soyle(M.merhaba);
    await soyle(M.agliyor);
    // anne esner, kanepeye gider, anında uyuyakalır
    anneAyakta.classList.remove('salliyor');
    besikArka.classList.remove('sallaniyor');
    besikOn.classList.remove('sallaniyor');
    ege.el.classList.remove('sallaniyor');
    anneAyakta.classList.add('esniyor');
    await anneSoyle(E.anne.uzan);
    anneAyakta.classList.remove('esniyor');
    await tasi(anneAyakta, 24, 18, 1300);
    anneAyakta.classList.add('gizli');
    anne.classList.remove('gizli');
    void balon(anneBalon, B.ege.zzz, 1600);
    await bekle(500);
    // Mino ile Ada birbirine bakar
    mino.tepki('sasir');
    ada.poz('saskin', 1400);
    void ada.kipir();
    await bekle(900);

    // --- battaniye
    const battaniye = koy(h('div.eg-esya.eg-geliyor', {}, esya('battaniye-anne')), 56, 9, 18, 11, 'battaniye');
    await soyle(M.battaniye);
    ui.ipucu(I.battaniye);
    await new Promise<void>((coz) => {
      const ip = ipucu(kutu(battaniye), kutu(anne));
      const s = surukle(
        battaniye,
        [{ ad: 'anne', kutu: kutu(anne), pay: 0.12 }],
        (ad) => {
          if (ad !== 'anne') {
            ip.yanlis();
            return;
          }
          bitir(s, ip);
          battaniye.classList.add('ortuldu');
          void tasi(battaniye, 24, 18, 520, 27).then(coz);
          return true;
        },
        kutu(anne),
      );
    });
    ui.ipucu(null);
    efekt.dogru();
    anne.classList.add('gulumsuyor');
    sahne.parilti(24, 28, 16);
    ada.poz('dilek', 1600);
    void ada.zipla(14);
    await bekle(700);
    mino.tepki('evet');
    await soyle(M.plan);
  }

  // ================================================================= Sahne 2: Çıngırak nerede?
  async function sahne2() {
    // Can gelir
    can.el.classList.remove('gizli');
    void can.git(86, 3, 1100);
    void ada.git(36, 6, 700);
    await bekle(900);
    void can.balon('Merhaba!', 900);
    can.poz('selam', 900);
    void ada.balon(B.ada.cingirak, 1800);
    await bekle(1200);
    ege.ifade('agliyor');
    aglama = 0.9;

    // --- sepette arama: oyuncakları çıkar, çıngırak en altta
    const sepetArka = koy(esya('sepet-arka'), 52, 1, 30, 8);
    const cing = koy(h('div.eg-esya', {}, esya('cingirak')), 52, 5, 6, 9, 'cingirak');
    const oyuncaklar: [string, HTMLElement][] = [
      ['kup', koy(h('div.eg-esya', {}, esya('kup')), 44, 7, 10, 10, 'kup')],
      ['kitap', koy(h('div.eg-esya', {}, esya('kitap')), 60, 6, 11, 10, 'kitap')],
      ['top', koy(h('div.eg-esya', {}, esya('top', 'canlan/top')), 52, 9, 11, 10, 'top')],
      ['ordek', koy(h('div.eg-esya', {}, esya('ordek', 'hayvanlar/ordek')), 47, 12, 10, 11, 'ordek')],
    ];
    const sepetOn = koy(esya('sepet-on'), 52, 1, 30, 12);
    const KENAR: [number, number][] = [[30, 0], [72, 0], [24, 4], [80, 3]];
    await soyle(M.cingirak_ara);
    ui.ipucu(I.sepet);
    let kalan = oyuncaklar.length;
    await new Promise<void>((coz) => {
      const ip = ipucu(() => oyuncaklar.find(([, el]) => !el.dataset.cikti)?.[1].getBoundingClientRect() ?? cing.getBoundingClientRect());
      oyuncaklar.forEach(([ad, el], i) => {
        const s = surukle(el, [], () => {
          // dokunmak da sürüklemek de oyuncağı sepetten çıkarır
          if (el.dataset.cikti) return true;
          el.dataset.cikti = '1';
          bitir(s);
          ip.ilerle();
          if (ad === 'ordek') {
            S.vik();
            void balon(ege.el.querySelector('.eg-balon')!, B.vik, 700);
            ege.ifade('saskin', 700);
          } else efekt.secim();
          const [x, y] = KENAR[i];
          el.style.zIndex = '9';
          void tasi(el, x, y, 520);
          if (--kalan === 0) {
            bitir(ip);
            coz();
          }
          return true;
        });
      });
    });
    // çıngırak görünür, parlar; dokununca Can'ın eline uçar
    cing.style.zIndex = '13';
    await tasi(cing, 52, 12, 450);
    cing.classList.add('parliyor');
    sahne.parilti(52, 16, 10);
    ui.ipucu(I.cingirak_bul);
    await new Promise<void>((coz) => {
      const ip = ipucu(kutu(cing), undefined, 5000);
      const s = surukle(cing, [], () => {
        bitir(s, ip);
        coz();
        return true;
      });
    });
    cing.classList.remove('parliyor');
    efekt.dogru();
    sepetOn.classList.add('gidiyor');
    sepetArka.classList.add('gidiyor');
    await tasi(cing, 80, 15, 600, 6);
    can.poz('selam', 800);
    ui.ipucu(null);

    // --- çıngırağı salla: tık / alkış (dokunmak da olur)
    await sahne.kamera(72, 86, 1.45, 900);
    const eski = kulak.ayar.duyarlilik;
    kulak.ayar.duyarlilik = eski + 6; // dil şaklatması alkıştan kısıktır (Doğum Günü pasta kesmedeki gibi)
    const salla = (uzun = false) => {
      S.cingirak(uzun);
      cing.classList.remove('salla');
      void cing.offsetWidth;
      cing.classList.add('salla');
    };
    if (kucuk) {
      await soyle(M.cingirak);
      ui.ipucu(I.tik);
      const HEDEF = 3;
      let n = 0;
      await dinleTik(() => {
        salla();
        n++;
        ui.ilerleme(n, HEDEF);
        aglama = Math.max(0, 0.9 - n * 0.32);
        ege.ifade(n >= HEDEF ? 'bakiyor' : n === HEDEF - 1 ? 'buzuk' : 'agliyor');
        return n >= HEDEF;
      });
    } else {
      // 5-6 yaş: Ege'nin ritmini (tık-tık … tık) dinle, aynısını yap
      const HEDEF_RITIM = [0, 0.32, 1.02];
      aglama = 0.5;
      await soyle(M.ritim);
      let deneme = 0;
      for (;;) {
        aglamaSessiz = true;
        ege.ifade('bakiyor');
        aglama = 0;
        for (const t of HEDEF_RITIM) {
          setTimeout(() => salla(t > 0.9), sure(t * 1000));
        }
        await bekle(1600);
        ui.ipucu(I.ritim);
        const seri = await dinleSeri();
        deneme++;
        sahne.el.dataset.ritim = ritimKalibi(seri).join(',') || String(seri.length);
        if (ui.kapandiMi()) break;
        if (ritimAyniMi(HEDEF_RITIM, seri) || deneme >= 3) break;
        void ege.balon(B.ege.ba, 1100);
        can.poz('selam', 700);
        await bekle(900);
      }
      aglamaSessiz = false;
    }
    kulak.ayar.duyarlilik = eski;
    ui.ipucu(null);
    ui.ilerleme(1, 1);
    aglamayiKes();
    ege.ifade('kikir', 1400);
    ege.ayakSalla();
    S.kikir(0.5);
    sahne.parilti(72, 30, 14);
    await soyle(M.sustu);
    await sahne.kamera(50, 86, 1.22, 800);
    // çıngırak Can'da kalır; sepetteki oyuncaklar kenarda
    cing.classList.add('gizli');
  }

  /** Tık dinle: her tık (mikrofonda dil şaklatma/alkış ya da çıngırağa dokunma) için fn; fn true dönerse biter */
  function dinleTik(fn: () => boolean): Promise<void> {
    return new Promise<void>((coz) => {
      const a = new Alkis(kulak.ayar);
      const cing = sahne.dunya.querySelector<HTMLElement>('[data-ege="cingirak"]')!;
      const ip = ipucu(kutu(cing));
      const tik = () => a.tik();
      const vur = () => {
        ip.ilerle();
        if (fn()) {
          tikler.delete(tik);
          kulak.dinle(null);
          cing.removeEventListener('pointerdown', dokun);
          bitir(ip);
          coz();
        }
      };
      const dokun = (e: Event) => {
        e.stopPropagation();
        a.dokun();
      };
      a.onAlkis = vur;
      tikler.add(tik);
      kulak.dinle((o) => a.kare(o));
      cing.addEventListener('pointerdown', dokun);
    });
  }

  /** Bir tık serisi dinle (1.4 sn susunca biter); dokunmalar da seri sayılır */
  function dinleSeri(): Promise<number[]> {
    return new Promise<number[]>((coz) => {
      const a = new Alkis(kulak.ayar);
      const cing = sahne.dunya.querySelector<HTMLElement>('[data-ege="cingirak"]')!;
      const ip = ipucu(kutu(cing));
      const tik = () => a.tik();
      const dokun = (e: Event) => {
        e.stopPropagation();
        a.dokun();
      };
      a.onAlkis = () => {
        ip.ilerle();
        S.cingirak();
        cing.classList.remove('salla');
        void cing.offsetWidth;
        cing.classList.add('salla');
      };
      a.onSeri = (zamanlar) => {
        tikler.delete(tik);
        kulak.dinle(null);
        cing.removeEventListener('pointerdown', dokun);
        bitir(ip);
        coz(zamanlar);
      };
      tikler.add(tik);
      kulak.dinle((o) => a.kare(o));
      cing.addEventListener('pointerdown', dokun);
    });
  }

  // ================================================================= Sahne 3: Ege acıkmış
  async function sahne3() {
    // sessizlikte karın gurultusu, herkes güler
    await bekle(500);
    S.gurul();
    ege.el.classList.add('gurul');
    ege.ifade('saskin', 1200);
    await bekle(1100);
    ege.el.classList.remove('gurul');
    void ada.balon(B.hihi, 900);
    void can.balon(B.hihi, 900);
    void ada.kipir();
    void can.kipir();
    mino.tepki('sasir');
    await soyle(M.guruldu);

    // Ege mama sandalyesine, Ada mama kasesini getirir
    besikOn.style.zIndex = '3';
    const sandalye = koy(esya('mama-sandalye'), 52, 3, 28, 4);
    sandalye.classList.add('eg-geliyor');
    await tasi(ege.el, 52, 19, 700, 17);
    ege.el.style.zIndex = '5';
    void ada.git(76, 5, 700);
    void can.git(92, 3, 700);
    await bekle(700);
    const kase = koy(h('div.eg-esya.eg-kase', {}, esya('kase'), h('div.eg-buhar', {}, h('i'), h('i'), h('i'))), 68, 17, 13, 9, 'kase');
    kase.classList.add('eg-geliyor');
    await sahne.kamera(56, 88, 1.4, 900);

    // --- önlük
    const onluk = koy(h('div.eg-esya', {}, esya('onluk')), 32, 22, 12, 11, 'onluk');
    onluk.classList.add('eg-geliyor');
    await soyle(M.onluk);
    ui.ipucu(I.onluk);
    await new Promise<void>((coz) => {
      const govde = () => ege.el.getBoundingClientRect();
      const ip = ipucu(kutu(onluk), govde);
      const s = surukle(
        onluk,
        [{ ad: 'ege', kutu: govde, pay: 0.05 }],
        (ad) => {
          if (ad !== 'ege') return void ip.yanlis();
          bitir(s, ip);
          onluk.remove();
          ege.onluk = true;
          coz();
          return true;
        },
        govde,
      );
    });
    efekt.secim();
    ege.ifade('kikir', 800);

    // --- kaşık kaşık: daldır → üfle → ver
    const KASIK = kucuk ? 3 : 4;
    const kasik = koy(h('div.eg-esya.eg-kasik', {}, esya('kasik'), h('div.eg-buhar.eg-kasik-buhar', {}, h('i'), h('i'), h('i'))), 64, 8, 12, 12, 'kasik');
    const agiz = () => ege.agizKutusu();
    for (let n = 0; n < KASIK && !ui.kapandiMi(); n++) {
      ui.ilerleme(n, KASIK);
      await kasikTur(n === 0);
      ege.lekeEkle();
      if (n === 0 || Math.random() < 0.6) ege.lekeEkle();
    }
    ui.ilerleme(KASIK, KASIK);
    ui.ipucu(null);
    kasik.classList.add('gizli');
    kase.classList.add('gidiyor');

    // --- peçeteyle sil
    ege.ifade('kikir');
    await soyle(M.sil);
    const pecete = koy(h('div.eg-esya', {}, esya('pecete')), 32, 20, 11, 13, 'pecete');
    pecete.classList.add('eg-geliyor');
    ui.ipucu(I.sil);
    await new Promise<void>((coz) => {
      const yuz = () => ege.yuzKutusu();
      const ip = ipucu(kutu(pecete), yuz);
      let son = { x: 0, y: 0 };
      const s = new Surukle(pecete, {
        hedefler: [],
        birak: () => void 0,
        kaydir: (x, y) => {
          const yol = Math.hypot(x - son.x, y - son.y);
          son = { x, y };
          const r = pecete.getBoundingClientRect();
          if (ege.sil(r.left + r.width / 2, r.top + r.height / 2, r.width * 0.55, Math.min(0.25, yol / 90))) {
            ip.ilerle();
            if (Math.random() < 0.15) S.fis();
          }
          if (!ege.lekeler().length) {
            bitir(s, ip);
            coz();
          }
        },
      });
      acikSurukle.add(s);
    });
    s3temiz(pecete);
    await bekle(500);

    async function kasikTur(ilk: boolean) {
      kasik.classList.remove('dolu', 'sicak');
      kasik.style.setProperty('--buhar', '0');
      // 1) kaseye daldır
      await soyle(M.kasik);
      ui.ipucu(I.daldir);
      await new Promise<void>((coz) => {
        const ip = ipucu(kutu(kasik), kutu(kase));
        const s = surukle(
          kasik,
          [{ ad: 'kase', kutu: kutu(kase), pay: 0.2 }],
          (ad) => {
            if (ad !== 'kase') return void ip.yanlis();
            bitir(s, ip);
            S.klink();
            void tasi(kasik, 64, 8, 380).then(coz);
            return true;
          },
          kutu(kase),
        );
      });
      kasik.classList.add('dolu', 'sicak');
      let buhar = 1;
      kasik.style.setProperty('--buhar', '1');
      // 2) üfle (5-6 yaş: yavaş; sert üflerse mama Mino'nun burnuna uçar) — aynı anda sürüklenebilir (sıcakken verirse Ege surat asar)
      if (ilk || !kucuk) await soyle(kucuk || !ilk ? M.ufle : M.yavas);
      ui.ipucu(I.ufle);
      // üfleme algılaması kilitli ses sisteminden (katı mod); kolaylık yalnız buharın sönme hızında
      const u = new Ufleme(kulak.ayar, 0.5);
      let sertSure = 0;
      let firladi = false;
      await new Promise<void>((coz) => {
        const ip = ipucu(kutu(kasik));
        let bitti = false;
        const son = () => {
          bitti = true;
          tikler.delete(tik);
          kulak.dinle(null);
          bitir(s, ip);
          coz();
        };
        const tik = (dt: number) => {
          if (ui.kapandiMi()) return son();
          u.tik(dt);
          if (u.aktif) {
            buhar = Math.max(0, buhar - dt * (0.5 + u.guc * 0.6));
            kasik.style.setProperty('--buhar', buhar.toFixed(2));
            kasik.classList.add('ufleniyor');
            if (!kucuk && u.guc > 0.85) sertSure += dt;
            else sertSure = Math.max(0, sertSure - dt);
          } else kasik.classList.remove('ufleniyor');
          if (!kucuk && sertSure > 0.25) {
            firladi = true;
            return son();
          }
          if (buhar <= 0) {
            kasik.classList.remove('sicak', 'ufleniyor');
            S.fis();
            son();
          }
        };
        tikler.add(tik);
        kulak.dinle((o) => u.kare(o));
        // dokunma karşılığı: kaşığa basılı tutmak üflemek sayılır; kaşık sürüklenirse üfleme biter.
        // Sıcakken ağza götürülürse Ege surat asar, Mino uyarır, kaşık geri döner.
        let tutus = { x: 0, y: 0 };
        const s = new Surukle(kasik, {
          hedefler: [{ ad: 'agiz', kutu: agiz, pay: 0.35 }],
          tut: () => {
            tutus = { x: -1, y: -1 };
            u.bas();
          },
          kaydir: (x, y) => {
            if (tutus.x < 0) tutus = { x, y };
            else if (Math.hypot(x - tutus.x, y - tutus.y) > 30) u.birak();
          },
          birak: (ad) => {
            u.birak();
            if (ad === 'agiz' && !bitti) void sicakVerdi();
          },
        });
        acikSurukle.add(s);
      });
      u.birak();
      kasik.classList.remove('ufleniyor');
      if (firladi) {
        await mamaFirladi();
        return kasikTur(false);
      }
      // 3) Ege'ye ver
      await soyle(M.ver);
      ui.ipucu(I.ver);
      await new Promise<void>((coz) => {
        const ip = ipucu(kutu(kasik), agiz);
        const s = surukle(
          kasik,
          [{ ad: 'agiz', kutu: agiz, pay: 0.35 }],
          (ad) => {
            if (ad !== 'agiz') return void ip.yanlis();
            bitir(s, ip);
            coz();
            return true;
          },
          agiz,
        );
      });
      ege.ifade('am');
      S.am();
      void ege.balon(B.ege.am, 700);
      kasik.classList.remove('dolu');
      await bekle(350);
      ege.ifade('kikir', 700);
      ege.ayakSalla();
      efekt.dogru();
      await tasi(kasik, 64, 8, 420);
      ege.ifade('bakiyor');
    }

    async function mamaFirladi() {
      S.pit();
      kasik.classList.remove('dolu', 'sicak');
      const mama = h('i.eg-ucan-mama');
      const r = kasik.getBoundingClientRect();
      const m = mino.el.getBoundingClientRect();
      const k = sahne.on.getBoundingClientRect();
      const x1 = r.right - r.width * 0.15 - k.left;
      const y1 = r.top + r.height * 0.3 - k.top;
      const x2 = m.left + m.width * 0.5 - k.left;
      const y2 = m.top + m.height * 0.47 - k.top;
      sahne.on.append(mama);
      await mama
        .animate(
          [
            { transform: `translate(${x1}px, ${y1}px) scale(0.6)` },
            { transform: `translate(${(x1 + x2) / 2}px, ${Math.min(y1, y2) - 90}px) scale(1)`, offset: 0.5 },
            { transform: `translate(${x2}px, ${y2}px) scale(1.2)` },
          ],
          { duration: sure(520), easing: 'ease-in-out', fill: 'forwards' },
        )
        .finished.catch(() => undefined);
      mama.classList.add('yapisti');
      mino.tepki('sasir');
      ada.poz('saskin', 900);
      void ada.balon(B.hihi, 900);
      void can.balon(B.hihi, 900);
      S.kikir(0.4);
      await bekle(900);
      mino.tepki('hapsu');
      mama.remove();
      await soyle(M.yavas);
    }

    /** Üflenmeden (sıcak) ağza götürüldü: Ege dudak büzüp başını çevirir, Mino uyarır */
    async function sicakVerdi() {
      ege.ifade('buzuk', 1600);
      ege.bak(-1);
      void ege.balon(B.ege.hih, 900);
      setTimeout(() => ege.bak(0), sure(1000));
      await soyle(M.sicak);
    }

    function s3temiz(pecete: HTMLElement) {
      pecete.remove();
      efekt.dogru();
      ege.el.classList.add('parlak');
      sahne.parilti(52, 36, 14);
      ege.ifade('kikir', 1200);
      ege.onluk = false;
      setTimeout(() => ege.el.classList.remove('parlak'), 1400);
      ui.ipucu(null);
    }
  }

  // ================================================================= Sahne 4: Kuklalar
  async function sahne4() {
    ege.ifade('buzuk');
    await sahne.kamera(50, 86, 1.22, 800);
    await soyle(M.surat);
    // Ada kutuyu açar: "Kuklalar!"
    void ada.git(30, 6, 700);
    void can.git(84, 4, 700);
    const kutuArka = koy(esya('kutu-arka'), 58, 0, 22, 8);
    const ayi = koy(h('div.eg-esya.eg-kukla.eg-kukla-ayi', {}, esya('kukla-ayi', 'hayvanlar/ayi'), h('div.eg-balon')), 54, 7, 13, 9, 'kukla-ayi');
    const civciv = koy(h('div.eg-esya.eg-kukla.eg-kukla-civciv', {}, esya('kukla-civciv', 'hayvanlar/civciv'), h('div.eg-balon')), 64, 8, 8, 9, 'kukla-civciv');
    const kutuOn = koy(esya('kutu-on'), 58, 0, 22, 10);
    const kapak = koy(esya('kutu-kapak'), 58, 8, 22, 11);
    void ada.balon(B.ada.kukla, 1400);
    await bekle(300);
    kapak.classList.add('acildi');
    efekt.secim();
    await bekle(500);
    await soyle(M.kukla);
    ui.ipucu(I.kukla);
    // ayı Ada'ya (kocaman), civciv Can'a (minicik)
    const AYI_YER: [number, number, number] = [38, 12, 15];
    const CIVCIV_YER: [number, number, number] = [76, 15, 8];
    let takili = 0;
    await new Promise<void>((coz) => {
      const ip = ipucu(
        () => (!ayi.dataset.takili ? ayi : civciv).getBoundingClientRect(),
        () => (!ayi.dataset.takili ? ada.el : can.el).getBoundingClientRect(),
      );
      const tak = (el: HTMLElement, kim: Oyuncu, [x, y, w]: [number, number, number], s: Surukle) => {
        bitir(s);
        el.dataset.takili = '1';
        el.style.zIndex = '9';
        void tasi(el, x, y, 500, w);
        void kim.zipla(10);
        efekt.secim();
        ip.ilerle();
        if (++takili === 2) {
          bitir(ip);
          coz();
        }
      };
      const sa: Surukle = surukle(ayi, [{ ad: 'ada', kutu: kutu(ada.el), pay: 0.1 }, { ad: 'can', kutu: kutu(can.el), pay: 0.1 }], (ad) => {
        // hangisine bırakılırsa bırakılsın ayı Ada'ya gider (kocaman ayı Ada'nın), yanlış yerde iz
        if (!ad) return void ip.yanlis();
        tak(ayi, ada, AYI_YER, sa);
        return true;
      }, kutu(ada.el));
      const sc: Surukle = surukle(civciv, [{ ad: 'ada', kutu: kutu(ada.el), pay: 0.1 }, { ad: 'can', kutu: kutu(can.el), pay: 0.1 }], (ad) => {
        if (!ad) return void ip.yanlis();
        tak(civciv, can, CIVCIV_YER, sc);
        return true;
      }, kutu(can.el));
    });
    ui.ipucu(null);
    kutuOn.classList.add('gidiyor');
    kutuArka.classList.add('gidiyor');
    kapak.classList.add('gidiyor');
    await sahne.kamera(54, 88, 1.3, 700);

    // --- kukla konuşturma
    const mik = kulak.acik && !TEST_MODU;
    let referans: number | null = null;
    let gulme = 0;
    /** kukla konuşur; Ege ona bakar ve güler (her konuşmada gülmesi büyür) */
    const konustur = async (hangi: 'civciv' | 'ayi', inceFark = 3) => {
      const el = hangi === 'civciv' ? civciv : ayi;
      const b = el.querySelector<HTMLElement>('.eg-balon')!;
      el.classList.remove('konusuyor');
      void el.offsetWidth;
      el.classList.add('konusuyor');
      if (hangi === 'civciv') {
        S.cikcik();
        void balon(b, B.cik, 900);
      } else {
        S.ayiSesi();
        void balon(b, B.ayi, 900);
      }
      ege.bak(hangi === 'civciv' ? 1 : -1);
      gulme++;
      if (hangi === 'ayi') {
        ege.ifade('saskin');
        void ege.balon(B.ege.ooo, 800);
        await bekle(750);
      }
      const buyuk = gulme >= 4 || (hangi === 'civciv' && inceFark > 7);
      ege.ifade(buyuk ? 'kahkaha' : 'kikir', 1300);
      ege.ayakSalla();
      S.kikir(buyuk ? 1 : 0.5);
      void ege.balon(B.ege.hihi, 800);
      await bekle(1100);
      ege.bak(0);
    };
    const omuzSilk = async () => {
      for (const el of [ayi, civciv]) {
        el.classList.remove('omuz');
        void el.offsetWidth;
        el.classList.add('omuz');
      }
      void balon(civciv.querySelector<HTMLElement>('.eg-balon')!, B.kukla_hi, 900);
      void balon(ayi.querySelector<HTMLElement>('.eg-balon')!, B.kukla_hi, 900);
      ege.ifade('bakiyor');
      await bekle(900);
    };

    // referans: önce normal sesle "aaa" (mikrofon yoksa atlanır; kuklaya dokunmak da atlar)
    if (mik) {
      await soyle(M.referans);
      ui.ipucu(I.aaa);
      referans = await new Promise<number | null>((coz) => {
        const perdeler: number[] = [];
        let bitti = false;
        const son = (r: number | null) => {
          if (bitti) return;
          bitti = true;
          kulak.dinle(null);
          ayi.removeEventListener('pointerdown', atla);
          civciv.removeEventListener('pointerdown', atla);
          coz(r);
        };
        const atla = () => son(null);
        kulak.dinle((o) => {
          if (o.perde !== null && sesVar(o, kulak.ayar, 10)) perdeler.push(o.perde);
          if (perdeler.length >= 30) {
            const s = [...perdeler].sort((a, b) => a - b);
            son(s[Math.floor(s.length / 2)]);
          }
        });
        ayi.addEventListener('pointerdown', atla);
        civciv.addEventListener('pointerdown', atla);
        setTimeout(() => son(null), 12000);
      });
      if (referans) efekt.secim();
    }

    /**
     * Bir kuklanın konuşmasını bekle: mikrofonda ince (+) ya da kalın (−) ses, ya da kuklaya dokunma.
     * istenen null: hangisi olursa. Dönüş: konuşan kukla.
     */
    const bekleKukla = (istenen: 'civciv' | 'ayi' | null) =>
      new Promise<{ kim: 'civciv' | 'ayi'; fark: number }>((coz) => {
        const p = new Perde(kulak.ayar, referans ?? 280);
        let inceSure = 0;
        let kalinSure = 0;
        let ortaSure = 0;
        let deneme = 0;
        let bitti = false;
        let enInce = 0;
        const hedefEl = istenen === 'ayi' ? ayi : civciv;
        const ip = ipucu(kutu(istenen ? hedefEl : civciv));
        const son = (kim: 'civciv' | 'ayi', fark: number) => {
          if (bitti) return;
          bitti = true;
          kulak.dinle(null);
          ayi.removeEventListener('pointerdown', dAyi);
          civciv.removeEventListener('pointerdown', dCiv);
          bitir(ip);
          coz({ kim, fark });
        };
        const dAyi = (e: Event) => {
          e.stopPropagation();
          son('ayi', -4);
        };
        const dCiv = (e: Event) => {
          e.stopPropagation();
          son('civciv', 4);
        };
        ayi.addEventListener('pointerdown', dAyi);
        civciv.addEventListener('pointerdown', dCiv);
        kulak.dinle((o) => {
          p.kare(o);
          const k = kulak.ayar.kare;
          const sinif = p.sinif;
          if (sinif === 'ince') {
            inceSure += k;
            enInce = Math.max(enInce, p.fark ?? 0);
          } else inceSure = Math.max(0, inceSure - k);
          if (sinif === 'kalin') kalinSure += k;
          else kalinSure = Math.max(0, kalinSure - k);
          if (sinif === 'orta') ortaSure += k;
          else if (!p.sesli) ortaSure = 0;
          if (inceSure > 0.25 && istenen !== 'ayi') return son('civciv', enInce);
          if (kalinSure > 0.25 && istenen !== 'civciv') return son('ayi', p.fark ?? -4);
          if (ortaSure > 0.6) {
            ortaSure = 0;
            deneme++;
            ip.yanlis();
            void omuzSilk();
            // 3-4 yaş: 3. denemede kabul
            if (kucuk && deneme >= 3 && istenen) son(istenen, istenen === 'civciv' ? 4 : -4);
          }
        });
      });

    // civciv (ince), sonra ayı (kalın)
    for (const [istenen, cumle, ip] of [['civciv', M.civciv, I.ince], ['ayi', M.ayi, I.kalin]] as const) {
      if (ui.kapandiMi()) return;
      await soyle(cumle);
      ui.ipucu(ip);
      const r = await bekleKukla(istenen);
      await konustur(r.kim, r.fark);
    }
    // serbest: hangisi konuşsun? 3-4 kez; Ege konuşana bakar, gülmesi büyür
    await soyle(M.sec);
    ui.ipucu(I.serbest);
    const SERBEST = kucuk ? 3 : 4;
    for (let i = 0; i < SERBEST && !ui.kapandiMi(); i++) {
      ui.ilerleme(i, SERBEST);
      const r = await bekleKukla(null);
      await konustur(r.kim, r.fark);
    }
    ui.ilerleme(SERBEST, SERBEST);
    ui.ipucu(null);
    ege.ifade('kahkaha', 1800);
    ege.kalpler(6);
    S.kikir(1);
    ada.poz('dilek', 1400);
    void ada.zipla(16);
    void can.zipla(16);
    konfeti(52, 40, 60);
    await bekle(600);
    ege.ifade('kikir');
  }
}
