// Mino'nun Harf Kurabiyesi (2–3 ve 4 yaş; danışman ONERI-08 5B; Astra Paket Harf-H13, assets/alfabe/kurabiye/).
// Harf Albümü'nün içinden açılır (rafa yeni kart yok, ders akışına ve ders sonuna girmez; KULLANICI-KURALLARI 14 Kasım).
// Babaanne'nin tepsisinde 5–6 harfli kurabiye; Mino tabağıyla yalnız bir harfi ister (ör. Ö). Doğru kurabiye tabağa uçar
// ve harfin sesi çalar; yanlış kurabiye titrer, farkı parlar, Ceren farkı söyler ("Bunun noktası yok, bu O!"). Ceza yok.
// Üç kurabiye dolunca duvardaki zil çalar, Mino sevinir. Harfler kodla yazılır (yollar.ts), çizimler yalnız Astra'nın.
import { TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { An, azHareket, canlanmaCizimi, isikSac, kabaGore } from './canlanma';
import { bilinenHarfler } from './cumle-okuma-kurallari';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { ABC } from './posta-kutusu-secim';
import { farkSesi, harfCizgileri, harfSesi, HEDEF_SAYISI, isteSesi, siradakiTepsi, tepsiHarfleri, uygunCiftler } from './kurabiye-secim';
import { oyunSesi } from './oyun-sesi';
import './kurabiye.css';

type Oku = (id: string, sonra?: () => void) => void;
const FON = { w: 1672, h: 941 };
// Tepsi 1000 × 520, fonda 760 px genişlik; alt kenarı (836, 650). Kurabiye yerleri tepsi pikseliyle (brief).
const TEPSI = { x: 836, alt: 650, en: 760, oran: 1000 / 520 };
const OLCEK = TEPSI.en / 1000, TEPSI_SOL = TEPSI.x - TEPSI.en / 2, TEPSI_UST = TEPSI.alt - 510 * OLCEK;
const YER_6 = [[190, 150], [500, 150], [810, 150], [190, 370], [500, 370], [810, 370]];
const YER_5 = [[190, 150], [500, 150], [810, 150], [345, 370], [655, 370]];
const MINO = { x: 1440, y: 900, boy: 540 }, TABAK = { x: 300, y: 470 }, BABAANNE = { x: 240, y: 900, boy: 620 }, ZIL = { x: 1545, y: 120, en: 130 };
const KAYIT = 'minkino-kurabiye-v1';
const CIZIMLER = ['mutfak', 'tepsi', 'kurabiye', 'zil', 'dugme', 'mino-bekliyor', 'mino-seviniyor', 'babaanne'];
const OLCU: Record<string, [number, number]> = { mutfak: [1672, 941], tepsi: [1000, 520], kurabiye: [240, 240], zil: [200, 200], dugme: [320, 320], mino: [600, 800], babaanne: [600, 900] };

/** Test kipinde çizimin yerini ve adını gösteren kesik çizgili kutu (yalnız ?test=1; kodla çizim değil, yer işareti). */
function yerTutucu(ad: string): string {
  const [w, h] = OLCU[ad] ?? OLCU[ad.replace(/-.*$/, '')] ?? [300, 300];
  const fon = ad === 'mutfak';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '"><rect x="4" y="4" width="' + (w - 8) + '" height="' + (h - 8) +
    '" rx="' + (ad === 'kurabiye' ? 110 : 18) + '" fill="' + (fon ? '#fbefdc' : ad === 'kurabiye' ? '#f2c77c' : '#fff7e6') + '" fill-opacity="' + (fon ? 1 : .8) +
    '" stroke="#c48a2c" stroke-width="6" stroke-dasharray="22 14"/>' + (fon ? '<rect x="430" y="640" width="810" height="40" fill="#e3c08f"/>' : '') +
    (ad === 'kurabiye' ? '' : '<text x="50%" y="' + (fon ? 6 : 12) + '%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="' +
      Math.round(Math.min(w, h) / (fon ? 22 : 9)) + '" fill="#9a6a1c">' + ad + ' · Astra</text>') + '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const cizim = (ad: string) => canlanmaCizimi('kurabiye/' + ad) ?? (TEST_MODU ? yerTutucu(ad) : undefined);

/** Albümde düğme görünsün mü: çizimler hazır (ya da test kipi) ve iki harfi de bitmiş en az bir çift var. */
export function kurabiyeAcik(biten: string[]): boolean {
  const hazir = TEST_MODU || CIZIMLER.every(ad => canlanmaCizimi('kurabiye/' + ad));
  return hazir && uygunCiftler(bilinenHarfler(biten)).length > 0;
}
export const kurabiyeDugmesi = () => cizim('dugme');

type Kayit = { tepsi: number };
function kayitOku(): Kayit {
  try { const k = JSON.parse(dersKaydiniOku(KAYIT) || 'null'); if (k && Number.isInteger(k.tepsi)) return k; } catch { /* baştan */ }
  return { tepsi: 0 };
}
const yuzde = (x: number, y: number) => ({ left: (x / FON.w * 100) + '%', top: (y / FON.h * 100) + '%' });

/** Kurabiyenin üstündeki harf: çikolata çizgisi; fark çizgileri ve eksik işaretlerin kesik hayaleti ayrı sınıfla. */
function harfSvg(harf: string, es: string) {
  const { cizgiler, fark, hayalet } = harfCizgileri(harf, es);
  return '<svg class="kb-harf" viewBox="-5 -2 110 132" aria-hidden="true">' +
    cizgiler.map((d, i) => '<path d="' + d + '" class="kb-cizgi' + (fark.includes(i) ? ' kb-fark' : '') + '"/>').join('') +
    hayalet.map(d => '<path d="' + d + '" class="kb-hayalet"/>').join('') + '</svg>';
}

export function kurabiyeKur(alan: HTMLElement, oku: Oku, biten: string[], yas: '2-3' | '4', bitir: () => void): () => void {
  const an = new An();
  let kapali = false;
  const kayit = kayitOku();
  const bilinen = TEST_MODU && !uygunCiftler(bilinenHarfler(biten)).length ? new Set(ABC) : bilinenHarfler(biten);
  const tepsi = siradakiTepsi(uygunCiftler(bilinen), kayit.tepsi);
  kayit.tepsi++;
  try { dersKaydiniYaz(KAYIT, JSON.stringify(kayit)); } catch { /* kayıt yazılamasa da oyun sürer */ }

  const kok = document.createElement('section');
  kok.className = 'kb-kurabiye';
  kok.setAttribute('aria-label', 'Mino’nun Harf Kurabiyesi');
  const minoOlcek = MINO.boy / 800, babaOlcek = BABAANNE.boy / 900;
  kok.innerHTML = '<div class="kb-sahne"><img class="kb-fon" src="' + cizim('mutfak') + '" alt="" draggable="false">' +
    '<img class="kb-babaanne" src="' + cizim('babaanne') + '" alt="Babaanne" draggable="false">' +
    '<img class="kb-tepsi" src="' + cizim('tepsi') + '" alt="" draggable="false">' +
    '<img class="kb-zil" src="' + cizim('zil') + '" alt="" draggable="false">' +
    '<img class="kb-mino" src="' + cizim('mino-bekliyor') + '" alt="Mino" draggable="false">' +
    '<button type="button" class="kb-dinle at-ses" aria-label="Mino’nun istediğini dinle">' + IKON.hoparlor + '</button>' +
    '<p class="kb-durum" role="status"></p></div>';
  alan.replaceChildren(kok);
  const sahne = kok.querySelector<HTMLElement>('.kb-sahne')!, mino = kok.querySelector<HTMLImageElement>('.kb-mino')!;
  const zil = kok.querySelector<HTMLImageElement>('.kb-zil')!, durum = kok.querySelector<HTMLElement>('.kb-durum')!;
  Object.assign(kok.querySelector<HTMLElement>('.kb-babaanne')!.style, yuzde(BABAANNE.x - 300 * babaOlcek, BABAANNE.y - 880 * babaOlcek));
  Object.assign(kok.querySelector<HTMLElement>('.kb-tepsi')!.style, yuzde(TEPSI_SOL, TEPSI_UST));
  Object.assign(mino.style, yuzde(MINO.x - 300 * minoOlcek, MINO.y - 780 * minoOlcek));
  Object.assign(zil.style, yuzde(ZIL.x, ZIL.y));
  const tabak = { x: MINO.x + (TABAK.x - 300) * minoOlcek, y: MINO.y - (780 - TABAK.y) * minoOlcek };
  const sesler = (ids: (string | undefined)[], sonra?: () => void) => {
    const [ilk, ...kalan] = ids.filter((x): x is string => !!x);
    if (kapali) return;
    if (!ilk) { sonra?.(); return; }
    oku(ilk, () => sesler(kalan, sonra));
  };

  if (!tepsi) {
    sahne.dataset.evre = 'bos';
    durum.textContent = 'Biraz daha harf öğrenince Mino’yla kurabiye seçeceğiz.';
    return () => { kapali = true; an.durdur(); };
  }
  const { hedef, es } = tepsi;
  sahne.dataset.hedef = hedef; sahne.dataset.es = es; sahne.dataset.evre = 'sec';
  const yerler = yas === '4' ? YER_6 : YER_5;
  const harfler = tepsiHarfleri(hedef, es, yas);
  let tabakta = 0;
  harfler.forEach((h, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'kb-tane'; b.dataset.harf = h;
    b.setAttribute('aria-label', h + ' kurabiyesi');
    b.innerHTML = '<img src="' + cizim('kurabiye') + '" alt="" draggable="false">' + harfSvg(h, h === hedef ? es : hedef);
    const [tx, ty] = yerler[i];
    Object.assign(b.style, yuzde(TEPSI_SOL + tx * OLCEK, TEPSI_UST + ty * OLCEK));
    b.onclick = () => sec(b);
    sahne.append(b);
  });
  durum.textContent = 'Mino ' + hedef + ' kurabiyesi istiyor.';
  kok.querySelector<HTMLButtonElement>('.kb-dinle')!.onclick = () => sesler([isteSesi(hedef)]);
  sesler([kayit.tepsi === 1 || TEST_MODU ? 'kurabiye-giris' : undefined, isteSesi(hedef)]);

  function sec(b: HTMLButtonElement) {
    if (kapali || sahne.dataset.evre !== 'sec' || b.disabled) return;
    const h = b.dataset.harf!;
    if (h !== hedef) {
      // Yanlış: kurabiye titrer, farkı parlar (ya da eksik işaret kesik çizgiyle belirir), Ceren farkı söyler.
      oyunSesi('geri');
      if (!azHareket()) an.hareket(b, [{ transform: 'translate(-50%,-50%) rotate(0)' }, { transform: 'translate(calc(-50% - 6px),-50%) rotate(-7deg)' },
        { transform: 'translate(calc(-50% + 6px),-50%) rotate(6deg)' }, { transform: 'translate(-50%,-50%) rotate(0)' }], { duration: 340, easing: 'ease-in-out' });
      b.classList.remove('kb-goster'); void b.offsetWidth; b.classList.add('kb-goster');
      an.sonra(2600, () => b.classList.remove('kb-goster'));
      durum.textContent = 'Bu ' + h + '. Mino ' + hedef + ' istiyor.';
      sesler([farkSesi(hedef, h)]);
      return;
    }
    b.disabled = true; b.classList.add('kb-tabakta');
    const no = tabakta++;
    // Tabakta yan yana üç küçük kurabiye; tabak çenenin altında olduğu için üst üste konmaz (yüzü örtmesin).
    const yigin = [[-40, -4], [0, -8], [40, -4]][no];
    const hedefYer = { x: tabak.x + yigin[0], y: tabak.y + yigin[1] };
    const a = kabaGore(sahne, b), k = sahne.getBoundingClientRect();
    const hx = hedefYer.x / FON.w * k.width, hy = hedefYer.y / FON.h * k.height;
    Object.assign(b.style, yuzde(hedefYer.x, hedefYer.y));
    if (!azHareket()) an.hareket(b, [{ transform: 'translate(calc(-50% + ' + (a.cx - hx) + 'px), calc(-50% + ' + (a.cy - hy) + 'px)) scale(1)' },
      { transform: 'translate(calc(-50% + ' + (a.cx - hx) * .45 + 'px), calc(-50% + ' + ((a.cy - hy) * .45 - k.height * .14) + 'px)) scale(.8) rotate(-10deg)', offset: .55 },
      { transform: 'translate(-50%,-50%) scale(.3)' }], { duration: 520, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
    else b.style.transform = 'translate(-50%,-50%) scale(.3)';
    an.sonra(azHareket() ? 0 : 480, () => { oyunSesi('kutu'); });
    durum.textContent = hedef + '! ' + tabakta + ' / ' + HEDEF_SAYISI;
    sesler([harfSesi(hedef)], () => { if (tabakta === HEDEF_SAYISI) bitti(); });
    if (tabakta === HEDEF_SAYISI) { sahne.dataset.evre = 'doldu'; sahne.querySelectorAll<HTMLButtonElement>('.kb-tane:not(.kb-tabakta)').forEach(x => { x.disabled = true; }); }
  }

  function bitti() {
    if (kapali) return;
    mino.src = cizim('mino-seviniyor')!;
    oyunSesi('zil');
    if (!azHareket()) an.hareket(zil, [{ transform: 'translate(-50%,0) rotate(0)' }, { transform: 'translate(-50%,0) rotate(-14deg)', offset: .2 },
      { transform: 'translate(-50%,0) rotate(12deg)', offset: .45 }, { transform: 'translate(-50%,0) rotate(-8deg)', offset: .7 }, { transform: 'translate(-50%,0) rotate(0)' }],
      { duration: 900, easing: 'ease-out' });
    const t = kabaGore(sahne, mino);
    isikSac(an, sahne, t.cx, t.y + t.h * .5, { adet: 9, uzaklik: t.w * .5, boy: Math.max(16, t.w * .1) });
    durum.textContent = 'Mino’nun tabağı doldu!';
    sesler(['kurabiye-zil'], () => an.sonra(400, son));
  }

  function son() {
    if (kapali) return;
    sahne.dataset.evre = 'bitti';
    const s = document.createElement('div');
    s.className = 'kb-son';
    s.innerHTML = '<p>Mino’nun tabağı doldu!</p><div><button type="button" class="at-sec kb-geri">Albüm</button>' +
      '<button type="button" class="at-basla kb-yeniden">Bir tepsi daha ' + IKON.oyna + '</button></div>';
    sahne.append(s);
    s.querySelector<HTMLButtonElement>('.kb-geri')!.onclick = bitir;
    s.querySelector<HTMLButtonElement>('.kb-yeniden')!.onclick = () => { kapat(); kapali = false; yeni = kurabiyeKur(alan, oku, biten, yas, bitir); };
    s.querySelector<HTMLButtonElement>('.kb-yeniden')!.focus({ preventScroll: true });
  }

  let yeni: (() => void) | undefined;
  function kapat() { kapali = true; an.durdur(); }
  return () => { kapat(); yeni?.(); };
}
