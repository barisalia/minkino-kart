import { calgiSesi } from '../../src/audio/bando';
import { sesiAc } from '../../src/audio/ses';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { minik, dortYas } from './kayit';
import sozler from './sozler.json';

type Sahne = {
  kok: HTMLElement;
  img: (id: string) => string;
  anlat: (metin: string) => void;
  say: (n: number) => void;
  sonra: (ms: number, yap: () => void) => void;
  dinle: (yap: () => void) => void;
};
const grup = () => minik ? 'minik' : dortYas ? 'dort' : 'buyuk';
function oku<T>(ad: string, ilk: T): T {
  try { return JSON.parse(localStorage.getItem('minkino-matematik-oyuncak-' + grup() + ad) || 'null') ?? ilk; }
  catch { return ilk; }
}
function yaz(ad: string, veri: unknown) {
  try { localStorage.setItem('minkino-matematik-oyuncak-' + grup() + ad, JSON.stringify(veri)); } catch {}
}
function dugme(alan: Element, etiket: string, sinif: string, ic: string) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = sinif; b.setAttribute('aria-label', etiket); b.innerHTML = ic;
  alan.append(b); return b;
}
const notalar = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81];
const boncukSaatleri = new Set<number>();
let sonVurus = 0;
export function boncukSesiniKes() {
  boncukSaatleri.forEach(clearTimeout);
  boncukSaatleri.clear();
  sonVurus = 0;
}
export function boncuklariCal(tel: number, eski: number, yeni: number, duyulan = 0) {
  const yon = Math.sign(yeni - eski);
  for (let j = duyulan; j < Math.abs(yeni - eski); j++) {
    const no = tel * 5 + (yon > 0 ? eski + j : eski - j - 1);
    const vur = () => calgiSesi(4, notalar[no], .72);
    const simdi = performance.now();
    const gecikme = Math.max(0, sonVurus + 55 - simdi);
    sonVurus = simdi + gecikme;
    if (!gecikme) vur();
    else {
      const saat = window.setTimeout(() => { boncukSaatleri.delete(saat); vur(); }, gecikme);
      boncukSaatleri.add(saat);
    }
  }
}

type MasaNoktasi = { x: number; y: number; aci: number };
type MasaKaydi = { yerler: MasaNoktasi[]; katlar: number[]; taban: number };

function kutulariDagit(): MasaNoktasi[] {
  const yerler = [[.12,.41],[.30,.48],[.13,.65],[.28,.77],[.12,.85],
    [.70,.38],[.86,.50],[.69,.63],[.89,.74],[.73,.84]];
  for (let i = yerler.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [yerler[i], yerler[j]] = [yerler[j], yerler[i]];
  }
  return yerler.map(([x,y]) => ({
    x: x + (Math.random() - .5) * .035,
    y: y + (Math.random() - .5) * .035,
    aci: (Math.random() - .5) * 16,
  }));
}

