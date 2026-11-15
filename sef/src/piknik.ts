import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {icinde,jest,type Nokta} from './hareket';
import './piknik.css';

export interface PiknikKaydi {esya:string[]}
interface Esya {id:string;ad:string;ciz:()=>HTMLElement}
const kaynaklar=import.meta.glob<string>('../../assets/sef/piknik/*.webp',{eager:true,import:'default',query:'?url'});
function cizim(ad:string){return h('img',{src:kaynaklar['../../assets/sef/piknik/'+ad+'.webp'],alt:'',draggable:false});}

export function piknigeHazirla(k: PiknikKaydi,tabaklar:Esya[],yaz:()=>void,geri:()=>void,sun:()=>void,ses:()=>void){
  const esyalar=[...tabaklar,{id:'pecete',ad:'Peçete ve çatal',ciz:()=>cizim('pecete')}];
  const yer=h('section.piknik-paket',{'aria-label':'Bahçede piknik'});
  const ortu=cizim('ortu');ortu.className='piknik-ortu';
  const ust=h('header.piknik-ust',{},dugme('Tepsiye dön','dugme',ikon('geri')));
  (ust.firstElementChild as HTMLButtonElement).onclick=geri;
  const ilerleme=h('span.piknik-ilerleme',{'role':'status'});
  ust.append(ilerleme);
  const sepet=dugme('Piknik sepeti','piknik-sepet',cizim('sepet'));
  const raf=h('div.piknik-raf');
  const servis=dugme('Pikniği servis et','piknik-yolla',ikon('servis'),ikon('ileri'));
  const cepler=h('div.piknik-cepler');
  sepet.append(cepler);
  yer.append(ortu,ust,sepet,raf,servis);
  function goster(){
    const tamam=esyalar.every(e=>k.esya.includes(e.id));
    ilerleme.replaceChildren(...esyalar.map(e=>h('i',{'data-dolu':String(k.esya.includes(e.id))})));
    ilerleme.setAttribute('aria-label',k.esya.length+' / '+esyalar.length+' eşya sepette');
    cepler.replaceChildren(...esyalar.map(e=>h('span.piknik-cep',{},k.esya.includes(e.id)?e.ciz():null)));
    servis.hidden=!tamam;
    sepet.setAttribute('aria-label',tamam?'Hazır piknik sepeti':'Piknik sepeti');
  }
  for(const esya of esyalar){
    const tus=dugme(esya.ad+' sepete koy','piknik-esya',esya.ciz());
    tus.dataset.esya=esya.id;tus.disabled=k.esya.includes(esya.id);
    let elde:HTMLElement|undefined;
    const birak=()=>{elde?.remove();elde=undefined;sepet.classList.remove('piknik-yakin');};
    function doldu(){
      birak();if(k.esya.includes(esya.id))return;
      k.esya.push(esya.id);tus.disabled=true;yaz();ses();goster();
      const bolme=cepler.children[esyalar.indexOf(esya)];
      if(!matchMedia('(prefers-reduced-motion:reduce)').matches)
        bolme.animate([{transform:'translateY(-35%)'},{transform:'translateY(4%)',offset:.8},{transform:'none'}],{duration:260});
    }
    function tasi(n:Nokta){
      if(!elde){
        elde=h('div.piknik-elde',{'aria-hidden':true},esya.ciz());
        yer.append(elde);
      }
      const r=yer.getBoundingClientRect();elde.style.left=(n.x-r.left)+'px';elde.style.top=(n.y-r.top)+'px';
      sepet.classList.toggle('piknik-yakin',icinde(sepet,n,10));
    }
    jest(tus,{tasi,birak:(n,_ilk,tik)=>{if(tik||icinde(sepet,n,12))doldu();else birak();},iptal:birak,klavye:doldu});
    raf.append(tus);
  }
  sepet.onclick=()=>{if(servis.hidden)raf.querySelector<HTMLButtonElement>('button:enabled')?.focus();else servis.focus();};
  servis.onclick=()=>{if(servis.disabled||servis.hidden)return;servis.disabled=true;sun();};
  goster();return yer;
}

export function piknikIsareti(){return cizim('sepet-kapali');}
