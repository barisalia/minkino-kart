/**
 * 3/4 lokanta sahnesi (§7a-1, §7c, P8): derinlik sıralaması ve yürüme yolu.
 *
 * DERİNLİK: her nesne ayak noktasının (zemin) y değerine göre sıralanır: `z = y × 10 + katman`. Masa üç katmandır:
 * sandalye (arkada, 0), oturan müşteri (1), masa (önde, 2). Önden geçen Kino masanın ayak çizgisinin altındaysa
 * (y daha büyük) masanın önünde, üstündeyse arkasında çizilir. Yürürken her karede güncellenir.
 *
 * YÜRÜME YOLU: koridor düğümleri (olcek.ts YERLESIM34.yol + sıra, kapı, servis, masa yanları) ve aralarındaki
 * GÖRÜŞ HATTI kenarları: iki düğüm arasındaki doğru hiçbir engeli (tezgâh, çit, masa izdüşümü) kesmiyorsa kenar
 * vardır. Başlangıç ve hedef, görebildikleri düğümlere bağlanır; en kısa yol (Dijkstra) bulunur. Böylece kimse
 * masanın ya da tezgâhın içinden geçmez (tests/unit/restoran-sahne34.test.ts).
 *
 * YÜRÜYÜŞ: poz + yer değiştirme + hop (Pati yuru() kalıbı). Sola giderken bütün resim aynalanır (scaleX(-1); parça
 * döndürme değil). Kino: yukarı (mutfağa) yürürken arka kareleri, aşağı inerken ön kareleri (§11h #75 kino-34-yuru;
 * çizim gelene kadar yan yürüyüş kareleri).
 */
import { MASA34, birimYuzde, type Kutu, type Yer, type Yerlesim34, type Yon } from '../olcek';

// ---------------------------------------------------------------- derinlik

/** Katmanlar: aynı ayak çizgisinde sandalye < oturan < masa < ayakta yürüyen */
export const KATMAN = { sandalye: 0, oturan: 1, masa: 2, ayakta: 3, sus: 1 } as const;
export type Katman = keyof typeof KATMAN;

/** Ayak y'sinden (sahne yüzdesi) z-index */
export const derinlik = (y: number, k: Katman = 'ayakta') => Math.round(y * 10) * 4 + KATMAN[k] + 100;

// ---------------------------------------------------------------- geometri

/** Doğru parçası kutuyu kesiyor mu (Liang-Barsky); kutu kenarına değmek kesmek sayılmaz (pay içeri) */
export function parcaKutuyuKeser(a: Yer, b: Yer, k: Kutu, pay = 0.15): boolean {
  const x0 = k.x + pay;
  const x1 = k.x + k.w - pay;
  const y0 = k.y + pay;
  const y1 = k.y + k.h - pay;
  if (x1 <= x0 || y1 <= y0) return false;
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - x0, x1 - a.x, a.y - y0, y1 - a.y];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}
export const kutudaMi = (p: Yer, k: Kutu) => p.x > k.x && p.x < k.x + k.w && p.y > k.y && p.y < k.y + k.h;

/** Bir yürüme mesafesi: 16:9 resimde y yüzdesi x'ten kısa (piksel olarak) */
export function mesafe(a: Yer, b: Yer, yon: Yon = 'yatay'): number {
  const oy = yon === 'yatay' ? 1536 / 2752 : 2752 / 1536;
  return Math.hypot(b.x - a.x, (b.y - a.y) * oy);
}

// ---------------------------------------------------------------- masa geometrisi

