import {yuvaCizimi} from './urunler.js';
import {aileler,cesitler} from './cesitler.js';
import {alisFiyati,gunGelirleri,haftalikFiyat,haftaSofrasi,yikanacaklar} from './ilerleme.js';

export const vitrin = {ortam:'ev',tur:'kopek', sayfa:0, suSayfa:0, cesitSayfa:0, dialog:null};
export const vitrinTelefon = '(max-width: 900px), (max-height: 520px)';
const roomSize = 10;
const isWater = id => cesitler[id]?.ortam === 'golet';
const roomIds = (data, water) => data.sahipler.filter(id => cesitler[id].ortam === (water?'golet':vitrin.ortam));
const familySize = () => globalThis.matchMedia?.(vitrinTelefon).matches ? 10 : 18;
const pageCount = (length, size) => Math.max(1, Math.ceil(length / size));

function vitrinSayfalari(ids){
 const boyut=familySize(),normal=ids.slice(0,-3),sayfalar=[];
 for(let i=0;i<normal.length;i+=boyut)sayfalar.push(normal.slice(i,i+boyut));
 return [...sayfalar,ids.slice(-3)];
}

export function showPage(id, data) {
 const water = isWater(id);
 if(!water)vitrin.ortam=cesitler[id].ortam;
 const index = roomIds(data, water).indexOf(id);
 vitrin[water ? 'suSayfa' : 'sayfa'] = Math.max(0, Math.floor(index / roomSize));
}

export function turnPage(act, data, water = false) {
 const familyPage = act.startsWith('cesit-');
 const key = familyPage ? 'cesitSayfa' : water ? 'suSayfa' : 'sayfa';
 const total = familyPage ? aileler[vitrin.tur].ids.length : roomIds(data, water).length;
 const pages = familyPage?vitrinSayfalari(aileler[vitrin.tur].ids).length:pageCount(total,roomSize);
 vitrin[key] = (vitrin[key] + (act.endsWith('ileri') ? 1 : -1) + pages) % pages;
}

function pager(btn, prefix, page, pages) {
 if (pages <= 1) return '';
 return `<div class="sergi-sayfa ${prefix}-gezinme">${btn(prefix+'-geri','‹','aria-label="Önceki hayvanlar"')}<span aria-live="polite">${page+1} / ${pages}</span>${btn(prefix+'-ileri','›','aria-label="Sonraki hayvanlar"')}</div>`;
}

function petImage(id, animal, pose='normal', classes='') {
 return `<span class="sergi-hayvan${classes}${isWater(id) ? ' yuzucu' : ''}">${animal(id,pose)}</span>`;
}

function illustratedButton(btn, act, icon, label, style) {
 return btn(act,icon,`class="sergi-dugme ${style}" aria-label="${label}" title="${label}"`);
}

function ownedCards({data, animal, coatState, btn, art}, ids) {
 return ids.map((id,i) => {
  const pet = data.hayvanlar[id], model = cesitler[id];
  const yatak=yuvaCizimi(model.tur,model.ortam,pet.yatak);
  return `<article class="sergi-yeri" data-metal="${model.madalya}" data-aile="${model.tur}" style="--faz:-${(i*1.73+model.index*.39).toFixed(2)}s;--sure:${6+i%4}s"><div class="alan-yatagi" aria-hidden="true">${art(yatak)}</div>${btn('pet',petImage(id,animal,pet.bakimlar.includes('uyku')?'uyku':'normal',coatState(id)+(pet.bakimlar.includes('uyku')?' hareket-uyu':'')),`class="hayvana-git" data-key="${id}" aria-label="${model.ad}, bakıma git"`)}
    ${btn('kart','<i aria-hidden="true">⋯</i>',`class="sergi-isim" data-key="${id}" aria-label="${model.ad}, bakım ve satış kartı"`)}</article>`;
 }).join('');
}

