// Dede'nin Posta Kutusu (Hece Oyunu'nun dördüncü durağı, 5+ yaş; yönetici, 20 Kasım; Astra Harf-H10).
// Dede bahçe kapısında resimli bir zarf tutar; zarfta boş pul yuvaları, yukarıda karışık harf pulları ve bir çeldirici.
// Çocuk pulları sırayla yapıştırır; ünlü pul kendi sesini söyler, ünsüz pul "küt" diye yapışır ve ünlü gelince hece duyulur
// (posta-kutusu-secim.ts → pulSesleri). Zarf dolunca Ceren sözcüğü okur, kutu açılır, zarf içine uçar, kutudan Mino'ya
// küçük bir sürpriz kart çıkar, Dede sevinçle el sallar. Yanlış pul yuvaya oturmaz, geri kayar; ceza yok.
// Bir oturumda 3 zarf, tekrar yok. Yerler fon ölçüsünde (1672 × 941), brief'le birebir.
// Çizimler (assets/alfabe/posta-kutusu/) gelene kadar durak uygulamada görünmez; test kipinde yer tutucularla oynanır.
import { TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { An, azHareket, canlanmaCizimi, isikSac, kabaGore } from './canlanma';
import { bilinenHarfler } from './cumle-okuma-kurallari';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { cerenKaydiVar } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { parcaSesi } from './pano-sozcukleri';
import { ABC, celdirici, harfleri, postaAdaylari, postaOturumu, pulSesleri, type PostaSozcugu } from './posta-kutusu-secim';
import { resimliSozcukler } from './sozcuk-kaynagi';
import { yanPanolariKur } from './yan-pano';
import { bitisKutla } from './cila';
import './posta-kutusu.css';

type Oku = (id: string, sonra?: () => void) => void;
const FON = { w: 1672, h: 941 };
// Astra'nın çiziminde açık el x ≈ 550'de (brief 580): Dede biraz sağda durur, eli zarfın sol kenarını önden kavrar.
const DEDE = { x: 282, y: 890 };
const ZARF = { x: 474, y: 422, w: 800, h: 440 };
const YUVA_Y = ZARF.y + 220;
const YUVALAR: Record<number, number[]> = { 2: [495, 605], 3: [440, 550, 660], 4: [385, 495, 605, 715] };
const KUTU = { x: 1480, y: 890 }, AGIZ = { x: 1480, y: 460 };
const TEPSI_Y = 150, TEPSI_ARA = 160, TEPSI_ORTA = 880;
const KART_ORTA = { x: 836, y: 300 };
const KARTLIK = [{ x: 95, y: 120 }, { x: 205, y: 120 }, { x: 315, y: 120 }];
const KAYIT = 'minkino-posta-kutusu-v1';
const CIZIMLER = ['bahce', 'kutu-kapali', 'kutu-acik', 'zarf', 'pul', 'pul-yuva', 'dede-tutuyor', 'dede-salliyor', 'surpriz-0', 'surpriz-1', 'surpriz-2', 'kart'];
const OLCU: Record<string, [number, number]> = { bahce: [1672, 941], kutu: [360, 640], zarf: [800, 440], pul: [160, 190], 'pul-yuva': [160, 190], dede: [600, 800], surpriz: [400, 300], kart: [840, 560] };

/** Test kipinde çizimin yerini ve adını gösteren kesik çizgili kutu (yalnız ?test=1; kodla çizim değil, yer işareti). */
function yerTutucu(ad: string): string {
  const tur = ad.replace(/-(\d|kapali|acik|tutuyor|salliyor)$/, '');
  const [w, h] = OLCU[ad] ?? OLCU[tur] ?? [300, 200];
  const fon = ad === 'bahce';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '"><rect x="4" y="4" width="' + (w - 8) + '" height="' + (h - 8) +
    '" rx="18" fill="' + (fon ? '#eef6e6' : '#fff7e6') + '" fill-opacity="' + (fon ? '1' : '.75') + '" stroke="#c48a2c" stroke-width="6" stroke-dasharray="22 14"/>' +
    (fon ? '<rect x="0" y="890" width="1672" height="51" fill="#cfe3b5"/>' : '') +
    (ad === 'zarf' ? '<rect x="40" y="90" width="260" height="260" fill="#fff" stroke="#c48a2c" stroke-width="3"/>' : '') +
    '<text x="50%" y="' + (fon ? 4 : 12) + '%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="' +
    Math.round(Math.min(w, h) / (fon ? 22 : 8)) + '" fill="#9a6a1c">' + ad + ' · Astra</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const cizim = (ad: string) => canlanmaCizimi('posta-kutusu/' + ad) ?? (TEST_MODU ? yerTutucu(ad) : undefined);

/** Zarfa girebilecek sözcükler: resmi ve Ceren'in ad kaydı olan her sözcük; önce Astra'nın havuz resimleri. */
function sozcukler(): PostaSozcugu[] {
  // Havuz, Pano, Obur ve Harf Kutusu sözcükleri (sozcuk-kaynagi.ts); 2–4 harf süzgeci posta-kutusu-secim.ts'de.
  return resimliSozcukler('5+').map(s => ({ id: s.id, ad: s.ad, gorsel: s.gorsel, ses: s.ses })).filter(s => s.gorsel && cerenKaydiVar(s.ses));
}

/** Durak yalnız Astra'nın bütün çizimleri gelince (ya da test kipinde) görünür. */
export function postaHazirMi(): boolean {
  return TEST_MODU || CIZIMLER.every(ad => canlanmaCizimi('posta-kutusu/' + ad));
}
/** Bu harflerle yazılabilen zarf sayısı (durak en az 3 sözcükle açılır; test kipinde hep açık). */
export const postaSozcukSayisi = (biten: string[]) => postaAdaylari(sozcukler(), bilinenHarfler(biten)).length;
export const postaKarti = () => cizim('kart');

type Kayit = { tur: number; gorulen: Record<string, number> };
function kayitOku(): Kayit {
  try {
    const k = JSON.parse(dersKaydiniOku(KAYIT) || 'null');
    if (k && Number.isInteger(k.tur) && k.gorulen && typeof k.gorulen === 'object') return k;
  } catch { /* bozuk kayıt: baştan */ }
  return { tur: 0, gorulen: {} };
}

const yuzde = (x: number, y: number) => ({ left: (x / FON.w * 100) + '%', top: (y / FON.h * 100) + '%' });

export function postaKutusuKur(alan: HTMLElement, oku: Oku, biten: string[], bitir: () => void): () => void {
  const an = new An();
  let kapali = false;
  const kayit = kayitOku();
  let bilinen = bilinenHarfler(biten);
  let adaylar = postaAdaylari(sozcukler(), bilinen);
  // Test kipinde harf süzgeci sözcük bırakmazsa bütün harfler (akış denetlenebilsin).
  if (TEST_MODU && adaylar.length < 3) { bilinen = new Set(ABC); adaylar = postaAdaylari(sozcukler(), bilinen); }
  const oturum = postaOturumu(adaylar, kayit.gorulen);
  kayit.tur++;

  const kok = document.createElement('section');
  kok.className = 'pk-posta';
  kok.setAttribute('aria-label', 'Dede’nin Posta Kutusu');
  kok.innerHTML = '<div class="pk-sahne"><img class="pk-fon" src="' + cizim('bahce') + '" alt="" draggable="false">' +
    '<img class="pk-kutu" src="' + cizim('kutu-kapali') + '" alt="Posta kutusu" draggable="false">' +
    '<div class="pk-zarf"><img class="pk-zarf-cizim" src="' + cizim('zarf') + '" alt="" draggable="false"><img class="pk-resim" alt="" draggable="false"></div>' +
    '<img class="pk-dede" src="' + cizim('dede-tutuyor') + '" alt="Dede" draggable="false">' +
    '<button type="button" class="pk-dinle at-ses" aria-label="Sözcüğü yeniden dinle">' + IKON.hoparlor + '</button>' +
    '<p class="pk-durum" role="status"></p></div>';
  alan.replaceChildren(kok);
  const sahne = kok.querySelector<HTMLElement>('.pk-sahne')!, zarf = kok.querySelector<HTMLElement>('.pk-zarf')!;
  const resim = kok.querySelector<HTMLImageElement>('.pk-resim')!, dede = kok.querySelector<HTMLImageElement>('.pk-dede')!;
  const kutu = kok.querySelector<HTMLImageElement>('.pk-kutu')!, durum = kok.querySelector<HTMLElement>('.pk-durum')!;
  const dinle = kok.querySelector<HTMLButtonElement>('.pk-dinle')!;
  yanPanolariKur(kok, dinle); // telefonda sahnenin iki yanı: Ceren ve büyük dinle düğmesi
  Object.assign(dede.style, yuzde(DEDE.x, DEDE.y));
  Object.assign(kutu.style, yuzde(KUTU.x, KUTU.y));
  Object.assign(zarf.style, yuzde(ZARF.x, ZARF.y));
  const sesler = (ids: (string | undefined)[], sonra?: () => void) => {
    const [ilk, ...kalan] = ids.filter((x): x is string => !!x);
    if (kapali) return;
    if (!ilk) { sonra?.(); return; }
    oku(ilk, () => sesler(kalan, sonra));
  };

  let sira = 0, siraUyarisi = false;
  const toplanan: HTMLImageElement[] = [];

  function zarfKur(no: number) {
    if (kapali) return;
    const s = oturum[no];
    if (!s) { bitis(); return; }
    kayit.gorulen[s.id] = kayit.tur;
    try { dersKaydiniYaz(KAYIT, JSON.stringify(kayit)); } catch { /* kayıt yazılamasa da oyun sürer */ }
    const harf = harfleri(s.ad);
    const pulSesi = pulSesleri(s.ad, cerenKaydiVar, parcaSesi);
    sira = 0;
    sahne.dataset.sozcuk = s.id; sahne.dataset.harfler = harf.join(' '); sahne.dataset.evre = 'diz';
    sahne.querySelectorAll('.pk-yuva,.pk-pul').forEach(e => e.remove());
    dede.src = cizim('dede-tutuyor')!; kutu.src = cizim('kutu-kapali')!;
    zarf.getAnimations().forEach(a => a.cancel());
    zarf.hidden = false; zarf.classList.remove('pk-gitti');
    resim.src = s.gorsel; resim.alt = s.ad;
    if (!azHareket()) an.hareket(zarf, [{ opacity: 0, transform: 'translateX(-6%)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'ease-out' });
    const xler = YUVALAR[harf.length] ?? YUVALAR[4];
    const yuvalar = harf.map((_, i) => {
      const y = document.createElement('img');
      y.className = 'pk-yuva'; y.src = cizim('pul-yuva')!; y.alt = ''; y.draggable = false;
      Object.assign(y.style, yuzde(ZARF.x + xler[i], YUVA_Y));
      sahne.append(y); return y;
    });
    if (!azHareket()) yuvalar.forEach(y => an.hareket(y, [{ opacity: 0 }, { opacity: 0, offset: .3 }, { opacity: 1 }], { duration: 380, easing: 'ease-out' }));
    // Yukarıdaki pullar: sözcüğün harfleri ve bir çeldirici, karışık.
    const fazla = celdirici(s.ad, bilinen);
    const pulHarfleri = [...harf, ...(fazla ? [fazla] : [])].map(h => ({ h, r: Math.random() })).sort((a, b) => a.r - b.r).map(x => x.h);
    // Telefonda (geniş kap, yan panolar açık) pullar 64 px'lik dokunma alanı için daha aralıklı (en çok 200 birim).
    const ara = kok.clientWidth / Math.max(1, kok.clientHeight) > 2.05 ? Math.min(200, 900 / Math.max(1, pulHarfleri.length - 1)) : TEPSI_ARA;
    const pullar = pulHarfleri.map((h, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pk-pul'; b.dataset.harf = h;
      b.setAttribute('aria-label', h + ' pulu');
      b.innerHTML = '<img src="' + cizim('pul') + '" alt="" draggable="false"><span>' + h + '</span>';
      Object.assign(b.style, yuzde(TEPSI_ORTA + (i - (pulHarfleri.length - 1) / 2) * ara, TEPSI_Y));
      b.onclick = () => yapistir(b, s, harf, pulSesi, yuvalar, pullar);
      sahne.append(b); return b;
    });
    durum.textContent = 'Harf pullarını sırayla zarfa yapıştır.';
    dinle.onclick = () => sesler([s.ses]);
    sesler([no === 0 ? 'posta-giris' : undefined, s.ses]);
  }

  function yapistir(b: HTMLButtonElement, s: PostaSozcugu, harf: string[], pulSesi: (string | undefined)[], yuvalar: HTMLImageElement[], pullar: HTMLButtonElement[]) {
    if (kapali || sahne.dataset.evre !== 'diz' || b.disabled) return;
    const yuva = yuvalar[sira];
    if (b.dataset.harf !== harf[sira]) {
      // Yanlış pul yuvaya doğru kayar, oturmaz, geri döner; Ceren sözcüğü yeniden okur.
      oyunSesi('geri');
      if (!azHareket()) {
        const a = kabaGore(sahne, b), h = kabaGore(sahne, yuva);
        const dx = (h.cx - a.cx) * .25, dy = (h.cy - a.cy) * .25;
        an.hareket(b, [{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) rotate(-4deg)', offset: .45 },
          { transform: 'translate(calc(-50% + ' + dx * .2 + 'px),calc(-50% + ' + dy * .2 + 'px)) rotate(3deg)', offset: .8 }, { transform: 'translate(-50%,-50%)' }], { duration: 520, easing: 'ease-in-out' });
      }
      durum.textContent = 'Sözcüğü dinle: ' + s.ad.toLocaleLowerCase('tr');
      sesler([siraUyarisi ? undefined : 'posta-sira', s.ses]);
      siraUyarisi = true;
      return;
    }
    b.disabled = true; b.classList.add('pk-yapisti');
    const a = kabaGore(sahne, b), h = kabaGore(sahne, yuva);
    Object.assign(b.style, { left: yuva.style.left, top: yuva.style.top });
    if (!azHareket()) an.hareket(b, [{ transform: 'translate(calc(-50% + ' + (a.cx - h.cx) + 'px), calc(-50% + ' + (a.cy - h.cy) + 'px)) scale(1.35)' },
      { transform: 'translate(calc(-50% + ' + (a.cx - h.cx) * .35 + 'px), calc(-50% + ' + (a.cy - h.cy) * .35 + 'px)) scale(1.25) rotate(6deg)', offset: .55 },
      { transform: 'translate(-50%,-50%) scale(.92) rotate(-2deg)', offset: .85 }, { transform: 'translate(-50%,-50%)' }], { duration: 440, easing: 'cubic-bezier(.3,.6,.4,1)' });
    const i = sira;
    sira++;
    const tamam = sira === harf.length;
    if (tamam) pullar.forEach(p => { if (!p.disabled) { p.disabled = true; p.classList.add('pk-kenarda'); } });
    an.sonra(azHareket() ? 0 : 400, () => {
      oyunSesi('kutu');
      yuva.classList.add('pk-dolu');
      if (tamam) gonder(s); else sesler([pulSesi[i]]);
    });
  }

  /** Ceren sözcüğü okur, kutu açılır, zarf içine uçar, Mino'ya sürpriz kart çıkar, Dede el sallar. */
  function gonder(s: PostaSozcugu) {
    if (kapali) return;
    sahne.dataset.evre = 'gonder';
    durum.textContent = s.ad + '!';
    const no = oturum.indexOf(s);
    sesler([s.ses], () => an.sonra(250, () => {
      if (kapali) return;
      kutu.src = cizim('kutu-acik')!;
      oyunSesi('kagit');
      const z = kabaGore(sahne, zarf), k = sahne.getBoundingClientRect();
      const hx = AGIZ.x / FON.w * k.width - (z.x + z.w / 2), hy = AGIZ.y / FON.h * k.height - (z.y + z.h / 2);
      const uc = () => {
        zarf.classList.add('pk-gitti');
        sahne.querySelectorAll<HTMLElement>('.pk-yapisti').forEach(p => { p.hidden = true; });
        surpriz(no);
      };
      if (azHareket()) { uc(); return; }
      // Pullar zarfla birlikte uçar.
      sahne.querySelectorAll<HTMLElement>('.pk-yapisti').forEach(p => {
        an.hareket(p, [{ opacity: 1 }, { opacity: 0, offset: .35 }, { opacity: 0 }], { duration: 700, fill: 'forwards' });
      });
      an.hareket(zarf, [{ transform: 'none' }, { transform: 'translate(' + hx * .5 + 'px,' + (hy * .5 - k.height * .12) + 'px) scale(.55) rotate(-8deg)', offset: .5 },
        { transform: 'translate(' + hx + 'px,' + hy + 'px) scale(.12) rotate(4deg)' }], { duration: 700, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' })
        .finished.then(uc, () => {});
    }));
  }

  function surpriz(no: number) {
    if (kapali) return;
    dede.src = cizim('dede-salliyor')!;
    const kart = an.ekle(sahne, document.createElement('img'));
    kart.className = 'pk-surpriz'; kart.alt = 'Mino’ya sürpriz kart'; kart.draggable = false;
    kart.src = cizim('surpriz-' + (no % 3))!;
    Object.assign(kart.style, yuzde(KART_ORTA.x, KART_ORTA.y));
    oyunSesi('parilti');
    const devam = () => an.sonra(500, () => {
      if (kapali) return;
      kutu.src = cizim('kutu-kapali')!;
      // Kart Mino'nun kartlarının arasına (sol üst) küçülerek gider.
      const yer = KARTLIK[toplanan.length] ?? KARTLIK[2];
      const kucuk = document.createElement('img');
      kucuk.className = 'pk-kartlik'; kucuk.src = kart.src; kucuk.alt = ''; kucuk.draggable = false;
      Object.assign(kucuk.style, yuzde(yer.x, yer.y));
      const son = () => { an.kaldir(kart); sahne.append(kucuk); toplanan.push(kucuk); sahne.dataset.evre = 'vardi'; an.sonra(450, () => zarfKur(no + 1)); };
      if (azHareket()) { son(); return; }
      const k = sahne.getBoundingClientRect();
      const dx = (yer.x - KART_ORTA.x) / FON.w * k.width, dy = (yer.y - KART_ORTA.y) / FON.h * k.height;
      an.hareket(kart, [{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(.28)' }],
        { duration: 520, easing: 'ease-in-out', fill: 'forwards' }).finished.then(son, () => {});
    });
    if (azHareket()) { sesler([no === 0 ? 'posta-surpriz' : undefined], devam); return; }
    const k = sahne.getBoundingClientRect();
    const ax = (AGIZ.x - KART_ORTA.x) / FON.w * k.width, ay = (AGIZ.y - KART_ORTA.y) / FON.h * k.height;
    an.hareket(kart, [{ transform: 'translate(calc(-50% + ' + ax + 'px),calc(-50% + ' + ay + 'px)) scale(.15)', opacity: 0 },
      { transform: 'translate(calc(-50% + ' + ax * .4 + 'px),calc(-50% + ' + (ay * .4 - k.height * .1) + 'px)) scale(.7) rotate(-6deg)', opacity: 1, offset: .5 },
      { transform: 'translate(-50%,-50%) scale(1.06) rotate(2deg)', offset: .85 }, { transform: 'translate(-50%,-50%)' }], { duration: 760, easing: 'cubic-bezier(.3,.7,.4,1)' })
      .finished.then(() => {
        const r = kabaGore(sahne, kart);
        isikSac(an, sahne, r.cx, r.cy, { adet: 8, uzaklik: r.w * .65, boy: Math.max(16, r.w * .16) });
        sesler([no === 0 ? 'posta-surpriz' : undefined], () => an.sonra(no === 0 ? 300 : 900, devam));
      }, () => {});
  }

  function bitis() {
    if (kapali) return;
    sahne.dataset.evre = 'bitti';
    zarf.hidden = true;
    const son = document.createElement('div');
    son.className = 'pk-son';
    son.innerHTML = '<p>Dede’nin üç mektubu da yola çıktı!</p><div class="pk-son-kartlar">' +
      toplanan.map(k => '<img src="' + k.src + '" alt="" draggable="false">').join('') + '</div>' +
      '<div><button type="button" class="at-sec pk-geri">Hece Oyunu</button>' +
      '<button type="button" class="at-basla pk-yeniden">Yeni mektup ' + IKON.oyna + '</button></div>';
    sahne.append(son);
    // Kutlama: pırıltılar, Ceren alkışlar, Dede el sallar.
    dede.src = cizim('dede-salliyor')!;
    bitisKutla(sahne);
    son.querySelector<HTMLButtonElement>('.pk-geri')!.onclick = bitir;
    son.querySelector<HTMLButtonElement>('.pk-yeniden')!.onclick = () => { kapat(); kapali = false; birakYeni = postaKutusuKur(alan, oku, biten, bitir); };
    sesler(['good']);
    son.querySelector<HTMLButtonElement>('.pk-yeniden')!.focus({ preventScroll: true });
  }

  let birakYeni: (() => void) | undefined;
  function kapat() { kapali = true; an.durdur(); }
  if (!oturum.length) {
    sahne.dataset.evre = 'bos';
    zarf.hidden = true;
    durum.textContent = 'Biraz daha harf öğrenince Dede’yle mektup yollayacağız.';
  } else zarfKur(0);
  return () => { kapat(); birakYeni?.(); };
}
