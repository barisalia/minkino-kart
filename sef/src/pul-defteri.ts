import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {pullar} from './pastane-pullari';
import {tatliKademeler,tatliMi,type TatliCesidi} from './tatli-ekonomi';
import {tatliResmi} from './tatli-gorsel';
import type {Pastane} from './pastane-kaydi';
import './pul-defteri.css';

const SAYFADA=6;
export function pulEkle(pastane:Pastane,tarif:TatliCesidi){
  const adet=pastane.pullar[tarif]??0;
  if(!pullar(tarif)[adet]?.resim)return;
  pastane.pullar[tarif]=adet+1;
  return adet+1;
}

export function pulDefteriDugmesi(pastane:Pastane,tarif:TatliCesidi='kurabiye',yeni?:number){
  const son=yeni?pullar(tarif)[yeni-1]:undefined;
  const b=dugme(son?'Yeni pul: '+son.ad:'Pastane pul defterini aç',son?'servis-pulu':'vitrin-pul-defteri',
    son?h('img',{src:son.resim,alt:'',draggable:false}):ikon('album'));
  b.onclick=()=>defteriAc(b,pastane,tarif,yeni);
  return b;
}

function defteriAc(acici:HTMLButtonElement,pastane:Pastane,tarif:TatliCesidi,yeni?:number){
  const yer=acici.closest('section');
  if(!yer||yer.querySelector('.pastane-pul-defteri'))return;
  const ilkTarif=tarif;
  let sayfa=Math.floor(Math.max(0,(yeni??pastane.pullar[tarif]??1)-1)/SAYFADA);
  let buyuk:number|undefined;
  const kitap=h('dialog.pastane-pul-defteri',{'aria-label':'Pastane pul defteri'});
  const geri=dugme('Defteri kapat','pul-ok',ikon('geri'));
  function kapat(){
    if(buyuk!==undefined){
      const sira=buyuk;buyuk=undefined;ciz();
      kitap.querySelector<HTMLButtonElement>('[data-sira="'+sira+'"]')?.focus();return;
    }
    kitap.close();kitap.remove();acici.focus({preventScroll:true});
  }
  geri.onclick=kapat;
  const sekmeler=h('div.pul-sekmeleri',{'role':'group','aria-label':'Tatlı çeşitleri'});
  const sekmeDugmeleri=new Map<TatliCesidi,HTMLButtonElement>();
  for(const k of tatliKademeler){
    const id=k.simge;
    if(!tatliMi(id))continue;
    const b=dugme(k.ad+' pulları','pul-sekme',tatliResmi(id));
    b.onclick=()=>{
      tarif=id;buyuk=undefined;sayfa=Math.floor(Math.max(0,(pastane.pullar[id]??1)-1)/SAYFADA);ciz();
    };
    sekmeler.append(b);sekmeDugmeleri.set(id,b);
  }
  const adet=h('b.pul-sayac',{'aria-live':'polite'});
  const govde=h('div.pul-sayfa');
  const ileri=dugme('Sonraki pul sayfası','pul-ok',ikon('ileri'));
  const once=dugme('Önceki pul sayfası','pul-ok',ikon('geri'));
  const ayak=h('footer.pul-sayfalama',{},once,h('span.pul-sayfa-noktasi',{'aria-hidden':true}),ileri);
  function ciz(){
    const liste=pullar(tarif),toplanan=pastane.pullar[tarif]??0;
    for(const [id,b] of sekmeDugmeleri)b.setAttribute('aria-pressed',String(id===tarif));
    adet.textContent=toplanan+' / '+liste.length;
    geri.setAttribute('aria-label',buyuk===undefined?'Defteri kapat':'Pullara dön');
    govde.replaceChildren();ayak.hidden=buyuk!==undefined;
    if(buyuk!==undefined){
      const pul=liste[buyuk];govde.append(h('img.pul-yakin',{src:pul.resim,alt:pul.ad,draggable:false}));
      return;
    }
    liste.slice(sayfa*SAYFADA,(sayfa+1)*SAYFADA).forEach((pul,i)=>{
      const sira=sayfa*SAYFADA+i,acik=sira<toplanan&&!!pul.resim;
      const b=dugme(acik?pul.ad+' pulunu büyüt':'Henüz kazanılmamış pul','pul-yeri',
        acik?h('img',{src:pul.resim,alt:'',draggable:false}):ikon('yildiz'));
      b.disabled=!acik;b.dataset.sira=String(sira);
      if(tarif===ilkTarif&&yeni===sira+1)b.dataset.yeni='true';
      b.onclick=()=>{buyuk=sira;ciz();geri.focus({preventScroll:true});};
      govde.append(b);
    });
    once.disabled=sayfa===0;ileri.disabled=(sayfa+1)*SAYFADA>=liste.length;
    const merkez=ayak.querySelector('span.pul-sayfa-noktasi')!;
    if(toplanan===0&&sayfa===0){
      merkez.removeAttribute('aria-hidden');merkez.setAttribute('role','img');
      merkez.setAttribute('aria-label','Bu tatlıyı bir müşteriye sununca ilk pulunu kazanırsın');
      merkez.replaceChildren(tatliResmi(tarif),ikon('ileri'),ikon('servis'),ikon('ileri'),ikon('album'));
    }else{
      merkez.setAttribute('aria-hidden','true');merkez.removeAttribute('role');merkez.removeAttribute('aria-label');
      merkez.replaceChildren(...Array.from({length:Math.ceil(liste.length/SAYFADA)},(_,i)=>h('i',{'data-secili':String(i===sayfa)})));
    }
  }
  once.onclick=()=>{sayfa--;ciz();};ileri.onclick=()=>{sayfa++;ciz();};
  kitap.append(h('header.pul-ust',{},geri,sekmeler,adet),govde,ayak);
  kitap.addEventListener('cancel',e=>{e.preventDefault();kapat();});
  kitap.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();kapat();}});
  ciz();yer.append(kitap);kitap.showModal();
}
