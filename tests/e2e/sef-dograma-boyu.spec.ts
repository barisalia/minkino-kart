import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('Çocuk kesim boyunu seçer ve yedi havuç parçası tencereye ulaşır',async({page})=>{
  await page.setViewportSize({width:740,height:360});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-v1',JSON.stringify({
    sessiz:true,secili:'corba',ekran:'tahta',siparisler:{corba:{tarifId:'corba',alinan:['havuc','patates','domates'],eskiHazir:[],istenenKivam:'puruzsuz'}}
  })));
  await page.reload();
  await page.getByRole('button',{name:'Küçük parçalar'}).tap();
  const havuc=page.locator('[data-kes=havuc]');
  for(let i=0;i<6;i++){
    if(i===1){
      const parca=await havuc.locator('.kesim-govde').evaluate(svg=>{
        const hedef=svg.querySelector('.dogranmis-parca g') as SVGGElement;
        const ellipse=hedef.querySelector('ellipse')!;
        const m=hedef.getScreenCTM()!;
        // Positive local Y faces into the half with the drawn cross section.
        const p=new DOMPoint(0,ellipse.ry.baseVal.value+14).matrixTransform(m);
        return {x:p.x,y:p.y};
      });
      await page.touchscreen.tap(parca.x,parca.y);
      await expect(havuc).toHaveAttribute('data-secilen-parca','0');
      await expect(havuc.locator('.dogranmis-parca')).toHaveCount(2);
    }
    if(i===3){
      await page.reload();
      await expect(page.getByRole('button',{name:'Küçük parçalar'})).toHaveAttribute('aria-pressed','true');
    }
    await expect(havuc.locator('.dogranmis-parca')).toHaveCount(i+1);
    await havuc.press('Enter');
    await expect(page.locator('.kesim-alani.kesiyor')).toHaveCount(0);
  }
  const toplama=page.locator('[data-topla=havuc]');
  await expect(toplama.locator('.dogranmis-parca')).toHaveCount(7);
  await page.getByRole('button',{name:'Son kesimi geri al'}).tap();
  await expect(havuc.locator('.dogranmis-parca')).toHaveCount(6);
  await havuc.press('Enter');
  await expect(toplama.locator('.dogranmis-parca')).toHaveCount(7);
  await toplama.press('Enter');
  await expect(page.locator('.tabakta-porsiyon .dogranmis-parca')).toHaveCount(7);
  await page.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    s.ekran='ocak';localStorage.setItem('minkino-sef-v1',JSON.stringify(s));
  });
  await page.reload();
  await page.locator('[data-aktar=havuc]').press('Enter');
  await expect(page.locator('.sef-kap-parcasi[data-malzeme=havuc]')).toHaveCount(7);
});
