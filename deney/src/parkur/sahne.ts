// Deneyler · Zincirleme Top Parkuru: bir bölümün sahnesi. Fizik motor.ts'te; burası çizimleri yerleştirir, parça çekmecesini
// (yaylanarak açılır, tutulan parça büyür ve gölge alır, yuva yaklaşan parçayı mıknatıs gibi çeker), iri başlat kolunu, kamerayı
// (koşuda topu izler), mekanizmaların kare animasyonlarını, karakter tepkilerini ve sesleri yönetir.
// KALITE-KURALLARI: her dokunuşa 0 ms'de ses ve canlanma; 1 sn'den uzun boşluk yok; açılışta 1 sn içinde ne yapılacağı belli;
// bitiş sevinci en çok 2 sn; karakterler aynı kadrajda canlı; yanlış hamle komik.
import { sesiAc } from '../../../src/audio/ses';
import { Motor, TOP_R, type Kutu, type Mekanizma, type Olay, type Yas } from './motor';
import { B5, B6, DOMINO, KULE, bolum, yerindekiler, type Bolum, type ParcaBilgi } from './bolumler';
import { Degirmen, Kaykay, Koruk, Musluk, Yay } from './mekanizmalar';
import { CEREN_POZLARI, CEREN_YEDEK, KINO_POZLARI, KINO_YEDEK, Kareler, cizim, dizi, resimEl, var_, yuzde, type CerenPoz, type KinoPoz } from './cizimler';
import { dongu, donguleriKapat, efekt, konusuyor, kuyruguBosalt, sesleriYukle, sirayla, soyle, sozuUnut, type Soz } from './ses';

const R = TOP_R;
const AZ_HAREKET = matchMedia('(prefers-reduced-motion: reduce)').matches;
export type Durum = 'kur' | 'donus' | 'kosu' | 'kacti' | 'basari' | 'bitti';
export type SahneAyar = { no: number; yas: Yas; test: boolean; sonraki: () => void; haritaVar: boolean };

/** Bölümün oynanması için gereken çizimler (Y1 bölüm 1; Deney-A1 öbürleri). */
export function bolumCizimleri(b: Bolum): string[] {
  const temel = ['top', 'kol-taban', 'kol-sap', 'yuva', 'domino-kirmizi', 'domino-sari', 'domino-yesil', 'domino-mavi', 'zil', 'zil-calar', 'konfeti',
    'kino-bekle-0', 'kino-bekle-1', 'kino-saskin', 'kino-sevin', 'ceren-bekle', 'ceren-alkis', 'ceren-gul'];
  const fon = b.no === 6 ? ['mega-fon-1', 'mega-fon-2', 'can-kulesi'] : [b.fon];
  return [...temel, ...fon, ...b.parcalar.map((p) => p.cizim)];
}

