import {restoranKarakterleri as konuklar,karakterAdlari as adlar,type RestoranKarakteri} from './restoran-karakterleri';
import {h} from '../../src/ui/dom';
import {salonSesiniCal} from './misafir';
import {dugme,ikon} from './gorsel';
import {restoranOyuncusu} from './restoran-oyuncusu';
import './restoran-salonu.css';

const salonResmi=new URL('../../assets/sef/salon/salon.webp',import.meta.url).href;
const masaResmi=new URL('../../assets/sef/salon/masa.webp',import.meta.url).href;
const kapiResmi=new URL('../../assets/sef/salon/giris-kapisi.webp',import.meta.url).href;
type Sahne='gelis'|'siparis'|'bekleme'|'servis'|'cikis';
export function kapidanSalon(misafir:keyof typeof konuklar){
  const konuk=restoranOyuncusu(konuklar[misafir],'otur',undefined,true);
  konuk.setAttribute('aria-hidden','true');
  return h('span.kapi-salon',{'aria-hidden':'true'},
    h('span.kapi-icerisi',{},h('img.kapi-duvar',{src:salonResmi,alt:'',draggable:false}),konuk,h('img.kapi-masa',{src:masaResmi,alt:'',draggable:false})),
    h('img.kapi-cercevesi',{src:kapiResmi,alt:'',draggable:false}));
}
export function salonuKur(sahne:HTMLElement,misafir:keyof typeof konuklar,sira:number,evre:Sahne,sesli:()=>boolean,bitir?:()=>void,aile=false){
  sahne.dataset.salon=evre;
  const kim=konuklar[misafir];
  const arkadas:'kino'|'anne'=misafir==='corba'?'kino':'anne';
  const birlikte=aile||misafir==='corba'||misafir==='baba'||(misafir!=='kino'&&misafir!=='anne'&&sira%3===1);
  sahne.dataset.birlikte=String(birlikte);
  sahne.style.setProperty('--sofra-misafiri-x',birlikte?'64%':'56%');
  const dekor=h('div.salon-dekor',{'aria-label':'Restoran salonu'},h('img.salon-duvar',{src:salonResmi,alt:'',draggable:false}));
  const masa=h('img.salon-masa',{src:masaResmi,alt:'',draggable:false});
  const hareketli=evre==='gelis'||evre==='cikis';
  let kapali=false,tamam=false,saat=0,konukHazir=!birlikte,asciHazir=false;
  const sonaGit=()=>{if(!kapali&&!tamam&&asciHazir&&konukHazir&&sahne.isConnected){tamam=true;bitir?.();}};
  function yer(k:RestoranKarakteri,arkadasMi:boolean,mod:'gelis'|'otur'|'cikis'=hareketli?evre==='cikis'?'cikis':'gelis':'otur'){
    const oyuncu=restoranOyuncusu(k,mod,()=>{
      if(arkadasMi)konukHazir=true;else asciHazir=true;sonaGit();
    });
    oyuncu.classList.add('salon-figur');
    oyuncu.style.setProperty('--misafir-x',birlikte?(arkadasMi?'47%':'64%'):'56%');
    oyuncu.style.setProperty('--misafir-oturak-y','63.5%');
    if(arkadasMi)oyuncu.classList.add('salon-arkadas');
    if(!hareketli){
      const dugmeVar=arkadasMi?null:sahne.querySelector<HTMLButtonElement>(evre==='servis'?'.tepsi-alici':'.restoran-konusan');
      const aileSes=aile&&evre==='bekleme'&&(k==='kino'||k==='anne');
      const dinle=arkadasMi||aileSes?dugme(adlar[k]+' ile konuş','salon-sohbet',ikon('hoparlor')):dugmeVar;
      if(dinle){
        if(aileSes){
          dinle.onclick=()=>{if(sesli())void salonSesiniCal(k,k==='anne'?'anne-aile-limon':'kino-restoran-aile-kahvaltisi');};
        }else if(arkadasMi){
          const replikler=evre==='servis'?['son']:evre==='bekleme'?['bekle']:['selam','bekle'];
          let i=0,konusuyor=false;
          dinle.onclick=async()=>{
            if(!sesli()||konusuyor)return;
            konusuyor=true;
            try{await salonSesiniCal(arkadas,arkadas+'-'+replikler[i++%replikler.length],evre==='servis'?'tesekkur':'istek');}
            finally{konusuyor=false;}
          };
        }
        oyuncu.setAttribute('role','group');
        const yildizlar=dinle.querySelector('.sef-yildizlar');
        if(yildizlar){yildizlar.classList.add('salon-masa-yildizlari');sahne.append(yildizlar);}
        dinle.classList.add('salon-yuzune-dokun');
        if(!dinle.querySelector('.ikon'))dinle.append(ikon('hoparlor'));
        oyuncu.querySelector('.restoran-oyuncu-bedeni')!.append(dinle);
      }
    }
    dekor.insertBefore(oyuncu,masa);
    return oyuncu;
  }
  dekor.append(masa);sahne.prepend(dekor);
  if(hareketli){
    const ileri=dugme(evre==='cikis'?'Vedayı geç':'Siparişe geç','salon-ileri',ikon('ileri'));
    ileri.onclick=()=>{asciHazir=true;konukHazir=true;sonaGit();};
    sahne.append(ileri);
  }
  yer(kim,false);
  if(birlikte){
    if(hareketli){
      const bekleyen=evre==='cikis'?yer(arkadas,true,'otur'):undefined;
      saat=window.setTimeout(()=>{if(!kapali&&dekor.isConnected){bekleyen?.remove();yer(arkadas,true);}},530);
    }
    else yer(arkadas,true);
  }
  return ()=>{kapali=true;window.clearTimeout(saat);};
}
import type {menuler} from './tepsi-fisleri';
import {dekorResmi} from './dekor-magazasi';
import type {DekorId} from './dekor-verisi';

