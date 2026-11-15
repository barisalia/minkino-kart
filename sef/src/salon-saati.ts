import {aktifMenu,menuBul,type Tepsiler} from './tepsi-fisleri';

const sira=['tavsan-salata','seftali-makarna','zipzip-makarna','bulut-krep','fiyonk-sis','kahvalti','susamli-simit','pizza-molasi'];

export function salonSaatiniIlerlet(t:Tepsiler){
  const sonuc:{gelen?:string;ayrildi:string[];bekleyen:{id:string;sure:number}[];kaydet:boolean}={
    ayrildi:[],bekleyen:[],kaydet:false
  };
  if(!t.restoran||t.gun.kapandi||t.pastane.acik||(t.ekran==='kapali'&&!t.oynanan))return sonuc;
  const anaMenu=aktifMenu(t);
  const koltuklar=t.salonKoltuklari??=Array(6).fill(null);
  const bekleme=t.salonBekleme??={};
  for(const [yer,id] of koltuklar.entries()){
    if(!id)continue;
    if(id===anaMenu.id){
      // An old save can share a ticket between the main table and a side room.
      koltuklar[yer]=null;
      delete bekleme[id];
      sonuc.kaydet=true;
      continue;
    }
    if(id===t.secili&&(t.ekran==='masa'||t.oynanan))continue;
    const sure=bekleme[id]=(bekleme[id]??0)+5;
    if(sure<125){
      sonuc.bekleyen.push({id,sure});
      if(sure%30===0)sonuc.kaydet=true;
      continue;
    }
    koltuklar[yer]=null;
    delete bekleme[id];
    delete t.masalar[id];
    t.itibar=Math.max(0,(t.itibar??50)-5);
    sonuc.ayrildi.push(id);
    sonuc.kaydet=true;
  }
  const sayi=t.konukSirasi??0;
  const aralik=sayi===0?5:25-(t.itibar??50)/5;
  t.salonGelisSn=Math.min(aralik,(t.salonGelisSn??0)+5);
  if(koltuklar.filter(Boolean).length>=2||t.salonGelisSn<aralik||sonuc.ayrildi.length)return sonuc;
  const tercih=t.yanMasadan&&t.ekran==='fisler'?(t.servisSalonu?3:0):sayi%2*3;
  const bas=koltuklar.slice(tercih,tercih+3).some(Boolean)?3-tercih:tercih;
  const sonucMasasi=t.ekran==='masa'&&t.masalar[t.secili]?.sunuldu?t.masalar[t.secili]:undefined;
  const sonMasa=sonucMasasi?.servisKoltugu;
  const yemekYiyen=sonucMasasi&&(sonucMasasi.teslimAlan??menuBul(t.secili)?.misafir);
  const yer=[0,1,2].map(i=>bas+(Math.floor(sayi/2)+i)%3).find(i=>!koltuklar[i]&&i!==sonMasa);
  const oturanlar=koltuklar.map(id=>id?menuBul(id)?.misafir:undefined);
  const gelen=sira.map((_,i)=>sira[(sayi+i)%sira.length]).find(id=>{
    const kim=menuBul(id)!.misafir;
    return kim!==anaMenu.misafir&&kim!==yemekYiyen&&!oturanlar.includes(kim)&&id!==t.secili;
  });
  if(gelen&&yer!==undefined){
    koltuklar[yer]=gelen;
    bekleme[gelen]=0;
    t.salonGelisSn=0;
    t.konukSirasi=sayi+1;
    sonuc.gelen=gelen;
    sonuc.kaydet=true;
  }
  return sonuc;
}
