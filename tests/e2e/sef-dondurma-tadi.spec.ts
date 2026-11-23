import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
test.beforeEach(async({page})=>{await page.routeWebSocket(u=>u.port==='5173',()=>{});});

test('Lokum çilek isterken çocuk çikolata seçebilir ve bitmiş külah kendi tadını korur',async({page})=>{
  await page.setViewportSize({width:740,height:360});
  await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{tatliSeviye:2,secili:'dondurma',ekran:'masa',restoranda:true,
      restoran:{sira:1,menuId:'dondurma',evre:'mutfak'},masalar:{dondurma:{tabaklar:{},sunuldu:false}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();await page.locator('[data-parca=dondurma]').tap();
  await page.getByRole('button',{name:'Çikolatalı top',exact:true}).tap();
  await page.reload();
  const kepce=page.getByRole('button',{name:'Çikolatalı dondurmadan bir top çıkar'});
  for(let i=0;i<7;i++)await kepce.press('Enter');
  await page.getByRole('button',{name:'Çikolatalı topu al'}).press('Enter');
  await page.getByRole('button',{name:'Dondurma topunu külaha koy'}).press('Enter');
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).tap();
  await page.reload();
  await expect(page.locator('.salonda-servis-et .pastane-porsiyonu')).toHaveAttribute('data-tat','cikolata');
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:/6 jeton kazanıldı/})).toBeVisible();
  const porsiyon=page.locator('.tepsi-yuva .pastane-porsiyonu');
  await expect(porsiyon).toHaveAttribute('data-isirik','1');
  await expect(page.locator('.restoran-ilk-tadim')).toHaveCount(0);
  const tattir=porsiyon.locator('..');
  for(const adet of [2,3]){
    await tattir.tap();
    const lokma=page.locator('.restoran-tatli-lokmasi[data-tur=dondurma]');
    await expect(lokma).toBeVisible();
    const yuzey=lokma.locator('canvas[data-isirik=false]');
    await expect.poll(()=>yuzey.evaluate(c=>{
      const el=c as HTMLCanvasElement;
      if(el.width!==240)return 0;
      const renk=el.getContext('2d')!.getImageData(120,Math.round(el.height*.41),1,1).data;
      return renk[3];
    })).toBeGreaterThan(245);
    await expect(porsiyon).toHaveAttribute('data-isirik',String(adet));
    await expect(lokma).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await page.getByRole('button',{name:/Dondurma siparişi ile tabağı karşılaştır/i}).tap();
  await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  await expect(tattir).toHaveAttribute('data-tukendi','true');
  await expect(porsiyon.locator('.tatli-katlari')).toBeHidden();
  const k=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(k.masalar.dondurma).toMatchObject({dondurmaTadi:'cikolata',tatliPuani:2});
  expect(k.anilar[0].masa.dondurmaTadi).toBe('cikolata');
});

test('Vanilyayı kepçeyle kabın yüzeyinden sıyırıp külahın ağzına koyar; yarım dolu kepçe kaybolmaz',async({page})=>{
  test.setTimeout(180000);
  await page.setViewportSize({width:740,height:360});
  await page.goto('./sef/');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    d.tepsiler.tatliSeviye=2;localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  });
  await page.reload();await page.getByRole('button',{name:'Tatlı atölyesini aç'}).tap();
  await page.locator('[data-kademe="2"]').tap();
  await page.getByRole('button',{name:'Çilekli top',exact:true}).tap();
  await page.getByRole('button',{name:'Dondurma tadını değiştir'}).tap();
  await page.getByRole('button',{name:'Vanilyalı top',exact:true}).tap();
  const alan=page.locator('.dk-istasyon'),yuzey=page.locator('.dk-yuzey'),kulah=page.locator('.dk-kulah');
  let r=(await yuzey.boundingBox())!,x=r.x+r.width*.18,y=r.y+r.height*.5;
  const el=await page.context().newCDPSession(page);
  const gonder=(type:'touchStart'|'touchMove'|'touchEnd',x:number,y:number)=>el.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  await gonder('touchStart',x,y);await gonder('touchMove',x+r.width*.11,y);await gonder('touchEnd',0,0);
  const yuzde=Number(await alan.getAttribute('data-oran'));expect(yuzde).toBeGreaterThan(10);expect(yuzde).toBeLessThan(100);
  const kazima=()=>page.locator('.dk-siyrik').evaluate(el=>{
    const c=el as HTMLCanvasElement,ctx=c.getContext('2d')!;
    const oku=(x:number,y:number)=>ctx.getImageData(Math.round(x*c.width),Math.round(y*c.height),1,1).data[3];
    return [oku(.23,.50),oku(.75,.80)];
  });
  expect(await kazima()).toEqual([255,0]);
  const iz=await page.locator('.dk-siyrik').evaluate(el=>(el as HTMLCanvasElement).toDataURL());
  await page.reload();await expect(alan).toHaveAttribute('data-oran',String(yuzde));
  expect(await page.locator('.dk-siyrik').evaluate(el=>(el as HTMLCanvasElement).toDataURL())).toBe(iz);
  r=(await yuzey.boundingBox())!;x=r.x+r.width*.18;y=r.y+r.height*.5;
  await gonder('touchStart',x,y);
  for(let i=1;i<=8;i++)await gonder('touchMove',x+i*r.width*.07,y);
  await expect(alan).toHaveAttribute('data-dolu','true');
  const k=(await kulah.boundingBox())!;
  // Dropping on the waffle tip keeps the full scoop ready for another try.
  await gonder('touchMove',k.x+k.width/2,k.y+k.height*.84);await gonder('touchEnd',0,0);
  await expect(alan).toHaveAttribute('data-dolu','true');await expect(page.locator('.pastane-sunum')).toHaveCount(0);
  if(process.env.SEF_DONDURMA_KARE)await page.screenshot({path:process.env.SEF_DONDURMA_KARE+'/dondurma-dolu-kepce.png'});
  const t=(await page.locator('.dk-tut').boundingBox())!;
  await gonder('touchStart',t.x+t.width*.17,t.y+t.height*.60);
  await gonder('touchMove',k.x+k.width/2,k.y+k.height*.04);
  await gonder('touchEnd',0,0);await el.detach();
  await expect(page.locator('.dk-oturan')).toHaveAttribute('src',/top-vanilya/);
  const yol=await page.locator('.dk-oturan').evaluate(el=>el.getAnimations()[0]?.effect?.getTiming().duration);
  expect(yol).toBe(240);
  await expect(page.locator('.pastane-sunum .tabaktaki-tatli')).toHaveAttribute('src',/dondurma-vanilya/);
  await page.getByRole('button',{name:'Sarı servis tabağı'}).tap();
  await page.getByRole('button',{name:'Vitrine koy'}).tap();
  await expect(page.locator('[data-kademe="2"] .tatli-raf-istasyon img:last-child')).toHaveAttribute('src',/dondurma-vanilya/);
  await page.getByRole('button',{name:'Mutfağa dön'}).tap();
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(d.tepsiler,{secili:'dondurma',ekran:'masa',restoranda:true,
      restoran:{sira:1,menuId:'dondurma',evre:'mutfak'},masalar:{dondurma:{tabaklar:{},sunuldu:false,dondurmaIstegi:'vanilya'}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  });
  await page.reload();await page.getByRole('button',{name:'Vanilyalı Dondurma vitrinden tepsiye al'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:/9 jeton kazanıldı/})).toBeVisible();
  const masa=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar.dondurma);
  expect(masa).toMatchObject({dondurmaTadi:'vanilya',dondurmaIstegi:'vanilya',tatliPuani:3});
});
