import {test,expect} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
for(const [genislik,istenen] of [[568,'sade'],[844,'nane']] as const)test('Çorba bitişi '+istenen+' gerçek kâseye, fişe ve düzeltmeye taşınır',async({page})=>{
  await page.setViewportSize({width:genislik,height:genislik===568?320:390});
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.addInitScript(istek=>{
    if(localStorage.getItem('minkino-sef-v1'))return;
    const sebzeler=['domates','havuc','patates'],siparis={tarifId:'corba',alinan:sebzeler,aktarilan:sebzeler,ezilen:sebzeler,kesimler:{domates:4,havuc:4,patates:4},istenenKivam:'puruzsuz',karistirma:3,servisEdildi:false};
    localStorage.setItem('minkino-sef-v1',JSON.stringify({secili:'corba',ekran:'servis',sessiz:true,siparisler:{corba:siparis},
      porsiyonlar:{corba:{adet:2}},ozelIstekler:{corba:istek},tepsiler:{secili:'corba-sofrasi',oynanan:'corba',ekran:'kapali',masalar:{'corba-sofrasi':{tabaklar:{}}}}}));
  },istenen);
  await page.goto('./sef/');
  await page.locator('[data-sus=kruton]').tap();
  await page.locator('.sunum').tap();
  await expect(page.locator('.sunum .yemek-susu')).toHaveAttribute('data-bitis','kruton');
  await page.reload();
  if(process.env.SEF_CORBA_BITIS&&genislik===568)await page.screenshot({path:process.env.SEF_CORBA_BITIS});
  await page.locator('[data-zil]').tap();
  const karsilastir=page.getByRole('button',{name:'Sebze Çorbası siparişi ile tabağı karşılaştır'});
  await karsilastir.tap();
  const fis=page.getByRole('dialog');
  await expect(fis.locator('[data-puan="2"]')).toBeVisible();
  await expect(fis.getByLabel('Fişteki malzemeler').getByRole('img',{name:istenen==='sade'?'Sade çorba':'Nane yaprağı',exact:true})).toBeVisible();
  await fis.getByRole('button',{name:'Tepsiye dön'}).tap();
  await page.locator('.tepsi-yuva[data-parca=corba]').tap();
  await expect(page.locator('.sunum')).toBeVisible();
  await page.locator('[data-sus='+istenen+']').tap();
  if(istenen!=='sade')await page.locator('.sunum').tap();
  await expect(page.locator('.sunum .yemek-susu')).toHaveCount(istenen==='sade'?0:1);
  await page.locator('[data-zil]').tap();
  await karsilastir.tap();
  await expect(fis.locator('[data-puan="3"]')).toBeVisible();
});
