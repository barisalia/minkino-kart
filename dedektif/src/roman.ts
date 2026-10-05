/**
 * Ödül: vaka çizgi romanı. Dosyadaki 4 "demek ki" kartı uçup 4 kareli bir çizgi roman olur; Mino hikâyenin tamamını
 * bir kez okur, kareler sırayla parlar; "Çözüldü!" mührü basılır. Albümde ("Vaka Dosyam") yeniden açılır.
 *
 * Kareler: Gemini'nin çizeceği roman-1..4 (assets/dedektif) varsa onlar; yoksa oyunun kendi çizimlerinden kurulur
 * (oda kırpımı + eşyalar + Pamuk): 1 halıda pati izi ve büyüteç, 2 Pamuk masaya zıplıyor, 3 kelebeği kovalarken lamba
 * devriliyor, 4 Pamuk yatağın altında.
 */
import D from '../../content/dedektif.json';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET } from './dunya';
import { oynat } from './efekt';
import { ROMAN, type RomanKaresi } from './mantik';
import { filmKatmani, resim } from './resimler';

const img = (ad: string, sinif: string) => h(`img.${sinif}`, { src: resim(ad) ?? '', alt: '', draggable: 'false' });

/** Oda kırpımı: aynı ayarla üst üste katmanlar (çalışma odası üç katman) */
function zemin(urller: string[], boy: number, x: number, y: number): HTMLElement {
  return h('div.dd-kare-zemin', {}, ...urller.filter(Boolean).map((u) => h('i', { style: `background-image:url("${u}");background-size:${boy}% auto;background-position:${x}% ${y}%` })));
}
const CALISMA = () => [filmKatmani('ev', 'arka-uzak'), filmKatmani('ev', 'arka-orta'), filmKatmani('ev', 'arka-on')];

/** Çizgi roman karesi: sıra ve resim (Vaka 1 karelerinin bir de yedek kurgusu var) */
export type Kare = Pick<RomanKaresi, 'sira' | 'resim'> & { kurgu?: RomanKaresi['kurgu'] };

/** Bir karenin içi (Gemini karesi ya da yedek kurgu) */
export function kareIcerik(k: Kare): HTMLElement {
  const g = resim(k.resim);
  if (g || !k.kurgu) return h('div.dd-kare-ic', {}, h('img.dd-kare-resim', { src: g ?? '', alt: '', draggable: 'false' }));
  switch (k.kurgu) {
    case 'iz':
      return h('div.dd-kare-ic.dd-kurgu-iz', {}, zemin(CALISMA(), 330, 50, 100), img('kart-kedi-pati-izi', 'dd-k-iz'), h('div.dd-k-buyutec', {}, h('i.bt-halka'), h('i.bt-sap')));
    case 'zipla':
      return h('div.dd-kare-ic.dd-kurgu-zipla', {}, zemin(CALISMA(), 250, 66, 62), img('masa', 'dd-k-masa'), h('i.dd-k-hiz'), img('pamuk-b', 'dd-k-pamuk'));
    case 'devril':
      return h('div.dd-kare-ic.dd-kurgu-devril', {}, zemin(CALISMA(), 230, 52, 40), img('kart-sari-kelebek', 'dd-k-kelebek'), img('lamba-dik', 'dd-k-lamba'), h('i.dd-k-kavis'), img('pamuk-b', 'dd-k-pamuk'));
    case 'saklan':
      return h('div.dd-kare-ic.dd-kurgu-saklan', {}, zemin([resim('yatak-odasi') ?? ''], 240, 12, 92), h('i.dd-k-karanlik'), img('pamuk-b', 'dd-k-pamuk'), h('i.dd-k-toz'));
  }
}

export interface Roman {
  el: HTMLElement;
  kareler: HTMLElement[];
  /** düğmeler (albüm, tekrar, menü) buraya */
  alt: HTMLElement;
  muhur: HTMLElement;
}

/** Çizgi roman sayfası (kareler henüz görünmez: goster() ile gelir). Vaka 2 kendi karelerini ve başlığını verir. */
export function romanKur(kareTablosu: readonly Kare[] = ROMAN, baslik: string = D.vaka, vaka = 'vaka1'): Roman {
  const kareler = kareTablosu.map((k) => h('div.dd-kare', { 'data-kare': String(k.sira), style: `--i:${k.sira - 1}` }, kareIcerik(k), h('b.dd-kare-no', {}, String(k.sira))));
  const muhur = h('div.dd-muhur', {}, D.yazi.cozuldu);
  const alt = h('div.dd-roman-alt');
  const el = h('div.dd-roman', { 'data-ekran-ici': 'roman', 'data-vaka': vaka }, h('div.dd-roman-sayfa', {}, h('h2.dd-roman-baslik', {}, baslik), h('div.dd-roman-izgara', {}, ...kareler), muhur), alt);
  return { el, kareler, alt, muhur };
}

/**
 * Kareleri getirir: kaynaklar verilirse (dosyanın gözleri) her kare kendi gözünden uçup yerine oturur.
 * ses: her karede küçük bir ses.
 */
export async function kareleriGetir(r: Roman, kaynaklar: (HTMLElement | null)[], ses: (i: number) => void) {
  r.el.classList.add('acik');
  await new Promise((c) => setTimeout(c, sure(80)));
  const hepsi = r.kareler.map(async (k, i) => {
    await new Promise((c) => setTimeout(c, sure(160 + i * 240)));
    ses(i);
    k.classList.add('geldi');
    const kaynak = kaynaklar[i];
    if (!kaynak || AZ_HAREKET || TEST_MODU) return;
    const a = kaynak.getBoundingClientRect();
    const b = k.getBoundingClientRect();
    const s = Math.max(0.12, a.width / Math.max(1, b.width));
    await k
      .animate(
        [
          { transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${s}) rotate(-12deg)`, opacity: 0.4 },
          { transform: 'translate(0, -16px) scale(1.06) rotate(2deg)', opacity: 1, offset: 0.75 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 620, easing: 'cubic-bezier(.3,.9,.4,1)', fill: 'backwards' },
      )
      .finished.catch(() => undefined);
  });
  await Promise.all(hepsi);
}

/** Okurken kareler sırayla parlar (cümlenin yaklaşık ritmiyle) */
export function sirayla(r: Roman, toplamMs: number): () => void {
  const zaman: number[] = [];
  r.kareler.forEach((k, i) => {
    zaman.push(
      window.setTimeout(() => {
        r.kareler.forEach((x) => x.classList.toggle('okunuyor', x === k));
        oynat(k, 'dd-kare-zipla');
      }, sure((toplamMs / r.kareler.length) * i)),
    );
  });
  zaman.push(window.setTimeout(() => r.kareler.forEach((x) => x.classList.remove('okunuyor')), sure(toplamMs + 300)));
  return () => zaman.forEach(clearTimeout);
}
