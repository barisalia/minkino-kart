const sharp=require(require.resolve('sharp',{paths:['C:/Users/Minkex/Desktop/Minkino Games']}));
const S='C:/Users/Minkex/Desktop/minkino-film-gemini/sahne/park/';
const OPT={T:238, SAT:14, BAND:4, DARK:90, DR:7, HOLEFRAC:0.8, MINSPECK:60};
async function kes(name){
 const {data,info}=await sharp(S+name+'.png').removeAlpha().raw().toBuffer({resolveWithObject:true});
 const W=info.width,H=info.height,N=W*H;
 const lum=new Uint8Array(N), cand=new Uint8Array(N);
 for(let i=0;i<N;i++){const r=data[i*3],g=data[i*3+1],b=data[i*3+2];const mn=Math.min(r,g,b),mx=Math.max(r,g,b);
  lum[i]=(r*0.3+g*0.59+b*0.11)|0; cand[i]=(mn>=OPT.T && mx-mn<=OPT.SAT)?1:0;}
 // components of cand
 const comp=new Int32Array(N).fill(-1); const comps=[]; const q=new Int32Array(N);
 for(let s=0;s<N;s++){ if(!cand[s]||comp[s]>=0)continue; const id=comps.length; let h=0,t=0; q[t++]=s; comp[s]=id;
  let area=0,border=false,bnd=0,bndDark=0,minx=W,miny=H,maxx=0,maxy=0;
  while(h<t){const p=q[h++];area++;const x=p%W,y=(p/W)|0; if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;
   if(x==0||y==0||x==W-1||y==H-1)border=true;
   let isB=false;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;
    if(cand[n]){if(comp[n]<0){comp[n]=id;q[t++]=n;}} else if(!isB){isB=true;
      // step outward to look for dark outline
      let dark=false;for(let k=1;k<=OPT.DR;k++){const mx=x+dx*k,my=y+dy*k;if(mx<0||my<0||mx>=W||my>=H)break;if(lum[my*W+mx]<OPT.DARK && data[(my*W+mx)*3]<140){dark=true;break;}}
      bnd++; if(dark)bndDark++; }}
  }
  comps.push({id,area,border,bnd,bndDark,frac:bnd?bndDark/bnd:0,bbox:[minx,miny,maxx,maxy]});
 }
 // decide bg
 const isBgComp=comps.map(c=>c.border || (c.frac>=OPT.HOLEFRAC && c.area>=10));
 const holes=comps.filter(c=>!c.border && c.area>=1).sort((a,b)=>b.area-a.area);
 console.log(name,'comps',comps.length,'holes>=200:');
 for(const c of holes.slice(0,60)) console.log(' ',c.area,c.frac.toFixed(2),c.bbox.join(','),isBgComp[c.id]?'BG':'keep');
 const bg=new Uint8Array(N); for(let i=0;i<N;i++) if(comp[i]>=0&&isBgComp[comp[i]]) bg[i]=1;
 // distance band from bg
 const dist=new Uint8Array(N).fill(255); let h=0,t=0;
 for(let i=0;i<N;i++) if(bg[i]){dist[i]=0;q[t++]=i;}
 while(h<t){const p=q[h++];const d=dist[p];if(d>=OPT.BAND)continue;const x=p%W,y=(p/W)|0;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;if(dist[n]>d+1){dist[n]=d+1;q[t++]=n;}}}
 const out=Buffer.alloc(N*4);
 for(let i=0;i<N;i++){let r=data[i*3],g=data[i*3+1],b=data[i*3+2],a=255;
  if(bg[i]){r=g=b=0;a=0;}
  else if(dist[i]<=OPT.BAND){ // color to alpha against white
   const al=Math.max(255-r,255-g,255-b)/255;
   if(al<=0.004){a=0;r=g=b=0;} else {a=Math.round(al*255);
    r=Math.max(0,Math.min(255,Math.round((r-255*(1-al))/al)));g=Math.max(0,Math.min(255,Math.round((g-255*(1-al))/al)));b=Math.max(0,Math.min(255,Math.round((b-255*(1-al))/al)));}
  }
  out[i*4]=r;out[i*4+1]=g;out[i*4+2]=b;out[i*4+3]=a;}
 // remove tiny specks (alpha>0 components small)
 const seen=new Uint8Array(N); let removed=0;
 for(let s=0;s<N;s++){ if(seen[s]||out[s*4+3]===0)continue; let h=0,t=0;q[t++]=s;seen[s]=1;
  while(h<t){const p=q[h++];const x=p%W,y=(p/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;if(!seen[n]&&out[n*4+3]>0){seen[n]=1;q[t++]=n;}}}
  if(t<OPT.MINSPECK){for(let k=0;k<t;k++){out[q[k]*4+3]=0;}removed+=t;}}
 console.log(name,'speck px removed',removed);
 // debug: kept holes in red on grey
 const dbg=Buffer.alloc(N*3);
 for(let i=0;i<N;i++){const k=comp[i]>=0&&!comps[comp[i]].border; 
  if(k&&isBgComp[comp[i]]){dbg[i*3]=255;dbg[i*3+1]=0;dbg[i*3+2]=255;} else if(k){dbg[i*3]=0;dbg[i*3+1]=200;dbg[i*3+2]=255;} else {dbg[i*3]=dbg[i*3+1]=dbg[i*3+2]=lum[i]>>1;}}
 await sharp(dbg,{raw:{width:W,height:H,channels:3}}).resize(1400).png().toFile('dbg-'+name+'.png');
 await sharp(out,{raw:{width:W,height:H,channels:4}}).png().toFile('cut-'+name+'.png');
}
(async()=>{for(const n of process.argv.slice(2)) await kes(n);})();
