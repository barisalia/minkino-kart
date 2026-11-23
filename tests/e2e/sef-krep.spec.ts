import { expect, test, type Page, type Locator } from '@playwright/test';
import sharp from 'sharp';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

async function merkez(el: Locator) {
  await expect(el).toBeVisible();
  const r=await el.boundingBox();
  if(!r) throw new Error('Krep etkileşim alanına erişilemedi');
  return {x:r.x+r.width/2,y:r.y+r.height/2};
}
type Nokta={x:number;y:number};
async function parmak(page:Page,a:Nokta,b:Nokta,iptal=false) {
  const c=await page.context().newCDPSession(page);
  try{
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
    for(let i=1;i<=7;i++) await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*i/7,y:a.y+(b.y-a.y)*i/7}]});
    await c.send('Input.dispatchTouchEvent',{type:iptal?'touchCancel':'touchEnd',touchPoints:[]});
  }finally{await c.detach();}
}
test.beforeEach(async({page},info)=>{
  if(new URL(info.project.use.baseURL!).port==='5173') await page.routeWebSocket(u=>u.port==='5173',()=>{});
  await page.setViewportSize(info.project.name==='ipad'?{width:1024,height:768}:{width:740,height:360});
  await page.goto('./sef/?test');
  await page.locator('[data-tarif=krep]').tap();
  await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-adim','karisim');
});
test('Krep, tavadan meyveli tabağa parmakla hazırlanıp deftere bir kez girer',async({page})=>{
  const hata: string[]=[];page.on('pageerror',e=>hata.push(e.message));
  const bul=(s:string)=>page.locator(s);
  const adim=(a:string)=>expect(bul('.krep-oyunu')).toHaveAttribute('data-krep-adim',a);
  const durum=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-krep-v1')!));
  const tasi=async(a:string,b:string,iptal=false)=>parmak(page,await merkez(bul(a)),await merkez(bul(b)),iptal);
  await adim('karisim');
  await tasi('[data-krep-icerik=un]','[data-krep-hedef]');
  await expect(bul('[data-krep-icerik=un]')).toBeDisabled();
  await page.reload();await adim('karisim');
  expect((await durum()).icerik).toEqual(['un']);
  for(const id of ['yumurta','sut']) {
    await tasi('[data-krep-icerik='+id+']','[data-krep-hedef]');
    if(id==='yumurta')await expect(bul('[data-krep-icerik=yumurta]')).toBeDisabled();
  }
  const c=await page.context().newCDPSession(page);
  try {
    for(let tur=0;tur<2;tur++){
      const m=await merkez(bul('[data-krep-cirp]')),r=28;
      const poz=(n:number)=>({x:m.x+r*Math.cos(n*Math.PI/8),y:m.y+r*Math.sin(n*Math.PI/8)});
      await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[poz(0)]});
      for(let n=1;n<=16;n++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[poz(n)]});
      await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      if(tur===0)await expect(bul('.kr-hamur')).toHaveAttribute('src',/karisim-once/);
    }
  }finally{await c.detach();}
  await adim('dok');
  await tasi('[data-krep-arac]','[data-krep-hedef]',true);await adim('dok');
  await tasi('[data-krep-arac]','[data-krep-hedef]');
  await adim('yay');
  for(const [i,[dx,dy]] of [[-55,0],[0,-50],[55,0]].entries()){
    await expect(bul('[data-krep-yon]')).toHaveAttribute('data-krep-yon',String(i));
    const p=await merkez(bul('[data-krep-yay]'));await parmak(page,p,{x:p.x+dx,y:p.y+dy});
  }
  await adim('cevir');await tasi('[data-krep-arac]','[data-krep-hedef]');
  const at=await merkez(bul('[data-krep-at]'));await parmak(page,at,{x:at.x,y:at.y-40});
  await tasi('[data-krep-al]','[data-krep-hedef]');
  await adim('meyve');await expect(bul('[data-krep-meyve]')).toHaveCount(9);
  await tasi('[data-krep-meyve=kivi]','[data-krep-hedef]');
  expect((await durum()).parcalar).toHaveLength(1);
  await page.reload();await adim('meyve');
  await expect(bul('[data-krep-meyve=seftali]')).toBeEnabled();
  const nokta=await merkez(bul('[data-krep-hedef]'));await parmak(page,await merkez(bul('[data-krep-meyve=seftali]')),{x:nokta.x-21,y:nokta.y+15});
  await bul('[data-krep-meyve=kiraz]').tap();await bul('[data-krep-hedef]').tap();
  await page.getByRole('button',{name:'Meyveleri onayla ve krebi katla'}).tap();
  await adim('katla');expect((await durum()).parcalar.map((p:{meyve:string})=>p.meyve)).toEqual(['kivi','seftali','kiraz']);
  const k1=await merkez(bul('[data-krep-kat="0"]'));await parmak(page,k1,{x:k1.x,y:k1.y+40});
  const k2=await merkez(bul('[data-krep-kat="1"]'));await parmak(page,k2,{x:k2.x-40,y:k2.y});
  await adim('servis');await expect(bul('[data-krep-tabak]')).toHaveAttribute('data-krep-tabak','karisik');
  const sunum=await bul('.kr-karisik-tabak').screenshot({scale:'css'});
  await tasi('[data-krep-tabak]','[data-krep-zil]');
  await expect(page.getByRole('button',{name:'Mino masasına götür'})).toBeVisible();
  await page.reload();expect((await durum()).servis).toBe(1);
  await page.getByRole('button',{name:'Mino masasına götür'}).tap();
  await expect(bul('.servis-jetonu')).toBeVisible();
  // Tabak albümü 16 Kasım'da (c3d9d09a) kaldırıldı. Çocuğun tabağı deftere bir kez girer ve fotoğrafı masada, Mino'nun önündeki tabakta görünür.
  const gecmis=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis);
  expect(gecmis.filter((k:{tarifId:string})=>k.tarifId==='krep')).toHaveLength(1);
  expect(gecmis.at(-1)).toMatchObject({tarifId:'krep',resim:expect.stringMatching(/^data:image\/webp;base64,/)});
  const foto=bul('.defter-fotograf').first();
  await expect.poll(()=>foto.evaluate((n:HTMLImageElement)=>n.complete&&n.naturalWidth>0)).toBe(true);
  const kaynak=await foto.getAttribute('src');
  expect(kaynak).toMatch(/^data:image\/webp;base64,/);
  const album=Buffer.from(kaynak!.split(',')[1],'base64');
  const baski=await sharp(album).resize(96,96).ensureAlpha().raw().toBuffer();
  const sahne=await sharp(sunum).resize(96,96).ensureAlpha().raw().toBuffer();
  let ornek=0,hataToplami=0;
  for(let p=0;p<baski.length;p+=4){
    if(baski[p+3]<250)continue;
    for(let kanal=0;kanal<3;kanal++)hataToplami+=Math.abs(baski[p+kanal]-sahne[p+kanal]);
    ornek++;
  }
  expect(ornek).toBeGreaterThan(4000);
  expect(hataToplami/(ornek*3)).toBeLessThan(8);
  await page.getByRole('button',{name:'Geri',exact:true}).tap();
  await expect(bul('[data-tarif=krep] .kart-yildiz')).toBeVisible();
  expect(hata).toEqual([]);
});