export function sahneKur(kok: HTMLElement, ayar: SahneAyar) {
  const b: Bolum = bolum(ayar.no);
  const W = b.dunya.w, H = b.dunya.h;
  const eksik = new Set(b.eksik[ayar.yas]);
  const motor = new Motor(b, yerindekiler(b, ayar.yas));
  const yay = motor.mekanizma<Yay>('yay');
  if (yay && b.yayGucu) yay.guc = b.yayGucu[ayar.yas];
  const hazir = bolumCizimleri(b).every(var_);
  kok.replaceChildren();
  kok.dataset.bolum = String(b.no);
  kok.dataset.yas = ayar.yas;
  kok.dataset.durum = 'kur';
  kok.classList.toggle('pk-cizimsiz', !hazir);
  document.body.classList.toggle('pk-test', ayar.test);
  // 1. bölümün tepsisiz fonu (Deney-A1) gelince o: parçalar artık çekmeceden gelir.
  const fonAdi = b.no === 1 && var_('parkur-fon-1b') ? 'parkur-fon-1b' : b.fon;
  kok.style.backgroundImage = b.no === 6 ? 'none' : cizim(fonAdi) ? 'url("' + cizim(fonAdi) + '")' : 'none';
  const yer = (k: Kutu, el: HTMLElement) => yuzde(k, el, W, H);
  const ekle = (el: HTMLElement, k: Kutu) => { yer(k, el); kok.append(el); return el; };
  if (b.no === 6) {
    // Mega zincirin fonu iki yarı.
    ekle(resimEl('mega-fon-1', 'pk-fon-yari'), { x: 0, y: 0, w: 1672, h: H });
    ekle(resimEl('mega-fon-2', 'pk-fon-yari'), { x: 1672, y: 0, w: 1672, h: H });
  }

  // ----- Kamera: dünya ekrandan büyük çizilir, kurarken başta, koşuda topu izler, sevinçte finalde -----
  const KADRAJ = { w: 1672, h: 700, y0: 120, y1: 850 };
  const kamera = { x: 0, y: 0, z: 1, gw: 1672, gh: 941, hedefY: 0 };
  let sarsinti = 0;
  let cekmeceAcik = false;
  const cekmeceBoyu = () => (cekmeceAcik ? cekmece.getBoundingClientRect().height : 0);
  function kameraOlc() {
    const Ws = innerWidth, Hs = innerHeight;
    const zEnAz = Math.max(Ws / Math.min(W, 1672), Hs / H);
    kamera.z = Math.max(zEnAz, Math.min(Ws / KADRAJ.w, Hs / KADRAJ.h));
    kamera.gw = Ws / kamera.z;
    kamera.gh = Hs / kamera.z;
    kok.style.width = W * kamera.z + 'px';
    kok.style.height = H * kamera.z + 'px';
  }
  function kameraUygula(dt: number) {
    // Çekmece açıkken kurulacak yer (y 720'ye kadar) çekmecenin üstünde kalır.
    const altBos = cekmeceBoyu() / kamera.z;
    const ortaY = (KADRAJ.y0 + KADRAJ.y1) / 2 - kamera.gh / 2;
    const hedefY = cekmeceAcik ? Math.max(ortaY, 720 - (kamera.gh - altBos)) : ortaY;
    kamera.y += (Math.max(0, Math.min(H - kamera.gh, hedefY)) - kamera.y) * (1 - Math.exp(-dt * 6));
    let dx = 0, dy = 0;
    if (sarsinti > 0 && !AZ_HAREKET) { const s = sarsinti / 0.35, an = performance.now(); dx = Math.sin(an / 17) * 6 * s; dy = Math.cos(an / 23) * 3 * s; }
    kok.style.translate = -kamera.x * kamera.z + dx + 'px ' + (-kamera.y * kamera.z + dy) + 'px';
  }
  addEventListener('resize', kameraOlc);
  kameraOlc();
  kamera.y = Math.max(0, Math.min(H - kamera.gh, (KADRAJ.y0 + KADRAJ.y1) / 2 - kamera.gh / 2));

  // ----- Karakterler (masanın arkasında; mega zincirde Ceren finalin yanında) -----
  const KINO_KUTU: Kutu = { x: 360, y: 70, w: 520, h: 420 };
  const CEREN_KUTU: Kutu = b.no === 6 ? { x: 2520, y: 30, w: 420, h: 460 } : { x: 1250, y: 30, w: 420, h: 460 };
  const karakter = (sinif: string, kutu: Kutu, pozlar: readonly string[], yedek: Record<string, string>) => {
    const el = document.createElement('div');
    el.className = 'pk-oge ' + sinif;
    ekle(el, kutu);
    const harita = new Map<string, HTMLElement>();
    for (const ad of pozlar) {
      const gercek = var_(ad) ? ad : yedek[ad];
      if (!gercek || harita.has(ad)) continue;
      const mevcut = [...harita.entries()].find(([, e]) => e.dataset.cizim === gercek)?.[1];
      if (mevcut) { harita.set(ad, mevcut); continue; }
      const e = resimEl(gercek, 'pk-poz');
      e.style.cssText = 'left:0;top:0;width:100%;height:100%';
      e.dataset.cizim = gercek;
      el.append(e);
      harita.set(ad, e);
    }
    return { el, harita };
  };
  const kino = karakter('pk-kino', KINO_KUTU, KINO_POZLARI, KINO_YEDEK);
  const ceren = karakter('pk-ceren', CEREN_KUTU, CEREN_POZLARI, CEREN_YEDEK);
  let kinoGeri = 0, cerenGeri = 0;
  function kinoPoz(ad: KinoPoz, sure = 0) {
    kino.el.dataset.poz = ad;
    const hedef = kino.harita.get(ad);
    for (const e of kino.harita.values()) e.classList.toggle('acik', e === hedef);
    clearTimeout(kinoGeri);
    if (sure) kinoGeri = window.setTimeout(() => kinoPoz('kino-bekle-0'), sure);
  }
  function cerenPoz(ad: CerenPoz, sure = 0) {
    ceren.el.dataset.poz = ad;
    const hedef = ceren.harita.get(ad);
    for (const e of ceren.harita.values()) e.classList.toggle('acik', e === hedef);
    clearTimeout(cerenGeri);
    if (sure) cerenGeri = window.setTimeout(() => cerenPoz('ceren-bekle'), sure);
  }
  kinoPoz('kino-bekle-0');
  cerenPoz('ceren-bekle');
  const birKez = (el: HTMLElement | undefined, sinif: string, sure: number) => {
    if (!el) return;
    el.classList.remove(sinif); void el.offsetWidth; el.classList.add(sinif);
    setTimeout(() => el.classList.remove(sinif), sure);
  };
  const tepki = (el: HTMLElement) => birKez(el, 'tepki', 300);
  const karakterDokun = (el: HTMLElement, sevinc: () => void, bekle: () => void) => {
    el.style.pointerEvents = 'auto';
    el.addEventListener('pointerdown', () => {
      sesiAc();
      void sesleriYukle();
      efekt('pit', 0.6);
      tepki(el);
      if (durum !== 'kur' && durum !== 'bitti') return;
      sevinc();
      setTimeout(() => { if (durum === 'kur' || durum === 'bitti') bekle(); }, 700);
    });
  };
  karakterDokun(kino.el, () => kinoPoz('kino-gul'), () => { if (kino.el.dataset.poz === 'kino-gul') kinoPoz('kino-bekle-0'); });
  karakterDokun(ceren.el, () => cerenPoz('ceren-goz'), () => { if (ceren.el.dataset.poz === 'ceren-goz') cerenPoz('ceren-bekle'); });

  // ----- Başlat kolu (Deney-A1'in iri kolu geldiyse o) -----
  const iri = var_('kol-buyuk-taban') && var_('kol-buyuk-sap');
  const KOL = iri
    ? { taban: { x: 15, y: 395, w: 220, h: 250 }, pivot: { x: 125, y: 505 }, sap: { w: 220, h: 320, pivot: { x: 110, y: 300 } }, aci: 55 }
    : KULE.kol;
  ekle(resimEl(iri ? 'kol-buyuk-taban' : 'kol-taban', 'pk-kol-taban'), KOL.taban);
  const kolSap = ekle(resimEl(iri ? 'kol-buyuk-sap' : 'kol-sap', 'pk-kol-sap'), { x: KOL.pivot.x - KOL.sap.pivot.x, y: KOL.pivot.y - KOL.sap.pivot.y, w: KOL.sap.w, h: KOL.sap.h });
  kolSap.style.transformOrigin = (KOL.sap.pivot.x / KOL.sap.w) * 100 + '% ' + (KOL.sap.pivot.y / KOL.sap.h) * 100 + '%';
  const kolTutamak = document.createElement('button');
  kolTutamak.className = 'pk-kol-tutamak';
  kolTutamak.setAttribute('aria-label', 'Kırmızı kolu çek');
  // Topuzun çevresi ve sapın yolu: iri, kolay tutulur (telefonda da 64 px'ten büyük).
  ekle(kolTutamak, { x: Math.max(10, KOL.pivot.x - 100), y: KOL.pivot.y - KOL.sap.pivot.y - 40, w: 200, h: KOL.sap.pivot.y + 60 });

  // ----- Parçalar, yuvalar, mekanizmaların görüntüsü -----
  type Gorsel = { bilgi: ParcaBilgi; el: HTMLElement; kareler?: Kareler; mek?: Mekanizma; yuva?: HTMLElement; yerinde: boolean };
  const gorseller = new Map<string, Gorsel>();
  const kareliCizim: Record<string, [string, number]> = {
    trambolin: ['trambolin-esne', 4], kaykay: ['kaykay-git', 4], yay: ['yay-bas', 4], pota: ['pota-ag', 4], koruk: ['koruk-bas', 3],
  };
  for (const p of b.parcalar) {
    const mek = b.mekanizmalar.find((m) => m.id === p.id);
    const kd = kareliCizim[p.id];
    const kareler = kd ? new Kareler(dizi(kd[0], kd[1]), 'pk-parca pk-' + p.id, p.cizim) : undefined;
    const el = kareler ? kareler.el : resimEl(p.cizim, 'pk-parca pk-' + p.id);
    el.dataset.parca = p.id;
    ekle(el, p.kutu);
    const g: Gorsel = { bilgi: p, el, kareler, mek, yerinde: !eksik.has(p.id) };
    if (eksik.has(p.id)) {
      el.classList.add('pk-gizli');
      const k = p.kutu;
      g.yuva = ekle(resimEl('yuva', 'pk-yuva nabiz'), { x: k.x - 10, y: k.y - 10, w: k.w + 20, h: k.h + 20 });
      g.yuva.dataset.parca = p.id;
      g.yuva.style.pointerEvents = 'auto';
      g.yuva.addEventListener('pointerdown', () => {
        if (g.yerinde || (durum !== 'kur' && durum !== 'kacti')) return;
        sesiAc();
        void basla();
        efekt('tik', 0.6);
        birKez(g.yuva, 'vurgu', 1200);
        birKez(bolmeler.get(p.id), 'zipla', 1300);
        if (!cekmeceAcik) cekmeceAc();
      });
    }
    gorseller.set(p.id, g);
  }
  // Su değirmeni: kovalar dönerken çark resmi döner.
  const cark = gorseller.get('degirmen');
  if (cark) cark.el.style.transformOrigin = '50% 50%';
  // Kaykayın duruşu ve düşüşü (tekerler dönerken git kareleri; takoza vurunca dur; masadan düşerken devrilme).
  const kaykayDur = var_('kaykay-dur') && gorseller.get('kaykay') ? resimEl('kaykay-dur', 'pk-poz') : null;
  const kaykayDus = gorseller.get('kaykay') ? new Kareler(dizi('kaykay-dus', 3), 'pk-poz', 'k2-kaykay') : null;
  if (kaykayDur) { kaykayDur.style.cssText = 'left:0;top:0;width:100%;height:100%'; gorseller.get('kaykay')!.el.append(kaykayDur); }
  if (kaykayDus && !kaykayDus.bos) { kaykayDus.el.style.cssText = 'left:0;top:-60%;width:100%;height:222%'; gorseller.get('kaykay')!.el.append(kaykayDus.el); }
  // Musluk: dik ve devrilmiş kol.
  const muslukKareler = var_('k4-musluk-kol-dus') ? new Kareler(['k4-musluk-kol', 'k4-musluk-kol-dus'], 'pk-musluk-kol') : null;
  if (muslukKareler && gorseller.get('musluk')) { const g = gorseller.get('musluk')!; g.el.replaceWith(muslukKareler.el); yer(g.bilgi.kutu, muslukKareler.el); g.el = muslukKareler.el; g.kareler = muslukKareler; }
  // Akan su ve taşan su (4. bölüm), şişen balon ve kaçan hava (5. bölüm, mega).
  const suAkis = b.no === 4 ? ekle(new Kareler(dizi('su-akis', 4), 'pk-su-akis', 'su-akis-0').el, { x: 1150, y: 255, w: 60, h: 200 }) : null;
  const suTasma = b.no === 4 ? ekle(new Kareler(dizi('su-tasma', 3), 'pk-su-tasma', 'su-tasma-0').el, { x: 1070, y: 640, w: 220, h: 80 }) : null;
  const suSicrama = b.no === 4 ? ekle(new Kareler(dizi('su-sicrama', 3), 'pk-su-sicrama', 'su-sicrama-0').el, { x: 1110, y: 390, w: 160, h: 120 }) : null;
  const balonOrta = b.no === 6 ? B6.balon.orta : B5.balon.orta;
  const balonSis = b.no === 5 || b.no === 6 ? new Kareler(dizi('balon', 5), 'pk-balon-sis', 'k5-balon') : null;
  if (balonSis) ekle(balonSis.el, { x: balonOrta.x - 120, y: balonOrta.y - 120, w: 240, h: 240 });
  const havaKacti = b.no === 5 || b.no === 6 ? new Kareler(dizi('hava-kacti', 3), 'pk-hava-kacti', 'hava-kacti-0') : null;
  if (havaKacti) ekle(havaKacti.el, b.no === 6 ? { x: 2390, y: 560, w: 160, h: 120 } : { x: 880, y: 520, w: 160, h: 120 });
  // 3. bölüm: yayın germe düğmesi (az, orta, çok).
  let yayAyar: HTMLButtonElement | null = null;
  if (yay) {
    yayAyar = document.createElement('button');
    yayAyar.className = 'pk-yay-ayar';
    yayAyar.setAttribute('aria-label', 'Yayın gerginliği');
    for (const g of [1, 2, 3]) {
      const e = resimEl('yay-ayar-' + g, 'pk-poz');
      e.dataset.guc = String(g);
      e.style.cssText = 'left:0;top:0;width:100%;height:100%';
      yayAyar.append(e);
    }
    ekle(yayAyar, { x: 920, y: 560, w: 120, h: 120 });
    const ciz = () => { for (const e of yayAyar!.children) (e as HTMLElement).classList.toggle('acik', (e as HTMLElement).dataset.guc === String(yay.guc)); kok.dataset.yayGucu = String(yay.guc); };
    ciz();
    yayAyar.addEventListener('click', () => {
      if (durum !== 'kur' && durum !== 'kacti' && durum !== 'bitti') return;
      sesiAc();
      yay.guc = ((yay.guc % 3) + 1) as 1 | 2 | 3;
      efekt('tik');
      efekt('yay', 0.4 + 0.2 * yay.guc);
      birKez(gorseller.get('yay')?.el, 'gerildi', 360);
      ciz();
    });
    yayAyar.addEventListener('pointerdown', () => birKez(yayAyar!, 'bas', 240));
  }

  // Dominolar ve final (masa zili ya da çan kulesi).
  const dominoEl = b.dominolar.ortalar.map((x, i) => ekle(resimEl('domino-' + DOMINO.renkler[i % 4], 'pk-domino'), { x: x - 25, y: b.zeminY - 143, w: 50, h: 145 }));
  for (const d of dominoEl) d.style.transformOrigin = '94% 98.6%';
  const can = b.final.tur === 'can';
  const finalKareler = new Kareler(dizi(can ? 'can-sallan' : 'zil-sallan', can ? 6 : 4), 'pk-final ' + (can ? 'pk-can' : 'pk-zil'), can ? 'can-kulesi' : 'zil');
  ekle(finalKareler.el, b.final.kutu);
  const zilCalar = can ? null : ekle(resimEl('zil-calar', 'pk-zil pk-zil-calar'), b.final.kutu);
  const konfeti = ekle(resimEl('konfeti', 'pk-konfeti'), { x: b.final.dugme.x - 150, y: b.final.dugme.y - 230, w: 300, h: 300 });
  // Mıknatıs halkası: tutulan parça yaklaşınca yuvanın çevresinde döner.
  const cekimHalka = var_('yuva-cekim') ? ekle(resimEl('yuva-cekim', 'pk-cekim-halka'), { x: 0, y: 0, w: 300, h: 300 }) : null;
  const halkaGoster = (k: Kutu | null) => {
    if (!cekimHalka) return;
    cekimHalka.classList.toggle('acik', !!k);
    if (k) yer({ x: k.x + k.w / 2 - 150, y: k.y + k.h / 2 - 150, w: 300, h: 300 }, cekimHalka);
  };
  // Huninin içinde dönme çizgileri, hızlı topun arkasında hız çizgisi.
  const huniG = b.parcalar.find((p) => p.id === 'huni');
  const huniRuzgar = huniG ? new Kareler(dizi('huni-ruzgar', 2), 'pk-huni-ruzgar', 'huni-ruzgar-0') : null;
  if (huniRuzgar && huniG) ekle(huniRuzgar.el, { x: huniG.kutu.x, y: huniG.kutu.y + 10, w: 230, h: 160 });
  const hizCizgisi = var_('hiz-cizgisi') ? ekle(resimEl('hiz-cizgisi', 'pk-hiz-cizgisi'), { x: 0, y: 0, w: 200, h: 60 }) : null;
  // Finalin ışık huzmesi: sevinçte arkada yavaşça döner.
  const isik = var_('isik-huzmesi') ? ekle(resimEl('isik-huzmesi', 'pk-isik'), { x: b.final.dugme.x - 300, y: b.final.dugme.y - 380, w: 600, h: 600 }) : null;
  // Top (Deney-A1'in dönme kareleri geldiyse dönen desen, parlak nokta yerinde kalır).
  const topK = new Kareler(dizi('top-don', 6), 'pk-top', 'top');
  ekle(topK.el, { x: b.topBasi.x - 40, y: b.topBasi.y - 40, w: 80, h: 80 });
  // Ezilme kareleri (sert sekişte bir an): topun üstüne biner.
  const topEz = var_('top-ez-1') && var_('top-ez-2') ? new Kareler(['top-ez-1', 'top-ez-2'], 'pk-top-ez') : null;
  if (topEz) topK.el.append(topEz.el);
  const kivilcim = ekle(resimEl('konfeti', 'pk-konfeti pk-kivilcim'), { x: 0, y: 0, w: 220, h: 220 });
  /** Kısa efekt (yıldız patlaması, çarpma, toz): kareleri varsa oynar, yoksa konfeti küçük patlar. */
  function efektGoster(ad: string, adet: number, k: Kutu, sure = 520) {
    const kr = new Kareler(adet === 1 ? (var_(ad) ? [ad] : []) : dizi(ad, adet), 'pk-efekt', 'konfeti');
    ekle(kr.el, k);
    const t0 = performance.now();
    const adim = () => {
      const s = (performance.now() - t0) / sure;
      kr.goster(Math.floor(s * Math.max(1, adet)));
      if (s < 1) requestAnimationFrame(adim); else kr.el.remove();
    };
    if (kr.bos) kr.el.classList.add('patla');
    requestAnimationFrame(adim);
  }

  // ----- Çekmece (ekrana sabit, alttan yaylanarak açılır) -----
  const cekmece = document.createElement('div');
  cekmece.className = 'pk-cekmece';
  const cekmeceIc = document.createElement('div');
  cekmeceIc.className = 'pk-cekmece-ic';
  if (cizim('cekmece-ic')) cekmeceIc.style.backgroundImage = 'url("' + cizim('cekmece-ic') + '")';
  const cekmeceOn = document.createElement('div');
  cekmeceOn.className = 'pk-cekmece-on';
  if (cizim('cekmece-on')) cekmeceOn.style.backgroundImage = 'url("' + cizim('cekmece-on') + '")';
  cekmece.append(cekmeceIc, cekmeceOn);
  document.body.append(cekmece);
  const bolmeler = new Map<string, HTMLButtonElement>();
  for (const id of b.eksik[ayar.yas]) {
    const g = gorseller.get(id)!;
    const bolme = document.createElement('button');
    bolme.className = 'pk-bolme';
    bolme.dataset.parca = id;
    bolme.setAttribute('aria-label', 'Parça: ' + id);
    if (cizim('cekmece-bolme')) bolme.style.backgroundImage = 'url("' + cizim('cekmece-bolme') + '")';
    const ic = resimEl(g.bilgi.cizim, 'pk-bolme-resim');
    // Bölmeye oranını koruyarak sığar.
    const oran = g.bilgi.kutu.w / g.bilgi.kutu.h;
    ic.style.setProperty('--oran', String(oran));
    bolme.append(ic);
    cekmeceIc.append(bolme);
    bolmeler.set(id, bolme);
    surukle(bolme, id);
  }
  cekmece.style.setProperty('--bolme', String(Math.max(1, bolmeler.size)));
  function cekmeceAc() {
    if (!bolmeler.size || [...bolmeler.values()].every((x) => x.classList.contains('bos'))) return;
    if (cekmeceAcik) return;
    cekmeceAcik = true;
    cekmece.classList.add('acik');
    efekt('cekmece', 0.8);
  }
  function cekmeceKapa() {
    if (!cekmeceAcik) return;
    cekmeceAcik = false;
    cekmece.classList.remove('acik');
  }

  // ----- Sürükleme: bölmeden dünyaya; yuva yaklaşan parçayı çeker; yakında bırakılınca "tık" diye oturur -----
  function ekrandanDunyaya(x: number, y: number) { const r = kok.getBoundingClientRect(); return { x: ((x - r.left) / r.width) * W, y: ((y - r.top) / r.height) * H }; }
  function merkez(k: Kutu) { return { x: k.x + k.w / 2, y: k.y + k.h / 2 }; }
  function surukle(bolme: HTMLButtonElement, id: string) {
    const MIKNATIS = 230, OTUR = 190;
    const g = gorseller.get(id)!, k = g.bilgi.kutu, c = merkez(k);
    bolme.addEventListener('pointerdown', (e) => {
      if (g.yerinde || durum === 'kosu' || durum === 'donus') return;
      e.preventDefault();
      sesiAc();
      void sesleriYukle();
      void basla();
      bolme.setPointerCapture(e.pointerId);
      efekt('tik', 0.7);
      birKez(bolme, 'bas', 240);
      const bas = { x: e.clientX, y: e.clientY };
      let surukluyor = false;
      // Mega zincirde kamera parçanın yuvasına kayar (yuva görünsün).
      if (W > 1672) kameraHedefX = Math.max(0, Math.min(W - kamera.gw, c.x - kamera.gw / 2));
      const tasi = (ev: PointerEvent) => {
        if (!surukluyor && Math.hypot(ev.clientX - bas.x, ev.clientY - bas.y) < 10) return;
        if (!surukluyor) {
          surukluyor = true;
          bolme.classList.add('bos');
          g.el.classList.remove('pk-gizli', 'pk-anim');
          g.el.classList.add('pk-tutulan');
          kinoPoz('kino-isaret');
        }
        const p = ekrandanDunyaya(ev.clientX, ev.clientY);
        const u = Math.hypot(p.x - c.x, p.y - c.y);
        // Mıknatıs: yaklaştıkça parça yuvaya doğru çekilir, yuva parlar.
        const cek = u < MIKNATIS ? Math.pow(1 - u / MIKNATIS, 1.6) : 0;
        const x = p.x + (c.x - p.x) * cek, y = p.y + (c.y - p.y) * cek;
        yer({ x: x - k.w / 2, y: y - k.h / 2, w: k.w, h: k.h }, g.el);
        g.yuva?.classList.toggle('cekiyor', cek > 0);
        halkaGoster(cek > 0 ? k : null);
        if (cek > 0 && !g.el.dataset.cekim) { g.el.dataset.cekim = '1'; efekt('miknatis', 0.5); }
        if (cek === 0) delete g.el.dataset.cekim;
      };
      const birak = (ev: PointerEvent) => {
        bolme.removeEventListener('pointermove', tasi);
        bolme.removeEventListener('pointerup', birak);
        bolme.removeEventListener('pointercancel', birak);
        g.el.classList.remove('pk-tutulan');
        g.yuva?.classList.remove('cekiyor');
        halkaGoster(null);
        delete g.el.dataset.cekim;
        if (!surukluyor) { yerineUc(id, bolme); return; }
        const p = ekrandanDunyaya(ev.clientX, ev.clientY);
        if (Math.hypot(p.x - c.x, p.y - c.y) < OTUR) { yerinePut(id); return; }
        // Başka parçanın yuvası: oturmaz, komikçe geri seker.
        const baska = [...gorseller.values()].find((x) => x.bilgi.id !== id && !x.yerinde && x.yuva && Math.hypot(p.x - merkez(x.bilgi.kutu).x, p.y - merkez(x.bilgi.kutu).y) < 150);
        if (baska) {
          efekt('puf');
          kinoPoz('kino-gul', 900);
          tepki(kino.el);
          soyle('k-olmadi');
        }
        geriDon(id, bolme);
      };
      bolme.addEventListener('pointermove', tasi);
      bolme.addEventListener('pointerup', birak);
      bolme.addEventListener('pointercancel', birak);
    });
  }
  /** Dokunup bırakınca (sürüklemeden) parça bölmeden kendi yuvasına uçar (2–3 yaş için sürükleme şart değil). */
  function yerineUc(id: string, bolme: HTMLButtonElement) {
    const g = gorseller.get(id)!, k = g.bilgi.kutu;
    const r = bolme.getBoundingClientRect();
    const p = ekrandanDunyaya(r.left + r.width / 2, r.top + r.height / 2);
    bolme.classList.add('bos');
    g.el.classList.remove('pk-gizli');
    yer({ x: p.x - k.w / 2, y: p.y - k.h / 2, w: k.w, h: k.h }, g.el);
    void g.el.offsetWidth;
    g.el.classList.add('pk-anim');
    yerinePut(id);
  }
  function geriDon(id: string, bolme: HTMLButtonElement) {
    const g = gorseller.get(id)!, k = g.bilgi.kutu;
    const r = bolme.getBoundingClientRect();
    const p = ekrandanDunyaya(r.left + r.width / 2, r.top + r.height / 2);
    g.el.classList.add('pk-anim');
    yer({ x: p.x - k.w / 2, y: p.y - k.h / 2, w: k.w, h: k.h }, g.el);
    setTimeout(() => { g.el.classList.add('pk-gizli'); g.el.classList.remove('pk-anim'); bolme.classList.remove('bos'); birKez(bolme, 'yaylan', 420); }, 380);
  }
  function yerinePut(id: string) {
    const g = gorseller.get(id)!;
    g.el.classList.add('pk-anim');
    yer(g.bilgi.kutu, g.el);
    g.yerinde = true;
    motor.yerlesik.add(id);
    g.yuva?.classList.add('dolu');
    bolmeler.get(id)?.classList.add('bos');
    efekt('tik');
    birKez(g.el, 'pk-oturdu', 420);
    setTimeout(() => g.el.classList.remove('pk-anim'), 420);
    efektGoster('yildiz-patlama', 4, { x: merkez(g.bilgi.kutu).x - 110, y: merkez(g.bilgi.kutu).y - 110, w: 220, h: 220 }, 420);
    kinoPoz('kino-alkis', 800);
    tepki(kino.el);
    if (ilkParca) { ilkParca = false; sirayla('k-oturdu', () => { if (hepsiYerinde()) kolHazir(); }); }
    else if (hepsiYerinde()) kolHazir();
    else davet();
    if (hepsiYerinde()) setTimeout(cekmeceKapa, 350);
  }
  const hepsiYerinde = () => [...gorseller.values()].every((g) => g.yerinde);

  // ----- Akış -----
  let durum: Durum = 'kur';
  let ilkParca = true, kolSoylendi = false, kacmaSayisi = 0, kosuSayisi = 0, basariSayisi = 0, kameraBasa = false;
  let kameraHedefX = 0;
  const durumYaz = (d: Durum) => { durum = d; kok.dataset.durum = d; };
  function kolHazir() {
    kok.classList.add('pk-kol-hazir');
    cekmeceKapa();
    if (!kolSoylendi) { kolSoylendi = true; sirayla('c-kol'); }
  }
  /** Açılış işareti (1 sn içinde): ilk boş yuva parlar ve yıldızlanır, çekmecedeki parçası zıplar, Kino gösterir. */
  function davet() {
    const ilk = [...gorseller.values()].find((g) => !g.yerinde);
    if (!ilk) return;
    const k = ilk.bilgi.kutu;
    birKez(ilk.yuva, 'vurgu', 1800);
    yer({ x: k.x + k.w / 2 - 110, y: k.y + k.h / 2 - 110, w: 220, h: 220 }, kivilcim);
    birKez(kivilcim, 'patla', 1250);
    efekt('konfeti', 0.7);
    birKez(bolmeler.get(ilk.bilgi.id), 'zipla', 1300);
    kinoPoz('kino-isaret', 1500);
  }
  function kolCiz(a: number) { kolSap.style.transform = 'rotate(' + -a + 'deg)'; }
  function kolGeriTep() {
    kolSap.classList.remove('pk-anim');
    kolCiz(0);
    birKez(kolSap, 'geri-tep', 600);
    efekt('yay');
  }
  function kolCek(surukleme = false) {
    if (durum === 'kosu' || durum === 'donus' || durum === 'basari') return;
    sesiAc();
    void sesleriYukle();
    kolSap.classList.add('pk-anim');
    kolCiz(KOL.aci);
    if (!surukleme) setTimeout(kolGeriTep, 380);
    const basla_ = () => {
      durumYaz('kosu');
      kosuSayisi++;
      kameraBasa = false;
      cekmeceKapa();
      kok.classList.remove('pk-kol-hazir');
      for (const g of gorseller.values()) g.yuva?.classList.remove('nabiz');
      motor.baslat();
      kuyruguBosalt();
      if (kosuSayisi <= 2) setTimeout(() => { if (!konusuyor()) soyle('k-bak'); }, 350);
    };
    if (durum === 'bitti' || motor.top.mod !== 'bekle') sahneyiKur(basla_);
    else basla_();
  }
  kolTutamak.addEventListener('pointerdown', (e) => {
    if (durum === 'kosu' || durum === 'donus' || durum === 'basari') return;
    e.preventDefault();
    sesiAc();
    void sesleriYukle();
    void basla();
    kolTutamak.setPointerCapture(e.pointerId);
    const y0 = e.clientY;
    let cekti = false;
    kolSap.classList.remove('pk-anim');
    birKez(kolSap, 'bas', 240);
    efekt('tik', 0.6);
    const tasi = (ev: PointerEvent) => {
      const r = kok.getBoundingClientRect();
      const a = Math.max(0, Math.min(KOL.aci, ((ev.clientY - y0) / r.height) * H * 0.5));
      kolCiz(a);
      if (a > KOL.aci * 0.7 && !cekti) { cekti = true; kolCek(true); }
    };
    const birak = () => {
      kolTutamak.removeEventListener('pointermove', tasi);
      kolTutamak.removeEventListener('pointerup', birak);
      kolTutamak.removeEventListener('pointercancel', birak);
      if (!cekti) kolCek(); else kolGeriTep();
    };
    kolTutamak.addEventListener('pointermove', tasi);
    kolTutamak.addEventListener('pointerup', birak);
    kolTutamak.addEventListener('pointercancel', birak);
  });

  /** Top başa uçar, dominolar kalkar, mekanizmalar yerine; sonra `sonra`. */
  function sahneyiKur(sonra?: () => void) {
    const t = motor.top;
    const bas = { x: t.x, y: t.y }, yuks = Math.min(bas.y, b.topBasi.y) - 160;
    const aci0 = motor.dominolar.ds.map((d) => d.aci);
    efekt('uc');
    const T = 900, t0 = performance.now();
    durumYaz('donus');
    for (const m of b.mekanizmalar) m.sifirla();
    const adim = () => {
      const s = Math.min(1, (performance.now() - t0) / T), e = s * s * (3 - 2 * s);
      t.x = bas.x + (b.topBasi.x - bas.x) * e;
      t.y = (1 - e) * (1 - e) * bas.y + 2 * (1 - e) * e * yuks + e * e * b.topBasi.y;
      t.aci -= 0.25;
      motor.dominolar.ds.forEach((d, i) => { d.aci = aci0[i] * (1 - e); });
      if (s < 1) { requestAnimationFrame(adim); return; }
      motor.sifirla();
      durumYaz('kur');
      kinoPoz('kino-bekle-0');
      cerenPoz('ceren-bekle');
      if (hepsiYerinde()) kok.classList.add('pk-kol-hazir'); else cekmeceAc();
      sonra?.();
    };
    requestAnimationFrame(adim);
  }

  // ----- Fizik olaylarına tepki -----
  const NOTALAR = ['do', 're', 'mi', 'fa'];
  const KINO_SOZ: Partial<Record<Olay['tur'], Soz>> = {
    'kaykay-bin': 'k-kaykay', pota: 'k-pota', su: 'k-su', 'su-tasti': 'k-islak', 'balon-sisir': 'k-balon', 'hava-kacti': 'k-puf', 'kaykay-dus': 'k-dustu',
  };
  const soylendi = new Set<string>();
  /** Kino'nun olay sözü: her bölümde bir kez (aynı söz art arda yok, sahne boğulmaz). */
  const kinoSoz = (o: Olay) => { const s = KINO_SOZ[o.tur]; if (s && !soylendi.has(s)) { soylendi.add(s); if (!konusuyor()) soyle(s); } };
  function olay(o: Olay) {
    switch (o.tur) {
      case 'klank': efekt('klank'); kinoPoz('kino-saskin', 900); tepki(kino.el); break;
      case 'sek': efekt('sek', 0.25 + 0.75 * o.siddet); if (o.siddet > 0.45) topEzil(); break;
      case 'huni-gir': efekt('vuu'); huniRuzgar?.el.classList.add('acik'); birKez(gorseller.get('huni')?.el, 'titre', 650); kinoPoz('kino-saskin-2', 900); tepki(kino.el); break;
      case 'huni-cik': efekt('pit'); huniRuzgar?.el.classList.remove('acik'); break;
      case 'boing': efekt('boing'); birKez(gorseller.get('trambolin')?.el, 'esne', 460); gorseller.get('trambolin')?.kareler?.basaSar(); kinoPoz('kino-gul', 800); cerenPoz('ceren-gul', 800); tepki(kino.el); tepki(ceren.el); break;
      case 'kaykay-bin': efekt('kaykay-bin'); kinoPoz('kino-isaret', 1000); tepki(kino.el); kinoSoz(o); break;
      case 'kaykay-dur': efekt('takoz'); efektGoster('takoz-carp', 1, { x: 1000, y: 580, w: 120, h: 120 }); sarsinti = 0.2; break;
      case 'ucus': efekt('uc', 0.6); kinoPoz('kino-saskin-2', 900); break;
      case 'kaykay-dus': efekt('puf'); kinoPoz('kino-gozkapa', 1500); cerenPoz('ceren-saskin', 1500); kinoSoz(o); break;
      case 'yay-bas': efekt('yay-sik'); kinoPoz('kino-dusun', 600); break;
      case 'yay-firlat': efekt('yay'); efekt('boing', 0.6); kinoPoz('kino-zipla', 900); tepki(kino.el); break;
      case 'pota': efekt('pota'); kinoPoz('kino-tezahurat', 1000); cerenPoz('ceren-sevinc-2', 1000); kinoSoz(o); break;
      case 'musluk': efekt('musluk'); kinoPoz('kino-isaret', 900); break;
      case 'su': kinoPoz('kino-gul', 1000); kinoSoz(o); break;
      case 'su-tasti': efekt('su-tasma'); kinoPoz('kino-islak', 1600); cerenPoz('ceren-saskin', 1200); kinoSoz(o); break;
      case 'kova-al': efekt('kova'); kinoPoz('kino-saskin-2', 900); break;
      case 'kova-birak': {
        efekt('kova', 0.7); efekt('pit'); kinoPoz('kino-gul', 800);
        const t = motor.top;
        efektGoster('kova-dok', 1, { x: t.x - 60, y: t.y - 40, w: 120, h: 100 }, 400);
        break;
      }
      case 'koruk': efekt('koruk'); kinoPoz('kino-dusun', 700); break;
      case 'balon-sisir': efekt('balon'); kinoPoz('kino-saskin-2', 1200); kinoSoz(o); break;
      case 'hava-kacti': efekt('hava'); havaKacti?.basaSar(); birKez(havaKacti?.el, 'acik', 900); kinoPoz('kino-gul', 1200); kinoSoz(o); break;
      case 'balon-it':
        efekt('boing', 0.5); kinoPoz('kino-tezahurat', 900);
        if (balonSis && var_('balon-it')) { const ez = ekle(resimEl('balon-it', 'pk-balon-ez'), { x: balonOrta.x - 120, y: balonOrta.y - 120, w: 240, h: 240 }); balonSis.el.classList.add('pk-gizli'); setTimeout(() => { ez.remove(); balonSis.el.classList.remove('pk-gizli'); }, 380); }
        break;
      case 'domino': efekt('not-' + NOTALAR[o.i % 4]); setTimeout(() => efektGoster('domino-toz', 2, { x: b.dominolar.ortalar[o.i] + 10, y: b.zeminY - 40, w: 140, h: 60 }, 360), 220); if (o.i === 0) { kinoPoz('kino-sevin', 700); tepki(kino.el); } efektGoster('domino-carpma', 2, { x: b.dominolar.ortalar[o.i] - 40, y: b.zeminY - 170, w: 120, h: 120 }, 360); break;
      case 'sallan': efekt('pit', 0.5); break;
      case 'zil': case 'can': finale(o.tur === 'can'); break;
    }
  }
  function topEzil() {
    if (AZ_HAREKET) return;
    if (!topEz) { birKez(topK.el, 'ezil', 260); return; }
    topEz.el.classList.add('acik');
    topEz.goster(0);
    setTimeout(() => topEz.goster(1), 90);
    setTimeout(() => topEz.el.classList.remove('acik'), 200);
  }
  function finale(can_: boolean) {
    efekt(can_ ? 'can' : 'zil');
    efekt('konfeti');
    finalKareler.basaSar();
    if (zilCalar) { finalKareler.el.classList.add('gizli'); zilCalar.classList.add('acik'); setTimeout(() => { finalKareler.el.classList.remove('gizli'); zilCalar.classList.remove('acik'); }, 520); }
    birKez(konfeti, 'patla', 1250);
    efektGoster('konfeti-yagmur', 4, { x: b.final.dugme.x - 300, y: 60, w: 600, h: 400 }, 1400);
    birKez(isik ?? undefined, 'acik', 2000);
    kinoPoz(can_ ? 'kino-kulak-kapa' : 'kino-tezahurat');
    cerenPoz(can_ ? 'ceren-kulak-kapa' : 'ceren-tezahurat');
    tepki(kino.el);
    tepki(ceren.el);
    sarsinti = 0.35;
    birKez(zilCalar ?? finalKareler.el, 'parla', 650);
    basariSayisi++;
    const n = kosuSayisi;
    setTimeout(() => { if (kosuSayisi === n) soyle(can_ ? 'k-can' : 'k-cinn', () => bitis(n)); }, 150);
  }
  function bitis(n: number) {
    if (kosuSayisi !== n) return;
    if (durum === 'kosu') { setTimeout(() => bitis(n), 100); return; }
    if (durum !== 'basari') return;
    durumYaz('bitti');
    kameraBasa = true;
    kok.classList.add('pk-kol-hazir');
    kinoPoz('kino-bekle-0');
    cerenPoz('ceren-bekle');
    ileri.hidden = false;
    // İlk başarıda Ceren bilimi bir cümleyle söyler, sonra "bir daha ya da sıradaki".
    if (basariSayisi === 1) sirayla(b.no === 1 ? 'c-final' : (('c-bilim-' + b.no) as Soz), () => { if (durum === 'bitti') sirayla(ayar.haritaVar || b.no < 6 ? 'c-sonraki' : 'c-tekrar'); });
    ilerlemeKaydet();
  }
  function kacti() {
    durumYaz('kacti');
    kacmaSayisi++;
    kinoPoz('kino-gul');
    cerenPoz('ceren-gul');
    for (const g of gorseller.values()) if (!g.yerinde) g.yuva?.classList.add('nabiz');
    const geri = () => setTimeout(() => sahneyiKur(), 400);
    // İlk kaçışta Kino güler, Ceren eksik parçayı söyler; sonrakilerde yalnız tepki ve parlayan yuva (aynı söz art arda yok).
    const eksikIlk = [...gorseller.values()].find((g) => !g.yerinde)?.bilgi.id;
    const ipucu = ipucuSozu(eksikIlk);
    if (kacmaSayisi === 1) soyle('k-hoppala', () => { soyle(ipucu); geri(); });
    else if (kacmaSayisi % 2 === 0) { efekt('pit', 0.6); geri(); }
    else soyle('k-hoppala', geri);
  }
  /** Kaçışın ipucu: eksik parçaya göre (yoksa yayın gerginliği), yoksa genel "boş yere parça koy". */
  function ipucuSozu(eksikId?: string): Soz {
    if (!eksikId && yay && yay.atislar >= 3) return 'c-yay-az';
    const ozel: Record<string, Soz> = { takoz: 'c-takoz', oluk: 'c-oluk', hortum: 'c-hortum', balon: 'c-hortum' };
    return (eksikId && ozel[eksikId]) || 'c-yeniden';
  }

  // Sonraki bölüm (bitince): uygulamanın ortak "ileri" düğmesi.
  const ileri = document.createElement('button');
  ileri.className = 'pk-nav pk-ileri';
  ileri.setAttribute('aria-label', 'Sıradaki parkur');
  ileri.innerHTML = '<img src="' + (dugmeResmi('ileri') ?? '') + '" alt="" draggable="false">';
  ileri.hidden = true;
  document.body.append(ileri);
  ileri.onclick = () => { sesiAc(); efekt('tik'); ayar.sonraki(); };
  function ilerlemeKaydet() {
    try {
      const k = 'minkino-parkur-v1';
      const v = JSON.parse(localStorage.getItem(k) || '{}') as { acik?: number; yildiz?: number[] };
      v.yildiz = [...new Set([...(v.yildiz ?? []), b.no])];
      v.acik = Math.max(v.acik ?? 1, Math.min(6, b.no + 1));
      localStorage.setItem(k, JSON.stringify(v));
    } catch { /* depolama yoksa ilerleme bu oturumda kalır */ }
  }

  // Kino'nun bekleme döngüsü (göz kırpar), Ceren arada göz kırpar.
  const canli = window.setInterval(() => {
    if (kino.el.dataset.poz === 'kino-bekle-0') { kinoPoz('kino-bekle-1'); setTimeout(() => { if (kino.el.dataset.poz === 'kino-bekle-1') kinoPoz('kino-bekle-0'); }, 220); }
    if (ceren.el.dataset.poz === 'ceren-bekle' && var_('ceren-goz') && Math.random() < 0.4) { cerenPoz('ceren-goz'); setTimeout(() => { if (ceren.el.dataset.poz === 'ceren-goz') cerenPoz('ceren-bekle'); }, 200); }
  }, 2600);

  // ----- Çizim döngüsü -----
  let onceki = performance.now(), calisiyor = true;
  const kaykayMek = motor.mekanizma<Kaykay>('kaykay');
  const degirmenMek = motor.mekanizma<Degirmen>('degirmen');
  const muslukMek = motor.mekanizma<Musluk>('musluk');
  const korukMek = motor.mekanizma<Koruk>('koruk');
  function ciz() {
    if (!calisiyor) return;
    const simdi = performance.now();
    const dt = Math.min(0.05, (simdi - onceki) / 1000);
    onceki = simdi;
    if (durum === 'kosu') {
      motor.adim(dt);
      for (const o of motor.olaylar.splice(0)) olay(o);
      const t = motor.top;
      const hiz = t.temas && t.mod === 'serbest' ? Math.hypot(t.vx, t.vy) : 0;
      dongu('tikir', Math.min(1, hiz / 600) * 1.15, 0.85 + 0.6 * Math.min(1, hiz / 700));
      if (motor.sonuc === 'kacti') { donguleriKapat(); kacti(); }
      if (motor.sonuc === 'basari') { donguleriKapat(); durumYaz('basari'); }
    }
    const t = motor.top;
    // Kamera: kurarken başta (mega zincirde tutulan parçanın yuvasında), koşuda topu izler, sevinçte finalde.
    let hedef = kameraHedefX;
    if (durum === 'kosu' || durum === 'kacti') hedef = t.x - kamera.gw * 0.42;
    if ((motor.finalCaldi || durum === 'basari' || durum === 'bitti') && !kameraBasa) hedef = b.final.dugme.x - kamera.gw * 0.55;
    if (kameraBasa || durum === 'donus') hedef = 0;
    hedef = Math.max(0, Math.min(W - kamera.gw, hedef));
    kamera.x += (hedef - kamera.x) * (1 - Math.exp(-dt * 3.2));
    kameraUygula(dt);
    // Top: dönme kareleri varsa desen döner (parlak nokta yerinde), yoksa resim döner.
    const tx = ((t.x - b.topBasi.x) / W) * kok.clientWidth, ty = ((t.y - b.topBasi.y) / H) * kok.clientHeight;
    if (topK.bos) topK.el.style.transform = 'translate(' + tx + 'px,' + ty + 'px) rotate(' + t.aci + 'rad) scale(' + t.olcek + ')';
    else { topK.el.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + t.olcek + ')'; topK.goster(Math.floor((((t.aci % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 3))); }
    topK.el.classList.toggle('huni-icinde', t.mod === 'tasiniyor' && t.sahip === 'huni');
    if (hizCizgisi) {
      const v = Math.hypot(t.vx, t.vy), hizli = durum === 'kosu' && t.mod === 'serbest' && v > 650;
      hizCizgisi.classList.toggle('acik', hizli);
      if (hizli) { yer({ x: t.x - 200, y: t.y - 30, w: 200, h: 60 }, hizCizgisi); hizCizgisi.style.rotate = Math.atan2(t.vy, t.vx) + 'rad'; }
    }
    motor.dominolar.ds.forEach((d, i) => { dominoEl[i].style.transform = 'rotate(' + d.aci + 'rad)'; });
    // Mekanizmaların görüntüsü.
    if (kaykayMek) {
      const g = gorseller.get('kaykay')!;
      const px = (kaykayMek.x / W) * kok.clientWidth, py = (kaykayMek.dusus.y / H) * kok.clientHeight;
      g.el.style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + kaykayMek.dusus.aci + 'rad)';
      if (kaykayMek.durum === 'gidiyor') { g.kareler?.ilerle(dt, 4 + kaykayMek.v / 60); dongu('kaykay', 0.6, 0.8 + kaykayMek.v / 900); } else dongu('kaykay', 0);
      const ozel = kaykayMek.durum === 'durdu' && kaykayDur ? 'dur' : kaykayMek.durum === 'dustu' && kaykayDus && !kaykayDus.bos ? 'dus' : '';
      g.el.dataset.kaykay = ozel;
      kaykayDur?.classList.toggle('acik', ozel === 'dur');
      kaykayDus?.el.classList.toggle('acik', ozel === 'dus');
      if (ozel === 'dus') kaykayDus!.goster(Math.min(2, Math.floor(kaykayMek.dusus.y / 45)));
    }
    if (yay && gorseller.get('yay')) {
      const g = gorseller.get('yay')!;
      if (g.kareler && !g.kareler.bos) g.kareler.goster(Math.round(yay.bas * 3));
      else g.el.style.transform = 'scaleY(' + (1 - 0.18 * yay.bas) + ')';
    }
    if (degirmenMek && cark) {
      cark.el.style.rotate = degirmenMek.aci + 'rad';
      const akiyor = !!muslukMek!.acik && muslukMek!.t >= 0.3 && motor.yerlesik.has('oluk');
      suAkis?.classList.toggle('acik', !!muslukMek!.acik && muslukMek!.t > 0.15);
      suSicrama?.classList.toggle('acik', akiyor);
      suTasma?.classList.toggle('acik', !!muslukMek!.acik && !motor.yerlesik.has('oluk') && muslukMek!.t > 0.3);
      if (suAkis) yuzde({ x: 1150, y: 255, w: 60, h: motor.yerlesik.has('oluk') ? 200 : 435 }, suAkis, W, H);
      dongu('su', muslukMek!.acik ? 0.5 : 0);
      muslukKareler?.goster(muslukMek!.acik ? 1 : 0);
    }
    if (korukMek && balonSis) {
      gorseller.get('koruk')?.kareler?.goster(korukMek.basildi ? 2 : 0);
      const s = korukMek.sisme;
      balonSis.el.classList.toggle('acik', s > 0);
      gorseller.get('balon')?.el.classList.toggle('sisiyor', s > 0);
      if (balonSis.bos) balonSis.el.style.transform = 'scale(' + (0.35 + 0.65 * s) + ')';
      else balonSis.goster(Math.min(4, Math.floor(s * 5)));
    }
    sarsinti = Math.max(0, sarsinti - dt);
    if (denetim) denetimCiz(denetim);
    requestAnimationFrame(ciz);
  }

  // Çizimsiz denetim görünümü (yalnız test kipi): fiziğin çizgileri.
  let denetim: CanvasRenderingContext2D | null = null;
  if (!hazir && ayar.test) {
    const c = document.createElement('canvas');
    c.className = 'pk-denetim';
    c.width = W;
    c.height = H;
    kok.append(c);
    denetim = c.getContext('2d');
  }
  function denetimCiz(c: CanvasRenderingContext2D) {
    c.clearRect(0, 0, W, H);
    c.lineWidth = 4;
    const cizgi = (a: { x: number; y: number }, b_: { x: number; y: number }) => { c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b_.x, b_.y); c.stroke(); };
    c.strokeStyle = '#6b4a2b';
    for (const [a, b_] of [...b.sabit, ...b.masalar]) cizgi(a, b_);
    c.strokeStyle = '#2b6cb0';
    for (const m of b.mekanizmalar) if (motor.yerlesik.has(m.id)) for (const [a, b_] of m.yuzeyler({ top: motor.top, olay() {}, dominolar: motor.dominolar, var: (id) => motor.yerlesik.has(id) })) cizgi(a, b_);
    if (degirmenMek) { c.strokeStyle = '#3a8ee8'; c.beginPath(); c.arc(degirmenMek.merkez.x, degirmenMek.merkez.y, degirmenMek.yaricap, 0, Math.PI * 2); c.stroke(); for (let k = 0; k < degirmenMek.kovaSayisi; k++) { const p = degirmenMek.kovaYeri(k); c.strokeRect(p.x - 20, p.y - 14, 40, 28); } }
    if (korukMek && korukMek.sisme > 0) { c.strokeStyle = '#e23a7a'; c.beginPath(); c.arc(balonOrta.x, balonOrta.y, 75 * korukMek.sisme, 0, Math.PI * 2); c.stroke(); }
    const t = motor.top;
    c.fillStyle = '#d33';
    c.beginPath(); c.arc(t.x, t.y, R * t.olcek, 0, Math.PI * 2); c.fill();
  }

  kok.addEventListener('pointerdown', (e) => {
    if (e.target !== kok && !(e.target as Element).classList.contains('pk-fon-yari')) return;
    const r = kok.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    efekt('pit', 0.5);
    efektGoster('kalp-parilti', 2, { x: x - 60, y: y - 60, w: 120, h: 120 }, 420);
  });

  // ----- Başlangıç -----
  let basladi = false;
  async function basla() {
    if (basladi) return;
    basladi = true;
    sesiAc();
    for (const g of gorseller.values()) if (!g.yerinde) g.yuva?.classList.add('nabiz');
    cekmeceAc();
    davet();
    await sesleriYukle();
    if (b.no === 1) soyle('k-bos', () => soyle(eksik.size > 1 ? 'c-giris-iki' : 'c-giris-bir'));
    else soyle(('c-b' + b.no) as Soz);
  }
  requestAnimationFrame(ciz);
  if (AZ_HAREKET) kok.classList.add('az-hareket');

  function kapat() {
    calisiyor = false;
    clearInterval(canli);
    removeEventListener('resize', kameraOlc);
    donguleriKapat();
    cekmece.remove();
    ileri.remove();
    sozuUnut();
  }
  return {
    motor, kapat, basla, kolCek,
    durum: () => durum,
    yerlestir: (id: string) => { if (gorseller.get(id) && !gorseller.get(id)!.yerinde) { gorseller.get(id)!.el.classList.remove('pk-gizli'); yerinePut(id); } },
    tekrarDinle: () => {
      sozuUnut();
      if (durum === 'bitti') soyle('c-tekrar');
      else if (hepsiYerinde()) soyle('c-kol');
      else if (b.no === 1) soyle(eksik.size > 1 ? 'c-giris-iki' : 'c-giris-bir');
      else soyle(('c-b' + b.no) as Soz);
    },
    hazir,
  };
}

const dugmeler = import.meta.glob<string>('../../../assets/hazirlik/dugmeler/{ev,dinle,ileri}.webp', { eager: true, query: '?url', import: 'default' });
export const dugmeResmi = (ad: string) => dugmeler['../../../assets/hazirlik/dugmeler/' + ad + '.webp'];
export type Sahne = ReturnType<typeof sahneKur>;
