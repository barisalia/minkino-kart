import {misafirAdi,type SiparisMisafiri} from './restoran-karakterleri';
import {icinde,jest,type Nokta} from './hareket';
import {dekorResmi} from './dekor-magazasi';
import {bitisAdi,bitisIstegi,bitisResmi,bitisTadimi,corbaBitisiMi} from './corba-bitisi';
import {kavurmaRengi,servisYuzu} from './sis-pisme';
import makarnaSosReplik from './makarna-sos-replikleri.json';
import {menemenTezgahi} from './menemen-tezgahi';
import {menemenIstegi,menemenHatasi,menemenPuani,yeniMenemen} from './menemen-tarifi';
import {menemenSahani,menemenOrnegi,mnSebze} from './menemen-gorseli';
import {sutlacKasesi,sutlacIstegiRozeti} from './sutlac-gorseli';
import {sutlacOrnegi,yeniSutlac} from './sutlac-tarifi';
import sutlacReplikleri from './sutlac-replikleri.json';
import menemenMetni from './menemen-replikleri.json';
import {durumTezgahi} from './durum-tezgahi';
import {durumIstegi,durumPuani,durumYorumu,yeniDurum} from './durum-tarifi';
import {durumIc,durumOrnegi,durumTabagi} from './durum-gorseli';
import durumReplik from './durum-replikleri.json';
import {hazirlamaHatasi,siradakiTatliIstegi,tatliSiparisPuani} from './tatli-siparisi';

import {siraliServis} from './sirali-servis';
import {aileMasasi} from './aile-masasi';
import {salonSesiniCal,servisTepkisiniCal} from './misafir';
import {sikmaServisBardagi} from './tepsi-icecek';
import {lokmaliPorsiyon} from './lokmali-porsiyon';
import {minikKek,kekOrnegi,kekFisRozeti,kekFarki} from './minik-kek';
import {omletRehberiniDinle} from './omlet-ses';
import {omletOrnegi,omletIcResmi,omletGoruntusu} from './omlet-gorseli';
import {omletTezgahi} from './omlet-tezgahi';
import {omletIstegi,omletAdlari,omletKivami,omletKivamAdlari,omletPuani} from './omlet-tarifi';
import salonReplikleri from './salon-replikleri.json';
import {vitrindenSec} from './vitrin-secimi';
import {dondurmaAdlari} from './dondurma-kepcesi';
import {kremaEksigi,kremaFisi,kurabiyeDizisi,kurabiyeOrnegi} from './kurabiye-tepsisi';
import {tabakMalzemesi as varlik} from './tabak-malzemesi';
import {meyveliTartGorseli,tartFisRozeti,tartIstegi,tartIsteginiOku,tartEksigi} from './tart-tarifi';
import {arabaliServis,arabaIsareti} from './arabali-servis';
import tadimKararlari from './tadim-kararlari.json';
import {kumpirTezgahi} from './kumpir-tezgahi';
import {kumpirOrnegi,kumpirResmi} from './kumpir-gorseli';
import {kumpirFisleri,kumpirFisiniOku,kumpirPuani,kumpirAd,type KumpirMal,type KumpirFisi} from './kumpir-tarifi';
import {mantiTezgahi,mantiOrnegi,mantiResmi} from './manti-tezgahi';
import {lokmaninSosu,mantiPuan,mantiIstegi,mantiIsimleri,mantiKivami,mantiDuzeltme} from './manti-tarifi';
import mantiRehberi from './manti-replikleri.json';
import {citirSalata} from './tarif';
import {simitFirini} from './simit-firini';
import {kaplamaResmi,simitSunumu} from './simit-gorseli';
import {simitFisi,simitFisleri,simitPuani,simitRengi,kaplamaAdi} from './simit-tarifi';
import {salonPanosu,spesiyalIsareti} from './spesiyal';
import {sunulanTabak} from './sofra-fotografi';
import {tostTezgahi} from './tost-tezgahi';
import {ekmekYolu,tostMalzemeResmi,tostOrnegi,tostResmi} from './tost-gorseli';
import {tostKalitesi,tostFisi,tostFisleri,tostMalzemeAdi,tostKivamAdi} from './tost-tarifi';
import {piknigeHazirla,piknikIsareti} from './piknik';
import {kutlamaMasasi} from './kutlama';

import { h } from '../../src/ui/dom';
import { ikon, dugme, resim } from './gorsel';
import { misafirCumlesi,misafirKaydiVar,misafirResmi,restoranSiparisiniSoyle } from './misafir';
import {yanSalonuGoster,salonuKur as salonSahnesiniKur} from './restoran-salonu';
import {babaPizzaYorumu} from './baba-pizzasi';
import { lokmaSun,eldeTattir,tadimiGeriYukle } from './restoran-tadim';
import { aktifMenu,sonrakiMenu,siradakiSpesiyal,servisKazanci,menuAcik,menuTatlisi,sofrayiHatirla,sofraKopyasi,salondaOturan } from './tepsi-fisleri';
import {kalipAdi,tatliMi} from './tatli-ekonomi';
import {tatliResmi} from './tatli-gorsel';
import {tatliHazirla} from './tatli-atolyesi';
import {suslemeler} from './susleme-katalog';
import {tatliSunumu,susIstegiRozeti} from './tatli-sunumu';
import {pastaneSesleri} from './pastane-ses';
import {ustalikServisi,gunOdulleriniAc} from './ustalik-kaydi';
import {dekoruKoy} from './restoran-ustaligi';
import {pulEkle,pulDefteriDugmesi} from './pul-defteri';
import {jetonSimge} from './tatli-dukkan';
import {GUNDEKI_MUSTERI,yeniGun} from './restoran-takvimi';

import {gunRozeti,gunSonuEkrani} from './restoran-gun-ekrani';
import { sus } from '../../src/audio/konusma';
import './restoran.css';
import type { ServisKaydi } from './kayit';
import { adlar, sisSebzeleri,sisFisleri,sisSoslari,mucverGarniturleri, type Yemek } from './yemekler';
import {krepIstekleri,krepDilimEslesmeleri,krepMeyveAdlari} from './krep-fisi';
import {sisIstegi,mucverIstegi,firinIzgaraTadimi} from './firin-izgara-fisi';
import { bosMasa, menuBul, yanMi, yanHazirlaniyor, yanTezgahiAc, yanTabagiKoy, icecekUyumu,meyveAdi,tadimSonucu,type Masa, type Meyve, type Parca, type Tepsiler } from './tepsi-fisleri';
import { sebzeFarki, kivamUyuyor, TARIFLER } from './tarif';
import { corbaKivamOrnegi,corbaKasesi } from './kap-ici';
import {dilimUyuyor,kesimHedefi} from './tarif';
import {dilimBoyAdi,dilimIstegi,dilimYorumu,salatalikOrnegi,sebzeReplik} from './sebze-tercihi';
import { fisCumlesi, fisOrnegi, pizzaMiktarFarki, yanlisYaridakiMalzemeler, ISIM, type Cesit } from './pizza-tabagi';
import sayili from './sayili-pizza-replikleri.json';
import krepSiparisleri from './krep-siparisleri.json';
import { pizzaDilimResmi } from './pizza-dilimleri';
import { pizzaTabakResmi,pizzaResmi } from './firin';
import { sosAdi } from './pizza-tabagi';
import { sosResmi,sosMu,sosIstegi,sosAd,yildizlar } from './salata-sosu';
import stüdyo from './atolye-replikler.json';
import replik from './replikler.json';
import { tavukIstasyonu,tavukResmi } from './tepsi-tavuk';
import { icecekIstasyonu,icecekBardagi } from './tepsi-icecek';
import {smoothieIstasyonu} from './smoothie/tezgah';
import {siparisBardagi,buzIsareti,kivamIsareti} from './smoothie/gorsel';
import {bosSmoothie,smoothiePuani,servisCizgisi,renkAdi,bardakUyuyor,icecekKivamiUyuyor,taneli} from './smoothie/tarif';
import './tepsi-masasi.css';
import './tepsi-tadim.css';
import { tabakGeldi, tabagiYerlestir } from './tepsi-hareket';
import { efekt } from '../../src/audio/efekt';
const fis=new URL('../../assets/sef/tepsi/fis.webp',import.meta.url).href;
let konusmaBekleniyor=false;
const tepsi=new URL('../../assets/sef/tepsi/tepsi.webp',import.meta.url).href;
const img=(url:string,sinif='')=>h('img',{src:url,alt:'',class:sinif,draggable:false});
const fisMinyaturleri=import.meta.glob<string>('../../assets/sef/fis-minyaturleri/*.webp',{eager:true,query:'?url',import:'default'});
function fisMinyaturu(id:string,asil:string){
  const kok='../../assets/sef/fis-minyaturleri/'+id+'-';
  const kucuk=fisMinyaturleri[kok+'64.webp'],orta=fisMinyaturleri[kok+'128.webp'];
  if(!kucuk||!orta)return img(asil,'tepsi-gida');
  return h('img.tepsi-gida',{alt:'',draggable:false,sizes:'clamp(42px, 8vw, 160px)',
    srcset:kucuk+' 64w, '+orta+' 128w, '+fisMinyaturleri[kok+'256.webp']+' 256w',src:orta});
}
const ad={...adlar,sutlac:'Tarçınlı Sütlaç',menemen:'Menemen',durum:'Rulo Dürüm',omlet:'Omlet',manti:'Mantı',kumpir:'Kumpir',simit:'Simit',tost:'Sıcak Tost',tavuk:'Tavada Tavuk',icecek:'Meyve suyu',kurabiye:'Yıldız Kurabiye',dondurma:'Çilekli Dondurma','minik-kek':'Çilekli Minik Kek','meyveli-tart':'Meyveli Tart'};
const icecekAd=(meyve:Meyve)=>meyveAdi[meyve]+' suyu';
const tadimRepligi: Record<Parca,string>={
  sutlac:sutlacReplikleri['sutlac-desen'],
  menemen:menemenMetni['menemen-eksik'],durum:durumReplik['durum-eksik'],omlet:'Omletin içini ve pişme rengini karşılaştıralım.',manti:'Mantının içi, sosu ve pişme süresine bakalım.',kumpir:'Kumpirinin içindekileri siparişle karşılaştıralım.',simit:'Simidin dışına ve kızarma rengine bakalım.',tost:'Tostun içindekilere ve kızarma rengine bakalım.',tavuk:'Tavuk biraz fazla kızarmış.',makarna:'Müşteri makarnasında başka bir sos istemişti.',
  salata:'Salata hazır. Müşteri başka bir sos istemişti.',sis:'Şişin malzemelerine ve sosuna bir daha bakalım.',
  pizza:'Pizzanın pişme derecesine bir daha bakalım.',krep:'Krebin iki yüzünün de rengini kontrol edelim.',
  mucver:'Müşteri mücverin yanında başka bir şey istemişti.',corba:'Müşteri çorbasında başka bir süs istemişti.',
  icecek:'Müşteri dolu bir bardak istemişti.',kurabiye:'Kurabiyenin şekline bir daha bakalım.',dondurma:'Dondurmanın tadına bir daha bakalım.','minik-kek':'Kekin süsüne bir daha bakalım.','meyveli-tart':'Tartın meyvelerine bir daha bakalım.'
};
function tabakYorumu(parca:Parca, puan:number, kayit:ServisKaydi|true|undefined):string {
  if(puan===0)return 'Fişteki bir yemek tepside eksik.';
  if(puan===3)return 'Bu tabak üç puan getirdi.';
  if(parca==='tavuk'&&puan===1)return 'Tavuk yanmış. Bir dahaki sefere kızarınca tabağa al.';
  if(kayit&&kayit!==true){
    if(kayit.tarifId==='mucver'&&kayit.tercih?.tarifId==='mucver'&&(kayit.pisirmePuani??3)<3){
      const { kizarma, sikma = 100, tur } = kayit.tercih;
      if (kizarma === 1 && tur % 2 === 1 && sikma < 55) return firinIzgaraTadimi['mucver-sulu-tadim'];
      return firinIzgaraTadimi[kizarma === 2 ? 'mucver-koyu-tadim' : 'mucver-renk-tadim'];
    }
    if(kayit.tarifId==='sis'&&kayit.tercih?.tarifId==='sis'){
      const secim=kayit.tercih;
      if(secim.yuzler&&(kayit.pisirmePuani??3)<(kayit.istekPuani??3)){
        const sonuc=servisYuzu(secim.yuzler);
        if(sonuc!=='tam')return firinIzgaraTadimi['sis-pisme-'+sonuc as 'sis-pisme-az'|'sis-pisme-kavruk'|'sis-pisme-yanik'];
      }
      return firinIzgaraTadimi[secim.sos!==sisSoslari[secim.tur]?'sis-sos-tadim':'sis-sira-tadim'];
    }
    if(kayit.tarifId==='krep'&&(kayit.istekPuani??3)<(kayit.pisirmePuani??3))return krepSiparisleri['krep-meyve-tadim'];
    if(kayit.tarifId==='makarna'&&(kayit.pisirmePuani??3)<3)return 'Makarnanın kıvamına bir daha bakalım.';
    if(kayit.tarifId==='salata'||kayit.tarifId==='corba'){
      const hazirlik=kayit[kayit.tarifId];
      if(hazirlik&&sebzeFarki(hazirlik).eksik.length)return 'Fişteki sebzelerden biri tabağımda yok. İkisine birlikte bakalım.';
      if(hazirlik?.istenenKivam&&!kivamUyuyor(hazirlik))return hazirlik.istenenKivam==='patates'?sebzeReplik['corba-patates-tadim']:stüdyo[hazirlik.istenenKivam==='taneli'?'corba-taneli-tadim':'corba-puruzsuz-tadim'];
      if(kayit.tarifId==='corba'&&corbaBitisiMi(kayit.istenenSus)&&kayit.istenenSus!==kayit.sus.id)return bitisTadimi(kayit.istenenSus);
      if(hazirlik?.salatalikBoyu&&!dilimUyuyor(hazirlik))return dilimYorumu(hazirlik.salatalikBoyu);
    }
  }
  if(kayit&&kayit!==true&&kayit.tarifId==='pizza'&&kayit.kivam){
    if(kayit.fis&&(kayit.istekPuani??3)<=(kayit.pisirme??3)){
      if(kayit.fis.sos&&kayit.fis.sos!==(kayit.sosCesidi??'domates'))return 'Sosunun rengine bak! Ben başka bir sos istemiştim.';
      if(pizzaMiktarFarki(kayit.ust,kayit.fis).length)return sayili['pizza-sayili-tadim'];
      if(yanlisYaridakiMalzemeler(kayit.ust,kayit.fis).length)return stüdyo['pizza-paylas-tadim'];
    }
    if((kayit.istekPuani??3)<(kayit.pisirme??3))return 'Müşteri pizzasında başka malzemeler istemişti.';
    return {erken:'Pizza biraz erken çıkmış.',fazla:'Pizza fazla kızarmış.',yanik:'Pizzanın kenarları yanmış.',tam:'Müşteri pizzasında başka malzemeler istemişti.'}[kayit.kivam];
  }
  return tadimRepligi[parca];
}
function btn(ad:string,sinif:string,fn:()=>void,...cocuklar:Node[]){
  const b=dugme(ad,sinif,...cocuklar);b.addEventListener('click',fn);return b;
}
export function fisDugmesi(ac:()=>void){
  return btn('Müşteri masası','musteri-giris fis-arsivi',ac,img(fis));
}
export function restoranAc(t:Tepsiler,sonraki:boolean,temizle:(id:string)=>void,ilkSiparis?:string){
  const sira=(t.restoran?.sira??0)+(sonraki?1:0);
  const aday=(!t.restoran||sonraki)&&ilkSiparis?menuBul(ilkSiparis):undefined;
  const secim=aday&&!salondaOturan(t,aday.misafir)?aday:undefined;
  const m=secim&&menuAcik(secim,t.tatliSeviye)?secim:sonraki?sonrakiMenu(t):aktifMenu(t);
  if(!t.restoran||sonraki){
    const asili=!secim&&sonraki&&siradakiSpesiyal(t)?.id===m.id&&t.spesiyal;
    const oncekiMasa=t.masalar[m.id];
    const oncekiKumpir=oncekiMasa?.kumpirFisi;
    if(t.masalar[m.id]?.sunuldu){temizle(m.id);t.masalar[m.id]=bosMasa();}
    if(m.id==='misirli-kumpir'){
      const masa=t.masalar[m.id]??=bosMasa();
      if(!masa.kumpirFisi){
        const fisler=Object.keys(kumpirFisleri) as KumpirFisi[];
        const once=fisler.indexOf(oncekiKumpir??'misirli-kumpir');
        masa.kumpirFisi=t.rekorlar[m.id]?fisler[(once+1)%fisler.length]:'misirli-kumpir';
      }
    }
    if(m.tatliFisi)sofraTatliFisiniKur(m,t.masalar[m.id]??=bosMasa());
    if(tatliMi(m.id)&&(!oncekiMasa||oncekiMasa.sunuldu)){
      const istek=siradakiTatliIstegi(m.id,oncekiMasa,t.pastane.vitrin[m.id]??[],!t.rekorlar[m.id]);
      Object.assign(t.masalar[m.id]??=bosMasa(),istek);
    }
    if(m.smoothie){
      const masa=t.masalar[m.id]??=bosMasa();
      // A half-made drink keeps its ticket. A returning guest remembers a glass
      // they gave full marks, including a deliberate choice of no ice.
      const favori=oncekiMasa?.sunuldu&&oncekiMasa.tabaklar.icecek&&oncekiMasa.icecekPuani===3?oncekiMasa.smoothieBuzIstegi:undefined;
      masa.smoothieBuzIstegi??=favori??(t.gun.no%2===0);
    }
    const tatli=menuTatlisi(m);
    if(tatli&&!m.tatliFisi&&(t.rekorlar[tatli]||t.rekorlar[m.id])){
      const secimler=suslemeler(tatli);
      const masa=t.masalar[m.id]??=bosMasa();
      if(secimler.length&&(!oncekiMasa||oncekiMasa.sunuldu))masa.susIstegi=secimler[(sira+t.gun.no-1)%secimler.length].id;
    }
    if(asili){
      t.spesiyalGunu=t.gun.no;
      const masa=t.masalar[m.id]??=bosMasa();
      for(const key of ['sutlacIstegi','dondurmaIstegi','kurabiyeIstegi','kekFisi','tartIstegi','susIstegi','kumpirFisi','smoothieBuzIstegi'] as const){
        if(asili.masa[key]!==undefined)Object.assign(masa,{[key]:asili.masa[key]});
        else delete masa[key];
      }
    }
    t.restoran={sira,menuId:m.id,...(asili?{spesiyal:true}:{}),sonYemek:tatli?t.restoran?.sonYemek:m.id,evre:'gelis'};
  }
  t.masalar[m.id]??=bosMasa();t.ekran='masa';t.secili=m.id;t.restoranda=true;delete t.oynanan;
}
export function restoranKapisi(t:Tepsiler,temizle:(id:string)=>void){
  delete t.yanMasadan;delete t.servisSalonu;
  restoranAc(t,false,temizle);
}
function sofraTatliFisiniKur(menu:NonNullable<ReturnType<typeof menuBul>>,masa:Masa){
  const fis=menu.tatliFisi;
  if(!fis)return;
  if(fis.kekFisi)masa.kekFisi??=fis.kekFisi;
  if(fis.tartIstegi)masa.tartIstegi??=fis.tartIstegi;
  if(fis.sutlacIstegi)masa.sutlacIstegi??=fis.sutlacIstegi;
}
export function siparisFisindenAc(t:Tepsiler,id:string,temizle:(id:string)=>void){
  const menu=menuBul(id);
  if(!menu||!menuAcik(menu,t.tatliSeviye))return false;
  if(t.restoran&&aktifMenu(t).id===id){
    restoranAc(t,false,temizle);return true;
  }
  t.secili=id;t.ekran='masa';delete t.oynanan;t.restoranda=false;
  if(t.masalar[id]?.sunuldu){temizle(id);t.masalar[id]=bosMasa();}
  else t.masalar[id]??=bosMasa();
  sofraTatliFisiniKur(menu,t.masalar[id]);
  return true;
}
interface Ayar {t:Tepsiler; atolye:()=>void;tezgahta:(p:Yemek,masa:string)=>boolean; yeniMasaTezgahi:(masa:string)=>void; yaz:()=>void; ciz:()=>void; sesli:()=>boolean; soyle:(s:string)=>void;
  ses:()=>void; dogru:()=>void; yemek:(p:Yemek)=>void; resim:(p:Yemek)=>string; servis:(s:ServisKaydi)=>HTMLElement}
