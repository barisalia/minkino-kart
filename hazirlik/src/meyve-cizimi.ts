import type {Kesit,Tarif} from './meyve-tarifi';

export const meyveAdlari=['Elma','Portakal','Çilek'];
export const govdeler=[
  'M80 45C64 44 59 33 41 36C20 39 12 57 13 79C14 99 24 129 43 142C57 152 67 142 79 143C91 143 99 152 113 143C127 134 139 113 144 91C151 62 139 35 113 34C96 32 91 43 80 45Z',
  'M80 29C113 27 142 48 144 81C148 115 121 145 86 147C47 150 18 126 16 92C13 59 40 30 80 29Z',
  'M80 42C59 29 33 37 27 57C17 82 41 121 66 142Q81 155 94 142C123 115 145 77 133 56C124 36 102 32 80 42Z'
];
const kabuk=['#ed5046','#ffab38','#f55b56'],et=['#fff0be','#ffcc64','#ffa195'];
const dal='<path d="M77 48C79 33 76 24 71 17Q72 13 77 12C84 21 84 34 82 46Z" fill="#80563b"/><path d="M81 32Q87 9 112 13Q107 35 81 32Z" fill="#6cad56"/>';
export const cerceve=(ic:string,v='0 0 160 160')=>'<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="'+v+'" fill="none" stroke="#231e21" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">'+ic+'</svg>';
export function butun(i:number){
  const ana='<path data-govde="" d="'+govdeler[i]+'" fill="'+kabuk[i]+'"/>';
  if(i===0)return dal+ana;
  if(i===1)return ana+'<path d="M78 34q-3-12 3-17l4 1-2 15Z" fill="#856443"/><path d="M83 26Q98 7 120 15Q106 34 83 26Z" fill="#75ad58"/>';
  return ana+'<path d="m79 39 7-15 5 2-4 13 22-5-13 13 14 7-23-1-9 15-3-17-20 5 11-13-16-5Z" fill="#7fb354"/>'+
    [[48,68],[84,77],[111,63],[58,94],[100,99],[78,121]].map(([x,y])=>'<path d="M'+x+' '+y+'q3-3 3 1t-4 6q-2-3 1-7Z" fill="#ffdb86" stroke-width="1.3"/>').join('');
}
let no=0;
export const ornekKesit:Kesit=[19,92,141,80];
// İki dış kabuk ve açıldığında görülen kesit yüzleri aynı parmak doğrusunu kullanır.
export function yarim(i:number,k:Kesit,yan:number){
  const [x,y,u,v]=k,dx=u-x,dy=v-y,l=Math.hypot(dx,dy),isaret=yan?1:-1;
  const nx=-dy/l*isaret,ny=dx/l*isaret,tx=dx/l,ty=dy/l,ac=Math.atan2(dy,dx)*180/Math.PI;
  const a=[x-tx*220,y-ty*220],b=[u+tx*220,v+ty*220],id='meyve-kesit-'+(++no);
  const sinir=[a,b,[b[0]+nx*400,b[1]+ny*400],[a[0]+nx*400,a[1]+ny*400]].map(p=>p.join(',')).join(' ');
  const r=l/2,ic=i===0?'<path fill="#9c6c43" d="M-9 0q6-7 8 0-3 6-8 0Zm15 1q4-7 7-2-1 5-7 2Z" stroke-width="1.2"/>':
    i===1?'<g stroke="#fff2b9" stroke-width="2"><path d="M0 0L-'+r*.65+' -7M0 0L-8 -9M0 0L18 -9M0 0L'+r*.72+' 6M0 0L-18 9"/></g>':'<path d="M-'+r*.72+' 0Q0-9 '+r*.72+' 0Q0 8 -'+r*.72+' 0Z" fill="#ffd4af" stroke="none"/>';
  return '<defs><clipPath id="'+id+'"><polygon points="'+sinir+'"/></clipPath></defs><g clip-path="url(#'+id+')">'+butun(i)+'</g><g transform="translate('+((x+u)/2)+' '+((y+v)/2)+') rotate('+ac+')"><ellipse rx="'+r+'" ry="11" fill="'+et[i]+'" stroke-width="2"/>'+ic+'</g>';
}
export function dilim(i:number,k:Kesit,yan:number){
  const [x,y,u,v]=k,l=Math.hypot(u-x,v-y),t=yan?1:-1;
  return cerceve(yarim(i,k,yan),[((x+u)/2-(v-y)/l*t*24)-83,((y+v)/2+(u-x)/l*t*24)-69,166,138].join(' '));
}
export const kaseArka='<ellipse cx="200" cy="154" rx="139" ry="52" fill="#bce7da"/><ellipse cx="200" cy="153" rx="127" ry="42" fill="#e7f4d9"/>';
export const kaseOn='<path d="M61 153Q74 248 200 248T339 153Q327 194 200 197T61 153Z" fill="#71bfb2"/><path d="M66 169q37 44 135 43t132-44" stroke="#3d897d" fill="none"/>';
const kaseYer=[[133,142],[188,133],[248,137],[164,166],[221,160],[275,163]];
export function yemek(tarif:Tarif,sira:number[],kesitler:(Kesit|null)[],don=0){
  const sis=tarif==='sis';
  const alt=sis?'<ellipse cx="200" cy="168" rx="177" ry="62" fill="#9bd8c3"/><ellipse cx="200" cy="165" rx="166" ry="51" fill="#fff8de"/><path d="m42 182 315-52q6-1 6 3t-5 5L42 189q-8-2 0-7Z" fill="#dca566"/>':kaseArka;
  const parcalar=sira.map((id,j)=>{
    const k=kesitler[id>>1]??ornekKesit;
    const [cx,cy]=sis?[76+j*49,174-j*8]:kaseYer[(j+don)%6];
    return '<g transform="translate('+cx+' '+cy+') rotate('+(sis?-9:(j%3-1)*13)+')"><svg x="-41" y="-41" width="82" height="82" viewBox="0 0 160 160">'+yarim(id>>1,k,id%2)+'</svg></g>';
  }).join('');
  return alt+parcalar+(sis?'':kaseOn);
}
