/**
 * Pati Dükkânı v2 · ana ekran ("Benim Pati Dükkânım", ekip/senaryo/PATI-V2.md). Paket 1: vitrin + salon.
 *
 *  yaş   : iki büyük düğme (3-4, 5-6); dokunuş sesi de açar
 *  açılış: İLK KEZ (~12 sn): ışıklar sönük; Nehir abla gelir, "Bu dükkân artık senin!", kapı zili çalar, ışıklar yanar,
 *          yavrular sırayla bölmelerine hoplar; Nehir ilk jetonları kumbaraya atar ("İşte ilk jetonların!").
 *          SONRAKİLER (~4 sn): ışık, "Hoş geldin!", hayvanlar zıplar. Hayvanı olan çocuk salonda açar.
 *  vitrin: yavruyu seç, al (vitrin.ts) → salon: köşesine gelir, ad ve minder (salon.ts)
 *  salon : okşama, 3 kalp, dans, jeton; jetonla vitrinden yeni yavru
 *
 * İki panel yan yana bir şeritte (yatay kayma, büyütme yok). Paket 2 bu şeridi dükkânın bütün bölümlerine genişletir
 * (Kemirgen Rafı, Akvaryum …) ve Bakım Odası'nı ekler; paket 3 mağaza, ziyaretçi ve süsleri.
 *
 * Test: ?test=1&yas=kucuk|buyuk (yaş sorulmadan), &sifirla=1 (kayıt silinir), &jeton=N (kumbara), &panel=salon.
 * window.__pati: panel, jeton, kumbara, vitrin, salon, mesgul.
 */
import P from '../../content/pati.json';
import { efekt as genelEfekt } from '../../src/audio/ses';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { Efekt } from '../../kino-otobus/src/efekt';
import { onYukle } from '../../kino-otobus/src/yukle';
import { jetonUcur, Kumbara } from './arayuz';
import { baslangicJetonu } from './ekonomi';
import { HAYVAN_IDLERI, NEHIR2, type Yas } from './katalog';
import { kaydet, kayit, sifirla, type SahipHayvan } from './kayit';
import { Nehir } from './nehir';
import { Salon } from './salon';
import { ses } from './sesler';
import { DIS_VITRIN, hayvanAdresleri, hayvanGorseliVar, JETON, KUMBARA, NEHIR, pozAdresi, SALON, VITRIN } from './varliklar';
import { Vitrin } from './vitrin';

type Panel = 'vitrin' | 'salon';
const PANELLER: Panel[] = ['vitrin', 'salon'];
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));

