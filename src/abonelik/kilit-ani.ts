/**
 * Kilitli içerik anı (çocuğun gördüğü): abonelikli bir oyuna / bölüme dokununca abonelik ekranı ve ebeveyn kapısı
 * DOĞRUDAN açılmaz. Önce sakin, kısa bir an: Mino'nun yanında yumuşakça sallanan bir asma kilit; Mino
 * "Bunu anne-babanla açabilirsin." der (content/metinler.json → kilit_cocuk; CI seslendirir).
 * - Çocuk için tek büyük düğme: "Tamam" (oyunlara döner; ücretsiz içerik açık kalır).
 * - Büyükler için küçük, yazılı düğme ("Büyükler için"): ebeveyn kapısı → abonelik ekranı (src/abonelik/ekran.ts).
 *
 * Mağaza kuralları (Google Play Aileler politikası / Teacher Approved, Apple Kids): satın alma çocuğa gösterilmez;
 * geri sayım, "hemen al", yalvaran ya da ağlayan karakter yok; kendiliğinden açılmaz, yalnız çocuk kilitli karta
 * dokununca. Art arda dokunuşlarda cümle her seferinde tekrarlanmaz (ısrar gibi durmasın).
 */
import '../styles/mino.css';
import './abonelik.css';
import { efekt, konus, sus } from '../audio/ses';
import { metin } from '../audio/metin';
import { Mino } from '../mino/mino';
import { h, sure, svg } from '../ui/dom';
import { IKON } from '../ui/ikonlar';

/** 'buyuk': büyük "Büyükler için" düğmesine bastı (kapıya geçilir); 'kapat': çocuk "Tamam" dedi ya da kapattı */
export type KilitSecimi = 'buyuk' | 'kapat';

const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Cümle en çok bu aralıkla bir söylenir (ms): kilitli kartlara art arda dokunan çocuk aynı cümleyi dinlemez */
export const KILIT_SES_ARALIGI = 20_000;
let sonSoyleme = Number.NEGATIVE_INFINITY;

/** Cümle şimdi söylensin mi (saf; birim testi için) */
export function kilitSesiSoylensinMi(simdi: number, son: number, aralik = KILIT_SES_ARALIGI): boolean {
  return simdi - son >= aralik;
}

/** Kilit anını `kok`un üstünde açar; çocuk kapatınca 'kapat', büyük düğmesine basılınca 'buyuk' döner */
export function kilitAniAc(kok: HTMLElement): Promise<KilitSecimi> {
  // çift dokunuşta ikinci bir pencere açılmaz
  if (kok.querySelector('.kl-perde:not(.cikiyor)')) return Promise.resolve('kapat');
  return new Promise((coz) => {
    const zamanlar: number[] = [];
    const sonra = (ms: number, fn: () => void) => void zamanlar.push(window.setTimeout(fn, sure(ms)));

    const mino = new Mino();
    const minoKap = h('div.kl-mino', { 'aria-hidden': 'true' }, mino.el);
    minoKap.addEventListener('pointerdown', () => {
      efekt.dokunma();
      if (!AZ_HAREKET) mino.tepki('gidik');
    });
    const kilit = h(
      'div.kl-kilit',
      { 'aria-hidden': 'true' },
      svg(IKON.kilit),
      h('i.kl-pirilti.kl-p1'),
      h('i.kl-pirilti.kl-p2'),
      h('i.kl-pirilti.kl-p3'),
    );

    const yazi = metin('kilit_cocuk');
    const tamam = h('button.dugme.kl-tamam', { type: 'button' }, svg(IKON.onay), 'Tamam');
    const buyuk = h(
      'button.kl-buyuk',
      { type: 'button', 'aria-label': 'Büyükler için' },
      svg(IKON.ebeveyn),
      h('span', {}, 'Büyükler için'),
      h('small', { lang: 'en' }, 'For grown-ups'),
    );
    const kart = h(
      'div.kl-kart',
      {},
      h('div.kl-sahne', {}, minoKap, kilit),
      h('h2.kl-baslik', { id: 'kl-baslik' }, yazi.replace(/\.$/, '')),
      tamam,
      buyuk,
    );
    const perde = h('div.kl-perde', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'kl-baslik' }, kart);

    let bitti = false;
    /** Mino'nun cümlesi şu an sürüyor mu (yalnız kendi cümlemiz susturulur; sayfanın konuşması değil) */
    let soyluyor = false;
    const bitir = (secim: KilitSecimi) => {
      if (bitti) return;
      bitti = true;
      document.removeEventListener('keydown', klavye);
      zamanlar.forEach(clearTimeout);
      // Mino'nun cümlesi kapanınca (ya da kapının üstüne binerek) sürmesin
      if (soyluyor) sus();
      perde.classList.add('cikiyor');
      window.setTimeout(() => {
        perde.remove();
        mino.kapat();
      }, sure(200));
      coz(secim);
    };
    tamam.addEventListener('click', () => {
      efekt.dokunma();
      bitir('kapat');
    });
    buyuk.addEventListener('click', () => {
      efekt.dokunma();
      bitir('buyuk');
    });
    perde.addEventListener('click', (e) => e.target === perde && bitir('kapat'));
    // Esc (ve Android geri tuşu: src/kabuk/yerel.ts Esc gönderir) kapatır
    const klavye = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      bitir('kapat');
    };
    document.addEventListener('keydown', klavye);

    kok.append(perde);
    efekt.kilitNazik();
    sonra(250, () => {
      if (!AZ_HAREKET) mino.tepki('selam');
    });
    if (kilitSesiSoylensinMi(Date.now(), sonSoyleme))
      sonra(350, () => {
        sonSoyleme = Date.now();
        soyluyor = true;
        void konus(yazi).finally(() => (soyluyor = false));
      });
  });
}
