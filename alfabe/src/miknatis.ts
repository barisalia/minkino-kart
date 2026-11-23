import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import type dersler from './harfler.json';
import { oyunSesi } from './oyun-sesi';
import { cerenSustur } from './konusma-dersi';
import { kelimeResmi } from './kelime-resmi';
import { bosBekleyici } from './bos-bekle';
import { gunlukYanlis } from './gunluk';
import { An, canlanmaCizimi, canlanmaKareleri, isikSac, kabaGore } from './canlanma';
import { oltaAcik, oltaCizimi } from './h14-cizimler';
import { resmiCanlandir } from './kesfet-canlanma';
import { bitisKutla, cerenSevinsin } from './cila';
import { sozcukKareleri } from './a1-kareler';
import './miknatis.css';

type Ders = typeof dersler[number];
type Oku = (id:string, bitti?:()=>void, oynarken?:(saniye:number)=>void) => void;

function nesne<K extends keyof HTMLElementTagNameMap>(tur: K, sinif: string, metin = '') {
  const oge = document.createElement(tur);
  oge.className = sinif;
  oge.textContent = metin;
  return oge;
}

function karistir(parcalar: string[]) {
  const sonuc = [...parcalar];
  for (let i = sonuc.length - 1; i > 0; i--) {
    const n = Math.floor(Math.random() * (i + 1));
    [sonuc[i], sonuc[n]] = [sonuc[n], sonuc[i]];
  }
  return sonuc;
}

function oltaAnlatildi() {
  try { if (sessionStorage.getItem('minkino-olta-anlatildi')) return true; sessionStorage.setItem('minkino-olta-anlatildi', '1'); } catch { /* depolama kapalı */ }
  return false;
}

