import { kucukGrup, tamDers } from './yas-grubu';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import dersler from './harfler.json';
import { cerenSustur, cerenYuzu } from './konusma-dersi';
import { resim } from './resimler';
import { IKON } from '../../src/ui/ikonlar';
import { heceler, parcaSesi } from './hece-sozlugu';
import { trambolinKur } from './trambolin';

import './hece-oyunu.css';

const sozcukler = dersler.filter(d => heceler[d.id]);
const sec = <T>(dizi: T[]) => dizi[Math.floor(Math.random()*dizi.length)];
type Asama = 'alkis' | 'sirala' | 'birles' | 'sonuc';
type Oku = (id: string, sonra?: () => void, oynarken?:(saniye:number)=>void) => void;
const ilerlemeAnahtari='minkino-bagimsiz-hece-v1';
const gorulenAnahtari='minkino-hece-gorulen-sozcukler-v1';

type SozcukTekrarlari={kez:Record<string,number>;son:string[]};
function sozcukTekrarlariniOku():SozcukTekrarlari{
  const kayit:SozcukTekrarlari={kez:{},son:[]};
  try{
    const ham=dersKaydiniOku(gorulenAnahtari);
    if(!ham || ham.length>600)return kayit;
    const veri=JSON.parse(ham);
    for(const {id} of sozcukler){
      const sayi=veri?.kez?.[id];
      if(Number.isSafeInteger(sayi)&&sayi>0)kayit.kez[id]=sayi;
    }
    if(Array.isArray(veri?.son))kayit.son=veri.son.filter((id:unknown)=>sozcukler.some(d=>d.id===id));
  }catch{/* Okunamayan eski kayıtta bütün sözcükler ilk kez görülür. */}
  return kayit;
}

function yeniRota(){
  const gecmis=sozcukTekrarlariniOku();
  function siradaki(adaylar:typeof sozcukler){
    const enAz=Math.min(...adaylar.map(d=>gecmis.kez[d.id]??0));
    const azGorulen=adaylar.filter(d=>(gecmis.kez[d.id]??0)===enAz);
    const farkli=azGorulen.filter(d=>!gecmis.son.includes(d.id));
    return sec(farkli.length?farkli:azGorulen);
  }
  const iki=sozcukler.filter(d=>heceler[d.id].length===2);
  const ilk=gecmis.son.length?siradaki(iki):iki.find(d=>d.id==='19')!;
  const rota=[ilk,siradaki(iki.filter(d=>d!==ilk))];
  if(!kucukGrup)rota.push(gecmis.son.length?siradaki(sozcukler.filter(d=>heceler[d.id].length===3)):sozcukler.find(d=>d.id==='23')!);
  return rota;
}
type TurKaydi={rota:string[];tur:number;asama:Asama;sira:number;taslar:string[]};
function turuOku():TurKaydi|undefined{
  try{
    const ham=dersKaydiniOku(ilerlemeAnahtari);
    if(!ham||ham.length>1200)return;
    const k=JSON.parse(ham);
    if(!Array.isArray(k.rota)||!(k.rota.length===(kucukGrup?2:3)||(!tamDers&&k.rota.length===2))||new Set(k.rota).size!==k.rota.length||
      !k.rota.every((id:unknown,i:number)=>typeof id==='string'&&sozcukler.some(d=>d.id===id)&&heceler[id].length===(i===2?3:2))||
      !Number.isInteger(k.tur)||k.tur<0||k.tur>=k.rota.length||!['alkis','sirala','birles','sonuc'].includes(k.asama)||
      !Number.isInteger(k.sira)||k.sira<0||k.sira>heceler[k.rota[k.tur]].length||!Array.isArray(k.taslar))return;
    const parcalar=heceler[k.rota[k.tur]],hepsi=Object.values(heceler).flat();
    if((k.asama==='birles'||k.asama==='sonuc')&&k.sira!==parcalar.length)return;
    if(k.taslar.length&&
      (k.taslar.length!==parcalar.length+(tamDers&&k.tur?1:0)||new Set(k.taslar).size!==k.taslar.length||
      !parcalar.every(h=>k.taslar.includes(h))||!k.taslar.every((h:unknown)=>typeof h==='string'&&hepsi.includes(h))))return;
    return k;
  }catch{return;}
}

