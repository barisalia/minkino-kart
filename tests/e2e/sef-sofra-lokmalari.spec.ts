import {test,expect,type Page} from '@playwright/test';
test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:740,height:360});
});
async function masa(page:Page,id:string,tabaklar:Record<string,unknown>,sira=2){
  await page.goto('./sef/');
  await page.evaluate(({id,tabaklar,sira})=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{ekran:'masa',secili:id,restoranda:true,jeton:19,
      restoran:{sira,menuId:id,evre:'mutfak',sayildi:true},masalar:{[id]:{sunuldu:true,tabaklar,odenen:6}}}}));
  },{id,tabaklar,sira});
  await page.reload();await expect(page.locator('.tepsi-sahnesi[data-salon=servis]')).toBeVisible();
}
test('Meyveli tarttan bir dilim kalkar, yenilenen masada kalan iki dilim korunur',async({page})=>{
  await page.goto('./sef/');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
    ekran:'masa',secili:'meyveli-tart',restoranda:true,tatliSeviye:4,jeton:24,
    restoran:{sira:8,menuId:'meyveli-tart',evre:'mutfak',sayildi:true},
    masalar:{'meyveli-tart':{sunuldu:true,tatliPuani:3,tabaklar:{'meyveli-tart':true},tartDilimleri:[{meyve:'cilek',x:72,y:49},{meyve:'muz',x:34,y:55}]}}
  }})));
  await page.reload();
  const tabak=page.locator('.tepsi-yuva[data-parca=meyveli-tart]');
  await tabak.tap();
  const dilim=page.locator('.restoran-lokma canvas[data-isirik=false]');
  await expect.poll(()=>dilim.evaluate((el:HTMLCanvasElement)=>el.width)).toBeLessThan(235);
  await expect(tabak).toHaveAttribute('data-lokma-adedi','1');
  await expect(page.locator('.restoran-lokma')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const kesim=await tabak.locator('.tatli-katlari').evaluate(el=>getComputedStyle(el).clipPath);
  expect(kesim).toContain('polygon');
  await page.reload();expect(await tabak.locator('.tatli-katlari').evaluate(el=>getComputedStyle(el).clipPath)).toBe(kesim);
  for(const i of [2,3]){
    await tabak.tap();
    await expect(tabak).toHaveAttribute('data-lokma-adedi',String(i));
    await expect(page.locator('.restoran-lokma')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await expect(tabak.locator('.tatli-yiyecek')).toBeHidden();
  await expect(tabak.locator('.pastane-porsiyon-tabagi')).toBeVisible();
});
test('Dede seçilen tabaktan kendi şiş sebzelerini ve yaptığı makarnayı sırasıyla yer',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await masa(page,'fiyonk-sis',{
    sis:{tarifId:'sis',resim:'sis/sis',puan:3,tercih:{tarifId:'sis',tur:1,tabak:'tabak-nane',sos:'yogurt',lokmalar:['ananas','biber','kabak','ananas']}},
    makarna:{tarifId:'makarna',resim:'makarna/makarna',puan:3,makarna:{istenenSos:'yesil',sos:'yesil',pestoMaskesi:6,porsiyon:{renk:'ispanak',kivamlar:['sert','tam','yumusan'],sus:{id:'domates',x:.25,y:.53}}}}});
  const sis=page.locator('.tepsi-yuva[data-parca=sis]'),makarna=page.locator('.tepsi-yuva[data-parca=makarna]');
  await expect(sis.locator('svg image').first()).toHaveAttribute('href',/tabak-nane/);
  const ye=async(p:typeof sis)=>{await p.tap();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');};
  for(const [i,id] of ['ananas','biber','kabak','ananas'].entries()){
    await expect(sis.locator('[data-lokma]:not([hidden])').first()).toHaveAttribute('data-lokma',id);
    await ye(sis);if(i===0)await page.reload();
  }
  await expect(sis).toHaveAttribute('data-tukendi','true');
  for(const kivam of ['sert','lokma','yumusan']){
    await expect(makarna.locator('[data-lokma]:not([hidden])').first()).toHaveAttribute('href',new RegExp('ispanak-yesil-'+kivam));
    await ye(makarna);
  }
  await expect(makarna.locator('[data-garnitur]')).toBeHidden();
  const canta=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect([canta.jeton,canta.masalar['fiyonk-sis'].tadilan]).toEqual([19,{sis:4,makarna:3}]);
});
test('Krepte en son seçilen meyve yerini korur ve lokma masadaki diğer misafire gider',async({page})=>{
  await masa(page,'kahvalti',{krep:{tarifId:'krep',resim:'krep/krep',puan:3,tercih:{tarifId:'krep',tur:0,meyveler:['cilek','muz','cilek'],
    porsiyon:{kizarma:'iyi',sunum:'acik',parcalar:[{meyve:'cilek',x:28,y:45},{meyve:'muz',x:69,y:42},{meyve:'cilek',x:50,y:69}]}}}},1);
  const krep=page.locator('.tepsi-yuva[data-parca=krep]'),arkadas=page.locator('.salon-arkadas');
  await expect(arkadas).toHaveAttribute('data-karakter','anne');
  const r=(await krep.locator('.lokma-tutamaci').boundingBox())!;
  const agiz=await arkadas.evaluate(el=>{const n=el as HTMLElement,b=n.querySelector('.restoran-oyuncu-bedeni')!.getBoundingClientRect();return{x:b.left+Number(n.dataset.agizX)*b.width,y:b.top+Number(n.dataset.agizY)*b.height};});
  await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
  await page.mouse.move(agiz.x,agiz.y,{steps:8});
  await expect(page.locator('.elle-tasinan svg.kr-catal-lokmasi')).toBeVisible();
  await page.mouse.up();await expect(page.locator('.restoran-lokma')).toHaveAttribute('data-alici','anne');
  await expect(krep).toHaveAttribute('data-lokma-adedi','1');
  await expect(page.locator('.restoran-lokma')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();await expect(krep.locator('[data-krep-dilimi]:not([hidden])')).toHaveCount(2);
});
test('Fesleğenli pizzadan beş ayrı yeşil dilim kalkar, yeniden giriş dilimleri geri getirmez',async({page})=>{
  await masa(page,'pesto-pizzasi',{pizza:{tarifId:'pizza',no:20,sosCesidi:'feslegen',kivam:'tam',puan:2,ust:[{cesit:'peynir',x:44,y:74}],fis:{malzemeler:['peynir','zeytin','domates'],sos:'feslegen'}}});
  const tabak=page.locator('.tepsi-yuva[data-parca=pizza]');
  const merkez=await tabak.boundingBox();
  if(!merkez)throw Error('Pizza tabağı görünmüyor');
  await page.mouse.move(merkez.x+merkez.width/2,merkez.y+merkez.height/2);
  await page.mouse.down();await page.mouse.move(12,12,{steps:5});
  await expect(page.locator('.elle-tasinan canvas[data-isirik=false]')).toBeVisible();
  expect(await tabak.locator('.pz-pizza').evaluate(el=>getComputedStyle(el).clipPath)).toContain('polygon');
  await page.mouse.up();
  expect(await tabak.locator('.pz-pizza').evaluate(el=>getComputedStyle(el).clipPath)).toBe('none');
  await expect(tabak).not.toHaveAttribute('data-lokma-adedi',/./);
  for(let i=1;i<=5;i++){
    await tabak.tap();
    if(i===1){
      const dilim=page.locator('canvas.restoran-pizza-dilim[data-isirik=false]');
      await expect(dilim).toBeAttached();
      expect(await dilim.evaluate(el=>{const c=el as HTMLCanvasElement,p=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
        let yesil=0;for(let j=0;j<p.length;j+=4)if(p[j+3]>240&&p[j+1]>p[j]*1.1&&p[j+1]>p[j+2]*1.4)yesil++;return yesil;})).toBeGreaterThan(250);
    }
    await expect(tabak).toHaveAttribute('data-lokma-adedi',String(i));
    await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
    if(i===2){await page.reload();await expect(tabak).toHaveAttribute('data-lokma-adedi','2');}
  }
  await expect(tabak.locator('.pz-pizza')).toBeHidden();
  await expect(tabak).toHaveAttribute('data-tukendi','true');
});
