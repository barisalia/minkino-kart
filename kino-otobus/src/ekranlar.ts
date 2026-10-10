/**
 * Kino'nun Otobüsü: açılış (parkta otobüs, yaş seçimi, üç gün) ve akşam (kumbara sayımı, otobüs süs dükkânı).
 * Kilitler: Gün 1 ücretsiz, Gün 2-3 ve ilk iki süsten sonrakiler abonelikle (src/engine/erisim.ts); yaş ayarı
 * kilitlenmez. Web sitesinde hiçbir şey kilitli değil.
 */
import K from '../../content/kino-otobus.json';
import { erisimVarMi, kilitleriKur } from '../../src/abonelik/kilit';
import { efekt, KINO_SESI, konus } from '../../src/audio/ses';
import { bekle, h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { KALP, KILIT, KINO_KIRAZ_SAPKA } from './cizim';
import { AZ_HAREKET, Efekt, salla } from './efekt';
import { manzara } from './gun';
import { gunBitti, kaydet, kayit } from './kayit';
import { alinabilir, dukkan, GUN_SAYISI, GUNLER, sayim, satinAl, type Gun, type OtobusSusu, type Yas } from './model';
import { dondurmaciKino, kinoGiydir, otobusEl, otobusGuncelle, kapakAc } from './otobus';
import { ses } from './sesler';
import { adres, gorsel, type VarlikAdi } from './varliklar';

const A = K.arayuz;

function logo(): HTMLElement {
  const harfler = [...A.baslik_alt].map((c, i) => h('span', { style: `--i:${i}` }, c));
  return h('div.ko-logo', { role: 'img', 'aria-label': `${A.baslik_ust} ${A.baslik_alt}` }, h('span.ko-logo-ust', {}, A.baslik_ust), h('span.ko-logo-alt', {}, ...harfler));
}

/** Kumbara rozeti: kavanoz ve içindeki jeton */
function kumbaraRozet(): HTMLElement {
  return h('div.ko-kumbara-rozet', { role: 'img', 'aria-label': `Kumbara: ${kayit.jeton}` }, h('span.ko-kr-ikon', { html: gorsel('kumbara-kavanoz') }), h('b', {}, String(kayit.jeton)));
}

/** Yaş seçimi: iki büyük düğme (3-4, 5-6). İlk açılışta kendiliğinden; sonra üst çubuktaki küçük yaş düğmesiyle. */
function yasSec(kok: HTMLElement, bitti: (y: Yas) => void) {
  const dugme = (y: Yas, yazi: string, topSayisi: number) => {
    const b = h(
      `button.ko-yas-dugme${kayit.yas === y ? '.ko-secili' : ''}`,
      { type: 'button', 'data-yas': y, 'aria-label': yazi },
      h('span.ko-yas-resim', { html: Array.from({ length: topSayisi }, () => gorsel(y === 'kucuk' ? 'top-cilek' : 'top-vanilya')).join('') }),
      h('b', {}, yazi),
    );
    b.addEventListener('click', async () => {
      efekt.secim();
      salla(b, 'ko-zipla');
      kayit.yas = y;
      kaydet();
      await bekle(sure(200));
      perde.remove();
      bitti(y);
    });
    return b;
  };
  // ilk açılış: Gemini kapağı (Kino dondurma uzatıyor) tam ekran, yaş düğmeleri altta
  const kapak = adres('kapak');
  const perde = h(
    `div.ko-yas-perde${kapak ? '.ko-kapakli' : ''}`,
    { role: 'dialog', 'aria-label': 'Yaş', style: kapak ? `--kapak:url("${kapak}")` : undefined },
    h('div.ko-yas-kutu', {}, dugme('kucuk', A.yas_kucuk, 2), dugme('buyuk', A.yas_buyuk, 3)),
  );
  kok.append(perde);
}

// ---------------------------------------------------------------- Açılış
export function acilisEkrani(app: Uygulama): Ekran {
  const kino = dondurmaciKino(kayit.alinan.includes('kino-sapka'));
  kino.el.addEventListener('pointerdown', () => {
    efekt.dokunma();
    void kino.oynat('sevin', 900);
  });
  const otobus = otobusEl({ alinan: kayit.alinan, boya: kayit.boya, acik: true, sinif: 'ko-acilis-otobus' });
  otobus.addEventListener('pointerdown', () => {
    if (kayit.alinan.includes('korna')) ses.dondurmaKorna();
    else ses.korna();
    salla(otobus, 'ko-zipla');
  });

  // gün kartına iki kez dokunulursa gün ekranı iki kez kurulmasın (açılış cümlesi yarıda kesilir)
  let gidiliyor = false;
  let kapali = false;
  const kartlar = Array.from({ length: GUN_SAYISI }, (_, i) => (i + 1) as Gun).map((g) => {
    const sirasiGeldi = g <= kayit.acikGun;
    const biten = kayit.biten.includes(g);
    const yer = GUNLER[g].yer;
    const mutlu = kayit.mutlu[String(g)] ?? 0;
    const b = h(
      `button.ko-gun-kart${sirasiGeldi ? '' : '.ko-kilitli'}${biten ? '.ko-biten' : ''}${sirasiGeldi && !biten ? '.ko-siradaki' : ''}`,
      { type: 'button', 'data-gun': String(g), 'data-yer': yer, 'aria-label': A.gun.replace('{gun}', String(g)), style: `--i:${g}` },
      h('span.ko-gun-manzara', { 'aria-hidden': 'true' }, manzara(yer)),
      h('b.ko-gun-no', {}, String(g)),
      h('span.ko-gun-kalpler', { 'aria-hidden': 'true' }, ...Array.from({ length: GUNLER[g].hedef }, (_, j) => h(`i${j < mutlu ? '.dolu' : ''}`, { html: KALP }))),
      sirasiGeldi ? null : h('i.ko-gun-kilit', { html: KILIT }),
    );
    b.addEventListener('click', async () => {
      if (gidiliyor) return;
      if (!sirasiGeldi) {
        efekt.kilitli();
        salla(b, 'ko-hayir');
        return;
      }
      if (!erisimVarMi(`kino-otobus/gun-${g}`, app.kok)) return;
      gidiliyor = true;
      efekt.secim();
      salla(b, 'ko-zipla');
      await bekle(sure(200));
      if (!kapali) app.git('gun', { gun: g });
    });
    return b;
  });
  const kilitBirak = kilitleriKur(kartlar.map((b) => [b, `kino-otobus/gun-${b.dataset.gun}`] as [HTMLElement, string]));
  const cikis = app.secenekler.cikis;
  const yasDugme = h('button.ko-yas-cip', { type: 'button', 'aria-label': 'Yaş' }, kayit.yas === 'buyuk' ? A.yas_buyuk : A.yas_kucuk);
  const el = h(
    'div.ko-acilis',
    {},
    manzara('park'),
    h('div.ust-cubuk.ko-ust', {}, cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : h('div', { style: 'width:56px' }), h('div.orta'), yasDugme, kumbaraRozet(), sesDugmesi()),
    h('div.ko-acilis-ic', {}, logo(), h('div.ko-acilis-sahne', {}, otobus, h('div.ko-acilis-kino', {}, kino.el)), h('div.ko-gunler', {}, ...kartlar)),
  );
  yasDugme.addEventListener('click', () => {
    efekt.dokunma();
    yasSec(el, (y) => (yasDugme.textContent = y === 'buyuk' ? A.yas_buyuk : A.yas_kucuk));
  });
  // ilk açılış: yaş sorulur
  if (!kayit.yas) yasSec(el, (y) => (yasDugme.textContent = y === 'buyuk' ? A.yas_buyuk : A.yas_kucuk));
  const selam = window.setTimeout(() => void kino.oynat('sevin', 900), sure(500));
  return {
    el,
    kapat() {
      kapali = true;
      clearTimeout(selam);
      kilitBirak();
      kino.kapat();
    },
  };
}

// ---------------------------------------------------------------- Akşam
/** Dükkândaki süsün resmi */
function susResmi(s: OtobusSusu): string {
  const ad: Partial<Record<OtobusSusu['tur'], VarlikAdi>> = { tabela: 'sus-kemik-tabela', flama: 'sus-flama', kulah: 'sus-cati-kulah', ampul: 'sus-ampul', jant: 'sus-jant' };
  if (s.tur === 'boya') return `<i class="ko-boya-kova" data-boya="${s.deger}"></i>`;
  if (s.tur === 'korna') return `<i class="ko-korna-ikon">${svg(IKON.hoparlor).outerHTML}</i>`;
  // Kino'nun kiraz tepeli şapkası: görseli yoksa iskeletteki kod çizimiyle aynı
  if (s.tur === 'sapka') return adres('sus-kino-kiraz-sapka') ? gorsel('sus-kino-kiraz-sapka') : `<svg class="ko-yt" viewBox="770 30 420 420" aria-hidden="true">${KINO_KIRAZ_SAPKA}</svg>`;
  return gorsel(ad[s.tur]!);
}

export function aksamEkrani(app: Uygulama, p: { gun?: number; kazanc?: number; mutlu?: number; kaydedildi?: boolean } = {}): Ekran {
  const gun = Math.max(1, Math.min(GUN_SAYISI, Math.floor(p.gun ?? 1))) as Gun;
  const kazanc = Math.max(0, Math.floor(p.kazanc ?? 0));
  const yas = kayit.yas ?? 'kucuk';
  // günün jetonları son müşteri ödeyince kaydedildi (gun.ts → gunuKaydet); sayım yalnız gösterir. Test kısayolunda
  // (?test=1&ekran=aksam) burada kaydedilir.
  const oncesi = p.kaydedildi ? Math.max(0, kayit.jeton - kazanc) : kayit.jeton;
  if (!p.kaydedildi) {
    gunBitti(kayit, gun, kazanc, p.mutlu ?? 0);
    kaydet();
  }
  let kapandi = false;
  const efekt_ = new Efekt(app.kok);
  const kino = dondurmaciKino(kayit.alinan.includes('kino-sapka'));
  const otobus = otobusEl({ alinan: kayit.alinan, boya: kayit.boya, acik: true, sinif: 'ko-aksam-otobus' });
  otobus.addEventListener('pointerdown', () => {
    if (kayit.alinan.includes('korna')) ses.dondurmaKorna();
    else ses.korna();
    salla(otobus, 'ko-zipla');
  });

  // tezgâhta günün jetonları (beşli sıralar, tezgâh çizgisinde)
  const SIRA = 5;
  const yigin = h(
    'div.ko-aksam-jetonlar',
    {},
    ...Array.from({ length: kazanc }, (_, i) => h('i.ko-aksam-jeton', { html: gorsel('jeton'), style: `--n:${i % SIRA};--r:${Math.floor(i / SIRA)}` })),
  );
  const kumbaraSayi = h('b.ko-kumbara-sayi', {}, String(oncesi));
  const kumbara = h('button.ko-kumbara.ko-aksam-kumbara', { type: 'button', 'aria-label': 'Kumbara', html: gorsel('kumbara-kavanoz') }, kumbaraSayi);
  const sayac = h('b.ko-sayac', { 'aria-hidden': 'true' });
  const raf = h('div.ko-dukkan', { hidden: true });
  const tamam = h('button.ko-tamam', { type: 'button', hidden: true, 'aria-label': A.bitti }, svg(IKON.onay));
  const el = h(
    'div.ko-aksam',
    {},
    manzara(GUNLER[gun].yer),
    h('div.ko-aksam-gok', { 'aria-hidden': 'true' }),
    h('div.ust-cubuk.ko-ust', {}, h('div', { style: 'width:56px' }), h('div.orta', {}, h('div.baslik-balon.ko-aksam-baslik', {}, h('b.ko-aksam-no', { 'aria-label': A.gun.replace('{gun}', String(gun)) }, String(gun)))), sesDugmesi()),
    h(
      'div.ko-aksam-ic',
      {},
      h('div.ko-aksam-sahne', {}, otobus, h('div.ko-aksam-kino', {}, kino.el)),
      h('div.ko-aksam-sag', {}, h('div.ko-aksam-tezgah', {}, yigin, h('div.ko-aksam-kavanoz', {}, h('i.ko-golge'), kumbara, sayac)), raf),
      tamam,
    ),
    efekt_.el,
  );

  let sayildi = kazanc === 0;
  let sayimBasladi = false;
  const kilitler: [HTMLElement, string][] = [];
  let kilitBirak = () => {};
  function rafCiz() {
    kilitBirak();
    kilitler.length = 0;
    raf.replaceChildren(
      ...dukkan(gun).map((u) => {
        const alindi = kayit.alinan.includes(u.id);
        const yeter = kayit.jeton >= u.fiyat;
        const secili = u.tur === 'boya' && kayit.boya === u.deger;
        const fiyat = h('span.ko-fiyat', { 'aria-hidden': 'true', 'data-fiyat': String(u.fiyat) }, ...Array.from({ length: u.fiyat }, (_, i) => h(`i${i < kayit.jeton ? '.ko-var' : ''}`, { html: gorsel('jeton') })));
        const b = h(
          `button.ko-dukkan-urun${alindi ? '.ko-alindi' : yeter ? '.ko-yeter' : '.ko-yetmez'}${secili ? '.ko-secili' : ''}`,
          { type: 'button', 'data-sus': u.id, 'aria-label': `${u.id} ${u.fiyat}` },
          h('span.ko-dukkan-resim', { html: susResmi(u) }),
          alindi ? h('i.ko-dukkan-tamam', {}, svg(IKON.onay)) : fiyat,
        );
        if (!u.ucretsiz && !alindi) kilitler.push([b, 'kino-otobus/susler']);
        b.addEventListener('click', () => void rafBas(u, b));
        return b;
      }),
    );
    kilitBirak = kilitleriKur(kilitler);
  }
  /** jetonları uçmakta olan süs: o sırada gelen ikinci dokunuş yeni alınanı geri almasın */
  let ucan: string | null = null;
  async function rafBas(u: OtobusSusu, b: HTMLElement) {
    if (ucan === u.id) return;
    if (kayit.alinan.includes(u.id)) {
      // alınmış boya: otobüs o renge boyanır (bir daha dokununca buz mavisine döner)
      if (u.tur === 'boya') {
        kayit.boya = kayit.boya === u.deger ? 'buz' : u.deger!;
        kaydet();
        otobusGuncelle(otobus, { alinan: kayit.alinan, boya: kayit.boya, acik: true });
        ses.tik();
        rafCiz();
      } else if (u.tur === 'korna') ses.dondurmaKorna();
      else salla(b, 'ko-zipla');
      return;
    }
    if (!u.ucretsiz && !erisimVarMi('kino-otobus/susler', app.kok)) return;
    if (!alinabilir(kayit, u)) {
      // yetmedi: "yeter mi?" fiyatın jetonları kumbaradakilerle karşılaştırılır
      efekt.kilitli();
      salla(b, 'ko-hayir');
      return;
    }
    const k = efekt_.merkez(kumbara);
    const hedef = efekt_.merkez(b);
    satinAl(kayit, u.id);
    if (u.tur === 'boya') kayit.boya = u.deger!;
    kaydet();
    kumbaraSayi.textContent = String(kayit.jeton);
    ucan = u.id;
    await Promise.all(Array.from({ length: u.fiyat }, (_, i) => efekt_.ucur(h('div.ko-ucan-jeton', { html: gorsel('jeton') }), k, hedef, { ms: 420, gecikme: i * 60, kavis: -70, boy1: 0.4 })));
    ucan = null;
    if (kapandi) return;
    efekt.kilitAcildi();
    // süs otobüse anında takılır
    otobusGuncelle(otobus, { alinan: kayit.alinan, boya: kayit.boya, acik: true });
    const [ox, oy] = efekt_.merkez(otobus, 0.5, 0.45);
    efekt_.parilti(ox, oy, 12);
    efekt_.pof(ox, oy, 1.4);
    salla(otobus, 'ko-zipla');
    if (u.tur === 'korna') ses.dondurmaKorna();
    if (u.tur === 'sapka') {
      kinoGiydir(kino, true);
      void kino.oynat('sevin', 900);
    }
    rafCiz();
    salla(raf.querySelector(`[data-sus="${u.id}"]`), 'ko-zipla');
  }

  async function say() {
    if (sayildi) return;
    sayildi = true;
    sayimBasladi = true;
    kumbara.classList.remove('ko-cagir');
    const { soz, adim } = sayim(kazanc, yas);
    const jetonlar = [...yigin.children] as HTMLElement[];
    const hedef = efekt_.merkez(kumbara, 0.5, 0.25);
    let sayilan = 0;
    for (let i = 0; i < adim.length && !kapandi; i++) {
      const grup = jetonlar.splice(0, adim[i]);
      const soyle = soz[i] ? konus(soz[i]) : Promise.resolve();
      await Promise.all(
        grup.map(async (j, k) => {
          const bas = efekt_.merkez(j);
          j.style.visibility = 'hidden';
          await efekt_.ucur(h('div.ko-ucan-jeton', { html: gorsel('jeton') }), bas, hedef, { ms: 400, gecikme: k * 60, kavis: -80, boy1: 0.5, don: 200 });
          ses.singir(k);
        }),
      );
      sayilan += adim[i];
      kumbaraSayi.textContent = String(oncesi + sayilan);
      sayac.textContent = String(sayilan);
      salla(sayac, 'ko-zipla');
      salla(kumbara, 'ko-zipla');
      await soyle;
      await bekle(sure(120));
    }
    if (kapandi) return;
    kumbaraSayi.textContent = String(kayit.jeton);
    efekt.dogru();
    efekt_.parilti(hedef[0], hedef[1], 10, 0.8, '#FFE45C');
    await dukkanAc();
  }

  async function dukkanAc() {
    rafCiz();
    raf.hidden = false;
    tamam.hidden = false;
    el.classList.add('ko-dukkan-acik');
    void kino.oynat('sevin', 800);
    await konus(K.mino.susleyelim);
  }

  kumbara.addEventListener('click', () => {
    efekt.dokunma();
    if (!sayildi) void say();
    else salla(kumbara, 'ko-zipla');
  });

  tamam.addEventListener('click', async () => {
    if (kapandi) return;
    efekt.secim();
    tamam.disabled = true;
    // Kino basamakta esner, yıldızlar çıkar, kapak kapanır
    el.classList.add('ko-kapaniyor');
    kino.ekHareket = (pz) => {
      pz.gozKapali = true;
      pz.kafa += 6;
      pz.kafaY += 1;
    };
    kino.konus(true);
    await konus(K.kino.uyku, KINO_SESI);
    kino.konus(false);
    kapakAc(otobus, false);
    ses.vuup(true);
    await bekle(AZ_HAREKET || TEST_MODU ? 50 : 900);
    if (!kapandi) app.git('acilis');
  });

  void (async () => {
    await bekle(sure(300));
    if (kapandi) return;
    if (kazanc > 0) {
      if (sayimBasladi) return;
      kumbara.classList.add('ko-cagir');
      await konus(K.mino.kumbara);
    } else await dukkanAc();
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      kilitBirak();
      kino.kapat();
    },
  };
}
