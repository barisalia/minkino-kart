/**
 * Bölüm 2: Şşş, Ege Uyuyor! (senaryo: ekip/senaryo/ege-duzeltme.md; 7 sahne, çıngırak ve cee-ee çıktı)
 * Tek hedef: "Anne dinlensin. Ege ne istiyor, bulalım!" İlerlemeyi Ege'nin yüzü gösterir:
 * ağlıyor → aç → surat asıyor → güldü → esniyor → uyuyor.
 * 1 anne mamayı hazırlar, uyur: battaniye ört → 2 Ege aç: önlük, kaşık, üfle, ver, peçeteyle sil → 3 Ege sıkılmış:
 * sepetteki oyuncakları göster, en alttaki kuklalar Ada'ya ve Can'a, konuştur (ince/kalın ses) → 4 yoruldu: anne
 * Ege'yi yatırır; emzik, battaniye, gece lambası, perde (perdeden tüy düşer, Mino'nun kulağına konar) → 5 ninni
 * (kısık ses ya da beşiği sallamak) → 6 sessizlik; tüy Mino'nun burnuna kayar → 7 fısıltıyla "İyi geceler Ege", final.
 *
 * Her sesli görevin dokunma karşılığı var; 2 yanlışta ya da 8 sn'de parmak ipucu; her yaşta 3. denemede kabul;
 * hiçbir yerde kilitlenme yok. Beşik ve sepet katmanlı (arka resim → içindekiler → ön kenar); battaniyeler açılır. Algılama kilitli ses sisteminden (ekip/SES-SISTEMI.md): Ufleme (katı, 0.5),
 * Perde, SessizlikSayaci; kısık ses / fısıltı için mevcut seviye ölçümünü saran yeni sınıf (ege-seviye.ts).
 * Oyun ses çıkarırken kulak susar; sesli görevlerde müzik durur.
 */
import E from '../../content/macera-ege.json';
import { efekt, konus } from '../../src/audio/ses';
import { DosyaMuzik, fonDosyasi } from '../../src/audio/dosya-muzik';
import { sarkiSesiAyarla } from '../../src/audio/sarki-kayit';
import { muzikBaslat, muzikDurdur } from '../../src/audio/muzik';
import { durum } from '../../src/engine/ilerleme';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { Mino, minoBurunYukle } from '../../src/mino/mino';
import { SessizlikSayaci, type Ozellik } from '../../ses-testi/src/analiz';
import { Perde, sesVar, Ufleme } from '../../orman/src/gorev';
import { kulak } from '../../orman/src/kulak';
import type { BolumArayuz } from './dogumgunu';
import { Ege, egeGenislik } from './ege-bebek';
import { ANNE_GORSEL, ANNE_NEFES, ANNE_ORTU_SVG, ANNE_TUVAL, anneKatmanli, annePozVar, EGE_ORTU_SVG, egeAdres, esya, Kukla, oran, YASTIK_SVG } from './ege-cizim';
import { AyGosterge, KALP_SVG, NinniYildizlari, Parcaciklar, TavanYildizlari, yansiYazi } from './ege-efekt';
import {
  AY_GERI,
  BURUN_ORAN,
  BURUN_SURE,
  BURUN_TUT,
  buharSonme,
  egeAyar,
  gulme,
  kabulMu,
  kucukMu,
  IPUCU_SURE,
  NINNI_GECER,
  ninni,
  NINNI_DIZE,
  NINNI_REF_MIDI,
  ninniSatirArasiMs,
  ninniSonuMs,
  NINNI_VURUS,
  ninniYavas,
  Salinim,
  SERBEST_KUKLA,
  SERT_GUC,
  SERT_SURE,
} from './ege-mantik';
import * as S from './ege-ses';
import { SesSeviyesi } from './ege-seviye';
import { Ipucu, iz, parmak, Surukle, tasi, type Hedef } from './ege-surukle';
import { Oyuncu } from './oyuncu';
import { cocukBoyu, cocukOyuncu } from './ege-cocuk';
import { boyGenislik } from '../../src/karakter/boy';
import { AnneIskelet, anneIskeletVar } from './ege-anne';
import { AnneGoz } from './anne-goz';
import { adres } from './gorsel';
import { Sahne, yanDolguEkle } from './sahne';
import { notaDegerlendir, referansBul, type Nota } from './sarki';
import NINNI_SESI from '../../assets/muzik/ninni-sozlu.mp3?url';
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

