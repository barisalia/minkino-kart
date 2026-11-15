import { IKON } from '../../src/ui/ikonlar';
import { DUDAK, sekilDizisi, zarfCikar, type AgizSekli } from '../../src/audio/dudak-mantik';
import { sayfaAdresi } from '../../src/kabuk/sayfa';
import { dinle } from '../src/mikrofon';
import './stil.css';

const ana = document.querySelector<HTMLElement>('#sahne')!;
const oyuncu = document.querySelector<HTMLElement>('#ceren')!;
const durum = document.querySelector<HTMLElement>('#durum')!;
const basla = document.querySelector<HTMLButtonElement>('#basla')!;
const yardim = document.querySelector<HTMLButtonElement>('#yardim')!;
const tekrar = document.querySelector<HTMLButtonElement>('#tekrar')!;
const geri = document.querySelector<HTMLAnchorElement>('#geri')!;
const dolgu = document.querySelector<SVGRectElement>('#su')!;
geri.innerHTML = IKON.geri;
geri.href = sayfaAdresi('../../');
tekrar.innerHTML = IKON.hoparlor;

const agiz: Record<AgizSekli,number> = { kapali:0, gulumse:0, az:1, dis:1, orta:2, yuvarlak:3 };
const kayitlar = import.meta.glob<string>('../../assets/alfabe/ses/{01-speak,success,retry,manual}.mp3',{eager:true,query:'?url',import:'default'});
const resimler = import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp',{eager:true,query:'?url',import:'default'});
const pozlar = [0,1,2,3].map(i=>{
  const img = new Image(); img.alt = ''; img.hidden = i!==0;
  img.src = resimler['../../assets/alfabe/ceren-konus/'+i+'.webp'];
  oyuncu.append(img);
  return img;
});
const hazir = Promise.all(pozlar.map(p=>p.decode()));
let gecerliPoz=0;
function poz(n:number){
  if (n===gecerliPoz) return;
  pozlar[gecerliPoz].hidden=true;
  pozlar[n].hidden=false;gecerliPoz=n;
}
function doldur(yuzde:number){
  const yukseklik=163*Math.max(0,Math.min(1,yuzde/100));
  dolgu.setAttribute('y',String(186-yukseklik));
  dolgu.setAttribute('height',String(yukseklik));
}
type Klip = { buffer:AudioBuffer; pozlar:AgizSekli[] };
const sesHafiza = new Map<string,Promise<Klip>>();
let baglam:AudioContext|undefined, kaynak:AudioBufferSourceNode|undefined;
let rAF=0, nesil=0, deneme=0;
let dinlemeyiKapat:(()=>void)|undefined;
async function yukle(ad:string, ctx:AudioContext){
  const r=await fetch(kayitlar['../../assets/alfabe/ses/'+ad+'.mp3']);
  if(!r.ok)throw new Error('Ses kaydı açılamadı');
  const buffer=await ctx.decodeAudioData(await r.arrayBuffer());
  const zarf=zarfCikar(buffer.getChannelData(0),buffer.sampleRate);
  return {buffer,pozlar:sekilDizisi(zarf,10,{...DUDAK,enAzMs:88})};
}
function durdur(){
  nesil++;cancelAnimationFrame(rAF);rAF=0;
  dinlemeyiKapat?.();dinlemeyiKapat=undefined;
  if(kaynak){kaynak.onended=null;kaynak.stop();kaynak.disconnect();kaynak=undefined;}
  poz(0);
}
function bilgi(metin:string){durum.textContent=metin;}
function ilkEkran(metin=''){
  ana.dataset.durum='hazir';bilgi(metin);doldur(0);
  basla.hidden=false;basla.textContent='Ceren’i dinle';yardim.hidden=true;
}
async function soyle(ad:string,tamam:()=>void){
  durdur();
  const bu=nesil;
  ana.dataset.durum='konusuyor';
  try{
    baglam??=new AudioContext();
    const ctx=baglam;
    const devam=ctx.resume();
    let is=sesHafiza.get(ad);
    if(!is){is=yukle(ad,ctx);sesHafiza.set(ad,is);is.catch(()=>sesHafiza.delete(ad));}
    const [klip]=await Promise.all([is,devam,hazir]);
    if(nesil!==bu)return;
    const oynat=ctx.createBufferSource();kaynak=oynat;
    oynat.buffer=klip.buffer;oynat.connect(ctx.destination);
    const bas=ctx.currentTime;
    function oynatPoz(){
      if(nesil!==bu)return;
      const i=Math.max(0,Math.floor((ctx.currentTime-bas)*100));
      poz(agiz[klip.pozlar[i]??'kapali']);
      rAF=requestAnimationFrame(oynatPoz);
    }
    oynat.onended=()=>{
      if(nesil!==bu)return;
      cancelAnimationFrame(rAF);rAF=0;oynat.disconnect();kaynak=undefined;poz(0);tamam();
    };
    oynat.start(bas);oynatPoz();
  }catch{if(nesil===bu){poz(0);ilkEkran('Derse yeniden başlatmak için dokun.');}}
}
function bitir(soylenen:boolean){
  ana.dataset.durum='tamam';doldur(100);bilgi(soylenen?'A sesini söyledin!':'A sesini tamamladın.');
  yardim.hidden=true;basla.hidden=false;basla.textContent='Yeniden dene';deneme=0;
}
function siraCocukta(){
  durdur();const bu=nesil;
  ana.dataset.durum='dinliyor';basla.hidden=true;yardim.hidden=true;doldur(0);bilgi('Şimdi sen söyle: A');
  let biriken=0,son=performance.now();
  dinlemeyiKapat=dinle('01',seviye=>{
    const simdi=performance.now(),dt=Math.min(80,simdi-son);son=simdi;
    if(seviye>8)biriken=Math.min(88,biriken+dt*Math.min(1,seviye/32)*.19);
    doldur(biriken);
  },sonuc=>{
    if(nesil!==bu)return;
    dinlemeyiKapat=undefined;
    if(sonuc==='dogru'){
      doldur(100);bilgi('Duydum!');void soyle('success',()=>bitir(true));return;
    }
    deneme++;const elle=deneme>=2||sonuc==='erisim';doldur(0);
    bilgi(sonuc==='erisim'?'Mikrofon açılamadı.':'Bir daha deneyelim.');
    const hazirla=()=>{
      ana.dataset.durum='yeniden';basla.hidden=false;basla.textContent='Mikrofonla dene';yardim.hidden=!elle;
    };
    if(elle){void soyle('manual',hazirla);}else{void soyle('retry',derseBasla);}
  });
}
function derseBasla(){
  doldur(0);bilgi('Ceren’i dinle.');basla.hidden=true;yardim.hidden=true;
  void soyle('01-speak',siraCocukta);
}
basla.onclick=()=>ana.dataset.durum==='yeniden'?siraCocukta():derseBasla();
tekrar.onclick=derseBasla;
yardim.onclick=()=>{durdur();bitir(false);};
function ayril(){
  durdur();
  const ctx=baglam;baglam=undefined;
  if(ctx&&ctx.state!=='closed')void ctx.close().catch(()=>{});
  ilkEkran();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)ayril();});
window.addEventListener('pagehide',ayril);
ilkEkran();
