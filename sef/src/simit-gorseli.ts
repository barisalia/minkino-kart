import {h} from '../../src/ui/dom';
import {kaplamaAdi,simitRengi,type Kaplama,type SimitRengi,type SimitTaslak} from './simit-tarifi';
const resimler=import.meta.glob<string>('../../assets/sef/simit/*.webp',{eager:true,import:'default',query:'?url'});
export const simitResmi=(id:string)=>h('img',{src:resimler['../../assets/sef/simit/'+id+'.webp'],alt:'',draggable:false});
export function kaplamaResmi(k:Kaplama){return simitResmi(k==='sade'||k==='karisik'?k:k+'lik');}
export function simitSunumu(kaplama:Kaplama,renk:SimitRengi='altin',ilkYari?:'susam'|'hashas'){
  const resim=simitResmi(kaplama);resim.className='simit-halkasi';resim.dataset.kaplama=kaplama;resim.dataset.renk=renk;
  if(kaplama==='karisik'&&ilkYari==='hashas')resim.dataset.ters='true';
  resim.alt=kaplama==='sade'?'Sade simit':kaplama==='karisik'?'Bir yarısı susamlı, bir yarısı haşhaşlı simit':kaplamaAdi[kaplama]+' kaplı simit';return resim;
}
export const sicakSimit=(t:SimitTaslak)=>simitSunumu(t.kaplama??'susam',simitRengi(t.isi),t.ilkYari);
type Nokta={x:number;y:number};
export const simitBirlesimi={x:50,y:24};
const kenar=(yon:-1|1,t:number)=>({x:50+yon*38*(1-t),y:54-30*t});
export function hamurUcu(yon:-1|1,t:SimitTaslak){return kenar(yon,yon===-1?t.sol:t.sag);}
const hamur=simitResmi('hamur');
/** The child's drag bends the original illustrated dough along a continuous
 * centreline. Both sides meet at one physical point before the coating station. */
export function hamuruGoster(t:SimitTaslak,canvas:HTMLCanvasElement){
  const c=canvas.getContext('2d');if(!c)return;
  if(!hamur.complete||!hamur.naturalWidth){hamur.addEventListener('load',()=>hamuruGoster(t,canvas),{once:true});return;}
  const w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);
  if(t.evre==='uzat'){
    const en=w*(.30+.46*t.uzunluk),boy=h*(.21-.07*t.uzunluk);
    c.drawImage(hamur,(w-en)/2,h*.54-boy/2,en,boy);return;
  }
  const n=110,kalin=h*.135;
  const temel=54+(t.sol+t.sag)*9.5;
  const nokta=(u:number):Nokta=>{
    const yon=u<.5?-1:1,mesafe=Math.abs(u*2-1),iler=yon===-1?t.sol:t.sag;
    // Half of a circle per side, from the shared lower centre to the joining point.
    const a=mesafe*Math.PI;
    const k={x:50+yon*Math.sin(a)*25,y:73-(1-Math.cos(a))*24.5};
    const duz={x:50+yon*38*mesafe,y:temel+(54-temel)*mesafe};
    const yuvarlak=temel+(k.y-73)+(73-temel)*mesafe;
    return {x:(duz.x+(k.x-duz.x)*iler)*w/100,y:(duz.y+(yuvarlak-duz.y)*iler)*h/100};
  };
  // Ink the outline as one continuous vector path to avoid open strip seams.
  c.lineCap='round';c.lineJoin='round';
  for(const [renk,en] of [['#2a201a',kalin+3.5],['#ffe9bc',kalin]] as const){
    c.beginPath();const bas=nokta(0);c.moveTo(bas.x,bas.y);
    for(let i=1;i<=n;i++){const p=nokta(i/n);c.lineTo(p.x,p.y);}
    c.lineWidth=en;c.strokeStyle=renk;c.stroke();
  }
}
