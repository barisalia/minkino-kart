/**
 * Vaka 2'nin bahçesi (assets/dedektif2/bahce-*.webp, 16:9): çamaşır ipi köşesi, çalılı yol, gölet kenarı. Odalar
 * dunya.ts kalıbında (dünya birimi: yükseklik ODA_H, en resmin oranında); kamera ve geçişler dunya.ts → Dunya.
 *
 * Bahçe tek resim: uzak katman yok; derinliği rüzgârın yaprakları verir (yalnız transform). Gölette üç büyük çalı
 * resmin kendisinden kırpılmış kopyadır (aynı resim, aynı ölçek: kusursuz üst üste); dokununca kopya hafifçe kabarır
 * (hep ≥ 1 ölçek: altındaki boyalı çalı görünmez), üçüncü çalı ikiye ayrılıp aralanır (arkasında Vakvak Anne).
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET, esya, ipucuEl, katman, type Oda } from './dunya';
import { ODA_H, odaW, type IpucuTanim } from './mantik';
import { BAHCE_DIKEY, BAHCELER, bahceYerlesim, CALILAR, GOLET_PARCALARI, IP, YOL_PARCALARI, type BahceId, type Cali, type Parca } from './mantik2';
import { resim } from './resimler';

const px = (v: number) => `${v.toFixed(1)}px`;
const zeminUrl = (id: BahceId) => (BAHCE_DIKEY[id] && resim(`v2/${id}-dikey`)) || resim(`v2/${id}`) || '';

/**
 * Bahçenin yerleşimini seçer (odalar kurulmadan önce): dikey ekranda (boy > en) 9:16 çizimi olan her bölüm dikey,
 * çizimi olmayan yatay kalır (mantik2.ts → bahceYerlesim).
 */
export function bahceKur() {
  const dikeyEkran = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
  for (const id of BAHCELER) bahceYerlesim(id, dikeyEkran && !!resim(`v2/${id}-dikey`));
}

/** Renk izi parçası (iplik, mavi ip, yaprak): dokunulabilir */
function parcaEl(p: Parca, i: number, W: number): HTMLElement {
  const ad = p.tur === 'kirmizi' ? 'v2/iplik-kirmizi' : p.tur === 'mavi' ? 'v2/ip-mavi' : 'v2/yaprak';
  return h(
    `button.dd-parca.dd-parca-${p.tur}`,
    { type: 'button', 'aria-label': p.tur === 'kirmizi' ? 'Kırmızı iplik' : p.tur === 'mavi' ? 'Mavi ip' : 'Yaprak', 'data-parca': String(i), 'data-tur': p.tur, style: `left:${px(p.x * W)};top:${px(p.y * ODA_H)};height:${px(p.h * ODA_H)};--don:${p.don}deg;--i:${i}` },
    h('img', { src: resim(ad) ?? '', alt: '', draggable: 'false' }),
  );
}

/**
 * Çalının kırpım çokgeni (kutunun yüzdesi): çalının içinde kalan yuvarlak bir biçim (süperelips; kenarı çalının
 * konturunun biraz içinde: kırpımda çalının arkasındaki gök / çimen yok, kopya oynayınca ardında yabancı parça görünmez).
 * Yarımlar: ortadan dalgalı bir çizgiyle sol / sağ.
 */
export function caliKirpimi(yarim?: 'sol' | 'sag'): string {
  const n = 2.3;
  const nokta = (a: number): [number, number] => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    return [50 + 42 * Math.sign(c) * Math.abs(c) ** (2 / n), 54 + 40 * Math.sign(s) * Math.abs(s) ** (2 / n)];
  };
  const adim = 40;
  const l: [number, number][] = [];
  if (!yarim) for (let i = 0; i < adim; i++) l.push(nokta((i / adim) * Math.PI * 2));
  else {
    // kenar: üstten (−90°) sola ya da sağa, alta (90°); sonra dalgalı orta çizgiyle yukarı
    const yon = yarim === 'sol' ? -1 : 1;
    for (let i = 0; i <= adim / 2; i++) l.push(nokta(-Math.PI / 2 + yon * (i / (adim / 2)) * Math.PI));
    for (const [x, y] of [
      [49, 94],
      [53, 74],
      [47, 52],
      [53, 31],
      [50, 14],
    ] as [number, number][])
      l.push([x, y]);
  }
  return l.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(', ');
}

