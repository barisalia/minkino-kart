/**
 * Bölüm 2 çocukları (Ada, Can; Elif gelince o da): tasarımcının parçalı iskeleti (ekip/cocuk → assets/karakter-iskelet)
 * ortak Karakter bileşeniyle oynar: nefes, göz kırpma, konuşurken ağız, el sallama, zıplama sevinci, yürürken
 * bacak/kol, cee-ee'de eller, kuklayı tutan kol. Oyuncu (macera/src/oyuncu.ts) yer, yürüyüş, balon ve gölgeyi
 * yönetmeye devam eder; iskeletin karşılığı olmayan pozlarda (ör. "saklanıyor": parmak dudakta) poz resmi görünür.
 * İskelet yoksa (ör. Elif şimdilik) oyuncu eskisi gibi resimlerle oynar.
 *
 * Hiza: iskelet (2048'lik çizim) parti tuvaline tasarımcının formülüyle oturur (tuval px = a·x + b), böylece
 * boy, ayak çizgisi ve gölge parti pozlarıyla aynı kalır.
 */
import { h } from '../../src/ui/dom';
import { iskeletVar, Karakter, type Poz as KPoz } from '../../src/karakter/karakter';
import '../../src/karakter/karakter.css';
import { Oyuncu, type OyuncuSecenek, type Poz } from './oyuncu';

/** Çizimden parti tuvaline: tuval px = a·çizim + (bx, by); tuval [en, boy] (tasarımcının notu) */
const HIZA: Record<string, { a: number; bx: number; by: number; tuval: [number, number] }> = {
  ada: { a: 0.2523, bx: -84.6, by: 106.9, tuval: [345, 622] },
  can: { a: 0.3171, bx: -111.9, by: -25.9, tuval: [422, 558] },
  // Elif: oyundaki parti çizimi biraz farklı (kolları daha açık), hiza yaklaşık
  elif: { a: 0.315, bx: -131.9, by: -26.6, tuval: [366, 583] },
};

type Durum = 'normal' | 'selam' | 'sevinc' | 'saskin' | 'dilek' | 'cee';

export class CocukIskelet {
  readonly el: HTMLElement;
  readonly karakter: Karakter;
  private durum: Durum = 'normal';
  private durumBas = 0;
  private kuklaKol: 'sol' | 'sag' | null = null;
  private kuklaSallaBas = -9;
  private oyuncu: Oyuncu | null = null;
  private balonEl: Element | null = null;

  constructor(readonly ad: string) {
    const z = HIZA[ad];
    const [tw, th] = z.tuval;
    const boy = 2048 * z.a;
    this.karakter = new Karakter(ad, h('div'));
    // iskelet kutusu tuvalin yüzdesi olarak: kare çizim, sol-üst köşe (bx, by)
    this.el = h(
      'div.eg-cocuk-iskelet',
      { style: `left:${((z.bx / tw) * 100).toFixed(3)}%;top:${((z.by / th) * 100).toFixed(3)}%;width:${((boy / tw) * 100).toFixed(3)}%;height:${((boy / th) * 100).toFixed(3)}%` },
      this.karakter.el,
    );
    this.karakter.ekHareket = (p, t) => this.hareket(p, t);
  }

  /** Oyuncunun pozu → iskelet durumu; false: poz resmi gösterilsin */
  poz(p: Poz): boolean {
    const d: Durum | null =
      p === 'normal' || p === 'sapkali' ? 'normal'
      : p === 'selam' ? 'selam'
      : p === 'alkis' || p === 'mutlu' || p === 'dans' || p === 'dans2' ? 'sevinc'
      : p === 'saskin' ? 'saskin'
      : p === 'dilek' ? 'dilek'
      : null;
    if (!d) return false;
    this.durumYap(d);
    return true;
  }

  private durumYap(d: Durum) {
    this.durum = d;
    this.durumBas = performance.now() / 1000;
    const ifade = d === 'sevinc' || d === 'selam' ? 'mutlu' : d === 'saskin' ? 'saskin' : d === 'dilek' ? 'dilek' : null;
    this.karakter.ifade(ifade);
  }

  bagla(o: Oyuncu) {
    this.oyuncu = o;
    this.balonEl = o.el.querySelector('.mc-oy-balon');
  }

