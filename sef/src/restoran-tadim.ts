import {arkadasAgizlari,salonArkadasi} from './restoran-karakterleri';
import {siradakiLokma,krepLokmasi} from './lokmali-porsiyon';
import {alinanCeyrekler,ceyrekKonumu} from './pizza-kesimi';
import {yeniPortre} from './misafir';
import { h } from '../../src/ui/dom';
import { kaynak } from './gorsel';
import type { Parca } from './tepsi-fisleri';
import {susKonumu} from './tatli-sunumu';
import {kumpirLokmasi} from './kumpir-gorseli';
import { tatliMi } from './tatli-ekonomi';
import './restoran-tadim.css';

const agizlar = import.meta.glob<string>('../../assets/sef/agiz/*-tesekkur-{acik,kapali}.webp',{eager:true,query:'?url',import:'default'});
// Çizilmiş açık ağız pozlarında dudak merkezleri, resmin kendi ölçüsünde.
const catal=kaynak('nesneler','lokma-catali');
const tavukLokmalari=import.meta.glob<string>('../../assets/sef/tepsi/tavuk/{pisti,fazla,yanik,tabak}.webp',{eager:true,query:'?url',import:'default'});
const tavukResmi=(id:string)=>tavukLokmalari['../../assets/sef/tepsi/tavuk/'+id+'.webp'];
const makarnaTabagi=new URL('../../assets/sef/makarna/tabak.webp',import.meta.url).href;
const bosTabaklar={
  sis:new URL('../../assets/sef/sis/tabak.webp',import.meta.url).href,
  mucver:new URL('../../assets/sef/mucver/tabak.webp',import.meta.url).href,
  krep:new URL('../../assets/sef/krep/tabak.webp',import.meta.url).href,
};
const makarnaYerleri=[[.34,.39],[.66,.38],[.50,.64]] as const;
const dudaklar = {...arkadasAgizlari,mino:[.65,.49],lokum:[.36,.51],dede:[.40,.49],baba:[.47,.61],babaanne:[.64,.76],anne:[.58,.60],kino:[.62,.60]} as const;
const pizzaPozlari=import.meta.glob<string>('../../assets/sef/tepsi/tadim/*.webp',{eager:true,query:'?url',import:'default'});

const pizzaDilimSayisi=(el:HTMLElement)=>el.dataset.dilim==='4'?4:5;
function tartYayi(sira:number){
  return -Math.PI/2+sira*2*Math.PI/3;
}
function tartDiliminiKaldir(tam:HTMLCanvasElement,isirik:HTMLCanvasElement,sira:number){
  const c=tam.getContext('2d')!, en=tam.width,boy=tam.height;
  c.save();c.scale(en,boy);c.translate(.5,.5);
  c.globalCompositeOperation='destination-in';
  c.beginPath();c.moveTo(0,0);c.arc(0,0,1,tartYayi(sira),tartYayi(sira+1));c.closePath();c.fill();c.restore();
  const p=c.getImageData(0,0,en,boy).data;
  let sol=en,sag=0,ust=boy,alt=0;
  for(let y=0;y<boy;y++)for(let x=0;x<en;x++){
    if(p[(y*en+x)*4+3]<32)continue;
    sol=Math.min(sol,x);sag=Math.max(sag,x);ust=Math.min(ust,y);alt=Math.max(alt,y);
  }
  if(sol>sag)return;
  const parca=c.getImageData(sol,ust,sag-sol+1,alt-ust+1);
  tam.width=isirik.width=parca.width;tam.height=isirik.height=parca.height;
  tam.getContext('2d')!.putImageData(parca,0,0);
  const kalan=isirik.getContext('2d')!;kalan.putImageData(parca,0,0);
  kalan.globalCompositeOperation='destination-out';kalan.beginPath();
  kalan.ellipse(en*.5-sol,boy*.5-ust,en*.09,boy*.11,0,0,Math.PI*2);kalan.fill();
}
function ilkDilimYonu(pizza:HTMLElement){
  if(pizzaDilimSayisi(pizza)===4)return -Math.PI*.75;
  const ilk=pizza.querySelector<HTMLImageElement>('img.pz-parca');
  return ilk?Math.atan2(parseFloat(ilk.style.top)-50,parseFloat(ilk.style.left)-50):Math.PI/2;
}
function ceyrekSirasi(pizza:HTMLElement){return Array.from(pizza.dataset.alinan??'',Number);}
function siradakiDilim(pizza:HTMLElement,adet:number,secim?:number){
  if(pizzaDilimSayisi(pizza)!==4)return adet;
  const alinan=ceyrekSirasi(pizza);
  return secim!==undefined&&!alinan.includes(secim)?secim:([0,1,2,3].find(i=>!alinan.includes(i))??0);
}
function pizzadaKalan(pizza:HTMLElement,adet:number,ceyrekler?:number[]){
  const adetler=pizzaDilimSayisi(pizza),pizzaAci=Math.PI/adetler;
  if(adet>=adetler){pizza.style.visibility='hidden';return;}
  if(adetler===4&&ceyrekler){
    const renk=(i:number)=>ceyrekler.includes(i)?'transparent':'#000';
    pizza.style.maskImage='conic-gradient('+[1,2,3,0].map((n,i)=>renk(n)+' '+(90*i)+'deg '+(90*(i+1))+'deg').join(',')+')';
    return;
  }
  const bas=ilkDilimYonu(pizza)-pizzaAci,kesim=bas+adet*2*pizzaAci;
  const kenar=(a:number)=>(50+95*Math.cos(a))+'% '+(50+95*Math.sin(a))+'%';
  const dis=Array.from({length:25},(_,i)=>kenar(kesim+i*(bas+2*Math.PI-kesim)/24));
  pizza.style.clipPath='polygon(50% 50%, '+dis.join(', ')+')';
}
/** Capture the actual sauce, size, rotation and doneness before lifting this wedge. */
async function pizzaDilimle(pizza:HTMLElement,alet:HTMLElement,adet:number) {
  const gorseller=Array.from(pizza.querySelectorAll('img'));
  await Promise.all(gorseller.map(img=>img.decode()));
  if(!alet.isConnected||!gorseller.length)return;
  const butun=document.createElement('canvas');
  butun.width=butun.height=360;
  const c=butun.getContext('2d')!;
  const olcek=360/Math.max(1,pizza.getBoundingClientRect().width);
  for(const img of gorseller){
    const stil=getComputedStyle(img);
    c.save();
    c.filter=stil.filter;
    if(img.classList.contains('pz-parca')){
      const w=parseFloat(stil.width)*olcek,h=parseFloat(stil.height)*olcek;
      c.translate(parseFloat(img.style.left)*3.6,parseFloat(img.style.top)*3.6);
      c.rotate(parseFloat(stil.getPropertyValue('--pz-aci')||'0')*Math.PI/180);
      const oran=stil.objectFit==='contain'?Math.min(w/img.naturalWidth,h/img.naturalHeight):0;
      const en=oran?img.naturalWidth*oran:w,boy=oran?img.naturalHeight*oran:h;
      c.drawImage(img,-en/2,-boy/2,en,boy);
    }else{
      const kenar=img.classList.contains('pz-pesto')?360*.04:0;
      c.drawImage(img,kenar,kenar,360-2*kenar,360-2*kenar);
    }
    c.restore();
  }
  const aci=Math.PI/pizzaDilimSayisi(pizza),yon=ilkDilimYonu(pizza)+adet*2*aci;
  for(const isirik of [false,true]){
    const dilim=h('canvas.restoran-pizza-dilim',{width:pizzaDilimSayisi(pizza)===4?266:228,height:192,'data-isirik':String(isirik)});
    const firca=dilim.getContext('2d')!;
    firca.translate(dilim.width/2,5);
    firca.beginPath();
    firca.moveTo(0,0);
    firca.arc(0,0,178,Math.PI/2-aci,Math.PI/2+aci);
    firca.closePath();
    firca.save();firca.clip();
    firca.rotate(Math.PI/2-yon);firca.drawImage(butun,-180,-180);
    firca.restore();
    firca.lineWidth=4;firca.strokeStyle='#231c19';firca.lineJoin='round';firca.stroke();
    if(isirik){
      firca.globalCompositeOperation='destination-out';
      firca.beginPath();firca.ellipse(0,0,30,31,0,0,2*Math.PI);firca.fill();
      firca.globalCompositeOperation='source-atop';
      firca.lineWidth=4;firca.stroke();
    }
    alet.append(dilim);
  }

}

