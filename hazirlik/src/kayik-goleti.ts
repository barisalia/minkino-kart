import {efekt,sesiAc} from '../../src/audio/ses';
import {simge} from './cizim';
import type {KresKaydi} from './kres-kaydi';
import {ilkGolet,goletSozu} from './golet-kaydi';
import './kayik-goleti.css';

export const kayikCizimi=(renk:number)=>['oda-kayik','oda-kayik-mavi','oda-kayik-sari'][renk]??'oda-kayik';
const yerler=[[[72,70],[43,34],[81,43]],[[70,35],[34,56],[72,72]]];
const yuva:[number,number]=[17,25];
export function kayikGoleti(alan:HTMLElement,k:KresKaydi,res:(n:string)=>string,kaydet:()=>void,soyle:(id:string)=>void,don:()=>void){
  const g=k.golet,az=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const su=document.createElement('section');su.className='kayik-goleti';su.setAttribute('aria-label','Kâğıt kayığın ve üç oyuncak ördek');alan.append(su);
  const dugme=(id:string,ad:string,art:string)=>{
    const b=document.createElement('button');b.type='button';b.dataset.golet=id;b.setAttribute('aria-label',ad);b.innerHTML=art;su.append(b);return b;
  };
  function yer(el:HTMLElement,x:number,y:number){el.style.left=x+'%';el.style.top=y+'%'}
  const anne=dugme('yuva','Anne ördeğin yanına git',res('kres/oyuncak-ordek-anne'));yer(anne,...yuva);
  const yavrular=[0,1,2].map(i=>dugme('yavru-'+i,(i+1)+'. yavru ördeği bul',res('kres/oyuncak-ordek-yavru')));
  const kayik=dugme('kayik','Kendi kâğıt kayığını yüzdür',res('kres/'+(g.ahsap?'oyuncak-yelken':kayikCizimi(k.gemiRengi))));
  const ruzgar=dugme('ruzgar','Kayığı rüzgârla en yakın yavruya yüzdür',res('kres/golet-ruzgar'));yer(ruzgar,85,18);
  const yeniden=dugme('tekrar','Ördeklerle yeniden oyna',simge('yenile'));
  const cik=dugme('bitir','Su masasına dön',simge('tamam'));
  const ada=document.createElement('div');ada.className='golet-iskele';ada.innerHTML=res('kres/golet-ada')+res('kres/golet-fener');su.prepend(ada);
  const kopru=dugme('kopru','Mavi uçtan köprüyü aç',res('kres/golet-kopru'));
  let ruzgarla=false;
  let bekleyen:{x:number;y:number}|undefined;
  function kopruAc(){
    if(g.kopruAcik)return;
    g.kopruAcik=true;efekt.yapis();kaydet();goster();
    if(bekleyen){const p=bekleyen;bekleyen=undefined;git(p.x,p.y)}
  }
  kopru.onclick=kopruAc;
  kopru.onpointerdown=e=>{if(e.button===0)kopru.setPointerCapture(e.pointerId)};
  kopru.onpointermove=e=>{if(kopru.hasPointerCapture(e.pointerId)&&e.clientY<kopru.getBoundingClientRect().top)kopruAc()};
  let hedef:{x:number;y:number}|undefined,kare=0,son=0,parmak:number|undefined;
  let iz=[{x:g.x,y:g.y}],sonHalka=0,sonAdim=0,yon=1;
  const agirlik=()=>su.clientHeight/su.clientWidth;
  const mesafe=(x:number,y:number,a:number,b:number)=>Math.hypot(x-a,(y-b)*agirlik());
  const sabit=(i:number)=>yerler[g.tur][i];
  function izEkle(){
    const ilk=iz[0],d=mesafe(ilk.x,ilk.y,g.x,g.y);
    if(d<1.1)return;
    iz.unshift({x:g.x,y:g.y});if(iz.length>90)iz.pop();
  }
  function pesinden(i:number){
    // Yavrular kayığın aldığı yolu aynı aralıkla izler. Mesafe ekran oranından bağımsızdır.
    const dik=su.clientHeight>su.clientWidth;
    let kalan=dik?26+16*i:16+9*i;
    for(let j=1;j<iz.length;j++){
      const a=iz[j-1],b=iz[j],d=mesafe(a.x,a.y,b.x,b.y);
      if(d>=kalan){const t=kalan/d;return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}}
      kalan-=d;
    }
    const son=iz.at(-1)!;return {x:Math.max(9,Math.min(91,son.x-kalan*yon)),y:Math.min(88,son.y+(i+1)*1.5)};
  }
  function goster(){
    const liman=g.tur===1;
    ruzgar.hidden=!g.ahsap||g.yuvada;
    ada.hidden=!liman;kopru.hidden=!liman;kopru.disabled=g.kopruAcik;
    kopru.classList.toggle('acildi',g.kopruAcik);
    yer(kayik,g.x,g.y);
    for(const [i,el] of yavrular.entries()){
      const sira=g.arkadaslar.indexOf(i);
      const dik=su.clientHeight>su.clientWidth;
      const p=g.yuvada?{x:22+i*(dik?15:10),y:39+(i%2)*4}:sira<0?{x:sabit(i)[0],y:sabit(i)[1]}:pesinden(sira);
      yer(el,p.x,p.y);el.classList.toggle('takipte',sira>=0);el.disabled=sira>=0;
      if(sira>=0)el.style.setProperty('--yon',String(g.yuvada?-1:yon));else el.style.removeProperty('--yon');
    }
    yeniden.hidden=cik.hidden=!g.yuvada;
  }
  function halka(x:number,y:number){
    if(az())return;
    const e=document.createElement('i');e.className='golet-halka';e.setAttribute('aria-hidden','true');yer(e,x,y);su.append(e);
    e.addEventListener('animationend',()=>e.remove(),{once:true});
  }
  function temas(){
    for(let i=0;i<3;i++){
      if(g.arkadaslar.includes(i))continue;
      const [x,y]=sabit(i);
      if(mesafe(g.x,g.y,x,y)>8)continue;
      g.arkadaslar.push(i);efekt.nota(2+g.arkadaslar.length*2);halka(x,y);kaydet();
      if(g.arkadaslar.length===3)soyle('kres_golet_yuva');
    }
    if(g.arkadaslar.length===3&&(g.tur===0||g.kopruAcik)&&mesafe(g.x,g.y,yuva[0],yuva[1])<8&&!g.yuvada){
      g.yuvada=true;g.x=41;g.y=22;hedef=undefined;efekt.yildiz(2);kaydet();soyle('kres_golet_bitti');
    }
  }
  function zaman(an:number){
    kare=0;if(!hedef||!su.isConnected||document.hidden)return;
    const dt=Math.min(60,an-son),d=mesafe(hedef.x,hedef.y,g.x,g.y),dx=hedef.x-g.x;
    son=an;if(Math.abs(dx)>1)yon=dx>0?1:-1;
    const t=az()||d<.1?1:Math.min(1,dt*(ruzgarla?.082:parmak===undefined?.057:.15)/d);
    g.x+=dx*t;g.y+=(hedef.y-g.y)*t;izEkle();temas();goster();
    if(!az()&&an-sonHalka>490&&d>2){halka(g.x-yon*3,g.y+1);sonHalka=an}
    if(t===1||!hedef){ruzgarla=false;hedef=undefined;kaydet();return}
    if(an-sonAdim>600){sonAdim=an;kaydet()}
    kare=requestAnimationFrame(zaman);
  }
  function git(x:number,y:number){if(g.yuvada)return;
    if(g.tur===1&&!g.kopruAcik&&x<29&&y<36){
      const ilk=!bekleyen;bekleyen={x,y};x=34;y=39;if(ilk)soyle('kres_golet_kopru');
      if(ilk&&!az())kopru.animate([{scale:1},{scale:1.09},{scale:1}],{duration:480});
    }else bekleyen=undefined;
    hedef={x:Math.min(91,Math.max(9,x)),y:Math.min(88,Math.max(12,y))};if(!kare){son=performance.now();kare=requestAnimationFrame(zaman)}}
  function koordinat(e:PointerEvent){const r=su.getBoundingClientRect();return [(e.clientX-r.left)*100/r.width,(e.clientY-r.top)*100/r.height] as const}
  const a=new AbortController(),ayar={signal:a.signal};
  let farkX=0,farkY=0;
  function surukle(e:PointerEvent){const [x,y]=koordinat(e);git(x-farkX,y-farkY)}
  kayik.addEventListener('pointerdown',e=>{if(e.button!==0||parmak!==undefined||g.yuvada)return;sesiAc();const [x,y]=koordinat(e);farkX=x-g.x;farkY=y-g.y;parmak=e.pointerId;kayik.setPointerCapture(e.pointerId)},ayar);
  kayik.addEventListener('pointermove',e=>{if(parmak===e.pointerId)surukle(e)},ayar);
  kayik.addEventListener('pointerup',e=>{if(e.pointerId===parmak){surukle(e);parmak=undefined}},ayar);
  kayik.addEventListener('pointercancel',dur,ayar);
  su.addEventListener('pointerup',e=>{if(e.target===su&&e.isPrimary&&e.button===0){sesiAc();git(...koordinat(e))}},ayar);
  ruzgar.onclick=()=>{
    sesiAc();ruzgarla=true;
    const uzak=yavrular.map((_,i)=>i).filter(i=>!g.arkadaslar.includes(i)).sort((a,b)=>{
      const p=sabit(a),q=sabit(b);return mesafe(g.x,g.y,p[0],p[1])-mesafe(g.x,g.y,q[0],q[1]);
    });
    const [x,y]=uzak.length?sabit(uzak[0]):yuva;efekt.dalga();git(x,y);
    if(!az())ruzgar.animate([{rotate:'-8deg'},{rotate:'8deg'},{rotate:'0deg'}],{duration:390});
  };
  for(const [i,el] of yavrular.entries())el.onclick=()=>{sesiAc();const [x,y]=sabit(i);git(x,y)};
  anne.onclick=()=>{sesiAc();if(!g.yuvada&&g.arkadaslar.length<3)soyle('kres_golet_yavru');git(yuva[0],yuva[1])};
  kayik.onclick=e=>{if(!e.detail)soyle(goletSozu(g))};
  yeniden.onclick=()=>{const tur=1-g.tur;Object.assign(g,ilkGolet(),{tur,ahsap:g.ahsap});bekleyen=undefined;iz=[{x:g.x,y:g.y}];kaydet();goster();soyle(goletSozu(g))};
  cik.onclick=don;
  function dur(){bekleyen=undefined;cancelAnimationFrame(kare);kare=0;hedef=undefined;parmak=undefined;ruzgarla=false;kaydet();su.querySelectorAll('.golet-halka').forEach(x=>x.remove())}
  window.addEventListener('hazirlik-mola',dur,ayar);window.addEventListener('pagehide',dur,ayar);
  goster();return ()=>{dur();a.abort()};
}
