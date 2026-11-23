import { expect, test, type Page } from '@playwright/test';
const dersler=Array.from('ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ',(upper,i)=>({upper,id:String(i+1).padStart(2,'0')}));

// Harfi boya 2–3 yaşın dersindedir (18 Kasım 2026: ders kısaldı; alfabe/src/main.ts → dersAdimlari)
const ikiUcYas=(page:import('@playwright/test').Page)=>page.addInitScript(()=>{
  if(!sessionStorage.getItem('boy-yas')){localStorage.setItem('minkino-kartlar-v1',JSON.stringify({yas:3}));sessionStorage.setItem('boy-yas','1');}
});

test('29 harfin içi kalemle boyanır ve özel işaretler ayrı hedef olarak kalır',async({page})=>{
  await ikiUcYas(page);
  await page.addInitScript((adimlar)=>{
    localStorage.setItem('minkino-alfabe-v1-yas-2-3',JSON.stringify({adimlar}));
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
      // 2–3 yaşın kalın fırçası işareti gövdeyle birlikte boyayabilir; işaret ipucu yalnız işaret boş kaldıysa gelir
      const isaretBos=await page.locator('.boy-tamam').count()===0&&await page.locator('.boy-harf.boy-isaret, .boy-isaret').count()>0;
      if('İÖÜĞÇŞ'.includes(upper)&&i+1<await yollar.count()&&isaretBos){
        await expect(page.locator('.boy-isaret'),upper+' işareti').toBeVisible();
        await expect(page.locator('.boy-tamam')).toHaveCount(0);
      }
    }
    await expect(page.locator('.boy-tamam'),upper).toBeVisible();
    await page.getByRole('button',{name:'Harflere dön'}).click();
  }
});

test('Boyama aynı harfin rengini ve izlerini geri getirir, İ noktasına dokununca ders sürer', async ({page}) => {
  await ikiUcYas(page);
  await page.goto('./alfabe/');
  await page.evaluate(() => {
    localStorage.setItem('minkino-alfabe-v1-yas-2-3', JSON.stringify({
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
  // 2–3 yaşta boyamadan sonra bulma oyunu gelir; öğrenme sırasında (harf-sirasi.ts) İ 5. harf: Resimde Bul
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim','8',{timeout:15000});
  expect(await page.evaluate(()=>localStorage.getItem('minkino-harf-boyama-v1-İ'))).toBeNull();
});

// Hece Oyunu (18 Kasım 2026): 4 ve 5+ yaşta önce "Hece Oyunu" menüsü açılır, oyun "Hece Trambolini"dir.
// Bir sözcükte tek iş: 1. ve 3. sözcükte trambolinde zıplanır (her hecede sıradaki tramboline dokunulur, sözcük bitince ok),
// 2. sözcükte hece taşları dizilir (5+ yaşta bir fazla taşla). 2–3 yaş yalnız zıplar. Trambolinden geri düğmesi menüye döner.
async function trambolinAc(page:Page){
  await page.locator('.at-hece-ac').click();
  await page.getByRole('button',{name:'Hece Trambolini'}).click();
}
const yay=(page:Page,sira:number)=>page.getByRole('button',{name:sira+'. trambolin',exact:true});
const tas=(page:Page,hece:string)=>page.getByRole('button',{name:hece+' hecesi',exact:true});

test('Hece Trambolini sözcük başına tek iş: zıplama ve taşlar kayıtla sürer, yanlış denemede sıradaki hece duyurulur', async ({page}) => {
  await page.goto('./alfabe/');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-bagimsiz-hece-v1',JSON.stringify({
      rota:['06','02','18'],tur:0,asama:'alkis',sira:0,taslar:[]
    }));
  });
  await trambolinAc(page);
  await yay(page,1).click();
  // İniş bitince ilk hece kaydedilir ve ikinci trambolin açılır.
  await expect(yay(page,2)).toBeEnabled();
  await expect(page.locator('.ho-yuva').first()).toHaveText('el');
  await page.locator('header .at-geri').click();
  await page.getByRole('button',{name:'Hece Trambolini'}).click();
  await expect(page.locator('.ho-yuva')).toHaveText(['el','']);
  await expect(yay(page,1)).toHaveClass(/tr-gecti/);
  await yay(page,3).click();
  await expect(page.locator('.tr-alt [role=status]')).toHaveText('Önce 2. tramboline dokun.');
  await expect(yay(page,2)).toHaveClass(/tr-siradaki/);
  await yay(page,2).click();
  await expect(page.locator('.ho-yuva')).toHaveText(['el','ma']);
  // Zıplanan sözcük taşlarla yeniden kurulmaz: ok doğrudan sözcüğü gösterir.
  await page.getByRole('button',{name:'Devam et'}).click();
  await expect(page.locator('.ho')).toHaveAttribute('data-asama','sonuc');
  await expect(page.locator('.ho-tam strong')).toHaveText('elma');
  await page.getByRole('button',{name:'Sonraki sözcük'}).click();
  // İkinci sözcük doğrudan taşlarla başlar; 5+ yaşta bir taş fazladır.
  await expect(page.locator('.ho')).toHaveAttribute('data-tur','2');
  await expect(page.locator('.ho')).toHaveAttribute('data-asama','sirala');
  await expect(page.locator('.ho-nesne img')).toHaveAttribute('alt',/balık/i);
  await expect(page.locator('.tr-kok')).toBeHidden();
  await expect(page.locator('.ho-tas')).toHaveCount(3);
  await tas(page,'lık').click();
  // Yanlış taştan sonra Ceren sıradaki heceyi söylerken boş yuvayı işaret eder.
  await expect(page.locator('.ho-yuva').first()).toHaveClass(/ho-okunan/);
  await expect(page.locator('.ho-yuva').first()).toBeEmpty();
  // Ceren konuşurken taşlar kaybolmaz, yalnız alınan taş kalkar.
  await expect(tas(page,'ba')).toBeVisible();
  await expect(tas(page,'ba')).toBeEnabled();
  await tas(page,'ba').press('Enter');
  await expect(tas(page,'lık')).toBeEnabled();
  const alinan=page.locator('.ho-tas[aria-label="ba hecesi"]');
  await expect(alinan).toBeDisabled();
  await expect(alinan).toBeHidden();
  const dizilim=await page.locator('.ho-tas').allTextContents();
  await page.reload();
  await trambolinAc(page);
  await expect(page.locator('.ho')).toHaveAttribute('data-tur','2');
  await expect(page.locator('.ho')).toHaveAttribute('data-asama','sirala');
  await expect(page.locator('.ho-yuva')).toHaveText(['ba','']);
  expect(await page.locator('.ho-tas').allTextContents()).toEqual(dizilim);
  await expect(alinan).toBeDisabled();
  await expect(tas(page,'lık')).toBeEnabled();
  await tas(page,'lık').press('Space');
  await expect(page.locator('.ho-tam strong')).toHaveText('balık',{timeout:15000});
  await page.getByRole('button',{name:'Sonraki sözcük'}).click();
  // Üçüncü sözcükte yine trambolin.
  await expect(page.locator('.ho')).toHaveAttribute('data-tur','3');
  await expect(page.locator('.ho')).toHaveAttribute('data-asama','alkis');
  await expect(page.locator('.ho-nesne img')).toHaveAttribute('alt',/otobüs/i);
  await expect(page.locator('.tr-yay:visible')).toHaveCount(3);
  await expect(page.locator('.ho-taslar')).toBeHidden();
});