test('Krep hamuru tek sürekli hareketle karışır ve tamamlanmış çırpmada kayıt kilitlenmez',async({page})=>{
  const hazirHamur=async(cirpma:number)=>{
    await page.evaluate(tur=>{
      const anahtar='minkino-sef-krep-v1';
      const kayit=JSON.parse(localStorage.getItem(anahtar)!);
      Object.assign(kayit,{adim:'karisim',icerik:['sut','un','yumurta'],cirpma:tur});
      localStorage.setItem(anahtar,JSON.stringify(kayit));
    },cirpma);
    await page.reload();
  };
  await hazirHamur(0);
  const cirpici=page.locator('[data-krep-cirp]'),m=await merkez(cirpici);
  await page.mouse.move(m.x+22,m.y);await page.mouse.down();
  for(let n=1;n<=36;n++){
    const aci=n*Math.PI/8;
    await page.mouse.move(m.x+22*Math.cos(aci),m.y+22*Math.sin(aci));
  }
  await page.mouse.up();
  await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-adim','dok');
  await hazirHamur(2);
  await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-adim','dok');
});

test('Krep klavyeyle dokunmadan hazırlanır ve ikinci sipariş yeni bir seçimle başlar',async({page})=>{
  const b=(s:string)=>page.locator(s);
  const onay=async(s:string)=>{await b(s).focus();await page.keyboard.press('Enter');};
  for(const id of ['sut','un','yumurta']){
    await onay('[data-krep-icerik='+id+']');await onay('[data-krep-hedef]');
    if(id!=='yumurta')await expect(b('[data-krep-icerik='+id+']')).toBeDisabled();
  }
  await onay('[data-krep-cirp]');await expect(b('.kr-cirpici-elde')).not.toHaveClass(/kr-vurus/);
  await onay('[data-krep-cirp]');
  await onay('[data-krep-arac]');await onay('[data-krep-hedef]');
  for(let i=0;i<3;i++) await onay('[data-krep-yon="'+i+'"]');
  await onay('[data-krep-arac=spatula]');await onay('[data-krep-hedef]');await onay('[data-krep-at]');
  await onay('[data-krep-al]');await onay('[data-krep-hedef]');
  for(let i=0;i<3;i++){await onay('[data-krep-meyve=muz]');await onay('[data-krep-hedef]');}
  await page.getByRole('button',{name:'Meyveleri onayla ve krebi katla'}).press('Enter');
  await onay('[data-krep-kat="0"]');await onay('[data-krep-kat="1"]');
  await expect(b('[data-krep-tabak]')).toHaveAttribute('data-krep-tabak','muzlu');
  await onay('[data-krep-zil]');
  await page.getByRole('button',{name:'Mino masasına götür'}).press('Enter');
  await expect(b('.servis-jetonu')).toBeVisible();
  await page.getByRole('button',{name:'Geri',exact:true}).press('Enter');
  await onay('[data-tarif=krep]');
  await expect(b('.krep-oyunu')).toHaveAttribute('data-krep-adim','karisim');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-krep-v1')!).parcalar)).toEqual([]);
});

