import type dersler from './harfler.json';
import { dersKutuTurlari } from './ders-sozcukleri';
import { cerenSustur, cerenYuzu } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { bosBekleyici } from './bos-bekle';
import { IKON } from '../../src/ui/ikonlar';
import { gunlukYanlis } from './gunluk';
import { An, azHareket, canlanmaCizimi, isikSac, kabaGore } from './canlanma';
import sesMetinleri from '../ses-metinleri.json';
import './harfi-kesfet.css';
import { resmiCanlandir } from './kesfet-canlanma';
import { cerenTepkisi } from './ceren-tepki';
import { pariltiIzi, tozNokta } from './cila';
import { efektKareleri, kaynakAdi, ogedeOynat, sozcukKareleri, tusKareleri } from './a1-kareler';

type Ders = typeof dersler[number];
type Oku = (id: string, sonra?: () => void, oynarken?: (saniye:number) => void) => void;
type Bolum = {ses:string; kart?:number; isaret?:'ornek'|'cevap'|'ikisi'; altYazi?:string; basla?:()=>void};
const replikler:Readonly<Record<string,string>>=sesMetinleri;

export function harfiKesfetKur(alan: HTMLElement, ders: Ders, oku: Oku, sonraki: () => void) {
  const kartlar = dersKutuTurlari(ders).map(t => t.hedef);
  const sesOrnegi = 'mik-parca-' + ders.lower.codePointAt(0)!.toString(16);
  const soru = ders.lower === 'ğ' ? 'kesif-sor-ic' : 'kesif-sor-ilk';
  const ekran = document.createElement('section');
  ekran.className = 'hf-kesif';
  // Astra'nın harf tuşları (Paket Harf-A1, dokuz parça) gelince düz CSS tuşunun yerine geçer.
  const tuslar = tusKareleri();
  if (tuslar) { ekran.classList.add('hf-tuslu'); ['--tus', '--tus-basili', '--tus-bulundu', '--tus-ipucu'].forEach((ad, i) => ekran.style.setProperty(ad, 'url("' + tuslar[i] + '")')); }
  ekran.setAttribute('aria-label', ders.upper + ' harfini iki sözcükte keşfet');
  ekran.innerHTML = '<div class="hf-hoca">' + cerenYuzu() + '</div>' +
    '<div class="hf-pano"><div class="hf-ust"><div class="hf-harf" aria-label="Büyük ve küçük harf">' +
    ders.upper + '<span>' + ders.lower + '</span></div>' +
    '<button type="button" class="hf-ses" aria-label="Ceren’i yeniden dinle">' + IKON.hoparlor + '</button></div>' +
    '<p class="hf-yon" role="status"></p><div class="hf-kartlar"></div></div>';
  const yon = ekran.querySelector<HTMLElement>('.hf-yon')!;
  const ara = ders.lower === 'ğ' ? 'Sözcüğün içindeki ğ’ye dokun.' : 'İkinci sözcüğün ilk harfine dokun.';
  const kartAlani = ekran.querySelector<HTMLElement>('.hf-kartlar')!;
  const ses = ekran.querySelector<HTMLButtonElement>('.hf-ses')!;
  const resimler: HTMLButtonElement[] = [];
  const harfler: HTMLElement[][] = [];
  const cevaplar:HTMLButtonElement[]=[];
  let kapali = false, konusma = 0, hazir = false, tamam = false, hedefAn = -Infinity;
  let yanlisSayisi=0;
  // Çocuk soruyu duyup hiç dokunmazsa Ceren en fazla iki kez hatırlatır; ikincisinde doğru harf belirir.
  const bos = bosBekleyici(kacinci => {
    if (tamam || kapali) return;
    if (kacinci === 2) { ekran.classList.add('hf-yardim'); ipucuAni(); }
    zincir([{...hedefiDinle(), basla:undefined}, dersSorusu()], () => { yon.textContent = ara; bosBekle(); });
  });
  const bosBekle = () => { if (hazir && !tamam && !kapali) bos.kur(); };
  let hareket: Animation | undefined;
  const an = new An();
  const telaffuz = (metin: string) => metin.toLocaleLowerCase('tr');
  const hedefMi = (h: HTMLElement) => h.dataset.hedef === 'evet';
  function zincir(kayitlar: Bolum[], sonra?: () => void) {
    const sira = ++konusma;
    function ilerle(i: number) {
      if (kapali || sira !== konusma) return;
      if(i===kayitlar.length){sonra?.();return;}
      const bolum=kayitlar[i];
      let basladi=false;
      function goster(){
        if(basladi||kapali||sira!==konusma)return;
        basladi=true;
        for(const [n,kart] of Array.from(kartAlani.children).entries()){
          kart.classList.toggle('hf-okunuyor',bolum.kart===n);
          isaret(n,bolum.isaret==='ikisi'||(n===0?bolum.isaret==='ornek':bolum.isaret==='cevap'));
        }
        yon.textContent=bolum.altYazi??replikler[bolum.ses];
        if(bolum.ses===kartlar[1].ses)hedefAn=performance.now();
        // Ses duyulunca resim kendi hareketiyle canlanır (balon şişer, balık yüzer, tavşan zıplar; kesfet-canlanma.ts).
        if(bolum.kart!==undefined)resmiCanlandir(resimler[bolum.kart]?.querySelector('img'),kartlar[bolum.kart].ad,false,sozcukKareleri(kaynakAdi(kartlar[bolum.kart].id)));
        // Harf sesi duyulunca resmin çevresinde ses dalgası (Astra efekt kareleri gelince).
        if(bolum.ses===sesOrnegi)ogedeOynat(resimler[0]?.querySelector('img'),efektKareleri('dalga'),1.35,110);
        bolum.basla?.();
      }
      // Ön yükleme gecikse bile renk gerçek sesle başlar. Ses açılamazsa metinle devam eder.
      oku(bolum.ses,()=>{goster();ilerle(i+1);},goster);
    }
    ilerle(0);
  }
  function isaret(i: number, ac: boolean) {
    harfler[i].filter(hedefMi).forEach(h => h.classList.toggle('hf-bulundu', ac));
  }
  /** İpucu anı: Ceren doğru harfi işaret eder, elinden harfe sırayla yanan pırıltı izi uzanır, harf halkayla nabız gibi atar. */
  function ipucuAni() {
    const hedef = cevaplar.find(hedefMi), c = ekran.querySelector<HTMLElement>('.hf-hoca .alf-ceren');
    if (!hedef) return;
    cerenTepkisi(c ?? undefined, 'isaret', 1800);
    const a = (c ?? ekran).getBoundingClientRect(), b = hedef.getBoundingClientRect();
    pariltiIzi(a.left + a.width * .62, a.top + a.height * .45, b.left + b.width / 2, b.top + b.height / 2);
    hedef.classList.remove('hf-ipucu-ani'); void hedef.offsetWidth; hedef.classList.add('hf-ipucu-ani');
    window.setTimeout(() => hedef.classList.remove('hf-ipucu-ani'), 2700);
  }
  /** Yanlış harfte komik pof sahnesi. */
  function pofSahnesi(tus: HTMLElement) {
    const r = tus.getBoundingClientRect();
    tozNokta(r.left + r.width / 2, r.top + r.height / 2, 8, Math.max(34, r.width * .7));
    tus.classList.remove('hf-pof'); void tus.offsetWidth; tus.classList.add('hf-pof');
    window.setTimeout(() => tus.classList.remove('hf-pof'), 700);
    const img = resimler[1]?.querySelector('img');
    if (img && !azHareket()) img.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)', offset: .2 }, { transform: 'rotate(7deg)', offset: .45 }, { transform: 'rotate(-4deg)', offset: .7 }, { transform: 'rotate(0)' }], { duration: 620, easing: 'ease-in-out', composite: 'add' });
  }
  function siraCocukta() {
    // Sıra çocukta: Ceren kartları işaret eder (Paket Harf-A1 pozu gelince).
    cerenTepkisi(ekran.querySelector<HTMLElement>('.hf-hoca .alf-ceren') ?? undefined, 'isaret', 1300);
    hazir = true;
    ekran.dataset.adim = 'bul';
    for(const t of cevaplar)t.disabled=false;
  }
  function hedefiDinle():Bolum {
    return {ses:kartlar[1].ses,kart:1,altYazi:kartlar[1].ad,basla:siraCocukta};
  }
  function dersSorusu():Bolum {
    return {ses:soru,kart:1};
  }
  function dinle(i: number) {
    if (tamam || kapali) return;
    bos.dur();
    const kayit:Bolum=i===0?{ses:kartlar[0].ses,kart:0,isaret:'ornek'}:hedefiDinle();
    // Resmin düğmesi yalnız kendi adını tekrarlar. İlk dinleyişi keserse görev sorusunu tamamla.
    if(hazir){zincir([kayit],()=>{kartAlani.children[i].classList.remove('hf-okunuyor');yon.textContent=ara;bosBekle();});return;}
    zincir(i===1?[kayit,dersSorusu()]:[kayit,hedefiDinle(),dersSorusu()],bosBekle);
  }
  function karar(h: HTMLButtonElement) {
    if (!hazir || tamam || kapali) return;
    bos.dur();
    if (!hedefMi(h)) {
      yanlisSayisi++;gunlukYanlis(ders.id);
      if(yanlisSayisi===2){ekran.classList.add('hf-yardim');ipucuAni();}
      // Yanlışta komik "pof": tuştan toz kabarır, tuş griye dönüp yaylanır, hedef sözcüğün resmi "yok yok" der gibi
      // başını sallar (ceza yok; çocuk güler, yeniden dener).
      pofSahnesi(h);
      const yardim=ders.lower === 'ğ' ? 'Üstünde yay olan ğ’yi bul.' : 'Sözcüğün başladığı yere bak.';
      yon.textContent=yardim;
      hareket?.cancel();
      oyunSesi('geri');
      ogedeOynat(h,efektKareleri('pof'),2.4,130);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        hareket = h.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(3px)'},{transform:'none'}],{duration:250});
      }
      zincir([{ses:'kesif-tekrar',kart:0},{ses:kartlar[0].ses,kart:0,isaret:'ornek'},
        {...hedefiDinle(),basla:undefined}],()=>{yon.textContent=yardim;bosBekle();});
      return;
    }
    tamam = true;
    ekran.classList.remove('hf-yardim');
    yon.textContent = kartlar[1].ad;
    ekran.dataset.adim = 'bulundu';
    isaret(1, true);
    for (const b of [...resimler, ...cevaplar, ses]) b.disabled = true;
    oyunSesi('birles');
    bulunduAni(h);
    // Bulununca iki resim birlikte, daha coşkulu canlanır.
    resimler.forEach((r,i)=>resmiCanlandir(r.querySelector('img'),kartlar[i].ad,true,sozcukKareleri(kaynakAdi(kartlar[i].id))));
    ogedeOynat(h,efektKareleri('yildiz'),3.2,90);
    window.setTimeout(()=>cerenTepkisi(ekran.querySelector<HTMLElement>('.hf-hoca .alf-ceren') ?? undefined, 'alkis', 1400), 650);
    // Tempo (22 Kasım): çocuk sözcüğü az önce duyduysa (Ceren söylerken ya da hemen ardından dokundu) Ceren onu
    // art arda yinelemez, doğrudan "Buldun!" der. Sonradan bulduysa sözcük harfi yanarak bir kez daha okunur.
    const azOnce = performance.now() - hedefAn < 2500;
    zincir([...(azOnce ? [] : [{ses:kartlar[1].ses,kart:1,isaret:'cevap' as const}]), {ses:'kesif-bitti',isaret:'ikisi'}], sonraki);
  }
  // Bulma anı (H7): büyüteç harfin üstüne gelir, harf camın altında büyür; büyüteç kalkınca harf yıldızına oturur,
  // sonra küçülüp üstteki harf rozetine uçar. Ders akışını beklemez, Ceren konuşurken olur. Çizimler gelene kadar
  // büyüteç yalnız cam halkası, yıldız rozetin yerine ışık saçılır.
  function bulunduAni(h: HTMLElement) {
    const rozet = ekran.querySelector<HTMLElement>('.hf-harf')!;
    const yildiz = canlanmaCizimi('kesif/harf-yildizi');
    let yildizEl: HTMLImageElement | undefined;
    if (yildiz) {
      yildizEl = an.ekle(h, document.createElement('img'));
      yildizEl.className = 'hf-yildiz'; yildizEl.src = yildiz; yildizEl.alt = ''; yildizEl.draggable = false;
      h.classList.add('hf-yildizli');
    }
    if (azHareket()) { rozet.classList.add('hf-rozet-parla'); return; }
    if (yildizEl) yildizEl.style.opacity = '0';
    const r = kabaGore(ekran, h), D = Math.max(r.h * 2.5, 96);
    const mercek = an.ekle(ekran, document.createElement('div'));
    mercek.className = 'hf-mercek'; mercek.setAttribute('aria-hidden', 'true');
    // Harf ekranın altına yakınsa (yatay telefon) büyüteç biraz yukarıda durur, ekrandan taşmaz.
    const sol = Math.max(6, Math.min(r.cx - D / 2, ekran.clientWidth - D - 6)), ust = Math.max(6, Math.min(r.cy - D / 2, ekran.clientHeight - D - 6));
    Object.assign(mercek.style, { left: sol + 'px', top: ust + 'px', width: D + 'px', height: D + 'px' });
    const buyuk = document.createElement('span');
    buyuk.className = 'hf-mercek-harf'; buyuk.textContent = h.textContent;
    buyuk.style.fontSize = parseFloat(getComputedStyle(h).fontSize) * 2.1 + 'px';
    mercek.append(buyuk);
    const cizim = canlanmaCizimi('kesif/buyutec');
    if (cizim) {
      // Astra'nın büyüteci (500 × 500): camın içi x 60…360, y 60…360; cam, harfin üstündeki halkaya oturur.
      const s = D / 300, img = document.createElement('img');
      img.className = 'hf-mercek-cizim'; img.src = cizim; img.alt = ''; img.draggable = false;
      Object.assign(img.style, { left: D / 2 - 210 * s + 'px', top: D / 2 - 210 * s + 'px', width: 500 * s + 'px', height: 500 * s + 'px' });
      mercek.classList.add('hf-mercek-astra'); mercek.append(img);
    }
    an.hareket(mercek, [{ transform: 'translate(18%,22%) scale(.3) rotate(-12deg)', opacity: 0 },
      { transform: 'translate(0,-3%) scale(1.06) rotate(2deg)', opacity: 1, offset: .62 }, { transform: 'none', opacity: 1 }],
      { duration: 380, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    an.hareket(buyuk, [{ transform: 'scale(.48)' }, { transform: 'scale(.48)', offset: .2 }, { transform: 'scale(1.12)', offset: .75 }, { transform: 'scale(1)' }],
      { duration: 620, easing: 'ease-out', fill: 'forwards' });
    an.sonra(1050, () => {
      an.hareket(mercek, [{ transform: 'none', opacity: 1 }, { transform: 'translate(14%,-18%) scale(.7) rotate(10deg)', opacity: 0 }],
        { duration: 280, easing: 'ease-in', fill: 'forwards' }).finished.then(() => an.kaldir(mercek), () => {});
      an.hareket(h, [{ transform: 'scale(1)' }, { transform: 'scale(1.38)', offset: .45 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
      if (yildizEl) an.hareket(yildizEl, [{ transform: 'translate(-50%,-50%) scale(.2) rotate(-40deg)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.15) rotate(6deg)', opacity: 1, offset: .6 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }],
        { duration: 460, easing: 'ease-out', fill: 'forwards' });
      else isikSac(an, ekran, r.cx, r.cy, { adet: 8, uzaklik: r.h * 1.4, boy: Math.max(22, r.h * .7) });
    });
    // Harf, dersin harf rozetine uçar; rozet sevinçle zıplar.
    an.sonra(1500, () => {
      const hedef = kabaGore(ekran, rozet), b = kabaGore(ekran, h);
      const ucan = an.ekle(ekran, document.createElement('span'));
      ucan.className = 'hf-ucan-harf'; ucan.textContent = h.textContent; ucan.setAttribute('aria-hidden', 'true');
      ucan.style.fontSize = getComputedStyle(h).fontSize;
      Object.assign(ucan.style, { left: b.cx + 'px', top: b.cy + 'px' });
      const dx = hedef.cx - b.cx, dy = hedef.cy - b.cy;
      an.hareket(ucan, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx * .5 + 'px), calc(-50% + ' + (dy * .5 - 40) + 'px)) scale(1.5)', opacity: 1, offset: .5 },
        { transform: 'translate(calc(-50% + ' + dx * .94 + 'px), calc(-50% + ' + dy * .94 + 'px)) scale(1)', opacity: 1, offset: .88 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.8)', opacity: 0 }],
        { duration: 620, easing: 'cubic-bezier(.4,.1,.5,1)', fill: 'forwards' }).finished.then(() => {
        an.kaldir(ucan);
        oyunSesi('parilti');
        an.hareket(rozet, [{ transform: 'scale(1)' }, { transform: 'scale(1.16) rotate(-3deg)', offset: .4 }, { transform: 'scale(1)' }], { duration: 440, easing: 'ease-out' });
        rozet.classList.add('hf-rozet-parla');
        isikSac(an, ekran, hedef.cx, hedef.cy, { adet: 7, uzaklik: hedef.h * 1.2, boy: Math.max(20, hedef.h * .55) });
      }, () => {});
    });
  }
  for (const [i, kart] of kartlar.entries()) {
    const kartEl = document.createElement('div');
    kartEl.className = 'hf-kart';
    const resim = document.createElement('button');
    resim.type = 'button';
    resim.className = 'hf-resim';
    resim.setAttribute('aria-label', kart.ad + ' adını dinle');
    resim.innerHTML = '<img src="' + kart.gorsel + '" alt="" draggable="false">';
    resim.onclick = () => dinle(i);
    resimler.push(resim);
    const yazi = document.createElement('div');
    yazi.className = 'hf-yazi';
    yazi.setAttribute('role', 'group');
    yazi.setAttribute('aria-label', kart.ad);
    harfler.push([]);
    for (const [j, sozcuk] of kart.ad.split(/\s+/).entries()) {
      const satir = document.createElement('div');
      satir.className = 'hf-sozcuk';
      // Nokta ve boşluklar harflerden ayrı tutulur. “El arabası” iki gerçek sözcük olarak okunur.
      const harfDizisi = Array.from(telaffuz(sozcuk));
      for (const [n, h] of harfDizisi.entries()) {
        const tus = document.createElement(i===0?'span':'button');
        tus.className = 'hf-hucre';
        tus.dataset.harf = h;
        if (h === ders.lower && (ders.lower === 'ğ' || (j === 0 && n === 0))) tus.dataset.hedef = 'evet';
        tus.textContent = i === 0 && n === 0 && j === 0 ? h.toLocaleUpperCase('tr') : h;
        if(tus instanceof HTMLButtonElement){
          tus.type='button';tus.disabled=true;
          tus.setAttribute('aria-label',tus.textContent+', '+(harfler[i].length+1)+'. harf');
          tus.onclick=()=>karar(tus);
          cevaplar.push(tus);
        }else tus.setAttribute('aria-hidden','true');
        harfler[i].push(tus);
        satir.append(tus);
      }
      yazi.append(satir);
    }
    kartEl.append(resim, yazi);
    kartAlani.append(kartEl);
  }
  function baslat() {
    if (tamam || kapali) return;
    bos.dur();
    yon.textContent = hazir ? ara : 'İki sözcüğü dinle.';
    ekran.dataset.adim = hazir ? 'bul' : 'dinle';
    zincir([
      {ses:kartlar[0].ses,kart:0,isaret:'ornek'},
      {ses:sesOrnegi,kart:0,isaret:'ornek'},
      hedefiDinle(),dersSorusu()
    ], bosBekle);
  }
  ses.onclick = baslat;
  alan.replaceChildren(ekran);
  baslat();
  return () => {
    kapali = true;
    konusma++;
    bos.kapat();
    hareket?.cancel();
    an.durdur();
    cerenSustur();
    ekran.remove();
  };
}
