/** Uyuyan Orman ekranları: açılış, büyükler (mikrofon izni), harita, bölge, şenlik */
import O from '../../content/orman.json';
import { efekt, konus } from '../../src/audio/ses';
import { metin } from '../../src/audio/metin';
import { durum } from '../../src/engine/ilerleme';
import { bekle, h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { BOLGELER, bolge, type Bolge } from './bolgeler';
import { Alkis, type Baglam, type Gorev, type Nokta } from './gorev';
import { adres, parilti, resim, zzz } from './gorsel';
import { kaydet, kayit, uyandir } from './ilerleme';
import { kulak } from './kulak';
import { basari, hayvanCal, hayvanHazirla } from './sesler';

export const IK = {
  kulak: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 20a11 11 0 0 1 22 0c0 8-7 8-7 15a6 6 0 0 1-11 3"/><path d="M19 21a5 5 0 0 1 10 0c0 3-3 4-3 7"/></svg>',
  nefes: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><ellipse cx="24" cy="19" rx="11" ry="13"/><path d="M24 32l-2 4h4zM24 36c0 4 3 5 0 9"/></svg>',
  papagan: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 40c-4-8-3-20 5-26 6-4 14-2 16 4l-6 3c-2-2-5-1-5 2 0 5 6 6 6 14"/><circle cx="26" cy="15" r="1.5" fill="currentColor"/><path d="M37 18c3 1 4 4 2 6l-5-3"/></svg>',
  birlikte: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="13" r="5"/><circle cx="33" cy="17" r="4"/><path d="M6 40c0-9 4-15 9-15s9 6 9 15M26 40c0-7 3-11 7-11s7 4 7 11"/></svg>',
  senlik: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 40l8-24 16 16z"/><path d="M26 12c2-3 5-4 8-3M34 22c3-1 6 0 8 2M30 6l1 3M40 12l3-1M40 30l2 2"/></svg>',
};

const yas = () => durum.i.yas ?? 4;

function logo(): HTMLElement {
  const k = (t: string, sinif: string) => h(`span.${sinif}`, {}, ...[...t].map((c, i) => h('span', { style: `--i:${i}` }, c)));
  return h('div.or-logo', { role: 'img', 'aria-label': 'Uyuyan Orman' }, k('Uyuyan', 'uyuyan'), k('Orman', 'orman'));
}

/** Kulak göstergesi: dinlerken halka sesle büyür; karakter konuşurken söner; mikrofon yoksa "parmağınla" */
function kulakGostergesi(): { el: HTMLElement; guncelle(): void } {
  const halka = h('i.or-kulak-halka');
  const yazi = h('span.or-kulak-yazi');
  const ikon = h('span.or-kulak-ikon');
  const el = h('div.or-kulak', { 'aria-live': 'polite' }, halka, ikon, yazi);
  let son = '';
  return {
    el,
    guncelle() {
      const d = kulak.acik ? (kulak.dinliyor ? 'dinliyor' : 'bekliyor') : 'el';
      if (d !== son) {
        son = d;
        el.dataset.durum = d;
        ikon.innerHTML = d === 'el' ? IKON.el : IK.kulak;
        yazi.textContent = d === 'el' ? 'Parmağınla oyna' : d === 'dinliyor' ? 'Dinliyorum' : '';
      }
      halka.style.setProperty('--s', String(kulak.dinliyor ? 1 + kulak.seviye * 0.9 : 1));
    },
  };
}

// ---------------------------------------------------------------- Açılış
export function acilisEkrani(app: Uygulama): Ekran {
  const ogeler = BOLGELER.map((b, i) => h('div.or-acilis-hayvan', { style: `--i:${i}` }, resim(b.ev, '', b.ad)));
  const oyna = h('button.dugme.or-oyna', { type: 'button' }, svg(IKON.oyna), 'Oyna');
  oyna.addEventListener('click', async () => {
    efekt.secim();
    void konus(O.hosgeldin);
    await bekle(sure(250));
    app.git(durum.i.yas ? 'harita' : 'yas', { sonra: 'harita' });
  });
  const el = h(
    'div.or-acilis',
    { style: `--resim:url("${adres('orman/harita')}")` },
    h('div.or-acilis-arka'),
    h('div.or-acilis-ic', {}, logo(), h('div.or-acilis-hayvanlar', {}, ...ogeler), zzz(), oyna),
    h('div.ust-cubuk.or-sag-ust', {}, h('div'), sesDugmesi()),
  );
  return { el };
}

// ---------------------------------------------------------------- Büyükler: mikrofon izni
export function izinEkrani(app: Uygulama, p: { sonra: string; param?: unknown }): Ekran {
  const durumYazi = h('p.or-izin-durum');
  const ac = h('button.dugme', { type: 'button' }, svg(IK.kulak), 'Mikrofonu aç');
  const dokun = h('button.ince-dugme', { type: 'button' }, 'Mikrofonsuz oyna (dokunarak)');
  ac.addEventListener('click', async () => {
    ac.setAttribute('disabled', '');
    durumYazi.textContent = 'Bir saniye sessiz olalım: ortamın sesini ölçüyorum…';
    const tamam = await kulak.ac();
    if (tamam) {
      kayit.izin = true;
      kaydet();
      efekt.dogru();
      app.git(p.sonra, p.param);
    } else {
      durumYazi.textContent = 'Mikrofon açılamadı. Tarayıcı ayarlarından izin verebilir ya da parmakla oynayabilirsiniz.';
      ac.removeAttribute('disabled');
    }
  });
  dokun.addEventListener('click', () => {
    kulak.mikrofonsuz();
    app.git(p.sonra, p.param);
  });
  void konus(O.izin);
  const el = h(
    'div.or-izin',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.git('harita')), h('div'), h('div')),
    h(
      'div.or-izin-kart',
      {},
      h('h2', {}, 'Büyükler için'),
      h('p', {}, 'Uyuyan Orman nefesle, sesle ve alkışla oynanır. Bunun için mikrofon gerekir.'),
      h('ul', {}, h('li', {}, 'Ses kaydedilmez, telefondan dışarı çıkmaz; her an işlenip silinir.'), h('li', {}, 'Kelimeler değil, sesin şekli dinlenir (üfleme, alkış, ince-kalın, sessizlik).'), h('li', {}, 'Her görev parmakla da oynanabilir.')),
      ac,
      durumYazi,
      dokun,
    ),
  );
  return { el };
}

