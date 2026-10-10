/**
 * Seri 2 eşyaları: Gemini çizimleri (ekip/illustrator/seri2-esya-isle.cjs ile kesilmiş, assets/film-seri2/esya/).
 * Diş fırçaları, macun tüpü ve kapağı, macun kulesi, kum saati, havlu, tabure, saksı, yastık.
 * Her görsel kendi oranında basılır (yalnız tek ölçek: ezilme yok); tutuş noktaları görselin pikselinde.
 * Kum saatinde görsel sabittir; akan kum kodla: üst haznenin kumu yukarıdan kırpılır (seviye iner), alt haznede
 * tepecik büyür, boyundan ince kum akar.
 */
import kumBilgi from '../../../assets/film-seri2/esya/kum-saati.json';

/** bölümde kullanılanlar (kum-saati.webp yalnız katmanların kaynağı; yastık ileride gece sahnesi için) */
const GORSEL: Record<string, string> = import.meta.glob<string>(
  '../../../assets/film-seri2/esya/{dis-fircasi-kino,dis-fircasi-lokum,havlu-kino,kum-saati-bos,kum-saati-ust-kum,kum-saati-alt-kum,macun-kapak,macun-kulesi,macun-tupu,saksi,tabure}.webp',
  { eager: true, query: '?url', import: 'default' },
);
const resimler: Record<string, HTMLImageElement> = {};
let yukleniyor: Promise<void> | null = null;

/** bütün eşya görsellerini yükler ve çözer (bir kez) */
export function esyaYukle(): Promise<void> {
  yukleniyor ??= Promise.all(
    Object.entries(GORSEL).map(async ([yol, url]) => {
      const i = new Image();
      i.src = url;
      await i.decode();
      resimler[yol.slice(yol.lastIndexOf('/') + 1, -5)] = i;
    }),
  ).then(() => undefined);
  return yukleniyor;
}
export const esyaResmi = (ad: string): HTMLImageElement | undefined => resimler[ad];

/**
 * Bir görseli alt ortası (0,0)'da, h yüksekliğinde basar (oran korunur). Ön katman eşyaları (saksı, yastık) için.
 */
export function esyaCiz(ctx: CanvasRenderingContext2D, ad: string, h: number) {
  const r = resimler[ad];
  if (!r) return;
  const w = (r.width / r.height) * h;
  ctx.drawImage(r, -w / 2, -h, w, h);
}

// ---------------------------------------------------------------- diş fırçası
/** uc: kılların ucunun ortası; eksen: sapın ortası (x); son: sapın ucu (y). Görsel dik: baş yukarıda, kıllar sağda. */
const FIRCA = {
  kino: { ad: 'dis-fircasi-kino', uc: [193, 135], eksen: 100, son: 1010 },
  lokum: { ad: 'dis-fircasi-lokum', uc: [210, 140], eksen: 105, son: 850 },
} as const;
/** sapın ekseni kılların ucundan ne kadar yanda (L'nin oranı; +y yönünde): eli sapa oturtmak için */
export const FIRCA_SAP = {
  kino: (FIRCA.kino.uc[0] - FIRCA.kino.eksen) / (FIRCA.kino.son - FIRCA.kino.uc[1]),
  lokum: (FIRCA.lokum.uc[0] - FIRCA.lokum.eksen) / (FIRCA.lokum.son - FIRCA.lokum.uc[1]),
};
/**
 * Diş fırçası: kılların ucu (0,0)'da, sap +x yönünde, kıllar -y'ye bakar. L: kıl başından sapın ucuna boy.
 * titre (0..1): fırçalarken baş hafifçe titrer.
 */
