import {expect,test} from '@playwright/test';
test('defterde kendi tabağını, gerçek seçimleri ve hazırlık karelerini inceleyebilir',async({page},info)=>{
  await page.setViewportSize({width:667,height:375});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,gecmis:[
    {tarifId:'salata',sus:{id:'domates',x:.7,y:.2}},
    {tarifId:'pizza',no:1,fis:{malzemeler:['mantar','biber'],yarilar:{sol:['mantar'],sag:['biber']}},kivam:'tam',ust:[{cesit:'mantar',x:32,y:48},{cesit:'biber',x:68,y:52}]}
  ]})));
  await page.reload();
  await page.getByRole('button',{name:'Hazırladığım tabaklar'}).tap();
  const defter=page.getByRole('dialog');
  await defter.getByRole('button',{name:'Mini Pizza',exact:true}).tap();
  const buyuk=defter.getByRole('button',{name:'Mini Pizza büyütülmüş tabak'});
  await expect(buyuk.locator('[data-cesit=mantar]')).toHaveCSS('left',/px/);
  expect(await buyuk.locator('[data-cesit=mantar]').evaluate(el=>(el as HTMLElement).style.left)).toBe('32%');
  await expect(defter.getByLabel('Müşteriden 3 üzerinden 3 yıldız')).toBeVisible();
  await expect(defter.locator('.album-secimler img')).toHaveCount(2);
  await expect.poll(()=>defter.locator('img').evaluateAll(r=>r.every(el=>(el as HTMLImageElement).naturalWidth>0))).toBe(true);
  await defter.screenshot({path:info.outputPath('album-pizza.png')});
  await defter.getByRole('button',{name:'Tepsiyi fırına sür.'}).tap();
  await expect(defter.locator('.album-buyutec img')).toHaveAttribute('src',/pizza-3/);
  await page.keyboard.press('Escape');
  await expect(buyuk).toBeVisible();
  await defter.getByRole('button',{name:'Sonraki tabak'}).tap();
  await expect(defter.getByRole('button',{name:'Bahçe Salatası büyütülmüş tabak'}).locator('.yemek-susu')).toHaveCount(1);
  await expect(defter.getByLabel(/Müşteriden 3 üzerinden/)).toHaveCount(0);
  await defter.getByRole('button',{name:'Şefin albüm kapağı'}).tap();
  await expect(defter.getByRole('button',{name:'Mini Pizza',exact:true})).toBeVisible();
  await defter.getByRole('button',{name:'Tabak defterini kapat'}).tap();
  await expect(defter).toHaveCount(0);
});
