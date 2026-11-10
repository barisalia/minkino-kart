// Base IDs are also the keys of animals already owned in the original save.
const families = [
 ['kopek','Köpek','ev',10,2,['Fındık','Bulut','Tarçın','Zeytin','Pamuk','Gölge']],
 ['kedi','Kedi','ev',18,3,['Gümüş Tekir','Sarman','Duman Tekir','Van','Ankara','Siyam']],
 ['tavsan','Tavşan','bahce',25,4,['Pamuk','Bal Köpüğü','Gümüş','Aslanbaş','Alaca Lop','Rex']],
 ['balik','Japon balığı','golet',14,2,['Altın','İnci','Mercan']],
 ['beta','Beta balığı','golet',36,5,['Yelpaze','Safir','Menekşe','Lavanta']],
 ['hamster','Hamster','ev',22,3,['Bal','Kül','Kakao','Karamel']],
 ['kus','Kuş','bahce',28,4,['Fıstık','Gök Mavi','Lila','Sultan','Sevda','Kanarya']],
 ['civciv','Civciv','bahce',30,4,['Limon','Krem','Tarçın']],
 ['ordek','Ördek','bahce',32,5,['Kehribar','Yeşilbaş','Kar Beyazı','Tepeli','Alacalı','Kaşık Gaga']],
 ['kaplumbaga','Kaplumbağa','teraryum',38,5,['Zeytin','Yeşim','Amber']],
 ['kirpi','Kirpi','bahce',42,6,['Kestane','Gümüş','Tarçın']],
 ['geko','Geko','teraryum',48,6,['Nane','Mandalina','Turkuaz']]
];

export const cesitler = {};
export const aileler = {};
const renkler = ['Kestane','Krem','Sis','Kayısı','Duman','Kakao','Bal','Gece','İnci'];
const imzalar = {
 kopek:'Güneş Yelesi', kedi:'Çilli Sarman', tavsan:'Şafak Lop', balik:'Güneş Kuyruk',
 beta:'Güneş Yelpazesi', hamster:'Bal Badem', kus:'Güneş Kanadı', civciv:'Gün Işığı',
 ordek:'Sedef Gaga', kaplumbaga:'Güneş Kabuğu', kirpi:'Bal Dikeni', geko:'Kum Sultanı'
};
const unvanlar={
 kopek:['Koru Bekçisi','Ay Patili'],kedi:['Kestane Bıyık','Ay Işığı'],tavsan:['Fındık Kulak','Ay Çöreği'],
 balik:['Mercan Yüzgeç','Sedef Pul'],beta:['Bakır Tül','Ay Peçesi'],hamster:['Fındık Yanak','Ay Çekirdeği'],
 kus:['Koru Ezgisi','Ay Kanadı'],civciv:['Bal Köpüğü','Ay Pamuğu'],ordek:['Sazlık Gezgini','Ay Gölgesi'],
 kaplumbaga:['Koru Kabuğu','Gümüş Ada'],kirpi:['Kestane Tacı','Ay Dikeni'],geko:['Kum Gezgini','Ay Beneği']
};
const premium = ['Bronz','Gümüş','Altın'];
const metalFiyat = [2,3,5];
const keyFor = (tur,index) => index ? tur+'-'+(index+1) : tur;
for (const [tur, ad, ortam, taban, , isimler] of families) {
 const adet = ['kopek','kedi'].includes(tur) ? 50 : 20;
 const ids = [];
 for(let index=0;index<adet;index++){
  const id=keyFor(tur,index);
  const tier=index-(adet-3);
  const temel=tur==='kedi' && tier===1 ? 3 : index%isimler.length;
  const seri=Math.floor(index/isimler.length);
  const renk=renkler[seri-1];
  const kok=isimler[temel].replace(/^(Gümüş |Altın )/u,'');
  const adNormal=isimler[index] ?? (renk===kok?renk+' Alaca':renk+' '+kok);
  const isim=tier===2?imzalar[tur]:tier>=0?unvanlar[tur][tier]:adNormal;
  const siradanTavan=taban+(adet-4)*(taban+4);
  const fiyat=tier<0?taban+index*(taban+4):siradanTavan*metalFiyat[tier];
  const model={id,tur,ad:isim,index,ortam,fiyat,temel,seri,tabanId:keyFor(tur,temel),
   madalya:premium[tier]||'',sogukDirenci:[.15,.30,.45][tier]||0,gelir:Math.ceil(fiyat/8),satis:Math.ceil(fiyat*.8)};
  cesitler[id]=model;ids.push(id);
 }
 aileler[tur]={ad,ortam,ids};
}
