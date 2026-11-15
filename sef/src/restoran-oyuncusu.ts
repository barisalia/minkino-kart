import {karakterAdlari,type RestoranKarakteri} from './restoran-karakterleri';
import {h} from '../../src/ui/dom';
import './restoran-oyuncusu.css';

const arkadasPozlari=import.meta.glob<string>('../../assets/sef/salon/arkadaslar/*.webp',{eager:true,query:'?url',import:'default'});
export function arkadasPozu(kim:'tavsan'|'seftali'|'bulut',i=kim==='seftali'?7:5){
  return arkadasPozlari['../../assets/sef/salon/arkadaslar/'+kim+'-'+i+'.webp'];
}
const olculer={
  mino:{ad:'Mino',boy:38,baldir:.19,agiz:[.591,.491],bas:[.277,.156,.736,.548]},
  lokum:{ad:'Lokum',boy:27,baldir:.18,agiz:[.605,.513],bas:[.188,.150,.809,.558]},
  babaanne:{ad:'Babaanne Nazlı',boy:52,baldir:.24,agiz:[.566,.545],bas:[.279,.255,.716,.592]},
  baba:{ad:'Baba Murat',boy:55,baldir:.26,agiz:[.480,.416],bas:[.289,.177,.713,.469]},
  dede:{ad:'Dede Hasan',boy:53,baldir:.25,agiz:[.462,.431],bas:[.264,.119,.733,.489]},
  kino:{ad:'Kino',boy:40,baldir:.22,agiz:[.574,.400],bas:[.220,.102,.778,.458]},
  anne:{ad:'Anne',boy:55,baldir:.26,agiz:[.490,.390],bas:[.308,.211,.630,.419]},
};
const adresler=import.meta.glob<string>('../../assets/sef/salon/oyuncular/*.webp',{eager:true,query:'?url',import:'default'});
const oturmaTemasi=[0,.04,.12,.43,.87,1];
const hazirlanan=new Map<string,Promise<void>>();
function kareyiHazirla(src:string){
  let bekle=hazirlanan.get(src);
  if(!bekle){
    const resim=new Image();resim.src=src;
    bekle=resim.decode().catch(()=>{hazirlanan.delete(src);});
    hazirlanan.set(src,bekle);
  }
  return bekle;
}
function kaynak(kim:RestoranKarakteri,eylem:'yuru'|'otur'|'tat'|'yudum'|'cigne',i:number){
  return adresler['../../assets/sef/salon/oyuncular/'+kim+'-'+eylem+'-'+i+'.webp'];
}

