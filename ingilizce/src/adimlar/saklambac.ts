/**
 * Hide & Seek with Mino (Oyunlar, 20 Kasım 2026): yer bildiren sözler in, on, under, next to.
 * Mino odada saklanır; Polly "Where is Mino?" der, çocuk bulur, Polly "Mino is under the table!" der. Sonra tersine:
 * Polly "Put the ball on the table!" der, çocuk odada doğru yere dokunur, top oraya uçar ("The ball is on the table!").
 * Üç basamak: 2–3 yaş in ve on; 4 yaş + under; 5+ + next to ve çocuk cümleyi kendi söyler (mikrofon varsa).
 * Bir oturumda 4 tur (bul, koy, bul, koy); aynı yer (söz + eşya) iki kez gelmez; o yaşın en yeni sözü mutlaka gelir.
 *
 * Çizimler (Astra, İngilizce Paket 23 → assets/ingilizce/oyun/saklambac/): 1600 × 900 oda fonu, aynı tuvalde Mino'nun
 * dört saklanma pozu, Mino bulunca, top, ayı. Dokunma bölgeleri fondaki eşyaların piksel yerlerinden (yüzde) gelir.
 * Çizimi ve sesi gelmeden oyun Oyunlar'da görünmez; taslak ve test kipinde yer tutucuyla oynanır.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { cizim, dugme, hareket, ipucuKur, kelimeResmi, kutla, noktalar, salla, ucur } from '../kit';
import { kelimeBul } from '../icerik';
import { tik } from '../ses';
import { resim, sesAdresi, TASLAK } from '../varlik';
import { oyunDuzeni, soylet, yasam, type AdimKurucu } from './ortak';
import './saklambac.css';

import { NESNE_CIZIMI, YERLER, edatKimligi, saklambacSesMetinleri, yerSozu, type Edat, type Nesne, type YerId } from './saklambac-veri';
export { saklambacPlani, saklambacSesleri, saklambacSesMetinleri, type SaklambacTuru } from './saklambac-veri';
const CIZIM = (ad: string) => `oyun/saklambac/${ad}`;

const CIZIMLER = ['oda', 'mino-kutuda', 'mino-masa-altinda', 'mino-yatakta', 'mino-sandalye-yaninda', 'mino-buldum', 'top', 'ayi'];
/** Oyunlar'da görünür mü: Astra'nın yedi çizimi ve bütün kayıtlar diskte (taslak ve test kipinde her zaman) */
export function saklambacHazir(): boolean {
  if (TASLAK || TEST_MODU) return true;
  return CIZIMLER.every((ad) => !!resim(CIZIM(ad))) && saklambacSesMetinleri().every((s) => !!sesAdresi(s.id));
}

// ---------------------------------------------------------------- oyun

