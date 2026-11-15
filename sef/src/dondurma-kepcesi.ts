import {h} from '../../src/ui/dom';
import {kepceDolum} from '../../kino-otobus/src/el-isi';
import {dugme} from './gorsel';
import {jest,icinde,merkez,zaman,type Nokta} from './hareket';
import {type DondurmaTadi} from './tatli-ekonomi';
import './dondurma-kepcesi.css';

const dosyalar=import.meta.glob<string>('../../assets/sef/dondurma-tezgahi/*.webp',{eager:true,query:'?url',import:'default'});
const cizim=(dosya:string,sinif='')=>h('img',{src:dosyalar['../../assets/sef/dondurma-tezgahi/'+dosya+'.webp'],class:sinif,alt:'',draggable:false});
export const dondurmaAdlari={cilek:'Çilekli',vanilya:'Vanilyalı',cikolata:'Çikolatalı'};
const tadlar=['cilek','vanilya','cikolata'] as const;

export function dondurmaTatSec(sec:(tat:DondurmaTadi)=>void){
  return h('div.dk-tatlar',{role:'group','aria-label':'Dondurma kapları'},...tadlar.map(tat=>{
    const b=dugme(dondurmaAdlari[tat]+' top','dk-kap-sec',cizim('kap-'+tat));
    b.dataset.tat=tat;b.onclick=()=>sec(tat);return b;
  }));
}

