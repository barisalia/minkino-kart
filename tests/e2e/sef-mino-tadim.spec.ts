import {expect,test} from '@playwright/test';

for(const puan of [3,1]){
  test('Mino kendi lokmasını alır ve '+(puan===3?'tabağı beğenir':'fazla pişmiş tavuğu nazikçe değerlendirir'),async({page})=>{
    await page.setViewportSize({width:844,height:390});
    await page.routeWebSocket(url=>url.port==='5173',()=>{});
    await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).tap();
    await page.evaluate(s=>{
      const kayit=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
      Object.assign(kayit.tepsiler,{restoranda:true,ekran:'masa',secili:'fiyonk-tavuk',
        restoran:{sira:1,menuId:'fiyonk-tavuk',evre:'mutfak',sayildi:true},
        masalar:{'fiyonk-tavuk':{sunuldu:true,tabaklar:{tavuk:true},tavukPuani:s}}});
      localStorage.setItem('minkino-sef-v1',JSON.stringify(kayit));
    },puan);
    await page.reload();
    const konuk=page.locator('.salon-figur[data-karakter=mino]');
    const pozlar=await konuk.evaluateHandle(el=>{
      const pozlar:string[]=[];
      new MutationObserver(()=>pozlar.push(el.getAttribute('data-yuz')!)).observe(el,{attributes:true,attributeFilter:['data-yuz']});
      return pozlar;
    });
    const tabak=page.getByRole('button',{name:'Tavada Tavuk tattır'});
    await tabak.tap();
    await expect.poll(()=>pozlar.jsonValue()).toContain('cigne-2');
    await expect.poll(()=>pozlar.jsonValue()).toContain(puan===3?'cigne-4':'cigne-5');
    await expect(tabak).toHaveAttribute('data-lokma-adedi','1');
    await expect(konuk).not.toHaveAttribute('data-tadim',/./);
    await expect(konuk).toHaveAttribute('data-yuz','kapali');
  });
}