export function sayiKulesi({ kok, img, anlat, say, sonra, dinle }: Sahne, bitir: () => void, tekrar: number) {
  const eski = oku<number[]>('kule', []);
  const ilk = (): MasaKaydi => ({ yerler: kutulariDagit(), katlar: [], taban: .88 });
  const anahtar = tekrar ? 'kule-masa-' + tekrar : 'kule-masa';
  let t = oku<MasaKaydi>(anahtar, ilk());
  if (!Array.isArray(t?.yerler) || t.yerler.length !== 10 ||
      !t.yerler.every(v => v && [v.x,v.y,v.aci].every(Number.isFinite)) ||
      !Array.isArray(t.katlar) || t.katlar.length > 10 || !t.katlar.every(Number.isFinite) ||
      !Number.isFinite(t.taban)) t = ilk();
  if (!tekrar && !oku(anahtar, null) && Array.isArray(eski)) {
    t.katlar = eski.slice(0,10).map(x => Number.isFinite(x) ? .5 + (x-.5)*.35 : .5);
  }
  const sakla = () => yaz(anahtar, t);
  sakla();
  const saha = document.createElement('div');
  saha.className = 'kule-meydani';
  kok.append(saha);
  let secili = 0, kilit = false, tutulan = -1;
  const sinir = (v:number, a:number,b:number) => Math.max(a,Math.min(v,b));
  const boya = ['#ac3c30','#196e71','#42579c','#993f69','#427443'];
  const icerik = (n:number) => img('matematik/kule-kutusu') + '<b style="color:'+boya[(n-1)%5]+'">'+n+'</b>';
  function kur() {
    saha.replaceChildren();
    secili = 0; tutulan = -1;
    const { width:w, height:h } = saha.getBoundingClientRect();
    if (!w || !h) return;
    const en = Math.min(w*.195,h*.203), boy = en/2.32;
    const sonraki = t.katlar.length + 1;
    const destekX = t.katlar.at(-1) ?? .5;
    const ust = t.taban*h - t.katlar.length*boy;
    // Kule üst kenara yaklaştığında masadaki her oyuncak aynı ölçekle uzaklaşır.
    const zoom = Math.min(1, h*.86 / Math.max(1,h*.94 - ust + boy));
    const sx = (x:number) => w*.5 + (x*w-w*.5)*zoom;
    const sy = (y:number) => h*.94 + (y-h*.94)*zoom;
    const dunyaX = (x:number) => ((x-w*.5)/zoom+w*.5)/w;
    const dunyaY = (y:number) => ((y-h*.94)/zoom+h*.94)/h;
    const ew = en*zoom, eh = boy*zoom;
    function koy(el:HTMLElement,x:number,alt:number) {
      Object.assign(el.style,{left:sx(x)-ew/2+'px',top:sy(alt)-eh+'px',width:ew+'px',height:eh+'px',fontSize:eh*.65+'px'});
    }
    const katlar:HTMLElement[] = [];
    t.katlar.forEach((x,i)=>{
      const el=document.createElement('div');
      el.className='kule-kutu'; el.innerHTML=icerik(i+1);
      koy(el,x,t.taban*h-i*boy); saha.append(el); katlar.push(el);
    });
    if (sonraki === 11) return;
    const hedef=dugme(saha,'Kutuyu buraya bırak','kule-hedef',sonraki===1 || minik ? String(sonraki) : '');
    koy(hedef,destekX,ust);
    function yerlestir(n:number,x:number,alt:number) {
      if(kilit || n!==sonraki) return;
      x=sinir(x,en/(2*w),1-en/(2*w));
      if(!t.katlar.length) t.taban=sinir(alt/h,.32,.94);
      const fark=x-destekX;
      if(t.katlar.length && Math.abs(fark)*w < en*(minik?.16:dortYas?.10:.05)) x=destekX;
      t.katlar.push(x);
      let kes=t.katlar.length, toplam=0;
      for(let i=kes-1;i>=1;i--){
        toplam+=t.katlar[i];
        const merkez=toplam/(kes-i), yari=en/(2*w);
        if(merkez<Math.max(t.katlar[i],t.katlar[i-1])-yari || merkez>Math.min(t.katlar[i],t.katlar[i-1])+yari){
          kes=i; toplam=0;
        }
      }
      if(kes<n){
        const yon=t.katlar[kes]<t.katlar[kes-1]?-1:1;
        const son=saha.querySelector<HTMLElement>('[data-kutu="'+n+'"]')!;
        son.className='kule-kutu'; son.style.removeProperty('rotate'); son.style.removeProperty('translate');
        koy(son,x,ust); katlar.push(son);
        katlar.slice(kes).forEach((el,i)=>{
          const yer=t.yerler[kes+i];
          el.classList.add('devrildi');
          if(!matchMedia('(prefers-reduced-motion: reduce)').matches) el.animate([
            {transform:'none'},{offset:.35,transform:'translate('+yon*ew*.25+'px,0) rotate('+yon*18+'deg)'},
            {transform:'translate('+(sx(yer.x)-parseFloat(el.style.left)-ew/2)+'px,'+(sy(yer.y*h)-parseFloat(el.style.top)-eh)+'px) rotate('+yer.aci+'deg)'}
          ],{duration:650,fill:'forwards',easing:'ease-in'});
        });
        t.katlar.length=kes; sakla(); kilit=true; oyunSesi('geri'); anlat(sozler[63]);
        sonra(680,()=>{kilit=false;kur();});
        return;
      }
      sakla(); kur(); calgiSesi(4,notalar[n-1],.8);
      if(n<10) say(n);
      else {
        anlat(sozler[64]); let i=0;
        const cal=()=>{if(i===10){sonra(1300,bitir);return;}
          saha.querySelectorAll('.kule-kutu')[i]?.classList.add('kule-parla');
          calgiSesi(3,notalar[i++],.65); sonra(170,cal);}; cal();
      }
    }
    hedef.onclick=()=>{if(secili===sonraki) yerlestir(secili,destekX,ust); else say(sonraki);};
    for(let n=sonraki;n<=10;n++){
      const yer=t.yerler[n-1], b=dugme(saha,n+' numaralı kutu','raf-kutusu',icerik(n));
      koy(b,yer.x,yer.y*h); b.style.rotate=yer.aci+'deg'; b.dataset.kutu=String(n);
      let px=0,py=0, tasindi=false;
      function sec(){
        if(n!==sonraki){anlat(sozler[65]);return;}
        secili=n; hedef.classList.add('hazir'); b.setAttribute('aria-pressed','true');
      }
      b.onpointerdown=e=>{
        if(kilit || tutulan!==-1 || !e.isPrimary || e.button!==0)return;
        sesiAc(); tutulan=e.pointerId; px=e.clientX; py=e.clientY; tasindi=false;
        b.setPointerCapture(tutulan); b.classList.add('elde');
      };
      b.onpointermove=e=>{
        if(e.pointerId!==tutulan||!b.hasPointerCapture(e.pointerId))return;
        const dx=e.clientX-px,dy=e.clientY-py;
        if(Math.hypot(dx,dy)>4)tasindi=true;
        if(tasindi){b.style.translate=dx+'px '+dy+'px'; if(n===sonraki)hedef.classList.add('hazir');}
      };
      b.onpointerup=e=>{
        if(e.pointerId!==tutulan)return;
        tutulan=-1; b.classList.remove('elde'); b.style.translate=''; hedef.classList.remove('hazir');
        if(!tasindi){sec();return;}
        const x=dunyaX(sx(yer.x)+e.clientX-px), alt=dunyaY(sy(yer.y*h)+e.clientY-py)*h;
        const yakinda=Math.abs(alt-ust)<Math.max(30/zoom,boy*.95) && Math.abs(x-destekX)*w<en*1.05;
        if(n===sonraki && (sonraki===1?alt>=.28*h:yakinda)){yerlestir(n,x,alt);return;}
        if(n!==sonraki && yakinda)anlat(sozler[65]);
        yer.x=sinir(x,en/(2*w),1-en/(2*w)); yer.y=sinir(alt/h,.32,.94);
        sakla(); kur();
      };
      b.onpointercancel=b.onlostpointercapture=()=>{
        if(tutulan===-1)return;
        tutulan=-1; b.style.translate=''; b.classList.remove('elde'); hedef.classList.remove('hazir');
      };
      b.onclick=e=>{if(!e.detail)sec();};
    }
  }
  kur();
  if (t.katlar.length === 10) sonra(600,bitir);
  const yenidenBoyutla=()=>{if(!kilit)kur();};
  window.addEventListener('resize',yenidenBoyutla);
  dinle(()=>anlat(sozler[t.katlar.length===10?64:62]));
  if(!t.katlar.length)anlat(sozler[62]);
  return ()=>window.removeEventListener('resize',yenidenBoyutla);
}

