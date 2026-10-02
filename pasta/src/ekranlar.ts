/**
 * Mino'nun Pasta Otobüsü: açılış (otobüs parkta, 3 gün tablosu) ve akşam (kumbara sayımı, dükkân rafı).
 */
import P from '../../content/pasta.json';
import { efekt, KINO_SESI, konus } from '../../src/audio/ses';
import { Mino } from '../../src/mino/mino';
import { bekle, h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { MinoCanli } from '../../pazar/src/mino-canli';
import { JETON, KUMBARA, OTOBUS, SAPKA, kalipSvg, kremaSvg, susKabiSvg, urunSvg } from './cizim';
import { AZ_HAREKET, Efekt, salla } from './gorsel';
import { boyaUygula, minoSapkaTak, parkKatmanlari, unluKino } from './gun';
import { gunBitti, kaydet, kayit } from './kayit';
import { alinabilir, BOYA, GUNLER, RAF, satinAl, sayim, type Gun, type RafUrunu } from './model';
import { ses } from './sesler';

const A = P.arayuz;

function logo(): HTMLElement {
  const harfler = [...A.baslik_alt].map((c, i) => h('span', { style: `--i:${i}` }, c));
  return h('div.ps-logo', { role: 'img', 'aria-label': `${A.baslik_ust} ${A.baslik_alt}` }, h('span.ps-logo-ust', {}, A.baslik_ust), h('span.ps-logo-alt', {}, ...harfler));
}

/** Kumbara rozeti: domuzcuk ve içindeki jeton sayısı */
function kumbaraRozet(): { el: HTMLElement; sayi: HTMLElement } {
  const sayi = h('b.ps-kumbara-sayi', {}, String(kayit.jeton));
  return { el: h('div.ps-kumbara-rozet', { role: 'img', 'aria-label': `Kumbara: ${kayit.jeton}` }, h('span.ps-kumbara-ikon', { html: KUMBARA }), sayi), sayi };
}

// ---------------------------------------------------------------- Açılış
export function acilisEkrani(app: Uygulama): Ekran {
  const mino = new Mino();
  minoSapkaTak(mino);
  const kino = unluKino();
  const minoCanli = new MinoCanli(mino, { urunVar: () => true, musteriVar: () => false });
  const selam = window.setTimeout(() => mino.tepki('selam'), sure(500));
  mino.el.addEventListener('pointerdown', () => mino.tepki('zipla'));
  kino.el.addEventListener('pointerdown', () => {
    efekt.dokunma();
    void kino.oynat('sevin', 900);
  });
  const otobus = h('div.ps-otobus.ps-acilis-otobus', { html: OTOBUS });
  otobus.addEventListener('pointerdown', () => {
    ses.korna();
    salla(otobus, 'ps-zipla');
  });

  // gün tablosu: Gün 1, 2, 3 (yer ve ürün resimli; kilitli günde asma kilit, biten günde yıldız)
  const kartlar = ([1, 2, 3] as Gun[]).map((g) => {
    const acik = g <= kayit.acikGun;
    const biten = kayit.biten.includes(g);
    const urunler = g === 3 ? [urunSvg({ urun: 'kurabiye', sekil: 'yildiz', hal: 'pismis', renk: 'mavi', susler: ['cilek'] }), urunSvg({ urun: 'kapkek', sekil: null, hal: 'pismis', yigin: ['pembe', 'pembe'] })] : g === 2 ? [urunSvg({ urun: 'kurabiye', sekil: 'kalp', hal: 'pismis', renk: 'pembe', susler: ['cilek', 'cilek'] })] : [urunSvg({ urun: 'kurabiye', sekil: 'yuvarlak', hal: 'pismis', renk: 'pembe' })];
    const b = h(
      `button.ps-gun-kart${acik ? '' : '.ps-kilitli'}${biten ? '.ps-biten' : ''}${acik && !biten ? '.ps-siradaki' : ''}`,
      { type: 'button', 'data-gun': String(g), 'aria-label': `${A.gun.replace('{gun}', String(g))} ${GUNLER[g].yer === 'okul' ? A.okul : A.park}`, style: `--i:${g}` },
      h('b.ps-gun-no', {}, String(g)),
      h('span.ps-gun-urun', { html: urunler.join('') }),
      h('span.ps-gun-yer', {}, GUNLER[g].yer === 'okul' ? A.okul : A.park),
      biten ? h('i.ps-gun-yildiz', {}, svg(IKON.yildiz)) : null,
      acik ? null : h('i.ps-gun-kilit', { html: KILIT }),
    );
    b.addEventListener('click', async () => {
      if (!acik) {
        efekt.kilitli();
        salla(b, 'ps-hayir');
        return;
      }
      efekt.secim();
      salla(b, 'ps-zipla');
      await bekle(sure(220));
      app.git('gun', { gun: g });
    });
    return b;
  });
  const cikis = app.secenekler.cikis;
  const kumbara = kumbaraRozet();
  const el = h(
    'div.ps-acilis',
    {},
    ...parkKatmanlari('park'),
    h('div.ust-cubuk', {}, cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : h('div', { style: 'width:56px' }), h('div.orta'), kumbara.el, sesDugmesi()),
    h('div.ps-acilis-ic', {}, logo(), h('div.ps-acilis-sahne', {}, otobus, h('div.ps-acilis-mino', {}, mino.el), h('div.ps-acilis-kino', {}, kino.el)), h('div.ps-gunler', {}, ...kartlar)),
  );
  boyaUygula(el);
  return {
    el,
    kapat() {
      clearTimeout(selam);
      minoCanli.kapat();
      mino.kapat();
      kino.kapat();
    },
  };
}

const KILIT = `<svg viewBox="0 0 40 44" aria-hidden="true"><path d="M11 20V13A9 9 0 0 1 29 13V20" fill="none" stroke="#3A1210" stroke-width="5"/><path d="M11 20V13A9 9 0 0 1 29 13V20" fill="none" stroke="#C9D4DE" stroke-width="2.4"/><rect x="5" y="19" width="30" height="22" rx="6" fill="#FFD23F" stroke="#3A1210" stroke-width="4"/><circle cx="20" cy="29" r="3.5" fill="#3A1210"/></svg>`;

// ---------------------------------------------------------------- Akşam
function rafIkon(u: RafUrunu): string {
  switch (u.tur) {
    case 'sapka':
      return SAPKA;
    case 'kalip':
      return kalipSvg('ay');
    case 'sus':
      return susKabiSvg(u.deger as 'muz' | 'cikolata');
    case 'renk':
      return kremaSvg('mor');
    case 'boya': {
      const b = BOYA[u.deger] ?? BOYA.pembe;
      return `<div class="ps-raf-otobus" style="--boya:${b.govde};--boya-koyu:${b.koyu}">${OTOBUS}</div>`;
    }
  }
}

export function aksamEkrani(app: Uygulama, p: { gun?: Gun; kazanc?: number } = {}): Ekran {
  const gun = (p.gun ?? 1) as Gun;
  const kazanc = Math.max(0, Math.floor(p.kazanc ?? 0));
  gunBitti(gun);
  let kapandi = false;
  const efekt_ = new Efekt(app.kok);
  const mino = new Mino();
  minoSapkaTak(mino);
  const kino = unluKino();
  const otobus = h('div.ps-otobus.ps-aksam-otobus.ps-acik', { html: OTOBUS });

  // tezgâhta günün jetonları; kumbaraya dokununca sayılarak içine düşer
  const yigin = h('div.ps-aksam-jetonlar', {}, ...Array.from({ length: kazanc }, (_, i) => h('i.ps-aksam-jeton', { html: JETON, style: `--i:${i};--x:${(i % 6) * 15 - 37}px;--y:${-Math.floor(i / 6) * 9}px` })));
  const kumbaraSayi = h('b.ps-kumbara-sayi', {}, String(kayit.jeton));
  const kumbara = h('button.ps-kumbara', { type: 'button', 'aria-label': 'Kumbara', html: KUMBARA }, kumbaraSayi);
  const sayac = h('b.ps-sayac');
  const raf = h('div.ps-raf', { hidden: true });
  const tamam = h('button.dugme.ps-tamam', { type: 'button', hidden: true }, svg(IKON.onay), A.bitti);
  const el = h(
    'div.ps-aksam',
    {},
    ...parkKatmanlari(GUNLER[gun].yer),
    h('div.ps-aksam-gok', { 'aria-hidden': 'true' }),
    h('div.ust-cubuk', {}, h('div', { style: 'width:56px' }), h('div.orta', {}, h('div.baslik-balon.ps-aksam-baslik', {}, h('span', {}, A.gun.replace('{gun}', String(gun))))), sesDugmesi()),
    h('div.ps-aksam-ic', {}, h('div.ps-aksam-sahne', {}, otobus, h('div.ps-aksam-mino', {}, mino.el), h('div.ps-aksam-kino', {}, kino.el), h('div.ps-aksam-kasa', {}, yigin, kumbara, sayac)), raf, tamam),
    efekt_.el,
  );
  boyaUygula(el);

  let sayildi = kazanc === 0;
  const rafCiz = () => {
    raf.replaceChildren(
      ...RAF.map((u) => {
        const alindi = kayit.alinan.includes(u.id);
        const yeter = kayit.jeton >= u.fiyat;
        const fiyat = h('span.ps-fiyat', { 'aria-hidden': 'true' }, ...Array.from({ length: u.fiyat }, (_, i) => h(`i${i < kayit.jeton ? '.ps-var' : ''}`, { html: JETON })));
        const secili = u.tur === 'boya' && kayit.boya === u.deger;
        const b = h(
          `button.ps-raf-urun${alindi ? '.ps-alindi' : yeter ? '.ps-yeter' : '.ps-yetmez'}${secili ? '.ps-secili' : ''}`,
          { type: 'button', 'data-raf': u.id, 'aria-label': `${u.id} ${u.fiyat}` },
          h('span.ps-raf-resim', { html: rafIkon(u) }),
          alindi ? h('i.ps-raf-tamam', {}, svg(IKON.onay)) : fiyat,
        );
        b.addEventListener('click', () => rafBas(u, b));
        return b;
      }),
    );
  };
  async function rafBas(u: RafUrunu, b: HTMLElement) {
    if (kayit.alinan.includes(u.id)) {
      // alınmış boya: otobüs o renge boyanır (bedava)
      if (u.tur === 'boya') {
        kayit.boya = kayit.boya === u.deger ? 'pembe' : u.deger;
        kaydet();
        boyaUygula(el);
        ses.pof();
        rafCiz();
      } else salla(b, 'ps-zipla');
      return;
    }
    if (!alinabilir(kayit, u)) {
      // yetmedi: eksik jetonlar parlar
      efekt.kilitli();
      salla(b, 'ps-hayir');
      return;
    }
    const k = efekt_.merkez(kumbara);
    const hedef = efekt_.merkez(b);
    satinAl(kayit, u.id);
    if (u.tur === 'boya') kayit.boya = u.deger;
    kaydet();
    kumbaraSayi.textContent = String(kayit.jeton);
    await Promise.all(Array.from({ length: Math.min(u.fiyat, 10) }, (_, i) => efekt_.ucur(h('div.ps-ucan-jeton', { html: JETON }), k, hedef, { ms: 480, gecikme: i * 70, kavis: -70, boy1: 0.4 })));
    if (kapandi) return;
    efekt.kilitAcildi();
    efekt_.parilti(hedef[0], hedef[1], 12);
    efekt_.pof(hedef[0], hedef[1], 1.2);
    if (u.tur === 'sapka') {
      minoSapkaTak(mino);
      mino.tepki('sevinc');
    }
    if (u.tur === 'boya') boyaUygula(el);
    rafCiz();
    salla(raf.querySelector(`[data-raf="${u.id}"]`), 'ps-zipla');
  }

  async function say() {
    if (sayildi) return;
    sayildi = true;
    kumbara.classList.remove('ps-cagir');
    const { soz, adim } = sayim(kazanc);
    const jetonlar = [...yigin.children] as HTMLElement[];
    const hedef = efekt_.merkez(kumbara, 0.5, 0.25);
    let sayilan = 0;
    for (let i = 0; i < adim.length && !kapandi; i++) {
      const grup = jetonlar.splice(-adim[i]);
      const soyle = soz[i] ? konus(soz[i]) : Promise.resolve();
      await Promise.all(
        grup.map(async (j, k) => {
          const bas = efekt_.merkez(j);
          j.remove();
          await efekt_.ucur(h('div.ps-ucan-jeton', { html: JETON }), bas, hedef, { ms: 420, gecikme: k * 60, kavis: -80, boy1: 0.5, don: 200 });
          ses.singir(k);
        }),
      );
      sayilan += adim[i];
      kayit.jeton += adim[i];
      kumbaraSayi.textContent = String(kayit.jeton);
      sayac.textContent = String(sayilan);
      salla(kumbara, 'ps-zipla');
      await soyle;
      await bekle(sure(150));
    }
    kaydet();
    if (kapandi) return;
    efekt.dogru();
    efekt_.parilti(hedef[0], hedef[1], 10);
    await rafAc();
  }

  async function rafAc() {
    rafCiz();
    raf.hidden = false;
    tamam.hidden = false;
    el.classList.add('ps-raf-acik');
    mino.tepki('selam');
    await konus(P.mino.ne_alalim);
  }

  kumbara.addEventListener('click', () => {
    efekt.dokunma();
    if (!sayildi) void say();
    else salla(kumbara, 'ps-zipla');
  });

  tamam.addEventListener('click', async () => {
    if (kapandi) return;
    efekt.secim();
    tamam.disabled = true;
    // Kino tezgâhta kırıntıları yerken uyur; otobüsün kapağı kapanır
    el.classList.add('ps-kapaniyor');
    await kino.oynat('ye', 900);
    kino.ekHareket = (pz) => {
      pz.gozKapali = true;
      pz.kafa += 6;
      pz.kafaY += 1;
    };
    kino.konus(true);
    await konus(P.kino.uyku, KINO_SESI);
    kino.konus(false);
    otobus.classList.remove('ps-acik');
    ses.vuup();
    await bekle(AZ_HAREKET || TEST_MODU ? 50 : 900);
    if (!kapandi) app.git('acilis');
  });

  // açılış: "Bugünlük bu kadar!" söylendi (gün ekranında); şimdi kumbara
  void (async () => {
    await bekle(sure(300));
    if (kapandi) return;
    if (kazanc > 0) {
      kumbara.classList.add('ps-cagir');
      await konus(P.mino.kumbara);
    } else await rafAc();
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      mino.kapat();
      kino.kapat();
    },
  };
}
