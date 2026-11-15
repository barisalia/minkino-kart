import {h} from '../../../src/ui/dom';
import {efekt} from '../../../src/audio/efekt';
import {konus,sus} from '../../../src/audio/konusma';
import {dugme,ikon} from '../gorsel';
import {bardagaDokmeSesi,blenderSesi,tezgahiSustur} from '../mutfak-ses';
import {arac,bardakDolumu,dilim,kivamIsareti,siparisBardagi,renkDamgasi,smoothieBardagi,buzIsareti} from './gorsel';
import {ayniNumune,bosSmoothie,ciftEkle,denemeyiSakla,tezgahRenkleri,meyveAdi,numuneAyir,numuneyiSec,renkAdi,renkSesi,smoothieRengi,taneli,type BardakIstegi,type Meyve,type MeyveCifti,type SmoothieKaydi,type SmoothieNumunesi} from './tarif';
import './tezgah.css';
const kayitlar=import.meta.glob<string>('../../../assets/sef/smoothie/*.mp3',{eager:true,query:'?url',import:'default'});
export function smoothieRepligi(ad:string){return kayitlar['../../../assets/sef/smoothie/'+ad+'.mp3'];}

// A short tap places an item, while a drag must land on the open pitcher.
function tasi(kaynak:HTMLButtonElement,hedef:HTMLElement,yerlestir:()=>void){
  let ilkX=0,ilkY=0,tutulan:number|undefined;
  const temizle=()=>{
    kaynak.style.removeProperty('transform');kaynak.classList.remove('sm-tasiniyor');
    hedef.classList.remove('sm-hedef');tutulan=undefined;
  };
  kaynak.onpointerdown=e=>{
    if(tutulan!==undefined||!e.isPrimary)return;
    tutulan=e.pointerId;kaynak.setPointerCapture(e.pointerId);
    ilkX=e.clientX;ilkY=e.clientY;kaynak.classList.add('sm-tasiniyor');hedef.classList.add('sm-hedef');
  };
  kaynak.onpointermove=e=>{
    if(e.pointerId===tutulan)kaynak.style.transform='translate('+(e.clientX-ilkX)+'px,'+(e.clientY-ilkY)+'px)';
  };
  kaynak.onpointerup=e=>{
    if(e.pointerId!==tutulan)return;
    const r=hedef.getBoundingClientRect();
    const tutturdu=e.clientX>=r.left-8&&e.clientX<=r.right+8&&e.clientY>=r.top-14&&e.clientY<=r.bottom+8;
    temizle();
    if(tutturdu||Math.hypot(e.clientX-ilkX,e.clientY-ilkY)<8)yerlestir();
  };
  kaynak.onpointercancel=temizle;
  kaynak.onclick=e=>{if(e.detail===0)yerlestir();};
}

