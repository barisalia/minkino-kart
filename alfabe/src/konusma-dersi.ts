import { DUDAK, sekilDizisi, zarfCikar, type AgizSekli } from '../../src/audio/dudak-mantik';
import type harfler from './harfler.json';
import { kalemYollari } from './yollar';
import { mikrofonHazirla } from './mikrofon';
import { resim } from './resimler';
import { dersSesSeviyesi, medyaSeviyesiniUygula, oyunSesi } from './oyun-sesi';
import { IKON } from '../../src/ui/ikonlar';
import './konusma-dersi.css';

const kayitlar = import.meta.glob<string>([
  '../../assets/alfabe/ses/*.mp3',
  '!../../assets/alfabe/ses/{kopru,ada,sahne,yer}-*.mp3',
  '!../../assets/alfabe/ses/tren-{az,cok,giris,son,varis}.mp3',
], { query:'?url', import:'default' });
const pozlar = import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp', { eager:true, query:'?url', import:'default' });
const aciklik: Record<AgizSekli, number> = {kapali:0, gulumse:0, az:1, dis:1, orta:2, yuvarlak:3};
type Klip = { buffer:AudioBuffer; cerceveler:AgizSekli[] };
const onbellek = new Map<string,Promise<Klip>>();
let motor:AudioContext|undefined, kaynak:AudioBufferSourceNode|undefined;
let konusmaCikisi:GainNode|undefined;
let medya:HTMLAudioElement|undefined;
let medyaBeklemeyiBaslat:(()=>void)|undefined;
let medyaBekleme=0;
let sira=0, animasyon=0;

export function cerenYuzu(sinif=''){
  const katmanlar = Object.values(pozlar).map((src,i)=>'<img src="'+src+'" alt="" draggable="false" '+(i?'hidden':'')+'>');
  return '<span class="alf-ceren '+sinif+'" role="img" aria-label="Ceren Öğretmen">'+katmanlar.join('')+'</span>';
}

