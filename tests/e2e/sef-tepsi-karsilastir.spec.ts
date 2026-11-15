import {expect,test} from '@playwright/test';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

const hazirlik=(tarifId:string,sebzeler:string[])=>({
  tarifId,alinan:sebzeler,aktarilan:sebzeler,kesimler:Object.fromEntries(sebzeler.map(s=>[s,4])),
  eskiHazir:[],karistirma:3,servisEdildi:true,
});
const tabaklar=[
  {menu:'bahce-tabagi',id:'salata',istek:'Limon suyu', secim:'Yoğurt sosu',
    kayit:{tarifId:'salata',istenenSus:'limon',sus:{id:'yogurt',x:.4,y:.4},puan:2,salata:hazirlik('salata',['marul','salatalik','domates'])}},
  {menu:'corba-sofrasi',id:'corba',istek:'Pürüzsüz çorba',secim:'Havuç dilimi',
    kayit:{tarifId:'corba',istenenSus:'havuc',sus:{id:'havuc',x:.4,y:.4},puan:2,corba:{...hazirlik('corba',['domates','havuc','patates']),istenenKivam:'puruzsuz',ezilen:[]}}},
  {menu:'pizza-molasi',id:'pizza',istek:'Biber',secim:'Mantar',
    kayit:{tarifId:'pizza',no:1,ust:[{cesit:'mantar',x:43,y:48}],fis:{malzemeler:['peynir','biber'],haric:'mantar'},kivam:'tam'}},
  {menu:'pizza-molasi',id:'pizza',istek:'Mantar, 2 parça',secim:'Mantar, 1 parça',
    kayit:{tarifId:'pizza',no:16,ust:[{cesit:'mantar',x:43,y:48},{cesit:'biber',x:61,y:54}],fis:{malzemeler:['mantar','biber'],miktarlar:{mantar:2,biber:1}},kivam:'tam'}},
  {menu:'pizza-molasi',id:'pizza',istek:'Mor soğan',secim:'Kabak',
    kayit:{tarifId:'pizza',no:15,ust:[{cesit:'kabak',x:65,y:48},{cesit:'sogan',x:35,y:52}],fis:{malzemeler:['kabak','sogan'],yarilar:{sol:['kabak'],sag:['sogan']}},kivam:'tam'}},
  {menu:'fiyonk-tavuk',id:'makarna',istek:'Domates sosu',secim:'Fesleğen sosu',
    kayit:{tarifId:'makarna',resim:'makarna/altin-yesil-tabak',puan:2,istekPuani:1,pisirmePuani:3,makarna:{istenenSos:'kirmizi',sos:'yesil'}}},
  {menu:'corba-sofrasi',id:'mucver',istek:'Çıtır',secim:'Fazla kızarmış',
    kayit:{tarifId:'mucver',resim:'mucver/mucver',puan:1,istekPuani:3,pisirmePuani:1,tercih:{tarifId:'mucver',tur:1,garnitur:'dereotu',kizarma:2}}},
  {menu:'fiyonk-sis',id:'sis',istek:'Patlıcan',secim:'Kabak',
    kayit:{tarifId:'sis',resim:'sis/sis',puan:1,istekPuani:1,pisirmePuani:3,tercih:{tarifId:'sis',tur:2,lokmalar:['kabak','misir'],sos:'yogurt'}}},
  {menu:'kahvalti',id:'krep',istek:'Yaban mersini',secim:'Kivi',
    kayit:{tarifId:'krep',resim:'krep/krep',puan:2,istekPuani:2,pisirmePuani:3,tercih:{tarifId:'krep',tur:1,meyveler:['kivi','muz','muz']}}},
];
for(const ornek of tabaklar)test(ornek.id+' fişiyle gerçek tabak dar yatay ekranda karşılaştırılır — '+ornek.istek,async({page})=>{
  await page.setViewportSize({width:667,height:320});
  // Bir başka istasyon çizilirken geliştirme sunucusunun sıcak yenilemesi tadım penceresini kapatmasın.
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.goto('./sef/?test=1');
  await page.evaluate(o=>{
    const masa={tabaklar:{[o.id]:o.kayit},adim:{},sunuldu:true};
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{ekran:'masa',secili:o.menu,masalar:{[o.menu]:masa}}}));
  },ornek);
  await page.reload();
  await page.getByRole('button',{name:/siparişi ile tabağı karşılaştır/}).tap();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.tepsi-fis-ornek').getByRole('img',{name:ornek.istek,exact:true})).toBeVisible();
  await expect(dialog.locator('.tepsi-tabak-ornek').getByRole('img',{name:ornek.secim,exact:true})).toBeVisible();
  if(ornek.id==='pizza'){
    const ornekPizza=dialog.getByRole('img',{name:'Fişteki malzemelerle tam pişmiş pizza'});
    const hazirPizza=dialog.locator('.tepsi-tabak-ornek .pz-pizza');
    await expect(ornekPizza.locator('[data-parca]')).toHaveCount(ornek.istek.includes('2 parça')?3:6);
    await expect(hazirPizza.locator('[data-parca]')).toHaveCount(ornek.kayit.ust!.length);
    if(ornek.kayit.fis?.yarilar){
      const x=(el:HTMLElement)=>parseFloat(el.style.left);
      expect(await ornekPizza.locator('[data-cesit=kabak]').evaluateAll(els=>els.every(el=>parseFloat((el as HTMLElement).style.left)<50))).toBe(true);
      expect(await hazirPizza.locator('[data-cesit=kabak]').evaluate(x)).toBeGreaterThan(50);
    }
    expect(Math.abs((await ornekPizza.locator('.pz-pizza').boundingBox())!.height-(await hazirPizza.boundingBox())!.height)).toBeLessThan(2);
  }
  const tabak=dialog.locator('.tepsi-tabak-ornek .tepsi-tadim-tabak').locator(':scope > :first-child');
  await expect(tabak).toBeVisible();expect((await tabak.boundingBox())!.width).toBeGreaterThan(35);
  await dialog.getByRole('button',{name:'Müşterinin isteğini dinle'}).tap();
  await dialog.getByRole('button',{name:'Tabağın yorumunu dinle'}).tap();
  const boyut=await dialog.evaluate(d=>({kaydirma:d.scrollHeight,yukseklik:d.clientHeight}));
  await page.screenshot({path:join(tmpdir(),'minik-sef-tadim-'+ornek.id+'.png')});
  expect(boyut.kaydirma).toBeLessThanOrEqual(boyut.yukseklik+1);
  await dialog.getByRole('button',{name:'Tepsiye dön'}).tap();
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button',{name:/siparişi ile tabağı karşılaştır/}).tap();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.locator('[data-parca='+ornek.id+']').tap();
  await dialog.getByRole('button',{name:/tekrar pişir/}).tap();
  await expect(dialog).toHaveCount(0);
  const kayit=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(kayit.masalar[ornek.menu].sunuldu).toBe(false);
  expect(kayit.masalar[ornek.menu].tabaklar[ornek.id]).toBeTruthy();
  expect(kayit.oynanan).toBe(ornek.id);
  if(ornek.kayit.tercih){
    const etiket=ornek.id==='mucver'?'.mucver-oyunu':ornek.id==='sis'?'.sis-oyunu':'.krep-oyunu';
    await expect(page.locator(etiket)).toBeVisible();
    const a=await page.evaluate(({id,menu})=>localStorage.getItem('minkino-sef-'+id+'-v1-masa-'+menu),ornek);
    expect(a).toBeTruthy();
    const taslak=JSON.parse(a!);expect(taslak.siparis??taslak.istek??taslak.tur).toBe(ornek.kayit.tercih.tur);
  }
});