const odalar={ev:'Ev',bahce:'Bahçe',teraryum:'Teraryum',golet:'Akvaryum'};

function yasamAlani(views,water){
 const {data,btn,symbol,moon,coin}=views,oda=water?'golet':vitrin.ortam;
 const owned=roomIds(data,water), pages=pageCount(owned.length,roomSize);
 const pageKey=water?'suSayfa':'sayfa';
 const page=vitrin[pageKey]=Math.min(vitrin[pageKey],pages-1);
 const ids=owned.slice(page*roomSize,(page+1)*roomSize);
 const keys=Object.keys(odalar),index=keys.indexOf(oda);
 const tabs=[-1,1].map(step=>{
  const key=keys[(index+step+keys.length)%keys.length];
  return btn(key==='golet'?'akvaryum':'oda','<i aria-hidden="true"></i>',
   `class="harita-ok ${step<0?'sol':'sag'}" data-key="${key}" aria-label="${odalar[key]}"`);
 }).join('');
 const fiyat=haftalikFiyat(10,data.gun);
 const wash=water?'':btn('toplu-yika',symbol('banyo')+coin(fiyat),
  `class="sergi-dugme toplu-yika" data-gun="${data.gun}" aria-label="Tüm uyanık kara hayvanlarını temizle, ${fiyat} jeton" ${data.para<fiyat||!yikanacaklar(data).length?'disabled':''}`);
 const sofra=haftaSofrasi(data);
 const feed=btn('toplu-besle',symbol('kase')+(sofra.bedava?'<small>★</small>':'<small>×'+sofra.ids.length+'</small>'),`class="sergi-dugme haftalik-sofra" data-gun="${data.gun}" data-ucretsiz="${sofra.bedava}" aria-label="${sofra.bedava?'Haftalık ücretsiz toplu yemek':'Çantadan toplu yemek ver'}" ${sofra.hazir?'':'disabled'}`);
 const market=illustratedButton(btn,'magaza',symbol('magaza'),'Mağaza','dukkan');
 const end=illustratedButton(btn,'gece',`<img src="${moon}" alt="">`,'Uyu ve günü bitir','gece');
 const count=ids.length;
 const perRow=count>5?Math.ceil(count/2):Math.max(1,count);
 return `<section class="alan alan-${oda}" aria-label="${odalar[oda]}"><nav class="harita-yonleri" aria-label="Yaşam alanları">${tabs}</nav>
 <div class="alan-surusu ${count>5?'iki-sira':'tek-sira'}" style="--sutun:${perRow}">${ownedCards(views,ids)}</div></section>
 <footer class="sergi-alt alan-alt"><div class="sergi-araclar">${market}${feed}${wash}</div>${pager(btn,'sergi',page,pages)}${end}</footer>`;
}
export const showroom=views=>yasamAlani(views,false);
export const akvaryum=views=>yasamAlani(views,true);

