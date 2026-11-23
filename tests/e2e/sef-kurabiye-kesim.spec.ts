import {expect,test} from '@playwright/test';
import sharp from 'sharp';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

for(const width of [844,568])test('Yıldız hamurdan kalkar ve aynı boyda tepsiye oturur '+width,async({page},testInfo)=>{
  await page.setViewportSize({width,height:width===844?390:320});
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{secili:'kurabiye',ekran:'masa',restoranda:true,tatliSeviye:1,oynanan:'kurabiye',jeton:10,
      restoran:{sira:3,menuId:'kurabiye',evre:'mutfak'},
      masalar:{kurabiye:{sunuldu:false,tabaklar:{},kurabiyeIstegi:'yildiz',tatliTaslagi:{adim:2,surum:2,yanlis:0,sekil:'yildiz'}}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  for(let i=0;i<3;i++)await page.getByRole('button',{name:'Yıldız kalıbı hamura bastır'}).tap();
  const al=page.getByRole('button',{name:'1. kurabiyeyi tepsiye taşı'});
  const kalip=(await al.boundingBox())!;
  const x=kalip.x+kalip.width/2,y=kalip.y+kalip.height/2;
  const hamur=page.locator('canvas.kb-hamur-resmi');
  const alfa=()=>hamur.evaluate((el,n)=>{
    const c=el as HTMLCanvasElement,r=c.getBoundingClientRect();
    return c.getContext('2d')!.getImageData(Math.round((n.x-r.left)/r.width*c.width),Math.round((n.y-r.top)/r.height*c.height),1,1).data[3];
  },{x,y});
  await expect.poll(alfa).toBe(255);
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y-32,{steps:6});
  await expect.poll(alfa).toBe(0);
  const suruklenen=page.locator('.kb-eldeki-parca');
  const elde=(await suruklenen.boundingBox())!;
  expect(Math.abs(elde.width-kalip.width)).toBeLessThan(1);
  expect(Math.abs(elde.y-(kalip.y-32))).toBeLessThan(1);
  await page.mouse.up();
  await expect(al).toBeEnabled();await expect.poll(alfa).toBe(255);
  const yuva=page.locator('.kb-yuva[data-yer="0"]');
  const hedef=(await yuva.boundingBox())!;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(hedef.x+hedef.width/2,hedef.y+hedef.height/2,{steps:12});
  await page.mouse.up();
  const birinci=yuva.locator('.kb-biskuvi');await expect(birinci).toBeVisible();
  const indi=(await birinci.boundingBox())!;
  expect(Math.abs(indi.width-kalip.width)).toBeLessThan(1);
  expect(Math.abs(indi.height-kalip.height)).toBeLessThan(1);
  expect(Math.abs(indi.x-hedef.x)).toBeLessThan(1);
  await expect.poll(alfa).toBe(0);
  const rgb=async()=>{
    const buf=await page.screenshot({clip:{x:Math.floor(x),y:Math.floor(y),width:1,height:1}});
    return Array.from(await sharp(buf).removeAlpha().raw().toBuffer());
  };
  const tezgah=await rgb();
  await hamur.evaluate(el=>el.style.visibility='hidden');
  expect(await rgb()).toEqual(tezgah);
  await hamur.evaluate(el=>el.style.visibility='');
  const yol=process.env.SEF_KALIP_KARE?process.env.SEF_KALIP_KARE+'/yildiz-hamur-'+width+'.png':testInfo.outputPath('yildiz-hamur-'+width+'.png');
  await page.screenshot({path:yol});
  await page.reload();await expect(birinci).toBeVisible();await expect.poll(alfa).toBe(0);
  await page.getByRole('button',{name:'3. kurabiyeyi tepsiye taşı'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.kb-yuva[data-yer="2"] .kb-biskuvi')).toBeVisible();
  await page.getByRole('button',{name:'2. kurabiyeyi tepsiye taşı'}).tap();
  await expect(page.getByRole('button',{name:'Tepsiyi fırına koy'})).toBeVisible();
});
