import {h} from '../../../src/ui/dom';
import {meyveAdi,renkAdi,smoothieRengi,taneli,type BardakIstegi,type Meyve} from './tarif';

const araclar=import.meta.glob<string>('../../../assets/sef/smoothie/*.webp',{eager:true,query:'?url',import:'default'});
export function arac(ad:string,sinif=''){return h('img',{class:sinif,src:araclar['../../../assets/sef/smoothie/'+ad+'.webp'],alt:'',draggable:false});}
const dilimler:Record<Meyve,string>={
  sut:new URL('../../../assets/sef/krep/sut-sise.webp',import.meta.url).href,
  uzum:new URL('../../../assets/meyveler/uzum.webp',import.meta.url).href,
  cilek:new URL('../../../assets/sef/suslemeler/sus-035.webp',import.meta.url).href,
  muz:new URL('../../../assets/sef/suslemeler/sus-039.webp',import.meta.url).href,
  kivi:new URL('../../../assets/sef/suslemeler/sus-034.webp',import.meta.url).href,
  yabanmersini:new URL('../../../assets/sef/suslemeler/sus-037.webp',import.meta.url).href,
  portakal:new URL('../../../assets/sef/smoothie/portakal-dilimi.webp',import.meta.url).href,
  seftali:new URL('../../../assets/sef/smoothie/seftali-dilimi.webp',import.meta.url).href,
};
export function dilim(id:Meyve){return h('img',{src:dilimler[id],alt:'',draggable:false});}
export function bardakDolumu(el:HTMLElement,f:number){
  el.style.setProperty('--sm-dolu',(Math.max(0,Math.min(100,f))*.82)+'%');
}
export function buzIsareti(buzlu:boolean){
  return h('span.sm-buz-isareti',{'data-buz':buzlu?'evet':'hayir',role:'img','aria-label':buzlu?'Buzlu':'Buzsuz'},arac('buz'));
}
export function smoothieBardagi(m:readonly Meyve[],doluluk=80,sinif='',buzlu=false,karisim=100){
  const ad=m.map(id=>meyveAdi[id]).join(' ve ');
  const cam=h('span.sm-bardak',{class:'sm-bardak '+sinif,role:'img','aria-label':ad+' içeceği'+(buzlu?', buzlu':''),'data-meyveler':m.join(','),'data-buz':buzlu?'evet':'hayir'},
    arac('bardak'),h('span.sm-cam-ici',{},h('span.sm-icecek')));
  cam.dataset.miktar=doluluk<=65?'2':'3';
  cam.style.setProperty('--sm-renk',smoothieRengi(m));bardakDolumu(cam,doluluk);
  const parcalar=m.filter(id=>id!=='sut');
  if(taneli(karisim)&&m.length===2&&parcalar.length){
    const posalar=h('span.sm-bardak-parcalari',{'aria-hidden':true},...Array.from({length:3},(_,i)=>dilim(parcalar[i%parcalar.length])));
    cam.querySelector('.sm-icecek')?.append(posalar);
  }
  if(buzlu){const kup=arac('buz','sm-yuzen-buz');cam.append(kup);}
  return cam;
}

export function renkDamgasi(m:readonly Meyve[]){
  const ornek=h('span.sm-renk-damgasi',{role:'img','aria-label':renkAdi(m)+' renk örneği'});
  ornek.style.setProperty('--sm-renk',smoothieRengi(m));return ornek;
}
export function siparisBardagi(m:readonly Meyve[],istek?:BardakIstegi){
  const cam=smoothieBardagi(m,istek?.yarim?50:85,'tepsi-gida');
  cam.setAttribute('aria-label',renkAdi(m)+(istek?.yarim?' yarım bardak':'')+' içecek');return cam;
}

export function kivamIsareti(kivam:'taneli'|'puruzsuz'){
  return h('span.sm-kivam-isareti',{'data-kivam':kivam,role:'img','aria-label':kivam==='taneli'?'Meyve parçalı':'Pürüzsüz'},h('i'),h('i'),h('i'));
}
