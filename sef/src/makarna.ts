import {misafirCumlesi} from './misafir';
import sosReplik from './makarna-sos-replikleri.json';
import {havanAc} from './makarna-havani';
import { atolyeKaydi } from './atolye-kaydi';
import { h } from '../../src/ui/dom';
import { arkaPlanDinle, geriDinle } from '../../src/kabuk/yon';
import { dugme, ikon, resim } from './gorsel';
import { hareket, icinde, jest, malzemeTasi, merkez, zaman, type Nokta } from './hareket';
import { efekt } from '../../src/audio/efekt';
import { sus } from '../../src/audio/konusma';
import { plopSesi } from '../../pazar/src/meyvesuyu-ses';
import type { AtolyeAyar } from './yemekler';
import { hareketRehberi } from './rehber';
import './makarna.css';
import {yildizlar} from './salata-sosu';

const renkler=['altin','ispanak','pancar'] as const;
type Renk=typeof renkler[number];
const soslar=['kirmizi','yesil','sari'] as const;
type Sos=typeof soslar[number];
const susler=['feslegen','peynir','domates'] as const;
type Sus=typeof susler[number];
const renkAdi: Record<Renk,string>={altin:'Yumurtalı',ispanak:'Ispanaklı',pancar:'Pancarlı'};
const sosAdi: Record<Sos,string>={kirmizi:'Domates sosu',yesil:'Fesleğen sosu',sari:'Tereyağı'};
const sosKabi: Record<Sos,string>={kirmizi:'kirmizi-sos',yesil:'pesto',sari:'tereyagi'};
const susAdi: Record<Sus,string>={feslegen:'Fesleğen',peynir:'Peynir',domates:'Domates'};
const garnitur:Record<Sus,{resim:string;oran:number}>={
  domates:{resim:'domates-garnitur',oran:.16},
  peynir:{resim:'peynir',oran:.13},
  feslegen:{resim:'feslegen',oran:.14},
};
const sosIstegi:Record<Sos,string>={
  kirmizi:'Bugünkü sipariş domates soslu. Kırmızı kâseyi tabağa dök.',
  yesil:'Bugünkü sipariş fesleğen soslu. Fesleğeni seç, sonra havanda ez.',
  sari:'Bugünkü sipariş tereyağlı. Tereyağını tabağa koy.',
};
// Aynı porsiyon yerleşimi servis sahnesinde ve çocuğun tabak defterinde kullanılır.
const porsiyon=[
  {x:.34,y:.39,aci:-12}, {x:.66,y:.38,aci:13}, {x:.50,y:.64,aci:-4},
];
const dosyalar=import.meta.glob<string>('../../assets/sef/makarna/*.webp',{eager:true,query:'?url',import:'default'});
const adres=(ad:string)=>dosyalar['../../assets/sef/makarna/'+ad+'.webp'];
const cizim=(ad:string,sinif='')=>h('img',{alt:'',class:sinif,src:adres(ad),draggable:'false'});
const ASAMALAR=['renk','kes','sekil','tuz','at','suz','sos','havan','pay','sus','servis','son'] as const;
type Asama=typeof ASAMALAR[number];
const yardim: Record<Asama,string>={
  renk:'Fiyonklar hangi renk olsun? Hamurunu seç.',
  kes:'Tekerleği çizgi boyunca yuvarla. Hamuru üçe ayır.',
  sekil:'Hamurun kenarını ortaya it. Fiyonk olsun!',
  tuz:'Tuzluğu tencerenin üstüne getir. Bir tutam yeter!',
  at:'Fiyonklarını tencereye bırak.',
  suz:'Fiyonklar yumuşayınca delikli kepçeyle süzgece al.',
  sos:'Makarnan için bir sos seç ve tabağına dök.',
  pay:'',
  havan:'Fesleğen yapraklarını havanda ez. Hazır olunca sosunu tabağa dök.',
  sus:'Son dokunuşu seç. Tabağında istediğin yere bırak.',
  servis:'Servis zilini çal.', son:'Afiyet olsun!',
};
type Kivam='sert'|'tam'|'yumusan';
const kivam=(ms:number):Kivam=>ms<5000?'sert':ms<20000?'tam':'yumusan';
const lokmaAdi=(renk:Renk|null,sos:Sos|null,k:Kivam)=>renk+'-'+(k==='tam'?(sos?sos+'-lokma':'pismis'):(sos??'sade')+'-'+k);
interface Devam {
  aktif:boolean; servis:number; istek?:Sos; renk:Renk|null; kesim:number; sekil:number;
  tuzlandi:boolean; tencere:number; isiMs:number; kivamlar:Kivam[]; suzulen:number; sos:Sos|null; pestoMaskesi?:number;
  istenenSosAdedi?:1|3; soslanan?:number; sosBitti?:boolean;
  sus: {id:Sus;x:number;y:number}|null; sunuldu:boolean;
}
const ANAHTAR='minkino-sef-makarna-v1';
const kayit = atolyeKaydi<Devam>(ANAHTAR);
const sinir=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const sayi=(n:unknown,max:number)=>typeof n==='number'&&Number.isFinite(n)?sinir(Math.floor(n),0,max):0;
const yeni=(servis=0):Devam=>({aktif:true,servis,renk:null,kesim:0,sekil:0,tuzlandi:false,tencere:0,isiMs:0,kivamlar:[],suzulen:0,sos:null,sus:null,sunuldu:false});
function oku(masa = ''):Devam|undefined {
  const ham = kayit.oku(masa) as (Partial<Devam> & { kaynamaSonu?:number }) | undefined;
  if(!ham || typeof ham!=='object') return;
  const p=yeni(sayi(ham.servis,999999));
  p.aktif=ham.aktif===true;
  if(ham.istek && soslar.includes(ham.istek))p.istek=ham.istek;
  p.renk=ham.renk && renkler.includes(ham.renk)?ham.renk:null;
  p.kesim=p.renk?sayi(ham.kesim,2):0;
  p.sekil=p.kesim===2?sayi(ham.sekil,3):0;
  p.tencere=p.sekil===3?sayi(ham.tencere,3):0;
  p.tuzlandi=p.sekil===3 && (ham.tuzlandi===true || p.tencere>0);
  if(p.tencere===3){
    p.isiMs=typeof ham.isiMs==='number'?sayi(ham.isiMs,24000):
      (ham.kaynamaSonu??0)>Date.now()?0:6500;
  }
  p.suzulen=p.tencere===3?sayi(ham.suzulen,3):0;
  p.kivamlar=Array.from({length:p.suzulen},(_,i)=>{
    const k=ham.kivamlar?.[i]; return k==='sert'||k==='yumusan'?k:'tam';
  });
  p.sos=p.suzulen===3&&ham.sos && soslar.includes(ham.sos)?ham.sos:null;
  if(ham.istenenSosAdedi===1||ham.istenenSosAdedi===3){
    p.istenenSosAdedi=ham.istenenSosAdedi;p.soslanan=sayi(ham.soslanan,7);p.sosBitti=ham.sosBitti===true;
  }
  if(p.suzulen===3&&(!p.sos||p.sos==='yesil')&&Number.isInteger(ham.pestoMaskesi))p.pestoMaskesi=sayi(ham.pestoMaskesi,7);
  if(p.sos && ham.sus && susler.includes(ham.sus.id) && Number.isFinite(ham.sus.x) && Number.isFinite(ham.sus.y)) {
    p.sus={id:ham.sus.id,x:sinir(ham.sus.x,.23,.77),y:sinir(ham.sus.y,.28,.72)};
  }
  p.sunuldu=!!p.sus&&ham.sunuldu===true;
  return p;
}

