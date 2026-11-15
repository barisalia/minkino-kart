import {h} from '../../src/ui/dom';
import {tostFisi,tostFisleri,tostMalzemeAdi,type TostKati,type TostMalzemesi,type TostKizarmasi,type TostTaslak} from './tost-tarifi';
const resimler=import.meta.glob<string>(['../../assets/sef/tost/*.webp','../../assets/sef/nesneler/{domates-dilim,salatalik-dilim}.webp','../../assets/sef/firin/{biber,mantar,zeytin}.webp'],{eager:true,query:'?url',import:'default'});
const malzemeler:Record<TostMalzemesi,string>={
  kasar:'tost/kasar',domates:'nesneler/domates-dilim',salatalik:'nesneler/salatalik-dilim',biber:'firin/biber',mantar:'firin/mantar',zeytin:'firin/zeytin'
};
export function tostResmi(yol:string,sinif=''){return h('img',{src:resimler['../../assets/sef/'+yol+'.webp'],class:sinif,alt:'',draggable:false});}
export function tostMalzemeResmi(tur:TostMalzemesi){return tostResmi(malzemeler[tur]);}
export function ekmekYolu(k:TostKizarmasi){return 'tost/'+(k==='acik'?'ekmek':k);}
export const katEni:Record<TostMalzemesi,number>={kasar:71,domates:37,mantar:33,biber:38,zeytin:19,salatalik:30};
/** Same layout in the prep board, press, serving plate and customer bite. */
export function tostYigini(katlar:readonly TostKati[],kapali:boolean,kizartma:TostKizarmasi='acik'){
  const kap=h('span.tost-yigin',{'data-kapali':String(kapali),'data-kizartma':kizartma});
  const taban=tostResmi('tost/ekmek','tost-alt');kap.append(taban);
  const yuk=Math.min(14,3+katlar.length*1.65);
  for(const [i,k] of katlar.entries()){
    const parca=tostMalzemeResmi(k.tur);
    parca.dataset.sira=String(i);parca.classList.add('tost-kat');parca.dataset.tur=k.tur;parca.alt=tostMalzemeAdi[k.tur];
    const s=(i+1)/Math.max(1,katlar.length);
    // Project the fillings onto the thin front edge when the lid is pressed down.
    const x=kapali?15+k.x*.70:7+k.x*.86;
    const y=kapali?89+(k.y-50)*.075-s*yuk*.55:14+k.y*.72-i*.55;
    parca.style.setProperty('--x',x+'%');parca.style.setProperty('--y',y+'%');
    parca.style.setProperty('--en',katEni[k.tur]+'%');
    if(kapali)parca.style.setProperty('--yassilik',k.tur==='kasar'?'.22':'.37');
    kap.append(parca);
  }
  if(kapali){
    const ust=tostResmi(ekmekYolu(kizartma),'tost-ust');
    ust.style.bottom=(12+yuk)+'%';kap.append(ust);
  }
  return kap;
}
export function tostServisi(t:TostTaslak){return tostYigini(t.katlar,true,t.kizartma);}

export function tostOrnegi(id='peynirli-tost'){
  const istek=tostFisleri[tostFisi(id)];
  return tostYigini(istek.icindekiler.map((tur,i)=>({tur,x:[40,64,25][i],y:68})),true,istek.kizartma);
}
