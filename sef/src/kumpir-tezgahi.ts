import {h} from '../../src/ui/dom';
import {efekt} from '../../src/audio/efekt';
import {dugme,ikon} from './gorsel';
import {kumpirSunumu,kumpirResmi} from './kumpir-gorseli';
import {yeniKumpir,kumpirOku,kumpirdeYer,kumpirAd,kumpirIstegi,type KumpirMal,type KumpirTaslak} from './kumpir-tarifi';
import rehber from './kumpir-replikleri.json';
import {kumpirTemasSesi} from './mutfak-ses';
import './kumpir.css';
const catal=new URL('../../assets/sef/nesneler/lokma-catali.webp',import.meta.url).href;
const buhar=new URL('../../assets/sef/tepsi/tavuk/buhar.webp',import.meta.url).href;
const bolgeler=[[26,39],[51,31],[72,41]] as const;
type Ayar={istek?:readonly KumpirMal[];taslak?:KumpirTaslak;kaydet:(t:KumpirTaslak)=>void;teslim:(t:KumpirTaslak)=>void;geri:()=>void;sesli:()=>boolean;soyle:(s:string)=>void};
export function kumpirTezgahi(a:Ayar){
  const t=kumpirOku(a.taslak)??yeniKumpir(),sahne=h('section.kumpir-tezgahi',{'aria-label':'Kumpir tezgâhı'});
  const geri=dugme('Siparişe dön','kp-geri',ikon('geri'));
  const dinle=dugme('Bu adımı dinle','kp-geri kp-dinle',ikon('hoparlor'));dinle.hidden=!a.sesli();
  const istek=a.istek??kumpirIstegi;
  const fis=h('div.kp-fis',{'aria-label':'Kumpir siparişi'},...istek.map(k=>kumpirResmi(k)));
  const tahta=h('div.kp-tahta'),raf=h('div.kp-raf');
  sahne.append(geri,dinle,fis,tahta,raf);
  let sec:KumpirMal|undefined,teslim=false,yeniAcildi=false;
  const kaydet=()=>a.kaydet({...t,katlar:t.katlar.map(k=>({...k}))});
  const ses=(fn:()=>void)=>{if(a.sesli())fn();};
  const gec=(e:KumpirTaslak['evre'])=>{t.evre=e;kaydet();ciz();};
  function dokun(b:HTMLButtonElement,is:()=>void){
    b.onpointerup=e=>{if(e.isPrimary&&e.button===0)is();};
    b.onclick=e=>{if(e.detail===0)is();};
  }
  dokun(geri,a.geri);dokun(dinle,()=>a.soyle(rehber[t.evre]));
  function ac(){
    const b=dugme('Patatesi çizgiden aç','kp-patates-ac',kumpirResmi('kapali'));
    const ikiYan=kumpirResmi('acik','kp-iki-yan');
    const iz=h('i.kp-yarik');const el=h('span.kp-ac-el',{},ikon('el'));b.append(ikiYan,iz,el);
    const goster=()=>{
      const uzunluk=t.yarik*52;
      el.style.left=(24+uzunluk)+'%';iz.style.width=uzunluk+'%';
      ikiYan.style.clipPath='ellipse('+uzunluk/2+'% '+(t.yarik*17)+'% at '+(24+uzunluk/2)+'% 35%)';
      b.dataset.yarik=String(Math.round(t.yarik*100));
    };
    const iler=(n:number)=>{
      if(t.evre!=='ac'||n<=t.yarik)return;
      t.yarik=Math.min(1,n);goster();
      if(t.yarik<1){kaydet();return;}
      yeniAcildi=true;ses(()=>kumpirTemasSesi('kabuk'));gec('ez');
    };
    let bas=false,ilkX=0,ilkY=0,oynadi=false;
    const nokta=(e:PointerEvent)=>{const r=b.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};};
    b.onpointerdown=e=>{
      if(e.button!==0||!e.isPrimary)return;const p=nokta(e);
      if(Math.abs(p.y-.32)>.25||p.x>.24+t.yarik*.52+.20)return;
      bas=true;oynadi=false;ilkX=e.clientX;ilkY=e.clientY;b.setPointerCapture(e.pointerId);
    };
    b.onpointermove=e=>{
      if(!bas)return;
      const p=nokta(e);if(Math.hypot(e.clientX-ilkX,e.clientY-ilkY)>6)oynadi=true;
      if(oynadi&&Math.abs(p.y-.32)<.26)iler((p.x-.24)/.52);
    };
    b.onpointerup=()=>{if(bas&&!oynadi)iler(t.yarik+.25);bas=false;};
    b.onpointercancel=b.onlostpointercapture=()=>{bas=false;};
    b.onclick=e=>{if(e.detail===0)iler(t.yarik+.34);};
    goster();tahta.append(b);
  }
  function ez(){
    const bolge=h('div.kp-ezme',{'aria-label':'Patatesi çatalla ez'},kumpirResmi('acik','kp-ez-taban'));
    const yumu=kumpirResmi('ezilmis','kp-yumusayan');bolge.append(yumu);
    if(yeniAcildi){
      yeniAcildi=false;
      if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
        const sicak=h('img.kp-ac-buhar',{src:buhar,alt:'',draggable:false});
        sicak.onanimationend=()=>sicak.remove();bolge.append(sicak);
      }
    }
    const iz=h('span.kp-ez-izler');bolge.append(iz);
    const cat=h('img.kp-catal',{src:catal,alt:'',draggable:false});bolge.append(cat);
    let son=false,aktifParmak:number|undefined;
    const parmakYerinde=(x:number,y:number)=>{
      const r=bolge.getBoundingClientRect(),px=(x-r.left)/r.width*100,py=(y-r.top)/r.height*100;
      if(Math.abs(px-50)>41||Math.abs(py-41)>28)return;
      cat.style.left=px+'%';cat.style.top=py+'%';
      const i=bolgeler.findIndex(([hx,hy],i)=>!(t.ezme&(1<<i))&&((px-hx)/12)**2+((py-hy)/13)**2<1);
      if(i>=0)bolge.querySelector<HTMLButtonElement>('button[data-bolge="'+i+'"]')?.click();
    };
    bolge.onpointerdown=e=>{
      if(e.button!==0||!e.isPrimary||son)return;aktifParmak=e.pointerId;bolge.setPointerCapture(e.pointerId);
      parmakYerinde(e.clientX,e.clientY);
    };
    bolge.onpointermove=e=>{if(e.pointerId===aktifParmak&&!son)parmakYerinde(e.clientX,e.clientY);};
    bolge.onpointerup=bolge.onpointercancel=bolge.onlostpointercapture=()=>{aktifParmak=undefined;};
    const ezilmisBolge=(i:number,x:number,y:number)=>{
      const kat=kumpirResmi('ezilmis','kp-yerel-ezme');kat.style.clipPath='ellipse(16% 20% at '+x+'% '+y+'%)';
      kat.dataset.bolge=String(i);iz.append(kat);
    };
    const basDugme=(b:HTMLButtonElement,is:()=>void)=>{
      b.onclick=e=>{if(e.detail===0)is();};
    };
    for(const [i,[x,y]] of bolgeler.entries()){
      const b=dugme((i+1)+'. patates parçasını ez','kp-ez-yer');b.style.left=x+'%';b.style.top=y+'%';b.dataset.bolge=String(i);
      const koy=(el:HTMLElement)=>{el.style.left=x+'%';el.style.top=y+'%';};
      if(t.ezme&(1<<i)){b.hidden=true;ezilmisBolge(i,x,y);}
      basDugme(b,()=>{
        if(t.ezme&(1<<i)||son)return;t.ezme|=1<<i;kaydet();b.hidden=true;
        ezilmisBolge(i,x,y);koy(cat);
        const hareket=matchMedia('(prefers-reduced-motion:reduce)').matches?0:260;
        if(hareket)cat.animate([{translate:'0 -18%'},{translate:'0 0',offset:.48},{translate:'0 -7%'}],{duration:hareket});
        ses(()=>kumpirTemasSesi('ez'));
        if(t.ezme===7){son=true;yumu.style.opacity='1';setTimeout(()=>{if(sahne.isConnected)gec('koy');},hareket+80);}
      });bolge.append(b);
    }
    const siradaki=bolgeler.find((_,i)=>!(t.ezme&(1<<i)))??bolgeler[0];cat.style.left=siradaki[0]+'%';cat.style.top=siradaki[1]+'%';
    tahta.append(bolge);
  }
  function koy(){
    const sunum=kumpirSunumu(t.katlar);const dusur=dugme('Seçtiğin malzemeyi patatese bırak','kp-ust',sunum);tahta.append(dusur);
    function yerles(id:KumpirMal,x:number,y:number){
      if(t.katlar.length>=7)return;
      t.katlar.push({id,...kumpirdeYer(x,y)});sec=undefined;kaydet();ses(()=>kumpirTemasSesi(id));ciz();tahta.querySelector('.kumpir-ic:last-child')?.classList.add('kp-kondu');
    }
    let yerDegistir:{i:number;el:HTMLImageElement;ilkX:number;ilkY:number;x:number;y:number;suruklendi:boolean}|undefined;
    const yer=(x:number,y:number)=>{const r=sunum.getBoundingClientRect();return {x:100*(x-r.left)/r.width,y:100*(y-r.top)/r.height};};
    const disinda=(p:{x:number;y:number})=>p.y< -8||p.y>105||p.x< -8||p.x>108;
    dusur.onpointerdown=e=>{
      if(sec||e.button!==0||!e.isPrimary)return;
      const katlar=[...sunum.querySelectorAll<HTMLImageElement>('.kumpir-ic')].reverse();
      const el=katlar.find(k=>{
        const r=k.getBoundingClientRect(),x=(e.clientX-r.x-r.width/2)/(r.width*.5),y=(e.clientY-r.y-r.height/2)/(r.height*.5);
        return x*x+y*y<1;
      });
      if(!el)return;
      const i=t.katlar.length-1-katlar.indexOf(el),k=t.katlar[i];
      yerDegistir={i,el,ilkX:e.clientX,ilkY:e.clientY,x:k.x,y:k.y,suruklendi:false};dusur.setPointerCapture(e.pointerId);
    };
    dusur.onpointermove=e=>{
      if(!yerDegistir)return;
      const k=yerDegistir;
      if(!k.suruklendi&&Math.hypot(e.clientX-k.ilkX,e.clientY-k.ilkY)<6)return;
      const p=yer(e.clientX,e.clientY),hedef=kumpirdeYer(p.x,p.y);
      Object.assign(k,hedef,{suruklendi:true});
      const disari=disinda(p);
      k.el.style.left=(disari?p.x:k.x)+'%';k.el.style.top=(disari?p.y:k.y)+'%';k.el.classList.toggle('kp-disari',disari);
    };
    dusur.onpointerup=e=>{
      if(yerDegistir){const k=yerDegistir;yerDegistir=undefined;
        if(k.suruklendi){
          const p=yer(e.clientX,e.clientY);
          if(disinda(p)){t.katlar.splice(k.i,1);kaydet();ses(efekt.dokunma);ciz();}
          else{t.katlar[k.i]={...t.katlar[k.i],x:k.x,y:k.y};kaydet();ses(efekt.dokunma);}
        }
        return;
      }
      if(!sec||e.button!==0)return;const p=yer(e.clientX,e.clientY);yerles(sec,p.x,p.y);
    };
    dusur.onpointercancel=dusur.onlostpointercapture=()=>{
      if(!yerDegistir)return;const {el,i}=yerDegistir;el.style.left=t.katlar[i].x+'%';el.style.top=t.katlar[i].y+'%';el.classList.remove('kp-disari');yerDegistir=undefined;
    };
    dusur.onclick=e=>{if(sec&&e.detail===0)yerles(sec,50,44);};
    for(const id of Object.keys(kumpirAd) as KumpirMal[]){
      const b=dugme(kumpirAd[id],'kp-malzeme',kumpirResmi(id));b.dataset.malzeme=id;b.disabled=t.katlar.length>=7;b.setAttribute('aria-pressed',String(sec===id));
      let ilk:{x:number;y:number}|undefined,elde:HTMLImageElement|undefined,tasi=false;
      const bitir=()=>{elde?.remove();elde=undefined;ilk=undefined;};
      b.onpointerdown=e=>{if(!e.isPrimary||e.button!==0)return;ilk={x:e.clientX,y:e.clientY};tasi=false;b.setPointerCapture(e.pointerId);};
      b.onpointermove=e=>{if(!ilk||Math.hypot(e.clientX-ilk.x,e.clientY-ilk.y)<7&&!tasi)return;tasi=true;
        if(!elde){elde=kumpirResmi(id,'kp-elde');sahne.append(elde);}
        const r=sahne.getBoundingClientRect();elde.style.left=e.clientX-r.left+'px';elde.style.top=e.clientY-r.top+'px';
      };
      const secMalzemeyi=()=>{sec=id;for(const btn of raf.querySelectorAll('.kp-malzeme'))btn.setAttribute('aria-pressed',String(btn===b));};
      b.onpointerup=e=>{if(!ilk)return;const p=yer(e.clientX,e.clientY);bitir();if(tasi){if(p.x>=0&&p.x<=100&&p.y>=0&&p.y<85)yerles(id,p.x,p.y);}else secMalzemeyi();};
      b.onpointercancel=b.onlostpointercapture=bitir;b.onclick=e=>{if(e.detail===0){secMalzemeyi();dusur.focus();}};
      raf.append(b);
    }
    const geriAl=dugme('Son malzemeyi geri al','kp-tus',ikon('tekrar'));geriAl.disabled=!t.katlar.length;dokun(geriAl,()=>{t.katlar.pop();kaydet();ciz();});
    const b=dugme('Kumpiri tepsiye koy','kp-tus kp-hazir',ikon('onay'));b.disabled=!t.katlar.length;
    dokun(b,()=>{if(teslim)return;teslim=true;b.disabled=true;ses(efekt.dogru);a.teslim({...t,katlar:[...t.katlar]});});
    raf.append(geriAl,b);
  }
  function ciz(){
    sahne.dataset.evre=t.evre;tahta.replaceChildren();raf.replaceChildren();
    for(const [i,img] of Array.from(fis.querySelectorAll('img')).entries()){
      img.dataset.secilmis=String(t.katlar.some(k=>k.id===istek[i]));
      img.alt=kumpirAd[istek[i]]+(img.dataset.secilmis==='true'?' eklendi':' isteniyor');
      img.setAttribute('aria-label',img.alt);
    }
    if(t.evre==='ac')ac();else if(t.evre==='ez')ez();else koy();
  }
  ciz();return sahne;
}
