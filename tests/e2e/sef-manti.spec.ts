import {expect,test} from '@playwright/test';
import {mantiDuzeltme,mantiPuan,type Manti} from '../../sef/src/manti-tarifi';
for(const dogru of [true,false])test('Mantı hamuru katlanır ve '+(dogru?'peynirli yoğurtlu mantı tam puan kazanır':'erken süzülen farklı içli mantı masada aynen kalır'),async({page})=>{
  await page.setViewportSize(dogru?{width:667,height:375}:{width:844,height:390});
  await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.getByRole('button',{name:'Resimli tarif kitabı'}).tap();
  await page.getByRole('button',{name:'Mantı tarifini incele'}).tap();
  for(let i=0;i<3;i++)await page.getByRole('button',{name:'Sonraki adım'}).press('Enter');
  await page.getByRole('button',{name:'Bu yemeği hazırla'}).tap();
  const hamur=page.locator('.manti-hamur').first();
  await page.getByRole('button',{name:dogru?'Peynir içi seç':'Havuç içi seç'}).tap();
  const r=(await hamur.boundingBox())!;
  await page.mouse.move(r.x+r.width*.12,r.y+r.height*.12);await page.mouse.down();await page.mouse.move(r.x+r.width*.51,r.y+r.height*.5,{steps:8});await page.mouse.up();
  await expect(hamur).toHaveAttribute('data-kat','1');
  await page.reload();await expect(hamur).toHaveAttribute('data-kat','1');
  for(let n=0;n<3;n++)for(let i=(n===0?1:0);i<4;i++)await page.locator('.manti-hamur').nth(n).press('Enter');
  for(let i=1;i<=3;i++)await page.getByRole('button',{name:i+'. mantıyı suya bırak'}).tap();
  if(dogru)await expect(page.locator('.manti-tencere')).toHaveAttribute('data-kivam','tam',{timeout:12000});
  await page.getByRole('button',{name:'Mantıyı süz'}).press('Enter');
  const suzgec=page.locator('.manti-suzgec');
  await expect(suzgec.getByRole('button')).toHaveCount(3);
  const ilk=suzgec.getByRole('button',{name:'1. mantıyı tabağa al'});
  if(dogru){
    const a=(await ilk.boundingBox())!,b=(await page.locator('.manti-aktarim .manti-sunum').boundingBox())!;
    await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});
    await expect(ilk).toHaveCSS('opacity','0');
    await page.mouse.up();
    if(process.env.SEF_MANTI_SUZGEC)await page.screenshot({path:process.env.SEF_MANTI_SUZGEC});
    await page.reload();
  }else await ilk.tap();
  await expect(suzgec.getByRole('button')).toHaveCount(2);
  await expect(page.locator('.manti-aktarim .manti-lokma')).toHaveCount(1);
  for(let i=2;i<=3;i++)await page.getByRole('button',{name:i+'. mantıyı tabağa al'}).tap();
  await page.getByRole('button',{name:dogru?'Yoğurt seç':'Domates sosu seç'}).tap();
  for(let i=1;i<=(dogru?3:1);i++)await page.getByRole('button',{name:i+'. mantıya sos koy'}).tap();
  await page.getByRole('button',{name:'Mantıyı bitir'}).tap();
  if(dogru&&process.env.SEF_MANTI_KARE)await page.screenshot({path:process.env.SEF_MANTI_KARE});
  await page.getByRole('button',{name:'Mantıyı tepsiye koy'}).tap();await page.reload();
  const yiyecek=page.locator('.tepsi-yuva .manti-lokma');
  await expect(yiyecek).toHaveCount(3);
  await expect(yiyecek.locator('.manti-ust-sos')).toHaveCount(dogru?3:1);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.masalar['peynir-manti'].mantiPuani).toBe(dogru?3:1);
  expect(t.jeton).toBe(dogru?3:1);
});

test('Mantı tadımı erken ve geç haşlamayı, iç seçimini ve sos kapsamını ayrı değerlendirir',()=>{
  const iyi:Manti={evre:'sun',ic:'peynir',kat:[4,4,4],tencerede:[0,1,2],sure:5000,tabakta:[0,1,2],sos:'yogurt',soslar:[0,1,2]};
  for(const sure of [2399,8001]){
    const erkenVeyaFazla={...iyi,sure};
    expect(mantiPuan(erkenVeyaFazla,'peynir-manti')).toBe(2);
    expect(mantiDuzeltme(erkenVeyaFazla,'peynir-manti')).toMatchObject({evre:'hasla',ic:'peynir',kat:[4,4,4],sure:0});
  }
  for(const sure of [2400,8000])expect(mantiPuan({...iyi,sure},'peynir-manti')).toBe(3);
  const eksik={...iyi,soslar:[1]};
  expect(mantiPuan(eksik,'peynir-manti')).toBe(2);
  expect(mantiPuan({...eksik,sure:9000},'peynir-manti')).toBe(1);
  expect(mantiDuzeltme({...iyi,ic:'havuc'},'peynir-manti').evre).toBe('doldur');
});

