/**
 * Dert sahnesi (ekip/senaryo/MINO-NE-GIYSIN.md §4): Mino elindeki aletle arkadaşının derdine çare arar.
 * Sonucu yalnız alet belirler (model.ts → SONUC): çözüm = çocuğun kısa bir el hareketi (sürükle, art arda dokun, daire
 * çiz, basılı tut, taşı) ve arkadaşın sevinci; komik başarısızlık = 2-3 sn'lik gag, ardından sahnenin köşesinde alet
 * sepeti açılır, başka alet denenir (odaya dönmek gerekmez).
 *
 * Bölge eşleme yok: aleti sahnenin dertli yerine (arkadaş, ağaç, tencere, çiçekler) bırakmak ya da oraya dokunmak yeter;
 * sonraki adımlar (basamak, kaşık, sulama) kendi küçük hedefleriyle. İpucu merdiveni geç ve dolaylı: arkadaş bakar,
 * Mino durumu yeniden anlatır, alet sallanır (ilk parlama 35 / 40 sn), parmak en son.
 *
 * Sahne arka planı kaynak çözünürlüğünün üstüne büyütülmez (DPR 3): ekran daha büyükse sahne kutusu ortada kalır, kalan
 * yer sahnenin kenar rengiyle dolar. Dikeyde sahne yatay kaydırılır (odak), yakınlaşma yok.
 */