function lokmayiHazirla(tabak:HTMLElement,parca:Parca){
  const nesne=h('span.restoran-lokma',{'aria-hidden':true,'data-tur':parca});
  if(parca==='minik-kek'){
    const kek=tabak.querySelector<HTMLElement>('.mk-kek');
    if(kek){
      const lokma=kek.cloneNode(true) as HTMLElement;
      nesne.classList.add('restoran-tatli-lokmasi','mk-lokma');
      nesne.dataset.lokma=tabak.dataset.lokmaAdedi??'0';
      const sus=tabak.querySelector<HTMLImageElement>('.tatli-susu');
      if(sus){lokma.append(sus.cloneNode());nesne.dataset.sus=sus.dataset.sus;}
      if(kek.closest('.pastane-porsiyonu')?.getAttribute('data-fazla')==='true')nesne.dataset.fazla='true';
      nesne.append(h('img.restoran-kasik',{src:catal,alt:''}),lokma);return nesne;
    }
  }
  if(parca==='kurabiye'){
    const tane=tabak.querySelector<HTMLElement>('.kb-dizi>.kb-tane:not([hidden])');
    if(tane){
      nesne.classList.add('restoran-tatli-lokmasi','kb-lokma');
      const lokma=tane.cloneNode(true) as HTMLElement;
      if(tane.parentElement?.firstElementChild===tane){
        const sus=tabak.querySelector<HTMLImageElement>('.tatli-susu');
        if(sus){lokma.append(sus.cloneNode());nesne.dataset.sus=sus.dataset.sus;}
      }
      if(tabak.querySelector('.pastane-porsiyonu')?.getAttribute('data-fazla')==='true')nesne.dataset.fazla='true';
      nesne.append(lokma);return nesne;
    }
  }
  const krep=parca==='krep'&&krepLokmasi(tabak);
  if(krep){nesne.append(h('img.restoran-kasik',{src:catal,alt:''}),krep);return nesne;}
  const lokma=siradakiLokma(tabak);
  if(lokma){
    nesne.append(h('img.restoran-kasik',{src:catal,alt:''}),h('img.restoran-kasik-ici',{src:lokma.href.baseVal,alt:''}));
    return nesne;
  }
  if(parca==='sutlac'){
    const yuzey=tabak.querySelector<HTMLElement>('.sl-ic');
    if(yuzey){
      const kopya=yuzey.cloneNode(true) as HTMLElement;
      kopya.removeAttribute('style');kopya.removeAttribute('data-lokma');
      const dilim=h('span.sl-kasik-lokmasi',{'data-lokma':tabak.dataset.lokmaAdedi??'0'},kopya);
      nesne.append(h('img.restoran-kasik',{src:kaynak('nesneler','kasik'),alt:''}),dilim);
    }
    return nesne;
  }
  if(parca==='menemen'){
    const tabakLokmasi=tabak.querySelector<HTMLElement>('.mn-porsiyon:not([hidden])');
    if(tabakLokmasi){
      const dilim=h('span.mn-kasik-lokmasi',{'data-lokma':tabakLokmasi.dataset.lokma},tabakLokmasi.cloneNode(true));
      nesne.append(h('img.restoran-kasik',{src:catal,alt:''}),dilim);
    }
    return nesne;
  }
  if(parca==='durum'){
    const dilim=tabak.querySelector<HTMLElement>('.dr-kesit:not([hidden])');
    if(dilim){const lokma=dilim.cloneNode(true) as HTMLElement;lokma.classList.add('dr-catal-lokmasi');nesne.append(h('img.restoran-kasik',{src:catal,alt:''}),lokma);return nesne;}
  }
  if(parca==='omlet'){
    const omlet=tabak.querySelector<HTMLElement>('.om-yemek');
    if(omlet){
      const dilim=h('span.om-catal-lokmasi',{},omlet.cloneNode(true));
      dilim.dataset.lokma=tabak.dataset.lokmaAdedi??'0';
      nesne.append(h('img.restoran-kasik',{src:catal,alt:''}),dilim);
    }
    return nesne;
  }
  if(parca==='manti'){
    const lokma=tabak.querySelector('.manti-lokma:not([hidden])');
    if(lokma){const parca=lokma.cloneNode(true) as HTMLElement;parca.className='manti-tadim';parca.removeAttribute('style');nesne.append(h('img.restoran-kasik',{src:catal,alt:''}),parca);}
    return nesne;
  }
  if(parca==='kumpir'){
    const konum=kumpirLokmasi(tabak);
    nesne.append(h('img.restoran-kasik',{src:kaynak('nesneler','kasik'),alt:''}),
      h('img.restoran-kasik-ici.kp-kasik-pure',{src:new URL('../../assets/sef/kumpir/lokma.webp',import.meta.url).href,alt:''}));
    if(konum.ic){const kat=konum.ic.cloneNode() as HTMLImageElement;kat.className='restoran-kasik-ici kp-kasik-dolgu';kat.removeAttribute('style');nesne.append(kat);}
    return nesne;
  }
  if(parca==='simit'){
    const simit=tabak.querySelector('img.simit-halkasi');
    if(simit){
      nesne.dataset.lokmaAdedi=tabak.dataset.lokmaAdedi??'0';
      nesne.append(simit.cloneNode());return nesne;
    }
  }
  if(parca==='tost'){
    const tost=tabak.querySelector('.tost-yigin');
    if(tost){
      nesne.classList.add('restoran-tost-lokmasi');
      nesne.dataset.lokmaAdedi=tabak.dataset.lokmaAdedi??'0';
      nesne.append(tost.cloneNode(true));return nesne;
    }
  }
  const smoothie=parca==='icecek'&&tabak.querySelector<HTMLElement>('.sm-bardak,.sikma-servis-bardagi');
  if(smoothie){
    const bardak=smoothie.cloneNode(true) as HTMLElement;
    bardak.classList.remove('tepsi-gida');bardak.classList.add('restoran-bardak');
    nesne.append(bardak);return nesne;
  }
  const asil=tabak.querySelector<HTMLImageElement>('.tabaktaki-tatli, :scope > img:not(.tepsi-servis-buhari):not(.lokma-tutamaci):not(.kalan-tavuk)');
  if(parca==='icecek' && asil){
    nesne.append(h('img.restoran-bardak',{src:asil.currentSrc||asil.src,alt:''}));
    return nesne;
  }
  if(asil&&tatliMi(parca)){
    nesne.classList.add('restoran-tatli-lokmasi');
    nesne.dataset.fazla=String(asil.closest('.pastane-porsiyonu')?.getAttribute('data-fazla')==='true');
    const sus=tabak.querySelector<HTMLImageElement>('.tatli-susu');
    const meyveler=Array.from(tabak.querySelectorAll<HTMLImageElement>('.tatli-katlari .tart-dilimi'));
    if(sus)nesne.dataset.sus=sus.dataset.sus;
    const tam=h('canvas',{'data-isirik':'false'});
    const isirik=h('canvas',{'data-isirik':'true'});
    const oncekiIsirik=Math.min(2,Number(tabak.dataset.lokmaAdedi??0));
    nesne.append(tam,isirik);
    void Promise.all([asil.decode(),sus?.decode(),...meyveler.map(m=>m.decode())]).then(()=>{
      const gen=240,boy=Math.round(gen*asil.naturalHeight/asil.naturalWidth);
      tam.width=isirik.width=gen;tam.height=isirik.height=boy;
      const c=tam.getContext('2d')!;
      if(nesne.dataset.fazla==='true'&&parca!=='meyveli-tart')c.filter='brightness(.79) saturate(.88)';
      c.drawImage(asil,0,0,gen,boy);c.filter='none';
      for(const m of meyveler){
        const yaban=m.dataset.meyve==='yaban';
        const oran=Math.min(gen*(yaban?.12:.16)/m.naturalWidth,boy*(yaban?.17:.23)/m.naturalHeight);
        const w=m.naturalWidth*oran,h=m.naturalHeight*oran;
        c.drawImage(m,parseFloat(m.style.left)*gen/100-w/2,parseFloat(m.style.top)*boy/100-h/2,w,h);
      }
      if(sus){
        const konum=susKonumu(parca,sus.dataset.sus),kutu=gen*konum.en/100;
        const olcek=kutu/Math.max(sus.naturalWidth,sus.naturalHeight);
        const en=sus.naturalWidth*olcek,yuk=sus.naturalHeight*olcek;
        c.save();c.translate(gen*konum.x/100,boy*konum.y/100);c.rotate(konum.aci*Math.PI/180);
        c.beginPath();c.rect(-kutu/2,-kutu/2,kutu,kutu*(1-konum.gomulu));c.clip();
        c.drawImage(sus,-en/2,-yuk/2,en,yuk);c.restore();
      }
      if(parca==='meyveli-tart'){
        tartDiliminiKaldir(tam,isirik,oncekiIsirik);return;
      }
      const kalan=isirik.getContext('2d')!;
      if(parca==='dondurma'){
        const kirp=(ctx:CanvasRenderingContext2D,n:number)=>{
          ctx.save();ctx.globalCompositeOperation='destination-out';
          if(n===1){ctx.beginPath();ctx.ellipse(gen*.25,boy*.04,gen*.27,boy*.17,0,0,Math.PI*2);ctx.fill();}
          if(n===2){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(gen,0);ctx.lineTo(gen,boy*.34);ctx.lineTo(gen*.83,boy*.32);ctx.lineTo(gen*.69,boy*.35);ctx.lineTo(gen*.54,boy*.33);ctx.lineTo(gen*.40,boy*.36);ctx.lineTo(gen*.26,boy*.33);ctx.lineTo(gen*.16,boy*.35);ctx.lineTo(0,boy*.32);ctx.closePath();ctx.fill();}
          if(n>=3)ctx.clearRect(0,0,gen,boy);ctx.restore();
        };
        kirp(c,oncekiIsirik);kalan.drawImage(tam,0,0);kirp(kalan,oncekiIsirik+1);return;
      }
      kalan.drawImage(tam,0,0);
      kalan.beginPath();kalan.ellipse(gen*.51,0,gen*.20,Math.min(gen,boy)*.22,0,0,Math.PI*2);
      kalan.globalCompositeOperation='destination-out';kalan.fill();
      kalan.globalCompositeOperation='source-atop';kalan.lineWidth=3;kalan.strokeStyle='#211818';kalan.stroke();
    }).catch(()=>{
      const yedek=asil.cloneNode() as HTMLImageElement;
      nesne.replaceChildren(yedek);
    });
    return nesne;
  }
  const catalla=parca!=='corba';
  nesne.append(h('img.restoran-kasik',{src:catalla?catal:kaynak('nesneler','kasik'),alt:''}));
  if(parca==='tavuk'){
    const gercek=tabak.querySelector<HTMLImageElement>('.tv-porsiyon-fileto:not([hidden])');
    if(gercek){nesne.append(h('img.restoran-kasik-ici',{src:gercek.src,alt:''}));return nesne;}
    const tur=tabak.dataset.tavukRengi??(asil?.src.includes('yanik')?'yanik':asil?.src.includes('fazla')?'fazla':'pisti');
    nesne.append(h('img.restoran-kasik-ici',{src:tavukResmi(tur),alt:''}));return nesne;
  }
  const yuzey=tabak.querySelector<HTMLElement>('.corba-yuzeyi');
  if(parca==='corba'){
    const sivi=h('i.restoran-sivi');
    sivi.style.backgroundColor=yuzey?.style.backgroundColor||'#f69d49';nesne.append(sivi);
    const ust=tabak.querySelector<HTMLImageElement>('.yemek-susu[data-bitis]:not([hidden])');
    if(ust){nesne.append(h('img.restoran-kasik-ici',{src:ust.src,alt:''}));return nesne;}
  }
  const parcaResmi=tabak.querySelector<HTMLImageElement>('.salata-lokmasi:not([hidden]),.corba-lokmasi:not([hidden]),.pz-parca');
  if(parcaResmi)nesne.append(h('img.restoran-kasik-ici',{src:parcaResmi.currentSrc||parcaResmi.src,alt:''}));
  else if(parca==='salata')nesne.append(h('img.restoran-kasik-ici',{src:kaynak('nesneler','marul-parca'),alt:''}));
  else if(asil?.complete && asil.naturalWidth && parca!=='corba'){
    // Fotoğraftaki kap ve tabağın dışı yerine tam ortadaki küçük porsiyonu örnekle.
    const lokma=h('canvas.restoran-kasik-ici',{width:72,height:54});
    const boy=Math.min(asil.naturalWidth,asil.naturalHeight)*.17;
    const [x,y]=parca==='makarna'?makarnaYerleri[Math.min(2,Number(tabak.dataset.lokmaAdedi??0))]:[.5,.53];
    lokma.getContext('2d')?.drawImage(asil,asil.naturalWidth*x-boy/2,asil.naturalHeight*y-boy/2,boy,boy,0,0,72,54);
    nesne.append(lokma);
  }
  return nesne;
}

