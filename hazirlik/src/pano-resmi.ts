export const en=600, boy=400;
export const palet=['#f46350','#ffc643','#39aa7d','#4e9ee0','#a478d2'];
export type Nokta=[number,number];
export type Arac='kalem'|'firca'|'kova';
export interface Hamle { arac:Arac; renk:number; noktalar:Nokta[] }
export type Eksik='sekil'|'eksik_boya'|'ayni'|'ip';
export interface PanoKaydi {
  hamleler:Hamle[]; arac:Arac; renk:number; rehber:boolean;
  durum:'cizim'|'inceleme'|'kazandi'|'diger'; eksik:Eksik;
}
export const bosPano=():PanoKaydi=>({hamleler:[],arac:'kalem',renk:0,rehber:false,durum:'cizim',eksik:'sekil'});
export function panoyuOku(a?:Partial<PanoKaydi>):PanoKaydi{
  const d=bosPano();if(!a)return d;
  const arac=(v:unknown)=>v==='kalem'||v==='firca'||v==='kova';
  const renk=(v:unknown)=>typeof v==='number'&&Number.isInteger(v)&&!!palet[v];
  if(arac(a.arac))d.arac=a.arac;
  if(renk(a.renk))d.renk=a.renk!;
  d.rehber=a.rehber===true;
  if(Array.isArray(a.hamleler))d.hamleler=a.hamleler.slice(0,180).filter(h=>h&&arac(h.arac)&&renk(h.renk)&&Array.isArray(h.noktalar)&&h.noktalar.length>0&&h.noktalar.length<=600&&h.noktalar.every((p:unknown)=>Array.isArray(p)&&p.length===2&&p.every((n,i)=>Number.isInteger(n)&&n>=0&&n<(i?boy:en))));
  if(a.durum==='inceleme'||a.durum==='kazandi'||a.durum==='diger')d.durum=a.durum;
  if(a.eksik&&['sekil','eksik_boya','ayni','ip'].includes(a.eksik))d.eksik=a.eksik;
  return d;
}
const rgb=palet.map(s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)));
const uzak=(a:Nokta,b:Nokta)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function ucuBirlestir(h:Hamle,once:Hamle[]){
  if(h.arac!=='kalem'||h.noktalar.length<2)return;
  const pts=h.noktalar,bas=pts[0],son=pts[pts.length-1];
  if(uzak(bas,son)<20&&pts.some(p=>uzak(p,bas)>24)){pts.push([...bas]);return}
  for(const i of [0,pts.length-1]){
    let yakin=12,hedef=pts[i];
    for(const c of once)if(c.arac==='kalem'){
      for(const p of [c.noktalar[0],c.noktalar[c.noktalar.length-1]]){
        const fark=uzak(pts[i],p);if(fark<yakin){yakin=fark;hedef=p}
      }
    }
    pts[i]=[...hedef];
  }
}
function cizgi(ctx:CanvasRenderingContext2D,h:Hamle){
  const pts=h.noktalar;ctx.strokeStyle=ctx.fillStyle=h.arac==='kalem'?'#262331':palet[h.renk];
  const width=h.arac==='kalem'?5:21;ctx.lineWidth=width;ctx.lineCap=ctx.lineJoin='round';
  ctx.beginPath();ctx.moveTo(...pts[0]);
  for(let i=1;i<pts.length-1;i++){
    const a=pts[i],b=pts[i+1];ctx.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);
  }
  if(pts.length>1){ctx.lineTo(...pts[pts.length-1]);ctx.stroke()}
  else{ctx.arc(pts[0][0],pts[0][1],width/2,0,Math.PI*2);ctx.fill()}
}
function katman(){
  const c=document.createElement('canvas');c.width=en;c.height=boy;
  return c.getContext('2d',{willReadFrequently:true})!;
}
interface Bolge { alan:Int32Array; sol:number; sag:number; ust:number; alt:number; dis:boolean }
// Kapalı alanları kalemin gerçek piksel sınırlarından çıkar. Parmak kaldırılarak çizilen çevreler de birleşir.
function bolgeleriBul(cizgi:Uint8ClampedArray){
  const toplam=en*boy,etiket=new Int32Array(toplam),kuyruk=new Int32Array(toplam),bolgeler:Bolge[]=[];
  for(let i=0;i<toplam;i++)if(cizgi[i*4+3]>68)etiket[i]=-1;
  for(let i=0;i<toplam;i++){
    if(etiket[i])continue;
    const id=bolgeler.length+1;let bas=0,son=1,sol=en,sag=0,ust=boy,alt=0,dis=false;
    kuyruk[0]=i;etiket[i]=id;
    function ekle(p:number){if(etiket[p]===0){etiket[p]=id;kuyruk[son++]=p}}
    while(bas<son){
      const p=kuyruk[bas++],x=p%en,y=Math.floor(p/en);sol=Math.min(sol,x);sag=Math.max(sag,x);ust=Math.min(ust,y);alt=Math.max(alt,y);
      if(x===0||y===0||x===en-1||y===boy-1)dis=true;
      if(x>0)ekle(p-1);if(x+1<en)ekle(p+1);if(y>0)ekle(p-en);if(y+1<boy)ekle(p+en);
    }
    bolgeler.push({alan:dis?new Int32Array():kuyruk.slice(0,son),sol,sag,ust,alt,dis});
  }
  return {etiket,bolgeler};
}
export function resimAtolyesi(canvas:HTMLCanvasElement){
  canvas.width=en;canvas.height=boy;
  const gorunen=canvas.getContext('2d')!,murekkep=katman(),boya=katman();
  let harita:ReturnType<typeof bolgeleriBul>|undefined;
  const alanlar=()=>harita??=bolgeleriBul(murekkep.getImageData(0,0,en,boy).data);
  function goster(taslak?:Hamle){
    gorunen.fillStyle='#fffaf0';gorunen.fillRect(0,0,en,boy);
    gorunen.drawImage(boya.canvas,0,0);
    if(taslak?.arac==='firca')cizgi(gorunen,taslak);
    gorunen.drawImage(murekkep.canvas,0,0);
    if(taslak?.arac==='kalem')cizgi(gorunen,taslak);
  }
  function uygula(h:Hamle){
    if(h.arac!=='kova'){
      cizgi(h.arac==='kalem'?murekkep:boya,h);
      if(h.arac==='kalem')harita=undefined;
      return true;
    }
    const {etiket,bolgeler}=alanlar(),[x,y]=h.noktalar[0],b=bolgeler[etiket[y*en+x]-1];
    if(!b||b.dis)return false;
    const im=boya.getImageData(0,0,en,boy),renk=rgb[h.renk];
    for(const p of b.alan){const i=p*4;im.data[i]=renk[0];im.data[i+1]=renk[1];im.data[i+2]=renk[2];im.data[i+3]=255}
    boya.putImageData(im,0,0);return true;
  }
  function yukle(hamleler:Hamle[]){
    murekkep.clearRect(0,0,en,boy);boya.clearRect(0,0,en,boy);harita=undefined;
    hamleler.forEach(uygula);goster();
  }
  function degerlendir():Eksik|null {
    const {bolgeler,etiket}=alanlar(),renkler=boya.getImageData(0,0,en,boy).data;
    const balonlar=bolgeler.filter(b=>{
      const w=b.sag-b.sol+1,h=b.alt-b.ust+1;
      return !b.dis&&w>=22&&h>=24&&w/h>.38&&w/h<2.35&&b.alan.length>w*h*.36;
    });
    function ipinUclari(b:Bolge):Nokta[]{
      const w=b.sag-b.sol,h=b.alt-b.ust,hedef=b.alt+Math.max(13,Math.min(27,h*.24));
      const sol=Math.max(0,Math.floor(b.sol-w*.65)),sag=Math.min(en-1,Math.ceil(b.sag+w*.65));
      const ust=Math.max(0,Math.floor(b.alt-h*.2)),goruldu=new Uint8Array(en*boy),sira:number[]=[];
      const ekle=(p:number)=>{
        const x=p%en,y=Math.floor(p/en);
        if(x<sol||x>sag||y<ust||y>=boy||goruldu[p])return;
        if(etiket[p]!==-1&&(!bolgeler[etiket[p]-1]?.dis||renkler[p*4+3]<160))return;
        goruldu[p]=1;sira.push(p);
      };
      for(const p of b.alan)if(Math.floor(p/en)>=ust)ekle(p+en);
      const uclar:Nokta[]=[];
      for(let i=0;i<sira.length;i++){
        const p=sira[i];if(Math.floor(p/en)>=hedef){uclar.push([p%en,Math.floor(p/en)]);continue}
        ekle(p-1);ekle(p+1);ekle(p-en);ekle(p+en);
      }
      return uclar;
    }
    const adaylar=balonlar.map(b=>{
      const sayilar=rgb.map(()=>0);
      for(const p of b.alan){
        const i=p*4;if(renkler[i+3]<170)continue;
        const r=rgb.findIndex(c=>Math.abs(c[0]-renkler[i])+Math.abs(c[1]-renkler[i+1])+Math.abs(c[2]-renkler[i+2])<32);
        if(r>=0)sayilar[r]++;
      }
      const enCok=Math.max(...sayilar);
      return {b,renk:enCok>=b.alan.length*.45?sayilar.indexOf(enCok):-1};
    });
    // Fırçayla doğrudan boyanan balonların da kalemle çizilenlerle aynı hakkı var.
    const disRenk=new Uint8Array(en*boy);
    for(let p=0;p<disRenk.length;p++){
      if(!bolgeler[etiket[p]-1]?.dis||renkler[p*4+3]<180)continue;
      const i=p*4;
      disRenk[p]=1+rgb.findIndex(c=>Math.abs(c[0]-renkler[i])+Math.abs(c[1]-renkler[i+1])+Math.abs(c[2]-renkler[i+2])<32);
    }
    for(let p=0;p<disRenk.length;p++){
      const renk=disRenk[p];if(!renk)continue;
      const grup=[p],satirlar=new Map<number,{sol:number;sag:number}>();
      disRenk[p]=0;let enGenis=0;
      for(let j=0;j<grup.length;j++){
        const n=grup[j],x=n%en,y=Math.floor(n/en);
        const sat=satirlar.get(y)??{sol:x,sag:x};
        sat.sol=Math.min(sat.sol,x);sat.sag=Math.max(sat.sag,x);satirlar.set(y,sat);
        enGenis=Math.max(enGenis,sat.sag-sat.sol);
        for(const komsu of [x>0?n-1:-1,x<en-1?n+1:-1,n-en,n+en])if(disRenk[komsu]===renk){disRenk[komsu]=0;grup.push(komsu)}
      }
      if(enGenis<28)continue;
      let sol=en,sag=0,ust=boy,alt=0;
      for(const [y,sat] of satirlar)if(sat.sag-sat.sol>=Math.max(22,enGenis*.35)){
        sol=Math.min(sol,sat.sol);sag=Math.max(sag,sat.sag);ust=Math.min(ust,y);alt=Math.max(alt,y);
      }
      const h=alt-ust,w=sag-sol;if(h<25||w/h<.38||w/h>2.35)continue;
      const alan=Int32Array.from(grup.filter(n=>Math.floor(n/en)>=ust&&Math.floor(n/en)<=alt));
      if(alan.length>w*h*.58)adaylar.push({renk:renk-1,b:{sol,sag,ust,alt,alan,dis:false}});
    }
    if(adaylar.length<2)return 'sekil';
    const boyali=adaylar.filter(v=>v.renk>=0);
    if(boyali.length<2)return 'eksik_boya';
    if(new Set(boyali.map(b=>b.renk)).size<2)return 'ayni';
    // Ortadan iki renge boyanan tek balonun bir ipini iki ayrı ip olarak sayma.
    const ipler=boyali.map(v=>({renk:v.renk,uclar:ipinUclari(v.b)}));
    for(let i=0;i<ipler.length;i++)for(let j=0;j<i;j++){
      const a=ipler[i],b=ipler[j];
      if(a.renk!==b.renk&&a.uclar.some(p=>b.uclar.some(q=>uzak(p,q)>22)))return null;
    }
    return 'ip';
  }
  return {goster,uygula,yukle,degerlendir};
}

