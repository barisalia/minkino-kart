/**
 * Bölüm 2: Şşş, Ege Uyuyor! (senaryo: ekip/senaryo/ege-uyuyor.md, Barış onaylı; 9 sahne)
 * Anne çok yorgun, bebek Ege uyumuyor. Çocuk Ada, Can, Elif ve Mino'yla Ege'yi susturur, doyurur, güldürür, uyutur:
 * 1 anneye battaniye → 2 sepette çıngırak + tık/alkış (5-6: ritim taklidi) → 3 önlük, kaşık, üfle, ver, peçeteyle sil
 * → 4 kuklalar (ince/kalın ses) → 5 cee-ee (5-6: yumuşak ses) → 6 yatak: emzik, battaniye, gece lambası, perde →
 * 7 ninni (kısık ses ya da beşiği sallamak) → 8 sessizlik + Mino'nun burnu → 9 fısıltıyla "İyi geceler Ege", final.
 *
 * Her sesli görevin dokunma karşılığı var; 2 yanlışta ya da 8 sn'de parmak ipucu; her yaşta 3. denemede kabul;
 * hiçbir yerde kilitlenme yok. Beşik ve sepet katmanlı (arka resim → içindekiler → ön kenar); battaniyeler açılır. Algılama kilitli ses sisteminden (ekip/SES-SISTEMI.md): Ufleme (katı, 0.5), Alkis,
 * Perde, SessizlikSayaci; kısık ses / fısıltı için mevcut seviye ölçümünü saran yeni sınıf (ege-seviye.ts).
 * Oyun ses çıkarırken kulak susar; sesli görevlerde müzik durur.
 */
import E from '../../content/macera-ege.json';
import { efekt, konus } from '../../src/audio/ses';
import { muzikBaslat, muzikDurdur } from '../../src/audio/muzik';
import { durum } from '../../src/engine/ilerleme';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { Mino, minoBurunYukle } from '../../src/mino/mino';
import { ritimAyniMi, SessizlikSayaci, type Ozellik } from '../../ses-testi/src/analiz';
import { Alkis, Perde, sesVar, Ufleme } from '../../orman/src/gorev';
import { kulak } from '../../orman/src/kulak';
import type { BolumArayuz } from './dogumgunu';
import { Ege } from './ege-bebek';
import { ANNE_GORSEL, ANNE_NEFES, ANNE_ORTU_SVG, ANNE_TUVAL, anneKatmanli, annePozVar, EGE_ORTU_SVG, egeAdres, esya, Kukla, oran, YASTIK_SVG } from './ege-cizim';
import { AyGosterge, KALP_SVG, NinniYildizlari, Parcaciklar, TavanYildizlari, yansiYazi } from './ege-efekt';
import {
  AY_GERI,
  BURUN_ORAN,
  BURUN_SURE,
  BURUN_TUT,
  buharSonme,
  CEE_TURLARI,
  EGE_RITIM,
  egeAyar,
  gulme,
  kabulMu,
  kucukMu,
  IPUCU_SURE,
  NINNI_GECER,
  ninni,
  NINNI_VURUS,
  Salinim,
  SERBEST_KUKLA,
  SERT_GUC,
  SERT_SURE,
  type CeeTur,
} from './ege-mantik';
import * as S from './ege-ses';
import { SesSeviyesi } from './ege-seviye';
import { Ipucu, iz, parmak, Surukle, tasi, type Hedef } from './ege-surukle';
import { Oyuncu } from './oyuncu';
import { cocukOyuncu } from './ege-cocuk';
import { Sahne } from './sahne';
import { anlikFark, notaDegerlendir, referansBul, type Nota } from './sarki';
import './ege.css';

const M = E.mino;
const B = E.balon;
const I = E.ipucu;
const IPTAL = Symbol('iptal');
const kutu = (el: Element) => () => el.getBoundingClientRect();
const merkez = (el: Element): [number, number] => {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
};

/** Oyuncuların yüzü (kutunun %'si: x, y, yüz genişliği): cee-ee'de eller buraya kapanır */
const YUZ: Record<'ada' | 'can' | 'elif', [number, number, number]> = { ada: [50, 31, 40], can: [50, 38, 38], elif: [48, 34, 38] };
/** Yüzü kapatan el (cee-ee): parmaklar yukarıda, başparmak yanda; ten rengi --ten */
const EL_SVG =
  '<svg viewBox="0 0 100 120" aria-hidden="true"><g style="fill:var(--ten)" stroke="#5a2a1a" stroke-width="5" stroke-linejoin="round"><path d="M84 74Q102 62 97 50Q90 42 78 56Z"/><rect x="13" y="10" width="18" height="62" rx="9"/><rect x="31" y="3" width="18" height="66" rx="9"/><rect x="49" y="5" width="18" height="64" rx="9"/><rect x="67" y="16" width="17" height="56" rx="8.5"/><path d="M11 56Q9 104 49 114Q87 106 86 58Q70 64 49 62Q28 64 11 56Z"/></g><ellipse cx="38" cy="86" rx="14" ry="8" fill="#fff" opacity=".35"/></svg>';
const TEN: Record<'ada' | 'can' | 'elif', string> ={ ada: '#e9b48e', can: '#f3c49c', elif: '#f6d2b8' };
/** Mino çiziminin viewBox'ı (src/mino/mino-svg.ts) ve burnu / kulakları */
const MINO_KUTU = [344, 140, 1360, 1790];
const MINO_BURUN: [number, number] = [1024, 915];
const MINO_KULAK: [number, number][] = [[650, 400], [1410, 400]];
const minoYuzde = ([x, y]: [number, number]) => [((x - MINO_KUTU[0]) / MINO_KUTU[2]) * 100, ((y - MINO_KUTU[1]) / MINO_KUTU[3]) * 100];

