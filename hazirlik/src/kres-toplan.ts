import type {Sabah} from './model';
import type {Bolge,KosedekiIsler,Tasima} from './kres-servis';
import {type Kose} from './kres-kaydi';
import {blok,tup,firca,suNesnesi,kayik,tohum} from './kres-oyuncaklari';
import {ibrik} from './okul-gunu';
import {tabak,katliPecete} from './cizim';
import {suBardagi} from './su-cizim';
import {konusmaTasi} from './kres-cember';
import {efekt} from '../../src/audio/efekt';

type Alan='yemek'|'atolye'|'oyuncak'|'dogadan'|'muzik'|'kitap';
type Resim=(ad:string)=>string;
type Esya={id:string;ad:string;resim:string};
const evler:Record<Kose,Alan>={
  cicekci:'dogadan',beste:'muzik','serbest-resim':'atolye',
  blok:'oyuncak',boyahane:'atolye','su-masasi':'dogadan',kagit:'atolye',bahce:'dogadan',paylas:'yemek','meyve-mutfagi':'yemek',gosteri:'muzik',muzik:'muzik',
  kolye:'atolye',pano:'atolye',harf:'atolye',beslenme:'yemek',lavabo:'yemek',oyku:'kitap',cember:'oyuncak',
};
const aileler:Record<Alan,string>={yemek:'Beslenme tepsisi',atolye:'Sanat kutusu',oyuncak:'Oyun sepeti',dogadan:'Doğa köşesi',muzik:'Çalgı kutusu',kitap:'Kitap rafı'};
const renkler:Record<Alan,string>={yemek:'#80c8be',atolye:'#f6b173',oyuncak:'#f2bf59',dogadan:'#91bf79',muzik:'#aaa1d4',kitap:'#7cbbc9'};
function esyalar(s:Sabah,res:Resim):Record<Alan,Esya[]>{
  const e=(id:string,ad:string,resim:string)=>({id,ad,resim});
  return {
    yemek:[e('bardak','Bardak',suBardagi(0)),e('pecete','Peçete',katliPecete)],
    atolye:[e('firca','Fırça',firca),e('boya','Boya tüpü',tup(s.kres.boyalar[0]||'sari')),e('kabuk','Deniz kabuğu',res('etkinlik/deniz-0')),e('boncuk','Boncuk',res('etkinlik/deniz-2')),e('kalem','Pastel boya',res('etkinlik/kalemlik-0')),e('kagit','Katlama kâğıdı',kayik(0))],
    oyuncak:[e('kare','Tahta kare',blok(1)),e('ucgen','Tahta üçgen',blok(2)),e('gunes','Konuşma taşı',konusmaTasi)],
    dogadan:[e('suluk','Sulama kabı',ibrik),e('tohum','Tohum',tohum),e('tas','Deney taşı',suNesnesi('tas')),e('yaprak','Yaprak',suNesnesi('yaprak'))],
    muzik:[e('marakas','Marakas',res('etkinlik/muzik-1')),e('davul','Davul',res('etkinlik/muzik-0'))],
    kitap:[e('oyku','Zıpzıp’ın öykü kitabı',kitap(res('kres/oyku-0'))),e('masal','Mino’nun masal kitabı',kitap(res('kres/oyku-1')))],
  };
}
const kitap=(ic:string)=>'<span class="kres-kitap">'+ic+'</span>';
function kasa(renk:string,alan:Alan,ornek:string,icindekiler:string[]){
  const ahsap=alan==='kitap';
  const dis='<svg viewBox="0 0 160 96" aria-hidden="true"><g stroke="#272321" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m8 41 10-21q2-5 10-5h106q6 0 8 5l10 21-10 43H19Z" fill="'+(ahsap?'#dfaf6d':renk)+'"/><path d="m10 42 18-18h102l20 18Z" fill="#f9e4b7"/><path d="m9 43 10 41q2 6 9 6h105q8 0 9-7l10-40Z" fill="'+renk+'"/><path d="M12 45h137" fill="none"/></g></svg>';
  return '<span class="kres-duzen-kasa">'+dis+'<span class="kres-duzen-dolgu">'+icindekiler.map(a=>'<i>'+a+'</i>').join('')+'</span><span class="kres-duzen-etiket">'+ornek+'</span></span>';
}
type Toplan={s:Sabah;bolge:Bolge;tasinabilir:Tasima;secili:()=>string|undefined;aktar:(id:string)=>void;res:Resim;
  is:KosedekiIsler;yenile:()=>void;ileri:(id:string,ad:string,yap:()=>void)=>void};
