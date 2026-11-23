/**
 * Renkli Kino (Oyunlar; İngilizce yol haritası #5, 21 Kasım 2026): renkler ve kıyafetler birlikte. Solda Kino (Kino'yu
 * Giydir gövdesi, Paket 12), sağda dolap: her giysi her renkte. Polly "Put on the red hat!" der; çocuk doğru renkteki
 * doğru giysiyi seçer, giysi Kino'nun üstüne oturur. Yanlış renkte rengin adını, yanlış giyside giysinin adını duyar.
 * Hepsi giyilince "Kino is ready!", fotoğraf ("Say cheese!") ve Polly şapkayla çorabı söyler: "A red hat and blue socks!"
 * Çizim: İngilizce Paket 29 (her giysinin dört renk katmanı Kino tuvalinde + dolap resimleri). Renkler ve Kıyafetler
 * adaları bitince ve çizimler gelince Oyunlar'da açılır; taslak ve test kipinde yer tutucuyla.
 */
import { h } from '../../../src/ui/dom';
import { cizim, kutla, ucur } from '../kit';
import { renkliKimlik, renkliSonuc, type AdaOyunu2, type Giysi } from './ada-oyunlari-veri2';
import { cizimYa, secimBaslat, type Kart } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

const RENK_TR: Record<string, string> = { red: 'kırmızı', blue: 'mavi', yellow: 'sarı', green: 'yeşil' };
const GIYSI_TR: Record<string, string> = { hat: 'şapka', 't-shirt': 'tişört', socks: 'çorap', jacket: 'ceket' };
const SIRA: readonly Giysi[] = ['socks', 't-shirt', 'jacket', 'hat'];

export function renkliKinoKur(b: AdimBaglami, o: Extract<AdaOyunu2, { ad: 'renkli' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-renkli');
  const kino = h('div.ing-ao-giyen.ing-ao-rk-kino');
  const govde0 = cizimYa('oyun/giydir/kino-0', 'ing-ao-govde', 'Kino');
  const govde1 = cizim('oyun/giydir/kino-1', 'ing-ao-govde');
  kino.append(govde0);
  if (govde1) { govde1.hidden = true; kino.append(govde1); }
  const katmanlar = new Map<string, HTMLElement>();
  for (const g of o.giysiler) for (const r of o.renkler) {
    const id = renkliKimlik(r, g);
    const kat = cizim(`oyun/renkli/${id}`, 'ing-ao-kat') ?? h('span.ing-ao-kat.ing-ao-kat-yer', {}, `${RENK_TR[r]} ${GIYSI_TR[g]}`);
    kat.style.zIndex = String(2 + SIRA.indexOf(g));
    kat.style.setProperty('--z', String(SIRA.indexOf(g) * 22));
    katmanlar.set(id, kat);
    kino.append(kat);
  }
  const flas = h('div.ing-ao-rk-flas', { 'aria-hidden': 'true' });
  const yazi = h('p.ing-ao-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  const dolap = h('div.ing-ao-rk-dolap');
  dolap.dataset.sutun = String(o.renkler.length);
  masa.append(h('div.ing-ao-sahne', {}, kino, flas, dolap), yazi);
  const giyili = new Set<Giysi>();

  const kart = (g: Giysi, r: string): Kart => {
    const id = renkliKimlik(r, g);
    const el = cizimYa(`oyun/renkli/raf-${id}`, 'ing-ao-rk-raf', `${RENK_TR[r]} ${GIYSI_TR[g]}`);
    el.dataset.renk = r;
    return { id, etiket: `${RENK_TR[r]} ${GIYSI_TR[g]}`, el };
  };

  secimBaslat({
    b, y, kutu: dolap, turSayisi: o.turlar.length,
    tur: (i) => {
      const t = o.turlar[i];
      // dolapta yalnız henüz giyilmemiş giysiler durur; her biri her renkte (satır giysi, sütun renk)
      const kartlar = o.giysiler.filter((g) => !giyili.has(g)).flatMap((g) => o.renkler.map((r) => kart(g, r)));
      return { hedef: renkliKimlik(t.renk, t.giysi), kelime: t.renk, soru: [`en/g-rk-${renkliKimlik(t.renk, t.giysi)}`], kartlar };
    },
    yanlis: (id, t) => {
      const [renk, ...g] = id.split('-');
      const giysi = g.join('-');
      const [hRenk] = t.hedef.split('-');
      // doğru giysi yanlış renk: rengin adı; yanlış giysi: giysinin adı
      return [renk !== hRenk && t.hedef.endsWith(giysi) ? `en/w-${renk}` : `en/w-${giysi}`, 'en/g-not-that'];
    },
    dogru: async (i, d) => {
      const t = o.turlar[i];
      const kat = katmanlar.get(renkliKimlik(t.renk, t.giysi));
      if (kat) await ucur(d, kat, { kucul: 0.6 });
      kat?.classList.add('ing-ao-giyili');
      giyili.add(t.giysi);
      kutla(kino);
      if (!(await y.soyle('en/g-yes', `en/w-${t.renk}`))) return false;
      return y.dur(250);
    },
    giris: async () => (!b.ilkKez('ao-renkli') || (await y.soyle('tr/c-renkli-giris'))) && y.soyle('en/g-rk-giris'),
    bitis: async () => {
      if (govde1) { govde0.hidden = true; govde1.hidden = false; }
      if (!(await y.soyle('en/g-kino-ready', 'en/g-say-cheese'))) return false;
      flas.classList.remove('ing-ao-rk-cekildi'); void flas.offsetWidth; flas.classList.add('ing-ao-rk-cekildi');
      kutla(kino);
      const sonuc = renkliSonuc(o);
      yazi.textContent = sonuc.metin;
      return (await y.soyle(sonuc.id)) && y.dur(800);
    },
  });
  return () => y.kapat();
}
