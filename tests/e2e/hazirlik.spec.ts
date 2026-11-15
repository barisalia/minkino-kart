import {expect,test,type Page} from '@playwright/test';
test('Sabah boyunca kıyafet, sandviç sırası ve meyve korunur',async({page})=>{
 test.setTimeout(120_000);
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
 await page.locator('[data-kres="kapi-zili"]').tap();
 await expect(page.locator('[data-id=sari]')).toBeVisible();
 await expect(page.locator('.sinif-arkadaslari')).toHaveCount(0);
 await dokun('as');await expect(page.locator('.sinif-arkadaslari')).toHaveCount(0);await dokun('beslenme');await dokun('pecete-ser');
 await dokun('ac');await dokun('meyve-servis');await dokun('servis');
 await page.getByRole('button',{name:'Mataradan bardağa su doldur'}).click();
 await dokun('ye');
 await expect(page.locator('[data-id=tok-sari]')).toBeVisible();
 await dokun('bir-yudum');await dokun('meyve-isir');
 await dokun('kalani-sakla');await page.reload();
 await expect(page.locator('[data-id=sandvic-gozu] svg')).toBeVisible();
 await dokun('okul-kutusu-kapat');
 await expect.poll(()=>page.locator('[data-action=kutuyu-kaldir] img').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 await expect(page.locator('.sinif-arkadaslari')).toHaveCount(0);
 await dokun('kutuyu-kaldir');
 await expect(page.locator('.sinif-arkadaslari')).toHaveCount(0);
 expect(await kayit()).toMatchObject({meyve:'armut',ic:['peynir','marul'],sahne:'son'});
 // Okul günü: meyve paylaş, tohumu büyüt, bando, kolye; her adım kayda geçer.
 const kose=async(id:string)=>{await page.locator('[data-kres="'+id+'"]').tap()};
 await dokun('derse-gir');expect((await kayit()).sahne).toBe('anasinifi');
 await kose('mino');
 await expect(page.locator('[data-kres=istek-mino] img')).toHaveCount(2);
 for(let i=0;i<2;i++){await kose('sepet-0');await kose('tabak-mino')}
 await kose('arkadas-mino');
 for(let i=0;i<3;i++){await kose('sepet-2');await kose('tabak-zipzip')}
 await kose('arkadas-zipzip');expect((await kayit()).pay).toEqual([2,3]);
 await kose('sinifa');await kose('saksi');await kose('tohum');await kose('sula');await page.reload();
 await kose('pencere');await kose('saga');await kose('muzik');
 await expect(page.locator('[data-action^="cal-"]')).toHaveCount(0);
 await dokun('cal-1');expect((await kayit()).calinan).toBe(0);
 for(const tur of [[0,1],[0,3,1],[2,0,3,1]])for(const c of tur)await dokun('cal-'+c);
 expect((await kayit()).calinan).toBe(3);
 await expect(page.locator('[data-action^="cal-"]')).toHaveCount(6);await dokun('cal-5');
 await dokun('oyun-odasina');await kose('kolye');
 for(const i of [0,1,2,0,1,2])await dokun('diz-'+i);
 await dokun('ver-zipzip');await dokun('oyun-odasina');
 await expect(page.locator('.kres-boyun img')).toHaveCount(6);
 await kose('sola');await kose('pano');await expect(page.locator('.pano-kagit canvas')).toBeVisible();
 await page.getByRole('button',{name:'Sınıf köşelerine dön'}).tap();
 await kose('zil');
 // Resimden sonra toplanma ve veda.
 await expect(page.locator('#sahne')).toHaveAttribute('data-sahne','toplan');
 await page.reload();
 const kutular:Record<string,string>={marakas:'muzik',davul:'muzik',kabuk:'atolye',boncuk:'atolye',
   suluk:'dogadan',tohum:'dogadan',bardak:'yemek',pecete:'yemek',kare:'oyuncak',ucgen:'oyuncak'};
 const plan=(await kayit()).kres.duzenPlani as string[];
 expect(plan.length).toBeGreaterThanOrEqual(4);
 for(const esya of plan){await kose('duzen-'+esya);await kose('kutu-'+kutular[esya])}
 await expect(page.locator('.kres-duzen-dolgu i')).toHaveCount(plan.length);
 await kose('vedaya');
 await kose('yolda-kino');await expect(page.locator('[data-kres=eve-gir]')).toHaveClass(/zil-hazir/);await kose('eve-gir');
 await kose('ev-aski');await kose('hatirla-kolye');expect((await kayit()).kres.anlatilan).toBe('kolye');await kose('ev-hatira');
 await kose('yeni-gun');
 expect(await kayit()).toMatchObject({sahne:'oda',pay:[0,0],kolye:[],toplanan:[]});
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
    if(tur===2)await sergiKartlari(page,0,1);
    if(tur===3){
      await page.locator('[data-pano=goster]').tap();await page.locator('[data-pano=gec]').tap();await page.locator('[data-pano=defter]').tap();
    }
    if(tur===5)await sergiKartlari(page,1,2);
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
  await tus('nesne-0').tap();await tus('nesne-3').tap();
  await expect(page.locator('.bando-calgi')).toHaveCount(6);
  for(let i=0;i<6;i++)await tus('cal-'+i).tap();
  const marakas=(await tus('cal-1').boundingBox())!;
  const x=marakas.x+marakas.width/2,y=marakas.y+marakas.height/2;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+21,y,{steps:6});await page.mouse.move(x-18,y,{steps:8});await page.mouse.up();
  await expect(masa).toHaveAttribute('data-tur','ritim');
  await page.reload();await expect(tus('cal-2')).toBeEnabled();
  await tus('ileri').tap();
  await sergiKartlari(page,2,3);await page.locator('[data-sergi=devam]').tap();
  await expect(masa).toHaveAttribute('data-tur','harf');
  await ciz([[91,214],[91,66],[180,162],[269,66],[269,214]]);await tus('kart-bitti').tap();
  await expect(masa).toHaveAttribute('data-tur','resim');
  await ciz([[133,100],[140,80],[158,79],[168,102],[133,100]]);await tus('kart-bitti').tap();
  await expect(masa).toHaveAttribute('data-tur','defter');
  await expect(page.locator('.et-son .oyuncak-dugme')).toHaveCount(4);
  await tus('sergiye').tap();await expect(masa).toHaveAttribute('data-asama','sergi');
  await page.locator('[data-sergi=devam]').tap();await expect(masa).toHaveAttribute('data-tur','defter');
  await tus('dinle').tap();await expect(masa).toHaveAttribute('data-tur','defter');
  await expect(page.locator('.kart-hatira path')).toHaveCount(2);await tus('yaprak').tap();
  await expect(page.locator('.ev-kagidi .murekkep path')).toHaveCount(4);
  await expect(page.locator('.et-kayit-satiri img')).toHaveCount(9);
  expect((await durum()).saydiklarim).toEqual([0,3,0]);
  await page.reload();await expect(masa).toHaveAttribute('data-tur','defter');
  await tus('senlige').tap();await expect(masa).toHaveAttribute('data-tur','pano');
  await expect(masa).toHaveAttribute('data-durum','diger');await page.locator('[data-pano=yenile]').tap();
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
  await asili.first().tap();await expect(page.locator('.pano-asili.tek')).toHaveCount(1);
  await t('yenile').tap();await expect(t('pano')).toHaveCount(0);await expect(tuval).toBeVisible();
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

test('Öğretmen resim konusunu verir ve tamamlanınca yeni bir örnek asar',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('./hazirlik/?ders=pano');
  await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  const tus=(id:string)=>page.locator('[data-pano="'+id+'"]');
  const masa=page.locator('.pano-atolye'),tuval=page.locator('.pano-tuval');
  await expect(page.locator('[data-pano^=konu-]')).toHaveCount(0);
  async function ciz(x:number,y:number,renk:number){
    await tus('kalem').tap();
    const r=(await tuval.boundingBox())!;
    for(let i=0;i<=30;i++){
      const a=2*Math.PI*i/30;
      await page.mouse.move(r.x+(x+40*Math.cos(a))*r.width/600,r.y+(y+40*Math.sin(a))*r.height/400);
      if(!i)await page.mouse.down();
    }
    await page.mouse.up();await tus('renk-'+renk).tap();await tus('kova').tap();
    await page.mouse.click(r.x+x*r.width/600,r.y+y*r.height/400);
  }
  // Önceki sürümden trafik ışığı ödevini sürdüren çocuğun kaydı.
  await page.evaluate(()=>{const k='minkino-hazirlik-pano-v1',s=JSON.parse(localStorage.getItem(k)!);s.ders.pano.konu='isik';localStorage.setItem(k,JSON.stringify(s))});
  await page.reload();await expect(page.locator('.pano-ornek img').first()).toHaveAttribute('alt','Trafik ışığı örneği');
  await ciz(300,90,2);await ciz(300,195,1);await ciz(300,300,0);
  await tus('goster').tap();await expect(masa).toHaveAttribute('data-durum','inceleme');await tus('onar').tap();
  for(const [y,renk] of [[90,0],[300,2]]){
    await tus('renk-'+renk).tap();await tus('kova').tap();
    const r=(await tuval.boundingBox())!;await page.mouse.click(r.x+r.width/2,r.y+y*r.height/400);
  }
  await tus('goster').tap();await expect(masa).toHaveAttribute('data-durum','kazandi');
  await tus('yenile').tap();
  await expect(page.locator('.pano-ornek img').first()).toHaveAttribute('alt','Balon şenliği örneği');
});
test('Müzik dersinin ardından öğretmen çizim ödevi verir ve üçgen dersine dönülür',async({page})=>{
  await page.goto('./hazirlik/?ders=sinif');
  await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  await page.evaluate(()=>{
    const k='minkino-hazirlik-etkinlik-v1',s=JSON.parse(localStorage.getItem(k)!);
    Object.assign(s.ders,{tur:3,secim:0,isaret:[0,1,2],onay:true});localStorage.setItem(k,JSON.stringify(s));
  });
  await page.reload();await page.locator('[data-et=ileri]').tap();
  await expect(page.locator('.pano-ornek img')).toBeVisible();
  await expect(page.locator('[data-pano^=konu-]')).toHaveCount(0);
  await page.reload();await page.locator('[data-pano=goster]').tap();await page.locator('[data-pano=gec]').tap();
  await page.locator('[data-pano=defter]').tap();await expect(page.locator('.et-masa')).toHaveAttribute('data-tur','ucgen');
});

test('Telefonda öğretmenin çizimini izler ve fırçayla kapalı şeklin içini boyar',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('./hazirlik/?ders=pano');
  await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  const t=(id:string)=>page.locator('[data-pano="'+id+'"]');
  const c=page.locator('.pano-kagit canvas').first(),r=(await c.boundingBox())!;
  const hareket=(x:number,y:number)=>page.mouse.move(r.x+x*r.width/600,r.y+y*r.height/400);
  for(let i=0;i<=40;i++){const a=2*Math.PI*i/40;await hareket(250+65*Math.cos(a),180+65*Math.sin(a));if(!i)await page.mouse.down()}await page.mouse.up();
  await page.getByRole('button',{name:'Ceren çizerek göstersin'}).tap();
  await expect(page.getByRole('dialog')).toBeVisible();await t('ornek-tekrar').tap();await t('ornek-kapat').tap();
  await t('renk-3').tap();await hareket(250,180);await page.mouse.down();await hareket(410,180);await page.mouse.up();
  const renk=(x:number)=>c.evaluate((el:HTMLCanvasElement,x)=>Array.from(el.getContext('2d')!.getImageData(x,180,1,1).data),x);
  expect(await renk(270)).toEqual([78,158,224,255]);expect(await renk(370)).toEqual([255,250,240,255]);
  await page.reload();expect(await renk(370)).toEqual([255,250,240,255]);expect(await renk(270)).toEqual([78,158,224,255]);
});

