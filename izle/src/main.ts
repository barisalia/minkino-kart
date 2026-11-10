/**
 * Çizgi film oynatıcısı (izle/?video=<id>): film YouTube'dan (youtube-nocookie iframe, IFrame API) oynar, ama ekran
 * bizim: siyah zemin, sol üstte geri düğmesi, başlamadan önce kapak + büyük oynat düğmesi. Film bitince YouTube'un
 * öneri ekranı yerine kapak ve "yeniden" düğmesi gelir (rel=0 yine de yalnız kendi kanalımızı önerir).
 * İnternet yoksa kapağın üstünde bulut işareti; yazı yok. Uygulama arka plana geçince film durur.
 * Videolar: src/video/videolar.ts.
 */
import '../../src/styles/ana.css';
import './izle.css';
import { efekt } from '../../src/audio/ses';
import { geriDinle } from '../../src/kabuk/yon';
import { h, svg } from '../../src/ui/dom';
import { sayfaAcildi } from '../../src/ui/gecis';
import { IKON } from '../../src/ui/ikonlar';
import { yuvarlakDugme } from '../../src/ui/ortak';
import { anaMenuyeDon } from '../../src/uygulama';
import { videoBul, VIDEOLAR } from '../../src/video/videolar';

interface YTOynatici {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(sn: number, izin: boolean): void;
}
interface YTAlan {
  Player: new (el: HTMLElement, ayar: Record<string, unknown>) => YTOynatici;
  PlayerState: { ENDED: number; PLAYING: number };
}
declare global {
  interface Window {
    YT?: YTAlan;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** IFrame API betiğini bir kez yükler */
function apiYukle(): Promise<YTAlan> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  return new Promise((coz, red) => {
    window.onYouTubeIframeAPIReady = () => (window.YT ? coz(window.YT) : red(new Error('YT yok')));
    const b = document.createElement('script');
    b.src = 'https://www.youtube.com/iframe_api';
    b.onerror = () => red(new Error('YT betiği yüklenmedi'));
    document.head.append(b);
    setTimeout(() => red(new Error('YT zaman aşımı')), 15000);
  });
}

const BULUT = `<svg viewBox="0 0 48 48"><path d="M14 36h21a8 8 0 0 0 1-15.9A11 11 0 0 0 15 18a9 9 0 0 0-1 18z" fill="#fff" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M19 27l10 6M29 27l-10 6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;

const kok = document.getElementById('izle');
if (kok) {
  kok.className = 'mk-kok iz-kok';
  const v = videoBul(new URLSearchParams(location.search).get('video')) ?? VIDEOLAR[0];
  const sahne = h('div.iz-sahne');
  const kapak = h('img.iz-kapak', { src: v.kapak, alt: '', draggable: 'false' });
  const oynat = h('button.iz-oynat', { type: 'button', 'aria-label': 'Oynat' }, svg(IKON.oyna));
  const bulut = h('div.iz-bulut', { 'aria-hidden': 'true', hidden: true, html: BULUT });
  let oynatici: YTOynatici | null = null;

  const kapakGoster = (goster: boolean) => {
    kapak.hidden = !goster;
    oynat.hidden = !goster;
  };
  const cevrimdisi = () => {
    bulut.hidden = false;
    kapakGoster(true);
  };

  const baslat = async () => {
    efekt.dokunma();
    bulut.hidden = true;
    if (oynatici) {
      kapakGoster(false);
      oynatici.seekTo(0, true);
      oynatici.playVideo();
      return;
    }
    if (!navigator.onLine) return cevrimdisi();
    oynat.disabled = true;
    try {
      const YT = await apiYukle();
      const yer = h('div');
      sahne.append(yer);
      oynatici = new YT.Player(yer, {
        host: 'https://www.youtube-nocookie.com',
        videoId: v.youtube,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, fs: 0, disablekb: 1, cc_load_policy: 0, origin: location.origin },
        events: {
          onReady: () => {
            kapakGoster(false);
            oynatici?.playVideo();
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === YT.PlayerState.ENDED) kapakGoster(true);
          },
          onError: () => cevrimdisi(),
        },
      });
    } catch {
      cevrimdisi();
    } finally {
      oynat.disabled = false;
    }
  };
  oynat.addEventListener('click', () => void baslat());

  // uygulama arka plana geçince ya da sekme gizlenince durur
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) oynatici?.pauseVideo();
  });
  kok.append(sahne, kapak, bulut, oynat, h('div.iz-ust', {}, yuvarlakDugme(IKON.geri, 'Ana menü', anaMenuyeDon, 'iz-geri')));
  geriDinle(() => {
    anaMenuyeDon();
    return true;
  });
  sayfaAcildi(kok);
}
