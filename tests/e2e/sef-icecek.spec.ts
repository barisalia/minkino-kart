import {expect,test,type Page,type Locator} from '@playwright/test';
const durum=(p:Page,id:string)=>p.evaluate(k=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar[k],id);
async function merkez(el:Locator){
  const r=await el.boundingBox();if(!r)throw Error('Dokunulacak araç görünmüyor.');
  return {x:r.x+r.width/2,y:r.y+r.height/2};
}
async function kaydir(p:Page,kaynak:Locator,hedef:Locator){
  if(p.context().browser()?.browserType().name()!=='chromium'){
    await kaynak.dragTo(hedef);
    return;
  }
  const a=await merkez(kaynak),b=await merkez(hedef);
  const c=await p.context().newCDPSession(p);
  try{
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
    for(const t of [.25,.5,.75,1])await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}]});
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await c.detach();}
}
for(const senaryo of [
  {menu:'corba-sofrasi',istenen:'limon',secilen:'limon',miktar:3,puan:3},
  {menu:'kahvalti',istenen:'kan-portakali',secilen:'limon',miktar:2,puan:1},
  {menu:'pizza-molasi',istenen:'portakal',secilen:'kan-portakali',miktar:3,puan:2},
]){
  test('İçecek fişi, gerçek bardak ve kayıt '+senaryo.menu,async({page})=>{
    await page.setViewportSize({width:844,height:390});
    await page.goto('./sef/?test=1');
    await page.getByRole('button',{name:'Müşteri masası',exact:true}).tap();
    await page.locator('[data-menu="'+senaryo.menu+'"]').tap();
    await page.locator('[data-parca="icecek"]').tap();
    const sahne=page.locator('.ps-sahnesi');
    await expect(sahne.locator('.ps-istek-fisi')).toHaveAttribute('data-istenen',senaryo.istenen);
    await page.locator('.ps-meyve-sec[data-meyve="'+senaryo.secilen+'"]').tap();
    await kaydir(page,page.locator('.ps-ham'),page.locator('.ps-dene'));
    await expect(sahne).toHaveAttribute('data-icecek','1');
    await page.reload();
    await expect(sahne).toHaveAttribute('data-meyve',senaryo.secilen);
    for(let i=2;i<=4;i++){
      await page.locator('.ps-cevir').tap();
      await expect(sahne).toHaveAttribute('data-icecek',String(i));
    }
    await expect(page.locator('.ps-surahi img')).toHaveAttribute('src',new RegExp(senaryo.secilen+'-surahi'));
    await kaydir(page,page.locator('.ps-surahi'),page.locator('.ps-bardak'));
    await expect(sahne).toHaveAttribute('data-icecek','6');
    await expect(page.locator('.ps-bardak img')).toHaveAttribute('src',new RegExp(senaryo.secilen+'-yarim-bardak'));
    if(senaryo.miktar===3)await kaydir(page,page.locator('.ps-surahi'),page.locator('.ps-bardak'));
    else await page.locator('.ps-yarim-sun').tap();
    const bardak=page.locator('[data-parca="icecek"] img');
    await expect(bardak).toHaveAttribute('src',new RegExp(senaryo.secilen+'-'+(senaryo.miktar===3?'dolu':'yarim-bardak')));
    await page.reload();
    expect(await durum(page,senaryo.menu)).toMatchObject({icecekMeyvesi:senaryo.secilen,icecekMiktari:senaryo.miktar,icecekPuani:senaryo.puan});
    await expect(bardak).toBeVisible();
  });
}