/** Çalının resimden kırpılmış kopyası (kutusu oda oranında); yarim: 'sol' / 'sag' yarısı */
export function caliKopya(c: Cali, W: number, url: string, yarim?: 'sol' | 'sag'): HTMLElement {
  const pay = 0.012;
  const x0 = (c.x0 - pay) * W;
  const y0 = (c.y0 - pay * 1.6) * ODA_H;
  const w = (c.x1 - c.x0 + pay * 2) * W;
  const hh = (c.y1 - c.y0 + pay * 2.6) * ODA_H;
  const kirp = `polygon(${caliKirpimi(yarim)})`;
  const ic = h('i.dd-cali-resim', {
    style: `background-image:url("${url}");background-size:${px(W)} ${px(ODA_H)};background-position:${px(-x0)} ${px(-y0)}`,
  });
  return h(
    `div.dd-cali-kopya${yarim ? '.dd-cali-' + yarim : ''}`,
    { style: `left:${px(x0)};top:${px(y0)};width:${px(w)};height:${px(hh)};--kirp:${kirp}` },
    ic,
  );
}

/** Çamaşır ipi köşesi: ipte iki açık mandal (sallanır), çimde düşen mandal (ipucu), anı katmanı (atkı uçar) */
export function bahceIp(ipuclari: IpucuTanim[]): Oda {
  const id: BahceId = 'bahce-ip';
  const W = odaW(id);
  const e: Record<string, HTMLElement> = {};
  const mandallar = IP.mandallar.map((m, i) =>
    h('div.dd-mandal-asili', { style: `left:${px(m.x * W)};top:${px(m.y * ODA_H)};height:${px(m.h * ODA_H)};--don:${m.don}deg;--i:${i}` }, h('img', { src: resim('v2/mandal') ?? '', alt: '', draggable: 'false' })),
  );
  e.mandallar = h('div.dd-mandallar', {}, ...mandallar);
  for (const t of ipuclari) e[`ipucu-${t.id}`] = ipucuEl(t, W);
  const a = IP.atki;
  e.ani = h('div.dd-ani.dd-ani-bahce.bt-yok', {}, esya('v2/atki-asili', { x: a.x, y: IP.bos.y - a.h * 0.07 + a.h, h: a.h }, 'dd-ani-atki', W));
  e.yapraklar = h('div.dd-yapraklar.bt-yok');
  e.ip = h('div.dd-ip-isik.bt-yok');
  const el = h(
    'div.dd-dunya.dd-bahce',
    { 'data-oda': id, style: `width:${px(W)};height:${px(ODA_H)}` },
    katman('dd-k-tek', 0, h('img.dd-zemin', { src: zeminUrl(id), alt: '', draggable: 'false' }), e.mandallar, ...ipuclari.map((t) => e[`ipucu-${t.id}`])).el,
    e.ani,
    e.ip,
    e.yapraklar,
  );
  return { id, el, W, katmanlar: [], e };
}

/** Çalılı yol: çamurda ördek izleri ve kırmızı iplik (ipuçları); iki iz yolu (renk izi); Ada'nın yeri */
export function bahceYol(ipuclari: IpucuTanim[], ada: HTMLElement): Oda {
  const id: BahceId = 'bahce-yol';
  const W = odaW(id);
  const e: Record<string, HTMLElement> = {};
  for (const t of ipuclari) e[`ipucu-${t.id}`] = ipucuEl(t, W);
  const parcalar = YOL_PARCALARI.map((p, i) => parcaEl(p, i, W));
  e.parcalar = h('div.dd-parcalar', {}, ...parcalar);
  e.yapraklar = h('div.dd-yapraklar.bt-yok');
  e.ada = ada;
  const el = h(
    'div.dd-dunya.dd-bahce',
    { 'data-oda': id, style: `width:${px(W)};height:${px(ODA_H)}` },
    katman('dd-k-tek', 0, h('img.dd-zemin', { src: zeminUrl(id), alt: '', draggable: 'false' }), ada, ...ipuclari.map((t) => e[`ipucu-${t.id}`]), e.parcalar).el,
    e.yapraklar,
  );
  return { id, el, W, katmanlar: [], e };
}

