/**
 * Kino'nun Otobüsü: açılış (parkta otobüs, yaş seçimi, üç gün) ve gün sonu ödülü (V3 §5: üç kart, tek seçim).
 * Kilitler: Gün 1 ücretsiz, Gün 2-3 ve her kategorinin ilk ödülünden sonrakiler abonelikle (src/engine/erisim.ts →
 * kino-otobus/*); yaş ayarı kilitlenmez. Web sitesinde hiçbir şey kilitli değil.
 */
import K from '../../content/kino-otobus.json';
import { erisimVarMi, kilitleriKur } from '../../src/abonelik/kilit';
import { efekt, KINO_SESI, konus } from '../../src/audio/ses';
import { kilitli } from '../../src/engine/erisim';
import { bekle, h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { KALP, KILIT, KINO_KIRAZ_SAPKA } from './cizim';
import { AZ_HAREKET, Efekt, salla } from './efekt';
import { manzara } from './gun';
import { ozelSecimi } from './gun-ek';
import { gunBitti, kaydet, kayit } from './kayit';
import { kuleCiz } from './kule';
import { GUN_SAYISI, GUNLER, gunOdulleri, odulAl, OTOBUS_SUSLERI, type Gun, type OdulKarti, type OtobusSusu, type Sus, type Tat, type Yas } from './model';
import { dondurmaciKino, kinoGiydir, otobusEl, otobusGuncelle, kapakAc } from './otobus';
import { ses } from './sesler';
import { adres, gorsel, tatKabiAdi, topAdi, type VarlikAdi } from './varliklar';

const A = K.arayuz;
const sapkali = () => kayit.acilan.gorunum.includes('kino-sapka');

function logo(): HTMLElement {
  const harfler = [...A.baslik_alt].map((c, i) => h('span', { style: `--i:${i}` }, c));
  return h('div.ko-logo', { role: 'img', 'aria-label': `${A.baslik_ust} ${A.baslik_alt}` }, h('span.ko-logo-ust', {}, A.baslik_ust), h('span.ko-logo-alt', {}, ...harfler));
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
  const kino = dondurmaciKino(sapkali());
  kino.el.addEventListener('pointerdown', () => {
    efekt.dokunma();
    void kino.oynat('sevin', 900);
  });
  const otobus = otobusEl({ alinan: kayit.acilan.gorunum, boya: kayit.boya, acik: true, sinif: 'ko-acilis-otobus' });
  otobus.addEventListener('pointerdown', () => {
    if (kayit.acilan.gorunum.includes('korna')) ses.dondurmaKorna();
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
      // sabah: iki ya da daha çok yeni tat açıldıysa Kino kapları dizer, çocuk bugünün özel tadını seçer
      if (kayit.acilan.tat.length >= 2) {
        kayit.ozelTat = await ozelSecimi(el, kayit.acilan.tat.slice(-3));
        kaydet();
      }
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
    h('div.ust-cubuk.ko-ust', {}, cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : h('div', { style: 'width:56px' }), h('div.orta'), yasDugme, sesDugmesi()),
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

// ---------------------------------------------------------------- Gün sonu ödülü (üç kart)
/** Görünüm süsünün resmi (otobüs süsü, boya kovası, korna, Kino'nun kiraz şapkası) */
function susResmi(s: OtobusSusu): string {
  const ad: Partial<Record<OtobusSusu['tur'], VarlikAdi>> = { tabela: 'sus-kemik-tabela', flama: 'sus-flama', kulah: 'sus-cati-kulah', ampul: 'sus-ampul', jant: 'sus-jant' };
  if (s.tur === 'boya') return `<i class="ko-boya-kova" data-boya="${s.deger}"></i>`;
  if (s.tur === 'korna') return `<i class="ko-korna-ikon">${svg(IKON.hoparlor).outerHTML}</i>`;
  if (s.tur === 'sapka') return adres('sus-kino-kiraz-sapka') ? gorsel('sus-kino-kiraz-sapka') : `<svg class="ko-yt" viewBox="770 30 420 420" aria-hidden="true">${KINO_KIRAZ_SAPKA}</svg>`;
  return gorsel(ad[s.tur]!);
}

/** Kartın büyük resmi (yazı ve fiyat yok): tat kabı ve üstünde top; süs bir külahın tepesinde; görünüm; ısmarla kupası */
function kartResmi(k: OdulKarti): HTMLElement {
  const r = h('span.ko-kart-resim');
  if (!k.id) {
    const kule = kuleCiz({ kap: 'kupa', toplar: ['cilek', 'vanilya', 'cikolata'], sos: 'cilek', susler: ['kiraz'] }, { sinif: 'ko-kart-kule' });
    r.append(kule);
  } else if (k.kategori === 'tat') {
    r.append(h('span.ko-kart-kap', { html: gorsel(tatKabiAdi(k.id as Tat)) }), h('span.ko-kart-top', { html: gorsel(topAdi(k.id as Tat)) }));
  } else if (k.kategori === 'sus') {
    r.append(kuleCiz({ kap: 'kulah', toplar: ['vanilya'], sos: null, susler: [k.id as Sus, k.id as Sus] }, { sinif: 'ko-kart-kule' }));
  } else {
    const s = OTOBUS_SUSLERI.find((x) => x.id === k.id)!;
    if (s.tur === 'sapka' || s.tur === 'korna') r.innerHTML = susResmi(s);
    else {
      // otobüs süsü: küçük otobüsün üstünde (boya: otobüs o renkte)
      r.classList.add('ko-kart-otobus');
      r.append(otobusEl({ alinan: [k.id!], boya: s.tur === 'boya' ? s.deger! : 'buz', sinif: 'ko-kart-ob' }));
    }
  }
  return r;
}
/** Kartın adı (Mino söyler) */
function kartAdi(k: OdulKarti): string {
  const O = K.mino.odul as unknown as Record<string, Record<string, string>>;
  return k.id ? O[k.kategori][k.id] : K.mino.odul.ismarla;
}
/** Kartın kilidi: kategorinin ilk ödülü ve ısmarla ücretsiz; sonrakiler abonelikle */
const kartKilidi = (k: OdulKarti) => (k.ilk || !k.id ? null : 'kino-otobus/odul');

export function odulEkrani(app: Uygulama, p: { gun?: number; mutlu?: number; kaydedildi?: boolean } = {}): Ekran {
  const gun = Math.max(1, Math.min(GUN_SAYISI, Math.floor(p.gun ?? 1))) as Gun;
  // gün son müşteri ödeyince kaydedildi (gun.ts → gunuKaydet); test kısayolunda (?test=1&ekran=odul) burada
  if (!p.kaydedildi) {
    gunBitti(kayit, gun, p.mutlu ?? 0);
    kaydet();
  }
  let kapandi = false;
  const efekt_ = new Efekt(app.kok);
  const kino = dondurmaciKino(sapkali());
  const otobus = otobusEl({ alinan: kayit.acilan.gorunum, boya: kayit.boya, acik: true, sinif: 'ko-aksam-otobus' });
  otobus.addEventListener('pointerdown', () => {
    if (kayit.acilan.gorunum.includes('korna')) ses.dondurmaKorna();
    else ses.korna();
    salla(otobus, 'ko-zipla');
  });

  const odulKartlari = gunOdulleri(kayit.acilan);
  const kavanoz = h('div.ko-odul-kavanoz', { html: gorsel('kumbara-kavanoz') }, h('i.ko-kumbara-dolgu', { style: '--dolu:1' }));
  const kartDugmeleri = odulKartlari.map((k, i) =>
    h(
      `button.ko-kart${k.id ? '' : '.ko-kart-ismarla'}`,
      { type: 'button', 'data-kategori': k.kategori, 'data-id': k.id ?? 'ismarla', 'aria-label': kartAdi(k), style: `--i:${i}` },
      h('span.ko-kart-ic', {}, kartResmi(k)),
    ),
  );
  const kartlar = h('div.ko-kartlar', {}, ...kartDugmeleri);
  const tamam = h('button.ko-tamam.ko-odul-tamam', { type: 'button', hidden: true, 'aria-label': A.bitti }, svg(IKON.onay));
  const kinoKap = h('div.ko-aksam-kino', {}, kino.el);
  const el = h(
    'div.ko-aksam.ko-odul',
    {},
    manzara(GUNLER[gun].yer),
    h('div.ko-aksam-gok', { 'aria-hidden': 'true' }),
    h('div.ust-cubuk.ko-ust', {}, h('div', { style: 'width:56px' }), h('div.orta', {}, h('div.baslik-balon.ko-aksam-baslik', {}, h('b.ko-aksam-no', { 'aria-label': A.gun.replace('{gun}', String(gun)) }, String(gun)))), sesDugmesi()),
    h('div.ko-aksam-ic', {}, h('div.ko-aksam-sahne', {}, otobus, kinoKap), h('div.ko-odul-sag', {}, kavanoz, kartlar), tamam),
    efekt_.el,
  );
  const kilitBirak = kilitleriKur(
    kartDugmeleri.flatMap((b, i) => {
      const id = kartKilidi(odulKartlari[i]);
      return id ? [[b, id] as [HTMLElement, string]] : [];
    }),
  );

  let secilen = false;
  let onizlenen: HTMLElement | null = null;
  /** İlk dokunuş: ön izleme (Mino adını söyler, Kino tadına bakar ya da süsü gösterir); ikinci dokunuş: seçim */
  async function kartBas(b: HTMLElement, k: OdulKarti) {
    if (secilen || kapandi || !el.classList.contains('ko-kartlar-acik')) return;
    const kilit = kartKilidi(k);
    if (kilit && !erisimVarMi(kilit, app.kok)) return;
    efekt.dokunma();
    if (onizlenen !== b) {
      onizlenen?.classList.remove('ko-onizleme');
      onizlenen = b;
      b.classList.add('ko-onizleme');
      salla(b, 'ko-zipla');
      void konus(kartAdi(k));
      // Kino tadına bakar (tat, ısmarla) ya da süsü havada gösterir
      void kino.oynat(k.kategori === 'tat' || !k.id ? 'ye' : 'sevin', 800);
      if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 800);
      return;
    }
    await sec(b, k);
  }
  /** Seçim: kart yerine uçar (tat dolaba, süs rafa, görünüm otobüse / Kino'ya); öbürleri kavanoza geri girer */
  async function sec(b: HTMLElement, k: OdulKarti) {
    if (secilen) return;
    secilen = true;
    el.classList.add('ko-secildi');
    b.classList.add('ko-secilen');
    efekt.dogru();
    const { boya } = odulAl(kayit.acilan, k);
    if (boya) kayit.boya = boya;
    if (k.id && k.kategori === 'tat') {
      kayit.ozelTat = k.id as Tat;
      kayit.yeni = { tat: k.id as Tat };
    } else if (k.id && k.kategori === 'sus') kayit.yeni = { sus: k.id as Sus };
    kaydet();
    const bas = efekt_.merkez(b);
    const hedef = k.kategori === 'gorunum' && k.id === 'kino-sapka' ? efekt_.merkez(kino.el, 0.5, 0.2) : efekt_.merkez(otobus, 0.5, 0.5);
    // öbür kartlar küçülüp kavanoza girer
    const kv = efekt_.merkez(kavanoz, 0.5, 0.4);
    for (const o of kartDugmeleri) {
      if (o === b) continue;
      const r = efekt_.merkez(o);
      o.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${(kv[0] - r[0]).toFixed(0)}px, ${(kv[1] - r[1]).toFixed(0)}px) scale(0.15)`, opacity: 0 }], { duration: sure(520), easing: 'ease-in', fill: 'forwards' });
    }
    const resim = b.querySelector('.ko-kart-resim')!.cloneNode(true) as HTMLElement;
    resim.style.width = `${b.getBoundingClientRect().width * 0.7}px`;
    b.style.visibility = 'hidden';
    await efekt_.ucur(h('div.ko-ucan-kart', {}, resim), bas, hedef, { ms: 620, kavis: -80, boy0: 1, boy1: 0.4 });
    if (kapandi) return;
    efekt_.parilti(hedef[0], hedef[1], 10, 0.8, '#FFE45C');
    efekt_.pof(hedef[0], hedef[1], 1.1);
    otobusGuncelle(otobus, { alinan: kayit.acilan.gorunum, boya: kayit.boya, acik: true });
    salla(otobus, 'ko-zipla');
    if (k.id === 'korna') ses.dondurmaKorna();
    if (k.id === 'kino-sapka') kinoGiydir(kino, true);
    // Kino seçilene tepki verir
    if (!k.id) {
      // Kino'ya dondurma ısmarla: kocaman kupayı bir dikişte yer, beyni donar, titrer, güler
      void kino.oynat('ye', 900);
      await bekle(sure(900));
      salla(kinoKap, 'ko-titre');
      kino.konus(true);
      await konus(K.kino.beyin, KINO_SESI);
      kino.konus(false);
    } else if (k.kategori === 'tat') {
      void kino.oynat('ye', 900);
      if (kino.ifadeVar('keyif')) kino.ifade('keyif', 1000);
      kino.konus(true);
      await konus((K.kino as Record<string, string>)[`tat_${k.id}`] ?? K.kino.dondurma, KINO_SESI);
      kino.konus(false);
    } else {
      void kino.oynat('sevin', 900);
      await konus(kartAdi(k));
    }
    if (kapandi) return;
    void konus(K.mino.odul.yarina);
    tamam.hidden = false;
  }
  kartDugmeleri.forEach((b, i) => {
    b.addEventListener('click', () => void kartBas(b, odulKartlari[i]));
    // kartı otobüse sürüklemek de seçer (dokunuş gibi; kilit aynı)
    let x0 = 0;
    let y0 = 0;
    let surukleniyor = false;
    b.addEventListener('pointerdown', (e) => {
      x0 = e.clientX;
      y0 = e.clientY;
      surukleniyor = true;
    });
    b.addEventListener('pointerup', (e) => {
      if (!surukleniyor) return;
      surukleniyor = false;
      const r = otobus.getBoundingClientRect();
      const uzak = Math.hypot(e.clientX - x0, e.clientY - y0) > 30;
      if (uzak && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        const k = odulKartlari[i];
        const kilit = kartKilidi(k);
        if (kilit && !erisimVarMi(kilit, app.kok)) return;
        void sec(b, k);
      }
    });
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

  // açılış: Kino kavanozu sallar, jetonlar yay çizerek kartların üstüne yağar, kartlar arkadan öne sekerek açılır
  void (async () => {
    await bekle(sure(300));
    if (kapandi) return;
    salla(kavanoz, 'ko-titre');
    void kino.oynat('sevin', 900);
    ses.singir(0);
    const kv = efekt_.merkez(kavanoz, 0.5, 0.3);
    await Promise.all(kartDugmeleri.map((b, i) => efekt_.ucur(h('div.ko-ucan-jeton', { html: gorsel('jeton') }), kv, efekt_.merkez(b, 0.5, 0.3), { ms: 480, gecikme: i * 120, kavis: -70, boy0: 0.8, boy1: 0.6 }).then(() => !kapandi && ses.singir(i + 1))));
    if (kapandi) return;
    el.classList.add('ko-kartlar-acik');
    void konus(K.mino.odul.hangisi);
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

/** Bu kart kilitli mi (test / gösterim) */
export const odulKilitliMi = (k: OdulKarti) => !!kartKilidi(k) && kilitli(kartKilidi(k)!);
