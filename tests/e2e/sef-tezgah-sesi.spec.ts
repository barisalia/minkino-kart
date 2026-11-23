import {expect,test,type Page} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

// Listen on the effects bus independently from the speech and music buses.
// This measures the samples that reached the speaker mix, including mute.
async function olcmeyeBasla(page:Page){
  await page.evaluate(async()=>{
    const efekt=(window as unknown as {cikisKanali:GainNode}).cikisKanali;
    const c=efekt.context as AudioContext;
    const analiz=c.createAnalyser();analiz.fftSize=1024;
    efekt.connect(analiz);
    const numune=new Float32Array(1024);
    const olcum:{tepe:number;durdur:()=>void}={tepe:0,durdur:()=>{}};
    const t=setInterval(()=>{
      analiz.getFloatTimeDomainData(numune);
      for(const x of numune)olcum.tepe=Math.max(olcum.tepe,Math.abs(x));
    },8);
    olcum.durdur=()=>{clearInterval(t);analiz.disconnect();};
    Object.assign(window,{tezgahOlcumu:olcum});
  });
}
async function tepe(p:Page){return p.evaluate(()=>(window as unknown as {tezgahOlcumu:{tepe:number}}).tezgahOlcumu.tepe);}
async function sifir(p:Page){await p.evaluate(()=>(window as unknown as {tezgahOlcumu:{tepe:number}}).tezgahOlcumu.tepe=0);}
async function parmaklar(p:Page,secilen:string[]){
  const c=await p.context().newCDPSession(p);
  const noktalar=await Promise.all(secilen.map(async(sel,i)=>{
    const r=(await p.locator(sel).boundingBox())!;
    return {id:i+1,x:r.x+r.width/2,y:r.y+r.height/2};
  }));
  try{
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[noktalar[0]]});
    if(noktalar.length>1)await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:noktalar});
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await c.detach();}
}
test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    // The mixer connects master → compressor, then effects → master first.
    // Attach outside the app so the same measurement works in a production build.
    const bagla=AudioNode.prototype.connect;
    let ana:AudioNode|undefined;
    AudioNode.prototype.connect=function(this:AudioNode,...args:unknown[]){
      if(this instanceof GainNode&&args[0] instanceof DynamicsCompressorNode)ana=this;
      if(this instanceof GainNode&&ana&&args[0]===ana&&!('cikisKanali' in window))Object.assign(window,{cikisKanali:this});
      return Reflect.apply(bagla,this,args);
    } as typeof bagla;
  });
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.setViewportSize({width:667,height:375});
  await page.goto('./sef/');
});
test('Çorbanın iki parmakta tek ezmesi, sessiz modu ve geri çıkınca motorun susması',async({page})=>{
  await page.evaluate(()=>{
    const sebzeler=['domates','havuc','patates'];
    const corba={tarifId:'corba',alinan:sebzeler,eskiHazir:[],aktarilan:sebzeler,kesimler:{domates:4,havuc:4,patates:4},istenenKivam:'puruzsuz',karistirma:3,ezilen:[]};
    localStorage.setItem('minkino-sef-v1',JSON.stringify({secili:'corba',ekran:'ocak',sessiz:false,siparisler:{corba}}));
  });
  await page.reload();await page.locator('.corba-blender').tap();await olcmeyeBasla(page);
  await parmaklar(page,['[data-ez=havuc]','[data-ez=patates]']);
  await expect.poll(()=>tepe(page)).toBeGreaterThan(.002);
  await expect(page.locator('[data-ez]')).toHaveCount(2);
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.waitForTimeout(130);await sifir(page);
  await page.locator('[data-ez=domates]').tap();await expect(page.locator('[data-ez]')).toHaveCount(1);
  expect(await tepe(page)).toBeLessThan(.00015);
  await page.getByRole('button',{name:'Sesi aç'}).tap();
  await page.locator('[data-ez=patates]').tap();await page.getByRole('button',{name:'Geri',exact:true}).tap();
  await page.waitForTimeout(180);await sifir(page);await page.waitForTimeout(300);
  expect(await tepe(page)).toBeLessThan(.00015);
});
test('Limon sıkma ve iki döküm ayrı duyulur, döküm yarıda terk edilip aynı bardakta sürer',async({page})=>{
  // "Müşteri masası" fiş arşivi panoda yok (15 Kasım ilk sürümde de); müşterinin masası ?giris=tepsiler&siparis= ile açılır.
  await page.goto('./sef/?giris=tepsiler&siparis=corba-sofrasi');await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  await page.locator('.ps-meyve-sec[data-meyve=limon]').tap();
  await page.locator('.ps-ham').tap();await page.locator('.ps-dene').tap();
  await olcmeyeBasla(page);await page.locator('.ps-cevir').tap();
  await expect.poll(()=>tepe(page)).toBeGreaterThan(.002);
  await page.getByRole('button',{name:'Sesi kapat'}).tap();await page.waitForTimeout(150);await sifir(page);
  await page.locator('.ps-cevir').tap();await page.locator('.ps-cevir').tap();
  await expect(page.locator('.ps-surahi')).toBeVisible();expect(await tepe(page)).toBeLessThan(.00015);
  await page.getByRole('button',{name:'Sesi aç'}).tap();
  await page.locator('.ps-surahi').tap();await page.waitForTimeout(190);await sifir(page);
  await page.locator('.ps-bardak').tap();await expect.poll(()=>tepe(page)).toBeGreaterThan(.002);
  await page.getByRole('button',{name:'Geri',exact:true}).tap();
  await page.waitForTimeout(160);await sifir(page);await page.waitForTimeout(390);
  expect(await tepe(page)).toBeLessThan(.00015);
  await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  await page.locator('.ps-surahi').tap();await page.locator('.ps-bardak').tap();
  await expect(page.locator('.ps-yarim-sun')).toBeVisible();
  await page.locator('.ps-surahi').tap();await page.waitForTimeout(190);await sifir(page);
  await page.locator('.ps-bardak').tap();await expect.poll(()=>tepe(page)).toBeGreaterThan(.002);
  await expect(page.locator('.tepsi-yuva[data-parca=icecek]')).toHaveAttribute('data-hazir','true');
});
test('Kaşık henüz ilk turunu tamamlamadan harekete ses verir; iptalde yeni tur yazılmaz',async({page})=>{
  await page.evaluate(()=>{
    const sebzeler=['domates','havuc','patates'];
    const corba={tarifId:'corba',alinan:sebzeler,eskiHazir:[],aktarilan:sebzeler,kesimler:{domates:4,havuc:4,patates:4},karistirma:0,ezilen:[]};
    localStorage.setItem('minkino-sef-v1',JSON.stringify({secili:'corba',ekran:'ocak',sessiz:false,siparisler:{corba}}));
  });
  await page.reload();
  // Touch a neutral part of the kitchen to unlock sound on mobile.
  await page.touchscreen.tap(12,180);await olcmeyeBasla(page);
  const kasik=(await page.locator('.karistirma').boundingBox())!;
  const kase=(await page.locator('.kap-alani').boundingBox())!;
  const nokta=(a:number)=>({x:kase.x+kase.width/2+kasik.width*.28*Math.cos(a),y:kase.y+kase.height/2+kasik.height*.28*Math.sin(a)});
  const c=await page.context().newCDPSession(page);
  try{
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[nokta(0)]});
    for(const aci of [.22,.45,.66,.91])await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[nokta(aci)]});
    await expect.poll(()=>tepe(page)).toBeGreaterThan(.0005);
    await c.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  }finally{await c.detach();}
  await expect(page.locator('.derece [data-dolu=true]')).toHaveCount(0);
  await page.waitForTimeout(280);await sifir(page);await page.waitForTimeout(200);
  expect(await tepe(page)).toBeLessThan(.00015);
});