/** Masanın zemindeki izdüşümü (engel): ayak çizgisinden yukarı MASA34.derinlik, en MASA34.w (yüzde) */
export function masaEngeli(m: Yer, yon: Yon): Kutu {
  const b = birimYuzde(yon);
  const w = MASA34.w * b.x * 0.9;
  const d = MASA34.derinlik * b.y;
  return { x: m.x - w / 2, y: m.y - d, w, h: d };
}
/** Sandalyenin (oturanın ayak noktası) yeri: masanın arkası; iki kişilikse yanlara açılır */
export function sandalyeYeri(m: Yer, yon: Yon, kac: 1 | 2 = 1, sira: 0 | 1 = 0): Yer {
  const b = birimYuzde(yon);
  const dx = kac === 2 ? (sira ? 1 : -1) * MASA34.ikiliAra * 0.5 * b.x * 1.6 : 0;
  return { x: m.x + dx, y: m.y - MASA34.sandalyeGeri * b.y - MASA34.derinlik * b.y * 0.55 };
}
/** Kino'nun masanın yanında durduğu yer (masanın yanı, aynı derinlik) */
export function masaYaniYeri(m: Yer, yon: Yon): Yer {
  const b = birimYuzde(yon);
  const ic = m.x > (yon === 'yatay' ? 34 : 58) ? -1 : 1;
  // dikeyde masalar ekranın üçte biri kadar geniş: Kino yanına değil, ön köşesine durur (önünde çizilir)
  if (yon === 'dikey') return { x: m.x + ic * (MASA34.w / 2) * 0.62 * b.x, y: m.y + 0.35 * b.y };
  const dx = (MASA34.w / 2 + 0.55) * b.x;
  return { x: m.x + ic * dx, y: m.y - MASA34.derinlik * b.y * 0.5 };
}

// ---------------------------------------------------------------- yol grafiği

export interface YolGrafigi {
  dugum: Record<string, Yer>;
  kenar: Map<string, Set<string>>;
  engel: Kutu[];
  yon: Yon;
}

/** Görüş hattı: a'dan b'ye düz yürünebilir mi */
export function gorur(a: Yer, b: Yer, engel: Kutu[]): boolean {
  return !engel.some((k) => parcaKutuyuKeser(a, b, k));
}

/**
 * Grafiği kurar: YERLESIM34.yol + kapı, sıra, yolun başı, servis (Kino), bahçe kapısı. Engeller: sabit engeller +
 * masa izdüşümleri (salon masaları; bahçe açıksa bahçe masaları ve çitin kapısı açık).
 */
export function grafikKur(Y: Yerlesim34, yon: Yon, masalar: Yer[], bahce: boolean): YolGrafigi {
  const dugum: Record<string, Yer> = { ...Y.yol, kino: Y.kino, kapi: Y.bekleme };
  Y.sira.forEach((s, i) => (dugum[`sira${i}`] = s));
  Y.yolBasi.forEach((s, i) => (dugum[`yolBasi${i}`] = s));
  dugum.giris = Y.giris;
  if (!bahce) for (const k of Object.keys(dugum)) if (k.startsWith('bahce')) delete dugum[k];
  // bahçe kapalıyken çit kapısı da kapalı (engel)
  const engel = [...Y.engel, ...(bahce ? [] : [{ x: Y.bahceKapisi.x - 1.2, y: Y.bahceKapisi.y - 6, w: 2.4, h: 12 }]), ...masalar.map((m) => masaEngeli(m, yon))];
  const kenar = new Map<string, Set<string>>();
  const adlar = Object.keys(dugum);
  for (const a of adlar) kenar.set(a, new Set());
  for (let i = 0; i < adlar.length; i++)
    for (let j = i + 1; j < adlar.length; j++) {
      const a = adlar[i];
      const b = adlar[j];
      if (gorur(dugum[a], dugum[b], engel)) {
        kenar.get(a)!.add(b);
        kenar.get(b)!.add(a);
      }
    }
  return { dugum, kenar, engel, yon };
}

/**
 * En kısa yol: başlangıçtan hedefe nokta listesi (başlangıç hariç, hedef dahil). Doğrudan görüyorsa tek adım.
 * Hiçbir yol yoksa (olmamalı; test denetler) doğrudan hedef (oyun kilitlenmez).
 */