function salonAgzi(sahne:HTMLElement,kim:keyof typeof dudaklar){
  const oyuncu=sahne.querySelector<HTMLElement>('.salon-figur[data-karakter="'+kim+'"]');
  const beden=oyuncu?.querySelector<HTMLElement>('.restoran-oyuncu-bedeni');
  if(!oyuncu||!beden)return;
  const r=beden.getBoundingClientRect();
  return {
    x:r.left+r.width*Number(oyuncu.dataset.agizX??dudaklar[kim][0]),
    y:r.top+r.height*Number(oyuncu.dataset.agizY??dudaklar[kim][1]),
    boy:r.height,
    yuz:(poz:string)=>oyuncu.dispatchEvent(new CustomEvent('restoran-yuz',{detail:poz})),
    tadim:(evre:'yaklas'|'temas'|'tepki'|'bitir',icecek:boolean,puan:number,elde:boolean,sira?:number)=>
      oyuncu.dispatchEvent(new CustomEvent('restoran-tat',{detail:{evre,icecek,puan,elde,sira}}))
  };
}

export function lokmaSun(sahne:HTMLElement,tabak:HTMLElement,parca:Parca,puan:number,bitir:()=>void,elde=false,paylasilan?:keyof typeof dudaklar,seciliDilim?:number):void{
  if(tabak.dataset.tukendi==='true'||sahne.querySelector('.restoran-lokma'))return;
  let alindi=false;
  function lokmayiAl(){
    if(alindi)return;
    alindi=true;porsiyonuAzalt(tabak,parca,seciliDilim);tabak.dispatchEvent(new Event('sef-lokma'));
  }
  const yuz=sahne.querySelector<HTMLImageElement>('.tepsi-alici img[data-misafir]');
  const kim=paylasilan??yuz?.dataset.misafir as keyof typeof dudaklar;
  if(!yuz||!Object.hasOwn(dudaklar,kim)||matchMedia('(prefers-reduced-motion:reduce)').matches){lokmayiAl();bitir();return;}
  const pizza=parca==='pizza'?tabak.querySelector<HTMLElement>('.pz-pizza'):null;
  const alet=pizza?h('span.restoran-lokma',{'aria-hidden':true,'data-tur':'pizza'}):lokmayiHazirla(tabak,parca);
  const eldeYenen=parca==='simit'||parca==='tost';
  if(eldeYenen)tabak.dataset.tasiniyor='true';
  sahne.append(alet);
  alet.dataset.alici=kim;
  const once=yuz.src;
  const lokumPizza=pizza&&kim==='lokum';
  const salon=sahne.dataset.salon==='servis';
  const poz=(ad:string)=>kim==='babaanne'||kim==='baba'||kim==='anne'||kim==='kino'?yeniPortre(kim,ad==='acik'?1:0):lokumPizza?pizzaPozlari['../../assets/sef/tepsi/tadim/lokum-pizza-'+ad+'.webp']:agizlar['../../assets/sef/agiz/'+kim+'-tesekkur-'+ad+'.webp'];
  const acik=new Image();acik.src=salonArkadasi(kim)?once:poz('acik');
  const kapali=new Image();kapali.src=salonArkadasi(kim)?once:poz('kapali');
  const sira=puan<3?[1,2,4]:[2,3,4];
  const tepki=sira.map(kare=>{
    const img=new Image();
    img.src=salonArkadasi(kim)?once:kim==='babaanne'||kim==='baba'||kim==='anne'||kim==='kino'?yeniPortre(kim,kare===3?2:0):pizzaPozlari['../../assets/sef/tepsi/tadim/'+kim+'-tepki-'+kare+'.webp'];
    return img;
  });
  async function oynat(yuz:HTMLImageElement){
    try {
      await Promise.all([...(salon?[]:[acik,kapali,...tepki]).map(img=>img.decode()),pizza&&pizzaDilimle(pizza,alet,siradakiDilim(pizza,Number(tabak.dataset.lokmaAdedi??0),seciliDilim))]);
      if(!alet.isConnected)return;
      const r=sahne.getBoundingClientRect(), b=tabak.getBoundingClientRect(),y=yuz.getBoundingClientRect();
      const olcek=Math.min(y.width/acik.naturalWidth,y.height/acik.naturalHeight);
      const [dx,dy]=lokumPizza?[.407,.605]:dudaklar[kim];
      if(lokumPizza)alet.style.setProperty('--dilim-boy',String(acik.naturalHeight*olcek*.24)+'px');
      const salonda=salonAgzi(sahne,kim);
      const agiz=salonda?{x:salonda.x-r.left,y:salonda.y-r.top}:{x:y.left-r.left+y.width/2+(dx-.5)*acik.naturalWidth*olcek,y:y.top-r.top+y.height/2+(dy-.5)*acik.naturalHeight*olcek};
      if(salonda&&pizza)alet.style.setProperty('--dilim-boy',salonda.boy*.21+'px');
      const bas={x:b.left-r.left+b.width*.50,y:b.top-r.top+b.height*.47};
      const konum=(x:number,y:number,s:number)=>'translate('+x+'px,'+y+'px) scale('+s+')';
      const yaklas=konum(agiz.x,agiz.y,parca==='icecek'?.78:.76);
      const anim=alet.animate(elde?[{transform:yaklas,opacity:1},{transform:yaklas,opacity:1}]:[
        {transform:konum(bas.x,bas.y,.95),opacity:0},
        {transform:konum(bas.x,bas.y,1),opacity:1,offset:.13},
        {transform:konum((agiz.x+bas.x)/2,(agiz.y+bas.y)/2-r.height*.06,.88),opacity:1,offset:.46},
        {transform:yaklas,opacity:1,offset:.79},{transform:yaklas,opacity:1}
      ],{duration:elde?90:780,easing:'ease-in-out',fill:'forwards'});
      if(salonda)salonda.tadim('yaklas',parca==='icecek',puan,elde);else yuz.src=acik.src;
      await anim.finished;
      if(!alet.isConnected)return;
      alet.classList.add('lokma-alindi');lokmayiAl();
      if(salonda)salonda.tadim('temas',parca==='icecek',puan,elde);else yuz.src=kapali.src;
      const geri=lokumPizza&&!salonda?konum(agiz.x+3,agiz.y+acik.naturalHeight*olcek*.105,.76):konum(agiz.x+20,agiz.y+20,.75);
      if(eldeYenen){
        await alet.animate([{transform:yaklas,opacity:1},{transform:konum(bas.x,bas.y,.95),opacity:1}],
          {duration:340,easing:'ease-in-out',fill:'forwards'}).finished;
        alet.style.visibility='hidden';
      }else await alet.animate([{transform:yaklas,opacity:1},{transform:geri,opacity:1,offset:.52},{transform:geri,opacity:0}],{duration:lokumPizza?690:240,fill:'forwards'}).finished;
      if(eldeYenen)delete tabak.dataset.tasiniyor;
      for(const [i,img] of tepki.entries()){
        if(!alet.isConnected)return;
        if(salonda)salonda.tadim('tepki',parca==='icecek',puan,elde,i);else yuz.src=img.src;
        yuz.dataset.tadimTepkisi=String(sira[i]);
        await new Promise(resolve=>setTimeout(resolve,[240,puan>=3&&tatliMi(parca)?600:440,360][i]));
      }
    } catch { /* Görsel çözülemezse servis geri bildirimi yine açılır. */ }
    finally{
      salonAgzi(sahne,kim)?.tadim('bitir',parca==='icecek',puan,elde);
      if(eldeYenen)delete tabak.dataset.tasiniyor;
      delete yuz.dataset.tadimTepkisi;
      if(yuz.src===acik.src||yuz.src===kapali.src||tepki.some(img=>yuz.src===img.src))yuz.src=once;
      alet.remove();if(sahne.isConnected){lokmayiAl();bitir();}
    }
  }
  void oynat(yuz);
}
export function tadimiGeriYukle(tabak:HTMLElement,parca:Parca,adet:number,dilimler?:number[]){
  for(let i=0;i<adet&&tabak.dataset.tukendi!=='true';i++)porsiyonuAzalt(tabak,parca,dilimler?.[i]);
}
function porsiyonuAzalt(tabak:HTMLElement,parca:Parca,seciliDilim?:number){
  const adet=Number(tabak.dataset.lokmaAdedi??0)+1;
  const lokma=siradakiLokma(tabak);
  if(lokma){
    lokma.setAttribute('hidden','');
    lokma.parentElement?.querySelector('[data-ust]')?.setAttribute('hidden','');
    if(!siradakiLokma(tabak)){
      tabak.dataset.tukendi='true';tabak.querySelector('[data-garnitur]')?.setAttribute('hidden','');
    }
  }
  if(parca==='krep'||(!lokma&&(parca==='mucver'||parca==='sis'))){
    const dilim=tabak.querySelector('[data-krep-dilimi]:not([hidden])');dilim?.setAttribute('hidden','');
    const son=parca==='sis'?4:3;
    if(adet>=son){
      tabak.dataset.tukendi='true';
      const eski=tabak.querySelector<HTMLImageElement>('.defter-fotograf');
      if(eski)eski.src=bosTabaklar[parca];
    }
  }
  if(parca==='pizza'){
    const pizza=tabak.querySelector<HTMLElement>('.pz-pizza');
    if(pizza&&pizzaDilimSayisi(pizza)===4){
      const ceyrekler=alinanCeyrekler([...ceyrekSirasi(pizza),siradakiDilim(pizza,adet-1,seciliDilim)],adet);
      pizza.dataset.alinan=ceyrekler.join('');
      pizzadaKalan(pizza,adet,ceyrekler);
    }else if(pizza)pizzadaKalan(pizza,adet);
    if(adet>=(pizza?pizzaDilimSayisi(pizza):5))tabak.dataset.tukendi='true';
  }
  if(parca==='icecek'){
    const cam=tabak.querySelector<HTMLElement>('.sm-bardak');
    const normal=tabak.querySelector<HTMLImageElement>('img[data-yarim-bardak]');
    const sikma=tabak.querySelector<HTMLElement>('.sikma-servis-bardagi');
    const yudumlar=(cam??sikma??normal)?.dataset.miktar==='2'?2:3;
    if(sikma)sikma.style.setProperty('--doluluk',Math.max(0,(yudumlar===2?44:81)*(1-adet/yudumlar))+'%');
    if(cam){
      const bas=Number(cam.dataset.ilkSeviye??parseFloat(cam.style.getPropertyValue('--sm-dolu')));
      cam.dataset.ilkSeviye=String(bas);
      cam.style.setProperty('--sm-dolu',bas*Math.max(0,1-adet/yudumlar)+'%');
    }
    if(normal)normal.src=adet>=yudumlar?normal.dataset.bosBardak!:normal.dataset.yarimBardak!;
    if(adet>=yudumlar)tabak.dataset.tukendi='true';
  }
  if(parca==='simit'||parca==='tost'){
    tabak.querySelector(parca==='simit'?'.simit-halkasi':'.tost-yigin')?.classList.add(parca+'-isirildi');
    if(adet===3)tabak.dataset.tukendi='true';
  }
  if(parca==='durum'){const dilim=tabak.querySelector<HTMLElement>('.dr-kesit[data-dilim="'+(adet-1)+'"]');if(dilim)dilim.hidden=true;if(adet===3)tabak.dataset.tukendi='true';}
  if(parca==='sutlac'){
    const ic=tabak.querySelector<HTMLElement>('.sl-ic');
    if(ic)ic.dataset.lokma=String(adet);
    if(adet>=3)tabak.dataset.tukendi='true';
  }
  if(parca==='menemen'){
    const parca=tabak.querySelector<HTMLElement>('.mn-porsiyon:not([hidden])');if(parca)parca.hidden=true;
    if(adet===3)tabak.dataset.tukendi='true';
  }
  if(parca==='omlet'&&adet===3)tabak.dataset.tukendi='true';

  if(parca==='kumpir'){
    const yer=kumpirLokmasi(tabak),porsiyon=tabak.querySelector<HTMLElement>('.kumpir-sunumu');
    if(porsiyon){
      porsiyon.style.setProperty('--kp-x'+adet,yer.x+'%');porsiyon.style.setProperty('--kp-y'+adet,yer.y+'%');
      porsiyon.classList.add('kp-isirildi');
      if(yer.ic)yer.ic.hidden=true;
      if(adet===3){tabak.dataset.tukendi='true';porsiyon.style.visibility='hidden';}
    }
  }
  tabak.dataset.lokmaAdedi=String(adet);
  if(parca==='manti'){
    const parca=tabak.querySelector<HTMLElement>('.manti-lokma:not([hidden])');if(parca)parca.hidden=true;
    if(adet===3)tabak.dataset.tukendi='true';
  }
  if(parca==='salata'||parca==='corba'){
    const ust=tabak.querySelector<HTMLImageElement>('.yemek-susu[data-bitis]:not([hidden])');
    if(parca==='corba'&&ust)ust.hidden=true;
    const lokmalar=Array.from(tabak.querySelectorAll<HTMLElement>('.salata-lokmasi:not([hidden]),.corba-lokmasi:not([hidden])'));
    for(const lokma of lokmalar.slice(0,Math.ceil(lokmalar.length/(4-adet))))lokma.hidden=true;
    if(adet===3){
      tabak.dataset.tukendi='true';
      const cizim=tabak.querySelector('.yemek-cizimi');
      if(cizim)cizim.replaceChildren(h('img',{alt:'',src:kaynak('nesneler',parca==='salata'?'salata-kasesi':'corba-kasesi')}));
    }
    const kase=tabak.querySelector<HTMLElement>('.corba-porsiyonu');
    if(kase)kase.dataset.doluluk='1';
  }
  if(parca==='makarna'){
    const foto=tabak.querySelector<HTMLImageElement>('.defter-fotograf');
    if(foto){
      const [x,y]=makarnaYerleri[adet-1],silinen=foto.cloneNode() as HTMLImageElement;
      silinen.src=makarnaTabagi;silinen.classList.add('yenmis-makarna');
      silinen.style.clipPath='ellipse(19% 18% at '+x*100+'% '+y*100+'%)';
      foto.after(silinen);
      if(adet===3){foto.src=makarnaTabagi;tabak.querySelectorAll('.yenmis-makarna').forEach(resim=>resim.remove());}
    }
    if(adet===3)tabak.dataset.tukendi='true';
  }
  if(parca==='tavuk'){
    const gercek=tabak.querySelector<HTMLImageElement>('.tv-porsiyon-fileto:not([hidden])');
    if(gercek){gercek.hidden=true;if(adet>=2)tabak.dataset.tukendi='true';return;}
    const img=tabak.querySelector<HTMLImageElement>(':scope > img.tepsi-gida');
    if(!img)return;
    const tur=tabak.dataset.tavukRengi??(img.src.includes('yanik')?'yanik':img.src.includes('fazla')?'fazla':'pisti');
    tabak.dataset.tavukRengi=tur;
    img.src=tavukResmi('tabak');
    let kalan=tabak.querySelector<HTMLImageElement>('.kalan-tavuk');
    if(!kalan){kalan=h('img.kalan-tavuk',{alt:'',src:tavukResmi(tur)});tabak.append(kalan);}
    kalan.hidden=adet>=2;if(adet>=2)tabak.dataset.tukendi='true';
  }
  if(parca==='kurabiye'){
    const tane=tabak.querySelector<HTMLElement>('.kb-dizi>.kb-tane:not([hidden])');
    if(tane){
      tane.hidden=true;
      if(adet===1)tabak.querySelector<HTMLElement>('.tatli-susu')?.setAttribute('hidden','');
      if(adet===3)tabak.dataset.tukendi='true';
      return;
    }
  }
  const kek=parca==='minik-kek'&&tabak.querySelector<HTMLElement>('.pastane-porsiyonu[data-kek-porsiyon=true]');
  if(kek){
    kek.dataset.isirik=String(adet);
    if(adet===3)tabak.dataset.tukendi='true';
    return;
  }
  if(parca==='dondurma'){
    const porsiyon=tabak.querySelector<HTMLElement>('.pastane-porsiyonu');
    if(porsiyon)porsiyon.dataset.isirik=String(adet);
    if(adet>=3)tabak.dataset.tukendi='true';
    return;
  }
  if(parca==='meyveli-tart'){
    const kalan=tabak.querySelector<HTMLElement>('.tatli-katlari');
    if(kalan&&adet<3){
      const aci=tartYayi(adet),nokta=(a:number)=>(50+110*Math.cos(a))+'% '+(50+110*Math.sin(a))+'%';
      const kenar=Array.from({length:17},(_,i)=>nokta(aci+(tartYayi(3)-aci)*i/16));
      kalan.style.clipPath='polygon(50% 50%,'+kenar.join(',')+')';
    }
    if(adet>=3)tabak.dataset.tukendi='true';
    return;
  }
  if(tatliMi(parca)&&parca!=='sutlac'){tabak.querySelector('.tatli-yiyecek')?.classList.add('tatli-isirildi');if(adet===3)tabak.dataset.tukendi='true';}
}

