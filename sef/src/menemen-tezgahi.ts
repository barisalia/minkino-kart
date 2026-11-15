import {h} from '../../src/ui/dom';
import {konus,sus} from '../../src/audio/konusma';
import {efekt} from '../../src/audio/efekt';
import {arkaPlanDinle} from '../../src/kabuk/yon';
import {kesmeSesi,karistirmaSesi,tezgahiSustur} from './mutfak-ses';
import {dugme,ikon} from './gorsel';
import {hareket,icinde,jest,type Nokta} from './hareket';
import {menemenOrnegi,menemenSahani,mnResim,mnSebze} from './menemen-gorseli';
import {menemenIstegi,menemenKivami,menemenOku,sebzeAdlari,yeniMenemen,type KahvaltiSebzesi,type Menemen} from './menemen-tarifi';

const kayitlar=import.meta.glob<string>('../../assets/sef/menemen/*.mp3',{eager:true,query:'?url',import:'default'});
export const menemenRehberi=(evre:Menemen['evre'])=>konus(kayitlar['../../assets/sef/menemen/'+evre+'.mp3']);
const turler:KahvaltiSebzesi[]=['domates','biber','mantar'];
const kesimYerleri=[.27,.5,.73];
const sebzeYerleri=[[36,40],[52,36],[65,49],[44,62],[55,58],[33,55]];
interface Ayar {taslak?:Menemen;sesli:()=>boolean;istegiDinle:()=>void;kaydet:(t:Menemen)=>void;teslim:(t:Menemen)=>void;geri:()=>void}
function oran(el:Element,n:Nokta){
  const r=el.getBoundingClientRect();
  return {x:(n.x-r.left)/r.width,y:(n.y-r.top)/r.height};
}
export function menemenTezgahi(id:string,a:Ayar){
  const t=menemenOku(a.taslak)??yeniMenemen(),hedef=menemenIstegi(id);
  const sahne=h('section.mn-tezgah',{'aria-label':'Menemen tezgâhı'}),is=h('div.mn-is');
  const geri=dugme('Tepsiye dön','mn-geri',ikon('geri'));
  const fis=dugme('Menemen siparişini dinle','mn-fis',menemenOrnegi(id),...hedef.sebzeler.map(s=>mnSebze(s)));
  const dinle=dugme('Bu adımı dinle','mn-dinle',ikon('hoparlor'));
  const oku=()=>{if(a.sesli())void menemenRehberi(t.evre);};
  const yaz=()=>a.kaydet(t);
  const ses=()=>{if(a.sesli())efekt.yapis();};
  let kare=0,sonAn=0,sonKayit=0,teslimEdildi=false,arkada=false;
  function dur(){cancelAnimationFrame(kare);kare=0;sonAn=0;}
  function gec(evre:Menemen['evre']){dur();t.evre=evre;yaz();ciz();oku();}
  geri.onclick=()=>{dur();yaz();sus();a.geri();};fis.onclick=a.istegiDinle;dinle.onclick=oku;
  sahne.append(mnResim('menemen/tezgah','mn-zemin mn-hazirlik-zemini'),mnResim('menemen/ocak','mn-zemin mn-pisirme-zemini'),is,geri,fis,dinle);

  function sebzeliSahan(){
    const pan=h('span.mn-sahan',{},mnResim('menemen/sahan','mn-bakir'));
    for(const [i,p] of sebzeYerleri.entries()){
      if(!t.sebzeler.length)break;
      const sebze=t.sebzeler[i%t.sebzeler.length],parca=mnSebze(sebze,true);
      parca.className='mn-sote-tanesi';parca.style.left=p[0]+'%';parca.style.top=p[1]+'%';parca.style.rotate=(i*27-50)+'deg';pan.append(parca);
    }
    return pan;
  }
  function dogra(){
    const raf=h('div.mn-raf',{'aria-label':'Sebzeler',role:'group'});
    const pan=dugme('Kesilmiş parçaları sahana al','mn-kucuk-sahan',sebzeliSahan());
    const ileri=dugme('Sebzeleri sotelemeye geç','mn-ileri',ikon('ocak'),ikon('ileri'));
    ileri.disabled=!t.sebzeler.includes('domates')||!!t.tahtada;
    ileri.onclick=()=>gec('sotele');
    for(const sebze of turler){
      const alindi=t.sebzeler.includes(sebze),secili=t.tahtada===sebze;
      const b=dugme(sebzeAdlari[sebze]+(alindi?' sahandan çıkar':' tahtaya al'),'mn-sebze',mnSebze(sebze));
      b.dataset.tur=sebze;b.setAttribute('aria-pressed',String(secili||alindi));
      if(alindi)b.append(h('i.mn-onay',{},ikon('onay')));
      b.onclick=()=>{
        if(alindi)t.sebzeler=t.sebzeler.filter(s=>s!==sebze);
        else if(!secili){t.tahtada=sebze;t.kesik=[];}
        yaz();ciz();
      };raf.append(b);
    }
    const tahta=h('div.mn-tahta');
    is.append(tahta,raf,pan,ileri);
    const sebze=t.tahtada;
    pan.disabled=!sebze||t.kesik.length!==3;
    if(!sebze){tahta.append(h('i.mn-tahta-ipucu',{},ikon('tahta')));return;}
    const aktar=()=>{if(t.kesik.length!==3)return;t.sebzeler.push(sebze);delete t.tahtada;t.kesik=[];ses();yaz();ciz();};
    jest(pan,{birak:(_,__,tik)=>{if(tik)aktar();},klavye:aktar});
    const kes=dugme(t.kesik.length===3?'Parçaları sahana kaydır':sebzeAdlari[sebze]+' kes','mn-kes');
    kes.dataset.sebze=sebze;tahta.append(kes);
    const sinir=[0,...t.kesik.map(k=>kesimYerleri[k]).sort((x,y)=>x-y),1];
    for(let i=0;i<sinir.length-1;i++){
      const parca=mnSebze(sebze);parca.className='mn-kesit';
      parca.style.clipPath='inset(0 '+(100-sinir[i+1]*100)+'% 0 '+sinir[i]*100+'%)';
      parca.style.translate=((i-(sinir.length-2)/2)*1.9)+'% '+(i%2*2)+'%';kes.append(parca);
    }
    for(const [i,x] of kesimYerleri.entries())if(!t.kesik.includes(i)){
      const iz=h('i.mn-kes-izi');iz.style.left=x*100+'%';kes.append(iz);
    }
    if(t.kesik.length===3){
      kes.replaceChildren();
      for(let i=0;i<4;i++){
        const dilim=sebze==='domates'?mnResim('menemen/domates-dilim'):mnSebze(sebze,true);
        dilim.className='mn-hazir-dilim';dilim.style.left=(i*22+2)+'%';dilim.style.top=([28,18,29,20][i])+'%';dilim.style.rotate=([-16,11,-12,18][i])+'deg';kes.append(dilim);
      }
      pan.classList.add('mn-bekliyor');kes.append(h('i.mn-aktar-oku',{},ikon('ileri')));
    }
    const bicak=mnResim('nesneler/dograma-bicagi','mn-bicak');
    const ilkKes=kesimYerleri.findIndex((_,i)=>!t.kesik.includes(i));
    if(ilkKes>=0){bicak.style.left=(kesimYerleri[ilkKes]*100)+'%';kes.append(bicak);}
    function kesildi(i:number){if(i<0||t.kesik.includes(i))return;t.kesik.push(i);if(a.sesli())kesmeSesi(sebze==='biber'?'salatalik':'domates');yaz();ciz();}
    let ust:Nokta|undefined,hedefKesim=-1;
    const izle=(n:Nokta)=>{
      if(!ust)return;
      const p=oran(kes,n);
      bicak.style.left=(p.x*100)+'%';bicak.style.top=(p.y*100)+'%';
      if(Math.abs(p.y-ust.y)<.38||Math.min(ust.y,p.y)>.46||Math.max(ust.y,p.y)<.54)return;
      const x=ust.x+(p.x-ust.x)*(.5-ust.y)/(p.y-ust.y);
      const i=kesimYerleri.findIndex((v,i)=>!t.kesik.includes(i)&&Math.abs(v-x)<.109);
      if(i>=0){ust=undefined;hedefKesim=i;bicak.style.top='88%';}
    };
    jest(kes,{basla:n=>{hedefKesim=-1;ust=t.kesik.length===3?undefined:oran(kes,n);},tasi:izle,birak:(n,_,tik)=>{
      if(t.kesik.length===3&&icinde(pan,n,8)&&!tik)aktar();else{izle(n);kesildi(hedefKesim);}ust=undefined;
    },klavye:()=>{if(t.kesik.length===3)aktar();else kesildi(ilkKes);},iptal:()=>{ust=undefined;}});
  }
  function sotele(){
    const pan=dugme('Sebzeleri kaşıkla sotele','mn-buyuk-sahan',sebzeliSahan());
    const kasik=mnResim('nesneler/kasik','mn-kasik');
    const yon=h('i.mn-cevir',{},ikon('karistir')),dolum=h('i.mn-dolum');
    const olcer=h('span.mn-ilerleme',{role:'progressbar','aria-label':'Sebzelerin soteleme ilerlemesi','aria-valuemin':0,'aria-valuemax':100},dolum);
    pan.append(kasik,yon);is.append(pan,olcer);
    function boya(){dolum.style.width=t.sote*100+'%';olcer.setAttribute('aria-valuenow',String(Math.round(t.sote*100)));pan.style.setProperty('--karistir',(t.sote*120)+'deg');}
    function ekle(m:number){t.sote=Math.min(1,t.sote+m);boya();if(t.sote>=1){ses();gec('kir');}}
    let once:Nokta|undefined,sonKasikSesi=0;
    const izle=(n:Nokta)=>{
      const p=oran(pan,n);
      if(Math.hypot((p.x-.5)/.35,(p.y-.48)/.36)>1){once=undefined;return;}
      kasik.style.left=p.x*100+'%';kasik.style.top=p.y*100+'%';
      if(once){
        const tane=pan.querySelectorAll<HTMLElement>('.mn-sote-tanesi');
        for(const [i,img] of tane.entries()){
          const [x,y]=sebzeYerleri[i];
          const yakinlik=Math.max(0,1-Math.hypot(p.x-x/100,p.y-y/100)*2.7);
          img.style.left=(x+(p.x-once.x)*95*yakinlik+Math.sin(t.sote*8+i)*2.5)+'%';
          img.style.top=(y+(p.y-once.y)*60*yakinlik+Math.cos(t.sote*8+i)*1.6)+'%';
        }
        const yol=Math.min(.12,Math.hypot(p.x-once.x,p.y-once.y));
        ekle(yol/2.6);
        if(yol>.025&&performance.now()-sonKasikSesi>240&&a.sesli()){sonKasikSesi=performance.now();karistirmaSesi(true,.7,true);}
      }
      once=p;
    };
    jest(pan,{basla:n=>{once=undefined;izle(n);},tasi:izle,birak:()=>{once=undefined;yaz();},iptal:()=>{once=undefined;yaz();},klavye:()=>{ekle(.25);yaz();}});boya();
  }
  function yumurtaKir(){
    const pan=sebzeliSahan();pan.classList.add('mn-buyuk-sahan');is.append(pan);
    for(let i=0;i<t.yumurta;i++){const yum=mnResim('menemen/yumurta-ici','mn-cig');yum.style.left=(30+i*23)+'%';pan.append(yum);}
    const sepet=h('div.mn-yumurtalik');
    let kiriliyor=false;
    for(let i=t.yumurta;i<2;i++){
      const b=dugme((i+1)+'. yumurtayı sahana kır','mn-yumurta',mnResim('krep/yumurta'));
      const kir=async()=>{
        if(t.evre!=='kir'||kiriliyor)return;kiriliyor=true;
        for(const dugme of sepet.querySelectorAll('button'))dugme.disabled=true;
        const kabuk=mnResim('mucver/yumurta-acik','mn-kabuk');
        const ic=mnResim('menemen/yumurta-ici','mn-cig');
        const sol=29+t.yumurta*23;
        kabuk.style.left=sol+'%';ic.style.left=sol+'%';pan.append(kabuk,ic);
        t.yumurta++;ses();yaz();
        await Promise.all([hareket(kabuk,[{transform:'translateY(13%)'},{transform:'translateY(-15%) rotate(-6deg)',offset:.7},{transform:'translateY(-23%)',opacity:0}],460),
          hareket(ic,[{transform:'translateY(-92%) scale(.36,.82)',opacity:.7},{transform:'translateY(3%) scale(1.04,.92)',offset:.76},{transform:'none',opacity:1}],490)]);
        if(!pan.isConnected||t.evre!=='kir')return;
        if(t.yumurta===2)gec('pisir');else ciz();
      };
      jest(b,{tasi:(n,ilk)=>{b.style.transform='translate('+(n.x-ilk.x)+'px,'+(n.y-ilk.y)+'px)';},birak:(n,_,tik)=>{b.style.transform='';if(tik||icinde(pan,n))kir();},klavye:kir,iptal:()=>{b.style.transform='';}});sepet.append(b);
    }
    is.append(sepet);
  }
  let gosterge:(()=>void)|undefined;
  function pisir(){
    const yer=h('div.mn-buyuk-sahan'),olcer=h('div.mn-isi',{'aria-label':'Pişme kıvamı'});
    const im=h('i.mn-isi-im'),hedefSira=hedef.kivam==='sulu'?0:1;
    for(const [i,k] of (['sulu','tam','koyu'] as const).entries()){
      const bolum=h('span.mn-kivam',{'data-hedef':String(i===hedefSira)},mnResim('menemen/'+k));if(i===hedefSira)bolum.append(h('i',{},ikon('yildiz')));olcer.append(bolum);
    }
    olcer.append(im);
    const kapat=dugme('Ocağı kapat','mn-ileri mn-kapat',ikon('ocak'),ikon('onay'));
    const bosalt=()=>{if(t.sure>=1600){ses();gec('sun');}};kapat.onclick=bosalt;
    is.append(yer,olcer,kapat);
    let onceki='';
    function goster(){
      const kivam=menemenKivami(t.sure);
      if(kivam!==onceki){yer.replaceChildren(menemenSahani(t));yer.dataset.kivam=kivam;onceki=kivam;}
      const kisim=t.sure<4500?t.sure/4500:t.sure<10000?1+(t.sure-4500)/5500:2+(t.sure-10000)/3000;
      im.style.left=Math.min(98,Math.max(2,kisim*100/3))+'%';kapat.disabled=t.sure<1600;
    }
    gosterge=()=>{
      dur();if(document.hidden||arkada||t.evre!=='pisir')return;
      const dengeli=(simdi:number)=>{
        if(document.hidden||!sahne.isConnected){dur();return;}
        if(sonAn)t.sure=Math.min(13000,t.sure+Math.min(250,simdi-sonAn));
        sonAn=simdi;goster();
        if(simdi-sonKayit>650){sonKayit=simdi;yaz();}
        if(t.sure<13000)kare=requestAnimationFrame(dengeli);else{dur();yaz();}
      };kare=requestAnimationFrame(dengeli);
    };goster();gosterge();
  }
  function ciz(){
    sahne.dataset.evre=t.evre;is.replaceChildren();gosterge=undefined;
    if(t.evre==='dogra')dogra();
    if(t.evre==='sotele')sotele();
    if(t.evre==='kir')yumurtaKir();
    if(t.evre==='pisir')pisir();
    if(t.evre==='sun'){
      const sun=dugme('Menemeni tepsiye koy','mn-servis',menemenSahani(t),h('i',{},ikon('servis'),ikon('ileri')));
      sun.onclick=()=>{if(teslimEdildi)return;teslimEdildi=true;sus();a.teslim(t);};is.append(sun);
    }
  }
  const gorunurluk=()=>{if(t.evre!=='pisir')return;if(document.hidden){dur();yaz();}else gosterge?.();};
  const arkaPlaniBirak=arkaPlanDinle(v=>{arkada=v;if(t.evre==='pisir'){if(v){dur();yaz();}else gosterge?.();}});
  document.addEventListener('visibilitychange',gorunurluk);
  ciz();
  return {sahne,temizle:()=>{dur();arkaPlaniBirak();tezgahiSustur();document.removeEventListener('visibilitychange',gorunurluk);}};
}