export function yolBul(g: YolGrafigi, bas: Yer, son: Yer): Yer[] {
  if (gorur(bas, son, g.engel)) return [son];
  const adlar = Object.keys(g.dugum);
  const BAS = '__bas';
  const SON = '__son';
  const nokta = (a: string) => (a === BAS ? bas : a === SON ? son : g.dugum[a]);
  const komsu = (a: string): string[] => {
    if (a === BAS) return adlar.filter((d) => gorur(bas, g.dugum[d], g.engel));
    const k = [...(g.kenar.get(a) ?? [])];
    if (gorur(g.dugum[a], son, g.engel)) k.push(SON);
    return k;
  };
  const uzak = new Map<string, number>([[BAS, 0]]);
  const once = new Map<string, string>();
  const acik = new Set<string>([BAS]);
  const kapali = new Set<string>();
  while (acik.size) {
    let a = '';
    let en = Infinity;
    for (const x of acik) if ((uzak.get(x) ?? Infinity) < en) [a, en] = [x, uzak.get(x)!];
    acik.delete(a);
    if (a === SON) break;
    kapali.add(a);
    for (const b of komsu(a)) {
      if (kapali.has(b)) continue;
      const d = en + mesafe(nokta(a), nokta(b), g.yon);
      if (d < (uzak.get(b) ?? Infinity)) {
        uzak.set(b, d);
        once.set(b, a);
        acik.add(b);
      }
    }
  }
  if (!once.has(SON)) return [son];
  const yol: Yer[] = [];
  for (let a = SON; a !== BAS; a = once.get(a)!) yol.unshift(nokta(a));
  return yol;
}

// ---------------------------------------------------------------- yürüyüş (DOM)

/** Yürüyen bir kişinin sahne34'ün ihtiyaç duyduğu yüzü (Kisi sınıfı bunu sağlar) */
export interface Yuruyen {
  readonly el: HTMLElement;
  readonly govde: HTMLElement;
  readonly ad: string;
  readonly konum: Yer;
  yerKoy(x: number, y: number): void;
  poz(ad: string): void;
}

const SAKIN = () => typeof document !== 'undefined' && (document.body?.classList.contains('test-modu') || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches));

/** Kişiyi aynalar (sola bakış): bütün resim çevrilir, parça döndürme değil */
export function aynala(k: Yuruyen, sola: boolean) {
  if (sola) k.el.dataset.ayna = '1';
  else delete k.el.dataset.ayna;
}

/**
 * Bir yol boyunca yürür. kareler: yön → iki adım karesi (yoksa poz değişmez). Her karede derinlik güncellenir.
 * hiz: yüzde / sn (x ölçeğinde).
 */
