import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import './pastane-krema.css';

const dosyalar=import.meta.glob<string>('../../assets/sef/krema/*.webp',{eager:true,query:'?url',import:'default'});
const cizim=(id:string,sinif:string)=>h('img',{src:dosyalar['../../assets/sef/krema/'+id+'.webp'],class:sinif,draggable:false,alt:''});
const svgNs='http://www.w3.org/2000/svg';
const sonKontrol=(el:HTMLElement,sonraki:()=>void)=>setTimeout(()=>{if(el.isConnected)sonraki();},matchMedia('(prefers-reduced-motion:reduce)').matches?0:480);

export function kekKalibi(miktar=1){
  const kalip=h('span.kek-dolum-kalibi',{},cizim('kalip','kek-kagit'),h('i.kek-hamuru'));
  kalip.style.setProperty('--miktar',String(miktar));return kalip;
}
export function kekHamurunuDok(ilk:number,kaydet:(oran:number)=>void,bitir:()=>void){
  let miktar=Number.isFinite(ilk)?Math.max(0,Math.min(.999,ilk)):0,aci=0,son=0,raf=0,tap=false,bitti=false,sonKayit=miktar;
  const kap=h('div.kek-dokum',{'aria-label':'Kek hamuru'});
  const svg=document.createElementNS(svgNs,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.classList.add('kek-akis');
  const yol=document.createElementNS(svgNs,'path');svg.append(yol);
  const kase=dugme('Hamuru kek kalıbına dök','kek-kase',cizim('kase','kek-kase-cizim'),h('i.kek-agiz'));
  const el=h('span.kek-el',{'aria-hidden':true},ikon('el'));kase.append(el);
  const kalip=kekKalibi(miktar);kap.append(kalip,svg,kase);
  let bas:{x:number;y:number;hareket:boolean}|undefined;
  function goster(){
    kase.style.setProperty('--aci',aci+'deg');
    kalip.style.setProperty('--miktar',String(miktar));kap.dataset.oran=String(Math.round(miktar*100));
    const kutu=kap.getBoundingClientRect(),agiz=kase.querySelector('i.kek-agiz')!.getBoundingClientRect();
    if(!kutu.width)return;
    const x=100*(agiz.left+agiz.width/2-kutu.left)/kutu.width,y=100*(agiz.top+agiz.height/2-kutu.top)/kutu.height;
    const yuz=kalip.querySelector('.kek-hamuru')!.getBoundingClientRect();
    const sol=100*(yuz.left-kutu.left)/kutu.width,sag=100*(yuz.right-kutu.left)/kutu.width;
    const bx=Math.max(sol+1,Math.min(x+4,sag-1)),by=100*(yuz.top+yuz.height*.48-kutu.top)/kutu.height;
    const en=aci<9?0:1.1+aci*.032;
    yol.setAttribute('d','M '+x+' '+y+' C '+(x+2.3)+' '+(y+5)+' '+(bx-1.5)+' '+(by-17)+' '+bx+' '+by+' Q '+(bx+en*.45)+' '+(by+1)+' '+(bx+en)+' '+by+' C '+(bx+en)+' '+(by-14)+' '+(x+en+2)+' '+(y+6)+' '+(x+en*.48)+' '+y+' Z');
    svg.style.visibility=aci>=9&&miktar<1?'visible':'hidden';
  }
  function aralik(now:number){
    if(!kap.isConnected||bitti)return;
    const dt=!son||document.hidden?0:Math.min(70,now-son);son=now;
    if(tap)aci=Math.min(36,aci+dt*.15);
    if(aci>8)miktar=Math.min(1,miktar+dt/2300*(aci-8)/28);
    goster();if(miktar-sonKayit>.045){sonKayit=miktar;kaydet(miktar);}
    if(miktar>=1){bitti=true;kaydet(1);aci=0;goster();kase.disabled=true;sonKontrol(kap,bitir);return;}
    raf=requestAnimationFrame(aralik);
  }
  function baslat(){cancelAnimationFrame(raf);son=0;raf=requestAnimationFrame(aralik);}
  function dur(){cancelAnimationFrame(raf);tap=false;aci=0;goster();kaydet(miktar);}
  kase.onpointerdown=e=>{if(e.button!==0||!e.isPrimary||bitti)return;if(tap){dur();return;}bas={x:e.clientX,y:e.clientY,hareket:false};tap=false;aci=0;kase.setPointerCapture(e.pointerId);baslat();};
  kase.onpointermove=e=>{
    if(!bas)return;
    const dx=e.clientX-bas.x,dy=e.clientY-bas.y;
    if(Math.hypot(dx,dy)>5)bas.hareket=true;
    const r=kap.getBoundingClientRect();aci=Math.max(0,Math.min(38,(dx/r.width*.75+dy/r.height*.7)*140));goster();
  };
  kase.onpointerup=()=>{if(!bas)return;const tek=!bas.hareket;bas=undefined;if(bitti)return;if(tek){tap=true;baslat();}else dur();};
  kase.onpointercancel=()=>{bas=undefined;if(!bitti)dur();};
  kase.onlostpointercapture=()=>{if(bas){bas=undefined;if(!bitti)dur();}};
  kase.onclick=e=>{if(e.detail===0&&!bitti){if(tap)dur();else{tap=true;baslat();}}};
  if(ilk===1){requestAnimationFrame(()=>{if(kap.isConnected)bitir();});}
  goster();return kap;
}

export interface KremaNoktasi{x:number;y:number}
const kremaliYol=(x:number,y:number)=>((x-.5)/.402)**2+((y-.438)/.305)**2<=1;
export const kremaIziniOku=(v:unknown):KremaNoktasi[]=>Array.isArray(v)?v.slice(0,420).filter((p):p is KremaNoktasi=>typeof p?.x==='number'&&typeof p?.y==='number'&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&kremaliYol(p.x,p.y)).map(p=>({x:p.x,y:p.y})):[];
export function tartKremasiniYay(resim:(id:string,sinif?:string)=>HTMLImageElement,eski:KremaNoktasi[],kaydet:(iz:KremaNoktasi[])=>void,bitir:()=>void){
  const tus=dugme('Tartın kremasını yay','tart-krema-yay',resim('sef/tatli/tart-bos','tart-kuru'));
  const tabaka=resim('sef/tatli/tart-kremali','tart-gercek-krema');
  const c=h('canvas.tart-krem-izi',{width:360,height:226,'aria-hidden':true});
  const firca=c.getContext('2d')!;
  const kasik=cizim('tartkasik','tart-spatula');
  const sonraki=h('i.tart-krem-hedef',{'aria-hidden':true});
  tus.append(c,sonraki,kasik);
  const noktalar=kremaIziniOku(eski);
  const hedefler:KremaNoktasi[]=[];
  for(let j=0;j<8;j++)for(let i=0;i<12;i++){
    const x=.16+i*.062,y=.20+j*.065;
    if(kremaliYol(x,y))hedefler.push({x,y});
  }
  const dag={x:.5,y:.46},yaricap=.095;
  const yakin=(a:KremaNoktasi,b:KremaNoktasi)=>Math.hypot(a.x-b.x,(a.y-b.y)*.63)<yaricap;
  const kaplanan=(p:KremaNoktasi)=>yakin(dag,p)||noktalar.some(n=>yakin(n,p));
  let tamam=false,son:KremaNoktasi|undefined,sonKayit=0;
  const kon=(el:HTMLElement,p:KremaNoktasi)=>{el.style.left=p.x*100+'%';el.style.top=p.y*100+'%';};
  function boya(){
    firca.clearRect(0,0,c.width,c.height);firca.save();firca.scale(c.width,c.height);
    firca.beginPath();firca.ellipse(.5,.438,.405,.315,0,0,Math.PI*2);firca.clip();
    firca.fillStyle='#fff0cf';
    for(const n of [dag,...noktalar]){firca.beginPath();firca.ellipse(n.x,n.y,yaricap,yaricap/.63,0,0,Math.PI*2);firca.fill();}
    if(tabaka.complete&&tabaka.naturalWidth){firca.globalCompositeOperation='source-in';firca.drawImage(tabaka,0,0,1,1);}
    firca.restore();
    const eksikler=hedefler.filter(p=>!kaplanan(p));tus.dataset.kaplama=String(Math.round((1-eksikler.length/hedefler.length)*100));
    if(eksikler.length===0&&!tamam){
      tamam=true;tus.dataset.tamam='true';kaydet(noktalar);sonKontrol(tus,bitir);return;
    }
    if(eksikler.length)kon(sonraki,eksikler[0]);
  }
  function sur(p:KremaNoktasi){
    if(tamam||!kremaliYol(p.x,p.y))return;
    if(son&&Math.hypot(p.x-son.x,(p.y-son.y)*.63)<.025)return;
    if(son){
      const aralik=Math.ceil(Math.hypot(p.x-son.x,(p.y-son.y)*.63)/.05);
      for(let j=1;j<aralik;j++){const n={x:son.x+(p.x-son.x)*j/aralik,y:son.y+(p.y-son.y)*j/aralik};if(!noktalar.some(k=>Math.hypot(k.x-n.x,k.y-n.y)<.023)&&noktalar.length<420)noktalar.push(n);}
    }
    if(!noktalar.some(k=>Math.hypot(k.x-p.x,k.y-p.y)<.023)&&noktalar.length<420)noktalar.push(p);
    kon(kasik,p);son=p;boya();
    if(noktalar.length-sonKayit>=6){sonKayit=noktalar.length;kaydet(noktalar);}
  }
  const konum=(e:PointerEvent)=>{const r=tus.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};};
  tus.onpointerdown=e=>{if(!e.isPrimary||e.button!==0||tamam)return;son=undefined;tus.setPointerCapture(e.pointerId);sur(konum(e));};
  tus.onpointermove=e=>{if(tus.hasPointerCapture(e.pointerId))sur(konum(e));};
  tus.onpointerup=tus.onpointercancel=tus.onlostpointercapture=()=>{son=undefined;kaydet(noktalar);};
  tus.onclick=e=>{if(e.detail===0){son=undefined;const p=hedefler.find(x=>!kaplanan(x));if(p)sur(p);kaydet(noktalar);}};
  tabaka.onload=boya;kon(kasik,dag);boya();return tus;
}
