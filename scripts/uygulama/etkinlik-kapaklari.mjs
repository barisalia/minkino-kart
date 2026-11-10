// Etkinlik kapakları: oyunların kendi çizimleri + Fredoka logo, Astra'nın oyun kapaklarıyla aynı düzen (1280x720)
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const K = process.cwd().split(path.sep).join('/');
const a = (p) => `file:///${K}/assets/${p}`;
// yazı tipi gömülü (file:// sayfasında dış yazı tipi yüklenmiyor)
const yt = (f) => 'data:font/woff2;base64,' + fs.readFileSync(`${K}/node_modules/@fontsource/fredoka/files/${f}`).toString('base64');
const kapaklar = {
  hazirlik: { bg:'#A8DCCB', zemin:'#F3D9A4', yazi:'#173F37', satir:['Hadi','Hazırlanalım'],
    boy:112, ic:`<img src="${a('hazirlik/canta.webp')}" style="left:770px;top:350px;width:220px">
        <img src="${a('hazirlik/yesil.webp')}" style="left:925px;top:160px;height:530px">
        <img src="${a('hazirlik/bento-kapali.webp')}" style="left:720px;top:545px;width:180px;transform:rotate(-6deg)">` },
  canlan: { bg:'#CDE8A0', zemin:'#8CCB6A', yazi:'#21462A', satir:['Çiz','Canlansın'],
    ic:`<img src="${a('canlan/gunes.webp')}" style="left:1060px;top:30px;width:170px">
        <img src="${a('canlan/dinozor.webp')}" style="left:640px;top:140px;height:520px">
        <img src="${a('hazirlik/etkinlik/kalemlik-0.webp')}" style="left:1040px;top:330px;width:200px;transform:rotate(18deg)">
        <img src="${a('canlan/yildiz.webp')}" style="left:600px;top:90px;width:110px;transform:rotate(-12deg)">` },
  kartlar: { bg:'#FFD978', zemin:'#F6B54A', yazi:'#4A2A08', satir:['Hafıza','Kartları'],
    ic:`<div class="kart" style="left:620px;top:200px;transform:rotate(-12deg)"><img src="${a('hayvanlar/kedi.webp')}"></div>
        <div class="kart" style="left:1000px;top:190px;transform:rotate(11deg)"><img src="${a('tasitlar/araba.webp')}"></div>
        <img src="${a('kartlar/kart-arka.webp')}" style="left:790px;top:130px;height:440px;border-radius:26px;box-shadow:0 10px 0 rgba(0,0,0,.18)">` },
  macera: { bg:'#FFC2D9', zemin:'#F59BBD', yazi:'#5A1736', satir:['Sesli','Maceralar'],
    ic:`<img src="${a('canlan/balon.webp')}" style="left:640px;top:40px;height:330px;transform:rotate(-10deg)">
        <img src="${a('canlan/balon.webp')}" style="left:1090px;top:20px;height:300px;transform:rotate(9deg);filter:hue-rotate(100deg)">
        <img src="${a('parti/pasta.webp')}" style="left:740px;top:250px;width:380px">
        <img src="${a('parti/hediye.webp')}" style="left:1040px;top:360px;width:220px">` },
};
const tarayici = await chromium.launch({ channel: 'msedge' });
const sayfa = await tarayici.newPage({ viewport:{width:1280,height:720} });
for (const [id,k] of Object.entries(kapaklar)) {
  const html=path.join(process.env.CIKIS,id+'.html');
  fs.writeFileSync(html,`<!doctype html><meta charset="utf-8"><style>
  @font-face{font-family:G;font-weight:700;src:url(${yt('fredoka-latin-ext-700-normal.woff2')})}
  @font-face{font-family:F;font-weight:700;src:url(${yt('fredoka-latin-700-normal.woff2')})}
  html,body{margin:0;width:1280px;height:720px;overflow:hidden;background:${k.bg}}
  .zemin{position:absolute;left:0;right:0;bottom:0;height:120px;background:${k.zemin};border-top:5px solid rgba(0,0,0,.55)}
  img,.kart{position:absolute}
  .kart{width:230px;height:300px;background:#fffaf0;border:5px solid #2b2420;border-radius:26px;display:grid;place-items:center;box-shadow:0 10px 0 rgba(0,0,0,.18)}
  .kart img{position:static;width:80%}
  h1{position:absolute;left:50px;top:0;bottom:110px;margin:0;display:flex;flex-direction:column;justify-content:center;font:700 ${k.boy??136}px/1.02 F, G;color:${k.yazi};letter-spacing:-1px;
     -webkit-text-stroke:42px #fff;paint-order:stroke fill;stroke-linejoin:round;
     filter:drop-shadow(4px 0 0 ${k.yazi}) drop-shadow(-4px 0 0 ${k.yazi}) drop-shadow(0 4px 0 ${k.yazi}) drop-shadow(0 -4px 0 ${k.yazi}) drop-shadow(0 8px 0 rgba(0,0,0,.2))}
  h1 span{display:block;transform:rotate(-3deg)} h1 span+span{transform:rotate(-1deg);margin-top:4px}
  </style><div class="zemin"></div>${k.ic}<h1>${k.satir.map(s=>`<span>${s}</span>`).join('')}</h1>`);
  await sayfa.goto('file:///'+html.split(path.sep).join('/'));
  await sayfa.evaluate(()=>document.fonts.ready);
  await sayfa.waitForTimeout(300);
  await sayfa.screenshot({ path: path.join(process.env.CIKIS, id+'.png') });
}
await tarayici.close();