export function firca(ctx: CanvasRenderingContext2D, kim: 'kino' | 'lokum', L: number, titre = 0, t = 0) {
  const f = FIRCA[kim];
  const r = resimler[f.ad];
  if (!r) return;
  const k = L / (f.son - f.uc[1]);
  ctx.save();
  if (titre) ctx.rotate(0.05 * Math.sin(t * 55) * titre);
  ctx.scale(k, k);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-f.uc[0], -f.uc[1]);
  ctx.drawImage(r, 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------- macun
/** tüp (macun-tupu.webp): ağız (macunun çıktığı boyun), sonu (kıvrık uç), tutuş (gövdenin ortası) */
const TUP = { agiz: [95, 880], son: [670, 145], tutus: [430, 480] } as const;
/** kapak kaynak pikselinde kesildi; tüp kesimi 1024'e küçüldü: kapağı tüple aynı ölçeğe getiren çarpan */
const KAPAK_ORAN = 1024 / 1085;
const TUP_BOY = Math.hypot(TUP.agiz[0] - TUP.son[0], TUP.agiz[1] - TUP.son[1]);
const TUP_ACI = Math.atan2(TUP.agiz[1] - TUP.son[1], TUP.agiz[0] - TUP.son[0]);
/**
 * Macun tüpü: tutuş noktası (gövdenin ortası) (0,0)'da; ağzı aci (radyan) yönüne bakar. boy: sondan ağza.
 */
export function tup(ctx: CanvasRenderingContext2D, boy: number, aci: number) {
  const r = resimler['macun-tupu'];
  if (!r) return;
  const k = boy / TUP_BOY;
  ctx.save();
  ctx.rotate(aci - TUP_ACI);
  ctx.scale(k, k);
  ctx.translate(-TUP.tutus[0], -TUP.tutus[1]);
  ctx.drawImage(r, 0, 0);
  ctx.restore();
}
/** tüpün ağzı, tutuş noktasına göre (çağıranın biriminde) */
export function tupAgzi(boy: number, aci: number): [number, number] {
  const k = boy / TUP_BOY;
  const dx = (TUP.agiz[0] - TUP.tutus[0]) * k, dy = (TUP.agiz[1] - TUP.tutus[1]) * k;
  const a = aci - TUP_ACI;
  return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
}
/** tüpün kapağı (açık, yanında durur): alt orta (0,0); tupBoy: tüple aynı ölçek */
export function kapak(ctx: CanvasRenderingContext2D, tupBoy: number) {
  const r = resimler['macun-kapak'];
  if (!r) return;
  const k = (tupBoy / TUP_BOY) * KAPAK_ORAN;
  ctx.drawImage(r, (-r.width * k) / 2, -r.height * k, r.width * k, r.height * k);
}

/** macun kulesi (macun-kulesi.webp): tabanın ortası; alt kenarı fırçanın kıllarının arkasında kalır */
const KULE = { taban: [236, 762], gen: 490 } as const;
/** kulenin yüksekliği / genişliği (tam boyda) */
export const KULE_ORAN = KULE.taban[1] / KULE.gen;
/**
 * Fırçanın üstündeki macun kulesi: tabanı (0,0)'da, kıllara oturur. gen: tam boyda kulenin genişliği.
 * boy 0..1: 0 bezelye kadar, 1 kocaman kule (görsel tek ölçekle büyür; tabanı yerinde kalır).
 */
export function macunKulesi(ctx: CanvasRenderingContext2D, gen: number, boy: number, t = 0) {
  const r = resimler['macun-kulesi'];
  if (!r) return;
  const b = Math.max(0, Math.min(1, boy));
  const s = 0.16 + 0.84 * b;
  // büyürken tepesi hafifçe sallanır (yumuşak macun)
  const sal = b > 0.05 && b < 0.99 ? 0.05 * Math.sin(t * 9) * (1 - b) : 0;
  const k = (gen / KULE.gen) * s;
  ctx.save();
  ctx.rotate(sal);
  ctx.scale(k, k);
  ctx.translate(-KULE.taban[0], -KULE.taban[1]);
  ctx.drawImage(r, 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------- havlu
/** havlu (havlu-kino.webp): iki üst köşe (katlanmış kenarların tepesi) */
const HAVLU = { sol: [55, 30], sag: [705, 30] } as const;
const HAVLU_GEN = HAVLU.sag[0] - HAVLU.sol[0];
/** havlu iki elde: a sol üst köşe, b sağ üst köşe (dünya). Boyu genişliğe göre (görselin oranı) */
export function havluTut(ctx: CanvasRenderingContext2D, a: [number, number], b: [number, number]) {
  const r = resimler['havlu-kino'];
  if (!r) return;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const k = L / HAVLU_GEN;
  ctx.save();
  ctx.translate(a[0], a[1]);
  ctx.rotate(Math.atan2(b[1] - a[1], b[0] - a[0]));
  ctx.scale(k, k);
  ctx.translate(-HAVLU.sol[0], -HAVLU.sol[1]);
  ctx.drawImage(r, 0, 0);
  ctx.restore();
}
/** omuzda asılı havlu: üst kenarın ortası (0,0)'da, gen genişlikte */
export function havluAsili(ctx: CanvasRenderingContext2D, gen: number) {
  const r = resimler['havlu-kino'];
  if (!r) return;
  const k = gen / r.width;
  ctx.drawImage(r, -gen / 2, -HAVLU.sol[1] * k, gen, r.height * k);
}

// ---------------------------------------------------------------- tabure
/** tabure (tabure.webp): üst tahtanın üstü (basılan yüzey), görselin y'si */
const TABURE_UST = 16;
/** tabure: alt orta (0,0), basılan üst yüzeyi h yükseklikte (oran korunur) */
export function tabure(ctx: CanvasRenderingContext2D, h: number) {
  const r = resimler.tabure;
  if (!r) return;
  const k = h / (r.height - TABURE_UST);
  ctx.drawImage(r, (-r.width * k) / 2, -r.height * k, r.width * k, r.height * k);
}

// ---------------------------------------------------------------- kum saati
interface KumBilgi {
  w: number;
  h: number;
  boyun: [number, number];
  kum: string;
  kontur: string;
  cizgi: number;
  ust: { y0: number; kenar: number; satir: [number, number][] };
  alt: { y0: number; satir: [number, number][] };
}
const KB = kumBilgi as unknown as KumBilgi;
const satirGen = (s: [number, number]) => Math.max(0, s[1] - s[0]);
/** üst kumun alanı: kenar satırından aşağısı */
const UST_SATIR = KB.ust.satir.slice(KB.ust.kenar - KB.ust.y0);
const UST_ALAN = UST_SATIR.reduce((t, s) => t + satirGen(s), 0);
/** p (0 dolu .. 1 bitti) → üst kumun yüzeyi (görsel y'si): yüzeyin altında kalan alan (1-p) × tüm alan */
function ustSeviye(p: number): number {
  let hedef = (1 - p) * UST_ALAN;
  for (let k = UST_SATIR.length - 1; k >= 0; k--) {
    hedef -= satirGen(UST_SATIR[k]);
    if (hedef <= 0) return KB.ust.kenar + k;
  }
  return KB.ust.kenar;
}
/** alt haznedeki tepecik: yüzey y = L - th·(1 - u²), u = (x - orta) / yarıGen */
const ALT_GEN = Math.max(...KB.alt.satir.map(satirGen));
const ALT_ORTA = KB.boyun[0];
const ALT_TEPE = ALT_GEN * 0.22;
const ALT_SON = KB.alt.y0 + KB.alt.satir.length - 1;
function tepecikAlani(L: number): number {
  let a = 0;
  const rx = ALT_GEN / 2;
  for (let k = 0; k < KB.alt.satir.length; k++) {
    const y = KB.alt.y0 + k;
    const [x0, x1] = KB.alt.satir[k];
    if (x1 <= x0 || y < L - ALT_TEPE) continue;
    if (y >= L) a += x1 - x0;
    else {
      const u = Math.sqrt(Math.max(0, 1 - (L - y) / ALT_TEPE)) * rx;
      a += Math.max(0, Math.min(x1, ALT_ORTA + u) - Math.max(x0, ALT_ORTA - u));
    }
  }
  return a;
}
const TEPECIK: number[] = (() => {
  // p → L tablosu (101 adım): tepecik alanı p × üst kumun alanı
  const t: number[] = [];
  for (let i = 0; i <= 100; i++) {
    const hedef = (i / 100) * UST_ALAN;
    let a = KB.alt.y0 - ALT_TEPE, b = ALT_SON + ALT_TEPE + 1;
    for (let j = 0; j < 30; j++) {
      const m = (a + b) / 2;
      if (tepecikAlani(m) > hedef) a = m;
      else b = m;
    }
    t.push((a + b) / 2);
  }
  return t;
})();
const tepecikSeviye = (p: number) => {
  const x = Math.max(0, Math.min(1, p)) * 100;
  const i = Math.floor(x), f = x - i;
  return i >= 100 ? TEPECIK[100] : TEPECIK[i] * (1 - f) + TEPECIK[i + 1] * f;
};

let tuval: HTMLCanvasElement | OffscreenCanvas | null = null;
function araTuval(w: number, h: number) {
  if (!tuval) tuval = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : document.createElement('canvas');
  if (tuval.width < w) tuval.width = w;
  if (tuval.height < h) tuval.height = h;
  return tuval;
}

/** kum saatinin görsel genişliği / yüksekliği */
export const KUM_ORAN = KB.w / KB.h;

/**
 * Kum saati: alt ortası (0,0)'da, h yüksekliğinde. p: akan kum (0 üst hazne dolu .. 1 bitti); akiyor: boyundan kum
 * akar; parla: bitişte etrafı ışıldar.
 */
export function kumSaati(ctx: CanvasRenderingContext2D, h: number, p: number, akiyor: boolean, t: number, parla = 0) {
  const bos = resimler['kum-saati-bos'], ust = resimler['kum-saati-ust-kum'], alt = resimler['kum-saati-alt-kum'];
  if (!bos || !ust || !alt) return;
  const k = h / KB.h;
  const w = KB.w * k;
  if (parla > 0) {
    const g = ctx.createRadialGradient(0, -h / 2, 0, 0, -h / 2, h * 0.9);
    g.addColorStop(0, `rgba(255,236,150,${0.55 * parla})`);
    g.addColorStop(1, 'rgba(255,236,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-h, -1.5 * h, 2 * h, 2 * h);
  }
  ctx.save();
  ctx.translate(-w / 2, -h);
  ctx.scale(k, k);
  // artık görsel pikselinde
  ctx.drawImage(bos, 0, 0);
  // kum katmanları ara tuvalde (ekran çözünürlüğünde) kırpılır, sonra basılır
  const m = ctx.getTransform();
  const olc = Math.max(0.05, Math.hypot(m.a, m.b));
  const TW = Math.ceil(KB.w * olc), TH = Math.ceil(KB.h * olc);
  const at = araTuval(TW, TH);
  const c = at.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (c) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, at.width, at.height);
    c.setTransform(olc, 0, 0, olc, 0, 0);
    const cizgi = KB.cizgi;
    // üst hazne: yüzeyin altındaki kum, yüzeyde elips (görseldeki kum ağzı gibi)
    const p1 = Math.max(0, Math.min(1, p));
    if (p1 < 0.999) {
      const L = p1 <= 0.001 ? KB.ust.kenar : ustSeviye(p1);
      c.drawImage(ust, 0, 0);
      c.globalCompositeOperation = 'destination-in';
      c.fillRect(0, L, KB.w, KB.h);
      c.globalCompositeOperation = 'source-over';
      const s = KB.ust.satir[Math.round(L) - KB.ust.y0] ?? [KB.boyun[0], KB.boyun[0]];
      const rx = Math.max(0, (s[1] - s[0]) / 2 - cizgi * 0.2);
      if (rx > cizgi) {
        const ilk = KB.ust.satir[KB.ust.kenar - KB.ust.y0];
        const ry = Math.max(cizgi, (KB.ust.kenar - KB.ust.y0) * (rx / Math.max(1, (ilk[1] - ilk[0]) / 2)));
        c.beginPath();
        c.ellipse((s[0] + s[1]) / 2, L, rx, ry, 0, 0, Math.PI * 2);
        c.fillStyle = KB.kum;
        c.fill();
        c.lineWidth = cizgi;
        c.strokeStyle = KB.kontur;
        c.stroke();
      }
    }
    // alt hazne: tepecik
    if (p1 > 0.002) {
      const L = tepecikSeviye(p1);
      // alt kumu tepecik biçimiyle kırp (yalnız alt haznenin satırlarında: üstteki kum etkilenmez)
      const tepecik = () => {
        const rx = ALT_GEN / 2;
        c.beginPath();
        c.moveTo(0, L);
        c.lineTo(ALT_ORTA - rx, L);
        for (let i = 0; i <= 24; i++) {
          const u = -1 + (2 * i) / 24;
          c.lineTo(ALT_ORTA + u * rx, L - ALT_TEPE * (1 - u * u));
        }
        c.lineTo(KB.w, L);
        c.lineTo(KB.w, KB.h);
        c.lineTo(0, KB.h);
        c.closePath();
      };
      c.save();
      c.beginPath();
      c.rect(0, KB.alt.y0 - 2, KB.w, KB.h);
      c.clip();
      c.save();
      tepecik();
      c.clip();
      c.drawImage(alt, 0, 0);
      c.restore();
      // tepeciğin yüzey çizgisi yalnız kumun üstünde
      c.globalCompositeOperation = 'source-atop';
      c.beginPath();
      const rx = ALT_GEN / 2;
      for (let i = 0; i <= 24; i++) {
        const u = -1 + (2 * i) / 24;
        c[i ? 'lineTo' : 'moveTo'](ALT_ORTA + u * rx, L - ALT_TEPE * (1 - u * u));
      }
      c.lineWidth = KB.cizgi;
      c.strokeStyle = KB.kontur;
      c.stroke();
      c.restore();
      c.globalCompositeOperation = 'source-over';
    }
  }
  ctx.save();
  ctx.setTransform(m.a / olc, m.b / olc, m.c / olc, m.d / olc, m.e, m.f);
  ctx.drawImage(at as CanvasImageSource, 0, 0, TW, TH, 0, 0, TW, TH);
  ctx.restore();
  // boyundan akan kum (kum taneleri gibi kesik çizgi)
  if (akiyor && p < 1) {
    const L = p > 0.002 ? tepecikSeviye(p) - ALT_TEPE : ALT_SON;
    const [bx, by] = KB.boyun;
    const y1 = Math.max(by + 4, L);
    ctx.lineCap = 'round';
    ctx.setLineDash([KB.cizgi * 1.6, KB.cizgi * 1.4]);
    ctx.lineDashOffset = -t * KB.w * 0.9;
    ctx.beginPath();
    ctx.moveTo(bx, by - 2);
    ctx.lineTo(bx, y1);
    ctx.lineWidth = KB.cizgi * 1.5;
    ctx.strokeStyle = KB.kum;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

/** test için: p'ye göre üst ve alt kum seviyeleri (görsel pikseli) */
export const kumSeviyeleri = (p: number) => ({ ust: ustSeviye(p), alt: tepecikSeviye(p) });
