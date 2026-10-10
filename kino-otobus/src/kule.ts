/**
 * Dondurma kulesinin çizimi (yuvada yapılan ve balonda istenen aynı çizimle): kap altta, toplar üst üste ortak taban
 * çizgisinde (hiçbiri çapraz değil), sos en üst topun kubbesinde, serpinti onun üstünde, süsler tepede sıralı yerlerde.
 * Ölçü: --t (topun eni, px); bütün yerler bunun katı (varliklar.ts → YERLESIM).
 */
import { h } from '../../src/ui/dom';
import { mumSvg, SORU_TOPU } from './cizim';
import { SUSLER, type Kap, type Sos, type Sus, type TatIstek } from './model';
import { adres, gorsel, kapAdi, sosUstAdi, susAdi, topAdi, YERLESIM } from './varliklar';

/** Çizilecek kule: istenen (serin ve "?" toplu) ya da yapılan */
export interface KuleVeri {
  kap: Kap;
  toplar: (TatIstek | '?')[];
  sos: Sos | null;
  susler: Sus[];
  mum?: 'yanik' | 'sonuk' | null;
}

/** Süslerin tepedeki yerleri (en üst topun kutusuna göre: x 0-1, y 0-1 alt kenar noktası) ve boyları (topun eni) */
const SUS_YERI: [number, number][] = [
  [0.5, 0.2],
  [0.3, 0.3],
  [0.7, 0.3],
  [0.4, 0.17],
  [0.6, 0.17],
  [0.18, 0.45],
  [0.82, 0.45],
  [0.5, 0.08],
  [0.28, 0.2],
  [0.72, 0.2],
];
const SUS_BOY: Record<Sus, number> = { serpinti: 1, kiraz: 0.34, gofret: 0.5, semsiye: 0.5, kalp: 0.3 };

const YT = YERLESIM.top;
/** Kulenin ölçüleri (topun eni = 1): kabın boyu, i. topun alt kenarı, toplam boy */
export function kuleOlcu(kap: Kap, topSayisi: number, susVar = false): { kapBoy: number; taban: number[]; boy: number; en: number } {
  const k = YERLESIM.kap[kap];
  const ilk = k.boy * (1 - k.agiz) - 0.06;
  const taban = Array.from({ length: topSayisi }, (_, i) => ilk + i * YT.adim * YT.boy);
  const ust = topSayisi ? taban[topSayisi - 1] + YT.boy : k.boy;
  return { kapBoy: k.boy, taban, boy: ust + (susVar && topSayisi ? 0.32 : 0), en: Math.max(k.en, 1.1) };
}

const yuzde = (v: number) => `calc(var(--t) * ${v.toFixed(3)})`;

/** Topun çizimi: tat görseli; 'serin' yarı limon yarı çilek; '?' kesik çizgili boş top */
function topIc(t: TatIstek | '?'): string {
  if (t === '?') return SORU_TOPU;
  if (t === 'serin') return `<span class="ko-serin">${gorsel(topAdi('limon'), 'ko-serin-a')}${gorsel(topAdi('cilek'), 'ko-serin-b')}</span>`;
  return gorsel(topAdi(t));
}

/**
 * Kulenin elemanı. gizliTop: henüz uçmakta olan topların sırası (uçuş bitince görünür); vurgula: farklı olan parçalar
 * (balonda bir an parlar).
 */
export function kuleCiz(d: KuleVeri, o: { gizliTop?: ReadonlySet<number>; sinif?: string } = {}): HTMLElement {
  const susVar = d.susler.length > 0 || !!d.mum;
  const olcu = kuleOlcu(d.kap, d.toplar.length, susVar);
  const k = YERLESIM.kap[d.kap];
  const el = h(`div.ko-kule${o.sinif ? `.${o.sinif}` : ''}`, {
    'data-kap': d.kap,
    'data-top': String(d.toplar.length),
    'data-toplar': d.toplar.join(','),
    style: `width:${yuzde(olcu.en)};height:${yuzde(olcu.boy)};--boy:${olcu.boy.toFixed(3)};--en:${olcu.en.toFixed(3)}`,
  });
  el.append(h('div.ko-k-kap', { 'data-kap': d.kap, style: `width:${yuzde(k.en)};height:${yuzde(k.boy)}`, html: gorsel(kapAdi(d.kap)) }));
  d.toplar.forEach((t, i) => {
    el.append(
      h(`div.ko-k-top${o.gizliTop?.has(i) ? '.ko-gizli' : ''}`, {
        'data-i': String(i),
        'data-tat': t,
        style: `bottom:${yuzde(olcu.taban[i])};height:${yuzde(YT.boy)};--i:${i}`,
        html: topIc(t),
      }),
    );
  });
  const n = d.toplar.length;
  if (n) {
    const ust = olcu.taban[n - 1];
    const ustKutu = (sinif: string, html: string, ek = '') => h(`div.${sinif}`, { style: `bottom:${yuzde(ust)};height:${yuzde(YT.boy)}${ek}`, html });
    if (d.sos) el.append(ustKutu('ko-k-sos', gorsel(sosUstAdi(d.sos)), ''));
    if (d.susler.includes('serpinti')) el.append(ustKutu('ko-k-serpinti', gorsel(susAdi('serpinti'))));
    // tek tek süsler: tepedeki sıralı yerlere (aynı türler yan yana), konuş sırasıyla
    const tekler = d.susler.filter((s) => s !== 'serpinti');
    const sirali = SUSLER.flatMap((s) => tekler.filter((x) => x === s));
    // mumlu kupada tepenin ortası mumun: süsler yanlardaki yerlere (kiraz mumun arkasında kalmasın)
    const yerler = d.mum ? SUS_YERI.slice(1) : SUS_YERI;
    sirali.forEach((s, j) => {
      const [x, y] = yerler[j % yerler.length];
      const b = SUS_BOY[s];
      el.append(
        h('div.ko-k-sus', {
          'data-sus': s,
          style: `left:calc(50% + var(--t) * ${(x - 0.5).toFixed(3)});bottom:calc(var(--t) * ${(ust + YT.boy * (1 - y)).toFixed(3)});width:${yuzde(b)};height:${yuzde(b)};--j:${j}`,
          html: gorsel(susAdi(s)),
        }),
      );
    });
    if (d.mum) el.append(h(`div.ko-k-mum${d.mum === 'sonuk' ? '.ko-sonuk' : ''}`, { style: `bottom:calc(var(--t) * ${(ust + YT.boy * 0.85).toFixed(3)})`, html: d.mum === 'sonuk' ? (adres('mum') ? gorsel('mum', 'ko-mum-sonuk') : mumSvg(true)) : gorsel('mum') }));
  }
  return el;
}

/** Kulenin --t'si: verilen kutuya sığsın (en çok enCok px) */
export function kuleBoyu(d: Pick<KuleVeri, 'kap' | 'toplar' | 'susler'> & { mum?: unknown }, genislik: number, yukseklik: number, enCok: number): number {
  const o = kuleOlcu(d.kap, d.toplar.length, d.susler.length > 0 || !!d.mum);
  return Math.max(8, Math.min(enCok, genislik / o.en, yukseklik / o.boy));
}
