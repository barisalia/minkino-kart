import {tavaKaydiniOku,type TavaKaydi,type TavukCifti} from './tavuk-porsiyonu';
import { h } from '../../src/ui/dom';
import { efekt } from '../../src/audio/efekt';
import { arkaPlanDinle } from '../../src/kabuk/yon';
import { kizartmaSesi } from './tepsi-tavuk-ses';
import { dugme, ikon } from './gorsel';
import { hareket, icinde, jest, merkez, zaman, type Nokta } from './hareket';
import './tepsi-tavuk.css';

const dosyalar = import.meta.glob<string>('../../assets/sef/tepsi/tavuk/*.webp', {
  eager: true, query: '?url', import: 'default',
});
const adres = (ad: string) => dosyalar['../../assets/sef/tepsi/tavuk/'+ad+'.webp'];
const cizim = (ad: string, sinif = '') => h('img', {src:adres(ad), alt:'', draggable:'false', class:sinif});
export const tavukResmi = adres('servis');
type Puan = 1|2|3;
export const tavukPuanResmi=(puan:number)=>adres(puan===1?'servis-yanik':puan===2?'servis-fazla':'servis');
const KARAMEL_MS=9000;
const YANIK_MS=21000;
const ipucu = [
  'Filetoları maşayla tavaya koy.',
  'Alt yüzleri pişti. Maşayla çevir.',
  'Tavuklar kızardı! Tabağa al ya da ateşi kapat.',
];
const kayitYeri = 'minkino-tepsi-tavuk-konumu';
const tavada = [[56,45],[69,63]];
const tabakta = [[14,49],[27,56]];

type Taraf = 0 | 1;
type Poz=TavaKaydi;
const ilkPoz = (): Poz => ({ilk:0,ikinci:0,son:0,ekSure:0,ates:false,puan:3});
function konumOku(anahtar:string,n: number): Poz {
  try {
    const s=JSON.parse(sessionStorage.getItem(anahtar) || 'null');
    if (n && s?.adet === n && [s.ilk,s.ikinci,s.son].every(x=>x===0||x===1)) {
      const sure=Number.isFinite(s.ekSure)?Math.max(0,Math.min(YANIK_MS,s.ekSure)):0;
      const kayit=tavaKaydiniOku({...s,ekSure:sure,ates:(n===4||n===5)&&s.ates===true&&sure<YANIK_MS,
        puan:s.puan===1||s.puan===2?s.puan:3});
      if(kayit)return kayit;
    }
  } catch { /* Konumlar oturum içinde de tutulur. */ }
  return ilkPoz();
}
function konumYaz(anahtar:string,n: number, p: Poz) {
  try { sessionStorage.setItem(anahtar,JSON.stringify({...p,adet:n})); } catch { /* Bellekteki konum yeterli. */ }
}
const yerlestir=(el:HTMLElement,yer:number[])=>{
  el.style.left=yer[0]+'%'; el.style.top=yer[1]+'%';
};

