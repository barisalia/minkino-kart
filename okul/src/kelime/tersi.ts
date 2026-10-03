/**
 * Kelime Köprüsü 3 · Tersi ne? (zıt anlamlılar). Kino bugün her şeyin tersini yapar. Sahnede bir şey durur (açık
 * kapı, dolu bardak, büyük top, sıcak çorba, uzun tren, kuru havlu). Mino: "Kino, kapı açık kalsın!" Kino koşar ve
 * tersini yapar, gözümüzün önünde: kapı güm diye kapanır, bardağı lık lık içer, top fış diye küçülür, çorba dondurmaya
 * döner, vagonlar çuf çuf gider, havluya su damlar. Çocuk iki karttan doğrusunu seçer ("Hangisi açık?"); kart sahneye
 * uçar ve eşya geri döner. Mino zıddını söyler: "Açık! Tersi kapalı."
 */
import { h, sure } from '../../../src/ui/dom';
import { kirpik, ton } from '../cizim';
import { AZ_HAREKET, oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import type { Sahne } from '../sahne';
import { ses } from '../sesler';
import { tersTurlari, type TersCift } from './model';
import { dokunSec, KA, KK, KM, sicrat, simge } from './ortak';
import { gorselEl, hazir, kelimeGorsel } from './resim';
import { kses } from './ses';

type Taraf = 'a' | 'b';

/** Gemini çizimi (okul/kelime/<ad>) varsa o, yoksa depodaki yedek */
const tercih = (ad: string, yedek: string) => (hazir(`okul/kelime/${ad}`) ? `okul/kelime/${ad}` : yedek);

/** Trenin görünüşü: lokomotif + vagonlar (aynı ölçek; uzun 3, kısa 0 vagon) */
function tren(vagon: number): HTMLElement {
  const vagonlar = Array.from({ length: vagon }, (_, i) => h('span.ok-k-vagon', { html: kirpik('okul/vagon', 'ok-tonlu ok-ayna', ton(i)) }));
  return h('span.ok-k-tren', { 'data-vagon': String(vagon) }, ...vagonlar, h('img.ok-k-lokomotif', { src: kelimeGorsel('tasitlar/tren'), alt: '', draggable: 'false' }));
}

/** Çiftin bir durumunun görüntüsü (sahnede ve kartta aynı) */
export function gorunus(c: TersCift, t: Taraf): HTMLElement {
  const a = t === 'a';
  const kutu = (...ic: HTMLElement[]) => h('span.ok-k-gorunus', { 'data-cift': c.id, 'data-taraf': t }, ...ic);
  switch (c.id) {
    case 'acik':
      return kutu(gorselEl(tercih(a ? 'kapi-acik' : 'kapi-kapali', a ? 'ege/perde-acik' : 'ege/perde-kapali')));
    case 'buyuk':
      return hazir('okul/kelime/buyuk-top') ? kutu(gorselEl(a ? 'okul/kelime/buyuk-top' : 'okul/kelime/kucuk-top')) : kutu(gorselEl('renkler/top', a ? 'ok-k-buyuk' : 'ok-k-kucuk'));
    case 'sicak':
      return kutu(gorselEl(a ? tercih('sicak-corba', 'renkler/corba') : tercih('dondurma-eriyen', 'renkler/dondurma')));
    case 'uzun':
      return kutu(tren(a ? 3 : 0));
    case 'dolu':
      return kutu(gorselEl(a ? 'okul/kelime/bardak-dolu' : 'okul/kelime/bardak-bos'));
    case 'kuru':
      return kutu(gorselEl(a ? 'okul/kelime/havlu-kuru' : 'okul/kelime/havlu-islak'));
  }
}

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));

/**
 * Sahnedeki eşya bir durumdan ötekine geçer, çiftin kendi hareketiyle (yalnız transform/opacity, yaylı ivme):
 * kapı çarpar (sarsıntı), bardak boşalır (çalkalanır), top büzülür ya da şişer, çorba "puf" diye dondurmaya döner,
 * vagonlar kayıp gider, havluya damla yağar. Eski görüntü solar, yenisi aynı yerde belirir (pozisyon atlamaz).
 */