/** Mikrofon gereken ekrana giderken: izin yoksa önce büyükler ekranı */
export function mikrofonlaGit(app: Uygulama, ekran: string, param?: unknown) {
  if (kulak.acik || kulak.durum === 'yok' || TEST_MODU) app.git(ekran, param);
  else app.git('izin', { sonra: ekran, param });
}

// ---------------------------------------------------------------- Harita
export function haritaEkrani(app: Uygulama): Ekran {
  const harita = h('div.or-harita', { style: `--resim:url("${adres('orman/harita')}")` });
  const hepsi = BOLGELER.every((b) => kayit.uyanan.includes(b.id));
  // bölgeleri birleştiren patika
  const n = BOLGELER.map((b) => b.konum);
  let d = `M${n[0][0] * 100} ${n[0][1] * 100}`;
  for (let i = 1; i < n.length; i++) {
    const [x0, y0] = n[i - 1];
    const [x1, y1] = n[i];
    d += ` C${x0 * 100} ${((y0 + y1) / 2) * 100} ${x1 * 100} ${((y0 + y1) / 2) * 100} ${x1 * 100} ${y1 * 100}`;
  }
  d += ` L50 3`;
  harita.innerHTML = `<svg class="or-patika-cizgi" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`;
  BOLGELER.forEach((b, i) => {
    const uyanik = kayit.uyanan.includes(b.id);
    const m = h(
      `button.or-madalyon${uyanik ? '.uyanik' : ''}`,
      { type: 'button', style: `left:${b.konum[0] * 100}%;--t:${b.konum[1]};--renk:${b.renk};--i:${i}`, 'data-bolge': b.id, 'aria-label': b.ad },
      h('span.or-madalyon-resim', { style: `--resim:url("${adres(`orman/${b.id}`)}")` }),
      resim(b.ev, 'or-madalyon-ev', b.ad),
      uyanik ? null : zzz(),
      h('span.or-madalyon-ad', {}, b.ad),
    );
    m.addEventListener('click', () => {
      efekt.secim();
      mikrofonlaGit(app, 'bolge', { id: b.id });
    });
    harita.append(m);
  });
  const senlik = h(`button.or-madalyon.senlik${hepsi ? '.acik' : ''}`, { type: 'button', style: 'left:50%;--t:0.03', 'aria-label': 'Orman Şenliği' }, svg(IK.senlik), h('span.or-madalyon-ad', {}, 'Şenlik'));
  senlik.addEventListener('click', () => {
    if (!hepsi) {
      efekt.kilitli();
      void konus(O.sec);
      return;
    }
    mikrofonlaGit(app, 'senlik');
  });
  harita.append(senlik);

  const alt = (ikon: string, ad: string, ekran: string, renk: string) => {
    const b = h('button.or-alt-dugme', { type: 'button', style: `--r:${renk}`, 'data-ekran': ekran }, svg(ikon), h('span', {}, ad));
    b.addEventListener('click', () => {
      efekt.secim();
      mikrofonlaGit(app, ekran);
    });
    return b;
  };
  const buyuk = yuvarlakDugme(IKON.ebeveyn, 'Büyükler için', () => app.git('buyukler'), 'kucuk');
  const el = h(
    'div.or-harita-ekran',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.ev, 'Açılış', () => app.git('acilis')), h('div.orta', {}, h('div.baslik-balon', {}, h('span', {}, `${kayit.uyanan.length} / 6 uyandı`))), sesDugmesi()),
    harita,
    h('div.or-alt', {}, alt(IK.nefes, 'Nefes Balonu', 'nefes', '#FF7EB6'), alt(IK.papagan, 'Papağan', 'papagan', '#5DBE3F'), alt(IK.birlikte, 'Birlikte', 'birlikte', '#FF8A2B'), buyuk),
  );
  void konus(hepsi && !kayit.senlik ? O.senlik_acildi : O.sec);
  if (hepsi && !kayit.senlik) {
    kayit.senlik = true;
    kaydet();
    senlik.classList.add('yeni');
  }
  return { el };
}