test('İki yüzün ısısı arka planda donar; yanık krep için yeniden hamur dökülebilir',async({page})=>{
  const kayit='minkino-sef-krep-v1';
  const ilk=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),kayit);
  const durum=async(ms:number,ikinci=false)=>{
    if(await page.locator('.krep-oyunu').count())await page.locator('.kr-geri').click();
    await page.evaluate(({k,d})=>{localStorage.setItem(k,JSON.stringify(d));localStorage.setItem('minkino-sef-acik-atolye','krep');},{k:kayit,d:{...ilk,aktif:true,adim:'cevir',yon:3,isiMs:ms,ikinci,ilkYuz:'iyi',sonYuz:'iyi'}});
    await page.reload();await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-adim','cevir');
  };
  const arka=(arkada:boolean)=>page.evaluate(a=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada:a}})),arkada);
  const deger=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).isiMs,kayit);
  await durum(3400);
  await arka(true);const once=await deger();
  await page.waitForTimeout(1800);expect(await deger()).toBe(once);
  await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-isisi','erken');
  await arka(false);await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-isisi','iyi',{timeout:3500});
  await durum(14300,true);await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-isisi','fazla');
  await durum(21800,true);await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-isisi','yanik');
  await page.locator('[data-krep-al]').tap();await page.locator('[data-krep-hedef]').tap();
  await expect(page.locator('.kr-hamur')).toHaveAttribute('src',/krep-pismis-yanik/);
  await page.locator('[data-krep-tekrar]').tap();
  await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-adim','dok');
  expect(await deger()).toEqual(0);
});

test('Spatuladaki krep ısınmaz, çocuk aynı yüzünü tekrar tavaya indirip el hareketiyle çevirebilir',async({page})=>{
  const key='minkino-sef-krep-v1';
  await page.evaluate(k=>{
    const d=JSON.parse(localStorage.getItem(k)!);
    localStorage.setItem(k,JSON.stringify({...d,adim:'cevir',aktif:true,yon:3,isiMs:300,ikinci:false}));
  },key);
  await page.reload();
  const kaldir=async()=>{await page.locator('[data-krep-arac=spatula]').tap();await page.locator('[data-krep-hedef]').tap();};
  const kayit=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key);
  await kaldir();const acik=await kayit();
  expect(acik.spatulada).toBe(true);
  await page.reload();await expect(page.getByRole('button',{name:'Aynı yüzü biraz daha pişir'})).toBeVisible();
  const yenidenAcilan=await kayit();expect(Math.abs(yenidenAcilan.isiMs-acik.isiMs)).toBeLessThan(1);
  await page.waitForTimeout(1100);expect((await kayit()).isiMs).toBe(yenidenAcilan.isiMs);
  await page.getByRole('button',{name:'Aynı yüzü biraz daha pişir'}).tap();
  await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-isisi','iyi',{timeout:6500});
  await kaldir();const b=await merkez(page.getByRole('button',{name:'Krebi yukarı çevir'}));
  await parmak(page,b,{x:b.x+36,y:b.y});expect((await kayit()).ikinci).toBe(false);
  await parmak(page,b,{x:b.x-12,y:b.y-58});
  await expect(page.locator('[data-krep-al]')).toBeVisible();
  expect(await kayit()).toMatchObject({ilkYuz:'iyi',ikinci:true});
});

