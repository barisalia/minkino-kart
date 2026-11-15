import { expect, test } from '@playwright/test';
const dersler=Array.from('ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ',(upper,i)=>({upper,id:String(i+1).padStart(2,'0')}));

test('29 harfin içi kalemle boyanır ve özel işaretler ayrı hedef olarak kalır',async({page})=>{
  await page.addInitScript((adimlar)=>{
    localStorage.setItem('minkino-alfabe-v1',JSON.stringify({adimlar}));
  },Object.fromEntries(dersler.map(d=>[d.id,6])));
  await page.goto('./alfabe/');
  for(const {id,upper} of dersler){
    await page.locator('.at-harf[data-id="'+id+'"]').click();
    const yollar=page.locator('.boy-iz');
    for(let i=0;i<await yollar.count();i++){
      await yollar.nth(i).evaluate(el=>{
        const path=el as unknown as SVGPathElement, svg=document.querySelector<SVGSVGElement>('.boy-harf')!;
        const matrix=path.getScreenCTM()!,uzunluk=path.getTotalLength();
        // Sentetik pointer kimliğinin yerleşik bir capture hedefi yoktur.
        svg.setPointerCapture=()=>{};
        function firca(tip:string,uzaklik:number){
          const pt=path.getPointAtLength(uzaklik).matrixTransform(matrix);
          svg.dispatchEvent(new PointerEvent(tip,{pointerType:'mouse',pointerId:1,button:0,clientX:pt.x,clientY:pt.y}));
        }
        firca('pointerdown',0);
        for(let d=2;d<uzunluk;d+=2)firca('pointermove',d);
        firca('pointerup',uzunluk);
      });
      if('İÖÜĞÇŞ'.includes(upper)&&i+1<await yollar.count()){
        await expect(page.locator('.boy-isaret'),upper+' işareti').toBeVisible();
        await expect(page.locator('.boy-tamam')).toHaveCount(0);
      }
    }
    await expect(page.locator('.boy-tamam'),upper).toBeVisible();
    await page.getByRole('button',{name:'Harflere dön'}).click();
  }
});

test('Boyama aynı harfin rengini ve izlerini geri getirir, İ noktasına dokununca ders sürer', async ({page}) => {
  await page.goto('./alfabe/');
  await page.evaluate(() => {
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({
      son:'12', adimlar:{'12':6,'09':6}, renkler:{'12':{buyuk:1}}
    }));
  });
  await page.reload();
  const iHarfi = page.locator('.at-harf[data-id="12"]');
  const geri = page.getByRole('button', {name:'Harflere dön'});
  const govde = page.locator('.boy-harf');
  await iHarfi.click();
  await govde.press('Enter');
  const iz = await page.locator('.boy-murekkep').innerHTML();
  const renk = await page.locator('.boy-murekkep').getAttribute('stroke');
  const yuzde = await page.locator('.boy-dolum').getAttribute('aria-valuenow');
  expect(Number(yuzde)).toBeGreaterThan(0);
  await geri.click();
  await page.locator('.at-harf[data-id="09"]').click();
  await expect(page.locator('.boy-dolum')).toHaveAttribute('aria-valuenow','0');
  await geri.click();
  await page.reload();
  await iHarfi.click();
  expect(await page.locator('.boy-murekkep').innerHTML()).toBe(iz);
  await expect(page.locator('.boy-murekkep')).toHaveAttribute('stroke',renk!);
  await expect(page.locator('.boy-dolum')).toHaveAttribute('aria-valuenow',yuzde!);
  for(let i=0;i<16&&!await page.locator('.boy-isaret').count();i++) await govde.press('Enter');
  await expect(page.locator('.boy-isaret')).toBeVisible();
  const nokta = await page.locator('.boy-iz').nth(1).evaluate(el=>{
    const p=el as unknown as SVGPathElement;
    const pt=p.getPointAtLength(0).matrixTransform(p.getScreenCTM()!);
    return {x:pt.x, y:pt.y};
  });
  await page.touchscreen.tap(nokta.x+16,nokta.y);
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim','2',{timeout:15000});
  expect(await page.evaluate(()=>localStorage.getItem('minkino-harf-boyama-v1-İ'))).toBeNull();
});

