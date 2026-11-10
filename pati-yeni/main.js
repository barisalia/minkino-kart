import {odaMeraki} from './oda-meraki.js';
import {giydir,hayvanIsigi,isikKatmani} from './giyim.js';
import './giyim.css';
import {oyunTahtasi,oyunuBagla} from './oyunlar.js';
import {gunIsigi,saatiBaslat} from './ilerleme.js';
import {uykuCizimi,uykuyaGec} from './uyku.js';
import './aksam.css';
import {suruyuGezdir} from './gezinti.js';
import {urunler,yuvaCizimi} from './urunler.js';
import surup from '../assets/pati/esya-surup-kasigi.webp?url';
import {oksamaBagla} from './oksama.js';
import {market,raf} from './market.js';
import {baglaDokunus} from './dokunus.js';
import './market.css';
import './bakim-rafi.css';
import './banyo.css';
import {dekorTasi,topluBesle,giysiCikar,donat,haftalikFiyat,topluYika,tedaviEt, durum, sahipMi, urunAl, ogunTamamla, kurdeleTak, bakimOdulu, bakimYapildi, satinAl} from './ilerleme.js';
import {vitrin,vitrinTelefon,dostVitrini,showroom,akvaryum,turnPage,showDialog,showPage} from './vitrin.js';
import {cesitler,aileler} from './cesitler.js';
import {hayvanSat,gunuBitir} from './ilerleme.js';
import './showroom.css';
import './morfoloji-dort.css';
import './duruslar.css';
import './alanlar.css';
import {renkTablolari, gorunum, postFiltresi} from './postlar.js';
import {efekt} from '../src/audio/efekt';
import {sesMotorunuAc} from '../src/audio/motor';
import {names,pantry,foodUrl,foodOutcome} from './yiyecek.js';
import {meal} from './ogun.js';
import {geriDinle} from '../src/kabuk/yon';
import {kopek} from './parcalar.js';
import {kopekler} from './kopekler.js';
import palette from '../assets/uygulama/kategoriler/etkinlik.svg?url';
import moon from '../assets/film/esya/ay.webp?url';

import './gun.css';

let armed='',session,pantryOpen=false,chosen='';
const requests={};
function wish(){
 const menu=pantry[state.pet];
 requests[state.id]??=Math.floor(Math.random()*menu.length);
 return menu[requests[state.id]];
}
function nextWish(){
 const menu=pantry[state.pet];
 requests[state.id]=(requests[state.id]+1+Math.floor(Math.random()*(menu.length-1)))%menu.length;
}

const labels = {menu:'Pati',akvaryum:'Akvaryum',baliklar:'Balık seç',bakim:'Bakım',banyo:'Banyo',dostlar:'Yeni dost',magaza:'Mağaza',gorunum:'Görünüm'};
const state = {page:'menu',home:'ev',pet:'kopek',id:'kopek',pose:'bosta',action:'',drawer:false,dog:0,mat:'nane',shop:'nane'};
const app=document.querySelector('#pati');
const workshop=import.meta.glob('../assets/pati-yeni/atolye/*.webp',{eager:true,query:'?url',import:'default'});
const props=import.meta.glob('../assets/pati-yeni/nesneler/*.webp',{eager:true,query:'?url',import:'default'});
const odaResimleri=import.meta.glob('../assets/pati-yeni/oda/*.svg',{eager:true,query:'?url',import:'default'});
const asset=(name)=>name==='ilac'?surup:odaResimleri['../assets/pati-yeni/oda/'+name+'.svg']||workshop['../assets/pati-yeni/atolye/'+name+'.webp']||foodUrl(name)||new URL(`../assets/pati-yeni/ortam/${name}.webp`,import.meta.url).href;
const skins=import.meta.glob('../assets/pati-yeni/cesitler/*/*.webp',{eager:true,query:'?url',import:'default'});
const part=(id,name)=>skins['../assets/pati-yeni/cesitler/'+cesitler[id].tabanId+'/'+name+'.webp']||new URL(`../assets/pati-yeni/parcalar/${cesitler[id].tur}/${name}.webp`,import.meta.url).href;
const carePart=(_species,name)=>part(state.id,name);
const art=(name)=>`<img class="arac" src="${asset(name)}" alt="">`;
const btn=(act,label,extra='')=>`<button type="button" data-act="${act}" ${extra}>${label}</button>`;
const coin=n=>`<span class="para-miktar"><img alt="jeton" src="${asset('para')}"><b>${n}</b></span>`;
const ownedIn=home=>durum().sahipler.filter(id=>cesitler[id].ortam===home);
let bagPage=0,fromBag=false,rewardMessage='',rewardCoins=null,noteTimer;
function rewardContents(){
 if(rewardCoins===null)return rewardMessage;
 return `<span class="odul-jeton" aria-hidden="true">${coin('+'+rewardCoins)}</span><span class="ses-etiketi">${rewardMessage}</span>`;
}
function announce(message,coins=null){
 rewardMessage=message;rewardCoins=coins;
 const note=app.querySelector('.pati-haber');
 if(note){note.innerHTML=rewardContents();note.hidden=false;}
 clearTimeout(noteTimer);
 noteTimer=setTimeout(()=>{rewardMessage='';rewardCoins=null;const n=app.querySelector('.pati-haber');if(n)n.hidden=true;},2400);
}
const nameOf=id=>aileler[cesitler[id].tur].ad;
function animal(id,pose='normal'){
 const model=cesitler[id];
 const sinif=hayvanIsigi(model);
 const isik=isikKatmani(sinif);
 const stil=gorunum(model)+` data-isik="${sinif}"`;
 if(model.ortam==='golet')return `<div class="kukla tur-balik" ${stil} role="img" aria-label="${nameOf(id)}"><img class="butun-balik" src="${part(id,'tam-'+pose)}" alt="">${isik}</div>`;
 if(model.tur==='kopek')return kopek(kopekler[model.index],model.madalya,sinif,isik);
 return `<div class="kukla tur-${model.tur}" data-model="${model.tabanId}" ${stil} role="img" aria-label="${nameOf(id)}"><div class="kukla-ic"><img class="beden" src="${part(id,'govde')}" alt=""><img class="yuz" src="${part(id,pose)}" alt="">${isik}</div></div>`;
}
let feeding;

