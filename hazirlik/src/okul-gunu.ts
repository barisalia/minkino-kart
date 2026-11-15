import {simge} from './cizim';
// Okul günü: beslenmeden sonra sınıfta elle yapılan işler. Soru kartı yok; her sahnede çocuk gerçek bir eşyayı tutar.
// Sıra: paylaş (meyve dağıt) → ek (tohum büyüt) → müzik (bando) → kolye (diz, hediye et) → resim (pano) → toplan → veda.
import './okul-gunu.css';
import {tamamla} from './kres-kaydi';
import {besteAc,besteIkonu} from './bando-bestesi';
import {bandoCal,calgiSesi,type BandoKaydi} from '../../src/audio/bando';
import type { Sabah } from './model';
import { efekt } from '../../src/audio/efekt';


const kaynak=import.meta.glob<string>(['../../assets/hazirlik/kres/kolye-*.webp','../../assets/hazirlik/etkinlik/*.webp','../../assets/hazirlik/ders/*.webp','../../assets/hazirlik/ders-ekranlari/zil.webp'],{eager:true,query:'?url',import:'default'});
const yol=(n:string)=>kaynak['../../assets/hazirlik/'+n+'.webp'];
const res=(n:string)=>'<img draggable="false" alt="" src="'+yol(n)+'">';
export const okulFonu=yol('ders-ekranlari/zil');
export const okulSahneleri=['ek','muzik','kolye'] as const;
type OkulSahnesi=typeof okulSahneleri[number];
export const okulSozu:Record<OkulSahnesi,string>={ek:'okul_ek',muzik:'kres_bando_kose',kolye:'okul_kolye'};

type Pos=[number,number,number,number];
type Kisi='mino'|'zipzip';
export interface Kit {
  kaydet:()=>void;
  s:Sabah;
  parca:(id:string,art:string,pos:Pos,dik?:Pos,eylem?:unknown,cls?:string)=>HTMLElement;
  eylem:(key:string,ad:string,calis:()=>void,hedef?:string,inis?:string)=>unknown;
  ileri:(eylem:unknown,ikon?:string)=>void;
  gir:(n:Sabah['sahne'])=>void;
  soyle:(id:string,sonra?:()=>void)=>void;
  kino:string;
  bastan:()=>void;
  yenile:()=>void;
}

// Sahne yeniden kurulurken az önce olan şeyin hareketini oynatmak için.
let olay='';

const cizgi='stroke="#181619" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
export const ibrik='<svg viewBox="0 0 180 130" width="100%" height="100%"><g '+cizgi+'>'+
  '<path d="M138 62q34 0 34 22t-34 22" fill="none" stroke-width="12"/><path d="M138 62q34 0 34 22t-34 22" fill="none" stroke="#f4c64f" stroke-width="6"/>'+
  '<path d="M84 50q23-36 46 0" fill="none" stroke-width="11"/><path d="M84 50q23-36 46 0" fill="none" stroke="#f4c64f" stroke-width="5"/>'+
  '<path d="M76 94 28 46l10-10 40 34Z" fill="#5fb6d8"/><ellipse cx="30" cy="38" rx="17" ry="9" transform="rotate(-45 30 38)" fill="#f4c64f"/>'+
  '<path d="M70 50h70l-5 62q-1 10-11 10H86q-10 0-11-10Z" fill="#5fb6d8"/><path d="M70 50h70" stroke-width="5"/><path d="M82 68h26" stroke="#d8f0f8" stroke-width="5"/></g></svg>';
const gunes='<svg viewBox="0 0 140 140" width="100%" height="100%"><g '+cizgi+'>'+
  [0,45,90,135,180,225,270,315].map(a=>'<path d="M70 6 60 28h20Z" fill="#ffb347" transform="rotate('+a+' 70 70)"/>').join('')+
  '<circle cx="70" cy="70" r="34" fill="#ffd24a"/><path d="M58 76q12 11 24 0" fill="none"/><path d="M58 62v4m24-4v4" stroke-width="4"/></g></svg>';


