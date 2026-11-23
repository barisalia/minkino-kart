import { expect,test } from '@playwright/test';
import { hataTopla } from './yardimci';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test.beforeEach(async({page})=>{
  // Birlikte geliştirme sırasında Vite HMR başka bir istasyonun turunu sıfırlamasın.
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
});

test('Fiyonk porsiyonu, misafirin sos isteği ve tek servis kaydı korunur',async({page})=>{
  const hatalar=hataTopla(page);
  await page.setViewportSize({width:740,height:360});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.locator('[data-tarif=makarna]').click();
  const mutfak=page.locator('.mp-oyun');
  const yap=async(secici:string)=>{
    const hedef=mutfak.locator(secici).first();
    await expect(hedef).toBeEnabled();
    await hedef.focus();
    await page.keyboard.press('Enter');
  };
  const adim=async(ad:string)=>expect(mutfak).toHaveAttribute('data-asama',ad);
  const kayit=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-makarna-v1')!));
  for(let tur=0;tur<2;tur++) {
    if(tur)await page.locator('[data-tarif=makarna]').click();
    await adim('renk');
    await mutfak.getByRole('button',{name:tur?'Pancarlı hamur seç':'Yumurtalı hamur seç'}).click();
    for(let i=0;i<2;i++)await yap('[data-mp-kes="'+i+'"]');
    await adim('sekil');
    for(let i=1;i<=3;i++){
      await yap('.mp-buzgu');
      await expect.poll(async()=>(await kayit()).sekil).toBe(i);
      await expect(mutfak.locator('.mp-tepsi-parca')).toHaveCount(i===3?0:i);
    }
    await adim('tuz');await yap('.mp-tuzluk');await adim('at');
    for(let i=0;i<3;i++)await yap('[data-mp-at="'+i+'"]');
    await adim('suz');
    await expect(mutfak).toHaveAttribute('data-kivam','tam',{timeout:12000});
    for(let i=1;i<=3;i++){
      await yap('.mp-kepce');await expect.poll(async()=>(await kayit()).suzulen).toBe(i);
      if(i<3)await expect(mutfak.locator('.mp-damla')).toHaveCount(0);
    }
    await adim('sos');
    const feslegen=mutfak.locator('[data-mp-sos=yesil] img');
    const orta=await feslegen.evaluate(async el=>{
      const g=el as HTMLImageElement;await g.decode();
      const c=document.createElement('canvas');c.width=g.naturalWidth;c.height=g.naturalHeight;
      const ctx=c.getContext('2d')!;ctx.drawImage(g,0,0);
      return [...ctx.getImageData(Math.floor(c.width*.5),Math.floor(c.height*.33),1,1).data];
    });
    expect(orta[3]).toBe(255);
    expect(orta[1]).toBeGreaterThan(orta[0]);
    if(tur) {
      await page.reload();await adim('sos');
      await expect(mutfak.locator('.mp-fis img').last()).toHaveAttribute('src',/kirmizi-sos/);
    }
    await yap('[data-mp-sos=yesil]');await adim('havan');
    for(let i=0;i<3;i++)await yap('.mp-havan-dokunus');
    await yap('.mp-havan-aktar');await adim('sus');
    const lokmalar=mutfak.locator('.mp-tabak-lokmasi');
    await expect(lokmalar).toHaveCount(3);
    if(!tur)await expect(mutfak.locator('.mp-tabak-lokmasi[src*="altin-yesil-lokma"]')).toHaveCount(3);
    for(const lokma of await lokmalar.all())await lokma.evaluate(el=>(el as HTMLImageElement).decode());
    await yap('[data-mp-sus=peynir]');await yap('.mp-sus-hedef');await adim('servis');
    await yap('[data-mp-zil]');
    await page.getByRole('button',{name:'Zıpzıp masasına götür'}).tap();
    await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(new RegExp('^'+(tur?2:3)+' jeton'));
    await page.getByRole('button',{name:'Geri',exact:true}).first().tap();
    const tabaklar=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis);
    expect(tabaklar).toHaveLength(tur+1);
    expect(tabaklar[tur]).toMatchObject({pisirmePuani:3,istekPuani:tur?2:3,makarna:{istenenSos:tur?'kirmizi':'yesil',sos:'yesil'}});
    expect(tabaklar[tur].resim).toMatch(/^data:image\/webp;base64,/);
  }
  // Tabak albümü 16 Kasım'da (c3d9d09a) kaldırıldı; iki tabak da fotoğrafıyla defter kaydında (gecmis) duruyor.
  const defter=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis);
  expect(defter.map((k:{resim:string})=>k.resim.slice(0,23))).toEqual(['data:image/webp;base64,','data:image/webp;base64,']);
  expect(hatalar).toEqual([]);
});
test('Aynı tenceredeki üç fiyonk ayrı kıvamda süzülür, arka planda pişmez ve tabak defterine geçer',async({page,context})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  const kayit=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-makarna-v1')!));
  await page.evaluate(()=>localStorage.setItem('minkino-sef-makarna-v1',JSON.stringify({
    renk:'ispanak',kesim:2,sekil:3,tuzlandi:true,tencere:3,suzulen:0,servis:0,isiMs:0,
  })));
  await page.locator('[data-tarif=makarna]').tap();
  const mutfak=page.locator('.mp-oyun');
  const kepce=mutfak.locator('.mp-kepce');
  await expect(mutfak).toHaveAttribute('data-kivam','sert');
  const cdp=await context.newCDPSession(page);
  const ilk=await kepce.boundingBox(),hedef=await mutfak.locator('.mp-suzgec').boundingBox();
  if(!ilk||!hedef)throw Error('Kepçe ve süzgeç görünmüyor');
  const a={x:ilk.x+ilk.width*.26,y:ilk.y+ilk.height*.75},b={x:hedef.x+hedef.width*.48,y:hedef.y+hedef.height*.38};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
  for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*i/6,y:a.y+(b.y-a.y)*i/6}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  await expect.poll(async()=>(await kayit()).kivamlar).toEqual(['sert']);
  await expect(kepce).toBeEnabled();
  const arka=async(arkada:boolean)=>page.evaluate(arkada=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada}})),arkada);
  await arka(true);const kaldi=(await kayit()).isiMs;
  await page.waitForTimeout(850);expect((await kayit()).isiMs).toBe(kaldi);await arka(false);
  await expect(mutfak).toHaveAttribute('data-kivam','tam',{timeout:10000});
  await kepce.tap();await expect.poll(async()=>(await kayit()).kivamlar).toEqual(['sert','tam']);
  await page.reload();
  await expect(mutfak.locator('.mp-suzgec-ici img')).toHaveCount(2);
  await expect(mutfak).toHaveAttribute('data-kivam','yumusan',{timeout:22000});
  await page.screenshot({path:test.info().outputPath('suzgec.png')});
  await kepce.tap();await expect.poll(async()=>(await kayit()).kivamlar).toEqual(['sert','tam','yumusan']);
  const sos=mutfak.locator('[data-mp-sos=yesil]');await sos.focus();await page.keyboard.press('Enter');
  for(let i=0;i<3;i++)await mutfak.locator('.mp-havan-dokunus').press('Enter');
  await mutfak.locator('.mp-havan-aktar').tap();
  await mutfak.locator('[data-mp-sus=domates]').tap();await mutfak.locator('.mp-sus-hedef').tap();
  await expect(mutfak.locator('.mp-tabak-lokmasi')).toHaveCount(3);
  await expect(mutfak.locator('.mp-tabak-lokmasi').nth(0)).toHaveAttribute('src',/ispanak-yesil-sert/);
  await expect(mutfak.locator('.mp-tabak-lokmasi').nth(2)).toHaveAttribute('src',/ispanak-yesil-yumusan/);
  await mutfak.locator('[data-mp-zil]').tap();
  await page.getByRole('button',{name:'Zıpzıp masasına götür'}).tap();
  await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(/^2 jeton/);
  await page.screenshot({path:test.info().outputPath('servis.png')});
  const foto=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis[0]);
  expect(foto).toMatchObject({istekPuani:3,pisirmePuani:2,puan:2});
  // Tabak albümü 16 Kasım'da kaldırıldı; tabak fotoğrafı defter kaydında kalır.
  expect(foto.resim).toMatch(/^data:image\/webp;base64,/);
  await page.getByRole('button',{name:'Geri',exact:true}).first().tap();
  await expect(page.locator('[data-tarif=makarna] .kart-yildiz')).toBeVisible();
});
test('Eski kayıttan açılan süzgeçteki fiyonklar önceki normal kıvamını korur',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-makarna-v1',JSON.stringify({
    renk:'pancar',kesim:2,sekil:3,tuzlandi:true,tencere:3,suzulen:2,kaynamaSonu:1000,
  })));
  await page.locator('[data-tarif=makarna]').click();
  await expect(page.locator('.mp-oyun')).toHaveAttribute('data-kivam','tam');
  await expect(page.locator('.mp-suzgec-ici img[src*="pancar-pismis"]')).toHaveCount(2);
});
test('Şef servis zilinden önce garnitürü değiştirebilir; son çizim deftere geçer',async({page},info)=>{
  await page.setViewportSize({width:568,height:320});await page.routeWebSocket(u=>u.port==='5173',()=>{});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-makarna-v1',JSON.stringify({
    renk:'ispanak',kesim:2,sekil:3,tencere:3,suzulen:3,kivamlar:['tam','tam','tam'],sos:'yesil',istek:'yesil',pestoMaskesi:7,sus:{id:'peynir',x:.5,y:.44}
  })));
  await page.locator('[data-tarif=makarna]').tap();
  await page.getByRole('button',{name:'Son süsü değiştir'}).tap();
  await expect(page.locator('[data-mp-sus=peynir]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-mp-sus=domates]').tap();await page.locator('.mp-sus-hedef').tap();
  await page.reload();await expect(page.locator('.mp-son-sus')).toHaveAttribute('src',/domates-garnitur/);
  await page.locator('[data-mp-zil]').tap();
  await expect(page.getByRole('button',{name:'Tepsiyi müşteriye sun'})).toBeVisible();
  await page.getByRole('button',{name:'Zıpzıp masasına götür'}).tap();
  await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(/3 jeton/);
  await page.screenshot({path:info.outputPath('fiyonk-garnitur.png')});
  const k=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis.at(-1));
  expect(k.resim).toMatch(/^data:image\/webp/);expect(k.puan).toBe(3);
});
test('Müşteri makarnası yeniden hazırlanırken sos isteği ve eski fotoğraf korunur',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    const makarna={tarifId:'makarna',resim:'makarna/makarna',puan:2,istekPuani:2,pisirmePuani:3,makarna:{istenenSos:'sari',sos:'kirmizi'}};
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,gecmis:[makarna],tepsiler:{ekran:'masa',secili:'fiyonk-tavuk',masalar:{'fiyonk-tavuk':{tabaklar:{makarna},adim:{tavuk:0,icecek:0}}}}}));
  });
  await page.reload();
  await page.getByRole('button',{name:'Fiyonk Makarna yeniden hazırla'}).tap();
  await page.getByRole('button',{name:'Yumurtalı hamur seç'}).tap();
  await expect(page.locator('.mp-fis img').first()).toHaveAttribute('src',/altin-sari-tabak/);
  await page.reload();
  await expect(page.locator('.mp-fis img').first()).toHaveAttribute('src',/altin-sari-tabak/);
  await page.locator('.mp-ust').getByRole('button',{name:'Geri'}).tap();
  const d=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!));
  expect(d.tepsiler.masalar['fiyonk-tavuk'].tabaklar.makarna.makarna).toEqual({istenenSos:'sari',sos:'kirmizi'});
  expect(d.gecmis).toHaveLength(1);
});
