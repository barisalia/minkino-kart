import { IKON } from '../../src/ui/ikonlar';
import { DUDAK, sekilDizisi, zarfCikar, type AgizSekli } from '../../src/audio/dudak-mantik';
import { sayfaAdresi } from '../../src/kabuk/sayfa';
import { izSur } from '../src/cizim';
import { kalemiGoster } from '../src/ornek-kalem';
import './stil.css';

const q=<T extends Element>(s:string)=>document.querySelector<T>(s)!;
const ceren=q<HTMLElement>('#ceren'),sol=q<HTMLElement>('#gosterim'),sag=q<HTMLElement>('#parmak');
const dugme=q<HTMLButtonElement>('#oynat'),tekrar=q<HTMLButtonElement>('#ses'),haber=q<HTMLElement>('#haber');
q<HTMLAnchorElement>('#geri').innerHTML=IKON.geri;
q<HTMLAnchorElement>('#geri').href=location.protocol==='file:'
  ? 'http://localhost:5173/alfabe/onizleme/'
  : sayfaAdresi('../onizleme/');
tekrar.innerHTML=IKON.hoparlor;
const resimler=import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp',{eager:true,query:'?url',import:'default'});
const sesler=import.meta.glob<string>('../../assets/alfabe/ses/{01-big,01-small,good,smallDone}.mp3',{eager:true,query:'?url',import:'default'});
const pozlar=[0,1,2,3].map(n=>{const img=new Image();img.src=resimler['../../assets/alfabe/ceren-konus/'+n+'.webp'];img.alt='';img.hidden=n!==0;ceren.append(img);return img;});
const kareler:Record<AgizSekli,number>={gulumse:0,kapali:0,az:1,orta:2,yuvarlak:3,dis:1};
let harf='A',iz:ReturnType<typeof izSur>|undefined,sesAnim=0,nesil=0,oynayan:AudioBufferSourceNode|undefined;
let baglam:AudioContext|undefined,sonPoz=0,tamam=false;
const hafiza=new Map<string,Promise<{buffer:AudioBuffer,agiz:AgizSekli[]}>>();
function poz(n:number){if(sonPoz===n)return;pozlar[sonPoz].hidden=true;pozlar[n].hidden=false;sonPoz=n;}
function sesDur(){
  nesil++;cancelAnimationFrame(sesAnim);poz(0);
  if(oynayan){oynayan.onended=null;oynayan.stop();oynayan.disconnect();oynayan=undefined;}
}
async function kayit(ad:string,ctx:AudioContext){
  const r=await fetch(sesler['../../assets/alfabe/ses/'+ad+'.mp3']);if(!r.ok)throw Error('ses');
  const buffer=await ctx.decodeAudioData(await r.arrayBuffer());
  return {buffer,agiz:sekilDizisi(zarfCikar(buffer.getChannelData(0),buffer.sampleRate),10,{...DUDAK,enAzMs:88})};
}
async function soyle(ad:string,son:()=>void){
  sesDur();const tur=nesil;
  try{
    const ctx=baglam??=new AudioContext();
    await ctx.resume();if(nesil!==tur)return;
    let soz=hafiza.get(ad);if(!soz){soz=kayit(ad,ctx);hafiza.set(ad,soz);soz.catch(()=>hafiza.delete(ad));}
    const {buffer,agiz}=await soz;if(nesil!==tur)return;
    const ses=ctx.createBufferSource();ses.buffer=buffer;ses.connect(ctx.destination);oynayan=ses;
    const bas=ctx.currentTime;
    function zamanla(){poz(kareler[agiz[Math.floor((ctx.currentTime-bas)*100)]??'kapali']);sesAnim=requestAnimationFrame(zamanla);}
    ses.onended=()=>{if(nesil!==tur)return;cancelAnimationFrame(sesAnim);oynayan=undefined;ses.disconnect();poz(0);son();};
    ses.start();zamanla();
  }catch{if(nesil===tur)son();}
}
let kalemiDurdur:(()=>void)|undefined;
function ornek(hareket:boolean){kalemiDurdur?.();kalemiDurdur=kalemiGoster(sol,harf,hareket);}
function anlat(){
  if(tamam)return;
  ornek(true);dugme.textContent='Bir daha göster';haber.textContent='';
  void soyle(harf==='A'?'01-big':'01-small',()=>{if(!tamam)haber.textContent='Şimdi sen çiz.';});
}
function kur(yeni:string){
  sesDur();iz?.kapat();harf=yeni;tamam=false;tekrar.disabled=false;dugme.disabled=false;
  q('h1').textContent=(harf==='A'?'Büyük ':'Küçük ')+harf;haber.textContent='';
  ornek(false);iz=izSur(sag,harf,bitir);
  dugme.textContent='Ceren göstersin';dugme.onclick=anlat;
}
function bitir(){
  tamam=true;kalemiDurdur?.();ornek(false);dugme.disabled=true;tekrar.disabled=true;
  haber.textContent=harf+' tamamlandı.';
  void soyle(harf==='A'?'smallDone':'good',()=>{
    dugme.disabled=false;
    if(harf==='A'){kur('a');anlat();}else{dugme.textContent='Yeniden yaz';dugme.onclick=()=>{kur('A');anlat();};}
  });
}
tekrar.onclick=anlat;
function kes(){sesDur();kalemiDurdur?.();iz?.kapat();}
window.addEventListener('pagehide',()=>{kes();if(baglam&&baglam.state!=='closed')void baglam.close();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){kes();}else kur(harf);});
kur('A');
