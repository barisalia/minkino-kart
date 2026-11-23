/**
 * Masal 2.0 hazır mı: bütün çizimleri ve sesleri diskte (test kipinde yalnız çizimler). Ders ekranı (kitap açılınca hangi
 * masal oynar) ve Masal Kitaplığı (kitabın adı) aynı kararı kullanır.
 */
import { TEST_MODU } from '../../../src/ui/dom';
import { TASLAK, resim, sesAdresi } from '../varlik';
import { MASALLAR2, masal2Cizimleri, masal2Sesleri, type Masal2 } from './masal2-veri';

// taslak kipinde çizimi gelmemiş masal da yer tutucularla açılır (akış çizimden önce denenir)
export const masal2Hazir = (m: Masal2): boolean =>
  TASLAK || (masal2Cizimleri(m).every((y) => !!resim(y)) && (TEST_MODU || masal2Sesleri(m).every((id) => !!sesAdresi(id))));

/** Adanın kitabı yeni masalı açacaksa o masal: adanın masallarından hazır olan ilki (göl v2 çizimi gelene kadar v1) */
export const adaninMasal2si = (uniteId: string): Masal2 | undefined =>
  MASALLAR2.filter((m) => m.uniteId === uniteId).find(masal2Hazir);
