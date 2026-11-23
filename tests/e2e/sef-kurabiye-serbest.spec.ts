import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test.use({viewport:{width:740,height:360},hasTouch:true,video:{mode:'on',size:{width:740,height:360}}});
test('Çocuk yıldızı seçtiği yerde keser, açık kenarda ve önceki kesiğin üzerinde kalıp geri döner',async({page},testInfo)=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{secili:'kurabiye',ekran:'masa',restoranda:true,tatliSeviye:1,oynanan:'kurabiye',
      restoran:{sira:3,menuId:'kurabiye',evre:'mutfak'},masalar:{kurabiye:{sunuldu:false,tabaklar:{},kurabiyeIstegi:'yildiz',tatliTaslagi:{adim:2,surum:2,yanlis:0}}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });await page.reload();
  const kalip=page.locator('.kb-bas'),r=(await page.locator('.kb-hamur').boundingBox())!;
  const yer=(x:number,y:number)=>({x:r.x+x*r.width,y:r.y+y*r.height});
  async function koy(x:number,y:number){
    await expect(kalip).toBeEnabled();
    const b=(await kalip.boundingBox())!,p=yer(x,y);
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
    await page.mouse.move(p.x,p.y,{steps:12});
  }
  await koy(.02,.02);
  await expect(kalip).toHaveAttribute('data-engel','kenar');
  await page.mouse.up();await expect(kalip).toBeEnabled();await expect(page.locator('.kb-kesik')).toHaveCount(0);
  await koy(.34,.36);await page.mouse.up();await expect(page.locator('.kb-kesik')).toHaveCount(1);
  await koy(.34,.36);await expect(kalip).toHaveAttribute('data-engel','kesik');
  await page.mouse.up();await expect(kalip).toBeEnabled();await expect(page.locator('.kb-kesik')).toHaveCount(1);
  await page.reload();await expect(kalip).toBeEnabled();
  const kesik=page.locator('.kb-kesik[data-yer="0"]'),ilk=await kesik.boundingBox();
  expect(Math.abs(ilk!.x+ilk!.width/2-yer(.34,.36).x)).toBeLessThan(1.5);
  const ikinci=yer(.67,.43);await page.touchscreen.tap(ikinci.x,ikinci.y);
  await expect(page.locator('.kb-kesik')).toHaveCount(2);
  const ikinciKutu=(await page.locator('.kb-kesik[data-yer="1"]').boundingBox())!;
  expect(Math.abs(ikinciKutu.x+ikinciKutu.width/2-ikinci.x)).toBeLessThan(1.5);
  expect(Math.abs(ikinciKutu.y+ikinciKutu.height/2-ikinci.y)).toBeLessThan(1.5);
  await koy(.47,.72);await page.mouse.up();await expect(page.locator('.kb-aktar')).toHaveCount(3);
  await page.locator('.kb-aktar[data-yer="0"]').tap();
  await expect(page.locator('.kb-yuva[data-yer="0"] .kb-biskuvi')).toBeVisible();
  const alfalar=await page.locator('canvas.kb-hamur-resmi').evaluate(el=>{
    const c=el as HTMLCanvasElement,ctx=c.getContext('2d')!;
    return [[.34,.36],[.25,.47]].map(([x,y])=>ctx.getImageData(Math.round(x*c.width),Math.round(y*c.height),1,1).data[3]);
  });
  expect(alfalar).toEqual([0,255]);
  const png='yildiz-serbest-kesim-740.png';
  await page.screenshot({path:process.env.SEF_KALIP_KARE?process.env.SEF_KALIP_KARE+'/'+png:testInfo.outputPath(png)});
  await page.locator('.kb-aktar[data-yer="2"]').tap();await page.locator('.kb-aktar[data-yer="1"]').tap();
  await page.getByRole('button',{name:'Tepsiyi fırına koy'}).tap();
  await expect(page.locator('.ta-firin-istasyonu')).toHaveAttribute('data-evre','hazir',{timeout:8000});
  await expect(page.locator('.ta-firin-yemek .kb-dizi:visible .kb-tane[data-sekil=yildiz]')).toHaveCount(3);
  if(process.env.SEF_KALIP_KARE){
    const video=page.video();await page.close();await video?.saveAs(process.env.SEF_KALIP_KARE+'/yildiz-serbest-kesim-740.webm');
  }
});
