import { expect,test } from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

for(const sekil of ['kalp','yuvarlak'] as const)test(sekil+' kalıbı fırından müşteri albümüne kadar korunur',async({page})=>{
  test.setTimeout(120000);
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).click();
  const ad=sekil==='kalp'?'Kalp':'Yuvarlak';
  await page.evaluate(sekil=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{jeton:10,tatliSeviye:1,secili:'kurabiye',restoranda:true,ekran:'masa',
      restoran:{sira:4,menuId:'kurabiye',evre:'mutfak'},
      ...(sekil==='kalp'?{oynanan:'kurabiye'}:{pastane:{acik:true,tezgah:'kurabiye',taslaklar:{kurabiye:{surum:2,adim:1,yanlis:0}},vitrin:{}}}),
      masalar:{kurabiye:{tabaklar:{},sunuldu:false,kurabiyeIstegi:'yuvarlak',tatliTaslagi:{surum:2,adim:1,yanlis:0}}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  },sekil);
  await page.reload();
  await page.getByRole('button',{name:ad+' kalıp'}).click();
  await page.reload();await expect(page.locator('.tatli-tezgahi')).toHaveAttribute('data-sekil',sekil);
  for(let i=0;i<3;i++){
    await expect(page.locator('.kb-bas')).toHaveAttribute('data-yer',String(i));
    await page.locator('.kb-bas').tap();
    if(i===0){await expect(page.locator('.kb-kesik')).toHaveCount(1);await page.reload();}
  }
  for(const i of [2,0,1]){await page.getByRole('button',{name:(i+1)+'. kurabiyeyi tepsiye taşı'}).tap();}
  await page.getByRole('button',{name:'Tepsiyi fırına koy'}).click();
  await expect(page.locator('.ta-firin-istasyonu')).toHaveAttribute('data-evre','hazir');
  await expect(page.locator('.ta-firin-yemek .kb-dizi:visible .kb-biskuvi')).toHaveCount(3);
  await page.getByRole('button',{name:'Tepsiyi fırından çıkar'}).click();
  await page.getByRole('button',{name:'Vanilya kreması'}).tap();
  for(let i=0;i<3;i++){
    await page.getByRole('button',{name:(i+1)+'. kurabiyeyi süsle'}).tap();
    const alan=page.locator('.kb-editor');
    const r=await alan.boundingBox();if(!r)throw Error('Kurabiye görünmüyor');
    await page.mouse.move(r.x+r.width*.32,r.y+r.height*.44);await page.mouse.down();
    await page.mouse.move(r.x+r.width*.53,r.y+r.height*.59,{steps:7});
    await page.mouse.move(r.x+r.width*.66,r.y+r.height*.42,{steps:7});await page.mouse.up();
    if(i===0){await page.reload();await expect(page.locator('.kb-editor polyline')).toHaveCount(1);}
  }
  if(process.env.SEF_KALIP_KARE)await page.screenshot({path:process.env.SEF_KALIP_KARE+'/'+sekil+'-krema.png'});
  await page.getByRole('button',{name:'Kurabiyeleri tabağa diz'}).tap();
  await expect(page.locator('.pastane-porsiyonu .kb-desen polyline')).toHaveCount(3);
  await expect(page.locator('.pastane-porsiyonu')).toHaveAttribute('data-sekil',sekil);
  await page.getByRole('button',{name:sekil==='kalp'?'Tatlıyı tepsiye koy':'Vitrine koy'}).click();
  if(sekil==='yuvarlak'){
    await expect(page.locator('[data-kademe="1"] .kb-desen polyline')).toHaveCount(3);
    await page.reload();await page.getByRole('button',{name:'Mutfağa dön'}).click();
    await page.getByRole('button',{name:'Yuvarlak Kurabiye vitrinden tepsiye al'}).click();
  }
  // Tepsi tamamlanınca masa sahnesi açılır: kalıbın şekli ve krema çizgileri müşteriye sunulacak tepside korunur.
  const sunum=page.getByRole('button',{name:'Tepsiyi müşteriye sun'});
  await page.reload();await expect(sunum.locator('.pastane-porsiyonu')).toHaveAttribute('data-sekil',sekil);
  await expect(sunum.locator('.pastane-porsiyonu .kb-desen polyline')).toHaveCount(3);
  if(process.env.SEF_KALIP_KARE)await page.screenshot({path:process.env.SEF_KALIP_KARE+'/'+sekil+'-masa.png'});
  await sunum.click();
  await expect(page.getByRole('button',{name:new RegExp((sekil==='kalp'?4:6)+' jeton kazanıldı')})).toBeVisible();
  // Tabak albümü 16 Kasım'da (c3d9d09a) kaldırıldı; sofranın kaydı kalıbın şeklini tutar.
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.anilar.at(-1)?.masa.kurabiyeSekli)).toBe(sekil);
});

