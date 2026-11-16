'use strict';
const yolKaydi='minkino-firtina-v2';
const ilkDurum=()=>({kuzu:'kuru',ekmek:'tam',mino:false,kaptan:false,islak:false,hazirlik:'',kaleIsigi:'',cifte:false});
const yollar={
  A1:{mino:true,cifte:true}, A2:{ekmek:'yarım'}, A3:{ekmek:'yarım'},
  B1:{kuzu:'ıslak',islak:true}, B2:{kuzu:'çamurlu'}, B3:{kuzu:'ıslak'},
  C:{kaptan:true}, C1:{ekmek:'yarım'}, C2:{cifte:true},
  P1:{hazirlik:'fener'}, P2:{hazirlik:'minder'}, P3:{hazirlik:'kurut',kuzu:'kuru'},
  '5A1':{kaleIsigi:'lamba'}, '5B2':{kaleIsigi:'fener'}
};
function uygun(when,d,unlocked){
  if(!when)return true;
  return {unlocked,dry:d.kuzu==='kuru',wet:d.kuzu==='ıslak',mud:d.kuzu==='çamurlu',damp:d.kuzu!=='kuru',
    full:d.ekmek==='tam',half:d.ekmek==='yarım',mino:d.mino,towel:d.islak,captain:d.kaptan,ordinary:!d.kaptan,
    light:d.hazirlik==='fener',cushion:d.hazirlik==='minder',lantern:d.kaleIsigi==='lamba',
    catSearch:d.hazirlik!=='fener'&&d.mino,soloSearch:d.hazirlik!=='fener'&&!d.mino,
    shareThree:d.ekmek==='yarım'&&d.mino}[when]===true;
}
function yolOku(steps,unlocked){
  let id='F1';const d=ilkDurum(),nodes=[id];
  for(const code of steps){
    const edge=sahneler[id].choices?.find(x=>x.c===code&&uygun(x.when,d,unlocked));
    if(!edge)throw Error('Geçersiz yol: '+code);
    Object.assign(d,yollar[code]);id=edge.to;nodes.push(id);
  }
  return {id,d,nodes};
}
const rozetler={S1:['Karanlık Avcısı','torch'],S2:['Sığınak Mimarı','buyuk-kale'],S3:['Fırtına Maestrosu','metal'],S4:['Küçük Kaptan','gunaydin']};
function hatiralar(d){
  return [[d.kuzu==='kuru'?'kuzy':d.kuzu==='ıslak'?'wety':'mudy','Kuzu '+d.kuzu],
    [d.ekmek==='tam'?'bread':'halfbread','Ekmek '+d.ekmek],...(d.mino?[['kedi-mont','Mino evde']]:[]),
    ...(d.kaptan?[['gunaydin','Kaptan Lokum']]:[])];
}