test('yaşa göre sözcük işi: 4 yaşta ikinci sözcük fazla taşsız dizilir, 2–3 yaşta hep zıplanır ve tur iki sözcüktür',async({page})=>{
  // Kayıt anahtarı yaş grubuna göre ayrılır (alfabe/src/ders-kaydi.ts): 4 yaş "-yas-4", 2–3 yaş "-yas-2-3".
  await page.addInitScript(()=>{
    if(sessionStorage.getItem('yas-testi'))return;
    sessionStorage.setItem('yas-testi','1');
    localStorage.setItem('minkino-kartlar-v1',JSON.stringify({yas:4}));
    localStorage.setItem('minkino-bagimsiz-hece-v1-yas-4',JSON.stringify({rota:['06','02','18'],tur:1,asama:'alkis',sira:0,taslar:[]}));
    localStorage.setItem('minkino-bagimsiz-hece-v1-yas-2-3',JSON.stringify({rota:['06','02'],tur:1,asama:'alkis',sira:0,taslar:[]}));
  });
  await page.goto('./alfabe/');
  await trambolinAc(page);
  await expect(page.locator('.ho')).toHaveAttribute('data-tur','2');
  await expect(page.locator('.ho')).toHaveAttribute('data-asama','sirala');
  await expect(page.locator('.tr-kok')).toBeHidden();
  await expect(page.locator('.ho-tas')).toHaveText(['lık','ba']);
  // 2–3 yaş: Hece Oyunu kartı doğrudan trambolini açar; ikinci sözcük de zıplanır, sonra oyun biter.
  await page.evaluate(()=>localStorage.setItem('minkino-kartlar-v1',JSON.stringify({yas:3})));
  await page.reload();
  await page.locator('.at-hece-ac').click();
  await expect(page.locator('.ho')).toHaveAttribute('data-tur','2');
  await expect(page.locator('.ho')).toHaveAttribute('data-asama','alkis');
  await expect(page.locator('.tr-yay:visible')).toHaveCount(3);
  await yay(page,1).click();
  await yay(page,2).click();
  await page.getByRole('button',{name:'Devam et'}).click();
  await expect(page.locator('.ho-tam strong')).toHaveText('balık');
  await expect(page.getByRole('button',{name:'Oyunlara dön'})).toBeVisible();
  await expect(page.locator('.ho-tas')).toHaveCount(0);
});

