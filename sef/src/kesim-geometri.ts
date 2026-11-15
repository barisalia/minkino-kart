import konturlar from './sebze-konturlari.json';
import type { MalzemeId } from './tarif';

export interface Nokta { x: number; y: number }
export interface Cizgi { a: Nokta; b: Nokta }
export interface Kesim extends Cizgi { parca: number }
export interface SebzeParcasi {
  kontur: Nokta[];
  maske: Nokta[];
  et: Nokta[];
  konum: Nokta;
  yuzler: Cizgi[];
}
export const boy = (id: MalzemeId) => konturlar[id].boy;
export const fark = (a: Nokta, b: Nokta): Nokta => ({ x: a.x - b.x, y: a.y - b.y });
export const topla = (a: Nokta, b: Nokta): Nokta => ({ x: a.x + b.x, y: a.y + b.y });
export const uzaklik = (a: Nokta, b: Nokta) => Math.hypot(a.x-b.x, a.y-b.y);
const carp = (a: Nokta, n: number): Nokta => ({ x: a.x*n, y: a.y*n });
const vektorCarpimi = (a: Nokta, b: Nokta) => a.x*b.y - a.y*b.x;
const noktasal = (a: Nokta, b: Nokta) => a.x*b.x + a.y*b.y;
const ara = (a: Nokta, b: Nokta, t: number) => topla(a, carp(fark(b,a),t));
const alan = (p: Nokta[]) => Math.abs(p.reduce((s,a,i) => s + vektorCarpimi(a,p[(i+1)%p.length]), 0))/2;

function butun(id: MalzemeId): SebzeParcasi {
  const h = boy(id);
  const kaynak = konturlar[id];
  const kontur = kaynak.kontur.map(([x,y]) => ({x,y}));
  const et = 'et' in kaynak ? kaynak.et.map(([x,y]) => ({x,y})) : kontur;
  return {
    kontur, et,
    maske: [{x:0,y:0},{x:640,y:0},{x:640,y:h},{x:0,y:h}],
    konum: {x:0,y:0}, yuzler: [],
  };
}

// Dokunma için sebzenin gerçek dış hattını, çizim için yalnız kesme düzlemini kullan.
// Böylece saydam köşelerde kesim olmaz ve piksel konturu yeniden çizilmez.
function kirp(poly: Nokta[], mesafe: (p: Nokta) => number) {
  const sonuc: Nokta[] = [];
  for (let i=0; i<poly.length; i++) {
    const a=poly[i], b=poly[(i+1)%poly.length];
    const da=mesafe(a), db=mesafe(b);
    if (da>=0) sonuc.push(a);
    if ((da>=0)!==(db>=0)) sonuc.push(ara(a,b,da/(da-db)));
  }
  return sonuc;
}

function kesit(parca: SebzeParcasi, c: Cizgi) {
  const v=fark(c.b,c.a), uzunluk=uzaklik(c.a,c.b);
  if (uzunluk<1) return;
  const yon=carp(v,1/uzunluk);
  const mesafe=(p: Nokta) => vektorCarpimi(yon,fark(p,c.a));
  const ust=kirp(parca.kontur,mesafe), alt=kirp(parca.kontur,p => -mesafe(p));
  // Küçük kırıntıları ve yaprak/sap ucundaki tek piksel temasını sayma.
  if (Math.min(alan(ust),alan(alt)) < Math.max(4700,alan(parca.kontur)*.13)) return;
  const et=kirp(parca.et,mesafe);
  const noktalar=et.filter(p => Math.abs(mesafe(p))<.01)
    .sort((a,b) => noktasal(fark(a,b),yon));
  if (noktalar.length<2) return;
  const a=noktalar[0], b=noktalar[noktalar.length-1];
  if (uzaklik(a,b)<54) return;
  return { a,b,yon,mesafe,ust,alt };
}

function yuzKirp(c: Cizgi, mesafe: (p: Nokta) => number): Cizgi[] {
  const da=mesafe(c.a), db=mesafe(c.b);
  if (da<0 && db<0) return [];
  if (da>=0 && db>=0) return [c];
  const p=ara(c.a,c.b,da/(da-db));
  return [da<0 ? {a:p,b:c.b} : {a:c.a,b:p}];
}