export async function yolYuru(
  k: Yuruyen,
  yol: Yer[],
  o: { yon: Yon; hiz?: number; kareler?: (yonu: 'yan' | 'yukari' | 'asagi') => string[] | null; durus?: string; test?: boolean; kapandi?: () => boolean },
): Promise<void> {
  const hiz = o.hiz ?? 24;
  for (const hedef of yol) {
    if (o.kapandi?.()) return;
    const bas = k.konum;
    const dx = hedef.x - bas.x;
    const dyPx = (hedef.y - bas.y) * (o.yon === 'yatay' ? 1536 / 2752 : 2752 / 1536);
    if (Math.abs(dx) > 0.3) aynala(k, dx < 0);
    const yonu: 'yan' | 'yukari' | 'asagi' = Math.abs(dyPx) > Math.abs(dx) * 1.2 ? (dyPx < 0 ? 'yukari' : 'asagi') : 'yan';
    const kare = o.kareler?.(yonu) ?? null;
    // yukarı / aşağı yürürken ön-arka karesi zaten yönü gösterir: ayna yok
    if (kare && yonu !== 'yan') aynala(k, false);
    const ms = o.test || SAKIN() ? 30 : Math.max(260, (mesafe(bas, hedef, o.yon) / hiz) * 1000);
    k.yerKoy(hedef.x, hedef.y);
    if (o.test || SAKIN()) {
      k.el.style.zIndex = String(derinlik(hedef.y));
      continue;
    }
    let adim = 0;
    if (kare?.length) k.poz(kare[0]);
    const kareZaman = kare && kare.length > 1 ? window.setInterval(() => k.poz(kare[++adim % kare.length]), 220) : 0;
    const t0 = performance.now();
    let raf = 0;
    const zGuncelle = () => {
      const t = Math.min(1, (performance.now() - t0) / ms);
      k.el.style.zIndex = String(derinlik(bas.y + (hedef.y - bas.y) * t));
      if (t < 1) raf = requestAnimationFrame(zGuncelle);
    };
    raf = requestAnimationFrame(zGuncelle);
    const n = Math.max(2, Math.round(ms / 300));
    const kf: Keyframe[] = [];
    for (let i = 0; i <= n * 2; i++) kf.push({ transform: i % 2 ? 'translateY(-7%) scale(0.98, 1.03)' : 'scale(1.02, 0.97)', offset: i / (n * 2) });
    kf[0].transform = 'none';
    kf[kf.length - 1].transform = 'none';
    try {
      k.govde.animate(kf, { duration: ms, easing: 'linear' });
      await k.el.animate([{ left: `${bas.x}%`, top: `${bas.y}%` }, { left: `${hedef.x}%`, top: `${hedef.y}%` }], { duration: ms, easing: 'linear' }).finished;
    } catch {
      await new Promise((r) => setTimeout(r, ms));
    }
    cancelAnimationFrame(raf);
    if (kareZaman) clearInterval(kareZaman);
    k.el.style.zIndex = String(derinlik(hedef.y));
  }
  if (o.durus) k.poz(o.durus);
}

// ---------------------------------------------------------------- sahne kurulumu (DOM)

const Q34 = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
/**
 * 3/4 sahne açık mı: yatay 3/4 resmi geldiyse (ya da `?sahne34=1` ile yer tutucu dioramayla); `?eski=1` dik karşıdan
 * eski sahneye döner. Karar ekran kurulurken bir kez verilir (döndürmede değişmez).
 */
export function sahne34Acik(varlik: (y: string) => string | null): boolean {
  if (Q34.has('eski')) return false;
  return Q34.has('sahne34') || !!varlik('arka/lokanta-34-yatay');
}

/** Arka plan: 3/4 resim (bahçeli sürüm varsa ve bahçe alındıysa o); yoksa yer tutucu diorama. Çapraz geçiş. */
export function arka34Ciz(arka: HTMLElement, yon: Yon, bahce: boolean, varlik: (y: string) => string | null, gecis = false): void {
  const ad = `arka/lokanta-34-${yon}`;
  const u = (bahce ? varlik(`${ad}-bahceli`) : null) ?? varlik(ad);
  arka.classList.toggle('rs-yertutucu', !u);
  arka.dataset.bahce = bahce ? '1' : '';
  if (u) {
    const eski = arka.querySelector<HTMLImageElement>('img.rs-arka-resim:not(.rs-eski)');
    if (eski && eski.getAttribute('src') === u) return;
    arka.querySelector('.rs-d34')?.remove();
    const img = document.createElement('img');
    img.className = 'rs-arka-resim';
    img.src = u;
    img.alt = '';
    img.draggable = false;
    if (eski && gecis) {
      img.style.opacity = '0';
      arka.append(img);
      void img.decode().catch(() => undefined).then(() => {
        img.style.opacity = '';
        eski.classList.add('rs-eski');
        window.setTimeout(() => eski.remove(), 700);
      });
    } else {
      arka.replaceChildren(img);
    }
    return;
  }
  let d = arka.querySelector<HTMLElement>('.rs-d34');
  if (!d) {
    d = document.createElement('div');
    d.className = 'rs-d34';
    const parca = ['gok', 'agac', 'agac', 'duvar', 'cini', 'zemin', 'tezgah', 'davlumbaz', 'ocak', 'lavabo', 'tahta', 'mermer', 'pencere', 'kapi', 'kasa', 'yol', 'cit', 'cit-kapi', 'guverte', 'cardak', 'cesme', 'kedi'];
    for (const p of parca) {
      const i = document.createElement('i');
      i.className = `rs-d34-${p}`;
      d.append(i);
    }
    arka.replaceChildren(d);
  }
  d.dataset.bahce = bahce ? '1' : '';
  // halılar (masa yerleri) ve ağaçlar yönüne göre
  d.querySelectorAll('.rs-d34-hali').forEach((e) => e.remove());
  const agac = d.querySelectorAll<HTMLElement>('.rs-d34-agac');
  const AGAC = yon === 'yatay' ? [{ x: 76, y: 4 }, { x: 89, y: 12 }] : [{ x: 4, y: 76 }, { x: 80, y: 74 }];
  agac.forEach((a, i) => Object.assign(a.style, { left: `${AGAC[i].x}%`, top: `${AGAC[i].y}%` }));
}

