/**
 * ÇALKALA VE DOLDUR (içecek tezgâhı, önden: sürahi, kapak, bardak, limon presi) · RESTORAN.md §8 M12, §1d.
 *
 * Rafta yoğurt, su, tuz, limon, (5-6) şeker ve buz: ne konacağı çocuğun seçimi; içecek sürahiye konandan çıkar
 * (yoğurt → ayran, limon → limonata, ikisi → "limonlu ayran").
 *  - Yoğurt "plop" diye sürahiye düşer; su şırıl şırıl akar; tuz ve şeker serpilir.
 *  - Limon: tezgâhtaki limonun üstünden tek kaydırma ikiye keser; yarım prese (sürahinin ağzında) gider; presin
 *    üstünde parmakla daire çizdikçe limon suyu sürahiye damlar, çekirdekler zıplar (ilki Kino'nun burnuna).
 *  - Kapak: dokununca sürahiye oturur (tık). Sürahiyi tutup sağa sola hızlı sallayınca çalkalanır: köpük yükselir,
 *    sürahi titrer. KAPAKSIZ çalkalarsan ayran tavana fışkırır, Mino'nun bıyığı bembeyaz olur (komik).
 *  - Doldur: sürahiyi bardağın üstüne getirip tut: ağzından akan içecek bardağı doldurur (ne kadar tutarsan o kadar).
 *    3-4: dolum çizgisinde kendiliğinden durur. 5-6: kendisi durdurur; taşarsa tezgâha yayılır, Lokum alttan çıkıp yalar.
 *  - Buz: her dokunuş bardağa bir küp ("tink").
 * Parça döndürme yok: sürahi eğilmez, ağzından düz bir akış iner.
 * Ödül: köpük bardağın üstünde taçlanır, köpükten minik kalp (köpüksüzse buzlar parlar), bardak tepsiye kayar.
 * Çıktı: `{ tur: 'icecek', yemek: 'ayran' | 'limonata', servis: true, ozellik: { malzemeler, tuz, eksi, tatli, dolum } }`.
 */
import { h } from '../../../../src/ui/dom';
import metin from '../../../../content/restoran/mini-icecek.json';
import { urunId, type MiniBaglam, type MiniGirdi, type MiniOturum, type MiniOyun, type Urun } from '../arayuz';
import { ezil, hopla, kipirda, leke, parilti, sac, ucur } from '../dogra/efekt';
import { butunResim } from '../dogra/gorsel';
import { surukle } from '../dogra/surukle';
import { aciFarki, rastgele } from '../yika/mantik';
import { bakanKur, bekle, hapsu, hisir, kikir, nota, odulEzgi, olayKaydi, resim, sureMs } from '../yika/ortak';
import { BARDAK, bosBardak, bosIcerik, calkala, dok, fiskir, icecekOzeti, icecekTuru, LIMON, seviye, type Bardak, type Icecek, type Icerik } from './mantik';
import './icecek.css';

const M = metin.mino;
type Raf = 'yogurt' | 'su' | 'tuz' | 'limon' | 'seker' | 'buz';
const RAF_AD: Record<Raf, string> = { yogurt: 'Yoğurt', su: 'Su', tuz: 'Tuz', limon: 'Limon', seker: 'Şeker', buz: 'Buz' };
/** içerik rengi (yer tutucu; Gemini 'ayran-limonata' gelince sürahi / bardak resimleri) */
const RENK: Record<Icecek, string> = { ayran: '#fbfaf3', limonata: '#f7e47a', karisik: '#f8f1c4', su: '#cfeefa', bos: 'transparent' };

export const oyun: MiniOyun = {
  ad: 'icecek',
  istasyon: 'icecek',
  simge: () => {
    const u = resim('alet/surahi');
    return u ? h('img.rs-ic-simge', { src: u, alt: '', draggable: 'false' }) : h('span.rs-ic-simge-yt');
  },
  baslat(b, g) {
    return icecekBaslat(b, g);
  },
};

