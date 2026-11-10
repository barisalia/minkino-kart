// Suyun iki sahnedeki yüksekliği aynı matarada ölçülür.
const ink = '#242129';
const capColor = '#f49a62';
const bottleShape = 'M43 37H81V50C81 59 98 60 98 76V155Q98 172 82 172H41Q24 172 24 155V76C24 60 43 59 43 50Z';

function svg(view: string, art: string) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+view+'" width="100%" height="100%" fill="none" stroke="'+ink+'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'+art+'</svg>';
}

const lemon = '<g transform="translate(60 120) rotate(-14)"><path d="M-15 1q2-12 15-12 12-2 15 7l3 3-3 3q-4 10-16 10-11 1-14-7l-3-2Z" fill="#ffdc64" stroke-width="1.8"/><path d="M1-11q0-9 12-10-2 9-12 10Z" fill="#62ad75" stroke-width="1.6"/></g>';
const lid = '<path d="M49 20v-5a13 13 0 0 1 26 0v5h-6v-5a7 7 0 0 0-14 0v5z" fill="'+capColor+'"/><rect x="38" y="19" width="48" height="21" rx="7" fill="'+capColor+'"/><path d="M47 26v7m8-7v7m8-7v7m8-7v7m8-7v7" stroke="#ab5b43" stroke-width="1.6"/>';

function bottle(id: string, level: number, capped: boolean) {
  const top = 160 - 94 * level;
  return '<defs><clipPath id="'+id+'"><path d="'+bottleShape+'"/></clipPath></defs>'+
    '<path d="'+bottleShape+'" fill="#ebf7dd"/>'+
    '<g clip-path="url(#'+id+')"><path data-water="bottle" d="'+wave(20,104,top,175)+'" fill="#75c8d8" stroke="none"/></g>'+
    '<path d="'+bottleShape+'"/><path d="M43 43h38m-36 6h33" stroke-width="1.4"/>'+
    '<path d="M24 149q36 4 74 0v8q0 15-16 15H41q-17 0-17-15Z" fill="#519b99"/>'+
    lemon+(capped?lid:'');
}
function wave(x1:number,x2:number,y:number,bottom:number) {
  return 'M'+x1+' '+y+'q18 -3 38 0t'+(x2-x1-38)+' 0V'+bottom+'H'+x1+'Z';
}
export const mataraResmi=(id:string,level=1,capped=true)=>svg('18 0 86 177',bottle(id,level,capped));
export const kapakResmi=svg('34 0 56 43',lid);

function cup(level:number) {
  return '<path d="M110 176h15q17 0 14 16-2 12-26 15l1-8q16-2 18-8 2-7-7-7h-13Z" fill="#ecad74"/>'+
    '<path d="M52 168q32-5 67 0l-7 46q-1 10-13 11H73q-11 0-13-10Z" fill="#f9f0d9"/>'+
    '<path data-water="cup" d="'+cupWater(level)+'" fill="#78cbd8" stroke="none"/>'+
    '<path d="M52 168q33 6 67 0" stroke-width="2"/><path d="M61 212q26 6 51 0l-1 7q-3 6-12 6H73q-11-1-12-13Z" fill="#f3ae75"/>';
}
function cupWater(level:number) {
  const y=215-38*level;
  const left=61-(215-y)*.15, right=111+(215-y)*.14;
  return 'M'+left+' '+y+'Q85 '+(y+4)+' '+right+' '+y+'L111 215Q88 221 62 215Z';
}
const waterStream='<g data-stream="" opacity="0"><path fill="#87d6e0" stroke="none" d="M-4 0h8l1 52q-4 10-10 0Z"/><path d="M0 5v32" stroke="#e5f9e8" stroke-width="1.8"/></g>';

// Musluk ve şişe tek koordinat sistemindedir. Dar ekranda da su ağızdan içeri düşer.
export function dolumTezgahi(level:number) {
  return svg('0 0 520 332',
    '<ellipse cx="245" cy="309" rx="211" ry="11" fill="#d9a66d" stroke="none"/>'+
    '<path d="M66 291h149l5 14H62Z" fill="#327f81"/>'+
    '<path d="M56 87q0-17 18-17h133q17 0 17 17v199q0 10-12 11H70q-15 0-15-12Z" fill="#99d7c3"/>'+
    '<path d="M65 83q77 5 151 0M68 280h142" stroke="#599f99"/>'+
    '<path d="M74 68V32q0-15 15-15h103q14 0 14 15v36Z" fill="#f5b975"/><rect x="63" y="63" width="152" height="13" rx="6" fill="#efad6f"/>'+
    '<path d="M76 152q0-10 10-10h113q10 0 10 10v87q0 12-10 12H87q-11 0-11-12Z" fill="#f2efc8" stroke-width="2"/>'+
    '<g transform="translate(71 73) scale(1.18)">'+lemon+'</g>'+
    '<path d="M224 90h64q12 0 12 14v13h-18v-10h-58Z" fill="#f4d08d"/>'+
    '<rect x="277" y="111" width="28" height="12" rx="4" fill="#458e95"/>'+
    '<g class="musluk-kolu"><path d="M251 90V73h9v17Z" fill="#ffe4a6"/><path d="M239 64q1-8 10-5l35 10q7 3 5 9-2 5-9 4l-36-8q-7-2-5-10Z" fill="#ee8268"/></g>'+
    '<g transform="translate(291 124)">'+waterStream+'</g>'+
    '<g transform="translate(229 126)">'+bottle('tezgah-sisesi',level,false)+'</g>'+
    '<path d="M357 289q9-4 29-2l12 3q-23 5-41-1Z" fill="#d9a66d" stroke="none"/>'+
    '<g transform="translate(316 252)">'+lid+'</g>');
}

export function servisTakimi(level:number) {
  return svg('35 50 215 184',
    '<ellipse cx="98" cy="223" rx="48" ry="6" fill="#e3ceaa" stroke="none"/>'+
    '<g data-pitcher="" transform="translate(172 86) scale(.78) translate(-62 -37)">'+bottle('sofra-sisesi',1-level*.45,false)+'</g>'+
    '<g transform="translate(85 118)">'+waterStream+'</g>'+cup(level));
}
export function suBardagi(level: number) {
  return svg('47 158 98 71',cup(level));
}

export function suyuCiz(root:HTMLElement, home:boolean, amount:number, tilt:number, flowing:boolean) {
  const y = 160-94*(home ? amount : 1-amount*.45);
  root.querySelector('[data-water=bottle]')?.setAttribute('d',wave(20,104,y,175));
  root.querySelector('[data-water=cup]')?.setAttribute('d',cupWater(amount));
  root.querySelector('[data-stream]')?.setAttribute('opacity',flowing?'1':'0');
  const pitcher=root.querySelector('[data-pitcher]');
  if(pitcher) pitcher.setAttribute('transform','translate('+(172-87*tilt)+' '+(86+32*tilt)+') rotate('+(-99*tilt)+') scale(.78) translate(-62 -37)');
}