test('Son hece zıplandıktan sonra yenileme sözcüğü korur, bitince yeni tur başlar',async({page})=>{
  await page.goto('./alfabe/');
  await page.evaluate(()=>localStorage.setItem('minkino-bagimsiz-hece-v1',JSON.stringify({
    rota:['06','02','18'],tur:2,asama:'alkis',sira:2,taslar:[]
  })));
  await trambolinAc(page);
  await expect(page.locator('.ho-yuva')).toHaveText(['o','to','']);
  await yay(page,3).click();
  const ileri=page.getByRole('button',{name:'Devam et'});
  await expect(ileri).toBeVisible();
  await ileri.click();
  await expect(page.locator('.ho')).toHaveAttribute('data-asama','sonuc');
  await page.reload();
  await trambolinAc(page);
  await expect(page.locator('.ho-tam strong')).toHaveText('otobüs');
  await page.getByRole('button',{name:'Oyunlara dön'}).click();
  const trambolin=page.getByRole('button',{name:'Hece Trambolini'});
  await expect(trambolin).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('minkino-bagimsiz-hece-v1'))).toBeNull();
  await page.evaluate(()=>localStorage.setItem('minkino-bagimsiz-hece-v1','{bozuk'));
  await trambolin.click();
  await expect(page.locator('.ho')).toHaveAttribute('data-tur','1');
  await expect(page.locator('.ho')).toHaveAttribute('data-asama','alkis');
});

test('eski sürümün yarım kaydı yeni akışta açılır: taş dizmedeki sözcük taşlarla sürer',async({page})=>{
  // 18 Kasım öncesi her sözcük önce zıplanıp sonra dizilirdi; o sırada kalmış kayıt boşa gitmez.
  await page.goto('./alfabe/');
  await page.evaluate(()=>localStorage.setItem('minkino-bagimsiz-hece-v1',JSON.stringify({
    rota:['06','02','18'],tur:2,asama:'sirala',sira:2,taslar:['to','ma','büs','o']
  })));
  await trambolinAc(page);
  await expect(page.locator('.ho-yuva')).toHaveText(['o','to','']);
  await tas(page,'büs').click();
  await expect(page.locator('.ho-tam strong')).toHaveText('otobüs');
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
  await trambolinAc(page);
  const oyun=page.locator('.ho');
  const ileri=page.getByRole('button',{name:'Devam et'});
  // Takılan her kayıt 5 saniyede bırakılır: giriş yönergesi ve ilk hece bitince ikinci trambolin açılır.
  await yay(page,1).click();
  await yay(page,2).click();
  await expect(yay(page,2)).toBeDisabled();
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,value:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(5500);
  await expect(oyun).toHaveAttribute('data-asama','alkis');
  await expect(ileri).toBeHidden();
  await page.evaluate(()=>{
    delete (document as {hidden?:boolean}).hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(ileri).toBeVisible({timeout:14000});
  await ileri.click({timeout:14000});
  await expect(oyun).toHaveAttribute('data-asama','sonuc');
  await expect(page.getByRole('button',{name:'Sonraki sözcük'})).toBeEnabled({timeout:14000});
});

test('depolama dolunca rafa dönüp açılan derste ve hece oyununda son hamle korunur',async({page})=>{
  await page.addInitScript(()=>{
    // 5+ yaşın dersinde boyama yok (18 Kasım 2026); ikinci harf küçük harf yazmasıyla denenir
    localStorage.setItem('minkino-alfabe-v1',JSON.stringify({adimlar:{'01':1,'02':2}}));
    Storage.prototype.setItem=()=>{throw new DOMException('Depolama dolu','QuotaExceededError');};
  });
  await page.goto('./alfabe/');
  const geri=page.locator('header .at-geri');
  await page.locator('[data-id="01"]').click();
  const defter=page.locator('.yz-iz svg');
  // Dar ekranda çocuğun defteri Ceren örneği gösterirken gizlidir; görününce kalem ilerletilir.
  await expect(defter).toBeVisible({timeout:15000});
  await defter.focus();await page.keyboard.press('Space');
  const iz=await defter.locator('.murekkep').first().getAttribute('d');
  expect(iz).toBeTruthy();
  await geri.click();await page.locator('[data-id="01"]').click();
  await expect(defter.locator('.murekkep').first()).toHaveAttribute('d',iz!);
  await geri.click();await page.locator('[data-id="02"]').click();
  await expect(defter).toBeVisible({timeout:15000});
  await defter.focus();await page.keyboard.press('Space');
  const kucukIz=await defter.locator('.murekkep').first().getAttribute('d');
  expect(kucukIz).toBeTruthy();
  await geri.click();await page.locator('[data-id="02"]').click();
  await expect(defter.locator('.murekkep').first()).toHaveAttribute('d',kucukIz!);
  await geri.click();await trambolinAc(page);
  await yay(page,1).click();
  await expect(yay(page,2)).toBeEnabled();
  const kelime=await page.locator('.ho').getAttribute('data-kelime');
  // Trambolinden geri düğmesi Hece Oyunu menüsüne döner.
  await geri.click();await page.getByRole('button',{name:'Hece Trambolini'}).click();
  await expect(page.locator('.ho')).toHaveAttribute('data-kelime',kelime!);
  await expect(page.locator('.tr-yay.tr-gecti')).toHaveCount(1);
});
