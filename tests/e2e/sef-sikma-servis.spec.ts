import { expect, test } from '@playwright/test';

test('Sıkacakta parmağı kaldırmadan birkaç tur atılır, hazne dolar ve doğru bardak hazırlanır', async ({page}) => {
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Müşteri masası',exact:true}).tap();
  await page.locator('[data-menu="corba-sofrasi"]').tap();
  await page.locator('[data-parca="icecek"]').tap();
  await page.locator('[data-meyve="limon"].ps-meyve-sec').tap();
  await page.locator('.ps-ham').tap();
  await page.locator('.ps-dene').tap();
  const kapak=page.locator('.ps-cevir');
  const kutu=await kapak.boundingBox();
  if(!kutu)throw Error('Sıkacak bulunamadı');
  const merkez={x:kutu.x+kutu.width/2,y:kutu.y+kutu.height/2};
  const yaricap=Math.min(kutu.width,kutu.height)*.33;
  const nokta=(a:number)=>({x:merkez.x+Math.cos(a)*yaricap,y:merkez.y+Math.sin(a)*yaricap});
  const dokunma=await page.context().newCDPSession(page);
  try {
    await dokunma.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[nokta(0)]});
    for(let i=1;i<=12;i++){
      await dokunma.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[nokta(i*Math.PI/4)]});
      if(i===4)await expect(page.locator('.ps-alet')).toHaveAttribute('src',/limon-sikacak-az/);
      if(i===8)await expect(page.locator('.ps-alet')).toHaveAttribute('src',/limon-sikacak-yari/);
    }
    await dokunma.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  } finally { await dokunma.detach(); }
  await expect(page.locator('.ps-surahi')).toBeVisible();
  await page.reload();
  await expect(page.locator('.ps-surahi img')).toHaveAttribute('src',/limon-surahi/);
});

test('Tabağa al iki filetoyu taşır ve mevcut kızarma puanını korur',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
    ekran:'masa',secili:'fiyonk-tavuk',oynanan:'tavuk',masalar:{'fiyonk-tavuk':{
      tabaklar:{},adim:{tavuk:4,icecek:0},tavukPuani:2,sunuldu:false
    }}
  }})));
  await page.reload();
  await page.getByRole('button',{name:'Tavukları şimdi tabağa al'}).tap();
  await expect(page.locator('[data-parca="tavuk"]')).toHaveAttribute('data-hazir','true');
  const filetolar=page.locator('.tepsi-yuva[data-parca=tavuk] .tv-porsiyon-fileto');
  await expect(filetolar).toHaveCount(2);
  for(const fileto of await filetolar.all()){
    await expect(fileto).toHaveAttribute('src',/fazla\.webp/);
    await expect(fileto).toHaveAttribute('data-pisme','2');
  }
  const masa=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar['fiyonk-tavuk']);
  expect(masa.adim.tavuk).toBe(6);
  expect(masa.tavukParcalari).toEqual([2,2]);
});
