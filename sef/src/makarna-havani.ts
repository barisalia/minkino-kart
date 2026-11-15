import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {jest,type Nokta} from './hareket';
import './makarna-havani.css';

export const pestoNoktalari=[{x:35,y:28},{x:64,y:27},{x:50,y:40}] as const;
export function havanAc(mask:number,resim:(ad:string,sinif?:string)=>HTMLImageElement,kaydet:(mask:number)=>void,ses:()=>void,aktar:()=>void){
  const kasa=h('div.mp-havan-istasyonu');
  const kap=h('div.mp-havan-kabi',{},resim('havan','mp-havan'));
  const el=dugme('Havanda fesleğeni ez','mp-havan-dokunus');
  const tokmak=dugme('Tokmağı tut ve fesleğenin üstüne sür','mp-havan-tokmagi',resim('tokmak'));
  const bitir=dugme('Hazırladığın pestoyu tabağa dök','mp-havan-aktar',resim('pesto'),ikon('ileri'));
  const yapraklar=pestoNoktalari.map((n,i)=>{
    const yaprak=h('span.mp-havan-yaprak');yaprak.style.left=n.x+'%';yaprak.style.top=n.y+'%';
    kap.append(yaprak);return {yaprak,i};
  });
  function yenile(){
    for(const {yaprak,i} of yapraklar){
      const ezildi=Boolean(mask&(1<<i));
      yaprak.dataset.ezildi=String(ezildi);yaprak.replaceChildren(resim(ezildi?'pesto-dokum':'feslegen'));
    }
    el.disabled=mask===7;tokmak.disabled=mask===7;bitir.disabled=mask===0;bitir.dataset.hazir=String(mask===7);
    kasa.dataset.ezilen=String(mask);
  }
  function konum(x:number,y:number){
    tokmak.style.left=x+'%';tokmak.style.top=y+'%';
  }
  function ez(i:number){
    if(mask&(1<<i))return;
    mask|=1<<i;kaydet(mask);ses();yenile();
    const n=pestoNoktalari[i];konum(n.x,n.y);
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)tokmak.animate([{translate:'-17% -95%'},{translate:'-17% -81%'},{translate:'-17% -90%'}],{duration:210});
  }
  function temas(p:Nokta){
    const r=kap.getBoundingClientRect(),x=(p.x-r.left)*100/r.width,y=(p.y-r.top)*100/r.height;
    konum(Math.min(82,Math.max(19,x)),Math.min(48,Math.max(15,y)));
    let enYakin=-1,mesafe=Infinity;
    pestoNoktalari.forEach((n,i)=>{
      const d=Math.hypot((n.x-x)*r.width/100,(n.y-y)*r.height/100);
      if(!(mask&(1<<i))&&d<mesafe&&d<Math.max(18,r.width*.105)){mesafe=d;enYakin=i;}
    });
    if(enYakin!==-1)ez(enYakin);
  }
  // A single uninterrupted stroke can reach multiple clusters; each cluster earns one crush.
  jest(el,{basla:temas,tasi:temas,birak:()=>{},klavye:()=>{const i=pestoNoktalari.findIndex((_,i)=>!(mask&(1<<i)));if(i>=0)ez(i);}});
  let tutus={x:0,y:0};
  jest(tokmak,{
    basla:p=>{
      const r=kap.getBoundingClientRect();
      tutus={x:r.left+r.width*parseFloat(tokmak.style.left)/100-p.x,y:r.top+r.height*parseFloat(tokmak.style.top)/100-p.y};
    },
    tasi:p=>temas({x:p.x+tutus.x,y:p.y+tutus.y}),
    birak:()=>{},
    klavye:()=>{const i=pestoNoktalari.findIndex((_,i)=>!(mask&(1<<i)));if(i>=0)ez(i);},
  });
  bitir.onclick=()=>{if(mask)aktar();};
  yenile();konum(68,30);kap.append(el,tokmak);kasa.append(kap,bitir);return kasa;
}
