type Nokta=[number,number];
const kagitSekilleri:Nokta[][]=[
  [[13,16],[158,16],[158,101],[13,101]],
  [[12,75],[84,13],[157,75],[157,93],[12,93]],
  [[85,9],[149,60],[85,104],[21,60]],
];

// Sürüklenen köşe ile ilk yerinin orta dikmesi kat izidir.
export function kagidiKat(svg:SVGSVGElement,asama:number,bas:Nokta,son:Nokta){
  const grup=svg.querySelector('g')!;
  let yuz=svg.querySelector<SVGGElement>('.kres-katlanma');
  if(!yuz){
    yuz=document.createElementNS('http://www.w3.org/2000/svg','g');
    yuz.setAttribute('class','kres-katlanma');svg.append(yuz);
  }
  const dx=son[0]-bas[0],dy=son[1]-bas[1],boy=Math.hypot(dx,dy);
  if(boy<2){grup.style.visibility='';yuz.replaceChildren();return}
  const nx=dx/boy,ny=dy/boy,mx=(bas[0]+son[0])/2,my=(bas[1]+son[1])/2;
  const uzak=(p:Nokta)=>(p[0]-mx)*nx+(p[1]-my)*ny;
  const sekil=kagitSekilleri[asama];
  function parcala(yon:number){
    const parca:Nokta[]=[];
    for(let i=0;i<sekil.length;i++){
      const a=sekil[i],b=sekil[(i+1)%sekil.length],u=uzak(a),v=uzak(b);
      if(yon*u>=0)parca.push(a);
      if(u*v<0){const t=u/(u-v);parca.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])])}
    }
    return parca;
  }
  const yuzey=parcala(1),kanat=parcala(-1).map(p=>{const u=uzak(p);return [p[0]-2*u*nx,p[1]-2*u*ny] as Nokta});
  if(!kanat.length||!yuzey.length)return;
  const dolgu=grup.querySelector('[fill]:last-child')?.getAttribute('fill')||'#f9bc81';
  function ciz(p:Nokta[],renk:string){
    const alan=document.createElementNS('http://www.w3.org/2000/svg','polygon');
    alan.setAttribute('points',p.map(([x,y])=>x.toFixed(2)+','+y.toFixed(2)).join(' '));
    alan.setAttribute('fill',renk);alan.setAttribute('stroke','#24201d');alan.setAttribute('stroke-width','2.2');alan.setAttribute('stroke-linejoin','round');return alan;
  }
  grup.style.visibility='hidden';yuz.replaceChildren(ciz(yuzey,dolgu),ciz(kanat,'#fff7db'));
}
