import type harfler from './harfler.json';
import { izSur } from './cizim';
import { kalemiGoster } from './ornek-kalem';
import zamanlar from './yazim-zamanlari.json';
import { cerenKonusuyor, cerenSustur, cerenYuzu } from './konusma-dersi';
import { bosBekleyici } from './bos-bekle';
import { harfYazisi, iziSakla, kalemNo, murekkepler } from './kartlar';
import { dersKutuTurlari } from './ders-sozcukleri';
import { resim } from './resimler';
import { IKON } from '../../src/ui/ikonlar';
import { TEST_MODU } from '../../src/ui/dom';
import { cerenTepkisi } from './ceren-tepki';
import { yazmaEfekti } from './a2-kareler';
import { kareOynat } from './a1-kareler';
import { bitisKutla } from './cila';
import './yazma.css';

const svgNS = 'http://www.w3.org/2000/svg';
const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let dolguNo = 0;

// Astra çizimleri (CLAUDE-ASTRA-MESAJLAR.md · H1 ve H2, 19 Kasım): '01'…'29' resimli büyük harf (600 × 700),
// 'kucuk-01'…'kucuk-29' resimli küçük harf (600 × 800), 'sihirli-kalem' (500 × 500, uç x 90 y 410), 'parilti-0…2'.
// Dosya yoksa bugünkü renk dolumu ve yıldız simgesi kullanılır. Test kipinde test kendi yer tutucusunu verebilir.
const astraCizimleri = import.meta.glob<string>('../../assets/alfabe/resimli-harf/*.webp', { eager: true, query: '?url', import: 'default' });
function astraCizimi(ad: string): string | undefined {
  const deneme = TEST_MODU ? (window as { __resimliHarf?: Record<string, string> }).__resimliHarf?.[ad] : undefined;
  return deneme ?? astraCizimleri['../../assets/alfabe/resimli-harf/' + ad + '.webp'];
}
// Resimli harf tuvalinin defterle eşleşmesi: defterin üst çizgisi (y 22) tuvalde y 100, tabanı (y 100) tuvalde y 620.
const TUVAL_BIRIM = 78 / 520;

/**
 * "Harf canlanır" (19 Kasım 2026): harfi yazmak kâğıt etkinliği değil, sihirli bir an.
 * Harf bitince kalem rengiyle alttan yukarı dolar (Söyle kartındaki gibi); sözcüğün resmi harfin içinden zıplayarak
 * çıkıp harfin yanına konar. `cikti` resim çıkarken çağrılır (sözcüğün kaydı o an çalar). Az hareket ayarında
 * yalnız renk dolar ve resim belirir. Dönen işlev yarım kalan hareketi durdurur.
 */
