import {expect,test} from '@playwright/test';
import type {Defter} from '../../sef/src/kayit';

test('Tavada bekleyen tavuk yanar; ateşi kapatmak ve oyunu arka plana almak süreyi durdurur',async({page})=>{
  await page.clock.install();
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{ekran:'masa',secili:'fiyonk-tavuk',oynanan:'tavuk',masalar:{'fiyonk-tavuk':{tabaklar:{},adim:{tavuk:3,icecek:0},sunuldu:false}}}})));
  await page.reload();
  const tava=page.locator('.tv-mutfak');
  await page.locator('.tv-fileto:enabled').first().press('Enter');
  await expect(tava).toHaveAttribute('data-adet','4');
  await expect(tava).toHaveAttribute('data-isiniyor','false');
  await page.clock.fastForward(9500);
  await expect(tava).toHaveAttribute('data-puan','2');
  await page.getByRole('button',{name:'Isıyı kapat'}).press('Enter');
  await page.clock.fastForward(25000);
  await expect(tava).toHaveAttribute('data-puan','2');
  await page.getByRole('button',{name:'Biraz daha kızart'}).press('Enter');
  const arkaPlan=(arkada:boolean)=>page.evaluate(arkada=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada}})),arkada);
  await arkaPlan(true);await page.clock.fastForward(25000);await arkaPlan(false);
  await expect(tava).toHaveAttribute('data-puan','2');
  await page.clock.fastForward(14500);
  await expect(tava).toHaveAttribute('data-puan','1');
  await expect(tava.locator('.tv-fileto img').first()).toHaveAttribute('src',/yanik/);
  await page.getByRole('button',{name:'Taze filetolarla yeniden başla'}).press('Enter');
  await expect(tava).toHaveAttribute('data-adet','0');
  await expect(tava).toHaveAttribute('data-puan','3');
});

test('Eski salatalık isteği sosa dönüşür; müşteri farklı sosla servisi kabul edip iki yıldız verir',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    const hazir={tarifId:'salata',alinan:['salatalik','marul','domates'],eskiHazir:[],kesimler:{salatalik:4,marul:4,domates:4},aktarilan:['salatalik','marul','domates'],karistirma:3,servisEdildi:false};
    localStorage.setItem('minkino-sef-v1',JSON.stringify({secili:'salata',ekran:'servis',sessiz:true,siparisler:{salata:hazir},porsiyonlar:{salata:{adet:2}},susler:{salata:{id:'salatalik',x:.4,y:.3}},ozelIstekler:{salata:'salatalik'}}));
  });
  await page.reload();
  const b=page.locator('[data-sus=yogurt]');
  await expect(page.locator('.fis-ozel')).toHaveAttribute('aria-label',/limonlu/);
  await expect(page.locator('[data-zil]')).toHaveCount(0);
  await b.press('Enter');await page.locator('[data-sun=salata]').press('Enter');
  await expect(page.locator('.salata-sos-katmani[data-sos=yogurt]')).toBeVisible();
  await page.reload();
  await page.locator('[data-zil]').tap();
  await expect(page.locator('.sef-yildizlar[data-puan="2"]')).toBeVisible();
  await expect(page.locator('.sebze-tadim [aria-label="İstenen"] [data-sus=limon]')).toBeVisible();
  await expect(page.locator('.sebze-tadim [aria-label="Sunulan"] [data-sus=yogurt]')).toBeVisible();
  const d=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!) as Defter);
  expect(d.gecmis.at(-1)).toMatchObject({tarifId:'salata',puan:2,sus:{id:'yogurt'}});
  await page.reload();await expect(page.locator('.sef-yildizlar>i[data-dolu=true]')).toHaveCount(2);
  if(process.env.SEF_SALATA_KARE)await page.locator('.mutfak-sahnesi').screenshot({path:process.env.SEF_SALATA_KARE});
});

test('Yanık tavuk görseli ve müşteri yıldızı sunulan tepside yenilemeden sonra da kalır',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{ekran:'masa',secili:'fiyonk-tavuk',masalar:{'fiyonk-tavuk':{
      tabaklar:{makarna:{tarifId:'makarna',resim:'makarna/makarna'},tavuk:true},adim:{tavuk:6,icecek:0},tavukPuani:1,sunuldu:false
    }}}}));
  });await page.reload();
  await expect(page.locator('[data-parca=tavuk] img')).toHaveAttribute('src',/servis-yanik/);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.locator('[data-parca=tavuk] [data-puan="1"]')).toBeVisible();
  await expect(page.locator('.tepsi-ust h2')).toHaveText('4 / 6');
  await page.reload();
  await expect(page.locator('.tepsi-alici [data-dolu=true]')).toHaveCount(2);
  await expect(page.locator('.tepsi-alici img')).toHaveAttribute('data-poz','tadim');
  if(process.env.SEF_TEPSI_TADIM_KARE)await page.locator('.tepsi-sahnesi').screenshot({path:process.env.SEF_TEPSI_TADIM_KARE});
});

test('Yarım bardak ve eksik servis oyuncunun iki ayrı kararıdır; rekor kalır',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.getByRole('button',{name:'Müşteri masası',exact:true}).tap();
  await page.locator('[data-menu=pizza-molasi]').tap();
  await page.locator('[data-parca=icecek]').tap();
  await page.locator('.ps-portakal').tap();await page.locator('.ps-dene').tap();
  for(let n=1;n<=3;n++){
    await page.locator('.ps-cevir').tap();
    await expect(page.locator('.ps-sahnesi')).toHaveAttribute('data-icecek',String(n+1));
  }
  await page.locator('.ps-surahi').tap();await page.locator('.ps-bardak').tap();
  await expect(page.locator('.ps-yarim-sun')).toBeVisible();
  await page.reload();await page.locator('.ps-yarim-sun').tap();
  await expect(page.locator('[data-parca=icecek] img')).toHaveAttribute('src',/yarim-bardak/);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await page.getByRole('button',{name:'Mutfağa dön ve tamamla'}).tap();
  await expect(page.locator('[data-parca=pizza]')).toBeEnabled();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).tap();
  await expect(page.locator('.tepsi-ust h2')).toHaveText('2 / 6');
  await page.reload();
  await expect(page.locator('[data-parca=pizza].tepsi-eksik')).toBeDisabled();
  await page.getByRole('button',{name:'Başka bir müşteri seç'}).tap();
  await expect(page.locator('[data-menu=pizza-molasi] .tepsi-rekor')).toHaveText('2/6');
});
