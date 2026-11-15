import {en,boy,palet,resimAtolyesi,ucuBirlestir,resminKopyasi,panoyaAs,type Hamle,type Nokta,type Arac} from './pano-resmi';
import {tamamla,type KresKaydi} from './kres-kaydi';
import {simge} from './cizim';
import {sayfalar,sayfaAdlari,sayfayiCiz,type ResimSayfasi} from './boyama-sayfalari';
import kalem from '../../assets/hazirlik/etkinlik/kalemlik-0.webp';
import firca from '../../assets/hazirlik/etkinlik/kalemlik-1.webp';
import kova from '../../assets/giysin/ikon/kova.webp';
import {efekt,sesiAc} from '../../src/audio/ses';
import './kendi-resmim.css';
export const bosKagit='<svg viewBox="0 0 100 94" aria-hidden="true"><g stroke="#252025" stroke-width="2" stroke-linejoin="round"><path d="m13 15 65-5 6 69-65 5Z" fill="#efb77c"/><path d="m10 10 67-4 6 69-67 6Z" fill="#fff9e4"/><path d="M26 55q7-13 15-4t16-7" fill="none" stroke="#4ca89e" stroke-width="4"/><path d="m51 56 27-40 9 6-28 39-11 6Z" fill="#f4b654"/><path d="m49 65 3-10 8 6Z" fill="#4f5858"/></g></svg>';
const undo='<svg viewBox="0 0 60 60" aria-hidden="true"><path d="m8 26 18-15v9h9q19 0 18 16-1 13-16 16 11-10 6-16-2-5-11-5h-6v8Z" stroke="#242329" stroke-width="2" stroke-linejoin="round" fill="#efb56a"/></svg>';
export function kendiResminiAc(alan:HTMLElement,k:KresKaydi,kaydet:()=>void,asildi:()=>void,soyle:(id:string)=>void){
  const d=k.serbestResim,masa=document.createElement('section');masa.className='oz-resim';alan.append(masa);
  masa.innerHTML='<div class="oz-cerceve"><canvas aria-label="Serbest resim kâğıdı"></canvas></div><div class="oz-arac"></div><div class="oz-palet"></div>';
  const c=masa.querySelector('canvas')!,atolye=resimAtolyesi(c,{ciz:ctx=>sayfayiCiz(ctx,d.sayfa),kapali:()=>d.sayfa!=='bos'});
  let ileriAl:Hamle[]=[];
  let aktif:{id:number;iz:Hamle}|undefined;
  const araclar=masa.querySelector<HTMLElement>('.oz-arac')!,renkler=masa.querySelector<HTMLElement>('.oz-palet')!;
  const tus=(yer:HTMLElement,ad:string,art:string,calis:()=>void)=>{
    const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',ad);b.innerHTML=art;b.onclick=()=>{if(aktif)return;sesiAc();calis()};yer.append(b);return b;
  };
  const aletler=([['kalem','Siyah çizgi kalemi',kalem],['firca','Renkli fırça',firca],['kova','Kapalı şeklin içini boya',kova]] as const)
    .map(([arac,ad,img])=>tus(araclar,ad,'<img alt="" draggable="false" src="'+img+'">',()=>{d.arac=arac;guncelle();kaydet();efekt.dokunma()}));
  const geri=tus(araclar,'Son çizgiyi geri al',undo,()=>{
    const h=d.hamleler.pop();if(h)ileriAl.push(h);atolye.yukle(d.hamleler);guncelle();kaydet();
  });
  const yine=tus(araclar,'Geri aldığın çizgiyi getir',undo,()=>{
    const h=ileriAl.pop();if(h)d.hamleler.push(h);atolye.yukle(d.hamleler);guncelle();kaydet();
  });yine.className='oz-yine';
  const as=tus(araclar,'Kendi resmini panoya as',simge('tamam'),()=>{
    if(!d.hamleler.length)return;
    panoyaAs(resminKopyasi(c));d.hamleler=[];tamamla(k,'serbest-resim');kaydet();asildi();
  });
  const renkAdlari=['Mercan','Sarı','Yeşil','Mavi','Mor'];
  const boyalar=palet.map((r,i)=>tus(renkler,renkAdlari[i]+' boya','<i style="--boya:'+r+'"></i>',()=>{
    d.renk=i;if(d.arac==='kalem')d.arac='firca';guncelle();kaydet();efekt.dokunma();
  }));
  function guncelle(){
    aletler.forEach((b,i)=>b.setAttribute('aria-pressed',String(d.arac===(['kalem','firca','kova'] as Arac[])[i])));
    boyalar.forEach((b,i)=>b.setAttribute('aria-pressed',String(d.arac!=='kalem'&&d.renk===i)));
    geri.disabled=as.disabled=!d.hamleler.length;yine.disabled=!ileriAl.length;
    for(const [sayfa,b] of sekmeler)b.setAttribute('aria-pressed',String(sayfa===d.sayfa));
  }
  function nokta(e:PointerEvent):Nokta{
    const r=c.getBoundingClientRect();
    return [Math.max(0,Math.min(en-1,Math.round((e.clientX-r.left)/r.width*en))),Math.max(0,Math.min(boy-1,Math.round((e.clientY-r.top)/r.height*boy)))];
  }
  c.onpointerdown=e=>{
    if(aktif||e.button!==0)return;
    if(d.hamleler.length>=180){soyle('kres_resim_dolu');return}
    e.preventDefault();sesiAc();c.setPointerCapture(e.pointerId);
    aktif={id:e.pointerId,iz:{arac:d.arac,renk:d.renk,sinirli:d.arac==='firca',noktalar:[nokta(e)]}};
    if(d.arac!=='kova')atolye.goster(aktif.iz);
  };
  function noktaEkle(e:PointerEvent){
    if(!aktif||aktif.id!==e.pointerId||aktif.iz.arac==='kova')return;
    const pts=aktif.iz.noktalar,p=nokta(e),son=pts[pts.length-1];
    if(Math.hypot(p[0]-son[0],p[1]-son[1])<1.5)return;
    if(pts.length>=595)aktif.iz.noktalar=pts.filter((_,i)=>i%2===0);
    aktif.iz.noktalar.push(p);
  }
  c.onpointermove=e=>{
    if(aktif?.id!==e.pointerId||aktif.iz.arac==='kova')return;
    for(const n of e.getCoalescedEvents?.()??[])noktaEkle(n);
    noktaEkle(e);atolye.goster(aktif.iz);
  };
  c.onpointerup=e=>{
    if(aktif?.id!==e.pointerId)return;
    noktaEkle(e);const iz=aktif.iz;aktif=undefined;ucuBirlestir(iz,d.hamleler);
    const sonuc=atolye.uygula(iz);
    if(sonuc){d.hamleler.push(iz);ileriAl=[];kaydet()}else if(sonuc===false)soyle(d.sayfa==='bos'?'pano_alan':'kres_resim_ic');
    atolye.goster();guncelle();
  };
  c.onlostpointercapture=c.onpointercancel=e=>{if(aktif?.id===e.pointerId){aktif=undefined;atolye.goster()}};
  const raf=document.createElement('div');raf.className='oz-sayfalar';masa.append(raf);
  const sekmeler=new Map<ResimSayfasi,HTMLButtonElement>();
  for(const ad of sayfalar){
    const b=tus(raf,sayfaAdlari[ad]+' sayfası',ad==='bos'?bosKagit:'',()=>{
      if(ad===d.sayfa||aktif)return;
      d.taslaklar[d.sayfa]=d.hamleler;d.sayfa=ad;d.hamleler=d.taslaklar[ad]??[];delete d.taslaklar[ad];
      ileriAl=[];d.arac=ad==='bos'?'kalem':'kova';atolye.yukle(d.hamleler);guncelle();kaydet();efekt.sayfa();
    });
    if(ad!=='bos'){
      const onizleme=document.createElement('canvas');onizleme.width=180;onizleme.height=120;
      const ctx=onizleme.getContext('2d')!;ctx.scale(.3,.3);sayfayiCiz(ctx,ad,true);b.append(onizleme);
    }
    sekmeler.set(ad,b);
  }
  atolye.yukle(d.hamleler);guncelle();
}
