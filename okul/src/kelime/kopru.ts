/**
 * Kelime Köprüsü'nün bölge ekranı: derenin üstündeki köprü (assets/okul/kopru.webp) ve üstünde 6 taş yuvası. Her
 * etkinlik bir durak; biten etkinliğin resimli taşı köprüye yerleşir (yeni taş yukarıdan düşüp "tık" diye oturur).
 * Altı taş tamamlanınca Mino ile Kino köprüden karşıya yürür, karşı yakada küçük bir şenlik (flama, balon, konfeti).
 *
 * Görülen taşlar ve şenliğin görüldüğü bu modülün kendi kaydında (okul kaydına dokunmaz): minkino-okul-kelime-v1.
 */
import K from '../../../content/okul-kelime.json';
import O from '../../../content/okul.json';
import { erisimVarMi } from '../../../src/abonelik/kilit';
import { efekt, konus } from '../../../src/audio/ses';
import type { Depo } from '../../../src/engine/ilerleme';
import { durum } from '../../../src/engine/ilerleme';
import { Karakter } from '../../../src/karakter/karakter';
import { Mino } from '../../../src/mino/mino';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { konfetiPatlat } from '../../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../../src/uygulama';
import { etkinlikSimgesi, kirpik, parkAdres } from '../cizim';
import { AZ_HAREKET, Efekt } from '../efekt';
import { bolge, bolgeEtkinlikleri, oynananlar, yasUygun } from '../etkinlik';
import { kayit, siradaki } from '../kayit';
import { KINO_ORAN } from '../sahne';
import { ses } from '../sesler';
import { kelimeGorsel } from './resim';

// ---------------------------------------------------------------- köprünün kendi kaydı
export const KOPRU_ANAHTAR = 'minkino-okul-kelime-v1';
export interface KopruKayit {
  /** köprüde yerleşmiş görülen taşlar (etkinlik kimlikleri) */
  gorulen: string[];
  /** şenlik görüldü (Mino ile Kino karşıya geçti) */
  gecti: boolean;
}
function depo(): Depo | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
export function kopruYukle(d: Depo | null = depo()): KopruKayit {
  try {
    const k = JSON.parse(d?.getItem(KOPRU_ANAHTAR) ?? 'null') as Partial<KopruKayit> | null;
    return { gorulen: Array.isArray(k?.gorulen) ? k.gorulen.filter((x): x is string => typeof x === 'string') : [], gecti: k?.gecti === true };
  } catch {
    return { gorulen: [], gecti: false };
  }
}
export function kopruKaydet(k: KopruKayit, d: Depo | null = depo()) {
  try {
    d?.setItem(KOPRU_ANAHTAR, JSON.stringify(k));
  } catch {
    /* gizli sekme: bellekte kalır */
  }
}
/** Yeni yerleşecek taşlar (biten ama köprüde henüz görülmemiş), köprü sırasıyla */
export const yeniTaslar = (sira: string[], biten: string[], gorulen: string[]) => sira.filter((id) => biten.includes(id) && !gorulen.includes(id));

// ---------------------------------------------------------------- yerleşim (köprü görselinin kutusunda, 0..1)
/** Taşların yeri: köprünün tahta yolu boyunca, bir aşağı bir yukarı (basamak taşları gibi) */
const TAS_YER: [number, number][] = [
  [0.235, 0.69],
  [0.335, 0.5],
  [0.445, 0.6],
  [0.555, 0.39],
  [0.665, 0.52],
  [0.775, 0.36],
];
/** Mino ile Kino'nun ayaklarının yeri: başta sol kıyıda, şenlikte karşı kıyıda; yürüyüş köprünün üstünden */
const IKILI_BAS: [number, number] = [0.13, 0.9];
const IKILI_SON: [number, number] = [0.87, 0.74];
const YURUYUS: [number, number][] = [IKILI_BAS, [0.27, 0.71], [0.42, 0.53], [0.57, 0.47], [0.72, 0.47], IKILI_SON];

// ---------------------------------------------------------------- rozet
/** "Kelime Ustası" rozeti: Gemini'nin rozeti gelene kadar madalyanın ortasında köprü */
export function kelimeRozeti(): string {
  const ozel = kelimeGorsel('okul/kelime/rozet-kelime');
  if (ozel) return `<img class="ok-resim ok-rozet-resim" src="${ozel}" alt="" draggable="false">`;
  return `<span class="ok-k-rozet">${kirpik('okul/rozet-sayi', 'ok-rozet-resim')}<span class="ok-k-rozet-ic"><img src="${kelimeGorsel('okul/kopru')}" alt="" draggable="false"></span></span>`;
}

