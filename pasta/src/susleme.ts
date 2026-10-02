/**
 * Süsleme masası (v2 1a-1c, 1g): krema torbasına dokununca tabaktaki kurabiye yakın planda açılır.
 *  - Desen: kesik çizgili şablon (siparişteki desen); çocuk parmağıyla izler, krema parmağın arkasından kalın parlak bir
 *    şerit olarak çıkar. Çizgi şablona yakınsa kabul (desen.ts, toleranslı), şablon örtülünce temiz desene "oturur".
 *    Noktalı desende her nokta bir dokunuş (sayılır).
 *  - Yüz: iki göz (çikolata damlası), iki yanak (pembe şeker) dokunuşla, ağız krema çizgisiyle.
 *  - Serpinti: kavanozu sağa sola salla (parmakla sürükle ya da telefonu salla; dokunmak da döker). Az salla az, çok
 *    salla çok. Tamam ile biter.
 *  - Mum (doğum günü kapkeği): mum kutusuna her dokunuş bir mum, sayılır.
 * Panel açıkken gün durur (fırın, sabır); kapanınca kaldığı yerden sürer.
 */
import P from '../../content/pasta.json';
import { efekt } from '../../src/audio/ses';
import type { Soylenecek } from '../../src/audio/konusma';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { kremaNoktasi, kremaSeridi, mumKatmani, serpintiIkon, serpintiTanesi, urunSvg, yuzParcasi } from './cizim';
import { cizgiKabul, desenHedefleri, EN_COK_SERPINTI, enYakinHedef, kapsama, KAPSAMA_ESIK, noktaIsabet, serpintiSeviye, serpintiYerleri, TOLERANS, uzunluk, yolD, yuzHedefleri, type Desen, type Hedef, type Nokta, type Yuz } from './desen';
import { Efekt, salla } from './gorsel';
import { EN_COK_MUM, sayiSozu, type Kalem, type Parti, type Renk, type Sekil } from './model';
import { kalemCizimi } from './musteri';
import { resim } from './resimler';
import { ses } from './sesler';

export type Adim = { tur: 'desen'; desen: Desen; renk: Renk } | { tur: 'yuz'; yuz: Yuz } | { tur: 'serpinti' } | { tur: 'mum' };

export interface SuslemeBaglam {
  /** panelin ekleneceği yer (gün ekranı) */
  kok: HTMLElement;
  efekt: Efekt;
  soyle: (s: Soylenecek, kim?: 'mino' | 'kino', onemli?: boolean) => Promise<void>;
}

const NS = 'http://www.w3.org/2000/svg';
const g = (sinif: string) => {
  const e = document.createElementNS(NS, 'g');
  e.setAttribute('class', sinif);
  return e;
};
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 60) : ms));

