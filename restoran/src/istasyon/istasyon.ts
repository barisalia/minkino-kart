/**
 * İstasyon çerçevesi (§8 ortak kalıp): istasyonun kendi tam çözünürlüklü arka planı (büyütme değil, geçiş perdesi),
 * Mino köşesi (sol alt), geri düğmesi (sol üst; tepsisiz çıkış, tava pişmeye devam eder), TEPSİ düğmesi (sağ alt,
 * resim, yazı yok). Mini oyunu sözleşmeyle (mini/arayuz.ts) başlatır; ipucu merdivenini sayar.
 *
 * Üstten çizilen istasyonlar dikeyde 90° döndürülür (yalnız arka plan katmanı; mini oyunun sprite'ları dönmez).
 * Fırın ve içecek önden çizilir; onların dikey çizimi ayrı (`istasyon/<ad>-dikey`).
 */
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import { netlikOnYukle } from '../../../src/ui/netlik';
import { merdivenKur } from '../lokanta/ipucu';
import type { ArkaIs, Istasyon, MiniBaglam, MiniGirdi, MiniOturum, MiniOyun, TepsiDugmesi, Urun } from '../mini/arayuz';
import { sesler } from '../sesler';
import { varlik } from '../varliklar';
import { minoKoseKur } from './mino-kose';

/** Önden çizilen istasyonlar (dikeyde döndürülmez, ayrı dikey çizim) */
const ONDEN: Istasyon[] = ['firin', 'icecek'];

export interface IstasyonSecenek {
  oyun: MiniOyun;
  girdi: MiniGirdi;
  /** tepsi: ürünler (boş olabilir) */
  tepsiyeAlindi(urunler: Urun[]): void;
  /** geri düğmesi: pişmeye devam eden iş (yoksa null) */
  geriDonuldu(arka: ArkaIs | null): void;
}

export interface IstasyonEkrani {
  el: HTMLElement;
  kapat(): void;
}

/** Dokunsal geri bildirim (Capacitor Haptics; web'de yok) */
function dokunsal(ms = 12) {
  const cap = (globalThis as unknown as { Capacitor?: { Plugins?: { Haptics?: { impact?: (o: { style: string }) => void } }; isNativePlatform?: () => boolean } }).Capacitor;
  try {
    if (cap?.isNativePlatform?.()) cap.Plugins?.Haptics?.impact?.({ style: ms > 15 ? 'MEDIUM' : 'LIGHT' });
  } catch {
    /* yok say */
  }
}

export function istasyonAc(kap: HTMLElement, s: IstasyonSecenek): IstasyonEkrani {
  const ist = s.oyun.istasyon;
  const arka = h('div.rs-ist-arka', { 'data-istasyon': ist });
  const alan = h('div.rs-ist-alan');
  const geri = h('button.rs-ist-geri', { type: 'button', 'aria-label': 'Lokantaya dön' }, h('span.rs-ist-geri-ikon'));
  const tepsiEl = h('button.rs-tepsi-dugme', { type: 'button', 'aria-label': 'Tepsiye koy' }, h('span.rs-tepsi-resim'));
  const tepsiResim = varlik('alet/tepsi');
  if (tepsiResim) (tepsiEl.firstChild as HTMLElement).style.backgroundImage = `url("${tepsiResim}")`;
  const el = h('div.rs-istasyon', { 'data-istasyon': ist, 'data-oyun': s.oyun.ad }, arka, alan, geri, tepsiEl);
  kap.append(el);

  // arka plan: kendi çizimi (yoksa sade yer tutucu yüzey, CSS)
  const dikeyMi = () => el.clientHeight > el.clientWidth * 1.05;
  const arkaKur = () => {
    const dikey = dikeyMi();
    const onden = ONDEN.includes(ist);
    const u = (dikey && onden ? varlik(`istasyon/${ist}-dikey`) : null) ?? varlik(`istasyon/${ist}`);
    el.dataset.yon = dikey ? 'dikey' : 'yatay';
    arka.classList.toggle('rs-ist-donuk', dikey && !onden && !!u);
    arka.classList.toggle('rs-ist-yertutucu', !u);
    arka.style.backgroundImage = u ? `url("${u}")` : '';
    if (u) netlikOnYukle(u);
  };
  arkaKur();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(arkaKur) : null;
  ro?.observe(el);

  const mino = minoKoseKur(el);
  const merdiven = merdivenKur(el, (m) => void mino.soyle(m), { erken: s.girdi.ilkOyun });
  el.addEventListener('pointerdown', () => merdiven.dokunuldu(), { capture: true });

  let tepsiFn: (() => void) | null = null;
  const tepsi: TepsiDugmesi = {
    el: tepsiEl,
    dinle(fn) {
      tepsiFn = fn;
    },
    hopla() {
      tepsiEl.classList.remove('rs-hopla');
      void tepsiEl.offsetWidth;
      tepsiEl.classList.add('rs-hopla');
      sesler.cal('hop');
    },
  };
  const baglam: MiniBaglam = { kok: alan, dikey: dikeyMi(), mino, ses: sesler, dokunsal, ipucu: merdiven, tepsi };

  let oturum: MiniOturum | null = null;
  let bitti = false;
  try {
    oturum = s.oyun.baslat(baglam, s.girdi);
  } catch (e) {
    console.warn('Mini oyun açılamadı', s.oyun.ad, e);
  }
  const kapat = () => {
    if (bitti) return;
    bitti = true;
    merdiven.dur();
    ro?.disconnect();
    try {
      oturum?.kapat();
    } catch (e) {
      console.warn(e);
    }
    mino.kapat();
  };
  tepsiEl.addEventListener('click', () => {
    if (bitti) return;
    sesler.cal('hop');
    if (tepsiFn) tepsiFn();
    else void Promise.resolve([]).then((u) => cik(u));
  });
  oturum?.bitti.then(
    (u) => cik(u ?? []),
    () => cik([]),
  );
  function cik(urunler: Urun[]) {
    if (bitti) return;
    kapat();
    perde(el, () => s.tepsiyeAlindi(urunler));
  }
  geri.addEventListener('click', () => {
    if (bitti) return;
    let a: ArkaIs | null = null;
    try {
      a = oturum?.arkaPlanda?.() ?? null;
    } catch (e) {
      console.warn(e);
    }
    kapat();
    perde(el, () => s.geriDonuldu(a));
  });

  // giriş: krem perde açılır (büyütme yok)
  el.classList.add('rs-giris');
  window.setTimeout(() => el.classList.remove('rs-giris'), sure(320));
  return { el, kapat };
}

/** Çıkış: istasyon kremle solar, sonra lokanta */
function perde(el: HTMLElement, sonra: () => void) {
  el.classList.add('rs-cikis');
  window.setTimeout(
    () => {
      el.remove();
      sonra();
    },
    TEST_MODU ? 20 : 260,
  );
}
