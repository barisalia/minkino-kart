import {ayakSesi,patiAlkisi,perdeSesi,salonAlkisi} from '../../src/audio/sahne-ortami';
import type {BandoKaydi} from '../../src/audio/bando';
import {cevapNotasi,konserCalgisi as calgiSesi,kaydiHazirla,sahneMuzigi,tempo} from './gosteri-muzigi';
import {ritimTusu} from './gosteri-muzigi';
import {sesiAc} from '../../src/audio/ses';
import {tamamla} from './kres-kaydi';
import {soloPuanlari,kupaKazandi,siirMi,kurdeleli,konserMi,dortlu,gosteriSozu,puan,yeniGosteri,programDeseni,notaVurusu,ilkSahneVurusu,type Gosterim} from './gosteri-kaydi';
import {simge} from './cizim';
import {dansAdlari,dansOrnegi,kinoVokali,dansCumlesi,sonDansAdimlari,dansKartlari,dansPozlari,ikiliHareketi,birlikteKapanis,kendiDansKesiti,kinoDansKartlari,sarkiSelami} from './gosteri-koreografi';
import type {Sabah} from './model';
import './gosteri.css';

const ikon=(ic:string)=>'<svg viewBox="0 0 80 80" fill="none" stroke="#29212b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ic+'</svg>';
const yildiz='<path d="m40 9 8 19 21 2-16 15 4 21-17-11-18 11 4-21L10 30l22-2Z" fill="#ffd263"/>';
import {sahneIkon} from './sahne-ikonlari';
export {sahneIkon} from './sahne-ikonlari';
export function pozlar(ad:string,adet:number,res:(id:string)=>string,cls='',ekler:string[]=[]){
  return '<span class="gosteri-oyuncu '+cls+'">'+[ad,...ekler].map((set,n)=>Array.from({length:n?6:adet},(_,i)=>res('kres/'+set+'-'+i)).join('')).join('')+'</span>';
}
export function tohumIkilisi(res:(id:string)=>string){
  return pozlar('kino-tohum',4,res,'kino-sol')+pozlar('zip-tohum',4,res,'zip-sag');
}
export function pozOynat(el:Element|null,sira:readonly number[],ms:number,tekrar=1){
  if(!el)return;const kareler=[...el.querySelectorAll('img')];sira=sira.filter(n=>n>=0&&n<kareler.length);
  if(!sira.length)return;kareler.forEach((im,i)=>{
    im.getAnimations().forEach(a=>a.cancel());im.style.visibility=i===sira[sira.length-1]?'visible':'hidden';
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)
      im.animate(sira.map((k,j)=>({visibility:k===i?'visible':'hidden',offset:j/sira.length,easing:'steps(1,end)'})).concat([{visibility:i===sira[sira.length-1]?'visible':'hidden',offset:1,easing:'steps(1,end)'}]),{duration:sira.length*ms,iterations:tekrar});
  });
}
const perdeler=import.meta.glob<string>('../../assets/hazirlik/kres/perde-kapali*.webp',{eager:true,query:'?url',import:'default'});
type Baglar={res:(id:string)=>string;soyle:(id:string)=>void;sus:()=>void;kaydet:()=>void;gir:(s:Sabah['sahne'])=>void};
export type GosteriKontrol={kapat:()=>void;tekrarDinle:()=>void};
export function gosteriAc(alan:HTMLElement,s:Sabah,is:Baglar):GosteriKontrol{
  const g=s.kres.gosteri,yer=document.createElement('section');yer.className='gosteri-oyunu';alan.append(yer);
  let film=0,muzik:BandoKaydi|undefined,sonPoz=-1,aktif=-1,denendi=false,calisiyor=false,surum=0;
  let perdeAcildi=false,dogrudanBasla=false,birlikteSelam=false;
  let ortamDur:(()=>void)|undefined;
  const kisaSaatler=new Set<number>();
  function bekle(ms:number,fn:()=>void){const id=window.setTimeout(()=>{kisaSaatler.delete(id);if(yer.isConnected&&!document.hidden)fn()},ms);kisaSaatler.add(id)}
  function kes(){ortamDur?.();ortamDur=undefined;surum++;cancelAnimationFrame(film);kisaSaatler.forEach(id=>clearTimeout(id));kisaSaatler.clear();muzik?.durdur();muzik=undefined;aktif=-1;calisiyor=false}
  function hazirOlunca(kok:Element,fn:()=>void){
    const acilis=surum;
    const imler=[...kok.querySelectorAll('img')];
    function hazir(){if(surum===acilis&&kok.isConnected&&!document.hidden)fn()}
    if(imler.every(im=>im.complete&&im.naturalWidth)){hazir();return}
    void Promise.allSettled(imler.map(im=>im.decode())).then(hazir);
  }
  const sil=()=>{kes();yer.replaceChildren()};
  function ilkOdak(){if(yer.isConnected)(yer.querySelector<HTMLButtonElement>('.gosteri-baslat')??yer.querySelector<HTMLButtonElement>('button:not(:disabled)'))?.focus({preventScroll:true})}
  // Klavyeyle ilerleyen çocuk ve anahtar denetimi kullanan cihazlar, yeni
  // plana geçince tarayıcının başına düşmesin. Dokunmada odak halkası çizilmez.
  let klavyede=false;
  yer.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '||e.key==='Tab')klavyede=true},true);
  yer.addEventListener('pointerdown',()=>{klavyede=false},true);
  function sonra(n:Gosterim,ses=true){sil();g.bolum=n;g.ipucu=false;is.kaydet();ciz();if(klavyede)ilkOdak();if(ses)is.soyle(gosteriSozu(g))}
  function tus(kutu:Element,ad:string,art:string,fn:()=>void,cls=''){
    const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',ad);b.className=cls;b.innerHTML=art;b.onclick=()=>{sesiAc();fn()};kutu.append(b);return b;
  }
  function nesne(cls:string,art:string){const e=document.createElement('div');e.className=cls;e.innerHTML=art;yer.append(e);return e}
  function sahneIsiklari(){
    // Dekorda zaten üç gerçek ayak ışığı var. Yeni bir aygıtı sahne üstüne
    // bindirmeden ampul camını kasanın içine, ışığı ahşap zemine yerleştir.
    const kabuk='<i><b></b></i>';
    const ampuller=nesne('gosteri-ramp-isiklari',kabuk.repeat(3));ampuller.setAttribute('aria-hidden','true');
  }
  const kim=()=>g.dal==='dans'?'dans':'sarki';
  function ikili(hazir=true){
    const ad=kim(),renk=s.renk==='sari'?'sari':'yesil';
    const ek=(kim:'kino'|'zip')=>ad==='dans'&&(g.dansDefteriAcik||dortlu(g.program))?dansPozlari(kim,renk):[];
    if(hazir&&ad==='sarki'&&siirMi(g.program)){
      nesne('gosteri-ikili',tohumIkilisi(is.res));return;
    }
    const donus=!hazir&&g.bolum==='arac'&&g.dal==='dans';
    nesne('gosteri-ikili',hazir
      ?pozlar('kino-'+(renk==='sari'?'sari-':'')+ad,8,is.res,'kino-sol',ek('kino'))+pozlar('zip-'+ad,8,is.res,'zip-sag',ek('zip'))
      :pozlar('kino-ev-'+renk,6,is.res,'kino-sol')+pozlar(donus?'zip-sese-don':'zipzip-davet',donus?6:8,is.res,'zip-sag'));
  }
  function hareket(n:number,ornek=false){
    const dansOyunu=kim()==='dans'&&dortlu(g.program);
    if(dansOyunu){
      if(ornek){
        pozOynat(yer.querySelector('.zip-sag'),dansOrnegi(n),100);
      }else{
        const c=dansCumlesi(n,tempo.dans);
        beraberOyna(c);
      }
    }else{
      const k=ikiliHareketi(kim(),n,ornek);
      pozOynat(yer.querySelector('.kino-sol'),k.kino,k.ms);pozOynat(yer.querySelector('.zip-sag'),k.zip,k.ms);
    }
  }
  function beraberOyna(c:ReturnType<typeof dansCumlesi>){
    const az=matchMedia('(prefers-reduced-motion: reduce)').matches;
    pozOynat(yer.querySelector('.kino-sol'),az?[c.kinoTepe]:c.kino,c.ms);
    pozOynat(yer.querySelector('.zip-sag'),az?[c.zipTepe]:c.zip,c.ms);
    if(c.ses)bekle(az?0:c.temas*c.ms,()=>{if(c.ses==='alkis')patiAlkisi();else ayakSesi(true,true)});
  }
  // Adımı yana kayan tek görselden üretme. Yürüyüş hızı, görünen boy ve
  // gerçek taban teması aynı anda hesaplanır. Son ayak izinde oyuncu bekler.
  function sahneyeCik(){
    const eleman=yer.querySelector<HTMLElement>('.gosteri-ikili');
    if(!eleman||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const ikili:HTMLElement=eleman;
    const duran=[...ikili.children] as HTMLElement[],renk=s.renk==='sari'?'sari':'yesil';
    const yuruyan=nesne('gosteri-ikili gosteri-giris-oyunculari',pozlar(renk+'-yuru',8,is.res,'kino-sol')+pozlar('zip-sahneye-yuru',8,is.res,'zip-sag'));
    const aktor=[...yuruyan.children] as HTMLElement[];
    yuruyan.style.opacity='0';ikili.style.opacity='0';duran.forEach(o=>o.style.opacity='0');
    hazirOlunca(yuruyan,()=>{
      if(eksik()){yuruyan.remove();ikili.style.opacity='1';duran.forEach(o=>o.style.opacity='1');return}
      const alan=yer.getBoundingClientRect();
      const yuruyus=aktor.map((k,i)=>{
        const kareler=[...k.querySelectorAll('img')],r=k.getBoundingClientRect(),im=kareler[0];
        const boy=im.getBoundingClientRect().height||Math.min(r.height,r.width*im.naturalHeight/im.naturalWidth);
        const konum=r.left+r.width/2-alan.left,uzaklik=i?alan.width-konum+boy*.28:konum+boy*.28;
        const adim=Math.max(18,boy*.57),n=Math.ceil(uzaklik/adim*8),gecikme=i?160:0;
        return {k,kareler,uzaklik,n,gecikme,son:-1,bitti:false};
      });
      // Duran pozun görünürlüğünü kapsayan genel img seçicisini aşmak için
      // iki grup ayrı sarmalayıcıdadır. Yanlış poz bir kare bile parlamasın.
      yuruyan.style.opacity='1';const bas=performance.now();
      function gel(t:number){
        if(!yer.isConnected||document.hidden||!yuruyan.isConnected)return;
        const dt=t-bas;
        yuruyus.forEach(({k,kareler,uzaklik,n,gecikme},i)=>{
          const a=yuruyus[i];if(a.bitti)return;
          const adim=Math.max(0,(dt-gecikme)/99),p=Math.min(1,adim/n),f=Math.floor(adim)%8;
          k.style.translate=(i?1:-1)*uzaklik*(1-p)+'px 0';k.style.opacity=dt<gecikme?'0':'1';
          if(a.son!==f){kareler.forEach((im,j)=>im.style.visibility=j===f?'visible':'hidden');a.son=f}
          if(p>=1){a.bitti=true;k.style.opacity='0';duran[i].style.opacity='1';ikili.style.opacity='1'}
        });
        if(yuruyus.every(a=>a.bitti)){yuruyan.remove();pozOynat(duran[1],[0,1,2,3,4,5,6,7,0],160);return}
        film=requestAnimationFrame(gel);
      }
      gel(bas);
    });
    function eksik(){return aktor.some(k=>[...k.querySelectorAll('img')].some(im=>!im.naturalWidth))}
  }
  function kupaToreni(){
    const renk=s.renk==='sari'?'sari':'yesil';
    const alan=nesne('gosteri-odul-kadrosu','');
    const oyuncu=(ad:string,icerik:string)=>{
      const e=document.createElement('span');e.className='toren-'+ad;e.innerHTML=icerik;alan.append(e);return e;
    };
    const zip=oyuncu('zip',pozlar('zip-selam',6,is.res));
    oyuncu('kino',is.res('kres/kino-ev-'+renk+'-0')+is.res('kres/kino-kupa-'+renk+'-3'));
    const ceren=oyuncu('ceren',pozlar('ceren-kupa-ver',4,is.res));
    const konfeti=nesne('gosteri-konfeti','');konfeti.setAttribute('aria-hidden','true');
    const az=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renkler=['#ffc946','#ed746e','#63ceb7','#a69cdd','#fff5d5'];
    function kutla(){
      alan.dataset.teslim='evet';pozOynat(ceren.firstElementChild,[3],100);
      pozOynat(zip.firstElementChild,az?[3]:[0,1,2,3,3,4,5],190);
      ortamDur?.();ortamDur=salonAlkisi();
      for(let i=0;i<(az?8:36);i++){
        const parca=document.createElement('i');const sag=i%2===1,j=Math.floor(i/2);
        parca.style.backgroundColor=renkler[i%renkler.length];
        parca.style.left=(az?12+i*10:sag?88:12)+'%';parca.style.top=(az?15+i%3*4:61)+'%';
        konfeti.append(parca);if(az)continue;
        const dx=(sag?-1:1)*konfeti.clientWidth*(.09+(j*7%19)/48);
        const dy=konfeti.clientHeight*(.26+(j*5%17)/45);
        parca.animate([{transform:'translate(0,0) rotate(0deg)',opacity:0},{offset:.09,opacity:1},
          {offset:.48,transform:'translate('+dx*.64+'px,'+-dy+'px) rotate('+i*13+'deg)',opacity:1},
          {transform:'translate('+dx+'px,'+dy*.45+'px) rotate('+i*29+'deg)',opacity:0}],
          {duration:1550+(j%5)*115,delay:(j%4)*40,fill:'both'});
      }
      bekle(2450,()=>konfeti.remove());
    }
    hazirOlunca(alan,()=>{
      pozOynat(ceren.firstElementChild,[0],100);
      bekle(900,()=>pozOynat(ceren.firstElementChild,[1],100));
      bekle(1550,()=>pozOynat(ceren.firstElementChild,[2],100));
      bekle(2200,kutla);
    });
  }
  function secim(ad:string,art:string,fn:()=>void,raf:HTMLElement){return tus(raf,ad,art,fn,'gosteri-kart')}
  function minonunGirisi(oy:HTMLElement,basla:()=>void){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){hazirOlunca(oy,basla);return}
    const yuru=nesne('gosteri-solo gosteri-tek-giris',pozlar('mino-davulla-yuru',8,is.res));
    const govde=yuru.firstElementChild as HTMLElement,kareler=[...govde.querySelectorAll('img')];
    (oy.firstElementChild as HTMLElement).style.opacity='0';yuru.style.opacity='0';yuru.setAttribute('aria-hidden','true');
    hazirOlunca(yer,()=>{
      const bitti=()=>{yuru.remove();(oy.firstElementChild as HTMLElement).style.opacity='1';basla()};
      if(kareler.some(im=>!im.naturalWidth)){bitti();return}
      const alan=yer.getBoundingClientRect(),el=govde.getBoundingClientRect(),im=kareler[0];
      const boy=Math.min(el.height,el.width*im.naturalHeight/im.naturalWidth);
      // Adım uzunluğu esas ayağın görünür boyundan gelir. Merkezden
      // bağımsız tam gövde pozları aynı tabanda, sahne arkadaşına dönüşür.
      const adim=Math.max(15,boy*.56),yol=alan.width*.29;
      const kareSayisi=Math.max(8,Math.round(yol/adim)*8),t0=performance.now();let son=-1;
      yuru.style.opacity='1';
      const ilerle=(t:number)=>{
        if(!yuru.isConnected||document.hidden)return;
        const zaman=(t-t0)/100,ilerleme=Math.min(1,zaman/kareSayisi),k=Math.floor(zaman)%8;
        govde.style.translate=-yol*(1-ilerleme)+'px 0';
        if(k!==son){kareler.forEach((im,j)=>im.style.visibility=j===k?'visible':'hidden');son=k}
        if(ilerleme>=1){bitti();return}
        film=requestAnimationFrame(ilerle);
      };ilerle(t0);
    });
  }
  function dansiniKur(){
    yer.dataset.sahne='dans-defteri';yer.dataset.program='dort';
    ikili();
    const dizi=g.dansDizisi;
    const adlar=dansAdlari;
    yer.dataset.kurdele='evet';
    const renk=s.renk==='sari'?'sari':'yesil';
    const resimler=kinoDansKartlari(renk).map(id=>is.res('kres/'+id));
    const defter=nesne('dans-defteri',''),raf=nesne('gosteri-pedler','');
    const durum=nesne('gosteri-ekran-okuyucu','');durum.setAttribute('role','status');
    function dansiKaydet(){
      if(g.sonAni?.dal==='dans'){
        const {dansDizisi:eski,...ani}=g.sonAni;
        g.sonAni=dizi.length?{...ani,dansDizisi:[...dizi]}:ani;
      }
      is.kaydet();
    }
    const yuvalar=Array.from({length:4},(_,i)=>tus(defter,'','',()=>{
      dizi.splice(i,1);dansiKaydet();guncelle();
      durum.textContent='Hareket kaldırıldı.';
    },'dans-yuvasi'));
    const secenekler=adlar.map((ad,n)=>tus(raf,ad,resimler[n],()=>{
      if(calisiyor||dizi.length===4)return;
      is.sus();dizi.push(n);dansiKaydet();guncelle();
      const c=dansCumlesi(n,tempo.dans),az=matchMedia('(prefers-reduced-motion: reduce)').matches;
      pozOynat(yer.querySelector('.kino-sol'),az?[c.kinoTepe]:c.kino,c.ms);
      const sira=++onizleme;
      if(c.ses)bekle(az?0:c.temas*c.ms,()=>{
        if(sira===onizleme){if(c.ses==='alkis')patiAlkisi();else ayakSesi(true,true)}
      });
      durum.textContent=(dizi.length)+'. hareket, '+ad;
      if(klavyede&&dizi.length===4)oynat.focus();
    },'gosteri-ped'));
    let onizleme=0;
    const oynat=tus(defter,'Dansımı birlikte oynat',simge('ileri'),oyna,'dans-oynat');
    tus(yer,'Gösteri sonucuna dön',simge('tamam'),()=>{
      g.dansDefteriAcik=false;is.kaydet();is.sus();sil();ciz();
      if(klavyede)yer.querySelector<HTMLButtonElement>('.dans-defteri-ac')?.focus();
    },'dans-bitti');
    function guncelle(){
      yuvalar.forEach((t,i)=>{
        const dolu=i<dizi.length;
        t.innerHTML=dolu?resimler[dizi[i]]:'';
        t.disabled=calisiyor||!dolu;t.classList.toggle('siradaki',!calisiyor&&i===dizi.length);
        t.setAttribute('aria-label',dolu?(i+1)+'. hareketi kaldır, '+adlar[dizi[i]]:'Boş hareket yeri');
      });
      secenekler.forEach(t=>{t.disabled=calisiyor||dizi.length===4});
      oynat.disabled=calisiyor||!dizi.length;
    }
    function oyna(){
      if(calisiyor||!dizi.length)return;
      is.sus();onizleme++;calisiyor=true;guncelle();
      // Son adım müziğin kapanış ölçüsüne düşer. Bir hareket iki vuruş sürer.
      hazirOlunca(yer,()=>{
        muzik=sahneMuzigi('dans',kendiDansKesiti(dizi).bas,64);
        let onceki=-1;
        function kare(){
          if(!muzik||!yer.isConnected||document.hidden)return;
          const vurus=muzik.gecen()*tempo.dans/60;
          const i=Math.floor(vurus/2);
          if(i>=0&&i<dizi.length&&i!==onceki){
            yuvalar.forEach((t,j)=>t.classList.toggle('sahnede',j===i));
            beraberOyna(dansCumlesi(dizi[i],tempo.dans));onceki=i;
          }
          if(vurus>=(dizi.length+1)*2-.04){
            kes();yuvalar.forEach(t=>t.classList.remove('sahnede'));guncelle();
            durum.textContent='Dans tamamlandı.';if(klavyede)oynat.focus();return;
          }
          film=requestAnimationFrame(kare);
        }
        kare();
      });
    }
    guncelle();if(klavyede)(dizi.length===4?oynat:secenekler[0]).focus();
  }
  function ciz(){
    delete yer.dataset.ezber;delete yer.dataset.kurdele;delete yer.dataset.program;yer.dataset.sahne=g.bolum;yer.dataset.dal=g.dal??'';delete yer.dataset.deneme;delete yer.dataset.gecis;delete yer.dataset.kapanis;

    if(g.dal)kaydiHazirla(g.dal,siirMi(g.program));
    if(!perdeAcildi||g.bolum==='perde'){
      yer.dataset.sahne='perde';
      // Kumaş geriye toplanırken Mino zaten sahnenin kenarında. İlk
      // çizimler perde açılmadan çözülür; boş sahne / yükleme kesmesi yok.
      const bekleyen=nesne('gosteri-solo gosteri-perde-arkasi',pozlar('mino-davulla-yuru',8,is.res));
      bekleyen.setAttribute('aria-hidden','true');
      const perde=nesne('gosteri-kapali','<i></i><i></i>');
      for(const [degisken,son] of [['--perde-genis',''],['--perde-dik','-dik']]){
        const url=perdeler['../../assets/hazirlik/kres/perde-kapali'+son+'.webp'];
        if(url)perde.style.setProperty(degisken,'url("'+url+'")');
      }
      const ip=tus(yer,'Perdeyi aç',sahneIkon.yildiz,()=>{if(ip.disabled)return;ip.disabled=true;is.sus();ortamDur=perdeSesi();yer.dataset.gecis='evet';bekle(matchMedia('(prefers-reduced-motion: reduce)').matches?250:1480,()=>{perdeAcildi=true;dogrudanBasla=g.bolum==='final';if(g.bolum==='perde'){sonra('mino');return}sil();ciz();if(g.bolum!=='final')is.soyle(gosteriSozu(g))})},'gosteri-ip');
      perde.onclick=()=>ip.click();
      let tutus:{id:number;y:number}|null=null;
      ip.onpointerdown=e=>{
        if(tutus||!e.isPrimary||e.button!==0)return;
        tutus={id:e.pointerId,y:e.clientY};ip.setPointerCapture(e.pointerId);
      };
      ip.onpointerup=e=>{
        if(tutus?.id!==e.pointerId)return;
        const cekildi=e.clientY-tutus.y>14;tutus=null;if(cekildi)ip.click();
      };
      ip.onpointercancel=ip.onlostpointercapture=e=>{if(tutus?.id===e.pointerId)tutus=null};
      return;
    }
    if(g.dal&&g.bolum!=='sec')sahneIsiklari();
    if(g.bolum==='mino'||g.bolum==='bulut'){
      const kim=g.bolum,mino=kim==='mino',puan=soloPuanlari[kim];
      const oy=nesne('gosteri-solo gosteri-davetliler',pozlar('mino-davul',8,is.res,'davulcu')+pozlar('bulut-can',6,is.res,'canci'));
      const raf=nesne('gosteri-alkis','');let sonAlkis=-1000;
      tus(raf,'Arkadaşını alkışla',sahneIkon.alkis,()=>{
        const an=performance.now();if(an-sonAlkis<430)return;sonAlkis=an;patiAlkisi();
        const kalp=nesne('gosteri-seyirci',sahneIkon.alkis);bekle(800,()=>kalp.remove());
      });
      function puaniGoster(){
        const kart=nesne('gosteri-solo-puan','<b>'+puan+'</b><span class="gosteri-puan-dizisi" aria-hidden="true">'+
          Array.from({length:10},(_,i)=>'<i class="'+(i<puan?'dolu':'bos')+'"></i>').join('')+'</span>');
        kart.setAttribute('role','img');kart.setAttribute('aria-label',(mino?'Mino':'Bulut')+', 10 üzerinden '+puan+' puan');
        ortamDur=salonAlkisi();is.soyle(mino?'kres_mino_solo_puan':'kres_bulut_solo_puan');
        bekle(4200,()=>sonra(mino?'bulut':'sec'));
      }
      function solo(){
        const davul=oy.firstElementChild,can=oy.lastElementChild;
        const vurus=mino?490:535;
        // Sekizliklerin arasındaki boşluk, arkadaşının cümlesine yer açar.
        const ritim=mino?['A..bA.b.','A.b.A..b','A..bA.bb','A.......','A.b.A.b.','A..bA.bb','A.b.A.bb','A.......']:
          ['A...b...','A...b...','A..b....','A...b..b','A...b...','A..bA...','A.b.A..b','A.......'];
        const ezgi=mino?['....E.G.','..A.G...','....D.E.','G.E.D...','C...E.G.','A...G...','E.D...D.','C.......']:
          ['C.E.G...','A..GE...','D.F.A...','G...E.D.','C..DE.G.','A.G.E...','F.E.D.G.','C.......'];
        const notalar:Record<string,number>={C:72,D:74,E:76,F:77,G:79,A:81};
        ritim.forEach((olcu,i)=>[...olcu].forEach((baget,j)=>{
          const t=300+(8*i+j)*vurus/2,nota=ezgi[i][j];
          if(baget!=='.'){
            const sag=baget==='A';
            bekle(t,()=>pozOynat(davul,sag?[1,2,3,0]:[4,5,6,0],65));
            bekle(t+65,()=>calgiSesi(0,48,(sag?.97:.58)*(mino?1:.62)));
          }
          if(nota!=='.'){
            const ust=notalar[nota]>=77;
            bekle(t,()=>pozOynat(can,ust?[3,4,3,0]:[1,2,1,0],76));
            bekle(t+76,()=>calgiSesi(3,notalar[nota],mino?.66:1.03));
          }
        }));
        const son=300+32*vurus;
        bekle(son,()=>{pozOynat(davul,[0,6,7],135);pozOynat(can,[3,5],135)});
        bekle(son+450,puaniGoster);
      }
      if(mino)minonunGirisi(oy,solo);else hazirOlunca(oy,solo);
      return;
    }
    if(g.bolum==='sec'){
      ikili(false);sahneyeCik();const raf=nesne('gosteri-kartlar','');
      for(const [dal,ad,art] of [['sarki','Cebimdeki Tohum şiirini oku',is.res('kres/secim-zip-sarki')],['dans','Birlikte dans et',is.res('kres/secim-zip-dans')]] as const)
        secim(ad,art,()=>{g.dal=dal;const yanki=g.program?.endsWith('yanki');g.program=dal==='dans'?(yanki?'kurdele-yanki':'kurdele'):(yanki?'siir-yanki':'siir');dogrudanBasla=true;sonra('final',false)},raf);
      return;
    }
    if(g.bolum==='sonuc'){
      if(g.dansDefteriAcik){dansiniKur();return}
      const r=g.sonuc!;if(kupaKazandi(r)){
        kupaToreni();
      }else{
        const oyuncular=nesne('gosteri-ikili',r.siir?tohumIkilisi(is.res):pozlar('kino-selam-'+(s.renk==='sari'?'sari':'yesil'),6,is.res,'kino-sol')+pozlar('zip-selam',6,is.res,'zip-sag'));
        pozOynat(oyuncular.firstElementChild,[r.siir?3:5],180);pozOynat(oyuncular.lastElementChild,[r.siir?3:5],180);
      }
      const raf=tus(yer,'Puanını dinle',kupaKazandi(r)?sahneIkon.kupa:sahneIkon.yildiz,()=>is.soyle('kres_gosteri_puan_'+r.puan),'gosteri-odul');
      raf.insertAdjacentHTML('beforeend','<b aria-label="'+r.puan+' puan">'+r.puan+' / 10</b><span class="gosteri-puan-dizisi" aria-hidden="true">'+Array.from({length:10},(_,n)=>'<i class="'+(n<r.puan?'dolu':'')+'"></i>').join('')+'</span>');
      if(kupaKazandi(r))raf.classList.add('gosteri-kazanan');
      const incele=tus(yer,'Yıldızların nereden geldiğini gör',ikon('<circle cx="34" cy="31" r="21" fill="#d6f0de"/><path d="m48 46 8-7 17 19q3 4-3 8t-9-1Z" fill="#df9468"/><g transform="translate(16 13) scale(.46)">'+yildiz+'</g>'),()=>{
        const pencere=document.createElement('dialog');pencere.className='gosteri-yildiz-penceresi';pencere.setAttribute('aria-label','Gösteride toplanan yıldızlar');
        const adet=g.kararlar.filter(Boolean).length,vurus=g.isaretler.filter(Boolean).length;
        const satir=(ad:string,art:string,dizi:readonly boolean[],soz:string)=>{
          const s=tus(pencere,ad,'<i>'+art+'</i><span>'+dizi.map(d=>'<i class="'+(d?'dolu':'bos')+'">'+(d?sahneIkon.yildiz:ikon(yildiz))+'</i>').join('')+'</span>',()=>is.soyle(soz),'gosteri-yildiz-sirasi');return s;
        };
        if(konserMi(g.program)){
          satir('İlk beş vuruş',sahneIkon.adim,g.isaretler.slice(0,5),'kres_sahne_on_yildiz');
          satir('Son beş vuruş',sahneIkon.yildiz,g.isaretler.slice(5),'kres_sahne_on_yildiz');
        }else{
        satir('İki sahne kararını dinle',sahneIkon.isik,g.kararlar,['kres_gosteri_sifir_secim','kres_gosteri_bir_secim','kres_gosteri_iki_secim'][adet]);
        satir('Sekiz müzik işaretini dinle',g.dal==='dans'?sahneIkon.adim:sahneIkon.mikrofon,g.isaretler,vurus===8?'kres_gosteri_ritim_tam':vurus?'kres_gosteri_ritim_var':'kres_gosteri_ritim_yok');
        }
        const b=tus(pencere,'Gösteri sonucuna dön',simge('tamam'),()=>pencere.close(),'gosteri-yildiz-kapat');
        pencere.addEventListener('close',()=>{pencere.remove();is.sus();if(klavyede&&incele.isConnected)incele.focus()},{once:true});
        yer.append(pencere);pencere.showModal();b.focus({preventScroll:true});is.soyle(siirMi(g.program)?'kres_siir_yildiz':konserMi(g.program)?'kres_sahne_on_yildiz':'kres_gosteri_yildizlar');
      },'gosteri-yildiz-buyut');
      if(!birlikteSelam&&!kupaKazandi(r))bekle(180,()=>{ortamDur=salonAlkisi()});
      if(!kupaKazandi(r)&&s.kres.bugununKupasi)tus(yer,'Bugün daha önce kazandığın kupayı dinle',sahneIkon.kupa,()=>is.soyle('kres_gosteri_onceki_kupa'),'gosteri-onceki-kupa');
      const alt=nesne('gosteri-kartlar','');
      secim('Gösteriyi yeniden dene',simge('yenile'),()=>{Object.assign(g,yeniGosteri(),{program:g.program?.endsWith('yanki')?'konser':'konser-yanki',sonuc:g.sonuc,sonAni:g.sonAni});sonra('sec')},alt);
      if(r.dal==='dans'){
        alt.classList.add('dans-sonuc-secimleri');
        const yap=secim('Kendi dansını hazırla',is.res('kres/secim-zip-dans'),()=>{
          g.dansDefteriAcik=true;is.kaydet();sil();ciz();is.soyle('zip_sahne_dansini_kur');
        },alt);yap.classList.add('dans-defteri-ac');
      }
      secim('Gösteriden eve dön',simge('ev'),()=>is.gir('ev-yolu'),alt);return;
    }
    const dans=g.dal==='dans',desen=programDeseni(kim(),g.program),b=60/tempo[kim()];
    const dort=dortlu(g.program),bes=dans&&kurdeleli(g.program),adet=bes?5:dort?4:2;
    if(bes)yer.dataset.kurdele='evet';
    yer.dataset.program=dort?'dort':'ilk';
    let kinoBitis=0;
    const siir=siirMi(g.program)&&!dans;
    let tutulan:{id:number;nota:number;el:number}|null=null;
    ikili();
    if(!dans&&!siir){const raylar=nesne('gosteri-nota-yollari','<i></i>'.repeat(adet));raylar.setAttribute('aria-hidden','true')}
    const ray=nesne('gosteri-ray',''),ped=nesne('gosteri-pedler','');
    const sanat=siir?['gunes','ay','yildiz','zil'].map(ad=>is.res('kres/siir-tusu-'+ad)):dort?(dans?dansKartlari.map(id=>is.res('kres/'+id)):[sahneIkon.gunes,sahneIkon.ay,sahneIkon.yildiz,sahneIkon.zil]):dans?[sahneIkon.alkis,sahneIkon.adim]:[sahneIkon.gunes,sahneIkon.ay],adlar=dort?(dans?dansAdlari.slice(0,adet):['Güneş','Ay','Yıldız','Zil']):dans?['Alkış','Adım']:['Güneş','Ay'];
    const sarkili=dort&&!dans;
    if(siir){ray.hidden=true;ped.classList.add('siir-tuslari')}
    let yanan=-1;
    function isigiYak(n:number){
      if(!siir||n===yanan)return;
      ped.children[yanan]?.classList.remove('sira-sende');
      ped.children[n]?.classList.add('sira-sende');yanan=n;
    }
    const ezber=(i:number)=>siir&&i>=4;
    const erken=(i:number)=>ezber(i) ? .70 : 1.35;
    const gec=(i:number)=>ezber(i) ? 1.35 : 2.1;
    const isaretAni=(i:number)=>notaVurusu(i,g.program,kim());
    const balon=sarkili&&!siir?nesne('gosteri-ses-balonu',''):null;
    if(balon){balon.hidden=true;balon.setAttribute('aria-hidden','true')}
    let balonSirasi=0;
    function sesBalonu(kim:'zip'|'kino',el:number){
      if(!balon)return;
      const sira=++balonSirasi;balon.hidden=false;balon.dataset.kim=kim;
      balon.innerHTML=sanat[el];
      bekle(610,()=>{if(sira===balonSirasi)balon.hidden=true});
    }
    function ornekSes(n:number){
      ritimTusu(n,.50);sesBalonu('zip',n);
      if(!siir)pozOynat(yer.querySelector('.zip-sag'),[2,3,5,2,7],108);
    }
    const rozet=nesne('gosteri-sayac','');
    const pullar=Array.from({length:desen.length},()=>{
      const pul=document.createElement('i');if(dort)pul.innerHTML=sahneIkon.yildiz;rozet.append(pul);return pul;
    });
    const sayac=()=>pullar.forEach((pul,i)=>{pul.className=i>=g.isaretler.length?'':g.isaretler[i]?'alindi':'gecti'});
    sayac();

    const sesliIz=document.createElement('span');sesliIz.className='gosteri-ekran-okuyucu';sesliIz.setAttribute('role','status');sesliIz.setAttribute('aria-live','polite');sesliIz.setAttribute('aria-atomic','true');yer.append(sesliIz);
    let rehberEl=-1;
    function rehber(n:number,acik:boolean){
      if(!dort||!dans)return;
      const yeni=acik?n:-1;if(yeni===rehberEl)return;
      if(rehberEl>=0)ped.children[rehberEl]?.classList.remove('hareket-ipucu');
      rehberEl=yeni;
      if(yeni>=0){
        const tus=ped.children[yeni];tus.classList.add('hareket-ipucu');
        const kareler=dansOrnegi(yeni);
        pozOynat(tus.querySelector('.gosteri-kucuk-poz'),kareler.map((_,i)=>i),100);
      }
    }
    function isaret(n:number){
      rehber(n,false);isigiYak(-1);
      ray.style.setProperty('--el',String(n));if(!siir)ray.innerHTML='<span class="gosteri-dusen iz-'+n+'">'+sanat[n]+'</span>';
      delete yer.dataset.vur;delete yer.dataset.yaklasti;delete yer.dataset.tutulan;tutulan=null;
      if(ezber(aktif))yer.dataset.ezber='dinle';else delete yer.dataset.ezber;
      sesliIz.textContent=('İşaret '+(g.isaretler.length+1))+': '+adlar[n];
      if(dans){hareket(n,true);yer.dataset.sira='izle'}
    }
    function dokun(n:number){
      if(aktif<0||!calisiyor)return;
      const beklenen=desen[aktif];
      if(muzik){
        const an=muzik.gecen()/b+basVurus;
        if(an<isaretAni(aktif)-erken(aktif)||an>isaretAni(aktif)+gec(aktif))return;
        if(!g.dokunuslar.some(e=>e.sira===aktif&&e.el===n))g.dokunuslar.push({sira:aktif,el:n as 0|1|2|3|4,fark:Math.round((an-isaretAni(aktif))*100)/100});
      }
      if(n!==beklenen){
        denendi=true;g.ipucu=true;is.kaydet()
        ray.classList.add('gosteri-yardim');rehber(beklenen,true);
        return;
      }
      isigiYak(-1);
      if(sarkili){
        ritimTusu(n);sesBalonu('kino',n);
      }else if(dans){if(!dort){if(n===1)ayakSesi(true,true);else patiAlkisi()}}else cevapNotasi(!!n,muzik!.gecen()/b+basVurus,true);
      if(sarkili){
        if(!siir)pozOynat(yer.querySelector('.zip-sag'),[7,6,4],150);
      }
      else hareket(n);
      kinoBitis=performance.now()+(dans?730:1050);
      rehber(n,false);yer.dataset.vur=String(n);bekle(440,()=>{delete yer.dataset.vur});
      g.isaretler.push(!denendi);g.ipucu=false;is.kaydet();sayac();aktif=-1;ray.replaceChildren();ray.classList.remove('gosteri-yardim');
      yer.dataset.sira='birlikte';
      if(!dort){
        const geribildirim=nesne('gosteri-dokunus iz-'+n,sanat[n]);
        geribildirim.style.setProperty('--el',String(n));bekle(550,()=>geribildirim.remove());
      }
    }
    adlar.forEach((ad,n)=>{
      let islenen=false;
      const pedTusu=tus(ped,ad,sanat[n],()=>{if(islenen){islenen=false;return}dokun(n)},'gosteri-ped');
      if(dort&&dans){
        const ipucu=dansOrnegi(n).map(f=>{
          const grup=Math.floor((f-8)/6);
          const set=f<8?'zip-dans':dansPozlari('zip','yesil')[grup];
          return is.res('kres/'+set+'-'+(f<8?f:(f-8)%6));
        });
        pedTusu.insertAdjacentHTML('beforeend','<span aria-hidden="true" class="gosteri-kucuk-poz">'+ipucu.join('')+'</span>');
      }
      if(dort&&dans){
        pedTusu.onpointerdown=e=>{if(!e.isPrimary||e.button!==0)return;islenen=true;sesiAc();dokun(n)};
        pedTusu.onpointercancel=pedTusu.onkeydown=()=>{islenen=false};
        return;
      }
      if(dans)return;
      // Küçük çocuk parmağını nota yaklaşırken resmin üstüne koyup bekleyebilir.
      // Her nota yeniden basılmayı ister; sürekli basılı parmak sonraki notayı toplamaz.
      pedTusu.onpointerdown=e=>{
        if(e.button!==0||!e.isPrimary||!muzik||aktif<0)return;islenen=false;
        const an=muzik.gecen()/b+basVurus;
        if(an<isaretAni(aktif)-erken(aktif)){if(ezber(aktif)){islenen=true;return}tutulan={id:e.pointerId,el:n,nota:aktif};yer.dataset.tutulan=String(n);pedTusu.setPointerCapture(e.pointerId)}
        else if(dort){islenen=true;dokun(n)}
      };
      const birak=(e:PointerEvent)=>{if(tutulan?.id===e.pointerId){tutulan=null;delete yer.dataset.tutulan}};
      pedTusu.onpointercancel=e=>{birak(e);islenen=false};pedTusu.onpointerup=birak;pedTusu.onlostpointercapture=birak;
      pedTusu.addEventListener('hazirlik-tutuldu',()=>{islenen=true});
      pedTusu.onkeydown=()=>{islenen=false};
    });
    ped.onkeydown=e=>{
      if(!e.repeat&&/^[1-5]$/.test(e.key)&&Number(e.key)<=adet){e.preventDefault();dokun(Number(e.key)-1);return}
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
      e.preventDefault();(ped.children[([...ped.children].indexOf(document.activeElement as Element)+(e.key==='ArrowLeft'?-1:1)+adet)%adet] as HTMLButtonElement).focus();
    };
    if(dans){
      // İki büyük düğme her zaman aynı işi yapar. İsteyen sahnede tek
      // parmakla alkışlar veya yana çizerek iki oyuncuya adım attırır.
      const pista=yer.querySelector<HTMLElement>('.gosteri-ikili')!;
      let parmak:{id:number;x:number;y:number}|null=null;
      pista.onpointerdown=e=>{if(parmak||e.button!==0)return;parmak={id:e.pointerId,x:e.clientX,y:e.clientY};pista.setPointerCapture(e.pointerId);e.preventDefault();sesiAc()};
      pista.onpointerup=e=>{
        if(parmak?.id!==e.pointerId)return;
        const dx=e.clientX-parmak.x,dy=e.clientY-parmak.y,esik=Math.min(32,Math.max(16,pista.clientWidth*.055));parmak=null;
        if(bes&&Math.abs(dx)>=esik&&dy<=-esik&&Math.abs(dx)<2.5*Math.abs(dy))dokun(4);
        else if(Math.abs(dx)>=esik&&Math.abs(dy)<Math.abs(dx)*1.25)dokun(1);
        else if(dort&&Math.abs(dy)>=esik)dokun(dy<0?2:3);
        else if(Math.hypot(dx,dy)<esik)dokun(0);
      };pista.onlostpointercapture=pista.onpointercancel=()=>{parmak=null};
    }
    let basVurus=0;
    const baslat=()=>{
      is.sus();calisiyor=true;yer.querySelector('.gosteri-baslat')?.remove();
      if(klavyede)(ped.firstElementChild as HTMLButtonElement)?.focus({preventScroll:true});
      basVurus=ilkSahneVurusu(g);
      muzik=sahneMuzigi(kim(),basVurus,64,dort,siir);sonPoz=-1;
      const vokal=dort&&!dans?kinoVokali(yer.querySelector('.kino-sol')!,s.renk==='sari'?'sari':'yesil',siir?'kino':undefined):null;
      const tilki=siir?kinoVokali(yer.querySelector('.zip-sag')!,'yesil','zip'):null;
      let kapanisAdimlari:number[]|undefined;
      let sarkiSonu:ReturnType<typeof sarkiSelami>|undefined,sonNota=-1;
      let sonGorulen=basVurus,sonBirlikte=-1;
      function kapanis(an:number){
        // Çocuğun son hareketini bitirmesini bekle. Son iki ölçü ikilinin
        // birlikte koro/cevap cümlesidir; burada artık yıldız aranmaz.
        const bas=bes?60:dans&&konserMi(g.program)?52:56;
        if(an<bas||an>=63.85)return;
        const boluk=Math.floor((an-bas)/2);if(boluk===sonBirlikte)return;sonBirlikte=boluk;
        if(!yer.dataset.kapanis){
          yer.dataset.kapanis='birlikte';ped.inert=true;
          sesliIz.textContent=dans?'Kino ile Zıpzıp son adımı birlikte yapıyor.':'Kino ile Zıpzıp son cümleyi birlikte söylüyor.';
        }
        if(dans&&dort){
          kapanisAdimlari??=sonDansAdimlari(desen,g.dokunuslar);
          const el=kapanisAdimlari[boluk%4];beraberOyna(dansCumlesi(el,tempo.dans));
          return;
        }
        const k=birlikteKapanis(kim(),boluk,tempo[kim()]);
        if(!vokal)pozOynat(yer.querySelector('.kino-sol'),k.kino,k.ms);
        if(!tilki)pozOynat(yer.querySelector('.zip-sag'),k.zip,k.ms);
        if(k.ses)bekle(2*k.ms,()=>{if(k.ses==='adim')ayakSesi(true,true);else patiAlkisi()});
      }
      function kare(){
        if(!yer.isConnected||document.hidden||!muzik){kes();return}
        const an=muzik.gecen()/b+basVurus,n=g.isaretler.length,h=isaretAni(n);
        // An OS interruption or a very slow frame must not silently consume the
        // response window while the child has never seen the approaching note.
        if(n<desen.length&&an-sonGorulen>3.5&&sonGorulen<h+gec(n)&&an>h-.35){sil();is.kaydet();ciz();return}
        sonGorulen=an;vokal?.(an*b);tilki?.(an*b);
        if(n<desen.length&&an>=h-(dort&&dans?1.35:3)&&aktif<0){
          aktif=n;denendi=g.ipucu;isaret(desen[n]);
          if(sarkili&&an<h-1.35)ornekSes(desen[n]);
        }
        if(aktif>=0){
          const p=Math.max(0,Math.min(1,(an-(h-3))/3));ray.style.setProperty('--inis',String(p));
          if(ezber(n)){
            if(yer.dataset.ezber==='dinle'&&an>=h-1.45){
              yer.dataset.ezber='sende';sesliIz.textContent='Sıra sende';
            }
            if(denendi)yer.dataset.ezber='yardim';
          }
          if(siir)isigiYak(an>=h-erken(n)&&an<=h+gec(n)?desen[n]:-1);
          if(!dans)yer.dataset.yaklasti=an>=h-erken(n)?String(desen[n]):'';
          if(tutulan?.nota===aktif&&an>=h-1.35){
            const el=tutulan.el;tutulan=null;delete yer.dataset.tutulan;
            ped.children[el].dispatchEvent(new Event('hazirlik-tutuldu'));dokun(el);
          }
          if(dans)yer.dataset.sira=an>=h-1.35?'sen':'izle';
          if(aktif>=0){const ipucu=denendi||an>=h+.4;ray.classList.toggle('gosteri-yardim',ipucu);rehber(desen[n],ipucu)}
          if(aktif>=0&&an>h+gec(n)){isigiYak(-1);rehber(desen[n],false);g.isaretler.push(false);g.ipucu=false;is.kaydet();sayac();aktif=-1;ray.replaceChildren();delete yer.dataset.yaklasti;ray.classList.remove('gosteri-yardim')}
        }
        const adim=Math.floor(an/4);if(adim!==sonPoz&&aktif<0&&n<desen.length&&performance.now()>=kinoBitis){
          if(dans){pozOynat(yer.querySelector('.kino-sol'),[0,1,0],215);pozOynat(yer.querySelector('.zip-sag'),[0,1,0],225)}
          else if(vokal){if(!tilki)pozOynat(yer.querySelector('.zip-sag'),[0,1,0],200);}
          else hareket(Math.abs(adim)%2);
          sonPoz=adim;
        }
        if(n===desen.length)kapanis(an);
        if(sarkili&&n===desen.length&&an>=60&&an<64){
          sarkiSonu??=sarkiSelami(desen,g.dokunuslar);
          const i=Math.floor(an-60),nota=sarkiSonu[i];
          if(nota&&i!==sonNota){
            sonNota=i;
            if(nota.kim==='zip')ornekSes(nota.el);
            else{ritimTusu(nota.el);sesBalonu('kino',nota.el);if(!tilki)pozOynat(yer.querySelector('.zip-sag'),[7],125)}
          }
        }
        if(an>=63.85){
          g.sonuc={dal:kim(),puan:puan(g),...(siir?{siir:true as const}:{})};g.sonAni={...g.sonuc,...(g.program?{program:g.program}:{}),renk:s.renk==='sari'?'sari':'yesil',dokunuslar:g.dokunuslar.map(e=>({...e}))};tamamla(s.kres,'gosteri');s.kres.eveYol=0;s.kres.evKarsilama='kapi';
          if(kupaKazandi(g.sonuc))s.kres.bugununKupasi=g.sonAni;
          sil();g.bolum='sonuc';is.kaydet();birlikteSelam=true;yer.dataset.sahne='selam';
          const kadro=nesne('gosteri-ikili',siir?tohumIkilisi(is.res):pozlar('kino-selam-'+(s.renk==='sari'?'sari':'yesil'),6,is.res,'kino-sol')+pozlar('zip-selam',6,is.res,'zip-sag'));
          sahneIsiklari();
          hazirOlunca(kadro,()=>{
            pozOynat(kadro.firstElementChild,siir?[0,3,3,0]:[0,1,2,3,3,4,5],240);
            bekle(180,()=>{pozOynat(kadro.lastElementChild,siir?[0,3,3,0]:[0,1,2,3,3,4,5],240);ortamDur=salonAlkisi()});
            bekle(2550,()=>sonra('sonuc'));
          });return;
        }film=requestAnimationFrame(kare);
      }kare();
    };
    const hazirlan=()=>{
      const id=surum;void Promise.resolve(kaydiHazirla(kim(),siir)).then(()=>{
        if(id===surum&&yer.isConnected)hazirOlunca(yer,baslat);
      });
    };
    if(dogrudanBasla){dogrudanBasla=false;hazirlan();return}
    const bas=tus(yer,'Final gösterisini başlat',simge('ileri'),()=>{if(!bas.disabled){bas.disabled=true;hazirlan()}},'gosteri-baslat');
  }
  function tekrarDinle(){
    if(!perdeAcildi){is.soyle('kres_gosteri_giris');return}
    if(g.dansDefteriAcik){sil();ciz();is.soyle('zip_sahne_dansini_kur');return}
    if(g.bolum==='final'&&calisiyor){
      // Yönergeyi duymak isteyen çocuğun önünden yeni notalar geçmesin.
      // Tamamlanmış vuruşu kaydet, müziği sustur ve hazır olmasını bekle.
      sil();is.kaydet();ciz();is.soyle(gosteriSozu(g));return;
    }
    if(g.bolum==='mino'||g.bolum==='bulut'){sil();ciz()}
    is.soyle(gosteriSozu(g));
  }
  // Yerel pakette ana menü bir diyalogdur: arkasında müzik ve puan saati
  // akamaz. Telefon kilitlenir ya da dönerken diyalog açık da kalabilir.
  let molada=false;
  function mola(){molada=true;kes();yer.getAnimations({subtree:true}).forEach(a=>a.pause());is.kaydet()}
  function devam(){if(!molada||!yer.isConnected)return;molada=false;sil();ciz();if(klavyede)ilkOdak()}
  window.addEventListener('hazirlik-mola',mola);window.addEventListener('hazirlik-moladan-don',devam);
  if(document.querySelector('.kres-yerel-menu[open]'))mola();else ciz();
  return {kapat:()=>{window.removeEventListener('hazirlik-mola',mola);window.removeEventListener('hazirlik-moladan-don',devam);kes()},tekrarDinle};
}
