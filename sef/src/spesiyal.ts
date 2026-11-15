import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import type {ServisKaydi} from './kayit';
import {aniFotografi} from './sofra-fotografi';
import type {SofraAni} from './tepsi-fisleri';
import './spesiyal.css';

export function spesiyalIsareti(){
  return h('span.spesiyal-rozeti',{role:'img','aria-label':'Şefin spesiyali'},ikon('yildiz'));
}
export function salonPanosu(ani:SofraAni,cizim:(tabak:ServisKaydi)=>HTMLElement){
  const pano=dugme('Şefin spesiyalini büyüt','salon-panosu',aniFotografi(ani,cizim),spesiyalIsareti());
  pano.onclick=()=>{
    if(document.querySelector('dialog.spesiyal-yakin'))return;
    const pencere=h('dialog.spesiyal-yakin',{'aria-label':'Şefin spesiyali'},aniFotografi(ani,cizim));
    const geri=dugme('Salona dön','spesiyal-kapat',ikon('geri'));
    const kapat=()=>{pencere.close();pencere.remove();pano.focus();};
    geri.onclick=kapat;pencere.addEventListener('cancel',e=>{e.preventDefault();kapat();});
    pencere.append(geri);document.body.append(pencere);pencere.showModal();geri.focus();
  };
  return pano;
}
