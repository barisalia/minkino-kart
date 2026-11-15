import {expect,test} from '@playwright/test';

for(const acik of [false,true]){
  test('Resimli pastane tarifleri ve '+(acik?'açılmış tarifte pişirme':'kilitli tarifte vitrin'),async({page})=>{
    await page.setViewportSize(acik?{width:844,height:390}:{width:568,height:320});
    await page.goto('./sef/?test=1');
    await page.getByRole('button',{name:'Sesi kapat'}).tap();
    if(acik){
      await page.evaluate(()=>{
        const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
        k.tepsiler.tatliSeviye=2;k.tepsiler.jeton=12;
        localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
      });
      await page.reload();
    }
    await page.getByRole('button',{name:'Resimli tarif kitabı'}).tap();
    await page.getByRole('button',{name:'Pastane tariflerini aç'}).press('Enter');
    await expect(page.getByRole('button',{name:'Pastane tariflerini aç'})).toBeFocused();
    await page.getByRole('button',{name:'Çilekli Dondurma tarifini incele'}).tap();
    for(let i=0;i<3;i++){
      const r=page.locator('.kitap-resim>img');
      await r.evaluate(async el=>{await (el as HTMLImageElement).decode();});
      await expect(r).toHaveAttribute('src',new RegExp('dondurma-'+(i+1)));
      if(i<2)await page.getByRole('button',{name:'Sonraki adım'}).tap();
    }
    await page.getByRole('button',{name:acik?'Bu yemeği hazırla':'Pastanede tarif kilidini gör'}).tap();
    if(acik)await expect(page.locator('.tatli-tezgahi')).toHaveAttribute('data-tatli','dondurma');
    else await expect(page.locator('.tatli-dukkan')).toHaveAttribute('data-pastane','kapali');
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.jeton)).toBe(acik?12:0);
  });
}
