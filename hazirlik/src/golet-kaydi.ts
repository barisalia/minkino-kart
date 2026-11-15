export type GoletKaydi={x:number;y:number;ahsap:boolean;kopruAcik:boolean;arkadaslar:number[];yuvada:boolean;tur:number};
export const ilkGolet=():GoletKaydi=>({x:34,y:76,ahsap:false,kopruAcik:false,arkadaslar:[],yuvada:false,tur:0});
export function goletiOku(g?:Partial<GoletKaydi>):GoletKaydi{
  const k=ilkGolet();if(!g)return k;
  const yuzde=(v:unknown,yok:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(9,Math.min(91,v)):yok;
  k.x=yuzde(g.x,k.x);k.y=yuzde(g.y,k.y);
  k.ahsap=g.ahsap===true;k.kopruAcik=g.kopruAcik===true;
  k.arkadaslar=Array.isArray(g.arkadaslar)?[...new Set(g.arkadaslar.filter(i=>[0,1,2].includes(i)))]:[];
  k.yuvada=g.yuvada===true&&k.arkadaslar.length===3;k.tur=g.tur===1?1:0;return k;
}
export const goletSozu=(g:GoletKaydi)=>g.yuvada?'kres_golet_bitti':g.arkadaslar.length===3?'kres_golet_yuva':'kres_golet_yavru';
