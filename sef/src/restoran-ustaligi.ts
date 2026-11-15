import {h} from '../../src/ui/dom';
import {efekt} from '../../src/audio/efekt';
import {dugme,ikon} from './gorsel';
import './restoran-ustaligi.css';

import {oduller,ilerleme,type Ustalik,type Esya} from './ustalik-kaydi';
const resimler=import.meta.glob<string>('../../assets/sef/ustalik/*.webp',{eager:true,query:'?url',import:'default'});
function cizim(id:Esya,sinif=''){
  return h('img',{class:sinif,src:resimler['../../assets/sef/ustalik/'+id+'.webp'],alt:'',draggable:false});
}
export function dekoruKoy(yer:HTMLElement,u:Ustalik,id:Esya){
  if(u.takili.includes(id))yer.append(cizim(id,'ustalik-dekor ustalik-'+id));
}
export function ustalikRafi(u:Ustalik,gun:number,kaydet:()=>void,sesli:()=>boolean){
  const raf=h('div.ustalik-rafi',{role:'group','aria-label':'Restoran süslerini seç'});
  for(const o of oduller){
    const acik=u.kazanilan.includes(o.id);
    const b=dugme(o.ad,'ustalik-parcasi',cizim(o.id),h('i',{},ikon(acik?'onay':'kilit')));
    b.dataset.esya=o.id;b.disabled=!acik;
    function goster(){
      const takili=u.takili.includes(o.id);
      if(acik){
        b.setAttribute('aria-pressed',String(takili));
        b.querySelector('i')!.hidden=!takili;
      }else{
        const is=o.id==='pecete'?'eksiksiz sofra':'tatlı servisi';
        b.setAttribute('aria-label',o.ad+' için '+o.gun+'. gün ve '+o.hedef+' '+is);
        const adim=h('span.ustalik-ilerleme',{'aria-hidden':true},ikon(o.id==='pecete'?'servis':'sef'));
        for(let i=0;i<o.hedef;i++)adim.append(h('b',{'data-dolu':String(i<ilerleme(u,o.id))}));
        b.append(adim);
        if(gun<o.gun)b.dataset.gun=String(o.gun);
      }
    }
    b.onclick=()=>{
      if(!acik)return;
      const tak=u.takili.includes(o.id);
      u.takili=tak?u.takili.filter(id=>id!==o.id):[...u.takili,o.id];
      if(sesli()){if(tak)efekt.pof();else efekt.nota(oduller.indexOf(o)+1);}
      kaydet();goster();
    };
    goster();raf.append(b);
  }
  return raf;
}
