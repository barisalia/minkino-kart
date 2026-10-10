/**
 * Tart Bakalım ekranı (pazarın yan dalı). Müşteri "Bir kilo domates lütfen!" (5-6 yaş) ya da "Üç domates
 * lütfen!" (3-4 yaş) der. Çocuk ön tezgâhtaki meyve yığınından meyveleri kantarın leğenine sürükler: meyveler
 * gerçek fizikle düşer, seker, yuvarlanır, yığılır (tart-kantar.ts); ibre yaylanarak yükselir. Saymada oyun her
 * meyvede sesli sayar; tartmada ibre kadranın yeşil bölgesine girince "Ver" parlar, geçerse çocuk bir tane çıkarır.
 * Bazı müşterilerde yığında bir çürük domates (lekeler, sinek): komposta atılınca kompost sevinir; verilirse
 * müşteri "ııh" yapıp geri verir (ceza yok). "Ver": meyveler müşteriye uçar, müşteri sevinir, paralar sepete,
 * yıldız. 5 müşteri, sonra şenlik.
 */
import P from '../../content/pazar.json';
import { resimSesi, resimSesiHazirla } from '../../canlan/src/ses';
import { efekt, konus } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import type { Yas } from '../../src/engine/types';
import { Mino } from '../../src/mino/mino';
import { bekle, h, karistir, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { canliSahne } from './canli';
import { gorselStil, musteriKutusu, odulAni, onTezgah, oran, oyunKamerasi, stand } from './ekranlar';
import { adres, boing, flamaYerlestir, parilti, resim } from './gorsel';
import { Kamera } from './kamera';
import { kaydet, kayit } from './ilerleme';
import { brrSesi } from './meyvesuyu-ses';
import { MinoCanli } from './mino-canli';
import { Musteri, musteriHazirla } from './musteri';
import { geriGonder, surukle } from './surukle';
import { hazirMi, LEGEN_KAPASITE, yiginSatirlari, TART_MUSTERI, tartDenetle, tartIstekUret, turMeyveleri, type KasaMeyve, type TartIstek, type TartMeyve } from './tart';
import { Kantar, meyveCizimi } from './tart-kantar';
import { kompostSesi, paraSesi } from './tart-ses';

const A = P.arayuz;
const T = P.tart;
const K = '#5a3617';
const yas = (): Yas => durum.i.yas ?? 4;
const rastgele = <X>(a: X[]): X => a[Math.floor(Math.random() * a.length)];
const onizleme = () => TEST_MODU || !!document.body.dataset.onizleme;
const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Balondaki kilo ağırlığı (dökme demir, kulplu): "1 kg" ya da "½ kg" */
function kiloIkon(yazi: string, yarim: boolean): HTMLElement {
  const s = yarim ? 0.82 : 1;
  return h('div.tb-kilo', {
    role: 'img',
    'aria-label': yazi,
    html: `<svg viewBox="0 0 80 80"><g transform="translate(40 44) scale(${s}) translate(-40 -44)">
      <path d="M30 22a10 10 0 0 1 20 0" fill="none" stroke="${K}" stroke-width="11" stroke-linecap="round"/>
      <path d="M30 22a10 10 0 0 1 20 0" fill="none" stroke="#6d7480" stroke-width="5" stroke-linecap="round"/>
      <path d="M18 26h44l10 44H8z" fill="#5b6270" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M22 31h10l-4 30h-9z" fill="#fff" opacity=".18"/>
      <text x="40" y="58" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="${yarim ? 19 : 22}" fill="#fff">${yazi}</text></g></svg>`,
  });
}

/** Müşterinin balonu: saymada "3 🍅", tartmada "🍅 + kilo ağırlığı" */
function istekGorseli(ist: TartIstek): HTMLElement {
  const img = () => resim(`meyveler/${ist.meyve}`, '', ist.meyve);
  if (ist.mod === 'say') return h('div.pz-istek.tb-istek', {}, h('div.pz-istek-grup', {}, h('b', {}, String(ist.adet)), img()));
  const yarim = ist.miktar === 'yarim';
  return h('div.pz-istek.tb-istek', {}, img(), kiloIkon(yarim ? A.kg_yarim : A.kg_bir, yarim));
}

/** Kompost kutusu (yer tutucu çizim; Gemini çizimi gelince resim olur): yeşil kutu, yaprak, gülen yüz, kapak */
const KOMPOST_GOVDE = `<svg viewBox="0 0 120 120" aria-hidden="true">
  <defs><linearGradient id="tb-kg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4fb042"/><stop offset=".5" stop-color="#78d05c"/><stop offset="1" stop-color="#3f9a36"/></linearGradient></defs>
  <path d="M16 34h88l-9 76q-1 6-7 6H32q-6 0-7-6z" fill="url(#tb-kg)" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M26 44l6 62" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>
  <g class="tb-k-yuz"><ellipse class="tb-k-goz" cx="46" cy="62" rx="6" ry="7.5" fill="${K}"/><ellipse class="tb-k-goz" cx="74" cy="62" rx="6" ry="7.5" fill="${K}"/>
  <circle cx="48" cy="59" r="2.2" fill="#fff"/><circle cx="76" cy="59" r="2.2" fill="#fff"/>
  <path class="tb-k-agiz" d="M50 76q10 9 20 0" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="36" cy="74" rx="6" ry="3.5" fill="#ff8fa3" opacity=".7"/><ellipse cx="84" cy="74" rx="6" ry="3.5" fill="#ff8fa3" opacity=".7"/></g>
  <path d="M60 92c-8-2-11 8-6 12 6 0 10-6 6-12z" fill="#c6ff9e" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
</svg>`;
const KOMPOST_KAPAK = `<svg viewBox="0 0 120 40" aria-hidden="true">
  <path d="M8 30q0-12 14-14h76q14 2 14 14z" fill="#3a8f33" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
  <rect x="48" y="6" width="24" height="12" rx="6" fill="#3a8f33" stroke="${K}" stroke-width="5"/>
  <path d="M24 22h40" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>
</svg>`;

export function tartEkrani(app: Uygulama): Ekran {
  const y = yas();
  const q = new URLSearchParams(location.search);
  const secili = onizleme() ? (q.get('musteriler') ?? '').split(',').filter((x) => P.musteriler.includes(x)) : [];
  const musteriler = [...secili, ...karistir(P.musteriler.filter((x) => !secili.includes(x)))].slice(0, TART_MUSTERI);
  musteriler.forEach((ad) => {
    resimSesiHazirla(ad);
    musteriHazirla(ad);
  });
  // gösterim / test: &meyve=domates&curuk=1 ile ilk müşteri
  const zorlaMeyve = onizleme() ? (q.get('meyve') as TartMeyve | null) : null;
  const zorlaCuruk = onizleme() && q.has('curuk') ? q.get('curuk') === '1' : undefined;
  const meyveler = turMeyveleri();

  const yazi = h('span', {}, T.giris);
  let sonSoz: string[] = [T.giris];
  const balon = h('div.baslik-balon.pz-baslik', {}, yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', () => void konus(sonSoz), 'kucuk'), yazi);
  const yildizlar = h('div.pz-yildizlar', { 'aria-label': 'Yıldızlar' }, ...Array.from({ length: TART_MUSTERI }, () => h('i.pz-yildiz', {}, svg(IKON.yildiz))));
  const musteriKap = h('div.pz-musteri-kap');
  const mino = new Mino();
  mino.el.addEventListener('pointerdown', () => mino.tepki('gidik'));
  let aktif = false;
  const minoCanli = new MinoCanli(mino, { urunVar: () => true, musteriVar: () => aktif });

  // Mino'nun sepeti: paralar buraya düşer
  const sepetUrl = adres('pazar/sepet');
  const sepetIc = h('div.pz-sepet-ic.tb-kasa-para');
  const sepet = h(`div.pz-sepet${sepetUrl ? '.pz-gorselli' : ''}`, { role: 'img', 'aria-label': 'Sepet' }, sepetUrl ? h('img.pz-sepet-resim', { src: sepetUrl, alt: '', draggable: 'false' }) : null, sepetIc);

  const kantar = new Kantar();
  const kasa = h('div.tb-kasa', { role: 'region', 'aria-label': 'Meyveler' });
  // kompost kutusu: Gemini çizimi (gövde + kapak) geldiyse o, yoksa kodla yer tutucu
  const kompostUrl = adres('pazar/kompost');
  const kapakUrl = adres('pazar/kompost-kapak');
  const resimli = !!(kompostUrl && kapakUrl);
  const kapak = resimli ? h('i.tb-k-kapak', {}, h('img', { src: kapakUrl, alt: '', draggable: 'false' })) : h('i.tb-k-kapak', { html: KOMPOST_KAPAK });
  const govde = resimli ? h('div.tb-k-govde', {}, h('img', { src: kompostUrl, alt: '', draggable: 'false' })) : h('div.tb-k-govde', { html: KOMPOST_GOVDE });
  const kompost = h('div.tb-kompost', { role: 'region', 'aria-label': A.kompost }, h('i.tb-k-golge'), govde, kapak);
  const verYazi = h('span', {}, A.ver);
  const ver = h('button.dugme.pz-ver.tb-ver', { type: 'button', hidden: true }, svg(IKON.onay), verYazi);

  const canli = canliSahne();
  canli.gun(0);
  const kamera = h('div.pz-kamera', {}, stand([h('div.pz-mino', {}, mino.el)], [sepet]), musteriKap);
  const sahne = h('div.pz-sahne', {}, canli.ufuk, kamera);
  // Ver tezgâhın ızgarasında (yatay telefonda sağ sütuna çıkar: tart.css)
  const tezgah = onTezgah(h('div.tb-tezgah', {}, kompost, kantar.el, kasa, ver));
  const zemin = h('div.pz-zemin', { 'aria-hidden': 'true' });
  const el = h(
    'div.pz-pazar.tb-ekran',
    { style: gorselStil('pazar/arkaplan'), 'data-yas': y },
    zemin,
    canli.arka,
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.git('acilis')), h('div.orta', {}, balon), sesDugmesi()),
    yildizlar,
    sahne,
    tezgah,
  );
  const flamaKapat = flamaYerlestir(el, kamera);
  const kam = oyunKamerasi(el, sahne, kamera, tezgah, zemin, canli.arka, canli.ufuk);
  tezgah.addEventListener('pointerdown', () => aktif && kam.yakin && kam.genis(450));

  let ist: TartIstek = tartIstekUret(y, 0);
  let kapandi = false;
  let musteri: Musteri | null = null;
  let sonHareket = performance.now();
  let ipucu = false;
  let hazirDendi = false;
  let fazlaDendi = false;
  let curukDendi = false;
  let verHata = 0;
  let bitir: () => void = () => undefined;
  let mesgul = false;
  const sokuler: (() => void)[] = [];
  /** kasadaki her meyvenin yuvası ve öğesi */
  const yuvalar = new Map<KasaMeyve, { yuva: HTMLElement; e: HTMLElement }>();

  const soyle = (soz: string | string[]) => {
    sonSoz = [soz].flat();
    return konus(sonSoz);
  };
  const salla = (e: HTMLElement, sinif: string) => {
    e.classList.remove(sinif);
    void e.offsetWidth;
    e.classList.add(sinif);
  };
  const testVerisi = () => {
    if (!onizleme()) return;
    el.dataset.istek = JSON.stringify({ mod: ist.mod, meyve: ist.meyve, adet: ist.adet, bolge: ist.bolge, kasa: ist.kasa });
    el.dataset.legen = JSON.stringify(kantar.icindekiler);
  };

  /** Leğendeki sağlam meyve sayısı (sayma) */
  const saglam = () => kantar.icindekiler.filter((m) => !m.curuk).length;

  /** İstenene ulaşıldı mı: "Ver" parlar */
  function verGuncelle() {
    const hazir = aktif && hazirMi(ist, kantar.icindekiler);
    ver.classList.toggle('tb-hazir', hazir);
    ver.hidden = !aktif || kantar.adet === 0;
    kantar.el.classList.toggle('tb-tamam', hazir && ist.mod === 'tart');
    testVerisi();
    return hazir;
  }

  // ---------------------------------------------------------------- kantar olayları
  kantar.olay = {
    degdi: (km) => {
      sonHareket = performance.now();
      if (!aktif) return;
      if (km.curuk) {
        // çürük leğende: sinek vızıldar, Mino şaşırır, kompost parlar
        efekt.vizilti(0.7);
        mino.tepki('sasir');
        kompost.classList.add('pz-parla');
        if (!curukDendi) void soyle(T.curuk_gordu);
        curukDendi = true;
        verGuncelle();
        return;
      }
      const hazir = verGuncelle();
      if (ist.mod === 'say') {
        const n = saglam();
        sayiRozeti(km, n);
        if (onizleme()) el.dataset.sayilar = [el.dataset.sayilar, n].filter(Boolean).join(',');
        const soz = [T.sayilar[n - 1] ?? String(n)];
        efekt.nota(Math.min(10, n + 2));
        if (hazir && !hazirDendi) {
          hazirDendi = true;
          soz.push(T.hazir);
          mino.tepki('evet');
        } else if (n > (ist.adet ?? 0) && !fazlaDendi) {
          fazlaDendi = true;
          soz.push(P.fazla, T.cikar);
          mino.tepki('sasir');
        }
        void soyle(soz);
        return;
      }
      // tartma: ağırlık arttıkça yükselen nota; yeşile girince çan, geçince bir kez uyarı
      const [, b] = ist.bolge ?? [0, 0];
      efekt.nota(Math.min(10, Math.round((kantar.agirlik / b) * 8)));
      if (hazir) {
        kantar.el.classList.remove('tb-yesil-parla');
        void kantar.el.offsetWidth;
        kantar.el.classList.add('tb-yesil-parla');
        if (!hazirDendi) {
          hazirDendi = true;
          efekt.yildiz(1);
          mino.tepki('evet');
          void soyle(T.hazir);
        }
      } else if (kantar.agirlik > b && !fazlaDendi) {
        fazlaDendi = true;
        mino.tepki('sasir');
        void soyle([P.fazla, T.cikar]);
      }
    },
    agirlik: () => {
      if (aktif) verGuncelle();
    },
    tutuldu: (km) => {
      sonHareket = performance.now();
      efekt.secim();
      if (km.curuk) efekt.vizilti(0.5);
      minoCanli.izleBasla();
    },
    tasiniyor: (x) => {
      minoCanli.izle(x);
      kompost.classList.toggle('pz-uzerinde', icinde(kompost, x, sonY));
    },
    disari: (km, x, yy, kutu) => {
      minoCanli.izleBitti();
      kompost.classList.remove('pz-uzerinde');
      if (icinde(kompost, x, yy)) {
        if (km.curuk) {
          void komposta(km, kutu);
          return true;
        }
        // sağlam meyve komposta atılmaz: kompost başını sallar, meyve yığına döner
        tazeAtma();
      }
      // yığındaki yerine geri döner
      yuvayaDon(km, kutu);
      if (!km.curuk) setTimeout(() => verGuncelle(), 0);
      return true;
    },
  };
  /** kantar sürüklemesinde son parmak y'si (kompost vurgusu için) */
  let sonY = 0;
  kantar.el.addEventListener('pointermove', (e) => (sonY = e.clientY), true);

  function icinde(e: HTMLElement, x: number, yy: number, pay = 24) {
    const r = e.getBoundingClientRect();
    return x > r.left - pay && x < r.right + pay && yy > r.top - pay * 2 && yy < r.bottom + pay;
  }

  /** Saymada meyvenin üstünde uçan sayı */
  function sayiRozeti(km: KasaMeyve, n: number) {
    const r = kantar.kutu(km);
    if (!r) return;
    const roz = h('b.tb-sayi', { style: `left:${r.left + r.width / 2}px;top:${r.top}px`, 'aria-hidden': 'true' }, String(n));
    el.append(roz);
    setTimeout(() => roz.remove(), 1200);
  }

  /** Sağlam meyve komposta bırakıldı: kompost hayır der */
  function tazeAtma() {
    salla(kompost, 'tb-hayir');
    efekt.yanlis();
    void soyle(T.taze);
  }

  /** Meyveyi yığındaki yerine (ekrandaki kutusundan kayarak) geri koyar */
  function yuvayaDon(km: KasaMeyve, kutu: DOMRect | null) {
    const y_ = yuvalar.get(km);
    if (!y_) return;
    const { yuva, e } = y_;
    yuva.classList.remove('tb-bos');
    yiginYerlestir(true, km);
    e.style.transition = 'none';
    e.style.transform = '';
    if (kutu) {
      const s = e.getBoundingClientRect();
      e.style.transform = `translate(${kutu.left + kutu.width / 2 - (s.left + s.width / 2)}px, ${kutu.top + kutu.height / 2 - (s.top + s.height / 2)}px)`;
      void e.offsetWidth;
    }
    e.style.transition = `transform ${sure(380)}ms cubic-bezier(0.3, 1.3, 0.5, 1)`;
    e.style.transform = '';
    setTimeout(() => (e.style.transition = ''), sure(400));
    efekt.dokunma();
  }

  /** Çürük komposta: kapak açılır, meyve içine düşer, kompost sevinir */
  async function komposta(km: KasaMeyve, kutu: DOMRect) {
    sonHareket = performance.now();
    const y_ = yuvalar.get(km);
    if (y_) y_.yuva.classList.add('tb-bos', 'tb-gitti');
    yiginYerlestir();
    kompost.classList.remove('pz-parla');
    kompost.classList.add('tb-acik');
    const k = kompost.getBoundingClientRect();
    const uc = h('div.tb-ucan', { style: `left:${kutu.left}px;top:${kutu.top}px;width:${kutu.width}px;height:${kutu.height}px` }, meyveCizimi(km, false));
    app.kok.append(uc);
    const dx = k.left + k.width / 2 - (kutu.left + kutu.width / 2);
    const dy = k.top + k.height * 0.2 - (kutu.top + kutu.height / 2);
    await uc
      .animate(
        [
          { transform: 'translate(0,0) scale(1) rotate(0)' },
          { transform: `translate(${dx * 0.5}px, ${Math.min(dy, 0) - 60}px) scale(.95) rotate(160deg)`, offset: 0.45, easing: 'ease-in' },
          { transform: `translate(${dx}px, ${dy + k.height * 0.25}px) scale(.45) rotate(320deg)`, opacity: 0.2 },
        ],
        { duration: sure(AZ ? 200 : 520), easing: 'cubic-bezier(.3,.2,.6,1)', fill: 'forwards' },
      )
      .finished.catch(() => undefined);
    uc.remove();
    kompostSesi();
    kompost.classList.remove('tb-acik');
    salla(kompost, 'tb-yedi');
    const [x, yy] = oran(kompost, app.kok, 0.2);
    parilti(app.kok, x, yy, 8);
    mino.tepki('sevinc');
    void soyle(rastgele(T.kompost));
    verGuncelle();
  }

  // ---------------------------------------------------------------- kasa (meyve yığını)
  /**
   * Yığın her zaman yerçekimine uygun: alttan meyve alınınca üsttekiler boşluğa düşer (havada meyve kalmaz).
   * Kalan meyveler piramide yeniden dizilir, eski yerlerinden kayarak (FLIP, yalnız translate) iner.
   */
  function yiginYerlestir(gecis = true, haric?: KasaMeyve) {
    const dolu = ist.kasa.filter((km) => yuvalar.has(km) && !yuvalar.get(km)!.yuva.classList.contains('tb-bos'));
    const once = gecis ? new Map(dolu.map((km) => [km, yuvalar.get(km)!.yuva.getBoundingClientRect()])) : null;
    let k = 0;
    yiginSatirlari(dolu.length).forEach((adet, s) => {
      for (let j = 0; j < adet; j++, k++) {
        const yv = yuvalar.get(dolu[k])!.yuva;
        yv.style.setProperty('--x', String(j - (adet - 1) / 2));
        yv.style.setProperty('--s', String(s));
      }
    });
    if (!once || AZ) return;
    for (const km of dolu) {
      if (km === haric) continue;
      const yv = yuvalar.get(km)!.yuva;
      const a = once.get(km)!;
      const b = yv.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (Math.abs(dx) + Math.abs(dy) < 1) continue;
      // düşer, yere basıp hafifçe sekip oturur
      yv.animate(
        [
          { translate: `${dx}px ${dy}px`, easing: 'cubic-bezier(.5,0,.9,.6)' },
          { translate: '0 0', offset: 0.7, easing: 'ease-out' },
          { translate: '0 -5px', offset: 0.85, easing: 'ease-in' },
          { translate: '0 0' },
        ],
        { duration: sure(420) },
      );
    }
  }

  function kasaDiz() {
    sokuler.splice(0).forEach((f) => f());
    yuvalar.clear();
    const satirlar = yiginSatirlari(ist.kasa.length);
    kasa.style.setProperty('--satir', String(satirlar.length));
    kasa.style.setProperty('--sutun', String(satirlar[0]));
    let k = 0;
    const ogeler: HTMLElement[] = [];
    satirlar.forEach((adet, s) => {
      for (let j = 0; j < adet; j++, k++) {
        const km = ist.kasa[k];
        const x = j - (adet - 1) / 2;
        const e = h('div.pz-urun.tb-urun', { 'data-meyve': km.meyve, 'data-curuk': km.curuk ? '1' : '0', role: 'img', 'aria-label': km.curuk ? `${A.curuk} ${km.meyve}` : km.meyve }, h('i.pz-urun-golge'), meyveCizimi(km));
        const yuva = h('div.tb-yuva', { style: `--x:${x};--s:${s};--i:${k}` }, e);
        yuvalar.set(km, { yuva, e });
        ogeler.push(yuva);
        let sonX = 0;
        let sonYy = 0;
        let sonT = 0;
        let vx = 0;
        let vy = 0;
        sokuler.push(
          surukle({
            el: e,
            hedef: () => kantar.hedef,
            aktif: () => aktif && !mesgul && !yuva.classList.contains('tb-bos'),
            basla: () => {
              sonHareket = performance.now();
              efekt.secim();
              if (km.curuk) efekt.vizilti(0.5);
              minoCanli.izleBasla();
              kasa.classList.add('tb-surukleniyor');
              yuva.classList.add('tb-tutulan');
              sonT = performance.now();
            },
            tasi: (x0, y0) => {
              minoCanli.izle(x0);
              const t = performance.now();
              const dt = Math.max(8, t - sonT) / 1000;
              if (sonT && sonX) {
                vx = vx * 0.5 + ((x0 - sonX) / dt) * 0.5;
                vy = vy * 0.5 + ((y0 - sonYy) / dt) * 0.5;
              }
              sonX = x0;
              sonYy = y0;
              sonT = t;
              kompost.classList.toggle('pz-uzerinde', icinde(kompost, x0, y0));
            },
            birak: (hedefte, dokunus) => {
              minoCanli.izleBitti();
              kasa.classList.remove('tb-surukleniyor');
              yuva.classList.remove('tb-tutulan');
              kompost.classList.remove('pz-uzerinde');
              sonHareket = performance.now();
              if (dokunus) {
                geriGonder(e);
                boing(e);
                efekt.nota(2 + (k % 6));
                if (km.curuk) efekt.vizilti(0.6);
                return;
              }
              // teslimde / çürük geri gelirken parmaktaki meyve yığına döner
              if (mesgul) {
                geriGonder(e);
                return;
              }
              if (hedefte && aktif) {
                if (kantar.adet >= LEGEN_KAPASITE) {
                  geriGonder(e);
                  efekt.yanlis();
                  void soyle(T.doldu);
                  return;
                }
                // leğene: yığındaki yer boşalır, meyve parmağın bıraktığı yerden fizikle düşer
                const r = e.getBoundingClientRect();
                yuva.classList.add('tb-bos');
                e.style.transition = 'none';
                e.style.transform = '';
                kantar.birak(km, r.left + r.width / 2, r.top + r.height / 2, vx * 0.6, vy * 0.6);
                yiginYerlestir();
                efekt.yapis();
                ipucuSondur();
                return;
              }
              if (aktif && sonX && icinde(kompost, sonX, sonYy)) {
                if (km.curuk) {
                  const r = e.getBoundingClientRect();
                  e.style.transition = 'none';
                  e.style.transform = '';
                  void komposta(km, r);
                  return;
                }
                tazeAtma();
              }
              geriGonder(e);
            },
          }),
        );
      }
    });
    kasa.replaceChildren(...ogeler);
    yiginYerlestir(false);
  }

  function ipucuSondur() {
    kasa.querySelectorAll('.pz-parla').forEach((x) => x.classList.remove('pz-parla'));
  }

  // uzun süre hareket yoksa: yığındaki sağlam meyveler parlar, "Leğene sürükle!"
  const ipucuSayaci = setInterval(() => {
    if (!aktif || ipucu || TEST_MODU || performance.now() - sonHareket < 12000) return;
    ipucu = true;
    if (kantar.adet === 0) {
      for (const [km, { e }] of yuvalar) if (!km.curuk) e.classList.add('pz-parla');
      void soyle(T.surukle);
    } else if (hazirMi(ist, kantar.icindekiler)) void soyle(T.hazir);
  }, 1000);

  /** Meyveler (kutularından) müşterinin ağzına uçar */
  async function ucur(liste: { km: KasaMeyve; r: DOMRect }[], mu: Musteri, geriGel: boolean) {
    const b = mu.el.getBoundingClientRect();
    const [ax, ay] = mu.karakter.k.agiz;
    const x1 = b.left + b.width * ax;
    // teslimde ağzına; çürük göğsünün önünde tutulur (yüzü, "ııh" ifadesi görünsün)
    const y1 = b.top + b.height * ay + b.height * (geriGel ? 0.24 : 0.06);
    await Promise.all(
      liste.map(async ({ km, r }, i) => {
        const uc = h('div.tb-ucan', { style: `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px` }, meyveCizimi(km, km.curuk));
        app.kok.append(uc);
        const dx = x1 - (r.left + r.width / 2);
        const dy = y1 - (r.top + r.height / 2);
        const yol: Keyframe[] = [
          { transform: 'translate(0,0) scale(1)' },
          { transform: `translate(${dx * 0.45}px, ${Math.min(0, dy) - 70}px) scale(1.05) rotate(${geriGel ? 90 : 200}deg)`, offset: 0.45, easing: 'ease-in' },
          { transform: `translate(${dx}px, ${dy}px) scale(${geriGel ? 0.8 : 0.45}) rotate(${geriGel ? 160 : 400}deg)`, opacity: geriGel ? 1 : 0.7 },
        ];
        await bekle(sure(i * 70));
        await uc.animate(yol, { duration: sure(AZ ? 220 : 560), easing: 'cubic-bezier(.3,.1,.5,1)', fill: 'forwards' }).finished.catch(() => undefined);
        if (!geriGel) {
          uc.remove();
          efekt.nota(5 + (i % 5));
          return;
        }
        // ağzının önünde bir an durur (ıyy), sonra müşteri onu leğene geri atar: leğenin üstüne uçup fizikle düşer
        uc.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.9) rotate(160deg)` }, { transform: `translate(${dx}px, ${dy + 6}px) scale(.85) rotate(150deg)` }], { duration: sure(500), fill: 'forwards' });
        await bekle(sure(AZ ? 200 : 1000));
        if (kapandi) return uc.remove();
        const hr = kantar.hedef.getBoundingClientRect();
        const hx = hr.left + hr.width * (0.38 + Math.random() * 0.24);
        const hy = hr.top + hr.height * 0.12;
        const ex = hx - (r.left + r.width / 2);
        const ey = hy - (r.top + r.height / 2);
        await uc
          .animate(
            [
              { transform: `translate(${dx}px, ${dy + 6}px) scale(.85) rotate(150deg)` },
              { transform: `translate(${(dx + ex) / 2}px, ${Math.min(dy, ey) - 50}px) scale(.95) rotate(250deg)`, offset: 0.5 },
              { transform: `translate(${ex}px, ${ey}px) scale(1) rotate(360deg)` },
            ],
            { duration: sure(AZ ? 200 : 520), easing: 'ease-in-out', fill: 'forwards' },
          )
          .finished.catch(() => undefined);
        uc.remove();
        if (kapandi) return;
        kantar.birak(km, hx, hy, 0, 120);
      }),
    );
  }

  /** Paralar müşteriden Mino'nun sepetine uçar ve içinde kalır */
  async function paraOde(mu: Musteri, adet: number) {
    const a = mu.el.getBoundingClientRect();
    const s = sepet.getBoundingClientRect();
    const x0 = a.left + a.width * 0.55;
    const y0 = a.top + a.height * 0.45;
    const url = adres('pazar/para-1');
    await Promise.all(
      Array.from({ length: adet }, async (_, i) => {
        const p = h('div.tb-para-ucan', { style: `left:${x0}px;top:${y0}px` }, url ? h('img', { src: url, alt: '', draggable: 'false' }) : h('i'));
        app.kok.append(p);
        const dx = s.left + s.width * (0.35 + i * 0.15) - x0;
        const dy = s.top + s.height * 0.35 - y0;
        await bekle(sure(i * 120));
        await p
          .animate(
            [
              { transform: 'translate(-50%,-50%) scale(.3) rotateY(0)', opacity: 0 },
              { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${Math.min(dy, 0) - 80}px)) scale(1.1) rotateY(540deg)`, opacity: 1, offset: 0.5, easing: 'ease-in' },
              { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.8) rotateY(900deg)`, opacity: 1 },
            ],
            { duration: sure(AZ ? 200 : 700), easing: 'ease-out', fill: 'forwards' },
          )
          .finished.catch(() => undefined);
        p.remove();
        paraSesi();
        salla(sepet, 'pz-zipla');
        // sepette biriken paralar (en çok 8)
        if (url && sepetIc.children.length < 8) sepetIc.append(h('img.tb-sepet-para', { src: url, alt: '', draggable: 'false', style: `--i:${sepetIc.children.length}` }));
      }),
    );
  }

  ver.addEventListener('click', async () => {
    if (!aktif || mesgul) return;
    sonHareket = performance.now();
    // parmaktaki ya da havadaki meyve önce leğene insin: "Ver" yalnız leğendekileri sayar
    if (kantar.hareketli) {
      mesgul = true;
      kantar.etkin(false);
      await kantar.otur(1500);
      mesgul = false;
      if (kapandi || !aktif) return;
      kantar.etkin(true);
    }
    const r = tartDenetle(ist, kantar.icindekiler);
    if (r === 'tamam') {
      bitir();
      return;
    }
    if (r === 'curuk') {
      // müşteri çürüğü görür: alır, "ııh" yapar, geri verir (ceza yok)
      mesgul = true;
      kantar.etkin(false);
      const mu = musteri;
      const curuklar = kantar.icindekiler.filter((m) => m.curuk);
      const liste = curuklar.map((km) => ({ km, r: kantar.al(km)! })).filter((x) => x.r);
      if (mu) {
        // geniş kadrajda (kantar müşteriyi örtmesin): çürük müşteriye uçar, ııh, geri gelir
        kam.genis(300);
        mu.el.classList.add('pz-burus');
        const ucus = ucur(liste, mu, true);
        await bekle(sure(500));
        brrSesi();
        await Promise.all([mu.burus(), soyle(T.curuk_ver), ucus]);
        mu.el.classList.remove('pz-burus');
      }
      if (kapandi) return;
      kompost.classList.add('pz-parla');
      void soyle(T.curuk_gordu);
      mesgul = false;
      kantar.etkin(true);
      verGuncelle();
      return;
    }
    verHata++;
    efekt.yanlis();
    salla(kantar.legen, 'tb-hayir');
    void musteri?.hayir();
    void soyle(r === 'az' ? P.az : [P.fazla, T.cikar]);
    if (verHata >= 2 && r === 'az') for (const [km, { e, yuva }] of yuvalar) if (!km.curuk && !yuva.classList.contains('tb-bos')) e.classList.add('pz-parla');
  });

  const tur = async (i: number) => {
    ist = tartIstekUret(y, i, Math.random, i === 0 && zorlaMeyve ? zorlaMeyve : meyveler[i], i === 0 ? zorlaCuruk : undefined);
    ipucu = false;
    hazirDendi = false;
    fazlaDendi = false;
    curukDendi = false;
    verHata = 0;
    mesgul = false;
    canli.gun(i / (TART_MUSTERI - 1));
    kantar.ayarla(ist);
    kantar.etkin(true);
    kasaDiz();
    kompost.classList.remove('pz-parla');
    ver.classList.remove('tb-hazir');
    ver.hidden = true;
    el.dataset.mod = ist.mod;
    delete el.dataset.sayilar;
    testVerisi();

    const ad = musteriler[i];
    musteri?.kapat();
    const mu = new Musteri(ad, resim(`hayvanlar/${ad}`, 'pz-musteri-resim', ad), h('div.pz-istek-balon', {}, istekGorseli(ist)));
    const m = mu.el;
    musteri = mu;
    musteriKap.replaceChildren(m);
    void resimSesi(ad);
    setTimeout(() => minoCanli.karsila(), sure(450));
    kamera.classList.add('pz-yakin');
    sahne.classList.add('pz-yakin');
    kam.odakla(() => Kamera.birlesik(musteriKutusu(kam, musteriKap, true), kam.kutu(mino.el, { alt: -0.35 })), { doluluk: 0.95, enCok: 1.3, sure: 1500 });
    await mu.gel();
    if (kapandi) return;
    mu.bekle(true);

    const bitti = new Promise<void>((r) => (bitir = () => ((aktif = false), r())));
    yazi.textContent = ist.yazi;
    sonHareket = performance.now();
    aktif = true;
    el.classList.add('pz-aktif');
    verGuncelle();
    kam.odakla(() => musteriKutusu(kam, musteriKap, true), { doluluk: 0.9, enCok: 2, sure: 900, dikey: 0.4, tamEkran: true });
    mu.konus(true);
    // çürüklü müşteride sinek bir kez vızıldar (çocuk fark etsin)
    if (ist.kasa.some((x) => x.curuk)) setTimeout(() => !kapandi && efekt.vizilti(0.8), sure(1600));
    await Promise.all([soyle(ist.soz).then(() => mu.konus(false)), bekle(sure(kam.acik ? 1800 : 0))]);
    mu.konus(false);
    if (aktif) kam.genis(1000);
    await bitti;
    el.classList.remove('pz-aktif');
    ver.hidden = true;
    kantar.etkin(false);
    if (kapandi) return;

    // teslim: meyveler müşteriye uçar; müşteri sevinir, paralar sepete, yıldız
    const liste = kantar.kutular().map(({ km, r }) => ({ km, r }));
    kantar.bosalt();
    mino.tepki('sun');
    efekt.dogru();
    void resimSesi(ad);
    kam.genis(300);
    await ucur(liste, mu, false);
    kam.odakla(() => Kamera.birlesik(musteriKutusu(kam, musteriKap, false), kam.kutu(mino.el, { alt: -0.35 })), { doluluk: 0.92, enCok: 1.6, sure: 800, tamEkran: true });
    if (kapandi) return;
    m.classList.add('sevindi');
    mu.kalpler();
    const [mx, my] = oran(m, sahne, 0.45);
    parilti(sahne, mx, my, 10);
    const r = sahne.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width * mx, r.top + r.height * my, 36);
    void odulAni(app.kok, m, yildizlar.children[i] as HTMLElement | undefined, i, mino);
    kayit.yildiz++;
    kaydet();
    const tesekkur = rastgele(T.dogru);
    yazi.textContent = tesekkur;
    await Promise.all([
      soyle(tesekkur),
      paraOde(mu, ist.mod === 'tart' ? 3 : 2),
      (async () => {
        await bekle(sure(300));
        kam.odakla(() => musteriKutusu(kam, musteriKap, false), { doluluk: 0.82, enCok: 2.1, sure: 900, dikey: 0.55, tamEkran: true });
        // patates çiğ yenmez: yalnız dans; ötekilerden bir ısırık
        if (ist.meyve !== 'patates') await mu.ye(resim(`meyveler/${ist.meyve}`, '', ist.meyve), ist.meyve === 'portakal' ? '#FF8A2B' : ist.meyve === 'elma' ? '#F0413F' : '#E8352F', A.nyam);
        await mu.dans();
      })(),
    ]);
    if (kapandi) return;
    m.classList.add('gidiyor');
    minoCanli.ugurla();
    kamera.classList.remove('pz-yakin');
    sahne.classList.remove('pz-yakin');
    kam.genis(1100);
    await mu.git();
  };

  void (async () => {
    await bekle(sure(300));
    if (kapandi) return;
    await soyle(T.giris);
    for (let i = 0; i < TART_MUSTERI && !kapandi; i++) await tur(i);
    if (kapandi) return;
    kayit.senlik++;
    kaydet();
    app.git('senlik', { musteriler, kaynak: 'tart', yildiz: TART_MUSTERI });
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      aktif = false;
      bitir();
      clearInterval(ipucuSayaci);
      sokuler.splice(0).forEach((f) => f());
      minoCanli.kapat();
      mino.kapat();
      canli.kapat();
      flamaKapat();
      kantar.kapat();
      kam.kapat();
      musteri?.kapat();
      app.kok.querySelectorAll('.tb-ucan, .tb-para-ucan, .tb-sayi').forEach((x) => x.remove());
    },
  };
}
