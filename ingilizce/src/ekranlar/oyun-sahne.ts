/**
 * Oyunlar bölümü, sahne hâli (23 Kasım 2026): "Oyun Parkı". Ekran örneği `ekip/ui-secenek/ing-ui-oyunlar.png`, parçalar
 * Paket ING-UI-B (`assets/ingilizce/sahne-oyun/`). Her oyun parkta kendi yeridir; dokununca yeri kendi kareleriyle canlanır,
 * sonra oyun açılır. Kilitli oyunun yeri sallanır ve Ceren nasıl açılacağını söyler. Parçaların hepsi gelmeden eski kartlı
 * ekran açılır (taslakta yer tutucuyla).
 */
import { h } from '../../../src/ui/dom';
import { salla } from '../kit';
import { sahneKur, type SahneNesnesi } from '../sahne-ekran';

const p = (ad: string) => `sahne-oyun/${ad}`;
const kareler = (ad: string, n: number) => Array.from({ length: n }, (_, i) => p(`${ad}-${i}`));

export interface ParkOyunu { ac(): void; acik: boolean; kilitliUyari(): void }
export type ParkOyunlari = Record<'fener' | 'bahce' | 'saklambac' | 'renkli' | 'bilmece' | 'farkli' | 'gunluk', ParkOyunu | null>;

const YERLER: readonly { oyun: keyof ParkOyunlari; id: string; ad: string; kutu: readonly [number, number, number, number]; n: number; dokunus: readonly (readonly [number, number])[] }[] = [
  { oyun: 'fener', id: 'magara', ad: 'Fener Avı', kutu: [50, 120, 500, 360], n: 3, dokunus: [[1, 180], [2, 180], [0, 80]] },
  { oyun: 'bahce', id: 'kapi', ad: 'Hayvanat Bahçesi', kutu: [555, 85, 470, 390], n: 3, dokunus: [[1, 220], [2, 320]] },
  { oyun: 'saklambac', id: 'ev', ad: 'Hide & Seek', kutu: [1068, 95, 408, 380], n: 3, dokunus: [[1, 200], [2, 360]] },
  { oyun: 'renkli', id: 'sovale', ad: 'Renkli Kino', kutu: [1540, 88, 412, 420], n: 3, dokunus: [[1, 200], [2, 320]] },
  { oyun: 'bilmece', id: 'sapka', ad: 'Polly’s Riddles', kutu: [50, 495, 590, 505], n: 3, dokunus: [[1, 200], [2, 300]] },
  { oyun: 'farkli', id: 'tezgah', ad: 'Odd One Out', kutu: [760, 490, 490, 475], n: 3, dokunus: [[1, 220], [2, 260]] },
  { oyun: 'gunluk', id: 'cark', ad: 'Günün Tekrarı', kutu: [1335, 495, 680, 515], n: 3, dokunus: [[1, 200], [2, 260]] },
];

export function oyunSahnesi(oyunlar: ParkOyunlari): { kok: HTMLElement; birak(): void } | null {
  const nesneler: SahneNesnesi[] = [];
  for (const y of YERLER) {
    const o = oyunlar[y.oyun];
    if (!o) { nesneler.push({ id: y.id, kareler: [p(`${y.id}-0`)], kutu: y.kutu }); continue; }
    // kilitli oyunda yer canlanmaz: sallanır, Ceren söyler
    nesneler.push(o.acik
      ? { id: y.id, kareler: kareler(y.id, y.n), kutu: y.kutu, ad: y.ad, tikla: o.ac, dokunus: y.dokunus }
      : { id: y.id, kareler: kareler(y.id, y.n), kutu: y.kutu, ad: `${y.ad}, kilitli`, tikla: () => {} });
  }
  nesneler.push(
    { id: 'ceren', kareler: kareler('ceren-yuru', 4), kutu: [575, 740, 225, 365] },
    { id: 'zipzip', kareler: kareler('zipzip', 3), kirp: p('zipzip-kirp'), kutu: [1140, 775, 265, 330], ad: 'Zıpzıp', tikla: () => {}, canlilik: 'nefes', dokunus: [[1, 420], [2, 600], [0, 0]] },
  );
  const sahne = sahneKur('ing-oyun-sahne', p('oyun-fon'), nesneler);
  if (!sahne.hazir) { sahne.birak(); return null; }

  for (const y of YERLER) {
    const o = oyunlar[y.oyun], n = sahne.nesne(y.id);
    if (!o || !n) continue;
    n.el.append(h('span.ing-sh-ad', {}, y.ad));
    // eski kartlarla aynı işaretler: testler ve büyükler için oyun adı ve kilit
    n.el.dataset.oyun = y.oyun;
    if (!o.acik) {
      n.el.classList.add('ing-sh-kilitli', 'ing-kilitli');
      n.el.addEventListener('click', () => { salla(n.el); o.kilitliUyari(); });
    }
  }
  // Ceren parkta yerinde yürür (dört karelik döngü); bölüm açıkken sürer
  let canli = true;
  const yuru = async () => { while (canli) { if (!(await sahne.nesne('ceren')!.oyna([[0, 170], [1, 170], [2, 170], [3, 170]]))) return; } };
  void yuru();
  return { kok: sahne.kok, birak() { canli = false; sahne.birak(); } };
}
