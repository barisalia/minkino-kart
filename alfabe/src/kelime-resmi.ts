import fil from '../../assets/alfabe/07.webp';
import dag from '../../assets/alfabe/09.webp';
import havuc from '../../assets/alfabe/10.webp';
import nar from '../../assets/alfabe/17.webp';
import ordek from '../../assets/alfabe/19.webp';
import vazo from '../../assets/alfabe/27.webp';
import pil from '../../assets/alfabe/macera/sahne-pil.webp';
import zil from '../../assets/alfabe/macera/sahne-zil.webp';
import at from '../../assets/alfabe/macera/kelime-at.webp';
import bal from '../../assets/alfabe/macera/kelime-bal.webp';
import su from '../../assets/sef/sis/su-damla.webp';
import lale from '../../assets/hazirlik/etkinlik/bahce-0.webp';
import un from '../../assets/sef/krep/un-olcek.webp';
import jet from '../../assets/alfabe/obur-kartlar/jet.webp';

// Harf Atölyesi'ne özel sözcük resimleri (Astra, 17 Kasım denetimi): assets/alfabe/kelime/<ad>.webp.
// Klasöre gelen çizim kendiliğinden bağlanır; dosya adı ASCII, sözcük Türkçe.
const kelimeKlasoru = import.meta.glob('../../assets/alfabe/kelime/*.webp', { eager: true, import: 'default' }) as Record<string, string>;
const DOSYA_SOZCUK: Record<string, string> = { cay: 'çay', gol: 'göl', sal: 'şal', ilik: 'ılık', kis: 'kış', uc: 'üç' };

// Anahtar, ekranda kurulan sözcüktür. Çizimi olmayan sözcük harfleriyle gösterilir.
const sozcukler = new Map<string, string>([
  ['at', at],
  ['bal', bal],
  ['jet', jet],
  ['dağ', dag],
  ['fil', fil],
  ['havuç', havuc],
  ['lale', lale],
  ['nar', nar],
  ['ördek', ordek],
  ['pil', pil],
  ['su', su],
  ['un', un],
  ['vazo', vazo],
  ['zil', zil],
]);
for (const [yol, resim] of Object.entries(kelimeKlasoru)) {
  const ad = yol.split('/').pop()!.replace(/\.webp$/, '');
  sozcukler.set(DOSYA_SOZCUK[ad] ?? ad, resim);
}

export function kelimeResmi(sozcuk: string): string | undefined {
  return sozcukler.get(sozcuk.trim().normalize('NFC').toLocaleLowerCase('tr'));
}
