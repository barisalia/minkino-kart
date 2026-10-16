/**
 * Tek mini oyun deneme sayfası (yalnız web/test; uygulamaya girmez): /restoran/mini.html?oyun=dogra&yas=kucuk&tarif=salata
 * Lokantasız açılır: istasyon çerçevesi + mini oyun. Tepsiye alınınca ürün gösterilir, "yeniden" ile baştan.
 * &malzemeler=domates,salatalik (raf), &tepsi=dogranmis (Tabakla için örnek tepsi), &test=1.
 */
import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '../../src/styles/ana.css';
import '../../src/styles/mino.css';
import './restoran.css';
import { sesKokuAyarla } from '../../src/audio/kayit';
import { sesiAc } from '../../src/audio/ses';
import { h, TEST_MODU } from '../../src/ui/dom';
import { sayfaAcildi } from '../../src/ui/gecis';
import { istasyonAc } from './istasyon/istasyon';
import { MALZEME_ADI, urunId, type Malzeme, type Urun } from './mini/arayuz';
import { MINI_OYUNLAR, oyunBul } from './mini/katalog';
import { denemeIcin, kaseGorsel } from './mini/deneme';
import { TARIFLER } from './model';

sesKokuAyarla('../ses/', './ses/');
const q = new URLSearchParams(location.search);
const kok = document.getElementById('restoran')!;
kok.classList.add('mk-kok', 'rs-kok');
if (TEST_MODU) kok.classList.add('test-modu');
kok.addEventListener('pointerdown', () => sesiAc(), { capture: true });

const ad = q.get('oyun') ?? 'deneme';
const oyun = oyunBul(ad) ?? denemeIcin('tezgah');
const yas = q.get('yas') === 'buyuk' ? 'buyuk' : 'kucuk';
const tarif = q.get('tarif') ?? undefined;
const malzemeler = ((q.get('malzemeler')?.split(',') ?? TARIFLER[tarif ?? 'salata']?.malzemeler ?? ['domates', 'salatalik', 'sogan', 'biber', 'maydanoz']) as Malzeme[]).filter((m) => m in MALZEME_ADI);
const ornekTepsi = (): Urun[] =>
  (q.get('tepsi') ?? (oyun.istasyon === 'servis' ? 'dogranmis' : '')).split(',').filter(Boolean).map((tur) => {
    const ozellik = { malzemeler: { domates: { adet: 3, kesim: 'dilim' as const }, salatalik: { adet: 4, kesim: 'dilim' as const } } };
    return { id: urunId(tur), tur, ozellik, gorsel: () => kaseGorsel(ozellik, 'kase') };
  });

function ac() {
  kok.replaceChildren();
  const ekran = h('div.rs-mini-sayfa.ekran');
  kok.append(ekran);
  istasyonAc(ekran, {
    oyun,
    girdi: { yas, tarif, malzemeler, tepsi: ornekTepsi(), test: TEST_MODU },
    tepsiyeAlindi: (u) => sonuc(u),
    geriDonuldu: () => sonuc([]),
  });
  sayfaAcildi(ekran);
}

function sonuc(urunler: Urun[]) {
  const liste = h('div.rs-mini-sonuc-liste', {}, ...urunler.map((u) => h('div.rs-mini-sonuc-urun', { 'data-tur': u.tur }, u.gorsel())));
  const yeniden = h('button.rs-mini-yeniden', { type: 'button', 'aria-label': 'Yeniden' }, '↻');
  yeniden.addEventListener('click', ac);
  const s = h('div.rs-mini-sonuc', { 'data-adet': String(urunler.length) }, liste, yeniden);
  (window as unknown as { __rsMiniSonuc: Urun[] }).__rsMiniSonuc = urunler;
  kok.querySelector('.rs-mini-sayfa')?.append(s);
}

(window as unknown as { __rsMini: unknown }).__rsMini = { oyunlar: Object.keys(MINI_OYUNLAR), ad: oyun.ad };
ac();
