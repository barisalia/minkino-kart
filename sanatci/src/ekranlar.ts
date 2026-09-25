import sanatci from '../../content/sanatci.json';
import { efekt, konus } from '../../src/audio/ses';
import { ebeveynKapisi } from '../../src/screens/ebeveyn';
import { bekle, h, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { eserKaydet, eserler, eserSil, onayVarMi, onayVer, type Eser } from './depo';
import { kolajYap, paylas } from './kolaj';
import { SihirHatasi, sihirYap } from './sihir';
import { Tuval } from './tuval';

const S = sanatci as unknown as {
  hosgeldin: string; ciz: string; ne_cizdin: string; sihir: string[]; bekle: string[]; bitti: string[];
  harika: string; kaydedildi: string; hata: string; bos: string; galeri: string; konular: Record<string, string>;
};
const rastgele = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/**
 * Ebeveyn kapısı (sihir onayı, paylaşım, silme, sipariş). Barış'ın isteğiyle kapalı.
 * App Store "Çocuklar" kategorisi paylaşım/satın alma öncesi ebeveyn kapısı ister: mağaza sürümünde true yapın.
 */
const EBEVEYN_KAPISI = false;
const kapi = (app: Uygulama) => (EBEVEYN_KAPISI ? ebeveynKapisi(app) : Promise.resolve(true));

// Görseller (kart oyunuyla ortak arşivden)
const gorseller = import.meta.glob<string>(
  [
    '../../assets/hayvanlar/{kedi,kopek,kus,balik}.webp',
    '../../assets/tasitlar/araba.webp',
    '../../assets/renkler/gunes.webp',
    '../../assets/sanatci/*.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);
const ornekCizim = import.meta.glob<string>('../ornekler/*.png', { eager: true, query: '?url', import: 'default' });
const gorsel = (yol: string) => gorseller[`../../assets/${yol}.webp`];
const KONU_GORSEL: Record<string, string> = {
  kedi: 'hayvanlar/kedi', kopek: 'hayvanlar/kopek', kus: 'hayvanlar/kus', balik: 'hayvanlar/balik',
  ev: 'sanatci/ev', araba: 'tasitlar/araba', cicek: 'sanatci/cicek', agac: 'sanatci/agac',
  cocuk: 'sanatci/cocuk', dinozor: 'sanatci/dinozor', gunes: 'renkler/gunes',
};

/** Galeri boşken gösterilen hazır örnekler (karalama → sihir). */
async function ornekler(): Promise<Eser[]> {
  const liste: Eser[] = [];
  for (const ad of ['kedi', 'ev', 'araba']) {
    const c = ornekCizim[`../ornekler/${ad}.png`];
    const s = gorsel(`sanatci/ornek-${ad}-sonuc`);
    if (!c || !s) continue;
    try {
      const [cizim, sonuc] = await Promise.all([fetch(c).then((r) => r.blob()), fetch(s).then((r) => r.blob())]);
      liste.push({ id: `ornek-${ad}`, tarih: 0, konu: ad, cizim, sonuc, ornek: true });
    } catch {
      /* yok say */
    }
  }
  return liste;
}

function logo(): HTMLElement {
  const renk = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'];
  const kelime = (k: string, bas: number) => {
    const s = h('span.ms-logo-kelime');
    [...k].forEach((c, i) => s.append(h('span', { style: `color:${renk[(i + bas) % renk.length]};--i:${i + bas}` }, c)));
    return s;
  };
  return h('div.ms-logo', {}, kelime('Minik', 0), kelime('Sanatçı', 5));
}

// ---------------------------------------------------------------- Açılış
export function acilisEkrani(app: Uygulama): Ekran {
  const onceSonra = h('div.ms-vitrin');
  void ornekler().then((o) => {
    const e = o[0];
    if (!e) return;
    const a = URL.createObjectURL(e.cizim);
    const b = URL.createObjectURL(e.sonuc);
    onceSonra.append(h('img.ms-vitrin-once', { src: a, alt: 'Çocuk çizimi' }), h('img.ms-vitrin-sonra', { src: b, alt: 'Sihirli hali' }), h('div.ms-vitrin-yildiz', {}, svg(IKON.sihir)));
  });
  const ciz = h('button.dugme.ms-buyuk', { type: 'button', 'aria-label': 'Çiz' }, svg(IKON.kalem), h('span', {}, 'Çiz'));
  ciz.addEventListener('click', () => {
    efekt.secim();
    app.git('ciz');
  });
  const galeri = h('button.dugme.ms-galeri-dugme', { type: 'button', 'aria-label': 'Galerim', style: '--r:#FF8A2B' }, svg(IKON.resim), h('span', {}, 'Galerim'));
  galeri.addEventListener('click', () => {
    efekt.secim();
    app.git('galeri');
  });
  const el = h(
    'div.ms-acilis',
    {},
    h('div.ust-cubuk', {}, h('div'), sesDugmesi()),
    logo(),
    onceSonra,
    h('div.ms-acilis-alt', {}, ciz, galeri),
  );
  el.addEventListener('pointerdown', () => void konus(S.hosgeldin), { once: true });
  return { el };
}

// ---------------------------------------------------------------- Çizim
const RENKLER = ['#2B2B2B', '#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#2FB5A5', '#3E9DF2', '#9B5CE0', '#FF7EB6', '#8B5A2B'];
const KALINLIK = [0.012, 0.024, 0.045];
let sonCizim: Tuval | null = null;

export function cizEkrani(app: Uygulama, p?: { devam?: boolean }): Ekran {
  // "Ne çizdin?"den geri dönülünce çizim korunur
  const tuval = p?.devam && sonCizim ? sonCizim : new Tuval();
  if (sonCizim && sonCizim !== tuval) sonCizim.kapat();
  sonCizim = tuval;
  const kagit = h('div.ms-kagit', {}, tuval.el);

  const renkler = h('div.ms-renkler', { role: 'radiogroup', 'aria-label': 'Renkler' });
  const secRenk = (b: HTMLElement, r: string) => {
    tuval.renk = r;
    tuval.silgi = false;
    renkler.querySelectorAll('.secili').forEach((x) => x.classList.remove('secili'));
    b.classList.add('secili');
    efekt.dokunma();
  };
  RENKLER.forEach((r, i) => {
    const b = h('button.ms-boya', { type: 'button', style: `--r:${r}`, 'aria-label': `Renk ${i + 1}`, 'data-renk': r });
    if (r === tuval.renk) b.classList.add('secili');
    b.addEventListener('click', () => secRenk(b, r));
    renkler.append(b);
  });
  const silgi = h('button.ms-boya.ms-silgi', { type: 'button', 'aria-label': 'Silgi' }, svg(IKON.silgi));
  silgi.addEventListener('click', () => {
    tuval.silgi = true;
    renkler.querySelectorAll('.secili').forEach((x) => x.classList.remove('secili'));
    silgi.classList.add('secili');
    efekt.dokunma();
  });
  renkler.append(silgi);

  const kalinliklar = h('div.ms-kalinlik');
  KALINLIK.forEach((k, i) => {
    const b = h('button', { type: 'button', 'aria-label': ['İnce', 'Orta', 'Kalın'][i] }, h('i', { style: `--k:${8 + i * 9}px` }));
    if (k === tuval.kalinlik) b.classList.add('secili');
    b.addEventListener('click', () => {
      tuval.kalinlik = k;
      kalinliklar.querySelectorAll('.secili').forEach((x) => x.classList.remove('secili'));
      b.classList.add('secili');
      efekt.dokunma();
    });
    kalinliklar.append(b);
  });

  const bitti = h('button.dugme.ms-bitti', { type: 'button', 'aria-label': 'Sihir yap', disabled: true }, svg(IKON.sihir), h('span', {}, 'Sihir'));
  tuval.onDegisim = () => {
    bitti.disabled = tuval.bosMu();
    bitti.classList.toggle('hazir', !tuval.bosMu());
  };
  tuval.onDegisim();
  bitti.addEventListener('click', () => {
    if (tuval.bosMu()) {
      void konus(S.bos);
      return;
    }
    efekt.secim();
    app.git('konu');
  });

  const el = h(
    'div.ms-ciz',
    {},
    h(
      'div.ust-cubuk',
      {},
      h('div.ust-grup', {}, yuvarlakDugme(IKON.ev, 'Ana ekran', () => app.git('acilis')), yuvarlakDugme(IKON.geriAl, 'Geri al', () => tuval.geriAl(), 'kucuk'), yuvarlakDugme(IKON.sil, 'Temizle', () => tuval.temizle(), 'kucuk')),
      bitti,
    ),
    kagit,
    h('div.ms-palet', {}, renkler, kalinliklar),
  );
  void konus(S.ciz);
  return { el };
}

// ---------------------------------------------------------------- Ne çizdin?
export function konuEkrani(app: Uygulama): Ekran {
  const izgara = h('div.ms-konular');
  let kilit = false;
  Object.entries(S.konular).forEach(([id, ad], i) => {
    const url = KONU_GORSEL[id] ? gorsel(KONU_GORSEL[id]) : undefined;
    const b = h(
      'button.ms-konu',
      { type: 'button', 'aria-label': ad, 'data-konu': id, style: `--i:${i}` },
      url ? h('img', { src: url, alt: '' }) : h('span.ms-surpriz', {}, svg(IKON.sihir)),
      h('span.ms-konu-ad', {}, ad),
    );
    b.addEventListener('click', async () => {
      if (kilit) return;
      kilit = true;
      efekt.secim();
      b.classList.add('secili');
      await Promise.all([konus(`${ad}!`), bekle(sure(500))]);
      if (EBEVEYN_KAPISI && !onayVarMi()) {
        const tamam = await ebeveynOnayi(app);
        if (!tamam) {
          kilit = false;
          b.classList.remove('secili');
          return;
        }
      }
      app.git('sihir', { konu: id });
    });
    izgara.append(b);
  });
  const el = h(
    'div.ms-konu-ekran',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Çizime dön', () => app.git('ciz', { devam: true })), h('div.baslik-balon', {}, h('span', {}, S.ne_cizdin)), h('div', { style: 'width:72px' })),
    h('div.kaydir', {}, izgara),
  );
  void konus(S.ne_cizdin);
  return { el };
}

/** İlk sihirden önce: ebeveyn kapısı + açık onay (çizim sunucuya gönderilecek). */
async function ebeveynOnayi(app: Uygulama): Promise<boolean> {
  if (!(await ebeveynKapisi(app))) return false;
  return new Promise((coz) => {
    const onay = h('button.dugme', { type: 'button', style: '--r:#5DBE3F' }, 'Onaylıyorum');
    const vazgec = h('button.ince-dugme', { type: 'button' }, 'Vazgeç');
    const perde = h(
      'div.perde',
      { role: 'dialog', 'aria-label': 'Ebeveyn onayı' },
      h(
        'div.pencere.ms-onay',
        {},
        h('h2', {}, 'Sihir nasıl çalışır?'),
        h('p', {}, 'Çocuğunuzun çizimi, Minkino stiline çevrilmesi için güvenli sunucumuz üzerinden yapay zekaya gönderilir.'),
        h('ul', {}, h('li', {}, 'Sadece çizim gönderilir; isim, yüz, konum gibi hiçbir kişisel bilgi alınmaz.'), h('li', {}, 'Çizim ve sonuç sunucuda saklanmaz; yalnızca bu cihazın galerisinde durur.'), h('li', {}, 'Paylaşma ve baskı tamamen sizin elinizdedir.')),
        h('div.ms-onay-dugmeler', {}, vazgec, onay),
      ),
    );
    onay.addEventListener('click', () => {
      onayVer();
      perde.remove();
      coz(true);
    });
    vazgec.addEventListener('click', () => {
      perde.remove();
      coz(false);
    });
    app.kok.append(perde);
  });
}

// ---------------------------------------------------------------- Sihir
export function sihirEkrani(app: Uygulama, p: { konu: string }): Ekran {
  const cerceve = h('div.ms-sihir-cerceve');
  const yazi = h('div.ms-sihir-yazi', { 'aria-live': 'polite' }, rastgele(S.sihir));
  const el = h('div.ms-sihir', {}, h('div.ust-cubuk', {}, yuvarlakDugme(IKON.ev, 'Ana ekran', () => app.git('acilis')), h('div')), h('div.ms-sihir-sahne', {}, cerceve, h('div.ms-asa', {}, svg(IKON.sihir))), yazi);
  const iptal = new AbortController();
  let kapandi = false;

  void (async () => {
    const tuval = sonCizim;
    if (!tuval) return app.git('ciz');
    const cizim = await tuval.blob();
    cerceve.append(h('img.ms-sihir-cizim', { src: URL.createObjectURL(cizim), alt: 'Çizimin' }));
    efekt.kilitAcildi();
    void konus(rastgele(S.sihir));
    const bekleme = window.setInterval(() => {
      yazi.textContent = rastgele(S.bekle);
      void konus(yazi.textContent);
    }, 7000);
    try {
      const [sonuc] = await Promise.all([sihirYap(cizim, p.konu, iptal.signal), bekle(sure(2200))]);
      clearInterval(bekleme);
      if (kapandi) return;
      const eser: Eser = { id: `e${Date.now()}`, tarih: Date.now(), konu: p.konu, cizim, sonuc };
      await eserKaydet(eser);
      app.git('sonuc', { eser, yeni: true });
    } catch (e) {
      clearInterval(bekleme);
      if (kapandi) return;
      const kod = e instanceof SihirHatasi ? e.kod : 'sunucu';
      el.classList.add('hata');
      yazi.textContent = kod === 'kurulum' ? 'Sihirli kalem hazırlanıyor' : S.hata;
      void konus(S.hata);
      const tekrar = h('button.dugme', { type: 'button', style: '--r:#FF8A2B' }, 'Tekrar dene');
      tekrar.addEventListener('click', () => app.git('sihir', p));
      const not =
        kod === 'kurulum'
          ? h('p.ms-ebeveyn-not', {}, 'Ebeveynler için: Sihir sunucusu henüz kurulmadı (ayar.json → sunucu). Kurulum tamamlanınca bu ekran çalışacak.')
          : h('p.ms-ebeveyn-not', {}, e instanceof Error ? e.message : '');
      el.append(h('div.ms-hata-kutu', {}, tekrar, not));
    }
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      iptal.abort();
    },
  };
}

// ---------------------------------------------------------------- Sonuç (önce / sonra)
export function sonucEkrani(app: Uygulama, p: { eser: Eser; yeni?: boolean }): Ekran {
  const once = URL.createObjectURL(p.eser.cizim);
  const sonra = URL.createObjectURL(p.eser.sonuc);
  const kaydirici = h('input.ms-kaydirici', { type: 'range', min: '0', max: '100', value: p.yeni ? '100' : '50', 'aria-label': 'Önce ve sonra' }) as HTMLInputElement;
  const karsilastir = h(
    'div.ms-karsilastir',
    {},
    h('img.ms-k-sonra', { src: sonra, alt: 'Sihirli resim' }),
    h('div.ms-k-once', {}, h('img', { src: once, alt: 'Çocuğun çizimi' })),
    h('div.ms-k-cizgi', {}, h('span', {}, svg(IKON.sihir))),
    kaydirici,
  );
  const guncelle = () => karsilastir.style.setProperty('--k', `${kaydirici.value}%`);
  kaydirici.addEventListener('input', guncelle);
  guncelle();

  const paylasD = h('button.dugme', { type: 'button', style: '--r:#3E9DF2' }, svg(IKON.paylas), h('span', {}, 'Paylaş'));
  paylasD.addEventListener('click', async () => {
    if (!(await kapi(app))) return;
    const kolaj = await kolajYap(p.eser);
    const sonuc = await paylas(kolaj, 'minik-sanatci.png');
    if (sonuc === 'goster') app.kok.append(kolajPenceresi(kolaj));
  });
  const bastir = h('button.dugme', { type: 'button', style: '--r:#9B5CE0' }, svg(IKON.yazdir), h('span', {}, 'Bastır'));
  bastir.addEventListener('click', () => app.git('bastir', { eser: p.eser }));
  const yeni = yuvarlakDugme(IKON.kalem, 'Yeni çizim', () => app.git('ciz'));
  yeni.style.setProperty('--r', '#5DBE3F');
  yeni.style.setProperty('--i', '#fff');

  const el = h(
    'div.ms-sonuc',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.ev, 'Ana ekran', () => app.git('acilis')), h('div.ust-grup', {}, yuvarlakDugme(IKON.resim, 'Galerim', () => app.git('galeri'), 'kucuk'), yeni)),
    karsilastir,
    h('div.ms-sonuc-dugmeler', {}, paylasD, bastir),
  );

  if (p.yeni) {
    // Açılış gösterisi: perde soldan sağa kayar, konfeti
    void (async () => {
      await bekle(sure(300));
      const r = karsilastir.getBoundingClientRect();
      if (!TEST_MODU) {
        const bas = performance.now();
        const adim = (t: number) => {
          const e = Math.min(1, (t - bas) / 1400);
          kaydirici.value = String(100 - (1 - Math.pow(1 - e, 3)) * 100);
          guncelle();
          if (e < 1) requestAnimationFrame(adim);
          else {
            konfetiPatlat(app.kok, r.left + r.width / 2, r.top + r.height / 2, 140, 1.3);
            efekt.konfeti();
          }
        };
        requestAnimationFrame(adim);
      } else {
        kaydirici.value = '0';
        guncelle();
      }
      efekt.ucus();
      await konus([rastgele(S.bitti), S.kaydedildi]);
      if (!TEST_MODU) {
        kaydirici.value = '0';
      }
    })();
  }
  return { el };
}

function kolajPenceresi(b: Blob): HTMLElement {
  const perde = h('div.perde', { role: 'dialog', 'aria-label': 'Paylaşım görseli' }, h('div.pencere', {}, h('h2', {}, 'Görsele basılı tutup kaydedin'), h('img', { src: URL.createObjectURL(b), alt: 'Paylaşım görseli', style: 'width:100%;border-radius:16px' })));
  perde.addEventListener('click', (e) => e.target === perde && perde.remove());
  return perde;
}

// ---------------------------------------------------------------- Galeri
export function galeriEkrani(app: Uygulama): Ekran {
  const izgara = h('div.ms-galeri');
  const el = h(
    'div.ms-galeri-ekran',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.ev, 'Ana ekran', () => app.git('acilis')), h('div.baslik-balon', {}, h('span', {}, 'Galerim')), yuvarlakDugme(IKON.kalem, 'Yeni çizim', () => app.git('ciz'))),
    h('div.kaydir', {}, izgara),
  );
  void (async () => {
    const benim = await eserler();
    const hepsi = [...benim, ...(await ornekler())];
    if (!benim.length) izgara.append(h('p.ms-galeri-bos', {}, 'Henüz resmin yok. Çiz, sihir yap, burada biriksin! Aşağıda örnekler var.'));
    hepsi.forEach((e, i) => {
      const kart = h(
        'button.ms-eser',
        { type: 'button', style: `--i:${i}`, 'aria-label': S.konular[e.konu] ?? 'Resim' },
        h('img.ms-eser-sonuc', { src: URL.createObjectURL(e.sonuc), alt: '' }),
        h('img.ms-eser-once', { src: URL.createObjectURL(e.cizim), alt: '' }),
        e.ornek ? h('span.ms-etiket', {}, 'Örnek') : null,
      );
      kart.addEventListener('click', () => app.git('sonuc', { eser: e }));
      if (!e.ornek) {
        let zamanlayici: number | undefined;
        kart.addEventListener('pointerdown', () => {
          zamanlayici = window.setTimeout(async () => {
            if (await kapi(app)) {
              await eserSil(e.id);
              app.git('galeri');
            }
          }, 900);
        });
        kart.addEventListener('pointerup', () => clearTimeout(zamanlayici));
        kart.addEventListener('pointerleave', () => clearTimeout(zamanlayici));
      }
      izgara.append(kart);
    });
  })();
  void konus(S.galeri);
  return { el };
}

