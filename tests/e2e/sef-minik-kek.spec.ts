import {expect,test,type Page} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test.use({hasTouch:true,isMobile:true,viewport:{width:740,height:360}});
test.beforeEach(async({page})=>{await page.routeWebSocket(u=>u.port==='5173',()=>{});});

async function kremaSik(page:Page,yer:number,ms:number){
  const b=page.locator('.mk-hedef').nth(yer),r=(await b.boundingBox())!;
  const el=await page.context().newCDPSession(page);
  await el.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width*.5,y:r.y+r.height*.5}]});
  await page.waitForTimeout(ms);
  await el.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await el.detach();
}

test('Atölyeden yapılan minik kekin farklı büyüklükte krema çiçekleri ve meyvesi masaya kadar korunur',async({page})=>{
  test.setTimeout(120000);
  await page.goto('./sef/');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  // A returning child has earned the bakery and enough progress to use the cake counter.
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);d.tepsiler.tatliSeviye=3;
    localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  });
  await page.reload();await page.getByRole('button',{name:/Tatlı atölyesini aç/i}).tap();
  await page.locator('.tatli-vitrin-karti[data-kademe="3"]').tap();
  const cirp=page.getByRole('button',{name:'Kek hamurunu çırp'});for(let i=0;i<9;i++)await cirp.press('Enter');
  await page.getByRole('button',{name:'Hamuru kek kalıbına dök'}).tap();
  await page.getByRole('button',{name:'Tepsiyi fırına koy'}).tap();
  await expect(page.locator('.ta-firin-istasyonu')).toHaveAttribute('data-evre','hazir');
  await page.getByRole('button',{name:'Tepsiyi fırından çıkar'}).tap();
  await page.getByRole('button',{name:'Kakao kreması'}).tap();
  await kremaSik(page,0,170);await kremaSik(page,2,700);
  await expect(page.locator('.mk-tezgah .mk-rozet[data-tat=kakao]')).toHaveCount(2);
  const widths=await page.locator('.mk-tezgah .mk-rozet').evaluateAll(xs=>xs.map(x=>x.getBoundingClientRect().width));
  expect(widths[1]).toBeGreaterThan(widths[0]+2);
  await page.reload();await expect(page.locator('.mk-tezgah .mk-rozet[data-tat=kakao]')).toHaveCount(2);
  await page.getByRole('button',{name:'Meyveleri yerleştir'}).tap();
  const meyve=page.getByRole('button',{name:'Yaban mersini dilimi'}),hedef=page.locator('.mk-hedef').nth(1);
  const a=(await meyve.boundingBox())!,b=(await hedef.boundingBox())!;
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await page.mouse.up();
  await expect(page.locator('.mk-tezgah .mk-meyve')).toHaveAttribute('data-meyve','yaban');
  if(process.env.SEF_KEK_KARE)await page.screenshot({path:process.env.SEF_KEK_KARE+'/kek-meyve.png'});
  await page.getByRole('button',{name:'Keki tabağa al'}).tap();
  await page.getByRole('button',{name:'Sarı servis tabağı'}).tap();
  await page.getByRole('button',{name:'Vitrine koy'}).tap();
  await expect(page.locator('[data-kademe="3"] .mk-rozet[data-tat=kakao]')).toHaveCount(2);
  await page.getByRole('button',{name:'Mutfağa dön'}).tap();
  // Resume the matching customer's request with the actual stocked portion.
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(d.tepsiler,{secili:'minik-kek',ekran:'masa',restoranda:true,restoran:{sira:4,menuId:'minik-kek',evre:'mutfak'},masalar:{'minik-kek':{sunuldu:false,tabaklar:{},kekFisi:'orman'}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  });
  await page.reload();await page.getByRole('button',{name:'Orman Meyveli Minik Kek vitrinden tepsiye al'}).tap();
  // Tepsi tamamlanınca masa sahnesi açılır: kek müşteriye sunulacak tepside, servisten sonra masadaki yuvada.
  const sunum=page.getByRole('button',{name:'Tepsiyi müşteriye sun'});
  const sunulacak=sunum.locator('.pastane-porsiyonu');
  await expect(sunulacak).toHaveAttribute('data-tabak','sari');await expect(sunulacak.locator('.mk-meyve')).toHaveAttribute('data-meyve','yaban');
  await sunum.tap();
  const tabak=page.locator('.tepsi-yuva .pastane-porsiyonu');
  await expect(tabak).toHaveAttribute('data-tabak','sari');
  await expect(page.getByRole('button',{name:/15 jeton kazanıldı/})).toBeVisible();
  const d=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(d.masalar['minik-kek'].tatliPuani).toBe(3);
  expect(d.anilar.at(-1).masa.kekServisi).toEqual(d.masalar['minik-kek'].kekServisi);
  await expect(tabak).toHaveAttribute('data-isirik','1');
  await expect(page.locator('.restoran-ilk-tadim')).toHaveCount(0);
  const tattir=tabak.locator('..');
  for(const isirik of ['2','3']){
    await tattir.tap();
    await expect(page.locator('.mk-lokma .mk-rozet[data-tat=kakao]')).toHaveCount(2);
    await expect(tabak).toHaveAttribute('data-isirik',isirik);
    await expect(page.locator('.restoran-lokma')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await expect(tattir).toHaveAttribute('data-tukendi','true');
  await expect(tabak.locator('.tatli-katlari')).toBeHidden();
});

test('Müşterinin kekini yanlış süslemek puanı düşürür; kremayı ve meyveyi düzelten çocuk puanını geri kazanır',async({page})=>{
  await page.setViewportSize({width:568,height:320});await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{secili:'minik-kek',ekran:'masa',oynanan:'minik-kek',restoranda:true,tatliSeviye:3,
      restoran:{sira:4,menuId:'minik-kek',evre:'mutfak'},masalar:{'minik-kek':{sunuldu:false,tabaklar:{},kekFisi:'muz',tatliTaslagi:{adim:3,surum:2,yanlis:0}}}}}));
  });
  await page.reload();await page.getByRole('button',{name:'Meyveleri yerleştir'}).tap();
  await page.locator('.mk-hedef').first().tap();await page.getByRole('button',{name:'Keki tabağa al'}).tap();
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).tap();
  const puan=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar['minik-kek'].tatliPuani);
  expect(await puan()).toBe(1);
  // Karşılaştırma ve düzeltme servisten sonra masada.
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:/jeton kazanıldı/})).toBeVisible();
  await page.getByRole('button',{name:/Minik Kek siparişi ile tabağı karşılaştır/}).tap();
  await page.getByRole('button',{name:'Kekin kremasını ve meyvelerini değiştir'}).tap();
  await page.getByRole('button',{name:'Vanilya kreması'}).tap();
  await page.locator('.mk-hedef').nth(0).press('Enter');await page.locator('.mk-hedef').nth(2).press('Enter');
  await page.getByRole('button',{name:'Meyveleri yerleştir'}).tap();
  await page.getByRole('button',{name:'Meyveleri kaldır'}).tap();
  await page.getByRole('button',{name:'Muz dilimi'}).tap();await page.locator('.mk-hedef').nth(1).tap();
  await page.getByRole('button',{name:'Keki tabağa al'}).tap();await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).tap();
  expect(await puan()).toBe(3);
});
