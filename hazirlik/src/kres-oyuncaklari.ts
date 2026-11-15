import type {Boya,BoyaIzi,Karisim,SuNesnesi} from './kres-kaydi';

const kagit='#fff7db',ahsap='#efb86e',kenar='#1e1a19';
export const renk:Record<Boya|Karisim,string>={sari:'#ffd046',mavi:'#3c9de0',kirmizi:'#f16b61',yesil:'#77bb58',mor:'#a280c4',turuncu:'#f69b46'};
const svg=(w:number,h:number,ic:string)=>'<svg aria-hidden="true" viewBox="0 0 '+w+' '+h+'" fill="none"><g stroke="'+kenar+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">'+ic+'</g></svg>';
const yol=(d:string,fill:string)=>'<path d="'+d+'" fill="'+fill+'"/>';
const elips=(x:number,y:number,rx:number,ry:number,r:string)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+r+'"/>';
const dik=(x:number,y:number,w:number,h:number,r:number,c:string)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+c+'"/>';
export const parcaAd=['Daire','Kare','Üçgen'];
export const arabaAd=['Ahşap gövde','Camlı kabin','Ön tekerlek','Arka tekerlek'];
const kalipRenk=['#ed765d','#6cc8ba','#ffd04e'];
function sekil(i:number,c:string) {
  return i===0?elips(50,51,40,40,c):i===1?dik(12,13,76,76,6,c):yol('M49 12q2-3 4 0l39 69q3 7-4 7H12q-6 0-3-6Z',c);
}
export function blok(i:number,yuva=false) {
  const c=yuva?'#bd8c51':kalipRenk[i];
  return svg(100,100,'<g transform="translate(0 4)">'+sekil(i,yuva?'#916c44':'#c49254')+'</g>'+sekil(i,c));
}
export const blokTahtasi=svg(350,150,dik(3,12,344,132,19,'#d39655')+dik(3,4,344,131,19,'#ffdc9d')+
  [0,1,2].map(i=>'<g transform="translate('+(17+i*108)+' 17)">'+sekil(i,'#ca9b64')+'</g>').join(''));
export const kaportalar=[
  {ad:'Mercan',ana:'#f07b63',alt:'#d96654'},
  {ad:'Deniz mavisi',ana:'#69b6df',alt:'#498db8'},
  {ad:'Fıstık yeşili',ana:'#a4c966',alt:'#7ea151'}
] as const;
export function boyaKavanozu(i:number,secili:boolean){
  return svg(76,70,
    dik(13,22,50,39,8,kaportalar[i].ana)+dik(12,15,52,12,4,'#f9e1a5')+
    yol('M18 16v9m8-9v9m22-9v9m8-9v9','none')+
    (secili?yol('m26 43 8 8 16-17','none').replace('<path','<path stroke-width="4.2"'):''));
}
function govde(renk:number){
  const c=kaportalar[renk]??kaportalar[0];
  return yol('M8 61q0-10 12-11l29-4 94-1 30 8q10 4 10 14v15H8Z',c.ana)+
    yol('M10 74h172v10H10Z',c.alt)+dik(166,56,13,9,4,'#ffda67')+dik(6,76,14,7,3,'#6db7b1');
}
const kabin=yol('m45 45 19-29q3-5 11-5h46q7 0 12 7l16 27Z','#6cc6b7')+
  yol('m58 40 14-22h23v22Zm44 0V18h17q5 0 8 5l11 17Z','#c7edf1');
const teker=(x:number)=>'<g class="oto-teker" data-mil="'+x+'">'+elips(x,83,18,18,'#393b48')+elips(x,83,11,11,'#f8c05a')+
  '<path d="M'+x+' 74v5m8 9-5-3m-11 3 5-3" stroke-width="1.8"/>'+elips(x,83,3.4,3.4,'#69b5ab')+'</g>';
