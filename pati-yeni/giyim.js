import {baslikYerleri} from './basliklar.js';
import {terzi} from './terzi.js';
import {giysiAdi} from './dolap.js';
import {urunler} from './urunler.js';

const giysiler=import.meta.glob('../assets/pati-yeni/terzilik/*/*/*.svg',{eager:true,query:'?url&no-inline',import:'default'});

const basliklar = import.meta.glob('../assets/pati-yeni/basliklar/*.svg',{eager:true,query:'?url',import:'default'});
function baslikResmi(model, ek=''){
 return basliklar['../assets/pati-yeni/basliklar/'+model.tur+'-'+model.temel+ek+'.svg'];
}
export function giysiCizimi(model,id,poz='otur'){
 if(id==='baslik')return baslikResmi(model);
 const yol='../assets/pati-yeni/terzilik/'+model.tur+'-'+model.temel+'/'+poz+'/'+id+'.svg';
 return giysiler[yol];
}

export function hayvanIsigi(model){
 const ozel={Bronz:'koru','Gümüş':'ay','Altın':'gunes'}[model.madalya];
 if(ozel)return ozel;
 const uzunAile=['kopek','kedi'].includes(model.tur);
 const oran=model.index/(uzunAile?47:17);
 return oran>=.72?'isildayan':oran>=.36?'kivilcim':'';
}

export function giysiIsigi(id){
 const fiyat=urunler[id]?.fiyat||0;
 if(fiyat>=36)return 'yildiz';
 if(fiyat>=26)return 'ay';
 if(fiyat>=22)return 'koru';
 if(fiyat>=18)return 'kivilcim';
 return '';
}

export function isikKatmani(tip){
 if(!tip)return '';
 return `<span class="pati-isigi isik-${tip}" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

export function giydir(slot,id,model){
 const uyku=slot.querySelector('.cizili-uyku');
 const body=slot.querySelector('.govde,img.beden');
 const face=slot.querySelector('.kafa.normal,img.yuz');
 if(id==='baslik'){
  if(uyku)return;
  const fish=slot.querySelector('img.butun-balik');
  const hat=new Image();
  hat.alt='';
  if(fish){
   hat.src=baslikResmi(model,'-yuz');
   hat.className='butun-balik balik-taci';
   fish.after(hat);
   return;
  }
  if(!face)return;
  const dog=model.tur==='kopek';
  const mount=document.createElement('span');
  mount.className=dog?'parca kafa sapka-yeri':'yuz sapka-yeri';
  mount.setAttribute('aria-hidden','true');
  const [x,y,width]=baslikYerleri[model.tur][model.temel];
  hat.src=baslikResmi(model);
  hat.className='bas-sapkasi';
  Object.assign(hat.style,{left:x+'%',bottom:(100-y)+'%',width:width+'%'});
  mount.append(hat);
  if(dog)face.parentElement.append(mount);
  else face.after(mount);
  return;
 }
 if(!uyku&&(!body||!face))return;
 const im=new Image();
 im.className='giyili giyili-'+id;
 im.src=giysiCizimi(model,id)+'#poz';
 im.alt=giysiAdi(model,id);
 if(uyku){im.src=giysiCizimi(model,id);uyku.append(im);return;}
 const crowns = {
  ordek: [51, 41, 51, 45, 50, 40],
  kus: [52, 49, 57, 30, 48, 49],
  civciv: [55, 55, 55]
 };
 if (crowns[model.tur] && ['imza','gece-pelerini','papatya'].includes(id)) {
  const mount = document.createElement('span');
  mount.className = 'yuz sapka-yeri';
  mount.setAttribute('aria-hidden','true');
  im.src = giysiCizimi(model,id);
  im.className = 'bas-sapkasi';
  im.style.left = crowns[model.tur][model.temel] + '%';
  mount.append(im);
  face.after(mount);
  return;
 }
 const dog=model.tur==='kopek';
 const kat=document.createElement('span');
 kat.className=dog?'giyim-kalibi':'beden giyim-kalibi';
 if(dog){
  body.append(kat);
 }else{
  body.after(kat);
 }
 // Walking replaces the entire standing body for dogs and cats. Register the
 // costume to the same two stride frames; the parent's facing mirrors both.
 if(slot.closest('.sergi-yeri,.mini-kahraman')&&['kopek','kedi'].includes(model.tur)){
  const adim=document.createElement('span');
  adim.className=dog?'adim-giysisi':'beden adim-giysisi';
  for(let kare=0;kare<2;kare++){
   const resim=new Image();
   resim.alt='';
   resim.src=giysiCizimi(model,id,'adim'+kare)+'#poz';
   adim.append(resim);
  }
  kat.after(adim);
 }
 const kumas=document.createElement('span');
 kumas.className='giyim-kumasi';
 kat.append(kumas);kumas.append(im);
 const isik=giysiIsigi(id);
 kumas.dataset.isik=isik;
 if(isik)kumas.insertAdjacentHTML('beforeend',isikKatmani(isik));
 const onAlan=terzi(kumas,model);
 if(onAlan){
  const kol=document.createElement('span');
  kol.className='giyimin-onu';
  kol.style.backgroundImage='url("'+body.src+'")';
  kol.style.clipPath=onAlan;
  kat.append(kol);
 }
}
