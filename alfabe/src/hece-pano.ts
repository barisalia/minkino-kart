
import { heceler, parcaSesi, panoAdi, panoResmi } from './pano-sozcukleri';
import { yeniPano, turuGetir, turuSakla, panoyuTamamla, panoyuBirak, type PanoTuru } from './hece-pano-kaydi';
import { heceKulakKur } from './hece-kulak';
import { resim } from './resimler';
import { oyunSesi } from './oyun-sesi';
import { cerenSustur, cerenYuzu } from './konusma-dersi';
import { tamDers } from './yas-grubu';
import { IKON } from '../../src/ui/ikonlar';
import './hece-pano.css';

type Oku=(id:string,sonra?:()=>void,oynarken?:(sn:number)=>void)=>void;
type Soz={id:string;basla?:()=>void};
type Konum={x:number;y:number};
type Tasima={tas:HTMLButtonElement;id:number;bas:Konum;kopya?:HTMLElement};

export function hecePanoKur(alan:HTMLElement,oku:Oku,bitir:()=>void):()=>void{
  const pano=document.createElement('section');
  pano.className='hp-pano'+(tamDers?'':' hp-kilavuz');
  pano.setAttribute('aria-label','Hece mıknatısları');
  pano.innerHTML='<div class="hp-yonerge"><button class="hp-yardim" type="button" aria-label="Ceren örnek göstersin">'+cerenYuzu('hp-ogretmen')+'<span>Ceren göstersin</span></button><div class="hp-baslik"><h2>Hece panom</h2><span class="hp-sayac"></span></div><button type="button" class="hp-dinle" aria-label="Yönergeyi dinle">'+IKON.hoparlor+'</button></div>'+
    '<p class="hp-durum" role="status"></p><div class="hp-nesneler"></div><div class="hp-raf"><div class="hp-miknatislar" role="group" aria-label="Karışık heceler"></div></div>'+
    '<div class="hp-son" hidden><button type="button" class="hp-tekrar"><img src="'+resim('hece-yeni-pano')+'" alt=""><span>Yeni pano</span></button>'+
    '<button type="button" class="hp-ileri"><img src="'+resim('hece-yildiz')+'" alt=""><span>İleri seviye</span></button>'+
    '<button type="button" class="hp-kulak-ac" hidden>'+IKON.hoparlor+'<span>Dinle ve bul</span></button>'+
    '<button type="button" class="hp-bitir"><img src="'+resim('hece-oyun-kapisi')+'" alt=""><span>Oyunlara dön</span></button></div>';
  alan.replaceChildren(pano);
  const bul=<T extends HTMLElement>(s:string)=>pano.querySelector<T>(s)!;
  const nesneler=bul('.hp-nesneler'),tepsi=bul('.hp-miknatislar'),durum=bul('.hp-durum'),son=bul('.hp-son');
  const sayac=bul('.hp-sayac'),yardim=bul<HTMLButtonElement>('.hp-yardim'),kulak=bul<HTMLButtonElement>('.hp-kulak-ac');
  let tur:PanoTuru,secili:HTMLButtonElement|undefined,tasinma:Tasima|undefined;
  let kapali=false,sozSirasi=0,ornekNesne='',kulakBirak:(()=>void)|undefined;
  const hatalar=new Map<string,number>();
  const hareketler=new Set<Animation>();
  const azHareket=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tuslar=()=>[...tepsi.querySelectorAll<HTMLButtonElement>('button')];
  const yuvalar=()=>[...nesneler.querySelectorAll<HTMLButtonElement>('.hp-yuva')];
  const kart=(id:string)=>nesneler.querySelector<HTMLElement>('[data-kart="'+id+'"]')!;
  const eslesen=(hece:string)=>tuslar().find(b=>!b.disabled&&b.textContent===hece);

  let sesArasi=0;
  let duyulan='';
  let bekleyen:Soz[]=[];
  let bittiginde:(()=>void)|undefined;
  function konusmayiKes(){
    clearTimeout(sesArasi);
    sozSirasi++;
    duyulan='';bekleyen=[];bittiginde=undefined;
    cerenSustur();
    pano.querySelectorAll('.hp-heceliyor,.hp-ornek').forEach(el=>el.classList.remove('hp-heceliyor','hp-ornek'));
  }
  function siradakiSes(){
    if(kapali)return;
    const soz=bekleyen.shift();
    if(!soz){
      const son=bittiginde;bittiginde=undefined;son?.();return;
    }
    const nesil=sozSirasi;
    duyulan=soz.id;
    let basladi=false;
    oku(soz.id,()=>{
      if(nesil!==sozSirasi||kapali)return;
      duyulan='';
      if(bekleyen.length)sesArasi=window.setTimeout(siradakiSes,180);
      else siradakiSes();
    },()=>{
      if(!basladi&&nesil===sozSirasi&&!kapali){basladi=true;soz.basla?.();}
    });
  }
  function anlat(sozler:Soz[],sonra?:()=>void){
    if(duyulan.startsWith('pano-hece-')||duyulan.startsWith('pano-ad-')){
      // Parmağın mıknatıstan yuvaya geçişi sözcüğü ortadan kesmesin.
      bekleyen=[...sozler];
      if(bekleyen[0]?.id===duyulan)bekleyen.shift()?.basla?.();
      bittiginde=sonra;
      return;
    }
    konusmayiKes();
    bekleyen=[...sozler];bittiginde=sonra;siradakiSes();
  }
  function vurgu(el?:Element){
    pano.querySelector('.hp-heceliyor')?.classList.remove('hp-heceliyor');
    el?.classList.add('hp-heceliyor');
  }
  function diziyiOku(id:string,onceSozcuk:boolean){
    const yerler=kart(id).querySelectorAll('.hp-yuva');
    const sesler=heceler[id].map((h,i)=>({id:parcaSesi(h),basla:()=>vurgu(yerler[i])}));
    const butun={id:'pano-ad-'+id,basla:()=>vurgu(kart(id).querySelector('.hp-resim')!)};
    anlat(onceSozcuk?[butun,...sesler]:[...sesler,butun],()=>vurgu());
  }
  function hareket(el:HTMLElement,kareler:Keyframe[],sure:number,bitti?:()=>void){
    if(azHareket()||!el.animate){bitti?.();return;}
    const anim=el.animate(kareler,{duration:sure,easing:'cubic-bezier(.22,.78,.26,1)'});
    hareketler.add(anim);
    void anim.finished.catch(()=>{}).then(()=>{hareketler.delete(anim);bitti?.();});
  }
  function merkez(el:HTMLElement):Konum{
    const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};
  }
  function kopyala(b:HTMLButtonElement){
    const k=document.createElement('span');
    k.className=b.className+' hp-elde';k.setAttribute('aria-hidden','true');k.textContent=b.textContent;
    const r=b.getBoundingClientRect();k.style.width=r.width+'px';k.style.height=r.height+'px';
    k.style.display='grid';k.style.placeItems='center';k.style.boxSizing='border-box';
    document.body.append(k);return k;
  }
  function koy(k:HTMLElement,p:Konum){k.style.left=p.x+'px';k.style.top=p.y+'px';}
  function ucur(tas:HTMLButtonElement,bas:Konum,son:Konum,geri:boolean){
    if(azHareket())return;
    const k=kopyala(tas);koy(k,son);
    const dx=bas.x-son.x,dy=bas.y-son.y;
    const poz=(x:number,y:number,aci:number,olcek:number)=>'translate(calc(-50% + '+x+'px),calc(-50% + '+y+'px)) rotate('+aci+'deg) scale('+olcek+')';
    hareket(k,[{transform:poz(dx,dy,geri?-5:3,1.06)},
      {transform:poz(dx*.42,dy*.42-(geri?22:8),geri?4:-2,1.03),offset:.47},
      {transform:poz(0,0,0,.95)}],geri?360:240,()=>k.remove());
  }
  function bosHedef(p:Konum){
    const alt=document.elementFromPoint(p.x,p.y);
    const y=alt?.closest<HTMLButtonElement>('.hp-yuva');
    if(y&&pano.contains(y))return y.disabled?undefined:y;
    // Mıknatısın kenarı yuvaya değince parmağın tam merkeze gelmesi gerekmez.
    let enYakin:HTMLButtonElement|undefined,mesafe=tamDers?12:19;
    for(const bos of yuvalar().filter(b=>!b.disabled)){
      const r=bos.getBoundingClientRect();
      const uzaklik=Math.hypot(Math.max(r.left-p.x,0,p.x-r.right),Math.max(r.top-p.y,0,p.y-r.bottom));
      if(uzaklik<mesafe){mesafe=uzaklik;enYakin=bos;}
    }
    return enYakin;
  }
  function suruklemeyiBirak(){
    const t=tasinma;tasinma=undefined;
    if(t?.tas.hasPointerCapture(t.id))t.tas.releasePointerCapture(t.id);
    t?.kopya?.remove();t?.tas.classList.remove('hp-tasiniyor');
    pano.querySelector('.hp-yakinda')?.classList.remove('hp-yakinda');
  }
  let secimSayisi=0,okunanSecim=-1;
  function sec(b:HTMLButtonElement){
    if(b.disabled)return;
    secili?.setAttribute('aria-pressed','false');secili=b;b.setAttribute('aria-pressed','true');
    durum.textContent='“'+b.textContent+'” hangi boşluğa gelecek?';
    const secim=++secimSayisi;
    anlat([{id:parcaSesi(b.textContent!),basla:()=>{okunanSecim=secim;}}]);
  }
  function durumuYansit(){
    let biten=0;
    for(const el of nesneler.children){
      const bos=el.querySelector<HTMLButtonElement>('.hp-yuva:enabled');
      el.classList.toggle('hp-tamam',!bos);
      el.querySelector('.hp-sira')?.classList.remove('hp-sira');
      if(!tamDers&&!tur.ileri)bos?.classList.add('hp-sira');
      if(!bos)biten++;
    }
    sayac.textContent=biten+' / 3 sözcük';
    son.hidden=biten!==3;kulak.hidden=!tamDers;bul<HTMLButtonElement>('.hp-ileri').hidden=!!tur.ileri;yardim.disabled=biten===3;
    bul('.hp-raf').hidden=biten===3;
  }
  function yardimKaydet(id:string){
    if(!tur.yardim.includes(id)){tur.yardim.push(id);turuSakla(tur);}
  }
  function ornekGoster(){
    if(tur.bitti)return;
    const yer=yuvalar().find(y=>!y.disabled&&y.dataset.nesne===ornekNesne)??yuvalar().find(y=>!y.disabled);
    if(!yer)return;
    const id=yer.dataset.nesne!,h=yer.dataset.hece!,tas=eslesen(h)!;
    yardimKaydet(id);
    durum.textContent=kart(id).dataset.ad+' için “'+h+'” hecesini dinle.';
    anlat([{id:'pano-ornek'},{id:'pano-ad-'+id,basla:()=>vurgu(kart(id).querySelector('.hp-resim')!)},
      {id:parcaSesi(h),basla:()=>{vurgu(yer);tas.classList.add('hp-ornek');ucur(tas,merkez(tas),merkez(yer),false);}},
      {id:'pano-sende'}],()=>{vurgu();durum.textContent='Şimdi “'+h+'” mıknatısını yerine sen koy.';});
  }
  function yerlestir(yer:HTMLButtonElement,tas:HTMLButtonElement,bas=merkez(tas)){
    if(tas.disabled||yer.disabled||tur.bitti)return;
    const id=yer.dataset.nesne!,h=yer.dataset.hece!,konum=yer.dataset.konum!;
    ornekNesne=id;
    tepsi.querySelectorAll('.hp-ipucu').forEach(b=>b.classList.remove('hp-ipucu'));
    if(h!==tas.textContent){
      const kez=(hatalar.get(konum)??0)+1;hatalar.set(konum,kez);yardimKaydet(id);
      oyunSesi('geri');ucur(tas,merkez(yer),merkez(tas),true);
      hareket(yer,[{transform:'translateX(0)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],240);
      durum.textContent='Bu yeri birlikte dinleyelim.';
      anlat([{id:'pano-ad-'+id},...(kez>=2||!tamDers?[{id:parcaSesi(h),basla:()=>{vurgu(yer);eslesen(h)?.classList.add('hp-ipucu');}}]:[])],()=>vurgu());
      return;
    }
    ucur(tas,bas,merkez(yer),false);
    secili?.setAttribute('aria-pressed','false');secili=undefined;
    tas.disabled=true;yer.disabled=true;yer.textContent=h;yer.setAttribute('aria-label',kart(id).dataset.ad+', '+h);
    yer.dataset.renk=String(tur.taslar.indexOf(h)%4);
    hareket(yer,[{transform:'scale(.93)'},{transform:'scale(1.055)',offset:.68},{transform:'scale(1)'}],310);
    tur.dolu.push(konum);
    const tam=!kart(id).querySelector('.hp-yuva:enabled');
    if(tur.dolu.length===yuvalar().length)panoyuTamamla(tur);else turuSakla(tur);
    durumuYansit();oyunSesi(tam?'birles':'miknatis');
    durum.textContent=tur.bitti?'Üç sözcüğü de kurdun!':tam?kart(id).dataset.ad+' tamamlandı!':'Sıradaki heceyi seç.';
    const geriBildirim:Soz[]=[];
    if(okunanSecim!==secimSayisi)geriBildirim.push({id:parcaSesi(h),basla:()=>vurgu(yer)});
    if(tam)geriBildirim.push({id:'pano-ad-'+id,basla:()=>vurgu(kart(id).querySelector('.hp-resim')!)});
    vurgu(yer);anlat(geriBildirim,()=>vurgu());
    (tur.bitti?(tamDers?kulak:bul<HTMLButtonElement>('.hp-tekrar')):tuslar().find(b=>!b.disabled))?.focus({preventScroll:true});
  }
  function tasYap(h:string){
    const b=document.createElement('button');b.type='button';b.className='hp-tas hp-renk-'+tur.taslar.indexOf(h)%4;
    b.textContent=h;b.setAttribute('aria-pressed','false');
    let suruklendi=false;
    b.onclick=e=>{if(!suruklendi||e.detail===0)sec(b);suruklendi=false;};
    b.onpointerdown=e=>{
      if(e.button!==0||tasinma||b.disabled)return;
      suruklendi=false;tasinma={tas:b,id:e.pointerId,bas:{x:e.clientX,y:e.clientY}};b.setPointerCapture(e.pointerId);
    };
    b.onpointermove=e=>{
      const t=tasinma,p={x:e.clientX,y:e.clientY};
      if(!t||t.id!==e.pointerId||t.tas!==b)return;
      if(!t.kopya&&Math.hypot(p.x-t.bas.x,p.y-t.bas.y)<6)return;
      if(!t.kopya){sec(b);suruklendi=true;t.kopya=kopyala(b);b.classList.add('hp-tasiniyor');}
      const hedef=bosHedef(p);
      const once=pano.querySelector('.hp-yakinda');
      if(once!==hedef){once?.classList.remove('hp-yakinda');hedef?.classList.add('hp-yakinda');}
      if(hedef){
        const m=merkez(hedef);koy(t.kopya,{x:p.x+(m.x-p.x)*.27,y:p.y+(m.y-p.y)*.27});
      }else koy(t.kopya,p);
    };
    b.onpointerup=e=>{
      if(tasinma?.id!==e.pointerId||tasinma.tas!==b)return;
      const p={x:e.clientX,y:e.clientY},hedef=bosHedef(p);
      suruklemeyiBirak();
      if(suruklendi){if(hedef)yerlestir(hedef,b,p);else ucur(b,p,merkez(b),true);}
    };
    b.onlostpointercapture=b.onpointercancel=e=>{if(tasinma?.id===e.pointerId)suruklemeyiBirak();};
    return b;
  }
  function panoGoster(kayit?:PanoTuru){
    suruklemeyiBirak();konusmayiKes();secili=undefined;ornekNesne='';hatalar.clear();
    tur=kayit??yeniPano(tur?.ileri);
    pano.classList.toggle('hp-kilavuz',!tamDers&&!tur.ileri);
    pano.dataset.seviye=tur.ileri?'ileri':'ilk';
    nesneler.replaceChildren(...tur.kartlar.map(id=>{
      const ad=panoAdi(id);
      const el=document.createElement('article');el.className='hp-nesne';el.dataset.ad=ad;el.dataset.kart=id;
      el.innerHTML='<button type="button" class="hp-resim" aria-label="'+ad+' sözcüğünü dinle"><img src="'+panoResmi(id)+'" alt="'+ad+'" draggable="false"><span>'+IKON.hoparlor+'</span></button><div class="hp-yuvalar"></div>';
      el.querySelector<HTMLButtonElement>('.hp-resim')!.onclick=()=>{ornekNesne=id;diziyiOku(id,true);};
      el.querySelector('.hp-yuvalar')!.append(...heceler[id].map((h,i)=>{
        const y=document.createElement('button'),konum=id+'-'+i;
        y.type='button';y.className='hp-yuva';y.dataset.hece=h;y.dataset.nesne=id;y.dataset.konum=konum;
        y.disabled=tur.dolu.includes(konum);y.textContent=y.disabled?h:'';
        if(y.disabled)y.dataset.renk=String(tur.taslar.indexOf(h)%4);
        y.setAttribute('aria-label',ad+' için '+(i+1)+'. hece'+(y.disabled?', '+h:''));
        y.onclick=()=>{ornekNesne=id;if(secili)yerlestir(y,secili);else diziyiOku(id,true);};
        return y;
      }));
      return el;
    }));
    const takilan=yuvalar().filter(y=>y.disabled).map(y=>y.dataset.hece!);
    tepsi.replaceChildren(...tur.taslar.map(h=>{
      const b=tasYap(h),indeks=takilan.indexOf(h);
      if(indeks>=0){b.disabled=true;takilan.splice(indeks,1);}
      return b;
    }));
    durumuYansit();turuSakla(tur);
    durum.textContent=tur.bitti?'Üç sözcüğü de kurdun!':tur.dolu.length?'Kaldığın yerden devam et.':'Bir resmi dinle, hecelerini altına tak.';
    anlat([{id:tur.bitti?'pano-buldu':tur.dolu.length?'pano-devam':tur.ileri?'pano-ileri':tamDers?'pano-bes':'pano-dort'}]);
  }
  function dinlemeKapat(){
    kulakBirak?.();kulakBirak=undefined;alan.replaceChildren(pano);kulak.focus({preventScroll:true});
  }
  function dinlemeAc(){
    if(!tamDers||!tur.bitti||kulakBirak)return;
    konusmayiKes();
    const bolum=document.createElement('div');bolum.className='hp-ek-tur';
    const geri=document.createElement('button');geri.type='button';geri.className='hp-panoya-don';geri.textContent='Panoma dön';geri.onclick=dinlemeKapat;
    const sahne=document.createElement('div');bolum.append(geri,sahne);alan.replaceChildren(bolum);
    kulakBirak=heceKulakKur(sahne,tur.kartlar,oku,dinlemeKapat);
    geri.focus({preventScroll:true});
  }
  bul<HTMLButtonElement>('.hp-dinle').onclick=()=>anlat([{id:tur.bitti?'pano-buldu':'hece-pano'}]);
  bul<HTMLButtonElement>('.hp-ileri').onclick=()=>panoGoster(yeniPano(true));
  yardim.onclick=ornekGoster;kulak.onclick=dinlemeAc;
  bul<HTMLButtonElement>('.hp-tekrar').onclick=()=>panoGoster();
  bul<HTMLButtonElement>('.hp-bitir').onclick=()=>{panoyuBirak();bitir();};
  const iptal=()=>suruklemeyiBirak();
  window.addEventListener('resize',iptal);window.addEventListener('blur',iptal);
  panoGoster(turuGetir());
  return ()=>{
    kapali=true;kulakBirak?.();suruklemeyiBirak();konusmayiKes();
    window.removeEventListener('resize',iptal);window.removeEventListener('blur',iptal);
    for(const anim of hareketler)anim.cancel();
    alan.replaceChildren();
  };
}
