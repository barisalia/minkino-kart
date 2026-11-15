import { h } from '../../src/ui/dom';
import { efekt } from '../../src/audio/efekt';
import { dugme, ikon } from './gorsel';
import { icinde, jest, merkez, zaman, type Nokta } from './hareket';
import { meyveAdi, type Meyve } from './tepsi-fisleri';
import {sikmaSesi,bardagaDokmeSesi,tezgahiSustur} from './mutfak-ses';
import './tepsi-icecek.css';

const gorseller = import.meta.glob<string>('../../assets/sef/tepsi/icecek/*.webp', { eager:true, query:'?url', import:'default' });
const url = (ad:string) => gorseller['../../assets/sef/tepsi/icecek/'+ad+'.webp'];
export const icecekResmi = url('dolu');
export const bosBardak = url('bardak');
export const yarimBardakResmi=url('yarim-bardak');
const nesneAdi=(meyve:Meyve,ad:string)=>meyve==='portakal'?ad:meyve+'-'+ad;
export const icecekBardagi=(meyve:Meyve,doluluk:2|3=3)=>url(nesneAdi(meyve,doluluk===2?'yarim-bardak':'dolu'));
export function sikmaServisBardagi(meyve:Meyve,miktar:2|3){
  const cam=h('span.sikma-servis-bardagi',{role:'img','aria-label':meyveAdi[meyve]+' suyu','data-miktar':String(miktar)},
    h('span.sikma-cam-haznesi',{},h('span.sikma-suyu')),
    h('img.sikma-cam-resmi',{src:url('servis-cami'),alt:'',draggable:false}),
    h('img.sikma-cam-meyvesi',{src:url(nesneAdi(meyve,'yarim')),alt:'',draggable:false}));
  cam.style.setProperty('--meyve-rengi',{'portakal':'#ff9b13','limon':'#ffe45a','kan-portakali':'#e94451'}[meyve]);
  cam.style.setProperty('--doluluk',miktar===2?'44%':'81%');return cam;
}
export interface IcecekSiparisi {istenen:Meyve;secili:Meyve;sec:(meyve:Meyve)=>void}
const replikler:Record<Meyve,readonly string[]>={
  portakal:['Müşteri portakal suyu istiyor. Meyveni seç ve sıkacağa koy.','Portakalı bastırıp çevir.','Portakal suyunu bardağa dök.'],
  limon:['Müşteri limon suyu istiyor. Meyveni seç ve sıkacağa koy.','Limonu bastırıp çevir.','Limon suyunu bardağa dök.'],
  'kan-portakali':['Müşteri kan portakalı suyu istiyor. Meyveni seç ve sıkacağa koy.','Kan portakalını bastırıp çevir.','Kan portakalı suyunu bardağa dök.'],
};
const resim = (ad:string,sinif='') => h('img',{class:sinif,src:url(ad),alt:'',draggable:'false'});