function saksi(k:Kit){ if(k.s.saksiCamda)k.parca('camdaki-saksi',res('etkinlik/tohum-2'),[10,40,8,24],undefined,undefined,'pasif'); }
function masa(k:Kit){ k.parca('masa','<div class="kumas"></div>',[50,88,106,50],undefined,undefined,'masa'); }
function arkadas(k:Kit,kim:Kisi,x:number,mutlu:boolean,eylem?:unknown){
  const hediye=k.s.kolyeKimde??k.s.kres.hediye;
  const boncuk=k.s.kolyeKimde?k.s.kolye:k.s.kres.kolyeHatira;
  const boyun=hediye===kim?'<span class="boyun-kolyesi">'+boncuk.map(i=>res('etkinlik/deniz-'+i)).join('')+'</span>':'';
  return k.parca(kim,'<span class="okul-arkadas">'+res('etkinlik/'+kim+'-'+(mutlu?1:0))+boyun+'</span>',[x,43,25,58],undefined,eylem,'okul-kisi'+(olay==='sevin-'+kim?' sevindi':''));
}

const buyume=['tohum-0','tohum-1','tohum-3','tohum-2'];
function ek(k:Kit){
  const {s}=k,acti=s.ekim>=3;
  k.parca('pencere','',[10,34,17,40],undefined,undefined,'pasif');
  if(s.saksiCamda){
    saksi(k);
    k.parca('kino',k.kino,[50,64,22,66],undefined,undefined,'karakter');
    k.ileri(k.eylem('muzige','Müzik köşesine geç',()=>k.gir('muzik')),'ileri');
    return;
  }
  k.parca('kino',k.kino,[82,64,22,66],undefined,undefined,'karakter');
  const tasi=acti?k.eylem('cama-koy','Ayçiçeğini pencerenin önüne koy',()=>{s.saksiCamda=true;efekt.yapis();k.soyle('zip_tohum')},'pencere'):undefined;
  k.parca('saksi',res('etkinlik/'+buyume[s.ekim]),[48,62,24,62],undefined,tasi,(olay==='buyudu'?'buyudu':'')+(acti?' ipucu':''));
  const sula=s.ekim===0||s.ekim===2,isit=s.ekim===1;
  const buyut=(ses:()=>void)=>()=>{s.ekim++;olay='buyudu';ses();if(s.ekim===3)k.soyle('okul_ek_cam')};
  k.parca('ibrik',ibrik,[19,72,17,30],undefined,sula?k.eylem('sula','Saksıyı sula',buyut(()=>efekt.sicrama()),'saksi'):undefined,sula?'ipucu arac':'arac bekle');
  k.parca('gunes',gunes,[30,22,13,27],undefined,isit?k.eylem('gunes-ver','Güneşi saksıya getir',buyut(()=>efekt.yildiz(2)),'saksi'):undefined,isit?'ipucu arac':'arac bekle');
}

