import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {jest,merkez,icinde,type Nokta} from './hareket';
import {kremaTorbasi,kremalar,type Krema} from './kurabiye-tepsisi';
import {tartResmi,tartMeyveAdi} from './tart-tarifi';
import './minik-kek.css';

export type KekFisi='cilek'|'orman'|'muz';
type Meyve='cilek'|'yaban'|'muz';
interface KremaCicegi {tat:Krema;boy:number}
export interface KekPorsiyonu {cicekler:(KremaCicegi|null)[];meyveler:(Meyve|null)[]}
const fisler:Record<KekFisi,{tat:Krema;meyve:Meyve}>={cilek:{tat:'cilek',meyve:'cilek'},orman:{tat:'kakao',meyve:'yaban'},muz:{tat:'vanilya',meyve:'muz'}};
export const kekFisiniOku=(v:unknown):KekFisi=>v==='orman'||v==='muz'?v:'cilek';
const kremaMi=(v:unknown):v is Krema=>v==='cilek'||v==='kakao'||v==='vanilya';
const meyveMi=(v:unknown):v is Meyve=>v==='cilek'||v==='yaban'||v==='muz';
const dosyalar=import.meta.glob<string>('../../assets/sef/minik-kek/*.webp',{eager:true,query:'?url',import:'default'});
const cicek=(tat:Krema)=>h('img.mk-rozet',{src:dosyalar['../../assets/sef/minik-kek/'+tat+'.webp'],alt:'',draggable:false,'data-tat':tat});
const meyve=(tat:Meyve)=>h('img.mk-meyve',{src:tartResmi(tat),alt:'',draggable:false,'data-meyve':tat});
const kekTabani=new URL('../../assets/sef/tatli/kek-sade.webp',import.meta.url).href;
const yerler=[{x:28,y:45},{x:51,y:36},{x:73,y:46}];
export function kekPorsiyonunuOku(v?:Partial<KekPorsiyonu>):KekPorsiyonu{
  const cicekler=yerler.map((_,i)=>{const c=v?.cicekler?.[i];return c&&kremaMi(c.tat)&&Number.isFinite(c.boy)?{tat:c.tat,boy:Math.min(1,Math.max(.48,c.boy))}:null;});
  const meyveler=yerler.map((_,i)=>{const m=v?.meyveler?.[i];return meyveMi(m)?m:null;});
  return {cicekler,meyveler};
}
export function kekOrnegi(fis:KekFisi){
  const p=kekPorsiyonunuOku(),istek=fisler[fis];
  p.cicekler[0]={tat:istek.tat,boy:.93};p.cicekler[2]={tat:istek.tat,boy:.93};p.meyveler[1]=istek.meyve;
  return p;
}
export function kekFarki(p:KekPorsiyonu,fis:KekFisi){
  const istek=fisler[fis],c=p.cicekler.filter(Boolean),m=p.meyveler.filter(Boolean);
  return Number(c.length!==2||c.some(rozet=>rozet?.tat!==istek.tat))+Number(m.length!==1||m[0]!==istek.meyve);
}
export function kekFisRozeti(fis:KekFisi){
  const {tat,meyve:m}=fisler[fis];
  return h('span.mk-fis',{role:'img','aria-label':'İki '+kremalar[tat].ad.toLocaleLowerCase('tr')+' krema çiçeği ve bir '+tartMeyveAdi[m].toLocaleLowerCase('tr')},cicek(tat),cicek(tat),meyve(m));
}
function dekor(k:HTMLElement,p:KekPorsiyonu){
  k.querySelectorAll('.mk-dekor').forEach(el=>el.remove());
  for(const i of [1,0,2]){
    const c=p.cicekler[i],m=p.meyveler[i],yer=yerler[i];
    if(c){const r=cicek(c.tat);r.classList.add('mk-dekor');r.dataset.yer=String(i);r.style.left=yer.x+'%';r.style.top=yer.y+'%';r.style.width=(19+c.boy*20)+'%';k.append(r);}
    if(m){const r=meyve(m);r.classList.add('mk-dekor');r.style.left=yer.x+'%';r.style.top=(yer.y-(c?7:2))+'%';k.append(r);}
  }
}
export function minikKek(p:KekPorsiyonu){
  const k=h('span.mk-kek',{role:'img','aria-label':'Hazırladığın minik kek'},h('img.mk-taban',{src:kekTabani,alt:'',draggable:false}));
  dekor(k,p);return k;
}
export function kekSusle(alan:HTMLElement,raf:HTMLElement,p:KekPorsiyonu,kremaAdimi:boolean,kaydet:()=>void,ileri:()=>void){
  const sunum=minikKek(p),stand=h('img.mk-stand',{src:dosyalar['../../assets/sef/minik-kek/stand.webp'],alt:'',draggable:false});
  const tezgah=h('div.mk-tezgah',{},stand,sunum),yuvalar:HTMLButtonElement[]=[];
  let tat:Krema='cilek',dilim:Meyve='cilek',etkin:number|undefined,baslangic=0,kare=0;
  let sikilan:HTMLImageElement|null=null;
  const torba=h('span.mk-elde',{'aria-hidden':'true'},kremaTorbasi(tat));torba.hidden=true;
  const kalip=h('div.mk-kaynaklar',{role:'group','aria-label':kremaAdimi?'Krema seç':'Meyve dilimi seç'});
  const tamam=dugme(kremaAdimi?'Meyveleri yerleştir':'Keki tabağa al','ta-sun',ikon('onay'));
  function ciz(){dekor(sunum,p);yuvalar.forEach((b,i)=>{b.dataset.dolu=String(!!(kremaAdimi?p.cicekler[i]:p.meyveler[i]));});}
  function meyveKoy(i:number,m:Meyve){p.meyveler[i]=p.meyveler[i]===m?null:m;kaydet();ciz();}
  function goster(t:number){
    if(etkin===undefined||!tezgah.isConnected)return;
    const boy=Math.min(1,.48+(t-baslangic)/1200);
    p.cicekler[etkin]={tat,boy};
    if(sikilan)sikilan.style.width=(19+boy*20)+'%';
    if(boy<1)kare=requestAnimationFrame(goster);
  }
  function bas(i:number){
    if(etkin!==undefined)return;
    etkin=i;baslangic=performance.now();
    p.cicekler[i]={tat,boy:.48};ciz();
    sikilan=sunum.querySelector<HTMLImageElement>(`.mk-rozet[data-yer="${i}"]`);
    torba.replaceChildren(kremaTorbasi(tat));torba.style.left=yerler[i].x+'%';torba.style.top=yerler[i].y+'%';torba.hidden=false;
    goster(baslangic);
  }
  function birak(){if(etkin===undefined)return;cancelAnimationFrame(kare);etkin=undefined;sikilan=null;torba.hidden=true;kaydet();}
  yerler.forEach((yer,i)=>{
    const b=dugme((i+1)+'. yere '+(kremaAdimi?'krema çiçeği sık':'meyve yerleştir'),'mk-hedef');
    b.style.left=yer.x+'%';b.style.top=yer.y+'%';b.dataset.yer=String(i);
    if(kremaAdimi)jest(b,{basla:()=>bas(i),birak:()=>birak(),iptal:birak,klavye:()=>{bas(i);if(p.cicekler[i])p.cicekler[i]!.boy=1;birak();ciz();}});
    else b.onclick=()=>meyveKoy(i,dilim);
    yuvalar.push(b);sunum.append(b);
  });
  function sec(k:Krema|Meyve,b:HTMLButtonElement){
    if(kremaAdimi&&kremaMi(k))tat=k;
    else if(!kremaAdimi&&meyveMi(k))dilim=k;
    for(const tus of kalip.querySelectorAll('button'))tus.setAttribute('aria-pressed',String(tus===b));
  }
  for(const k of kremaAdimi?(['cilek','kakao','vanilya'] as const):(['cilek','yaban','muz'] as const)){
    const b=dugme(kremaAdimi?kremalar[k as Krema].ad+' kreması':tartMeyveAdi[k as Meyve]+' dilimi','mk-kaynak',kremaAdimi?kremaTorbasi(k as Krema):meyve(k as Meyve));
    b.setAttribute('aria-pressed',String(k==='cilek'));b.dataset.tur=k;
    if(kremaAdimi)b.onclick=()=>sec(k,b);
    else{
      let elde:HTMLImageElement|undefined;
      const secili=()=>sec(k,b);
      const temizle=()=>{elde?.remove();elde=undefined;};
      jest(b,{basla:secili,tasi:(n,ilk)=>{
        if(Math.hypot(n.x-ilk.x,n.y-ilk.y)<5&&!elde)return;
        if(!elde){elde=meyve(k as Meyve);elde.className='mk-tasinan';document.body.append(elde);}
        elde.style.left=n.x+'px';elde.style.top=n.y+'px';
      },birak:(n,_ilk,tik)=>{if(!tik){const i=enYakin(n);if(i>=0)meyveKoy(i,k as Meyve);}temizle();},iptal:temizle,klavye:secili});
    }
    kalip.append(b);
  }
  function enYakin(n:Nokta){
    let en=-1,mesafe=Infinity;yuvalar.forEach((b,i)=>{if(!icinde(b,n,5))return;const m=merkez(b),d=Math.hypot(n.x-m.x,n.y-m.y);if(d<mesafe){mesafe=d;en=i;}});
    return en;
  }
  const sil=dugme(kremaAdimi?'Kremaları kaldır':'Meyveleri kaldır','mk-sil',ikon('tekrar'));
  sil.onclick=()=>{birak();if(kremaAdimi)p.cicekler.fill(null);else p.meyveler.fill(null);kaydet();ciz();};
  tamam.onclick=()=>{birak();ileri();};
  sunum.append(torba);tezgah.append(sil);alan.append(tezgah);raf.append(kalip,tamam);ciz();
}
