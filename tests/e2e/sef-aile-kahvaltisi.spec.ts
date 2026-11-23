import {test,expect} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

for(const width of [568,844])test('Aile kahvaltısında gerçek tabağı sahibine götür ve gün kaydını koru '+width,async({page},info)=>{
  test.setTimeout(130000);
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width,height:width===568?320:390});
  await page.goto('./sef/');
  await page.evaluate(()=>{
    const id='aile-kahvaltisi';
    const omletServisi={evre:'sun',yumurta:2,cirpma:1,sure:6000,icler:[{tur:'peynir',x:30,y:44},{tur:'domates',x:35,y:60}]};
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:false,tepsiler:{restoranda:true,ekran:'masa',secili:id,restoran:{sira:7,menuId:id,evre:'gelis'},masalar:{[id]:{sunuldu:false,tabaklar:{omlet:true,icecek:true},omletServisi,omletPuan:3,icecekMeyvesi:'limon',icecekPuani:3,icecekMiktari:3,adim:{tavuk:0,icecek:5}}}}}));
  });
  await page.reload();
  const sini=page.locator('.tepsi-sahnesi');
  const sesler=new Set<string>();page.on('response',r=>{if(r.url().includes('/salon/')&&r.ok())sesler.add(r.url());});
  await page.getByRole('button',{name:'Siparişe geç'}).tap();
  await expect(sini.locator('.salon-figur[data-poz=otur]')).toHaveCount(2);
  if(await page.evaluate(()=>'AudioContext' in window||'webkitAudioContext' in window)){
    await expect.poll(()=>[...sesler].some(s=>s.includes('kino-restoran-aile-kahvaltisi.mp3'))).toBe(true);
    await expect.poll(()=>[...sesler].some(s=>s.includes('anne-aile-limon.mp3')),{timeout:18000}).toBe(true);
  }
  await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  const alan=page.getByRole('region',{name:'Aile kahvaltısını masaya yerleştir'}),anne=alan.getByRole('button',{name:'Anne için kahvaltı yeri'}),kino=alan.getByRole('button',{name:'Kino için kahvaltı yeri'});
  const omlet=alan.getByRole('button',{name:'Omlet al'}),bardak=alan.getByRole('button',{name:'Limon suyu al'}),sun=alan.getByRole('button',{name:'Kahvaltıyı sun'});
  if(width===844){
    await omlet.tap();await anne.tap();
    await expect(page.getByRole('button',{name:/^1 jeton kazanıldı/})).toBeVisible();
    await page.reload();await expect(page.getByLabel('Tepsi puanı')).toHaveText('1 / 6');return;
  }
  await omlet.tap();await expect(omlet).toHaveAttribute('aria-pressed','true');await expect(sun).toBeHidden();
  await omlet.dragTo(kino);await expect(kino.locator('.om-tabak')).toBeVisible();
  await page.reload();await expect(kino).toHaveAttribute('data-dolu','true');await expect(omlet).toHaveCount(0);
  await bardak.tap();await kino.tap();
  await expect(kino.locator('.om-tabak')).toBeVisible();await expect(sun).toBeHidden();
  const anneninYuzu=page.getByRole('button',{name:'Anne için tabağı bırak'});
  await bardak.dragTo(anneninYuzu);await expect(sun).toBeVisible();
  await page.screenshot({path:info.outputPath('aile-masasi-'+width+'.png')});
  await sun.tap();
  await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(/6 jeton/);
  await expect(page.locator('.restoran-lokma')).toHaveCount(0,{timeout:15000});
  const servis=page.locator('.tepsi-yuva[data-parca=icecek]');
  if(width===568){
    const konuk=page.locator('.salon-figur[data-karakter=anne]');
    const hedef=await konuk.evaluate(el=>{
      const poz=el as HTMLElement,r=poz.querySelector('.restoran-oyuncu-bedeni')!.getBoundingClientRect();
      return {x:r.left+r.width*Number(poz.dataset.agizX),y:r.top+r.height*Number(poz.dataset.agizY)};
    });
    const r=(await servis.boundingBox())!;await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
    await page.mouse.move(hedef.x,hedef.y,{steps:7});await expect(konuk).toHaveAttribute('data-yuz','acik');await page.mouse.up();
  }else await servis.tap();
  await expect(page.locator('.restoran-lokma')).toHaveAttribute('data-alici','anne');
  await expect(servis).toHaveAttribute('data-lokma-adedi','1');
  await expect(page.getByRole('dialog')).toBeVisible({timeout:15000});await page.keyboard.press('Escape');
  const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect([s.jeton,s.gun.ziyaret,s.anilar.length,s.masalar['aile-kahvaltisi'].tadilan.icecek]).toEqual([6,1,1,1]);
});
