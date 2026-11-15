import {h} from '../../src/ui/dom';
import {menemenIstegi,menemenKivami,sebzeAdlari,type KahvaltiSebzesi,type Menemen} from './menemen-tarifi';
import './menemen.css';

const resimler=import.meta.glob<string>(['../../assets/sef/menemen/*.webp','../../assets/sef/nesneler/{domates,kasik,dograma-bicagi}.webp','../../assets/sef/firin/{mantar,biber}.webp','../../assets/sef/krep/yumurta.webp','../../assets/sef/mucver/yumurta-acik.webp'],{eager:true,query:'?url',import:'default'});
export function mnResim(yol:string,sinif=''){
  return h('img',{src:resimler['../../assets/sef/'+yol+'.webp'],alt:'',draggable:false,class:sinif});
}
export const mnSebze=(s:KahvaltiSebzesi,kesik=false)=>mnResim(kesik?'menemen/'+({domates:'kup',biber:'biber-halka',mantar:'mantar-dilim'}[s]):s==='domates'?'nesneler/domates':'menemen/'+s);
export function menemenSahani(t:Pick<Menemen,'sure'|'sebzeler'>){
  const kivam=menemenKivami(t.sure);
  const tabak=h('span.mn-sahan',{'data-kivam':kivam,'aria-label':'Menemen, '+t.sebzeler.map(s=>sebzeAdlari[s]).join(', ')},mnResim('menemen/sahan','mn-bakir'));
  const yemek=h('span.mn-yemek');
  // Each spoonful owns a third of the surface and the garnishes in that third.
  for(let i=0;i<3;i++){
    const parca=h('span.mn-porsiyon',{'data-lokma':i},mnResim('menemen/'+kivam,'mn-yuzey'));
    for(const s of t.sebzeler.filter(s=>s!=='domates')){
      const ic=mnSebze(s,true);ic.className='mn-tane';ic.dataset.tur=s;
      ic.style.left=((i+.36+(s==='mantar'?.24:0))*100/3)+'%';ic.style.top=([49,36,53][i]+(s==='mantar'?12:0))+'%';
      parca.append(ic);
    }
    yemek.append(parca);
  }
  tabak.append(yemek);return tabak;
}
export function menemenOrnegi(id:string){
  const istek=menemenIstegi(id);
  return menemenSahani({sebzeler:istek.sebzeler,sure:istek.kivam==='sulu'?2800:6500});
}
