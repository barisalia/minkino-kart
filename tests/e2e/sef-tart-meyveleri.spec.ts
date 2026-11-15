import {expect,test,type Locator} from '@playwright/test';

function dizilim(kap:Locator){
  return kap.locator('.tart-dilimi').evaluateAll(els=>els.map(el=>{
    const im=el as HTMLImageElement;return {meyve:im.dataset.meyve,x:parseFloat(im.style.left),y:parseFloat(im.style.top)};
  }));
}
for(const vitrin of [false,true])test('Tart meyveleri '+(vitrin?'vitrinden gelen doğru siparişte':'farklı meyveli siparişte')+' aynı yerlerde servis edilir',async({page})=>{
  test.setTimeout(125000);
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(vitrin=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    const taslak={surum:2,adim:4,yanlis:0},id='meyveli-tart';
    Object.assign(d.tepsiler,{tatliSeviye:4,jeton:2,ekran:'masa',restoranda:true,secili:id,
      restoran:{menuId:id,sira:4,evre:'mutfak'},masalar:{[id]:{sunuldu:false,tartIstegi:'mor',tabaklar:{},tatliTaslagi:taslak}},
      ...(vitrin?{pastane:{acik:true,tezgah:id,vitrin:{},taslaklar:{[id]:taslak}}}:{oynanan:id})});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  },vitrin);
  await page.reload();
  const tart=page.locator('.ta-tart');
  if(!vitrin)await expect(page.getByRole('img',{name:'2 Muz, 3 Yaban mersini'})).toBeVisible();
  const secimler=vitrin?['Muz','Yaban mersini','Yaban mersini','Muz','Yaban mersini']:['Çilek','Yaban mersini','Yaban mersini','Muz','Yaban mersini'];
  const noktalar=[[25,46],[40,34],[56,40],[69,52],[53,60]];
  for(const [i,ad] of secimler.entries()){
    const kay=page.getByRole('button',{name:ad+' dilimini al'});
    const r=(await tart.boundingBox())!,x=r.x+r.width*noktalar[i][0]/100,y=r.y+r.height*noktalar[i][1]/100;
    if(i===0){
      const b=(await kay.boundingBox())!;await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
      await page.mouse.move(x,y,{steps:9});await page.mouse.up();
    }else{
      await kay.tap();await page.touchscreen.tap(x,y);
    }
    if(i<4)await expect(tart.locator('.tart-dilimi')).toHaveCount(i+1);
    if(i===1){
      const once=await dizilim(tart);await page.reload();expect(await dizilim(tart)).toEqual(once);
    }
    if(i===3&&process.env.SEF_TART_KARE)await page.screenshot({path:process.env.SEF_TART_KARE+'/tart-meyve-dizme.png'});
  }
  await expect(tart.locator('.tart-dilimi')).toHaveCount(5);
  if(!vitrin){
    const kurulu=await dizilim(tart);
    await page.getByRole('button',{name:'Muz dilimini al'}).tap();
    await page.getByRole('button',{name:'1. Çilek dilimini taşı'}).tap();
    await expect(page.locator('.tart-fis-rozet [data-meyve=muz]')).toHaveAttribute('data-tamam','true');
    await page.getByRole('button',{name:'Son meyve değişikliğini geri al'}).tap();
    expect(await dizilim(tart)).toEqual(kurulu);
    const cilek=page.getByRole('button',{name:'1. Çilek dilimini taşı'});
    const yaban=page.getByRole('button',{name:'2. Yaban mersini dilimini taşı'});
    await cilek.dragTo(yaban);
    const yeni=await dizilim(tart);
    expect(yeni[0]).toEqual({...kurulu[0],x:kurulu[1].x,y:kurulu[1].y});
    expect(yeni[1]).toEqual({...kurulu[1],x:kurulu[0].x,y:kurulu[0].y});
    await page.getByRole('button',{name:'Son meyve değişikliğini geri al'}).tap();
    expect(await dizilim(tart)).toEqual(kurulu);
  }
  await page.getByRole('button',{name:'Tartı tabağa al'}).tap();
  const porsiyon=page.locator('.pastane-porsiyonu');
  await expect(porsiyon.locator('.tart-dilimi')).toHaveCount(5);
  const ilk=await dizilim(porsiyon);
  ilk.forEach((d,i)=>{expect(Math.abs(d.x-noktalar[i][0])).toBeLessThan(1.3);expect(Math.abs(d.y-noktalar[i][1])).toBeLessThan(1.3);});
  await page.getByRole('button',{name:vitrin?'Vitrine koy':'Tatlıyı tepsiye koy'}).tap();
  if(vitrin){
    await expect(page.locator('.tart-tam-gorsel .tart-dilimi')).toHaveCount(5);
    expect(await dizilim(page.locator('.tart-tam-gorsel'))).toEqual(ilk);
    await page.getByRole('button',{name:'Mutfağa dön'}).tap();
    expect(await dizilim(page.locator('.vitrinden-sun'))).toEqual(ilk);
    await page.getByRole('button',{name:'Meyveli Tart vitrinden tepsiye al'}).tap();
  }
  await page.reload();expect(await dizilim(page.locator('.tepsi-yuva'))).toEqual(ilk);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:new RegExp((vitrin?24:16)+' jeton kazanıldı')})).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.anilar.at(-1)?.masa.tartDilimleri)).toEqual(ilk);
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);d.tepsiler.ekran='kapali';d.tepsiler.restoranda=false;
    localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  });
  await page.reload();await page.getByRole('button',{name:'Hazırladığım tabaklar'}).tap();
  await expect(page.locator('.ani-karti')).toHaveCount(1);
  expect(await dizilim(page.locator('.ani-karti'))).toEqual(ilk);
  if(process.env.SEF_TART_KARE){
    await page.locator('.ani-karti').tap();await page.screenshot({path:process.env.SEF_TART_KARE+'/tart-album-'+(vitrin?'dogru':'farkli')+'.png'});
  }
});