test('Yanık, fazla ve ideal pişirme yıldızı ve tabak fotoğrafı serviste korunur',async({page})=>{
  const k='minkino-sef-krep-v1';
  const ilk=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),k);
  for(const [ilkYuz,sonYuz,puan] of [['iyi','iyi',3],['iyi','fazla',2],['yanik','iyi',1],['erken','iyi',2]] as const){
    if(await page.locator('.krep-oyunu').count())await page.locator('.kr-geri').click();
    await page.evaluate(({k,d})=>{localStorage.setItem(k,JSON.stringify(d));localStorage.setItem('minkino-sef-acik-atolye','krep');},{k,d:{...ilk,adim:'servis',aktif:true,ilkYuz,sonYuz,ikinci:true,meyve:'muz',parcalar:[{x:32,y:40,meyve:'cilek'},{x:45,y:63,meyve:'cilek'},{x:62,y:53,meyve:'muz'}]}});
    await page.reload();await page.locator('[data-krep-zil]').tap();
    await page.getByRole('button',{name:'Mino masasına götür'}).tap();
    await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(new RegExp('^'+puan+' jeton'));
    const servis=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis.at(-1));
    expect(servis.resim).toMatch(/^data:image\/webp;base64,/);expect(servis.puan).toBe(puan);expect(servis.pisirmePuani).toBe(puan);
    await page.getByRole('button',{name:'Geri',exact:true}).tap();
  }
});

for(const duzelt of [false,true])test('Krep fişinde iki çilek ve bir muz '+(duzelt?'düzeltilip tam puan alır':'yerine yanlış meyve düşük puan getirir'),async({page},info)=>{
  await page.setViewportSize({width:568,height:320});
  const key='minkino-sef-krep-v1';
  await page.evaluate(k=>{
    const d=JSON.parse(localStorage.getItem(k)!);
    localStorage.setItem(k,JSON.stringify({...d,adim:'meyve',ilkYuz:'iyi',sonYuz:'iyi'}));
  },key);
  await page.reload();
  const onay=page.getByRole('button',{name:'Meyveleri onayla ve krebi katla'});
  const geri=page.getByRole('button',{name:'Son meyve dilimini geri al'});
  await expect(geri).toBeDisabled();
  await expect(onay).toBeDisabled();
  for(const meyve of ['cilek','muz','kiraz']){
    await page.locator('[data-krep-meyve="'+meyve+'"]').tap();await page.locator('[data-krep-hedef]').tap();
  }
  await expect(page.locator('.kr-istek-dilimi[data-tamam=true]')).toHaveCount(2);
  await page.reload();await expect(onay).toBeEnabled();
  await expect(page.locator('[data-krep-meyve=armut]')).toBeDisabled();
  await page.screenshot({path:info.outputPath('meyve-fisi.png')});
  if(duzelt){
    const konum=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).parcalar.map((p:Nokta)=>[p.x,p.y]),key);
    const eski=await konum();
    await page.getByRole('button',{name:'Kiraz dilimini değiştir'}).press('Enter');
    await page.locator('[data-krep-meyve=cilek]').press('Enter');
    expect(await konum()).toEqual(eski);
    await geri.press('Enter');await expect(onay).toBeDisabled();
    await page.locator('[data-krep-meyve=cilek]').press('Enter');await page.locator('[data-krep-hedef]').press('Enter');
    await expect(page.locator('.kr-istek-dilimi[data-tamam=true]')).toHaveCount(3);
  }
  await onay.tap();
  await page.getByRole('button',{name:'Açık meyveli krebi tabağa al'}).tap();
  await page.locator('[data-krep-zil]').tap();
  await page.getByRole('button',{name:'Mino masasına götür'}).tap();
  await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(new RegExp((duzelt?'3':'2')+' jeton'));
  const k=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis.at(-1));
  expect(k.istekPuani).toBe(duzelt?3:2);expect(k.pisirmePuani).toBe(3);
  const sonMeyve=duzelt?'cilek':'kiraz';
  expect(k.tercih).toEqual({tarifId:'krep',tur:0,meyveler:['cilek','muz',sonMeyve],
    porsiyon:{sunum:'acik',kizarma:'iyi',parcalar:[
      {meyve:'cilek',x:35,y:45},{meyve:'muz',x:61,y:40},{meyve:sonMeyve,x:52,y:62},
    ]}});
});
