import type {Sabah} from './model';
import {tamamla,type CemberKisi} from './kres-kaydi';
import type {Yer} from './kres';
import type {Bolge,KosedekiIsler,Tasima} from './kres-servis';
import {firca,kayik,otomobil} from './kres-oyuncaklari';
import {oykuKapak} from './kres-oyku';
import {efekt} from '../../src/audio/efekt';

type Cember={
  s:Sabah;bolge:Bolge;tasinabilir:Tasima;secili:()=>string|undefined;aktar:(id:string)=>void;
  res:(id:string)=>string;is:KosedekiIsler;yenile:()=>void;
};
export const konusmaTasi='<svg viewBox="0 0 98 75" aria-hidden="true"><g stroke="#302a28" stroke-linejoin="round" stroke-linecap="round"><path d="M6 48Q5 37 16 27l16-13q9-8 25-7l17 5q13 4 18 20 5 17-8 25-12 9-29 11l-22-1Q9 64 6 48Z" fill="#68c9c8" stroke-width="2.6"/><g fill="none" stroke="#fff0a0" stroke-width="4"><path d="m51 18 0 4m18 2-4 4m9 10h-6m-3 15-4-5m-14 9v-6m-18-1 6-6m-9-8h7m2-14 5 5"/></g><circle cx="50" cy="37" r="10" fill="#ffe073" stroke-width="1.7"/></g></svg>';
const adlar={ceren:'Ceren Öğretmen',mino:'Mino',zipzip:'Zıpzıp',kino:'Kino'};
const yerler:Record<CemberKisi,[Yer,Yer]>={
  ceren:[[64,38,15,44],[68,32,28,30]],zipzip:[[27,62,17,34],[22,55,30,26]],
  mino:[[74,63,17,35],[78,55,30,27]],kino:[[48,73,19,36],[49,71,38,27]],
};
const tasYerleri:Record<CemberKisi,[Yer,Yer]>={
  ceren:[[64,40,5,7],[68,34,10,6]],zipzip:[[27,69,6,8],[22,62,12,6]],
  mino:[[74,70,6,8],[78,62,12,6]],kino:[[48,79,8,10],[48,77,16,8]],
};
export function cemberAc({s,bolge,tasinabilir,secili,aktar,res,is,yenile}:Cember){
  const k=s.kres,kim=k.konusanlar[k.konusanlar.length-1]??'ceren',tam=kim==='kino';
  const arkadasSozu=(kisi:CemberKisi)=>kisi==='ceren'?'kres_cember_ac':kisi==='kino'?'kino_cember_sec':
    kisi==='mino'?(k.gun%2?'mino_cember_boya':'mino_cember_oyku'):(k.gun%2?'zip_cember_su':'zip_cember_araba');
  const arkadasResmi=(kisi:CemberKisi)=>kisi==='mino'?(k.gun%2?firca:oykuKapak(res('kres/oyku-0'))):(k.gun%2?kayik(3):otomobil());
  function dinle(kisi:CemberKisi){
    if(kisi===kim){is.soyle(arkadasSozu(kisi));return}
    if(kisi==='kino'&&k.konusanlar.length<2){is.soyle('kres_cember_bekle');return}
    is.soyle('kres_cember_tas');
  }
  for(const kisi of ['ceren','zipzip','mino','kino'] as const){
    const ad=kisi==='kino'?'kino-'+(s.renk||'yesil'):kisi;
    const pozlar=kisi==='ceren'?res('ders/ceren-0'):Array.from({length:4},(_,i)=>res('kres/cember-'+ad+'-'+i)).join('');
    bolge('oturan-'+kisi,adlar[kisi],'<span class="kres-oturan">'+pozlar+'</span>',yerler[kisi][0],()=>{
      if(secili()==='soz-tasi')aktar('oturan-'+kisi);else dinle(kisi);
    },'kres-cember-kisi',yerler[kisi][1]);
  }
  if(kim==='mino'||kim==='zipzip'){
    const m=kim==='mino',yer:Yer=m?[82,38,11,15]:[19,38,11,15],dik:Yer=m?[82,36,21,11]:[18,36,21,11];
    bolge('dusunce',adlar[kim]+' bugün ne yapmak istiyor?','<span class="kres-dusunce">'+arkadasResmi(kim)+'</span>',yer,()=>is.soyle(arkadasSozu(kim)),'',dik);
  }
  if(tam){
    const isler=k.gun%2?['boyahane','su-masasi','oyku'] as const:['oyku','blok','boyahane'] as const;
    const gorsel={boyahane:firca,'su-masasi':kayik(3),blok:otomobil(undefined,false,k.arabaRengi),oyku:oykuKapak(res('kres/oyku-0'))};
    const hedefAd={boyahane:'Boya masasına git','su-masasi':'Su masasına git',blok:'Oyuncak araba yap',oyku:'Kitap köşesine git'};
    isler.forEach((n,i)=>bolge('git-'+n,hedefAd[n],'<span class="kres-kose-tepsisi">'+gorsel[n]+'</span>',[35+15*i,24,12,15],()=>{
      tamamla(k,'cember');efekt.yapis();is.gir(n);
    },'',[24+26*i,18,21,12]));
    return;
  }
  const hedefler:CemberKisi[]=k.konusanlar.length<2?(['mino','zipzip'] as const).filter(kisi=>!k.konusanlar.includes(kisi)):['kino'];
  tasinabilir('soz-tasi','Güneş taşını bir arkadaşına ver',konusmaTasi,...tasYerleri[kim],hedefler.map(kisi=>'oturan-'+kisi),id=>{
    const kisi=id.slice(7) as CemberKisi;
    if(!hedefler.includes(kisi))return;
    k.konusanlar.push(kisi as Exclude<CemberKisi,'ceren'>);efekt.yapis();yenile();is.soyle(arkadasSozu(kisi));
  });
}
