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
import masa from '../../assets/sef/salon/masa.webp';
import su from '../../assets/sef/sis/su-damla.webp';
import ip from '../../assets/hazirlik/kres/kolye-iplik.webp';
import lale from '../../assets/hazirlik/etkinlik/bahce-0.webp';
import un from '../../assets/sef/krep/un-olcek.webp';

// Anahtar, ekranda kurulan sözcüktür. Çizimi olmayan sözcük harfleriyle gösterilir.
const sozcukler = new Map<string, string>([
  ['at', at],
  ['bal', bal],
  ['dağ', dag],
  ['fil', fil],
  ['havuç', havuc],
  ['ip', ip],
  ['lale', lale],
  ['masa', masa],
  ['nar', nar],
  ['ördek', ordek],
  ['pil', pil],
  ['su', su],
  ['un', un],
  ['vazo', vazo],
  ['zil', zil],
]);

export function kelimeResmi(sozcuk: string): string | undefined {
  return sozcukler.get(sozcuk.trim().normalize('NFC').toLocaleLowerCase('tr'));
}
