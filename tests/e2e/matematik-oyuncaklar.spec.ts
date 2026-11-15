import {test,expect} from '@playwright/test';

test.beforeEach(async ({ page })=>{
  const ekran = page.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await page.setViewportSize({width: ekran.height, height: ekran.width});
  await page.addInitScript(()=>{if(!localStorage.getItem('minkino-kartlar-v1')) localStorage.setItem('minkino-kartlar-v1',JSON.stringify({yas:5,ayarlar:{muzik:false}}));});
  await page.goto('/matematik/'); await page.locator('.k0').click();
});
test('Kule gerçek bırakış yerinde devrilir, sağlam katlar kalır ve on kat tamamlanır',async({page:p})=>{
  
  await expect(p.locator('.raf-kutusu')).toHaveCount(10);
  const hedef=p.getByLabel('Kutuyu buraya bırak');
  const koy=async(n:number)=>{
    await p.getByLabel(n+' numaralı kutu',{exact:true}).click();await hedef.click();await expect(p.locator('.kule-kutu')).toHaveCount(n);
  };
  await p.getByLabel('3 numaralı kutu').click();await expect(p.locator('.kule-kutu')).toHaveCount(0);
  await koy(1);await koy(2);
  const b=p.getByLabel('3 numaralı kutu'),r=(await b.boundingBox())!,h=(await hedef.boundingBox())!;
  await p.mouse.move(r.x+r.width/2,r.y+r.height/2); await p.mouse.down();
  await p.mouse.move(h.x+1.25*h.width,h.y+h.height/2,{steps:8});await p.mouse.up();
  await expect(p.locator('.devrildi')).toHaveCount(1);await expect(p.locator('.kule-kutu')).toHaveCount(2);
  await p.reload();await p.locator('.k0').click();
  for(let n=3;n<=10;n++) await koy(n);
  await expect(p.locator('.boncuk').first()).toBeVisible();
  await p.reload(); await p.locator('.k0').click();
  await expect(p.locator('.boncuk').first()).toBeVisible();
});
test('Beş boncuk sürüklenirken beş ayrı tahta sesi çıkar ve geri dönüşte sıra tersine döner',async({page:p})=>{
  await p.evaluate(()=>localStorage.setItem('minkino-matematik-1-sayi',JSON.stringify({kuleTamam:true,adim:9,yer:0,secimler:[0,0,0],boncukHazir:false})));
  await p.reload(); await p.locator('.k0').click();
  await p.evaluate(()=>{
    const sesler:number[]=[];
    Object.assign(window,{boncukTestSesleri:sesler});
    const harmonikler: number[]=[];
    const asil=OscillatorNode.prototype.start;
    OscillatorNode.prototype.start=function(t){harmonikler.push(this.frequency.value);
      if(harmonikler.length>3) harmonikler.shift();
      const [temel,orta,ust]=harmonikler;
      if(Math.abs(orta/temel-3.98)<.001 && Math.abs(ust/temel-9.1)<.001) sesler.push(Math.round(temel));
      return asil.call(this,t);};
  });
  const oku=()=>p.evaluate(()=>(window as unknown as {boncukTestSesleri:number[]}).boncukTestSesleri.filter(n=>[262,294,330,392,440,523,587,659,784,880].includes(n)));
  const son=p.locator('.boncuk').nth(4),r=(await son.boundingBox())!,ray=(await p.locator('.boncuk-teli').first().boundingBox())!;
  await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.mouse.move(ray.x+ray.width*.25,r.y+r.height/2,{steps:12});
  await expect.poll(oku).toEqual([262,294,330,392,440]);await p.mouse.up();
  await p.evaluate(()=>{(window as unknown as {boncukTestSesleri:number[]}).boncukTestSesleri.length=0;});
  await p.locator('.boncuk').first().click();await expect.poll(oku).toEqual([440,392,330,294,262]);
  await p.evaluate(()=>{(window as unknown as {boncukTestSesleri:number[]}).boncukTestSesleri.length=0;});
  await p.locator('.boncuk').nth(9).click(); await expect.poll(oku).toEqual([523,587,659,784,880]);
});

