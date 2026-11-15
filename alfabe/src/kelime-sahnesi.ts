import { IKON } from '../../src/ui/ikonlar';
import { efektCikisi, sesMotorunuAc } from '../../src/audio/motor';
import { oyunSesi } from './oyun-sesi';
import './kelime-sahnesi.css';

type Esya = 'zil' | 'pil' | 'tas' | 'kaya';
type Sahne = {
  dogru: Esya; secenek: Esya[]; fon: string;
  baslik: string; kesif: string; degisen: number;
};
const sahneler: Sahne[] = [
  {dogru:'zil', secenek:['pil','zil'], fon:'salon', baslik:'Tiyatro başlıyor', kesif:'Kapalı tiyatro kapısını ve perdeyi keşfet', degisen:0},
  {dogru:'pil', secenek:['zil','pil'], fon:'kulis', baslik:'Kulis karanlık', kesif:'Sönük el fenerini dene', degisen:0},
  {dogru:'tas', secenek:['tas','kaya'], fon:'bahce', baslik:'Kuşların su kabı', kesif:'Su bekleyen kuşu dinle', degisen:2},
];
const adlar:Record<Esya,string>={zil:'ZİL',pil:'PİL',tas:'TAS',kaya:'TAŞ'};
const gorseller=import.meta.glob<string>('../../assets/alfabe/macera/sahne-*.webp',{eager:true,query:'?url',import:'default'});
const resim=(ad:string)=>gorseller['../../assets/alfabe/macera/sahne-'+ad+'.webp'];
const gorsel=(ad:string,sinif='')=>'<img class="'+sinif+'" src="'+resim(ad)+'" alt="" draggable="false">';
const kelime=(ad:string,vurgu:number)=>Array.from(ad,(h,i)=>i===vurgu?'<strong>'+h+'</strong>':'<span>'+h+'</span>').join('');

