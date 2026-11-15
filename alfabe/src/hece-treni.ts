import { IKON } from '../../src/ui/ikonlar';
import { efekt } from '../../src/audio/efekt';
import { sesMotorunuAc } from '../../src/audio/motor';
import { cerenSustur } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { resim } from './resimler';
import istasyon from '../../assets/alfabe/macera/tren-istasyon.webp';
import lokomotif from '../../assets/alfabe/macera/tren-lokomotif.webp';
import vagon from '../../assets/alfabe/macera/tren-vagon.webp';
import './hece-treni.css';

type Sevkiyat = {id: string; ad: string; heceler: string[]};
const sevkiyatlar: Sevkiyat[] = [
  {id:'02',ad:'Balık',heceler:['ba','lık']}, {id:'06',ad:'Elma',heceler:['el','ma']},
  {id:'15',ad:'Limon',heceler:['li','mon']}, {id:'19',ad:'Ördek',heceler:['ör','dek']},
  {id:'20',ad:'Panda',heceler:['pan','da']}, {id:'26',ad:'Üzüm',heceler:['ü','züm']},
  {id:'18',ad:'Otobüs',heceler:['o','to','büs']}, {id:'23',ad:'Şemsiye',heceler:['şem','si','ye']},
  {id:'28',ad:'Yelkenli',heceler:['yel','ken','li']}, {id:'29',ad:'Zürafa',heceler:['zü','ra','fa']},
];

function rotayiSec(tercih?: string) {
  const rota: Sevkiyat[] = [];
  const ilk = sevkiyatlar.find(s => s.id === tercih);
  if (ilk) rota.push(ilk);
  for (let i=rota.length;i<3;i++) {
    const uzunluk = i === 2 ? 3 : 2;
    const secenekler = sevkiyatlar.filter(s => s.heceler.length === uzunluk && !rota.includes(s));
    rota.push(secenekler[Math.floor(Math.random() * secenekler.length)]);
  }
  return tercih ? rota.slice(0, 1) : rota;
}

