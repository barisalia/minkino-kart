/** Film oynatıcı: kapak (başlık + Oynat), oynatma (duraklat / devam, ses), sonda öğüt kartı */
import { konus } from '../../src/audio/ses';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Film, KAYIT, sesGunlugeYaz, type FilmDosya } from './motor';

const FILMLER = import.meta.glob<FilmDosya>('../../content/film/*.json', { eager: true, import: 'default' });
export const filmBul = (ad: string) => FILMLER[`../../content/film/${ad}.json`];

/** Yazısız "telefonu yan çevir" simgesi: telefon dikeyden yataya döner (CSS animasyonu) */
const CEVIR = '<svg viewBox="0 0 64 64" aria-hidden="true"><g class="fl-cevir-tel"><rect x="20" y="8" width="24" height="44" rx="6" fill="#fff" stroke="#5a3617" stroke-width="4"/><rect x="25" y="14" width="14" height="28" rx="2" fill="#ffd28a"/><circle cx="32" cy="46" r="2.5" fill="#5a3617"/></g><path class="fl-cevir-ok" d="M50 16a22 22 0 0 1 4 18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path class="fl-cevir-ok" d="M50 34l4 1 1-5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const DURAKLAT = '<svg viewBox="0 0 48 48"><rect x="12" y="10" width="8" height="28" rx="3" fill="currentColor"/><rect x="28" y="10" width="8" height="28" rx="3" fill="currentColor"/></svg>';

export function filmEkrani(app: Uygulama, p?: { ad?: string }): Ekran {
  const q = new URLSearchParams(location.search);
  const ad = p?.ad ?? q.get('film') ?? 'mino-karpuz';
  const dosya = filmBul(ad);
  if (!dosya) throw new Error(`Film yok: ${ad}`);
  const sessiz = q.has('sessiz');
  // MP4 kaydı: düğmeler gizli, altyazı büyük; ?kadraj=dolu: 16:9 yerine ekranın tamamı (dikey / kare çıktılar)
  if (KAYIT) document.body.dataset.kayit = '1';
  if (q.get('kadraj') === 'dolu') document.body.dataset.kadraj = 'dolu';
  let film: Film | null = null;

  const oynatDugme = h('button.dugme.fl-oynat', { type: 'button' }, svg(IKON.oyna), 'Oynat');
  // film seçimi: bütün filmler kart olarak (seçili olan işaretli); karta dokununca o filmin kapağı açılır
  const filmler = Object.entries(FILMLER)
    .map(([yol, f]) => ({ ad: yol.replace(/^.*\/([^/]+)\.json$/, '$1'), baslik: f.baslik }))
    .sort((a, b) => (a.ad === 'mino-karpuz' ? -1 : b.ad === 'mino-karpuz' ? 1 : a.ad.localeCompare(b.ad)));
  const kartlar = h('nav.fl-filmler', { 'aria-label': 'Filmler' }, ...filmler.map((f) => {
    const k = h('button.fl-film-kart', { type: 'button', 'aria-current': String(f.ad === ad), 'data-film': f.ad }, f.baslik);
    k.addEventListener('click', () => {
      if (f.ad === ad) return;
      history.replaceState(null, '', `?${new URLSearchParams([...q].filter(([k2]) => k2 !== 'film').concat([['film', f.ad]]))}`);
      app.git('film', { ad: f.ad });
    });
    return k;
  }));
  const kapak = h('div.fl-kapak', {}, h('h1.fl-baslik', {}, dosya.baslik), oynatDugme, ...(filmler.length > 1 ? [kartlar] : []));
  const duraklatDugme = yuvarlakDugme(DURAKLAT, 'Duraklat', () => {
    if (!film) return;
    film.duraklatDegistir();
    duraklatDugme.querySelector('.ikon')!.innerHTML = film.duraklatildi ? IKON.oyna : DURAKLAT;
    duraklatDugme.setAttribute('aria-label', film.duraklatildi ? 'Devam' : 'Duraklat');
  }, 'kucuk');
  duraklatDugme.hidden = true;
  const cikis = app.secenekler.cikis;
  const ust = h('div.ust-cubuk.fl-ust', {}, cikis ? yuvarlakDugme(IKON.geri, 'Geri', () => cikis(), 'kucuk') : h('div'), h('div.ust-grup', {}, duraklatDugme, sesDugmesi()));
  const sahneKap = h('div.fl-sahne-kap');
  const cevir = h('div.fl-cevir', { 'aria-hidden': 'true', html: CEVIR });
  const el = h('div.fl-ekran', {}, sahneKap, cevir, kapak, ust);

  const ogutKarti = (metin: string) => {
    const tekrar = h('button.dugme', { type: 'button', style: '--r:var(--yesil)' }, svg(IKON.tekrar), 'Tekrar izle');
    tekrar.addEventListener('click', () => app.git('film', { ad }));
    const kart = h('div.fl-ogut', {}, h('p', {}, metin), tekrar);
    el.append(kart);
    // öğüdü karakter filmin sonunda kendisi söylediyse (Mino kameraya) kart yeniden okumaz
    if (film?.el.dataset.sonSoz === metin) return;
    if (!sessiz && !TEST_MODU) void konus(metin);
    sesGunlugeYaz('konus', metin);
  };

  const basla = () => {
    kapak.classList.add('gizli');
    duraklatDugme.hidden = false;
    film = new Film(dosya, {
      ses: !sessiz && !TEST_MODU,
      bitti: () => {
        const son = dosya.sahneler.find((s) => 'ogut' in s) as { ogut: string } | undefined;
        duraklatDugme.hidden = true;
        if (son) ogutKarti(son.ogut);
      },
    });
    sahneKap.replaceChildren(film.el);
    void film.oynat();
  };
  oynatDugme.addEventListener('click', basla);
  if (q.has('oto')) setTimeout(basla, 50);

  return {
    el,
    kapat() {
      film?.kapat();
    },
  };
}
