// Ceren'in göz kırpması ve tepki pozları (Paket Harf-A1, yönetici 23 Kasım: "Ceren'in göz kırpma ve tepki pozları olsun").
// Astra'nın kareleri assets/alfabe/ceren-tepki/ altına, konuşma kareleriyle (ceren-konus/0–3, 627 × 627, saydam) AYNI tuvalde gelir:
//  · goz-yari, goz-kapali: yalnız göz kapağı katmanı (gözlerin üstüne oturan saydam katman); her konuşma karesinin üstünde çalışır.
//  · sevinc, sasirma, dusunme, el-salla, alkis, isaret: bütün bust pozu; gösterildiği sürece konuşma kareleri gizlenir.
// Kareler gelmeden hiçbir şey değişmez (glob boş). Göz kırpma: 2,6–5,4 sn'de bir, yarı → kapalı → yarı (≈ 0,21 sn).
// Konuşma kareleri .alf-ceren'in doğrudan çocuklarıdır (konusma-dersi.ts → agizGoster sırasına bakar): bu katmanlar ayrı bir
// sarmalayıcıdadır (.alf-ceren-ek), ağız sırası bozulmaz.
const kareler = import.meta.glob<string>('../../assets/alfabe/ceren-tepki/*.webp', { eager: true, query: '?url', import: 'default' });
export const GOZ_KARELERI = ['goz-yari', 'goz-kapali'] as const;
export const TEPKI_POZLARI = ['sevinc', 'sasirma', 'dusunme', 'el-salla', 'alkis', 'isaret'] as const;
/** Paket Harf-A2: Yazma'da Ceren'in kalem pozları; A2-ek: Ses Kutusu'nda çocuğu dinleyen poz (aynı tuval, aynı klasör). */
export const A2_POZLARI = ['kalem-uzat', 'kalem-goster', 'dinliyor'] as const;
export type Tepki = typeof TEPKI_POZLARI[number] | typeof A2_POZLARI[number];
const kare = (ad: string) => kareler['../../assets/alfabe/ceren-tepki/' + ad + '.webp'];

/** Saf karar (birim testi): göz kırpma iki göz karesi de varsa açılır; bir poz yalnız kendi karesi varsa gösterilir. */
export const gozKirpmaHazir = (var_: (ad: string) => boolean) => GOZ_KARELERI.every(var_);
const gozVar = () => gozKirpmaHazir((ad) => !!kare(ad));

/** cerenYuzu'nun içine eklenen katmanlar (kare yoksa boş). */
export function cerenEkKatmani(): string {
  const goz = gozVar() ? GOZ_KARELERI.map((ad) => '<img class="alf-ceren-goz" data-goz="' + ad + '" src="' + kare(ad) + '" alt="" draggable="false" hidden>').join('') : '';
  const pozlar = [...TEPKI_POZLARI, ...A2_POZLARI].filter((ad) => kare(ad)).map((ad) => '<img class="alf-ceren-tepki" data-tepki="' + ad + '" src="' + kare(ad) + '" alt="" draggable="false" hidden>').join('');
  return goz || pozlar ? '<span class="alf-ceren-ek" aria-hidden="true">' + goz + pozlar + '</span>' : '';
}

const azHareket = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
let stil = false;
function stilKoy() {
  if (stil || typeof document === 'undefined') return;
  stil = true;
  const s = document.createElement('style');
  s.textContent = '.alf-ceren .alf-ceren-ek{position:absolute;inset:0;pointer-events:none}' +
    '.alf-ceren .alf-ceren-ek>img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom}' +
    '.alf-ceren .alf-ceren-ek>img[hidden]{display:none!important}' +
    '.alf-ceren.alf-tepkide>img{visibility:hidden}.alf-ceren.alf-tepkide .alf-ceren-goz{display:none!important}';
  document.head.append(s);
}

/** Ekranda görünen Ceren'ler bir an göz kırpar (tepki pozundayken kırpmaz). */
function kirp() {
  for (const c of document.querySelectorAll<HTMLElement>('.alf-ceren')) {
    if (c.classList.contains('alf-tepkide')) continue;
    const [yari, kapali] = GOZ_KARELERI.map((ad) => c.querySelector<HTMLImageElement>('.alf-ceren-goz[data-goz="' + ad + '"]'));
    if (!yari || !kapali) continue;
    const goster = (y: boolean, k: boolean) => { yari.hidden = !y; kapali.hidden = !k; };
    goster(true, false);
    setTimeout(() => goster(false, true), 60);
    setTimeout(() => goster(true, false), 150);
    setTimeout(() => goster(false, false), 210);
  }
}
let kirpmaKuruldu = false;
/** Göz kırpma döngüsünü bir kez kurar (kareler yoksa kurmaz). */
export function gozKirpmayiKur() {
  if (kirpmaKuruldu || typeof window === 'undefined' || !gozVar()) return;
  kirpmaKuruldu = true;
  stilKoy();
  const sonraki = () => window.setTimeout(() => { if (!document.hidden && !azHareket()) kirp(); sonraki(); }, 2600 + Math.random() * 2800);
  sonraki();
}

const zamanlar = new WeakMap<HTMLElement, number>();
/** Ceren bir an tepki pozuna geçer (kendi karesi yoksa hiçbir şey olmaz). */
export function cerenTepkisi(c: HTMLElement | undefined, ad: Tepki, sure = 1000) {
  if (!c || azHareket()) return;
  const poz = c.querySelector<HTMLImageElement>('.alf-ceren-tepki[data-tepki="' + ad + '"]');
  if (!poz) return;
  stilKoy();
  clearTimeout(zamanlar.get(c));
  c.querySelectorAll<HTMLImageElement>('.alf-ceren-tepki').forEach((p) => { p.hidden = p !== poz; });
  c.classList.add('alf-tepkide');
  zamanlar.set(c, window.setTimeout(() => { poz.hidden = true; c.classList.remove('alf-tepkide'); }, sure));
}