export function dukkanEkrani(app: Uygulama): Ekran {
  let kapandi = false;
  let panel: Panel = 'vitrin';
  let acilisSuruyor = false;
  const yas = (): Yas => kayit.yas ?? 'kucuk';

  if (TEST_MODU && q.has('sifirla')) sifirla();
  if (TEST_MODU && q.has('jeton')) {
    kayit.jeton = Math.max(0, Number(q.get('jeton')) || 0);
    kayit.acildi = true;
    kaydet();
  }

  const el = h('div.pt-ekran.pt-v2', { 'data-panel': panel });
  const efekt = new Efekt(el);
  const nehir = new Nehir();
  const kumbara = new Kumbara(yas);
  kumbara.ayarla(kayit.jeton);

  const ortak = { efekt, nehir, kumbara, kayit, kaydet, yas };
  const salon = new Salon(ortak);
  const vitrin = new Vitrin({
    ...ortak,
    alindi: (s: SahipHayvan) => void yeniHayvan(s),
  });
  const serit = h('div.pt-serit', {}, vitrin.el, salon.el);

  // ---------------------------------------------------------------- üst çubuk: geri, panel düğmesi, kumbara, ses
  const geri = yuvarlakDugme(IKON.geri, 'Geri', () => app.secenekler.cikis?.());
  geri.classList.toggle('pt-gizli', !app.secenekler.cikis);
  /** Öbür panele geçiş düğmesi: resimli (vitrin: bir cam bölme kesiti; salon: çocuğun ilk hayvanı) */
  const gecis = h('button.pt-gecis', { type: 'button', 'aria-label': 'Dükkân' }, h('span.pt-gecis-resim'));
  gecis.addEventListener('click', () => {
    genelEfekt.secim();
    void panelGit(panel === 'vitrin' ? 'salon' : 'vitrin');
  });
  const ust = h('div.pt-ust', {}, geri, gecis, h('div.pt-ust-bosluk'), kumbara.el, sesDugmesi());
  el.append(serit, nehir.el, ust, efekt.el);

  function gecisGuncelle() {
    const sahip = kayit.hayvanlar[0];
    const goster = !!sahip && !acilisSuruyor;
    gecis.classList.toggle('pt-gizli', !goster);
    gecis.dataset.hedef = panel === 'vitrin' ? 'salon' : 'vitrin';
    const r = gecis.querySelector('.pt-gecis-resim') as HTMLElement;
    if (panel === 'vitrin' && sahip) {
      r.style.cssText = `background-image:url("${pozAdresi(sahip.id, 'bos').url}")`;
      r.dataset.tur = 'hayvan';
    } else {
      r.style.cssText = `background-image:url("${VITRIN}")`;
      r.dataset.tur = 'vitrin';
    }
  }

  // ---------------------------------------------------------------- paneller
  async function panelGit(p: Panel, ms = 650) {
    if (p === panel) return;
    if (panel === 'salon') salon.jetonlariTopla();
    salon.adlariKapat();
    panel = p;
    el.dataset.panel = p;
    const i = PANELLER.indexOf(p);
    const d = TEST_MODU ? 0 : sure(ms);
    serit.style.transition = d ? `transform ${d}ms cubic-bezier(.45,.05,.3,1)` : 'none';
    serit.style.transform = `translateX(${-i * 100}%)`;
    for (const x of [vitrin.el, salon.el]) x.toggleAttribute('data-panel-gizli', x.dataset.panel !== p);
    if (p === 'vitrin') vitrin.yenile();
    gecisGuncelle();
    await bekle(d);
  }

  async function yeniHayvan(s: SahipHayvan) {
    await bekle(500);
    await panelGit('salon', 800);
    await salon.yeniGeldi(s);
    gecisGuncelle();
  }

  // ---------------------------------------------------------------- açılış
  async function ilkAcilis() {
    acilisSuruyor = true;
    gecisGuncelle();
    el.classList.add('pt-karanlik');
    vitrin.bos = true;
    vitrin.yenile();
    await bekle(500);
    el.classList.add('pt-nehir-gel');
    await bekle(700);
    await nehir.soyle(NEHIR2.dukkan_senin).catch(() => undefined);
    // kapı zili, ışıklar yanar, yavrular gelir
    ses.zil();
    await bekle(300);
    el.classList.remove('pt-karanlik');
    await bekle(600);
    await vitrin.yavrularGelsin();
    // ilk jetonlar: Nehir abla kumbaraya atar
    const n = baslangicJetonu(yas());
    void nehir.soyle(NEHIR2.ilk_jetonlar);
    const r = nehir.el.getBoundingClientRect();
    const kaynak: [number, number] = [r.left + r.width * 0.6, r.top + r.height * 0.45];
    for (let i = 0; i < n && !kapandi; i++) {
      await jetonUcur(efekt, kaynak, kumbara.agiz(), 1, 380, 34);
      kumbara.ayarla(i + 1);
      kumbara.yut();
      ses.jeton(i);
      await bekle(n > 4 ? 80 : 150);
    }
    kayit.jeton = Math.max(kayit.jeton, n);
    kayit.acildi = true;
    kaydet();
    kumbara.ayarla(kayit.jeton);
    acilisSuruyor = false;
    gecisGuncelle();
  }

  async function donus() {
    el.classList.add('pt-nehir-gel');
    ses.zil();
    if (kayit.hayvanlar.length) await panelGit('salon', 0);
    await bekle(400);
    void nehir.soyle(NEHIR2.hos_geldin);
    if (panel === 'vitrin') await vitrin.selam();
    gecisGuncelle();
  }

  async function basla() {
    if (!kayit.acildi) await ilkAcilis();
    else await donus();
  }

  // ---------------------------------------------------------------- dükkânın önü (dis-vitrin, Gün 2 çizimi gelince)
  function disaridan(): Promise<void> {
    if (!DIS_VITRIN || kayit.acildi) return Promise.resolve();
    // KANCA (Gün 2): dükkânın önü; kapıya (ekrana) dokununca ya da 2,5 sn sonra zil çalar, içeri girilir
    return new Promise((bitti) => {
      const dis = h('button.pt-dis', { type: 'button', 'aria-label': 'Dükkânın kapısı', style: `background-image:url("${DIS_VITRIN}")` });
      el.append(dis);
      let oldu = false;
      const gir = () => {
        if (oldu) return;
        oldu = true;
        ses.zil();
        dis.classList.add('kapan');
        window.setTimeout(() => dis.remove(), sure(700));
        bitti();
      };
      dis.addEventListener('click', gir);
      window.setTimeout(gir, sure(2500));
    });
  }

  // ---------------------------------------------------------------- yaş seçimi
  const yasDugme = (y: Yas, yazi: string, resimler: string[]) => {
    const b = h(`button.pt-yas${kayit.yas === y ? '.pt-secili' : ''}`, { type: 'button', 'data-yas': y, 'aria-label': yazi }, h('span.pt-yas-resim', {}, ...resimler.map((u) => h('img', { src: u, alt: '' }))), h('b', {}, yazi));
    b.addEventListener('click', () => {
      if (!perde.isConnected || perde.classList.contains('kapan')) return;
      genelEfekt.secim();
      kayit.yas = y;
      kaydet();
      kumbara.ayarla(kayit.jeton);
      vitrin.yenile();
      perde.classList.add('kapan');
      window.setTimeout(() => perde.remove(), 400);
      void disaridan().then(basla);
    });
    return b;
  };
  const perde = h(
    'div.pt-yas-perde',
    { role: 'dialog', 'aria-label': 'Yaş' },
    h('h1.pt-baslik', {}, P.arayuz.baslik),
    h('div.pt-yas-kutu', {}, yasDugme('kucuk', P.arayuz.yas_kucuk, [pozAdresi('findik', 'bos').url]), yasDugme('buyuk', P.arayuz.yas_buyuk, [pozAdresi('findik', 'bos').url, pozAdresi('tarcin', 'bos').url])),
  );
  const yasKisayol = q.get('yas');
  if (!kayit.acildi) el.classList.add('pt-karanlik');
  if (TEST_MODU && (yasKisayol === 'kucuk' || yasKisayol === 'buyuk')) {
    kayit.yas = yasKisayol;
    kaydet();
    kumbara.ayarla(kayit.jeton);
    if (q.get('panel') === 'salon') void panelGit('salon', 0);
    void basla();
  } else el.append(perde);

  // görseller önceden çözülür (yavrular bölmeye gelirken boş kare görünmesin)
  const yukle = onYukle([VITRIN, SALON, NEHIR, JETON, KUMBARA, ...HAYVAN_IDLERI.filter(hayvanGorseliVar).flatMap(hayvanAdresleri)]);
  void yukle.hazir;
  for (const x of [vitrin.el, salon.el]) x.toggleAttribute('data-panel-gizli', x.dataset.panel !== panel);
  gecisGuncelle();

  if (TEST_MODU || document.body.dataset.onizleme) {
    (window as unknown as { __pati: unknown }).__pati = {
      panel: () => panel,
      acilis: () => acilisSuruyor,
      jeton: () => kayit.jeton,
      kumbara: () => kumbara.jeton,
      vitrin: () => vitrin.liste,
      salon: () => salon.durum,
      dusenJeton: () => salon.dusenJeton,
      hayvanlar: () => kayit.hayvanlar.map((x) => ({ ...x })),
      kalpKazan: (id: string) => salon.kalpKazan(id, 'sever'),
    };
  }

  return {
    el,
    kapat() {
      kapandi = true;
      vitrin.kapat();
      salon.kapat();
      nehir.kapat();
      void yukle;
    },
  };
}
