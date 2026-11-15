import {sutlacKasesi} from './sutlac-gorseli';
import {sutlacOrnegi,type SutlacPorsiyonu} from './sutlac-tarifi';
import {minikKek,type KekPorsiyonu} from './minik-kek';
import {kurabiyeDizisi,type KurabiyeTepsisi} from './kurabiye-tepsisi';
import {tartResmi,tartMeyvesiniCiz,type TartDilimi} from './tart-tarifi';
import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {tatliResmi} from './tatli-gorsel';
import {susBul,suslemeler} from './susleme-katalog';
import type {TatliCesidi as TatliId,TabakRengi,DondurmaTadi,KurabiyeSekli} from './tatli-ekonomi';
import './tatli-sunumu.css';

const tabaklar={
  nane:new URL('../../assets/sef/sis/tabak-nane.webp',import.meta.url).href,
  sari:new URL('../../assets/sef/sis/tabak-sari.webp',import.meta.url).href,
  beyaz:new URL('../../assets/sef/sis/tabak.webp',import.meta.url).href
};
const adlar={nane:'Nane yeşili',sari:'Sarı',beyaz:'Krem'};
// Coordinates on the uncropped food artwork, shared by the plate and the customer's bite.
const temelKonum={
  sutlac:{oran:1.5,x:50,y:44,en:28},
  kurabiye:{oran:560/524,x:50,y:52,en:36},
  dondurma:{oran:420/851,x:58,y:18,en:37},
  'minik-kek':{oran:490/417,x:51,y:47,en:24},
  'meyveli-tart':{oran:900/600,x:51,y:54,en:25}
} as const;
const gofretler=new Set(['sus-026','sus-027','sus-028','sus-029','sus-030','sus-031']);
export function susKonumu(tarif:TatliId,sus?:string){
  const k=temelKonum[tarif];
  // Wafers tuck into the side of the scoop, exposing their decorative top.
  if(tarif==='dondurma'&&sus&&gofretler.has(sus)){
    return {...k,x:76,y:12,en:46,aci:18,gomulu:.16};
  }
  return {...k,aci:0,gomulu:0};
}
function susuGoster(katlar:HTMLElement,tarif:TatliId,sus:string|undefined){
  katlar.querySelector('.tatli-susu')?.remove();
  const secim=susBul(sus);
  if(!secim)return;
  const k=susKonumu(tarif,sus);
  katlar.style.setProperty('--sus-x',k.x+'%');katlar.style.setProperty('--sus-y',k.y+'%');
  katlar.style.setProperty('--sus-en',k.en+'%');katlar.style.setProperty('--sus-aci',k.aci+'deg');
  katlar.style.setProperty('--sus-gomulu',k.gomulu*100+'%');
  const cizim=h('img.tatli-susu',{src:secim.resim,alt:secim.ad,draggable:false,'data-sus':secim.id});
  katlar.append(cizim);
}
export function tatliSunumu(id:TatliId,renk:TabakRengi,fazlaPisti=false,sus?:string,tat?:DondurmaTadi,sekil?:KurabiyeSekli,tart?:TartDilimi[],kurabiye?:KurabiyeTepsisi,kek?:KekPorsiyonu,sutlac?:SutlacPorsiyonu){
  if(id==='sutlac'){
    const p=sutlac??sutlacOrnegi(),kase=sutlacKasesi(p);
    return h('span.pastane-porsiyonu.sutlac-porsiyonu',{'data-tur':id,'data-tabak':renk,'data-desen':p.desen},
      h('span.tatli-yiyecek',{},h('span.tatli-katlari',{},kase)));
  }
  const yemek=tatliResmi(id,tat,sekil);
  if(id==='meyveli-tart'&&tart)yemek.src=tartResmi(fazlaPisti?'kremali-kavruk':'kremali');
  yemek.classList.add('tabaktaki-tatli');
  const katlar=h('span.tatli-katlari',{},id==='kurabiye'&&kurabiye?kurabiyeDizisi(sekil??'yildiz',kurabiye):id==='minik-kek'&&kek?minikKek(kek):yemek);
  if(id==='meyveli-tart'&&tart)katlar.append(...tart.map(tartMeyvesiniCiz));
  katlar.style.setProperty('--oran',String(id==='kurabiye'&&kurabiye?2.1:id==='minik-kek'&&kek?0.98:temelKonum[id].oran));
  susuGoster(katlar,id,sus);
  return h('span.pastane-porsiyonu',{'data-kek-porsiyon':kek?'true':undefined,'data-kurabiye-tepsi':kurabiye?'true':undefined,'data-tabak':renk,'data-sekil':id==='kurabiye'?sekil??'yildiz':undefined,'data-tur':id,'data-tat':id==='dondurma'?tat??'cilek':undefined,'data-fazla':String(fazlaPisti)},
    h('img.pastane-porsiyon-tabagi',{src:tabaklar[renk],alt:'',draggable:false}),
    h('span.tatli-yiyecek',{},katlar));
}
export function susIstegiRozeti(id:string,uydu?:boolean){
  const s=susBul(id);
  if(!s)return;
  const rozet=h('span.sus-istek-rozeti',{role:'img','data-sus':s.id,'aria-label':s.ad+' ile bir bonus jeton'},
    h('img',{src:s.resim,alt:'',draggable:false}),h('b',{},uydu?ikon('onay'):'+1'));
  if(uydu)rozet.dataset.uydu='true';
  return rozet;
}
function suslemeRafi(id:TatliId,porsiyon:HTMLElement,secili:string|undefined,sec:(sus:string|undefined)=>void,istek?:string){
  const liste=suslemeler(id);
  if(!liste.length)return;
  const raf=h('div.tatli-susleme-rafi',{role:'group','aria-label':'Tatlı süsü seç'});
  const katlar=porsiyon.querySelector<HTMLElement>('.tatli-katlari')!;
  let sayfa=Math.max(0,Math.floor(liste.findIndex(s=>s.id===(secili??istek))/4));
  const sayfaSayisi=Math.ceil(liste.length/4);
  const once=dugme('Önceki süsler','tatli-sus-yon',ikon('geri'));
  const sonra=dugme('Sonraki süsler','tatli-sus-yon',ikon('ileri'));
  const gozler=h('div.tatli-sus-gozleri');
  raf.append(once,gozler,sonra);
  let ucus:Animation|undefined;
  function yerlestir(sus:string,baslangic:DOMRect,dokunma:boolean){
    ucus?.cancel();
    secili=dokunma&&secili===sus?undefined:sus;
    sec(secili);susuGoster(katlar,id,secili);
    porsiyon.dispatchEvent(new CustomEvent('pastane-sus-yerlesti',{bubbles:true,detail:!!secili&&secili===istek}));
    for(const b of gozler.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.sus===secili));
    const cizim=katlar.querySelector<HTMLElement>('.tatli-susu');
    if(!cizim||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const hedef=cizim.getBoundingClientRect();
    const kaynak=(cizim as HTMLImageElement).src;
    const golge=h('img.tatli-sus-ucusta',{src:kaynak,alt:'','aria-hidden':true});
    const sahne=porsiyon.closest('.tatli-tezgahi');
    if(!sahne)return;
    const zemin=sahne.getBoundingClientRect();
    golge.style.left=(hedef.left-zemin.left)+'px';golge.style.top=(hedef.top-zemin.top)+'px';
    golge.style.width=hedef.width+'px';golge.style.height=hedef.height+'px';
    sahne.append(golge);cizim.style.visibility='hidden';
    const dx=baslangic.x+baslangic.width/2-hedef.x-hedef.width/2;
    const dy=baslangic.y+baslangic.height/2-hedef.y-hedef.height/2;
    ucus=golge.animate([{transform:'translate('+dx+'px,'+dy+'px) scale(1.1)'},
      {transform:'translate('+dx*.4+'px,'+(dy*.4-9)+'px)',offset:.55},
      {transform:'translate(0,0)'}],{duration:dokunma?300:170,easing:'ease-out'});
    const temizle=()=>{golge.remove();cizim.style.visibility='';};
    ucus.onfinish=temizle;ucus.oncancel=temizle;
  }
  function ciz(){
    once.hidden=sonra.hidden=sayfaSayisi===1;
    once.disabled=sayfa===0;sonra.disabled=sayfa+1>=sayfaSayisi;
    gozler.replaceChildren();
    for(const s of liste.slice(sayfa*4,sayfa*4+4)){
      const b=dugme(s.ad,'tatli-sus-dugmesi',h('img',{src:s.resim,alt:'',draggable:false}));
      b.dataset.sus=s.id;if(istek===s.id)b.dataset.istenen="true";b.setAttribute('aria-pressed',String(s.id===secili));
      let bas:{x:number,y:number}|undefined;
      let elde:HTMLImageElement|undefined;
      let suruklendi=false;
      b.onpointerdown=e=>{
        if(!e.isPrimary||e.button!==0)return;
        bas={x:e.clientX,y:e.clientY};suruklendi=false;b.setPointerCapture(e.pointerId);
      };
      b.onpointermove=e=>{
        if(!bas||!e.isPrimary)return;
        if(!elde&&Math.hypot(e.clientX-bas.x,e.clientY-bas.y)<8)return;
        if(!elde){
          elde=h('img.tatli-sus-elde',{src:s.resim,alt:'','aria-hidden':true,draggable:false});
          document.body.append(elde);suruklendi=true;
        }
        elde.style.left=e.clientX+'px';elde.style.top=e.clientY+'px';
      };
      const temizle=()=>{bas=undefined;elde?.remove();elde=undefined;};
      b.onpointerup=e=>{
        if(!e.isPrimary||!bas)return;
        if(elde){
          const r=porsiyon.getBoundingClientRect();
          if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){
            yerlestir(s.id,elde.getBoundingClientRect(),false);
          }
        }
        temizle();
      };
      b.onlostpointercapture=temizle;b.onpointercancel=temizle;
      b.onclick=e=>{if(!suruklendi||e.detail===0)yerlestir(s.id,b.getBoundingClientRect(),true);suruklendi=false;};
      gozler.append(b);
    }
  }
  once.onclick=()=>{if(sayfa>0){sayfa--;ciz();}};
  sonra.onclick=()=>{if(sayfa+1<sayfaSayisi){sayfa++;ciz();}};
  ciz();return raf;
}
export function tatliSunumTezgahi(id:TatliId,secili:TabakRengi,sec:(r:TabakRengi)=>void,sus:string|undefined,susSec:(s:string|undefined)=>void,istek?:string,tat?:DondurmaTadi,sekil?:KurabiyeSekli,tart?:TartDilimi[],kurabiye?:KurabiyeTepsisi,kek?:KekPorsiyonu,fazlaPisti=false){
  const porsiyon=tatliSunumu(id,secili,fazlaPisti,sus,tat,sekil,tart,kurabiye,kek);
  const renkler=h('div.pastane-tabaklari',{role:'group','aria-label':'Servis tabağını seç'});
  for(const renk of Object.keys(tabaklar) as TabakRengi[]){
    const b=h('button',{type:'button','aria-label':adlar[renk]+' servis tabağı','aria-pressed':String(renk===secili)},h('img',{src:tabaklar[renk],alt:'',draggable:false}));
    b.onclick=()=>{
      porsiyon.dataset.tabak=renk;
      porsiyon.querySelector<HTMLImageElement>('.pastane-porsiyon-tabagi')!.src=tabaklar[renk];
      for(const tus of renkler.querySelectorAll('button'))tus.setAttribute('aria-pressed',String(tus===b));
      sec(renk);
    };
    renkler.append(b);
  }
  return {sunum:h('div.pastane-sunum',{},porsiyon,renkler),secimler:suslemeRafi(id,porsiyon,sus,susSec,istek)};
}
