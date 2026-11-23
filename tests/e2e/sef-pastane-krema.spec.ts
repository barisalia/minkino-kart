import {expect,test,type Page} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
test.use({hasTouch:true,isMobile:true,viewport:{width:740,height:360}});
test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.hostname==='localhost',s=>s.connectToServer().onMessage(m=>{if(typeof m==='string'&&m.includes('full-reload'))return;s.send(m);}));
});
async function tezgah(page:Page,id:string,adim:number){
  await page.goto('./sef/?test=1');
  await page.evaluate(({id,adim})=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{tatliSeviye:4,secili:id,restoranda:false,ekran:'masa',oynanan:id,masalar:{[id]:{sunuldu:false,tabaklar:{},tatliTaslagi:{surum:2,adim,yanlis:0}}}}}));
  },{id,adim});await page.reload();
}
async function parmak(page:Page){
  const c=await page.context().newCDPSession(page);
  const gonder=(type:'touchStart'|'touchMove'|'touchEnd',x:number,y:number)=>c.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,radiusX:4,radiusY:4}]});
  return {bas:(x:number,y:number)=>gonder('touchStart',x,y),tasi:(x:number,y:number)=>gonder('touchMove',x,y),birak:()=>gonder('touchEnd',0,0),kapat:()=>c.detach()};
}
test('Kâseyi yatırınca ağızdan hamur akar; bırakınca kesilir ve kaydı fırına taşınır',async({page})=>{
  await tezgah(page,'minik-kek',1);
  const b=page.getByRole('button',{name:'Hamuru kek kalıbına dök'}),r=(await b.boundingBox())!,k=(await page.locator('.kek-dokum').boundingBox())!;
  const x=r.x+r.width*.42,y=r.y+r.height*.45,el=await parmak(page);
  await el.bas(x,y);await el.tasi(x+k.width*.21,y+k.height*.18);
  await expect.poll(async()=>Number(await page.locator('.kek-dokum').getAttribute('data-oran'))).toBeGreaterThan(12);
  await expect(page.locator('.kek-akis')).toBeVisible();
  if(process.env.TOST_ONIZLEME)await page.screenshot({path:process.env.TOST_ONIZLEME+'/kek-hamur-akisi.png'});
  await el.birak();await el.kapat();await expect(page.locator('.kek-akis')).toBeHidden();
  const oran=Number(await page.locator('.kek-dokum').getAttribute('data-oran'));expect(oran).toBeGreaterThan(12);expect(oran).toBeLessThan(100);
  await page.getByRole('button',{name:'Tepsiye dön'}).tap();await page.getByRole('button',{name:'Çilekli Minik Kek hazırla',exact:true}).tap();
  await expect(page.locator('.kek-dokum')).toHaveAttribute('data-oran',String(oran));
  await b.tap();await expect(page.getByRole('button',{name:'Tepsiyi fırına koy'})).toBeVisible();
  await expect(page.locator('.ta-firin-yemek .kek-dolum-kalibi')).toHaveCount(1);
});
test('Kaşığın değdiği yerde gerçek tart kreması görünür, izler korunur ve meyve aşamasına geçilir',async({page})=>{
  await tezgah(page,'meyveli-tart',3);
  const b=page.getByRole('button',{name:'Tartın kremasını yay'});const r=(await b.boundingBox())!;
  const el=await parmak(page);
  const nokta=(x:number,y:number)=>({x:r.x+r.width*x,y:r.y+r.height*y});
  const bas=nokta(.20,.42),son=nokta(.56,.45);
  await el.bas(bas.x,bas.y);for(let i=1;i<=8;i++)await el.tasi(bas.x+(son.x-bas.x)*i/8,bas.y+(son.y-bas.y)*i/8);await el.birak();await el.kapat();
  const iz=await page.locator('.tart-krem-izi').evaluate(c=>{const ctx=(c as HTMLCanvasElement).getContext('2d')!;return [ctx.getImageData(98,98,1,1).data[3],ctx.getImageData(282,115,1,1).data[3]];});
  expect(iz[0]).toBeGreaterThan(245);expect(iz[1]).toBe(0);
  if(process.env.TOST_ONIZLEME)await page.screenshot({path:process.env.TOST_ONIZLEME+'/tart-krema-izi.png'});
  const oran=await b.getAttribute('data-kaplama');await page.reload();await expect(b).toHaveAttribute('data-kaplama',oran!);
  for(let i=0;i<30&&await b.count();i++){
    const h=page.locator('.tart-krem-hedef');if(!await h.isVisible())break;
    const yer=(await h.boundingBox())!;await page.touchscreen.tap(yer.x+yer.width/2,yer.y+yer.height/2);
  }
  await expect(page.locator('.ta-tart-yuva')).toHaveCount(5);
});
