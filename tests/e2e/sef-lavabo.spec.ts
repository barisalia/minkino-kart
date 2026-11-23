import {expect,test,type Locator,type Page} from '@playwright/test';
import type {Siparis} from '../../sef/src/tarif';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
test.use({hasTouch:true,isMobile:true,viewport:{width:740,height:360}});
test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.hostname==='localhost',s=>s.connectToServer().onMessage(m=>{if(typeof m==='string'&&m.includes('full-reload'))return;s.send(m);}));
});
async function basla(page:Page){
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-v1',JSON.stringify({
    sessiz:true,secili:'salata',ekran:'tahta',siparisler:{salata:{tarifId:'salata',alinan:['domates','marul','havuc'],eskiHazir:[]}}
  })));await page.reload();
}
async function parmak(page:Page,el:Locator){
  const r=(await el.boundingBox())!,y=r.y+r.height*.5,x=r.x+r.width*.5;
  const cdp=await page.context().newCDPSession(page);
  const send=(type:'touchStart'|'touchMove'|'touchEnd',v:number)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:v,y,radiusX:3,radiusY:3}]});
  await send('touchStart',x);
  for(const i of [-.22,.22,-.12,.1])await send('touchMove',x+i*r.width);
  await send('touchEnd',x);await cdp.detach();
}
test('Yatay telefonda musluğu açar, sebzeyi döndürür, üç kir lekesini parmağıyla temizler',async({page})=>{
  await basla(page);await page.getByRole('button',{name:'Domates yıka'}).tap();
  const kir=(i:number)=>page.locator('[data-leke="'+i+'"]');
  await parmak(page,kir(0));await expect(kir(0)).toBeVisible();
  await page.getByRole('button',{name:'Sebzeyi döndür'}).tap();
  await page.getByRole('button',{name:'Musluğu aç'}).tap();await parmak(page,kir(0));await expect(kir(0)).toBeHidden();
  if(process.env.TOST_ONIZLEME)await page.screenshot({path:process.env.TOST_ONIZLEME+'/salata-lavabo.png'});
  await page.getByRole('button',{name:'Kesme tahtasına dön'}).tap();
  await page.reload();await page.getByRole('button',{name:'Domates yıka'}).tap();
  await expect(kir(0)).toBeHidden();await page.getByRole('button',{name:'Musluğu aç'}).tap();
  await parmak(page,kir(1));await parmak(page,kir(2));
  await page.getByRole('button',{name:'Temiz sebzeyi kesme tahtasına al'}).tap();
  await expect(page.locator('.tabak-malzeme[data-malzeme=domates]')).toHaveAttribute('data-temiz','true');
  await page.locator('[data-kes=domates]').press('Enter');
  await expect(page.getByRole('button',{name:'Domates yıka'})).toHaveCount(0);
  await page.getByRole('button',{name:'Marul seç'}).tap();
  await expect(page.getByRole('button',{name:'Marul yıka'})).toBeVisible();
  await page.getByRole('button',{name:'Havuç seç'}).tap();
  await expect(page.getByRole('button',{name:'Havuç yıka'})).toBeVisible();
});
test('Tam yıkanan salata bir kez fazladan bir jeton getirir ve eski masanın kazancını korur',async({page})=>{
  await page.goto('./sef/?test=1');
  const kazanc=await page.evaluate(async()=>{
  const fis='/sef/src/tepsi-fisleri.ts',tarif='/sef/src/tarif.ts';
  const {bosMasa,servisKazanci,tepsileriOku,bosTepsiler}=await import(fis);
  const {siparisBaslat}=await import(tarif);
  const sip:Siparis={...siparisBaslat('salata'),alinan:['marul','domates','salatalik'],aktarilan:['marul','domates','salatalik'],yikama:{marul:7,domates:7,salatalik:7},servisEdildi:true};
  const t=bosTepsiler();const m=bosMasa();m.sunuldu=true;m.tabaklar.salata={tarifId:'salata',puan:3,sus:{id:'domates',x:0,y:0},salata:sip};
  m.tabaklar.tavuk=true;m.odenen=servisKazanci(m,['salata','tavuk']);const ilk=m.odenen;
  t.masalar['bahce-tabagi']=m;const yeni=tepsileriOku(t,(s:unknown)=>s);
  const yuklenen=yeni.masalar['bahce-tabagi'].odenen;
  m.tabaklar.salata={...m.tabaklar.salata,salata:{...sip,yikama:undefined}};
  return [ilk,yuklenen,servisKazanci(m,['salata','tavuk'])];
  });expect(kazanc).toEqual([7,7,6]);
});
