import './adim.css';
// Durations are for one floor tile. The sprite's native direction is measured
// from the body artwork; the two reptile heads are drawn the other way round.
const hareketler = {
 kopek: ['yuru', 1750, 1], kedi: ['sessiz-adim', 2080, 1],
 hamster: ['minik-adim', 1450, 1], kirpi: ['minik-adim', 2350, 1],
 tavsan: ['sicra', 1830, 1], kus: ['sek', 1620, 1],
 civciv: ['pitirda', 1740, 1], ordek: ['paytak', 2370, 1],
 kaplumbaga: ['agir-adim', 3900, -1], geko: ['surun', 2400, -1],
 balik: ['yuz', 2720, -1], beta: ['suzul', 3350, -1]
};
const kediPostlari = [
 ['#998f90','#5c545a','#fff0de'],['#e99c55','#ae633c','#fff1d5'],['#8c9297','#606873','#eee7dd'],
 ['#f1e8dc','#c29f82','#fff9ef'],['#efeae1','#c7baaa','#fff9ee'],['#c99876','#634237','#f8e6cd']
];

const baslar=import.meta.glob('../assets/pati-yeni/bakis/*.webp',{eager:true,query:'?url',import:'default'});
const adimResimleri=import.meta.glob('../assets/pati-yeni/adim/*.png',{eager:true,query:'?url',import:'default'});
const hazirResimler=new Map();
export function pozlariYukle(tur,kart){
 let adresler=[];
 if(tur==='kopek'||tur==='kedi'){
  adresler=Object.entries(adimResimleri).filter(([yol])=>yol.includes('/'+tur+'-')).map(([,url])=>url);
 }
 if(tur==='kopek'){
  const model=kart.querySelector('.kopek').dataset.model;
  const tip=['pamuk','golge','zeytin'].includes(model)?model:'bas';
  adresler.push(...['tuy','acik','cizgi'].map(k=>baslar['../assets/pati-yeni/bakis/'+tip+'-'+k+'.webp']));
 }
 return Promise.all(adresler.map(url=>{
  if(!hazirResimler.has(url)){
   const resim=new Image();resim.src=url;
   hazirResimler.set(url,resim.decode());
  }
  return hazirResimler.get(url);
 }));
}

function yanBakis(kart,tur){
 const url=isim=>baslar['../assets/pati-yeni/bakis/'+isim+'.webp'];
 if(tur==='kopek'){
  const kukla=kart.querySelector('.kopek'),orijinal=kukla.querySelector('.kafa.normal');
  const ad=['pamuk','golge','zeytin'].includes(kukla.dataset.model)?kukla.dataset.model:'bas';
  const bas=orijinal.cloneNode(true);
  bas.className='parca kafa yan-bas';
  for(const renk of ['tuy','acik','cizgi']){
   bas.querySelector('.'+renk).style.setProperty('--resim','url("'+url(ad+'-'+renk)+'")');
  }
  orijinal.after(bas);
 }else if(tur==='kirpi'){
  const yuz=kart.querySelector('.yuz'),yan=yuz.cloneNode(false);
  yan.classList.add('yan-bas');yan.src=url(kart.querySelector('.kukla').dataset.model);
  yuz.after(yan);
 }
}

