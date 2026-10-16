/**
 * Mino'nun odası (ekip/senaryo/MINO-NE-GIYSIN.md §2, §3, §10): yardım balonları (hangi arkadaşa önce?), dolap (4 şapka,
 * 4 üst), alet sepeti (4 alet), ayna, kapı, çözülen dertlerden sonra odaya gelen arkadaşlar. Bütün dertler çözülünce
 * aynı oda Kostüm Partisi olur (parti.ts).
 *
 * Kural (Barış): her adımda en az 3 gerçek seçenek; anlatım "şuna dokun" demez; ipucu geç ve dolaylı (12 / 25 / 35 /
 * 45 sn; 5-6 yaşta 15 / 30 / 40 / 50); döndürme ve büyütme yok. Yerleşim JS'te (ekran boyuna göre px), önce telefon.
 * Hiçbir animasyon dokunuşu kilitlemez: parçalar sıraya girer, kapı her an çalışır.
 */
import { kilitliIcerik } from '../../src/abonelik/ekran';
import { h, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import G from '../../content/mino-giysin.json';
import { bekle, hopla, kavis, ms, oynat, salla, type Nokta } from './anim';
import { Arkadas } from './arkadas';
import { icinde, kutu, surukle } from './dokunma';
import { KostumluMino, MINO_ORAN, MINO_TABAN, parcaUcur } from './kostumlu-mino';
import { kayit } from './kayit';
import { ayniSayac, cikar, DERTLER, ipucuSureleri, parca, parcaAleti, partiAcik, PARCALAR, ROLLER, sapkaNereye, takimAdi, yildizlar, type Dert, type ParcaId, type Takim } from './model';
import { acikDertler, dertKilitli, grup, oturum, oturumuSifirla } from './oturum';
import { gecit, partiAlkis, tavanaAt } from './parti';
import { gorsel, ikonResmi, onYukle, parcaKostum, parcaResmi } from './resimler';
import { Sepet, SEPET_BOY } from './sepet';
import { kinoSoyle, minoSoyle, ses } from './ses';

const M = G.mino;

/** dolap-acik-goz çizimindeki gözler (dolabın oranı): 2 sütun × 4 sıra (giysin/src/oda.ts ile aynı ölçü) */
const DOLAP_SUTUN: [number, number][] = [
  [0.252, 0.486],
  [0.514, 0.748],
];
const DOLAP_SIRA: [number, number][] = [
  [0.108, 0.245],
  [0.268, 0.4],
  [0.424, 0.555],
  [0.579, 0.705],
];
/** dolap-acik-goz.webp 1000 px: DPR 3'te en çok 333 css px */
const DOLAP_EN_COK = 1000 / 3;
/** Dolap düzeni: üst iki sıra şapka, alt iki sıra üst giysi (sol-sağ: doktor, itfaiye / aşçı, bahçe) */
const DOLAP_PARCA: ParcaId[] = [...ROLLER.map((r) => `bas-${r}` as ParcaId), ...ROLLER.map((r) => `ust-${r}` as ParcaId)];

/** Arkadaşın derdini anlatan ses (balon açılınca, seçilince) */
export function derdinSesi(d: Dert) {
  if (d === 'pamuk') ses.miyav();
  else if (d === 'kino') {
    ses.hapsu();
    void kinoSoyle(G.kino.hapsu);
  } else if (d === 'ege') ses.gurul();
  else ses.boing();
}

/** Yardım balonundaki yüz: arkadaşın iskeleti, başı dairenin içine gelecek gibi (yüz ifadesi derdini anlatır) */
const YUZ: Record<Dert, { olcek: number; dy: number; ifade: string | null }> = {
  pamuk: { olcek: 1.9, dy: 0.02, ifade: 'uzgun' },
  kino: { olcek: 1.9, dy: 0.03, ifade: 'uzgun' },
  ege: { olcek: 2.1, dy: 0.05, ifade: 'agliyor' },
  ada: { olcek: 2.9, dy: 0.0, ifade: null },
};

interface Kutu {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function odaEkrani(app: Uygulama, param?: { gelen?: Dert }): Ekran {
  const g = grup();
  const IP = ipucuSureleri(g);
  const zamanlar: number[] = [];
  const sonra = (n: number, fn: () => void) => void zamanlar.push(window.setTimeout(fn, ms(n)));
  onYukle([gorsel('giysin/oda-yatay'), gorsel('giysin/oda-dikey'), gorsel('giysin/dolap-acik-goz'), ...PARCALAR.map((p) => parcaResmi(p.id))]);

  // ------------------------------------------------------------ öğeler
  const el = h('div.mg-oda', { 'data-adim': 'acilis' });
  const zemin = h('img.mg-zemin', { alt: '', draggable: 'false' }) as HTMLImageElement;
  const ucus = h('div.mg-ucus', { 'aria-hidden': 'true' });
  const parmak = h('div.mg-parmak', { 'aria-hidden': 'true', html: IKON.el });

  // dolap: 8 göz + kapağın üstünde 8 çözüm yıldızı
  const dolapResim = h('img.mg-dolap-resim', { src: gorsel('giysin/dolap-acik-goz'), alt: '', draggable: 'false' });
  const gozler = DOLAP_PARCA.map((id) =>
    h('button.mg-goz', { type: 'button', 'data-parca': id, 'aria-label': id }, h('img', { src: ikonResmi(id), alt: '', draggable: 'false' })),
  );
  const yildizKap = h('div.mg-yildizlar', { 'aria-hidden': 'true' });
  const dolap = h('div.mg-dolap', {}, dolapResim, ...gozler, yildizKap);
  const yildizCiz = (yeni?: string) => {
    yildizKap.replaceChildren(
      ...yildizlar(kayit).map((y) =>
        h(`span.mg-yildiz${y.dolu ? '.dolu' : ''}${yeni === `${y.dert}:${y.alet}` ? '.yeni' : ''}`, { 'data-yildiz': `${y.dert}:${y.alet}`, html: IKON.yildiz }, ...(y.dolu ? [h('img', { src: ikonResmi(`alet-${ROLLER.find((r) => parcaAleti(`alet-${r}`) === y.alet)!}` as ParcaId), alt: '' })] : [])),
      ),
    );
  };
  yildizCiz();

  const sepet = new Sepet();
  const aynaResim = h('img', { src: gorsel('giysin/ayna'), alt: '', draggable: 'false' });
  const aynaParilti = h('i.mg-ayna-parilti');
  const ayna = h('button.mg-ayna', { type: 'button', 'aria-label': 'Ayna' }, aynaResim, aynaParilti);
  const kapiKanat = h('img.mg-kapi-kanat', { src: gorsel('giysin/kapi-kanat'), alt: '', draggable: 'false' });
  const kapi = h('button.mg-kapi', { type: 'button', 'aria-label': 'Kapı' }, h('div.mg-kapi-isik'), kapiKanat, h('img.mg-kapi-cerceve', { src: gorsel('giysin/kapi-cerceve'), alt: '', draggable: 'false' }));

  const mino = new KostumluMino(oturum.giyili);
  const minoKap = h('div.mg-mino-yer', {}, mino.el);

  // yardım balonları: arkadaşın yüzü (dertli ifadesiyle); seçilen Mino'nun düşünce balonuna geçer
  const yuzler: Partial<Record<Dert, Arkadas>> = {};
  const balonlar = {} as Record<Dert, HTMLButtonElement>;
  for (const d of DERTLER) {
    const a = new Arkadas(d);
    yuzler[d] = a;
    const y = YUZ[d];
    a.el.style.setProperty('--olcek', String(y.olcek));
    a.el.style.setProperty('--dy', String(y.dy));
    const b = h(
      `button.mg-yardim${oturum.cozulen.includes(d) ? '.bitti' : ''}${dertKilitli(d) ? '.kilitli' : ''}`,
      { type: 'button', 'data-dert': d, 'aria-label': d },
      h('div.mg-yardim-yuz', {}, a.el),
      h('i.mg-yardim-tik', { html: IKON.onay }),
      ...(dertKilitli(d) ? [h('i.mg-yardim-kilit', { html: IKON.kilit })] : []),
    ) as HTMLButtonElement;
    balonlar[d] = b;
    void a.karakter.hazir.then(() => (oturum.cozulen.includes(d) ? a.ifade(d === 'ege' ? 'kikir' : d === 'kino' ? 'heyecan' : 'mutlu') : y.ifade && a.ifade(y.ifade)));
  }
  const dusunce = h('div.mg-dusunce', { 'aria-hidden': 'true' }, h('i.k1'), h('i.k2'), h('i.k3'));

  // odaya gelmiş arkadaşlar (çözülen dertler): duvar dibinde oturur
  const arkadaslar: Partial<Record<Dert, Arkadas>> = {};
  const arkKap = h('div.mg-arkadaslar');
  for (const d of oturum.cozulen) {
    const a = new Arkadas(d);
    arkadaslar[d] = a;
    arkKap.append(a.el);
    void a.karakter.hazir.then(() => a.ifade(d === 'ege' ? 'kikir' : d === 'kino' ? 'heyecan' : 'mutlu', 1500));
  }

  const bitirDugme = h('button.mg-bitir', { type: 'button' }, h('span', { html: IKON.tac }), G.yazi.bitir);
  const ust = h('div.mg-ust', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.secenekler.cikis?.(), 'mg-geri'), sesDugmesi());

  el.append(zemin, dolap, ayna, kapi, arkKap, sepet.el, minoKap, dusunce, ...Object.values(balonlar), bitirDugme, ust, ucus, parmak);

  // ------------------------------------------------------------ yerleşim (px)
  let Y = {
    dikey: false,
    dolap: { x: 0, y: 0, w: 0, h: 0 } as Kutu,
    sepet: { x: 0, y: 0, w: 0, h: 0 } as Kutu,
    kapi: { x: 0, y: 0, w: 0, h: 0 } as Kutu,
    ayna: { x: 0, y: 0, w: 0, h: 0 } as Kutu,
    mino: { x: 0, taban: 0, w: 0 },
    balon: [] as Nokta[],
    balonCap: 60,
    dusunce: { x: 0, y: 0 } as Nokta,
    minder: [] as { x: number; taban: number; olcek: number }[],
  };
  const yerlesim = () => {
    const W = el.clientWidth || innerWidth;
    const H = el.clientHeight || innerHeight;
    const gv = guvenli(el);
    const dikey = H > W * 1.1;
    zemin.src = gorsel(dikey ? 'giysin/oda-dikey' : 'giysin/oda-yatay');
    const sol = gv.sol + 6;
    const sag = W - gv.sag - 6;
    const alt = H - gv.alt - 6;
    if (!dikey) {
      // yatay: [dolap] [arkadaşlar] [Mino] [ayna + sepet] [kapı]
      // dolap resmi 1000 px: DPR 3'te en çok 333 px (kaynak boyunun üstüne büyütülmez)
      const d = Math.min((alt - 64) / 0.597, (W * 0.36) / 0.75, DOLAP_EN_COK);
      const rowsAlt = alt - 2;
      const dy = rowsAlt - 0.705 * d;
      const dx = sol - 0.2 * d;
      const dolapSag = dx + 0.92 * d;
      const kapiH = Math.min(0.78 * H - 64, 300);
      const kapiW = kapiH / 2;
      const zeminCizgi = 0.79 * H;
      const kapi: Kutu = { x: sag - kapiW + kapiW * 0.12, y: zeminCizgi - kapiH, w: kapiW, h: kapiH };
      const sw = Math.min(150, W * 0.17);
      const sepet: Kutu = { x: kapi.x - sw * 0.92, y: alt - sw * SEPET_BOY, w: sw, h: sw * SEPET_BOY };
      const ayna: Kutu = { x: sepet.x + sw * 0.22, y: Math.max(66, sepet.y - 0.62 * sw - 8), w: 0.5 * Math.min(110, sw * 0.62), h: Math.min(110, sw * 0.62) };
      ayna.y = Math.min(ayna.y, sepet.y - ayna.h * 0.2);
      const minoH = Math.min(0.7 * H, 300);
      const minoW = minoH / MINO_ORAN;
      // dolapla Mino arasında iki arkadaşlık yer (~100 px), Mino'nun kuyruğu sepete değmez
      const minoX = Math.min(dolapSag + 100 + minoW / 2, sepet.x - minoW * 0.5);
      const cap = Math.min(64, (sag - sol) * 0.075);
      const bx = (dolapSag + kapi.x) / 2;
      Y = {
        dikey,
        dolap: { x: dx, y: dy, w: d, h: d },
        sepet,
        kapi,
        ayna,
        mino: { x: minoX, taban: alt - 4, w: minoW },
        balon: DERTLER.map((_, i) => ({ x: bx + (i - 1.5) * (cap + 12), y: gv.ust + 8 + cap / 2 })),
        balonCap: cap,
        // düşünce balonu başın sol üstünde (şapkanın ve aynanın üstüne binmez)
        dusunce: { x: minoX - minoW * 0.62, y: Math.max(gv.ust + 40 + cap, alt - 4 - minoH * 0.9) },
        minder: [
          // ikisi dolapla Mino arasında, ikisi kapının önünde (kapı arkalarında kalır, dokunuşu tutmazlar)
          { x: dolapSag + 26, taban: zeminCizgi + 4, olcek: 0.4 },
          { x: kapi.x + kapi.w * 0.3, taban: alt - 4, olcek: 0.38 },
          { x: dolapSag + 84, taban: alt - 8, olcek: 0.44 },
          { x: kapi.x + kapi.w * 0.74, taban: alt - 14, olcek: 0.34 },
        ],
      };
    } else {
      // dikey: üstte balonlar; ortada Mino (duvar önünde), solda ayna, sağda kapı; altta solda sepet, sağda dolap
      const zeminCizgi = 0.76 * H;
      const d = Math.min(DOLAP_EN_COK, (sag - sol) * 0.95);
      const dx = sag - 0.76 * d;
      const rowsAlt = alt - 4;
      const dy = rowsAlt - 0.705 * d;
      const sw = Math.min(150, dx + 0.17 * d - sol - 10);
      const sepet: Kutu = { x: sol + 2, y: alt - sw * SEPET_BOY, w: sw, h: sw * SEPET_BOY };
      // Mino duvar dibinde durur; dolap ve sepet önde (ayakları dolabın arkasında kalır: derinlik)
      const minoTaban = zeminCizgi + 2;
      const minoH = Math.min(0.36 * H, minoTaban - (gv.ust + 70 + Math.min(66, (sag - sol) * 0.18) + 60));
      const minoW = minoH / MINO_ORAN;
      const minoX = W / 2 - 6;
      const kapiW = Math.min(96, W * 0.24);
      const kapi: Kutu = { x: sag - kapiW * 0.8, y: zeminCizgi - kapiW * 2, w: kapiW, h: kapiW * 2 };
      const ayna: Kutu = { x: sol + 6, y: minoTaban - minoH * 0.95, w: 52, h: 104 };
      const cap = Math.min(66, (sag - sol) * 0.18);
      Y = {
        dikey,
        dolap: { x: dx, y: dy, w: d, h: d },
        sepet,
        kapi,
        ayna,
        mino: { x: minoX, taban: minoTaban, w: minoW },
        balon: DERTLER.map((_, i) => ({ x: W / 2 + (i - 1.5) * (cap + 14), y: gv.ust + 70 + cap / 2 })),
        balonCap: cap,
        dusunce: { x: minoX + minoW * 0.42, y: minoTaban - minoH * 1.12 },
        minder: [
          { x: sol + 30, taban: zeminCizgi - 4, olcek: 0.38 },
          { x: sag - 22, taban: zeminCizgi - 4, olcek: 0.36 },
          { x: sol + 94, taban: zeminCizgi + 10, olcek: 0.42 },
          { x: sag - 64, taban: zeminCizgi + 10, olcek: 0.38 },
        ],
      };
    }
    el.classList.toggle('dikey', Y.dikey);
    yaz(dolap, Y.dolap);
    gozler.forEach((b, i) => {
      const [x0, x1] = DOLAP_SUTUN[i % 2];
      const [y0, y1] = DOLAP_SIRA[Math.floor(i / 2)];
      yaz(b, { x: x0 * Y.dolap.w, y: y0 * Y.dolap.w, w: (x1 - x0) * Y.dolap.w, h: (y1 - y0) * Y.dolap.w });
    });
    yaz(yildizKap, { x: 0.2 * Y.dolap.w, y: 0.035 * Y.dolap.w, w: 0.6 * Y.dolap.w, h: 0.055 * Y.dolap.w });
    yaz(sepet.el, Y.sepet);
    yaz(kapi, Y.kapi);
    yaz(ayna, Y.ayna);
    minoKap.style.cssText = `left:${Y.mino.x - Y.mino.w / 2}px;top:${Y.mino.taban - Y.mino.w * MINO_ORAN * MINO_TABAN}px;width:${Y.mino.w}px`;
    for (const d of DERTLER) {
      const b = balonlar[d];
      const n = oturum.secili === d && !oturum.parti ? Y.dusunce : Y.balon[DERTLER.indexOf(d)];
      const cap = oturum.secili === d ? Y.balonCap * 1.08 : Y.balonCap;
      b.style.cssText = `left:${n.x - cap / 2}px;top:${n.y - cap / 2}px;width:${cap}px;height:${cap}px`;
    }
    dusunce.style.cssText = `left:${Y.dusunce.x}px;top:${Y.dusunce.y}px;--cap:${Y.balonCap}px`;
    dusunce.classList.toggle('sol', !Y.dikey);
    arkadasYerles();
    bitirDugme.style.cssText = Y.dikey ? `left:50%;top:${gv.ust + 74}px` : `left:${(Y.dolap.x + Y.dolap.w * 0.92 + Y.kapi.x) / 2}px;top:${gv.ust + 10}px`;
  };
  const arkadasYerles = () => {
    oturum.cozulen.forEach((d, i) => {
      const a = arkadaslar[d];
      const m = Y.minder[i];
      if (!a || !m) return;
      const w = Arkadas.en(d, Y.mino.w, m.olcek);
      const f = Arkadas.figur(d);
      a.el.style.cssText = `left:${m.x - w / 2}px;top:${m.taban - w * f.taban}px;width:${w}px;height:${w}px;z-index:${i < 2 ? 2 : 4}`;
    });
  };
  const ro = new ResizeObserver(() => yerlesim());
  ro.observe(el);

  // ------------------------------------------------------------ durum
  const adim = (a: string) => (el.dataset.adim = a);
  const kapiDurum = () => {
    el.dataset.secili = oturum.secili ?? '';
    el.dataset.alet = parcaAleti(oturum.giyili.alet) ?? '';
    sepet.bosalt(parcaAleti(oturum.giyili.alet));
    for (const b of gozler) b.classList.toggle('bos', Object.values(oturum.giyili).includes(b.dataset.parca as ParcaId));
    el.classList.toggle('parti', oturum.parti);
    for (const d of DERTLER) balonlar[d].classList.toggle('secili', oturum.secili === d);
  };
  kapiDurum();

  // ------------------------------------------------------------ ipucu merdiveni (geç ve dolaylı)
  let sonDokunus = performance.now();
  let ipucuAdim = 0;
  const hedef = (): HTMLElement[] => {
    if (oturum.parti) return [];
    if (!oturum.secili) return DERTLER.filter((d) => !oturum.cozulen.includes(d)).map((d) => balonlar[d]);
    if (!oturum.giyili.alet) return Object.values(sepet.dugme);
    return [kapi];
  };
  const ipucu = window.setInterval(() => {
    const t = (performance.now() - sonDokunus) / 1000;
    const hs = hedef();
    if (!hs.length || TEST_MODU) return;
    if (ipucuAdim === 0 && t > IP[0]) {
      ipucuAdim = 1;
      // 1: arkadaş(lar) kendi sesiyle hatırlatır, balon kıpırdar (bakış)
      if (oturum.secili) derdinSesi(oturum.secili);
      else for (const [i, b] of hs.entries()) sonra(i * 260, () => void hopla(b, 0.5, 420));
    } else if (ipucuAdim === 1 && t > IP[1]) {
      ipucuAdim = 2;
      // 2: Mino o yana bakar, durumu bir kez daha anlatır
      const r = hs[0].getBoundingClientRect();
      const mr = mino.mino.el.getBoundingClientRect();
      mino.mino.bak(r.left + r.width / 2 > mr.left + mr.width / 2 ? 1 : -1);
      sonra(1600, () => mino.mino.bak(0));
      if (!oturum.secili) void minoSoyle(M.kime);
      else if (!oturum.giyili.alet) void minoSoyle(M.dert[oturum.secili][g]);
      else derdinSesi(oturum.secili);
    } else if (ipucuAdim === 2 && t > IP[2]) {
      ipucuAdim = 3;
      // 3: ilk parlama, hedef hafifçe sallanır
      for (const b of hs) {
        b.classList.add('parla');
        void salla(b);
      }
      sonra(1600, () => hs.forEach((b) => b.classList.remove('parla')));
    } else if (ipucuAdim === 3 && t > IP[3]) {
      ipucuAdim = 4;
      // 4: parmak en son
      parmakGoster(hs[0]);
    } else if (ipucuAdim === 4 && t > IP[3] + 20) {
      ipucuAdim = 2;
      sonDokunus = performance.now() - IP[1] * 1000;
    }
  }, 500);
  const parmakGoster = (b: HTMLElement) => {
    const k = kutu(b, el);
    parmak.style.cssText = `left:${k.x + k.w / 2}px;top:${k.y + k.h / 2}px`;
    parmak.classList.remove('acik');
    void parmak.offsetWidth;
    parmak.classList.add('acik');
  };
  el.addEventListener(
    'pointerdown',
    () => {
      sonDokunus = performance.now();
      ipucuAdim = 0;
      parmak.classList.remove('acik');
    },
    { capture: true },
  );

  // ------------------------------------------------------------ kostüm: fırlat, yakala
  let kuyruk: Promise<unknown> = Promise.resolve();
  /** Parçalar sıraya girer (dokunuş kilitlenmez); bir adım hata verirse sıra durmaz */
  const sirada = (fn: () => Promise<void>) => {
    kuyruk = kuyruk.then(fn).catch((e) => console.error('mino-giysin sıra', e));
  };
  let sonTakim: Takim = takimAdi(oturum.giyili);
  let ayniParca: { id: ParcaId | null; kez: number } = { id: null, kez: 0 };
  let tavanda: { id: ParcaId; el: HTMLElement } | null = null;
  const minoKutu = () => kutu(mino.mino.el, el);
  const gozBul = (id: ParcaId) => gozler.find((b) => b.dataset.parca === id);
  const kaynakNokta = (id: ParcaId): { n: Nokta; en: number } => {
    const a = parcaAleti(id);
    const k = a ? kutu(sepet.resim[a], el) : kutu(gozBul(id)!.querySelector('img')!, el);
    return { n: { x: k.x + k.w / 2, y: k.y + k.h / 2 }, en: Math.max(k.w, k.h) };
  };
  /** Eski parça nereye düşer: dolaptaki gözüne (alet sepete), %25 odadaki bir arkadaşın kafasına */
  const atilanaYer = (eski: ParcaId, cikis: Nokta, boy: { w: number; h: number }) => {
    const p = parca(eski);
    const odadakiler = oturum.cozulen.filter((d) => arkadaslar[d]);
    const ne = p.yer === 'bas' ? sapkaNereye(odadakiler, TEST_MODU && new URLSearchParams(location.search).has('sapkaKafaya') ? 0.01 : Math.random()) : 'dolap';
    ses.firlat();
    if (ne !== 'dolap') {
      const a = arkadaslar[ne]!;
      const ak = kutu(a.el, el);
      const f = Arkadas.figur(ne);
      const kafa = { x: ak.x + ak.w / 2, y: ak.y + ak.w * f.tepe + boy.h * 0.25 * 0.6 };
      void parcaUcur(ucus, eski, cikis, kafa, boy, 0.6, 700).then(async () => {
        // arkadaşın kafasında kalır, gülüşürler, sonra arkadaş şapkayı dolaba geri atar
        const sap = h('img.mg-kafada', { src: parcaResmi(eski), alt: '', 'data-parca': eski, style: `left:${kafa.x}px;top:${kafa.y}px;width:${boy.w * 0.6}px;height:${boy.h * 0.6}px` });
        ucus.append(sap);
        el.dataset.surpriz = 'sapka';
        a.ifade(ne === 'ege' ? 'kahkaha' : ne === 'kino' ? 'heyecan' : 'mutlu', 1800);
        void a.hopla(0.6);
        ses.kikir();
        if (ne === 'kino') void kinoSoyle(G.kino.sapkan);
        await bekle(1700);
        sap.remove();
        const hedefG = gozBul(eski)!;
        const k = kutu(hedefG, el);
        await parcaUcur(ucus, eski, kafa, { x: k.x + k.w / 2, y: k.y + k.h / 2 }, { w: boy.w * 0.6, h: boy.h * 0.6 }, Math.min(1, k.w / (boy.w * 0.6)), 600);
        kapiDurum();
      });
      return;
    }
    const a = parcaAleti(eski);
    const k = a ? kutu(sepet.resim[a], el) : kutu(gozBul(eski)!, el);
    // omzun üstünden geriye: önce yukarı, sonra dolaba
    void parcaUcur(ucus, eski, cikis, { x: k.x + k.w / 2, y: k.y + k.h / 2 }, boy, Math.min(1, Math.max(k.w, k.h) / Math.max(boy.w, boy.h)), 640).then(kapiDurum);
  };

  const giydir = (id: ParcaId, kaynak?: { n: Nokta; en: number }) => {
    // parça hemen dolaptan / sepetten kalkar (yeri boş), sıra gelince uçar
    const k = kaynak ?? kaynakNokta(id);
    const g0 = gozBul(id);
    g0?.classList.add('bos');
    if (parcaAleti(id)) sepet.bosalt(parcaAleti(id));
    sirada(async () => {
      const eski = await mino.giy(id, k.n, k.en, el, ucus, atilanaYer);
      oturum.giyili = { ...mino.giyili };
      kapiDurum();
      if (eski && !oturum.parti) {
        oturum.degisimSira++;
        if (oturum.degisimSira % 2 === 1) void minoSoyle(M.degisim[Math.floor(oturum.degisimSira / 2) % M.degisim.length]);
      }
      await sonrasi(id);
    });
  };

  /** Parça oturunca: ıslak şaka, takım (ayna), parti alkışı, üst üste aynı parça */
  const sonrasi = async (id: ParcaId) => {
    if (id === 'alet-bahce' && !oturum.suSakasi) {
      oturum.suSakasi = true;
      await islakSaka();
    }
    if (oturum.parti) {
      ayniParca = ayniSayac(ayniParca, id);
      partiAlkis(Object.values(arkadaslar) as Arkadas[]);
      if (ayniParca.kez >= 5) {
        ayniParca = { id: null, kez: 0 };
        void minoSoyle(M.yeter);
        mino.mino.tepki('hayir');
        await bekle(500);
        const yer = parca(id).yer;
        const k = mino.yerKutusu(id, el);
        mino.cikar(yer);
        oturum.giyili = { ...mino.giyili };
        kapiDurum();
        gozBul(id)?.classList.add('bos');
        tavanda = { id, el: await tavanaAt(ucus, id, { x: k.x, y: k.y }, { w: k.w, h: k.h }, el.clientWidth) };
        tavanda.el.addEventListener('click', () => tavandanDus(), { once: true });
        return;
      }
    }
    const t = takimAdi(oturum.giyili);
    if (t !== sonTakim && t !== 'eksik') {
      sonTakim = t;
      await aynaAni(t);
    } else sonTakim = t;
    if (oturum.parti) {
      const ak = kutu(ayna, el);
      const mk = minoKutu();
      mino.mino.bak(ak.x > mk.x + mk.w / 2 ? 1 : -1);
      mino.mino.tepki('sevinc');
      sonra(900, () => mino.mino.bak(0));
    }
  };
  const tavandanDus = async () => {
    if (!tavanda) return;
    const { id, el: t } = tavanda;
    tavanda = null;
    const a = kutu(t, el);
    t.remove();
    const k = kutu(gozBul(id)!, el);
    await parcaUcur(ucus, id, { x: a.x + a.w / 2, y: a.y + a.h / 2 }, { x: k.x + k.w / 2, y: k.y + k.h / 2 }, { w: a.w, h: a.h }, Math.min(1, k.w / a.w), 520);
    kapiDurum();
  };

  /** Takım tamamlanınca aynaya döner: tam takımda rolünü söyler, karışıkta güler */
  const aynaAni = async (t: Takim) => {
    const ak = kutu(ayna, el);
    const mk = minoKutu();
    const dx = Math.max(-80, Math.min(80, (ak.x + ak.w / 2 - (mk.x + mk.w / 2)) * 0.35));
    aynaParilti.classList.remove('acik');
    void aynaParilti.offsetWidth;
    aynaParilti.classList.add('acik');
    ses.parilti();
    if (t.startsWith('tam:')) void minoSoyle(M.tam[t.slice(4) as keyof typeof M.tam]);
    else {
      void minoSoyle(M.karisik[oturum.karisikSira % M.karisik.length]);
      oturum.karisikSira++;
    }
    await mino.aynayaBak(dx);
  };

  /** Islak şaka (Mino sudan hoşlanmaz): kabın ağzından bir damla burnuna; irkilir, geri atmaya kalkar, vazgeçer */
  const islakSaka = async () => {
    const k = mino.yerKutusu('alet-bahce', el);
    const burun = mino.nokta(1024, 915, el);
    const damla = h('i.mg-damla', { style: `left:0;top:0` });
    ucus.append(damla);
    ses.damla();
    await kavis(damla, { x: k.x - k.w * 0.4, y: k.y - k.h * 0.3 }, burun, 420, { tepe: -60 });
    damla.remove();
    void mino.mino.ifade('saskin', 1400);
    mino.mino.tepki('sasir');
    void minoSoyle(M.su);
    await bekle(900);
    // kabı bir an tutup geri fırlatmaya kalkar (bütün gövde geri çekilir), sonra vazgeçip güler
    await oynat(mino.ic, [{ transform: 'translate(0,0) scale(1,1)' }, { transform: 'translate(8px, 2px) scale(1.05, 0.95)', offset: 0.6 }, { transform: 'translate(0,0) scale(1,1)' }], 600);
    mino.mino.tepki('gidik', 1.2);
    await minoSoyle(M.su_tamam);
  };

  // dolap gözleri: dokun ya da Mino'ya fırlat; boş göze dokunmak giyili parçayı geri getirir
  const surukleBagla = (b: HTMLElement, id: ParcaId) => {
    surukle(b, {
      kap: el,
      katman: ucus,
      resim: () => {
        if (b.classList.contains('bos')) return null;
        const r = (parcaAleti(id) ? sepet.resim[parcaAleti(id)!] : b.querySelector('img')!).getBoundingClientRect();
        return { src: ikonResmi(id), en: r.width, boy: r.height };
      },
      basla: () => {
        if (parcaAleti(id)) sepet.resim[parcaAleti(id)!].classList.add('elde');
        else b.classList.add('bos');
      },
      tik: () => {
        if (b.classList.contains('bos')) return geriAl(id);
        efektSecim(b);
        giydir(id);
      },
      birak: ({ n, vx, vy, hayalet }) => {
        const mk = minoKutu();
        const mc = { x: mk.x + mk.w / 2, y: mk.y + mk.h / 2 };
        // Mino'nun üstüne bırakıldı ya da ona doğru fırlatıldı (hız Mino'ya dönük)
        const yon = (mc.x - n.x) * vx + (mc.y - n.y) * vy;
        const hizli = Math.hypot(vx, vy) > 0.5 && yon > 0;
        const hr = hayalet.getBoundingClientRect();
        hayalet.remove();
        if (icinde(n, mk, 30) || hizli) giydir(id, { n, en: Math.max(hr.width, hr.height) });
        else {
          // Mino'dan uzağa bırakıldı: yerine geri seker
          const k = kaynakNokta(id);
          void parcaUcur(ucus, id, n, k.n, { w: hr.width, h: hr.height }, 1, 320).then(kapiDurum);
        }
      },
    });
  };
  const efektSecim = (b: HTMLElement) => void hopla(b.querySelector('img') ?? b, 0.5, 300);
  /** Giyili parçayı çıkarıp yerine (dolap / sepet) geri yollar */
  const geriAl = (id: ParcaId) => {
    const yer = parca(id).yer;
    if (oturum.giyili[yer] !== id) return;
    sirada(async () => {
      const k = mino.yerKutusu(id, el);
      mino.cikar(yer);
      oturum.giyili = cikar(oturum.giyili, id);
      sonTakim = takimAdi(oturum.giyili);
      mino.mino.tepki('evet', 0.6);
      atilanaYer(id, { x: k.x, y: k.y }, { w: k.w, h: k.h });
      kapiDurum();
      // atılan parça uçarken yeri boş görünsün, varınca dolar (atilanaYer → kapiDurum)
      gozBul(id)?.classList.add('bos');
      if (parcaAleti(id)) sepet.resim[parcaAleti(id)!].classList.add('elde');
    });
  };
  gozler.forEach((b) => surukleBagla(b, b.dataset.parca as ParcaId));
  for (const a of Object.keys(sepet.dugme) as (keyof typeof sepet.dugme)[]) {
    const b = sepet.dugme[a];
    surukleBagla(b, Sepet.parca(a));
  }
  // sepetin gövdesine hızlı üç dokunuş: banyo ördeği (gizli sürpriz 1)
  const sepetDokunus: number[] = [];
  sepet.govde.addEventListener('click', () => {
    sepetDokunus.push(performance.now());
    if (sepetDokunus.length > 3) sepetDokunus.shift();
    if (sepetDokunus.length === 3 && sepetDokunus[2] - sepetDokunus[0] <= 900) {
      sepetDokunus.length = 0;
      void ordekSurprizi();
    } else void hopla(sepet.govde, 0.3, 260);
  });
  const ordekSurprizi = async () => {
    const k = kutu(sepet.govde, el);
    const o = h('img.mg-ordek', { src: gorsel('banyo/ordek'), alt: '', 'data-surpriz': 'ordek', style: `width:${k.w * 0.55}px;height:${k.w * 0.5}px` });
    ucus.append(o);
    el.dataset.surpriz = 'ordek';
    ses.vak();
    const a = { x: k.x + k.w / 2, y: k.y + k.h * 0.3 };
    await kavis(o, a, { x: a.x - k.w * 0.4, y: a.y - k.h * 0.9 }, 520, { tepe: -40 });
    void mino.mino.ifade('saskin', 1300);
    mino.mino.tepki('sasir');
    void minoSoyle(M.banyo_yok);
    await bekle(900);
    await kavis(o, { x: a.x - k.w * 0.4, y: a.y - k.h * 0.9 }, a, 420, { tepe: -50, s1: 0.4 });
    o.remove();
  };

  // ayna: Mino aynaya poz verir, sonra kendine dil çıkarır (gizli sürpriz 2)
  ayna.addEventListener('click', async () => {
    el.dataset.surpriz = 'ayna';
    const ak = kutu(ayna, el);
    const mk = minoKutu();
    aynaParilti.classList.remove('acik');
    void aynaParilti.offsetWidth;
    aynaParilti.classList.add('acik');
    ses.parilti();
    const dx = Math.max(-80, Math.min(80, (ak.x + ak.w / 2 - (mk.x + mk.w / 2)) * 0.35));
    void mino.aynayaBak(dx);
    sonra(700, () => void mino.mino.ifade('odak', 1100));
  });

  // Mino'ya dokunmak: kuyruk mırlar, göbek gıdıklanır (gizli sürpriz 3), kafa "evet", ayak zıplar
  mino.mino.el.addEventListener('click', (e) => {
    const b = mino.mino.bolge(e.clientX, e.clientY);
    if (b === 'kuyruk') {
      mino.mino.tepki('mir');
      el.dataset.surpriz = 'mir';
    } else if (b === 'gobek') {
      mino.mino.tepki('gidik');
      ses.kikir();
      el.dataset.surpriz = 'gidik';
    } else if (b === 'ayak') mino.mino.tepki('zipla');
    else mino.mino.tepki('evet');
  });

  // ------------------------------------------------------------ yardım balonları: önce kime?
  const balonSec = async (d: Dert) => {
    if (oturum.parti || oturum.cozulen.includes(d)) {
      void hopla(balonlar[d], 0.5, 300);
      return;
    }
    if (dertKilitli(d)) {
      await kilitliIcerik(app.kok);
      if (dertKilitli(d)) return;
      balonlar[d].classList.remove('kilitli');
      balonlar[d].querySelector('.mg-yardim-kilit')?.remove();
    }
    const eskiR = balonlar[d].getBoundingClientRect();
    const onceki = oturum.secili;
    oturum.secili = d;
    kapiDurum();
    // seçilen balon düşünce balonuna uçar (FLIP), öncekisi yerine döner
    const ucur = (x: Dert, r0: DOMRect) => {
      yerlesim();
      const r1 = balonlar[x].getBoundingClientRect();
      void oynat(balonlar[x], [{ transform: `translate(${r0.left - r1.left}px, ${r0.top - r1.top}px) scale(${r0.width / r1.width})` }, { transform: 'translate(0,0) scale(1)' }], 520, { easing: 'cubic-bezier(.3,1.3,.5,1)' });
    };
    if (onceki && onceki !== d) ucur(onceki, balonlar[onceki].getBoundingClientRect());
    ucur(d, eskiR);
    ses.pit(DERTLER.indexOf(d));
    adim('secili');
    derdinSesi(d);
    const yz = yuzler[d]!;
    void yz.hopla(0.6);
    await bekle(d === 'kino' ? 900 : 500);
    void minoSoyle(M.dert[d][g]);
    mino.mino.tepki(g === '56' ? 'sasir' : 'kararsiz', 1.2);
  };
  for (const d of DERTLER) balonlar[d].addEventListener('click', () => void balonSec(d));

  // ------------------------------------------------------------ kapı
  let cikiyor = false;
  kapi.addEventListener('click', async () => {
    if (cikiyor) return;
    if (oturum.parti) {
      void hopla(kapi, 0.3, 300);
      mino.mino.tepki('selam');
      return;
    }
    if (!oturum.giyili.alet) {
      // boş patilerine bakar: şaka, ipucu değil
      void mino.mino.ifade('saskin', 1200);
      mino.mino.tepki('kararsiz', 1.6);
      void minoSoyle(M.bos);
      return;
    }
    if (!oturum.secili) {
      mino.mino.tepki('kararsiz', 1.4);
      void minoSoyle(M.kime);
      for (const [i, d] of DERTLER.entries()) if (!oturum.cozulen.includes(d)) sonra(i * 180, () => void hopla(balonlar[d], 0.6, 380));
      return;
    }
    cikiyor = true;
    adim('cikis');
    const d = oturum.secili;
    void oynat(kapiKanat, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.18)' }], 380, { fill: 'forwards', easing: 'cubic-bezier(.4,0,.2,1)' });
    ses.pit(4);
    // Mino koşarak çıkar: kapıya doğru sekerek gider ve küçülerek kapıdan geçer
    const kk = kutu(kapi, el);
    const mk = minoKutu();
    const dx = kk.x + kk.w / 2 - (mk.x + mk.w / 2);
    mino.mino.tepki('sevinc');
    await oynat(
      mino.ic,
      [
        { transform: 'translate(0,0) scale(1,1)' },
        { transform: `translate(${dx * 0.33}px,-16px) scale(0.96,1.04)`, offset: 0.25 },
        { transform: `translate(${dx * 0.55}px,0) scale(1.04,0.96)`, offset: 0.45 },
        { transform: `translate(${dx * 0.8}px,-14px) scale(0.86,0.9)`, offset: 0.7 },
        { transform: `translate(${dx}px,-${mk.h * 0.12}px) scale(0.6,0.62)`, opacity: 0 },
      ],
      900,
      { fill: 'forwards' },
    );
    app.git('dert', { dert: d });
  });

  // ------------------------------------------------------------ parti
  bitirDugme.addEventListener('click', async () => {
    if (cikiyor) return;
    cikiyor = true;
    adim('gecit');
    await gecit(mino, Object.values(arkadaslar) as Arkadas[], el);
    // arkadaşlar el sallayıp gider, yeni tur: balonlar yine dertli
    for (const a of Object.values(arkadaslar) as Arkadas[]) {
      void a.hopla(0.6);
      void oynat(a.el, [{ opacity: 1 }, { opacity: 0 }], 700, { fill: 'forwards', delay: ms(600) });
    }
    await bekle(1400);
    oturumuSifirla();
    app.git('oda', {});
  });

  // ------------------------------------------------------------ açılış
  const acilis = async () => {
    yerlesim();
    // Mino dolabın önünde kuyruğunu sallar; balonlar sırayla "pıt" diye açılır, arkadaşların sesleri tek tek duyulur
    const acik = DERTLER.filter((d) => !oturum.cozulen.includes(d));
    for (const d of DERTLER) balonlar[d].classList.add('gizli');
    if (param?.gelen && arkadaslar[param.gelen]) {
      // arkadaş kapıdan gelir, minderine kayıp oturur
      const a = arkadaslar[param.gelen]!;
      const kk = kutu(kapi, el);
      const ak = kutu(a.el, el);
      adim('geliyor');
      await bekle(150);
      await oynat(a.el, [{ transform: `translate(${kk.x + kk.w / 2 - (ak.x + ak.w / 2)}px, ${-ak.h * 0.05}px) scale(0.7)`, opacity: 0 }, { transform: `translate(${(kk.x - ak.x) * 0.4}px, -12px) scale(0.9)`, opacity: 1, offset: 0.5 }, { transform: 'translate(0,0) scale(1)', opacity: 1 }], 900);
      void a.hopla(0.8);
      ses.hop();
    }
    if (oturum.parti) {
      adim('parti');
      kapiDurum();
      return;
    }
    if (partiAcik(oturum.cozulen, acikDertler())) {
      oturum.parti = true;
      oturum.secili = null;
      kapiDurum();
      yerlesim();
      adim('parti');
      void minoSoyle(M.parti);
      mino.mino.tepki('dans');
      partiAlkis(Object.values(arkadaslar) as Arkadas[]);
      return;
    }
    mino.mino.tepki('mir', 1.6);
    for (const [i, d] of DERTLER.entries()) {
      sonra(250 + i * 420, () => {
        balonlar[d].classList.remove('gizli');
        void oynat(balonlar[d], [{ transform: 'scale(0.2)', opacity: 0 }, { transform: 'scale(1.12)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)', opacity: 1 }], 380, { easing: 'cubic-bezier(.3,1.4,.5,1)' });
        ses.pit(i);
        if (acik.includes(d) && !param?.gelen) derdinSesi(d);
      });
    }
    sonra(250 + 4 * 420 + 300, () => {
      adim(oturum.secili ? 'secili' : 'balon');
      if (!param?.gelen && !oturum.secili) void minoSoyle([M.acilis, M.kime]);
      else if (param?.gelen) void minoSoyle(M.kime);
    });
  };
  requestAnimationFrame(() => void acilis());

  return {
    el,
    kapat: () => {
      ro.disconnect();
      clearInterval(ipucu);
      zamanlar.forEach(clearTimeout);
      mino.kapat();
      for (const a of [...Object.values(arkadaslar), ...Object.values(yuzler)]) a?.kapat();
    },
  };
}

/** Telefonun güvenli alanı (env(safe-area-inset-*)) px; ölçü kutusu ekrana bir kez eklenir */
function guvenli(el: HTMLElement) {
  let o = el.querySelector<HTMLElement>(':scope > .mg-guvenli-olc');
  if (!o) {
    o = h('div.mg-guvenli-olc', { 'aria-hidden': 'true' });
    el.append(o);
  }
  const r = el.getBoundingClientRect();
  const g = o.getBoundingClientRect();
  if (!r.width || !g.width) return { ust: 0, sag: 0, alt: 0, sol: 0 };
  return { ust: g.top - r.top, sag: r.right - g.right, alt: r.bottom - g.bottom, sol: g.left - r.left };
}

function yaz(e: HTMLElement, k: Kutu) {
  e.style.left = `${k.x}px`;
  e.style.top = `${k.y}px`;
  e.style.width = `${k.w}px`;
  e.style.height = `${k.h}px`;
}

/**
 * Kostüm ölçü sayfası (?test=1&ekran=onizleme): dört tam takım Mino yan yana (kostum-yer.json'u denetlemek için).
 * &kart=1: menü kartı için tek Mino (itfaiyeci: kask, yelek, merdiven), şeffaf zeminde (ekip/giysin/kart-mino.cjs);
 */
export function onizlemeEkrani(): Ekran {
  const q = new URLSearchParams(location.search);
  if (q.has('kart')) {
    const m = new KostumluMino({ bas: 'bas-itfaiye', ust: 'ust-itfaiye', alet: 'alet-itfaiye' });
    m.mino.tepki = () => undefined;
    const el = h('div.mg-onizleme.kart', {}, h('div.mg-onizleme-hucre', {}, m.el));
    return { el, kapat: () => m.kapat() };
  }
  const minolar = ROLLER.map((r) => new KostumluMino({ bas: `bas-${r}`, ust: `ust-${r}`, alet: `alet-${r}` }));
  const el = h('div.mg-onizleme', {}, ...minolar.map((m) => h('div.mg-onizleme-hucre', {}, m.el)));
  void parcaKostum;
  return { el, kapat: () => minolar.forEach((m) => m.kapat()) };
}