const calgiAdlari=['Davul','Marakas','Tef','Çan','Ksilofon','Flüt'];
// Ritim oyunu: Mino çalar, çocuk aynısını çalar. Her turda ritim bir vuruş uzar; üç turdan sonra serbest bando açılır.
export const ritimler:readonly (readonly number[])[]=[[0,1],[0,3,1],[2,0,3,1]];
let adim=0,dinlenen=-1,nobet=0;
let topluluk:BandoKaydi|undefined,orkestraSaati=0;
export function bandoyuSustur(){clearTimeout(orkestraSaati);topluluk?.durdur();topluluk=undefined}
function muzik(k:Kit){
  const {s}=k,tur=s.calinan,serbest=tur>=ritimler.length,desen=ritimler[tur],dinletiyor=!serbest&&dinlenen!==tur;
  const benim=++nobet;
  saksi(k);
  arkadas(k,'mino',20,dinletiyor||(serbest&&s.vurus%2===1));arkadas(k,'zipzip',80,serbest&&s.vurus%2===0);
  k.parca('kino',k.kino,[50,46,20,62],undefined,undefined,'karakter'+(s.vurus&&!dinletiyor?' dans d'+s.vurus%2:''));
  if(!serbest)k.parca('ritim-sirasi','<span class="okul-ritim">'+desen.map((c,n)=>'<i class="'+(n<adim&&!dinletiyor?'tamam':'')+'">'+(n<adim&&!dinletiyor?res('etkinlik/muzik-'+c):'')+'</i>').join('')+'</span>',[50,13,10+desen.length*7,17],undefined,undefined,'pasif'+(olay==='yeniden'?' sallan':''));
  masa(k);
  const nota=k.parca('beste-defteri','',[82,18,10,16],[80,24,16,12]);
  nota.removeAttribute('aria-hidden');
  const ac=document.createElement('button');ac.type='button';ac.className='beste-defteri';ac.setAttribute('aria-label','Kendi bandonu kur');ac.innerHTML=besteIkonu;nota.append(ac);
  ac.onclick=()=>{
    if(nota.parentElement?.querySelector('.beste-masa'))return;
    nobet++;bandoyuSustur();const sahne=nota.parentElement!;
    for(const e of sahne.children)(e as HTMLElement).inert=true;
    besteAc(sahne,s.kres.beste,k.kaydet,()=>{
      if(s.kres.beste.vuruslar.some(i=>i>=0))tamamla(s.kres,'beste');
      k.kaydet();k.yenile();
    },k.soyle);
  };
  const calgilar=serbest?[0,1,2,3,4,5]:[0,1,2,3],aralik=serbest?13:18,bas=serbest?17.5:23;
  calgilar.forEach((i,n)=>k.parca('calgi-'+i,res('etkinlik/muzik-'+i),[bas+n*aralik,serbest?73:82,serbest?11:14,serbest?24:28],
    serbest?[22+(n%3)*28,n<3?62:80,20,14]:undefined,dinletiyor?undefined:
    k.eylem('cal-'+i,calgiAdlari[i]+' çal',()=>{
      if(serbest){
        const bpm=104,b=60/bpm;
        if(!topluluk||topluluk.gecen()>=topluluk.sure){
          bandoyuSustur();
          const beste=s.kres.beste.vuruslar.length?s.kres.beste.vuruslar:[0,1,4,2,0,1,5,3];
          topluluk=bandoCal(Array.from({length:16},(_,j)=>beste[j%beste.length]),bpm,true);
          orkestraSaati=window.setTimeout(bandoyuSustur,16*b*1000+160);
        }
        const an=Math.max(0,Math.floor(topluluk.gecen()/b)),ton=[72,76,79,76,77,76,74,72,74,77,79,83,79,76,74,72][an%16];
        calgiSesi(i,ton);
      }else efekt.sinifCalgisi(i);
      s.vurus++;s.sonCalgi=i;
      if(serbest)return;
      if(i!==desen[adim]){adim=0;dinlenen=-1;olay='yeniden';return}
      if(++adim<desen.length)return;
      adim=0;s.calinan++;efekt.dogru();olay='sevin-mino';
      if(s.calinan>=ritimler.length){tamamla(s.kres,'muzik');efekt.konfeti(true);k.soyle('okul_muzik_serbest')}
    }),s.sonCalgi===i&&!dinletiyor?'caldi':dinletiyor?'pasif':''));
  if(dinletiyor){
    // Mino sırayla çalar; bitince çalgılar çocuğa açılır.
    adim=0;
    desen.forEach((c,n)=>window.setTimeout(()=>{
      if(benim!==nobet||k.s.sahne!=='muzik'||document.hidden)return;
      efekt.sinifCalgisi(c);
      document.querySelector('[data-id="calgi-'+c+'"] img')?.animate([{scale:'1'},{scale:'1.3 1.12',rotate:'-8deg'},{scale:'1',rotate:'0deg'}],{duration:380,easing:'ease-out'});
    },700+n*650));
    window.setTimeout(()=>{if(benim!==nobet||k.s.sahne!=='muzik'||document.hidden)return;dinlenen=tur;k.yenile()},700+desen.length*650+250);
  }else if(!serbest){
    k.parca('yine-dinle','<span class="disk okul-dinle">'+res('etkinlik/sergi-dinle')+'</span>',[8,84,10,17],undefined,k.eylem('yine-dinle','Ritmi yeniden dinle',()=>{dinlenen=-1;adim=0}),'round');
  }
  if(serbest)k.ileri(k.eylem('oyun-odasina','Oyun odasına dön',()=>{tamamla(s.kres,'muzik');k.gir('oyun-odasi')}),'ileri');
}

