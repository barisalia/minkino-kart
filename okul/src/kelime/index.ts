/**
 * Ünite 3 · Kelime Köprüsü (ekip/senaryo/okul-oncesi.md §4). Bölgenin kendi ekranı (köprü, resimli taşlar), rozeti
 * ("Kelime Ustası") ve 6 etkinlik burada kaydolur; ortak dosyalara yalnız bu modülün içe aktarılması eklendi
 * (oyun.ts). Etkinlik sırası belgedeki gibi: dinle, hecele, tersi, boya, grup, eksik.
 */
import './kelime.css';
import K from '../../../content/okul-kelime.json';
import { bolge } from '../etkinlik';
import { kopruEkrani, kelimeRozeti } from './kopru';
import './dinle';
import './hecele';
import './tersi';
import './boya';
import './grup';
import './eksik';

const b = bolge('kelime');
if (b) {
  b.rozet = K.arayuz.rozet;
  b.rozetSoz = K.mino.rozet;
  b.rozetResim = kelimeRozeti;
  b.ekran = kopruEkrani;
}
