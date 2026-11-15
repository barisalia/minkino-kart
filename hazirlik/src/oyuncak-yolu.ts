import {efekt,sesiAc} from '../../src/audio/ses';
import {simge} from './cizim';
import {kopruDuragi,tamamla,type KresKaydi} from './kres-kaydi';
import {otomobil} from './kres-oyuncaklari';
import './oyuncak-yolu.css';

const tamYol=1000;
export function yolSozu(k:KresKaydi){
  if(k.arabaSuruldu)return 'kres_araba_garaj';
  if(k.kopruIndi)return 'kres_kopru_hazir';
  return k.surusKonumu>=kopruDuragi?'kres_kopru_yukari':'kres_araba_yol';
}
export function yolaCik(k:KresKaydi){
  k.surusKonumu=0;k.kopruIndi=false;k.arabaSuruldu=false;
}

function agac(x:number,y:number,olcek:number){
  return '<g transform="translate('+x+' '+y+') scale('+olcek+')"><path fill="#ce9459" d="M-6 0v-36h12V0Z"/><path fill="#88bb79" d="M-3-28c-19 7-30-8-22-21 0-14 11-25 25-22 12-3 23 6 23 19 11 14 0 29-15 25Z"/><path d="M0-24v-16l8-7" fill="none"/></g>';
}
function manzara(w:number,bas:number,son:number,garajX:number,garajEn:number){
  const g=garajEn/210;
  return '<svg class="yol-manzara" aria-hidden="true" viewBox="0 0 '+w+' 400"><g stroke="#292523" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">'+
    // Oyuncak masasına oturan ahşap tabanın üst ve ön yüzleri.
    '<rect x="7" y="240" width="'+(w-14)+'" height="126" rx="25" fill="#d49657"/>'+
    '<rect x="7" y="228" width="'+(w-14)+'" height="120" rx="24" fill="#a9cd87"/>'+
    '<path fill="#75cad8" d="M'+(bas+20)+' 228h'+(son-bas-20)+'q-28 28-3 51t-11 69H'+(bas-5)+'q31-32 7-61t18-59Z"/>'+
    '<path d="M'+(bas+42)+' 317q13 5 28 0m23-6q12 4 24 0" stroke="#458eaa" fill="none"/>'+
    agac(w*.16,238,.92)+agac(w*.24,232,.58)+
    '<g transform="translate('+(garajX-garajEn*.5)+' '+(285-154*g)+') scale('+g+')">'+
    '<path fill="#f9cc89" d="M11 151V48l93-36 94 36v103Z"/>'+
    '<path fill="#5d7677" d="M28 151V69q0-8 8-8h137q8 0 8 8v82Z"/>'+
    '<path fill="#f3bd76" d="M25 65V54h160v11Z"/>'+
    '<path fill="#79bcab" d="M3 49 98 8q6-3 12 0l96 38-4 13-98-38-96 41Z"/>'+
    '<circle cx="105" cy="43" r="6" fill="#fff0b3"/></g>'+
    '<path fill="#f6cf87" d="M33 285H'+bas+'v13H33q-9 0-9-6t9-7ZM'+son+' 285H'+(w-31)+'q7 0 7 7t-7 6H'+son+'Z"/>'+
    '<path fill="#c08d61" d="M'+(bas-16)+' 298h15v24h-15zm'+(son-bas+17)+' 0h15v24h-15Z"/>'+
    '<g class="yol-kopru" transform="translate('+bas+' 285)"><g class="yol-kanat">'+
    '<path d="M0 0h'+(son-bas)+'v13H0Z" fill="#eda868"/>'+
    Array.from({length:5},(_,i)=>'<path d="M'+Math.round((son-bas)*(i+1)/6)+' 1v7" stroke="#a56841"/>').join('')+
    '</g><circle r="6" fill="#ffda82"/></g></g></svg>';
}

const kolResmi='<svg viewBox="0 0 70 76" aria-hidden="true" fill="none" stroke="#292523" stroke-width="2.3" stroke-linejoin="round">'+
  '<path fill="#db9c68" d="M6 60h56l4 9H4Z"/><path d="M11 61V33q0-9 9-9h7q10 0 10 12v25Z" fill="#62b8ac"/>'+
  '<g class="yol-mandali"><path d="m20 43 24-27 5 5-23 28Z" fill="#f7bd5e"/><circle cx="48" cy="17" r="9" fill="#ffcf55"/></g>'+
  '<circle cx="23" cy="45" r="5" fill="#fce7a7"/></svg>';

