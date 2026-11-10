// Etkinlik kapakları: oyunların kendi çizimleri + Fredoka logo, Astra'nın oyun kapaklarıyla aynı düzen (1280x720)
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const K = process.cwd().split(path.sep).join('/');
const a = (p) => `file:///${K}/assets/${p}`;
// yazı tipi gömülü (file:// sayfasında dış yazı tipi yüklenmiyor)
const yt = (f) => 'data:font/woff2;base64,' + fs.readFileSync(`${K}/node_modules/@fontsource/fredoka/files/${f}`).toString('base64');
const kart = (ic, stil) => `<div class="kart" style="${stil}">${ic}</div>`;
const resim = (p) => `<img src="${a(p)}">`;
const kapaklar = {
  hazirlik: { bg:'#BFE8DA', nokta:'#8FCDB8', bant:'#FFB84D', yazi:'#173F37', ad:'Hadi Hazırlanalım',
    ic:`<img src="${a('hazirlik/canta.webp')}" style="left:250px;top:150px;width:330px;transform:rotate(-6deg)">
        <img src="${a('hazirlik/bento-kapali.webp')}" style="left:780px;top:330px;width:300px;transform:rotate(7deg)">
        <img src="${a('hazirlik/yesil.webp')}" style="left:470px;top:20px;height:560px">` },
  canlan: { bg:'#D6EDA8', nokta:'#A9CF73', bant:'#FF7EB6', yazi:'#21462A', ad:'Çiz Canlansın',
    ic:`<div class="kagit" style="left:300px;top:70px;width:560px;height:430px;transform:rotate(-4deg)"></div>
        <img src="${a('canlan/dinozor.webp')}" style="left:400px;top:40px;height:480px">
        <img src="${a('hazirlik/etkinlik/kalemlik-0.webp')}" style="left:830px;top:300px;width:260px;transform:rotate(24deg)">
        <img src="${a('canlan/yildiz.webp')}" style="left:190px;top:60px;width:130px;transform:rotate(-14deg)">
        <img src="${a('canlan/gunes.webp')}" style="left:940px;top:40px;width:180px">` },
  kartlar: { bg:'#FFE08A', nokta:'#F2BE4D', bant:'#8a5cd6', yazi:'#4A2A08', ad:'Hafıza Kartları',
    ic:kart(resim('hayvanlar/kedi.webp'),'left:230px;top:110px;transform:rotate(-14deg)')+
       kart(resim('hayvanlar/kedi.webp'),'left:800px;top:110px;transform:rotate(13deg)')+
       `<img src="${a('kartlar/kart-arka.webp')}" style="left:500px;top:60px;height:440px;border-radius:26px;box-shadow:0 10px 0 rgba(0,0,0,.2);transform:rotate(-2deg)">`+
       `<img src="${a('canlan/yildiz.webp')}" style="left:1050px;top:40px;width:120px;transform:rotate(12deg)"><img src="${a('canlan/yildiz.webp')}" style="left:120px;top:60px;width:90px;transform:rotate(-12deg)">` },
  macera: { bg:'#FFD0E2', nokta:'#F5A3C4', bant:'#4e9ee0', yazi:'#5A1736', ad:'Sesli Maceralar',
    ic:`<img src="${a('canlan/balon.webp')}" style="left:210px;top:30px;height:380px;transform:rotate(-10deg)">
        <img src="${a('canlan/balon.webp')}" style="left:900px;top:20px;height:340px;transform:rotate(9deg);filter:hue-rotate(100deg)">
        <img src="${a('parti/hediye.webp')}" style="left:760px;top:250px;width:270px">
        <img src="${a('parti/pasta.webp')}" style="left:400px;top:70px;width:460px">` },
};
const tarayici = await chromium.launch({ channel: 'msedge' });
const sayfa = await tarayici.newPage({ viewport:{width:1280,height:720} });
for (const [id,k] of Object.entries(kapaklar)) {
  const html=path.join(process.env.CIKIS,id+'.html');
  fs.writeFileSync(html,`<!doctype html><meta charset="utf-8"><style>
  @font-face{font-family:G;font-weight:700;src:url(${yt('fredoka-latin-ext-700-normal.woff2')})}
  @font-face{font-family:F;font-weight:700;src:url(${yt('fredoka-latin-700-normal.woff2')})}
  /* etkinlik kapağı: noktalı defter kâğıdı, ortada büyük resim, altta bantlı beyaz etiket (oyun kapaklarından ayrı dursun) */
  html,body{margin:0;width:1280px;height:720px;overflow:hidden;background:${k.bg};
    background-image:radial-gradient(${k.nokta} 5px,transparent 6px);background-size:56px 56px;background-position:28px 28px}
  img,.kart,.kagit{position:absolute}
  .sahne img{filter:drop-shadow(0 8px 0 rgba(0,0,0,.14))}
  .kart{width:250px;height:330px;background:#fffaf0;border:6px solid #2b2420;border-radius:28px;display:grid;place-items:center;box-shadow:0 10px 0 rgba(0,0,0,.2)}
  .kart img{position:static;width:82%;filter:none}
  .kagit{background:#fffdf6;border:5px solid #2b2420;border-radius:10px;box-shadow:0 10px 0 rgba(0,0,0,.16)}
  .etiket{position:absolute;left:50%;bottom:34px;transform:translateX(-50%) rotate(-1.5deg);padding:14px 64px 20px;background:#fffdf6;border:6px solid #2b2420;border-radius:30px;
    box-shadow:0 10px 0 rgba(0,0,0,.22);font:700 104px/1.05 F, G;color:${k.yazi};white-space:nowrap;letter-spacing:-1px}
  .etiket::before,.etiket::after{content:'';position:absolute;top:-26px;width:120px;height:44px;background:${k.bant};opacity:.92;border:4px solid #2b2420;border-radius:6px}
  .etiket::before{left:-34px;transform:rotate(-24deg)} .etiket::after{right:-34px;transform:rotate(24deg)}
  </style><div class="sahne">${k.ic}</div><div class="etiket">${k.ad}</div>`);
  await sayfa.goto('file:///'+html.split(path.sep).join('/'));
  await sayfa.evaluate(()=>document.fonts.ready);
  await sayfa.waitForTimeout(300);
  await sayfa.screenshot({ path: path.join(process.env.CIKIS, id+'.png') });
}
await tarayici.close();