export function heceTreniKur(container: HTMLElement, oku: (id:string, bitince?:()=>void)=>void, bitir: ()=>void, tercih?: string): ()=>void {
  const rota = rotayiSec(tercih);
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ana = document.createElement('section');
  ana.className = 'ht-oyun';
  const duduk = '<svg aria-hidden="true" viewBox="0 0 48 48"><path fill="#ffd36c" stroke="#23453e" stroke-width="2.8" stroke-linejoin="round" d="M5 14h24l11-5 4 9-12 5c1 9-6 16-14 16S4 33 4 26c0-5 2-7 4-9z"/><circle cx="18" cy="26" r="6" fill="#f6ac4d" stroke="#23453e" stroke-width="2"/><path d="M24 14h5l1 5h-6z" fill="#23453e"/></svg>';
  ana.innerHTML = '<div class="ht-sahne"><img class="ht-manzara" alt="" draggable="false" src="' + istasyon + '">' +
    '<div class="ht-ust"><div class="ht-sefer" role="img"></div><button type="button" class="ht-ses ht-yuvarlak" aria-label="Sözcüğü hece hece dinle">' + IKON.hoparlor + '</button></div>' +
    '<div class="ht-ray" aria-hidden="true"></div><div class="ht-takim"><div class="ht-vagonlar"></div>' +
    '<div class="ht-motor-grup"><button type="button" class="ht-motor" aria-label="Lokomotife dokun ve başla"><img alt="" draggable="false" src="' + lokomotif + '"><span class="ht-basla" aria-hidden="true">' + IKON.oyna + '</span></button>' +
    '<button type="button" class="ht-duduk ht-yuvarlak" aria-label="Düdüğü çal ve treni kaldır">' + duduk + '</button></div></div>' +
    '<div class="ht-teslim" aria-hidden="true"></div><b class="ht-sozcuk" hidden></b>' +
    '<div class="ht-yuk-modeli" hidden><img alt="" draggable="false"><b></b></div>' +
    '<button type="button" class="ht-devam ht-yuvarlak" hidden>' + IKON.oyna + '</button>' +
    '<div class="ht-durum" role="status" aria-live="polite"></div></div>';
  container.replaceChildren(ana);
  const bul = <T extends HTMLElement>(s:string) => ana.querySelector<T>(s)!;
  const takim=bul<HTMLElement>('.ht-takim'), vagonlar=bul<HTMLElement>('.ht-vagonlar'), sahne=bul<HTMLElement>('.ht-sahne');
  const teslim=bul<HTMLElement>('.ht-teslim'), sozcuk=bul<HTMLElement>('.ht-sozcuk'), model=bul<HTMLElement>('.ht-yuk-modeli');
  const motor=bul<HTMLButtonElement>('.ht-motor'), dudukTus=bul<HTMLButtonElement>('.ht-duduk'), devam=bul<HTMLButtonElement>('.ht-devam');
  const ses=bul<HTMLButtonElement>('.ht-ses'), seferler=bul<HTMLElement>('.ht-sefer'), durum=bul<HTMLElement>('.ht-durum');
  const yukler = new Set<number>(), zamanlar = new Set<number>(), hareketler = new Set<Animation>();
  let sefer=0, kapali=false, nesil=0;
  let asama: 'bekliyor'|'yukleme'|'yolda'|'indi'|'bitti'='bekliyor';
  const s = () => rota[sefer];
  const dugmeler = () => Array.from(vagonlar.querySelectorAll<HTMLButtonElement>('button'));
  function durumYap(yeni:typeof asama) { asama=yeni; ana.dataset.durum=yeni; }
  function bildir(metin:string) { durum.setAttribute('aria-label',metin); }
  function kes() { nesil++; cerenSustur(); }
  function sonra(ms:number, fn:()=>void) {
    const no=window.setTimeout(()=>{zamanlar.delete(no); if(!kapali)fn();},ms);
    zamanlar.add(no);
  }
  function oynat(oge:Element, kare:Keyframe[], sure:number) {
    if(sakin||kapali)return;
    const a=oge.animate(kare,{duration:sure,easing:'ease-out'});
    hareketler.add(a);void a.finished.then(()=>hareketler.delete(a),()=>hareketler.delete(a));
  }
  function dinle(){if(!kapali && asama==='yukleme'){kes();oku('tren-hece-'+s().id);}}

  function turKur(ilk:boolean) {
    kes(); yukler.clear(); durumYap(ilk?'bekliyor':'yukleme');
    ana.dataset.yuk=s().id;takim.style.transform='';teslim.replaceChildren();sozcuk.hidden=true;sozcuk.textContent=s().ad;
    model.hidden=ilk;model.querySelector('img')!.src=resim(s().id);model.querySelector('b')!.textContent=s().ad;
    seferler.setAttribute('aria-label','Sefer '+(sefer+1)+' / '+rota.length);
    seferler.innerHTML=rota.map((_,i)=>'<i class="'+(i<=sefer?'ht-dolu':'')+'"></i>').join('');
    motor.disabled=false; motor.setAttribute('aria-label',ilk?'Lokomotife dokun ve başla':'Sözcüğü lokomotiften dinle');
    dudukTus.hidden=ilk;dudukTus.disabled=false;ses.hidden=ilk;devam.hidden=true;
    vagonlar.replaceChildren();
    for(let n=0;n<4;n++) {
      const yer=document.createElement('button');yer.type='button';yer.className='ht-vagon';yer.dataset.vagon=String(n+1);
      yer.disabled=ilk;yer.setAttribute('aria-pressed','false');yer.setAttribute('aria-label',(n+1)+'. vagona yük koy');
      yer.innerHTML='<span class="ht-yuk"><img src="'+resim(s().id)+'" alt="" draggable="false"></span><img class="ht-araba" alt="" draggable="false" src="'+vagon+'"><b class="ht-hece" aria-hidden="true"></b>';
      yer.onclick=()=>yukDegistir(yer,n);vagonlar.append(yer);
    }
    if(!ilk)dinle();
    else oku('yer-tren');
  }
  function basla() {
    if(kapali)return;
    if(asama==='yukleme'){dinle();return;}
    if(asama!=='bekliyor')return;
    kes();durumYap('yukleme');
    sesMotorunuAc();efekt.trenDudugu();model.hidden=false;ses.hidden=false;dudukTus.hidden=false;
    motor.setAttribute('aria-label','Sözcüğü lokomotiften dinle');
    dugmeler().forEach(b=>b.disabled=false);bildir(s().ad+', vagonlara dokun.');
    oynat(motor,[{transform:'translateY(0)'},{transform:'translateY(-5%)'},{transform:'translateY(0)'}],300);
    const tur=nesil;
    sonra(620,()=>{
      if(kapali || tur!==nesil || asama!=='yukleme')return;
      oku('tren-giris',()=>{if(!kapali && tur===nesil && asama==='yukleme')dinle();});
    });
  }
  function yukDegistir(yer:HTMLButtonElement,n:number) {
    if(kapali||asama!=='yukleme')return;
    kes(); const yuk=yer.querySelector<HTMLElement>('.ht-yuk')!, etiket=yer.querySelector<HTMLElement>('.ht-hece')!;
    const hece=s().heceler[n];
    if(!hece){
      const reddedilen=yuk.cloneNode(true) as HTMLElement;
      reddedilen.classList.add('ht-geri-seken');yer.append(reddedilen);
      oynat(reddedilen,[{transform:'translateY(-35%)',opacity:.65},{transform:'translateY(5%)',offset:.35},{transform:'translate(15%,-45%)',opacity:1,offset:.62},{transform:'translate(35%,25%)',opacity:0}],610);
      sonra(sakin?220:600,()=>reddedilen.remove());
      oyunSesi('geri'); bildir('Bu vagonda hece yok.');
      const tur=nesil;
      oku('tren-cok',()=>{if(!kapali && asama==='yukleme' && nesil===tur)dinle();});return;
    }
    if(yukler.delete(n)) {
      yer.setAttribute('aria-pressed','false');yer.setAttribute('aria-label',(n+1)+'. vagona yük koy');etiket.textContent='';
      oyunSesi('kagit');bildir(hece+' indirildi.');return;
    }
    yukler.add(n); yer.setAttribute('aria-pressed','true');yer.setAttribute('aria-label',hece+' hecesinin yükünü indir');etiket.textContent=hece;
    oynat(yuk,[{transform:'translateY(-65%)',opacity:.4},{transform:'translateY(6%)',offset:.72},{transform:'translateY(0)',opacity:1}],290);
    oyunSesi('kutu');bildir(hece);
    const kod=Array.from(hece,h=>h.codePointAt(0)!.toString(16)).join('-');oku('tren-parca-'+kod);
  }
  function bosalt() {
    const dolular=dugmeler().filter((_,n)=>yukler.has(n));
    for(const [i,yer] of dolular.entries()) {
      const bas=yer.querySelector<HTMLElement>('.ht-yuk')!.getBoundingClientRect();
      const paket=document.createElement('img');paket.src=resim(s().id);paket.alt='';paket.className='ht-indirilen';teslim.append(paket);
      const son=paket.getBoundingClientRect();
      yer.setAttribute('aria-pressed','false');
      oynat(paket,[{transform:'translate('+(bas.left+bas.width/2-son.left-son.width/2)+'px,'+(bas.top+bas.height/2-son.top-son.height/2)+'px)'},{transform:'translate(0,0)'}],360+i*90);
    }
    sonra(sakin?120:650,()=>{
      durumYap('indi');devam.hidden=false;
      const son=sefer===rota.length-1;
      const ad=son?(tercih?'Derse dön':'Seferi bitir'):'Sonraki yük';
      devam.setAttribute('aria-label',ad);bildir('Yük istasyona geldi. '+ad);
      oku(son && !tercih?'tren-son':'tren-varis');
    });
  }
  function yolaCik() {
    if(kapali||asama!=='yukleme')return;
    kes();
    if(yukler.size!==s().heceler.length){
      const tur=nesil,yer=dugmeler().find((_,n)=>n<s().heceler.length&&!yukler.has(n))!;
      oynat(yer,[{transform:'translateY(0)'},{transform:'translateY(-9%)'},{transform:'translateY(0)'}],350);
      oyunSesi('geri');bildir('Eksik yükü vagona koy.');
      oku('tren-az',()=>{if(!kapali && tur===nesil && asama==='yukleme')dinle();});return;
    }
    durumYap('yolda');ses.hidden=true;dudukTus.hidden=true;motor.disabled=true;model.hidden=true;sozcuk.hidden=false;
    for (const v of dugmeler())v.disabled=true;
    const hedef=sozcuk.getBoundingClientRect(), alan=sahne.getBoundingClientRect();
    if(!sakin) for (const [n,yer] of dugmeler().entries()) {
      if(!yukler.has(n))continue;
      const etiket=yer.querySelector('b')!,bas=etiket.getBoundingClientRect(),iz=document.createElement('b');
      iz.className='ht-birlesen';iz.textContent=etiket.textContent;iz.setAttribute('aria-hidden','true');
      iz.style.left=bas.left+bas.width/2-alan.left+'px';iz.style.top=bas.top-alan.top+'px';sahne.append(iz);
      oynat(iz,[{transform:'translate(-50%,0)',opacity:1},{transform:'translate(calc(-50% + '+(hedef.left+hedef.width/2-bas.left-bas.width/2)+'px),'+(hedef.top-bas.top)+'px)',opacity:0}],320);
      sonra(335,()=>iz.remove());
    }
    sesMotorunuAc();efekt.trenDudugu();takim.style.transform='translateX('+sahne.clientWidth*(sahne.clientWidth<550?.10:.20)+'px)';
    sonra(650,()=>oku(s().id+'-label',()=>{if(!kapali && asama==='yolda' && sakin)bosalt();}));
    if(!sakin)sonra(1750,bosalt);
  }
  function ileri() {
    if(kapali||asama!=='indi')return;
    kes();
    if(sefer===rota.length-1){durumYap('bitti');bitir();return;}
    sefer++;turKur(false);
  }
  motor.onclick=basla;dudukTus.onclick=yolaCik;ses.onclick=dinle;devam.onclick=ileri;
  turKur(true);
  return ()=>{
    kapali=true;kes();for(const t of zamanlar)window.clearTimeout(t);for(const a of hareketler)a.cancel();
    motor.onclick=dudukTus.onclick=ses.onclick=devam.onclick=null;
    for(const v of dugmeler())v.onclick=null;
  };
}