// ---------------------------------------------------------------- Mino ile Kino
function ikili(): { el: HTMLElement; mino: Mino; kino: Karakter; kapat: () => void } {
  const mino = new Mino();
  const kino = new Karakter('kino', h('div'));
  mino.el.addEventListener('pointerdown', () => !AZ_HAREKET && mino.tepki('gidik'));
  const kinoKap = h('div.ok-ikili-kino', { style: `--ko:${KINO_ORAN.toFixed(3)}` }, h('i.ok-golge'), kino.el);
  kinoKap.addEventListener('pointerdown', () => {
    efekt.dokunma();
    if (!AZ_HAREKET) void kino.oynat('sevin', 800);
  });
  return {
    el: h('div.ok-ikili', {}, h('div.ok-ikili-mino', {}, mino.el), kinoKap),
    mino,
    kino,
    kapat() {
      mino.kapat();
      kino.kapat();
    },
  };
}

// ---------------------------------------------------------------- ekran
export function kopruEkrani(app: Uygulama): Ekran {
  const b = bolge('kelime')!;
  const y = (durum.i.yas ?? 4) as number;
  const etkinlikler = bolgeEtkinlikleri('kelime');
  const sira = etkinlikler.map((e) => e.id);
  const oynanan = oynananlar('kelime', y);
  const oneri = siradaki(kayit, oynanan);
  const kk = kopruYukle();
  // gösterim / test: kayıt sıfırlandıysa köprü de sıfırlanır
  kk.gorulen = kk.gorulen.filter((id) => kayit.biten.includes(id));
  if (!oynanan.every((id) => kayit.biten.includes(id))) kk.gecti = false;
  const yeni = yeniTaslar(sira, kayit.biten, kk.gorulen);
  const tamam = oynanan.length > 0 && oynanan.every((id) => kayit.biten.includes(id));

  const ikiz = ikili();
  const tasDurum = (id: string) => (kayit.biten.includes(id) ? 'bitti' : id === oneri ? 'oneri' : 'bos');
  const taslar = etkinlikler.map((e, i) => {
    const [x, yy] = TAS_YER[i % TAS_YER.length];
    const d = tasDurum(e.id);
    const t = h(
      'button.ok-kp-tas',
      { type: 'button', 'data-etkinlik': e.id, 'data-durum': yeni.includes(e.id) ? 'bos' : d, style: `left:${x * 100}%;top:${yy * 100}%;--i:${i}`, 'aria-label': e.ad },
      h('span.ok-kp-yuva', { 'aria-hidden': 'true' }),
      h('span.ok-kp-tas-resim', { 'aria-hidden': 'true' }, h('img', { src: kelimeGorsel('film/esya/tas'), alt: '', draggable: 'false' })),
      h('span.ok-kp-simge', { html: etkinlikSimgesi(e.id) }),
      h('b.ok-kp-no', {}, String(i + 1)),
    );
    t.addEventListener('click', () => {
      if (!yasUygun(e, y)) return;
      if (!erisimVarMi(`okul/${e.id}`, app.kok)) return;
      efekt.secim();
      app.git('etkinlik', { id: e.id });
    });
    return t;
  });
  const ikiliYer = h('div.ok-kp-ikili', {}, ikiz.el);
  // karşı yakadaki şenlik: flama ve balonlar (şenlikte belirir)
  const flama = h(
    'div.ok-kp-senlik',
    { 'aria-hidden': 'true' },
    h('img.ok-kp-flama', { src: kelimeGorsel('parti/flama'), alt: '', draggable: 'false' }),
    h('img.ok-kp-balon', { src: kelimeGorsel('film/esya/balon'), alt: '', draggable: 'false' }),
  );
  const rozetEl = kayit.rozet.includes('kelime') ? h('div.ok-kp-rozet', { html: kelimeRozeti(), 'aria-label': b.rozet }) : null;
  const sahne = h(
    'div.ok-kp-sahne',
    { 'data-tamam': tamam ? '1' : '0' },
    h('img.ok-kp-kopru', { src: kelimeGorsel('okul/kopru'), alt: '', draggable: 'false' }),
    flama,
    ...taslar,
    ikiliYer,
    rozetEl,
  );
  const yerlestir = (p: [number, number]) => {
    ikiliYer.style.left = `${p[0] * 100}%`;
    ikiliYer.style.top = `${p[1] * 100}%`;
  };
  yerlestir(kk.gecti ? IKILI_SON : IKILI_BAS);
  if (kk.gecti) sahne.dataset.senlik = '1';

  const el = h(
    'div.ok-kopru-ekran',
    { 'data-bolge': 'kelime', style: `--r:${b.renk}` },
    h('div.ok-park', { 'aria-hidden': 'true' }, h('div.ok-gok', { style: `background-image:url("${parkAdres('arka-uzak')}")` }), h('div.ok-on', { style: `background-image:url("${parkAdres('arka-on')}")` })),
    h(
      'div.ust-cubuk',
      {},
      yuvarlakDugme(IKON.geri, 'Harita', () => app.git('acilis'), 'kucuk'),
      h('div.orta', {}, h('h1.ok-baslik', {}, b.ad)),
      h('div.ust-grup', {}, albumDugmesi(app), sesDugmesi()),
    ),
    h('div.ok-kp-kap', {}, sahne),
  );
  const efektK = new Efekt(el);
  el.append(efektK.el);

  let kapandi = false;
  const zamanlar: number[] = [];
  const bekle = (ms: number) => new Promise<void>((r) => zamanlar.push(window.setTimeout(r, sure(ms))));

  /** Taş yerine düşer: yukarıdan gelir, oturur, tık + parıltı */
  async function tasKoy(t: HTMLElement) {
    t.dataset.durum = 'bitti';
    t.classList.add('ok-kp-yeni');
    await bekle(380);
    if (kapandi) return;
    ses.dus();
    ses.tik();
    const [x, yy] = efektK.merkez(t);
    efektK.parilti(x, yy, 10);
    await bekle(260);
  }

  /** Mino ile Kino köprüden karşıya yürür (yalnız transform), sonra şenlik */
  async function karsiyaGec() {
    const W = sahne.clientWidth;
    const H = sahne.clientHeight;
    ikiliYer.classList.add('ok-kp-yuruyor');
    if (!AZ_HAREKET) void ikiz.kino.oynat('yuru', 3200);
    const [x0, y0] = IKILI_BAS;
    const a = ikiliYer.animate(
      YURUYUS.map(([x, yy], i) => ({ transform: `translate(${(x - x0) * W}px, ${(yy - y0) * H - (i % 2 ? 10 : 0)}px)`, offset: i / (YURUYUS.length - 1) })),
      { duration: sure(3200), easing: 'linear', fill: 'forwards' },
    );
    if (!AZ_HAREKET) {
      for (let i = 0; i < 6; i++) zamanlar.push(window.setTimeout(() => !kapandi && ikiz.mino.tepki('zipla', 0.5), sure(i * 520)));
    }
    await a.finished.catch(() => undefined);
    if (kapandi) return;
    a.cancel();
    yerlestir(IKILI_SON);
    ikiliYer.classList.remove('ok-kp-yuruyor');
    // şenlik: flama ve balonlar karşı yakada, konfeti, dans
    sahne.dataset.senlik = '1';
    ses.sihir();
    efekt.konfeti();
    konfetiPatlat(el, el.clientWidth * 0.72, el.clientHeight * 0.35, AZ_HAREKET ? 0 : 110);
    if (!AZ_HAREKET) {
      ikiz.mino.tepki('dans', 2);
      void ikiz.kino.oynat('dans', 2000);
    }
    await konus(K.mino.senlik);
  }

  void (async () => {
    await bekle(TEST_MODU ? 20 : 450);
    if (kapandi) return;
    if (yeni.length) {
      for (const id of yeni) {
        const t = taslar[sira.indexOf(id)];
        if (t) await tasKoy(t);
        if (kapandi) return;
      }
      kk.gorulen = [...new Set([...kk.gorulen, ...yeni])];
      kopruKaydet(kk);
      if (!tamam) {
        // sıradaki durak yeniden parlar
        for (const t of taslar) t.dataset.durum = tasDurum(t.dataset.etkinlik ?? '');
        if (!AZ_HAREKET) ikiz.mino.tepki('sevinc', 1);
        await konus(K.mino.tas);
      }
    } else {
      await konus(kayit.biten.some((id) => sira.includes(id)) ? O.mino.harita : K.mino.kopru);
    }
    if (kapandi) return;
    if (tamam && !kk.gecti) {
      sahne.dataset.tamam = '1';
      await konus(K.mino.bitti);
      if (kapandi) return;
      await karsiyaGec();
      if (kapandi) return;
      kk.gecti = true;
      kopruKaydet(kk);
    }
    el.dataset.hazir = '1';
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      zamanlar.forEach(clearTimeout);
      ikiz.kapat();
    },
  };
}

function albumDugmesi(app: Uygulama): HTMLElement {
  const d = yuvarlakDugme(IKON.album, O.arayuz.album, () => app.git('album', { donus: 'bolge', bolge: 'kelime' }), 'kucuk ok-album-dugme');
  if (kayit.bekleyen.length) d.append(h('span.rozet', {}, String(kayit.bekleyen.length)));
  return d;
}
