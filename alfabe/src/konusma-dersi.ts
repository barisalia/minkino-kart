import { DUDAK, sekilDizisi, zarfCikar, type AgizSekli } from '../../src/audio/dudak-mantik';
import { cerenEkKatmani, cerenTepkisi, gozKirpmayiKur } from './ceren-tepki';
import type harfler from './harfler.json';
import { kalemYollari } from './yollar';
import { mikrofonHazirla } from './mikrofon';
import { resim } from './resimler';
import { dersSesSeviyesi, medyaSeviyesiniUygula, oyunSesi } from './oyun-sesi';
import { IKON } from '../../src/ui/ikonlar';
import { bosBekleyici } from './bos-bekle';
import { An, azHareket, isikSac, kabaGore } from './canlanma';
import { sesKutusuAcik, sesKutusuCizimi } from './h14-cizimler';
import './konusma-dersi.css';

// Kasaba oyunlarının kayıtları 19 Kasım temizliğinde silindi; dışlama kalıbına gerek kalmadı.
const kayitlar = import.meta.glob<string>('../../assets/alfabe/ses/*.mp3', { query:'?url', import:'default' });
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
// Kayıt yüklenirken de Ceren konuşuyor sayılır: üst üste dokunuş sözü baştan başlatmasın.
let yukleniyor=false;
export const cerenKonusuyor=()=>yukleniyor||!!kaynak||!!medya;
/** Ceren'in bu kaydı var mı (raf kartlarının dinle düğmesi kayıt gelince görünür). */
export const cerenKaydiVar=(id:string)=>!!kayitlar['../../assets/alfabe/ses/'+id+'.mp3'];

export function cerenYuzu(sinif=''){
  const katmanlar = Object.values(pozlar).map((src,i)=>'<img src="'+src+'" alt="" draggable="false" '+(i?'hidden':'')+'>');
  // Saydam köşeler alttaki düğmeleri örtmesin diye resim dokunuşu geçirir; yalnız gövdeye denk gelen alan dokunulur.
  // Göz kırpma ve tepki pozları (Paket Harf-A1; ceren-tepki.ts): kareler gelince ayrı sarmalayıcıda eklenir.
  gozKirpmayiKur();
  return '<span class="alf-ceren '+sinif+'" role="img" aria-label="Ceren Öğretmen">'+katmanlar.join('')+cerenEkKatmani()+'<i class="alf-ceren-dokun" aria-hidden="true"></i></span>';
}

function agizGoster(poz:number){
  for (const yuz of document.querySelectorAll<HTMLElement>('.alf-ceren')){
    if (yuz.dataset.agiz===String(poz)) continue;
    yuz.dataset.agiz=String(poz);
    yuz.querySelectorAll<HTMLElement>(':scope>img').forEach((el,i)=>el.hidden=i!==poz);
  }
}

