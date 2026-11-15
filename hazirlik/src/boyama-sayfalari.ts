// Kapalı şekiller hem defterdeki çizimi hem küçük sayfa sekmesini oluşturur.
// Yuvarlak uç ve birleşimler en küçük telefonda da çizgiyi temiz tutar.
export const sayfalar=['bos','yelken','bahce','kelebek'] as const;
export type ResimSayfasi=typeof sayfalar[number];
export const sayfaAdlari={bos:'Boş kâğıt',yelken:'Yelkenli',bahce:'Limon bahçesi',kelebek:'Kelebek'};
const oval=(x:number,y:number,rx:number,ry:number)=>new Path2D(
  'M'+(x-rx)+' '+y+'a'+rx+' '+ry+' 0 1 0 '+(2*rx)+' 0a'+rx+' '+ry+' 0 1 0 '+(-2*rx)+' 0Z');
type Kalip={yol:Path2D;renk:string};
const parca=(yol:string|Path2D,renk:string):Kalip=>({yol:typeof yol==='string'?new Path2D(yol):yol,renk});
function kaliplariKur():Record<ResimSayfasi,Kalip[]>{return {
  bos:[],
  yelken:[
    parca(oval(456,82,30,30),'#ffcc52'),
    parca('M70 304Q112 284 155 303T242 303T330 303T418 303Q463 284 520 302Q516 333 484 340H109Q79 335 70 304Z','#8bcfd4'),
    parca('M284 72Q285 65 293 68L298 263H288Z','#efbf85'),
    parca('M294 68Q321 57 348 70L332 83Q314 77 294 87Z','#ef8b74'),
    parca('M277 94 275 237 143 237Q203 178 277 94Z','#ffd47a'),
    parca('M308 108Q378 167 424 242L309 237Z','#82bdb2'),
    parca('M128 252Q263 267 449 247L416 301Q404 315 382 315H189Q166 314 151 295Z','#eb8e73'),
    parca('M148 271Q279 282 433 263L427 276Q271 293 154 282Z','#ffd594'),
    ...[220,285,350].map(x=>parca(oval(x,298,7,7),'#fff1bf'))
  ],
  bahce:[
    parca('M111 313Q279 292 475 315Q490 323 476 330Q287 352 111 331Q97 323 111 313Z','#e9c794'),
    parca('M279 248Q283 197 263 159L274 151Q291 178 297 208Q314 171 341 151L348 162Q305 207 305 248Z','#bf966e'),
    parca('M194 189Q151 193 150 155Q122 127 146 99Q145 71 179 61Q199 30 233 44Q265 19 296 39Q336 22 362 46Q402 38 418 69Q456 81 446 115Q472 148 440 169Q431 202 392 190Q361 214 332 197Q292 216 260 197Q227 209 194 189Z','#91c572'),
    ...[[199,124],[301,83],[374,150]].flatMap(([x,y])=>[
      parca('M'+x+' '+(y-13)+'q-18-2-21-18 17-5 26 12Z','#7cb571'),
      parca('M'+(x-18)+' '+y+'q1-12 13-15 9-8 16 0 15 4 13 18-1 14-16 18-9 8-15-1-16-4-11-20Z','#ffce57')
    ]),
    parca('M227 241H352L338 311Q337 318 327 320H250Q240 320 238 311Z','#e98a72'),
    parca('M226 232H353q4 0 4 5v12q0 4-5 4H226q-4 0-4-5v-11q0-5 4-5Z','#f6bb86')
  ],
  kelebek:[
    parca('M288 195Q235 83 154 72Q94 64 105 133Q112 196 203 225Q142 234 160 277Q186 337 281 252L301 219Z','#f8be71'),
    parca('M312 195Q365 83 446 72Q506 64 495 133Q488 196 397 225Q458 234 440 277Q414 337 319 252L299 219Z','#f8be71'),
    ...[[172,142,26,31],[428,142,26,31],[207,258,16,15],[393,258,16,15]].map(([x,y,a,b])=>parca(oval(x,y,a,b),'#a49bd6')),
    parca('M291 161Q278 133 260 131Q254 121 265 119Q288 123 300 158Z','#e9bd8b'),
    parca('M309 161Q322 133 340 131Q346 121 335 119Q312 123 300 158Z','#e9bd8b'),
    parca(oval(300,215,17,63),'#94c7ab'),parca(oval(300,167,21,22),'#f5c08b')
  ]
}}
let resimler:ReturnType<typeof kaliplariKur>|undefined;
export function sayfayiCiz(ctx:CanvasRenderingContext2D,sayfa:ResimSayfasi,onizleme=false){
  resimler??=kaliplariKur();
  ctx.save();ctx.lineWidth=3.6;ctx.strokeStyle='#282431';ctx.lineJoin=ctx.lineCap='round';
  for(const parca of resimler[sayfa]){
    // Sonradan çizilen ön parçaların arkasındaki mürekkebi temizle. Boyanabilir bölgeler saydam kalır.
    ctx.globalCompositeOperation=onizleme?'source-over':'destination-out';
    ctx.fillStyle=onizleme?parca.renk:'#fff';ctx.fill(parca.yol);
    ctx.globalCompositeOperation='source-over';ctx.stroke(parca.yol);
  }
  ctx.restore();
}
