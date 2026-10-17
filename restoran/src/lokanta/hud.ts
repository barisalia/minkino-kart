/**
 * HUD paneli (§7d, P8): sahnenin sağında (dikeyde altında) illüstre, bal rengi ahşap tabela. YAZI VE RAKAM YOK, her
 * şey resim. Panel bir oyun yüzeyidir, menü değil: her parçası dokununca canlanır.
 *
 *  Gün takvimi ...... yaprak takvim, sayfasında günün havası (güneş / bulut / yağmur; yalnız süs); altında oynanan
 *                     günler minik noktalar. Dokununca yaprak kalkar, Mino "Bugün güneşli!" der.
 *  Kalp kavanozu .... bugün mutlu giden her müşteri kalp atar ("mmm" 1, "bayıldı" 2, komik 0). ASLA boşalmaz, düşmez.
 *                     Dolunca Babaanne panelin üstünden başını uzatıp alkışlar.
 *  Altın sandık ..... birikim: kasadaki jetonların toplamı (kayıttaki `jeton`); yığın yükselir. Hesaptan gelen jeton
 *                     sahnedeki kasaya girer, sandık bir kez hoplar.
 *  Defter ........... Babaanne'nin Defteri gün içinde de bakılır; alım gün sonunda.
 *  Liste ............ Babaanne'nin listesi (§16f): P7 gelene kadar gizli (kanca: `liste`).
 *  Menü tahtası ..... bugünün yemekleri (küçük resimler); dokununca Mino adlarını söyler.
 *  Dişli ve ses ..... dişli: menüye dönüş (var olan ev düğmesinin yerine), ses: çocuğun hoparlör düğmesi.
 *
 * Görseller: `hud/panel-dikey` (yatay ekranda dikey tabela), `hud/panel-yatay` (dikey ekranda şerit), `hud/<parça>`
 * (Gemini #71-72). Gelene kadar sade yer tutucu (CSS ahşap, düz şekiller; BİTMİŞ ÇİZİM DEĞİL).
 */
import { konus, sessizeAlDegistir, tumSesKapaliMi } from '../../../src/audio/ses';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import hudJson from '../../../content/restoran/hud.json';
import { L } from '../model';
import type { Olcu34 } from '../olcek';
import { sesler, salonSes } from '../sesler';
import { varlik, yeniden } from '../varliklar';
import { yemekResmi } from './istek-gorsel';
import { Kisi } from './kisi';
import './hud.css';

export const HUD_SOZ = hudJson;

// ---------------------------------------------------------------- saf kurallar

/** Kavanozun dolu sayıldığı kalp sayısı (görünen en çok kalp) */
export const KAVANOZ_KAPASITE = 10;
/** Tepkinin kavanoza attığı kalp: bayıldı 2, mmm 1, komik 0 (ceza yok: hiçbir tepki kalp düşürmez) */
export function tepkiKalbi(tepki: string): number {
  return tepki === 'bayildi' ? 2 : tepki === 'mmm' ? 1 : 0;
}
/** Kavanoz yalnız dolar: yeni sayı asla eskisinden az değildir */
export function kalpEkle(n: number, tepki: string): number {
  return Math.max(n, n + tepkiKalbi(tepki));
}
/** Kavanoz doluluğu 0..1 */
export const kavanozDoluluk = (n: number) => Math.min(1, Math.max(0, n) / KAVANOZ_KAPASITE);
/** Günün havası (yalnız süs): 1. gün güneş, sonra sırayla */
export type Hava = 'gunes' | 'bulut' | 'yagmur';
export const hava = (gun: number): Hava => (['gunes', 'gunes', 'bulut', 'gunes', 'yagmur', 'gunes', 'bulut'] as const)[(Math.max(1, gun) - 1) % 7];
/** Sandıkta görünen jeton yığını (sayı değil, yükseklik): en çok 14 jeton resmi */
export const sandikYigini = (jeton: number) => Math.max(0, Math.min(14, Math.ceil(jeton / 2)));
/** Takvimin altındaki gün noktaları: en çok 10 (bugün dahil) */
export const gunNoktalari = (gun: number) => Math.max(1, Math.min(10, gun));

