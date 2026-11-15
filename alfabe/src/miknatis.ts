import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import type dersler from './harfler.json';
import { oyunSesi } from './oyun-sesi';
import { cerenSustur } from './konusma-dersi';
import { kelimeResmi } from './kelime-resmi';
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
  const durum = nesne('p', 'mik-yon');
  durum.setAttribute('role', 'status');
  const bitir = nesne('button', 'mik-bitir', sonDugme);
  bitir.type = 'button';
  bitir.hidden = true;
  ekran.append(baslik, ornek, levha, tepsi, durum, bitir);
  container.replaceChildren(ekran);

  let sira = 0;
  let yanlisSayisi=0;
  let kapali = false;
  let gecildi = false;
  const ucuslar = new Set<HTMLElement>();
  const hareketler = new Set<Animation>();
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

  function tasi(dugme: HTMLButtonElement, hedef: HTMLElement, bas?: {x:number; y:number}) {
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
    ], {duration:bas ? 120 : 220,easing:'cubic-bezier(.25,.8,.3,1)',fill:'forwards'});
    hareketler.add(hareket);
    void hareket.finished.then(() => {
      if (!kapali) hedef.classList.remove('mik-geliyor');
      hareketler.delete(hareket); ucuslar.delete(tas); tas.remove();
    }).catch(() => {});
  }

  function yerlestir(dugme: HTMLButtonElement, yuva?: Element | null, bas?: {x:number; y:number}) {
    if (!serbest() || dugme.disabled) return;
    const beklenen = parcalar[sira];
    if (dugme.dataset.parca !== beklenen) {
      yanlisSayisi++;
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
      oyunSesi('geri');
      sesiKes();
      play(parcaSesi(beklenen));
      return;
    }
    if (yuva !== undefined && yuva !== yuvalar[sira]) {
      durum.textContent = 'Parçayı ışıklı yere götür.';
      oyunSesi('geri');
      sesiKes();
      play('mik-yer');
      return;
    }
    yanlisSayisi=0;
    for(const tas of dugmeler)tas.classList.remove('mik-ipucu');
    const dolan = yuvalar[sira];
    dolan.style.setProperty('--mik-renk', dugme.style.getPropertyValue('--mik-renk'));
    tasi(dugme, dolan, bas);
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
    dugme.setAttribute('aria-label', parca + (heceli ? ' hecesini' : ' harfini') + ' yerleştir');
    let bas: {x: number, y: number} | undefined;
    let suruklendi = false;
    dugme.addEventListener('pointerdown', e => {
      if(!e.isPrimary){suruklendi=true;return;}
      if (!serbest() || aktifParmak !== undefined || e.button !== 0) return;
      aktifParmak = e.pointerId;
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
    sesiKes();
    play(sira ? parcaSesi(parcalar[sira]) : 'mik-hedef-' + ders.id);
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
  else dinlet();
  return () => {
    kapali = true;
    durdurucu.abort();
    clearTimeout(zaman);
    hayalet?.remove();
    for (const h of hareketler) h.cancel();
    for (const tas of ucuslar) tas.remove();
    if (ustTekrar) ustTekrar.disabled = false;
  };
}
