import { boyalar, cizmeyiBagla, kagittakiIzler, sekilYolu, yeterli } from './defter';
import { bosDers, cevapSirasi, etkinlikler, sonra, type DersDefteri } from './ders-programi';
import { ilkTur } from './model';
import { panoyuAc,panoSozu,panoTahtasi } from './pano';
import { efekt } from '../../src/audio/efekt';
import { anaMenuyeDon } from '../../src/uygulama';
import { simge } from './cizim';
import type { Sabah } from './model';
import './sinif-etkinligi.css';

const dosyalar=import.meta.glob<string>('../../assets/hazirlik/etkinlik/*.webp',{eager:true,query:'?url',import:'default'});
const fonlar=import.meta.glob<string>('../../assets/hazirlik/ders-ekranlari/*.webp',{eager:true,query:'?url',import:'default'});
export const ekranFonu=(ad:string)=>fonlar['../../assets/hazirlik/ders-ekranlari/'+ad+'.webp'];
const sanat=(ad:string)=>'<img alt="" draggable="false" src="'+dosyalar['../../assets/hazirlik/etkinlik/'+ad+'.webp']+'">';
const nesne=(set:string,i:number)=>sanat(set+'-'+i);
const svg=(v:string,ic:string)=>'<svg aria-hidden="true" viewBox="0 0 '+v+'">'+ic+'</svg>';
const isaret=svg('28 28','<circle cx="14" cy="14" r="12" fill="#fbefc4" stroke="#262523" stroke-width="1.4"/><path d="m8 14 4 4 8-9" fill="none" stroke="#326859" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>');
const adetler:Record<number,number[][]>={1:[[20,20]],2:[[12,28],[28,12]],3:[[10,30],[20,20],[30,10]],4:[[11,11],[29,11],[11,29],[29,29]],5:[[10,10],[30,10],[20,20],[10,30],[30,30]]};
const noktalar=(n:number)=>svg('40 40',adetler[n].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="currentColor"/>').join(''));
const sekil=(ad:string)=>svg('100 90','<g fill="none" stroke="currentColor" stroke-width="3.6" stroke-linejoin="round">'+(ad==='yuvarlak'?'<circle cx="50" cy="44" r="31"/>':ad==='ucgen'?'<path d="M50 10 90 77H10Z"/>':'<rect x="18" y="12" width="65" height="65"/>')+'</g>');
const sepet=svg('250 110','<g fill="none" stroke="#2d2622" stroke-width="2.4" stroke-linejoin="round"><path d="M40 55C55-10 180-10 209 55l-6 3C175 2 69 1 47 58Z" fill="#e8ae67"/><path d="m20 58 12 35q2 7 12 7h160q8 0 11-8l13-34Z" fill="#e6ac62"/><path d="M38 79h173m-139-14 4 31m85-31-4 31" stroke="#94632e" stroke-width="1.8"/><rect x="17" y="52" width="215" height="12" rx="6" fill="#f5c881"/></g>');
const buton=(id:string,ad:string,ic:string,cls='',oz='')=>'<button type="button" class="'+cls+'" data-et="'+id+'" aria-label="'+ad+'" '+oz+'>'+ic+'</button>';
const kartSirasi=[[3,0,4,2,5,1],[5,2,0,3,1,4],[4,1,5,0,3,2]];
function cizimAsamasi(d:DersDefteri){
  const set=etkinlikler[d.tur]?.set;
  return !d.onay && d.isaret.length===3 && (set==='ucgen'||set==='kare')?set:null;
}
function soru(d:DersDefteri){
  const e=etkinlikler[d.tur];if(!e||e.tur==='album')return 'defter_kapanis';
  if(e.tur==='pano')return panoSozu(d.pano);
  if(e.tur==='defter')return e.set==='harf'&&yeterli(d.harf,'harf')?'defter_harf_bitti':'defter_'+e.set;
  if(d.onay)return e.tur==='say'?['','','dogru_iki','dogru_uc','dogru_dort'][e.adet!]:'mino_dogru';
  if(e.tur==='buyume')return d.sira?'buyume_sonraki':'buyume_kesfet';
  if(e.tur==='ritim')return d.ikinciRitim?'ritim_ikinci':'ritim_dinle';
  if(cizimAsamasi(d))return 'ciz_'+e.set;
  if(e.tur==='say')return d.secim===null?'sec_'+e.set:d.isaret.length===e.adet?'kac':e.adet!>2?'say_kendin':'say_dokun';
  if(e.tur==='sira'&&e.set!=='bahce')return 'dizi_eksik';
  return (e.tur==='sekil'?'bul_':'dizi_')+e.set;
}
export const dersSorusu=(s:Sabah)=>soru(s.ders);
export function ogretmenSanati(d:DersDefteri){
  const e=etkinlikler[d.tur];
  if(e?.tur==='say'||e?.set==='ucgen'||e?.set==='bahce')return '<span class="ogretmen-nesnesi">'+sanat('ceren-'+e.tur)+'</span>';
  return '';
}
function tahta(d:DersDefteri){
  const e=etkinlikler[d.tur];
  if(!e||e.tur==='album')return '<svg viewBox="0 0 360 285" aria-hidden="true">'+kagittakiIzler(d.resim)+'</svg>';
  if(e.tur==='pano')return panoTahtasi();
  if(e.tur==='sekil')return sekil(e.set);
  if(e.tur==='buyume')return svg('100 90','<g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"><circle cx="50" cy="45" r="16"/><path d="M50 14v7m0 48v7M19 45h7m48 0h7M28 23l5 5m34 34 5 5M28 67l5-5m34-34 5-5"/></g>');
  if(e.tur==='ritim')return svg('100 90','<g fill="currentColor"><ellipse cx="32" cy="62" rx="10" ry="7"/><ellipse cx="65" cy="54" rx="10" ry="7"/><path d="M38 62V29l36-9v34h-4V30l-28 7v25Z"/></g>');
  if(e.set==='harf')return svg('360 285','<path class="harf-ornek" pathLength="1" d="'+sekilYolu('harf')+'" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/>');
  if(e.set==='resim')return nesne('bahce',1);
  if(e.tur==='sira')return '';
  return nesne(e.set,d.secim??0);
}
export const dersTahtasi=(d:DersDefteri)=>'<div class="et-tahta">'+tahta(d)+'</div>';
const defterEv=(d:DersDefteri,tamam=false)=>'<svg class="ev-kagidi" viewBox="0 0 360 285" aria-label="Çizdiğin ev" role="img">'+
  (tamam?'<path d="M91 259h175" fill="none" stroke="#88ad77" stroke-width="4" stroke-linecap="round"/><rect x="139" y="159" width="28" height="30" rx="1" fill="#c2e9e4" stroke="#3e5550" stroke-width="2"/><path d="M153 159v30m-14-15h28" stroke="#3e5550" stroke-width="2"/><path d="M195 256v-57q0-3 3-3h19q3 0 3 3v57" fill="#efbc7f" stroke="#6f5346" stroke-width="2"/>':'')+
  '<g class="murekkep">'+kagittakiIzler(d.izler)+'</g></svg>';
type DefterSayfasi='ucgen'|'kare'|'harf'|'resim';
function izDefteri(s:Sabah,asama:DefterSayfasi){
  const serbest=asama==='resim',harf=asama==='harf',kart=harf||serbest;
  const izler=kart?s.ders[asama]:s.ders.izler;
  const renkler=['Mercan','Turkuaz','Mor'];
  const bas=harf?[91,214]:asama==='ucgen'?[180,38]:[113,124];
  const kilavuz=serbest?'':'<path d="'+sekilYolu(asama)+'" fill="none" stroke="#a7b4a6" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 9"/><circle cx="'+bas[0]+'" cy="'+bas[1]+'" r="7" fill="#75b79b"/>';
  const ad=harf?'Mino’nun M harfi':serbest?'Mino için bahçe resmi':'Şekil çizme sayfası';
  return '<div class="et-cizim"><svg class="et-kagit" viewBox="0 0 360 285" aria-label="'+ad+'" role="img">'+kilavuz+'<g class="murekkep">'+kagittakiIzler(izler)+'</g><g class="yeni-iz" fill="none" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></svg><div class="et-boyalar">'+
    boyalar.map((r,i)=>buton('boya-'+i,renkler[i]+' kalem',svg('40 40','<path d="m9 30 3-10L29 3l8 8-17 17-11 4Z" fill="'+r+'" stroke="#211f20" stroke-width="1.7"/><path d="m9 32 3-12 8 8Z" fill="#ecc89a" stroke="#211f20" stroke-width="1.5"/>'),'et-kalem','aria-pressed="'+(s.boya===i)+'"')).join('')+
    buton('sil-son','Bu şeklin son çizgisini sil',svg('40 40','<path d="M5 25 22 7q2-2 4 0l9 8q2 2 0 4L20 35H14l-9-7Z" fill="#ea9d91" stroke="#242024" stroke-width="1.7"/><path d="m5 25 7-7 14 13-6 4h-6l-9-7Z" fill="#f8e3bd" stroke="#242024" stroke-width="1.7"/>'),'et-kalem')+(kart?buton('kart-bitti',harf?'Resim sayfasına geç':'Kartı Mino’ya ver',simge('ileri'),'et-kalem kart-ileri',yeterli(izler,asama)?'':'disabled'):'')+'</div></div>';
}
interface Baglar{ses:(ad:string,son?:()=>void)=>void;sesiDurdur:()=>void;kaydet:()=>void;dokun:()=>void;bastan:()=>void;nota:(n:number)=>void}
export function etkinligiAc(bolum:HTMLElement,s:Sabah,is:Baglar){
  const d=s.ders;
  const masa=document.createElement('div');masa.className='et-masa';bolum.append(masa);
  let dinlendi=d.sira>0, ornekCaliyor=false, calim=0;
  for(const kim of ['mino','zipzip']){
    const cocuk=bolum.querySelector('.sira-'+kim+' .ders-poz')!;
    cocuk.insertAdjacentHTML('beforeend','<span class="et-soz-pozu">'+sanat(kim+'-0')+sanat(kim+'-1')+'</span>');
  }
  const konus=(id:string,son?:()=>void)=>{
    if(ornekCaliyor){calim++;ornekCaliyor=false;goster()}
    bolum.dataset.konusan=id.startsWith('mino_')?'mino':id.startsWith('zip_')?'zipzip':id.startsWith('kino_')?'kino':'ceren';
    bolum.dataset.sesli='evet';
    is.ses(id,()=>{bolum.dataset.sesli='';son?.()});
  };
  const e=()=>etkinlikler[d.tur];
  if(e()?.tur==='pano'){
    for(const [koltuk,renk] of [['mino','#efba53'],['zipzip','#7db2d5']]){
      const kagit=bolum.querySelector('.sira-'+koltuk+' .sira svg');
      kagit?.insertAdjacentHTML('beforeend','<g stroke="#343031" stroke-width=".8" fill="'+renk+'"><ellipse cx="99" cy="19" rx="5" ry="3"/><ellipse cx="116" cy="19" rx="4" ry="3"/><path d="m99 22 2 3m15-3 2 4"/></g>');
    }
    for(const [sinif,soz] of [['.ders-ceren',()=>panoSozu(d.pano)],['.sira-mino',()=>'mino_pano'],['.sira-zipzip',()=>'zip_pano']] as const){
      bolum.querySelector<HTMLButtonElement>(sinif)!.onclick=()=>{is.dokun();konus(soz())};
    }
    panoyuAc(masa,d.pano,{konus,kaydet:is.kaydet,dokun:is.dokun,eve:()=>{is.sesiDurdur();anaMenuyeDon()},
      deftere:d.harf.length?()=>{d.tur=etkinlikler.findIndex(e=>e.tur==='album');yenileSinif()}:undefined});return;
  }
  let oncekiSayfa=false;
  const sonraki=()=>buton('ileri','Sonraki etkinlik',simge('ileri'),'et-ileri');
  function ritmiDinlet(){
    const sira=cevapSirasi(e(),d),siraNo=++calim;
    ornekCaliyor=true;is.sesiDurdur();goster();
    function vurus(n:number){
      if(!bolum.isConnected||siraNo!==calim)return;
      if(document.hidden){ornekCaliyor=false;goster();return}
      masa.querySelector('.vurdu')?.classList.remove('vurdu');
      if(n===sira.length){ornekCaliyor=false;dinlendi=true;goster();konus('ritim_sende');return}
      const calgi=masa.querySelector('[data-et="nesne-'+sira[n]+'"]');
      const sure=d.ikinciRitim?[660,365,790,640][n]:670;
      calgi?.classList.add('vurdu');
      efekt.sinifCalgisi(sira[n]);
      window.setTimeout(()=>calgi?.classList.remove('vurdu'),Math.round(sure*.55));
      window.setTimeout(()=>vurus(n+1),sure);
    }
    vurus(0);
  }
  function oykuyuGoster(){
    const ders=e(),ritim=ders.tur==='ritim',set=ritim?'muzik':'tohum';
    const resimler=cevapSirasi(ders,d).map((i,k)=>'<span class="at-yuva '+(k===d.sira?'bekliyor':'')+'">'+(k<d.sira?nesne(set,i):'<i></i>')+'</span>').join('');
    return '<div class="at-serit">'+(ritim&&!d.onay?buton('ornek','Ritmi dinle',simge('ses'),'at-dinle',ornekCaliyor?'disabled':''):'')+resimler+'</div>';
  }
  function atolyedekiSecenekler(){
    const ders=e(),ritim=ders.tur==='ritim',set=ritim?'muzik':'tohum';
    const siralama=ritim?[3,0,1]:[3,0,2,1];
    return '<div class="at-secenekler">'+siralama.map(i=>{
      const secildi=!ritim&&ders.dizi!.slice(0,d.sira).includes(i),kapali=secildi||ornekCaliyor||(ritim&&!dinlendi);
      return buton('nesne-'+i,ders.adlar[i],nesne(set,i)+(secildi?isaret:''),'at-nesne'+(secildi?' yerlesti':''),kapali?'disabled':'');
    }).join('')+'</div>';
  }
  function palet(){
    const ders=e(),sira=kartSirasi[d.tur%3];
    return '<div class="et-palet">'+sira.map(i=>{
      const alindi=ders.tur==='sekil'&&d.isaret.includes(i);
      return buton('nesne-'+i,ders.adlar[i],nesne(ders.set,i)+(alindi?isaret:''),'et-nesne'+(alindi?' alindi':''),alindi?'disabled':'');
    }).join('')+'</div>';
  }
  function ustAlan(){
    const ders=e();
    if(ders.tur==='buyume'||ders.tur==='ritim')return oykuyuGoster();
    if(ders.tur==='say'){
      if(d.secim===null)return '<div class="et-ornek secim-ornek">'+(ders.set==='meyve'?'<div class="et-sepet">'+sepet+'</div>':'')+[0,1,2].map(i=>nesne(ders.set,i)).join('')+'</div>';
      return '<div class="et-sayilanlar">'+Array.from({length:ders.adet!},(_,i)=>buton('say-'+i,ders.adlar[d.secim!]+' say '+(i+1),nesne(ders.set,d.secim!)+'<i></i>','et-sayilan '+(d.isaret.includes(i)?'sayildi':''),d.isaret.includes(i)?'disabled':'')).join('')+'</div>';
    }
    if(ders.tur==='sekil')return '<div class="et-sekil"><span>'+sekil(ders.set)+'</span>'+[0,1,2].map((_,i)=>'<i>'+(d.isaret[i]!==undefined?nesne(ders.set,d.isaret[i]):'')+'</i>').join('')+'</div>';
    const desen=ders.dizi!;
    const bosluklar=ders.bosluklar!;
    const boncuklar=Array.from({length:desen.length*3},(_,i)=>{
      const bosluk=bosluklar.indexOf(i);
      const parca=bosluk>=d.sira?'<span class="'+(bosluk===d.sira?'siradaki':'')+'"></span>':nesne(ders.set,desen[i%desen.length]);
      return '<i>'+parca+'</i>';
    });
    return '<div class="et-serit"><div class="et-boncuk">'+boncuklar.join('')+'</div></div>';
  }
  function cevaplar(){
    const ders=e();
    if(ders.tur==='buyume'||ders.tur==='ritim')return atolyedekiSecenekler();
    if(ders.tur!=='say'||d.secim===null)return palet();
    if(ders.adet===2&&d.isaret.length!==ders.adet)return '<div class="et-say-izleri">'+Array.from({length:ders.adet},(_,i)=>'<i class="'+(i<d.isaret.length?'dolu':'')+'"></i>').join('')+'</div>';
    const n=ders.adet!,secimler=n===2?[2,3,1]:n===3?[2,4,3]:[5,4,3];
    return '<div class="et-cevaplar">'+secimler.map(i=>buton('adet-'+i,i+' nokta',noktalar(i),'et-zar')).join('')+'</div>';
  }
  function goster(){
    const ders=e()?.tur==='album'?undefined:e(),kart=ders?.tur==='defter',asama=kart?(ders.set==='harf'?'harf':'resim'):cizimAsamasi(d);
    masa.dataset.tur=ders?.set||'defter';
    const fon=ekranFonu(kart?'ciz-kare':asama?'ciz-'+asama:ders?.set||'album');
    if(fon){masa.dataset.yuzey=asama?'cizim':ders?'masa':'album';masa.style.backgroundImage='url("'+fon+'")'}
    bolum.dataset.sozIsteyen=ders&&d.onay?(d.tur%2?'zipzip':'mino'):'';
    const tahtaAlani=bolum.querySelector('.et-tahta');if(tahtaAlani)tahtaAlani.innerHTML=tahta(d);
    if(!ders){
      const saydiklarim=d.saydiklarim.map((secim,i)=>'<div class="et-kayit-satiri">'+Array.from({length:i+2},()=>nesne(etkinlikler[i*3].set,secim)).join('')+'</div>').join('');
      const kayit=(sayfa:'harf'|'resim')=>'<svg class="kart-hatira" viewBox="0 0 360 285" role="img" aria-label="'+(sayfa==='harf'?'Yazdığın M':'Çizdiğin bahçe')+'">'+kagittakiIzler(d[sayfa])+'</svg>';
      const eskiCalisma=s.izler.length||d.izler.length||d.saydiklarim.length;
      const sol='<div class="et-gecmis">'+(s.izler.length?'<svg viewBox="95 15 175 255">'+kagittakiIzler(s.izler)+'</svg>':'')+(saydiklarim||nesne('tohum',2))+'</div>';
      const sayfalar=oncekiSayfa?sol+defterEv(d,true):kayit('harf')+kayit('resim');
      const cevir=eskiCalisma?buton('yaprak',oncekiSayfa?'Mino’nun kartına dön':'Önceki çalışmaları gör',simge('ileri'),'kart-yaprak '+(oncekiSayfa?'':'geri')):'';
      masa.innerHTML='<div class="et-album"><div class="et-album-ic">'+sayfalar+'</div>'+cevir+'</div><div class="et-son">'+buton('dinle','Kino defterini anlatsın',simge('ses'),'et-ileri')+buton('tekrar','Dersi yeniden oyna',simge('yenile'),'et-ileri')+buton('eve','Sabaha dön',simge('ev'),'et-ileri')+buton('senlige','Sınıf panosu için resim çiz',simge('ileri'),'et-ileri')+'</div>';return;
    }
    if(asama){
      masa.innerHTML=izDefteri(s,asama);const kagit=masa.querySelector<SVGSVGElement>('.et-kagit')!;
      kagit.addEventListener('pointerdown',is.dokun);
      if(asama==='harf'||asama==='resim'){
        const izler=d[asama];
        const ileri=masa.querySelector<HTMLButtonElement>('.kart-ileri')!;
        const kaydet=()=>{is.kaydet();ileri.disabled=!yeterli(izler,asama)};
        cizmeyiBagla(kagit,asama,izler,()=>s.boya,kaydet,()=>{
          const ilkKez=ileri.disabled;kaydet();
          if(ilkKez&&asama==='harf')konus('defter_harf_bitti');
        });return;
      }
      cizmeyiBagla(kagit,asama,d.izler,()=>s.boya,()=>{is.kaydet();if(d.izler.filter(iz=>iz.asama===asama).length===4)konus('ciz_yeniden')},tamam);return;
    }
    const evHazir=d.onay&&(ders.set==='ucgen'||ders.set==='kare');
    masa.innerHTML='<div class="et-tabla">'+(evHazir?defterEv(d,ders.set==='kare'):ustAlan())+'</div>'+
      (d.onay?'<div class="et-onay">'+isaret+sonraki()+'</div>':'<div class="et-alt">'+cevaplar()+'</div>');
  }
  function tamam(){
    d.onay=true;is.kaydet();goster();if(e().tur!=='ritim')is.nota(3);
    const yanit=e().tur==='ritim'?'mino_ritim_bitti':(d.tur%2?'zip_':'mino_')+e().set;
    if(e().tur==='say')konus(soru(d),()=>{if(bolum.isConnected)konus(yanit)});
    else konus(yanit);
  }
  function tekrar(b:HTMLButtonElement,id:string){
    b.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:240});
    if(id==='say_yeniden'){
      const cevap=Number(b.dataset.et!.slice(5));
      const sayilan=masa.querySelector<HTMLElement>('.et-sayilanlar')!;
      sayilan.querySelector('.et-artan')?.remove();
      sayilan.querySelectorAll('.et-sayilan i').forEach((nokta,i)=>nokta.classList.toggle('et-eksik',i>=cevap));
      if(cevap>e().adet!)sayilan.insertAdjacentHTML('beforeend','<i class="et-artan" aria-hidden="true"></i>');
    }else if(id==='dizi_tekrar'){
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
        masa.querySelectorAll('.et-boncuk:first-child img').forEach((img,i)=>img.animate(
          [{transform:'translateY(0)'},{transform:'translateY(-12%)'},{transform:'translateY(0)'}],
          {delay:i*250,duration:350}));
      }
    }
    konus(id);
  }
  function sec(b:HTMLButtonElement){
    const id=b.dataset.et;if(!id||b.disabled)return;
    is.dokun();const ders=e();
    if(id==='eve'){is.bastan();return}
    if(id==='senlige'&&ders?.tur==='album'){sonra(d);yenileSinif();return}
    if(id==='yaprak'){oncekiSayfa=!oncekiSayfa;goster();return}
    if(id==='dinle'){konus(oncekiSayfa?(s.izler.length?'kino_son':'kino_ev'):'kino_kart');return}
    if(id==='kart-bitti'&&ders?.tur==='defter'){
      const sayfa=ders.set==='harf'?'harf':'resim';
      if(yeterli(d[sayfa],sayfa)){sonra(d);yenileSinif()}return;
    }
    if(id==='tekrar'){s.ders=bosDers();s.ders.tur=ilkTur;yenileSinif();return}
    if(id==='ileri'){if(d.onay){sonra(d);yenileSinif()}return}
    if(!ders||d.onay)return;
    if(id==='ornek'){ritmiDinlet();return}
    if(id==='sil-son'){
      if(ders.tur==='defter'){d[ders.set==='harf'?'harf':'resim'].pop();is.kaydet();goster();return}
      if(d.izler.at(-1)?.asama===cizimAsamasi(d)){d.izler.pop();is.kaydet();goster()}
      return;
    }
    const i=Number(id.split('-')[1]);
    if(id.startsWith('boya-')){s.boya=i;is.kaydet();masa.querySelectorAll('[data-et^="boya-"]').forEach((el,k)=>el.setAttribute('aria-pressed',String(i===k)));return}
    if(id.startsWith('say-')){
      if(d.isaret.includes(i))return;
      d.isaret.push(i);is.kaydet();goster();const n=d.isaret.length;
      konus('say_'+n,n===ders.adet?()=>{if(bolum.isConnected&&!d.onay)konus('kac')}:undefined);return;
    }
    if(id.startsWith('adet-')){if(i===ders.adet)tamam();else tekrar(b,d.isaret.length===ders.adet?'say_yeniden':'say_kontrol');return}
    if(!id.startsWith('nesne-'))return;
    if(ders.tur==='buyume'||ders.tur==='ritim'){
      const ritim=ders.tur==='ritim';
      if(ritim){if(!dinlendi||ornekCaliyor)return;is.sesiDurdur();efekt.sinifCalgisi(i)}
      const dizi=cevapSirasi(ders,d);
      if(i!==dizi[d.sira]){tekrar(b,ritim?'ritim_yeniden':d.sira?'buyume_ipucu':'buyume_kesfet');return}
      d.sira++;
      if(d.sira===dizi.length){
        if(ritim&&!d.ikinciRitim){d.ikinciRitim=true;d.sira=0;dinlendi=false;is.kaydet();goster();konus(soru(d));return}
        tamam();return;
      }
      is.kaydet();goster();
      if(ritim){
        const calgi=masa.querySelector('[data-et="nesne-'+i+'"]');
        calgi?.classList.add('vurdu');window.setTimeout(()=>calgi?.classList.remove('vurdu'),180);
      }else is.nota(d.sira);
      return;
    }
    if(ders.tur==='say'){d.secim=i;is.kaydet();goster();konus(soru(d));return}
    if(ders.tur==='sekil'){
      if(i>=3){tekrar(b,'tekrar_'+ders.set);return}
      d.isaret.push(i);is.nota(d.isaret.length);
      if(d.isaret.length===3 && !cizimAsamasi(d)){tamam();return}
      is.kaydet();goster();if(cizimAsamasi(d))konus(soru(d));return;
    }
    if(i!==cevapSirasi(ders,d)[d.sira]){tekrar(b,'dizi_tekrar');return}
    d.sira++;if(d.sira===ders.dizi!.length){tamam();return}
    is.nota(d.sira);is.kaydet();goster();
  }
  function yenileSinif(){is.kaydet();bolum.dispatchEvent(new CustomEvent('ders-degisti'))}
  let basili:{id:number;b:HTMLButtonElement;x:number;y:number}|undefined;
  let fareDugmesi:HTMLButtonElement|null=null;
  const tus=(ev:Event)=>(ev.target as Element).closest<HTMLButtonElement>('[data-et]');
  masa.onpointerdown=ev=>{
    const b=tus(ev);if(ev.pointerType==='mouse'){fareDugmesi=b;return}
    if(!b||b.disabled||basili)return;
    basili={id:ev.pointerId,b,x:ev.clientX,y:ev.clientY};b.setPointerCapture(ev.pointerId);
  };
  masa.onpointerup=ev=>{
    if(!basili||ev.pointerId!==basili.id)return;
    const {b,x,y}=basili;basili=undefined;
    if(Math.hypot(ev.clientX-x,ev.clientY-y)<20)sec(b);
  };
  masa.onpointercancel=ev=>{if(basili?.id===ev.pointerId)basili=undefined};
  masa.onclick=ev=>{const b=tus(ev);if(b&&(!ev.detail||b===fareDugmesi))sec(b);fareDugmesi=null};
  bolum.querySelector<HTMLButtonElement>('.ders-ceren')!.onclick=()=>{is.dokun();konus(soru(d))};
  const mino=bolum.querySelector<HTMLButtonElement>('.sira-mino')!,zip=bolum.querySelector<HTMLButtonElement>('.sira-zipzip')!;
  function arkadas(kim:'mino'|'zip'){
    is.dokun();const tur=e();
    if(tur?.tur==='defter'){konus(kim+'_'+tur.set);return}
    if(!tur||tur.tur==='album'){konus(kim+'_dogru');return}
    if(d.onay&&kim===(d.tur%2?'zip':'mino')){konus(tur.tur==='ritim'?'mino_ritim_bitti':kim+'_'+tur.set);return}
    konus(kim+'_'+({say:'say',sekil:'bul',sira:'dizi',buyume:'buyume',ritim:'ritim_ipucu',pano:'pano'}[tur.tur]));
  }
  mino.onclick=()=>arkadas('mino');zip.onclick=()=>arkadas('zip');
  goster();
}
