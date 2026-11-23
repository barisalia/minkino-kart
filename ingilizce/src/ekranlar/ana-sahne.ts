/**
 * Ana ekran, sahne hâli (23 Kasım 2026): "Polly'nin İngilizce Okulu". Astra'nın ekran örneği `ekip/ui-secenek/ing-ui-ana.png`,
 * parçaları Paket ING-UI-A (`assets/ingilizce/sahne-ana/`). Ağaç ev sınıfında dört köşe bölümlerdir:
 *   - ada haritası panosu → Dersler · oyuncak sandığı → Oyunlar · kitap rafı → Masallar · çıkartma albümü → Kelimelerim
 *   - ortadaki büyük sarı minder: sıradaki derse başla (minder çöker, ders açılır)
 * Ceren Öğretmen karşılar (ağzı konuşmayı izler, el sallar), Polly kütükte, sınıfta Kino, Lokum, Mino ve Zıpzıp okuyor;
 * dokunulunca her biri kendi karesiyle tepki verir. Parçaların hepsi gelmeden eski ana ekran açılır (taslakta yer tutucuyla).
 */
import { h } from '../../../src/ui/dom';
import { konus, sesAcikMi } from '../ses';
import { sahneKur, type SahneNesnesi } from '../sahne-ekran';

const p = (ad: string) => `sahne-ana/${ad}`;
const kareler = (ad: string, n: number) => Array.from({ length: n }, (_, i) => p(`${ad}-${i}`));

export interface AnaSahneSecimi {
  dersler(): void;
  oyunlar(): void;
  masallar: (() => void) | null;
  kelimeler(): void;
  devam: { yazi: string; alt: string; ac(): void } | null;
  /** Ceren'in selam kaydı */
  selam: string;
  /** karaktere dokununca: sohbeti hazırsa sohbet, değilse el sallayıp "Hi!" (23 Kasım; Barış: "tıklayınca bir şey olmuyor") */
  karakter(id: 'polly' | 'mino' | 'zipzip' | 'lokum' | 'kino'): void;
  /** sohbeti olan karakterler (başlarının üstünde "Hi!" balonu ipucu) */
  sohbetVar: readonly string[];
}

/** Sahne nesneleri (kutular Astra'nın ekran örneğinin pikseli; brief: Paket ING-UI-A) */
function nesneler(s: AnaSahneSecimi, selamla: () => void): SahneNesnesi[] {
  return [
    { id: 'harita', kareler: kareler('harita', 3), kutu: [20, 30, 490, 500], ad: 'Dersler', tikla: s.dersler, canlilik: 'sallan', dokunus: [[1, 160], [2, 160], [1, 140]] },
    { id: 'sandik', kareler: kareler('sandik', 4), kutu: [520, 220, 395, 370], ad: 'Oyunlar', tikla: s.oyunlar, dokunus: [[1, 110], [2, 110], [3, 300]] },
    { id: 'raf', kareler: kareler('raf', 3), kutu: [1220, 70, 360, 500], ad: 'Masallar', ...(s.masallar ? { tikla: s.masallar, dokunus: [[1, 160], [2, 260]] as const } : {}) },
    { id: 'mor-minder', kareler: [p('mor-minder')], kutu: [1330, 470, 210, 140] },
    { id: 'zipzip', kareler: kareler('zipzip', 3), kutu: [930, 230, 270, 345], ad: 'Zıpzıp', tikla: () => s.karakter('zipzip'), canlilik: 'nefes', dokunus: [[2, 320]] },
    { id: 'album', kareler: kareler('album', 3), kutu: [1600, 200, 425, 530], ad: 'Kelimelerim', tikla: s.kelimeler, dokunus: [[1, 160], [2, 260]] },
    { id: 'kino', kareler: kareler('kino', 3), kirp: p('kino-kirp'), kutu: [555, 570, 330, 385], ad: 'Kino', tikla: () => s.karakter('kino'), canlilik: 'nefes', dokunus: [[1, 120]] },
    { id: 'lokum', kareler: kareler('lokum', 3), kutu: [900, 555, 330, 350], ad: 'Lokum', tikla: () => s.karakter('lokum'), canlilik: 'nefes', dokunus: [[1, 160], [2, 220]] },
    { id: 'mino', kareler: kareler('mino', 2), kirp: p('mino-kirp'), kutu: [1255, 585, 350, 385], ad: 'Mino', tikla: () => s.karakter('mino'), canlilik: 'nefes', dokunus: [[1, 320]] },
    { id: 'polly', kim: 'polly', kareler: kareler('polly', 5), kirp: p('polly-kirp'), kutu: [300, 620, 280, 455], ad: 'Polly', tikla: () => s.karakter('polly'), dokunus: [[3, 220], [0, 0]] },
    { id: 'ceren', kim: 'ceren', kareler: kareler('ceren', 5), kirp: p('ceren-kirp'), kutu: [28, 500, 300, 595], ad: 'Ceren Öğretmen’i dinle', tikla: selamla, canlilik: 'nefes', dokunus: [[3, 200], [4, 200], [3, 200], [0, 0]] },
    { id: 'minder', kareler: kareler('minder', 2), kutu: [590, 900, 860, 252], ad: s.devam?.yazi ?? 'Derse başla', ...(s.devam ? { tikla: s.devam.ac, dokunus: [[1, 200], [0, 90]] as const } : {}) },
  ];
}

