import { expect, test, type Page } from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

const dugme=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const kasa=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
async function hareket(p:Page,kaynak:string,hedef:string,basY=.5,sonY=.5){
  const r=(await p.locator(kaynak).boundingBox())!,s=(await p.locator(hedef).boundingBox())!;
  const a={x:r.x+r.width/2,y:r.y+r.height*basY},b={x:s.x+s.width/2,y:s.y+s.height*sonY};
  if(p.context().browser()?.browserType().name()==='webkit'){
    await p.mouse.move(a.x,a.y);await p.mouse.down();
    await p.mouse.move(b.x,b.y,{steps:9});await p.mouse.up();return;
  }
  const c=await p.context().newCDPSession(p);
  try{
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
    for(let i=1;i<=9;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*i/9,y:a.y+(b.y-a.y)*i/9}]});
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await c.detach();}
}
async function servis(p:Page,eksik=false){
  await dugme(p,'Tepsiyi müşteriye sun').tap();
  if(eksik)await dugme(p,'Eksik tepsiyi şimdi sun').tap();
  await expect(p.locator('.servis-jetonu')).toBeVisible();
}
async function fisAl(p:Page){
  await expect(dugme(p,'Siparişi al ve mutfağa geç')).toBeVisible({timeout:25000});
  await dugme(p,'Siparişi al ve mutfağa geç').tap();
  await expect(p.locator('.tepsi-yuva').first()).toBeVisible();
}
async function limonSik(p:Page){
  await p.locator('[data-parca=icecek].tepsi-yuva').tap();
  await p.locator('.ps-meyve-sec[data-meyve=limon]').tap();
  await p.locator('.ps-ham').tap();await p.locator('.ps-dene').tap();
  for(let tur=0;tur<3;tur++)await p.locator('.ps-cevir').tap();
  for(let dolum=0;dolum<2;dolum++){
    await p.locator('.ps-surahi').tap();await p.locator('.ps-bardak').tap();
    if(!dolum)await expect(dugme(p,'Yarım bardağı tepsiye koy')).toBeVisible();
  }
  await expect(p.locator('.tepsi-yuva[data-parca=icecek]')).toHaveAttribute('data-hazir','true');
}
async function tavukPis(ir:Page){
  await ir.locator('.tepsi-yuva[data-parca=tavuk]').tap();
  for(let n=0;n<2;n++){
    await ir.locator('.tv-fileto:enabled').first().tap();
    // Tap an uncovered part of the pan, where children can also drop a fillet.
    const tava=ir.locator('.tv-tava');const r=(await tava.boundingBox())!;
    await tava.tap({position:{x:r.width*.3,y:r.height*.3}});
    await expect(ir.locator('.tv-mutfak')).toHaveAttribute('data-adet',String(n+1));
  }
  for(let n=2;n<4;n++){
    await ir.locator('.tv-fileto:enabled').first().tap();
    await expect(ir.locator('.tv-mutfak')).toHaveAttribute('data-adet',String(n+1));
  }
  await dugme(ir,'Tavukları şimdi tabağa al').tap();
  await expect(ir.locator('.tepsi-yuva[data-parca=tavuk]')).toHaveAttribute('data-hazir','true');
}
async function tost(p:Page){

  await dugme(p,'Tost ekmeğini aç').tap();
  for(const ad of ['Kaşar peyniri','Domates']){
    await dugme(p,ad).tap();await p.locator('.tost-acik-ekmek').tap();
  }
  for(const ad of ['Üst ekmeği kapat','Tost presine götür','Tost presini kapat'])await dugme(p,ad).tap();
  await expect(p.getByRole('meter')).toHaveAttribute('aria-valuetext','Altın renginde');
  await dugme(p,'Tost presini aç').tap();await dugme(p,'Tostu tepsiye koy').tap();
}
test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.setViewportSize({width:667,height:375});

});
test('Yeni aşçı restoran kapısı ve müşteri fişleri üzerinden üç müşteri, pastane ve ertesi sabahı oynar',async({page})=>{
  test.setTimeout(240000);
  await page.goto('./?yassor=1',{waitUntil:'domcontentloaded'});
  await dugme(page,'5 yaş').tap();
  await dugme(page,'Oyunlar').tap();
  await dugme(page,'Minik Şef').tap();
  await expect(page).toHaveTitle('Minik Şef');
  await dugme(page,'Restoranı aç').tap();
  await expect(dugme(page,'Siparişi al ve mutfağa geç')).toBeVisible({timeout:20000});
  if(process.env.SEF_ILK_GUN_KARE)await page.screenshot({path:process.env.SEF_ILK_GUN_KARE+'/01-lokum-siparis.png'});
  await fisAl(page);await limonSik(page);
  await page.keyboard.press('Escape');
  const don=dugme(page,'Yarım kalan sipariş tepsisine dön, 1 tabak hazır');
  await expect(don).toBeVisible();await expect(don.locator('[data-hazir=true]')).toHaveCount(1);
  await page.reload();
  if(process.env.SEF_YARIM_MASA)await page.screenshot({path:process.env.SEF_YARIM_MASA});
  await don.tap();
  await expect(page.locator('[data-parca=icecek].tepsi-yuva')).toHaveAttribute('data-hazir','true');
  if(process.env.SEF_ILK_GUN_KARE)await page.screenshot({path:process.env.SEF_ILK_GUN_KARE+'/02-tepsi.png'});
  await servis(page,true);
  expect((await kasa(page)).gun).toMatchObject({no:1,ziyaret:1,kazanc:3});
  await dugme(page,'Sıradaki müşteriyi karşıla').tap();
  await fisAl(page);await tavukPis(page);await servis(page,true);
  expect((await kasa(page)).jeton).toBe(6);
  await page.locator('.servis-jetonu').tap();
  await page.locator('.tatli-vitrin-karti[data-kademe="0"]').tap();
  await expect(page.locator('.tatli-dukkan')).toHaveAttribute('data-pastane','acik');
  await expect(page.locator('.tatli-cuzdan')).toHaveText('0');
  await dugme(page,'Mutfağa dön').tap();
  await dugme(page,'Sıradaki müşteriyi karşıla').tap();await fisAl(page);
  // Dede's pasta as the child chooses it. Keep a real (incomplete) order for
  // each visitor, so the display and wallet show what was actually prepared.
  await page.locator('.tepsi-yuva[data-parca=makarna]').tap();
  await dugme(page,'Yumurtalı hamur seç').tap();
  for(let i=0;i<2;i++){
    await expect(page.locator('[data-mp-kes="'+i+'"]')).toBeVisible();
    await hareket(page,'.mp-dikiz','.mp-dikiz',.02,.98);
  }
  for(let i=0;i<3;i++){
    await hareket(page,'.mp-buzgu','.mp-buzgu',.1,.55);
    if(i<2)await expect(page.locator('.mp-tepsi-parca')).toHaveCount(i+1);
  }
  await page.locator('.mp-tuzluk').tap();
  for(let i=0;i<3;i++){
    await expect(page.locator('[data-mp-at="'+i+'"]')).toBeVisible();
    await hareket(page,'[data-mp-at="'+i+'"]','.mp-tencere');
  }
  await expect(page.locator('.mp-oyun')).toHaveAttribute('data-kivam','tam',{timeout:10000});
  for(let i=0;i<3;i++){
    await page.locator('.mp-kepce:enabled').tap();
    if(i<2)await expect(page.locator('.mp-suzgec-ici .mp-makarna')).toHaveCount(i+1);
  }
  await expect(page.locator('[data-mp-sos=yesil]')).toBeVisible();
  await hareket(page,'[data-mp-sos=yesil]','.mp-servis-tabagi');
  for(const yaprak of await page.locator('.mp-havan-yaprak').all()){
    const r=(await yaprak.boundingBox())!;await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);
  }
  await page.locator('.mp-havan-aktar').tap();
  for(let i=0;i<3;i++)await page.locator('[data-sos-yeri="'+i+'"]').tap();
  await page.locator('.mp-sos-bitti').tap();
  await page.locator('[data-mp-sus=peynir]').tap();await page.locator('.mp-sus-hedef').tap();
  await page.locator('[data-mp-zil]').tap();
  await servis(page,true);
  const tamam=await kasa(page);
  expect(tamam.gun.ziyaret).toBe(3);
  await dugme(page,'Günü kapat').tap();await page.reload();
  await expect(page.locator('.aksam-jetonu')).toHaveText('+'+tamam.gun.kazanc);
  await dugme(page,'2. güne başla').tap();
  const sabah=await kasa(page);
  expect(sabah.gun).toMatchObject({no:2,ziyaret:0,kazanc:0});
  expect(sabah.jeton).toBe(tamam.jeton);expect(sabah.tatliSeviye).toBe(0);
  await expect(dugme(page,'Siparişi al ve mutfağa geç')).toBeVisible({timeout:15000});
});
test('Tarif rafındaki tost doğrudan müşteriye gider ve ilk jetonları getirir',async({page})=>{
  await page.goto('./sef/');
  await dugme(page,'Sonraki tarif rafı').tap();await page.locator('[data-tezgah=tost]').tap();
  await tost(page);await servis(page);
  expect((await kasa(page)).jeton).toBe(3);
  await page.reload();expect((await kasa(page)).jeton).toBe(3);
});