test('Hece Oyunu aynı turda alkışı ve taşları saklar, yanlış denemede sıradaki heceyi duyurur', async ({page}) => {
  await page.goto('./alfabe/');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-bagimsiz-hece-v1',JSON.stringify({
      rota:['06','02','18'],tur:0,asama:'alkis',sira:0,taslar:[]
    }));
  });
  const ac = page.locator('.at-hece-ac');
  await ac.click();
  const alkis=page.getByRole('button',{name:'Bir hece için alkışla'});
  await alkis.click();
  await page.getByRole('button',{name:'Harflere dön'}).click();
  await ac.click();
  await expect(page.locator('.ho-yuva.ho-vuruldu')).toHaveText('el');
  await alkis.click();
  const el=page.getByRole('button',{name:'el hecesi',exact:true});
  const ma=page.getByRole('button',{name:'ma hecesi',exact:true});
  await ma.click();
  await expect(page.locator('.ho-yuva.ho-ipucu')).toHaveText('el');
  await ma.click();
  await expect(el).toHaveClass(/ho-beklenen/);
  await el.press('Enter');
  const dizilim=await page.locator('.ho-tas').allTextContents();
  await page.reload();
  await ac.click();
  await expect(page.locator('.ho')).toHaveAttribute('data-tur','1');
  await expect(page.locator('.ho-yerinde')).toHaveText('el');
  expect(await page.locator('.ho-tas').allTextContents()).toEqual(dizilim);
  await expect(page.locator('.ho-tas[aria-label="el hecesi"]')).toBeDisabled();
  await ma.press('Space');
  await expect(page.locator('.ho-tam strong')).toHaveText('elma',{timeout:15000});
  await page.getByRole('button',{name:'Sonraki sözcük'}).click();
  await expect(page.locator('.ho')).toHaveAttribute('data-tur','2');
  await expect(page.locator('.ho-nesne img')).toHaveAttribute('alt',/balık/i);
});

test('Son hece birleştikten sonra yenileme sözcüğü korur, bitince yeni tur başlar',async({page})=>{
  await page.goto('./alfabe/');
  await page.evaluate(()=>localStorage.setItem('minkino-bagimsiz-hece-v1',JSON.stringify({
    rota:['06','02','18'],tur:2,asama:'sirala',sira:2,taslar:['to','ma','büs','o']
  })));
  const ac=page.locator('.at-hece-ac');
  await ac.click();
  await expect(page.locator('.ho-yerinde')).toHaveText(['o','to']);
  await page.getByRole('button',{name:'büs hecesi',exact:true}).click();
  await page.reload();
  await ac.click();
  await expect(page.locator('.ho-tam strong')).toHaveText('otobüs');
  await page.getByRole('button',{name:'Harf Atölyesi’ne dön'}).click();
  expect(await page.evaluate(()=>localStorage.getItem('minkino-bagimsiz-hece-v1'))).toBeNull();
  await page.evaluate(()=>localStorage.setItem('minkino-bagimsiz-hece-v1','{bozuk'));
  await ac.click();
  await expect(page.locator('.ho')).toHaveAttribute('data-tur','1');
  await expect(page.locator('.ho')).toHaveAttribute('data-asama','alkis');
});

test('gömülü ses oynatıcısı takıldığında hece sırası sürer, arka planda beklenen süre sayılmaz',async({page})=>{
  await page.addInitScript(()=>{
    // Bazı cihazlar oynamaya başladıklarını bildirip sesi sabit zamanda bırakıyor.
    Object.defineProperty(window,'AudioContext',{value:undefined});
    Object.defineProperty(HTMLMediaElement.prototype,'play',{value:function(this:HTMLMediaElement){
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    }});
  });
  await page.goto('./alfabe/');
  await page.locator('.at-hece-ac').click();
  const oyun=page.locator('.ho');
  const alkis=page.locator('.ho-alkis');
  await alkis.click();
  await alkis.click();
  await expect(alkis).toBeDisabled();
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,value:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(5500);
  await expect(oyun).toHaveAttribute('data-asama','alkis');
  await page.evaluate(()=>{
    delete (document as {hidden?:boolean}).hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(oyun).toHaveAttribute('data-asama','sirala',{timeout:14000});
  await expect(page.locator('.ho-tas').first()).toBeEnabled();
});

test('depolama dolunca rafa dönüp açılan derste ve hece oyununda son hamle korunur',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('minkino-alfabe-v1',JSON.stringify({adimlar:{'01':1,'02':6}}));
    Storage.prototype.setItem=()=>{throw new DOMException('Depolama dolu','QuotaExceededError');};
  });
  await page.goto('./alfabe/');
  const geri=page.locator('header .at-geri');
  await page.locator('[data-id="01"]').click();
  const defter=page.locator('.yz-iz svg');
  await defter.focus();await page.keyboard.press('Space');
  const iz=await defter.locator('.murekkep').first().getAttribute('d');
  expect(iz).toBeTruthy();
  await geri.click();await page.locator('[data-id="01"]').click();
  await expect(defter.locator('.murekkep').first()).toHaveAttribute('d',iz!);
  await geri.click();await page.locator('[data-id="02"]').click();
  const kagit=page.locator('.boy-harf');
  await kagit.focus();await page.keyboard.press('Space');
  const dolu=await page.locator('.boy-dolum').getAttribute('aria-valuenow');
  expect(Number(dolu)).toBeGreaterThan(0);
  await geri.click();await page.locator('[data-id="02"]').click();
  await expect(page.locator('.boy-dolum')).toHaveAttribute('aria-valuenow',dolu!);
  await geri.click();await page.locator('.at-hece-ac').click();await page.locator('.ho-alkis').click();
  const kelime=await page.locator('.ho').getAttribute('data-kelime');
  await geri.click();await page.locator('.at-hece-ac').click();
  await expect(page.locator('.ho')).toHaveAttribute('data-kelime',kelime!);
  await expect(page.locator('.ho-vuruldu')).toHaveCount(1);
});