export const saklambacKur: AdimKurucu<'saklambac'> = (b, a) => {
  const y = yasam();
  let no = 0, yanlis = 0, kilitli = true;
  // kilit: dokunuşlar yalnız Polly sorusunu bitirince alınır; oda bunu data-bekliyor ile gösterir (testler bekler)
  const kilit = { get v() { return kilitli; }, set v(x: boolean) { kilitli = x; oda.dataset.bekliyor = String(!x); } };
  const tur = () => a.turlar[no];
  // test kipinde akış izi (window.__sk): hangi turda ne oldu
  const iz = (x: string) => { if (TEST_MODU) ((window as unknown as { __sk?: string[] }).__sk ??= []).push(no + ':' + x); };
  const komut = () => { const t = tur(); return t.tur === 'bul' ? 'en/g-where-is-mino' : `en/g-put-${t.nesne}-${t.yer}`; };
  const sor = () => { if (!kilit.v) void y.soyle(komut()); };
  const { masa } = oyunDuzeni(b.alan, 'ing-saklambac', sor);

  // ---- oda: fon (yoksa yer tutucu eşyalar), dokunma bölgeleri, Mino ve oyuncak katmanı
  const oda = h('div.ing-sk-oda');
  const fon = cizim(CIZIM('oda'), 'ing-sk-fon');
  if (fon) oda.append(fon);
  else oda.append(...(['box', 'table', 'bed', 'chair'] as const).map((e) => h(`span.ing-sk-yer-esya.ing-sk-${e}`, {}, e)));
  const bolgeler = new Map<YerId, HTMLButtonElement>();
  for (const id of Object.keys(YERLER) as YerId[]) {
    const [s, u, sg, al] = YERLER[id].bolge;
    const d = dugme('ing-sk-bolge', yerSozu(id), () => void dokun(id, d));
    d.dataset.yer = id;
    d.style.cssText = `left:${s}%;top:${u}%;width:${sg - s}%;height:${al - u}%`;
    bolgeler.set(id, d);
    oda.append(d);
  }
  const katman = h('div.ing-sk-katman', { 'aria-hidden': 'true' });
  oda.append(katman);
  // edat taşı: Polly söyleyince yanar ("under")
  const tas = h('span.ing-sk-tas', { 'aria-live': 'polite' });
  // oyuncak tepsisi: koy turlarında Polly'nin verdiği oyuncak
  const tepsi = h('div.ing-sk-tepsi');
  const ilerleme = h('div.ing-sk-ilerleme');
  masa.append(h('div.ing-sk-sahne', {}, ilerleme, oda, h('div.ing-sk-alt', {}, tepsi, tas)));

  const konumla = (el: HTMLElement, [x, yy]: [number, number], gen: number) => { el.style.cssText = `left:${x - gen / 2}%;bottom:${100 - yy}%;width:${gen}%`; };
  const minoPozu = (id: YerId) => {
    const ad = YERLER[id].mino!;
    const img = cizim(CIZIM(ad), 'ing-sk-mino');
    if (img) return img;
    const yer = h('span.ing-sk-mino.ing-sk-mino-yer', {}, 'Mino');
    konumla(yer, YERLER[id].dayanak, 7);
    return yer;
  };
  const oyuncak = (n: Nesne, sinif: string) => {
    const img = cizim(CIZIM(NESNE_CIZIMI[n]), sinif);
    if (img) return img;
    const w = kelimeBul(n);
    return w ? kelimeResmi(w, sinif) : h(`span.${sinif}`, {}, n);
  };
  const tasYak = (e: Edat) => { iz('edat ' + e); tas.textContent = e; tas.classList.remove('ing-sk-yanik'); void tas.offsetWidth; tas.classList.add('ing-sk-yanik'); };

  async function turBaslat() {
    kilit.v = true; yanlis = 0;
    katman.replaceChildren(); tepsi.replaceChildren(); tas.textContent = ''; tas.classList.remove('ing-sk-yanik');
    bolgeler.forEach((d) => d.classList.remove('ing-parla'));
    ilerleme.replaceChildren(noktalar(a.turlar.length, no));
    const t = tur();
    oda.dataset.tur = t.tur;
    if (TEST_MODU || TASLAK) { oda.dataset.hedef = t.yer; oda.dataset.no = String(no); }
    if (t.tur === 'bul') katman.append(minoPozu(t.yer));
    else tepsi.append(h('span.ing-sk-oyuncak', { 'data-nesne': t.nesne }, oyuncak(t.nesne!, 'ing-sk-oyuncak-resim')));
    if (!(await y.dur(400)) || !(await y.soyle(komut()))) return;
    kilit.v = false;
    ipucuKur(() => (yanlis >= 2 ? bolgeler.get(tur().yer) : null), 6000);
  }

  async function dokun(id: YerId, d: HTMLButtonElement) {
    if (kilit.v) return;
    const t = tur();
    if (id !== t.yer) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit.v = true;
      if (!(await y.soyle('en/g-not-there', komut()))) return;
      if (yanlis >= 2) bolgeler.get(t.yer)?.classList.add('ing-parla');
      kilit.v = false;
      return;
    }
    kilit.v = true;
    iz('dogru ' + id);
    ipucuKur(undefined);
    tik.yapis();
    const yer = YERLER[t.yer];
    let cumle: string;
    if (t.tur === 'bul') {
      // Mino saklandığı yerden sevinçle çıkar
      katman.replaceChildren();
      const sevinc = cizim(CIZIM('mino-buldum'), 'ing-sk-buldum') ?? h('span.ing-sk-buldum.ing-sk-mino-yer', {}, 'Mino!');
      konumla(sevinc, yer.dayanak, 18);
      katman.append(sevinc);
      kutla(sevinc);
      cumle = `en/g-mino-${t.yer}`;
    } else {
      // oyuncak tepsiden söylenen yere uçar ve orada kalır
      const kaynak = tepsi.querySelector<HTMLElement>('.ing-sk-oyuncak')!;
      const kondu = oyuncak(t.nesne!, 'ing-sk-konan');
      konumla(kondu, yer.dayanak, t.nesne === 'ball' ? 7 : 9);
      kondu.style.visibility = 'hidden';
      katman.append(kondu);
      await ucur(kaynak, kondu);
      kondu.style.visibility = '';
      kaynak.remove();
      kutla(kondu);
      cumle = `en/g-is-${t.nesne}-${t.yer}`;
    }
    void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', cumle))) { iz('kesildi-cumle'); return; }
    tasYak(yer.edat);
    if (!(await y.soyle(`en/w-${edatKimligi(yer.edat)}`))) { iz('kesildi-edat'); return; }
    // 5+: çocuk cümleyi kendi söyler (mikrofon varsa dinlenir; yoksa yıldız düğmesi)
    if (b.yas === '5+' && t.tur === 'bul') {
      if (!(await y.soyle('en/g-now-you'))) return;
      await soylet(tas.parentElement!, y, { beklenen: `Mino is ${yerSozu(t.yer)}`, ornek: cumle });
      if (!y.acik) return;
    }
    if (!(await y.dur(500))) return;
    no++;
    iz('sonraki');
    if (no < a.turlar.length) { void turBaslat(); return; }
    b.bitti();
  }

  b.tekrarla(sor);
  void (async () => {
    if (b.ilkKez('saklambac') && !(await y.soyle('tr/c-saklambac-giris'))) return;
    if (!(await y.soyle('en/g-hide-and-seek'))) return;
    void turBaslat();
  })();
  return () => y.kapat();
};
