export const oduller=[
  {id:'vazo',ad:'Çiçek vazosu',gun:1,hedef:1},
  {id:'pecete',ad:'Çizgili servis peçetesi',gun:2,hedef:2},
  {id:'rozet',ad:'Pastacı rozeti',gun:3,hedef:2},
] as const;
export type Esya=typeof oduller[number]['id'];
export interface Ustalik{
  tamMasa:number;
  tatli:number;
  kazanilan:Esya[];
  takili:Esya[];
}
export function bosUstalik():Ustalik{return {tamMasa:0,tatli:0,kazanilan:[],takili:[]};}
const sayac=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)?Math.min(2,Math.max(0,n)):0;
export function ustaligiOku(eski?:Partial<Ustalik>):Ustalik{
  const u=bosUstalik();
  if(!eski)return u;
  u.tamMasa=sayac(eski.tamMasa);u.tatli=sayac(eski.tatli);
  u.kazanilan=oduller.map(o=>o.id).filter(id=>Array.isArray(eski.kazanilan)&&eski.kazanilan.includes(id));
  u.takili=u.kazanilan.filter(id=>Array.isArray(eski.takili)&&eski.takili.includes(id));
  return u;
}
export function ustalikServisi(u:Ustalik,tatli:boolean,tamSofra:boolean){
  if(tatli)u.tatli=sayac(u.tatli+1);
  if(tamSofra)u.tamMasa=sayac(u.tamMasa+1);
}
export function ilerleme(u:Ustalik,id:Esya){return id==='vazo'?1:id==='pecete'?u.tamMasa:u.tatli;}
export function gunOdulleriniAc(u:Ustalik,gun:number){
  for(const o of oduller){
    if(!u.kazanilan.includes(o.id)&&gun>=o.gun&&ilerleme(u,o.id)>=o.hedef){
      u.kazanilan.push(o.id);u.takili.push(o.id);
    }
  }
}
