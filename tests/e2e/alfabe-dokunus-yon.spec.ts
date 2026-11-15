import { test, expect, type CDPSession } from '@playwright/test';

type Nokta = {x:number; y:number};
test('dar ekranda Ö harfinin iki noktası da çocuğun defterine dokunur',async({page})=>{
  await page.setViewportSize({width:320,height:640});
  await page.addInitScript(()=>localStorage.setItem('minkino-alfabe-v1',JSON.stringify({adimlar:{'19':1}})));
  await page.goto('./alfabe/');
  await page.locator('[data-id="19"]').click();
  const defter=page.locator('.yz-iz svg');
  const hedefler=await defter.locator('.iz').evaluateAll(izler=>izler.slice(1).map(el=>{
    const yol=el as SVGPathElement;
    const p=yol.getPointAtLength(0).matrixTransform(yol.getScreenCTM()!);
    return yol.ownerSVGElement!.contains(document.elementFromPoint(p.x,p.y));
  }));
  expect(hedefler).toEqual([true,true]);
});
const bekle = (ms:number) => new Promise(resolve => setTimeout(resolve,ms));

async function parmak(cdp:CDPSession,tur:'touchStart'|'touchMove'|'touchEnd',nokta?:Nokta) {
  await cdp.send('Input.dispatchTouchEvent',{
    type:tur,touchPoints:nokta?[{...nokta,id:1,force:.6,radiusX:5,radiusY:5}]:[]
  });
}

test('Parmak kalkmadan telefonu çevirince boyaya çizgi eklenmez ve kutu lokma yutmaz',async({page,context,browserName})=>{
  test.skip(browserName!=='chromium','CDP dokunuşu Chromium tarayıcısında doğrulanır.');
  await page.addInitScript(()=>localStorage.setItem('minkino-alfabe-v1',JSON.stringify({adimlar:{'01':6,'02':3}})));
  await page.setViewportSize({width:390,height:844});
  await page.goto('./alfabe/');
  await page.locator('.at-harf[data-id="01"]').tap();
  const cdp=await context.newCDPSession(page);
  const noktalar=await page.locator('.boy-zemin').first().evaluate(el=>{
    const yol=el as unknown as SVGPathElement;
    return Array.from({length:11},(_,i)=>{
      const p=yol.getPointAtLength(4+3*i).matrixTransform(yol.getScreenCTM()!);
      return {x:p.x,y:p.y};
    });
  });
  await parmak(cdp,'touchStart',noktalar[0]);
  for(const nokta of noktalar.slice(1)){await bekle(65);await parmak(cdp,'touchMove',nokta);}
  // Chromium son dokunuşu bir sonraki çizim karesine birleştirebilir.
  await page.evaluate(()=>new Promise<void>(tamam=>requestAnimationFrame(()=>requestAnimationFrame(()=>tamam()))));
  const murekkep=page.locator('.boy-murekkep');
  const iz=await murekkep.innerHTML();
  expect(iz).toContain('path');
  await page.setViewportSize({width:844,height:390});
  await bekle(280);
  const kagit=(await page.locator('.boy-harf').boundingBox())!;
  await parmak(cdp,'touchMove',{x:kagit.x+.72*kagit.width,y:kagit.y+.64*kagit.height});
  await parmak(cdp,'touchEnd');
  expect(await murekkep.innerHTML()).toBe(iz);
  await page.locator('.at-geri').tap();
  await page.locator('.at-harf[data-id="02"]').tap();
  const kart=page.locator('.hk-kart[data-kart="02"]');
  const r=(await kart.boundingBox())!,bas={x:r.x+r.width/2,y:r.y+r.height/2};
  await parmak(cdp,'touchStart',bas);
  for(let i=1;i<9;i++){await bekle(60);await parmak(cdp,'touchMove',{x:bas.x+2*i,y:bas.y+i});}
  await expect(page.locator('.hk-tasinan')).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await bekle(280);
  const kutu=(await page.locator('.hk-kutu').boundingBox())!;
  await parmak(cdp,'touchMove',{x:kutu.x+kutu.width/2,y:kutu.y+kutu.height*.45});
  await parmak(cdp,'touchEnd');
  await expect(kart).toBeEnabled();
  await expect(page.locator('.hk-tasinan,.hk-alindi,.hk-lokmalar img')).toHaveCount(0);
  await kart.tap();
  await expect(page.locator('.hk[data-lokma="2"]')).toBeVisible({timeout:12000});
});

test('mikrofon yardımında yarım tutuş ekran dönerken iptal olur, resim cebi klavyeyle de çalışır',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('minkino-alfabe-v1',JSON.stringify({adimlar:{'02':0}}));
    Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{throw new DOMException('İzin yok','NotAllowedError');}});
  });
  await page.setViewportSize({width:390,height:844});
  await page.goto('./alfabe/');
  await page.locator('[data-id="02"]').click();
  const cep=page.locator('.alf-resim-cebi'),alan=page.locator('.alf-soyle');
  await cep.focus();
  for(let i=0;i<3;i++)await page.keyboard.press('Enter');
  await expect(alan).toHaveAttribute('data-durum','ornek');
  await expect(alan).toHaveAttribute('data-durum','yardim',{timeout:14000});
  const r=(await cep.boundingBox())!;
  await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
  await bekle(190);await page.setViewportSize({width:844,height:390});
  await bekle(800);await page.mouse.up();
  await expect(alan).toHaveAttribute('data-durum','yardim');
  await expect(page.locator('.alf-dolgu')).toHaveAttribute('height','0');
  await cep.focus();await page.keyboard.press('Space');
  await expect(alan).toHaveAttribute('data-durum','yardim');
  await page.keyboard.press('Enter');await page.keyboard.press('Space');
  await expect(page.locator('.yz-iz svg')).toBeVisible({timeout:10000});
});
