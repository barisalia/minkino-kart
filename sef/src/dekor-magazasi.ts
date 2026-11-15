import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {dekorlar,type DekorId} from './dekor-verisi';
import type {Tepsiler} from './tepsi-fisleri';
import {ustalikRafi} from './restoran-ustaligi';
import {efekt} from '../../src/audio/efekt';

const resimler=import.meta.glob<string>('../../assets/sef/dekor-magazasi/*.webp',{eager:true,query:'?url',import:'default'});
export const dekorResmi=(id:DekorId|'masa',sinif='')=>h('img',{src:resimler['../../assets/sef/dekor-magazasi/'+id+'.webp'],alt:'',class:sinif,draggable:false});

export function dekorRafiniEkle(dukkan:HTMLElement,t:Tepsiler,kaydet:()=>void,yenile:()=>void,sesli:()=>boolean){
  const baslik=dukkan.querySelector('header')!;
  const ac=dugme('Restoran dekorlarını aç','dekor-magaza-ac',dekorResmi('cicek'));
  baslik.append(ac);
  ac.onclick=()=>{
    let satinAlindi=false;
    const panel=h('dialog.dekor-magazasi',{'aria-label':'Restoran dekorları'});
    const geri=dugme('Mağazaya dön','dekor-geri',ikon('geri'));
    geri.onclick=()=>panel.close();
    panel.addEventListener('close',()=>{panel.remove();if(satinAlindi)yenile();else ac.focus();},{once:true});
    const para=h('span.dekor-bakiye',{role:'status'});
    const raf=h('div.dekor-raf');
    const guncelle=()=>{
      para.replaceChildren(ikon('yildiz'),String(t.jeton));
      raf.replaceChildren();
      for(const d of dekorlar){
        const alindi=t.dekorlar?.includes(d.id);
        const kart=dugme(d.ad+(alindi?' restoranda':', '+d.fiyat+' jeton'),'dekor-urun',dekorResmi(d.id),h('span',{},ikon(alindi?'onay':'yildiz'),alindi?'':String(d.fiyat)));
        kart.disabled=!!alindi||t.jeton<d.fiyat;
        kart.onclick=()=>{
          if(t.dekorlar?.includes(d.id)||t.jeton<d.fiyat)return;
          satinAlindi=true;t.jeton-=d.fiyat;(t.dekorlar??=[]).push(d.id);kaydet();
          if(sesli())efekt.dogru();
          const cuzdan=baslik.querySelector('.tatli-cuzdan');
          if(cuzdan){cuzdan.lastChild!.textContent=String(t.jeton);cuzdan.setAttribute('aria-label',t.jeton+' jeton');}
          guncelle();
        };
        raf.append(kart);
      }
    };
    panel.append(geri,para,raf);
    if(t.ustalik.kazanilan.length){
      panel.append(ustalikRafi(t.ustalik,t.gun.no,()=>{satinAlindi=true;kaydet();},sesli));
    }
    dukkan.append(panel);guncelle();panel.showModal();
  };
}
