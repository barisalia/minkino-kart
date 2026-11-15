import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {jest,merkez,type Nokta} from './hareket';
import {tartUstunde,tartIstegi,tartResmi,tartMeyveAdi,tartMeyveleri,tartMeyvesiniCiz,type TartMeyvesi,type TartDilimi,type TartIstegi} from './tart-tarifi';
import './tatli-tart.css';

type Cizim=(yol:string,sinif?:string)=>HTMLImageElement;

export function tartKenariniYap(resim:Cizim,izMaskesi:number,kaydet:(n:number)=>void,bitir:()=>void){
  const tus=dugme('Hamuru tart kalıbına bastır','ta-tart-kalip',resim('sef/tatli/tart-cig','ta-tart-kalip-resmi'));
  const hedefler=[[18,32],[50,16],[82,32],[72,66],[28,66]];
  const izler=hedefler.map(([x,y],i)=>{
    const iz=h('i.ta-parmak-izi',{'aria-hidden':true});
    iz.style.left=x+'%';iz.style.top=y+'%';
    if(izMaskesi&(1<<i))iz.dataset.basildi='true';
    tus.append(iz);return iz;
  });
  function ilerle(){
    if(izMaskesi!==31||tus.disabled)return;
    tus.disabled=true;setTimeout(()=>{if(tus.isConnected)bitir();},320);
  }
  function bas(i:number){
    if(i<0||izMaskesi&(1<<i))return;
    izMaskesi|=1<<i;izler[i].dataset.basildi='true';kaydet(izMaskesi);ilerle();
  }
  function bul(e:PointerEvent){
    const r=tus.getBoundingClientRect();
    const x=100*(e.clientX-r.left)/r.width,y=100*(e.clientY-r.top)/r.height;
    bas(hedefler.findIndex(([hx,hy],i)=>!izler[i].dataset.basildi&&Math.hypot(hx-x,hy-y)<15));
  }
  tus.onpointerdown=e=>{if(e.isPrimary&&e.button===0){tus.setPointerCapture(e.pointerId);bul(e);}};
  tus.onpointermove=e=>{if(tus.hasPointerCapture(e.pointerId))bul(e);};
  tus.onclick=e=>{if(e.detail===0)bas(izler.findIndex(el=>!el.dataset.basildi));};
  ilerle();return tus;
}

