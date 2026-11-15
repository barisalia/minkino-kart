import {test,expect,type Page} from '@playwright/test';
import {tostKalitesi,tostFisleri,tostPisme,yeniTost,type TostFisi} from '../../sef/src/tost-tarifi';

async function rezervasyon(page:Page,fis:TostFisi){
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(id=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{
      secili:id,restoranda:true,ekran:'masa',
      restoran:{sira:4,menuId:id,sonYemek:id,evre:'siparis'},
      masalar:{[id]:{tabaklar:{},sunuldu:false}},
    });
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  },fis);
  await page.reload();
  await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).click();
  await page.getByRole('button',{name:'Sıcak Tost hazırla',exact:true}).click();
  await page.getByRole('button',{name:'Tost ekmeğini aç'}).click();
}
const durum=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
async function tezgahResmi(page:Page,ad:string){
  if(process.env.TOST_ONIZLEME)await page.screenshot({path:process.env.TOST_ONIZLEME+'/'+ad+'.png',animations:'allow'});
}
test.beforeEach(async({page})=>{
  await page.setViewportSize({width:780,height:390});
  await page.routeWebSocket(url=>url.hostname==='localhost',socket=>socket.connectToServer().onMessage(m=>{
    if(typeof m==='string'&&m.includes('full-reload'))return;
    socket.send(m);
  }));
});
test('Mino seçilen yerdeki katları yer, doğru kızarmış tostu bir kez öder',async({page})=>{
  await rezervasyon(page,'peynirli-tost');
  const ekmek=page.locator('.tost-acik-ekmek');
  const tahta=(await ekmek.boundingBox())!;
  const kasar=(await page.getByRole('button',{name:'Kaşar peyniri',exact:true}).boundingBox())!;
  await page.mouse.move(kasar.x+kasar.width/2,kasar.y+kasar.height/2);await page.mouse.down();
  await page.mouse.move(tahta.x+tahta.width*.43,tahta.y+tahta.height*.52,{steps:12});await page.mouse.up();
  await page.getByRole('button',{name:'Domates',exact:true}).click();
  await ekmek.click({position:{x:tahta.width*.69,y:tahta.height*.59}});
  await page.getByRole('button',{name:'Zeytin',exact:true}).click();await ekmek.click();
  await page.getByRole('button',{name:'Son malzemeyi kaldır'}).click();
  await expect(ekmek.locator('.tost-kat')).toHaveCount(2);
  const domates=(await ekmek.locator('.tost-kat[data-tur="domates"]').boundingBox())!;
  await page.mouse.move(domates.x+domates.width*.5,domates.y+domates.height*.5);await page.mouse.down();
  await page.mouse.move(tahta.x+tahta.width*.73,tahta.y+tahta.height*.67,{steps:14});await page.mouse.up();
  await page.reload();
  await expect(ekmek.locator('.tost-kat')).toHaveCount(2);
  const taslak=(await durum(page)).masalar['peynirli-tost'].tostTaslagi;
  expect(taslak.katlar.map((x:{tur:string})=>x.tur)).toEqual(['kasar','domates']);
  expect(taslak.katlar[1].x-taslak.katlar[0].x).toBeGreaterThan(16);
  await tezgahResmi(page,'tost-dizme');
  await page.getByRole('button',{name:'Üst ekmeği kapat'}).click();
  await page.getByRole('button',{name:'Ekmeği yeniden aç'}).click();
  await page.getByRole('button',{name:'Üst ekmeği kapat'}).click();
  await page.getByRole('button',{name:'Tost presine götür'}).click();
  await tezgahResmi(page,'tost-pres');
  await page.getByRole('button',{name:'Tost presini kapat'}).click();
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuetext','Altın renginde');
  await page.getByRole('button',{name:'Tost presini aç'}).click();
  await page.getByRole('button',{name:'Tostu tepsiye koy'}).click();
  await expect(page.locator('.tepsi-yuva .tost-kat')).toHaveCount(2);
  await page.locator('.tepsi-yuva').evaluate(async e=>{await Promise.all(e.getAnimations({subtree:true}).filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});
  await tezgahResmi(page,'tost-servis');
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await expect(page.locator('.restoran-tost-lokmasi .tost-kat')).toHaveCount(2);
  const tepsi=page.locator('.tepsi-yuva[data-parca=tost]');
  const elde=page.locator('.restoran-tost-lokmasi');
  await expect(tepsi).toHaveAttribute('data-lokma-adedi','1');
  await expect(elde).toHaveCount(0);
  await expect(tepsi.locator('.tost-isirildi')).toBeVisible();
  await tepsi.tap();
  await expect(elde).toHaveAttribute('data-lokma-adedi','1');
  await expect(tepsi.locator('.tost-yigin')).toBeHidden();
  await expect(tepsi).toHaveAttribute('data-lokma-adedi','2');
  await expect(elde).toHaveCount(0);
  await page.getByRole('dialog').getByRole('button',{name:'Tepsiye dön'}).tap();
  await tepsi.tap();
  await expect(elde).toHaveAttribute('data-lokma-adedi','2');
  await expect(tepsi).toHaveAttribute('data-tukendi','true');
  await expect(elde.locator('.tost-yigin')).toBeHidden();
  await page.reload();
  await expect(tepsi.locator('.tost-yigin')).toBeHidden();
  const t=await durum(page);expect(t.masalar['peynirli-tost'].tostServisi.katlar).toEqual(taslak.katlar);
  expect(t.jeton).toBe(3);expect(t.gun.kazanc).toBe(3);expect(t.gun.ziyaret).toBe(1);
});
test('Üç müşterinin malzeme ve kızarma tercihleri gerçekte puanı değiştirir',()=>{
  for(const [fis,istek] of Object.entries(tostFisleri)){
    const t=yeniTost();t.katlar=istek.icindekiler.map(tur=>({tur,x:50,y:50}));t.kizartma=istek.kizartma;
    expect(tostKalitesi(t,fis as TostFisi)).toBe(3);
    t.katlar.pop();expect(tostKalitesi(t,fis as TostFisi)).toBe(2);
    t.kizartma=tostPisme(8600);expect(tostKalitesi(t,fis as TostFisi)).toBe(1);
  }
});
