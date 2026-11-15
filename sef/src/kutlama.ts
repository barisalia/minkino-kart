import {h} from '../../src/ui/dom';
import {efekt} from '../../src/audio/efekt';
import {dugme,ikon} from './gorsel';
import {jest,type Nokta} from './hareket';
import {misafirResmi} from './misafir';
import {kremalar,meyveler,type Kutlama,type Meyve} from './kutlama-kaydi';
import './kutlama.css';

const resimler=import.meta.glob<string>(['../../assets/sef/kutlama/*.webp','../../assets/sef/tatli/tart-{cilek,kivi}.webp','../../assets/pasta/susler-cikolata-tek.webp'],{eager:true,query:'?url',import:'default'});
const yiyecekler={cilek:'sef/tatli/tart-cilek',kivi:'sef/tatli/tart-kivi',cikolata:'pasta/susler-cikolata-tek'};
const isim={vanilya:'Vanilya',cilekli:'Çilek',kakao:'Kakao',cilek:'Çilek',kivi:'Kivi',cikolata:'Çikolata'};
const misafirler=[['salata','Mino'],['corba','Lokum'],['pizza','Dede Hasan']] as const;
// Three equal wedges meet at the centre. The same crop follows the slice onto its plate.
const dilimler=['polygon(50% 50%,50% 0,100% 0,100% 79%)','polygon(50% 50%,100% 79%,100% 100%,0 100%,0 79%)','polygon(50% 50%,0 79%,0 0,50% 0)'];
function resim(ad:string,stil=''){
  const yol=ad.includes('/')?ad:'sef/kutlama/'+ad;
  return h('img',{class:stil,src:resimler['../../assets/'+yol+'.webp'],alt:'',draggable:false});
}
function pasta(k:Kutlama){
  const kat=h('span.kutlama-pasta',{},resim('pandispanya','kutlama-kek'));
  if(k.krema)kat.append(resim(k.krema,'kutlama-krema'));
  for(const m of k.meyveler){
    const meyve=resim(yiyecekler[m.tur],'kutlama-meyve');
    meyve.style.left=m.x+'%';meyve.style.top=m.y+'%';kat.append(meyve);
  }
  return kat;
}
export function kutlamaIsareti(){return resim('davet-pastasi','kutlama-isareti');}

