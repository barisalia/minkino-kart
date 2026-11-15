import {menemenSahani} from './menemen-gorseli';
import {durumTabagi} from './durum-gorseli';
import {tavukPorsiyonu} from './tavuk-porsiyonu';
import {omletTabagi} from './omlet-gorseli';
import {kumpirSunumu} from './kumpir-gorseli';
import {mantiSunumu} from './manti-tezgahi';
import {h} from '../../src/ui/dom';
import type {ServisKaydi} from './kayit';
import type {Masa,Parca,SofraAni} from './tepsi-fisleri';
import {menuBul,tadimSonucu} from './tepsi-fisleri';
import {misafirResmi} from './misafir';
import {tatliSunumu} from './tatli-sunumu';
import {tatliMi} from './tatli-ekonomi';
import {smoothieBardagi} from './smoothie/gorsel';
import {sicakSimit} from './simit-gorseli';
import {tostServisi} from './tost-gorseli';
import {tavukPuanResmi} from './tepsi-tavuk';
import {icecekBardagi,bosBardak} from './tepsi-icecek';

export function sunulanTabak(p:Parca,masa:Masa,cizim:(k:ServisKaydi)=>HTMLElement){
  const tabak=masa.tabaklar[p];
  if(!tabak)return;
  if(tabak!==true)return cizim(tabak);
  if(p==='menemen'&&masa.menemenServisi)return menemenSahani(masa.menemenServisi);
  if(p==='durum'&&masa.durumServisi)return durumTabagi(masa.durumServisi);
  if(p==='omlet'&&masa.omletServisi)return omletTabagi(masa.omletServisi);
  if(p==='manti'&&masa.mantiServisi)return mantiSunumu(masa.mantiServisi);
  if(p==='kumpir'&&masa.kumpirServisi)return kumpirSunumu(masa.kumpirServisi.katlar);
  if(p==='simit'&&masa.simitServisi)return sicakSimit(masa.simitServisi);
  if(p==='tost'&&masa.tostServisi)return tostServisi(masa.tostServisi);
  if(tatliMi(p))return tatliSunumu(p,masa.tatliTabagi??'nane',masa.tatliFazlaPisti,masa.tatliSusu,masa.dondurmaTadi,masa.kurabiyeSekli,masa.tartDilimleri,masa.kurabiyeTepsisi,masa.kekServisi,masa.sutlacServisi);
  if(p==='icecek'&&masa.smoothie)return smoothieBardagi(masa.smoothie.meyveler,masa.smoothie.bardak,'tepsi-gida',masa.smoothie.buzlu,masa.smoothie.karisim);
  if(p==='icecek')return h('img.tepsi-gida',{alt:'',src:icecekBardagi(masa.icecekMeyvesi,masa.icecekMiktari),'data-yarim-bardak':icecekBardagi(masa.icecekMeyvesi,2),'data-bos-bardak':bosBardak,'data-miktar':masa.icecekMiktari});
  if(p==='tavuk'&&masa.tavukParcalari)return tavukPorsiyonu(masa.tavukParcalari);
  if(p==='tavuk')return h('img.tepsi-gida',{alt:'',src:tavukPuanResmi(masa.tavukPuani)});
}

const cerceve=new URL('../../assets/sef/ustalik/ani-cercevesi.webp',import.meta.url).href;
export function aniFotografi(ani:SofraAni,cizim:(k:ServisKaydi)=>HTMLElement){
  const menu=menuBul(ani.menuId)!;
  const resim=h('span.ani-fotografi',{'data-menu':menu.id});
  const puan=tadimSonucu(ani.masa,menu.parcalar).yildiz;
  const portre=misafirResmi(ani.masa.teslimAlan??menu.misafir,puan===3?'tesekkur':'tadim');
  const masa=h('span.ani-tepsisi');
  if(ani.masa.piknik?.esya.includes('pecete'))masa.classList.add('ani-piknik');
  for(const p of menu.parcalar){
    const tabak=sunulanTabak(p,ani.masa,cizim);
    if(tabak)masa.append(h('span.ani-porsiyon',{'data-parca':p},tabak));
  }
  resim.append(portre,masa,h('img.ani-cerceve',{alt:'',src:cerceve}));
  return resim;
}
