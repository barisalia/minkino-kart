import {expect,test} from '@playwright/test';

test('Lokum bardaktan yudum alır, yutar ve aynı oturma pozuna döner',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const oyun=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(oyun.tepsiler,{restoranda:true,ekran:'masa',secili:'pizza-molasi',
      restoran:{sira:2,menuId:'pizza-molasi',evre:'mutfak',sayildi:true},
      masalar:{'pizza-molasi':{sunuldu:true,tabaklar:{icecek:true},icecekMeyvesi:'portakal',icecekPuani:3,icecekMiktari:3}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(oyun));
  });
  await page.reload();
  const konuk=page.locator('.salon-figur[data-karakter=lokum]');
  await expect(konuk).toBeVisible();
  const pozlar=await konuk.evaluateHandle(el=>{
    const s:string[]=[];
    new MutationObserver(()=>{s.push(el.getAttribute('data-yuz')!);}).observe(el,{attributes:true,attributeFilter:['data-yuz']});
    return s;
  });
  await page.getByRole('button',{name:/Portakal suyu tattır/i}).tap();
  await expect.poll(()=>pozlar.jsonValue()).toContain('yudum-2');
  await expect.poll(()=>pozlar.jsonValue()).toContain('yudum-3');
  await expect(konuk).not.toHaveAttribute('data-tadim',/./);
  await expect(konuk).toHaveAttribute('data-yuz','kapali');
});
