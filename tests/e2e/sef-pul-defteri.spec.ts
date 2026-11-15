import {expect,test} from '@playwright/test';

test('Bir yıldızlık ilk servis de pul verir, tekrar tadımda pul çoğalmaz',async({page})=>{
  await page.setViewportSize({width:667,height:320});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{
      jeton:0,tatliSeviye:1,secili:'kurabiye',restoranda:true,ekran:'masa',
      restoran:{sira:2,menuId:'kurabiye',sonYemek:'corba-sofrasi',evre:'mutfak'},
      gun:{no:3,ziyaret:2,kazanc:5,kapandi:false},pastane:{acik:false,taslaklar:{},vitrin:{}},
      masalar:{kurabiye:{tabaklar:{kurabiye:true},sunuldu:false,tatliPuani:1}}
    });
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  const damga=page.getByRole('button',{name:/Yeni pul:/});
  await damga.click();
  const defter=page.getByRole('dialog',{name:'Pastane pul defteri'});
  await expect(defter.locator('.pul-yeri:enabled')).toHaveCount(1);
  await defter.locator('.pul-yeri:enabled').click();
  await expect(defter.locator('.pul-yakin')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(defter.locator('.pul-yakin')).toHaveCount(0);
  await defter.getByRole('button',{name:'Çilekli Dondurma pulları'}).click();
  await expect(defter.locator('.pul-yeri:enabled')).toHaveCount(0);
  await defter.getByRole('button',{name:'Defteri kapat'}).click();
  await page.reload();
  await expect(damga).toBeVisible();
  await page.getByRole('button',{name:'Yıldız Kurabiye tattır'}).click();
  await page.getByRole('button',{name:/2 jeton kazanıldı/}).click();
  await page.getByRole('button',{name:'Pastane pul defterini aç'}).click();
  await expect(defter.locator('.pul-yeri:enabled')).toHaveCount(1);
  await defter.getByRole('button',{name:'Defteri kapat'}).click();
  await page.getByRole('button',{name:'Mutfağa dön'}).click();
  await page.getByRole('button',{name:'Günü kapat'}).click();
  await page.getByRole('button',{name:'4. güne başla'}).click();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.pastane.pullar).toEqual({kurabiye:1});expect(t.jeton).toBe(2);
});

test('Pul defteri son kazanılan sayfayı gösterir ve yatay telefonda altı pul sığar',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({
      sessiz:true,tepsiler:{tatliSeviye:1,pastane:{acik:true,pullar:{kurabiye:7}}}
    }));
  });
  await page.reload();
  await page.getByRole('button',{name:'Pastane pul defterini aç'}).click();
  const kitap=page.getByRole('dialog',{name:'Pastane pul defteri'});
  await expect(kitap.locator('.pul-yeri:enabled')).toHaveCount(1);
  await kitap.getByRole('button',{name:'Önceki pul sayfası'}).click();
  await expect(kitap.locator('.pul-yeri:enabled')).toHaveCount(6);
  await expect.poll(()=>kitap.locator('.pul-yeri img').evaluateAll(imgs=>imgs.every(el=>(el as HTMLImageElement).naturalWidth>0))).toBe(true);
  expect(await kitap.locator('.pul-yeri img').evaluateAll(imgs=>imgs.every(img=>{
    const a=img.getBoundingClientRect(),kart=img.parentElement!.getBoundingClientRect();
    return a.top>=kart.top && a.bottom<=kart.bottom && a.left>=kart.left && a.right<=kart.right;
  }))).toBe(true);
  expect(await kitap.evaluate(el=>el.scrollWidth===el.clientWidth&&el.scrollHeight===el.clientHeight)).toBe(true);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('minkino:geri',{cancelable:true})));
  await expect(kitap).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Pastane pul defterini aç'})).toBeVisible();
});