// Çocuk Ceren'e dokununca Ceren hafifçe sıçrar ve bulunduğu ekranın yönergesini yeniden söyler
// (yanındaki "Ceren'i dinle" düğmesinin işi). Konuşurken dokunulursa sözü kesilmez, yalnız sıçrar.
function cerenSicrat(yuz:HTMLElement){
  yuz.classList.remove('alf-ceren-sicra');
  void yuz.offsetWidth;
  yuz.classList.add('alf-ceren-sicra');
  yuz.addEventListener('animationend',()=>yuz.classList.remove('alf-ceren-sicra'),{once:true});
}
function dinleDugmesi(yuz:HTMLElement){
  const r=yuz.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
  let secilen:HTMLButtonElement|undefined, enYakin=Infinity;
  for(const dugme of document.querySelectorAll<HTMLButtonElement>('button[aria-label]')){
    const ad=dugme.getAttribute('aria-label')!;
    // Yazma defterinde Ceren'in işi harfi yeniden yazıp göstermektir.
    const yonerge=/dinle/i.test(ad)&&/Ceren|Yönerge/i.test(ad)||dugme.classList.contains('yz-yine');
    if(dugme.disabled||!yonerge||dugme.closest('[hidden],[inert]'))continue;
    const d=dugme.getBoundingClientRect();
    if(!d.width||!d.height)continue;
    const uzaklik=Math.hypot(d.left+d.width/2-x,d.top+d.height/2-y);
    if(uzaklik<enYakin){enYakin=uzaklik;secilen=dugme;}
  }
  return secilen;
}
document.addEventListener('click',e=>{
  const alan=(e.target as Element|null)?.closest?.('.alf-ceren-dokun');
  const yuz=alan?.parentElement;
  if(!yuz||yuz.closest('button'))return;
  cerenSicrat(yuz);
  if(cerenKonusuyor())return;
  dinleDugmesi(yuz)?.click();
});
export function cerenSustur(){
  sira++;
  yukleniyor=false;
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
    medya=ses;yukleniyor=false;
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
      kaynak=dugum;yukleniyor=false;dugum.buffer=klip.buffer;dugum.connect(cikis);
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
      catch{if(bu===sira){yukleniyor=false;agizGoster(0);sonra?.();}}
    }
  }
  yukleniyor=true;
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
  // Paket Harf-H14 (h14-cizimler.ts): çizimler gelince cep yerine Ses Kutusu; gelmeden eski görünüş.
  const kutulu=sesKutusuAcik();
  const kutuResmi=(ad:Parameters<typeof sesKutusuCizimi>[0],sinif:string)=>'<img class="'+sinif+'" src="'+sesKutusuCizimi(ad)+'" alt="" draggable="false">';
  const cep=kutulu
    ?'<div class="alf-kutu" aria-hidden="true">'+kutuResmi('kutu-arka','alf-kutu-arka')+'<span class="alf-ses-halka" aria-hidden="true"></span><img class="alf-ses-nesnesi" src="'+resim(ders.id)+'" alt="" draggable="false">'+kutuResmi('kutu-on','alf-kutu-on')+kutuResmi('kutu-kapak','alf-kutu-kapak')+'</div>'
    :'<div class="alf-resim-cebi" aria-hidden="true"><span class="alf-ses-halka" aria-hidden="true"></span><img class="alf-ses-nesnesi" src="'+resim(ders.id)+'" alt="" draggable="false"><span class="alf-cep-on"><b class="alf-cep-harf">'+ders.upper+'</b></span></div>';
  alan.innerHTML='<section class="alf-soyle'+(kutulu?' alf-kutulu':'')+'" data-durum="ornek">'+cerenYuzu('alf-soyle-hoca')+
    '<div class="alf-soyle-ders"><div class="alf-soyle-kart"><svg viewBox="0 0 220 139" role="img" aria-label="Büyük '+ders.upper+' ve küçük '+ders.lower+'">'+
    '<defs><clipPath id="'+kesit+'"><rect class="alf-dolgu" x="0" y="123" width="105" height="0"/></clipPath></defs>'+
    '<g transform="translate(6 1)">'+temel+'<g clip-path="url(#'+kesit+')">'+dolu+'</g></g><g transform="translate(108 1)">'+kucuk+'</g></svg>'+
    cep+'</div>'+
    '<div class="alf-soyle-alt"><div class="alf-soyle-sira"><svg class="alf-mik-isaret" aria-hidden="true" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="11" y="3" width="6" height="13" rx="3"/><path d="M7 12v2a7 7 0 0 0 14 0v-2M14 21v4m-4 0h8"/></svg><p class="alf-soyle-durum" role="status"></p></div><div class="alf-soyle-dugmeler">'+
    '<button type="button" class="alf-mik" hidden aria-label="Mikrofonla dene">'+IKON.mikrofon+'</button><button type="button" class="alf-yardim" hidden aria-label="Dokunarak devam et">'+IKON.oyna+'<span>Dokunarak devam et</span></button></div></div></div>'+
    '<button type="button" class="alf-yine" aria-label="Ceren’i yeniden dinle">'+IKON.hoparlor+'</button></section>';

  const sahne=alan.querySelector<HTMLElement>('.alf-soyle')!, durum=sahne.querySelector<HTMLElement>('[role=status]')!;
  if(kutulu)sahne.querySelector('.alf-soyle-hoca')?.insertAdjacentHTML('beforeend',
    '<b class="alf-ceren-poz" data-poz="dinliyor">'+kutuResmi('ceren-dinliyor','')+'</b><b class="alf-ceren-poz" data-poz="alkis">'+kutuResmi('ceren-alkis','')+'</b>');
  const dolgu=sahne.querySelector('rect')!;
  const tekrar=sahne.querySelector<HTMLButtonElement>('.alf-yine')!,mik=sahne.querySelector<HTMLButtonElement>('.alf-mik')!,yardim=sahne.querySelector<HTMLButtonElement>('.alf-yardim')!;
  let kapali=false,deneme=0,nesil=0,mikrofon:ReturnType<typeof mikrofonHazirla>|undefined;
  const an=new An();
  function doldur(yuzde:number){
    const oran=Math.min(1,Math.max(0,yuzde*.01));
    const h=132*oran;
    dolgu.setAttribute('y',String(123-h));dolgu.setAttribute('height',String(h));
    sahne.style.setProperty('--ses-nesne-y', String(68-76*oran)+'%');
    sahne.style.setProperty('--ses-oran', oran.toFixed(3));
  }
  // Mikrofon yardımı açıkken çocuk bir şey yapmazsa Ceren yönlendirmeyi yineler, düğme hafifçe sallanır.
  const bos=bosBekleyici(()=>{
    if(!kapali&&sahne.dataset.durum==='dokun'){kutuSalla();konus('soyle-kutu-dokun',dokunBekle);return;}
    if(kapali||sahne.dataset.durum!=='yardim')return;
    const dugme=yardim.hidden?mik:yardim;
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){dugme.classList.remove('alf-durt');void dugme.offsetWidth;dugme.classList.add('alf-durt');}
    konus(yardim.hidden?'ses-mikrofon-tekrar':'manual',yardimdaBekle);
  });
  function yardimdaBekle(){if(!kapali&&sahne.dataset.durum==='yardim')bos.kur();}
  // Ses Kutusu, mikrofonsuz yol: yazılı düğme yerine çocuk kutuya dokunur, her dokunuşta Ceren'le birlikte söyler
  // (Ceren sözcüğü söyler, kutu üçte bir dolar). Üçüncü dokunuşta kutu açılır. Okuma gerektirmez.
  let dokunus=0;
  function dokunBekle(){if(!kapali&&sahne.dataset.durum==='dokun')bos.kur();}
  function kutuSalla(){
    const kutu=sahne.querySelector<HTMLElement>('.alf-kutu');
    if(!kutu||azHareket())return;
    an.hareket(kutu,[{transform:'none'},{transform:'rotate(-5deg) translateY(-3%)',offset:.25},{transform:'rotate(4deg)',offset:.55},{transform:'rotate(-2deg)',offset:.8},{transform:'none'}],{duration:520,easing:'ease-in-out'});
  }
  function dokunmayaGec(){
    dokunus=0;doldur(0);sahne.dataset.durum='dokun';yardim.hidden=true;
    durum.textContent='Kutuya dokun, Ceren’le birlikte söyle.';
    kutuSalla();konus('soyle-kutu-dokun',dokunBekle);
  }
  function sustur(){bos.dur();nesil++;mikrofon?.kapat();mikrofon=undefined;cerenSustur();}
  function resmiAc(sesle:boolean){
    if(kapali||sahne.dataset.durum==='dogru')return;
    sustur();const bu=nesil,bas=performance.now();
    doldur(100);sahne.dataset.durum='dogru';tekrar.disabled=true;mik.hidden=true;yardim.hidden=true;
    durum.textContent=ders.example+'!';oyunSesi('birles');dogruAni();
    if(kutulu){sahne.classList.add('alf-alkis');an.sonra(1700,()=>sahne.classList.remove('alf-alkis'));}
    konus(ders.id+'-label',()=>{
      if(kapali||bu!==nesil)return;
      if(sesle)konus('success',()=>{if(!kapali&&bu===nesil)sonraki();});
      // Dokunarak geçilince de an görünsün: sonraki adım en erken 1,15 sn sonra açılır.
      else an.sonra(Math.max(0,1150-(performance.now()-bas)),()=>{if(!kapali&&bu===nesil)sonraki();});
    });
  }
  // Doğru anı (Keşfet, Mıknatıslar ve boyama ile aynı dil, canlanma.ts): resim cepten çıkarken çevresinde ışık halesi ve
  // yıldızlar parlar, büyük harf sevinçle zıplar, parıltı sesi duyulur. Ceren'in sözü ve ders akışı aynı.
  function dogruAni(){
    if(azHareket())return;
    const harfler=kart.querySelector('svg')!,nesne=kabaGore(kart,sahne.querySelector('.alf-ses-nesnesi')!),yazi=kabaGore(kart,harfler);
    an.hareket(harfler,[{transform:'none'},{transform:'translateY(-3%) scale(1.07)',offset:.4},{transform:'translateY(.5%) scale(.99,1.01)',offset:.75},{transform:'none'}],{duration:480,easing:'ease-out'});
    an.sonra(160,()=>{
      isikSac(an,kart,nesne.cx,nesne.cy,{adet:8,uzaklik:nesne.w*.78,boy:Math.max(26,nesne.w*.32),sure:900});
      oyunSesi('parilti');
    });
    an.sonra(300,()=>isikSac(an,kart,yazi.x+yazi.w*.27,yazi.cy,{adet:7,uzaklik:yazi.h*.42,boy:Math.max(20,yazi.h*.14)}));
  }
  function dinlemeyeBasla(){
    if(kapali||document.hidden||sahne.dataset.durum==='dogru')return;
    cerenSustur();const bu=nesil;
    sahne.dataset.durum='mikrofon';durum.textContent='Mikrofon açılıyor…';
    mik.hidden=true;yardim.hidden=true;doldur(0);
    mikrofon??=mikrofonHazirla(deneme>0);
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
      if(kutulu&&!yardim.hidden){dokunmayaGec();return;}
      konus(yardim.hidden?'ses-mikrofon-tekrar':'manual',yardimdaBekle);
    },()=>{
      sahne.dataset.durum='dinliyor';durum.textContent='Şimdi sen söyle: '+ders.target;
      // Çocuk konuşurken Ceren elini kulağına götürüp dinler (Paket Harf-A2-ek "dinliyor" pozu; kare yoksa değişmez).
      cerenTepkisi(sahne.querySelector<HTMLElement>('.alf-ceren')??undefined,'dinliyor',3200);
    });
  }
  function ornek(){
    if(kapali||sahne.dataset.durum==='dogru')return;
    sustur();const bu=nesil;
    mikrofon=mikrofonHazirla(deneme>0);mikrofon.hazirla();
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
  // Harf kartına dokunuş zıplatır. Mikrofon dinlerken ses çalınmaz (yanlış "duydum" olmasın);
  // yalnız yardım beklerken harfin sesi duyulur.
  const kart=sahne.querySelector<HTMLElement>('.alf-soyle-kart')!;
  kart.onclick=()=>{
    kart.classList.remove('alf-kart-zipla');void kart.offsetWidth;kart.classList.add('alf-kart-zipla');
    if(!kapali&&sahne.dataset.durum==='dokun'){
      bos.dur();cerenSustur();dokunus++;doldur(Math.min(100,dokunus*34));kutuSalla();oyunSesi('damla');
      if(dokunus>=3){resmiAc(false);return;}
      konus(ders.id+'-model',dokunBekle);
      return;
    }
    if(kapali||sahne.dataset.durum!=='yardim'||cerenKonusuyor())return;
    bos.dur();
    konus('mik-parca-'+ders.lower.codePointAt(0)!.toString(16),yardimdaBekle);
  };
  tekrar.onclick=ornek;
  mik.onclick=ornek;
  yardim.onclick=()=>{if(sahne.dataset.durum==='yardim'&&!yardim.hidden)resmiAc(false);};
  document.addEventListener('visibilitychange',gorunurluk);
  window.addEventListener('pagehide',sustur);
  ornek();
  return ()=>{
    kapali=true;bos.kapat();sustur();an.durdur();
    document.removeEventListener('visibilitychange',gorunurluk);
    window.removeEventListener('pagehide',sustur);
  };
}