export function ayir(parcalar: SebzeParcasi[], kesim: Kesim): SebzeParcasi[] {
  const parca=parcalar[kesim.parca];
  if (!parca) return parcalar;
  const k=kesit(parca,kesim);
  if (!k) return parcalar;
  const normal={x:-k.yon.y,y:k.yon.x};
  const acilma=Math.min(30,uzaklik(k.a,k.b)*.13);
  const yarim=(yon: number, kontur: Nokta[]): SebzeParcasi => {
    const mesafe=(p: Nokta) => k.mesafe(p)*yon;
    const yuzler=parca.yuzler.flatMap(y => yuzKirp(y,mesafe));
    if (yon===1) yuzler.push({a:k.a,b:k.b});
    return {kontur,et:kirp(parca.et,mesafe),maske:kirp(parca.maske,mesafe),yuzler,konum:topla(parca.konum,carp(normal,yon*acilma))};
  };
  const cocuklar=[yarim(1,k.ust),yarim(-1,k.alt)];
  return parcalar.flatMap((eski,i) => {
    if(i===kesim.parca) return cocuklar;
    const delta=fark(eski.konum,parca.konum);
    const u=carp(delta,1/Math.max(1,Math.hypot(delta.x,delta.y)));
    const itme=Math.abs(noktasal(normal,u))*acilma;
    return [{...eski,konum:topla(eski.konum,carp(u,itme))}];
  });
}

function aday(parcalar: SebzeParcasi[], hareket: Cizgi, i: number) {
  const p=parcalar[i], a=fark(hareket.a,p.konum), b=fark(hareket.b,p.konum);
  const k=kesit(p,{a,b});
  if (!k) return;
  const uzunluk=uzaklik(k.a,k.b);
  const tolerans=Math.min(38,uzunluk*.16);
  if (noktasal(fark(a,k.a),k.yon)>tolerans || noktasal(fark(k.b,b),k.yon)>tolerans) return;
  // Kaydırma yönü, ayrılan parçaların hangi yöne açılacağını değiştirmesin.
  const ters=Math.abs(k.a.y-k.b.y)<1 ? k.a.x>k.b.x : k.a.y>k.b.y;
  const sonuc: Kesim={parca:i,a:ters?k.b:k.a,b:ters?k.a:k.b};
  return {sonuc, giris:noktasal(fark(k.a,a),k.yon)};
}

export function serbestKes(parcalar: SebzeParcasi[], iz: Nokta[]): Kesim | undefined {
  if (iz.length<2 || uzaklik(iz[0],iz[iz.length-1])<48) return;
  const hareket={a:iz[0],b:iz[iz.length-1]}, v=fark(hareket.b,hareket.a);
  const mesafe=uzaklik(hareket.a,hareket.b);
  if (iz.some(p => Math.abs(vektorCarpimi(v,fark(p,hareket.a)))/mesafe > Math.max(22,mesafe*.14))) return;
  return parcalar.map((_,i) => aday(parcalar,hareket,i)).filter(a => a!==undefined)
    .sort((a,b) => a.giris-b.giris)[0]?.sonuc;
}

/** A short straight swipe that entered the food can be continued to its own
 * exit edge. Keep the guide local to the piece touched by the child. */
export function yarimKesimRehberi(parcalar:SebzeParcasi[],iz:Nokta[]):Cizgi|undefined{
  if(iz.length<2)return;
  const bas=iz[0],son=iz[iz.length-1],uzunluk=uzaklik(bas,son);
  if(uzunluk<40)return;
  const yon=carp(fark(son,bas),1/uzunluk);
  if(iz.some(p=>Math.abs(vektorCarpimi(yon,fark(p,bas)))>Math.max(22,uzunluk*.14)))return;
  let rehber:Cizgi|undefined,enYakin=Infinity;
  for(const p of parcalar){
    const k=kesit(p,{a:fark(bas,p.konum),b:fark(son,p.konum)});
    if(!k)continue;
    const a=topla(k.a,p.konum),b=topla(k.b,p.konum);
    const ilerleme=noktasal(fark(son,a),yon),kalan=noktasal(fark(b,son),yon);
    if(ilerleme<4||kalan<10)continue;
    const ortadanBasladi=noktasal(fark(bas,a),yon)>Math.min(38,uzaklik(a,b)*.16);
    if(kalan<enYakin){enYakin=kalan;rehber={a:ortadanBasladi?a:son,b};}
  }
  return rehber;
}