function icecekBaslat(b: MiniBaglam, g: MiniGirdi): MiniOturum {
  const yas = g.yas;
  const r = rastgele(g.test ? 5 : Date.now());
  const raftakiler: Raf[] = yas === 'kucuk' ? ['yogurt', 'su', 'tuz', 'limon', 'buz'] : ['yogurt', 'su', 'tuz', 'limon', 'seker', 'buz'];

  const kok = h('div.rs-icecek', { 'data-yas': yas });
  const { olaylar, olay } = olayKaydi(kok);
  const raf = h('div.rs-ic-raf');
  const tezgah = h('i.rs-ic-tezgah');
  // sürahi: gövde (cam), içindeki sıvı, köpük, ağız, kulp, kapak yuvası; presi ağzında taşır
  const sivi = h('i.rs-ic-sivi');
  const kopukEl = h('i.rs-ic-kopuk');
  const surahiCam = h('i.rs-ic-cam');
  const pres = h('div.rs-ic-pres', {}, h('i.rs-ic-pres-govde'), h('div.rs-ic-pres-limon'));
  const presLimon = pres.querySelector<HTMLElement>('.rs-ic-pres-limon')!;
  const surahi = h('div.rs-ic-surahi', {}, h('i.rs-ic-kulp'), surahiCam, h('div.rs-ic-sivi-kap', {}, sivi, kopukEl), h('i.rs-ic-agiz'), pres);
  const kapak = h('button.rs-ic-kapak', { type: 'button', 'aria-label': 'Kapak' }, h('i'));
  const bSivi = h('i.rs-ic-b-sivi');
  const bKopuk = h('i.rs-ic-b-kopuk');
  const bBuz = h('div.rs-ic-b-buz');
  const bardakEl = h('div.rs-ic-bardak', {}, h('div.rs-ic-b-kap', {}, bSivi, bBuz, bKopuk), h('i.rs-ic-b-cam'), h('i.rs-ic-b-cizgi'));
  const akis = h('i.rs-ic-akis');
  const birikinti = h('i.rs-ic-birikinti');
  const kesmeYeri = h('div.rs-ic-kesme');
  const efektKat = h('div.rs-ic-efekt');
  kok.append(tezgah, birikinti, kesmeYeri, bardakEl, kapak, akis, surahi, raf, efektKat);
  b.kok.append(kok);
  const kino = bakanKur(kok, 'kino');
  const lokum = bakanKur(kok, 'lokum');

  // ------------------------------------------------------------ durum
  const s: Icerik = bosIcerik();
  const sd = { karisim: 0, kopuk: 0 };
  const bardak: Bardak = bosBardak();
  let kapakli = false;
  let limonBekleyen: 'butun' | 'yarim' | null = null;
  let yarimSay = 0;
  let presteki = false;
  let presOran = 0;
  let cekirdekKalan: number = LIMON.cekirdek;
  let kinoGeldi = false;
  let fiskirdi = false;
  let lokumGeldi = false;
  let odulde = false;
  let kapandi = false;

  // ------------------------------------------------------------ raf
  const rafSimgesi = (ad: Raf): HTMLElement => {
    if (ad === 'limon') {
      const bb = butunResim('limon');
      if (bb) return h('span.rs-ic-raf-simge', {}, h('img', { src: bb.url, alt: '', draggable: 'false' }));
    }
    const u = resim(`alet/${ad === 'su' ? 'su-sisesi' : ad === 'buz' ? 'buz-kovasi' : ad === 'yogurt' ? 'yogurt-kabi' : ad === 'seker' ? 'seker-kavanozu' : 'tuzluk'}`);
    return h('span.rs-ic-raf-simge', { 'data-ad': ad }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : h('i'));
  };
  for (const ad of raftakiler) {
    const btn = h('button.rs-ic-raf-oge', { type: 'button', 'aria-label': RAF_AD[ad], 'data-ad': ad }, rafSimgesi(ad));
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rafaDokun(ad, btn);
    });
    raf.append(btn);
  }

  // ------------------------------------------------------------ yerleşim (önden; dikeyde ayrı çizim, dönme yok)
  let W = 800;
  let H = 400;
  let tezgahUst = 260;
  const J = { cx: 300, alt: 300, w: 110, h: 170 };
  const B = { cx: 520, alt: 300, w: 64, h: 104 };
  const KP = { x: 160, y: 300 };
  const KY = { x: 420, y: 300 };
  let jx = 0;
  let jy = 0;
  function yerlestir() {
    W = kok.clientWidth || b.kok.clientWidth;
    H = kok.clientHeight || b.kok.clientHeight;
    if (!W || !H) return;
    const yatay = W >= H;
    kok.dataset.yon = yatay ? 'yatay' : 'dikey';
    const n = raf.childElementCount || 1;
    const solBos = 82;
    const rafEn = W - solBos - 10;
    let sz = Math.max(64, Math.min(76, yatay ? H * 0.19 : 72, rafEn / n - 8));
    const sigan = Math.max(1, Math.floor(rafEn / (sz + 8)));
    const satir = Math.ceil(n / sigan);
    if (satir > 1) sz = Math.max(64, Math.min(sz, rafEn / Math.ceil(n / satir) - 8));
    raf.style.cssText = `left:${solBos}px;top:8px;width:${rafEn}px;--s:${sz}px`;
    const rafAlt = 8 + satir * (sz + 8) + 4;
    if (yatay) {
      tezgahUst = Math.round(H * 0.7);
      J.h = Math.min(tezgahUst + 14 - rafAlt - 26, 220);
      J.w = J.h * 0.66;
      J.cx = W * 0.38;
      J.alt = tezgahUst + 14;
      B.h = J.h * 0.66;
      B.w = B.h * 0.64;
      B.cx = W * 0.66;
      B.alt = tezgahUst + 16;
      KP.x = Math.max(170, W * 0.22);
      KP.y = tezgahUst + 26;
      KY.x = W * 0.52;
      KY.y = tezgahUst + 34;
    } else {
      tezgahUst = Math.round(H * 0.6);
      J.h = Math.min(tezgahUst + 14 - rafAlt - 40, 250);
      J.w = J.h * 0.66;
      J.cx = W * 0.34;
      J.alt = tezgahUst + 14;
      B.h = Math.min(J.h * 0.68, 150);
      B.w = B.h * 0.64;
      B.cx = W * 0.76;
      B.alt = tezgahUst + 16;
      KP.x = W * 0.3;
      KP.y = tezgahUst + 90;
      KY.x = W * 0.62;
      KY.y = tezgahUst + 96;
    }
    tezgah.style.top = `${tezgahUst}px`;
    surahi.style.width = `${J.w}px`;
    surahi.style.height = `${J.h}px`;
    surahi.style.setProperty('--jw', `${J.w}px`);
    if (!jTutuluyor) jugKoy(J.cx, J.alt - J.h / 2);
    bardakEl.style.cssText = `left:${B.cx - B.w / 2}px;top:${B.alt - B.h}px;width:${B.w}px;height:${B.h}px`;
    birikinti.style.cssText = `left:${B.cx - B.w * 1.1}px;top:${B.alt - 8}px;width:${B.w * 2.2}px`;
    if (!kapakli) kapak.style.transform = `translate(${KP.x - 36}px,${KP.y - 20}px)`;
    kesmeYeri.style.cssText = `left:${KY.x - 56}px;top:${KY.y - 30}px`;
    akis.style.display = 'none';
    sivilariCiz();
  }
  function jugKoy(x: number, y: number) {
    jx = x;
    jy = y;
    surahi.style.transform = `translate(${x - J.w / 2}px,${y - J.h / 2}px)`;
    if (kapakli) kapak.style.transform = `translate(${x - J.w * 0.06 - 36}px,${y - J.h / 2 - 22}px)`;
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => yerlestir()) : null;
  ro?.observe(kok);

  function sivilariCiz() {
    const tur = icecekTuru(s);
    const sv = Math.min(1, seviye(s));
    sivi.style.height = `${sv * 100}%`;
    sivi.style.background = sd.karisim < 0.4 && s.yogurt > 0 && s.su > 0 ? `linear-gradient(180deg, ${RENK.su} 0 ${60 - sd.karisim * 100}%, ${RENK.ayran} ${70 - sd.karisim * 80}%)` : RENK[tur];
    kopukEl.style.bottom = `${sv * 100}%`;
    kopukEl.style.height = `${sd.kopuk * 16}%`;
    kopukEl.style.opacity = sv > 0.02 && sd.kopuk > 0.02 ? '1' : '0';
    surahi.dataset.tur = tur;
    const bt = icecekTuru(bardak.icerik);
    bSivi.style.height = `${Math.min(1, bardak.dolum) * 100}%`;
    bSivi.style.background = RENK[bt];
    bKopuk.style.bottom = `${Math.min(1, bardak.dolum) * 100}%`;
    bKopuk.style.height = `${bardak.kopuk * bardak.dolum * 18}%`;
    bKopuk.style.opacity = bardak.dolum > 0.05 && bardak.kopuk > 0.05 ? '1' : '0';
    bBuz.style.bottom = `${Math.max(4, Math.min(1, bardak.dolum) * 100 - 16)}%`;
    bardakEl.dataset.tur = bt;
    birikinti.style.opacity = String(Math.min(1, bardak.tasan * 3));
    birikinti.style.scale = `${0.4 + Math.min(1, bardak.tasan * 2) * 0.6} 1`;
  }

  // ------------------------------------------------------------ rafa dokun
  const agizNokta = () => ({ x: jx - J.w * 0.06, y: jy - J.h / 2 + 4 });
  function rafaDokun(ad: Raf, btn: HTMLElement) {
    if (odulde) return;
    ezil(btn, 1.2);
    b.dokunsal(8);
    void b.mino.soyle(M.ad[ad]);
    const br = btn.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const bx = br.left - kr.left + br.width / 2;
    const by = br.top - kr.top + br.height / 2;
    const ag = agizNokta();
    if (ad === 'buz') return buzAt(bx, by);
    if (ad === 'limon') return limonKoy(bx, by);
    if (presteki) presiKaldir();
    if (kapakli && ad !== 'tuz' && ad !== 'seker') kapakAc();
    const dusen = h('i.rs-ic-dusen', { 'data-ad': ad });
    dusen.style.transform = `translate(${bx}px,${by}px)`;
    efektKat.append(dusen);
    void ucur(dusen, ag.x - bx, ag.y - by - 6, 360, -50).then(() => {
      dusen.remove();
      if (kapandi) return;
      if (ad === 'yogurt') {
        s.yogurt++;
        b.ses.cal('pof', { perde: 0.8, guc: 0.8 });
        nota(55, 0, 0.1, 'sine', 0.12, 5);
        sac(efektKat, ag.x, ag.y + 10, 'damla', '#fbfaf3', 4, { yon: -Math.PI / 2, yay: 2 });
        sd.karisim = Math.max(0, sd.karisim - 0.25);
      } else if (ad === 'su') {
        s.su++;
        akisGoster(ag.x, ag.y - 30, ag.y + J.h * 0.6, '#bfe8f7', 520);
        b.ses.cal('siril', { perde: 1.1, guc: 0.6 });
        sd.karisim = Math.max(0, sd.karisim - 0.15);
      } else if (ad === 'tuz') {
        s.tuz++;
        b.ses.cal('tik', { perde: 1.7 });
        sac(efektKat, ag.x, ag.y - 6, 'un', '#ffffff', 6, { yon: Math.PI / 2, yay: 0.6, guc: 0.4, boy: 4 });
      } else if (ad === 'seker') {
        s.seker++;
        b.ses.cal('tik', { perde: 2.1 });
        sac(efektKat, ag.x, ag.y - 6, 'un', '#fff8e8', 6, { yon: Math.PI / 2, yay: 0.6, guc: 0.4, boy: 5 });
      }
      // sürahi taşarsa: tezgâha biraz döküldü (sınır 1)
      if (seviye(s) > 1.05) {
        const fazla = (seviye(s) - 1) / Math.max(0.01, seviye(s));
        for (const k of ['yogurt', 'su', 'limon', 'seker', 'tuz'] as const) s[k] *= 1 - fazla;
        sac(efektKat, ag.x, ag.y, 'damla', RENK[icecekTuru(s)] === 'transparent' ? '#cfeefa' : RENK[icecekTuru(s)], 6, { yay: 2.4, guc: 0.9 });
        olay('surahi-tasti');
      }
      ezil(surahi, 0.6);
      sivilariCiz();
      olay(ad);
      ipucuGuncelle();
    });
  }

  function akisGoster(x: number, y1: number, y2: number, renk: string, ms: number) {
    akis.style.cssText = `display:block;left:${x - 7}px;top:${y1}px;height:${Math.max(0, y2 - y1)}px;background:${renk}`;
    if (ms > 0) window.setTimeout(() => !jTutuluyor && (akis.style.display = 'none'), sureMs(ms));
  }

  function buzAt(bx: number, by: number) {
    if (bardak.buz >= 4) {
      kipirda(bardakEl, 4, 260);
      b.ses.cal('tok', { perde: 1.6 });
      return;
    }
    const kup = h('i.rs-ic-buz-kup');
    kup.style.transform = `translate(${bx}px,${by}px)`;
    efektKat.append(kup);
    void ucur(kup, B.cx - bx, B.alt - B.h * 0.6 - by, 380, -60).then(() => {
      kup.remove();
      if (kapandi) return;
      bardak.buz++;
      const k = h('i.rs-ic-buz-kup');
      k.style.left = `${12 + ((bardak.buz * 29) % 50)}%`;
      bBuz.append(k);
      nota(96 + bardak.buz, 0, 0.12, 'sine', 0.1);
      b.ses.cal('tik', { perde: 2.4, guc: 0.6 });
      ezil(bardakEl, 0.6);
      sivilariCiz();
      olay('buz');
    });
  }

  // ------------------------------------------------------------ kapak
  function kapakTak() {
    if (kapakli || presteki) {
      if (presteki) presiKaldir();
    }
    kapakli = true;
    kapak.classList.add('rs-takili');
    jugKoy(jx, jy);
    b.ses.cal('tik', { perde: 1, guc: 0.8 });
    ezil(surahi, 0.7);
    olay('kapak');
    ipucuGuncelle();
  }
  function kapakAc() {
    kapakli = false;
    kapak.classList.remove('rs-takili');
    kapak.style.transform = `translate(${KP.x - 36}px,${KP.y - 20}px)`;
    b.ses.cal('tik', { perde: 1.3, guc: 0.6 });
    olay('kapak-ac');
  }
  kapak.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (odulde) return;
    ezil(kapak, 1.2);
    if (kapakli) kapakAc();
    else kapakTak();
  });

  // ------------------------------------------------------------ limon: kes, prese koy, sık
  const limonEl = h('div.rs-ic-limon');
  kesmeYeri.append(limonEl);
  function limonResim(yarim: boolean): HTMLElement {
    const u = yarim ? resim('yiyecek/limon-yarim') ?? resim('alet/limon-yarim') : butunResim('limon')?.url ?? null;
    return h(yarim ? 'i.rs-ic-limon-yarim' : 'i.rs-ic-limon-butun', {}, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
  }
  function limonKoy(bx: number, by: number) {
    if (limonBekleyen) {
      kipirda(limonEl, 4, 260);
      return;
    }
    limonBekleyen = 'butun';
    limonEl.replaceChildren(limonResim(false));
    limonEl.dataset.durum = 'butun';
    const kr = kesmeYeri.getBoundingClientRect();
    const k = kok.getBoundingClientRect();
    try {
      limonEl.animate([{ translate: `${bx - (kr.left - k.left + kr.width / 2)}px ${by - (kr.top - k.top + kr.height / 2)}px`, scale: '0.5' }, { translate: '0 0', scale: '1' }], { duration: sureMs(340), easing: 'ease-in' });
    } catch {
      /* yok say */
    }
    window.setTimeout(() => !kapandi && b.ses.cal('tok', { perde: 1.1 }), sureMs(320));
    olay('limon');
    ipucuGuncelle();
  }
  // limon kesme: üstünden tek kaydırma (3-4'te dokunuş da keser)
  let kesIz: { id: number; x: number; y: number; yol: number } | null = null;
  kok.addEventListener('pointerdown', (e) => {
    if (limonBekleyen !== 'butun' || odulde) return;
    const k = kok.getBoundingClientRect();
    kesIz = { id: e.pointerId, x: e.clientX - k.left, y: e.clientY - k.top, yol: 0 };
  }, { capture: true });
  kok.addEventListener('pointermove', (e) => {
    if (!kesIz || e.pointerId !== kesIz.id || limonBekleyen !== 'butun') return;
    const k = kok.getBoundingClientRect();
    const x = e.clientX - k.left;
    const y = e.clientY - k.top;
    kesIz.yol += Math.hypot(x - kesIz.x, y - kesIz.y);
    kesIz.x = x;
    kesIz.y = y;
    const lr = limonEl.getBoundingClientRect();
    const ustunde = Math.abs(x - (lr.left - k.left + lr.width / 2)) < lr.width * 0.3 && Math.abs(y - (lr.top - k.top + lr.height / 2)) < lr.height * 0.8;
    if (ustunde && kesIz.yol > 36) {
      kesIz = null;
      limonKes();
    }
  }, { capture: true });
  kok.addEventListener('pointerup', () => (kesIz = null), { capture: true });
  surukle(kesmeYeri, kok, {
    basla() {
      if (!limonBekleyen || odulde) return false;
      ezil(limonEl, 0.5);
      return true;
    },
    birak() {
      if (limonBekleyen === 'yarim') presiTak();
    },
    dokun() {
      if (limonBekleyen === 'butun') {
        if (yas === 'kucuk') limonKes();
        else kipirda(limonEl, 4, 260);
      } else if (limonBekleyen === 'yarim') presiTak();
    },
  });
  function limonKes() {
    limonBekleyen = 'yarim';
    yarimSay = 2;
    limonEl.dataset.durum = 'yarim';
    limonEl.replaceChildren(limonResim(true), limonResim(true));
    b.ses.cal('slap', { perde: 1.4, guc: 0.8 });
    b.dokunsal(14);
    const kr = kesmeYeri.getBoundingClientRect();
    const k = kok.getBoundingClientRect();
    sac(efektKat, kr.left - k.left + kr.width / 2, kr.top - k.top + kr.height / 2, 'damla', '#f7e47a', 6, { yay: 6.3, guc: 0.8 });
    olay('limon-kes');
    ipucuGuncelle();
  }
  function presiTak() {
    if (presteki || !yarimSay) return;
    if (kapakli) kapakAc();
    yarimSay--;
    presteki = true;
    presOran = 0;
    pres.classList.add('rs-gorunur');
    presLimon.replaceChildren(limonResim(true));
    presLimon.style.scale = '1 1';
    const ilk = limonEl.lastElementChild;
    ilk?.remove();
    if (!yarimSay) limonBekleyen = null;
    b.ses.cal('tok', { perde: 1.3 });
    ezil(pres, 1);
    olay('pres');
    ipucuGuncelle();
  }
  function presiKaldir() {
    presteki = false;
    pres.classList.remove('rs-gorunur');
    if (presOran > 0.02) sikilmisBirak();
  }
  function sikilmisBirak() {
    const u = resim('yiyecek/limon-sikilmis');
    const el = h('i.rs-ic-sikilmis', {}, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
    el.style.left = `${KY.x - 70 + r() * 40}px`;
    el.style.top = `${KY.y + 14 + r() * 8}px`;
    kok.insertBefore(el, bardakEl);
  }
  // sıkma: presin üstünde parmakla daire
  let presAci: number | null = null;
  let presToplam = 0;
  surukle(pres, kok, {
    basla(x, y) {
      if (!presteki || odulde) return false;
      presAci = Math.atan2(y - (jy - J.h / 2), x - jx);
      ezil(presLimon, 0.8);
      b.ses.cal('vicik', { perde: 1.3, guc: 0.5 });
      return true;
    },
    hareket(x, y) {
      if (!presteki) return;
      const cx = jx - J.w * 0.04;
      const cy = jy - J.h / 2 - J.w * 0.12;
      const a = Math.atan2(y - cy, x - cx);
      if (presAci !== null) {
        const d = Math.abs(aciFarki(presAci, a));
        if (d < 1.2) {
          presToplam += d;
          presOran = Math.min(1, presOran + d / LIMON.tur);
          s.limon += (d / LIMON.tur) * LIMON.su;
          presLimon.style.scale = `${1 + presOran * 0.1} ${1 - presOran * 0.45}`;
          if (presToplam > 0.9) {
            presToplam = 0;
            b.ses.cal('vicik', { perde: 1 + presOran * 0.5, guc: 0.6 });
            b.dokunsal(6);
            akisGoster(cx, cy + 8, jy + J.h * 0.3, '#f7e47a', 260);
            if (cekirdekKalan > 0 && r() < 0.45) cekirdekZipla(cx, cy);
            sivilariCiz();
          }
          if (presOran >= 1) {
            olay('sikildi');
            presiKaldir();
            ipucuGuncelle();
          }
        }
      }
      presAci = a;
    },
    birak() {
      presAci = null;
    },
  });
  function cekirdekZipla(x: number, y: number) {
    cekirdekKalan--;
    const c = h('i.rs-ic-cekirdek');
    c.style.transform = `translate(${x}px,${y}px)`;
    efektKat.append(c);
    b.ses.cal('pit', { perde: 1.6 });
    if (!kinoGeldi) {
      kinoGeldi = true;
      void kinoyaCekirdek(c, x, y);
      return;
    }
    const hx = KY.x - 60 + r() * 120;
    void ucur(c, hx - x, tezgahUst + 30 - y, 520, -70).then(() => {
      c.getAnimations().forEach((a) => a.cancel());
      c.style.transform = `translate(${hx}px,${tezgahUst + 30}px)`;
    });
  }
  async function kinoyaCekirdek(c: HTMLElement, x: number, y: number) {
    olay('cekirdek-kino');
    await kino.gel('sag', Math.max(H * 0.36, y), Math.min(H * 0.42, 190));
    if (kapandi) return;
    kino.yuz('acik', 'gulumse');
    const n = kino.nokta('burun');
    await ucur(c, n.x - x, n.y - y, 520, -80);
    if (kapandi) return;
    c.getAnimations().forEach((a) => a.cancel());
    c.style.transform = `translate(${n.x}px,${n.y}px)`;
    kino.yuz('saskin', 'o');
    void b.mino.soyle(M.cekirdek);
    await bekle(900);
    if (kapandi) return;
    hapsu();
    kino.yuz('kapali', 'genis');
    void ucur(c, 40, -120, 500, -30).then(() => c.remove());
    await bekle(700);
    if (kapandi) return;
    kino.yuz('mutlu', 'kahkaha');
    kikir();
    await bekle(900);
    if (!kapandi) await kino.git();
  }

  // ------------------------------------------------------------ sürahi: çalkala, fışkır, doldur
  let jTutuluyor = false;
  let tut = { dx: 0, dy: 0 };
  let sonYon = 0;
  let sallaYol = 0;
  let sonDok = 0;
  let dokZaman = 0;
  let dokusSes: { guc(g: number): void; dur(): void } | null = null;
  let cizgiDendi = false;
  surukle(surahi, kok, {
    basla(x, y) {
      if (odulde) return false;
      // presteki limonun üstündeyse sıkma (pres kendi dinler)
      if (presteki && y < jy - J.h / 2 + J.w * 0.1) return false;
      jTutuluyor = true;
      tut = { dx: x - jx, dy: y - jy };
      surahi.classList.add('rs-tutuldu');
      b.dokunsal(6);
      sallaYol = 0;
      sonYon = 0;
      return true;
    },
    hareket(x, y, hz) {
      jugKoy(x - tut.dx, Math.min(J.alt - J.h / 2, y - tut.dy));
      // çalkala: hızlı sağ-sol dönüşleri
      const yon = Math.sign(hz.vx);
      sallaYol += Math.abs(hz.vx) * 16;
      if (yon && sonYon && yon !== sonYon && Math.abs(hz.vx) > 0.5 && sallaYol > 30) {
        sallaYol = 0;
        calkalandi();
      }
      if (yon) sonYon = yon;
      // doldur: ağız bardağın üstündeyse
      const ag = agizNokta();
      const ustunde = Math.abs(ag.x - B.cx) < B.w * 0.55 && ag.y < B.alt - B.h + 6 && ag.y > B.alt - B.h - J.h * 1.2 && hz.v < 0.9;
      if (ustunde && seviye(s) > 0.001) dokmeBasla();
      else dokmeBitir();
    },
    birak() {
      jTutuluyor = false;
      surahi.classList.remove('rs-tutuldu');
      dokmeBitir();
      jugKoy(J.cx, J.alt - J.h / 2);
      ipucuGuncelle();
    },
    dokun() {
      jTutuluyor = false;
      surahi.classList.remove('rs-tutuldu');
      ezil(surahi, 0.8);
      b.ses.cal('tok', { perde: 1.3, guc: 0.5 });
    },
  });

  function calkalandi() {
    if (seviye(s) <= 0.02) {
      b.ses.cal('tok', { perde: 1.5, guc: 0.4 });
      return;
    }
    surahi.classList.remove('rs-titre');
    void surahi.offsetWidth;
    surahi.classList.add('rs-titre');
    if (!kapakli && seviye(s) > 0.12) {
      if (!fiskirdi) return void fiskirma();
      // ilk fışkırmadan sonra kapaksız çalkalama: küçük sıçrama, biraz döker
      for (const k of ['yogurt', 'su', 'limon', 'seker', 'tuz'] as const) s[k] *= 0.94;
      const ag = agizNokta();
      sac(efektKat, ag.x, ag.y, 'damla', RENK[icecekTuru(s)] === 'transparent' ? '#cfeefa' : RENK[icecekTuru(s)], 4, { yon: -Math.PI / 2, yay: 1.2, guc: 1 });
      b.ses.cal('siril', { perde: 0.8, guc: 0.5 });
      sivilariCiz();
      olay('sicrama');
      return;
    }
    calkala(sd, s);
    b.ses.cal('siril', { perde: 0.7 + r() * 0.2, guc: 0.5 });
    b.ses.cal('kopuk', { perde: 0.9 + sd.kopuk * 0.4, guc: 0.5 });
    b.dokunsal(10);
    sivilariCiz();
    olay('calkala');
    if (sd.kopuk >= 0.5 && !kopukDendi && s.yogurt > 0) {
      kopukDendi = true;
      void b.mino.soyle(M.kopuk);
    }
  }
  let kopukDendi = false;

  async function fiskirma() {
    const ag = agizNokta();
    const tur = icecekTuru(s);
    const renk = tur === 'su' ? '#bfe8f7' : tur === 'limonata' ? '#f7e47a' : '#fbfaf3';
    fiskir(s);
    sivilariCiz();
    olay('fiskir');
    hisir(0, 0.5, 900, 5000, 0.2);
    b.ses.cal('pof', { perde: 0.7 });
    b.dokunsal(20);
    // tavana fışkıran jet
    const jet = h('i.rs-ic-jet');
    jet.style.cssText = `left:${ag.x - 10}px;top:0;height:${Math.max(10, ag.y)}px;background:${renk}`;
    efektKat.append(jet);
    try {
      jet.animate([{ scale: '1 0', opacity: 1 }, { scale: '1 1', opacity: 1, offset: 0.3 }, { scale: '0.6 1', opacity: 0 }], { duration: sureMs(700), easing: 'ease-out', fill: 'forwards' }).finished.then(() => jet.remove(), () => jet.remove());
    } catch {
      jet.remove();
    }
    // tavandan damlalar
    window.setTimeout(() => !kapandi && sac(efektKat, ag.x, 6, 'damla', renk, 9, { yon: Math.PI / 2, yay: 1.6, guc: 1.1 }), sureMs(240));
    if (fiskirdi) return;
    fiskirdi = true;
    void b.mino.soyle(M.fiskir);
    // Mino'nun bıyığı bembeyaz olur
    const mr = b.mino.el.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const mx = mr.left - kr.left + mr.width * 0.5;
    const my = mr.top - kr.top + mr.height * 0.44;
    const damla = h('i.rs-ic-damla-buyuk');
    damla.style.background = renk;
    damla.style.transform = `translate(${ag.x}px,${10}px)`;
    efektKat.append(damla);
    await ucur(damla, mx - ag.x, my - 10, 760, -10);
    damla.remove();
    if (kapandi) return;
    const biyik = h('i.rs-ic-biyik');
    biyik.style.cssText = `width:${Math.max(44, mr.width * 0.58)}px;transform:translate(${mx - Math.max(44, mr.width * 0.58) / 2}px,${my}px);background:${renk}`;
    efektKat.append(biyik);
    ezil(biyik, 1.6);
    void b.mino.tepki('sasir', 900);
    nota(70, 0.05, 0.2, 'triangle', 0.08, -5);
    await bekle(900);
    if (kapandi) return;
    void b.mino.tepki('sevin', 1400);
    kikir();
    void b.mino.soyle(M.biyik);
    await bekle(3200);
    biyik.classList.add('rs-silin');
    await bekle(600);
    biyik.remove();
  }

  function dokmeBasla() {
    if (dokZaman) return;
    sonDok = performance.now();
    dokusSes = b.ses.dongu('siril');
    dokusSes.guc(0.5);
    olay('dok');
    const adim = () => {
      const t = performance.now();
      const dt = Math.min(0.1, (t - sonDok) / 1000);
      sonDok = t;
      const ag = agizNokta();
      const { durdu, tasti } = dok(s, sd, bardak, dt, yas);
      const ustSiv = B.alt - B.h * Math.min(1, bardak.dolum);
      if (durdu) {
        akis.style.display = 'none';
        if (yas === 'kucuk' && bardak.dolum >= BARDAK.cizgi - 0.01 && !cizgiDendi) {
          cizgiDendi = true;
          parilti(efektKat, B.cx, B.alt - B.h * BARDAK.cizgi, 5, B.w * 0.6);
          b.ses.cal('ting');
          void b.mino.soyle(M.cizgi);
          olay('cizgi');
        }
        dokusSes?.guc(0);
      } else {
        akisGoster(ag.x, ag.y, ustSiv, RENK[icecekTuru(s)] === 'transparent' ? '#bfe8f7' : RENK[icecekTuru(s)], 0);
        dokusSes?.guc(0.55);
      }
      if (tasti > 0) {
        if (Math.random() < 0.4) sac(efektKat, B.cx + (Math.random() < 0.5 ? -1 : 1) * B.w * 0.5, B.alt - B.h, 'damla', RENK[icecekTuru(bardak.icerik)], 1, { yon: Math.PI / 2, yay: 0.5 });
        if (!lokumGeldi && bardak.tasan > 0.08) void lokumYalar();
      }
      sivilariCiz();
      if (!hopladi && bardak.dolum >= 0.6) {
        hopladi = true;
        b.tepsi.hopla();
      }
      dokZaman = requestAnimationFrame(adim);
    };
    dokZaman = requestAnimationFrame(adim);
  }
  let hopladi = false;
  function dokmeBitir() {
    if (!dokZaman) return;
    cancelAnimationFrame(dokZaman);
    dokZaman = 0;
    akis.style.display = 'none';
    dokusSes?.dur();
    dokusSes = null;
    ipucuGuncelle();
  }

  async function lokumYalar() {
    lokumGeldi = true;
    olay('tasti');
    void b.mino.soyle(M.tasti);
    leke(kok, B.cx, B.alt, '#f6f1dc', B.w * 1.6);
    await lokum.gel('alt', Math.min(W - 150, B.cx + B.w * 0.2), Math.min(H * 0.36, 170));
    if (kapandi) return;
    lokum.yuz('kapali', 'o');
    b.ses.cal('vicik', { perde: 1.6, guc: 0.4 });
    await bekle(260);
    b.ses.cal('vicik', { perde: 1.8, guc: 0.4 });
    await bekle(400);
    if (kapandi) return;
    lokum.yuz('mutlu', 'kahkaha');
    kikir();
    hopla(lokum.el.firstElementChild as HTMLElement, 10, 320);
    await bekle(1500);
    if (!kapandi) await lokum.git();
  }

  // ------------------------------------------------------------ ipucu
  function ipucuGuncelle() {
    if (odulde) return b.ipucu.hedef(null);
    if (presteki) return b.ipucu.hedef({ el: () => pres, soz: M.ipucu.pres, hareket: 'daire' });
    if (limonBekleyen === 'butun') return b.ipucu.hedef({ el: () => limonEl, soz: M.ipucu.limon, hareket: 'kaydir-yatay' });
    if (limonBekleyen === 'yarim') return b.ipucu.hedef({ el: () => limonEl, soz: M.ipucu.pres, hareket: 'surukle', nereye: () => surahi });
    if (seviye(s) <= 0.02 && bardak.dolum < 0.05) return b.ipucu.hedef({ el: () => raf.firstElementChild as HTMLElement | null, soz: M.ipucu.bos, hareket: 'dokun' });
    if (s.yogurt > 0 && sd.karisim < 0.5 && bardak.dolum < 0.05) return b.ipucu.hedef({ el: () => (kapakli ? surahi : kapak), soz: M.ipucu.calkala, hareket: kapakli ? 'kaydir-yatay' : 'dokun' });
    if (bardak.dolum < 0.3) return b.ipucu.hedef({ el: () => surahi, soz: M.ipucu.bardak, hareket: 'surukle', nereye: () => bardakEl });
    b.ipucu.hedef({ el: () => b.tepsi.el, soz: M.ipucu.bitti, hareket: 'dokun' });
  }

  // ------------------------------------------------------------ tepsi: ödül ve ürün
  let coz: (u: Urun[]) => void = () => undefined;
  const bitti = new Promise<Urun[]>((rr) => (coz = rr));
  b.tepsi.dinle(() => {
    if (odulde) return;
    if (bardak.dolum < 0.02 && seviye(s) <= 0.02) return coz([]);
    odulde = true;
    dokmeBitir();
    ipucuGuncelle();
    void odul();
  });

  async function odul() {
    olay('odul');
    // bardak boşsa sürahiden kendiliğinden dolar (çizgiye kadar)
    if (bardak.dolum < 0.05 && seviye(s) > 0.02) {
      jugKoy(B.cx + J.w * 0.06, B.alt - B.h - J.h * 0.55);
      const ag = agizNokta();
      akisGoster(ag.x, ag.y, B.alt - B.h * 0.5, RENK[icecekTuru(s)], 0);
      for (let i = 0; i < 20 && bardak.dolum < BARDAK.cizgi; i++) {
        dok(s, sd, bardak, 0.12, 'kucuk');
        sivilariCiz();
        await bekle(40);
      }
      akis.style.display = 'none';
      jugKoy(J.cx, J.alt - J.h / 2);
    }
    await bekle(200);
    const ustY = B.alt - B.h * Math.min(1, bardak.dolum);
    if (bardak.kopuk > 0.3) {
      // köpük taçlanır, köpükten minik kalp
      bKopuk.classList.add('rs-tac');
      const kalpU = resim('efekt/kalp');
      const kalp = h('i.rs-ic-kalp', {}, kalpU ? h('img', { src: kalpU, alt: '', draggable: 'false' }) : null);
      kalp.style.transform = `translate(${B.cx - 14}px,${ustY - 34}px)`;
      efektKat.append(kalp);
      hopla(kalp, 14, 420);
      b.ses.cal('kopuk', { perde: 1.3 });
      void b.mino.soyle(M.kalp);
      olay('kalp');
    } else {
      for (const k of [...bBuz.children] as HTMLElement[]) ezil(k, 1);
    }
    parilti(efektKat, B.cx, ustY, 6, B.w * 0.8);
    b.ses.cal('ting');
    odulEzgi([79, 83, 86, 91], 0.09);
    await bekle(800);
    const tr = b.tepsi.el.getBoundingClientRect();
    const kr = kok.getBoundingClientRect();
    const tasinan = [bardakEl, ...(efektKat.querySelector('.rs-ic-kalp') ? [efektKat.querySelector('.rs-ic-kalp') as HTMLElement] : [])];
    await Promise.all(tasinan.map((el) => ucur(el, tr.left - kr.left + tr.width / 2 - B.cx, tr.top - kr.top + tr.height / 2 - (B.alt - B.h / 2), 420, -40)));
    const ozellik = icecekOzeti(bardak);
    const tur = icecekTuru(bardak.icerik);
    const kopya = { dolum: Math.min(1, bardak.dolum), tur, kopuk: bardak.kopuk, buz: bardak.buz };
    coz([{ id: urunId('icecek'), tur: 'icecek', yemek: tur === 'ayran' || tur === 'limonata' ? tur : undefined, servis: true, ozellik, gorsel: () => bardakGorsel(kopya) }]);
  }

  (window as unknown as { __rsIcecek?: unknown }).__rsIcecek = {
    olaylar,
    durum: () => ({
      surahi: { ...s, seviye: +seviye(s).toFixed(2), tur: icecekTuru(s), karisim: +sd.karisim.toFixed(2), kopuk: +sd.kopuk.toFixed(2), kapakli, x: jx, y: jy, w: J.w, h: J.h },
      bardak: { dolum: +bardak.dolum.toFixed(2), tasan: +bardak.tasan.toFixed(2), tur: icecekTuru(bardak.icerik), kopuk: +bardak.kopuk.toFixed(2), buz: bardak.buz, cx: B.cx, alt: B.alt, w: B.w, h: B.h },
      limon: { bekleyen: limonBekleyen, presteki, presOran: +presOran.toFixed(2), kesme: { ...KY } },
      kapak: { ...KP },
    }),
  };
  yerlestir();
  ipucuGuncelle();

  return {
    bitti,
    kapat() {
      kapandi = true;
      ro?.disconnect();
      dokmeBitir();
      kino.sil();
      lokum.sil();
      kok.remove();
    },
  };
}

/** Tepside ve masada küçük hâli: bardak (dolum, köpük, buz) */
export function bardakGorsel(b: { dolum: number; tur: Icecek; kopuk: number; buz: number }): HTMLElement {
  const sivi = h('i.rs-ic-b-sivi');
  sivi.style.height = `${b.dolum * 100}%`;
  sivi.style.background = RENK[b.tur];
  const kopuk = h('i.rs-ic-b-kopuk');
  kopuk.style.bottom = `${b.dolum * 100}%`;
  kopuk.style.height = `${b.kopuk * b.dolum * 18}%`;
  kopuk.style.opacity = b.kopuk > 0.05 ? '1' : '0';
  const buz = h('div.rs-ic-b-buz', {}, ...Array.from({ length: b.buz }, (_, i) => {
    const k = h('i.rs-ic-buz-kup');
    k.style.left = `${12 + (((i + 1) * 29) % 50)}%`;
    return k;
  }));
  buz.style.bottom = `${Math.max(4, b.dolum * 100 - 16)}%`;
  return h('div.rs-ic-urun', {}, h('div.rs-ic-bardak', { 'data-tur': b.tur }, h('div.rs-ic-b-kap', {}, sivi, buz, kopuk), h('i.rs-ic-b-cam')));
}
