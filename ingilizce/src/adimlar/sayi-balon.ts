/**
 * Sayılar 2 adası · Count to Ten (6. ders): gökyüzünde üstünde sayı yazan balonlar karışık durur (2–3 yaş 1–5, 4 yaş
 * 1–10, 5+ 1–12). Polly sırayla sayar ("One!"), çocuk o balonu patlatır; yanlış balonda "Hmm, not that one!" ve sayı
 * yinelenir, ikinci ıskada doğru balon parlar. Sonunda "Great counting!". Çizim: Balon Patlat'ın balonları (yeni yok).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { cizim, dugme, ipucuKur, kutla, salla } from '../kit';
import { tik } from '../ses';
import { TASLAK } from '../varlik';
import { SAYI_ADI, balonRengi, type AdaOyunu2 } from './ada-oyunlari-veri2';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';

export function sayiBalonKur(b: AdimBaglami, o: Extract<AdaOyunu2, { ad: 'say10' }>): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-say10');
  const gok = h('div.ing-ao-balonlar');
  gok.dataset.adet = String(o.son);
  const sira = Array.from({ length: o.son }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  const balonlar = new Map<number, HTMLButtonElement>();
  sira.forEach((n, i) => {
    const d = dugme('ing-ao-kart ing-ao-balon', SAYI_ADI[n], () => void patlat(n, d),
      cizim(`oyun/balon-${balonRengi(n)}`, 'ing-ao-balon-resim') ?? h('span.ing-ao-yer', {}, ''), h('strong.ing-ao-balon-sayi', {}, String(n)));
    d.dataset.kart = String(n);
    d.style.setProperty('--n', String(i));
    balonlar.set(n, d);
    gok.append(d);
  });
  const yazi = h('p.ing-ao-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  masa.append(gok, yazi);

  let siradaki = 1, yanlis = 0, kilit = true;
  const soz = () => `en/w-${SAYI_ADI[siradaki]}`;
  const bekle = (v: boolean) => { kilit = !v; gok.dataset.bekliyor = String(v); };
  b.tekrarla(() => { if (!kilit) void y.soyle(soz()); });

  async function sor() {
    yanlis = 0; bekle(false);
    if (TEST_MODU || TASLAK) gok.dataset.hedef = String(siradaki);
    if (!(await y.dur(250)) || !(await y.soyle(soz()))) return;
    bekle(true);
    ipucuKur(() => (yanlis >= 2 ? balonlar.get(siradaki) : null), 5000);
  }

  async function patlat(n: number, d: HTMLButtonElement) {
    if (kilit) return;
    bekle(false);
    if (n !== siradaki) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      if (!(await y.soyle('en/g-not-that', soz()))) return;
      if (yanlis >= 2) balonlar.get(siradaki)?.classList.add('ing-parla');
      bekle(true);
      return;
    }
    ipucuKur(undefined);
    tik.yapis();
    // balon patlar, yerinde sayı kalır (sayılanlar görünür)
    const pat = cizim('oyun/balon-pat', 'ing-ao-balon-pat');
    if (pat) d.append(pat);
    d.classList.add('ing-ao-patladi');
    d.disabled = true;
    kutla(d);
    yazi.textContent = Array.from({ length: n }, (_, i) => SAYI_ADI[i + 1]).join(', ');
    siradaki++;
    if (siradaki <= o.son) { void sor(); return; }
    if (!(await y.dur(400)) || !(await y.soyle('en/g-great-counting'))) return;
    b.bitti();
  }

  void (async () => {
    if (b.ilkKez('ao-say10') && !(await y.soyle('tr/c-say10-giris'))) return;
    if (!(await y.soyle(o.son === 12 ? 'en/g-count-twelve' : o.son === 5 ? 'en/g-count-five' : 'en/g-count-ten'))) return;
    void sor();
  })();
  return () => y.kapat();
}
