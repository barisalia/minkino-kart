const sharp=require('sharp'),fs=require('fs'),path=require('path');
const out=path.resolve(__dirname,'../../assets/okul'),sheets={
'kart-a':['sinif-karti','canta-karti','bento-karti','boru-karti'],'kart-b':['tren-karti','saklan-karti','bahce-karti','mezun-karti'],
kids:['kino','mino','zipzip','kuzu'],yeni:['bulut','tombi','ceren','tombi-hop'],buyukler:['baba','baba-uyku','baba-cay','dede'],
aletler:['zil','canta','kurbaga','radyo'],tezgah:['kutu','tren','kazan','vinc'],pozlar:['kino-acil','kino-dans','mino-kamyon','zipzip-cek'],
mekan:['perde','masa','sepet','dolap'],sosyal:['tuvalet','kumsaati','kalemtiras','elma'],
deney:['sari','kirmizi','mavi','corap'],oyuncak:['kamyon','davul','fener','kol'],odul:['fasulye','resim','bayrak','kupa'],
bilye:['top','cark','kova','can'],mezun:['kep','kamera','kino-havada','kino-boya'],tepkiler:['canta-tok','canta-puf','kurbaga-hop','kurbaga-islak']};
(async()=>{for(const n of ['kapak','sinif','bahce',...Object.keys(sheets)]){const file=path.join(__dirname,n+'.png');if(!fs.existsSync(file))continue;
const pic=sharp(file),m=await pic.metadata();if(!sheets[n]){await pic.resize({width:n==='kapak'?1600:1440,withoutEnlargement:true}).webp({quality:92}).toFile(path.join(out,n+'.webp'));continue}
const w=Math.floor(m.width/2),h=Math.floor(m.height/2);for(let i=0;i<4;i++){const buffer=await sharp(file).extract({left:(i%2)*w,top:Math.floor(i/2)*h,width:w,height:h}).png().toBuffer(),tile=sharp(buffer);
if(!n.startsWith('kart'))tile.trim({threshold:12});await tile.resize({width:n.startsWith('kart')?640:460,height:n.startsWith('kart')?480:500,fit:'inside',withoutEnlargement:true}).webp({quality:92,alphaQuality:100}).toFile(path.join(out,sheets[n][i]+'.webp'))}}
console.log('Okul görselleri',fs.readdirSync(out).filter(n=>n.endsWith('.webp')).length)})()
