/**
 * Lokanta ana ekranı (§3a, §7a): tek resimde salon + açık mutfak, dik karşıdan. Kamera yok, büyütme yok.
 *
 * Akış: müşteri kapıdan girer → çocuk onu bir boş masaya sürükler (ya da boş masaya dokunur; 4 sn dokunulmazsa
 * müşteri en yakın boş masaya kendisi oturur) → oturur, isteğini söyler (balonda resim) → Kino adisyonu yazar,
 * kart masanın rengindeki mandalla ipe asılır → çocuk istediği istasyona girer (mini oyunlar, mini/arayuz.ts) →
 * ürünler tepsiye, tabak servis penceresine → tabağı Kino'ya ver (dokun ya da sürükle) ya da doğrudan bir masaya
 * sürükle → müşteri yer, tepki verir (bayıldı / mmm / komik; ceza yok) → hesap tabağına jeton bırakır, el sallayıp
 * gider → hesap tabağına dokununca jetonlar kasaya uçar, Mino sayar → gün sonu (kasa, Babaanne'nin Defteri).
 *
 * Büyüme (P4, §6): ilk oyunda Babaanne anahtarı verir (babaanne.ts); her sabah menü tahtası (menu-tahtasi.ts);
 * masalar kayıttaki yuvalarında, süsler ve mutfağa gelen aletler (yerlesim.ts), müşteri panosu (pano.ts), bahçe
 * alındıysa sahne sağa uzar ve kayarak bahçeye geçilir (büyütme yok). Dün alınan tarifi bugün bir müşteri ister,
 * Babaanne tadına bakmaya gelir.
 */
import { erisimVarMi } from '../../../src/abonelik/kilit';
import { konus } from '../../../src/audio/ses';
import { Mino } from '../../../src/mino/mino';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import type { Ekran, Uygulama } from '../../../src/uygulama';
import { istasyonAc, type IstasyonEkrani } from '../istasyon/istasyon';
import defterJson from '../../../content/restoran/defter.json';
import { KATALOG, masaSayisi as kayitliMasaSayisi, menuOnerisi, yerlesmemisleriKoy, yerlestir as yuvayaKoy, type AlimSonucu, type DefterKalemi } from '../ekonomi';
import { kaydet, kayit } from '../kayit';
import type { ArkaIs, Istasyon, Malzeme, MiniGirdi, MiniOyun, Urun } from '../mini/arayuz';
import { denemeIcin } from '../mini/deneme';
import { istasyonOyunlari, oyunBul } from '../mini/katalog';
import { gunPlani, ilkGunPlani, L, MUSTERILER, odeme, tepkiHesapla, TARIFLER, yemekTani, type GunPlani, type Istek, type Musteri, type PlanMusteri, type TepkiSonuc } from '../model';
import { ENAZ_BOY34, MASA34, olcuIzle, olcuIzle34, YERLESIM, YERLESIM34, type Olcu, type Olcu34, type Yer, type Yerlesim34, type Yon } from '../olcek';
import { salonSes, sesler } from '../sesler';
import { varlik, yeniden } from '../varliklar';
import { anahtarTeslim, yeniTarifTadi, type BabaanneBaglam } from './babaanne';
import { bulasikYiginiKur } from './bulasik-yigin';
import { personelBaslat, type Personel } from './personel';
import { patatesVar, surprizKur, type Surprizler } from './surpriz';
import surprizJson from '../../../content/restoran/surpriz.json';
import { gunSonuAc, type GunSonu } from './gun-sonu';
import { merdivenKur } from './ipucu';
import { istekResmi, yolHaritasi } from './istek-gorsel';
import { Kisi } from './kisi';
import { menuTahtasi } from './menu-tahtasi';
import { panoCiz, PANO_YER } from './pano';
import { surukleBagla, ustunde } from './surukle';
import { aletKutusu, masaYeri, sahneGenisligi, susleriCiz, yuvaSec } from './yerlesim';
import { hudKur, HUD_SOZ, type Hud } from './hud';
import { arka34Ciz, aynala, balonYerlestir, derinlik, grafikKur, halilariCiz, kisiOlcekle, masaYaniYeri, sahne34Acik, sandalyeYeri, yolBul, yolYuru, type YolGrafigi } from './sahne34';
import { KAPASITE, Sira, type SiraUyesi } from './sira';
import { defterAc } from '../defter';
import './sahne34.css';

const DENEME_ZORLA = (TEST_MODU || new URLSearchParams(location.search).has('onizleme')) && new URLSearchParams(location.search).has('deneme');
/** test modunda Babaanne'nin anahtar töreni yalnız &babaanne=1 ile (çekirdek testleri beklemesin) */
const ANAHTAR_TOREN = !TEST_MODU || new URLSearchParams(location.search).has('babaanne');
/** test modunda 3/4 sıra eski testlerle uyumlu tek kişilik; &sira=1 ile tam sıra (3 + yolun başı 2) */
const SIRA_TEST_SINIR = TEST_MODU && !new URLSearchParams(location.search).has('sira') ? 1 : null;
const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 30) : AZ_HAREKET ? Math.min(ms, 300) : ms));

/** Masa renkleri: adisyon mandalı ile masanın bayrakçığı aynı renk (çocuk masayı renkten tanır) */
export const MASA_RENK = ['#E8483A', '#4C8FD6', '#F2B233', '#4FA83D', '#9B5FC0', '#F2902F'];
/** masanın önden görünen yüksekliği (u) */
export const MASA_H = 1.05;
/** masanın eni (u; lokanta.css .rs-masa ile aynı) */
export const MASA_W = 2.7;

const SEBZE_RAF: Malzeme[] = ['domates', 'salatalik', 'sogan', 'biber', 'maydanoz', 'marul', 'havuc', 'patates'];
const GARNITUR: Malzeme[] = ['limon', 'maydanoz', 'ekmek', 'zeytin', 'zeytinyagi', 'bal'];

interface Masa {
  i: number;
  /** masa yuvası (kayit.yerlesim.masa anahtarı: salon 0-3, bahçe 4-5) */
  yuva: string;
  el: HTMLElement;
  ust: HTMLElement;
  hesap: HTMLElement;
  yer: Yer;
  oturan: Oturan | null;
  /** P8 3/4: masanın arkasındaki sandalyeler (iki kişilik) */
  sandalye: HTMLElement[];
  /** masada bekleyen jeton */
  jeton: number;
  kirli: HTMLElement | null;
}
interface Oturan {
  plan: PlanMusteri;
  m: Musteri;
  kisi: Kisi;
  eslik: Kisi | null;
  masa: Masa;
  durum: 'yuruyor' | 'istiyor' | 'bekliyor' | 'yiyor' | 'gidiyor';
  adisyon: HTMLElement | null;
  balon: HTMLElement | null;
}
interface Kapida {
  plan: PlanMusteri;
  m: Musteri;
  kisi: Kisi;
  eslik: Kisi | null;
  hazir: boolean;
  zaman: number;
  /** P8 3/4: sıradaki yeri */
  uye?: SiraUyesi;
}

export interface LokantaParam {
  tohum?: number;
  once?: string[];
}

