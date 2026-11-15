import type {PizzaKesimi} from './pizza-kesimi';
export const CESITLER = ['peynir', 'biber', 'mantar', 'domates', 'zeytin', 'kabak', 'ananas', 'feslegen', 'sogan', 'patlican', 'misir'] as const;
export type Cesit = typeof CESITLER[number];
export const ISIM: Record<Cesit, string> = {peynir:'Peynir', biber:'Biber', mantar:'Mantar', domates:'Domates', zeytin:'Siyah zeytin', kabak:'Kabak', ananas:'Ananas', feslegen:'Fesleğen', sogan:'Mor soğan', patlican:'Patlıcan',misir:'Mısır'};
export type PizzaMisafiri = 'pizza'|'salata'|'corba'|'baba';
export const TARAFLAR = ['sol', 'sag'] as const;
export type Taraf = typeof TARAFLAR[number];
type Yarilar = Record<Taraf, readonly Cesit[]>;
type Miktarlar = Partial<Record<Cesit,1|2|3>>;
export type PizzaSosu='domates'|'feslegen';
export const sosAdi:Record<PizzaSosu,string>={domates:'Domates sosu',feslegen:'Fesleğen sosu'};
export interface PizzaFisi { miktarlar?:Miktarlar; malzemeler: readonly Cesit[]; haric?:Cesit; yarilar?:Yarilar; sos?:PizzaSosu }
export const pestoFisi:PizzaFisi={malzemeler:['peynir','domates','zeytin'],sos:'feslegen'};
export const kirmiziFis:PizzaFisi={malzemeler:['mantar','misir'],sos:'domates'};
export const misirliFis:PizzaFisi={malzemeler:['misir','peynir','domates'],haric:'zeytin'};
export const bolusmeFisi=paylas(['mantar','biber'],['misir','peynir']);
function paylas(sol: readonly Cesit[], sag: readonly Cesit[]):PizzaFisi {
  return {malzemeler:[...new Set([...sol,...sag])], yarilar:{sol,sag}};
}
export const FISLER: readonly PizzaFisi[] = [
  {malzemeler:['peynir','biber','mantar']},
  {malzemeler:['peynir','domates','feslegen'],haric:'mantar'},
  {malzemeler:['ananas','peynir'],haric:'zeytin'},
  {malzemeler:['zeytin','sogan','domates']},
  paylas(['mantar'],['biber']),
  {malzemeler:['kabak','biber','patlican'],haric:'sogan'},
  {malzemeler:['mantar','zeytin','peynir','feslegen']},
  {malzemeler:['domates','patlican'],haric:'biber'},
  {malzemeler:['ananas','biber','sogan']},
  paylas(['domates','peynir'],['zeytin']),
  {malzemeler:['kabak','feslegen','peynir'],haric:'ananas'},
  {malzemeler:['peynir','zeytin'],haric:'sogan'},
  {malzemeler:['patlican','sogan','mantar','domates']},
  {malzemeler:['kabak','ananas','biber'],haric:'mantar'},
  paylas(['kabak'],['ananas','sogan']),
  {malzemeler:['mantar','biber'],miktarlar:{mantar:2,biber:1}},
  {malzemeler:['domates','peynir'],miktarlar:{domates:3,peynir:2}},
  {malzemeler:['kabak','zeytin'],miktarlar:{kabak:1,zeytin:3}},
  misirliFis,bolusmeFisi,
  pestoFisi,kirmiziFis,
];
export function fisCumlesi(fis:PizzaFisi) {
  const sos=fis.sos?sosAdi[fis.sos]+' sürer misin? ':'';
  if(fis.miktarlar){
    const sayilar=['','bir','iki','üç'];
    const liste=fis.malzemeler.map(id=>(fis.miktarlar?.[id]?sayilar[fis.miktarlar[id]!]+' dilim ':'')+ISIM[id].toLocaleLowerCase('tr'));
    return sos+'Pizzama '+liste.join(' ve ')+' koyar mısın?';
  }
  if(fis.yarilar){
    const oku=(id:Cesit)=>ISIM[id].toLocaleLowerCase('tr');
    return sos+'Sol yarıya '+fis.yarilar.sol.map(oku).join(' ve ')+', sağ yarıya '+fis.yarilar.sag.map(oku).join(' ve ')+' koyar mısın?';
  }
  const adlar=fis.malzemeler.map(id=>ISIM[id].toLocaleLowerCase('tr'));
  return sos+'Pizzama '+adlar.slice(0,-1).join(', ')+' ve '+adlar.at(-1)+' koyar mısın?'+(fis.haric?' '+ISIM[fis.haric]+' istemiyorum.':'');
}
export interface PizzaParcasi { cesit: Cesit; x: number; y: number }
export const CESIT_BASINA_DILIM=6;
/** İlk dilim parmağın altında kalır. Serpilen diğerleri aynı bölgenin boş yerlerine düşer. */
export function porsiyonKoy(ust:readonly PizzaParcasi[],cesit:Cesit,merkez:{x:number;y:number},adet:1|3,ikiYari:boolean):PizzaParcasi[] {
  const kalan=CESIT_BASINA_DILIM-ust.filter(d=>d.cesit===cesit).length;
  if(kalan<=0)return [];
  const ilk={cesit,...kenaraAl(merkez)};
  const yeni=[ilk];
  if(adet===1)return yeni;
  const taraf=pizzaTarafi(ilk.x);
  const adaylar:PizzaParcasi[]=[];
  for(const mesafe of [21,29]){
    for(let i=0;i<12;i++){
      const aci=(i*30+ust.length*17)*Math.PI/180;
      const x=ilk.x+mesafe*Math.cos(aci),y=ilk.y+mesafe*Math.sin(aci);
      if(Math.hypot(x-50,y-50)>34 || (ikiYari&&(pizzaTarafi(x)!==taraf||Math.abs(x-50)<7)))continue;
      adaylar.push({cesit,x,y});
    }
  }
  while(yeni.length<Math.min(kalan,adet)&&adaylar.length){
    const dolu=[...ust,...yeni];
    let iyi=0,enGenis=-1;
    for(const [i,a] of adaylar.entries()){
      let bosluk=Infinity;
      for(const p of dolu)bosluk=Math.min(bosluk,(p.x-a.x)**2+(p.y-a.y)**2);
      if(bosluk>enGenis+.1){iyi=i;enGenis=bosluk;}
    }
    yeni.push(adaylar.splice(iyi,1)[0]);
  }
  return yeni;
}
export type PizzaKivami = 'erken'|'tam'|'fazla'|'yanik';
export interface PizzaTabagi { kesim?:PizzaKesimi; tarifId: 'pizza'; no: number; ust: PizzaParcasi[]; fis?:PizzaFisi; sosCesidi?:PizzaSosu; pisirme?:1|2|3; kivam?:PizzaKivami; istekPuani?:1|2|3; puan?:1|2|3 }
/** Fişin servis edilmiş örneği: yarılar ve adetler çocuğun tabağıyla aynı ölçekte. */
export function fisOrnegi(fis:PizzaFisi):PizzaParcasi[] {
  if(fis.yarilar)return TARAFLAR.flatMap(t=>{
    const turler=fis.yarilar![t];
    const noktalar=[[16,24],[27,1],[15,-24],[7,5],[9,-11],[10,18]];
    return noktalar.slice(0,turler.length===1?3:6).map(([dx,dy],i)=>({
      cesit:turler[i%turler.length],x:t==='sol'?50-dx:50+dx,y:50+dy
    }));
  });
  const dilimler:Cesit[]=[];
  for(let tur=0;tur<3;tur++)for(const id of fis.malzemeler)if(tur<(fis.miktarlar?.[id]??3))dilimler.push(id);
  return dilimler.map((cesit,i)=>{
    const aci=i*2.39996-.6;
    const yaricap=32*Math.sqrt((i+.5)/dilimler.length);
    return {cesit,x:50+Math.cos(aci)*yaricap,y:50+Math.sin(aci)*yaricap};
  });
}
// Eski kayıtlar yalnızca sıra numarası saklıyordu. O güne ait fiş bu dört tariften biridir.
export const SIPARISLER: readonly (readonly Cesit[])[] = [
  ['peynir', 'biber', 'mantar'], ['peynir', 'mantar', 'domates'],
  ['peynir', 'biber', 'domates'], ['mantar', 'biber', 'domates'],
];
export function fisiOku(ham:PizzaFisi|undefined):PizzaFisi|undefined {
  if(!Array.isArray(ham?.malzemeler)||!ham.malzemeler.length||!ham.malzemeler.every(id=>CESITLER.includes(id)))return;
  const malzemeler=[...new Set<Cesit>(ham.malzemeler)];
  const sos=ham.sos==='feslegen'||ham.sos==='domates'?ham.sos:undefined;
  const haric=ham.haric&&CESITLER.includes(ham.haric)&&!malzemeler.includes(ham.haric)?ham.haric:undefined;
  const yarilar=ham.yarilar;
  if(yarilar && TARAFLAR.every(t=>Array.isArray(yarilar[t]) && yarilar[t].length &&
    yarilar[t].every(id=>malzemeler.includes(id))) && malzemeler.every(id=>TARAFLAR.some(t=>yarilar[t].includes(id))))
    return {...paylas(yarilar.sol,yarilar.sag),haric,sos};
  const miktarlar:Miktarlar={};
  for(const id of malzemeler){
    const n=ham.miktarlar?.[id];
    if(n===1||n===2||n===3)miktarlar[id]=n;
  }
  return Object.keys(miktarlar).length?{malzemeler,haric,miktarlar,sos}:{malzemeler,haric,sos};
}
export function pizzaFarki(ust:readonly PizzaParcasi[],istek:readonly Cesit[]) {
  const kullanilan=new Set(ust.map(v=>v.cesit));
  return {eksik:istek.filter(id=>!kullanilan.has(id)),fazla:[...kullanilan].filter(id=>!istek.includes(id))};
}
export function pizzaIstekPuani(ust:readonly PizzaParcasi[],istek:readonly Cesit[]):1|2|3 {
  const {eksik,fazla}=pizzaFarki(ust,istek);
  const fark=eksik.length+fazla.length;
  return fark===0?3:fark===1?2:1;
}
export const pizzaTarafi=(x:number):Taraf=>x<50?'sol':'sag';
export function yanlisYaridakiMalzemeler(ust:readonly PizzaParcasi[],fis:PizzaFisi) {
  const yarilar=fis.yarilar;
  return yarilar ? fis.malzemeler.filter(id=>{
    const dilimler=ust.filter(d=>d.cesit===id);
    return dilimler.length>0 && TARAFLAR.some(t=>dilimler.some(d=>pizzaTarafi(d.x)===t)!==yarilar[t].includes(id));
  }) : [];
}
export function pizzaMiktarFarki(ust:readonly PizzaParcasi[],fis:PizzaFisi) {
  return fis.malzemeler.flatMap(cesit=>{
    const istenen=fis.miktarlar?.[cesit];
    if(!istenen)return [];
    const konan=ust.filter(p=>p.cesit===cesit).length;
    return konan===istenen?[]:[{cesit,istenen,konan}];
  });
}
export function fisPuani(ust:readonly PizzaParcasi[],fis:PizzaFisi,sos:PizzaSosu='domates'):1|2|3 {
  const {eksik,fazla}=pizzaFarki(ust,fis.malzemeler);
  const eksikTur=eksik.filter(id=>!fis.miktarlar?.[id]).length;
  const dilimFarki=pizzaMiktarFarki(ust,fis).reduce((toplam,v)=>toplam+Math.abs(v.istenen-v.konan),0);
  const fark=eksikTur+fazla.length+dilimFarki+yanlisYaridakiMalzemeler(ust,fis).length+Number(!!fis.sos&&fis.sos!==sos);
  return fark===0?3:fark===1?2:1;
}
export const pizzaToplamPuani=(pisirme:1|2|3,uyum:1|2|3):1|2|3=>Math.floor((pisirme+uyum)/2) as 1|2|3;
export const pizzaPuani=(k:PizzaKivami):1|2|3=>k==='tam'?3:k==='yanik'?1:2;
export const pizzaKivami=(ms:number):PizzaKivami=>ms<3400?'erken':ms<16500?'tam':ms<26500?'fazla':'yanik';

