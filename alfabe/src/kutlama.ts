// Tamamlama kutlaması (yol haritası madde 4, Astra Harf-H5): 29 harfin hepsi bitince, ya da Hece Evleri'nin bütün
// anahtarları toplanınca. Ceren'in sınıfı şenlik için süslenmiş; çocuğun kendi yazdığı harfler panoya tek tek uçup dizilir,
// konfeti patlar, kupa yükselir, sonunda çocuğun sertifikası gelir.
// Çizimler (assets/alfabe/odul/: kutlama-sinifi, sertifika, kupa, konfeti-0…2) gelene kadar kutlama uygulamada GÖRÜNMEZ
// (kutlamaHazirMi false). Test kipinde (?test=1) yer tutucularla oynanır: çizimlerin yeri ve akış denetlenebilsin.
import { TEST_MODU } from '../../src/ui/dom';
import { An, azHareket, canlanmaCizimi, canlanmaKareleri, isikSac } from './canlanma';
import { oyunSesi } from './oyun-sesi';
import './kutlama.css';

export type KutlamaTuru = 'harfler' | 'anahtarlar';
type Ses = (id: string, bitince?: () => void) => void;
const CIZIMLER = ['odul/kutlama-sinifi', 'odul/sertifika', 'odul/kupa', 'odul/konfeti-0', 'odul/konfeti-1', 'odul/konfeti-2'];
const OLCU: Record<string, [number, number]> = { 'odul/kutlama-sinifi': [1672, 941], 'odul/sertifika': [1600, 1100], 'odul/kupa': [500, 600], 'odul/konfeti': [400, 400] };

/** Test kipinde, çizim gelmeden akışı görmek için: çizimin yerini ve adını gösteren kesik çizgili kutu (yalnız ?test=1). */
function yerTutucu(ad: string): string {
  const [w, h] = OLCU[ad.replace(/-\d$/, '')] ?? [400, 400];
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '"><rect x="6" y="6" width="' + (w - 12) + '" height="' + (h - 12) +
    '" rx="24" fill="#fff7e6" fill-opacity="' + (ad.includes('sertifika') ? '.96' : '.55') + '" stroke="#c48a2c" stroke-width="8" stroke-dasharray="28 18"/><text x="50%" y="' + (ad.includes('sinifi') || ad.includes('sertifika') ? 8 : 50) +
    '%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="' + Math.round(Math.min(w, h) / 9) + '" fill="#9a6a1c">' + ad.replace('odul/', '') + ' · Astra</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function cizim(ad: string): string | undefined {
  return canlanmaCizimi(ad) ?? (TEST_MODU ? yerTutucu(ad) : undefined);
}
/** Kutlama yalnız Astra'nın bütün çizimleri gelince (ya da test kipinde) açılır. */
export function kutlamaHazirMi(): boolean {
  return TEST_MODU || CIZIMLER.every(ad => canlanmaCizimi(ad));
}

export type KutlamaAyari = {
  tur: KutlamaTuru;
  /** Panoya dizilecekler: harfler için çocuğun kendi yazdığı harfin SVG'si (harfYazisi), anahtarlar için ünsüzler. */
  parcalar: string[];
  oku: Ses;
  bitti: () => void;
  donusYazisi: string;
};

