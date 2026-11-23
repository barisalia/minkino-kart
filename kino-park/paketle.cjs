const fs=require('node:fs'),path=require('node:path');
const files={},dir=path.join(__dirname,'medya'),rig=require('./yuz.json');
for(const file of fs.readdirSync(dir)){
  const {name,ext}=path.parse(file);
  if(name in rig || /^sec\d+$/.test(name))continue;
  const mime={'.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'}[ext];
  if(mime)files[name]='data:'+mime+';base64,'+fs.readFileSync(path.join(dir,file)).toString('base64');
}
const data={files,rig,align:require('./zaman.json'),lines:require('./metin.json')};
const html=fs.readFileSync(path.join(__dirname,'oyun.html'),'utf8');
fs.writeFileSync(process.argv[2],html.replace('__PAKET__',()=>JSON.stringify(data)));