async function degistir(s: Sahne, pano: HTMLElement, c: TersCift, hedef: Taraf) {
  const eski = pano.firstElementChild as HTMLElement | null;
  const yeni = gorunus(c, hedef);
  yeni.classList.add('ok-k-katman');
  if (eski) eski.classList.add('ok-k-katman');
  const ani = !AZ_HAREKET;
  const bozuluyor = hedef === 'b';
  // önce: çiftin kendi hazırlık hareketi
  if (ani && eski) {
    if (c.id === 'uzun' && bozuluyor) {
      // vagonlar sola kayıp gider (çuf çuf), lokomotif kalır
      ses.duduk();
      const vagonlar = [...eski.querySelectorAll<HTMLElement>('.ok-k-vagon')];
      await Promise.all(
        vagonlar.map(
          (v, i) =>
            v.animate(
              [
                { transform: 'none', opacity: 1 },
                { transform: 'translateX(8%) rotate(3deg)', offset: 0.15 },
                { transform: `translateX(-${260 + i * 40}%) rotate(-4deg)`, opacity: 0 },
              ],
              { duration: sure(700), delay: sure((vagonlar.length - 1 - i) * 90), easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' },
            ).finished,
        ),
      ).catch(() => undefined);
    } else if (c.id === 'kuru' && bozuluyor) {
      // havluya su damlar
      for (let i = 0; i < 4; i++) {
        const [x, y] = s.efekt.merkez(pano, 0.3 + i * 0.13, 0.25);
        sicrat(s.efekt, x, y, '#6cc4ff', 5, 0.55);
        kses.hop(i);
        await bekle(140);
      }
    } else if (c.id === 'dolu' && bozuluyor) {
      // lık lık: bardak çalkalanır
      for (let i = 0; i < 3; i++) setTimeout(() => ses.pit(6 - i * 2), sure(i * 160));
      await eski.animate(
        [{ transform: 'none' }, { transform: 'rotate(-8deg) translateY(-4%)', offset: 0.3 }, { transform: 'rotate(6deg)', offset: 0.65 }, { transform: 'none' }],
        { duration: sure(560), easing: 'ease-in-out' },
      ).finished.catch(() => undefined);
    } else {
      // öbür değişimler: önce küçük bir hazırlık (anticipation)
      await eski.animate([{ transform: 'none' }, { transform: 'scale(1.06, 0.94)' }], { duration: sure(140), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
    }
  }
  pano.append(yeni);
  if (ani && eski && c.id === 'uzun' && !bozuluyor) {
    // vagonlar soldan geri gelir, lokomotife takılır
    ses.duduk();
    yeni.querySelectorAll<HTMLElement>('.ok-k-vagon').forEach((v, i) =>
      v.animate(
        [
          { transform: 'translateX(-300%) rotate(-4deg)', opacity: 0 },
          { transform: 'translateX(6%) rotate(2deg)', opacity: 1, offset: 0.8 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: sure(650), delay: sure(i * 90), easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' },
      ),
    );
  }
  if (!ani || !eski) {
    eski?.remove();
    return;
  }
  // geçiş: çiftine göre
  const giris: Keyframe[] =
    c.id === 'acik'
      ? [
          { transform: 'scaleX(0.82)', opacity: 0 },
          { transform: 'scaleX(1.06)', opacity: 1, offset: 0.55 },
          { transform: 'none', opacity: 1 },
        ]
      : c.id === 'buyuk'
        ? [
            { transform: bozuluyor ? 'scale(1.5)' : 'scale(0.55)', opacity: 0.2 },
            { transform: bozuluyor ? 'scale(0.85)' : 'scale(1.12)', opacity: 1, offset: 0.6 },
            { transform: 'none', opacity: 1 },
          ]
        : c.id === 'sicak'
          ? [
              { transform: 'scale(0.3) rotate(-20deg)', opacity: 0 },
              { transform: 'scale(1.12, 0.9) rotate(4deg)', opacity: 1, offset: 0.6 },
              { transform: 'none', opacity: 1 },
            ]
          : [
              { transform: 'scale(0.96)', opacity: 0 },
              { transform: 'scale(1.04, 0.97)', opacity: 1, offset: 0.6 },
              { transform: 'none', opacity: 1 },
            ];
  const cikis: Keyframe[] =
    c.id === 'sicak' ? [{ transform: 'scale(1.06, 0.94)', opacity: 1 }, { transform: 'scale(0.4) rotate(15deg)', opacity: 0 }] : [{ opacity: 1 }, { opacity: 0 }];
  if (c.id === 'acik') kses.slap();
  else if (c.id === 'buyuk') kses.ters();
  else if (c.id === 'sicak') ses.pof();
  else ses.tik();
  if (c.id === 'sicak') {
    const [x, y] = s.efekt.merkez(pano);
    s.efekt.parilti(x, y, 8);
  }
  await Promise.all([
    yeni.animate(giris, { duration: sure(520), easing: 'cubic-bezier(.3,1.3,.5,1)' }).finished,
    eski.animate(cikis, { duration: sure(360), easing: 'ease-out', fill: 'forwards' }).finished,
  ]).catch(() => undefined);
  eski.remove();
  yeni.classList.remove('ok-k-katman');
  if (c.id === 'acik' && bozuluyor) oynat(pano, 'ok-k-sars');
}

async function tur(s: Sahne, c: TersCift, ilk: boolean) {
  const S = KM.tersi.ciftler[c.id];
  const pano = h('div.ok-k-pano', { 'data-cift': c.id }, gorunus(c, 'a'));
  s.alan.replaceChildren(h('div.ok-k-tersi', {}, pano));
  s.secim.replaceChildren();
  oynat(pano, 'ok-yapis');
  if (ilk) await s.soyle(KM.tersi.giris);
  await s.soyle(S.iste);
  // Kino koşup tersini yapar, gözümüzün önünde
  const [x, y] = s.efekt.merkez(pano, 0.92, 0.98);
  await s.kinoHata({
    kino: KK.tersi[c.id],
    poz: 'kalk',
    once: async () => {
      await s.kinoGit(x, y, 600);
      s.kinoOynat('huy', 700);
      await degistir(s, pano, c, 'b');
    },
    mino: ilk ? KM.tersi.yakala : undefined,
  });
  await s.kinoDon(500);
  if (ilk) await s.soyle(KM.tersi.sen);

  const kartlar = s.karistir<Taraf>(['a', 'b']).map((t, i) => h('button.ok-k-kart.ok-k-ters-kart.ok-k-gel', { type: 'button', 'data-taraf': t, style: `--i:${i}`, 'aria-label': t === 'a' ? S.a : S.b }, gorunus(c, t)));
  s.secim.replaceChildren(h('div.ok-k-ters-kartlar', {}, ...kartlar));
  const k = await dokunSec(s, kartlar, (x2) => x2.dataset.taraf === 'a', {
    adim: 'sec',
    soru: S.soru,
    yanlis: async () => {
      // dokunduğu durumun adı ("Kapalı!"), sonra soru
      await s.soyle(S.b);
      await s.soyle(S.soru);
    },
  });
  // doğru kart sahneye uçar, eşya eski hâline döner
  const icerik = gorunus(c, 'a');
  icerik.classList.add('ok-k-ucan-gorunus');
  k.classList.add('ok-k-gitti');
  await s.efekt.ucur(icerik, s.efekt.merkez(k), s.efekt.merkez(pano), { ms: 520, boy0: 0.6, boy1: 1 });
  await degistir(s, pano, c, 'a');
  await s.ovgu(pano);
  s.kinoIfade('utangac', 1200);
  await s.soyle(S.ters);
  s.secim.replaceChildren();
}

etkinlikKaydet({
  id: 'kelime-tersi',
  bolge: 'kelime',
  ad: KA.etkinlikler['kelime-tersi'],
  simge: () => simge([tercih('kapi-acik', 'ege/perde-acik'), 'ok-ks-tam']),
  async oyna(s) {
    const turlar = tersTurlari(s.yas, s.rnd, hazir);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
