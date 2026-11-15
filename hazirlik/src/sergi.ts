import { simge } from './cizim';
import { sergi, rafKarti, sesCiftleri, tepsiler, sergiAsamasi, sergiSozu, siradakiCizgi, murekkep, type SergiDefteri } from './sergi-defteri';
import type { Nokta } from './defter';
import { yazilar, yolNoktalari, type Isaret } from './yazi-yollari';
import { meyveKarti, yaziyiOku, type MeyveIsareti } from './serbest-yazi';
import pastel from '../../assets/hazirlik/etkinlik/kalemlik-0.webp';
import { efekt } from '../../src/audio/efekt';

const cizgi=(d:string,stil:string)=>'<path class="'+stil+'" d="'+d+'" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
const kagit=(ic:string,ad:string,stil='')=>'<svg class="'+stil+'" viewBox="0 0 240 232" role="img" aria-label="'+ad+'">'+ic+'</svg>';
const tus=(id:string,ad:string,ic:string,ek='')=>'<button type="button" data-sergi="'+id+'" aria-label="'+ad+'" '+ek+'>'+ic+'</button>';
type Baglar={sanat:(ad:string)=>string;konus:(ad:string)=>void;dokun:()=>void;kaydet:()=>void;nota:(n:number)=>void;bitir:()=>void};
function elYazisi(d:SergiDefteri,key:Isaret){
  return (d.izler[key]??[]).map(n=>cizgi(murekkep(n),'sergi-iz')).join('');
}
export function sergiEtiketi(d:SergiDefteri,i:number,sanat:Baglar['sanat']){
  const k=rafKarti(d,i);
  return '<span class="sergi-etiket">'+kagit(elYazisi(d,k.sayi),'Yazdığın '+k.sayi)+sanat(k.sanat)+kagit(elYazisi(d,k.harf),'Yazdığın '+k.harf)+'</span>';
}
export function minonunEtiketi(d:SergiDefteri,sanat:Baglar['sanat']){
  const meyve=meyveKarti(d.limon);
  const yaz=(key:MeyveIsareti)=>kagit(d.limon.izler[key].map(n=>cizgi(murekkep(n),'sergi-iz')).join(''),'Kendi yazdığın '+key);
  return '<span class="sergi-etiket">'+yaz('2')+sanat(meyve.sanat)+yaz(meyve.harf)+'</span>';
}
function kagitNoktasi(svg:SVGSVGElement,ev:PointerEvent):Nokta{
  const p=new DOMPoint(ev.clientX,ev.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
  return [Math.round(Math.max(0,Math.min(240,p.x))),Math.round(Math.max(0,Math.min(232,p.y)))];
}
export function sergiTahtasi(d:SergiDefteri,sanat:Baglar['sanat']){
  const asama=sergiAsamasi(d),k=rafKarti(d,d.kart);
  if(asama==='sergi')return '<div class="sergi-tahta-nesne">'+sergi.map((_,i)=>sanat(rafKarti(d,i).sanat)).join('')+'</div>';
  if(asama==='serbest')return '<div class="sergi-tahta-nesne">'+sanat(meyveKarti(d.limon).sanat).repeat(2)+'</div>';
  if(asama==='yerlestir'||asama==='asildi')return sergiEtiketi(d,d.kart,sanat);
  if(asama==='say')return '<div class="sergi-tahta-nesne">'+sanat(k.sanat)+'</div>';
  if(asama==='ses')return kagit(yazilar[k.harf].yollar.map(y=>cizgi(y,'sergi-tahta-harfi')).join(''),k.harf+' rafı');
  const key=asama==='sayi'?k.sayi:k.harf;
  const sirada=siradakiCizgi(d,key);
  return kagit(yazilar[key].yollar.map((y,i)=>cizgi(y,i===sirada?'sergi-tebesir':i<sirada?'sergi-tahta-harfi':'sergi-tahta-sonra')).join(''),key+' yazılışı','sergi-tahta-yazi');
}
export function sergiyiAc(masa:HTMLElement,bolum:HTMLElement,d:SergiDefteri,is:Baglar){
  const tahta=bolum.querySelector<HTMLElement>('.et-tahta')!;
  const ogretmen=bolum.querySelector<HTMLButtonElement>('.ders-ceren')!;
  const ses=()=>is.konus(sergiSozu(d));
  const animasyonlar:Animation[]=[];
  let yardimSayisi=0;
  let denenenTepsi:number|null=null;
  let denenenSes:number|null=null;
  let sesDenemesi=0;
  let kagittaGoster:(()=>void)|undefined;
  function ornekOynat(){
    for(const a of animasyonlar)a.cancel();
    animasyonlar.length=0;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let zaman=0;
    for(const path of tahta.querySelectorAll<SVGPathElement>('.sergi-tebesir')){
      const boy=path.getTotalLength(),sure=Math.max(450,boy*7);
      path.style.strokeDasharray=String(boy);
      animasyonlar.push(path.animate([{strokeDashoffset:boy},{strokeDashoffset:0}],{duration:sure,delay:zaman,fill:'both',easing:'ease-in-out'}));
      zaman+=sure+160;
    }
  }
  ogretmen.onclick=()=>{
    is.dokun();const asama=sergiAsamasi(d);
    if(asama==='sergi')is.konus('yazi_sergi');
    else if(asama==='asildi')is.konus('yazi_'+rafKarti(d,d.kart).ad+'_oku');
    else ses();
    ornekOynat();kagittaGoster?.();
  };
  for(const [yer,kim] of [['.sira-mino','mino'],['.sira-zipzip','zip']]){
    bolum.querySelector<HTMLButtonElement>(yer)!.onclick=()=>{
      is.dokun();const asama=sergiAsamasi(d);
      if(asama==='sergi'&&kim==='mino'&&d.limon.asama==='kapali'){is.konus('mino_sergi_'+d.limon.meyve);return}
      const ipucu=asama==='ses'?'_ses_oyunu':asama==='say'?'_tepsi':asama==='yerlestir'||asama==='asildi'?'_raf':'_kalem';
      is.konus(kim+ipucu);
    };
  }
  function raflar(secilebilir:boolean){
    return '<div class="sergi-vitrin"><div class="sergi-dolap">'+sergi.map((_,i)=>{
      const k=rafKarti(d,i);
      const asili=i<d.kart||(i===d.kart&&d.asili);
      const nesneler='<span class="sergi-raf-grubu">'+Array.from({length:i+1},()=>is.sanat(k.sanat)).join('')+'</span>';
      const kart=asili?sergiEtiketi(d,i,is.sanat):'<span class="sergi-bos-kart"></span>';
      return tus((secilebilir?'masa-':'oku-')+i,k.isim+' rafı',kart+nesneler,(!secilebilir&&!asili?'disabled ':'')+'class="sergi-raf-sirasi'+(asili?' etiketli':'')+'"');
    }).join('')+'</div></div>';
  }
  function sesMasasi(){
    const k=rafKarti(d,d.kart);
    const harf=kagit(yazilar[k.harf].yollar.map(y=>cizgi(y,'sergi-harf-ornegi')).join(''),k.harf);
    const ipucu=sesDenemesi<2?'':is.sanat(k.sanat);
    const hedef='<div class="sergi-ses-hedef">'+tus('soru','Ceren’in sorusunu tekrar dinle',simge('ses'),'class="sergi-soru-sesi"')+harf+
      '<span class="sergi-resim-yeri">'+ipucu+'</span></div>';
    const adaylar=sesCiftleri[d.kart].map((s,i)=>'<div class="sergi-secim-grubu" data-sozcuk="'+s.ses+'">'+
      tus('ses-'+i,s.ad+' seç',is.sanat(s.sanat)+(i===denenenSes?'<span class="sergi-duyulan">'+s.ilk+'</span>':''),'class="sergi-nesne-karti"')+
      tus('dinle-'+i,s.ad+' sözcüğünü dinle',is.sanat('sergi-dinle'),'class="sergi-kelime-sesi"')+'</div>').join('');
    return hedef+'<div class="sergi-ses-cifti" role="group" aria-label="'+k.harf+' sesiyle başlayan nesneyi seç">'+adaylar+'</div>';
  }
  function tepsiMasasi(){
    const k=rafKarti(d,d.kart),adet=d.kart+1,hazir=d.sayilan.length===adet;
    const secilen=d.dagitim?d.sayilan.length:hazir?adet:(denenenTepsi??0);
    const cep=k.ad==='marakas',kap=cep?'sergi-cep':'sergi-tabak';
    const yerler=Array.from({length:adet},(_,i)=>{
      const dolu=d.dagitim?d.sayilan.includes(i):i<secilen;
      return '<span data-tabak="'+i+'" class="sergi-tabak'+(!dolu&&secilen&&!d.dagitim?' eksik':'')+'">'+
        is.sanat(kap)+(dolu?is.sanat(k.sanat):'')+'</span>';
    }).join('');
    const ornek='<span class="sergi-tek-yer'+(cep?' sergi-ornek-cep':'')+'">'+is.sanat(kap)+is.sanat(k.sanat)+'</span>';
    const durum=adet+' '+(cep?'cep':'tabak')+', '+Math.min(secilen,adet)+' dolu';
    const raf=tus('soru',cep?'Her cebe bir marakas koyma sorusunu dinle':'Her tabağa bir meyve koyma sorusunu dinle',is.sanat('sergi-dinle')+ornek,'class="sergi-raf-istegi"')+
      '<div class="sergi-tabak-rafi'+(cep?' sergi-cepler':'')+'" role="img" aria-label="'+durum+'">'+yerler+'</div>';
    if(hazir)return raf+tus('kalem','Sayıyı yazmaya başla',is.sanat('kalemlik-0')+'<span class="sergi-kucuk-kagit"></span>','class="sergi-kalem-al"');
    if(d.dagitim){
      const kalan=adet-d.sayilan.length;
      const parcalar=Array.from({length:kalan},(_,i)=>tus('pay-'+i,k.isim+' al',is.sanat(k.sanat),'class="sergi-pay"')).join('');
      return raf+'<div class="sergi-pay-tepsisi">'+is.sanat('sergi-tepsi')+'<div class="sergi-paylar">'+parcalar+'</div></div>';
    }
    const tepsi=tepsiler[d.kart].map(n=>{
      const denendi=denenenTepsi===n;
      const nesneler=Array.from({length:n},(_,i)=>'<span'+(denendi&&i<adet?' class="aktarildi"':'')+'>'+is.sanat(k.sanat)+'</span>').join('');
      const geri=denendi?'<span class="sergi-tepsi-geri">'+simge('yenile')+'</span>':'';
      return tus(denendi?'geri-koy':'tepsi-'+n,denendi?'Eşyaları bu tepsiye geri koy':n+' '+k.isim+' olan tepsiyi dene',is.sanat('sergi-tepsi')+
        '<span class="sergi-tepsi-ic" data-adet="'+n+'">'+nesneler+'</span>'+geri,'class="sergi-tepsi"');
    }).join('');
    return raf+'<div class="sergi-tepsiler">'+tepsi+'</div>';
  }
  function yerineGotur(kaynak:DOMRect,hedef:Element|null,gecikme=0){
    if(!hedef||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const son=hedef.getBoundingClientRect();if(!son.width||!son.height)return;
    const dx=kaynak.left+kaynak.width/2-son.left-son.width/2,dy=kaynak.top+kaynak.height/2-son.top-son.height/2;
    const olcek=Math.min(4,Math.max(.35,kaynak.width/son.width));
    hedef.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+olcek+')'},{transform:'translate(0,0) scale(1)'}],
      {duration:440,delay:gecikme,easing:'cubic-bezier(.22,.72,.27,1)',fill:'backwards'});
  }
  function serbestSayfa(){
    const k=d.limon,meyve=meyveKarti(k),key=k.asama==='sayi'?'2':meyve.harf,izler=k.izler[key];
    const rehber=k.yardim?yazilar[key].yollar.map(y=>cizgi(y,'sergi-rehber')).join(''):'';
    const silgi=tus('sil','Son çizgiyi geri al',is.sanat('kalemlik-4'),izler.length?'':'disabled');
    const ipucu=tus('iz','Öğretmenin izini göster',is.sanat('kalemlik-0'),'aria-pressed="'+k.yardim+'"');
    const gonder=tus('teslim','Yazımı öğretmene göster',simge('ileri'),izler.length?'':'disabled');
    masa.innerHTML='<div class="sergi-yazi-bas">'+minonunEtiketi(d,is.sanat)+'</div><div class="sergi-defter">'+
      kagit('<path class="sergi-satir" d="M30 185H210"/>'+rehber+'<g class="serbest-murekkep">'+izler.map(n=>cizgi(murekkep(n),'sergi-iz')).join('')+'</g>'+cizgi('','sergi-iz yeni'),meyve.isim+' kartına '+key+' yaz','sergi-kagit')+'</div><div class="sergi-kalemlik">'+ipucu+silgi+gonder+'</div>';
    const svg=masa.querySelector<SVGSVGElement>('.sergi-kagit')!,yeni=svg.querySelector<SVGPathElement>('.yeni')!;
    let aktif:number|null=null,noktalar:Nokta[]=[];
    function ciz(ev:PointerEvent){
      const p=kagitNoktasi(svg,ev),son=noktalar.at(-1);
      if(son&&Math.hypot(p[0]-son[0],p[1]-son[1])<2)return;
      if(noktalar.length>=445)noktalar=noktalar.filter((_,i)=>i%2===0);
      noktalar.push(p);
    }
    svg.onpointerdown=ev=>{
      if(aktif!==null||ev.button!==0)return;
      if(izler.length>=40){is.konus('yazi_silgi');return}
      ev.preventDefault();is.dokun();aktif=ev.pointerId;svg.setPointerCapture(aktif);noktalar=[];ciz(ev);
    };
    svg.onpointermove=ev=>{
      if(ev.pointerId!==aktif)return;
      for(const e of ev.getCoalescedEvents?.()??[])ciz(e);
      ciz(ev);yeni.setAttribute('d',murekkep(noktalar));
    };
    svg.onpointerup=ev=>{
      if(aktif!==ev.pointerId)return;aktif=null;ciz(ev);
      if(noktalar.length>1){
        izler.push(noktalar);is.kaydet();
        svg.querySelector('.serbest-murekkep')!.insertAdjacentHTML('beforeend',cizgi(murekkep(noktalar),'sergi-iz'));
        masa.querySelector('.sergi-yazi-bas')!.innerHTML=minonunEtiketi(d,is.sanat);
        masa.querySelector<HTMLButtonElement>('[data-sergi=sil]')!.disabled=false;
        masa.querySelector<HTMLButtonElement>('[data-sergi=teslim]')!.disabled=false;
      }
      yeni.setAttribute('d','');
    };
    svg.onpointercancel=svg.onlostpointercapture=ev=>{if(aktif===ev.pointerId){aktif=null;yeni.setAttribute('d','')}};
  }
  function yenile(){
    kagittaGoster=undefined;
    const asama=sergiAsamasi(d),k=rafKarti(d,d.kart);
    masa.dataset.tur='yazi';masa.dataset.asama=asama;
    tahta.innerHTML=sergiTahtasi(d,is.sanat);ornekOynat();
    if(asama==='serbest'){serbestSayfa();return}
    if(asama==='sergi'||asama==='asildi'){
      const meyve=meyveKarti(d.limon);
      const istek=d.limon.asama==='bitti'?minonunEtiketi(d,is.sanat):is.sanat(meyve.sanat).repeat(2);
      masa.innerHTML=raflar(false)+'<div class="sergi-son-alt">'+(asama==='sergi'?tus('istek',d.limon.asama==='bitti'?meyve.isim+' kartını oku':'Mino için '+d.limon.meyve+' kartı yaz',istek,'class="sergi-mino-karti"'):'')+tus(asama==='sergi'?'devam':'sonraki',asama==='sergi'?'Derse devam et':'Sıradaki kart',simge('ileri'),'class="sergi-ileri"')+'</div>';
      return;
    }
    if(asama==='say'){
      masa.innerHTML=tepsiMasasi();
      return;
    }
    if(asama==='yerlestir'){
      masa.innerHTML=raflar(true)+tus('etiket','Yazdığın kartı rafa taşı',sergiEtiketi(d,d.kart,is.sanat),'class="sergi-kart-el"');
      return;
    }
    if(asama==='ses'){
      masa.innerHTML=sesMasasi();
      return;
    }
    const key=asama==='sayi'?k.sayi:k.harf,parca=siradakiCizgi(d,key);
    const yollar=yazilar[key].yollar,izler=d.izler[key]??=[];
    const iz=izler[parca]??(izler[parca]=[]),hedef=yolNoktalari(yollar[parca]);
    const [x,y]=hedef[iz.length];
    const yon=hedef[Math.min(iz.length+4,hedef.length-1)],yonAcisi=Math.atan2(yon[1]-y,yon[0]-x)*180/Math.PI;
    const yonOku='<path class="sergi-yon-oku" d="M-5 -4 L0 0 L-5 4" transform="translate('+yon.join(' ')+') rotate('+yonAcisi+')"/>';
    // Çocuğun gerçekten yazdığı işaretler kart üzerinde birikir.
    const tekrarla=tus('ornek','Ceren bu çizgiyi tekrar göstersin',is.sanat('sergi-dinle'),'class="sergi-kelime-sesi"');
    const ust='<div class="sergi-yazi-bas" data-alan="'+asama+'">'+tekrarla+sergiEtiketi(d,d.kart,is.sanat)+'</div>';
    const sayfa=kagit('<path class="sergi-satir" d="M30 185H210"/>'+yollar.map((y,i)=>cizgi(y,i===parca?'sergi-rehber':'sergi-soluk')).join('')+
      izler.map((n,i)=>cizgi(murekkep(n),i===parca?'sergi-iz simdi':'sergi-iz')).join('')+
      yonOku+'<circle class="sergi-basla" cx="'+x+'" cy="'+y+'" r="8"/>',key+' yazma kâğıdı','sergi-kagit');
    masa.innerHTML=ust+'<div class="sergi-defter">'+sayfa+'</div>';
    const svg=masa.querySelector<SVGSVGElement>('.sergi-kagit')!,kalem=svg.querySelector<SVGPathElement>('.simdi')!,nokta=svg.querySelector('circle')!;
    let parmak:number|null=null,son:Nokta|null=null,eski=iz.length;
    let gosterim:SVGGElement|null=null;
    function ornegiKaldir(){gosterim?.remove();gosterim=null}
    kagittaGoster=()=>{
      ornegiKaldir();
      if(parmak!==null||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const kalan=hedef.slice(Math.max(0,iz.length-1));if(kalan.length<2)return;
      const grup=document.createElementNS('http://www.w3.org/2000/svg','g');gosterim=grup;
      grup.setAttribute('aria-hidden','true');grup.setAttribute('pointer-events','none');
      grup.innerHTML=cizgi(murekkep(kalan),'sergi-ornek-iz')+'<image href="'+pastel+'" width="43" height="21"/>';
      svg.insertBefore(grup,nokta);
      const yol=grup.querySelector('path')!,uc=grup.querySelector('image')!,boy=yol.getTotalLength();
      const basla=performance.now(),sure=Math.min(3400,Math.max(1000,boy*12));
      yol.style.strokeDasharray=String(boy);
      const kare=(an:number)=>{
        if(!grup.isConnected)return;
        const oran=Math.max(0,Math.min(1,(an-basla)/sure)),n=yol.getPointAtLength(boy*oran);
        yol.style.strokeDashoffset=String(boy*(1-oran));
        uc.setAttribute('transform','translate('+n.x+' '+n.y+') rotate(-28) translate(-2 -10)');
        if(oran<1)requestAnimationFrame(kare);else setTimeout(()=>grup.remove(),350);
      };
      kare(basla);
    };
    kagittaGoster();
    function ilerlet(p:Nokta){
      if(iz.length>=hedef.length)return;
      const ilk=iz.length;
      if(ilk===0){
        if(Math.hypot(p[0]-hedef[0][0],p[1]-hedef[0][1])<=(yardimSayisi>=2?22:15))iz.push([Math.round(p[0]),Math.round(p[1])]);
        return;
      }
      // Parmağı, sıradaki birkaç kısa doğru parçasının en yakınına izdüşür.
      // Eğrinin içinden geçen çocuk küçük bir örneği kaçırsa da kaldığı yerden ilerler.
      let uzak=Infinity,konum=ilk-1;
      for(let j=ilk-1;j<Math.min(ilk+4,hedef.length-1);j++){
        const a=hedef[j],b=hedef[j+1],dx=b[0]-a[0],dy=b[1]-a[1];
        const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));
        const fark=Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
        if(fark<uzak){uzak=fark;konum=j+t}
      }
      if(uzak>(yardimSayisi>=2?22:16))return;
      const uc=hedef[hedef.length-1],ucaGeldi=hedef.length-ilk<=2&&Math.hypot(p[0]-uc[0],p[1]-uc[1])<=6;
      const sonOrnek=ucaGeldi?hedef.length-1:Math.floor(konum+.25);
      const adet=sonOrnek-ilk+1,once=iz[ilk-1];
      for(let j=1;j<=adet;j++){
        iz.push([Math.round(once[0]+(p[0]-once[0])*j/adet),Math.round(once[1]+(p[1]-once[1])*j/adet)]);
      }
    }
    function hamle(ev:PointerEvent){
      const p=kagitNoktasi(svg,ev),a=son??p,n=Math.max(1,Math.ceil(Math.hypot(p[0]-a[0],p[1]-a[1])/3));
      for(let j=1;j<=n;j++)ilerlet([a[0]+(p[0]-a[0])*j/n,a[1]+(p[1]-a[1])*j/n]);
      son=p;kalem.setAttribute('d',murekkep(iz));
      const bas=hedef[Math.min(iz.length,hedef.length-1)];nokta.setAttribute('cx',String(bas[0]));nokta.setAttribute('cy',String(bas[1]));
    }
    svg.onpointerdown=ev=>{
      if(parmak!==null||ev.button!==0)return;ev.preventDefault();ornegiKaldir();is.dokun();eski=iz.length;
      svg.classList.add('yaziliyor');
      parmak=ev.pointerId;son=null;svg.setPointerCapture(ev.pointerId);hamle(ev);
    };
    svg.onpointermove=ev=>{if(parmak===ev.pointerId){for(const p of ev.getCoalescedEvents?.()??[])hamle(p);hamle(ev)}};
    const birak=(ev:PointerEvent)=>{
      if(parmak!==ev.pointerId)return;
      if(ev.type==='pointerup')hamle(ev);parmak=null;son=null;
      svg.classList.remove('yaziliyor');
      if(iz.length<hedef.length){
        const a=hedef[iz.length],b=hedef[Math.min(iz.length+4,hedef.length-1)];
        svg.querySelector('.sergi-yon-oku')!.setAttribute('transform','translate('+b.join(' ')+') rotate('+Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI+')');
      }
      if(iz.length>eski)is.kaydet();
      if(iz.length===hedef.length){
        yardimSayisi=0;is.nota(2);yenile();ses();
      }else if(ev.type==='pointerup'&&iz.length-eski<2){
        yardimSayisi++;svg.classList.toggle('birlikte-yaz',yardimSayisi>=2);
        if(yardimSayisi<=2)is.konus('yazi_devam');
        kagittaGoster?.();
      }
    };
    svg.onpointerup=svg.onpointercancel=svg.onlostpointercapture=birak;
  }
  function secim(b:HTMLButtonElement){
    if(b.disabled)return;const id=b.dataset.sergi!,i=Number(id.split('-')[1]);is.dokun();
    if(id==='devam'){is.bitir();return}
    if(id==='ornek'){ses();ornekOynat();kagittaGoster?.();return}
    if(id==='etiket'){ses();return}
    if(id==='istek'){
      if(d.limon.asama==='bitti'){tahta.innerHTML=minonunEtiketi(d,is.sanat);is.konus('yazi_'+meyveKarti(d.limon).ses+'_oku');return}
      d.limon.asama='sayi';is.kaydet();yenile();ses();return;
    }
    if(sergiAsamasi(d)==='serbest'){
      const k=d.limon,meyve=meyveKarti(k),key=k.asama==='sayi'?'2':meyve.harf;
      const ipucu=key==='2'?'yazi_limon_iki_ipucu':key==='A'?'yazi_armut_karti_ipucu':'yazi_limon_le_ipucu';
      if(id==='iz'){k.yardim=!k.yardim;if(k.yardim)is.konus(ipucu)}
      else if(id==='sil')k.izler[key].pop();
      else if(id==='teslim'){
        const sonuc=yaziyiOku(k.izler[key],key);
        if(sonuc!=='hazir'){is.konus(sonuc==='kopru'?'yazi_a_kopru':ipucu);return}
        k.asama=key==='2'?'harf':'bitti';k.yardim=false;is.nota(2);is.kaydet();yenile();
        is.konus(k.asama==='bitti'?(k.meyve==='limon'?'mino_sergi_tesekkur':'mino_armut_tesekkur'):sergiSozu(d));return;
      }
      is.kaydet();serbestSayfa();return;
    }
    if(id==='kalem'){d.kalem=true;is.kaydet();yenile();ses();return}
    if(id==='sonraki'){
      d.kart++;d.sayilan=[];d.dagitim=false;d.kalem=false;d.asili=false;d.sesBulundu=false;
      denenenTepsi=null;denenenSes=null;sesDenemesi=0;
      if(d.donus){is.bitir();return}
      is.kaydet();yenile();ses();return;
    }
    if(id==='soru'){ses();return}
    if(id.startsWith('pay-')){paylastir(b);return}
    if(id==='geri-koy'){
      const yerler=Array.from(masa.querySelectorAll('.sergi-tabak>img:nth-child(2)'),el=>el.getBoundingClientRect());
      const n=denenenTepsi;denenenTepsi=null;yenile();
      const tepsi=masa.querySelectorAll('[data-sergi="tepsi-'+n+'"] .sergi-tepsi-ic img');
      yerler.forEach((yer,j)=>yerineGotur(yer,tepsi[j],j*80));return;
    }
    if(id.startsWith('dinle-')){is.konus('yazi_ad_'+sesCiftleri[d.kart][i].ses);return}
    if(id.startsWith('oku-')){
      tahta.innerHTML=sergiEtiketi(d,i,is.sanat);
      masa.querySelector('.sergi-raf-okunuyor')?.classList.remove('sergi-raf-okunuyor');b.classList.add('sergi-raf-okunuyor');
      is.konus('yazi_'+rafKarti(d,i).ad+'_oku');return;
    }
    if(id.startsWith('tepsi-')){
      const adet=d.kart+1;denenenTepsi=i;
      const kaynaklar=Array.from(b.querySelectorAll('.sergi-tepsi-ic>span'),el=>el.getBoundingClientRect());
      if(i===adet){denenenTepsi=null;d.dagitim=true;is.kaydet();yenile();ses();return}
      yenile();
      masa.querySelectorAll('.sergi-tabak>img:nth-child(2)').forEach((el,j)=>yerineGotur(kaynaklar[j],el,j*140));
      if(i<adet)efekt.karinGurultusu();
      is.konus(i<adet?(d.kart===2?'yazi_az_cep':'yazi_az'):'yazi_fazla');
    }else if(id.startsWith('ses-')){
      if(!sesCiftleri[d.kart][i].es){denenenSes=i;sesDenemesi++;yenile();is.konus('yazi_'+sergi[d.kart].ad+'_fark');return}
      const kaynak=b.querySelector('img')!.getBoundingClientRect();
      d.sesBulundu=true;is.kaydet();is.nota(2);yenile();yerineGotur(kaynak,masa.querySelector('.sergi-yazi-bas .sergi-etiket img'));ses();
    }else if(id.startsWith('masa-')){
      if(i!==d.kart){
        is.konus('yazi_'+rafKarti(d,i).ad+'_raf');b.focus();
        if(!matchMedia('(prefers-reduced-motion: reduce)').matches)b.querySelector('.sergi-raf-grubu')?.animate(
          [{transform:'translateY(0)'},{transform:'translateY(-9%)'},{transform:'translateY(0)'}],{duration:420});
        return;
      }
      const kaynak=masa.querySelector('.sergi-kart-el .sergi-etiket')!.getBoundingClientRect();
      d.asili=true;is.kaydet();is.nota(3);yenile();yerineGotur(kaynak,masa.querySelector('[data-sergi="oku-'+i+'"] .sergi-etiket'));ses();
    }
  }
  function paylastir(b:HTMLButtonElement,hedef?:HTMLElement){
    if(!d.dagitim)return;
    const tabak=hedef??Array.from(masa.querySelectorAll<HTMLElement>('[data-tabak]')).find(el=>!d.sayilan.includes(Number(el.dataset.tabak)));
    if(!tabak)return;
    const i=Number(tabak.dataset.tabak);
    if(d.sayilan.includes(i))return;
    const bas=b.querySelector('img')!.getBoundingClientRect();
    is.dokun();d.sayilan.push(i);
    d.dagitim=d.sayilan.length<d.kart+1;
    is.kaydet();yenile();
    yerineGotur(bas,masa.querySelector('[data-tabak="'+i+'"] img:nth-child(2)'));
    if(d.kart===2)efekt.sinifCalgisi(1);else is.nota(d.sayilan.length);
    if(d.dagitim)is.konus('say_'+d.sayilan.length);else ses();
  }
  const tusuBul=(ev:Event)=>(ev.target as Element).closest<HTMLButtonElement>('button[data-sergi]');
  let basili:{id:number;b:HTMLButtonElement;x:number;y:number;hedef:Element|null;surukleniyor:boolean}|null=null;
  let sonDokunus:HTMLButtonElement|null=null;
  let fareDugmesi:HTMLButtonElement|null=null;
  const rafBul=(x:number,y:number)=>Array.from(masa.querySelectorAll<HTMLButtonElement>('[data-sergi^="masa-"]')).find(b=>{
    const r=b.getBoundingClientRect();return x>=r.left-6&&x<=r.right+6&&y>=r.top-4&&y<=r.bottom+4;
  });
  masa.onpointerdown=ev=>{
    sonDokunus=null;
    const b=tusuBul(ev);if(!b||b.disabled||ev.button!==0||basili)return;
    fareDugmesi=ev.pointerType==='mouse'?b:null;
    const hedef=b.matches('.sergi-nesne-karti')?masa.querySelector('.sergi-ses-hedef'):
      b.matches('[data-sergi^="tepsi-"],.sergi-pay')?masa.querySelector('.sergi-tabak-rafi'):b.matches('.sergi-kart-el')?masa.querySelector('.sergi-dolap'):null;
    if(!hedef&&ev.pointerType==='mouse')return;
    basili={id:ev.pointerId,b,x:ev.clientX,y:ev.clientY,hedef,surukleniyor:false};
    if(hedef)b.setPointerCapture(ev.pointerId);
  };
  masa.onpointermove=ev=>{
    if(!basili?.hedef||ev.pointerId!==basili.id)return;
    const dx=ev.clientX-basili.x,dy=ev.clientY-basili.y;
    if(!basili.surukleniyor&&Math.hypot(dx,dy)<10)return;
    basili.surukleniyor=true;
    if(basili.b.dataset.sergi==='etiket'){
      masa.querySelector('.sergi-raf-uzerinde')?.classList.remove('sergi-raf-uzerinde');
      rafBul(ev.clientX,ev.clientY)?.classList.add('sergi-raf-uzerinde');
    }else basili.hedef.classList.add('sergi-birakma-yeri');
    basili.b.classList.add('sergi-elde');basili.b.style.transform='translate('+dx+'px,'+dy+'px)';
  };
  function birak(){
    if(!basili)return;
    basili.hedef?.classList.remove('sergi-birakma-yeri');
    masa.querySelector('.sergi-raf-uzerinde')?.classList.remove('sergi-raf-uzerinde');
    basili.b.classList.remove('sergi-elde');basili.b.style.removeProperty('transform');basili=null;
  }
  masa.onpointerup=ev=>{
    if(!basili||ev.pointerId!==basili.id)return;
    const {b,x,y,hedef,surukleniyor}=basili;
    const sinir=hedef?.getBoundingClientRect();
    const icinde=sinir&&ev.clientX>=sinir.left-10&&ev.clientX<=sinir.right+10&&ev.clientY>=sinir.top-10&&ev.clientY<=sinir.bottom+10;
    sonDokunus=b;
    if(surukleniyor&&b.matches('.sergi-pay')){
      const tabak=Array.from(masa.querySelectorAll<HTMLElement>('[data-tabak]')).find(el=>{
        const r=el.getBoundingClientRect();return ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;
      });
      if(tabak)paylastir(b,tabak);
    }else if(surukleniyor&&b.dataset.sergi==='etiket'){
      const raf=rafBul(ev.clientX,ev.clientY);if(raf)secim(raf);
    }else if(surukleniyor?icinde:tusuBul(ev)===b&&Math.hypot(ev.clientX-x,ev.clientY-y)<18)secim(b);
    birak();
  };
  masa.onpointercancel=masa.onlostpointercapture=ev=>{if(basili?.id===ev.pointerId){sonDokunus=basili.b;birak()}};
  // Önceki sahnede parmak kalktıktan sonra tarayıcı yeni sahneye click gönderebilir.
  // Kabul edilen fare tıklaması aynı düğmede başlamış olmalı.
  masa.onclick=ev=>{const b=tusuBul(ev);if(b&&(!ev.detail||(!sonDokunus&&b===fareDugmesi)))secim(b);sonDokunus=null;fareDugmesi=null};
  yenile();
}