/** Masa yerleri için halılar (yer tutucu dioramada) */
export function halilariCiz(arka: HTMLElement, masalar: Yer[], yon: Yon) {
  const d = arka.querySelector<HTMLElement>('.rs-d34');
  if (!d) return;
  d.querySelectorAll('.rs-d34-hali').forEach((e) => e.remove());
  const b = birimYuzde(yon);
  for (const m of masalar) {
    const i = document.createElement('i');
    i.className = 'rs-d34-hali';
    Object.assign(i.style, { left: `${m.x - MASA34.w * b.x * 0.7}%`, top: `${m.y - b.y * 1.05}%`, width: `${MASA34.w * b.x * 1.4}%`, height: `${b.y * 1.5}%` });
    d.append(i);
  }
}

/** Küçük karakteri en az ENAZ_BOY34 boyuna getirir (kendi --rs-u'su; içindeki balon da onunla) */
export function kisiOlcekle(k: { el: HTMLElement; boy: number }, enAz: number) {
  const f = k.boy < enAz ? enAz / k.boy : 1;
  if (f > 1) k.el.style.setProperty('--rs-u', `calc(var(--rs-u0) * ${f.toFixed(4)})`);
  return f;
}

/**
 * İstek balonu yeri: kafanın üstünde, sahnenin içinde, yüzü örtmeden, HUD'a taşmadan. Kafa yakın üst kenardaysa
 * yüzün yanına (sola ya da sağa) kayar. Değerler kişi kutusuna göre px (balon kişinin içinde durur).
 */
export function balonYerlestir(balon: HTMLElement, kisiEl: HTMLElement, sahneEl: HTMLElement, figur: { tepe: number; taban: number }) {
  const k = kisiEl.getBoundingClientRect();
  const s = sahneEl.getBoundingClientRect();
  const bw = balon.offsetWidth || 50;
  const bh = balon.offsetHeight || 50;
  if (!k.width || !s.width) return;
  const kafaUst = k.top + k.height * figur.tepe;
  const figH = k.height * (figur.taban - figur.tepe);
  const yuzAlt = kafaUst + figH * 0.46;
  const pay = 4;
  // önce üst: balonun altı kafanın tepesinde
  let top = kafaUst - bh - 2;
  let left = k.left + k.width * 0.5 - bw * 0.15;
  let kuyruk = 'sag';
  if (top < s.top + pay) {
    // yan: yüzün sağı (yer yoksa solu)
    top = Math.max(s.top + pay, kafaUst);
    left = k.left + k.width * 0.5 + figH * 0.24;
    if (left + bw > s.right - pay) {
      left = k.left + k.width * 0.5 - figH * 0.24 - bw;
      kuyruk = 'sol';
    }
    if (top + bh > yuzAlt + bh) top = yuzAlt;
  }
  if (left + bw > s.right - pay) {
    left = s.right - pay - bw;
    kuyruk = 'sol';
  }
  if (left < s.left + pay) left = s.left + pay;
  balon.style.left = `${left - k.left}px`;
  balon.style.top = `${top - k.top}px`;
  balon.style.bottom = 'auto';
  balon.dataset.kuyruk = kuyruk;
}