export async function egeUyuyor(kok: HTMLElement, ui: BolumArayuz): Promise<void> {
  const yas = durum.i.yas ?? 4;
  const ayar = egeAyar(yas);
  const mik = () => kulak.acik && !TEST_MODU;

  // ================================================================ sahne kurulumu
  const sahne = new Sahne('parti-sahne/oda');
  sahne.el.classList.add('eg-sahne');
  kok.append(sahne.el);
  // yatay ekranda sahne ortada dikey bir bantta; iki yanı odanın bulanık devamı (macera.css → .mc-yan-dolgu)
  kok.prepend(h('div.mc-yan-dolgu', { 'aria-hidden': 'true', style: `--resim:${sahne.dunya.querySelector<HTMLElement>('.mc-oda')?.style.getPropertyValue('--resim') ?? 'none'}` }));
  const aksam = h('div.eg-aksam');
  const gece = h('div.eg-gece');
  sahne.dunya.append(aksam);
  const parca = new Parcaciklar();
  sahne.dunya.append(parca.el);
  const tavan = new TavanYildizlari();
  sahne.dunya.append(tavan.el, gece);

  // ölçüler: --b (CSS ile aynı) ve sahne yüksekliğine göre yüzdeler
  const W = () => sahne.el.clientWidth || innerWidth;
  const H = () => sahne.el.clientHeight || innerHeight;
  const bPx = () => Math.min(innerWidth * 0.0116, innerHeight * 0.0075);
  const bY = (n: number) => ((n * bPx()) / H()) * 100;
  const bX = (n: number) => ((n * bPx()) / W()) * 100;
  /** Ekran noktası → dünya konumu (%; y alttan) */
  const dunyada = (cx: number, cy: number) => {
    const k = sahne.dunya.getBoundingClientRect();
    return { x: ((cx - k.left) / k.width) * 100, y: ((k.bottom - cy) / k.height) * 100 };
  };
  /** Ekrandaki piksel → b birimi (kamera yakınlığı hesaba katılır) */
  const pxB = (px: number) => px / (bPx() * (sahne.dunya.getBoundingClientRect().width / W()));
  /** Elemanı ekrandaki bir kutunun ortasına taşır (genişlik w b, boy/en oranı oranH) */
  const ortala = (el: HTMLElement, r: DOMRect, w: number, oranH: number, ms = 600) => {
    const c = dunyada(r.left + r.width / 2, r.top + r.height / 2);
    return tasi(el, c.x, c.y - bY(w * oranH) / 2, ms, w);
  };
  /** dikey ekranda kamera yakın: oyun odanın alt yarısında, duvarın boş üstü görünmesin */
  const dikey = W() / H() < 0.8;
  /** zemin: dikey ekranda her şey biraz yukarıda (alt yazı ve ipucu kutusunun üstünde kalsın) */
  const Z = dikey ? 10 : 2;
  const taban = dikey ? 1.45 : 1.12;
  /** Genel çekim: Ege ve sahnedeki çocuklar kadrajda (kadraj koruması: kam) */
  const genel = (ms = 900, ek: HTMLElement[] = []) => kam(50, 97, taban, ms, [ege.el, ...cocuklar(), ...ek]);
  /** Arka plan resmindeki bir nokta (1024×1024, cover, konum 24% 82%) sahnede nerede (x %, y alttan %) ve ölçek */
  const arkaNokta = (ix: number, iy: number) => {
    const w = W();
    const hh = H();
    const s = Math.max(w / 1024, hh / 1024);
    const X = (w - 1024 * s) * 0.24 + ix * s;
    const Y = (hh - 1024 * s) * 0.82 + iy * s;
    return { x: (X / w) * 100, y: ((hh - Y) / hh) * 100, ust: (Y / hh) * 100, s };
  };

  // --- pencere: gece gökyüzü (ay, yıldızlar) ve perde (iki kanat; sürükleyince kapanır)
  const cam = arkaNokta(264, 244);
  const camR = 158 * cam.s;
  const pencere = h('div.eg-pencere', { style: `left:${cam.x}%;top:${cam.ust}%;width:${camR * 2}px;height:${camR * 2}px`, 'data-ege': 'pencere' }, h('i.eg-pencere-ay'), ...Array.from({ length: 6 }, (_, i) => h('i.eg-pencere-yildiz', { style: `--i:${i}` })));
  sahne.dunya.append(pencere);
  const perdeSol = arkaNokta(22, 0);
  const perdeOrta = arkaNokta(266, 0);
  const perdeSag = arkaNokta(510, 0);
  const perdeAlt = arkaNokta(0, 492);
  // dikey ekranda arka planın sol ucu ekran dışında: perdenin sol kanadı görünen kenardan başlar (pencerenin
  // görünen kısmını yine örter)
  const perdeL = dikey ?Math.max(perdeSol.x, 1.5) : perdeSol.x;
  const perde = h(
    'div.eg-perde',
    { style: `left:${perdeL}%;top:0;width:${perdeSag.x - perdeL}%;height:${perdeAlt.ust}%`, 'data-ege': 'perde' },
    h('div.eg-perde-kanat.sol', { style: `--resim:url("${egeAdres('perde-kapali')}")` }),
    h('div.eg-perde-kanat.sag', { style: `--resim:url("${egeAdres('perde-kapali')}")` }),
  );
  void perdeOrta;
  sahne.dunya.append(perde);
  const perdeAyarla = (p: number) => perde.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
  perdeAyarla(0);

  // --- dekor
  // kanepe annenin oturuş pozlarına göre (aynı ölçekte kıvrılmış anne oturağa sığsın); dikeyde sol kenardan içeride
  const KOLTUK_W = 46;
  const KOLTUK = { x: Math.max(20, bX(KOLTUK_W) / 2 + 1), y: Z + 15, w: KOLTUK_W };
  const koltukH = KOLTUK.w * oran('koltuk');
  const koltuk = sahne.koy(esya('koltuk', 'parti/koltuk', 'Kanepe'), { ...KOLTUK, z: 3 });
  const BESIK = { x: 71, y: Z + 6, w: 31 };
  const besikH = BESIK.w * oran('besik');
  // Beşik katmanlı: arka resim → yastık → Ege (yuva) → Ege'nin açık battaniyesi → fistolu ön kenar (besik-on.webp,
  // scripts/ege/on-katman.mjs). Hepsi eg-besik-ic içinde: beşik sallanınca Ege ve battaniye de onunla sallanır.
  const besikOnUrl = egeAdres('besik-on');
  const besikYuva = h('div.eg-besik-yuva');
  const besikOrtu = h('div.eg-besik-ortu', { html: EGE_ORTU_SVG });
  const besik = sahne.koy(
    h(
      'div.eg-besik',
      { 'data-ege': 'besik' },
      h('i.eg-besik-golge'),
      h('div.eg-besik-ic', {}, esya('besik', undefined, 'Beşik'), h('div.eg-besik-yastik', { html: YASTIK_SVG }), besikYuva, besikOrtu, besikOnUrl ? h('img.eg-besik-on', { src: besikOnUrl, alt: '', draggable: 'false' }) : null),
    ),
    { ...BESIK, z: 6 },
  );
  besik.classList.toggle('katmanli', !!besikOnUrl);
  const besikIc = besik.querySelector<HTMLElement>('.eg-besik-ic')!;

  // --- Ege: beşiğin içinde oturarak başlar (yuvada; konumu CSS'te beşiğin yüzdesiyle)
  const EGE_W = 16;
  const ege = new Ege();
  sahne.koy(ege.el, { x: 50, y: 0, w: EGE_W, z: 5 });
  besikYuva.append(ege.el);
  ege.el.classList.add('besikte');
  await ege.hazir();
  S.hazirla();
  /** Ege beşikten çıkar (dünyaya geçer, bulunduğu yerde kalır; sonra tasi ile istenen yere gider) */
  const egeBesiktenCikar = () => {
    if (!ege.el.classList.contains('besikte')) return;
    const r = ege.el.getBoundingClientRect();
    const c = dunyada(r.left + r.width / 2, r.bottom);
    const w = pxB(r.width);
    ege.el.getAnimations().forEach((a) => a.cancel());
    ege.el.classList.remove('besikte', 'yatiyor');
    sahne.dunya.append(ege.el);
    ege.el.style.setProperty('--x', c.x.toFixed(2));
    ege.el.style.setProperty('--y', c.y.toFixed(2));
    ege.el.style.setProperty('--w', w.toFixed(2));
  };
  /** Ege beşiğin içine (yuvaya) girer: oturarak ya da yatarak; bulunduğu yerden yumuşakça kayar (FLIP) */
  const egeBesige = async (yatik: boolean, ms = 700) => {
    const once = ege.el.getBoundingClientRect();
    ege.el.getAnimations().forEach((a) => a.cancel());
    ege.el.style.translate = '';
    besikYuva.append(ege.el);
    ege.el.classList.add('besikte');
    ege.el.classList.toggle('yatiyor', yatik);
    const sonra = ege.el.getBoundingClientRect();
    const olcek = sonra.width / Math.max(1, ege.el.offsetWidth) || 1;
    const dx = (once.left + once.width / 2 - (sonra.left + sonra.width / 2)) / olcek;
    const dy = (once.bottom - sonra.bottom) / olcek;
    const s = once.width / Math.max(1, sonra.width);
    await ege.el
      .animate([{ translate: `${dx}px ${dy}px`, scale: String(s) }, { translate: '0px 0px', scale: '1' }], { duration: sure(ms), easing: 'cubic-bezier(0.3, 0, 0.3, 1)' })
      .finished.catch(() => undefined);
  };

  // --- anne: ayakta (anne.webp), kanepede uyuyor (gövde + baş katmanı, nefes alır), sarılıyor. Üç poz aynı
  // piksel ölçeğinde (assets/ege/anne-hizalama.json): b / px sabit, genişlik pozun tuvalinden.
  const ANNE_B = 19 / ANNE_TUVAL.ayakta[0];
  const anneImg = h('img.mc-resim.eg-resim', { src: egeAdres(ANNE_GORSEL), alt: 'Anne', draggable: 'false' }) as HTMLImageElement;
  const [nefTW, nefTH] = ANNE_TUVAL.uyuyor;
  const anneNefes = anneKatmanli()
    ? h(
        'div.eg-anne-nefes',
        {
          style:
            `--px:${((ANNE_NEFES.pivot[0] / nefTW) * 100).toFixed(2)}%;--py:${((ANNE_NEFES.pivot[1] / nefTH) * 100).toFixed(2)}%;` +
            `--nefes-s:${ANNE_NEFES.olcek};--nefes-bas:${((-(ANNE_NEFES.pivot[1] - ANNE_NEFES.boyun[1]) * (ANNE_NEFES.olcek - 1)) / nefTH * 100).toFixed(3)}%`,
        },
        h('img.eg-anne-govde', { src: egeAdres('anne-uyuyor-govde'), alt: 'Anne', draggable: 'false' }),
        // açık battaniye (sahne 1'de örtülünce açılır): gövdenin üstünde, başın altında; gövdeyle birlikte nefes alır
        h('div.eg-anne-ortu', { html: ANNE_ORTU_SVG }),
        h('img.eg-anne-bas', { src: egeAdres('anne-uyuyor-bas'), alt: '', draggable: 'false' }),
        h('i.eg-anne-yanak', { style: 'left:38%;top:40.5%' }),
        h('i.eg-anne-yanak', { style: 'left:53%;top:37.5%' }),
      )
    : null;
  const anneOrtu = anneNefes?.querySelector<HTMLElement>('.eg-anne-ortu') ?? null;
  const anneGov = h('div.eg-anne-gov', {}, egeAdres(ANNE_GORSEL) ? anneImg : esya('anne'), anneNefes);
  const anneBalon = h('div.eg-balon');
  const anne = sahne.koy(h('div.eg-anne', { 'data-ege': 'anne' }, anneGov, anneBalon), { x: 55, y: Z + 10, w: 19, z: 4 });
  anne.classList.toggle('katmanli', !!anneNefes);
  /** Görünen çizim: ayakta | uyuyor | sariliyor (uyanık oturuş çizimi yoksa kollarını açmış sarılıyor çizimi) */
  type AnneResim = 'ayakta' | 'uyuyor' | 'sariliyor';
  let anneResim = 'ayakta' as AnneResim;
  const annePoz = (p: 'ayakta' | 'uyuyor' | 'gulumsuyor' | 'sariliyor') => {
    anne.dataset.poz = p;
    const r = p === 'gulumsuyor' && !annePozVar('gulumsuyor') && annePozVar('sariliyor') ? 'sariliyor' : p;
    const ayri = annePozVar(r);
    anne.classList.toggle('pozlu', ayri);
    anneResim = ayri && (r === 'uyuyor' || r === 'sariliyor') ? r : 'ayakta';
    anne.dataset.resim = anneResim;
    if (egeAdres(ANNE_GORSEL)) anneImg.src = ayri ? egeAdres(`${ANNE_GORSEL}-${r}`) : egeAdres(ANNE_GORSEL);
    anne.style.setProperty('--w', (ANNE_TUVAL[anneResim][0] * ANNE_B).toFixed(2));
  };
  annePoz('ayakta');
  /** Kanepede oturuş yeri (alt orta, % ): uyurken kalça oturağın sağında, ayaklar sola; sarılırken ortada */
  const oturak = (o: number) => KOLTUK.y + bY(koltukH * o);
  const anneOturYer = (r: 'uyuyor' | 'sariliyor') => {
    const w = ANNE_TUVAL[r][0] * ANNE_B;
    if (r === 'uyuyor') return { x: KOLTUK.x + bX(KOLTUK.w * 0.2) - bX(w * (ANNE_NEFES.pivot[0] / ANNE_TUVAL.uyuyor[0] - 0.5)), y: oturak(0.33) };
    return { x: KOLTUK.x, y: oturak(0.27) };
  };
  /** Pozun çizimindeki bir oranın (0..1) ekran noktası: baş (Zzz, kalp), battaniye */
  const ANNE_BAS: Record<AnneResim,[number, number, number, number]> = {
    // baş kutusu (tuvalin oranı: x0, y0, x1, y1)
    ayakta: [0.08, 0, 0.92, 0.3],
    uyuyor: [0.4, 0.06, 0.78, 0.48],
    sariliyor: [0.33, 0, 0.67, 0.36],
  };
  const anneBasEkran = (): [number, number] => {
    const r = anneGov.getBoundingClientRect();
    const [x0, y0, x1] = ANNE_BAS[anneResim];
    return [r.left + (r.width * (x0 + x1)) / 2, r.top + r.height * y0];
  };
  /** Annenin örtülecek yeri (ekran kutusu): uyurken kucağı ve bacakları, ayakta çizimde göğüsten ayaklara */
  const anneOrtuKutu = () => {
    const r = anneGov.getBoundingClientRect();
    if (anneResim === 'uyuyor') return new DOMRect(r.left + r.width * 0.22, r.top + r.height * 0.5, r.width * 0.62, r.height * 0.42);
    return new DOMRect(r.left + r.width * 0.34, r.top + r.height * 0.2, r.width * 0.64, r.height * 0.8);
  };

  // --- çocuklar ve Mino
  // çocuklar: parçalı iskeleti olan (Ada, Can) ortak Karakter bileşeniyle oynar (ege-cocuk.ts); ölçek parti tuvaliyle aynı
  const { oyuncu: ada, iskelet: adaI } = cocukOyuncu({ ad: 'ada', resim: 'parti/ada', boy: 20.65, oran: 345 / 622, golge: 24, pozlar: ['normal', 'saskin', 'dilek', 'mutlu', 'alkis', 'dans'] });
  const { oyuncu: can, iskelet: canI } = cocukOyuncu({ ad: 'can', resim: 'parti/can', boy: 23.28, oran: 422 / 558, golge: 28.6, pozlar: ['normal', 'selam', 'saklaniyor', 'saskin', 'alkis', 'dans'] });
  const { oyuncu: elif, iskelet: elifI } = cocukOyuncu({ ad: 'elif', resim: 'parti/elif', boy: 20.7, oran: 366 / 583, golge: 26, pozlar: ['normal', 'selam', 'saklaniyor', 'saskin', 'alkis', 'dans'] });
  const iskeletler = { ada: adaI, can: canI, elif: elifI };
  ada.koy(42, Z + 3);
  ada.katman = 8;
  can.koy(118, Z + 2);
  can.katman = 9;
  elif.koy(-20, Z + 2);
  elif.katman = 9;
  can.el.classList.add('gizli');
  elif.el.classList.add('gizli');
  sahne.dunya.append(ada.el, can.el, elif.el);
  const oyX = (o: Oyuncu) => Number(o.el.style.getPropertyValue('--x')) || 50;

  const mino = new Mino();
  // burun kaşıntısı / tutma / hapşu yüzleri (8. sahne) ayrı küçük pakette: şimdiden arka planda yüklensin
  void minoBurunYukle();
  const minoBalon = h('div.eg-balon.eg-mino-balon');
  const minoKutu = sahne.koy(h('div.mc-mino.eg-mino', { 'data-ege': 'mino' }, mino.el, minoBalon), { x: 19, y: Z - 3, w: 24, z: 10 });

  // ================================================================ kamera ve kadraj koruması (banyodaki gibi)
  // Sahne kodu çekimi ister (odak x/y, yakınlık z) ve o çekimde kadrajda kalması gerekenleri (tut) verir. Taşacaksa
  // odak kayar, sığmıyorsa yakınlık düşer. Annenin başı ve Mino kenarda yarım kalmaz: ya tamamen içeride ya dışarıda.
  type Alan = { l: number; r: number; u: number; a: number };
  /** Dünyadaki kutu (% ; u/a üstten). Konumu --x/--y ile verilen öğede hedef konum (yürürken de doğru) */
  const alan = (el: HTMLElement): Alan | null => {
    if (!el.isConnected || el.classList.contains('gizli') || el.classList.contains('gidiyor') || !el.offsetWidth) return null;
    if (el.parentElement !== sahne.dunya) {
      // iç içe (beşikteki Ege): ekrandaki görünen kutusundan (yatarken dönmüş çizimin kutusu)
      const hedef = el === ege.el ? (ege.el.querySelector('.eg-ege-kutu') ?? el) : el;
      const d = sahne.dunya.getBoundingClientRect();
      const r = hedef.getBoundingClientRect();
      if (!d.width || !d.height) return null;
      return { l: ((r.left - d.left) / d.width) * 100, r: ((r.right - d.left) / d.width) * 100, u: ((r.top - d.top) / d.height) * 100, a: ((r.bottom - d.top) / d.height) * 100 };
    }
    const dw = sahne.dunya.offsetWidth || W();
    const dh = sahne.dunya.offsetHeight || H();
    const w = (el.offsetWidth / dw) * 100;
    const hh = (el.offsetHeight / dh) * 100;
    const vx = el.style.getPropertyValue('--x');
    if (vx !== '') {
      const x = Number(vx);
      const y = Number(el.style.getPropertyValue('--y')) || 0;
      return { l: x - w / 2, r: x + w / 2, u: 100 - y - hh, a: 100 - y };
    }
    const l = (el.offsetLeft / dw) * 100;
    const u = (el.offsetTop / dh) * 100;
    return { l, r: l + w, u, a: u + hh };
  };
  /** Annenin başı (yarım kalmasın) */
  const anneBasAlan = (): Alan | null => {
    const k = alan(anne);
    if (!k) return null;
    const [x0, y0, x1, y1] = ANNE_BAS[anneResim];
    const w = k.r - k.l;
    const hh = k.a - k.u;
    return { l: k.l + w * x0, r: k.l + w * x1, u: k.u + hh * y0, a: k.u + hh * y1 };
  };
  /** Mino (kutunun boş kenarları hariç) */
  const minoAlan = (): Alan | null => {
    const k = alan(minoKutu);
    if (!k) return null;
    const w = k.r - k.l;
    return { ...k, l: k.l + w * 0.14, r: k.r - w * 0.14 };
  };
  /** Kenarda yarım görünmemesi gerekenler */
  const kacinlar = () => [anneBasAlan(), minoAlan(), alan(ege.el), ...cocuklar().map((el) => alan(el))].filter((a): a is Alan => !!a);
  /** Kadraj payı (%): üstte düğme ve yazı şeridi, yanlarda nefes payı */
  const PAY = { yan: 2.5, ust: 13, alt: 3 };
  let cekim = { x: 50, y: 97, z: 1, tut: [] as (HTMLElement | (() => Alan | null))[] };
  const kadrajHesap = () => {
    const kutular = () => cekim.tut.map((t) => (typeof t === 'function' ? t() : alan(t))).filter((a): a is Alan => !!a);
    const coz = (ek: Alan[]) => {
      const hepsi = kutular().concat(ek);
      if (!hepsi.length) return { x: cekim.x, y: cekim.y, z: cekim.z };
      const l = Math.max(0, Math.min(...hepsi.map((k) => k.l)) - PAY.yan);
      const r = Math.min(100, Math.max(...hepsi.map((k) => k.r)) + PAY.yan);
      const u = Math.max(0, Math.min(...hepsi.map((k) => k.u)) - PAY.ust);
      const a = Math.min(100, Math.max(...hepsi.map((k) => k.a)) + PAY.alt);
      const z = Math.max(1, Math.min(cekim.z, 100 / Math.max(1, r - l), 100 / Math.max(1, a - u)));
      if (z <= 1.001) return { x: cekim.x, y: cekim.y, z: 1 };
      // görünen aralık: [o·(1 − 1/z), o·(1 − 1/z) + 100/z]
      const k = 1 - 1 / z;
      const sinirla = (o: number, lo: number, hi: number) => Math.max(0, Math.min(100, lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, o))));
      return { x: sinirla(cekim.x, (r - 100 / z) / k, l / k), y: sinirla(cekim.y, (a - 100 / z) / k, u / k), z };
    };
    const ek: Alan[] = [];
    let c = coz(ek);
    // yarım kalan (annenin başı, Mino): dışarı it, olmazsa kadraja al
    for (const kc of kacinlar()) {
      if (c.z <= 1.001) break;
      const k = 1 - 1 / c.z;
      const vl = c.x * k;
      const vr = vl + 100 / c.z;
      if (kc.r <= vl || kc.l >= vr || (kc.l >= vl && kc.r <= vr)) continue;
      const ic = kutular().concat(ek);
      const icL = Math.min(...ic.map((q) => q.l), 100) - PAY.yan;
      const icR = Math.max(...ic.map((q) => q.r), 0) + PAY.yan;
      // solda yarım: kadrajın solu başın sağına
      const solaIt = (kc.r + 0.5) / k;
      const sagaIt = (kc.l - 0.5 - 100 / c.z) / k;
      if (kc.l < vl && solaIt <= 100 && kc.r + 0.5 <= icL && icR <= kc.r + 0.5 + 100 / c.z) c = { ...c, x: solaIt };
      else if (kc.r > vr && sagaIt >= 0 && kc.l - 0.5 >= icR && icL >= kc.l - 0.5 - 100 / c.z) c = { ...c, x: sagaIt };
      else {
        ek.push(kc);
        c = coz(ek);
      }
    }
    return c;
  };
  /** Kamera (kadraj korumalı) */
  const kam = (x: number, y: number, z: number, ms: number, tut: (HTMLElement | (() => Alan | null))[] = []) => {
    cekim = { x, y, z, tut };
    const c = kadrajHesap();
    sahne.el.dataset.kamera = `${c.x.toFixed(1)} ${c.y.toFixed(1)} ${c.z.toFixed(2)}`;
    return sahne.kamera(c.x, c.y, c.z, ms);
  };
  /** Sahnedeki (görünen) çocuklar */
  const cocuklar = () => [ada, can, elif].map((o) => o.el).filter((el) => !el.classList.contains('gizli') && Math.abs(Number(el.style.getPropertyValue('--x')) - 50) < 55);
  void koltuk;

  // --- ay göstergesi (sahne 8)
  const ay = new AyGosterge();
  sahne.el.append(ay.el);

  const muzik = new S.EgeMuzik();

  // ================================================================ akış altyapısı
  const tikler = new Set<(dt: number) => void>();
  let iptaller: (() => void)[] = [];
  let kapandi = false;
  let onceki = performance.now();
  let raf = requestAnimationFrame(function d(t) {
    const dt = Math.min(0.1, (t - onceki) / 1000);
    onceki = t;
    if (ui.kapandiMi() && !kapandi) {
      kapandi = true;
      iptaller.slice().forEach((f) => f());
    }
    tikler.forEach((f) => f(dt));
    raf = requestAnimationFrame(d);
  });

  /** Kurulan bir görevi çözülene kadar bekler; bölüm kapanırsa IPTAL fırlatır, temizlik her durumda çalışır */
  function gorev<T>(kur: (coz: (v: T) => void) => void | (() => void)): Promise<T> {
    return new Promise<T>((cozP, redP) => {
      if (kapandi || ui.kapandiMi()) return redP(IPTAL);
      let temiz: void | (() => void);
      let bitti = false;
      const son = () => {
        if (bitti) return;
        bitti = true;
        iptaller = iptaller.filter((f) => f !== iptal);
        if (typeof temiz === 'function') temiz();
      };
      const iptal = () => {
        son();
        redP(IPTAL);
      };
      iptaller.push(iptal);
      temiz = kur((v) => {
        son();
        cozP(v);
      });
      if (bitti && typeof temiz === 'function') temiz();
    });
  }
  const bekle = (ms: number) =>
    gorev<void>((coz) => {
      const t = setTimeout(() => coz(), sure(ms));
      return () => clearTimeout(t);
    });
  const tik = (f: (dt: number) => void) => {
    tikler.add(f);
    return () => void tikler.delete(f);
  };
  /** Test ve önizleme için: şu anki görev (e2e testi bunu okuyup parmakla oynar) */
  const durumYaz = (ad: string | null) => {
    if (ad) sahne.el.dataset.egGorev = ad;
    else delete sahne.el.dataset.egGorev;
  };

  const mSoyle = async (t: string) => {
    if (kapandi) throw IPTAL;
    ui.yazi(t);
    await konus(t, { ton: 1.12 });
    if (kapandi) throw IPTAL;
  };
  const anneSoyle = async (t: string) => {
    if (kapandi) throw IPTAL;
    ui.yazi(t);
    anne.classList.add('konusuyor');
    // anne konuşurken Mino'nun ağzı oynamasın (dudak senkronu: konuşanın ağzı)
    mino.agizSus = true;
    try {
      await konus(t, { ton: 0.95 });
    } finally {
      anne.classList.remove('konusuyor');
      mino.agizSus = false;
    }
    if (kapandi) throw IPTAL;
  };
  const efektCal = (f: () => void, ms = 700) => {
    kulak.sustur(ms);
    f();
  };
  const konfeti = (x = 50, y = 40, adet = 70) => {
    const [px, py] = sahne.noktaEkran(x, y);
    konfetiPatlat(kok, px, py, adet);
  };
  const balon = async (el: HTMLElement, yazi: string, ms = 1300) => {
    el.textContent = yazi;
    el.classList.remove('acik');
    void el.offsetWidth;
    el.classList.add('acik');
    await new Promise((r) => setTimeout(r, sure(ms)));
    el.classList.remove('acik');
  };
  const yazi = (cx: number, cy: number, t: string, renk?: string, buyuk = false) => yansiYazi(sahne.el, cx, cy, t, renk, buyuk);
  /** Mino'nun çizimindeki bir noktanın ekran konumu */
  const minoEkran = ([x, y]: [number, number]): [number, number] => {
    const s = mino.el.querySelector('svg') ?? mino.el;
    const r = s.getBoundingClientRect();
    return [r.left + ((x - MINO_KUTU[0]) / MINO_KUTU[2]) * r.width, r.top + ((y - MINO_KUTU[1]) / MINO_KUTU[3]) * r.height];
  };

  // --- müzik: genel müziği durdur, bölümün müziği
  muzikDurdur();
  const muzikAc = () => {
    if (!TEST_MODU) muzik.baslat();
  };
  const muzikKutu = () => {
    if (!TEST_MODU) muzik.kutu(ninni(1).concat(ninni(2).slice(ninni(1).length)).map((n) => ({ midi: n.midi, vurus: n.vurus })));
  };
  /** Sesli görev: müzik durur (mikrofon duymasın), bitince önceki müzik devam */
  const sesliGorev = async <T>(f: () => Promise<T>, sonra: 'oyuncak' | 'kutu' | null = 'oyuncak'): Promise<T> => {
    muzik.durdur();
    try {
      return await f();
    } finally {
      if (!kapandi && sonra === 'oyuncak') muzikAc();
      else if (!kapandi && sonra === 'kutu') muzikKutu();
    }
  };

  // --- sürükleme + ipucu (görev bitince ikisi de kapanır)
  const acikSurukle = new Set<Surukle>();
  const acikIpucu = new Set<Ipucu>();
  const surukle = (el: HTMLElement, hedefler: Hedef[], birak: (ad: string | null) => boolean | void, izHedef?: () => DOMRect) => {
    const s = new Surukle(el, { hedefler, birak, iz: izHedef ? { katman: sahne.on, kutu: izHedef } : undefined });
    acikSurukle.add(s);
    return s;
  };
  const ipucu = (kaynak: () => DOMRect, hedef?: () => DOMRect, ms = IPUCU_SURE * 1000) => {
    const i = new Ipucu(() => parmak(sahne.on, kaynak, hedef), sure(ms) === ms ? ms : 400);
    acikIpucu.add(i);
    return i;
  };
  const bitir = (...x: (Surukle | Ipucu | null | undefined)[]) =>
    x.forEach((o) => {
      o?.kapat();
      if (o instanceof Surukle) acikSurukle.delete(o);
      else if (o) acikIpucu.delete(o);
    });
  /**
   * Kumaş gibi sürüklenen eşya (battaniye): parmağın hızına göre eğilip dalgalanır (--egim, yay gibi yerine döner),
   * tutulurken hafifçe nefes gibi kabarır (CSS). Yalnız transform.
   */
  const dalgaliSurukle = (el: HTMLElement, hedefler: Hedef[], birak: (ad: string | null) => boolean | void, izHedef?: () => DOMRect) => {
    el.classList.add('eg-dalgali');
    let sonX = 0;
    let sonT = 0;
    let egim = 0;
    let hiz = 0;
    let hedefEgim = 0;
    const kapaTik = tik((dt) => {
      // yay: hedefe doğru ivmelenir, sönümlenir (kumaş sallanıp durulur)
      hedefEgim *= Math.pow(0.04, dt);
      hiz += (hedefEgim - egim) * 90 * dt;
      hiz *= Math.pow(0.02, dt);
      egim += hiz * dt;
      if (Math.abs(egim) < 0.02 && Math.abs(hiz) < 0.02 && !hedefEgim) return;
      el.style.setProperty('--egim', egim.toFixed(2));
    });
    const s = new Surukle(el, {
      hedefler,
      birak,
      iz: izHedef ? { katman: sahne.on, kutu: izHedef } : undefined,
      tut: () => {
        sonT = 0;
      },
      kaydir: (x) => {
        const t = performance.now();
        if (sonT && t > sonT) hedefEgim = Math.max(-16, Math.min(16, -((x - sonX) / Math.max(8, t - sonT)) * 22));
        sonX = x;
        sonT = t;
      },
    });
    acikSurukle.add(s);
    const eskiKapat = s.kapat.bind(s);
    s.kapat = () => {
      eskiKapat();
      kapaTik();
    };
    return s;
  };
  /** Besik tuvalindeki (780×621) bir dikdörtgenin ekrandaki kutusu */
  const besikKutu = (x0: number, y0: number, x1: number, y1: number) => {
    const r = (besikIc.firstElementChild as HTMLElement).getBoundingClientRect();
    return new DOMRect(r.left + (r.width * x0) / 780, r.top + (r.height * y0) / 621, (r.width * (x1 - x0)) / 780, (r.height * (y1 - y0)) / 621);
  };
  /** Katlı battaniye Ege'nin beşiğine uçar, açılır: açık örtü boynundan ayak ucuna doğru serilir, sonra nefesle iner kalkar */
  const egeOrtuAc = async (katli: HTMLElement) => {
    const hedef = besikKutu(262, 96, 530, 250);
    katli.style.zIndex = '14';
    await ortala(katli, hedef, pxB(hedef.width * 0.75), oran('battaniye-ege'), 420);
    katli.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '1.3 0.55' }], { duration: sure(360), fill: 'forwards', easing: 'ease-in' });
    besikOrtu.classList.add('acik');
    besikOrtu.dataset.ege = 'ortu';
    await besikOrtu
      .animate(
        [
          { clipPath: 'inset(0 68% 0 0)', transform: 'scaleY(0.82)' },
          { clipPath: 'inset(0 22% 0 0)', transform: 'scaleY(1.07)', offset: 0.6 },
          { clipPath: 'inset(0 0% 0 0)', transform: 'scaleY(0.98)', offset: 0.82 },
          { clipPath: 'inset(0 0% 0 0)', transform: 'scaleY(1)' },
        ],
        { duration: sure(820), easing: 'cubic-bezier(0.3, 0, 0.3, 1)' },
      )
      .finished.catch(() => undefined);
    katli.remove();
    ege.nefesEl = besikOrtu;
    const [x, y] = merkez(besikOrtu.querySelector('.eg-ortu-govde') ?? besikOrtu);
    parca.parilti(x, y - 10, 7, 'yildiz');
  };
  /**
   * Katlı battaniye annenin kucağına süzülür ve açılır: omzundan ayak bileklerine sarar (baş katmanı üstte kalır).
   * Anne uykusunda gülümser, battaniyeye sokulur (baş hafifçe iner, gövde kısa bir iç çekişle yerleşir), kalpler.
   */
  const anneOrtuAc = async (katli: HTMLElement) => {
    if (!anneOrtu) return;
    const r = anneGov.getBoundingClientRect();
    const hedef = new DOMRect(r.left + r.width * 0.3, r.top + r.height * 0.52, r.width * 0.5, r.height * 0.3);
    katli.style.zIndex = '12';
    await ortala(katli, hedef, pxB(r.width * 0.5), oran('battaniye-anne'), 380);
    katli.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '1.35 0.6' }], { duration: sure(380), fill: 'forwards', easing: 'ease-in' });
    anneOrtu.classList.add('acik');
    await anneOrtu
      .animate(
        [
          { clipPath: 'circle(0% at 58% 64%)', transform: 'scale(0.86)' },
          { clipPath: 'circle(48% at 58% 64%)', transform: 'scale(1.05)', offset: 0.6 },
          { clipPath: 'circle(80% at 58% 64%)', transform: 'scale(0.99)', offset: 0.85 },
          { clipPath: 'circle(90% at 58% 64%)', transform: 'scale(1)' },
        ],
        { duration: sure(900), easing: 'cubic-bezier(0.3, 0, 0.3, 1)' },
      )
      .finished.catch(() => undefined);
    katli.classList.add('gizli');
    katli.style.opacity = '';
    katli.getAnimations().forEach((a) => a.cancel());
    // sokulma: baş battaniyeye doğru hafifçe iner ve yana yaslanır, gövde bir iç çeker; yanaklar pembeleşir
    anne.classList.add('sokuldu');
    anneNefes?.animate([{ translate: '0 0', scale: '1' }, { translate: '0 1.2%', scale: '1.015 0.985', offset: 0.45 }, { translate: '0 0', scale: '1' }], { duration: sure(1100), easing: 'ease-in-out' });
  };

  const temizle = () => {
    cancelAnimationFrame(raf);
    kulak.dinle(null);
    muzik.durdur();
    mino.kapat();
    ege.kapat();
    Object.values(iskeletler).forEach((i) => i?.kapat());
    acikSurukle.forEach((s) => s.kapat());
    acikIpucu.forEach((i) => i.kapat());
    clearInterval(anneZzz);
    muzikBaslat();
  };

  // ================================================================ Ege'nin ağlaması (arka planda sürer)
  /** 0: ağlamıyor … 1: çok ağlıyor */
  let aglama = 0;
  /** dinlerken ağlama sesi çalmaz (kulak susmasın), yalnız gözyaşı ve balon */
  let aglamaSessiz = false;
  let aglamaZaman = 0.3;
  let yasZaman = 0;
  tik((dt) => {
    if (aglama <= 0) return;
    yasZaman -= dt;
    if (yasZaman <= 0) {
      yasZaman = 0.5 + (1 - aglama) * 0.7;
      const [lx, ly] = ege.ekranda(760, 720);
      const [rx, ry] = ege.ekranda(1290, 720);
      parca.gozYasi(lx, ly, -1, 1);
      parca.gozYasi(rx, ry, 1, 1);
    }
    aglamaZaman -= dt;
    if (aglamaZaman > 0) return;
    aglamaZaman = 2 + (1 - aglama) * 1.6;
    if (!aglamaSessiz) S.aglama(aglama);
    if (Math.random() < 0.5 + aglama * 0.3) void ege.balon(B.ege.ingaa, 900);
  });
  const aglat = (g: number) => {
    aglama = g;
    ege.aglamaGucu = Math.max(0.35, g);
    if (g > 0) {
      ege.durum('agla');
      ege.ifade('agliyor');
    } else {
      ege.durum('normal');
      ege.ifade('bakiyor');
    }
  };

  // ================================================================ her an dokunulabilir sahne
  let egeUyku = false;
  let egeSerbest = true;
  let sonDokun = 0;
  ege.el.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('.eg-suruklenir') || !egeSerbest) return;
    if (performance.now() - sonDokun < 600) return;
    sonDokun = performance.now();
    if (egeUyku) {
      void balon(minoBalon, B.ada.sss, 1000);
      return;
    }
    if (aglama > 0) return ege.kipir(0.5);
    ege.ifade('kikir', 900);
    ege.oynat('kikir', 800);
    efektCal(() => S.kikir(0.3), 1200);
    void ege.balon(B.ege.hihi, 800);
  });
  let anneUyuyor = false;
  anne.addEventListener('pointerdown', () => {
    if (!anneUyuyor || anne.classList.contains('eg-suruklenir')) return;
    void balon(anneBalon, B.anne_uykuda, 1500);
    anneGov.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-2deg) scale(1.02)' }, { transform: 'rotate(0)' }], { duration: sure(700) });
  });
  let minoSira = 0;
  let minoSerbest = true;
  minoKutu.addEventListener('pointerdown', () => {
    if (!minoSerbest) return;
    if (egeUyku) {
      void balon(minoBalon, B.ada.sss, 900);
      return;
    }
    mino.tepki((['gidik', 'mir', 'zipla'] as const)[minoSira++ % 3]);
  });
  let lambaAcik = false;

  // anne uyurken ara sıra Zzz
  let anneZzz = 0;

  try {
    muzikAc();
    await sahne1();
    await sahne2();
    await sahne3();
    await sahne4();
    await sahne5();
    await sahne6();
    await sahne7();
    await sahne8();
    await sahne9();
    durumYaz('son');
  } catch (e) {
    if (e !== IPTAL) throw e;
  } finally {
    temizle();
  }

  // ================================================================ 1. Anne çok yorgun
  async function sahne1() {
    sahne.el.dataset.egSahne = '1';
    await kam(72, 80, 1.9, 10, [besik, anne]);
    aglat(1);
    anne.classList.add('salliyor');
    besikIc.classList.add('sallaniyor');
    await bekle(1100);
    void kam(50, 88, taban, 2200, [anne, besik]);
    minoKutu.classList.add('giris');
    await bekle(700);
    mino.tepki('zipla');
    await mSoyle(M.merhaba);
    await mSoyle(M.agliyor);
    // anne esner, kanepeye gider, anında uyuyakalır
    anne.classList.remove('salliyor');
    besikIc.classList.remove('sallaniyor');
    anne.classList.add('esniyor');
    await anneSoyle(E.anne.uzan);
    anne.classList.remove('esniyor');
    anne.classList.add('yuruyor');
    if (annePozVar('uyuyor')) {
      // kanepenin önüne yürür (kalçası oturağın üstüne gelecek yere), oturur, dizine yaslanıp uyuyakalır
      const yer = anneOturYer('uyuyor');
      const kalcaX = KOLTUK.x + bX(KOLTUK.w * 0.2);
      await tasi(anne, kalcaX, KOLTUK.y + bY(koltukH * 0.06), 1400);
      anne.classList.remove('yuruyor');
      annePoz('uyuyor');
      anne.style.setProperty('--x', String(yer.x));
      anne.style.setProperty('--y', String(yer.y));
      // oturma: önce çöker, sonra yumuşakça yerine oturur
      anneGov.animate(
        [
          { transformOrigin: '80% 100%', scale: '1.03 0.9', translate: '0 3%' },
          { transformOrigin: '80% 100%', scale: '0.98 1.03', translate: '0 -1%', offset: 0.55 },
          { transformOrigin: '80% 100%', scale: '1 1', translate: '0 0' },
        ],
        { duration: sure(520), easing: 'ease-out' },
      );
    } else {
      await tasi(anne, KOLTUK.x + 3, KOLTUK.y + bY(6), 1400);
      anne.classList.remove('yuruyor');
      annePoz('uyuyor');
    }
    anne.classList.add('uzanik');
    anne.style.zIndex = '4';
    efektCal(() => S.hisirti(), 500);
    anneUyuyor = true;
    anneZzz = window.setInterval(() => {
      if (!anneUyuyor) return;
      const [x, y] = anneBasEkran();
      parca.yuksel(x, y, 'z', 3);
    }, TEST_MODU ? 99999 : 3200);
    const [ax, ay] = anneBasEkran();
    parca.yuksel(ax, ay, 'z', 3);
    await bekle(600);
    // Mino ile Ada birbirine bakar
    mino.tepki('sasir');
    ada.poz('saskin', 1500);
    void ada.kipir();
    await bekle(900);

    // --- battaniye: anneye sürükle
    const battaniye = sahne.koy(h('div.eg-esya.eg-geliyor', { 'data-ege': 'battaniye' }, esya('battaniye-anne', undefined, 'Battaniye')), { x: 56, y: Z + 2, w: 17, z: 11 });
    void kam(40, 92, taban, 900, [anne, battaniye]);
    await mSoyle(M.battaniye);
    ui.ipucu(I.battaniye);
    durumYaz('battaniye');
    await gorev<void>((coz) => {
      const ip = ipucu(kutu(battaniye), kutu(anneGov));
      let yanlis = 0;
      const ort = () => {
        bitir(s, ip);
        battaniye.classList.remove('eg-geliyor', 'eg-dalgali');
        efektCal(() => S.hisirti(true), 900);
        if (anneOrtu && anneResim === 'uyuyor') {
          // katlı battaniye annenin kucağına süzülür ve açılır: omzundan ayak bileklerine sarar
          void anneOrtuAc(battaniye).then(() => coz());
          return;
        }
        // (poz çizimi yoksa) katlı battaniye kucağına konur
        const govde = anneOrtuKutu();
        battaniye.style.zIndex = '5';
        void ortala(battaniye, govde, pxB(govde.width * (anneResim === 'uyuyor' ? 0.92 : 0.66)), oran('battaniye-anne')).then(() => {
          battaniye.classList.add('ortuldu');
          coz();
        });
      };
      // bırakma alanı cömert: annenin herhangi bir yeri ya da kanepe
      const s = dalgaliSurukle(
        battaniye,
        [
          { ad: 'anne', kutu: kutu(anneGov), pay: 0.35 },
          { ad: 'anne', kutu: kutu(koltuk), pay: 0.05 },
        ],
        (ad) => {
          if (ad !== 'anne') {
            ip.yanlis();
            // yanlış yere: 3-4 yaşta (5-6 yaşta ikinci yanlışta) battaniye yumuşakça anneye süzülüp örter
            if (kucukMu(yas) || ++yanlis >= 2) {
              iz(sahne.on, battaniye.getBoundingClientRect(), anneGov.getBoundingClientRect());
              ort();
              return true;
            }
            return;
          }
          ort();
          return true;
        },
        kutu(anneGov),
      );
      return () => bitir(s, ip);
    });
    durumYaz(null);
    ui.ipucu(null);
    efektCal(() => efekt.dogru(), 800);
    anne.classList.add('gulumsuyor');
    const [bx, by] = anneBasEkran();
    parca.yuksel(bx, by + 10, 'kalp', 3);
    ada.poz('mutlu', 1600);
    void ada.zipla(16);
    await bekle(700);
    mino.tepki('evet');
    await mSoyle(M.plan);
  }

  // ================================================================ 2. Çıngırak nerede?
  async function sahne2() {
    sahne.el.dataset.egSahne = '2';
    // Can gelir, el sallar
    can.el.classList.remove('gizli');
    void ada.git(32, Z + 3, 800);
    await can.git(82, Z + 2, 1200);
    can.poz('selam', 1000);
    void can.balon(B.can.merhaba, 900);
    await bekle(500);
    void ada.balon(B.ada.cingirak, 1800);
    aglat(0.9);
    await bekle(1200);

    // --- oyuncak sepeti: oyuncakları çıkar, çıngırak en altta
    // Derinlik: sepet çocukların ayak çizgisinin gerisinde (Ada Z+3, Can Z+2 önde; beşik Z+6 arkada). Sepet iki
    // katman: arka resim (iç duvar, sap) → oyuncaklar → ön hasır kenar (sepet-on.webp). Aynı z'de DOM sırası belirler.
    const SEPET = { x: 52, y: Z + 4, w: 19 };
    const SEPET_Z = 7;
    const sepetH = SEPET.w * oran('sepet');
    /** sepetin içinde yükseklik (çizimin altından oran; ön kenarın üst çizgisi ~%50) */
    const icY = (o: number) => SEPET.y + bY(sepetH * o);
    const sepet = sahne.koy(h('div.eg-esya.eg-sepet.eg-geliyor', { 'data-ege': 'sepet' }, esya('sepet', undefined, 'Oyuncak sepeti')), { ...SEPET, z: SEPET_Z });
    const cing = sahne.koy(h('div.eg-esya.eg-cingirak', { 'data-ege': 'cingirak' }, esya('cingirak', undefined, 'Çıngırak')), { x: SEPET.x + 1, y: icY(0.14), w: 8, z: SEPET_Z });
    const oyuncaklar: [string, HTMLElement][] = [
      ['kup', sahne.koy(h('div.eg-esya.eg-oyuncak', { 'data-ege': 'kup' }, esya('kup', undefined, 'Küp')), { x: SEPET.x - 4.5, y: icY(0.36), w: 7, z: SEPET_Z })],
      ['kitap', sahne.koy(h('div.eg-esya.eg-oyuncak', { 'data-ege': 'kitap' }, esya('kitap', undefined, 'Kitap')), { x: SEPET.x + 5, y: icY(0.38), w: 8.5, z: SEPET_Z })],
      ['top', sahne.koy(h('div.eg-esya.eg-oyuncak', { 'data-ege': 'top' }, esya('top', 'banyo/top', 'Top')), { x: SEPET.x + 1.5, y: icY(0.4), w: 7, z: SEPET_Z })],
      ['ordek', sahne.koy(h('div.eg-esya.eg-oyuncak', { 'data-ege': 'ordek' }, esya('ordek', 'banyo/ordek', 'Lastik ördek')), { x: SEPET.x - 2.5, y: icY(0.43), w: 7, z: SEPET_Z })],
    ];
    const sepetOnUrl = egeAdres('sepet-on');
    const sepetOn = sepetOnUrl ? sahne.koy(h('div.eg-esya.eg-sepet.eg-sepet-on.eg-geliyor', {}, h('img.mc-resim.eg-resim', { src: sepetOnUrl, alt: '', draggable: 'false' })), { ...SEPET, z: SEPET_Z }) : null;
    // çıkan oyuncaklar sepetin önüne, halının üstüne (çocukların ayak çizgisinin önü: onların da önünde)
    const KENAR: [number, number][] = [[SEPET.x - 13, Z - 1], [SEPET.x + 13, Z - 1], [SEPET.x - 7, Z - 2.5], [SEPET.x + 8, Z - 2.5]];
    void kam(58, 96, taban, 800, [sepet, ...cocuklar()]);
    await mSoyle(M.cingirak_ara);
    ui.ipucu(I.sepet);
    durumYaz('sepet');
    await gorev<void>((coz) => {
      let kalan = oyuncaklar.length;
      const ip = ipucu(() => (oyuncaklar.find(([, el]) => !el.dataset.cikti)?.[1] ?? cing).getBoundingClientRect());
      const ss = oyuncaklar.map(([ad, el], i) => {
        const s = surukle(el, [], () => {
          // dokunmak da sürüklemek de oyuncağı sepetten çıkarır
          if (el.dataset.cikti) return true;
          el.dataset.cikti = '1';
          bitir(s);
          ip.ilerle();
          if (ad === 'ordek') {
            S.vik();
            const [x, y] = merkez(el);
            yazi(x, y - 30, B.vik, '#e8a722');
            ege.ifade('saskin', 800);
            void ege.balon(B.ege.ooo, 800);
          } else S.oyuncak(ad);
          // sepetin içinden yukarı çıkar (ön kenarın arkasından), sonra önünden halıya zıplar
          const [x, y] = KENAR[i];
          const x0 = Number(el.style.getPropertyValue('--x'));
          const cekildi = (el.style.translate || '0px 0px').split(' ').some((v) => Math.abs(parseFloat(v)) > 25);
          void (async () => {
            if (!cekildi) await tasi(el, x0, icY(0.72), 200);
            el.style.zIndex = '11';
            await tasi(el, x, y, 480);
            el.classList.add('yerde');
            el.animate([{ scale: '1.2 0.8' }, { scale: '0.95 1.08' }, { scale: '1 1' }], { duration: sure(300), easing: 'ease-out' });
          })();
          if (--kalan === 0) {
            bitir(ip);
            coz();
          }
          return true;
        });
        return s;
      });
      return () => {
        ss.forEach((s) => bitir(s));
        bitir(ip);
      };
    });
    // çıngırak görünür, parlar; dokununca Can'ın eline uçar
    cing.style.zIndex = '13';
    await tasi(cing, SEPET.x + 1, icY(0.62), 500);
    cing.classList.add('parliyor');
    const [cx0, cy0] = merkez(cing);
    parca.parilti(cx0, cy0, 8);
    efektCal(() => S.cingirak(true, 0.6));
    ui.ipucu(I.cingirak_bul);
    durumYaz('cingirak-bul');
    await gorev<void>((coz) => {
      const ip = ipucu(kutu(cing), undefined, 5000);
      const s = surukle(cing, [], () => {
        bitir(s, ip);
        coz();
        return true;
      });
      return () => bitir(s, ip);
    });
    durumYaz(null);
    cing.classList.remove('parliyor');
    efektCal(() => efekt.dogru(), 800);
    can.poz('selam');
    const canEl = () => [oyX(can) - bX(23.28 * 0.28), Z + bY(23.28 * (558 / 422) * 0.66)] as const;
    await tasi(cing, canEl()[0], canEl()[1], 650, 7);
    ui.ipucu(null);

    // --- çıngırağı salla: tık / alkış (çıngırağa dokunmak da olur)
    await kam(66, 95, taban * 1.12, 900, [can.el, ege.el]);
    const salla = (uzun = false) => {
      S.cingirak(uzun);
      cing.classList.remove('salla');
      void cing.offsetWidth;
      cing.classList.add('salla');
      const [x, y] = merkez(cing);
      parca.yuksel(x, y - 10, 'nota', 1, 20);
    };
    await sesliGorev(async () => {
      if (!ayar.ritim) {
        await mSoyle(M.cingirak);
        ui.ipucu(I.tik);
        durumYaz('tik');
        let n = 0;
        await dinleTik(cing, () => {
          salla();
          n++;
          ui.ilerleme(n, ayar.tik);
          const g = Math.max(0, 0.9 - n * 0.32);
          ege.aglamaGucu = Math.max(0.3, g);
          aglama = g;
          if (n === ayar.tik - 1) ege.ifade('buzuk');
          if (n === 1) ege.bak(1);
          return n >= ayar.tik;
        });
      } else {
        // 5-6 yaş: Ege kollarını çırparak ritim yapar (tık-tık … tıık), çocuk aynısını yapar
        aglat(0);
        ege.ifade('bakiyor');
        await mSoyle(M.ritim);
        let yanlis = 0;
        for (;;) {
          aglamaSessiz = true;
          ege.bak(0);
          await egeRitim();
          ui.ipucu(I.ritim);
          durumYaz('ritim');
          const seri = await dinleSeri(cing, salla);
          durumYaz(null);
          sahne.el.dataset.ritim = String(seri.length);
          if (ritimAyniMi(EGE_RITIM, seri) || kabulMu(yas, yanlis)) break;
          yanlis++;
          ege.ifade('saskin', 1200);
          void ege.balon(B.ege.ba, 1100);
          await bekle(700);
          // Can bir kez daha gösterir
          can.poz('selam');
          for (const t of EGE_RITIM) setTimeout(() => salla(t > 0.9), sure(t * 1000));
          await bekle(1700);
        }
        aglamaSessiz = false;
      }
    });
    durumYaz(null);
    ui.ipucu(null);
    ui.ilerleme(1, 1);
    aglat(0);
    ege.bak(1);
    await bekle(500);
    ege.bak(0);
    ege.ifade('kikir', 1600);
    ege.oynat('kikir', 1200);
    efektCal(() => S.kikir(0.5), 1200);
    const [ex, ey] = ege.basUstu();
    parca.parilti(ex, ey, 8);
    can.poz('alkis', 1000);
    await mSoyle(M.sustu);
    cing.classList.add('gidiyor');
    can.poz('normal');
    // toparlanma: oyuncaklar kavisle sepetin üstüne zıplar, ön kenarın arkasından içine düşer; sonra sepet
    // (içindekilerle) yerinde küçülüp kaybolur (sahne sadeleşsin; kenarda yarım sepet kalmaz)
    oyuncaklar.forEach(([, el], i) =>
      setTimeout(() => {
        void (async () => {
          el.style.zIndex = '11';
          el.classList.remove('yerde');
          await tasi(el, SEPET.x + (i - 1.5) * 2.4, icY(0.85), 380);
          el.style.zIndex = String(SEPET_Z);
          await tasi(el, SEPET.x + (i - 1.5) * 2.4, icY(0.36 + (i % 2) * 0.05), 220);
          efektCal(() => S.pop(), 300);
        })();
      }, sure(i * 160)),
    );
    await bekle(oyuncaklar.length * 160 + 750);
    for (const el of [sepet, sepetOn, ...oyuncaklar.map(([, o]) => o)]) el?.classList.add('gidiyor');
    await genel(800);
  }

  /** 5-6 yaş: Ege kollarını çırparak ritmi gösterir (her vuruşta minik çıngırak sesi) */
  async function egeRitim() {
    for (const [i, t] of EGE_RITIM.entries()) {
      const once = i ? EGE_RITIM[i - 1] : 0;
      await bekle((t - once) * 1000);
      ege.oynat('vur', 260);
      efektCal(() => S.cingirak(i === EGE_RITIM.length - 1, 0.55), 500);
      const [x, y] = ege.ekranda(1020, 900);
      parca.yuksel(x, y, 'nota', 1, 30);
    }
    await bekle(900);
  }

  /** Tık dinle: her tık (mikrofonda dil şaklatma/alkış ya da çıngırağa dokunma) için fn; fn true dönerse biter */
  function dinleTik(cing: HTMLElement, fn: () => boolean): Promise<void> {
    return gorev<void>((coz) => {
      const eski = kulak.ayar.duyarlilik;
      kulak.ayar.duyarlilik = eski + 6; // dil şaklatması alkıştan kısıktır (Doğum Günü pasta kesmedeki gibi)
      const a = new Alkis(kulak.ayar);
      const ip = ipucu(kutu(cing));
      const kapa = tik(() => a.tik());
      a.onAlkis = () => {
        ip.ilerle();
        if (fn()) coz();
      };
      const dokun = (e: Event) => {
        e.stopPropagation();
        a.dokun();
      };
      kulak.dinle((o) => a.kare(o));
      cing.addEventListener('pointerdown', dokun);
      // dokunma karşılığı belirgin: çıngırak parlar, dokunma alanı geniş
      cing.classList.add('parliyor', 'eg-genis');
      return () => {
        kapa();
        kulak.dinle(null);
        kulak.ayar.duyarlilik = eski;
        cing.classList.remove('parliyor', 'eg-genis');
        cing.removeEventListener('pointerdown', dokun);
        bitir(ip);
      };
    });
  }

  /** Bir tık serisi dinle (1.4 sn susunca biter); dokunmalar da seri sayılır */
  function dinleSeri(cing: HTMLElement, salla: (uzun?: boolean) => void): Promise<number[]> {
    return gorev<number[]>((coz) => {
      const eski = kulak.ayar.duyarlilik;
      kulak.ayar.duyarlilik = eski + 6;
      const a = new Alkis(kulak.ayar);
      const ip = ipucu(kutu(cing));
      const kapa = tik(() => a.tik());
      a.onAlkis = () => {
        ip.ilerle();
        salla();
      };
      a.onSeri = (zamanlar) => coz(zamanlar);
      const dokun = (e: Event) => {
        e.stopPropagation();
        a.dokun();
      };
      kulak.dinle((o) => a.kare(o));
      cing.addEventListener('pointerdown', dokun);
      // dokunma karşılığı belirgin: çıngırak parlar, dokunma alanı geniş
      cing.classList.add('parliyor', 'eg-genis');
      return () => {
        kapa();
        kulak.dinle(null);
        kulak.ayar.duyarlilik = eski;
        cing.classList.remove('parliyor', 'eg-genis');
        cing.removeEventListener('pointerdown', dokun);
        bitir(ip);
      };
    });
  }

  // ================================================================ 3. Ege acıkmış
  async function sahne3() {
    sahne.el.dataset.egSahne = '3';
    // sessizlikte karın gurultusu, herkes güler
    await bekle(500);
    efektCal(() => S.gurul(), 1300);
    ege.oynat('gurul', 1000);
    ege.ifade('saskin', 1300);
    const [gx, gy] = ege.ekranda(1020, 1400);
    yazi(gx, gy, 'gurrrl', '#c97a2a');
    await bekle(1100);
    void ada.balon(B.hihi, 900);
    void can.balon(B.hihi, 900);
    void ada.kipir();
    void can.kipir();
    mino.tepki('sasir');
    await mSoyle(M.guruldu);

    // Ege mama sandalyesine (Ada taşır), Ada mama kasesini getirir
    const SANDALYE = { x: 52, y: Z + 2, w: 24 };
    const sandH = SANDALYE.w * oran('mama-sandalyesi');
    const sandalye = sahne.koy(h('div.eg-esya.eg-geliyor', { 'data-ege': 'sandalye' }, esya('mama-sandalyesi', undefined, 'Mama sandalyesi')), { ...SANDALYE, z: 4 });
    void sandalye;
    void ada.git(62, Z + 3, 700);
    await bekle(500);
    ege.oynat('kikir', 700);
    // beşikten çıkar (dünyaya geçer), sandalyeye oturur
    egeBesiktenCikar();
    ege.el.style.zIndex = '6';
    await tasi(ege.el, SANDALYE.x, SANDALYE.y + bY(sandH * 0.36), 800, EGE_W);
    efektCal(() => S.pop(), 300);
    void ada.git(76, Z + 3, 700);
    void can.git(86, Z + 2, 700);
    await bekle(700);
    const kaseY = Z + 1 + bY(37 * 0.3);
    const kase = sahne.koy(h('div.eg-esya.eg-kase.eg-geliyor', { 'data-ege': 'kase' }, esya('kase', undefined, 'Mama kasesi'), h('div.eg-buhar', {}, h('i'), h('i'), h('i'))), { x: 70, y: kaseY, w: 12, z: 11 });
    const buharT = tik(() => {
      if (Math.random() < 0.02) {
        const [x, y] = merkez(kase);
        parca.yuksel(x, y - 14, 'buhar', 1, 10);
      }
    });
    await kam(56, 96, taban * 1.1, 900, [ege.el, sandalye, kase]);

    // --- önlük
    const onluk = sahne.koy(h('div.eg-esya.eg-geliyor', { 'data-ege': 'onluk' }, esya('onluk', undefined, 'Önlük')), { x: 31, y: Z + 3, w: 11, z: 11 });
    void kam(56, 96, taban * 1.1, 600, [ege.el, sandalye, kase, onluk]);
    await mSoyle(M.onluk);
    ui.ipucu(I.onluk);
    durumYaz('onluk');
    await gorev<void>((coz) => {
      const govde = () => ege.govdeKutusu();
      const ip = ipucu(kutu(onluk), govde);
      const s = surukle(
        onluk,
        [{ ad: 'ege', kutu: () => ege.el.getBoundingClientRect(), pay: 0.05 }],
        (ad) => {
          if (ad !== 'ege') return void ip.yanlis();
          bitir(s, ip);
          onluk.remove();
          ege.onluk = true;
          coz();
          return true;
        },
        govde,
      );
      return () => bitir(s, ip);
    });
    durumYaz(null);
    efektCal(() => S.pop(), 300);
    ege.ifade('kikir', 900);
    ege.oynat('ayak', 700);

    // --- kaşık kaşık: daldır → üfle → ver
    const kasikEl = h('div.eg-esya.eg-kasik', { 'data-ege': 'kasik' }, esya('kasik', undefined, 'Kaşık'), h('i.eg-kasik-mama'), h('div.eg-buhar.eg-kasik-buhar', {}, h('i'), h('i'), h('i')));
    const KASIK_YER = { x: 80, y: kaseY + bY(2) };
    const kasik = sahne.koy(kasikEl, { ...KASIK_YER, w: 10, z: 12 });
    void kam(56, 96, taban * 1.1, 600, [ege.el, kase, kasik]);
    const agiz = () => ege.agizKutusu();
    let mamaUctu = false;
    for (let n = 0; n < ayar.kasik; n++) {
      ui.ilerleme(n, ayar.kasik);
      await kasikTur(n === 0);
      ege.lekeEkle();
      if (n === 0 || n === 2) ege.lekeEkle();
    }
    ui.ilerleme(ayar.kasik, ayar.kasik);
    ui.ipucu(null);
    buharT();
    kasik.classList.add('gidiyor');
    kase.classList.add('gidiyor');

    // --- peçeteyle sil
    ege.ifade('kikir');
    await mSoyle(M.sil);
    const pecete = sahne.koy(h('div.eg-esya.eg-geliyor', { 'data-ege': 'pecete' }, esya('pecete', undefined, 'Peçete')), { x: 31, y: Z + 3, w: 11, z: 12 });
    void kam(50, 96, taban * 1.1, 600, [ege.el, pecete]);
    ui.ipucu(I.sil);
    durumYaz('sil');
    await gorev<void>((coz) => {
      const ip = ipucu(kutu(pecete), () => {
        const p = ege.lekeEkran();
        return p ? new DOMRect(p[0] - 10, p[1] - 10, 20, 20) : ege.yuzKutusu();
      });
      let son = { x: 0, y: 0 };
      let sesZaman = 0;
      const s = new Surukle(pecete, {
        hedefler: [],
        birak: () => true,
        kaydir: (x, y) => {
          const yol = Math.hypot(x - son.x, y - son.y);
          son = { x, y };
          const r = pecete.getBoundingClientRect();
          if (ege.sil(r.left + r.width / 2, r.top + r.height / 2, r.width * 0.5, Math.min(0.2, yol / 110))) {
            ip.ilerle();
            if (performance.now() - sesZaman > 180) {
              sesZaman = performance.now();
              S.sil();
            }
            ege.ifade('buzuk', 400);
          }
          if (!ege.lekeler().length) coz();
        },
      });
      acikSurukle.add(s);
      return () => bitir(s, ip);
    });
    durumYaz(null);
    pecete.classList.add('gidiyor');
    efektCal(() => efekt.dogru(), 800);
    ege.el.classList.add('parlak');
    const [px, py] = merkez(ege.el);
    parca.parilti(px, py - 20, 10);
    ege.ifade('kikir', 1300);
    ege.oynat('kikir', 1000);
    ege.onluk = false;
    setTimeout(() => ege.el.classList.remove('parlak'), sure(1500));
    ui.ipucu(null);
    await bekle(900);

    async function kasikTur(ilk: boolean): Promise<void> {
      kasik.classList.remove('dolu', 'sicak');
      kasik.style.setProperty('--buhar', '0');
      // 1) kaseye daldır
      if (ilk) await mSoyle(M.kasik);
      ui.ipucu(I.daldir);
      durumYaz('daldir');
      await gorev<void>((coz) => {
        const ip = ipucu(kutu(kasik), kutu(kase));
        // bırakma alanı cömert (kameranın kayması ya da küçük parmak sapması kaşığı geri göndermesin)
        const s = surukle(
          kasik,
          [{ ad: 'kase', kutu: kutu(kase), pay: 0.6 }],
          (ad) => {
            if (ad !== 'kase') return void ip.yanlis();
            bitir(s, ip);
            S.klink();
            kasik.animate([{ rotate: '0deg' }, { rotate: '-25deg' }, { rotate: '0deg' }], { duration: sure(300) });
            void tasi(kasik, KASIK_YER.x, KASIK_YER.y, 420).then(() => coz());
            return true;
          },
          kutu(kase),
        );
        return () => bitir(s, ip);
      });
      durumYaz(null);
      kasik.classList.add('dolu', 'sicak');
      let buhar = 1;
      kasik.style.setProperty('--buhar', '1');
      // 2) üfle (5-6 yaş: yavaş; sert üflerse mama Mino'nun burnuna uçar). Sıcakken ağza götürülürse Ege surat asar.
      if (ilk || ayar.yavasUfle) await mSoyle(ilk ? M.ufle : M.yavas);
      ui.ipucu(ayar.yavasUfle ? I.yavas : I.ufle);
      durumYaz('ufle');
      const firladi = await sesliGorev(() =>
        gorev<boolean>((coz) => {
          // üfleme algılaması kilitli ses sisteminden (katı mod); kolaylık yalnız buharın sönme hızında
          const u = new Ufleme(kulak.ayar, 0.5);
          let sertSure = 0;
          let bitti = false;
          const ip = ipucu(kutu(kasik));
          let buharZaman = 0;
          const kapa = tik((dt) => {
            u.tik(dt);
            if (u.aktif) {
              buhar = Math.max(0, buhar - dt * buharSonme(u.guc));
              kasik.style.setProperty('--buhar', buhar.toFixed(2));
              kasik.classList.add('ufleniyor');
              buharZaman -= dt;
              if (buharZaman <= 0) {
                buharZaman = 0.25;
                const [x, y] = merkez(kasik);
                parca.yuksel(x - 20, y - 16, 'buhar', 1, 30);
              }
              if (ayar.yavasUfle && u.guc > SERT_GUC) sertSure += dt;
              else sertSure = Math.max(0, sertSure - dt);
            } else kasik.classList.remove('ufleniyor');
            // mama bir kez uçtuysa ders alındı: sonraki kaşıklarda sert üfleme de geçer (kolaylık)
            if (ayar.yavasUfle && !mamaUctu && sertSure > SERT_SURE) {
              bitti = true;
              coz(true);
              return;
            }
            if (buhar <= 0) {
              bitti = true;
              kasik.classList.remove('sicak', 'ufleniyor');
              S.fis();
              coz(false);
            }
          });
          kulak.dinle((o) => u.kare(o));
          // dokunma karşılığı: kaşığa basılı tutmak üflemek sayılır; kaşık sürüklenirse üfleme biter
          let tutus = { x: -1, y: -1 };
          const s = new Surukle(kasik, {
            hedefler: [{ ad: 'agiz', kutu: agiz, pay: 0.35 }],
            tut: () => {
              tutus = { x: -1, y: -1 };
              u.bas();
            },
            kaydir: (x, y) => {
              if (tutus.x < 0) tutus = { x, y };
              else if (Math.hypot(x - tutus.x, y - tutus.y) > 30) u.birak();
            },
            birak: (ad) => {
              u.birak();
              if (ad === 'agiz' && !bitti) {
                ip.yanlis();
                void sicakVerdi();
              }
            },
          });
          acikSurukle.add(s);
          return () => {
            kapa();
            u.birak();
            kulak.dinle(null);
            bitir(s, ip);
            kasik.classList.remove('ufleniyor');
          };
        }),
      );
      durumYaz(null);
      if (firladi) {
        mamaUctu = true;
        await mamaFirladi();
        return kasikTur(false);
      }
      // 3) Ege'ye ver
      if (ilk) await mSoyle(M.ver);
      ui.ipucu(I.ver);
      durumYaz('ver');
      ege.ifade('am');
      await gorev<void>((coz) => {
        const ip = ipucu(kutu(kasik), agiz);
        const s = surukle(
          kasik,
          [{ ad: 'agiz', kutu: agiz, pay: 0.35 }],
          (ad) => {
            if (ad !== 'agiz') return void ip.yanlis();
            bitir(s, ip);
            coz();
            return true;
          },
          agiz,
        );
        return () => bitir(s, ip);
      });
      durumYaz(null);
      ege.ifade('am', 500);
      efektCal(() => S.am(), 300);
      void ege.balon(B.ege.am, 700);
      kasik.classList.remove('dolu');
      ege.oynat('am', 600);
      await bekle(450);
      ege.ifade('kikir', 800);
      ege.ayakSalla(800);
      efektCal(() => efekt.dogru(), 800);
      await tasi(kasik, KASIK_YER.x, KASIK_YER.y, 460);
      ege.ifade('bakiyor');
    }

    async function mamaFirladi() {
      efektCal(() => S.pit(), 400);
      kasik.classList.remove('dolu', 'sicak');
      const mama = h('i.eg-ucan-mama');
      const [x1, y1] = merkez(kasik);
      const [x2, y2] = minoEkran(MINO_BURUN);
      const k = sahne.on.getBoundingClientRect();
      sahne.on.append(mama);
      await mama
        .animate(
          [
            { transform: `translate(${x1 - k.left}px, ${y1 - k.top}px) scale(0.6) rotate(0deg)` },
            { transform: `translate(${(x1 + x2) / 2 - k.left}px, ${Math.min(y1, y2) - 110 - k.top}px) scale(1) rotate(200deg)`, offset: 0.5 },
            { transform: `translate(${x2 - k.left}px, ${y2 - k.top}px) scale(1.25, 0.8) rotate(360deg)` },
          ],
          { duration: sure(560), easing: 'cubic-bezier(0.3, 0, 0.6, 1)', fill: 'forwards' },
        )
        .finished.catch(() => undefined);
      mama.remove();
      // Mino'nun burnuna yapışır
      const [nx, ny] = minoYuzde(MINO_BURUN);
      const yapiskan = h('i.eg-mino-mama', { style: `left:${nx}%;top:${ny}%` });
      mino.el.append(yapiskan);
      parca.sicrat(x2, y2, 'mama', 6, 0.6);
      mino.tepki('sasir');
      ada.poz('saskin', 900);
      void ada.balon(B.hihi, 900);
      void can.balon(B.hihi, 900);
      efektCal(() => S.kikir(0.6), 1300);
      ege.ifade('kahkaha', 1100);
      ege.oynat('kahkaha', 1000);
      await bekle(1000);
      // Mino patisiyle siler
      mino.tepki('hayir', 0.9);
      yapiskan.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(-20%, 60%) scale(0.6)', opacity: 0 }], { duration: sure(600), fill: 'forwards' });
      await bekle(600);
      yapiskan.remove();
      await mSoyle(M.yavas);
    }

    /** Üflenmeden (sıcak) ağza götürüldü: Ege dudak büzüp başını çevirir, Mino uyarır */
    async function sicakVerdi() {
      ege.ifade('buzuk', 1700);
      ege.bak(-1);
      ege.oynat('hayir', 700);
      void ege.balon(B.ege.hih, 900);
      setTimeout(() => ege.bak(0), sure(1100));
      try {
        await mSoyle(M.sicak);
      } catch {
        /* bölüm kapandı */
      }
    }
  }

  // ================================================================ 4. Kuklalar
  async function sahne4() {
    sahne.el.dataset.egSahne = '4';
    ege.ifade('buzuk');
    await genel(800);
    await mSoyle(M.surat);
    // Ada sepetten kuklaları çıkarır: "Kuklalar!"
    void ada.git(30, Z + 3, 800);
    void can.git(78, Z + 2, 800);
    // kuklaları alacak Ada ve Can kadrajda (tablette Ada sol kenarda yarım kalıyordu: bırakma hedefi görünmüyordu)
    void kam(52, 96, taban * 1.06, 800, [ada.el, can.el, ege.el]);
    await bekle(600);
    void ada.balon(B.ada.kukla, 1400);
    const ayiK = new Kukla('ayi');
    const civK = new Kukla('civciv');
    const ayi = sahne.koy(ayiK.el, { x: 47, y: Z + 3, w: 12, z: 13 });
    const civciv = sahne.koy(civK.el, { x: 57, y: Z + 3, w: 9, z: 13 });
    ayi.dataset.ege = 'kukla-ayi';
    civciv.dataset.ege = 'kukla-civciv';
    for (const el of [ayi, civciv]) el.animate([{ translate: '0 60%', scale: '0.3' }, { translate: '0 -18%', scale: '1.08' }, { translate: '0 0', scale: '1' }], { duration: sure(550), easing: 'cubic-bezier(.3,1.4,.5,1)' });
    efektCal(() => S.pop(), 300);
    await mSoyle(M.kukla);
    ui.ipucu(I.kukla);
    durumYaz('kukla-tak');
    // ayı Ada'ya (kocaman), civciv Can'a (minicik); ellerinin hizasında
    const elde = (o: Oyuncu, w: number, sag: boolean, oranBoy: number): [number, number, number] => [oyX(o) + (sag ? 1 : -1) * bX(w * 0.62), Z + bY(oranBoy * 0.2), w];
    const AYI_YER = () => elde(ada, 12, true, 20.65 * (622 / 345));
    const CIV_YER = () => elde(can, 9, false, 23.28 * (558 / 422));
    await gorev<void>((coz) => {
      let takili = 0;
      const ip = ipucu(
        () => (!ayi.dataset.takili ? ayi : civciv).getBoundingClientRect(),
        () => (!ayi.dataset.takili ? ada.el : can.el).getBoundingClientRect(),
      );
      const hedefler: Hedef[] = [
        { ad: 'ada', kutu: kutu(ada.el), pay: 0.15 },
        { ad: 'can', kutu: kutu(can.el), pay: 0.15 },
      ];
      const tak = (el: HTMLElement, kim: Oyuncu, [x, y, w]: [number, number, number], s: Surukle) => {
        bitir(s);
        el.dataset.takili = '1';
        void tasi(el, x, y, 500, w);
        void kim.zipla(10);
        // kuklayı tutan kol kalkar (ayı Ada'nın sağında, civciv Can'ın solunda)
        (kim === ada ? adaI : canI)?.kukla(kim === ada ? 'sag' : 'sol');
        efektCal(() => S.pop(), 300);
        ip.ilerle();
        if (++takili === 2) coz();
      };
      // hangisine bırakılırsa bırakılsın ayı Ada'ya, civciv Can'a gider; yanlış yerde iz
      const sa: Surukle = surukle(ayi, hedefler, (ad) => {
        if (!ad) return void ip.yanlis();
        tak(ayi, ada, AYI_YER(), sa);
        return true;
      }, kutu(ada.el));
      const sc: Surukle = surukle(civciv, hedefler, (ad) => {
        if (!ad) return void ip.yanlis();
        tak(civciv, can, CIV_YER(), sc);
        return true;
      }, kutu(can.el));
      return () => bitir(sa, sc, ip);
    });
    durumYaz(null);
    ui.ipucu(null);
    await bekle(400);
    await kam(52, 96, taban * 1.06, 700, [ada.el, can.el, ege.el]);

    // --- kukla konuşturma
    let referans: number | null = null;
    let gulmeSay = 0;
    /** Kukla konuşur (ağzı açılıp kapanır); Ege ona bakar ve güler (her konuşmada gülmesi büyür) */
    const konustur = async (hangi: 'civciv' | 'ayi', inceFark = 3, sesli = false) => {
      const k = hangi === 'civciv' ? civK : ayiK;
      (hangi === 'civciv' ? canI : adaI)?.kuklaSalla();
      k.el.classList.remove('konusuyor');
      void k.el.offsetWidth;
      k.el.classList.add('konusuyor');
      if (!sesli) {
        // parmakla: ağız üç kez açılıp kapanır
        const bas = performance.now();
        const kapa = tik(() => {
          const t = (performance.now() - bas) / 1000;
          k.ac(t < 0.9 ? Math.abs(Math.sin(t * Math.PI * 3.4)) : 0);
          if (t > 1) kapa();
        });
      }
      if (hangi === 'civciv') {
        S.cikcik();
        void balon(k.balonEl, B.cik, 900);
      } else {
        S.ayiSesi();
        void balon(k.balonEl, B.ayi, 900);
      }
      ege.bak(hangi === 'civciv' ? 1 : -1);
      gulmeSay++;
      if (hangi === 'ayi') {
        ege.ifade('saskin');
        void ege.balon(B.ege.ooo, 800);
        await bekle(800);
      } else await bekle(300);
      const g = gulme(gulmeSay, inceFark);
      ege.ifade(g, 1400);
      ege.oynat(g, 1200);
      efektCal(() => S.kikir(g === 'kahkaha' ? 1 : 0.5), 1500);
      void ege.balon(B.ege.hihi, 800);
      await bekle(1200);
      ege.bak(0);
      ege.ifade('bakiyor');
    };
    const omuzSilk = async () => {
      for (const k of [ayiK, civK]) {
        k.el.classList.remove('omuz');
        void k.el.offsetWidth;
        k.el.classList.add('omuz');
        void balon(k.balonEl, B.kukla_hi, 900);
      }
      ege.ifade('bakiyor');
      ege.el.classList.add('kirpistir');
      await bekle(900);
      ege.el.classList.remove('kirpistir');
    };

    // referans: önce normal sesle "aaa" (mikrofon yoksa atlanır; kuklaya dokunmak da atlar)
    if (mik()) {
      await mSoyle(M.referans);
      ui.ipucu(I.aaa);
      durumYaz('referans');
      referans = await sesliGorev(() =>
        gorev<number | null>((coz) => {
          const perdeler: number[] = [];
          kulak.dinle((o) => {
            if (o.perde !== null && sesVar(o, kulak.ayar, 10)) perdeler.push(o.perde);
            if (perdeler.length >= 30) coz(referansBul(perdeler));
          });
          const atla = () => coz(null);
          ayi.addEventListener('pointerdown', atla);
          civciv.addEventListener('pointerdown', atla);
          const t = setTimeout(() => coz(perdeler.length >= 5 ? referansBul(perdeler) : null), 12000);
          return () => {
            kulak.dinle(null);
            clearTimeout(t);
            ayi.removeEventListener('pointerdown', atla);
            civciv.removeEventListener('pointerdown', atla);
          };
        }),
      );
      durumYaz(null);
      if (referans) efektCal(() => efekt.secim(), 500);
    }

    /**
     * Bir kuklanın konuşmasını bekle: mikrofonda ince (+) ya da kalın (−) ses, ya da kuklaya dokunma.
     * istenen null: hangisi olursa. Dönüş: konuşan kukla. Konuşurken kuklanın ağzı sesin gücüyle açılır.
     */
    const bekleKukla = (istenen: 'civciv' | 'ayi' | null) =>
      gorev<{ kim: 'civciv' | 'ayi'; fark: number; sesli: boolean }>((coz) => {
        const p = new Perde(kulak.ayar, referans ?? 280);
        let inceSure = 0;
        let kalinSure = 0;
        let ortaSure = 0;
        let yanlis = 0;
        let enInce = 0;
        const ip = ipucu(kutu(istenen === 'ayi' ? ayi : civciv));
        const dAyi = (e: Event) => {
          e.stopPropagation();
          coz({ kim: 'ayi', fark: -4, sesli: false });
        };
        const dCiv = (e: Event) => {
          e.stopPropagation();
          coz({ kim: 'civciv', fark: 4, sesli: false });
        };
        ayi.addEventListener('pointerdown', dAyi);
        civciv.addEventListener('pointerdown', dCiv);
        // dokunma karşılığı belirgin: istenen kukla (serbestte ikisi) parlar
        const parlayan = istenen === 'ayi' ? [ayi] : istenen === 'civciv' ? [civciv] : [ayi, civciv];
        parlayan.forEach((e) => e.classList.add('parliyor'));
        kulak.dinle((o) => {
          p.kare(o);
          const k = kulak.ayar.kare;
          const sinif = p.sinif;
          // konuşan kuklanın ağzı sesin gücüyle
          const guc = Math.min(1, kulak.seviye * 1.6);
          civK.ac(sinif === 'ince' ? guc : 0);
          ayiK.ac(sinif === 'kalin' ? guc : 0);
          if (sinif === 'ince') {
            inceSure += k;
            enInce = Math.max(enInce, p.fark ?? 0);
          } else inceSure = Math.max(0, inceSure - k);
          if (sinif === 'kalin') kalinSure += k;
          else kalinSure = Math.max(0, kalinSure - k);
          if (sinif === 'orta') ortaSure += k;
          else if (!p.sesli) ortaSure = 0;
          if (inceSure > 0.25 && istenen !== 'ayi') return coz({ kim: 'civciv', fark: enInce, sesli: true });
          if (kalinSure > 0.25 && istenen !== 'civciv') return coz({ kim: 'ayi', fark: p.fark ?? -4, sesli: true });
          if (ortaSure > 0.6) {
            ortaSure = 0;
            yanlis++;
            ip.yanlis();
            void omuzSilk();
            // her yaşta 3. denemede kabul (kilitlenme yok)
            if (kabulMu(yas, yanlis - 1) && istenen) coz({ kim: istenen, fark: istenen === 'civciv' ? 4 : -4, sesli: true });
          }
        });
        return () => {
          kulak.dinle(null);
          parlayan.forEach((e) => e.classList.remove('parliyor'));
          ayi.removeEventListener('pointerdown', dAyi);
          civciv.removeEventListener('pointerdown', dCiv);
          civK.ac(0);
          ayiK.ac(0);
          bitir(ip);
        };
      });

    // civciv (ince), sonra ayı (kalın)
    for (const [istenen, cumle, ipc] of [['civciv', M.civciv, I.ince], ['ayi', M.ayi, I.kalin]] as const) {
      await mSoyle(cumle);
      ui.ipucu(ipc);
      durumYaz(istenen);
      const r = await sesliGorev(() => bekleKukla(istenen));
      durumYaz(null);
      await konustur(r.kim, r.fark, r.sesli);
    }
    // serbest: hangisi konuşsun? Ege konuşana bakar, gülmesi büyür
    await mSoyle(M.sec);
    ui.ipucu(I.serbest);
    for (let i = 0; i < SERBEST_KUKLA; i++) {
      ui.ilerleme(i, SERBEST_KUKLA);
      durumYaz('serbest');
      const r = await sesliGorev(() => bekleKukla(null));
      durumYaz(null);
      await konustur(r.kim, r.fark, r.sesli);
    }
    ui.ilerleme(SERBEST_KUKLA, SERBEST_KUKLA);
    ui.ipucu(null);
    ege.ifade('kahkaha', 1800);
    ege.oynat('kahkaha', 1600);
    const [hx, hy] = ege.basUstu();
    parca.yuksel(hx, hy, 'kalp', 5, 40);
    efektCal(() => S.kikir(1), 1600);
    ada.poz('alkis', 1400);
    void ada.zipla(14);
    void can.zipla(14);
    await mSoyle(M.guldu);
    ege.ifade('kikir');
    // kuklalar kenara
    for (const el of [ayi, civciv]) el.classList.add('gidiyor');
  }

  // ================================================================ 5. Cee-ee!
  async function sahne5() {
    sahne.el.dataset.egSahne = '5';
    ege.ifade('kikir');
    ege.oynat('cirp', 1400);
    // Elif gelir
    elif.el.classList.remove('gizli');
    elif.koy(-14, Z + 2);
    void ada.git(26, Z + 3, 700);
    void can.git(78, Z + 2, 700);
    ada.katman = 11;
    elif.katman = 11;
    can.katman = 11;
    await elif.git(40, Z + 1, 1100);
    elif.poz('selam', 900);
    void elif.balon(B.elif.benim, 1000);
    // cee-ee: üç çocuk, Ege ve (kulaklarını kapatacak) Mino kadrajda
    await genel(700, [minoKutu]);
    await mSoyle(M.cee_giris);
    const kim: Record<Exclude<CeeTur, 'hepsi' | 'mino'>, Oyuncu> = { ada, can, elif };
    let gulmeSay = 0;
    for (const [i, tur] of CEE_TURLARI.entries()) {
      ui.ilerleme(i, CEE_TURLARI.length);
      const saklananlar = tur === 'hepsi' ? (['ada', 'can', 'elif', 'mino'] as const) : ([tur] as const);
      // kapanır: eller yüze (Mino yanlışlıkla kulaklarını kapatır)
      const eller: HTMLElement[] = [];
      for (const s of saklananlar) {
        if (s === 'mino') eller.push(minoKulakKapa());
        else eller.push(elKapa(kim[s], s));
      }
      efektCal(() => S.hisirti(), 400);
      const ilk = saklananlar[0];
      ege.bak(ilk === 'mino' ? -1 : ilk === 'ada' ? -1 : ilk === 'elif' ? -0.5 : 1);
      ege.ifade('bakiyor');
      void ege.balon(B.ege.ba, 900);
      await bekle(700);
      if (i === 0) await mSoyle(M.cee);
      if (tur === 'hepsi') await mSoyle(M.hepsi);
      ui.ipucu(ayar.yumusak ? I.cee_yumusak : I.cee);
      durumYaz('cee');
      // "Cee!": ses (5-6 yaş yumuşak), büyük düğme ya da kapanan ellere dokunma
      await sesliGorev(() => ceeBekle(eller));
      durumYaz(null);
      ui.dugmeKaldir();
      // açılır: eller savrulur, "Cee!", Ege kıkırdar (her turda gülme büyür)
      for (const [k, s] of saklananlar.entries()) {
        const el = eller[k];
        const pozlu = el.classList.contains('eg-cee-resim');
        if (pozlu) el.remove();
        else {
          el.classList.add('acildi');
          setTimeout(() => el.remove(), sure(500));
        }
        if (s === 'mino') {
          mino.tepki('zipla');
          void balon(minoBalon, B.cee, 1000);
        } else {
          const o = kim[s];
          // "Cee!" anı: tasarımcının açık pozu (şaşkın) ya da el sallama
          o.poz(pozlu ? 'saskin' : s === 'ada' ? 'alkis' : 'selam', 1100);
          void o.zipla(12);
          void o.balon(B.cee, 1000);
        }
      }
      gulmeSay++;
      const buyuk = tur === 'mino' || tur === 'hepsi';
      ege.ifade(buyuk ? 'kahkaha' : 'kikir', 1500);
      ege.oynat(buyuk ? 'kahkaha' : 'kikir', buyuk ? 1500 : 900 + gulmeSay * 150);
      efektCal(() => S.kikir(buyuk ? 1 : 0.5), 1600);
      void ege.balon(B.ege.hihi, 900);
      if (tur === 'hepsi') {
        const [hx, hy] = ege.basUstu();
        parca.yuksel(hx, hy, 'kalp', 6, 50);
        ege.ayakSalla(1400);
        konfeti(55, 45, 60);
      }
      await bekle(1400);
      ege.bak(0);
    }
    ui.ilerleme(CEE_TURLARI.length, CEE_TURLARI.length);
    ui.ipucu(null);
  }

  /** Oyuncu yüzünü elleriyle kapatır (cee-ee): tasarımcının pozu (assets/ege/cee-<ad>.webp, oyuncunun tuvaline hizalı) ya da kodla eller */
  function elKapa(o: Oyuncu, ad: 'ada' | 'can' | 'elif'): HTMLElement {
    const govde = o.el.querySelector('.mc-oy-govde');
    const isk = iskeletler[ad];
    const ellerUrl = egeAdres(`cee-${ad}-eller`);
    if (isk && ellerUrl && govde) {
      isk.cee(true);
      const img = h('img.mc-oy-resim.eg-cee-resim.eg-cee-eller', { src: ellerUrl, alt: '', draggable: 'false', 'data-ege': `eller-${ad}` });
      govde.append(img);
      // açılınca (eleman kaldırılınca) kollar iner
      new MutationObserver((_, g) => {
        if (!img.isConnected) {
          isk.cee(false);
          g.disconnect();
        }
      }).observe(govde, { childList: true });
      return img;
    }
    const url = egeAdres(`cee-${ad}`);
    if (url && govde) {
      const img = h('img.mc-oy-resim.eg-cee-resim.aktif', { src: url, alt: '', draggable: 'false', 'data-ege': `eller-${ad}` });
      govde.querySelectorAll('.mc-oy-resim.aktif').forEach((e) => e.classList.remove('aktif'));
      govde.append(img);
      return img;
    }
    const [x, y, w] = YUZ[ad];
    const el = h('div.eg-eller', { style: `--fx:${x}%;--fy:${y}%;--fw:${w}%;--ten:${TEN[ad]}`, 'data-ege': `eller-${ad}` }, h('i.sol', { html: EL_SVG }), h('i.sag', { html: EL_SVG }));
    o.el.querySelector('.mc-oy-govde')?.append(el);
    return el;
  }
  /** Mino gözleri yerine kulaklarını kapatır */
  function minoKulakKapa(): HTMLElement {
    const el = h('div.eg-mino-pati', { 'data-ege': 'eller-mino' }, ...MINO_KULAK.map((k) => {
      const [x, y] = minoYuzde(k);
      return h('i', { style: `left:${x}%;top:${y}%` });
    }));
    mino.el.append(el);
    return el;
  }

  /** Cee bekle: mikrofonda ses (5-6 yaş: yumuşak; bağırırsa Ege irkilir), ya da dokunma / büyük düğme */
  function ceeBekle(eller: HTMLElement[]): Promise<void> {
    return gorev<void>((coz) => {
      const sv = new SesSeviyesi(kulak.ayar);
      let ses = 0;
      let yanlis = 0;
      let uyariZaman = 0;
      const ip = ipucu(kutu(eller[0]));
      const dokun = (e: Event) => {
        e.stopPropagation();
        coz();
      };
      eller.forEach((e) => e.addEventListener('pointerdown', dokun));
      void ui.dugme(E.balon.cee).then(() => coz());
      kulak.dinle((o) => {
        const d = sv.kare(o);
        if (ayar.yumusak && sv.yuksekSure > 0.15 && d === 'yuksek' && o.db - kulak.ayar.taban > 36) {
          // bağırdı: Ege irkilir, dudak büzer
          if (performance.now() - uyariZaman > 2500) {
            uyariZaman = performance.now();
            yanlis++;
            ip.yanlis();
            ege.oynat('irkil', 700);
            ege.ifade('buzuk', 1500);
            void ege.balon(B.ege.hih, 900);
            ses = 0;
            if (kabulMu(yas, yanlis)) return coz();
            void mSoyle(M.yumusak).catch(() => undefined);
          }
          return;
        }
        if (sesVar(o, kulak.ayar, 12)) ses += kulak.ayar.kare;
        else ses = Math.max(0, ses - kulak.ayar.kare * 0.5);
        if (ses > 0.18) coz();
      });
      return () => {
        kulak.dinle(null);
        eller.forEach((e) => e.removeEventListener('pointerdown', dokun));
        bitir(ip);
      };
    });
  }

  // ================================================================ 6. Yatak hazırlığı
  async function sahne6() {
    sahne.el.dataset.egSahne = '6';
    muzik.durdur();
    ege.ifade('esniyor', 1600);
    ege.oynat('esne', 1600);
    void ege.balon('Aaahh…', 1200);
    await bekle(900);
    await mSoyle(M.esnedi);
    // akşam iner: ışık biraz kararır, gece perdesi görünür (kenarlarda toplu)
    sahne.el.classList.add('aksamustu');
    perde.classList.add('gorunur');
    // Ada Ege'yi kucaklayıp beşiğe yatırır
    void elif.git(40, Z + 1, 700);
    void can.git(84, Z + 2, 700);
    await ada.git(48, Z + 3, 700);
    ada.poz('mutlu');
    ege.el.classList.add('kucakta');
    void ada.git(62, Z + 3, 1100);
    // yatış: beşiğin üstüne taşınır, sonra içine (yuvaya) yatırılır: arka resim ile fistolu ön kenar arasında,
    // başı yastıkta; beşik sallanınca onunla sallanır
    await tasi(ege.el, BESIK.x - bX(BESIK.w * 0.08), BESIK.y + bY(besikH * 0.42), 1000);
    sahne.dunya.querySelector('[data-ege="sandalye"]')?.classList.add('gidiyor');
    ege.el.classList.remove('kucakta');
    ege.durum('yatik');
    await egeBesige(true, 600);
    ege.el.dataset.uykulu = '1';
    ada.poz('normal');
    efektCal(() => S.hisirti(), 500);
    await ada.git(48, Z + 3, 700);
    const hazirlaKam = (ms: number, ek: HTMLElement[] = []) => kam(dikey ? 44 : 50, dikey ? 66 : 62, dikey ? 1.02 : 1, ms, [besik, perde, ...ek]);
    await hazirlaKam(900);
    await mSoyle(M.hazirla);
    ui.ipucu(I.hazirla);
    durumYaz('hazirla');

    // dört iş, sıra serbest; biten işin üstünde bir yıldız parlar
    const emzik = sahne.koy(h('div.eg-esya.eg-geliyor', { 'data-ege': 'emzik' }, esya('emzik', undefined, 'Emzik')), { x: 58, y: Z + 16, w: 6, z: 12 });
    const battaniye = sahne.koy(h('div.eg-esya.eg-geliyor', { 'data-ege': 'battaniye-ege' }, esya('battaniye-ege', undefined, 'Ege\'nin battaniyesi')), { x: 36, y: Z + 1, w: 14, z: 12 });
    const lamba = sahne.koy(h('div.eg-lamba.eg-geliyor', { 'data-ege': 'lamba', role: 'button', 'aria-label': 'Gece lambası' }, h('i.eg-lamba-isik'), esya('gece-lambasi', undefined, 'Gece lambası')), { x: dikey ? 88 : 93, y: Z + 1, w: 10, z: 12 });
    void hazirlaKam(600, [emzik, battaniye, lamba]);
    const yildizKoy = (el: HTMLElement) => {
      const [x, y] = merkez(el);
      parca.parilti(x, y - 20, 6, 'yildiz');
      const r = el.getBoundingClientRect();
      const k = sahne.on.getBoundingClientRect();
      const y2 = h('i.eg-bitti-yildiz', { html: '<svg viewBox="0 0 40 40"><path d="M20 2L25 14L38 15L28 24L31 37L20 30L9 37L12 24L2 15L15 14Z"/></svg>', style: `left:${r.left + r.width / 2 - k.left}px;top:${r.top - k.top - 8}px` });
      sahne.on.append(y2);
      setTimeout(() => y2.remove(), sure(2500));
    };
    let kalan = 4;
    const bitti = new Set<string>();
    await gorev<void>((coz) => {
      const isBitti = (ad: string, el: HTMLElement) => {
        if (bitti.has(ad)) return;
        bitti.add(ad);
        ui.ilerleme(4 - --kalan, 4);
        efektCal(() => efekt.dogru(), 800);
        yildizKoy(el);
        ip.ilerle();
        if (!kalan) coz();
      };
      const sirali = () => {
        if (!bitti.has('emzik')) return [kutu(emzik), () => ege.agizKutusu()] as const;
        if (!bitti.has('battaniye')) return [kutu(battaniye), () => ege.govdeKutusu()] as const;
        if (!bitti.has('lamba')) return [kutu(lamba), undefined] as const;
        return [kutu(perde), undefined] as const;
      };
      const ip = new Ipucu(() => {
        const [a, b] = sirali();
        return parmak(sahne.on, a, b);
      }, TEST_MODU ? 400 : IPUCU_SURE * 1000);
      acikIpucu.add(ip);
      // emzik → Ege'nin ağzına
      const se = surukle(
        emzik,
        [{ ad: 'agiz', kutu: () => ege.agizKutusu(), pay: 0.6 }, { ad: 'ege', kutu: () => ege.el.getBoundingClientRect(), pay: 0 }],
        (ad) => {
          if (!ad) return void ip.yanlis();
          bitir(se);
          emzik.remove();
          ege.emzik = true;
          efektCal(() => S.cup(), 700);
          void ege.balon(B.ege.cup, 1000);
          isBitti('emzik', ege.el);
          return true;
        },
        () => ege.agizKutusu(),
      );
      // battaniye → Ege'nin üstüne (Ege'ye ya da beşiğin herhangi bir yerine bırakmak yeter). Katlı battaniye beşiğe
      // uçar ve açılır: beşiğin içindeki açık örtü (boynundan ayak ucuna, kenarı fistolu ön kenarın arkasına sokulu)
      let batYanlis = 0;
      const batOrt = () => {
        bitir(sb);
        efektCal(() => S.hisirti(true), 900);
        battaniye.classList.remove('eg-geliyor', 'eg-dalgali');
        void egeOrtuAc(battaniye).then(() => isBitti('battaniye', besikOrtu));
      };
      const sb = dalgaliSurukle(
        battaniye,
        [
          { ad: 'ege', kutu: () => ege.el.getBoundingClientRect(), pay: 0.3 },
          { ad: 'besik', kutu: kutu(besik), pay: 0.15 },
        ],
        (ad) => {
          if (!ad) {
            ip.yanlis();
            // 3-4 yaşta (5-6 yaşta ikinci yanlışta) battaniye kendiliğinden beşiğe süzülür
            if (kucukMu(yas) || ++batYanlis >= 2) {
              iz(sahne.on, battaniye.getBoundingClientRect(), besik.getBoundingClientRect());
              batOrt();
              return true;
            }
            return;
          }
          batOrt();
          return true;
        },
        () => ege.govdeKutusu(),
      );
      // gece lambası: dokun
      lamba.classList.add('parliyor');
      const lambaDokun = (e: Event) => {
        e.stopPropagation();
        if (bitti.has('lamba')) return;
        lamba.classList.remove('parliyor');
        lambaYak();
        isBitti('lamba', lamba);
      };
      lamba.addEventListener('pointerdown', lambaDokun);
      // perde: yana sürükle (kanatlar kapanır)
      const perdeBitir = perdeSurukle(() => isBitti('perde', perde));
      return () => {
        bitir(se, sb, ip);
        lamba.removeEventListener('pointerdown', lambaDokun);
        perdeBitir();
      };
    });
    durumYaz(null);
    ui.ipucu(null);
    ui.ilerleme(4, 4);
    // lambaya sonra dokununca yıldızların rengi değişir
    lamba.addEventListener('pointerdown', () => {
      if (!lambaAcik) return;
      tavan.renkDegistir();
      efektCal(() => S.yildiz(3), 500);
    });
    // oda gece moduna geçer, müzik kutusu ninniyi çalmaya başlar
    await bekle(600);
    muzikKutu();
    ege.emzikHizli(900);
    await bekle(900);
  }

  function lambaYak() {
    lambaAcik = true;
    efektCal(() => S.lambaTik(), 900);
    sahne.el.classList.add('lamba-acik');
    const lamba = sahne.dunya.querySelector<HTMLElement>('[data-ege="lamba"]');
    if (lamba) {
      const r = lamba.getBoundingClientRect();
      const d = sahne.dunya.getBoundingClientRect();
      tavan.el.style.setProperty('--lx', `${((r.left + r.width / 2 - d.left) / d.width) * 100}%`);
    }
    tavan.ac(true);
  }

  /** Perde kanatlarını yana sürükleyerek kapatma (toplam yatay yol); kapanınca oda loş ve mavimsi */
  function perdeSurukle(bitince: () => void): () => void {
    let p = 0;
    let aktif: number | null = null;
    let sonX = 0;
    let bitti = false;
    let sesZaman = 0;
    const gerek = () => Math.max(120, W() * 0.3);
    const bas = (e: PointerEvent) => {
      if (bitti) return;
      e.stopPropagation();
      aktif = e.pointerId;
      sonX = e.clientX;
      try {
        perde.setPointerCapture(e.pointerId);
      } catch {
        /* test ortamı */
      }
      perde.classList.add('tutuldu');
    };
    const hareket = (e: PointerEvent) => {
      if (e.pointerId !== aktif || bitti) return;
      const dx = Math.abs(e.clientX - sonX);
      sonX = e.clientX;
      p = Math.min(1, p + dx / gerek());
      perdeAyarla(0.0 + p);
      sahne.el.style.setProperty('--gece', (p * 0.85).toFixed(3));
      if (performance.now() - sesZaman > 220 && dx > 2) {
        sesZaman = performance.now();
        S.hisirti();
      }
      if (p >= 1) kapan();
    };
    const birak = (e: PointerEvent) => {
      if (e.pointerId !== aktif) return;
      aktif = null;
      perde.classList.remove('tutuldu');
      if (p > 0.75) kapan();
    };
    const kapan = () => {
      if (bitti) return;
      bitti = true;
      p = 1;
      perdeAyarla(1);
      perde.classList.add('kapali');
      sahne.el.classList.add('gece');
      sahne.el.style.setProperty('--gece', '1');
      efektCal(() => S.hisirti(true), 900);
      bitince();
    };
    perde.classList.add('suruklenir');
    perde.addEventListener('pointerdown', bas);
    perde.addEventListener('pointermove', hareket);
    perde.addEventListener('pointerup', birak);
    perde.addEventListener('pointercancel', birak);
    return () => {
      perde.classList.remove('suruklenir', 'tutuldu');
      perde.removeEventListener('pointerdown', bas);
      perde.removeEventListener('pointermove', hareket);
      perde.removeEventListener('pointerup', birak);
      perde.removeEventListener('pointercancel', birak);
    };
  }

  // ================================================================ 7. Ninni
  async function sahne7() {
    sahne.el.dataset.egSahne = '7';
    // Ege'nin gözleri bir kapanıp bir açılır
    let kapali = true;
    const gozKapa = tik(() => {
      if (Math.random() < 0.012) {
        kapali = !kapali;
        ege.ifade(kapali ? 'uyuyor' : 'bakiyor');
      }
    });
    ege.ifade('uyuyor');
    // beşik başrolde: çocuklar beşiğin önünden sola, biraz geriye çekilir (Mino'nun arkasına: derinlik sırası
    // ayak çizgisine göre, Mino önde kalır), kamera beşiğe yaklaşır
    const sol = BESIK.x - bX(BESIK.w / 2);
    for (const o of [ada, can, elif]) o.katman = 8;
    void can.git(sol - bX(9), Z + 5, 900);
    void ada.git(sol - bX(21), Z + 5.5, 900);
    void elif.git(sol - bX(32), Z + 5, 900);
    await kam(dikey ? 72 : 66, 94, dikey ? 1.6 : 1.3, 900, [besik]);
    await mSoyle(M.ninni);
    const tamam = await ninniGorevi(ayar.dize, true);
    gozKapa();
    void tamam;
    // Ege'nin iki gözü de kapanır, "Zzz"
    ege.ifade('uyuyor');
    delete ege.el.dataset.uykulu;
    egeUyku = true;
    ege.durum('yatik');
    void ege.balon(B.ege.zzz, 1600);
    const [zx, zy] = ege.basUstu();
    parca.yuksel(zx, zy, 'z', 3);
    efektCal(() => S.kutuNota(62, 0.1, 2), 1500);
    muzik.durdur();
    await bekle(1500);
  }

  /**
   * Ninni: önce müzik kutusu bir kez çalar (dinle), sonra çocuk kısık sesle söyler ya da beşiği sallar
   * (her yön değişimi bir nota). Doğru söylenen / sallanan her nota tavandaki bir yıldızı yakar, beşik sallanır.
   * Yüksek seste Ege bir gözünü açar, Mino "Şşş, daha kısık!" der (cezasız).
   */
  async function ninniGorevi(dize: number, dinlet: boolean): Promise<void> {
    const notalar = ninni(dize);
    const V = NINNI_VURUS;
    const panel = h('div.mc-karaoke.eg-karaoke');
    const heceEl = notalar.map((n) => h('span.mc-hece', { style: `--h:${(n.midi - 62) / 16}` }, n.hece));
    const satirlar: HTMLElement[] = [];
    notalar.forEach((n, i) => {
      satirlar[n.satir] ??= h('div.mc-satir');
      satirlar[n.satir].append(heceEl[i]);
    });
    const top = h('i.mc-top');
    panel.append(...satirlar, top);
    sahne.on.append(panel);
    const yildizlar = new NinniYildizlari(notalar.length);
    sahne.el.append(yildizlar.el);
    const hece = (i: number) => {
      heceEl.forEach((e, k) => e.classList.toggle('simdi', k === i));
      const r = heceEl[i]?.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      if (r) top.style.transform = `translate(${r.left - p.left + r.width / 2}px, ${r.top - p.top - 14}px)`;
    };
    let yon = 1;
    const besikSalla = (guc = 1) => {
      yon = -yon;
      besikIc.animate([{ rotate: `${-yon * 3 * guc}deg` }, { rotate: `${yon * 4 * guc}deg` }, { rotate: `${yon * 1 * guc}deg` }], { duration: sure(700), easing: 'ease-in-out', fill: 'forwards' });
    };
    try {
      // --- dinle: müzik kutusu
      if (dinlet) {
        muzik.durdur();
        await mSoyle(M.dinle);
        ui.ipucu(I.ninni_dinle);
        for (const [i, n] of notalar.entries()) {
          hece(i);
          efektCal(() => S.kutuNota(n.midi, 0.12, n.vurus * V * 1.6), n.vurus * V * 1000);
          besikSalla(0.6);
          await bekle(n.vurus * V * 1000 + (notalar[i + 1] && notalar[i + 1].satir !== n.satir ? V * 1000 : 0));
        }
        heceEl.forEach((e) => e.classList.remove('simdi'));
      }
      // --- sen söyle / salla
      await mSoyle(M.sen);
      ui.ipucu(mik() ? I.ninni_soyle : I.ninni_salla);
      durumYaz('ninni');
      let yanlis = 0;
      for (;;) {
        const iyi = await sesliGorev(() => (mik() ? ninniSoyle(notalar, hece, heceEl, yildizlar, besikSalla) : ninniSalla(notalar, hece, heceEl, yildizlar, besikSalla)), null);
        if (iyi >= notalar.length * NINNI_GECER || kabulMu(yas, yanlis)) break;
        yanlis++;
        heceEl.forEach((e) => e.classList.remove('iyi', 'kacti', 'bos'));
        await mSoyle(M.bir_daha);
      }
      durumYaz(null);
      ui.ipucu(null);
      panel.classList.add('bitti');
      await bekle(700);
    } finally {
      panel.remove();
      yildizlar.el.classList.add('gidiyor');
      setTimeout(() => yildizlar.el.remove(), sure(900));
    }
  }

  /** Mikrofonla söyleme (dokunma: beşiği sallamak o notayı sayar). Dönüş: iyi nota sayısı */
  async function ninniSoyle(notalar: Nota[], hece: (i: number) => void, heceEl: HTMLElement[], yildizlar: NinniYildizlari, besikSalla: (g?: number) => void): Promise<number> {
    const V = NINNI_VURUS;
    let iyi = 0;
    let referans: number | null = null;
    const refPerdeler: number[] = [];
    let perdeler: number[] = [];
    let sesliKare = 0;
    let kareSay = 0;
    let sallandi = false;
    let simdiki: Nota | null = null;
    let kisikUyari = 0;
    const sv = new SesSeviyesi(kulak.ayar);
    const sal = new Salinim();
    const surBitir = besikSuruklenir(sal, () => (sallandi = true));
    kulak.dinle((o: Ozellik) => {
      if (!simdiki) return;
      kareSay++;
      sv.kare(o);
      if (sesVar(o, kulak.ayar, 10)) sesliKare++;
      if (o.perde !== null && sesVar(o, kulak.ayar, 10)) {
        perdeler.push(o.perde);
        if (simdiki.satir === 0 && simdiki.midi === 67) refPerdeler.push(o.perde);
      }
      // yüksek ses: Ege bir gözünü açar
      if (sv.yuksekSure > 0.3 && performance.now() - kisikUyari > 3500) {
        kisikUyari = performance.now();
        ege.ifade('tek-goz', 1400);
        void balon(minoBalon, M.kisik, 1300);
      }
    });
    try {
      for (const [i, n] of notalar.entries()) {
        simdiki = n;
        perdeler = [];
        sesliKare = 0;
        kareSay = 0;
        sallandi = false;
        hece(i);
        await bekle(n.vurus * V * 1000);
        if (!referans) referans = referansBul(refPerdeler);
        const oran2 = kareSay ? sesliKare / kareSay : 0;
        const r = sallandi ? 'dogru' : notaDegerlendir({ perdeler, sesli: oran2, midi: n.midi, referans, tolerans: 3, yalnizSes: !ayar.melodi || i < 2 });
        const tamam = r === 'dogru' || r === 'ses';
        heceEl[i].classList.add(tamam ? 'iyi' : r === 'sessiz' ? 'bos' : 'kacti');
        if (tamam) {
          iyi++;
          yildizlar.yak(i);
          S.yildiz(i);
          besikSalla(0.8);
        } else if (referans && r !== 'sessiz' && perdeler.length) {
          // anlık: çok uzaksa Ege kaşını kaldırır (cezasız)
          const f = anlikFark(perdeler[perdeler.length - 1], referans, n.midi);
          if (Math.abs(f) > 5) ege.ifade('tek-goz', 700);
        }
        if (notalar[i + 1] && notalar[i + 1].satir !== n.satir) {
          simdiki = null;
          await bekle(V * 1000);
        }
      }
    } finally {
      simdiki = null;
      kulak.dinle(null);
      surBitir();
    }
    return iyi;
  }

  /** Mikrofonsuz: beşiği sağa-sola sallamak; her salınım bir nota (müzik kutusu çalar, yıldız yanar) */
  function ninniSalla(notalar: Nota[], hece: (i: number) => void, heceEl: HTMLElement[], yildizlar: NinniYildizlari, besikSalla: (g?: number) => void): Promise<number> {
    return gorev<number>((coz) => {
      let i = 0;
      hece(0);
      const sal = new Salinim();
      const ip = new Ipucu(() => salIpucu(), TEST_MODU ? 400 : IPUCU_SURE * 1000);
      acikIpucu.add(ip);
      const surBitir = besikSuruklenir(sal, () => {
        const n = notalar[i];
        if (!n) return;
        ip.ilerle();
        efektCal(() => S.kutuNota(n.midi, 0.13, 1.1), 500);
        heceEl[i].classList.add('iyi');
        yildizlar.yak(i);
        besikSalla(1);
        i++;
        if (i >= notalar.length) coz(notalar.length);
        else hece(i);
      });
      return () => {
        surBitir();
        bitir(ip);
      };
    });
  }

  /** Beşik ipucu: sağa-sola sallayan parmak */
  function salIpucu(): () => void {
    const r = () => besik.getBoundingClientRect();
    const sol = () => {
      const k = r();
      return new DOMRect(k.left + k.width * 0.2, k.top + k.height * 0.35, 1, 1);
    };
    const sag = () => {
      const k = r();
      return new DOMRect(k.left + k.width * 0.8, k.top + k.height * 0.35, 1, 1);
    };
    return parmak(sahne.on, sol, sag);
  }

  /** Beşik parmakla sağa-sola sürüklenir; her yön değişimi (salınım) için fn */
  function besikSuruklenir(sal: Salinim, fn: () => void): () => void {
    let aktif: number | null = null;
    let sonX = 0;
    const bas = (e: PointerEvent) => {
      e.stopPropagation();
      aktif = e.pointerId;
      sonX = e.clientX;
      try {
        besik.setPointerCapture(e.pointerId);
      } catch {
        /* test ortamı */
      }
    };
    const hareket = (e: PointerEvent) => {
      if (e.pointerId !== aktif) return;
      const dx = e.clientX - sonX;
      sonX = e.clientX;
      besikIc.style.rotate = `${Math.max(-6, Math.min(6, dx * 0.4))}deg`;
      if (sal.hareket(dx)) fn();
    };
    const birak = (e: PointerEvent) => {
      if (e.pointerId !== aktif) return;
      aktif = null;
      besikIc.style.rotate = '';
    };
    besik.classList.add('suruklenir');
    besik.addEventListener('pointerdown', bas);
    besik.addEventListener('pointermove', hareket);
    besik.addEventListener('pointerup', birak);
    besik.addEventListener('pointercancel', birak);
    // Ege ve battaniyesi beşiğin içinde: onlara basmak da beşiği sallar (olay beşiğe kabarır)
    egeSerbest = false;
    return () => {
      besik.classList.remove('suruklenir');
      besik.removeEventListener('pointerdown', bas);
      besik.removeEventListener('pointermove', hareket);
      besik.removeEventListener('pointerup', birak);
      besik.removeEventListener('pointercancel', birak);
      besikIc.style.rotate = '';
      egeSerbest = true;
    };
  }

  // ================================================================ 8. Şşş! Ve Mino'nun burnu
  async function sahne8() {
    sahne.el.dataset.egSahne = '8';
    muzik.durdur();
    await kam(50, 96, taban, 900, [besik, minoKutu]);
    await mSoyle(M.uyudu);
    // herkes parmak uçlarında
    for (const o of [ada, can, elif]) o.el.classList.add('parmakucu');
    can.poz('saklaniyor');
    const ortu = sahne.dunya.querySelector<HTMLElement>('[data-ege="ortu"]');
    ortu?.classList.add('nefes');
    ay.el.classList.add('acik');
    ay.ayarla(0);
    // 1. kısım: sessizlik; ay dolar. %80'de Mino'nun burnu kaşınır
    let gecen = 0;
    await sessizlik(ayar.sessiz, BURUN_ORAN, (g) => (gecen = g));
    // 2. kısım: burun
    const tuttu = await burun();
    void kam(50, 96, taban, 900, [besik, minoKutu]);
    if (tuttu) {
      // minicik hıpşu: Ege uykusunda gülümser, herkes rahat bir nefes alır
      efektCal(() => S.hipsu(), 700);
      mino.tepki('hapsu', 0.5);
      // minicik hıpşu: hapşu yüzü, küçük püf
      setTimeout(() => void mino.ifade('hapsu', { boy: 'kucuk', ms: 900 }), sure(250));
      const [nx, ny] = minoEkran(MINO_BURUN);
      yazi(nx + 10, ny - 30, B.hipsu, '#ff9ec4');
      await bekle(700);
      ege.ifade('uykuda-gulumsuyor');
      for (const o of [ada, can, elif]) void o.balon(B.oh, 1100);
      can.poz('normal');
      await bekle(900);
      // ay dolar
      await sessizlik(ayar.sessiz, 1, () => undefined, gecen);
    } else {
      // HAPŞUU! Ege uyanır; Mino utanır. Kısa ninni ve kısa sessizlik
      efektCal(() => S.hapsu(), 1800);
      mino.tepki('hapsu', 1.2);
      // HAPŞUU: kocaman hapşu yüzü, püf "pat", kafa sarsılır
      // (tepkinin nefes alma yarısında kaşıntı yüzü kalır, patlama anında hapşu yüzü)
      setTimeout(() => void mino.ifade('hapsu', { boy: 'buyuk', ms: 1400 }), sure(600));
      const [nx, ny] = minoEkran(MINO_BURUN);
      yazi(nx, ny - 40, B.hapsu, '#ff8a3d', true);
      sahne.titret(1.3);
      minoKutu.classList.add('kulak-ucus');
      setTimeout(() => minoKutu.classList.remove('kulak-ucus'), sure(900));
      egeUyku = false;
      ege.oynat('irkil', 800);
      ege.ifade('saskin');
      await bekle(900);
      ege.ifade('bakiyor');
      mino.tepki('hayir', 0.8);
      await mSoyle(M.pardon);
      ay.ayarla(0.5);
      ege.el.dataset.uykulu = '1';
      await ninniGorevi(1, false);
      ege.ifade('uyuyor');
      delete ege.el.dataset.uykulu;
      egeUyku = true;
      await sessizlik(Math.min(3, ayar.sessiz), 1, () => undefined, Math.min(3, ayar.sessiz) * 0.5);
    }
    ay.ayarla(1);
    const [ax, ay2] = merkez(ay.el);
    parca.parilti(ax, ay2, 10, 'yildiz');
    efektCal(() => S.yildiz(5), 600);
    await bekle(900);
    ay.el.classList.remove('acik');
    for (const o of [ada, can, elif]) o.el.classList.remove('parmakucu');
    can.poz('normal');
  }

  /**
   * Sessizlik: süre boyunca ay dolar. Mikrofonda ses çıkarsa Ege kıpırdar, emziğini hızlı hızlı emer, ay biraz geri iner.
   * Mikrofonsuz: parmağını ekrana basılı tutmak "sessizce beklemek" sayılır. `bitisOran`da biter.
   */
  function sessizlik(hedef: number, bitisOran: number, gecenYaz: (g: number) => void, bas = 0): Promise<void> {
    return gorev<void>((coz) => {
      let gecen = bas;
      let dokunuyor = false;
      let uyari = 0;
      const sayac = new SessizlikSayaci(kulak.ayar);
      const m = mik();
      ui.ipucu(m ? I.sessiz : I.sessiz_dokun);
      durumYaz('sessiz');
      let gurultu = 0;
      let sonSoz = 0;
      const kapa = tik((dt) => {
        if (dokunuyor) gecen += dt;
        ay.ayarla(gecen / hedef);
        gecenYaz(gecen);
        if (gecen >= hedef * bitisOran) coz();
      });
      if (m)
        kulak.dinle((o) => {
          // mevcut sessizlik sayacı (kısa çıtırtılar affedilir); ses sürerse Ege kıpırdar, ay geri iner
          const r = sayac.kare(o);
          if (r.gecen > 0) {
            if (!dokunuyor) gecen += kulak.ayar.kare;
            gurultu = 0;
            return;
          }
          gurultu += kulak.ayar.kare;
          if (gurultu > 0.15 && performance.now() - uyari > 1800) {
            uyari = performance.now();
            gecen = Math.max(0, gecen - AY_GERI);
            ay.sars();
            ege.kipir(0.5);
            ege.emzikHizli(1500);
            void ege.balon(B.ege.cup, 900);
            if (performance.now() - sonSoz > 6000) {
              sonSoz = performance.now();
              void mSoyle(M.kipirdadi).catch(() => undefined);
            } else void balon(minoBalon, B.ada.sss, 1000);
          }
        });
      const basla = (e: PointerEvent) => {
        if ((e.target as Element).closest('button')) return;
        dokunuyor = true;
      };
      const birak = () => (dokunuyor = false);
      sahne.el.addEventListener('pointerdown', basla);
      sahne.el.addEventListener('pointerup', birak);
      sahne.el.addEventListener('pointercancel', birak);
      return () => {
        kapa();
        kulak.dinle(null);
        sahne.el.removeEventListener('pointerdown', basla);
        sahne.el.removeEventListener('pointerup', birak);
        sahne.el.removeEventListener('pointercancel', birak);
        durumYaz(null);
        ui.ipucu(null);
      };
    });
  }

  /** Mino'nun burnu kaşınır: çocuk burnuna basılı tutarsa hapşırık tutulur (true); süre geçerse HAPŞU (false) */
  async function burun(): Promise<boolean> {
    minoSerbest = false;
    // burun anında Mino çocukların önünde (yüzü ve burnu kapanmasın)
    const minoZ = minoKutu.style.zIndex;
    minoKutu.style.zIndex = '14';
    const minoYer ={ x: Number(minoKutu.style.getPropertyValue('--x')), y: Number(minoKutu.style.getPropertyValue('--y')) };
    void tasi(minoKutu, dikey ? 27 : 24, Z + 5, 600);
    void kam(dikey ? 34 : 38, 92, taban * 1.12, 700, [minoKutu]);
    const [nx, ny] = minoYuzde(MINO_BURUN);
    const parla = h('i.eg-burun-parla', { style: `left:${nx}%;top:${ny}%`, 'data-ege': 'burun' });
    const halka = h('i.eg-burun-halka', { style: `left:${nx}%;top:${ny}%` });
    mino.el.append(parla, halka);
    // tasarımcının burun kaşıntısı yüzü (şaşı gözler, geniş burun, seğirme çizgileri; burun kendiliğinden seğirir)
    void mino.ifade('burun-kasinti');
    efektCal(() => S.haha(3), 2200);
    void balon(minoBalon, B.haha, 2000);
    mino.tepki('esne', 1.6);
    await bekle(1200);
    await mSoyle(M.burun);
    await mSoyle(M.tut);
    ui.ipucu(I.burun);
    durumYaz('burun');
    try {
      return await gorev<boolean>((coz) => {
        let tut = 0;
        let basili = false;
        let zorlanma = 0;
        // süre duvar saatiyle (kare hızı düşse de — yavaş telefon, arka planda sekme — burun anı uzayıp takılmaz)
        const bitis = performance.now() + BURUN_SURE * 1000;
        const ip = ipucu(() => parla.getBoundingClientRect(), undefined, 2500);
        const kapa = tik((dt) => {
          const kalan = (bitis - performance.now()) / 1000;
          if (basili) {
            tut += dt;
            zorlanma -= dt;
            if (zorlanma <= 0) {
              zorlanma = 1.1;
              S.zorlan();
            }
          } else tut = Math.max(0, tut - dt * 2);
          halka.style.setProperty('--p', Math.min(1, tut / BURUN_TUT).toFixed(3));
          if (tut >= BURUN_TUT) coz(true);
          else if (kalan <= 0 && !basili) coz(false);
          else if (kalan <= -3) coz(tut > BURUN_TUT * 0.5);
        });
        // yedek: kare döngüsü hiç çalışmasa da (sekme arka planda) burun anı biter
        const yedek = setTimeout(() => coz(tut > BURUN_TUT * 0.5), (BURUN_SURE + 4) * 1000);
        const bas = (e: PointerEvent) => {
          e.stopPropagation();
          if (!basili) void mino.ifade('burun-tut'); // kollar kalkar, patiler burunda, yanaklar şişer, minik titrer
          basili = true;
          ip.ilerle();
          minoKutu.classList.add('tutuluyor');
          try {
            minoKutu.setPointerCapture(e.pointerId);
          } catch {
            /* test ortamı */
          }
        };
        const birak = () => {
          if (basili) void mino.ifade('burun-kasinti');
          basili = false;
          minoKutu.classList.remove('tutuluyor');
        };
        minoKutu.addEventListener('pointerdown', bas);
        minoKutu.addEventListener('pointerup', birak);
        minoKutu.addEventListener('pointercancel', birak);
        return () => {
          kapa();
          clearTimeout(yedek);
          bitir(ip);
          minoKutu.removeEventListener('pointerdown', bas);
          minoKutu.removeEventListener('pointerup', birak);
          minoKutu.removeEventListener('pointercancel', birak);
          minoKutu.classList.remove('tutuluyor');
        };
      });
    } finally {
      durumYaz(null);
      ui.ipucu(null);
      parla.remove();
      halka.remove();
      minoKutu.classList.remove('kasiniyor');
      // tutabildiyse yüzü hıpşuya kadar "tutuyor"da kalır; sahne 8 hapşu yüzüne geçirir
      minoSerbest = true;
      setTimeout(() => {
        minoKutu.style.zIndex = minoZ;
        void tasi(minoKutu, minoYer.x, minoYer.y, 700);
      }, sure(1600));
    }
  }

  // ================================================================ 9. İyi geceler
  async function sahne9() {
    sahne.el.dataset.egSahne = '9';
    // anne uyanır, şaşkın bir şekilde beşiğe bakar
    anneUyuyor = false;
    clearInterval(anneZzz);
    await kam(46, 96, taban, 900, [anne, besik]);
    // açık battaniye omzundan kucağına kayar (uyanma), sonra katlanıp kanepenin koluna konur
    const katli = sahne.dunya.querySelector<HTMLElement>('[data-ege="battaniye"]');
    if (anneOrtu?.classList.contains('acik')) {
      await anneOrtu
        .animate([{ translate: '0 0', opacity: 1 }, { translate: '0 9%', opacity: 0 }], { duration: sure(550), easing: 'ease-in', fill: 'forwards' })
        .finished.catch(() => undefined);
      anneOrtu.classList.remove('acik');
      anne.classList.remove('sokuldu');
      if (katli) {
        katli.getAnimations().forEach((a) => a.cancel());
        katli.classList.remove('gizli');
        katli.style.zIndex = '4';
        katli.style.setProperty('--x', String(KOLTUK.x - bX(KOLTUK.w * 0.36)));
        katli.style.setProperty('--y', String(oturak(0.34)));
        katli.style.setProperty('--w', '10');
        katli.classList.add('eg-geliyor');
      }
    }
    anne.classList.remove('uzanik');
    anne.classList.add('oturuyor');
    annePoz('gulumsuyor');
    if (anneResim !== 'ayakta') {
      // başını kaldırıp doğrulur (oturuş çizimi, kanepede aynı yerde)
      const yer = anneOturYer(anneResim);
      anne.style.setProperty('--x', String(yer.x));
      anne.style.setProperty('--y', String(yer.y));
      anneGov.animate(
        [
          { transformOrigin: '50% 100%', scale: '1.02 0.9', translate: '0 2%' },
          { transformOrigin: '50% 100%', scale: '0.98 1.04', translate: '0 -1.5%', offset: 0.5 },
          { transformOrigin: '50% 100%', scale: '1 1', translate: '0 0' },
        ],
        { duration: sure(650), easing: 'ease-out' },
      );
      void kam(46, 96, taban, 600, [anne, besik]);
    }
    const ortuA = sahne.dunya.querySelector<HTMLElement>('[data-ege="battaniye"]');
    ortuA?.classList.add('kaydi');
    await bekle(700);
    void balon(anneBalon, B.anne_saskin, 1600);
    await bekle(1200);
    await mSoyle(M.fisilti);
    durumYaz('fisilti');
    ui.ipucu(I.fisilti);
    await sesliGorev(() => fisiltiBekle(), null);
    durumYaz(null);
    ui.ipucu(null);
    ui.dugmeKaldir();
    // kalpler Ege'ye uçar; Ege uykusunda gülümser
    const [ex, ey] = ege.basUstu();
    parca.yuksel(ex, ey + 30, 'kalp', 5, 30);
    ege.ifade('uykuda-gulumsuyor');
    efektCal(() => S.kutuNota(67, 0.08, 1.4), 900);
    await bekle(1200);

    // final: anne fısıldar, çocuklara sarılır
    await anneSoyle(E.anne.aferin);
    anne.classList.remove('oturuyor');
    annePoz('sariliyor');
    anne.classList.add('sariliyor');
    if (anneResim === 'sariliyor') {
      // çocuklar kanepeye koşar, anne kollarını açıp hepsine sarılır (anne kanepede oturur)
      const yer = anneOturYer('sariliyor');
      anne.style.setProperty('--x', String(yer.x));
      anne.style.setProperty('--y', String(yer.y));
      const gel = [ada.git(KOLTUK.x - bX(11), Z + 3, 900), elif.git(KOLTUK.x + bX(4), Z + 1, 900), can.git(KOLTUK.x + bX(19), Z + 2, 900)];
      // Mino yer açar: Can'ın yanına geçer (çocukların arkasında kalmasın)
      void tasi(minoKutu, Math.min(86, KOLTUK.x + bX(36)), Z - 3, 900);
      void kam(40, 96, taban, 900, [anne, ada.el, elif.el, can.el, minoKutu]);
      await Promise.all(gel);
    } else {
      void ada.git(32, Z + 3, 900);
      void elif.git(46, Z + 1, 900);
      void can.git(58, Z + 2, 900);
      await tasi(anne, 45, Z + 2, 900);
    }
    for (const [i, o] of [ada, elif, can].entries()) setTimeout(() => {
      o.poz('mutlu', 1600);
      void o.zipla(8);
    }, sure(i * 150));
    const [ax, ay2] = anneBasEkran();
    parca.yuksel(ax, ay2 + 20, 'kalp', 6, 60);
    // sarılma anı (test modunda da kısalmaz: e2e bu anın görüntüsünü alır)
    durumYaz('saril');
    await new Promise((r) => setTimeout(r, 1400));
    durumYaz(null);
    await mSoyle(M.son);
    // Mino esner, kanepenin koluna kıvrılıp uyur (oturakta anne var)
    mino.tepki('esne', 2);
    await bekle(1200);
    minoKutu.classList.add('uyuyor');
    if (anneResim === 'sariliyor') await tasi(minoKutu, KOLTUK.x - bX(KOLTUK.w * 0.36), KOLTUK.y + bY(koltukH * 0.42), 900, 15);
    else await tasi(minoKutu, KOLTUK.x - 6, KOLTUK.y + bY(8), 900, 20);
    mino.uyu();
    // ödül kartı
    odulKarti();
    await bekle(2600);
    // kamera pencereden aya; perde biraz aralanır, müzik kutusu son notayı çalar
    perde.classList.remove('kapali');
    perdeAyarla(0.18);
    sahne.el.classList.add('final');
    efektCal(() => S.kutuNota(62, 0.12, 3), 2500);
    const cr = pencere.getBoundingClientRect();
    const sr = sahne.el.getBoundingClientRect();
    void sahne.kamera(((cr.left + cr.width / 2 - sr.left) / sr.width) * 100, ((cr.top + cr.height / 2 - sr.top) / sr.height) * 100, 2.1, 3200);
    await bekle(3400);
  }

  /** "İyi geceler Ege" fısıltısı: fısıltı başarı; yüksek sesle söylerse Ege kıpırdar, Ada "Şşş!" der. Dokunma: kalp. */
  function fisiltiBekle(): Promise<void> {
    return gorev<void>((coz) => {
      const sv = new SesSeviyesi(kulak.ayar);
      let yanlis = 0;
      const ip = ipucu(() => ege.yuzKutusu());
      void ui.dugme(I.kalp).then(() => {
        kalpGonder();
        coz();
      });
      document.querySelector('.mc-buyuk-dugme')?.classList.add('eg-kalp-dugme');
      const egeDokun = (e: Event) => {
        e.stopPropagation();
        kalpGonder();
        coz();
      };
      ege.el.addEventListener('pointerdown', egeDokun);
      sv.onSoyleyis = (s) => {
        if (s.sonuc === 'fisilti' || kabulMu(yas, yanlis)) return coz();
        yanlis++;
        ip.yanlis();
        ege.kipir(0.6);
        ege.emzikHizli(1500);
        void ada.balon(B.ada.sss, 1200);
        can.poz('saklaniyor', 1400);
      };
      kulak.dinle((o) => sv.kare(o));
      return () => {
        kulak.dinle(null);
        ege.el.removeEventListener('pointerdown', egeDokun);
        bitir(ip);
      };
    });
  }

  function kalpGonder() {
    const b = document.querySelector('.mc-buyuk-dugme');
    const [ex, ey] = ege.basUstu();
    const [bx, by] = b ? merkez(b) : [ex, ey + 200];
    const k = sahne.on.getBoundingClientRect();
    for (let i = 0; i < 3; i++) {
      const el = h('i.eg-ucan-kalp', { html: KALP_SVG });
      sahne.on.append(el);
      el.animate(
        [
          { transform: `translate(${bx - k.left}px, ${by - k.top}px) scale(0.4)`, opacity: 0 },
          { transform: `translate(${(bx + ex) / 2 - k.left + (i - 1) * 30}px, ${Math.min(by, ey) - 60 - k.top}px) scale(1)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${ex - k.left}px, ${ey + 40 - k.top}px) scale(0.6)`, opacity: 0 },
        ],
        { duration: sure(1100), delay: sure(i * 150), easing: 'cubic-bezier(.3,0,.5,1)', fill: 'backwards' },
      ).onfinish = () => el.remove();
    }
    efektCal(() => S.yildiz(2), 600);
  }

  function odulKarti() {
    const kart = h(
      'div.eg-odul',
      { 'data-ege': 'odul' },
      h('div.eg-odul-resim', {}, h('img', { src: egeAdres('kukla-ayi') || egeAdres('kukla-ayi-govde'), alt: '' }), h('div.eg-odul-ege.eg-yuzlu', { 'data-goz': 'kapali', 'data-agiz': 'notr', 'data-kas': 'normal', html: ege.kar.el.innerHTML }), h('img', { src: egeAdres('kukla-civciv') || egeAdres('kukla-civciv-govde'), alt: '' })),
      h('b', {}, E.kart),
    );
    sahne.el.append(kart);
    void kart.offsetWidth;
    kart.classList.add('acik');
    efektCal(() => S.yasasin(), 2000);
    const [kx, ky] = merkez(kart);
    konfetiPatlat(kok, kx, ky, 50);
    setTimeout(() => kart.classList.add('gidiyor'), sure(2400));
  }
}