// Sınıf panosu: öğretmenin astığı resimler kalıcıdır (Barış 2026-11-10: "panoya asılan resmi devamlı görmemiz lazım").
// Bütün girişler (sabah, sınıf, ?ders=pano) aynı panoyu paylaşır; en yeni resim başta, en çok PANO_SINIRI resim.
// Resim küçük bir görüntü olarak saklanır (çizgi listesi yerine), kayıt yeri dolmasın.
export const PANO_SINIRI=6;
const galeriAnahtari='minkino-hazirlik-pano-galeri-v1';
export interface AsiliResim { resim:string; tarih:number }
export function panoGalerisi():AsiliResim[]{
  try{
    const a=JSON.parse(localStorage.getItem(galeriAnahtari)||'[]');
    if(!Array.isArray(a))return [];
    return a.filter(r=>r&&typeof r.resim==='string'&&r.resim.startsWith('data:image/')&&typeof r.tarih==='number').slice(0,PANO_SINIRI);
  }catch{return []}
}
export function panoyaAs(resim:string):AsiliResim[]{
  const liste=[{resim,tarih:Date.now()},...panoGalerisi()].slice(0,PANO_SINIRI);
  // Yer yetmezse eski resimlerden biri bırakılır; oyun kayıtsız da sürer.
  for(let n=liste.length;n>0;n--){
    try{localStorage.setItem(galeriAnahtari,JSON.stringify(liste.slice(0,n)));return liste.slice(0,n)}catch{/* yer yok */}
  }
  return liste;
}
/** Tuvaldeki resmin panoya asılacak küçük kopyası (yarım boy) */
export function resminKopyasi(c:HTMLCanvasElement){
  const k=document.createElement('canvas');k.width=en/2;k.height=boy/2;
  k.getContext('2d')!.drawImage(c,0,0,k.width,k.height);
  const webp=k.toDataURL('image/webp',.82);
  return webp.startsWith('data:image/webp')?webp:k.toDataURL('image/png');
}
