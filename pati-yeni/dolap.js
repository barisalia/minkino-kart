import {kaldirildi} from './kaldirilan-giysiler.js';
import {baslikAdlari} from './basliklar.js';
const kesimler=['atki','fular','yelek','papatya','cilekli','ormanci','pelerin','gece-pelerini'];
const adlar={
 kopek:['Gezinti düğümü','Liman yakası','İzci cepliği','Güneş yakası','Pati fuları','Orman ceketi','Akşam pelerini','Kutup yıldızı frakı'],
 kedi:['Çıngırak yakası','Mercan düğümü','Fare cepli yelek','Papatya yakası','Gül fiyonk','Kitapçı bolerosu','Ay bolerosu','Kırlangıç frakı'],
 tavsan:['Yonca yakası','Havuç önlüğü','Bahçıvan tulumu','Taç yaprak yaka','Çilek önlüğü','Tohum cepliği','Menekşe pelerini','Ay yaprağı'],
 hamster:['Kayısı kravatı','Çekirdek önlüğü','Kiraz tulumu','Bal fiyonk','Tomurcuk yakası','Palamut cepliği','Fındık pelerini','Kayan yıldız önlüğü'],
 kus:['Mercan papyon','Deniz kravatı','Kaptan kravatı','Hasır şapka','Gül papyon','Koru kravatı','Mor papyon','Gece beresi'],
 civciv:['Mercan papyon','Deniz kravatı','Kaptan kravatı','Hasır şapka','Gül papyon','Koru kravatı','Mor papyon','Gece beresi'],
 ordek:['Mercan papyon','Deniz kravatı','Kaptan kravatı','Hasır şapka','Gül papyon','Koru kravatı','Mor papyon','Gece beresi'],
 kirpi:['Palamut bağı','Akçaağaç yakası','Yaprak yeleği','Mantar yakası','Yaban mersini önlüğü','Koru cepliği','Kestane pelerini','Orman yıldızı'],
 geko:['Mercan bağı','Sarmal yaka','Turkuaz kuşak','Yaprak yaka','Çilek bağı','Gezgin kuşağı','Hilal örtüsü','Meteor kuşağı'],
 kaplumbaga:['Kayısı bağı','Gölet yakası','Düğün çiçeği örtüsü','Saz yakası','Çiçek bağı','Yaprak kabuk örtüsü','Ay kabuk örtüsü','Güneş kabuk örtüsü']
};
const ozelKesim={
 kopek:['Bulut yağmurluğu','Pilot ceketi','Pusula yeleği','Bando ceketi','Çiçek tulumu','Korucu ceketi'],
 kedi:['Sütçü önlüğü','Ressam gömleği','Sihirbaz bolerosu','Dalga ceketi','Buz çiçeği','Güneş ceketi'],
 tavsan:['Mantar önlüğü','Çilek tulumu','Çan çiçeği','Havuç cepliği','Süsen pelerini','Çan çiçeği ceketi'],
 hamster:['Fındık önlüğü','Turp önlüğü','Palamut yeleği','Kiraz tuniği'],
 kus:['Kaptan şapkası','Kaptan şapkası','Kaptan şapkası','Kaptan şapkası','Kaptan şapkası','Kaptan şapkası'],
 civciv:['Kaptan şapkası','Kaptan şapkası','Kaptan şapkası'],
 ordek:['Kaptan şapkası','Kaptan şapkası','Kaptan şapkası','Kaptan şapkası','Kaptan şapkası','Kaptan şapkası'],
 kirpi:['Elma yakası','Çiy damlası','Meşe yaprağı'],
 geko:['Limon kuşağı','Çöl gezgini','Dalga kuşağı'],
 kaplumbaga:['Gölet nilüferi','Nehir örtüsü','Güneş kabuğu']
};
export function giysiAdi(model,key){if(key==='baslik')return baslikAdlari[model.tur];return key==='imza'?ozelKesim[model.tur]?.[model.temel]:adlar[model.tur]?.[kesimler.indexOf(key)];}

// Each animal has a small rail. Earlier purchases stay available to their owner.
export function dolapta(model,key,sahip=[]){
 if(kaldirildi(model,key)||!giysiAdi(model,key))return false;
 if(sahip.includes(key)||key==='baslik')return true;
 if(['geko','kirpi','hamster'].includes(model.tur))return false;
 if(['kus','civciv','ordek'].includes(model.tur))return ['atki','imza'].includes(key);
 return key==='imza'||key==='fular';
}
