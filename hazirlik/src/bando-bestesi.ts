import {bandoCal,type BandoKaydi} from '../../src/audio/bando';
import {efekt} from '../../src/audio/efekt';
import {sesiAc} from '../../src/audio/ses';
import {simge} from './cizim';
import type {Beste} from './kres-kaydi';
import './bando-bestesi.css';

const isimler=['Davul','Marakas','Tef','Çan','Ksilofon','Flüt'];
const renkler=['#ed957b','#f9cc62','#8dcab3','#91c1df','#c1a2cd','#ffc698'];
const calgilar=import.meta.glob<string>('../../assets/hazirlik/etkinlik/muzik-*.webp',{eager:true,query:'?url',import:'default'});
const res=(i:number)=>'<img alt="" draggable="false" src="'+calgilar['../../assets/hazirlik/etkinlik/muzik-'+i+'.webp']+'">';
const ikonlar=import.meta.glob<string>('../../assets/hazirlik/dugmeler/beste-*.webp',{eager:true,query:'?url',import:'default'});
const ikon=(id:string)=>'<img draggable="false" alt="" src="'+ikonlar['../../assets/hazirlik/dugmeler/beste-'+id+'.webp']+'">';
export const besteIkonu=ikon('defter');
const sus=ikon('sus'),oynat=ikon('oynat'),dur=ikon('dur'),geriAl=ikon('geri'),tempo=ikon('tempo');
export function besteAc(yer:HTMLElement,d:Beste,kaydet:()=>void,kapat:()=>void,soyle:(n:string)=>void){
  const masa=document.createElement('section');masa.className='beste-masa';masa.setAttribute('aria-label','Kendi bandon');yer.append(masa);
  let secim:number|null=null,sira=-1,zaman=0;
  let birlikte=false,baslangic:number|null=null,plakKaresi=0,plakCaliniyor=false;
  let taslak:NonNullable<Beste['plak']>=[];
  function plagiDurdur(){
    cancelAnimationFrame(plakKaresi);plakCaliniyor=false;
    if(baslangic!==null&&taslak.length){d.plak=[...taslak];kaydet()}
    baslangic=null;taslak=[];masa.querySelectorAll('.plak-vurusu').forEach(e=>e.classList.remove('plak-vurusu'));
  }

  let kayit:BandoKaydi|undefined;
  const tus=(ad:string,ikon:string,eylem:()=>void)=>{
    const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',ad);b.innerHTML=ikon;b.onclick=()=>{sesiAc();eylem()};return b;
  };
  const cubuk=document.createElement('div');cubuk.className='beste-serit';
  const sazlar=document.createElement('div');sazlar.className='beste-sazlar';
  const arac=document.createElement('div');arac.className='beste-arac';
  const dinle=tus('Besteni çal',oynat,()=>sira>=0?durdur():basla());
  const sil=tus('Bir vuruş çıkar',geriAl,()=>{durdur();d.vuruslar.splice(secim??d.vuruslar.length-1,1);secim=null;efekt.sayfa();kaydet();goster()});
  const hiz=tus('Çalma hızını değiştir',tempo,()=>{durdur();d.tempo=(d.tempo+1)%3;kaydet();goster();efekt.nota(d.tempo+1)});
  const durak=tus('Bir vuruş sessizlik ekle',sus,()=>ekle(-1));
  const bitir=tus('Besteni sakla ve dön',simge('tamam'),()=>{plagiDurdur();durdur();kaydet();kapat()});
  const yardim=tus('Nasıl beste yapılır, dinle',simge('ses'),()=>soyle('mino_beste_yap'));
  const dongu=tus('Besteni döngüye al ve üzerine çal',ikon('dongu'),()=>{
    birlikte=!birlikte;durdur();if(birlikte){soyle('kres_bando_ustune');basla()}
  });
  const kes=tus('Çaldığın sesleri plağa kaydet',ikon('kaydet'),()=>{
    const kaydediyordu=baslangic!==null;plagiDurdur();birlikte=false;durdur();
    if(kaydediyordu){goster();return}
    baslangic=performance.now();
    const izle=()=>{if(baslangic===null)return;if(performance.now()-baslangic>=8000||!masa.isConnected){plagiDurdur();goster();return}plakKaresi=requestAnimationFrame(izle)};
    izle();goster();
  });
  const plak=tus('Kendi plağını dinle',ikon('plak'),()=>{
    const caliyordu=plakCaliniyor;plagiDurdur();birlikte=false;durdur();
    if(caliyordu||!d.plak?.length){goster();return}
    const notalar=[...d.plak],bas=performance.now()-notalar[0].an;let n=0;plakCaliniyor=true;
    function izle(){if(!plakCaliniyor)return;const an=performance.now()-bas;
      while(n<notalar.length&&an>=notalar[n].an){const saz=notalar[n++].saz;efekt.sinifCalgisi(saz);sazlar.querySelectorAll('button').forEach(b=>b.classList.toggle('plak-vurusu',Number(b.dataset.saz)===saz))}
      if(!masa.isConnected||an>notalar[notalar.length-1].an+450){plagiDurdur();goster();return}plakKaresi=requestAnimationFrame(izle)
    }
    izle();goster();
  });
  arac.append(yardim,durak,sil,hiz,dongu,dinle,kes,plak,bitir);masa.append(cubuk,sazlar,arac);
  isimler.forEach((ad,i)=>{const b=tus(ad+' ekle',res(i),()=>{if(baslangic!==null){
      const an=Math.round(performance.now()-baslangic);if(an<8000&&taslak.length<64){taslak.push({saz:i,an});efekt.sinifCalgisi(i)}return;
    }
    if(plakCaliniyor){plagiDurdur();goster()}
    if(birlikte&&sira>=0){efekt.sinifCalgisi(i);return}ekle(i)});b.dataset.saz=String(i);b.style.setProperty('--saz',renkler[i]);sazlar.append(b)});
  function durdur(){cancelAnimationFrame(zaman);kayit?.durdur();kayit=undefined;sira=-1;goster()}
  function ekle(i:number){
    durdur();
    if(secim===null&&d.vuruslar.length===8){soyle('mino_beste_degistir');return}
    const n=secim??d.vuruslar.length;d.vuruslar[n]=i;secim=null;
    if(i>=0)efekt.sinifCalgisi(i);else efekt.dokunma();
    kaydet();goster();
  }
  function basla(){
    secim=null;
    const bpm=[84,104,124][d.tempo];
    const parca=bandoCal(d.vuruslar,bpm,false,0,undefined,1,birlikte);kayit=parca;
    function izle(){
      if(!masa.isConnected||document.hidden||parca.gecen()>=parca.sure){durdur();return}
      const n=Math.max(0,Math.floor(parca.gecen()*bpm/60))%d.vuruslar.length;
      if(sira!==n){sira=n;goster()}
      zaman=requestAnimationFrame(izle);
    }
    izle();
  }
  function goster(){
    cubuk.replaceChildren();
    for(let n=0;n<8;n++){
      const i=d.vuruslar[n],b=tus(i===undefined?'Boş vuruş':(n+1)+'. vuruşu değiştir',i===undefined?'<i></i>':i===-1?sus:res(i),()=>{
        durdur();secim=secim===n?null:n;if(i>=0)efekt.sinifCalgisi(i);goster();
      });
      b.disabled=i===undefined||baslangic!==null||plakCaliniyor;b.classList.toggle('sirada',n===sira);b.setAttribute('aria-pressed',String(secim===n));cubuk.append(b);
    }
    for(const el of sazlar.querySelectorAll<HTMLButtonElement>('button'))el.classList.toggle('calani',sira>=0&&d.vuruslar[sira]===Number(el.dataset.saz));
    kes.setAttribute('aria-pressed',String(baslangic!==null));plak.setAttribute('aria-pressed',String(plakCaliniyor));plak.disabled=!d.plak?.length||baslangic!==null;
    const meşgul=baslangic!==null||plakCaliniyor;
    durak.disabled=hiz.disabled=meşgul;
    dongu.disabled=meşgul||!d.vuruslar.length;dongu.setAttribute('aria-pressed',String(birlikte));
    dinle.disabled=sil.disabled=meşgul||!d.vuruslar.length;dinle.innerHTML=sira<0?oynat:dur;dinle.setAttribute('aria-label',sira<0?'Besteni çal':'Çalmayı durdur');
    hiz.innerHTML=tempo+'<span aria-hidden="true">'+[0,1,2].map(i=>'<i class="'+(i<=d.tempo?'dolu':'')+'"></i>').join('')+'</span>';
    hiz.setAttribute('aria-label',['Yavaş','Orta','Hızlı'][d.tempo]+' tempo, değiştirmek için dokun');
  }
  const mola=()=>{birlikte=false;plagiDurdur();durdur()};
  window.addEventListener('hazirlik-mola',mola);
  const degisim=new MutationObserver(()=>{if(!masa.isConnected){plagiDurdur();durdur();degisim.disconnect();window.removeEventListener('hazirlik-mola',mola)}});
  degisim.observe(yer,{childList:true});goster();soyle('mino_beste_yap');
}
