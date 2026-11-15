import type {Sabah} from './model';
import type {Bolge,KosedekiIsler} from './kres-servis';
import {tamamla} from './kres-kaydi';
import {simge} from './cizim';
import {efekt} from '../../src/audio/efekt';

export const oykuKapak=(res:string)=>'<span class="kres-kitap">'+res+'</span>';
const sayfaAdi=['Kopan tekerlek','Mino tekerleği takıyor','Araba garaja gidiyor'];
type Oyku={s:Sabah;bolge:Bolge;res:(id:string)=>string;is:KosedekiIsler;yenile:()=>void;ileri:(id:string,ad:string,yap:()=>void)=>void};
export function limanSozu(k:Sabah['kres']){
  return k.limanSayfa===3?'kres_masal_'+k.limanSon:['kres_masal_liman','kres_masal_kopru','kres_masal_sec'][k.limanSayfa];
}
export function oykuAc({s,bolge,res,is,yenile,ileri}:Oyku){
  const k=s.kres,n=k.oykuSayfa,kitap=(id:number)=>oykuKapak(res('kres/oyku-'+id));
  if(k.limanKitabi){
    const konu=k.limanSayfa===3?k.limanSon:k.limanSayfa===0?'liman':k.limanSayfa===2?'acik':'kopru';
    const sayfa=bolge('liman-sayfasi','Yelkenlinin öyküsünü dinle','',[51,50,71,71],()=>is.soyle(limanSozu(k)),'liman-sayfasi',[50,45,94,49]);
    const yuz=document.createElement('span');yuz.className='liman-resim';yuz.innerHTML=res('kres/masal-'+konu);sayfa.append(yuz);
    const ilerle=()=>{k.limanSayfa++;efekt.sayfa();yenile();is.soyle(limanSozu(k))};
    if(k.limanSayfa<2){
      const ilk=k.limanSayfa===0;
      const sec=()=>{
        if(ilk&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
          hedef.setAttribute('disabled','');yuz.innerHTML=res('kres/masal-zarfta');efekt.sayfa();
          window.setTimeout(()=>{if(hedef.isConnected)ilerle()},1350);
        }else ilerle();
      };
      const hedef=bolge('liman-bul',ilk?'İskeledeki zarfı tekneye al':'Köprünün çarkını çevir','',[0,0,0,0],sec,'liman-bul');
      // Keep interactive regions in the illustration's coordinate system in both orientations.
      const x=ilk?20:17.5,y=ilk?64:39;
      // Positions stay anchored to the book illustration on rotation.
      const hedefKatmani=sayfa.parentElement!;
      const kapsayici=document.createElement('div');kapsayici.className='liman-etkilesim';
      for(const ad of ['x','y','w','h','dx','dy','dw','dh'])kapsayici.style.setProperty('--'+ad,sayfa.style.getPropertyValue('--'+ad));
      kapsayici.classList.add('kres-parca');hedefKatmani.append(kapsayici);
      const ic=document.createElement('span');ic.className='liman-resim';kapsayici.append(ic);ic.append(hedef);
      Object.assign(hedef.style,{left:x+'%',top:y+'%',width:'18%',height:'25%',minWidth:'44px',minHeight:'44px'});
      bolge('liman-ipucu','Resimde aradığın eşya',res('kres/masal-'+(ilk?'zarf':'cark')),[78,84,11,11],()=>{is.soyle('kres_masal_bul');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)hedef.animate([{outline:'2px solid transparent'},{outline:'3px solid #ffce51'},{outline:'2px solid transparent'}],{duration:1100})},'',[76,72,19,10]);
    }else if(k.limanSayfa===2){
      (['fener','koy'] as const).forEach((son,i)=>bolge('son-'+son,i?'Kitapçıya götür':'Deniz fenerine götür',oykuKapak(res('kres/masal-'+son)),[35+i*32,81,25,24],()=>{k.limanSon=son;tamamla(k,'oyku');ilerle()},'',[28+i*44,70,38,19]));
    }else{
      bolge('baska-son','Diğer sonu keşfet',simge('yenile'),[31,86,10,12],()=>{k.limanSayfa=2;yenile();is.soyle(limanSozu(k))},'',[31,80,17,10]);
      ileri('kitabi-kaldir','Kitabı rafa kaldır',()=>is.gir('oyun-odasi'));
    }
    bolge('teker-kitabi','Zıpzıp’ın kitabını aç',kitap(0),[89,18,12,13],()=>{k.limanKitabi=false;yenile();is.soyle('kres_oyku_ac')},'',[79,16,19,10]);
    return;
  }
  bolge('liman-kitabi','Yelkenlinin mektubunu oku',oykuKapak(res('kres/masal-liman')),[88,18,14,14],()=>{
    k.limanKitabi=true;yenile();is.soyle(limanSozu(k));
  },'',[80,16,22,11]);
  function sayfaya(n:number){k.oykuSayfa=n;efekt.sayfa();is.soyle(n<3?'kres_oyku_'+n:'kres_oyku_diz');yenile()}
  if(n<3){
    bolge('kitap-sayfasi',sayfaAdi[n]+', sayfayı dinle',kitap(n),[51,52,69,70],()=>is.soyle('kres_oyku_'+n),'kres-kitap-buyuk',[50,49,92,51]);
    if(n>0)bolge('onceki-sayfa','Önceki resme dön',simge('ileri'),[20,86,8,11],()=>sayfaya(n-1),'kres-geri',[30,87,15,10]);
    ileri('cevir',n===2?'Resimleri arkadaşlarına anlat':'Kitabın sayfasını çevir',()=>{if(n===2)k.oykuIzlendi=true;sayfaya(n+1)});
    return;
  }
  const sirali=k.oykuDizi;
  for(let i=0;i<3;i++){
    const x=25+i*25,yer=i<sirali.length?kitap(i):'<span class="kres-bos-sayfa"></span>';
    bolge('anlatilan-'+i,'Hikâyenin '+(i+1)+'. resmi',yer,[x,41,24,27],i<sirali.length?()=>is.soyle('kres_oyku_'+i):undefined,'',[17+i*33,38,31,15]);
  }
  const yine=()=>{k.oykuDizi=[];sayfaya(0)};
  if(sirali.length===3){
    bolge('yeniden-oku','Kitabı yeniden oku',simge('yenile'),[27,72,13,16],yine,'',[30,72,20,12]);
    ileri('kitabi-kaldir','Kitabı rafa kaldır',()=>is.gir('oyun-odasi'));return;
  }
  const karisik=(k.gun%2===0?[1,2,0]:[2,0,1]);
  karisik.forEach((sayfa,i)=>{
    if(sirali.includes(sayfa))return;
    bolge('oyku-karti-'+sayfa,sayfaAdi[sayfa],kitap(sayfa),[25+i*25,72,23,25],()=>{
      if(sayfa!==sirali.length){is.soyle('kres_oyku_ipucu_'+sirali.length);return}
      sirali.push(sayfa);efekt.sayfa();is.soyle('kres_oyku_'+sayfa);
      if(sirali.length===3)tamamla(k,'oyku');yenile();
    },'kres-resim-karti',[17+i*33,65,31,19]);
  });
  bolge('yeniden-oku','Kitabı açıp tekrar bak',simge('yenile'),[9,49,8,12],yine,'',[14,80,14,10]);
}