export function ornekKesim(parcalar: SebzeParcasi[], id: MalzemeId, tercih?:number): Kesim {
  const sirali=parcalar.map((p,i)=>({p,i})).sort((a,b)=>Number(b.i===tercih)-Number(a.i===tercih)||alan(b.p.et)-alan(a.p.et));
  for(const {p,i} of sirali) {
    const orta=p.et.reduce((s,n)=>topla(s,n),{x:0,y:0});
    if(!p.et.length) continue;
    const m=carp(orta,1/p.et.length);
    const uzunSebze=id==='havuc'||id==='salatalik';
    const yon=uzunSebze ? 65 : 95;
    // Sonraki kesişlerde en iri parçayı enine de böl, uzun şeritler kalmasın.
    const acilar=parcalar.length===1 ? [yon] : [yon+85,yon,yon-35];
    let enIyi: { puan: number; kesim: Kesim } | undefined;
    for(const derece of [...acilar,0,30,60,90,120,150]) {
      const aci=derece*Math.PI/180;
      const v={x:800*Math.cos(aci),y:800*Math.sin(aci)};
      for(const kayma of [0,-28,28]) {
        const merkez={x:m.x-kayma*Math.sin(aci),y:m.y+kayma*Math.cos(aci)};
        const k=kesit(p,{a:fark(merkez,v),b:topla(merkez,v)});
        if(!k) continue;
        const denge=Math.min(alan(k.ust),alan(k.alt))/Math.max(alan(k.ust),alan(k.alt));
        const puan=denge+(acilar[0]===derece?.14:0)-uzaklik(k.a,k.b)/2000;
        if(!enIyi || enIyi.puan<puan) enIyi={puan,kesim:{parca:i,a:k.a,b:k.b}};
      }
    }
    if(enIyi) return enIyi.kesim;
  }
  throw new Error('Sebze için kesim hattı bulunamadı');
}

/** Salatalıkta eksene dik dilimler, domateste yelpaze, marulda çapraz lokmalar. */
export function salataKesimi(parcalar: SebzeParcasi[], id: MalzemeId, hedefParca=5, tercih?:number): Kesim {
  const ilk=butun(id);
  const hedefAlan=alan(ilk.et)/hedefParca;
  const sirali=parcalar.map((p,i)=>({p,i,alan:alan(p.et)})).sort((a,b)=>Number(b.i===tercih)-Number(a.i===tercih)||b.alan-a.alan);
  for(const aday of sirali) {
    const {p,i}=aday;
    if(p.et.length<3)continue;
    const bolum=Math.max(2,Math.round(aday.alan/hedefAlan));
    const istenen=id==='salatalik'?1/bolum:Math.floor(bolum/2)/bolum;
    let enIyi: {kesim:Kesim;hata:number}|undefined;
    const dene=(c:Cizgi,yonTercihi=0)=>{
      const k=kesit(p,c);
      if(!k)return;
      const yuz=alan(kirp(p.et,k.mesafe))/aday.alan;
      const hata=Math.abs(yuz-istenen)+yonTercihi;
      if(!enIyi||hata<enIyi.hata)enIyi={hata,kesim:{parca:i,a:k.a,b:k.b}};
    };
    if(id==='domates'){
      // Çiçek sapı yukarıda; alt omuzdan açılan yelpaze üstteki eti paylaştırır.
      const merkez={x:320,y:boy(id)*.91};
      for(let d=-168;d<=-12;d+=1){
        const a=d*Math.PI/180, v={x:850*Math.cos(a),y:850*Math.sin(a)};
        dene({a:fark(merkez,v),b:topla(merkez,v)});
      }
    }else{
      const aci=(id==='salatalik'?63:(parcalar.length===1?75:parcalar.length===2?-23:parcalar.length===3?34:108))*Math.PI/180;
      const yon={x:Math.cos(aci),y:Math.sin(aci)}, normal={x:-yon.y,y:yon.x};
      const yansimalar=p.et.map(n=>noktasal(n,normal));
      const enAz=Math.min(...yansimalar),enCok=Math.max(...yansimalar);
      for(let s=1;s<100;s++){
        const m=carp(normal,enAz+(enCok-enAz)*s/100), uzat=carp(yon,1200);
        dene({a:fark(m,uzat),b:topla(m,uzat)});
      }
    }
    if(enIyi)return enIyi.kesim;
  }
  return ornekKesim(parcalar,id);
}

export function parcalariKur(id: MalzemeId, adet: number, kayit: readonly Kesim[] = []) {
  let parcalar=[butun(id)];
  for(let i=0; i<adet; i++) {
    const k=kayit[i];
    const gecerli = k && Number.isInteger(k.parca) && [k.a,k.b].every(p =>
      p && Number.isFinite(p.x) && Number.isFinite(p.y) && Math.abs(p.x)<=641 && Math.abs(p.y)<=641);
    const yeni=gecerli ? ayir(parcalar,k) : parcalar;
    parcalar=yeni!==parcalar ? yeni : ayir(parcalar,ornekKesim(parcalar,id));
  }
  return parcalar;
}