// ---------------------------------------------------------------- DOM

export interface HudBaglam {
  gun: number;
  jeton: () => number;
  menu: () => string[];
  minoSoyle: (metin: string) => Promise<void>;
  /** Babaanne'nin Defteri (gün içinde bakma) */
  defter: () => void;
  /** menüye dön (dişli) */
  cikis: (() => void) | null;
  /** lokantanın tepsisi panelde durur */
  tepsi: HTMLElement;
  kapandi: () => boolean;
}

export interface Hud {
  el: HTMLElement;
  yerlestir(o: Olcu34): void;
  /** müşteri mutlu gitti: kalp(ler) uçar, kavanoz dolar; kaynak: kalbin çıktığı yer */
  kalp(tepki: string, kaynak?: Element | null): void;
  /** kasa doldu: sandık bir kez hoplar, yığın günceller */
  sandik(hopla?: boolean): void;
  menuCiz(): void;
  /** P7 kancası: Babaanne'nin listesi yuvası (gizli) */
  liste: HTMLElement;
  /** bugün atılan kalp */
  readonly kalpSayisi: number;
  kapat(): void;
}

const resim = (yol: string, sinif = '') => {
  const u = varlik(yol);
  return u ? h(`img.rs-hud-resim${sinif}`, { src: u, alt: '', draggable: 'false' }) : null;
};
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));
const hopla = (e: Element) => {
  e.classList.remove('rs-hopla');
  void (e as HTMLElement).offsetWidth;
  e.classList.add('rs-hopla');
};

