/**
 * Mağaza inceleme kodu: Google Play / App Store inceleme ekibi satın alamaz, deneme başlatamaz. Ebeveyn Köşesi →
 * "İnceleme kodu" → kod doğruysa bu cihazda bütün içerik açılır (src/engine/erisim.ts → incelemeAc).
 *
 * Repo herkese açık: kodun kendisi hiçbir yere yazılmaz, yalnız normalleştirilmiş hâlinin SHA-256 özeti durur.
 * Kod mağaza konsolundaki inceleme notunda; Barış'ta.
 */
import './abonelik.css';
import { efekt } from '../audio/ses';
import { incelemeAc } from '../engine/erisim';
import { h, svg, TEST_MODU } from '../ui/dom';
import { sinifOynat } from '../ui/hareket';
import { IKON } from '../ui/ikonlar';

/** Normalleştirilmiş inceleme kodunun SHA-256 özeti (onaltılık) */
export const INCELEME_OZETI = 'cf2fbeb743b7327684c667daf1287b77b6f1e3a9dae24fc91deab5e6c1e1a6da';

/** Girdi normalleştirme: baş/son boşluk atılır, büyük harf (yerelden bağımsız: "i" → "I") */
export const kodNormal = (s: string) => s.trim().toUpperCase();

/** Metnin SHA-256 özeti (onaltılık, küçük harf) */
export async function ozet(s: string): Promise<string> {
  const veri = new TextEncoder().encode(s);
  const b = new Uint8Array(await crypto.subtle.digest('SHA-256', veri));
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/** Girilen kod doğru mu (normalleştirilip özeti karşılaştırılır); özet hesaplanamazsa false */
export async function kodDogruMu(girdi: string, beklenen: string = INCELEME_OZETI): Promise<boolean> {
  const k = kodNormal(girdi);
  if (!k) return false;
  try {
    return (await ozet(k)) === beklenen;
  } catch {
    return false;
  }
}

/** Uçtan uca test: ?test=1&inceleme-ozet=… ile beklenen özet değişir (gerçek kod teste yazılmasın diye) */
function beklenenOzet(): string {
  if (!TEST_MODU) return INCELEME_OZETI;
  const o = new URLSearchParams(location.search).get('inceleme-ozet');
  return o && /^[0-9a-f]{64}$/.test(o) ? o : INCELEME_OZETI;
}

/**
 * İnceleme kodu penceresi (ebeveyn kapısından sonra, Ebeveyn Köşesi'nde). Kod doğruysa kilit açılır, nazik bir
 * "açıldı" yazısı görünür ve true döner; kapatılırsa false. Yanlış kodda yalnız yumuşak sallanma (kod hakkında yazı yok).
 */
export function incelemeKoduAc(kok: HTMLElement): Promise<boolean> {
  return new Promise((coz) => {
    let acildi = false;
    let mesgul = false;
    const girdi = h('input.ik-girdi', {
      type: 'text',
      'aria-label': 'İnceleme kodu',
      autocomplete: 'off',
      autocapitalize: 'characters',
      autocorrect: 'off',
      spellcheck: 'false',
      enterkeyhint: 'done',
      maxlength: '40',
    });
    const tamam = h('button.dugme.ik-tamam', { type: 'button' }, 'Tamam');
    const kapat = h('button.ince-dugme.ik-kapat', { type: 'button' }, 'Kapat');
    const govde = h('div.ik-govde', {}, girdi, h('div.ik-dugmeler', {}, kapat, tamam));
    const pencere = h('div.pencere.ik-pencere', {}, h('h2', {}, 'İnceleme kodu'), govde);
    const perde = h('div.perde.kapi-perde.ik-perde', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'İnceleme kodu' }, pencere);

    const bitir = () => {
      document.removeEventListener('keydown', klavye);
      perde.remove();
      coz(acildi);
    };
    const dene = async () => {
      if (mesgul || acildi) return;
      mesgul = true;
      tamam.setAttribute('disabled', '');
      const dogru = await kodDogruMu(girdi.value, beklenenOzet());
      mesgul = false;
      tamam.removeAttribute('disabled');
      if (!dogru) {
        efekt.hayir();
        // yumuşak sallanma, yazı yok (sayaç: uçtan uca test görsün diye)
        girdi.dataset.yanlis = String(Number(girdi.dataset.yanlis ?? 0) + 1);
        void sinifOynat(girdi, 'hata', 520);
        girdi.select();
        return;
      }
      acildi = true;
      incelemeAc();
      efekt.dogru();
      const tamamKapat = h('button.dugme.ik-tamam', { type: 'button' }, 'Tamam');
      tamamKapat.addEventListener('click', bitir);
      govde.replaceChildren(h('p.ik-basari', { role: 'status' }, svg(IKON.onay, 'ik-onay'), 'Tüm içerik açıldı (inceleme)'), h('div.ik-dugmeler', {}, tamamKapat));
      tamamKapat.focus();
    };
    tamam.addEventListener('click', () => void dene());
    kapat.addEventListener('click', bitir);
    const klavye = (e: KeyboardEvent) => {
      if (e.key === 'Escape') bitir();
      else if (e.key === 'Enter' && !acildi) void dene();
      else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', klavye);
    perde.addEventListener('click', (e) => e.target === perde && bitir());
    kok.append(perde);
    girdi.focus();
  });
}
