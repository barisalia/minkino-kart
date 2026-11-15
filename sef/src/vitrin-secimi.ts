import {sutlacDesenAdi} from './sutlac-tarifi';
import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {kalipAdi,type TatliCesidi} from './tatli-ekonomi';
import {tatliSunumu} from './tatli-sunumu';
import type {TatliPorsiyonu} from './pastane-kaydi';
import {susBul} from './susleme-katalog';
import {dondurmaAdlari} from './dondurma-kepcesi';
import {kekFarki} from './minik-kek';
import './vitrin-secimi.css';

function tabak(tur:TatliCesidi,p:TatliPorsiyonu){
  return tatliSunumu(tur,p.tabak,p.fazlaPisti,p.sus,p.tat,p.sekil,p.tart,p.kurabiye,p.kek,p.sutlac);
}

function porsiyonAdi(tur:TatliCesidi,p:TatliPorsiyonu){
  const isim=tur==='sutlac'&&p.sutlac?sutlacDesenAdi[p.sutlac.desen]+' desenli sütlaç':tur==='kurabiye'?kalipAdi[p.sekil??'yildiz']+' kurabiye':
    tur==='dondurma'?dondurmaAdlari[p.tat??'cilek']+' dondurma':
    tur==='minik-kek'?(p.kek&&kekFarki(p.kek,'orman')===0?'Kakaolu, yaban mersinli minik kek':p.kek&&kekFarki(p.kek,'muz')===0?'Vanilyalı, muzlu minik kek':p.kek&&kekFarki(p.kek,'cilek')===0?'Çilekli minik kek':'Minik kek'):'Meyveli tart';
  const sus=susBul(p.sus);
  return sus?isim+', '+sus.ad:isim;
}

export function vitrindenSec(tur:TatliCesidi,isim:string,stok:TatliPorsiyonu[],istek:()=>HTMLElement,sec:(p:TatliPorsiyonu)=>void){
  const giris=dugme(isim+' vitrinden tepsiye al','vitrinden-sun',tabak(tur,stok[0]),h('b',{},String(stok.length)),ikon('ileri'));
  giris.onclick=()=>{
    if(stok.length===1){sec(stok[0]);return;}
    if(!stok.length||giris.parentElement?.querySelector('dialog[open]'))return;
    const pencere=h('dialog.vitrin-secimi',{'aria-label':'Vitrinden bir porsiyon seç'});
    const kapat=()=>{pencere.close();pencere.remove();if(giris.isConnected)giris.focus();};
    const geri=dugme('Tepsiye dön','vitrin-geri',ikon('geri'));geri.onclick=kapat;
    const istenen=h('div.vitrin-istegi',{role:'img','aria-label':'Müşterinin istediği porsiyon'},istek());
    const raf=h('div.vitrin-rafi');
    const gezin=h('div.vitrin-gez');
    let sayfa=0;
    function diz(){
      raf.replaceChildren();gezin.replaceChildren();
      stok.slice(sayfa*3,sayfa*3+3).forEach((p,i)=>{
        const b=dugme((sayfa*3+i+1)+'. porsiyon, '+porsiyonAdi(tur,p),'vitrin-tabagi',tabak(tur,p));
        b.onclick=()=>{kapat();sec(p);};raf.append(b);
      });
      if(stok.length<=3)return;
      for(const ileri of [false,true]){
        const b=dugme(ileri?'Sonraki porsiyonlar':'Önceki porsiyonlar','vitrin-ok',ikon(ileri?'ileri':'geri'));
        b.disabled=ileri?(sayfa+1)*3>=stok.length:sayfa===0;
        b.onclick=()=>{sayfa+=ileri?1:-1;diz();raf.querySelector('button')?.focus();};gezin.append(b);
      }
    }
    diz();pencere.append(geri,istenen,raf,gezin);giris.parentElement?.append(pencere);
    pencere.addEventListener('cancel',e=>{e.preventDefault();kapat();});
    pencere.showModal();raf.querySelector('button')?.focus();
  };
  return giris;
}