async function sergiCiz(page:Page,bas=0,son=1,ters=false){
  const sayfa=page.locator('.sergi-kagit');
  const noktalar=await sayfa.locator('.sergi-rehber').evaluate((p:SVGPathElement,ayar)=>{
    const len=p.getTotalLength(),ctm=p.getScreenCTM()!;
    return Array.from({length:55},(_,i)=>{
      const oran=ayar.bas+(ayar.son-ayar.bas)*(ayar.ters?1-i/54:i/54);
      const n=p.getPointAtLength(len*oran).matrixTransform(ctm);return [n.x,n.y];
    });
  },{bas,son,ters});
  await page.mouse.move(noktalar[0][0],noktalar[0][1]);await page.mouse.down();
  for(const [x,y] of noktalar.slice(1))await page.mouse.move(x,y);
  await page.mouse.up();
}
async function sergiKartlari(page:Page,bas=0,son=3){
  const t=(id:string)=>page.locator('[data-sergi="'+id+'"]');
  for(let i=bas;i<son;i++){
    const dogru=i===1?1:0;
    expect(await page.locator('.sergi-nesne-karti>img').evaluateAll(imgs=>imgs.every(img=>{
      const r=img.getBoundingClientRect(),k=img.parentElement!.getBoundingClientRect();
      return r.top>=k.top&&r.bottom<=k.bottom&&r.left>=k.left&&r.right<=k.right;
    }))).toBe(true);
    await t('dinle-'+dogru).tap();await expect(page.locator('.et-masa')).toHaveAttribute('data-asama','ses');
    await t('ses-'+(1-dogru)).tap();await expect(page.locator('.sergi-duyulan')).toHaveText(['E','L','D'][i]);
    await t('ses-'+dogru).tap();
    for(let h=0;h<[2,4,1][i];h++)await sergiCiz(page);
    await t('tepsi-'+[2,1,2][i]).tap();
    await expect(page.locator('.sergi-tabak img:nth-child(2)')).toHaveCount([1,1,2][i]);
    await expect(t('kalem')).toHaveCount(0);
    if(i===0){
      await t('geri-koy').tap();
      await expect(page.locator('.sergi-tabak img:nth-child(2)')).toHaveCount(0);
      await expect(t('tepsi-2').locator('.sergi-tepsi-ic img')).toHaveCount(2);
    }
    await t('tepsi-'+(i+1)).tap();
    for(let j=0;j<=i;j++){
      const hedef=i-j;
      await expect(t('kalem')).toHaveCount(0);
      if(j===0)await t('pay-0').dragTo(page.locator('[data-tabak="'+hedef+'"]'));
      else await t('pay-0').tap();
      if(j===0&&i>0){
        await page.reload();
        await expect(page.locator('[data-tabak="'+hedef+'"] img')).toHaveCount(2);
        await t('pay-0').dragTo(page.locator('[data-tabak="'+hedef+'"]'));
        await expect(page.locator('.sergi-pay')).toHaveCount(i);
      }
    }
    await expect(page.locator('.sergi-tabak img:nth-child(2)')).toHaveCount(i+1);
    await t('kalem').tap();await sergiCiz(page);
    await expect(page.locator('.et-masa')).toHaveAttribute('data-asama','yerlestir');
    await t('masa-'+((i+1)%3)).tap();await expect(page.locator('.sergi-kart-el')).toBeVisible();
    if(i===0)await t('etiket').dragTo(t('masa-'+i));
    else await t('masa-'+i).tap();
    await expect(t('oku-'+i).locator('.sergi-iz').first()).toBeVisible();
    await t('sonraki').tap();
  }
}
test('Sergide çocuk sayar, altı işareti yazar ve el yazısı doğru rafa gider',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('./hazirlik/?ders=yazi');await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  await sergiKartlari(page);
  await expect(page.locator('.et-masa')).toHaveAttribute('data-asama','sergi');
  await page.reload();await expect(page.locator('.sergi-raf-sirasi.etiketli')).toHaveCount(3);
  await page.locator('[data-sergi=oku-2]').tap();await page.locator('[data-sergi=devam]').tap();
  await expect(page.locator('.et-masa')).toHaveAttribute('data-tur','harf');
});
test('Yazıda ters hareket ödevi bitirmez ve yarım çizgi yeniden açılır',async({page})=>{
  await page.goto('./hazirlik/?ders=yazi');await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  await page.locator('[data-sergi=ses-0]').tap();
  await sergiCiz(page,0,1,true);await expect(page.locator('.et-masa')).toHaveAttribute('data-asama','harf');
  await sergiCiz(page,0,.45);
  const p=page.locator('.sergi-iz.simdi'),once=await p.getAttribute('d');expect(once!.length).toBeGreaterThan(12);
  await page.reload();await expect(p).toHaveAttribute('d',once!);
  await sergiCiz(page,.45,1);await sergiCiz(page);await expect(page.locator('.et-masa')).toHaveAttribute('data-asama','say');
});
test('A sorusu sesli açılır, çocuk meyveyi dinler ve parmağıyla etikete taşır',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('./hazirlik/?ders=yazi');
  const soru=page.waitForRequest(r=>r.url().includes('yazi_armut_ses'));
  await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  await soru;await expect(page.locator('#sahne')).toHaveAttribute('data-ses-oynuyor','evet');
  for(const n of ['0','1'])await page.waitForFunction(
    i=>document.querySelector<HTMLElement>('#sahne')?.dataset.duyulan===i,n,{timeout:14_000});
  await expect(page.locator('.sergi-resim-yeri img')).toHaveCount(0);
  const armut=page.getByRole('button',{name:'Armut seç',exact:true});
  await page.getByRole('button',{name:'Armut sözcüğünü dinle'}).tap();
  await expect(page.locator('.et-masa')).toHaveAttribute('data-asama','ses');
  const kaynak=(await armut.boundingBox())!,hedef=(await page.locator('.sergi-ses-hedef').boundingBox())!;
  const bas={x:kaynak.x+kaynak.width/2,y:kaynak.y+kaynak.height/2};
  const cdp=await page.context().newCDPSession(page);
  const tasi=async(x:number,y:number)=>{
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[bas]});
    for(const t of [.25,.5,.75,1])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bas.x+(x-bas.x)*t,y:bas.y+(y-bas.y)*t}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  try{
    await tasi(bas.x+25,bas.y-20);await expect(armut).toBeVisible();
    await tasi(hedef.x+hedef.width/2,hedef.y+hedef.height/2);
  }finally{await cdp.detach()}
  await expect(page.locator('.sergi-kagit')).toHaveAttribute('aria-label','A yazma kâğıdı');
  await page.reload();await expect(page.locator('.sergi-kagit')).toHaveAttribute('aria-label','A yazma kâğıdı');
});
test('Çocuk A harfini hafif eğri ve parmağını kaldırarak yazabilir',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:320,height:568});
  await page.goto('./hazirlik/?ders=yazi');await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  await page.getByRole('button',{name:'Armut seç',exact:true}).tap();
  await expect(page.locator('.sergi-yon-oku')).toBeVisible();
  await serbestParmak(page,[[67,182],[73,157],[89,141],[95,110]]);
  await serbestParmak(page,[[95,110],[107,75],[121,50],[135,92],[147,116],[166,153],[174,182]]);
  await expect(page.locator('.sergi-rehber')).toHaveAttribute('d','M89 127 H151');
  await serbestParmak(page,[[88,124],[106,130],[119,128],[135,124],[152,129]]);
  await expect(page.locator('.et-masa')).toHaveAttribute('data-asama','say');
});
test('Eski sergide asılan lale ve çocuğun kendi limon kartı korunur',async({page})=>{
  await page.goto('./hazirlik/?ders=yazi');await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  await page.evaluate(()=>{
    const key='minkino-hazirlik-yazi-v1',s=JSON.parse(localStorage.getItem(key)!);
    const iz=[[[80,53],[80,175],[150,175]]];
    s.ders.sergi={kart:3,donus:null,sayilan:[],kalem:false,asili:false,sesBulundu:false,izler:{L:iz},limon:{asama:'bitti',yardim:false,izler:{'2':[],L:iz}}};
    localStorage.setItem(key,JSON.stringify(s));
  });
  await page.reload();
  await expect(page.getByRole('button',{name:'Lale rafı'}).locator('[aria-label="Yazdığın L"] path')).toHaveAttribute('d','M80 53 L80 175 L150 175');
  await expect(page.getByRole('button',{name:'Limon kartını oku'}).locator('[aria-label="Kendi yazdığın L"] path')).toHaveCount(1);
});
async function serbestParmak(page:Page,noktalar:number[][]){
  const px=await page.locator('.sergi-kagit').evaluate((el,pts)=>pts.map(([x,y])=>{
    const p=new DOMPoint(x,y).matrixTransform((el as SVGSVGElement).getScreenCTM()!);return {x:p.x,y:p.y};
  }),noktalar);
  const kalem=await page.context().newCDPSession(page);
  try{
    for(const [i,p] of px.entries())await kalem.send('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[{...p,id:1}]});
    await kalem.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await kalem.detach()}
}
test('Mino için boş kâğıda iki ve A yazar, eksik köprüyü tamamlayıp kendi kartını saklar',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('./hazirlik/?ders=yazi');await page.getByRole('button',{name:'Ceren ile derse başla'}).tap();
  await sergiKartlari(page);
  const t=(id:string)=>page.locator('[data-sergi="'+id+'"]');await t('istek').tap();
  await expect(page.locator('.sergi-rehber')).toHaveCount(0);
  await serbestParmak(page,[[44,76],[54,92],[70,106],[92,125],[110,148]]);
  await t('teslim').tap();await expect(page.locator('.sergi-kagit')).toHaveAttribute('aria-label','Armut kartına 2 yaz');
  await t('sil').tap();await expect(t('teslim')).toBeDisabled();
  await t('iz').tap();await expect(page.locator('.sergi-rehber')).toBeVisible();
  await t('iz').tap();
  await serbestParmak(page,[[58,87],[61,74],[73,65],[88,64],[99,68],[105,79],[104,90],[96,100],[87,110],[74,121],[61,135],[54,144],[69,145],[87,144],[107,144]]);
  await page.reload();await t('teslim').tap();await expect(page.locator('.sergi-kagit')).toHaveAttribute('aria-label','Armut kartına A yaz');
  await serbestParmak(page,[[60,160],[80,109],[101,58],[120,108],[143,160]]);
  await t('teslim').tap();await expect(page.locator('.et-masa')).toHaveAttribute('data-asama','serbest');
  await serbestParmak(page,[[78,117],[95,117],[111,118],[127,117]]);await t('teslim').tap();
  await expect(page.locator('.et-masa')).toHaveAttribute('data-asama','sergi');await page.reload();
  await expect(t('istek').locator('.sergi-etiket path')).toHaveCount(3);
});
