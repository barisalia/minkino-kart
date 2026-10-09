/**
 * Vaka 3'ün kart sahneleri (sorgu.ts'nin kalıbında; yanlış kart kendini anlatır, doğru kart oturunca küçük bir sevinç).
 * - Halka 1 (kaç kurabiye): kart tepsinin fotoğrafına kurabiyelerini döker: 6'da fazla ikisi var olanların üstüne binip
 *   "pıt pıt" düşer; 2'de iki halka hâlâ boş parlar; 4 tam oturur, "tık tık tık tık".
 * - Halka 2 (nereden): kapının sürgüsü "tak" diye kapanır; baca kapağından buhar çıkar, kurabiye sığmaz, yan yatar.
 * - Halka 3 (üstünde ne vardı): karttan kuş çıkar tohumunu gagalar; tavşan havucunu kemirir (balonda yazar).
 * - Halka 4 (kim yaşıyor): kuş kanadını açar (tüyü kanatta); kirpi ağaca çıkmaya çalışır, kayar, dikenleri kabarır.
 * - Halka 5 (neden aldı): kurabiyeler parlar (ısırık yok); parti şapkası arar, bulamaz, söner.
 * Hiçbiri ceza değil; hepsi kısa. Yalnız transform / opacity.
 */
import { boyGenislik } from '../../src/karakter/boy';
import { Karakter, type Poz } from '../../src/karakter/karakter';
import { h, sure } from '../../src/ui/dom';
import { AZ_HAREKET } from './dunya';
import { oynat, pop, salla } from './efekt';
import { B3, BOS_YERLER, KALAN, M3 } from './mantik3';
import { FOTO_TEPSI, tepsiFotoYeri } from './resimler3';
import { resim } from './resimler';
import { ses } from './sesler';
import { kartGotur, type YanlisAni } from './sorgu';
import { yaklasSek, type Ortak } from './sorgu2';

const img = (ad: string, sinif = '') => h(`img${sinif ? '.' + sinif : ''}`, { src: resim(ad) ?? '', alt: '', draggable: 'false' });
const bitti = (a: Animation | null | undefined) => (a ? a.finished.then(() => undefined, () => undefined) : Promise.resolve());

/** Delil fotoğrafının (contain: 4:3 resim kare kutuda) bir noktası → ekran (kök) px */
export function fotoNokta(o: Ortak, ic: DOMRect, fx: number, fy: number, oran = FOTO_TEPSI.h / FOTO_TEPSI.w): [number, number] {
  const k = o.kok.getBoundingClientRect();
  const yuk = Math.min(1, oran);
  return [ic.left - k.left + ic.width * fx, ic.top - k.top + ic.height * ((1 - yuk) / 2 + fy * yuk)];
}
const kokNokta = (o: Ortak, r: DOMRect, fx = 0.5, fy = 0.5): [number, number] => {
  const k = o.kok.getBoundingClientRect();
  return [r.left - k.left + r.width * fx, r.top - k.top + r.height * fy];
};

/** Kartın içinden fotoğrafa kurabiye uçar (döner: konan eleman) */
async function kurabiyeUcur(o: Ortak, a: YanlisAni, kap: HTMLElement, [x1, y1]: [number, number], boy: number, gecikme: number): Promise<HTMLElement> {
  const [x0, y0] = kokNokta(o, a.k.getBoundingClientRect());
  const el = img('v3/kurabiye', 'dd-v3-ucan-kurabiye');
  el.style.cssText = `left:${x1}px;top:${y1}px;width:${boy}px`;
  kap.append(el);
  if (!AZ_HAREKET)
    await bitti(
      el.animate(
        [
          { transform: `translate(-50%, -50%) translate(${x0 - x1}px, ${y0 - y1}px) scale(0.5)`, opacity: 0 },
          { transform: `translate(-50%, -50%) translate(${(x0 - x1) / 2}px, ${(y0 - y1) / 2 - 50}px) scale(0.9)`, opacity: 1, offset: 0.5 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        ],
        { duration: sure(420), delay: sure(gecikme), easing: 'cubic-bezier(.3,.8,.4,1)', fill: 'both' },
      ),
    );
  el.style.transform = 'translate(-50%, -50%)';
  ses.tik();
  return el;
}
async function sondur(els: HTMLElement[]) {
  await Promise.all(els.map((e) => bitti(e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(380), fill: 'forwards' }))));
  els.forEach((e) => e.remove());
}