// ---------------------------------------------------------------- Bastır (görünüm)
export function bastirEkrani(app: Uygulama, p: { eser: Eser }): Ekran {
  const url = URL.createObjectURL(p.eser.sonuc);
  const urun = (sinif: string, ad: string, aciklama: string, fiyat: string) =>
    h(`div.ms-urun.${sinif}`, {}, h('div.ms-urun-gorsel', {}, h('img', { src: url, alt: '' })), h('div.ms-urun-bilgi', {}, h('b', {}, ad), h('span', {}, aciklama), h('small', {}, fiyat)));
  const siparis = h('button.dugme', { type: 'button', style: '--r:#5DBE3F' }, 'Sipariş ver');
  siparis.addEventListener('click', async () => {
    if (!(await kapi(app))) return;
    const perde = h('div.perde', {}, h('div.pencere', {}, h('h2', {}, 'Çok yakında!'), h('p', {}, 'Baskı siparişi Minkino mağazasıyla birlikte açılacak. Resminiz galeride saklı kalıyor.')));
    perde.addEventListener('click', () => perde.remove());
    app.kok.append(perde);
  });
  const el = h(
    'div.ms-bastir',
    {},
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.geri()), h('div.baslik-balon', {}, h('span', {}, 'Bastır')), h('div', { style: 'width:72px' })),
    h(
      'div.kaydir',
      {},
      h(
        'div.ms-urunler',
        {},
        urun('sticker', 'Sticker seti', 'Resminden 6 parlak sticker', 'Yakında'),
        urun('poster', 'Poster', 'A3, çerçeveye hazır', 'Yakında'),
        urun('magnet', 'Buzdolabı magneti', 'Yuvarlak, 7 cm', 'Yakında'),
      ),
      h('div.ms-siparis', {}, siparis),
    ),
  );
  return { el };
}