export function smoothieIstasyonu(alan:HTMLElement,s:SmoothieKaydi,istek:MeyveCifti,kaydet:()=>void,bitir:()=>void,sesli:()=>boolean,buzIstegi?:boolean,bardakIstegi?:BardakIstegi,renkDefteri:MeyveCifti[]=[]){
  const tezgah=h('section.sm-tezgah',{'aria-label':'Meyve karışımı tezgâhı'});
  function rengiDinle(cift:readonly Meyve[]){
    const ses=renkSesi(cift);
    if(ses&&sesli())void konus(smoothieRepligi(ses));
  }
  const hedef=dugme(renkAdi(istek)+' sipariş rengini dinle','sm-hedef-rengi',siparisBardagi(istek,bardakIstegi),ikon('hoparlor'));
  hedef.onclick=()=>rengiDinle(istek);
  const fis=h('div.sm-fis',{role:'group','aria-label':'Müşterinin istediği renk'},hedef);
  if(bardakIstegi?.kivam)fis.append(kivamIsareti(bardakIstegi.kivam));
  if(buzIstegi!==undefined){
    fis.append(buzIsareti(buzIstegi));
    tezgah.append(arac(buzIstegi?'gunes':'bulut','sm-hava'));
  }
  const istasyon=h('div.sm-alan');
  const defter=dugme('Renk defterini aç','sm-defter-ac',ikon('album'));
  defter.onclick=()=>{
    const pencere=h('dialog.sm-defter',{'aria-label':'Renk defterim'});
    const kapat=dugme('Renk defterini kapat','sm-defter-kapat',ikon('kapat'));
    const raf=h('div.sm-defter-raf',{role:'list','aria-label':'Karıştırdığın tarifler'});
    for(const cift of [...renkDefteri].reverse()){
      const isim=cift.map(m=>meyveAdi[m]).join(' ve ')+' — '+renkAdi(cift);
      const kart=dugme(isim+' rengini dinle','sm-defter-kart',dilim(cift[0]),dilim(cift[1]),siparisBardagi(cift));
      kart.onclick=()=>rengiDinle(cift);
      raf.append(h('span',{role:'listitem','aria-label':isim},kart));
    }
    if(!renkDefteri.length)raf.append(h('div.sm-defter-bos',{'role':'img','aria-label':'İlk karışımını yapınca deftere eklenecek'},arac('surahi'),ikon('ileri'),ikon('album')));
    pencere.append(raf,kapat);tezgah.append(pencere);
    const geri=()=>{pencere.close();pencere.remove();defter.focus();};
    kapat.onclick=geri;pencere.addEventListener('cancel',e=>{e.preventDefault();geri();});
    pencere.showModal();kapat.focus();rehberiBirak();
  };
  const duyuru=h('span.sm-duyuru',{'role':'status'});
  const dinle=dugme('Meyve tezgâhında yardım dinle','sm-dinle',ikon('hoparlor'));
  dinle.onclick=()=>{
    const evre=s.evre;
    let kayit:string=evre;
    if(evre==='servis'&&buzIstegi!==undefined)kayit='buz-sec';
    if(evre==='dok'&&bardakIstegi?.yarim)kayit='yarim-dok';
    if(evre==='karistir')kayit='kivam-sec';
    if(evre==='meyve'&&s.numuneler?.length&&!s.meyveler.length)kayit='numune-rafi';
    if(sesli())void konus(smoothieRepligi(kayit));
  };
  alan.append(tezgah);tezgah.append(fis,istasyon,dinle,duyuru,defter);
  let kare=0,etkin=true,kumandaBirak:(()=>void)|undefined;
  function ses(fn:()=>void){if(sesli())fn();}
  let rehberZamani=0;
  function rehberiBirak(){window.clearTimeout(rehberZamani);}
  // A child may pause after closing the lid or finding the cup. Give one
  // spoken nudge for that step, then leave time to explore in silence.
  function rehberBeklet(){
    rehberiBirak();
    rehberZamani=window.setTimeout(()=>{if(etkin&&tezgah.isConnected&&!document.hidden&&sesli())dinle.click();},6200);
  }
  tezgah.addEventListener('pointerdown',rehberiBirak);
  function asama(e:SmoothieKaydi['evre']){
    if(e==='dok'){denemeyiSakla(s,s.meyveler);ciftEkle(renkDefteri,s.meyveler);}
    s.evre=e;kaydet();ciz();rehberBeklet();
  }
  function ciz(yeni?:Meyve){
    kumandaBirak?.();kumandaBirak=undefined;
    istasyon.replaceChildren();tezgah.dataset.evre=s.evre;
    fis.querySelector('.sm-karsilastir')?.remove();
    if(s.meyveler.length===2){
      const eslesti=renkAdi(s.meyveler)===renkAdi(istek);
      const sonuc=dugme('Seçtiğin renk: '+renkAdi(s.meyveler)+(eslesti?', siparişle eşleşti':''),'sm-karsilastir',
        siparisBardagi(s.meyveler,bardakIstegi),ikon(eslesti?'onay':'hoparlor'));
      sonuc.dataset.eslesti=String(eslesti);
      sonuc.onclick=()=>rengiDinle(s.meyveler);
      hedef.after(sonuc);
    }
    const komut={meyve:'İki malzeme seçip sürahiye koy.',kapak:'Kapağı sürahiye tak.',karistir:'Turuncu düğmeye basılı tut.',dok:'Sürahiyi tutarak bardağı çizgiye kadar doldur.',servis:'İçecek hazır. Tepsiye koy.'};
    duyuru.textContent=komut[s.evre];
    if(s.numuneler?.length){
      const raf=h('div.sm-numune-rafi',{role:'list','aria-label':'Keşfettiğin karışımlar'});
      const simdiki:SmoothieNumunesi|undefined=(s.evre==='dok'||s.evre==='servis')&&s.meyveler.length===2
        ?{meyveler:[s.meyveler[0],s.meyveler[1]],karisim:s.karisim}:undefined;
      const secilebilir=!!simdiki||(s.evre==='meyve'&&!s.meyveler.length);
      const numuneler=s.numuneler.filter(n=>!simdiki||!ayniNumune(n,simdiki));
      if(simdiki)numuneler.push(simdiki);
      for(const n of numuneler){
        const ad=n.meyveler.map(m=>meyveAdi[m]).join(' ve ')+' — '+renkAdi(n.meyveler);
        const secili=n===simdiki;
        const kivam=taneli(n.karisim)?'meyve parçalı':'pürüzsüz';
        const bardak=smoothieBardagi(n.meyveler,80,'sm-tadimlik',false,n.karisim);
        const sec=dugme(ad+', '+kivam+(secili?' sürahide':' karışımını sürahiye al'),'sm-numune-sec',bardak);
        sec.setAttribute('aria-pressed',String(secili));
        if(secili)sec.append(ikon('onay'));
        sec.disabled=!secilebilir;
        sec.onclick=()=>{
          if(secili){rengiDinle(n.meyveler);return;}
          if(!numuneyiSec(s,n))return;
          ses(()=>efekt.secim());asama('dok');rengiDinle(n.meyveler);
          istasyon.querySelector<HTMLButtonElement>('.sm-dok-tusu')?.focus({preventScroll:true});
        };
        raf.append(h('span',{role:'listitem','aria-label':ad},sec));
      }
      istasyon.append(raf);
    }else if(s.denemeler?.length){
      const pano=h('div.sm-denemeler',{role:'list','aria-label':'Keşfettiğin karışımlar'});
      for(const cift of s.denemeler){
        const ad=(cift[0]===cift[1]?'İki dilim '+meyveAdi[cift[0]]:cift.map(m=>meyveAdi[m]).join(' ve '))+' — '+renkAdi(cift);
        const dinlet=dugme(ad+' rengini dinle','sm-deneme',dilim(cift[0]),dilim(cift[1]),renkDamgasi(cift));
        dinlet.onclick=()=>rengiDinle(cift);
        pano.append(h('span',{role:'listitem','aria-label':ad},dinlet));
      }
      istasyon.append(pano);
      pano.scrollLeft=pano.scrollWidth;

    }
    if(s.evre==='dok'||s.evre==='servis'){
      const dene=dugme('Başka iki meyve dene','sm-yeniden',ikon('tekrar'));
      dene.onclick=()=>{
        const ilkNumune=!s.numuneler?.length;
        numuneAyir(s,s.meyveler,s.karisim);
        Object.assign(s,bosSmoothie());delete s.buzlu;ses(()=>efekt.secim());asama('meyve');
        if(ilkNumune&&sesli()){rehberiBirak();void konus(smoothieRepligi('numune-rafi'));}
      };
      istasyon.append(dene);
    }
    const makina=h('div.sm-makina');
    const motor=arac('motor','sm-motor'),kap=arac('kapak','sm-takili-kapak');
    const agiz=h('span.sm-surahi-agzi',{'aria-hidden':true});
    const surahi=h('div.sm-surahi',{},arac('surahi','sm-cam'),agiz);
    const ic=h('div.sm-surahi-ici',{},h('i.sm-icecek'));
    const icMeyve=h('div.sm-dilimler');
    s.meyveler.forEach((m,i)=>{
      if(m==='sut')return;
      const parca=dilim(m);parca.className='sm-parca';parca.dataset.sira=String(i);if(m===yeni)parca.classList.add('sm-yeni');icMeyve.append(parca);
    });
    tezgah.style.setProperty('--sm-renk',smoothieRengi(s.meyveler));
    surahi.append(ic,icMeyve);
    if(s.evre==='karistir')surahi.append(kap);
    makina.append(motor,surahi);istasyon.append(makina);
    function miktarlar(){
      const sut=s.meyveler.filter(m=>m==='sut').length*18;
      const secim=s.evre==='meyve'||s.evre==='kapak';
      const surahiDolumu=secim?sut:s.evre==='karistir'?sut+(60-sut)*s.karisim/100:60;
      ic.style.setProperty('--sm-renk',secim||(s.evre==='karistir'&&sut&&s.karisim<10)?'#fffefa':smoothieRengi(s.meyveler));
      ic.style.setProperty('--sm-dolu',surahiDolumu*(1-s.bardak/100)+'%');
      icMeyve.style.setProperty('--sm-parca-oran',String(Math.max(0,1-s.karisim/94)*(1-s.bardak/100)));
    }
    miktarlar();
    if(s.evre==='meyve'||s.evre==='kapak'){
      const sepet=h('div.sm-sepet',{'role':'group','aria-label':'Meyve seçenekleri'});
      for(const m of tezgahRenkleri){
        const b=dugme(meyveAdi[m]+(m==='sut'?' ekle':' dilimini sürahiye koy'),'sm-meyve',dilim(m));
        b.dataset.meyve=m;sepet.append(b);
        tasi(b,surahi,()=>{
          if(s.evre==='kapak')s.meyveler.pop();
          s.meyveler.push(m);if(s.meyveler.length===2)s.evre='kapak';kaydet();ses(()=>efekt.pof());ciz(m);rehberBeklet();
        });
      }
      istasyon.append(sepet);
      if(s.meyveler.length){
        const geri=dugme('Son meyveyi geri al','sm-geri-al',ikon('tekrar'));
        geri.onclick=()=>{s.meyveler.pop();asama('meyve');};istasyon.append(geri);
      }
      if(s.evre==='kapak'){
        const kapat=dugme('Kapağı sürahiye tak','sm-kapak',arac('kapak'),ikon('asagi'));
        tasi(kapat,surahi,()=>{if(s.evre==='kapak'){ses(()=>efekt.yapis());asama('karistir');}});istasyon.append(kapat);
      }
      return;
    }
    const cam=smoothieBardagi(s.meyveler,s.bardak,'sm-servis-bardagi',s.buzlu,s.karisim);
    if(bardakIstegi?.yarim)cam.classList.add('sm-yarim-istek');
    cam.append(h('i.sm-dolum-cizgisi',{'aria-hidden':true}));
    if(s.evre==='dok'||s.evre==='servis')istasyon.append(cam);
    if(s.evre==='servis'&&bardakIstegi?.yarim){
      const bosalt=dugme('Bardaktan sürahiye biraz geri dök','sm-olcu-tusu',arac('surahi'),ikon('geri'));
      bosalt.disabled=s.bardak<=35;
      bosalt.onclick=()=>{
        s.bardak=Math.max(35,s.bardak-15);kaydet();ses(()=>bardagaDokmeSesi(false));ciz();
        const bardak=istasyon.querySelector('.sm-servis-bardagi');
        if(bardak&&!matchMedia('(prefers-reduced-motion:reduce)').matches)
          bardak.animate([{rotate:'-8deg'},{rotate:'0deg'}],{duration:240,easing:'ease-out'});
      };
      const ekle=dugme('Biraz daha doldur','sm-olcu-tusu',arac('surahi'),ikon('asagi'));
      ekle.disabled=s.bardak>=100;ekle.onclick=()=>asama('dok');
      istasyon.append(h('div.sm-olcu-rafi',{role:'group','aria-label':'Bardaktaki miktarı değiştir'},bosalt,ekle));
    }
    if(s.evre==='servis'){
      const sun=dugme('Meyve karışımını tepsiye koy','sm-onay',ikon('servis'),ikon('onay'));
      if(buzIstegi!==undefined){
        duyuru.textContent='Buzlu veya buzsuz seç. Sonra bardağı tepsiye koy.';
        const sec=(buzlu:boolean)=>{s.buzlu=buzlu;kaydet();ses(buzlu?()=>efekt.nota(7):()=>efekt.secim());ciz();};
        const buz=dugme('Bardağa buz küpü ekle','sm-buz-sec',buzIsareti(true));
        const sade=dugme('Buzsuz servis seç','sm-buz-sec',buzIsareti(false));
        buz.setAttribute('aria-pressed',String(s.buzlu===true));sade.setAttribute('aria-pressed',String(s.buzlu===false));
        tasi(buz,cam,()=>sec(true));sade.onclick=()=>sec(false);
        istasyon.append(h('div.sm-buz-rafi',{'role':'group','aria-label':'Buz tercihi'},buz,sade));
        sun.disabled=s.buzlu===undefined;
      }
      sun.onclick=()=>{sun.disabled=true;bitir();};istasyon.append(sun);return;
    }
    const dok=s.evre==='dok';
    const kumanda=dugme(dok?'Sürahiyi tut ve dök':'Blender düğmesini basılı tut',dok?'sm-dok-tusu':'sm-motor-tusu',ikon(dok?'el':'oyna'));
    if(dok)surahi.append(kumanda);else makina.append(kumanda);
    const akim=h('i.sm-akis');istasyon.append(akim);
    function akisiYerlestir(){
      surahi.style.setProperty('--sm-dok-aci',String(-54-s.bardak*.31)+'deg');
      const alan=istasyon.getBoundingClientRect(),uc=agiz.getBoundingClientRect(),bardak=cam.getBoundingClientRect();
      // Keep the liquid surface horizontal in world space as the pitcher tilts.
      const matris=new DOMMatrixReadOnly(getComputedStyle(surahi).transform);
      ic.style.setProperty('--sm-ters-aci',(-Math.atan2(matris.b,matris.a))+'rad');
      const dx=bardak.left+bardak.width*.53-uc.left;
      const dy=bardak.bottom-bardak.height*(.1+s.bardak*.0082)-uc.top;
      akim.style.left=(uc.left-alan.left)+'px';akim.style.top=(uc.top-alan.top)+'px';
      akim.style.height=Math.hypot(dx,dy)+'px';akim.style.rotate=(-Math.atan2(dx,dy))+'rad';
    }
    const onay=dugme('Bardağı servise al','sm-onay',ikon('onay'));
    if(dok){onay.disabled=s.bardak<35;onay.onclick=()=>asama('servis');istasyon.append(onay);}
    let kivamDugmesi:HTMLButtonElement|undefined;
    if(!dok){
      kivamDugmesi=dugme('Bu kıvamda dökmeye geç','sm-onay sm-bardaga-gec',arac('bardak'),ikon('ileri'));
      kivamiGuncelle();
      kivamDugmesi.onclick=()=>asama('dok');istasyon.append(kivamDugmesi);
    }
    function kivamiGuncelle(){
      if(!kivamDugmesi)return;
      kivamDugmesi.disabled=s.karisim<45;

    }
    let basili=false,son=0,sonSes=0,sonKayit=0;
    function dur(){
      if(!basili)return;
      basili=false;cancelAnimationFrame(kare);tezgahiSustur();tezgah.classList.remove('sm-calisiyor');kaydet();
      if(dok)ic.style.setProperty('--sm-ters-aci','12deg');
    }
    function iler(simdi:number){
      if(!basili||!etkin||!tezgah.isConnected||document.hidden){dur();return;}
      const gecen=Math.max(0,simdi-son);son=simdi;
      if(dok){s.bardak=Math.min(100,s.bardak+gecen/32);bardakDolumu(cam,s.bardak);onay.disabled=s.bardak<35;akisiYerlestir();}
      else s.karisim=Math.min(100,s.karisim+gecen/18);
      miktarlar();kivamiGuncelle();
      if(simdi-sonSes>490){ses(dok?()=>bardagaDokmeSesi(s.bardak>50):blenderSesi);sonSes=simdi;}
      if(simdi-sonKayit>250){kaydet();sonKayit=simdi;}
      if(s.karisim===100&&!dok){dur();ses(()=>efekt.eslesti());asama('dok');return;}
      if(s.bardak===100&&dok){dur();asama('servis');return;}
      kare=requestAnimationFrame(iler);
    }
    function basla(){
      if(basili)return;
      basili=true;son=performance.now();sonSes=0;tezgah.classList.add('sm-calisiyor');kare=requestAnimationFrame(iler);
    }
    let dokunmaAni=0,ilkMiktar=0;
    function kisaBas(miktar:number){
      if(dok){
        s.bardak=Math.min(100,miktar+25);bardakDolumu(cam,s.bardak);onay.disabled=s.bardak<35;
      }else s.karisim=Math.min(100,miktar+25);
      miktarlar();kivamiGuncelle();kaydet();
      if(dok&&s.bardak===100)asama('servis');
      else if(!dok&&s.karisim===100)asama('dok');
    }
    kumanda.onpointerdown=e=>{
      if(!e.isPrimary)return;
      dokunmaAni=performance.now();ilkMiktar=dok?s.bardak:s.karisim;
      kumanda.setPointerCapture(e.pointerId);basla();
    };
    kumanda.onpointerup=()=>{
      const kisa=basili&&performance.now()-dokunmaAni<230;
      dur();if(kisa)kisaBas(ilkMiktar);
    };
    kumanda.onpointercancel=dur;kumanda.onlostpointercapture=dur;
    kumanda.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();basla();}};
    kumanda.onkeyup=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();dur();}};
    kumanda.onblur=dur;
    kumanda.onclick=e=>{if(e.detail===0&&!basili)kisaBas(dok?s.bardak:s.karisim);};
    const gorunur=()=>{if(document.hidden)dur();};
    document.addEventListener('visibilitychange',gorunur);
    kumandaBirak=()=>{dur();document.removeEventListener('visibilitychange',gorunur);};
  }
  ciz();rehberBeklet();
  return ()=>{etkin=false;rehberiBirak();kumandaBirak?.();cancelAnimationFrame(kare);sus();};
}
