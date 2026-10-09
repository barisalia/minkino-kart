/**
 * Kino'nun buz mavisi otobüsü (açılış, gün girişi, akşam dükkânı): gövde (A1 görseli ya da yer tutucu kod çizimi),
 * alınan süsler anında takılı (kemik tabela, flama, çatı külahı, ampuller, yıldız jantlar, boya), kapak açılınca tente.
 * Kino'ya iskeletin üstüne önlük ve şapka (dükkândan alındıysa kiraz tepeli şapka).
 */
import { Karakter } from '../../src/karakter/karakter';
import { h } from '../../src/ui/dom';
import { KINO_KIRAZ_SAPKA, KINO_ONLUK, KINO_SAPKA, tenteSvg } from './cizim';
import { BOYA } from './model';
import { adres, geldiMi, gorsel, OTOBUS_YERI, type VarlikAdi } from './varliklar';

const yuzde = (v: number) => `${(v * 100).toFixed(2)}%`;

/** Bir süs katmanı: merkez (x, y) ve en (otobüs tuvalinin oranı) */
function katman(ad: VarlikAdi, sinif: string, y: { x: number; y: number; en: number }): HTMLElement {
  return h(`div.ko-ob-sus.${sinif}`, { style: `left:${yuzde(y.x)};top:${yuzde(y.y)};width:${yuzde(y.en)}`, html: gorsel(ad) });
}

/**
 * Teker katmanı: otobüs resminin teker dairesi (merkez x, y; yarıçap r tuval eninin oranı). Kutu 2r × 2r; arka plan
 * resmin tamamı, teker kutunun ortasına gelecek kaydırmayla. Döndürülünce teker döner (giriş).
 */
export function tekerKatmani(url: string, t: { x: number; y: number; r: number }): HTMLElement {
  const oran = 9 / 16; // tuvalin boy / en oranı
  const resimEn = 1 / (2 * t.r); // kutu eni = 1
  const resimBoy = resimEn * oran;
  const px = (0.5 - t.x * resimEn) / (1 - resimEn);
  const py = (0.5 - t.y * resimBoy) / (1 - resimBoy);
  return h('i.ko-ob-teker', {
    style: `left:${yuzde(t.x - t.r)};top:${yuzde(t.y - t.r / oran)};width:${yuzde(2 * t.r)};background-image:url("${url}");background-size:${(resimEn * 100).toFixed(1)}% auto;background-position:${yuzde(px)} ${yuzde(py)}`,
  });
}

/** Otobüs: alınan süslerle */
export function otobusEl(o: { alinan: readonly string[]; boya: string; acik?: boolean; sinif?: string }): HTMLElement {
  const el = h(`div.ko-otobus${o.sinif ? `.${o.sinif}` : ''}`, { 'aria-hidden': 'true' });
  otobusGuncelle(el, o);
  return el;
}

/** Süsleri ve boyayı yeniden takar (dükkânda alınınca anında) */
export function otobusGuncelle(el: HTMLElement, o: { alinan: readonly string[]; boya: string; acik?: boolean }) {
  const b = BOYA[o.boya] ?? BOYA.buz;
  el.style.setProperty('--boya', b.govde);
  el.style.setProperty('--boya-koyu', b.koyu);
  // Gemini otobüsü boyanamaz (tek görsel): renk filtresiyle yaklaşık boya
  el.style.setProperty('--boya-filtre', geldiMi('otobus') ? b.filtre : 'none');
  el.dataset.boya = o.boya;
  const var_ = (id: string) => o.alinan.includes(id);
  const Y = OTOBUS_YERI;
  const govde = h('div.ko-ob-govde-kap', { html: gorsel('otobus', 'ko-ob-govde-g') });
  const url = adres('otobus');
  el.classList.toggle('ko-ob-resimli', !!url);
  // Gemini otobüsünde tekerler resmin parçası: girişte dönsünler diye aynı resimden kesilmiş yuvarlak katman
  if (url) govde.append(...Y.teker.map((t) => tekerKatmani(url, t)));
  const parcalar: (HTMLElement | null)[] = [
    var_('cati-kulah') ? katman('sus-cati-kulah', 'ko-ob-catikulah', Y.kulah) : null,
    govde,
    var_('ampul') ? katman('sus-ampul', 'ko-ob-ampul', Y.ampul) : null,
    h('div.ko-ob-kapak-acik', { style: `left:${yuzde(Y.kapak.x - Y.kapak.en / 2)};top:${yuzde(Y.kapak.y - Y.kapak.boy / 2)};width:${yuzde(Y.kapak.en)};height:${yuzde(Y.kapak.boy)}` }, h('i.ko-ob-isik'), h('div.ko-ob-tente', { html: tenteSvg() })),
    var_('flama') ? katman('sus-flama', 'ko-ob-flama', Y.flama) : null,
    var_('kemik-tabela') ? katman('sus-kemik-tabela', 'ko-ob-tabela', Y.tabela) : null,
    ...(var_('jant') ? Y.jant.map((j) => katman('sus-jant', 'ko-ob-jant', j)) : []),
  ];
  el.replaceChildren(...parcalar.filter((x): x is HTMLElement => !!x));
  el.dataset.susler = o.alinan.join(' ');
  el.classList.toggle('ko-ob-acik', !!o.acik);
}