test('Mantı fişi üç sos izini gösterir; çocuk tek soslu tabağın iki eksiğini tamamlar',async({page},info)=>{
  await page.setViewportSize({width:568,height:320});
  await page.routeWebSocket(u=>u.port==='5173',()=>{});
  await page.goto('./sef/?giris=tepsiler&siparis=peynir-manti');
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    k.sessiz=true;k.tepsiler.oynanan='manti';
    k.tepsiler.masalar['peynir-manti'].mantiTaslagi={evre:'sos',ic:'peynir',kat:[4,4,4],tencerede:[0,1,2],sure:4600,tabakta:[0,1,2],sos:'yogurt',soslar:[1]};
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await page.getByRole('button',{name:'Mantıyı bitir'}).tap();
  await page.getByRole('button',{name:'Mantıyı tepsiye koy'}).tap();
  const fis=page.getByRole('button',{name:'Mantı siparişi ile tabağı karşılaştır'});
  await fis.tap();
  const karsilastir=page.getByRole('dialog');
  await expect(karsilastir.getByRole('img',{name:'3 mantı soslu'})).toBeVisible();
  await expect(karsilastir.getByRole('img',{name:'1 mantı soslu'})).toBeVisible();
  await expect(karsilastir.getByRole('img',{name:'Tam kıvamında süzüldü'})).toHaveCount(2);
  await expect(karsilastir.locator('.sef-yildizlar')).toHaveAttribute('data-puan','2');
  const tabakGorseli=(await karsilastir.locator('.tepsi-tabak-ornek .manti-sunum').boundingBox())!;
  const sosSatiri=(await karsilastir.locator('.tepsi-tabak-ornek .manti-sos-kapsami').boundingBox())!;
  expect(tabakGorseli.y+tabakGorseli.height).toBeLessThanOrEqual(sosSatiri.y+1);
  await page.screenshot({path:info.outputPath('manti-karsilastirma.png')});
  await karsilastir.getByRole('button',{name:'Mantı tekrar pişir'}).tap();
  await expect(page.locator('.manti-tezgahi')).toHaveAttribute('data-evre','sos');
  await expect(page.locator('.manti-alan .manti-ust-sos')).toHaveCount(1);
  await page.getByRole('button',{name:'1. mantıya sos koy'}).tap();await page.reload();
  await expect(page.locator('.manti-alan .manti-ust-sos')).toHaveCount(2);
  await page.getByRole('button',{name:'3. mantıya sos koy'}).tap();
  await page.getByRole('button',{name:'Mantıyı bitir'}).tap();await page.getByRole('button',{name:'Mantıyı tepsiye koy'}).tap();
  await fis.tap();
  await expect(karsilastir.getByRole('img',{name:'3 mantı soslu'})).toHaveCount(2);
  await expect(karsilastir.locator('.sef-yildizlar')).toHaveAttribute('data-puan','3');
  await karsilastir.getByRole('button',{name:'Tepsiye dön'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:'3 jeton kazanıldı'})).toBeVisible();
});

test('Dolu kaşık seçilen mantıya iner ve başka sos alınca öteki iki lokma korunur',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.routeWebSocket(u=>u.port==='5173',()=>{});
  await page.goto('./sef/?giris=tepsiler&siparis=peynir-manti');
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    k.sessiz=true;k.tepsiler.oynanan='manti';
    k.tepsiler.masalar['peynir-manti'].mantiTaslagi={evre:'sos',ic:'peynir',kat:[4,4,4],tencerede:[0,1,2],sure:4600,tabakta:[0,1,2],sos:'yogurt',soslar:[0,1]};
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  const lokmalar=page.locator('.manti-alan .manti-lokma');
  const kat=async(sos:string,i:number)=>{
    const b=(await page.getByRole('button',{name:sos+' seç'}).boundingBox())!;
    const e=(await lokmalar.nth(i).boundingBox())!;
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
    await page.mouse.move(e.x+e.width/2,e.y+e.height/2,{steps:7});
    await expect(lokmalar.nth(i)).toHaveAttribute('data-yakin','true');
    await page.mouse.up();await expect(page.locator('.manti-gezici-kasik')).toHaveCount(0);
  };
  await kat('Domates sosu',2);await page.reload();
  await expect(lokmalar.nth(2)).toHaveAttribute('data-sos','domates');
  await expect(page.locator('.manti-alan [data-sos=yogurt]')).toHaveCount(2);
  await page.getByRole('button',{name:'Mantıyı bitir'}).tap();await page.getByRole('button',{name:'Mantıyı tepsiye koy'}).tap();
  const fis=page.getByRole('button',{name:'Mantı siparişi ile tabağı karşılaştır'});
  await fis.tap();const dialog=page.getByRole('dialog');
  await expect(dialog.locator('.sef-yildizlar')).toHaveAttribute('data-puan','2');
  await expect(dialog.locator('.tepsi-tabak-ornek .manti-sos-kapsami [data-uyum=false]')).toHaveCount(1);
  await dialog.getByRole('button',{name:'Mantı tekrar pişir'}).tap();
  await kat('Yoğurt',2);
  await expect(page.locator('.manti-alan [data-sos=yogurt]')).toHaveCount(3);
  await page.getByRole('button',{name:'Mantıyı bitir'}).tap();await page.getByRole('button',{name:'Mantıyı tepsiye koy'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:'3 jeton kazanıldı'})).toBeVisible();
});
