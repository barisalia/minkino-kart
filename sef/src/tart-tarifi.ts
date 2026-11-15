import {h} from '../../src/ui/dom';

export const tartMeyveleri=['cilek','kivi','muz','yaban'] as const;
export type TartMeyvesi=typeof tartMeyveleri[number];
export type TartIstegi='bahce'|'mor'|'gunes';
export interface TartDilimi {meyve:TartMeyvesi;x:number;y:number}
export const tartMeyveAdi={cilek:'Çilek',kivi:'Kivi',muz:'Muz',yaban:'Yaban mersini'};
export const tartIsteginiOku=(v:unknown):TartIstegi=>v==='mor'||v==='gunes'?v:'bahce';
const fisler:Record<TartIstegi,readonly TartMeyvesi[]>={
  bahce:['cilek','cilek','cilek','kivi','kivi'],mor:['muz','muz','yaban','yaban','yaban'],gunes:['cilek','cilek','kivi','muz','muz'],
};
export const tartYerleri=[[27,41],[50,31],[74,41],[35,56],[64,56]] as const;
export const tartIstegi=(istek:TartIstegi='bahce'):TartDilimi[]=>fisler[istek].map((meyve,i)=>({meyve,x:tartYerleri[i][0],y:tartYerleri[i][1]}));
export function tartDiziliminiOku(v:unknown):TartDilimi[]|undefined{
  if(!Array.isArray(v))return;
  return v.slice(0,5).flatMap(d=>d&&tartMeyveleri.includes(d.meyve)&&Number.isFinite(d.x)&&Number.isFinite(d.y)
    &&tartUstunde(d.x,d.y)?[{meyve:d.meyve,x:Math.round(d.x*10)/10,y:Math.round(d.y*10)/10}]:[]);
}
export const tartUstunde=(x:number,y:number)=>((x-50)/36)**2+((y-46)/23)**2<=1.02;
export function tartEksigi(dilimler:TartDilimi[],istek:TartIstegi){
  const kalan=[...fisler[istek]];
  for(const {meyve} of dilimler){
    const yer=kalan.indexOf(meyve);
    if(yer>=0)kalan.splice(yer,1);
  }
  return kalan.length;
}
const gorseller=import.meta.glob<string>('../../assets/sef/tatli/tart-{cilek,kivi,muz,yaban,kremali,kremali-kavruk}.webp',{eager:true,query:'?url',import:'default'});
export const tartResmi=(id:TartMeyvesi|'kremali'|'kremali-kavruk')=>gorseller['../../assets/sef/tatli/tart-'+id+'.webp'];
export function tartMeyvesiniCiz(d:TartDilimi){
  const img=h('img.tart-dilimi',{src:tartResmi(d.meyve),alt:tartMeyveAdi[d.meyve],draggable:false,'data-meyve':d.meyve});
  img.style.left=d.x+'%';img.style.top=d.y+'%';return img;
}
export function meyveliTartGorseli(dilimler:TartDilimi[],fazlaPisti=false){
  return h('span.tart-tam-gorsel',{},h('img',{alt:'',src:tartResmi(fazlaPisti?'kremali-kavruk':'kremali')}),...dilimler.map(tartMeyvesiniCiz));
}
export function tartFisRozeti(istek:TartIstegi){
  const rozet=h('span.tart-fis-rozet',{role:'img'});
  const adetler:string[]=[];
  for(const m of tartMeyveleri){
    const n=fisler[istek].filter(id=>id===m).length;if(!n)continue;
    adetler.push(n+' '+tartMeyveAdi[m]);rozet.append(h('span',{'data-meyve':m,'data-adet':n},h('img',{alt:'',src:tartResmi(m)}),h('b',{},String(n))));
  }
  rozet.setAttribute('aria-label',adetler.join(', '));return rozet;
}