function zilSesi() {
  const ctx = sesMotorunuAc(), cikis = efektCikisi();
  if (!ctx || !cikis) return;
  for (const vur of [0,.26,.61]) {
    for (const [hz,guc,uzunluk] of [[940,.055,.64],[1875,.026,.4],[2510,.013,.27]]) {
      const dalga=ctx.createOscillator(), ses=ctx.createGain(), t=ctx.currentTime+vur;
      dalga.frequency.value=hz; ses.gain.setValueAtTime(.0001,t);
      ses.gain.exponentialRampToValueAtTime(guc,t+.008); ses.gain.exponentialRampToValueAtTime(.0001,t+uzunluk);
      dalga.connect(ses).connect(cikis); dalga.onended=()=>{dalga.disconnect();ses.disconnect();};
      dalga.start(t);dalga.stop(t+uzunluk);
    }
  }
}
function suSesi(){
  const ctx=sesMotorunuAc(),cikis=efektCikisi();
  if(!ctx||!cikis)return;
  const sure=.82,bas=ctx.currentTime,ses=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*sure),ctx.sampleRate);
  const ornekler=ses.getChannelData(0);
  for(let i=0;i<ornekler.length;i++)ornekler[i]=Math.random()*2-1;
  const kaynak=ctx.createBufferSource(),filtre=ctx.createBiquadFilter(),seviye=ctx.createGain();
  kaynak.buffer=ses;filtre.type='bandpass';filtre.Q.value=.8;filtre.frequency.setValueAtTime(1390,bas);
  filtre.frequency.linearRampToValueAtTime(2030,bas+sure);
  seviye.gain.setValueAtTime(.0001,bas);seviye.gain.linearRampToValueAtTime(.12,bas+.14);
  seviye.gain.linearRampToValueAtTime(.09,bas+.58);seviye.gain.exponentialRampToValueAtTime(.0001,bas+sure);
  kaynak.connect(filtre).connect(seviye).connect(cikis);
  kaynak.onended=()=>{kaynak.disconnect();filtre.disconnect();seviye.disconnect();};kaynak.start();
}
function kusSesi(){
  const ctx=sesMotorunuAc(),cikis=efektCikisi();
  if(!ctx||!cikis)return;
  for(const [gecikme,ilk,son] of [[0,1880,2690],[.13,2150,2960]]){
    const bas=ctx.currentTime+gecikme,dalga=ctx.createOscillator(),ses=ctx.createGain();
    dalga.frequency.setValueAtTime(ilk,bas);dalga.frequency.exponentialRampToValueAtTime(son,bas+.084);
    ses.gain.setValueAtTime(.0001,bas);ses.gain.exponentialRampToValueAtTime(.033,bas+.018);ses.gain.exponentialRampToValueAtTime(.0001,bas+.105);
    dalga.connect(ses).connect(cikis);dalga.onended=()=>{dalga.disconnect();ses.disconnect();};dalga.start(bas);dalga.stop(bas+.105);
  }
}
export function kelimeSahnesiKur(container:HTMLElement,oku:(id:string,sonra?:()=>void)=>void,bitir:()=>void,tercih?:string):()=>void{
  const baslangic:Record<string,number>={'29':0,'20':1,'22':2,'23':2,'24':2};
  const tek=tercih!==undefined&&Object.hasOwn(baslangic,tercih);
  let sira=tek?baslangic[tercih!]:0,surum=0,kapali=false;
  const zamanlar=new Set<number>(),bolum=document.createElement('section');
  bolum.className='ks-tiyatro';container.replaceChildren(bolum);
  function gecersizKil(){surum++;for(const no of zamanlar)clearTimeout(no);zamanlar.clear();}
  function sonra(ms:number,calis:()=>void){
    const a=surum;
    const no=window.setTimeout(()=>{zamanlar.delete(no);if(!kapali&&a===surum)calis();},ms);
    zamanlar.add(no);
  }
  function okuGorev(){oku('sahne-'+sahneler[sira].dogru+'-gorev');}
  function kelimeGoster(esya?:Esya){
    const s=sahneler[sira],harfler=[...adlar[s.dogru]];
    harfler[s.degisen]='_';
    const yaz=esya?adlar[esya]:harfler.join('');
    const pano=bolum.querySelector<HTMLElement>('.ks-kelime')!;
    pano.innerHTML=kelime(yaz,s.degisen);
    pano.setAttribute('aria-label',esya?yaz:(s.degisen?'Son harfi eksik kelime':'İlk harfi eksik kelime'));
  }
  function kesfet(){
    if(bolum.dataset.adim!=='sec')return;
    const pencere=bolum.querySelector<HTMLElement>('.ks-pencere')!;
    pencere.classList.remove('ks-kesfedildi');void pencere.offsetWidth;
    pencere.classList.add('ks-kesfedildi');
    if(sira===0){oyunSesi('kutu');sonra(115,()=>oyunSesi('kutu'));}
    if(sira===1){oyunSesi('miknatis');sonra(125,()=>oyunSesi('miknatis'));}
    if(sira===2)kusSesi();
    sonra(240,okuGorev);
  }
  function sahneKur(){
    gecersizKil();
    const s=sahneler[sira];bolum.dataset.sahne=s.fon;bolum.dataset.adim='sec';
    bolum.setAttribute('aria-label',s.baslik);
    bolum.innerHTML='<div class="ks-pencere"><div class="ks-cizim">'+gorsel(s.fon,'ks-fon')+
      (sira===0?gorsel('salon-acik','ks-kapi'):'')+
      (sira===1?'<div class="ks-isin"></div><div class="ks-yildiz"></div>'+gorsel('fener','ks-fener'):'')+
      (sira===2?'<div class="ks-su"></div><div class="ks-akis"></div><div class="ks-kus">'+[0,1,2,3].map(i=>gorsel('kus-'+i,'ks-kanat ks-kanat-'+i)).join('')+'</div>':'')+
      '<div class="ks-nesne" hidden></div><button class="ks-kesfet" type="button" aria-label="'+s.kesif+'"></button></div>'+
      '<div class="ks-noktalar" role="img" aria-label="'+(tek?'Harf dersi':'Sahne '+(sira+1)+' / 3')+'">'+(tek?[sira]:[0,1,2]).map(i=>'<i class="'+(i<=sira?'ks-dolu':'')+'"></i>').join('')+'</div>'+
      '<button class="ks-dinle" type="button" aria-label="Ceren Öğretmen’i dinle">'+IKON.hoparlor+'</button>'+
      '<div class="ks-alt"><div class="ks-kelime" role="status"></div><div class="ks-secimler">'+s.secenek.map(e=>'<button type="button" class="ks-sec" data-esya="'+e+'" aria-label="'+adlar[e]+' kelimesini seç">'+gorsel(e)+'<span>'+kelime(adlar[e],s.degisen)+'</span></button>').join('')+'</div></div></div>';
    bolum.querySelector<HTMLButtonElement>('.ks-kesfet')!.onclick=kesfet;
    bolum.querySelector<HTMLButtonElement>('.ks-dinle')!.onclick=okuGorev;
    bolum.querySelectorAll<HTMLButtonElement>('.ks-sec').forEach(btn=>{btn.onclick=()=>sec(btn.dataset.esya as Esya);});
    kelimeGoster();
    okuGorev();
  }
  function sec(esya:Esya){
    if(kapali||bolum.dataset.adim!=='sec')return;
    gecersizKil();const bu=surum,s=sahneler[sira],dogru=esya===s.dogru;
    const pencere=bolum.querySelector<HTMLElement>('.ks-pencere')!,nesne=bolum.querySelector<HTMLElement>('.ks-nesne')!;
    bolum.dataset.adim='hareket';kelimeGoster(esya);
    bolum.querySelector<HTMLElement>('.ks-secimler')!.hidden=true;
    for(const dugme of bolum.querySelectorAll<HTMLButtonElement>('.ks-kesfet,.ks-dinle'))dugme.disabled=true;
    nesne.hidden=false;nesne.className='ks-nesne ks-'+esya;nesne.innerHTML=gorsel(esya);
    pencere.className='ks-pencere ks-hareket-'+esya;
    if(esya==='zil')zilSesi();
    else if(esya==='pil')sonra(650,()=>oyunSesi(dogru?'miknatis':'kutu'));
    else if(esya==='kaya')sonra(610,()=>oyunSesi('kutu'));
    else{sonra(615,suSesi);sonra(1700,kusSesi);}
    let animasyonBitti=false,sesBitti=false;
    function tamamla(){
      if(kapali||surum!==bu||!animasyonBitti||!sesBitti)return;
      gecersizKil();
      if(dogru){
        if(tek||sira===sahneler.length-1){temizle();bitir();return;}
        sira++;sahneKur();
      }else{
        bolum.dataset.adim='sec';kelimeGoster();pencere.className='ks-pencere';nesne.hidden=true;
        bolum.querySelector<HTMLElement>('.ks-secimler')!.hidden=false;
        for(const dugme of bolum.querySelectorAll<HTMLButtonElement>('.ks-kesfet,.ks-dinle'))dugme.disabled=false;
        bolum.querySelector<HTMLButtonElement>('.ks-sec')!.focus({preventScroll:true});
      }
    }
    // Finish the child's action and Ceren's response before changing sets.
    sonra(520,()=>oku('sahne-'+s.dogru+(dogru?'-evet':'-hayir'),()=>{sesBitti=true;tamamla();}));
    sonra(esya==='tas'?2200:1600,()=>{animasyonBitti=true;tamamla();});
    // A suspended mobile audio context may never dispatch onended. Every response is under six seconds.
    sonra(10500,()=>{sesBitti=true;tamamla();});
  }
  function temizle(){if(kapali)return;kapali=true;gecersizKil();bolum.remove();}
  sahneKur();return temizle;
}