export function heceOyunuKur(alan: HTMLElement, oku: Oku, bitir: () => void): () => void {
  const onceki=turuOku();
  const rota=onceki ? onceki.rota.map(id=>sozcukler.find(d=>d.id===id)!) : yeniRota();
  const ana = document.createElement('section');
  ana.className = 'ho';
  ana.setAttribute('aria-label','Hece Oyunu');
  ana.innerHTML = '<div class="ho-sol">' + cerenYuzu('ho-ogretmen') + '</div>' +
    '<div class="ho-ders"><div class="ho-bas"><div class="ho-ilerleme" role="img"></div>' +
    '<button type="button" class="ho-dinle" aria-label="Ceren’i yeniden dinle">' + IKON.hoparlor + '</button></div>' +
    '<div class="ho-nesne"><img alt="" draggable="false"></div>' +
    '<div class="ho-yuvalar" role="group" aria-label="Sözcüğün heceleri"></div>' +
    '<div class="ho-tepsi"><div class="tr-kok"></div>' +
    '<div class="ho-taslar" role="group" aria-label="Heceleri sırayla seç" hidden></div>' +
    '<div class="tr-son-sesler" role="group" aria-label="Sözcüğün hecelerini yeniden dinle" hidden></div>' +
    '<button type="button" class="ho-ileri" hidden>'+IKON.oyna+'</button></div></div>' +
    '<span role="status" class="ho-durum"></span>';
  alan.replaceChildren(ana);
  const bul = <T extends HTMLElement>(s:string) => ana.querySelector<T>(s)!;
  const yuvalar = bul<HTMLElement>('.ho-yuvalar'), taslar = bul<HTMLElement>('.ho-taslar');
  const park = bul<HTMLElement>('.tr-kok'), dinle = bul<HTMLButtonElement>('.ho-dinle');
  const ileri = bul<HTMLButtonElement>('.ho-ileri'), ilerleme = bul<HTMLElement>('.ho-ilerleme');
  const nesne = bul<HTMLImageElement>('.ho-nesne img'), durum = bul<HTMLElement>('.ho-durum');
  const sonucSesleri=bul<HTMLElement>('.tr-son-sesler');
  let tur=onceki?.tur??0;
  let sira=0;
  let asama:Asama='alkis';
  let parkur:ReturnType<typeof trambolinKur>;
  let tasAdlari:string[]=[];
  let mesgul=false;
  let kapali=false;
  let sesNo=0;
  let bekleme=0;
  const ders=()=>rota[tur];
  const heceListesi=()=>heceler[ders().id];
  const adSesi=()=>'pano-ad-'+ders().id;

  function kaydet(){
    dersKaydiniYaz(ilerlemeAnahtari,JSON.stringify({rota:rota.map(d=>d.id),tur,asama,sira,taslar:tasAdlari}));
  }
  function kilitle(deger:boolean){
    mesgul=deger;
    dinle.disabled=deger;
    for(const dugme of ana.querySelectorAll<HTMLButtonElement>('.tr-yay,.tr-ileri,.ho-tas,.ho-ileri,.tr-son-hece')){
      if(dugme.classList.contains('tr-yay')&&!deger){
        const i=Array.from(park.querySelectorAll('.tr-yay')).indexOf(dugme);
        dugme.disabled=i<sira;
      }else dugme.disabled=deger||dugme.dataset.alindi==='evet';
    }
  }
  function isaret(el?:Element){
    ana.querySelector('.ho-okunan')?.classList.remove('ho-okunan');
    el?.classList.add('ho-okunan');
  }
  function okuSira(ids:string[],basla?:(i:number)=>void,bitti:()=>void=()=>kilitle(false)){
    const no=++sesNo;
    kilitle(true);
    function cal(i:number){
      if(kapali||no!==sesNo)return;
      if(i===ids.length){isaret();bitti();return;}
      let basladi=false;
      const bas=()=>{if(!basladi&&!kapali&&no===sesNo){basladi=true;basla?.(i);}};
      oku(ids[i],()=>{
        if(kapali||no!==sesNo)return;
        bas();
        if(i+1===ids.length)cal(i+1);
        else bekleme=window.setTimeout(()=>cal(i+1),180);
      },bas);
    }
    cal(0);
  }
  function goster(adim:Asama){
    asama=adim;ana.dataset.asama=adim;
    park.hidden=adim!=='alkis';
    taslar.hidden=adim!=='sirala';
    sonucSesleri.hidden=ileri.hidden=adim!=='sonuc';
    yuvalar.classList.toggle('ho-tam',adim==='sonuc');
    yuvalar.replaceChildren(...heceListesi().map((h,i)=>{
      const yer=document.createElement('span');
      yer.className='ho-yuva';
      yer.style.setProperty('--hece-uzunluk',String(h.length));
      yer.setAttribute('aria-label',(i+1)+'. hece');
      if(i<sira)yer.textContent=h;
      return yer;
    }));
  }
  function dinlet(){
    if(mesgul||kapali)return;
    if(asama==='alkis'&&sira===heceListesi().length){okuSira(['zipla-oka-dokun']);return;}
    const ids=asama==='sirala'?['hece-diz',parcaSesi(heceListesi()[sira])]:
      [adSesi(),...heceListesi().map(parcaSesi)];
    okuSira(ids,i=>{
      if(asama==='sirala'&&i===1)isaret(yuvalar.children[sira]);
      else if(asama==='alkis'&&i>0)isaret(park.querySelectorAll('.tr-yay')[i-1]);
      else if(asama==='sonuc'&&i>0)isaret(sonucSesleri.children[i-1]);
    });
  }
  function atla(i:number){
    if(mesgul||kapali||asama!=='alkis')return;
    if(i!==sira||i>=heceListesi().length){
      const fazla=sira===heceListesi().length;
      parkur.yanlis(i,fazla);
      okuSira([fazla?'zipla-fazla-iki':'zipla-sira']);return;
    }
    const h=heceListesi()[i];
    parkur.hazirlan();
    okuSira([parcaSesi(h)],()=>{
      yuvalar.children[i].textContent=h;isaret(yuvalar.children[i]);
      parkur.zipla(i);durum.textContent=h;
    },()=>parkur.inince(()=>{
      if(kapali)return;
      sira=i+1;kaydet();
      if(sira===heceListesi().length)okuSira(['zipla-oka-dokun']);
      else kilitle(false);
    }));
  }
  function karisikTaslar(){
    const hece=heceListesi();
    const adlar=[...hece];
    if(tamDers&&tur>0)adlar.push(sec(Object.values(heceler).flat().filter(h=>!adlar.includes(h))));
    for(let i=adlar.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [adlar[i],adlar[j]]=[adlar[j],adlar[i]];
    }
    if(adlar.slice(0,hece.length).join('')===hece.join(''))adlar.reverse();
    return adlar;
  }
  function tasAsamasi(){
    goster('sirala');
    taslar.replaceChildren(...tasAdlari.map(h=>{
      const b=document.createElement('button');
      b.type='button';b.textContent=h;b.className='ho-tas';
      b.setAttribute('aria-label',h+' hecesi');
      if(heceListesi().slice(0,sira).includes(h))b.dataset.alindi='evet';
      b.onclick=()=>{
        if(mesgul||kapali||b.disabled)return;
        if(h!==heceListesi()[sira]){
          okuSira([parcaSesi(h),'hece-ipucu',parcaSesi(heceListesi()[sira])],i=>isaret(i===0?b:yuvalar.children[sira]));
          return;
        }
        const yer=yuvalar.children[sira];
        okuSira([parcaSesi(h)],()=>{
          b.dataset.alindi='evet';yer.textContent=h;isaret(yer);
        },()=>{
          sira++;
          if(sira===heceListesi().length)sonuc();
          else {kaydet();kilitle(false);}
        });
      };
      return b;
    }));
    kaydet();okuSira(['hece-diz',parcaSesi(heceListesi()[sira])]);
  }
  function sonuc(){
    sira=heceListesi().length;goster('sonuc');kaydet();
    const tam=document.createElement('strong');tam.textContent=ders().example.toLocaleLowerCase('tr');yuvalar.replaceChildren(tam);
    sonucSesleri.replaceChildren(...heceListesi().map(h=>{
      const b=document.createElement('button');b.type='button';b.className='tr-son-hece';b.textContent=h;b.setAttribute('aria-label',h+' hecesini dinle');
      b.onclick=()=>{if(!mesgul)okuSira([parcaSesi(h)],()=>isaret(b));};return b;
    }));
    ileri.setAttribute('aria-label',tur+1===rota.length?'Oyunlara dön':'Sonraki sözcük');
    durum.textContent=ders().example;
    const ids=[adSesi()];
    if(tur+1<rota.length)ids.push('hece-devam');
    else if(rota.length===3)ids.push('hece-bitti');
    okuSira(ids,i=>{if(i===0)isaret(tam);});
  }
  function turuKur(k?:TurKaydi){
    parkur?.kapat();
    sira=k?.sira??0;tasAdlari=k?.taslar??[];taslar.replaceChildren();sonucSesleri.replaceChildren();
    ana.dataset.kelime=ders().id;ana.dataset.tur=String(tur+1);
    nesne.src=resim(ders().id);nesne.alt=ders().example;
    ilerleme.innerHTML=rota.map((_,i)=>'<i class="'+(i<=tur?'ho-dolu':'')+'"></i>').join('');
    ilerleme.setAttribute('aria-label',(tur+1)+' / '+rota.length);
    if(k?.asama==='sonuc'||k?.asama==='birles'||(k?.asama==='sirala'&&sira===heceListesi().length)){sonuc();return;}
    if(k?.asama==='sirala'){if(!tasAdlari.length)tasAdlari=karisikTaslar();tasAsamasi();return;}
    goster('alkis');
    parkur=trambolinKur(park,ders().id,heceListesi(),sira,!tamDers,atla,()=>{
      if(mesgul||kapali||sira!==heceListesi().length)return;
      if(kucukGrup){sonuc();return;}
      sira=0;tasAdlari=karisikTaslar();tasAsamasi();
    });
    kaydet();
    okuSira(sira===heceListesi().length?['zipla-oka-dokun']:tur===0&&!sira?[adSesi(),'zipla-giris']:[adSesi()]);
  }
  function kapat(){
    kapali=true;sesNo++;clearTimeout(bekleme);cerenSustur();parkur?.kapat();ana.remove();
  }
  dinle.onclick=dinlet;
  ileri.onclick=()=>{
    if(mesgul||kapali||asama!=='sonuc')return;
    if(tur+1<rota.length){tur++;turuKur();return;}
    const gecmis=sozcukTekrarlariniOku();gecmis.son=rota.map(d=>d.id);
    for(const id of gecmis.son)gecmis.kez[id]=(gecmis.kez[id]??0)+1;
    dersKaydiniYaz(gorulenAnahtari,JSON.stringify(gecmis));dersKaydiniYaz(ilerlemeAnahtari,null);
    kapat();bitir();
  };
  turuKur(onceki);
  return kapat;
}