export function oyuncakYolunuAc(alan:HTMLElement,k:KresKaydi,kaydet:()=>void,soyle:(id:string)=>void,rafa:()=>void){
  const dik=matchMedia('(max-aspect-ratio:1/1)').matches;
  const w=dik?640:960,arabaEn=dik?145:164,bas=arabaEn*.57,son=w-arabaEn*.72;
  const mesafe=son-bas,kopruBas=bas+mesafe*kopruDuragi/tamYol+arabaEn*.48,kopruSon=w*.665;
  const masa=document.createElement('section');masa.className='oyuncak-yolu';masa.setAttribute('aria-label','Oyuncak köprüsü ve garaj');alan.append(masa);
  const cerceve=document.createElement('div');cerceve.className='yol-kadraj';masa.append(cerceve);
  const gorunen=dik?435:w;
  cerceve.style.aspectRatio=gorunen+' / 400';
  const tabla=document.createElement('div');tabla.className='yol-tabla';tabla.style.width=w/gorunen*100+'%';tabla.style.aspectRatio=w+' / 400';cerceve.append(tabla);
  tabla.innerHTML=manzara(w,kopruBas,kopruSon,son,arabaEn*1.23);
  function tus(yer:HTMLElement,id:string,ad:string,art:string){
    const b=document.createElement('button');b.type='button';b.dataset.kres=id;b.setAttribute('aria-label',ad);b.innerHTML=art;yer.append(b);return b;
  }
  const araba=tus(tabla,'sur','Arabayı yolda sür',otomobil(undefined,false,k.arabaRengi));araba.className='yol-arabasi';
  araba.style.width=(arabaEn/w*100)+'%';araba.style.top=((285-101*arabaEn/190)/4)+'%';
  const tekerler=araba.querySelectorAll<SVGGElement>('.oto-teker');
  const kol=tus(tabla,'kopru-kolu','Sarı kolu aşağı indir',kolResmi);kol.className='yol-kolu';
  kol.style.left=(kopruBas/w*100-8)+'%';kol.style.bottom='11%';
  const tekrar=tus(masa,'yeni-tur','Arabayı yeniden sür',simge('yenile'));tekrar.className='yol-tekrar';
  const park=tus(masa,'park','Arabayı oyun odasının rafına park et',simge('tamam'));park.className='yol-park';
  let kare=0,gecis=0,hazir=k.kopruIndi,calisiyor=true,ardindanSur=false,bekleyenKonum:number|undefined;
  let parmak:{id:number;ilkX:number;ilerleme:number;suruk:boolean}|undefined;
  let kolParmak:{id:number;y:number;oran:number;suruk:boolean}|undefined;
  let kolTikiniYut=false,sonDokunus=0;
  const azHareket=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sinir=()=>hazir?tamYol:kopruDuragi;
  function ciz(){
    const yol=mesafe*k.surusKonumu/tamYol;
    const kadraj=(w-gorunen)*k.surusKonumu/tamYol;
    tabla.style.transform='translateX('+(-kadraj/w*100)+'%)';
    araba.style.left=((bas+yol-arabaEn/2)/w*100)+'%';
    const aci=yol/(18*arabaEn/190)*180/Math.PI;
    tekerler.forEach(g=>g.setAttribute('transform','rotate('+aci+' '+g.dataset.mil+' 83)'));
    tabla.classList.toggle('kopru-indi',k.kopruIndi);
    tabla.classList.toggle('kol-bekliyor',!k.kopruIndi&&k.surusKonumu===kopruDuragi);
    tekrar.hidden=park.hidden=!k.arabaSuruldu;
    kol.disabled=k.kopruIndi;
  }
  function dur(){cancelAnimationFrame(kare);kare=0}
  function konum(n:number){
    const once=k.surusKonumu;
    k.surusKonumu=Math.round(Math.min(sinir(),Math.max(0,n)));
    if(k.surusKonumu===tamYol&&!k.arabaSuruldu){
      k.arabaSuruldu=true;tamamla(k,'blok');efekt.yildiz(1);soyle('kres_araba_garaj');kaydet();
    }else if(!k.kopruIndi&&k.surusKonumu===kopruDuragi&&once<kopruDuragi){
      soyle('kres_kopru_yukari');kaydet();
    }
    ciz();
  }
  function otomatikSur(){
    if(k.arabaSuruldu)return;
    if(k.kopruIndi&&!hazir){ardindanSur=true;return}
    dur();const ilk=k.surusKonumu,hedef=sinir();
    if(ilk===hedef){if(!k.kopruIndi)soyle('kres_kopru_yukari');return}
    if(azHareket()){konum(hedef);kaydet();return}
    const start=performance.now(),sure=Math.max(300,(hedef-ilk)*1.8);
    function sur(t:number){
      if(!calisiyor||!masa.isConnected||document.hidden){dur();kaydet();return}
      const f=Math.min(1,(t-start)/sure);
      konum(ilk+(hedef-ilk)*(f*f*(3-2*f)));
      if(f<1)kare=requestAnimationFrame(sur);else{dur();kaydet()}
    }
    kare=requestAnimationFrame(sur);
  }
  function aciyiGoster(oran:number){
    tabla.style.setProperty('--yol-kopru-acisi',(-57*(1-oran))+'deg');
    tabla.style.setProperty('--yol-kol-acisi',(58*oran)+'deg');
  }
  function aciyiBirak(){
    tabla.classList.remove('kol-elde');
    tabla.style.removeProperty('--yol-kopru-acisi');tabla.style.removeProperty('--yol-kol-acisi');
  }
  function indir(){
    if(k.kopruIndi)return;
    const kalan=1-(kolParmak?.oran??0);
    aciyiBirak();k.kopruIndi=true;ciz();efekt.yapis();kaydet();
    function acildi(){
      if(!calisiyor)return;
      hazir=true;
      if(bekleyenKonum!==undefined){konum(bekleyenKonum);bekleyenKonum=undefined;kaydet()}
      if(ardindanSur){ardindanSur=false;otomatikSur()}else if(!k.arabaSuruldu)soyle('kres_kopru_hazir');
    }
    if(azHareket()||kalan===0)acildi();else gecis=window.setTimeout(acildi,460);
  }
  kol.onpointerdown=e=>{
    if(kolParmak!==undefined||e.button!==0)return;
    sesiAc();kolParmak={id:e.pointerId,y:e.clientY,oran:0,suruk:false};kolTikiniYut=false;kol.setPointerCapture(e.pointerId);
  };
  function koluCek(e:PointerEvent){
    if(kolParmak?.id!==e.pointerId)return;
    const dy=e.clientY-kolParmak.y;
    if(!kolParmak.suruk&&Math.abs(dy)<5)return;
    kolParmak.suruk=true;
    kolParmak.oran=Math.max(0,Math.min(1,dy/Math.max(25,kol.clientHeight*.55)));
    tabla.classList.add('kol-elde');aciyiGoster(kolParmak.oran);
  }
  kol.onpointermove=koluCek;
  kol.onpointerup=e=>{
    if(kolParmak?.id!==e.pointerId)return;
    koluCek(e);const tamam=!kolParmak.suruk||kolParmak.oran>=.65;
    kolTikiniYut=true;
    if(tamam)indir();else aciyiBirak();
    kolParmak=undefined;
  };
  kol.onpointercancel=kol.onlostpointercapture=e=>{
    if(kolParmak?.id===e.pointerId){kolParmak=undefined;kolTikiniYut=true;aciyiBirak()}
  };
  kol.onclick=e=>{if(e.detail===0||!kolTikiniYut){sesiAc();indir()}kolTikiniYut=false};
  araba.onpointerdown=e=>{
    if(e.button!==0||parmak||k.arabaSuruldu)return;
    sesiAc();dur();araba.setPointerCapture(e.pointerId);
    parmak={id:e.pointerId,ilkX:e.clientX,ilerleme:k.surusKonumu,suruk:false};
  };
  function surukle(e:PointerEvent){
    if(!parmak||e.pointerId!==parmak.id||k.arabaSuruldu)return;
    const dx=e.clientX-parmak.ilkX;
    if(!parmak.suruk&&Math.abs(dx)<5)return;
    parmak.suruk=true;
    // Parmağın ekran mesafesinden kameranın aynı anda aldığı yolu düş.
    const hedef=parmak.ilerleme+dx/tabla.getBoundingClientRect().width*w/(mesafe-(w-gorunen))*tamYol;
    if(k.kopruIndi&&!hazir)bekleyenKonum=hedef;
    konum(hedef);
  }
  araba.onpointermove=surukle;
  araba.onpointerup=e=>{
    if(!parmak||e.pointerId!==parmak.id)return;
    surukle(e);const suruk=parmak.suruk;parmak=undefined;sonDokunus=performance.now();ciz();kaydet();
    if(!suruk)otomatikSur();
  };
  araba.onpointercancel=araba.onlostpointercapture=e=>{if(parmak?.id===e.pointerId){parmak=undefined;ciz();kaydet()}};
  araba.onclick=e=>{if(e.detail===0||performance.now()-sonDokunus>600){sesiAc();otomatikSur()}};
  tekrar.onclick=()=>{dur();clearTimeout(gecis);sesiAc();yolaCik(k);hazir=false;ciz();kaydet();soyle('kres_araba_yol')};
  park.onclick=()=>{if(k.arabaSuruldu){sesiAc();k.arabaRafta=true;kaydet();rafa()}};
  ciz();
  return ()=>{calisiyor=false;dur();clearTimeout(gecis);kaydet()};
}
