import { kucukGrup } from './yas-grubu';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { kalemYollari } from './yollar';
import { kalemNo, murekkepler } from './kartlar';
import { cerenSustur, cerenYuzu } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { bosBekleyici } from './bos-bekle';
import { An, azHareket, canlanmaCizimi, canlanmaKareleri, isikSac, kabaGore } from './canlanma';
import { harfYuzuAcik, harfYuzuCizimi } from './h14-cizimler';
import { IKON } from '../../src/ui/ikonlar';
import './harf-boyama.css';

type Nokta = {x:number; y:number};
type Ornek = Nokta & {boyali:boolean};
let maskeNo = 0;
const svgNs = 'http://www.w3.org/2000/svg';
const firca = kucukGrup ? 14 : 9;
const isaretReplikleri:Record<string,string> = {İ:'boya-nokta',Ö:'boya-nokta',Ü:'boya-nokta',Ğ:'boya-yay',Ç:'boya-cengel',Ş:'boya-cengel'};

type BoyamaKaydi = {izler:string[]; alan:string; renk:number; tamam:boolean};
function kaydiOku(anahtar:string):BoyamaKaydi|undefined{
  try{
    const ham=dersKaydiniOku(anahtar);
    if(!ham||ham.length>140_000)return;
    const k=JSON.parse(ham);
    if(!Array.isArray(k.izler)||k.izler.length>3000||
       !k.izler.every((d:unknown)=>typeof d==='string'&&/^M[-0-9. Llm]+$/.test(d))||
       typeof k.alan!=='string'||!/^[01]+$/.test(k.alan)||typeof k.tamam!=='boolean')return;
    return {izler:k.izler,renk:kalemNo(k.renk),alan:k.alan,tamam:k.tamam};
  }catch{return;}
}

function uzaklikKaresi(p:Nokta, a:Nokta, b:Nokta) {
  const dx=b.x-a.x, dy=b.y-a.y;
  const uzunluk=dx*dx+dy*dy;
  const oran=uzunluk ? Math.min(1,Math.max(0,((p.x-a.x)*dx+(p.y-a.y)*dy)/uzunluk)) : 0;
  return (p.x-a.x-oran*dx)**2+(p.y-a.y-oran*dy)**2;
}