const boncukYeri=[[9,36],[25,62],[42,74],[58,74],[75,62],[91,36]];
function kolye(k:Kit){
  const {s}=k,doldu=s.kolye.length>=6,verildi=!!s.kolyeKimde;
  const ayna=s.kres.kolyeAyna;
  if(!verildi&&s.kolye.length<4)k.parca('ayna',res(ayna?'kres/kolye-iplik':'kres/kolye-ayna'),[74,18,12,15],[80,23,15,12],k.eylem('ayna',ayna?'Serbestçe diz':'Aynalı kolye diz',()=>{
    s.kres.kolyeAyna=!ayna;k.soyle(ayna?'okul_kolye':'kres_kolye_ayna');
  }));
  if(s.kolye.length&&!verildi)k.parca('kabuk-cikar',res('kres/kolye-iplik'),[27,62,10,13],[17,62,16,10],k.eylem('kabuk-cikar','Son kabuğu ipten çıkar',()=>{s.kolye.pop();efekt.dokunma()}));
  if(verildi)k.parca('yenisini-diz',res('kres/kolye-iplik'),[30,81,15,17],[27,78,20,13],k.eylem('yenisini-diz','Bir kolye daha tasarla',()=>{
    s.kolye=[];s.kolyeKimde=undefined;s.kres.kolyeAyna=false;k.soyle('okul_kolye');
  }));
  if(s.kres.kolyeAlbumu.length)k.parca('kolye-album',res('kres/kolye-hatirla'),[88,19,12,16],[84,39,17,12],k.eylem('kolye-album','Hediye ettiğin kolyelere bak',()=>kolyeAlbumu(s)));
  saksi(k);
  for(const [kim,x] of [['mino',17],['zipzip',83]] as const){
    arkadas(k,kim,x,s.kolyeKimde===kim,doldu&&!verildi?k.eylem('ver-'+kim,'Kolyeyi '+(kim==='mino'?'Mino’ya':'Zıpzıp’a')+' hediye et',()=>{s.kolyeKimde=kim;s.kres.hediye=kim;s.kres.kolyeHatira=[...s.kolye];s.kres.kolyeAlbumu=[...s.kres.kolyeAlbumu,{kim,boncuklar:[...s.kolye]}].slice(-8);tamamla(s.kres,'kolye');olay='sevin-'+kim;efekt.dogru();k.soyle(kim==='mino'?'mino_dogru':'zip_dogru')}):undefined).classList.toggle('ipucu',doldu&&!verildi);
  }
  masa(k);
  if(ayna&&!verildi&&s.kolye.length>=3&&s.kolye.length<6){
    const ornek=s.kolye.slice(0,3);
    const tepsi='<span class="ayna-tepsisi">'+res('kres/kolye-ipuclar')+'<span>'+ornek.map((n,i)=>'<i class="'+(i===5-s.kolye.length?'karsisinda':'')+'">'+res('etkinlik/deniz-'+n)+'</i>').join('')+'</span></span>';
    k.parca('ayna-ornek',tepsi,[51,63,28,12],[50,62,41,11],k.eylem('ayna-ornek','Kolyenin ilk yarısına bak',()=>k.soyle('kres_kolye_hatirla')));
  }
  if(!verildi){
    const boncuklar=s.kolye.map((b,n)=>'<i style="left:'+boncukYeri[n][0]+'%;top:'+boncukYeri[n][1]+'%" class="'+(n===s.kolye.length-1&&olay==='dizildi'?'yeni':'')+'">'+res('etkinlik/deniz-'+b)+'</i>').join('');
    k.parca('ip','<span class="okul-ip"><svg viewBox="0 0 100 50" preserveAspectRatio="none"><path d="M2 8Q50 62 98 8" fill="none" stroke="#7a4f3a" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>'+boncuklar+'</span>',[50,36,40,44],undefined,undefined,'pasif');
  }
  for(let i=0;i<6&&!verildi;i++)k.parca('kabuk-'+i,res('etkinlik/deniz-'+i),[16+i*13.6,84,11,22],undefined,doldu?undefined:
    k.eylem('diz-'+i,'Kolyeye diz',()=>{
      if(ayna&&s.kolye.length>=3&&i!==s.kolye[5-s.kolye.length]){efekt.dokunma();k.soyle('kres_kolye_hatirla');return}
      s.kolye.push(i);olay='dizildi';efekt.nota(s.kolye.length);if(s.kolye.length===6)k.soyle('okul_kolye_ver')},'ip'),doldu?'pasif':'');
  if(verildi)k.ileri(k.eylem('oyun-odasina','Oyun odasına dön',()=>{tamamla(s.kres,'kolye');s.kres.hediye=s.kolyeKimde;s.kres.kolyeHatira=[...s.kolye];k.gir('oyun-odasi')}),'ileri');
}

