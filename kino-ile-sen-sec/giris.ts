import { sayfaAdresi } from '../src/kabuk/sayfa';
import { arkaPlanDinle, geriDinle } from '../src/kabuk/yon';
import { erisimVarMi, kilitleriKur } from '../src/abonelik/kilit';
import { kilitli } from '../src/engine/erisim';

const eski = import.meta.env.DEV ? '../ekip/film/kino-okul-ui-fikirleri/' : './film/';
const yeni = import.meta.env.DEV ? '../ekip/film/kino-firtina-geliyor/' : './firtina/';
const baslikYazisi = new FontFace('Nunito', 'url("' + yeni + 'nunito-tr-black.woff2")', { weight: '900' });
void baslikYazisi.load().then(font => document.fonts.add(font)).catch(() => {});
const bolumler = {
  'bir-gun': { oyuncu: eski + (import.meta.env.DEV ? 'Kino-nun-Bir-Gunu.htm' : 'Oyna.html'), afis: eski + 'bir-gun/medya/kapak.webp', ad: 'Kino’nun Bir Günü' },
  firtina: { oyuncu: yeni + 'Oyna.htm', afis: yeni + 'medya/afis.webp', ad: 'Fırtına Geliyor!' },
};
type Bolum = keyof typeof bolumler;
const film = document.querySelector('iframe')!;
const liste = document.querySelector<HTMLElement>('#liste');
const kartlar = document.querySelectorAll<HTMLAnchorElement>('a[data-bolum]');
let oynanan: Bolum | null = null;
function goster() {
  const kod = new URL(location.href).searchParams.get('bolum');
  // kilitli bölüm adresle de açılmaz (Fırtına premium: src/engine/erisim.ts)
  const ad = (kod === 'bir-gun' || kod === 'firtina') && !kilitli('kino-ile-sen-sec/' + kod) ? kod : null;
  // The shared Vite index can reload when another team edits an unrelated HTML page.
  // A static preview shell keeps that event out of the active film.
  if (import.meta.env.DEV && liste && ad) {
    location.replace('./oynat.htm?bolum=' + ad);
    return;
  }
  if (!liste && !ad) { location.replace('./'); return; }
  if (ad === oynanan) return;
  const eskiAd = oynanan;
  oynanan = ad;
  if (liste) liste.hidden = !!ad;
  film.hidden = !ad;
  if (ad) {
    film.title = bolumler[ad].ad;
    film.src = bolumler[ad].oyuncu + '?uygulama';
    film.focus();
  } else {
    film.removeAttribute('src');
    liste?.querySelector<HTMLElement>('[data-bolum="'+eskiAd+'"]')?.focus();
  }
}
function sec(ad: Bolum | null) {
  if (import.meta.env.DEV) {
    if (ad) location.assign('./oynat.htm?bolum=' + ad);
    else if (document.referrer && new URL(document.referrer).origin === location.origin &&
             new URL(document.referrer).pathname.replace(/index\.html$/, '') === new URL('./', location.href).pathname) {
      history.back();
    } else location.replace('./');
    return;
  }
  const url = new URL(location.href);
  if (ad) url.searchParams.set('bolum', ad);
  else url.searchParams.delete('bolum');
  if (ad) history.pushState({ bolumListesinden: true }, '', url);
  else if (history.state?.bolumListesinden) { history.back(); return; }
  else history.replaceState(null, '', url);
  goster();
}
function oyunlaraDon() {
  sessionStorage.setItem('minkino-menu-bolum', 'oyun');
  location.replace(sayfaAdresi('../'));
}
for (const kart of kartlar) {
  const ad = kart.dataset.bolum as Bolum;
  kart.querySelector('img')!.src = bolumler[ad].afis;
  kart.onclick = ev => { ev.preventDefault(); if (erisimVarMi('kino-ile-sen-sec/' + ad, document.body)) sec(ad); };
}
kilitleriKur([...kartlar].map(k => [k, 'kino-ile-sen-sec/' + k.dataset.bolum] as [HTMLElement, string]));
const menuGeri = document.querySelector<HTMLButtonElement>('#geri');
if (menuGeri) menuGeri.onclick = oyunlaraDon;
window.addEventListener('popstate', goster);
window.addEventListener('minkino:oyunlara-don', () => sec(null));
geriDinle(() => {
  const harita = film.contentDocument?.querySelector<HTMLDialogElement>('dialog[open]');
  if (harita) harita.close();
  else if (oynanan) sec(null);
  else oyunlaraDon();
  return true;
});
arkaPlanDinle(arkada => {
  if (arkada && oynanan) film.contentWindow?.dispatchEvent(new Event('minkino:duraklat'));
});
goster();
