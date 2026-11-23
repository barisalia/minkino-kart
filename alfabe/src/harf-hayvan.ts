import { hedefIzineUyuyor, tani } from './hayvan-harf-tanima';
import { aileler, aileResmi, hareketAdi, sahneResmi, yasamAlani } from './hayvan-aileleri';
import { kalemYollari } from './yollar';
import { kucukGrup, tamDers } from './yas-grubu';
import { cerenSustur } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { bosBekleyici } from './bos-bekle';
import kalemResmi from '../../assets/alfabe/hayvan-kalem.webp';
import dagResmi from '../../assets/alfabe/09.webp';
import { IKON } from '../../src/ui/ikonlar';
import { bitisKutla, cerenSevinsin, parilti } from './cila';
import { saklanmaKareleri } from './a2-kareler';
import './harf-hayvan.css';

const svgNS='http://www.w3.org/2000/svg';
type Nokta={x:number;y:number};
type Oku=(id:string,sonra?:()=>void)=>void;
const kucult=(h:string)=>h.toLocaleLowerCase('tr');
const buyut=(h:string)=>h.toLocaleUpperCase('tr');
const resim=(src:string)=>'<img src="'+src+'" alt="" draggable="false">';
const azHareket=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * "Yaz ve hayvanı çağır" ders adımı (4 yaş): büyük harf hayvanı, küçük harf yavrusunu çağırır (Barış, 15 Kasım).
 * 19 Kasım temizlik: hiç açılmayan serbest oyun (kapak ekranı, "istediğin harfi yaz" tanıma, seçim düğmeleri) kaldırıldı.
 * ders.sonraki: devam düğmesinin yazısı, dersin akışındaki sonraki adımdan (main.ts → dersGoster).
 */

