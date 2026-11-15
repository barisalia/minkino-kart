import {expect,test} from '@playwright/test';
import {omletKivami,omletPuani,omletiOku,type Omlet} from '../../sef/src/omlet-tarifi';

for(const anne of [false,true]){
  test((anne?'Anne':'Kino')+' omlet siparişini alır, çocuk pişirir ve jetonu kazanır',async({page},info)=>{
    test.setTimeout(85000);
    await page.setViewportSize(anne?{width:568,height:320}:{width:844,height:390});
    const kim=anne?'anne':'kino',menu=kim+'-omleti';
    await page.routeWebSocket(url=>url.port==='5173',()=>{});
    await page.goto('./sef/?giris=tepsiler&siparis='+menu);
    await page.getByRole('button',{name:'Omlet eksik tabağı hazırla'}).tap();
    const sahne=page.getByRole('region',{name:'Omlet tavası'});
    const ses=page.waitForResponse(r=>r.url().includes('/omlet/kir.mp3')&&r.ok());
    await sahne.getByRole('button',{name:'Bu adımı dinle'}).tap();await ses;
    await sahne.getByRole('button',{name:'1. yumurtayı kâseye kır'}).tap();
    await expect(sahne.locator('.om-yumurta')).toHaveCount(1);
    await sahne.getByRole('button',{name:'2. yumurtayı kâseye kır'}).tap();
    await expect(sahne).toHaveAttribute('data-evre','cirp');
    const c=(await sahne.locator('.om-cirp').boundingBox())!;
    const centerX=c.x+c.width/2,centerY=c.y+c.height/2,r=c.width*.22;
    const touch=await page.context().newCDPSession(page);
    const dokun=(type:'touchStart'|'touchMove'|'touchEnd',x=0,y=0)=>touch.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
    await dokun('touchStart',centerX+r,centerY);
    for(let j=1;j<=78;j++)await dokun('touchMove',centerX+Math.cos(j*.2)*r,centerY+Math.sin(j*.2)*r);
    await dokun('touchEnd');
    await sahne.getByRole('button',{name:'Çırpılmış yumurtayı tavaya dök'}).tap();
    await expect(sahne).toHaveAttribute('data-evre','ic');
    const alan=sahne.locator('.om-yerlestir'),hedef=(await alan.boundingBox())!;
    const koy=async(tur:string,x:number,y:number)=>{
      await sahne.locator('[data-ic="'+tur+'"]').tap();
      await page.touchscreen.tap(hedef.x+hedef.width*x,hedef.y+hedef.height*y);
    };
    await koy('zeytin',.78,.5);
    await expect(alan.locator('.om-ic')).toHaveCount(0);
    const icler=anne?['biber','mantar']:['peynir','domates'];
    await koy(icler[0],.25,.5);await koy(icler[1],.38,.62);
    if(anne){
      await koy('zeytin',.3,.35);
      const zeytin=alan.locator('.om-ic[data-tur=zeytin]'),kap=sahne.locator('[data-ic=zeytin]');
      const c=(await kap.boundingBox())!,a=(await zeytin.boundingBox())!;
      await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
      await page.mouse.move(c.x+c.width/2,c.y+c.height/2,{steps:10});
      await expect(kap).toHaveAttribute('data-iade','uzerinde');
      const kop=(await sahne.locator('.om-kaldirilan').boundingBox())!;
      expect(Math.abs(kop.x+kop.width/2-c.x-c.width/2)).toBeLessThan(2);
      await page.mouse.up();await expect(zeytin).toHaveCount(0);
      const e=(await alan.locator('.om-ic').first().boundingBox())!;
      await page.mouse.move(e.x+e.width/2,e.y+e.height/2);await page.mouse.down();
      await page.mouse.move(hedef.x+hedef.width*.27,hedef.y+hedef.height*.32,{steps:10});await page.mouse.up();
    }
    await page.reload();
    await expect(alan.locator('.om-ic')).toHaveCount(2);
    if(anne)expect(await alan.locator('.om-ic').first().evaluate(el=>parseFloat((el as HTMLElement).style.top))).toBeCloseTo(32,0);
    await sahne.getByRole('button',{name:'Ocağı yak'}).tap();
    await expect(sahne).toHaveAttribute('data-kivam',anne?'koyu':'altin',{timeout:15000});
    await sahne.locator('.om-katla').tap();
    await sahne.getByRole('button',{name:'Omleti servis tabağına al'}).tap();
    const fiş=page.getByRole('button',{name:'Omlet siparişi ile tabağı karşılaştır'});
    const duy=page.waitForResponse(r=>r.url().includes('/salon/'+kim+'-omlet-'+(anne?'gec':'tam')+'.mp3')&&r.ok());
    await fiş.tap();await duy;
    const panel=page.getByRole('dialog');
    await expect(panel.locator('.sef-yildizlar')).toHaveAttribute('data-puan',anne?'2':'3');
    const siparis=page.waitForResponse(r=>r.url().includes('/salon/'+kim+'-restoran-'+menu+'.mp3')&&r.ok());
    await panel.getByRole('button',{name:'Müşterinin isteğini dinle'}).tap();await siparis;
    if(anne){
      await expect(panel.getByRole('img',{name:'Fazla kızarmış'})).toHaveAttribute('data-durum','fark');
      await page.screenshot({path:info.outputPath('omlet-tadim.png')});
      await panel.getByRole('button',{name:'Omlet tekrar pişir'}).tap();
      await expect(sahne).toHaveAttribute('data-evre','pisir');
      await expect(sahne.locator('.om-tava-ici .om-ic')).toHaveCount(2);
      await sahne.locator('.om-katla').tap();
      await sahne.getByRole('button',{name:'Omleti servis tabağına al'}).tap();
      await fiş.tap();await expect(panel.locator('.sef-yildizlar')).toHaveAttribute('data-puan','3');
    }
    await panel.getByRole('button',{name:'Tepsiye dön'}).tap();
    await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
    await expect(page.getByRole('button',{name:'3 jeton kazanıldı'})).toBeVisible();
  });
}

test('Omlette farklı malzemeler ve süre ayrı ayrı puanı değiştirir',()=>{
  const t:Omlet={evre:'sun',yumurta:2,cirpma:1,sure:5000,icler:[{tur:'domates',x:30,y:45},{tur:'peynir',x:30,y:65}]};
  expect(omletiOku(t)).toEqual(t);
  expect(omletPuani(t,'kino-omleti')).toBe(3);
  expect(omletPuani({...t,icler:t.icler.slice(0,1)},'kino-omleti')).toBe(2);
  expect(omletPuani({...t,icler:t.icler.slice(0,1),sure:9000},'kino-omleti')).toBe(1);
  expect([4399,4400,8499,8500].map(omletKivami)).toEqual(['yumusak','altin','altin','koyu']);
});