const otoParca=(renk:number)=>[govde(renk),kabin,teker(145),teker(42)];
const otoView=['4 44 184 44','42 8 110 42','125 63 40 40','22 63 40 40'];
export function otoTek(i:number,renk=0){return svg(190,108,otoParca(renk)[i]).replace('0 0 190 108',otoView[i])}
export function otomobil(yerler:number[]=[0,1,2,3],kilavuz=false,renk=0){
  return svg(190,108,otoParca(renk).map((p,i)=>yerler.includes(i)?p:kilavuz?'<g opacity=".40" class="oto-iz">'+p+'</g>':'').join(''));
}
export function tup(c:Boya){
  return svg(94,120,yol('M24 10h48l-4 58q-1 12-14 20v11H38V88Q25 79 24 69Z',kagit)+
    yol('M24 24h47l-2 36H25Z',renk[c])+dik(22,7,51,10,2,renk[c])+dik(36,96,20,12,3,renk[c])+
    yol('M48 32q-13 15-10 19 8 10 15 1 4-5-5-20Z',renk[c]));
}
export function kase(c:string,ikinci='',oran=0){
  const ic=elips(90,46,73,22,c);
  const burgac=oran<4?'M32 48q3-19 43-20 27 0 37 12-38-6-49 5t-31 3Z':
    oran<8?'M27 45q17-19 58-16 24 2 44 14-37-11-50-6-16 5 2 10 30 8 61-4-12 18-54 17-30 0-38-10-6-8 15-14-23 0-38 9Z':
    'M24 45q16-18 53-17 24 2 50 13-34-7-52-4-18 4-1 10 31 9 73-3-16 14-53 14-35 0-42-9-6-7 11-12-20 0-39 8Z';
  return svg(180,112,yol('M10 45q8 51 53 58 25 7 56-1 41-13 50-57Z','#8ccfc4')+
  elips(90,43,80,29,kagit)+ic+(ikinci&&oran<12?'<path d="'+burgac+'" fill="'+ikinci+'" stroke="none"/>':''));
}
const yaprakDis='M25 82Q17 32 95 13q9 60-62 69Z';
const kanatDis='M58 49Q24 0 8 25q-10 23 30 37-27-1-21 15 12 19 39-9 28 29 39 10 7-15-18-15 41-15 29-36-15-25-44 23Z';
const yaprak=yol(yaprakDis,'currentColor'),kanat=yol(kanatDis,'currentColor');
const tac=[0,60,120,180,240,300].map(a=>'<ellipse cx="58" cy="26" rx="12" ry="18" fill="currentColor" transform="rotate('+a+' 58 44)"/>').join('');
const govdeCizgi:Record<Karisim,string>={
  yesil:yol('m17 94 60-58','none')+yol('m43 67-1-13m10 6 15 1','none'),
  mor:elips(58,59,4,18,'#46424b')+yol('m57 43-6-9m9 9 6-8','none'),
  turuncu:elips(58,44,11,11,'#ffd560'),
};
let baskiNo=0;
export function boyaYolu(iz:BoyaIzi){return iz.length===1?'M'+iz[0].join(' ')+'l.01 .01':'M'+iz.map(p=>p.join(' ')).join('L')}
export function baski(c:Karisim,boyali=true,izler?:BoyaIzi[],kod?:string){
  const dis=c==='yesil'?yaprak:c==='mor'?kanat:tac;
  const dal=c==='turuncu'?yol('M59 94q6-24 1-37m0 29q12-16 22-12-7 13-22 12Z','#79b966'):'';
  const dolgu=boyali&&!izler?.length?renk[c]:kagit;
  const mask=kod??'boya-kalibi-'+(++baskiNo);
  const boya=izler?'<defs><clipPath id="'+mask+'">'+dis+'</clipPath></defs><g class="kres-firca-izleri" clip-path="url(#'+mask+')" fill="none" stroke="'+renk[c]+'" stroke-width="17">'+izler.map(iz=>'<path d="'+boyaYolu(iz)+'"/>').join('')+'</g>':'';
  return svg(118,108,dal+'<g color="'+dolgu+'">'+dis+'</g>'+boya+(izler?'<g class="kres-ince-kenar">'+dis+'</g>':'')+govdeCizgi[c]);
}
export const firca=svg(56,106,yol('m10 83 25-54 10 5-25 55q-10 14-10-6Z',ahsap)+yol('m31 37 6-15 13 6-7 16Z','#a7c4c4')+yol('M38 23Q36 11 52 5q3 16-4 23Z','#e67564'));
const fircaSapi='<g class="kres-kaptaki-firca">'+yol('M24 24 32 4q2-5 5-3t1 5l-9 19Z','#ebb46f')+'</g>';
export const renkMasasi=svg(210,108,elips(102,73,79,23,'#f4ca83')+['mavi','sari','kirmizi'].map((c,i)=>'<g transform="translate('+(17+i*55)+' '+(i===1?5:17)+')">'+dik(3,24,44,43,8,renk[c as Boya])+elips(25,23,23,8,kagit)+elips(25,23,16,4,renk[c as Boya])+(i===1?fircaSapi:'')+'</g>').join(''));
export const kagitRenkleri=['#fc9583','#65c7c5','#f8c660'];
export function kayik(kat=3,c=kagitRenkleri[0]){
  const ic=kat===0?dik(13,16,145,85,4,c):kat===1?yol('m12 75 72-62 73 62Z',kagit)+yol('M12 75h145v18H12Z',c):kat===2?yol('m85 9 64 51-64 44-64-44Z',c)+yol('m85 9 1 95 63-44Z',kagit):
    yol('m25 65 56-55 37 52Z',kagit)+yol('m82 10 8 58 28-6Z','#f6cc7f')+yol('M6 54 77 70l85-22-31 40-68 13Z',c)+yol('m8 54 68 17-13 30Z',c);
  return svg(170,116,ic);
}
export function suNesnesi(n:SuNesnesi,gemiRengi=0){
  if(n==='kayik')return kayik(3,kagitRenkleri[gemiRengi]);
  if(n==='yaprak')return baski('yesil');
  if(n==='tas')return svg(96,76,yol('M9 54q4-13 18-27 11-9 28-12 14-1 23 12l12 23q7 15-17 17H30Q4 66 9 54Z','#8b99a8')+yol('M15 56q19 7 48 2 17-3 25-10','none'));
  return svg(94,90,yol('m10 27 36-18 38 16-35 20Z','#f5cb88')+yol('m10 27 39 18v36L10 61Z','#d99e60')+yol('m49 45 35-20v36L49 81Z','#ebaf69'));
}
const legenCizimi=yol('M14 37q0-17 24-18h207q18 1 21 16l-14 86q-3 13-22 14H50q-18 0-22-18Z','#ccefea')+yol('M18 61q19-7 40 0t39-1q20-7 40 0t39 0 40 0 46-1l-12 61q-2 9-20 10H50q-13 0-17-12Z','#72c9da')+yol('M14 37q109 13 252-2','none');
const suKipirtisi='<g class="kres-su-kipirtisi" fill="none" stroke="#439da9" stroke-width="2"><path d="M150 70q10 3 21 0m6 4q7 2 14 0"/></g>';
export const legen=svg(280,145,legenCizimi);
export const odadakiLegen=svg(280,145,legenCizimi+suKipirtisi);
export function saksi(yas:number,tohum:boolean){
  let bitki='';
  if(yas>0){
    const uz=38+7*yas;
    bitki=yol('M65 82q6-20 0-'+uz,'none')+yol('M66 63Q38 68 31 41q29-3 35 22Z','#75c35c')+yol('M66 53q6-27 31-23-2 23-31 23Z','#95cf66');
    if(yas>=2)bitki+=yol('M66 40q-17-5-20-20 18-1 20 20Z','#80c858');
    if(yas===3)bitki+='<g transform="translate(37 -2) scale(.48)">'+baski('turuncu').replace(/<\/?svg[^>]*>/g,'')+'</g>';
  }
  return svg(130,130,yol('m23 76 11 44q1 6 9 6h43q8 0 10-6l12-44Z','#ee8669')+dik(17,66,96,17,5,'#faab79')+elips(65,68,43,6,'#896047')+(tohum&&yas<=0?elips(64,66,4,2,'#a4845c'):'')+bitki);
}
export const tohum=svg(80,80,yol('M18 51q2-31 41-37 17 33-8 48-21 12-33-11Z','#c99756')+yol('M31 55q6-18 19-28','none'));
export const zil=svg(110,130,dik(13,8,84,20,6,ahsap)+yol('M53 27q-25 1-25 30 0 12-10 20v5h73v-5q-11-8-11-21-1-28-27-29Z','#ffd051')+elips(55,84,8,6,'#d59549')+yol('M56 90v23','none')+elips(56,118,7,7,'#e17661'));


export function deneyBak(ust:boolean){
  return svg(110,85,yol('m10 15 8 56q0 5 8 5h56q7 0 9-5l8-56Z','#daf2e8')+
    yol('M14 37q10-5 20 0t20 0t20 0 21 0l-5 32q-1 6-10 6H28q-8 0-10-7Z','#95d5de')+
    elips(53,ust?33:66,13,8,'#f1ae64')+yol('M8 15h91','none'));
}
export const buyutec=svg(96,96,yol('m53 60 11-10 24 25q6 8-1 13-5 4-11-2Z','#e8ae68')+elips(41,38,31,31,'#66bbb4')+elips(41,38,23,23,'#d8edf3')+yol('M26 37q2-13 15-15','none'));
