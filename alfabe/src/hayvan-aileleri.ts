type Aile=[ad:string,yavru:string,ipucu:string];
export const aileler:Record<string,Aile>={
  A:['Aslan','Aslan yavrusu','Kocaman bir yelem var. Kükreyince sesim çok uzağa gider.'],
  B:['Balina','Balina yavrusu','Denizde yaşarım. Nefes almak için suyun üstüne çıkarım.'],
  C:['Ceylan','Ceylan yavrusu','İnce bacaklarımla çayırda koşarım. Adım ceylan.'],
  Ç:['Çita','Çita yavrusu','Beneklerim var. Çok hızlı koşarım.'],
  D:['Deve','Köşek','Sırtımda hörgücüm var. Kumda yürürüm.'],
  E:['Eşek','Sıpa','Uzun kulaklarımı diker, anırırım.'],
  F:['Fil','Fil yavrusu','Uzun hortumumla su içerim. Kocaman kulaklarımı sallarım.'],
  G:['Geyik','Geyik yavrusu','Ormanda yaşarım. Dallara benzeyen boynuzlarım var.'],
  H:['Horoz','Civciv','Başımda kırmızı bir ibik var. Sabahları öterim.'],
  I:['Istakoz','Istakoz yavrusu','Denizin dibinde yürürüm. İki kıskacım var.'],
  İ:['İnek','Buzağı','Çayırda otlar, möö diye seslenirim.'],
  J:['Jaguar','Jaguar yavrusu','Benekli büyük bir kediyim. Adım jaguar.'],
  K:['Kelebek','Tırtıl','Renkli kanatlarımla çiçeklere konarım. Büyümeden önce bir tırtıldım.'],
  L:['Leylek','Leylek yavrusu','Uzun gagam, uzun bacaklarım var. Çatıda yuva kurabilirim.'],
  M:['Maymun','Maymun yavrusu','Dallara tutunup ağaçlara tırmanırım. Adım maymun.'],
  N:['Nil timsahı','Nil timsahı yavrusu','Pullarım ve uzun bir kuyruğum var. Nil Nehri’nde yüzerim.'],
  O:['Orangutan','Orangutan yavrusu','Turuncu tüylerim var. Uzun kollarımla dallara tutunurum.'],
  Ö:['Ördek','Ördek yavrusu','Perdeli ayaklarımla gölde yüzerim. Vak vak!'],
  P:['Penguen','Penguen yavrusu','Bir kuşum. Kanatlarımla suyun içinde yüzerim.'],
  R:['Rakun','Rakun yavrusu','Gözlerimin çevresinde koyu bir maske, kuyruğumda halkalar var.'],
  S:['Sincap','Sincap yavrusu','Kabarık kuyruğumla dallarda dengede dururum. Fındığa bayılırım.'],
  Ş:['Şahin','Şahin yavrusu','Kanatlarımı açıp gökte süzülürüm. Adım şahin.'],
  T:['Tavşan','Tavşan yavrusu','Uzun kulaklarımı diker, arka ayaklarımla hoplarım.'],
  U:['Uskumru','Uskumru yavrusu','Sırtım çizgili. Sürüyle yüzen bir balığım. Adım uskumru.'],
  Ü:['Üveyik','Üveyik yavrusu','Güvercine benzeyen bir kuşum. Adım üveyik.'],
  V:['Vaşak','Vaşak yavrusu','Kulaklarımın ucunda küçük siyah püsküller var.'],
  Y:['Yunus','Yunus yavrusu','Denizde sürümle yüzer, sudan sıçrarım. Adım yunus.'],
  Z:['Zebra','Zebra yavrusu','Atlara benzerim. Siyah beyaz çizgilerim var.'],
};
const dosyalar=import.meta.glob<string>('../../assets/alfabe/hayvan-cagirma/*.webp',{eager:true,query:'?url',import:'default'});
export function sahneResmi(ad:string){return dosyalar['../../assets/alfabe/hayvan-cagirma/'+ad+'.webp'];}
export function aileResmi(h:string,yavru:boolean){
  const kok=({A:'aslan',O:'orangutan',F:'fil'} as Record<string,string>)[h]??String(h.codePointAt(0));
  return sahneResmi(kok+(yavru?'-yavru':''));
}
export function yasamAlani(h:string){
  if('BIUY'.includes(h))return 'deniz';
  if(h==='P')return 'buz';
  return 'NÖL'.includes(h)?'kiyi':'orman';
}
