import {sutlacHazirlamaPuani,type SutlacTaslagi,type SutlacDeseni,type SutlacPorsiyonu} from './sutlac-tarifi';
import {sutlacTezgahi} from './sutlac-tezgahi';
import {tatliSiparisPuani} from './tatli-siparisi';
import {dondurmaTatSec,dondurmaKepcele,kepceIziniOku,type KepceIzi} from './dondurma-kepcesi';
import {kekFisRozeti,kekOrnegi,kekPorsiyonunuOku,kekSusle,minikKek,type KekFisi,type KekPorsiyonu} from './minik-kek';
import {kalipBas,kurabiyeSusle,kurabiyeDizisi,kremaFisi,kurabiyeOrnegi,kurabiyeTepsisiniOku,type KurabiyeTepsisi} from './kurabiye-tepsisi';
import {tartIstegi,tartDiziliminiOku,tartIsteginiOku,tartFisRozeti,type TartIstegi,type TartDilimi} from './tart-tarifi';
import {kekHamurunuDok,kekKalibi,kremaIziniOku,tartKremasiniYay,type KremaNoktasi} from './pastane-krema';
import { h } from '../../src/ui/dom';
import { dugme, ikon } from './gorsel';
import {izIsle,pisir} from './tatli-hareket';
import {tartSusle,tartKenariniYap} from './tatli-tart';
import {tatliRehberDugmesi} from './tatli-rehber';
import {susBul} from './susleme-katalog';
import {tatliSunumTezgahi,susIstegiRozeti} from './tatli-sunumu';
import {tatliResmi} from './tatli-gorsel';
import {kurabiyeSekliniOku,kalipAdi,type KurabiyeSekli,tabakRengi,dondurmaTadiniOku,type DondurmaTadi,type TabakRengi,type TatliCesidi} from './tatli-ekonomi';
import './tatli-atolyesi.css';

