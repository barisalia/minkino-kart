/**
 * Vücudum adası · Touch Your Knees! (6. ders): ortada Kino'nun tam boy önden çizimi (İngilizce Paket 27-K). Polly bir yer
 * söyler ("Touch your knees!"), çocuk Kino'da o yere dokunur; Kino'nun o yeri parlar. Turun yarısından sonra Polly
 * "Faster!" der: bekleme kısalır. Yanlış yerde "Hmm, not that one!" ve istek yinelenir; ikinci ıskada doğru yer parlar.
 * Dokunma bölgeleri ada-oyunlari-veri2.ts → BEDEN (tuvalin yüzdesi). Çizim gelmeden ders yedek adımı oynar.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { dugme, ipucuKur, kutla, salla } from '../kit';
import { tik } from '../ses';
import { TASLAK } from '../varlik';
import { BEDEN, type AdaOyunu2, type Bolge } from './ada-oyunlari-veri2';
import { cizimYa } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

const BEDEN_TR: Record<string, string> = { hair: 'saç', shoulders: 'omuz', arms: 'kol', fingers: 'parmak', tummy: 'karın', knees: 'diz', toes: 'ayak parmağı', teeth: 'diş' };

export function vucutDokunKur(b: AdimBaglami, o: Extract<AdaOyunu2, { ad: 'dokun' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-dokun');
  const kino = h('div.ing-ao-beden');
  kino.append(cizimYa('oyun/vucut/kino', 'ing-ao-beden-resim', 'Kino'));
  const bolgeler: HTMLButtonElement[] = [];
  for (const [ad, kutular] of Object.entries(BEDEN)) {
    kutular.forEach(([s, u, sg, al], i) => {
      const d = dugme('ing-ao-kart ing-ao-bolge', BEDEN_TR[ad], () => void dokun(ad, d));
      // ikinci bölgenin (sağ omuz, sağ diz…) kimliği ayrı: testler ilkine dokunur
      d.dataset.kart = i === 0 ? ad : `${ad}-${i + 1}`;
      d.dataset.bolge = ad;
      d.style.cssText = `left:${s}%;top:${u}%;width:${sg - s}%;height:${al - u}%`;
      bolgeler.push(d);
      kino.append(d);
    });
  }
  const yazi = h('p.ing-ao-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  masa.append(h('div.ing-ao-sahne', {}, kino), yazi);

  let no = 0, yanlis = 0, kilit = true;
  const hedef = (): Bolge => o.turlar[no];
  const komut = () => `en/g-touch-${hedef()}`;
  const bekle = (v: boolean) => { kilit = !v; kino.dataset.bekliyor = String(v); };
  b.tekrarla(() => { if (!kilit) void y.soyle(komut()); });

  async function tur() {
    yanlis = 0; bekle(false);
    bolgeler.forEach((d) => d.classList.remove('ing-parla', 'ing-ao-dokunuldu'));
    if (TEST_MODU || TASLAK) kino.dataset.hedef = hedef();
    yazi.textContent = `Touch your ${hedef()}!`;
    // yarıdan sonra hızlanır
    const hizli = no >= Math.ceil(o.turlar.length / 2);
    if (no === Math.ceil(o.turlar.length / 2) && !(await y.soyle('en/g-faster'))) return;
    if (!(await y.dur(hizli ? 150 : 400)) || !(await y.soyle(komut()))) return;
    bekle(true);
    ipucuKur(() => (yanlis >= 2 ? bolgeler.find((d) => d.dataset.bolge === hedef()) : null), 5000);
  }

  async function dokun(ad: string, d: HTMLButtonElement) {
    if (kilit) return;
    bekle(false);
    if (ad !== hedef()) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(kino);
      if (!(await y.soyle('en/g-not-that', komut()))) return;
      if (yanlis >= 2) bolgeler.filter((x) => x.dataset.bolge === hedef()).forEach((x) => x.classList.add('ing-parla'));
      bekle(true);
      return;
    }
    ipucuKur(undefined);
    tik.yapis();
    b.cevap(ad, yanlis === 0);
    bolgeler.filter((x) => x.dataset.bolge === ad).forEach((x) => x.classList.add('ing-ao-dokunuldu'));
    kutla(d);
    if (!(await y.soyle('en/g-yes'))) return;
    no++;
    if (no < o.turlar.length) { void tur(); return; }
    if (!(await y.soyle('en/g-well-done'))) return;
    b.bitti();
  }

  void (async () => {
    if (b.ilkKez('ao-dokun') && !(await y.soyle('tr/c-dokun-giris'))) return;
    void tur();
  })();
  return () => y.kapat();
}
