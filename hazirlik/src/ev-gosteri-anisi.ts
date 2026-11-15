import {patiAlkisi,ayakSesi,salonAlkisi} from '../../src/audio/sahne-ortami';
import type {BandoKaydi} from '../../src/audio/bando';
import {fonuBeklet} from '../../src/audio/muzik';
import {sesiAc} from '../../src/audio/ses';
import {simge} from './cizim';
import {kupaKazandi,siirMi,kurdeleli,konserMi,dortlu,notaVurusu,programDeseni,type SahneAnisi} from './gosteri-kaydi';
import {konserCalgisi,cevapNotasi,kaydiHazirla,sahneMuzigi,tempo} from './gosteri-muzigi';
import {ritimTusu} from './gosteri-muzigi';
import {tohumIkilisi,pozlar,pozOynat,sahneIkon} from './gosteri-sahnesi';
import {dansCumlesi,kinoVokali,sonDansAdimlari,dansKartlari,dansPozlari,ikiliHareketi,birlikteKapanis,kendiDansKesiti,kinoDansKartlari,sarkiSelami} from './gosteri-koreografi';

// Anı kartı ayrı bir karakter illüstrasyonu değil: çocuğun oynadığı sahnenin
// aynı fon ve gerçek pozlarından küçük bir dondurulmuş karedir.
export function gosteriFotografi(h:SahneAnisi,res:(n:string)=>string){
  const kazan=kupaKazandi(h),dans=h.dal==='dans',sari=h.renk==='sari',desen=programDeseni(h.dal,h.program);
  const son=h.dokunuslar.filter(d=>desen[d.sira]===d.el).at(-1)?.el;
  const hareket=h.dansDizisi?.at(-1)??son;
  const dansKaresi=dans&&hareket!==undefined;
  const kino=dansKaresi?kinoDansKartlari(h.renk)[hareket]:kazan?'kino-kupa-'+h.renk+'-3':'kino-'+(sari?'sari-':'')+h.dal+'-'+(son===undefined?0:son?0:3);
  const zip=dansKaresi?dansKartlari[hareket]:kazan?'zip-selam-3':'zip-'+h.dal+'-'+(son===undefined?0:son?3:0);
  return '<span class="ev-sahne-fotografi" aria-hidden="true">'+res('kres/sahne-fon')+res('kres/'+kino)+res('kres/'+zip)+'</span>';
}

