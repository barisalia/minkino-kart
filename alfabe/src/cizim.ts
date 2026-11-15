import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { kalemYollari } from './yollar';
import { gecerliIz, parmakYolu, type ParmakIzi } from './kartlar';
import { oyunSesi } from './oyun-sesi';

export function izSur(alan: HTMLElement, harf: string, bitti: (iz:ParmakIzi) => void, vurusBitti?: (sira:number, toplam:number) => void, yazmayaBasladi?: () => void) {
  const yollar = kalemYollari(harf);
  alan.innerHTML = '<svg class="defter" viewBox="0 0 100 132" role="button" tabindex="0" aria-label="' + harf + ' yazma alanı. Boşluk veya Enter ile kalemi çizgi boyunca ilerlet.">' +
    '<g class="kilavuz"><path d="M2 22H98 M2 50H98 M2 100H98 M2 122H98"/></g>' +
    yollar.map(d => '<path class="iz" d="' + d + '"/>').join('') +
    '<circle class="baslangic" r="4"/><circle class="kalemucu" r="3.2"/></svg>';
  const svg = alan.querySelector('svg')!;
  const izler = Array.from(svg.querySelectorAll<SVGPathElement>('.iz'));
  const baslangic = svg.querySelector<SVGCircleElement>('.baslangic')!;
  const ipucu = svg.querySelector<SVGCircleElement>('.kalemucu')!;
  const uzunluklar = izler.map(p => p.getTotalLength());
  const cizgiler:ParmakIzi=[];
  let cizgi:ParmakIzi[number]|undefined, murekkep:SVGPathElement|undefined;
  function noktaEkle(yer:DOMPoint) {
    if(!cizgi || !murekkep)return;
    const x=Math.round(Math.min(100,Math.max(0,yer.x))),y=Math.round(Math.min(132,Math.max(0,yer.y)));
    const son=cizgi.at(-1);
    if(son && Math.hypot(son[0]-x,son[1]-y)<1.6)return;
    if(cizgi.length===128)cizgi.splice(0,cizgi.length,...cizgi.filter((_,i)=>i%2===0));
    cizgi.push([x,y]);
    murekkep.setAttribute('d',parmakYolu(cizgi));
  }
  let sira = 0, mesafe = 0, animasyon = 0, kapali = false;
  let parmak: number | null = null, onceki: DOMPoint | undefined;
  let klavyeYolu = -1;
  const taslak = 'minkino-harf-yazim-taslagi-v1-' + harf;
  function kaydet() {
    if (sira === izler.length) dersKaydiniYaz(taslak,null);
    else if (cizgiler.length) dersKaydiniYaz(taslak, JSON.stringify({sira,mesafe,cizgiler}));
  }
  try {
    const ham = dersKaydiniOku(taslak);
    if (ham && ham.length < 48000) {
      const k = JSON.parse(ham);
      if (Number.isInteger(k.sira) && k.sira >= 0 && k.sira < izler.length &&
          Number.isFinite(k.mesafe) && k.mesafe >= 0 && k.mesafe < uzunluklar[k.sira] && gecerliIz(k.cizgiler)) {
        sira = k.sira; mesafe = k.mesafe;
        for (const parca of k.cizgiler) {
          cizgiler.push(parca);
          const yol = document.createElementNS('http://www.w3.org/2000/svg','path');
          yol.setAttribute('class','murekkep'); yol.setAttribute('d',parmakYolu(parca));
          svg.insertBefore(yol,baslangic);
        }
      }
    }
  } catch { /* Eski veya eksik bir taslak boş kâğıtla açılır. */ }

  function yerlestir(nokta: SVGCircleElement, yer: DOMPoint) {
    nokta.setAttribute('cx', String(yer.x));
    nokta.setAttribute('cy', String(yer.y));
  }
  function goster() {
    cancelAnimationFrame(animasyon);
    if (kapali || sira >= izler.length) return;
    const yol = izler[sira], uzunluk = uzunluklar[sira], bas = performance.now();
    izler.forEach((iz, i) => iz.classList.toggle('siradaki-iz', i === sira));
    yerlestir(baslangic, yol.getPointAtLength(mesafe));
    ipucu.style.visibility = 'visible';
    function oyna(simdi: number) {
      const oran = Math.min(1, ((simdi - bas) % 2300) / 1600);
      yerlestir(ipucu, yol.getPointAtLength(mesafe + (uzunluk - mesafe) * oran));
      animasyon = requestAnimationFrame(oyna);
    }
    animasyon = requestAnimationFrame(oyna);
  }
  function konum(e: PointerEvent) {
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
  }
  function ilerlet(yer: DOMPoint) {
    const yol = izler[sira], uzunluk = uzunluklar[sira];
    const yakin = (pt: DOMPoint) => Math.hypot(pt.x - yer.x, pt.y - yer.y) < 11;
    if (!yakin(yol.getPointAtLength(mesafe))) return;
    noktaEkle(yer);
    let yeni = mesafe;
    while (yeni < uzunluk && yakin(yol.getPointAtLength(yeni))) yeni += 1;
    mesafe = Math.min(uzunluk, yeni);
    yerlestir(baslangic, yol.getPointAtLength(mesafe));
    if (mesafe < uzunluk) return;
    sira++;
    mesafe = 0;
    kaydet();
    parmak = null;
    onceki = undefined;
    if (sira === izler.length) {
      cancelAnimationFrame(animasyon);
      baslangic.remove();
      ipucu.remove();
      oyunSesi('birles');
      bitti(cizgiler);
    } else {
      oyunSesi('miknatis');
      vurusBitti?.(sira, izler.length);
      goster();
    }
  }
  function ciz(e: PointerEvent) {
    if (e.pointerId !== parmak || !onceki) return;
    const yer = konum(e), bas = onceki;
    // Bazı dokunmatik ekranlar hızlı bir hareketi yalnızca iki uzak konumla bildirir.
    const ara = Math.max(1, Math.ceil(Math.hypot(yer.x - bas.x, yer.y - bas.y) / 4));
    for (let i = 1; i <= ara && parmak !== null; i++) {
      ilerlet(new DOMPoint(bas.x + (yer.x - bas.x) * i / ara, bas.y + (yer.y - bas.y) * i / ara));
    }
    if (parmak !== null) onceki = yer;
  }
  svg.onpointerdown = e => {
    if (kapali || e.button!==0 || parmak !== null || sira >= izler.length) return;
    const yer = konum(e), bas = izler[sira].getPointAtLength(mesafe);
    if (Math.hypot(yer.x - bas.x, yer.y - bas.y) >= 11) {
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        baslangic.getAnimations().forEach(a => a.cancel());
        baslangic.animate([{strokeWidth:1.4},{stroke:'#bc4539',strokeWidth:4.4},{strokeWidth:1.4}],{duration:650});
      }
      return;
    }
    parmak = e.pointerId;
    klavyeYolu = -1;
    onceki = yer;
    yazmayaBasladi?.();
    oyunSesi('kagit');
    // Her geçerli dokunuş en az bir yol birimi ilerler. Kalemin kalktığı
    // yerle sonraki dokunuş arasına mürekkep çizilmemeli.
    yeniIz();
    svg.setPointerCapture(e.pointerId);
    cancelAnimationFrame(animasyon);
    ipucu.style.visibility = 'hidden';
    ilerlet(yer);
  };
  function yeniIz(){
    cizgi=[];cizgiler.push(cizgi);
    murekkep=document.createElementNS('http://www.w3.org/2000/svg','path');
    murekkep.setAttribute('class','murekkep');
    svg.insertBefore(murekkep,baslangic);
  }
  svg.onkeydown=e=>{
    if(e.key!==' '&&e.key!=='Enter')return;
    e.preventDefault();
    if(e.repeat||kapali||parmak!==null||sira>=izler.length)return;
    const yol=izler[sira], buSira=sira;
    if(klavyeYolu!==sira){
      klavyeYolu=sira;yazmayaBasladi?.();yeniIz();oyunSesi('kagit');
    }
    const bas=mesafe, son=Math.min(uzunluklar[sira],bas+15);
    // Mürekkep, parmak kaldırılıncaya kadar aynı çizgide kalır. Bir tuş
    // yalnızca tek vuruşta ilerler ve örneğin İ'nin noktasına sıçramaz.
    for(let uzaklik=bas;uzaklik<son;uzaklik+=2)noktaEkle(yol.getPointAtLength(uzaklik));
    noktaEkle(yol.getPointAtLength(son));
    mesafe=son;
    if(son===uzunluklar[sira])ilerlet(yol.getPointAtLength(son));
    if(sira===buSira)goster();
    kaydet();
  };
  svg.onpointermove = ciz;
  svg.onpointerup = e => { ciz(e); birak(e); };
  function birak(e: PointerEvent) {
    if (e.pointerId !== parmak) return;
    parmaginiKaldir();
  }
  function parmaginiKaldir(){
    if(parmak===null)return;
    const id=parmak;
    parmak = null;
    onceki = undefined;
    if(svg.hasPointerCapture(id))svg.releasePointerCapture(id);
    kaydet();
    goster();
  }
  svg.onlostpointercapture = svg.onpointercancel = birak;
  window.addEventListener('resize',parmaginiKaldir);
  goster();
  return {
    goster,
    kapat() {
      kaydet();
      kapali = true;
      window.removeEventListener('resize',parmaginiKaldir);
      cancelAnimationFrame(animasyon);
      svg.onpointerdown = svg.onpointermove = svg.onpointerup = null;
      svg.onpointercancel = svg.onlostpointercapture = null;
      svg.onkeydown = null;
    }
  };
}
