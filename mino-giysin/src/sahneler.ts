/**
 * Dört dert sahnesi (ekip/senaryo/MINO-NE-GIYSIN.md §4): yerleşim (sahne kesirleri), dertli hâl, 2 çözüm, 2 komik
 * başarısızlık, teşekkür. Arka planlar ve eşyalar var olan setlerden; yeni çizim yok. Hareket: poz/ifade değişimi,
 * öteleme, ezilme-esneme; döndürme yok, hiçbir resim kaynak boyunun üstünde çizilmez (eşya boyları kesirle sınırlı).
 *
 * Konumlar sahne kutusunun kesirleri: x yatay merkez, taban ayak / dip çizgisi, h yükseklik (sahnenin boyuna oranla).
 */
import { Karakter } from '../../src/karakter/karakter';
import { h, TEST_MODU } from '../../src/ui/dom';
import G from '../../content/mino-giysin.json';
import { bekle, dikil, hopla, kavis, ms, oynat, salla, type Nokta } from './anim';
import { Arkadas } from './arkadas';
import type { Hedef } from './dert';
import { kutu } from './dokunma';
import type { KostumluMino } from './kostumlu-mino';
import { karistirmaTamam, GUM_DOGRU, GUM_SECENEK, type Alet, type Dert, type YasGrubu } from './model';
import { oturum } from './oturum';
import { gorsel, parcaKostum, parcaResmi } from './resimler';
import { kinoSoyle, minoSoyle, ses } from './ses';

const M = G.mino;

export interface SahneBaglam {
  d: Dert;
  g: YasGrubu;
  el: HTMLElement;
  sahne: HTMLElement;
  ucus: HTMLElement;
  mino: KostumluMino;
  arkadas: Arkadas;
  px: (fx: number, fy: number) => Nokta;
  odakla: (fx: number) => void;
  hedefle: (h: Hedef[]) => void;
  ipucu: (fn: () => HTMLElement | null) => void;
  elde: () => HTMLElement;
  eldeKutusu: () => { x: number; y: number; w: number; h: number } | null;
  sus: (a: Alet) => boolean;
  /** kostüm etkisi 'ek' mi (yanlış / karışık kostüm + doğru alet): çözüm sürerken komik ek an (§4a) */
  ek: (a: Alet) => boolean;
  /** ek an oynadı (test ve kayıt için: el.dataset.ek) */
  ekOldu: (ad: string) => void;
  sonra: (n: number, fn: () => void) => void;
}

export interface SahneKurulum {
  arka: HTMLElement[];
  on: HTMLElement[];
  yerlesim: (sw: number, sh: number, mw: number) => void;
  hatirlat: () => void;
  sifirla: () => void;
  basla: () => void;
  komik: (a: Alet) => Promise<void>;
  cozum: (a: Alet, kez: number) => Promise<boolean>;
  tesekkur: () => Promise<void>;
  onDene: () => void;
  kapat?: () => void;
}

export interface SahneTanim {
  arka: string[];
  dogal: [number, number];
  dolgu: [string, string];
  /** dikeyde sahne ekranın altına yakın (gökyüzü dolgusu üstte doğal durur) */
  dikeyAlta?: boolean;
  /** dikeyde sahnenin üstündeki boşluğa (aynalanıp) konan çizim; yoksa sahnenin en uzak katmanı (arka[0]) */
  dikeyUst?: string;
  /** dikeyde duvara perdeli pencere (iç mekân, boş duvar) */
  dikeyPencere?: boolean;
  /** dikeyde sahne kaynak boyunda en büyük ve üstten başlar (üstü dolu iç mekân: mutfak) */
  dikeyDolu?: boolean;
  odak: number;
  mino: { x: number; taban: number; h: number };
  arkadas: { x: number; taban: number; olcek: number };
  kur: (b: SahneBaglam) => SahneKurulum;
}

// ---------------------------------------------------------------- ortak yardımcılar

/** Sahne kesriyle yerleşen öğe (yerlesim'de px'e çevrilir) */
class Yerler {
  private l: { el: HTMLElement; x: number; taban: number; h: number; oran: number }[] = [];
  ekle(el: HTMLElement, x: number, taban: number, hh: number, oran: number) {
    this.l.push({ el, x, taban, h: hh, oran });
    return el;
  }
  uygula(sw: number, sh: number) {
    for (const y of this.l) {
      const hp = y.h * sh;
      const wp = hp * y.oran;
      y.el.style.left = `${y.x * sw - wp / 2}px`;
      y.el.style.top = `${y.taban * sh - hp}px`;
      y.el.style.width = `${wp}px`;
      y.el.style.height = `${hp}px`;
    }
  }
}
const resim = (src: string, sinif: string) => h(`img.${sinif}`, { src, alt: '', draggable: 'false' });
const bolge = (sinif: string) => h(`div.mg-bolge.${sinif}`, { 'aria-hidden': 'true' });

/** Kabın koordinatında öğenin merkezi */
const ortasi = (e: Element, kap: HTMLElement): Nokta => {
  const k = kutu(e, kap);
  return { x: k.x + k.w / 2, y: k.y + k.h / 2 };
};

/** Kalp halkası ("güm"), su damlası, buhar, pof: kod efektleri (yalnız transform / opacity) */
export function efekt(kap: HTMLElement, sinif: string, n: Nokta, sure: number, stil = ''): HTMLElement {
  const e = h(`i.mg-efekt.${sinif}`, { style: `left:${n.x}px;top:${n.y}px;${stil}` });
  kap.append(e);
  window.setTimeout(() => e.remove(), ms(sure));
  return e;
}