export function kutlamaMasasi(k:Kutlama,yaz:()=>void,cik:()=>void,sesli:()=>boolean){
  const yer=h('section.kutlama-masa',{'aria-label':'Üç arkadaşın kutlama pastası'});
  let secili:Meyve='cilek';
  function tik(){if(sesli())efekt.yapis();}
  function yenile(){yaz();goster();}
  function goster(){
    const geri=dugme('Gün sonuna dön','dugme kutlama-geri',ikon('geri'));geri.onclick=cik;
    const istasyon=h('div.kutlama-merkez',{},resim('tabak','kutlama-tabak'));
    const kadran=dugme(k.dilimlendi?'Pastanın kalan dilimleri':k.uflendi?'Pastayı üç dilime kes':k.mum?'Mumun alevini üfle':'Pastaya meyve yerleştir','kutlama-ust',pasta(k));
    istasyon.append(kadran);
    const aletler=h('div.kutlama-aletler',{role:'group','aria-label':'Pastayı hazırla'});
    yer.replaceChildren(geri,istasyon,aletler);
    yer.dataset.adim=k.dilimlendi?'paylas':k.uflendi?'kes':k.mum?'ufle':k.krema?'susle':'krema';
    if(k.dilimlendi){
      kadran.replaceChildren();
      const parcalar=new Map<number,HTMLElement>();
      for(const [i,[kim,ad]] of misafirler.entries()){
        const verildi=k.sunulan.includes(i);
        const musteri=dugme(ad+' için pasta dilimi','kutlama-misafir',misafirResmi(kim,verildi?'tesekkur':'istek'));
        const dilim=pasta(k);
        if(verildi){dilim.style.clipPath=dilimler[k.paylar?.[i]??i];musteri.disabled=true;musteri.append(dilim);musteri.dataset.dolu='true';}
        else{
          const kullanilan=k.sunulan.map(kisi=>k.paylar?.[kisi]??kisi);
          const dilimNo=[0,1,2].find(no=>!kullanilan.includes(no)&&!parcalar.has(no))!;
          dilim.style.clipPath=dilimler[dilimNo];kadran.append(dilim);parcalar.set(dilimNo,dilim);
          musteri.onclick=()=>{if(k.sunulan.includes(i))return;k.paylar??={};k.paylar[i]??=dilimNo;k.sunulan.push(i);tik();yenile();};
        }
        aletler.append(musteri);
      }
      let alinan:HTMLElement|undefined;
      let baslangic:Nokta|undefined;
      function yerineKoy(){
        if(alinan){alinan.style.removeProperty('transform');alinan.style.removeProperty('z-index');}
        alinan=undefined;baslangic=undefined;
        aletler.querySelector('[data-hedef]')?.removeAttribute('data-hedef');
      }
      function hedefBul(n:Nokta){
        return document.elementFromPoint(n.x,n.y)?.closest<HTMLButtonElement>('.kutlama-misafir:not(:disabled)');
      }
      jest(kadran,{
        basla:n=>{
          const r=kadran.getBoundingClientRect();
          const aci=(Math.atan2(n.y-r.top-r.height/2,n.x-r.left-r.width/2)*180/Math.PI+450)%360;
          alinan=parcalar.get(Math.floor(aci/120))??parcalar.values().next().value;
          baslangic=n;
        },
        tasi:n=>{
          if(!alinan||!baslangic)return;
          alinan.style.transform='translate('+ (n.x-baslangic.x)+'px,'+(n.y-baslangic.y)+'px)';
          alinan.style.zIndex='3';
          aletler.querySelector('[data-hedef]')?.removeAttribute('data-hedef');hedefBul(n)?.setAttribute('data-hedef','true');
        },
        birak:(n,_ilk,tiklandi)=>{
          const b=hedefBul(n);
          if(b&&alinan){
            const kisi=Array.from(aletler.children).indexOf(b);
            const dilim=[...parcalar].find(([,el])=>el===alinan)?.[0];
            if(dilim!==undefined){k.paylar??={};k.paylar[kisi]=dilim;b.click();}
          }else if(tiklandi)aletler.querySelector<HTMLButtonElement>('button:enabled')?.focus();
          yerineKoy();
        },
        iptal:yerineKoy,klavye:()=>aletler.querySelector<HTMLButtonElement>('button:enabled')?.focus()
      });      if(k.sunulan.length===3){
        const bitir=dugme('Kutlamayı tamamla','kutlama-bitir',ikon('onay'));bitir.onclick=cik;yer.append(bitir);
      }
      return;
    }
    if(k.uflendi){
      const acilar=[-90,30,150];
      const kesikler=k.kesikler??=[];
      kadran.append(h('span.kutlama-kesikler',{},...acilar.map((aci,i)=>h('i',{style:'--aci:'+aci+'deg','data-kesildi':String(kesikler.includes(i))}))));
      function kes(i:number){
        if(i<0||kesikler.includes(i))return;
        kesikler.push(i);k.dilimlendi=kesikler.length===3;tik();yenile();
      }
      const siradaki=()=>kes(acilar.findIndex((_,i)=>!kesikler.includes(i)));
      function cizgi(n:Nokta,ilk:Nokta,tiklandi:boolean){
        const r=kadran.getBoundingClientRect();
        const merkez={x:r.left+r.width/2,y:r.top+r.height/2};
        const kenar=Math.hypot(n.x-merkez.x,n.y-merkez.y)>Math.hypot(ilk.x-merkez.x,ilk.y-merkez.y)?n:ilk;
        const ic=kenar===n?ilk:n;
        if(!tiklandi&&Math.hypot(ic.x-merkez.x,ic.y-merkez.y)>r.width*.24)return;
        if(Math.hypot(kenar.x-merkez.x,kenar.y-merkez.y)<r.width*.21)return;
        const yon=Math.atan2(kenar.y-merkez.y,kenar.x-merkez.x);
        kes(acilar.findIndex(a=>Math.cos(yon-a*Math.PI/180)>.85));
      }
      jest(kadran,{birak:cizgi,klavye:siradaki});
      const alet=dugme('Pastayı dilimle','kutlama-arac',ikon('tahta'));alet.onclick=siradaki;aletler.append(alet);return;
    }
    if(k.mum){
      const mum=h('span.kutlama-mum',{},resim('mum'),resim('alev','kutlama-alev'));kadran.append(mum);
      const ufle=()=>{if(k.uflendi)return;k.uflendi=true;if(sesli())efekt.ucus();yenile();};
      jest(kadran,{birak:(n,ilk,tiklandi)=>{if(tiklandi||Math.abs(n.x-ilk.x)>18)ufle();},klavye:ufle});
      const b=dugme('Mumu üfle','kutlama-arac',resim('alev'),ikon('ileri'));b.onclick=ufle;aletler.append(b);return;
    }
    if(!k.krema){
      kadran.disabled=true;
      for(const renk of kremalar){
        const b=dugme(isim[renk]+' kreması sür','kutlama-arac',resim(renk));
        b.onclick=()=>{k.krema=renk;degisikligiKaydet();};aletler.append(b);
      }
      return;
    }
    function degisikligiKaydet(){tik();yenile();}
    function koy(n?:Nokta){
      if(k.meyveler.length>=9)return;
      const r=kadran.getBoundingClientRect();
      const aci=(k.meyveler.length*2.4)-1.57;
      const x=n?(n.x-r.left)/r.width*100:50+31*Math.cos(aci);
      const y=n?(n.y-r.top)/r.height*100:50+31*Math.sin(aci);
      if(Math.hypot(x-50,y-50)>42)return;
      k.meyveler.push({tur:secili,x,y});degisikligiKaydet();
    }
    jest(kadran,{birak:(n)=>koy(n),klavye:()=>koy()});
    for(const tur of meyveler){
      const b=dugme(isim[tur]+' seç','kutlama-arac',resim(yiyecekler[tur]));
      const sec=()=>{secili=tur;for(const el of aletler.querySelectorAll('[data-meyve]'))el.setAttribute('aria-pressed',String(el===b));};
      b.dataset.meyve=tur;b.setAttribute('aria-pressed',String(tur===secili));
      jest(b,{birak:(p,_ilk,tiklandi)=>{sec();if(!tiklandi)koy(p);},klavye:sec});aletler.append(b);
    }
    if(k.meyveler.length){
      const sil=dugme('Son süsü geri al','kutlama-geri-al',ikon('geri'));sil.onclick=()=>{k.meyveler.pop();yenile();};
      const mum=dugme('Pasta mumunu yerleştir','kutlama-arac',resim('mum'),ikon('ileri'));
      mum.onclick=()=>{k.mum=true;degisikligiKaydet();};aletler.append(mum);yer.append(sil);
    }
  }
  goster();return yer;
}
