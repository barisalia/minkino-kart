import type {Sabah} from './model';
import type {Yer} from './kres';
import {tamamla} from './kres-kaydi';
import {efekt} from '../../src/audio/efekt';

const gunler=[
  [{meyve:0,adet:2},{meyve:2,adet:3}],
  [{meyve:1,adet:3},{meyve:0,adet:1}],
  [{meyve:4,adet:2},{meyve:1,adet:4}],
] as const;
const isim=['Armut','Elma','Çilek','Erik','Portakal'];
const arkadaslar=['mino','zipzip'];
const adlar=['Mino','Zıpzıp'];
export type Bolge=(id:string,ad:string,res:string,yer:Yer,eylem?:()=>void,stil?:string,dik?:Yer)=>HTMLElement;
export type Tasima=(id:string,ad:string,res:string,yer:Yer,dik:Yer,hedef:string[],birak:(id:string)=>void)=>void;
export type KosedekiIsler={gir:(yer:Sabah['sahne'])=>void;soyle:(ses:string)=>void;kaydet:()=>void};
type Sofra={s:Sabah;bolge:Bolge;tasinabilir:Tasima;secili:()=>string|undefined;aktar:(id:string)=>void;res:(id:string)=>string;
  is:KosedekiIsler;yenile:()=>void;ileri:(id:string,ad:string,yap:()=>void)=>void};

export function sofraAc({s,bolge,tasinabilir,secili,aktar,res,is,yenile,ileri}:Sofra){
  const k=s.kres,gun=(k.gun-1)%gunler.length,siparis=gunler[gun];
  const meyve=(n:number)=>res('etkinlik/meyve-'+n);
  function kontrol(i:number){
    if(k.servis[i]){is.soyle(i?'zip_sofra_tesekkur':'mino_sofra_tesekkur');return}
    const {adet,meyve}=siparis[i],tabak=k.tabaklar[i];
    if(tabak.some(n=>n!==meyve)){is.soyle('kres_sofra_farkli');return}
    if(tabak.length!==adet){is.soyle(tabak.length>adet?'kres_sofra_fazla':'kres_sofra_eksik');return}
    k.servis[i]=true;s.pay[i]=adet;efekt.yapis();
    is.soyle(i?'zip_sofra_tesekkur':'mino_sofra_tesekkur');
    if(k.servis.every(Boolean))tamamla(k,'paylas');yenile();
  }
  siparis.forEach(({meyve:n,adet},i)=>{
    const x=i?75:26,kim=arkadaslar[i],tabak=k.tabaklar[i];
    const dinle=()=>is.soyle((i?'zip':'mino')+'_servis_'+gun);
    const tel=bolge('istek-'+kim,adlar[i]+' siparişini söylüyor',
      '<span class="okul-balon">'+Array.from({length:adet},()=>'<i>'+meyve(n)+'</i>').join('')+'</span>',
      [x+(i?-11:11),18,6+adet*4,14],dinle,'kres-istek',[x,21,17+adet*4,8]);
    tel.classList.toggle('teslim',k.servis[i]);
    bolge('arkadas-'+kim,adlar[i]+' ile konuş',res('etkinlik/'+kim+'-'+Number(k.servis[i])),
      [x,46,24,34],()=>tabak.length?kontrol(i):dinle(),'kres-sofrada',[x,49,37,25]);
    const id='tabak-'+kim;
    bolge(id,adlar[i]+' için tabağı hazırla',res('etkinlik/sergi-tabak'),[x,69,25,17],()=>{
      if(secili()?.startsWith('sepet-'))aktar(id);else kontrol(i)
    },'kres-tabak',[x,68,43,14]);
    [...tabak.keys()].sort((a,b)=>Number(a===0)-Number(b===0)).forEach(j=>{
      const meyveId=tabak[j];
      const yerler=[[0,0],[-5,1],[5,1],[-2,-5],[3,-5]];
      const [dx,dy]=yerler[j];
      const toplu=tabak.length===1?0:dx;
      bolge('lokma-'+i+'-'+j,isim[meyveId]+' geri al',meyve(meyveId),[x+toplu,67+dy,5.5,8.5],()=>{
        if(k.servis[i]){kontrol(i);return}
        if(secili()?.startsWith('sepet-')){aktar(id);return}
        tabak.splice(j,1);efekt.dokunma();yenile();if(tabak.length)is.soyle('say_'+tabak.length)
      },'kres-tabak-meyvesi',[x+toplu*1.55,67+dy*.85,8,6]);
    });
  });
  // Çocuk saymayı kendi bitirir. Arkadaşına dokununca tabak birlikte kontrol edilir.
  const meyveler=[...new Set([...siparis.map(x=>x.meyve),(gun+3)%5])];
  meyveler.forEach((n,j)=>{
    const x=32+j*18;
    const acik=arkadaslar.map((kim,i)=>k.servis[i]?'':'tabak-'+kim).filter(Boolean);
    const kase='<span class="kres-servis-sepet">'+[0,1,2].map(()=>meyve(n)).join('')+
      '<svg viewBox="0 0 110 38"><path d="M5 8h100L95 30q-1 4-7 4H22q-6 0-8-5Z" fill="#f1bf70" stroke="#211b19" stroke-width="2.4"/></svg></span>';
    if(!acik.length){bolge('bos-sepet-'+n,'',kase,[x,80,15,15],undefined,'',[20+j*30,83,25,12]);return}
    tasinabilir('sepet-'+n,isim[n]+' al, arkadaşının tabağına koy',kase,[x,80,15,15],[20+j*30,83,25,12],acik,id=>{
      const i=id==='tabak-mino'?0:1;
      if(k.tabaklar[i].length>=5){is.soyle('kres_sofra_fazla');return}
      k.tabaklar[i].push(n);efekt.nota(k.tabaklar[i].length);yenile();is.soyle('say_'+k.tabaklar[i].length);
    });
  });
  if(k.servis.every(Boolean))ileri('sinifa','Sınıfa dön',()=>is.gir('anasinifi'));
}
