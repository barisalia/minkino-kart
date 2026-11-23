// Lokum'un Hece Köprüsü (Hece Oyunu'nun üçüncü durağı; yönetici, 20 Kasım; Astra Harf-H9).
// Derenin üstünde 2–3 boş taş yuvası, kıyıda hece taşları. Çocuk sözcüğü dinler, heceleri sırayla suya koyar: her taş
// "plop" diye oturur, su halkası açılır, hecesi okunur. Sözcük tamamlanınca Lokum taşların üstünden hece hece zıplar
// ("el – ma!") ve karşı kıyıdaki resme ulaşır. Yanlış taş sallanır, suya batmaz; Lokum bekler, ceza yok.
// Bir oturumda 3 sözcük (hece-koprusu-secim.ts). Yerler fon ölçüsünde (1672 × 941), brief'le birebir.
// Çizimler (assets/alfabe/hece-koprusu/) gelene kadar durak uygulamada görünmez; test kipinde yer tutucularla oynanır.
import { TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { An, azHareket, canlanmaCizimi, isikSac, kabaGore } from './canlanma';
import { bilinenHarfler } from './cumle-okuma-kurallari';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { kopruAdaylari, kopruOturumu, yanlisHece, type KopruYasi } from './hece-koprusu-secim';
import { oyunSesi } from './oyun-sesi';
import { adSesi, parcaSesi } from './pano-sozcukleri';
import { type HavuzSozcugu } from './sozcuk-havuzu';
import { resimliSozcukler } from './sozcuk-kaynagi';
import { yanPanolariKur, yanTepsi } from './yan-pano';
import { bitisKutla } from './cila';
import './hece-koprusu.css';

type Oku = (id: string, sonra?: () => void) => void;
const FON = { w: 1672, h: 941 };
const YUVA_Y = 630;
const YUVALAR: Record<number, number[]> = { 2: [767, 1003], 3: [650, 885, 1120] };
const LOKUM_BAS = { x: 420, y: 700 }, SEHPA = { x: 1440, y: 700 };
// Kıyıdaki hece taşları: sol kıyıda iki satır, iki sütun (en çok 4 taş: 3 hece ve 1 yanlış).
const TEPSI = [{ x: 105, y: 775 }, { x: 280, y: 775 }, { x: 105, y: 884 }, { x: 280, y: 884 }];
const KAYIT = 'minkino-hece-kopru-v1';
const CIZIMLER = ['dere', 'tas', 'tas-bos', 'halka-0', 'halka-1', 'halka-2', 'sehpa', 'lokum-0', 'lokum-1', 'lokum-2', 'lokum-3', 'kart'];
const OLCU: Record<string, [number, number]> = { dere: [1672, 941], tas: [300, 200], 'tas-bos': [300, 200], halka: [400, 200], sehpa: [360, 420], lokum: [500, 600], kart: [840, 560] };

/** Test kipinde çizimin yerini ve adını gösteren kesik çizgili kutu (yalnız ?test=1; kodla çizim değil, yer işareti). */
function yerTutucu(ad: string): string {
  const [w, h] = OLCU[ad.replace(/-\d$/, '')] ?? [300, 200];
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '"><rect x="4" y="4" width="' + (w - 8) + '" height="' + (h - 8) +
    '" rx="18" fill="' + (ad === 'dere' ? '#e8f4ec' : '#fff7e6') + '" fill-opacity="' + (ad === 'dere' ? '1' : '.7') + '" stroke="#c48a2c" stroke-width="6" stroke-dasharray="22 14"/>' +
    (ad === 'dere' ? '<rect x="520" y="560" width="730" height="140" fill="#bfe6ee"/>' : '') +
    '<text x="50%" y="' + (ad === 'dere' ? 8 : 18) + '%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="' +
    Math.round(Math.min(w, h) / (ad === 'dere' ? 16 : 7)) + '" fill="#9a6a1c">' + ad + ' · Astra</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const cizim = (ad: string) => canlanmaCizimi('hece-koprusu/' + ad) ?? (TEST_MODU ? yerTutucu(ad) : undefined);

/** Durak yalnız Astra'nın bütün çizimleri gelince (ya da test kipinde) görünür. */
export function kopruHazirMi(): boolean {
  return TEST_MODU || CIZIMLER.every(ad => canlanmaCizimi('hece-koprusu/' + ad));
}
/** Bu yaşta ve bu harflerle oynanabilir sözcük sayısı (durak en az 3 sözcükle açılır; test kipinde hep açık). */
export function kopruSozcukSayisi(biten: string[], yas: KopruYasi) {
  return kopruAdaylari(resimliSozcukler(yas), bilinenHarfler(biten), yas).length;
}
export const kopruKarti = () => cizim('kart');

type Kayit = { tur: number; gorulen: Record<string, number> };
function kayitOku(): Kayit {
  try {
    const k = JSON.parse(dersKaydiniOku(KAYIT) || 'null');
    if (k && Number.isInteger(k.tur) && k.gorulen && typeof k.gorulen === 'object') return k;
  } catch { /* bozuk kayıt: baştan */ }
  return { tur: 0, gorulen: {} };
}

const yuzde = (x: number, y: number) => ({ left: (x / FON.w * 100) + '%', top: (y / FON.h * 100) + '%' });
const heceSesi = (s: HavuzSozcugu, i: number) => s.heceSesleri[i] ?? parcaSesi(s.heceler[i]);

export function heceKoprusuKur(alan: HTMLElement, oku: Oku, biten: string[], yas: KopruYasi, bitir: () => void): () => void {
  const an = new An();
  let kapali = false;
  const kayit = kayitOku();
  const kaynak = resimliSozcukler(yas);
  let adaylar = kopruAdaylari(kaynak, bilinenHarfler(biten), yas);
  // Test kipinde harf süzgeci sözcük bırakmazsa havuzun tamamı (akış denetlenebilsin).
  if (TEST_MODU && adaylar.length < 3) adaylar = kopruAdaylari(kaynak, new Set('abcçdefgğhıijklmnoöprsştuüvyz'), yas);
  const oturum = kopruOturumu(adaylar, kayit.gorulen);
  kayit.tur++;

  const kok = document.createElement('section');
  kok.className = 'hk-kopru';
  kok.setAttribute('aria-label', 'Lokum’un Hece Köprüsü');
  kok.innerHTML = '<div class="hk-sahne"><img class="hk-fon" src="' + cizim('dere') + '" alt="" draggable="false">' +
    '<div class="hk-sehpa" style="left:' + yuzde(SEHPA.x, SEHPA.y).left + ';top:' + yuzde(SEHPA.x, SEHPA.y).top + '"><img src="' + cizim('sehpa') + '" alt="" draggable="false">' +
    '<img class="hk-resim" alt="" draggable="false"></div>' +
    '<img class="hk-lokum" src="' + cizim('lokum-0') + '" alt="Lokum" draggable="false">' +
    '<button type="button" class="hk-dinle at-ses" aria-label="Sözcüğü yeniden dinle">' + IKON.hoparlor + '</button>' +
    '<p class="hk-durum" role="status"></p></div>';
  alan.replaceChildren(kok);
  const sahne = kok.querySelector<HTMLElement>('.hk-sahne')!, lokum = kok.querySelector<HTMLImageElement>('.hk-lokum')!;
  const resim = kok.querySelector<HTMLImageElement>('.hk-resim')!, durum = kok.querySelector<HTMLElement>('.hk-durum')!;
  const dinle = kok.querySelector<HTMLButtonElement>('.hk-dinle')!;
  // Telefonda sahnenin iki yanı: solda kıyı tepsisi (taşlar 64 px'ten iri), sağda Ceren ve büyük dinle düğmesi.
  yanPanolariKur(kok, dinle, { tepsi: true });
  // Kıyıdaki taşlar: tepsi görünüyorsa orada alt alta, görünmüyorsa (iPad, dikey) fonun kıyısında 2 × 2.
  const taslariYerlestir = () => {
    const tepsi = yanTepsi(kok);
    const kiyida = [...kok.querySelectorAll<HTMLButtonElement>('.hk-tas:not(.hk-suda)')];
    kiyida.forEach((b) => {
      const i = Number(b.dataset.sira);
      if (tepsi) { b.classList.add('hk-tepside'); Object.assign(b.style, { left: '50%', top: ((i + .5) / Math.max(4, kiyida.length) * 100) + '%' }); if (b.parentElement !== tepsi) tepsi.append(b); }
      else { b.classList.remove('hk-tepside'); Object.assign(b.style, yuzde(TEPSI[i].x, TEPSI[i].y)); if (b.parentElement !== sahne) sahne.append(b); }
    });
  };
  new ResizeObserver(() => { if (!kapali) taslariYerlestir(); }).observe(kok);
  const lokumYeri = (x: number, y: number) => Object.assign(lokum.style, yuzde(x, y));
  const kare = (n: number) => { lokum.src = cizim('lokum-' + n)!; };
  const sesler = (ids: string[], sonra?: () => void) => {
    const [ilk, ...kalan] = ids;
    if (kapali) return;
    if (!ilk) { sonra?.(); return; }
    oku(ilk, () => sesler(kalan, sonra));
  };

  let sira = 0;
  let suda: HTMLButtonElement[] = [];
  function sozcukKur(no: number) {
    if (kapali) return;
    const s = oturum[no];
    if (!s) { bitis(); return; }
    kayit.gorulen[s.id] = kayit.tur;
    try { dersKaydiniYaz(KAYIT, JSON.stringify(kayit)); } catch { /* kayıt yazılamasa da oyun sürer */ }
    sira = 0; suda = [];
    sahne.dataset.sozcuk = s.id; sahne.dataset.heceler = s.heceler.join(' ');
    sahne.dataset.evre = 'diz';
    kok.querySelectorAll('.hk-yuva,.hk-tas').forEach(e => e.remove());
    lokumYeri(LOKUM_BAS.x, LOKUM_BAS.y); kare(0);
    resim.src = s.gorsel; resim.alt = s.ad; resim.classList.remove('hk-acildi');
    const xler = YUVALAR[s.heceler.length] ?? YUVALAR[3];
    const yuvalar = s.heceler.map((_, i) => {
      const y = document.createElement('img');
      y.className = 'hk-yuva'; y.src = cizim('tas-bos')!; y.alt = ''; y.draggable = false;
      Object.assign(y.style, yuzde(xler[i], YUVA_Y));
      sahne.append(y); return y;
    });
    // Kıyıdaki taşlar: sözcüğün heceleri ve bir yanlış hece, karışık.
    const yanlis = yanlisHece(s, oturum);
    const tasHeceler = [...s.heceler, ...(yanlis ? [yanlis] : [])].map(h => ({ h, r: Math.random() })).sort((a, b) => a.r - b.r).map(x => x.h);
    const taslar = tasHeceler.map((h, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'hk-tas'; b.dataset.hece = h; b.dataset.sira = String(i);
      b.setAttribute('aria-label', h + ' hecesi');
      b.innerHTML = '<img src="' + cizim('tas') + '" alt="" draggable="false"><span>' + h + '</span>';
      Object.assign(b.style, yuzde(TEPSI[i].x, TEPSI[i].y));
      b.onclick = () => koy(b, s, yuvalar, taslar);
      sahne.append(b); return b;
    });
    taslariYerlestir();
    durum.textContent = s.ad + ': hecelerini sırayla suya koy.';
    dinle.onclick = () => sesler([adSesi(s.id)]);
    sesler([...(no === 0 ? ['kopru-giris'] : []), adSesi(s.id)]);
  }

  function koy(b: HTMLButtonElement, s: HavuzSozcugu, yuvalar: HTMLImageElement[], taslar: HTMLButtonElement[]) {
    if (kapali || sahne.dataset.evre !== 'diz' || b.disabled) return;
    const beklenen = s.heceler[sira];
    if (b.dataset.hece !== beklenen) {
      // Yanlış taş sallanır, suya batmaz; Ceren sıradaki heceyi söyler.
      oyunSesi('geri');
      if (!azHareket()) an.hareket(b, [{ transform: 'translate(-50%,-50%) rotate(0)' }, { transform: 'translate(calc(-50% - 7px),-50%) rotate(-6deg)' },
        { transform: 'translate(calc(-50% + 6px),-50%) rotate(5deg)' }, { transform: 'translate(-50%,-50%) rotate(0)' }], { duration: 300, easing: 'ease-in-out' });
      durum.textContent = 'Sıradaki hece: ' + beklenen;
      sesler(['kopru-sira', heceSesi(s, sira)]);
      return;
    }
    const yuva = yuvalar[sira];
    b.disabled = true; b.classList.add('hk-suda'); suda.push(b);
    const a = kabaGore(sahne, b), h = kabaGore(sahne, yuva);
    // Tepsideki taş sahneye geçer; uçuş tepsideki yerinden başlar (a, geçişten önce ölçüldü).
    if (b.parentElement !== sahne) { b.classList.remove('hk-tepside'); sahne.append(b); }
    Object.assign(b.style, { left: yuva.style.left, top: yuva.style.top });
    if (!azHareket()) an.hareket(b, [{ transform: 'translate(calc(-50% + ' + (a.cx - h.cx) + 'px), calc(-50% + ' + (a.cy - h.cy) + 'px)) scale(1)' },
      { transform: 'translate(calc(-50% + ' + (a.cx - h.cx) * .45 + 'px), calc(-50% + ' + ((a.cy - h.cy) * .45 - 60) + 'px)) scale(1.05)', offset: .55 },
      { transform: 'translate(-50%,-50%) scale(1.06,.9)', offset: .85 }, { transform: 'translate(-50%,-50%)' }], { duration: 420, easing: 'cubic-bezier(.3,.6,.4,1)' });
    an.sonra(azHareket() ? 0 : 380, () => {
      oyunSesi('damla');
      yuva.classList.add('hk-dolu');
      halka(h.cx, h.cy);
    });
    sira++;
    sesler([heceSesi(s, sira - 1)], () => { if (sira === s.heceler.length) gecis(s); });
    if (sira === s.heceler.length) taslar.forEach(t => { if (!t.disabled) { t.disabled = true; t.classList.add('hk-kenarda'); } });
  }

  function halka(x: number, y: number) {
    if (azHareket()) return;
    const k = an.ekle(sahne, document.createElement('img'));
    k.className = 'hk-halka'; k.alt = ''; k.draggable = false; k.src = cizim('halka-0')!;
    Object.assign(k.style, { left: x + 'px', top: (y + 18) + 'px' });
    [1, 2].forEach(n => an.sonra(n * 130, () => { k.src = cizim('halka-' + n)!; }));
    an.hareket(k, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .6 },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(1.1)' }], { duration: 520, easing: 'ease-out', fill: 'forwards' }).finished.then(() => an.kaldir(k), () => {});
  }

  /** Lokum taşların üstünden hece hece zıplar, son zıplayışta sehpaya ulaşır, sözcük okunur. */
  function gecis(s: HavuzSozcugu) {
    if (kapali) return;
    sahne.dataset.evre = 'gecis';
    durum.textContent = s.heceler.join(' – ') + '!';
    // Lokum taşın arka kenarına konar: hece okunur kalır.
    const duraklar = [...(YUVALAR[s.heceler.length] ?? YUVALAR[3]).map(x => ({ x, y: YUVA_Y - 34 })), { x: SEHPA.x - 150, y: SEHPA.y }];
    let nerede = { ...LOKUM_BAS };
    const zipla = (i: number) => {
      if (kapali) return;
      const hedef = duraklar[i];
      if (!hedef) return;
      const son = i === duraklar.length - 1;
      if (azHareket()) {
        lokumYeri(hedef.x, hedef.y);
        if (!son) sesler([heceSesi(s, i)], () => zipla(i + 1)); else varis(s);
        return;
      }
      kare(1);
      an.sonra(130, () => {
        kare(2);
        const ust = Math.min(nerede.y, hedef.y) - 150;
        an.hareket(lokum, [{ ...yuzde(nerede.x, nerede.y) }, { ...yuzde((nerede.x + hedef.x) / 2, ust), offset: .5 }, { ...yuzde(hedef.x, hedef.y) }],
          { duration: 460, easing: 'ease-in-out', fill: 'forwards' }).finished.then(() => {
          lokumYeri(hedef.x, hedef.y); nerede = hedef; kare(3);
          an.sonra(110, () => kare(0));
          if (!son) {
            // Lokum konunca taş suya hafifçe gömülüp çıkar.
            if (suda[i]) an.hareket(suda[i], [{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(-50%,-44%)', offset: .4 }, { transform: 'translate(-50%,-50%)' }], { duration: 260 });
            sesler([heceSesi(s, i)], () => an.sonra(120, () => zipla(i + 1)));
          } else varis(s);
        }, () => {});
      });
    };
    zipla(0);
  }

  function varis(s: HavuzSozcugu) {
    if (kapali) return;
    sahne.dataset.evre = 'vardi';
    resim.classList.add('hk-acildi');
    oyunSesi('parilti');
    const r = kabaGore(sahne, resim);
    isikSac(an, sahne, r.cx, r.cy, { adet: 8, uzaklik: r.w * .8, boy: Math.max(16, r.w * .22) });
    durum.textContent = s.ad + '!';
    sesler([adSesi(s.id)], () => an.sonra(700, () => sozcukKur(oturum.indexOf(s) + 1)));
  }

  function bitis() {
    if (kapali) return;
    sahne.dataset.evre = 'bitti';
    const son = document.createElement('div');
    son.className = 'hk-son';
    son.innerHTML = '<p>Lokum üç sözcükte de karşıya geçti!</p><div><button type="button" class="at-sec hk-geri">Hece Oyunu</button>' +
      '<button type="button" class="at-basla hk-yeniden">Yeni köprü ' + IKON.oyna + '</button></div>';
    sahne.append(son);
    // Kutlama: pırıltılar, Ceren alkışlar, Lokum karşı kıyıda iki kez sevinçle zıplar (kendi zıplama kareleriyle).
    bitisKutla(sahne);
    const sevinc = (n: number) => {
      if (kapali || n === 0 || azHareket()) { kare(0); return; }
      kare(1);
      an.sonra(120, () => {
        kare(2);
        an.hareket(lokum, [{ transform: 'translateY(0)' }, { transform: 'translateY(-24%)', offset: .5 }, { transform: 'translateY(0)' }], { duration: 440, easing: 'ease-in-out', composite: 'add' });
        an.sonra(440, () => { kare(3); an.sonra(130, () => sevinc(n - 1)); });
      });
    };
    an.sonra(200, () => sevinc(2));
    son.querySelector<HTMLButtonElement>('.hk-geri')!.onclick = bitir;
    son.querySelector<HTMLButtonElement>('.hk-yeniden')!.onclick = () => { kapat(); kapali = false; birakYeni = heceKoprusuKur(alan, oku, biten, yas, bitir); };
    sesler(['good']);
    son.querySelector<HTMLButtonElement>('.hk-yeniden')!.focus({ preventScroll: true });
  }

  let birakYeni: (() => void) | undefined;
  function kapat() { kapali = true; an.durdur(); }
  if (!oturum.length) {
    sahne.dataset.evre = 'bos';
    durum.textContent = 'Biraz daha harf öğrenince Lokum’la köprü kuracağız.';
  } else sozcukKur(0);
  return () => { kapat(); birakYeni?.(); };
}
