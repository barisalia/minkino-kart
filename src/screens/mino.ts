import { MINO, minoCumle } from '../audio/cumleler';
import { efekt, konus } from '../audio/ses';
import { kart } from '../engine/katalog';
import { Mino, type Tepki } from '../mino/mino';
import { bekle, h, karistir, sure, TEST_MODU } from '../ui/dom';
import { izgaraSigdir, merkez, sinifOynat, ucur } from '../ui/hareket';
import { IKON } from '../ui/ikonlar';
import { gorselUrl, kartEl } from '../ui/kart';
import { konfetiPatlat } from '../ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../ui/ortak';
import type { Ekran, Uygulama } from '../uygulama';

const MINO_TON = 1.12; // Mino'nun sesi anlatıcıdan biraz daha ince
const rastgele = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** Mino ile Kelimeler: Mino bir şey ister, çocuk doğru kartı ona verir. Mino'ya dokununca tepki verir. */
export function minoEkrani(app: Uygulama): Ekran {
  const mino = new Mino();
  if (TEST_MODU) (window as unknown as { __mino: Mino }).__mino = mino;
  const dusunce = h('div.dusunce', { 'aria-hidden': 'true' }, h('b', {}, '?'));
  const tepsi = h('div.mino-tepsi');
  const sahne = h('div.mino-sahne', {}, dusunce, mino.el);
  let kapandi = false;
  let hedef = '';
  let yanlis = 0;
  let dogruSayisi = 0;
  let mesgul = false;
  let bosta: number | undefined;
  let sonTepki = 0;
  const tumKelimeler = [...MINO.yiyecekler, ...MINO.digerleri].filter((id) => kart(id));

  const soyle = (t: Parameters<typeof konus>[0]) => konus(t, { ton: MINO_TON });

  function bostaKur() {
    clearTimeout(bosta);
    if (TEST_MODU) return;
    bosta = window.setTimeout(async () => {
      if (kapandi || mesgul) return;
      mino.tepki('esne');
      await soyle(MINO.esne);
      if (!kapandi) mino.uyu();
    }, 20000);
  }

  function dusunceGoster(ipucu: boolean) {
    const k = kart(hedef);
    const url = gorselUrl(k);
    dusunce.replaceChildren(ipucu && url ? h('img', { src: url, alt: '' }) : h('b', {}, '?'));
    void sinifOynat(dusunce, 'ziplat', 500);
  }

  async function yeniTur() {
    if (kapandi) return;
    yanlis = 0;
    const secilen = karistir(tumKelimeler).slice(0, 3);
    hedef = secilen[0];
    const izgara = h('div.izgara');
    for (const [i, id] of karistir(secilen).entries()) {
      const el = kartEl(id, { sinif: 'giris' });
      el.style.setProperty('--i', String(i));
      el.dataset.kart = id;
      if (TEST_MODU && id === hedef) el.dataset.dogru = '1';
      surukleVer(el, id);
      izgara.append(el);
    }
    tepsi.replaceChildren(izgara);
    temizlik.push(izgaraSigdir(tepsi, izgara, 3, { enBuyuk: 170 }));
    dusunceGoster(false);
    mino.tepki('sasir', 0.8);
    await soyle(minoCumle(MINO.istek, hedef));
  }

  /** Kartı Mino'ya ver: dokunmak ya da Mino'nun üstüne sürüklemek. */
  function surukleVer(el: HTMLElement, id: string) {
    el.addEventListener('pointerdown', (e) => {
      if (mesgul) return;
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      const x0 = e.clientX;
      const y0 = e.clientY;
      let tasindi = false;
      const hareket = (m: PointerEvent) => {
        const dx = m.clientX - x0;
        const dy = m.clientY - y0;
        if (Math.hypot(dx, dy) > 8) tasindi = true;
        if (tasindi) el.style.transform = `translate(${dx}px, ${dy}px) scale(1.08) rotate(-4deg)`;
      };
      const son = (u: PointerEvent) => {
        el.removeEventListener('pointermove', hareket);
        el.removeEventListener('pointerup', son);
        el.removeEventListener('pointercancel', son);
        const r = mino.el.getBoundingClientRect();
        const minoyaDegdi = u.clientX > r.left && u.clientX < r.right && u.clientY > r.top && u.clientY < r.bottom;
        if (!tasindi || minoyaDegdi) void ver(el, id);
        else {
          el.animate([{ transform: el.style.transform }, { transform: 'none' }], { duration: 250, easing: 'ease-out' });
          el.style.transform = '';
        }
      };
      el.addEventListener('pointermove', hareket);
      el.addEventListener('pointerup', son);
      el.addEventListener('pointercancel', son);
    });
  }

  async function ver(el: HTMLElement, id: string) {
    if (mesgul || kapandi) return;
    bostaKur();
    if (mino.uyuyorMu) mino.uyan();
    if (id !== hedef) {
      yanlis++;
      efekt.yanlis();
      el.style.transform = '';
      void sinifOynat(el, 'sallan', 500);
      mino.tepki('hayir');
      await soyle([`${kart(id)?.ad}!`, rastgele(MINO.yanlis)]);
      if (yanlis >= 2) dusunceGoster(true);
      return;
    }
    mesgul = true;
    efekt.dogru();
    const a = mino.agizKonumu();
    const hedefNokta = h('div', { style: `position:fixed;left:${a.x}px;top:${a.y}px;width:1px;height:1px` });
    app.kok.append(hedefNokta);
    el.style.visibility = 'hidden';
    el.style.transform = '';
    mino.tepki('sasir', 0.5);
    await ucur(app.kok, kartEl(id), el, hedefNokta, 0.15, 520);
    hedefNokta.remove();
    if (kapandi) return;
    efekt.yapis();
    mino.tepki('ham', 1.5);
    kalpler(a.x, a.y);
    dogruSayisi++;
    await soyle(minoCumle(MINO.yiyecekler.includes(id) ? MINO.yedi_yiyecek : MINO.yedi_diger, id));
    if (kapandi) return;
    if (dogruSayisi % 4 === 0) {
      const m = merkez(mino.el);
      konfetiPatlat(app.kok, m.x, m.y - m.h * 0.2, 110);
      efekt.konfeti();
      mino.tepki('dans');
      await Promise.all([soyle(rastgele(MINO.kutlama)), bekle(sure(2400))]);
    } else await bekle(sure(500));
    mesgul = false;
    void yeniTur();
  }

  function kalpler(x: number, y: number) {
    if (TEST_MODU) return;
    for (let i = 0; i < 5; i++) {
      const k = h('div.kalp', { style: `left:${x}px;top:${y}px;--dx:${(i - 2) * 34}px;animation-delay:${i * 90}ms` }, '♥');
      app.kok.append(k);
      setTimeout(() => k.remove(), 1600);
    }
  }

  // Mino'ya dokununca komik tepkiler
  mino.el.addEventListener('pointerdown', async (e) => {
    if (mesgul) return;
    bostaKur();
    const simdi = performance.now();
    if (simdi - sonTepki < 700) return;
    sonTepki = simdi;
    if (mino.uyuyorMu) {
      mino.uyan();
      mino.tepki('zipla');
      efekt.secim();
      await soyle(MINO.uyan);
      return;
    }
    const b = mino.bolge(e.clientX, e.clientY);
    const tepki: Record<typeof b, Tepki> = { kafa: 'mir', burun: 'hapsu', gobek: 'gidik', kuyruk: 'zipla', ayak: 'dans' };
    mino.tepki(tepki[b]);
    if (b === 'gobek') efekt.konfeti(true);
    else efekt.secim();
    await soyle(rastgele(MINO.tepki[b]));
  });

  const temizlik: (() => void)[] = [];
  const el = h(
    'div.mino-ekran',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.ev, 'Ana ekran', () => app.git('acilis')), h('div.ust-grup', {}, sesDugmesi())),
    sahne,
    tepsi,
  );

  void (async () => {
    await bekle(sure(300));
    if (kapandi) return;
    mino.tepki('zipla');
    await soyle(MINO.selam);
    await yeniTur();
    bostaKur();
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      clearTimeout(bosta);
      mino.kapat();
      temizlik.forEach((f) => f());
    },
  };
}