// ---------------------------------------------------------------- Halka 1
/** Yanlış sayı: 6 → fazla iki kurabiye var olanların üstüne biner, "pıt pıt" düşüp yuvarlanır; 2 → iki halka boş parlar */
export function sayiYanlis(o: Ortak) {
  return async (a: YanlisAni) => {
    await kartGotur(a.k, a.ic, 0.5, 0.5, a.ic.width * 0.5, 0, 300);
    const yan = a.delil.getBoundingClientRect();
    await kartGotur(a.k, yan, 0.9, 0.82, Math.min(yan.width * 0.45, 170), 7, 320);
    if (o.kapandi()) return;
    const [, , kf] = tepsiFotoYeri(0);
    const boy = a.ic.width * kf;
    const konan: HTMLElement[] = [];
    if (a.id === 'kurabiye-6') {
      // altısı: dördü boş yerlere, ikisi var olanların üstüne
      const yerler = [...BOS_YERLER, ...KALAN];
      const isler = yerler.map((y, i) => {
        const [fx, fy] = tepsiFotoYeri(y);
        return kurabiyeUcur(o, a, a.sahnecik, fotoNokta(o, a.ic, fx, fy), boy, i * 110);
      });
      konan.push(...(await Promise.all(isler)));
      if (o.kapandi()) return;
      await o.bekle(250);
      // fazla iki: üstte iki kurabiye, kendi kendine düşüp yuvarlanır
      const fazla = konan.slice(BOS_YERLER.length);
      for (const [i, el] of fazla.entries()) {
        ses.pit();
        if (!AZ_HAREKET)
          void el.animate(
            [
              { transform: 'translate(-50%, -50%) translate(4px, -8px) rotate(0deg)' },
              { transform: `translate(-50%, -50%) translate(${i ? 30 : -30}px, -40px) rotate(${i ? 40 : -40}deg)`, offset: 0.25 },
              { transform: `translate(-50%, -50%) translate(${i ? 90 : -90}px, ${a.ic.height * 0.9}px) rotate(${i ? 320 : -320}deg)`, opacity: 1, offset: 0.8 },
              { transform: `translate(-50%, -50%) translate(${i ? 150 : -150}px, ${a.ic.height * 0.95}px) rotate(${i ? 480 : -480}deg)`, opacity: 0 },
            ],
            { duration: sure(1300), delay: sure(i * 260), easing: 'cubic-bezier(.4,0,.7,1)', fill: 'forwards' },
          );
        o.efekt.sars(2);
      }
      o.oy.kinoIfade('saskin', 1400);
      o.oy.minoTepki('hayir');
      await o.oy.soyle(M3.ikisi_burada);
    } else {
      // ikisi: iki boş yer dolar, öbür ikisi parlar
      const yerler = BOS_YERLER.slice(0, 2);
      konan.push(...(await Promise.all(yerler.map((y, i) => kurabiyeUcur(o, a, a.sahnecik, fotoNokta(o, a.ic, ...(tepsiFotoYeri(y).slice(0, 2) as [number, number])), boy, i * 120)))));
      if (o.kapandi()) return;
      for (const y of BOS_YERLER.slice(2)) {
        const [fx, fy] = tepsiFotoYeri(y);
        const [x, yy] = fotoNokta(o, a.ic, fx, fy);
        const p = h('i.dd-v3-bos-parla', { style: `left:${x}px;top:${yy}px;width:${boy * 1.15}px;height:${boy * 0.9}px` });
        a.sahnecik.append(p);
        konan.push(p);
        o.efekt.parilti(x, yy, 6, 0.5);
      }
      o.oy.minoTepki('hayir');
      await o.oy.soyle(M3.bos_yer);
    }
    await sondur(konan);
  };
}
/** Doğru: dört kurabiye dört halkaya tam oturur "tık tık tık tık"; kartın kendisi söner */
export async function sayiDogru(o: Ortak) {
  const foto = o.kok.querySelector<HTMLElement>('.dd-sorgu .dd-delil-foto');
  const kart = o.kok.querySelector<HTMLElement>('.dd-sorgu .dd-oturan-kap');
  const kap = o.kok.querySelector<HTMLElement>('.dd-sorgu .dd-sahnecik');
  if (!foto || !kap) return;
  const ic = foto.getBoundingClientRect();
  const [, , kf] = tepsiFotoYeri(0);
  const kaynak = (kart ?? foto).getBoundingClientRect();
  if (kart && !AZ_HAREKET) void kart.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(300), fill: 'forwards' });
  const konan: HTMLElement[] = [];
  for (const [i, y] of BOS_YERLER.entries()) {
    const [fx, fy] = tepsiFotoYeri(y);
    const sahte = { k: { getBoundingClientRect: () => kaynak } } as unknown as YanlisAni;
    konan.push(await kurabiyeUcur(o, sahte, kap, fotoNokta(o, ic, fx, fy), ic.width * kf, i ? 60 : 0));
    const [x, yy] = fotoNokta(o, ic, fx, fy);
    o.efekt.parilti(x, yy, 4, 0.4);
  }
  // fotoğrafın içine kalıcı kopya: "demek ki" kartı gelene dek
  await o.bekle(500);
  await sondur(konan);
}

