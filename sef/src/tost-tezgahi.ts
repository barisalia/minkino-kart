import rehber from './tost-replikleri.json';
import {pisirmeSaati} from './pisirme-saati';
import {h} from '../../src/ui/dom';
import {efekt} from '../../src/audio/efekt';
import {dugme,ikon} from './gorsel';
import {tostFisleri,tostMalzemeleri,tostMalzemeAdi,tostKivamAdi,tostPisme,tostKaydiniOku,yeniTost,type TostFisi,type TostTaslak,type TostMalzemesi} from './tost-tarifi';
import {tostResmi,tostMalzemeResmi,tostYigini,ekmekYolu} from './tost-gorseli';
import './tost-tezgahi.css';

interface Ayarlar {taslak?:TostTaslak;kaydet:(t:TostTaslak)=>void;teslim:(t:TostTaslak)=>void;geri:()=>void;sesli:()=>boolean;soyle:(metin:string)=>void}
export function tostTezgahi(fis:TostFisi,a:Ayarlar){
  const t=tostKaydiniOku(a.taslak)??yeniTost();
  const hedef=tostFisleri[fis];
  const sahne=h('section.tost-tezgahi',{'aria-label':'Tost tezgâhı'});
  const geri=dugme('Sipariş tepsisine dön','tost-geri',ikon('geri'));
  const istegi=h('div.tost-fis',{role:'group','aria-label':'İstenen tost'});
  const dinle=dugme('Bu adımı dinle','tost-geri tost-dinle',ikon('hoparlor'));
  dinle.hidden=!a.sesli();dinle.onclick=()=>a.soyle(rehber[t.evre]);
  const tas=h('div.tost-calisma');
  const alt=h('div.tost-alt-kumanda');
  const duyuru=h('span.ta-duyuru',{'aria-live':'polite'});
  const secenekler=h('div.tost-raf',{role:'group','aria-label':'Tostun içine koy'});
  sahne.append(geri,dinle,istegi,tas,secenekler,alt,duyuru);
  const pisirme=pisirmeSaati();
  let secili:TostMalzemesi|undefined,calisiyor=false,sonKayit=0,sesEvre='';
  let teslimEdildi=false,gecis=false;
  const ses=(cal:()=>void)=>{if(a.sesli())cal();};
  const kaydet=()=>a.kaydet({...t,katlar:t.katlar.map(k=>({...k}))});
  function hareket(hedefEl:HTMLElement,ad:string,is:()=>void){
    if(gecis)return;
    gecis=true;hedefEl.dataset.oyna=ad;
    window.setTimeout(()=>{gecis=false;if(sahne.isConnected)is();},matchMedia('(prefers-reduced-motion:reduce)').matches?0:280);
  }
  function evre(e:TostTaslak['evre']){t.evre=e;secili=undefined;kaydet();ciz();}
  function dur(){calisiyor=false;pisirme.dur();}
  geri.onclick=()=>{dur();kaydet();a.geri();};
  function fiseYaz(){
    istegi.replaceChildren();
    for(const [i,id] of hedef.icindekiler.entries()){
      const sira=hedef.icindekiler.slice(0,i+1).filter(tur=>tur===id).length;
      const kat=h('span',{'data-tamam':String(t.katlar.filter(k=>k.tur===id).length>=sira),role:'img','aria-label':tostMalzemeAdi[id]},tostMalzemeResmi(id));
      istegi.append(kat);
    }
    const k=tostResmi(ekmekYolu(hedef.kizartma));k.alt=tostKivamAdi[hedef.kizartma];
    istegi.append(h('span.tost-kivam-istegi',{},k));
  }
  function tus(ad:string,simge:Parameters<typeof ikon>[0],fn:()=>void){
    const b=dugme(ad,'tost-tus',ikon(simge));b.onclick=fn;return b;
  }
  function ekle(id:TostMalzemesi,x:number,y:number){
    if(t.katlar.length>=8||gecis)return;
    t.katlar.push({tur:id,x:Math.max(15,Math.min(85,x)),y:Math.max(18,Math.min(80,y))});
    secili=undefined;kaydet();ses(efekt.pof);ciz();
    tas.querySelector('.tost-kat:last-child')?.classList.add('tost-yerlesti');
    duyuru.textContent=tostMalzemeAdi[id]+' eklendi.';
  }
  function acikTezgah(){
    const birak=dugme('Seçili malzemeyi ekmeğe koy','tost-acik-ekmek',tostYigini(t.katlar,false));
    const iade=h('span.tost-iade',{'aria-hidden':true},ikon('sepet'),ikon('asagi'));
    tas.append(birak,iade);
    const geriBirak=(x:number,y:number)=>{
      const r=iade.getBoundingClientRect();
      return x>=r.left-6&&x<=r.right+6&&y>=r.top-6&&y<=r.bottom+6;
    };
    const yigin=birak.querySelector<HTMLElement>('.tost-yigin')!;
    const hedefKonum=(x:number,y:number,i=t.katlar.length)=>{
      const r=yigin.getBoundingClientRect();
      const yatay=(x-r.left)/r.width*100,dikey=(y-r.top)/r.height*100;
      return {x:(yatay-7)/.86,y:(dikey-14+i*.55)/.72};
    };
    let tasinan:{i:number;el:HTMLImageElement;x:number;y:number;oynadi:boolean}|undefined;
    const bitirTasi=(iptal=false,cikar=false)=>{
      if(!tasinan)return;
      const {i,el,x,y,oynadi}=tasinan;tasinan=undefined;
      el.classList.remove('tost-tasiniyor');
      iade.removeAttribute('data-elde');iade.removeAttribute('data-uzerinde');
      if(oynadi&&!iptal){
        if(cikar)t.katlar.splice(i,1);else t.katlar[i]={...t.katlar[i],x,y};
        kaydet();ses(efekt.pof);
      }
      if(oynadi)ciz();
    };
    birak.onpointerdown=e=>{
      if(secili||gecis||e.button!==0||!e.isPrimary)return;
      const katlar=Array.from(yigin.querySelectorAll<HTMLImageElement>('.tost-kat')).reverse();
      const el=katlar.find(node=>{
        const r=node.getBoundingClientRect();
        const x=(e.clientX-r.left-r.width*.5)/(r.width*.52),y=(e.clientY-r.top-r.height*.5)/(r.height*.54);
        return x*x+y*y<=1;
      });
      if(!el)return;
      const i=Number(el.dataset.sira),kat=t.katlar[i];
      tasinan={i,el,x:kat.x,y:kat.y,oynadi:false};birak.setPointerCapture(e.pointerId);
    };
    birak.onpointermove=e=>{
      if(!tasinan)return;
      const {i,el}=tasinan;
      const konum=hedefKonum(e.clientX,e.clientY,i);
      tasinan.x=Math.min(85,Math.max(15,konum.x));tasinan.y=Math.min(80,Math.max(18,konum.y));
      if(Math.hypot(tasinan.x-t.katlar[i].x,tasinan.y-t.katlar[i].y)<2&&!tasinan.oynadi)return;
      tasinan.oynadi=true;el.classList.add('tost-tasiniyor');
      iade.dataset.elde='true';iade.dataset.uzerinde=String(geriBirak(e.clientX,e.clientY));
      el.style.setProperty('--x',(7+tasinan.x*.86)+'%');el.style.setProperty('--y',(14+tasinan.y*.72-i*.55)+'%');
    };
    birak.onpointerup=e=>bitirTasi(false,geriBirak(e.clientX,e.clientY));birak.onpointercancel=()=>bitirTasi(true);birak.onlostpointercapture=()=>bitirTasi(true);
    birak.onclick=e=>{
      if(!secili)return;
      if(e.detail===0){ekle(secili,50,54);return;}
      const p=hedefKonum(e.clientX,e.clientY);ekle(secili,p.x,p.y);
    };
    for(const id of tostMalzemeleri){
      const b=dugme(tostMalzemeAdi[id],'tost-mal',tostMalzemeResmi(id));
      b.dataset.tur=id;b.setAttribute('aria-pressed',String(secili===id));b.disabled=t.katlar.length===8;
      let bas:{x:number,y:number}|undefined,elde:HTMLImageElement|undefined,suruklendi=false;
      const temizle=()=>{bas=undefined;elde?.remove();elde=undefined;};
      b.onpointerdown=e=>{if(!e.isPrimary||e.button!==0)return;bas={x:e.clientX,y:e.clientY};suruklendi=false;b.setPointerCapture(e.pointerId);};
      b.onpointermove=e=>{
        if(!bas||!e.isPrimary)return;
        if(!elde&&Math.hypot(bas.x-e.clientX,bas.y-e.clientY)<7)return;
        if(!elde){elde=tostMalzemeResmi(id);elde.className='tost-elde';sahne.append(elde);suruklendi=true;}
        const r=sahne.getBoundingClientRect();elde.style.left=e.clientX-r.left+'px';elde.style.top=e.clientY-r.top+'px';
      };
      b.onpointerup=e=>{
        if(!bas)return;
        const p=hedefKonum(e.clientX,e.clientY);const icinde=p.x>=-8&&p.x<=108&&p.y>=-8&&p.y<=108;
        temizle();if(suruklendi&&icinde)ekle(id,p.x,p.y);
      };
      b.onpointercancel=b.onlostpointercapture=temizle;
      b.onclick=e=>{if(suruklendi&&e.detail!==0)return;secili=id;for(const dug of secenekler.querySelectorAll('button'))dug.setAttribute('aria-pressed',String(dug===b));birak.dataset.bekliyor='true';ses(efekt.secim);if(e.detail===0)birak.focus();};
      secenekler.append(b);
    }
    const geriAl=tus('Son malzemeyi kaldır','tekrar',()=>{t.katlar.pop();kaydet();ses(efekt.dokunma);ciz();});
    geriAl.disabled=!t.katlar.length;
    const kapat=anaHareket('Üst ekmeği kapat',tostResmi('tost/ekmek'),'asagi',()=>{ses(efekt.pof);evre('kapat');});
    kapat.disabled=!t.katlar.length;
    alt.append(geriAl,kapat);
  }
  function anaHareket(ad:string,resim:Node,simge:'asagi'|'ileri'|'servis',bas:()=>void){
    const b=dugme(ad,'tost-tus tost-ana-hareket',resim,ikon(simge));
    b.onclick=bas;
    return b;
  }
  function pres(){
    const makine=h('div.tost-pres',{'data-kapali':'false'});
    const acik=tostResmi('tost/pres','tost-pres-acik'),kapali=tostResmi('tost/kapali','tost-pres-kapali');
    const yemek=tostYigini(t.katlar,true,t.kizartma);yemek.classList.add('tost-preste');
    makine.append(acik,yemek,kapali);tas.append(makine);
    const saat=h('div.tost-ibre',{'role':'meter','aria-label':'Tostun kızarması','aria-valuemin':0,'aria-valuemax':100});
    const cubuk=h('i.tost-ibre-cubuk');saat.append(cubuk);
    for(const durum of ['acik','altin','citir','fazla'] as const){
      const g=h('span',{'data-kivam':durum,'data-istek':String(hedef.kizartma===durum)},tostResmi(ekmekYolu(durum)));
      saat.append(g);
    }
    const b=anaHareket('Tost presini kapat',tostResmi('tost/kapali'),'asagi',()=>{});
    function goster(){
      t.kizartma=tostPisme(t.gecen);const oran=Math.min(100,t.gecen/88);
      saat.style.setProperty('--isi',oran+'%');saat.setAttribute('aria-valuenow',String(Math.round(oran)));
      saat.setAttribute('aria-valuetext',tostKivamAdi[t.kizartma]);
      makine.dataset.kivam=t.kizartma;
      if(t.kizartma!==sesEvre){if(t.kizartma===hedef.kizartma)ses(()=>efekt.nota(3));sesEvre=t.kizartma;}
    }
    function zaman(gecen:number){
      t.gecen=Math.min(8800,t.gecen+gecen);goster();
      if(t.gecen-sonKayit>=350||t.gecen===8800){sonKayit=t.gecen;kaydet();}
      return t.gecen<8800;
    }
    b.onclick=()=>{
      if(gecis)return;
      if(!calisiyor){
        calisiyor=true;sonKayit=t.gecen;sesEvre=t.kizartma;makine.dataset.kapali='true';
        b.setAttribute('aria-label','Tost presini aç');b.replaceChildren(tostResmi('tost/pres'),ikon('el'));ses(efekt.cevir);pisirme.baslat(zaman,kaydet);
      }else{
        b.disabled=true;dur();goster();
        const kapak=yemek.querySelector<HTMLImageElement>('.tost-ust');
        if(kapak)kapak.src=tostResmi(ekmekYolu(t.kizartma)).src;
        makine.dataset.kapali='false';ses(efekt.cevir);hareket(makine,'ac',()=>evre('sun'));
      }
    };
    goster();alt.append(saat,b);
  }
  function ciz(){
    if(!sahne.isConnected&&teslimEdildi)return;
    sahne.dataset.evre=t.evre;tas.replaceChildren();secenekler.replaceChildren();alt.replaceChildren();fiseYaz();
    if(t.evre==='ac'){
      const b=dugme('Tost ekmeğini aç','tost-ekmegi-ac',tostYigini([],true));b.append(h('span.tost-el',{},ikon('el')));tas.append(b);
      b.onclick=()=>{ses(efekt.cevir);hareket(b,'ac',()=>evre('diz'));};
    }else if(t.evre==='diz')acikTezgah();
    else if(t.evre==='kapat'){
      const y=tostYigini(t.katlar,true);y.classList.add('tost-kapama');tas.append(y);
      alt.append(tus('Ekmeği yeniden aç','geri',()=>evre('diz')),anaHareket('Tost presine götür',tostResmi('tost/pres'),'ileri',()=>evre('pres')));
    }else if(t.evre==='pres')pres();
    else{
      tas.append(tostYigini(t.katlar,true,t.kizartma));
      if(t.kizartma==='acik'||t.kizartma==='altin')alt.append(tus('Biraz daha kızart','tekrar',()=>evre('pres')));
      const bitir=anaHareket('Tostu tepsiye koy',tostResmi(ekmekYolu(t.kizartma)),'servis',()=>{if(teslimEdildi)return;teslimEdildi=true;bitir.disabled=true;dur();ses(efekt.pof);a.teslim(t);});
      alt.append(bitir);
    }
  }
  ciz();
  return {sahne,temizle:pisirme.temizle};
}
