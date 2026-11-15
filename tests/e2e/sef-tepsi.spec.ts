import { expect,test } from '@playwright/test';
import { hataTopla } from './yardimci';
test('Makarnayla tavuğu aynı tepside, ayrı ayrı pişirip bir kez sun',async({page})=>{
  const hatalar=hataTopla(page);
  await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.getByRole('button',{name:'Müşteri masası',exact:true}).click();
  for(const menu of ['fiyonk-tavuk','fiyonk-sis','corba-sofrasi','pizza-molasi','kahvalti','bahce-tabagi'])
    await expect(page.locator('.tepsi-fis[data-menu="'+menu+'"]')).toBeVisible();
  await page.locator('[data-menu=fiyonk-tavuk]').click();
  await expect(page.getByRole('button',{name:'Tepsiyi müşteriye sun'})).toHaveCount(0);
  const enter=async(sel:string)=>{const b=page.locator(sel).first();await expect(b).toBeEnabled();await b.press('Enter');};
  await page.locator('[data-parca=tavuk]').click();
  for(let n=0;n<6;n++){
    await expect(page.locator('.tv-mutfak')).toHaveAttribute('data-adet',String(n));
    await enter('.tv-fileto:enabled');
    if(n<2)await enter('.tv-tava');else if(n>=4)await enter('.tv-tabak');
    if(n===0){await expect(page.locator('.tv-mutfak')).toHaveAttribute('data-adet','1');await page.reload();}
  }
  await expect(page.locator('[data-parca=tavuk]')).toHaveAttribute('data-hazir','true');
  await page.locator('[data-parca=makarna]').click();
  await page.getByRole('button',{name:'Yumurtalı hamur seç'}).click();
  for(let i=0;i<2;i++)await enter('[data-mp-kes="'+i+'"]');
  for(let i=0;i<3;i++){
    await enter('.mp-buzgu');
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-makarna-v1-masa-fiyonk-tavuk')!).sekil)).toBe(i+1);
    await expect(page.locator('.mp-tepsi-parca')).toHaveCount(i===2?0:i+1);
  }
  await enter('.mp-tuzluk');for(let i=0;i<3;i++)await enter('[data-mp-at="'+i+'"]');
  await expect(page.locator('.mp-oyun')).toHaveAttribute('data-kivam','tam',{timeout:9000});
  for(let i=0;i<3;i++){await enter('.mp-kepce');await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-makarna-v1-masa-fiyonk-tavuk')!).suzulen)).toBe(i+1);if(i<2)await expect(page.locator('.mp-damla')).toHaveCount(0);}
  await enter('[data-mp-sos=yesil]');
  for(let yaprak=0;yaprak<3;yaprak++)await enter('.mp-havan-dokunus');
  await enter('.mp-havan-aktar');await enter('[data-sos-yeri="1"]');await enter('.mp-sos-bitti');
  await enter('[data-mp-sus=peynir]');await enter('.mp-sus-hedef');
  await enter('[data-mp-zil]');await enter('.mp-sonraki');
  await expect(page.locator('[data-parca=makarna] img.defter-fotograf')).toHaveAttribute('src',/^data:image/);
  await page.reload();
  await expect(page.locator('.tepsi-yuva[data-hazir=true]')).toHaveCount(2);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await expect(page.locator('.tepsi-ust h2')).toHaveText('6 / 6');
  if(process.env.SEF_SUNUM_ONIZLEME && test.info().project.name==='dar-yatay')
    await page.locator('.tepsi-sahnesi').screenshot({path:process.env.SEF_SUNUM_ONIZLEME});
  await expect(page.getByRole('button',{name:'Tepsiyi müşteriye sun'})).toHaveCount(0);
  await page.getByRole('button',{name:'Başka bir müşteri seç'}).click();
  await page.locator('[data-menu=corba-sofrasi]').click();
  await expect(page.locator('[data-parca]')).toHaveCount(3);
  await page.locator('[data-parca=icecek]').click();await enter('.ps-ham');await enter('.ps-dene');await enter('.ps-cevir');
  await page.getByRole('button',{name:'Geri',exact:true}).click();
  await page.locator('[data-parca=icecek]').click();
  await expect(page.locator('.ps-sahnesi')).toHaveAttribute('data-icecek','2');
  expect(hatalar).toEqual([]);
});

