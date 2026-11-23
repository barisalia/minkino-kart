/**
 * Hava adası · Polly's Weather Window (6. ders): Kino dışarı çıkacak. Perde kapalı; çocuk pencereye dokununca perde açılır,
 * Polly havayı söyler ("It's rainy today."). Sonra "Put on your jacket!": çocuk o havaya uygun giysiyi seçer, giysi
 * Kino'nun üstüne oturur (Kino'yu Giydir katmanları, Paket 12). İki hava; 2–3 yaşta her havada bir, büyüklerde iki giysi.
 * Havanın bütün giysileri giyilince "Kino is ready. Let's go outside!", perde kapanır, sıradaki hava.
 * Çizim: pencere ve iki perde kanadı (İngilizce Paket 25), havaların kelime resimleri (Paket 17). Gelmeden ders yedek
 * adımı (Polly'nin Dürbünü) oynar; taslak ve test kipinde yer tutucuyla açılır.
 */
import { h } from '../../../src/ui/dom';
import { cizim, dugme, kutla, ucur } from '../kit';
import { tik } from '../ses';
import { HAVALAR, type AdaOyunu, type Hava } from './ada-oyunlari-veri';
import { cizimYa, kelimeKarti, secimBaslat } from './ada-secim';
import { GIYSI_SIRASI } from './giydir';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

const HAVA_YAZISI: Record<Hava, string> = { sun: 'It’s sunny today.', rain: 'It’s rainy today.', snow: 'It’s snowy today.' };

export function havaPenceresiKur(b: AdimBaglami, o: Extract<AdaOyunu, { ad: 'pencere' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-pencere');
  // giysi giysi turlar: her havanın giysileri sırayla
  const turlar = o.turlar.flatMap((t, ti) => t.giysiler.map((g, gi) => ({ hava: t.hava, giysi: g, raf: t.raf, ilk: gi === 0, son: gi === t.giysiler.length - 1, ti })));

  // ---- pencere: arkada hava, önde çerçeve ve iki perde kanadı
  const manzara = h('div.ing-ao-manzara');
  let perdeAcilinca: (() => void) | undefined;
  const pencere = dugme('ing-ao-pencere-dugme', 'Perdeyi aç', () => {
    if (!perdeAcilinca) return;
    tik.dokun();
    pencere.classList.add('ing-ao-acik');
    const f = perdeAcilinca; perdeAcilinca = undefined; f();
  }, manzara,
  cizim('oyun/hava/pencere', 'ing-ao-cerceve'),
  cizimYa('oyun/hava/perde-sol', 'ing-ao-perde ing-ao-perde-sol', 'perde'),
  cizimYa('oyun/hava/perde-sag', 'ing-ao-perde ing-ao-perde-sag', 'perde'));

  // ---- Kino: gövde ve giysi katmanları aynı tuvalde (oyun/giydir/)
  const kino = h('div.ing-ao-giyen');
  kino.append(cizimYa('oyun/giydir/kino-0', 'ing-ao-govde', 'Kino'));
  const katman = new Map<string, HTMLElement>();
  GIYSI_SIRASI.forEach((id, z) => {
    const kat = cizim(`oyun/giydir/${id}`, 'ing-ao-kat') ?? h('span.ing-ao-kat.ing-ao-kat-yer', {}, id);
    kat.style.zIndex = String(2 + z);
    kat.dataset.giysi = id;
    kino.append(kat);
    katman.set(id, kat);
  });
  const yazi = h('p.ing-ao-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  const raf = h('div.ing-secenekler.ing-ao-kartlar');
  masa.append(h('div.ing-ao-sahne', {}, pencere, kino), yazi, raf);
  const giyili = new Set<string>();

  /** Perdeyi kapatır, havayı arkaya koyar; çocuk dokununca açılır ve Polly havayı söyler */
  async function havaAc(hava: Hava): Promise<boolean> {
    katman.forEach((k) => k.classList.remove('ing-ao-giyili'));
    giyili.clear();
    pencere.classList.remove('ing-ao-acik');
    manzara.replaceChildren(kelimeKarti(hava, 'ing-ao-hava').el);
    pencere.dataset.hava = hava;
    yazi.textContent = '';
    if (!(await y.dur(350)) || !(await y.soyle('en/g-open-curtains'))) return false;
    pencere.dataset.bekliyor = 'true';
    await new Promise<void>((coz) => { perdeAcilinca = coz; y.kapaninca(coz); });
    pencere.dataset.bekliyor = 'false';
    if (!y.acik) return false;
    yazi.textContent = HAVA_YAZISI[hava];
    if (!(await y.dur(500)) || !(await y.soyle(HAVALAR[hava].ses))) return false;
    return true;
  }

  secimBaslat({
    b, y, kutu: raf, turSayisi: turlar.length,
    tur: (i) => {
      const t = turlar[i];
      return {
        hedef: t.giysi, kelime: t.giysi, soru: [`en/g-put-on-${t.giysi}`],
        kartlar: t.raf.filter((g) => !giyili.has(g)).map((g) => kelimeKarti(g)),
        hazirla: async () => (t.ilk ? havaAc(t.hava) : y.dur(150)),
      };
    },
    yanlis: (id) => [`en/w-${id}`, 'en/g-not-that'],
    dogru: async (i, d) => {
      const t = turlar[i];
      const kat = katman.get(t.giysi);
      if (kat) await ucur(d, kat, { kucul: 0.6 });
      kat?.classList.add('ing-ao-giyili');
      giyili.add(t.giysi);
      kutla(kino);
      if (!(await y.soyle('en/g-yes', `en/w-${t.giysi}`))) return false;
      if (t.son && !(await y.soyle('en/g-lets-go-out'))) return false;
      return y.dur(t.son ? 700 : 300);
    },
    giris: async () => !b.ilkKez('ao-pencere') || y.soyle('tr/c-pencere-giris'),
  });
  return () => y.kapat();
}
