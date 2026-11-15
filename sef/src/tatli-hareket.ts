import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {jest,sahnedenAyrilinca} from './hareket';
import {arkaPlanDinle} from '../../src/kabuk/yon';

type Nokta = readonly [number,number];
type Iz = 'merdane'|'cirp'|'kepce'|'yildiz'|'burgu'|'tart-krema';
type Cizim = (yol:string,sinif?:string)=>HTMLImageElement;
const yollar:Record<Iz,readonly Nokta[]>={
  merdane:[[50,72],[50,28],[50,72],[50,28],[50,72]],
  cirp:[[22,50],[30,28],[50,21],[70,28],[78,50],[70,72],[50,79],[30,72],[22,50]],
  kepce:[[27,43],[32,52],[44,57],[57,55],[65,45],[67,30],[67,19]],
  yildiz:[[50,21],[59,41],[79,43],[64,58],[69,78],[50,68],[31,78],[36,58],[21,43],[41,41],[50,21]],
  burgu:[[20,47],[30,57],[55,60],[75,49],[72,40],[53,37],[35,40],[39,47],[56,49],[63,41],[54,30],[49,24]],
  'tart-krema':[[29,36],[53,35],[71,38],[64,46],[42,46],[26,49],[35,57],[55,56],[68,54]],
};
const adlar:Record<Iz,string>={
  merdane:'Hamuru merdaneyle aç',cirp:'Kek hamurunu çırp',kepce:'Çilekli dondurmadan bir top çıkar',
  yildiz:'Kurabiyeye pembe krema sık',burgu:'Kekin üstüne krema sık',
  'tart-krema':'Tartın kremasını yay',
};
const aletler:Record<Iz,string>={
  merdane:'sef/firin/merdane',cirp:'sef/krep/cirpici',kepce:'kino-otobus/kepce',yildiz:'sef/tatli/krema-torbasi',burgu:'sef/tatli/krema-torbasi',
  'tart-krema':'sef/nesneler/kasik',
};
function izCiz(yol:readonly Nokta[],sinif:string){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');svg.classList.add(sinif);
  const line=document.createElementNS(svg.namespaceURI,'polyline');
  line.setAttribute('points',yol.map(p=>p.join(',')).join(' '));
  line.setAttribute('fill','none');line.setAttribute('stroke-linecap','round');line.setAttribute('stroke-linejoin','round');
  svg.append(line);return {svg,line};
}
const kalpYolu:readonly Nokta[]=[[50,28],[41,15],[31,10],[21,11],[12,18],[9,30],[11,42],[20,55],[32,68],[49,87],[66,69],[79,55],[89,42],[90,30],[88,20],[80,12],[70,10],[60,15],[50,28]];
const daireYolu:readonly Nokta[]=Array.from({length:17},(_,i)=>[49.5+40.5*Math.sin(i*Math.PI/8),49.5-40.5*Math.cos(i*Math.PI/8)] as const);
export function izIsle(tur:Iz,once:HTMLElement,sonra:HTMLElement,resim:Cizim,bitir:()=>void,sekil?:'kalp'|'yuvarlak'|'yildiz'){
  const yol=sekil==='kalp'?kalpYolu:sekil==='yuvarlak'?daireYolu:yollar[tur];
  const tus=dugme(adlar[tur],'ta-iz-alani',once,sonra);
  tus.dataset.is=tur;
  if(sekil)tus.dataset.kurabiyeSekli=sekil;
  const susleme=tur==='burgu'||tur==='yildiz'||tur==='tart-krema';
  once.classList.add('ta-iz-once');sonra.classList.add('ta-iz-son');
  const rehber=izCiz(yol,'ta-iz-rehber'),krem=izCiz([],'ta-iz-krema');
  const alet=resim(aletler[tur],'ta-iz-aleti');
  const nokta=h('i.ta-sonraki-nokta',{'aria-hidden':true});
  tus.append(rehber.svg,krem.svg,nokta,alet);
  let sirada=0,tutulan:number|undefined;
  function konum(el:HTMLElement,p:Nokta){el.style.left=p[0]+'%';el.style.top=p[1]+'%';}
  function ciz(){
    const iler=sirada/yol.length;
    tus.style.setProperty('--oran',String(iler));
    if(sirada>=yol.length){
      tus.disabled=true;tus.dataset.bitti='true';
      window.setTimeout(()=>{if(tus.isConnected)bitir();},330);return;
    }
    const p=yol[sirada];konum(nokta,p);konum(alet,sirada?yol[sirada-1]:p);
    rehber.line.setAttribute('points',yol.slice(Math.max(0,sirada-1)).map(p=>p.join(',')).join(' '));
    if(susleme)krem.line.setAttribute('points',yol.slice(0,sirada).map(p=>p.join(',')).join(' '));
    tus.dataset.iz=String(sirada);
  }
  function yakala(e:PointerEvent){
    const r=tus.getBoundingClientRect();
    const p:Nokta=[100*(e.clientX-r.left)/r.width,100*(e.clientY-r.top)/r.height];
    if(sirada>=yol.length)return;
    konum(alet,p);
    if(Math.hypot(p[0]-yol[sirada][0],p[1]-yol[sirada][1])<(tur==='merdane'?23:14)){sirada++;ciz();}
  }
  tus.onpointerdown=e=>{
    if(!e.isPrimary||tutulan!==undefined)return;
    tutulan=e.pointerId;tus.setPointerCapture(e.pointerId);tus.classList.add('ta-temas');yakala(e);
  };
  tus.onpointermove=e=>{if(tutulan===e.pointerId)yakala(e);};
  const birak=()=>{tutulan=undefined;tus.classList.remove('ta-temas');};
  tus.onpointerup=birak;tus.onpointercancel=birak;
  tus.onclick=e=>{if(e.detail===0&&sirada<yol.length){sirada++;ciz();}};
  ciz();return tus;
}

