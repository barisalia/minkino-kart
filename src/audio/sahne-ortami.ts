import {baglam,efektCikisi} from './motor';
import {durum} from '../engine/ilerleme';
const dosyaSesleri=import.meta.glob<string>('../../assets/hazirlik/gosteri-muzik/efekt/*.wav',{eager:true,query:'?url',import:'default'});
const dosyaHavuzu=new Map<string,HTMLAudioElement[]>();
/** Gömülü tarayıcıda Web Audio yoksa aynı oyun efektinin kaydı. */
export function kisaKlavuz(ad:string,guc=1){
  const a=durum.i.ayarlar,url=dosyaSesleri['../../assets/hazirlik/gosteri-muzik/efekt/'+ad+'.wav'];
  if(!a.efekt||!url||typeof Audio==='undefined')return;
  let grup=dosyaHavuzu.get(ad);if(!grup){grup=[];dosyaHavuzu.set(ad,grup)}
  let k=grup.find(s=>s.paused||s.ended);
  if(!k&&grup.length>=3)k=grup[0];
  if(!k){k=new Audio(url);k.preload='auto';grup.push(k)}
  const ses=k;ses.pause();ses.currentTime=0;ses.volume=Math.min(1,Math.max(0,a.seviye*guc));
  void ses.play().catch(()=>{});return ()=>ses.pause();
}

// Sahnenin folyosu: zil, nota ve vurmalı çalgıdan ayrı sesler. Kısa örnekler
// bir kez hazırlanır; aynı yanıtı tarayıcıda, çevrimdışı pakette ve albümde verir.
type Tur='pati-a'|'pati-b'|'taban-a'|'taban-b'|'perde'|'salon';
const arsiv=new WeakMap<BaseAudioContext,Map<Tur,AudioBuffer>>();
function tohumlu(bas:number){let x=bas;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/2147483648-1}}
function pati(hz:number,tohum:number,ince:number){
  const rast=tohumlu(tohum),p=new Float32Array(Math.ceil(hz*.16));
  let alt=0,ust=0,once=0;
  const k1=1-Math.exp(-2*Math.PI*950*ince/hz),k2=1-Math.exp(-2*Math.PI*3700*ince/hz);
  for(let j=0;j<p.length;j++){
    const t=j/hz,v=rast();alt+=k1*(v-alt);ust+=k2*(v-ust);
    const zarf=[0,.006,.015].reduce((s,d,i)=>s+(t>=d?[.95,.63,.38][i]*Math.exp(-(t-d)*104):0),0);
    const ses=(ust-alt)*zarf*1.05 + Math.sin(2*Math.PI*(610*ince*t+1.8*(1-Math.exp(-85*t))))*.15*Math.exp(-76*t);
    // Kısa ilk yansıma (avucun içi), metalik çınlama yok.
    p[j]=(ses+.18*once)*Math.min(1,j/(hz*.0009));once=ses;
  }
  return p;
}
export function ciz(c:BaseAudioContext,tur:Tur){
  let set=arsiv.get(c);if(!set){set=new Map();arsiv.set(c,set)}
  const once=set.get(tur);if(once)return once;
  const hz=c.sampleRate,salon=tur==='salon',perde=tur==='perde',taban=tur.startsWith('taban');
  const ses=c.createBuffer(salon?2:1,Math.ceil(hz*(salon?1.68:perde?.72:taban?.17:.16)),hz);
  const l=ses.getChannelData(0);
  if(salon){
    const r=ses.getChannelData(1);
    // İzleyiciler aynı anda başlayıp mekanik bir metronom gibi çırpmasın.
    // Alkış karakterlerin baş selamında yayılır ve öğretmen konuşurken söner.
    const seyirci=[[.015,.304,-.53],[.084,.353,.36],[.16,.322,-.13],[.223,.375,.62]];
    seyirci.forEach(([bas,ara,pan],i)=>{
      const el=pati(hz,6193+i*9187,.83+i*.09);
      for(let j=0;j<4;j++){
        const t=bas+ara*j+[0,.013,-.019,.021][j],g=[.48,.55,.45,.29][j];
        const panL=Math.sqrt((1-pan)*.5)*g,panR=Math.sqrt((1+pan)*.5)*g;
        for(const [gec,kat] of [[0,1],[.032,.16],[.061,.08]]){
          const of=Math.round((t+gec)*hz);
          for(let n=0;n<el.length&&of+n<l.length;n++){l[of+n]+=el[n]*panL*kat;r[of+n]+=el[n]*panR*kat}
        }
      }
    });
  }else if(perde||taban){
    const rast=tohumlu(tur.endsWith('b')?11317:75301);let agir=0,hafif=0;
    for(let j=0;j<l.length;j++){
      const t=j/hz,r=rast();agir+=(1-Math.exp(-2*Math.PI*(perde?480:330)/hz))*(r-agir);hafif+=(1-Math.exp(-2*Math.PI*(perde?2300:1400)/hz))*(r-hafif);
      if(perde){
        const ilerle=t/.72,zarf=Math.sin(Math.PI*Math.min(1,ilerle))**1.6;
        l[j]=(hafif-agir)*zarf*(.24+.055*Math.sin(2*Math.PI*9*t))+.055*agir*zarf;
      }else{
        const a=tur==='taban-a',govde=Math.sin(2*Math.PI*((a?94:86)*t+.56*(1-Math.exp(-36*t))));
        const temas=Math.min(1,t/.009)*Math.exp(-41*t);
        l[j]=(govde*.26+agir*.57)*temas+(hafif-agir)*.20*Math.exp(-95*Math.abs(t-.018));
      }
    }
  }else{
    l.set(pati(hz,tur==='pati-a'?1237:8923,tur==='pati-a'?1:.92));
  }
  set.set(tur,ses);return ses;
}
function oynat(tur:Tur,guc=1){
  const c=baglam(),cikis=efektCikisi();if(!c||!cikis)return kisaKlavuz(tur,guc*.9);
  const kaynak=c.createBufferSource(),kazanc=c.createGain();kaynak.buffer=ciz(c,tur);kazanc.gain.value=guc;
  kaynak.connect(kazanc).connect(cikis);kaynak.start();
  kaynak.onended=()=>{kaynak.disconnect();kazanc.disconnect()};
  return ()=>{kazanc.gain.setTargetAtTime(.0001,c.currentTime,.006);try{kaynak.stop(c.currentTime+.035)}catch{/* Ses bitti. */}};
}
let el=0;
export const patiAlkisi=()=>oynat(++el%2?'pati-a':'pati-b',.72);
export const ayakSesi=(sag:boolean,yakinda=false)=>oynat(sag?'taban-a':'taban-b',yakinda?.94:.62);
export const perdeSesi=()=>oynat('perde',.87);
export const salonAlkisi=()=>oynat('salon',.75);
