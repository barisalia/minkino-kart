import { sayfaAdresi } from '../src/kabuk/sayfa';
import { arkaPlanDinle, geriDinle } from '../src/kabuk/yon';

const film = document.querySelector('iframe')!;
film.src = (import.meta.env.DEV
  ? '../ekip/film/kino-okul-ui-fikirleri/Kino-nun-Bir-Gunu.htm'
  : './film/Oyna.html') + '?uygulama';

function oyunlaraDon() {
  sessionStorage.setItem('minkino-menu-bolum', 'oyun');
  location.replace(sayfaAdresi('../'));
}

window.addEventListener('minkino:oyunlara-don', oyunlaraDon);

geriDinle(() => {
  const harita = film.contentDocument?.querySelector<HTMLDialogElement>('dialog[open]');
  if (harita) harita.close();
  else oyunlaraDon();
  return true;
});

arkaPlanDinle((arkada) => {
  if (arkada) film.contentWindow?.dispatchEvent(new Event('minkino:duraklat'));
});