export function toplanAc({s,bolge,tasinabilir,secili,aktar,res,is,yenile,ileri}:Toplan){
  const k=s.kres,gruplar=esyalar(s,res);
  const tamListe=(Object.keys(gruplar) as Alan[]).flatMap(alan=>gruplar[alan].map(esya=>({alan,esya})));
  if(!k.duzenPlani.length){
    const alanlar=[...new Set(k.biten.map(c=>evler[c]))].slice(-3);
    while(alanlar.length<2)alanlar.push(alanlar.includes('atolye')?'oyuncak':'atolye');
    const secilen=alanlar.flatMap(alan=>{
      const esya=gruplar[alan];
      if(alan==='atolye'&&!k.biten.includes('boyahane')&&!k.biten.includes('serbest-resim'))return k.biten.includes('kolye')?esya.slice(2,4):esya.slice(4,6);
      if(alan==='dogadan'&&!k.biten.includes('bahce'))return esya.slice(2,4);
      if(alan==='oyuncak'&&k.biten.includes('cember'))return [esya[0],esya[2]];
      return esya.slice(0,2);
    });
    const dizim=secilen.length===6?[2,5,0,3,1,4]:[2,0,3,1];
    k.duzenPlani=dizim.map(i=>secilen[i].id);
    if(s.toplanan.length)k.duzenBitti=k.duzenPlani.slice(0,Math.min(k.duzenPlani.length,new Set(s.toplanan).size));
    is.kaydet();
  }
  const olan=tamListe.filter(e=>k.duzenPlani.includes(e.esya.id));
  const gunAlanlari=[...new Set(olan.map(e=>e.alan))];
  const etiketler:Record<Alan,string>={yemek:tabak,atolye:firca,oyuncak:blok(2),dogadan:suNesnesi('yaprak'),muzik:res('etkinlik/muzik-1'),kitap:kitap(res('kres/oyku-0'))};
  gunAlanlari.forEach((alan,i)=>{
    const x=gunAlanlari.length===3?20+30*i:31+38*i,hedef='kutu-'+alan;
    const dolgu=olan.filter(e=>e.alan===alan&&k.duzenBitti.includes(e.esya.id)).map(e=>e.esya.resim);
    bolge(hedef,aileler[alan],kasa(renkler[alan],alan,etiketler[alan],dolgu),[x,44,22,25],()=>{
      if(secili())aktar(hedef);else is.soyle('kres_kutu_'+alan);
    },'kres-duzen-hedef',[x,47,gunAlanlari.length===3?30:36,15]);
  });
  k.duzenPlani.forEach((id,i)=>{
    const d=olan.find(v=>v.esya.id===id);
    if(!d||k.duzenBitti.includes(id))return;
    const n=k.duzenPlani.length;
    tasinabilir('duzen-'+id,d.esya.ad,d.esya.resim,[18+i*(64/(n-1)),75+(i%2)*5,11,17],
      [22+(i%3)*28,67+Math.floor(i/3)*14,20,11],['kutu-'+d.alan],()=>{
        k.duzenBitti.push(id);efekt.yapis();yenile();
        if(k.duzenBitti.length===n)is.soyle('kres_duzen_bitti');
      });
  });
  if(olan.every(d=>k.duzenBitti.includes(d.esya.id)))ileri('vedaya','Arkadaşlarınla vedalaş',()=>is.gir('ev-yolu'));
}