function agizGoster(poz:number){
  for (const yuz of document.querySelectorAll<HTMLElement>('.alf-ceren')){
    if (yuz.dataset.agiz===String(poz)) continue;
    yuz.dataset.agiz=String(poz);
    Array.from(yuz.children).forEach((el,i)=>(el as HTMLElement).hidden=i!==poz);
  }
}
export function cerenSustur(){
  sira++;
  cancelAnimationFrame(animasyon);
  clearTimeout(medyaBekleme);
  medyaBeklemeyiBaslat=undefined;
  if(medya){
    medya.onended=medya.onerror=medya.onplaying=null;
    medya.pause();medya.removeAttribute('src');medya.load();medya=undefined;
  }
  if(kaynak){
    kaynak.onended=null;
    kaynak.stop();kaynak.disconnect();kaynak=undefined;
  }
  agizGoster(0);
}
async function klipYukle(id:string,ctx:AudioContext):Promise<Klip>{
  const adres=kayitlar['../../assets/alfabe/ses/'+id+'.mp3'];
  if(!adres)throw new Error('Ses kaydı bulunamadı: '+id);
  const yanit=await fetch(await adres());
  if(!yanit.ok)throw new Error('Ses kaydı okunamadı: '+id);
  const buffer=await ctx.decodeAudioData(await yanit.arrayBuffer());
  const zarf=zarfCikar(buffer.getChannelData(0),buffer.sampleRate);
  return {buffer,cerceveler:sekilDizisi(zarf,10,{...DUDAK,enAzMs:88})};
}
export function cerenKonus(id:string,sonra?:()=>void, oynarken?:(saniye:number)=>void){
  cerenSustur();
  const bu=sira;
  async function medyaIleOynat(){
    const adres=kayitlar['../../assets/alfabe/ses/'+id+'.mp3'];
    if(!adres)throw new Error('Ses kaydı bulunamadı: '+id);
    const [url,{default:tablo}]=await Promise.all([adres(),import('./agiz-zamanlari.json')]);
    if(bu!==sira)return;
    const ses=new Audio(url);
    medyaSeviyesiniUygula(ses,dersSesSeviyesi('konusma'));
    medya=ses;
    const zamanlar=(tablo as Record<string,number[][]>)[id]??[];
    let indeks=0;
    function izle(){
      if(bu!==sira||medya!==ses)return;
      medyaSeviyesiniUygula(ses,dersSesSeviyesi('konusma'));
      const saniye=ses.currentTime;
      while(indeks+1<zamanlar.length&&zamanlar[indeks+1][0]<=saniye*1000)indeks++;
      agizGoster(zamanlar[indeks]?.[1]??0);
      if(saniye>0)oynarken?.(saniye);
      animasyon=requestAnimationFrame(izle);
    }
    function bitir(){
      if(bu!==sira||medya!==ses)return;
      ses.onended=ses.onerror=ses.onplaying=null;
      clearTimeout(medyaBekleme);medyaBeklemeyiBaslat=undefined;ses.pause();
      medya=undefined;
      cancelAnimationFrame(animasyon);agizGoster(0);sonra?.();
    }
    ses.onended=bitir;ses.onerror=bitir;
    // Gömülü oynatıcı bazen "playing" bildirip tek bir ses örneği bile
    // ilerletmez. Arka planda geçen zamanı bekleme süresine katma.
    function beklemeyiBaslat(){
      clearTimeout(medyaBekleme);
      if(document.hidden||medya!==ses)return;
      const baslangic=ses.currentTime;
      medyaBekleme=window.setTimeout(()=>{
        if(document.hidden||medya!==ses)return;
        if(ses.currentTime>baslangic)beklemeyiBaslat();
        else bitir();
      },5000);
    }
    medyaBeklemeyiBaslat=beklemeyiBaslat;
    beklemeyiBaslat();
    if(!document.hidden)try{await ses.play();}catch{bitir();return;}
    izle();
  }
  async function oynat(){
    try{
      motor??=new AudioContext();
      const ctx=motor;
      const hazir=ctx.resume();
      let is=onbellek.get(id);
      if(!is){
        // Kısa kayıtlar tekrar dinlenir; bütün alfabenin çözümlenmiş PCM'ini bellekte tutma.
        if(onbellek.size>=12)onbellek.delete(onbellek.keys().next().value!);
        is=klipYukle(id,ctx);onbellek.set(id,is);
        is.catch(()=>onbellek.delete(id));
      }
      const [klip]=await Promise.all([is,hazir]);
      if(bu!==sira)return;
      const dugum=ctx.createBufferSource();
      if(!konusmaCikisi) {
        konusmaCikisi=ctx.createGain();
        konusmaCikisi.connect(ctx.destination);
      }
      const cikis=konusmaCikisi;
      cikis.gain.value=dersSesSeviyesi('konusma');
      kaynak=dugum;dugum.buffer=klip.buffer;dugum.connect(cikis);
      const bas=ctx.currentTime;
      function ciz(){
        const seviye=dersSesSeviyesi('konusma');
        if(cikis.gain.value!==seviye) cikis.gain.value=seviye;
        oynarken?.(ctx.currentTime-bas);
        const an=Math.floor(Math.max(0,ctx.currentTime-bas)*100);
        agizGoster(aciklik[klip.cerceveler[an]??'kapali']);
        animasyon=requestAnimationFrame(ciz);
      }
      dugum.onended=()=>{
        if(bu!==sira)return;
        oynarken?.(klip.buffer.duration);
        cancelAnimationFrame(animasyon);agizGoster(0);dugum.disconnect();kaynak=undefined;sonra?.();
      };
      dugum.start(bas);ciz();
    }catch{
      if(bu!==sira)return;
      try{await medyaIleOynat();}
      catch{if(bu===sira){agizGoster(0);sonra?.();}}
    }
  }
  void oynat();
}
function sesKapat(){
  cerenSustur();
  konusmaCikisi?.disconnect();konusmaCikisi=undefined;
  const ctx=motor;motor=undefined;
  if(ctx&&ctx.state!=='closed')void ctx.close().catch(()=>{});
}
window.addEventListener('pagehide',sesKapat);
document.addEventListener('visibilitychange',()=>{
  if(medya){
    const etkin=medya;
    medyaBeklemeyiBaslat?.();
    if(document.hidden)etkin.pause();
    else void etkin.play().catch(()=>{if(etkin===medya)etkin.dispatchEvent(new Event('error'));});
  }
  if (!motor || motor.state === 'closed') return;
  const durum = document.hidden ? motor.suspend() : motor.resume();
  void durum.catch(()=>{});
});

let kartNo=0;
function harfSekli(harf:string,renk:string,kalinlik:number){
  return '<g fill="none" stroke="'+renk+'" stroke-width="'+kalinlik+'" stroke-linecap="round" stroke-linejoin="round">'+
    kalemYollari(harf).map(y=>'<path d="'+y+'"/>').join('')+'</g>';
}

