// Geliştirme önizlemesi: "Ceren'le oku" bölümü rafa bağlanana kadar yalnız ?test=1 ile açılır (derlemeye girmez).
// ?harfler=01,02,… bitmiş harfler (yoksa hepsi), ?yas=4|5+ (yoksa 5+), ?hizli=1 kayıtları çalmadan kısa bekleme (testler).
// ?yaptir=1 "Okuduğunu yaptır" anı ve öyküler Astra'nın kareleri gelmeden yer tutucuyla oynar; ?oyku=oyku-1 öyküyle başlar.
import '../src/stil.css';
import { IKON } from '../../src/ui/ikonlar';
import { cumleOkumaKur } from '../src/cumle-okuma';
import { cerenKonus, cerenSustur } from '../src/konusma-dersi';
import type { CumleYasi } from '../src/cumle-okuma-kurallari';

const adres = new URLSearchParams(location.search);
const alan = document.querySelector<HTMLElement>('#alan')!;
document.querySelector('#geri')!.insertAdjacentHTML('afterbegin', IKON.geri);
if (adres.get('test') !== '1') {
  alan.innerHTML = '<p id="kapali">Bu bölüm henüz rafta değil; önizleme ?test=1 ile açılır.</p>';
} else {
  const kayitlar = new Set(Object.keys(import.meta.glob('../../assets/alfabe/ses/*.mp3')).map((y) => y.split('/').pop()!.replace(/\.mp3$/, '')));
  const hizli = adres.get('hizli') === '1';
  let bekleme: number | undefined;
  // Ceren'in kaydı yoksa (kayıtlar henüz üretilmedi) sözcük uzunluğu kadar bekle; sözcükler yine sırayla yanar.
  // Testler için: hızlı kipte de Ceren'in hangi kayıtları hangi sırayla okuduğu görülsün.
  const cerenSirasi: string[] = [];
  (window as unknown as { cerenSirasi: string[] }).cerenSirasi = cerenSirasi;
  const oku = (id: string, sonra?: () => void, oynarken?: (saniye: number) => void) => {
    cerenSirasi.push(id);
    clearTimeout(bekleme);
    if (kayitlar.has(id) && !hizli) { cerenKonus(id, sonra, oynarken); return; }
    const sure = hizli ? 60 : id.startsWith('cumle-soz-') ? 420 + id.length * 30 : id.startsWith('cumle-yonerge') ? 300 : 1400;
    bekleme = window.setTimeout(() => sonra?.(), sure);
  };
  const sustur = () => { clearTimeout(bekleme); cerenSustur(); };
  const hepsi = Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0'));
  const biten = adres.get('harfler')?.split(',').filter(Boolean) ?? hepsi;
  const yas = (adres.get('yas') ?? '5+') as CumleYasi;
  const kapat = cumleOkumaKur(alan, {
    oku, sustur, cikis: () => { alan.dataset.cikti = 'true'; },
    geri: document.querySelector<HTMLButtonElement>('#geri')!,
    baslik: document.querySelector<HTMLElement>('#baslik')!,
    ilerleme: document.querySelector<HTMLElement>('#ilerleme')!,
    bitenHarfler: biten, yas, yaptirYerTutucu: adres.get('yaptir') === '1', oyku: adres.get('oyku') ?? undefined, okuBul: adres.get('okubul') === '1',
  });
  document.querySelector<HTMLButtonElement>('#geri')!.onclick = () => { kapat(); alan.dataset.cikti = 'true'; };
}
