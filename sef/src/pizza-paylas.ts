import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {jest,type Nokta} from './hareket';
import './pizza-paylas.css';

import type {PizzaKesigi,PizzaKesimi} from './pizza-kesimi';

export function kesimCizgisi(yon:PizzaKesigi){return h('i.pz-kesilmis',{'data-yon':yon,'aria-hidden':true});}
function yukaridanNokta(kutu:DOMRect,p:Nokta){
  return {x:(p.x-kutu.left)/kutu.width-.5,y:(p.y-kutu.top)/kutu.height-.5};
}
/** One continuous drag must enter, pass through the centre and emerge at the opposite crust. */
export function pizzaKesimTahtasi(pizza:HTMLElement,t:PizzaKesimi,kaydet:()=>void,ses:()=>void,bitir:()=>void){
  const tahta=h('section.pz-kesim-masasi',{'aria-label':'Pizza dilimleme tahtası'});
  const b=dugme('Pizza ruletini hamurun bir kenarından karşı kenarına sür','pz-rulet-yolu',pizza);
  const alet=h('img.pz-kesme-ruleti',{src:new URL('../../assets/sef/firin/pizza-ruleti.webp',import.meta.url).href,alt:'',draggable:false});
  const iz=h('i.pz-kesim-izi',{'aria-hidden':true});
  const teslim=dugme('Dört dilimi servis tabağına al','pz-paylas-tamam',ikon('servis'),ikon('ileri'));
  const durum=h('span.pz-paylas-dilimleri',{role:'status','aria-live':'polite'});
  tahta.append(b,durum,teslim);
  let yol:Nokta[]=[];
  const gidilecek=():PizzaKesigi=>t.kesikler.includes('dikey')?'yatay':'dikey';
  function goster(){
    b.replaceChildren(pizza);
    for(const y of t.kesikler)b.append(kesimCizgisi(y));
    teslim.disabled=t.kesikler.length<2;b.disabled=!teslim.disabled;
    durum.replaceChildren();durum.setAttribute('aria-label',(t.kesikler.length?2*t.kesikler.length:1)+' pizza dilimi');
    for(let i=0;i<4;i++)durum.append(h('i',{'data-tamam':String(i<(t.kesikler.length?2*t.kesikler.length:1))}));
    if(b.disabled)return;
    const yon=gidilecek();iz.dataset.yon=yon;b.append(iz,alet);alet.style.left=yon==='dikey'?'50%':'8%';alet.style.top=yon==='dikey'?'8%':'50%';
  }
  function kes(yon:PizzaKesigi){
    if(t.kesikler.includes(yon))return;
    t.kesikler.push(yon);ses();kaydet();goster();
  }
  const tasi=(n:Nokta)=>{
    const p=yukaridanNokta(b.getBoundingClientRect(),n);yol.push(p);
    alet.style.left=Math.max(2,Math.min(98,p.x*100+50))+'%';alet.style.top=Math.max(2,Math.min(98,p.y*100+50))+'%';
  };
  jest(b,{basla:n=>{yol=[];tasi(n);},tasi,birak:n=>{
    tasi(n);
    for(const yon of ['dikey','yatay'] as const){
      if(t.kesikler.includes(yon))continue;
      const duz=yon==='dikey'?'y':'x',yan=yon==='dikey'?'x':'y';
      const bas=yol[0],son=yol[yol.length-1];
      const kesti=bas[duz]*son[duz]<0&&Math.min(Math.abs(bas[duz]),Math.abs(son[duz]))>.29&&
        yol.every(p=>Math.abs(p[yan])<.15)&&Math.abs(son[yan]-bas[yan])<=.19;
      if(kesti){kes(yon);break;}
    }
    yol=[];goster();
  },iptal:()=>{yol=[];goster();},klavye:()=>kes(gidilecek())});
  jest(teslim,{birak:(_,__,tik)=>{if(tik)bitir();},klavye:bitir});goster();return tahta;
}
