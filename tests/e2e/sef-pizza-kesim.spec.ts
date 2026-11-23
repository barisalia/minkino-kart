import {expect,test,type Page,type Locator} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
async function kes(page:Page,el:Locator,yol:number[][]){
  const b=(await el.boundingBox())!,c=await page.context().newCDPSession(page);
  try{
    for(const [i,[x,y]] of yol.entries())await c.send('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[{x:b.x+b.width*x,y:b.y+b.height*y}]});
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await c.detach();}
}
test('Paylaşılan pizza parmakla dört dilime kesilir, her lokma kendi çeyreğini kaldırır',async({page},info)=>{
  await page.routeWebSocket(u=>u.port==='5173',()=>{});
  await page.setViewportSize(info.project.name==='ipad'?{width:844,height:390}:{width:568,height:320});
  await page.goto('./sef/?giris=tepsiler&siparis=paylasilan-pizza');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    const id='paylasilan-pizza',fis={malzemeler:['mantar','biber','misir','peynir'],yarilar:{sol:['mantar','biber'],sag:['misir','peynir']}};
    Object.assign(k.tepsiler,{secili:id,ekran:'masa',restoranda:true,restoran:{menuId:id,sira:6,evre:'mutfak'},masalar:{[id]:{sunuldu:false,tabaklar:{icecek:true},icecekMeyvesi:'limon',icecekMiktari:3}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
    localStorage.setItem('minkino-sef-pizza-v1-masa-'+id,JSON.stringify({aktif:false,asama:'firin',servis:0,tur:0,hamur:4,sos:[0,1,2,3,4,5],fis,misafir:'salata',ust:[{cesit:'mantar',x:28,y:39},{cesit:'biber',x:33,y:66},{cesit:'misir',x:67,y:37},{cesit:'peynir',x:71,y:63}],pismeMs:0}));
  });
  await page.goto('./sef/');
  await page.locator('.tepsi-yuva[data-parca=pizza]').tap();
  await page.getByRole('button',{name:'Tepsiyi fırına sür'}).tap();
  await expect(page.locator('.firin-oyunu')).toHaveAttribute('data-asama','hazir');
  await page.getByRole('button',{name:'Pizzayı fırından çıkar'}).tap();
  const rulet=page.locator('.pz-rulet-yolu'),onay=page.locator('.pz-paylas-tamam');
  await expect(rulet).toBeVisible();
  await kes(page,rulet,[[.22,.08],[.22,.5],[.22,.94]]);await expect(onay).toBeDisabled();
  await expect(rulet.locator('.pz-kesilmis')).toHaveCount(0);
  await kes(page,rulet,[[.5,.07],[.51,.32],[.49,.64],[.48,.93]]);
  await expect(rulet.locator('.pz-kesilmis[data-yon=dikey]')).toHaveCount(1);
  await page.reload();await expect(rulet.locator('.pz-kesilmis')).toHaveCount(1);
  await kes(page,rulet,[[.89,.49],[.66,.50],[.36,.47],[.08,.53]]);
  await expect(onay).toBeEnabled();
  if(process.env.SEF_PIZZA_KESIM)await page.screenshot({path:process.env.SEF_PIZZA_KESIM+'-'+info.project.name+'.png'});
  // Servis tabağına konunca fırın kapanır, tepsi tamam olduğu için masa sahnesi açılır (eski "Yeni sipariş seç" özeti yok).
  await onay.tap();await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).tap();
  await expect(page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).locator('.pz-pizza')).toHaveAttribute('data-dilim','4');
  await page.getByRole('button',{name:'Servis arabasıyla götür'}).tap();
  await page.getByRole('button',{name:'Tepsiyi arabaya koy'}).tap();
  await page.getByRole('button',{name:'Mino masasına götür'}).tap();
  await expect(page.locator('.salon-arkadas[data-karakter=anne]')).toBeVisible();
  const tabak=page.getByRole('button',{name:'Mini Pizza tattır'});
  await expect(tabak).toHaveAttribute('data-lokma-adedi','1');
  await expect(page.locator('.restoran-lokma')).toHaveCount(0);
  const pizza=tabak.locator('.pz-pizza');
  await expect(pizza).toHaveAttribute('data-alinan','0');
  // Pick the lower-left quarter out of order and offer it to the second guest.
  const r=(await pizza.boundingBox())!,bas={x:r.x+r.width*.33,y:r.y+r.height*.68};
  const agiz=await page.locator('.salon-arkadas .restoran-oyuncu-bedeni').evaluate(el=>{
    const r=el.getBoundingClientRect(),v=(el as HTMLElement).dataset;
    return {x:r.x+r.width*Number(v.agizX),y:r.y+r.height*Number(v.agizY)};
  });
  const parmak=await page.context().newCDPSession(page);
  async function paylas(hedef:{x:number;y:number}){
    await parmak.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[bas]});
    await parmak.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:(bas.x+hedef.x)/2,y:(bas.y+hedef.y)/2}]});
    await parmak.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[hedef]});
    await parmak.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  try{
    await paylas({x:r.x*.5,y:r.y});
    await expect(pizza).toHaveAttribute('data-alinan','0');
    await paylas(agiz);
  }finally{await parmak.detach();}
  await expect(pizza).toHaveAttribute('data-alinan','03');
  await expect(page.locator('.restoran-lokma')).toHaveCount(0);
  await page.reload();await expect(pizza).toHaveAttribute('data-alinan','03');
  for(let i=3;i<=4;i++){
    await tabak.focus();await page.keyboard.press('Enter');await expect(tabak).toHaveAttribute('data-lokma-adedi',String(i));
    await expect(page.locator('.restoran-lokma')).toHaveCount(0);
    const bilgi=page.getByRole('dialog');if(await bilgi.isVisible())await page.keyboard.press('Escape');
  }
  await expect(tabak).toHaveAttribute('data-tukendi','true');
});