  /** Cee-ee: eller yüze (true) ya da normal (false). Eller üst katmanı çağıran ekler. */
  cee(kapali: boolean) {
    // açılırken başka bir poz (ör. "Cee!" şaşkınlığı) gelmişse ona dokunma
    if (kapali) this.durumYap('cee');
    else if (this.durum === 'cee') this.durumYap('normal');
  }

  /** Kukla takılı kol (sol/sağ: çizimde izleyicinin solu/sağı) ya da null */
  kukla(kol: 'sol' | 'sag' | null) {
    this.kuklaKol = kol;
  }

  /** Kukla konuşurken tutan kol kısa sallanır */
  kuklaSalla() {
    this.kuklaSallaBas = performance.now() / 1000;
  }

  kapat() {
    this.karakter.kapat();
  }

  /** Her kare: durumun kol / kafa hareketi, yürüyüş, konuşma */
  private hareket(p: KPoz, _t: number) {
    const t = performance.now() / 1000;
    const g = t - this.durumBas;
    const hizli = this.ad === 'can';
    switch (this.durum) {
      case 'selam':
        // sağ el (izleyicinin sağı) yukarıda sallanır, baş hafif yana
        p.kolSag += 100 + 16 * Math.sin(g * 11);
        p.kafa += 3;
        break;
      case 'sevinc':
        // iki kol havada, sevinçle sallanır; topuzlar zıplar
        p.kolSol += 95 + 14 * Math.sin(g * 9);
        p.kolSag += 95 + 14 * Math.sin(g * 9 + 1.2);
        p.kulakSol += 8 * Math.sin(g * 14);
        p.kulakSag += 8 * Math.sin(g * 14 + 1);
        break;
      case 'saskin':
        // "Cee!" / şaşkın: kollar iki yana açılır
        p.kolSol += 45;
        p.kolSag += 45;
        p.kafa -= 2;
        break;
      case 'dilek':
        p.kolSol -= 20;
        p.kolSag -= 20;
        p.kafa += 3 * Math.sin(g * 1.5);
        break;
      case 'cee':
        // eller yüzde: kollar içe, göğse toplanır (eller üst katmanda yüzü kapatır)
        p.kolSol -= 40;
        p.kolSag -= 40;
        p.kafa += 2 * Math.sin(g * 6);
        break;
    }
    if (this.kuklaKol) {
      const salla = Math.max(0, 1 - (t - this.kuklaSallaBas) / 0.8);
      const a = 28 + 14 * Math.sin((t - this.kuklaSallaBas) * 14) * salla;
      if (this.kuklaKol === 'sol') p.kolSol += a;
      else p.kolSag += a;
    }
    // yürürken (oyuncu yürüyor): bacaklar sırayla, kollar karşı yönde; Can koşturur (daha hızlı, daha geniş)
    if (this.oyuncu?.el.classList.contains('yuruyor')) {
      const w = t * (hizli ? 13 : 9);
      const ac = hizli ? 14 : 11;
      p.bacakSol += ac * Math.sin(w);
      p.bacakSag -= ac * Math.sin(w);
      if (this.durum === 'normal' && !this.kuklaKol) {
        p.kolSol += 10 - 14 * Math.sin(w);
        p.kolSag += 10 + 14 * Math.sin(w);
      }
      p.kulakSol += 6 * Math.sin(w * 2);
      p.kulakSag += 6 * Math.sin(w * 2 + 0.6);
    }
    // balon açıkken konuşuyor: ağız açılıp kapanır (sessiz balon: çalan konuşma sesi onun değil, ağız ritimle)
    this.karakter.konus(!!this.balonEl?.classList.contains('acik'), false);
  }
}

/** Oyuncu kurar; iskeleti varsa parçalı iskeletle (Karakter), yoksa eskisi gibi resimlerle */
export function cocukOyuncu(s: OyuncuSecenek): { oyuncu: Oyuncu; iskelet: CocukIskelet | null } {
  if (!HIZA[s.ad] || !iskeletVar(s.ad)) return { oyuncu: new Oyuncu(s), iskelet: null };
  const isk = new CocukIskelet(s.ad);
  const oyuncu = new Oyuncu({ ...s, iskelet: { el: isk.el, poz: (p) => isk.poz(p) } });
  isk.bagla(oyuncu);
  oyuncu.el.classList.add('eg-iskeletli');
  return { oyuncu, iskelet: isk };
}