// ---------------------------------------------------------------- Bölge
export function bolgeEkrani(app: Uygulama, p: { id: string }): Ekran {
  const bl = bolge(p.id) as Bolge;
  const fabrikalar = bl.gorevler(yas());
  const arka = h('div.or-arka', { style: `--resim:url("${adres(`orman/${bl.id}`)}")` });
  const ev = h(`div.or-ev.uyuyor.ev-${bl.id}`, {}, resim(bl.ev, '', bl.ad), zzz());
  const sahne = h('div.or-sahne');
  const yazi = h('span', {}, bl.ad);
  let sonYonerge = bl.giris;
  const balon = h('div.baslik-balon', {}, yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', () => void konus(sonYonerge), 'kucuk'), yazi);
  const adimlar = h('div.or-adimlar', {}, h('i'), h('i'), h('i'));
  const kg = kulakGostergesi();
  const el = h(
    'div.or-bolge',
    { style: `--renk:${bl.renk}`, 'data-bolge': bl.id },
    arka,
    ev,
    sahne,
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Haritaya dön', () => app.git('harita')), h('div.orta', {}, balon)),
    adimlar,
    kg.el,
  );
  const griYap = (g: number) => el.style.setProperty('--gri', String(g));
  griYap(1);
  hayvanHazirla(bl.evSesi);

  const b: Baglam = {
    yas: yas(),
    tur: 0,
    sahne,
    ayar: kulak.ayar,
    yaz: (t) => (yazi.textContent = t),
    soyle: (t) => konus(t),
    isim: kayit.isim,
    referans: null,
  };
  let gorev: Gorev | null = null;
  let aktif = false;
  let kapandi = false;
  let basili = false;
  let turBas = 0;
  let ipucu = false;

  // dokunma: her görevin dokunarak oynanan karşılığı
  const nokta = (e: PointerEvent): Nokta => {
    const r = sahne.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };
  const hedefDugmeMi = (e: Event) => !!(e.target as Element).closest?.('button,input,label');
  sahne.addEventListener('pointerdown', (e) => {
    if (!aktif || hedefDugmeMi(e)) return;
    basili = true;
    try {
      sahne.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    gorev?.bas?.(nokta(e));
  });
  sahne.addEventListener('pointermove', (e) => basili && gorev?.kaydir?.(nokta(e)));
  const birak = (e: PointerEvent) => {
    if (!basili) return;
    basili = false;
    gorev?.birak?.(nokta(e));
  };
  sahne.addEventListener('pointerup', birak);
  sahne.addEventListener('pointercancel', birak);

  let onceki = performance.now();
  let rafId = 0;
  const dongu = (t: number) => {
    const dt = Math.min(0.1, (t - onceki) / 1000);
    onceki = t;
    if (aktif) gorev?.tik?.(dt);
    kg.guncelle();
    if (aktif && !ipucu && kulak.acik && t - turBas > 25000) {
      ipucu = true;
      el.classList.add('ipucu');
      void konus(O.parmak);
      setTimeout(() => el.classList.remove('ipucu'), 5000);
    }
    rafId = requestAnimationFrame(dongu);
  };
  rafId = requestAnimationFrame(dongu);

  const tur = async (i: number) => {
    sahne.replaceChildren();
    b.tur = i;
    let coz: () => void = () => undefined;
    const bitti = new Promise<void>((r) => (coz = r));
    let bittiMi = false;
    gorev = fabrikalar[i](b, () => {
      if (bittiMi) return;
      bittiMi = true;
      coz();
    });
    yazi.textContent = gorev.yazi ?? gorev.yonerge;
    if (gorev.yonerge) {
      sonYonerge = gorev.yonerge;
      await konus(gorev.yonerge);
    }
    if (kapandi) return;
    aktif = true;
    turBas = performance.now();
    gorev.basla?.();
    kulak.dinle((o) => aktif && gorev?.kare?.(o));
    await bitti;
    aktif = false;
    basili = false;
    kulak.dinle(null);
    gorev.kapat?.();
    if (kapandi) return;
    adimlar.children[i]?.classList.add('dolu');
    griYap(1 - (i + 1) / 3);
    ev.classList.add('kipir');
    setTimeout(() => ev.classList.remove('kipir'), 700);
    basari();
    await Promise.all([konus(metin('dogru')), bekle(sure(900))]);
  };

  const uyan = async () => {
    sahne.replaceChildren();
    ev.classList.remove('uyuyor');
    ev.classList.add('uyandi');
    hayvanCal(bl.evSesi, 2000);
    const r = ev.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width / 2, r.top + r.height / 3, 90);
    parilti(sahne, 0.5, 0.5, 12);
    const ilk = uyandir(bl.id);
    yazi.textContent = `${bl.ad} uyandı!`;
    await bekle(sure(1200));
    await konus(O.uyandi);
    if (kapandi) return;
    const harita = h('button.dugme', { type: 'button', style: '--r:var(--yesil)' }, svg(IKON.onay), 'Haritaya dön');
    const tekrar = h('button.dugme', { type: 'button', style: '--r:var(--sari)' }, svg(IKON.tekrar), 'Bir daha');
    harita.addEventListener('click', () => app.git('harita'));
    tekrar.addEventListener('click', () => app.git('bolge', { id: bl.id }));
    sahne.append(h('div.or-bitis', {}, harita, tekrar));
    if (ilk && BOLGELER.every((x) => kayit.uyanan.includes(x.id))) harita.classList.add('parla');
  };

  void (async () => {
    // izin önceden verildiyse mikrofonu sessizce aç (ölçüm sırasında konuşulmaz)
    if (!kulak.acik && kayit.izin && kulak.durum !== 'yok' && !TEST_MODU) {
      yazi.textContent = O.sessiz_ol;
      await kulak.ac();
    }
    await bekle(sure(300));
    if (kapandi) return;
    yazi.textContent = bl.ad;
    await konus(bl.giris);
    for (let i = 0; i < fabrikalar.length && !kapandi; i++) await tur(i);
    if (!kapandi) await uyan();
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      aktif = false;
      kulak.dinle(null);
      gorev?.kapat?.();
      cancelAnimationFrame(rafId);
    },
  };
}

// ---------------------------------------------------------------- Büyükler paneli
export function buyuklerEkrani(app: Uygulama): Ekran {
  const isim = h('input.or-isim-girdi', { type: 'text', value: kayit.isim, 'aria-label': 'Çocuğun adı', maxlength: 16 }) as HTMLInputElement;
  isim.addEventListener('change', () => {
    kayit.isim = isim.value.trim();
    kaydet();
  });
  const duy = h('input', { type: 'range', min: -8, max: 8, step: 1, value: kulak.ayar.duyarlilik, 'aria-label': 'Duyarlılık' }) as HTMLInputElement;
  duy.addEventListener('input', () => (kulak.ayar.duyarlilik = Number(duy.value)));
  const mik = h('p', {}, kulak.acik ? `Mikrofon açık · ortam sesi ${kulak.ayar.taban.toFixed(0)} dB` : kulak.durum === 'yok' ? 'Mikrofonsuz (dokunarak) oynanıyor' : 'Mikrofon kapalı');
  const sifirla = h('button.ince-dugme', { type: 'button' }, 'Ormanı yeniden uyut (ilerlemeyi sıfırla)');
  sifirla.addEventListener('click', () => {
    kayit.uyanan = [];
    kayit.senlik = false;
    kaydet();
    app.git('harita');
  });
  const yasDegis = h('button.ince-dugme', { type: 'button' }, `Yaş: ${yas()} (değiştir)`);
  yasDegis.addEventListener('click', () => app.git('yas', { sonra: 'harita' }));
  const el = h(
    'div.or-izin',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.git('harita')), h('div'), h('div')),
    h(
      'div.or-izin-kart',
      {},
      h('h2', {}, 'Büyükler için'),
      mik,
      h('label.or-satir', {}, 'Çocuğun adı (Hece Mağarası): ', isim),
      h('label.or-satir', {}, 'Mikrofon duyarlılığı: ', duy),
      yasDegis,
      h('p.or-kucuk', {}, 'Ses kaydedilmez ve telefondan dışarı çıkmaz. Gürültülü ortamda her görev parmakla da oynanabilir. Yüksek sesli görevler kısa tutuldu.'),
      sifirla,
    ),
  );
  return { el };
}