const karsilastirilir=(p:Parca)=>p==='menemen'||p==='durum'||p==='omlet'||p==='manti'||p==='kumpir'||p==='simit'||p==='tost'||p==='salata'||p==='corba'||p==='pizza'||p==='makarna'||p==='sis'||p==='krep'||p==='mucver'||tatliMi(p);
const sebzeAd={marul:'Marul',salatalik:'Salatalık',domates:'Domates',havuc:'Havuç',patates:'Patates'};
function pizzaLokmasi(id:Cesit){
  return img(pizzaDilimResmi(id));
}
function karsilastirma(k:ServisKaydi){
  const istek=h('div.tepsi-tadim-parcalar',{'aria-label':'Fişteki malzemeler'});
  const yapilan=h('div.tepsi-tadim-parcalar',{'aria-label':'Kullanılan malzemeler'});
  const lokma=(yer:HTMLElement,ad:string,cizim:Node,durum='',adet?:number)=>{
    const parca=h('span.tepsi-tadim-lokma',{'role':'img','aria-label':adet===undefined?ad:ad+', '+adet+' parça','data-durum':durum},cizim);
    if(adet!==undefined)parca.append(h('b.tepsi-tadim-miktar',{},String(adet)));
    yer.append(parca);
  };
  let cumle='';
  if(k.tarifId==='salata'||k.tarifId==='corba'){
    const hazirlik=k[k.tarifId];
    if(hazirlik){
      const fark=sebzeFarki(hazirlik);
      for(const id of TARIFLER[k.tarifId].malzemeler)lokma(istek,sebzeAd[id],resim(id),fark.eksik.includes(id)?'fark':'');
      for(const id of hazirlik.aktarilan)lokma(yapilan,sebzeAd[id],resim(id),fark.fazla.includes(id)?'fark':'');
    }
    const garnitur=(id:typeof k.sus.id)=>corbaBitisiMi(id)?bitisResmi(id):sosMu(id)?sosResmi(id):resim(id+'-dilim');
    const isim=(id:typeof k.sus.id)=>corbaBitisiMi(id)?bitisAdi[id]:sosMu(id)?sosAd[id]:sebzeAd[id]+' dilimi';
    if(k.istenenSus){
      lokma(istek,isim(k.istenenSus),garnitur(k.istenenSus),k.istenenSus!==k.sus.id?'fark':'');
      cumle=corbaBitisiMi(k.istenenSus)?bitisIstegi(k.istenenSus):sosMu(k.istenenSus)?sosIstegi[k.istenenSus]:k.istenenSus==='havuc'?replik['lokum-havuc']:replik['lokum-domates'];
    }
    lokma(yapilan,isim(k.sus.id),garnitur(k.sus.id),k.istenenSus&&k.istenenSus!==k.sus.id?'fark':'');
    if(hazirlik?.istenenKivam){
      const taneli=hazirlik.istenenKivam==='taneli';
      const patates=hazirlik.istenenKivam==='patates',uyum=kivamUyuyor(hazirlik);
      lokma(istek,patates?'Yalnızca patates ezilmiş':taneli?'Taneli çorba':'Pürüzsüz çorba',corbaKivamOrnegi(hazirlik.istenenKivam));
      lokma(yapilan,'Hazırladığın çorbanın kıvamı',corbaKasesi(hazirlik,2),uyum?'':'fark');
      if(!cumle||!uyum)cumle=patates?sebzeReplik['corba-patates']:stüdyo[taneli?'corba-taneli-istek':'corba-puruzsuz-istek'];
    }
    if(hazirlik?.salatalikBoyu){
      const boy=hazirlik.salatalikBoyu;
      lokma(istek,dilimBoyAdi(boy),salatalikOrnegi(boy));
      if(hazirlik.aktarilan.includes('salatalik')){
        const secim=kesimHedefi(hazirlik,'salatalik');
        lokma(yapilan,dilimBoyAdi(secim),salatalikOrnegi(secim),boy===secim?'':'fark');
      }
      if(!dilimUyuyor(hazirlik))cumle=dilimIstegi(boy);
    }
    if(hazirlik&&(!cumle||sebzeFarki(hazirlik).eksik.length))cumle=replik[k.tarifId==='salata'?'salata-fis':'corba-fis'];
  }else if(k.tarifId==='pizza'&&k.fis){
    const f=k.fis;
    if(f.sos){
      const gercek=k.sosCesidi??'domates',fark=f.sos===gercek?'':'fark';
      lokma(istek,sosAdi[f.sos],img(pizzaResmi('sos-'+f.sos)),fark);
      lokma(yapilan,sosAdi[gercek],img(pizzaResmi('sos-'+gercek)),fark);
    }
    const grup=(yer:HTMLElement,ad:string)=>{const g=h('span.tepsi-tadim-yari',{role:'group','aria-label':ad});yer.append(g);return g;};
    const liste=(yer:HTMLElement,idler:readonly Cesit[],diger:readonly Cesit[],istenen:boolean)=>{
      for(const id of new Set(idler)){
        const hedef=f.miktarlar?.[id],konan=k.ust.filter(d=>d.cesit===id).length;
        const yanlis=!diger.includes(id)||(hedef!==undefined&&konan!==hedef);
        lokma(yer,ISIM[id],pizzaLokmasi(id),yanlis?'fark':'',hedef===undefined?undefined:istenen?hedef:konan);
      }
    };
    if(f.yarilar){
      for(const taraf of ['sol','sag'] as const){
        const etiket=taraf==='sol'?'Sol yarı':'Sağ yarı';
        const secim=k.ust.filter(d=>(d.x<50)===(taraf==='sol')).map(d=>d.cesit);
        liste(grup(istek,etiket),f.yarilar[taraf],secim,true);liste(grup(yapilan,etiket),secim,f.yarilar[taraf],false);
      }
    }else{
      const secim=k.ust.map(d=>d.cesit);
      liste(istek,f.malzemeler,secim,true);liste(yapilan,secim,f.malzemeler,false);
    }
    if(f.haric)lokma(istek,ISIM[f.haric]+' istenmiyor',pizzaLokmasi(f.haric),'haric');
    cumle=fisCumlesi(f);
  }else if(k.tarifId==='sis'&&k.tercih?.tarifId==='sis'){
    const secim=k.tercih,hedef=sisFisleri[secim.tur],sos=sisSoslari[secim.tur];
    for(const [yer,sebzeler] of [[istek,hedef],[yapilan,secim.lokmalar]] as const)
      sebzeler.forEach((v,i)=>lokma(yer,sisSebzeleri[v],varlik('sis/'+v+'-taze'),secim.lokmalar[i]===hedef[i]?'':'fark'));
    const sosAdlari={yogurt:'Yoğurt',domates:'Domates',feslegen:'Fesleğen'};
    for(const [yer,v] of [[istek,sos],[yapilan,secim.sos]] as const)lokma(yer,sosAdlari[v]+' sosu',varlik('sis/sos-'+v),secim.sos===sos?'':'fark');
    if(secim.yuzler){
      const sebze=secim.lokmalar[0];
      for(const [yer,yuzler] of [[istek,['tam','tam']],[yapilan,secim.yuzler]] as const){
        yuzler.forEach((k,i)=>{
          const g=varlik('sis/'+sebze+'-'+(k==='az'?'taze':'pismis'));
          g.style.filter=kavurmaRengi(k);
          lokma(yer,(i+1)+'. yüz, '+({az:'az pişmiş',tam:'tam pişmiş',kavruk:'kavruk',yanik:'yanmış'}[k]),g,secim.yuzler![i]==='tam'?'':'fark');
        });
      }
    }
    cumle=sisIstegi(secim.tur);
  }else if(k.tarifId==='mucver'&&k.tercih?.tarifId==='mucver'){
    const secim=k.tercih,hedef=mucverGarniturleri[secim.tur%3],renk=secim.tur%2;
    const garniturAd={yogurt:'Yoğurt',dereotu:'Dereotu',limon:'Limon'};
    const kizarmaAd=['Altın renkli','Çıtır','Fazla kızarmış'];
    for(const [yer,g,r] of [[istek,hedef,renk],[yapilan,secim.garnitur,secim.kizarma]] as const){
      lokma(yer,garniturAd[g],varlik('mucver/'+g),secim.garnitur===hedef?'':'fark');
      lokma(yer,kizarmaAd[r],varlik('mucver/mucver-'+['pismis','citir','fazla'][r]),renk===secim.kizarma?'':'fark');
      if (renk===1 && (secim.sikma??100)<55) {
        const istekMi=yer===istek;
        lokma(yer,istekMi?'Suyu sıkılmış kabak':'Sulu kabak',varlik('mucver/'+(istekMi?'kabak-bezi':'kabak-rende')),'fark');
      }
    }
    cumle=mucverIstegi(secim.tur);
  }else if(k.tarifId==='krep'&&k.tercih?.tarifId==='krep'){
    const secim=k.tercih,hedef=krepIstekleri[secim.tur];
    for(const [yer,bunlar,digerleri] of [[istek,hedef.meyveler,secim.meyveler],[yapilan,secim.meyveler,hedef.meyveler]] as const){
      const eslesen=krepDilimEslesmeleri(bunlar,digerleri);
      bunlar.forEach((v,i)=>lokma(yer,krepMeyveAdlari[v],varlik('krep/'+v),eslesen[i]?'':'fark'));
    }
    cumle=hedef.cumle;
  }else if(k.tarifId==='makarna'&&k.makarna){
    const soslar={yesil:['pesto','Fesleğen sosu'],kirmizi:['kirmizi-sos','Domates sosu'],sari:['tereyagi','Tereyağı']} as const;
    for(const [yer,renk] of [[istek,k.makarna.istenenSos],[yapilan,k.makarna.sos]] as const){
      const [gorsel,ad]=soslar[renk];lokma(yer,ad,varlik('makarna/'+gorsel),k.makarna.istenenSos===k.makarna.sos?'':'fark');
    }
    const adet=k.makarna.istenenSosAdedi,maske=k.makarna.soslanan??7;
    if(adet){
      for(const [yer,renk] of [[istek,k.makarna.istenenSos],[yapilan,k.makarna.sos]] as const){
        for(let i=0;i<3;i++){
          const soslu=yer===istek?i<adet:!!(maske&(1<<i));
          lokma(yer,soslu?'Soslu fiyonk':'Sade fiyonk',varlik('makarna/altin-'+(soslu?renk+'-lokma':'pismis')));
        }
      }
      cumle=makarnaSosReplik[adet===1?'makarna-tek-sos':'makarna-hepsi-sos'];
    }else cumle=k.makarna.sos==='yesil'&&k.makarna.pestoMaskesi!==undefined&&k.makarna.pestoMaskesi<7?stüdyo['makarna-havan-iri']:stüdyo[{yesil:'makarna-istek-feslegen',kirmizi:'makarna-istek-domates',sari:'makarna-istek-tereyagi'}[k.makarna.istenenSos] as keyof typeof stüdyo];
  }
  return {istek,yapilan,cumle};
}
export function masayiCiz(alan:HTMLElement,a:Ayar):()=>void{
  const {t}=a;const menu=menuBul(t.secili);const masa=menu?t.masalar[menu.id]:undefined;
  const sahne=h('section.tepsi-sahnesi',{'aria-label':'Müşteri masası'});alan.append(sahne);
  const guncelle=()=>{a.yaz();a.ciz();};
  function salonuKur(...args:Parameters<typeof salonSahnesiniKur>){
    const kapat=salonSahnesiniKur(...args);
    const [yer,,,evre]=args;
    if(evre!=='gelis'&&masa&&!masa.sunuldu){
      yer.dataset.bekleyen=t.secili;
      yer.dataset.sabir=(masa.beklemeSn??0)>=300?'gec':(masa.beklemeSn??0)>=240?'az':'';
    }
    const fon=yer.querySelector('.salon-dekor');
    for(const id of t.dekorlar??[])fon?.append(dekorResmi(id,'salon-susu salon-'+id));
    if(t.restoran&&(evre==='siparis'||evre==='bekleme'||evre==='servis')){
      const yan=dugme('Yan salona geç','salon-gecis salon-saga',ikon('ileri'));
      yan.onclick=()=>{delete t.servisSalonu;t.yanMasadan=true;t.restoranda=false;t.ekran='fisler';sus();guncelle();};
      yer.append(yan);
    }
    return kapat;
  }
  const istenen=menu?.icecekIstegi??'portakal';
  const kumpirFis=kumpirFisiniOku(masa?.kumpirFisi??menu?.id),kumpirIstegi:readonly KumpirMal[]=kumpirFisleri[kumpirFis];
  const sesliMenuId=menu?.id==='sutlac'&&masa?.sutlacIstegi&&masa.sutlacIstegi!=='yildiz'?menu.id+'-'+masa.sutlacIstegi:menu?.id==='minik-kek'&&masa?.kekFisi&&masa.kekFisi!=='cilek'?menu.id+'-'+masa.kekFisi:menu?.id==='meyveli-tart'&&masa?.tartIstegi&&masa.tartIstegi!=='bahce'?menu.id+'-'+masa.tartIstegi:menu?.id==='misirli-kumpir'?kumpirFis:menu?.id==='kurabiye'&&masa?.kurabiyeIstegi&&masa.kurabiyeIstegi!=='yildiz'?menu.id+'-'+masa.kurabiyeIstegi:menu?.smoothie&&masa?.smoothieBuzIstegi!==undefined?menu.id+(masa.smoothieBuzIstegi?'-buzlu':'-buzsuz'):menu?.id==='dondurma'&&masa?.dondurmaIstegi&&masa.dondurmaIstegi!=='cilek'?menu.id+'-'+masa.dondurmaIstegi:menu?.id;
  const gida=(p:Parca,menuId=menu?.id,siparisBalonu=false)=>{
    const siparis=menuId===menu?.id?menu:menuBul(menuId??'');
    const siparisMasasi=menuId?t.masalar[menuId]:undefined;
    if(p==='pizza'&&siparis?.pizzaFisi){
      const ornek=pizzaTabakResmi(fisOrnegi(siparis.pizzaFisi),'tam',siparis.pizzaFisi.sos);
      const tabak=h('span.tepsi-gida.pz-menu-tabagi',{'role':'img','aria-label':fisCumlesi(siparis.pizzaFisi)},ornek);
      return tabak;
    }
    if(p==='menemen'){const tabak=menemenOrnegi(menuId??'');tabak.classList.add('tepsi-gida');return tabak;}
    if(p==='durum'){const tabak=durumOrnegi(menuId??'');tabak.classList.add('tepsi-gida');return tabak;}
    if(p==='omlet'){const tabak=omletOrnegi(menuId??'');tabak.classList.add('tepsi-gida');return tabak;}
    if(p==='kumpir'){const ornek=kumpirOrnegi(kumpirFisleri[kumpirFisiniOku(siparisMasasi?.kumpirFisi??menuId)]);ornek.classList.add('tepsi-gida');return ornek;}
    if(p==='manti'){const cizim=mantiOrnegi(menuId??'');cizim.classList.add('tepsi-gida');return cizim;}
    if(p==='simit'){const cizim=simitSunumu(simitFisleri[simitFisi(menuId??'')].kaplama);cizim.classList.add('tepsi-gida');return cizim;}
    if(p==='tost'){const ornek=tostOrnegi(menuId);ornek.classList.add('tepsi-gida');return ornek;}
    if(p==='icecek'&&siparis?.smoothie)return siparisBardagi(siparis.smoothie,siparis.bardakIstegi);
    if(p==='minik-kek'){const k=minikKek(kekOrnegi(siparisMasasi?.kekFisi??siparis?.tatliFisi?.kekFisi??'cilek'));k.classList.add('tepsi-gida');return k;}
    if(p==='sutlac'){const yemek=sutlacKasesi(sutlacOrnegi(siparisMasasi?.sutlacIstegi??siparis?.tatliFisi?.sutlacIstegi));yemek.classList.add('tepsi-gida');return yemek;}
    if(p==='meyveli-tart'){const ornek=meyveliTartGorseli(tartIstegi(siparisMasasi?.tartIstegi??siparis?.tatliFisi?.tartIstegi));ornek.classList.add('tepsi-gida');return ornek;}
    if(p==='kurabiye'){
      const sekil=siparisMasasi?.kurabiyeIstegi??'yildiz';
      const resim=kurabiyeDizisi(sekil,kurabiyeOrnegi(sekil));resim.classList.add('kb-siparis','tepsi-gida');return resim;
    }
    if(tatliMi(p)){const resim=tatliResmi(p,p==='dondurma'?siparisMasasi?.dondurmaIstegi:undefined,siparisMasasi?.kurabiyeIstegi);resim.classList.add('tepsi-gida');return resim;}
    const meyve=siparis?.icecekIstegi??'portakal';
    const kaynak=p==='tavuk'?tavukResmi:p==='icecek'?icecekBardagi(meyve):a.resim(p);
    return siparisBalonu?fisMinyaturu(p==='icecek'?meyve:p,kaynak):img(kaynak,'tepsi-gida');
  };
  const istasyon=t.oynanan&&yanMi(t.oynanan)?t.oynanan:undefined;
  const ziyaret=t.restoranda?t.restoran:undefined;
  const aile=menu?.id==='aile-kahvaltisi';
  const birlikte=aile||menu?.id==='paylasilan-pizza';
  if(aile)sahne.dataset.aile='true';
  if(ziyaret&&t.gun.kapandi&&t.ekran==='masa'){
    if(t.gun.kutlamada&&t.gun.kutlama){
      sahne.append(kutlamaMasasi(t.gun.kutlama,a.yaz,()=>{t.gun.kutlamada=false;guncelle();},a.sesli));
      return ()=>{};
    }
    sahne.append(gunSonuEkrani(t.gun.no,t.gun.kazanc,()=>{
      if(!t.gun.kapandi)return;
      const oneri=t.gun.oneri;
      for(const id of t.salonKoltuklari??[]){
        if(id){a.yeniMasaTezgahi(id);delete t.masalar[id];}
      }
      t.salonKoltuklari=Array(6).fill(null);
      t.salonBekleme={};t.salonGelisSn=0;
      t.gun=yeniGun(t.gun.no+1);restoranAc(t,true,a.yeniMasaTezgahi,oneri);guncelle();
    }));
    return ()=>{};
  }
  const baslik=istasyon==='icecek'&&menu?.smoothie?'Meyve Tezgâhı':istasyon?ad[istasyon]:t.ekran==='fisler'?(t.yanMasadan?(t.servisSalonu?'Servis Salonu':'Yan Salon'):'Müşteri Masası'):masa?.sunuldu?'Afiyet olsun!':'Sipariş Tepsisi';
  const ust=h('header.tepsi-ust',{},btn('Geri','dugme',()=>{masaGeri(t);guncelle();},ikon('geri')),
    h('h2',{},baslik),btn(a.sesli()?'Sesi kapat':'Sesi aç','dugme',()=>{a.ses();const b=ust.lastElementChild!;b.replaceChildren(ikon(a.sesli()?'hoparlor':'sessiz'));b.setAttribute('aria-label',a.sesli()?'Sesi kapat':'Sesi aç');},ikon(a.sesli()?'hoparlor':'sessiz')));
  sahne.append(ust);
  if(ziyaret&&!t.oynanan){
    const rozet=gunRozeti(t.gun.no,t.gun.ziyaret,GUNDEKI_MUSTERI);
    rozet.classList.add('masa-gunu');sahne.append(rozet);
  }
  if(ziyaret&&menu&&masa&&t.ekran==='masa'&&ziyaret.evre!=='mutfak'){
    if(t.spesiyal)sahne.append(salonPanosu(t.spesiyal,a.servis));
    const dinle=async()=>{
      const secimler=alan.querySelector<HTMLElement>('.sm-fis-dilimler');
      if(secimler){secimler.classList.remove('sm-istegi-anlat');void secimler.offsetWidth;secimler.classList.add('sm-istegi-anlat');}
      if(a.sesli()){
        await restoranSiparisiniSoyle(menu.misafir,sesliMenuId??menu.id);
        if(aile&&a.sesli()&&alan.querySelector('.tepsi-sahnesi[data-salon=siparis]'))await salonSesiniCal('anne','anne-aile-limon');
      }
      alan.querySelector('.restoran-siparis')?.classList.add('fis-dokun');
    };
    if(ziyaret.evre==='gelis'){
      ust.querySelector('h2')!.textContent='Restoran';
      return salonuKur(sahne,menu.misafir,ziyaret.sira,'gelis',a.sesli,()=>{
        if(!sahne.isConnected||ziyaret.evre!=='gelis')return;
        ziyaret.evre='siparis';konusmaBekleniyor=true;guncelle();void dinle().finally(()=>{konusmaBekleniyor=false;});
      },birlikte);
    }else{
      ust.querySelector('h2')!.textContent=misafirAdi(menu.misafir);
      const konusan=btn('Siparişi tekrar dinle','restoran-konusan',dinle,misafirResmi(menu.misafir,'istek'),ikon('hoparlor'));
      const yemekler=menu.parcalar.map(p=>gida(p,menu.id,true));
      const onay=h('i',{},ikon('onay'));
      const siparis=btn('Siparişi al ve mutfağa geç','restoran-siparis',()=>{
        sus();masa.beklemeSn??=0;ziyaret.evre='mutfak';guncelle();
      },...yemekler,onay);
      if(ziyaret.spesiyal)siparis.append(spesiyalIsareti());
      if(menu.parcalar.includes('sutlac'))siparis.append(sutlacIstegiRozeti(masa.sutlacIstegi??'yildiz'));
      if(menu.parcalar.includes('minik-kek'))siparis.append(kekFisRozeti(masa.kekFisi??'cilek'));
      if(menu.parcalar.includes('kurabiye'))siparis.append(kremaFisi(masa.kurabiyeIstegi??'yildiz'));
      if(menu.parcalar.includes('meyveli-tart'))siparis.append(tartFisRozeti(tartIsteginiOku(masa.tartIstegi)));
      const susRozeti=masa.susIstegi&&susIstegiRozeti(masa.susIstegi);
      if(susRozeti)siparis.append(susRozeti);
      if(menu.smoothie){
        const secimler=h('span.sm-fis-dilimler',{'aria-label':'İçecek tercihleri'});
        if(menu.bardakIstegi?.kivam)secimler.append(kivamIsareti(menu.bardakIstegi.kivam));
        if(masa.smoothieBuzIstegi!==undefined)secimler.append(buzIsareti(masa.smoothieBuzIstegi));
        if(secimler.childElementCount)siparis.append(secimler);
      }
      if(menu.parcalar.includes('kumpir')){
        siparis.append(h('span.tost-fis-icerik',{},...kumpirIstegi.map(id=>kumpirResmi(id))));
      }
      if(menu.parcalar.includes('menemen'))siparis.append(h('span.tost-fis-icerik',{},...menemenIstegi(menu.id).sebzeler.map(s=>mnSebze(s))));
      if(menu.parcalar.includes('durum'))siparis.append(h('span.tost-fis-icerik',{},...durumIstegi(menu.id).map(durumIc)));
      if(menu.parcalar.includes('omlet'))siparis.append(h('span.tost-fis-icerik',{},...omletIstegi(menu.id).icler.map(omletIcResmi)));
      if(menu.parcalar.includes('manti')){
        const istek=mantiIstegi(menu.id);siparis.append(h('span.tost-fis-icerik',{},mantiResmi(istek.ic),mantiResmi(istek.sos)));
      }
      if(menu.parcalar.includes('simit')){
        const mal=simitFisleri[simitFisi(menu.id)].kaplama;
        if(mal==='susam'||mal==='hashas'){const k=kaplamaResmi(mal);k.className='tepsi-gida';siparis.append(k);}
      }
      if(menu.parcalar.includes('tost')){
        const istek=tostFisleri[tostFisi(menu.id)];
        siparis.append(h('span.tost-fis-icerik',{},...istek.icindekiler.map(tostMalzemeResmi)));
      }
      if(menu.parcalar.includes('tost')&&menu.smoothie)siparis.classList.add('restoran-ikili-fis');
      if(menu.parcalar.length===2&&tatliMi(menu.parcalar[1])){
        const tabaklar=h('span.siparis-yemekleri',{},...yemekler);
        const tercihler=Array.from(siparis.children).filter(el=>el!==onay);
        siparis.classList.add('tatlili-siparis');
        siparis.replaceChildren(tabaklar,onay);
        if(tercihler.length)siparis.insertBefore(h('span.siparis-tercihleri',{},...tercihler),onay);
      }
      siparis.setAttribute('aria-description',menu.cumle);
      dekoruKoy(sahne,t.ustalik,'vazo');
      sahne.append(konusan,siparis);
      salonuKur(sahne,menu.misafir,ziyaret.sira,'siparis',a.sesli,undefined,birlikte);
      requestAnimationFrame(()=>{if(!a.sesli()||!konusmaBekleniyor) siparis.classList.add('fis-dokun');});
    }
    return ()=>{sus();};
  }
  if(t.ekran==='fisler'&&t.yanMasadan){
    const koltuklar=t.salonKoltuklari??=Array(6).fill(null);
    const servis=t.servisSalonu===true;
    const bas=servis?3:0;
    const itibar=h('small.salon-itibar',{'aria-label':'Dükkân itibarı'},ikon('yildiz'),String(t.itibar??50));
    ust.querySelector('h2')?.append(itibar);
    const geri=ust.querySelector('button')!;
    geri.remove();
    geri.className='salon-gecis salon-sola';
    geri.setAttribute('aria-label',servis?'Yan salona dön':'Ana salona dön');
    sahne.append(geri);
    if(!servis){
      const ileri=dugme('Servis salonuna geç','salon-gecis salon-saga',ikon('ileri'));
      ileri.onclick=()=>{t.servisSalonu=true;guncelle();};sahne.append(ileri);
    }
    const salonuCiz=(gelen?:string)=>yanSalonuGoster(sahne,koltuklar.slice(bas,bas+3).map(id=>id?menuBul(id):undefined),m=>m.parcalar.map(p=>gida(p,m.id,true)),m=>{
      if(siparisFisindenAc(t,m.id,a.yeniMasaTezgahi)){
        t.masalar[m.id].beklemeSn??=t.salonBekleme?.[m.id]??0;guncelle();
        if(a.sesli())void restoranSiparisiniSoyle(m.misafir,m.id);
      }
    },t.dekorlar??[],servis,id=>t.salonBekleme?.[id]??0,gelen);
    salonuCiz();
    const yenile=(e:Event)=>{
      const {gelen}= (e as CustomEvent).detail;
      itibar.lastChild!.textContent=String(t.itibar??50);
      salonuCiz(gelen);
      if(gelen)sahne.querySelector<HTMLElement>('[data-menu="'+gelen+'"]')?.classList.add('salona-yeni-geldi');
    };
    window.addEventListener('sef-salon-degisti',yenile);
    return ()=>{window.removeEventListener('sef-salon-degisti',yenile);sus();};
  }
  if(t.ekran==='fisler'||!menu||!masa){
    restoranKapisi(t,a.yeniMasaTezgahi);
    guncelle();return ()=>{};
  }
  if(t.oynanan==='menemen'){
    const oyun=menemenTezgahi(menu.id,{taslak:masa.menemenTaslagi,sesli:a.sesli,
      istegiDinle:()=>{if(a.sesli())void restoranSiparisiniSoyle(menu.misafir,menu.id);},
      geri:()=>{delete t.oynanan;guncelle();},kaydet:taslak=>{masa.menemenTaslagi=taslak;a.yaz();},
      teslim:tabak=>{masa.menemenServisi=tabak;masa.menemenPuan=menemenPuani(tabak,menu.id);masa.tabaklar.menemen=true;
        delete masa.menemenTaslagi;tabakGeldi(masa,'menemen');delete t.oynanan;guncelle();}});
    sahne.replaceChildren(oyun.sahne);return oyun.temizle;
  }
  if(t.oynanan==='durum'){
    sahne.replaceChildren(durumTezgahi(menu.id,{taslak:masa.durumTaslagi,sesli:a.sesli,
      istegiDinle:()=>{if(a.sesli())void restoranSiparisiniSoyle(menu.misafir,menu.id);},
      geri:()=>{delete t.oynanan;guncelle();},kaydet:taslak=>{masa.durumTaslagi=taslak;a.yaz();},
      teslim:tabak=>{masa.durumServisi=tabak;masa.durumPuan=durumPuani(tabak,menu.id);masa.tabaklar.durum=true;
        delete masa.durumTaslagi;tabakGeldi(masa,'durum');delete t.oynanan;guncelle();}
    }));return ()=>{};
  }
  if(t.oynanan==='omlet'){
    const oyun=omletTezgahi(menu.id,{taslak:masa.omletTaslagi,sesli:a.sesli,rehber:evre=>void omletRehberiniDinle(evre),
      kaydet:taslak=>{masa.omletTaslagi=taslak;a.yaz();},geri:()=>{delete t.oynanan;guncelle();},
      teslim:tabak=>{masa.omletServisi=tabak;masa.omletPuan=omletPuani(tabak,menu.id);masa.tabaklar.omlet=true;
        delete masa.omletTaslagi;tabakGeldi(masa,'omlet');delete t.oynanan;guncelle();}});
    sahne.replaceChildren(oyun.sahne);return oyun.temizle;
  }
  if(t.oynanan==='manti'){
    const oyun=mantiTezgahi(menu.id,{taslak:masa.mantiTaslagi,sesli:a.sesli,soyle:a.soyle,
      geri:()=>{delete t.oynanan;guncelle();},kaydet:t=>{masa.mantiTaslagi=t;a.yaz();},
      teslim:tarif=>{masa.mantiServisi=tarif;masa.mantiPuani=mantiPuan(tarif,menu.id);masa.tabaklar.manti=true;delete masa.mantiTaslagi;tabakGeldi(masa,'manti');delete t.oynanan;guncelle();}});
    sahne.replaceChildren(oyun.sahne);return oyun.temizle;
  }
  if(t.oynanan==='kumpir'){
    sahne.replaceChildren(kumpirTezgahi({
      istek:kumpirIstegi,taslak:masa.kumpirTaslagi,sesli:a.sesli,soyle:a.soyle,
      kaydet:taslak=>{masa.kumpirTaslagi=taslak;a.yaz();},geri:()=>{delete t.oynanan;guncelle();},
      teslim:kumpir=>{masa.kumpirServisi=kumpir;masa.kumpirPuan=kumpirPuani(kumpir,kumpirIstegi);masa.tabaklar.kumpir=true;
        delete masa.kumpirTaslagi;tabakGeldi(masa,'kumpir');delete t.oynanan;guncelle();}
    }));return ()=>{};
  }
  if(t.oynanan==='simit'){
    const fis=simitFisi(menu.id);
    const oyun=simitFirini(fis,{
      taslak:masa.simitTaslagi,sesli:a.sesli,soyle:a.soyle,kaydet:taslak=>{masa.simitTaslagi=taslak;a.yaz();},
      siparisiDinle:menu.misafir==='babaanne'?()=>{void restoranSiparisiniSoyle(menu.misafir,menu.id);}:undefined,
      geri:()=>{delete t.oynanan;guncelle();},
      teslim:simit=>{masa.simitServisi=simit;masa.simitPuan=simitPuani(simit,fis);masa.tabaklar.simit=true;
        delete masa.simitTaslagi;tabakGeldi(masa,'simit');delete t.oynanan;guncelle();}
    });sahne.replaceChildren(oyun.sahne);return oyun.temizle;
  }
  if(t.oynanan==='tost'){
    const fis=tostFisi(menu.id);
    const oyun=tostTezgahi(fis,{
      taslak:masa.tostTaslagi,sesli:a.sesli,soyle:a.soyle,
      kaydet:taslak=>{masa.tostTaslagi=taslak;a.yaz();},
      geri:()=>{delete t.oynanan;guncelle();},
      teslim:tost=>{
        masa.tostServisi=tost;masa.tostPuani=tostKalitesi(tost,fis);masa.tabaklar.tost=true;
        delete masa.tostTaslagi;tabakGeldi(masa,'tost');delete t.oynanan;guncelle();
      }
    });sahne.replaceChildren(oyun.sahne);return oyun.temizle;
  }
  if(t.oynanan&&tatliMi(t.oynanan)){
    const id=t.oynanan;
    sahne.replaceChildren(pastaneSesleri(tatliHazirla(id,(puan,renk,fazlaPisti,sus,tat,sekil,tart,kurabiye,kek,hazirlamaPuani,sutlac)=>{
      masa.tabaklar[id]=true;masa.sutlacServisi=sutlac;masa.tatliPuani=puan;masa.hazirlamaPuani=hazirlamaPuani;masa.tatliTabagi=renk;masa.tatliSusu=sus;masa.kurabiyeSekli=sekil;masa.kurabiyeTepsisi=kurabiye;masa.kekServisi=kek;masa.tartDilimleri=tart;masa.dondurmaTadi=tat;masa.tatliFazlaPisti=fazlaPisti;delete masa.tatliTaslagi;tabakGeldi(masa,id);delete t.oynanan;guncelle();
    },()=>{delete t.oynanan;guncelle();},{taslak:masa.tatliTaslagi,sutlacIstegi:masa.sutlacIstegi,susIstegi:masa.susIstegi,istenenTat:masa.dondurmaIstegi,istenenSekil:masa.kurabiyeIstegi,kekIstegi:masa.kekFisi,tartIstegi:masa.tartIstegi,kaydet:taslak=>{masa.tatliTaslagi=taslak;a.yaz();},sesli:a.sesli}),a.sesli));
    return ()=>{};
  }
  if(istasyon){
    const oyun=h('div.tepsi-istasyon',{'data-menu':menu.id});sahne.prepend(oyun);
    const tezgah=yanTezgahiAc(masa,istasyon);
    const kayit=(n:number)=>{tezgah.adim[istasyon]=n;a.yaz();};
    const bitir=()=>{
      yanTabagiKoy(masa,istasyon);tabakGeldi(masa,istasyon);delete t.oynanan;guncelle();
      if(menu.parcalar.some(p=>!masa.tabaklar[p]))a.soyle('Sıradaki yemeği seç.');
    };
    if(menu.smoothie&&istasyon==='icecek'){
      const istek=menu.smoothie;
      const karisim=tezgah.smoothie??=bosSmoothie();
      return smoothieIstasyonu(oyun,karisim,istek,()=>{kayit(karisim.meyveler.length);},()=>{
        tezgah.icecekMiktari=karisim.bardak<servisCizgisi?2:3;
        tezgah.icecekPuani=smoothiePuani(karisim,istek,masa.smoothieBuzIstegi,menu.bardakIstegi);bitir();
      },a.sesli,masa.smoothieBuzIstegi,menu.bardakIstegi,t.renkDefteri);
    }
    return istasyon==='tavuk'?tavukIstasyonu(oyun,tezgah.adim.tavuk,kayit,bitir,a.soyle,a.sesli,p=>{tezgah.tavukPuani=p;a.yaz();},tezgah.tavukPuani,{tava:tezgah.tavaKaydi,yaz:poz=>{tezgah.tavaKaydi=poz;a.yaz();},sun:parcalar=>{tezgah.tavukParcalari=parcalar;}}):
      icecekIstasyonu(oyun,tezgah.adim.icecek,kayit,bitir,a.soyle,a.sesli,miktar=>{
        tezgah.icecekMiktari=miktar;tezgah.icecekPuani=icecekUyumu(istenen,tezgah.icecekMeyvesi,miktar);a.yaz();
      },{istenen,secili:tezgah.icecekMeyvesi,sec:meyve=>{tezgah.icecekMeyvesi=meyve;a.yaz();}});
  }
  const hazir=menu.parcalar.every(p=>!!masa.tabaklar[p]);
  const tadim=tadimSonucu(masa,menu.parcalar);
  const puan=tadim.yildiz;
  const eksik=tadim.tabaklar.find(tabak=>tabak.puan===0);
  const neden=tadim.tabaklar.reduce((enDusuk,tabak)=>tabak.puan<enDusuk.puan?tabak:enDusuk);
  const kumpirReaksiyonu=()=>{
    const t=masa.kumpirServisi!;
    const fazla=t.katlar.find(k=>!kumpirIstegi.includes(k.id));
    if(fazla)return kumpirFis==='misirli-kumpir'&&fazla.id==='zeytin'?stüdyo['kumpir-fazla']:stüdyo['kumpir-baska'];
    if(!kumpirIstegi.every(id=>t.katlar.some(k=>k.id===id)))return stüdyo['kumpir-eksik'];
    return kumpirFis==='misirli-kumpir'?stüdyo['kumpir-tesekkur']:stüdyo['kumpir-tam'];
  };
  const nedeniDinle=(p:Parca,puan:number)=>{
    if(tatliMi(p)&&!masa.tabaklar[p])return tabakYorumu(p,0,undefined);
    if(menu.id==='dede-manti-sutlac'&&p==='sutlac')return tadimKararlari[puan===3?'dede-sutlac-tam':'dede-sutlac-fark'];
    if(menu.id==='babaanne-simit-tart'&&p==='meyveli-tart')return salonReplikleri[puan===3?'babaanne-tart-tam':'babaanne-tart-fark'];
    if(menu.id==='baba-pizza-kek'&&p==='minik-kek')return salonReplikleri[puan===3?'baba-kek-tam':'baba-kek-fark'];
    if(menu.misafir==='babaanne'){
      const simit=masa.simitServisi;
      if(!simit)return salonReplikleri['babaanne-eksik'];
      if(simit.kaplama!=='hashas')return salonReplikleri['babaanne-simit-kaplama'];
      const renk=simitRengi(simit.isi);
      return salonReplikleri[renk==='altin'?'babaanne-simit-tam':renk==='acik'?'babaanne-simit-acik':'babaanne-simit-koyu'];
    }
    if(menu.misafir==='baba'){
      const pizza=masa.tabaklar.pizza;
      if(!pizza||pizza===true||pizza.tarifId!=='pizza'||!menu.pizzaFisi)return salonReplikleri['baba-eksik'];
      return babaPizzaYorumu(pizza.ust,menu.pizzaFisi,pizza.kivam??'tam');
    }
    if(menu.misafir==='kino'||menu.misafir==='anne'){
      const kim=aile&&p==='icecek'?'anne':menu.misafir;
      if(!puan)return salonReplikleri[`${kim}-eksik`];
      if(p==='omlet'&&masa.omletServisi){
        const istek=omletIstegi(menu.id), tabak=masa.omletServisi;
        const icler=new Set(tabak.icler.map(ic=>ic.tur));
        if(istek.icler.length!==icler.size||!istek.icler.every(ic=>icler.has(ic)))return salonReplikleri[`${kim}-omlet-ic`];
        const kivam=omletKivami(tabak.sure);
        if(kivam===istek.kivam)return salonReplikleri[`${kim}-omlet-tam`];
        return kim==='kino'&&kivam==='yumusak'?salonReplikleri['kino-omlet-erken']:salonReplikleri[`${kim}-omlet-gec`];
      }
      if(p==='icecek')return salonReplikleri[`${kim}-bardak-${puan===3?'tam':masa.icecekMeyvesi===istenen?'az':'renk'}`];
      if(kim==='kino'&&p==='tost')return salonReplikleri[`kino-tost-${puan===3?'tam':masa.tostServisi?.kizartma==='citir'?'ic':'renk'}`];
      if(kim==='anne'&&p==='simit')return salonReplikleri[`anne-simit-${puan===3?'tam':masa.simitServisi?.kaplama==='karisik'?'renk':'kaplama'}`];
    }
    const ozel=secimYorumu(p,puan);
    if(ozel)return ozel;
    if(p==='kumpir'&&masa.kumpirServisi)return kumpirReaksiyonu();
    if(p==='manti'&&masa.mantiServisi&&puan>0&&puan<3){
      const m=masa.mantiServisi,hedef=mantiIstegi(menu.id),kivam=mantiKivami(m.sure);
      if(m.ic!==hedef.ic)return mantiRehberi['ic-farki'];
      if(kivam!=='tam')return mantiRehberi[kivam];
      return m.soslar.some(i=>lokmaninSosu(m,i)!==hedef.sos)?mantiRehberi['sos-farki']:mantiRehberi['sos-eksik'];
    }
    if(p==='simit'&&masa.simitServisi&&puan>0&&puan<3){
      const hedef=simitFisleri[simitFisi(menu.id)];
      if(masa.simitServisi.kaplama!==hedef.kaplama){
        if(hedef.kaplama==='sade')return tadimKararlari['simit-sade-eksik'];
        if(hedef.kaplama==='karisik')return tadimKararlari['simit-iki-eksik'];
      }
      return masa.simitServisi.kaplama!==hedef.kaplama?'Müşteri simidinde başka bir kaplama istemişti.':'Simidin rengini sipariştekiyle karşılaştıralım.';
    }
    const yemek=masa.tabaklar[p];
    if(p==='makarna'&&yemek&&yemek!==true&&yemek.tarifId==='makarna'&&yemek.makarna?.sos==='yesil'&&yemek.makarna.pestoMaskesi!==undefined&&yemek.makarna.pestoMaskesi<7)
      return 'Sosta iri yapraklar kalmış. Havanda kalan yaprakları da ezebilirsin.';
    if(p==='tost'&&masa.tostServisi&&puan>0&&puan<3){
      const istek=tostFisleri[tostFisi(menu.id)],tost=masa.tostServisi;
      if(tost.kizartma!==istek.kizartma)return 'Tostun rengini siparişteki ekmekle karşılaştıralım.';
      if(istek.adetli){
        const eksik=istek.icindekiler.find(tur=>tost.katlar.filter(k=>k.tur===tur).length<istek.icindekiler.filter(i=>i===tur).length);
        if(eksik==='kasar')return tadimKararlari['tost-eksik-kasar'];
        if(eksik==='domates')return tadimKararlari['tost-eksik-domates'];
        return tadimKararlari['tost-fazla-kat'];
      }
      return 'Tostun içindeki malzemelerle sipariştekilere birlikte bakalım.';
    }
    if(p==='icecek'&&masa.smoothie&&masa.smoothieBuzIstegi!==undefined&&masa.smoothieBuzIstegi!==!!masa.smoothie.buzlu)return masa.smoothieBuzIstegi?'Bu bardak için buz istemişti.':'Müşteri içeceğini buzsuz istemişti.';
    if(p==='icecek'&&menu.smoothie&&masa.smoothie&&puan<3){
      if(renkAdi(masa.smoothie.meyveler)!==renkAdi(menu.smoothie))return 'Bardaktaki renk siparişteki renkten farklı.';
      if(!icecekKivamiUyuyor(masa.smoothie.karisim,menu.bardakIstegi))return menu.bardakIstegi?.kivam==='taneli'?tadimKararlari['bardak-taneli-eksik']:tadimKararlari['bardak-ince-eksik'];
      if(menu.bardakIstegi?.yarim)return masa.smoothie.bardak>65?tadimKararlari['bardak-yarim-fazla']:tadimKararlari['bardak-yarim-az'];
      return 'Bardağı çizgiye kadar doldurabilirsin.';
    }
    if(tatliMi(p)&&masa.tatliFazlaPisti)return 'Tatlı biraz fazla kızarmış. Yeşil ışık yanınca fırından çıkarabilirsin.';
    if(p==='icecek'&&puan>0&&puan<3&&masa.icecekMeyvesi!==istenen)return 'Bardağın içindeki meyve suyu fiştekinden farklı.';
    return tabakYorumu(p,puan,masa.tabaklar[p]);
  };
  const yorum=menu.parcalar.length===1&&menu.parcalar[0]==='kumpir'&&masa.kumpirServisi?kumpirReaksiyonu():puan===3?'Afiyet olsun!':nedeniDinle(neden.parca,neden.puan);
  function secimYorumu(p:Parca,puan:number){
    if(!masa?.tabaklar[p]||!puan)return;
    if(p==='sutlac'&&masa.sutlacServisi){
      const kase=masa.sutlacServisi;
      if(kase.desen!==(masa.sutlacIstegi??'yildiz'))return sutlacReplikleri['sutlac-desen'];
      if(kase.kivam!=='ipeksi')return sutlacReplikleri['sutlac-kivam'];
      if(kase.toz<.65)return sutlacReplikleri['sutlac-toz'];
      if(kase.doluluk<.72)return sutlacReplikleri['sutlac-az'];
      return sutlacReplikleri['sutlac-tam'];
    }
    if(p==='menemen'&&masa.menemenServisi)return menemenMetni[`menemen-${menemenHatasi(masa.menemenServisi,menu!.id)}`];
    if(p==='durum'&&masa.durumServisi)return durumReplik[('durum-'+durumYorumu(masa.durumServisi,menu!.id)) as keyof typeof durumReplik];
    if(puan===3){
      if(p==='tost'&&menu?.id==='cift-kasar')return tadimKararlari['tost-iki-kasar-tam'];
      if(p==='tost'&&menu?.id==='cift-domates')return tadimKararlari['tost-iki-domates-tam'];
      if(p==='simit'&&menu?.id==='sade-simit')return tadimKararlari['simit-sade-tam'];
      if(p==='simit'&&menu?.id==='iki-renk-simit')return tadimKararlari['simit-iki-tam'];
      if(p==='icecek'&&menu?.bardakIstegi?.yarim)return tadimKararlari['bardak-yarim-tam'];
    }
    if(p==='minik-kek'&&masa.kekServisi){
      if(masa.tatliFazlaPisti)return tadimKararlari['kek-firin'];
      return tadimKararlari[kekFarki(masa.kekServisi,masa.kekFisi??'cilek')?'kek-sus-eksik':'kek-dogru'];
    }
    if(p==='meyveli-tart'&&masa.tartDilimleri){
      if(tartEksigi(masa.tartDilimleri,tartIsteginiOku(masa.tartIstegi)))return tadimKararlari['tart-eksik'];
      if(puan===3)return tadimKararlari['tart-dogru'];
    }
    if(p==='kurabiye'){
      const istek=masa.kurabiyeIstegi??'yildiz';
      if((masa.kurabiyeSekli??'yildiz')!==istek)return tadimKararlari[`kalip-${istek}`];
      if(masa.tatliFazlaPisti)return tadimKararlari['kalip-pisti'];
      if(masa.kurabiyeTepsisi&&kremaEksigi(masa.kurabiyeTepsisi,istek))return tadimKararlari['kalip-krema-eksik'];
      if(puan===3)return tadimKararlari['kalip-dogru'];
    }
    if(p==='dondurma'){
      if((masa.dondurmaTadi??'cilek')!==(masa.dondurmaIstegi??'cilek'))return tadimKararlari['dondurma-tat'];
      if(puan===3)return tadimKararlari['dondurma-dogru'];
    }
    const tabak=masa.tabaklar.makarna;
    if(p==='makarna'&&tabak&&tabak!==true&&tabak.tarifId==='makarna'&&tabak.makarna?.istenenSosAdedi){
      const m=tabak.makarna,adet=[1,2,4].filter(bit=>((m.soslanan??7)&bit)!==0).length;
      if(m.sos===m.istenenSos&&adet!==m.istenenSosAdedi)return makarnaSosReplik[m.istenenSosAdedi===1?'makarna-tek-sos-tadim':'makarna-hepsi-sos-tadim'];
    }
    if(p==='makarna'&&tabak&&tabak!==true&&tabak.tarifId==='makarna'&&tabak.makarna?.sos==='yesil'&&tabak.makarna.istenenSos==='yesil'){
      const iz=tabak.makarna.pestoMaskesi;
      if(iz!==undefined&&iz<7)return tadimKararlari['pesto-iri'];
      if(iz===7&&puan===3)return tadimKararlari['pesto-ezildi'];
    }
  }
  const yorumuSoyle=(s:string)=>{
    if(!a.sesli())return;
    if(masa.servisHatali){
      if(!servisTepkisiniCal(masa.teslimAlan??menu.misafir,'yanlis'))efekt.kilitNazik();
      return;
    }
    if(s===yorum&&puan===3&&servisTepkisiniCal(menu.misafir,'begendi'))return;
    if(s==='Afiyet olsun!'&&puan===3&&!eksik){
      if(menu.misafir==='anne'||menu.misafir==='kino'||menu.misafir==='baba'||menu.misafir==='babaanne'){
        s=nedeniDinle(menu.parcalar[0],tadim.tabaklar[0].puan);
      }else{
        for(const tabak of tadim.tabaklar){
          const ozel=secimYorumu(tabak.parca,tabak.puan);
          if(ozel){s=ozel;break;}
        }
        const salata=masa.tabaklar.salata;
        if(s==='Afiyet olsun!'&&salata&&salata!==true&&salata.tarifId==='salata'&&citirSalata(salata.salata))s='Sebzeleri yıkamışsın. Salatam taptaze!';
      }
    }
    const yorumSahibi=aile&&[salonReplikleri['anne-bardak-tam'],salonReplikleri['anne-bardak-az'],salonReplikleri['anne-bardak-renk']].includes(s)?'anne':menu.misafir;
    if(s==='Fişteki bir yemek tepside eksik.'&&!misafirKaydiVar(yorumSahibi,s)){a.soyle(s);return;}
    void misafirCumlesi(yorumSahibi,s,sahne.querySelector('dialog[open]')?'istek':'tesekkur');
  };
  const sofradaki=masa.teslimAlan??menu.misafir;
  const musteri=btn(masa.sunuldu?'Müşteriyi dinle':'Siparişi dinle','tepsi-alici',()=>{
    if(!masa.sunuldu){if(a.sesli())void restoranSiparisiniSoyle(menu.misafir,sesliMenuId??menu.id);}
    else yorumuSoyle(masa.sunuldu?yorum:menu.cumle);
  },
    misafirResmi(sofradaki,masa.sunuldu?(puan===3?'tesekkur':'tadim'):'istek'));
  if(masa.sunuldu)musteri.append(yildizlar(puan));
  if(ziyaret)dekoruKoy(sahne,t.ustalik,'vazo');
  sahne.append(musteri);
  const piknikSunumu=menu.id==='bahce-tabagi'&&masa.sunuldu&&masa.piknik?.esya.includes('pecete');
  if(masa.sunuldu&&!piknikSunumu&&masa.servisKoltugu===undefined){
    salonuKur(sahne,sofradaki,ziyaret?.sira??0,'servis',a.sesli,undefined,birlikte&&!masa.teslimAlan);
    musteri.classList.add('salon-tadim-dugmesi');
  }else if(ziyaret&&!masa.sunuldu){
    const don=btn('Restoran salonuna dön','salona-don',()=>{
      ziyaret.evre='siparis';guncelle();
    },img(new URL('../../assets/sef/restoran-kapi.webp',import.meta.url).href),ikon('geri'));
    sahne.append(don);
  }
  const susuDuzelt=(p:Parca,krema=false)=>{
    if(!tatliMi(p)||!masa.tabaklar[p])return;
    const eskiHata=masa.hazirlamaPuani?3-masa.hazirlamaPuani:hazirlamaHatasi(p,{puan:masa.tatliPuani??1,tat:masa.dondurmaTadi,sekil:masa.kurabiyeSekli,
      kurabiye:masa.kurabiyeTepsisi,kek:masa.kekServisi,tart:masa.tartDilimleri},masa,!!masa.tatliFazlaPisti);
    masa.tatliTaslagi={surum:2,adim:krema?(p==='dondurma'?0:p==='minik-kek'?3:4):p==='dondurma'?3:5,yanlis:eskiHata,
      tabak:masa.tatliTabagi,tat:masa.dondurmaTadi,sekil:masa.kurabiyeSekli,kurabiye:masa.kurabiyeTepsisi,kek:masa.kekServisi,tartDilimleri:masa.tartDilimleri,sus:masa.tatliSusu,fazlaPisti:masa.tatliFazlaPisti};
    tekrarPis(p);
  };
  const tekrarPis=(p:Parca)=>{
    if(menu.parcalar[0]===p)delete masa.sunumSirasi;
    if(aile&&masa.aileServisi&&(p==='omlet'||p==='icecek'))
      masa.aileServisi=masa.aileServisi.filter(yer=>yer!==p);
    if(p==='sutlac'&&masa.sutlacServisi&&!masa.tatliTaslagi){
      const k=masa.sutlacServisi;
      const adim=k.kivam!=='ipeksi'?1:k.doluluk<.72?2:3;
      const sutlac={...yeniSutlac(),adim,sut:1,pirinc:true,isi:adim===1?0:.6,
        karistirma:adim===1?0:.8,doluluk:adim===1?0:k.doluluk} as const;
      masa.tatliTaslagi={surum:2,adim,yanlis:0,sutlac};
    }
    if(p==='menemen'&&masa.menemenServisi&&!masa.menemenTaslagi){
      const onceki=masa.menemenServisi,hata=menemenHatasi(onceki,menu.id);
      masa.menemenTaslagi=hata==='erken'||hata==='gec'?{...onceki,sebzeler:[...onceki.sebzeler],evre:'pisir',sure:0}:{...yeniMenemen(),sebzeler:[...onceki.sebzeler]};
    }
    if(p==='durum'&&masa.durumServisi&&!masa.durumTaslagi)masa.durumTaslagi={...yeniDurum(),katlar:masa.durumServisi.katlar.map(k=>({...k}))};
    if(p==='omlet'&&masa.omletServisi&&!masa.omletTaslagi){
      const eski=masa.omletServisi,hedef=omletIstegi(menu.id);
      const secilen=new Set(eski.icler.map(ic=>ic.tur));
      const icDogru=hedef.icler.length===secilen.size&&hedef.icler.every(ic=>secilen.has(ic));
      masa.omletTaslagi={...eski,icler:eski.icler.map(ic=>({...ic})),evre:icDogru?'pisir':'ic',sure:0};
    }
    if(p==='manti'&&masa.mantiServisi&&!masa.mantiTaslagi)masa.mantiTaslagi=mantiDuzeltme(masa.mantiServisi,menu.id);
    if(p==='kumpir'&&masa.kumpirServisi&&!masa.kumpirTaslagi){
      const sunum=masa.kumpirServisi;
      masa.kumpirTaslagi={...sunum,evre:'koy',katlar:sunum.katlar.map(kat=>({...kat}))};
    }
    if(p==='tost'&&masa.tostServisi&&!masa.tostTaslagi){
      const onceki=masa.tostServisi;
      // Keep the fillings where the child placed them and give them fresh bread to press.
      masa.tostTaslagi={...onceki,evre:'diz',katlar:onceki.katlar.map(k=>({...k})),gecen:0,kizartma:'acik'};
    }
    if(p==='simit'&&masa.simitServisi&&!masa.simitTaslagi){
      masa.simitTaslagi={...masa.simitServisi,evre:'kapla',isi:0};
    }
    if(masa.tadilan)delete masa.tadilan[p];
    if(p==='pizza')delete masa.pizzaCeyrekleri;
    delete masa.servisHatali;
    delete masa.teslimAlan;
    masa.sunuldu=false;t.oynanan=p;
    if(p==='menemen'||p==='durum'||p==='omlet'||p==='manti'||p==='kumpir'||p==='simit'||p==='tost'||tatliMi(p)){t.ekran='masa';guncelle();}
    else if(yanMi(p)){yanTezgahiAc(masa,p);t.ekran='masa';guncelle();}
    else{t.ekran='kapali';a.yaz();a.yemek(p);}
  };
  const karsilastir=(p:Parca,k:ServisKaydi|true,yildiz:1|2|3)=>{
    if(sahne.querySelector('dialog[open]'))return;
    const geriOdak=document.activeElement instanceof HTMLElement?document.activeElement:undefined;
    const pencere=h('dialog.tepsi-karsilastir',{'aria-label':ad[p]+' sipariş karşılaştırması'});
    const kapat=()=>{pencere.close();pencere.remove();geriOdak?.focus();};
    const {istek,yapilan,cumle}=k!==true?karsilastirma(k):{
      istek:h('div.tepsi-tadim-parcalar',{'aria-label':'Fişteki porsiyon'}),
      yapilan:h('div.tepsi-tadim-parcalar',{'aria-label':'Hazırlanan porsiyon'}),cumle:menu.cumle
    };
    if(p==='icecek'&&menu.smoothie&&masa.smoothie){
      const karisim=masa.smoothie;
      const hedef=siparisBardagi(menu.smoothie,menu.bardakIstegi);
      hedef.classList.add('sm-tadim-hedef');istek.append(hedef);
      if(menu.bardakIstegi?.kivam){
        istek.append(kivamIsareti(menu.bardakIstegi.kivam));
        const kivam=kivamIsareti(taneli(karisim.karisim)?'taneli':'puruzsuz');
        kivam.dataset.uyum=String(icecekKivamiUyuyor(karisim.karisim,menu.bardakIstegi));
        yapilan.append(kivam);
      }
      if(masa.smoothieBuzIstegi!==undefined){
        const buz=buzIsareti(!!karisim.buzlu);
        buz.dataset.uyum=String(masa.smoothieBuzIstegi===!!karisim.buzlu);
        istek.append(buzIsareti(masa.smoothieBuzIstegi));yapilan.append(buz);
      }
    }
    if(p==='menemen'&&masa.menemenServisi){
      const hedef=menemenIstegi(menu.id),sunum=masa.menemenServisi;
      istek.append(menemenOrnegi(menu.id));yapilan.append(menemenSahani(sunum));
      for(const s of hedef.sebzeler)istek.append(h('span.tepsi-tadim-lokma',{},mnSebze(s)));
      for(const s of sunum.sebzeler)yapilan.append(h('span.tepsi-tadim-lokma',{'data-durum':hedef.sebzeler.includes(s)?'':'fark'},mnSebze(s)));
    }
    if(p==='durum'&&masa.durumServisi){istek.append(durumOrnegi(menu.id));yapilan.append(durumTabagi(masa.durumServisi));}
    if(p==='omlet'&&masa.omletServisi){
      const siparis=omletIstegi(menu.id),tabak=masa.omletServisi;
      for(const [yer,icler] of [[istek,siparis.icler],[yapilan,[...new Set(tabak.icler.map(ic=>ic.tur))]]] as const){
        for(const tur of icler)yer.append(h('span.tepsi-tadim-lokma',{role:'img','aria-label':omletAdlari[tur],'data-durum':siparis.icler.includes(tur)?'':'fark'},omletIcResmi(tur)));
      }
      istek.prepend(omletOrnegi(menu.id));
      for(const [yer,kivam] of [[istek,siparis.kivam],[yapilan,omletKivami(tabak.sure)]] as const){
        yer.append(h('span.tepsi-tadim-lokma.om-tadim-kivam',{role:'img','aria-label':omletKivamAdlari[kivam],'data-durum':kivam===siparis.kivam?'':'fark'},omletGoruntusu([],true,kivam)));
      }
    }
    if(p==='manti'&&masa.mantiServisi){
      const hedef=mantiIstegi(menu.id),manti=masa.mantiServisi;
      for(const [yer,ornek] of [[istek,true],[yapilan,false]] as const){
        const ic=ornek?hedef.ic:manti.ic;
        const sira=ornek?[0,1,2]:manti.soslar,sure=ornek?5350:manti.sure,kivam=mantiKivami(sure);
        if(ic)yer.append(h('span.tepsi-tadim-lokma',{role:'img','aria-label':mantiIsimleri[ic],'data-durum':ic===hedef.ic?'':'fark'},mantiResmi(ic)));
        const kapsam=h('span.manti-sos-kapsami',{role:'img','aria-label':sira.length+' mantı soslu','data-soslanan':sira.length});
        for(const i of [0,1,2]){
          const sos=ornek?hedef.sos:lokmaninSosu(manti,i);
          const lokma=h('span',{'data-uyum':String(sira.includes(i)&&sos===hedef.sos)},mantiResmi('kapali'));
          if(sira.includes(i)&&sos)lokma.append(mantiResmi(sos,'manti-sos-izi'));kapsam.append(lokma);
        }
        const zaman=h('span.manti-tadim-saati',{role:'img','aria-label':{erken:'Erken süzüldü',tam:'Tam kıvamında süzüldü',fazla:'Fazla haşlandı'}[kivam],'data-kivam':kivam},
          mantiResmi('tencere'),h('i.manti-saat',{},h('i'),h('b',{style:'left:'+Math.min(100,sure/110)+'%'})));
        yer.append(kapsam,zaman);
      }
    }
    if(p==='kumpir'&&masa.kumpirServisi){
      for(const [yer,tipler] of [[istek,kumpirIstegi],[yapilan,[...new Set(masa.kumpirServisi.katlar.map(k=>k.id))]]] as const)
        for(const id of tipler)yer.append(h('span.tepsi-tadim-lokma',{role:'img','aria-label':kumpirAd[id],'data-durum':kumpirIstegi.includes(id)?'':'fark'},kumpirResmi(id)));
    }
    if(p==='simit'&&masa.simitServisi?.kaplama){
      const simit=masa.simitServisi,hedef=simitFisleri[simitFisi(menu.id)],kap=simit.kaplama!;
      istek.append(simitSunumu(hedef.kaplama),h('span.tepsi-tadim-lokma',{role:'img','aria-label':kaplamaAdi[hedef.kaplama]},kaplamaResmi(hedef.kaplama)));
      yapilan.append(h('span.tepsi-tadim-lokma',{role:'img','aria-label':kaplamaAdi[kap],'data-durum':kap===hedef.kaplama?'':'fark'},kap==='karisik'?simitSunumu(kap,simitRengi(simit.isi),simit.ilkYari):kaplamaResmi(kap)));
      if(simitRengi(simit.isi)!==hedef.renk)yapilan.dataset.kizartma=simitRengi(simit.isi);
    }
    if(p==='tost'&&masa.tostServisi){
      const lokma=(yer:HTMLElement,ad:string,cizim:HTMLElement,durum:string)=>yer.append(h('span.tepsi-tadim-lokma',{role:'img','aria-label':ad,'data-durum':durum},cizim));
      const istenen=tostFisleri[tostFisi(menu.id)],tost=masa.tostServisi;
      for(const [yer,turler,kivam] of [[istek,istenen.icindekiler,istenen.kizartma],[yapilan,tost.katlar.map(k=>k.tur),tost.kizartma]] as const){
        const dilimler=istenen.adetli?turler:[...new Set(turler)];
        for(const [i,tur] of dilimler.entries()){
          const fazla=dilimler.slice(0,i+1).filter(m=>m===tur).length>istenen.icindekiler.filter(m=>m===tur).length;
          lokma(yer,tostMalzemeAdi[tur],tostMalzemeResmi(tur),fazla?'fark':'');
        }
        lokma(yer,tostKivamAdi[kivam],tostResmi(ekmekYolu(kivam)),kivam!==istenen.kizartma?'fark':'');
      }
    }
    if(!istek.childElementCount)istek.append(tatliMi(p)?tatliSunumu(p,'beyaz',false,masa.susIstegi,masa.dondurmaIstegi,masa.kurabiyeIstegi,p==='meyveli-tart'?tartIstegi(masa.tartIstegi):undefined,p==='kurabiye'?kurabiyeOrnegi(masa.kurabiyeIstegi??'yildiz'):undefined,p==='minik-kek'?kekOrnegi(masa.kekFisi??'cilek'):undefined,p==='sutlac'?sutlacOrnegi(masa.sutlacIstegi):undefined):gida(p));
    const dinle=()=>{
      if(!a.sesli())return;
      if(aile&&p==='icecek'){void salonSesiniCal('anne','anne-aile-limon');return;}
      if(cumle&&misafirKaydiVar(menu.misafir,cumle)){
        void misafirCumlesi(menu.misafir,cumle);
      }else{
        void restoranSiparisiniSoyle(menu.misafir,sesliMenuId??menu.id);
      }
    };
    const degerlendir=()=>yorumuSoyle(nedeniDinle(p,yildiz));
    const ornekPizza=k!==true&&k.tarifId==='pizza'&&k.fis?a.servis({...k,ust:fisOrnegi(k.fis),kivam:'tam',sosCesidi:k.fis.sos??k.sosCesidi}):undefined;
    const ornek=h('section.tepsi-fis-ornek',{'aria-label':'Müşterinin isteği'},
      ornekPizza?h('div.tepsi-tadim-tabak',{role:'img','aria-label':'Fişteki malzemelerle tam pişmiş pizza'},ornekPizza):h('div.tepsi-tadim-portre',{},misafirResmi(aile&&p==='icecek'?'anne':menu.misafir,'istek')),istek,
      btn('Müşterinin isteğini dinle','',dinle,ikon('hoparlor')));
    const sunum=sunulanTabak(p,masa,a.servis)??gida(p);
    if(k===true){
      pencere.classList.add('tepsi-yan-tadim');
      pencere.dataset.parca=p;
      if(p==='icecek'&&menu.smoothie&&masa.smoothie){
        pencere.classList.add('sm-tadim');
        const karisim=masa.smoothie;
        sunum.dataset.renkUyumu=String(renkAdi(karisim.meyveler)===renkAdi(menu.smoothie));
        sunum.dataset.miktarUyumu=String(bardakUyuyor(karisim.bardak,menu.bardakIstegi));
        if(menu.bardakIstegi?.yarim)sunum.append(h('i.sm-dolum-cizgisi',{'aria-hidden':true}));
      }
      const sol=istek.firstElementChild;
      if(sol instanceof HTMLImageElement&&(p==='icecek'||p==='tavuk'))sol.alt=p==='icecek'?'Dolu '+icecekAd(istenen):'Kızarmış tavuk';
      if(sunum instanceof HTMLImageElement&&(p==='icecek'||p==='tavuk'))sunum.alt=p==='icecek'?(masa.icecekMiktari===2?'Yarım ':'Dolu ')+icecekAd(masa.icecekMeyvesi):({1:'Yanmış tavuk',2:'Fazla kızarmış tavuk',3:'Kızarmış tavuk'}[masa.tavukPuani]);
    }
    const tabak=h('section.tepsi-tabak-ornek',{'aria-label':'Hazırladığın tabak'},
      h('div.tepsi-tadim-tabak',{},sunum),yapilan,
      btn('Tabağın yorumunu dinle','',degerlendir,ikon('hoparlor')));
    const kontroller=h('footer.tepsi-tadim-alt',{},btn('Tepsiye dön','',kapat,ikon('geri')),yildizlar(yildiz));
    if(tatliMi(p)&&masa.susIstegi&&masa.tatliSusu!==masa.susIstegi){
      kontroller.append(btn('Tatlı süsünü değiştir','tepsi-tadim-tekrar',()=>{kapat();susuDuzelt(p);},ikon('karistir')));
    }
    if(p==='minik-kek'&&masa.kekServisi&&kekFarki(masa.kekServisi,masa.kekFisi??'cilek')){
      kontroller.append(btn('Kekin kremasını ve meyvelerini değiştir','tepsi-tadim-tekrar',()=>{kapat();susuDuzelt(p,true);},ikon('karistir')));
    }
    if(p==='kurabiye'&&masa.kurabiyeTepsisi&&kremaEksigi(masa.kurabiyeTepsisi,masa.kurabiyeIstegi??'yildiz')){
      kontroller.append(btn('Kurabiyelerin kremasını değiştir','tepsi-tadim-tekrar',()=>{kapat();susuDuzelt(p,true);},ikon('karistir')));
    }
    if(yildiz<3)kontroller.append(btn(p==='sutlac'?(masa.sutlacServisi?.kivam!=='ipeksi'?'Sütlacın kıvamını düzelt':masa.sutlacServisi.doluluk<.72?'Kâseyi tamamla':'Tarçın desenini değiştir'):p==='kumpir'?'Kumpirin iç malzemelerini değiştir':p==='dondurma'?'Dondurma topunu değiştir':ad[p]+(p==='icecek'?' tekrar hazırla':' tekrar pişir'),'tepsi-tadim-tekrar',()=>{
      kapat();if(p==='dondurma')susuDuzelt(p,true);else tekrarPis(p);
    },ikon('tekrar')));
    pencere.addEventListener('cancel',e=>{e.preventDefault();kapat();});
    pencere.append(ornek,tabak,kontroller);sahne.append(pencere);pencere.showModal();degerlendir();
  };
  const fisSatir=h('div.tepsi-istek',{'aria-label':'İstenen yemekler'},...menu.parcalar.map(p=>{
    const v=masa.tabaklar[p],yildiz=tadim.tabaklar.find(t=>t.parca===p)!.puan;
    const suruyor=!v&&(p==='menemen'?!!masa.menemenTaslagi:p==='durum'?!!masa.durumTaslagi:p==='omlet'?!!masa.omletTaslagi:p==='manti'?!!masa.mantiTaslagi:p==='kumpir'?!!masa.kumpirTaslagi:p==='simit'?!!masa.simitTaslagi:p==='tost'?!!masa.tostTaslagi:yanMi(p)?yanHazirlaniyor(masa,p):!tatliMi(p)&&a.tezgahta(p,menu.id));
    const hucre=v&&(karsilastirilir(p)||yanMi(p))
      ?btn(ad[p]+' siparişi ile tabağı karşılaştır','tepsi-fis-lokmasi',()=>karsilastir(p,v,yildiz as 1|2|3),gida(p,menu.id,true))
      :!v?btn(ad[p]+(suruyor?' hazırlamaya devam et':' eksik tabağı hazırla'),'tepsi-fis-lokmasi',()=>tekrarPis(p),gida(p,menu.id,true)):h('span',{},gida(p,menu.id,true));
    if(v)hucre.append(h('i',{class:yildiz<3?'tepsi-fark':''},ikon(yildiz<3?'tekrar':'onay')));
    else if(suruyor||masa.sunuldu)hucre.append(h('i.tepsi-fark',{},ikon(suruyor?'karistir':'oyna')));
    return hucre;
  }));
  const susRozeti=masa.susIstegi&&susIstegiRozeti(masa.susIstegi,masa.tatliSusu===masa.susIstegi);
  if(ziyaret?.spesiyal)fisSatir.append(spesiyalIsareti());
  if(menu.parcalar.includes('sutlac'))fisSatir.append(sutlacIstegiRozeti(masa.sutlacIstegi??'yildiz'));
  if(menu.parcalar.includes('minik-kek'))fisSatir.append(kekFisRozeti(masa.kekFisi??'cilek'));
  if(menu.parcalar.includes('kurabiye'))fisSatir.append(kremaFisi(masa.kurabiyeIstegi??'yildiz'));
  if(menu.parcalar.includes('meyveli-tart'))fisSatir.append(tartFisRozeti(tartIsteginiOku(masa.tartIstegi)));
  if(susRozeti)fisSatir.append(susRozeti);
  sahne.append(fisSatir);
  if(piknikSunumu)sahne.classList.add('piknikte-servis');
  const altlik=piknikSunumu?new URL('../../assets/sef/piknik/ortu.webp',import.meta.url).href:tepsi;
  const tasiyici=h('div.tepsi-tabla',{},img(altlik,'tepsi-altlik'));
  const tabaklar=h('div.tepsi-yerler');
  if(ziyaret){
    tasiyici.dataset.porsiyon=String(menu.parcalar.length);
    dekoruKoy(tasiyici,t.ustalik,'pecete');
  }
  tasiyici.append(tabaklar);sahne.append(tasiyici);
  const porsiyonAdi=(p:Parca,hazir:boolean)=>{
    if(p==='dondurma')return dondurmaAdlari[(hazir?masa.dondurmaTadi:masa.dondurmaIstegi)??'cilek']+' Dondurma';
    if(p==='kurabiye')return kalipAdi[(hazir?masa.kurabiyeSekli:masa.kurabiyeIstegi)??'yildiz']+' Kurabiye';
    if(p==='icecek')return menu.smoothie?'Meyve karışımı':icecekAd(hazir?(masa.icecekMeyvesi??'portakal'):istenen);
    if(p==='minik-kek'){
      if(hazir)return 'Minik Kek';
      if(masa.kekFisi==='orman')return 'Orman Meyveli Minik Kek';
      if(masa.kekFisi==='muz')return 'Muzlu Minik Kek';
    }
    return ad[p];
  };
  const tadimiSakla=(p:Parca,tabak:HTMLElement)=>{
    (masa.tadilan??={})[p]=Number(tabak.dataset.lokmaAdedi);
    if(p==='pizza'){
      const alinan=tabak.querySelector<HTMLElement>('.pz-pizza')?.dataset.alinan;
      if(alinan)masa.pizzaCeyrekleri=Array.from(alinan,Number);
    }
  };
  for(const p of menu.parcalar){
    const v=masa.tabaklar[p];
    const sonuc=tadim.tabaklar.find(tabak=>tabak.parca===p)!;
    const tadimPuani=masa.servisHatali?1:sonuc.puan;
    const aileAlicisi=aile&&!masa.teslimAlan&&p==='icecek'?'anne':undefined;
    const bonusEksik=tatliMi(p)&&!!masa.susIstegi&&masa.tatliSusu!==masa.susIstegi;
    const yenilenebilir=!!v&&!masa.sunuldu&&(sonuc.puan<3||bonusEksik);
    const isim=porsiyonAdi(p,!!v);
    const baslik=masa.sunuldu?isim+(ziyaret&&v?' tattır':' puanını dinle'):v&&bonusEksik&&sonuc.puan===3?'Tatlı süsünü değiştir':yenilenebilir?isim+' yeniden hazırla':isim+(v?' hazır':' hazırla');
    const degerlendir=()=>{
          if(v&&(karsilastirilir(p)||yanMi(p)))karsilastir(p,v,sonuc.puan as 1|2|3);
          else a.soyle(nedeniDinle(p,sonuc.puan));
        };
    // Keep the dessert on the table between tastes. The receipt still opens the comparison.
    const lokmaYorumu=tatliMi(p)?()=>yorumuSoyle(nedeniDinle(p,sonuc.puan)):degerlendir;
    const porsiyon=ziyaret&&masa.sunuldu&&v?(p==='icecek'&&!masa.smoothie?sikmaServisBardagi(masa.icecekMeyvesi,masa.icecekMiktari):v!==true&&'resim' in v?lokmaliPorsiyon(v):undefined):undefined;
    const yuva=btn(baslik,'tepsi-yuva',()=>{
      if(masa.sunuldu){
        if(ziyaret&&yuva.dataset.tukendi!=='true')lokmaSun(sahne,yuva,p,tadimPuani,lokmaYorumu,false,aileAlicisi);else degerlendir();
        return;
      }
      if(v&&!yenilenebilir)return;
      if(v&&bonusEksik&&sonuc.puan===3)susuDuzelt(p);
      else tekrarPis(p);
    },porsiyon||sunulanTabak(p,masa,a.servis)||gida(p));
    if(p==='salata'&&v&&v!==true&&v.tarifId==='salata'&&citirSalata(v.salata)){
      const damla=h('span.lavabo-taze',{'aria-label':'Yıkanmış sebzeler'},h('span.yikama-damla'),ikon('onay'));yuva.append(damla);
    }
    yuva.dataset.parca=p;yuva.dataset.hazir=String(!!v);yuva.disabled=masa.sunuldu?!v:!!v&&!yenilenebilir;
    if(masa.sunuldu){
      if(!v){yuva.classList.add('tepsi-eksik');yuva.append(h('i',{'aria-label':'Eksik'},ikon('kapat')));}
      else yuva.append(yildizlar(tadimPuani as 1|2|3));
    }else{
      const suruyor=!v&&(p==='menemen'?!!masa.menemenTaslagi:p==='durum'?!!masa.durumTaslagi:p==='omlet'?!!masa.omletTaslagi:p==='manti'?!!masa.mantiTaslagi:p==='kumpir'?!!masa.kumpirTaslagi:p==='simit'?!!masa.simitTaslagi:p==='tost'?!!masa.tostTaslagi:yanMi(p)?yanHazirlaniyor(masa,p):!tatliMi(p)&&a.tezgahta(p,menu.id));
      yuva.dataset.tezgahta=String(suruyor);
      yuva.append(h('i',{},ikon(yenilenebilir?'tekrar':v?'onay':suruyor?'karistir':'oyna')));
    }
    if(ziyaret&&masa.sunuldu&&v){
      tadimiGeriYukle(yuva,p,masa.tadilan?.[p]??0,p==='pizza'?masa.pizzaCeyrekleri:undefined);
      yuva.addEventListener('sef-lokma',()=>{
        tadimiSakla(p,yuva);
        a.yaz();
      });
      eldeTattir(sahne,yuva,p,tadimPuani,lokmaYorumu,aileAlicisi);
    }
    tabaklar.append(yuva);
    if(tatliMi(p)&&!v&&!masa.sunuldu&&t.pastane.vitrin[p]?.length){
      const elde=t.pastane.vitrin[p]!;
      const al=vitrindenSec(p,isim,elde,()=>tatliSunumu(p,'beyaz',false,masa.susIstegi,masa.dondurmaIstegi,masa.kurabiyeIstegi,p==='meyveli-tart'?tartIstegi(masa.tartIstegi):undefined,p==='kurabiye'?kurabiyeOrnegi(masa.kurabiyeIstegi??'yildiz'):undefined,p==='minik-kek'?kekOrnegi(masa.kekFisi??'cilek'):undefined,p==='sutlac'?sutlacOrnegi(masa.sutlacIstegi):undefined),porsiyon=>{
        const sira=elde.indexOf(porsiyon);
        if(masa.tabaklar[p]||sira<0||masa.sunuldu)return;
        elde.splice(sira,1);
        masa.dondurmaTadi=porsiyon.tat;masa.kurabiyeSekli=porsiyon.sekil;masa.kurabiyeTepsisi=porsiyon.kurabiye;masa.kekServisi=porsiyon.kek;masa.tartDilimleri=porsiyon.tart;masa.sutlacServisi=porsiyon.sutlac;
        masa.hazirlamaPuani=porsiyon.puan;masa.tatliPuani=tatliSiparisPuani(p,porsiyon,masa);
        masa.tatliTabagi=porsiyon.tabak;masa.tatliSusu=porsiyon.sus;masa.tatliFazlaPisti=porsiyon.fazlaPisti;
        masa.tabaklar[p]=true;delete masa.tatliTaslagi;
        tabakGeldi(masa,p);guncelle();
      });
      sahne.append(al);
    }
  }
  tabagiYerlestir(masa,tabaklar);
  // Keep the served meal and reward at the recipient's table.
  if(masa.sunuldu&&masa.servisKoltugu!==undefined){
    const i=masa.servisKoltugu,bas=i<3?0:3;
    const konuklar=Array.from({length:3},(_,n)=>{
      const id=t.salonKoltuklari?.[bas+n];
      return n===i%3?{...menu,id:'teslim-'+menu.id,misafir:sofradaki}:id?menuBul(id):undefined;
    });
    sahne.replaceChildren(ust);
    yanSalonuGoster(sahne,konuklar,()=>[],()=>yorumuSoyle(yorum),t.dekorlar??[],bas===3,()=>0);
    for(const yer of sahne.querySelectorAll<HTMLButtonElement>('button.yan-salon-masa')){
      const teslimMasasi=yer.dataset.menu==='teslim-'+menu.id;
      yer.disabled=!teslimMasasi;
      yer.querySelector('.yan-istek')?.remove();
      if(teslimMasasi){
        yer.setAttribute('aria-label',misafirAdi(sofradaki)+' servis yorumunu dinle');
        yer.append(h('span.yan-servis-tabaklari',{},...menu.parcalar.map(p=>sunulanTabak(p,masa,a.servis)??gida(p))));
      }
    }
    sahne.dataset.sonucSalonu='';
  }
  if(masa.sunuldu){
    const tatli=menuTatlisi(menu);
    if(ziyaret?.yeniPul&&tatli)sahne.append(pulDefteriDugmesi(t.pastane,tatli,ziyaret.yeniPul));
    if(masa.sonKazanc!==undefined)sahne.append(btn(masa.sonKazanc+' jeton kazanıldı, Tatlı Atölyesini aç','servis-jetonu',a.atolye,jetonSimge(),h('span',{},'+'+masa.sonKazanc),ikon('ileri')));
    ust.querySelector('h2')?.replaceChildren(ikon('yildiz'),h('span',{'aria-label':'Tepsi puanı'},tadim.toplam+' / '+tadim.tamPuan));
    const kapanis=ziyaret&&t.gun.ziyaret>=GUNDEKI_MUSTERI;
    sahne.append(btn(kapanis?'Günü kapat':ziyaret?'Sıradaki müşteriyi karşıla':'Başka bir müşteri seç','tepsi-yeni',()=>{
      if(!sahne.isConnected||sahne.dataset.salon==='cikis')return;
      const salondanAyril=sahne.dataset.salon==='servis'&&ziyaret;
      if(kapanis){
        const once=t.ustalik.kazanilan.length;
        gunOdulleriniAc(t.ustalik,t.gun.no);t.gun.kapandi=true;
        if(t.ustalik.kazanilan.length>once&&a.sesli())efekt.kilitAcildi();
      }
      else if(ziyaret)restoranAc(t,true,a.yeniMasaTezgahi);
      else if(t.yanMasadan){t.ekran='fisler';if(masa.servisKoltugu!==undefined)t.servisSalonu=masa.servisKoltugu>=3;}
      else restoranKapisi(t,a.yeniMasaTezgahi);
      if(salondanAyril){
        a.yaz();sus();sahne.replaceChildren();
        salonuKur(sahne,sofradaki,salondanAyril.sira,'cikis',a.sesli,a.ciz,birlikte&&!masa.teslimAlan);
      }else guncelle();
    },kapanis?ikon('ay'):ziyaret?misafirResmi(sonrakiMenu(t).misafir,'istek'):img(fis),ikon('ileri')));
  }else if(tadim.toplam>0){
    const sirali=!!ziyaret&&hazir&&menu.parcalar.length===2&&tatliMi(menu.parcalar[1]);
    const bahce=menu.id==='bahce-tabagi'&&hazir;
    let sunuluyor=false;
    async function sun(){
      if(!menu||!masa||masa.sunuldu||sunuluyor)return;
      sunuluyor=true;
      const ani=ziyaret?await sofraKopyasi(masa):undefined;
      if(!sahne.isConnected||masa.sunuldu)return;
      masa.piknikte=false;delete masa.arabada;delete masa.araba;delete masa.aileMasada;delete masa.siraliMasada;masa.sunuldu=true;
      const koltuk=t.salonKoltuklari?.indexOf(menu.id)??-1;
      if(koltuk>=0){
        const alici=masa.teslimAlan;
        const yer=alici?t.salonKoltuklari!.findIndex(id=>id&&menuBul(id)?.misafir===alici):koltuk;
        masa.servisKoltugu=yer<0?koltuk:yer;
        const teslimId=t.salonKoltuklari![masa.servisKoltugu];
        t.salonKoltuklari![masa.servisKoltugu]=null;
        if(teslimId&&t.salonBekleme)delete t.salonBekleme[teslimId];
        if(teslimId&&teslimId!==menu.id){
          delete t.masalar[teslimId];
          a.yeniMasaTezgahi(teslimId);
        }
      }
      const tamamlanan=tadimSonucu(masa,menu.parcalar);
      const deger=servisKazanci(masa,menu.parcalar);
      masa.sonKazanc=Math.max(0,deger-(masa.odenen??0));
      masa.odenen=Math.max(masa.odenen??0,deger);t.jeton+=masa.sonKazanc;
      if(ziyaret||koltuk>=0)t.gun.kazanc+=masa.sonKazanc;
      if((ziyaret&&!ziyaret.sayildi)||koltuk>=0){

        t.itibar=Math.max(0,Math.min(100,(t.itibar??50)+(tamamlanan.yildiz-2)*5));
      }
      if(ziyaret){
        if(ani)sofrayiHatirla(t,menu.id,ani,ziyaret.sira);
        if(!ziyaret.sayildi){
          ziyaret.sayildi=true;t.gun.ziyaret++;
          const tatli=menuTatlisi(menu);
          const tatliSunuldu=!!(tatli&&masa.tabaklar[tatli]);
          ustalikServisi(t.ustalik,tatliSunuldu&&!masa.servisHatali,menu.parcalar.length>=2&&hazir&&!masa.servisHatali);
          if(tatli&&tatliSunuldu&&!masa.servisHatali)ziyaret.yeniPul=pulEkle(t.pastane,tatli);
        }
      }
      t.rekorlar[menu.id]=Math.max(t.rekorlar[menu.id]??0,tamamlanan.toplam);
      if(tamamlanan.yildiz===3)a.dogru();else if(a.sesli())efekt.tink();
      guncelle();
      const servisSahnesi=alan.querySelector<HTMLElement>('.tepsi-sahnesi');
      servisSahnesi?.classList.add('tepsi-yeni-servis');
      const ilkLokma=tadim.tabaklar.find(tabak=>tabak.puan>0);
      const yemek=ilkLokma&&servisSahnesi?.querySelector<HTMLElement>('[data-parca="'+ilkLokma.parca+'"][data-hazir=true]');
      if(masa.servisHatali){yorumuSoyle(yorum);return;}
      if(ziyaret&&!sirali&&servisSahnesi&&ilkLokma&&yemek){
        servisSahnesi.classList.add('restoran-ilk-tadim');
        lokmaSun(servisSahnesi,yemek,ilkLokma.parca,puan,()=>{
          servisSahnesi.classList.remove('restoran-ilk-tadim');
          if(servisSahnesi.isConnected)yorumuSoyle(yorum);
        },false,aile&&ilkLokma.parca==='icecek'?'anne':undefined);
      }else yorumuSoyle(yorum);
    }
    function sofrayaGec(alanMisafir?:SiparisMisafiri){
      if(alanMisafir&&alanMisafir!==menu!.misafir){masa!.servisHatali=true;masa!.teslimAlan=alanMisafir;void sun();return;}
      if(sirali){masa!.siraliMasada=true;delete masa!.arabada;delete masa!.araba;guncelle();return;}
      if(aile&&ziyaret){masa!.aileMasada=true;masa!.aileServisi??=[];delete masa!.arabada;delete masa!.araba;guncelle();}
      else void sun();
    }
    if(sirali&&ziyaret&&masa.siraliMasada){
      sahne.replaceChildren(musteri);
      salonuKur(sahne,menu.misafir,ziyaret.sira,'servis',a.sesli);
      siraliServis(sahne,masa.sunumSirasi??0,{
        hatali:()=>{masa.servisHatali=true;void sun();},sira:menu.parcalar,adi:porsiyonAdi,puani:p=>tadim.tabaklar.find(x=>x.parca===p)?.puan??3,
        hazirlanan:p=>{
          const yemek=masa.tabaklar[p];
          const lokmalar=yemek&&yemek!==true&&'resim' in yemek?lokmaliPorsiyon(yemek):undefined;
          return lokmalar??sunulanTabak(p,masa,a.servis)??gida(p);
        },
        istenen:p=>gida(p,menu.id,true),
        tadildi:tadimiSakla,
        kaydet:evre=>{masa.sunumSirasi=evre;a.yaz();},geri:()=>{delete masa.siraliMasada;guncelle();},
        bitir:()=>void sun(),
      });
      return ()=>{};
    }
    if(aile&&ziyaret&&masa.aileMasada){
      sahne.replaceChildren();
      salonuKur(sahne,menu.misafir,ziyaret.sira,'bekleme',a.sesli,undefined,true);
      return aileMasasi(sahne,masa,p=>sunulanTabak(p,masa,a.servis)??gida(p),a.yaz,()=>{delete masa.aileMasada;guncelle();},sun,a.sesli);
    }
    if(hazir&&!masa.piknikte){
      const koltuk=t.salonKoltuklari?.indexOf(menu.id)??-1;
      const porsiyonlar=menu.parcalar.map(p=>sunulanTabak(p,masa,a.servis)??gida(p));
      const icecegiDuzelt=()=>{
        if(menu.smoothie&&masa.smoothie&&(masa.icecekPuani??3)<3)
          sahne.append(btn('Meyve karışımı yeniden hazırla','salon-icecek-duzelt',()=>tekrarPis('icecek'),ikon('tekrar')));
      };
      if(koltuk>=0){
        let bas=koltuk<3?0:3;
        sahne.replaceChildren();
        const gec=dugme('','salon-gecis');
        const goster=()=>{
          const masalar=t.salonKoltuklari!.slice(bas,bas+3).map(id=>id?menuBul(id):undefined);
          yanSalonuGoster(sahne,masalar,m=>m.parcalar.map(p=>gida(p,m.id,true)),
            m=>sofrayaGec(m.misafir),t.dekorlar??[],bas===3,id=>t.salonBekleme?.[id]??0);
          gec.className='salon-gecis '+(bas===0?'salon-saga':'salon-sola');
          gec.setAttribute('aria-label',bas===0?'Tepsiyle servis salonuna geç':'Tepsiyle yan salona dön');
          gec.replaceChildren(ikon(bas===0?'ileri':'geri'));
          gec.hidden=bas===(koltuk<3?0:3)&&!t.salonKoltuklari!.slice(3-bas,6-bas).some(Boolean);
        };
        gec.onclick=()=>{bas=3-bas;goster();};
        goster();
        const tabak=dugme('Yemeği masaya götür','salonda-servis-et',...porsiyonlar);
        tabak.setAttribute('aria-pressed','false');
        sahne.append(tabak,gec);
        icecegiDuzelt();
        const hedef=(yer:Nokta)=>Array.from(sahne.querySelectorAll<HTMLButtonElement>('button.yan-salon-masa:enabled')).find(m=>icinde(m,yer));
        const birak=()=>{tabak.style.translate='';sahne.querySelector('[data-servis-hedefi]')?.removeAttribute('data-servis-hedefi');};
        const sec=()=>{
          const secili=tabak.classList.toggle('servis-elde');
          tabak.setAttribute('aria-pressed',String(secili));
          sahne.toggleAttribute('data-tabak-elde',secili);
        };
        jest(tabak,{
          tasi:(yer,ilk)=>{
            tabak.style.translate='calc(-50% + '+(yer.x-ilk.x)+'px) '+(yer.y-ilk.y)+'px';
            sahne.querySelector('[data-servis-hedefi]')?.removeAttribute('data-servis-hedefi');
            const masa=hedef(yer);if(masa)masa.dataset.servisHedefi='';
          },
          birak:(yer,_ilk,tik)=>{
            const masa=hedef(yer);
            birak();
            if(tik)sec();else masa?.click();
          },
          iptal:birak,klavye:sec
        });
        window.addEventListener('sef-salon-degisti',goster);
        return ()=>window.removeEventListener('sef-salon-degisti',goster);
      }else if(!masa.arabada){
        sahne.replaceChildren(ust);
        ust.querySelector('h2')!.textContent=misafirAdi(menu.misafir);
        const kapat=salonSahnesiniKur(sahne,menu.misafir,ziyaret?.sira??0,'bekleme',a.sesli,undefined,birlikte);
        const fon=sahne.querySelector('.salon-dekor');
        for(const id of t.dekorlar??[])fon?.append(dekorResmi(id,'salon-susu salon-'+id));
        sahne.querySelector('.salon-sohbet')?.remove();
        for(const oyuncu of sahne.querySelectorAll<HTMLElement>('.salon-figur')){
          const kim=oyuncu.classList.contains('salon-arkadas')?(menu.misafir==='corba'?'kino':'anne'):menu.misafir;
          const sec=dugme(misafirAdi(kim)+' masasına götür','salon-servis-hedefi');
          jest(sec,{birak:(_yer,_ilk,tik)=>{if(tik)sofrayaGec(kim);},klavye:()=>sofrayaGec(kim)});
          oyuncu.querySelector('.restoran-oyuncu-bedeni')!.append(sec);
        }
        const servis=dugme('Tepsiyi müşteriye sun','salonda-servis-et',...porsiyonlar);
        const hedefler=Array.from(sahne.querySelectorAll<HTMLButtonElement>('.salon-servis-hedefi'));
        const servisiBirak=()=>{
          servis.style.translate='';
          for(const hedef of hedefler)hedef.removeAttribute('data-tabak-hedefi');
        };
        jest(servis,{
          tasi:(yer,ilk)=>{
            servis.style.translate='calc(-50% + '+(yer.x-ilk.x)+'px) '+(yer.y-ilk.y)+'px';
            for(const hedef of hedefler)hedef.toggleAttribute('data-tabak-hedefi',icinde(hedef,yer));
          },
          birak:(yer,_ilk,tik)=>{
            servisiBirak();
            if(tik)sofrayaGec();
            else hedefler.find(hedef=>icinde(hedef,yer))?.click();
          },
          iptal:servisiBirak,klavye:()=>sofrayaGec()
        });
        dekoruKoy(sahne,t.ustalik,'vazo');
        dekoruKoy(servis,t.ustalik,'pecete');
        sahne.append(servis);
        icecegiDuzelt();
        if(ziyaret&&!bahce&&!aile&&!sirali){
          sahne.append(btn('Servis arabasıyla götür','tepsi-araba-sec',()=>{
            masa.arabada=true;masa.araba={x:15,yuklu:false};guncelle();
          },arabaIsareti()));
        }
        if(bahce)sahne.append(btn('Piknik sepetini hazırla','tepsi-araba-sec',()=>{
          masa.piknikte=true;masa.piknik??={esya:[]};guncelle();
        },piknikIsareti()));
        return kapat;
      }else{
        const geri=()=>{
          delete masa.arabada;
          if(ziyaret)ziyaret.evre='mutfak';
          else if(menu.id.startsWith('raf-'))t.ekran='kapali';
          else masaGeri(t);
          guncelle();
        };
        sahne.replaceChildren(arabaliServis(menu.misafir,ziyaret?.sira??0,porsiyonlar,
          masa.araba??={x:15,yuklu:true},a.yaz,geri,sofrayaGec,a.sesli));
        if(bahce)sahne.append(btn('Piknik sepetini hazırla','tepsi-araba-sec',()=>{
          masa.piknikte=true;masa.piknik??={esya:[]};guncelle();
        },piknikIsareti()));
      }
      return ()=>{};
    }
    if(bahce&&masa.piknikte){
      const esyalar=menu.parcalar.map(p=>({
        id:p,ad:ad[p],ciz:()=>{
          const yemek=tabaklar.querySelector('[data-parca="'+p+'"]')?.firstElementChild;
          return yemek instanceof HTMLElement?yemek.cloneNode(true) as HTMLElement:gida(p);
        }
      }));
      const kayit=masa.piknik??={esya:[]};
      sahne.replaceChildren(piknigeHazirla(kayit,esyalar,a.yaz,()=>{masa.piknikte=false;guncelle();},sun,()=>{if(a.sesli())efekt.yapis();}));
      return ()=>{};
    }
    const zil=btn(bahce?'Piknik sepetini hazırla':'Tepsiyi müşteriye sun','tepsi-servis',()=>{
      if(bahce){masa.piknikte=true;masa.piknik??={esya:[]};guncelle();return;}
      if(hazir){sofrayaGec();return;}
      if(sahne.querySelector('dialog[open]'))return;
      const soru=h('dialog.tepsi-erken',{'aria-label':'Eksik tepsiyi sunmak ister misin?'});
      const kapat=()=>{soru.close();soru.remove();zil.focus();};
      const bekle=btn('Mutfağa dön ve tamamla','tepsi-tamamla',kapat,ikon('geri'),gida(eksik!.parca));
      const ver=btn('Eksik tepsiyi şimdi sun','tepsi-simdi',()=>{soru.close();soru.remove();sofrayaGec();},resim('servis-zili'),ikon('ileri'));
      soru.addEventListener('cancel',e=>{e.preventDefault();kapat();});
      soru.append(bekle,ver);sahne.append(soru);soru.showModal();
      a.soyle('Tepside eksik var. Hazırlamaya devam edebilir ya da şimdi sunabilirsin.');
    },bahce?piknikIsareti():resim('servis-zili'));
    sahne.append(zil);
  }
  return ()=>{};
}
export function masaGeri(t:Tepsiler){
  if(t.masalar[t.secili]?.siraliMasada){delete t.masalar[t.secili].siraliMasada;return;}
  if(t.masalar[t.secili]?.aileMasada){delete t.masalar[t.secili].aileMasada;return;}
  if(t.masalar[t.secili]?.arabada){t.masalar[t.secili].arabada=false;return;}
  if(t.gun.kutlamada){t.gun.kutlamada=false;return;}
  if(t.masalar[t.secili]?.piknikte){t.masalar[t.secili].piknikte=false;return;}
  if(t.ekran==='fisler'&&t.servisSalonu){delete t.servisSalonu;return;}
  if(t.ekran==='fisler'&&t.yanMasadan&&t.restoran){delete t.yanMasadan;t.secili=t.restoran.menuId??aktifMenu(t).id;t.restoranda=true;t.ekran='masa';return;}
  if(t.oynanan){delete t.oynanan;t.ekran='masa';}
  else t.ekran=t.ekran==='masa'&&!t.restoranda&&t.yanMasadan?'fisler':'kapali';
}
