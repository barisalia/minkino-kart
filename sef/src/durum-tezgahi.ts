import {h} from '../../src/ui/dom';
import {konus,sus} from '../../src/audio/konusma';
import {efekt} from '../../src/audio/efekt';
import {dugme,ikon} from './gorsel';
import {jest,type Nokta} from './hareket';
import {diziliKat,durumIc,durumResmi,durumTabagi} from './durum-gorseli';
import {durumIstegi,durumOku,icAdi,icler,yeniDurum,type Durum,type DurumIci} from './durum-tarifi';
const sesler=import.meta.glob<string>('../../assets/sef/durum/*.mp3',{eager:true,query:'?url',import:'default'});
export const durumRehberi=(adim:Durum['evre'])=>konus(sesler['../../assets/sef/durum/'+adim+'.mp3']);
interface Ayar {taslak?:Durum;sesli:()=>boolean;istegiDinle:()=>void;kaydet:(t:Durum)=>void;teslim:(t:Durum)=>void;geri:()=>void}
export function durumTezgahi(id:string,a:Ayar){
  const t=durumOku(a.taslak)??yeniDurum(),hedef=durumIstegi(id);
  const sahne=h('section.dr-tezgah',{'aria-label':'Rulo Dürüm tezgâhı'});
  let secili:DurumIci|undefined;
  const geri=dugme('Tepsiye dön','dr-geri',ikon('geri'));
  const fis=dugme('Dürüm siparişini dinle','dr-fis',...hedef.map(durumIc));
  const anlat=dugme('Bu adımı dinle','dr-dinle',ikon('hoparlor'));
  const is=h('div.dr-is');
  const oku=()=>{if(a.sesli())void durumRehberi(t.evre);};
  geri.onclick=()=>{sus();a.geri();};fis.onclick=a.istegiDinle;anlat.onclick=oku;
  sahne.append(durumResmi('durum/tezgah','dr-fon'),is,geri,fis,anlat);
  function yaz(){a.kaydet(t);}
  function gec(evre:Durum['evre']){t.evre=evre;yaz();ciz();oku();}
  function ses(){if(a.sesli())efekt.yapis();}
  function konum(el:HTMLElement,n:Nokta){
    const r=el.getBoundingClientRect();
    return {x:(n.x-r.left)*100/r.width,y:(n.y-r.top)*100/r.height};
  }
  function diz(){
    const lavas=dugme('İçi lavaşın üzerine yerleştir','dr-lavas',durumResmi('durum/lavas','dr-hamur'),...t.katlar.map(diziliKat));
    const raf=h('div.dr-raf',{role:'group','aria-label':'Dürüm içleri'});
    const ileri=dugme('Dürümü sarmaya geç','dr-ileri',ikon('ileri'));
    ileri.disabled=!t.katlar.length;ileri.onclick=()=>gec('sar');
    const geriAl=dugme('Son koyduğun parçayı al','dr-geri-al',ikon('tekrar'));
    geriAl.disabled=!t.katlar.length;geriAl.onclick=()=>{t.katlar.pop();yaz();ciz();};
    is.append(lavas,raf,geriAl,ileri);
    const koy=(tur:DurumIci,n:Nokta)=>{
      const {x,y}=konum(lavas,n);
      if(t.katlar.length>=18||Math.hypot((x-50)/44,(y-50)/43)>1)return;
      t.katlar.push({tur,x,y});yaz();ses();ciz();
    };
    const sec=(tur:DurumIci)=>{secili=tur;raf.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tur===tur)));};
    for(const tur of icler){
      const b=dugme(icAdi[tur]+' seç','dr-raf-gozu',durumIc(tur));b.dataset.tur=tur;b.setAttribute('aria-pressed',String(tur===secili));
      let elde:HTMLImageElement|undefined;
      const temizle=()=>{elde?.remove();elde=undefined;};
      jest(b,{basla:()=>sec(tur),tasi:(n,ilk)=>{
        if(Math.hypot(n.x-ilk.x,n.y-ilk.y)<5)return;
        if(!elde){elde=durumIc(tur);elde.classList.add('dr-elde');document.body.append(elde);}
        elde.style.left=n.x+'px';elde.style.top=n.y+'px';
      },birak:(n,_ilk,tik)=>{temizle();if(!tik)koy(tur,n);},iptal:temizle,klavye:()=>{sec(tur);lavas.focus();}});
      raf.append(b);
    }
    let klavyeX=50,klavyeY=50;
    const im=h('i.dr-imlec',{'aria-hidden':'true'});lavas.append(im);
    lavas.onkeydown=e=>{
      const d:Record<string,[number,number]>={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};
      if(d[e.key]){e.preventDefault();klavyeX=Math.max(20,Math.min(80,klavyeX+d[e.key][0]));klavyeY=Math.max(30,Math.min(70,klavyeY+d[e.key][1]));im.style.left=klavyeX+'%';im.style.top=klavyeY+'%';}
    };
    jest(lavas,{birak:n=>{if(secili)koy(secili,n);},klavye:()=>{
      if(!secili)return;const r=lavas.getBoundingClientRect();koy(secili,{x:r.x+r.width*klavyeX/100,y:r.y+r.height*klavyeY/100});is.querySelector<HTMLButtonElement>('.dr-lavas')?.focus();
    }});
  }
  function sar(){
    const lavas=h('span.dr-acik',{},durumResmi('durum/lavas','dr-hamur'),...t.katlar.map(diziliKat));
    const rulo=durumResmi('durum/rulo','dr-kenar');
    const iz=h('i.dr-sarma-izi',{},ikon('asagi'));
    const zemin=dugme('Lavaşın kenarını yukarı doğru sar','dr-sarma',lavas,rulo,iz);
    const duzenle=dugme('Dürüm içlerine dön','dr-geri-al',ikon('tekrar'));
    duzenle.onclick=()=>{t.sarma=0;gec('diz');};is.append(zemin,duzenle);
    let bas=t.sarma,sariliyor=false;
    const boya=()=>{zemin.style.setProperty('--sar',String(t.sarma));zemin.setAttribute('aria-description','Yüzde '+Math.round(t.sarma*100)+' sarıldı');};
    const ilerlet=(n:Nokta,ilk:Nokta)=>{if(sariliyor){t.sarma=Math.min(1,bas+Math.max(0,ilk.y-n.y)/(zemin.clientHeight*.77));boya();}};
    const bitir=()=>{if(t.sarma>=.96){t.sarma=1;ses();gec('kes');}else yaz();};
    jest(zemin,{basla:n=>{bas=t.sarma;sariliyor=konum(zemin,n).y>=64-t.sarma*62;},tasi:ilerlet,birak:(n,ilk)=>{ilerlet(n,ilk);bitir();},iptal:()=>{t.sarma=bas;boya();},klavye:()=>{t.sarma=Math.min(1,t.sarma+.34);boya();bitir();}});boya();
  }
  function kes(){
    const rulo=durumResmi('durum/rulo','dr-yatay-rulo');
    const sira=t.kesimler.length,bolge=sira===0?33:67;
    const cizgi=h('i.dr-kesim-cizgisi',{'aria-hidden':'true'});cizgi.style.left=bolge+'%';
    const bicak=durumResmi('nesneler/dograma-bicagi','dr-bicak');bicak.style.left=bolge+'%';
    const zemin=dugme((sira+1)+'. kesikten bıçağı aşağı sür','dr-kes',rulo,cizgi,bicak);
    for(const x of t.kesimler){const iz=h('i.dr-kesildi');iz.style.left=x+'%';zemin.append(iz);}
    let ilkX:number|undefined,gecerli=false,ilerleme=0;
    const temizle=()=>{zemin.dataset.kesiliyor='false';bicak.style.left=bolge+'%';bicak.style.top='28%';};
    const ilerlet=(n:Nokta)=>{if(ilkX===undefined)return;const {x,y}=konum(zemin,n);
      if(Math.abs(x-ilkX)>13)gecerli=false;
      ilerleme=y;bicak.style.left=x+'%';bicak.style.top=Math.max(12,Math.min(85,y))+'%';
    };
    const kesildi=(x:number)=>{t.kesimler.push(x);ses();if(t.kesimler.length===2)gec('sun');else{yaz();ciz();}};
    jest(zemin,{basla:n=>{const {x,y}=konum(zemin,n);ilkX=x;gecerli=y<=40&&x>=(sira?54:19)&&x<=(sira?81:46);ilerleme=y;zemin.dataset.kesiliyor=String(gecerli);},
      tasi:ilerlet,birak:n=>{ilerlet(n);if(gecerli&&ilerleme>=62&&ilkX!==undefined)kesildi(ilkX);else temizle();ilkX=undefined;},
      iptal:()=>{ilkX=undefined;temizle();},klavye:()=>kesildi(bolge)});
    is.append(zemin);
  }
  function ciz(){
    sahne.dataset.evre=t.evre;is.replaceChildren();
    if(t.evre==='diz')diz();else if(t.evre==='sar')sar();else if(t.evre==='kes')kes();else{
      const tabak=durumTabagi(t);
      const sun=dugme('Üç dürüm dilimini tepsiye koy','dr-sun',tabak,ikon('onay'));
      const teslim=()=>{if(sun.disabled)return;sun.disabled=true;sus();a.teslim(t);};jest(sun,{birak:(_n,_ilk,tik)=>{if(tik)teslim();},klavye:teslim});is.append(sun);
    }
  }
  ciz();return sahne;
}
