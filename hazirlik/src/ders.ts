import './ders.css';
import { cizmeyiBagla, kagittakiIzler, ip, balon, boyalar } from './defter';
import { simge } from './cizim';
import type { Sabah } from './model';
import { dersSorusu, dersTahtasi, ekranFonu, etkinligiAc, ogretmenSanati } from './sinif-etkinligi';
import { efekt } from '../../src/audio/ses';
const assets=import.meta.glob<string>('../../assets/hazirlik/ders/*.webp',{eager:true,query:'?url',import:'default'});
const resim=(k:string)=>assets['../../assets/hazirlik/ders/'+k+'.webp'];
export const dersFonu=resim('derslik');
const svg=(v:string,g:string)=>'<svg viewBox="0 0 '+v+'" aria-hidden="true" fill="none" stroke="#211d20" stroke-linecap="round" stroke-linejoin="round">'+g+'</svg>';
const defterIkon=svg('80 58','<path d="M8 11Q24 5 40 13Q55 5 72 10l4 37q-17-2-35 5-19-6-37-3Z" fill="#4ba596" stroke-width="2.4"/><path d="M9 7q17-4 31 4 15-7 30-4l3 34q-16-2-32 5-18-7-35-2Z" fill="#fff5d8" stroke-width="2.3"/><path d="m40 11 1 35" stroke-width="2"/><path d="m49 24 16-18 5 4-16 18-7 3Z" fill="#f1a245" stroke-width="2"/>');
const masa=svg('220 94','<g stroke-width="2.3"><path d="M21 36h14l-2 53H20zm165 0h13l2 53h-13Z" fill="#aa7953"/><path d="M13 34h194v21q0 5-6 5H20q-5 0-5-5Z" fill="#db9f63"/><path d="M29 6q2-3 6-3h150q4 0 7 4l21 24q4 7-4 8H12q-8 0-4-7Z" fill="#ffd191"/><path d="m72 13 24-1q7 0 13 3 8-4 15-3h19l8 15q-23-2-39 2-16-4-42-1Z" fill="#fff5db" stroke-width="1.3"/><path d="m109 16 3 13" stroke-width="1.2"/></g>');
const poz=(k:string)=>'<span class="ders-poz">'+[0,1,2].map(i=>'<img draggable="false" alt="" class="kare k'+i+'" src="'+resim(k+'-'+i)+'">').join('')+'</span>';
const ogrenci=(k:string,yer:string)=>'<div class="ogrenci '+yer+'">'+poz(k)+'<span class="sira">'+masa+'</span></div>';
export function okulArkadaslari(alan:HTMLElement,askida:boolean) {
  const grup=document.createElement('div');
  grup.className='sinif-arkadaslari '+(askida?'askida':'sofrada');
  grup.setAttribute('aria-hidden','true');
  grup.innerHTML=ogrenci('mino','arka-mino')+ogrenci('zipzip','arka-zipzip');
  alan.append(grup);
}
const dugum='<path d="m180 145-5 7q5-2 10 0Z" fill="#ed9a85" stroke="#653f43" stroke-width="1.4"/>';
const ornek=(tam:boolean)=>'<svg class="tahta-cizimi" viewBox="108 20 145 244" aria-hidden="true"><g fill="none" stroke="#fff3ce" stroke-width="6" stroke-linecap="round"><path pathLength="1" class="tebesir" d="'+ip+'"/>'+(tam?'<path class="tebesir ikinci" pathLength="1" d="'+balon+'"/>':'')+'</g></svg>';
const kalem=(r:string)=>svg('40 58','<g stroke-width="2.1"><path d="M12 17 20 3l8 14v33q0 4-4 4h-8q-4 0-4-4Z" fill="'+r+'"/><path d="m12 17 8-14 8 14q-8-3-16 0Z" fill="#f2cf9c"/><path d="m17 8 3-5 3 5Z" fill="'+r+'"/><path d="M12 25h16m-16 20h16" stroke-width="1.5"/></g>');
const silgi=svg('44 50','<path d="m7 29 16-20q3-3 6 0l9 8q3 3 0 6L23 42h-6L7 34q-2-2 0-5Z" fill="#edac9e" stroke-width="2.3"/><path d="m7 29 7-8 16 13-7 8h-6L7 34q-2-2 0-5Z" fill="#fff0cb" stroke-width="2"/>');
const masaDefteri=svg('360 290','<g stroke-width="2.1"><path d="m32 62 116-20q16-2 30 4 11-11 27-13l96-12 27 181-114 20q-11 3-16 8-14-3-30 0L49 246Z" fill="#419f94"/><path d="m36 56 110-18q21-3 33 5 13-12 27-14l91-12 24 178-109 20q-10 1-16 8-15-3-29 1L51 238Z" fill="#f2dcb2"/><path d="M34 49q99-25 121-21 13 1 23 9 16-14 34-17l84-12 21 179-101 17q-16 3-23 10-13-6-28-3L48 229Z" fill="#fff7de"/><path d="m178 37 15 177" stroke="#bd9877"/><path d="m212 214 13-2 2 18-7-3-5 5Z" fill="#dc7166"/><path d="M85 105c-2-18 9-32 24-32s26 12 25 27q-2 20-21 31-23-6-28-26Z" fill="#ef948b" stroke="#a9554f"/><path d="m113 131-3 6 7-1Z" fill="#e88c83" stroke="#a9554f"/><path d="M114 136q8 14 3 25-3 10 6 20" stroke="#a9554f"/><g transform="rotate(34 272 176)"><path d="M265 116q7-5 14 0v88l-7 18-7-18Z" fill="#f3ac48"/><path d="M265 126h14v67h-14Z" fill="#fbc65c"/><path d="m265 204 7 18 7-18Z" fill="#e9c79b"/><path d="m270 217 2 5 2-5Z" fill="#4b4141"/></g></g>');
const dugme=(id:string,isim:string,ikon:string,cls='')=>'<button type="button" class="'+cls+'" data-ders="'+id+'" aria-label="'+isim+'">'+ikon+'</button>';
interface Isler { sesiDurdur:()=>void; ilerle:(s:Sabah['sahne'])=>void; ses:(id:string,son?:()=>void)=>void; kaydet:()=>void; bastan:()=>void; dokun:()=>void }
export function dersGoster(alan:HTMLElement,s:Sabah,is:Isler) {
  const zil=s.sahne==='ders-zili',atolye=s.sahne==='etkinlik';
  const giris=s.sahne==='ders'||zil, bitti=s.sahne==='resim', cizgi=s.sahne==='cizgi';
  const bolum=document.createElement('div');
  bolum.className='ders-sahnesi '+(giris?'ders-giris':'ders-calisma')+(bitti?' ders-bitti':'');
  bolum.style.setProperty('--dekor-kare','url("'+resim('derslik-kare')+'")');
  if(zil&&ekranFonu('zil-kare'))bolum.style.setProperty('--dekor-kare','url("'+ekranFonu('zil-kare')+'")');
  const hoca=dugme('ogretmen','Ceren Öğretmeni dinle',(atolye&&ogretmenSanati(s.ders))||poz('ceren'),'ders-ceren');
  const kinoPoz=poz('kino-'+(s.renk||'yesil'))+'<span class="sira">'+masa+'</span>';
  const kinoSirasi=giris?dugme('ac','Kino’nun sırasındaki defteri aç',kinoPoz,'ogrenci sira-kino'):
    bitti?dugme('kino','Kino’yu dinle',kinoPoz,'ogrenci sira-kino'):'<div class="ogrenci sira-kino">'+kinoPoz+'</div>';
  const arkadas=(k:string,ad:string)=>atolye?dugme(k,ad+' ile derse katıl',poz(k)+'<span class="sira">'+masa+'</span>','ogrenci sira-'+k):ogrenci(k,'sira-'+k);
  const sinif='<div class="ders-dekor"><div class="ders-oda" style="--dekor-genis:url(&quot;'+((zil&&ekranFonu('zil'))||dersFonu)+'&quot;)">'+
    (atolye||zil?dersTahtasi(s.ders):ornek(!cizgi))+hoca+arkadas('mino','Mino')+arkadas('zipzip','Zıpzıp')+kinoSirasi+'</div></div>';
  if(atolye){
    bolum.classList.add('sinif-etkinligi');bolum.innerHTML=sinif;alan.append(bolum);
    bolum.addEventListener('ders-degisti',()=>is.ilerle('etkinlik'),{once:true});
    etkinligiAc(bolum,s,{...is,nota:n=>efekt.nota(n)});
    return;
  }
  const kilavuz=bitti?'':'<path d="'+(cizgi?ip:balon)+'" fill="none" stroke="#b7bbb1" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 10"/><circle cx="180" cy="145" r="7" fill="#76b8a4" stroke="#395b51" stroke-width="1.4"/>';
  const sayfa='<svg class="ders-kagit" viewBox="0 0 360 285" role="img" aria-label="Kino’nun çizim defteri">'+kilavuz+(bitti?dugum:'')+
    '<g class="murekkep">'+kagittakiIzler(s.izler)+'</g><g class="yeni-iz" fill="none" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"></g></svg>';
  const secenekler=boyalar.map((r,i)=>dugme('boya-'+i,['Mercan boya','Turkuaz boya','Mor boya'][i],kalem(r),'pastel')).join('');
  const boyalik='<div class="boyalar">'+secenekler+dugme('sil','Son çizgiyi sil',silgi,'ders-silgi')+'</div>';
  const defter='<div class="ders-masa"><div class="ders-defter"><i class="ders-cilt" aria-hidden="true"></i>'+sayfa+'</div>'+
    (bitti?'<div class="ders-sonu">'+dugme('tekrar','Yeni bir balon çiz',defterIkon)+dugme('derse-devam','Ceren ile saymaya başla',simge('ileri'))+'</div>':boyalik)+'</div>';
  bolum.innerHTML=sinif+(giris?dugme('ac',zil?'Ceren ile derse başla':'Kino’nun defterini aç','<span class="kucuk-kitap">'+(zil?simge('ileri'):defterIkon)+'</span><span class="masa-kitabi">'+(zil?dersTahtasi(s.ders)+'<i class="zil-ileri">'+simge('ileri')+'</i>':masaDefteri)+'</span>','defter-ac'+(zil?' et-zil':'')):defter);
  alan.append(bolum);
  function secimiGoster(){bolum.querySelectorAll<HTMLButtonElement>('.pastel').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===s.boya)))}
  secimiGoster();
  function uygula(b:HTMLButtonElement){
    is.dokun();const id=b.dataset.ders!;
    if(id==='ogretmen')is.ses(zil||bitti?dersSorusu(s):giris?'ders':s.sahne);
    else if(id==='kino')is.ses('balon');
    else if(id==='ac')is.ilerle(zil?'etkinlik':'cizgi');
    else if(id==='derse-devam')is.ilerle('etkinlik');
    else if(id==='bastan')is.bastan();
    else if(id==='tekrar'){s.izler=[];is.ilerle('cizgi')}
    else if(id==='sil'){
      const son=s.izler.at(-1);if(son?.asama===s.sahne){s.izler.pop();bolum.querySelector('.murekkep')!.innerHTML=kagittakiIzler(s.izler);is.kaydet()}
    }else if(id.startsWith('boya-')){s.boya=Number(id.slice(-1));secimiGoster();is.kaydet()}
  }
  const dugmeyiBul=(e:Event)=>(e.target as Element).closest<HTMLButtonElement>('button[data-ders]');
  let basili:{id:number;dugme:HTMLButtonElement;x:number;y:number}|undefined;
  let sonDokunus:{dugme:HTMLButtonElement;an:number}|undefined;
  bolum.onpointerdown=e=>{
    const dugme=dugmeyiBul(e);
    if(e.pointerType==='mouse'||!dugme||basili)return;
    basili={id:e.pointerId,dugme,x:e.clientX,y:e.clientY};
    dugme.setPointerCapture(e.pointerId);
  };
  bolum.onpointerup=e=>{
    if(!basili||e.pointerId!==basili.id)return;
    const {dugme,x,y}=basili;basili=undefined;
    if(Math.hypot(e.clientX-x,e.clientY-y)>20)return;
    sonDokunus={dugme,an:performance.now()};uygula(dugme);
  };
  bolum.onpointercancel=e=>{if(basili?.id===e.pointerId)basili=undefined};
  bolum.onclick=e=>{
    const dugme=dugmeyiBul(e);if(!dugme)return;
    if(e.detail && sonDokunus?.dugme===dugme && performance.now()-sonDokunus.an<650)return;
    uygula(dugme);
  };
  if(s.sahne==='cizgi'||s.sahne==='yuvarlak'){
    const kagit=bolum.querySelector<SVGSVGElement>('.ders-kagit')!;
    kagit.addEventListener('pointerdown',is.dokun);
    cizmeyiBagla(kagit,s.sahne,s.izler,()=>s.boya,is.kaydet,()=>is.ilerle(cizgi?'yuvarlak':'resim'));
  }
}
