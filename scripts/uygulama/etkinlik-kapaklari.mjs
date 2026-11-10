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
  hazirlik: { bg:'#BFE8DA', nokta:'#8FCDB8', bant:'#FFB84D', yazi:'#173F37', ad:'Okula Hazırlanalım',
    ic:`<img src="${a('hazirlik/canta.webp')}" style="left:250px;top:150px;width:330px;transform:rotate(-6deg)">
        <img src="${a('hazirlik/bento-kapali.webp')}" style="left:780px;top:330px;width:300px;transform:rotate(7deg)">
        <img src="${a('hazirlik/yesil.webp')}" style="left:470px;top:20px;height:560px">` },
  canlan: { bg:'#D6EDA8', nokta:'#A9CF73', bant:'#FF7EB6', yazi:'#21462A', ad:'Çiz Canlansın',
    ic:`<div class="kagit" style="left:300px;top:70px;width:560px;height:430px;transform:rotate(-4deg)"></div>
        <img src="${a('canlan/dinozor.webp')}" style="left:400px;top:40px;height:480px">
        <img src="${a('hazirlik/etkinlik/kalemlik-0.webp')}" style="left:830px;top:300px;width:260px;transform:rotate(24deg)">
        <img src="${a('canlan/yildiz.webp')}" style="left:190px;top:60px;width:130px;transform:rotate(-14deg)">
        <img src="${a('canlan/gunes.webp')}" style="left:940px;top:40px;width:180px">` },
  // Bil Bakalım (kartlar/): kartla soru sorulur. Düz, gerçek oyun kartları (elma, araba, ördek) ve soru balonu.
  kartlar: { bg:'#FFE08A', nokta:'#F2BE4D', bant:'#8a5cd6', yazi:'#4A2A08', ad:'Bil Bakalım',
    ic:kart(resim('tasitlar/araba.webp'),'left:215px;top:120px;transform:rotate(-12deg)')+
       kart(resim('hayvanlar/ordek.webp'),'left:815px;top:120px;transform:rotate(12deg)')+
       kart(resim('meyveler/elma.webp'),'left:500px;top:50px;width:280px;height:370px')+
       `<svg style="position:absolute;left:1010px;top:20px;width:210px" viewBox="0 0 200 200"><path d="M100 14c48 0 86 32 86 74s-38 74-86 74c-10 0-20-1-29-4l-38 26 8-42C24 128 14 109 14 88c0-42 38-74 86-74Z" fill="#fff" stroke="#2b2420" stroke-width="9" stroke-linejoin="round"/><path d="M76 70c0-34 50-34 50-4 0 22-26 20-26 42" fill="none" stroke="#8a5cd6" stroke-width="16" stroke-linecap="round"/><circle cx="100" cy="134" r="10" fill="#8a5cd6"/></svg>
        <img src="${a('canlan/yildiz.webp')}" style="left:90px;top:40px;width:110px;transform:rotate(-12deg)">` },
  // Sesli Maceralar: dinlenen hikâyeler. Ortada büyük kulaklık ve ses dalgaları; parti (ilk bölüm) yanlarda.
  macera: { bg:'#FFD0E2', nokta:'#F5A3C4', bant:'#4e9ee0', yazi:'#5A1736', ad:'Sesli Maceralar',
    ic:`<img src="${a('canlan/balon.webp')}" style="left:120px;top:60px;height:330px;transform:rotate(-10deg)">
        <img src="${a('parti/hediye.webp')}" style="left:960px;top:270px;width:230px">
        <img src="${a('parti/pasta.webp')}" style="left:455px;top:150px;width:370px">
        <svg style="position:absolute;left:330px;top:10px;width:620px;filter:drop-shadow(0 8px 0 rgba(0,0,0,.16))" viewBox="0 0 620 520" fill="none" stroke="#2b2420" stroke-linecap="round" stroke-linejoin="round">
          <path d="M130 330V250C130 140 210 60 310 60s180 80 180 190v80" stroke-width="56"/>
          <path d="M130 330V250C130 140 210 60 310 60s180 80 180 190v80" stroke="#4e9ee0" stroke-width="38"/>
          <rect x="70" y="270" width="110" height="190" rx="46" fill="#ff7eb6" stroke-width="9"/>
          <rect x="440" y="270" width="110" height="190" rx="46" fill="#ff7eb6" stroke-width="9"/>
          <rect x="96" y="300" width="40" height="130" rx="20" fill="#ffc2dc" stroke="none"/>
          <rect x="466" y="300" width="40" height="130" rx="20" fill="#ffc2dc" stroke="none"/>
          <g stroke="#2b2420" stroke-width="20"><path d="M34 310q-26 55 0 110"/><path d="M586 310q26 55 0 110"/></g>
          <g stroke="#ffb627" stroke-width="10"><path d="M34 310q-26 55 0 110"/><path d="M586 310q26 55 0 110"/></g>
        </svg>
        <svg style="position:absolute;left:970px;top:40px;width:200px" viewBox="0 0 200 200"><g fill="#8a5cd6" stroke="#2b2420" stroke-width="8" stroke-linejoin="round"><path d="M70 150V40l90-20v110"/><ellipse cx="48" cy="152" rx="26" ry="20"/><ellipse cx="138" cy="132" rx="26" ry="20"/></g></svg>
        <svg style="position:absolute;left:215px;top:330px;width:120px;transform:rotate(-14deg)" viewBox="0 0 120 200"><g fill="#4e9ee0" stroke="#2b2420" stroke-width="8" stroke-linejoin="round"><path d="M62 150V24c8 28 44 30 44 62"/><ellipse cx="40" cy="152" rx="26" ry="20"/></g></svg>` },
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
