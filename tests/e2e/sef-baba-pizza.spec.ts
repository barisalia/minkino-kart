import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

for(const dogru of [true,false]){
  test('Baba Murat iki yarılı pizzasını kendi sesiyle ister ve '+(dogru?'doğru pizzayı sever':'ters yarıları ayırt eder'),async({page})=>{
    await page.setViewportSize({width:844,height:390});
    await page.routeWebSocket(url=>url.port==='5173',()=>{});
    const sesler:string[]=[];
    page.on('request',r=>{if(r.url().includes('/salon/baba-'))sesler.push(r.url());});
    const sesiBekle=(ad:string)=>expect.poll(()=>sesler.some(url=>url.includes('/'+ad+'.mp3'))).toBe(true);
    await page.goto('./sef/');
    await page.getByRole('button',{name:'Sesi kapat'}).tap();
    await page.evaluate(()=>{
      const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
      k.sessiz=false;
      Object.assign(k.tepsiler,{restoranda:true,ekran:'masa',secili:'baba-ogle-pizzasi',restoran:{sira:8,menuId:'baba-ogle-pizzasi',evre:'gelis'},masalar:{'baba-ogle-pizzasi':{tabaklar:{},sunuldu:false}}});
      localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
    });
    await page.reload();
    const baba=page.locator('.salon-figur[data-karakter=baba]');
    await expect(baba).toBeVisible();
    await expect(page.getByRole('button',{name:'Siparişi tekrar dinle'})).toBeVisible({timeout:15000});
    await expect(baba).toHaveAttribute('data-poz','otur');
    await expect(page.getByRole('button',{name:'Anne ile konuş'})).toBeVisible();
    await page.getByRole('button',{name:'Siparişi tekrar dinle'}).tap();
    await sesiBekle('baba-restoran-baba-ogle-pizzasi');
    if(dogru&&process.env.SEF_BABA_KARE)await page.screenshot({path:process.env.SEF_BABA_KARE});
    await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).tap();
    await page.locator('[data-parca=pizza]').first().tap();
    await page.getByRole('button',{name:'Pizza siparişini dinle'}).tap();
    await sesiBekle('baba-pizza-istek');
    const merdane=page.getByRole('button',{name:'Merdaneyi ileri geri yuvarla'});
    for(let i=0;i<4;i++)await merdane.press('Space');
    const sos=page.getByRole('button',{name:'Sosu hamurun üzerine yay'});
    for(let i=0;i<6;i++)await sos.press('Enter');
    const pizza=page.getByRole('button',{name:'Malzemeyi pizzaya yerleştir'});
    const r=(await pizza.boundingBox())!;
    await page.getByRole('button',{name:'Tek dilim koy'}).tap();
    for(const [tur,x,y] of [['domates',.30,.38],['peynir',.36,.60],['zeytin',.70,.52]] as const){
      await page.locator('.pz-malzeme[data-cesit='+tur+']').tap();
      await pizza.tap({position:{x:r.width*(dogru?x:1-x),y:r.height*y}});
    }
    await page.getByRole('button',{name:'Fırına git'}).tap();
    await page.getByRole('button',{name:'Tepsiyi fırına sür'}).tap();
    await expect(page.locator('.firin-oyunu')).toHaveAttribute('data-asama','hazir');
    await page.getByRole('button',{name:'Pizzayı fırından çıkar'}).tap();
    await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).tap();
    // Fırın kapanır, masa sahnesi açılır (eski "Sipariş uyumu / Yeni sipariş seç" özeti yok); uyum puanı kayıtta, tepki masada.
    expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis.at(-1))).istekPuani).toBe(dogru?3:1);
    await page.getByRole('button',{name:'Servis arabasıyla götür'}).tap();
    await page.getByRole('button',{name:'Tepsiyi arabaya koy'}).tap();
    await page.getByRole('button',{name:'Baba Murat masasına götür'}).tap();
    await expect(baba).toBeVisible();
    await page.getByRole('button',{name:'Müşteriyi dinle'}).tap();
    await sesiBekle(dogru?'baba-pizza-tam':'baba-pizza-yari');
    const tabak=page.getByRole('button',{name:'Mini Pizza tattır'});
    await tabak.tap();
    await expect(tabak).toHaveAttribute('data-lokma-adedi','1');
    if(await page.getByRole('dialog').count())await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Sıradaki müşteriyi karşıla'}).tap();
    await expect(page.getByRole('button',{name:'Vedayı geç'})).toBeVisible();
  });
}
