import { expect, test } from '@playwright/test';

test('Serbest hamur, Mino ve Dede Hasan ayrı kalır ve açık masa yeniden yüklenir',async({page})=>{
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  const oyun=page.locator('.mp-oyun');
  const geri=()=>page.getByRole('button',{name:'Geri',exact:true}).click();
  const asama=(ad:string)=>expect(oyun).toHaveAttribute('data-asama',ad);
  const hamur=(ad:string)=>oyun.getByRole('button',{name:ad+' hamur seç'}).click();
  const musteri=(id:string)=>page.locator('[data-menu="'+id+'"]').click();
  const tabagaGit=()=>page.locator('[data-parca=makarna]').click();
  await page.locator('[data-tarif=makarna]').click();
  await hamur('Pancarlı');
  await oyun.locator('[data-mp-kes="0"]').press('Enter');
  await expect(oyun.locator('[data-mp-kes="1"]')).toBeVisible();
  await geri();

  await page.getByRole('button',{name:'Müşteri masası',exact:true}).click();
  await musteri('fiyonk-tavuk');
  await tabagaGit();
  await asama('renk');
  await hamur('Yumurtalı');
  await oyun.locator('[data-mp-kes="0"]').press('Enter');
  await expect(oyun.locator('[data-mp-kes="1"]')).toBeVisible();
  await oyun.locator('[data-mp-kes="1"]').press('Enter');
  await asama('sekil');
  await geri();
  await geri();
  await expect(page.locator('[data-menu=fiyonk-tavuk] [data-porsiyon=makarna]')).toHaveAttribute('data-durum','tezgahta');
  await expect(page.locator('[data-menu=fiyonk-sis] [data-porsiyon=makarna]')).toHaveAttribute('data-durum','bekliyor');
  await musteri('fiyonk-sis');
  await tabagaGit();
  await asama('renk');
  await hamur('Pancarlı');
  await page.reload();
  await asama('kes');
  await expect(oyun.locator('[data-mp-kes="0"]')).toBeVisible();
  await geri();
  await geri();
  await musteri('fiyonk-tavuk');
  await tabagaGit();
  await asama('sekil');
  await geri();
  await geri();
  await geri();
  await page.locator('[data-tarif=makarna]').click();
  await expect(oyun.locator('[data-mp-kes="1"]')).toBeVisible();
});

test('Güncelleme sırasında açık olan eski tepsi hamurunu doğru masada sürdürür',async({page})=>{
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-acik-atolye','makarna');
    localStorage.setItem('minkino-sef-makarna-v1',JSON.stringify({aktif:true,renk:'altin',kesim:2,sekil:1}));
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      ekran:'kapali',secili:'fiyonk-sis',oynanan:'makarna',masalar:{'fiyonk-sis':{tabaklar:{},adim:{}}}
    }}));
  });
  await page.reload();
  await expect(page.locator('.mp-oyun')).toHaveAttribute('data-asama','sekil');
  const kayit=await page.evaluate(()=>({
    masa:JSON.parse(localStorage.getItem('minkino-sef-makarna-v1-masa-fiyonk-sis')!),
    serbest:localStorage.getItem('minkino-sef-makarna-v1')
  }));
  expect(kayit.masa.sekil).toBe(1);
  expect(kayit.serbest).toBeNull();
});

for(const ornek of [
  {id:'sis',menu:'fiyonk-sis',sahne:'.sis-oyunu',alan:'data-sis-asama',serbest:'diz',ilk:'islat',kayit:{durak:'diz',suyaGirdi:true}},
  {id:'krep',menu:'kahvalti',sahne:'.krep-oyunu',alan:'data-krep-adim',serbest:'yay',ilk:'karisim',kayit:{adim:'yay',yon:1}},
  {id:'mucver',menu:'corba-sofrasi',sahne:'.mucver-oyunu',alan:'data-asama',serbest:'harc',ilk:'rende',kayit:{kabak:3,havuc:3}},
])test(ornek.id+' eski serbest tezgâhı korur, masaya ayrı hazırlık açar',async({page})=>{
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.goto('./sef/?test=1');
  await page.evaluate(o=>{
    localStorage.setItem('minkino-sef-'+o.id+'-v1',JSON.stringify(o.kayit));
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true}));
  },ornek);
  await page.reload();
  await page.getByRole('button',{name:'Müşteri masası',exact:true}).click();
  await page.locator('[data-menu='+ornek.menu+']').click();
  await page.locator('[data-parca='+ornek.id+']').click();
  await expect(page.locator(ornek.sahne)).toHaveAttribute(ornek.alan,ornek.ilk);
  await page.reload();
  await expect(page.locator(ornek.sahne)).toHaveAttribute(ornek.alan,ornek.ilk);
  await page.keyboard.press('Escape');
  await page.locator('.tepsi-ust').getByRole('button',{name:'Geri'}).click();
  await page.locator('.tepsi-ust').getByRole('button',{name:'Geri'}).click();
  await page.locator('[data-tarif='+ornek.id+']').click();
  await expect(page.locator(ornek.sahne)).toHaveAttribute(ornek.alan,ornek.serbest);
});

test('Erken sunulan tepsinin yeni siparişi temiz hamurla başlar ve diğer masaya dokunmaz',async({page})=>{
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    const id='fiyonk-tavuk',diger='fiyonk-sis';
    for(const masa of [id,diger]){
      localStorage.setItem('minkino-sef-makarna-v1-masa-'+masa,JSON.stringify({renk:'altin',kesim:2,sekil:1,servis:4}));
      localStorage.setItem('minkino-sef-ozet-makarna-masa-'+masa,JSON.stringify({suruyor:true,servis:4}));
    }
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      ekran:'masa',secili:id,masalar:{[id]:{tabaklar:{tavuk:true},adim:{tavuk:6}},[diger]:{tabaklar:{},adim:{}}}
    }}));
  });
  await page.reload();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).click();
  await page.getByRole('button',{name:'Başka bir müşteri seç'}).click();
  await page.locator('[data-menu=fiyonk-tavuk]').click();
  await page.locator('[data-parca=makarna]').click();
  await expect(page.locator('.mp-oyun')).toHaveAttribute('data-asama','renk');
  const [bu,diger]=await page.evaluate(()=>['fiyonk-tavuk','fiyonk-sis'].map(id=>JSON.parse(localStorage.getItem('minkino-sef-makarna-v1-masa-'+id)!)));
  expect([bu.servis,bu.kesim,diger.servis,diger.kesim]).toEqual([4,0,4,2]);
});