// ---------------------------------------------------------------- Şenlik (bütün orman uyanınca)
export function senlikEkrani(app: Uygulama): Ekran {
  const hayvanlar = BOLGELER.map((b, i) => {
    const e = h('button.or-senlik-hayvan', { type: 'button', style: `--i:${i};--renk:${b.renk}`, 'aria-label': b.ad }, resim(b.ev, '', b.ad));
    e.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
      cal(i);
    });
    return e;
  });
  const sahne = h('div.or-senlik-sahne', {}, ...hayvanlar);
  const kg = kulakGostergesi();
  const el = h(
    'div.or-senlik',
    { style: `--resim:url("${adres('orman/harita')}")` },
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Haritaya dön', () => app.git('harita')), h('div.orta', {}, h('div.baslik-balon', {}, h('span', {}, 'Orman Şenliği'))), h('div')),
    sahne,
    kg.el,
  );
  hayvanHazirla(...BOLGELER.map((b) => b.evSesi));
  let sira = 0;
  let toplam = 0;
  function cal(i: number) {
    const b = BOLGELER[i];
    const e = hayvanlar[i];
    e.classList.remove('zipla');
    void e.offsetWidth;
    e.classList.add('zipla');
    hayvanCal(b.evSesi, 450);
    parilti(sahne, (i + 0.5) / BOLGELER.length, 0.5, 5);
    toplam++;
    if (toplam % 12 === 0) {
      const r = sahne.getBoundingClientRect();
      konfetiPatlat(app.kok, r.left + r.width / 2, r.top + r.height / 3, 100);
      efekt.kilitAcildi();
    }
  }
  const a = new Alkis(kulak.ayar);
  a.onAlkis = () => {
    cal(sira % BOLGELER.length);
    sira++;
  };
  kulak.dinle((o) => a.kare(o));
  sahne.addEventListener('pointerdown', () => {
    cal(sira % BOLGELER.length);
    sira++;
  });
  let rafId = requestAnimationFrame(function d() {
    kg.guncelle();
    rafId = requestAnimationFrame(d);
  });
  void konus(O.senlik.giris);
  return {
    el,
    kapat() {
      kulak.dinle(null);
      cancelAnimationFrame(rafId);
    },
  };
}