export function eldeTattir(sahne:HTMLElement,tabak:HTMLButtonElement,parca:Parca,puan:number,bitir:()=>void,siparisSahibi?:keyof typeof dudaklar){
  const yuz=sahne.querySelector<HTMLImageElement>('.tepsi-alici img[data-misafir]');
  const kim=yuz?.dataset.misafir as keyof typeof dudaklar;
  if(!yuz||!Object.hasOwn(dudaklar,kim))return;
  const elle=parca==='icecek'||parca==='pizza'||parca==='tost'||parca==='simit'||parca==='kurabiye'||parca==='dondurma';
  const kasik=parca==='corba'||parca==='kumpir'||parca==='sutlac'||parca==='menemen';
  if(!elle)tabak.append(h('img.lokma-tutamaci',{alt:'',src:kasik?kaynak('nesneler','kasik'):catal,draggable:false}));
  tabak.dataset.elleTadim='true';
  tabak.setAttribute('aria-description',(elle?(parca==='icecek'?'Bardağı':'Yiyeceği'):kasik?'Kaşığı':'Çatalı')+' müşterinin ağzına taşı veya tabağa dokun.');
  let id:number|undefined,ilk={x:0,y:0},alet:HTMLElement|undefined,once='',sustur=0;
  let dilimiGeriKoy:(()=>void)|undefined;
  let seciliDilim:number|undefined;
  let bekleyen:keyof typeof dudaklar|undefined;
  const acik=new Image();acik.src=salonArkadasi(kim)?yuz.src:kim==='babaanne'||kim==='baba'||kim==='anne'||kim==='kino'?yeniPortre(kim,1):agizlar['../../assets/sef/agiz/'+kim+'-tesekkur-acik.webp'];
  function yaklasan(konuk:keyof typeof dudaklar|undefined){
    if(bekleyen===konuk)return;
    if(bekleyen)salonAgzi(sahne,bekleyen)?.yuz('kapali');
    bekleyen=konuk;
    if(konuk)salonAgzi(sahne,konuk)?.yuz('acik');
  }
  function temizle(){
    yaklasan(undefined);
    dilimiGeriKoy?.();dilimiGeriKoy=undefined;
    if(yuz&&once&&yuz.src===acik.src)yuz.src=once;
    alet?.remove();alet=undefined;once='';id=undefined;delete tabak.dataset.tasiniyor;
  }
  function agiz(){
    const salon=salonAgzi(sahne,kim);if(salon)return salon;
    const r=yuz!.getBoundingClientRect(),w=acik.naturalWidth||yuz!.naturalWidth,h=acik.naturalHeight||yuz!.naturalHeight;
    const olcek=Math.min(r.width/w,r.height/h),[dx,dy]=dudaklar[kim];
    return {x:r.left+r.width*.5+(dx-.5)*w*olcek,y:r.top+r.height*.5+(dy-.5)*h*olcek};
  }
  tabak.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0||sahne.querySelector('.restoran-lokma')||tabak.disabled||tabak.dataset.tukendi==='true')return;
    sustur=0;seciliDilim=undefined;ilk={x:e.clientX,y:e.clientY};
    const pizza=parca==='pizza'&&tabak.querySelector<HTMLElement>('.pz-pizza[data-dilim="4"]');
    if(pizza){
      const r=pizza.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      const uzaklik=Math.hypot(x-.5,y-.5);
      if(uzaklik>.12&&uzaklik<=.49){
        seciliDilim=ceyrekKonumu(x,y);
        if(ceyrekSirasi(pizza).includes(seciliDilim)){sustur=performance.now()+650;return;}
      }
    }
    id=e.pointerId;tabak.setPointerCapture(id);
  });
  tabak.addEventListener('pointermove',e=>{
    if(id!==e.pointerId)return;
    if(!alet){
      if(Math.hypot(e.clientX-ilk.x,e.clientY-ilk.y)<7)return;
      const pizza=parca==='pizza'&&tabak.querySelector<HTMLElement>('.pz-pizza');
      alet=pizza?h('span.restoran-lokma',{'aria-hidden':true,'data-tur':'pizza'}):lokmayiHazirla(tabak,parca);
      alet.classList.add('elle-tasinan');
      sahne.append(alet);tabak.dataset.tasiniyor='true';once=yuz.src;
      if(pizza){
        const adet=Number(tabak.dataset.lokmaAdedi??0);
        const kesim=pizza.style.clipPath,maske=pizza.style.maskImage,gorunurluk=pizza.style.visibility;
        const sira=siradakiDilim(pizza,adet,seciliDilim);
        void pizzaDilimle(pizza,alet,sira).catch(()=>{});
        pizzadaKalan(pizza,adet+1,[...ceyrekSirasi(pizza),sira]);
        dilimiGeriKoy=()=>{pizza.style.clipPath=kesim;pizza.style.maskImage=maske;pizza.style.visibility=gorunurluk;};
      }
    }
    const salon=salonAgzi(sahne,kim);
    const diger=sahne.querySelector<HTMLElement>('.salon-arkadas')?.dataset.karakter as keyof typeof dudaklar|undefined;
    const arkadas=diger&&salonAgzi(sahne,diger);
    const mesafe=(n:{x:number;y:number})=>Math.hypot(e.clientX-n.x,e.clientY-n.y);
    if(salon){
      const ana=mesafe(salon);
      if(arkadas&&mesafe(arkadas)<Math.max(24,arkadas.boy*.26)&&mesafe(arkadas)<ana)yaklasan(diger);
      else yaklasan(ana<Math.max(24,salon.boy*.26)?kim:undefined);
    }else if(acik.complete&&acik.naturalWidth){
      yuz.src=mesafe(agiz())<Math.max(24,yuz.getBoundingClientRect().height*.26)?acik.src:once;
    }
    const r=sahne.getBoundingClientRect();
    alet.style.transform='translate('+(e.clientX-r.left)+'px,'+(e.clientY-r.top)+'px) scale(.8)';
  });
  tabak.addEventListener('pointerup',e=>{
    if(id!==e.pointerId)return;
    if(!alet){
      id=undefined;
      if(seciliDilim!==undefined){
        sustur=performance.now()+650;
        lokmaSun(sahne,tabak,parca,puan,bitir,false,siparisSahibi,seciliDilim);
      }
      return;
    }
    const hedef=agiz(),r=yuz.getBoundingClientRect();
    const uzak=(a:{x:number;y:number})=>Math.hypot(e.clientX-a.x,e.clientY-a.y);
    const anaUzak=uzak(hedef);
    const eristi=anaUzak<=Math.max(22,(salonAgzi(sahne,kim)?.boy??r.height)*.18);
    const konuk=sahne.querySelector<HTMLElement>('.salon-arkadas');
    const arkadas=konuk?.dataset.karakter as keyof typeof dudaklar|undefined;
    const diger=arkadas&&salonAgzi(sahne,arkadas);
    const paylas=diger&&uzak(diger)<=Math.max(22,diger.boy*.18)&&(!eristi||uzak(diger)<anaUzak);
    sustur=performance.now()+650;temizle();
    if(paylas&&arkadas){
      const sahibineGitti=arkadas===siparisSahibi;
      lokmaSun(sahne,tabak,parca,puan,sahibineGitti?bitir:()=>konuk?.querySelector<HTMLButtonElement>('.salon-sohbet')?.click(),true,arkadas,seciliDilim);
    }else if(eristi)lokmaSun(sahne,tabak,parca,puan,bitir,true,undefined,seciliDilim);
  });
  tabak.addEventListener('pointercancel',temizle);
  tabak.addEventListener('lostpointercapture',()=>{if(id!==undefined)temizle();});
  tabak.addEventListener('click',e=>{
    if(e.detail&&performance.now()<sustur){e.preventDefault();e.stopImmediatePropagation();}
  },true);
}