export function tartSusle(calisma:HTMLElement,raf:HTMLElement,resim:Cizim,dilimler:TartDilimi[],istek:TartIstegi,kaydet:(d:TartDilimi[])=>void,bitti:()=>void,fazlaPisti=false){
  const tart=h('div.ta-tart',{},resim('sef/tatli/'+(fazlaPisti?'tart-kremali-kavruk':'tart-kremali'),'ta-tart-tabani'));
  const yerlestir=dugme('Seçili meyveyi kremaya yerleştir','ta-tart-serbest');
  const hedefler=tartIstegi(istek);
  const kaynaklar=new Map<TartMeyvesi,HTMLButtonElement>();
  const fis=calisma.closest('.tatli-tezgahi')?.querySelector('.tart-fis-rozet');
  const geri=dugme('Son meyve değişikliğini geri al','ta-tart-geri',ikon('geriAl'));
  const bitir=dugme('Tartı tabağa al','ta-sun ta-tart-bitir',ikon('onay'));
  const gecmis:TartDilimi[][]=[];
  let secili:TartMeyvesi|undefined,tutulan:number|undefined,kilit=false;
  const yerler=hedefler.map((d,i)=>{
    const yuva=dugme((i+1)+'. meyve yeri','ta-tart-yuva');
    yuva.style.left=d.x+'%';yuva.style.top=d.y+'%';yuva.dataset.yer=String(i);
    yuva.onclick=e=>{if(e.detail===0)birak(d);};return yuva;
  });
  tart.append(yerlestir,...yerler);calisma.append(tart);
  const kopyala=()=>dilimler.map(d=>({...d}));
  const uzaklik=(a:Nokta,b:Nokta)=>Math.hypot(a.x-b.x,(a.y-b.y)*.67);
  function enYakin(p:Nokta,haric=-1){
    let sonuc=-1,mesafe=8;
    dilimler.forEach((d,i)=>{const u=uzaklik(d,p);if(i!==haric&&u<mesafe){mesafe=u;sonuc=i;}});
    return sonuc;
  }
  const bosYer=()=>hedefler.find(d=>enYakin(d)===-1);
  function konum(p:Nokta){
    const r=tart.getBoundingClientRect();
    return {x:Math.round(1000*(p.x-r.left)/r.width)/10,y:Math.round(1000*(p.y-r.top)/r.height)/10};
  }
  function duyur(){
    for(const [m,b] of kaynaklar)b.setAttribute('aria-pressed',String(secili===m));
    for(const el of tart.querySelectorAll<HTMLElement>('.ta-tart-tutamak'))el.setAttribute('aria-pressed',String(Number(el.dataset.sira)===tutulan));
    for(const istek of fis?.querySelectorAll<HTMLElement>('[data-meyve]')??[]){
      const sayi=dilimler.filter(d=>d.meyve===istek.dataset.meyve).length;
      const hedef=Number(istek.dataset.adet);
      istek.dataset.tamam=String(sayi===hedef);
      istek.dataset.fazla=String(sayi>hedef);
    }
    geri.disabled=!gecmis.length&&!dilimler.length;
    bitir.disabled=dilimler.length<5||kilit;
  }
  function sakla(){
    gecmis.push(kopyala());if(gecmis.length>20)gecmis.shift();
  }
  function degisti(){
    kaydet(kopyala());ciz();
  }
  function birak(p:Nokta,tasidigimiz=tutulan,meyve=secili){
    if(kilit||!tartUstunde(p.x,p.y))return;
    if(tasidigimiz!==undefined){
      const eski=dilimler[tasidigimiz];
      if(!eski)return;
      const diger=enYakin(p,tasidigimiz);
      if(uzaklik(p,eski)<1.5)return;
      sakla();
      if(diger!==-1){
        const hedef=dilimler[diger];
        dilimler[diger]={...hedef,x:eski.x,y:eski.y};
        dilimler[tasidigimiz]={...eski,x:hedef.x,y:hedef.y};
      }else dilimler[tasidigimiz]={...eski,...p};
      tutulan=undefined;
    }else if(meyve){
      const yer=enYakin(p);
      if(yer!==-1){
        if(dilimler[yer].meyve===meyve)return;
        sakla();dilimler[yer]={...dilimler[yer],meyve};
      }else{
        if(dilimler.length>=5)return;
        sakla();dilimler.push({meyve,...p});
      }
    }else return;
    degisti();
  }
  function bagla(b:HTMLButtonElement,m:TartMeyvesi,sira?:number){
    let elde:HTMLImageElement|undefined;
    const temizle=()=>{elde?.remove();elde=undefined;b.classList.remove('ta-tart-eldevar');};
    function sec(){
      if(sira===undefined){secili=m;tutulan=undefined;}
      else if(tutulan!==undefined&&tutulan!==sira){birak(dilimler[sira]);return;}
      else if(secili){birak(dilimler[sira],undefined,secili);return;}
      else tutulan=tutulan===sira?undefined:sira;
      duyur();
    }
    jest(b,{
      tasi:(p,ilk)=>{
        if(kilit||Math.hypot(p.x-ilk.x,p.y-ilk.y)<5&&!elde)return;
        if(!elde){
          if(sira!==undefined){secili=undefined;tutulan=sira;}else{secili=m;tutulan=undefined;}
          duyur();
          elde=h('img.ta-tart-elde',{alt:'',src:tartResmi(m)});
          const rt=tart.getBoundingClientRect();
          elde.style.width=rt.width*(m==='yaban'?.12:.16)+'px';
          elde.style.height=rt.height*(m==='yaban'?.17:.23)+'px';
          b.classList.add('ta-tart-eldevar');calisma.append(elde);
        }
        const r=calisma.getBoundingClientRect();
        const kutu=merkez(b);
        const temas=sira===undefined?p:{x:kutu.x+p.x-ilk.x,y:kutu.y+p.y-ilk.y};
        elde.style.left=(temas.x-r.left)+'px';elde.style.top=(temas.y-r.top)+'px';
      },
      birak:(p,_ilk,tik)=>{
        if(!elde&&tik){sec();return;}
        const hedef=elde?konum(merkez(elde)):konum(p);
        temizle();birak(hedef,sira,m);
      },
      iptal:temizle,klavye:sec,
    });
  }
  function ciz(){
    tart.querySelectorAll('.ta-tart-tutamak').forEach(el=>el.remove());
    dilimler.forEach((d,i)=>{
      const im=tartMeyvesiniCiz(d);
      const b=dugme((i+1)+'. '+tartMeyveAdi[d.meyve]+' dilimini taşı','ta-tart-tutamak',im);
      Object.assign(b.style,{left:d.x+'%',top:d.y+'%'});
      b.dataset.meyve=d.meyve;b.dataset.sira=String(i);
      bagla(b,d.meyve,i);tart.append(b);
    });
    yerler.forEach((el,i)=>{el.hidden=enYakin(hedefler[i])!==-1||dilimler.length===5;});
    duyur();
  }
  yerlestir.onpointerup=e=>{if(e.isPrimary&&e.button===0)birak(konum({x:e.clientX,y:e.clientY}));};
  yerlestir.onclick=e=>{if(e.detail===0){const p=bosYer();if(p)birak(p);}};
  for(const yer of yerler)yer.onpointerup=e=>{if(e.isPrimary&&e.button===0)birak(konum({x:e.clientX,y:e.clientY}));};
  for(const m of tartMeyveleri){
    const b=dugme(tartMeyveAdi[m]+' dilimini al','ta-sec ta-tart-kaynak',h('img',{alt:'',src:tartResmi(m)}));
    kaynaklar.set(m,b);raf.append(b);bagla(b,m);
  }
  geri.onclick=()=>{
    if(kilit)return;
    const once=gecmis.pop();
    if(once)dilimler.splice(0,dilimler.length,...once);else dilimler.pop();
    tutulan=undefined;degisti();
  };
  bitir.onclick=()=>{if(!kilit&&dilimler.length===5){kilit=true;bitir.disabled=true;bitti();}};
  raf.append(geri,bitir);ciz();
}
