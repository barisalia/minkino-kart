import {menemenOrnegi} from './menemen-gorseli';
import {menemenRehberi} from './menemen-tezgahi';
import menemenMetni from './menemen-replikleri.json';
import {durumOrnegi,durumSrc} from './durum-gorseli';
import {durumRehberi} from './durum-tezgahi';
import durumMetinleri from './durum-replikleri.json';
import {mantiOrnegi} from './manti-tezgahi';
import mantiReplik from './manti-replikleri.json';
import {kumpirFisleri,kumpirAd,type KumpirFisi} from './kumpir-tarifi';
import {kumpirOrnegi,kumpirResmi} from './kumpir-gorseli';
import kumpirReplik from './kumpir-replikleri.json';
import { h } from '../../src/ui/dom';
import { dugme, ikon, resim } from './gorsel';
import { adlar, type Yemek } from './yemekler';
import adimlar from './tarif-adimlari.json';
import { konus,sus } from '../../src/audio/konusma';
import { jest } from './hareket';
import {tatliKademeler,tatliMi,kurabiyeSekliniOku,kalipAdi,type KurabiyeSekli,type TatliCesidi} from './tatli-ekonomi';
import {tatliResmi} from './tatli-gorsel';
import {tatliAdiminiDinle} from './tatli-rehber';
import anlatim from './tatli-rehber-replikleri.json';
import tostReplik from './tost-replikleri.json';
import simitReplik from './simit-replikleri.json';
import {tostOrnegi} from './tost-gorseli';
import {simitSunumu} from './simit-gorseli';
import {tavukResmi} from './tepsi-tavuk';
import {siparisBardagi} from './smoothie/gorsel';
import {omletOrnegi} from './omlet-gorseli';
import omletRehberi from './omlet-kitap-replikleri.json';
const karisimAnlatimi=[
  new URL('../../assets/sef/smoothie/meyve.mp3',import.meta.url).href,
  new URL('../../assets/sef/smoothie/karistir.mp3',import.meta.url).href,
  new URL('../../assets/sef/smoothie/dok.mp3',import.meta.url).href,
];

const pastaneAdimlari:Record<TatliCesidi,readonly (keyof typeof anlatim)[]>={
  sutlac:['sutlac-sut','sutlac-karistir','sutlac-dok','sutlac-tarcin'],
  kurabiye:['hamur','kalip-bas','firin','kalip-krema'],
  dondurma:['cilekli-top','kepce','kulah'],
  'minik-kek':['cirp','kek-dok','firin','kek-krema','kek-cilek'],
  'meyveli-tart':['hamur','tart-bas','firin','tart-krema','tart-meyve'],
};
const mantiRehberi=[mantiReplik.doldur,mantiReplik.katla,mantiReplik.hasla,mantiReplik.sos];
const kumpirRehberi=[kumpirReplik.ac,kumpirReplik.ez,kumpirReplik.koy];
export const tezgahlar={
  durum:{ad:'Rulo Dürüm',menu:'bahce-durumu',adimlar:[durumMetinleri.diz,durumMetinleri.sar,durumMetinleri.kes],gorsel:()=>durumOrnegi('bahce-durumu')},
  kumpir:{ad:'Kumpir',menu:'misirli-kumpir',adimlar:kumpirRehberi,gorsel:()=>kumpirOrnegi()},
  manti:{ad:'Mantı',menu:'peynir-manti',adimlar:mantiRehberi,gorsel:()=>mantiOrnegi('peynir-manti')},
  tost:{ad:'Sıcak Tost',menu:'peynirli-tost',adimlar:[tostReplik.ac,tostReplik.diz,tostReplik.pres,tostReplik.sun],gorsel:()=>tostOrnegi()},
  simit:{ad:'Simit',menu:'susamli-simit',adimlar:[simitReplik.uzat,simitReplik.bagla,simitReplik.kapla,simitReplik.firin],gorsel:()=>simitSunumu('susam')},
  tavuk:{ad:'Tavada Tavuk',menu:'fiyonk-tavuk',adimlar:['Filetoları maşayla tavaya koy.','Alt yüzleri pişti. Maşayla çevir.','Tavuklar kızardı! Tabağa al ya da ateşi kapat.'],gorsel:()=>h('img',{src:tavukResmi,alt:''})},
  icecek:{ad:'Meyve Karışımı',menu:'meyveli-mola',adimlar:['İki malzeme seçip sürahiye koy.','Kapağı kapat ve meyveleri karıştır.','Sürahiyi tutarak bardağı çizgiye kadar doldur.'],gorsel:()=>siparisBardagi(['cilek','sut'])},
  menemen:{ad:'Menemen',menu:'biberli-menemen',adimlar:[menemenMetni.dogra,menemenMetni.sotele,menemenMetni.kir,menemenMetni.pisir],gorsel:()=>menemenOrnegi('biberli-menemen')},
  omlet:{ad:'Omlet',menu:'kino-omleti',adimlar:omletRehberi,gorsel:()=>omletOrnegi('kino-omleti')},
};
export type KitapTezgahi=keyof typeof tezgahlar;
type KitapTarifi=Yemek|TatliCesidi|KitapTezgahi;
const kitapTezgahi=(id:string):id is KitapTezgahi=>Object.hasOwn(tezgahlar,id);

