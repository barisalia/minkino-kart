import {chromium} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {kaliplar} from './pati-govde-cizgileri.mjs';
import {motifs,speciesMarks,signatureMarks} from './pati-giysi-nakis.mjs';

const root=new URL('../assets/pati-yeni/',import.meta.url);
const jaw=JSON.parse(await readFile(new URL('pati-yaka-yerleri.json',import.meta.url)));
const keys=['atki','fular','yelek','papatya','cilekli','ormanci','pelerin','gece-pelerini','imza'];
const colors=['#df654e','#3879a6','#71ad98','#dfab49','#d66880','#477d69','#806aa5','#344f75'];
const palettes={
 kopek:colors,kedi:['#699ea7','#e27b68','#d59b4c','#8987b0','#d5778e','#529c9d','#816bab','#355279'],
 tavsan:['#719b75','#e8a353','#68a384','#e9b969','#cc7180','#628dab','#a77b9f','#396969'],
 hamster:['#e8a267','#65a4af','#d7776d','#e5bc72','#cf8092','#7f9966','#9e839e','#47577f'],
 kus:['#69a688','#d77863','#64a7ae','#ecc269','#bc6981','#40836c','#9789b4','#44658c'],
 civciv:['#72a8c0','#edb34f','#85b080','#df856a','#c9777c','#679b74','#af87aa','#476089'],
 ordek:['#db7764','#4c84a5','#78afb0','#dab267','#c48297','#4e9181','#8780a6','#384d72'],
 kirpi:['#be9561','#db8363','#7da17b','#8c96b4','#ba7483','#7d9060','#927996','#4b716b'],
 geko:['#d88370','#73a6b4','#65ab9a','#c9ae60','#c47a81','#739371','#a382ac','#4d6186'],
 kaplumbaga:['#ce9365','#72a6a2','#9aad6a','#d4ab61','#d08b9a','#719471','#9784a5','#476888']
};
const unique={
 kopek:['#427da2','#518aa6','#ab754b','#7b5978','#d195aa','#53806c'], kedi:['#79aaa5','#e48c74','#806399','#4286a6','#99bed2','#d8a255'],
 tavsan:['#849d65','#de8a88','#9690b8','#78a475','#706d9d','#648fa0'], hamster:['#b5815c','#64a19a','#b08b5c','#b2759a'],
 kus:['#6a9d72','#6da7bc','#9b81b1','#d8aa51','#c76e78','#589d9d'],civciv:['#dbad5b','#ce7880','#78a18c'],
 ordek:['#cb9e54','#52866f','#81aba9','#d58272','#4c6488','#69a2aa'],kirpi:['#c97a68','#6c99af','#b99a60'],
 geko:['#83a669','#cc9463','#69a7a3'],kaplumbaga:['#769d79','#5a8da0','#cfaa60']
};
const baseDog='M31 2 Q50 10 68 2 Q80 21 84 40 Q83 46 78 50 Q71 52 67 49 L66 56 Q50 62 35 55 L34 49 Q27 52 21 49 L16 40 Q20 19 31 2Z';
const stride={
 kopek:['M8 28 Q10 12 36 16 Q57 22 64 1 L89 4 Q94 20 88 40 Q82 50 70 59 L62 78 Q53 81 46 75 L48 60 Q33 62 13 56 Q6 50 8 28Z','M12 27 Q15 12 38 17 Q60 23 67 1 L93 4 Q96 22 89 42 Q86 54 88 73 Q81 80 72 77 L64 57 Q42 64 23 57 Q10 51 12 27Z'],
 kedi:['M13 52 Q15 40 42 42 Q61 49 67 32 L90 34 Q94 45 87 59 Q77 66 68 68 L62 85 Q53 88 47 80 L50 70 Q34 72 19 68 Q11 65 13 52Z','M17 51 Q19 40 45 43 Q65 48 70 32 L94 34 Q98 46 90 59 Q86 64 89 78 Q82 85 75 83 L66 69 Q42 74 25 68 Q15 64 17 51Z']
};
// Neck centres are in the local coordinate system of each illustrated body.
const birdNecks = {
 ordek: [65, 80, 68, 80, 79, 78],
 kus: [30, 24, 37, 23, 33, 25],
 civciv: [53, 53, 53]
};
function birdAccessory(family, body, chin, ratio, style) {
 const hats = {
  3: '<path fill="#e6ad55" d="M19 35 Q21 10 32 9 Q44 14 56 9 Q71 5 76 35Z"/><path fill="#389887" d="M20 26 Q46 34 74 24 L76 34 Q47 43 18 35Z"/><path fill="#f6cc7c" d="M4 33 Q25 37 44 35 Q71 33 84 27 Q94 24 95 29 Q92 39 60 43 Q23 48 5 40 Q0 37 4 33Z"/>',
  7: '<path fill="#e7ad5c" d="M48 11 Q44 5 48 2 Q55 0 55 9Z"/><path fill="#50507f" d="M12 35 Q0 25 13 17 Q24 9 46 8 Q74 3 86 15 Q96 26 75 35 Q43 47 12 35Z"/><path fill="#343757" d="M13 32 Q44 39 76 27 L78 34 Q50 48 16 39Z"/>',
  8: '<path fill="#fbf4dc" d="M14 33 Q3 29 4 20 Q4 14 15 11 Q33 5 45 3 Q67 -1 83 7 Q92 12 86 20 L77 29 Q47 39 14 33Z"/><path fill="#283e5c" d="M13 27 Q45 31 81 19 L78 29 Q48 42 16 36Z"/><path fill="#355276" d="M31 35 Q61 33 80 24 Q86 24 94 28 Q99 32 87 35 Q61 43 35 39Z"/><path fill="#f4bd50" d="M41 18 L46 12 L52 16 L49 23 L44 25Z"/>'
 };
 if (hats[style]) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -3 103 53"><g stroke="#201922" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${hats[style]}</g></svg>`;
 const tie = [1, 2, 5, 7].includes(style);
 const colors = ['#de5651','#27799b','#4673ac','#e8aa37','#d76d82','#368579','#8062a0','#344e82','#b84244'];
 const fabric = colors[style];
 const gold = '#f7c45d';
 const shape = tie
  ? '<path d="M-2 2 L2 2 L4 11 L0 15 L-4 11Z"/><path d="M-4 -3 Q0 -5 4 -3 L2 2 Q0 3 -2 2Z"/>'
  : '<path d="M-1 -1 Q-7 -6 -10 -5 Q-12 0 -10 5 Q-6 6 -1 2Z M1 -1 Q7 -6 10 -5 Q12 0 10 5 Q6 6 1 2Z"/><path d="M-3 -2 Q0 -4 3 -2 L3 2 Q0 4 -3 2Z"/>';
 const detail = tie
  ? '<path d="M-2.6 9 L2.5 6" fill="none" stroke="'+gold+'"/>'
  : '<path d="M-7 -1 L-4 0 M7 -1 L4 0" fill="none"/>';
 const x = birdNecks[family][body];
 const scale = tie ? 1.32 : 1.65;
 const y = (chin + 1) * ratio / 100 + (tie ? 3.6 : 4.5) * scale;
 const bounds = tie ? '-5 -5 10 21' : '-12 -6 24 12';
 const [left,top,width,height] = bounds.split(' ').map(Number);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x+left*scale} ${y+top*scale} ${width*scale} ${height*scale}" width="${width}" height="${height}"><view id="poz" viewBox="0 0 100 ${ratio}" preserveAspectRatio="none"/><g transform="translate(${x} ${y}) scale(${scale})" fill="${fabric}" stroke="#171419" stroke-width=".85" stroke-linejoin="round" stroke-linecap="round">${shape}${detail}</g></svg>`;
}
const browser=await chromium.launch({channel:'msedge'});
try{
 const page=await browser.newPage();
 for(const [family,bodies] of Object.entries(kaliplar)){
  for(let i=0;i<bodies.length;i++){
   const poses=[['otur',bodies[i]||baseDog,...jaw[family][i]]];
   if(stride[family])stride[family].forEach((shape,step)=>poses.push(['adim'+step,shape,family==='kopek'?15:40,jaw[family][i][1]]));
   for(const [pose,path,chin,ratio] of poses){
    const folder=new URL('terzilik/'+family+'-'+i+'/'+pose+'/',root);await mkdir(folder,{recursive:true});
    for(const [k,id] of keys.entries()){
     if (birdNecks[family]) {
      await writeFile(new URL(id+'.svg', folder), birdAccessory(family,i,chin,ratio,k));
      continue;
     }
     const mark=id==='imza'?signatureMarks[family][i]:speciesMarks[family][k];
     const color=id==='imza'?unique[family][i]:palettes[family][k];
     const svg=await page.evaluate(({path,chin,ratio,family,i,k,pose,motif,color})=>{
      const ink='#151515',cream='#fff3ce',accent=k===7?'#ffce72':k===6?'#e0c4df':cream;
      const shell=family==='kaplumbaga',low=shell||family==='geko',walking=pose!=='otur';
      const pen=document.createElement('canvas').getContext('2d');
      const outline=new Path2D(path);
      function span(y){
       let left=100,right=0;
       for(let x=0;x<=100;x+=.5)if(pen.isPointInPath(outline,x,y)){left=Math.min(left,x);right=x}
       return [left,right];
      }
      const rows=Array.from({length:100},(_,y)=>span(y));
      const top=rows.findIndex(([l,r])=>r>l),bottom=rows.findLastIndex(([l,r])=>r>l);
      const height=bottom-top;
      const neckline=low?top+height*.22:Math.min(chin+1,bottom-height*.41);
      const [l,r]=span(Math.round(neckline+2));
      const front=walking?r-(r-l)*.22:(l+r)/2;
      const scarf=[0,1,3,4].includes(k);
      // The edges of a short collar stop at the neck; it does not inherit a shirt hem.
      const collarTop=low?top+height*.12:Math.max(top,neckline-height*.27);
      const collarBottom=neckline+height*(k===1?.38:.30);
      const point=walking?front:(l+r)*.5;
      let cut=path;
      if(scarf&&!shell){
       cut=`M${l-2} ${collarTop} Q${front} ${neckline+2} ${r+2} ${collarTop}
        L${r+1} ${neckline+4} Q${front+3} ${collarBottom-4} ${point} ${collarBottom}
        Q${front-4} ${collarBottom-2} ${l-1} ${neckline+5} Z`;
      }
      const newPath=new Path2D(cut);
      const inside=(x,y)=>pen.isPointInPath(outline,x,y)&&pen.isPointInPath(newPath,x,y);
      let xmin=100,xmax=0,ymin=100,ymax=0;
      for(let y=0;y<=100;y++)for(let x=0;x<=100;x++)if(inside(x,y)){
       xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);
      }
      const width=xmax-xmin,h=ymax-ymin,aspect=ratio/100;
      // Put the emblem inside the largest visible patch of cloth beneath the muzzle.
      let best=-1,badge={x:front,y:(ymin+ymax)/2,r:1};
      const jacket=k===2||k===5||k===8;
      const target=walking?(xmin+.48*width):jacket?xmin+width*.32:front;
      for(let y=Math.max(ymin+1,low||walking?ymin+1:chin+1);y<ymax;y+=1.5)for(let x=xmin+1;x<xmax;x+=1.5){
       if(!inside(x,y))continue;
       let radius=0,limit=Math.min(width*(jacket?.15:.22),h*aspect*(jacket?.19:.32),jacket?8:12);
       for(let d=1;d<=limit;d+=1){
        if(![0,1,2,3,4,5,6,7].every(n=>inside(x+Math.cos(n*Math.PI/4)*d,y+Math.sin(n*Math.PI/4)*d/aspect)))break;
        radius=d;
       }
       const score=radius-.22*Math.abs(target-x)-.10*Math.abs(y-(ymin+h*.66));
       if(score>best){best=score;badge={x,y,r:radius}}
      }
      const p=(d,fill='none',stroke=ink,sw=1)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      const line=(d,c,sw)=>p(d,'none',c,sw);
      const center=walking?xmax-width*.18:front;
      const band=(y,depth,c)=>p(`M${xmin-5} ${y} Q${center} ${y+depth} ${xmax+5} ${y-1} v5 Q${center} ${y+depth+5} ${xmin-5} ${y+5}Z`,c,'none');
      let details='';
      if(scarf){
       details=band(neckline-3,5,k===0?'#f1c47e':cream);
       if(k===1)details+=line(`M${xmin} ${neckline+6} Q${front} ${collarBottom+1} ${xmax} ${neckline+6}`,cream,1.4);
      }
      else if(k===2||k===5||k===8){
       const seam=walking?xmax-width*.24:xmin+width*.63;
       details=line(`M${seam-2} ${ymin} Q${seam+1} ${ymin+h*.55} ${seam} ${ymax+3}`,ink,.85);
       const collarY=Math.max(neckline-4,ymin+2);
       details+=p(`M${seam-width*.35} ${collarY-6} Q${seam-width*.1} ${collarY-1} ${seam} ${collarY+5} L${seam-width*.13} ${collarY+11}Z`,accent,ink,.8);
       details+=p(`M${seam} ${collarY+5} L${seam+width*.29} ${collarY-5} L${seam+width*.12} ${collarY+10}Z`,accent,ink,.8);
       details+=[.66,.83].map(t=>`<circle cx="${seam}" cy="${ymin+h*t}" r="1.4" fill="#f6c76c" stroke="${ink}" stroke-width=".65"/>`).join('');
      }else{
       details=band(ymin+h*.66,9,accent)+line(`M${xmin-3} ${ymin+h*.66-2} Q${center} ${ymin+h*.66+7} ${xmax+3} ${ymin+h*.66-3}`,accent,.8);
      }
      const bg=family==='kopek'&&k===0?'#ce564e':color;
      const badgeScale=badge.r/12;
      const art=p(cut,bg,ink,1.45)+`<g clip-path="url(#cut)">${details}<g transform="translate(${badge.x} ${badge.y}) scale(${badgeScale} ${badgeScale/aspect}) translate(-12 -12)" stroke="${ink}" stroke-width="1.35">${motif}</g></g>`;
      const box=[xmin-2,(ymin-2)*aspect,width+4,(h+4)*aspect].join(' ');
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${width+4}" height="${(h+4)*aspect}"><view id="poz" viewBox="0 0 100 ${ratio}" preserveAspectRatio="none"/><defs><clipPath id="fit"><path d="${path}"/></clipPath><clipPath id="cut"><path d="${cut}"/></clipPath></defs><g transform="scale(1 ${aspect})" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#fit)">${art}</g></svg>`.replace(/-?\d+\.\d{3,}/g,n=>String(Number(Number(n).toFixed(2))));
     },{path,chin,ratio,family,i,k,pose,motif:motifs[mark],color});
     await writeFile(new URL(id+'.svg',folder),svg);
    }
   }
  }
 }
}finally{await browser.close();}
