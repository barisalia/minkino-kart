import {sutlacPorsiyonunuOku,sutlacHazirlamaPuani,type SutlacPorsiyonu} from './sutlac-tarifi';
import {kekPorsiyonunuOku,type KekPorsiyonu} from './minik-kek';
import {kurabiyeTepsisiniOku,type KurabiyeTepsisi} from './kurabiye-tepsisi';
import {tartDiziliminiOku,type TartDilimi} from './tart-tarifi';
import {susBul} from './susleme-katalog';
import type {TatliTaslagi} from './tatli-atolyesi';
import {tatliMi,type TatliCesidi} from './tatli-ekonomi';
import type {Yildiz} from './yemekler';
import {kurabiyeSekliniOku,type KurabiyeSekli,tabakRengi,dondurmaTadiniOku,type DondurmaTadi,type TabakRengi} from './tatli-ekonomi';
export interface TatliPorsiyonu {sutlac?:SutlacPorsiyonu;kek?:KekPorsiyonu;kurabiye?:KurabiyeTepsisi;tart?:TartDilimi[];sekil?:KurabiyeSekli;puan:Yildiz;tabak:TabakRengi;fazlaPisti?:boolean;sus?:string;tat?:DondurmaTadi}

export interface Pastane {
  acik:boolean;
  pullar:Partial<Record<TatliCesidi,number>>;
  tezgah?:TatliCesidi;
  taslaklar:Partial<Record<TatliCesidi,TatliTaslagi>>;
  vitrin:Partial<Record<TatliCesidi,TatliPorsiyonu[]>>;
}
export function bosPastane():Pastane{return {acik:false,taslaklar:{},vitrin:{},pullar:{}};}

export function pastaneyiOku(eski:Partial<Pastane>|undefined,acikTarifler:readonly string[]):Pastane{
  const p=bosPastane();
  if(!eski||typeof eski!=='object')return p;
  p.acik=eski.acik===true;
  for(const id of acikTarifler){
    if(!tatliMi(id))continue;
    const adet=eski.pullar?.[id];
    if(typeof adet==='number'&&Number.isSafeInteger(adet)&&adet>0)p.pullar[id]=Math.min(id==='sutlac'?3:25,adet);
    const stok=eski.vitrin?.[id];
    if(Array.isArray(stok))p.vitrin[id]=stok.flatMap<TatliPorsiyonu>(v=>{
      if(id==='sutlac'){
        const sutlac=sutlacPorsiyonunuOku(v?.sutlac);
        return sutlac?[{sutlac,puan:sutlacHazirlamaPuani(sutlac),tabak:tabakRengi(v.tabak)}]:[];
      }
      const puan=typeof v==='number'?v:v?.puan;
      return puan===1||puan===2||puan===3?[{puan,...(id==='minik-kek'&&v?.kek?{kek:kekPorsiyonunuOku(v.kek)}:{}),...(id==='meyveli-tart'?{tart:tartDiziliminiOku(v?.tart)}:{}),...(id==='kurabiye'?{sekil:kurabiyeSekliniOku(v?.sekil),kurabiye:v?.kurabiye?kurabiyeTepsisiniOku(v.kurabiye,3):undefined}:{}),tabak:tabakRengi(v?.tabak),fazlaPisti:v?.fazlaPisti===true,sus:susBul(v?.sus)?.id,tat:id==='dondurma'?dondurmaTadiniOku(v?.tat):undefined}]:[];
    });
    const taslak=eski.taslaklar?.[id];
    if(taslak&&typeof taslak==='object')p.taslaklar[id]=taslak;
    if(p.acik&&eski.tezgah===id)p.tezgah=id;
  }
  return p;
}
export function vitrineKoy(p:Pastane,id:TatliCesidi,puan:Yildiz,tabak:TabakRengi,fazlaPisti=false,sus?:string,tat?:DondurmaTadi,sekil?:KurabiyeSekli,tart?:TartDilimi[],kurabiye?:KurabiyeTepsisi,kek?:KekPorsiyonu,sutlac?:SutlacPorsiyonu){
  (p.vitrin[id]??=[]).push({puan,tabak,fazlaPisti,sus,tat,sekil,tart,kurabiye,kek,...(sutlac?{sutlac}:{})});
  delete p.taslaklar[id];delete p.tezgah;
}
