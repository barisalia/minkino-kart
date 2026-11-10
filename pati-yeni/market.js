import {giysiAdi,dolapta} from './dolap.js';
import {giysiCizimi,giysiIsigi,isikKatmani} from './giyim.js';
import {cesitler} from './cesitler.js';
import {donanimUygun,urunler,yuvaCizimi} from './urunler.js';
import {names} from './yiyecek.js';
import {durum,haftalikFiyat} from './ilerleme.js';

export const raf={tab:'yiyecek',sayfa:0,hedef:null,kisisel:false,prova:null};
export function urunListesi(){
 if(raf.tab==='esya')return Object.keys(urunler).filter(id=>['esya','ilac'].includes(urunler[id].tip) && urunler[id].rafta!==false);
 return Object.keys(names);
}
export function market({art,symbol,btn,coin,fromBag,istenen,vitrinHTML,animal}){
 const data=durum(),ids=urunListesi();
 if(ids.includes(istenen))ids.unshift(...ids.splice(ids.indexOf(istenen),1));
 const cards=ids.map(id=>{
  const {ad,tip}=urunler[id],fiyat=haftalikFiyat(urunler[id].fiyat,data.gun),owned=data.canta[id]||0;
  const disabled=(tip==='esya'&&owned>0)||data.para<fiyat;
  const stok=owned&&tip!=='esya'?`<small class="rafta-stok" aria-hidden="true">×${owned}</small>`:'';
  const kalp=id===istenen?`<i class="rafta-istek" aria-hidden="true">${art('kalp')}</i>`:'';
  return btn('urun-al',art(id)+kalp+stok+`<span>${tip==='esya'&&owned?'✓':coin(fiyat)}</span>`,`class="urun-kart" data-fiyat="${fiyat}" data-key="${id}" aria-label="${ad} · ${fiyat} jeton${id===istenen?', dostunun istediği':''}${owned?', çantada '+owned:''}" title="${ad}" ${disabled?'disabled':''}`);
 }).join('');
 const reyonlar=[['yiyecek','Yemek',symbol('kase')],['hayvan','Hayvan al',symbol('dostlar')],['esya','Eşyalar',art('firca')],['donanim','Oda ve dolap',art('yuva')]];
 const nav=reyonlar.map(([id,label,ikon])=>btn('raf-tab',ikon,`aria-label="${label}" data-key="${id}" aria-pressed="${raf.tab===id}"`)).join('');
 let icerik;
 if(raf.tab==='hayvan')icerik=vitrinHTML();
 else if(raf.tab==='donanim'){
  const ids=data.sahipler;
  if(!ids.includes(raf.hedef))raf.hedef=ids[0];
  const id=raf.hedef,pet=data.hayvanlar[id];
  if(!pet)icerik=btn('raf-tab',symbol('dostlar'),'aria-label="Hayvan seç" class="bos-donanim" data-key="hayvan"');
  else{
   const {ortam,tur}=cesitler[id];
   const denenmis=raf.prova;
   let secim='<b>'+cesitler[id].ad+'</b>';
   if(denenmis){
    const fiyat=haftalikFiyat(urunler[denenmis].fiyat,data.gun);
    const giyili=pet.kiyafet===denenmis,sahip=pet.kiyafetler.includes(denenmis);
    const islem=giyili?'cikar':'donat';
    const ad=giysiAdi(cesitler[id],denenmis);
    const etiket=giyili?ad+' çıkar':sahip?ad+' giy':ad+' satın al, '+fiyat+' jeton';
    secim=btn(islem,giyili?'↶':sahip?'✓':coin(fiyat),`class="prova-karar" data-id="${id}" data-key="${denenmis}" data-fiyat="${fiyat}" aria-label="${etiket}" ${!sahip&&data.para<fiyat?'disabled':''}`);
   }
   const hedef=`<div class="donanim-hedef">${!raf.kisisel&&ids.length>1?btn('hedef-degistir','‹','data-key="-1" aria-label="Önceki hayvan"'):''}<div class="donanim-portre">${animal(id)}</div>${secim}${!raf.kisisel&&ids.length>1?btn('hedef-degistir','›','data-key="1" aria-label="Sonraki hayvan"'):''}</div>`;
   const grup=Object.keys(urunler).filter(key=>donanimUygun(key,ortam)&&(urunler[key].tip==='kiyafet'?dolapta(cesitler[id],key,pet.kiyafetler):!raf.kisisel)).sort((a,b)=>
    Number(urunler[a].tip==='kiyafet')-Number(urunler[b].tip==='kiyafet')||urunler[a].fiyat-urunler[b].fiyat).map(key=>{
    const urun=urunler[key],fiyat=haftalikFiyat(urun.fiyat,data.gun);
    const yatak=urun.tip==='yuva';
    const sahip=(urun.tip==='dekor'?pet.dekorlar:yatak?pet.yataklar:pet.kiyafetler).includes(key);
    const aktif=(urun.tip==='dekor'?pet.dekor:yatak?pet.yatak:pet.kiyafet)===key;
    const resim=yatak?yuvaCizimi(tur,ortam,key):key;
    if(urun.tip==='kiyafet'){
     const ad=giysiAdi(cesitler[id],key);
     return btn('prova',`<img class="arac" alt="" src="${giysiCizimi(cesitler[id],key)}">`+isikKatmani(giysiIsigi(key))+`<span class="donanim-fiyat">${aktif?'✓':sahip?'↺':coin(fiyat)}</span>`,
      `class="donanim-kart" data-key="${key}" data-id="${id}" aria-label="${ad} dene" aria-pressed="${raf.prova===key}" data-giyili="${aktif}"`);
    }
    return btn('donat',art(resim)+`<span class="donanim-fiyat">${aktif?'✓':sahip?'↺':coin(fiyat)}</span>`,
     `class="donanim-kart" aria-pressed="${aktif}" data-key="${key}" data-id="${id}" data-fiyat="${fiyat}" aria-label="${urun.ad}" ${aktif||(!sahip&&data.para<fiyat)?'disabled':''}`);
   }).join('');
   icerik=`<div class="donanim">${hedef}<div class="donanim-raf">${grup}</div></div>`;
  }
 }else icerik=`<div class="urun-rafi">${cards}</div>`;
 return `<section class="pati-market ${raf.kisisel?'kisisel-dolap':''}">${raf.kisisel?'':'<div class="market-ust"><nav class="mekan-sec" aria-label="Reyon">'+nav+'</nav></div>'}${icerik}${fromBag?btn('don-sofra','‹','class="cantaya-don" aria-label="Çantaya dön"'):''}</section>`;
}