function harfCanlanir(kagit: HTMLElement, svg: SVGSVGElement, renk: string, gorsel: string, ad: string, cikti: () => void,
  resimli?: { src: string; boy: 700 | 800 }): () => void {
  const sakin = azHareket();
  const kesit = 'yz-dolgu-' + (++dolguNo);
  const defs = document.createElementNS(svgNS, 'defs');
  const clip = document.createElementNS(svgNS, 'clipPath');
  clip.id = kesit;
  const perde = document.createElementNS(svgNS, 'rect');
  perde.setAttribute('x', '0'); perde.setAttribute('width', '100');
  clip.append(perde); defs.append(clip);
  const dolgu = document.createElementNS(svgNS, 'g');
  dolgu.setAttribute('class', 'yz-dolgu'); dolgu.setAttribute('clip-path', 'url(#' + kesit + ')');
  dolgu.style.setProperty('--dolgu', renk);
  for (const yol of svg.querySelectorAll('.iz')) {
    const kopya = yol.cloneNode() as SVGPathElement;
    kopya.setAttribute('class', 'yz-dolgu-yol');
    dolgu.append(kopya);
  }
  svg.prepend(defs);
  // Dolgu çocuğun mürekkebinin altında durur: harf kalınlaşıp renklenir, çocuğun çizgisi üstte görünür.
  svg.insertBefore(dolgu, svg.querySelector('.murekkep'));
  if (resimli) dolgu.style.opacity = '0';
  // getBBox çizgi kalınlığını saymaz: perde, kalın dolgunun yarı kalınlığından geniş açılır.
  const kutu = dolgu.getBBox(), alt = kutu.y + kutu.height + 10, ust = kutu.y - 10;
  const dol = (oran: number) => {
    const y = alt - (alt - ust) * oran;
    perde.setAttribute('y', String(y)); perde.setAttribute('height', String(alt - y));
  };
  const DOLUM = 560;
  let kare = 0;
  if (sakin) dol(1);
  else {
    dol(0);
    const bas = performance.now();
    const ilerle = (t: number) => {
      const o = Math.min(1, (t - bas) / DOLUM);
      dol(1 - (1 - o) ** 3);
      if (o < 1) kare = requestAnimationFrame(ilerle);
    };
    kare = requestAnimationFrame(ilerle);
  }
  const resimEl = document.createElement('img');
  resimEl.className = 'yz-cikan'; resimEl.src = gorsel; resimEl.alt = ad; resimEl.draggable = false;
  // Ekrandaki kutu çizgi kalınlığını saymaz: dolgunun yarı kalınlığı (8 birim) kadar genişletilir.
  const g = dolgu.getBoundingClientRect(), k = kagit.getBoundingClientRect();
  const pay = 8 * (svg.getScreenCTM()?.a ?? 1);
  const h = { left: g.left - pay, right: g.right + pay, top: g.top - pay, width: g.width + 2 * pay, height: g.height + 2 * pay };
  // Resim hep harfin sağına konur. Sağda yer yoksa (dikey ekranda kâğıt dar ve uzun) harfin altına, sağ kenarına hizalı;
  // ikisi de darsa hangisi genişse o (çocuk resmi hep aynı köşede görür). Kâğıdın kenarından KENAR, harften ARALIK uzak durur, boyu boşluğa göre küçülür:
  // harfin üstünü örtmez, kâğıttan taşmaz.
  const KENAR = 12, ARALIK = 8, EN_AZ = 56;
  const ic = { sol: h.left - k.left, sag: h.right - k.left, ust: h.top - k.top, alt: h.top + h.height - k.top };
  const enFazla = Math.min(k.height * .62, 190);
  const yerler = {
    sag: Math.min(k.width - ic.sag - KENAR - ARALIK, k.height - 2 * KENAR),
    alt: Math.min(k.height - ic.alt - KENAR - ARALIK, k.width - 2 * KENAR),
  };
  const yan: 'sag' | 'alt' = yerler.sag >= EN_AZ || yerler.sag >= yerler.alt ? 'sag' : 'alt';
  const boy = Math.max(40, Math.min(enFazla, yerler[yan]));
  const merkez = { x: (ic.sol + ic.sag) / 2, y: (ic.ust + ic.alt) / 2 };
  const sinirla = (d: number, uzunluk: number) => Math.min(uzunluk - KENAR - boy / 2, Math.max(KENAR + boy / 2, d));
  const varis = yan === 'sag'
    ? { x: ic.sag + ARALIK + boy / 2, y: sinirla(merkez.y + h.height * .1, k.height) }
    : { x: sinirla(ic.sag - boy / 2, k.width), y: ic.alt + ARALIK + boy / 2 };
  resimEl.style.width = resimEl.style.height = boy + 'px';
  resimEl.style.left = merkez.x + 'px'; resimEl.style.top = merkez.y + 'px';
  kagit.append(resimEl);
  const dx = varis.x - merkez.x, dy = varis.y - merkez.y;
  const yer = (x: number, y: number, olcek: number) => 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px)) scale(' + olcek + ')';
  let anim: Animation | undefined;
  // Resimli harf: çizilen harf zıplayıp döner, dönüşün ortasında Astra'nın resimli harfine geçer.
  const donusler: Animation[] = [];
  let resimliEl: HTMLImageElement | undefined;
  if (resimli) {
    const ctm = svg.getScreenCTM()!, harfKutusu = dolgu.getBBox();
    const genislik = 600 * TUVAL_BIRIM, yukseklik = resimli.boy * TUVAL_BIRIM;
    const solSvg = harfKutusu.x + harfKutusu.width / 2 - genislik / 2, ustSvg = 22 - 100 * TUVAL_BIRIM;
    resimliEl = document.createElement('img');
    resimliEl.className = 'yz-resimli'; resimliEl.src = resimli.src; resimliEl.alt = ''; resimliEl.draggable = false;
    resimliEl.style.left = (solSvg * ctm.a + ctm.e - k.left) + 'px';
    resimliEl.style.top = (ustSvg * ctm.d + ctm.f - k.top) + 'px';
    resimliEl.style.width = (genislik * ctm.a) + 'px';
    resimliEl.style.height = (yukseklik * ctm.d) + 'px';
    kagit.append(resimliEl);
    const iz = svg.parentElement!;
    if (sakin) {
      donusler.push(iz.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }));
      donusler.push(resimliEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, fill: 'forwards' }));
    } else {
      const ix = iz.getBoundingClientRect();
      iz.style.transformOrigin = (g.left + g.width / 2 - ix.left) + 'px ' + (g.top + g.height / 2 - ix.top) + 'px';
      donusler.push(iz.animate([
        { transform: 'perspective(900px) translateY(0) rotateY(0deg)', opacity: 1 },
        { transform: 'perspective(900px) translateY(-7%) rotateY(90deg)', opacity: 1 },
      ], { duration: 300, easing: 'cubic-bezier(.4,0,.8,.6)', fill: 'forwards' }));
      donusler.push(resimliEl.animate([
        { transform: 'perspective(900px) translateY(-7%) rotateY(-90deg)', opacity: 0, offset: 0 },
        { transform: 'perspective(900px) translateY(-7%) rotateY(-90deg)', opacity: 1, offset: .44 },
        { transform: 'perspective(900px) translateY(1.5%) rotateY(0deg) scale(1.05, .95)', opacity: 1, offset: .8 },
        { transform: 'none', opacity: 1 },
      ], { duration: 680, easing: 'ease-out', fill: 'forwards' }));
    }
  }
  const cikis = window.setTimeout(() => {
    cikti();
    if (sakin) {
      anim = resimEl.animate([{ opacity: 0, transform: yer(dx, dy, 1) }, { opacity: 1, transform: yer(dx, dy, 1) }], { duration: 240, fill: 'forwards' });
      return;
    }
    const tepe = Math.min(k.height * .3, 72);
    anim = resimEl.animate([
      { opacity: 0, transform: yer(0, 0, .12) },
      { opacity: 1, transform: yer(dx * .45, dy * .45 - tepe, 1.08), offset: .46 },
      { opacity: 1, transform: yer(dx, dy + 5, .93), offset: .8 },
      { opacity: 1, transform: yer(dx, dy, 1) },
    ], { duration: 720, easing: 'cubic-bezier(.3,.85,.4,1)', fill: 'forwards' });
  }, sakin ? 0 : resimli ? 620 : DOLUM - 140);
  return () => { cancelAnimationFrame(kare); clearTimeout(cikis); anim?.cancel(); donusler.forEach(a => a.cancel()); };
}