// Pivot the existing illustrated paws at their joints. Each skin keeps its
// own webbing, claws, bands and colours in every frame of the stride.
const eklemler={
 hamster:[.82,[0,.5,1]], kirpi:[.77,[0,.32,.65,1]], tavsan:[.79,[0,.5,1]],
 kus:[.78,[0,.5,1]], civciv:[.74,[0,.5,1]], ordek:[.70,[0,.50,1]],
 geko:[.73,[0,.31,.64,1]], kaplumbaga:[.67,[0,.34,.71,1]]
};
function eklemHazirla(kart,tur){
 const balik=tur==='balik'||tur==='beta';
 const resim=kart.querySelector(balik?'.butun-balik':'img.beden');
 if(!resim || (!balik&&!eklemler[tur]))return;
 if(balik){
  const yuzgec=resim.cloneNode(false);
  yuzgec.classList.add('kuyruk-kesit');
  yuzgec.setAttribute('aria-hidden','true');
  resim.after(yuzgec);
  return;
 }
 const [y,sinir]=eklemler[tur];
 const giysi=kart.querySelector('.giyim-kalibi');
 const kumas=giysi?.querySelector('.giyili');
 giysi?.style.setProperty('--eklem-y',y*100+'%');
 resim.style.setProperty('--eklem-y',y*100+'%');
 for(let i=0;i<sinir.length-1;i++){
  const parca=resim.cloneNode(false);
  parca.classList.add('ayak-kesit');
  parca.setAttribute('aria-hidden','true');
  parca.style.setProperty('--sol',sinir[i]*100+'%');
  parca.style.setProperty('--sag',(1-sinir[i+1])*100+'%');
  parca.style.setProperty('--kok',(sinir[i]+sinir[i+1])*50+'%');
  parca.style.setProperty('--gecikme',i%2?'-.5':'0');
  resim.after(parca);
  if(kumas){
   const manset=document.createElement('span');
   manset.className='beden ayak-kesit giysi-kesiti';
   manset.setAttribute('aria-hidden','true');
   manset.style.cssText=parca.style.cssText;
   manset.style.backgroundImage='url("'+kumas.src+'")';
   giysi.after(manset);
  }
 }
}

function adimGovdesi(kart,tur){
 if(!['kopek','kedi'].includes(tur))return;
 const kukla=kart.querySelector('.kopek,.kukla');
 const govde=kart.querySelector(tur==='kopek'?'.govde':'img.beden');
 const kat=document.createElement('span');
 kat.setAttribute('aria-hidden','true');
 kat.className=tur==='kopek'?'adim-cizimi':'beden adim-cizimi';
 if(tur==='kedi'){
  const index=Number(kukla.dataset.model.split('-')[1]||1)-1;
  const [tuy,kulak,acik]=kediPostlari[index]||kediPostlari[0];
  for(const [key,value] of Object.entries({tuy,kulak,acik}))kat.style.setProperty('--'+key,value);
 }
 for(const renk of ['tuy','kulak','acik','cizgi']){
  const boya=document.createElement('i');
  boya.className='adim-'+renk;
  kat.append(boya);
 }
 if(tur==='kopek')govde.append(kat);else govde.after(kat);
}

export function parkurAdimi(kart,tur){
 yanBakis(kart,tur);
 adimGovdesi(kart,tur);
}