export function hayvanOyunuKur(alan:HTMLElement,oku:Oku,ders:{harf:string;ilerle:()=>void;sonraki:string}){
  let kapali=false,kalemHareketi=0,etkin:number|null=null,ipucu=true;
  let hedef=ders.harf,gelen='',imza:string[]=[];
  const uyeler=new Set<string>();
  const izler:Nokta[][]=[];

  let hareketNo=0,kareZamani=0,selamZamani=0;
  let ucus:Animation|undefined;
  const kareler=import.meta.glob<string>('../../assets/alfabe/hayvan-cagirma/hareket/*.webp',{eager:true,query:'?url',import:'default'});
  async function selam(img:HTMLImageElement,h:string){
    // Yavrunun dört hareket karesi (hayvan-cagirma/hareket/<ad>-0…3). Paket Harf-A2 bütün hayvanlara açar: ad, hayvanın
    // adından türetilir ("Nil timsahı" → nil-timsahi); kareleri gelmeyen hayvan eski hâliyle kalır.
    const ad=hareketAdi(aileler[h]?.[0]??'');
    if(!ad||azHareket())return;
    const urls=[0,1,2,3].map(i=>kareler['../../assets/alfabe/hayvan-cagirma/hareket/'+ad+'-'+i+'.webp']);
    if(urls.some(u=>!u))return;
    const no=++hareketNo;clearTimeout(kareZamani);
    try{await Promise.all(urls.map(u=>{const f=new Image();f.src=u;return f.decode();}));}catch{return;}
    const siralar=ad==='aslan'?[0,1,2,1,2,3]:ad==='fil'?[0,1,2,3,0]:ad==='deve'?[0,1,2,3,0]:ad==='orangutan'?[0,1,2,3]:[0,1,2,1,2,3];
    const sureler=ad==='aslan'?[240,130,390,130,390,220]:ad==='fil'?[145,115,190,115,150]:ad==='deve'?[200,180,340,200,120]:ad==='orangutan'?[130,115,135,145]:[200,150,260,150,260,260];
    function oyna(i:number){
      if(kapali||hareketNo!==no||!img.isConnected)return;
      if(i===siralar.length){img.src=aileResmi(h,true);return;}
      img.src=urls[siralar[i]];kareZamani=window.setTimeout(()=>oyna(i+1),sureler[i]);
    }
    oyna(0);
  }
  alan.classList.add('hy');
  const bul=<T extends Element>(s:string)=>alan.querySelector<T>(s)!;
  let sonSes='yazalim-hedef';
  function seslendir(id:string,sonra?:()=>void){sonSes=id;oku(id,sonra);}
  alan.innerHTML='<div class="hy-oyun"><section class="hy-sahne"><div class="hy-man"><div class="hy-mekan"></div><div class="hy-oyuncular"></div><div class="hy-dalga" aria-hidden="true"></div><span class="hy-sahne-harf" aria-hidden="true"></span></div><div class="hy-alt"><div class="hy-baslik-satir"><h2 class="hy-sahne-ad"></h2><button type="button" class="hy-dinle" aria-label="Ceren’i tekrar dinle">'+IKON.hoparlor+'</button></div><p class="hy-yazi" aria-live="polite"></p></div></section>'+
    '<section class="hy-kagit"><div class="hy-bas"><h2>Çizim defterim</h2><button type="button" class="hy-ornek" aria-label="Yazılışını izle">'+resim(kalemResmi)+'</button></div>'+
    '<svg class="hy-defter" viewBox="0 0 120 136" aria-label="Harf yazma alanı"><g fill="none"><path d="M4 20H116 M4 100H116" stroke="#86afac" stroke-width=".8"/><path d="M4 48H116" stroke="#a5bdb1" stroke-width=".7" stroke-dasharray="2 2"/></g><g class="hy-kilavuz" fill="none" stroke="#cadacb" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"></g><g class="hy-murekkep" fill="none" stroke="#215d52" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></g><circle class="hy-kalem" r="2.6" fill="#e88a44" stroke="#303f34" stroke-width=".75" visibility="hidden"/></svg>'+
    '<div class="hy-arac"><button type="button" class="hy-geri" aria-label="Geri al">'+IKON.geriAl+'</button><button type="button" class="hy-sil" aria-label="Sil">'+IKON.silgi+'</button><button type="button" class="hy-tani" aria-label="Hayvanı çağır"></button></div></section></div>';
  const oyun=bul<HTMLElement>('.hy-oyun');
  const defter=bul<SVGSVGElement>('.hy-defter'),murekkep=bul<SVGGElement>('.hy-murekkep'),kilavuz=bul<SVGGElement>('.hy-kilavuz'),kalem=bul<SVGCircleElement>('.hy-kalem');
  const mesaj=bul<HTMLElement>('.hy-yazi'),oyuncular=bul<HTMLElement>('.hy-oyuncular');
  // Merak anı (madde 0, 23 Kasım): çocuk harfi yazarken çağrılacak hayvan kendi çiziminin gölgesiyle sahnenin altından
  // görünür, her vuruşta biraz daha yükselir; saklandığı yer (çalı, dalga, kar, sazlık; Paket Harf-A2-ek) kıpırdar.
  // Çağrılınca gölge söner, hayvanın kendisi gelir. Gölge, var olan çizime CSS süzgeci (yeni çizim değil).
  const gizli=document.createElement('div');gizli.className='hy-gizli';gizli.setAttribute('aria-hidden','true');gizli.hidden=true;
  gizli.innerHTML='<img class="hy-golge" alt="" draggable="false"><img class="hy-sakla" alt="" draggable="false" hidden>';
  bul('.hy-man').append(gizli);
  const golge=gizli.querySelector<HTMLImageElement>('.hy-golge')!,sakla=gizli.querySelector<HTMLImageElement>('.hy-sakla')!;
  let saklaKareleri:string[]|undefined,saklaZamani=0;
  function golgeKur(){
    const b=buyut(hedef);
    // Saklanma yeri kareleri (Paket Harf-A2-ek) gelmeden merak anı görünmez: yarım iş ekrana çıkmaz (sürüm, 23 Kasım).
    saklaKareleri=b==='Ğ'||!aileler[b]?undefined:saklanmaKareleri(yasamAlani(b));
    if(!saklaKareleri){gizli.hidden=true;return;}
    golge.src=aileResmi(b,b!==hedef);gizli.classList.remove('hy-geldi');gizli.hidden=false;
    sakla.hidden=false;sakla.src=saklaKareleri[0];
    golgeGuncelle(false);
  }
  function golgeGuncelle(kipir:boolean){
    const oran=Math.min(1,izler.length/Math.max(1,kalemYollari(hedef).length));
    gizli.style.setProperty('--golge',oran.toFixed(2));
    if(!kipir||azHareket())return;
    gizli.classList.remove('hy-kipir');void gizli.offsetWidth;gizli.classList.add('hy-kipir');
    const k=saklaKareleri;if(!k)return;
    clearTimeout(saklaZamani);let i=0;const sira=[1,2,1,2,0];
    const oyna=()=>{if(kapali||i>=sira.length)return;sakla.src=k[sira[i++]];saklaZamani=window.setTimeout(oyna,95);};oyna();
  }
  const tanit=bul<HTMLButtonElement>('.hy-tani'),ornek=bul<HTMLButtonElement>('.hy-ornek'),geri=bul<HTMLButtonElement>('.hy-geri'),sil=bul<HTMLButtonElement>('.hy-sil');
  const ad=bul<HTMLElement>('.hy-sahne-ad');
  const yol=(d:string)=>{const p=document.createElementNS(svgNS,'path');p.setAttribute('d',d);return p;};
  // Derste boş defterde de "çağır" dokunulur: Ceren harf yolunu gösterir. Düğme soluk durur.
  function guncelle(){geri.disabled=sil.disabled=!izler.length||etkin!==null;tanit.disabled=etkin!==null;tanit.classList.toggle('hy-bos',!izler.length);}
  function kalemiDurdur(){cancelAnimationFrame(kalemHareketi);kalem.setAttribute('visibility','hidden');kilavuz.querySelectorAll('.hy-ornek-iz').forEach(el=>el.remove());}
  function rehber(oynat=false){
    kalemiDurdur();
    kilavuz.replaceChildren(...(ipucu?kalemYollari(hedef).map(yol):[]));
    ornek.setAttribute('aria-label',ipucu?'Yazılışını izle':'İpucu göster');
    const buyuk=buyut(hedef);
    const hayvan=buyuk==='Ğ'?dagResmi:aileResmi(buyuk,hedef!==buyuk);
    tanit.innerHTML=IKON.oyna+resim(hayvan);
    tanit.setAttribute('aria-label',buyuk==='Ğ'?'Dağı göster':(aileler[buyuk]?.[hedef===buyuk?0:1]??'Hayvan')+' çağır');
    if(!oynat||azHareket())return;
    const yollar=[...kilavuz.querySelectorAll('path')],ilk=performance.now();
    const sureler=yollar.map(p=>Math.max(280,p.getTotalLength()*11)+160);
    const boyali=yollar.map(p=>{
      const iz=p.cloneNode() as SVGPathElement;
      iz.classList.add('hy-ornek-iz');iz.style.strokeDasharray=String(p.getTotalLength());
      iz.style.strokeDashoffset=String(p.getTotalLength());kilavuz.append(iz);return iz;
    });
    function kare(t:number){
      let zaman=t-ilk,i=0;
      while(i<sureler.length&&zaman>=sureler[i])zaman-=sureler[i++];
      if(i===yollar.length){kalemiDurdur();return;}
      const p=yollar[i],uzun=p.getTotalLength(),nokta=p.getPointAtLength(uzun*Math.min(1,zaman/(sureler[i]-160)));
      boyali.forEach((iz,j)=>{iz.style.strokeDashoffset=String(j<i?0:j>i?yollar[j].getTotalLength():uzun*(1-Math.min(1,zaman/(sureler[i]-160))));});
      kalem.setAttribute('visibility',zaman<sureler[i]-125?'visible':'hidden');
      kalem.setAttribute('cx',String(nokta.x));kalem.setAttribute('cy',String(nokta.y));
      kalemHareketi=requestAnimationFrame(kare);
    }
    kalemHareketi=requestAnimationFrame(kare);
  }
  function temizle(){izler.length=0;murekkep.replaceChildren();guncelle();golgeGuncelle?.(false);}
  function konum(e:PointerEvent){
    const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(defter.getScreenCTM()!.inverse());
    return {x:Math.max(0,Math.min(120,pt.x)),y:Math.max(0,Math.min(136,pt.y))};
  }
  function ekle(p:Nokta){
    const seri=izler[izler.length-1],son=seri.at(-1);if(son&&Math.hypot(son.x-p.x,son.y-p.y)<.45)return;
    seri.push(p);const c=murekkep.lastElementChild!,xy=p.x.toFixed(1)+' '+p.y.toFixed(1);
    c.setAttribute('d',son?c.getAttribute('d')+' L'+xy:'M'+xy+'l.01 0');
  }
  defter.onpointerdown=e=>{if(etkin!==null||e.button!==0)return;e.preventDefault();bos.sifirla();kalemiDurdur();etkin=e.pointerId;defter.setPointerCapture(etkin);izler.push([]);murekkep.append(yol(''));ekle(konum(e));guncelle();};
  defter.onpointermove=e=>{if(e.pointerId!==etkin)return;const grup=e.getCoalescedEvents?.()??[];for(const n of grup.length?grup:[e])ekle(konum(n));};
  defter.onpointerup=e=>{if(etkin!==e.pointerId)return;ekle(konum(e));etkin=null;guncelle();bosKur();if(!gizli.hidden){oyunSesi('damla');golgeGuncelle(true);}};
  defter.onlostpointercapture=defter.onpointercancel=e=>{if(etkin!==e.pointerId)return;etkin=null;izler.pop();murekkep.lastElementChild?.remove();guncelle();bosKur();};
  geri.onclick=()=>{izler.pop();murekkep.lastElementChild?.remove();guncelle();golgeGuncelle(false);};
  sil.onclick=temizle;ornek.onclick=()=>{bos.dur();ipucu=true;rehber(true);seslendir('yazalim-izle',bosKur);};
  // Derste çocuk bir süre hiçbir şey yapmazsa: hiç yazmadıysa kalem harfi gösterir ve Ceren söyler,
  // yazıp çağırmadıysa "çağır", aile buluştuysa "devam" düğmesi hafifçe sallanır.
  function durt(dugme:HTMLElement){
    if(azHareket())return;
    dugme.classList.remove('hy-durt');void dugme.offsetWidth;dugme.classList.add('hy-durt');
  }
  const bos=bosBekleyici(()=>{
    if(kapali||etkin!==null)return;
    if(!devam.hidden){durt(devam);bosKur();return;}
    if(izler.length){durt(tanit);bosKur();return;}
    ornek.click();
  });
  function bosKur(){if(!kapali&&etkin===null)bos.kur();}
  function fon(h:string){
    const el=bul<HTMLElement>('.hy-mekan'),mekan=yasamAlani(h);
    if(el.dataset.mekan!==mekan){el.dataset.mekan=mekan;el.style.backgroundImage='url("'+sahneResmi(mekan)+'")';}
  }
  const devam=document.createElement('button');
  devam.type='button';devam.className='hy-devam';devam.hidden=true;devam.setAttribute('aria-label',ders.sonraki);devam.innerHTML=IKON.oyna;
  bul('.hy-alt').append(devam);devam.onclick=ders.ilerle;
  function basla(){
    temizle();rehber(true);fon(hedef);golgeKur();
    ad.textContent=hedef+' harfini yaz';
    mesaj.textContent='Parmağınla '+hedef+' harfinin üzerinden geç.';
    seslendir('yazalim-hedef',bosKur);
  }
  function yaziyiGonder(){
    if(azHareket()||!imza.length)return;
    ucus?.cancel();
    const kopya=document.createElementNS(svgNS,'svg');kopya.classList.add('hy-ucan-iz');kopya.setAttribute('viewBox','0 0 120 136');kopya.setAttribute('aria-hidden','true');
    kopya.setAttribute('fill','none');kopya.setAttribute('stroke','#155843');kopya.setAttribute('stroke-width','4');kopya.setAttribute('stroke-linecap','round');kopya.setAttribute('stroke-linejoin','round');
    kopya.append(...imza.map(yol));document.body.append(kopya);
    const r=defter.getBoundingClientRect(),s=oyuncular.getBoundingClientRect();
    const x=s.left+s.width*.51,y=s.top+s.height*.54;
    kopya.style.left=x+'px';kopya.style.top=y+'px';
    const dx=r.left+r.width/2-x,dy=r.top+r.height/2-y;
    const transform=(xx:number,yy:number,scale:number)=>'translate(calc(-50% + '+xx+'px),calc(-50% + '+yy+'px)) scale('+scale+')';
    ucus=kopya.animate([{transform:transform(dx,dy,1.35),opacity:1},{transform:transform(dx*.42,dy*.55-35,.9),offset:.5,opacity:1},{transform:transform(0,0,.4),opacity:0}],{duration:500,easing:'ease-in-out'});
    void ucus.finished.catch(()=>{}).then(()=>kopya.remove());
  }
  function defteriKapat(){
    kalemiDurdur();
    bul<HTMLElement>('.hy-kagit').hidden=true;
    oyun.classList.add('hy-bulusma');
  }
  function cagir(h:string){
    const buyuk=buyut(h),yavru=buyuk!==h;
    if(buyuk==='Ğ'){
      temizle();oyuncular.innerHTML=resim(dagResmi);ad.textContent='Dağ';mesaj.textContent='Dağ kelimesinin sonunda ğ var!';
      bul<HTMLElement>('.hy-sahne-harf').textContent='dağ';
      bul('.hy-sahne-harf').classList.add('hy-kalici');
      defteriKapat();devam.hidden=false;oyunSesi('birles');seslendir('yazalim-dag');return;
    }
    if(!aileler[buyuk])return;
    imza=[...murekkep.children].map(e=>e.getAttribute('d')!);
    if(gelen!==buyuk){uyeler.clear();oyuncular.replaceChildren();gelen=buyuk;}
    clearTimeout(selamZamani);yaziyiGonder();fon(buyuk);const kod=buyuk.codePointAt(0),etiket=aileler[buyuk][yavru?1:0];
    if(!uyeler.has(h)){
      const aktor=document.createElement('button');aktor.type='button';aktor.className='hy-aktor '+(yavru?'hy-yavru':'hy-buyuk');
      aktor.setAttribute('aria-label',etiket+' adını dinle');aktor.innerHTML=resim(aileResmi(buyuk,yavru))+'<span>'+h+' · '+etiket+'</span>';
      aktor.onclick=()=>{seslendir('yazalim-'+kod+'-'+(yavru?'kucuk':'buyuk'));if(yavru)void selam(aktor.querySelector('img')!,buyuk);};oyuncular.append(aktor);uyeler.add(h);
      // Gelen hayvan pırıltıyla belirir, Ceren sevinir (doğru harfi yazıp çağırdın).
      requestAnimationFrame(()=>{if(!kapali&&aktor.isConnected){parilti(aktor,9);cerenSevinsin();}});
    }
    const tam=uyeler.size===2;oyuncular.classList.toggle('hy-beraber',tam);
    temizle();
    const dalga=bul<HTMLElement>('.hy-dalga'),isaret=bul<HTMLElement>('.hy-sahne-harf');
    dalga.classList.remove('hy-cinla');isaret.classList.remove('hy-yankila');void dalga.offsetWidth;
    isaret.textContent=h;dalga.classList.add('hy-cinla');isaret.classList.add('hy-yankila');
    if(tam){
      // Aile tamam (anne ve yavru): sahnede kutlama.
      window.setTimeout(()=>{if(!kapali)bitisKutla(bul('.hy-sahne'));},420);
      const img=bul<HTMLImageElement>('.hy-yavru img');
      selamZamani=window.setTimeout(()=>{if(!kapali&&img.isConnected)void selam(img,buyuk);},850);
    }
    const kayit='yazalim-'+kod+'-'+(yavru?'kucuk':'buyuk');
    // Gelen hayvanın gölgesi söner; sıradaki (yavru) varsa onun gölgesi biraz sonra belirir.
    gizli.classList.add('hy-geldi');
    hedef=tam?ders.harf:kucult(buyuk);ipucu=true;rehber(!tam);
    if(!tam)window.setTimeout(()=>{if(!kapali)golgeKur();},900);
    tanit.hidden=false;
    if(tam)defteriKapat();
    devam.hidden=!(tam||kucukGrup);
    ad.textContent=tam?'Aileyi sen buluşturdun!':etiket+' sana geldi!';
    mesaj.textContent=tam?'İkisi de burada. İstersen adlarını tekrar dinle.':'Şimdi '+hedef+' yazıp yavrusunu çağırabilirsin.';
    oyunSesi('birles');
    const yildiz=document.createElement('span');yildiz.className='hy-selam';yildiz.textContent=tam?'♥':'✦';yildiz.setAttribute('aria-hidden','true');
    bul('.hy-man').querySelector('.hy-selam')?.remove();bul('.hy-man').append(yildiz);
    sonSes=kayit;oku(kayit,()=>{if(!kapali)oku(tam?'yazalim-aile':'yazalim-selam',bosKur);});
  }
  tanit.onclick=()=>{
    bos.dur();
    if(hedefIzineUyuyor(izler,hedef,kucukGrup?'2-3':tamDers?'5+':'4')||tani(izler).includes(hedef)){cagir(hedef);return;}
    mesaj.textContent='Biraz daha çiz. Açık renkli yol sana yardım edecek.';
    rehber(true);seslendir('yazalim-yol',bosKur);
  };
  bul<HTMLButtonElement>('.hy-dinle').onclick=()=>oku(sonSes);
  basla();
  return ()=>{kapali=true;bos.kapat();hareketNo++;ucus?.cancel();clearTimeout(selamZamani);clearTimeout(kareZamani);kalemiDurdur();cerenSustur();if(etkin!==null&&defter.hasPointerCapture(etkin))defter.releasePointerCapture(etkin);alan.replaceChildren();};
}