export const makarnaDevamEdiyor=(masa = '')=>oku(masa)?.aktif===true;
export function makarnaDurumu(masa = '') {const p=oku(masa);return {suruyor:!!p&&!p.sunuldu,servis:p?.servis??0};}
function asama(p:Devam):Asama {
  if(!p.renk) return 'renk';
  if(p.kesim<2) return 'kes';
  if(p.sekil<3) return 'sekil';
  if(!p.tuzlandi) return 'tuz';
  if(p.tencere<3) return 'at';
  if(p.suzulen<3) return 'suz';
  if(!p.sos) return p.pestoMaskesi===undefined?'sos':'havan';
  if(p.istenenSosAdedi&&!p.sosBitti)return 'pay';
  if(!p.sus) return 'sus';
  return p.sunuldu?'son':'servis';
}
function dokun(b:HTMLButtonElement,fn:()=>void) {
  jest(b,{birak:(p,_ilk,tik)=>{if(tik&&icinde(b,p,8))fn();},klavye:fn});
}
const sosVar=(p:Devam,i:number)=>((p.soslanan??7)&(1<<i))!==0;
const gorunenSos=(p:Devam,i:number)=>sosVar(p,i)?p.sos:null;
const fotografaKoy=async(p:Devam) => {
  const yukle=async(id:string)=>{const i=new Image();i.src=adres(id);await i.decode();return i;};
  const iriYaprak=p.sos==='yesil'&&p.pestoMaskesi!==undefined&&p.pestoMaskesi<7?await yukle('feslegen'):null;
  const sonDokunus=garnitur[p.sus!.id];
  const [tabak,lokmalar,sus]=await Promise.all([yukle('tabak'),Promise.all(p.kivamlar.map((k,i)=>yukle(lokmaAdi(p.renk,gorunenSos(p,i),k)))),yukle(sonDokunus.resim)]);
  const c=document.createElement('canvas');c.width=440;c.height=275;
  const ctx=c.getContext('2d')!;
  ctx.drawImage(tabak,0,0,c.width,c.height);
  const genislik=c.width*.28;
  for(const [i,parca] of porsiyon.entries()) {
    const makarna=lokmalar[i],yukseklik=genislik*makarna.height/makarna.width;
    ctx.save();ctx.translate(c.width*parca.x,c.height*parca.y);ctx.rotate(parca.aci*Math.PI/180);
    ctx.drawImage(makarna,-genislik/2,-yukseklik/2,genislik,yukseklik);ctx.restore();
  }
  if(iriYaprak)porsiyon.forEach((n,i)=>{
    if(sosVar(p,i)&&(p.pestoMaskesi!&(1<<i))===0){const w=c.width*.12,h=w*iriYaprak.height/iriYaprak.width;ctx.drawImage(iriYaprak,n.x*c.width-w/2,n.y*c.height-h/2,w,h);}
  });
  const w=c.width*sonDokunus.oran,h=w*sus.height/sus.width;
  ctx.drawImage(sus,p.sus!.x*c.width-w/2,p.sus!.y*c.height-h/2,w,h);
  return c.toDataURL('image/webp',.93);
};
export function makarnaAc(kok:HTMLElement,ayar:AtolyeAyar) {
  if(kok.querySelector('.mp-oyun')) return;
  const masaId = ayar.masa ?? '';
  const yaz = (durum: Devam) => kayit.yaz(masaId, durum);
  const eski=oku(masaId), p=eski&&(!eski.sunuldu||eski.aktif)?eski:yeni(eski?.servis ?? ayar.oncekiServis);
  // Sipariş fişindeki sos ilk tabaktan itibaren bellidir; şef herhangi bir sosla sunabilir.
  const siraNo=Math.max(0,p.servis-(p.sunuldu?1:0));
  const istek=ayar.tekrarMakarnaSosu??p.istek??(['yesil','kirmizi','sari'] as const)[siraNo%3];
  p.istek=istek;
  if(!p.sos&&!p.istenenSosAdedi&&(masaId==='fiyonk-tavuk'||masaId==='fiyonk-sis')){
    p.istenenSosAdedi=masaId==='fiyonk-tavuk'?1:3;p.soslanan=0;
  }
  const miktarCumlesi=(tadim=false)=>p.istenenSosAdedi===1
    ?sosReplik[tadim?'makarna-tek-sos-tadim':'makarna-tek-sos']
    :sosReplik[tadim?'makarna-hepsi-sos-tadim':'makarna-hepsi-sos'];
  const miktarDogru=()=>!p.istenenSosAdedi||porsiyon.filter((_,i)=>sosVar(p,i)).length===p.istenenSosAdedi;
  const istekPuani=():2|3=>istek===p.sos&&miktarDogru()?3:2;
  const pisirmePuani=():1|2|3=>{
    const dogru=p.kivamlar.filter(k=>k==='tam').length;
    return dogru===3?3:dogru===0?1:2;
  };
  const sosPuani=():2|3=>p.sos==='yesil'&&p.pestoMaskesi!==undefined&&p.pestoMaskesi<7?2:3;
  const puan=()=>Math.min(istekPuani(),pisirmePuani(),sosPuani()) as 1|2|3;
  const geriBildirim=()=>{
    if(istek===p.sos&&!miktarDogru())return miktarCumlesi(true);
    if(istekPuani()===2)return 'Müşteri makarnasında başka bir sos istemişti.';
    if(sosPuani()===2)return 'Sosta iri yapraklar kalmış. Havanda kalan yaprakları da ezebilirsin.';
    const tumu=p.kivamlar.every(k=>k===p.kivamlar[0]);
    if(!tumu)return 'Her fiyongu farklı zamanda süzdün.';
    return {sert:'Fiyonkların biraz sert kalmış.',tam:'Fiyonkların tam kıvamında!',yumusan:'Fiyonkların fazla yumuşamış.'}[p.kivamlar[0]];
  };
  p.aktif=true;yaz(p);
  const diger=Array.from(kok.children).filter((n):n is HTMLElement=>n instanceof HTMLElement)
    .map(el=>({el,gizli:el.hidden,inert:el.inert}));
  diger.forEach(({el})=>{el.hidden=true;el.inert=true;});
  const ekran=h('section.mp-oyun',{'aria-label':'Fiyonk Makarna'}), arka=h('img.mp-fon',{alt:''});
  // Parmağın hareketi sürerken kare indirilmesini beklememek için bir sonraki pozu hazır tut.
  const hazirKareler=new Map<string,HTMLImageElement>();
  function oncedenAc(...adlar:string[]){
    for(const ad of adlar){
      if(hazirKareler.has(ad))continue;
      const kare=new Image();kare.src=adres(ad);hazirKareler.set(ad,kare);
      void kare.decode().catch(()=>hazirKareler.delete(ad));
    }
  }
  const alan=h('div.mp-alan'),ust=h('header.ust.mp-ust'),duyuru=h('span.yalniz-okuyucu',{'aria-live':'polite'});
  ekran.append(arka,alan,ust,duyuru);kok.append(ekran);
  let kapandi=false,mesgul=false,zamanlayici:number|undefined,sonAsama:Asama|undefined,seciliSus:Sus|undefined;
  let arkada=false,sayfaGizli=false,sonAn:number|undefined,isiSaati:number|undefined;
  let sonKayit=0,suGuncelle:(()=>void)|undefined;
  const isinir=()=>!arkada&&!sayfaGizli&&!document.hidden;
  function sureAl(){
    if(sonAn===undefined)return;
    const simdi=performance.now();
    p.isiMs=Math.min(24000,p.isiMs+Math.max(0,simdi-sonAn));sonAn=simdi;
  }
  function saatDurdur(){
    sureAl();clearInterval(isiSaati);isiSaati=undefined;sonAn=undefined;suGuncelle=undefined;
  }
  function gorunurluk(){
    if(!suGuncelle)return;
    if(!isinir()){sureAl();sonAn=undefined;yaz(p);}
    else if(sonAn===undefined)sonAn=performance.now();
  }
  const arkaBirak=arkaPlanDinle(v=>{arkada=v;gorunurluk();});
  const sayfaKapat=()=>{sayfaGizli=true;gorunurluk();};
  const sayfaAc=()=>{sayfaGizli=false;gorunurluk();};
  window.addEventListener('pagehide',sayfaKapat);window.addEventListener('pageshow',sayfaAc);
  document.addEventListener('visibilitychange',gorunurluk);
  function parmakYolu():Nokta[]{
    const nokta=(secici:string,x=.5,y=.5)=>{
      const r=alan.querySelector(secici)?.getBoundingClientRect();
      return r?{x:r.left+x*r.width,y:r.top+y*r.height}:undefined;
    };
    const a=asama(p);
    const yollar:Partial<Record<Asama,()=>Array<Nokta|undefined>>>={
      kes:()=>[nokta('.mp-dikiz',.5,.03),nokta('.mp-dikiz',.5,.97)],
      sekil:()=>[nokta('.mp-buzgu',.5,.13),nokta('.mp-buzgu',.5,.49)],
      tuz:()=>[nokta('.mp-tuzluk'),nokta('.mp-tencere',.52,.22)],
      at:()=>[nokta('.mp-at'),nokta('.mp-tencere',.52,.22)],
      suz:()=>[nokta('.mp-kepce',.26,.75),nokta('.mp-suzgec',.48,.38)],
      sos:()=>[nokta(istek?'[data-mp-sos="'+istek+'"]':'[data-mp-sos]'),nokta('.mp-servis-tabagi')],
      havan:()=>[...Array.from(alan.querySelectorAll('.mp-havan-yaprak[data-ezildi=false]')).map(el=>merkez(el)),nokta('.mp-havan-aktar')],
      sus:()=>seciliSus?[nokta('.mp-servis-tabagi')]:[nokta('[data-mp-sus]'),nokta('.mp-servis-tabagi')],
    };
    return (yollar[a]?.()??[]).filter((p):p is Nokta=>p!==undefined);
  }
  const rehber=hareketRehberi(alan,parmakYolu,()=>!mesgul&&!kapandi);
  const ses=(fn:()=>void)=>{if(ayar.sesli()&&isinir())fn();};
  const konus=(metin:string)=>{duyuru.textContent=metin;if(ayar.sesli()&&isinir()){
    if(p.istenenSosAdedi&&(metin===miktarCumlesi()||metin===miktarCumlesi(true)))void misafirCumlesi(p.istenenSosAdedi===1?'salata':'pizza',metin);
    else ayar.soyle(metin);
  }};
  function kapat() {
    if(kapandi)return;
    saatDurdur();arkaBirak();document.removeEventListener('visibilitychange',gorunurluk);
    window.removeEventListener('pagehide',sayfaKapat);window.removeEventListener('pageshow',sayfaAc);
    kapandi=true;clearTimeout(zamanlayici);rehber.kapat();hazirKareler.clear();sus();p.aktif=false;yaz(p);
    geriKaldir();document.removeEventListener('keydown',klavye);ekran.remove();
    diger.forEach(({el,gizli,inert})=>{el.hidden=gizli;el.inert=inert;});
    ayar.cikis();
  }
  const geriKaldir=geriDinle(()=>{if(kapandi)return false;kapat();return true;});
  const klavye=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.repeat){e.preventDefault();kapat();}};
  document.addEventListener('keydown',klavye);
  function degisti(){yaz(p);ciz();}
  function tik(res:string,ad:string,fn:()=>void,sinif='mp-kart') {
    const b=dugme(ad,sinif,cizim(res));dokun(b,fn);return b;
  }
  const kap=(ad:string,sinif:string)=>h('div',{class:sinif},cizim(ad));
  function sira(adlar: readonly string[], ekle:(ad:string,i:number)=>HTMLElement,sinif='') {
    const r=h('div.mp-secimler',{class:'mp-secimler '+sinif});
    adlar.forEach((ad,i)=>r.append(ekle(ad,i)));return r;
  }
  function baslik(a:Asama) {
    const geri=dugme('Geri','dugme',ikon('geri'));dokun(geri,kapat);
    const sesli=dugme(ayar.sesli()?'Sesi kapat':'Sesi aç','dugme ses-dugmesi',ikon(ayar.sesli()?'hoparlor':'sessiz'));
    dokun(sesli,()=>{ayar.sesDegistir();baslik(a);});
    const gorev=a==='pay'?miktarCumlesi():a==='sos'&&istek?sosIstegi[istek]:yardim[a];
    const fis=dugme('Sıradaki hareketi dinle','mp-fis',cizim(istek&&p.renk?p.renk+'-'+istek+'-tabak':'makarna'));
    const is=a==='tuz'?'tuzluk':['renk','kes','sekil'].includes(a)?'mandal':['at','suz'].includes(a)?'kepce':'tabak';
    fis.append(ikon('ileri'),is==='tuzluk'?resim(is):cizim(a==='havan'?'tokmak':a==='sos'&&istek?sosKabi[istek]:is));dokun(fis,()=>konus(gorev));
    if(a==='pay'){
      fis.replaceChildren();
      for(let i=0;i<3;i++)fis.append(cizim(lokmaAdi('altin',i<(p.istenenSosAdedi??0)?istek:null,'tam')));
    }
    ust.replaceChildren(geri,fis,sesli);
  }
  function renkSec(){
    alan.append(sira(renkler,(r)=>tik(r+'-yaprak',renkAdi[r as Renk]+' hamur seç',()=>{
      p.renk=r as Renk;ses(efekt.secim);degisti();
    }),'mp-hamurlar'));
  }
  function hamurKes(){
    const kare=dugme('Hamuru çizgiden kes','mp-hamur-kes');
    const yaprak=cizim(p.renk+'-yaprak','mp-yaprak');
    const x=p.kesim===0?.34:.67;
    const hedef=h('i.mp-dikiz');hedef.style.left=x*100+'%';
    const teker=cizim('mandal','mp-teker');teker.style.left=x*100+'%';
    if(p.kesim){
      const sol=cizim(p.renk+'-yaprak','mp-yaprak mp-kes-sol');
      yaprak.classList.add('mp-kes-sag');kare.append(sol);
    }
    kare.append(yaprak);
    kare.append(hedef,teker);kare.dataset.mpKes=String(p.kesim);
    let bas:number|undefined,yon=1;
    function aktar(){
      if(mesgul||!kare.isConnected)return;
      mesgul=true;ses(efekt.yapis);p.kesim++;yaz(p);
      zamanlayici=window.setTimeout(()=>{mesgul=false;ciz();},zaman(220));
    }
    function izle(n:Nokta){
      if(mesgul)return;
      const r=hedef.getBoundingClientRect(),y=(n.y-r.top)/r.height;
      if(Math.abs(n.x-(r.left+r.width/2))>Math.max(13,kare.clientWidth*.085)){bas=undefined;return;}
      if(bas===undefined){if(y>.25 && y<.75)return;bas=sinir(y,0,1);yon=y>.5?-1:1;}
      teker.style.top=sinir(y,0,1)*67+13+'%';
      if((y-bas)*yon>.64)aktar();
    }
    jest(kare,{basla:izle,tasi:izle,birak:(yer)=>{izle(yer);bas=undefined;teker.style.top='';},iptal:()=>{bas=undefined;teker.style.top='';},klavye:aktar});
    alan.append(kare);
  }
  function sekilVer(){
    const b=dugme('Hamurun kenarını ortasına it','mp-buzgu');
    const poz=cizim(p.renk+'-yaprak','mp-sekil');b.append(poz);
    const iz=h('i.mp-buzgu-iz',{},ikon('ileri')); // Yön CSS ile tezgâha göre dönük.
    b.append(iz);alan.append(b);
    const tepsi=kap('tabak','mp-birikim');
    for(let i=0;i<p.sekil;i++)tepsi.append(cizim(p.renk+'-fiyonk','mp-tepsi-parca'));
    alan.append(tepsi);
    let bas:Nokta|undefined,iscilik=0;
    const goster=(i:number)=>{if(iscilik!==i){iscilik=i;poz.src=adres(p.renk+'-'+['yaprak','buzgu','kivrim','fiyonk'][i]);}};
    const bitir=async()=>{
      if(mesgul||!b.isConnected)return;
      mesgul=true;goster(3);ses(efekt.yapis);p.sekil++;yaz(p);
      const r=b.getBoundingClientRect(),t=tepsi.getBoundingClientRect();
      await hareket(poz,[{transform:'scale(1)'},{transform:`translate(${t.left+t.width/2-r.left-r.width/2}px,${t.top+t.height/2-r.top-r.height/2}px) scale(.28)`}],340);
      if(b.isConnected){mesgul=false;ciz();}
    };
    function tasi(yer:Nokta){
      if(!bas||mesgul)return;
      const r=b.getBoundingClientRect();
      const yon=bas.y<r.y+r.height/2?1:-1;
      const d=(yer.y-bas.y)*yon/r.height;
      if(Math.abs(yer.x-bas.x)>r.width*.28){goster(0);bas=undefined;return;}
      if(d>=.26){void bitir();return;}
      goster(d>.16?2:d>.055?1:0);
    }
    jest(b,{basla:yer=>{const r=b.getBoundingClientRect();if(Math.abs(yer.x-r.x-r.width/2)<r.width*.37)bas=yer;},
      tasi,birak:yer=>{tasi(yer);bas=undefined;if(!mesgul)goster(0);},iptal:()=>{bas=undefined;if(!mesgul)goster(0);},klavye:()=>void bitir()});
  }
  const fiyonk=(pismis=false)=>cizim(p.renk+(pismis?'-pismis':'-fiyonk'),'mp-makarna');
  function tuzEkle(pot:HTMLElement){
    const tuzluk=dugme('Tencerenin suyuna tuz ekle','mp-tuzluk',resim('tuzluk'));
    alan.append(tuzluk);
    let dx=0,dy=0;
    const tasi=(yer:Nokta,ilk:Nokta)=>{
      if(mesgul)return;
      dx=yer.x-ilk.x;dy=yer.y-ilk.y;
      tuzluk.style.transform=`translate(${dx}px,${dy}px)`;
    };
    const birak=async()=>{
      if(mesgul||!tuzluk.isConnected)return;
      mesgul=true;
      const t=tuzluk.getBoundingClientRect(),k=pot.getBoundingClientRect();
      const x=k.left+k.width*.58-t.left-t.width*.5+dx,y=k.top+k.height*.12-t.top-t.height*.69+dy;
      await hareket(tuzluk,[{transform:`translate(${dx}px,${dy}px)`},{transform:`translate(${x}px,${y}px) rotate(-65deg)`}],210);
      if(!tuzluk.isConnected)return;
      tuzluk.style.transform=`translate(${x}px,${y}px) rotate(-65deg)`;
      pot.append(h('span.mp-tuz-taneleri',{},h('i'),h('i'),h('i'),h('i')));
      ses(efekt.yapis);
      await hareket(tuzluk,[-65,-78,-62,-72,-65].map(deg=>({transform:`translate(${x}px,${y}px) rotate(${deg}deg)`})),360);
      if(!tuzluk.isConnected)return;
      p.tuzlandi=true;mesgul=false;degisti();
    };
    const sifirla=()=>{if(mesgul)return;dx=dy=0;tuzluk.style.transform='';};
    jest(tuzluk,{tasi,birak:(yer,_ilk,tik)=>{if(tik||icinde(pot,yer,16))void birak();else sifirla();},iptal:sifirla,klavye:()=>void birak()});
  }
  function ocakta(a:Asama){
    const pot=kap('tencere','mp-tencere');
    const su=h('div.mp-su');
    const suda=p.tencere-p.suzulen-(a==='suz'?1:0);
    for(let i=0;i<suda;i++)su.append(fiyonk(a==='suz'));
    pot.append(su);alan.append(pot);
    if(a==='tuz')tuzEkle(pot);
    else if(a==='at'){
      const tepsi=kap('tabak','mp-yan-tabak');
      for(let i=p.tencere;i<3;i++){
        const b=dugme('Fiyongu suya bırak','mp-at',fiyonk());b.dataset.mpAt=String(i);
        malzemeTasi(b,pot,()=>{
          if(!b.isConnected)return;
          p.tencere++;
          ses(plopSesi);degisti();
        },()=>{});
        tepsi.append(b);
      }
      alan.append(tepsi);
    }else{
      pot.append(h('span.mp-kabarcik',{},h('i'),h('i'),h('i')));
      const suzgec=kap('suzgec','mp-suzgec');
      const dolu=h('div.mp-suzgec-ici');
      for(const k of p.kivamlar)dolu.append(cizim(lokmaAdi(p.renk,null,k),'mp-makarna'));
      suzgec.append(dolu);alan.append(suzgec);
      const kepce=dugme('Kepçeyle süzgece taşı','mp-kepce',cizim('kepce'),fiyonk(true));
      // Kepçe ve içindeki fiyonk birlikte elde taşınır.
      let dx=0,dy=0,onceki:Kivam|undefined;
      const numune=h('div.mp-kivam-fi');
      for(const k of ['sert','tam','yumusan'] as const){
        const ornek=cizim(lokmaAdi(p.renk,null,k));ornek.dataset.mpNumune=k;numune.append(ornek);
      }
      const ideal=h('span.mp-hedef-kivam',{'aria-hidden':'true'},ikon('onay'));
      numune.append(ideal);alan.append(numune);
      function sicaklik(){
        const k=kivam(p.isiMs);
        pot.dataset.su=p.isiMs<1700?'durgun':k;
        pot.classList.toggle('mp-kayniyor',p.isiMs>=1700);
        if(onceki===k)return;
        ekran.dataset.kivam=k;
        const canli=[...su.querySelectorAll('img')];
        if(!mesgul)canli.push(kepce.querySelector<HTMLImageElement>('img.mp-makarna')!);
        for(const el of canli)el.src=adres(lokmaAdi(p.renk,null,k));
        if(onceki==='sert'&&k==='tam')ses(efekt.tink);
        onceki=k;
      }
      sicaklik();suGuncelle=sicaklik;gorunurluk();sonKayit=p.isiMs;
      isiSaati=window.setInterval(()=>{
        if(!isinir())return;
        sureAl();sicaklik();
        if(p.isiMs-sonKayit>=650){yaz(p);sonKayit=p.isiMs;}
      },100);
      const koy=async()=>{
        if(mesgul||!kepce.isConnected)return;
        if(!isinir())return;
        sureAl();sicaklik();const alinan=kivam(p.isiMs);
        p.kivamlar.push(alinan);p.suzulen++;yaz(p);
        if(p.suzulen===3)saatDurdur();
        mesgul=true;kepce.disabled=true;const k=kepce.getBoundingClientRect(),d=suzgec.getBoundingClientRect();
        await hareket(kepce,[{transform:`translate(${dx}px,${dy}px)`},
          {transform:`translate(${dx+d.x+d.width*.5-k.x-k.width*.26}px,${dy+d.y+d.height*.45-k.y-k.height*.76}px) rotate(-12deg)`}],190);
        if(!kepce.isConnected)return;
        ses(plopSesi);
        const ek=cizim(lokmaAdi(p.renk,null,alinan),'mp-makarna');dolu.append(ek);
        const damla=h('span.mp-damla',{},h('i'),h('i'),h('i'));suzgec.append(damla);
        zamanlayici=window.setTimeout(()=>{mesgul=false;ciz();},zaman(340));
      };
      const sifirla=()=>{dx=dy=0;kepce.style.transform='';};
      jest(kepce,{tasi:(n,ilk)=>{if(!mesgul){dx=n.x-ilk.x;dy=n.y-ilk.y;kepce.style.transform=`translate(${dx}px,${dy}px)`;}},
        birak:(n,_ilk,tik)=>{if(!mesgul&&(tik||icinde(suzgec,n,15)))void koy();else if(!mesgul)sifirla();},iptal:sifirla,klavye:()=>void koy()});
      alan.append(kepce);
    }
  }
  function servisTabagi(){
    const tabak=h('div.mp-servis-tabagi');
    tabak.append(cizim('tabak','mp-tabak-foto'));
    for(const [i,parca] of porsiyon.entries()){
      const goruntu=cizim(lokmaAdi(p.renk,gorunenSos(p,i),p.kivamlar[i]),'mp-tabak-lokmasi');
      goruntu.dataset.kivam=p.kivamlar[i];
      goruntu.style.left=parca.x*100+'%';goruntu.style.top=parca.y*100+'%';
      goruntu.style.transform=`translate(-50%,-50%) rotate(${parca.aci}deg)`;
      tabak.append(goruntu);
    }
    if(p.sos==='yesil'&&p.pestoMaskesi!==undefined)porsiyon.forEach((n,i)=>{
      if(sosVar(p,i)&&!(p.pestoMaskesi!&(1<<i))){const yaprak=cizim('feslegen','mp-tabak-iri-yaprak');yaprak.style.left=n.x*100+'%';yaprak.style.top=n.y*100+'%';tabak.append(yaprak);}
    });
    if(p.sus){
      const sonDokunus=garnitur[p.sus.id];
      const sus=cizim(sonDokunus.resim,'mp-son-sus');
      sus.style.width=sonDokunus.oran*100+'%';
      sus.style.left=p.sus.x*100+'%';sus.style.top=p.sus.y*100+'%';tabak.append(sus);
    }
    return tabak;
  }
  function masa(a:Asama){
    if(a==='havan'){
      alan.append(havanAc(p.pestoMaskesi??0,cizim,mask=>{p.pestoMaskesi=mask;yaz(p);},()=>ses(efekt.pof),()=>{
        p.sos='yesil';ses(plopSesi);degisti();
      }));
      return;
    }
    const tabak=servisTabagi();
    alan.append(tabak);
    if(a==='pay'){
      const bitir=dugme('Soslamayı bitir','mp-sos-bitti',ikon('onay'));
      dokun(bitir,()=>{p.sosBitti=true;degisti();});alan.append(bitir);
      const kepce=dugme('Sos kâsesi','mp-sos-kepce',cizim(sosKabi[p.sos!]));
      const sosTuru=p.sos!;
      const kasigiDoldur=()=>{
        const sos=cizim(({kirmizi:'domates-dokum',yesil:'pesto-dokum',sari:'yag-dokum'})[sosTuru],'mp-kasik-sosu');
        return h('span.mp-porsiyon-kasigi',{'aria-hidden':true,'data-sos':sosTuru},resim('kasik'),sos);
      };
      kepce.append(kasigiDoldur());
      alan.append(kepce);
      function dok(i:number){
        if(!tabak.isConnected||sosVar(p,i))return;
        p.soslanan=(p.soslanan??0)|(1<<i);yaz(p);ses(plopSesi);
        const lokma=tabak.querySelectorAll<HTMLImageElement>('.mp-tabak-lokmasi')[i];
        lokma.src=adres(lokmaAdi(p.renk,p.sos,p.kivamlar[i]));
        if(p.sos==='yesil'&&p.pestoMaskesi!==undefined&&!(p.pestoMaskesi&(1<<i))){
          const yaprak=cizim('feslegen','mp-tabak-iri-yaprak');
          yaprak.style.left=lokma.style.left;yaprak.style.top=lokma.style.top;tabak.append(yaprak);
        }
        tabak.querySelector<HTMLElement>('[data-sos-yeri="'+i+'"]')?.setAttribute('aria-pressed','true');
        const akis=cizim(({kirmizi:'domates-dokum',yesil:'pesto-dokum',sari:'yag-dokum'})[p.sos!],'mp-sos-dokum');
        akis.style.left=lokma.style.left;akis.style.top=lokma.style.top;tabak.append(akis);
        akis.addEventListener('animationend',()=>akis.remove(),{once:true});
      }
      const hedefler=porsiyon.map(({x,y},i)=>{
        const b=dugme((i+1)+'. fiyonga sos dök','mp-sos-yeri');b.dataset.sosYeri=String(i);
        b.style.left=x*100+'%';b.style.top=y*100+'%';b.setAttribute('aria-pressed',String(sosVar(p,i)));
        dokun(b,()=>dok(i));tabak.append(b);return b;
      });
      let elde:HTMLElement|undefined,yakin=-1;
      const geri=()=>{
        elde?.remove();elde=undefined;delete kepce.dataset.elde;
        if(yakin>=0)delete hedefler[yakin].dataset.yakin;yakin=-1;
      };
      jest(kepce,{tasi:(n,ilk)=>{
          if(!elde&&Math.hypot(n.x-ilk.x,n.y-ilk.y)<5)return;
          if(!elde){elde=kasigiDoldur();elde.classList.add('mp-kasik-elde');alan.append(elde);kepce.dataset.elde='true';}
          const r=alan.getBoundingClientRect();elde.style.left=(n.x-r.left)+'px';elde.style.top=(n.y-r.top)+'px';
          if(yakin>=0)delete hedefler[yakin].dataset.yakin;
          yakin=hedefler.findIndex((b,i)=>!sosVar(p,i)&&icinde(b,n));
          if(yakin>=0)hedefler[yakin].dataset.yakin='true';
        },
        birak:(n,_ilk,tik)=>{geri();if(!tik){const i=hedefler.findIndex(b=>icinde(b,n));if(i>=0)dok(i);}},iptal:geri,
        klavye:()=>hedefler.find((_,i)=>!sosVar(p,i))?.focus()});
    }else if(a==='sos'){
      const raf=sira(soslar,key=>{
        const sos=key as Sos;
        const b=dugme(sosAdi[sos]+' dök','mp-kart',cizim(sosKabi[sos]));b.dataset.mpSos=sos;
        const sosuSec=()=>{
          if(mesgul||!b.isConnected)return;
          if(sos==='yesil'){p.pestoMaskesi=0;degisti();return;}
          mesgul=true;
          p.sos=sos;yaz(p);ses(plopSesi);
          if(p.istenenSosAdedi){mesgul=false;degisti();return;}
          const lokmalar=tabak.querySelectorAll<HTMLImageElement>('.mp-tabak-lokmasi');
          // Sos tabağın boş merkezine düşmez. Her lokma kendi döküm ve kaplı çizimini taşır.
          const dokumId=({kirmizi:'domates-dokum',yesil:'pesto-dokum',sari:'yag-dokum'})[sos];
          lokmalar.forEach((lokma,i)=>{
            const dokum=cizim(dokumId,'mp-sos-dokum');
            dokum.style.left=lokma.style.left;dokum.style.top=lokma.style.top;
            dokum.style.animationDelay=zaman(i*85)+'ms';
            tabak.append(dokum);
            lokma.src=adres(lokmaAdi(p.renk,sos,p.kivamlar[i]));
          });
          zamanlayici=window.setTimeout(()=>{mesgul=false;ciz();},zaman(550));
        };
        const siparisiHatirlat=()=>{
          if(!istek||!b.isConnected)return;
          konus(sosIstegi[istek]);
          const fis=ust.querySelector('.mp-fis');
          if(fis)void hareket(fis,[{scale:'1'},{scale:'1.10'},{scale:'1'}],300);
        };
        if(p.istenenSosAdedi){
          // Here the bowls are a flavour choice. The following step is where the child pours.
          b.setAttribute('aria-label',sosAdi[sos]+' seç');
          jest(b,{birak:(n,_,tik)=>{if(tik||icinde(tabak,n,12))sosuSec();else siparisiHatirlat();},klavye:sosuSec});
        }else malzemeTasi(b,tabak,sosuSec,siparisiHatirlat,true);
        return b;
      },'mp-raf');
      alan.append(raf);
    }else if(a==='sus'){
      function susle(id:Sus,yer?:Nokta){
        if(mesgul||!tabak.isConnected)return;
        const r=tabak.getBoundingClientRect();
        p.sus={id,x:yer?sinir((yer.x-r.left)/r.width,.23,.77):.5,y:yer?sinir((yer.y-r.top)/r.height,.28,.72):.45};
        ses(efekt.yapis);degisti();
      }
      const hedef=dugme('Süsü tabağa yerleştir','mp-sus-hedef');
      jest(hedef,{birak:p=>{if(seciliSus)susle(seciliSus,p);},klavye:()=>{if(seciliSus)susle(seciliSus);}});
      tabak.append(hedef);
      alan.append(sira(susler,key=>{
        const id=key as Sus,b=dugme(susAdi[id]+' seç','mp-kart',cizim(garnitur[id].resim));b.dataset.mpSus=id;
        b.setAttribute('aria-pressed',String(seciliSus===id));
        const sec=()=>{seciliSus=id;alan.querySelectorAll('[data-mp-sus]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));};
        let kopya:HTMLImageElement|undefined;
        const temizle=()=>{kopya?.remove();kopya=undefined;};
        jest(b,{tasi:(n,ilk)=>{if(uzak(n,ilk)<8)return;
          if(!kopya){kopya=cizim(garnitur[id].resim,'mp-elde');alan.append(kopya);}
          const r=alan.getBoundingClientRect();kopya.style.left=(n.x-r.left)+'px';kopya.style.top=(n.y-r.top)+'px';},
          birak:(n,_ilk,tik)=>{temizle();if(tik)sec();else if(icinde(tabak,n,10))susle(id,n);},iptal:temizle,klavye:sec});
        return b;
      },'mp-raf'));
    }else if(a==='servis'){
      const duzelt=dugme('Son süsü değiştir','mp-garnitur-duzelt',ikon('tekrar'));
      duzelt.onclick=()=>{
        if(mesgul||p.sunuldu||!p.sus)return;
        seciliSus=p.sus.id;p.sus=null;degisti();
        alan.querySelector<HTMLButtonElement>('[data-mp-sus="'+seciliSus+'"]')?.focus({preventScroll:true});
      };
      alan.append(duzelt);
      const j=dugme('Servis zilini çal','mp-zil',resim('servis-zili'));j.dataset.mpZil='';
      dokun(j,async()=>{
        if(mesgul||p.sunuldu)return;mesgul=true;
        let foto:string;
        try{foto=await fotografaKoy(p);}catch{mesgul=false;return;}
        if(!j.isConnected)return;
        p.sunuldu=true;p.servis++;yaz(p);ayar.teslim(foto,puan(),istekPuani(),pisirmePuani(),{istenenSos:istek,sos:p.sos!,istenenSosAdedi:p.istenenSosAdedi,soslanan:p.soslanan,pestoMaskesi:p.pestoMaskesi,porsiyon:{renk:p.renk!,kivamlar:[...p.kivamlar],sus:{...p.sus!}}});ses(puan()===3?efekt.dogru:efekt.tink);mesgul=false;kapat();
      });alan.append(j);
    }else{
      const ok=dugme('Siparişlere dön','dugme mp-sonraki',ikon('onay'));dokun(ok,kapat);alan.append(ok,yildizlar(puan()));
    }
  }
  function ciz(){
    if(kapandi)return;
    saatDurdur();clearTimeout(zamanlayici);
    const a=asama(p);
    if(p.renk && a==='kes')oncedenAc(...['buzgu','kivrim','fiyonk','pismis'].map(poz=>p.renk+'-'+poz),'tabak');
    if(a==='sekil')oncedenAc('ocak','tencere','suzgec','kepce');
    if(a==='suz')oncedenAc('masa',...soslar.map(sos=>p.renk+'-'+sos+'-lokma'),...Object.values(sosKabi));
    ekran.dataset.asama=a;
    const bg=['renk','kes','sekil'].includes(a)?'tezgah':['tuz','at','suz'].includes(a)?'ocak':'masa';
    if(arka.dataset.ad!==bg){arka.src=adres(bg);arka.dataset.ad=bg;}
    const odak=alan.contains(document.activeElement) && document.activeElement?.matches(':focus-visible');
    alan.replaceChildren();baslik(a);
    if(a==='renk')renkSec();else if(a==='kes')hamurKes();else if(a==='sekil')sekilVer();
    else if(['tuz','at','suz'].includes(a))ocakta(a);else masa(a);
    if(a!==sonAsama){konus(a==='son'?geriBildirim():a==='pay'?miktarCumlesi():a==='sos'&&istek?sosIstegi[istek]:yardim[a]);sonAsama=a;}
    if(odak)alan.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
    rehber.planla();
  }
  ciz();
}
const uzak=(a:Nokta,b:Nokta)=>Math.hypot(a.x-b.x,a.y-b.y);

