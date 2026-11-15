import { kaynak } from './gorsel';
import { boy, uzaklik, type Nokta, type SebzeParcasi } from './kesim-geometri';
import type { MalzemeId } from './tarif';

export function svgOge<K extends keyof SVGElementTagNameMap>(ad: K, ozellik: Record<string, string | number> = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', ad);
  for (const [k,v] of Object.entries(ozellik)) el.setAttribute(k, String(v));
  return el;
}

export function parcaCiz(id: MalzemeId, p: SebzeParcasi) {
  const g = svgOge('g', {class:'dogranmis-parca',transform:`translate(${p.konum.x} ${p.konum.y})`});
  const kabuk = svgOge('image', {href:kaynak('nesneler',id),width:640,height:boy(id)});
  kabuk.style.clipPath = 'polygon(' + p.maske.map(n => n.x+'px '+n.y+'px').join(',') + ')';
  g.append(kabuk);
  for(const {a,b} of p.yuzler) {
    const en = uzaklik(a,b);
    if (en < 3) continue;
    if (id==='marul') {
      g.append(svgOge('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'#87bb49','stroke-width':3,'stroke-linecap':'round'}));
      continue;
    }
    const derinlik = Math.min(en*.24,83);
    const aci = Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
    const duzlem = svgOge('g',{transform:`translate(${(a.x+b.x)/2} ${(a.y+b.y)/2}) rotate(${aci})`});
    const yuz = svgOge('image',{
      href:kaynak('nesneler',id+'-kesit'),x:-en/2,y:-derinlik/2,width:en,height:derinlik,
      preserveAspectRatio:'none',
    });
    duzlem.append(yuz,svgOge('ellipse',{cx:0,cy:0,rx:en/2,ry:derinlik/2,
      fill:'none',stroke:'#322b23','stroke-width':2}));
    g.append(duzlem);
  }
  return g;
}

/** Aynı kesilmiş parçayı rafta, sürüklerken ve kâsede kendi sınırları içinde göster. */
export function kesikResmi(id: MalzemeId, parcalar: SebzeParcasi[]) {
  const noktalar: Nokta[] = parcalar.flatMap(p=>p.kontur.map(n=>({x:n.x+p.konum.x,y:n.y+p.konum.y})));
  const xs=noktalar.map(p=>p.x), ys=noktalar.map(p=>p.y);
  const minX=Math.min(...xs)-35, minY=Math.min(...ys)-35;
  const en=Math.max(...xs)-minX+35, boyut=Math.max(...ys)-minY+35;
  const goz=svgOge('svg',{viewBox:`${minX} ${minY} ${en} ${boyut}`,class:'kesik-resmi','aria-hidden':'true'});
  goz.append(...parcalar.map(p=>parcaCiz(id,p)));
  return goz;
}
