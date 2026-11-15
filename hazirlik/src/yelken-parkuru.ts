import type {KresKaydi} from './kres-kaydi';
import {efekt,sesiAc} from '../../src/audio/ses';
import {simge} from './cizim';
import {kayikCizimi} from './kayik-goleti';
import './yelken-parkuru.css';

export const damgalar=['gunes','balik','yildiz'];
const adlar=['Güneş','Balık','Yıldız'];
const rotalar=[[0,1,2],[1,2,0],[2,0,1],[0,2,1],[1,0,2],[2,1,0]];
const dubalar=[[26,42],[55,71],[79,37]];
export const parkurSozu=(adim:number)=>adim===4?'kres_yelken_liman':adim===3?'kres_yelken_bayrak':'kres_yelken_parkur';
export function parkurAc(alan:HTMLElement,k:KresKaydi,res:(id:string)=>string,kaydet:()=>void,soyle:(id:string)=>void,don:()=>void){
  const p=k.parkur;
  const deniz=document.createElement('section');deniz.className='yelken-parkuru';deniz.setAttribute('aria-label','Şamandıralı yelken parkuru');alan.append(deniz);
  const resim=(ad:string)=>res('kres/'+ad);
  const damga=(n:number)=>resim('damga-'+damgalar[n]);
  const az=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dugme=(id:string,ad:string,ic:string,x:number,y:number)=>{
    const b=document.createElement('button');b.type='button';b.dataset.parkur=id;b.setAttribute('aria-label',ad);b.innerHTML=ic;b.style.left=x+'%';b.style.top=y+'%';deniz.append(b);return b;
  };
  const tablo=dugme('sira','Sıradaki işareti dinle','',52,15);
  const dubalarim=dubalar.map(([x,y],i)=>dugme('duba-'+i,adlar[i]+' şamandırası',resim('samandira')+'<i>'+damga(i)+'</i>',x,y));
  const bayrak=dugme('liman','Damalı bayrağa git',resim('regatta-bayrak'),86,75);
  const kayik=dugme('kayik','Kayığı suyun üzerinde sürükle',resim(kayikCizimi(k.gemiRengi))+(k.damga===null?'':'<i>'+damga(k.damga)+'</i>'),p.x,p.y);
  const yeniden=dugme('yeniden','Yeni şamandıra sırası',simge('yenile'),70,88);
  const bitir=dugme('bitir','Kayık masasına dön',simge('tamam'),88,88);
  let hedef:{x:number;y:number}|undefined,kare=0,zaman=0,parmak:number|undefined,sonTemas=-1;
  const siradaki=()=>rotalar[p.rota][p.adim];
  function durum(){
    const sira=rotalar[p.rota];tablo.innerHTML=sira.map((n,i)=>'<i class="'+(i<p.adim?'gecildi':i===p.adim?'simdi':'sonra')+'">'+damga(n)+'</i>').join('');
    tablo.setAttribute('aria-label',p.adim<3?'Sıradaki şamandıra, '+adlar[siradaki()]:p.adim===3?'Damalı bayrağa git':'Parkur tamamlandı');
    dubalarim.forEach((b,i)=>{b.classList.toggle('gecildi',sira.slice(0,p.adim).includes(i))});
    bayrak.classList.toggle('hazir',p.adim===3);yeniden.hidden=bitir.hidden=p.adim!==4;
  }
  function kontrol(){
    const yakin=(x:number,y:number)=>Math.hypot((x-p.x)*deniz.clientWidth,(y-p.y)*deniz.clientHeight)<Math.min(deniz.clientWidth,deniz.clientHeight)*7;
    const i=dubalar.findIndex(([x,y])=>yakin(x,y));
    if(p.adim<3&&i>=0&&i!==sonTemas){
      if(i===siradaki()){
        p.adim++;efekt.sinifCalgisi(3);kaydet();durum();if(p.adim===3)soyle(parkurSozu(3));
      }else if(!rotalar[p.rota].slice(0,p.adim).includes(i)){soyle('kres_yelken_isaret')}
    }
    sonTemas=i;
    if(p.adim===3&&yakin(86,75)){p.adim=4;hedef=undefined;efekt.yildiz(2);kaydet();durum();soyle(parkurSozu(4))}
  }
  function konum(){kayik.style.left=p.x+'%';kayik.style.top=p.y+'%'}
  function ilerle(t:number){
    kare=0;if(!hedef||!deniz.isConnected||document.hidden)return;
    const dx=hedef.x-p.x,dy=hedef.y-p.y,d=Math.hypot(dx,dy*deniz.clientHeight/deniz.clientWidth);
    const oran=az()||d<.1?1:Math.min(1,(t-zaman)*(parmak===undefined?.055:.14)/d);
    zaman=t;p.x+=dx*oran;p.y+=dy*oran;konum();kontrol();
    if(oran===1||!hedef){hedef=undefined;kaydet()}else kare=requestAnimationFrame(ilerle);
  }
  function git(x:number,y:number){
    if(p.adim===4)return;sesiAc();hedef={x:Math.min(92,Math.max(8,x)),y:Math.min(85,Math.max(22,y))};
    if(!kare){zaman=performance.now();kare=requestAnimationFrame(ilerle)}
  }
  let farkX=0,farkY=0;
  function el(e:PointerEvent){const r=deniz.getBoundingClientRect();git(100*(e.clientX-r.left)/r.width-(parmak===e.pointerId?farkX:0),100*(e.clientY-r.top)/r.height-(parmak===e.pointerId?farkY:0))}
  dubalarim.forEach((b,i)=>b.onclick=()=>git(dubalar[i][0],dubalar[i][1]));bayrak.onclick=()=>{if(p.adim<3)soyle('kres_yelken_parkur');git(86,75)};
  tablo.onclick=()=>{soyle(parkurSozu(p.adim));if(!az()&&p.adim<3)dubalarim[siradaki()].animate([{scale:1},{scale:1.1},{scale:1}],{duration:620})};
  kayik.onpointerdown=e=>{if(e.isPrimary&&e.button===0){const r=deniz.getBoundingClientRect();farkX=100*(e.clientX-r.left)/r.width-p.x;farkY=100*(e.clientY-r.top)/r.height-p.y;parmak=e.pointerId;kayik.setPointerCapture(parmak)}};
  kayik.onpointermove=e=>{if(e.pointerId===parmak)el(e)};
  kayik.onpointerup=e=>{if(e.pointerId===parmak){el(e);parmak=undefined}};
  kayik.onpointercancel=()=>{dur()};
  deniz.onpointerup=e=>{if(e.target===deniz)el(e)};
  yeniden.onclick=()=>{p.rota=(p.rota+1)%rotalar.length;p.adim=0;p.x=15;p.y=73;sonTemas=-1;konum();durum();kaydet();soyle(parkurSozu(0))};
  bitir.onclick=don;
  function dur(){cancelAnimationFrame(kare);kare=0;hedef=undefined;parmak=undefined;kaydet()}
  window.addEventListener('hazirlik-mola',dur);window.addEventListener('pagehide',dur);durum();
  return ()=>{dur();window.removeEventListener('hazirlik-mola',dur);window.removeEventListener('pagehide',dur)};
}
