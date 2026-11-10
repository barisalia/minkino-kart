import {aileler,cesitler} from './cesitler.js';
const modeller = [
 {ad:'Fındık', tip:'findik', tuy:'#f0c78b', kulak:'#9d684b', acik:'#fff7e6', desen:'alacali', kulakTip:'sarkik', kuyruk:'uzun'},
 {ad:'Bulut', tip:'bulut', tuy:'#faf5e9', kulak:'#646873', acik:'#fffdf4', desen:'benekli', kulakTip:'dik', kuyruk:'kivrik'},
 {ad:'Tarçın', tip:'tarcin', tuy:'#d99554', kulak:'#a66d48', acik:'#ffedcc', desen:'duz', kulakTip:'dik', kuyruk:'uzun'},
 {ad:'Zeytin', tip:'zeytin', tuy:'#795750', kulak:'#513c37', acik:'#f2c9a2', desen:'duz', kulakTip:'sarkik', kuyruk:'uzun'},
 {ad:'Pamuk', tip:'pamuk', tuy:'#f6e7c8', kulak:'#dfc4a1', acik:'#fff7e7', desen:'duz', kulakTip:'sarkik', kuyruk:'kivrik'},
 {ad:'Gölge', tip:'golge', tuy:'#8c96a8', kulak:'#626a80', acik:'#e7e7eb', desen:'alacali', kulakTip:'dik', kuyruk:'uzun'}
];
const secenekler={desen:['duz','alacali','benekli'],kulakTip:['dik','sarkik'],kuyruk:['uzun','kivrik']};
function giydir(model,kayit){
 const kopek={...model};
 if(!kayit)return kopek;
 for(const alan of ['tuy','kulak','acik']){
  if(typeof kayit[alan]==='string'&&/^#[0-9a-f]{6}$/i.test(kayit[alan]))kopek[alan]=kayit[alan];
 }
 for(const [alan,degerler] of Object.entries(secenekler)){
  if(degerler.includes(kayit[alan]))kopek[alan]=kayit[alan];
 }
 return kopek;
}
let kayit=[];
try{
 const eski=JSON.parse(localStorage.getItem('pati-yeni-kopek-v1')||'[]');
 if(Array.isArray(eski))kayit=eski;
}catch{/* Kayıt okunamazsa altı başlangıç modeli kullanılabilir. */}
const paletler=[
 ['#a76643','#6c4638','#f5d6b1'],['#f5dcaf','#bd9267','#fff8df'],
 ['#adb3c1','#626b82','#f3f3f6'],['#eca777','#a7593e','#ffead3'],
 ['#858995','#444852','#dfdfdf'],['#997363','#583c37','#f4daca'],
 ['#e6b259','#91623d','#fff1bf'],['#55546a','#302f42','#c5becf']
];
export const kopekler=aileler.kopek.ids.map((id,i)=>{
 const {temel,seri,madalya,ad}=cesitler[id], model={...modeller[temel],ad};
 if(seri){
  if(!madalya)[model.tuy,model.kulak,model.acik]=paletler[seri-1];
  model.kuyruk=secenekler.kuyruk[(temel+seri)%2];
  model.kulakTip=secenekler.kulakTip[(temel+Math.floor(seri/2))%2];
  model.desen=secenekler.desen[(temel+seri)%3];
 }
 return giydir(model,kayit[i]);
});
