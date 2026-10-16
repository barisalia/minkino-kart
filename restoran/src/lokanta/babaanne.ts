/**
 * Babaanne (Nazlı) lokantada (§5c, §13.1):
 *  - İlk oyunda (bir kez, ~20 sn): kapıdan girer, anahtarı uzatır: "Lokanta artık senin kuzum!". Çocuk anahtara
 *    dokununca anahtar uçup kapının kilidine oturur, kapı zili çalar, Babaanne "Kolay gelsin, şefim." deyip el
 *    sallayarak çıkar. (İpucu: 12 sn anahtar kıpırdar, 30 sn hafifçe parlar; 45 sn sonra kendisi verir: oyun kilitlenmez.)
 *  - Yeni tarif alındıysa ertesi sabah bir kez gelir, servis penceresinde tadına bakar: "Maşallah kuzum!".
 *  - Gün sonunda defterin başında durur (defter.ts).
 * Kendi Seri 2 sesiyle (eleven_v4) konuşur; kayıt gelene dek söz balonda görünür, robot sese düşmez.
 * Görsel: Gemini 'babaanne-lokanta-sayfasi' pozları (konus, anahtar, tat, alkis, gul, sasir, fikir, gule) gelince
 * onlar; gelene kadar Seri 2 kesme kuklası + yer tutucu anahtar (pirinç rengi sade şekil).
 */
import { konus } from '../../../src/audio/ses';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import defterJson from '../../../content/restoran/defter.json';
import type { Yer } from '../olcek';
import { salonSes, sesler } from '../sesler';
import { varlik } from '../varliklar';
import { Kisi } from './kisi';

const B = defterJson.babaanne;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 20) : ms));

export interface BabaanneBaglam {
  katman: HTMLElement;
  kapi: Yer;
  /** Babaanne'nin durduğu yer (salonun ortası, masaların önü) */
  dur: Yer;
  /** servis penceresinin önü (tadına bakma) */
  pencere: Yer;
  /** kapı düğmesi (anahtar buraya uçar) */
  kapiEl: HTMLElement;
  kapandi: () => boolean;
}

/** Babaanne'nin sözü: balon + kendi kaydı (yoksa sessiz bekler; cihaz sesi yok) */
export async function babaanneSoyle(k: Kisi, metin: string) {
  const b = h('div.rs-soz.rs-soz-babaanne', {}, metin.replace(/\[[^\]]*\]\s*/g, ''));
  k.el.append(b);
  k.konus(true);
  try {
    await konus(metin, { karakter: 'babaanne', ton: 0.95, cihazSesi: false });
    await bekle(300);
  } finally {
    k.konus(false);
    b.remove();
  }
}

function geldi(c: BabaanneBaglam): Kisi {
  const k = new Kisi('babaanne', 'babaanne');
  k.el.classList.add('rs-babaanne');
  k.el.style.zIndex = '955';
  c.katman.append(k.el);
  k.yerKoy(c.kapi.x, c.kapi.y + 20);
  return k;
}

async function gider(c: BabaanneBaglam, k: Kisi) {
  k.poz('gule');
  await k.oynat('hop', 420);
  await k.yuru(c.kapi.x, c.kapi.y + 20, 24);
  salonSes.kapi();
  k.kapat();
}

/** Anahtar (Gemini pozu 'anahtar' elinde çiziliyse yalnız dokunma alanı; yoksa yer tutucu pirinç anahtar) */
function anahtarEl(): HTMLElement {
  const pozlu = !!varlik('kisi/babaanne/anahtar');
  const u = varlik('ui/anahtar');
  return h(
    'button.rs-anahtar',
    { type: 'button', 'aria-label': 'Anahtar', 'data-pozlu': pozlu ? '1' : undefined, 'data-yertutucu': !pozlu && !u ? '1' : undefined },
    pozlu ? null : u ? h('img', { src: u, alt: '', draggable: 'false' }) : h('span.rs-anahtar-sekil', {}, h('i'), h('b')),
  );
}

