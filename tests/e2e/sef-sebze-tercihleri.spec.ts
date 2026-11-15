import {test,expect,type Page} from '@playwright/test';
import {siparisBaslat,tabakTadimi,type MalzemeId} from '../../sef/src/tarif';

test.setTimeout(100_000);

test('Çorba ve salata müşterileri seçilen sebzenin gerçek dokusunu puanlar',()=>{
  const corba={...siparisBaslat('corba','patates'),aktarilan:['havuc','patates','domates'] as MalzemeId[]};
  expect(tabakTadimi({...corba,ezilen:['patates']},true)).toBe(3);
  for(const ezilen of [[],['havuc'],['patates','domates']] as MalzemeId[][])expect(tabakTadimi({...corba,ezilen},true)).toBe(2);
  const salata={...siparisBaslat('salata'),aktarilan:['salatalik','domates','marul'] as MalzemeId[],salatalikBoyu:6 as const};
  expect(tabakTadimi({...salata,kesimBoylari:{salatalik:6}},true)).toBe(3);
  expect(tabakTadimi({...salata,kesimBoylari:{salatalik:2}},true)).toBe(2);
  expect(tabakTadimi({...salata,aktarilan:['domates','marul']},true)).toBe(2);
  expect(tabakTadimi({...salata,salatalikBoyu:undefined},true)).toBe(3);
});

async function tezgah(page:Page,id:'salata'|'corba'){
  await page.routeWebSocket(url=>url.hostname==='localhost',s=>s.connectToServer().onMessage(m=>{if(typeof m!=='string'||!m.includes('full-reload'))s.send(m);}));
  await page.setViewportSize({width:568,height:320});
  await page.addInitScript(id=>{
    if(localStorage.getItem('minkino-sef-v1'))return;
    const corba=id==='corba', malzemeler=corba?['domates','havuc','patates']:['marul','salatalik','domates'];
    const siparis={tarifId:id,alinan:malzemeler,aktarilan:malzemeler,eskiHazir:[],kesimler:Object.fromEntries(malzemeler.map(m=>[m,m==='salatalik'?2:4])),
      ...(corba?{istenenKivam:'patates'}:{salatalikBoyu:6,kesimBoylari:{salatalik:2}}),karistirma:3,servisEdildi:false};
    const masa=corba?'corba-sofrasi':'bahce-tabagi';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({secili:id,ekran:corba?'ocak':'servis',sessiz:false,siparisler:{[id]:siparis},
      porsiyonlar:{[id]:{adet:corba?0:2}},ozelIstekler:{[id]:corba?'domates':'feslegen'},tepsiler:{secili:masa,oynanan:id,ekran:'kapali',masalar:{[masa]:{tabaklar:{},adim:{}}}}}));
  },id);
  await page.goto(id==='salata'?'./sef/':'./sef/?test=1',{waitUntil:'domcontentloaded'});
  await page.locator('.fis').waitFor({timeout:45_000});
}
test('Lokum için yalnızca patatesi ez, iki kepçeyi kâseye koy ve gerçek parçaları servis et',async({page})=>{
  await tezgah(page,'corba');
  await expect(page.locator('.fis [data-istenen-kivam=patates]')).toBeVisible();
  await page.getByRole('button',{name:'El blenderi'}).tap();
  await page.getByRole('button',{name:'Patatesi ez'}).tap();
  await expect(page.locator('[data-ez=patates]')).toHaveCount(0);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.fis').waitFor({timeout:45_000});
  for(let i=0;i<2;i++){await page.locator('[data-porsiyon-al]').tap();await page.locator('[data-porsiyon-birak]').tap();}
  await page.locator('[data-git=servis]').tap();
  await expect(page.locator('.sunum .corba-lokmasi')).toHaveCount(2);
  for(const id of ['domates','havuc'])await expect(page.locator('.sunum .corba-lokmasi[data-malzeme='+id+']')).toBeVisible();
  await page.locator('[data-sus=domates]').tap();await page.locator('.sunum').tap();await page.locator('[data-zil]').tap();
  await expect(page.locator('.servis-misafiri [data-puan="3"]')).toBeVisible();
});
test('Dede küçük lokma isterken iri kesilen salata iki puan alır ve çizimler karşılaştırılabilir',async({page})=>{
  await tezgah(page,'salata');
  await expect(page.locator('.fis [data-boy="6"]')).toBeVisible();
  const istek=await page.locator('[data-istek]').getAttribute('data-istek');expect(istek).toBeTruthy();
  await page.locator('[data-sus='+istek+']').tap();await page.locator('.sunum').tap();
  const ses=page.waitForResponse(r=>r.url().includes('/dede-salata-kucuk-tadim.mp3')&&!r.url().includes('?import')&&r.ok());
  await page.locator('[data-zil]').tap();await ses;
  await expect(page.locator('.servis-misafiri [data-puan="2"]')).toBeVisible();
  await expect(page.locator('.sebze-tadim [data-boy="6"]')).toBeVisible();
  await expect(page.locator('.sebze-tadim [data-boy="2"]')).toBeVisible();
  await page.screenshot({path:'output/sef/dede-salata-dilimleri.png'});
  await page.locator('[data-git=siparis]').tap();
  await expect(page.locator('.tepsi-yuva .salata-kucuk-ic')).toBeVisible();
});

test('İlk restoran ziyaretinde çorbaya ara ver, limon suyunu önce bitir, aynı sepete dön',async({page})=>{
  test.setTimeout(150_000);
  await page.setViewportSize({width:568,height:320});
  await page.routeWebSocket(url=>url.searchParams.has('token'),()=>{});
  await page.goto('./sef/?test=1',{waitUntil:'domcontentloaded'});
  const tus=(name:string)=>page.getByRole('button',{name,exact:true});
  await tus('Restoranı aç').tap();
  await tus('Siparişi al ve mutfağa geç').tap();
  await page.locator('.tepsi-yuva[data-parca=corba]').tap();
  await page.locator('[data-istasyon=dolap]').tap();
  await page.locator('[data-sebze=patates]').tap();
  const don=tus('Hazırlığı sakla ve tepsiye dön'), fis=page.locator('.fis');
  const a=(await don.boundingBox())!,b=(await fis.boundingBox())!;
  expect(a.x+a.width).toBeLessThan(b.x);
  await don.tap();
  await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  await page.locator('.ps-meyve-sec[data-meyve=limon]').tap();
  await page.locator('.ps-ham').tap();await page.locator('.ps-dene').tap();
  for(let i=0;i<3;i++)await page.locator('.ps-cevir').tap();
  for(let i=0;i<2;i++){await page.locator('.ps-surahi').tap();await page.locator('.ps-bardak').tap();}
  await expect(page.locator('.tepsi-yuva[data-parca=icecek]')).toHaveAttribute('data-hazir','true');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.tepsi-yuva[data-parca=corba]').tap();
  await expect(tus('Patates rafa geri koy')).toBeVisible();
  await expect(page.locator('.sepette-sebze')).toHaveCount(1);
  await page.locator('[data-sebze=havuc]').tap();
  await don.tap();
  await expect(page.locator('.tepsi-yuva[data-parca=icecek]')).toHaveAttribute('data-hazir','true');
  await page.locator('.tepsi-yuva[data-parca=corba]').tap();
  await expect(page.locator('.sepette-sebze')).toHaveCount(2);
});