/** Gölet kenarı: üç çalı (dokun-dinle), kırmızı izin sonu, yuva katmanı (Vakvak Anne, yumurtalar) */
export function bahceGolet(yuva: HTMLElement): Oda {
  const id: BahceId = 'bahce-golet';
  const W = odaW(id);
  const url = zeminUrl(id);
  const e: Record<string, HTMLElement> = {};
  const calilar = CALILAR.map((c, i) => {
    const b = h('button.dd-cali', { type: 'button', 'aria-label': `Çalı ${i + 1}`, 'data-cali': String(i), 'data-ses': c.ses }, caliKopya(c, W, url));
    e[`cali-${i}`] = b;
    return b;
  });
  // üçüncü çalının iki yarısı (aralanınca): başta gizli, kopyanın yerine geçer
  const c3 = CALILAR[2];
  e.yarimSol = caliKopya(c3, W, url, 'sol');
  e.yarimSag = caliKopya(c3, W, url, 'sag');
  e.yarimlar = h('div.dd-cali-yarimlar', {}, e.yarimSol, e.yarimSag);
  e.son = h('div.dd-parcalar.dd-parcalar-son', {}, ...GOLET_PARCALARI.map((p, i) => parcaEl(p, i, W)));
  e.yuva = yuva;
  e.yapraklar = h('div.dd-yapraklar.bt-yok');
  const el = h(
    'div.dd-dunya.dd-bahce',
    { 'data-oda': id, style: `width:${px(W)};height:${px(ODA_H)}` },
    katman('dd-k-tek', 0, h('img.dd-zemin', { src: url, alt: '', draggable: 'false' }), e.son, yuva, ...calilar, e.yarimlar).el,
    e.yapraklar,
  );
  return { id, el, W, katmanlar: [], e };
}

/**
 * Rüzgâr: yapraklar odanın solundan sağına süzülür (dünyada: kamera kayınca onlar da kayar). esinti: ara ara tek
 * yaprak; ruzgar(): bir anda bir sürü. Yalnız transform / opacity. Test ve "az hareket" modunda yaprak yok.
 */
export class Ruzgar {
  private z = 0;
  private kapali = false;
  private oda: Oda | null = null;
  private sik = 0;

  /** Bu odada esinti (sık: saniyede yaklaşık kaç yaprak; 0 durur) */
  es(oda: Oda | null, sik: number) {
    this.oda = oda;
    this.sik = sik;
    clearTimeout(this.z);
    if (!oda || !sik || this.kapali || AZ_HAREKET || TEST_MODU) return;
    const dongu = () => {
      if (this.kapali || this.oda !== oda) return;
      this.yaprak(oda, 1);
      this.z = window.setTimeout(dongu, (700 + Math.random() * 900) / this.sik);
    };
    this.z = window.setTimeout(dongu, 300);
  }

  /** Bir anda bir sürü yaprak (güç: adet çarpanı) */
  firtina(oda: Oda | null, adet = 10) {
    if (!oda || AZ_HAREKET || TEST_MODU) return;
    for (let i = 0; i < adet; i++) window.setTimeout(() => !this.kapali && this.yaprak(oda, 1.6), i * 70);
  }

  private yaprak(oda: Oda, hiz: number) {
    const kap = oda.e.yapraklar;
    if (!kap) return;
    const W = oda.W;
    const boy = 22 + Math.random() * 20;
    const y0 = (0.25 + Math.random() * 0.55) * ODA_H;
    const el = h('img.dd-yaprak', { src: resim('v2/yaprak') ?? '', alt: '', draggable: 'false', style: `height:${boy.toFixed(0)}px;top:${y0.toFixed(0)}px` });
    kap.append(el);
    const sn = (4200 + Math.random() * 2600) / hiz;
    const dalga = 40 + Math.random() * 60;
    const kf: Keyframe[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = -0.06 * W + t * 1.12 * W;
      const y = Math.sin(t * Math.PI * 2.2 + y0) * dalga + t * 90;
      // takla atar gibi döner (3B dönme; çizim esnemez)
      kf.push({ transform: `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px) rotate(${(t * 540 + y0).toFixed(0)}deg) rotateX(${(t * 900).toFixed(0)}deg)`, opacity: i === 0 || i === 8 ? 0 : 1 });
    }
    el.animate(kf, { duration: sure(sn), easing: 'linear' }).finished.then(
      () => el.remove(),
      () => el.remove(),
    );
  }

  kapat() {
    this.kapali = true;
    clearTimeout(this.z);
  }
}
