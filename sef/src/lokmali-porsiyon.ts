import {kavurmaRengi,servisYuzu} from './sis-pisme';
import {h} from '../../src/ui/dom';
import {servisKompozisyonu,type KrepPorsiyonu} from './krep-fisi';
import type {DefterFotografi} from './yemekler';

const adresler=import.meta.glob<string>([
  '../../assets/sef/makarna/*-{sert,yumusan,lokma}.webp','../../assets/sef/makarna/{tabak,feslegen,peynir,domates-garnitur}.webp',
  '../../assets/sef/sis/*-pismis-*.webp','../../assets/sef/sis/{tabak,tabak-sari,tabak-nane,cubuk}.webp',
  '../../assets/sef/krep/*.webp',
  '../../assets/sef/mucver/{tabak,mucver-pismis,mucver-citir,mucver-fazla,*-sus}.webp',
],{eager:true,query:'?url',import:'default'});
const ns='http://www.w3.org/2000/svg';
function yuzey(w:number,h:number){
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 '+w+' '+h);
  svg.setAttribute('aria-hidden','true');return svg;
}
function koy(svg:SVGElement,kaynak:string,x:number,y:number,w:number,h:number,esnet=false){
  const img=document.createElementNS(ns,'image');
  img.setAttribute('href',adresler['../../assets/sef/'+kaynak+'.webp']);
  img.setAttribute('x',String(x));img.setAttribute('y',String(y));img.setAttribute('width',String(w));img.setAttribute('height',String(h));
  if(esnet)img.setAttribute('preserveAspectRatio','none');
  svg.append(img);return img;
}

let krepSayaci=0;
function dilimliKrep(p:KrepPorsiyonu){
  const tuval=yuzey(100,100);
  const kaliplar=document.createElementNS(ns,'defs');
  tuval.append(kaliplar);
  const sira=++krepSayaci;
  const [tabak,...yiyecek]=servisKompozisyonu(p.parcalar,p.kizarma,p.sunum);
  koy(tuval,'krep/'+tabak.id,1,1,98,98);
  const bilesim=document.createElementNS(ns,'g');
  for(const k of yiyecek){
    const x=k.x*100,y=k.y*100,boy=k.boy*100;
    const kat=koy(bilesim,'krep/'+k.id,x-boy/2,y-boy/2,boy,boy);
    kat.setAttribute('transform','rotate('+k.don+' '+x+' '+y+')');
  }
  const dilimler=['M0 0 H37 Q43 32 40 51 Q37 78 42 100 H0Z','M37 0 H62 Q58 27 62 59 Q66 83 60 100 H42 Q37 78 40 51 Q43 32 37 0Z','M62 0 H100 V100 H60 Q66 83 62 59 Q58 27 62 0Z'];
  dilimler.forEach((d,i)=>{
    const kalip=document.createElementNS(ns,'clipPath'),yol=document.createElementNS(ns,'path');
    kalip.id='krep-dilimi-'+sira+'-'+i;yol.setAttribute('d',d);kalip.append(yol);kaliplar.append(kalip);
    const dilim=bilesim.cloneNode(true) as SVGGElement;
    dilim.setAttribute('clip-path','url(#'+kalip.id+')');dilim.dataset.krepDilimi=String(i);tuval.append(dilim);
  });
  return h('span.lokmali-porsiyon',{'aria-label':'Hazırladığın meyveli krep'},tuval);
}
export function krepLokmasi(tabak:HTMLElement){
  const dilim=tabak.querySelector<SVGGElement>('[data-krep-dilimi]:not([hidden])');
  if(!dilim)return;
  const lokma=yuzey(40,72);
  lokma.setAttribute('viewBox',([9,31,55][Number(dilim.dataset.krepDilimi)])+' 15 40 72');
  lokma.classList.add('restoran-kasik-ici','kr-catal-lokmasi');
  lokma.append(dilim.cloneNode(true));return lokma;
}

