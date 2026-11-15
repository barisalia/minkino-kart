import {baglam,efektCikisi,muzikCikisi} from './motor';

const hz=(midi:number)=>440*2**((midi-69)/12);
// Pizzicato, tahta dil ve flütün atak ve sönüşleri birbirinden farklıdır.
function tel(c:BaseAudioContext,out:AudioNode,t:number,n:number,uzun:number,guc:number,tur:'tel'|'tahta'|'can'|'flut'|'bas'){
  const oran=tur==='tahta'?[1,3.98,9.1]:tur==='can'?[1,2.4,3.01]:[1,2,3];
  const kuvvet=tur==='flut'?[1,.15,.075]:tur==='bas'?[1,.33,.13]:[1,.27,.12];
  oran.forEach((r,i)=>{
    const o=c.createOscillator(),g=c.createGain(),son=t+uzun*(tur==='flut'?1:[1,.66,.36][i]);
    o.frequency.value=hz(n)*r;const a=guc*kuvvet[i];
    const atak=Math.min((tur==='flut'?.036:.006), (son-t)*.2);
    g.gain.setValueAtTime(.00001,t);g.gain.exponentialRampToValueAtTime(a,t+atak);
    if(tur==='flut')g.gain.exponentialRampToValueAtTime(a*.76,son-(son-t)*.24);
    else g.gain.exponentialRampToValueAtTime(a*.25,t+(son-t)*.48);
    g.gain.exponentialRampToValueAtTime(.00001,son);o.connect(g).connect(out);o.start(t);o.stop(son+.006);
    o.onended=()=>{o.disconnect();g.disconnect()};
  });
}
const sesler=new WeakMap<BaseAudioContext,AudioBuffer>();
function vur(c:BaseAudioContext,out:AudioNode,t:number,i:number,n:number,uzun:number,v:number){
  if(i>=3){tel(c,out,t,n,uzun,v,i===3?'can':i===4?'tahta':'flut');return}
  if(i!==1){
    const o=c.createOscillator(),g=c.createGain(),d=i===0?.23:.12;
    o.frequency.setValueAtTime(i===0?172:240,t);o.frequency.exponentialRampToValueAtTime(i===0?79:131,t+.08);
    g.gain.setValueAtTime(.00001,t);g.gain.exponentialRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(.00001,t+d);
    o.connect(g).connect(out);o.start(t);o.stop(t+d+.004);o.onended=()=>{o.disconnect();g.disconnect()};
  }
  let buf=sesler.get(c);
  if(!buf){buf=c.createBuffer(1,Math.ceil(c.sampleRate*.3),c.sampleRate);const p=buf.getChannelData(0);for(let j=0;j<p.length;j++)p[j]=Math.random()*2-1;sesler.set(c,buf)}
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),d=i===1?.106:i===2?.145:.047;
  src.buffer=buf;f.type='bandpass';f.Q.value=.78;f.frequency.value=[1150,4500,6200][i];
  g.gain.setValueAtTime(.00001,t);g.gain.exponentialRampToValueAtTime(v*(i===0?.35:1.55),t+(i===1?.021:.004));
  g.gain.exponentialRampToValueAtTime(.00001,t+d);src.connect(f).connect(g).connect(out);src.start(t);src.stop(t+d);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect()};
}
export function calgiSesi(i:number,n=[48,72,67,79,76,72][i],vurgu=1){
  const c=baglam(),out=efektCikisi();if(c&&out&&i>=0&&i<6)vur(c,out,c.currentTime+.006,i,n,[.22,.13,.16,.62,.43,.43][i],(i===0?.28:.17)*Math.max(.05,Math.min(1.4,vurgu)));
}
// Dört ölçülük soru-cevap cümlesi, son ölçüde dominanttan toniğe döner.
const ezgi=[[72,76,79,76],[77,76,74,72],[74,77,79,83],[79,76,74,72]];
const akor=[[48,64,67],[53,65,69],[43,62,67],[48,64,67]];
function eslik(c:BaseAudioContext,o:AudioNode,t:number,b:number,adim:number,son:boolean,hareketli:boolean){
  const olcu=Math.floor(adim/4)%4,v=adim%4,k=akor[olcu],nota=son?72:ezgi[olcu][v];
  if(v%2===0||son)tel(c,o,t,son?48:k[0]+(v===2?7:0),b*.84,.16,'bas');
  for(const [i,n] of [k[1],k[2]].entries())tel(c,o,t+b*(son?.015:.43)+i*.015,n,b*.48,.059,'tel');
  tel(c,o,t+.013,nota,b*(son?.95:.73),.095,'tahta');
  if(!son&&(v===1||v===3))tel(c,o,t+b*.62,ezgi[olcu][(v+1)%4],b*.31,.067,'tahta');
  if(hareketli){vur(c,o,t,adim%2===0?0:2,48,.1,.12);vur(c,o,t+b*.52,1,72,.1,.085)}
}
export interface BandoKaydi{gecen:()=>number;durdur:()=>void;sure:number}
type SahneDali='sarki'|'dans';
// İki bağımsız 16 ölçülük düzenleme. Giriş, iki sesin karşılıklı cümleleri,
// birlikte söylenen nakarat ve kapanış. Dansın aksanları alkış / taban şeklinde.
const sarkiMotif=[
  [72,0,76,79],[77,0,76,74],[72,76,79,0],[81,79,76,0],
  [74,77,81,0],[83,81,79,0],[76,79,84,83],[81,0,79,0],
  [79,76,72,0],[77,81,84,0],[79,83,86,83],[84,0,79,0],
  [76,79,84,0],[81,77,74,0],[79,74,71,0],[72,0,0,0],
];
const dansMotif=[
  [65,0,69,72],[72,0,69,0],[65,69,72,0],[74,72,69,0],
  [70,0,74,77],[77,74,72,0],[67,70,74,0],[72,0,67,0],
  [77,0,76,72],[74,0,70,69],[67,70,74,0],[72,76,79,0],
  [77,76,72,69],[70,74,77,0],[72,67,64,0],[65,0,0,0],
];
const sarkiBas=[48,53,48,53,50,43,48,53,48,53,43,48,48,50,43,48],dansBas=[41,41,41,41,46,46,43,48,41,46,43,48,41,46,48,41];
/** İki arkadaşın sözsüz müzik diyaloğu. Çocuğun dokunduğu andaki akordan
 * çıkar; geç gelen doğru dokunuş bile o sırada çalan ölçüyle uyuşur. */
