import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

for(const [yemek,kim,puan] of [['kurabiye','mino',3],['dondurma','lokum',1],['minik-kek','dede',3]] as const){
  test(kim+' hazırlanan tatlıya tepside karşılık verir',async({page})=>{
    await page.goto('./sef/?test=1');
    await page.evaluate(({yemek,puan})=>localStorage.setItem('minkino-sef-v1',JSON.stringify({
      sessiz:true,tepsiler:{ekran:'masa',restoranda:true,secili:yemek,tatliSeviye:4,restoran:{sira:3,menuId:yemek,evre:'mutfak'},
        masalar:{[yemek]:{tabaklar:{[yemek]:true},tatliPuani:puan,sunuldu:false}}}
    })),{yemek,puan});
    await page.reload();
    await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
    const yuz=page.locator('.tepsi-alici img[data-misafir="'+kim+'"]');
    await expect(page.locator('.restoran-lokma')).toBeAttached();
    await expect(yuz).toHaveAttribute('data-tadim-tepkisi',puan===3?'3':'2');
    if(process.env.SEF_TEPKI_KARELERI)await page.locator('.tepsi-sahnesi').screenshot({path:process.env.SEF_TEPKI_KARELERI+'/'+kim+'-tadim-tepkisi.png'});
    await expect(page.locator('.restoran-lokma')).toHaveCount(0);
    await expect(yuz).not.toHaveAttribute('data-tadim-tepkisi',/.+/);
    await expect(page.getByRole('button',{name:'Sıradaki müşteriyi karşıla'})).toBeVisible();
  });
}
