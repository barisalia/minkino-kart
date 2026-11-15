export const krepMeyveAdlari={cilek:'Çilek',muz:'Muz',yabanmersini:'Yaban mersini',kivi:'Kivi',seftali:'Şeftali',frambuaz:'Ahududu',armut:'Armut',kiraz:'Kiraz',mandalina:'Mandalina'};
export type KrepMeyvesi=keyof typeof krepMeyveAdlari;
export const krepIstekleri = [
  {meyveler:['cilek','cilek','muz'],cumle:'Krebime iki çilek dilimi ve bir muz dilimi koyar mısın?'},
  {meyveler:['muz','muz','yabanmersini'],cumle:'Krebime iki muz dilimi ve bir yaban mersini koyar mısın?'},
  {meyveler:['kivi','kivi','seftali'],cumle:'Krebime iki kivi dilimi ve bir şeftali dilimi koyar mısın?'},
] as const;

export function krepDilimEslesmeleri(istenen: readonly string[], konan: readonly string[]) {
  const kalan = [...konan];
  return istenen.map(meyve => {
    const sira = kalan.indexOf(meyve);
    if (sira < 0) return false;
    kalan.splice(sira, 1);
    return true;
  });
}

export type KrepKizarmasi='erken'|'iyi'|'fazla'|'yanik';
export type KrepSunumu='acik'|'yarim';
export interface KrepParcasi {meyve:KrepMeyvesi;x:number;y:number}
export interface KrepPorsiyonu { kizarma:KrepKizarmasi; sunum?:KrepSunumu; parcalar:KrepParcasi[] }
export function krepPorsiyonunuOku(p?:KrepPorsiyonu){
  if(!p||!['erken','iyi','fazla','yanik'].includes(p.kizarma)||(p.sunum!==undefined&&p.sunum!=='acik'&&p.sunum!=='yarim')||
    !Array.isArray(p.parcalar)||p.parcalar.length!==3||!p.parcalar.every(m=>m&&Object.hasOwn(krepMeyveAdlari,m.meyve)&&
    Number.isFinite(m.x)&&Number.isFinite(m.y)&&m.x>=0&&m.x<=100&&m.y>=0&&m.y<=100))return;
  return p;
}
export function servisKompozisyonu(parcalar: readonly KrepParcasi[],kizarma:KrepKizarmasi,sunum?:KrepSunumu) {
  const poz=(id:string,k:KrepKizarmasi)=>k==='iyi'?id:id+'-'+k;
  const katmanlar: Array<{id:string; x:number; y:number; boy:number; don:number}> = [
    {id:'tabak', x:.5, y:.5, boy:.98, don:0},
    {id:poz('krep-katli',kizarma), x:.49, y:.52, boy:.70, don:-8},
  ];
  if(sunum){
    const yarim=sunum==='yarim';
    katmanlar[1]={id:poz(yarim?'krep-yari':'krep-pismis',kizarma),x:.5,y:.5,boy:.72,don:0};
    for(const [i,p] of parcalar.entries()){
      katmanlar.push({id:p.meyve,x:.5+(p.x-50)*.0074,y:yarim?.335:.5+(p.y-50)*.0074,boy:yarim?.115:.165,don:(i-1)*12});
    }
    if(yarim)katmanlar.push(katmanlar.splice(1,1)[0]);
    return katmanlar;
  }
  const dizili = [...parcalar].sort((a,b) => a.x-b.x);
  const noktalar = [{x:.36,y:.62},{x:.52,y:.49},{x:.65,y:.38}];
  dizili.forEach((p,i)=>{
    const n=noktalar[i];
    katmanlar.push({id:p.meyve,x:n.x+(p.x-50)/500,y:n.y+(p.y-50)/470,boy:.17,don:(i-1)*8});
  });
  return katmanlar;
}