/** Telefonu sallama izni (iOS: kullanıcı dokunuşunda bir kez sorulur; vermezse parmakla sallanır) */
let izinSoruldu = false;
export function hareketIzniIste() {
  if (izinSoruldu) return;
  izinSoruldu = true;
  const D = (globalThis as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
  try {
    void D?.requestPermission?.().catch(() => undefined);
  } catch {
    /* yok say */
  }
}

/** Panelin iskeleti: sipariş (küçük balon), yakın plan sahne, araçlar, Tamam */
function panelKur(b: SuslemeBaglam, hedef: Kalem | null) {
  const urun = h('div.ps-panel-urun');
  const cizim = document.createElementNS(NS, 'svg');
  cizim.setAttribute('viewBox', '0 0 100 100');
  cizim.setAttribute('class', 'ps-panel-cizim');
  cizim.setAttribute('overflow', 'visible');
  const sahne = h('div.ps-panel-sahne', {}, h('i.ps-panel-tabak', { 'aria-hidden': 'true' }), urun);
  sahne.append(cizim);
  const araclar = h('div.ps-panel-araclar');
  const tamam = h('button.ps-panel-tamam', { type: 'button', 'aria-label': 'Tamam' }, svg(IKON.onay));
  const siparis = hedef
    ? h('div.ps-panel-siparis', { 'aria-hidden': 'true' }, h('span.ps-b-grup', { html: kalemCizimi(hedef) }), hedef.serpinti ? h('i.ps-b-isaret', { html: serpintiIkon(hedef.serpinti) }) : null)
    : null;
  const kart = h('div.ps-panel-kart', {}, siparis, sahne, araclar, tamam);
  const panel = h('div.ps-panel', { role: 'dialog', 'aria-label': 'Süsle' }, kart);
  b.kok.append(panel);
  return { panel, sahne, urun, cizim, araclar, tamam };
}

/**
 * Süsleme adımlarını sırayla oynatır, sonuçları partiye yazar (bütün parçalar aynı). Tamam her adımı bitirir (yarım
 * desen düz sayılır; ret yok, farklıysa müşteri yine yer).
 */
export async function susle(b: SuslemeBaglam, parti: Parti, hedef: Kalem | null, adimlar: Adim[]): Promise<void> {
  if (!adimlar.length || !parti.parcalar.length) return;
  const p = parti.parcalar[0];
  const sekil: Sekil = parti.sekil ?? 'yuvarlak';
  const pn = panelKur(b, hedef);
  const tum = (f: (x: (typeof parti.parcalar)[number]) => void) => parti.parcalar.forEach(f);
  /** Sahnedeki ürün (o anki hâli; adımın kendi katmanı ayrı çizilir) */
  const urunCiz = (o: { desenYok?: boolean; yuzYok?: boolean; serpintiYok?: boolean } = {}) => {
    pn.urun.innerHTML = urunSvg({
      urun: parti.urun,
      sekil: parti.sekil,
      hal: 'pismis',
      renk: p.renk,
      yigin: p.yigin,
      susler: p.susler,
      hamur: '#F3B54A',
      desen: o.desenYok ? null : p.desen ?? null,
      yuz: o.yuzYok ? null : p.yuz ?? null,
      serpinti: o.serpintiYok ? 0 : p.serpinti ?? 0,
      mum: p.mum ?? 0,
    });
  };
  // panel açılır: kurabiye büyür
  pn.panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: TEST_MODU ? 1 : 220 });
  pn.sahne.animate([{ transform: 'scale(.4)' }, { transform: 'scale(1.05)', offset: 0.7 }, { transform: 'none' }], { duration: TEST_MODU ? 1 : 380, easing: 'cubic-bezier(.3,1.4,.5,1)' });
  try {
    for (const a of adimlar) {
      pn.panel.dataset.adim = a.tur;
      pn.cizim.replaceChildren();
      pn.araclar.replaceChildren();
      if (a.tur === 'desen') {
        urunCiz({ desenYok: true, serpintiYok: true });
        const tamam = await cizimAdimi(b, pn, desenHedefleri(a.desen, sekil), (x) => (x.tur === 'nokta' ? kremaNoktasi(x.yol[0][0], x.yol[0][1]) : kremaSeridi(yolD(x.yol))), true, a.desen === 'nokta');
        tum((x) => (x.desen = tamam ? a.desen : 'duz'));
      } else if (a.tur === 'yuz') {
        urunCiz({ yuzYok: true, serpintiYok: true });
        void b.soyle(P.mino.yuz, 'mino', false);
        const tamam = await cizimAdimi(b, pn, yuzHedefleri(a.yuz, sekil), (x) => yuzParcasi(x, sekil, a.yuz), false, false);
        tum((x) => (x.yuz = tamam ? a.yuz : null));
      } else if (a.tur === 'serpinti') {
        urunCiz({ serpintiYok: true });
        const n = await serpintiAdimi(b, pn, sekil);
        tum((x) => (x.serpinti = n));
      } else {
        const n = await mumAdimi(b, pn, (k) => {
          tum((x) => (x.mum = k));
          urunCiz();
        });
        tum((x) => (x.mum = n));
      }
      urunCiz();
    }
    await bekle(260);
  } finally {
    pn.panel.remove();
  }
}

