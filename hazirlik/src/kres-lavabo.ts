import type {Sabah} from './model';
import type {Bolge,KosedekiIsler} from './kres-servis';
import {tamamla} from './kres-kaydi';
import {efekt} from '../../src/audio/efekt';

const svg=(v:string,ic:string)=>'<svg viewBox="'+v+'" aria-hidden="true"><g stroke="#211c1c" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">'+ic+'</g></svg>';
export const sabun=svg('0 0 88 116','<path d="M37 32V19h8V9h27v8H53v15Z" fill="#69bfb9"/><rect x="22" y="28" width="43" height="13" rx="5" fill="#ffe399"/><path d="M15 54q0-14 17-14h24q17 0 17 14v48q0 8-10 8H25q-10 0-10-8Z" fill="#f9b772"/><path d="M18 68h52v26H18Z" fill="#fff2c8"/><path d="M42 75q-7 8-4 13 4 5 9 1 6-5-5-14Z" fill="#75c4c6"/>');
const kol=svg('0 0 100 76','<path d="m17 47 9-9 42 5v16L28 60Z" fill="#8cc9c5"/><path d="M35 39 52 14q3-4 8-1l18 8q5 3 3 7L67 48Z" fill="#ffd05e"/><path d="m55 20 13 6" fill="none"/>');
const havlu=svg('0 0 120 150','<path d="M10 18h100" fill="none" stroke-width="9"/><path d="M12 18h96" fill="none" stroke="#f6bd75" stroke-width="4"/><path d="M26 18q4-10 14-9h46q8 1 9 10l7 113q-13 3-25 1l-55 6Z" fill="#ffcb69"/><path d="m21 124 80-5v9l-81 7Z" fill="#ee875d"/><path d="M37 25l-5 70" fill="none" stroke="#dc9a4e"/>');
const damla=svg('0 0 64 90','<path d="M32 5C26 27 8 43 10 60c2 16 14 24 26 21 21-4 23-21 16-36L32 5Z" fill="#8bdceb"/>');
const akinti=svg('0 0 80 120','<path d="M27 1h21c-1 18 5 39 4 57s7 36 10 52q-22 9-47 0 5-29 6-53Z" fill="#9cdee8" stroke="#5eacb6"/><path d="M33 12c-1 20 2 28 0 42m5 8 1 20m10 7 2 11" fill="none" stroke="#eefbfc"/>');
const leke=svg('0 0 108 80','<path d="M17 39q-6-8 2-12 4-2 10 1 5-8 12-2 5 7-3 11-8 1-9 6-6 6-12-4Z" fill="#bb9074" stroke="none"/><path d="M72 26q9-4 14 2-1 8-11 9-7-2-3-11Z" fill="#bb9074" stroke="none"/>');
const kabarcik=(i:number)=>'<i style="--cx:'+([26,66,37,57,43,63,31,52][i])+'%;--cy:'+([26,35,19,18,36,26,38,29][i])+'%;--cr:'+(9+i%3*3)+'%"></i>';
type Lavabo={s:Sabah;bolge:Bolge;res:(id:string)=>string;is:KosedekiIsler;yenile:()=>void;ileri:(id:string,ad:string,yap:()=>void)=>void};
export function lavaboAc({s,bolge,res,is,yenile,ileri}:Lavabo){
  const k=s.kres,adim=k.elYikama;
  function ilerle(n:number,soz:string){k.elYikama=n;is.soyle(soz);yenile()}
  const suAcik=adim===1||adim===4;
  if(suAcik)bolge('akan-su','Musluktan akan su',akinti,[52,52,8,23],undefined,'',[54,52,9,15]);
  bolge('musluk','Musluğun kolunu çevir',kol,[56,50,11,9],()=>{
    if(adim===6){k.ovma=0;k.elYikama=0;yenile();is.soyle('kres_lavabo');return}
    if(adim===0){efekt.sicrama();ilerle(1,'kres_islat')}
    else if(adim===1){is.soyle('kres_islat')}
    else if(adim===3&&k.ovma>=8){efekt.sicrama();ilerle(4,'kres_durula')}
    else{is.soyle(adim===2?'kres_sabun':adim===3?'kres_ovala':adim===4?'kres_durula':'kres_kuru')}
  },'',[58,54,15,7]);
  bolge('sabun','Sabun pompasına bas',sabun,[18,65,13,27],()=>{
    if(adim!==2){is.soyle(adim<2?'kres_once_islat':adim===3?'kres_ovala':'kres_kuru');return}
    efekt.vicik();ilerle(3,'kres_ovala')
  },'',[13,63,19,15]);
  bolge('havlu','Patilerini havluyla kurula',havlu,[82,45,18,32],()=>{
    if(adim!==5){is.soyle('kres_havlu_bekle');return}
    tamamla(k,'lavabo');efekt.yapis();ilerle(6,'kino_kres_temiz');
  },'',[85,44,22,22]);
  const kopuk=adim===3||adim===4;
  const patiler=bolge('patiler','Kino’nun patileri',res('kres/pati-'+Number(adim===3))+
    ((adim<3||adim===3&&k.ovma<3)?'<span class="kres-camur">'+leke+'</span>':'')+
    (kopuk?'<span class="kres-kopukler">'+Array.from({length:Math.min(8,2+k.ovma)},(_,i)=>kabarcik(i)).join('')+'</span>':'')+
    (adim===1||adim===5?'<span class="kres-islak">'+damla+damla+'</span>':''),
    [50,75,37,32],()=>{
      if(adim===1){efekt.sicrama();ilerle(2,'kres_sabun')}
      else if(adim===4){efekt.sicrama();ilerle(5,'kres_kuru')}
      else if(adim===3&&k.ovma>=8)is.soyle('kres_ac_durula');
      else if(adim!==3)is.soyle(adim===6?'kino_kres_temiz':adim===0?'kres_lavabo':adim===2?'kres_sabun':'kres_kuru');
    },'kres-patiler',[50,68,55,22]);
  if(adim===6)ileri('done','Sınıfa dön',()=>is.gir('anasinifi'));
  if(suAcik){
    const akim=patiler.parentElement!.querySelector<HTMLElement>('[data-kres="akan-su"]')!;
    let tutus:{id:number;x:number;y:number}|undefined;
    patiler.onpointerdown=e=>{
      if(e.button!==0||tutus)return;
      e.preventDefault();e.stopPropagation();patiler.setPointerCapture(e.pointerId);
      tutus={id:e.pointerId,x:e.clientX,y:e.clientY};
    };
    patiler.onpointermove=e=>{
      if(tutus?.id!==e.pointerId)return;
      patiler.style.translate=(e.clientX-tutus.x)+'px '+(e.clientY-tutus.y)+'px';
    };
    patiler.onpointerup=e=>{
      if(tutus?.id!==e.pointerId)return;
      e.stopPropagation();
      const r=akim.getBoundingClientRect(),a=patiler.getBoundingClientRect();
      const dokundu=Math.hypot(e.clientX-tutus.x,e.clientY-tutus.y)<8;
      const u=a.left+a.width/2,v=a.top+a.height*.30;
      const suyaGeldi=u>=r.left-a.width*.25&&u<=r.right+a.width*.25&&v>=r.top-a.height*.13&&v<=r.bottom+a.height*.15;
      tutus=undefined;patiler.style.removeProperty('translate');
      if(dokundu||suyaGeldi){efekt.sicrama();ilerle(adim===1?2:5,adim===1?'kres_sabun':'kres_kuru')}
    };
    patiler.onpointercancel=patiler.onlostpointercapture=()=>{tutus=undefined;patiler.style.removeProperty('translate')};
  }
  if(adim!==3||k.ovma>=8)return;
  let elde:number|undefined,sonX=0,sonYon=0,sonVurus=0;
  const vurus=()=>{
    if(k.ovma>=8)return;
    k.ovma++;efekt.ovala();is.kaydet();
    const poz=patiler.querySelector('img')!,yeni=document.createElement('template');
    yeni.innerHTML=res('kres/pati-'+(k.ovma%2));poz.src=(yeni.content.firstChild as HTMLImageElement).src;
    const baloncuk=patiler.querySelector('.kres-kopukler')!;
    baloncuk.innerHTML=Array.from({length:Math.min(8,k.ovma+2)},(_,i)=>kabarcik(i)).join('');
    if(k.ovma>=3)patiler.querySelector('.kres-camur')?.remove();
    if(k.ovma===8){is.soyle('kres_ac_durula');yenile()}
  };
  patiler.onpointerdown=e=>{if(elde!==undefined||e.button!==0)return;e.stopPropagation();e.preventDefault();patiler.setPointerCapture(e.pointerId);elde=e.pointerId;sonX=e.clientX;sonYon=0;sonVurus=sonX};
  patiler.onpointermove=e=>{
    if(elde!==e.pointerId)return;
    const dx=e.clientX-sonX;if(Math.abs(dx)<2)return;
    const yon=Math.sign(dx);
    if(yon!==sonYon){sonVurus=sonX;sonYon=yon}
    if(Math.abs(e.clientX-sonVurus)>Math.max(12,patiler.clientWidth*.12)){vurus();sonVurus=e.clientX}
    sonX=e.clientX;
  };
  patiler.onpointerup=patiler.onpointercancel=e=>{if(elde===e.pointerId){e.stopPropagation();elde=undefined}};
  patiler.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();vurus()}};
}
