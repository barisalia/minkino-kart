import {test,expect} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

for(const [masa,hedef,yapilan,puan] of [
  ['fiyonk-tavuk',1,[2],3],['fiyonk-sis',3,[1],2],['fiyonk-tavuk',1,[0,1],2],
] as const)test(masa+' isteği '+hedef+', gerçek tabakta '+yapilan.length+' soslu fiyonk',async({page})=>{
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/');
  await page.evaluate(id=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{ekran:'masa',secili:id,masalar:{[id]:{tabaklar:{}}}}}));
    localStorage.setItem('minkino-sef-makarna-v1-masa-'+id,JSON.stringify({aktif:true,istek:'kirmizi',renk:'altin',kesim:2,sekil:3,tencere:3,suzulen:3,kivamlar:['tam','tam','tam'],isiMs:8000}));
  },masa);
  await page.reload();await page.locator('.tepsi-yuva[data-parca=makarna]').tap();
  await page.locator('[data-mp-sos=kirmizi]').press('Enter');
  const oyun=page.locator('.mp-oyun');
  await expect(oyun).toHaveAttribute('data-asama','pay');
  await expect(oyun.locator('.mp-fis img[src*="kirmizi-lokma"]')).toHaveCount(hedef);
  for(const i of yapilan){
    const hedef=oyun.locator('[data-sos-yeri="'+i+'"]');
    if(puan!==3){await hedef.tap();continue;}
    const r=(await oyun.locator('.mp-sos-kepce').boundingBox())!,b=(await hedef.boundingBox())!;
    const a={x:r.x+r.width/2,y:r.y+r.height/2},son={x:b.x+b.width/2,y:b.y+b.height/2};
    const cdp=await page.context().newCDPSession(page);
    try{
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
      for(let n=1;n<=6;n++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(son.x-a.x)*n/6,y:a.y+(son.y-a.y)*n/6}]});
      await expect(hedef).toHaveAttribute('data-yakin','true');
      await expect(oyun.locator('.mp-kasik-elde[data-sos=kirmizi]')).toBeVisible();
      const kase=await oyun.locator('.mp-sos-kepce').boundingBox();
      expect(kase!.x).toBeCloseTo(r.x,0);
      if(process.env.SEF_KASIK_KARE)await page.screenshot({path:process.env.SEF_KASIK_KARE});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }finally{await cdp.detach();}
  }
  const maske=yapilan.reduce<number>((m,i)=>m|(1<<i),0);
  await page.reload();
  await expect(oyun.locator('.mp-tabak-lokmasi[src*="kirmizi-lokma"]')).toHaveCount(yapilan.length);
  await expect(oyun.locator('.mp-tabak-lokmasi[src*="pismis"]')).toHaveCount(3-yapilan.length);
  if(process.env.SEF_MAKARNA_PAY&&puan===3)await page.screenshot({path:process.env.SEF_MAKARNA_PAY});
  await oyun.locator('.mp-sos-bitti').tap();
  await oyun.locator('[data-mp-sus=peynir]').tap();await oyun.locator('.mp-sus-hedef').tap();
  // Zilden sonra tabağın fotoğrafı çekilip atölye kapanır, masanın tepsisine dönülür (eski özet ve "sonraki" düğmesi yok).
  await oyun.locator('[data-mp-zil]').tap();
  await expect(oyun).toHaveCount(0);
  await page.reload();
  const k=await page.evaluate(id=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar[id].tabaklar.makarna,masa);
  expect(k).toMatchObject({puan,makarna:{istenenSosAdedi:hedef,soslanan:maske}});
  await page.getByRole('button',{name:/siparişi ile tabağı karşılaştır/}).tap();
  const panel=page.locator('dialog.tepsi-karsilastir');
  await expect(panel.getByLabel('Fişteki malzemeler').getByLabel('Soslu fiyonk')).toHaveCount(hedef);
  await expect(panel.getByLabel('Kullanılan malzemeler').getByLabel('Soslu fiyonk')).toHaveCount(yapilan.length);
});