export function dostVitrini({data, animal, btn, coin}, water = false) {
 const families = Object.entries(aileler);
 const [tur, family] = families.find(([key]) => key === vitrin.tur) || families[0];
 vitrin.tur = tur;
 const sayfalar=vitrinSayfalari(family.ids),pages=sayfalar.length;
 vitrin.cesitSayfa=Math.min(vitrin.cesitSayfa,pages-1);
 const ids=sayfalar[vitrin.cesitSayfa];
 const strip = families.map(([key, model]) => btn('aile',petImage(model.ids[0],animal)+(water?`<b>${model.ad}</b>`:''),`class="tur-sec" data-key="${key}" aria-label="${model.ad}" aria-pressed="${key===tur}"`)).join('');
 const cards = ids.map(id => {
  const model = cesitler[id], own = !!data.hayvanlar[id];
  const price = alisFiyati(id,data);
  const derece={Bronz:3,'Gümüş':2,'Altın':1}[model.madalya];
  const rozet=derece?`<span class="derece" aria-hidden="true">${derece}</span>`:'';
  return btn(own?'kart':'incele',rozet+petImage(id,animal)+`<b>${model.ad}</b><span class="sergi-fiyat">${own?'✓':coin(price)}</span>`,`class="cesit-sec seviye-${model.index}" data-metal="${model.madalya}" data-key="${id}" aria-label="${model.ad}, ${derece?derece+'. sıra, ':''}${own?'sende':price+' jeton'}"`);
 }).join('');
 return `<section class="cesit-vitrini${water?' su-vitrini':''}"><nav class="tur-seridi" aria-label="${water?'Balık':'Hayvan'} türü">${strip}</nav><div class="cesit-sirasi ${ids===sayfalar[pages-1]?'son-uclu':'iki-raf'}" style="--vitrin-kart:${ids.length}" aria-label="${family.ad} çeşitleri">${cards}</div><div class="vitrin-alt">${pager(btn,'cesit',vitrin.cesitSayfa,pages)}${btn('nadir','✦','class="nadir-gecit" aria-label="En değerli üç çeşit"')}</div></section>`;
}
export function showDialog({data,animal,btn,coin,moon}){
 const {tip,id}=vitrin.dialog;
 const close=btn('vazgec','×','class="vazgec" aria-label="Kapat"');
 let body='';
 if(tip==='gece'){
  const gelirler=gunGelirleri(data),sum=gelirler.reduce((n,p)=>n+p.gelir,0);
  const rows=gelirler.map(({id,gelir,veda,hasta,uyudu})=>
   `<li><span>${veda?'🕊️ ':''}${cesitler[id].ad}${hasta?' · Hasta':!uyudu?' · Uyanık':''}</span><strong>${gelir} puan</strong></li>`).join('');
  body=`<img class="gece-ay" alt="" src="${moon}"><h2 id="dost-adi">${data.gun}. gün</h2><ul class="gelir-listesi">${rows}</ul>
  ${btn('uyu','Günü bitir '+coin('+'+sum),`class="karar" data-gun="${data.gun}"`)}`;

 }else{
  const model=cesitler[id],pet=data.hayvanlar[id];
  const hero=petImage(id,animal);
  let actions;
  if(tip==='satis'){
   actions=`<p>${isWater(id)?'Akvaryumdan':'Showroom’dan'} ayrılacak.</p>${btn('sat','Sat '+coin(haftalikFiyat(model.satis,data.gun)),`data-key="${id}" class="karar sat"`)}`;
  }else if(pet){
   const count=pet.ogrenilen.length;
   actions=`<div class="kart-kararlar">${btn('pet','Bakıma git',`data-key="${id}" class="karar"`)}${btn('sat-onay','Sat '+coin(haftalikFiyat(model.satis,data.gun)),`data-key="${id}" class="karar sat" ${count<2?'disabled':''}`)}</div>${count<2?`<p>Satış için ${2-count} farklı bakım daha.</p>`:''}`;
  }else{
   const price=alisFiyati(id,data),missing=Math.max(0,price-data.para);
   actions=missing?`<p>Fiyat ${price} · ${missing} jeton eksik</p>${(data.sahipler.length ? btn('bakima-don','Bakıma git','class="karar"') : btn('vazgec','Kapat','class="karar"'))}`:btn('satin-al','Sahiplen '+coin(price),`data-fiyat="${price}" data-key="${id}" class="karar"`);
  }
  body=`${hero}<h2 id="dost-adi">${model.ad}</h2><p class="kart-getiri">${aileler[model.tur].ad} · Bakımla +${model.gelir} / gün${model.sogukDirenci?' · ❄ −'+Math.round(model.sogukDirenci*100)+'%':''}</p>${actions}`;
 }
 return `<div class="onay-perdesi"><section class="sergi-karti ${tip==='gece'?'gece-karti':''}" role="dialog" aria-modal="true" aria-labelledby="dost-adi">${close}${body}</section></div>`;
}
