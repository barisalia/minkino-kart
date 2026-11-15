import {test,expect} from '@playwright/test';
test('Servis arabasındaki tost doğru masaya ulaşınca bir kez ödeme yapılır',async({page})=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:667,height:375});await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    const tost={evre:'sun',katlar:[{tur:'kasar',x:48,y:52},{tur:'domates',x:64,y:36}],kizartma:'altin',isi:3200};
    Object.assign(k.tepsiler,{restoranda:true,ekran:'masa',secili:'peynirli-tost',restoran:{sira:1,menuId:'peynirli-tost',evre:'mutfak'},masalar:{'peynirli-tost':{tabaklar:{tost:true},tostServisi:tost,tostPuani:3,sunuldu:false}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();await page.getByRole('button',{name:'Servis arabasıyla götür'}).tap();
  const araba=page.locator('.yemek-arabasi');
  const asilTepsi=await page.locator('.araba-tepsisi .araba-yuku').elementHandle();
  await page.getByRole('button',{name:'Tepsiyi arabaya koy'}).dragTo(araba);
  await expect(araba.locator('.tost-yigin')).toBeVisible();
  expect(await araba.locator('.araba-yuku').evaluate((el,ilk)=>el===ilk,asilTepsi)).toBe(true);
  await page.reload();await expect(araba.locator('.tost-yigin')).toBeVisible();
  await expect(page.locator('button.araba-masasi .restoran-oyuncusu[data-poz=otur]')).toHaveCount(2);
  await expect(page.locator('.araba-masasi:not(button)')).toHaveCount(1);
  const ver=page.getByRole('button',{name:'Tepsiyi masaya bırak'});
  const bas=(await araba.boundingBox())!,hedef=(await page.getByRole('button',{name:'Mino masasına götür'}).boundingBox())!;
  const ilkSol=await araba.evaluate(el=>(el as HTMLElement).style.left);
  const dokun=await page.context().newCDPSession(page);
  const y=bas.y+bas.height/2, x=bas.x+bas.width/2;
  await dokun.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await dokun.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+90,y}]});
  expect(await araba.evaluate(el=>(el as HTMLElement).style.left)).not.toBe(ilkSol);
  await dokun.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  expect(await araba.evaluate(el=>(el as HTMLElement).style.left)).toBe(ilkSol);
  await expect(araba.locator('.tost-yigin')).toBeVisible();
  await dokun.detach();
  await page.mouse.move(bas.x+bas.width/2,bas.y+bas.height/2);await page.mouse.down();
  await page.mouse.move(hedef.x+hedef.width/2,bas.y+bas.height/2,{steps:12});await page.mouse.up();
  await expect(ver).toBeVisible();
  await expect(page.locator('.araba-masasi[data-masa=salata] .restoran-oyuncusu')).toHaveAttribute('data-yuz','mutlu');
  if(process.env.SEF_ARABA_KARE)await page.screenshot({path:process.env.SEF_ARABA_KARE});
  await ver.dragTo(page.getByRole('button',{name:'Mino masasına götür'}));
  await expect(page.locator('.arabali-servis')).toHaveCount(0);await page.reload();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.gun.ziyaret).toBe(1);expect(t.jeton).toBe(3);expect(t.anilar).toHaveLength(1);
});
test('Mino yerine Lokum masasına bırakılan tepsi bir puan getirir',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    const id='peynirli-tost';
    Object.assign(k.tepsiler,{restoranda:true,ekran:'masa',secili:id,restoran:{sira:1,menuId:id,evre:'mutfak'},masalar:{[id]:{tabaklar:{tost:true},tostServisi:{evre:'sun',katlar:[{tur:'kasar',x:48,y:52},{tur:'domates',x:64,y:36}],kizartma:'altin',isi:3200},tostPuani:3,sunuldu:false}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await page.getByRole('button',{name:'Servis arabasıyla götür'}).tap();
  const tepsi=page.getByRole('button',{name:'Tepsiyi arabaya koy'});
  const ilk=(await tepsi.boundingBox())!;
  // The upper half of the food sits above the tray rim and is also draggable.
  const x=ilk.x+ilk.width/2,y=ilk.y-ilk.height*.22;
  const bos=page.locator('.araba-fis');
  const hedef=page.getByRole('button',{name:'Lokum masasına götür'});
  for(const yer of [bos,hedef]){
    const r=(await yer.boundingBox())!;
    await page.mouse.move(x,y);await page.mouse.down();
    await page.mouse.move(r.x+r.width/2,r.y+r.height/2,{steps:8});
    await expect(page.locator('.araba-masasi[data-tepsi-hedefi]')).toHaveCount(yer===bos?0:1);
    if(yer===hedef)await expect(hedef).toHaveAttribute('data-tepsi-hedefi','');
    await page.mouse.up();
    if(yer===bos){await expect(tepsi).toBeVisible();await expect(tepsi).toHaveCSS('translate','none');}
  }
  await expect(page.getByRole('button',{name:/^1 jeton kazanıldı/})).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Tepsi puanı')).toHaveText('1 / 3');
  await expect(page.locator('.salon-figur:not(.salon-arkadas)')).toHaveAttribute('data-karakter','lokum');
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.jeton).toBe(1);expect(t.gun.ziyaret).toBe(1);
});
