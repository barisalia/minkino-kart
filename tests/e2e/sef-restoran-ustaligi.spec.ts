import {expect,test} from '@playwright/test';

test('Ustalık ödülleri gün sonunda açılır, seçilen dekor sabaha ve yeni kayda taşınır',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      ekran:'masa',secili:'kurabiye',restoranda:true,tatliSeviye:1,jeton:9,
      gun:{no:3,ziyaret:2,kazanc:8,kapandi:false},
      restoran:{sira:8,menuId:'kurabiye',sonYemek:'corba-sofrasi',evre:'mutfak'},
      masalar:{kurabiye:{tabaklar:{kurabiye:true},tatliPuani:3,sunuldu:false}},
      ustalik:{tamMasa:2,tatli:1,kazanilan:['vazo','pecete'],takili:['vazo','pecete']}
    }}));
  });
  await page.reload();
  await expect(page.locator('.tepsi-sahnesi>.ustalik-vazo')).toBeVisible();
  await expect(page.locator('.salonda-servis-et>.ustalik-pecete')).toBeVisible();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await page.getByRole('button',{name:'Günü kapat'}).click();
  await page.getByRole('button',{name:'Vedayı geç'}).click();
  await page.getByRole('button',{name:'4. güne başla'}).click();
  await page.getByRole('button',{name:'Siparişe geç'}).click();
  const masa=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
  await expect(masa).toBeVisible();await expect(page.locator('.tepsi-sahnesi>.ustalik-vazo')).toBeVisible();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.jeton).toBe(15);
  expect(t.ustalik).toMatchObject({tamMasa:2,tatli:2,kazanilan:['vazo','pecete','rozet'],takili:['vazo','pecete','rozet']});
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    k.tepsiler.pastane.acik=true;
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await expect(page.locator('.tatli-dukkan .ustalik-rozet')).toBeVisible();
  const dekor=page.getByRole('button',{name:'Restoran dekorlarını aç'});
  const rozet=page.getByRole('button',{name:'Pastacı rozeti',exact:true});
  await dekor.click();await expect(rozet).toHaveAttribute('aria-pressed','true');
  await rozet.click();await expect(rozet).toHaveAttribute('aria-pressed','false');
  await page.reload();await dekor.click();await expect(rozet).toHaveAttribute('aria-pressed','false');
  await rozet.click();await expect(rozet).toHaveAttribute('aria-pressed','true');
});

test('Eski kayıtta eksik servis ikinci tam sofrayı saymaz, sabah yalnız vazo açılır',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      ekran:'masa',secili:'corba-sofrasi',restoranda:true,jeton:4,gun:{no:2,ziyaret:2,kazanc:1,kapandi:false},
      restoran:{sira:5,menuId:'corba-sofrasi',evre:'mutfak'},
      masalar:{'corba-sofrasi':{tabaklar:{icecek:true},icecekPuani:3,sunuldu:false}}
    }}));
  });
  await page.reload();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).click();
  await page.getByRole('button',{name:'Günü kapat'}).click();
  await page.getByRole('button',{name:'Vedayı geç'}).click();
  await expect(page.getByRole('button',{name:'3. güne başla'})).toBeVisible();
  expect(await page.locator('.aksam-kazanci').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight)).toBe(true);
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.ustalik.tamMasa).toBe(0);expect(t.jeton).toBe(7);
  expect(t.ustalik.kazanilan).toEqual(['vazo']);expect(t.ustalik.takili).toEqual(['vazo']);
});