export function kutlamaKur(kap: HTMLElement, ayar: KutlamaAyari): () => void {
  const an = new An(), sakin = azHareket();
  const fon = cizim('odul/kutlama-sinifi')!, sertifika = cizim('odul/sertifika')!, kupa = cizim('odul/kupa')!;
  const konfeti = canlanmaKareleri('odul/konfeti', 3);
  const konfetiKareleri = konfeti.length ? konfeti : [0, 1, 2].map(i => cizim('odul/konfeti-' + i)!);
  const harfler = ayar.tur === 'harfler';
  const sahne = document.createElement('section');
  sahne.className = 'ku-sahne ku-' + ayar.tur;
  sahne.setAttribute('role', 'dialog');
  sahne.setAttribute('aria-label', harfler ? '29 harfi öğrendin! Kutlama' : 'Bütün anahtarları topladın! Kutlama');
  const tarih = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  sahne.innerHTML = '<div class="ku-oda"><img class="ku-fon" src="' + fon + '" alt="" draggable="false">' +
    '<div class="ku-pano" role="list" aria-label="' + (harfler ? 'Yazdığın harfler' : 'Topladığın hece anahtarları') + '"></div>' +
    '<img class="ku-kupa" src="' + kupa + '" alt="" draggable="false"></div>' +
    '<div class="ku-belge" hidden><div class="ku-kagit"><img src="' + sertifika + '" alt="" draggable="false">' +
    '<div class="ku-yazi"><small>Ceren Öğretmen’le Türkçe</small><strong>' + (harfler ? '29 harfi öğrendim!' : 'Bütün hece anahtarlarını topladım!') +
    '</strong><span>' + tarih + '</span></div></div><button type="button" class="at-basla ku-don">' + ayar.donusYazisi + '</button></div>';
  kap.append(sahne);
  const pano = sahne.querySelector<HTMLElement>('.ku-pano')!, oda = sahne.querySelector<HTMLElement>('.ku-oda')!;
  pano.style.setProperty('--sutun', String(harfler ? 6 : 5));
  const ogeler = ayar.parcalar.map(icerik => {
    const p = document.createElement('span');
    p.className = 'ku-parca'; p.setAttribute('role', 'listitem'); p.innerHTML = icerik;
    pano.append(p); return p;
  });
  const belge = sahne.querySelector<HTMLElement>('.ku-belge')!, don = sahne.querySelector<HTMLButtonElement>('.ku-don')!;
  don.onclick = ayar.bitti;
  ayar.oku(harfler ? 'kutlama-harfler' : 'kutlama-anahtarlar');
  if (sakin) {
    belge.hidden = false;
    an.sonra(400, () => ayar.oku('kutlama-sertifika'));
    don.focus({ preventScroll: true });
    return () => { an.durdur(); sahne.remove(); };
  }
  // 1. Harfler (ya da anahtarlar) aşağıdan uçup panoya dizilir.
  ogeler.forEach((p, i) => {
    an.hareket(p, [{ transform: 'translateY(140%) scale(.4) rotate(' + (i % 2 ? 14 : -14) + 'deg)', opacity: 0 },
      { transform: 'translateY(-12%) scale(1.12)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }],
      { duration: 460, delay: 300 + i * 75, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
    if (i % 4 === 0) an.sonra(300 + i * 75 + 300, () => oyunSesi('kagit'));
  });
  const dizildi = 300 + ogeler.length * 75 + 500;
  // 2. Konfeti üç yerde patlar, kupa yükselir.
  an.sonra(dizildi, () => {
    oyunSesi('parilti');
    const r = oda.getBoundingClientRect();
    for (const [x, y, gecikme] of [[.16, .3, 0], [.84, .26, 140], [.5, .14, 280]] as const) an.sonra(gecikme, () => {
      const k = an.ekle(oda, document.createElement('img'));
      k.className = 'ku-konfeti'; k.alt = ''; k.draggable = false; k.src = konfetiKareleri[0];
      Object.assign(k.style, { left: x * 100 + '%', top: y * 100 + '%' });
      konfetiKareleri.forEach((src, n) => an.sonra(n * 150, () => { k.src = src; }));
      an.hareket(k, [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: .55 },
        { transform: 'translate(-50%,-40%) scale(1.08)', opacity: 0 }], { duration: 900, easing: 'ease-out', fill: 'forwards' }).finished.then(() => an.kaldir(k), () => {});
      isikSac(an, oda, x * r.width, y * r.height, { adet: 7, uzaklik: r.height * .14, boy: Math.max(18, r.height * .045) });
    });
    an.hareket(sahne.querySelector('.ku-kupa')!, [{ transform: 'translateY(60%) scale(.6)', opacity: 0 }, { transform: 'translateY(-8%) scale(1.06)', opacity: 1, offset: .65 },
      { transform: 'none', opacity: 1 }], { duration: 640, delay: 200, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'both' });
  });
  // 3. Sertifika gelir.
  an.sonra(dizildi + 1700, () => {
    belge.hidden = false;
    oyunSesi('birles');
    an.hareket(belge.querySelector('.ku-kagit')!, [{ transform: 'translateY(40%) scale(.7) rotate(-4deg)', opacity: 0 },
      { transform: 'translateY(-3%) scale(1.03) rotate(1deg)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }],
      { duration: 620, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
    an.hareket(belge, [{ backgroundColor: 'rgba(40,35,20,0)' }, { backgroundColor: 'rgba(40,35,20,.35)' }], { duration: 400, fill: 'forwards' });
    an.sonra(500, () => ayar.oku('kutlama-sertifika'));
    don.focus({ preventScroll: true });
  });
  return () => { an.durdur(); sahne.remove(); };
}