/** Otobüsün kapağını açar / kapar (tente iner) */
export const kapakAc = (el: HTMLElement, acik: boolean) => el.classList.toggle('ko-ob-acik', acik);

/** Görselin önceden yüklenecek adresleri (otobüs ve süsleri) */
export const otobusAdresleri = (): string[] => (['otobus', 'sus-cati-kulah', 'sus-ampul', 'sus-flama', 'sus-kemik-tabela', 'sus-jant'] as VarlikAdi[]).map((a) => adres(a)).filter((u): u is string => !!u);

/**
 * Kino: önlüklü ve şapkalı dondurmacı. Kiraz tepeli şapka dükkândan alındıysa o. Gemini görselleri gelince (kino-onluk,
 * kino-sapka, sus-kino-kiraz-sapka) iskeletin kafa / gövde katmanına görsel olarak eklenir.
 */
export function dondurmaciKino(kirazSapka: boolean): Karakter {
  const kino = new Karakter('kino', h('div'));
  void kino.hazir.then(() => kinoGiydir(kino, kirazSapka));
  return kino;
}

/**
 * iskeletin 2048 tuvalinde görselin kutusu (kutu görselin en-boy oranında). Kino'nun ölçüleri giysin'in giysi
 * tablosundan (giysin/src/giysi-yer.json: bere 482-1461 × 24-666, mont 636-1439 × 1109-1681; baş ortası x 975).
 * - sapka (Gemini külah şapka, 794×1280): kulaklıklı başlığın iç astarının tepesi (görselin %58'i) başın tepesine
 *   oturur, kulaklıklar başın iki yanına iner; kafa grubunda (her pozda başla döner).
 * - onluk (1277×1280): göğüs parçasının üstü (görselin %30'u) göğse, eteği (%88) bacakların başına; boyun askısı
 *   başın arkasında kalır; gövde grubunda (kollar önünde).
 * - kirazSapka: dükkândaki kiraz tepeli şapka (Gün 3, bölüm D; görseli gelince ölçülür).
 */
const KINO_YERI = {
  sapka: { x: 975 - 370, y: 120 - 0.58 * 1193, en: 740, boy: 1193 },
  onluk: { x: 1032 - 405, y: 1235 - 0.3 * 812, en: 810, boy: 812 },
  kirazSapka: { x: 760, y: 60, en: 440, boy: 440 },
};
const resimG = (url: string, y: { x: number; y: number; en: number; boy: number }, sinif: string) => `<image class="${sinif}" href="${url}" x="${y.x}" y="${y.y}" width="${y.en}" height="${y.boy}" preserveAspectRatio="xMidYMid meet"/>`;

export function kinoGiydir(kino: Karakter, kirazSapka: boolean) {
  const kafa = kino.parcaG('kafa');
  const govde = kino.parcaG('govde');
  kafa?.querySelectorAll('.ko-kino-sapka').forEach((e) => e.remove());
  if (kafa) {
    const ad: VarlikAdi = kirazSapka ? 'sus-kino-kiraz-sapka' : 'kino-sapka';
    const u = adres(ad);
    kafa.insertAdjacentHTML('beforeend', u ? `<g class="ko-kino-sapka">${resimG(u, kirazSapka ? KINO_YERI.kirazSapka : KINO_YERI.sapka, '')}</g>` : kirazSapka ? KINO_KIRAZ_SAPKA : KINO_SAPKA);
  }
  if (govde && !govde.querySelector('.ko-kino-onluk')) {
    const u = adres('kino-onluk');
    govde.insertAdjacentHTML('beforeend', u ? `<g class="ko-kino-onluk">${resimG(u, KINO_YERI.onluk, '')}</g>` : KINO_ONLUK);
  }
}
