import {h} from '../../src/ui/dom';
import {sutlacDesenAdi,type SutlacPorsiyonu,type SutlacDeseni} from './sutlac-tarifi';
import './sutlac.css';

const cizimler=import.meta.glob<string>('../../assets/sef/sutlac/*.webp',{eager:true,import:'default',query:'?url'});
export const sutlacSrc=(id:string)=>cizimler['../../assets/sef/sutlac/'+id+'.webp'];
export const slResim=(id:string,sinif='')=>h('img',{src:sutlacSrc(id),alt:'',class:sinif,draggable:false});
export const sutlacSunumResmi=(p:SutlacPorsiyonu)=>sutlacSrc('ornek-'+p.desen);
export function sutlacKasesi(p:Partial<SutlacPorsiyonu>){
  const doluluk=p.doluluk??0;
  const kase=h('span.sl-kase',{role:'img','aria-label':p.desen?sutlacDesenAdi[p.desen]+' desenli sütlaç':'Sütlaç kâsesi','data-desen':p.desen,'data-kivam':p.kivam},slResim('kase','sl-kase-dis'));
  if(!doluluk)return kase;
  const yuzey=h('span.sl-ic',{},slResim(!p.kivam||p.kivam==='ipeksi'?'sutlac':p.kivam,'sl-sutlac-yuzeyi'));
  const en=63+23*doluluk;
  yuzey.style.width=en+'%';yuzey.style.height=(19+23*doluluk)+'%';yuzey.style.top=(27-17*doluluk)+'%';
  if(p.desen&&p.toz){
    const motif=slResim(p.desen,'sl-desen');
    // A light dusting colours the whole opening; its density increases with each pass.
    motif.style.opacity=String(.22+.78*p.toz);yuzey.append(motif);
  }
  kase.append(yuzey);return kase;
}
export function sutlacIstegiRozeti(desen:SutlacDeseni){
  return h('span.sl-desen-fisi',{role:'img','aria-label':sutlacDesenAdi[desen]+' tarçın deseni'},slResim(desen));
}
