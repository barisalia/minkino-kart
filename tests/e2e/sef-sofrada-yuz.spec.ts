import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
test('Sofrayı kurarken Kino ve Anne yüzlerinden kendi siparişlerini tekrar söyler',async({page})=>{
 await page.setViewportSize({width:568,height:320});
 await page.routeWebSocket(u=>u.port==='5173',()=>{});
 await page.goto('./sef/');
 await page.evaluate(()=>{
  const id='aile-kahvaltisi';
  const omletServisi={evre:'sun',yumurta:2,cirpma:1,sure:6000,icler:[{tur:'peynir',x:30,y:44},{tur:'domates',x:35,y:60}]};
  localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:false,tepsiler:{restoranda:true,ekran:'masa',secili:id,restoran:{sira:7,menuId:id,evre:'mutfak'},masalar:{[id]:{aileMasada:true,aileServisi:[],sunuldu:false,tabaklar:{omlet:true,icecek:true},omletServisi,omletPuan:3,icecekMeyvesi:'limon',icecekPuani:3,icecekMiktari:3,adim:{tavuk:0,icecek:5}}}}}));
 });
 await page.reload();
 const istekler:string[]=[];page.on('request',r=>istekler.push(r.url()));
 for(const [kim,ad,ses] of [['kino','Kino','kino-restoran-aile-kahvaltisi'],['anne','Anne','anne-aile-limon']]){
  const yuz=page.getByRole('button',{name:ad+' ile konuş',exact:true});
  await yuz.tap();
  await expect.poll(()=>istekler.some(s=>s.endsWith(ses+'.mp3'))).toBe(true);
  const portre=page.locator('.salon-figur[data-karakter='+kim+']');
  await expect(portre).toHaveAttribute('data-yuz',/acik|konus/);
  await expect(portre.locator('.restoran-oyuncu-bedeni>img')).toHaveAttribute('src',new RegExp(kim+'-tat-0.webp'),{timeout:14000});
 }
});