function kolyeAlbumu(s:Sabah){
  const d=document.createElement('dialog');d.className='kolye-albumu';d.setAttribute('aria-label','Hediye kolyelerim');
  let n=s.kres.kolyeAlbumu.length-1;
  const obje=(ad:string,art:string,eylem:()=>void)=>{
    const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',ad);b.innerHTML=art;b.onclick=eylem;return b;
  };
  function goster(){
    const h=s.kres.kolyeAlbumu[n];d.replaceChildren();
    const kutu=document.createElement('div');kutu.className='kolye-sandigi';kutu.innerHTML=res('kres/kolye-kutu');
    const zincir=document.createElement('div');zincir.className='kolye-album-dizi';zincir.innerHTML=h.boncuklar.map((i,j)=>'<i style="left:'+boncukYeri[j][0]+'%;top:'+boncukYeri[j][1]+'%">'+res('etkinlik/deniz-'+i)+'</i>').join('');kutu.append(zincir);
    const kime=document.createElement('div');kime.className='kolye-kime';kime.innerHTML=res('ders/'+h.kim+'-0');kime.setAttribute('aria-label',h.kim==='mino'?'Mino’nun kolyesi':'Zıpzıp’ın kolyesi');
    d.append(kutu,kime);const arac=document.createElement('div');arac.className='kolye-album-arac';
    if(s.kres.kolyeAlbumu.length>1)arac.append(obje('Diğer kolyeye bak',res('kres/kolye-hatirla'),()=>{n=(n+s.kres.kolyeAlbumu.length-1)%s.kres.kolyeAlbumu.length;efekt.sayfa();goster()}));
    arac.append(obje('Kutuyu kapat',simge('tamam'),()=>d.close()));d.append(arac);
  }
  document.body.append(d);goster();d.addEventListener('close',()=>d.remove(),{once:true});d.showModal();
}
export function okulGunu(k:Kit){
  if(k.s.sahne!=='muzik'){nobet++;bandoyuSustur()}
  ({ek,muzik,kolye} as Record<string,(k:Kit)=>void>)[k.s.sahne]?.(k);
  olay='';
}