// Starting slots and destinations share the same floor. Reserve both ends until
// a step finishes, so intersecting paths never compete for a tap target.
export function suruyuGezdir(alan,modal){
 if(!alan)return;
 const kartlar=[...alan.querySelectorAll('.sergi-yeri')];
 if(!kartlar.length)return;
 const sutun=kartlar.length>6?6:kartlar.length>3?4:3;
 const rota=sutun===6?[1,9,4,6,2,11,0,8,5,10]:sutun===4?[1,6,3,4,0,7]:[4,0,2];
 const azalt=matchMedia('(prefers-reduced-motion: reduce)');
 alan.style.setProperty('--iz-genislik',Math.min(30,90/sutun)+'%');
 function nokta(slot){
  const row=Math.floor(slot/sutun),col=slot%sutun;
  return {x:((col+.5)/sutun)*100,y:row?91-(col%3)*4:44+(col%3)*4};
 }
 const suru=kartlar.map((el,i)=>{
  const tur=el.dataset.aile,slot=rota[i];
  const kilitli=!!el.querySelector('.hareket-uyu,.hasta-pati');
  const [hareket,hiz,tabanYon]=hareketler[tur];
  el.dataset.hareket=hareket;
  const hayvan={el,tur,slot,hiz,tabanYon,onceki:-1,hedef:null,bekle:1900+i*1120+Math.random()*1400,t:0,kilitli};
  eklemHazirla(el,tur);
  yanBakis(el,tur);
  adimGovdesi(el,tur);
  hayvan.hazir=false;
  pozlariYukle(tur,el).then(()=>{hayvan.hazir=true;}).catch(()=>{hayvan.kilitli=true;});
  const yatak=el.querySelector('.alan-yatagi');
  const yer=nokta(slot);
  alan.prepend(yatak);
  yatak.style.left=yer.x+'%';yatak.style.top=yer.y+'%';
  yatak.style.zIndex=String(Math.round(yer.y)-1);
  yerlestir(hayvan,nokta(slot));
  return hayvan;
 });
 function yerlestir({el},pos){
  el.style.left=pos.x+'%';el.style.top=pos.y+'%';
  el.style.setProperty('--derinlik',(0.80+pos.y*.0022).toFixed(3));
  el.style.zIndex=String(Math.round(pos.y));
 }
 function sec(h){
  const dolu=new Set(suru.flatMap(p=>[p.slot,p.hedef]));
  const komsu=[];
  if(h.slot%sutun)komsu.push(h.slot-1);
  if(h.slot%sutun<sutun-1)komsu.push(h.slot+1);
  // A diagonal is allowed only through an empty square. Two animals cannot
  // cross through the same corner while changing rows.
  if(!suru.some(p=>p.hedef!==null)){
   const dikey=h.slot<sutun?sutun:-sutun;
   for(const yan of [...komsu]){
    if(!dolu.has(yan)&&!dolu.has(h.slot+dikey))komsu.push(yan+dikey);
   }
  }
  const bos=komsu.filter(s=>s>=0&&s<sutun*2&&!dolu.has(s));
  const ileri=bos.filter(s=>s!==h.onceki);
  const adaylar=ileri.length?ileri:bos;
  return adaylar[Math.floor(Math.random()*adaylar.length)];
 }
 const sinir=kartlar.length>=7?2:1;
 let son=performance.now();
 function kare(simdi){
  if(!alan.isConnected)return;
  const dt=Math.min(60,simdi-son);son=simdi;
  if(!document.hidden&&!azalt.matches&&!modal)for(const h of suru){
   if(!h.hazir||h.kilitli||h.el.matches(':hover,:active,:focus-within'))continue;
   if(h.hedef===null){
    h.bekle-=dt;
    if(h.bekle>0)continue;
    const yolda=suru.filter(p=>p.hedef!==null);
    if(yolda.length>=sinir || yolda.some(p=>Math.floor(p.slot/sutun)===Math.floor(h.slot/sutun)||Math.floor(p.hedef/sutun)===Math.floor(h.slot/sutun)))continue;
    const hedef=sec(h);
    if(hedef===undefined){h.bekle=350;continue;}
    h.hedef=hedef;h.t=0;
    const a=nokta(h.slot),b=nokta(hedef);
    h.sure=h.hiz*Math.hypot((b.x-a.x)*sutun/100,(b.y-a.y)/65);
    const yon=Math.sign(b.x-a.x);
    h.el.style.setProperty('--yon',String(yon*h.tabanYon));
    h.el.dataset.bakis=yon>0?'sag':'sol';
    h.el.style.setProperty('--egim',Math.sign(b.y-a.y)*h.tabanYon*3+'deg');
    h.el.classList.add('yoneldi');
    h.hazirlik=260;
   }
   if(h.hazirlik>0){h.hazirlik-=dt;continue;}
   h.el.classList.add('adimli');
   h.t=Math.min(1,h.t+dt/h.sure);
   const f=h.t*h.t*(3-2*h.t),a=nokta(h.slot),b=nokta(h.hedef);
   yerlestir(h,{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f});
   h.el.classList.toggle('ters-adim',Math.floor(h.t*h.sure/185)%2===1);
   if(h.t===1){
    h.onceki=h.slot;h.slot=h.hedef;h.hedef=null;
    h.bekle=11000+Math.random()*15000;
    h.el.classList.remove('adimli','ters-adim','yoneldi');
   }
  }
  if(!modal)requestAnimationFrame(kare);
 }
 if(!modal)requestAnimationFrame(kare);
}