type SalonSiparisi=(typeof menuler)[number];
export function yanSalonuGoster(sahne:HTMLElement,menuler:(SalonSiparisi|undefined)[],
  yemekler:(m:SalonSiparisi)=>HTMLElement[],al:(m:SalonSiparisi)=>void,dekorlar:DekorId[],servis:boolean,bekleme:(id:string)=>number,gelen?:string){
  sahne.dataset.yanSalon='';
  const oda=h('section.yan-salon',{'aria-label':'Yan salon masaları'});
  if(servis){oda.classList.add('servis-salonu');oda.setAttribute('aria-label','Servis salonu masaları');}
  const masalar=h('div.yan-salon-masalari');
  sahne.querySelector('.yan-salon')?.remove();
  for(const m of menuler){
    if(!m){
      masalar.append(h('div.yan-salon-masa',{'aria-label':'Boş masa'},h('img.yan-sofra',{src:masaResmi,alt:'',draggable:false})));
      continue;
    }
      const kim=konuklar[m.misafir];
      const kisi=restoranOyuncusu(kim,m.id===gelen?'gelis':'otur',undefined,true);
      const masa=dugme(adlar[kim]+' — '+m.cumle,'yan-salon-masa',kisi,
        h('img.yan-sofra',{src:masaResmi,alt:'',draggable:false}),
        h('span.yan-istek',{},...yemekler(m)));
      masa.dataset.bekleyen=m.id;
      const saniye=bekleme(m.id);
      masa.dataset.sabir=saniye>=120?'gec':saniye>=90?'az':'';
      if(saniye>=120){masa.dataset.ayriliyor='';masa.disabled=true;}
      masa.dataset.menu=m.id;masa.onclick=()=>al(m);masalar.append(masa);
    }
  oda.append(masalar);
  for(const d of dekorlar)oda.append(dekorResmi(d,'yan-sus yan-'+d));
  sahne.prepend(oda);
}
