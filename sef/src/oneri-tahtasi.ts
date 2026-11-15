import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import tahta from '../../assets/sef/oneri-tahtasi.webp';
import './oneri-tahtasi.css';

interface Secenek {id:string;ad:string;gorsel:()=>HTMLElement}

export function oneriTahtasi(secenekler:Secenek[],secili:string|undefined,sec:(id:string|undefined)=>void){
  const tabela=h('section.sef-onerisi',{'aria-label':'Yarının şef önerisi'},
    h('img.sef-oneri-tahta',{src:tahta,alt:'',draggable:false}));
  const grup=h('div.sef-oneri-fisleri',{role:'group','aria-label':'Yarın ilk hangi siparişi hazırlamak istersin?'});
  for(const tarif of secenekler){
    const b=dugme(tarif.ad,'sef-oneri-fisi',tarif.gorsel(),ikon('onay'));
    b.setAttribute('aria-pressed',String(tarif.id===secili));
    b.onclick=()=>{
      secili=tarif.id===secili?undefined:tarif.id;
      for(const kart of grup.children)kart.setAttribute('aria-pressed',String(kart===b&&!!secili));
      sec(secili);
    };
    grup.append(b);
  }
  tabela.append(grup);return tabela;
}
