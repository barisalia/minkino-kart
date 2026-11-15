import { yasGrubu } from './yas-grubu';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { cerenSustur } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { IKON } from '../../src/ui/ikonlar';
import { harfOrnegi, unluKaydi, harfTabaklari, ogrenilecekUnluler, resimTabaklari, unluler, type Ders, type Lokma } from './obur-tabaklari';
import { resim } from './resimler';
import './harf-kutusu.css';

const pozlar=import.meta.glob<string>('../../assets/alfabe/obur/*.webp',{eager:true,query:'?url',import:'default'});
type Ses=(id:string,bitince?:()=>void)=>void;
type Mod='resim'|'harf';
type Nokta={x:number;y:number};
type Asama='oyun'|'ders'|'son';
export function harfKutusuKur(alan:HTMLElement,ders:Ders,oku:Ses,sonraki:()=>void) {
  const kayitAnahtari='minkino-obur-tabak-v1-'+ders.id;
  let onceki;
  try{onceki=JSON.parse(dersKaydiniOku(kayitAnahtari)||'null');}catch{/* Eski kayıt okunamazsa yeni tabak açılır. */}
  const tohum=Number.isInteger(onceki?.tohum)?onceki.tohum:Math.floor(Math.random()*4294967296);
  let durumSayisi=tohum;
  function rastgele(){
    durumSayisi=(Math.imul(1664525,durumSayisi)+1013904223)>>>0;
    return durumSayisi/4294967296;
  }
  const tabaklar={resim:resimTabaklari(ders,yasGrubu,rastgele),harf:harfTabaklari(ders,yasGrubu,rastgele)};
  const calisma={resim:{sira:0,yenen:new Set<string>()},harf:{sira:0,yenen:new Set<string>()}};
  const biten=new Set<Mod>();
  const sakin=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mod:Mod='resim', asama:Asama='oyun', dersGoruldu=false, kapali=false, kilit=false, yanlis=0, nesil=0;
  let zaman=0, bekleyen=0, sesSirasi=0, beklemeDenetimi:(()=>void)|undefined;
  let surukleme:{b:HTMLButtonElement;id:number;bas:Nokta;hareket:boolean}|undefined;
  try{

    if(onceki){
      for(const m of ['resim','harf'] as const){
        if(onceki[m]?.bitti===true)biten.add(m);
        if(Number.isInteger(onceki[m]?.sira)&&onceki[m].sira>=0&&onceki[m].sira<tabaklar[m].length)calisma[m].sira=onceki[m].sira;
        const tabak=tabaklar[m][calisma[m].sira];
        if(Array.isArray(onceki[m]?.yenen)){
          for(const id of tabak.hedefler)if(onceki[m].yenen.includes(id))calisma[m].yenen.add(id);
          if(calisma[m].yenen.size===tabak.hedefler.length){
            if(calisma[m].sira===tabaklar[m].length-1)biten.add(m);
            else calisma[m].sira++;
            calisma[m].yenen.clear();
          }
        }
      }
      mod=onceki.mod==='harf'?'harf':'resim';
      dersGoruldu=onceki.dersGoruldu===true;
      asama=biten.has(mod)?'son':mod==='harf'&&!dersGoruldu?'ders':'oyun';
    }
  }catch{/* Eski bir kayıt açılamazsa ilk tabaktan başla. */}
  function sakla(){
    dersKaydiniYaz(kayitAnahtari,JSON.stringify({tohum,mod,dersGoruldu,resim:{yenen:[...calisma.resim.yenen],sira:calisma.resim.sira,bitti:biten.has('resim')},harf:{yenen:[...calisma.harf.yenen],sira:calisma.harf.sira,bitti:biten.has('harf')}}));
  }
  let hayalet:HTMLElement|undefined, ucus:Animation|undefined;
  alan.innerHTML='<section class="hk"><header class="hk-ust"><h1>Obur Harf Canavarı</h1><button type="button" class="at-ses hk-dinle" aria-label="Yönergeyi dinle">'+IKON.hoparlor+'</button></header>'+
    '<nav class="hk-modlar" aria-label="Canavarın oyunları"><button type="button" data-mod="resim" aria-label="Resim yedir"><img src="'+resim(ders.id)+'" alt=""></button><button type="button" data-mod="harf" aria-label="Harf yedir"><b aria-hidden="true">Aa</b></button></nav>'+
    '<div class="hk-masa"><div class="hk-sol"><div class="hk-ders" hidden></div><div class="hk-kartlar" role="group" aria-label="Obur’un tabağı"></div></div>'+
    '<div class="hk-istasyon"><button class="hk-kutu" type="button" aria-label="Obur’un istediğini dinle" data-poz="bekle">'+
    Object.entries(pozlar).map(([yol,src])=>'<img class="hk-poz" data-ad="'+yol.split('/').pop()!.split('.')[0]+'" alt="" draggable="false" src="'+src+'">').join('')+
    '<span class="hk-gozler" aria-hidden="true"><i></i><i></i></span><span class="hk-etiket"></span></button><div class="hk-lokmalar" aria-label="Bu oyundaki ilerleme"></div></div></div>'+
    '<div class="hk-alt"><p class="hk-durum" role="status"></p><button type="button" class="hk-tekrar" hidden aria-label="Ünlüleri dinle">'+IKON.hoparlor+'</button><button type="button" class="hk-devam" hidden></button></div></section>';
  const kok=alan.querySelector<HTMLElement>('.hk')!, kartlar=kok.querySelector<HTMLElement>('.hk-kartlar')!, anlatim=kok.querySelector<HTMLElement>('.hk-ders')!;
  const obur=kok.querySelector<HTMLButtonElement>('.hk-kutu')!, etiket=kok.querySelector<HTMLElement>('.hk-etiket')!, sayac=kok.querySelector<HTMLElement>('.hk-lokmalar')!;
  const durum=kok.querySelector<HTMLElement>('.hk-durum')!, devam=kok.querySelector<HTMLButtonElement>('.hk-devam')!, dinle=kok.querySelector<HTMLButtonElement>('.hk-dinle')!;
  const tekrar=kok.querySelector<HTMLButtonElement>('.hk-tekrar')!;
  const butonlar=[...kok.querySelectorAll<HTMLButtonElement>('[data-mod]')];
  const mevcut=()=>tabaklar[mod][calisma[mod].sira];
  const simdi=(n:number)=>!kapali && n===nesil;
  function konus(ids:string[],bitince?:()=>void) {
    const token=++sesSirasi;cerenSustur();
    function cal(i:number){if(kapali||token!==sesSirasi)return;if(i===ids.length){bitince?.();return;}oku(ids[i],()=>cal(i+1));} cal(0);
  }
  function yuz(ad:string){obur.dataset.poz=ad;}
  function goz(x?:number,y?:number) {
    const r=obur.getBoundingClientRect();
    const dx=x===undefined?0:x-r.left-r.width*.5,dy=y===undefined?0:y-r.top-r.height*.30;
    const uzunluk=Math.max(r.width*.63,Math.hypot(dx,dy),1);
    obur.style.setProperty('--x',String(dx/uzunluk*31)+'%');
    obur.style.setProperty('--y',String(dy/uzunluk*20)+'%');
  }
  function ilerleme() {
    sayac.replaceChildren(...tabaklar[mod].map((_,i)=>{
      const a=document.createElement('span');
      a.className=biten.has(mod)||i<calisma[mod].sira?'tam':i===calisma[mod].sira?'simdi':'';
      a.setAttribute('aria-label',(i+1)+'. tabak');return a;
    }));
  }
  function gosterKart(k:Lokma) {
    if(k.resim){const img=new Image();img.src=k.resim;img.draggable=false;img.alt='';return img;}
    const s=document.createElement('span');s.className='hk-harf';s.textContent=k.harf!;return s;
  }
  function etiketle() {
    const t=mevcut();
    if(asama!=='oyun'){etiket.textContent=asama==='ders'?'Aa':'♥';return;}
    etiket.replaceChildren();
    if(mod==='resim' && yasGrubu==='2-3' && calisma.resim.sira===0){
      const kart=t.kartlar.find(k=>k.id===t.hedefler[0])!;
      etiket.append(gosterKart(kart));return;
    }
    if(!t.siraIle && t.etiket!=='Ünlü'){etiket.textContent=t.etiket;return;}
    for(const id of t.hedefler){const h=document.createElement('span');h.textContent=id.toLocaleUpperCase('tr');
      if(calisma[mod].yenen.has(id))h.className='yenmis';etiket.append(h);}
  }
  function dersIcerigi(){
    const harfler=ogrenilecekUnluler(ders,yasGrubu);
    anlatim.innerHTML='<div class="hk-unluler"></div><div class="hk-ornek"><img alt=""><b></b></div>';
    const grup=anlatim.querySelector<HTMLElement>('.hk-unluler')!;
    function ornekGoster(h:string){
      const d=harfOrnegi(h);
      anlatim.querySelector<HTMLImageElement>('.hk-ornek img')!.src=resim(d.id);
      anlatim.querySelector<HTMLElement>('.hk-ornek b')!.textContent=h;
      etiket.textContent=h;
    }
    ornekGoster(harfler[0]);
    for(const h of harfler){
      const b=document.createElement('button');b.type='button';b.textContent=h+' '+h.toLocaleLowerCase('tr');b.onclick=()=>{
        grup.querySelector('.duyuldu')?.classList.remove('duyuldu');b.classList.add('duyuldu');ornekGoster(h);konus([unluKaydi(h)]);
      };grup.append(b);
    }
  }
  function tarif(){
    if(kilit)return;
    if(asama==='ders')konus(['obur-derse','obur-dinle']);
    else if(asama==='son')konus([mod==='resim'?'obur-nesne-son':'obur-son']);
    else konus(mevcut().sesler);
  }
  function birak(){
    const eski=surukleme;surukleme=undefined;
    if(eski?.b.hasPointerCapture(eski.id))eski.b.releasePointerCapture(eski.id);
    eski?.b.classList.remove('hk-tutuldu');
    hayalet?.remove();hayalet=undefined;
    if(!kilit)yuz('bekle');
  }
  function temizle(){beklemeDenetimi=undefined;ornekHareket?.cancel();nesil++;sesSirasi++;clearTimeout(zaman);clearTimeout(bekleyen);cerenSustur();birak();ucus?.cancel();ucus=undefined;kok.querySelectorAll('.hk-ucan,.hk-konfeti').forEach(el=>el.remove());kilit=false;goz();}
  function ileriDugmesi(ad:string) {
    devam.setAttribute('aria-label',ad);devam.innerHTML=IKON.oyna;
  }
  function ciz(){
    temizle();const t=mevcut();yanlis=0;sakla();
    kok.dataset.lokma=String(calisma[mod].sira+1);kok.dataset.asama=asama;kok.dataset.mod=mod;
    butonlar.forEach(b=>{b.disabled=false;b.setAttribute('aria-pressed',String(b.dataset.mod===mod));});
    kartlar.replaceChildren();kartlar.hidden=asama!=='oyun';anlatim.hidden=asama!=='ders';devam.hidden=asama==='oyun';
    tekrar.hidden=mod!=='harf'||asama!=='oyun';tekrar.disabled=false;
    yuz(asama==='son'?'tok':'bekle');etiketle();ilerleme();
    if(asama==='ders'){
      dersIcerigi();durum.textContent='';ileriDugmesi('Harfleri yedir');tarif();return;
    }
    if(asama==='son'){
      anlatim.hidden=false;
      const tepsi=document.createElement('div');tepsi.className='hk-bitmis-tabak';tepsi.setAttribute('aria-label','Obur’a verdiğin lokmalar');
      const gorulen=new Set<string>();
      for(const tur of tabaklar[mod])for(const id of tur.hedefler){
        if(gorulen.has(id))continue;
        gorulen.add(id);
        const k=tur.kartlar.find(k=>k.id===id)!;
        const lokma=document.createElement('button');lokma.type='button';lokma.setAttribute('aria-label',k.ad+' dinle');
        lokma.append(gosterKart(k));lokma.onclick=()=>konus([k.ses]);tepsi.append(lokma);
      }
      anlatim.replaceChildren(tepsi);
      durum.textContent=mod==='resim'?'Resim tabağını bitirdin!':'Ünlüleri buldun!';
      ileriDugmesi('Derse devam et');tarif();return;
    }
    kartlar.dataset.adet=String(t.kartlar.length);
    for(const k of t.kartlar){
      const b=document.createElement('button');b.type='button';b.className='hk-kart';b.dataset.kart=k.id;b.setAttribute('aria-label',k.ad);
      b.append(gosterKart(k));if(calisma[mod].yenen.has(k.id)){b.classList.add('hk-alindi');b.disabled=true;}
      kartlar.append(b);kartKur(b,k);
    }
    durum.textContent=t.soru;tarif();
  }
  function modAc(yeni:Mod){
    mod=yeni;asama=biten.has(mod)?'son':mod==='harf'&&!dersGoruldu?'ders':'oyun';ciz();
  }
  let ornekHareket:Animation|undefined;
  function yoluGoster(kart:HTMLButtonElement){
    ornekHareket?.cancel();
    if(sakin)return;
    const ilk=kart.getBoundingClientRect(), son=obur.getBoundingClientRect();
    const src=kart.firstElementChild!.cloneNode(true) as HTMLElement;
    src.classList.add('hk-yol-ornek');src.setAttribute('aria-hidden','true');
    const x=ilk.left+ilk.width/2,y=ilk.top+ilk.height/2;
    src.style.left=x+'px';src.style.top=y+'px';kok.append(src);
    const hareket=src.animate([
      {transform:'translate(-50%,-50%) scale(.8)',opacity:0},
      {transform:'translate(-50%,-50%) scale(.8)',opacity:.9,offset:.2},
      {transform:'translate(-50%,-50%) translate('+(son.left+son.width*.5-x)+'px,'+(son.top+son.height*.46-y)+'px) scale(.35)',opacity:0}
    ],{duration:1150,easing:'ease-in-out'});
    ornekHareket=hareket;void hareket.finished.catch(()=>{}).finally(()=>src.remove());
  }
  function kutla(){
    if(sakin)return;
    const sus=document.createElement('div');sus.className='hk-konfeti';sus.setAttribute('aria-hidden','true');
    for(let i=0;i<9;i++){const p=document.createElement('i');p.style.setProperty('--aci',(-85+i*21)+'deg');p.style.background=['#f0b42f','#399c8d','#ed7365'][i%3];sus.append(p);}
    obur.after(sus); 
  }
  function ver(b:HTMLButtonElement,k:Lokma,bas?:Nokta){
    if(kilit||asama!=='oyun'||b.disabled||kapali)return;
    const t=mevcut(),yenmis=calisma[mod].yenen;
    const beklenen=t.hedefler.find(h=>!yenmis.has(h))!;
    const dogru=t.siraIle?k.id===beklenen:t.hedefler.includes(k.id);
    kilit=true;tekrar.disabled=true;butonlar.forEach(btn=>btn.disabled=true);sesSirasi++;cerenSustur();birak();const tok=++nesil;
    const r=b.getBoundingClientRect(), yuzAlan=obur.getBoundingClientRect(), orta={x:r.left+r.width*.5,y:r.top+r.height*.5};
    const agiz={x:yuzAlan.left+yuzAlan.width*.5,y:yuzAlan.top+yuzAlan.height*.46};
    const ilk=bas??orta, imge=gosterKart(k);imge.classList.add('hk-ucan');
    imge.style.left=ilk.x+'px';imge.style.top=ilk.y+'px';imge.style.width=imge.style.height=Math.min(r.width*.7,94)+'px';kok.append(imge);
    const kare=(p:Nokta,s:number)=>({transform:'translate(-50%,-50%) translate('+(p.x-ilk.x)+'px,'+(p.y-ilk.y)+'px) scale('+s+')'});
    b.classList.add('hk-tutuldu');yuz('ac');goz(ilk.x,ilk.y);
    if(!sakin)ucus=imge.animate(dogru?[kare(ilk,1),kare(agiz,.14)]:[kare(ilk,1),{...kare(agiz,.26),offset:.44},{...kare({x:(agiz.x+orta.x)/2,y:Math.min(agiz.y,orta.y)-32},.72),offset:.73},kare(orta,1)],{duration:dogru?350:830,fill:'both',easing:'ease-in-out'});
    else imge.hidden=true;
    zaman=window.setTimeout(()=>{
      if(!simdi(tok))return;
      yuz(dogru?'tok':'eksi');oyunSesi(dogru?'kutu':'geri');
      let geriBildirimBitti=false, hareketBitti=false, kartBitti=false;
      function sesBitti(){geriBildirimBitti=true;if(hareketBitti)kartiBitir();}
      if(dogru){
        yenmis.add(k.id);sakla();b.classList.add('hk-alindi');b.disabled=true;etiketle();kutla();
        durum.textContent=mod==='resim'?k.ad+'!':k.ad+' bir ünlü.';
        konus([k.ses],sesBitti);
      }else{
        yanlis++;const buyuk=k.ad.toLocaleUpperCase('tr');
        if(mod==='resim'){
          durum.textContent=ders.lower==='ğ'?k.ad+' sözcüğünde ğ yok. '+t.soru:k.ad+', '+buyuk[0]+' ile başlıyor. '+t.soru;
          konus([k.ses, ...(yanlis===1?['obur-bir-daha']:[]), ...t.sesler],sesBitti);
        }else{
          const sirasi=unluler.includes(buyuk);
          durum.textContent=sirasi?'Önce '+beklenen.toLocaleUpperCase('tr')+' harfini ver.':k.ad+' bir ünsüz. '+t.soru;
          konus(sirasi?[t.siraIle?'obur-sira':'obur-esle',unluKaydi(beklenen)]:['obur-unsuz'],sesBitti);
        }
        if(yanlis>=(yasGrubu==='2-3'?1:2)) [...kartlar.children].find(el=>(el as HTMLElement).dataset.kart===beklenen)?.classList.add('hk-ipucu');
      }
      function kartiBitir(){
        if(!simdi(tok)||kartBitti)return;
        kartBitti=true;beklemeDenetimi=undefined;
        clearTimeout(bekleyen);ucus?.cancel();imge.remove();kok.querySelector('.hk-konfeti')?.remove();b.classList.remove('hk-tutuldu');kilit=false;tekrar.disabled=false;butonlar.forEach(btn=>btn.disabled=false);goz();
        if(dogru&&yenmis.size===t.hedefler.length){
          if(calisma[mod].sira+1===tabaklar[mod].length){biten.add(mod);asama='son';ciz();}
          else{calisma[mod].sira++;yenmis.clear();ciz();}
        }else{
          yuz('bekle');
          const ipucu=kartlar.querySelector<HTMLButtonElement>('.hk-ipucu');
          if(!dogru&&ipucu)yoluGoster(ipucu);
          if(dogru){durum.textContent=t.soru; kartlar.querySelector<HTMLButtonElement>('.hk-kart:not(:disabled)')?.focus({preventScroll:true});}
        }
      }
      bekleyen=window.setTimeout(()=>{
        hareketBitti=true;
        if(geriBildirimBitti)kartiBitir();
        else {
          beklemeDenetimi=()=>{
            clearTimeout(bekleyen);
            if(!document.hidden)bekleyen=window.setTimeout(kartiBitir,18000);
          };
          beklemeDenetimi();
        }
      },sakin?550:dogru?950:610);
    },sakin?30:350);
  }
  function kartKur(b:HTMLButtonElement,k:Lokma){
    let tikIptal=false;
    b.onclick=e=>{if(e.detail&&tikIptal)return;ver(b,k);};
    b.onpointerdown=e=>{
      if(kilit||surukleme||e.button!==0||!e.isPrimary)return;
      ornekHareket?.cancel();tikIptal=false;surukleme={b,id:e.pointerId,bas:{x:e.clientX,y:e.clientY},hareket:false};b.setPointerCapture(e.pointerId);yuz('ac');goz(e.clientX,e.clientY);
    };
    b.onpointermove=e=>{
      if(surukleme?.b!==b||surukleme.id!==e.pointerId)return;
      const {bas}=surukleme;
      if(!surukleme.hareket&&Math.hypot(e.clientX-bas.x,e.clientY-bas.y)<7)return;
      if(!surukleme.hareket){surukleme.hareket=true;tikIptal=true;hayalet=gosterKart(k);hayalet.classList.add('hk-tasinan');kok.append(hayalet);b.classList.add('hk-tutuldu');oyunSesi('kagit');}
      hayalet!.style.left=e.clientX+'px';hayalet!.style.top=e.clientY+'px';
    };
    b.onpointerup=e=>{
      if(surukleme?.id!==e.pointerId)return;
      const tasindi=surukleme.hareket;
      const r=obur.getBoundingClientRect(), pay=yasGrubu==='2-3'?22:10;
      const hedef=e.clientX>=r.left-pay&&e.clientX<=r.right+pay&&e.clientY>=r.top-pay&&e.clientY<=r.bottom+pay;
      birak();if(tasindi&&hedef)ver(b,k,{x:e.clientX,y:e.clientY});
      else if(tasindi){durum.textContent='Kartı Obur’un ağzına bırak.';konus(['obur-birak']);}
    };
    b.onlostpointercapture=b.onpointercancel=e=>{if(surukleme?.id===e.pointerId){tikIptal=true;birak();}};
  }
  kok.onpointermove=e=>{if(!kilit)goz(e.clientX,e.clientY);};
  kok.onpointerleave=()=>{if(!surukleme)goz();};
  function yonDegisti(){if(surukleme){const eski=surukleme;eski.b.dispatchEvent(new PointerEvent('pointercancel',{pointerId:eski.id}));}}
  function gorunurlukDegisti(){
    if(document.hidden){birak();ornekHareket?.cancel();}
    beklemeDenetimi?.();
  }
  document.addEventListener('visibilitychange',gorunurlukDegisti);
  window.addEventListener('resize',yonDegisti);
  butonlar.forEach(b=>b.onclick=()=>{if(b.dataset.mod!==mod)modAc(b.dataset.mod as Mod);});
  obur.onclick=dinle.onclick=tarif;
  tekrar.onclick=()=>{if(!kilit&&mod==='harf'){asama='ders';ciz();}};
  devam.onclick=()=>{
    if(asama==='ders'){dersGoruldu=true;asama='oyun';ciz();}
    else if(asama==='son'){temizle();dersKaydiniYaz(kayitAnahtari,null);sonraki();}

  };
  ciz();
  return ()=>{kapali=true;temizle();document.removeEventListener('visibilitychange',gorunurlukDegisti);window.removeEventListener('resize',yonDegisti);kok.remove();};
}
