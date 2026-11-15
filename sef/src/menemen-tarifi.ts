export type MenemenEvre='dogra'|'sotele'|'kir'|'pisir'|'sun';
export type KahvaltiSebzesi='domates'|'biber'|'mantar';
export type MenemenKivami='sulu'|'tam'|'koyu';
export interface Menemen {
  evre:MenemenEvre;
  sebzeler:KahvaltiSebzesi[];
  tahtada?:KahvaltiSebzesi;
  kesik:number[];
  sote:number;
  yumurta:number;
  sure:number;
}
export const sebzeAdlari={domates:'Domates',biber:'Yeşil biber',mantar:'Mantar'} as const;
export const menemenIstegi=(id:string):{sebzeler:KahvaltiSebzesi[];kivam:MenemenKivami}=>({
  sebzeler:id==='sade-menemen'?['domates']:['domates','biber'],kivam:id==='sade-menemen'?'sulu':'tam',
});
export const yeniMenemen=():Menemen=>({evre:'dogra',sebzeler:[],kesik:[],sote:0,yumurta:0,sure:0});
export const menemenKivami=(sure:number):MenemenKivami=>sure<4500?'sulu':sure<10000?'tam':'koyu';
export function menemenHatasi(t:Menemen,id:string){
  const hedef=menemenIstegi(id);
  if(hedef.sebzeler.some(s=>!t.sebzeler.includes(s)))return 'eksik';
  if(t.sebzeler.some(s=>!hedef.sebzeler.includes(s)))return 'fazla';
  if(menemenKivami(t.sure)!==hedef.kivam)return t.sure<4500?'erken':'gec';
  return 'tam';
}
export function menemenPuani(t:Menemen,id:string):1|2|3{
  const hedef=menemenIstegi(id);
  const fark=Object.keys(sebzeAdlari).filter(s=>hedef.sebzeler.includes(s as KahvaltiSebzesi)!==t.sebzeler.includes(s as KahvaltiSebzesi)).length;
  return Math.max(1,3-fark-Number(menemenKivami(t.sure)!==hedef.kivam)) as 1|2|3;
}
export function menemenOku(v?:Partial<Menemen>):Menemen|undefined{
  if(!v||typeof v!=='object')return;
  const t=yeniMenemen(),say=(n:unknown,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(max,n)):0;
  const sebze=(s:unknown):s is KahvaltiSebzesi=>typeof s==='string'&&Object.hasOwn(sebzeAdlari,s);
  if(Array.isArray(v.sebzeler))t.sebzeler=[...new Set(v.sebzeler.filter(sebze))];
  if(sebze(v.tahtada)&&!t.sebzeler.includes(v.tahtada)){
    t.tahtada=v.tahtada;
    if(Array.isArray(v.kesik))t.kesik=[...new Set(v.kesik.filter(n=>Number.isInteger(n)&&n>=0&&n<3))];
  }
  if(!t.sebzeler.includes('domates')||!['sotele','kir','pisir','sun'].includes(v.evre??''))return t;
  delete t.tahtada;t.kesik=[];
  t.sote=say(v.sote,1);t.evre='sotele';
  if(t.sote<1||v.evre==='sotele')return t;
  t.evre='kir';t.yumurta=Math.floor(say(v.yumurta,2));
  if(t.yumurta<2)return t;
  t.evre='pisir';t.sure=say(v.sure,13000);
  if(v.evre==='sun'&&t.sure>=1600)t.evre='sun';
  return t;
}