test('Krema değişikliği puana yansır ve müşteri çizilen kurabiyeleri tek tek yer',async({page})=>{
  test.setTimeout(120000);
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(d.tepsiler,{secili:'kurabiye',ekran:'masa',restoranda:true,tatliSeviye:1,oynanan:'kurabiye',jeton:10,
      restoran:{sira:3,menuId:'kurabiye',evre:'mutfak'},
      masalar:{kurabiye:{sunuldu:false,tabaklar:{},kurabiyeIstegi:'yildiz',tatliTaslagi:{adim:4,surum:2,yanlis:0,sekil:'yildiz'}}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  });
  await page.reload();
  const editor=page.locator('.kb-editor');
  await page.getByRole('button',{name:'Kakao kreması'}).tap();
  const r=(await editor.boundingBox())!;
  await page.touchscreen.tap(r.x+2,r.y+2);
  await expect(editor.locator('polyline')).toHaveCount(0);
  await editor.tap();await expect(editor.locator('polyline')).toHaveCount(1);
  await page.getByRole('button',{name:'Son krema çizgisini geri al'}).tap();
  await expect(editor.locator('polyline')).toHaveCount(0);
  await page.getByRole('button',{name:'Kurabiyeleri tabağa diz'}).tap();
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).tap();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar.kurabiye.tatliPuani)).toBe(2);
  // Karşılaştırma ve düzeltme servisten sonra masada: ilk servis iki yıldız, dört jeton.
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:/^4 jeton kazanıldı/})).toBeVisible();
  await page.getByRole('button',{name:'Yıldız Kurabiye siparişi ile tabağı karşılaştır'}).tap();
  await page.getByRole('button',{name:'Kurabiyelerin kremasını değiştir'}).tap();
  await page.getByRole('button',{name:'Çilek kreması'}).tap();
  for(let i=0;i<3;i++){
    await page.locator('.kb-sec').nth(i).tap();await editor.tap();
  }
  if(process.env.SEF_KALIP_KARE)await page.screenshot({path:process.env.SEF_KALIP_KARE+'/yildiz-susleme-568.png'});
  await page.getByRole('button',{name:'Kurabiyeleri tabağa diz'}).tap();
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  // Düzeltilen tabak üç yıldız alır; aradaki fark (2 jeton) ödenir, toplam 16.
  await expect(page.getByRole('button',{name:/^2 jeton kazanıldı/})).toBeVisible();
  const tabak=page.getByRole('button',{name:'Yıldız Kurabiye tattır'});
  // The customer takes the first cookie automatically at service.
  await expect(tabak.locator('.kb-tane:not([hidden])')).toHaveCount(2);
  await expect(page.locator('.restoran-ilk-tadim')).toHaveCount(0);
  for(let i=1;i<3;i++){
    await tabak.tap();
    await expect(page.locator('.kb-lokma .kb-tane polyline')).toHaveCount(1);
    await expect(tabak.locator('.kb-tane:not([hidden])')).toHaveCount(2-i);
    await expect(page.locator('.restoran-lokma')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await expect(tabak).toHaveAttribute('data-tukendi','true');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.jeton)).toBe(16);
});