export function basVeDoldur(ad:string,komut:'kalip'|'dok',zemin:HTMLElement,arac:HTMLElement,sonuc:HTMLElement,bitir:()=>void){
  const tus=dugme(ad,'ta-baski',zemin,sonuc,arac);
  tus.dataset.is=komut;
  zemin.classList.add('ta-baski-zemin');sonuc.classList.add('ta-baski-son');arac.classList.add('ta-baski-arac');
  tus.append(h('span.ta-bas-isareti',{},ikon('el')));
  let iler=0,id:number|undefined,son=0,kare=0,tamam=false;
  function goster(){
    tus.style.setProperty('--bas',String(iler));
    if(iler>=1&&!tamam){
      tamam=true;tus.disabled=true;tus.classList.add('ta-bitti');
      window.setTimeout(()=>{if(tus.isConnected)bitir();},360);
    }
  }
  function izle(t:number){
    if(id===undefined||!tus.isConnected||tamam)return;
    iler=Math.min(1,iler+Math.min(64,t-son)/(komut==='kalip'?600:950));son=t;goster();
    if(!tamam)kare=requestAnimationFrame(izle);
  }
  const dur=()=>{id=undefined;cancelAnimationFrame(kare);tus.classList.remove('ta-temas');};
  tus.onpointerdown=e=>{
    if(id!==undefined||!e.isPrimary)return;
    id=e.pointerId;tus.setPointerCapture(id);tus.classList.add('ta-temas');son=performance.now();kare=requestAnimationFrame(izle);
  };
  tus.onpointercancel=dur;tus.onpointerup=dur;
  tus.onclick=e=>{if(e.detail===0){iler=1;goster();}};
  return tus;
}