function toy(){
 if(state.home==='golet')return symbol('kabarcik');
 return symbol('top');
}
function feedFish(outcome){
 const favorite=outcome==='favorite';
 state.pose='yemek';
 state.action='mama';
 render();
 const scene=app.querySelector('.bakim-sahne');
 const swimmer=scene.querySelector('.buyuk');
 const face=swimmer.querySelector('.butun-balik').getBoundingClientRect();
 const box=scene.getBoundingClientRect();
 const mouthX=face.left-box.left+face.width*0.025;
 const mouthY=face.top-box.top+face.height*(state.pet==='beta'?.56:.61);
 const x=Math.max(32,mouthX-box.width*0.15);
 const y=Math.max(45,mouthY-box.height*0.13);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const duration=reduced?450:2000;
 for(let i=0;i<3;i++){
   const pellet=document.createElement('i');
   pellet.className='yem-tanesi secilen-yem';pellet.style.backgroundImage='url('+foodUrl(chosen)+')';
   pellet.style.left=(x+i*6)+'px';
   pellet.style.top=y+'px';
   scene.append(pellet);
   pellet.animate([{transform:'translateY(-'+Math.round(y*0.85)+'px)',opacity:1},{transform:'translateY(0)',opacity:1,offset:0.72},{opacity:0}],{duration:reduced?300:1150,delay:i*(reduced?30:120),fill:'both'});
 }
 if(!reduced)swimmer.animate([{transform:'translate(0,0)'},{transform:'translate('+(x-mouthX)+'px,'+(y-mouthY)+'px)',offset:0.53},{transform:'translate('+(x-mouthX)+'px,'+(y-mouthY)+'px)',offset:0.63},{transform:'translate(0,0)'}],{duration,easing:'ease-in-out'});
 if(favorite)app.querySelector('.bakim-sahne').classList.add('mutlu-balik');
 feeding=setTimeout(()=>tepki(outcome!=='unsuitable'),duration);
}
function go(page){vitrin.dialog=null;rewardMessage='';rewardCoins=null;bagPage=0;armed='';pantryOpen=false;chosen='';state.page=page;state.pose='bosta';state.action='';render();}
function enter(id){
 if(!sahipMi(id)){go('menu');return;}
 const model=cesitler[id];
 const data=durum();
 showPage(id,data);
 if(data.hayvanlar[id].acGun>=2&&!asleep(id))efekt.karinGurultusu();
 state.id=id;state.pet=model.tur;state.home=model.ortam;state.dog=model.index;
 state.drawer=true;go('bakim');
}
const symbol=name=>`<img class="simge" alt="" src="${props['../assets/pati-yeni/nesneler/'+name+'.webp']||new URL(`../assets/pati-yeni/arayuz/${name}.svg`,import.meta.url).href}">`;
const views=()=>({data:durum(),animal,coatState,btn,art,symbol,moon,coin});
function menu(){return showroom(views());}
const banyoyaGirer=pet=>['kopek','kedi','tavsan','hamster'].includes(pet);
const rug=`<svg viewBox="0 0 360 70" preserveAspectRatio="none" aria-hidden="true"><path d="M22 25Q18 16 43 15Q48 6 77 9Q93 1 117 6Q139 0 162 4Q181 0 203 4Q231 0 253 7Q281 3 295 12Q323 10 328 20Q356 21 351 32Q368 43 344 49Q343 61 314 58Q298 69 269 62Q245 72 217 66Q191 73 165 66Q137 72 116 65Q84 70 72 61Q45 64 37 54Q7 56 11 44Q-7 35 22 25Z" fill="var(--mat)" stroke="#786b55" stroke-width="2.7"/><ellipse cx="180" cy="34" rx="143" ry="21" fill="none" stroke="#fff7df" stroke-width="2"/></svg>`;
function careTools(pet){
 const tools=aileler[pet].ortam==='golet'?['mama','oyun','uyku']:['mama','su','oyun','uyku'];
 if(durum().hayvanlar[state.id]?.hastaGun)tools.unshift('ilac');
 if(aileler[pet].ortam!=='golet'&&!banyoyaGirer(pet))tools.push('temizlik');
 const bag=durum().canta;
 if(['kopek','kedi','tavsan'].includes(pet)&&bag.kurdele)tools.push('kurdele');
 return tools;
}
const doneMark='<span class="tamam" aria-hidden="true"></span>';
function tepki(mutlu){
 state.action='';
 state.pose=mutlu?'sevin':'bosta';
 render();
 const pet=app.querySelector('.buyuk');
 if(!pet)return;
 pet.classList.add('banyo-tepki',mutlu?'sevindi':'cekindi');
 pet.setAttribute('aria-label',mutlu?'Sevindi':'Geri çekildi');
 if(mutlu)efekt.dogru();else efekt.yanlis();
 feeding=setTimeout(()=>{state.pose='bosta';render();},1000);
}
async function recordCare(id,action,stars=3,coverage){
 const room=state.page;
 const result=await bakimOdulu(id,action,stars,coverage);
 if(state.id!==id||state.page!==room)return;
 // A different tool may already be in use while the storage lock is waiting.
 if(state.action&&state.action!==action)return;
 const tamam=result.ok&&result.bakimPuani>0;
 if(room==='banyo'){
  enter(id);
  tepki(tamam);
  if(tamam){
   const mark=document.createElement('span');
   mark.className='bakim-onayi';mark.setAttribute('role','status');
   mark.innerHTML='<span aria-hidden="true">✓</span><span class="ses-etiketi">Bakım tamamlandı</span>';
   app.querySelector('.buyuk').append(mark);
  }
  return;
 }
 tepki(tamam);
 if(action==='oyun'&&result.ok)announce('★ '+result.bakimPuani+' / 10');
}
const walletLabel=()=>`Cüzdan, ${durum().para} jeton`;
const toolNames={ilac:'Tedavi et',temizlik:'Temizle',sampuan:'Yıka',kurdele:'Papyon',mama:'Yemek',su:'Su',oyun:'Oyuncakla oyna',firca:'Tara',uyku:'Uyut'};
const toolArt={ilac:'ilac',temizlik:'sunger',mama:'mama',su:'surahi',firca:'firca',uyku:'uyku',sampuan:'sampuan',kurdele:'kurdele'};
const foodSymbols={kedi:'kedi-lokmasi',hamster:'dari',tavsan:'havuc',ordek:'dari',kus:'dari',civciv:'dari',kirpi:'cekirge',geko:'cekirge',kaplumbaga:'yaprak',balik:'yem-kutusu',beta:'yem-kutusu'};
function toolIcon(pet,key){
 if(key==='oyun')return toy();
 if(key==='mama')return art(foodSymbols[pet]||'mama');
 if(key==='uyku'&&aileler[pet].ortam==='golet')return `<img class="arac" src="${moon}" alt="">`;
 return art(toolArt[key]);
}
function pantrySlots(){
 const inventory=durum().canta;
 const ids=Object.keys(names).filter(id=>inventory[id]>0);
 ids.sort((a,b)=>Number(b===wish())-Number(a===wish()));
 const pages=Math.max(1,Math.ceil(ids.length/4));
 bagPage=Math.min(bagPage,pages-1);
 // Divide evenly so a fifth portion does not get stranded on a page of its own.
 const portions=ids.slice(Math.ceil(bagPage*ids.length/pages),Math.ceil((bagPage+1)*ids.length/pages));
 const back=btn('pantry-close','<i class="raf-ok geri-ok" aria-hidden="true"></i>','class="raf-yon" aria-label="Araçlara dön"');
 const slots=portions.map(id=>btn('food',art(id)+`<b class="porsiyon" aria-hidden="true">×${inventory[id]}</b>`,`class="goz" data-food="${id}" aria-label="${names[id]}, ${inventory[id]} porsiyon" aria-pressed="${armed==='mama'&&chosen===id}"`));
 const pageDots=Array.from({length:pages},(_,index)=>`<i ${index===bagPage?'class="burada"':''}></i>`).join('');
 const next=pages>1?btn('canta-ileri',`<i class="raf-ok" aria-hidden="true"></i><span class="raf-sayfalari" aria-hidden="true">${pageDots}</span>`,`class="raf-yon" aria-label="Sonraki porsiyonlar, sayfa ${bagPage+1} / ${pages}"`):'';
 const shop=btn('erzak',symbol('magaza'),`class="goz erzak" aria-label="${ids.length?'Yemek al':'Çanta boş. Mağazadan yemek al'}"`);
 return {contents:back+slots.join('')+next+shop,columns:portions.length+2+(next?1:0),compact:pages===1&&portions.length<3};
}
function tray(pet){
 const tools=state.page==='banyo'?['firca','sampuan']:careTools(pet);
 const slots=pantryOpen?pantrySlots():{
  contents:tools.map(key=>{
   const icon=toolIcon(pet,key);
   if(key==='ilac'){
    const data=durum(), stocked=Boolean(data.canta.ilac),price=haftalikFiyat(urunler.ilac.fiyat,data.gun);
    const label=stocked?'Şurup ver':price+' jetona tedavi et';
    return btn('tedavi',icon+(stocked?'':coin(price)),`class="goz tedavi" data-satin="${!stocked}" data-fiyat="${price}" aria-label="${label}" ${!stocked&&data.para<price?'disabled':''}`);
   }
   const done=bakimYapildi(state.id,key);
   const selected=key==='kurdele'?durum().hayvanlar[state.id].kurdele:armed===key||state.action===key;
   return btn('use',icon+(done?doneMark:''),`class="goz" data-key="${key}" aria-label="${toolNames[key]}" aria-pressed="${!!selected}" ${done?'aria-description="Bugün yapıldı"':''}`);
  }).join('')+(state.page==='bakim'&&banyoyaGirer(pet)?btn('banyo',symbol('banyo'),'class="goz" aria-label="Banyoya git"'):''),
  columns:tools.length+Number(state.page==='bakim'&&banyoyaGirer(pet))
 };
 const handle=state.page==='bakim'?'':btn('drawer','<i aria-hidden="true"></i>','class="raf-kulp" aria-label="Çekmeceyi kapat" aria-expanded="true"');
 const busy=state.action==='mama'||state.action==='su';
 return `<footer class="bakim-rafi ${pantryOpen?'yemek-rafi':''} ${slots.compact?'kisa-raf':''} ${slots.columns>5?'dolu-raf':''}" style="--goz:${slots.columns}" aria-label="${pantryOpen?'Yemek çantası':'Bakım araçları'}">${handle}<fieldset class="raf-ici" ${busy?'disabled':''}>${slots.contents}</fieldset></footer>`;
}
function asleep(id){return durum().hayvanlar[id]?.bakimlar.includes('uyku');}
async function yatir(){
 const id=state.id;
 const eskiYatak=app.querySelector('.yatak')?.getBoundingClientRect();
 const sonuc=await bakimOdulu(id,'uyku',3);
 if(!sonuc.ok||state.page!=='bakim'||state.id!==id)return;
 render();
 await uykuyaGec(app.querySelector('.bakim-sahne'),eskiYatak);
}
function coatState(id){
 const pet=durum().hayvanlar[id];
 if(!pet)return '';
 return (pet.hastaGun?' hasta-pati':'')+(!pet.bakimlar.includes('uyku')&&pet.acGun>=2?' karni-gurulduyor':'')+(pet.kirGun>=2?' kirli-tuy':'')+(pet.susuzGun>=1?' susadi':'');
}
function geceDugmeleri(){
 const {hayvanlar,sahipler}=durum();
 const siradaki=sahipler.find(id=>id!==state.id&&!hayvanlar[id].bakimlar.includes('uyku'));
 const ileri=siradaki?btn('pet',animal(siradaki)+'<i aria-hidden="true">›</i>',`class="siradaki-pati" data-key="${siradaki}" aria-label="Sıradaki uyanık hayvan, ${cesitler[siradaki].ad}" `):'';
 return '<footer class="uyku-alt">'+ileri+btn('gece','<img src="'+moon+'" alt="">','aria-label="Günü bitir"')+'</footer>';
}
function care(){
 const {pet,home,pose,action,drawer}=state;

 const oynuyor=action==='oyun';
 const fish=aileler[pet].ortam==='golet';
 const face=pose==='uyu'?'uyku':pose==='bosta'?'normal':'sevin';
 const resting=action==='uyku';
 const cizili=resting?uykuCizimi(cesitler[state.id],kopekler[state.dog]):'';
 const badge=durum().hayvanlar[state.id].kurdele?`<img class="takili-papyon turu-${pet}" src="${asset('kurdele')}" alt="Papyon">`:'';
 const kayit=durum().hayvanlar[state.id];
 const bed=yuvaCizimi(pet,home,kayit.yatak);
 const dekor=kayit.dekor&&!action&&!armed&&!pantryOpen?btn('oda-dekor',art(kayit.dekor),`class="oda-dekor" style="left:${kayit.dekorX}%" aria-label="${urunler[kayit.dekor].ad}" data-key="${kayit.dekor}"`):'';
 const yuva=(!action||resting)&&!pantryOpen&&!armed?btn('yatir',art(bed),`class="oda-yuvasi yatak" data-key="uyku" aria-label="Yatağına yatır" ${resting?'disabled':''}`):'';
 const wishBubble=pantryOpen?`<div class="istek" data-istek="${wish()}" aria-label="Canı ${names[wish()]} istiyor">${art(wish())}</div>`:'';

 const night=resting?`<div class="gece-isigi"></div><i class="uyku-izi">z z Z</i>`:'';
 const target=armed?btn('give',`<span class="sunulan">${art(armed==='su'?'surahi':chosen)}</span>`,`class="hedef" aria-label="${nameOf(pet)} için ${armed==='su'?'su':names[chosen]} ver"`):'';

 const arrows=ownedIn(home).length>1&&!action?btn('prev','‹','class="ok onceki" aria-label="Önceki hayvan"')+btn('next','›','class="ok sonraki" aria-label="Sonraki hayvan"'):'';
 const interactive=['firca','sampuan'].includes(action);
 return `<section class="bakim-sahne ortam-${home} hareket-${pose} ${interactive?'etkilesimli':''}">${dekor}${yuva}${resting&&['sepet-yatak','kus-yatagi','cicek','kayik'].includes(bed)?`<div aria-hidden="true" class="yatak-kenari">${art(bed)}</div>`:''}<div class="platform ${state.mat}" ${fish?'hidden':''}>${rug}</div><div class="buyuk${coatState(state.id)}" style="--post:${postFiltresi(cesitler[state.id])}">${cizili||animal(state.id,face)}${badge}${target}</div>${wishBubble}${night}${arrows}${oynuyor?oyunTahtasi(toy()):''}</section>${resting?geceDugmeleri():interactive?'':tray(pet)}`;
}
function bath(){
 const action=state.action;
 const active=action==='sampuan'||action==='firca';
 const face=state.pose==='sevin'?'sevin':'normal';
 const shelf=active?'<footer class="banyo-islem-rafi" aria-label="Bakım araçları"></footer>'
  :state.drawer?tray(state.pet):`<footer class="banyo-kapali">${btn('drawer',art('firca'),'aria-label="Bakım araçlarını aç" aria-expanded="false"')}</footer>`;
 return `<section class="bakim-sahne banyo-sahne hareket-${state.pose}"><div class="buyuk${coatState(state.id)}">${animal(state.id,face)}</div></section>${shelf}`;
}
function gallery(){return dostVitrini(views());}
function shop(){return market({art,symbol,btn,coin,fromBag,vitrinHTML:gallery,animal,istenen:fromBag?wish():null});}
function editor(){
 const dog=kopekler[state.dog];
 const select=(key,options)=>`<select data-field="${key}">${options.map(([id,text])=>`<option value="${id}" ${dog[key]===id?'selected':''}>${text}</option>`).join('')}</select>`;
 return `<section class="duzen"><div>${animal(state.id)}</div><fieldset><legend>${dog.ad}</legend>${[['tuy','Tüy'],['kulak','Kulak rengi'],['acik','Açık alan']].map(([key,label])=>`<label>${label}<input type="color" data-field="${key}" value="${dog[key]}"></label>`).join('')}<label>Kulak ${select('kulakTip',[['dik','Dik'],['sarkik','Sarkık']])}</label><label>Kuyruk ${select('kuyruk',[['uzun','Uzun'],['kivrik','Kıvrık']])}</label><label>Desen ${select('desen',[['duz','Düz'],['alacali','Alacalı'],['benekli','Benekli']])}</label></fieldset></section>`;
}
function isigiGoster(){
 const vakit=gunIsigi(durum()),gece=vakit==='gece';
 app.dataset.vakit=vakit;
 const saat=app.querySelector('.vakit');
 if(saat){saat.disabled=!gece;saat.textContent=gece?'☾':vakit==='aksam'?'◒':'☀';saat.setAttribute('aria-label',gece?'Gece, gün sonunu göster':vakit==='aksam'?'Akşam':'Gündüz');}
 for(const b of app.querySelectorAll('[data-act=yatir],[data-act=use][data-key=uyku]')){
  b.disabled=!gece||asleep(state.id);
  b.setAttribute('aria-label',gece?'Yatağına yatır':'Gece uyutabilirsin');
 }
 const ay=app.querySelector('.alan-alt [data-act=gece]');
 if(ay){ay.hidden=!gece;ay.disabled=!gece;ay.setAttribute('aria-label','Günü bitir');}
}
function render(){
 cancelDrag();
 const previousShelf=app.querySelector('.bakim-rafi');
 const shelfWasOpen=!!previousShelf,wasPantry=previousShelf?.classList.contains('yemek-rafi');
 session?.abort();session=undefined;clearTimeout(feeding);
 if(['bakim','banyo','gorunum'].includes(state.page)&&asleep(state.id)){
  state.page='bakim';state.action='uyku';state.pose='uyu';state.drawer=false;armed='';pantryOpen=false;
 }
 const page=state.page;
 const title=page==='bakim'?cesitler[state.id].ad:labels[page];
 const wallet=['bakim','banyo'].includes(page)?'':`<div class="cuzdan" aria-label="${walletLabel()}">${coin(durum().para)}</div>`;
 app.innerHTML=`${renkTablolari}<article class="cerceve sayfa-${page}"><header>${['bakim','menu','akvaryum','banyo'].includes(page)?btn('vakit','','class="vakit" aria-label="Oyun saati"'):''}${page!=='menu'?btn('back','‹','class="geri" aria-label="Geri"'):btn('exit','‹','class="geri" aria-label="Oyunlara dön"')}${page==='menu'?`<h1 class="gun-etiketi">${durum().gun}. gün</h1>`:`<h1>${title}</h1>`}${wallet}${document.fullscreenEnabled?btn('fullscreen','⛶','class="tam-ekran" aria-label="Tam ekranı aç veya kapat"'): ''}${page==='bakim'&&state.action!=='uyku'&&state.pet==='kopek'?btn('gorunum',`<img src="${palette}" alt="">`,'class="gorunum-dugme" aria-label="Görünüm"'):''}</header>${({menu, bakim:care,banyo:bath, dostlar:gallery, akvaryum:()=>akvaryum(views()), baliklar:()=>dostVitrini(views(),true), magaza:shop, gorunum:editor})[page]()}${vitrin.dialog?showDialog(views()):''}<div class="pati-haber" role="status" ${rewardMessage?'':'hidden'}>${rewardContents()}</div></article>`;
 for(const img of app.querySelectorAll('.kirli-tuy .kukla img')){
  const mark=img.cloneNode(false);
  mark.classList.add('camur-katmani');mark.setAttribute('aria-hidden','true');
  mark.style.setProperty('--sil','url("'+img.src+'")');img.after(mark);
 }
 const sahipler=durum().hayvanlar;
 for(const slot of app.querySelectorAll('.alan .hayvana-git,.sayfa-bakim .buyuk,.donanim-portre,.mini-kahraman')){
  const id=slot.dataset.key||(slot.classList.contains('donanim-portre')?raf.hedef:state.id);
  const uyuyan=slot.querySelector('.sergi-hayvan.hareket-uyu');
  if(uyuyan){
   const model=cesitler[id];
   const poz=uykuCizimi(model,kopekler[model.index]);
   if(poz){uyuyan.insertAdjacentHTML('beforeend',poz);uyuyan.style.setProperty('--post',postFiltresi(model));}
  }
  const kiyafet=(slot.classList.contains('donanim-portre')&&raf.prova)||sahipler[id]?.kiyafet;
  if(kiyafet)giydir(slot,kiyafet,cesitler[id]);
 }
 const sus=app.querySelector('.oda-dekor');
 if(page==='bakim'&&!state.action&&!armed&&!pantryOpen){
  session=new AbortController();
  const merak=odaMeraki(app.querySelector('.bakim-sahne'),state.pet,durum().hayvanlar[state.id].yatak,session.signal,()=>efekt.tink(),()=>part(state.id,'uyku'));
  if(sus)odaEsyaBagla(sus,state.id,merak);
 }
 suruyuGezdir(app.querySelector('.alan-surusu'),!!vitrin.dialog);
 const id=state.pet,action=state.action,ownedId=state.id;
 const shelf=app.querySelector('.bakim-rafi');
 if(shelf&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  if(!shelfWasOpen)shelf.animate([{transform:'translateY(24%)',opacity:.55},{transform:'none',opacity:1}],{duration:210,easing:'cubic-bezier(.2,.7,.25,1)'});
  else if(wasPantry!==pantryOpen)shelf.querySelector('.raf-ici').animate([{transform:`translateX(${pantryOpen?8:-8}px)`,opacity:.6},{transform:'none',opacity:1}],{duration:150,easing:'ease-out'});
 }
 if(page==='bakim'&&action==='oyun'){
  session=new AbortController();
  oyunuBagla(app.querySelector('.bakim-sahne'),id,()=>{efekt.dogru();void bakimOdulu(ownedId,'oyun',3,100);},session.signal);
 }
 isigiGoster();
 if(page==='bakim'&&!action&&!armed&&!pantryOpen){
  oksamaBagla(app.querySelector('.bakim-sahne'),id,carePart,()=>{sesMotorunuAc();efekt.dokunma();if(!bakimYapildi(ownedId,'oksama'))void bakimOdulu(ownedId,'oksama',3);},asset('kalp'));
 }
 if(page==='banyo'&&['firca','sampuan'].includes(action)){
  session=new AbortController();
  const scene=app.querySelector('.bakim-sahne'),signal=session.signal;
  const finish=(stars,coverage)=>{if(!signal.aborted)void recordCare(ownedId,action,stars,coverage);};
  baglaDokunus({onProgress:percent=>void bakimOdulu(ownedId,action,0,percent),scene,type:action==='sampuan'?'yikama':'firca',asset,signal,
   actionsHost:app.querySelector('.banyo-islem-rafi'),relaxedFace:id==='kopek'?undefined:part(ownedId,'uyku'),onFinish:score=>finish(score.stars,score.phase==='sabun'?0:score.progress)});
 }

}
window.addEventListener('storage',event=>{
 if(event.key!=='pati-yeni-ilerleme-v1')return;
 const data=durum();
 if((['bakim','banyo','gorunum'].includes(state.page))&&!data.hayvanlar[state.id]){go('menu');return;}
 let lastDay;
 try{lastDay=JSON.parse(event.oldValue)?.gun??1;}catch{lastDay=1;}
 if(lastDay!==data.gun){go('menu');return;}
 if(['bakim','banyo','gorunum'].includes(state.page)&&asleep(state.id)){render();return;}
 if(state.page==='bakim'||state.page==='banyo')return;
 if(vitrin.dialog?.tip==='satis'&&!data.hayvanlar[vitrin.dialog.id])vitrin.dialog=null;
 if(['menu','magaza','dostlar','akvaryum','baliklar'].includes(state.page))render();
});
async function give(key,origin){
 const id=state.pet,ownedId=state.id,food=chosen,preferred=wish();
 if(state.action==='mama'||state.action==='su')return;
 if(key==='mama'&&!durum().canta[food]){armed='';render();announce('Önce bir porsiyon al');return;}
 const outcome=key==='mama'?foodOutcome(id,food,preferred):'fresh';
 armed='';pantryOpen=false;
 state.action=key;state.pose='bosta';render();
 const controller=new AbortController();session=controller;
 try{
  const result=key==='mama'?await ogunTamamla(ownedId,food,preferred):await bakimOdulu(ownedId,key,3);
  if(controller.signal.aborted)return;
  if(!result.ok){
   state.action='';render();announce('Çantada porsiyon kalmadı');return;
  }
  if(result.ok&&key==='mama'&&food===preferred)nextWish();
  if(state.home==='golet'){feedFish(outcome);return;}
  await meal({scene:app.querySelector('.bakim-sahne'),pet:id,key,food,outcome,favorite:outcome==='favorite',url:asset,part:carePart,origin,signal:controller.signal});
  if(!controller.signal.aborted)tepki(!result.hasta);
 }catch(error){if(!controller.signal.aborted)throw error;}
}
let returnPage='menu';
function openShop(page){
 vitrin.nadir=false;returnPage=state.page;fromBag=pantryOpen;raf.kisisel=page==='dolap';raf.tab=raf.kisisel?'donanim':'yiyecek';raf.sayfa=0;
 if(page==='dostlar'||page==='baliklar'){
  vitrin.cesitSayfa=0;
  const water=page==='baliklar';
  vitrin.tur=state.page==='bakim'&&(state.home==='golet')===water?state.pet:water?'balik':Object.keys(aileler).find(t=>aileler[t].ortam===vitrin.ortam);
 }
 raf.prova=null;raf.hedef=state.id;
 if(page==='dostlar'||page==='baliklar')raf.tab='hayvan';
 go('magaza');
}
function focusOn(selector){app.querySelector(selector)?.focus({preventScroll:true});}
function openDialog(tip,id){
 vitrin.dialog={tip,id};
 render();focusOn('.vazgec');
}
function closeDialog(){
 const {tip,id}=vitrin.dialog;
 vitrin.dialog=null;render();
 focusOn(tip==='gece'?'[data-act=gece]':`[data-key="${id}"][data-act=kart],[data-key="${id}"][data-act=incele]`);
}
function back(){
 if(state.page==='bakim'&&!vitrin.dialog&&asleep(state.id)){go(state.home==='golet'?'akvaryum':'menu');return;}
 if(state.page==='banyo'){
  if(state.action){state.action='';state.pose='bosta';render();}
  else{state.drawer=false;go('bakim');focusOn('[data-act=banyo]');}
  return;
 }
 if(vitrin.dialog){closeDialog();return;}
 if(state.page==='magaza'&&fromBag){go('bakim');state.drawer=true;pantryOpen=true;render();return;}
 if(state.page==='bakim'&&armed){armed='';render();focusOn(pantryOpen?`[data-food="${chosen}"]`:'[data-key=su]');return;}
 if(state.page==='bakim'&&['mama','su'].includes(state.action)){state.action='';state.pose='bosta';state.drawer=false;render();focusOn('[data-act=drawer]');return;}
 if(state.page==='bakim'&&state.action){state.action='';state.pose='bosta';armed='';render();return;}
 if(state.page==='bakim'&&pantryOpen){pantryOpen=false;render();focusOn('[data-key=mama]');return;}

 if(['magaza','dostlar','baliklar'].includes(state.page)){go(returnPage);return;}
 if(state.page==='gorunum'){go('bakim');return;}
 go(state.page==='bakim'&&state.home==='golet'?'akvaryum':'menu');
}
let drag;
function cancelDrag(){
 if(!drag)return;
 const {btn,ghost}=drag;drag=undefined;
 ghost?.remove();btn.classList.remove('eldeki');
 app.classList.remove('tasiyor','teslim-alir');
}
function offeredToPet(x,y){
 const bounds=app.querySelector('.buyuk .rig,.buyuk .butun-balik,.buyuk .kukla-ic')?.getBoundingClientRect();
 if(!bounds?.width||!bounds.height)return false;
 const dx=(x-bounds.left-bounds.width*.5)/(bounds.width*.46);
 const dy=(y-bounds.top-bounds.height*.53)/(bounds.height*.5);
 return dx*dx+dy*dy<=1;
}
app.addEventListener('pointerdown',event=>{
 const btn=event.target.closest('[data-act=food],[data-act=use][data-key=su]');
 if(!btn||btn.matches(':disabled')||drag||event.button!==0||!event.isPrimary)return;
 drag={id:event.pointerId,x:event.clientX,y:event.clientY,key:btn.dataset.food?'mama':'su',btn};
 btn.setPointerCapture(event.pointerId);
});
app.addEventListener('pointermove',event=>{
 if(drag?.id!==event.pointerId)return;
 if(!drag.ghost){
  if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<7)return;
  drag.ghost=drag.btn.querySelector('img').cloneNode();drag.ghost.className='suruklenen';drag.ghost.setAttribute('aria-hidden','true');document.body.append(drag.ghost);
  drag.btn.classList.add('eldeki');
  app.classList.add('tasiyor');
 }
 Object.assign(drag.ghost.style,{left:event.clientX+'px',top:event.clientY+'px'});
 app.classList.toggle('teslim-alir',offeredToPet(event.clientX,event.clientY));
});
function release(event){
 if(drag?.id!==event.pointerId)return;
 const {ghost,key,btn}=drag;drag=null;
 if(!ghost)return;
 btn.classList.remove('eldeki');app.classList.remove('tasiyor','teslim-alir');
 // Pointer capture also synthesizes a click on the inventory slot after a drop.
 const suppress=e=>{e.stopImmediatePropagation();};
 btn.addEventListener('click',suppress,{once:true,capture:true});
 setTimeout(()=>btn.removeEventListener('click',suppress,true),0);
 if(event.type==='pointerup'&&offeredToPet(event.clientX,event.clientY)){
  ghost.remove();
  if(btn.dataset.food)chosen=btn.dataset.food;
  void give(key,{x:event.clientX,y:event.clientY});
 }else if(event.type==='pointerup'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const slot=btn.getBoundingClientRect();
  const flight=ghost.animate([{left:ghost.style.left,top:ghost.style.top},{left:(slot.left+slot.width/2)+'px',top:(slot.top+slot.height/2)+'px',opacity:0}],{duration:180,easing:'ease-out'});
  flight.finished.finally(()=>ghost.remove());
 }else ghost.remove();
}
app.addEventListener('pointerup',release);
app.addEventListener('pointercancel',event=>{if(drag?.id===event.pointerId)cancelDrag();});
app.addEventListener('lostpointercapture',event=>{if(drag?.id===event.pointerId)cancelDrag();});
window.addEventListener('blur',cancelDrag);
app.addEventListener('click',async event=>{
 const b=event.target.closest('[data-act]');if(!b)return;
 const key=b.dataset.key;
 sesMotorunuAc();
 if(b.matches('.goz,.buyuk-dugme,[data-act=drawer]'))efekt.dokunma();
 else if(!['catch','brush','give'].includes(b.dataset.act))efekt.secim();
 switch(b.dataset.act){
 case 'exit':location.assign('../index.html');break;
 case 'kart':case 'incele':openDialog(b.dataset.act,key);break;
 case 'vazgec':closeDialog();break;
 case 'aile':vitrin.nadir=false;vitrin.tur=key;vitrin.cesitSayfa=0;render();focusOn(`[data-act=aile][data-key="${key}"]`);break;
 case 'toplu-besle':{
  b.disabled=true;
  const sonuc=await topluBesle(Number(b.dataset.gun),b.dataset.ucretsiz==='true');
  render();
  if(sonuc.ok){
   efekt.dogru();
   for(const pet of app.querySelectorAll('.hayvana-git')){
    if(sonuc.ids.includes(pet.dataset.key))pet.classList.add('sofra-sevinci');
   }
  }
  break;
 }
 case 'hedef-degistir':{
  const ids=durum().sahipler;
  raf.prova=null;raf.hedef=ids[(ids.indexOf(raf.hedef)+Number(key)+ids.length)%ids.length];render();break;
 }
 case 'prova':{
  const rafAlani=app.querySelector('.donanim-raf'),konum=rafAlani.scrollTop;
  raf.prova=raf.prova===key?null:key;
  render();
  app.querySelector('.donanim-raf').scrollTop=konum;
  focusOn('[data-act="prova"][data-key="'+key+'"]');
  break;
 }
 case 'cikar':case 'donat':{
  const rafKonumu=app.querySelector('.donanim-raf')?.scrollTop||0;
  b.disabled=true;
  const sonuc=b.dataset.act==='cikar'?await giysiCikar(b.dataset.id,key):await donat(b.dataset.id,key,Number(b.dataset.fiyat));
  if(sonuc.ok)raf.prova=null;
  if(sonuc.ok)efekt.dogru();
  render();
  const rafAlani=app.querySelector('.donanim-raf');
  if(rafAlani)rafAlani.scrollTop=rafKonumu;
  if(sonuc.ok)app.querySelector('.donanim-portre')?.classList.add('giyindi');
  break;
 }
 case 'toplu-yika':{
  b.disabled=true;
  const result=await topluYika(Number(b.dataset.gun));
  if(!['menu','akvaryum'].includes(state.page))break;
  render();
  if(result.ok){
   efekt.dogru();
   for(const pet of app.querySelectorAll('.hayvana-git')){
    if(result.ids.includes(pet.dataset.key))pet.classList.add('yeni-yikandi');
   }
   app.querySelector('.toplu-yika')?.classList.add('tamamlandi');
  }
  break;
 }
 case 'oda':
  vitrin.ortam=key;vitrin.sayfa=0;go('menu');break;
 case 'akvaryum':vitrin.suSayfa=0;go('akvaryum');break;
 case 'nadir':vitrin.cesitSayfa=Number.MAX_SAFE_INTEGER;render();break;
 case 'sergi-geri':case 'sergi-ileri':case 'cesit-geri':case 'cesit-ileri':
   turnPage(b.dataset.act,durum(),state.page==='akvaryum'||state.page==='baliklar');render();focusOn(`[data-act="${b.dataset.act}"]`);break;
 case 'vakit':case 'gece':{
  const data=durum();
  if(gunIsigi(data)==='gece')openDialog('gece');
  break;
 }
 case 'uyu':{
   b.disabled=true;
   const result=await gunuBitir(Number(b.dataset.gun));
   go('menu');
   if(result.ok){
    for(const id of Object.keys(requests))delete requests[id];
    app.querySelector('.alan')?.classList.add('sabah');
    if(result.ayrilanlar.length)announce('🕊️ '+result.ayrilanlar.map(id=>cesitler[id].ad).join(' · '));
    else announce(`${result.gun}. gün · +${result.kazanc} jeton`,result.kazanc);
   }
   break;
 }
 case 'sat-onay':openDialog('satis',key);break;
 case 'sat':{
   b.disabled=true;
   const result=await hayvanSat(key);
   if(result.ok){
    delete requests[key];
    if(state.id===key){state.id=durum().sahipler[0]||'kopek';state.pet=cesitler[state.id].tur;state.home=cesitler[state.id].ortam;state.dog=cesitler[state.id].index;}
   }
   go(cesitler[key].ortam==='golet'?'akvaryum':'menu');
   if(result.ok){efekt.dogru();announce('Satış · +'+result.kazanc+' jeton',result.kazanc);}
   break;
 }
 case 'satin-al':{
   b.disabled=true;
   const result=await satinAl(key,Number(b.dataset.fiyat));
   if(result.ok){enter(key);efekt.dogru();announce('Yeni dostun geldi!');}
   else{render();if(result.neden==='fiyat')break;announce(result.neden==='yetersiz'?'Biraz daha jeton biriktir':'Zaten dostunuz');}
   break;
 }
 case 'bakima-don':enter(sahipMi(state.id)?state.id:durum().sahipler[0]);break;
 case 'banyo':if(banyoyaGirer(state.pet)){state.drawer=true;go('banyo');}break;
 
 case 'pet':enter(key);break;
 case 'back':back();break;
 case 'magaza':case 'dostlar':case 'baliklar':openShop(b.dataset.act);break;
 case 'erzak':openShop('magaza');break;
 case 'don-sofra':back();break;
 case 'canta-ileri':{const size=Object.keys(names).filter(id=>durum().canta[id]>0).length;bagPage=(bagPage+1)%Math.ceil(size/4);render();break;}
 case 'raf-tab':raf.prova=null;raf.tab=key;raf.sayfa=0;render();break;
  case 'urun-al':{
  const shelfOffset=app.querySelector('.urun-rafi').scrollTop;
  b.disabled=true;const result=await urunAl(key,Number(b.dataset.fiyat));
  if(state.page==='magaza'){render();app.querySelector('.urun-rafi').scrollTop=shelfOffset;
   const kart=app.querySelector(`[data-act="urun-al"][data-key="${key}"]`);
   if(result.ok && kart){kart.classList.add('cantaya-eklendi');if(event.detail===0&&!kart.disabled)kart.focus({preventScroll:true});}
   else if(result.neden==='yetersiz')announce('Jeton yetmiyor');}
  break;
 }
 case 'bowl':state.drawer=true;pantryOpen=true;render();app.querySelector('[data-act=food],[data-act=erzak]')?.focus({preventScroll:true});break;
 case 'play-prop':state.drawer=false;state.action='oyun';render();break;
 case 'prev':case 'next':{const ids=ownedIn(state.home);enter(ids[(ids.indexOf(state.id)+(b.dataset.act==='next'?1:-1)+ids.length)%ids.length]);break;}

 case 'pantry-close':pantryOpen=false;armed='';render();focusOn('[data-key=mama]');break;
 case 'food':chosen=b.dataset.food;armed='mama';render();app.querySelector('[data-act=give]').focus({preventScroll:true});break;
 case 'fullscreen':
   if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
   else document.documentElement.requestFullscreen?.().catch(()=>{});
   break;
 case 'give':if(armed)void give(armed);break;
 case 'drawer':pantryOpen=false;armed='';state.action='';state.pose='bosta';state.drawer=!state.drawer;render();if(event.detail===0)focusOn(state.drawer?(state.page==='banyo'?'[data-key=firca]':'[data-key=mama]'):'[data-act=drawer]');break;
 case 'tedavi':{
   const id=state.id;
   b.disabled=true;
   const result=await tedaviEt(id,b.dataset.satin==='true',Number(b.dataset.fiyat));
   if(state.id===id && state.page==='bakim'){state.drawer=false;tepki(result.ok);}
   break;
 }
 case 'yatir':await yatir();break;
 case 'use':
   if(key==='temizlik'){await recordCare(state.id,key);break;}
   if(key==='kurdele'){const tak=!durum().hayvanlar[state.id].kurdele;await kurdeleTak(state.id,tak);render();announce(tak?'Papyon takıldı':'Papyon çıkarıldı');break;}
   if(key==='oyun'){state.drawer=true;pantryOpen=false;armed='';state.action=state.action===key?'':key;state.pose='bosta';render();break;}
   if(key==='mama'){armed='';pantryOpen=true;state.action='';state.pose='bosta';render();app.querySelector('[data-act=food],[data-act=erzak]')?.focus({preventScroll:true});break;}
   if(key==='su'){
    armed=armed===key?'':key;state.action='';state.pose='bosta';render();
    if(armed)app.querySelector('[data-act=give]').focus({preventScroll:true});
    break;
   }
   if(key==='uyku'){await yatir();break;}
   armed='';state.action=key;state.pose='bosta';render();
   break;
 default:go(b.dataset.act);
 }
});
app.addEventListener('change',event=>{
 const input=event.target;
 if(input.dataset.field){kopekler[state.dog][input.dataset.field]=input.value;try{localStorage.setItem('pati-yeni-kopek-v1',JSON.stringify(kopekler));}catch{}}
 render();
});
geriDinle(()=>{
 if(state.page==='menu'&&!vitrin.dialog)return false;
 back();
 return true;
});
matchMedia(vitrinTelefon).addEventListener('change',()=>{
 if(state.page==='magaza'&&raf.tab==='hayvan')render();
});
void saatiBaslat().then(render);
function saatiGuncelle(){if(!document.hidden&&app.dataset.vakit!==gunIsigi(durum()))isigiGoster();}
setInterval(saatiGuncelle,1000);
document.addEventListener('visibilitychange',saatiGuncelle);

