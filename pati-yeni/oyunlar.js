import {parkurAdimi,pozlariYukle} from './gezinti.js';
import './mini-sahne.css';
export function oyunTahtasi(resim){
 return `<button type="button" class="elde-oyuncak getir-topu" aria-label="Oyuncağı sürükleyip at">${resim}</button>`;
}
export function oyunuBagla(sahne,tur,sevindi,signal){
 const pet=sahne.querySelector('.buyuk'), toy=sahne.querySelector('.elde-oyuncak');
 const azalt=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const patili=tur==='kopek'||tur==='kedi';
 let pozHazir=false;
 if(patili){
  pet.classList.add('mini-adim');pet.dataset.aile=tur;parkurAdimi(pet,tur);
  pozlariYukle(tur,pet).then(()=>{pozHazir=true;}).catch(()=>{});
 }
 function adim(p,steps){
  if(!pozHazir||azalt)return;
  pet.classList.add('adimli');
  pet.style.setProperty('--pati-yon',yon);
  pet.classList.toggle('ters-adim',Math.floor(p*steps)%2===1);
 }
 function dur(){
  pet.classList.remove('adimli','ters-adim','topa-bak');
  pet.style.removeProperty('--bakis');
 }
 let aktif=null,mesgul=false,raf=0,dx=0,dy=0,sonX=0,hiz=0,sonAn=0,yon=1;
 const sinir=(v,a,b)=>Math.max(a,Math.min(b,v));
 const boy=()=>sahne.getBoundingClientRect();
 function agiz(){
  const r=boy(),f=(pet.querySelector('.kafa.normal,.yuz,.butun-balik')||pet),b=f.getBoundingClientRect(),css=getComputedStyle(f);
  const x=Number(css.getPropertyValue('--agiz-x').trim()||(tur==='kopek'?.5:f.matches('.butun-balik')?.13:.64));
  const y=Number(css.getPropertyValue('--agiz-y').trim()||(f.matches('.butun-balik')?.54:.79));
  return {x:b.left-r.left+b.width*x,y:b.top-r.top+b.height*y};
 }
 function koy(x,y,angle=0){toy.style.left=x+'px';toy.style.top=y+'px';toy.style.setProperty('--don',angle+'deg');}
 function hareket(x,y,r=0){pet.style.transform='translate('+x+'px,'+y+'px) rotate('+r+'deg)';}
 function hazir(){
  dur();hareket(0,0);const m=agiz(),r=boy(),w=toy.offsetWidth;
  koy(sinir(m.x+yon*r.width*.17,w/2,r.width-w/2),r.height*.79,0);
  toy.style.scale='';mesgul=false;
 }
 function kareler(ms,ciz,son){
  let ilk;
  function kare(t){if(signal.aborted)return;ilk??=t;const p=Math.min(1,(t-ilk)/(azalt?ms*.55:ms));ciz(p);if(p<1)raf=requestAnimationFrame(kare);else son();}
  raf=requestAnimationFrame(kare);
 }
 const yumusat=p=>p*p*(3-2*p);
 function patiAt(kalkis,hedef){
  mesgul=true;
  const r=boy(),bounds=pet.getBoundingClientRect();
  const floor=sinir(bounds.bottom-r.top-toy.offsetHeight*.55,r.height*.70,r.height-toy.offsetHeight/2);
  const edge=toy.offsetWidth*.55;
  const lead=pet.offsetWidth*.25;
  const center=bounds.left-r.left+bounds.width/2;
  const touch=sinir(hedef-center-yon*lead,-r.width*.36,r.width*.36);
  const contact=center+touch+yon*lead;
  const rebound=sinir(contact+yon*r.width*.23,edge,r.width-edge);
  // Eyes settle on the rolling ball before the hind legs compress.
  kareler(520,p=>{
   koy(kalkis.x+(contact-kalkis.x)*yumusat(p),kalkis.y+(floor-kalkis.y)*p-Math.sin(Math.PI*p)*(1-p)*r.height*.12,yon*p*205);
   pet.style.transform='translateY('+p*3+'px) scale('+(1+p*.06)+','+(1-p*.18)+') rotate('+yon*p*4+'deg)';
  },()=>kareler(270,p=>{
   adim(p,2);
   hareket(touch*yumusat(p),-Math.sin(p*Math.PI)*r.height*.14,yon*7*Math.sin(p*Math.PI));
  },()=>kareler(550,p=>{
   adim(0,1);
   const roll=1-(1-p)**2;
   koy(contact+(rebound-contact)*roll,floor-Math.abs(Math.sin(p*Math.PI*2))*(1-p)*r.height*.10,yon*(205-350*roll));
   hareket(touch*(1-.12*yumusat(p)),2*Math.sin(Math.PI*p),-yon*4*Math.sin(Math.PI*p));
  },()=>kareler(480,p=>{
   adim(p,4);hareket(touch*.88*(1-yumusat(p)),-Math.abs(Math.sin(p*Math.PI*2))*4);
  },()=>{dur();hareket(0,0);mesgul=false;sevindi();}))));
 }
 function getir(kalkis,hedef){
  mesgul=true;const m=agiz(),r=boy(),zemin=r.height*.79;
  const yol=sinir(hedef-m.x,-r.width*.31,r.width*.31);
  kareler(560,p=>{
   adim(p,5);
   koy(kalkis.x+(hedef-kalkis.x)*p,kalkis.y+(zemin-kalkis.y)*p-Math.abs(Math.sin(p*Math.PI*1.4))*(1-p)*r.height*.27,p*240);
   hareket(yol*yumusat(p)*.55,-Math.abs(Math.sin(p*Math.PI*2))*r.height*.018);
  },()=>kareler(400,p=>{
   dur();hareket(yol*(.55+.45*yumusat(p)),r.height*.055*Math.sin(p*Math.PI),yon*4*Math.sin(p*Math.PI));
   const a=agiz();koy(hedef+(a.x-hedef)*yumusat(p),zemin+(a.y-zemin)*yumusat(p));
  },()=>kareler(680,p=>{
   adim(p,6);hareket(yol*(1-yumusat(p)),-Math.abs(Math.sin(p*Math.PI*3))*r.height*.023);
   const a=agiz();koy(a.x,a.y+toy.offsetHeight*.13);
  },()=>{const a=agiz(),x=a.x+yon*r.width*.17;kareler(320,p=>koy(a.x+(x-a.x)*p,a.y+(zemin-a.y)*p*p),()=>{sevindi();hazir();});})));
 }
 function birak(){
   const r=boy();if(Math.hypot(dx,dy)<8){hazir();return;}
   const x=Number.parseFloat(toy.style.left),y=Number.parseFloat(toy.style.top);
   const doel=sinir(x+dx*.43+hiz*90,r.width*.13,r.width*.87);yon=doel>=agiz().x?1:-1;(tur==='kedi'?patiAt:getir)({x,y},doel);
 }
 let start,begin;
 toy.addEventListener('pointerdown',e=>{if(mesgul||actief()||!e.isPrimary||e.button!==0)return;aktif=e.pointerId;start={x:e.clientX,y:e.clientY};begin={x:parseFloat(toy.style.left),y:parseFloat(toy.style.top)};dx=dy=hiz=0;sonX=e.clientX;sonAn=e.timeStamp;toy.setPointerCapture(aktif);e.preventDefault();},{signal});
 function actief(){return aktif!==null;}
 function tasima(e){
  dx=e.clientX-start.x;dy=e.clientY-start.y;const r=boy();
  if(e.clientX!==sonX){hiz=sinir((e.clientX-sonX)/Math.max(8,e.timeStamp-sonAn),-1.3,1.3);sonX=e.clientX;sonAn=e.timeStamp;}
  if(patili&&!azalt){
   pet.classList.add('topa-bak');
   pet.style.setProperty('--bakis',sinir((begin.x+dx-r.width/2)/r.width*24,-9,9)+'deg');
  }
  koy(sinir(begin.x+dx,10,r.width-10),sinir(begin.y+dy,10,r.height-10),dx*.45);
 }
 toy.addEventListener('pointermove',e=>{if(aktif===e.pointerId)tasima(e);},{signal});
 toy.addEventListener('pointerup',e=>{if(aktif!==e.pointerId)return;tasima(e);aktif=null;birak();},{signal});
 toy.addEventListener('pointercancel',()=>{aktif=null;hazir();},{signal});
 toy.addEventListener('click',e=>{if(e.detail!==0||mesgul||actief())return;yon*=-1;dx=yon*48;dy=0;hiz=0;birak();},{signal});
 const resize=new ResizeObserver(()=>{if(!mesgul&&!actief())hazir();});resize.observe(sahne);
 signal.addEventListener('abort',()=>{cancelAnimationFrame(raf);resize.disconnect();pet.style.transform='';},{once:true});hazir();
}
