import {sutlacDesenleri,type SutlacPorsiyonu,type SutlacDeseni} from './sutlac-tarifi';
import {kremaEksigi,type KurabiyeTepsisi} from './kurabiye-tepsisi';
import {kekFarki,type KekFisi,type KekPorsiyonu} from './minik-kek';
import {tartEksigi,tartIstegi,type TartDilimi,type TartIstegi} from './tart-tarifi';
import type {DondurmaTadi,KurabiyeSekli,TatliCesidi} from './tatli-ekonomi';
import type {Yildiz} from './yemekler';

export interface TatliIstek {
  sutlacIstegi?:SutlacDeseni;
  dondurmaIstegi?:DondurmaTadi;
  kurabiyeIstegi?:KurabiyeSekli;
  kekFisi?:KekFisi;
  tartIstegi?:TartIstegi;
}
interface Porsiyon {sutlac?:SutlacPorsiyonu;puan:Yildiz;tat?:DondurmaTadi;sekil?:KurabiyeSekli;kek?:KekPorsiyonu;kurabiye?:KurabiyeTepsisi;tart?:TartDilimi[]}
export function tatliSiparisPuani(tur:TatliCesidi,p:Porsiyon,istek:TatliIstek):Yildiz{
  let eksik=0;
  if(tur==='sutlac')eksik=Number(p.sutlac?.desen!==(istek.sutlacIstegi??'yildiz'));
  if(tur==='dondurma')eksik=Number((p.tat??'cilek')!==(istek.dondurmaIstegi??'cilek'));
  if(tur==='kurabiye'){
    const sekil=istek.kurabiyeIstegi??'yildiz';
    eksik=Number((p.sekil??'yildiz')!==sekil)+(p.kurabiye?kremaEksigi(p.kurabiye,sekil):0);
  }
  if(tur==='meyveli-tart')eksik=tartEksigi(p.tart??tartIstegi(),istek.tartIstegi??'bahce');
  if(tur==='minik-kek')eksik=p.kek?kekFarki(p.kek,istek.kekFisi??'cilek'):Number((istek.kekFisi??'cilek')!=='cilek');
  return Math.max(1,p.puan-eksik) as Yildiz;
}

export function hazirlamaHatasi(tur:TatliCesidi,p:Porsiyon,istek:TatliIstek,fazlaPisti:boolean){
  // Older plates have only their final mark. Preserve the preparation part when
  // changing a decoration, so the same flavour mismatch is deducted only once.
  const istekPuani=tatliSiparisPuani(tur,{...p,puan:3},istek);
  return Math.min(2,Math.max(Number(fazlaPisti),istekPuani-p.puan));
}

function siradaki<T>(secenekler:readonly T[],onceki:T|undefined,hazir:T[],ilk:boolean):T {
  // A first-time customer teaches the basic recipe. A return visit alternates even
  // when the number of guests per day is divisible by the number of flavours.
  if(ilk)return secenekler[0];
  const i=secenekler.indexOf(onceki??secenekler[0]);
  const donus=[...secenekler.slice(i+1),...secenekler.slice(0,i+1)];
  return donus.find(t=>t!==onceki&&hazir.includes(t))??donus[0];
}
export function siradakiTatliIstegi(tur:TatliCesidi,onceki:TatliIstek|undefined,stok:Porsiyon[],ilk:boolean):TatliIstek{
  if(tur==='sutlac')return {sutlacIstegi:siradaki(sutlacDesenleri,onceki?.sutlacIstegi,stok.flatMap(p=>p.sutlac?[p.sutlac.desen]:[]),ilk)};
  if(tur==='dondurma')return {dondurmaIstegi:siradaki(['cilek','vanilya','cikolata'],onceki?.dondurmaIstegi,stok.map(p=>p.tat??'cilek'),ilk)};
  if(tur==='kurabiye')return {kurabiyeIstegi:siradaki(['yildiz','kalp','yuvarlak'],onceki?.kurabiyeIstegi,stok.map(p=>p.sekil??'yildiz'),ilk)};
  if(tur==='minik-kek'){
    const secenekler=['cilek','orman','muz'] as const;
    const stokta=secenekler.filter(f=>stok.some(p=>p.kek&&kekFarki(p.kek,f)===0));
    return {kekFisi:siradaki(secenekler,onceki?.kekFisi,stokta,ilk)};
  }
  const secenekler=['bahce','mor','gunes'] as const;
  const stokta=secenekler.filter(f=>stok.some(p=>tartEksigi(p.tart??tartIstegi(),f)===0));
  return {tartIstegi:siradaki(secenekler,onceki?.tartIstegi,stokta,ilk)};
}
