import {restoranKarakterleri as musteriler,misafirAdi,type SiparisMisafiri as Misafir} from './restoran-karakterleri';
import {h} from '../../src/ui/dom';
import {ikon,dugme} from './gorsel';
import {jest,type Nokta} from './hareket';
import {misafirResmi} from './misafir';
import {restoranOyuncusu} from './restoran-oyuncusu';
import {efekt} from '../../src/audio/efekt';
import './arabali-servis.css';

const yemekArabasi=new URL('../../assets/sef/arabali-servis/araba.webp',import.meta.url).href;
const tasimaTepsisi=new URL('../../assets/sef/arabali-servis/tepsi.webp',import.meta.url).href;
const durakMasasi=new URL('../../assets/sef/arabali-servis/durak-masasi.webp',import.meta.url).href;
const durakKoltugu=new URL('../../assets/sef/arabali-servis/durak-koltugu.webp',import.meta.url).href;
export const arabaIsareti=()=>h('img',{src:yemekArabasi,alt:'',draggable:false});
export interface ArabaYolu{x:number;yuklu:boolean}
export function arabaliServis(hedef:Misafir,sira:number,porsiyonlar:HTMLElement[],yol:ArabaYolu,kaydet:()=>void,geri:()=>void,teslim:(alan:Misafir)=>void,sesli:()=>boolean){
  const sahne=h('section.arabali-servis',{'aria-label':'Servis arabasıyla masaya götür'});
  const arkadas:Misafir=hedef==='salata'?'corba':'salata';
  const duraklar=sira%2?[arkadas,hedef]:[hedef,arkadas];
  const konum=sira%2?[21,81]:[51,81];
  const bosMasa=h('div.araba-masasi',{'aria-label':'Boş masa'},
    h('img.durak-koltugu',{src:durakKoltugu,alt:'',draggable:false}),
    h('img.durak-masasi',{src:durakMasasi,alt:'',draggable:false}));
  bosMasa.style.left=(sira%2?51:21)+'%';sahne.append(bosMasa);
  const don=dugme('Geri dön','araba-geri',ikon('geri'));don.onclick=()=>{if(!bitiyor)geri();};
  const fis=h('span.araba-fis',{role:'img','aria-label':misafirAdi(hedef)+' siparişi'},misafirResmi(hedef,'istek'));
  const masaTuslari:HTMLButtonElement[]=[];
  const araba=dugme('Servis arabasını sürükle','yemek-arabasi',arabaIsareti());
  const porsiyon=h('span.araba-porsiyonlar',{},...porsiyonlar.map(el=>h('span.araba-tabak',{},el)));
  const yuk=h('span.araba-yuku',{},h('img',{src:tasimaTepsisi,alt:'',draggable:false}),porsiyon);
  const tepsi=dugme('Tepsiyi arabaya koy','araba-tepsisi',yuk);
  const ver=dugme('Tepsiyi masaya bırak','araba-ver',ikon('servis'),ikon('ileri'));
  ver.hidden=true;
  sahne.append(don,fis);
  let durak=-1,bitiyor=false,basX=0;
  function yereKoy(x:number){
    yol.x=Math.max(13,Math.min(86,x));araba.style.left=yol.x+'%';
    durak=yol.yuklu?konum.findIndex(x=>Math.abs(yol.x-x)<8):-1;
    ver.hidden=durak<0;
    if(durak>=0)ver.style.left=konum[durak]+'%';
    for(const [i,b] of masaTuslari.entries()){
      const yakin=yol.yuklu&&Math.abs(yol.x-konum[i])<8;
      if(b.dataset.yakin===String(yakin))continue;
      b.dataset.yakin=String(yakin);
      b.querySelector('.restoran-oyuncusu')?.dispatchEvent(new CustomEvent('restoran-yuz',{detail:yakin&&duraklar[i]===hedef?'mutlu':'kapali'}));
    }
  }
  function yukle(animasyon=true,baslangic?:DOMRect){
    if(yol.yuklu)return;
    const once=baslangic??yuk.getBoundingClientRect();
    yol.yuklu=true;araba.append(yuk);tepsi.remove();araba.disabled=false;sahne.dataset.yuklu='true';
    const sonra=yuk.getBoundingClientRect();
    if(animasyon&&!matchMedia('(prefers-reduced-motion:reduce)').matches&&sonra.width>0){
      const dx=once.left-sonra.left,dy=once.top-sonra.top;
      yuk.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+once.width/sonra.width+','+once.height/sonra.height+')'},{transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.7,.3,1)'});
    }
    if(sesli())efekt.yapis();yereKoy(yol.x);kaydet();araba.focus({preventScroll:true});
  }
  for(const [i,kim] of duraklar.entries()){
    const konuk=restoranOyuncusu(musteriler[kim],'otur');
    konuk.setAttribute('aria-hidden','true');
    const b=dugme(misafirAdi(kim)+' masasına götür','araba-masasi',
      h('img.durak-koltugu',{src:durakKoltugu,alt:'',draggable:false}),
      konuk,h('img.durak-masasi',{src:durakMasasi,alt:'',draggable:false}));
    b.style.left=konum[i]+'%';b.dataset.masa=kim;b.dataset.hedef=String(kim===hedef);
    b.onclick=()=>masayaVer(i);
    sahne.append(b);masaTuslari.push(b);
  }
  sahne.append(araba,tepsi,ver);
  function arabayaYakin(p:Nokta){
    const r=araba.getBoundingClientRect();return p.x>=r.left-8&&p.x<=r.right+8&&p.y>=r.top-10&&p.y<=r.bottom+10;
  }
  let isaretli:HTMLButtonElement|undefined;
  function masayiIsaretle(i:number){
    const yeni=masaTuslari[i];
    if(yeni===isaretli)return;
    isaretli?.removeAttribute('data-tepsi-hedefi');
    if(yeni)yeni.dataset.tepsiHedefi='';
    isaretli=yeni;
  }
  jest(tepsi,{
    tasi:(n,ilk)=>{tepsi.style.translate=(n.x-ilk.x)+'px '+(n.y-ilk.y)+'px';masayiIsaretle(dokunulanMasa(n));},
    birak:(n,_ilk,tik)=>{
      const baslangic=yuk.getBoundingClientRect();
      tepsi.style.translate='';
      masayiIsaretle(-1);
      const i=dokunulanMasa(n);
      if(!tik&&i>=0)masayaVer(i,baslangic);
      else if(tik||arabayaYakin(n))yukle(true,baslangic);
    },
    iptal:()=>{tepsi.style.translate='';masayiIsaretle(-1);},klavye:yukle
  });
  jest(araba,{basla:()=>{basX=yol.x;araba.dataset.suruluyor='true';},tasi:(p,ilk)=>{yereKoy(basX+100*(p.x-ilk.x)/sahne.getBoundingClientRect().width);masayiIsaretle(dokunulanMasa(p));},
    birak:(p,_ilk,tik)=>{delete araba.dataset.suruluyor;masayiIsaretle(-1);const i=dokunulanMasa(p);if(!tik&&i>=0){masayaVer(i);return;}kaydet();if(tik&&durak>=0)void birak(masaTuslari[durak]);},
    iptal:()=>{delete araba.dataset.suruluyor;masayiIsaretle(-1);yereKoy(basX);},klavye:()=>{if(durak>=0)void birak(masaTuslari[durak]);}});
  araba.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();yereKoy(yol.x+(e.key==='ArrowLeft'?-4:4));kaydet();});
  const hedefMasa=masaTuslari[duraklar.indexOf(hedef)];
  let tasinan:HTMLElement|undefined;
  const tepsiyiKaldir=()=>h('span.araba-elle-tepsi',{},yuk);
  function kaldir(){
    if(tasinan)araba.append(yuk);
    tasinan?.remove();tasinan=undefined;araba.classList.remove('tepsi-kalkti');
  }
  function dokunulanMasa(p:Nokta){
    return masaTuslari.findIndex(b=>{
      const r=b.getBoundingClientRect();
      const masa=b.querySelector('.durak-masasi')!.getBoundingClientRect();
      return p.x>=r.left&&p.x<=r.right&&p.y>=r.top&&p.y<=masa.bottom;
    });
  }
  function masayaVer(i:number,baslangic=yuk.getBoundingClientRect()){
    if(bitiyor)return;
    if(!yol.yuklu)yukle(false);
    yereKoy(konum[i]);
    kaydet();
    void birak(masaTuslari[i],baslangic);
  }
  async function birak(masaTusu=masaTuslari[durak],baslangic?:DOMRect){
    if(!masaTusu||!yol.yuklu||bitiyor)return;
    bitiyor=true;ver.hidden=true;araba.disabled=true;don.disabled=true;
    // A quick table tap may arrive before the tray finishes flying to the cart.
    // Keep its current screen rectangle as the start of the delivery flight.
    const ilk=baslangic??yuk.getBoundingClientRect();
    for(const hareket of yuk.getAnimations())hareket.cancel();
    const yer=sahne.getBoundingClientRect();
    const masa=masaTusu.querySelector('.durak-masasi')!.getBoundingClientRect();
    const konuk=masaTusu.querySelector('.restoran-oyuncusu')!;
    const paket=tasinan??tepsiyiKaldir();tasinan=undefined;sahne.append(paket);
    araba.classList.add('tepsi-kalkti');
    const x=masa.left+masa.width*.50-yer.left,y=masa.top+masa.height*.25-yer.top;
    paket.style.left=x+'px';paket.style.top=y+'px';
    const son=yuk.getBoundingClientRect();
    const dx=ilk.left-son.left,dy=ilk.top-son.top;
    const sakin=matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(!sakin){
      const hareket=yuk.animate([
        {transform:'translate('+dx+'px,'+dy+'px) scale('+ilk.width/son.width+','+ilk.height/son.height+')'},
        {transform:'translate('+(dx*.36)+'px,'+(dy*.36-yer.height*.035)+'px)',offset:.6},
        {transform:'none'},
      ],{duration:440,easing:'ease-in-out'});
      await hareket.finished.catch(()=>{});
    }
    if(!sahne.isConnected)return;
    if(sesli()){if(masaTusu===hedefMasa)efekt.yapis();else efekt.kilitNazik();}
    if(masaTusu!==hedefMasa){
      const sonuc=h('span.araba-bir-puan',{role:'status','aria-label':'Yanlış masa, bir puan'},ikon('yildiz'),h('b',{},'1'));
      masaTusu.append(sonuc);
    }
    konuk.dispatchEvent(new CustomEvent('restoran-yuz',{detail:masaTusu===hedefMasa?'mutlu':'kapali'}));
    await new Promise(r=>setTimeout(r,sakin?120:490));
    if(sahne.isConnected)teslim(duraklar[masaTuslari.indexOf(masaTusu)]);
  }
  jest(ver,{
    tasi:(n,ilk)=>{
      if(Math.hypot(n.x-ilk.x,n.y-ilk.y)<5&&!tasinan)return;
      if(!tasinan){
        tasinan=tepsiyiKaldir();
        sahne.append(tasinan);araba.classList.add('tepsi-kalkti');
      }
      const r=sahne.getBoundingClientRect();tasinan.style.left=(n.x-r.left)+'px';tasinan.style.top=(n.y-r.top)+'px';
      masayiIsaretle(dokunulanMasa(n));
    },
    birak:(n,_ilk,tik)=>{
      const i=dokunulanMasa(n);
      masayiIsaretle(-1);
      if(tik)void birak();else if(i>=0)void birak(masaTuslari[i]);
      else kaldir();
    },iptal:()=>{masayiIsaretle(-1);kaldir();},klavye:birak
  });
  if(yol.yuklu){araba.append(yuk);tepsi.remove();sahne.dataset.yuklu='true';}
  else araba.disabled=true;
  yereKoy(yol.x);
  return sahne;
}