export function pisir(yiyecek:HTMLElement,pismis:HTMLElement,resim:Cizim,sonucuKaydet:(fazla:boolean)=>()=>void,tepsiYolu='sef/firin/tepsi',kayitliSure:number|undefined,kaydet:(ms:number)=>void){
  const alan=h('div.ta-firin-istasyonu');
  const firin=resim('sef/firin/firin','ta-firin-resim');
  const tepsi=resim(tepsiYolu,'ta-firin-tepsi');
  const yemek=dugme('Tatlı tepsisini fırın rafına sür','ta-firin-yemek',tepsi,yiyecek,pismis);pismis.hidden=true;
  const tus=dugme('Tepsiyi fırına koy','ta-firin-kumanda',ikon('ileri'));
  const gosterge=h('div.ta-pisme-saati',{role:'meter','aria-label':'Tatlı fırını','aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':0},h('i'),h('b'));
  const buhar=h('span.ta-firin-buhar',{'aria-hidden':true},h('i'),h('i'),h('i'));
  const bildirim=h('span.ta-duyuru',{'role':'status'});
  alan.append(firin,yemek,buhar,gosterge,tus,bildirim);
  let calisiyor=false,cekildi=false,gorunurSure=kayitliSure??0,baslangic:number|undefined,kare=0;
  let sonYazilan=kayitliSure??-1,arkada=false;
  let izlemeyiBirak=()=>{},arkayiBirak=()=>{};
  const sure=()=>Math.min(9000,gorunurSure+(baslangic===undefined?0:Math.max(0,performance.now()-baslangic)));
  function sakla(ms:number){
    const tam=Math.floor(ms);if(tam!==sonYazilan){sonYazilan=tam;kaydet(tam);}
  }
  function goster(zaman:number){
    const oran=Math.min(1,zaman/9000);
    gosterge.style.setProperty('--ibre',String(oran));
    gosterge.setAttribute('aria-valuenow',String(Math.round(oran*100)));
    if(zaman>=2300){
      const evre=zaman>7800?'fazla':'hazir';
      if(alan.dataset.evre!==evre){
        alan.dataset.evre=evre;yiyecek.hidden=true;pismis.hidden=false;
        bildirim.textContent=evre==='hazir'?'Fırın çaldı, tepsiyi alabilirsin.':'Tepsi fazla pişti.';
        gosterge.setAttribute('aria-valuetext',evre==='hazir'?'Tam kıvamında':'Fazla pişti');
        if(evre==='hazir')alan.dispatchEvent(new Event('pastane-firin-hazir',{bubbles:true}));
      }
    }
  }
  function ilerle(){
    if(!alan.isConnected||cekildi||document.hidden||arkada)return;
    const ms=sure();goster(ms);
    if(ms-sonYazilan>=500||ms===9000)sakla(ms);
    if(ms<9000)kare=window.setTimeout(ilerle,50);
  }
  function duraklat(){if(!calisiyor||cekildi)return;clearTimeout(kare);gorunurSure=sure();baslangic=undefined;sakla(gorunurSure);}
  function gorunurlukDegisti(){
    if(!calisiyor||cekildi)return;
    if(document.hidden||arkada){duraklat();return;}
    if(baslangic!==undefined)return;
    baslangic=performance.now();ilerle();
  }
  function bitirSaat(){
    clearTimeout(kare);izlemeyiBirak();arkayiBirak();
    document.removeEventListener('visibilitychange',gorunurlukDegisti);
    window.removeEventListener('pagehide',duraklat);
    window.removeEventListener('pageshow',gorunurlukDegisti);
  }
  function kumanda(){
    if(!calisiyor){
      calisiyor=true;alan.dataset.evre='pisiyor';tus.setAttribute('aria-label','Tepsiyi fırından çıkar');
      yemek.setAttribute('aria-label','Tatlı tepsisini raftan kendine çek');
      gosterge.setAttribute('aria-valuetext','Pişiyor');goster(gorunurSure);sakla(gorunurSure);
      document.addEventListener('visibilitychange',gorunurlukDegisti);
      window.addEventListener('pagehide',duraklat);window.addEventListener('pageshow',gorunurlukDegisti);
      arkayiBirak=arkaPlanDinle(v=>{arkada=v;gorunurlukDegisti();});
      izlemeyiBirak=sahnedenAyrilinca(alan,()=>{duraklat();bitirSaat();});
      tus.replaceChildren(ikon('el'));gorunurlukDegisti();return;
    }
    if(cekildi)return;
    const zaman=sure();
    if(zaman<2300){
      alan.classList.remove('ta-erken');void alan.offsetWidth;alan.classList.add('ta-erken');return;
    }
    sakla(zaman);cekildi=true;bitirSaat();tus.disabled=true;yemek.disabled=true;alan.classList.add('ta-cikti');
    const sonrakiAdimiGoster=sonucuKaydet(zaman>7800);
    window.setTimeout(()=>{if(alan.isConnected)sonrakiAdimiGoster();},350);
  }
  tus.onclick=kumanda;
  function rafHedefi(x:number,y:number){
    const r=alan.getBoundingClientRect(),sol=(x-r.left)/r.width,ust=(y-r.top)/r.height;
    return sol>.22&&sol<.76&&(calisiyor?ust>.69:ust>.29&&ust<.69);
  }
  function geriKoy(){yemek.style.translate='';delete yemek.dataset.elde;delete alan.dataset.raf;}
  jest(yemek,{
    tasi:(p,ilk)=>{
      if(cekildi||Math.hypot(p.x-ilk.x,p.y-ilk.y)<6)return;
      yemek.dataset.elde='true';alan.dataset.raf=String(rafHedefi(p.x,p.y));
      yemek.style.translate=(p.x-ilk.x)+'px '+(p.y-ilk.y)+'px';
    },
    birak:(p,ilk,tik)=>{
      geriKoy();
      if(tik||rafHedefi(p.x,p.y)&&(calisiyor?p.y>ilk.y+10:p.y<ilk.y-10))kumanda();
    },iptal:geriKoy,klavye:kumanda,
  });
  // The caller appends the station synchronously. A saved zero also means the tray is in the oven.
  if(kayitliSure!==undefined)queueMicrotask(()=>{if(alan.isConnected&&!calisiyor)kumanda();});
  return {alan,duraklat};
}
