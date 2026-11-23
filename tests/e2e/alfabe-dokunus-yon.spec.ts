import { test, expect, type CDPSession } from '@playwright/test';

type Nokta = {x:number; y:number};
test('dar ekranda Ö harfinin iki noktası da çocuğun defterine dokunur',async({page})=>{
  await page.setViewportSize({width:320,height:640});
  await page.addInitScript(()=>localStorage.setItem('minkino-alfabe-v1',JSON.stringify({adimlar:{'19':1}})));
  await page.goto('./alfabe/');
  await page.locator('[data-id="19"]').click();
  const defter=page.locator('.yz-iz svg');
  // Dar ekranda çocuğun defteri Ceren örneği gösterirken gizlidir (0×0; noktalar o an başlığın altına düşer).
  await expect(defter).toBeVisible({timeout:15000});
  await expect.poll(()=>defter.locator('.iz').evaluateAll(izler=>izler.slice(1).map(el=>{
    const yol=el as SVGPathElement;
    const p=yol.getPointAtLength(0).matrixTransform(yol.getScreenCTM()!);
    return yol.ownerSVGElement!.contains(document.elementFromPoint(p.x,p.y));
  }))).toEqual([true,true]);
});
const bekle = (ms:number) => new Promise(resolve => setTimeout(resolve,ms));

async function parmak(cdp:CDPSession,tur:'touchStart'|'touchMove'|'touchEnd',nokta?:Nokta) {
  await cdp.send('Input.dispatchTouchEvent',{
    type:tur,touchPoints:nokta?[{...nokta,id:1,force:.6,radiusX:5,radiusY:5}]:[]
  });
}

test('Parmak kalkmadan telefonu çevirince boyaya çizgi eklenmez ve kutu lokma yutmaz',async({page,context,browserName})=>{
  test.skip(browserName!=='chromium','CDP dokunuşu Chromium tarayıcısında doğrulanır.');
  // boyama ve Obur'un Tabağı 2–3 yaşın dersinde (18 Kasım 2026: ders kısaldı; alfabe/src/main.ts → dersAdimlari)
  await page.addInitScript(()=>{
    localStorage.setItem('minkino-kartlar-v1',JSON.stringify({yas:3}));
    localStorage.setItem('minkino-alfabe-v1-yas-2-3',JSON.stringify({adimlar:{'01':6,'02':3}}));
  });
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

// Söyle adımı (18 Kasım 2026): resim cebini basılı tutma kalktı. Mikrofon açılmazsa çocuğa iki düğme çıkar:
// "Mikrofonla dene" (Ceren örneği yeniden söyler) ve "Dokunarak devam et" (resim dolar, ders sürer).
// Ceren'in örnek kaydı ve mikrofon denemesi bilgisayar yüklüyken uzayabilir; test süreye değil sahnenin durumuna bakar,
// tavan geniştir (yükte oynaklık, 20 Kasım).
const YARDIM_BEKLE=40_000;
test('mikrofon açılmazsa Söyle adımı dokunarak sürer, ekran dönünce yardım yerinde kalır, düğmeler klavyeyle de çalışır',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('minkino-alfabe-v1',JSON.stringify({adimlar:{'02':0}}));
    Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{throw new DOMException('İzin yok','NotAllowedError');}});
  });
  await page.setViewportSize({width:390,height:844});
  // Ses Kutusu (H14) açıkken mikrofonsuz çocuk doğrudan kutuya dokunur (alfabe-canlanma-anlari sınar); bu test eski yardım akışını sınar.
  await page.goto('./alfabe/?test=1&h14=0');
  await page.locator('[data-id="02"]').click();
  const alan=page.locator('.alf-soyle'),dolgu=page.locator('.alf-dolgu');
  const mik=page.getByRole('button',{name:'Mikrofonla dene'}),devam=page.getByRole('button',{name:'Dokunarak devam et'});
  await expect(alan).toHaveAttribute('data-durum','ornek');
  await expect(alan).toHaveAttribute('data-durum','yardim',{timeout:YARDIM_BEKLE});
  await expect(page.locator('.alf-soyle-durum')).toHaveText('Mikrofon açılamadı.');
  await expect(mik).toBeVisible();await expect(devam).toBeVisible();
  await page.setViewportSize({width:844,height:390});
  // Ekran döndü: yardım yerinde kalır (süreye değil duruma bakılır).
  await expect(alan).toHaveAttribute('data-durum','yardim');
  await expect(mik).toBeInViewport();await expect(devam).toBeInViewport();
  await mik.focus();await page.keyboard.press('Enter');
  await expect(alan).toHaveAttribute('data-durum','ornek');
  await expect(alan).toHaveAttribute('data-durum','yardim',{timeout:YARDIM_BEKLE});
  await expect(dolgu).toHaveAttribute('height','0');
  await devam.focus();await page.keyboard.press('Space');
  await expect(alan).toHaveAttribute('data-durum','dogru');
  await expect(dolgu).toHaveAttribute('height','132');
  // Dar ekranda çocuğun defteri Ceren örnek gösterirken gizlidir; görününce ders yazmaya geçmiştir.
  await expect(page.locator('.yz-iz svg')).toBeVisible({timeout:40000});
});