type Harf=typeof harfler[number];
export function sesDersiKur(alan:HTMLElement,ders:Harf,konus:(id:string,sonra?:()=>void)=>void,sonraki:()=>void){
  const kesit='ses-dolgu-'+(++kartNo);
  const temel=harfSekli(ders.upper,'#97cbbc',13), dolu=harfSekli(ders.upper,'#00594f',13);
  const kucuk=harfSekli(ders.lower,'#ef6a54',7);
  alan.innerHTML='<section class="alf-soyle" data-durum="ornek">'+cerenYuzu('alf-soyle-hoca')+
    '<div class="alf-soyle-ders"><div class="alf-soyle-kart"><svg viewBox="0 0 220 139" role="img" aria-label="Büyük '+ders.upper+' ve küçük '+ders.lower+'">'+
    '<defs><clipPath id="'+kesit+'"><rect class="alf-dolgu" x="0" y="123" width="105" height="0"/></clipPath></defs>'+
    '<g transform="translate(6 1)">'+temel+'<g clip-path="url(#'+kesit+')">'+dolu+'</g></g><g transform="translate(108 1)">'+kucuk+'</g></svg>'+
    '<div class="alf-resim-cebi" aria-hidden="true"><span class="alf-ses-halka" aria-hidden="true"></span><img class="alf-ses-nesnesi" src="'+resim(ders.id)+'" alt="" draggable="false"><span class="alf-cep-on"><b class="alf-cep-harf">'+ders.upper+'</b></span></div></div>'+
    '<div class="alf-soyle-alt"><div class="alf-soyle-sira"><svg class="alf-mik-isaret" aria-hidden="true" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="11" y="3" width="6" height="13" rx="3"/><path d="M7 12v2a7 7 0 0 0 14 0v-2M14 21v4m-4 0h8"/></svg><p class="alf-soyle-durum" role="status"></p></div><div class="alf-soyle-dugmeler">'+
    '<button type="button" class="alf-mik" hidden aria-label="Mikrofonla dene">'+IKON.mikrofon+'</button><button type="button" class="alf-yardim" hidden aria-label="Dokunarak devam et">'+IKON.oyna+'<span>Dokunarak devam et</span></button></div></div></div>'+
    '<button type="button" class="alf-yine" aria-label="Ceren’i yeniden dinle">'+IKON.hoparlor+'</button></section>';

  const sahne=alan.querySelector<HTMLElement>('.alf-soyle')!, durum=sahne.querySelector<HTMLElement>('[role=status]')!;
  const dolgu=sahne.querySelector('rect')!;
  const tekrar=sahne.querySelector<HTMLButtonElement>('.alf-yine')!,mik=sahne.querySelector<HTMLButtonElement>('.alf-mik')!,yardim=sahne.querySelector<HTMLButtonElement>('.alf-yardim')!;
  let kapali=false,deneme=0,nesil=0,mikrofon:ReturnType<typeof mikrofonHazirla>|undefined;
  function doldur(yuzde:number){
    const oran=Math.min(1,Math.max(0,yuzde*.01));
    const h=132*oran;
    dolgu.setAttribute('y',String(123-h));dolgu.setAttribute('height',String(h));
    sahne.style.setProperty('--ses-nesne-y', String(68-76*oran)+'%');
    sahne.style.setProperty('--ses-oran', oran.toFixed(3));
  }
  function sustur(){nesil++;mikrofon?.kapat();mikrofon=undefined;cerenSustur();}
  function resmiAc(sesle:boolean){
    if(kapali||sahne.dataset.durum==='dogru')return;
    sustur();const bu=nesil;
    doldur(100);sahne.dataset.durum='dogru';tekrar.disabled=true;mik.hidden=true;yardim.hidden=true;
    durum.textContent=ders.example+'!';oyunSesi('birles');
    konus(ders.id+'-label',()=>{
      if(kapali||bu!==nesil)return;
      if(sesle)konus('success',()=>{if(!kapali&&bu===nesil)sonraki();});
      else sonraki();
    });
  }
  function dinlemeyeBasla(){
    if(kapali||document.hidden||sahne.dataset.durum==='dogru')return;
    cerenSustur();const bu=nesil;
    sahne.dataset.durum='mikrofon';durum.textContent='Mikrofon açılıyor…';
    mik.hidden=true;yardim.hidden=true;doldur(0);
    mikrofon??=mikrofonHazirla();
    mikrofon.dinle(ders.id,seviye=>{
      if(!kapali&&bu===nesil)doldur(Math.min(85,seviye));
    },sonuc=>{
      if(kapali||bu!==nesil||sahne.dataset.durum==='dogru')return;
      mikrofon=undefined;
      if(sonuc==='dogru'){
        resmiAc(true);return;
      }
      deneme++;doldur(0);
      durum.textContent=sonuc==='erisim'?'Mikrofon açılamadı.':'Birlikte yeniden deneyelim.';
      sahne.dataset.durum='yardim';
      mik.hidden=false;
      yardim.hidden=sonuc!=='erisim'&&deneme<2;
      konus(yardim.hidden?'ses-mikrofon-tekrar':'manual');
    },()=>{
      sahne.dataset.durum='dinliyor';durum.textContent='Şimdi sen söyle: '+ders.target;
    });
  }
  function ornek(){
    if(kapali||sahne.dataset.durum==='dogru')return;
    sustur();const bu=nesil;
    mikrofon=mikrofonHazirla();mikrofon.hazirla();
    sahne.dataset.durum='ornek';tekrar.disabled=false;mik.hidden=true;yardim.hidden=true;
    durum.textContent='Ceren’i dinle.';doldur(0);
    konus(ders.id+'-speak',()=>{if(!kapali&&bu===nesil)dinlemeyeBasla();});
  }
  function gorunurluk(){
    if(document.hidden){sustur();return;}
    if(kapali)return;
    if(sahne.dataset.durum==='dogru'){sonraki();return;}
    ornek();
  }
  tekrar.onclick=ornek;
  mik.onclick=ornek;
  yardim.onclick=()=>{if(sahne.dataset.durum==='yardim'&&!yardim.hidden)resmiAc(false);};
  document.addEventListener('visibilitychange',gorunurluk);
  window.addEventListener('pagehide',sustur);
  ornek();
  return ()=>{
    kapali=true;sustur();
    document.removeEventListener('visibilitychange',gorunurluk);
    window.removeEventListener('pagehide',sustur);
  };
}