export function sarkiCevabi(ay:boolean,vurus=0,kisaca=false,aile=false){
  const c=baglam(),out=efektCikisi();if(!c||!out)return;
  const m=Math.max(0,Math.min(15,Math.floor(vurus/4))),bas=sarkiBas[m];
  const kok=(bas<47?bas+36:bas+24)-(aile?12:0),uc=(bas===50?3:4);
  const motif=ay?[kok+7,kok+uc,kok]:[kok,kok+uc,kok+7];
  const t=c.currentTime+.007,b=60/96,tip=ay?'tahta':'flut';
  if(kisaca){tel(c,out,t,motif[0],.17,.056,tip);return}
  motif.forEach((n,i)=>tel(c,out,t+b*[0,.35,.77][i],n,b*[.29,.33,.64][i],[.102,.086,.105][i],tip));
}
function sahneOlcusu(c:BaseAudioContext,o:AudioNode,t:number,b:number,i:number,dal:SahneDali){
  const m=Math.floor(i/4),v=i%4,dans=dal==='dans',nota=(dans?dansMotif:sarkiMotif)[m][v],bas=(dans?dansBas:sarkiBas)[m],son=m===15;
  if(son&&v>0)return;
  if(v%2===0)tel(c,o,t,bas+(v===2?7:0),b*(son?2.75:.78),.17,'bas');
  if(son){
    for(const aralik of [12,16,19])tel(c,o,t+(aralik-12)*.014,bas+aralik,b*2,.075,'tel');
    tel(c,o,t+.065,bas+36,b*2.15,.092,'can');return;
  }
  if(dans){
    vur(c,o,t,v%2===0?0:2,48,.2,v%2===0?.22:.2);
    vur(c,o,t+b*.5,1,72,.1,.105);
    if(v===3&&m%2===1)vur(c,o,t+b*.75,0,48,.15,.09);
    if(v%2===1)for(const it of [12,19])tel(c,o,t+b*.04,bas+it,b*.38,.075,'tel');
    if(nota)tel(c,o,t+.012,nota,b*.68,.14,'tahta');
    if(v===2&&m%4===2)tel(c,o,t+b*.55,nota+5,b*.3,.10,'tahta');
  }else{
    const koyu=m===4||m===5||m===9||m===13;
    tel(c,o,t+b*.50,bas+[12,koyu?15:16,19,12][v],b*.70,.076,'tel');
    // Sözün altına kısa davul, ters vuruşta fırça, aralarına hafif bir marakas.
    if(v%2===0)vur(c,o,t,0,48,.18,v===0?.16:.12);
    else vur(c,o,t,2,67,.12,m>=8?.13:.095);
    vur(c,o,t+b*.5,1,72,.1,v%2===0?.042:.057);
    if(nota&&v===3&&m%2===1)tel(c,o,t+.018,nota,b*.45,.043,'tahta');
    if(m%4===3&&v===3)tel(c,o,t,bas+31,b*.6,.083,'can');
  }
}
export function gosteriTaslagi(dal:SahneDali,bpm:number,ilk=0,son=64,seviye=1){
  return bandoCal(Array(Math.max(0,son-ilk)).fill(0),bpm,true,ilk,dal,seviye);
}
/** Paketleme stüdyosu için: etkileşim efekti ve konuşma olmadan ASIL
 * orkestrasyonu PCM'e işler. Oyunun Web Audio kullanamadığı cihazlarda duyulur. */