export function lokantaEkrani(app: Uygulama, param: LokantaParam = {}): Ekran {
  const yas = kayit.yas ?? 'kucuk';
  const gun = kayit.gun + 1;
  // uygulama yerleştirme ortasında kapandıysa alınanlar ilk boş yuvaya
  yerlesmemisleriKoy(kayit);
  const acikTarifler = kayit.acilan.tarif.filter((t) => TARIFLER[t]);
  // menü tahtasında seçilir (menu-tahtasi.ts); o ana kadar öneri
  let menu = menuOnerisi(acikTarifler, kayit.menu, yas, kayit.yeniTarif);
  const masaYuvalari = Object.keys(kayit.yerlesim.masa).sort((a, b) => Number(a) - Number(b));
  const masaSayisi = Math.max(1, kayitliMasaSayisi(kayit));
  const ilkGun = kayit.gun === 0 && !param.tohum && !param.once?.length;
  /** dün alınan tarif: bugün ilk müşteri onu ister, Babaanne tadına bakar */
  const yeniTarif = kayit.yeniTarif;
  const planKur = (): GunPlani => {
    const p = gunPlani({ gun, yas, tohum: param.tohum ?? Date.now() % 100000, menu, masa: masaSayisi, gorulen: kayit.gorulen, once: param.once, yeniTarif: yeniTarif ?? undefined });
    if (ilkGun) p.musteriler = ilkGunPlani(yas);
    return p;
  };
  let plan: GunPlani = planKur();
  /** sabah bitti (anahtar, menü tahtası, Babaanne): müşteriler gelmeye başlar */
  let acik = false;

  // ---------------------------------------------------------------- sahne
  const el = h('div.rs-lokanta', { 'data-gun': String(gun) });
  const sahne = h('div.rs-sahne');
  const arka = h('div.rs-arka');
  const katman = h('div.rs-katman');
  // P8: 3/4 diorama (Check Please! esini; kamera sabit, HUD panelli). Resim yoksa dik karşıdan eski sahne.
  const S34 = sahne34Acik(varlik);
  if (S34) el.dataset.s34 = '1';
  // bahçe (alındıysa): eski sahnede sağda ikinci resim, kayarak geçilir; 3/4'te aynı resmin bahçeli sürümü
  const bahceVar = sahneGenisligi(kayit.acilan.bolum) > 1;
  let bahceAcik = bahceVar;
  const bahceArka = bahceVar && !S34 ? h('div.rs-bahce-arka') : null;
  sahne.append(arka, ...(bahceArka ? [bahceArka] : []), katman);
  let bahcede = false;
  const gecis = bahceArka ? h('button.rs-bahce-gec', { type: 'button', 'aria-label': 'Bahçe' }, h('span.rs-bahce-gec-yaprak')) : null;
  const cubuk = h('div.rs-ust-cubuk');
  const geri = h('button.rs-geri', { type: 'button', 'aria-label': 'Menüye dön' });
  cubuk.append(geri);
  const tepsiEl = h('div.rs-tepsi', { 'aria-label': 'Tepsi' }, h('span.rs-tepsi-zemin'), h('div.rs-tepsi-ic'));
  el.append(sahne, cubuk, tepsiEl, ...(gecis ? [gecis] : []));
  const kaydir = (b: boolean) => {
    bahcede = b;
    el.dataset.bahce = b ? '1' : '';
    sahne.style.setProperty('--rs-kayma', b ? '-100%' : '0%');
    sesler.cal('hop', { guc: 0.5 });
  };
  gecis?.addEventListener('click', () => kaydir(!bahcede));
  geri.addEventListener('click', () => app.secenekler.cikis?.());
  if (!app.secenekler.cikis) geri.hidden = true;

  let yon: Yon = 'yatay';
  let Y = YERLESIM.yatay;
  let Y34: Yerlesim34 = YERLESIM34.yatay;
  let grafik: YolGrafigi | null = null;
  let hud: Hud | null = null;
  let sira: Sira | null = null;
  /** 3/4: masa yuvasının yeri (salon 0-3, bahçe 4-5) */
  const masaYeri34 = (yuva: string): Yer => {
    const i = Number(yuva);
    return i < 4 ? Y34.masalar[i] : (Y34.bahce.masalar[i - 4] ?? Y34.bahce.masalar[0]);
  };
  const pct = (v: number) => `${v}%`;

  // arka plan: lokanta çizimi (yoksa sade yer tutucu katmanlar)
  const arkaKur = () => {
    if (S34) return arka34Ciz(arka, yon, bahceAcik, varlik);
    const u = varlik(yon === 'dikey' ? 'arka/lokanta-dikey' : 'arka/lokanta-yatay');
    arka.replaceChildren();
    arka.classList.toggle('rs-yertutucu', !u);
    if (u) arka.append(h('img.rs-arka-resim', { src: u, alt: '', draggable: 'false' }));
    else arka.append(h('div.rs-duvar'), h('div.rs-cini'), h('div.rs-tezgah-on'), h('div.rs-zemin'), h('div.rs-pencere-dis'));
    if (bahceArka) {
      // bahçe çizimi (Gemini bahce-yatay / bahce-dikey) gelene kadar sade yer tutucu: gökyüzü, çim, asma çardak
      const b = varlik(yon === 'dikey' ? 'arka/bahce-dikey' : 'arka/bahce-yatay');
      bahceArka.replaceChildren();
      bahceArka.classList.toggle('rs-yertutucu', !b);
      if (b) bahceArka.append(h('img.rs-arka-resim', { src: b, alt: '', draggable: 'false' }));
      else bahceArka.append(h('div.rs-bahce-gok'), h('div.rs-bahce-cardak', {}, h('i'), h('i'), h('i'), h('i')), h('div.rs-bahce-cim'), h('div.rs-bahce-duvar'));
    }
  };

  // istasyon düğmeleri (mutfakta)
  const istDugme: Partial<Record<Istasyon, HTMLElement>> = {};
  const ISTASYONLAR = ['lavabo', 'tezgah', 'ocak', 'mermer', 'servis'] as const;
  // P6: gizli sürprizler (surpriz.ts), personel yemeği (personel.ts; 5-6)
  let surpriz: Surprizler | null = null;
  let personel: Personel | null = null;
  let personelOldu = false;
  // P6: Kino'nun topladığı kirli tabaklar lavaboda birikir; varsa lavabo (Bulaşık) açılır
  const yigin = bulasikYiginiKur({
    el,
    lavabo: () => istDugme.lavabo,
    degisti: () => {
      const d = istDugme.lavabo as HTMLButtonElement | undefined;
      if (d) d.disabled = !acikIstasyon('lavabo');
    },
  });
  /**
   * Açılma sırası (§6c, P4): istasyonda yalnız açık tariflerin mini oyunları oynanır (Gün 1: doğra, tava, tabakla);
   * defterden alınan tarif kendi oyunlarını açar (patates: soy, kızart; pankek: kır-çırp ...). Yıka Gün 2'de açılır
   * (Babaanne'nin pazardan çamurlu sebzesi). Bir istasyonda birden çok açık oyun varsa seçim düğmeleri çıkar.
   */
  const acikOyunlar = new Set<string>([...acikTarifler.flatMap((t) => TARIFLER[t]?.yol ?? []), ...(gun >= 2 ? ['yika'] : [])]);
  const istasyonAcikOyunlari = (ist: Istasyon) => istasyonOyunlari(ist).filter((o) => acikOyunlar.has(o.ad) || (o.ad === 'bulasik' && yigin.adet() > 0));
  const acikIstasyon = (ist: Istasyon) => ist === 'tezgah' || ist === 'ocak' || ist === 'servis' || istasyonAcikOyunlari(ist).length > 0;
  // mutfağa sonradan gelen aletler (içecek tezgâhı, fırın; mangal bahçede): alınış sırasıyla alet yuvalarına
  const yeniIstasyonlar = [...new Set(kayit.acilan.alet.map((a) => KATALOG.find((k) => k.alet === a && k.istasyon)?.istasyon).filter((x): x is Istasyon => !!x))];
  for (const ist of yeniIstasyonlar) {
    const b = h('button.rs-ist.rs-ist-yeni', { type: 'button', 'data-istasyon': ist, 'aria-label': ist }, h('span.rs-ist-gorsel'), h('span.rs-buhar', { 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
    b.addEventListener('click', () => istasyonaGir(ist));
    istDugme[ist] = b;
    katman.append(b);
  }
  for (const ist of ISTASYONLAR) {
    const b = h('button.rs-ist', { type: 'button', 'data-istasyon': ist, 'aria-label': ist, disabled: !acikIstasyon(ist) }, h('span.rs-ist-gorsel'), h('span.rs-buhar', { 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
    b.addEventListener('click', () => istasyonaGir(ist));
    istDugme[ist] = b;
    katman.append(b);
  }
  const ip = h('div.rs-ip');
  const kasa = h('div.rs-kasa', {}, h('span.rs-kasa-govde'), h('span.rs-kasa-yigin'));
  const pencere = h('div.rs-pencere');
  const kapi = h('div.rs-kapi', {}, h('span.rs-kapi-zil'));
  katman.append(ip, kasa, pencere, kapi);
  kapi.addEventListener('click', () => {
    // gizli sürpriz §9.3: zil çalar, kimse yok, oturanlar kapıya bakar, Kino omuz silker (surpriz.ts)
    if (surpriz?.kapiZili()) return;
    salonSes.kapi();
    void kino.oynat('bak', 500);
  });

  // masalar: kayıttaki yuvalarında (salon 0-3, bahçe 4-5)
  const masalar: Masa[] = [];
  const masaKur = (yuva: string, i: number): Masa => {
    const ust = h('div.rs-masa-ust');
    const hesap = h('button.rs-hesap', { type: 'button', 'aria-label': 'Hesap tabağı' }, h('span.rs-hesap-tabak'), h('span.rs-hesap-jetonlar'));
    const m = h('div.rs-masa', { 'data-masa': String(i), 'data-ortu': kayit.ortu ?? '', style: `--rs-masa-renk:${MASA_RENK[i]}` }, h('span.rs-masa-govde'), h('span.rs-masa-bayrak'), ust, hesap);
    m.dataset.yuva = yuva;
    const masa: Masa = { i, yuva, el: m, ust, hesap, yer: { x: 0, y: 0 }, oturan: null, sandalye: [], jeton: 0, kirli: null };
    if (S34) {
      // 3/4 masa-sandalye seti (masa-sandalye-34): iki sandalye masanın ARKASINDA, oturan kameraya bakar
      const bahceMasasi = Number(yuva) >= 4;
      m.style.setProperty('--rs-masa-w', String(masaW(masa)));
      masa.sandalye = [0, 1].map(() => {
        const u = varlik(bahceMasasi ? 'masa/bahce-sandalye' : 'masa/sandalye');
        const s = h('div.rs-sandalye', { 'data-bahce': bahceMasasi ? '1' : undefined }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null);
        katman.append(s);
        return s;
      });
      masaResmi34(masa);
    }
    m.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.rs-hesap')) return;
      masayaDokunuldu(masa);
    });
    hesap.addEventListener('click', () => void hesapTopla(masa));
    masalar.push(masa);
    katman.append(m);
    return masa;
  };
  masaYuvalari.forEach((y, i) => masaKur(y, i));

  /** 3/4 masa eni (boy birimi): bahçede dar demir masa */
  function masaW(m: Masa) {
    return Number(m.yuva) >= 4 ? MASA34.bahceW : MASA34.w;
  }
  /** 3/4 masa resmi: örtüye göre (masa-sandalye-34; bahçede demir masa) */
  function masaResmi34(masa: Masa) {
    const ortu = kayit.ortu ? `masa/masa-${kayit.ortu}` : null;
    const u = Number(masa.yuva) >= 4 ? varlik('masa/bahce-masa') : ((ortu ? varlik(ortu) : null) ?? varlik('masa/masa'));
    masa.el.querySelector('img.rs-masa-resim')?.remove();
    if (u) masa.el.prepend(h('img.rs-masa-resim', { src: u, alt: '', draggable: 'false' }));
  }

  // süsler (yerlesim.ts) ve müşteri panosu (pano.ts)
  const susKatman = h('div.rs-sus-katman');
  const pano = h('div.rs-pano', { 'aria-hidden': 'true' }, h('div.rs-pano-ic'));
  katman.append(susKatman, pano);
  panoCiz(pano, kayit.pano);

  // Kino (garson) ve salondaki Mino (anlatıcı)
  const kino = new Kisi('kino', 'kino');
  kino.el.classList.add('rs-kino');
  const kinoTepsi = h('div.rs-kino-tepsi');
  kino.el.append(kinoTepsi);
  katman.append(kino.el);
  const minoEl = h('div.rs-salon-mino');
  const mino = new Mino();
  const salonBalon = h('div.rs-salon-balon');
  minoEl.append(mino.el, salonBalon);
  katman.append(minoEl);

  const zSira = (k: Kisi) => {
    k.el.style.zIndex = S34 ? String(derinlik(k.konum.y, k.oturdu ? 'oturan' : 'ayakta')) : String(Math.round(k.konum.y * 10) + (k.oturdu ? 0 : 3));
  };
  if (S34) {
    kisiOlcekle(kino, ENAZ_BOY34);
    sira = new Sira({
      katman,
      yer: (i) => (i < Y34.sira.length ? Y34.sira[i] : (Y34.yolBasi[i - Y34.sira.length] ?? Y34.yolBasi[Y34.yolBasi.length - 1])),
      yuru: (k, p) => yuru(k, p.x, p.y, 22),
      kapiCal: () => {
        salonSes.kapi();
        kapi.classList.remove('rs-acik');
        void kapi.offsetWidth;
        kapi.classList.add('rs-acik');
        window.setTimeout(() => kapi.classList.remove('rs-acik'), TEST_MODU ? 30 : 600);
      },
      kapandi: () => kapandi,
    });
  }
  /** Yürü: 3/4'te yol grafiğiyle (masaların, tezgâhın içinden geçmez; sola giderken ayna), eski sahnede düz */
  async function yuru(k: Kisi, x: number, y: number, hiz: number): Promise<void> {
    if (!S34 || !grafik) return k.yuru(x, y, hiz);
    const once = k.el.dataset.poz ?? 'giris';
    const kino_ = k.ad === 'kino';
    const var2 = (a: string, b: string) => (varlik(`kisi/${k.ad}/${a}`) && varlik(`kisi/${k.ad}/${b}`) ? [a, b] : null);
    if (!kino_) k.poz('giris');
    await yolYuru(k, yolBul(grafik, k.konum, { x, y }), {
      yon,
      hiz: hiz * 0.75,
      // Kino: mutfağa yukarı arka, aşağı ön kareleri (§11h #75); gelene kadar yan yürüyüş kareleri
      kareler: (d) => (kino_ ? ((d === 'yukari' ? var2('arka-1', 'arka-2') : d === 'asagi' ? var2('on-1', 'on-2') : null) ?? var2('yuru-1', 'yuru-2')) : null),
      test: TEST_MODU,
      kapandi: () => kapandi,
    });
    k.poz(kino_ ? once : (k.el.dataset.poz ?? 'giris'));
  }
  let kinoMesgul = false;
  let olcu: Olcu | null = null;

  const yerlestir = (o: Olcu) => {
    olcu = o;
    yon = o.yon;
    Y = S34 ? YERLESIM34[yon] : YERLESIM[yon];
    Y34 = YERLESIM34[yon];
    if (S34) hud?.yerlestir(o as Olcu34);
    arkaKur();
    for (const ist of ISTASYONLAR) {
      const k = Y.istasyon[ist];
      Object.assign(istDugme[ist]!.style, { left: pct(k.x), top: pct(k.y), width: pct(k.w), height: pct(k.h) });
    }
    for (const ist of yeniIstasyonlar) {
      const k = S34 ? (ist === 'mangal' ? Y34.bahce.mangal : Y34.alet[yeniIstasyonlar.filter((x) => x !== 'mangal').indexOf(ist)]) : aletKutusu(ist, yeniIstasyonlar, yon);
      if (k) Object.assign(istDugme[ist]!.style, { left: pct(k.x), top: pct(k.y), width: pct(k.w), height: pct(k.h) });
    }
    susleriCiz(susKatman, kayit.yerlesim.sus, yon, S34 ? Y34.sus : undefined);
    const pk = S34 ? Y34.pano : PANO_YER[yon];
    Object.assign(pano.style, { left: pct(pk.x), top: pct(pk.y), width: pct(pk.w), height: pct(pk.h) });
    Object.assign(ip.style, { left: pct(Y.ip[0].x), top: pct(Y.ip[0].y), width: pct(Y.ip[1].x - Y.ip[0].x) });
    Object.assign(kasa.style, { left: pct(Y.kasa.x), top: pct(Y.kasa.y), width: pct(Y.kasa.w), height: pct(Y.kasa.h) });
    Object.assign(pencere.style, { left: pct(Y.pencere.x), top: pct(Y.pencere.y), width: pct(Y.pencere.w), height: pct(Y.pencere.h) });
    Object.assign(kapi.style, { left: pct(Y.kapi.x), top: pct(Y.kapi.y) });
    masalar.forEach((m) => {
      m.yer = S34 ? masaYeri34(m.yuva) : masaYeri(m.yuva, yon);
      Object.assign(m.el.style, { left: pct(m.yer.x), top: pct(m.yer.y), zIndex: S34 ? String(derinlik(m.yer.y, 'masa')) : String(Math.round(m.yer.y * 10) + 2) });
      m.sandalye.forEach((s, j) => {
        const p = sandalyeYeri(m.yer, yon, 2, j as 0 | 1);
        Object.assign(s.style, { left: pct(p.x), top: pct(p.y), zIndex: String(derinlik(m.yer.y, 'sandalye')) });
      });
      if (m.oturan && m.oturan.durum !== 'yuruyor' && m.oturan.durum !== 'gidiyor') oturuYerlestir(m.oturan);
    });
    if (S34) {
      grafik = grafikKur(Y34, yon, masalar.map((m) => ({ ...m.yer, w: masaW(m) })), bahceAcik);
      halilariCiz(arka, masalar.map((m) => m.yer), yon);
      sira?.yerlestir();
      for (const m of masalar) if (m.oturan?.balon) balonYerlestir(m.oturan.balon, m.oturan.kisi.el, sahne, m.oturan.kisi.olcu);
    }
    if (!kinoMesgul) kino.yerKoy(Y.kino.x, Y.kino.y);
    zSira(kino);
    minoEl.style.left = pct(S34 ? Y34.mino.x : yon === 'yatay' ? 56 : 44);
    minoEl.style.top = pct(S34 ? Y34.mino.y : yon === 'yatay' ? 52 : 44);
    if (S34) minoEl.style.zIndex = String(derinlik(Y34.mino.y));
    const kapida = ilkKapida();
    if (!S34 && kapida?.hazir) {
      kapida.kisi.yerKoy(Y.bekleme.x, Y.bekleme.y);
      zSira(kapida.kisi);
    }
    surpriz?.yerlestir();
  };

  // ---------------------------------------------------------------- konuşma
  let minoKonusuyor = false;
  const minoSoyle = async (metin: string) => {
    if (kapandi) return;
    salonBalon.textContent = metin.replace(/\[[^\]]*\]\s*/g, '');
    minoEl.classList.add('konusuyor');
    mino.agizOyna(true);
    minoKonusuyor = true;
    try {
      await konus(metin, { cihazSesi: false });
    } finally {
      minoKonusuyor = false;
      mino.agizOyna(false);
      minoEl.classList.remove('konusuyor');
    }
  };
  const kisiSoyle = async (k: Kisi, m: Musteri | null, metin: string | undefined, kinoMu = false) => {
    if (!metin || kapandi) return;
    const b = h('div.rs-soz', {}, metin.replace(/\[[^\]]*\]\s*/g, ''));
    k.el.append(b);
    k.konus(true);
    try {
      // müşteri kendi Seri 2 sesiyle (eleven_v4 kaydı varsa), yoksa anlatıcı kaydı müşterinin tonuyla
      await konus(metin, kinoMu ? { karakter: 'kino', ton: 0.92, cihazSesi: false } : { karakter: m?.id ?? null, ton: m?.ton ?? 1, cihazSesi: false });
      await bekle(250);
    } finally {
      k.konus(false);
      b.remove();
    }
  };
  const musteriSozu = (m: Musteri, anahtar: 'selam' | 'bayildi' | 'komik' | 'gule') => (L.musteri as Record<string, Partial<Record<string, string>>>)[m.id]?.[anahtar];

  // ---------------------------------------------------------------- müşteri durumu
  let siradaki = 0;
  /** kapıda bekleyenler: eski sahnede en çok 1 (kapının önü), 3/4'te sıra (3 + yolun başı 2) */
  const bekleyen: Kapida[] = [];
  const hazirMi = (k: Kapida) => (S34 ? !!k.uye?.hazir : k.hazir);
  /** sıranın başındaki hazır kişi (ipucu, kendiliğinden oturma); eski sahnede kapıdaki */
  const ilkKapida = (): Kapida | null => (S34 ? (bekleyen.filter(hazirMi).sort((a, b) => (a.uye?.yuva ?? 0) - (b.uye?.yuva ?? 0))[0] ?? null) : (bekleyen[0] ?? null));
  const bekleyendenCikar = (k: Kapida) => {
    const i = bekleyen.indexOf(k);
    if (i >= 0) bekleyen.splice(i, 1);
    if (k.uye) sira?.cikar(k.uye);
  };
  let sonGelis = -1e9;
  let sonBosalma = -1e9;
  let gunBitti = false;
  let gunJeton = 0;
  let hizmet = 0;
  let kapandi = false;
  let tepsi: Urun[] = [];
  const tepkiGunlugu: { musteri: string; istek: string; tepki: string; neden?: string; yemek?: string }[] = [];
  let istasyon: IstasyonEkrani | null = null;
  const masadaki = () => masalar.filter((m) => m.oturan).length;

  // ---------------------------------------------------------------- ipucu merdiveni (salon)
  const merdiven = merdivenKur(el, (m) => void minoSoyle(m), { erken: kayit.gun === 0 });
  el.addEventListener('pointerdown', () => merdiven.dokunuldu(), { capture: true });
  const ipucuGuncelle = () => {
    if (kapandi || istasyon) return;
    const bekleyen = masalar.find((m) => m.oturan?.durum === 'bekliyor');
    const hazirTabak = pencere.querySelector<HTMLElement>('.rs-hazir');
    const jetonlu = masalar.find((m) => m.jeton > 0);
    const kapida = ilkKapida();
    if (kapida && hazirMi(kapida) && masalar.some((m) => !m.oturan)) {
      const bos = masalar.find((m) => !m.oturan);
      merdiven.hedef({ el: () => (kapida.kisi.el.isConnected ? kapida.kisi.el : null), soz: L.mino.masa_sec, hareket: 'surukle', nereye: () => bos?.el ?? null });
    } else if (hazirTabak && bekleyen) merdiven.hedef({ el: () => pencere.querySelector('.rs-hazir'), soz: L.mino.durum.tabak_hazir, hareket: 'surukle', nereye: () => kino.el });
    else if (bekleyen && tepsi.length) merdiven.hedef({ el: () => istDugme.servis ?? null, soz: L.mino.durum.tepsi_dolu, hareket: 'dokun' });
    else if (bekleyen) merdiven.hedef({ el: () => istDugme.tezgah ?? null, soz: L.mino.durum.bekliyor, hareket: 'dokun' });
    else if (jetonlu) merdiven.hedef({ el: () => jetonlu.hesap, soz: L.mino.durum.jeton, hareket: 'dokun' });
    else merdiven.hedef(null);
  };

  // ---------------------------------------------------------------- Kino'nun işleri (sırayla)
  let kinoZincir: Promise<void> = Promise.resolve();
  const kinoIs = (f: () => Promise<void>) => {
    kinoZincir = kinoZincir.then(async () => {
      if (kapandi) return;
      kinoMesgul = true;
      try {
        await f();
      } catch (e) {
        console.warn(e);
      }
      kinoMesgul = false;
    });
    return kinoZincir;
  };
  const kinoYuru = async (x: number, y: number) => {
    if (!S34) kino.el.style.zIndex = '940';
    await yuru(kino, x, y, 30);
    zSira(kino);
  };
  const kinoYerine = () => kinoYuru(Y.kino.x, Y.kino.y);
  /** masanın yanı (Kino'nun durduğu yer) */
  const masaYani = (m: Masa): Yer => {
    // masanın yarı eni + Kino'nun yarısı (u), sahnenin yüzdesi olarak: Kino masanın önüne değil yanına durur
    if (S34) return masaYaniYeri({ ...m.yer, w: masaW(m) }, yon, grafik?.engel);
    const dx = olcu ? ((MASA_W / 2 + 0.45) * olcu.u * 100) / olcu.sahne.w : 12;
    return { x: m.yer.x + (m.yer.x > 50 ? -dx : dx), y: m.yer.y - 1 };
  };

  // ---------------------------------------------------------------- müşteriler
  const yeniKisi = (ad: string, boy: string) => {
    const k = new Kisi(ad, boy);
    if (S34) kisiOlcekle(k, ENAZ_BOY34);
    katman.append(k.el);
    return k;
  };
  const kisiKopya = (k: Kisi) => {
    const c = k.govde.cloneNode(true) as HTMLElement;
    const kaynak = k.govde.querySelector('canvas');
    const hedef = c.querySelector('canvas');
    if (kaynak && hedef) {
      hedef.width = kaynak.width;
      hedef.height = kaynak.height;
      hedef.getContext('2d')?.drawImage(kaynak, 0, 0);
    }
    c.classList.add('rs-kopya');
    return c;
  };

  const musteriGetir = async () => {
    const p = plan.musteriler[siradaki++];
    if (!p) return;
    const m = MUSTERILER[p.musteri];
    const kisi = yeniKisi(m.id, m.boy);
    const eslik = p.eslik ? yeniKisi(p.eslik, MUSTERILER[p.eslik]?.boy ?? p.eslik) : null;
    if (S34 && sira) {
      // 3/4: sıraya girer (yolun dışından yürür); kapıdan girmez
      kisi.yerKoy(Y34.giris.x, Y34.giris.y);
      eslik?.yerKoy(Y34.giris.x, Y34.giris.y);
      await Promise.all([kisi.hazir, eslik?.hazir]);
      if (kapandi) return;
      const k: Kapida = { plan: p, m, kisi, eslik, hazir: false, zaman: performance.now() };
      const uye = sira.ekle({ kisi, eslik });
      k.uye = uye;
      bekleyen.push(k);
      surukleBagla(kisi.el, el, {
        acik: () => bekleyen.includes(k) && hazirMi(k),
        hayalet: () => kisiKopya(kisi),
        basla: () => {
          uye.zaman = performance.now() + 60_000;
        },
        birak: (x, y) => {
          uye.zaman = performance.now();
          const hedef = masalar.find((mm) => !mm.oturan && (ustunde(mm.el, x, y, 30) || mm.sandalye.some((s) => ustunde(s, x, y, 10))));
          if (!hedef) return false;
          void oturt(k, hedef);
          return true;
        },
        dokun: () => {
          uye.zaman = performance.now();
          void kisi.oynat('hop', 360);
        },
      });
      await uye.vardi;
      if (kapandi || !bekleyen.includes(k)) return;
      k.hazir = true;
      if (hizmet === 0 && bekleyen.length === 1) void minoSoyle(L.mino.musteri_geldi);
      ipucuGuncelle();
      return;
    }
    kisi.yerKoy(Y.kapi.x, Y.kapi.y + 20);
    eslik?.yerKoy(Y.kapi.x, Y.kapi.y + 20);
    kisi.el.style.zIndex = '950';
    if (eslik) eslik.el.style.zIndex = '950';
    const k: Kapida = { plan: p, m, kisi, eslik, hazir: false, zaman: performance.now() };
    bekleyen.push(k);
    salonSes.kapi();
    kapi.classList.add('rs-acik');
    await Promise.all([kisi.hazir, eslik?.hazir]);
    await Promise.all([kisi.yuru(Y.bekleme.x, Y.bekleme.y, 22), eslik?.yuru(Y.bekleme.x + 5, Y.bekleme.y, 22)]);
    kapi.classList.remove('rs-acik');
    zSira(kisi);
    if (eslik) zSira(eslik);
    kisi.el.style.zIndex = '950';
    if (eslik) eslik.el.style.zIndex = '950';
    if (kapandi || !bekleyen.includes(k)) return;
    k.hazir = true;
    k.zaman = performance.now();
    void kisi.oynat('hop', 420);
    if (hizmet === 0) void minoSoyle(L.mino.musteri_geldi);
    surukleBagla(kisi.el, el, {
      acik: () => bekleyen.includes(k) && k.hazir,
      hayalet: () => kisiKopya(kisi),
      basla: () => {
        k.zaman = performance.now() + 60_000;
      },
      birak: (x, y) => {
        k.zaman = performance.now();
        const hedef = masalar.find((mm) => !mm.oturan && ustunde(mm.el, x, y, 30));
        if (!hedef) return false;
        void oturt(k, hedef);
        return true;
      },
      dokun: () => void kisi.oynat('hop', 360),
    });
    ipucuGuncelle();
  };

  const masayaDokunuldu = (m: Masa) => {
    const kapida = ilkKapida();
    if (kapida && hazirMi(kapida) && !m.oturan) void oturt(kapida, m);
    else if (m.oturan?.durum === 'bekliyor' || m.oturan?.durum === 'istiyor') void m.oturan.kisi.oynat('hop', 360);
  };

  /**
   * Oturuş: kukla / resim ayakta çizilmiş; kalça masa üstünün biraz altına gelir (yüksek sandalye gibi), masa üstünün
   * altında kalan kısım kırpılır (bacaklar masanın arkasında). Ayaklar zeminin altına inebilir (kırpılır).
   */
  const oturt_ = (k: Kisi, x: number, masa: Masa) => {
    const kutuH = k.boy / (k.olcu.taban - k.olcu.tepe);
    const belYuk = (k.olcu.taban - k.olcu.bel) * kutuH;
    const kalcaAlti = k.boy < 1.3 ? 0.02 : 0.18;
    // poz karesi: figür gerçekten oturuyor, ayaklar yerde (kısalar yükseltilmiş sandalyede); kukla / resim: ayakta çizim
    const dy = k.pozlu ? Math.max(0, MASA_H - 0.15 - 0.42 * k.boy) : MASA_H - kalcaAlti - belYuk;
    const kirp = MASA_H - dy - 0.12 + (1 - k.olcu.taban) * kutuH;
    k.el.style.setProperty('--rs-otur-dy', dy.toFixed(3));
    k.el.style.setProperty('--rs-otur-kirp', Math.max(0, kirp).toFixed(3));
    k.yerKoy(x, masa.yer.y - 0.4);
    k.otur(true);
  };
  /**
   * 3/4 oturuş: müşteri masanın ARKASINDAKİ sandalyede, kameraya bakar. Ön kolları masa üstünün ortasında (kısalar
   * yükseltilmiş sandalyede); masa üstünün ön kenarının altı kırpılır (bacaklar asla görünmez), masa önde çizilir.
   */
  const oturt34_ = (k: Kisi, p: Yer, masa: Masa) => {
    const f = k.boy < ENAZ_BOY34 ? ENAZ_BOY34 / k.boy : 1;
    const kutuH = k.boy / (k.olcu.taban - k.olcu.tepe);
    const c = (MASA34.sandalyeGeri + MASA34.derinlik * 0.55) / f;
    const ustOrta = MASA34.ustOrta / f;
    const kesik = MASA34.kesik / f;
    const belYuk = (k.olcu.taban - k.olcu.bel) * kutuH;
    const dy = k.pozlu ? Math.max(0, ustOrta - c - 0.42 * k.boy) : kesik + 0.08 / f - c - belYuk;
    const kirp = kesik - c - dy + (1 - k.olcu.taban) * kutuH;
    k.el.style.setProperty('--rs-otur-dy', dy.toFixed(3));
    k.el.style.setProperty('--rs-otur-kirp', Math.max(0, kirp).toFixed(3));
    k.yerKoy(p.x, p.y);
    k.otur(true);
    k.el.style.zIndex = String(derinlik(masa.yer.y, 'oturan'));
  };
  const oturtKisi = (k: Kisi, x: number, masa: Masa) => (S34 ? oturt34_(k, sandalyeYeri(masa.yer, yon, 2, x > masa.yer.x ? 1 : 0), masa) : oturt_(k, x, masa));
  const oturuYerlestir = (o: Oturan) => {
    if (S34) {
      oturt34_(o.kisi, sandalyeYeri(o.masa.yer, yon, 2, 0), o.masa);
      if (o.eslik) oturt34_(o.eslik, sandalyeYeri(o.masa.yer, yon, 2, 1), o.masa);
      return;
    }
    oturt_(o.kisi, o.masa.yer.x - (o.eslik ? 3 : 0), o.masa);
    o.kisi.el.style.zIndex = String(Math.round(o.masa.yer.y * 10) + 1);
    if (o.eslik) {
      oturt_(o.eslik, o.masa.yer.x + 5, o.masa);
      o.eslik.el.style.zIndex = o.kisi.el.style.zIndex;
    }
  };

  const oturt = async (k: Kapida, masa: Masa) => {
    if (!bekleyen.includes(k) || masa.oturan) return;
    bekleyendenCikar(k);
    const o: Oturan = { plan: k.plan, m: k.m, kisi: k.kisi, eslik: k.eslik, masa, durum: 'yuruyor', adisyon: null, balon: null };
    masa.oturan = o;
    ipucuGuncelle();
    // masanın arkasına yürür (yolda masaların önünden geçer)
    if (S34) {
      const s0 = sandalyeYeri(masa.yer, yon, 2, 0);
      const s1 = sandalyeYeri(masa.yer, yon, 2, 1);
      await Promise.all([yuru(k.kisi, s0.x, s0.y, 24), k.eslik ? yuru(k.eslik, s1.x, s1.y, 24) : null]);
    } else {
      k.kisi.el.style.zIndex = '950';
      if (k.eslik) k.eslik.el.style.zIndex = '950';
      await Promise.all([k.kisi.yuru(masa.yer.x - (k.eslik ? 3 : 0), masa.yer.y - 0.4, 24), k.eslik?.yuru(masa.yer.x + 5, masa.yer.y - 0.4, 24)]);
    }
    if (kapandi) return;
    oturuYerlestir(o);
    if (masa.kirli) void kinoIs(() => kirliTopla(masa));
    void k.kisi.oynat('hop', 380);
    o.durum = 'istiyor';
    await kisiSoyle(k.kisi, k.m, musteriSozu(k.m, 'selam'));
    if (kapandi || masa.oturan !== o) return;
    // istek balonu
    const balon = h('div.rs-balon', { 'data-tur': k.plan.istek.tur }, istekResmi(k.plan.istek));
    o.balon = balon;
    k.kisi.el.append(balon);
    if (S34) {
      // §7e balon ailesi (balon-ikon-durum): çizim varsa beyaz balon resmi; yeri yüzü örtmez, sahneden taşmaz
      const bz = varlik('balon/balon-sag');
      if (bz) {
        balon.dataset.resimli = '1';
        balon.prepend(h('img.rs-balon-zemin', { src: bz, alt: '', draggable: 'false' }));
      }
      balonYerlestir(balon, k.kisi.el, sahne, k.kisi.olcu);
    }
    sesler.cal('pit');
    const i = k.plan.istek;
    void minoSoyle(i.tur === 'ipuclu' ? L.mino.ipucu[i.ipucu] : i.tur === 'surpriz' ? L.mino.istek.surpriz : L.mino.istek.resimli);
    void kinoIs(() => siparisAl(o));
  };

  const siparisAl = async (o: Oturan) => {
    if (o.masa.oturan !== o) return;
    const yan = masaYani(o.masa);
    await kinoYuru(yan.x, yan.y);
    kino.poz('yaz');
    void kino.oynat('hop', 380);
    void kisiSoyle(kino, null, hizmet === 0 ? L.kino.hosgeldin : L.kino.yaziyorum, true);
    await bekle(700);
    if (o.masa.oturan !== o || kapandi) return;
    o.adisyon = adisyonAs(o);
    if (o.durum === 'istiyor') o.durum = 'bekliyor';
    kino.poz('giris');
    ipucuGuncelle();
    await kinoYerine();
  };

  // ---------------------------------------------------------------- adisyon ipi
  const adisyonAs = (o: Oturan): HTMLElement => {
    const i = o.plan.istek;
    const kart = h(
      'div.rs-adisyon',
      { 'data-masa': String(o.masa.i), style: `--rs-masa-renk:${MASA_RENK[o.masa.i]}` },
      h('span.rs-mandal'),
      h('span.rs-adisyon-resim', {}, istekResmi(i)),
      i.tur === 'resimli' || i.tur === 'ozel' ? yolHaritasi(i.tarif) : null,
    );
    ip.append(kart);
    salonSes.vuu();
    try {
      kart.animate([{ transform: 'translateY(160%) scale(0.6)', opacity: 0 }, { transform: 'translateY(-10%) scale(1.05)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: sure(520), easing: 'ease-out' });
    } catch {
      /* yok say */
    }
    return kart;
  };

  // ---------------------------------------------------------------- tepsi ve hazır tabaklar
  const tepsiIc = tepsiEl.querySelector('.rs-tepsi-ic') as HTMLElement;
  const urunGorsel = (u: Urun) => {
    try {
      return u.gorsel();
    } catch {
      return h('span.rs-urun-yedek');
    }
  };
  const tepsiCiz = () => {
    tepsiIc.replaceChildren(...tepsi.map((u) => h('div.rs-tepsi-urun', { 'data-tur': u.tur }, urunGorsel(u))));
    tepsiEl.dataset.adet = String(tepsi.length);
  };
  const hazirTabakKoy = (u: Urun) => {
    const t = h('div.rs-hazir', { 'data-tur': u.tur, 'data-id': u.id }, urunGorsel(u));
    pencere.append(t);
    sesler.cal('zil');
    try {
      t.animate([{ transform: 'translateY(-30%) scale(0.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: sure(360), easing: 'ease-out' });
    } catch {
      /* yok say */
    }
    const kaldir = surukleBagla(t, el, {
      acik: () => t.isConnected && !t.classList.contains('rs-gidiyor'),
      birak: (x, y) => {
        if (personel?.birak(u, x, y)) {
          kaldir();
          t.remove();
          return true;
        }
        if (ustunde(kino.el, x, y, 30)) {
          kaldir();
          void kinoyaVer(u, t);
          return true;
        }
        const masa = masalar.find((m) => m.oturan && (m.oturan.durum === 'bekliyor' || m.oturan.durum === 'istiyor') && ustunde(m.el, x, y, 20));
        if (!masa) {
          // boş masaya ya da yiyen birine: tabak geri döner (ceza yok)
          sesler.cal('yanlis', { guc: 0.6 });
          return false;
        }
        kaldir();
        t.remove();
        void servisEt(u, masa);
        return true;
      },
      dokun: () => {
        kaldir();
        if (personel?.ver(u, t)) return;
        void kinoyaVer(u, t);
      },
    });
    ipucuGuncelle();
  };

  /** Kino tabağı alır, masaya taşır: tabağa uyan isteği bekleyen masa (yoksa en uzun bekleyen) */
  const kinoyaVer = async (u: Urun, t: HTMLElement) => {
    t.classList.add('rs-gidiyor');
    await kinoIs(async () => {
      const bekleyenler = masalar.filter((m) => m.oturan && (m.oturan.durum === 'bekliyor' || m.oturan.durum === 'istiyor'));
      t.remove();
      if (!bekleyenler.length) {
        // kimse beklemiyor: tabak pencerede kalır
        void kino.oynat('bak', 500);
        hazirTabakKoy(u);
        return;
      }
      const uyan = bekleyenler.find((m) => tepkiHesapla(m.oturan!.m, m.oturan!.plan.istek, u).neden !== 'istek') ?? bekleyenler[0];
      uyan.oturan!.durum = 'bekliyor';
      kinoTepsi.replaceChildren(urunGorsel(u));
      kino.el.classList.add('rs-tasiyor');
      kino.poz('tepsi');
      void kisiSoyle(kino, null, hizmet === 0 ? L.kino.geliyor : undefined, true);
      const yan = masaYani(uyan);
      // gizli sürpriz §9.7: tabakta patates varsa yolun yarısında bir tane alabilir
      if (patatesVar(u) && surpriz) {
        await kinoYuru((kino.konum.x + yan.x) / 2, (kino.konum.y + yan.y) / 2);
        await surpriz.patates(u);
      }
      await kinoYuru(yan.x, yan.y);
      kino.el.classList.remove('rs-tasiyor');
      kinoTepsi.replaceChildren();
      kino.poz('koy');
      if (uyan.oturan && (uyan.oturan.durum === 'bekliyor' || uyan.oturan.durum === 'istiyor')) {
        void kisiSoyle(kino, null, hizmet === 0 ? L.kino.afiyet : undefined, true);
        void servisEt(u, uyan);
      } else hazirTabakKoy(u);
      await bekle(300);
      kino.poz('giris');
      await kinoYerine();
    });
  };

  // ---------------------------------------------------------------- servis, yeme, tepki, hesap
  const servisEt = async (u: Urun, masa: Masa) => {
    const o = masa.oturan;
    if (!o) return;
    o.durum = 'yiyor';
    o.balon?.remove();
    o.balon = null;
    if (o.adisyon) {
      const a = o.adisyon;
      o.adisyon = null;
      try {
        a.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-40%)' }], { duration: sure(300) }).finished.then(
          () => a.remove(),
          () => a.remove(),
        );
      } catch {
        a.remove();
      }
    }
    if (masa.kirli) yigin.ekle(masa.kirli.dataset.yemek ?? 'tabak');
    masa.kirli?.remove();
    masa.kirli = null;
    const tabak = h('div.rs-masa-tabak', { 'data-tur': u.tur, 'data-yemek': u.yemek ?? u.tur }, urunGorsel(u));
    tabak.dataset.s34 = S34 ? '1' : '';
    masa.ust.append(tabak);
    sesler.cal('pof', { guc: 0.6 });
    ipucuGuncelle();
    const sonuc = tepkiHesapla(o.m, o.plan.istek, u);
    tepkiGunlugu.push({ musteri: o.m.id, istek: o.plan.istek.tur, tepki: sonuc.tepki, neden: sonuc.neden, yemek: yemekTani(u) });
    const yeniKesif = !!(sonuc.sevdigi && !(kayit.pano[o.m.id] ?? []).includes(sonuc.sevdigi));
    await yemekYe(o, tabak, sonuc);
    if (kapandi) return;
    await tepkiVer(o, sonuc, yeniKesif);
    if (kapandi) return;
    // hesap
    const { taban, bahsis } = odeme(sonuc.tepki, yas);
    masa.jeton += taban + bahsis;
    jetonCiz(masa, bahsis);
    tabak.classList.add('rs-kirli');
    masa.kirli = tabak;
    // P6: çocuk kirli tabağı kendisi de lavaboya götürebilir (Bulaşık yığını)
    yigin.kirliBagla(tabak, u.yemek ?? u.tur, () => {
      if (masa.kirli === tabak) masa.kirli = null;
    });
    hizmet++;
    if (sonuc.tepki === 'bayildi' && sonuc.sevdigi) {
      const p = (kayit.pano[o.m.id] ??= []);
      if (!p.includes(sonuc.sevdigi)) {
        p.push(sonuc.sevdigi);
        // keşif ödülü: polaroid mutfak panosuna asılır (pano.ts)
        panoCiz(pano, kayit.pano, o.m.id);
      }
    }
    kayit.gorulen = [...kayit.gorulen.filter((x) => x !== o.m.id), o.m.id].slice(-16);
    kaydet();
    ipucuGuncelle();
    await musteriGit(o);
  };

  const yemekYe = async (o: Oturan, tabak: HTMLElement, sonuc: TepkiSonuc) => {
    if (sonuc.neden === 'bos') {
      // görünmez yemek: boş tabağa bakar, Kino'ya bakar, güler
      o.kisi.ifade('saskin', 1200);
      await o.kisi.oynat('bak', 700);
      await bekle(400);
      return;
    }
    o.kisi.poz('ye');
    o.eslik?.poz('ye');
    for (let i = 0; i < 3; i++) {
      salonSes.cigne();
      void o.eslik?.oynat('ye', 900);
      await o.kisi.oynat('ye', 900);
      tabak.dataset.adim = String(i + 1);
      await bekle(250);
    }
  };

  const efekt = (k: Kisi, tur: string, adet = 3) => {
    const e = h('div.rs-efekt', { 'data-efekt': tur }, ...Array.from({ length: adet }, (_, i) => h('i', { style: `--i:${i}` })));
    k.el.append(e);
    window.setTimeout(() => e.remove(), TEST_MODU ? 50 : 1900);
  };

  let ilkKomik = true;
  let ilkMmm = true;
  const tepkiVer = async (o: Oturan, s: TepkiSonuc, yeniKesif: boolean) => {
    const k = o.kisi;
    o.masa.el.dataset.tepki = s.tepki;
    if (s.tepki === 'bayildi') {
      k.poz('bayildi');
      k.ifade('keyif', 1800);
      efekt(k, 'kalp', 4);
      salonSes.bayildi();
      void o.eslik?.oynat('sevin', 900);
      await Promise.all([k.oynat('sevin', 900), kisiSoyle(k, o.m, musteriSozu(o.m, 'bayildi'))]);
      hud?.kalp('bayildi', k.el);
      await minoSoyle(yeniKesif ? L.mino.tepki.kesif : L.mino.tepki.bayildi);
    } else if (s.tepki === 'mmm') {
      hud?.kalp('mmm', k.el);
      k.ifade('mutlu', 1400);
      efekt(k, 'yildiz', 2);
      salonSes.mmm();
      void o.eslik?.oynat('hop', 500);
      await k.oynat('hop', 500);
      if (ilkMmm) await minoSoyle(L.mino.tepki.mmm);
      ilkMmm = false;
      await bekle(500);
    } else {
      k.poz('sasir');
      k.ifade('saskin', 700);
      salonSes.komik();
      await k.oynat('titre', 500);
      k.poz('eksi');
      k.ifade('eksi', 900);
      efekt(k, s.neden === 'bos' ? 'soru' : o.m.gag, 3);
      await bekle(900);
      k.ifade('keyif', 1200);
      void o.eslik?.oynat('hop', 500);
      // yıkanmamış sebze: ceza değil, şaka ("Hmm, biraz toprak tadı var!")
      await kisiSoyle(k, o.m, s.neden === 'sevmez' ? musteriSozu(o.m, 'komik') : s.neden === 'toprak' ? L.musteri_tepki.toprak : undefined);
      if (s.neden === 'bos') await minoSoyle(L.mino.tepki.bos);
      else if (ilkKomik || s.neden === 'istek') await minoSoyle(L.mino.tepki.komik);
      ilkKomik = false;
    }
    delete o.masa.el.dataset.tepki;
    k.poz('otur');
  };

  const jetonResmi = () => varlik('efekt/jeton') ?? yeniden('pasta/jeton-1');
  const jetonCiz = (masa: Masa, bahsis: number) => {
    const kap = masa.hesap.querySelector('.rs-hesap-jetonlar') as HTMLElement;
    const u = jetonResmi();
    kap.replaceChildren(
      ...Array.from({ length: masa.jeton }, (_, i) =>
        h(`span.rs-jeton${i >= masa.jeton - bahsis ? '.rs-bahsis' : ''}`, { style: `--i:${i}` }, u ? h('img', { src: u, alt: '', draggable: 'false' }) : null),
      ),
    );
    masa.hesap.classList.toggle('rs-dolu', masa.jeton > 0);
    sesler.cal('ting', { guc: 0.5 });
  };

  let sayiyor = false;
  const hesapTopla = async (masa: Masa) => {
    if (!masa.jeton || sayiyor) return;
    sayiyor = true;
    const n = masa.jeton;
    masa.jeton = 0;
    const jetonlar = [...masa.hesap.querySelectorAll<HTMLElement>('.rs-jeton')];
    for (let i = 0; i < n; i++) {
      const j = jetonlar[i];
      if (j) await jetonUcur(j);
      salonSes.jeton(i);
      gunJeton++;
      kayit.jeton++;
      kasaCiz();
      const soz = (L.mino.say as Record<string, string>)[String(i + 1)];
      if (soz) await minoSoyle(soz);
    }
    masa.hesap.classList.remove('rs-dolu');
    kaydet();
    sayiyor = false;
    ipucuGuncelle();
    gunSonuDenetle();
  };
  const jetonUcur = async (j: HTMLElement) => {
    const a = j.getBoundingClientRect();
    const b = kasa.getBoundingClientRect();
    const kr = el.getBoundingClientRect();
    const u = h('span.rs-ucan-jeton', { style: `left:${a.left - kr.left}px;top:${a.top - kr.top}px;width:${a.width}px;height:${a.height}px` }, j.firstElementChild?.cloneNode(true) ?? null);
    j.remove();
    el.append(u);
    const dx = b.left + b.width / 2 - a.left - a.width / 2;
    const dy = b.top + b.height * 0.3 - a.top;
    try {
      await u.animate([{ transform: 'none' }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(1.1)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) scale(0.7)` }], { duration: sure(420), easing: 'ease-in-out' }).finished;
    } catch {
      /* yok say */
    }
    u.remove();
    kasa.classList.remove('rs-hopla');
    void kasa.offsetWidth;
    kasa.classList.add('rs-hopla');
    // 3/4: kasa sahnede bir eşya; jeton kasaya girince HUD'daki sandık bir kez hoplar
    window.setTimeout(() => hud?.sandik(true), TEST_MODU ? 0 : 220);
  };
  const kasaCiz = () => {
    const y = kasa.querySelector('.rs-kasa-yigin') as HTMLElement;
    y.style.setProperty('--rs-yigin', String(Math.min(12, kayit.jeton)));
    kasa.dataset.jeton = String(kayit.jeton);
    hud?.sandik(false);
  };
  kasaCiz();
  /** P6: bulaşık yıkanınca Babaanne'nin bahşiş jetonu lavabodan kasaya uçar */
  const bahsisVer = (n: number) => {
    yigin.yikandi(n);
    if (!n) return;
    kayit.jeton += 1;
    gunJeton += 1;
    kaydet();
    const lav = istDugme.lavabo;
    const r = lav?.getBoundingClientRect();
    const kr = el.getBoundingClientRect();
    if (r && r.width) {
      const ju = jetonResmi();
      const j = h('span.rs-jeton.rs-bahsis.rs-bahsis-ucan', { style: `position:absolute;left:${r.left - kr.left + r.width / 2 - 15}px;top:${r.top - kr.top}px;width:30px;height:30px;z-index:960` }, ju ? h('img', { src: ju, alt: '', draggable: 'false' }) : null);
      el.append(j);
      void jetonUcur(j).then(() => {
        salonSes.jeton(0);
        kasaCiz();
      });
    } else kasaCiz();
    void minoSoyle(surprizJson.mino.bahsis);
  };

  const musteriGit = async (o: Oturan) => {
    o.durum = 'gidiyor';
    o.kisi.otur(false);
    o.eslik?.otur(false);
    o.kisi.el.style.zIndex = '950';
    if (o.eslik) o.eslik.el.style.zIndex = '950';
    o.kisi.poz('selam');
    void o.kisi.oynat('hop', 400);
    await kisiSoyle(o.kisi, o.m, musteriSozu(o.m, 'gule'));
    if (kapandi) return;
    if (S34) await Promise.all([yuru(o.kisi, Y34.giris.x, Y34.giris.y, 26), o.eslik ? yuru(o.eslik, Y34.giris.x, Y34.giris.y, 26) : null]);
    else await Promise.all([o.kisi.yuru(Y.kapi.x, Y.kapi.y + 20, 26), o.eslik?.yuru(Y.kapi.x, Y.kapi.y + 20, 26)]);
    o.masa.oturan = null;
    sonBosalma = performance.now();
    o.kisi.kapat();
    o.eslik?.kapat();
    ipucuGuncelle();
    // Kino kirli tabağı toplar (yeni müşteri gelmeden)
    void kinoIs(() => kirliTopla(o.masa));
    gunSonuDenetle();
  };

  const kirliTopla = async (masa: Masa) => {
    if (!masa.kirli) return;
    const yan = masaYani(masa);
    await kinoYuru(yan.x, yan.y);
    kino.poz('tabaklar');
    if (!masa.kirli) return void (await kinoYerine());
    // kirli tabak lavabodaki yığına (Bulaşık, isteğe bağlı)
    yigin.ekle(masa.kirli.dataset.yemek ?? 'tabak');
    masa.kirli?.remove();
    masa.kirli = null;
    sesler.cal('tik');
    void kisiSoyle(kino, null, hizmet === 1 ? L.kino.toplarim : undefined, true);
    await kinoYerine();
    kino.poz('giris');
  };

  // ---------------------------------------------------------------- istasyonlar
  const arkaIsler = new Map<string, { is: ArkaIs; ist: Istasyon; dongu: { guc(g: number): void; dur(): void } | null }>();
  const bekleyenIstek = (): Istek | undefined => masalar.map((m) => m.oturan).find((o) => o && (o.durum === 'bekliyor' || o.durum === 'istiyor'))?.plan.istek;
  const raf = (ist: Istasyon): Malzeme[] => {
    const menuMalzeme = [...new Set(menu.flatMap((t) => TARIFLER[t].malzemeler))];
    if (ist === 'tezgah') return SEBZE_RAF.filter((m) => menuMalzeme.includes(m));
    if (ist === 'ocak') return (['yumurta', 'tuz', 'pulbiber'] as Malzeme[]).filter((m) => m !== 'pulbiber' || yas === 'buyuk');
    if (ist === 'servis') return GARNITUR.filter((m) => m !== 'bal' || menuMalzeme.includes('bal'));
    return menuMalzeme;
  };
  /** İstasyonda birden çok açık oyun: istasyonun üstünde alet düğmeleri (simge), çocuk seçer; bekleyen isteğin yolundakiler önce */
  let secimEl: HTMLElement | null = null;
  const secimKapat = () => {
    secimEl?.remove();
    secimEl = null;
  };
  const istasyonaGir = (ist: Istasyon) => {
    if (istasyon || gunBitti) return;
    secimKapat();
    // e2e: &deneme=1 çekirdek akışı deneme mini oyunuyla sınar (gerçek mini oyunların kendi testleri var)
    const oyunlar = DENEME_ZORLA ? [] : istasyonAcikOyunlari(ist);
    if (oyunlar.length > 1) {
      const istek = bekleyenIstek();
      const yol = istek && (istek.tur === 'resimli' || istek.tur === 'ozel') ? (TARIFLER[istek.tarif]?.yol ?? []) : [];
      const sirali = [...oyunlar].sort((a, b) => Number(!yol.includes(a.ad)) - Number(!yol.includes(b.ad)));
      const d = istDugme[ist]!;
      secimEl = h(
        'div.rs-oyun-secim',
        { style: `left:${d.style.left};top:${d.style.top};width:${d.style.width}` },
        ...sirali.map((o) => {
          const b = h('button.rs-oyun-secim-dugme', { type: 'button', 'data-oyun': o.ad, 'aria-label': o.ad }, o.simge?.() ?? h('span.rs-oyun-secim-yok'));
          if (arkaIsler.has(`${ist}:${o.ad}`)) b.classList.add('rs-pisiyor');
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            secimKapat();
            oyunuAc(ist, o);
          });
          return b;
        }),
      );
      katman.append(secimEl);
      sesler.cal('pit');
      return;
    }
    oyunuAc(ist, oyunlar[0] ?? (DENEME_ZORLA ? null : istasyonOyunlari(ist)[0]) ?? denemeIcin(ist));
  };
  el.addEventListener('pointerdown', (e) => {
    if (secimEl && !(e.target as HTMLElement).closest('.rs-oyun-secim, .rs-ist')) secimKapat();
  });
  const oyunuAc = (ist: Istasyon, oyun: MiniOyun) => {
    const arkaAnahtar = `${ist}:${oyun.ad}`;
    const arkaVar = arkaIsler.get(arkaAnahtar);
    if (arkaVar) {
      arkaVar.dongu?.dur();
      arkaIsler.delete(arkaAnahtar);
      istDugme[ist]?.classList.remove('rs-pisiyor', 'rs-buharli');
    }
    const istek = bekleyenIstek();
    const girdi: MiniGirdi = {
      yas,
      tarif: istek && (istek.tur === 'resimli' || istek.tur === 'ozel') ? istek.tarif : undefined,
      malzemeler: raf(ist),
      tepsi: tepsi.slice(),
      ozelIstek: istek?.tur === 'ozel' ? istek.ozel : undefined,
      devam: arkaVar?.is.durum,
      ilkOyun: kayit.gun === 0 && hizmet < 2,
      // zincir: lavabo açıksa (Gün 2'den) yıkanmamış sebze topraklı sayılır
      yikama: acikOyunlar.has('yika'),
      test: TEST_MODU,
      kirliTabaklar: oyun.ad === 'bulasik' ? yigin.turler() : undefined,
    };
    merdiven.hedef(null);
    sesler.cal('hop');
    istasyon = istasyonAc(el, {
      oyun,
      girdi,
      tepsiyeAlindi: (gelen) => {
        istasyon = null;
        // Bulaşık: yemek değil; yığından düşer, Babaanne'nin bahşişi kasaya
        const bulasik = gelen.filter((u) => u.tur === 'bulasik') as (Urun & { temiz?: number })[];
        const urunler = gelen.filter((u) => u.tur !== 'bulasik');
        for (const bu of bulasik) bahsisVer(bu.temiz ?? 0);
        const kullanilan = new Set(urunler.flatMap((u) => u.kullanilan ?? []));
        tepsi = tepsi.filter((u) => !kullanilan.has(u.id));
        for (const u of urunler) {
          if (u.servis) hazirTabakKoy(u);
          else tepsi.push(u);
        }
        tepsiCiz();
        if (urunler.length) {
          tepsiEl.classList.remove('rs-hopla');
          void tepsiEl.offsetWidth;
          tepsiEl.classList.add('rs-hopla');
        }
        ipucuGuncelle();
      },
      geriDonuldu: (a) => {
        istasyon = null;
        if (a) {
          let dongu: { guc(g: number): void; dur(): void } | null = null;
          try {
            const s = a.isaret().ses;
            if (s !== 'yok') {
              dongu = sesler.dongu(s);
              dongu.guc(0.35);
            }
          } catch {
            /* yok say */
          }
          arkaIsler.set(arkaAnahtar, { is: a, ist, dongu });
          istDugme[ist]?.classList.add('rs-pisiyor');
        }
        ipucuGuncelle();
      },
    });
  };
  // arka plandaki işlerin işaretleri (buhar, ses) saniyede bir
  const isaretZaman = window.setInterval(() => {
    for (const [, a] of arkaIsler) {
      try {
        const i = a.is.isaret();
        if (i.surpriz) surpriz?.bildir(i.surpriz);
        const d = istDugme[a.ist];
        d?.classList.toggle('rs-buharli', i.buhar);
        if (d) d.dataset.pisme = i.pisme ?? '';
        a.dongu?.guc(istasyon ? 0.12 : 0.35);
      } catch {
        /* yok say */
      }
    }
  }, 1000);

  // ---------------------------------------------------------------- akış zamanlayıcısı
  const aralik = () => (TEST_MODU ? 200 : plan.aralikMs);
  let basladi = performance.now();
  const akis = window.setInterval(() => {
    if (kapandi || gunBitti || !acik) return;
    const kapida = ilkKapida();
    const simdi = performance.now();
    if (S34) {
      // 3/4 sıra: 3-4 yaşta sıranın başındaki 10 sn dokunulmazsa kendisi boş masaya geçer (5-6 bekler; ipucu merdiveni)
      const sure34 = SIRA_TEST_SINIR ? 400 : yas === 'kucuk' ? (TEST_MODU ? 1500 : 10_000) : Infinity;
      if (kapida?.uye?.hazir && simdi - kapida.uye.zaman > sure34 && !el.querySelector('.rs-hayalet')) {
        const bos = masalar.filter((m) => !m.oturan).sort((a, b) => Math.abs(a.yer.x - kapida.kisi.konum.x) + Math.abs(a.yer.y - kapida.kisi.konum.y) - Math.abs(b.yer.x - kapida.kisi.konum.x) - Math.abs(b.yer.y - kapida.kisi.konum.y))[0];
        if (bos) void oturt(kapida, bos);
      }
      // sıraya gelen: ilk müşteri hemen, sonra sıra boş ve masa varsa kısa, yoksa günün aralığıyla; sıra en çok 3 + 2
      const bosMasa = masalar.some((m) => !m.oturan);
      const ilk34 = siradaki === 0 && simdi - basladi > (TEST_MODU ? 100 : 1600);
      const ara = !bekleyen.length && bosMasa ? (TEST_MODU ? 100 : 1600) : aralik();
      const sonraki34 = siradaki > 0 && simdi - sonGelis > ara;
      const sinir = SIRA_TEST_SINIR ?? KAPASITE;
      // test modu (eski testlerle uyumlu): eski sahnedeki gibi aynı anda en çok plan.ayniAnda müşteri, boş masa varken
      const eskiGibi = SIRA_TEST_SINIR !== null ? masadaki() < plan.ayniAnda && bosMasa : true;
      if (siradaki < plan.musteriler.length && bekleyen.length < sinir && eskiGibi && (ilk34 || sonraki34)) {
        sonGelis = simdi;
        void musteriGetir();
      }
      return;
    }
    // kapıda bekleyen 4 sn dokunulmazsa kendisi en yakın boş masaya oturur
    if (kapida?.hazir && simdi - kapida.zaman > (TEST_MODU ? 400 : 4000) && !el.querySelector('.rs-hayalet')) {
      const bos = masalar.filter((m) => !m.oturan).sort((a, b) => Math.abs(a.yer.x - Y.bekleme.x) - Math.abs(b.yer.x - Y.bekleme.x))[0];
      if (bos) void oturt(kapida, bos);
    }
    const ilk = siradaki === 0 && simdi - basladi > (TEST_MODU ? 100 : 1600);
    const sonraki = siradaki > 0 && simdi - sonBosalma > aralik();
    if (!bekleyen.length && siradaki < plan.musteriler.length && masadaki() < plan.ayniAnda && masalar.some((m) => !m.oturan) && (ilk || sonraki)) {
      sonBosalma = simdi;
      void musteriGetir();
    }
  }, 250);

  const gunSonuDenetle = () => {
    if (gunBitti || personel || siradaki < plan.musteriler.length || bekleyen.length || masalar.some((m) => m.oturan)) return;
    // 5-6: personel yemeği (isteğe bağlı; "Kapalı" levhası her an kapatır). &personel=0 kapatır.
    if (yas === 'buyuk' && !personelOldu && new URLSearchParams(location.search).get('personel') !== '0') {
      personelOldu = true;
      personel = personelBaslat({
        el,
        katman,
        kino,
        minoEl,
        mino,
        masalar: () => masalar,
        kapi: () => Y.kapi,
        kinoIs,
        kinoYerine,
        kinoYuru,
        minoSoyle,
        kinoSoyle: (t) => kisiSoyle(kino, null, t, true),
        yeniKisi,
        oturt: (k, x, m) => oturtKisi(k, x, m as Masa),
        zSira,
        bitti: () => {
          personel = null;
          gunSonuDenetle();
        },
        kapandi: () => kapandi,
      });
      return;
    }
    gunBitti = true;
    window.setTimeout(() => void gunuKapat(), TEST_MODU ? 50 : 900);
  };

  const gunuKapat = async () => {
    // toplanmamış jetonlar kendiliğinden kasaya kayar
    for (const m of masalar) {
      if (!m.jeton) continue;
      const n = m.jeton;
      m.jeton = 0;
      for (const j of m.hesap.querySelectorAll<HTMLElement>('.rs-jeton')) await jetonUcur(j);
      m.hesap.classList.remove('rs-dolu');
      gunJeton += n;
      kayit.jeton += n;
      salonSes.jeton(n);
    }
    kasaCiz();
    kayit.gun += 1;
    kayit.menu = menu;
    kaydet();
    merdiven.hedef(null);
    await kinoZincir;
    // 3/4 (§7e): gün sonunda Kino kapıya yürür, kapıdaki levhayı çevirir (kino-34-yuru 'levha' karesi)
    if (S34 && varlik('kisi/kino/levha') && !kapandi) {
      await kinoYuru(Y34.yol.kapiIc?.x ?? Y.kapi.x + 4, Y34.yol.kapiIc?.y ?? Y.kapi.y);
      aynala(kino, true);
      kino.poz('levha');
      salonSes.kapi();
      await kino.oynat('hop', 420);
      await bekle(700);
      aynala(kino, false);
      kino.poz('giris');
    }
    if (bahcede) kaydir(false);
    secimKapat();
    gunSonu = gunSonuAc(el, {
      gunJeton,
      yas,
      gun,
      durum: kayit,
      kok: app.kok,
      oynanabilir: tarifOynanabilir,
      soyle: minoSoyle,
      kasaDegisti: () => {
        kaydet();
        kasaCiz();
      },
      alindi,
      yarin: () => {
        // Gün 3 ve sonrası abonelikle (§6d): kilitliyse kilit ekranı açılır, çocuk defterde kalır
        if (!erisimVarMi(`restoran/gun-${kayit.gun + 1}`, app.kok)) return;
        app.git('lokanta', {});
      },
    });
  };

  // ---------------------------------------------------------------- defterden alınanlar (P4)
  let gunSonu: GunSonu | null = null;
  const D = defterJson;
  /** Tarifin mini oyunları yazılmış mı (P3/P5 geldikçe defterde kendiliğinden görünür); &deneme=1'de hepsi */
  const tarifOynanabilir = (t: string) => DENEME_ZORLA || (TARIFLER[t]?.yol ?? []).every((o) => !!oyunBul(o));
  const alindi = async (k: DefterKalemi, sonuc: AlimSonucu) => {
    kaydet();
    if (k.sekme === 'tarif') {
      // aleti yarın sabah mutfakta (yeni istasyonsa kendi yuvasında); tarif menü tahtasına, bir müşteri ister
      await minoSoyle(sonuc.istasyon ? D.mino.yeni_alet : D.mino.yeni_tarif);
      return;
    }
    if (k.sekme === 'bolum') {
      if (S34 && kayit.acilan.bolum.includes('bahce')) {
        // 3/4: aynı resmin bahçeli sürümüne çapraz geçiş (içerisi piksel piksel aynı; ekran kaymaz)
        bahceAcik = true;
        arka34Ciz(arka, yon, true, varlik, true);
        if (olcu) yerlestir(olcu);
      }
      await minoSoyle(D.mino.bahce);
      return;
    }
    if (k.yer === 'ortu') {
      gunSonu?.gizle(true);
      masalar.forEach((m) => {
        m.el.dataset.ortu = kayit.ortu ?? '';
        if (S34) masaResmi34(m);
      });
      sesler.cal('pof');
      await minoSoyle(L.mino.ortu_tamam);
      await bekle(500);
      gunSonu?.gizle(false);
      return;
    }
    if (!sonuc.yuvalar?.length) return;
    // masa / süs: defter kenara çekilir, çocuk boş yuvalardan birini seçer
    gunSonu?.gizle(true);
    const tur = k.sekme === 'masa' ? 'masa' : k.yer!;
    const sec = yuvaSec(katman, sonuc.yuvalar, tur, yon, undefined, S34 ? (t, y) => (t === 'masa' ? masaYeri34(y) : Y34.sus[y]) : undefined);
    void minoSoyle(D.mino.yer_sec);
    const ipucu = window.setTimeout(() => sec.halkalar().forEach((e) => e.classList.add('rs-kipir')), TEST_MODU ? 50 : 12000);
    const yuva = await sec.secildi;
    clearTimeout(ipucu);
    if (kapandi) return;
    yuvayaKoy(kayit, k.id, yuva);
    kaydet();
    if (k.sekme === 'masa') {
      const m = masaKur(yuva, masalar.length);
      if (olcu) yerlestir(olcu);
      m.el.classList.add('rs-hopla');
      sesler.cal('pof');
      // Kino yeni masayı dener
      const yan = masaYani(m);
      await kinoYuru(yan.x, yan.y);
      void kino.oynat('hop', 420);
      await Promise.all([kisiSoyle(kino, null, D.kino.oturdu, true), minoSoyle(D.mino.yeni_masa)]);
      await kinoYerine();
    } else {
      susleriCiz(susKatman, kayit.yerlesim.sus, yon, S34 ? Y34.sus : undefined);
      susKatman.querySelector(`.rs-sus[data-yuva="${yuva}"]`)?.classList.add('rs-hopla');
      sesler.cal('pof');
      await minoSoyle(D.mino.yerlesti);
    }
    await bekle(400);
    gunSonu?.gizle(false);
  };

  // ---------------------------------------------------------------- sabah: anahtar, menü tahtası, Babaanne
  const babaanneBaglam = (): BabaanneBaglam => ({
    katman,
    // 3/4: kapının önündeki yoldan gelir (y + 20 resmin dışı)
    kapi: S34 ? { x: Y34.sira[0].x, y: Y34.sira[0].y + 4 } : Y.kapi,
    dur: S34 ? Y34.babaanne : { x: yon === 'yatay' ? 46 : 50, y: yon === 'yatay' ? 68 : 58 },
    pencere: S34 ? { x: Y34.kino.x - 4, y: Y34.kino.y } : { x: Y.pencere.x - 3, y: Y.kino.y },
    kapiEl: kapi,
    kapandi: () => kapandi,
  });
  const sabah = async () => {
    if (!kayit.ilkOyun && ilkGun && ANAHTAR_TOREN) {
      await anahtarTeslim(babaanneBaglam());
      if (kapandi) return;
      kayit.ilkOyun = true;
      kaydet();
    }
    // menü tahtası: bugün hangi yemekler (seçim yoksa kendiliğinden yerleşir)
    const mt = menuTahtasi(el, { yas, acik: acikTarifler, dunku: kayit.menu, yeni: yeniTarif, soyle: minoSoyle });
    menu = await mt.bitti;
    if (kapandi) return;
    hud?.menuCiz();
    plan = planKur();
    kayit.menu = menu;
    if (yeniTarif) {
      kayit.yeniTarif = null;
      kaydet();
      if (menu.includes(yeniTarif)) await yeniTarifTadi(babaanneBaglam());
      if (kapandi) return;
    }
    kaydet();
    acik = true;
    basladi = performance.now();
    // Gün 2: Babaanne'nin pazardan gönderdiği çamurlu sebzeler, lavabo (Yıka) açılır
    if (gun === 2 && istasyonAcikOyunlari('lavabo').length) {
      istDugme.lavabo?.classList.add('rs-hopla');
      await minoSoyle(D.mino.yeni_alet);
    }
    void minoSoyle(L.mino.acildi);
  };

  // ---------------------------------------------------------------- gizli sürprizler (P6, surpriz.ts)
  surpriz = surprizKur({
    el,
    katman,
    kapi,
    kino,
    susKatman,
    masalar: () => masalar,
    yon: () => yon,
    u: () => olcu?.u ?? 64,
    kinoIs,
    kinoYuru,
    kinoYerine,
    masaYani: (m) => masaYani(m as Masa),
    kinoSoyle: (t) => kisiSoyle(kino, null, t, true),
    minoSoyle,
    kapida: () => bekleyen.length > 0,
    fotoYer: () => (S34 ? Y34.foto : null),
    acik: () => acik && !gunBitti,
    araya: (p) => {
      if (gunBitti || personel) return false;
      plan.musteriler.splice(siradaki, 0, p);
      return true;
    },
    menu: () => menu,
    istasyon: () => istasyon?.el ?? null,
    kapandi: () => kapandi,
  });
  // mini oyunların gizli sürpriz haberleri (Mangal dumanı: Kino'nun yüzü is)
  el.addEventListener('rs-surpriz', (e) => surpriz?.bildir((e as CustomEvent<{ ad: string }>).detail?.ad ?? ''));

  // ---------------------------------------------------------------- kurulum ve kapanış
  // ---------------------------------------------------------------- HUD (3/4): sağda illüstre ahşap panel
  /** Babaanne'nin Defteri gün içinde: yalnız bakılır, alım akşam */
  let defterAcik: ReturnType<typeof defterAc> | null = null;
  const defterBak = () => {
    if (defterAcik || gunBitti || istasyon) return;
    defterAcik = defterAc(el, {
      yas,
      gun,
      durum: kayit,
      oynanabilir: tarifOynanabilir,
      soyle: minoSoyle,
      kok: app.kok,
      alindi: async () => undefined,
      kasaDegisti: () => kasaCiz(),
      kapandi: () => {
        defterAcik?.kapat();
        defterAcik = null;
      },
      bak: true,
      aksamSozu: HUD_SOZ.mino.aksam,
    });
    defterAcik.el.classList.add('rs-df-bak');
  };
  if (S34) {
    hud = hudKur(el, {
      gun,
      jeton: () => kayit.jeton,
      menu: () => menu,
      minoSoyle,
      defter: defterBak,
      cikis: app.secenekler.cikis ? () => app.secenekler.cikis?.() : null,
      tepsi: tepsiEl,
      kapandi: () => kapandi,
    });
    kasaCiz();
  }
  const olcuBirak = S34 ? olcuIzle34(el, sahne, (o) => yerlestir(o)) : olcuIzle(el, sahne, yerlestir);
  void sabah();
  tepsiCiz();

  // test / gösterim kancası
  (window as unknown as { __rsGun: unknown }).__rsGun = {
    get plan() {
      return plan;
    },
    /** test (P8): Kino'yu yol grafiğiyle bir noktaya yürüt (sahne yüzdesi); masa yerleri */
    kinoYuru: (x: number, y: number) => kinoIs(() => kinoYuru(x, y)),
    masaYerleri: () => masalar.map((m) => ({ ...m.yer, yuva: m.yuva })),
    /** test: günü hemen kapat (kalan müşteriler gelmez) → gün sonu ve defter */
    gunuBitir: () => {
      if ((!TEST_MODU && !document.body.dataset.onizleme) || gunBitti) return;
      gunBitti = true;
      siradaki = plan.musteriler.length;
      for (const k of bekleyen.splice(0)) {
        if (k.uye) sira?.cikar(k.uye);
        k.kisi.kapat();
        k.eslik?.kapat();
      }
      void gunuKapat();
    },
    /** test (P6): müşterileri bitir (gelmeyenler gelmez, oturanlar gider) → gün sonu denetimi; 5-6'da personel yemeği */
    musterileriBitir: () => {
      if ((!TEST_MODU && !document.body.dataset.onizleme) || gunBitti) return;
      siradaki = plan.musteriler.length;
      for (const k of bekleyen.splice(0)) {
        if (k.uye) sira?.cikar(k.uye);
        k.kisi.kapat();
        k.eslik?.kapat();
      }
      for (const m of masalar) {
        if (!m.oturan) continue;
        m.oturan.adisyon?.remove();
        m.oturan.kisi.kapat();
        m.oturan.eslik?.kapat();
        m.oturan = null;
      }
      gunSonuDenetle();
    },
    durum: () => ({
      acik,
      menu,
      masaYuvalari: masalar.map((m) => m.yuva),
      bahcede,
      siradaki,
      kapida: ilkKapida() ? { ad: ilkKapida()!.m.id, hazir: hazirMi(ilkKapida()!) } : null,
      // P8 3/4 sahne
      s34: S34,
      sira: bekleyen.map((k) => ({ ad: k.m.id, hazir: hazirMi(k), yuva: k.uye?.yuva ?? 0 })),
      kalp: hud?.kalpSayisi ?? 0,
      bahceAcik,
      masalar: masalar.map((m) => ({ oturan: m.oturan?.m.id ?? null, durum: m.oturan?.durum ?? null, jeton: m.jeton, kirli: !!m.kirli })),
      tepsi: tepsi.map((u) => u.tur),
      hazir: pencere.querySelectorAll('.rs-hazir').length,
      gunJeton,
      kasa: kayit.jeton,
      hizmet,
      gunBitti,
      istasyon: !!istasyon,
      minoKonusuyor,
      ipucu: merdiven.gelen.slice(),
      tepkiler: tepkiGunlugu.slice(),
      bekleyen: masalar.map((m) => (m.oturan?.durum === 'bekliyor' ? m.oturan.m.id : null)).find(Boolean) ?? null,
      surprizler: surpriz?.gunluk.slice() ?? [],
      yigin: yigin.adet(),
      personel: personel?.durum() ?? null,
      personelOldu,
    }),
  };

  return {
    el,
    kapat() {
      kapandi = true;
      clearInterval(akis);
      clearInterval(isaretZaman);
      merdiven.dur();
      olcuBirak();
      istasyon?.kapat();
      gunSonu?.kapat();
      surpriz?.kapat();
      personel?.kapat();
      for (const [, a] of arkaIsler) a.dongu?.dur();
      mino.kapat();
      kino.kapat();
      for (const m of masalar) {
        m.oturan?.kisi.kapat();
        m.oturan?.eslik?.kapat();
      }
      for (const k of bekleyen) {
        k.kisi.kapat();
        k.eslik?.kapat();
      }
      sira?.kapat();
      hud?.kapat();
      defterAcik?.kapat();
    },
  };
}