/**
 * Çizim adımı (desen ya da yüz): kesik çizgili şablon; çizgiler parmakla izlenir, noktalar dokunulur. Bitince ya da
 * Tamam'a basılınca biter; dönen: şablonun hepsi tamam mı.
 */
function cizimAdimi(b: SuslemeBaglam, pn: ReturnType<typeof panelKur>, hedefler: Hedef[], bitmis: (x: Hedef) => string, krema: boolean, say: boolean): Promise<boolean> {
  const sablon = g('ps-sablon');
  const izler = g('ps-izler');
  const biten = g('ps-biten');
  const canli = document.createElementNS(NS, 'path');
  canli.setAttribute('class', 'ps-canli');
  pn.cizim.append(sablon, biten, izler);
  sablon.innerHTML = hedefler
    .map((x, i) =>
      x.tur === 'nokta'
        ? `<g data-i="${i}" class="ps-sablon-nokta"><circle cx="${x.yol[0][0]}" cy="${x.yol[0][1]}" r="4.6" fill="#fff" fill-opacity=".55" stroke="#6b3a1f" stroke-width="1.1" stroke-dasharray="2 1.6"/></g>`
        : `<g data-i="${i}"><path d="${yolD(x.yol)}" fill="none" stroke="#6b3a1f" stroke-opacity=".6" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><path d="${yolD(x.yol)}" fill="none" stroke="#fff" stroke-width="2.2" stroke-dasharray="3.2 2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${x.yol[0][0]}" cy="${x.yol[0][1]}" r="2.6" fill="#7FE0C4" stroke="#6b3a1f" stroke-width=".8" class="ps-sablon-bas"/></g>`,
    )
    .join('');
  pn.sahne.dataset.hedefler = JSON.stringify(hedefler.map((x) => ({ tur: x.tur, yol: x.yol })));
  pn.panel.dataset.bitti = '0';
  if (krema) void b.soyle(P.mino.ciz, 'mino', false);
  const tamam = hedefler.map(() => false);
  const kabul: Nokta[][][] = hedefler.map(() => []);
  let noktaSayi = 0;
  let kinoDedi = false;

  return new Promise<boolean>((coz) => {
    let cizgi: Nokta[] | null = null;
    let id: number | null = null;
    const birim = (e: PointerEvent): Nokta => {
      const r = pn.cizim.getBoundingClientRect();
      return [((e.clientX - r.left) / Math.max(1, r.width)) * 100, ((e.clientY - r.top) / Math.max(1, r.height)) * 100];
    };
    const tol = () => Math.max(TOLERANS, 26 / Math.max(0.5, pn.cizim.getBoundingClientRect().width / 100));
    const canliCiz = () => {
      if (!cizgi) return;
      canli.innerHTML = '';
      izler.querySelector('.ps-canli-g')?.remove();
      const gg = g('ps-canli-g');
      gg.innerHTML = krema ? kremaSeridi(yolD(cizgi)) : `<path d="${yolD(cizgi)}" fill="none" stroke="#4A2412" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
      izler.append(gg);
    };
    const hedefBitti = (i: number) => {
      tamam[i] = true;
      sablon.querySelector(`[data-i="${i}"]`)?.remove();
      izler.querySelectorAll(`[data-hedef="${i}"]`).forEach((x) => x.remove());
      const gg = g('ps-oturdu');
      gg.innerHTML = bitmis(hedefler[i]);
      biten.append(gg);
      const k = hedefler[i].yol[Math.floor(hedefler[i].yol.length / 2)];
      const [x, y] = birimdenEkran(k);
      b.efekt.parilti(x, y, 5, 0.5);
      pn.sahne.dataset.tamam = String(tamam.filter(Boolean).length);
    };
    const birimdenEkran = ([ux, uy]: Nokta): [number, number] => {
      const r = pn.cizim.getBoundingClientRect();
      const k = b.efekt.el.getBoundingClientRect();
      return [r.left - k.left + (ux / 100) * r.width, r.top - k.top + (uy / 100) * r.height];
    };
    const bitirMi = () => {
      if (!tamam.every(Boolean)) return;
      bitir(true);
    };
    let bitti = false;
    const bitir = (hepsi: boolean) => {
      if (bitti) return;
      bitti = true;
      pn.panel.dataset.bitti = '1';
      pn.cizim.removeEventListener('pointerdown', bas);
      pn.cizim.removeEventListener('pointermove', tasi);
      pn.cizim.removeEventListener('pointerup', son);
      pn.cizim.removeEventListener('pointercancel', son);
      pn.tamam.removeEventListener('click', tamamBas);
      if (hepsi) {
        efekt.dogru();
        const [x, y] = birimdenEkran([50, 50]);
        b.efekt.parilti(x, y, 10);
        if (krema) void b.soyle(P.mino.guzel, 'mino', false);
        void bekle(500).then(() => coz(true));
      } else coz(false);
    };
    const bas = (e: PointerEvent) => {
      if (id !== null || bitti) return;
      e.preventDefault();
      id = e.pointerId;
      try {
        pn.cizim.setPointerCapture(id);
      } catch {
        /* yok say */
      }
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
    };
    const son = (e: PointerEvent) => {
      if (e.pointerId !== id || !cizgi) return;
      id = null;
      const c = cizgi;
      cizgi = null;
      izler.querySelector('.ps-canli-g')?.remove();
      const t = tol();
      if (uzunluk(c) < 3) {
        // dokunuş: en yakın boş nokta
        const i = enYakinHedef(hedefler, [c[0]], 'nokta', tamam);
        if (i >= 0 && noktaIsabet(hedefler[i], c[0], t)) {
          ses.tik(noktaSayi);
          efekt.nota(noktaSayi);
          noktaSayi++;
          if (say) void b.soyle(sayiSozu(noktaSayi), 'mino', false);
          hedefBitti(i);
          bitirMi();
        } else ses.degil();
        return;
      }
      const i = enYakinHedef(hedefler, c, 'cizgi', tamam);
      if (i >= 0 && cizgiKabul(hedefler[i], c, t)) {
        kabul[i].push(c);
        const iz = g('ps-iz');
        iz.dataset.hedef = String(i);
        iz.innerHTML = krema ? kremaSeridi(yolD(c)) : `<path d="${yolD(c)}" fill="none" stroke="#4A2412" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
        izler.append(iz);
        if (kapsama(hedefler[i], kabul[i], t) >= KAPSAMA_ESIK) {
          ses.pof();
          hedefBitti(i);
          bitirMi();
        }
        return;
      }
      // karalama: krema kayar gider (Kino yalar), ceza yok
      const iz = g('ps-iz ps-sil');
      iz.innerHTML = krema ? kremaSeridi(yolD(c)) : `<path d="${yolD(c)}" fill="none" stroke="#4A2412" stroke-width="3.2" stroke-linecap="round"/>`;
      izler.append(iz);
      window.setTimeout(() => iz.remove(), TEST_MODU ? 30 : 700);
      ses.kay();
      if (!kinoDedi) {
        kinoDedi = true;
        void b.soyle(P.kino.krema, 'kino', false);
      }
    };
    const tamamBas = () => {
      efekt.secim();
      bitir(false);
    };
    pn.cizim.addEventListener('pointerdown', bas);
    pn.cizim.addEventListener('pointermove', tasi);
    pn.cizim.addEventListener('pointerup', son);
    pn.cizim.addEventListener('pointercancel', son);
    pn.tamam.addEventListener('click', tamamBas);
  });
}

