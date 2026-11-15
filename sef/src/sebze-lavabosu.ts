import {h} from '../../src/ui/dom';
import {dugme,ikon,resim} from './gorsel';
import {efekt} from '../../src/audio/efekt';
import type {MalzemeId} from './tarif';
import './sebze-lavabosu.css';

const kir=new URL('../../assets/sef/yikama/kir.webp',import.meta.url).href;
export const sebzeLekeleri:Record<MalzemeId,readonly [number,number][]>={
  domates:[[28,53],[60,41],[59,70]],marul:[[32,48],[60,38],[52,68]],
  havuc:[[38,65],[52,52],[63,43]],salatalik:[[31,61],[49,49],[64,41]],patates:[[35,49],[60,38],[55,68]],
};
export function yikamaIsareti(){return h('span.yikama-damla',{'aria-hidden':true});}
export function sebzeLavabosu(id:MalzemeId,ilk:number,kaydet:(bit:number)=>void,kapat:()=>void,sesli:()=>boolean){
  const alan=h('section.sebze-lavabosu',{'aria-label':'Sebze lavabosu'});
  const geri=dugme('Kesme tahtasına dön','lavabo-geri',ikon('geri'));
  const ac=dugme('Musluğu aç','lavabo-musluk',yikamaIsareti());ac.setAttribute('aria-pressed','false');
  const su=h('span.lavabo-su',{'aria-hidden':true});
  for(let i=0;i<3;i++)su.append(h('i'));
  const yiyecek=h('div.lavabo-sebze',{role:'group','aria-label':'Yıkanacak sebze'},resim(id));
  const kirler=h('span.lavabo-lekeler');yiyecek.append(kirler);
  const cevir=dugme('Sebzeyi döndür','lavabo-cevir',ikon('karistir'));
  const bitti=dugme('Temiz sebzeyi kesme tahtasına al','lavabo-onay',ikon('onay'));
  alan.append(geri,su,yiyecek,ac,cevir,bitti);
  let maske=ilk,akiyor=false,aci=0;
  const hedefler=sebzeLekeleri[id].map(([x,y],i)=>{
    const b=dugme((i+1)+'. toprak lekesini temizle','lavabo-leke',h('img',{src:kir,alt:'',draggable:false}));
    b.style.left=x+'%';b.style.top=y+'%';b.hidden=!!(maske&(1<<i));b.dataset.leke=String(i);kirler.append(b);
    b.onclick=e=>{if(e.detail===0)temizle(i);};return b;
  });
  function goster(){
    alan.dataset.su=String(akiyor);alan.dataset.temiz=String(maske===7);
    ac.setAttribute('aria-label',akiyor?'Musluğu kapat':'Musluğu aç');ac.setAttribute('aria-pressed',String(akiyor));
    cevir.hidden=maske===7;bitti.hidden=maske!==7;yiyecek.style.setProperty('--donus',aci+'deg');
    for(const [i,b] of hedefler.entries())b.hidden=!!(maske&(1<<i));
  }
  geri.onclick=kapat;bitti.onclick=kapat;
  ac.onclick=()=>{akiyor=!akiyor;if(sesli())akiyor?efekt.sicrama():efekt.dokunma();goster();};
  cevir.onclick=()=>{aci+=45;goster();};
  function temizle(i:number){
    if(!akiyor||maske&(1<<i))return;
    maske|=1<<i;kaydet(maske);if(sesli())maske===7?efekt.dogru():efekt.sicrama();
    if(maske===7)akiyor=false;goster();if(maske===7)bitti.focus();
  }
  let tut:{id:number;sonX:number;sonY:number;basAci:number;ilk:number;kir:boolean}|undefined;
  const iz=[0,0,0];
  function yakin(x:number,y:number){
    return hedefler.findIndex((b,i)=>{
      if(maske&(1<<i))return false;
      const r=b.getBoundingClientRect(),dx=(x-r.left-r.width/2)/(r.width*.52),dy=(y-r.top-r.height/2)/(r.height*.58);
      return dx*dx+dy*dy<=1;
    });
  }
  function kutup(x:number,y:number){
    const r=yiyecek.getBoundingClientRect();return Math.atan2(y-r.top-r.height/2,x-r.left-r.width/2)*180/Math.PI;
  }
  yiyecek.onpointerdown=e=>{
    if(e.button!==0||!e.isPrimary||maske===7)return;
    tut={id:e.pointerId,sonX:e.clientX,sonY:e.clientY,basAci:kutup(e.clientX,e.clientY),ilk:aci,kir:akiyor&&yakin(e.clientX,e.clientY)>=0};
    yiyecek.setPointerCapture(e.pointerId);
  };
  yiyecek.onpointermove=e=>{
    if(!tut||tut.id!==e.pointerId)return;
    const i=yakin(e.clientX,e.clientY),mesafe=Math.hypot(e.clientX-tut.sonX,e.clientY-tut.sonY);
    if(tut.kir&&akiyor&&i>=0){
      const r=hedefler[i].getBoundingClientRect();iz[i]+=Math.min(mesafe,r.width*.45)/Math.max(r.width,16);
      hedefler[i].style.opacity=String(1-Math.min(.65,iz[i]*.85));
      if(iz[i]>=.48)temizle(i);
    }else if(!tut.kir){aci=tut.ilk+kutup(e.clientX,e.clientY)-tut.basAci;yiyecek.style.setProperty('--donus',aci+'deg');}
    tut.sonX=e.clientX;tut.sonY=e.clientY;
  };
  yiyecek.onlostpointercapture=yiyecek.onpointercancel=yiyecek.onpointerup=()=>{tut=undefined;};
  goster();return alan;
}