export interface KepceIzi {x:number;y:number;yeni?:boolean}
export function kepceIziniOku(v:unknown):KepceIzi[]{
  if(!Array.isArray(v))return [];
  return v.slice(0,90).flatMap(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1?
    [{x:p.x,y:p.y,...(p.yeni===true?{yeni:true}:{})}]:[]);
}
const izPaleti={
  cilek:['#ffacc2','#dc738e'],vanilya:['#ead8a6','#bfaa78'],cikolata:['#9b6a50','#724734'],
};
export function dondurmaKepcele(tat:DondurmaTadi,dolu:boolean,eskiOran:number,eskiIz:KepceIzi[],
  kaydet:(oran:number,iz:KepceIzi[])=>void,kepceDoldu:()=>void,kulahaKoy:()=>void,tadiDegistir:()=>void){
  const ad=dondurmaAdlari[tat];
  const alan=h('div.dk-istasyon',{'data-tat':tat});
  const kap=h('div.dk-kap',{},cizim('kap-'+tat));
  const yuzey=dugme(ad+' dondurmadan bir top çıkar','dk-yuzey');
  const iz=h('canvas.dk-siyrik',{width:484,height:110,'aria-hidden':true});
  const firca=iz.getContext('2d');
  const izler=kepceIziniOku(eskiIz);
  yuzey.append(iz);kap.append(yuzey);
  function ciz(){
    if(!firca)return;
    firca.clearRect(0,0,iz.width,iz.height);
    firca.lineJoin='round';firca.lineCap='round';
    for(let kat=0;kat<2;kat++){
      firca.beginPath();
      izler.forEach((p,i)=>{
        const x=p.x*iz.width,y=p.y*iz.height+kat*2;
        if(!i||p.yeni){firca.moveTo(x,y);firca.lineTo(x+.01,y);}
        else firca.lineTo(x,y);
      });
      firca.strokeStyle=izPaleti[tat][kat];firca.lineWidth=kat===0?15:3;firca.stroke();
    }
  }
  function izBirak(n:Nokta,yeni:boolean){
    if(izler.length>=90)return;
    const r=yuzey.getBoundingClientRect();
    const x=Math.round((n.x-r.left)/r.width*1000)/1000,y=Math.round((n.y-r.top)/r.height*1000)/1000;
    if(x<0||x>1||y<0||y>1)return;
    const son=izler.at(-1);
    if(!yeni&&son&&Math.hypot(x-son.x,(y-son.y)*.23)<.009)return;
    izler.push({x,y,...(yeni?{yeni:true}:{})});ciz();
  }
  ciz();
  const arac=h('span.dk-alet',{},cizim('kepce','dk-kepce'),cizim('top-'+tat,'dk-top'));
  const tut=dugme(ad+' topu al','dk-tut',arac);
  const kulah=dugme('Dondurma topunu külaha koy','dk-kulah',cizim('kulah'));
  const agirlik=h('i.dk-hedef',{'aria-hidden':true});kulah.append(agirlik);
  function agizda(n:Nokta){
    const r=kulah.getBoundingClientRect();
    return n.x>=r.left-.12*r.width&&n.x<=r.right+.12*r.width&&n.y>=r.top-.25*r.height&&n.y<=r.top+.33*r.height;
  }
  const degistir=dugme('Dondurma tadını değiştir','dk-degistir',...tadlar.map(t=>cizim('top-'+t)));
  degistir.onclick=tadiDegistir;
  alan.append(kap,kulah,tut,degistir);
  let oran=dolu?1:eskiOran,kilit=false,secildi=false,onceki:Nokta|undefined;
  let sonKayit=oran;
  const hazir=()=>oran>=1;
  function konum(n:Nokta){
    const r=alan.getBoundingClientRect();
    tut.style.left=(n.x-r.left)/r.width*100+'%';tut.style.top=(n.y-r.top)/r.height*100+'%';
  }
  function goster(){
    alan.dataset.dolu=String(hazir());alan.dataset.oran=String(Math.round(oran*100));
    arac.style.setProperty('--dolum',String(oran));
    tut.tabIndex=hazir()?0:-1;yuzey.tabIndex=hazir()?-1:0;
  }
  function doldur(n:number){
    if(hazir()||kilit)return;
    oran=Math.min(1,n);goster();
    if(hazir()){kaydet(oran,izler);kepceDoldu();}
    else if(oran-sonKayit>=.075){sonKayit=oran;kaydet(oran,izler);}
  }
  function koy(){
    if(kilit||!hazir()||!secildi)return;
    const kepcedeki=arac.querySelector<HTMLImageElement>('.dk-top')!;
    const bas=kepcedeki.getBoundingClientRect();
    kilit=true;alan.dataset.yerlesti='true';alan.removeAttribute('data-yakin');
    const top=cizim('top-'+tat,'dk-oturan');kulah.append(top);
    const son=top.getBoundingClientRect();
    const dx=bas.x+bas.width/2-son.x-son.width/2,dy=bas.y+bas.height/2-son.y-son.height/2;
    if(son.width>0&&bas.width>0)top.animate([
      {transform:'translate('+dx+'px,'+dy+'px) scale('+bas.width/son.width+')'},
      {transform:'translate(0,0) scale(1)'}
    ],{duration:zaman(240),easing:'ease-out'});
    alan.dispatchEvent(new Event('pastane-kepce-bosaldi',{bubbles:true}));
    window.setTimeout(()=>{if(alan.isConnected)kulahaKoy();},zaman(340));
  }
  function sifirla(){
    onceki=undefined;alan.removeAttribute('data-yakin');
    tut.style.removeProperty('left');tut.style.removeProperty('top');sonKayit=oran;kaydet(oran,izler);
  }
  function bas(n:Nokta){
    if(kilit)return;
    onceki=n;secildi=true;konum(n);
    if(!hazir()&&icinde(yuzey,n))izBirak(n,true);
  }
  function tasi(n:Nokta){
    if(!onceki||kilit)return;
    if(!hazir()&&icinde(yuzey,n)&&icinde(yuzey,onceki)){
      const yol=Math.hypot(n.x-onceki.x,n.y-onceki.y)*175/yuzey.getBoundingClientRect().width;
      izBirak(n,false);doldur(kepceDolum(oran,yol,true));
    }
    else if(!hazir()&&icinde(yuzey,n))izBirak(n,true);
    onceki=n;konum(n);
    alan.dataset.yakin=String(hazir()&&agizda(n));
  }
  function birak(n:Nokta,_ilk:Nokta,tik:boolean){
    if(kilit)return;
    if(hazir()&&agizda(n)){koy();return;}
    if(!hazir()&&tik&&icinde(yuzey,n))doldur(oran+1/3+.001);
    sifirla();
  }
  const sec=()=>{if(!kilit){secildi=true;tut.dataset.secildi='true';}};
  const klavyeKepce=()=>{
    const r=yuzey.getBoundingClientRect(),n=merkez(yuzey);
    n.x=r.left+r.width*(.16+.65*oran);
    izBirak(n,!izler.length);doldur(oran+1/7+.001);kaydet(oran,izler);
  };
  jest(yuzey,{basla:bas,tasi,birak,iptal:sifirla,klavye:klavyeKepce});
  jest(tut,{basla:bas,tasi,birak,iptal:sifirla,klavye:sec});
  kulah.onclick=e=>{if(e.detail!==0&&!agizda({x:e.clientX,y:e.clientY}))return;if(secildi)koy();else if(hazir()){sec();tut.focus();}};
  goster();return alan;
}