// Retain the same placement and plate as the station's keepsake photo.
// Individual ingredients can leave this version of the plate during tasting.
export function lokmaliPorsiyon(foto:DefterFotografi){
  if(foto.tarifId==='makarna'&&foto.makarna?.porsiyon){
    const {porsiyon,sos,pestoMaskesi,soslanan=7}=foto.makarna;
    const tuval=yuzey(440,275);
    koy(tuval,'makarna/tabak',0,0,440,275,true);
    const yerler=[[.34,.39,-12],[.66,.38,13],[.50,.64,-4]];
    for(const [i,[x,y,aci]] of yerler.entries()){
      const grup=document.createElementNS(ns,'g');
      grup.setAttribute('transform','translate('+x*440+' '+y*275+')');
      tuval.append(grup);
      const kivam=porsiyon.kivamlar[i];
      const soslu=!!(soslanan&(1<<i));
      const resim=soslu?sos+'-'+(kivam==='tam'?'lokma':kivam):kivam==='tam'?'pismis':'sade-'+kivam;
      const yemek=koy(grup,'makarna/'+porsiyon.renk+'-'+resim,-61.6,-75,123.2,150);
      yemek.setAttribute('transform','rotate('+aci+')');yemek.dataset.lokma='fiyonk';
      if(soslu&&sos==='yesil'&&pestoMaskesi!==undefined&&!(pestoMaskesi&(1<<i))){
        const yaprak=koy(grup,'makarna/feslegen',-26.4,-28,52.8,56);
        yaprak.dataset.ust=String(i);
      }
    }
    const {id,x,y}=porsiyon.sus;
    const en=440*({domates:.16,peynir:.13,feslegen:.14}[id]);
    const sus=koy(tuval,'makarna/'+(id==='domates'?'domates-garnitur':id),x*440-en/2,y*275-en/2,en,en);
    sus.dataset.garnitur='true';
    return h('span.lokmali-porsiyon',{'aria-label':'Hazırladığın fiyonk makarna'},tuval);
  }
  const tercih=foto.tercih;
  if(tercih?.tarifId==='krep'&&tercih.porsiyon)return dilimliKrep(tercih.porsiyon);
  if(tercih?.tarifId==='sis'&&tercih.tabak){
    const tuval=yuzey(420,252);
    koy(tuval,'sis/'+(tercih.tabak??'tabak'),6,29,408,197,true);
    const cubuk=document.createElementNS(ns,'g');
    cubuk.setAttribute('transform','translate(210 127) rotate(-4.58366)');
    tuval.append(cubuk);koy(cubuk,'sis/cubuk',-183,-3,366,6,true);
    tercih.lokmalar.forEach((malzeme,i)=>{
      const el=koy(cubuk,'sis/'+malzeme+'-pismis-'+tercih.sos,-183+(23+16*i)*3.66-35,-41,70,82);
      el.dataset.lokma=malzeme;if(tercih.yuzler)el.style.filter=kavurmaRengi(servisYuzu(tercih.yuzler));
    });
    return h('span.lokmali-porsiyon',{'aria-label':'Hazırladığın sebze şişi'},tuval);
  }
  if(tercih?.tarifId==='mucver'){
    const tuval=yuzey(400,280);
    koy(tuval,'mucver/tabak',0,0,400,280,true);
    for(const [x,y] of [[34,51],[51,34],[68,55]]){
      const ad=['mucver-pismis','mucver-citir','mucver-fazla'][tercih.kizarma];
      const el=koy(tuval,'mucver/'+ad,x*4-55,y*2.8-35,110,70,true);
      el.dataset.lokma='mucver';
    }
    koy(tuval,'mucver/'+tercih.garnitur+'-sus',157,158,78,61,true).dataset.garnitur='true';
    return h('span.lokmali-porsiyon',{'aria-label':'Hazırladığın fırın mücver'},tuval);
  }
}
export function siradakiLokma(tabak:HTMLElement){
  return tabak.querySelector<SVGImageElement>('.lokmali-porsiyon image[data-lokma]:not([hidden])');
}