export function restoranOyuncusu(kim:RestoranKarakteri,mod:'gelis'|'otur'|'cikis',bitir?:()=>void,kapida=false){
  if(kim==='tavsan'||kim==='seftali'||kim==='bulut'){
    const son=kim==='seftali'?7:5;
    const pozlar=Array.from({length:son+1},(_,i)=>arkadasPozu(kim,i));
    const resim=h('img',{src:pozlar[mod==='gelis'?0:son],alt:'',draggable:false});
    const oyuncu=h('div.restoran-oyuncusu.salon-oyun-arkadasi',{
      role:'img','aria-label':karakterAdlari[kim],'data-karakter':kim,'data-poz':mod==='gelis'?'yerles':'otur'
    },h('span.restoran-oyuncu-bedeni',{},resim));
    if(mod!=='otur'){
      const bitis=()=>{
        oyuncu.dataset.poz='otur';oyuncu.hidden=mod==='cikis';
        resim.src=pozlar[son];bitir?.();
      };
      if(matchMedia('(prefers-reduced-motion:reduce)').matches){queueMicrotask(bitis);}
      else void Promise.all(pozlar.map(kareyiHazirla)).then(()=>{
        let bas:number|undefined,onceki=-1;
        function oynat(an:number){
          if(!oyuncu.isConnected)return;
          bas??=an;
          const i=Math.min(son,Math.floor((an-bas)/125));
          if(i!==onceki){resim.src=pozlar[mod==='cikis'?son-i:i];onceki=i;}
          if(i===son)bitis();else requestAnimationFrame(oynat);
        }
        requestAnimationFrame(oynat);
      });
    }
    return oyuncu;
  }
  if(kim==='zipzip'){
    const resim=new URL('../../assets/hazirlik/kres/cember-zipzip-0.webp',import.meta.url);
    const oyuncu=h('div.restoran-oyuncusu.salon-yeni-konuk',{role:'img','aria-label':karakterAdlari[kim],'data-karakter':kim,'data-poz':'otur'},
      h('span.restoran-oyuncu-bedeni',{},h('img',{src:resim.href,alt:'',draggable:false})));
    if(mod!=='otur')queueMicrotask(()=>bitir?.());
    return oyuncu;
  }
  const olcu=olculer[kim];
  const oyuncu=h('div.restoran-oyuncusu',{role:'img','aria-label':olcu.ad,'data-karakter':kim});
  const poz=h('img',{alt:'',draggable:false});
  const beden=h('span.restoran-oyuncu-bedeni',{},poz);oyuncu.append(beden);
  const [sol,ust,sag,alt]=olcu.bas;
  beden.style.setProperty('--bas-sol',sol*100+'%');
  beden.style.setProperty('--bas-ust',ust*100+'%');
  beden.style.setProperty('--bas-en',(sag-sol)*100+'%');
  beden.style.setProperty('--bas-boy',(alt-ust)*100+'%');
  for(const hedef of [oyuncu,beden]){
    hedef.dataset.agizX=String(olcu.agiz[0]);
    hedef.dataset.agizY=String(olcu.agiz[1]);
  }
  oyuncu.style.setProperty('--oyuncu-boy',olcu.boy+'%');
  const oturanY='calc(var(--misafir-oturak-y,63.5%) + '+(olcu.boy*olcu.baldir)+'%)';
  const kareSayisi=kim==='kino'?8:6;
  const otur=(i:number)=>kaynak(kim,'otur',i);
  const yuruyus=Array.from({length:kareSayisi},(_,i)=>kaynak(kim,'yuru',i));
  const oturma=Array.from({length:6},(_,i)=>otur(i));
  const mimikler={kapali:kaynak(kim,'tat',0),acik:kaynak(kim,'tat',1),mutlu:kaynak(kim,'tat',2),konus:kaynak(kim,'tat',3)};
  if(!kapida)for(const src of Object.values(mimikler))void kareyiHazirla(src);
  const yudum=kim==='lokum'?Array.from({length:4},(_,i)=>kaynak(kim,'yudum',i)):[];
  const cigne=kim==='mino'?Array.from({length:6},(_,i)=>kaynak(kim,'cigne',i)):[];
  if(!kapida)for(const src of [...yudum,...cigne])if(src)void kareyiHazirla(src);
  let tadimZamani:number|undefined;
  function mimik(ifade:keyof typeof mimikler){
    oyuncu.dataset.yuz=ifade;goster(mimikler[ifade]);
  }
  oyuncu.addEventListener('restoran-yuz',e=>{
    const ifade=(e as CustomEvent).detail;
    if(!oyuncu.dataset.tadim&&oyuncu.dataset.poz==='otur'&&Object.hasOwn(mimikler,ifade))mimik(ifade as keyof typeof mimikler);
  });
  oyuncu.addEventListener('restoran-tat',e=>{
    if(oyuncu.dataset.poz!=='otur')return;
    const {evre,icecek,puan,elde,sira}=(e as CustomEvent).detail;
    clearTimeout(tadimZamani);
    if(evre==='bitir'){delete oyuncu.dataset.tadim;mimik('kapali');return;}
    oyuncu.dataset.tadim=evre;
    if(!icecek&&kim==='babaanne'&&(evre==='temas'||evre==='tepki')){
      const i=evre==='temas'||sira===0?4:puan>=3?2:5;
      oyuncu.dataset.yuz='tat-'+i;goster(kaynak(kim,'tat',i));return;
    }
    if(!icecek&&cigne[0]){
      const ciz=(i:number)=>{oyuncu.dataset.yuz='cigne-'+i;goster(cigne[i]);};
      if(evre==='yaklas'&&!elde){ciz(0);tadimZamani=window.setTimeout(()=>ciz(1),335);}
      else if(evre==='yaklas')ciz(1);
      else if(evre==='temas')ciz(2);
      else if(sira===0)ciz(3);
      else ciz(puan>=3?4:5);
      return;
    }
    if(icecek&&yudum.length){
      const yudumPozu=(i:number)=>{oyuncu.dataset.yuz='yudum-'+i;goster(yudum[i]);};
      if(evre==='yaklas'&&!elde){yudumPozu(0);tadimZamani=window.setTimeout(()=>yudumPozu(1),335);}
      else if(evre==='yaklas'||evre==='temas')yudumPozu(1);
      else if(sira===0)yudumPozu(2);
      else if(sira===1&&puan>=3)yudumPozu(3);
      else mimik('kapali');
      return;
    }
    if(evre==='yaklas'){
      const hazir=()=>mimik(icecek?'konus':'acik');
      if(elde)hazir();
      else{mimik('kapali');tadimZamani=window.setTimeout(hazir,335);}
    }else if(evre==='temas'){
      mimik(icecek?'konus':'kapali');
    }else if(evre==='tepki'){
      if(sira===0)mimik(icecek?'kapali':'konus');
      else if(sira===1)mimik('kapali');
      else mimik(puan>=3?'mutlu':'konus');
    }
  });
  function goster(src:string){if(src&&poz.getAttribute('src')!==src)poz.src=src;}
  function dinlen(){
    oyuncu.dataset.poz='otur';beden.style.left='var(--misafir-x,57%)';beden.style.top=oturanY;
    beden.style.scale='1';oyuncu.dataset.yuz='kapali';goster(mimikler.kapali);
  }
  const ayriliyor=mod==='cikis';
  if(mod==='otur'||ayriliyor)dinlen();
  if(mod==='otur')return oyuncu;
  if(!ayriliyor){
    beden.style.left='var(--misafir-kapi-x,15%)';beden.style.top='var(--misafir-kapi-y,68%)';
    beden.style.scale='.84';oyuncu.dataset.poz='yuru';goster(yuruyus[0]);
  }
  const sakin=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const adimMs=kim==='lokum'?102:127;
  const hazir=Promise.all([...yuruyus,...oturma].map(kareyiHazirla));
  requestAnimationFrame(async()=>{
    await hazir;
    if(!oyuncu.isConnected)return;
    if(sakin){if(ayriliyor)oyuncu.hidden=true;else dinlen();bitir?.();return;}
    const boy=oyuncu.getBoundingClientRect();
    const nokta=(ad:string,yedek:number)=>parseFloat(getComputedStyle(oyuncu).getPropertyValue(ad))||yedek;
    const x1=nokta('--misafir-kapi-x',15),x2=nokta('--misafir-x',57);
    const y1=nokta('--misafir-kapi-y',68),y2=nokta('--misafir-zemin-y',80);
    const oturak=nokta('--misafir-oturak-y',63.5)+olcu.boy*olcu.baldir;
    const donguMesafesi=boy.height*olcu.boy/100*.52;
    const turSayisi=Math.max(1,Math.round(Math.abs(x2-x1)*boy.width/100/donguMesafesi));
    const yurumeMs=turSayisi*kareSayisi*adimMs;
    let gecen=0,once=performance.now();
    function oyna(simdi:number){
      if(!oyuncu.isConnected)return;
      if(!document.hidden)gecen+=Math.min(simdi-once,80);
      once=simdi;
      const yerlesmeMs=6*136+200;
      const kareAni=ayriliyor?Math.max(0,yurumeMs+yerlesmeMs-gecen):gecen;
      if(kareAni<yurumeMs){
        const t=kareAni/yurumeMs;
        oyuncu.dataset.poz=ayriliyor?'ayril':'yuru';
        beden.style.left=x1+(x2-x1)*t+'%';beden.style.top=y1+(y2-y1)*t+'%';
        beden.style.scale=String(.84+t*.16);
        const adimAni=ayriliyor?gecen-yerlesmeMs:kareAni;
        poz.style.transform=ayriliyor?'scaleX(-1)':'';
        if(ayriliyor&&kareAni<220)beden.style.opacity=String(kareAni/220);
        goster(yuruyus[Math.floor(adimAni/adimMs)%kareSayisi]);
      }else{
        const oturmaAni=(kareAni-yurumeMs)/136;
        const i=Math.min(5,Math.floor(oturmaAni));
        const ara=Math.min(1,oturmaAni-i);
        const yukselme=oturmaTemasi[i]+(oturmaTemasi[Math.min(5,i+1)]-oturmaTemasi[i])*ara;
        oyuncu.dataset.poz=ayriliyor?'kalk':'yerles';beden.style.left=x2+'%';beden.style.scale='1';
        beden.style.top=y2+(oturak-y2)*yukselme+'%';goster(oturma[i]);
      }
      if(gecen>=yurumeMs+yerlesmeMs){if(ayriliyor)oyuncu.hidden=true;else dinlen();bitir?.();return;}
      requestAnimationFrame(oyna);
    }
    requestAnimationFrame(oyna);
  });
  return oyuncu;
}