// ---------------------------------------------------------------- Halka 2
export function cikisYanlis(o: Ortak) {
  return async (a: YanlisAni) => {
    await yaklasSek(o, a);
    if (o.kapandi()) return;
    const r = a.k.getBoundingClientRect();
    if (a.id === 'kapi') {
      // kart titrer; sürgü kayıp "tak" diye kapanır (sürgünün kendisi görünür)
      void salla(a.k);
      const [x, y] = kokNokta(o, r, 0.5, 0.62);
      const s = h('div.dd-v3-surgu', { style: `left:${x}px;top:${y}px;width:${r.width * 0.62}px` }, h('i.dd-v3-surgu-govde'), h('i.dd-v3-surgu-dil'));
      a.sahnecik.append(s);
      const dil = s.querySelector<HTMLElement>('.dd-v3-surgu-dil')!;
      await o.bekle(250);
      await bitti(AZ_HAREKET ? null : dil.animate([{ transform: 'translateX(-60%)' }, { transform: 'translateX(8%)', offset: 0.8 }, { transform: 'translateX(0)' }], { duration: sure(380), easing: 'cubic-bezier(.5,0,.7,1.4)', fill: 'forwards' }));
      ses.tak();
      void salla(a.k);
      o.oy.minoTepki('hayir');
      await o.oy.soyle(M3.kapi_kilitli);
      await sondur([s]);
    } else if (a.id === 'baca') {
      // buhar bulutu "fıss"; kurabiye kapağa sığmaz, yan yatar, seker
      const [x, y] = kokNokta(o, r, 0.5, 0.12);
      const bulut = h('div.dd-v3-bulut', { style: `left:${x}px;top:${y}px;width:${r.width * 0.5}px` }, h('i'), h('i'), h('i'));
      a.sahnecik.append(bulut);
      ses.fiss();
      if (!AZ_HAREKET) void bulut.animate([{ transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0 }, { transform: 'translate(-50%, -120%) scale(1)', opacity: 0.95, offset: 0.4 }, { transform: 'translate(-50%, -220%) scale(1.3)', opacity: 0 }], { duration: sure(1300), fill: 'forwards' });
      const kurabiye = img('v3/kurabiye', 'dd-v3-ucan-kurabiye');
      const kw = r.width * 0.7;
      kurabiye.style.cssText = `left:${x}px;top:${y - kw * 0.2}px;width:${kw}px`;
      a.sahnecik.append(kurabiye);
      await bitti(
        AZ_HAREKET
          ? null
          : kurabiye.animate(
              [
                { transform: 'translate(-50%, -150%) scale(0.6)', opacity: 0 },
                { transform: 'translate(-50%, -60%) scale(1)', opacity: 1, offset: 0.35 },
                { transform: 'translate(-50%, -64%) scale(1) rotate(0deg)', offset: 0.5 },
                { transform: 'translate(-30%, -70%) scale(1) rotate(80deg)', offset: 0.75 },
                { transform: 'translate(-20%, -55%) scale(1) rotate(90deg)' },
              ],
              { duration: sure(1300), easing: 'ease-in-out', fill: 'forwards' },
            ),
      );
      o.oy.minoTepki('hayir');
      await o.oy.soyle(M3.sigmaz);
      await sondur([kurabiye, bulut]);
    }
  };
}
/** Doğru: pencere kartı rüzgârla hafifçe sallanır */
export async function cikisDogru(o: Ortak) {
  const k = o.kok.querySelector<HTMLElement>('.dd-sorgu .dd-oturan-kap img');
  ses.ruzgar(0.5);
  if (k && !AZ_HAREKET) await bitti(k.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-5deg) skewY(2deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(0)' }], { duration: sure(1100), easing: 'ease-in-out' }));
}

// ---------------------------------------------------------------- konuk (karttan çıkan iskelet ya da resim)
interface KonukSecenek {
  /** iskelet (kuş, tavşan) ya da resim (kirpi) */
  ad: 'kus' | 'tavsan' | 'kirpi';
  soz: string;
  /** konuk dururken yaptığı (balon açıkken) */
  hareket?: (z: HTMLElement, kutu: HTMLElement, k: Karakter | null, w: number, sx: number, sy: number) => Promise<void> | void;
  /** iskeletin ek hareketi (gagalama, kanat açma) */
  ek?: (p: Poz, t: number) => void;
}
/** Kartın sahibi karttan çıkar, kendi işini yapar, balonda konuşur (seslendirilmez), karta geri girer */
async function konuk(o: Ortak, a: YanlisAni, s: KonukSecenek) {
  const kk = o.kok.getBoundingClientRect();
  const r = a.k.getBoundingClientRect();
  const dar = kk.width < kk.height * 1.15;
  const minoW = o.oy.minoYer.getBoundingClientRect().width || 120;
  const w = Math.min(s.ad === 'kirpi' ? minoW * 0.62 : boyGenislik(s.ad, minoW), kk.width * (dar ? 0.6 : 0.3));
  const sx = kk.width * (dar ? 0.5 : 0.6);
  const sy = kk.height * (dar ? 0.985 : 0.99);
  const k = s.ad === 'kirpi' ? null : new Karakter(s.ad, h('div'));
  const kutu = h('div.dd-konuk-kutu', {}, k ? k.el : img('v3/kart-kirpi', 'dd-v3-konuk-resim'));
  const z = h('div.dd-konuk', { 'data-konuk': s.ad, style: `left:${sx}px;top:${sy}px;width:${w}px;opacity:1` }, kutu);
  a.sahnecik.append(z);
  if (k && s.ek) k.ekHareket = s.ek;
  const dx = r.left - kk.left + r.width / 2 - sx;
  const dy = r.top - kk.top + r.height / 2 - sy;
  await bitti(
    AZ_HAREKET
      ? null
      : z.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) translate(-50%, -60%) scale(0.15)`, opacity: 0 },
            { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - w * 0.35}px) translate(-50%, -100%) scale(0.85)`, opacity: 1, offset: 0.55 },
            { transform: 'translate(-50%, -100%) scale(1)', opacity: 1 },
          ],
          { duration: sure(640), easing: 'cubic-bezier(.3,.8,.4,1)', fill: 'forwards' },
        ),
  );
  z.style.transform = 'translate(-50%, -100%)';
  ses.pop();
  if (o.kapandi()) {
    k?.kapat();
    return;
  }
  o.oy.konukBagla(k, kutu, s.ad === 'kirpi' ? 0.05 : 0.12);
  const is = s.hareket?.(z, kutu, k, w, sx, sy);
  await Promise.all([o.oy.soyle(s.soz, 'balon'), is]);
  o.oy.minoTepki('gidik');
  if (o.kapandi()) {
    k?.kapat();
    return;
  }
  await bitti(AZ_HAREKET ? null : z.animate([{ transform: 'translate(-50%, -100%) scale(1)', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) translate(-50%, -60%) scale(0.15)`, opacity: 0 }], { duration: sure(420), easing: 'ease-in', fill: 'forwards' }));
  o.oy.konukBagla(null, kutu);
  z.querySelectorAll('.dd-v3-konuk-ek').forEach((x) => x.remove());
  z.remove();
  k?.kapat();
}

// ---------------------------------------------------------------- Halka 3
export function yolYanlis(o: Ortak) {
  return async (a: YanlisAni) => {
    await yaklasSek(o, a);
    if (o.kapandi()) return;
    if (a.id === 'tohum') {
      // kuş tohumunu gagalar, el (kanat) sallar
      const t0 = performance.now();
      await konuk(o, a, {
        ad: 'kus',
        soz: B3.kus_tohum,
        ek: (p, t) => {
          const u = (performance.now() - t0) / 1000;
          if (u < 1.6) p.kafa += Math.max(0, Math.sin(t * 14)) * 14;
          else p.kolSag -= 40 + Math.sin(t * 10) * 25;
        },
        hareket: (z, _k, _kr, w) => {
          const tohum = img('v3/ipucu-tohum', 'dd-v3-konuk-ek');
          tohum.style.cssText = `position:absolute;left:${w * 0.62}px;bottom:${-w * 0.02}px;width:${w * 0.5}px`;
          z.append(tohum);
          for (const t of [200, 500, 800]) window.setTimeout(() => ses.pit(), sure(t));
        },
      });
    } else if (a.id === 'havuc') {
      // tavşan (bankın altından) havucunu kemirir: havuç küçülür
      await konuk(o, a, {
        ad: 'tavsan',
        soz: B3.tavsan,
        ek: (p, t) => {
          p.kafa += Math.sin(t * 18) * 3;
          p.kolSag -= 30;
          p.kolSol += 30;
        },
        hareket: async (z, _k, _kr, w) => {
          const hv = img('v3/havuc', 'dd-v3-konuk-ek');
          hv.style.cssText = `position:absolute;left:${w * 0.34}px;top:${w * 0.42}px;width:${w * 0.34}px;transform-origin:20% 50%`;
          z.append(hv);
          ses.hapHap();
          if (!AZ_HAREKET) await bitti(hv.animate([{ transform: 'rotate(-30deg) scale(1)' }, { transform: 'rotate(-30deg) scale(0.75)', offset: 0.5 }, { transform: 'rotate(-30deg) scale(0.45)' }], { duration: sure(1600), fill: 'forwards' }));
        },
      });
    }
  };
}
/** Doğru: yıldız şekerler parlar */
export async function yolDogru(o: Ortak) {
  const f = o.kok.querySelector<HTMLElement>('.dd-sorgu .dd-delil-foto');
  if (!f) return;
  const r = f.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    const [x, y] = kokNokta(o, r, 0.36 + (i % 3) * 0.14, 0.35 + Math.floor(i / 3) * 0.18);
    window.setTimeout(() => o.efekt.parilti(x, y, 4, 0.4), sure(i * 120));
  }
  ses.ting();
  await o.bekle(700);
}

// ---------------------------------------------------------------- Halka 4
export function kimYanlis3(o: Ortak) {
  return async (a: YanlisAni) => {
    await yaklasSek(o, a);
    if (o.kapandi()) return;
    if (a.id === 'kus') {
      // kart döner; kuş kanatlarını açar: tüyü kanatta, kabarık değil
      if (!AZ_HAREKET) await bitti(a.k.animate([{ transform: a.k.style.transform }, { transform: `${a.k.style.transform} rotateY(180deg)` }, { transform: `${a.k.style.transform} rotateY(360deg)` }], { duration: sure(600), easing: 'ease-in-out' }));
      ses.kanat();
      await konuk(o, a, {
        ad: 'kus',
        soz: B3.kus_tuy,
        ek: (p, t) => {
          p.kolSol += 70 + Math.sin(t * 12) * 10;
          p.kolSag -= 70 + Math.sin(t * 12) * 10;
        },
      });
    } else if (a.id === 'kirpi') {
      // kirpi ağaca çıkmaya çalışır: iki adım yukarı, kayar; dikenleri kabarır
      await konuk(o, a, {
        ad: 'kirpi',
        soz: B3.kirpi,
        hareket: async (_z, kutu, _k, w) => {
          if (AZ_HAREKET) return;
          await bitti(
            kutu.animate(
              [
                { transform: 'translateY(0)' },
                { transform: `translateY(${-w * 0.2}px) rotate(-6deg)`, offset: 0.2 },
                { transform: `translateY(${-w * 0.35}px) rotate(4deg)`, offset: 0.4 },
                { transform: 'translateY(0) rotate(0)', offset: 0.7 },
                { transform: 'translateY(0) scale(1.12, 1.06)', offset: 0.85 },
                { transform: 'translateY(0) scale(1)' },
              ],
              { duration: sure(1500), easing: 'ease-in-out' },
            ),
          );
          ses.pit();
        },
      });
    }
  };
}
/** 2 yanlıştan sonra: tüy tutamı rüzgârda bir kez kabarır (kabarık kuyruk gibi) */
export function tuyKabar(o: Ortak) {
  const t = o.kok.querySelector<HTMLElement>('.dd-sorgu .dd-delil-ekk img');
  ses.ruzgar(0.4);
  if (t && !AZ_HAREKET) void t.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18, 1.1) rotate(-4deg)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: sure(900), easing: 'ease-in-out' });
  if (t) oynat(t.parentElement, 'dd-isil');
}
/** Doğru: kartın içindeki kuyruk bir kez sallanır */
export async function kimDogru(o: Ortak) {
  const k = o.kok.querySelector<HTMLElement>('.dd-sorgu .dd-oturan-kap img');
  if (k && !AZ_HAREKET) await bitti(k.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }], { duration: sure(700), easing: 'ease-in-out' }));
}

// ---------------------------------------------------------------- Halka 5
export function nedenYanlis(o: Ortak) {
  return async (a: YanlisAni) => {
    await yaklasSek(o, a);
    if (o.kapandi()) return;
    const r = a.ic;
    if (a.id === 'ac') {
      // kurabiyeler parlar: üstlerinde ısırık yok, hepsi bütün
      for (let i = 0; i < 2; i++) {
        const [x, y] = kokNokta(o, r, 0.66 + i * 0.16, 0.5);
        o.efekt.halka(x, y, r.width * 0.09);
      }
      ses.ting();
      o.oy.minoTepki('hayir');
      await o.oy.soyle(M3.butun);
    } else if (a.id === 'parti') {
      // parti şapkası kovukta balon arar, bulamaz, üzgünce söner
      const [x, y] = kokNokta(o, r, 0.5, 0.3);
      const s = h('div.dd-v3-parti', { style: `left:${x}px;top:${y}px;width:${r.width * 0.26}px` }, img('v3/parti-sapka'));
      a.sahnecik.append(s);
      if (!AZ_HAREKET) {
        await bitti(s.animate([{ transform: 'translate(-50%, -50%) translateX(0) rotate(0)', opacity: 0 }, { transform: `translate(-50%, -50%) translateX(${-r.width * 0.25}px) rotate(-14deg)`, opacity: 1, offset: 0.3 }, { transform: `translate(-50%, -50%) translateX(${r.width * 0.25}px) rotate(14deg)`, opacity: 1, offset: 0.7 }, { transform: 'translate(-50%, -50%) translateX(0) rotate(0)', opacity: 1 }], { duration: sure(1300), easing: 'ease-in-out', fill: 'forwards' }));
        void s.animate([{ transform: 'translate(-50%, -50%) scale(1, 1)', opacity: 1 }, { transform: 'translate(-50%, -20%) scale(1.1, 0.4)', opacity: 0 }], { duration: sure(900), delay: sure(500), easing: 'ease-in', fill: 'forwards' });
      }
      ses.hmm();
      o.oy.minoTepki('hayir');
      await o.oy.soyle(M3.parti_yok);
      s.remove();
    }
  };
}
/** Doğru: kar tanesi süsü parlar (kış) */
export async function nedenDogru(o: Ortak) {
  const e = o.kok.querySelector<HTMLElement>('.dd-sorgu .dd-delil-ekk');
  if (e) {
    oynat(e, 'dd-isil');
    void pop(e, 1.1);
    const [x, y] = kokNokta(o, e.getBoundingClientRect());
    o.efekt.parilti(x, y, 8, 0.6);
  }
  ses.ting();
  await o.bekle(700);
}