export type TatliId = TatliCesidi;
export interface TatliTaslagi {firinSuresi?:number;sutlac?:SutlacTaslagi;kepceIzi?:KepceIzi[];tartKenarIzi?:number;kepceOrani?:number;kek?:KekPorsiyonu;kurabiye?:KurabiyeTepsisi;tartDilimleri?:TartDilimi[];sekil?:KurabiyeSekli;kekDolumu?:number;tartKremaIzi?:KremaNoktasi[];adim:number;yanlis:number;yanlisSecimler?:string[];surum?:2;tabak?:TabakRengi;tartYerleri?:number[];sus?:string;fazlaPisti?:boolean;tat?:DondurmaTadi}
export const tatliAdlari: Record<TatliId,string> = {
  sutlac:'Tarçınlı Sütlaç',kurabiye:'Kalıplı Kurabiye', dondurma:'Çilekli Dondurma', 'minik-kek':'Minik Kek', 'meyveli-tart':'Meyveli Tart',
};
const resimler=import.meta.glob<string>([
  '../../assets/sef/kurabiye/*.webp','../../assets/sef/tatli/*.webp','../../assets/sef/firin/{merdane,hamur,hamur-acik,firin,tepsi}.webp',
  '../../assets/sef/krep/{cilek,armut,kiraz,cirpici,karisim-kasesi,karisim-once,karisim-son}.webp','../../assets/sef/nesneler/kasik.webp',
  '../../assets/kino-otobus/{kepce,kulah,kap-cilek,kap-vanilya,kap-cikolata,top-cilek,top-cikolata,top-vanilya}.webp',
  '../../assets/pasta/{kalip-yildiz-1,kalip-kalp-1,kalip-yuvarlak-1,cupcake-kalip}.webp',
],{eager:true,query:'?url',import:'default'});
function resim(yol:string,sinif=''){
  return h('img',{src:resimler['../../assets/'+yol+'.webp'],class:sinif,alt:'',draggable:false});
}
export function tatliHazirla(id:TatliId,bitir:(puan:1|2|3,renk:TabakRengi,fazlaPisti?:boolean,sus?:string,tat?:DondurmaTadi,sekil?:KurabiyeSekli,tart?:TartDilimi[],kurabiye?:KurabiyeTepsisi,kek?:KekPorsiyonu,hazirlamaPuani?:1|2|3,sutlac?:SutlacPorsiyonu)=>void,geri:()=>void,
  opts:{sutlacIstegi?:SutlacDeseni;taslak?:TatliTaslagi;kaydet?:(taslak:TatliTaslagi)=>void;vitrin?:boolean;susIstegi?:string;istenenTat?:DondurmaTadi;kekIstegi?:KekFisi;istenenSekil?:KurabiyeSekli;tartIstegi?:TartIstegi;sesli?:()=>boolean}={}):HTMLElement {
  if(id==='sutlac'){
    return sutlacTezgahi({taslak:opts.taslak?.sutlac,istek:opts.vitrin?undefined:opts.sutlacIstegi??'yildiz',sesli:opts.sesli??(()=>false),geri,
      kaydet:sutlac=>opts.kaydet?.({surum:2,adim:sutlac.adim,yanlis:0,sutlac}),
      teslim:sutlac=>{
        const temel=sutlacHazirlamaPuani(sutlac);
        const puan=opts.vitrin?temel:tatliSiparisPuani(id,{puan:temel,sutlac},{sutlacIstegi:opts.sutlacIstegi});
        bitir(puan,'beyaz',false,undefined,undefined,undefined,undefined,undefined,undefined,temel,sutlac);
      }});
  }
  const sahne=h('section.tatli-tezgahi',{'aria-label':tatliAdlari[id],'data-tatli':id});
  const asamalar=id==='dondurma'?3:5;
  const tamSayi=(n:number|undefined,max:number)=>Number.isSafeInteger(n)?Math.min(max,Math.max(0,n!)):0;
  // Match completed steps from saves made before stamping and baking were introduced.
  const eskiSira=id==='kurabiye'?[0,1,4,5]:id==='minik-kek'?[0,2,3,4,5]:[0,1,2,3];
  let adim=opts.taslak?.surum===2?tamSayi(opts.taslak.adim,asamalar):eskiSira[tamSayi(opts.taslak?.adim,eskiSira.length-1)];
  let yanlis=tamSayi(opts.taslak?.yanlis,2),tamam=false;
  let fazlaPisti=opts.taslak?.fazlaPisti===true&&id!=='dondurma';
  let firinSuresi=opts.taslak?.firinSuresi===undefined?undefined:tamSayi(opts.taslak.firinSuresi,9000);
  let firiniDuraklat:(()=>void)|undefined;
  let sus=susBul(opts.taslak?.sus)?.id;
  let renk:TabakRengi=tabakRengi(opts.taslak?.tabak);
  let sekil=kurabiyeSekliniOku(opts.taslak?.sekil);
  const istenenSekil=kurabiyeSekliniOku(opts.istenenSekil);
  const kurabiye=adim===5&&!opts.taslak?.kurabiye?kurabiyeOrnegi(istenenSekil):kurabiyeTepsisiniOku(opts.taslak?.kurabiye,adim>=3?3:0);
  let tat=dondurmaTadiniOku(opts.taslak?.tat);
  const kekIstegi=opts.kekIstegi??'cilek';
  const kek=opts.taslak?.kek?kekPorsiyonunuOku(opts.taslak.kek):adim>=4?kekOrnegi(kekIstegi):kekPorsiyonunuOku();
  if(!opts.taslak?.kek&&adim===4)kek.meyveler.fill(null);
  let kepceIzi=kepceIziniOku(opts.taslak?.kepceIzi);
  let kepceOrani=Math.max(0,Math.min(1,Number(opts.taslak?.kepceOrani)||0));
  const eskiYerler=Array.isArray(opts.taslak?.tartYerleri)?[...new Set(opts.taslak.tartYerleri.filter(i=>Number.isInteger(i)&&i>=0&&i<5))]:[];
  // Older versions plated automatically once all five numbered slots were filled.
  if(id==='meyveli-tart'&&adim===4&&eskiYerler.length===5&&!opts.taslak?.tartDilimleri)adim=5;
  let tartDilimleri=tartDiziliminiOku(opts.taslak?.tartDilimleri)??(eskiYerler.length?eskiYerler.map(i=>tartIstegi()[i]):adim===5?tartIstegi():[]);
  const tartFisi=tartIsteginiOku(opts.tartIstegi);
  let kekDolumu=Number.isFinite(opts.taslak?.kekDolumu)?Math.max(0,Math.min(1,opts.taslak!.kekDolumu!)):0;
  let tartKenarIzi=tamSayi(opts.taslak?.tartKenarIzi,31);
  let tartKremaIzi=kremaIziniOku(opts.taslak?.tartKremaIzi);
  const kaydet=()=>opts.kaydet?.({surum:2,adim,yanlis,...(firinSuresi!==undefined?{firinSuresi}:{}),...(id==='kurabiye'?{sekil,kurabiye}:{}),tabak:renk,sus,...(id==='dondurma'?{tat,kepceOrani,kepceIzi}:{}),...(fazlaPisti?{fazlaPisti}:{}),...(id==='meyveli-tart'?{tartDilimleri,tartKremaIzi,tartKenarIzi}: {}),...(id==='minik-kek'?{kekDolumu,kek}:{})});
  const geriTus=dugme(opts.vitrin?'Pastaneye dön':'Tepsiye dön','ta-geri',ikon('geri'));
  geriTus.onclick=()=>{firiniDuraklat?.();geri();};
  const fis=h('div.ta-fis',{'aria-label':tatliAdlari[id]},tatliResmi(id,opts.istenenTat,opts.vitrin?sekil:istenenSekil));
  if(id==='minik-kek')fis.replaceChildren(...(opts.vitrin?[minikKek(kek)]:[minikKek(kekOrnegi(kekIstegi)),kekFisRozeti(kekIstegi)]));
  if(id==='kurabiye'&&!opts.vitrin)fis.replaceChildren(kurabiyeDizisi(istenenSekil,kurabiyeOrnegi(istenenSekil)),kremaFisi(istenenSekil));
  const ilerleme=h('div.ta-iz',{'aria-hidden':true});
  const calisma=h('div.ta-calisma');
  const araclar=h('div.ta-araclar');
  const duyuru=h('span.ta-duyuru',{'aria-live':'polite'});
  sahne.append(geriTus,tatliRehberDugmesi(id,()=>adim,opts.sesli??(()=>false),opts.vitrin||!!opts.istenenTat&&opts.istenenTat!=='cilek',()=>opts.vitrin||istenenSekil!=='yildiz'||sekil!=='yildiz'),fis,ilerleme,calisma,araclar,duyuru);
  function sonraki(){adim++;kaydet();ciz();}
  function firinaVer(once:HTMLElement,sonra:HTMLElement){
    const firin=pisir(once,sonra,resim,fazla=>{
      firinSuresi=undefined;firiniDuraklat=undefined;fazlaPisti=fazla;
      if(fazla)yanlis=Math.min(2,yanlis+1);
      adim++;kaydet();
      return ciz;
    },id==='kurabiye'||id==='meyveli-tart'?'sef/kurabiye/firin-tepsisi':undefined,
    firinSuresi,sure=>{firinSuresi=sure;kaydet();});
    calisma.append(firin.alan);firiniDuraklat=firin.duraklat;
  }
  function ciz(){
    fis.querySelector('.sus-istek-rozeti')?.remove();
    calisma.replaceChildren();araclar.replaceChildren();fis.querySelector('.ta-istek')?.remove();
    sahne.dataset.adim=String(adim);
    if(id==='meyveli-tart')sahne.dataset.fazlaPisti=String(fazlaPisti);
    if(id==='dondurma'&&opts.vitrin)fis.replaceChildren(tatliResmi(id,adim?tat:'cilek'));
    ilerleme.replaceChildren(...Array.from({length:asamalar},(_,i)=>h('i',{'data-dolu':String(i<=adim)})));
    if(id==='meyveli-tart'&&!opts.vitrin)fis.replaceChildren(tartFisRozeti(tartFisi));
    if(id==='minik-kek'&&opts.vitrin)fis.replaceChildren(minikKek(kek));
    if(adim===asamalar){
      const {sunum,secimler}=tatliSunumTezgahi(id,renk,r=>{renk=r;kaydet();},sus,s=>{sus=s;kaydet();gosterIstek();},opts.susIstegi,tat,sekil,id==='meyveli-tart'?tartDilimleri:undefined,id==='kurabiye'?kurabiye:undefined,id==='minik-kek'?kek:undefined,fazlaPisti);
      function gosterIstek(){
        fis.querySelector('.sus-istek-rozeti')?.remove();
        const rozet=opts.susIstegi&&susIstegiRozeti(opts.susIstegi,sus===opts.susIstegi);
        if(rozet)fis.append(rozet);
      }
      gosterIstek();
      if(secimler)araclar.append(secimler);
      calisma.append(sunum);
      const ver=dugme(opts.vitrin?'Vitrine koy':'Tatlıyı tepsiye koy','ta-sun',ikon('onay'));
      ver.onclick=()=>{
        if(tamam)return;
        tamam=true;ver.disabled=true;
        const temelPuan=Math.max(1,3-yanlis) as 1|2|3;
        const puan=opts.vitrin?temelPuan:tatliSiparisPuani(id,
          {puan:temelPuan,tat,sekil,kurabiye,kek,tart:tartDilimleri},
          {dondurmaIstegi:opts.istenenTat,kurabiyeIstegi:istenenSekil,kekFisi:kekIstegi,tartIstegi:tartFisi});
        bitir(puan,renk,fazlaPisti,sus,
          id==='dondurma'?tat:undefined,id==='kurabiye'?sekil:undefined,id==='meyveli-tart'?tartDilimleri:undefined,id==='kurabiye'?kurabiye:undefined,id==='minik-kek'?kek:undefined,temelPuan);
      };
      araclar.append(ver);duyuru.textContent='Tatlı hazır.';return;
    }
    if(id==='kurabiye'){
      if(adim===0)calisma.append(izIsle('merdane',resim('sef/firin/hamur'),resim('sef/kurabiye/hamur'),resim,sonraki));
      if(adim===1){
        calisma.append(resim('sef/kurabiye/hamur'));
        if(!opts.vitrin)fis.append(h('span.ta-istek',{},resim('pasta/kalip-'+istenenSekil+'-1')));
        for(const tip of ['kalp','yildiz','yuvarlak'] as const){
          const kalip=dugme(kalipAdi[tip]+' kalıp','ta-sec',resim('pasta/kalip-'+tip+'-1'));
          kalip.onclick=()=>{sekil=tip;sonraki();};araclar.append(kalip);
        }
      }
      if(opts.vitrin&&adim>1)fis.firstElementChild?.replaceWith(kurabiyeDizisi(sekil,kurabiye));
      sahne.dataset.sekil=sekil;
      if(adim===2)calisma.append(kalipBas(sekil,kurabiye,kaydet,sonraki));
      if(adim===3)firinaVer(kurabiyeDizisi(sekil,kurabiye,true),kurabiyeDizisi(sekil,kurabiye));
      if(adim===4)kurabiyeSusle(calisma,araclar,sekil,kurabiye,kaydet,sonraki);
    }else if(id==='dondurma'){
      if(adim===0)calisma.append(dondurmaTatSec(secim=>{
        tat=secim;kepceOrani=0;kepceIzi=[];sonraki();
      }));
      else calisma.append(dondurmaKepcele(tat,adim===2,kepceOrani,kepceIzi,
        (oran,iz)=>{kepceOrani=oran;kepceIzi=iz;kaydet();},
        ()=>{adim=2;kepceOrani=1;kaydet();sahne.dataset.adim='2';ilerleme.children[2]?.setAttribute('data-dolu','true');},
        sonraki,
        ()=>{adim=0;kepceOrani=0;kepceIzi=[];kaydet();ciz();}
      ));
    }else if(id==='meyveli-tart'){
      if(adim===0)calisma.append(izIsle('merdane',resim('sef/firin/hamur'),resim('sef/firin/hamur-acik'),resim,sonraki));
      if(adim===1)calisma.append(tartKenariniYap(resim,tartKenarIzi,n=>{tartKenarIzi=n;kaydet();},sonraki));
      if(adim===2)firinaVer(resim('sef/tatli/tart-cig','ta-tart-cig'),resim('sef/tatli/tart-bos','ta-tart-pismis'));
      if(adim===3)calisma.append(tartKremasiniYay(resim,tartKremaIzi,iz=>{tartKremaIzi=iz;kaydet();},sonraki));
      if(adim===4)tartSusle(calisma,araclar,resim,[...tartDilimleri],tartFisi,yer=>{tartDilimleri=yer;kaydet();},sonraki,fazlaPisti);
    }else{
      if(adim===0)calisma.append(izIsle('cirp',resim('sef/krep/karisim-once'),resim('sef/krep/karisim-son'),resim,sonraki));
      if(adim===1)calisma.append(kekHamurunuDok(kekDolumu,n=>{kekDolumu=n;kaydet();},sonraki));
      if(adim===2)firinaVer(kekKalibi(),resim('sef/tatli/kek-sade'));
      if(adim===3||adim===4)kekSusle(calisma,araclar,kek,adim===3,kaydet,sonraki);
    }
  }
  ciz();return sahne;
}
