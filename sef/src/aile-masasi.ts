import {h} from '../../src/ui/dom';
import {sus} from '../../src/audio/konusma';
import {efekt} from '../../src/audio/efekt';
import {dugme,ikon} from './gorsel';
import {jest,icinde,type Nokta} from './hareket';
import {misafirResmi,salonSesiniCal} from './misafir';
import type {Masa} from './tepsi-fisleri';
import './aile-masasi.css';

type AileYemegi='omlet'|'icecek';
const yerler=[
  {kim:'anne',yemek:'icecek',ad:'Anne',isim:'Limon suyu'},
  {kim:'kino',yemek:'omlet',ad:'Kino',isim:'Omlet'},
] as const;
const tepsi=new URL('../../assets/sef/arabali-servis/tepsi.webp',import.meta.url).href;

export function aileMasasi(sahne:HTMLElement,masa:Masa,gida:(p:AileYemegi)=>HTMLElement,kaydet:()=>void,geri:()=>void,teslim:()=>void,sesli:()=>boolean){
  const alan=h('section.aile-servisi',{'aria-label':'Aile kahvaltısını masaya yerleştir'});
  const tahta=h('div.aile-servis-tepsisi',{},h('img',{src:tepsi,alt:'',draggable:false}));
  const don=dugme('Tepsiye geri dön','aile-geri',ikon('geri'));
  const bitti=dugme('Kahvaltıyı sun','aile-sun',ikon('onay'));
  const secilenler=new Map<AileYemegi,HTMLButtonElement>();
  const hedefler=new Map<AileYemegi,HTMLButtonElement>();
  const yuzler=new Map<AileYemegi,HTMLButtonElement>();
  const yerlesen=masa.aileServisi??=[];
  let secili:AileYemegi|undefined,kapandi=false;
  const guncelle=()=>{
    for(const {yemek,ad} of yerler){
      const yer=hedefler.get(yemek)!;
      const dolu=yerlesen.includes(yemek);
      yer.dataset.dolu=String(dolu);
      yer.classList.toggle('aile-teslim-bekliyor',!!secili&&!dolu);
      const yuz=yuzler.get(yemek);
      if(yuz)yuz.setAttribute('aria-label',secili&&!dolu?ad+' için tabağı bırak':ad+' ile konuş');
      const yiyecek=secilenler.get(yemek);
      if(yiyecek){
        yiyecek.hidden=dolu;
        yiyecek.setAttribute('aria-pressed',String(secili===yemek));
      }
    }
    bitti.hidden=!yerler.every(({yemek})=>!masa.tabaklar[yemek]||yerlesen.includes(yemek));
    tahta.dataset.bos=String(!bitti.hidden);
  };
  function yerlestir(yemek:AileYemegi,hedef:AileYemegi){
    if(kapandi||!masa.tabaklar[yemek]||yerlesen.includes(yemek)||yerlesen.includes(hedef))return;
    const yer=hedefler.get(hedef)!;
    const konuk=yerler.find(k=>k.yemek===hedef)!;
    if(hedef!==yemek){
      yer.animate([{translate:'0'},{translate:'-3px 0'},{translate:'3px 0'},{translate:'0'}],{duration:220});
      alan.dataset.sonuc='yanlis';kapandi=true;don.disabled=true;
      yer.dataset.dolu='true';yer.replaceChildren(gida(yemek));
      secilenler.get(yemek)!.hidden=true;
      masa.servisHatali=true;
      if(sesli())void salonSesiniCal(konuk.kim,konuk.kim+'-aile-yanlis','istek');
      window.setTimeout(()=>{if(alan.isConnected)teslim();},550);
      return;
    }
    yerlesen.push(yemek);yer.replaceChildren(gida(yemek));secili=undefined;
    alan.dataset.sonuc='yerlesti';kaydet();
    guncelle();
    if(sesli()){
      efekt.yapis();
      void salonSesiniCal(konuk.kim,konuk.kim+'-aile-teslim','tesekkur');
    }
  }
  for(const k of yerler){
    const yer=dugme(k.ad+' için kahvaltı yeri','aile-sofra-yeri',yerlesen.includes(k.yemek)?gida(k.yemek):misafirResmi(k.kim,'istek'));
    yer.dataset.kim=k.kim;hedefler.set(k.yemek,yer);
    const yuz=sahne.querySelector<HTMLButtonElement>(`.salon-figur[data-karakter="${k.kim}"] .salon-yuzune-dokun`);
    if(yuz){
      yuzler.set(k.yemek,yuz);
      yuz.addEventListener('click',e=>{
        if(!secili||kapandi||yerlesen.includes(k.yemek))return;
        e.stopImmediatePropagation();
        yerlestir(secili,k.yemek);
      },true);
    }
    yer.onclick=()=>{if(secili)yerlestir(secili,k.yemek);else if(sesli())void salonSesiniCal(k.kim,k.kim==='anne'?'anne-aile-limon':'kino-restoran-aile-kahvaltisi');};
    alan.append(yer);
    if(!masa.tabaklar[k.yemek])continue;
    const tabak=dugme(k.isim+' al','aile-yemek',gida(k.yemek));secilenler.set(k.yemek,tabak);tahta.append(tabak);
    const sec=()=>{secili=k.yemek;guncelle();};
    const sifirla=()=>{tabak.style.translate='';delete tabak.dataset.elde;};
    const hedef=(p:Nokta)=>yerler.find(y=>{
      const yuz=yuzler.get(y.yemek);
      return icinde(hedefler.get(y.yemek)!,p,2)||(yuz&&icinde(yuz,p,2));
    });
    jest(tabak,{
      tasi:(p,ilk)=>{if(Math.hypot(p.x-ilk.x,p.y-ilk.y)<7)return;tabak.dataset.elde='true';tabak.style.translate=(p.x-ilk.x)+'px '+(p.y-ilk.y)+'px';},
      birak:(p,_ilk,tik)=>{sifirla();if(tik){sec();return;}const y=hedef(p);if(y)yerlestir(k.yemek,y.yemek);},
      iptal:sifirla,klavye:sec,
    });
  }
  don.onclick=()=>{if(!kapandi){sus();geri();}};
  bitti.onclick=()=>{if(kapandi||bitti.hidden)return;kapandi=true;bitti.disabled=true;sus();teslim();};
  alan.append(tahta,don,bitti);sahne.append(alan);guncelle();
  return ()=>{kapandi=true;sus();};
}