/** Minik beyaz tüy (perdeden düşer, Mino'nun kulağına konar): gövde, iki yanında yumuşak saçaklar, sap */
const TUY_SVG =
  '<svg viewBox="0 0 40 90" aria-hidden="true"><path d="M20 88C20 70 19 40 21 6" fill="none" stroke="#a8927a" stroke-width="2.4" stroke-linecap="round"/><path d="M21 6C10 14 5 30 7 46C8 56 13 64 20 70C27 63 33 54 34 43C36 28 31 14 21 6Z" fill="#fffdf7" stroke="#8c7a66" stroke-width="2.2" stroke-linejoin="round"/><path d="M20 22L12 30M20 34L10 42M21 46L12 55M21 24L29 31M21 36L31 42M21 48L29 55" stroke="#d8cbbb" stroke-width="1.6" stroke-linecap="round"/></svg>';
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
  const sahne = new Sahne('parti-sahne/oda', 'parti-sahne/oda-dikey');
  sahne.el.classList.add('eg-sahne');
  kok.append(sahne.el);
  // yatay ekranda sahne ortada dikey bir bantta; iki yanı odanın geniş çizimi (yoksa bulanık devamı; sahne.ts → yanDolgu)
  yanDolguEkle(kok, adres('parti-sahne/oda'), adres('parti-sahne/oda-genis'));
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

  // --- boylar: tek tablodan (src/karakter/boy.ts). Mino'nun kutusu MINO_W (b); çocuklar Mino'nun ~1.35 katı, anne
  // çocuğun 1.35 katı, oturan Ege Mino'dan biraz büyük. Eşyalar (kanepe, beşik, mama sandalyesi) oturanla orantılı:
  // *_K = yeni ölçü / eski tasarım ölçüsü (anne 19 b genişlik, Ege 16 b)
  const MINO_W = 21;
  const ANNE_B = boyGenislik('anne', MINO_W) / ANNE_TUVAL.ayakta[0];
  const ANNE_K = (ANNE_B * ANNE_TUVAL.ayakta[0]) / 19;
  const EGE_W = egeGenislik(MINO_W);
  const EGE_K = EGE_W / 16;

  // --- dekor
  // kanepe annenin oturuş pozlarına göre (aynı ölçekte kıvrılmış anne oturağa sığsın); dikeyde sol kenardan içeride
  const KOLTUK_W = 46 * ANNE_K;
  const KOLTUK = { x: Math.max(20, bX(KOLTUK_W) / 2 + 1), y: Z + 15, w: KOLTUK_W };
  const koltukH = KOLTUK.w * oran('koltuk');
  const koltuk = sahne.koy(esya('koltuk', 'parti/koltuk', 'Kanepe'), { ...KOLTUK, z: 3 });
  // beşik büyüyen Ege'yle birlikte büyür ama onun kadar değil (oda dar: dikey telefonda beşik ekranı kaplamasın);
  // içindeki Ege beşiğin yüzdesiyle yerleşir, payı --ege-besik (ege.css → .eg-besik-yuva): Ege her yerde aynı boyda
  const BESIK_W = 31 * Math.min(EGE_K, 1.35);
  const BESIK = { x: Math.min(71, 100 - bX(BESIK_W) / 2 + 2), y: Z + 6, w: BESIK_W };
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
  besik.style.setProperty('--ege-besik', (EGE_W / (0.516 * BESIK_W)).toFixed(4));
  const besikIc = besik.querySelector<HTMLElement>('.eg-besik-ic')!;

  // --- Ege: beşiğin içinde oturarak başlar (yuvada; konumu CSS'te beşiğin yüzdesiyle)
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
  const anne = sahne.koy(h('div.eg-anne', { 'data-ege': 'anne' }, anneGov, anneBalon), { x: 55, y: Z + 10, w: ANNE_TUVAL.ayakta[0] * ANNE_B, z: 4 });
  anne.classList.toggle('katmanli', !!anneNefes);
  // ayakta pozunda konuşurken ağzı oynar (katmanlı iskelet, ege-anne.ts): img'nin üstünde yalnız ağız yaması
  const anneIsk = egeAdres(ANNE_GORSEL) && anneIskeletVar() ? new AnneIskelet(anneBalon, () => anne.classList.add('iskeletli')) : null;
  if (anneIsk) anneGov.append(anneIsk.el);
  // göz kırpma (anne-goz.ts): ayakta ve sarılıyor çizimlerinde; uyurken yok
  const anneGoz = egeAdres(ANNE_GORSEL) ? new AnneGoz() : null;
  if (anneGoz) anneGov.append(anneGoz.el);
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
    // katmanlı uyku çizimi (anneNefes) ya da uyuyor: kırpış yok; sarılıyor yalnız kendi çizimi varsa
    anneGoz?.poz(anneResim === 'ayakta' && !ayri ? 'anne' : anneResim === 'sariliyor' ? 'anne-sariliyor' : null);
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
  // çocuklar: parçalı iskeleti olan (Ada, Can) ortak Karakter bileşeniyle oynar (ege-cocuk.ts); ölçek parti tuvaliyle aynı.
  // Boyları tablodan (Mino'nun ~1.35 katı); COCUK_K: eski tasarıma (Ada 20.65 b) göre büyüme (kuklalar, aralar)
  const ADA_BOY = cocukBoyu('ada', MINO_W);
  const CAN_BOY = cocukBoyu('can', MINO_W);
  const ELIF_BOY = cocukBoyu('elif', MINO_W);
  const COCUK_K = ADA_BOY / 20.65;
  const { oyuncu: ada, iskelet: adaI } = cocukOyuncu({ ad: 'ada', resim: 'parti/ada', boy: ADA_BOY, oran: 345 / 622, golge: 24, pozlar: ['normal', 'saskin', 'dilek', 'mutlu', 'alkis', 'dans'] });
  const { oyuncu: can, iskelet: canI } = cocukOyuncu({ ad: 'can', resim: 'parti/can', boy: CAN_BOY, oran: 422 / 558, golge: 28.6, pozlar: ['normal', 'selam', 'saklaniyor', 'saskin', 'alkis', 'dans'] });
  const { oyuncu: elif, iskelet: elifI } = cocukOyuncu({ ad: 'elif', resim: 'parti/elif', boy: ELIF_BOY, oran: 366 / 583, golge: 26, pozlar: ['normal', 'selam', 'saklaniyor', 'saskin', 'alkis', 'dans'] });
  const iskeletler = { ada: adaI, can: canI, elif: elifI };
  ada.koy(38, Z + 3);
  ada.katman = 8;
  can.koy(118, Z + 2);
  can.katman = 9;
  elif.koy(-20, Z + 2);
  elif.katman = 9;
  can.el.classList.add('gizli');
  elif.el.classList.add('gizli');
  sahne.dunya.append(ada.el, can.el, elif.el);
  const oyX = (o: Oyuncu) => Number(o.el.style.getPropertyValue('--x')) || 50;

  // --- mama sandalyesi ve kase: sahne 1'de anne hazırlar (Ege'yi oturtur, mamayı önüne bırakır), sahne 2'de mama
  const SANDALYE = { x: 56, y: Z + 2, w: 24 * EGE_K };
  const sandH = SANDALYE.w * oran('mama-sandalyesi');
  const kaseY = Z + 1 + bY(37 * 0.3 * EGE_K);
  let mamaSeti: { sandalye: HTMLElement; kase: HTMLElement } | null = null;
  const mamaHazirla = () => {
    mamaSeti ??= {
      sandalye: sahne.koy(h('div.eg-esya.eg-geliyor', { 'data-ege': 'sandalye' }, esya('mama-sandalyesi', undefined, 'Mama sandalyesi')), { ...SANDALYE, z: 4 }),
      kase: sahne.koy(h('div.eg-esya.eg-kase.eg-geliyor', { 'data-ege': 'kase' }, esya('kase', undefined, 'Mama kasesi'), h('div.eg-buhar', {}, h('i'), h('i'), h('i'))), { x: 70, y: kaseY, w: 12, z: 11 }),
    };
    return mamaSeti;
  };

  const mino = new Mino();
  // burun kaşıntısı / tutma / hapşu yüzleri (8. sahne) ayrı küçük pakette: şimdiden arka planda yüklensin
  void minoBurunYukle();
  const minoBalon = h('div.eg-balon.eg-mino-balon');
  const minoKutu = sahne.koy(h('div.mc-mino.eg-mino', { 'data-ege': 'mino' }, mino.el, minoBalon), { x: 19, y: Z - 3, w: MINO_W, z: 10 });

  // ================================================================ kamera ve kadraj koruması (banyodaki gibi)
  // Sahne kodu çekimi ister (odak x/y, yakınlık z) ve o çekimde kadrajda kalması gerekenleri (tut) verir. Taşacaksa
  // odak kayar, sığmıyorsa yakınlık düşer. Annenin başı ve Mino kenarda yarım kalmaz: ya tamamen içeride ya dışarıda.
  type Alan = { l: number; r: number; u: number; a: number };
  /** Dünyadaki kutu (% ; u/a üstten). Konumu --x/--y ile verilen öğede hedef konum (yürürken de doğru) */
  const alan = (el: HTMLElement): Alan | null => {
    if (!el.isConnected || el.classList.contains('gizli') || el.classList.contains('gidiyor') || el.classList.contains('eg-cekim-disi') || !el.offsetWidth) return null;
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
  // --- yakın çekim (kukla gösterisi, ninni): kadraja girmeyenler yumuşakça solar (kadraj hesabına da girmez), sahne
  // ışığı odağa düşer (spot: kenarlar loş; yatay ekranda yan bantlar da). Hepsi yalnız opacity / transform.
  const spot = h('div.eg-spot', { 'aria-hidden': 'true' });
  sahne.el.insertBefore(spot, sahne.on);
  const cekimDisi = (els: (HTMLElement | null | undefined)[], disi: boolean) => {
    for (const el of els) {
      if (!el || el.classList.contains('eg-cekim-disi') === disi) continue;
      el.classList.toggle('eg-cekim-disi', disi);
      // geri gelirken de yumuşak (sınıfın geçişi kalkınca birden belirmesin)
      if (!disi) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure(800), easing: 'ease-out' });
    }
  };
  /**
   * Yakın çekim kamerası: alan ekranın ortasına, sığdığı en yakın çekimle (en çok zMax). Kadraj koruması yerine
   * gerçek ekran payıyla: yatay telefonda sahne dar bir bant ama ekranın yanları da odayı gösterir (geniş çizim),
   * yani genişlikte ekranın tamamı kullanılır. Kadrajdakiler zaten solduğundan yarım kalan yok.
   */
  const yakinKam = (k: Alan, zMax: number, ms: number, altaYasla = false) => {
    const yan = kok.querySelector('.mc-yan-genis') ? Math.max(1, innerWidth / W()) : 1;
    const ust = dikey ? PAY.ust : 5;
    const z = Math.max(1, Math.min(zMax, (100 * yan) / (k.r - k.l + PAY.yan * 2), 100 / (k.a - k.u + ust + PAY.alt)));
    const o = (m: number, pay: number) => Math.max(0, Math.min(100, z <= 1.001 ? 50 : (m - 50 / z - pay / 2 / z) / (1 - 1 / z)));
    const x = o((k.l + k.r) / 2, 0);
    // dikeyde üstte alt yazı şeridi: odak biraz aşağı
    // altaYasla: kadrajın altı alanın altına oturur (artan boşluk yukarıda: dikey telefonda alt yazının altı)
    const y = altaYasla && z > 1.001 ? Math.max(0, Math.min(100, (k.a - 100 / z) / (1 - 1 / z))) : o((k.u + k.a) / 2, ust - PAY.alt);
    cekim = { x, y, z, tut: [] };
    sahne.el.dataset.kamera = `${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(2)}`;
    return sahne.kamera(x, y, z, ms);
  };
  /** Son kamera çekiminin görünen dünya aralığı (% ; u/a üstten) */
  const gorunen = (): Alan => {
    const [x, y, z] = (sahne.el.dataset.kamera ?? '50 97 1').split(' ').map(Number);
    const k = 1 - 1 / z;
    return { l: x * k, r: x * k + 100 / z, u: y * k, a: y * k + 100 / z };
  };
  /** Spot ışığı: dünya alanının (yakın çekimden sonraki) ekran yerine; kapanınca solar */
  const spotAc = (k: Alan | null) => {
    if (k) {
      const g = gorunen();
      const z = 100 / (g.r - g.l);
      const sx = ((((k.l + k.r) / 2 - g.l) * z) / 100) * W();
      const sy = ((((k.u + k.a) / 2 - g.u) * z) / 100) * H();
      spot.style.setProperty('--sx', `${sx.toFixed(0)}px`);
      spot.style.setProperty('--sy', `${sy.toFixed(0)}px`);
      spot.style.setProperty('--rx', `${Math.max(140, (((k.r - k.l) * z) / 100) * W() * 0.62).toFixed(0)}px`);
      spot.style.setProperty('--ry', `${Math.max(140, (((k.a - k.u) * z) / 100) * H() * 0.62).toFixed(0)}px`);
    }
    spot.classList.toggle('acik', !!k);
  };
  /** Sahnedeki (görünen) çocuklar */
  const cocuklar = () => [ada, can, elif].map((o) => o.el).filter((el) => !el.classList.contains('gizli') && Math.abs(Number(el.style.getPropertyValue('--x')) - 50) < 55);
  void koltuk;

  // --- ay göstergesi (sahne 8)
  const ay = new AyGosterge();
  sahne.el.append(ay.el);

  const muzik = new S.EgeMuzik();
  /**
   * Ege fonu (assets/muzik/ege-fon.mp3 varsa): bölümün başında ve yatak sahnesinde oyuncak / müzik kutusu
   * müziğinin yerine çalar; sesli görevde ve ninni başlayınca durur. Dosya yoksa eski müzik çalar.
   */
  const fon = new DosyaMuzik(fonDosyasi('ege-fon'), 0.35);
  const muzikSus = () => {
    muzik.durdur();
    fon.durdur();
  };

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
    if (kapandi || ui.kapandiMi()) throw IPTAL;
    ui.yazi(t);
    await konus(t, { ton: 1.12 });
    if (kapandi || ui.kapandiMi()) throw IPTAL;
  };
  const anneSoyle = async (t: string) => {
    if (kapandi || ui.kapandiMi()) throw IPTAL;
    ui.yazi(t);
    anne.classList.add('konusuyor');
    // anne konuşurken yalnız annenin ağzı oynar, Mino'nunki oynamaz (dudak senkronu: konuşanın ağzı)
    mino.agizSus = true;
    anneIsk?.konus(t);
    try {
      await konus(t, { ton: 0.95 });
    } finally {
      anne.classList.remove('konusuyor');
      mino.agizSus = false;
      anneIsk?.konus(null);
    }
    if (kapandi || ui.kapandiMi()) throw IPTAL;
  };
  const efektCal = (f: () => void, ms = 700) => {
    kulak.sustur(ms);
    f();
  };
  const balon = async (el: HTMLElement, yazi: string, ms = 1300) => {
    el.textContent = yazi;
    el.classList.remove('acik');
    void el.offsetWidth;
    el.classList.add('acik');
    await new Promise((r) => setTimeout(r, sure(ms)));
    el.classList.remove('acik');
  };
  /** Yumuşak çıkış: küçülüp solar, sonra kaldırılır (hiçbir şey birden kaybolmaz) */
  const sondur = async (el: Element | null | undefined, ms = 320, son: Keyframe = { opacity: 0, scale: '0.6' }) => {
    if (!el) return;
    await el
      .animate([{ opacity: 1, scale: '1' }, son], { duration: sure(ms), easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' })
      .finished.catch(() => undefined);
    el.remove();
  };
  /** Poz çizimi değişirken minik bir esneme (çizim birden atlamış gibi durmasın) */
  const pozGecis = (el: Element, ms = 420) =>
    el.animate(
      [
        { transformOrigin: '50% 100%', scale: '1.03 0.94', opacity: 0.75 },
        { transformOrigin: '50% 100%', scale: '0.99 1.03', opacity: 1, offset: 0.55 },
        { transformOrigin: '50% 100%', scale: '1 1', opacity: 1 },
      ],
      { duration: sure(ms), easing: 'ease-out' },
    );
  const yazi = (cx: number, cy: number, t: string, renk?: string, buyuk = false) => yansiYazi(sahne.el, cx, cy, t, renk, buyuk);
  /** Mino'nun çizimindeki bir noktanın ekran konumu */
  const minoEkran = ([x, y]: [number, number]): [number, number] => {
    const s = mino.el.querySelector('svg') ?? mino.el;
    const r = s.getBoundingClientRect();
    return [r.left + ((x - MINO_KUTU[0]) / MINO_KUTU[2]) * r.width, r.top + ((y - MINO_KUTU[1]) / MINO_KUTU[3]) * r.height];
  };

  // --- tüy: perde kapanırken düşer, Mino'nun kulağının ucuna konar (Mino fark etmez, çocuk görür); sessizlikte
  // burnuna kayar, kaşıntının sebebi o. Dokunmayı engellemez (pointer-events: none; e2e burnun ortasına basar)
  let tuy: HTMLElement | null = null;
  const tuyYap = () => h('i.eg-tuy', { html: TUY_SVG, 'aria-hidden': 'true' });
  async function tuyDusur() {
    if (tuy) return;
    const el = tuyYap();
    const k = sahne.on.getBoundingClientRect();
    const p = perde.getBoundingClientRect();
    const [x1, y1] = [p.left + p.width * 0.5, p.top + Math.min(p.height, k.bottom - p.top) * 0.55];
    const [x2, y2] = minoEkran(MINO_KULAK[0]);
    sahne.on.append(el);
    tuy = el;
    // sağa sola salınarak süzülür
    const kareler = Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const sal = Math.sin(t * Math.PI * 3) * 36 * (1 - t);
      return { transform: `translate(${x1 + (x2 - x1) * t + sal - k.left}px, ${y1 + (y2 - y1) * t - k.top}px) rotate(${sal * 0.9}deg)` };
    });
    await el.animate(kareler, { duration: sure(3400), easing: 'linear', fill: 'forwards' }).finished.catch(() => undefined);
    el.remove();
    if (tuy !== el) return;
    // kulağın ucuna yapışır: Mino'nun içinde (Mino yürürse onunla gider)
    const [kx, ky] = minoYuzde(MINO_KULAK[0]);
    tuy = h('i.eg-tuy.kulakta', { html: TUY_SVG, 'aria-hidden': 'true', style: `left:${kx}%;top:${ky}%` });
    mino.el.append(tuy);
  }
  /** Tüy Mino'nun kulağından burnuna kayar (kaşıntı başlar) */
  const tuyBurna = () => {
    if (!tuy || !tuy.classList.contains('kulakta')) return;
    const [bx, by] = minoYuzde(MINO_BURUN);
    tuy.classList.add('burunda');
    tuy.style.left = `${bx}%`;
    tuy.style.top = `${by}%`;
  };
  /** hıpşu: tüy yere süzülür; HAPŞU: havaya fırlar */
  const tuyGit = (ucar: boolean) => {
    const el = tuy;
    tuy = null;
    if (!el) return;
    el.classList.remove('kulakta', 'burunda');
    el.animate(
      ucar
        ? [{ translate: '0 0', rotate: '60deg', opacity: 1 }, { translate: '120% -900%', rotate: '400deg', opacity: 0 }]
        : [{ translate: '0 0', rotate: '60deg', opacity: 1 }, { translate: '-60% 300%', rotate: '10deg', opacity: 1, offset: 0.6 }, { translate: '40% 700%', rotate: '-20deg', opacity: 0 }],
      { duration: sure(ucar ? 900 : 2200), easing: ucar ? 'cubic-bezier(.2,.8,.4,1)' : 'ease-in-out', fill: 'forwards' },
    ).onfinish = () => el.remove();
  };

  // --- müzik: genel müziği durdur, bölümün müziği
  muzikDurdur();
  const muzikAc = () => {
    if (fon.var) fon.baslat();
    else if (!TEST_MODU) muzik.baslat();
  };
  const muzikKutu = () => {
    // ninninin kayıttaki notaları (assets/muzik/ninni.json), dört dize
    if (fon.var) fon.baslat();
    else if (!TEST_MODU) muzik.kutu(ninni().map((n) => ({ midi: n.midi, vurus: n.vurus })));
  };
  /** Sesli görev: müzik durur (mikrofon duymasın), bitince önceki müzik devam */
  const sesliGorev = async <T>(f: () => Promise<T>, sonra: 'oyuncak' | 'kutu' | null = 'oyuncak'): Promise<T> => {
    muzikSus();
    // ağlama sesi çalarsa kulak 1.5 sn susar (ege-ses aglama): dinlerken ağlama sessiz, yalnız gözyaşı
    const eskiSessiz = aglamaSessiz;
    aglamaSessiz = true;
    try {
      return await f();
    } finally {
      aglamaSessiz = eskiSessiz;
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
    muzikSus();
    mino.kapat();
    ege.kapat();
    Object.values(iskeletler).forEach((i) => i?.kapat());
    anneIsk?.kapat();
    anneGoz?.kapat();
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
    // sessizken (mama, sesli görevler) ne ses ne "Ingaa" balonu: yalnız gözyaşı (her kaşıkta biri kurur)
    if (aglamaSessiz) return;
    S.aglama(aglama);
    if (Math.random() < 0.5 + aglama * 0.3) void ege.balon(B.ege.ingaa, 900);
  });
  /** Ağlama kademesi (ifadeye dokunmadan): mamada kaşık kaşık azalır, gözyaşı seyrekleşir */
  const aglamaAzalt = (g: number) => {
    aglama = Math.max(0, g);
    ege.aglamaGucu = Math.max(0.35, aglama);
    if (!aglama) ege.durum('normal');
  };
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
    // Tek hedef: anne dinlensin, Ege ne istiyor bulalım (ekip/senaryo/ege-duzeltme.md). İlerlemeyi Ege'nin yüzü
    // gösterir: ağlıyor → aç → surat asıyor → güldü → esniyor → uyuyor
    await sahne1();
    await sahne3();
    await sahne4();
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
    // anne, kanepeye çökmeden Ege'yi mama sandalyesine oturtur ve mamasını önüne bırakır ("biraz soğusun"):
    // sıcak mamayı bir büyük hazırlar, çocuğun üflemesi annenin sözüne bağlanır
    anne.classList.remove('salliyor');
    besikIc.classList.remove('sallaniyor');
    const { sandalye } = mamaHazirla();
    void kam(50, 90, taban, 900, [anne, besik, sandalye]);
    anne.classList.add('yuruyor');
    const anneGit = tasi(anne, SANDALYE.x - bX(15), Z + 9, 900);
    egeBesiktenCikar();
    ege.el.style.zIndex = '6';
    await tasi(ege.el, SANDALYE.x, SANDALYE.y + bY(sandH * 0.36), 900, EGE_W);
    await anneGit;
    anne.classList.remove('yuruyor');
    efektCal(() => S.pop(), 300);
    void balon(anneBalon, B.anne_mama, 2000);
    await bekle(1700);
    // anne esner, kanepeye gider, anında uyuyakalır
    anne.classList.add('esniyor');
    await anneSoyle(E.anne.uzan);
    anne.classList.remove('esniyor');
    await anneUzan();
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
    await sahne1Battaniye();
  }

  /** Anne kanepeye yürür, oturur, dizine yaslanıp uyuyakalır (sahne 1; Ege'yi yatırdıktan sonra yine) */
  async function anneUzan() {
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
  }

  /** Sahne 4: anne uykulu uykulu kalkar, Ege'yi mama sandalyesinden alıp beşiğe yatırır ("Hadi yatağa…"), kanepeye döner */
  async function anneEgeyiYatirir() {
    anneUyuyor = false;
    void kam(52, 94, taban, 900, [anne, besik, ege.el]);
    // kalkar (açık battaniye kanepede kalır; uzanınca yine üstünde)
    anne.classList.remove('uzanik', 'sokuldu');
    annePoz('ayakta');
    anne.style.zIndex = '5';
    anne.style.setProperty('--x', String(KOLTUK.x + bX(KOLTUK.w * 0.2)));
    anne.style.setProperty('--y', String(KOLTUK.y + bY(koltukH * 0.06)));
    anneGov.animate([{ transformOrigin: '50% 100%', scale: '1.03 0.9' }, { transformOrigin: '50% 100%', scale: '1 1' }], { duration: sure(500), easing: 'ease-out' });
    efektCal(() => S.hisirti(), 500);
    anne.classList.add('esniyor');
    await bekle(800);
    anne.classList.remove('esniyor');
    void balon(anneBalon, B.anne_yatak, 1800);
    // sandalyeye yürür, Ege'yi kucağına alır
    anne.classList.add('yuruyor');
    await tasi(anne, SANDALYE.x - bX(11), Z + 7, 1000);
    const [tw, th] = ANNE_TUVAL.ayakta;
    const kucakY = Z + 7 + bY(tw * ANNE_B * (th / tw) * 0.36);
    ege.el.classList.add('kucakta');
    ege.el.style.zIndex = '7';
    await tasi(ege.el, SANDALYE.x - bX(8), kucakY, 450);
    // beşiğe taşır ve içine (yuvaya) yatırır: arka resim ile fistolu ön kenar arasında, başı yastıkta
    const hedefX = BESIK.x - bX(BESIK.w * 0.3);
    void tasi(anne, hedefX, Z + 7, 1300);
    await tasi(ege.el, hedefX + bX(3), kucakY, 1300);
    anne.classList.remove('yuruyor');
    mamaSeti?.sandalye.classList.add('gidiyor');
    await tasi(ege.el, BESIK.x - bX(BESIK.w * 0.08), BESIK.y + bY(besikH * 0.42), 600);
    ege.el.classList.remove('kucakta');
    ege.durum('yatik');
    await egeBesige(true, 600);
    efektCal(() => S.hisirti(), 500);
    // kanepeye geri kıvrılır
    anne.style.zIndex = '4';
    await anneUzan();
    anne.classList.add('sokuldu', 'gulumsuyor');
  }

  /** Sahne 1: battaniyeyi anneye sürükle */
  async function sahne1Battaniye() {
    // (mama sandalyesinin önünde durmasın: sağda, halının üstünde)
    const battaniye = sahne.koy(h('div.eg-esya.eg-geliyor', { 'data-ege': 'battaniye' }, esya('battaniye-anne', undefined, 'Battaniye')), { x: 70, y: Z + 1, w: 17, z: 11 });
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
    await mSoyle(M.ne_istiyor);
  }

  // ================================================================ 2. Ege aç: mama
  async function sahne3() {
    sahne.el.dataset.egSahne = '3';
    const { sandalye, kase } = mamaHazirla();
    // Ege hıçkırır, bir an susar; o sessizlikte karnı guruldar. Kimse gülmez, yalnız Mino şaşırır
    aglamaSessiz = true;
    await bekle(500);
    efektCal(() => S.gurul(), 1300);
    ege.oynat('gurul', 1000);
    ege.ifade('saskin', 1300);
    const [gx, gy] = ege.ekranda(1020, 1400);
    yazi(gx, gy, 'gurrrl', '#c97a2a');
    void ege.balon(B.ege.ooo, 900);
    await bekle(1100);
    mino.tepki('sasir');
    ada.poz('saskin', 1000);
    await mSoyle(M.guruldu);
    // kase ortaya çıkınca ağlama sessizleşir: burnunu çeker, gözü kasede (Am!)
    void ada.git(76, Z + 3, 700);
    aglamaAzalt(0.5);
    ege.bak(1);
    void ege.balon(B.ege.am, 900);
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
          // önlük Ege'nin göğsüne süzülür, takılınca solar (birden kaybolmaz)
          const g = ege.govdeKutusu();
          void ortala(onluk, g, pxB(g.width * 0.6), oran('onluk'), 260).then(async () => {
            ege.onluk = true;
            await sondur(onluk, 220, { opacity: 0, scale: '1.1 0.8' });
          });
          setTimeout(coz, sure(320));
          return true;
        },
        govde,
      );
      return () => bitir(s, ip);
    });
    durumYaz(null);
    efektCal(() => S.pop(), 300);
    await bekle(250);
    // önlüğüne bakar, pıt pıt vurur (gülmez; kahkaha kuklalara saklı), göğsünde minik yıldızlar; Mino beğenir
    const [ox, oy] = merkez(ege.el);
    parca.parilti(ox, oy, 6, 'yildiz');
    ege.ifade('saskin', 900);
    ege.oynat('vur', 800);
    mino.tepki('evet');
    await mSoyle(M.yakisti);
    ege.ifade('bakiyor', 600);
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
      // her kaşıkta bir gözyaşı kurur
      aglamaAzalt(0.5 * (1 - (n + 1) / ayar.kasik));
    }
    ui.ilerleme(ayar.kasik, ayar.kasik);
    ui.ipucu(null);
    buharT();
    kasik.classList.add('gidiyor');
    kase.classList.add('gidiyor');

    // --- peçeteyle sil
    ege.ifade('bakiyor');
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
    ege.onluk = false;
    setTimeout(() => ege.el.classList.remove('parlak'), sure(1500));
    ui.ipucu(null);
    // doydu, susuyor ama surat asıyor: sepete uzanır "Ba! Ba!"
    aglat(0);
    aglamaSessiz = false;
    await bekle(500);
    ege.ifade('buzuk');
    ege.bak(-1);
    ege.oynat('cirp', 900);
    void ege.balon(B.ege.baba, 1400);
    await bekle(1200);

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
          if (!TEST_MODU) setTimeout(() => coz(false), 25000); // takılırsa kendiliğinden geçer
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
      ege.ifade('bakiyor', 800);
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
      efektCal(() => S.kikir(0.4), 1300);
      // Ege gülmez (mama boyunca): şaşkın bakar
      ege.ifade('saskin', 1100);
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

  // ================================================================ 3. Ege sıkılmış: sepet ve kuklalar
  /**
   * Karnı tok ama huysuz; sepete uzanıyor, çünkü oyun istiyor. Can ile Elif gelir. Çocuk oyuncakları sepetten
   * çıkarıp Ege'ye gösterir: küp, top, kitap "Hıh!", ördek "Vık!" / "Ooo?" (yine surat). En altta iki kukla:
   * Ege'nin gözleri parlar. Kuklalar sepetten Ada'nın ve Can'ın eline sürüklenir.
   */
  async function sepetteAra(): Promise<{ ayiK: Kukla; civK: Kukla; ayi: HTMLElement; civciv: HTMLElement; kaldir: () => void }> {
    // Can ile Elif birlikte gelir (sağdan); Ada sepetin arkasına geçer
    can.el.classList.remove('gizli');
    elif.el.classList.remove('gizli');
    elif.koy(124, Z + 4);
    elif.katman = 7;
    ada.katman = 8;
    void ada.git(24, Z + 6, 1100);
    void can.git(74, Z + 2, 1200);
    await elif.git(89, Z + 4, 1400);
    can.poz('selam', 900);
    void can.balon(B.can.merhaba, 900);
    // Elif'in balonu Can'ınkinin üstüne binmesin
    await bekle(950);
    elif.poz('selam', 900);
    void elif.balon(B.elif.benim, 1100);
    ege.bak(-1);
    ege.ifade('buzuk');
    void ege.balon(B.ege.baba, 1000);
    await bekle(700);

    // --- oyuncak sepeti: sola, mama sandalyesinin önünü kapatmadan (Mino'nun sağında). Ada arkasında durur.
    // Katmanlar: arka resim (iç duvar, sap) → kuklalar (en altta) → oyuncaklar → ön hasır kenar (sepet-on.webp).
    // Aynı z'de DOM sırası belirler.
    const SEPET = { x: 36, y: Z + 1, w: 16 };
    const SEPET_Z = 12;
    const sepetH = SEPET.w * oran('sepet');
    /** sepetin içinde yükseklik (çizimin altından oran; ön kenarın üst çizgisi ~%50) */
    const icY = (o: number) => SEPET.y + bY(sepetH * o);
    const sepet = sahne.koy(h('div.eg-esya.eg-sepet.eg-geliyor', { 'data-ege': 'sepet' }, esya('sepet', undefined, 'Oyuncak sepeti')), { ...SEPET, z: SEPET_Z });
    const ayiK = new Kukla('ayi');
    const civK = new Kukla('civciv');
    const ayi = sahne.koy(ayiK.el, { x: SEPET.x - 2.5, y: icY(0.12), w: 8, z: SEPET_Z });
    const civciv = sahne.koy(civK.el, { x: SEPET.x + 3, y: icY(0.14), w: 6.5, z: SEPET_Z });
    ayi.dataset.ege = 'kukla-ayi';
    civciv.dataset.ege = 'kukla-civciv';
    const oyuncaklar: [string, HTMLElement][] = [
      ['kup', sahne.koy(h('div.eg-esya.eg-oyuncak', { 'data-ege': 'kup' }, esya('kup', undefined, 'Küp')), { x: SEPET.x - 4, y: icY(0.36), w: 6, z: SEPET_Z })],
      ['kitap', sahne.koy(h('div.eg-esya.eg-oyuncak', { 'data-ege': 'kitap' }, esya('kitap', undefined, 'Kitap')), { x: SEPET.x + 4.5, y: icY(0.38), w: 7.5, z: SEPET_Z })],
      ['top', sahne.koy(h('div.eg-esya.eg-oyuncak', { 'data-ege': 'top' }, esya('top', 'banyo/top', 'Top')), { x: SEPET.x + 1.5, y: icY(0.4), w: 6, z: SEPET_Z })],
      ['ordek', sahne.koy(h('div.eg-esya.eg-oyuncak', { 'data-ege': 'ordek' }, esya('ordek', 'banyo/ordek', 'Lastik ördek')), { x: SEPET.x - 2, y: icY(0.43), w: 6, z: SEPET_Z })],
    ];
    const sepetOnUrl = egeAdres('sepet-on');
    const sepetOn = sepetOnUrl ? sahne.koy(h('div.eg-esya.eg-sepet.eg-sepet-on.eg-geliyor', {}, h('img.mc-resim.eg-resim', { src: sepetOnUrl, alt: '', draggable: 'false' })), { ...SEPET, z: SEPET_Z }) : null;
    // gösterilen oyuncak Ege'nin önünde bir an durur, sonra sepetin yanına, halıya iner
    const GOSTER = { x: SANDALYE.x - bX(9), y: SANDALYE.y + bY(sandH * 0.3) };
    const KENAR: [number, number][] = [[SEPET.x - 11, Z - 1], [SEPET.x + 11, Z - 1], [SEPET.x - 5, Z - 2.5], [SEPET.x + 6, Z - 2.5]];
    void kam(46, 96, taban, 800, [sepet, ege.el, minoKutu, ...cocuklar()]);
    await mSoyle(M.sikilmis);
    ui.ipucu(I.sepet);
    durumYaz('sepet');
    const dur = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));
    await gorev<void>((coz) => {
      let kalan = oyuncaklar.length;
      const ip = ipucu(() => (oyuncaklar.find(([, el]) => !el.dataset.cikti)?.[1] ?? ayi).getBoundingClientRect());
      const ss = oyuncaklar.map(([ad, el], i) => {
        const s = surukle(el, [], () => {
          // dokunmak da sürüklemek de oyuncağı sepetten çıkarır; Ege'ye gösterilir
          if (el.dataset.cikti) return true;
          el.dataset.cikti = '1';
          bitir(s);
          ip.ilerle();
          if (ad === 'ordek') S.vik();
          else S.oyuncak(ad);
          const [x, y] = KENAR[i];
          const x0 = Number(el.style.getPropertyValue('--x'));
          const cekildi = (el.style.translate || '0px 0px').split(' ').some((v) => Math.abs(parseFloat(v)) > 25);
          void (async () => {
            if (!cekildi) await tasi(el, x0, icY(0.72), 200);
            el.style.zIndex = '13';
            await tasi(el, GOSTER.x + (i % 2 ? 2 : -2), GOSTER.y, 420);
            // Ege'nin tepkisi: istemez ("Hıh!", başını çevirir); ördek öter, "Ooo?" der ama yine surat asar
            if (ad === 'ordek') {
              const [ox, oy] = merkez(el);
              yazi(ox, oy - 30, B.vik, '#e8a722');
              ege.bak(-0.5);
              ege.ifade('saskin', 800);
              void ege.balon(B.ege.ooo, 800);
              await dur(900);
              ege.ifade('buzuk');
            } else {
              ege.bak(1);
              ege.ifade('buzuk');
              ege.oynat('hayir', 600);
              void ege.balon(B.ege.hih, 700);
              await dur(700);
            }
            ege.bak(0);
            await tasi(el, x, y, 420);
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
    durumYaz(null);
    ui.ipucu(null);
    await bekle(1300);
    // en altta iki kukla: yukarı çıkar, parlar; Ege'nin gözleri parlar
    efektCal(() => S.pop(), 300);
    // (ayrık dururlar: biri ötekinin tutma alanına binmesin)
    await Promise.all([tasi(ayi, SEPET.x - 5, icY(0.62), 450, 9.5), tasi(civciv, SEPET.x + 5.5, icY(0.64), 450, 7.5)]);
    ayi.classList.add('parliyor');
    civciv.classList.add('parliyor');
    ege.bak(-1);
    ege.ifade('saskin', 1600);
    void ege.balon(B.ege.ooo, 1000);
    const [gx, gy] = ege.basUstu();
    parca.parilti(gx, gy + 20, 8, 'yildiz');
    void ada.balon(B.ada.kukla, 1400);
    // gösterilen oyuncaklar halıdan toplanır (kuklalar sepette kalır)
    oyuncaklar.forEach(([, o]) => o.classList.add('gidiyor'));
    await bekle(900);
    ayi.classList.remove('parliyor');
    civciv.classList.remove('parliyor');
    return {
      ayiK,
      civK,
      ayi,
      civciv,
      kaldir: () => {
        for (const el of [sepet, sepetOn, ...oyuncaklar.map(([, o]) => o)]) el?.classList.add('gidiyor');
      },
    };
  }

  async function sahne4() {
    sahne.el.dataset.egSahne = '4';
    const { ayiK, civK, ayi, civciv, kaldir } = await sepetteAra();
    // kuklaları alacak Ada ve Can kadrajda
    void kam(48, 96, taban * 1.06, 800, [ada.el, can.el, ege.el, ayi, civciv]);
    await mSoyle(M.kukla);
    ui.ipucu(I.kukla);
    durumYaz('kukla-tak');
    // ayı Ada'ya (kocaman), civciv Can'a (minicik); ellerinin hizasında
    const elde = (o: Oyuncu, w: number, sag: boolean, oranBoy: number): [number, number, number] => [oyX(o) + (sag ? 1 : -1) * bX(w * 0.62), Z + bY(oranBoy * 0.2), w];
    const AYI_YER = () => elde(ada, 12 * COCUK_K, true, ADA_BOY * (622 / 345));
    const CIV_YER = () => elde(can, 9 * COCUK_K, false, CAN_BOY * (558 / 422));
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

    // --- kukla gösterisi: yakın çekim. Kamera Ege'ye yaklaşır; ayı solunda, civciv sağında, alttan kadraja girer
    // (el kuklası: kolu kadrajın altında kalır). Ada, Can, Elif, Mino, anne ve sepet kadrajdan solar; spot Ege'de.
    const kuklaIc = (k: Kukla) => k.el.querySelector<HTMLElement>('.eg-kukla-ic')!;
    /** Konuşma: hazırlık (ezilir) → zıplar, başını Ege'ye eğer (uzar) → ördek iki kez "vak", ayı iki kez başını sallar */
    const kuklaKonus = (k: Kukla) => {
      const ayiMi = k.ad === 'ayi';
      // Ege ayının sağında, civcivin solunda: baş ona doğru eğilir
      const e = ayiMi ? 1 : -1;
      const ms = ayiMi ? 1150 : 900;
      const kf: Keyframe[] = ayiMi
        ? [
            { transform: 'none' },
            { transform: 'translateY(3%) scale(1.07, 0.92)', offset: 0.1 },
            { transform: `translateY(-13%) scale(0.95, 1.07) rotate(${5 * e}deg)`, offset: 0.27 },
            { transform: `translateY(-5%) scale(1.05, 0.94) rotate(${8 * e}deg)`, offset: 0.42 },
            { transform: `translateY(-11%) scale(0.97, 1.04) rotate(${4 * e}deg)`, offset: 0.56 },
            { transform: `translateY(-4%) scale(1.05, 0.94) rotate(${7 * e}deg)`, offset: 0.7 },
            { transform: 'translateY(1.5%) scale(1.03, 0.97) rotate(0deg)', offset: 0.86 },
            { transform: 'none' },
          ]
        : [
            { transform: 'none' },
            { transform: 'translateY(4%) scale(1.09, 0.9)', offset: 0.12 },
            { transform: `translateY(-17%) scale(0.92, 1.1) rotate(${9 * e}deg)`, offset: 0.3 },
            { transform: `translateY(-9%) scale(1.04, 0.97) rotate(${-4 * e}deg)`, offset: 0.46 },
            { transform: `translateY(-14%) scale(0.95, 1.06) rotate(${7 * e}deg)`, offset: 0.62 },
            { transform: 'translateY(2.5%) scale(1.07, 0.93) rotate(0deg)', offset: 0.82 },
            { transform: 'none' },
          ];
      kuklaIc(k).animate(kf, { duration: sure(ms), easing: 'ease-in-out', composite: 'add' });
      // ağız / gaga: ördek hızlı iki "vak", ayı yavaş ve kocaman
      const bas = performance.now();
      const kapa = tik(() => {
        const t = (performance.now() - bas) / Math.max(1, sure(ms));
        const a = t < 0.2 || t > 0.9 ? 0 : Math.abs(Math.sin(((t - 0.2) / 0.7) * Math.PI * 2));
        k.ac(a);
        if (t >= 1) {
          k.ac(0);
          kapa();
        }
      });
    };
    /** Omuz silkme (orta ses: anlamadık) */
    const kuklaOmuz = (k: Kukla) =>
      kuklaIc(k).animate(
        [{ transform: 'none' }, { transform: 'translateY(-5%) scale(1.06, 0.95) rotate(4deg)', offset: 0.3 }, { transform: 'translateY(-5%) scale(1.06, 0.95) rotate(-3deg)', offset: 0.6 }, { transform: 'none' }],
        { duration: sure(800), easing: 'ease-in-out', composite: 'add' },
      );
    /** Ege güler: yüzü aydınlanır (arkasında sıcak ışık), zıplar, el çırpar, kıkırdar; kahkahada kocaman */
    const egeGul = (g: 'kikir' | 'kahkaha', isik: HTMLElement, buyuk = false) => {
      const ms = g === 'kahkaha' ? 1500 : 1100;
      ege.ifade(g, ms + 500);
      ege.oynat(g, ms);
      setTimeout(() => {
        if (!kapandi) ege.oynat('cirp', buyuk ? 900 : 650);
      }, sure(ms * 0.75));
      efektCal(() => S.kikir(g === 'kahkaha' ? 1 : 0.5), 1500);
      void ege.balon(B.ege.hihi, 900);
      isik.animate(
        [
          { opacity: 0, transform: 'translate(-50%, 50%) scale(0.7)' },
          { opacity: buyuk ? 1 : 0.85, transform: 'translate(-50%, 50%) scale(1.08)', offset: 0.3 },
          { opacity: buyuk ? 0.9 : 0.6, transform: 'translate(-50%, 50%) scale(1)', offset: 0.7 },
          { opacity: 0, transform: 'translate(-50%, 50%) scale(0.95)' },
        ],
        { duration: sure(ms + 700), easing: 'ease-out' },
      );
      const [gx, gy] = ege.basUstu();
      parca.parilti(gx, gy + 30, buyuk ? 10 : 6, 'yildiz');
    };
    const kuklaGosterisi = async () => {
      const e = alan(ege.el)!;
      const eh = e.a - e.u;
      // kuklalar Ege'den biraz küçük (çocuğun eline göre büyük: yakın çekim)
      const AYI_W = EGE_W * (dikey ? 1.06 : 0.86);
      const CIV_W = EGE_W * (dikey ? 1.0 : 0.8);
      // kuklalar alttan yükselir: tepeleri Ege'nin yanağı hizasında; kadrajın altı kuklaların bileğini keser
      // (el kuklası: kol görünmez)
      const ayUst = e.u + eh * (dikey ? 0.26 : 0.3);
      const cvUst = e.u + eh * (dikey ? 0.3 : 0.36);
      const ayY = 100 - (ayUst + bY(AYI_W * (1005 / 858)));
      const cvY = 100 - (cvUst + bY(CIV_W * (1014 / 837)));
      const ayX = e.l - bX(AYI_W) * (dikey ? 0.05 : 0.3);
      const cvX = e.r + bX(CIV_W) * (dikey ? 0.07 : 0.32);
      // kadraj: Ege başından kuklaların bileğine, iki yanda kuklalar
      const odak: Alan = { l: ayX - bX(AYI_W) * 0.5, r: cvX + bX(CIV_W) * 0.5, u: e.u - eh * 0.06, a: Math.min(100 - ayY, 100 - cvY) - bY(AYI_W) * 0.14 };
      // kadraj dışına çıkanlar solar (Ege ve sandalyesi kalır; beşik de civcivin arkasında kalabalık etmesin)
      cekimDisi([ada.el, can.el, elif.el, minoKutu, anne, besik], true);
      kaldir();
      const kamBitti = yakinKam(odak, dikey ? 2.4 : 2.8, 1400, true);
      spotAc({ ...odak, u: odak.u - (odak.a - odak.u) * 0.12 });
      for (const el of [ayi, civciv]) {
        el.style.zIndex = '13';
        el.classList.add('sahnede');
      }
      // Ege'nin ardında sıcak ışık (gülünce yanar)
      const isik = sahne.koy(h('i.eg-gul-isik', { 'aria-hidden': 'true' }), { x: (e.l + e.r) / 2, y: 100 - e.u - eh * 0.42, w: EGE_W * 1.5, z: 4 });
      await Promise.all([kamBitti, tasi(ayi, ayX, ayY, 1250, AYI_W), (async () => {
        await bekle(160);
        await tasi(civciv, cvX, cvY, 1150, CIV_W);
      })()]);
      ege.bak(-1);
      void balon(ayiK.balonEl, B.kukla_hi, 900);
      kuklaKonus(ayiK);
      await bekle(500);
      ege.bak(1);
      kuklaKonus(civK);
      await bekle(700);
      ege.bak(0);
      return {
        isik,
        bitir: () => {
          spotAc(null);
          cekimDisi([ada.el, can.el, elif.el, minoKutu, anne, besik], false);
          for (const el of [ayi, civciv]) el.classList.remove('sahnede');
          isik.remove();
          const [ax, ay, aw] = AYI_YER();
          const [cx, cy, cw] = CIV_YER();
          void tasi(ayi, ax, ay, 1000, aw);
          void tasi(civciv, cx, cy, 1000, cw);
        },
      };
    };
    const gosteri = await kuklaGosterisi();

    // --- kukla konuşturma
    let referans: number | null = null;
    let gulmeSay = 0;
    /** Kukla konuşur (zıplar, başını Ege'ye eğer, ezilip uzar, ağzı açılıp kapanır); Ege ona bakar ve güler */
    const konustur = async (hangi: 'civciv' | 'ayi', inceFark = 3, sesli = false) => {
      void sesli;
      const k = hangi === 'civciv' ? civK : ayiK;
      kuklaKonus(k);
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
      egeGul(g, gosteri.isik);
      await bekle(1500);
      ege.bak(0);
      ege.ifade('bakiyor');
    };
    const omuzSilk = async () => {
      for (const k of [ayiK, civK]) {
        kuklaOmuz(k);
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
          if (!TEST_MODU) setTimeout(() => coz(null), 20000); // takılırsa kendiliğinden geçer
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
        if (!TEST_MODU) setTimeout(() => coz({ kim: istenen ?? 'civciv', fark: (istenen ?? 'civciv') === 'civciv' ? 4 : -4, sesli: false }), 25000); // takılırsa kendiliğinden geçer
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
    // final: iki kukla birlikte zıplar, Ege kahkahayla alkışlar (hâlâ yakın çekim)
    kuklaKonus(ayiK);
    setTimeout(() => kuklaKonus(civK), sure(180));
    egeGul('kahkaha', gosteri.isik, true);
    const [hx, hy] = ege.basUstu();
    parca.yuksel(hx, hy, 'kalp', 5, 40);
    await mSoyle(M.guldu);
    // gösteri biter: kamera geri çekilir, kuklalar Ada ile Can'ın eline döner, herkes sahneye gelir.
    // şaka: en büyük kahkahada anne kanepede kıpırdar. Herkes donar, "Şşş!", kıkır kıkır ("şşş" motifi burada ekilir)
    gosteri.bitir();
    ada.poz('alkis', 1400);
    void ada.zipla(14);
    void can.zipla(14);
    await kam(40, 94, taban, 1100, [anne, ada.el, ege.el, minoKutu]);
    anneGov.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-2.5deg) scale(1.02)' }, { transform: 'rotate(1deg)' }, { transform: 'rotate(0)' }], { duration: sure(900) });
    efektCal(() => S.hisirti(), 500);
    void balon(anneBalon, B.anne_uykuda, 1700);
    for (const o of [ada, can, elif]) o.poz('saskin', 1400);
    mino.tepki('sasir');
    ege.ifade('saskin', 1400);
    await bekle(1500);
    void ada.balon(B.ada.sss, 1000);
    await bekle(900);
    for (const o of [can, elif]) void o.balon(B.hihi, 900);
    ege.ifade('kikir', 900);
    await bekle(1100);
    // kuklalar ve sepet kenara
    for (const el of [ayi, civciv]) el.classList.add('gidiyor');
    adaI?.kukla(null);
    canI?.kukla(null);
    kaldir();
  }

  // ================================================================ 4. Ege yoruldu: yatak hazırlığı
  async function sahne6() {
    sahne.el.dataset.egSahne = '6';
    muzikSus();
    // yatak sahnesi: Ege fonu (dosya varsa)
    fon.baslat();
    // çok güldü, yoruldu: kocaman bir esneme, gözünü ovuşturur
    ege.ifade('esniyor', 1600);
    ege.oynat('esne', 1600);
    void ege.balon('Aaahh…', 1200);
    await bekle(900);
    await mSoyle(M.yoruldu);
    await mSoyle(M.esnedi);
    // akşam iner: ışık biraz kararır, gece perdesi görünür (kenarlarda toplu)
    sahne.el.classList.add('aksamustu');
    perde.classList.add('gorunur');
    // bebeği çocuklar taşımaz: anne uykulu uykulu kalkar, Ege'yi sandalyeden alıp beşiğe yatırır, kanepeye döner
    void elif.git(40, Z + 1, 900);
    void can.git(84, Z + 2, 900);
    void ada.git(30, Z + 3, 900);
    await anneEgeyiYatirir();
    ege.el.dataset.uykulu = '1';
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
          // emzik ağza süzülür, küçülerek oturur (birden kaybolmaz)
          void ortala(emzik, ege.agizKutusu(), 4, oran('emzik'), 200).then(() => sondur(emzik, 180, { opacity: 0, scale: '0.5' }));
          setTimeout(() => {
            if (!kapandi) ege.emzik = true;
          }, sure(240));
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
        // Ege tavanda beliren yıldızlara hayran hayran bakar
        setTimeout(() => {
          if (kapandi) return;
          ege.ifade('saskin', 1300);
          void ege.balon(B.ege.ooo, 1000);
        }, sure(450));
      };
      lamba.addEventListener('pointerdown', lambaDokun);
      // perde: yana sürükle (kanatlar kapanır)
      // perde kapanınca tüy düşer (serbest sıradaki işleri bekletmez)
      const perdeBitir = perdeSurukle(() => {
        isBitti('perde', perde);
        void tuyDusur();
      });
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

  // ================================================================ 5. Ninni
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
    void can.git(sol - bX(10), Z + 5, 900);
    void ada.git(sol - bX(22), Z + 5.5, 900);
    void elif.git(sol - bX(34), Z + 5, 900);
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
    muzikSus();
    await bekle(900);
    // kamera geri çekilir; bulaşıcı esneme: Mino da kocaman esner
    await ninniBitir();
    mino.tepki('esne', 1.4);
    void balon(minoBalon, B.esne, 1400);
    await bekle(1300);
  }

  /**
   * Ninni (yalnız ritim; hece paneli yok): yakın çekimde beşik ve üstünde yıldız kemeri. Önce ninninin kaydı
   * (Gemini, sözlü) bir kez çalar; her notada beşik sallanır, kemerdeki yıldızlar sırayla atar (dinle). Sonra çocuk
   * her vuruşta kısık sesle "laaa" der ya da beşiği sallar (her yön değişimi bir vuruş): ton aranmaz, vuruşta ses
   * çıkması yeter. Tutan her vuruş bir yıldızı yakar. Oyun kayıttaki notalara göre ilerler (assets/muzik/ninni.json).
   * Yüksek seste Ege bir gözünü açar, "Şşş, daha kısık!" (cezasız). Sıra kuralı: kayıt çalarken mikrofon dinlemez;
   * çocuk söylerken altyapı çalmaz (oyunun sesi mikrofona karışmasın, ekip/SES-SISTEMI.md).
   */
  async function ninniGorevi(dize: number, dinlet: boolean): Promise<void> {
    // ninni başlayınca fon ve müzik kutusu susar
    muzikSus();
    const notalar = ninni(dize);
    const tum = dinlet ? ninni(NINNI_DIZE) : notalar;
    const yildizlar = new NinniYildizlari(notalar.length);
    await ninniYakin();
    yildizlar.yerles(besik.getBoundingClientRect(), sahne.el.getBoundingClientRect());
    sahne.el.append(yildizlar.el);
    let yon = 1;
    const besikSalla = (guc = 1) => {
      yon = -yon;
      besikIc.animate([{ rotate: `${-yon * 3 * guc}deg` }, { rotate: `${yon * 4 * guc}deg` }, { rotate: `${yon * 1 * guc}deg` }], { duration: sure(700), easing: 'ease-in-out', fill: 'forwards' });
    };
    try {
      // --- dinle: ninninin kaydı (bütün dizeler); her notada sıradaki yıldız atar
      if (dinlet) {
        muzikSus();
        await mSoyle(M.dinle);
        ui.ipucu(I.ninni_dinle);
        await ninniDinlet(tum, (i) => yildizlar.simdi(i % notalar.length), besikSalla);
        yildizlar.simdi(-1);
      }
      // --- sen söyle / salla
      await mSoyle(M.sen);
      ui.ipucu(mik() ? I.ninni_soyle : I.ninni_salla);
      durumYaz('ninni');
      let yanlis = 0;
      for (;;) {
        const iyi = await sesliGorev(() => (mik() ? ninniSoyle(notalar, yildizlar, besikSalla) : ninniSalla(notalar, yildizlar, besikSalla)), null);
        if (iyi >= notalar.length * NINNI_GECER || kabulMu(yas, yanlis)) break;
        yanlis++;
        yildizlar.sifirla();
        await mSoyle(M.bir_daha);
      }
      durumYaz(null);
      ui.ipucu(null);
      yildizlar.simdi(-1);
      // bütün yıldızlar bir kez parlar
      yildizlar.el.classList.add('bitti');
      await bekle(900);
    } finally {
      yildizlar.el.classList.add('gidiyor');
      setTimeout(() => yildizlar.el.remove(), sure(900));
    }
  }

  /** Ninni yakın çekimi: beşik ve üstündeki yıldız kemeri; çocuklar, Mino ve anne kadrajdan solar */
  async function ninniYakin() {
    cekimDisi([ada.el, can.el, elif.el, minoKutu, anne], true);
    const b = alan(besik);
    if (!b) return;
    const bh = b.a - b.u;
    const odak: Alan = { l: b.l - (b.r - b.l) * 0.04, r: b.r + (b.r - b.l) * 0.04, u: b.u - bh * 0.62, a: b.a + bh * 0.02 };
    const bitti = yakinKam(odak, dikey ? 2.4 : 2.8, 1400);
    spotAc(odak);
    await bitti;
  }
  /** Ninniden sonra: kamera geri çekilir, herkes sahneye döner */
  function ninniBitir(ms = 1100) {
    spotAc(null);
    cekimDisi([ada.el, can.el, elif.el, minoKutu, anne], false);
    return kam(dikey ? 72 : 66, 94, dikey ? 1.6 : 1.3, ms, [besik]);
  }

  /**
   * Ninninin sözlü kaydını çalar; her nota kaydın zamanıyla (basMs) vurur (vurus), beşik hafifçe sallanır.
   * Kayıt çalarken mikrofon dinlemez (kulak.sustur). Kayıt açılamazsa (ya da testte) aynı notalar müzik kutusuyla.
   */
  function ninniDinlet(notalar: Nota[], vurus: (i: number) => void, besikSalla: (g?: number) => void): Promise<void> {
    const kutuyla = async () => {
      for (const [i, n] of notalar.entries()) {
        vurus(i);
        const ms = n.sureMs ?? NINNI_VURUS * 1000;
        efektCal(() => S.kutuNota(n.midi, 0.12, (ms / 1000) * 1.6), ms);
        besikSalla(0.6);
        await bekle(ms + (notalar[i + 1] && notalar[i + 1].satir !== n.satir ? ninniSatirArasiMs(n.satir) : 0));
      }
    };
    if (TEST_MODU) return kutuyla();
    const bitis = ninniSonuMs(Math.max(...notalar.map((n) => n.satir)) + 1);
    const ses = new Audio(NINNI_SESI);
    sarkiSesiAyarla(ses);
    kulak.sustur(bitis + 800);
    return ses.play().then(
      () =>
        gorev<void>((coz) => {
          let simdi = -1;
          const dur = tik(() => {
            const t = ses.currentTime * 1000;
            // kayıt geç başlasa da sonuna kadar mikrofon dinlemez
            kulak.sustur(Math.max(0, bitis - t) + 800);
            let k = -1;
            notalar.forEach((n, j) => {
              if (t >= (n.basMs ?? 0)) k = j;
            });
            if (k >= 0 && k !== simdi) {
              vurus((simdi = k));
              besikSalla(0.6);
            }
            if (t >= bitis + 250 || ses.ended) coz();
          });
          return () => {
            dur();
            ses.pause();
          };
        }),
      () => kutuyla(),
    );
  }

  /** Mikrofonla ritim: her vuruşta ses çıkması yeter (ton aranmaz; dokunma: beşiği sallamak o vuruşu sayar). Dönüş: tutan vuruş */
  async function ninniSoyle(notalar: Nota[], yildizlar: NinniYildizlari, besikSalla: (g?: number) => void): Promise<number> {
    // çocuk kayıttan yavaş söyler
    const YAVAS = ninniYavas(yas);
    let iyi = 0;
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
      if (o.perde !== null && sesVar(o, kulak.ayar, 10)) perdeler.push(o.perde);
      // yüksek ses: Ege bir gözünü açar
      if (sv.yuksekSure > 0.3 && performance.now() - kisikUyari > 3500) {
        kisikUyari = performance.now();
        ege.ifade('tek-goz', 1400);
        const [x, y] = ege.basUstu();
        yazi(x, y - 10, M.kisik);
      }
    });
    try {
      for (const [i, n] of notalar.entries()) {
        simdiki = n;
        perdeler = [];
        sesliKare = 0;
        kareSay = 0;
        sallandi = false;
        yildizlar.simdi(i);
        await bekle((n.sureMs ?? NINNI_VURUS * 1000) * YAVAS);
        const oran2 = kareSay ? sesliKare / kareSay : 0;
        const r = sallandi ? 'dogru' : notaDegerlendir({ perdeler, sesli: oran2, midi: n.midi, referans: null, tolerans: 3, yalnizSes: true, refMidi: NINNI_REF_MIDI });
        if (r === 'dogru' || r === 'ses') {
          iyi++;
          yildizlar.yak(i);
          S.yildiz(i);
          besikSalla(0.8);
        }
        if (notalar[i + 1] && notalar[i + 1].satir !== n.satir) {
          simdiki = null;
          yildizlar.simdi(-1);
          await bekle(Math.max(700, ninniSatirArasiMs(n.satir) * YAVAS));
        }
      }
    } finally {
      simdiki = null;
      kulak.dinle(null);
      surBitir();
    }
    return iyi;
  }

  /** Mikrofonsuz: beşiği sağa-sola sallamak; her salınım bir vuruş (müzik kutusu çalar, yıldız yanar) */
  function ninniSalla(notalar: Nota[], yildizlar: NinniYildizlari, besikSalla: (g?: number) => void): Promise<number> {
    return gorev<number>((coz) => {
      let i = 0;
      yildizlar.simdi(0);
      const sal = new Salinim();
      const ip = new Ipucu(() => salIpucu(), TEST_MODU ? 400 : IPUCU_SURE * 1000);
      acikIpucu.add(ip);
      const surBitir = besikSuruklenir(sal, () => {
        const n = notalar[i];
        if (!n) return;
        ip.ilerle();
        efektCal(() => S.kutuNota(n.midi, 0.13, 1.1), 500);
        yildizlar.yak(i);
        besikSalla(1);
        i++;
        if (i >= notalar.length) coz(notalar.length);
        else yildizlar.simdi(i);
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

  // ================================================================ 6. Şşş! Tüy ve Mino'nun burnu
  async function sahne8() {
    sahne.el.dataset.egSahne = '8';
    muzikSus();
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
      tuyGit(false);
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
      setTimeout(() => tuyGit(true), sure(600));
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
      // kısa ninni de yakın çekimdir: herkes sahneye dönmezse final boyunca anne ve çocuklar görünmez kalır
      await ninniBitir();
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
      if (!TEST_MODU) setTimeout(() => coz(), 25000); // takılırsa kendiliğinden geçer
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
    // Mino yerine oturunca kulağındaki tüy burnuna kayar: kaşıntının sebebi
    setTimeout(tuyBurna, sure(650));
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
      void sondur(parla, 260);
      void sondur(halka, 260);
      minoKutu.classList.remove('kasiniyor');
      // tutabildiyse yüzü hıpşuya kadar "tutuyor"da kalır; sahne 8 hapşu yüzüne geçirir
      minoSerbest = true;
      setTimeout(() => {
        minoKutu.style.zIndex = minoZ;
        void tasi(minoKutu, minoYer.x, minoYer.y, 700);
      }, sure(1600));
    }
  }

  // ================================================================ 7. İyi geceler
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
    pozGecis(anneGov, 480);
    if (anneResim === 'sariliyor') {
      // çocuklar kanepeye koşar, anne kollarını açıp hepsine sarılır (anne kanepede oturur)
      const yer = anneOturYer('sariliyor');
      anne.style.setProperty('--x', String(yer.x));
      anne.style.setProperty('--y', String(yer.y));
      const gel = [ada.git(KOLTUK.x - bX(11 * COCUK_K), Z + 3, 900), elif.git(KOLTUK.x + bX(4 * COCUK_K), Z + 1, 900), can.git(KOLTUK.x + bX(19 * COCUK_K), Z + 2, 900)];
      // Mino yer açar: Can'ın yanına geçer (çocukların arkasında kalmasın)
      void tasi(minoKutu, Math.min(86, KOLTUK.x + bX(19 * COCUK_K + 17)), Z - 3, 900);
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
    if (anneResim === 'sariliyor') await tasi(minoKutu, KOLTUK.x - bX(KOLTUK.w * 0.36), KOLTUK.y + bY(koltukH * 0.42), 900, 15 * (MINO_W / 24));
    else await tasi(minoKutu, KOLTUK.x - 6, KOLTUK.y + bY(8), 900, 20 * (MINO_W / 24));
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
      if (!TEST_MODU) setTimeout(() => coz(), 25000); // takılırsa kendiliğinden geçer
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
      // dokunma burada doğru cevap: her an açık dokunuş Mino'ya "Şşş!" dedirtmesin
      const serbestti = egeSerbest;
      egeSerbest = false;
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
        egeSerbest = serbestti;
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

