import {butun,cerceve,dilim,meyveAdlari,ornekKesit,yarim,yemek} from './meyve-cizimi';
import {mutfakAsamasi,mutfakSozu,yeniMutfak,type Kesit,type Tarif} from './meyve-tarifi';
import {tamamla,type KresKaydi} from './kres-kaydi';
import {efekt,sesiAc} from '../../src/audio/ses';
import {simge} from './cizim';
import './meyve-mutfagi.css';

const tahta='<rect x="19" y="18" width="362" height="252" rx="32" fill="#e6ab70"/><rect x="19" y="12" width="362" height="250" rx="32" fill="#f8d69b"/><rect x="34" y="86" width="9" height="78" rx="5" fill="#ac8058"/>';
const lavabo='<rect x="21" y="104" width="358" height="155" rx="58" fill="#95c9c4"/><rect x="33" y="114" width="334" height="125" rx="49" fill="#bde9e3"/><path d="M37 178q65-23 132-4t130-1q42-11 65 0v22q-4 42-52 42H90q-46 0-53-37Z" fill="#87d9db" stroke="none"/><path d="M312 113V51q0-30-31-30h-42q-24 0-24 26v14h18V47q0-9 10-9h35q16 0 16 17v58Z" fill="#a9d6cd"/><rect x="211" y="55" width="26" height="10" rx="3" fill="#74b4a9"/><path d="M275 22V10m-12 0h25" stroke-width="6"/><g class="meyve-su" stroke="#4eafb9" stroke-width="3"><path d="m217 70-3 54m10-54v52m7-52 4 50"/></g>';
const kasik='<g stroke="#272127" stroke-width="2"><path d="m188 192 90-102q7-8 12-2t-2 12l-92 100Z" fill="#dca36c"/><ellipse cx="186" cy="198" rx="14" ry="24" transform="rotate(42 186 198)" fill="#e7b986"/></g>';
const yemekResmi=(tarif:Tarif,sira:number[],kesitler:(Kesit|null)[],don=0)=>cerceve(yemek(tarif,sira,kesitler,don),'15 85 370 173');
const tamamOrnek=[0,2,4,1,3,5];
const eller=(kisi:string)=>kisi==='sis'?'zipzip':'mino';
const ad=(i:number)=>meyveAdlari[i>>1]+' parçası '+(i%2+1);