/** Üzerindeki malzemenin tamamı dairenin içinde kalır. Konumlar pizza çapına göre yüzde cinsindendir. */
export function kenaraAl(n: { x: number; y: number }) {
  const x = n.x - 50, y = n.y - 50;
  const oran = Math.min(1, 34 / Math.max(1, Math.hypot(x, y)));
  return { x: 50 + x * oran, y: 50 + y * oran };
}
export function parcalariOku(ham: unknown, cesitler: readonly Cesit[] = CESITLER): PizzaParcasi[] {
  const sonuc: PizzaParcasi[] = [];
  for (const p of Array.isArray(ham) ? ham : []) {
    if (!p || !cesitler.includes(p.cesit) || !Number.isFinite(p.x) || !Number.isFinite(p.y) ||
      sonuc.filter(v => v.cesit === p.cesit).length>=CESIT_BASINA_DILIM) continue;
    sonuc.push({ cesit: p.cesit, ...kenaraAl(p) });
  }
  return sonuc;
}
export function pizzaTabaginiOku(ham: unknown): PizzaTabagi | undefined {
  if (!ham || typeof ham !== 'object') return;
  const p = ham as Partial<PizzaTabagi>;
  if (p.tarifId !== 'pizza' || typeof p.no !== 'number' || !Number.isSafeInteger(p.no) || p.no < 1) return;
  const ust = parcalariOku(p.ust);
  if (!ust.length) return;
  const tabak:PizzaTabagi={tarifId:'pizza',no:p.no,ust};
  if(Array.isArray(p.kesim?.kesikler)&&p.kesim.kesikler.includes('yatay')&&p.kesim.kesikler.includes('dikey'))tabak.kesim={kesikler:['dikey','yatay']};
  if(p.kivam&&['erken','tam','fazla','yanik'].includes(p.kivam)){
    tabak.kivam=p.kivam;tabak.pisirme=pizzaPuani(p.kivam);
  }else if(p.pisirme===1||p.pisirme===2||p.pisirme===3)tabak.pisirme=p.pisirme;
  tabak.fis=fisiOku(p.fis)??{malzemeler:SIPARISLER[(p.no-1)%SIPARISLER.length]};
  tabak.sosCesidi=p.sosCesidi==='feslegen'?'feslegen':'domates';
  tabak.istekPuani=fisPuani(ust,tabak.fis,tabak.sosCesidi);
  tabak.puan=pizzaToplamPuani(tabak.pisirme??3,tabak.istekPuani);
  return tabak;
}
