/** Film oynatıcı: kapak (başlık + Oynat), oynatma (duraklat / devam, ses), sonda öğüt kartı */
import { konus } from '../../src/audio/ses';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Film, type FilmDosya } from './motor';

const FILMLER = import.meta.glob<FilmDosya>('../../content/film/*.json', { eager: true, import: 'default' });
export const filmBul = (ad: string) => FILMLER[`../../content/film/${ad}.json`];

const DURAKLAT = '<svg viewBox="0 0 48 48"><rect x="12" y="10" width="8" height="28" rx="3" fill="currentColor"/><rect x="28" y="10" width="8" height="28" rx="3" fill="currentColor"/></svg>';

export function filmEkrani(app: Uygulama, p?: { ad?: string }): Ekran {
  const q = new URLSearchParams(location.search);
  const ad = p?.ad ?? q.get('film') ?? 'mino-karpuz';
  const dosya = filmBul(ad);
  if (!dosya) throw new Error(`Film yok: ${ad}`);
  const sessiz = q.has('sessiz');
  let film: Film | null = null;

  const oynatDugme = h('button.dugme.fl-oynat', { type: 'button' }, svg(IKON.oyna), 'Oynat');
  const kapak = h('div.fl-kapak', {}, h('h1.fl-baslik', {}, dosya.baslik), oynatDugme);
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
  const el = h('div.fl-ekran', {}, sahneKap, kapak, ust);

  const ogutKarti = (metin: string) => {
    const tekrar = h('button.dugme', { type: 'button', style: '--r:var(--yesil)' }, svg(IKON.tekrar), 'Tekrar izle');
    tekrar.addEventListener('click', () => app.git('film', { ad }));
    const kart = h('div.fl-ogut', {}, h('p', {}, metin), tekrar);
    el.append(kart);
    if (!sessiz && !TEST_MODU) void konus(metin);
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
