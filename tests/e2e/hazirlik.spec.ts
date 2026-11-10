import {expect,test} from '@playwright/test';
test('Sabah boyunca kıyafet, sandviç sırası ve meyve korunur',async({page})=>{
 test.setTimeout(60_000);
 await page.goto('./hazirlik/');
 const kayit=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-hazirlik-sabah-v1')!));
 const dokun=async(id:string)=>{
   const hedef=page.locator('#sahne:not([inert]) [data-action="'+id+'"]');
   await hedef.waitFor();
   const once = await kayit();
   await hedef.click();
   await expect.poll(kayit).not.toEqual(once);
 };
 await dokun('basla');await dokun('sari');await dokun('mutfaga');
 await expect(page.locator('[data-action=ekmek]')).toHaveCount(0);
 await dokun('domates');await dokun('geri-al');
 await expect(page.locator('[data-action=domates]')).toBeVisible();
 await expect(page.locator('[data-action=ekmek]')).toHaveCount(0);
 await dokun('peynir');await dokun('marul');
 await expect.poll(async()=>(await kayit()).ic).toEqual(['peynir','marul']);
 await page.reload();
 await dokun('ekmek');await dokun('paket');await dokun('armut');await dokun('kapak');
 const musluk=page.getByRole('button',{name:'Musluğu aç, matarayı doldur'});
 const nokta=await musluk.boundingBox();
 await page.mouse.move(nokta!.x+nokta!.width/2,nokta!.y+nokta!.height/2);
 await page.mouse.down();await page.waitForTimeout(650);await page.mouse.up();
 const kismi=(await kayit()).su;
 expect(kismi).toBeGreaterThan(0);expect(kismi).toBeLessThan(1);
 await page.reload();expect((await kayit()).su).toBe(kismi);
 await musluk.click();await dokun('matara-kapat');
 await dokun('cebe');await dokun('cantaya');
 const kapak=await page.locator('[data-action=cantayi-kapat]').boundingBox();
 const orta=kapak!.x+kapak!.width/2, ust=kapak!.y+kapak!.height*.2;
 await page.mouse.move(orta,ust);await page.mouse.down();
 await page.mouse.move(orta,ust+kapak!.height*.4,{steps:6});await page.mouse.up();
 await expect(page.locator('[data-id=sari]')).toBeVisible();
 await dokun('as');await dokun('beslenme');await dokun('pecete-ser');
 await dokun('ac');await dokun('meyve-servis');await dokun('servis');
 await page.getByRole('button',{name:'Mataradan bardağa su doldur'}).click();
 await dokun('ye');
 await expect(page.locator('[data-id=tok-sari]')).toBeVisible();
 await dokun('bir-yudum');await dokun('meyve-isir');
 await dokun('kalani-sakla');await page.reload();
 await expect(page.locator('[data-id=sandvic-gozu] svg')).toBeVisible();
 await dokun('okul-kutusu-kapat');
 await expect.poll(()=>page.locator('[data-action=kutuyu-kaldir] img').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 await dokun('kutuyu-kaldir');
 expect(await kayit()).toMatchObject({meyve:'armut',ic:['peynir','marul'],sahne:'son'});
 await dokun('derse-gir');await expect(page.locator('.sira-kino img').first()).toHaveAttribute('src',/kino-sari/);
 await page.getByRole('button',{name:'Kino’nun defterini aç'}).click();
 await expect(page.locator('.ders-kagit')).toBeVisible();
});

test('Elma ile önce meyve yenebilir, tekrar açınca aynı lokmadan sürer',async({page})=>{
 await page.goto('./hazirlik/');
 await page.evaluate(()=>localStorage.setItem('minkino-hazirlik-sabah-v1',JSON.stringify({
   sahne:'tat',renk:'yesil',ic:['domates'],meyve:'elma',paket:true,serviste:true,
   meyveTabakta:true,bardak:1,su:1,peceteSerili:true,asili:true,acik:true,
 })));
 await page.reload();
 const button=(key:string)=>page.locator('[data-action="'+key+'"]');
 await expect(page.locator('[data-id=tok-yesil]')).toBeVisible();
 await button('meyve-isir').dragTo(page.locator('[data-id=agiz]'),{targetPosition:{x:1,y:1},force:true});
 await expect(page.locator('[data-id=artan-meyve] svg')).toBeVisible();
 await page.reload();
 await expect(button('meyve-isir')).toHaveCount(0);
 await button('bir-yudum').click();
 await expect(button('kalani-sakla')).toBeVisible();
 await button('kalani-sakla').click();
 await button('okul-kutusu-kapat').click();
 await button('kutuyu-kaldir').click();
 await expect(button('derse-gir')).toBeVisible();
});

test('Defter parmak izini saklar, aralıklı çizgiyi ve ters yönde yuvarlağı tanır',async({page})=>{
  await page.goto('./hazirlik/?ders=1');
  const sahne=page.locator('#sahne'), kagit=page.locator('.ders-kagit');
  const dokunmatik=await page.context().newCDPSession(page);
  const not=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-hazirlik-ders-v1')!));
  await page.getByRole('button',{name:'Kino’nun defterini aç'}).click();
  const iz=async(points:number[][])=>{
    const p=await kagit.evaluate((el,ps)=>ps.map(([x,y])=>{
      const nokta=new DOMPoint(x,y).matrixTransform((el as SVGSVGElement).getScreenCTM()!);return [nokta.x,nokta.y];
    }),points);
    for(const [i,[x,y]] of p.entries()){
      await dokunmatik.send('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[{x,y,id:0}]});
    }
    await dokunmatik.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  await iz([[180,145]]);await iz([[45,66],[60,74],[60,89]]);
  await expect(sahne).toHaveAttribute('data-sahne','cizgi');
  await page.getByRole('button',{name:'Son çizgiyi sil'}).click();
  await page.getByRole('button',{name:'Turkuaz boya'}).click();
  await iz([[177,246],[181,230],[179,207],[184,199]]);
  const ilk=(await not()).izler[0];await page.reload();
  await expect(sahne).toHaveAttribute('data-sahne','cizgi');
  expect((await not()).izler[0]).toEqual(ilk);
  await iz([[184,199],[183,180],[176,163],[181,144]]);
  await expect(sahne).toHaveAttribute('data-sahne','yuvarlak');
  await page.getByRole('button',{name:'Mor boya'}).tap();
  await expect(page.getByRole('button',{name:'Mor boya'})).toHaveAttribute('aria-pressed','true');
  const cember=Array.from({length:39},(_,i)=>{
    const a=Math.PI/2-i*2*Math.PI/38;
    return [180+Math.cos(a)*(56+Math.sin(a*3)*3),90+Math.sin(a)*54];
  });
  await iz(cember);await expect(sahne).toHaveAttribute('data-sahne','resim');
  await page.reload();expect((await not()).izler.map((i:{renk:number})=>i.renk)).toEqual([1,1,2]);
  await expect(page.locator('.murekkep path')).toHaveCount(3);
  expect(await page.evaluate(()=>localStorage.getItem('minkino-hazirlik-sabah-v1'))).toBeNull();
  await page.getByRole('button',{name:'Yeni bir balon çiz'}).click();
  await expect(sahne).toHaveAttribute('data-sahne','cizgi');
  expect((await not()).izler).toEqual([]);
});

test('Sınıf dersinde sayma, şekil çizme ve örüntü aynı defterde tamamlanır',async({page})=>{
  test.setTimeout(120_000);
  await page.goto('./hazirlik/?ders=sinif');
  await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  const tus=(k:string)=>page.locator('[data-et="'+k+'"]');
  const masa=page.locator('.et-masa');
  const durum=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-hazirlik-etkinlik-v1')!).ders);
  const turler=['meyve','yuvarlak','bahce','muzik','ucgen','deniz','kalemlik','kare','orman'];
  const dokunmatik=await page.context().newCDPSession(page);
  const ciz=async(noktalar:number[][])=>{
    const px=await page.locator('.et-kagit').evaluate((el,pts)=>pts.map(([x,y])=>{const p=new DOMPoint(x,y).matrixTransform((el as SVGSVGElement).getScreenCTM()!);return {x:p.x,y:p.y}}),noktalar);
    for(const [i,p] of px.entries())await dokunmatik.send('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[{...p,id:0}]});
    await dokunmatik.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  for(const [tur,set] of turler.entries()){
    await expect(masa).toHaveAttribute('data-tur',set);
    await expect(page.locator('.et-palet img')).toHaveCount(6);
    await expect.poll(()=>page.locator('.et-palet img').evaluateAll(es=>es.every(el=>(el as HTMLImageElement).naturalWidth>0))).toBeTruthy();
    const sinirlar=await page.locator('.et-palet img').evaluateAll(es=>es.every(el=>{
      const kutu=el.closest('.et-alt')!.getBoundingClientRect(),r=el.getBoundingClientRect();
      return r.top>=kutu.top-1&&r.bottom<=kutu.bottom+1;
    }));
    expect(sinirlar).toBe(true);
    if(tur===2){
      await page.locator('.sira-mino').tap();
      const yerinde=await page.locator('.sira-mino .et-soz-pozu img').first().evaluate(el=>{
        const r=el.getBoundingClientRect(),s=el.closest('.sira-mino')!.getBoundingClientRect();
        return r.width>0 && r.left>=s.left-1 && r.right<=s.right+1 && r.bottom<=s.bottom+1;
      });
      expect(yerinde).toBe(true);
    }
    if(tur%3===0){
      const n=2+tur/3;await tus('nesne-'+(tur%6)).tap();
      if(n>2)await expect(tus('adet-'+n)).toBeVisible();
      await tus('say-0').tap();await expect(tus('say-0')).toBeDisabled();
      await page.reload();await expect(tus('say-0')).toBeDisabled();
      if(n!==4)for(let i=1;i<n;i++)await tus('say-'+i).tap();
      await expect(page.locator('.et-tahta .tahta-noktalar')).toHaveCount(0);
      await tus('adet-'+(n+1)).tap();expect((await durum()).onay).toBe(false);
      await tus('adet-'+n).tap();
    }else if(tur%3===1){
      await tus('nesne-5').tap();expect((await durum()).isaret).toHaveLength(0);
      for(const i of [2,0,1])await tus('nesne-'+i).tap();
      if(set!=='yuvarlak'){
        await tus('boya-2').tap();
        const pts=set==='ucgen'?[[180,38],[97,124],[263,124],[180,38]]:[[113,124],[247,124],[247,258],[113,258],[113,124]];
        const once=(await durum()).izler.length;
        await ciz([[40,78],[60,60]]);await tus('sil-son').tap();
        expect((await durum()).izler).toHaveLength(once);
        await ciz(pts.slice(0,2));await expect(page.locator('.et-kagit')).toBeVisible();
        await page.reload();await ciz(pts.slice(1));
        expect((await durum()).izler.filter((i:{asama:string})=>i.asama===set)).toHaveLength(2);
      }
    }else{
      const dizi=set==='bahce'?[0,1]:set==='deniz'?[1,0,2]:[0,1,0];
      await expect(page.locator('.et-tahta img')).toHaveCount(0);
      await expect(page.locator('.et-boncuk')).toHaveCount(1);
      await tus('nesne-3').tap();expect((await durum()).sira).toBe(0);
      for(const i of dizi)await tus('nesne-'+i).tap();
    }
    await expect(tus('ileri')).toBeVisible();await tus('ileri').tap();
  }
  await expect(masa).toHaveAttribute('data-tur','tohum');
  await tus('nesne-2').tap();expect((await durum()).sira).toBe(0);
  await tus('nesne-0').tap();await page.reload();await expect(tus('nesne-0')).toBeDisabled();
  await tus('nesne-1').tap();await tus('nesne-2').tap();expect((await durum()).sira).toBe(2);
  await tus('nesne-3').tap();await tus('nesne-2').tap();await tus('ileri').tap();
  await expect(masa).toHaveAttribute('data-tur','ritim');
  await expect(tus('nesne-0')).toBeDisabled();await tus('ornek').tap();
  await expect(tus('nesne-0')).toBeEnabled();await tus('nesne-3').tap();
  expect((await durum()).sira).toBe(0);
  await tus('nesne-0').tap();await page.reload();await tus('ornek').tap();
  await expect(tus('nesne-1')).toBeEnabled();await tus('nesne-1').tap();await tus('nesne-3').tap();
  await expect(tus('ileri')).toHaveCount(0);await expect(tus('nesne-1')).toBeDisabled();
  await tus('ornek').tap();await tus('nesne-1').tap();await tus('nesne-0').tap();await page.reload();
  expect((await durum()).ikinciRitim).toBe(true);expect((await durum()).sira).toBe(2);
  await tus('nesne-0').tap();await tus('nesne-3').tap();await tus('ileri').tap();
  await expect(masa).toHaveAttribute('data-tur','harf');
  await ciz([[91,214],[91,66],[180,162],[269,66],[269,214]]);await tus('kart-bitti').tap();
  await expect(masa).toHaveAttribute('data-tur','resim');
  await ciz([[133,100],[140,80],[158,79],[168,102],[133,100]]);await tus('kart-bitti').tap();
  await expect(masa).toHaveAttribute('data-tur','defter');
  await expect(page.locator('.et-son .oyuncak-dugme')).toHaveCount(4);
  await tus('dinle').tap();await expect(masa).toHaveAttribute('data-tur','defter');
  await expect(page.locator('.kart-hatira path')).toHaveCount(2);await tus('yaprak').tap();
  await expect(page.locator('.ev-kagidi .murekkep path')).toHaveCount(4);
  await expect(page.locator('.et-kayit-satiri img')).toHaveCount(9);
  expect((await durum()).saydiklarim).toEqual([0,3,0]);
  await page.reload();await expect(masa).toHaveAttribute('data-tur','defter');
  await tus('senlige').tap();await expect(masa).toHaveAttribute('data-tur','pano');
  await page.locator('[data-pano=goster]').tap();await page.locator('[data-pano=gec]').tap();
  await page.locator('[data-pano=defter]').tap();await tus('senlige').tap();
  await expect(masa).toHaveAttribute('data-durum','diger');await page.locator('[data-pano=defter]').tap();
  await tus('tekrar').tap();await expect(masa).toHaveAttribute('data-tur','meyve');
  expect((await durum()).izler).toEqual([]);
});

test('Defterde harf ve serbest resim dokunarak yazılır ve yeniden açıldığında saklanır',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('./hazirlik/?ders=defter');
  await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  const tus=(id:string)=>page.locator('[data-et="'+id+'"]');
  const kalem=await page.context().newCDPSession(page);
  async function ciz(pts:number[][]){
    const konum=await page.locator('.et-kagit').evaluate((el,pts)=>pts.map(([x,y])=>{const p=new DOMPoint(x,y).matrixTransform((el as SVGSVGElement).getScreenCTM()!);return {x:p.x,y:p.y}}),pts);
    for(const [i,p] of konum.entries())await kalem.send('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[{...p,id:0}]});
    await kalem.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  await expect(tus('kart-bitti')).toBeDisabled();
  await ciz([[44,35],[72,32]]);await expect(tus('kart-bitti')).toBeDisabled();await tus('sil-son').tap();
  await ciz([[91,214],[91,66],[180,162]]);await page.reload();
  await expect(page.locator('.murekkep path')).toHaveCount(1);
  await ciz([[180,162],[269,66],[269,214]]);await tus('kart-bitti').tap();
  await expect(tus('kart-bitti')).toBeDisabled();await tus('boya-2').tap();
  await ciz([[120,180],[138,125],[158,180]]);await tus('sil-son').tap();await expect(tus('kart-bitti')).toBeDisabled();
  await ciz([[120,180],[138,125],[158,180]]);await ciz([[200,120],[211,98],[226,120]]);
  await page.reload();await expect(page.locator('.murekkep path')).toHaveCount(2);
  await tus('kart-bitti').tap();await page.reload();
  await expect(page.locator('.kart-hatira').nth(0).locator('path')).toHaveCount(2);
  await expect(page.locator('.kart-hatira').nth(1).locator('path').first()).toHaveAttribute('stroke','#795aa3');
  await tus('tekrar').tap();await expect(page.locator('.et-masa')).toHaveAttribute('data-tur','harf');
  await expect(tus('kart-bitti')).toBeDisabled();
});

test('Panoya yalnız iki farklı boyalı ve ipli balon asılır; masadaki çizim düzeltilebilir',async({page})=>{
  test.setTimeout(100_000);
  await page.setViewportSize({width:390,height:844});await page.goto('./hazirlik/?ders=pano');
  await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  const t=(v:string)=>page.locator('[data-pano="'+v+'"]'),masa=page.locator('.pano-atolye'),tuval=page.locator('.pano-tuval');
  const durum=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-hazirlik-pano-v1')!).ders.pano);
  const kalem=await page.context().newCDPSession(page);
  const ciz=async(noktalar:number[][])=>{
    const r=(await tuval.boundingBox())!;
    for(const [i,[x,y]] of noktalar.entries())await kalem.send('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[{x:r.x+x*r.width/600,y:r.y+y*r.height/400,id:0}]});
    await kalem.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  const daire=(x:number)=>Array.from({length:25},(_,i)=>[x+55*Math.cos(i*Math.PI/12),148+70*Math.sin(i*Math.PI/12)]);
  const dene=async(eksik:string)=>{await t('goster').tap();await expect(masa).toHaveAttribute('data-durum','inceleme');expect((await durum()).eksik).toBe(eksik)};
  await dene('sekil');await t('gec').tap();await expect(masa).toHaveAttribute('data-durum','diger');
  expect((await durum()).hamleler).toHaveLength(0);await t('yenile').tap();
  await t('rehber').tap();await ciz(daire(162));await ciz(daire(411).slice(0,13));await ciz(daire(411).slice(12));
  await dene('eksik_boya');await t('onar').tap();await t('kova').tap();
  await ciz([[70,65]]);expect((await durum()).hamleler).toHaveLength(3);
  await ciz([[162,148]]);await ciz([[411,148]]);await dene('ayni');await t('onar').tap();
  await t('renk-3').tap();await ciz([[411,148]]);await t('geri').tap();
  await dene('ayni');await t('onar').tap();await ciz([[411,148]]);
  await t('kalem').tap();await ciz([[162,217],[144,264],[166,316]]);await page.reload();
  await dene('ip');await t('onar').tap();await ciz([[450,255],[461,314]]);await dene('ip');
  await t('onar').tap();await t('geri').tap();await ciz([[411,217],[435,260],[420,311]]);
  await t('goster').tap();await expect(masa).toHaveAttribute('data-durum','kazandi');
  // kalıcı sınıf panosu: asılan resim yeni resme geçince de, sayfa yenilenince de panoda kalır
  const asili=page.locator('.pano-asili');
  await expect(masa).toHaveAttribute('data-duvar','true');await expect(asili).toHaveCount(1);
  await page.reload();await expect(masa).toHaveAttribute('data-durum','kazandi');await expect(asili).toHaveCount(1);
  await t('yenile').tap();await expect(masa).toHaveAttribute('data-durum','cizim');await expect(t('pano')).toContainText('1');
  await t('pano').tap();await expect(asili).toHaveCount(1);
  await asili.first().tap();await expect(page.locator('.pano-asili.tek')).toHaveCount(1);
  await t('ciz').tap();await expect(tuval).toBeVisible();
});

test('Önceki sürümde biten balon defterinden sınıf dersine geçilir',async({page})=>{
  await page.goto('./hazirlik/?ders=1');
  await page.evaluate(()=>localStorage.setItem('minkino-hazirlik-ders-v1',JSON.stringify({
    sahne:'resim',renk:'sari',ic:['peynir'],paket:true,meyve:'elma',
    izler:[{asama:'cizgi',renk:2,noktalar:[[183,145],[177,243]]}],
  })));
  await page.reload();await page.getByRole('button',{name:'Ceren ile saymaya başla'}).tap();
  await expect(page.locator('.et-masa')).toHaveAttribute('data-tur','meyve');
  await expect(page.locator('.sira-kino .kare').first()).toHaveAttribute('src',/kino-sari/);
  const kayit=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-hazirlik-ders-v1')!));
  expect(kayit.izler[0].noktalar).toEqual([[183,145],[177,243]]);
});