const kumpirSayfalari=import.meta.glob<string>('../../assets/sef/kumpir-kitap/*.webp',{eager:true,query:'?url',import:'default'});
const resimler=import.meta.glob<string>('../../assets/sef/tarif-kartlari/*.webp',{eager:true,query:'?url',import:'default'});
export function tarifKaresi(id:KitapTarifi,sira:number,sekil:KurabiyeSekli='yildiz') {
  if(id==='durum')return durumSrc('durum/'+['lavas','rulo','dilim'][sira]);
  if(id==='kumpir')return kumpirSayfalari['../../assets/sef/kumpir-kitap/sayfa'+(sira+1)+'.webp'];
  if(id==='kurabiye'&&sira>0&&sekil!=='yildiz')return resimler['../../assets/sef/tarif-kartlari/kurabiye-'+sekil+'-'+(sira+1)+'.webp'];
  return resimler['../../assets/sef/tarif-kartlari/'+id+'-'+(sira+1)+'.webp'];
}

interface KitapAyar {
  yemekResmi:(id:Yemek)=>string;
  soyle:(s:string)=>void;
  kapat:()=>void;
  oyna:(id:Yemek)=>void;
  tezgahAc:(tarif:KitapTezgahi,menu:string)=>void;
  tatliSeviye:number;
  pastaneyeGit:(tarif:TatliCesidi,sekil?:KurabiyeSekli)=>void;
  sonKalip?:KurabiyeSekli;
  sesli:()=>boolean;
}
export function tarifKitabi(yer:HTMLElement,ayar:KitapAyar) {
  const dialog=h('dialog.sef-tarif-kitabi',{'aria-label':'Resimli tarifler'});
  const baslik=h('h2',{},'Tarif kitabım');
  const kapat=dugme('Tarif kitabını kapat','dugme',ikon('kapat'));
  kapat.onclick=ayar.kapat;
  const ust=h('header.kitap-ust',{},resim('tarif-defteri'),baslik,kapat);
  const alan=h('div.kitap-icerik');
  dialog.append(ust,alan);
  let konu:KitapTarifi|undefined, sira=0, surum=0, pastane=false, sayfa=0;
  let sekil=kurabiyeSekliniOku(ayar.sonKalip);
  const ayracAnahtari='minkino-sef-tarif-ayraci';
  let ayrac:{id:KitapTarifi;sira:number;sekil?:KurabiyeSekli}|undefined;
  try{
    const k=JSON.parse(localStorage.getItem(ayracAnahtari)??'null');
    if(k&&typeof k.id==='string'&&(Object.hasOwn(adlar,k.id)||tatliMi(k.id)||kitapTezgahi(k.id))&&
      Number.isInteger(k.sira)&&k.sira>0&&k.sira<5&&tarifKaresi(k.id,k.sira))ayrac=k;
  }catch{/* Kitap, cihazda depolama kullanılamadığında da açılır. */}
  const ayir=(id?:KitapTarifi,adim=0)=>{
    ayrac=id&&adim>0?{id,sira:adim,...(id==='kurabiye'?{sekil}:{})}:undefined;
    try{if(ayrac)localStorage.setItem(ayracAnahtari,JSON.stringify(ayrac));else localStorage.removeItem(ayracAnahtari);}catch{}
  };
  const darTelefon=matchMedia('(max-width:624px) and (orientation:landscape)');
  const bolumler=h('div.kitap-bolumleri',{role:'group','aria-label':'Tarif bölümü'});
  const bolumTuslari=[false,true].map(tatli=>{
    const tus=dugme(tatli?'Pastane tariflerini aç':'Mutfak tariflerini aç','kitap-sekme',
      tatli?tatliResmi('minik-kek'):h('img',{src:ayar.yemekResmi('corba'),alt:''}));
    tus.onclick=()=>{
      if(tatli===pastane&&!konu)return;
      pastane=tatli;sayfa=0;yemekler();
      bolumTuslari[Number(pastane)].focus({preventScroll:true});
    };
    bolumler.append(tus);return tus;
  });
  ust.insertBefore(bolumler,kapat);
  const kaliplar=h('div.kitap-bolumleri',{role:'group','aria-label':'Kitaptaki kurabiye kalıbı'});
  for(const tip of ['yildiz','kalp','yuvarlak'] as const){
    const sec=dugme(kalipAdi[tip]+' sayfalarını göster','kitap-sekme',tatliResmi('kurabiye',undefined,tip));
    sec.dataset.sekil=tip;sec.onclick=()=>{if(sekil!==tip){sekil=tip;goster();}};kaliplar.append(sec);
  }
  ust.insertBefore(kaliplar,kapat);
  function yemekler(odak?:KitapTarifi){
    konu=undefined;surum++;sus();baslik.textContent=pastane?'Pastane tarifleri':'Tarif kitabım';
    bolumler.hidden=false;
    kaliplar.hidden=true;
    bolumTuslari.forEach((t,i)=>t.setAttribute('aria-pressed',String(i===Number(pastane))));
    const liste=h('div.kitap-yemekler',{'data-sayfa':pastane?'pastane':'mutfak'});
    const tarifler: Array<[KitapTarifi,string]>=pastane
      ?tatliKademeler.flatMap(k=>tatliMi(k.simge)?[[k.simge,k.ad] as [TatliCesidi,string]]:[])
      :[...(Object.entries(adlar) as Array<[Yemek,string]>),...(Object.keys(tezgahlar) as KitapTezgahi[]).map(id=>[id,tezgahlar[id].ad] as [KitapTezgahi,string])];
    const kapasite=darTelefon.matches?6:10;
    const toplam=Math.ceil(tarifler.length/kapasite);
    if(odak)sayfa=Math.floor(Math.max(0,tarifler.findIndex(([id])=>id===odak))/kapasite);
    sayfa=Math.min(sayfa,toplam-1);
    liste.dataset.dar=String(darTelefon.matches);
    for(const [id,ad] of tarifler.slice(sayfa*kapasite,(sayfa+1)*kapasite)){
      const fotograf=kitapTezgahi(id)?tezgahlar[id].gorsel():tatliMi(id)?tatliResmi(id):h('img',{src:ayar.yemekResmi(id),alt:''});
      const b=dugme(ad+' tarifini incele','kitap-yemek',fotograf,h('span',{},ad));
      b.dataset.kitapYemek=id;
      if(ayrac?.id===id){
        b.append(h('i.kitap-ayraci',{'aria-hidden':true}));
        b.setAttribute('aria-description',(ayrac.sira+1)+'. adımda kaldın.');
      }
      b.onclick=()=>{
        konu=id;sira=ayrac?.id===id?ayrac.sira:0;
        if(id==='kurabiye'&&ayrac?.id===id)sekil=kurabiyeSekliniOku(ayrac.sekil);
        goster(b.matches(':focus-visible')?'sag':undefined);
      };
      liste.append(b);
    }
    alan.replaceChildren(liste);
    alan.dataset.cokSayfa=String(toplam>1);
    if(toplam>1){
      const yon=(geri:boolean)=>{
        const tus=dugme(geri?'Önceki tarif sayfası':'Sonraki tarif sayfası','dugme',ikon(geri?'geri':'ileri'));
        tus.disabled=geri?sayfa===0:sayfa===toplam-1;
        tus.onclick=()=>{
          sayfa+=geri?-1:1;yemekler();
          alan.querySelector<HTMLButtonElement>('.kitap-sayfalama button:not(:disabled)')?.focus({preventScroll:true});
        };return tus;
      };
      alan.append(h('nav.kitap-sayfalama',{'aria-label':'Tarif sayfaları'},yon(true),
        h('span',{role:'status'},(sayfa+1)+' / '+toplam),yon(false)));
    }
    if(odak)liste.querySelector<HTMLButtonElement>('[data-kitap-yemek="'+odak+'"]')?.focus({preventScroll:true});
  }
  let kitapKumpiri:KumpirFisi='misirli-kumpir';
  function goster(odak?:'sol'|'sag'){
    if(!konu)return;
    const id=konu, bu=++surum;
    bolumler.hidden=true;alan.dataset.cokSayfa='false';
    kaliplar.hidden=id!=='kurabiye';
    if(!kaliplar.hidden)for(const b of kaliplar.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.sekil===sekil));
    const tatli=tatliMi(id)?id:undefined;
    const kademe=tatliKademeler.findIndex(k=>k.simge===id);
    baslik.textContent=kitapTezgahi(id)?tezgahlar[id].ad:tatli?tatliKademeler[kademe].ad:adlar[id as Yemek];
    const src=tarifKaresi(id,sira,sekil);
    if(surum!==bu||!dialog.isConnected)return;
    const rehber=tatli?pastaneAdimlari[tatli][sira]:undefined;
    const metin=kitapTezgahi(id)?tezgahlar[id].adimlar[sira]:rehber?anlatim[rehber]:adimlar[id as Yemek][sira];
    const sol=dugme(sira?'Önceki adım':'Tariflere dön','dugme',ikon('geri'));
    const uzunluk=kitapTezgahi(id)?tezgahlar[id].adimlar.length:tatli?pastaneAdimlari[tatli].length:adimlar[id as Yemek].length;
    const son=sira===uzunluk-1;
    const kilitli=!!tatli&&kademe>ayar.tatliSeviye;
    const sag=dugme(son?(kilitli?'Pastanede tarif kilidini gör':'Bu yemeği hazırla'):'Sonraki adım','dugme kitap-ileri',ikon(son?kilitli?'kilit':'oyna':'ileri'));
    const geri=(klavye=false)=>{
      if(surum!==bu)return;
      if(sira===0){yemekler(klavye?id:undefined);return;}
      sira--;void goster(klavye?'sol':undefined);
    };
    ayir(id,sira);
    const ileri=(klavye=false)=>{
      if(surum!==bu)return;
      if(son){ayir();if(kitapTezgahi(id))ayar.tezgahAc(id,id==='kumpir'?kitapKumpiri:tezgahlar[id].menu);else if(tatli)ayar.pastaneyeGit(tatli,id==='kurabiye'?sekil:undefined);else ayar.oyna(id as Yemek);return;}
      sira++;void goster(klavye?'sag':undefined);
    };
    sol.onclick=()=>geri(sol.matches(':focus-visible'));
    sag.onclick=()=>ileri(sag.matches(':focus-visible'));
    const yemekCizimi=h('img',{src,alt:metin});
    const ses=dugme(metin,'kitap-resim',yemekCizimi,h('span.kitap-dinle',{},ikon('hoparlor')));
    const dinle=()=>{
      if(!ayar.sesli())return;
      if(rehber)void tatliAdiminiDinle(rehber);
      else if(id==='icecek')void konus(karisimAnlatimi[sira]);
      else if(id==='menemen')void menemenRehberi((['dogra','sotele','kir','pisir'] as const)[sira]);
      else if(id==='durum')void durumRehberi((['diz','sar','kes'] as const)[sira]);
      else if(id==='omlet')void konus(new URL(`../../assets/sef/omlet-kitap/adim-${sira+1}.mp3`,import.meta.url).href);
      else ayar.soyle(metin);
    };
    jest(ses,{
      birak:(yer,ilk,tik)=>{
        if(tik){dinle();return;}
        const dx=yer.x-ilk.x,dy=yer.y-ilk.y;
        if(Math.abs(dx)<Math.max(28,ses.clientWidth*.12)||Math.abs(dx)<Math.abs(dy)*1.3)return;
        if(dx>0&&sira>0)geri();
        else if(dx<0&&!son)ileri();
      },klavye:dinle,
    });
    const ilerleme=h('div.kitap-noktalar',{'aria-label':(sira+1)+' / '+uzunluk});
    for(let i=0;i<uzunluk;i++){
      const adim=dugme((i+1)+'. adımı aç','kitap-adim-karti',h('img',{alt:'',src:tarifKaresi(id,i,sekil)}));
      adim.setAttribute('aria-current',i===sira?'step':'false');
      adim.onclick=()=>{
        if(i!==sira){sira=i;goster();alan.querySelector<HTMLButtonElement>('[aria-current="step"]')?.focus({preventScroll:true});}
      };ilerleme.append(adim);
    }
    alan.replaceChildren(h('div.kitap-acilim',{},sol,ses,sag),ilerleme);
    if(id==='kumpir'&&son){
      const onizle=()=>{
        ses.querySelector('.kp-kitap-sunum')?.remove();
        yemekCizimi.hidden=kitapKumpiri!=='misirli-kumpir';
        if(yemekCizimi.hidden){
          const kart=kumpirOrnegi(kumpirFisleri[kitapKumpiri]);kart.classList.add('kp-kitap-sunum');
          ses.prepend(kart);
        }
      };
      onizle();
      const fisler=h('div.kp-kitap-fisleri',{role:'group','aria-label':'Hazırlayacağın kumpir'});
      for(const tercih of ['misirli-kumpir','kumpir-kasar-bezelye','kumpir-koz-zeytin','kumpir-uc-renk'] as const){
        const malzemeler=kumpirFisleri[tercih];
        const tus=dugme(malzemeler.map(k=>kumpirAd[k]).join(', ')+' siparişini seç','kp-kitap-fisi',...malzemeler.map(k=>kumpirResmi(k)));
        tus.setAttribute('aria-pressed',String(kitapKumpiri===tercih));
        tus.onclick=()=>{kitapKumpiri=tercih;onizle();for(const b of fisler.children)b.setAttribute('aria-pressed',String(b===tus));};
        fisler.append(tus);
      }
      ilerleme.replaceChildren(fisler);
    }
    if(odak)(odak==='sag'?sag:sol).focus({preventScroll:true});
    dinle();
    if(!son){const ileriResmi=new Image();ileriResmi.src=tarifKaresi(id,sira+1,sekil);}
  }
  dialog.addEventListener('cancel',e=>{e.preventDefault();ayar.kapat();});
  const boyut=()=>{if(!konu)yemekler();};
  darTelefon.addEventListener('change',boyut);
  const kaldirildi=new MutationObserver(()=>{
    if(!dialog.isConnected){darTelefon.removeEventListener('change',boyut);kaldirildi.disconnect();}
  });
  kaldirildi.observe(yer,{childList:true});
  yemekler();yer.append(dialog);dialog.showModal();
}
