import {kupaKazandi} from './gosteri-kaydi';
import type {Sabah} from './model';
import type {Bolge} from './kres-servis';
import {pozlar,pozOynat} from './gosteri-sahnesi';
import {konserCalgisi as calgiSesi} from './gosteri-muzigi';
import {ayakSesi} from '../../src/audio/sahne-ortami';

/** Yan planda çantayla yürüyüş: kamera ölçeği değişmez. Oda dönüşünde
 * piksel yerine yolun yüzdesi saklandığı için konum telefona da uyar. */
export function eveYuru(alan:HTMLElement,s:Sabah,bolge:Bolge,res:(n:string)=>string,kaydet:()=>void,soyle:(id:string)=>void,gir:()=>void){
  const k=s.kres,renk=s.renk==='sari'?'sari':'yesil';
  const kupa=kupaKazandi(k.gosteri.sonuc)||!!k.bugununKupasi;
  const zilPozu='kino-zil-'+renk+(kupa?'-kupa':'');
  const donusPozu='kino-esikte-don-'+renk+(kupa?'-kupa':'');
  const kisi=bolge('yolda-kino','Kino ile kapıya yürü',pozlar(kupa?'kino-kupayla-'+renk:renk+'-canta-yuru',8,res,'ev-yol-yurume')+pozlar(zilPozu,8,res,'ev-yol-uzan')+pozlar(donusPozu,8,res,'ev-yol-don'),[19,65,20,35],yurut,'ev-oyuncu ev-yuruyen',[18,65,29,25]);
  const zil=()=>{if(k.eveYol===1)giriste();else yurut()};
  const kapi=bolge('eve-gir','Kino’nun evinin kapısını çal','',[81,51,22,50],zil,'ev-yol-kapi',[77,49,36,39]);
  const cocukZili='<svg viewBox="0 0 40 48" aria-hidden="true"><rect x="2" y="2" width="36" height="44" rx="9" fill="#e6a351" stroke="#211c1b" stroke-width="2"/><circle cx="20" cy="23" r="13" fill="#ffe399" stroke="#211c1b" stroke-width="1.7"/><g fill="#81593b"><ellipse cx="20" cy="26" rx="5" ry="3.9"/><circle cx="14.7" cy="21" r="1.9"/><circle cx="19.7" cy="18.5" r="2"/><circle cx="24.7" cy="20.7" r="1.9"/></g></svg>';
  const plaka=bolge('cocuk-zili','Kino’nun pati zili',cocukZili,[88.7,59.2,3,5.4],undefined,'ev-cocuk-zili',[92.1,57.3,5.8,3.2]);
  // Kapıdaki küçük karşılamada karakter ve dekor ayrı katmanlardır; annenin
  // ayakkabıları eşikte kalır. Kamera kesmeden önce çocuk onu görebilir.
  const acik=document.createElement('div');acik.className='ev-acilan-kapi';acik.setAttribute('aria-hidden','true');
  acik.innerHTML=res('kres/yol-acik')+res('kres/yol-acik-dik');alan.prepend(acik);
  const anne=bolge('anne-esikte','',pozlar('anne-karsilama',6,res),[76.8,48.5,12,29],undefined,'ev-esikte',[72,50.7,19,23]);
  const buyukZil=bolge('aile-zili','Kapı zilini çal','',[88.7,48.6,7,12],zil,'ev-buyuk-zil',[92.1,49,13,8]);
  buyukZil.tabIndex=-1;buyukZil.setAttribute('aria-hidden','true');
  anne.setAttribute('aria-hidden','true');anne.hidden=true;acik.hidden=true;
  const yuruyen=kisi.querySelector<HTMLElement>('.ev-yol-yurume')!,uzanan=kisi.querySelector<HTMLElement>('.ev-yol-uzan')!;
  const resimler=[...yuruyen.querySelectorAll('img')],zilResimleri=[...uzanan.querySelectorAll('img')];
  const temas={x:.978,y:kupa?(renk==='sari'?.38:.44):renk==='sari'?.46:.463};
  let film=0,bas=0,ara=k.eveYol,kare=-1,giriyor=false,kapatildi=false,gecis=0;
  const portre=()=>matchMedia('(max-aspect-ratio:1/1)').matches;
  function yerlestir(p:number,n:number){
    const alanR=alan.getBoundingClientRect(),P=portre(),h=P?14.5:19;
    // Parmağın gerçek uç pikselini düğmeye oturt. En-boy oranı değişse bile
    // elin uzanma mesafesi aynı perspektif içinde kalır.
    const im=zilResimleri[4],oran=im.naturalWidth&&im.naturalHeight?im.naturalWidth/im.naturalHeight:.7;
    const sonX=(P?92.1:88.7)-h*alanR.height/Math.max(1,alanR.width)*oran*(temas.x-.5);
    const sonY=(P?57.3:59.2)+h*(.5-temas.y);
    const basX=P?18:19,basH=P?25:35,t=Math.max(0,Math.min(1,(p-.23)/.77)),derinlik=t*t*(3-2*t);
    for(const [ad,deger] of [['x',basX+(sonX-basX)*p],['y',65+(sonY-65)*derinlik],['h',basH+(h-basH)*derinlik]] as const){
      kisi.style.setProperty('--'+ad,deger+'%');kisi.style.setProperty('--d'+ad,deger+'%');
    }
    kisi.classList.toggle('kapida',p===1);
    if(n!==kare){resimler.forEach((im,i)=>im.style.visibility=i===n?'visible':'hidden');kare=n}
    if(p===1){
      kapi.classList.add('zil-hazir');kisi.setAttribute('aria-label','Kapıyı çal');
      if(!alan.querySelector('[data-kres=ev-zili]')){
        bolge('ev-zili','Kapının yanındaki zile bas','<span class="ev-zil-sesi" aria-hidden="true"><i></i><i></i></span>',[88.7,59.2,7,11],zil,'ev-zil-noktasi',[92.1,57.3,13,8]);
      }
    }
  }
  function yurut(){
    if(giriyor||kapatildi||film)return;if(k.eveYol===1){giriste();return}
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){k.eveYol=1;yerlestir(1,2);kaydet();soyle('kino_eve_zil');return}
    const r=alan.getBoundingClientRect(),p=k.eveYol;
    const yol=r.width*.68,adim=Math.max(13,r.height*(portre()?.19:.26)*.52),sure=Math.max(1700,yol/adim*8*102);
    ara=p;bas=performance.now();let kayitAn=bas,sonTemas=Math.floor(p*yol/adim*2);
    function yuru(t:number){
      if(kapatildi)return;
      if(document.hidden){film=0;kaydet();return}
      const oran=Math.min(1,ara+(t-bas)/sure),n=oran===1?2:Math.floor((oran*yol/adim)*8)%8;
      const temas=Math.floor(oran*yol/adim*2);
      if(oran<1&&temas!==sonTemas){sonTemas=temas;ayakSesi(temas%2===0)}
      yerlestir(oran,n);k.eveYol=oran;
      if(oran===1){film=0;kaydet();soyle('kino_eve_zil');return}
      if(t-kayitAn>420){kaydet();kayitAn=t}film=requestAnimationFrame(yuru);
    }
    film=requestAnimationFrame(yuru);
  }
  function giriste(){
    if(giriyor||kapatildi)return;giriyor=true;
    pozOynat(uzanan,matchMedia('(prefers-reduced-motion: reduce)').matches?[4]:[0,1,2,3,4,5,6,7],135);
    gecis=window.setTimeout(()=>{
    if(kapatildi||!giriyor)return;
    alan.querySelector('.ev-zil-sesi')?.classList.add('caldi');plaka.classList.add('basildi');calgiSesi(3,76);gecis=window.setTimeout(()=>{
      if(kapatildi)return;calgiSesi(3,72);
      gecis=window.setTimeout(async()=>{
        if(kapatildi||!giriyor)return;
        const fon=acik.children[portre()?1:0] as HTMLImageElement;
        if(!fon.complete||!fon.naturalWidth){
          try{await fon.decode()}catch{if(!kapatildi&&giriyor)gir();return}
          if(kapatildi||!giriyor)return;
        }
        plaka.classList.remove('basildi');pozOynat(uzanan,[7],135);acik.hidden=false;anne.hidden=false;alan.dataset.esik='acik';
        pozOynat(kisi.querySelector('.ev-yol-don'),[0,1,2,3,4,5,6,7],155);
        pozOynat(anne.firstElementChild,[0,1,2,3,4,4],230);
        soyle('anne_eve_kapida');
        gecis=window.setTimeout(()=>{if(!kapatildi&&giriyor)gir()},2550);
      },410);
    },290);
    },matchMedia('(prefers-reduced-motion: reduce)').matches?70:540);
  }
  yerlestir(k.eveYol,2);
  const hizala=()=>{if(!kapatildi)yerlestir(k.eveYol,kare<0?2:kare)};
  const boyut=new ResizeObserver(hizala);boyut.observe(alan);void zilResimleri[4].decode().then(hizala,()=>{});
  function mola(){cancelAnimationFrame(film);film=0;clearTimeout(gecis);giriyor=false;acik.hidden=true;anne.hidden=true;plaka.classList.remove('basildi');pozOynat(uzanan,[0],135);delete alan.dataset.esik;kaydet()}
  window.addEventListener('hazirlik-mola',mola);
  return ()=>{kapatildi=true;boyut.disconnect();window.removeEventListener('hazirlik-mola',mola);cancelAnimationFrame(film);clearTimeout(gecis)};
}
