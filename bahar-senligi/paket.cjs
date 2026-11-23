const fs=require('fs'),p=require('path'),dir=__dirname,files={},rig={...require('../kino-park/yuz.json'),...require('./yuz.json')},lines=require('./lines.json'),align=[];
function asset(key,path){let ext=p.extname(path).slice(1),mime={webp:'image/webp',png:'image/png',mp3:'audio/mpeg',ttf:'font/ttf'}[ext];files[key]='data:'+mime+';base64,'+fs.readFileSync(path).toString('base64')}
for(const f of fs.readdirSync(dir+'/medya'))if(/\.(webp|mp3|png)$/.test(f))asset(p.parse(f).name,dir+'/medya/'+f);
for(const k of ['kino','kum','baba','arama','adim'])for(const [s,e] of [['-govde','webp'],['-agiz','png']])asset(k+s,dir+'/../kino-park/medya/'+k+s+'.'+e)
for(const k of ['bird','flap'])asset(k,dir+'/../limon/medya/'+k+'.webp');asset('font',dir+'/../limon/medya/Bangers.ttf');asset('music',dir+'/../music/Sunny_Morning_Tiptoe.mp3');
lines.forEach((_,i)=>align.push(require('./medya/v'+i+'.json')));
fs.writeFileSync(process.argv[2],fs.readFileSync(dir+'/oyun.html','utf8').replace('/*DATA*/',()=>JSON.stringify({files,rig,lines,align,license:fs.readFileSync(dir+'/../limon/medya/OFL.txt','utf8')})));