export async function konserEsliginiBas(dal:SahneDali,bpm:number,ornek=48000){
  const b=60/bpm,c=new OfflineAudioContext(2,Math.round(64*b*ornek),ornek);
  const miks=c.createGain();miks.gain.value=1;miks.connect(c.destination);
  for(let i=0;i<64;i++)sahneOlcusu(c,miks,i*b,b,i,dal);
  return c.startRendering();
}
/** Web Audio saatinde kısa bir pencere planla. UI gecikmeleri vuruşları ileri kaydırmaz. */
export function bandoCal(vuruslar:readonly number[],bpm:number,konser=false,ilkAdim=0,dal?:SahneDali,seviye=1,dongu=false):BandoKaydi{
  const c=baglam(),out=konser?muzikCikisi():efektCikisi(),b=60/bpm,sure=dongu&&vuruslar.length?Infinity:vuruslar.length*b,duvar=performance.now()/1000+.055;
  const bas=(c?.currentTime??0)+.055,g=c?.createGain();if(g&&out){g.gain.value=seviye;g.connect(out)}
  const gecen=()=>c?c.currentTime-bas:performance.now()/1000-duvar;
  let adim=0,kapali=false,saat=0;
  function durdur(){
    if(kapali)return;kapali=true;clearInterval(saat);document.removeEventListener('visibilitychange',gizlendi);window.removeEventListener('pagehide',durdur);
    if(c&&g){g.gain.setTargetAtTime(.00001,c.currentTime,.008);window.setTimeout(()=>g.disconnect(),55)}
  }
  const gizlendi=()=>{if(document.hidden)durdur()};
  function planla(){
    if(kapali||!c||!g||!out)return;
    while(adim*b<sure&&adim*b<gecen()+.25){
      const i=vuruslar[adim%vuruslar.length],z=bas+adim*b,n=adim+ilkAdim,son=!dongu&&adim===vuruslar.length-1;
      if(i>=0&&z>=c.currentTime-.015){
        const t=Math.max(z,c.currentTime+.002),nota=son?72:ezgi[Math.floor(n/4)%4][n%4];
        if(dal)sahneOlcusu(c,g,t,b,n,dal);else{
          eslik(c,g,t,b,n,son,konser);
          vur(c,g,t+.004,i,i<3?48:nota,b*(son?.88:.68),konser?.095:.22);
        }
      }adim++;
    }
    if(gecen()>sure+.12)durdur();
  }
  if(c&&out){planla();saat=window.setInterval(planla,44);document.addEventListener('visibilitychange',gizlendi);window.addEventListener('pagehide',durdur)}
  return {gecen,durdur,sure};
}