export function mutfagiAc(alan:HTMLElement,k:KresKaydi,res:(id:string)=>string,kaydet:()=>void,soyle:(ses:string)=>void){
  const d=k.meyveMutfagi,masa=document.createElement('section');masa.className='meyve-mutfagi';alan.append(masa);
  const btn=(yer:Element,isim:string,ic:string,fn:()=>void,cls='')=>{
    const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',isim);b.innerHTML=ic;
    b.onclick=()=>{sesiAc();fn()};yer.append(b);return b;
  };
  function guncelle(ses?:string){kaydet();ciz();if(ses)soyle(ses)}
  function basla(tarif:Tarif){
    Object.assign(d,yeniMutfak(),{hatira:d.hatira,tarif});guncelle(mutfakSozu(d));
  }
  function temizle(){
    if(d.temiz[d.secili]>=3)return;
    d.temiz[d.secili]++;efekt.sicrama();kaydet();
    if(d.temiz[d.secili]<3){masa.dataset.temiz=String(d.temiz[d.secili]);return}
    const sirada=d.temiz.findIndex(n=>n<3);d.secili=sirada<0?0:sirada;
    guncelle(sirada<0?mutfakSozu(d):undefined);
  }
  function tepsiye(id:number){
    if(d.tepsi.includes(id))return;
    d.tepsi.push(id);efekt.yapis();
    if(d.tepsi.includes(id^1)){const sirada=[0,1,2].find(i=>!d.tepsi.includes(i*2)||!d.tepsi.includes(i*2+1));if(sirada!==undefined)d.secili=sirada}
    guncelle(d.tepsi.length===6?mutfakSozu(d):undefined);
  }
  function diz(id:number){
    if(d.dizilen.includes(id))return;
    d.dizilen.push(id);efekt.dokunma();guncelle(d.dizilen.length===6?mutfakSozu(d):undefined);
  }
  function sun(){
    if(mutfakAsamasi(d)!=='sun')return;
    d.sunuldu=true;d.hatira={tarif:d.tarif!,dizilen:[...d.dizilen],kesitler:d.kesitler.map(k=>k!)};
    tamamla(k,'meyve-mutfagi');efekt.yildiz(1);guncelle(mutfakSozu(d));
  }
  // Sürüklenen parça parmağın altında kalır. Yuva dışında bırakılırsa ilk yerine döner.
  function tasi(el:HTMLElement|SVGElement,hedef:Element,art:string,birak:()=>void){
    let bas:{id:number;x:number;y:number}|undefined,iz:HTMLElement|undefined,suruk=false;
    const sil=()=>{iz?.remove();iz=undefined;bas=undefined;el.classList.remove('meyve-tutuldu');hedef.classList.remove('meyve-birak')};
    el.addEventListener('pointerdown',e=>{
      const p=e as PointerEvent;if(bas||p.button!==0)return;p.preventDefault();sesiAc();suruk=false;bas={id:p.pointerId,x:p.clientX,y:p.clientY};el.setPointerCapture(p.pointerId);
    });
    el.addEventListener('pointermove',e=>{
      const p=e as PointerEvent;if(bas?.id!==p.pointerId)return;
      if(!suruk&&Math.hypot(p.clientX-bas.x,p.clientY-bas.y)>7){
        suruk=true;iz=document.createElement('span');iz.className='meyve-tasinan';iz.innerHTML=art;masa.append(iz);
        el.classList.add('meyve-tutuldu');hedef.classList.add('meyve-birak');
      }
      if(iz){iz.style.left=p.clientX+'px';iz.style.top=p.clientY+'px'}
    });
    el.addEventListener('pointerup',e=>{
      const p=e as PointerEvent;if(bas?.id!==p.pointerId)return;
      const r=hedef.getBoundingClientRect(),uygun=p.clientX>=r.left-6&&p.clientX<=r.right+6&&p.clientY>=r.top-6&&p.clientY<=r.bottom+6;
      sil();if(!suruk||uygun)birak();
    });
    el.addEventListener('lostpointercapture',sil);el.addEventListener('pointercancel',sil);
    el.addEventListener('click',e=>{if(!(e as MouseEvent).detail&&e.isTrusted&&el.isConnected){sesiAc();birak()}});
    if(el instanceof SVGElement)el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();birak()}};
  }
  function tezgahHareketi(svg:SVGSVGElement,tur:'yika'|'kes'|'karistir'){
    const nesne=svg.querySelector<SVGGElement>('.meyve-elde')!,govde=nesne.querySelector<SVGGeometryElement>('[data-govde]');
    const nokta=(e:PointerEvent)=>new DOMPoint(e.clientX,e.clientY).matrixTransform(nesne.getScreenCTM()!.inverse());
    const merkez=new DOMPoint(80,85),aci=(n:DOMPoint)=>Math.atan2(n.y-merkez.y,n.x-merkez.x);
    let tut:number|undefined,ilk:DOMPoint,son:DOMPoint,yol=0;
    const iz=svg.querySelector<SVGLineElement>('.meyve-kes-izi');
    function kes(a:DOMPoint,b:DOMPoint){
      const l=Math.hypot(a.x-b.x,a.y-b.y);if(l<45||!govde)return;
      const dx=(b.x-a.x)/l,dy=(b.y-a.y)/l,mesafe=Math.abs((merkez.x-a.x)*dy-(merkez.y-a.y)*dx);
      if(mesafe>32)return;
      let ilkT:number|undefined,sonT=0;
      for(let t=-300;t<=l+300;t++){if(govde.isPointInFill(new DOMPoint(a.x+t*dx,a.y+t*dy))){ilkT??=t;sonT=t}}
      if(ilkT===undefined||ilkT< -13||sonT>l+13||sonT-ilkT<48)return;
      d.kesitler[d.secili]=[a.x+dx*ilkT,a.y+dy*ilkT,a.x+dx*sonT,a.y+dy*sonT];efekt.sayfa();guncelle('kres_mutfak_tepsi');
    }
    svg.onpointerdown=e=>{
      if(tut!==undefined||e.button!==0)return;ilk=son=nokta(e);
      if(tur==='yika'&&!govde?.isPointInFill(ilk))return;
      e.preventDefault();sesiAc();tut=e.pointerId;yol=0;svg.setPointerCapture(tut);svg.classList.add('meyve-etkin');
    };
    function karistir(){
      d.karisim++;efekt.dokunma();kaydet();
      if(d.karisim>=4)guncelle(mutfakSozu(d));
      else svg.querySelector('.meyve-kase-ici')!.innerHTML=yemek('salata',d.dizilen,d.kesitler,d.karisim);
    }
    svg.onpointermove=e=>{
      if(tut!==e.pointerId)return;const p=nokta(e);
      if(tur==='kes'&&iz){iz.setAttribute('x1',String(ilk.x));iz.setAttribute('y1',String(ilk.y));iz.setAttribute('x2',String(p.x));iz.setAttribute('y2',String(p.y))}
      if(tur==='yika'&&govde?.isPointInFill(p)){yol+=Math.min(22,Math.hypot(p.x-son.x,p.y-son.y));if(yol>=45){yol=0;temizle()}}
      if(tur==='karistir'){
        const r=Math.hypot(p.x-80,p.y-85);
        if(r>16&&r<100){const delta=aci(p)-aci(son);yol+=Math.atan2(Math.sin(delta),Math.cos(delta));
          const el=svg.querySelector<SVGGElement>('.meyve-kasik')!;el.setAttribute('transform','translate('+((p.x-80)*.42)+' '+((p.y-85)*.25)+')');
          if(Math.abs(yol)>=Math.PI*.78){yol=0;karistir()}}
      }son=p;
    };
    const sal=()=>{tut=undefined;svg.classList.remove('meyve-etkin')};
    svg.onpointercancel=svg.onlostpointercapture=sal;
    svg.onpointerup=e=>{if(tut!==e.pointerId)return;sal();if(tur==='kes'){
      const sonNokta=nokta(e);kes(ilk,sonNokta);
      if(svg.isConnected&&Math.hypot(sonNokta.x-ilk.x,sonNokta.y-ilk.y)>18){
        svg.classList.remove('meyve-eksik-kesim');void svg.getBoundingClientRect();svg.classList.add('meyve-eksik-kesim');
      }
    }};
    svg.onkeydown=e=>{if(e.repeat||!['Enter',' '].includes(e.key))return;e.preventDefault();sesiAc();
      if(tur==='yika')temizle();else if(tur==='kes')kes(new DOMPoint(5,90),new DOMPoint(154,83));else karistir()};
  }
  function ciz(){
    const tur=mutfakAsamasi(d),i=d.secili,t=d.tarif??'salata';
    masa.replaceChildren();masa.dataset.asama=tur;masa.dataset.temiz=String(d.temiz[i]);
    if(tur==='sec'){
      for(const tarif of ['salata','sis'] as const){
        const b=btn(masa,tarif==='salata'?'Mino için meyve salatası hazırla':'Zıpzıp için meyve şişi hazırla',
          res('etkinlik/'+eller(tarif)+'-0')+yemekResmi(tarif,tamamOrnek,[ornekKesit,ornekKesit,ornekKesit]),()=>basla(tarif),'meyve-tarif');
        b.dataset.tarif=tarif;
      }return;
    }
    const calisma=document.createElement('div'),raf=document.createElement('div');calisma.className='meyve-calisma';raf.className='meyve-raf';masa.append(calisma,raf);
    const kesit=d.kesitler[i],ortak='translate(91 23) scale(1.35)';
    if(tur==='yika'||tur==='kes'){
      const parcalar=kesit?[0,1].filter(j=>!d.tepsi.includes(i*2+j)).map(j=>{
        const [x,y,u,v]=kesit,l=Math.hypot(u-x,v-y),yon=j?1:-1;
        return '<g tabindex="0" role="button" aria-label="'+ad(i*2+j)+' tabağa koy" data-yarim="'+j+'" transform="translate('+(-(v-y)/l*yon*19)+' '+((u-x)/l*yon*19)+')">'+yarim(i,kesit,j)+'</g>';
      }).join(''):butun(i);
      const suIzi='<g class="meyve-yikama-izleri" fill="#af8757" stroke="none"><path d="M45 70q9-8 15-1t-10 9q-8 2-5-8Z"/><path d="M98 92q9-7 14 1t-9 8q-9 1-5-9Z"/><path d="M61 117q7-8 13-2t-6 8q-10 2-7-6Z"/></g>';
      calisma.innerHTML=cerceve((tur==='yika'?lavabo:tahta)+'<g class="meyve-elde" transform="'+ortak+'">'+parcalar+(tur==='yika'?suIzi:'')+
        (tur==='kes'&&!kesit?'<path class="meyve-kes-rehber" d="M8 94 151 78"/><line class="meyve-kes-izi"/>':'')+'</g>','0 0 400 280');
      const svg=calisma.querySelector('svg')!;svg.setAttribute('aria-hidden','false');
      if(tur==='yika'||!kesit){
        svg.setAttribute('role','button');svg.setAttribute('tabindex','0');svg.setAttribute('aria-label',meyveAdlari[i]+(tur==='yika'?' suyun altında ovala':' parmağınla kes'));tezgahHareketi(svg,tur);
      }
      if(tur==='yika'){
        for(let n=0;n<3;n++){
          const b=btn(raf,meyveAdlari[n]+' yıka',cerceve(butun(n))+(d.temiz[n]===3?simge('tamam'):''),()=>{d.secili=n;guncelle()},'meyve-rafta');
          b.disabled=d.temiz[n]===3;b.setAttribute('aria-pressed',String(n===i));
        }
      }else{
        raf.classList.add('meyve-kucuk-tabak');raf.setAttribute('aria-label','Kesilmiş meyvelerin tabağı');
        for(const id of d.tepsi){const span=document.createElement('span');span.innerHTML=dilim(id>>1,d.kesitler[id>>1]!,id%2);raf.append(span)}
        if(kesit)svg.querySelectorAll<SVGGElement>('[data-yarim]').forEach(el=>{
          const j=Number(el.dataset.yarim);tasi(el,raf,dilim(i,kesit,j),()=>tepsiye(i*2+j));
        });
      }return;
    }
    if(tur==='diz'||tur==='karistir'){
      calisma.innerHTML=cerceve('<g class="meyve-kase-ici">'+yemek(t,d.dizilen,d.kesitler,d.karisim)+'</g>'+
        (tur==='karistir'?'<g class="meyve-elde" transform="translate(120 75)"></g><g class="meyve-kasik">'+kasik+'</g>':''),'9 58 382 204');
      if(tur==='karistir'){
        const s=calisma.querySelector('svg')!;s.setAttribute('role','button');s.setAttribute('aria-hidden','false');s.setAttribute('tabindex','0');s.setAttribute('aria-label','Kaşığı döndür');tezgahHareketi(s,tur);
      }else{
        for(const id of d.tepsi.filter(id=>!d.dizilen.includes(id))){
          const art=dilim(id>>1,d.kesitler[id>>1]!,id%2);
          const b=document.createElement('button');b.type='button';b.className='meyve-rafta';b.setAttribute('aria-label',ad(id)+(t==='sis'?' şişe diz':' kâseye koy'));b.innerHTML=art;raf.append(b);tasi(b,calisma,art,()=>diz(id));
        }
        if(d.dizilen.length)btn(calisma,'Son meyve parçasını geri al',simge('yenile'),()=>{d.dizilen.pop();guncelle()},'meyve-geri-al');
      }return;
    }
    const kisi=eller(t),kim=t==='sis'?'Zıpzıp':'Mino',art=yemekResmi(t,d.dizilen,d.kesitler,d.karisim);
    const ark=btn(calisma,kim+(tur==='sun'?' için servis et':' ile konuş'),res('etkinlik/'+kisi+'-'+Number(d.sunuldu)),()=>tur==='sun'?sun():soyle(mutfakSozu(d)),'meyve-musteri');
    if(tur==='sun'){
      const b=document.createElement('button');b.type='button';b.className='meyve-servis';b.setAttribute('aria-label','Hazırladığın tabağı '+kim+' için götür');b.innerHTML=art;raf.append(b);tasi(b,ark,art,sun);
    }else{
      const tabak=document.createElement('span');tabak.className='meyve-ikram';tabak.innerHTML=art;calisma.append(tabak);
      btn(raf,'Yeni tarif hazırla',simge('yenile'),()=>{d.tarif=null;guncelle(mutfakSozu(d))},'meyve-yeni');
    }
  }
  ciz();
}
