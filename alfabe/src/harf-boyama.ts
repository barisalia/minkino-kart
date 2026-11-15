import { kucukGrup, tamDers } from './yas-grubu';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { kalemYollari } from './yollar';
import { kalemNo, murekkepler } from './kartlar';
import { cerenSustur, cerenYuzu } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
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
  function ilerle(){if(!kapali&&!gecildi&&bittiMi){gecildi=true;dersKaydiniYaz(anahtar,null);bitti();}}
  function tamamla(){
    bittiMi=true;birak();ana.classList.add('boy-tamam');tekrar.disabled=true;
    degisiklik=true;sakla();goster(100);oyunSesi('birles');if(tamDers)oku('boya-tamam',ilerle);else bitisZamani=window.setTimeout(ilerle,650);
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
    onceki=p;sur(p,p);
  };
  function hareket(e:PointerEvent){
    if(parmak!==e.pointerId||!onceki||bittiMi)return;
    const konum=konumAl(e);if(konum){sur(onceki,konum);if(!bittiMi)onceki=konum;}
  }
  svg.onpointermove=hareket;
  svg.onpointerup=e=>{if(parmak===e.pointerId){hareket(e);birak();sakla();}};
  svg.onpointercancel=svg.onlostpointercapture=e=>{if(parmak===e.pointerId){birak();sakla();}};
  svg.onkeydown=e=>{
    if(!['Enter',' '].includes(e.key))return;
    e.preventDefault();
    if(kapali||bittiMi||parmak!==null||e.repeat)return;
    const hedef=gruplar.find(g=>g.islenen<g.noktalar.length)?.noktalar.find(n=>!n.boyali);
    if(hedef){sur(hedef,hedef);birak();sakla();}
  };
  function gorunurluk(){if(document.hidden)sakla();else if(bittiMi)ilerle();}
  function ekranDegisti(){if(parmak!==null){birak();sakla();}}
  const yon=matchMedia('(orientation: portrait)');
  yon.addEventListener('change',ekranDegisti);
  window.addEventListener('resize',ekranDegisti);
  document.addEventListener('visibilitychange',gorunurluk);
  window.addEventListener('pagehide',sakla);
  tekrar.onclick=()=>{if(!bittiMi){sonIpucu=-1;if(ana.classList.contains('boy-isaret'))isaretIpucu(true);else oku('boya-basla');}};
  if(kayit&&kayit.alan.length===toplam){
    let i=0;
    for(const g of gruplar)for(const n of g.noktalar)if(kayit.alan[i++]==='1'){n.boyali=true;g.islenen++;boyanan++;}
    for(const d of kayit.izler){const p=document.createElementNS(svgNs,'path');p.setAttribute('d',d);murekkep.append(p);}
  }
  goster(Math.floor(boyanan*100/toplam));baslangicKaydi=false;
  if(kayit?.tamam&&kayit.alan.length===toplam)tamamla();else tekrar.click();
  return ()=>{clearTimeout(bitisZamani);sakla();kapali=true;birak();cerenSustur();yon.removeEventListener('change',ekranDegisti);window.removeEventListener('resize',ekranDegisti);document.removeEventListener('visibilitychange',gorunurluk);window.removeEventListener('pagehide',sakla);ana.remove();};
}

