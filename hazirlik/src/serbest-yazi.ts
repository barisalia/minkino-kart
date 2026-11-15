import type { Nokta } from './defter';
import { yazilar, yolNoktalari } from './yazi-yollari';

export type MeyveIsareti='2'|'L'|'A';
export interface LimonKarti {
  meyve:'armut'|'limon';
  asama:'kapali'|'sayi'|'harf'|'bitti';
  yardim:boolean;
  izler:Record<MeyveIsareti,Nokta[][]>;
}
export const bosLimon=():LimonKarti=>({meyve:'armut',asama:'kapali',yardim:false,izler:{'2':[],L:[],A:[]}});
export const meyveKarti=(k:LimonKarti)=>k.meyve==='limon'
  ?{isim:'Limon',sanat:'meyve-5',harf:'L',ses:'limon',harfSesi:'le'} as const
  :{isim:'Armut',sanat:'sergi-armut',harf:'A',ses:'armut_karti',harfSesi:'a'} as const;
export function limonuOku(a?:Partial<LimonKarti>){
  const k=bosLimon();if(!a)return k;
  if(a.asama==='sayi'||a.asama==='harf'||a.asama==='bitti')k.asama=a.asama;
  if(a.meyve==='limon'||(!a.meyve&&k.asama!=='kapali'))k.meyve='limon';
  k.yardim=a.yardim===true;
  for(const key of ['2','L','A'] as const){
    const izler=a.izler?.[key];
    if(!Array.isArray(izler))continue;
    k.izler[key]=izler.slice(0,40).filter(n=>Array.isArray(n)&&n.length>1&&n.length<=450&&
      n.every(p=>Array.isArray(p)&&p.length===2&&p.every((x,i)=>Number.isFinite(x)&&x>=0&&x<=(i?232:240))));
  }
  return k;
}
function sinir(n:Nokta[]){
  let sol=Infinity,ust=Infinity,sag=-Infinity,alt=-Infinity;
  for(const [x,y] of n){sol=Math.min(sol,x);ust=Math.min(ust,y);sag=Math.max(sag,x);alt=Math.max(alt,y)}
  return {sol,ust,w:sag-sol,h:alt-ust};
}
// Serbest sayfada konum ve büyüklük çocuğa ait. Ayrı kalem hareketlerinin arasına çizgi eklenmez.
export function yaziyiOku(izler:Nokta[][],key:MeyveIsareti):'hazir'|'kopru'|'tekrar'{
  const cerceve=sinir(izler.flat());
  if(cerceve.h<32||cerceve.w<14)return 'tekrar';
  const oran=cerceve.w/cerceve.h;
  if(oran<(key==='2'?.32:.23)||oran>1.65)return 'tekrar';
  const parcalar=yazilar[key].yollar.map(yolNoktalari),ornek=parcalar.flat(),hedef=sinir(ornek);
  const boy=(n:Nokta[])=>n.slice(1).reduce((l,p,i)=>l+Math.hypot(p[0]-n[i][0],p[1]-n[i][1]),0);
  const beklenen=parcalar.reduce((l,n)=>l+boy(n),0);
  const esle=([x,y]:Nokta):Nokta=>[hedef.sol+(x-cerceve.sol)*hedef.w/cerceve.w,hedef.ust+(y-cerceve.ust)*hedef.h/cerceve.h];
  const iz:Nokta[]=[];
  let uzunluk=0;
  for(const parca of izler){
    for(let i=1;i<parca.length;i++){
      const a=esle(parca[i-1]),b=esle(parca[i]),dx=b[0]-a[0],dy=b[1]-a[1];
      const boy=Math.hypot(dx,dy);uzunluk+=boy;
      if(uzunluk>beklenen*1.85)return 'tekrar';
      const adet=Math.ceil(boy/4);
      for(let n=1;n<=adet;n++)iz.push([a[0]+dx*n/adet,a[1]+dy*n/adet]);
    }
  }
  if(uzunluk<beklenen*.70)return 'tekrar';
  const yakinlik=(a:Nokta[],b:Nokta[])=>a.filter(p=>b.some(q=>(p[0]-q[0])**2+(p[1]-q[1])**2<=17**2)).length/a.length;
  if(yakinlik(iz,ornek)<.81||yakinlik(parcalar[0],iz)<.86)return 'tekrar';
  if(key==='A'&&yakinlik(parcalar[1],iz)<.9)return 'kopru';
  return 'hazir';
}