/** Tam başarı konfetisi (kod efekti): küçük renkli yuvarlak ve şeritler yay çizip düşer; döndürme yok */
export function konfeti(kap: HTMLElement, n: Nokta, yaricap: number, adet = 26) {
  const RENK = ['#ffd23f', '#ff6b8b', '#5ec8f2', '#7ed957', '#ff9f43', '#b98cf5'];
  for (let i = 0; i < adet; i++) {
    const e = h(`i.mg-konfeti${i % 3 === 0 ? '.serit' : ''}`, { style: `left:${n.x}px;top:${n.y}px;background:${RENK[i % RENK.length]}` });
    kap.append(e);
    const aci = -Math.PI * (0.1 + (0.8 * i) / (adet - 1)) + (Math.random() - 0.5) * 0.3;
    const r = yaricap * (0.7 + Math.random() * 0.6);
    const x = Math.cos(aci) * r;
    const y = Math.sin(aci) * r;
    void oynat(
      e,
      [
        { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px)) scale(1)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${(x * 1.2).toFixed(1)}px), calc(-50% + ${(y + r * 0.9).toFixed(1)}px)) scale(0.9, 1.1)`, opacity: 0 },
      ],
      1300 + Math.random() * 400,
      { easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' },
    ).then(() => e.remove());
  }
}

/** Öğenin şimdiki translate'i (animasyon dahil) */
function suankiKayma(e: HTMLElement): [number, number] {
  const t = getComputedStyle(e).translate;
  if (!t || t === 'none') return [0, 0];
  const [x, y = '0'] = t.split(' ');
  return [parseFloat(x) || 0, parseFloat(y) || 0];
}
/** Öğeyi şimdiki yerinden (dx, dy) kadar kaydırır (translate; kalıcı); ara noktayla yay çizebilir (tepe < 0 yukarı) */
function kaydir(e: HTMLElement, dx: number, dy: number, sure: number, tepe = 0, easing?: string): Promise<void> {
  const [x0, y0] = suankiKayma(e);
  const kare: Keyframe[] = [{ translate: `${x0}px ${y0}px` }];
  if (tepe) kare.push({ translate: `${x0 + dx / 2}px ${y0 + dy / 2 + tepe}px`, offset: 0.5 });
  kare.push({ translate: `${x0 + dx}px ${y0 + dy}px` });
  return oynat(e, kare, sure, { fill: 'forwards', ...(easing ? { easing } : {}) });
}

/**
 * Şapka Mino'nun başından çıkıp uçuş katmanında ayrı bir resim olur (tutacak kavis() ile taşınır, içindeki resim ayrıca
 * ezilip esneyebilir). Şapka yoksa null. geri() şapkayı başına uçurup yeniden giydirir.
 */
function sapkaAyir(b: SahneBaglam): { tut: HTMLElement; resim: HTMLElement; k: { x: number; y: number; w: number; h: number }; geri: (n: Nokta) => Promise<void> } | null {
  const id = oturum.giyili.bas;
  if (!id) return null;
  const k = b.mino.yerKutusu(id, b.el);
  b.mino.cikar('bas');
  const resim = h('img.mg-sapka-resim', { src: parcaResmi(id), alt: '', draggable: 'false' });
  const tut = h('div.mg-sapka-tut', { style: `width:${k.w}px;height:${k.h}px;transform:translate(${k.x}px, ${k.y}px) translate(-50%, -50%)` }, resim);
  b.ucus.append(tut);
  return {
    tut,
    resim,
    k,
    geri: async (n: Nokta) => {
      const hedef = b.mino.yerKutusu(id, b.el);
      await kavis(tut, n, { x: hedef.x, y: hedef.y }, 460, { tepe: -50 });
      tut.remove();
      b.mino.giydir({ ...b.mino.giyili, bas: id });
      ses.hop();
    },
  };
}

/** Mino'nun burnu (yüzün ortası), kabın koordinatında: çizimin burun noktası */
const burun = (b: SahneBaglam): Nokta => b.mino.nokta(1024, 900, b.el);

/** Mino'nun başının tepesi (şapka yeri; şapka olmasa da) */
const basUstu = (b: SahneBaglam): { x: number; y: number; w: number; h: number } => b.mino.yerKutusu('bas-itfaiye', b.el);
function damlalar(kap: HTMLElement, a: Nokta, b: Nokta, adet = 6) {
  for (let i = 0; i < adet; i++) {
    const dm = h('i.mg-damla', {});
    kap.append(dm);
    const dx = (Math.random() - 0.5) * 30;
    window.setTimeout(() => void kavis(dm, a, { x: b.x + dx, y: b.y + (Math.random() - 0.5) * 16 }, 420, { tepe: -40 - Math.random() * 30, s1: 0.7 }).then(() => dm.remove()), ms(i * 70));
  }
}
const kalpSvg = () => h('i.mg-kalp-ikon', { html: '<svg viewBox="0 0 48 48"><path d="M24 41C10 31 4 24 4 16a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 8-6 15-20 25z" fill="#ff6b8b" stroke="#5a3617" stroke-width="3" stroke-linejoin="round"/></svg>' });

/** Sayma: hazır kayıtlar "Bir!", "İki!", "Üç!" */
const say = (i: number) => void minoSoyle(G.hazir.say[Math.min(i, 2)]);

/**
 * Sıradaki küçük hedefe n kez dokun / bırak: her seferinde her(i) çalışır (sırayla, beklenir). Hedefler dizi ise i.
 * hedefe sırayla. Çözülünce biter.
 */
function sirayla(b: SahneBaglam, hedefler: HTMLElement[], n: number, her: (i: number, e: HTMLElement) => Promise<void>, pay = 18): Promise<void> {
  return new Promise((coz) => {
    let i = 0;
    let mesgul = false;
    const kur = () => {
      const e = hedefler[Math.min(i, hedefler.length - 1)];
      e.classList.add('hedef');
      b.ipucu(() => e);
      b.hedefle([
        {
          el: e,
          pay,
          fn: () => {
            if (mesgul) return;
            mesgul = true;
            e.classList.remove('hedef');
            void her(i, e).then(() => {
              mesgul = false;
              i++;
              if (i >= n) {
                b.hedefle([]);
                coz();
              } else kur();
            });
          },
        },
      ]);
    };
    kur();
  });
}

/** Mino sahnede bir yere kayar (sekerek; yalnız öteleme), dönüşte yerine */
async function minoGit(b: SahneBaglam, dx: number, dy = 0, sure = 520) {
  const ic = b.mino.ic;
  const simdi = new DOMMatrixReadOnly(getComputedStyle(ic).transform === 'none' ? undefined : getComputedStyle(ic).transform);
  const x0 = simdi.m41;
  const y0 = simdi.m42;
  await oynat(
    ic,
    [
      { transform: `translate(${x0}px, ${y0}px) scale(1,1)` },
      { transform: `translate(${x0 + (dx - x0) * 0.5}px, ${y0 + (dy - y0) * 0.5 - 16}px) scale(0.96,1.05)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(1.04,0.96)`, offset: 0.85 },
      { transform: `translate(${dx}px, ${dy}px) scale(1,1)` },
    ],
    sure,
    { fill: 'forwards' },
  );
}
const minoYerine = (b: SahneBaglam, sure = 480) => minoGit(b, 0, 0, sure);


/** Eldeki aletin ekrandaki merkezi (kabın koordinatında) */
const eldeNokta = (b: SahneBaglam): Nokta => {
  const k = b.eldeKutusu();
  return k ? { x: k.x, y: k.y } : ortasi(b.mino.el, b.el);
};

/** Tam takım süsü: çözümün rolünün şapkasında küçük efekt (kask şeridi parlar "vuu vuu", aşçı şapkası kabarır …) */
async function susYap(b: SahneBaglam, a: Alet) {
  if (!b.sus(a)) return;
  const sapka = b.mino.mino.kostumResmi('bas');
  if (!sapka) return;
  b.el.dataset.sus = a;
  const k = b.mino.yerKutusu(oturum.giyili.bas!, b.el);
  if (a === 'merdiven') {
    efekt(b.ucus, 'mg-siren', { x: k.x, y: k.y - k.h * 0.2 }, 1400);
    for (let i = 0; i < 2; i++) window.setTimeout(() => ses.dikil(i * 3), ms(i * 380));
  } else if (a === 'kasik') {
    void oynat(sapka, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.1, 1.14)', offset: 0.4 }, { transform: 'scale(0.97, 0.95)', offset: 0.7 }, { transform: 'scale(1,1)' }], 600);
    ses.pof();
  } else if (a === 'stetoskop') {
    efekt(b.ucus, 'mg-parilti', { x: k.x, y: k.y - k.h * 0.1 }, 900);
    ses.parilti();
  } else if (a === 'sulama') {
    // hasır şapkanın çiçeği "pıt" diye açar (ayrı katman)
    const c = b.mino.yerKutusu('bas-bahce-cicek', b.el);
    const cicek = h('img.mg-sus-cicek', { src: parcaKostum('bas-bahce-cicek').src, alt: '', style: `left:${c.x - c.w / 2}px;top:${c.y - c.h / 2}px;width:${c.w}px;height:${c.h}px` });
    b.ucus.append(cicek);
    ses.pit(3);
    await oynat(cicek, [{ transform: 'scale(0.4)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)', opacity: 1 }], 380);
    window.setTimeout(() => cicek.remove(), ms(1400));
  }
}

/** Basılı tutma: öğenin üstünde (parmakla ya da sürüklenen aletle) sure kadar kalınca tamam */
function tutHedefi(e: HTMLElement, sure: number, damla: () => void): { hedef: Omit<Hedef, 'el'>; bekle: Promise<void>; iptal: () => void } {
  let birikim = 0;
  let son = 0;
  let bitti = false;
  let coz: () => void = () => undefined;
  const p = new Promise<void>((r) => (coz = r));
  const ilerle = () => {
    const t = performance.now();
    if (son && t - son < 200) birikim += t - son;
    son = t;
    if (Math.random() < 0.25) damla();
    e.style.setProperty('--dolu', String(Math.min(1, birikim / sure)));
    if (!bitti && birikim >= ms(sure)) {
      bitti = true;
      coz();
    }
  };
  // parmakla basılı tutma
  let zaman = 0;
  const bas = () => {
    clearInterval(zaman);
    son = performance.now();
    zaman = window.setInterval(ilerle, 60);
  };
  const birak = () => clearInterval(zaman);
  e.addEventListener('pointerdown', bas);
  e.addEventListener('pointerup', birak);
  e.addEventListener('pointerleave', birak);
  return {
    // dokunuş da sayılır: iki dokunuş bir tutuş eder (küçükler basılı tutmayı bilmeyebilir)
    hedef: {
      ustunde: ilerle,
      fn: () => {
        birikim += ms(sure) / 2 + 1;
        damla();
        son = 0;
        ilerle();
      },
      pay: 10,
    },
    bekle: p,
    iptal: () => {
      clearInterval(zaman);
      e.removeEventListener('pointerdown', bas);
      e.removeEventListener('pointerup', birak);
      e.removeEventListener('pointerleave', birak);
    },
  };
}

/** Merdiven sahnede: dayanır ve alttan yukarı açılan kırpmayla "uzar" (resim büyütülmez), her basamakta "tık" */
async function merdivenUzat(m: HTMLElement) {
  m.classList.add('acik');
  m.style.clipPath = 'inset(100% 0 0 0)';
  for (let i = 1; i <= 7; i++) {
    m.style.clipPath = `inset(${(100 - (i * 100) / 7).toFixed(1)}% 0 0 0)`;
    ses.tik(i % 4);
    await bekle(90);
  }
  m.style.clipPath = 'inset(0 0 0 0)';
}

// ================================================================ D1 · Pamuk ağaçta kaldı (park)

const pamukSahnesi: SahneTanim = {
  arka: ['film/park/arka-uzak', 'film/park/arka-orta', 'film/park/arka-on'],
  dogal: [4096, 2286],
  dolgu: ['#4faff0', '#9ac93e'],
  dikeyAlta: true,
  odak: 0.31,
  mino: { x: 0.44, taban: 0.94, h: 0.4 },
  arkadas: { x: 0.2, taban: 0.45, olcek: 0.62 },
  kur: (b) => {
    const Y = new Yerler();
    const LADDER_ORAN = parcaKostum('alet-itfaiye').kutu[2] / parcaKostum('alet-itfaiye').kutu[3];
    const agac = Y.ekle(bolge('mg-agac'), 0.18, 0.88, 0.84, 0.36);
    const merdiven = Y.ekle(h('div.mg-merdiven', {}, resim(parcaResmi('alet-itfaiye'), 'mg-merdiven-resim')), 0.25, 0.89, 0.34, LADDER_ORAN);
    const basamaklar = [0.84, 0.74, 0.64].map((y) => Y.ekle(h('div.mg-basamak', { 'aria-hidden': 'true' }), 0.25, y, 0.1, 1.6));
    const kap = Y.ekle(resim(gorsel('pati/esya-mama-kabi-dolu'), 'mg-mama-kabi'), 0.3, 0.9, 0.08, 401 / 269);
    const kus = new Karakter('kus', h('div'));
    const kusKap = Y.ekle(h('div.mg-kus', {}, kus.el), 0.105, 0.6, 0.13, 1);
    const a = b.arkadas;
    let yukarida = false;
    let kusCikti = false;
    const hazirla = () => a.poz('bekle', 'uzgun');
    kusKap.addEventListener('click', () => {
      // gizli sürpriz 4: ağaçkakan "tak tak" ritmi
      if (!kusCikti) return;
      b.el.dataset.surpriz = 'agackakan';
      [0, 140, 280, 560, 700].forEach((t) => ses.tak(t / 1000));
      void hopla(kusKap, 0.5, 300);
    });
    const kur: SahneKurulum = {
      arka: [agac, merdiven, kap, ...basamaklar],
      on: [kusKap],
      yerlesim: (sw, sh) => Y.uygula(sw, sh),
      hatirlat: () => {
        ses.miyav();
        void a.titre(500);
      },
      sifirla: () => {
        merdiven.classList.remove('acik');
        kap.classList.remove('acik');
        a.el.getAnimations().forEach((x) => x.cancel());
        a.ic.getAnimations().forEach((x) => x.cancel());
        a.el.style.translate = '';
        yukarida = false;
        b.mino.ic.getAnimations().forEach((x) => x.cancel());
        hazirla();
      },
      basla: () => {
        b.odakla(0.31);
        b.hedefle([
          { el: agac, fn: () => kur.onDene() },
          { el: a.el, fn: () => kur.onDene() },
        ]);
        b.ipucu(() => b.elde());
      },
      komik: async (al) => {
        if (al === 'sulama') {
          // su yukarı sıçrar, Pamuk ıslanır ve bir dal daha yukarı tırmanır; sonra eve doğru burnunu kaldırıp koklar
          void b.mino.mino.tepki('sun', 1);
          ses.su();
          damlalar(b.ucus, eldeNokta(b), ortasi(a.el, b.el), 8);
          await bekle(450);
          a.poz('islak', 'uzgun');
          await a.titre(600);
          const sh = b.px(0, 0.1).y;
          a.el.style.translate = `0 -${sh}px`;
          yukarida = true;
          await oynat(a.el, [{ translate: '0 0' }, { translate: `0 -${sh * 0.6}px`, offset: 0.4 }, { translate: `0 -${sh}px` }], 600);
          await minoSoyle(M.yorum.koklar);
          a.poz('kokla', null);
          void a.oynat('kokla', 1600);
          await bekle(1500);
          a.poz('bekle', 'uzgun');
        } else {
          // stetoskopla ağacı dinler: "tak tak tak", kovuktan ağaçkakan çıkar, Pamuk korkup dala sarılır
          const dx = b.px(0.29 - 0.44, 0).x;
          await minoGit(b, dx);
          b.mino.mino.bak(-1);
          for (let i = 0; i < 3; i++) {
            ses.tak();
            await bekle(260);
          }
          kusCikti = true;
          kusKap.classList.add('acik');
          void oynat(kusKap, [{ transform: 'translateX(40%) scale(0.6)', opacity: 0 }, { transform: 'translateX(-10%) scale(1.06,0.95)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], 380);
          kus.ifade('saskin', 1200);
          void b.mino.mino.ifade('saskin', 1200);
          b.mino.mino.tepki('sasir');
          a.poz('korku', 'utanmis');
          void a.titre(900);
          await bekle(700);
          b.mino.mino.bak(0);
          await minoSoyle(M.yorum.saglikli);
          await minoYerine(b);
          a.poz('bekle', 'uzgun');
        }
        if (yukarida) a.el.style.translate = `0 -${b.px(0, 0.1).y}px`;
      },
      cozum: async (al, kez) => {
        if (al === 'merdiven') {
          // merdiven ağaca dayanır ve uzar
          const ek = eldeNokta(b);
          void parcaUcur2(b, 'alet-itfaiye', ek, ortasi(merdiven, b.el));
          b.mino.mino.kostumResmi('alet')?.style.setProperty('opacity', '0');
          await bekle(320);
          await merdivenUzat(merdiven);
          void susYap(b, al);
          const dx = b.px(0.27 - 0.44, 0).x;
          await minoGit(b, dx, 0);
          const tirman = async (i: number) => {
            const dy = -b.px(0, 0.1 * (i + 1)).y;
            ses.tik(i);
            await minoGit(b, dx, dy, 380);
          };
          if (kez > 1) {
            // 5-6: üç basamağa sırayla; Mino sayar
            await sirayla(b, basamaklar, 3, async (i) => {
              say(i);
              await tirman(i);
            });
          } else for (let i = 0; i < 3; i++) await tirman(i);
          if (b.ek(al)) {
            // kostüm itfaiyeci değil (§4a): şapka dala takılır, Pamuk şapkanın içine atlar, şapkayla yere süzülür;
            // şapka yoksa Pamuk Mino'nun kafasına atlar
            await pamukSapkaya(b, dx);
            merdiven.classList.remove('acik');
            b.mino.mino.kostumResmi('alet')?.style.removeProperty('opacity');
            a.poz('yala', 'mutlu');
            await minoYerine(b);
            return true;
          }
          // Pamuk Mino'nun kollarına atlar, ikisi aşağı iner
          a.poz('atla', 'mutlu');
          const mk = ortasi(b.mino.el, b.el);
          const ak = ortasi(a.el, b.el);
          void oynat(a.el, [{ translate: a.el.style.translate || '0 0' }, { translate: `${(mk.x - ak.x) * 0.8}px ${mk.y - ak.y - 30}px` }], 520, { fill: 'forwards' });
          ses.miyav();
          await bekle(560);
          await minoGit(b, dx, 0, 700);
          void oynat(a.el, [{ translate: `${(mk.x - ak.x) * 0.8}px ${mk.y - ak.y - 30}px` }, { translate: `${(mk.x - ak.x) * 0.55}px ${b.px(0, 0.94 - 0.45).y}px` }], 700, { fill: 'forwards' });
          await bekle(700);
          merdiven.classList.remove('acik');
          b.mino.mino.kostumResmi('alet')?.style.removeProperty('opacity');
          a.poz('yala', 'mutlu');
          await minoYerine(b);
          return true;
        }
        // kaşık: Mino mama kabını ağacın dibine koyar, kaşıkla kaba vurur "tın tın tın"; Pamuk koklar, kayarak iner
        kap.classList.add('acik');
        void oynat(kap, [{ transform: 'translateY(-40px) scale(0.8)', opacity: 0 }, { transform: 'translateY(4px) scale(1.08,0.92)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], 420);
        ses.hop();
        await minoGit(b, b.px(0.36 - 0.44, 0).x);
        void susYap(b, al);
        await sirayla(b, [kap], 3, async (i) => {
          ses.tin(i);
          b.mino.mino.tepki('duzelt', 0.6);
          efekt(b.ucus, 'mg-tin', ortasi(kap, b.el), 600);
          void hopla(kap, 0.4, 260);
          await bekle(260);
        });
        a.poz('kokla', null);
        void a.oynat('kokla', 1600);
        await bekle(900);
        a.poz('kay', 'mutlu');
        const yuk = yukarida ? b.px(0, 0.1).y : 0;
        const son = `${b.px(0.05, 0).x}px ${b.px(0, 0.88 - 0.45).y}px`;
        if (b.ek(al)) {
          // kostüm aşçı değil (§4a): Pamuk kayıp mamaya değil Mino'nun kafasına iner (şapka varsa yassılır), sonra mamaya
          b.ekOldu('pamuk:kasik');
          const bu = basUstu(b);
          const f = Arkadas.figur('pamuk');
          const ak = kutu(a.el, b.el);
          const sapka = b.mino.mino.kostumResmi('bas');
          await kaydir(a.el, bu.x - (ak.x + ak.w / 2), bu.y + bu.h * 0.15 - (ak.y + ak.h * f.taban), 900, 0, 'cubic-bezier(.5,0,.8,.6)');
          a.poz('bekle', 'mutlu');
          ses.miyav();
          b.mino.el.style.transformOrigin = '50% 100%';
          void oynat(b.mino.el, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.1,0.88)', offset: 0.35 }, { transform: 'scale(0.97,1.03)', offset: 0.7 }, { transform: 'scale(1,1)' }], 520);
          if (sapka) void oynat(sapka, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.25,0.55)', offset: 0.3 }, { transform: 'scale(1.2,0.6)', offset: 0.8 }, { transform: 'scale(1,1)' }], 1500);
          void b.mino.mino.ifade('sersem', 1400);
          await minoSoyle(M.kostum_ek.mama_asagida);
          a.poz('atla', 'mutlu');
          const [x0, y0] = suankiKayma(a.el);
          const [x1, y1] = son.split(' ').map((v) => parseFloat(v));
          await kaydir(a.el, x1 - x0, y1 - y0, 560, -50);
        } else await oynat(a.el, [{ translate: `0 -${yuk}px` }, { translate: son }], 900, { fill: 'forwards', easing: 'cubic-bezier(.5,0,.8,.6)' });
        void a.hopla(0.8);
        a.poz('yala', 'mutlu');
        a.ifade('mutlu', 1600);
        await minoYerine(b);
        return true;
      },
      tesekkur: async () => {
        ses.miyav();
        a.balon(kalpSvg(), 1600);
        await a.sevin();
      },
      onDene: () => undefined,
      kapat: () => kus.kapat(),
    };
    return kur;
  },
};

/**
 * D1 merdiven, kostüm itfaiyeci değil (§4a): Mino merdivenin tepesinde. Şapka dala takılır, Pamuk şapkanın içine atlar
 * ve şapkayla birlikte yere süzülür ("Şapkam sepet oldu!"); Mino iner, Pamuk şapkadan zıplar, şapka sahibine döner.
 * Şapka yoksa Pamuk Mino'nun kafasına atlar ("Kafam minder oldu!"), sonra yere. Poz değişimi + öteleme + ezilme.
 */
async function pamukSapkaya(b: SahneBaglam, dxMino: number) {
  const a = b.arkadas;
  const f = Arkadas.figur('pamuk');
  const ak = kutu(a.el, b.el);
  const taban = (): Nokta => {
    const k = kutu(a.el, b.el);
    return { x: k.x + k.w / 2, y: k.y + k.h * f.taban };
  };
  const yerY = kutu(b.sahne, b.el).y + b.px(0, 0.92).y;
  const s = sapkaAyir(b);
  b.ekOldu(s ? 'pamuk:merdiven:sapka' : 'pamuk:merdiven:kafa');
  b.mino.el.style.transformOrigin = '50% 100%';
  if (s) {
    // şapka dala takılır: Pamuk'un solunda (Mino'dan uzakta), dalın hizasında sallanır
    const p0 = taban();
    const dal = { x: p0.x - ak.w * 0.2, y: p0.y - s.k.h * 0.1 };
    b.mino.mino.tepki('sasir', 0.8);
    ses.firlat();
    await kavis(s.tut, { x: s.k.x, y: s.k.y }, dal, 440, { tepe: -40 });
    ses.hop();
    await salla(s.resim, 520);
    // Pamuk şapkanın içine atlar (şapka önde: yalnız başı ve kulakları görünür)
    a.poz('atla', 'mutlu');
    ses.miyav();
    const p1 = taban();
    await kaydir(a.el, dal.x - p1.x, dal.y + s.k.h * 0.46 - p1.y, 440, -46);
    a.poz('bekle', 'mutlu');
    await oynat(s.resim, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.12,0.86)', offset: 0.4 }, { transform: 'scale(1,1)' }], 300);
    // şapka sepet olur: ikisi birlikte yere süzülür (hafif sallanarak)
    const hedef = { x: dal.x, y: yerY - s.k.h * 0.42 };
    void kaydir(a.el, 0, hedef.y - dal.y, 760, 0, 'cubic-bezier(.4,0,.6,1)');
    await kavis(s.tut, dal, hedef, 760, { tepe: 0 });
    ses.hop();
    b.mino.pof(b.ucus, { x: hedef.x, y: yerY }, s.k.w * 0.8);
    void oynat(s.resim, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.16,0.82)', offset: 0.35 }, { transform: 'scale(0.97,1.03)', offset: 0.7 }, { transform: 'scale(1,1)' }], 420);
    void b.mino.mino.ifade('saskin', 1200);
    await minoSoyle(M.kostum_ek.sepet_sapka);
    await minoGit(b, dxMino, 0, 700);
    // Pamuk şapkadan zıplayıp çıkar; şapka sahibine döner
    a.poz('atla', 'mutlu');
    const p2 = taban();
    await kaydir(a.el, ak.w * 0.28, yerY - p2.y, 460, -60);
    a.poz('yala', 'mutlu');
    await s.geri(hedef);
    return;
  }
  // şapka yok: Pamuk Mino'nun kafasına atlar
  const bu = basUstu(b);
  a.poz('atla', 'mutlu');
  ses.miyav();
  const p1 = taban();
  await kaydir(a.el, bu.x - p1.x, bu.y + bu.h * 0.15 - p1.y, 480, -50);
  a.poz('bekle', 'mutlu');
  void oynat(b.mino.el, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.1,0.88)', offset: 0.35 }, { transform: 'scale(0.97,1.03)', offset: 0.7 }, { transform: 'scale(1,1)' }], 520);
  void b.mino.mino.ifade('sersem', 1400);
  await minoSoyle(M.kostum_ek.kafam_minder);
  // Pamuk kafadan yere atlar, Mino iner
  a.poz('atla', 'mutlu');
  const p2 = taban();
  await kaydir(a.el, -ak.w * 0.3, yerY - p2.y, 560, -60);
  a.poz('yala', 'mutlu');
  await minoGit(b, dxMino, 0, 700);
}

/** Aleti elden bir noktaya uçurur (merdiveni ağaca, kabı yere …) */
async function parcaUcur2(b: SahneBaglam, id: 'alet-itfaiye' | 'alet-asci' | 'alet-bahce' | 'alet-doktor', a: Nokta, son: Nokta) {
  const k = b.eldeKutusu();
  if (!k) return;
  const e = h('img.mg-ucan', { src: parcaResmi(id), alt: '', style: `width:${k.w}px;height:${k.h}px;transform:translate(${a.x}px, ${a.y}px) translate(-50%, -50%)` });
  b.ucus.append(e);
  await kavis(e, a, son, 320, { tepe: -40 });
  e.remove();
}

// ================================================================ D2 · Kino hapşırıyor (Kino'nun odası)

const kinoSahnesi: SahneTanim = {
  arka: ['giysin/oda-yatay'],
  dogal: [2752, 1537],
  dolgu: ['#fedec2', '#f2bc78'],
  dikeyPencere: true,
  odak: 0.47,
  mino: { x: 0.33, taban: 0.94, h: 0.5 },
  arkadas: { x: 0.6, taban: 0.92, olcek: 1 },
  kur: (b) => {
    const Y = new Yerler();
    const a = b.arkadas;
    const kase = Y.ekle(h('div.mg-kase', {}, resim(gorsel('kino-otobus/kase'), 'mg-kase-resim'), h('i.mg-buhar'), h('i.mg-buhar.b2'), h('i.mg-buhar.b3')), 0.79, 0.95, 0.12, 1024 / 982);
    const gogus = Y.ekle(bolge('mg-gogus'), 0.6, 0.86, 0.18, 0.9);
    const agiz = Y.ekle(bolge('mg-agiz'), 0.6, 0.66, 0.2, 1.2);
    const kafa: HTMLImageElement[] = [];
    let hapsuZaman = 0;
    const hapsu = async (buyuk = false) => {
      a.ifade('saskin', 500);
      await oynat(a.ic, [{ transform: 'scale(1,1)' }, { transform: 'scale(0.96,1.06)', offset: 0.45 }, { transform: `translateY(4px) scale(${buyuk ? 1.12 : 1.06},${buyuk ? 0.86 : 0.93})`, offset: 0.62 }, { transform: 'scale(1,1)' }], 700);
      const n = ortasi(agiz, b.el);
      efekt(b.ucus, 'mg-hapsu-puf', n, 600, buyuk ? '--b:1.5' : '');
      ses.hapsu();
      a.ifade('uzgun');
    };
    const dongu = () => {
      clearInterval(hapsuZaman);
      if (TEST_MODU) return;
      hapsuZaman = window.setInterval(() => void hapsu(false), 6500);
    };
    const kur: SahneKurulum = {
      arka: [gogus, agiz],
      on: [kase],
      yerlesim: (sw, sh) => Y.uygula(sw, sh),
      hatirlat: () => {
        void hapsu(false);
        void kinoSoyle(G.kino.hapsu);
      },
      sifirla: () => {
        a.ic.getAnimations().forEach((x) => x.cancel());
        a.ic.style.transform = '';
        a.ifade('uzgun');
        kafa.forEach((k) => k.remove());
        kafa.length = 0;
        dongu();
      },
      basla: () => {
        b.odakla(0.47);
        b.hedefle([{ el: a.el, fn: () => kur.onDene(), pay: 6 }]);
        b.ipucu(() => b.elde());
      },
      komik: async (al) => {
        clearInterval(hapsuZaman);
        if (al === 'sulama') {
          // bir damla Kino'nun burnuna; dev hapşırık, Mino'nun şapkası uçup Kino'nun kafasına konar
          damlalar(b.ucus, eldeNokta(b), ortasi(agiz, b.el), 2);
          await bekle(400);
          void kinoSoyle(G.kino.hapsu);
          await hapsu(true);
          const sapka = oturum.giyili.bas;
          b.mino.mino.tepki('sersem', 1.2);
          if (sapka) {
            const sk = b.mino.yerKutusu(sapka, b.el);
            b.mino.cikar('bas');
            const ak = kutu(a.el, b.el);
            const hedef = { x: ak.x + ak.w / 2, y: ak.y + ak.w * 0.12 };
            const e = h('img.mg-ucan', { src: parcaResmi(sapka), alt: '', style: `width:${sk.w}px;height:${sk.h}px` });
            b.ucus.append(e);
            await kavis(e, { x: sk.x, y: sk.y }, hedef, 520, { tepe: -80, s1: 0.85 });
            e.remove();
            const k = h('img.mg-kafada', { src: parcaResmi(sapka), alt: '', style: `left:${hedef.x}px;top:${hedef.y}px;width:${sk.w * 0.85}px;height:${sk.h * 0.85}px` }) as HTMLImageElement;
            b.ucus.append(k);
            kafa.push(k);
            a.ifade('heyecan', 1600);
            b.mino.mino.tepki('gidik', 1.2);
            ses.kikir();
            await kinoSoyle(G.kino.sapkan);
            // şapka sahibine döner
            k.remove();
            await kavis(e, hedef, { x: sk.x, y: sk.y }, 480, { tepe: -60, s0: 0.85 }).catch(() => undefined);
            b.mino.giydir({ ...b.mino.giyili, bas: sapka });
          } else await bekle(600);
          // "öhö öhö": eliyle göğsünü tutar (dolaylı ipucu: stetoskop)
          for (let i = 0; i < 2; i++) {
            await oynat(a.ic, [{ transform: 'scale(1,1)' }, { transform: 'translateY(3px) scale(1.05,0.94)', offset: 0.3 }, { transform: 'scale(1,1)' }], 320);
            efekt(b.ucus, 'mg-oksuruk', ortasi(agiz, b.el), 500);
          }
        } else {
          // merdivenle Kino'nun alnına bakar: "Ateşin var mı?" Kino hapşırınca merdiven sallanır, Mino zıplayarak iner
          await minoGit(b, b.px(0.08, 0).x, -b.px(0, 0.12).y);
          await minoSoyle(M.yorum.ates);
          void kinoSoyle(G.kino.hapsu);
          await hapsu(true);
          await salla(b.mino.ic.parentElement, 500);
          b.mino.mino.tepki('sasir');
          await minoYerine(b, 420);
        }
        a.ifade('uzgun');
        dongu();
      },
      cozum: async (al, kez) => {
        clearInterval(hapsuZaman);
        if (al === 'stetoskop') {
          await minoGit(b, b.px(0.13, 0).x);
          void susYap(b, al);
          const n = ortasi(gogus, b.el);
          const atis = async () => {
            for (let i = 0; i < 3; i++) {
              ses.gum();
              efekt(b.ucus, 'mg-kalp-halka', n, 900);
              await bekle(560);
            }
          };
          if (b.ek(al)) {
            // kostüm doktor değil (§4a): şapka gözlerinin üstüne kayar ("Göremiyorum!"); şapka yoksa Kino gıdıklanır
            const s = sapkaAyir(b);
            b.ekOldu(s ? 'kino:stetoskop:sapka' : 'kino:stetoskop:gidik');
            if (s) {
              const goz = { x: s.k.x, y: s.k.y + s.k.h * 0.62 };
              ses.hop();
              await kavis(s.tut, { x: s.k.x, y: s.k.y }, goz, 300, { tepe: -14 });
              void oynat(s.resim, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.08,0.9)', offset: 0.5 }, { transform: 'scale(1,1)' }], 260);
              void b.mino.mino.ifade('sersem', 1600);
              b.mino.mino.tepki('kararsiz', 1.2);
              await minoSoyle(M.kostum_ek.goremiyorum);
              b.mino.el.style.transformOrigin = '50% 100%';
              await hopla(b.mino.el, 0.5, 360);
              await s.geri(goz);
            } else {
              a.ifade('heyecan', 1400);
              ses.kikir();
              void a.titre(700);
              await oynat(a.ic, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.06,0.94)', offset: 0.25 }, { transform: 'scale(0.97,1.04)', offset: 0.5 }, { transform: 'scale(1.04,0.96)', offset: 0.75 }, { transform: 'scale(1,1)' }], 700);
              await minoSoyle(M.kostum_ek.gidik);
            }
          }
          await atis();
          if (kez > 1) {
            // 5-6: "Kaç güm?" üç rakam balonu
            void minoSoyle(M.kac_gum);
            await new Promise<void>((coz) => {
              const balon = h('div.mg-sayilar', {}, ...GUM_SECENEK.map((s) => h('button.mg-sayi', { type: 'button', 'data-sayi': String(s) }, String(s))));
              const k = kutu(a.el, b.el);
              balon.style.cssText = `left:${k.x + k.w / 2}px;top:${k.y + k.h * 0.02}px`;
              b.ucus.append(balon);
              b.ipucu(() => balon.querySelector<HTMLElement>(`[data-sayi="${GUM_DOGRU}"]`));
              balon.addEventListener('click', async (e) => {
                const t = (e.target as HTMLElement).closest<HTMLElement>('.mg-sayi');
                if (!t) return;
                if (Number(t.dataset.sayi) === GUM_DOGRU) {
                  ses.yildiz();
                  void hopla(t, 0.6, 300);
                  await bekle(300);
                  balon.remove();
                  coz();
                } else {
                  // yanlışta kalp bir daha atar ve sayılır
                  void salla(t);
                  for (let i = 0; i < 3; i++) {
                    ses.gum();
                    efekt(b.ucus, 'mg-kalp-halka', n, 900);
                    say(i);
                    await bekle(620);
                  }
                }
              });
            });
          }
          await minoSoyle(M.dinlen);
          // Kino esneyip minderine kıvrılır, gülümser
          a.ifade('keyif');
          await oynat(a.ic, [{ transform: 'scale(1,1)' }, { transform: 'translateY(6px) scale(1.06,0.9)' }], 600, { fill: 'forwards' });
          await minoYerine(b);
          return true;
        }
        // kaşık: kâseden Kino'nun ağzına (5-6: 3 kaşık)
        await minoGit(b, b.px(0.1, 0).x);
        void susYap(b, al);
        await sirayla(b, Array.from({ length: kez }, () => agiz), kez, async (i) => {
          const sp = h('img.mg-ucan', { src: parcaResmi('alet-asci'), alt: '', style: `width:${b.px(0, 0.05).y}px;height:${b.px(0, 0.2).y}px` });
          b.ucus.append(sp);
          await kavis(sp, ortasi(kase, b.el), ortasi(agiz, b.el), 520, { tepe: -50 });
          sp.remove();
          void a.oynat('ye', 900);
          if (kez > 1) say(i);
          ses.hop();
          await bekle(500);
          if (i === 0 && b.ek(al)) {
            // kostüm aşçı değil (§4a): Kino ıhlamuru "üfff" diye üfler, buhar Mino'nun yüzüne; şapka havalanıp geri konar
            b.ekOldu('kino:kasik');
            await oynat(a.ic, [{ transform: 'scale(1,1)' }, { transform: 'scale(0.95,1.06)', offset: 0.4 }, { transform: 'scale(1.06,0.95)', offset: 0.7 }, { transform: 'scale(1,1)' }], 420);
            ses.bufPof();
            efekt(b.ucus, 'mg-hapsu-puf', burun(b), 700, '--b:1.4');
            const s = sapkaAyir(b);
            b.mino.mino.tepki('sasir', 1);
            if (s) {
              const ust = { x: s.k.x, y: s.k.y - s.k.h * 0.9 };
              await kavis(s.tut, { x: s.k.x, y: s.k.y }, ust, 280, { tepe: -10 });
              void minoSoyle(M.kostum_ek.sicak);
              await s.geri(ust);
            } else await minoSoyle(M.kostum_ek.sicak);
          }
        });
        a.ifade('heyecan', 1800);
        await kinoSoyle(G.kino.sicacik);
        await minoYerine(b);
        return true;
      },
      tesekkur: async () => {
        void kinoSoyle(G.kino.tesekkur);
        await a.sevin();
      },
      onDene: () => undefined,
      kapat: () => clearInterval(hapsuZaman),
    };
    return kur;
  },
};

// ================================================================ D3 · Bebek Ege acıktı (mutfak)

const egeSahnesi: SahneTanim = {
  arka: ['film/mutfak/arka-uzak', 'film/mutfak/arka-orta'],
  dogal: [2752, 1536],
  dolgu: ['#c49460', '#e2a364'],
  dikeyDolu: true,
  odak: 0.42,
  mino: { x: 0.28, taban: 0.96, h: 0.46 },
  arkadas: { x: 0.53, taban: 0.69, olcek: 0.78 },
  kur: (b) => {
    const Y = new Yerler();
    const a = b.arkadas;
    const LADDER_ORAN = parcaKostum('alet-itfaiye').kutu[2] / parcaKostum('alet-itfaiye').kutu[3];
    const sandalye = Y.ekle(resim(gorsel('film/esya/mama-sandalyesi'), 'mg-sandalye'), 0.53, 0.97, 0.48, 474 / 804);
    const tencere = Y.ekle(h('div.mg-tencere', {}, h('i.mg-buhar'), h('i.mg-buhar.b2'), h('i.mg-buhar.b3')), 0.365, 0.5, 0.12, 1.2);
    const kavanoz = Y.ekle(resim(gorsel('pasta/kavanoz-cikolata-1'), 'mg-kavanoz'), 0.7, 0.3, 0.11, 285 / 356);
    const merdiven = Y.ekle(h('div.mg-merdiven', {}, resim(parcaResmi('alet-itfaiye'), 'mg-merdiven-resim')), 0.73, 0.64, 0.34, LADDER_ORAN);
    const agiz = Y.ekle(bolge('mg-agiz'), 0.53, 0.47, 0.13, 1.1);
    const govde = Y.ekle(bolge('mg-ege-bolge'), 0.53, 0.97, 0.62, 0.7);
    let aglama = 0;
    const mama = () => {
      a.ifade('agliyor');
      a.balon(G.ege.mama, 1500);
      void a.titre(400);
    };
    const dongu = () => {
      clearInterval(aglama);
      if (TEST_MODU) return;
      aglama = window.setInterval(mama, 7000);
    };
    const kur: SahneKurulum = {
      arka: [sandalye, kavanoz, merdiven, tencere, govde],
      on: [agiz],
      yerlesim: (sw, sh) => Y.uygula(sw, sh),
      hatirlat: mama,
      sifirla: () => {
        merdiven.classList.remove('acik');
        tencere.classList.remove('kaynar');
        a.ifade('agliyor');
        dongu();
      },
      basla: () => {
        b.odakla(0.42);
        b.hedefle([
          { el: govde, fn: () => kur.onDene() },
          { el: tencere, fn: () => kur.onDene() },
          { el: kavanoz, fn: () => kur.onDene(), pay: 24 },
        ]);
        b.ipucu(() => b.elde());
      },
      komik: async (al) => {
        clearInterval(aglama);
        if (al === 'stetoskop') {
          await minoGit(b, b.px(0.15, 0).x);
          ses.gurul();
          efekt(b.ucus, 'mg-gurul', ortasi(govde, b.el), 900);
          a.ifade('kikir', 1600);
          ses.kikir();
          await minoSoyle(M.yorum.karin);
          await minoYerine(b);
        } else {
          // Ege kabı oyuncak sanır, kapıp etrafa su serper ve güler; Mino ıslanır
          const ek = eldeNokta(b);
          b.mino.mino.kostumResmi('alet')?.style.setProperty('opacity', '0');
          const ak = ortasi(agiz, b.el);
          const kap = h('img.mg-ucan', { src: parcaResmi('alet-bahce'), alt: '', style: `width:${b.px(0, 0.12).y * 1.6}px;height:${b.px(0, 0.12).y}px` });
          b.ucus.append(kap);
          await kavis(kap, ek, { x: ak.x + 10, y: ak.y + 40 }, 500, { tepe: -60 });
          a.ifade('kahkaha', 1800);
          ses.kikir();
          ses.su();
          for (let i = 0; i < 3; i++) {
            damlalar(b.ucus, { x: ak.x, y: ak.y + 30 }, ortasi(b.mino.el, b.el), 4);
            await bekle(200);
          }
          void b.mino.mino.hal('islak');
          b.mino.mino.tepki('sasir');
          await minoSoyle(M.yorum.mama);
          await kavis(kap, { x: ak.x + 10, y: ak.y + 40 }, ek, 480, { tepe: -50 });
          kap.remove();
          b.mino.mino.kostumResmi('alet')?.style.removeProperty('opacity');
          a.ifade('agliyor');
          a.balon(G.ege.mama, 1500);
          b.sonra(1200, () => void b.mino.mino.hal(null));
        }
        dongu();
      },
      cozum: async (al, kez) => {
        clearInterval(aglama);
        if (al === 'kasik') {
          // tencereyi karıştır (daire), buhar çıkar; kaşık "vınnn" uçak olur, Ege'nin ağzına
          await minoGit(b, b.px(0.1, 0).x);
          void susYap(b, al);
          let aci = 0;
          let onceki: number | null = null;
          await new Promise<void>((coz) => {
            const t = tencere;
            const merkez = () => ortasi(t, b.el);
            const ekle = (n: Nokta) => {
              const m = merkez();
              const q = Math.atan2(n.y - m.y, n.x - m.x);
              if (onceki !== null) {
                let fk = q - onceki;
                if (fk > Math.PI) fk -= Math.PI * 2;
                if (fk < -Math.PI) fk += Math.PI * 2;
                aci += fk;
              }
              onceki = q;
              t.style.setProperty('--dolu', String(Math.min(1, Math.abs(aci) / (Math.PI * 2 * 0.7))));
              if (Math.random() < 0.15) ses.tin(1);
              if (karistirmaTamam(aci)) {
                b.hedefle([]);
                t.removeEventListener('pointermove', parmakla);
                coz();
              }
            };
            const parmakla = (e: PointerEvent) => {
              if (!e.buttons && e.pointerType === 'mouse') return;
              const r = b.el.getBoundingClientRect();
              ekle({ x: e.clientX - r.left, y: e.clientY - r.top });
            };
            t.style.touchAction = 'none';
            t.addEventListener('pointermove', parmakla);
            t.classList.add('hedef');
            b.ipucu(() => t);
            // dokunuş da sayılır: her dokunuş çeyrek tur
            b.hedefle([
              {
                el: t,
                pay: 20,
                ustunde: ekle,
                fn: () => {
                  aci += Math.PI / 2;
                  ses.tin(0);
                  onceki = null;
                  t.style.setProperty('--dolu', String(Math.min(1, Math.abs(aci) / (Math.PI * 2 * 0.7))));
                  if (karistirmaTamam(aci)) {
                    b.hedefle([]);
                    coz();
                  }
                },
              },
            ]);
          });
          tencere.classList.remove('hedef');
          tencere.classList.add('kaynar');
          ses.dikil(2);
          await bekle(400);
          if (b.ek(al)) {
            // kostüm aşçı değil (§4a): tencere "fokur" der, bir damla Mino'nun burnuna sıçrar
            b.ekOldu('ege:kasik');
            const n = burun(b);
            ses.pit(3);
            damlalar(b.ucus, ortasi(tencere, b.el), n, 3);
            await bekle(420);
            efekt(b.ucus, 'mg-leke', n, 1600);
            b.mino.mino.tepki('sasir', 1);
            void b.mino.mino.ifade('goz-kirp', 900);
            await minoSoyle(M.kostum_ek.burnuma);
          }
          await sirayla(b, [agiz], kez, async (i) => {
            const sp = h('img.mg-ucan', { src: parcaResmi('alet-asci'), alt: '', style: `width:${b.px(0, 0.05).y}px;height:${b.px(0, 0.18).y}px` });
            b.ucus.append(sp);
            ses.vin();
            // dalgalı yol: iki yay
            const t0 = ortasi(tencere, b.el);
            const t1 = ortasi(agiz, b.el);
            const ara = { x: (t0.x + t1.x) / 2, y: (t0.y + t1.y) / 2 - 30 };
            await kavis(sp, t0, ara, 380, { tepe: -40 });
            await kavis(sp, ara, t1, 380, { tepe: 30 });
            sp.remove();
            a.ifade('am', 700);
            a.balon(G.ege.ham, 900);
            if (kez > 1) say(i);
            await bekle(700);
            a.ifade('kikir', 900);
          });
          await minoYerine(b);
          return true;
        }
        // merdiven üst rafa dayanır, Mino çıkar; kavanozdan kurabiye
        const ek = eldeNokta(b);
        void parcaUcur2(b, 'alet-itfaiye', ek, ortasi(merdiven, b.el));
        b.mino.mino.kostumResmi('alet')?.style.setProperty('opacity', '0');
        b.odakla(0.62);
        await bekle(320);
        await merdivenUzat(merdiven);
        void susYap(b, al);
        const dx = b.px(0.66 - 0.28, 0).x;
        await minoGit(b, dx, -b.px(0, 0.2).y, 700);
        if (b.ek(al)) {
          // kostüm itfaiyeci değil (§4a): kasksız Mino merdivenin tepesinde sağa sola sallanır
          b.ekOldu('ege:merdiven');
          b.mino.mino.tepki('zorlan', 1.4);
          void minoSoyle(M.kostum_ek.sallaniyorum);
          const kap = b.mino.el;
          await oynat(kap, [{ translate: '0 0' }, { translate: '-9px 2px', offset: 0.2 }, { translate: '8px 0', offset: 0.45 }, { translate: '-6px 2px', offset: 0.7 }, { translate: '4px 0', offset: 0.85 }, { translate: '0 0' }], 1300);
          ses.tik(2);
        }
        await sirayla(b, [kavanoz], 1, async () => {
          void hopla(kavanoz, 0.5, 300);
          ses.pit(2);
          const kur2 = h('img.mg-ucan', { src: gorsel('pasta/kurabiye-yuvarlak-altin'), alt: '', style: `width:${b.px(0, 0.07).y}px;height:${b.px(0, 0.065).y}px` });
          b.ucus.append(kur2);
          await kavis(kur2, ortasi(kavanoz, b.el), ortasi(agiz, b.el), 700, { tepe: -60 });
          kur2.remove();
        }, 24);
        b.odakla(0.42);
        a.ifade('am', 800);
        a.balon(G.ege.ham, 900);
        await bekle(800);
        a.ifade('kikir', 1200);
        merdiven.classList.remove('acik');
        b.mino.mino.kostumResmi('alet')?.style.removeProperty('opacity');
        await minoYerine(b, 600);
        return true;
      },
      tesekkur: async () => {
        a.balon(G.ege.tesekkur, 1800);
        a.ifade('kahkaha', 1800);
        ses.kikir();
        await a.hopla(0.6);
        await bekle(600);
      },
      onDene: () => undefined,
      kapat: () => clearInterval(aglama),
    };
    // gizli sürpriz 6: Ege'nin ayağına dokununca gıdıklanır, kahkaha atar
    const ayak = Y.ekle(h('button.mg-ayak', { type: 'button', 'aria-label': 'Ege\'nin ayağı' }), 0.53, 0.8, 0.1, 1.6);
    ayak.addEventListener('click', (e) => {
      e.stopPropagation();
      b.el.dataset.surpriz = 'ayak';
      a.ifade('kahkaha', 1400);
      ses.kikir();
      void a.titre(500);
    });
    kur.on.push(ayak);
    return kur;
  },
};

// ================================================================ D4 · Ada'nın çiçekleri boynunu büktü (bahçe)

const adaSahnesi: SahneTanim = {
  arka: ['film/park/arka-uzak', 'film/park/arka-on'],
  dogal: [4096, 2286],
  dolgu: ['#4faff0', '#9ac93e'],
  dikeyAlta: true,
  odak: 0.51,
  mino: { x: 0.3, taban: 0.95, h: 0.42 },
  arkadas: { x: 0.71, taban: 0.95, olcek: 0.92 },
  kur: (b) => {
    const Y = new Yerler();
    const a = b.arkadas;
    const LADDER_ORAN = parcaKostum('alet-itfaiye').kutu[2] / parcaKostum('alet-itfaiye').kutu[3];
    const adet = b.g === '56' ? 3 : 2;
    const xler = adet === 3 ? [0.45, 0.525, 0.6] : [0.47, 0.57];
    const cicekler = xler.map((x) => Y.ekle(h('div.mg-cicek', {}, resim(gorsel('film/esya/cicek'), 'mg-cicek-resim')), x, 0.9, 0.2, 410 / 704));
    const mantar = Y.ekle(h('div.mg-mantar', {}, resim(gorsel('film/esya/mantar'), 'mg-mantar-resim')), 0.39, 0.93, 0.09, 452 / 542);
    const kova = Y.ekle(resim(gorsel('film/esya/kova'), 'mg-kova'), 0.64, 0.95, 0.12, 445 / 613);
    const merdiven = Y.ekle(h('div.mg-merdiven', {}, resim(parcaResmi('alet-itfaiye'), 'mg-merdiven-resim')), 0.36, 0.96, 0.34, LADDER_ORAN);
    const gunes = h('i.mg-gunes', { 'aria-hidden': 'true' });
    const bahce = Y.ekle(bolge('mg-bahce'), 0.525, 0.95, 0.32, 1.1);
    if (b.g !== '56') mantar.style.display = 'none';
    let mantarSulandi = false;
    const solgun = () => cicekler.forEach((c) => c.classList.add('solgun'));
    // gizli sürpriz 5 (5-6): mantar sulanırsa yaylanarak dikilir, kocaman "pof" spor bulutu; Ada hapşırır
    const mantarPof = async () => {
      if (mantarSulandi) return;
      mantarSulandi = true;
      b.el.dataset.surpriz = 'mantar';
      await dikil(mantar.querySelector('img'), 600);
      ses.bufPof();
      efekt(b.ucus, 'mg-spor', ortasi(mantar, b.el), 1100);
      await bekle(500);
      ses.hapsu();
      await oynat(a.ic, [{ transform: 'scale(1,1)' }, { transform: 'scale(0.96,1.05)', offset: 0.4 }, { transform: 'scale(1.08,0.9)', offset: 0.6 }, { transform: 'scale(1,1)' }], 600);
    };
    const kur: SahneKurulum = {
      arka: [gunes, kova, merdiven, mantar, ...cicekler, bahce],
      on: [],
      yerlesim: (sw, sh) => {
        Y.uygula(sw, sh);
        gunes.style.cssText = `left:${sw * 0.86}px;top:${sh * 0.06}px;width:${sh * 0.16}px;height:${sh * 0.16}px`;
      },
      hatirlat: () => {
        ses.boing();
        const k = h('img', { src: gorsel('film/esya/cicek'), alt: '', class: 'mg-balon-cicek' });
        a.balon(k, 1600);
      },
      sifirla: () => {
        solgun();
        merdiven.classList.remove('acik');
        a.ifade(null);
      },
      basla: () => {
        b.odakla(0.51);
        b.hedefle([
          { el: bahce, fn: () => kur.onDene() },
          { el: a.el, fn: () => kur.onDene() },
        ]);
        b.ipucu(() => b.elde());
      },
      komik: async (al) => {
        if (al === 'stetoskop') {
          await minoGit(b, b.px(xler[0] - 0.3 - 0.08, 0).x);
          b.mino.mino.bak(1);
          await bekle(1100);
          ses.tik(0);
          await bekle(300);
          await minoSoyle(M.yorum.susamis);
          b.mino.mino.bak(0);
          await minoYerine(b);
        } else {
          // merdivenin tepesinden güneşe bakar, gözlerini kısar; Ada da terler
          const ek = eldeNokta(b);
          void parcaUcur2(b, 'alet-itfaiye', ek, ortasi(merdiven, b.el));
          b.mino.mino.kostumResmi('alet')?.style.setProperty('opacity', '0');
          await bekle(320);
          await merdivenUzat(merdiven);
          await minoGit(b, b.px(0.07, 0).x, -b.px(0, 0.26).y, 700);
          b.mino.mino.gozZorla = true;
          b.mino.mino.bak(1);
          gunes.classList.add('parla');
          efekt(b.ucus, 'mg-ter', ortasi(a.el, b.el), 1400);
          void a.titre(400);
          await minoSoyle(M.yorum.gunes);
          b.mino.mino.gozZorla = false;
          b.mino.mino.bak(0);
          gunes.classList.remove('parla');
          await minoYerine(b, 600);
          merdiven.classList.remove('acik');
          b.mino.mino.kostumResmi('alet')?.style.removeProperty('opacity');
        }
      },
      cozum: async (al, kez) => {
        void susYap(b, al);
        const hedefler = cicekler.slice(0, kez);
        if (al === 'sulama') {
          // her çiçeğin üstünde kabı tut: damlalar düşer, çiçek önce ezilip sonra yaylanarak dikilir
          await minoGit(b, b.px(0.1, 0).x);
          for (const [i, c] of hedefler.entries()) {
            c.classList.add('hedef');
            b.ipucu(() => c);
            const t = tutHedefi(c, 1000, () => damlalar(b.ucus, { x: ortasi(c, b.el).x, y: kutu(c, b.el).y - 20 }, ortasi(c, b.el), 1));
            const ekHedef: Hedef[] = b.g === '56' && !mantarSulandi ? [{ el: mantar, ...tutHedefi(mantar, 900, () => undefined).hedef, fn: () => void mantarPof(), ustunde: () => void mantarPof() }] : [];
            b.hedefle([...ekHedef, { el: c, ...t.hedef }]);
            await t.bekle;
            t.iptal();
            c.classList.remove('hedef', 'solgun');
            ses.dikil(i);
            if (kez > 2) say(i);
            await dikil(c, 700);
            if (i === 0 && b.ek(al)) {
              // kostüm bahçıvan değil (§4a): hasır şapka yok, sudan bir damla da Mino'nun başına düşer (Mino sudan hoşlanmaz)
              b.ekOldu('ada:sulama');
              const bu = basUstu(b);
              ses.su();
              damlalar(b.ucus, { x: bu.x + bu.w * 0.6, y: bu.y - bu.h * 1.2 }, { x: bu.x, y: bu.y }, 3);
              await bekle(380);
              void b.mino.mino.hal('islak');
              b.mino.mino.tepki('sasir', 1);
              await minoSoyle(M.su);
              b.sonra(1400, () => void b.mino.mino.hal(null));
            }
          }
        } else {
          // kaşıkla kovadan her çiçeğe bir kaşık; Mino her seferinde dili dışarıda koşar
          await sirayla(b, hedefler, hedefler.length, async (i, c) => {
            if (i === 0 && b.ek(al)) {
              // kostüm aşçı değil (§4a): Mino ıslak çimde kayar, kaşıktaki su yüzüne sıçrar
              b.ekOldu('ada:kasik');
              const mk = kutu(b.mino.el, b.el);
              b.mino.el.style.transformOrigin = '50% 100%';
              void minoGit(b, b.px(0.06, 0).x, 0, 360);
              await bekle(220);
              b.mino.pof(b.ucus, { x: mk.x + mk.w / 2 + b.px(0.06, 0).x, y: mk.y + mk.h * 0.95 }, mk.w * 0.5);
              ses.boing();
              await oynat(b.mino.el, [{ transform: 'scale(1,1)' }, { transform: 'translateY(4px) scale(1.16,0.8)', offset: 0.3 }, { transform: 'translateY(-10px) scale(0.94,1.08)', offset: 0.6 }, { transform: 'scale(1,1)' }], 560);
              damlalar(b.ucus, eldeNokta(b), burun(b), 3);
              b.mino.mino.tepki('sersem', 1.2);
              await minoSoyle(M.kostum_ek.kaydim);
            }
            void b.mino.mino.ifade('odak', 1200);
            const sp = h('img.mg-ucan', { src: parcaResmi('alet-asci'), alt: '', style: `width:${b.px(0, 0.05).y}px;height:${b.px(0, 0.18).y}px` });
            b.ucus.append(sp);
            void minoGit(b, b.px(0.64 - 0.3 - 0.1, 0).x, 0, 420);
            await kavis(sp, ortasi(kova, b.el), { x: ortasi(c, b.el).x, y: kutu(c, b.el).y }, 700, { tepe: -70 });
            sp.remove();
            damlalar(b.ucus, { x: ortasi(c, b.el).x, y: kutu(c, b.el).y - 10 }, ortasi(c, b.el), 3);
            c.classList.remove('solgun');
            ses.dikil(i);
            if (kez > 2) say(i);
            await dikil(c, 700);
          });
        }
        a.ifade('mutlu', 1800);
        ses.alkis(6);
        await minoYerine(b);
        return true;
      },
      tesekkur: async () => {
        a.balon(kalpSvg(), 1600);
        ses.alkis(8);
        await a.sevin();
      },
      onDene: () => undefined,
    };
    // 5-6'da mantar her an sulanabilir (gizli; ipucu yok)
    mantar.addEventListener('click', () => {
      if (oturum.giyili.alet === 'alet-bahce' && b.g === '56') void mantarPof();
    });
    return kur;
  },
};

export const SAHNELER: Record<Dert, SahneTanim> = { pamuk: pamukSahnesi, kino: kinoSahnesi, ege: egeSahnesi, ada: adaSahnesi };
