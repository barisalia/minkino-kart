import {efekt} from '../../src/audio/efekt';
import {karistirmaSesi} from './mutfak-ses';

/** Play each short sound on contact with a utensil, in both the shop and the restaurant kitchen. */
export function pastaneSesleri(sahne:HTMLElement,sesli:()=>boolean){
  sahne.addEventListener('pastane-sus-yerlesti',e=>{
    if(sesli()){
      if((e as CustomEvent<boolean>).detail)efekt.nota(5);
      else efekt.dokunma();
    }
  });
  sahne.addEventListener('pastane-firin-hazir',()=>{if(sesli())efekt.nota(4);});
  sahne.addEventListener('pastane-kepce-bosaldi',()=>{if(sesli())efekt.pof();});
  function temas(hedef:EventTarget|null){
    if(!sesli()||!(hedef instanceof Element))return;
    const dugme=hedef.closest<HTMLButtonElement>('button');
    if(!dugme||dugme.disabled)return;
    if(dugme.matches('.ta-firin-kumanda')){efekt.cevir();return;}
    if(dugme.matches('.kek-kase')){efekt.dalga();return;}
    if(dugme.matches('.tart-krema-yay')){efekt.ovala();return;}
    if(dugme.matches('.dk-yuzey')){karistirmaSesi(false);return;}
    if(dugme.matches('.mk-hedef')&&dugme.closest('[data-adim="3"]')){efekt.vicik();return;}
    if(dugme.matches('.ta-baski,.kb-bas')){if(dugme.dataset.is==='dok')efekt.dalga();else efekt.pof();return;}
    if(dugme.matches('.kb-editor')){efekt.vicik();return;}
    if(dugme.matches('.ta-iz-alani')){
      if(dugme.dataset.is==='cirp'||dugme.dataset.is==='kepce')karistirmaSesi(false);
      else if(dugme.dataset.is==='merdane')efekt.ovala();
      else efekt.vicik();
      return;
    }
    if(dugme.closest('.pastane-tabaklari')||dugme.matches('.kb-torba,.kb-sec,.ta-sec,.ta-tart-kaynak,.dk-kap-sec,.dk-tut,.mk-kaynak'))efekt.secim();
  }
  sahne.addEventListener('pointerdown',e=>{if(e.isPrimary)temas(e.target);});
  sahne.addEventListener('keydown',e=>{if(!e.repeat&&(e.key==='Enter'||e.key===' '))temas(e.target);});
  return sahne;
}