export function kurulYazma(
  container: HTMLElement,
  letter: (typeof harfler)[number],
  small: boolean,
  play: (id: string, next?: () => void, oynarken?: (saniye:number)=>void) => void,
  complete: () => void,
  seciliKalem = 0,
  kalemSec?: (i: number) => void,
  yaziKaydedildi?: () => void,
): () => void {
  const harf = small ? letter.lower : letter.upper;
  // Büyük harfte dersin sözcüğü (Balık), küçük harfte Keşfet'in ikinci sözcüğü (bal): iki adım birbirinin tekrarı olmaz.
  const ikinci = small ? dersKutuTurlari(letter)[1]?.hedef : undefined;
  const sozcuk = ikinci?.gorsel
    ? { ad: ikinci.ad, gorsel: ikinci.gorsel, ses: ikinci.ses }
    : { ad: letter.example, gorsel: resim(letter.id), ses: letter.id + '-label' };
  const resimliSrc = astraCizimi(small ? 'kucuk-' + letter.id : letter.id);
  const resimli = resimliSrc ? { src: resimliSrc, boy: (small ? 800 : 700) as 700 | 800 } : undefined;
  const kalemSrc = astraCizimi('sihirli-kalem');
  const parintilar = ['parilti-0', 'parilti-1', 'parilti-2'].map(astraCizimi).filter((s): s is string => !!s);
  const maskot = small
    ? '<div class="yz-maskot yz-ikili" aria-hidden="true"><img class="yz-anne" src="'+resim(letter.id)+'" alt=""><img class="yz-yavru" src="'+resim(letter.id)+'" alt=""><b>'+letter.upper+' '+letter.lower+'</b></div>'
    : '<div class="yz-maskot" aria-hidden="true"><img src="'+resim(letter.id)+'" alt=""><b>'+letter.upper+'</b></div>';
  container.innerHTML = '<section class="yz-atolye"><div class="yz-ogretmen">' + cerenYuzu('yz-hoca') + maskot + '</div>' +
    '<div class="yz-masalar"><section aria-label="Ceren’in örneği"><h2>Ceren</h2><div class="yz-kagit"><div class="yz-kalem"></div></div></section>' +
    '<section aria-label="Senin yazma alanın"><h2>Sen</h2><div class="yz-kagit"><div class="yz-iz"></div></div></section></div>' +
    '<div class="yz-palet" role="group" aria-label="Albüm kartının kalem rengini seç">' +
    murekkepler.map((k,i) => '<button type="button" data-kalem="' + i + '" aria-label="' + k.ad + ' kalem" style="--kalem-rengi:' + k.renk + '"><span aria-hidden="true"></span></button>').join('') + '</div>' +
    '<div class="yz-kontrol"><button type="button" class="yz-yine" aria-label="Bir daha göster">' + IKON.goz + '</button>' +
    '<p class="yz-soz" role="status"></p></div></section>';
  const sol = container.querySelector<HTMLElement>('.yz-kalem')!;
  const sag = container.querySelector<HTMLElement>('.yz-iz')!;
  const kagit = sag.parentElement!;
  const yazi = container.querySelector<HTMLElement>('.yz-soz')!;
  const tekrar = container.querySelector<HTMLButtonElement>('.yz-yine')!;
  const defterler = container.querySelector<HTMLElement>('.yz-masalar')!;
  const rozet = container.querySelector<HTMLElement>('.yz-maskot')!;
  let calisiyor=true,tamam=false,basladi=false,sira=0,zaman=0,renk=kalemNo(seciliKalem);
  let kalemiDurdur = () => {}, canlanmayiDurdur = () => {};
  // Ceren gösterdikten sonra çocuk kaleme hiç dokunmazsa Ceren harfi bir kez daha yazıp gösterir.
  const bos = bosBekleyici(() => { if (calisiyor && !tamam && !basladi) anlat(); });
  // Köşedeki resim de keşifteki gibi adını söyler. Ceren konuşurken sözünü kesmez, yalnız zıplar.
  rozet.onclick = () => {
    rozet.classList.remove('yz-maskot-zipla');
    void rozet.offsetWidth;
    rozet.classList.add('yz-maskot-zipla');
    if (tamam || cerenKonusuyor()) return;
    bos.dur();
    play(letter.id + '-label', () => { if (calisiyor && !tamam && !basladi) bos.kur(); });
  };
  const kalemler = [...container.querySelectorAll<HTMLButtonElement>('[data-kalem]')];
  function renkSec(i: number) {
    renk=i;
    sag.style.setProperty('--yazim', murekkepler[i].renk);
    kalemler.forEach((b,j) => b.setAttribute('aria-pressed', String(j === i)));
  }
  renkSec(kalemNo(seciliKalem));
  kalemler.forEach((b,i) => b.onclick = () => {
    if (tamam) return;
    renkSec(i); kalemSec?.(i);
  });
  // Biten vuruş bir an parlayıp yerine oturur ("tık" sesi cizim.ts'den gelir).
  // Paket Harf-A2: Ceren'in tepki pozları ve kalem ucunda mürekkep damlası (kareler gelince; yoksa hiçbir şey olmaz).
  const ceren = () => container.querySelector<HTMLElement>('.yz-ogretmen .alf-ceren') ?? undefined;
  const damla = yazmaEfekti();
  function vurusuParlat() {
    if (azHareket()) return;
    const son = [...sag.querySelectorAll<SVGPathElement>('.murekkep')].at(-1);
    if (!son) return;
    if (damla) {
      const ctm = son.getScreenCTM(), uzun = son.getTotalLength();
      if (ctm && uzun) { const u = son.getPointAtLength(uzun).matrixTransform(ctm); kareOynat(damla, u.x, u.y, Math.max(48, Math.min(sag.clientHeight * .18, 90)), 95); }
    }
    son.classList.remove('yz-parla'); void son.getBoundingClientRect(); son.classList.add('yz-parla');
  }

  const iz = izSur(sag, harf, cizgiler => {
    tamam = true;
    // An çocuğun kendi harfinde olur: dar ekranda da çocuğun defteri açık kalır.
    defterler.dataset.sira='sen';
    sira++;
    iziSakla(letter.id,small,renk,cizgiler);
    yaziKaydedildi?.();
    kalemiDurdur();
    kalemiDurdur = kalemiGoster(sol, harf, false);
    tekrar.disabled = true;
    kalemler.forEach(b => b.disabled = true);
    rozet.classList.add('yz-maskot-tamam');
    if(small){
      sol.innerHTML=harfYazisi(letter);
      sol.setAttribute('aria-label',letter.upper+' ve '+letter.lower+', senin harflerin.');
    }
    vurusuParlat();
    cerenTepkisi(ceren(), 'alkis', 1600);
    // Harf tamam: kâğıtta kutlama (pırıltılar; Ceren alkışlar ve sıçrar).
    requestAnimationFrame(() => { if (calisiyor) bitisKutla(kagit); });
    yazi.textContent=sozcuk.ad+'!';
    let sesBitti=false,hareketBitti=false,gecildi=false;
    function ilerle(){if(calisiyor&&sesBitti&&hareketBitti&&!gecildi){gecildi=true;complete();}}
    zaman=window.setTimeout(()=>{hareketBitti=true;ilerle();},azHareket()?700:1450);
    sihirliKalem?.classList.add('yz-kalem-gitti');
    canlanmayiDurdur = harfCanlanir(kagit, sag.querySelector('svg')!, murekkepler[renk].renk, sozcuk.gorsel, sozcuk.ad, () => {
      if (calisiyor) play(sozcuk.ses,()=>{if(calisiyor)play('good',()=>{sesBitti=true;ilerle();});});
    }, resimli);
  }, () => {
    vurusuParlat();
    cerenTepkisi(ceren(), 'sevinc', 650);
    rozet.classList.remove('yz-maskot-zipla');
    void rozet.offsetWidth;
    rozet.classList.add('yz-maskot-zipla');
  }, kalemeDokun);

  // Işık izi: mürekkebin ucu çizgi boyunca ilerledikçe küçük ışıklar parlar (yalnız çizgi üzerinde ilerlerken;
  // mürekkep yalnız doğru yolda uzar). Yeni çizim yok: IKON.yildiz.
  const defter = sag.querySelector<SVGSVGElement>('svg')!;
  let sonIsik: DOMPoint | undefined, sonIsikZamani = 0;
  // Sihirli kalem (H1): parmağı, yani mürekkebin ucunu izler; ucu (tuvalde x 90, y 410) mürekkebin üstünde durur.
  let sihirliKalem: HTMLImageElement | undefined;
  function kalemiTasi(x: number, y: number) {
    if (!kalemSrc || tamam || azHareket()) return;
    if (!sihirliKalem) {
      sihirliKalem = document.createElement('img');
      sihirliKalem.className = 'yz-sihirli-kalem'; sihirliKalem.src = kalemSrc; sihirliKalem.alt = ''; sihirliKalem.draggable = false;
      kagit.append(sihirliKalem);
    }
    const boy = Math.max(56, Math.min(kagit.clientHeight * .3, 130));
    sihirliKalem.style.width = sihirliKalem.style.height = boy + 'px';
    sihirliKalem.style.left = (x - boy * 90 / 500) + 'px';
    sihirliKalem.style.top = (y - boy * 410 / 500) + 'px';
  }
  const isikGozcusu = new MutationObserver(degisimler => {
    if (tamam || azHareket()) return;
    const yol = degisimler[degisimler.length - 1].target as SVGPathElement;
    if (!(yol instanceof SVGPathElement) || !yol.classList.contains('murekkep')) return;
    const uzunluk = yol.getTotalLength();
    const uc = yol.getPointAtLength(uzunluk), simdi = performance.now();
    const kalemUcu = uc.matrixTransform(defter.getScreenCTM()!), kk = kagit.getBoundingClientRect();
    kalemiTasi(kalemUcu.x - kk.left, kalemUcu.y - kk.top);
    if (sonIsik && Math.hypot(sonIsik.x - uc.x, sonIsik.y - uc.y) < 5 && simdi - sonIsikZamani < 140) return;
    sonIsik = uc; sonIsikZamani = simdi;
    const ekran = uc.matrixTransform(defter.getScreenCTM()!), k = kagit.getBoundingClientRect();
    const isik = document.createElement('i');
    isik.className = 'yz-isik'; isik.setAttribute('aria-hidden', 'true');
    // Parıltı çizimleri (H1) gelince onlar, gelene kadar yıldız simgesi.
    isik.innerHTML = parintilar.length ? '<img src="' + parintilar[Math.floor(Math.random() * parintilar.length)] + '" alt="" draggable="false">' : IKON.yildiz;
    isik.style.left = (ekran.x - k.left) + 'px'; isik.style.top = (ekran.y - k.top) + 'px';
    isik.style.setProperty('--donus', Math.round(Math.random() * 80 - 40) + 'deg');
    kagit.append(isik);
    isik.addEventListener('animationend', () => isik.remove(), { once: true });
  });
  isikGozcusu.observe(defter, { subtree: true, attributes: true, attributeFilter: ['d'] });

  function anlat() {
    if (tamam || !calisiyor) return;
    bos.dur();
    kalemiDurdur();
    const id = letter.id + (small ? '-small' : '-big');
    defterler.dataset.sira='ceren';
    const araliklar = (zamanlar as Record<string,number[][]>)[id];
    let konum = 0;
    kalemiDurdur = kalemiGoster(sol, harf, true, {araliklar,zaman:()=>konum});
    basladi=false;
    const bu=++sira;
    yazi.textContent='';
    play(id, () => {
      if (calisiyor && !tamam && bu===sira) {
        konum=araliklar[araliklar.length-1][1];
        defterler.dataset.sira='sen';
        yazi.textContent = 'Şimdi sen çiz.';
        cerenTepkisi(ceren(), 'kalem-uzat', 1600);
        if (!basladi) bos.kur();
      }
    }, saniye=>{konum=saniye;});
  }
  function kalemeDokun(){
    bos.dur();
    if(!tamam&&!basladi){
      basladi=true;sira++;cerenSustur();yazi.textContent='';
      cerenTepkisi(ceren(), 'kalem-goster', 900);
      defterler.dataset.sira='sen';
      kalemiDurdur();
      kalemiDurdur=kalemiGoster(sol, harf, false);
    }
  }
  tekrar.onclick = anlat;
  anlat();
  return () => {
    calisiyor = false;
    bos.kapat();
    isikGozcusu.disconnect();
    canlanmayiDurdur();
    rozet.onclick = null;
    clearTimeout(zaman);
    kalemiDurdur();
    iz.kapat();
    tekrar.onclick = null;
  };
}
