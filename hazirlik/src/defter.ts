export type Nokta = [number, number];
export type Asama = 'cizgi' | 'yuvarlak' | 'ucgen' | 'kare' | 'harf' | 'resim';
export interface Iz { asama: Asama; renk: number; noktalar: Nokta[] }
export const boyalar = ['#d95146','#308b95','#795aa3'];
export const ip = 'M180 145V251';
export const balon = 'M180 145a55 55 0 1 1 .01 0';
const koseler:Record<'ucgen'|'kare'|'harf',Nokta[]>={
  ucgen:[[180,38],[97,124],[263,124],[180,38]],
  kare:[[113,124],[247,124],[247,258],[113,258],[113,124]],
  harf:[[91,214],[91,66],[180,162],[269,66],[269,214]]
};
export function sekilYolu(ad:keyof typeof koseler){return izYolu(koseler[ad])}
export function izleriOku(girdi:unknown):Iz[] {
  if (!Array.isArray(girdi)) return [];
  return girdi.slice(-48).filter((iz):iz is Iz => iz && ['cizgi','yuvarlak','ucgen','kare','harf','resim'].includes(iz.asama) &&
    Number.isInteger(iz.renk) && !!boyalar[iz.renk] && Array.isArray(iz.noktalar) &&
    iz.noktalar.length>1 && iz.noktalar.length<=450 && iz.noktalar.every((p:unknown)=>
      Array.isArray(p) && p.length===2 && p.every((v:unknown,i:number)=>typeof v==='number' && Number.isFinite(v) && v>=0 && v<=(i?285:360))));
}
const izYolu=(noktalar:Nokta[])=>noktalar.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join(' ');
function ciz(iz:Iz) {
  return '<path d="'+izYolu(iz.noktalar)+'" fill="none" stroke="'+boyalar[iz.renk]+'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';
}
export const kagittakiIzler=(izler:Iz[])=>izler.map(ciz).join('');
export function yeterli(izler:Iz[], asama:Asama) {
  if(asama==='resim')return izler.some(iz=>iz.noktalar.length>1);
  const kenarlar=asama==='ucgen'||asama==='kare'||asama==='harf'?koseler[asama]:null;
  const bolum = kenarlar?(kenarlar.length-1)*6:asama==='cizgi'?12:24;
  const dolu = new Set<number>();
  for(const iz of izler.filter(iz=>iz.asama===asama)){
    let uygun=0,toplam=0;
    const gecilen=new Set<number>();
    for(let i=1;i<iz.noktalar.length;i++){
      const [x,y]=iz.noktalar[i-1], [sonX,sonY]=iz.noktalar[i];
      const uzaklik=Math.hypot(sonX-x,sonY-y);
      const adim=Math.max(1,Math.ceil(uzaklik/4));
      for(let j=1;j<=adim;j++){
        const px=x+(sonX-x)*j/adim,py=y+(sonY-y)*j/adim;
        toplam+=uzaklik/adim;
        let oran:number;
        if(kenarlar){
          let yakin=Infinity,konum=0;
          for(let k=1;k<kenarlar.length;k++){
            const [ax,ay]=kenarlar[k-1],[bx,by]=kenarlar[k],dx=bx-ax,dy=by-ay;
            const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));
            const mesafe=Math.hypot(px-ax-dx*t,py-ay-dy*t);
            if(mesafe<yakin){yakin=mesafe;konum=k-1+Math.min(t,.999)}
          }
          if(yakin>(asama==='harf'?26:20))continue;
          oran=konum/(kenarlar.length-1);
        }else if(asama==='cizgi'){
          if(Math.abs(px-180)>22||py<129||py>269)continue;
          oran=(py-145)/106;
        }else{
          if(Math.abs(Math.hypot(px-180,py-90)-55)>21)continue;
          oran=(Math.atan2(py-90,px-180)+Math.PI)/(2*Math.PI);
        }
        uygun+=uzaklik/adim;
        gecilen.add(Math.max(0,Math.min(bolum-1,Math.floor(oran*bolum))));
      }
    }
    if(uygun>=7 && uygun>=toplam*.68)gecilen.forEach(b=>dolu.add(b));
  }
  return dolu.size >= (asama==='harf'?20:kenarlar?bolum-2:asama==='cizgi'?11:22);
}
export function cizmeyiBagla(kagit:SVGSVGElement,asama:Asama,izler:Iz[],renk:()=>number,kaydet:()=>void,bitir:()=>void) {
  let aktif:{id:number;iz:Iz;yol:SVGPathElement}|undefined;
  const kagida=(e:PointerEvent):Nokta=>{
    const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(kagit.getScreenCTM()!.inverse());
    return [Math.round(Math.max(0,Math.min(360,pt.x))),Math.round(Math.max(0,Math.min(285,pt.y)))];
  };
  kagit.onpointerdown=e=>{
    if(aktif||e.button!==0)return;
    e.preventDefault();
    const iz:Iz={asama,renk:renk(),noktalar:[kagida(e)]};
    const yol=document.createElementNS('http://www.w3.org/2000/svg','path');
    yol.setAttribute('stroke',boyalar[iz.renk]);kagit.querySelector('.yeni-iz')!.append(yol);
    aktif={id:e.pointerId,iz,yol};kagit.setPointerCapture(e.pointerId);
  };
  const ekle=(e:PointerEvent)=>{
    if(!aktif||e.pointerId!==aktif.id)return;
    const p=kagida(e),n=aktif.iz.noktalar,son=n[n.length-1];
    if(n.length>=450 || Math.hypot(son[0]-p[0],son[1]-p[1])<2)return;
    n.push(p);aktif.yol.setAttribute('d',izYolu(n));
  };
  kagit.onpointermove=ekle;
  kagit.onpointerup=e=>{
    if(!aktif||aktif.id!==e.pointerId)return;
    ekle(e);const {iz,yol}=aktif;aktif=undefined;
    if(iz.noktalar.length<2){yol.remove();return}
    if(izler.length>=48){const i=izler.findIndex(a=>a.asama===asama);if(i>=0)izler.splice(i,1)}
    izler.push(iz);kagit.querySelector('.murekkep')!.innerHTML=kagittakiIzler(izler);yol.remove();
    if(yeterli(izler,asama))bitir();else kaydet();
  };
  kagit.onlostpointercapture=kagit.onpointercancel=e=>{if(aktif?.id===e.pointerId){aktif.yol.remove();aktif=undefined}};
}