export function harfBoyamaKur(alan:HTMLElement, ders:{upper:string}, oku:(id:string,sonra?:()=>void)=>void, bitti:()=>void, renkNo=0):()=>void {
  const anahtar='minkino-harf-boyama-v1-'+ders.upper;
  const kayit=kaydiOku(anahtar);
  const seciliRenk=kayit?.renk??kalemNo(renkNo);
  const yollar=kalemYollari(ders.upper), renk=murekkepler[seciliRenk].renk;
  const maske='boy-harf-'+(++maskeNo);
  // Kalın boyama gövdesinin üstünde İ'nin noktası ve Ğ'nin yayı ayrı okunmalı.
  const yayMi=(i:number)=>ders.upper==='Ğ'&&i===1;
  const yayYuksekligi=10;
  const izler=(fark:number, sinif:string)=>yollar.map((d,i)=>{
    const kalinlik=yayMi(i)?5:d.includes('l0.1')?7:14;
    return '<path class="'+sinif+'" d="'+d+'"'+(yayMi(i)?' transform="translate(0 -'+yayYuksekligi+')"':'')+' stroke-width="'+(kalinlik+fark)+'"/>';
  }).join('');
  const ana=document.createElement('section');ana.className='boy';
  ana.style.setProperty('--boy-renk',renk);
  ana.innerHTML='<div class="boy-ogretmen">'+cerenYuzu('boy-ceren')+'</div><div class="boy-kagit">'+
    '<button class="boy-dinle at-ses" type="button" aria-label="Ceren’i yeniden dinle">'+IKON.hoparlor+'</button>'+
    '<svg class="boy-harf" viewBox="-5 -4 110 138" tabindex="0" role="button" aria-label="'+ders.upper+' harfinin içini boya. Klavyede boşluk veya Enter tuşuyla sıradaki bölgeyi boya.">'+
      '<defs><mask id="'+maske+'" maskUnits="userSpaceOnUse" x="-5" y="-4" width="110" height="138"><g fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round">'+izler(0,'boy-iz')+'</g></mask></defs>'+
      '<g fill="none" stroke-linecap="round" stroke-linejoin="round">'+
      '<g stroke="#252823">'+izler(1.7,'boy-kontur')+'</g><g class="boy-ic" stroke="#fffdf6">'+izler(0,'boy-zemin')+'</g></g>'+
      '<g class="boy-murekkep" mask="url(#'+maske+')" fill="none" stroke="'+renk+'" stroke-width="'+(2*firca)+'" stroke-linecap="round" stroke-linejoin="round"></g>'+
      '<circle class="boy-konum" r="4" fill="none" stroke="#a16a26" stroke-width="1" stroke-dasharray="2 1.5" pointer-events="none"/>'+
    '</svg><div class="boy-dolum" role="progressbar" aria-label="Boyanan harf" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></div></section>';
  alan.replaceChildren(ana);
  const svg=ana.querySelector<SVGSVGElement>('.boy-harf')!, murekkep=ana.querySelector<SVGGElement>('.boy-murekkep')!;
  const konum=ana.querySelector<SVGCircleElement>('.boy-konum')!, dolum=ana.querySelector<HTMLElement>('.boy-dolum')!;
  const tekrar=ana.querySelector<HTMLButtonElement>('.boy-dinle')!;
  const gruplar=[...ana.querySelectorAll<SVGPathElement>('.boy-iz')].map((p,sira)=>{
    const uzunluk=p.getTotalLength(),adet=Math.max(1,Math.ceil(uzunluk/2.5));
    const noktalar:Ornek[]=Array.from({length:adet},(_,i)=>{
      const n=p.getPointAtLength(uzunluk*(i+.5)/adet);return {x:n.x,y:n.y-(yayMi(sira)?yayYuksekligi:0),boyali:false};
    });
    return {noktalar,islenen:0,mesafe:yayMi(sira)||adet===1?5:firca};
  });
  const toplam=gruplar.reduce((n,g)=>n+g.noktalar.length,0);
  let boyanan=0,bittiMi=false,kapali=false,gecildi=false,parmak:number|null=null;
  let degisiklik=false,kayitZamani=0,sonIpucu=-1,baslangicKaydi=true;
  let iz:SVGPathElement|undefined,onceki:Nokta|undefined,komutlar='';
  function sakla(){
    clearTimeout(kayitZamani);kayitZamani=0;
    if(!degisiklik||gecildi)return;
    const veri:BoyamaKaydi={
      izler:Array.from(murekkep.children,p=>p.getAttribute('d')!),
      alan:gruplar.flatMap(g=>g.noktalar.map(n=>n.boyali?'1':'0')).join(''),
      renk:seciliRenk,tamam:bittiMi
    };
    let metin=JSON.stringify(veri);
    if(metin.length>138_000||veri.izler.length>2900){
      // Çok uzun karalamayı, dolmuş örnekler üzerinden aynı renkle okunabilir bir ize sıkıştır.
      veri.izler=gruplar.flatMap(g=>g.noktalar.filter(n=>n.boyali).map(n=>'M'+n.x.toFixed(1)+' '+n.y.toFixed(1)+' l.01 0'));
      metin=JSON.stringify(veri);
    }
    dersKaydiniYaz(anahtar,metin);degisiklik=false;
  }
  function kayitIste(){degisiklik=true;if(!kayitZamani)kayitZamani=window.setTimeout(sakla,350);}
  function isaretIpucu(duyur:boolean){
    const ses=isaretReplikleri[ders.upper];
    const detay=ses&&gruplar[0].islenen>=gruplar[0].noktalar.length*.80
      ?gruplar.findIndex((g,i)=>i>0&&g.islenen<g.noktalar.length*.66):-1;
    ana.classList.toggle('boy-isaret',detay>0&&!bittiMi);
    konum.setAttribute('r',detay>0?'6':'4');
    if(detay<1||bittiMi)return;
    const n=gruplar[detay].noktalar.find(p=>!p.boyali)!;
    konum.setAttribute('cx',String(n.x));konum.setAttribute('cy',String(n.y));
    if(duyur&&sonIpucu!==detay){sonIpucu=detay;oku(ses);}
  }
  function goster(yuzde:number) {
    ana.style.setProperty('--boy-oran',String(yuzde/100));
    dolum.setAttribute('aria-valuenow',String(yuzde));
    const hedef=gruplar.find(g=>g.islenen<g.noktalar.length)?.noktalar.find(n=>!n.boyali);
    if(hedef){konum.setAttribute('cx',String(hedef.x));konum.setAttribute('cy',String(hedef.y));}
    isaretIpucu(!baslangicKaydi);
  }
  function birak() {
    const id=parmak;parmak=null;
    if(id!==null&&svg.hasPointerCapture(id))svg.releasePointerCapture(id);
    onceki=undefined;iz=undefined;komutlar='';
  }
  let bitisZamani=0;
  // Damlalar boyanın renginden ayrı, parlak üç renk: harfin üstüne düşünce görünür.
  const DAMLA_RENKLERI=['#f2736b','#f6d04d','#5bb5e0'];
  const an=new An();
  // Bitiş anı (H7): üç boya damlası harfin üstüne düşüp yayılır, harf sevinçle zıplar, üstünde bir gökkuşağı açılır.
  // Astra'nın çizimleri (boyama/boya-damlasi-0…2, gokkusagi-yayi) gelene kadar damlalar boyanın kendi rengiyle,
  // gökkuşağı yıldızlardan bir yay olarak yaşanır. Süresini döndürür (az hareket ayarında 0).
  function bitisAni():number{
    if(azHareket())return 0;
    const kagit=ana.querySelector<HTMLElement>('.boy-kagit')!, r=kabaGore(kagit,svg.querySelector('.boy-ic')!);
    const kareler=canlanmaKareleri('boyama/boya-damlasi',3);
    const yerler=[[.3,.3],[.55,.55],[.74,.78]].map(([x,y])=>({x:r.x+r.w*x,y:r.y+r.h*y}));
    for(const [i,yer] of yerler.entries())an.sonra(i*180,()=>{
      const boy=kareler.length?Math.max(54,r.w*.3):Math.max(22,r.w*.12);
      const damla=an.ekle(kagit,document.createElement(kareler.length?'img':'i'));
      damla.className=kareler.length?'cn-kare boy-damla-astra':'boy-damla';damla.style.setProperty('--damla',DAMLA_RENKLERI[i]);damla.setAttribute('aria-hidden','true');
      if(damla instanceof HTMLImageElement){damla.src=kareler[0];damla.alt='';damla.draggable=false;}
      Object.assign(damla.style,{left:yer.x-boy/2+'px',top:yer.y-boy/2+'px',width:boy+'px',height:boy+'px'});
      const dus=-Math.min(r.h*.55,yer.y+boy);
      an.hareket(damla,[{transform:'translateY('+dus+'px) scale(.8,1.15)',opacity:0},{transform:'translateY('+dus*.7+'px) scale(.8,1.15)',opacity:1,offset:.2},
        {transform:'translateY(0) scale(.9,1.1)',opacity:1}],{duration:300,easing:'cubic-bezier(.5,0,.9,.6)',fill:'forwards'}).finished.then(()=>{
        oyunSesi('damla');
        if(damla instanceof HTMLImageElement){
          // Çarpma ve yayılma kareleri; sonra boya kağıda karışıp söner.
          damla.src=kareler[1];an.sonra(110,()=>{damla.src=kareler[2];});
          an.hareket(damla,[{transform:'scale(1)',opacity:1},{transform:'scale(1.08)',opacity:1,offset:.6},{transform:'scale(1.12)',opacity:0}],
            {duration:620,easing:'ease-out',fill:'forwards'}).finished.then(()=>an.kaldir(damla),()=>{});
          return;
        }
        an.hareket(damla,[{transform:'scale(.9,1.1)',opacity:1},{transform:'scale(2.1,.45)',opacity:.85,offset:.45},{transform:'scale(2.6,.3)',opacity:0}],
          {duration:320,easing:'ease-out',fill:'forwards'}).finished.then(()=>an.kaldir(damla),()=>{});
        for(let n=0;n<6;n++){
          const sicra=an.ekle(kagit,document.createElement('i'));sicra.className='boy-damla boy-sicrama';sicra.style.setProperty('--damla',DAMLA_RENKLERI[i]);sicra.setAttribute('aria-hidden','true');
          const b=boy*(.32+(n%3)*.1),aci=Math.PI*(1.05+n*.18),u=boy*(1.3+(n%2)*.6);
          Object.assign(sicra.style,{left:yer.x-b/2+'px',top:yer.y-b/2+'px',width:b+'px',height:b+'px'});
          an.hareket(sicra,[{transform:'translate(0,0) scale(.6)',opacity:1},{transform:'translate('+Math.cos(aci)*u+'px,'+(Math.sin(aci)*u*.8)+'px) scale(1)',opacity:1,offset:.55},
            {transform:'translate('+Math.cos(aci)*u*1.15+'px,'+(Math.sin(aci)*u*.8+boy*.6)+'px) scale(.5)',opacity:0}],{duration:420,easing:'ease-out',fill:'forwards'})
            .finished.then(()=>an.kaldir(sicra),()=>{});
        }
      },()=>{});
    });
    // Damlalar düşünce harf zıplar, üstünde gökkuşağı açılır.
    an.sonra(880,()=>{
      an.hareket(svg,[{transform:'none'},{transform:'translateY(-3%) scale(1.05)',offset:.4},{transform:'translateY(.6%) scale(.99,1.01)',offset:.75},{transform:'none'}],
        {duration:460,easing:'ease-out'});
      oyunSesi('parilti');
      const cizim=canlanmaCizimi('boyama/gokkusagi-yayi');
      if(cizim){
        const w=Math.min(r.w*1.25,kagit.clientWidth-16),h=w*3/8,img=an.ekle(kagit,document.createElement('img'));
        img.className='boy-gokkusagi';img.src=cizim;img.alt='';img.draggable=false;
        Object.assign(img.style,{left:r.cx-w/2+'px',top:Math.max(4,r.y-h*.62)+'px',width:w+'px',height:h+'px'});
        an.hareket(img,[{clipPath:'inset(0 100% 0 0)',opacity:.4},{clipPath:'inset(0 0 0 0)',opacity:1}],{duration:620,easing:'ease-out',fill:'forwards'});
        return;
      }
      const renkler=['#f2736b','#f7a34b','#f6d04d','#7cc970','#5bb5e0','#8f7be0','#e07bbf'];
      const boy=Math.max(20,r.w*.11),merkez={x:r.cx,y:r.y+r.h*.2},yayX=Math.min(r.w*.7,kagit.clientWidth*.46),yayY=Math.max(boy,Math.min(yayX*.75,merkez.y-boy/2-6));
      renkler.forEach((renk,n)=>{
        const aci=Math.PI*(1.06+n*.88/(renkler.length-1));
        const x=merkez.x+Math.cos(aci)*yayX,y=merkez.y+Math.sin(aci)*yayY;
        an.sonra(n*65,()=>isikSac(an,kagit,x,y,{adet:2,uzaklik:boy*.7,boy:boy*.55,renk,sure:900}));
        an.sonra(n*65,()=>{
          const yildiz=an.ekle(kagit,document.createElement('i'));yildiz.className='cn-isik boy-yay-yildizi';yildiz.setAttribute('aria-hidden','true');
          yildiz.innerHTML=IKON.yildiz;yildiz.style.color=renk;
          Object.assign(yildiz.style,{left:x-boy/2+'px',top:y-boy/2+'px',width:boy+'px',height:boy+'px'});
          an.hareket(yildiz,[{transform:'scale(.2) rotate(-40deg)',opacity:0},{transform:'scale(1.2) rotate(8deg)',opacity:1,offset:.25},
            {transform:'scale(1) rotate(0)',opacity:1,offset:.8},{transform:'scale(.9)',opacity:0}],{duration:1150,easing:'ease-out',fill:'forwards'})
            .finished.then(()=>an.kaldir(yildiz),()=>{});
        });
      });
    });
    return 1750;
  }
  // Fırça (H7): Astra'nın fırçası gelince boyarken parmağı izler; ucu (tuvalde x 90, y 410) parmağın altında durur.
  const fircaSrc=canlanmaCizimi('boyama/firca');
  let fircaEl:HTMLImageElement|undefined;
  function fircayiTasi(e:PointerEvent){
    if(!fircaSrc||bittiMi||azHareket()||parmak!==e.pointerId)return;
    const kagit=ana.querySelector<HTMLElement>('.boy-kagit')!,k=kagit.getBoundingClientRect();
    if(!fircaEl){fircaEl=an.ekle(kagit,document.createElement('img'));fircaEl.className='boy-firca';fircaEl.src=fircaSrc;fircaEl.alt='';fircaEl.draggable=false;}
    const boy=Math.max(64,Math.min(kagit.clientHeight*.3,150));
    fircaEl.classList.remove('boy-firca-gitti');
    Object.assign(fircaEl.style,{width:boy+'px',height:boy+'px',left:e.clientX-k.left-boy*90/500+'px',top:e.clientY-k.top-boy*410/500+'px'});
  }
  const fircayiSakla=()=>fircaEl?.classList.add('boy-firca-gitti');
  function ilerle(){if(!kapali&&!gecildi&&bittiMi){gecildi=true;dersKaydiniYaz(anahtar,null);bitti();}}
  // Paket Harf-H15 · Harf uyanır (2–3 yaş): boyanan harfin yüzü açılır (gözler, gülümseme), göz kırpar; Ceren "Harfin
  // uyandı!" der. Çocuk harfe dokununca harf zıplar, ağzını açıp güler. Birkaç saniye sonra ders kendiliğinden ilerler.
  // Yüz çizimleri gelmeden (h14-cizimler.ts) ya da az hareket ayarında hiç olmaz.
  function harfiUyandir(){
    if(kapali)return;
    const kagit=ana.querySelector<HTMLElement>('.boy-kagit')!, r=kabaGore(kagit,svg.querySelector('.boy-ic')!);
    const gozW=Math.min(r.w*1.1,r.h*.6), agizW=gozW*.46;
    const yuz=(ad:Parameters<typeof harfYuzuCizimi>[0],sinif:string,w:number,h:number,y:number)=>{
      const img=an.ekle(kagit,document.createElement('img'));img.className='boy-yuz '+sinif;img.src=harfYuzuCizimi(ad);img.alt='';img.draggable=false;img.setAttribute('aria-hidden','true');
      Object.assign(img.style,{left:r.cx-w/2+'px',top:y-h/2+'px',width:w+'px',height:h+'px'});return img;
    };
    const goz=yuz('goz-acik','boy-goz',gozW,gozW*2/3,r.y+r.h*.32), agiz=yuz('agiz-gulen','boy-agiz',agizW,agizW*.75,r.y+r.h*.52);
    ana.classList.add('boy-uyandi');
    const kirp=()=>{if(kapali)return;goz.src=harfYuzuCizimi('goz-kirpik');an.sonra(150,()=>{goz.src=harfYuzuCizimi('goz-acik');an.sonra(2300,kirp);});};
    an.sonra(900,kirp);
    kagit.addEventListener('pointerdown',()=>{
      if(kapali||gecildi)return;
      agiz.src=harfYuzuCizimi('agiz-acik');an.sonra(420,()=>{agiz.src=harfYuzuCizimi('agiz-gulen');});
      oyunSesi('parilti');
      for(const el of [svg,goz,agiz])an.hareket(el,[{transform:'none'},{transform:'translateY(-6%) scale(1.06)',offset:.4},{transform:'none'}],{duration:420,easing:'ease-out'});
    });
    oku('boya-uyandi',()=>{bitisZamani=window.setTimeout(ilerle,2600);});
  }
  function tamamla(geriYukleme=false){
    bittiMi=true;bos.kapat();ana.classList.remove('boy-hatirlat');birak();ana.classList.add('boy-tamam');tekrar.disabled=true;
    fircayiSakla();degisiklik=true;sakla();goster(100);oyunSesi('birles');
    const uyan=!geriYukleme&&harfYuzuAcik()&&!azHareket();
    bitisZamani=window.setTimeout(uyan?harfiUyandir:ilerle,Math.max(650,geriYukleme?0:bitisAni()));
  }
  function sur(a:Nokta,b:Nokta){
    const nokta=(p:Nokta)=>p.x.toFixed(1)+' '+p.y.toFixed(1);
    if(!iz){iz=document.createElementNS(svgNs,'path');murekkep.append(iz);komutlar='M'+nokta(a);}
    komutlar+=' L'+nokta(b)+(a.x===b.x&&a.y===b.y?' l.01 0':'');
    iz.setAttribute('d',komutlar);
    // Aynı bölgenin kenarındaki fırça izi de, yüzde değişmese bile geri gelmeli.
    kayitIste();
    let degisti=false;
    for(const grup of gruplar){
      // Nokta ve çengelleri ana gövde taranırken kazara tamamlamayı önle.
      for(const n of grup.noktalar){
        if(!n.boyali&&uzaklikKaresi(n,a,b)<=grup.mesafe**2){
          n.boyali=true;grup.islenen++;boyanan++;degisti=true;
        }
      }
    }
    if(!degisti)return;
    if(boyanan>=toplam*(kucukGrup?.62:.86)&&gruplar.every(g=>g.islenen>=g.noktalar.length*(kucukGrup?.4:.66))){tamamla();return;}
    goster(Math.floor(boyanan*100/toplam));
  }
  function konumAl(e:PointerEvent){
    const m=svg.getScreenCTM();return m?new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()):undefined;
  }
  svg.onpointerdown=e=>{
    if(kapali||bittiMi||parmak!==null||e.button!==0)return;
    let p:Nokta|undefined=konumAl(e);if(!p)return;
    if((e.pointerType==='touch'||e.pointerType==='pen')&&ana.classList.contains('boy-isaret')){
      // Küçük ekranda noktanın çevresi de dokunma hedefidir. En yakın tek noktayı boya.
      const matris=svg.getScreenCTM();
      let mesafe=22;
      for(const grup of gruplar){
        if(!matris||grup.noktalar.length!==1||grup.islenen)continue;
        const n=grup.noktalar[0],ekran=new DOMPoint(n.x,n.y).matrixTransform(matris);
        const uzaklik=Math.hypot(e.clientX-ekran.x,e.clientY-ekran.y);
        if(uzaklik<mesafe){mesafe=uzaklik;p=n;}
      }
    }
    e.preventDefault();svg.focus({preventScroll:true});parmak=e.pointerId;svg.setPointerCapture(e.pointerId);
    bos.sifirla();ana.classList.remove('boy-hatirlat');
    onceki=p;sur(p,p);
  };
  function hareket(e:PointerEvent){
    if(parmak!==e.pointerId||!onceki||bittiMi)return;
    const konum=konumAl(e);if(konum){sur(onceki,konum);if(!bittiMi)onceki=konum;}
  }
  svg.onpointermove=hareket;
  svg.addEventListener('pointerdown',fircayiTasi);svg.addEventListener('pointermove',fircayiTasi);
  svg.addEventListener('pointerup',fircayiSakla);svg.addEventListener('pointercancel',fircayiSakla);
  svg.onpointerup=e=>{if(parmak===e.pointerId){hareket(e);birak();sakla();if(!bittiMi)bos.kur();}};
  svg.onpointercancel=svg.onlostpointercapture=e=>{if(parmak===e.pointerId){birak();sakla();}};
  svg.onkeydown=e=>{
    if(!['Enter',' '].includes(e.key))return;
    e.preventDefault();
    if(kapali||bittiMi||parmak!==null||e.repeat)return;
    const hedef=gruplar.find(g=>g.islenen<g.noktalar.length)?.noktalar.find(n=>!n.boyali);
    if(hedef){bos.sifirla();sur(hedef,hedef);birak();sakla();if(!bittiMi)bos.kur();}
  };
  function gorunurluk(){if(document.hidden)sakla();else if(bittiMi)ilerle();}
  function ekranDegisti(){if(parmak!==null){birak();sakla();}}
  const yon=matchMedia('(orientation: portrait)');
  yon.addEventListener('change',ekranDegisti);
  window.addEventListener('resize',ekranDegisti);
  document.addEventListener('visibilitychange',gorunurluk);
  window.addEventListener('pagehide',sakla);
  // Çocuk boyamaya başlamaz ya da yarıda bırakırsa Ceren yönergeyi yineler, sıradaki yer halkayla belirir.
  const bos=bosBekleyici(()=>{
    if(bittiMi||kapali||parmak!==null)return;
    ana.classList.remove('boy-hatirlat');void ana.offsetWidth;ana.classList.add('boy-hatirlat');
    yonerge();
  });
  function yonerge(){
    if(bittiMi)return;
    bos.dur();sonIpucu=-1;
    if(ana.classList.contains('boy-isaret')){isaretIpucu(true);bos.kur();}
    else oku('boya-basla',()=>{if(!bittiMi&&!kapali&&parmak===null)bos.kur();});
  }
  tekrar.onclick=yonerge;
  if(kayit&&kayit.alan.length===toplam){
    let i=0;
    for(const g of gruplar)for(const n of g.noktalar)if(kayit.alan[i++]==='1'){n.boyali=true;g.islenen++;boyanan++;}
    for(const d of kayit.izler){const p=document.createElementNS(svgNs,'path');p.setAttribute('d',d);murekkep.append(p);}
  }
  goster(Math.floor(boyanan*100/toplam));baslangicKaydi=false;
  if(kayit?.tamam&&kayit.alan.length===toplam)tamamla(true);else tekrar.click();
  return ()=>{clearTimeout(bitisZamani);an.durdur();bos.kapat();sakla();kapali=true;birak();cerenSustur();yon.removeEventListener('change',ekranDegisti);window.removeEventListener('resize',ekranDegisti);document.removeEventListener('visibilitychange',gorunurluk);window.removeEventListener('pagehide',sakla);ana.remove();};
}

