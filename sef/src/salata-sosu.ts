import {h} from '../../src/ui/dom';
import {ikon} from './gorsel';
import {svgOge} from './kesim-resmi';
export type SosId='limon'|'yogurt'|'feslegen';
export type Puan=1|2|3;
export const sosMu=(s:unknown):s is SosId=>s==='limon'||s==='yogurt'||s==='feslegen';
export const sosAd={limon:'Limon suyu',yogurt:'Yoğurt sosu',feslegen:'Fesleğen sosu'};
export const sosIstegi={limon:'Müşteri limonlu salata istiyor.',yogurt:'Müşteri yoğurt soslu salata istiyor.',feslegen:'Müşteri fesleğen soslu salata istiyor.'};
const limon=new URL('../../assets/sef/mucver/limon.webp',import.meta.url).href;
const yogurt=new URL('../../assets/sef/sis/sos-yogurt.webp',import.meta.url).href;
const kasik=new URL('../../assets/sef/mucver/yogurt-kasik.webp',import.meta.url).href;
const pesto=new URL('../../assets/sef/makarna/pesto.webp',import.meta.url).href;
export interface SosNoktasi { x:number; y:number }
export const sosResmi=(s:SosId,sinif='',elde=false)=>h('img',{alt:'',class:sinif,src:s==='feslegen'?pesto:s==='limon'?limon:elde?kasik:yogurt,draggable:false});
export function sosKatmani(s:SosId,x:number,y:number,iz?:readonly SosNoktasi[]){
  const el=svgOge('svg',{class:'salata-sos-katmani',viewBox:'0 0 100 70',preserveAspectRatio:'none','aria-hidden':'true'});
  el.dataset.sos=s;
  if(iz?.length){
    const yer=(p:SosNoktasi)=>[p.x*100,p.y*70];
    if(s==='limon'){
      const secilen=iz.length<8?iz:iz.filter((_,i)=>i%2===0);
      for(const nokta of secilen){
        const [cx,cy]=yer(nokta);
        el.append(svgOge('ellipse',{cx,cy,rx:1.25,ry:.92,fill:'#ffda4d',stroke:'#7c661c','stroke-width':.37}));
      }
    }else{
      const noktalar=iz.map(yer);
      let d='M'+noktalar[0].join(' ');
      for(let i=1;i<noktalar.length-1;i++){
        const [x,y]=noktalar[i],[sonX,sonY]=noktalar[i+1];
        d+=' Q'+x+' '+y+' '+(x+sonX)/2+' '+(y+sonY)/2;
      }
      d+=noktalar.length===1?' l.12 .08':' L'+noktalar[noktalar.length-1].join(' ');
      for(const [renk,en] of s==='feslegen'?[['#2e512a',2.4],['#75ad3f',1.65]]:[['#675449',2.22],['#fff9e7',1.61]]){
        el.append(svgOge('path',{d,stroke:renk,'stroke-width':en,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'}));
      }
    }
    return el;
  }
  const g=svgOge('g',{transform:'translate('+((x-.5)*12)+' '+((y-.5)*8)+')'});
  if(s==='yogurt'||s==='feslegen'){
    for(const d of ['M29 35 Q32 32 38 33 Q42 34 45 33','M47 46 Q52 42 58 44 Q61 45 63 43','M54 28 Q57 26 60 27']){
      const renkler=s==='yogurt'?[['#615044','2.25'],['#fff9e5','1.65']]:[['#2e512a','2.4'],['#75ad3f','1.65']];
      for(const [renk,en] of renkler)g.append(svgOge('path',{d,fill:'none',stroke:renk,'stroke-width':en,'stroke-linecap':'round','stroke-linejoin':'round'}));
    }
  }else{
    for(const [cx,cy] of [[34,28],[48,33],[61,27],[54,42],[39,40]])g.append(svgOge('path',{d:'M0 -1.9 Q3.1 -.3 2.7 1 Q2.1 2.6 -.4 1.9 Q-2.5 .9 0 -1.9Z',transform:'translate('+cx+' '+cy+')',fill:'#ffe363',stroke:'#826012','stroke-width':.6}));
  }
  el.append(g);return el;
}
export function yildizlar(p:Puan){
  return h('span.sef-yildizlar',{'aria-label':'Müşteriden 3 üzerinden '+p+' yıldız','data-puan':p},...[1,2,3].map(i=>h('i',{'data-dolu':String(i<=p)},ikon('yildiz'))));
}