/**
 * Serpinti: kavanoz kurabiyenin üstünde; parmakla sağa sola sürükleyerek sallanır (her yön değişimi taneler döker),
 * telefon sallanınca da döker (DeviceMotion), dokununca da biraz. Tamam ile biter; dönen: tane sayısı.
 */
function serpintiAdimi(b: SuslemeBaglam, pn: ReturnType<typeof panelKur>, sekil: Sekil): Promise<number> {
  const resimUrl = resim(['serpinti-kavanozu', 'kavanoz-serpinti']);
  const kab = h('button.ps-serpinti-kab', { type: 'button', 'aria-label': 'Serpinti', html: resimUrl ? `<img src="${resimUrl}" alt="" draggable="false">` : SERPINTI_KAVANOZU });
  const olcu = h('div.ps-serpinti-olcu', { 'aria-hidden': 'true', 'data-seviye': '0' }, h('i', { 'data-s': '1', html: serpintiIkon(1) }), h('i', { 'data-s': '2', html: serpintiIkon(2) }));
  pn.sahne.append(kab);
  pn.araclar.append(olcu);
  const taneler = g('ps-taneler');
  pn.cizim.append(taneler);
  let tane = 0;
  pn.sahne.dataset.tane = '0';
  void b.soyle(P.mino.salla, 'mino', false);
  const yerler = serpintiYerleri(sekil, EN_COK_SERPINTI);
  const dok = (n: number) => {
    for (let k = 0; k < n && tane < EN_COK_SERPINTI; k++) {
      const y = yerler[tane++];
      const t = g('ps-tane');
      t.innerHTML = serpintiTanesi(y.x, y.y, y.a, y.r);
      taneler.append(t);
      if (!TEST_MODU) t.animate([{ transform: `translate(${(kabX - y.x) * 0.6}px, -40px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320 + k * 60, easing: 'cubic-bezier(.4,0,.6,1)' });
    }
    pn.sahne.dataset.tane = String(tane);
    olcu.dataset.seviye = String(serpintiSeviye(tane));
    ses.serp();
  };
  // kavanozun yatay yeri (birim): parmakla sürüklenir
  let kabX = 50;
  const kabYaz = () => kab.style.setProperty('--x', `${kabX}%`);
  kabYaz();
  return new Promise<number>((coz) => {
    let id: number | null = null;
    let yon = 0;
    let uc = 0;
    let surukledi = false;
    const bas = (e: PointerEvent) => {
      if (id !== null) return;
      e.preventDefault();
      id = e.pointerId;
      surukledi = false;
      try {
        kab.setPointerCapture(id);
      } catch {
        /* yok say */
      }
      uc = e.clientX;
      yon = 0;
      kab.classList.add('ps-tutuldu');
    };
    const tasi = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const r = pn.sahne.getBoundingClientRect();
      kabX = Math.max(18, Math.min(82, ((e.clientX - r.left) / Math.max(1, r.width)) * 100));
      kabYaz();
      const d = e.clientX - uc;
      const yeniYon = Math.sign(d);
      // yön değişimi (en az ~14 px gidip gelme): bir sallama
      if (Math.abs(d) >= 14) {
        if (yeniYon && yon && yeniYon !== yon) {
          dok(3);
          surukledi = true;
          kab.classList.remove('ps-calkala');
          void kab.offsetWidth;
          kab.classList.add('ps-calkala');
        }
        if (yeniYon !== yon) yon = yeniYon;
        uc = e.clientX;
      }
    };
    const son = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      kab.classList.remove('ps-tutuldu');
      if (!surukledi) {
        // dokunuş: kavanoz bir kez sallanır, biraz döker
        salla(kab, 'ps-calkala');
        dok(2);
      }
    };
    let sonSallama = 0;
    const hareket = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      const gA = e.accelerationIncludingGravity;
      let guc = 0;
      if (a && a.x !== null) guc = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      else if (gA && gA.x !== null) guc = Math.abs(Math.hypot(gA.x ?? 0, gA.y ?? 0, gA.z ?? 0) - 9.81);
      const simdi = performance.now();
      if (guc > 9 && simdi - sonSallama > 180) {
        sonSallama = simdi;
        salla(kab, 'ps-calkala');
        dok(3);
      }
    };
    const bitir = () => {
      kab.removeEventListener('pointerdown', bas);
      kab.removeEventListener('pointermove', tasi);
      kab.removeEventListener('pointerup', son);
      kab.removeEventListener('pointercancel', son);
      window.removeEventListener('devicemotion', hareket);
      pn.tamam.removeEventListener('click', tamamBas);
      kab.remove();
      olcu.remove();
      coz(tane);
    };
    const tamamBas = () => {
      efekt.secim();
      bitir();
    };
    kab.addEventListener('pointerdown', bas);
    kab.addEventListener('pointermove', tasi);
    kab.addEventListener('pointerup', son);
    kab.addEventListener('pointercancel', son);
    window.addEventListener('devicemotion', hareket);
    pn.tamam.addEventListener('click', tamamBas);
  });
}

/** Mum: mum kutusuna her dokunuş kapkeğe bir mum (sayılır); Tamam ile biter */
function mumAdimi(b: SuslemeBaglam, pn: ReturnType<typeof panelKur>, ciz: (n: number) => void): Promise<number> {
  const p = pn;
  let n = 0;
  const kutu = h('button.ps-mum-kutusu', { type: 'button', 'aria-label': 'Mum', html: `<svg viewBox="0 0 100 100" aria-hidden="true" overflow="visible"><rect x="14" y="54" width="72" height="34" rx="8" fill="#FF8CC0" stroke="#6b3a1f" stroke-width="3"/><path d="M20 62H80" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>${mumKatmani(4, 56)}</svg>` });
  p.araclar.append(kutu);
  void b.soyle(P.mino.mum, 'mino', false);
  p.sahne.dataset.mum = '0';
  return new Promise<number>((coz) => {
    const bas = () => {
      salla(kutu, 'ps-bas');
      if (n >= EN_COK_MUM) {
        ses.degil();
        return;
      }
      n++;
      ses.tik(n);
      void b.soyle(sayiSozu(n), 'mino', false);
      p.sahne.dataset.mum = String(n);
      ciz(n);
    };
    const tamamBas = () => {
      efekt.secim();
      kutu.removeEventListener('click', bas);
      p.tamam.removeEventListener('click', tamamBas);
      kutu.remove();
      coz(n);
    };
    kutu.addEventListener('click', bas);
    p.tamam.addEventListener('click', tamamBas);
  });
}

/** Serpinti kavanozu (yedek kod çizimi): delikli kapak, içinde renkli şeker çubukları */
const SERPINTI_KAVANOZU = `<svg viewBox="0 0 80 100" aria-hidden="true" overflow="visible"><path d="M14 34C14 28 18 24 24 24H56C62 24 66 28 66 34V88C66 94 61 98 55 98H25C19 98 14 94 14 88Z" fill="#E8F6FF" fill-opacity=".55" stroke="#6b3a1f" stroke-width="2.6"/>${Array.from({ length: 14 }, (_, i) => serpintiTanesi(22 + ((i * 37) % 36), 44 + ((i * 23) % 46), (i * 53) % 180, i)).join('')}<path d="M56 30C62 32 63 38 63 44V84" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><rect x="12" y="8" width="56" height="18" rx="6" fill="#FFD84A" stroke="#6b3a1f" stroke-width="2.6"/><g fill="#6b3a1f" opacity=".55"><circle cx="26" cy="15" r="2"/><circle cx="36" cy="18" r="2"/><circle cx="46" cy="15" r="2"/><circle cx="56" cy="18" r="2"/></g></svg>`;