for(const yak of [false,true])test('Tartın kenarı ve fırından '+(yak?'geç':'zamanında')+' çıkarılması krema aşamasına taşınır',async({page},testInfo)=>{
  await page.setViewportSize({width:yak?568:844,height:yak?320:390});
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!),id='meyveli-tart';
    Object.assign(d.tepsiler,{tatliSeviye:4,jeton:2,ekran:'masa',restoranda:true,secili:id,oynanan:id,
      restoran:{menuId:id,sira:4,evre:'mutfak'},masalar:{[id]:{sunuldu:false,tartIstegi:'mor',tabaklar:{},tatliTaslagi:{surum:2,adim:0,yanlis:0}}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  });
  await page.reload();
  const merdane=page.locator('.ta-iz-alani[data-is=merdane]');
  await merdane.focus();
  for(let i=0;i<15&&await merdane.count()&&!await merdane.isDisabled();i++)await page.keyboard.press('Enter');
  const kenar=page.locator('.ta-tart-kalip');
  const iz=kenar.locator('.ta-parmak-izi');
  await iz.nth(3).tap();await iz.nth(0).tap();await page.reload();
  await expect(kenar.locator('[data-basildi=true]')).toHaveCount(2);
  for(const i of [4,2,1])await iz.nth(i).tap();
  const firin=page.locator('.ta-firin-istasyonu'),tus=page.getByRole('button',{name:'Tepsiyi fırına koy'});
  await expect(firin.locator('.ta-tart-cig')).toBeVisible();
  await tus.tap();
  const al=page.getByRole('button',{name:'Tepsiyi fırından çıkar'});
  await al.tap();await expect(firin).toHaveAttribute('data-evre','pisiyor');
  await expect(firin).toHaveAttribute('data-evre','hazir',{timeout:8000});
  await expect(firin.locator('.ta-tart-pismis')).toBeVisible();
  await expect(firin.locator('.ta-tart-cig')).toBeHidden();
  if(yak)await expect(firin).toHaveAttribute('data-evre','fazla',{timeout:8500});
  const dosya='tart-firin-'+(yak?'fazla-568':'hazir-844')+'.png';
  await page.screenshot({path:process.env.SEF_TART_KARE?process.env.SEF_TART_KARE+'/'+dosya:testInfo.outputPath(dosya)});
  await al.tap();
  await expect(page.getByRole('button',{name:'Tartın kremasını yay'})).toBeVisible();
  const taslak=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar['meyveli-tart'].tatliTaslagi);
  expect(taslak.yanlis).toBe(yak?1:0);
  expect(!!taslak.fazlaPisti).toBe(yak);
  const krema=page.getByRole('button',{name:'Tartın kremasını yay'});
  await krema.focus();
  for(let i=0;i<45&&await krema.count()&&await krema.getAttribute('data-tamam')!=='true';i++)await page.keyboard.press('Enter');
  const tart=page.locator('.ta-tart');
  const baz=yak?'tart-kremali-kavruk.webp':'tart-kremali.webp';
  await expect(tart.locator('.ta-tart-tabani')).toHaveAttribute('src',new RegExp(baz));
  const fis=['Muz','Muz','Yaban mersini','Yaban mersini','Yaban mersini'];
  for(let i=0;i<5;i++){
    await page.getByRole('button',{name:fis[i]+' dilimini al'}).tap();
    await tart.locator('.ta-tart-yuva').nth(i).tap();
  }
  await page.getByRole('button',{name:'Tartı tabağa al'}).tap();
  await expect(page.locator('.pastane-porsiyonu .tabaktaki-tatli')).toHaveAttribute('src',new RegExp(baz));
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).tap();
  await page.reload();
  await expect(page.locator('.tepsi-yuva .tabaktaki-tatli')).toHaveAttribute('src',new RegExp(baz));
  const tabak=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar['meyveli-tart']);
  expect(tabak.tatliPuani).toBe(yak?2:3);
  expect(tabak.tartDilimleri.map((d:{meyve:string})=>d.meyve)).toEqual(['muz','muz','yaban','yaban','yaban']);
});