/** İlk açılış: anahtar teslimi. Çocuk anahtara dokununca (ya da 45 sn sonra) biter. */
export async function anahtarTeslim(c: BabaanneBaglam): Promise<void> {
  const k = geldi(c);
  await k.hazir;
  salonSes.kapi();
  await k.yuru(c.dur.x, c.dur.y, 22);
  if (c.kapandi()) return k.kapat();
  // masaların arkasında durur (öndeki masa bacaklarını örter; masanın üstünde dikilmez)
  k.el.style.zIndex = String(Math.round(c.dur.y * 10) + 1);
  k.poz('anahtar');
  void k.oynat('hop', 420);
  const a = anahtarEl();
  k.el.append(a);
  const konusma = babaanneSoyle(k, B.anahtar);
  let alindi = false;
  await new Promise<void>((coz) => {
    const bas = performance.now();
    const t = window.setInterval(() => {
      if (c.kapandi()) {
        clearInterval(t);
        coz();
        return;
      }
      const g = performance.now() - bas;
      if (g > 12000 && !a.dataset.kipir) {
        a.dataset.kipir = '1';
        a.classList.add('rs-kipir');
      }
      if (g > 30000 && !a.dataset.parla) {
        a.dataset.parla = '1';
        a.classList.add('rs-parla');
      }
      if (g > 45000) {
        clearInterval(t);
        coz();
      }
    }, 250);
    a.addEventListener(
      'click',
      () => {
        alindi = true;
        clearInterval(t);
        coz();
      },
      { once: true },
    );
  });
  if (c.kapandi()) return k.kapat();
  // anahtar kapıya uçar, kilide oturur
  sesler.cal('ting');
  try {
    const r = a.getBoundingClientRect();
    const d = c.kapiEl.getBoundingClientRect();
    const ucan = a.cloneNode(true) as HTMLElement;
    ucan.classList.add('rs-anahtar-ucan');
    Object.assign(ucan.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: '0', transform: 'none' });
    a.style.visibility = 'hidden';
    document.body.append(ucan);
    const dx = d.left + d.width * 0.5 - r.left - r.width / 2;
    const dy = d.top + d.height * 0.45 - r.top - r.height / 2;
    await ucan.animate([{ transform: 'none' }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 70}px) scale(1.15)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) scale(0.6)` }], { duration: sure(650), easing: 'ease-in-out' }).finished;
    ucan.remove();
  } catch {
    /* yok say */
  }
  a.remove();
  salonSes.tabela();
  c.kapiEl.classList.add('rs-hopla');
  window.setTimeout(() => c.kapiEl.classList.remove('rs-hopla'), 600);
  await konusma;
  k.poz('alkis');
  void k.oynat('sevin', 900);
  if (alindi || TEST_MODU) await babaanneSoyle(k, B.anahtar_aldi);
  if (c.kapandi()) return k.kapat();
  await gider(c, k);
}

/** Yeni tarifin ertesi sabahı: Babaanne servis penceresinde tadına bakar */
export async function yeniTarifTadi(c: BabaanneBaglam): Promise<void> {
  const k = geldi(c);
  await k.hazir;
  salonSes.kapi();
  await k.yuru(c.pencere.x, c.pencere.y, 24);
  if (c.kapandi()) return k.kapat();
  k.poz('konus');
  await babaanneSoyle(k, B.yeni_tarif);
  k.poz('tat');
  k.ifade('keyif', 1600);
  salonSes.cigne();
  await k.oynat('ye', 900);
  salonSes.bayildi();
  const e = h('div.rs-efekt', { 'data-efekt': 'kalp' }, ...Array.from({ length: 4 }, (_, i) => h('i', { style: `--i:${i}` })));
  k.el.append(e);
  window.setTimeout(() => e.remove(), TEST_MODU ? 50 : 1900);
  await babaanneSoyle(k, B.tadi);
  if (c.kapandi()) return k.kapat();
  await bekle(200);
  await gider(c, k);
}
