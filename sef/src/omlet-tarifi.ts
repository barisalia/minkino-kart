import type {Yildiz} from './yemekler';

export const omletIcleri=['peynir','domates','biber','mantar','zeytin'] as const;
export type OmletIci=typeof omletIcleri[number];
export type OmletKivami='yumusak'|'altin'|'koyu';
export const omletAdlari={peynir:'Peynir',domates:'Domates',biber:'Yeşil biber',mantar:'Mantar',zeytin:'Zeytin'};
export const omletKivamAdlari={yumusak:'Yumuşak',altin:'Altın renginde',koyu:'Fazla kızarmış'};
export interface OmletParcasi {tur:OmletIci;x:number;y:number}
export interface Omlet {
  evre:'kir'|'cirp'|'dok'|'ic'|'pisir'|'sun';
  yumurta:number; cirpma:number; icler:OmletParcasi[]; sure:number;
}
export const yeniOmlet=():Omlet=>({evre:'kir',yumurta:0,cirpma:0,icler:[],sure:0});
export function omletIstegi(id:string):{icler:readonly OmletIci[];kivam:OmletKivami}{
  return id==='anne-omleti'?{icler:['biber','mantar'],kivam:'yumusak'}:{icler:['peynir','domates'],kivam:'altin'};
}
export function omletKivami(ms:number):OmletKivami{return ms<4400?'yumusak':ms<8500?'altin':'koyu';}
export function omletPuani(t:Omlet,id:string):Yildiz{
  const istek=omletIstegi(id);
  const gercek=new Set(t.icler.map(m=>m.tur));
  const fark=omletIcleri.filter(ic=>gercek.has(ic)!==istek.icler.includes(ic)).length;
  return Math.max(1,3-fark-Number(omletKivami(t.sure)!==istek.kivam)) as Yildiz;
}
export const omletSolunda=(x:number,y:number)=>x>=5&&x<=50&&((x-50)/46)**2+((y-50)/46)**2<=1;
export function omletiOku(ham?:Partial<Omlet>):Omlet|undefined{
  if(!ham||typeof ham!=='object')return;
  const t=yeniOmlet();
  const sinir=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,v)):0;
  t.yumurta=Math.floor(sinir(ham.yumurta,2));if(t.yumurta<2)return t;
  t.cirpma=sinir(ham.cirpma,1);t.evre='cirp';if(t.cirpma<1)return t;
  t.evre='dok';if(!['ic','pisir','sun'].includes(ham.evre??''))return t;
  t.evre='ic';
  if(Array.isArray(ham.icler))t.icler=ham.icler.slice(0,8).filter(m=>m&&omletIcleri.includes(m.tur)&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&omletSolunda(m.x,m.y)).map(m=>({...m}));
  if(t.icler.length&&(ham.evre==='pisir'||ham.evre==='sun')){
    t.sure=sinir(ham.sure,10000);t.evre=ham.evre==='sun'&&t.sure>=1400?'sun':'pisir';
  }
  return t;
}