/** Bütün parçalar varsa sahne hâlini kurar; yoksa null (eski ana ekran açılır) */
export function anaSahne(s: AnaSahneSecimi): { kok: HTMLElement; birak(): void } | null {
  const selamla = () => { void konus(s.selam); };
  const sahne = sahneKur('ing-ana-sahne', p('ana-fon'), nesneler(s, selamla));
  if (!sahne.hazir) { sahne.birak(); return null; }

  // bölüm adları: nesnenin altında küçük tabela (çocuk okumasa da büyük için)
  const ad = (id: string, yazi: string, alt?: string) => sahne.nesne(id)?.el.append(h('span.ing-sh-ad', {}, yazi, ...(alt ? [h('small', {}, ` · ${alt}`)] : [])));
  ad('harita', 'Dersler'); ad('sandik', 'Oyunlar'); if (s.masallar) ad('raf', 'Masallar'); ad('album', 'Kelimelerim');
  // Polly ile sohbet: başının üstünde nabız gibi atan küçük konuşma balonu ("dokun, konuşalım")
  for (const id of s.sohbetVar) sahne.nesne(id)?.el.append(h('span.ing-sh-konus', { 'aria-hidden': 'true' }, 'Hi!'));
  // sohbeti olmayan karaktere dokununca da boş kalmasın: el sallar (dokunuş kareleri), "Hi!" der, kısa bir an sonra duruşa döner
  for (const id of ['kino', 'mino', 'zipzip', 'lokum']) {
    const n = sahne.nesne(id);
    n?.el.addEventListener('click', () => { if (!s.sohbetVar.includes(id)) window.setTimeout(() => n.kare(0), 1400); });
  }
  if (s.devam) { ad('minder', s.devam.yazi, s.devam.alt); sahne.nesne('minder')!.el.classList.add('ing-sh-basla'); }

  // açılışta Ceren el sallar ve selam verir (ses açıldıysa); sınıf boşta canlı: Lokum ara ara parmak kaldırır
  // açılış selamı: çocuk o arada Polly'ye dokunup sohbeti açtıysa Ceren sözünü kesmez
  if (sesAcikMi()) window.setTimeout(() => {
    if (document.querySelector('.ing-shb')) return; void sahne.nesne('ceren')?.oyna([[3, 220], [4, 220], [3, 220], [0, 0]]); selamla(); }, 350);
  let canli = true;
  const lokumDongu = () => { if (!canli) return; void sahne.nesne('lokum')?.oyna([[1, 260], [0, 260], [1, 260], [0, 0]]); window.setTimeout(lokumDongu, 6000 + Math.random() * 4000); };
  window.setTimeout(lokumDongu, 4000);
  return { kok: sahne.kok, birak() { canli = false; sahne.birak(); } };
}