export function miknatisKur(container: HTMLElement, ders: Ders, play: Oku, next: () => void, sonDugme='Albüm kartımı gör'): () => void {
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heceli = (ders.word.match(/[aeıioöuü]/g) ?? []).length > 1;
  const parcalar = heceli ? ders.units : [...ders.word];
  const kayitAnahtari = 'minkino-miknatis-' + ders.id;
  function parcaSesi(parca: string) {
    const kod = [...parca].map(h => h.codePointAt(0)!.toString(16)).join('-');
    if (heceli && (parca === 'ör' || parca === 'dek')) return 'tren-parca-' + kod;
    // Tek ünlü, “ılık”ta kendi başına hece; “kış”ta bir harftir.
    return (heceli && parca.length === 1 ? 'mik-hece-' : 'mik-parca-') + kod;
  }
  const ekran = nesne('section', 'mik-ders');
  // Paket Harf-H14 (h14-cizimler.ts): çizimler gelince Mıknatıslı Olta. Parçalar gölette yüzen balıkların üstündedir;
  // doğru balığa dokununca olta iner, balığı tutar, parça yerine uçar. Ders, sesler ve kayıt aynı; yalnız görünüş ve an.
  const olta = oltaAcik();
  if (olta) ekran.classList.add('mik-olta');
  const resimOge = (sinif: string, src: string) => { const r = nesne('img', sinif) as HTMLImageElement; r.src = src; r.alt = ''; r.draggable = false; r.setAttribute('aria-hidden', 'true'); return r; };
  const baslik = nesne('h1', 'mik-baslik', 'Mıknatısları birleştir');
  const ornek = nesne('div', 'mik-ornek');
  const tekrar = nesne('button', 'mik-sozcuk', ders.word);
  tekrar.type = 'button';
  tekrar.setAttribute('aria-label', ders.word + ' kelimesini ve yönergeyi dinle');
  const simge = nesne('span','mik-ses');
  simge.setAttribute('aria-hidden','true');
  simge.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4zM17 9q3 3 0 6M20 6q6 6 0 12"/></svg>';
  tekrar.prepend(simge);
  const cizim = kelimeResmi(ders.word);
  if (cizim) {
    const kucukResim = document.createElement('img');
    kucukResim.className = 'mik-ipucu-resim';
    kucukResim.src = cizim;
    kucukResim.alt = '';
    kucukResim.draggable = false;
    tekrar.prepend(kucukResim);
  }
  ornek.append(tekrar);
  const levha = nesne('div', 'mik-levha');
  levha.setAttribute('role', 'group');
  levha.setAttribute('aria-label', 'Mıknatıs yerleri');
  const yuvalar = parcalar.map((parca, i) => {
    const yuva = nesne('div', 'mik-yuva', parca);
    yuva.dataset.yuva = String(i);
    yuva.setAttribute('aria-label', (i + 1) + '. yer: ' + parca);
    return yuva;
  });
  const kelime = nesne('strong', 'mik-kelime', ders.word);
  kelime.hidden = true;
  const odul = nesne('div', 'mik-odul');
  odul.hidden = true;
  odul.setAttribute('aria-hidden', 'true');
  if (cizim) odul.innerHTML = '<img src="' + cizim + '" alt="" draggable="false">';
  levha.append(...yuvalar, odul, kelime);
  const tepsi = nesne('div', 'mik-tepsi');
  const oltaResmi = olta ? resimOge('mik-olta-resmi', oltaCizimi('olta')) : undefined;
  if (olta) tepsi.append(resimOge('mik-gol-resmi', oltaCizimi('gol')));
  const durum = nesne('p', 'mik-yon');
  durum.setAttribute('role', 'status');
  const bitir = nesne('button', 'mik-bitir', sonDugme);
  bitir.type = 'button';
  bitir.hidden = true;
  ekran.append(baslik, ornek, levha, tepsi, durum, bitir);
  if (oltaResmi) ekran.append(oltaResmi);
  container.replaceChildren(ekran);

  let sira = 0;
  let yanlisSayisi=0;
  let kapali = false;
  let gecildi = false;
  const ucuslar = new Set<HTMLElement>();
  const hareketler = new Set<Animation>();
  const an = new An();
  // Kenetlenme anı (H7): parça yerine oturunca, bir önceki parçayla birleştiği yerde mıknatıs kıvılcımı çakar.
  // Astra'nın kıvılcım kareleri (miknatis/kivilcim-0…2) gelene kadar küçük ışıklar saçılır.
  function kenetlen(yuva: HTMLElement, i: number) {
    if (sakin || kapali) return;
    const r = kabaGore(levha, yuva);
    isikSac(an, levha, i ? r.x - 2 : r.cx, r.cy, { adet: 5, uzaklik: r.h * .62, boy: r.h * .34, renk: '#ffd257',
      kareler: canlanmaKareleri('miknatis/kivilcim', 3), sure: 480 });
    an.hareket(yuva, [{ transform: 'scale(1)' }, { transform: 'scale(1.1,.92)', offset: .35 }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
  }
  // Birleşme anı (H7): sözcük tamamlanınca harflerin etrafında ışık halkası açılır, ışıklar saçılır.
  function birlesmeHalkasi() {
    if (sakin || kapali) return;
    const r = kabaGore(levha, kelime), w = Math.max(r.w * 1.7, r.h * 3.2), h = w / 2;
    const cizim = canlanmaCizimi('miknatis/birlesme-halkasi');
    const halkalar = cizim ? [0] : [0, 150];
    for (const gecikme of halkalar) {
      const halka = an.ekle(levha, document.createElement(cizim ? 'img' : 'i'));
      halka.className = 'mik-halka' + (cizim ? ' mik-halka-astra' : '');
      halka.setAttribute('aria-hidden', 'true');
      if (halka instanceof HTMLImageElement) { halka.src = cizim!; halka.alt = ''; halka.draggable = false; }
      Object.assign(halka.style, { left: r.cx - w / 2 + 'px', top: r.cy - h / 2 + 'px', width: w + 'px', height: h + 'px' });
      an.hareket(halka, [{ transform: 'scale(.45)', opacity: 0 }, { transform: 'scale(.95)', opacity: 1, offset: .3 },
        { transform: 'scale(1.04)', opacity: 1, offset: cizim ? .7 : .45 }, { transform: 'scale(1.18)', opacity: 0 }],
        { duration: cizim ? 1100 : 820, delay: gecikme, easing: 'ease-out', fill: 'forwards' }).finished.then(() => an.kaldir(halka), () => {});
    }
    isikSac(an, levha, r.cx, r.cy, { adet: 9, uzaklik: r.w * .78, boy: r.h * .36, renk: '#ffd257' });
    an.sonra(170, () => oyunSesi('parilti'));
  }
  /** Olta balığın üstüne iner. Tutarsa balık oltayla kalkar; tutmazsa (yanlış balık) balık silkinip suya kaçar. */
  function oltaIndir(balik: HTMLElement, tutar: boolean) {
    if (!oltaResmi || kapali) return;
    const e = ekran.getBoundingClientRect(), b = balik.getBoundingClientRect(), o = oltaResmi.getBoundingClientRect();
    // olta resmi 400 × 700; mıknatıs ucunun ortası (200, 640)
    const x = b.left + b.width * .42 - e.left - o.width * .5, y = b.top + b.height * .2 - e.top - o.height * (640 / 700);
    oltaResmi.getAnimations().forEach(a => a.cancel());
    oltaResmi.style.left = x + 'px';
    if (sakin) return;
    const ust = -o.height;
    const h = oltaResmi.animate([
      { transform: 'translateY(' + ust + 'px)', opacity: 0 },
      { transform: 'translateY(' + y + 'px)', opacity: 1, offset: .38 },
      { transform: 'translateY(' + y + 'px)', opacity: 1, offset: .5 },
      { transform: 'translateY(' + (tutar ? ust * .35 : y - 30) + 'px)', opacity: tutar ? 1 : .9, offset: .8 },
      { transform: 'translateY(' + ust + 'px)', opacity: 0 }
    ], { duration: tutar ? 900 : 760, easing: 'ease-in-out' });
    hareketler.add(h);
    void h.finished.then(() => hareketler.delete(h), () => hareketler.delete(h));
    if (tutar) balik.classList.add('mik-tutuldu');
  }
  /** Sözcük kurulunca gölde su sıçrar (iki kare) ve resim sudan çıkar. */
  function suSicrat() {
    if (!olta || sakin || kapali) return;
    const s = an.ekle(tepsi, resimOge('mik-sicrama', oltaCizimi('sicrama-0'))) as HTMLImageElement;
    an.sonra(140, () => { s.src = oltaCizimi('sicrama-1'); });
    an.sonra(520, () => an.kaldir(s));
    // sözcüğün resmi sudan yükselir ve gölün üstünde kalır (levhadaki küçük ödül resmi yerine)
    if (cizim) { const r = an.ekle(tepsi, resimOge('mik-gol-odul', cizim)); r.getBoundingClientRect(); r.classList.add('mik-cikti'); }
  }
  let zaman = 0;
  let hayalet: HTMLElement | undefined;
  let aktifParmak: number | undefined;
  let tutusuBirak:(()=>void)|undefined;
  const durdurucu = new AbortController();
  const iptal = {signal: durdurucu.signal};
  const vazgec=()=>tutusuBirak?.();
  window.addEventListener('resize',vazgec,iptal);
  document.addEventListener('pointerdown',e=>{if(!e.isPrimary)vazgec();},{...iptal,capture:true});
  const serbest = () => !kapali && sira < parcalar.length;
  // Çocuk bir süre hiçbir parçaya dokunmazsa Ceren sıradakini yeniden söyler; ikincisinde doğru taş ışır.
  const bos = bosBekleyici(kacinci => {
    if (!serbest() || aktifParmak !== undefined) return;
    if (kacinci === 2) for (const tas of dugmeler) tas.classList.toggle('mik-ipucu', !tas.disabled && tas.dataset.parca === parcalar[sira]);
    sesiKes();
    play(sira ? parcaSesi(parcalar[sira]) : 'mik-hedef-' + ders.id, bosKur);
  });
  const bosKur = () => { if (serbest() && aktifParmak === undefined) bos.kur(); };
  const bekleyenSesler:{ses:string;yuva:HTMLElement}[]=[];
  let sesSirasi=0, parcaOkunuyor=false;
  function sesiKes(){
    sesSirasi++;bekleyenSesler.length=0;parcaOkunuyor=false;
    for(const yuva of yuvalar)yuva.classList.remove('mik-duyulan');
    cerenSustur();
  }
  function parcayiDinlet(ses:string,yuva:HTMLElement){
    bekleyenSesler.push({ses,yuva});
    if(parcaOkunuyor)return;
    parcaOkunuyor=true;
    const bu=sesSirasi;
    function siradaki(){
      if(kapali||bu!==sesSirasi)return;
      const parca=bekleyenSesler.shift();
      if(parca){
        let basladi=false;
        play(parca.ses,()=>{
          if(kapali||bu!==sesSirasi)return;
          parca.yuva.classList.remove('mik-duyulan');
          siradaki();
        },()=>{
          if(basladi||kapali||bu!==sesSirasi)return;
          basladi=true;parca.yuva.classList.add('mik-duyulan');
        });
        return;
      }
      parcaOkunuyor=false;
      if(sira===parcalar.length)tamamla();
      else bosKur();
    }
    siradaki();
  }

  function yuvayiGoster() {
    yuvalar.forEach((y, i) => {
      y.classList.toggle('mik-sirada', i === sira);
      if (i === sira) y.setAttribute('aria-current', 'step');
      else y.removeAttribute('aria-current');
    });
  }

  function ilerle() {
    if (kapali || gecildi || kelime.hidden) return;
    gecildi = true;
    dersKaydiniYaz(kayitAnahtari,null);
    next();
  }

  function tamamla() {
    if (kapali) return;
    levha.classList.add('mik-birlesik');
    // Sözcük birleşince resmi canlanır: Keşfet'in hareket kareleri (Paket Harf-A1/A1-ek) varsa onlarla, yoksa sözcüğün hareketiyle.
    resmiCanlandir(ekran.querySelector('.mik-ipucu-resim'), ders.word, true, sozcukKareleri(ders.id));
    // Ceren sevinir (cila mıknatıs sesinde Ceren'i atlar: her taşta değil, sözcük bitince), levhada kutlama.
    cerenSevinsin();
    if (!sakin) window.setTimeout(() => { if (!kapali) bitisKutla(levha); }, 520);
    durum.textContent = '';
    zaman = window.setTimeout(() => {
      kelime.hidden = false;
      if (!sakin) {
        let karakter = 0;
        for (const [i, yuva] of yuvalar.entries()) {
          const hedef = document.createRange();
          hedef.setStart(kelime.firstChild!, karakter);
          karakter += parcalar[i].length;
          hedef.setEnd(kelime.firstChild!, karakter);
          const harf = hedef.getBoundingClientRect(), kutu = yuva.getBoundingClientRect();
          const dx = harf.x + harf.width / 2 - (kutu.x + kutu.width / 2);
          const hareket = yuva.animate([
            {transform:'translateX(0) scale(1)',opacity:1},
            {transform:'translateX(' + dx + 'px) scale(.72)',opacity:0}
          ],{duration:250,easing:'ease-in',fill:'forwards'});
          hareketler.add(hareket);
        }
      }
      levha.classList.add('mik-okundu');
      odul.hidden = !cizim;
      ornek.style.visibility = 'hidden';
      oyunSesi('birles');
      birlesmeHalkasi();
      suSicrat();
      // Söylenen sözcük, panoda artık tek bir sözcük olarak duruyor.
      zaman = window.setTimeout(() => {
        for (const yuva of yuvalar) yuva.hidden = true;
        bitir.hidden = false;
        durum.textContent = 'Kelime tamamlandı.';
        play('mik-birlesti-' + ders.id, () => {
          if (!kapali && !gecildi) zaman = window.setTimeout(ilerle, 550);
        });
      }, sakin ? 180 : 330);
    }, sakin ? 80 : 180);
  }

  function tasi(dugme: HTMLButtonElement, hedef: HTMLElement, bas?: {x:number; y:number}, gecikme = 0) {
    const b = dugme.getBoundingClientRect(), h = hedef.getBoundingClientRect();
    const x = bas ? bas.x - b.width / 2 : b.left;
    const y = bas ? bas.y - b.height / 2 : b.top;
    if (sakin) return;
    const tas = nesne('div', 'mik-ucan', dugme.textContent ?? '');
    tas.style.setProperty('--mik-renk', dugme.style.getPropertyValue('--mik-renk'));
    Object.assign(tas.style, {width:b.width+'px',height:b.height+'px',left:x+'px',top:y+'px'});
    tas.setAttribute('aria-hidden','true');
    document.body.append(tas); ucuslar.add(tas);
    hedef.classList.add('mik-geliyor');
    const dx=h.left+h.width/2-x-b.width/2, dy=h.top+h.height/2-y-b.height/2;
    const hareket = tas.animate([
      {transform:'translate(0,0) rotate(0)'},
      {transform:'translate(' + dx*.6 + 'px,' + (dy*.6-8) + 'px) rotate(-3deg)',offset:.62},
      {transform:'translate(' + dx + 'px,' + dy + 'px) rotate(0)'}
    ], {duration:bas ? 120 : 220,delay:gecikme,easing:'cubic-bezier(.25,.8,.3,1)',fill:'both'});
    hareketler.add(hareket);
    void hareket.finished.then(() => {
      if (!kapali) hedef.classList.remove('mik-geliyor');
      hareketler.delete(hareket); ucuslar.delete(tas); tas.remove();
    }).catch(() => {});
  }

  function yerlestir(dugme: HTMLButtonElement, yuva?: Element | null, bas?: {x:number; y:number}) {
    if (!serbest() || dugme.disabled) return;
    bos.dur();
    const beklenen = parcalar[sira];
    if (dugme.dataset.parca !== beklenen) {
      yanlisSayisi++;gunlukYanlis(ders.id);
      if(yanlisSayisi===2){
        for(const tas of dugmeler)tas.classList.toggle('mik-ipucu',!tas.disabled && tas.dataset.parca===beklenen);
      }
      const tur = heceli ? 'hecesini' : 'harfini';
      durum.textContent = 'Şimdi ' + beklenen + ' ' + tur + ' bulalım.';
      yuvalar[sira].classList.add('mik-bak');
      if (!sakin) {
        const itme = dugme.animate([
          {transform:'translateX(0) rotate(0)'},
          {transform:'translateX(-7px) rotate(-5deg)'},
          {transform:'translateX(6px) rotate(4deg)'},
          {transform:'translateX(0) rotate(0)'}
        ], {duration:260, easing:'ease-in-out'});
        hareketler.add(itme);
        void itme.finished.then(() => hareketler.delete(itme), () => hareketler.delete(itme));
      }
      oltaIndir(dugme, false);
      oyunSesi('geri');
      sesiKes();
      play(parcaSesi(beklenen), bosKur);
      return;
    }
    if (yuva !== undefined && yuva !== yuvalar[sira]) {
      durum.textContent = 'Parçayı ışıklı yere götür.';
      oyunSesi('geri');
      sesiKes();
      play('mik-yer', bosKur);
      return;
    }
    yanlisSayisi=0;
    bos.sifirla();
    for(const tas of dugmeler)tas.classList.remove('mik-ipucu');
    const dolan = yuvalar[sira];
    dolan.style.setProperty('--mik-renk', dugme.style.getPropertyValue('--mik-renk'));
    // olta kipinde (dokunuşla) olta önce balığı tutar, parça sonra uçar
    const oltayla = olta && !bas && !sakin;
    if (oltayla) oltaIndir(dugme, true);
    tasi(dugme, dolan, bas, oltayla ? 380 : 0);
    const yerlesen = sira;
    an.sonra(sakin ? 0 : bas ? 120 : oltayla ? 600 : 220, () => kenetlen(dolan, yerlesen));
    dolan.classList.add('mik-dolu');
    dolan.classList.remove('mik-bak');
    dugme.disabled = true;
    dugme.classList.add('mik-alindi');
    sira++;
    dersKaydiniYaz(kayitAnahtari,JSON.stringify({kelime:ders.word,sira}));
    yuvayiGoster();
    oyunSesi('miknatis');
    if (sira === parcalar.length) {
      tekrar.disabled = true;
      if (ustTekrar) ustTekrar.disabled = true;
    }else{
      durum.textContent = 'Sırada ' + parcalar[sira] + ' var.';
    }
    parcayiDinlet(parcaSesi(beklenen),dolan);
  }

  const dugmeler = karistir(parcalar).map((parca, i) => {
    const dugme = nesne('button', 'mik-tas', parca);
    dugme.type = 'button';
    dugme.dataset.parca = parca;
    dugme.style.setProperty('--mik-renk', ['#ffc971','#a7dccc','#f1aaa2','#bcd9f0'][i % 4]);
    if (olta) {
      const harf = nesne('span', 'mik-balik-harf', parca);
      dugme.replaceChildren(resimOge('mik-balik', oltaCizimi((['balik-0', 'balik-1', 'balik-2'] as const)[i % 3])), harf);
      dugme.style.setProperty('--yuz-gecikme', (-i * 1.3).toFixed(1) + 's');
      dugme.style.setProperty('--yuz-yon', i % 2 ? '-1' : '1');
    }
    dugme.setAttribute('aria-label', parca + (heceli ? ' hecesini' : ' harfini') + ' yerleştir');
    let bas: {x: number, y: number} | undefined;
    let suruklendi = false;
    dugme.addEventListener('pointerdown', e => {
      if(!e.isPrimary){suruklendi=true;return;}
      if (!serbest() || aktifParmak !== undefined || e.button !== 0) return;
      aktifParmak = e.pointerId;
      bos.dur();
      tutusuBirak=()=>{suruklendi=true;sonlandir();};
      bas = {x: e.clientX, y: e.clientY};
      suruklendi = false;
      dugme.setPointerCapture(e.pointerId);
    }, iptal);
    dugme.addEventListener('pointermove', e => {
      if (e.pointerId !== aktifParmak || !bas) return;
      if (!suruklendi && Math.hypot(e.clientX - bas.x, e.clientY - bas.y) < 6) return;
      if (!hayalet) {
        hayalet = nesne('div', 'mik-hayalet', parca);
        hayalet.setAttribute('aria-hidden', 'true');
        hayalet.style.setProperty('--mik-renk', dugme.style.getPropertyValue('--mik-renk'));
        document.body.append(hayalet);
      }
      suruklendi = true;
      hayalet.style.left = e.clientX + 'px';
      hayalet.style.top = e.clientY + 'px';
    }, iptal);
    function sonlandir() {
      const id=aktifParmak;
      bas = undefined;
      aktifParmak = undefined;
      tutusuBirak=undefined;
      hayalet?.remove();
      hayalet = undefined;
      if(id!==undefined&&dugme.hasPointerCapture(id))dugme.releasePointerCapture(id);
      bosKur();
    }
    dugme.addEventListener('pointerup', e => {
      if (e.pointerId !== aktifParmak || !bas) return;
      sonlandir();
      const hedef=document.elementFromPoint(e.clientX,e.clientY)?.closest('.mik-yuva');
      if (suruklendi&&hedef) yerlestir(dugme,hedef,{x:e.clientX,y:e.clientY});
    }, iptal);
    dugme.addEventListener('lostpointercapture', e => {
      if (e.pointerId === aktifParmak) vazgec();
    }, iptal);
    dugme.addEventListener('pointercancel', e => {
      if (e.pointerId === aktifParmak) vazgec();
    }, iptal);
    dugme.addEventListener('click', e => {
      if (!suruklendi || e.detail === 0) yerlestir(dugme);
      suruklendi = false;
    }, iptal);
    return dugme;
  });
  tepsi.append(...dugmeler);
  const ustTekrar = container.closest('main')?.querySelector<HTMLButtonElement>('[data-is="tekrar"]');
  function dinlet() {
    if (kapali || sira === parcalar.length) return;
    bos.dur();
    sesiKes();
    play(sira ? parcaSesi(parcalar[sira]) : 'mik-hedef-' + ders.id, bosKur);
  }
  tekrar.addEventListener('click', dinlet, iptal);
  ustTekrar?.addEventListener('click', dinlet, iptal);
  bitir.addEventListener('click', ilerle, iptal);
  durum.textContent = 'Parçaya dokun ya da onu ışıklı yere götür.';
  try {
    const kayit = JSON.parse(dersKaydiniOku(kayitAnahtari) || 'null');
    if (kayit?.kelime === ders.word && Number.isInteger(kayit.sira) && kayit.sira>0 && kayit.sira<=parcalar.length) {
      for (; sira<kayit.sira; sira++) {
        const tas = dugmeler.find(b => !b.disabled && b.dataset.parca===parcalar[sira])!;
        tas.disabled = true; tas.classList.add('mik-alindi');
        yuvalar[sira].style.setProperty('--mik-renk',tas.style.getPropertyValue('--mik-renk'));
        yuvalar[sira].classList.add('mik-dolu');
      }
    }
  } catch {}
  yuvayiGoster();
  if (sira===parcalar.length) { tekrar.disabled=true; tamamla(); }
  // Olta ilk kez açıldığında (oturumda bir kez) Ceren oyunu tek cümleyle anlatır, sonra sözcüğü söyler.
  else if (olta && !oltaAnlatildi()) play('olta-yonerge', dinlet);
  else dinlet();
  return () => {
    kapali = true;
    bos.kapat();
    durdurucu.abort();
    clearTimeout(zaman);
    hayalet?.remove();
    for (const h of hareketler) h.cancel();
    an.durdur();
    for (const tas of ucuslar) tas.remove();
    if (ustTekrar) ustTekrar.disabled = false;
  };
}
