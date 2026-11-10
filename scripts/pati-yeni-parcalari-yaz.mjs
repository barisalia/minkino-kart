import sharp from 'sharp';
import path from 'node:path';
const dir = 'assets/pati-yeni/kopek/cizim';
const sheet = path.join(dir, 'atlas.png');
const rows = [
  ['bas', 'uyku', 'sevin'],
  ['govde', 'sarkik', 'dik'],
  ['uzun', 'kivrik', 'damga']
];
const xs = [0, 433, 825, 1254], ys = [0, 451, 848, 1254];
for (const [row, names] of rows.entries()) {
  for (const [col, name] of names.entries()) {
    const crop = {left:xs[col], top:ys[row], width:xs[col+1]-xs[col], height:ys[row+1]-ys[row]};
    const sprite = await sharp(sheet).extract(crop).png().toBuffer();
    const {data, info} = await sharp(sprite).trim({background:'#00000000',threshold:8}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const layers = Object.fromEntries(['cizgi','tuy','acik'].map(key=>[key,Buffer.alloc(data.length)]));
    for(let i=0;i<data.length;i+=4){
      const [r,g,b,a]=data.subarray(i,i+4);
      if (!a) continue;
      const fur = r>90 && r>g*1.22 && g>b*1.6 && g>42;
      const cream = r>195 && g>168 && r-b>17 && g-b>7;
      const layer=fur?'tuy':cream?'acik':'cizgi';
      const output=layers[layer];
      const color = layer!=='cizgi'?[255,255,255]:r<75&&g<52?[32,19,16]:[r,g,b];
      output.set([...color,a],i);
    }
    for(const [key,buffer] of Object.entries(layers)){
      await sharp(buffer,{raw:info}).png({palette:true,quality:100}).toFile(path.join(dir,name+'-'+key+'.png'));
    }
  }
}
