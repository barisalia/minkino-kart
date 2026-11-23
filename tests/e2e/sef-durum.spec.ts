import {expect,test,type Locator,type Page} from '@playwright/test';
import {durumOku,durumPuani,dilimIcleri,durumYorumu} from '../../sef/src/durum-tarifi';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('Dürüm diliminin içi iki gerçek kesim noktasını ve enine yerleşimi korur',()=>{
 const t=durumOku({evre:'sun',sarma:1,kesimler:[28,71],katlar:[{tur:'domates',x:26,y:50},{tur:'peynir',x:30,y:52},{tur:'marul',x:77,y:50}]})!;
 expect([0,1,2].map(i=>dilimIcleri(t,i).map(k=>k.tur))).toEqual([['domates'],['peynir'],['marul']]);
 expect(durumPuani(t,'bahce-durumu')).toBe(3);expect(durumYorumu({...t,kesimler:[36,71]},'bahce-durumu')).toBe('dagilim');
 expect(durumYorumu(t,'zeytinli-durum')).toBe('fazla');
 expect(durumOku({...t,kesimler:[18,69]})?.evre).toBe('kes');
});

async function dokun(page:Page,el:Locator,x:number,y:number){
 const r=(await el.boundingBox())!;await page.touchscreen.tap(r.x+r.width*x,r.y+r.height*y);
}
async function kaydir(page:Page,el:Locator,x:number,by:number,sy:number){
 const r=(await el.boundingBox())!;const c=await page.context().newCDPSession(page);
 const n=(y:number)=>({x:r.x+r.width*x,y:r.y+r.height*y});
 try{await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[n(by)]});
 for(let i=1;i<8;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[n(by+(sy-by)*i/7)]});
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}finally{await c.detach();}
}
test('Çocuk dürümünü serer, sarar, iki kez keser; dilimlerin içi masaya teslimde korunur',async({page},info)=>{
 await page.setViewportSize(info.project.name==='ipad'?{width:1024,height:768}:{width:667,height:375});
 await page.routeWebSocket(url=>url.port==='5173',()=>{});
 await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).tap();
 await page.getByRole('button',{name:'Sonraki tarif rafı'}).tap();
 await page.getByRole('button',{name:'Rulo Dürüm tezgâhını aç'}).tap();
 const alan=page.locator('.dr-tezgah'),lavas=alan.locator('.dr-lavas');
 await expect(alan).toBeVisible();
 await expect(alan.locator('img')).not.toHaveCount(0);
 for(const [tur,x,y] of [['Marul',.28,.48],['Domates',.50,.38],['Kaşar',.72,.55]] as const){
   await page.getByRole('button',{name:tur+' seç',exact:true}).tap();await dokun(page,lavas,x,y);
 }
 if(process.env.SEF_DURUM_KARE)await page.screenshot({path:process.env.SEF_DURUM_KARE+'-'+info.project.name+'-diz.png'});
 await page.getByRole('button',{name:'Dürümü sarmaya geç'}).tap();
 await kaydir(page,alan.locator('.dr-sarma'),.50,.91,.12);
 await expect(alan).toHaveAttribute('data-evre','kes');
 const kes=alan.locator('.dr-kes');
 await kaydir(page,kes,.74,.16,.84);await expect(alan.getByLabel('1. kesikten bıçağı aşağı sür')).toBeVisible();
 await kaydir(page,kes,.36,.17,.85);await page.reload();
 await expect(alan.getByLabel('2. kesikten bıçağı aşağı sür')).toBeVisible();
 await kaydir(page,kes,.68,.17,.85);
 const sun=page.getByRole('button',{name:'Üç dürüm dilimini tepsiye koy'});
 await expect(sun).toBeVisible();
 for(const [i,tur] of ['marul','domates','peynir'].entries())await expect(sun.locator('[data-dilim="'+i+'"] .dr-kesit-kati[data-tur="'+tur+'"]')).toBeVisible();
 if(process.env.SEF_DURUM_KARE)await page.screenshot({path:process.env.SEF_DURUM_KARE+'-'+info.project.name+'-sun.png'});
 await sun.tap();
 // Tepsi tamamlanınca masa sahnesi açılır: üç dilim müşteriye sunulacak tepside, içleriyle.
 await expect(page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).locator('.dr-kesit')).toHaveCount(3);
 await expect(page.locator('.tepsi-servis')).toHaveCount(0);
 await page.getByRole('button',{name:'Mino masasına götür'}).tap();
 await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(/3 jeton/);
 await page.reload();
 await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(/3 jeton/);
 const m=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar['bahce-durumu']);
 expect(m.durumPuan).toBe(3);
});

test('Dede zeytinli dürümü ister; yanlış içleri tadar, fikrini kendi sesiyle anlatır',async({page})=>{
 await page.setViewportSize({width:844,height:390});await page.routeWebSocket(u=>u.port==='5173',()=>{});
 await page.goto('./sef/');await page.getByRole('button',{name:'Sesi kapat'}).tap();
 await page.evaluate(()=>{
  const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);k.sessiz=false;
  const yemek={evre:'sun',sarma:1,kesimler:[30,70],katlar:[{tur:'marul',x:25,y:45},{tur:'domates',x:50,y:50},{tur:'peynir',x:75,y:45}]};
  Object.assign(k.tepsiler,{restoranda:true,ekran:'masa',secili:'zeytinli-durum',restoran:{sira:9,menuId:'zeytinli-durum',evre:'siparis'},masalar:{'zeytinli-durum':{tabaklar:{durum:true},durumServisi:yemek,sunuldu:false}}});localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
 });
 const sesler:string[]=[];page.on('request',r=>sesler.push(r.url()));await page.reload();
 await page.getByRole('button',{name:'Siparişi tekrar dinle'}).tap();await expect.poll(()=>sesler.some(u=>u.endsWith('dede-restoran-zeytinli-durum.mp3'))).toBe(true);
 await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).tap();
 await page.getByRole('button',{name:'Dede Hasan masasına götür'}).tap();
 const tabak=page.getByRole('button',{name:'Rulo Dürüm tattır'});await expect(tabak).toBeVisible();
 await page.getByRole('button',{name:'Müşteriyi dinle'}).tap();await expect.poll(()=>sesler.some(u=>u.endsWith('dede-durum-fazla.mp3'))).toBe(true);
 await expect(tabak.locator('.dr-kesit[hidden]')).toHaveCount(1);
 // İlk lokma kendiliğinden yenir; lokma sürerken gelen dokunuş bilerek yok sayılır, bitmesini bekle.
 await expect(page.locator('.restoran-lokma')).toHaveCount(0,{timeout:11000});
 await tabak.tap();
 await expect(tabak.locator('.dr-kesit[hidden]')).toHaveCount(2);
});