// Albümün gösterdiği kesit orijinal tempoda, dört tam ölçüdür. En çok
// etkileşim duyulan bölümü alır; eşitlikte iki arkadaşın nakaratını seçer.
export function albumKesiti(h:SahneAnisi){
  const anlar=h.dokunuslar.filter(d=>programDeseni(h.dal,h.program)[d.sira]===d.el)
    .map(d=>({vurus:notaVurusu(d.sira,h.program,h.dal)+d.fark,el:d.el})).sort((a,b)=>a.vurus-b.vurus);
  const kesit=[4,12,20,32,40,48].map(bas=>({bas,iz:anlar.filter(d=>d.vurus>=bas&&d.vurus<bas+16)}))
    .sort((a,b)=>b.iz.length-a.iz.length||b.bas-a.bas)[0];
  return kesit;
}
export function aniyiOynat(alan:HTMLElement,h:SahneAnisi,res:(n:string)=>string,sus:()=>void,once:HTMLElement){
  const ritimli=h.dal==='sarki'&&(konserMi(h.program)||h.sesliYanki===true);
  const kutu=document.createElement('dialog');kutu.className='ev-ani-salonu';kutu.setAttribute('aria-label','Kino ile Zıpzıp’ın o günkü gösterisinden');
  const dizi=h.dal==='dans'?h.dansDizisi:undefined;
  const ek=(kim:'kino'|'zip')=>h.dal==='dans'&&(dortlu(h.program)||dizi?.length)?dansPozlari(kim,h.renk):[];
  const dans=h.dal==='dans',oyun=document.createElement('div');oyun.className='ev-ani-perdesi';
  oyun.innerHTML='<picture><source media="(max-aspect-ratio:1/1)" srcset="'+new URL('../../assets/hazirlik/kres/sahne-fon-dik.webp',import.meta.url).href+'"><img alt="" src="'+new URL('../../assets/hazirlik/kres/sahne-fon.webp',import.meta.url).href+'"></picture>'+
    '<div class="gosteri-ikili">'+(siirMi(h.program)?tohumIkilisi(res):pozlar('kino-'+(h.renk==='sari'?'sari-':'')+h.dal,8,res,'kino-sol',ek('kino'))+pozlar('zip-'+h.dal,8,res,'zip-sag',ek('zip')))+'</div>';
  const iz=document.createElement('div');iz.className='ev-ani-iz';iz.setAttribute('aria-hidden','true');oyun.append(iz);
  const a=document.createElement('div');a.className='ev-ani-kumanda';
  const dugme=(ad:string,art:string,fn:()=>void)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',ad);b.innerHTML=art;b.onclick=fn;a.append(b);return b};
  const tekrar=dugme('Anıyı yeniden oynat',simge('yenile'),()=>void basla());
  const kisisel=dizi?.length?dugme('Kendi dansını albümde oynat',dansSeridi(dizi,h.renk,res),()=>void basla(true)):null;
  kisisel?.classList.add('ev-album-dansi');
  const geri=dugme('Evdeki panoya dön',simge('ev'),()=>kapat());kutu.append(oyun,a);alan.append(kutu);
  let muzik:BandoKaydi|undefined,kare=0,son=0,n=0,sira=0,kapali=false;
  let alkisiDur:(()=>void)|undefined,sesSaati=0;
  function dur(){clearTimeout(sesSaati);alkisiDur?.();alkisiDur=undefined;cancelAnimationFrame(kare);muzik?.durdur();muzik=undefined}
  function kapat(){if(kapali)return;kapali=true;sira++;dur();kutu.close();kutu.remove();fonuBeklet(false);
    document.removeEventListener('visibilitychange',gizli);window.removeEventListener('pagehide',kapat);window.removeEventListener('hazirlik-mola',kapat);
    if(once?.isConnected)once.focus({preventScroll:true});
  }
  function gizli(){if(document.hidden)kapat()}
  kutu.addEventListener('cancel',e=>{e.preventDefault();kapat()});document.addEventListener('visibilitychange',gizli);window.addEventListener('pagehide',kapat);window.addEventListener('hazirlik-mola',kapat);
  const kino=oyun.querySelector('.kino-sol'),zip=oyun.querySelector('.zip-sag');
  const dort=dortlu(h.program);
  const kapanisAdimlari=sonDansAdimlari(programDeseni(h.dal,h.program),h.dokunuslar);
  function dansEt(el:number){
    const c=dansCumlesi(el,tempo.dans),az=matchMedia('(prefers-reduced-motion: reduce)').matches;
    pozOynat(kino,az?[c.kinoTepe]:c.kino,c.ms);pozOynat(zip,az?[c.zipTepe]:c.zip,c.ms);
    if(c.ses){clearTimeout(sesSaati);sesSaati=window.setTimeout(()=>{if(!muzik||kapali||document.hidden)return;if(c.ses==='alkis')patiAlkisi();else ayakSesi(true,true)},az?0:c.temas*c.ms)}
  }
  async function basla(ozel=false){
    const {bas,iz:vuruslar}=ozel&&dizi?kendiDansKesiti(dizi):albumKesiti(h);
    const bitis=ozel?64:bas+16;
    if(kisisel)kisisel.setAttribute('aria-pressed',String(ozel));
    const surum=++sira;dur();sus();sesiAc();fonuBeklet(true);iz.replaceChildren();tekrar.disabled=true;
    await Promise.allSettled([kaydiHazirla(h.dal,siirMi(h.program)),...[...oyun.querySelectorAll('img')].map(im=>im.decode())]);
    if(kapali||surum!==sira||!kutu.isConnected)return;
    const vokal=dort&&!dans?kinoVokali(kino!,h.renk,siirMi(h.program)?'kino':undefined):null;
    const tilki=siirMi(h.program)?kinoVokali(zip!,'yesil','zip'):null;
    const desen=programDeseni(h.dal,h.program);
    const davetler=ritimli?desen.map((el,i)=>({el,vurus:notaVurusu(i,h.program,h.dal)-3})).filter(d=>d.vurus>=bas&&d.vurus<bitis):[];
    const koda=ritimli?sarkiSelami(desen,h.dokunuslar):[];
    let davet=0,sonNota=-1;
    if(!vokal)pozOynat(kino,[0],140);pozOynat(zip,[0],140);son=-10;n=0;
    muzik=sahneMuzigi(h.dal,bas,bitis,dortlu(h.program),siirMi(h.program));oyun.dataset.oynuyor='evet';let izSon=-10,sonKoro=-1;delete oyun.dataset.kapanis;
    function goster(){
      if(!muzik||kapali)return;
      const b=bas+muzik.gecen()*tempo[h.dal]/60;
      vokal?.(b*60/tempo.sarki);tilki?.(b*60/tempo.sarki);
      while(davet<davetler.length&&davetler[davet].vurus<=b){
        const d=davetler[davet++];
        if(b-d.vurus<.4){ritimTusu(d.el,.5);if(!tilki)pozOynat(zip,[2,3,5,2,7],108)}
      }
      while(n<vuruslar.length&&b>=vuruslar[n].vurus){
        const el=vuruslar[n++].el;
        if(!dans)iz.innerHTML=dortlu(h.program)?[sahneIkon.gunes,sahneIkon.ay,sahneIkon.yildiz,sahneIkon.zil][el]:(el?sahneIkon.ay:sahneIkon.gunes);
        iz.dataset.el=String(el);izSon=b;
        if((ozel||dort)&&dans){dansEt(el);continue}
        const k=ikiliHareketi(h.dal,el);if(!vokal)pozOynat(kino,k.kino,k.ms);if(!tilki)pozOynat(zip,vokal?[1,2,3,5,7]:k.zip,vokal?125:k.ms);
        if(ritimli){
          ritimTusu(el);
          if(!tilki)pozOynat(zip,[7,6,4],150);
        }else if(dans){if(el===1)ayakSesi(true,true);if(el===0)patiAlkisi()}else if(dortlu(h.program))konserCalgisi(4,[72,76,79,81][el]);else cevapNotasi(!!el,vuruslar[n-1].vurus,true);
      }
      if(b-izSon>1.45)iz.replaceChildren();
      // Arkadaşın beklerken küçük bakış değişimi puan ya da vurulan nota değildir.
      if(!tilki&&n===0&&b>=bas&&b<56&&b-son>=4){pozOynat(zip,[0,1,0],225);son=b}
      const koroBas=dans&&kurdeleli(h.program)?60:dans&&konserMi(h.program)?52:56;
      if(!ozel&&b>=koroBas&&b<63.85){
        const tur=Math.floor((b-koroBas)/2);if(tur!==sonKoro){
          sonKoro=tur;oyun.dataset.kapanis='birlikte';
          if(dort&&dans)dansEt(kapanisAdimlari[tur%4]);
          else{
          const k=birlikteKapanis(h.dal,tur,tempo[h.dal]);if(!vokal)pozOynat(kino,k.kino,k.ms);if(!tilki)pozOynat(zip,k.zip,k.ms);
          if(k.ses){clearTimeout(sesSaati);sesSaati=window.setTimeout(()=>{if(kapali||document.hidden||!muzik)return;if(k.ses==='adim')ayakSesi(true,true);else patiAlkisi()},2*k.ms)}
          }
        }
      }
      if(ritimli&&b>=60&&b<64){
        const i=Math.floor(b-60),nota=koda[i];
        if(nota&&sonNota!==i){
          sonNota=i;ritimTusu(nota.el,nota.kim==='zip'?.5:1);
          if(!tilki)pozOynat(zip,nota.kim==='zip'?[2,3,5,2,7]:[7],108);
        }
      }
      if(b>=bitis){dur();tekrar.disabled=false;oyun.dataset.oynuyor='bitti';if(!ozel&&kupaKazandi(h))alkisiDur=salonAlkisi();return}
      kare=requestAnimationFrame(goster);
    }goster();
  }
  kutu.showModal();geri.focus({preventScroll:true});void basla(!!dizi?.length);return kapat;
}
export function dansSeridi(dizi:readonly number[],renk:'sari'|'yesil',res:(n:string)=>string){
  const kartlar=kinoDansKartlari(renk);
  return '<span class="ev-dans-seridi">'+dizi.map(el=>'<i>'+res('kres/'+kartlar[el])+'</i>').join('')+'<b aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#94dfbd" stroke="#262120" stroke-width="1.5"/><path d="M14 11q0-1 1.2-.3l10 6.4q1.3.9 0 1.8l-10 6.4q-1.2.7-1.2-.3z" fill="#fff7d7" stroke="#262120" stroke-width="1.4" stroke-linejoin="round"/></svg></b></span>';
}
