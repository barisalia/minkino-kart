import {expect,test} from '@playwright/test';

test('İki kez ısırılan simit tepsiden kaldırılır, geri bırakılır ve son lokmada biter',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.routeWebSocket(u=>u.port==='5173',()=>{});await page.goto('./sef/');
  await page.evaluate(()=>{
    const id='babaanne-simidi';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{restoranda:true,ekran:'masa',secili:id,restoran:{sira:12,menuId:id,evre:'mutfak',sayildi:true},masalar:{[id]:{
      sunuldu:true,tadilan:{simit:2},tabaklar:{simit:true},simitServisi:{evre:'sun',uzunluk:1,sol:1,sag:1,kaplama:'hashas',isi:4400}}}}}));
  });await page.reload();
  const tabak=page.getByRole('button',{name:'Simit tattır'}),simit=tabak.locator('.simit-halkasi');
  await expect(tabak).toHaveAttribute('data-lokma-adedi','2');
  const yarim=await simit.evaluate(n=>getComputedStyle(n).clipPath);
  const r=(await tabak.boundingBox())!;
  await page.mouse.move(r.x+r.width*.5,r.y+r.height*.5);await page.mouse.down();
  await page.mouse.move(r.x+r.width*.7,r.y-20,{steps:5});
  const elde=page.locator('.restoran-lokma[data-tur=simit]>.simit-halkasi');
  await expect(elde).toBeVisible();await expect(simit).toBeHidden();
  expect(await elde.evaluate(n=>getComputedStyle(n).clipPath)).toBe(yarim);
  await page.mouse.move(10,10);await page.mouse.up();await expect(simit).toBeVisible();
  await expect(tabak).toHaveAttribute('data-lokma-adedi','2');
  await tabak.tap();await expect(tabak).toHaveAttribute('data-tukendi','true');
  await expect(elde).toBeHidden();await expect(simit).toBeHidden();
});

for(const dogru of [true,false]){
  test('Babaanne Nazlı simidinde '+(dogru?'haşhaşı beğenir':'susamı fark eder'),async({page})=>{
    test.setTimeout(95000);
    await page.setViewportSize({width:844,height:390});
    await page.routeWebSocket(url=>url.port==='5173',()=>{});
    const sesler:string[]=[];
    page.on('request',r=>{if(r.url().includes('/salon/babaanne-'))sesler.push(r.url());});
    await page.goto('./sef/');await page.getByRole('button',{name:'Sesi kapat'}).tap();
    await page.evaluate(()=>{
      const oyun=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
      oyun.sessiz=false;
      Object.assign(oyun.tepsiler,{restoranda:true,ekran:'masa',secili:'babaanne-simidi',
        restoran:{sira:12,menuId:'babaanne-simidi',evre:'gelis'},
        masalar:{'babaanne-simidi':{tabaklar:{},sunuldu:false,simitTaslagi:{evre:'kapla',uzunluk:1,sol:1,sag:1,isi:0}}}});
      localStorage.setItem('minkino-sef-v1',JSON.stringify(oyun));
    });
    await page.reload();
    const nazli=page.locator('.salon-figur[data-karakter=babaanne]');
    await expect(nazli).toHaveAttribute('data-poz','otur',{timeout:15000});
    await page.getByRole('button',{name:'Siparişi tekrar dinle'}).tap();
    await expect.poll(()=>sesler.some(s=>s.includes('babaanne-restoran-babaanne-simidi.mp3'))).toBe(true);
    await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).tap();
    await page.locator('[data-parca=simit]').first().tap();
    await page.getByRole('button',{name:'Babaanne’nin simit siparişini dinle'}).tap();
    await page.getByRole('button',{name:dogru?'Haşhaşa bula':'Susama bula'}).tap();
    await page.getByRole('button',{name:'Simidi fırına ver'}).tap();
    await page.getByRole('button',{name:'Simidi pişirmeye başla'}).tap();
    await expect(page.getByRole('meter')).toHaveAttribute('aria-valuetext','Altın renginde',{timeout:12000});
    await page.getByRole('button',{name:'Simidi fırından çıkar'}).tap();
    await page.getByRole('button',{name:'Simidi tepsiye koy'}).tap();
    await page.getByRole('button',{name:'Servis arabasıyla götür'}).tap();
    await page.getByRole('button',{name:'Tepsiyi arabaya koy'}).tap();
    await page.getByRole('button',{name:'Babaanne Nazlı masasına götür'}).tap();
    await page.getByRole('button',{name:'Müşteriyi dinle'}).tap();
    await expect.poll(()=>sesler.some(s=>s.includes((dogru?'babaanne-simit-tam':'babaanne-simit-kaplama')+'.mp3'))).toBe(true);
    await page.getByRole('button',{name:'Simit tattır'}).tap();
    await expect(nazli).toHaveAttribute('data-yuz',dogru?'tat-2':'tat-5');
    await expect(nazli).not.toHaveAttribute('data-tadim',/./);
    if(await page.getByRole('dialog').count())await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Sıradaki müşteriyi karşıla'}).tap();
    await expect(nazli).toHaveAttribute('data-poz','ayril');
    await expect(nazli).toHaveCount(0,{timeout:10000});
  });
}
