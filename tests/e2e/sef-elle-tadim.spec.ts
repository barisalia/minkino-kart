import { expect, test, type Locator, type Page } from '@playwright/test';

async function lokmayiAl(page:Page,tabak:Locator){
  const tutamak=await tabak.locator('.lokma-tutamaci').boundingBox();
  if(!tutamak)throw Error('Servis çatalı görünmüyor');
  const x=tutamak.x+tutamak.width/2,y=tutamak.y+tutamak.height/2;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x-18,y-22,{steps:5});
  await expect(page.locator('.elle-tasinan')).toBeVisible();
}

test('Piknikte çocuk lokmayı ağza taşır, kaçırınca porsiyon ve jeton korunur',async({page})=>{
  test.setTimeout(120000);
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(d.tepsiler,{secili:'bahce-tabagi',ekran:'masa',restoranda:true,jeton:12,
      gun:{no:2,ziyaret:1,kazanc:6,kapandi:false},
      restoran:{sira:5,menuId:'bahce-tabagi',sonYemek:'bahce-tabagi',evre:'mutfak',sayildi:true},
      masalar:{'bahce-tabagi':{sunuldu:true,tavukPuani:3,piknik:{esya:['salata','tavuk','pecete']},
        tabaklar:{tavuk:true,salata:{tarifId:'salata',istenenSus:'limon',sus:{id:'limon',x:.48,y:.52},puan:3}}}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  });
  await page.reload();
  const tavuk=page.getByRole('button',{name:'Tavada Tavuk tattır'});
  const salata=page.getByRole('button',{name:'Bahçe Salatası tattır'});
  await expect(page.locator('.lokma-tutamaci')).toHaveCount(2);
  await lokmayiAl(page,tavuk);
  await page.mouse.move(10,10,{steps:6});await page.mouse.up();
  await expect(page.locator('.restoran-lokma')).toHaveCount(0);
  await expect(tavuk).not.toHaveAttribute('data-lokma-adedi',/./);
  await lokmayiAl(page,tavuk);
  const hedef=await page.locator('.tepsi-alici img[data-misafir]').evaluate(async el=>{
    const img=el as HTMLImageElement;await img.decode();
    const r=img.getBoundingClientRect(),s=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);
    return{x:r.left+r.width/2-.10*img.naturalWidth*s,y:r.top+r.height/2-.01*img.naturalHeight*s};
  });
  await page.mouse.move(hedef.x+35,hedef.y+24,{steps:8});
  if(process.env.SEF_ELDE_TADIM_KARE)await page.screenshot({path:process.env.SEF_ELDE_TADIM_KARE});
  await page.mouse.move(hedef.x,hedef.y,{steps:4});await page.mouse.up();
  await expect(tavuk).toHaveAttribute('data-lokma-adedi','1');
  await expect(tavuk.locator('.kalan-tavuk')).toBeVisible();
  await expect(page.locator('.restoran-lokma')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  if(process.env.SEF_ELDE_TABAK_KARE)await page.screenshot({path:process.env.SEF_ELDE_TABAK_KARE});
  await tavuk.press('Enter');await expect(tavuk).toHaveAttribute('data-tukendi','true');
  await expect(tavuk.locator('.kalan-tavuk')).toBeHidden();
  await expect(page.locator('.restoran-lokma')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  await salata.tap();await expect(salata).toHaveAttribute('data-lokma-adedi','1');
  await expect(page.getByRole('dialog')).toBeVisible();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect([t.jeton,t.gun.ziyaret]).toEqual([12,1]);
});
