import {karistirmaSesi,bardagaDokmeSesi,tezgahiSustur} from './mutfak-ses';
import {h} from '../../src/ui/dom';
import {efekt} from '../../src/audio/efekt';
import {arkaPlanDinle} from '../../src/kabuk/yon';
import {dugme,ikon} from './gorsel';
import {hareket,icinde,jest,merkez,type Nokta} from './hareket';
import {omletAdlari,omletIcleri,omletIstegi,omletKivami,omletKivamAdlari,omletiOku,omletSolunda,yeniOmlet,type Omlet,type OmletIci} from './omlet-tarifi';
import {omletGoruntusu,omletIcResmi,omletOrnegi,omletResmi,omletTabagi} from './omlet-gorseli';

interface Ayar {taslak?:Omlet;kaydet:(t:Omlet)=>void;teslim:(t:Omlet)=>void;geri:()=>void;sesli:()=>boolean;rehber:(evre:Omlet['evre'])=>void}
const dizilim=[[26,30],[40,45],[25,63],[37,72],[16,48],[37,22],[34,55],[19,58]];

export function omletTezgahi(id:string,a:Ayar){
  const t=omletiOku(a.taslak)??yeniOmlet(),istek=omletIstegi(id);
  const sahne=h('section.om-atolye',{'aria-label':'Omlet tavası'});
  const alan=h('div.om-alan'),alet=h('div.om-alet');
  const geri=dugme('Sipariş tepsisine dön','om-tus om-geri',ikon('geri'));
  const rehber=dugme('Bu adımı dinle','om-tus om-ses',ikon('hoparlor'));
  const fis=h('div.om-fis',{role:'group','aria-label':'Omlet siparişi'},omletOrnegi(id),
    ...istek.icler.map(tur=>{const img=omletIcResmi(tur);img.alt=omletAdlari[tur];return img;}));
  const fon=omletResmi('krep/tezgah','om-fon');sahne.append(fon,alan,alet,fis,geri,rehber);
  let raf=0,son=0,sonYaz=0,mesgul=false,kapali=false,arkada=false;
  let elde:OmletIci|undefined;
  const yaz=()=>a.kaydet(t);
  const efektCal=(fn:()=>void)=>{if(a.sesli())fn();};
  const dur=()=>{cancelAnimationFrame(raf);raf=0;son=0;};
  const arkayiBirak=arkaPlanDinle(deger=>{arkada=deger;son=0;});
  const gorunurluk=()=>{son=0;};
  document.addEventListener('visibilitychange',gorunurluk);
  const temizle=()=>{if(kapali)return;kapali=true;dur();tezgahiSustur();arkayiBirak();document.removeEventListener('visibilitychange',gorunurluk);};
  geri.onclick=()=>{yaz();temizle();a.geri();};rehber.hidden=!a.sesli();
  rehber.onclick=()=>{if(a.sesli())a.rehber(t.evre);};
  const evre=(e:Omlet['evre'])=>{dur();t.evre=e;mesgul=false;yaz();ciz();};
  function kase(){
    const kutu=h('div.om-kase',{},omletResmi('krep/karisim-kasesi','om-kase-dis'));
    if(t.yumurta&&t.cirpma<1)for(let i=0;i<t.yumurta;i++)kutu.append(omletResmi('krep/yumurta-kasede','om-yumurta om-yumurta-'+i));
    if(t.cirpma>0){
      const sivi=omletResmi('krep/karisim-son','om-karisim');sivi.style.opacity=String(t.cirpma);kutu.append(sivi);
    }
    return kutu;
  }
  function yumurtalar(){
    const kap=kase();alan.append(kap);
    const kir=async(b:HTMLButtonElement)=>{
      if(mesgul||t.yumurta>=2)return;
      mesgul=true;const resim=b.querySelector('img')!,bas=merkez(b),son=merkez(kap);
      const dx=son.x-bas.x,dy=son.y-bas.y;
      await hareket(b,[{translate:'0 0'},{translate:dx*.65+'px '+(dy-16)+'px'},{translate:dx+'px '+dy+'px'}],320);
      if(!b.isConnected)return;
      b.style.translate=dx+'px '+dy+'px';resim.src=omletResmi('krep/yumurta-kirik').src;efektCal(efekt.pof);
      await hareket(b,[{scale:'1'},{scale:'.93'},{opacity:0}],220);
      if(!b.isConnected)return;t.yumurta++;mesgul=false;yaz();
      if(t.yumurta===2)evre('cirp');else ciz();
    };
    for(let i=t.yumurta;i<2;i++){
      const b=dugme((i+1)+'. yumurtayı kâseye kır','om-yumurta-tus',omletResmi('krep/yumurta'));
      b.style.left=(i===0?13:25)+'%';alan.append(b);
      jest(b,{birak:(n,_ilk,tik)=>{if(tik||icinde(kap,n,8))void kir(b);},klavye:()=>void kir(b)});
    }
  }
  function cirp(){
    const kap=kase(),b=dugme('Kâsede daire çizerek yumurtaları çırp','om-cirp',omletResmi('krep/cirpici','om-cirpici'));
    alan.append(kap);kap.append(b);
    const halka=h('span.om-cirp-ilerleme',{'aria-hidden':true});kap.append(halka);
    const sivi=kap.querySelector<HTMLElement>('.om-karisim')??omletResmi('krep/karisim-son','om-karisim');
    if(!sivi.isConnected)kap.insertBefore(sivi,b);
    const tel=b.firstElementChild as HTMLElement;
    let once:number|undefined,sonTur=Math.floor(t.cirpma*8);
    function ilerle(oran:number){
      t.cirpma=Math.min(1,t.cirpma+oran);sivi.style.opacity=String(t.cirpma);
      for(const yumurta of kap.querySelectorAll<HTMLElement>('.om-yumurta'))yumurta.style.opacity=String(1-t.cirpma);
      const tur=Math.floor(t.cirpma*8);
      if(tur>sonTur){sonTur=tur;efektCal(()=>karistirmaSesi(false,.7,true));}
      halka.style.setProperty('--dolu',(t.cirpma*360)+'deg');
      b.setAttribute('aria-valuetext',Math.round(t.cirpma*100)+'%');
      if(t.cirpma>=1){efektCal(efekt.dogru);evre('dok');}
    }
    function aci(n:Nokta){const m=merkez(kap);return Math.atan2(n.y-m.y,n.x-m.x);}
    ilerle(0);
    jest(b,{basla:n=>{once=aci(n);},tasi:n=>{
      const m=merkez(kap),r=kap.getBoundingClientRect();if(Math.hypot(n.x-m.x,n.y-m.y)<r.width*.08){once=undefined;return;}
      const simdi=aci(n);
      if(once!==undefined){
        const fark=Math.abs(Math.atan2(Math.sin(simdi-once),Math.cos(simdi-once)));
        if(fark<1.05)ilerle(fark/(Math.PI*4));
      }
      once=simdi;tel.style.left=(50+Math.cos(simdi)*19)+'%';tel.style.top=(45+Math.sin(simdi)*16)+'%';
    },birak:()=>{once=undefined;yaz();},iptal:()=>{once=undefined;yaz();},klavye:()=>{ilerle(.25);yaz();}});
  }
  function tava(){
    const yer=h('div.om-tava',{},omletResmi('krep/tava','om-tava-resmi'));
    const taban=h('div.om-tava-ici');yer.append(taban);alan.append(yer);return taban;
  }
  function dok(){
    const hedef=tava(),b=dugme('Çırpılmış yumurtayı tavaya dök','om-dok',kase());alan.append(b);
    const aktar=async()=>{
      if(mesgul)return;mesgul=true;
      const p=merkez(b),q=merkez(hedef),dx=q.x-p.x,dy=q.y-p.y;
      const x=dx*.70,y=dy-hedef.clientHeight*.52;
      await hareket(b,[{translate:'0 0',rotate:'0deg'},{translate:x+'px '+y+'px',rotate:'54deg'}],420);
      if(!sahne.isConnected)return;
      Object.assign(b.style,{translate:x+'px '+y+'px',rotate:'54deg'});
      const yer=alan.getBoundingClientRect(),sol=q.x-yer.x-hedef.clientWidth*.16,ust=q.y-yer.y-hedef.clientHeight*.32;
      const akis=h('i.om-yumurta-akisi',{'aria-hidden':true});
      Object.assign(akis.style,{left:sol+'px',top:ust+'px',height:hedef.clientHeight*.39+'px'});
      alan.append(akis);const karisim=omletResmi('omlet/acik','om-dokulen');hedef.append(karisim);
      efektCal(()=>bardagaDokmeSesi(true));
      await Promise.all([hareket(akis,[{scale:'1 0'},{scale:'1 1',offset:.3},{scale:'.45 1',opacity:.8}],370),
        hareket(karisim,[{scale:'.18'},{scale:'1'}],460)]);
      if(sahne.isConnected)evre('ic');
    };
    jest(b,{birak:(n,_ilk,tik)=>{if(tik||icinde(hedef,n,12))void aktar();},klavye:()=>void aktar()});
  }
  function doldur(){
    const alanIci=tava(),zemin=dugme('Malzemeyi omletin sol yarısına koy','om-yerlestir',omletGoruntusu(t.icler,false));
    alanIci.append(zemin);
    const koy=(tur:OmletIci,n?:Nokta)=>{
      if(t.icler.length>=8)return;
      const r=zemin.getBoundingClientRect(),[x,y]=n?[(n.x-r.left)/r.width*100,(n.y-r.top)/r.height*100]:dizilim[t.icler.length];
      if(!omletSolunda(x,y)){void hareket(zemin,[{translate:'0'},{translate:'-3px'},{translate:'0'}],160);return;}
      t.icler.push({tur,x,y});elde=undefined;efektCal(efekt.yapis);yaz();ciz();
    };
    // Pick an existing filling directly from the egg and return it to its own bowl.
    const resimler=Array.from(zemin.querySelectorAll<HTMLImageElement>('.om-ic'));
    let tutulan:number|undefined,kopya:HTMLImageElement|undefined;
    const kap=(i:number)=>alet.querySelector<HTMLButtonElement>('[data-ic="'+t.icler[i].tur+'"]')!;
    const birakSecimi=()=>{
      if(tutulan!==undefined){resimler[tutulan].style.visibility='';delete kap(tutulan).dataset.iade;}
      kopya?.remove();kopya=undefined;tutulan=undefined;
    };
    const klavyeYeri=()=>{if(elde)koy(elde);};
    jest(zemin,{
      basla:n=>{
        if(elde)return;
        let yakin=Infinity;
        for(let i=resimler.length-1;i>=0;i--){
          const r=resimler[i].getBoundingClientRect(),d=Math.hypot(n.x-r.x-r.width/2,n.y-r.y-r.height/2);
          if(icinde(resimler[i],n,4)&&d<yakin){tutulan=i;yakin=d;}
        }
      },
      tasi:(n,ilk)=>{
        if(tutulan===undefined||Math.hypot(n.x-ilk.x,n.y-ilk.y)<5&&!kopya)return;
        if(!kopya){
          const img=resimler[tutulan],r=img.getBoundingClientRect();
          kopya=img.cloneNode() as HTMLImageElement;kopya.className='om-kaldirilan';kopya.removeAttribute('style');
          kopya.style.width=r.width+'px';kopya.style.height=r.height+'px';img.style.visibility='hidden';sahne.append(kopya);
        }
        const r=sahne.getBoundingClientRect();kopya.style.left=n.x-r.left+'px';kopya.style.top=n.y-r.top+'px';
        kap(tutulan).dataset.iade=icinde(kap(tutulan),n,4)?'uzerinde':'bekliyor';
      },
      birak:(n,_ilk,tik)=>{
        if(elde){koy(elde,n);return;}
        const i=tutulan,tasindi=!!kopya;
        const geri=i!==undefined&&tasindi&&icinde(kap(i),n,4);birakSecimi();
        if(i===undefined||!tasindi||tik)return;
        if(geri)t.icler.splice(i,1);
        else{
          const r=zemin.getBoundingClientRect(),x=(n.x-r.left)/r.width*100,y=(n.y-r.top)/r.height*100;
          if(!omletSolunda(x,y))return;
          t.icler[i]={...t.icler[i],x,y};
        }
        yaz();efektCal(efekt.yapis);ciz();
      },iptal:birakSecimi,klavye:klavyeYeri,
    });
    for(const tur of omletIcleri){
      const b=dugme(omletAdlari[tur]+' seç','om-malzeme',omletIcResmi(tur));b.dataset.ic=tur;
      b.setAttribute('aria-pressed',String(tur===elde));
      const sec=()=>{elde=tur;for(const diger of alet.querySelectorAll('button[data-ic]'))diger.setAttribute('aria-pressed',String(diger===b));};
      let kopya:HTMLElement|undefined;
      const sil=()=>{kopya?.remove();kopya=undefined;};
      jest(b,{tasi:(n,ilk)=>{
        if(Math.hypot(n.x-ilk.x,n.y-ilk.y)<6)return;
        if(!kopya){kopya=omletIcResmi(tur);kopya.className='om-surukle';sahne.append(kopya);}
        const r=sahne.getBoundingClientRect();kopya.style.left=n.x-r.left+'px';kopya.style.top=n.y-r.top+'px';
      },birak:(n,_ilk,tik)=>{sil();if(tik)sec();else if(icinde(zemin,n))koy(tur,n);},iptal:sil,klavye:sec});
      alet.append(b);
    }
    const geriAl=dugme('Son iç malzemeyi geri al','om-tus om-geri-al',ikon('tekrar'));geriAl.disabled=!t.icler.length;
    geriAl.onclick=()=>{t.icler.pop();yaz();ciz();};
    const basla=dugme('Ocağı yak','om-tus om-basla',h('img',{src:new URL('../../assets/sef/ikon-atolyesi/simge/pisir.webp',import.meta.url).href,alt:'',draggable:false}));basla.disabled=!t.icler.length;basla.onclick=()=>evre('pisir');
    alan.append(geriAl,basla);
  }
  function pisir(){
    const taban=tava(),yemek=omletGoruntusu(t.icler,false),b=dugme('Spatulayı sağdan sola çekip omleti katla','om-katla',omletResmi('krep/spatula'),ikon('katla'));
    const gosterge=h('div.om-isi',{role:'meter','aria-label':'Omletin pişme kıvamı','aria-valuemin':0,'aria-valuemax':100},h('i'));
    for(const k of ['yumusak','altin','koyu'] as const){
      const ornek=omletGoruntusu([],true,k);ornek.dataset.hedef=String(istek.kivam===k);gosterge.append(ornek);
    }
    taban.append(yemek);alan.append(b,gosterge);
    const guncel=()=>{
      const kivam=omletKivami(t.sure);yemek.dataset.kivam=kivam;sahne.dataset.kivam=kivam;
      const deger=Math.round(t.sure/100);gosterge.style.setProperty('--isi',deger+'%');
      gosterge.setAttribute('aria-valuenow',String(deger));gosterge.setAttribute('aria-valuetext',omletKivamAdlari[kivam]);b.disabled=t.sure<1400;
    };
    const tik=(an:number)=>{
      if(!sahne.isConnected||mesgul||t.evre!=='pisir')return;
      if(son&&!document.hidden&&!arkada)t.sure=Math.min(10000,t.sure+Math.min(an-son,180));
      son=an;guncel();if(an-sonYaz>700){yaz();sonYaz=an;}
      if(t.sure<10000)raf=requestAnimationFrame(tik);else yaz();
    };
    const katla=async()=>{
      if(mesgul||t.sure<1400)return;mesgul=true;dur();b.disabled=true;
      const r=taban.getBoundingClientRect(),p=merkez(b),dx=r.x+r.width*.3-p.x,dy=r.y+r.height*.55-p.y;
      await hareket(b,[{translate:'0 0'},{translate:dx*.6+'px '+(dy-12)+'px'},{translate:dx+'px '+dy+'px',rotate:'-20deg'}],420);
      if(!sahne.isConnected)return;
      const kenar=omletResmi('omlet/katlaniyor','om-katlanma');
      yemek.querySelector<HTMLElement>('.om-yuzey')!.style.visibility='hidden';
      yemek.insertBefore(kenar,yemek.firstChild);
      await hareket(kenar,[{scale:'1.05 1'},{scale:'1 1'}],240);
      if(!sahne.isConnected)return;
      const katli=omletGoruntusu(t.icler,true,omletKivami(t.sure));
      taban.replaceChildren(katli);efektCal(efekt.yapis);
      await hareket(katli,[{rotate:'-6deg',translate:'0 -7%'},{rotate:'0deg',translate:'0 0'}],200);
      if(sahne.isConnected)evre('sun');
    };
    jest(b,{birak:(n,ilk,tik)=>{if(tik||n.x<ilk.x-20)void katla();},klavye:()=>void katla()});
    guncel();raf=requestAnimationFrame(tik);
  }
  function sun(){
    const taban=tava(),b=dugme('Katlı omleti tabağa kaydır','om-porsiyon',omletGoruntusu(t.icler,true,omletKivami(t.sure)));
    taban.append(b);const tabak=dugme('Omleti servis tabağına al','om-bos-tabak',omletResmi('krep/tabak'));alan.append(tabak);
    const aktar=async()=>{
      if(mesgul)return;mesgul=true;const p=merkez(b),q=merkez(tabak);
      await hareket(b,[{translate:'0 0'},{translate:(q.x-p.x)*.55+'px '+((q.y-p.y)*.55-18)+'px'},{translate:(q.x-p.x)+'px '+(q.y-p.y)+'px'}],470);
      if(!sahne.isConnected)return;
      tabak.replaceChildren(omletTabagi(t));b.hidden=true;efektCal(efekt.dogru);temizle();a.teslim(t);
    };
    jest(b,{birak:(n,_ilk,tik)=>{if(tik||icinde(tabak,n,10))void aktar();},klavye:()=>void aktar()});tabak.onclick=()=>void aktar();
  }
  function ciz(){
    if(kapali)return;dur();alan.replaceChildren();alet.replaceChildren();sahne.dataset.evre=t.evre;
    fon.src=omletResmi(t.evre==='kir'||t.evre==='cirp'?'krep/tezgah':'tepsi/tavuk/ocak').src;
    ({kir:yumurtalar,cirp,dok,ic:doldur,pisir,sun})[t.evre]();
  }
  ciz();return {sahne,temizle};
}
