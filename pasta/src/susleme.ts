/**
 * Zigzag krema (sade sürüm, Gün 3): krema torbasına dokununca tabaktaki kurabiye yakın planda açılır; kesik çizgili
 * zigzag şablonu ve onu gösteren el. Çocuk kurabiyenin üstünde parmağını yana kaydırır: kabaca yatay HER kaydırma
 * sayılır (şablonu izlemek gerekmez), iki dokunuş da sayılır. Başarısız olmaz: krema temiz zigzaga "oturur".
 * Panel açıkken gün durur (fırın, sabır); kapanınca kaldığı yerden sürer.
 */
import P from '../../content/pasta.json';
import { efekt } from '../../src/audio/ses';
import type { Soylenecek } from '../../src/audio/konusma';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { desenKatmani, kremaSeridi, urunSvg } from './cizim';
import { desenHedefleri, kaydirmaSayilir, yolD, type Nokta } from './desen';
import type { Efekt } from './gorsel';
import type { Parti, Renk, Sekil } from './model';
import { ses } from './sesler';

export interface SuslemeBaglam {
  /** panelin ekleneceği yer (gün ekranı) */
  kok: HTMLElement;
  efekt: Efekt;
  soyle: (s: Soylenecek, kim?: 'mino' | 'kino', onemli?: boolean) => Promise<void>;
}

const NS = 'http://www.w3.org/2000/svg';
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 60) : ms));


/** Zigzag kremayı kurabiyelere sürer (bütün parçalar); panel kapanınca biter */
export async function zigzagCiz(b: SuslemeBaglam, parti: Parti, renk: Renk): Promise<void> {
  if (!parti.parcalar.length) return;
  const sekil: Sekil = parti.sekil ?? 'yuvarlak';
  const p = parti.parcalar[0];
  const sablon = desenHedefleri('zigzag', sekil)[0].yol;
  const urun = h('div.ps-panel-urun', {
    html: urunSvg({ urun: 'kurabiye', sekil, hal: 'pismis', renk, susler: p.susler, hamur: '#F3B54A', desen: null }),
  });
  const cizim = document.createElementNS(NS, 'svg');
  cizim.setAttribute('viewBox', '0 0 100 100');
  cizim.setAttribute('class', 'ps-panel-cizim');
  cizim.setAttribute('overflow', 'visible');
  cizim.innerHTML = `<g class="ps-sablon"><path d="${yolD(sablon)}" fill="none" stroke="#6b3a1f" stroke-opacity=".45" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><path d="${yolD(sablon)}" fill="none" stroke="#fff" stroke-width="2.2" stroke-dasharray="3.2 2.6" stroke-linecap="round" stroke-linejoin="round"/></g><g class="ps-izler"></g>`;
  const izler = cizim.querySelector('.ps-izler')!;
  // el: şablonun solundan sağına kayar (nasıl yapılacağını gösterir)
  const [x0, x1] = [sablon[0][0], sablon[sablon.length - 1][0]];
  const yOrta = sablon.reduce((t, q) => t + q[1], 0) / sablon.length;
  const el = h('div.ps-panel-el', { 'aria-hidden': 'true', style: `--x0:${x0}%;--x1:${x1}%;--y:${yOrta + 6}%` }, svg(IKON.el));
  const sahne = h('div.ps-panel-sahne', {}, h('i.ps-panel-tabak', { 'aria-hidden': 'true' }), urun);
  sahne.append(cizim, el);
  const kart = h('div.ps-panel-kart', {}, sahne);
  const panel = h('div.ps-panel', { role: 'dialog', 'aria-label': 'Zigzag krema', 'data-adim': 'desen', 'data-bitti': '0' }, kart);
  b.kok.append(panel);
  panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: TEST_MODU ? 1 : 200 });
  sahne.animate([{ transform: 'scale(.4)' }, { transform: 'scale(1.05)', offset: 0.7 }, { transform: 'none' }], { duration: TEST_MODU ? 1 : 360, easing: 'cubic-bezier(.3,1.4,.5,1)' });
  void b.soyle(P.mino.ciz, 'mino', false);

  await new Promise<void>((coz) => {
    let cizgi: Nokta[] | null = null;
    let id: number | null = null;
    let dokunus = 0;
    let bitti = false;
    const birim = (e: PointerEvent): Nokta => {
      const r = cizim.getBoundingClientRect();
      return [((e.clientX - r.left) / Math.max(1, r.width)) * 100, ((e.clientY - r.top) / Math.max(1, r.height)) * 100];
    };
    const canliCiz = () => {
      if (!cizgi) return;
      izler.innerHTML = kremaSeridi(yolD(cizgi), null, 6);
    };
    const bitir = () => {
      if (bitti) return;
      bitti = true;
      panel.dataset.bitti = '1';
      el.remove();
      cizim.removeEventListener('pointerdown', bas);
      cizim.removeEventListener('pointermove', tasi);
      cizim.removeEventListener('pointerup', son);
      cizim.removeEventListener('pointercancel', son);
      // krema temiz zigzaga oturur
      izler.innerHTML = '';
      cizim.querySelector('.ps-sablon')?.remove();
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'ps-oturdu');
      g.innerHTML = desenKatmani(sekil, 'zigzag');
      cizim.append(g);
      ses.pof();
      efekt.dogru();
      const r = cizim.getBoundingClientRect();
      const k = b.efekt.el.getBoundingClientRect();
      b.efekt.parilti(r.left - k.left + r.width / 2, r.top - k.top + r.height * 0.45, 12);
      void b.soyle(P.mino.guzel, 'mino', false);
      void bekle(650).then(() => coz());
    };
    const bas = (e: PointerEvent) => {
      if (id !== null || bitti) return;
      e.preventDefault();
      id = e.pointerId;
      try {
        cizim.setPointerCapture(id);
      } catch {
        /* yok say */
      }
      el.classList.add('ps-gizli');
      cizgi = [birim(e)];
    };
    const tasi = (e: PointerEvent) => {
      if (e.pointerId !== id || !cizgi) return;
      const q = birim(e);
      const s = cizgi[cizgi.length - 1];
      if (Math.hypot(q[0] - s[0], q[1] - s[1]) < 0.8) return;
      cizgi.push(q);
      if (cizgi.length % 3 === 0) ses.fis();
      canliCiz();
      if (kaydirmaSayilir(cizgi)) {
        id = null;
        cizgi = null;
        bitir();
      }
    };
    const son = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      const c = cizgi;
      cizgi = null;
      if (c && kaydirmaSayilir(c)) return bitir();
      // dokunuş: iki dokunuş da olur (başarısızlık yok)
      dokunus++;
      ses.tik(dokunus);
      if (dokunus >= 2) return bitir();
      el.classList.remove('ps-gizli');
    };
    cizim.addEventListener('pointerdown', bas);
    cizim.addEventListener('pointermove', tasi);
    cizim.addEventListener('pointerup', son);
    cizim.addEventListener('pointercancel', son);
  });
  for (const x of parti.parcalar) x.desen = 'zigzag';
  panel.remove();
}