export function tavukIstasyonu(
  alan: HTMLElement, adet:number, kaydet:(n:number)=>void, bitti:()=>void,
  soyle:(s:string)=>void, sesli:()=>boolean,
  kalite?:(puan:Puan)=>void,
  oncekiPuan?:Puan,
  oyunKaydi?:{tava?:TavaKaydi;yaz:(t:TavaKaydi)=>void;sun:(parcalar:TavukCifti)=>void},
):()=>void {
  let n=Number.isFinite(adet)?Math.min(6,Math.max(0,Math.floor(adet))):0;
  const anahtar=alan.dataset.menu ? kayitYeri+'-'+alan.dataset.menu : kayitYeri;
  const p=tavaKaydiniOku(oyunKaydi?.tava)??konumOku(anahtar,n);
  const sakla=()=>{konumYaz(anahtar,n,p);oyunKaydi?.yaz({...p});};
  let uygulamaArkada=false;
  if(n>=4&&oncekiPuan&&oncekiPuan<p.puan){
    p.puan=oncekiPuan;p.ekSure=oncekiPuan===1?YANIK_MS:KARAMEL_MS;
    if(oncekiPuan===1)p.ates=false;
  }
  let kapali=false, dolu=false, bitirildi=false, elde:Taraf|undefined;
  let isinma=0, kaynak:HTMLElement|undefined, gezici:HTMLElement|undefined;
  let saat=0, oncekiAn=performance.now(), sonKayit=0;
  let sonReplik=-1;
  const kok=h('section.tv-mutfak',{'aria-label':'Tavuk tavası'});
  const fon=cizim('ocak','tv-fon');
  const sahne=h('div.tv-oyun');
  kok.append(fon,sahne);alan.append(kok);
  const ses=(fn:()=>void)=>{if (sesli()&&!document.hidden)fn();};
  function anlat(adim:number){
    if(sonReplik===adim)return;
    sonReplik=adim;
    soyle(ipucu[adim]);
  }
  function temizle(){
    kapali=true;window.clearTimeout(isinma);window.clearInterval(saat);
    dinlemeyiBirak();sakla();document.removeEventListener('visibilitychange',gorunurluk);
    gezici?.remove();kok.remove();
  }
  function gorunurluk(){oncekiAn=performance.now();sakla();}
  const dinlemeyiBirak=arkaPlanDinle(arkada=>{uygulamaArkada=arkada;gorunurluk();});
  document.addEventListener('visibilitychange',gorunurluk);
  function saatiKur(){
    window.clearInterval(saat);
    oncekiAn=performance.now();
    if(!p.ates)return;
    saat=window.setInterval(()=>{
      const simdi=performance.now();
      const gecen=simdi-oncekiAn;oncekiAn=simdi;
      if(document.hidden||uygulamaArkada||kapali||(n!==4&&n!==5)||kok.dataset.isiniyor==='true')return;
      p.ekSure+=gecen;
      const puan:Puan=p.ekSure>=YANIK_MS?1:p.ekSure>=KARAMEL_MS?2:3;
      const fark=p.puan!==puan;
      p.puan=puan;
      if(puan===1){p.ates=false;window.clearInterval(saat);}
      if(fark || simdi-sonKayit>=800){sakla();sonKayit=simdi;}
      if(fark){kalite?.(puan);ciz();}
      kok.style.setProperty('--tv-sicaklik',String(Math.min(1,p.ekSure/YANIK_MS)));
    },135);
  }
  function birakti(){
    kaynak?.classList.remove('tv-elde');
    kaynak=undefined;gezici?.remove();gezici=undefined;
  }
  function nesneliMasa(id:string){
    const el=h('span.tv-masa-nesne',{},cizim('masa','tv-arac'),cizim(id,'tv-arac-ucu'));
    return el;
  }
  function takip(yer:Nokta,ilk:Nokta,el:HTMLElement,id:string) {
    if(dolu||Math.hypot(yer.x-ilk.x,yer.y-ilk.y)<6)return;
    if(!gezici){
      gezici=nesneliMasa(id);
      gezici.classList.add('tv-surukle');
      gezici.style.width=sahne.clientWidth*.22+'px';
      document.body.append(gezici);kaynak=el;el.classList.add('tv-elde');
    }
    gezici.style.left=yer.x+'px';gezici.style.top=yer.y+'px';
  }
  function ilerle(i:Taraf){
    if(n===0)p.ilk=i;
    if(n===2)p.ikinci=i;
    if(n===4){p.son=i;p.tabağa=p.puan;}
    n++;elde=undefined;sakla();kaydet(n);
  }
  function pisir(guncel:number) {
    kok.dataset.isiniyor='true';
    if(n===guncel && n<6)ses(kizartmaSesi);
    isinma=window.setTimeout(()=>{
      if(kapali||n!==guncel)return;
      kok.dataset.isiniyor='false'; ciz();
    },zaman(1500));
  }
  const kosul=(i:Taraf):boolean=>n<2 ? n===0||i!==p.ilk : n<4 ? n===2||i!==p.ikinci : n===4||i!==p.son;
  const tavaIci=(i:Taraf)=>n===0?false:n===1?i===p.ilk:n<5?true:n===5?i!==p.son:false;
  const servisEdildi=(i:Taraf)=>n===6||n===5&&i===p.son;
  function gorunus(i:Taraf) {
    const sonuc=p.puan===1?'yanik':p.puan===2?'fazla':'pisti';
    if(servisEdildi(i))return i===p.son&&p.tabağa?({1:'yanik',2:'fazla',3:'pisti'}[p.tabağa]):sonuc;
    if(n<2) return 'fileto';
    if(n<4) return n===3 && i===p.ikinci?'cevrildi':'isindi';
    return kok.dataset.isiniyor==='true'?'cevrildi':sonuc;
  }
  function al(i:Taraf,el:HTMLElement) {
    if(dolu||!kosul(i))return;
    elde=i;kok.dataset.tutuyor='true';
    for(const b of sahne.querySelectorAll('.tv-fileto'))b.classList.toggle('tv-secili',b===el);
    const arac=sahne.querySelector('.tv-duran-masa');
    arac?.replaceChildren(nesneliMasa(gorunus(i)));
    ses(efekt.secim);
  }
  async function tamamla(i:Taraf,el:HTMLElement,hedef:HTMLElement) {
    if(kapali||dolu||!kosul(i)||kok.dataset.isiniyor==='true')return;
    dolu=true;el.classList.add('tv-elde');
    const cevir=n===2||n===3;
    if(n===5){p.ates=false;window.clearInterval(saat);sakla();}
    const bas=merkez(el);
    const h=kok.getBoundingClientRect();
    const son=n<2?tavada[i]:tabakta[i];
    const mesafe={x:h.x+h.width*son[0]/100-bas.x,y:h.y+h.height*son[1]/100-bas.y};
    const tas=nesneliMasa(gorunus(i));tas.classList.add('tv-surukle');
    Object.assign(tas.style,{left:bas.x+'px',top:bas.y+'px',width:h.width*.22+'px'});document.body.append(tas);
    if(cevir){
      const et=tas.querySelector<HTMLImageElement>('.tv-arac-ucu')!;
      await hareket(tas,[{translate:'0 0'},{translate:'0 -12px',rotate:'-5deg'}],180);
      et.src=adres('kenar');
      await hareket(tas,[{translate:'0 -12px',rotate:'-5deg'},{translate:'2px -16px',rotate:'4deg'}],155);
      et.src=adres('cevrildi');
      await hareket(tas,[{translate:'2px -16px',rotate:'4deg'},{translate:'0 0'}],170);
    } else {
      await hareket(tas,[{translate:'0 0'}, {translate:mesafe.x*.54+'px '+(mesafe.y*.54-10)+'px'}, {translate:mesafe.x+'px '+mesafe.y+'px'}],330);
    }
    tas.remove();
    if(kapali||!hedef.isConnected)return;
    ses(cevir||n<2?kizartmaSesi:efekt.yapis);
    ilerle(i);dolu=false;
    if(n===2||n===4){
      if(n===4){p.ates=true;sakla();saatiKur();}
      pisir(n);
    }
    if(n===6){
      const parcalar:TavukCifti=[p.puan,p.puan];parcalar[p.son]=p.tabağa??p.puan;
      oyunKaydi?.sun(parcalar);kalite?.(Math.floor((parcalar[0]+parcalar[1])/2) as Puan);
    }
    ciz();
  }
  function kizartmaSecenekleri(){
    const servis=dugme('Tavukları şimdi tabağa al','tv-sicak-sec tv-al',cizim('tabak'),cizim('pisti','tv-tabak-ikon'));
    const servisEt=async()=>{
      if(kapali||dolu||(n!==4&&n!==5))return;
      for(const i of [0,1] as const){
        if(!kosul(i))continue;
        const fileto=sahne.querySelector<HTMLButtonElement>('[data-fileto="'+i+'"]');
        const tabak=sahne.querySelector<HTMLButtonElement>('.tv-tabak');
        if(kapali||!fileto||!tabak)return;
        await tamamla(i,fileto,tabak);
      }
    };
    jest(servis,{birak:(_yer,_ilk,kisa)=>{if(kisa)void servisEt();},klavye:()=>void servisEt()});
    const dizi=h('div.tv-sicaklik-secimleri',{},servis);
    if(p.puan!==1){
      const fazla=dugme(p.ates?'Isıyı kapat':'Biraz daha kızart','tv-sicak-sec tv-kizart',cizim('fazla'),ikon(p.ates?'onay':'ileri'));
      fazla.setAttribute('aria-pressed',String(p.ates));
      const ates=()=>{if(dolu)return;p.ates=!p.ates;elde=undefined;sakla();saatiKur();if(p.ates)ses(kizartmaSesi);ciz();};
      jest(fazla,{birak:(_yer,_ilk,kisa)=>{if(kisa)ates();},klavye:ates});dizi.append(fazla);
    }
    if(p.puan<3){
      const yenile=dugme('Taze filetolarla yeniden başla','tv-sicak-sec tv-yenile',cizim('fileto'),ikon('tekrar'));
      const tekrar=()=>{if(dolu)return;window.clearInterval(saat);Object.assign(p,ilkPoz());delete p.tabağa;elde=undefined;n=0;sonReplik=-1;
        kok.dataset.isiniyor='false';sakla();kaydet(0);kalite?.(3);ciz();};
      jest(yenile,{birak:(_yer,_ilk,kisa)=>{if(kisa)tekrar();},klavye:tekrar});dizi.append(yenile);
    }
    if(p.ates||p.ekSure>0){
      const sicak=h('div.tv-isi-gostergesi',{'role':'meter','aria-label':'Ek kızarma'});
      for(const id of ['pisti','fazla','yanik'])sicak.append(cizim(id));
      sicak.append(h('i.tv-isi-ibresi'));dizi.append(sicak);
    }
    sahne.append(dizi);
  }
  function ciz(){
    if(kapali)return;
    const bekle=kok.dataset.isiniyor==='true',cevir=n>=2&&n<4;
    kok.dataset.adet=String(n);kok.dataset.tutuyor=String(elde!==undefined);kok.dataset.puan=String(p.puan);
    kok.style.setProperty('--tv-sicaklik',String(Math.min(1,p.ekSure/YANIK_MS)));
    sahne.replaceChildren();
    const tava=dugme('Filetoyu tavaya koy','tv-tava',cizim('tava'));
    const tabak=dugme('Filetoyu tabağa al','tv-tabak',cizim(n<4?'kesme':'tabak'));
    tava.disabled=n>=2;tabak.disabled=n<4||n===6;
    sahne.append(tava,tabak);
    const alet=h('span.tv-duran-masa',{},elde===undefined?cizim('masa'):nesneliMasa(gorunus(elde)));
    sahne.append(alet);
    function hedefe(hedef:HTMLButtonElement){
      if(elde===undefined){void hareket(alet,[{rotate:'0deg'},{rotate:'-8deg'},{rotate:'0deg'}],270);return;}
      const el=sahne.querySelector<HTMLButtonElement>('[data-fileto="'+elde+'"]');
      if(el)void tamamla(elde,el,hedef);
    }
    for(const hedef of [tava,tabak])jest(hedef,{birak:(yer,_ilk,kisa)=>{if(kisa&&icinde(hedef,yer))hedefe(hedef);},klavye:()=>hedefe(hedef)});
    for(const i of [0,1] as const) {
      const konum=tavaIci(i)?tavada[i]:tabakta[i];
      const kullan=n<6&&!bekle&&kosul(i);
      const ad=cevir?'Filetoyu çevir':n<2?'Çiğ filetoyu al':'Pişmiş filetoyu al';
      const el=dugme(ad+' '+(i+1),'tv-fileto',cizim(gorunus(i)));
      el.dataset.fileto=String(i);el.disabled=!kullan;el.classList.toggle('tv-secili',elde===i);
      if(cevir&&kullan)el.append(h('i.tv-cevir',{},ikon('karistir')));
      yerlestir(el,konum);sahne.append(el);
      if(!kullan)continue;
      const hedef=n<2?tava:tabak;
      const dokun=()=>cevir?void tamamla(i,el,tava):al(i,el);
      jest(el,{tasi:(yer,ilk)=>takip(yer,ilk,el,gorunus(i)),iptal:birakti,
        birak:(yer,ilk,kisa)=>{
          birakti();
          if(kisa)dokun();
          else if(cevir) {
            if(Math.abs(yer.y-ilk.y)>el.clientHeight*.28||Math.abs(yer.x-ilk.x)>el.clientWidth*.38)void tamamla(i,el,tava);
          } else if(icinde(hedef,yer,16))void tamamla(i,el,hedef);
        },klavye:dokun});
    }
    if(bekle){
      const buhar=cizim('buhar','tv-buhar');sahne.append(buhar);
    } else if(n<6)anlat(n<2?0:n<4?1:2);
    if((n===4||n===5)&&!bekle)kizartmaSecenekleri();
    if(n===6&&!bitirildi){
      bitirildi=true;
      isinma=window.setTimeout(()=>{if(!kapali)bitti();},zaman(550));
    }
  }
  if(n===2||n===4)pisir(n);
  if(p.ates)saatiKur();
  ciz();
  return temizle;
}