export function icecekIstasyonu(alan:HTMLElement, adet:number, kaydet:(n:number)=>void, bitti:()=>void, soyle:(s:string)=>void, sesli:()=>boolean, miktar?:(puan:2|3)=>void,siparis?:IcecekSiparisi):()=>void {
  let meyve=siparis?.secili??'portakal';
  const istenen=siparis?.istenen??'portakal';
  const meyveResmi=(ad:string,sinif='')=>resim(nesneAdi(meyve,ad),sinif);
  const sahne=h('div.ps-sahnesi',{'aria-label':'Meyve suyu istasyonu'});
  const masa=h('div.ps-masa'); sahne.append(resim('tezgah','ps-fon'),masa); alan.append(sahne);
  let ilerleme=Number.isFinite(adet)?Math.max(0,Math.min(6,Math.floor(adet))):0;
  let kapandi=false, isli=false, secili=false, haberVerildi=false;
  const saatler=new Set<ReturnType<typeof setTimeout>>();
  const sonra=(ms:number,fn:()=>void)=>{const id=setTimeout(()=>{saatler.delete(id);if(!kapandi)fn();},zaman(ms));saatler.add(id);};
  const ses=(f:()=>void)=>{if(sesli() && !document.hidden)f();};
  const konus=()=>{if(sesli() && !document.hidden && ilerleme<5)soyle(ilerleme===0?replikler[istenen][0]:replikler[meyve][ilerleme===4?2:1]);};
  const tamam=()=>{ if(!kapandi && !haberVerildi){haberVerildi=true;bitti();} };
  function yaz(n:number) {
    if(kapandi || n<=ilerleme)return;
    ilerleme=n; secili=false; kaydet(n);
  }
  function aktive(b:HTMLButtonElement,fn:()=>void){
    jest(b,{birak:(p,_ilk,tik)=>{if(tik&&icinde(b,p,7)&&!isli)fn();},klavye:()=>{if(!isli)fn();}});
  }
  function sec(b:HTMLButtonElement,hedef:HTMLButtonElement){
    if(isli)return;
    secili=true; b.classList.add('ps-secili'); hedef.classList.add('ps-secili-hedef'); ses(efekt.secim);
  }
  function tasi(b:HTMLButtonElement,hedef:HTMLButtonElement,fn:()=>void) {
    const temiz=()=>{b.style.transform='';b.classList.remove('ps-elde');hedef.classList.remove('ps-yakin');};
    jest(b,{
      tasi:(p,ilk)=>{if(isli||Math.hypot(p.x-ilk.x,p.y-ilk.y)<6)return;b.style.transform='translate('+(p.x-ilk.x)+'px,'+(p.y-ilk.y)+'px)';b.classList.add('ps-elde');hedef.classList.toggle('ps-yakin',icinde(hedef,p,14));},
      birak:(p,_ilk,tik)=>{temiz();if(isli)return;if(tik)sec(b,hedef);else if(icinde(hedef,p,14))fn();},
      iptal:temiz,klavye:()=>sec(b,hedef),
    });aktive(hedef,()=>{if(secili)fn();else {sec(b,hedef);konus();}});
  }
  function toplamGoster(){
    const boncuk=h('div.ps-gosterge',{'aria-label':Math.min(3,Math.max(0,ilerleme-1))+' / 3 sıkma'});
    for(let i=1;i<=3;i++) boncuk.append(h('i',{class:ilerleme>i?'ps-dolu':''}));
    return boncuk;
  }
  function sikacak(){
    const grup=h('div.ps-sikacak');
    const durum = ilerleme<2?'sikacak-bos':ilerleme===2?'sikacak-az':'sikacak-yari';
    grup.append(ilerleme<2?resim('sikacak-bos','ps-alet'):meyveResmi(durum,'ps-alet'));
    masa.append(grup);return grup;
  }
  function hazirla(){
    const grup=sikacak();
    const portakal=dugme(meyveAdi[meyve]+' yarısını tut','ps-portakal ps-ham',meyveResmi('yarim'));
    const hedef=dugme(meyve==='portakal'?'Portakalı sıkacağa yerleştir':meyveAdi[meyve]+' yarısını sıkacağa yerleştir','ps-dene',ikon('asagi'));
    hedef.dataset.icecekHedef='sikacak';portakal.dataset.icecekArac=meyve;grup.append(hedef);
    masa.append(portakal);
    const raf=h('div.ps-meyve-rafi',{role:'group','aria-label':'Meyve seçimi'});
    for(const id of Object.keys(meyveAdi) as Meyve[]){
      const b=dugme(meyveAdi[id]+' seç','ps-meyve-sec',resim(nesneAdi(id,'yarim')));
      b.dataset.meyve=id;b.setAttribute('aria-pressed',String(id===meyve));
      aktive(b,()=>{if(id===meyve)return;meyve=id;secili=false;siparis?.sec(meyve);ses(efekt.secim);ciz();});
      raf.append(b);
    }
    masa.append(raf);
    tasi(portakal,hedef,()=>{if(isli)return;isli=true;ses(efekt.yapis);yaz(1);isli=false;ciz();konus();});
  }
  function sik(){
    const grup=sikacak(), kapak=meyveResmi('kabuk');
    const kapakDugmesi=dugme(replikler[meyve][1].slice(0,-1),'ps-cevir',kapak);
    kapakDugmesi.dataset.icecekCevir='';grup.append(kapakDugmesi);
    const ok=h('i.ps-donme-oku',{},ikon('karistir'));kapakDugmesi.append(ok);
    masa.append(meyveResmi('portakallar','ps-kase'),toplamGoster());
    let oncekiAci:number|undefined, donus=0, sayilanTur=0,yol=0,sonSes=0,sonHareket=0;
    const gerekliDonus=Math.PI*.8;
    const aci=(p:Nokta)=>{
      const m=merkez(kapakDugmesi), x=p.x-m.x, y=p.y-m.y;
      if(Math.hypot(x,y)<kapakDugmesi.clientHeight*.15)return undefined;
      return Math.atan2(y,x);
    };
    const temiz=()=>{kapak.style.transform='';oncekiAci=undefined;donus=0;sayilanTur=0;yol=0;sonHareket=performance.now();};
    function tur(){
      if(isli||ilerleme>=4)return;
      ses(()=>sikmaSesi(ilerleme-1,.85,true));
      yaz(ilerleme+1);
      sahne.dataset.icecek=String(ilerleme);
      const hazne=grup.querySelector<HTMLImageElement>('.ps-alet')!;
      hazne.src=url(nesneAdi(meyve,ilerleme===2?'sikacak-az':ilerleme===3?'sikacak-yari':'sikacak'));
      masa.querySelector('.ps-gosterge')?.replaceWith(toplamGoster());
      if(ilerleme===4){
        isli=true;kapak.src=url(nesneAdi(meyve,'sikilmis'));
        sonra(360,()=>{isli=false;ciz();konus();});
      }
    }
    function basarakSik(){
      if(isli)return;
      kapakDugmesi.classList.remove('ps-sikiyor');
      void kapakDugmesi.offsetWidth;
      kapakDugmesi.classList.add('ps-sikiyor');tur();
    }
    jest(kapakDugmesi,{
      basla:p=>{if(isli)return;temiz();oncekiAci=aci(p);kapakDugmesi.classList.remove('ps-sikiyor');},
      tasi:(p,ilk)=>{
        if(isli)return;
        const yeniAci=aci(p);
        if(oncekiAci!==undefined&&yeniAci!==undefined){
          const fark=yeniAci-oncekiAci;
          const adim=Math.atan2(Math.sin(fark),Math.cos(fark));
          donus+=adim;yol+=Math.abs(adim);
          const an=performance.now();
          if(yol>.55&&an-sonSes>145&&Math.abs(donus)<gerekliDonus-.35){
            ses(()=>sikmaSesi(ilerleme-1,yol*140/Math.max(1,an-sonHareket),false));
            sonSes=an;sonHareket=an;yol=0;
          }
        }
        oncekiAci=yeniAci;
        kapak.style.transform='translateY(4%) rotate('+Math.max(-19,Math.min(19,(p.x-ilk.x)/2))+'deg)';
        if(Math.abs(donus)>=gerekliDonus){donus=0;sayilanTur++;tur();}
      },
      birak:(p,ilk,tik)=>{
        const kisaHareket=sayilanTur===0&&(Math.abs(donus)>Math.PI*.43||Math.abs(p.x-ilk.x)>25);
        temiz();if(tik||kisaHareket)basarakSik();
      },
      iptal:temiz,klavye:basarakSik,
    });
  }
  function dok(){
    const surahi=dugme(meyveAdi[meyve]+' suyu sürahisini tut','ps-surahi',meyveResmi('surahi'));
    const yarim=ilerleme===6;
    const bardak=dugme(meyveAdi[meyve]+' suyunu bardağa doldur','ps-bardak',yarim?meyveResmi('yarim-bardak'):resim('bardak'));
    surahi.dataset.icecekArac='surahi';bardak.dataset.icecekHedef='bardak';masa.append(surahi,bardak);
    tasi(surahi,bardak,()=>{
      if(isli)return;isli=true;surahi.style.visibility='hidden';bardak.disabled=true;ses(()=>bardagaDokmeSesi(yarim));
      const akim=meyveResmi('dokuluyor','ps-dokulen');bardak.append(akim);
      sonra(600,()=>{
        akim.remove();isli=false;
        // 5 eski sürümde bitmiş bardaktır. Yeni ara durumu ayrı sakla.
        ilerleme=yarim?5:6;secili=false;kaydet(ilerleme);ciz();
        if(yarim){miktar?.(3);ses(efekt.tink);sonra(480,tamam);}
        else if(sesli())soyle('Müşteri dolu bir bardak istedi. Biraz daha dökebilir ya da böyle sunabilirsin.');
      });
    });
    if(yarim){
      const sun=dugme('Yarım bardağı tepsiye koy','ps-yarim-sun',meyveResmi('yarim-bardak'),ikon('ileri'));
      aktive(sun,()=>{miktar?.(2);tamam();});masa.append(sun);
    }
  }
  function ciz(){
    if(kapandi)return;masa.replaceChildren();sahne.dataset.icecek=String(ilerleme);
    if(ilerleme===0)hazirla();else if(ilerleme<4)sik();else if(ilerleme!==5)dok();else masa.append(meyveResmi('dolu','ps-son'));
    const fis=dugme(replikler[istenen][0],'ps-istek-fisi',resim(nesneAdi(istenen,'yarim')),ikon('ileri'),resim(nesneAdi(istenen,'dolu')));
    fis.dataset.istenen=istenen;aktive(fis,()=>{if(sesli())soyle(replikler[istenen][0]);});masa.append(fis);
    sahne.dataset.meyve=meyve;
  }
  ciz();
  if(ilerleme===5)sonra(80,tamam);else konus();
  return ()=>{kapandi=true;tezgahiSustur();saatler.forEach(clearTimeout);saatler.clear();sahne.remove();};
}
