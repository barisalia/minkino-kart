import { dugme, kaynak } from './gorsel';
import { jest, zaman } from './hareket';
import { ayir, boy, fark, ornekKesim, parcalariKur, salataKesimi, serbestKes, yarimKesimRehberi,topla, uzaklik, type Kesim, type Nokta } from './kesim-geometri';
import { parcaCiz, svgOge } from './kesim-resmi';
import type { MalzemeId } from './tarif';
import './kesim-salata.css';

export function kesimTahtasi(id: MalzemeId, ad: string, adet: number, kesitler: Kesim[] | undefined, kesildi: (k: Kesim) => void, salata=false, hedef=4) {
  const b = dugme(ad+' doğra', 'kesim-alani');
  if(salata)b.classList.add('salata-kesimi');
  b.dataset.kes=id;
  const yukseklik=boy(id);
  const govde=svgOge('svg',{class:'kesim-govde',viewBox:`-80 -80 800 ${yukseklik+160}`,'aria-hidden':'true'});
  govde.style.width='min(89cqw, '+(98*800/(yukseklik+160))+'cqh)';
  const parcalar=parcalariKur(id,adet,kesitler);
  const cizimler=svgOge('g');
  cizimler.append(...parcalar.map(p=>parcaCiz(id,p)));
  const hedefKesim=(tercih?:number)=>salata?salataKesimi(parcalar,id,hedef+1,tercih):ornekKesim(parcalar,id,tercih);
  let ornek=hedefKesim();
  const ofset=parcalar[ornek.parca].konum;
  const bas=topla(ornek.a,ofset), son=topla(ornek.b,ofset);
  const rehber=svgOge('g',{class:'kesim-hedef'});
  if(salata){
    const arka=svgOge('path',{class:'kesim-kontrast',d:`M${bas.x} ${bas.y} L${son.x} ${son.y}`});
    rehber.append(arka);
  }
  rehber.append(svgOge('line',{x1:bas.x,y1:bas.y,x2:son.x,y2:son.y}));
  for (const n of [bas,son]) rehber.append(svgOge('circle',{cx:n.x,cy:n.y,r:7}));
  if(salata){
    const isaret=svgOge('path',{class:'kesim-akis',d:`M${bas.x-5} ${bas.y}a5 5 0 1 0 10 0a5 5 0 1 0 -10 0`});
    rehber.append(isaret);
    if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
      const d=fark(son,bas);
      isaret.animate([{transform:'translate(0,0)',opacity:0},{offset:.12,opacity:1},
        {offset:.76,transform:`translate(${d.x}px,${d.y}px)`,opacity:1},
        {transform:`translate(${d.x}px,${d.y}px)`,opacity:0}],{duration:1850,iterations:Infinity,easing:'ease-in-out'});
    }
  }
  const iz=svgOge('path',{class:'kesim-iz'});
  const eksik=svgOge('g',{class:'kesim-devam','aria-hidden':'true'});
  const bicak=svgOge('image',{class:'kesim-bicak',href:kaynak('nesneler','dograma-bicagi'),
    x:salata?-23:-5,y:salata?-87:-78,width:135,height:89});
  govde.append(cizimler,rehber,eksik,iz,bicak);
  b.append(govde);
  let yol: Nokta[]=[];
  let tamam=false;
  let acikIz:Animation|undefined;
  let oncekiYol:Nokta[]=[];
  let ters: DOMMatrix | undefined;
  const yerel=(p: Nokta) => new DOMPoint(p.x,p.y).matrixTransform(ters);

  function bitir(k: Kesim) {
    if (tamam || !b.isConnected) return;
    tamam=true;
    b.classList.add('kesiyor');
    const onceki=parcalar[k.parca];
    const yeniler=ayir(parcalar,k);
    cizimler.replaceChildren();
    yeniler.forEach((p,i) => {
      const g=parcaCiz(id,p);
      cizimler.append(g);
      const eski = i===k.parca || i===k.parca+1 ? onceki : parcalar[i<k.parca?i:i-1];
      const d=fark(p.konum,eski.konum);
      const kay=(x:number,y:number) => `translate(${x}px,${y}px)`;
      g.animate([
        {transform:kay(eski.konum.x,eski.konum.y)},
        {transform:kay(p.konum.x+d.x*.16,p.konum.y+d.y*.16),offset:.70},
        {transform:kay(p.konum.x,p.konum.y)},
      ],{duration:zaman(320),easing:'cubic-bezier(.18,.72,.3,1)'});
    });
    iz.animate([{opacity:.86},{opacity:0}],{duration:zaman(170),fill:'forwards'});
    kesildi(k);
  }

  function izBirak(p: Nokta) {
    if(tamam || !ters) return;
    const n=yerel(p);
    if(yol.length && uzaklik(yol[yol.length-1],n)<2) return;
    if(yol.length>=160) yol=yol.filter((_,i)=>i%2===0);
    yol.push(n);
    const ilk=yol[0];
    const egim=Math.min(14,Math.max(-14,(n.x-ilk.x)*.09));
    bicak.setAttribute('transform',`translate(${n.x} ${n.y}) rotate(${egim})`);
    const k=serbestKes(parcalar,yol);
    const cizim=yol.slice(-24);
    iz.setAttribute('d',cizim.map((v,i)=>(i?'L':'M')+v.x.toFixed(1)+' '+v.y.toFixed(1)).join(' '));
    if(k) bitir(k);
  }
  function bitenIz() {
    yol=[];
    ters=undefined;
    b.classList.remove('kesim-dokunus');
    if(!tamam) iz.removeAttribute('d');
  }
  function ipucunuKapat(){
    acikIz?.cancel();acikIz=undefined;oncekiYol=[];eksik.replaceChildren();delete b.dataset.yarim;
  }
  function eksikKenar(){
    const hat=yarimKesimRehberi(parcalar,yol);if(!hat)return;
    const {a,b:son}=hat;
    if(uzaklik(a,yol[yol.length-1])<1)oncekiYol=[...yol];
    const d='M'+a.x+' '+a.y+'L'+son.x+' '+son.y;
    eksik.replaceChildren(svgOge('path',{class:'kesim-devam-alt',d}),svgOge('path',{class:'kesim-devam-ust',d}),
      svgOge('circle',{cx:son.x,cy:son.y,r:7}));
    b.dataset.yarim='true';
    const anim=eksik.animate([{opacity:1},{opacity:1,offset:.85},{opacity:0}],{duration:3000});
    acikIz=anim;
    anim.onfinish=()=>{if(acikIz===anim)ipucunuKapat();};
  }
  function parcayiSec(p:Nokta){
    if(parcalar.length<2||!ters)return;
    const n=yerel(p);
    const index=parcalar.findIndex(parca=>{
      const q=fark(n,parca.konum),kenar=parca.kontur;
      let icinde=false;
      for(let i=0,j=kenar.length-1;i<kenar.length;j=i++){
        const a=kenar[i],b=kenar[j];
        if((a.y>q.y)!==(b.y>q.y)&&q.x<(b.x-a.x)*(q.y-a.y)/(b.y-a.y)+a.x)icinde=!icinde;
      }
      return icinde;
    });
    if(index<0)return;
    const secim=hedefKesim(index);
    if(secim.parca!==index)return;
    ornek=secim;
    const a=topla(secim.a,parcalar[index].konum),son=topla(secim.b,parcalar[index].konum);
    const hat=rehber.querySelector('line')!;
    for(const [k,v] of Object.entries({x1:a.x,y1:a.y,x2:son.x,y2:son.y}))hat.setAttribute(k,String(v));
    rehber.querySelector('.kesim-kontrast')?.setAttribute('d',`M${a.x} ${a.y}L${son.x} ${son.y}`);
    rehber.querySelectorAll('circle').forEach((c,i)=>{const n=i?son:a;c.setAttribute('cx',String(n.x));c.setAttribute('cy',String(n.y));});
    rehber.querySelector('.kesim-akis')?.remove();
    b.dataset.secilenParca=String(index);
  }
  jest(b,{
    basla:p=>{
      if(tamam) return;
      ters=govde.getScreenCTM()?.inverse();
      if(!ters) return;
      const durak=oncekiYol.at(-1);
      const devam=durak&&uzaklik(durak,yerel(p))<34?oncekiYol:[];
      ipucunuKapat();
      b.classList.add('kesim-dokunus');
      yol=devam;
      izBirak(p);
    },
    tasi:izBirak,
    birak:(p,_ilk,tik)=>{izBirak(p);if(!tamam){if(tik)parcayiSec(p);else eksikKenar();}bitenIz();},
    iptal:bitenIz,
    klavye:()=>bitir(ornek),
  });
  return b;
}