import { h, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import G from '../../content/mino-giysin.json';
import { bekle, hopla, merkez, ms, oynat, salla, type Nokta } from './anim';
import { Arkadas } from './arkadas';
import { icinde, kutu, surukle } from './dokunma';
import { KostumluMino, MINO_ORAN, MINO_TABAN, parcaUcur } from './kostumlu-mino';
import { kaydet, kayit } from './kayit';
import { aletParcasi, aletRolu, cozumAletleri, digerCozum, ipucuSureleri, parcaAleti, sonuc, susVar, tekrarSayisi, yildizEkle, type Alet, type Dert, type ParcaId } from './model';
import { grup, oturum } from './oturum';
import { gorsel, onYukle, parcaKostum, parcaResmi } from './resimler';
import { SAHNELER, type SahneBaglam } from './sahneler';
import { Sepet, SEPET_BOY } from './sepet';
import { minoSoyle, ses } from './ses';

const M = G.mino;

/** Sahnede bırakma / dokunma hedefi */
export interface Hedef {
  el: HTMLElement;
  /** bırakılınca ya da dokununca */
  fn: (n: Nokta) => void;
  /** sürüklerken üstünde (basılı tutma, karıştırma) */
  ustunde?: (n: Nokta) => void;
  pay?: number;
}

export function dertEkrani(app: Uygulama, param: { dert: Dert }): Ekran {
  const d = param.dert;
  const g = grup();
  const IP = ipucuSureleri(g);
  const tanim = SAHNELER[d];
  const zamanlar: number[] = [];
  const sonra = (n: number, fn: () => void) => void zamanlar.push(window.setTimeout(fn, ms(n)));
  onYukle(tanim.arka.map(gorsel));

  // ------------------------------------------------------------ öğeler
  const el = h('div.mg-dert', { 'data-dert': d, 'data-adim': 'giris' });
  el.style.background = `linear-gradient(${tanim.dolgu[0]} 0 50%, ${tanim.dolgu[1]} 50% 100%)`;
  const sahne = h('div.mg-sahne', {}, ...tanim.arka.map((a, i) => h(`img.mg-katman.k${i}`, { src: gorsel(a), alt: '', draggable: 'false' })));
  const ucus = h('div.mg-ucus', { 'aria-hidden': 'true' });
  const parmak = h('div.mg-parmak', { 'aria-hidden': 'true', html: IKON.el });
  const mino = new KostumluMino(oturum.giyili);
  const minoKap = h('div.mg-mino-yer.sahnede', {}, mino.el);
  const arkadas = new Arkadas(d);
  const eldeHit = h('div.mg-elde', { 'aria-label': 'Mino\'nun elindeki alet', role: 'button' });
  const sepet = new Sepet('sahnede');
  const kapi = h('button.mg-cikis', { type: 'button', 'aria-label': 'Kapı' }, h('img', { src: gorsel('giysin/kapi-cerceve'), alt: '', draggable: 'false' }), h('img.mg-cikis-kanat', { src: gorsel('giysin/kapi-kanat'), alt: '', draggable: 'false' }));
  const yildizRozet = h('div.mg-yildiz-rozet', { 'aria-hidden': 'true', html: IKON.yildiz });
  const ust = h('div.mg-ust', {}, yuvarlakDugme(IKON.geri, 'Odaya dön', () => odayaDon(false), 'mg-geri'), sesDugmesi());
  el.append(sahne, sepet.el, kapi, eldeHit, yildizRozet, ust, ucus, parmak);

  // ------------------------------------------------------------ yerleşim
  let S = { x: 0, y: 0, w: 0, h: 0, dikey: false };
  let odak = tanim.odak;
  const W = () => el.clientWidth || innerWidth;
  const H = () => el.clientHeight || innerHeight;
  /** sahne kesri → sahne kutusunda px */
  const px = (fx: number, fy: number): Nokta => ({ x: fx * S.w, y: fy * S.h });
  const yerlesim = () => {
    const w = W();
    const hh = H();
    const [nw, nh] = tanim.dogal;
    const dikey = hh > w * 1.1;
    const kapla = Math.max(w / nw, hh / nh);
    // DPR 3'te kaynak boyunun üstüne çıkmaz; dikeyde sahne ekranın ~%56'sı (daha çoğu görünsün)
    const s = Math.min(kapla, 1 / 3, dikey ? (0.5 * hh) / nh : Infinity);
    const sw = nw * s;
    const sh = nh * s;
    // dikeyde açık hava sahneleri aşağıda (üstte gök rengi dolgu sahneyle birleşir), iç mekânlar ortada
    const y = dikey ? (tanim.dikeyAlta ? Math.max(56, hh - sh - Math.min(130, w * 0.32) * SEPET_BOY - 20) : Math.max(56, hh * 0.47 - sh / 2)) : hh - sh;
    S = { x: 0, y, w: sw, h: sh, dikey };
    sahneKaydir(false);
    sahne.style.width = `${sw}px`;
    sahne.style.height = `${sh}px`;
    sahne.style.top = `${y}px`;
    el.classList.toggle('dikey', dikey);
    // Mino ve arkadaş sahne kesirleriyle
    const mh = tanim.mino.h * sh;
    const mw = mh / MINO_ORAN;
    minoKap.style.cssText = `left:${tanim.mino.x * sw - mw / 2}px;top:${tanim.mino.taban * sh - mw * MINO_ORAN * MINO_TABAN}px;width:${mw}px`;
    const aw = Arkadas.en(d, mw, tanim.arkadas.olcek);
    const f = Arkadas.figur(d);
    arkadas.el.style.cssText = `left:${tanim.arkadas.x * sw - aw / 2}px;top:${tanim.arkadas.taban * sh - aw * f.taban}px;width:${aw}px;height:${aw}px`;
    bag.yerlesim(sw, sh, mw);
    // sepet: yatayda sağ alt, dikeyde alt ortada (sahnenin altındaki dolguda)
    const sepW = dikey ? Math.min(130, w * 0.32) : Math.min(124, hh * 0.27);
    const sepH = sepW * SEPET_BOY;
    sepet.el.style.cssText = dikey ? `left:${w / 2 - sepW / 2}px;top:${hh - sepH - 10}px;width:${sepW}px;height:${sepH}px` : `left:${w - sepW - 14}px;top:${hh - sepH - 6}px;width:${sepW}px;height:${sepH}px`;
    const kw = dikey ? 70 : 64;
    kapi.style.cssText = dikey ? `left:${14}px;top:${hh - kw * 2 - 14}px;width:${kw}px;height:${kw * 2}px` : `left:${w - kw - 14 - (el.classList.contains('sepet-acik') ? sepW + 12 : 0)}px;top:${hh - kw * 2 - 10}px;width:${kw}px;height:${kw * 2}px`;
    requestAnimationFrame(eldeYerlesim);
  };
  /** Dikeyde sahneyi odağa kaydırır (yatay öteleme; yakınlaşma yok) */
  const sahneKaydir = (yumusak: boolean) => {
    const w = W();
    const x = Math.min(0, Math.max(w - S.w, w / 2 - odak * S.w));
    S.x = x;
    if (yumusak && !TEST_MODU) {
      sahne.style.transition = 'left .7s cubic-bezier(.45,0,.2,1)';
      setTimeout(() => (sahne.style.transition = ''), 750);
    }
    sahne.style.left = `${x}px`;
  };
  const odakla = (fx: number) => {
    odak = fx;
    if (S.dikey) sahneKaydir(true);
  };
  /** Mino'nun elindeki aletin dokunma kutusu */
  // eldeki aletin dokunma kutusu Mino'yu izler (yürürken, tırmanırken de aletin üstünde)
  let eldeRaf = 0;
  const eldeIzle = () => {
    eldeRaf = requestAnimationFrame(eldeIzle);
    if (!el.classList.contains('suruklu')) eldeYerlesim();
  };
  eldeRaf = requestAnimationFrame(eldeIzle);
  const eldeYerlesim = () => {
    const id = oturum.giyili.alet;
    if (!id) {
      eldeHit.style.display = 'none';
      return;
    }
    const k = mino.yerKutusu(id, el);
    const w = Math.max(76, k.w + 24);
    const hh = Math.max(76, k.h + 24);
    eldeHit.style.cssText = `display:block;left:${k.x - w / 2}px;top:${k.y - hh / 2}px;width:${w}px;height:${hh}px`;
  };

  // ------------------------------------------------------------ hedefler, sürükle-bırak
  let hedefler: Hedef[] = [];
  const hedefBul = (n: Nokta) => hedefler.find((t) => icinde(n, kutu(t.el, el), t.pay ?? 14));
  const alet = (): Alet | null => parcaAleti(oturum.giyili.alet);
  surukle(eldeHit, {
    kap: el,
    katman: ucus,
    resim: () => {
      const id = oturum.giyili.alet;
      if (!id) return null;
      const k = mino.yerKutusu(id, el);
      return { src: parcaResmi(id), en: k.w * 1.15, boy: k.h * 1.15 };
    },
    basla: () => {
      el.classList.add('suruklu');
      mino.mino.kostumResmi('alet')?.style.setProperty('opacity', '0');
      mino.mino.tepki('uzat', 0.8);
    },
    tasi: (n) => hedefBul(n)?.ustunde?.(n),
    tik: () => {
      // eldeki alete dokunmak: Mino onu gösterir (sallar), kendi başına bir şey yapmaz
      void hopla(mino.ic, 0.4, 320);
      mino.mino.tepki('sun', 1.2);
    },
    birak: ({ n, hayalet }) => {
      el.classList.remove('suruklu');
      const t = hedefBul(n);
      const k = kutu(hayalet, el);
      hayalet.remove();
      mino.mino.kostumResmi('alet')?.style.removeProperty('opacity');
      if (t) t.fn(n);
      else if (oturum.giyili.alet) void parcaUcur(ucus, oturum.giyili.alet, n, mino.yerKutusu(oturum.giyili.alet, el), { w: k.w, h: k.h }, 0.87, 300);
    },
  });
  // dokunarak da (sürüklemeden): hedefin kendisine dokunmak aynı işi görür
  el.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('button, .mg-elde, .mg-sepet')) return;
    const r = el.getBoundingClientRect();
    const n = { x: e.clientX - r.left, y: e.clientY - r.top };
    hedefBul(n)?.fn(n);
  });

  // ------------------------------------------------------------ ipucu merdiveni
  let sonDokunus = performance.now();
  let ipucuAdim = 0;
  let ipucuHedef: () => HTMLElement | null = () => null;
  let ipucuSozu: () => void = () => void minoSoyle(M.dert[d][g]);
  const ipucu = window.setInterval(() => {
    if (TEST_MODU || el.dataset.adim === 'cozuldu' || el.dataset.adim === 'gag') return;
    const t = (performance.now() - sonDokunus) / 1000;
    const hd = ipucuHedef();
    if (!hd) return;
    if (ipucuAdim === 0 && t > IP[0]) {
      ipucuAdim = 1;
      // arkadaş bakar (göz kayması) / kendi sesiyle hatırlatır
      void arkadas.oynat('bak', 1400);
      bag.hatirlat();
    } else if (ipucuAdim === 1 && t > IP[1]) {
      ipucuAdim = 2;
      ipucuSozu();
    } else if (ipucuAdim === 2 && t > IP[2]) {
      ipucuAdim = 3;
      hd.classList.add('parla');
      void salla(hd);
      sonra(1600, () => hd.classList.remove('parla'));
    } else if (ipucuAdim === 3 && t > IP[3]) {
      ipucuAdim = 4;
      const k = kutu(hd, el);
      parmak.style.cssText = `left:${k.x + k.w / 2}px;top:${k.y + k.h / 2}px`;
      parmak.classList.remove('acik');
      void parmak.offsetWidth;
      parmak.classList.add('acik');
    } else if (ipucuAdim === 4 && t > IP[3] + 20) {
      ipucuAdim = 2;
      sonDokunus = performance.now() - IP[1] * 1000;
    }
  }, 500);
  el.addEventListener(
    'pointerdown',
    () => {
      sonDokunus = performance.now();
      ipucuAdim = 0;
      parmak.classList.remove('acik');
    },
    { capture: true },
  );

  // ------------------------------------------------------------ akış
  const adim = (a: string) => (el.dataset.adim = a);
  let bulunan: Alet[] = [];
  let calisiyor = false;
  let bitti = false;

  /** Sahne bağlamı: sahneler.ts her dert için bunu kullanır */
  const bag: SahneBaglam & { yerlesim: (sw: number, sh: number, mw: number) => void; hatirlat: () => void } = {
    d,
    g,
    el,
    sahne,
    ucus,
    mino,
    arkadas,
    px,
    odakla,
    hedefle: (hs) => {
      hedefler = hs;
    },
    ipucu: (fn) => {
      ipucuHedef = fn;
      ipucuAdim = 0;
      sonDokunus = performance.now();
    },
    elde: () => eldeHit,
    eldeKutusu: () => (oturum.giyili.alet ? mino.yerKutusu(oturum.giyili.alet, el) : null),
    sus: (a) => susVar(oturum.giyili, d, a),
    yerlesim: () => undefined,
    hatirlat: () => undefined,
    sonra,
  };
  const sahneKur = tanim.kur(bag);

  /** Aletle dene: çözümse el hareketini bekler, komikse gag ve sepet */
  const dene = async () => {
    const a = alet();
    if (!a || calisiyor || bitti) return;
    calisiyor = true;
    parmak.classList.remove('acik');
    const s = sonuc(d, a);
    if (s.tur === 'komik') {
      adim('gag');
      el.dataset.son = `komik:${a}`;
      hedefler = [];
      await sahneKur.komik(a);
      adim('denendi');
      oturum.olmadiSira++;
      await minoSoyle(M.olmadi[oturum.olmadiSira % M.olmadi.length]);
      sepetAc();
      calisiyor = false;
      // sepetteki çözüm aletlerinden biri ipucu olur
      const cz = cozumAletleri(d).filter((x) => x !== a);
      ipucuHedef = () => sepet.dugme[cz[0]];
      ipucuSozu = () => void minoSoyle(M.dert[d][g]);
      ipucuAdim = 0;
      sonDokunus = performance.now();
      return;
    }
    adim('cozum');
    el.dataset.son = `cozum:${a}`;
    const tamam = await sahneKur.cozum(a, tekrarSayisi(d, a, g));
    calisiyor = false;
    if (!tamam) return;
    await cozuldu(a);
  };

  const cozuldu = async (a: Alet) => {
    adim('cozuldu');
    hedefler = [];
    ses.cozum();
    const yeni = yildizEkle(kayit, d, a);
    kaydet();
    if (!bulunan.includes(a)) bulunan.push(a);
    el.dataset.bulunan = bulunan.join(',');
    // yıldız: ekranın üstünde parlayıp küçülür (dolabın kapağındaki yıldız odada dolu görünür)
    yildizRozet.classList.remove('acik');
    void yildizRozet.offsetWidth;
    yildizRozet.classList.add('acik');
    if (yeni) ses.yildiz();
    await bekle(1200);
    const diger = digerCozum(d, a);
    if (g === '56' && diger && !bulunan.includes(diger)) {
      // ikinci yol daveti (yalnız 5-6): arkadaş dertli hâline döner, sepet açılır; istemezse kapı
      mino.mino.ifade('goz-kirp', 900);
      await minoSoyle(M.baska_yol);
      adim('ikinci');
      sahneKur.sifirla();
      sepetAc();
      kapiAc();
      ipucuHedef = () => kapi;
      ipucuAdim = 0;
      sonDokunus = performance.now();
      bitti = false;
      sahneKur.basla();
      return;
    }
    await tesekkur();
  };

  const tesekkur = async () => {
    bitti = true;
    adim('tesekkur');
    hedefler = [];
    await sahneKur.tesekkur();
    mino.mino.tepki('evet');
    await minoSoyle(M.ne_demek);
    odayaDon(true);
  };

  const odayaDon = (cozuldu: boolean) => {
    if (el.dataset.adim === 'cikis') return;
    adim('cikis');
    if (cozuldu || bulunan.length) {
      if (!oturum.cozulen.includes(d)) oturum.cozulen.push(d);
      oturum.secili = null;
      app.git('oda', { gelen: d });
    } else app.git('oda', {});
  };

  // sahne içi sepet: başka alet seç; Mino eldekini sepete fırlatır, yenisini kapar
  const sepetAc = () => {
    if (el.classList.contains('sepet-acik')) return;
    el.classList.add('sepet-acik');
    yerlesim();
    void oynat(sepet.el, [{ transform: 'translateY(40px) scale(0.9, 1.1)', opacity: 0 }, { transform: 'translateY(-6px) scale(1.04, 0.96)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], 420);
    sepet.bosalt(alet());
  };
  const kapiAc = () => {
    el.classList.add('kapi-acik');
    yerlesim();
    void oynat(kapi, [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], 360);
  };
  kapi.addEventListener('click', () => void (bitti ? undefined : tesekkur()));
  let kuyruk: Promise<unknown> = Promise.resolve();
  /** Parçalar sıraya girer (dokunuş kilitlenmez); bir adım hata verirse sıra durmaz */
  const sirada = (fn: () => Promise<void>) => {
    kuyruk = kuyruk.then(fn).catch((e) => console.error('mino-giysin sıra', e));
  };
  for (const a of Object.keys(sepet.dugme) as Alet[]) {
    sepet.dugme[a].addEventListener('click', () => {
      if (alet() === a) {
        void hopla(sepet.resim[a], 0.5, 300);
        return;
      }
      const id = aletParcasi(a);
      const k = kutu(sepet.resim[a], el);
      sepet.resim[a].classList.add('elde');
      sirada(async () => {
        await mino.giy(id, { x: k.x + k.w / 2, y: k.y + k.h / 2 }, Math.max(k.w, k.h), el, ucus, (eski, cikis, boy) => {
          const ea = parcaAleti(eski);
          if (!ea) return;
          const sk = kutu(sepet.resim[ea], el);
          void parcaUcur(ucus, eski, cikis, { x: sk.x + sk.w / 2, y: sk.y + sk.h / 2 }, boy, Math.min(1, Math.max(sk.w, sk.h) / Math.max(boy.w, boy.h)), 560).then(() => sepet.bosalt(alet()));
        });
        oturum.giyili = { ...mino.giyili };
        sepet.bosalt(alet());
        eldeYerlesim();
        if (id === 'alet-bahce' && !oturum.suSakasi) oturum.suSakasi = true;
        if (el.dataset.adim !== 'ikinci') adim('denendi');
        ipucuHedef = () => eldeHit;
        sahneKur.basla();
      });
    });
  }

  const ro = new ResizeObserver(() => yerlesim());
  ro.observe(el);
  bag.yerlesim = sahneKur.yerlesim;
  bag.hatirlat = sahneKur.hatirlat;
  sahne.append(...sahneKur.arka, arkadas.el, minoKap, ...sahneKur.on);

  // ------------------------------------------------------------ açılış: Mino sahneye kayarak girer
  // sahne resimleri çözülmeden Mino girmesin (boş gökyüzünde Mino görünmesin); en çok 2,5 sn beklenir
  mino.ic.style.opacity = '0';
  const resimlerHazir = () =>
    Promise.race([Promise.all([...sahne.querySelectorAll('img')].map((i) => (i as HTMLImageElement).decode?.().catch(() => undefined))), bekle(2500)]);
  const acilis = async () => {
    yerlesim();
    sahneKur.sifirla();
    await resimlerHazir();
    yerlesim();
    mino.ic.style.opacity = '';
    const mk = kutu(mino.el, el);
    await oynat(mino.ic, [{ transform: `translateX(${-(mk.x + mk.w * 1.2)}px) translateY(0) scale(1,1)` }, { transform: `translateX(${-(mk.x + mk.w * 1.2) * 0.4}px) translateY(-14px) scale(0.96,1.04)`, offset: 0.55 }, { transform: 'translateX(0) translateY(0) scale(1.05,0.95)', offset: 0.85 }, { transform: 'none' }], 900);
    eldeYerlesim();
    bag.hatirlat();
    await bekle(300);
    void minoSoyle(M.dert[d][g]);
    mino.mino.tepki(g === '56' ? 'sasir' : 'kararsiz', 1.2);
    adim('hazir');
    sahneKur.basla();
  };
  sahneKur.onDene = () => void dene();
  requestAnimationFrame(() => void acilis());
  void aletRolu;
  void parcaKostum;
  void merkez;

  return {
    el,
    kapat: () => {
      ro.disconnect();
      clearInterval(ipucu);
      cancelAnimationFrame(eldeRaf);
      zamanlar.forEach(clearTimeout);
      mino.kapat();
      arkadas.kapat();
      sahneKur.kapat?.();
    },
  };
}

export type { ParcaId };