document.addEventListener('keydown',event=>{
 if(['bakim','banyo'].includes(state.page)&&event.key==='Escape'){
  event.preventDefault();back();return;
 }
 if(!vitrin.dialog)return;
 if(event.key==='Escape'){event.preventDefault();back();}
 if(event.key==='Tab'){
  const choices=[...app.querySelectorAll('.sergi-karti button:not(:disabled)')];
  const current=choices.indexOf(document.activeElement),dir=event.shiftKey?-1:1;
  event.preventDefault();choices[(current+dir+choices.length)%choices.length]?.focus();
 }
});


function odaEsyaBagla(esya,id,merak){
 const sahne=esya.parentElement;
 let start=null,kaydir=false;
 esya.onpointerdown=e=>{if(!e.isPrimary||e.button!==0)return;start=e.clientX;kaydir=false;esya.setPointerCapture(e.pointerId);};
 esya.onpointermove=e=>{
  if(start===null||!esya.hasPointerCapture(e.pointerId))return;
  if(Math.abs(start-e.clientX)>8)kaydir=true;
  if(kaydir){const r=sahne.getBoundingClientRect();esya.style.left=Math.max(12,Math.min(88,(e.clientX-r.left)*100/r.width))+'%';}
 };
 esya.onpointerup=()=>{if(start!==null&&kaydir)void dekorTasi(id,esya.dataset.key,parseFloat(esya.style.left));start=null;};
 esya.onpointercancel=()=>{start=null;kaydir=true;esya.style.left=durum().hayvanlar[id].dekorX+'%';};
 esya.onclick=e=>{
  e.stopPropagation();sesMotorunuAc();
  if(kaydir){kaydir=false;return;}
  merak(esya);
 };
}