export function hudKur(kap: HTMLElement, b: HudBaglam): Hud {
  const S = HUD_SOZ.mino;
  const panelDikey = varlik('hud/panel-dikey');
  const panelYatay = varlik('hud/panel-yatay');
  const el = h('div.rs-hud', { 'aria-label': 'Panel' });
  const zemin = h('div.rs-hud-zemin', { 'data-resimli': panelDikey || panelYatay ? '1' : undefined });
  if (panelDikey) zemin.style.setProperty('--rs-hud-dikey', `url("${panelDikey}")`);
  if (panelYatay) zemin.style.setProperty('--rs-hud-yatay', `url("${panelYatay}")`);
  const saksi = h('i.rs-hud-saksi', { 'aria-hidden': 'true' });
  const ic = h('div.rs-hud-ic');
  el.append(zemin, saksi, ic);

  // ---- takvim
  const hv = hava(b.gun);
  const takvimResim = resim(`hud/takvim-${hv}`);
  const yaprak = h('span.rs-hud-yaprak', { 'data-hava': hv }, takvimResim ?? h('i.rs-hud-hava', { 'data-hava': hv }));
  const noktalar = h('span.rs-hud-noktalar', {}, ...Array.from({ length: gunNoktalari(b.gun) }, (_, i) => h(`i${i === gunNoktalari(b.gun) - 1 ? '.rs-bugun' : ''}`)));
  const takvim = h('button.rs-hud-parca.rs-hud-takvim', { type: 'button', 'aria-label': 'Takvim', 'data-hava': hv, 'data-gun': String(b.gun) }, yaprak, noktalar);
  takvim.addEventListener('click', () => {
    yaprak.classList.remove('rs-kalk');
    void yaprak.offsetWidth;
    yaprak.classList.add('rs-kalk');
    sesler.cal('hop', { guc: 0.5 });
    void b.minoSoyle(S[hv]);
  });

  // ---- kalp kavanozu
  let kalpler = 0;
  const kavanozIc = h('span.rs-hud-kalpler');
  const kavanoz = h('button.rs-hud-parca.rs-hud-kavanoz', { type: 'button', 'aria-label': 'Kalp kavanozu', 'data-kalp': '0' }, resim('hud/kavanoz-bos') ?? h('i.rs-hud-kavanoz-cam'), kavanozIc);
  const kalpUrl = () => varlik('efekt/kalp') ?? varlik('balon/kalp');
  const kavanozCiz = () => {
    const n = Math.min(KAVANOZ_KAPASITE, kalpler);
    const u = kalpUrl();
    while (kavanozIc.children.length < n) {
      const i = kavanozIc.children.length;
      kavanozIc.append(h('i.rs-hud-kalp', { style: `left:${4 + (i % 3) * 33}%;bottom:${Math.floor(i / 3) * 22}%` }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null));
    }
    kavanoz.dataset.kalp = String(kalpler);
    kavanoz.dataset.dolu = kalpler >= KAVANOZ_KAPASITE ? '1' : '';
  };
  kavanoz.addEventListener('click', () => {
    kavanozIc.querySelectorAll('.rs-hud-kalp').forEach((k, i) => window.setTimeout(() => hopla(k), TEST_MODU ? 0 : i * 60));
    sesler.cal('ting', { guc: 0.5 });
    if (kalpler) void b.minoSoyle(S.kavanoz);
  });

  // ---- altın sandık
  const yigin = h('span.rs-hud-yigin');
  const sandikKapali = resim('hud/sandik-kapali');
  const sandikAcik = resim('hud/sandik-acik', '.rs-hud-acik');
  const sandikEl = h('button.rs-hud-parca.rs-hud-sandik', { type: 'button', 'aria-label': 'Sandık', 'data-jeton': String(b.jeton()) }, yigin, sandikKapali ?? h('i.rs-hud-sandik-ciz'), sandikAcik);
  const jetonUrl = () => varlik('efekt/jeton') ?? yeniden('pasta/jeton-1');
  const sandikCiz = () => {
    const n = sandikYigini(b.jeton());
    const u = jetonUrl();
    yigin.replaceChildren(...Array.from({ length: n }, (_, i) => h('i.rs-jeton', { style: `left:${8 + (i % 3) * 26}%;bottom:${Math.floor(i / 3) * 12 + (i % 2) * 3}%` }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null)));
    sandikEl.dataset.jeton = String(b.jeton());
  };
  sandikEl.addEventListener('click', async () => {
    sandikEl.classList.add('rs-acik');
    for (let i = 0; i < 3; i++) {
      salonSes.jeton(i);
      await bekle(110);
    }
    void b.minoSoyle(S.sandik);
    await bekle(700);
    sandikEl.classList.remove('rs-acik');
  });

  // ---- defter, menü tahtası
  const defter = h('button.rs-hud-parca.rs-hud-defter', { type: 'button', 'aria-label': 'Defter' }, resim('hud/defter') ?? h('i.rs-hud-defter-ciz'));
  defter.addEventListener('click', () => {
    hopla(defter);
    sesler.cal('hop', { guc: 0.6 });
    b.defter();
  });
  const menuIc = h('span.rs-hud-menu-ic');
  const menuEl = h('button.rs-hud-parca.rs-hud-menu', { type: 'button', 'aria-label': 'Menü' }, resim('hud/menu-tahtasi') ?? h('i.rs-hud-tahta-ciz'), menuIc);
  let menuSoyluyor = false;
  menuEl.addEventListener('click', async () => {
    if (menuSoyluyor) return;
    menuSoyluyor = true;
    const adlar = L.tarif as Record<string, string>;
    const resimler = [...menuIc.children];
    for (const [i, t] of b.menu().entries()) {
      if (b.kapandi()) break;
      if (resimler[i]) hopla(resimler[i]);
      if (adlar[t]) await b.minoSoyle(adlar[t]);
    }
    menuSoyluyor = false;
  });

  // ---- liste (P7), dişli, ses
  const liste = h('div.rs-hud-parca.rs-hud-liste', { hidden: true });
  const dugmeler = h('div.rs-hud-dugmeler');
  const disli = h('button.rs-hud-parca.rs-hud-disli', { type: 'button', 'aria-label': 'Menüye dön' }, resim('hud/ayar') ?? h('i.rs-hud-disli-ciz'));
  disli.addEventListener('click', () => b.cikis?.());
  if (!b.cikis) disli.hidden = true;
  const sesDugme = h('button.rs-hud-parca.rs-hud-ses', { type: 'button', 'aria-label': 'Ses', 'data-kapali': tumSesKapaliMi() ? '1' : '' }, resim('hud/ses') ?? h('i.rs-hud-ses-ciz'));
  sesDugme.addEventListener('click', () => {
    const kapali = sessizeAlDegistir();
    sesDugme.dataset.kapali = kapali ? '1' : '';
    hopla(sesDugme);
  });
  dugmeler.append(disli, sesDugme);

  const tepsiYuva = h('div.rs-hud-tepsi');
  tepsiYuva.append(b.tepsi);
  const ikili = h('div.rs-hud-ikili', {}, defter, menuEl);
  ic.append(takvim, kavanoz, sandikEl, ikili, liste, tepsiYuva, dugmeler);
  kap.append(el);

  const menuCiz = () => menuIc.replaceChildren(...b.menu().slice(0, 4).map((t) => h('span.rs-hud-yemek', { 'data-tarif': t }, yemekResmi(t))));
  menuCiz();
  sandikCiz();
  kavanozCiz();

  // Babaanne kavanoz dolunca panelin üstünden başını uzatır
  let babaanneGeldi = false;
  const babaanneAlkis = async () => {
    if (babaanneGeldi || b.kapandi()) return;
    babaanneGeldi = true;
    const yer = h('div.rs-hud-babaanne');
    const k = new Kisi('babaanne', 'babaanne');
    yer.append(k.el);
    el.append(yer);
    k.yerKoy(50, 100);
    await k.hazir;
    k.poz('alkis');
    yer.classList.add('rs-goster');
    void k.oynat('sevin', 900);
    sesler.cal('cin');
    await Promise.all([b.minoSoyle(S.kavanoz_doldu), konus(HUD_SOZ.babaanne.alkis, { karakter: 'babaanne', cihazSesi: false }).catch(() => undefined)]);
    await bekle(600);
    yer.classList.remove('rs-goster');
    await bekle(400);
    k.kapat();
    yer.remove();
  };

  const kalpUcur = async (kaynak: Element | null | undefined) => {
    const hedef = kavanoz.getBoundingClientRect();
    const kr = kap.getBoundingClientRect();
    const a = kaynak?.getBoundingClientRect();
    if (!a || !a.width || !hedef.width || TEST_MODU) return;
    const u = kalpUrl();
    const k = h('span.rs-hud-ucan-kalp', { style: `left:${a.left + a.width / 2 - kr.left - 12}px;top:${a.top + a.height * 0.2 - kr.top}px` }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
    kap.append(k);
    const dx = hedef.left + hedef.width / 2 - (a.left + a.width / 2);
    const dy = hedef.top + hedef.height * 0.4 - (a.top + a.height * 0.2);
    try {
      await k.animate([{ transform: 'none' }, { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 70}px) scale(1.15)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) scale(0.7)` }], { duration: sure(700), easing: 'ease-in-out' }).finished;
    } catch {
      /* yok say */
    }
    k.remove();
  };

  return {
    el,
    liste,
    get kalpSayisi() {
      return kalpler;
    },
    yerlestir(o: Olcu34) {
      Object.assign(el.style, { left: `${o.hud.x}px`, top: `${o.hud.y}px`, width: `${o.hud.w}px`, height: `${o.hud.h}px` });
      el.dataset.yon = o.yon;
    },
    kalp(tepki, kaynak) {
      const n = tepkiKalbi(tepki);
      if (!n) return;
      void (async () => {
        for (let i = 0; i < n; i++) {
          await kalpUcur(kaynak);
          kalpler = kalpEkle(kalpler, 'mmm');
          kavanozCiz();
          hopla(kavanoz);
          sesler.cal('ting', { guc: 0.4, perde: 1.1 + i * 0.1 });
        }
        if (kalpler >= KAVANOZ_KAPASITE) void babaanneAlkis();
      })();
    },
    sandik(h2 = true) {
      sandikCiz();
      if (h2) hopla(sandikEl);
    },
    menuCiz,
    kapat() {
      el.remove();
    },
  };
}
